import { renderPrompt } from '@vscode/prompt-tsx';
import { CancellationToken, chat, ChatContext, ChatParticipant, ChatRequest, ChatResponseStream, commands, DiagnosticCollection, Disposable, env, ExtensionContext, extensions, LanguageModelTextPart, LanguageModelToolCallPart, LanguageModelToolResult, languages, lm, MarkdownString, StatusBarAlignment, Uri, window } from 'vscode';
import { WaterproofAPI } from './api';
import { handleHelp, handleSyntaxHelp } from "./handlers";
import { ToolCallRound, ToolResultMetadata, ToolUserPrompt, TsxToolUserMetadata } from "./prompts/toolCalls";
import { HintTool, SyntaxHelpTool } from "./tools";


class RiverExtension implements Disposable {

	private riverChatParticipant: ChatParticipant;
	public readonly collection: DiagnosticCollection;

	constructor(private api: WaterproofAPI, context: ExtensionContext) {
		this.riverChatParticipant = chat.createChatParticipant('waterproof-tue.river', this.riverChatHandler.bind(this));
		this.riverChatParticipant.iconPath = Uri.joinPath(context.extensionUri, 'media', 'drop.png');

		this.collection = languages.createDiagnosticCollection("waterproof-river");

		context.subscriptions.push(commands.registerCommand("river.clearSuggestions", () => {
			this.clearDiagnostics();
		}));
	}

	async clearDiagnostics() {
		this.collection.clear();
	}

	async riverChatHandler(
		request: ChatRequest,
		context: ChatContext,
		stream: ChatResponseStream,
		token: CancellationToken
	) {
		if (request.command === "test") {
			await this.handleTest(request, context, stream, token);
		}
		if (request.command === "syntaxHelp") {
			await handleSyntaxHelp(this.api, this.collection, request, context, stream, token);
		}
		else if (request.command === "hint") {
			await handleHelp(this.api, request, context, stream, token);
		} else {
			await this.handleTest(request, context, stream, token);
		}

	}
	
	async handleTest(request: ChatRequest, context: ChatContext, stream: ChatResponseStream, token: CancellationToken) {
		const doc = this.api.currentDocument();
		if (doc === undefined) {
			stream.markdown("Could not get the current document from Waterproof. Please make sure you have a Waterproof document open and try again.");
			return;
		}
		const diagnostics = doc ? languages.getDiagnostics(doc.uri) : [];
		
		
		// Tool calling prompt and loop modified from https://github.com/microsoft/vscode-extension-samples/tree/main/chat-sample

		const result = await renderPrompt(
			ToolUserPrompt,
			{
				currentFile: doc,
				diagnostics,
				context,
				request,
				toolCallRounds: [],
				toolCallResults: {},
			},
			{ 
				modelMaxPromptTokens: request.model.maxInputTokens
			},
			request.model);
		let messages = result.messages;
		

		const accumulatedToolResults: Record<string, LanguageModelToolResult> = {};
		const toolCallRounds: ToolCallRound[] = [];
		const runWithTools = async (): Promise<void> => {
			const tools = lm.tools.filter(t => t.name.startsWith("waterproof-tue"));
		
			// Send the request to the LanguageModelChat
			const response = await request.model.sendRequest(messages, {tools}, token);

			// Stream text output and collect tool calls from the response
			const toolCalls: LanguageModelToolCallPart[] = [];
			let responseStr = '';
			for await (const part of response.stream) {
				if (part instanceof LanguageModelTextPart) {
					const mdString = new MarkdownString(part.value);
					mdString.isTrusted = {enabledCommands: ['river.clearDiagnostics']};
					stream.markdown(mdString);
					responseStr += part.value;
				} else if (part instanceof LanguageModelToolCallPart) {
					toolCalls.push(part);
				}
			}

			if (toolCalls.length) {
				// If the model called any tools, then we do another round- render the prompt with those tool calls (rendering the PromptElements will invoke the tools)
				// and include the tool results in the prompt for the next request.
				toolCallRounds.push({
					response: responseStr,
					toolCalls
				});
				const result = (await renderPrompt(
					ToolUserPrompt,
					{
						currentFile: doc,
						diagnostics,
						context,
						request,
						toolCallRounds,
						toolCallResults: accumulatedToolResults
					},
					{ modelMaxPromptTokens: request.model.maxInputTokens },
					request.model));
				messages = result.messages;
				const toolResultMetadata = result.metadata.getAll(ToolResultMetadata);
				if (toolResultMetadata?.length) {
					// Cache tool results for later, so they can be incorporated into later prompts without calling the tool again
					toolResultMetadata.forEach(meta => accumulatedToolResults[meta.toolCallId] = meta.result);
				}

				// This loops until the model doesn't want to call any more tools, then the request is done.
				return runWithTools();
			}
		};

		await runWithTools();

		return {
			metadata: {
				// Return tool call metadata so it can be used in prompt history on the next request
				toolCallsMetadata: {
					toolCallResults: accumulatedToolResults,
					toolCallRounds
				}
			} satisfies TsxToolUserMetadata,
		};
	};


	dispose() {
		this.riverChatParticipant.dispose();
	}
}



// activation function for the extension
export function activate(context: ExtensionContext) {

	// Entry point of the extension.

	// Search for the Waterproof-vscode extension.
	const waterproofID = "waterproof-tue.waterproof";
	const waterproofExtension = extensions.getExtension<WaterproofAPI>(waterproofID);

	// When not found, throw an error
	if (!waterproofExtension) {
		throw new Error("Waterproof extension not found");
	}

	const riverExtension = new RiverExtension(waterproofExtension.exports!, context);

	context.subscriptions.push(riverExtension);

	// Set message in the status bar
	const statusBarItem = window.createStatusBarItem(StatusBarAlignment.Left, 20);
	statusBarItem.text = 'River AI Assistant Active';
	statusBarItem.show();
	context.subscriptions.push(statusBarItem);

	// Register tools
	context.subscriptions.push(lm.registerTool("waterproof-tue_hint", new HintTool(waterproofExtension.exports)));
	context.subscriptions.push(lm.registerTool("waterproof-tue_syntax_check", new SyntaxHelpTool(waterproofExtension.exports, riverExtension.collection)));
}

// This method is called when your extension is deactivated
export function deactivate() { }
