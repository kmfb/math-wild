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
  const checks = [
    {
      id: "value_consistency",
      pass: state.status === "unbalanced" || sideValue("left", state) === sideValue("right", state),
      value: { left: sideValue("left", state), right: sideValue("right", state), status: state.status },
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
