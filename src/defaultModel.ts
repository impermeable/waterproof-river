import { LanguageModelChatSelector, lm } from "vscode";

async function retModelOrError(selector: LanguageModelChatSelector) {
    const models = await lm.selectChatModels(selector);
    if (models.length > 0) {
        return models[0];
    }
    throw new Error(`The model with selector "${JSON.stringify(selector)}" was not found!`);
}

/**
 * Returns the copilot 'auto' model
 */
export function getAutoModel() {
    return retModelOrError({ vendor: 'copilot', id: "auto" });
}

export function getUtilityModel() {
    return retModelOrError({ id: "copilot-utility" });
}

export function getSmallUtilityModel() {
    return retModelOrError({ id: "copilot-utility-small" });
}