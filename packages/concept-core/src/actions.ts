import type { BalanceState, EquationBalanceSpec, Side } from "./types";
import { removeUnit, restoreBlock, revealX } from "./equationBalance";

export type LabAction =
  | { type: "removeUnit"; side: Side; blockId: string }
  | { type: "undo"; side?: Side }
  | { type: "revealX" };

export function applyAction(state: BalanceState, spec: EquationBalanceSpec, action: LabAction): BalanceState {
  if (action.type === "removeUnit") {
    return removeUnit(state, spec, action.side, action.blockId);
  }
  if (action.type === "undo") {
    const side = action.side ?? (state.removedRight.length > state.removedLeft.length ? "right" : "left");
    return restoreBlock(state, spec, side);
  }
  return revealX(state, spec);
}
