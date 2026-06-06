import type { Feedback, InvariantResult } from "@math-wild/math-kernel";

export type Side = "left" | "right";

export type UnknownBlock = {
  id: string;
  kind: "unknown";
  label: "x";
};

export type UnitBlock = {
  id: string;
  kind: "unit";
};

export type Block = UnknownBlock | UnitBlock;

export type BalanceStatus = "balanced" | "unbalanced" | "solved";

export type BalanceState = {
  left: Block[];
  right: Block[];
  removedLeft: Block[];
  removedRight: Block[];
  xValue: number;
  status: BalanceStatus;
};

export type EquationBalanceSpec = {
  id: string;
  type: "equation_balance";
  title: string;
  equation: string;
  unknowns: {
    x: number;
  };
  initialState: {
    left: Block[];
    right: Block[];
  };
  goalState: {
    left: Block[];
    rightUnitCount: number;
  };
};

export type EquationBalanceAction =
  | { type: "removeUnit"; side: Side; blockId: string }
  | { type: "restoreBlock"; side: Side }
  | { type: "reset" }
  | { type: "revealX" };

export type EquationMeasurements = {
  leftTotal: number;
  rightTotal: number;
  delta: number;
  leftUnits: number;
  rightUnits: number;
  removedLeft: number;
  removedRight: number;
};

export type EquationWorldSnapshot = {
  state: BalanceState;
  invariantResults: InvariantResult[];
  feedback: Feedback;
  measurements: EquationMeasurements;
};
