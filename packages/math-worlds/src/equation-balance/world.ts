import type { Feedback, Invariant, InvariantResult, MathWorld, TraceEvent } from "@math-wild/math-kernel";
import type {
  BalanceState,
  Block,
  EquationBalanceAction,
  EquationBalanceSpec,
  EquationMeasurements,
  Side,
} from "./types";

export function countUnits(blocks: Block[]): number {
  return blocks.filter((block) => block.kind === "unit").length;
}

export function measureEquation(state: BalanceState): EquationMeasurements {
  const leftUnits = countUnits(state.left);
  const rightUnits = countUnits(state.right);
  const leftTotal = state.xValue + leftUnits;
  const rightTotal = rightUnits;
  return {
    leftTotal,
    rightTotal,
    delta: leftTotal - rightTotal,
    leftUnits,
    rightUnits,
    removedLeft: countUnits(state.removedLeft),
    removedRight: countUnits(state.removedRight),
  };
}

export function isEquationGoalState(state: BalanceState, spec: EquationBalanceSpec): boolean {
  return (
    state.left.length === 1 &&
    state.left[0]?.kind === "unknown" &&
    state.left[0].id === spec.goalState.left[0]?.id &&
    countUnits(state.right) === spec.goalState.rightUnitCount
  );
}

function deriveStatusFromInvariants(
  state: BalanceState,
  spec: EquationBalanceSpec,
  results: InvariantResult[],
): BalanceState["status"] {
  const equality = results.find((result) => result.id === "equation.balance");
  if (equality?.ok && isEquationGoalState(state, spec)) {
    return "solved";
  }
  return equality?.ok ? "balanced" : "unbalanced";
}

function withStatus(state: Omit<BalanceState, "status"> | BalanceState, spec: EquationBalanceSpec): BalanceState {
  const draft = { ...state, status: "balanced" as const };
  const results = checkEquationInvariants(draft);
  return {
    ...draft,
    status: deriveStatusFromInvariants(draft, spec, results),
  };
}

export function checkEquationInvariants(state: BalanceState): InvariantResult[] {
  const measurement = measureEquation(state);
  return [
    {
      id: "equation.balance",
      label: "leftTotal = rightTotal",
      ok: measurement.delta === 0,
      delta: measurement.delta,
      explanation:
        measurement.delta === 0
          ? `left total is ${measurement.leftTotal}, right total is ${measurement.rightTotal}`
          : `left total is ${measurement.leftTotal}, right total is ${measurement.rightTotal}`,
      measurements: [
        { id: "leftTotal", label: "left", value: measurement.leftTotal },
        { id: "rightTotal", label: "right", value: measurement.rightTotal },
        { id: "delta", label: "delta", value: measurement.delta },
      ],
    },
  ];
}

function removeUnitFromState(state: BalanceState, spec: EquationBalanceSpec, side: Side, blockId: string): BalanceState {
  const source = state[side];
  const block = source.find((candidate) => candidate.id === blockId);
  if (!block || block.kind !== "unit") {
    return state;
  }

  return withStatus(
    {
      left: side === "left" ? state.left.filter((candidate) => candidate.id !== blockId) : state.left,
      right: side === "right" ? state.right.filter((candidate) => candidate.id !== blockId) : state.right,
      removedLeft: side === "left" ? [...state.removedLeft, block] : state.removedLeft,
      removedRight: side === "right" ? [...state.removedRight, block] : state.removedRight,
      xValue: state.xValue,
    },
    spec,
  );
}

function restoreBlockToState(state: BalanceState, spec: EquationBalanceSpec, side: Side): BalanceState {
  const removedKey = side === "left" ? "removedLeft" : "removedRight";
  const removed = state[removedKey];
  const block = removed.at(-1);
  if (!block) {
    return state;
  }

  return withStatus(
    {
      left: side === "left" ? [...state.left, block] : state.left,
      right: side === "right" ? [...state.right, block] : state.right,
      removedLeft: side === "left" ? state.removedLeft.slice(0, -1) : state.removedLeft,
      removedRight: side === "right" ? state.removedRight.slice(0, -1) : state.removedRight,
      xValue: state.xValue,
    },
    spec,
  );
}

export class EquationBalanceWorld implements MathWorld<BalanceState, EquationBalanceAction> {
  readonly id: string;
  readonly invariants: Invariant<BalanceState>[];

  constructor(private readonly spec: EquationBalanceSpec) {
    this.id = spec.id;
    this.invariants = [
      {
        id: "equation.balance",
        label: "leftTotal = rightTotal",
        check: (state) => checkEquationInvariants(state)[0],
      },
    ];
  }

  createInitialState(): BalanceState {
    return withStatus(
      {
        left: [...this.spec.initialState.left],
        right: [...this.spec.initialState.right],
        removedLeft: [],
        removedRight: [],
        xValue: this.spec.unknowns.x,
      },
      this.spec,
    );
  }

  checkInvariants(state: BalanceState): InvariantResult[] {
    return this.invariants.map((invariant) => invariant.check(state));
  }

  getFeedback(state: BalanceState, results = this.checkInvariants(state)): Feedback {
    const equality = results.find((result) => result.id === "equation.balance");
    const delta = equality?.delta ?? 0;
    if (equality?.ok && isEquationGoalState(state, this.spec)) {
      return {
        kind: "reveal",
        intensity: 1,
        message: `x = ${this.spec.unknowns.x}`,
      };
    }
    if (equality?.ok) {
      return {
        kind: "balanced",
        intensity: 0,
        message: equality.explanation,
      };
    }
    return {
      kind: "broken-equality",
      intensity: Math.min(Math.abs(delta), 4),
      message: equality?.explanation,
    };
  }

  applyAction(state: BalanceState, action: EquationBalanceAction): BalanceState {
    if (action.type === "removeUnit") {
      return removeUnitFromState(state, this.spec, action.side, action.blockId);
    }
    if (action.type === "restoreBlock") {
      return restoreBlockToState(state, this.spec, action.side);
    }
    if (action.type === "reset") {
      return this.createInitialState();
    }
    return withStatus(state, this.spec);
  }

  act(state: BalanceState, action: EquationBalanceAction, timestamp = Date.now()): TraceEvent<BalanceState, EquationBalanceAction> {
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

  replay(initial: BalanceState, actions: EquationBalanceAction[]): TraceEvent<BalanceState, EquationBalanceAction>[] {
    const events: TraceEvent<BalanceState, EquationBalanceAction>[] = [];
    let state = initial;
    for (const action of actions) {
      const event = this.act(state, action);
      events.push(event);
      state = event.after;
    }
    return events;
  }
}
