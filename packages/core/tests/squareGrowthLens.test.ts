import { describe, expect, it } from "vitest";
import {
  applySquareGrowthLens,
  createInitialSquareGrowthState,
  dispatchSquareGrowth,
  squareGrowthLensAppliesTo,
} from "../src";

describe("Square Growth Lens", () => {
  it("applies the Lens to a 100 by 100 square", () => {
    const result = applySquareGrowthLens(100);
    expect(result.ok).toBe(true);
    expect(result.lastOdd).toBe(199);
    expect(result.expression).toBe("1 + 3 + 5 + ... + 199");
    expect(result.value).toBe(10000);
  });

  it("applies the Lens to practice growth", () => {
    const result = applySquareGrowthLens(6);
    expect(result.lastOdd).toBe(11);
    expect(result.expression).toBe("1 + 3 + 5 + 7 + 9 + 11");
    expect(result.value).toBe(36);
  });

  it("records semantic square-shell actions in trace", () => {
    let state = createInitialSquareGrowthState();
    state = dispatchSquareGrowth(state, { type: "growSquareShell", from: 1, to: 2 });
    state = dispatchSquareGrowth(state, { type: "growSquareShell", from: 2, to: 3 });
    state = dispatchSquareGrowth(state, { type: "applySquareGrowthLens", targetN: 100 });

    expect(state.n).toBe(3);
    expect(state.lensResult?.value).toBe(10000);
    expect(state.trace.map((event) => event.action.type)).toEqual([
      "growSquareShell",
      "growSquareShell",
      "applySquareGrowthLens",
    ]);
  });

  it("resets the square growth world", () => {
    let state = createInitialSquareGrowthState();
    state = dispatchSquareGrowth(state, { type: "growSquareShell", from: 1, to: 2 });
    state = dispatchSquareGrowth(state, { type: "resetSquareGrowth" });

    expect(state.n).toBe(1);
    expect(state.lensResult).toBeUndefined();
    expect(state.trace.at(-1)?.action.type).toBe("resetSquareGrowth");
  });

  it("rejects non-shell-growth sequences", () => {
    expect(squareGrowthLensAppliesTo([1, 3, 5, 7]).ok).toBe(true);
    expect(squareGrowthLensAppliesTo([1, 2, 3]).ok).toBe(false);
    expect(squareGrowthLensAppliesTo([2, 4, 6]).ok).toBe(false);
    expect(squareGrowthLensAppliesTo([1, 3, 7, 9]).missingConditions).toContain("consecutive odd shell sizes");
  });
});
