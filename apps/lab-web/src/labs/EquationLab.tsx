import { useEffect } from "react";
import { create } from "zustand";
import {
  verifySpec,
  verifyState,
  type BalanceState,
  type EquationBalanceSpec,
  type Side,
} from "@math-wild/concept-core";
import type { Feedback, InvariantResult, TraceEvent } from "@math-wild/math-kernel";
import {
  EquationBalanceWorld,
  measureEquation,
  type EquationBalanceAction,
  type EquationMeasurements,
} from "@math-wild/math-worlds/equation-balance";
import specJson from "../../../../packages/concept-specs/equation_balance_x_plus_3_eq_8.json";
import BalanceSvg from "../renderers/BalanceSvg";

const spec = specJson as EquationBalanceSpec;
const world = new EquationBalanceWorld(spec);

type LabStore = {
  state: BalanceState;
  invariantResults: InvariantResult[];
  feedback: Feedback;
  measurements: EquationMeasurements;
  trace: TraceEvent<BalanceState, EquationBalanceAction>[];
  remove: (side: Side, blockId: string) => void;
  undo: () => void;
  reset: () => void;
};

function snapshot(state: BalanceState) {
  const invariantResults = world.checkInvariants(state);
  return {
    state,
    invariantResults,
    feedback: world.getFeedback(state, invariantResults),
    measurements: measureEquation(state),
  };
}

const useLabStore = create<LabStore>((set) => ({
  ...snapshot(world.createInitialState()),
  trace: [],
  remove: (side, blockId) =>
    set((store) => {
      const event = world.act(store.state, { type: "removeUnit", side, blockId });
      return {
        ...snapshot(event.after),
        trace: [...store.trace, event],
      };
    }),
  undo: () =>
    set((store) => {
      const last = store.trace.at(-1);
      if (!last) {
        return store;
      }
      return {
        ...snapshot(last.before),
        trace: store.trace.slice(0, -1),
      };
    }),
  reset: () => set({ ...snapshot(world.createInitialState()), trace: [] }),
}));

function feedbackClass(feedback: Feedback) {
  if (feedback.kind === "reveal" || feedback.kind === "celebration") {
    return "solved";
  }
  if (feedback.kind === "broken-equality" || feedback.kind === "unbalanced") {
    return "unbalanced";
  }
  return "balanced";
}

function feedbackTitle(feedback: Feedback) {
  if (feedback.kind === "reveal" || feedback.kind === "celebration") {
    return feedback.message ?? "x = 5";
  }
  if (feedback.kind === "broken-equality" || feedback.kind === "unbalanced") {
    return "关系断了";
  }
  return "保持平衡";
}

function feedbackDetail(feedback: Feedback, measurements: EquationMeasurements) {
  if (feedback.kind === "reveal" || feedback.kind === "celebration") {
    return "左右同时去掉 3 个单位块，剩下 x 和 5 个单位块。";
  }
  if (feedback.kind === "broken-equality" || feedback.kind === "unbalanced") {
    return `不变量 broken：left = ${measurements.leftTotal}，right = ${measurements.rightTotal}，delta = ${measurements.delta}`;
  }
  return `不变量 restored：left = ${measurements.leftTotal}，right = ${measurements.rightTotal}，delta = 0`;
}

export default function EquationLab() {
  const { state, invariantResults, feedback, measurements, trace, remove, undo, reset } = useLabStore();
  const specCheck = verifySpec(spec);
  const stateCheck = verifyState(state, spec);
  const status = feedbackClass(feedback);

  useEffect(() => {
    const handler = (event: Event) => {
      const detail = (event as CustomEvent<{ side: Side; blockId: string }>).detail;
      if (detail?.side && detail.blockId) {
        remove(detail.side, detail.blockId);
      }
    };
    window.addEventListener("mathwild:remove-unit", handler);
    return () => window.removeEventListener("mathwild:remove-unit", handler);
  }, [remove]);

  return (
    <main className="lab-shell">
      <section className="lab-stage" aria-label="Equation balance lab">
        <header className="lab-header">
          <div>
            <p className="lab-kicker">Equation Lab</p>
            <h1>{spec.title}</h1>
          </div>
          <div className={`status-pill is-${status}`} aria-live="polite" data-testid="balance-status">
            {feedbackTitle(feedback)}
          </div>
        </header>

        <div className="lab-body">
          <div className="balance-panel">
            <BalanceSvg
              state={state}
              equation={spec.equation}
              feedback={feedback}
              measurements={measurements}
              onRemoveUnit={remove}
            />
          </div>

          <aside className="feedback-panel">
            <div className="feedback-main">
              <p className="equation-label">{spec.equation}</p>
              <h2>{feedbackTitle(feedback)}</h2>
              <p>{feedbackDetail(feedback, measurements)}</p>
            </div>

            <div className="metrics-grid" aria-label="Removed blocks">
              <div>
                <span>左边移除</span>
                <strong>{state.removedLeft.length}</strong>
              </div>
              <div>
                <span>右边移除</span>
                <strong>{state.removedRight.length}</strong>
              </div>
            </div>

            <div className="lab-actions">
              <button type="button" onClick={undo}>
                撤销
              </button>
              <button type="button" onClick={reset}>
                重置
              </button>
            </div>

            <div className="trace-panel" aria-label="Trace">
              <span>Trace</span>
              <strong>{trace.length}</strong>
            </div>

            <div className="verifier-strip">
              <span>Spec {specCheck.status}</span>
              <span>State {stateCheck.status}</span>
              <span>Invariant {invariantResults.every((result) => result.ok) ? "PASS" : "BROKEN"}</span>
            </div>
          </aside>
        </div>

        <p className="gesture-hint">拖动单位块到移除区。只拿一边会失衡，左右同减会保持平衡。</p>
      </section>
    </main>
  );
}
