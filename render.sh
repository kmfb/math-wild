#!/usr/bin/env bash
set -euo pipefail

export PYTHONPATH="$PWD/src:$PWD"

python verify.py
python compile_to_manim.py chapter_spec.json --out generated/balance_equations_scene.py

mkdir -p renders/keyframes

manim -qh generated/balance_equations_scene.py GeneratedBalanceEquations
VIDEO=$(find media -type f \( -name "*GeneratedBalanceEquations*.mp4" -o -name "GeneratedBalanceEquations.mp4" \) | sort | tail -n 1)
cp "$VIDEO" renders/balance_equations_manim.mp4

for SCENE in KF01MainBalance KF02SubtractThree KF03XEqualsFive KF04TwoX KF05SplitTwoX KF06Summary; do
  manim -qh -s --format=png generated/balance_equations_scene.py "$SCENE"
  PNG=$(find media -type f -name "*${SCENE}*.png" | sort | tail -n 1)
  cp "$PNG" "renders/keyframes/${SCENE}.png"
done

python poster_composer.py --keyframes renders/keyframes --out renders/balance_equations_poster_from_manim.png
echo "Done. See renders/"
