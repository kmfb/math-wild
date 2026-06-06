export type TriangleStage = "single" | "duplicated" | "flipped" | "snapped" | "derived";

export type TriangleNumberSpec = {
  id: string;
  type: "triangle_number";
  title: string;
  subtitle: string;
  initialN: number;
  minN: number;
  maxN: number;
};

export type TriangleNumberState = {
  n: number;
  stage: TriangleStage;
};

export type TriangleNumberAction =
  | { type: "setN"; n: number }
  | { type: "duplicateTriangle" }
  | { type: "flipCopy" }
  | { type: "snapToRectangle" }
  | { type: "deriveFormula" }
  | { type: "reset" };

export type TriangleMeasurements = {
  n: number;
  triangleDots: number;
  doubledDots: number;
  rectangleRows: number;
  rectangleColumns: number;
  rectangleDots: number;
  formula: string;
  value: number;
  usesAbstractView: boolean;
};
