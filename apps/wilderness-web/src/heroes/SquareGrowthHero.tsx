import { Canvas, useFrame } from "@react-three/fiber";
import { Float, Text } from "@react-three/drei";
import { Bloom, EffectComposer, Vignette } from "@react-three/postprocessing";
import { useMemo, useReducer, useRef, useState, type PointerEvent } from "react";
import type { Mesh, MeshStandardMaterial } from "three";
import {
  createInitialSquareGrowthState,
  dispatchSquareGrowth,
  type SquareGrowthLensResult,
  type SquareGrowthState,
} from "@math-wild/core";
import { growthSequence, squareDots, type SquareGrowthDot } from "@math-wild/three-world";

type HeroState = "beacon" | "seed" | "growing" | "structureVisible" | "formulaRevealed" | "hundredClimax";

const maxPracticeN = 6;

function nextState(n: number): HeroState {
  if (n < 2) return "seed";
  if (n < 5) return "growing";
  if (n < maxPracticeN) return "structureVisible";
  return "formulaRevealed";
}

function GlowDot({
  x,
  y,
  fresh,
  arm = "body",
  scale = 1,
}: {
  x: number;
  y: number;
  fresh: boolean;
  arm?: "body" | "bottom" | "right";
  scale?: number;
}) {
  const ref = useRef<Mesh>(null);
  useFrame(({ clock }) => {
    if (!ref.current) return;
    const offset = arm === "bottom" ? x * 0.8 : arm === "right" ? y * 0.8 + 1.6 : x;
    const pulse = fresh ? Math.sin(clock.elapsedTime * 8 - offset) * 0.048 : Math.sin(clock.elapsedTime * 2 + x) * 0.012;
    ref.current.scale.setScalar(scale + pulse);
  });
  const freshColor = arm === "right" ? "#5eead4" : "#67e8f9";
  const freshEmissive = arm === "right" ? "#14b8a6" : "#0891b2";

  return (
    <mesh ref={ref} position={[x, y, 0]}>
      <sphereGeometry args={[0.07, 18, 18]} />
      <meshStandardMaterial
        color={fresh ? freshColor : "#fbbf24"}
        emissive={fresh ? freshEmissive : "#b45309"}
        emissiveIntensity={fresh ? 1.65 : 0.95}
        roughness={0.28}
      />
    </mesh>
  );
}

function shellArm(dot: SquareGrowthDot, n: number): "bottom" | "right" {
  const edge = -((n - 1) / 2);
  return dot.y === edge ? "bottom" : "right";
}

function ShellBeam({
  position,
  length,
  orientation,
}: {
  position: [number, number, number];
  length: number;
  orientation: "horizontal" | "vertical";
}) {
  const ref = useRef<Mesh>(null);
  useFrame(({ clock }) => {
    if (!ref.current) return;
    const delay = orientation === "horizontal" ? 0 : 0.32;
    const wave = Math.min(1, Math.max(0.18, (Math.sin(clock.elapsedTime * 2.6 - delay) + 1) / 2));
    if (orientation === "horizontal") {
      ref.current.scale.set(wave, 1, 1);
    } else {
      ref.current.scale.set(1, wave, 1);
    }
  });

  return (
    <mesh ref={ref} position={position}>
      <boxGeometry args={orientation === "horizontal" ? [length, 0.022, 0.02] : [0.022, length, 0.02]} />
      <meshStandardMaterial
        color={orientation === "horizontal" ? "#67e8f9" : "#5eead4"}
        emissive={orientation === "horizontal" ? "#0891b2" : "#14b8a6"}
        emissiveIntensity={1.16}
        transparent
        opacity={0.8}
      />
    </mesh>
  );
}

