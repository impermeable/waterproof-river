import { renderPrompt } from "@vscode/prompt-tsx";
import { ChatRequest, ChatContext, ChatResponseStream, CancellationToken, LanguageModelChat, lm, workspace, CodeAction } from "vscode";
import { WaterproofAPI } from "../api";
import { WaterproofToWaterproofPrompt } from "../prompts/toWaterproof";
import { extractProof } from "./util";

// Get the max attempts from the vscode setting, if (for some reason) no such setting exists, then use 3 as a default.
const maxAttempts = workspace.getConfiguration("waterproof").get<number>("maxGenerationAttempts") ?? 3;

export async function handleToWaterproof(api: WaterproofAPI, request: ChatRequest, context: ChatContext, stream: ChatResponseStream, token: CancellationToken) {

    // TODO: Hardcoded model in the case that we are not executing via a command
    const model: LanguageModelChat = (request !== null && request.model !== undefined) ? request.model : (await lm.selectChatModels({id: "gpt-4.1"}))[0];

    // TODO: Should we ask for the goal here? This may influence the ai too much and prime it to give answers instead of translating the 
    // students suggestion into waterproof
    stream.progress("Asking Waterproof what needs to be shown...");
    const goals = await api.goals();

    // Query the proof context.
    const proofContext = await api.proofContext("<context>THE USER CURSOR IS PLACED HERE</context>");

    // We store the previous suggestions that the model generated. If they produce an error we try again and give
    // the new request the old responses including the error message.
    const previousSuggestions: Array<{suggestion: string, error: string}> = [];
    
    let attemptCounter = 0;
    let description: string = "none";
    let codeSuggestion: string = "none";

    const userProof = extractProof(proofContext.full);

    while (attemptCounter < maxAttempts) {
        const { messages } = await renderPrompt(
            WaterproofToWaterproofPrompt,
            {
                goal: goals.currentGoal,
                proofContext,
                userProof,
                previousSuggestions
            },
            { modelMaxPromptTokens: request.model.maxInputTokens },
            model
        );
        stream.progress(`Asking River to translate your proof into Waterproof... (attempt ${attemptCounter + 1} of ${maxAttempts})`);
        
        const resp = await model.sendRequest(messages, {}, token);
        let result: string[] = [];

        for await (const fragment of resp.text) {
            result.push(fragment);
        }

        const responseParts = result.join("").split("-----").map(v => v.trim());
        
        // We expect the model to generate a textual description as well as the Waterproof translation of the proof
        if (responseParts.length < 2) {
            attemptCounter++;
            previousSuggestions.push({
                suggestion: result.join(""), 
                error: "Expected to receive a textual description of how the proof was translated, followed by the separator ----- and concluded with the Waterproof translation of the student supplied proof"
            });
            continue;
        }
        
        description = responseParts[0];
        
        stream.progress(`Using Waterproof to verify correctness of the translation... (attempt ${attemptCounter + 1} of ${maxAttempts})`);

        // If we reach here, we have a valid suggestion
        // We now verify it by trying to execute it in Waterproof
    
        let verification;
        let verificationFailed = false;
        let error = "";
        codeSuggestion = responseParts[1];
        try {
            verification = await api.tryProof(codeSuggestion);
        } catch(error_) {
            verificationFailed = true;
            error = `Waterproof failed to verify the snippet you produced. Got the following error: "${error_}"`;
        }

        if (verificationFailed) {
            attemptCounter++;
            previousSuggestions.push({suggestion: codeSuggestion, error});
            continue;
        }

        if (!verificationFailed) {
            break;
        }

    }

    // If we reach here,... 
    if (attemptCounter >= maxAttempts) {
        //...we ran out of attempts
        stream.markdown(`River was unable to generate a verified translation of the input proof within the maximum allowed attempts (currently set to ${maxAttempts})`);
    } else {
        //...or the step was successfully verified
        stream.markdown(description);
        stream.markdown("\n\n---\n\n");
        stream.markdown("```\n");
        stream.markdown(codeSuggestion);
        stream.markdown("\n```");
    }
}
