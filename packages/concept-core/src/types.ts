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

export type VerificationResult = {
  status: "PASS" | "FAIL";
  checks: Array<{
    id: string;
    pass: boolean;
    reason?: string;
    value?: unknown;
  }>;
};
