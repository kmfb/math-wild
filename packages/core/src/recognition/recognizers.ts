import type { DotSetObject, MathObject, RecognitionResult, WorldState } from "../types";

function isDotSet(object: MathObject): object is DotSetObject {
  return object.kind === "dotSet";
}

function distance(a: DotSetObject, b: DotSetObject) {
  return Math.hypot(a.transform.position.x - b.transform.position.x, a.transform.position.y - b.transform.position.y);
}

function rowLengths(object: DotSetObject): number[] {
  if (object.pattern === "brokenStair" && object.rowLengths) return object.rowLengths;
  return Array.from({ length: object.n }, (_, index) => index + 1);
}

export function canCompleteUniformRows(object: DotSetObject): boolean {
  const rows = rowLengths(object);
  return object.pattern === "stair" && rows.every((length, index) => length === index + 1);
}

export function recognizeWorld(state: WorldState): RecognitionResult[] {
  const dotSets = Object.values(state.objects).filter(isDotSet);
  const practice = dotSets.find((object) => object.semanticRole === "practice");
  const copy = dotSets.find((object) => object.semanticRole === "copy");
  if (!practice || !copy) return [];

  const recognitions: RecognitionResult[] = [];
  const samePattern = practice.pattern === copy.pattern && practice.n === copy.n;
  if (samePattern) {
    recognitions.push({
      id: "rec-two-congruent",
      kind: "twoCongruentStairPatterns",
      confidence: 1,
      objectIds: [practice.id, copy.id],
      facts: { n: practice.n, dotCount: (practice.n * (practice.n + 1)) / 2 },
    });
  }

  if (copy.orientation === "left") {
    recognitions.push({
      id: "rec-flipped-copy",
      kind: "flippedCopy",
      confidence: 1,
      objectIds: [copy.id],
      facts: { axis: "y" },
    });
  }

  const near = copy.orientation === "left" && distance(practice, copy) < 1.3;
  if (near) {
    recognitions.push({
      id: "rec-near-rectangle",
      kind: "nearRectangleCompletion",
      confidence: 0.82,
      objectIds: [practice.id, copy.id],
      facts: { n: practice.n },
    });
  }

  const snapped = copy.orientation === "left" && copy.transform.position.x === practice.transform.position.x + 1.15;
  if (snapped && samePattern && canCompleteUniformRows(practice)) {
    const n = practice.n;
    recognitions.push({
      id: "rec-rectangle-completion",
      kind: "rectangleCompletion",
      confidence: 1,
      objectIds: [practice.id, copy.id],
      facts: {
        n,
        rows: n,
        columns: n + 1,
        rectangleDotCount: n * (n + 1),
        triangleDotCount: (n * (n + 1)) / 2,
      },
    });
    recognitions.push({
      id: "rec-uniform-rows",
      kind: "uniformRows",
      confidence: 1,
      objectIds: [practice.id, copy.id],
      facts: { rowCount: n, rowLength: n + 1 },
    });
  }

  return recognitions;
}
