import { Canvas, type ThreeEvent } from "@react-three/fiber";
import { Float, Html, Text } from "@react-three/drei";
import { Bloom, EffectComposer, Vignette } from "@react-three/postprocessing";
import { useMemo, useState } from "react";
import type { DotSetObject, MathAction, MathObject, WorldState } from "@math-wild/core";
import { denseTriangleSamples, dotInstances } from "@math-wild/three-world";

type Props = {
  state: WorldState;
  dispatch: (action: MathAction) => void;
};

function dotSets(state: WorldState) {
  return Object.values(state.objects).filter((object): object is DotSetObject => object.kind === "dotSet");
}

function DotSet({
  object,
  recognized,
  dragging,
  onGrab,
}: {
  object: DotSetObject;
  recognized: boolean;
  dragging: boolean;
  onGrab: (event: ThreeEvent<PointerEvent>, objectId: string) => void;
}) {
  const dots = useMemo(() => dotInstances(object), [object]);
  const rows = object.rowLengths ?? Array.from({ length: object.n }, (_, index) => index + 1);
  const maxRow = Math.max(...rows);
  const handleWidth = Math.max(0.8, maxRow * 0.14 + 0.34);
  const handleHeight = Math.max(0.8, object.n * 0.14 + 0.34);
  const color =
    object.semanticRole === "copy"
      ? "#67e8f9"
      : object.semanticRole === "counterexample"
        ? "#fb7185"
        : "#fbbf24";

  return (
    <group
      position={[object.transform.position.x, object.transform.position.y, object.transform.position.z]}
      rotation={[0, object.orientation === "left" ? Math.PI : 0, 0]}
      scale={object.transform.scale}
      onPointerDown={(event) => {
        if (object.semanticRole === "copy") {
          onGrab(event, object.id);
        }
      }}
    >
      {object.semanticRole === "copy" && (
        <mesh position={[handleWidth / 2 - 0.16, -handleHeight / 2 + 0.16, -0.02]}>
          <boxGeometry args={[handleWidth, handleHeight, 0.04]} />
          <meshBasicMaterial color="#67e8f9" transparent opacity={dragging ? 0.18 : 0.06} />
        </mesh>
      )}
      {dots.map((dot) => (
        <mesh key={dot.id} position={[dot.x, dot.y, 0]}>
          <sphereGeometry args={[0.045, 12, 12]} />
          <meshStandardMaterial
            color={color}
            emissive={recognized ? color : "#000000"}
            emissiveIntensity={recognized ? 0.75 : 0.08}
            roughness={0.4}
          />
        </mesh>
      ))}
      {object.semanticRole === "copy" && (
        <Text position={[handleWidth / 2 - 0.16, 0.32, 0.04]} fontSize={0.11} color={dragging ? "#ecfeff" : "#bae6fd"} anchorX="center">
          drag lens material
        </Text>
      )}
    </group>
  );
}

function Beacon({ object, lit }: { object: MathObject; lit: boolean }) {
  if (object.kind !== "beacon") return null;
  const dots = denseTriangleSamples(object.n);
  return (
    <Float speed={0.7} floatIntensity={0.18}>
      <group position={[-4.9, 2.1, -2.8]} scale={0.92}>
        {dots.map((dot) => (
          <mesh key={dot.id} position={[dot.x, dot.y, 0]}>
            <sphereGeometry args={[0.025, 8, 8]} />
            <meshStandardMaterial
              color="#c7d2fe"
              emissive={lit ? "#38bdf8" : "#312e81"}
              emissiveIntensity={lit ? 0.9 : 0.22}
              transparent
              opacity={0.76}
            />
          </mesh>
        ))}
        <Text position={[0.9, -1.9, 0]} fontSize={0.18} color="#dbeafe" anchorX="center">
          100-layer dot mountain
        </Text>
      </group>
    </Float>
  );
}

function LensGlyph({ active }: { active: boolean }) {
  return (
    <group position={[0.9, 1.35, 0]}>
      <mesh>
        <torusGeometry args={[0.42, 0.018, 16, 96]} />
        <meshStandardMaterial color={active ? "#5eead4" : "#475569"} emissive={active ? "#14b8a6" : "#000000"} emissiveIntensity={1.6} />
      </mesh>
      <Text position={[0, -0.68, 0]} fontSize={0.12} color={active ? "#ccfbf1" : "#94a3b8"} anchorX="center">
        Rectangle Completion Lens
      </Text>
    </group>
  );
}

