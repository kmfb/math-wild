export type Vec3 = { x: number; y: number; z: number };

export type Transform2D = {
  position: Vec3;
  rotation: number;
  scale: number;
};

export type DotSetObject = {
  id: string;
  kind: "dotSet";
  pattern: "stair" | "brokenStair";
  n: number;
  orientation: "right" | "left";
  transform: Transform2D;
  semanticRole?: "practice" | "copy" | "beacon" | "counterexample";
  rowLengths?: number[];
};

export type BeaconObject = {
  id: string;
  kind: "beacon";
  visualKind: "denseTriangle";
  n: number;
  question: string;
};

export type CounterexampleObject = DotSetObject & {
  semanticRole: "counterexample";
};

export type LensObject = {
  id: string;
  kind: "lensObject";
  lensId: string;
};

export type MathObject = DotSetObject | BeaconObject | CounterexampleObject | LensObject;

export type MathAction =
  | { type: "duplicateDotSet"; targetId: string; newId: string }
  | { type: "flipDotSet"; targetId: string; axis: "x" | "y" }
  | { type: "dragDotSet"; targetId: string; to: Vec3 }
  | { type: "snapToRectangleCompletion"; targetId: string; partnerId: string }
  | { type: "createLens"; lensId: string; fromRecognitionId: string }
  | { type: "applyLens"; lensId: string; targetId: string }
  | { type: "testLens"; lensId: string; targetId: string }
  | { type: "compileProof"; traceIds: string[] };

export type RecognitionKind =
  | "twoCongruentStairPatterns"
  | "flippedCopy"
  | "nearRectangleCompletion"
  | "rectangleCompletion"
  | "uniformRows";

export type RecognitionResult = {
  id: string;
  kind: RecognitionKind;
  confidence: number;
  objectIds: string[];
  facts: Record<string, unknown>;
};

export type ApplicabilityResult = {
  ok: boolean;
  confidence: number;
  reason: string;
  missingConditions?: string[];
};

export type LensPreview = {
  targetId: string;
  rows?: number;
  columns?: number;
  message: string;
};

export type LensResult = {
  lensId: string;
  targetId: string;
  ok: boolean;
  facts: Record<string, unknown>;
  explanation: string;
  missingConditions?: string[];
};

export type ProofStep = {
  kind: "setup" | "action" | "observation" | "calculation" | "boundary" | "conclusion";
  text: string;
};

export type MathLens = {
  id: string;
  name: string;
  discoverySentence: string;
};

export type WorldSnapshot = {
  objects: Record<string, MathObject>;
  activeLensId?: string;
  recognitions: RecognitionResult[];
  lenses: Record<string, MathLens>;
};

export type TraceEvent = {
  id: string;
  timestamp: number;
  action: MathAction;
  before: WorldSnapshot;
  after: WorldSnapshot;
  recognitions: RecognitionResult[];
};

export type ProofArtifact = {
  steps: ProofStep[];
  markdown: string;
};

export type WorldState = {
  objects: Record<string, MathObject>;
  activeLensId?: string;
  trace: TraceEvent[];
  recognitions: RecognitionResult[];
  lenses: Record<string, MathLens>;
  lensResults: Record<string, LensResult>;
  proof?: ProofArtifact;
  phase:
    | "beacon"
    | "exploration"
    | "recognition"
    | "lensCreation"
    | "lensApplication"
    | "boundary"
    | "proof"
    | "horizon";
};
