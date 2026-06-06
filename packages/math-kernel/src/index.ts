export type MathObject =
  | { id: string; kind: "unit"; value: 1 }
  | { id: string; kind: "unknown"; label: string; value: number }
  | { id: string; kind: "rectangle"; height: number; width: string }
  | { id: string; kind: "ratioPair"; a: number; b: number };

export type Measurement = {
  id: string;
  label: string;
  value: number | string;
};

export type InvariantResult = {
  id: string;
  label: string;
  ok: boolean;
  delta?: number;
  explanation: string;
  measurements?: Measurement[];
};

export type Invariant<S> = {
  id: string;
  label: string;
  check: (state: S) => InvariantResult;
};

export type Transformation<S, A> = {
  id: string;
  label: string;
  apply: (state: S, action: A) => S;
  preserves?: string[];
};

export type Feedback = {
  kind: "balanced" | "unbalanced" | "broken-equality" | "ghost-action" | "reveal" | "celebration";
  intensity?: number;
  message?: string;
};

export type TraceEvent<S, A> = {
  action: A;
  before: S;
  after: S;
  invariantResults: InvariantResult[];
  feedback: Feedback;
  timestamp: number;
};

export type MathWorld<S, A> = {
  id: string;
  createInitialState: () => S;
  checkInvariants: (state: S) => InvariantResult[];
  getFeedback: (state: S, results?: InvariantResult[]) => Feedback;
  applyAction: (state: S, action: A) => S;
  act: (state: S, action: A, timestamp?: number) => TraceEvent<S, A>;
  replay: (initial: S, actions: A[]) => TraceEvent<S, A>[];
};
