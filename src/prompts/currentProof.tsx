
import { PromptElement, BasePromptElementProps } from "@vscode/prompt-tsx";

export interface CurrentProofProps extends BasePromptElementProps {
    proof: string;
    currentGoal: string;
    otherGoals: string[];
    hyps: string[];
}

export class CurrentProof extends PromptElement<CurrentProofProps> {
    async render() {
        return (
            <>
            The student is currently working on the following proof: <br/>
            ```<br/>
            { this.props.proof }
            ```<br/>
            The current goal is: <br/>
            {this.props.currentGoal} 
            <br/>
            Other remaining goals are: <br/>
            { this.props.otherGoals.length === 0 ? "None" : this.props.otherGoals.map(g => `- ${g}`).join("<br/>") }
            <br/>
            The current hypotheses are: <br/>
            { this.props.hyps.length === 0 ? "None" : this.props.hyps.map(h => `- ${h}`).join("<br/>") }
            </>
        );
    }
}