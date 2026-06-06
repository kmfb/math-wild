SHELL := /bin/bash

.PHONY: sync verify compile render render-fast keyframes clean

sync:
	uv sync

verify:
	uv run python verify.py --all

compile:
	uv run python compile_to_manim.py chapters/balance_equations/chapter_spec.json --out generated/balance_equations_scene.py

render:
	uv run python render.py --all

render-fast:
	uv run python render.py --all --quality ql

keyframes:
	uv run python render.py --all --quality ql --skip-video

clean:
	rm -rf media renders __pycache__ .pytest_cache
	find . -name "__pycache__" -type d -prune -exec rm -rf {} +
