# Math Wild

Math Wild is a **Mathematical Imagination OS**.

It is an interactive mathematical world where users manipulate semantic objects, discover reusable mathematical lenses, test their boundaries, and compile their actions into proof.

This repo currently implements the first product slice:

```text
Square Growth Lens
```

The user starts with a distant unresolved Beacon:

```text
100×100 dark light plaza
```

They return to a smaller local object:

```text
1×1 seed square
```

Through one action, growing outward, the world reveals:

```text
1
1 + 3
1 + 3 + 5
1 + 3 + 5 + 7
```

Each new odd number is not just another term. It is the next square shell:

```text
k bottom-edge lights + (k - 1) right-edge lights = 2k - 1
```

That recognition becomes a reusable Lens.

```text
Square Growth Lens:
1 + 3 + 5 + ... + (2n - 1) is an n×n square.
```

The current Hero applies that Lens back to the 100×100 Beacon:

```text
1 + 3 + 5 + ... + 199 = 100² = 10000
```

## Shape

```text
apps/
└─ wilderness-web/        React + Three.js wilderness experience

packages/
├─ core/                  world state, actions, trace, recognition, lenses, proof compiler
└─ three-world/           semantic geometry helpers for Three renderer

specs/
└─ square-growth-lens.json
```

Rectangle Completion remains a later Shrine candidate. It is no longer the first Hero.

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

React and Three.js visualize semantic state. Geometry helpers encode the mathematical structure being rendered.

## Current Geometry Contract

The Square Growth slice is built around outer shell growth:

```text
squareShell(k).length === 2k - 1
squareDots(n).length === n²
sum(shells 1..n) === n²
```

## Tests

Current coverage includes:

```text
rectangle completion legacy core tests
square shell length
square dot count
growth sequence totals
desktop Square Growth interaction
mobile Square Growth drag interaction
100×100 climax
```

Run:

```bash
pnpm test
pnpm test:e2e
```

## Product Standard

Success is not:

```text
The page showed a formula.
```

Success is:

```text
I found that each next odd number grows a square by one outer layer.
```
