import { renderPrompt } from "@vscode/prompt-tsx";
import { ChatRequest, ChatContext, ChatResponseStream, CancellationToken, LanguageModelChat, lm } from "vscode";
import { WaterproofAPI } from "../api";
import { WaterproofToWaterproofPrompt } from "../prompts/toWaterproof";

export async function handleToWaterproof(api: WaterproofAPI, request: ChatRequest, context: ChatContext, stream: ChatResponseStream, token: CancellationToken) {

    // TODO: Hardcoded model in the case that we are not executing via a command
    const model: LanguageModelChat = (request !== null && request.model !== undefined) ? request.model : (await lm.selectChatModels({id: "gpt-4.1"}))[0];

    // TODO: Should we ask for the goal here? This may influence the ai too much and prime it to give answers instead of translating the 
    // students suggestion into waterproof
    stream.progress("Asking Waterproof what needs to be shown...");
    const goals = await api.goals();

    stream.progress("Translating student proof into Waterproof...");

    // Query the proof context.
    const proofContext = await api.proofContext("<context>THE USER CURSOR IS PLACED HERE</context>");

    const { messages } = await renderPrompt(
        WaterproofToWaterproofPrompt,
        {
            goal: goals.currentGoal,
            proofContext: proofContext,
            userProof: request?.prompt
        },
        { modelMaxPromptTokens: 4000 },
        model
    );
    
    
    const resp = await model.sendRequest(messages, {}, token);
    for await (const part of resp.text) {
        stream.markdown(part);
    } 
}