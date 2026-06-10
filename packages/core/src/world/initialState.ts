import type { DotSetObject, WorldState } from "../types";

const transform = (x: number, y: number, z = 0) => ({
  position: { x, y, z },
  rotation: 0,
  scale: 1,
});

export function createInitialWorld(): WorldState {
  const practice: DotSetObject = {
    id: "practice-8",
    kind: "dotSet",
    pattern: "stair",
    n: 8,
    orientation: "right",
    semanticRole: "practice",
    transform: transform(-2.2, -0.7),
  };

  return {
    objects: {
      "beacon-100": {
        id: "beacon-100",
        kind: "beacon",
        visualKind: "denseTriangle",
        n: 100,
        question: "How many dots are inside this mountain?",
      },
      [practice.id]: practice,
      "counterexample-8": {
        id: "counterexample-8",
        kind: "dotSet",
        pattern: "brokenStair",
        n: 8,
        orientation: "right",
        semanticRole: "counterexample",
        rowLengths: [1, 2, 4, 4, 6, 7, 7, 9],
        transform: transform(3.6, -0.85),
      },
    },
    trace: [],
    recognitions: [],
    lenses: {},
    lensResults: {},
    phase: "beacon",
  };
}

export function snapshot(state: WorldState) {
  return {
    objects: state.objects,
    activeLensId: state.activeLensId,
    recognitions: state.recognitions,
    lenses: state.lenses,
  };
}
