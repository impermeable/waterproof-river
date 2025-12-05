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

const separator = "-----";
const input1 = {"currentGoal":"∀ x ∈ ℝ, x + 3 = 3 + x","currentLemma":"∀ x ∈ ℝ,\n    x + 3 = 3 + x","helpOutput":"The goal is to show a 'for all'-statement (∀). Introduce an arbitrary variable in ℝ.\nHint, replace with: Take ... ∈ ....","userAttemptSoFar":"Lemma exercise_take :\n  ∀ x ∈ ℝ,\n    x + 3 = 3 + x.\nProof.\n```\n<input-area>\n```coq\n","context": "..." };
const strategy1 = "The student is trying to prove a 'for all' statement. The appropriate next step is to introduce an arbitrary variable in ℝ using the 'Take' tactic. I will suggest the studen to use `Take ... ∈ ...` to introduce the variable.";
const output1 = { "hint": "We need to prove the statement for all values of x in ℝ. We take some arbitrary x in ℝ and reason about that x. In Waterproof we do this using the `Take` tactic.", "step": "Take x ∈ ℝ." };

const input2 = {"currentGoal":"10 * x < 1","currentLemma":"∀ x ∈ ℝ,\n    (∀ ε > 0, x < ε) ⇒\n       x + 1/2 < 1","helpOutput":"You can use one of the ‘for all’-statements (∀):\n    (∀ ε > 0, x < ε)\nHint, replace with: Use ... := ... in ....","userAttemptSoFar":"Lemma example_use_for_all :\n  ∀ x ∈ ℝ,\n    (∀ ε > 0, x < ε) ⇒\n       x + 1/2 < 1.\nProof.\nTake x ∈ ℝ.\nAssume that (∀ ε > 0, x < ε) (i).\nUse ε := (1/2) in (i).\n* Indeed, (1 / 2 > 0).\n* It holds that  (x < 1 / 2).\n  We conclude that (x + 1/2 < 1).\nQed.\n```\n### Try it yourself\n```coq\nLemma exercise_use_for_all:\n  ∀ x ∈ ℝ,\n    (∀ ε > 0, x < ε) ⇒\n       10 * x < 1.\n\nProof.\n```\n<input-area>\n```coq\nTake x ∈ (ℝ).\nAssume that (∀ ε > 0, x < ε).\n","context": "..." };
const strategy2 = "The student has assumed that for every ε > 0, x < ε. To show 10 * x < 1, they should use the for-all statement with a suitable value for ε that relates to their goal. In particular, they can choose ε := (1/10) to make 10 * x < 1 follow from x < ε.";
const output2 = { "hint": "You have assumed that for every ε > 0, x < ε. To show 10 * x < 1, try to use the for-all statement with a suitable value for ε that relates to your goal. In particular, what value of ε can we choose that would make 10 * x < 1 follow from x < ε?", "step": "Use ε := (1/10) in (H)." };

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
            Your task is to provide a hint to the student that nudges them in the right direction without giving away the full proof. The hint should be concise and focus on the next step the student should take. If the student is stuck, consider suggesting relevant Waterproof tactics or concepts that could help them progress.
            <br/>
            <PreviousMistakes previousSuggestions={this.props.previousSuggestions}/>
            <br/>
            Always encourage the student to think critically and explore different approaches to solving the problem. Remember, the goal is to guide them towards discovering the solution on their own.
            Your output will be your strategy for answering the question then a separator ({separator}), followed by a JSON object of type `hint: string, step: string, tutorial: string` where hint is a text based hint (allowed to contain markdown) and step is the next concrete step in the proof that you would take (a valid waterproof tactic containing no placeholders). Finally, tutorial includes a pointer to the relevant section in the tutorial that explains the Waterproof tactic used in the step.
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
			Your output should be the reformulated hint only including possible code snippets. You are encouraged to not give full tactics, only 'skeletons' where the user should fill in the details. Example: instead of `Take x ∈ ℝ` output `Take ... ∈ ...` and engage with the student to come up with the missing pieces.
			</AssistantMessage>
			<UserMessage>
				{this.props.userInput}
			</UserMessage>
			</>
		);
	}
};