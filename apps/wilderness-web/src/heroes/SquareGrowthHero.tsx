import { Canvas, useFrame } from "@react-three/fiber";
import { Float, Text } from "@react-three/drei";
import { Bloom, EffectComposer, Vignette } from "@react-three/postprocessing";
import { useMemo, useRef, useState, type PointerEvent } from "react";
import type { Mesh } from "three";
import { growthSequence, squareDots } from "@math-wild/three-world";

type HeroState = "beacon" | "seed" | "growing" | "structureVisible" | "formulaRevealed" | "hundredClimax";

const maxPracticeN = 6;

function oddSum(n: number) {
  return Array.from({ length: n }, (_, index) => String(2 * index + 1)).join(" + ");
}

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
  scale = 1,
}: {
  x: number;
  y: number;
  fresh: boolean;
  scale?: number;
}) {
  const ref = useRef<Mesh>(null);
  useFrame(({ clock }) => {
    if (!ref.current) return;
    const pulse = fresh ? Math.sin(clock.elapsedTime * 8) * 0.045 : Math.sin(clock.elapsedTime * 2 + x) * 0.012;
    ref.current.scale.setScalar(scale + pulse);
  });

  return (
    <mesh ref={ref} position={[x, y, 0]}>
      <sphereGeometry args={[0.07, 18, 18]} />
      <meshStandardMaterial
        color={fresh ? "#67e8f9" : "#fbbf24"}
        emissive={fresh ? "#0891b2" : "#b45309"}
        emissiveIntensity={fresh ? 1.65 : 0.95}
        roughness={0.28}
      />
    </mesh>
  );
}

function PracticeSquare({ n }: { n: number }) {
  const dots = useMemo(() => squareDots(n), [n]);
  const freshRing = n;
  const spacing = 0.28;

  return (
    <group position={[0, -0.22, 0]}>
      <mesh position={[0, 0, -0.08]}>
        <boxGeometry args={[Math.max(1.1, n * spacing + 0.42), Math.max(1.1, n * spacing + 0.42), 0.04]} />
        <meshStandardMaterial color="#111827" emissive="#0f172a" emissiveIntensity={0.5} transparent opacity={0.68} />
      </mesh>
      {dots.map((dot) => (
        <GlowDot key={dot.id} x={dot.x * spacing} y={dot.y * spacing} fresh={dot.ring === freshRing && n > 1} />
      ))}
      {n >= 2 && (
        <group position={[0, -n * spacing * 0.5 - 0.46, 0.04]}>
          <mesh>
            <boxGeometry args={[n * spacing + 0.4, 0.018, 0.018]} />
            <meshStandardMaterial color="#5eead4" emissive="#14b8a6" emissiveIntensity={1.2} />
          </mesh>
          <Text position={[0, -0.18, 0]} fontSize={0.12} color="#ccfbf1" anchorX="center">
            side length {n}
          </Text>
        </group>
      )}
    </group>
  );
}

function BeaconSquare({ lit }: { lit: boolean }) {
  const samples = useMemo(() => {
    const dots = [];
    for (let row = 0; row < 24; row += 1) {
      for (let column = 0; column < 24; column += 1) {
        if ((row + column) % 2 === 0 || row % 7 === 0 || column % 7 === 0) {
          dots.push({ id: `beacon-${row}-${column}`, x: column, y: row });
        }
      }
    }
    return dots;
  }, []);

  return (
    <Float speed={0.45} floatIntensity={0.1}>
      <group position={lit ? [0, 0.2, -1.4] : [0, 1.55, -2.7]} scale={lit ? 0.13 : 0.05}>
        <mesh position={[11.5, -11.5, -0.2]}>
          <boxGeometry args={[26, 26, 0.1]} />
          <meshStandardMaterial color="#020617" emissive={lit ? "#92400e" : "#111827"} emissiveIntensity={lit ? 1.15 : 0.2} transparent opacity={lit ? 0.95 : 0.86} />
        </mesh>
        {samples.map((dot) => (
          <mesh key={dot.id} position={[dot.x, -dot.y, 0]}>
            <sphereGeometry args={[0.18, 8, 8]} />
            <meshStandardMaterial
              color={lit ? "#fde68a" : "#334155"}
              emissive={lit ? "#f59e0b" : "#0f172a"}
              emissiveIntensity={lit ? 1.4 : 0.35}
              transparent
              opacity={lit ? 0.95 : 0.54}
            />
          </mesh>
        ))}
      </group>
    </Float>
  );
}

