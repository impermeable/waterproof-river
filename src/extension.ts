import { renderPrompt } from '@vscode/prompt-tsx';
import { CancellationToken, chat, ChatContext, ChatParticipant, ChatRequest, ChatResponseStream, commands, DiagnosticCollection, Disposable, ExtensionContext, extensions, LanguageModelTextPart, LanguageModelToolCallPart, LanguageModelToolResult, languages, lm, MarkdownString, StatusBarAlignment, ThemeColor, Uri, window } from 'vscode';
import { WaterproofAPI } from './api';
import { handleHelp, handleSyntaxHelp, handleToWaterproof } from "./handlers";
import { ToolCallRound, ToolResultMetadata, ToolUserPrompt, TsxToolUserMetadata } from "./prompts/toolCalls";
import { HintTool, ProofContextTool, SyntaxHelpTool, TryStepTool } from "./tools";
import { satisfies } from 'semver';
import { TheoryTool } from './tools/theoryTool';
import { LectureNotesRetriever } from './retrieval';


class RiverExtension implements Disposable {

	private riverChatParticipant: ChatParticipant;
	private lastSeenVersion: number = 0;
	public readonly collection: DiagnosticCollection;
	private disposables: Array<{dispose(): any;}> = [];

	constructor(private readonly api: WaterproofAPI, private readonly context: ExtensionContext) {
		this.riverChatParticipant = chat.createChatParticipant('waterproof-tue.river', this.riverChatHandler.bind(this));
		this.riverChatParticipant.iconPath = Uri.joinPath(context.extensionUri, 'media', 'drop.png');
		this.push(this.riverChatParticipant);

		this.collection = languages.createDiagnosticCollection("waterproof-river");

		this.push(commands.registerCommand("river.clearSuggestions", () => {
			this.clearDiagnostics();
		}));

		this.registerTools();
	}

	/**
	 * Short-hand to add disposable to the array of disposables from the extension context
	 * @param disposables Collection of disposable items that will be disposed when the RiverExtension
	 * is disposed of.
	 */
	private push(...disposables: {dispose(): any;}[]) {
		this.disposables.push(...disposables);
	}

	private registerTools() {
		// Register tools
		this.push(lm.registerTool("waterproof-tue_hint", new HintTool(this.api)));
		this.push(lm.registerTool("waterproof-tue_syntax_check", new SyntaxHelpTool(this.api, this.collection)));
		this.push(lm.registerTool("waterproof-tue_proof_context", new ProofContextTool(this.api)));
		this.push(lm.registerTool("waterproof-tue_try_proof_step_at_cursor", new TryStepTool(this.api)));
		this.push(lm.registerTool("waterproof-tue_theory_information", new TheoryTool(new LectureNotesRetriever(this.context))));
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
		// We first determine if the user used a command
		const { command } = request;

		if (command === "syntaxHelp") {
			await handleSyntaxHelp(this.api, this.collection, request, context, stream, token);
		}
		else if (command === "hint") {
			await handleHelp(this.api, request, context, stream, token);
		}
		else if (command === "translateProof") {
			await handleToWaterproof(this.api, this.collection, request, context, stream, token);
		}
		else {
			// If we reach this else statement, then the user has *not* used a command
			// and we are in the freeform chat mode
			await this.handleChat(request, context, stream, token);
		}
	}
	
	// handle a free form chat message
	async handleChat(request: ChatRequest, context: ChatContext, stream: ChatResponseStream, token: CancellationToken) {
		const doc = this.api.currentDocument();
		if (doc === undefined) {
			stream.markdown("Could not get the current document from Waterproof. Please make sure you have a Waterproof document open and try again.");
			return;
		}
		const diagnostics = doc ? languages.getDiagnostics(doc.uri) : [];
		const versionDiffers = this.lastSeenVersion !== doc.version;


		// Tool calling prompt and loop modified from https://github.com/microsoft/vscode-extension-samples/tree/main/chat-sample

		const result = await renderPrompt(
			ToolUserPrompt,
			{
				currentFile: doc,
				versionDiffers,
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
		
		// Update the last seen version of the document
		this.lastSeenVersion = doc.version;

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
					mdString.isTrusted = {enabledCommands: ['river.clearSuggestions']};
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
						versionDiffers,
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
		this.disposables.forEach(v => v.dispose());
	}
}

export function activate(context: ExtensionContext) {
	// Entry point of the extension.

	// Search for the Waterproof-vscode extension.
	const waterproofID = "waterproof-tue.waterproof";
	const waterproofExtension = extensions.getExtension<WaterproofAPI>(waterproofID);

	// When not found, throw an error
	if (!waterproofExtension) {
		throw new Error("Waterproof extension not found");
	}

	// Create a debug channel on which we can output debug statements.
	const debugChannel = window.createOutputChannel("Waterproof River");
	context.subscriptions.push(debugChannel);

	// Retrieve the version of the Waterproof vscode extension
	const version = waterproofExtension.packageJSON["version"] as string;
	// semver range for the Waterproof version we can work with.
	const REQUIRED_WATERPROOF_VERSION = "=0.11.1";
	debugChannel.appendLine(`Waterproof extension version: ${version} (required range: ${REQUIRED_WATERPROOF_VERSION})`);
	const sat = satisfies(version, REQUIRED_WATERPROOF_VERSION);
	
	debugChannel.appendLine(`Waterproof version satisfies version requirement: ${sat ? 'yes' : 'no'}`);

	if (!sat) {
		// If the version of Waterproof does not match the range we expect we show an error message...
		window.showErrorMessage(`River expects a version of the Waterproof extension satisfying ${REQUIRED_WATERPROOF_VERSION}, but we found ${version} instead.\nSome functions may not work as expected!`, {modal: true});
		//...yet still carry on with the initialization of River
	}

	const api = waterproofExtension.exports;

	// Initialize the RiverExtension object with the Waterproof API
	const riverExtension = new RiverExtension(api, context);

	context.subscriptions.push(riverExtension);

	// Set message in the status bar
	const statusBarItem = window.createStatusBarItem(StatusBarAlignment.Left, 20);
	if (!sat) {
		statusBarItem.text = '$(error) River AI Assistant Active';
		statusBarItem.backgroundColor = new ThemeColor("statusBarItem.errorBackground");
		statusBarItem.tooltip = "Version mismatch between the Waterproof and River extensions\nThe 'River' output may contain more information.";
	} else {
		statusBarItem.text = 'River AI Assistant Active';
	}
	statusBarItem.show();
	context.subscriptions.push(statusBarItem);
}

// Called when the extension is deactivated
export function deactivate() { }
