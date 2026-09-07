import { BasePromptElementProps, PromptElement, PromptPiece, PromptElementProps, UserMessage } from "@vscode/prompt-tsx";
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
    step: "Take x ∈ ℝ.",
    possibleSteps: [
        "Take x ∈ ℝ.",
        "Take x ∈ ℝ.\nWe need to show that x + 3 = 3 + x.",
        "Take x ∈ ℝ.\nWe need to show that x + 3 = 3 + x.",
        "Take x ∈ ℝ.\nWe conclude that x + 3 = 3 + x.",
        "Take x ∈ ℝ.\nWe need to show that x + 3 = 3 + x.\nWe conclude that x + 3 = 3 + x."
    ],
    tutorial: "directly-proving-a-for-all-statement"
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
    step: "Use ε := (1/10) in (i).",
    possibleSteps: [
        "Use ε := (1/10) in (i).",
        "Use ε := (1/10) in (i).\nIt holds that x < 1/10.",
        "Use ε := (1/10) in (i).\nIt holds that x < 1/10.\nWe conclude that 10 * x < 1."
    ],
    tutorial: "forwards-reasoning"
};

export class WaterproofHintPrompt extends PromptElement<HintProps> {
    render(): PromptPiece {
        return (
            <>
            <UserMessage>
            <RiverBasic/>
            You will receive a JSON object containing: <br/>
            - `currentGoal`: The goal that Rocq is asking the student to show at the point of the cursor. <br/>
            - `hypotheses`: The hypotheses belonging to the current goal. <br/>
            - `helpOutput`: The Waterproof system can generate hints for common proof tasks (i.e. what to do when the goal is an 'forall'-statement). This part of the json contains the output of Waterproofs 'Help' feature. <br/>
            - `name`: The name of the Theorem/Lemma/etc. that the student is working on, this may be nice to use when outputting information to the student. <br/>
            - `full`: The full proof script in which the student is currently working. This starts at Theorem/Lemma/etc. and goes until the Qed.<br/>
            - `withCursorMarker`: The full proof script in which the student is currently working, with a special marker added to indicate the position of the cursor of the student at which goals and help have been requested.<br/>
            - `fileContext`: The full Waterproof file content (possibly truncated) to recover definitions/lemmas outside the local proof block.<br/>
            - `fileContextMeta`: Metadata about `fileContext`, including whether truncation occurred.<br/>
            <Tag name="jsonWithInformation">
            {this.props.information}
            </Tag>
            Your task is to generate candidate next steps in the proof. Each candidate should be a concrete Waterproof snippet with no placeholders. Then select your best candidate as `step`.
            Prefer candidates that include enough local proof context to make the direction of the proof clear (for example: one tactic plus one or two follow-up Waterproof sentences that state the resulting intermediate goal or consequence).
            Do not stop at the shortest valid tactic if a slightly longer continuation gives better pedagogical context.
            Use `fileContext` when symbols, definitions, notation, or helper lemmas needed for the next step are not visible in the local proof context.
            <br/>
            <PreviousMistakes previousSuggestions={this.props.previousSuggestions}/>
            <br/>
            Your output should be a strategy for generating the next step, followed by a separator of the form '{separator}'', followed by a JSON object of type `step: string, possibleSteps: string[], tutorial: string`.
            The `step` must be the best candidate from `possibleSteps`. The array `possibleSteps` should contain multiple concrete alternatives (at least 3 when possible), all valid Waterproof snippets with no placeholders.
            At least one candidate in `possibleSteps` should be a richer continuation (typically 2-4 lines) that includes intermediate statements such as what now holds, what remains to show, or which derived fact unlocks the next move.
            When choosing `step`, prioritize candidates that provide this useful context while remaining valid Waterproof.
            Finally, `tutorial` includes a pointer to the relevant section in the tutorial that explains the Waterproof tactic used in the selected `step`.
            <br/>
            Two example inputs and replies are given below:
            <br/>
            Input: {JSON.stringify(input1)} <br />
            Output: {strategy1 + "\n" + separator + "\n" + JSON.stringify(output1)} <br />
            <br/>
            Input: {JSON.stringify(input2)} <br />
            Output: {strategy2 + "\n" + separator + "\n" + JSON.stringify(output2)} <br />
            Strategize before answering, ensure your JSON is correctly formatted and the separator is exactly as specified ({separator}).
            </UserMessage>
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
			<UserMessage>
			<RiverBasic/>
            Role clarification:
            - You are River's hint rewriter.
            - The content in {"<strategy>"} and {"<generated-step>"} was generated by River (an earlier model step), not by the student.
            - Your task is to reformulate River's internally generated result into a student-facing Socratic hint.
            - Never imply the student already executed the generated step unless this is explicitly shown in the student's proof context.
            - Do not praise progress based only on {"<generated-step>"}; treat it as internal draft material.
            - Do not mention verification logs, candidate lists, separators, tags, or internal generation details.
            - Output only the final student-facing hint text.
            <br/>
			Previously, you came up with the following strategy:
			<Tag name="strategy">
			    {this.props.strategy}
			</Tag>
            And you generated the following next step:
            <Tag name="generated-step">
			    {this.props.text}
            </Tag>
			You are a socratic tutor, helping the student completing the proof.
            Based on the strategy that you formulated for the proof, you came up with the step above.
            Keep in mind that you may have failed to generate a valid next step, in which case the above text will reflect that.
            Help the student in a socratic manner.
            You can help the student by asking the right questions to point them in the right directions without revealing the step explicitly.
            Phrase the hint so it invites the student to discover the move themselves (for example: ask what statement form they see, what rule applies, or what object/value they could introduce/use next).
            Note that students can not see hypotheses and, in particular, are not expected to refer to hypotheses with names starting with an underscore, so you should not refer to them in your reply unless you are sure that the hypothesis is labeled.
            In the case that your step does use a hypothesis with a name starting with an underscore, you should indicate the fix to create labeled hypothesis.
            This is often fixed by explicitly labeling an earlier assertion in the prove.
			<br/>
			<Tag name="context-user-message">
                {this.props.userInput}
            </Tag>
            What follows are some example generated strategies together with the expected generated hints and outputs.
            <Tag name="example-1">
                <Tag name="strategy">
                    {strategy1}
                </Tag>
                <Tag name="generated-hint">
                    {`A valid next step was found that Waterproof accepted:\n\n\`\`\`\n ${output1.step}\n\`\`\``}
                </Tag>
                <Tag name="example-output">
                    You are proving a 'for all'-statement. What do you need to do to start your proof in such a case?
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
                </Tag>
            </Tag>
            </UserMessage>
			</>
		);
	}
};