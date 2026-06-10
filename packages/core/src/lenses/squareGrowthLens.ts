export type SquareGrowthAction =
  | { type: "growSquareShell"; from: number; to: number }
  | { type: "growNextSquareShell"; maxN: number }
  | { type: "applySquareGrowthLens"; targetN: number }
  | { type: "resetSquareGrowth" };

export type SquareGrowthTraceEvent = {
  id: string;
  action: SquareGrowthAction;
  before: Pick<SquareGrowthState, "n" | "targetN">;
  after: Pick<SquareGrowthState, "n" | "targetN">;
};

export type SquareGrowthLensResult = {
  lensId: "square-growth";
  ok: boolean;
  n: number;
  lastOdd: number;
  expression: string;
  value: number;
  explanation: string;
};

export type SquareGrowthState = {
  n: number;
  targetN: number;
  trace: SquareGrowthTraceEvent[];
  lensResult?: SquareGrowthLensResult;
};

export type SquareGrowthApplicabilityResult = {
  ok: boolean;
  reason: string;
  missingConditions?: string[];
};

function snapshot(state: SquareGrowthState) {
  return { n: state.n, targetN: state.targetN };
}

function oddExpression(n: number) {
  if (n <= 1) return "1";
  if (n <= 6) {
    return Array.from({ length: n }, (_, index) => String(2 * index + 1)).join(" + ");
  }
  return `1 + 3 + 5 + ... + ${2 * n - 1}`;
}

export function createInitialSquareGrowthState(targetN = 100): SquareGrowthState {
  return {
    n: 1,
    targetN,
    trace: [],
  };
}

export function applySquareGrowthLens(n: number): SquareGrowthLensResult {
  return {
    lensId: "square-growth",
    ok: Number.isInteger(n) && n >= 1,
    n,
    lastOdd: 2 * n - 1,
    expression: oddExpression(n),
    value: n * n,
    explanation: `${oddExpression(n)} forms a ${n}×${n} square.`,
  };
}

export function squareGrowthLensAppliesTo(sequence: number[]): SquareGrowthApplicabilityResult {
  const ok = sequence.every((value, index) => value === 2 * (index + 1) - 1);
  if (ok) {
    return { ok: true, reason: "The sequence grows by consecutive odd square shells." };
  }
  return {
    ok: false,
    reason: "The sequence is not consecutive odd square-shell growth.",
    missingConditions: ["consecutive odd shell sizes"],
  };
}

export function dispatchSquareGrowth(state: SquareGrowthState, action: SquareGrowthAction): SquareGrowthState {
  const before = snapshot(state);
  let next: SquareGrowthState = state;

  if (action.type === "growSquareShell") {
    next = {
      ...state,
      n: Math.max(1, action.to),
    };
  }

  if (action.type === "growNextSquareShell") {
    next = {
      ...state,
      n: Math.min(action.maxN, state.n + 1),
    };
  }

  if (action.type === "applySquareGrowthLens") {
    next = {
      ...state,
      targetN: action.targetN,
      lensResult: applySquareGrowthLens(action.targetN),
    };
  }

  if (action.type === "resetSquareGrowth") {
    next = createInitialSquareGrowthState(state.targetN);
  }

  const after = snapshot(next);
  return {
    ...next,
    trace: [
      ...state.trace,
      {
        id: `square-growth-${state.trace.length + 1}`,
        action,
        before,
        after,
      },
    ],
  };
}
