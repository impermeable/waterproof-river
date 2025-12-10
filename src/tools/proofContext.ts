import { CancellationToken, LanguageModelTextPart, LanguageModelTool, LanguageModelToolInvocationOptions, LanguageModelToolInvocationPrepareOptions, LanguageModelToolResult, MarkdownString } from "vscode";
import { WaterproofAPI } from "../api";

export class ProofContextTool implements LanguageModelTool<null> {
    constructor (private api: WaterproofAPI) {}
    async invoke(options: LanguageModelToolInvocationOptions<null>, token: CancellationToken) {
        
        try {
            const context = await this.api.proofContext("<context-cursor>USER CURSOR IS HERE</context-cursor>");
            const goals = await this.api.goals();

            const hypString = goals.hypotheses.map(v => `- ${v.name}: ${v.content}`).join("\n");
            
            return new LanguageModelToolResult([
                new LanguageModelTextPart(`The student is currently working on '${context.name}'.`),
                new LanguageModelTextPart(`So far the statement and proof looks as follows:<context-student-proof>\n${context.withCursorMarker}\n</context-student-proof>`),
                new LanguageModelTextPart(`The goal at the cursor position is: "${goals.currentGoal}"`),
                new LanguageModelTextPart(`The hypotheses for this goal are:\n${hypString}`)
            ]);
        } catch {
            return new LanguageModelToolResult([
                new LanguageModelTextPart("Could not get goals or proof context from Waterproof")
            ]);
        }
    }
    async prepareInvocation(
        options: LanguageModelToolInvocationPrepareOptions<null>,
        _token: CancellationToken
    ) {
        const confirmationMessages = {
            title: 'Allow River to retrieve the current proof context?',
            message: new MarkdownString("Allow River to retrieve the current proof context?"),
        };

        return {
            invocationMessage: 'Proof context',
            confirmationMessages,
        };
    }
}
