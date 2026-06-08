import { describe, expect, it } from "vitest";
import {
  compileProof,
  createInitialWorld,
  dispatchWorld,
  exportArtifacts,
  recognizeWorld,
  rectangleLensAppliesTo,
} from "../src";

function completeDiscovery() {
  let state = createInitialWorld();
  state = dispatchWorld(state, { type: "duplicateDotSet", targetId: "practice-8", newId: "practice-8-copy" });
  state = dispatchWorld(state, { type: "flipDotSet", targetId: "practice-8-copy", axis: "y" });
  state = dispatchWorld(state, { type: "dragDotSet", targetId: "practice-8-copy", to: { x: -1.1, y: -0.7, z: 0 } });
  state = dispatchWorld(state, {
    type: "snapToRectangleCompletion",
    targetId: "practice-8-copy",
    partnerId: "practice-8",
  });
  return state;
}

describe("Rectangle Completion Lens", () => {
  it("counts stair dots", () => {
    const state = createInitialWorld();
    const practice = state.objects["practice-8"];
    expect(practice.kind).toBe("dotSet");
    if (practice.kind === "dotSet") expect((practice.n * (practice.n + 1)) / 2).toBe(36);
  });

  it("duplicate and flip preserve semantic dot count", () => {
    let state = createInitialWorld();
    state = dispatchWorld(state, { type: "duplicateDotSet", targetId: "practice-8", newId: "copy" });
    state = dispatchWorld(state, { type: "flipDotSet", targetId: "copy", axis: "y" });
    const copy = state.objects.copy;
    expect(copy.kind).toBe("dotSet");
    if (copy.kind === "dotSet") {
      expect(copy.n).toBe(8);
      expect(copy.orientation).toBe("left");
    }
  });

  it("recognizes rectangle completion and uniform rows", () => {
    const state = completeDiscovery();
    const kinds = recognizeWorld(state).map((recognition) => recognition.kind);
    expect(kinds).toContain("rectangleCompletion");
    expect(kinds).toContain("uniformRows");
  });

  it("accepts the Lens for the 100-layer Beacon", () => {
    let state = completeDiscovery();
    state = dispatchWorld(state, { type: "createLens", lensId: "rectangle-completion", fromRecognitionId: "rec-rectangle-completion" });
    state = dispatchWorld(state, { type: "applyLens", lensId: "rectangle-completion", targetId: "beacon-100" });
    expect(state.lensResults["beacon-100"].ok).toBe(true);
    expect(state.lensResults["beacon-100"].facts.oneTriangle).toBe(5050);
  });

  it("fails on the nearby counterexample", () => {
    let state = completeDiscovery();
    state = dispatchWorld(state, { type: "createLens", lensId: "rectangle-completion", fromRecognitionId: "rec-rectangle-completion" });
    state = dispatchWorld(state, { type: "testLens", lensId: "rectangle-completion", targetId: "counterexample-8" });
    expect(state.lensResults["counterexample-8"].ok).toBe(false);
    expect(state.lensResults["counterexample-8"].missingConditions).toContain("uniform row completion");
  });

  it("compiles proof artifacts from trace and lens results", () => {
    let state = completeDiscovery();
    state = dispatchWorld(state, { type: "createLens", lensId: "rectangle-completion", fromRecognitionId: "rec-rectangle-completion" });
    state = dispatchWorld(state, { type: "applyLens", lensId: "rectangle-completion", targetId: "beacon-100" });
    state = dispatchWorld(state, { type: "testLens", lensId: "rectangle-completion", targetId: "counterexample-8" });
    state = dispatchWorld(state, { type: "compileProof", traceIds: state.trace.map((event) => event.id) });
    const proof = compileProof(state);
    const artifacts = exportArtifacts(state);
    expect(proof.markdown).toContain("Therefore 1 + 2 + ... + n = n(n+1)/2.");
    expect(artifacts["trace.json"]).toContain("duplicateDotSet");
    expect(artifacts["proof.md"]).toContain("Boundary");
  });

  it("reports Lens applicability directly", () => {
    const state = createInitialWorld();
    expect(rectangleLensAppliesTo(state.objects["practice-8"], state).ok).toBe(true);
    expect(rectangleLensAppliesTo(state.objects["counterexample-8"], state).ok).toBe(false);
  });
});
