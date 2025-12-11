import { Position, TextDocument } from "vscode";

export type WaterproofAPI = {
    goals: () => Promise<{currentGoal: string, hypotheses: Array<Hypothesis>, otherGoals: string[]}>;
    currentDocument: () => TextDocument;
    help: () => Promise<Array<string>>;
    proofContext: (cursorMarker: string) => Promise<{ 
        name: string,
        full: string,
        withCursorMarker: string
    }>;
    tryProof: (steps: string) => Promise<{finished: boolean, remainingGoals: string[]}>;
    cursorPosition: () => Position | undefined;
}

export type Hypothesis = {
    name: string;
    content: string;
}
