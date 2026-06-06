import { useEffect } from "react";
import { create } from "zustand";
import {
  createInitialState,
  removeUnit,
  restoreBlock,
  verifySpec,
  verifyState,
  type BalanceState,
  type EquationBalanceSpec,
  type Side,
} from "@math-wild/concept-core";
import specJson from "../../../../packages/concept-specs/equation_balance_x_plus_3_eq_8.json";
import BalanceSvg from "../renderers/BalanceSvg";

const spec = specJson as EquationBalanceSpec;

type LabStore = {
  state: BalanceState;
  remove: (side: Side, blockId: string) => void;
  undo: () => void;
  reset: () => void;
};

const initialState = createInitialState(spec);

const useLabStore = create<LabStore>((set) => ({
  state: initialState,
  remove: (side, blockId) => set((store) => ({ state: removeUnit(store.state, spec, side, blockId) })),
  undo: () =>
    set((store) => {
      if (store.state.removedRight.length > store.state.removedLeft.length) {
        return { state: restoreBlock(store.state, spec, "right") };
      }
      return { state: restoreBlock(store.state, spec, "left") };
    }),
  reset: () => set({ state: createInitialState(spec) }),
}));

function statusText(status: BalanceState["status"]) {
  if (status === "solved") {
    return "x = 5";
  }
  if (status === "balanced") {
    return "保持平衡";
  }
  return "失衡了";
}

function statusDetail(state: BalanceState) {
  if (state.status === "solved") {
    return "左右同时去掉 3 个单位块，剩下 x 和 5 个单位块。";
  }
  if (state.status === "balanced") {
    return "两边的值相等。";
  }
  return "只改变一边会破坏等号关系。";
}

export default function EquationLab() {
  const { state, remove, undo, reset } = useLabStore();
  const specCheck = verifySpec(spec);
  const stateCheck = verifyState(state, spec);

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
          <div className={`status-pill is-${state.status}`} aria-live="polite" data-testid="balance-status">
            {statusText(state.status)}
          </div>
        </header>

        <div className="lab-body">
          <div className="balance-panel">
            <BalanceSvg state={state} onRemoveUnit={remove} />
          </div>

          <aside className="feedback-panel">
            <div className="feedback-main">
              <p className="equation-label">{spec.equation}</p>
              <h2>{statusText(state.status)}</h2>
              <p>{statusDetail(state)}</p>
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

            <div className="verifier-strip">
              <span>Spec {specCheck.status}</span>
              <span>State {stateCheck.status}</span>
            </div>
          </aside>
        </div>

        <p className="gesture-hint">拖动单位块到移除区。只拿一边会失衡，左右同减会保持平衡。</p>
      </section>
    </main>
  );
}
