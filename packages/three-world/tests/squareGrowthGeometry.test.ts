import { describe, expect, test } from "vitest";
import { growthSequence, squareDots, squareShell } from "../src/squareGrowthGeometry";

describe("square growth geometry", () => {
  test("each square shell has the next odd number of dots", () => {
    for (let k = 1; k <= 12; k += 1) {
      expect(squareShell(k)).toHaveLength(2 * k - 1);
    }
  });

  test("square dots contain n squared dots", () => {
    for (let n = 1; n <= 12; n += 1) {
      expect(squareDots(n)).toHaveLength(n * n);
    }
  });

  test("sum of square shells from 1 to n equals n squared", () => {
    for (let n = 1; n <= 12; n += 1) {
      const shellTotal = Array.from({ length: n }, (_, index) => squareShell(index + 1).length).reduce((sum, count) => sum + count, 0);
      expect(shellTotal).toBe(n * n);
    }
  });

  test("growth frames expose shell growth facts", () => {
    const frames = growthSequence(6);
    expect(frames.map((frame) => frame.added)).toEqual([1, 3, 5, 7, 9, 11]);
    expect(frames.map((frame) => frame.total)).toEqual([1, 4, 9, 16, 25, 36]);
    expect(frames[5].shell).toHaveLength(11);
  });
});
