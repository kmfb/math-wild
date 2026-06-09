import { canCompleteUniformRows } from "../recognition/recognizers";
import type {
  ApplicabilityResult,
  DotSetObject,
  LensPreview,
  LensResult,
  MathLens,
  MathObject,
  ProofStep,
  WorldState,
} from "../types";

export const rectangleCompletionLens: MathLens = {
  id: "rectangle-completion",
  name: "Rectangle Completion Lens",
  discoverySentence: "Two identical triangular stair-dot patterns can complete a rectangle.",
};

function asDotTarget(object: MathObject | undefined): DotSetObject | undefined {
  if (!object) return undefined;
  if (object.kind === "dotSet") return object;
  if (object.kind === "beacon") {
    return {
      id: object.id,
      kind: "dotSet",
      pattern: "stair",
      n: object.n,
      orientation: "right",
      semanticRole: "beacon",
      transform: { position: { x: 0, y: 0, z: 0 }, rotation: 0, scale: 1 },
    };
  }
  return undefined;
}

export function rectangleLensAppliesTo(object: MathObject | undefined, _world: WorldState): ApplicabilityResult {
  const target = asDotTarget(object);
  if (!target) {
    return { ok: false, confidence: 0, reason: "The target is not a dot pattern.", missingConditions: ["dot pattern"] };
  }
  if (!canCompleteUniformRows(target)) {
    return {
      ok: false,
      confidence: 0.94,
      reason: "Rows cannot be completed to a uniform length by this Lens.",
      missingConditions: ["uniform row completion"],
    };
  }
  return { ok: true, confidence: 1, reason: "The stair pattern can be completed into equal-length rows." };
}

export function rectangleLensPreview(object: MathObject | undefined, world: WorldState): LensPreview {
  const target = asDotTarget(object);
  const applies = rectangleLensAppliesTo(object, world);
  if (!target || !applies.ok) return { targetId: object?.id ?? "unknown", message: applies.reason };
  return { targetId: target.id, rows: target.n, columns: target.n + 1, message: `${target.n} rows by ${target.n + 1} columns` };
}

export function applyRectangleCompletionLens(object: MathObject | undefined, world: WorldState): LensResult {
  const target = asDotTarget(object);
  const applies = rectangleLensAppliesTo(object, world);
  if (!target || !applies.ok) {
    return {
      lensId: rectangleCompletionLens.id,
      targetId: object?.id ?? "unknown",
      ok: false,
      facts: {},
      explanation: applies.reason,
      missingConditions: applies.missingConditions,
    };
  }

  const rows = target.n;
  const columns = target.n + 1;
  return {
    lensId: rectangleCompletionLens.id,
    targetId: target.id,
    ok: true,
    facts: {
      rows,
      columns,
      twoTriangles: rows * columns,
      oneTriangle: (rows * columns) / 2,
    },
    explanation: `The Lens completes the stair pattern into a ${rows} by ${columns} rectangle; one triangle is half.`,
  };
}

export function explainRectangleLens(result: LensResult): ProofStep[] {
  if (!result.ok) {
    return [
      {
        kind: "boundary",
        text: result.explanation,
      },
    ];
  }

  const rows = Number(result.facts.rows);
  const columns = Number(result.facts.columns);
  const oneTriangle = Number(result.facts.oneTriangle);
  return [
    { kind: "setup", text: "Start with a triangular stair-dot pattern with n rows." },
    { kind: "action", text: "Make an identical copy and flip it." },
    { kind: "observation", text: "Arrange the two patterns so that each row is completed to the same length." },
    { kind: "observation", text: `For the target, the completed rectangle has ${rows} rows and ${columns} columns.` },
    { kind: "calculation", text: `The two triangles contain ${rows} × ${columns} = ${rows * columns} dots.` },
    { kind: "calculation", text: `One triangle contains half as many dots: ${oneTriangle}.` },
    { kind: "conclusion", text: "Therefore 1 + 2 + ... + n = n(n+1)/2." },
  ];
}