function PracticeSquare({ n }: { n: number }) {
  const dots = useMemo(() => squareDots(n), [n]);
  const priorDots = useMemo(() => dots.filter((dot) => dot.ring < n), [dots, n]);
  const shell = useMemo(() => dots.filter((dot) => dot.ring === n), [dots, n]);
  const freshRing = n;
  const spacing = 0.28;
  const shellExtent = (n - 1) * spacing + 0.18;
  const edge = ((n - 1) / 2) * spacing;

  return (
    <group position={[0, -0.22, 0]}>
      <mesh position={[0, 0, -0.08]}>
        <boxGeometry args={[Math.max(1.08, n * spacing + 0.36), Math.max(1.08, n * spacing + 0.36), 0.04]} />
        <meshStandardMaterial color="#111827" emissive="#0f172a" emissiveIntensity={0.5} transparent opacity={0.68} />
      </mesh>
      {n >= 2 && (
        <group position={[0, 0, -0.03]}>
          <ShellBeam position={[0, -edge, 0]} length={shellExtent} orientation="horizontal" />
          <ShellBeam position={[edge, 0, 0]} length={shellExtent} orientation="vertical" />
        </group>
      )}
      {priorDots.map((dot) => (
        <GlowDot key={dot.id} x={dot.x * spacing} y={dot.y * spacing} fresh={false} />
      ))}
      {shell.map((dot) => (
        <GlowDot key={dot.id} x={dot.x * spacing} y={dot.y * spacing} fresh={freshRing > 1} arm={shellArm(dot, n)} />
      ))}
      {n >= 2 && (
        <group position={[0, -edge - 0.28, 0.05]}>
          <mesh position={[0, 0, 0]}>
            <boxGeometry args={[0.78, 0.19, 0.02]} />
            <meshStandardMaterial color="#06131e" emissive="#083344" emissiveIntensity={0.55} transparent opacity={0.86} />
          </mesh>
          <Text position={[0, -0.035, 0.03]} fontSize={0.13} color="#ccfbf1" anchorX="center">
            +{2 * n - 1} outer ring
          </Text>
        </group>
      )}
      {n >= 2 && (
        <group position={[0, -n * spacing * 0.5 - 0.46, 0.04]}>
          <mesh>
            <boxGeometry args={[n * spacing + 0.4, 0.018, 0.018]} />
            <meshStandardMaterial color="#5eead4" emissive="#14b8a6" emissiveIntensity={1.2} />
          </mesh>
          <Text position={[0, -0.18, 0]} fontSize={0.12} color="#ccfbf1" anchorX="center">
            {n} by {n}
          </Text>
        </group>
      )}
    </group>
  );
}

function BeaconDot({ x, y, ring, lit }: { x: number; y: number; ring: number; lit: boolean }) {
  const ref = useRef<Mesh>(null);
  const materialRef = useRef<MeshStandardMaterial>(null);
  useFrame(({ clock }) => {
    if (!ref.current || !materialRef.current) return;
    if (!lit) {
      ref.current.scale.setScalar(1);
      return;
    }
    const sweep = clock.elapsedTime * 8 - ring * 0.28;
    const glow = Math.max(0, Math.min(1, sweep));
    ref.current.scale.setScalar(0.82 + glow * 0.38 + Math.sin(clock.elapsedTime * 3 + ring) * 0.04);
    materialRef.current.emissiveIntensity = 0.35 + glow * 1.45;
  });

  return (
    <mesh ref={ref} position={[x, -y, 0]}>
      <sphereGeometry args={[0.18, 8, 8]} />
      <meshStandardMaterial
        ref={materialRef}
        color={lit ? "#fde68a" : "#475569"}
        emissive={lit ? "#f59e0b" : "#164e63"}
        emissiveIntensity={lit ? 1.4 : 0.35}
        transparent
        opacity={lit ? 0.95 : 0.68}
      />
    </mesh>
  );
}

function BeaconSquare({ lit }: { lit: boolean }) {
  const samples = useMemo(() => {
    const dots = [];
    for (let row = 0; row < 24; row += 1) {
      for (let column = 0; column < 24; column += 1) {
        if ((row + column) % 2 === 0 || row % 7 === 0 || column % 7 === 0) {
          dots.push({ id: `beacon-${row}-${column}`, x: column, y: row, ring: Math.max(row, column) });
        }
      }
    }
    return dots;
  }, []);

  return (
    <Float speed={0.45} floatIntensity={0.1}>
      <group position={lit ? [0, 0.24, -1.4] : [0, 0.06, -1.7]} scale={lit ? 0.13 : 0.115}>
        <mesh position={[0, 0, -0.2]}>
          <boxGeometry args={[26, 26, 0.1]} />
          <meshStandardMaterial color="#020617" emissive={lit ? "#92400e" : "#0f172a"} emissiveIntensity={lit ? 1.15 : 0.48} transparent opacity={lit ? 0.95 : 0.9} />
        </mesh>
        {samples.map((dot) => (
          <BeaconDot key={dot.id} x={dot.x - 11.5} y={dot.y - 11.5} ring={dot.ring} lit={lit} />
        ))}
        <Text position={[0, 14.1, 0.15]} fontSize={1.25} color={lit ? "#fde68a" : "#bfdbfe"} anchorX="center">
          100 × 100
        </Text>
      </group>
    </Float>
  );
}

