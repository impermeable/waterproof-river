import { PromptElement, PromptPiece, AssistantMessage, PromptElementProps } from "@vscode/prompt-tsx";
import { RiverBasic } from "./riverBasic";

type SyntaxHelpProps = PromptElementProps<{
    syntaxErrors: string;
}>;

export class WaterproofSyntaxHelpPrompt extends PromptElement<SyntaxHelpProps> {
    render(): PromptPiece {
        return (
            <>
            <AssistantMessage>
            <RiverBasic/>
            The student has requested you to help check the syntax of their Waterproof script. Waterproof found the following syntax errors:
            <br/>
            {this.props.syntaxErrors}
            <br/>
            A list of common mistakes is:
            <br/>
            - Forgetting to end the current tactic with a period (.).
            - Not specifying input in waterproof tactics. The tactics that can be autocompleted in the editor include placeholders that don't always fit the current goal.
            - Forgetting that Waterproof tactics are case-sensitive.
            - Using incorrect symbols for mathematical concepts. For example, using '=' instead of ':=' we using the `Choose` tactic.
            - When the user forgets a trailing period before the Qed. the error message can be misleading and tell the user that Qed. is an unexpected token. Carefully check for missing periods in the supplied error range.
            - Waterproof tactic input do **not** need parentheses around them. For example, `Take (x ∈ ℝ).` is incorrect, while `Take x ∈ ℝ.` is correct (note that we do not need parantheses around the the input `ℝ`).
            - If there are multiple errors after each other, the errors further down the list might be a consequence of the first error. Focus on fixing the first error first.
            <br/>
            First, output a concise summary of the mistakes that were made in the student's script. Then, output a separator (------) followed by a diagnostic message for every syntax error that was found. The messages should be an array of the following type: {"{"}from: {"{"}char: number, line: number{"}"}, to: {"{"}char: number, line: number{"}"}, message: string, fixed: string{"}"} where "to" and "from" denote the start and end point in the file to which the message apply, "message" is a concise description of the error and "fixed" is a corrected version of the line that contains the error. The array should be in the same order as the input errors. If you cannot fix the line, leave the fixed field empty.
            Make sure to output a JSON object that can be parsed to the following type: {String.raw`Array<{ to: { char: number, line: number }, from: { char: number, line: number }, message: string, fixed: string }>`}.
            <br/>
            
            </AssistantMessage>
            </>
        );
    }
};

