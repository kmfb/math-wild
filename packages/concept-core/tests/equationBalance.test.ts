import { describe, expect, it } from "vitest";
import specJson from "../../concept-specs/equation_balance_x_plus_3_eq_8.json";
import { createInitialState, removeUnit, verifySpec, type EquationBalanceSpec } from "../src";

const spec = specJson as EquationBalanceSpec;

describe("equation balance", () => {
  it("starts balanced", () => {
    const state = createInitialState(spec);
    expect(state.status).toBe("balanced");
  });

  it("becomes unbalanced when only one left unit is removed", () => {
    const state = removeUnit(createInitialState(spec), spec, "left", "l1");
    expect(state.status).toBe("unbalanced");
  });

  it("stays balanced after removing three units from both sides", () => {
    let state = createInitialState(spec);
    for (const id of ["l1", "l2", "l3"]) {
      state = removeUnit(state, spec, "left", id);
    }
    for (const id of ["r1", "r2", "r3"]) {
      state = removeUnit(state, spec, "right", id);
    }
    expect(state.status).toBe("solved");
    expect(state.left).toHaveLength(1);
    expect(state.right).toHaveLength(5);
  });

  it("verifies the concept spec", () => {
    expect(verifySpec(spec).status).toBe("PASS");
  });
});
