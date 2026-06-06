import { EquationBalanceWorld } from "@math-wild/math-worlds/equation-balance";
import { countUnits, createInitialState, isGoalState, sideValue } from "./equationBalance";
import type { BalanceState, EquationBalanceSpec, VerificationResult } from "./types";

export function verifySpec(spec: EquationBalanceSpec): VerificationResult {
  const initial = createInitialState(spec);
  const checks = [
    {
      id: "type",
      pass: spec.type === "equation_balance",
      value: spec.type,
    },
    {
      id: "initial_balance",
      pass: sideValue("left", initial) === sideValue("right", initial),
      value: { left: sideValue("left", initial), right: sideValue("right", initial) },
    },
    {
      id: "goal_units",
      pass: spec.goalState.rightUnitCount === spec.unknowns.x,
      reason: "right side must leave exactly x unit blocks",
      value: spec.goalState.rightUnitCount,
    },
  ];
  return {
    status: checks.every((check) => check.pass) ? "PASS" : "FAIL",
    checks,
  };
}

export function verifyState(state: BalanceState, spec: EquationBalanceSpec): VerificationResult {
  const world = new EquationBalanceWorld(spec);
  const invariantResults = world.checkInvariants(state);
  const equality = invariantResults.find((result) => result.id === "equation.balance");
  const checks = [
    {
      id: "invariant_status_consistency",
      pass:
        (equality?.ok && state.status !== "unbalanced") ||
        (!equality?.ok && state.status === "unbalanced"),
      value: { invariant: equality, status: state.status },
    },
    {
      id: "removed_counts",
      pass: countUnits(state.removedLeft) <= 3 && countUnits(state.removedRight) <= 8,
      value: { left: countUnits(state.removedLeft), right: countUnits(state.removedRight) },
    },
    {
      id: "solved_shape",
      pass: state.status !== "solved" || isGoalState(state, spec),
      value: state.status,
    },
  ];
  return {
    status: checks.every((check) => check.pass) ? "PASS" : "FAIL",
    checks,
  };
}
