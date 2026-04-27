import { CancellationToken, LanguageModelChat, LanguageModelTextPart, LanguageModelTool, LanguageModelToolInvocationOptions, LanguageModelToolInvocationPrepareOptions, LanguageModelToolResult, lm, MarkdownString } from "vscode";
import { LectureNotesRetriever } from "../retrieval";
import { renderPrompt } from "@vscode/prompt-tsx";
import { WherePrompt } from "../prompts/where";

export type TheoryToolInput = {
    question: string;
}

export class TheoryTool implements LanguageModelTool<TheoryToolInput> {
    constructor (private readonly retriever: LectureNotesRetriever) {}
    async invoke(options: LanguageModelToolInvocationOptions<TheoryToolInput>, token: CancellationToken) {
        // TODO: Hardcoded model
        const model: LanguageModelChat = (await lm.selectChatModels({id: "gpt-4.1"}))[0];
            
        const result = await renderPrompt(
            WherePrompt,
            {
                question: options.input.question
            },
            {
                modelMaxPromptTokens: model.maxInputTokens
            },
            model);

        const { messages } = result;
        const response = await model.sendRequest(messages, {}, token);

        const responseStr: Array<string> = [];

        for await (const part of response.text) {
            responseStr.push(part);
        }
        const numbers = responseStr.join("").split(",").map(v => Number.parseInt(v));

        if (numbers.includes(-1)) {
            return;
        }

        const snippets = (await Promise.all(numbers.map(this.retriever.retrieve.bind(this.retriever)))).map(v => new LanguageModelTextPart(v));

        return new LanguageModelToolResult(snippets);
    }
    async prepareInvocation(
        options: LanguageModelToolInvocationPrepareOptions<TheoryToolInput>,
        _token: CancellationToken
    ) {
        const confirmationMessages = {
            title: "Allow River to retrieve information from the Analysis lecture notes?",
            message: new MarkdownString("Allow River to use information from the Analysis lecture notes?"),
        };

        return {
            invocationMessage: "Snippet from the lecture notes",
            confirmationMessages,
        };
    }
}
