import {
	AssistantMessage,
	BasePromptElementProps,
	Chunk,
	PrioritizedList,
	PromptElement,
	PromptMetadata,
	PromptPiece,
	PromptReference,
	PromptSizing,
	ToolCall,
	ToolMessage,
	UserMessage
} from '@vscode/prompt-tsx';
import { ToolResult } from '@vscode/prompt-tsx/dist/base/promptElements';
import * as vscode from 'vscode';
import { RiverBasic } from './riverBasic';
import { DiagnosticElement } from './diagnostic';
import { Tag } from './tag';

// Modified from https://github.com/microsoft/vscode-extension-samples/tree/main/chat-sample

export interface ToolCallsMetadata {
	toolCallRounds: ToolCallRound[];
	toolCallResults: Record<string, vscode.LanguageModelToolResult>;
}

export interface TsxToolUserMetadata {
	toolCallsMetadata: ToolCallsMetadata;
}

function isTsxToolUserMetadata(obj: unknown): obj is TsxToolUserMetadata {
	// If you change the metadata format, you would have to make this stricter or handle old objects in old ChatRequest metadata
	return !!obj &&
		!!(obj as TsxToolUserMetadata).toolCallsMetadata &&
		Array.isArray((obj as TsxToolUserMetadata).toolCallsMetadata.toolCallRounds);
}

export interface ToolCallRound {
	response: string;
	toolCalls: vscode.LanguageModelToolCallPart[];
}

export interface ToolUserProps extends BasePromptElementProps {
	currentFile: vscode.TextDocument;
	diagnostics: vscode.Diagnostic[];
	request: vscode.ChatRequest;
	context: vscode.ChatContext;
	toolCallRounds: ToolCallRound[];
	toolCallResults: Record<string, vscode.LanguageModelToolResult>;
}

const button = `[Clear Suggestions](command:river.clearSuggestions)`;

export class ToolUserPrompt extends PromptElement<ToolUserProps, void> {
	async render(_state: void, _sizing: PromptSizing) {
		return (
			<>
				<AssistantMessage>
                    <RiverBasic/>
					Instructions: <br />
					- Be critical about the proof that the student is working on, it could be wrong or incomplete. <br/>
					- Don't ask the user for confirmation to use tools, just use them. <br/>
					- There are special workflows as described below, when you determine that you should follow any one of these, follow them precisely by going through all the steps in order!
					<RiverWorkflowHint/>
					<RiverWorkflowErrors/>
					- If none of the workflows applies you are in 'chat' mode and free to engage in conversation with the user about mathematics and Waterproof.
				</AssistantMessage>
				<AssistantMessage>
					<Tag name="context-user-file">
					The current file that the user is working on is: <br />
					<PromptReferenceElement ref={ {value: this.props.currentFile.uri, id: "userCurrentFile" }} />
					</Tag>
				</AssistantMessage>
				<DiagnosticElement diagnostics={this.props.diagnostics} document={this.props.currentFile} />
				<History context={this.props.context} priority={10} />
				<PromptReferences
					references={this.props.request.references}
					priority={20}
				/>
				<UserMessage>{this.props.request.prompt}</UserMessage>
				<ToolCalls
					toolCallRounds={this.props.toolCallRounds}
					toolInvocationToken={this.props.request.toolInvocationToken}
					toolCallResults={this.props.toolCallResults} />
			</>
		);
	}
}

export class RiverWorkflowHint extends PromptElement {
	async render() {
		return (
			<Tag name='workflow-hint'>
				When the user asks for a hint or help with their current proof, follow this workflow:<br/>
				1. Use the _hint tool. <br/>
				2. This tool will return a hint that Waterproof has verified, or in the case that none could be found you will also be informed of that.<br/>
				3. Note that the student is not expected to look at the output of the tool, if you reference the output make sure that you talk about Waterproof.<br/>
				4. Output the contents of this hint as part of the current conversation with the student. If you output any Waterproof tactics/snippets, make sure that they are nicely formatted as code. Keep in mind that the student is learning, so you probably
				want to give an 'incomplete' hint instead of just outputting the solution.<br/>
			</Tag>
		)
	}
}

