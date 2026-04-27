import { CancellationToken, LanguageModelTextPart, LanguageModelTool, LanguageModelToolInvocationOptions, LanguageModelToolInvocationPrepareOptions, LanguageModelToolResult, MarkdownString } from "vscode";
import { WaterproofAPI } from "../api";
import { handleHelp } from "../handlers/hint";
import { execOrError } from "../apiUtils";

export type TryStepParams = { step: string }; 

export class TryStepTool implements LanguageModelTool<TryStepParams> {
    // Upon creation save the WaterproofAPI into the api object of this class
    constructor (private api: WaterproofAPI) {}
    
    async invoke(options: LanguageModelToolInvocationOptions<TryStepParams>, token: CancellationToken) {
        const {step} = options.input;
        const res = await execOrError(this.api, step);
        
        return new LanguageModelToolResult([new LanguageModelTextPart(JSON.stringify(res))]);
    }

    async prepareInvocation(
        options: LanguageModelToolInvocationPrepareOptions<TryStepParams>,
        _token: CancellationToken
    ) {
        const confirmationMessages = {
            title: 'Allow River to try a proof step?',
            message: new MarkdownString("Allow River to try a step in the proof."),
        };

        return {
            invocationMessage: 'Tried a proof step',
            confirmationMessages,
        };
    }
}