function FormulaInscription({ n, lensResult }: { n: number; lensResult?: SquareGrowthLensResult }) {
  if (lensResult) {
    return (
      <group position={[0, -1.55, 0.2]}>
        <Text fontSize={0.2} color="#fef3c7" anchorX="center">
          {lensResult.expression} = {lensResult.n}²
        </Text>
        <Text position={[0, -0.34, 0]} fontSize={0.38} color="#fde68a" anchorX="center">
          {String(lensResult.value)}
        </Text>
      </group>
    );
  }

  if (n < 2) return null;
  return (
    <group position={[0, -1.62, 0.18]}>
      <Text fontSize={0.16} color="#fef3c7" anchorX="center">
        {growthSequence(n)[n - 1].total === n * n ? `${Array.from({ length: n }, (_, index) => String(2 * index + 1)).join(" + ")} = ${n}²` : ""}
      </Text>
      {n >= maxPracticeN && (
        <Text position={[0, -0.3, 0]} fontSize={0.15} color="#ccfbf1" anchorX="center">
          1 + 3 + 5 + ... + (2n - 1) = n²
        </Text>
      )}
    </group>
  );
}

function SquareScene({ n, phase, lensResult }: { n: number; phase: HeroState; lensResult?: SquareGrowthLensResult }) {
  const climax = phase === "hundredClimax";
  const showPractice = phase !== "beacon" && !climax;
  const showFormula = phase === "formulaRevealed" || climax;
  return (
    <>
      <color attach="background" args={["#03040c"]} />
      <fog attach="fog" args={["#03040c", 4.8, 10.8]} />
      <ambientLight intensity={0.45} />
      <pointLight position={[-2.5, 2.5, 4]} intensity={40} color="#fde68a" />
      <pointLight position={[2.5, -0.4, 2.5]} intensity={18} color="#67e8f9" />
      <BeaconSquare lit={climax} />
      {showPractice && (
        <group position={[0, -0.18, 0]}>
          <PracticeSquare n={n} />
        </group>
      )}
      {showFormula && <FormulaInscription n={n} lensResult={lensResult} />}
      <EffectComposer>
        <Bloom luminanceThreshold={0.16} intensity={1.1} mipmapBlur />
        <Vignette eskil={false} offset={0.18} darkness={0.78} />
      </EffectComposer>
    </>
  );
}

