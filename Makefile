SHELL := /bin/bash

.PHONY: sync verify compile render render-fast keyframes clean

sync:
	uv sync

verify:
	uv run python verify.py

compile:
	uv run python compile_to_manim.py chapter_spec.json --out generated/balance_equations_scene.py

render:
	uv run python render_local.py

render-fast:
	uv run python render_local.py --quality ql

keyframes:
	uv run python render_local.py --quality ql --skip-video

clean:
	rm -rf media renders __pycache__ .pytest_cache
	find . -name "__pycache__" -type d -prune -exec rm -rf {} +