export class RiverWorkflowErrors extends PromptElement {
	async render() {
		return (
			<Tag name='workflow-errors'>
				Waterproof is a new tool for the students, hence they make erorrs. As Waterproof is a strict system often errors with the Waterproof syntax are made. 
				When the students ask about errors in the current document follow this workflow precisely:<br/>
				1. Use the _syntax_check tool. <br/>
				2. This tool will return a list of errors and how to fix them.<br/>
				3. In conjunction, this tool has added suggestions into the document the student is working on. These suggestions are the same as the fixes in the output of the tool. <br/>
				4. At the end of your message you should output a line (using the markdown syntax `---` which should appear with a blank line before and after), inform the student that if suggestions have been added to the document, they can be removed using the button that you will output below.
					This button is a crucial part of the output for the error workflow! Without it, students can't get rid of your suggestions. The button can be added by outputting: <br/>
					{button} <br/>
			</Tag>
		)
	}
}

interface ToolCallsProps extends BasePromptElementProps {
	toolCallRounds: ToolCallRound[];
	toolCallResults: Record<string, vscode.LanguageModelToolResult>;
	toolInvocationToken: vscode.ChatParticipantToolToken | undefined;
}

const dummyCancellationToken: vscode.CancellationToken = new vscode.CancellationTokenSource().token;

/**
 * Render a set of tool calls, which look like an AssistantMessage with a set of tool calls followed by the associated UserMessages containing results.
 */
class ToolCalls extends PromptElement<ToolCallsProps, void> {
	async render(_state: void, _sizing: PromptSizing) {
		if (!this.props.toolCallRounds.length) {
			return undefined;
		}

		// Note- for the copilot models, the final prompt must end with a non-tool-result UserMessage
		return <>
			{this.props.toolCallRounds.map(round => this.renderOneToolCallRound(round))}
			<UserMessage>Above is the result of calling one or more tools. The user cannot see the results, so you should explain them to the user if referencing them in your answer.</UserMessage>
		</>;
	}

	private renderOneToolCallRound(round: ToolCallRound) {
		const assistantToolCalls: ToolCall[] = round.toolCalls.map(tc => ({ type: 'function', function: { name: tc.name, arguments: JSON.stringify(tc.input) }, id: tc.callId }));
		return (
			<Chunk>
				<AssistantMessage toolCalls={assistantToolCalls}>{round.response}</AssistantMessage>
				{round.toolCalls.map(toolCall =>
					<ToolResultElement toolCall={toolCall} toolInvocationToken={this.props.toolInvocationToken} toolCallResult={this.props.toolCallResults[toolCall.callId]} />)}
			</Chunk>);
	}
}

interface ToolResultElementProps extends BasePromptElementProps {
	toolCall: vscode.LanguageModelToolCallPart;
	toolInvocationToken: vscode.ChatParticipantToolToken | undefined;
	toolCallResult: vscode.LanguageModelToolResult | undefined;
}

/**
 * One tool call result, which either comes from the cache or from invoking the tool.
 */
class ToolResultElement extends PromptElement<ToolResultElementProps, void> {
	async render(state: void, sizing: PromptSizing): Promise<PromptPiece | undefined> {
		const tool = vscode.lm.tools.find(t => t.name === this.props.toolCall.name);
		if (!tool) {
			console.error(`Tool not found: ${this.props.toolCall.name}`);
			return <ToolMessage toolCallId={this.props.toolCall.callId}>Tool not found</ToolMessage>;
		}

		const tokenizationOptions: vscode.LanguageModelToolTokenizationOptions = {
			tokenBudget: sizing.tokenBudget,
			countTokens: async (content: string) => sizing.countTokens(content),
		};

		const toolResult = this.props.toolCallResult ??
			await vscode.lm.invokeTool(this.props.toolCall.name, { input: this.props.toolCall.input, toolInvocationToken: this.props.toolInvocationToken, tokenizationOptions }, dummyCancellationToken);

		return (
			<ToolMessage toolCallId={this.props.toolCall.callId}>
				<meta value={new ToolResultMetadata(this.props.toolCall.callId, toolResult)}></meta>
				<ToolResult data={toolResult} />
			</ToolMessage>
		);
	}
}

