import { BasePromptElementProps, PromptElement, PromptPiece, AssistantMessage, PromptElementProps, UserMessage } from "@vscode/prompt-tsx";
import { RiverBasic } from "./riverBasic";
import { Tag } from "./tag";
import { PreviousMistakes } from "./previousMistakes";

interface HintProps extends BasePromptElementProps {
    information: string;
    previousSuggestions: Array<{
        suggestion: string,
        error: string
    }>
}

// TODO: Should we keep the separator? Would it work better if we ask for all the output in the form of a JSON file?

const separator = "-----";
const input1 = {
    currentGoal: "∀ x ∈ ℝ, x + 3 = 3 + x",
    hypotheses: [],
    otherGoals: [],
    userAttemptSoFar:"Lemma exercise_take : ∀ x ∈ ℝ, x + 3 = 3 + x. Proof. Qed.",
    withCursorMarker:"Lemma exercise_take : ∀ x ∈ ℝ, x + 3 = 3 + x. Proof. <context>THE USER CURSOR IS PLACED HERE</context> Qed.",
    name: "exercise_take",
    helpOutput: "The goal is to show a 'for all'-statement (∀). Introduce an arbitrary variable in ℝ.\nHint, replace with: Take ... ∈ ....",
};
const strategy1 = "The student is trying to prove a 'for all' statement. The next step should be to introduce an arbitrary variable in ℝ. In Waterproof this is done using the 'Take' tactic. A valid next step will `Take x ∈ ℝ.`";
const output1 = {
    step: "Take x ∈ ℝ."
};

// {"currentGoal":"10 * x < 1",
// "hypotheses":[{"name":"x","content":"ℝ"},{"name":"_H","content":"x ∈ ℝ"},{"name":"i","content":"∀ ε > 0, x < ε"}],"otherGoals":[],
const input2 = {
    currentGoal: "10 * x < 1",
    hyptotheses: [
        { name: "x", content: "ℝ" },
        { name: "_H", content: "x ∈ ℝ" },
        { name: "i", content: "∀ ε > 0, x < ε"}
    ],
    otherGoals: [],
    full: "Lemma exercise_use_for_all: ∀ x ∈ ℝ, (∀ ε > 0, x < ε) ⇒ 10 * x < 1. Proof. Take x ∈ ℝ. Assume that ∀ ε > 0, x < ε as (i). Qed. ",
    withCursorMarker: "Lemma exercise_use_for_all: ∀ x ∈ ℝ, (∀ ε > 0, x < ε) ⇒ 10 * x < 1. Proof. Take x ∈ ℝ. Assume that ∀ ε > 0, x < ε as (i). <context>THE USER CURSOR IS PLACED HERE</context> Qed. ",
    name: "exercise_use_for_all", 
    helpOutput:"You can try to expand definitions or use alternative characterizations:\nYou can try to expand definitions or use alternative characterizations:\nYou can use one of the ‘for all’-statements (∀):\nYou can use one of the ‘for all’-statements (∀):\n    (∀ ε > 0, x < ε)\n    (∀ ε > 0, x < ε)\nHint, replace with: Use ... := ... in ....\nHint, replace with: Use ${0:x} := ${1:0} in ({2:i}).${3}"
};
const strategy2 = "The student has already assumed that for every ε > 0, x < ε and labeled it i. To show 10 * x < 1, they should use the for-all statement with a suitable value for ε that relates to the goal. In particular, choosing ε := 1/10 will work. The next step should use the `Use` tactic to make this choice for ε: `Use ε := 1/10 in (i).`";
const output2 = {
    step: "Use ε := (1/10) in (i)."
};

export class WaterproofHintPrompt extends PromptElement<HintProps> {
    render(): PromptPiece {
        return (
            <>
            <AssistantMessage>
            <RiverBasic/>
            You will receive a JSON object containing: <br/>
            - `currentGoal`: The goal that Rocq is asking the student to show at the point of the cursor. <br/>
            - `hypotheses`: The hypotheses belonging to the current goal. <br/>
            - `helpOutput`: The Waterproof system can generate hints for common proof tasks (i.e. what to do when the goal is an 'forall'-statement). This part of the json contains the output of Waterproofs 'Help' feature. <br/>
            - `name`: The name of the Theorem/Lemma/etc. that the student is working on, this may be nice to use when outputting information to the student. <br/>
            - `full`: The full proof script in which the student is currently working. This starts at Theorem/Lemma/etc. and goes until the Qed.<br/>
            - `withCursorMarker`: The full proof script in which the student is currently working, with a special marker added to indicate the position of the cursor of the student at which goals and help have been requested.<br/>
            <Tag name="jsonWithInformation">
            {this.props.information}
            </Tag>
            Your task is to generate the next step in the proof. This usually means one sentence or waterproof tactic, but in some cases more than one tactic or sentence may be supplied. The step should be concise and use Waterproof tactics only.
            <br/>
            <PreviousMistakes previousSuggestions={this.props.previousSuggestions}/>
            <br/>
            Your output should be a strategy for generating the next step, followed by a separator of the form '{separator}'', followed by a JSON object of type `step: string, tutorial: string` where step is the next concrete step in the proof that you would take (a valid waterproof tactic containing no placeholders). Finally, tutorial includes a pointer to the relevant section in the tutorial that explains the Waterproof tactic used in the step.
            <br/>
            Two example inputs and replies are given below:
            <br/>
            Input: {JSON.stringify(input1)} <br />
            Output: {strategy1 + "\n" + separator + "\n" + JSON.stringify(output1)} <br />
            <br/>
            Input: {JSON.stringify(input2)} <br />
            Output: {strategy2 + "\n" + separator + "\n" + JSON.stringify(output2)} <br />
            Strategize before answering, ensure your JSON is correctly formatted and the seperator is exactly as specified ({separator}).
            </AssistantMessage>
            </>
        );
    }
};

