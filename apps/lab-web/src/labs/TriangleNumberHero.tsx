import { useEffect, useMemo, useRef, useState } from "react";
import { useDrag } from "@use-gesture/react";
import { create } from "zustand";
import type { Feedback, InvariantResult, TraceEvent } from "@math-wild/math-kernel";
import {
  measureTriangleNumber,
  TriangleNumberWorld,
  type TriangleMeasurements,
  type TriangleNumberAction,
  type TriangleNumberSpec,
  type TriangleNumberState,
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

type VisualDot = {
  id: string;
  source: "orange" | "blue";
  x: number;
  y: number;
};

const VIEWBOX = { width: 1000, height: 560 };
const ORANGE_BOX = { x: 130, y: 130, width: 270, height: 300 };
const BLUE_BOX = { x: 600, y: 130, width: 270, height: 300 };
const RECT_BOX = { x: 225, y: 105, width: 550, height: 340 };
const SNAP_DISTANCE = 145;

const RECTANGLE_STAGES: TriangleNumberState["stage"][] = [
  "nearSolution",
  "snapped",
  "deriving",
  "derived",
  "hundredClimax",
];

const LOCKED_RECTANGLE_STAGES: TriangleNumberState["stage"][] = [
  "snapped",
  "deriving",
  "derived",
  "hundredClimax",
];

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

function stageInstruction(state: TriangleNumberState) {
  if (state.stage === "idle") return "如果一层一层数，100 层会很慢。";
  if (state.stage === "invitingCopy") return "如果有另一个一样的三角形呢？拖动蓝色影子。";
  if (state.stage === "draggingCopy") return "继续拖。靠近虚线矩形时，它会自己对齐。";
  if (state.stage === "nearSolution") return "对，就是这里。松手吸附。";
  if (state.stage === "snapped") return "每一行都补齐成 n + 1 个点。";
  if (state.stage === "deriving") return "读这个长方形：n 行，每行 n + 1。";
  if (state.stage === "hundredClimax") return "100 层不用数。它也是一个长方形的一半。";
  return "一个三角形，就是这个长方形的一半。";
}

function actionLabel(action: TriangleNumberAction) {
  if (action.type === "revealCopy") return "出现副本";
  if (action.type === "startDraggingCopy") return "拖动";
  if (action.type === "approachSolution") return "靠近";
  if (action.type === "snapToRectangle") return "吸附";
  if (action.type === "startDeriving") return "读长方形";
  if (action.type === "finishDeriving") return "公式浮现";
  if (action.type === "hundredClimax") return "100 层";
  if (action.type === "playDemo") return "看一次";
  if (action.type === "reset") return "重置";
  if (action.type === "setN") return `n=${action.n}`;
  return "离开";
}

function gridPoint(row: number, column: number, rows: number, columns: number, box: typeof RECT_BOX) {
  const xStep = columns <= 1 ? 0 : box.width / (columns - 1);
  const yStep = rows <= 1 ? 0 : box.height / (rows - 1);
  return {
    x: box.x + column * xStep,
    y: box.y + row * yStep,
  };
}

function buildDots(n: number, stage: TriangleNumberState["stage"]): VisualDot[] {
  const isRectangle = RECTANGLE_STAGES.includes(stage);
  const copyVisible = stage !== "idle";
  const dots: VisualDot[] = [];
  const rectangleColumns = n + 1;

  for (let row = 0; row < n; row += 1) {
    for (let column = 0; column <= row; column += 1) {
      const point = isRectangle
        ? gridPoint(row, column, n, rectangleColumns, RECT_BOX)
        : gridPoint(row, column, n, n, ORANGE_BOX);
      dots.push({ id: `orange-${row}-${column}`, source: "orange", ...point });
    }
  }

  if (copyVisible) {
    for (let row = 0; row < n; row += 1) {
      for (let index = 0; index < n - row; index += 1) {
        const rectangleColumn = row + 1 + index;
        const point = isRectangle
          ? gridPoint(row, rectangleColumn, n, rectangleColumns, RECT_BOX)
          : gridPoint(row, index, n, n, BLUE_BOX);
        dots.push({ id: `blue-${row}-${index}`, source: "blue", ...point });
      }
    }
  }

  return dots;
}

function buildDenseDots(): VisualDot[] {
  const rows = 24;
  const columns = 25;
  return Array.from({ length: rows }, (_, row) =>
    Array.from({ length: columns }, (_, column) => {
      const point = gridPoint(row, column, rows, columns, RECT_BOX);
      return {
        id: `dense-${row}-${column}`,
        source: column <= row ? "orange" : "blue",
        ...point,
      } satisfies VisualDot;
    }),
  ).flat();
}

function formulaText(state: TriangleNumberState, measurements: TriangleMeasurements) {
  if (state.stage === "idle") {
    return `${state.n} 层还好，100 层呢？`;
  }
  if (state.stage === "invitingCopy" || state.stage === "draggingCopy" || state.stage === "nearSolution") {
    return "两个一样的三角形会变成什么？";
  }
  if (state.stage === "snapped") return `每行 ${state.n + 1} 个点`;
  if (state.stage === "deriving") return `${state.n} 行，每行 ${state.n + 1} 个`;
  if (state.stage === "hundredClimax") return "1 + 2 + ... + 100 = 5050";
  return `一个三角形 = ${state.n} × ${state.n + 1} ÷ 2 = ${measurements.value}`;
}

function DotStage({
  state,
  measurements,
  act,
}: {
  state: TriangleNumberState;
  measurements: TriangleMeasurements;
  act: (action: TriangleNumberAction) => void;
}) {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const stageRef = useRef(state.stage);
  const [drag, setDrag] = useState({ active: false, x: 0, y: 0, near: false });
  const isRectangle = RECTANGLE_STAGES.includes(state.stage);
  const isLockedRectangle = LOCKED_RECTANGLE_STAGES.includes(state.stage);
  const copyVisible = state.stage !== "idle";
  const dots = useMemo(() => {
    if (state.n > 24 && isRectangle) return buildDenseDots();
    return buildDots(state.n, state.stage);
  }, [isRectangle, state.n, state.stage]);

  useEffect(() => {
    stageRef.current = state.stage;
  }, [state.stage]);

  const bindBlueDrag = useDrag(
    ({ active, first, last, movement: [moveX, moveY], cancel }) => {
      if (isLockedRectangle) {
        cancel();
        return;
      }

      const rect = svgRef.current?.getBoundingClientRect();
      const scale = rect ? VIEWBOX.width / rect.width : 1;
      const delta = { x: moveX * scale, y: moveY * scale };
      const near = delta.x < -SNAP_DISTANCE || Math.hypot(delta.x, delta.y) > 190;

      if (first && (stageRef.current === "idle" || stageRef.current === "invitingCopy")) {
        act({ type: "startDraggingCopy" });
        stageRef.current = "draggingCopy";
      }

      if (active && near && stageRef.current !== "nearSolution") {
        act({ type: "approachSolution" });
        stageRef.current = "nearSolution";
      }

      if (active && !near && stageRef.current === "nearSolution") {
        act({ type: "leaveSolution" });
        stageRef.current = "draggingCopy";
      }

      setDrag({ active, ...delta, near });

      if (last) {
        const shouldSnap = near || stageRef.current === "nearSolution";
        act(shouldSnap ? { type: "snapToRectangle" } : { type: "leaveSolution" });
        stageRef.current = shouldSnap ? "snapped" : "draggingCopy";
        setDrag({ active: false, x: 0, y: 0, near: false });
      }
    },
    {
      eventOptions: { passive: false },
      pointer: { capture: false },
      preventDefault: true,
    },
  );

  return (
    <section className={`pp-stage is-${state.stage}`} aria-label="Triangle number gesture proof">
      <svg
        ref={svgRef}
        viewBox={`0 0 ${VIEWBOX.width} ${VIEWBOX.height}`}
        role="img"
      >
        <rect className="pp-stage-bg" x="0" y="0" width={VIEWBOX.width} height={VIEWBOX.height} rx="28" />
        <text className="pp-question" x="500" y="54" textAnchor="middle">
          这堆点有多少个？
        </text>
        <text className="pp-subquestion" x="500" y="92" textAnchor="middle">
          {state.stage === "idle" ? "别急着数。先找一种换看法。" : "两个一样的三角形，能不能补成更容易数的东西？"}
        </text>
        <g className="pp-target">
          <rect x={RECT_BOX.x - 34} y={RECT_BOX.y - 34} width={RECT_BOX.width + 68} height={RECT_BOX.height + 68} rx="24" />
          <text x={RECT_BOX.x + RECT_BOX.width / 2} y={RECT_BOX.y + RECT_BOX.height + 64} textAnchor="middle">
            {state.n} 行 · 每行 {state.n + 1}
          </text>
        </g>
        {copyVisible && !isLockedRectangle && (
          <g className="pp-copy-callout">
            <path d="M 586 94 L 900 94 L 586 464 Z" />
            <text x="742" y="88" textAnchor="middle">
              另一个一样的三角形
            </text>
          </g>
        )}
        {isRectangle && (
          <line className="pp-diagonal" x1={RECT_BOX.x} y1={RECT_BOX.y} x2={RECT_BOX.x + RECT_BOX.width} y2={RECT_BOX.y + RECT_BOX.height} />
        )}
        {(state.stage === "snapped" || state.stage === "deriving" || state.stage === "derived" || state.stage === "hundredClimax") && (
          <g className="pp-rectangle-readout">
            <path d={`M ${RECT_BOX.x - 24} ${RECT_BOX.y} L ${RECT_BOX.x - 24} ${RECT_BOX.y + RECT_BOX.height}`} />
            <path d={`M ${RECT_BOX.x} ${RECT_BOX.y - 24} L ${RECT_BOX.x + RECT_BOX.width} ${RECT_BOX.y - 24}`} />
            <text x={RECT_BOX.x - 52} y={RECT_BOX.y + RECT_BOX.height / 2} textAnchor="middle">
              {state.n} 行
            </text>
            <text x={RECT_BOX.x + RECT_BOX.width / 2} y={RECT_BOX.y - 42} textAnchor="middle">
              每行 {state.n + 1} 个
            </text>
          </g>
        )}
        {dots.map((dot) => {
          const x = dot.source === "blue" && drag.active && !isRectangle ? dot.x + drag.x : dot.x;
          const y = dot.source === "blue" && drag.active && !isRectangle ? dot.y + drag.y : dot.y;
          return (
            <circle
              className={`pp-dot is-${dot.source}`}
              cx={x}
              cy={y}
              key={dot.id}
              r={state.n > 24 && isRectangle ? 5 : 9}
            />
          );
        })}
        <text className="pp-hint" x="500" y="526" textAnchor="middle">
          {stageInstruction(state)}
        </text>
      </svg>
      {copyVisible && !isLockedRectangle && (
        <button
          aria-label="拖动蓝色三角形"
          className="pp-blue-drag-surface"
          onClick={() => act({ type: "snapToRectangle" })}
          type="button"
          {...bindBlueDrag()}
        />
      )}
    </section>
  );
}

function TracePills({ trace }: { trace: TraceEvent<TriangleNumberState, TriangleNumberAction>[] }) {
  return (
    <div className="pp-trace" aria-label="Proof trace">
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

  useEffect(() => {
    if (state.stage !== "idle") return undefined;
    const timer = window.setTimeout(() => act({ type: "revealCopy" }), 1100);
    return () => window.clearTimeout(timer);
  }, [act, state.stage]);

  useEffect(() => {
    if (state.stage !== "snapped") return undefined;
    const timer = window.setTimeout(() => act({ type: "startDeriving" }), 850);
    return () => window.clearTimeout(timer);
  }, [act, state.stage]);

  useEffect(() => {
    if (state.stage !== "deriving") return undefined;
    const timer = window.setTimeout(() => act({ type: "finishDeriving" }), 1200);
    return () => window.clearTimeout(timer);
  }, [act, state.stage]);

  return (
    <main className="pp-shell">
      <section className="pp-hero" aria-label="Triangle number playable proof">
        <header className="pp-copy">
          <p>Playable Proof</p>
          <h1>{spec.title}</h1>
          <span>{spec.subtitle}</span>
        </header>
        <DotStage state={state} measurements={measurements} act={act} />
        <section className="pp-controls" aria-label="Proof controls">
          <div className="pp-formula">{formulaText(state, measurements)}</div>
          <div className="pp-invariant">
            <span>dot count preserved</span>
            <strong>{invariant.leftValue} = {invariant.rightValue}</strong>
          </div>
          <label className="pp-slider" htmlFor="triangle-n">
            n = {state.n}
            <input
              id="triangle-n"
              max={spec.maxN}
              min={spec.minN}
              onChange={(event) => act({ type: "setN", n: Number(event.currentTarget.value) })}
              type="range"
              value={state.n}
            />
          </label>
          <div className="pp-buttons">
            <button type="button" onClick={() => act({ type: "playDemo" })}>看一次</button>
            <button type="button" onClick={() => act({ type: "reset" })}>重置</button>
            <button type="button" onClick={() => act({ type: "hundredClimax" })}>试试 100 层</button>
          </div>
          <TracePills trace={trace} />
        </section>
      </section>
    </main>
  );
}