export class ToolResultMetadata extends PromptMetadata {
	constructor(
		public toolCallId: string,
		public result: vscode.LanguageModelToolResult,
	) {
		super();
	}
}

interface HistoryProps extends BasePromptElementProps {
	priority: number;
	context: vscode.ChatContext;
}

/**
 * Render the chat history, including previous tool call/results.
 */
class History extends PromptElement<HistoryProps, void> {
	render(_state: void, _sizing: PromptSizing) {
		return (
			<PrioritizedList priority={this.props.priority} descending={false}>
				{this.props.context.history.map((message) => {
					if (message instanceof vscode.ChatRequestTurn) {
						return (
							<>
								{<PromptReferences references={message.references} excludeReferences={true} />}
								<UserMessage>{message.prompt}</UserMessage>
							</>
						);
					} else if (message instanceof vscode.ChatResponseTurn) {
						const metadata = message.result.metadata;
						if (isTsxToolUserMetadata(metadata) && metadata.toolCallsMetadata.toolCallRounds.length > 0) {
							return <ToolCalls toolCallResults={metadata.toolCallsMetadata.toolCallResults} toolCallRounds={metadata.toolCallsMetadata.toolCallRounds} toolInvocationToken={undefined} />;
						}

						return <AssistantMessage>{chatResponseToString(message)}</AssistantMessage>;
					}
				})}
			</PrioritizedList>
		);
	}
}

/**
 * Convert the stream of chat response parts into something that can be rendered in the prompt.
 */
function chatResponseToString(response: vscode.ChatResponseTurn): string {
	return response.response
		.map((r) => {
			if (r instanceof vscode.ChatResponseMarkdownPart) {
				return r.value.value;
			} else if (r instanceof vscode.ChatResponseAnchorPart) {
				if (r.value instanceof vscode.Uri) {
					return r.value.fsPath;
				} else {
					return r.value.uri.fsPath;
				}
			}

			return '';
		})
		.join('');
}

interface PromptReferencesProps extends BasePromptElementProps {
	references: ReadonlyArray<vscode.ChatPromptReference>;
	excludeReferences?: boolean;
}

/**
 * Render references that were included in the user's request, eg files and selections.
 */
class PromptReferences extends PromptElement<PromptReferencesProps, void> {
	render(_state: void, _sizing: PromptSizing): PromptPiece {
		return (
			<UserMessage>
				{this.props.references.map(ref => (
					<PromptReferenceElement ref={ref} excludeReferences={this.props.excludeReferences} />
				))}
			</UserMessage>
		);
	}
}

interface PromptReferenceProps extends BasePromptElementProps {
	ref: vscode.ChatPromptReference;
	excludeReferences?: boolean;
}

class PromptReferenceElement extends PromptElement<PromptReferenceProps> {
	async render(_state: void, _sizing: PromptSizing): Promise<PromptPiece | undefined> {
		const value = this.props.ref.value;
		if (value instanceof vscode.Uri) {
			const fileContents = (await vscode.workspace.fs.readFile(value)).toString();
			return (
				<Tag name="context">
					{!this.props.excludeReferences && <references value={[new PromptReference(value)]} />}
					{value.fsPath}:<br />
					``` <br />
					{fileContents}<br />
					```<br />
				</Tag>
			);
		} else if (value instanceof vscode.Location) {
			const rangeText = (await vscode.workspace.openTextDocument(value.uri)).getText(value.range);
			return (
				<Tag name="context">
					{!this.props.excludeReferences && <references value={[new PromptReference(value)]} />}
					{value.uri.fsPath}:{value.range.start.line + 1}-$<br />
					{value.range.end.line + 1}: <br />
					```<br />
					{rangeText}<br />
					```
				</Tag>
			);
		} else if (typeof value === 'string') {
			return <Tag name="context">{value}</Tag>;
		}
	}
}
