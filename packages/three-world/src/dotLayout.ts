import type { DotSetObject } from "@math-wild/core";

export type DotInstance = {
  id: string;
  x: number;
  y: number;
  source: "practice" | "copy" | "beacon" | "counterexample";
};

export function triangleDotCount(n: number) {
  return (n * (n + 1)) / 2;
}

export function dotRows(object: DotSetObject): number[] {
  if (object.pattern === "brokenStair" && object.rowLengths) return object.rowLengths;
  return Array.from({ length: object.n }, (_, index) => index + 1);
}

export function dotInstances(object: DotSetObject, spacing = 0.14): DotInstance[] {
  const rows = dotRows(object);
  const role = object.semanticRole ?? "practice";
  return rows.flatMap((length, row) =>
    Array.from({ length }, (_, column) => {
      const reflectedColumn = object.orientation === "left" ? length - column - 1 : column;
      return {
        id: `${object.id}-${row}-${column}`,
        x: reflectedColumn * spacing,
        y: -row * spacing,
        source: role === "counterexample" ? "counterexample" : role === "copy" ? "copy" : "practice",
      };
    }),
  );
}

export function denseTriangleSamples(n: number, maxRows = 34): DotInstance[] {
  const sampledRows = Math.min(n, maxRows);
  const scale = n / sampledRows;
  return Array.from({ length: sampledRows }, (_, row) =>
    Array.from({ length: row + 1 }, (_, column) => ({
      id: `beacon-${row}-${column}`,
      x: column * 0.045 * scale,
      y: -row * 0.045 * scale,
      source: "beacon" as const,
    })),
  ).flat();
}