function BoundaryFracture({ visible }: { visible: boolean }) {
  if (!visible) return null;
  return (
    <group position={[3.52, -0.72, 0.06]}>
      <mesh rotation={[0, 0, -0.5]}>
        <boxGeometry args={[0.9, 0.018, 0.018]} />
        <meshStandardMaterial color="#fb7185" emissive="#e11d48" emissiveIntensity={1.4} />
      </mesh>
      <mesh rotation={[0, 0, 0.45]}>
        <boxGeometry args={[0.7, 0.018, 0.018]} />
        <meshStandardMaterial color="#fb7185" emissive="#e11d48" emissiveIntensity={1.4} />
      </mesh>
    </group>
  );
}

function pointerTarget(event: ThreeEvent<PointerEvent>) {
  return event.target instanceof Element ? event.target : undefined;
}

function Scene({ state, dispatch }: Props) {
  const [activeDragId, setActiveDragId] = useState<string | undefined>();
  const recognized = state.recognitions.some((recognition) => recognition.kind === "rectangleCompletion");
  const lensActive = Boolean(state.activeLensId);
  const lensApplied = Boolean(state.lensResults["beacon-100"]?.ok);
  const lensFailed = state.lensResults["counterexample-8"]?.ok === false;
  const copy = state.objects[activeDragId ?? ""];

  function grabCopy(event: ThreeEvent<PointerEvent>, objectId: string) {
    event.stopPropagation();
    pointerTarget(event)?.setPointerCapture(event.pointerId);
    setActiveDragId(objectId);
  }

  function dragOnPlane(event: ThreeEvent<PointerEvent>) {
    if (!activeDragId) return;
    event.stopPropagation();
    dispatch({
      type: "dragDotSet",
      targetId: activeDragId,
      to: {
        x: Math.max(-3.7, Math.min(3.7, event.point.x)),
        y: Math.max(-1.6, Math.min(1.35, event.point.y)),
        z: 0,
      },
    });
  }

  function releaseDrag(event: ThreeEvent<PointerEvent>) {
    if (!activeDragId) return;
    event.stopPropagation();
    const target = pointerTarget(event);
    if (target?.hasPointerCapture(event.pointerId)) {
      target.releasePointerCapture(event.pointerId);
    }
    if (copy?.kind === "dotSet" && Math.abs(copy.transform.position.x + 1.05) < 1.8) {
      dispatch({ type: "snapToRectangleCompletion", targetId: activeDragId, partnerId: "practice-8" });
    }
    setActiveDragId(undefined);
  }

  return (
    <>
      <color attach="background" args={["#060712"]} />
      <fog attach="fog" args={["#060712", 4.5, 10.5]} />
      <ambientLight intensity={0.42} />
      <pointLight position={[-3, 3, 4]} intensity={35} color="#bae6fd" />
      <pointLight position={[3, 0.5, 2]} intensity={12} color="#fda4af" />
      <Beacon object={state.objects["beacon-100"]} lit={lensApplied} />
      <group
        position={[0, 0, 0]}
        onPointerMove={dragOnPlane}
        onPointerUp={releaseDrag}
        onPointerCancel={releaseDrag}
        onPointerLeave={releaseDrag}
      >
        <mesh position={[0, -0.05, -0.18]}>
          <planeGeometry args={[8.8, 4.8]} />
          <meshBasicMaterial transparent opacity={0} />
        </mesh>
        <mesh position={[0, -1.42, -0.08]}>
          <boxGeometry args={[5.8, 0.08, 1.4]} />
          <meshStandardMaterial color="#172033" roughness={0.8} metalness={0.1} />
        </mesh>
        {dotSets(state).map((object) => (
          <DotSet
            key={object.id}
            object={object}
            recognized={recognized && object.semanticRole !== "counterexample"}
            dragging={activeDragId === object.id}
            onGrab={grabCopy}
          />
        ))}
        <LensGlyph active={lensActive} />
        <BoundaryFracture visible={lensFailed} />
        {recognized && (
          <Text position={[-0.6, 0.65, 0]} fontSize={0.18} color="#ccfbf1" anchorX="center">
            uniform rows recognized
          </Text>
        )}
      </group>
      {state.proof && (
        <Html position={[2.7, 1.75, 0]} transform>
          <div className="horizon-chip">New horizon unlocked</div>
        </Html>
      )}
      <EffectComposer>
        <Bloom luminanceThreshold={0.22} intensity={0.75} mipmapBlur />
        <Vignette eskil={false} offset={0.25} darkness={0.75} />
      </EffectComposer>
    </>
  );
}

export function WildernessCanvas({ state, dispatch }: Props) {
  return (
    <Canvas camera={{ position: [0, 0.5, 5.7], fov: 48 }} className="wilderness-canvas">
      <Scene state={state} dispatch={dispatch} />
    </Canvas>
  );
}
