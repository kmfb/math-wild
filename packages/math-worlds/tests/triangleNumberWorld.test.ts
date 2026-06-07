import { describe, expect, it } from "vitest";
import specJson from "../../concept-specs/triangle_number_sum.json";
import { measureTriangleNumber, TriangleNumberWorld, type TriangleNumberSpec } from "../src/triangle-number";

const spec = specJson as TriangleNumberSpec;

describe("TriangleNumberWorld", () => {
  it("starts with an 8-layer triangle", () => {
    const world = new TriangleNumberWorld(spec);
    const state = world.createInitialState();
    const measurement = measureTriangleNumber(state);

    expect(state).toEqual({ n: 8, stage: "idle" });
    expect(measurement.triangleDots).toBe(36);
    expect(measurement.rectangleRows).toBe(8);
    expect(measurement.rectangleColumns).toBe(9);
  });

  it("preserves dot count when snapped into a rectangle", () => {
    const world = new TriangleNumberWorld(spec);
    const events = world.replay(world.createInitialState(), [
      { type: "revealCopy" },
      { type: "startDraggingCopy" },
      { type: "approachSolution" },
      { type: "snapToRectangle" },
    ]);
    const last = events.at(-1);
    const invariant = last?.invariantResults[0];

    expect(last?.after.stage).toBe("snapped");
    expect(invariant?.ok).toBe(true);
    expect(invariant?.leftValue).toBe(72);
    expect(invariant?.rightValue).toBe(72);
    expect(last?.feedback.message).toBe("两个三角形拼成 8 × 9 的长方形");
  });

  it("reveals the copy before the drag puzzle starts", () => {
    const world = new TriangleNumberWorld(spec);
    let state = world.createInitialState();

    state = world.applyAction(state, { type: "revealCopy" });
    expect(state.stage).toBe("invitingCopy");

    state = world.applyAction(state, { type: "startDraggingCopy" });
    expect(state.stage).toBe("draggingCopy");
  });

  it("derives the 100 layer value", () => {
    const world = new TriangleNumberWorld(spec);
    let state = world.createInitialState();
    state = world.applyAction(state, { type: "hundredClimax" });
    state = world.applyAction(state, { type: "startDeriving" });
    state = world.applyAction(state, { type: "finishDeriving" });
    const measurement = measureTriangleNumber(state);

    expect(measurement.value).toBe(5050);
    expect(measurement.formula).toBe("100 × 101 ÷ 2 = 5050");
    expect(world.getFeedback(state).message).toBe("T = 100 × 101 ÷ 2 = 5050");
  });
});
