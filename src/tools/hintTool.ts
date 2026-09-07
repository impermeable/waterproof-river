import { CancellationToken, LanguageModelTextPart, LanguageModelTool, LanguageModelToolInvocationOptions, LanguageModelToolInvocationPrepareOptions, LanguageModelToolResult, MarkdownString } from "vscode";
import { WaterproofAPI } from "../api";
import { handleHelp } from "../handlers/hint";

export class HintTool implements LanguageModelTool<null> {
    constructor (private api: WaterproofAPI) {}
    async invoke(options: LanguageModelToolInvocationOptions<null>, token: CancellationToken) {
        const output = await handleHelp(this.api, null, null, null, token);
        if (output === undefined) {
            return new LanguageModelToolResult([new LanguageModelTextPart("Could not get a verified hint output.")]);
        }
        const prefix = "Generated the following hint for the student:\n<student-facing-hint>\n";
        const suffix = "\n</student-facing-hint>\n";
        return new LanguageModelToolResult([new LanguageModelTextPart(prefix + output + suffix)]);
    }
    async prepareInvocation(
        options: LanguageModelToolInvocationPrepareOptions<null>,
        _token: CancellationToken
    ) {
        const confirmationMessages = {
            title: 'Allow River to generate a hint?',
            message: new MarkdownString("Allow River to generate a hint for the current proof? (This may take a few attempts)"),
        };

        return {
            invocationMessage: 'Result of verified hint generation',
            confirmationMessages,
        };
    }
}
