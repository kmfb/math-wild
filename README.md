# Math Wild

Math Wild is a **Mathematical Imagination OS**.

It is an interactive mathematical world where users manipulate semantic objects, discover reusable mathematical lenses, test their boundaries, and compile their actions into proof.

This repo currently implements the first product slice:

```text
Rectangle Completion Lens
```

The user starts with a distant unresolved Beacon:

```text
100-layer triangular dot mountain
```

They explore a smaller local object:

```text
8-layer stair-dot pattern
```

Through duplicate, flip, drag, and snap actions, the system recognizes:

```text
two identical stair-dot patterns complete a rectangle
uniform rows
```

That recognition becomes a reusable Lens. The user can apply it to the 100-layer Beacon, test it on a nearby broken stair counterexample, and compile the semantic trace into proof.

## Shape

```text
apps/
└─ wilderness-web/        React + Three.js wilderness experience

packages/
├─ core/                  world state, actions, trace, recognition, lenses, proof compiler
└─ three-world/           semantic dot layout helpers for Three renderer

specs/
└─ rectangle-completion-lens.json
```

## Commands

```bash
pnpm install
pnpm test
pnpm build
pnpm dev
```

The dev server runs:

```text
apps/wilderness-web
```

## Core Loop

```text
Beacon
-> Exploration
-> Recognition
-> Lens Creation
-> Lens Application
-> Lens Failure Boundary
-> Proof Compilation
-> New Horizon
```

## Source Of Truth

The renderer is not the source of mathematical truth.

The source of truth is:

```text
WorldState
MathObject
MathAction
TraceEvent
RecognitionResult
MathLens
LensResult
ProofStep
```

React and Three.js visualize semantic state. The reducer mutates semantic state. The proof compiler reads trace and Lens results.

## Required Outputs

The first slice can produce:

```text
trace.json
lens.json
lens_result.json
proof_steps.json
proof.md
```

These are generated in memory by:

```ts
exportArtifacts(worldState)
```

## Tests

Current unit coverage includes:

```text
stair dot count
duplicate preserves count
flip preserves count
rectangle completion recognition
uniform row recognition
Lens applicability success
Lens applicability failure
proof compilation
```

Run:

```bash
pnpm test
```

## Product Standard

Success is not:

```text
The page showed a formula.
```

Success is:

```text
I found a method.
This method works here, but not on every pattern.
```
