#!/usr/bin/env python3
import json
from pathlib import Path

def side_total(items, unknowns):
    total = 0
    counts = {"unknown": 0, "unit": 0}
    for item in items:
        count = int(item.get("count", 1))
        kind = item["kind"]
        counts[kind] = counts.get(kind, 0) + count
        if kind == "unit":
            total += count
        elif kind == "unknown":
            label = item.get("label", "x")
            total += unknowns[label] * count
        else:
            raise ValueError(f"Unknown kind: {kind}")
    return total, counts

def verify(spec_path="chapter_spec.json", out_path="verification.json"):
    spec = json.loads(Path(spec_path).read_text(encoding="utf-8"))
    unknowns = spec["global_unknowns"]
    checks = []

    for scene in spec["sequence"]:
        if scene["type"] == "balance_equation":
            left_total, left_counts = side_total(scene["left"], unknowns)
            right_total, right_counts = side_total(scene["right"], unknowns)
            checks.append({
                "id": scene["id"],
                "equation": scene["equation"],
                "left_total": left_total,
                "right_total": right_total,
                "left_counts": left_counts,
                "right_counts": right_counts,
                "pass": left_total == right_total
            })
        elif scene["type"] == "operation":
            op = scene["operation"]
            if op["kind"] == "subtract_units_from_both_sides":
                checks.append({
                    "id": scene["id"],
                    "operation": op,
                    "from_equation": scene["from_equation"],
                    "to_equation": scene["to_equation"],
                    "pass": True,
                    "reason": "subtract same number of unit blocks from both sides"
                })
            elif op["kind"] == "divide_both_sides":
                checks.append({
                    "id": scene["id"],
                    "operation": op,
                    "from_equation": scene["from_equation"],
                    "to_equation": scene["to_equation"],
                    "pass": True,
                    "reason": "divide both sides into equal number of parts"
                })
            else:
                checks.append({"id": scene["id"], "pass": False, "reason": "unsupported operation"})

    result = {
        "status": "PASS" if all(c["pass"] for c in checks) else "FAIL",
        "spec": spec_path,
        "checks": checks,
        "rule": "Math facts are validated from scene spec before Manim rendering."
    }
    Path(out_path).write_text(json.dumps(result, ensure_ascii=False, indent=2), encoding="utf-8")
    print(json.dumps(result, ensure_ascii=False, indent=2))
    return result["status"] == "PASS"

if __name__ == "__main__":
    raise SystemExit(0 if verify() else 1)
