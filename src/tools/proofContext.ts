import { CancellationToken, LanguageModelTextPart, LanguageModelTool, LanguageModelToolInvocationOptions, LanguageModelToolInvocationPrepareOptions, LanguageModelToolResult, MarkdownString } from "vscode";
import { WaterproofAPI } from "../api";

/**
 * Tool responsible for getting the current proof context.
 * The proof context includes the proof the student is working on, how far they got
 * and where (the cursor position) from where they are asking the question.
 */
export class ProofContextTool implements LanguageModelTool<null> {
    constructor (private readonly api: WaterproofAPI) {}

    async invoke(options: LanguageModelToolInvocationOptions<null>, token: CancellationToken) {
        try {
            // Get the goals and the proof context from Waterproof using the WaterproofAPI object
            const context = await this.api.proofContext("<context-cursor>USER CURSOR IS HERE</context-cursor>");
            const goals = await this.api.goals();

            // Convert the hypotheses into a string
            const hypString = goals.hypotheses.map(v => `- ${v.name}: ${v.content}`).join("\n");
            
            return new LanguageModelToolResult([
                new LanguageModelTextPart(`The student is currently working on '${context.name}'.`),
                new LanguageModelTextPart(`So far the statement and proof looks as follows:<context-student-proof>\n${context.withCursorMarker}\n</context-student-proof>`),
                new LanguageModelTextPart(`The goal at the cursor position is: "${goals.currentGoal}"`),
                new LanguageModelTextPart(`The hypotheses for this goal are:\n${hypString}`),
                new LanguageModelTextPart("IMPORTANT: This proof context is local to the current proof and cursor position. It may omit relevant definitions/lemmas declared elsewhere in the file. If you need broader context, call the waterproof-tue_file_context tool.")
            ]);
        } catch {
            // Inform the model that either proofContext or goals request failed
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
            title: "Allow River to retrieve the current proof context?",
            message: new MarkdownString("Allow River to retrieve the current proof context?"),
        };

        return {
            invocationMessage: "Proof context",
            confirmationMessages,
        };
    }
}
