import type { Feedback, Invariant, InvariantResult, MathWorld, TraceEvent } from "@math-wild/math-kernel";
import type {
  TriangleMeasurements,
  TriangleNumberAction,
  TriangleNumberSpec,
  TriangleNumberState,
  TriangleStage,
} from "./types";

const STAGE_ORDER: TriangleStage[] = [
  "idle",
  "draggingCopy",
  "nearSolution",
  "snapped",
  "deriving",
  "derived",
  "hundredClimax",
];

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(Math.round(value), min), max);
}

export function measureTriangleNumber(state: TriangleNumberState): TriangleMeasurements {
  const triangleDots = (state.n * (state.n + 1)) / 2;
  const doubledDots = triangleDots * 2;
  return {
    n: state.n,
    triangleDots,
    doubledDots,
    rectangleRows: state.n,
    rectangleColumns: state.n + 1,
    rectangleDots: state.n * (state.n + 1),
    formula: `${state.n} × ${state.n + 1} ÷ 2 = ${triangleDots}`,
    value: triangleDots,
    usesAbstractView: state.n > 20,
  };
}

export function checkTriangleInvariants(state: TriangleNumberState): InvariantResult[] {
  const measurement = measureTriangleNumber(state);
  const rectangleVisible = ["nearSolution", "snapped", "deriving", "derived", "hundredClimax"].includes(state.stage);
  const ok = !rectangleVisible || measurement.doubledDots === measurement.rectangleDots;
  return [
    {
      id: "triangle.dotCount",
      label: "two triangles preserve dot count",
      ok,
      leftValue: measurement.doubledDots,
      rightValue: rectangleVisible ? measurement.rectangleDots : measurement.doubledDots,
      delta: measurement.doubledDots - (rectangleVisible ? measurement.rectangleDots : measurement.doubledDots),
      intensity: rectangleVisible ? 1 : 0,
      repairSuggestions: [],
      explanation: rectangleVisible
        ? `two triangles have ${measurement.doubledDots} dots; the rectangle has ${measurement.rectangleDots}`
        : `one triangle has ${measurement.triangleDots} dots`,
      measurements: [
        { id: "triangleDots", label: "triangle dots", value: measurement.triangleDots },
        { id: "rectangleRows", label: "rows", value: measurement.rectangleRows },
        { id: "rectangleColumns", label: "columns", value: measurement.rectangleColumns },
      ],
    },
  ];
}

function nextStageFor(action: TriangleNumberAction, current: TriangleStage): TriangleStage {
  if (action.type === "startDraggingCopy") return "draggingCopy";
  if (action.type === "approachSolution") return "nearSolution";
  if (action.type === "leaveSolution") return current === "nearSolution" ? "draggingCopy" : current;
  if (action.type === "snapToRectangle") return current === "nearSolution" || current === "draggingCopy" ? "snapped" : current;
  if (action.type === "startDeriving") return current === "snapped" || current === "hundredClimax" ? "deriving" : current;
  if (action.type === "finishDeriving") return current === "deriving" || current === "snapped" ? "derived" : current;
  if (action.type === "hundredClimax") return "hundredClimax";
  if (action.type === "playDemo") return "snapped";
  return current;
}

export class TriangleNumberWorld implements MathWorld<TriangleNumberState, TriangleNumberAction> {
  readonly id: string;
  readonly invariants: Invariant<TriangleNumberState>[];

  constructor(private readonly spec: TriangleNumberSpec) {
    this.id = spec.id;
    this.invariants = [
      {
        id: "triangle.dotCount",
        label: "dotCount preserved under duplicate / flip / snap",
        check: (state) => checkTriangleInvariants(state)[0],
      },
    ];
  }

  createInitialState(): TriangleNumberState {
    return { n: this.spec.initialN, stage: "idle" };
  }

  checkInvariants(state: TriangleNumberState): InvariantResult[] {
    return this.invariants.map((invariant) => invariant.check(state));
  }

  getFeedback(state: TriangleNumberState, _results = this.checkInvariants(state)): Feedback {
    const measurement = measureTriangleNumber(state);
    if (state.stage === "hundredClimax") {
      return {
        kind: "reveal",
        intensity: 1,
        message: "100 × 101 = 10100, half is 5050",
      };
    }
    if (state.stage === "derived") {
      return {
        kind: "reveal",
        intensity: 1,
        message: `T = ${measurement.n} × ${measurement.n + 1} ÷ 2 = ${measurement.value}`,
      };
    }
    if (state.stage === "snapped" || state.stage === "deriving") {
      return {
        kind: "balanced",
        intensity: 0.8,
        message: `两个三角形拼成 ${measurement.n} × ${measurement.n + 1} 的长方形`,
      };
    }
    return {
      kind: "ghost-action",
      intensity: STAGE_ORDER.indexOf(state.stage) / (STAGE_ORDER.length - 1),
      message: "别数。换个看法。",
    };
  }

  applyAction(state: TriangleNumberState, action: TriangleNumberAction): TriangleNumberState {
    if (action.type === "reset") {
      return this.createInitialState();
    }
    if (action.type === "setN") {
      return {
        n: clamp(action.n, this.spec.minN, this.spec.maxN),
        stage: state.stage,
      };
    }
    if (action.type === "hundredClimax") {
      return {
        n: 100,
        stage: "hundredClimax",
      };
    }
    return {
      ...state,
      stage: nextStageFor(action, state.stage),
    };
  }

  act(
    state: TriangleNumberState,
    action: TriangleNumberAction,
    timestamp = Date.now(),
  ): TraceEvent<TriangleNumberState, TriangleNumberAction> {
    const before = state;
    const after = this.applyAction(state, action);
    const invariantResults = this.checkInvariants(after);
    return {
      action,
      before,
      after,
      invariantResults,
      feedback: this.getFeedback(after, invariantResults),
      timestamp,
    };
  }

  replay(
    initial: TriangleNumberState,
    actions: TriangleNumberAction[],
  ): TraceEvent<TriangleNumberState, TriangleNumberAction>[] {
    const events: TraceEvent<TriangleNumberState, TriangleNumberAction>[] = [];
    let state = initial;
    for (const action of actions) {
      const event = this.act(state, action);
      events.push(event);
      state = event.after;
    }
    return events;
  }
}
