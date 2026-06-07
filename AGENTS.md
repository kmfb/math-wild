# Math Wild Agent Principles

## Core Thesis

Math Wild is not a prettier math tutorial, a Manim generator, or an interactive problem bank.

Math Wild is a reproducible process for producing mathematical insight.

The project exists to turn mathematical concepts into operable worlds where learners act, receive world feedback, see structure emerge, name the structure, compress it into formal notation, and transfer it to a new case.

The core process is:

```text
curiosity -> action -> structure appears -> surprise -> naming -> formalization -> transfer
```

The highest standard is not whether the page looks good, the animation is smooth, the code is elegant, or the chapter count is high. The highest standard is:

> Can someone who has not been pre-taught the concept operate the world and say the core structure in their own words?

Examples:

- Triangle numbers: "Two identical triangles fit together into a rectangle."
- Equation balance: "The equals sign means the relationship between both sides stays the same."
- Distributive law: "One rectangle can be cut into parts, and the total area stays the same."

## Product Definition

Math Wild is a playable mathematical insight system.

It should create the feeling:

> I was not just taught this. I saw it myself.

Videos, posters, labs, formulas, explanations, traces, and renderers are outputs. They are not the source of truth. The source of truth is the learning transformation caused by an operable mathematical world.

## Wonder Loop

Every concept should be designed through the Wonder Loop before implementation.

1. Hook
   Start with a question that creates curiosity and tension.

2. World
   Give the learner an operable mathematical world, not a static diagram.

3. Friction
   Let the learner feel why the naive method is clumsy.

4. Transformation
   Give the learner one strong main action that changes the world.

5. Revelation
   Make the structure appear from the action. Do not explain it first.

6. Naming
   Name the structure only after the learner has seen it.

7. Compression
   Let the formula appear as a compressed form of the seen structure.

8. Transfer
   Change the number or context so the learner sees that the structure is general.

## Design Priorities

Work in this order:

1. Experience Line
   Can the learner feel the insight?

2. Formal Line
   Can the insight be accurately expressed as formula, proof, video, or explanation?

3. Engine Line
   Can the process be reused through specs, invariants, traces, renderers, and verifiers?

The engine serves the experience and formal lines. Do not let architecture come before the first strong learning experience.

## Non-Negotiable Principles

- Experience before naming.
- World feedback before written explanation.
- Formula as reward, not introduction.
- One main action per concept.
- Fewer buttons, more operable objects.
- Less instruction, more invitation.
- First create wonder, then make it rigorous.
- A concept is not done until the learner can state the revelation sentence.

## Concept Design Doc

Before adding a new concept or major learning experience, write this design first:

```text
1. Concept
What mathematical idea is being learned?

2. Hook
What question makes the learner want to act?

3. Main Action
What is the one core action?

4. Revelation Sentence
What should the learner be able to say after playing?

5. Formal Compression
What formula or formal statement compresses the seen structure?

6. Transfer
What changed number or scenario proves this was not a one-off trick?

7. Success Test
How will we test whether an unprepared learner can state the revelation sentence?
```

## Current North Star

v0.9 is not merely "Playable Proof Hero". It is the first complete Wonder Loop.

Current object: triangle numbers.

Current revelation sentence:

> Two identical triangles fit together into a rectangle.

The triangle-number Hero should be judged by this audit:

- Does the Hook make the learner want to know the answer?
- Does the learner feel that counting is the clumsy path?
- Is there exactly one main action?
- Does snapping the triangles make the structure visible?
- Does the formula appear late enough?
- Does the 100-layer case create a transfer/climax moment?
- Can a new learner say the revelation sentence after 60 seconds?

If any item fails, fix that item before adding new chapters, new engines, or new visual polish.

## Development Guidance

When working on Math Wild:

- Do not add new chapters just to increase breadth.
- Do not build broad abstractions before there are multiple strong examples.
- Do not let React, Manim, verifier, trace, or invariant code become the learning source of truth.
- Keep UI controls subordinate to the mathematical object on the stage.
- Prefer direct manipulation over step buttons.
- Prefer visible structural change over explanatory text.
- Keep each concept centered on one verb:
  - Triangle numbers: fit/pair.
  - Equations: transform both sides.
  - Distributive law: cut.
  - Ratio: scale.

## Roadmap Orientation

- v0.9: First complete Wonder Loop, using triangle numbers.
- v1.0: Export the same triangle-number learning process into playable lab, Manim explainer, and long-form lesson.
- v1.1: Second Wonder Loop, equation balance.
- v1.2: Third Wonder Loop, distributive law.
- v1.3: Only after several strong loops exist, abstract the Wonder Loop engine.

The project should grow from proven insight experiences into reusable systems, not from a speculative platform into experiences.
