import { useMemo, useState, type CSSProperties, type PointerEvent } from "react";
import type { DotSetObject, MathAction, WorldState } from "@math-wild/core";

type Props = {
  state: WorldState;
  dispatch: (action: MathAction) => void;
};

type DragState = {
  active: boolean;
  startX: number;
  startY: number;
  x: number;
  y: number;
  near: boolean;
};

function asDotSet(object: unknown): DotSetObject | undefined {
  if (typeof object === "object" && object && "kind" in object && object.kind === "dotSet") {
    return object as DotSetObject;
  }
  return undefined;
}

function rowsFor(object: DotSetObject) {
  return object.rowLengths ?? Array.from({ length: object.n }, (_, index) => index + 1);
}

function isComplete(state: WorldState) {
  return state.recognitions.some((recognition) => recognition.kind === "rectangleCompletion");
}

function hasLens(state: WorldState) {
  return Boolean(state.lenses["rectangle-completion"]);
}

function DotRows({
  object,
  tone,
  compact = false,
}: {
  object: DotSetObject;
  tone: "amber" | "cyan" | "rose";
  compact?: boolean;
}) {
  const rows = rowsFor(object);
  const maxColumns = Math.max(...rows);
  return (
    <div className={`touch-dotset is-${tone} ${compact ? "is-compact" : ""}`} style={{ "--columns": maxColumns } as CSSProperties}>
      {rows.map((length, row) => (
        <div className="touch-dot-row" key={`${object.id}-${row}`}>
          {Array.from({ length }, (_, column) => (
            <span className="touch-dot" key={`${object.id}-${row}-${column}`} />
          ))}
        </div>
      ))}
    </div>
  );
}

function RectangleCompletion({ n }: { n: number }) {
  return (
    <div className="touch-rectangle" aria-label="Completed rectangle">
      {Array.from({ length: n }, (_, row) => (
        <div className="touch-rect-row" key={`rect-${row}`}>
          {Array.from({ length: row + 1 }, (_, column) => (
            <span className="touch-dot is-amber" key={`orange-${row}-${column}`} />
          ))}
          {Array.from({ length: n - row }, (_, column) => (
            <span className="touch-dot is-cyan" key={`blue-${row}-${column}`} />
          ))}
        </div>
      ))}
    </div>
  );
}

function DenseBeacon({ lit }: { lit: boolean }) {
  const samples = useMemo(
    () =>
      Array.from({ length: 120 }, (_, index) => {
        const row = index % 15;
        const column = Math.floor(index / 15);
        return {
          id: `beacon-${index}`,
          x: 12 + column * 10 + row * 2.8,
          y: 14 + row * 4.8,
          opacity: 0.2 + ((index * 17) % 45) / 100,
        };
      }),
    [],
  );

  return (
    <div className={`touch-beacon ${lit ? "is-lit" : ""}`} aria-hidden="true">
      {samples.map((dot) => (
        <span key={dot.id} style={{ left: `${dot.x}%`, top: `${dot.y}%`, opacity: dot.opacity }} />
      ))}
      <div className="touch-beacon-label">100 layers</div>
    </div>
  );
}

export function TouchWilderness({ state, dispatch }: Props) {
  const [drag, setDrag] = useState<DragState>({ active: false, startX: 0, startY: 0, x: 0, y: 0, near: false });
  const practice = asDotSet(state.objects["practice-8"]);
  const copy = asDotSet(state.objects["practice-8-copy"]);
  const counterexample = asDotSet(state.objects["counterexample-8"]);
  const complete = isComplete(state);
  const lensReady = hasLens(state);
  const lensApplied = Boolean(state.lensResults["beacon-100"]?.ok);
  const lensFailed = state.lensResults["counterexample-8"]?.ok === false;
  const copyNeedsFlip = copy && copy.orientation !== "left";
  const copyCanMove = Boolean(copy && !complete);

  function beginDrag(event: PointerEvent<HTMLButtonElement>) {
    if (!copyCanMove) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    if (copyNeedsFlip) {
      dispatch({ type: "flipDotSet", targetId: "practice-8-copy", axis: "y" });
    }
    setDrag({ active: true, startX: event.clientX, startY: event.clientY, x: 0, y: 0, near: false });
  }

  function moveDrag(event: PointerEvent<HTMLButtonElement>) {
    if (!drag.active || !copyCanMove) return;
    const x = event.clientX - drag.startX;
    const y = event.clientY - drag.startY;
    const near = Math.abs(x) > 52 || Math.abs(y) > 42;
    setDrag((current) => ({ ...current, x, y, near }));
    dispatch({
      type: "dragDotSet",
      targetId: "practice-8-copy",
      to: {
        x: -0.9 + Math.max(-160, Math.min(160, x)) / 120,
        y: -0.7 - Math.max(-100, Math.min(100, y)) / 180,
        z: 0,
      },
    });
  }

  function endDrag(event: PointerEvent<HTMLButtonElement>) {
    if (!drag.active) return;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    const shouldSnap = drag.near || Math.abs(drag.x) > 52 || Math.abs(drag.y) > 42;
    setDrag({ active: false, startX: 0, startY: 0, x: 0, y: 0, near: false });
    if (copyCanMove && shouldSnap) {
      dispatch({ type: "snapToRectangleCompletion", targetId: "practice-8-copy", partnerId: "practice-8" });
    }
  }

  return (
    <section className="touch-world" aria-label="Touch mathematical world">
      <DenseBeacon lit={lensApplied} />
      <div className={`touch-practice-stage ${complete ? "is-complete" : ""} ${drag.near ? "is-near" : ""}`}>
        <div className="touch-stage-question">Try the eight-layer version by hand.</div>
        <div className="touch-snap-field" aria-hidden={!copyCanMove}>
          <span />
          <strong>{drag.near ? "rows are lining up" : "complete the rows here"}</strong>
        </div>
        {complete && practice ? (
          <div className="touch-discovery">
            <RectangleCompletion n={practice.n} />
            <div className="touch-row-readout">
              <span>every row has {practice.n + 1}</span>
              <strong>{practice.n} rows × {practice.n + 1} dots</strong>
            </div>
          </div>
        ) : (
          <div className="touch-manipulatives">
            {practice && <DotRows object={practice} tone="amber" />}
            {copy && (
              <button
                aria-label="Touch and drag copied stair pattern"
                className={`touch-copy ${drag.active ? "is-dragging" : ""} ${drag.near ? "is-near" : ""}`}
                onPointerCancel={endDrag}
                onPointerDown={beginDrag}
                onPointerMove={moveDrag}
                onPointerUp={endDrag}
                style={{ transform: `translate3d(${drag.x}px, ${drag.y}px, 0) ${copy.orientation === "left" ? "scaleX(-1)" : ""}` }}
                type="button"
              >
                <DotRows object={copy} tone="cyan" />
                <span>drag this shape</span>
              </button>
            )}
          </div>
        )}
        {lensReady && <div className="touch-lens-badge">Lens formed: complete rows into a rectangle</div>}
        {state.proof && <div className="touch-horizon-chip">New horizon unlocked</div>}
        {lensFailed && counterexample && (
          <div className="touch-counterexample">
            <DotRows object={counterexample} tone="rose" compact />
            <strong>this broken stair does not complete into equal rows</strong>
          </div>
        )}
      </div>
    </section>
  );
}
