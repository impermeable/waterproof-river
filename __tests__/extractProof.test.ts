import { expect } from "@jest/globals";
import { extractProof } from "../src/handlers/util";

test("extractProof basic", () => {
    const proofContext = "Lemma very_simple : True. Proof. set qed := 1. exact I. Qed.";
    expect(extractProof(proofContext)).toBe("set qed := 1. exact I.");
});

test("extractProof newlines", () => {
    const proofContext = `Lemma very_simple2 : True.
Proof.
exact I.

Qed.`;
    expect(extractProof(proofContext)).toBe("exact I.");
});

test("extractProof empty when not found", () => {
    const proofContext = "Lemma testhyidhfoiasjfjhasdf : False. Qed.";
    expect(extractProof(proofContext)).toBe("");
});