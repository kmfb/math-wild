import { useMemo, useRef, useState, type CSSProperties, type PointerEvent } from "react";
import { create } from "zustand";
import type { Feedback, InvariantResult, TraceEvent } from "@math-wild/math-kernel";
import {
  measureTriangleNumber,
  TriangleNumberWorld,
  type TriangleMeasurements,
  type TriangleNumberAction,
  type TriangleNumberSpec,
  type TriangleNumberState,
  type TriangleStage,
} from "@math-wild/math-worlds/triangle-number";
import specJson from "../../../../packages/concept-specs/triangle_number_sum.json";

const spec = specJson as TriangleNumberSpec;
const world = new TriangleNumberWorld(spec);

type HeroStore = {
  state: TriangleNumberState;
  invariantResults: InvariantResult[];
  feedback: Feedback;
  measurements: TriangleMeasurements;
  trace: TraceEvent<TriangleNumberState, TriangleNumberAction>[];
  act: (action: TriangleNumberAction) => void;
};

function snapshot(state: TriangleNumberState) {
  const invariantResults = world.checkInvariants(state);
  return {
    state,
    invariantResults,
    feedback: world.getFeedback(state, invariantResults),
    measurements: measureTriangleNumber(state),
  };
}

const useHeroStore = create<HeroStore>((set) => ({
  ...snapshot(world.createInitialState()),
  trace: [],
  act: (action) =>
    set((store) => {
      const event = world.act(store.state, action);
      return {
        ...snapshot(event.after),
        trace: action.type === "setN" ? store.trace : [...store.trace, event],
      };
    }),
}));

function stageIndex(stage: TriangleStage) {
  return ["single", "duplicated", "flipped", "snapped", "derived"].indexOf(stage);
}

function stageInstruction(stage: TriangleStage) {
  if (stage === "single") return "先复制一份，不要开始数。";
  if (stage === "duplicated") return "点一下副本，把它翻过来。";
  if (stage === "flipped") return "拖动翻转后的副本，靠近虚线矩形。";
  if (stage === "snapped") return "现在它是 n 行、每行 n + 1 个。";
  return "原来的三角形，就是这个长方形的一半。";
}

function actionLabel(action: TriangleNumberAction) {
  if (action.type === "duplicateTriangle") return "复制";
  if (action.type === "flipCopy") return "翻转";
  if (action.type === "snapToRectangle") return "拼合";
  if (action.type === "deriveFormula") return "公式浮现";
  if (action.type === "reset") return "重置";
  return `n=${action.n}`;
}

function DotTriangle({ n, ghost = false, flipped = false }: { n: number; ghost?: boolean; flipped?: boolean }) {
  const rows = useMemo(() => Array.from({ length: n }, (_, row) => (flipped ? n - row : row + 1)), [flipped, n]);
  if (n > 20) {
    const abstractRows = rows.slice(0, 18);
    return (
      <div className={`dot-triangle is-abstract ${ghost ? "is-ghost" : ""} ${flipped ? "is-flipped" : ""}`}>
        {abstractRows.map((count, row) => (
          <div className="dot-row" key={row}>
            {Array.from({ length: Math.min(count, 18) }, (_, index) => (
              <span className="dot" key={index} />
            ))}
          </div>
        ))}
        <strong>{n} 层</strong>
      </div>
    );
  }
  return (
    <div className={`dot-triangle ${ghost ? "is-ghost" : ""} ${flipped ? "is-flipped" : ""}`}>
      {rows.map((count, row) => (
        <div className="dot-row" key={row}>
          {Array.from({ length: count }, (_, index) => (
            <span className="dot" key={index} />
          ))}
        </div>
      ))}
    </div>
  );
}

function TriangleRectangle({ n, measurements }: { n: number; measurements: TriangleMeasurements }) {
  const displayRows = measurements.usesAbstractView ? 20 : n;
  const displayColumns = measurements.usesAbstractView ? 21 : n + 1;
  const cells = useMemo(
    () =>
      Array.from({ length: displayRows }, (_, row) =>
        Array.from({ length: displayColumns }, (_, column) => ({
          id: `${row}-${column}`,
          source: column <= row ? "original" : "copy",
        })),
      ).flat(),
    [displayColumns, displayRows],
  );
  return (
    <div
      className={`triangle-rectangle ${measurements.usesAbstractView ? "is-abstract" : ""}`}
      style={{ "--columns": displayColumns } as CSSProperties}
    >
      {cells.map((cell) => (
        <span className={`dot is-${cell.source}`} key={cell.id} />
      ))}
      <i className="rectangle-diagonal" />
      <strong>{measurements.rectangleRows} × {measurements.rectangleColumns}</strong>
    </div>
  );
}

