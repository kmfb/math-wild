import { rectangleCompletionLens, applyRectangleCompletionLens } from "../lenses/rectangleCompletionLens";
import { compileProof } from "../proof/compiler";
import { recognizeWorld } from "../recognition/recognizers";
import { snapshot } from "../world/initialState";
import type { DotSetObject, MathAction, MathObject, TraceEvent, WorldState } from "../types";

let eventCounter = 0;

function cloneObjects(objects: Record<string, MathObject>) {
  return structuredClone(objects) as Record<string, MathObject>;
}

function dotSet(object: MathObject | undefined): DotSetObject | undefined {
  return object?.kind === "dotSet" ? object : undefined;
}

function nextPhase(state: WorldState): WorldState["phase"] {
  if (state.proof) return "proof";
  if (Object.values(state.lensResults).some((result) => !result.ok)) return "boundary";
  if (Object.values(state.lensResults).some((result) => result.ok)) return "lensApplication";
  if (state.activeLensId) return "lensCreation";
  if (state.recognitions.some((recognition) => recognition.kind === "rectangleCompletion")) return "recognition";
  return state.trace.length > 0 ? "exploration" : "beacon";
}

function reduceWithoutTrace(state: WorldState, action: MathAction): WorldState {
  const objects = cloneObjects(state.objects);
  let next: WorldState = { ...state, objects };

  if (action.type === "duplicateDotSet") {
    const target = dotSet(objects[action.targetId]);
    if (target) {
      objects[action.newId] = {
        ...structuredClone(target),
        id: action.newId,
        semanticRole: "copy",
        transform: {
          ...target.transform,
          position: { x: target.transform.position.x + 2.2, y: target.transform.position.y, z: 0 },
        },
      };
    }
  }

  if (action.type === "flipDotSet") {
    const target = dotSet(objects[action.targetId]);
    if (target) {
      target.orientation = target.orientation === "right" ? "left" : "right";
      target.transform.rotation = action.axis === "y" ? Math.PI : -Math.PI;
    }
  }

  if (action.type === "dragDotSet") {
    const target = dotSet(objects[action.targetId]);
    if (target) target.transform.position = action.to;
  }

  if (action.type === "snapToRectangleCompletion") {
    const target = dotSet(objects[action.targetId]);
    const partner = dotSet(objects[action.partnerId]);
    if (target && partner) {
      target.orientation = "left";
      target.transform.position = {
        x: partner.transform.position.x + 1.15,
        y: partner.transform.position.y,
        z: 0,
      };
    }
  }

  const recognitions = recognizeWorld(next);
  next = { ...next, recognitions };

  if (action.type === "createLens") {
    next = {
      ...next,
      activeLensId: action.lensId,
      lenses: { ...next.lenses, [action.lensId]: rectangleCompletionLens },
    };
  }

  if (action.type === "applyLens" || action.type === "testLens") {
    const result = applyRectangleCompletionLens(objects[action.targetId], next);
    next = {
      ...next,
      activeLensId: action.lensId,
      lensResults: { ...next.lensResults, [action.targetId]: result },
    };
  }

  if (action.type === "compileProof") {
    next = { ...next, proof: compileProof(next) };
  }

  return { ...next, phase: nextPhase(next) };
}

export function dispatchWorld(state: WorldState, action: MathAction, timestamp = Date.now()): WorldState {
  const before = snapshot(state);
  const next = reduceWithoutTrace(state, action);
  const after = snapshot(next);
  const event: TraceEvent = {
    id: `trace-${eventCounter++}`,
    timestamp,
    action,
    before,
    after,
    recognitions: next.recognitions,
  };
  return { ...next, trace: [...state.trace, event], phase: nextPhase({ ...next, trace: [...state.trace, event] }) };
}