function FormulaInscription({ n, hundred }: { n: number; hundred: boolean }) {
  if (hundred) {
    return (
      <group position={[0, -1.55, 0.2]}>
        <Text fontSize={0.2} color="#fef3c7" anchorX="center">
          1 + 3 + 5 + ... + 199 = 100²
        </Text>
        <Text position={[0, -0.34, 0]} fontSize={0.38} color="#fde68a" anchorX="center">
          10000
        </Text>
      </group>
    );
  }

  if (n < 2) return null;
  return (
    <group position={[0, -1.62, 0.18]}>
      <Text fontSize={0.16} color="#fef3c7" anchorX="center">
        {oddSum(n)} = {n}²
      </Text>
      {n >= maxPracticeN && (
        <Text position={[0, -0.3, 0]} fontSize={0.15} color="#ccfbf1" anchorX="center">
          1 + 3 + 5 + ... + (2n - 1) = n²
        </Text>
      )}
    </group>
  );
}

function SquareScene({ n, phase }: { n: number; phase: HeroState }) {
  const climax = phase === "hundredClimax";
  return (
    <>
      <color attach="background" args={["#03040c"]} />
      <fog attach="fog" args={["#03040c", 4.8, 10.8]} />
      <ambientLight intensity={0.45} />
      <pointLight position={[-2.5, 2.5, 4]} intensity={40} color="#fde68a" />
      <pointLight position={[2.5, -0.4, 2.5]} intensity={18} color="#67e8f9" />
      <BeaconSquare lit={climax} />
      {!climax && (
        <group position={[0, -0.18, 0]}>
          <PracticeSquare n={n} />
        </group>
      )}
      <FormulaInscription n={n} hundred={climax} />
      <EffectComposer>
        <Bloom luminanceThreshold={0.16} intensity={1.1} mipmapBlur />
        <Vignette eskil={false} offset={0.18} darkness={0.78} />
      </EffectComposer>
    </>
  );
}

export function SquareGrowthHero() {
  const [n, setN] = useState(1);
  const [phase, setPhase] = useState<HeroState>("beacon");
  const [dragStart, setDragStart] = useState<{ x: number; y: number } | undefined>();
  const frames = useMemo(() => growthSequence(maxPracticeN), []);
  const current = frames[n - 1];

  function grow() {
    if (phase === "hundredClimax") return;
    const next = Math.min(maxPracticeN, n + 1);
    setN(next);
    setPhase(nextState(next));
  }

  function beginDrag(event: PointerEvent<HTMLElement>) {
    event.currentTarget.setPointerCapture(event.pointerId);
    setDragStart({ x: event.clientX, y: event.clientY });
    if (phase === "beacon") setPhase("seed");
  }

  function moveDrag(event: PointerEvent<HTMLElement>) {
    if (!dragStart) return;
    if (Math.hypot(event.clientX - dragStart.x, event.clientY - dragStart.y) > 34) {
      setDragStart({ x: event.clientX, y: event.clientY });
      grow();
    }
  }

  function endDrag(event: PointerEvent<HTMLElement>) {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    setDragStart(undefined);
  }

  function revealHundred() {
    setN(maxPracticeN);
    setPhase("hundredClimax");
  }

  const prompt =
    phase === "beacon"
      ? "How many lights would fill a 100×100 square?"
      : phase === "hundredClimax"
        ? "The distant square is 100 by 100."
        : "Pull outward. Each new ring is the next odd number.";

  return (
    <main
      className={`square-growth-shell is-${phase}`}
      onPointerCancel={endDrag}
      onPointerDown={beginDrag}
      onPointerMove={moveDrag}
      onPointerUp={endDrag}
    >
      <Canvas camera={{ position: [0, 0.05, 5.2], fov: 48 }} className="square-growth-canvas">
        <SquareScene n={n} phase={phase} />
      </Canvas>
      <section className="square-growth-copy" aria-label="Square Growth">
        <p>Square Growth</p>
        <h1>Light grows in odd rings.</h1>
      </section>
      <section className="square-growth-inscription" aria-label="Growth state">
        <strong>{prompt}</strong>
        {phase !== "beacon" && phase !== "hundredClimax" && (
          <span>
            +{current.added} lights makes a {n}×{n} square.
          </span>
        )}
        {phase !== "beacon" && phase !== "hundredClimax" && n >= 4 && (
          <span className="square-growth-formula">
            {n >= maxPracticeN ? "1 + 3 + 5 + ... + (2n - 1) = n²" : `${oddSum(n)} = ${n}²`}
          </span>
        )}
        {phase === "hundredClimax" && <span>1 + 3 + 5 + ... + 199 = 10000</span>}
      </section>
      <nav className="square-growth-actions" aria-label="Growth controls" onPointerDown={(event) => event.stopPropagation()}>
        <button type="button" onClick={grow}>
          Grow one ring
        </button>
        <button type="button" onClick={revealHundred}>
          Light 100×100
        </button>
      </nav>
    </main>
  );
}
