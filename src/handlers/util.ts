export function extractProof(proofContext: string) {
    const match = proofContext.match(/Proof\.([^]*?)Qed\./);
    return match?.at(1)?.trim() ?? "";
}