export function SquareGrowthHero() {
  const [world, dispatch] = useReducer(
    (state: SquareGrowthState, action: Parameters<typeof dispatchSquareGrowth>[1]) => dispatchSquareGrowth(state, action),
    undefined,
    () => createInitialSquareGrowthState(100),
  );
  const [phase, setPhase] = useState<HeroState>("beacon");
  const phaseRef = useRef(phase);
  const dragStartRef = useRef<{ x: number; y: number } | undefined>(undefined);
  const dragLastRef = useRef<{ x: number; y: number } | undefined>(undefined);
  const grewThisDragRef = useRef(false);
  const frames = useMemo(() => growthSequence(maxPracticeN), []);
  phaseRef.current = phase;
  const n = world.n;
  const effectivePhase = phase === "beacon" || phase === "hundredClimax" ? phase : nextState(n);
  const current = frames[n - 1];

  function grow() {
    if (phaseRef.current === "hundredClimax") return;
    dispatch({ type: "growNextSquareShell", maxN: maxPracticeN });
    if (phaseRef.current === "beacon") {
      setPhase("seed");
      phaseRef.current = "seed";
    }
  }

  function beginDrag(event: PointerEvent<HTMLElement>) {
    event.currentTarget.setPointerCapture(event.pointerId);
    dragStartRef.current = { x: event.clientX, y: event.clientY };
    dragLastRef.current = dragStartRef.current;
    grewThisDragRef.current = false;
    if (phaseRef.current === "beacon") {
      setPhase("seed");
      phaseRef.current = "seed";
    }
  }

  function moveDrag(event: PointerEvent<HTMLElement>) {
    const dragStart = dragStartRef.current;
    if (!dragStart) return;
    const current = { x: event.clientX, y: event.clientY };
    dragLastRef.current = current;
    if (!grewThisDragRef.current && Math.hypot(current.x - dragStart.x, current.y - dragStart.y) > 34) {
      grewThisDragRef.current = true;
      grow();
    }
  }

  function endDrag(event: PointerEvent<HTMLElement>) {
    const dragStart = dragStartRef.current;
    const dragEnd = dragLastRef.current ?? { x: event.clientX, y: event.clientY };
    if (dragStart && !grewThisDragRef.current && Math.hypot(dragEnd.x - dragStart.x, dragEnd.y - dragStart.y) > 34) {
      grow();
    }
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    dragStartRef.current = undefined;
    dragLastRef.current = undefined;
    grewThisDragRef.current = false;
  }

  function revealHundred() {
    dispatch({ type: "applySquareGrowthLens", targetN: world.targetN });
    setPhase("hundredClimax");
    phaseRef.current = "hundredClimax";
  }

  function reset() {
    dispatch({ type: "resetSquareGrowth" });
    setPhase("beacon");
    phaseRef.current = "beacon";
  }

  const prompt =
    effectivePhase === "beacon"
      ? "This dark plaza is 100 by 100. How many lights does it need?"
      : effectivePhase === "hundredClimax"
        ? "The small model lights the whole plaza."
        : n >= maxPracticeN
          ? "You found the rule. Bring it back to the plaza."
          : "Pull outward. Each new border is the next odd number.";

  return (
    <main className={`square-growth-shell is-${effectivePhase}`}>
      <Canvas camera={{ position: [0, 0.05, 5.2], fov: 48 }} className="square-growth-canvas">
        <SquareScene n={n} phase={effectivePhase} lensResult={world.lensResult} />
      </Canvas>
      <div
        aria-hidden="true"
        className="square-growth-gesture-layer"
        onPointerCancel={endDrag}
        onPointerDown={beginDrag}
        onPointerMove={moveDrag}
        onPointerUp={endDrag}
      />
      <section className="square-growth-copy" aria-label="Square Growth">
        <p>Light the Plaza</p>
        <h1>Light the 100×100 plaza.</h1>
      </section>
      <section className="square-growth-inscription" aria-label="Growth state">
        <strong>{prompt}</strong>
        {effectivePhase !== "beacon" && effectivePhase !== "hundredClimax" && (
          <span>
            +{current.added} outer ring → {n}×{n} square.
          </span>
        )}
        {effectivePhase !== "beacon" && effectivePhase !== "hundredClimax" && n >= 4 && (
          <span className="square-growth-formula">
            {n >= maxPracticeN ? "1 + 3 + 5 + ... + (2n - 1) = n²" : `${Array.from({ length: n }, (_, index) => String(2 * index + 1)).join(" + ")} = ${n}²`}
          </span>
        )}
        {effectivePhase === "hundredClimax" && world.lensResult && (
          <span>
            {world.lensResult.n}×{world.lensResult.n} = {world.lensResult.value} lights.
          </span>
        )}
      </section>
      <nav className="square-growth-actions" aria-label="Growth controls" onPointerDown={(event) => event.stopPropagation()}>
        {effectivePhase !== "beacon" && effectivePhase !== "hundredClimax" && (
          <button type="button" onClick={grow}>
            Watch one ring
          </button>
        )}
        {effectivePhase === "formulaRevealed" && (
          <button className="is-primary" type="button" onClick={revealHundred}>
            Light the plaza
          </button>
        )}
        {effectivePhase !== "beacon" && effectivePhase !== "hundredClimax" && (
          <button type="button" onClick={reset}>
            Reset
          </button>
        )}
      </nav>
    </main>
  );
}
