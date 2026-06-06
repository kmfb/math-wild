import type { BalanceState, Block, EquationBalanceSpec, Side } from "./types";

export function countUnits(blocks: Block[]): number {
  return blocks.filter((block) => block.kind === "unit").length;
}

export function sideValue(side: Side, state: BalanceState): number {
  const units = countUnits(state[side]);
  return side === "left" ? state.xValue + units : units;
}

export function isGoalState(state: BalanceState, spec: EquationBalanceSpec): boolean {
  return (
    state.left.length === 1 &&
    state.left[0]?.kind === "unknown" &&
    state.left[0].id === spec.goalState.left[0]?.id &&
    countUnits(state.right) === spec.goalState.rightUnitCount
  );
}

export function deriveStatus(state: Omit<BalanceState, "status">, spec: EquationBalanceSpec): BalanceState["status"] {
  const withStatus = { ...state, status: "balanced" as const };
  if (isGoalState(withStatus, spec) && sideValue("left", withStatus) === sideValue("right", withStatus)) {
    return "solved";
  }
  return sideValue("left", withStatus) === sideValue("right", withStatus) ? "balanced" : "unbalanced";
}

export function createInitialState(spec: EquationBalanceSpec): BalanceState {
  const state = {
    left: [...spec.initialState.left],
    right: [...spec.initialState.right],
    removedLeft: [],
    removedRight: [],
    xValue: spec.unknowns.x,
  };
  return {
    ...state,
    status: deriveStatus(state, spec),
  };
}

export function removeUnit(state: BalanceState, spec: EquationBalanceSpec, side: Side, blockId: string): BalanceState {
  const source = state[side];
  const block = source.find((candidate) => candidate.id === blockId);
  if (!block || block.kind !== "unit") {
    return state;
  }

  const next = {
    left: side === "left" ? state.left.filter((candidate) => candidate.id !== blockId) : state.left,
    right: side === "right" ? state.right.filter((candidate) => candidate.id !== blockId) : state.right,
    removedLeft: side === "left" ? [...state.removedLeft, block] : state.removedLeft,
    removedRight: side === "right" ? [...state.removedRight, block] : state.removedRight,
    xValue: state.xValue,
  };

  return {
    ...next,
    status: deriveStatus(next, spec),
  };
}

export function restoreBlock(state: BalanceState, spec: EquationBalanceSpec, side: Side): BalanceState {
  const removedKey = side === "left" ? "removedLeft" : "removedRight";
  const removed = state[removedKey];
  const block = removed.at(-1);
  if (!block) {
    return state;
  }
  const next = {
    left: side === "left" ? [...state.left, block] : state.left,
    right: side === "right" ? [...state.right, block] : state.right,
    removedLeft: side === "left" ? state.removedLeft.slice(0, -1) : state.removedLeft,
    removedRight: side === "right" ? state.removedRight.slice(0, -1) : state.removedRight,
    xValue: state.xValue,
  };
  return {
    ...next,
    status: deriveStatus(next, spec),
  };
}

export function revealX(state: BalanceState, spec: EquationBalanceSpec): BalanceState {
  return {
    ...state,
    status: deriveStatus(state, spec),
  };
}
