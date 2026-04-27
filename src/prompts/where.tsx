import { AssistantMessage, PromptElement, PromptElementProps, PromptPiece } from "@vscode/prompt-tsx";
import content from "./content.txt";
import { Tag } from "./tag";

export type WhereProps = PromptElementProps<{
    question: string;
}>;

export class WherePrompt extends PromptElement<WhereProps> {
    render(): PromptPiece {
        return (
            <AssistantMessage>
                You are given the following contents page mapping indices to chapter titles.
                <Tag name="content-page">
                    {content}
                </Tag>
                Given the following question from the user, determine what chapter should be used to answer the question and return as output the index of this chapter only!<br/>
                If no chapter applies, return "-1".<br/>
                If you decide that multiple chapters apply, you are allowed to output multiple indices separated by ",". Example: "2, 3".<br/>
                <Tag name="user-question">
                    {this.props.question}
                </Tag>
                <Tag name="example-interaction">
                    <Tag name="user-question">
                        What is the definition of a metric space?
                    </Tag>
                    <Tag name="example-response">
                        22
                    </Tag>
                </Tag>
            </AssistantMessage>
        );
    }
}

export class QuestionPrompt extends PromptElement<WhereProps & {snippets: Array<string>}> {
    render(): PromptPiece {
        return (
            <AssistantMessage>
                You are given the following snippet(s) from lecture notes on Analysis.
                <Tag name="notes-snippets">
                    {this.props.snippets.map((snippet, index) => (
                        <Tag name={`snippet-${index + 1}`}>
                        {snippet}
                        </Tag>
                    ))}
                </Tag>
                Given the following question from the user give a clear and concise answer using information from the provided snippets only!<br/>
                The snippet may contain non-standard LaTeX code that Katex cannot render. Adopt this where necessary.
                <Tag name="user-question">
                    {this.props.question}
                </Tag>
            </AssistantMessage>
        );
    }
}

