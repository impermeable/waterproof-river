import { renderPrompt } from "@vscode/prompt-tsx";
import { ChatRequest, ChatContext, ChatResponseStream, CancellationToken, languages, DiagnosticSeverity, Diagnostic, Range, Position, LanguageModelChat, lm, DiagnosticCollection } from "vscode";
import { WaterproofSyntaxHelpPrompt } from "../prompts/syntaxHelp";
import { WaterproofAPI } from "../api";


export async function handleSyntaxHelp(api: WaterproofAPI, collection: DiagnosticCollection, request: ChatRequest | null, context: ChatContext | null, _stream: ChatResponseStream | null, token: CancellationToken) {
    let message = "";    
    const stream = {
        progress: (msg: string) => {
            if (_stream) { _stream.progress(msg); }
            else { message += `<progress>${msg}</progress>\n`; }
        },
        markdown: (msg: string) => {
            if (_stream) { _stream.markdown(msg); }
            else { message += msg + "\n"; }
        },
        button: (options: { command: string; title: string; tooltip: string }) => {
            if (_stream) { _stream.button(options); }
            else { message += `[${options.title}](command:${options.command} "${options.tooltip}")\n`; }
        }
    };

    // TODO: Hardcoded model
    const model: LanguageModelChat = (request?.model !== undefined) ? request.model : (await lm.selectChatModels({id: "gpt-4.1"}))[0];
    
    // Determine if we were called via command (stream) or via toolcall (no stream)
    const usedViaCommand = _stream !== undefined;

    stream.progress("Getting errors from the current document...");
    const doc = api.currentDocument();
    if (doc === undefined) {
        stream.markdown("Could not get the current document from Waterproof. Please make sure you have a Waterproof document open and try again.");
        return;
    }
    const diagnostics = languages.getDiagnostics(doc.uri);
    const errors = diagnostics.filter(d => d.severity === DiagnosticSeverity.Error && !d.message.includes("Attempt to save"));
    if (errors.length === 0) {
        stream.markdown("No syntax errors found in the current document.");
        return;
    }

    const errorMessages = errors.map(e => {
        const line = doc.lineAt(e.range.end.line);
        return {
            "errorRange": e.range,
            "lineRange": line.range,
            "message": e.message,
            "line": line.text
        };
    });

    const { messages } = await renderPrompt(
        WaterproofSyntaxHelpPrompt,
        {
            syntaxErrors: JSON.stringify(errorMessages)
        },
        { modelMaxPromptTokens: 4000 },
        model
    );

    stream.progress("Asking River to analyze the syntax errors...");
    const resp = await model.sendRequest(messages, {}, token);

    let result: string = "";

    for await (const fragment of resp.text) {
        // stream.markdown(fragment);
        result += fragment;
    }

    const split = result.split("------");
    if (split.length < 2) {
        stream.markdown("River did not return a valid response. Please try again.");
        return;
    }
    const summary = split[0].trim();
    stream.markdown(summary);
    
    let json: Array<{ to: { char: number, line: number }, from: { char: number, line: number }, message: string, fixed: string }> = [];
    try {
        json = JSON.parse(split[1].trim()) as Array<{ to: { char: number, line: number }, from: { char: number, line: number }, message: string, fixed: string }>;
    } catch (e) {
        stream.markdown("River did not return a valid JSON response. Please try again.");
    }

    const diags: Diagnostic[] = [];

    for (const msg of json) {
        const range = new Range(
            new Position(msg.from.line, msg.from.char),
            new Position(msg.to.line, msg.to.char));

        diags.push({
            range,
            message: `River: "${msg.message}"`,
            severity: DiagnosticSeverity.Information,
            source: "River AI Assistant"
        });
        diags.push({
            range,
            message: "Hint, replace with: " + msg.fixed,
            severity: DiagnosticSeverity.Hint,
            source: "River AI Assistant",
        });
    }

    collection.set(doc.uri, diags);
    stream.markdown("\n---\n");
    stream.markdown("Suggestions have been added. Click the button below to clear them.");
    stream.button({ command: "river.clearDiagnostics", title: "Clear Suggestions", tooltip: "Clear the suggestions added by River" });

    return message;
}