export type HintPromptRewordForChatProps = PromptElementProps<{
    strategy: string;
    text: string;
    userInput: string;
}>;

export class HintPromptRewordForChat extends PromptElement<HintPromptRewordForChatProps> {
    render(): PromptPiece {
        return (
			<> 
			<AssistantMessage>
			<RiverBasic/>
			Previously, you came up with the following strategy:
			<Tag name="strategy">
			    {this.props.strategy}
			</Tag>
            And you generated the following hint:
            <Tag name="generated-hint">
			    {this.props.text}
            </Tag>
			Your task is to reformulate the hint to be more conversational and engaging, as if you were directly addressing a student. Or, in the case that you failed to generate a correct hint, explain that to the user. Make sure to maintain the original intent and clarity of the hint while enhancing its tone to be more supportive and encouraging.
			If you use code in your answer stick to the Waterproof language.
			<br/>
			{/* Your output should be the reformulated hint only including possible code snippets. You are encouraged to not give full tactics, only 'skeletons' where the user should fill in the details. Example: instead of `Take x ∈ ℝ` output `Take ….` and instead of `Assume that a is positive` output `Assume that ….`. Engage with the student to come up with the missing pieces. */}
			Your output should be the reformulated hint only including possible code snippets. You are encouraged to not give full tactics, only 'skeletons' where the user should fill in the details. Example: instead of `Take x ∈ ℝ` output `Take ...` and instead of `Assume that a is positive` output `Assume that ...`. Engage with the student to come up with the missing pieces.
            </AssistantMessage>
			<UserMessage>
				{this.props.userInput}
			</UserMessage>
			</>
		);
	}
};

export class HintPromptRewordForChat2 extends PromptElement<HintPromptRewordForChatProps> {
    render(): PromptPiece {
        return (
			<> 
			<AssistantMessage>
			<RiverBasic/>
			Previously, you came up with the following strategy:
			<Tag name="strategy">
			    {this.props.strategy}
			</Tag>
            And you generated the following next step:
            <Tag name="generated-step">
			    {this.props.text}
            </Tag>
			{/* Your task is to reformulate the hint to be more conversational and engaging, as if you were directly addressing a student. Or, in the case that you failed to generate a correct hint, explain that to the user. Make sure to maintain the original intent and clarity of the hint while enhancing its tone to be more supportive and encouraging. */}
			You are a socratic tutor, helping the student completing the proof. Based on the strategy that was formulated for the proof and the possibly verified next step please help the students in a socratic manner. You can help the student by asking the right questions.
            {/* If you use code in your answer stick to the Waterproof language. */}
			<br/>
			{/* Your output should be the reformulated hint only including possible code snippets. You are encouraged to not give full tactics, only 'skeletons' where the user should fill in the details. Example: instead of `Take x ∈ ℝ.` output `Take ….` and instead of `Assume that a is positive` output `Assume that ….`. */}
			{/* Your output should be the reformulated hint only including possible code snippets. You are encouraged to not give full tactics, only 'skeletons' where the user should fill in the details. Example: instead of `Take x ∈ ℝ.` output `Take ....` and instead of `Assume that a is positive` output `Assume that ....`. */}
			</AssistantMessage>
			<UserMessage>
            {this.props.userInput}
			</UserMessage>
            <UserMessage>
            <Tag name="example-1">
                <Tag name="strategy">
                    {strategy1}
                </Tag>
                <Tag name="generated-hint">
                    {`A valid next step was found that Waterproof accepted:\n\n\`\`\`\n ${output1.step}\n\`\`\``}
                </Tag>
                <Tag name="example-output">
                    You are proving a 'for all'-statement. What do you need to do to start your proof in such a case?
                    {/*                     
                    The next step is to introduce an arbitrary value and show that the claim holds for that value.<br/>
                    Use the `Take` tactic for this:<br/>
                    ```<br/>
                    Take … ∈ ….<br/>
                    ```<br/>
                    Try to find out what the dots should be replaced with. */}
                </Tag>
            </Tag>
            <Tag name="example-2">
                <Tag name="strategy">
                    {strategy2}
                </Tag>
                <Tag name="generated-hint">
                    {`A valid next step was found that Waterproof accepted:\n\n\`\`\`\n ${output2.step}\n\`\`\``}
                </Tag>
                <Tag name="example-output">
                    Earlier in the proof you have already assumed that {"`∀ ε > 0, x < ε`"} (i.e. we can use `ε` to bound `x`) and labeled it `i`. This is a statement that starts with `∀`, about which you know, in the context of this proof, that it holds. What can you do to use this statement? 
                    {/* you now need to show that {"`10 * x < 1`"}.<br/>
                    Try to find a value for `ε` that, in combination with assumption `i`, gives the desired result. Once you have a value of `ε` you want to use, fill in the following skeleton:<br/>
                    ```<br/>
                    Use ε := … in (i).<br/>
                    ```<br/> */}
                </Tag>
            </Tag>
            </UserMessage>
			</>
		);
	}
};