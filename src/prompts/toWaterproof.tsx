import { AssistantMessage, PromptElement, PromptElementProps } from "@vscode/prompt-tsx";
import { RiverBasic } from "./riverBasic";
import { Tag } from "./tag";
import { PreviousMistakes } from "./previousMistakes";

export type ToWaterproofProps = PromptElementProps<{
    goal: string;
    userProof: string;
    proofContext: {name: string; full: string; withCursorMarker: string;};
    previousSuggestions: Array<{suggestion: string, error: string}>;
}>;

export class WaterproofToWaterproofPrompt extends PromptElement<ToWaterproofProps> {
    render() {

        return (
            <>
                <AssistantMessage>
                <RiverBasic/>
                The student is working on a proof in Waterproof. They have a proof idea that needs to be formalized using Waterproof syntax and tactics.
                Your job is to given the idea of the student, output a valid version of their proof idea but translated to waterproof and verified using 
                the Waterproof checker.

                Further instructions:
                - If the proof is not finished after the last tactic that you translate from the user input, write a Waterproof comment (in between `(*` and `*)`) that clearly indicates where the student should continue their proof.<br/>
                - You are **NOT** giving a hint or an answer only translating the student supplied proof into Waterproof. Therefore, you should focus on the user input.<br/>
                - The goal is supplied here but you should **NOT** use this goal to attempt to solve the proof the student is working on or create a hint. Only translate the students proof<br/>
                - Use Waterproof tactics only.<br/>

                Start by outputting a description of how you got to the translated proof. This description should be clear to follow and indicate clearly how an idea for a proof should be translated into Waterproof.
                If possible refer to parts of the output as done in the example.

                After you have outputted your description output the following seperator '-----' (five times the minus symbol) followed by a newline and then output the Waterproof proof that you translated from the students input.

                Here are some examples of student input and the output you should give.
                <Tag name="example">
                    <Tag name="student-input">
                        I need to introduce an arbitrary real number and call it x. After that I need to assume the premise of the assumption. I can then use this assumption to get a value of y that will allow me to complete the proof.
                    </Tag>
                    <Tag name="student-goal">
                        ∀ x ∈ ℝ, (∃ y {">"} 10, y {"<"} x) ⇒ 10 {"<"} x.
                    </Tag>
                    <Tag name="river-output">
                        To introduce an arbitrary real number $x$ use the `Take` tactic.<br/>
                        To assume the premise of the assumption in the goal use `Assume`, you can give this assumption a label so you can refer back to it later in the proof.<br/>
                        Finally, use the assumption use the `Obtain` tactic to obtain the value of $y$ that will allow you to complete the proof.<br/>
                        -----<br/>
                        Take x ∈ ℝ.<br/>
                        Assume that ∃ y {">"} 10, y {"<"} x as (i).<br/>
                        Obtain y according to (i).<br/>
                        (* Use y to complete the proof *)
                    </Tag>
                </Tag>

                Here is the handwritten proof that the student wants to translate into valid Waterproof
                <Tag name="context-goal">
                    {this.props.goal}
                </Tag>
                And here is the goal that they are working on.
                <Tag name="context-user-written-proof">
                    {this.props.userProof}
                </Tag>
                Finally, their current proof looks like:
                {/** Abstract this away to a prompt element */}
                <Tag name="context-user-proof">
                    The object below contains the name of the lemma the student is working on, and the current proof so far. withCursorMarker contains a variant of the full current proof that the student is working on, plus an indication of where the user has placed the cursor at the moment of asking you for help.
                    {JSON.stringify(this.props.proofContext)}
                </Tag>

                <br/>
                <PreviousMistakes previousSuggestions={this.props.previousSuggestions}/>
                <br/>
                

                </AssistantMessage>
            </>
        );
    }
}
