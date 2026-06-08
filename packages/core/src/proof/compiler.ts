import { explainRectangleLens } from "../lenses/rectangleCompletionLens";
import type { LensResult, ProofArtifact, ProofStep, TraceEvent, WorldState } from "../types";

function stepToMarkdown(step: ProofStep): string {
  const label = step.kind[0].toUpperCase() + step.kind.slice(1);
  return `- **${label}.** ${step.text}`;
}

export function compileProof(state: WorldState): ProofArtifact {
  const success = Object.values(state.lensResults).find((result) => result.ok);
  const failure = Object.values(state.lensResults).find((result) => !result.ok);
  const steps: ProofStep[] = [];

  if (success) {
    steps.push(...explainRectangleLens(success));
  }
  if (failure) {
    steps.push({
      kind: "boundary",
      text: "This Lens applies when the stair pattern can be paired with a flipped copy to form equal-length rows.",
    });
    steps.push({
      kind: "boundary",
      text: failure.explanation,
    });
  }

  const markdown = [
    "# Rectangle Completion Lens Proof",
    "",
    ...steps.map(stepToMarkdown),
    "",
    "## Trace",
    "",
    ...state.trace.map((event) => `- ${event.action.type}`),
  ].join("\n");

  return { steps, markdown };
}

export function exportArtifacts(state: WorldState) {
  const success = Object.values(state.lensResults).find((result) => result.ok) as LensResult | undefined;
  const failure = Object.values(state.lensResults).find((result) => !result.ok) as LensResult | undefined;
  const proof = state.proof ?? compileProof(state);
  return {
    "trace.json": JSON.stringify(state.trace, null, 2),
    "lens.json": JSON.stringify(state.lenses[state.activeLensId ?? "rectangle-completion"], null, 2),
    "lens_result.json": JSON.stringify({ success, failure }, null, 2),
    "proof_steps.json": JSON.stringify(proof.steps, null, 2),
    "proof.md": proof.markdown,
  };
}

export function traceIds(trace: TraceEvent[]) {
  return trace.map((event) => event.id);
}
