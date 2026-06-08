import { useMemo, useReducer } from "react";
import {
  createInitialWorld,
  dispatchWorld,
  exportArtifacts,
  rectangleLensPreview,
  traceIds,
  type MathAction,
  type WorldState,
} from "@math-wild/core";
import { WildernessCanvas } from "./WildernessCanvas";

function reducer(state: WorldState, action: MathAction) {
  return dispatchWorld(state, action);
}

function hasCopy(state: WorldState) {
  return Boolean(state.objects["practice-8-copy"]);
}

function hasLens(state: WorldState) {
  return Boolean(state.lenses["rectangle-completion"]);
}

function discoveryReady(state: WorldState) {
  return state.recognitions.some((recognition) => recognition.kind === "rectangleCompletion");
}

function nextHint(state: WorldState) {
  if (!hasCopy(state)) return "Make a second stair pattern.";
  if (!state.recognitions.some((recognition) => recognition.kind === "flippedCopy")) return "Flip the copy until it faces the first pattern.";
  if (!discoveryReady(state)) return "Move the copy until the rows complete.";
  if (!hasLens(state)) return "A Lens is forming from the completed rows.";
  if (!state.lensResults["beacon-100"]) return "Use the Lens on the distant mountain.";
  if (!state.lensResults["counterexample-8"]) return "Test the Lens on a nearby broken stair.";
  if (!state.proof) return "Compile the path into proof.";
  return "A new horizon is visible.";
}

export default function App() {
  const [state, dispatch] = useReducer(reducer, undefined, createInitialWorld);
  const artifacts = useMemo(() => (state.proof ? exportArtifacts(state) : undefined), [state]);
  const beaconPreview = rectangleLensPreview(state.objects["beacon-100"], state);
  const failure = state.lensResults["counterexample-8"];
  const success = state.lensResults["beacon-100"];

  function runNext() {
    if (!hasCopy(state)) {
      dispatch({ type: "duplicateDotSet", targetId: "practice-8", newId: "practice-8-copy" });
      return;
    }
    if (!state.recognitions.some((recognition) => recognition.kind === "flippedCopy")) {
      dispatch({ type: "flipDotSet", targetId: "practice-8-copy", axis: "y" });
      return;
    }
    if (!discoveryReady(state)) {
      dispatch({ type: "snapToRectangleCompletion", targetId: "practice-8-copy", partnerId: "practice-8" });
      return;
    }
    if (!hasLens(state)) {
      dispatch({ type: "createLens", lensId: "rectangle-completion", fromRecognitionId: "rec-rectangle-completion" });
      return;
    }
    if (!success) {
      dispatch({ type: "applyLens", lensId: "rectangle-completion", targetId: "beacon-100" });
      return;
    }
    if (!failure) {
      dispatch({ type: "testLens", lensId: "rectangle-completion", targetId: "counterexample-8" });
      return;
    }
    if (!state.proof) {
      dispatch({ type: "compileProof", traceIds: traceIds(state.trace) });
    }
  }

  return (
    <main className="wilderness-shell">
      <WildernessCanvas state={state} dispatch={dispatch} />
      <section className="beacon-copy" aria-label="Beacon">
        <p>Beacon</p>
        <h1>How many dots are inside this mountain?</h1>
        <span>Discover a Lens locally. Use it at distance. Test where it breaks.</span>
      </section>
      <section className="world-inscription" aria-label="World state">
        <strong>{nextHint(state)}</strong>
        {success && <span>{beaconPreview.message}: one side holds {String(success.facts.oneTriangle)} dots.</span>}
        {failure && <span className="is-failure">{failure.explanation}</span>}
      </section>
      <section className="lens-ring" aria-label="Lens status">
        <span className={hasLens(state) ? "is-lit" : ""}>Rectangle Completion Lens</span>
      </section>
      <nav className="world-actions" aria-label="Semantic actions">
        <button type="button" onClick={runNext}>
          {state.proof ? "Proof compiled" : "Continue"}
        </button>
        <button
          type="button"
          onClick={() => dispatch({ type: "compileProof", traceIds: traceIds(state.trace) })}
          disabled={!success || !failure}
        >
          Compile proof
        </button>
      </nav>
      {state.proof && artifacts && (
        <section className="proof-inscription" aria-label="Proof inscription">
          <h2>Proof inscription</h2>
          <pre>{artifacts["proof.md"]}</pre>
        </section>
      )}
    </main>
  );
}
