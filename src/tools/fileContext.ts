import { CancellationToken, LanguageModelTextPart, LanguageModelTool, LanguageModelToolInvocationOptions, LanguageModelToolInvocationPrepareOptions, LanguageModelToolResult, MarkdownString } from "vscode";
import { WaterproofAPI } from "../api";

const MAX_FILE_CHARS = 30000;

/**
 * Tool that returns the content of the current Waterproof file.
 * This is useful when relevant definitions/lemmas are outside the local proof block.
 */
export class FileContextTool implements LanguageModelTool<null> {
    constructor(private readonly api: WaterproofAPI) {}

    async invoke(_options: LanguageModelToolInvocationOptions<null>, _token: CancellationToken) {
        try {
            const doc = this.api.currentDocument();
            const fullText = doc.getText();
            const wasTruncated = fullText.length > MAX_FILE_CHARS;
            const textToReturn = wasTruncated ? fullText.slice(0, MAX_FILE_CHARS) : fullText;

            const header = [
                `Current file: ${doc.fileName}`,
                "This output may include definitions and lemmas not shown by proof context.",
                wasTruncated
                    ? `WARNING: File content was truncated to the first ${MAX_FILE_CHARS} characters to stay within token budget.`
                    : "File content is complete."
            ].join("\n");

            return new LanguageModelToolResult([
                new LanguageModelTextPart(`${header}\n<current-file-content>\n${textToReturn}\n</current-file-content>`)
            ]);
        } catch {
            return new LanguageModelToolResult([
                new LanguageModelTextPart("Could not retrieve the current file content from Waterproof.")
            ]);
        }
    }

    async prepareInvocation(
        _options: LanguageModelToolInvocationPrepareOptions<null>,
        _token: CancellationToken
    ) {
        const confirmationMessages = {
            title: "Allow River to read the current file?",
            message: new MarkdownString("Allow River to read the current Waterproof file for additional context?"),
        };

        return {
            invocationMessage: "Current file context",
            confirmationMessages,
        };
    }
}
