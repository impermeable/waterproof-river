import { renderPrompt } from "@vscode/prompt-tsx";
import { ChatRequest, ChatContext, ChatResponseStream, CancellationToken, LanguageModelChat, lm, workspace } from "vscode";
import { WaterproofAPI } from "../api";
import { HintPromptRewordForChat, WaterproofHintPrompt } from "../prompts/hint";
import { goalsOrError, helpOrError, proofContextOrError } from "../apiUtils";

// Get the max attempts from the vscode setting, if (for some reason) no such setting exists, then use 3 as a default.
const maxAttempts = workspace.getConfiguration("waterproof").get<number>("maxGenerationAttempts") ?? 3;

export async function handleHelp(api: WaterproofAPI, request: ChatRequest | null, context: ChatContext | null, _stream: ChatResponseStream | null, token: CancellationToken) {
    const stream = {
        progress: (message: string) => {
            if (_stream) { _stream.progress(message); }
        },
        markdown: (message: string) => {
            if (_stream) { _stream.markdown(message); }
        }
    };

    // TODO: Hardcoded model
    const model: LanguageModelChat = (request !== null && request.model !== undefined) ? request.model : (await lm.selectChatModels({id: "gpt-4.1"}))[0];

    // Determine if we were called via command (stream) or via toolcall (no stream)
    const usedViaCommand = _stream !== undefined;


    let attemptCounter = 0;

    stream.progress("Asking Waterproof what needs to be shown...");
    const goals = await goalsOrError(api);

    stream.progress("Querying output of Waterproof 'Help.' command...");
    const help = await helpOrError(api);
    const proofContext = await proofContextOrError(api, "<context>THE USER CURSOR IS PLACED HERE</context>");

    const input = { ...goals, ...proofContext, helpOutput: help };

    const previousSuggestions: Array<{suggestion: string, error: string}> = [];

    let rObj: { hint: string, step: string, tutorial: string } | null = null;
    let strategy: string = "null";

    while (attemptCounter < maxAttempts) {
        const { messages } = await renderPrompt(
            WaterproofHintPrompt,
            {
                information: JSON.stringify(input),
                previousSuggestions
            },
            { modelMaxPromptTokens: model.maxInputTokens },
            model
        );
        stream.progress(`Asking River to generate a verified hint... (attempt ${attemptCounter + 1} of ${maxAttempts})`);
        
        
        const resp = await model.sendRequest(messages, {}, token);
        let result: string[] = [];

        for await (const fragment of resp.text) {
            result.push(fragment);
        }
        
        const rStrings = result.join("").split("-----");
        if (rStrings.length < 2) {
            attemptCounter++;
            previousSuggestions.push({suggestion: result.join(""), error: "Could not find separator ----- in response"});
            continue;
        }

        strategy = rStrings[0].trim();
        
        try {
            rObj = JSON.parse(rStrings[1].trim()) as { hint: string, step: string, tutorial: string };
        } catch {
            rObj = null;
        }

        stream.progress(`Asking Waterproof to verify correctness of the hint... (attempt ${attemptCounter + 1} of ${maxAttempts})`);

        if (rObj === null) {
            attemptCounter++;
            previousSuggestions.push({suggestion: rStrings.join("-----"), error: "Could not parse JSON response"});
            continue;
        }
    
        if (rObj.hint === undefined || rObj.step === undefined) {
            attemptCounter++;
            previousSuggestions.push({suggestion: rObj.step, error: "Missing one of the required fields (hint or step) in the JSON response"});
            continue;
        }

        // If we reach here, we have a valid suggestion
        // We now verify it by trying to execute it in Waterproof
    
        let verification;
        let verificationFailed = false;
        let error = "";
        try {
            verification = await api.tryProof(rObj.step);
        } catch(error_) {
            verificationFailed = true;
            error = `${error_}`;
        }

        if (verificationFailed) {
            attemptCounter++;
            previousSuggestions.push({suggestion: rObj.step, error});
            continue;
        }

        if (!verificationFailed) {
            break;
        }

    }

    let text = "";
    
    // If we reach here, the step was successfully executed or we ran out of attempts
    if (rObj === null || strategy === null || attemptCounter >= maxAttempts) {
        text = "No valid hint could be found that Waterproof would accept.";
    } else {
        text = "A valid hint was found that Waterproof accepted. Here are the details in form of a JSON expression:\n\n";
        text += JSON.stringify(rObj);
    }

    if (usedViaCommand && request !== null && context !== null && _stream !== null) {
        const m = await renderPrompt(
            HintPromptRewordForChat,
            {
                strategy,
                text,
                userInput: request.prompt,
            },
            { modelMaxPromptTokens: model.maxInputTokens },
            request.model
        );
    
        const r = await request.model.sendRequest(m.messages, {}, token);
        for await (const f of r.text) {
            stream.markdown(f);
        }
    } else {
        return text;
    }
}