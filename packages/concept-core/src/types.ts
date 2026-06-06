export type {
  BalanceState,
  BalanceStatus,
  Block,
  EquationBalanceAction,
  EquationBalanceSpec,
  EquationMeasurements,
  Side,
  UnitBlock,
  UnknownBlock,
} from "@math-wild/math-worlds/equation-balance";

export type VerificationResult = {
  status: "PASS" | "FAIL";
  checks: Array<{
    id: string;
    pass: boolean;
    reason?: string;
    value?: unknown;
  }>;
};
