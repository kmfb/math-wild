import { describe, expect, it } from "vitest";
import specJson from "../../concept-specs/equation_balance_x_plus_3_eq_8.json";
import { EquationBalanceWorld, type EquationBalanceSpec } from "../src/equation-balance";

const spec = specJson as EquationBalanceSpec;

describe("EquationBalanceWorld", () => {
  it("reports the initial invariant as balanced", () => {
    const world = new EquationBalanceWorld(spec);
    const state = world.createInitialState();
    const [result] = world.checkInvariants(state);

    expect(result.ok).toBe(true);
    expect(result.delta).toBe(0);
    expect(world.getFeedback(state, [result]).kind).toBe("balanced");
  });

  it("records a broken invariant when one left unit is removed", () => {
    const world = new EquationBalanceWorld(spec);
    const event = world.act(world.createInitialState(), {
      type: "removeUnit",
      side: "left",
      blockId: "l1",
    }, 100);
    const [result] = event.invariantResults;

    expect(event.timestamp).toBe(100);
    expect(event.action).toEqual({ type: "removeUnit", side: "left", blockId: "l1" });
    expect(result.ok).toBe(false);
    expect(result.delta).toBe(-1);
    expect(result.explanation).toBe("left total is 7, right total is 8");
    expect(event.feedback.kind).toBe("broken-equality");
    expect(event.after.status).toBe("unbalanced");
  });

  it("restores the invariant when the matching right unit is removed", () => {
    const world = new EquationBalanceWorld(spec);
    const first = world.act(world.createInitialState(), { type: "removeUnit", side: "left", blockId: "l1" });
    const second = world.act(first.after, { type: "removeUnit", side: "right", blockId: "r1" });
    const [result] = second.invariantResults;

    expect(result.ok).toBe(true);
    expect(result.delta).toBe(0);
    expect(result.explanation).toBe("left total is 7, right total is 7");
    expect(second.feedback.kind).toBe("balanced");
    expect(second.after.status).toBe("balanced");
  });

  it("can replay a trace of actions to the solved state", () => {
    const world = new EquationBalanceWorld(spec);
    const events = world.replay(world.createInitialState(), [
      { type: "removeUnit", side: "left", blockId: "l1" },
      { type: "removeUnit", side: "right", blockId: "r1" },
      { type: "removeUnit", side: "left", blockId: "l2" },
      { type: "removeUnit", side: "right", blockId: "r2" },
      { type: "removeUnit", side: "left", blockId: "l3" },
      { type: "removeUnit", side: "right", blockId: "r3" },
    ]);
    const last = events.at(-1);

    expect(events).toHaveLength(6);
    expect(last?.after.status).toBe("solved");
    expect(last?.feedback.kind).toBe("reveal");
    expect(last?.feedback.message).toBe("x = 5");
  });
});
