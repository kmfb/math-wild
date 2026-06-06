import {
  countUnits,
  EquationBalanceWorld,
  isEquationGoalState,
  measureEquation,
} from "@math-wild/math-worlds/equation-balance";
import type { BalanceState, EquationBalanceSpec, Side } from "./types";

export { countUnits, measureEquation };

export function sideValue(side: Side, state: BalanceState): number {
  const measurement = measureEquation(state);
  return side === "left" ? measurement.leftTotal : measurement.rightTotal;
}

export function isGoalState(state: BalanceState, spec: EquationBalanceSpec): boolean {
  return isEquationGoalState(state, spec);
}

export function deriveStatus(state: Omit<BalanceState, "status">, spec: EquationBalanceSpec): BalanceState["status"] {
  const world = new EquationBalanceWorld(spec);
  return world.applyAction({ ...state, status: "balanced" }, { type: "revealX" }).status;
}

export function createInitialState(spec: EquationBalanceSpec): BalanceState {
  return new EquationBalanceWorld(spec).createInitialState();
}

export function removeUnit(state: BalanceState, spec: EquationBalanceSpec, side: Side, blockId: string): BalanceState {
  return new EquationBalanceWorld(spec).applyAction(state, { type: "removeUnit", side, blockId });
}

export function restoreBlock(state: BalanceState, spec: EquationBalanceSpec, side: Side): BalanceState {
  return new EquationBalanceWorld(spec).applyAction(state, { type: "restoreBlock", side });
}

export function revealX(state: BalanceState, spec: EquationBalanceSpec): BalanceState {
  return new EquationBalanceWorld(spec).applyAction(state, { type: "revealX" });
}
