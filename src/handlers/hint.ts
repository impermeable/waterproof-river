import { renderPrompt } from "@vscode/prompt-tsx";
import { ChatRequest, ChatContext, ChatResponseStream, CancellationToken, LanguageModelChat, workspace } from "vscode";
import { WaterproofAPI } from "../api";
import { HintPromptRewordForChat, WaterproofHintPrompt } from "../prompts/hint";
import { goalsOrError, helpOrError, proofContextOrError } from "../apiUtils";
import { getAutoModel } from "../defaultModel";

const MAX_HINT_FILE_CONTEXT_CHARS = 20000;

type HintGenerationResponse = {
    hint?: string;
    step?: string;
    possibleSteps?: string[];
    tutorial?: string;
};

type StepVerificationResult = {
    step: string;
    worked: boolean;
    error?: string;
};

function normalizeCandidateSteps(response: HintGenerationResponse): string[] {
    const candidates: string[] = [];

    if (typeof response.step === "string") {
        candidates.push(response.step);
    }

    if (Array.isArray(response.possibleSteps)) {
        for (const maybeStep of response.possibleSteps) {
            if (typeof maybeStep === "string") {
                candidates.push(maybeStep);
            }
        }
    }

    const deduplicated: string[] = [];
    const seen = new Set<string>();
    for (const candidate of candidates) {
        const trimmed = candidate.trim();
        if (trimmed.length === 0 || seen.has(trimmed)) {
            continue;
        }
        seen.add(trimmed);
        deduplicated.push(trimmed);
    }

    return deduplicated;
}

function formatVerificationResults(results: StepVerificationResult[]): string {
    return results
        .map((result, index) => {
            if (result.worked) {
                return `${index + 1}. SUCCESS\\nStep: ${result.step}`;
            }
            return `${index + 1}. FAILED\\nStep: ${result.step}\\nError: ${result.error ?? "Unknown error"}`;
        })
        .join("\\n\\n");
}


