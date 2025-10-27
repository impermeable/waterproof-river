import { BasePromptElementProps, PromptElement, UserMessage } from "@vscode/prompt-tsx";
import { Diagnostic, Range, TextDocument } from "vscode";
import { Tag } from "./tag";

export interface DiagnosticsProps extends BasePromptElementProps {
    diagnostics: Diagnostic[],
    document: TextDocument,
}

export class DiagnosticElement extends PromptElement<DiagnosticsProps, void> {
    render() {
        return (
            <UserMessage>
                <Tag name="diagnosticsInDocument">
                    {this.props.diagnostics.map((d) => this.renderOne(d))}
                </Tag>
            </UserMessage>
        )
    }

    private renderOne(d: Diagnostic) {
        const message = d.message;
        const startLine = this.props.document.lineAt(d.range.start).range.start;
        const endLine = this.props.document.lineAt(d.range.end).range.end; 
        const snippet = this.props.document.getText(new Range(startLine, endLine));
        return (
            <>
                <Tag name="diagnosticInfo">
                    <Tag name="diagnostic">
                        {message}
                    </Tag>
                    <Tag name="producedForCode">
                        {snippet}
                    </Tag>
                </Tag>
            </> 
        )
    }
}