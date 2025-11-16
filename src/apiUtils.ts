import { WaterproofAPI } from "./api";

// TODO: Need a better way of handling errors in the api.

export async function helpOrError(api: WaterproofAPI): Promise<string> {
    try {
        return (await api.help()).join("\n");
    } catch (err) {
        return `Unable to get help output from Waterproof, got error:\n${err}`;
    }
}

export async function goalsOrError(api: WaterproofAPI) {
    try {
        return (await api.goals());
    } catch (err) {
        return {error: `Unable to get goals from Waterproof, got error: \n${err}`};
    }
}

export async function execCommandOrError(api: WaterproofAPI, cmd: string) {
    try {
        return (await api.execCommand(cmd));
    } catch (err) {
        return {error: `Execuing command '${cmd}' resulted in error ${err}`};
    }
}

export async function proofContextOrError(api: WaterproofAPI, marker: string) {
    try {
        return (await api.proofContext(marker));
    } catch (err) {
        return {error: `Unable to get proofContext from Waterproof, got error: \n${err}`};
    }
}
