# Math Wild

## Purpose

Math Wild is a **Mathematical Imagination OS**.

It is not a course, worksheet, video library, whiteboard, puzzle game, or prettier school-math tutorial.

Math Wild exists to help people:

```text
play with mathematical objects
notice structure
create a reusable lens
test where the lens works
see where it fails
compile their actions into proof
share the resulting playable proof
```

The user is not merely a learner.

The user is a mathematical author.

## Core Product Principle

Math Wild is built around **Lens Discovery**.

A Lens is a reusable mathematical way of seeing.

A good experience does not end with an answer. It ends with a tool the user can apply elsewhere.

Current first Lens:

```text
Discovery:
Each next odd number grows a square by one outer shell.

Lens:
Square Growth Lens

Power:
It sees 1 + 3 + 5 + ... + (2n - 1) as an n×n square.

Boundary:
It applies to odd square-shell growth, not arbitrary sequences.
```

## Highest-Level Loop

Every major experience follows:

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

## Source of Truth

No renderer is the source of mathematical truth.

Not React.
Not Three.js.
Not SVG.
Not Manim.
Not animation state.

The source of truth is:

```text
WorldState
MathObject
MathAction
Trace
RecognitionResult
MathLens
LensResult
ProofPlan
```

## Required Core Entities

Only these entities are core.

```text
WorldState
MathObject
MathAction
TraceEvent
RecognitionResult
MathLens
ApplicabilityResult
LensResult
ProofStep
Beacon
```

Do not introduce new core entities unless they remove more complexity than they add.

## Product Interface

The main user experience is a **mathematical wilderness**, not a whiteboard.

The interface should feel like entering a quiet mathematical world:

```text
distant unresolved objects
breathable space
physical mathematical objects
glowing lenses
world feedback
formula inscriptions
visible boundaries of a method
```

Do not make the main interface feel like:

```text
spreadsheet
slide deck
whiteboard
dashboard
editor
worksheet
tool panel
```

## Technology Direction

The main product uses:

```text
React
TypeScript
Vite
React Three Fiber
Three.js
Drei
postprocessing
Vitest
Playwright
```

The core is custom:

```text
world kernel
recognition
lens engine
trace
proof compiler
```

## Renderer Rule

The renderer visualizes semantic state.

Bad:

```ts
mesh.position.x += 10;
```

Good:

```ts
dispatch({
  type: "dragObject",
  objectId,
  toWorldPosition,
});
```

The renderer does not mutate truth. The world reducer mutates truth.

## Interaction Rule

Pointer gestures are not mathematical actions.

Dragging is an input gesture.

The action recorded in trace must be semantic:

```text
duplicateDotSet
flipDotSet
dragDotSet
snapToRectangleCompletion
growSquareShell
applyLens
testLensOnCounterexample
acceptLens
compileProof
```

## Aesthetic Rule

Beauty is part of cognition.

Every visual effect must serve a mathematical role.

```text
distance creates desire
fog creates mystery
glow reveals structure
snap reveals fit
fracture reveals failure
lens reveals a way of seeing
inscription reveals compression
```

Decorative beauty without mathematical function is noise.

## Formula Rule

Formula appears after structure.

Correct order:

```text
object
action
recognized structure
lens
application
proof
formula
```

Formula is compression, not instruction.

## Failure Rule

A Lens must have a boundary.

Every important Lens should be testable on at least one nearby non-example.

The system should show:

```text
where the Lens applies
where it fails
why it fails
what condition is missing
```

A mathematical tool without a boundary is not yet understood.

## Proof Rule

Proof is compiled from trace.

A proof should not be separately authored when the user's semantic actions already contain the proof path.

Trace should be sufficient to produce:

```text
proof.md
proof_steps.json
optional manim_plan.json
```

## First Target

The first target experience is:

```text
Square Growth Lens
```

World:

```text
Square World
```

Beacon:

```text
100×100 dark light plaza
```

Practice object:

```text
1×1 seed square
```

Counterexample:

```text
nearby sequence that does not grow by odd square shells
```

Success sentence:

```text
I found that each next odd number grows a square by one outer layer.
It works for odd square-shell growth, but not every sequence.
```

## Anti-Goals

Do not prioritize:

```text
more lessons
more chapters
more formulas
more UI panels
AI image generation
static posters
preauthored step-by-step proofs
whiteboard editing
course navigation
```

until the Lens Discovery loop works.

## One Sentence

Math Wild is a system for helping people **create mathematical lenses, test their boundaries, and compile their discoveries into proof**.
