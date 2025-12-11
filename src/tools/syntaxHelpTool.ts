import { CancellationToken, DiagnosticCollection, LanguageModelTextPart, LanguageModelTool, LanguageModelToolInvocationOptions, LanguageModelToolInvocationPrepareOptions, LanguageModelToolResult, MarkdownString } from "vscode";
import { WaterproofAPI } from "../api";
import { handleSyntaxHelp } from "../handlers/syntaxHelp";

export class SyntaxHelpTool implements LanguageModelTool<null> {
    constructor (private readonly api: WaterproofAPI, private readonly collection: DiagnosticCollection) {}
    async invoke(options: LanguageModelToolInvocationOptions<null>, token: CancellationToken) {
        const output = await handleSyntaxHelp(this.api, this.collection, null, null, null, token);
        if (output === undefined) {
            return new LanguageModelToolResult([new LanguageModelTextPart("Could not get syntax help output.")]);
        }
        return new LanguageModelToolResult([new LanguageModelTextPart(output)]);
    }
    async prepareInvocation(
        options: LanguageModelToolInvocationPrepareOptions<null>,
        _token: CancellationToken
    ) {
        const confirmationMessages = {
            title: 'Allow River to analyze errors?',
            message: new MarkdownString("Allow River to analyze the error(s) on the current line?"),
        };

        return {
            invocationMessage: 'Result of error analysis',
            confirmationMessages,
        };
    }
}