export async function handleHelp(api: WaterproofAPI, request: ChatRequest | null, context: ChatContext | null, _stream: ChatResponseStream | null, token: CancellationToken) {
    // Get the max attempts from the vscode setting, if (for some reason) no such setting exists, then use 3 as a default.
    const maxAttempts = workspace.getConfiguration("waterproof").get<number>("maxGenerationAttempts") ?? 3;

    const stream = {
        progress: (message: string) => {
            if (_stream) { _stream.progress(message); }
        },
        markdown: (message: string) => {
            if (_stream) { _stream.markdown(message); }
        }
    };

    // TODO: Hardcoded model
    const model: LanguageModelChat = (request !== null && request.model !== undefined) ? request.model : await getAutoModel();

    // Determine if we were called via command (stream) or via toolcall (no stream)
    const usedViaCommand = _stream !== undefined && _stream !== null;


    let attemptCounter = 0;

    stream.progress("Asking Waterproof what needs to be shown...");
    const goals = await goalsOrError(api);

    stream.progress("Querying output of Waterproof 'Help.' command...");
    const help = await helpOrError(api);
    const proofContext = await proofContextOrError(api, "<context>THE USER CURSOR IS PLACED HERE</context>");

    const currentDocument = api.currentDocument();
    const fullFileText = currentDocument.getText();
    const fileContextWasTruncated = fullFileText.length > MAX_HINT_FILE_CONTEXT_CHARS;
    const fileContext = fileContextWasTruncated
        ? fullFileText.slice(0, MAX_HINT_FILE_CONTEXT_CHARS)
        : fullFileText;

    const fileContextMeta = {
        path: currentDocument.fileName,
        truncated: fileContextWasTruncated,
        maxChars: MAX_HINT_FILE_CONTEXT_CHARS,
        originalLength: fullFileText.length,
        note: "This contains file-level declarations that may be outside the current proof context."
    };

    const input = {
        ...goals,
        ...proofContext,
        helpOutput: help,
        fileContextMeta,
        fileContext
    };

    const previousSuggestions: Array<{suggestion: string, error: string}> = [];

    let rObj: HintGenerationResponse | null = null;
    let strategy: string = "null";
    let acceptedStep: string | null = null;
    let acceptedStepVerifications: StepVerificationResult[] = [];

    // console.log("information", JSON.stringify(input));

    while (attemptCounter < maxAttempts) {
        const { messages } = await renderPrompt(
            WaterproofHintPrompt,
            {
                information: JSON.stringify(input),
                previousSuggestions
            },
            { modelMaxPromptTokens: model.maxInputTokens },
            model
        );
        stream.progress(`Asking River to generate a verified hint... (attempt ${attemptCounter + 1} of ${maxAttempts})`);
        
        
        const resp = await model.sendRequest(messages, {}, token);
        let result: string[] = [];

        for await (const fragment of resp.text) {
            result.push(fragment);
        }
        const fullResponse = result.join("");
        const separator = "-----";
        const separatorIndex = fullResponse.indexOf(separator);
        if (separatorIndex < 0) {
            attemptCounter++;
            previousSuggestions.push({
                suggestion: fullResponse,
                error: "Could not find separator ----- in response. The response should be your strategy followed by the separator and then a properly formatted JSON object containing `step`, `possibleSteps`, and `tutorial`."
            });
            continue;
        }

        strategy = fullResponse.slice(0, separatorIndex).trim();
        const jsonPart = fullResponse.slice(separatorIndex + separator.length).trim();
        
        try {
            rObj = JSON.parse(jsonPart) as HintGenerationResponse;
        } catch {
            rObj = null;
        }

        stream.progress(`Asking Waterproof to verify candidate steps for correctness... (attempt ${attemptCounter + 1} of ${maxAttempts})`);

        if (rObj === null) {
            attemptCounter++;
            previousSuggestions.push({suggestion: `${strategy}\n${separator}\n${jsonPart}`, error: "Could not parse JSON response"});
            continue;
        }

        const candidateSteps = normalizeCandidateSteps(rObj);
        if (candidateSteps.length === 0) {
            attemptCounter++;
            previousSuggestions.push({
                suggestion: JSON.stringify(rObj),
                error: "Missing candidate steps. Provide a concrete `step` and a non-empty `possibleSteps: string[]` with valid Waterproof snippets."
            });
            continue;
        }

        const verificationResults: StepVerificationResult[] = [];
        let firstSuccessfulStep: string | null = null;

        // Verify all candidate steps so the model can get explicit feedback on each one.
        for (const candidateStep of candidateSteps) {
            try {
                await api.tryProof(candidateStep);
                verificationResults.push({ step: candidateStep, worked: true });
                if (firstSuccessfulStep === null) {
                    firstSuccessfulStep = candidateStep;
                }
            } catch (error_) {
                verificationResults.push({
                    step: candidateStep,
                    worked: false,
                    error: `${error_}`
                });
            }
        }

        if (firstSuccessfulStep === null) {
            attemptCounter++;
            previousSuggestions.push({
                suggestion: JSON.stringify({ strategy, ...rObj }),
                error: `All provided candidate steps failed verification.\\n\\n${formatVerificationResults(verificationResults)}`
            });
            continue;
        }

        acceptedStep = firstSuccessfulStep;
        acceptedStepVerifications = verificationResults;
        break;

    }

    let text = "";
    
    // If we reach here, the step was successfully executed or we ran out of attempts
    if (acceptedStep === null || rObj === null || attemptCounter >= maxAttempts) {
        text = "No valid next step could be found that Waterproof would accept.";
    } else {
        const verificationSummary = acceptedStepVerifications.map((result, index) => {
            if (result.worked) {
                return `${index + 1}. Accepted by Waterproof: ${result.step}`;
            }
            return `${index + 1}. Rejected by Waterproof: ${result.step}\\n   Error: ${result.error ?? "Unknown error"}`;
        }).join("\\n");
        text = `A valid next step was found that Waterproof accepted:\n\n\`\`\`\n${acceptedStep}\n\`\`\`\n\nCandidate verification results:\n${verificationSummary}`;
    }

    if (usedViaCommand && request !== null && context !== null && _stream !== null) {
        const m = await renderPrompt(
            HintPromptRewordForChat,
            {
                strategy,
                text,
                userInput: request.prompt,
            },
            { modelMaxPromptTokens: model.maxInputTokens },
            request.model
        );
    
        const r = await request.model.sendRequest(m.messages, {}, token);
        for await (const f of r.text) {
            stream.markdown(f);
        }
    } else {
        const m = await renderPrompt(
            HintPromptRewordForChat,
            {
                strategy,
                text,
                userInput: "",
            },
            { modelMaxPromptTokens: model.maxInputTokens },
            model
        );
        const r = await model.sendRequest(m.messages, {}, token);
        const parts = [];
        for await (const f of r.text) {
            parts.push(f);
        }
        return parts.join("");
    }
}