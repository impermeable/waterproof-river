import { PromptElement, PromptElementProps, UserMessage } from "@vscode/prompt-tsx";
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
                <UserMessage>
                <RiverBasic/>
                The student is working on a proof in Waterproof. They have a proof idea that needs to be formalized using Waterproof syntax and tactics.
                Your job is to given the idea of the student, output a valid version of their proof idea but translated to waterproof and verified using 
                the Waterproof checker.

                Further instructions:
                - If the proof is not finished after the last tactic that you translate from the user input, write a Waterproof comment (in between `(*` and `*)`) that clearly indicates where the student should continue their proof.<br/>
                - You are **NOT** giving a hint or an answer only translating the student supplied proof into Waterproof. Therefore, you should focus on the user input.<br/>
                - The goal is supplied here but you should **NOT** use this goal to attempt to solve the proof the student is working on or create a hint. Only translate the students proof<br/>
                - Use Waterproof tactics only.<br/>
                - Important: When outputting code after the separator, output Waterproof only. Do not output any markdown decorations.<br/>

                Start by outputting a description of how you got to the translated proof. This description should address the student. Make sure that it is clear to follow and indicate clearly how the proof idea should be translated into Waterproof.
                If possible refer to parts of the output as done in the example.

                After you have outputted your description output the following seperator '-----' (five times the minus symbol) followed by a newline and then output the Waterproof proof that you translated from the students input.
                Output only the proof steps, not the additional Rocq structure including `Proof.` and `Qed.`. If the student has already written some proof steps, include those in your translation but make sure to translate them to valid Waterproof syntax and tactics as well.

                Here are some examples of student input and the output you should give.
                <Tag name="example">
                    <Tag name="student-input">
                        I need to introduce an arbitrary real number and call it x. After that I need to assume the premise of the assumption. I can then use this assumption to get a value of y that will allow me to complete the proof.
                    </Tag>
                    <Tag name="student-goal">
                        ∀ x ∈ ℝ, (∃ y {">"} 10, y {"<"} x) ⇒ 10 {"<"} x.
                    </Tag>
                    <Tag name="river-output">
                        To introduce an arbitrary real number $x$, we use the `Take` tactic.<br/>
                        To make an assumption, we use the `Assume` tactic. You can give this assumption a label so you can refer back to it later in the proof.<br/>
                        Finally, you can use the assumption with the `Obtain` tactic to obtain the value of $y$ that will allow you to complete the proof.<br/>
                        -----<br/>
                        Take x ∈ ℝ.<br/>
                        Assume that ∃ y {">"} 10, y {"<"} x as (i).<br/>
                        Obtain y according to (i).<br/>
                        (* Use y to complete the proof *)
                    </Tag>
                </Tag>

                The student is working on the following goal:
                <Tag name="context-user-written-proof">
                    {this.props.userProof}
                </Tag>
                So far, the student has managed to write the following proof.
                Parts of this proof might already be valid Waterproof.
                Others might not be, but still contain the correct ideas.
                <Tag name="context-goal">
                    {this.props.goal}
                </Tag>
                For context, the object below contains even more information about the current proof (state).
                {/** Abstract this away to a prompt element */}
                <Tag name="context-user-proof">
                    The object below contains the name of the lemma the student is working on, and the current proof so far. withCursorMarker contains a variant of the full current proof that the student is working on, plus an indication of where the user has placed the cursor at the moment of asking you for help.
                    {JSON.stringify(this.props.proofContext)}
                </Tag>

                <br/>
                <PreviousMistakes previousSuggestions={this.props.previousSuggestions}/>
                <br/>
                

                </UserMessage>
            </>
        );
    }
}
