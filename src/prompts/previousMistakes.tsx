import { PromptElement, PromptElementProps, PromptPiece } from "@vscode/prompt-tsx";
import { Tag } from "./tag";

export type PreviousMistakesProps = PromptElementProps<{
    previousSuggestions: Array<{
        suggestion: string,
        error: string
    }>
}>;

export class PreviousMistakes extends PromptElement<PreviousMistakesProps> {
    render(): PromptPiece {
        if (this.props.previousSuggestions.length === 0) {
            return (<></>);
        }

        return (
            <>
                Waterproof is able to verify the correctness of your suggestions by attempting to execute them. Here are some of your previous suggestions that resulted in errors:
                { this.props.previousSuggestions.map((s, i) => (
                    <Tag name="suggestion" metadata={[["index", (i+1).toString()]]}>
                        <Tag name="yourOutput">{s.suggestion}</Tag>
                        <Tag name="resultedInError">{s.error}</Tag>
                    </Tag>
                )) }
                When trying again, take the previous errors into account. See what the error tells you and how you should improve the generated tactic(s) to avoid making the same mistake again.
            </>
        );
    }
}