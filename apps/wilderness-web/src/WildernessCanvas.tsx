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
  dispatch,
  recognized,
}: {
  object: DotSetObject;
  dispatch: (action: MathAction) => void;
  recognized: boolean;
}) {
  const [dragging, setDragging] = useState(false);
  const dots = useMemo(() => dotInstances(object), [object]);
  const color =
    object.semanticRole === "copy"
      ? "#67e8f9"
      : object.semanticRole === "counterexample"
        ? "#fb7185"
        : "#fbbf24";

  function move(event: ThreeEvent<PointerEvent>) {
    if (!dragging || object.semanticRole !== "copy") return;
    event.stopPropagation();
    dispatch({
      type: "dragDotSet",
      targetId: object.id,
      to: { x: event.point.x, y: event.point.y, z: 0 },
    });
  }

  function release(event: ThreeEvent<PointerEvent>) {
    if (!dragging) return;
    event.stopPropagation();
    setDragging(false);
    if (object.semanticRole === "copy" && Math.abs(object.transform.position.x + 1.05) < 1.8) {
      dispatch({ type: "snapToRectangleCompletion", targetId: object.id, partnerId: "practice-8" });
    }
  }

  return (
    <group
      position={[object.transform.position.x, object.transform.position.y, object.transform.position.z]}
      rotation={[0, object.orientation === "left" ? Math.PI : 0, 0]}
      scale={object.transform.scale}
      onPointerDown={(event) => {
        if (object.semanticRole === "copy") {
          event.stopPropagation();
          setDragging(true);
        }
      }}
      onPointerMove={move}
      onPointerUp={release}
      onPointerLeave={release}
    >
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

function Scene({ state, dispatch }: Props) {
  const recognized = state.recognitions.some((recognition) => recognition.kind === "rectangleCompletion");
  const lensActive = Boolean(state.activeLensId);
  const lensApplied = Boolean(state.lensResults["beacon-100"]?.ok);
  const lensFailed = state.lensResults["counterexample-8"]?.ok === false;

  return (
    <>
      <color attach="background" args={["#060712"]} />
      <fog attach="fog" args={["#060712", 4.5, 10.5]} />
      <ambientLight intensity={0.42} />
      <pointLight position={[-3, 3, 4]} intensity={35} color="#bae6fd" />
      <pointLight position={[3, 0.5, 2]} intensity={12} color="#fda4af" />
      <Beacon object={state.objects["beacon-100"]} lit={lensApplied} />
      <group position={[0, 0, 0]}>
        <mesh position={[0, -1.42, -0.08]}>
          <boxGeometry args={[5.8, 0.08, 1.4]} />
          <meshStandardMaterial color="#172033" roughness={0.8} metalness={0.1} />
        </mesh>
        {dotSets(state).map((object) => (
          <DotSet key={object.id} object={object} dispatch={dispatch} recognized={recognized && object.semanticRole !== "counterexample"} />
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
