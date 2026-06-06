export type TriangleStage =
  | "idle"
  | "draggingCopy"
  | "nearSolution"
  | "snapped"
  | "deriving"
  | "derived"
  | "hundredClimax";

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
  | { type: "startDraggingCopy" }
  | { type: "leaveSolution" }
  | { type: "approachSolution" }
  | { type: "snapToRectangle" }
  | { type: "startDeriving" }
  | { type: "finishDeriving" }
  | { type: "hundredClimax" }
  | { type: "playDemo" }
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
