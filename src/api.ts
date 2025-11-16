import { TextDocument } from "vscode";

/////////////// IMPORTED FROM WATERPROOF-VSCODE /////////////

export type Hyp<Pp> = {
    names: Pp[];
    def?: Pp;
    ty: Pp;
}

export type Goal<Pp> = {
    ty: Pp;
    hyps: Hyp<Pp>[];
}

export type GoalConfig<Pp> = {
    goals: Goal<Pp>[];
    stack: [Goal<Pp>[], Goal<Pp>[]][];
    bullet?: Pp;
    shelf: Goal<Pp>[];
    given_up: Goal<Pp>[];
}

export type RunResult<ResType> = {
    st : ResType;
    hash?: number;
    proof_finished: boolean;
    feedback: [number, string][];
}

////////////////////////////////////////////////////////////

export type WaterproofAPI = {
    goals: () => Promise<{currentGoal: string, hypotheses: Array<Hypothesis>, otherGoals: string[]}>;
    currentDocument: () => TextDocument;
    help: () => Promise<Array<string>>;
    proofContext: (cursorMarker: string) => Promise<{ 
        name: string,
        full: string,
        withCursorMarker: string
    }>;
    execCommand: (cmd: string) => Promise<GoalConfig<string> & RunResult<number>>;
    tryProof: (steps: string) => Promise<{finished: boolean, remainingGoals: string[]}>; 
}

export type Hypothesis = {
    name: string;
    content: string;
}