function ProofStage({
  state,
  measurements,
  act,
}: {
  state: TriangleNumberState;
  measurements: TriangleMeasurements;
  act: (action: TriangleNumberAction) => void;
}) {
  const index = stageIndex(state.stage);
  const [drag, setDrag] = useState({ active: false, startX: 0, startY: 0, x: 0, y: 0 });
  const stageRef = useRef<HTMLDivElement | null>(null);

  function beginDrag(event: PointerEvent<HTMLDivElement>) {
    if (state.stage !== "flipped") return;
    event.currentTarget.setPointerCapture(event.pointerId);
    setDrag({ active: true, startX: event.clientX, startY: event.clientY, x: 0, y: 0 });
  }

  function moveDrag(event: PointerEvent<HTMLDivElement>) {
    if (!drag.active) return;
    setDrag((current) => ({
      ...current,
      x: event.clientX - current.startX,
      y: event.clientY - current.startY,
    }));
  }

  function endDrag() {
    if (!drag.active) return;
    const movedTowardTarget = drag.x < -90 || Math.hypot(drag.x, drag.y) > 130;
    setDrag({ active: false, startX: 0, startY: 0, x: 0, y: 0 });
    if (movedTowardTarget) {
      act({ type: "snapToRectangle" });
    }
  }

  return (
    <div className={`proof-stage is-${state.stage}`} ref={stageRef}>
      <div className="snap-target">
        <span>{state.n} × {state.n + 1}</span>
      </div>
      {index < 3 ? (
        <>
          <div className="proof-object original">
            <DotTriangle n={state.n} />
          </div>
          {index >= 1 && (
            <div
              className={`proof-object copy ${state.stage === "flipped" ? "is-draggable" : ""}`}
              onPointerCancel={endDrag}
              onPointerDown={beginDrag}
              onPointerMove={moveDrag}
              onPointerUp={endDrag}
              role={state.stage === "flipped" ? "button" : undefined}
              style={
                state.stage === "flipped"
                  ? ({ "--drag-x": `${drag.x}px`, "--drag-y": `${drag.y}px` } as CSSProperties)
                  : undefined
              }
              tabIndex={state.stage === "flipped" ? 0 : undefined}
            >
              <DotTriangle n={state.n} ghost={index === 1} flipped={index >= 2} />
            </div>
          )}
        </>
      ) : (
        <div className="proof-object joined">
          <TriangleRectangle n={state.n} measurements={measurements} />
        </div>
      )}
      {index >= 3 && (
        <div className="rectangle-frame">
          <span>{measurements.rectangleRows} rows</span>
          <strong>{measurements.rectangleColumns} each row</strong>
        </div>
      )}
    </div>
  );
}

function FormulaReveal({ state, measurements }: { state: TriangleNumberState; measurements: TriangleMeasurements }) {
  if (state.stage === "single") {
    return <div className="proof-formula is-muted">1 + 2 + ... + {state.n}</div>;
  }
  if (state.stage === "duplicated" || state.stage === "flipped") {
    return <div className="proof-formula">T + T</div>;
  }
  if (state.stage === "snapped") {
    return <div className="proof-formula">2T = {state.n} × {state.n + 1}</div>;
  }
  return (
    <div className="proof-formula is-revealed">
      T = {state.n} × {state.n + 1} ÷ 2 = {measurements.value}
    </div>
  );
}

function ProofControls({ state, act }: { state: TriangleNumberState; act: (action: TriangleNumberAction) => void }) {
  if (state.stage === "single") {
    return (
      <div className="proof-controls is-primary">
        <button type="button" onClick={() => act({ type: "duplicateTriangle" })}>
          复制一份
        </button>
      </div>
    );
  }
  if (state.stage === "duplicated") {
    return (
      <div className="proof-controls is-primary">
        <button type="button" onClick={() => act({ type: "flipCopy" })}>
          翻转副本
        </button>
      </div>
    );
  }
  if (state.stage === "flipped") {
    return (
      <div className="proof-controls is-primary">
        <button type="button" onClick={() => act({ type: "snapToRectangle" })}>
          没有鼠标？直接吸附
        </button>
      </div>
    );
  }
  if (state.stage === "snapped") {
    return (
      <div className="proof-controls is-primary">
        <button type="button" onClick={() => act({ type: "deriveFormula" })}>
          看一个三角形
        </button>
      </div>
    );
  }
  return (
    <div className="proof-controls is-primary">
      <button type="button" onClick={() => act({ type: "reset" })}>
        再玩一次
      </button>
    </div>
  );
}

function ProofTrace({ trace }: { trace: TraceEvent<TriangleNumberState, TriangleNumberAction>[] }) {
  return (
    <div className="proof-trace" aria-label="Proof trace">
      <span>开始</span>
      {trace.slice(-5).map((event, index) => (
        <span className={event.after.stage === "derived" ? "is-revealed" : ""} key={`${event.timestamp}-${index}`}>
          {actionLabel(event.action)}
        </span>
      ))}
    </div>
  );
}

export default function TriangleNumberHero() {
  const { state, invariantResults, measurements, trace, act } = useHeroStore();
  const invariant = invariantResults[0];

  return (
    <main className="triangle-hero-shell">
      <section className="triangle-hero" aria-label="Triangle number playable proof">
        <header className="triangle-copy">
          <p className="hero-kicker">Playable Proof</p>
          <h1>{spec.title}</h1>
          <p>{stageInstruction(state.stage)}</p>
        </header>

        <ProofStage state={state} measurements={measurements} act={act} />

        <section className="proof-panel" aria-label="Proof controls">
          <FormulaReveal state={state} measurements={measurements} />
          <div className="proof-invariant">
            <span>dot count preserved</span>
            <strong>{invariant.leftValue} = {invariant.rightValue}</strong>
          </div>
          <ProofControls state={state} act={act} />
          <div className="proof-slider">
            <label htmlFor="triangle-n">n = {state.n}</label>
            <input
              id="triangle-n"
              max={spec.maxN}
              min={spec.minN}
              onChange={(event) => act({ type: "setN", n: Number(event.currentTarget.value) })}
              type="range"
              value={state.n}
            />
            <button type="button" onClick={() => act({ type: "setN", n: 100 })}>
              试试 100 层
            </button>
          </div>
          <ProofTrace trace={trace} />
        </section>
      </section>
    </main>
  );
}
