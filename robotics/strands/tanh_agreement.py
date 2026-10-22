"""STRANDS-3: does Python's ``math.tanh`` ever flip the small model's argmax against V8's ``Math.tanh``?

ra-lm-h's hidden layer is h = tanh(V·[s,1]). The arena trains and runs it in V8 (``Math.tanh``); the Python adapter
(robotics/strands/policies.py SmallLmPolicy) runs the exported weights with ``math.tanh``. The two libraries may differ in
the last bit, and a last-bit difference can flip an argmax between two near-tied labels. This measures it instead of
assuming: the bridge (``js_lm_rows``) hands over the model's own training rows, each labelled by V8's forward pass, and
the Python adapter labels the same rows with its own arithmetic. Agreement is counted per row.

    python3 robotics/strands/tanh_agreement.py            # every training row of ra-lm-h, written to docs/evals/strands.json
    python3 robotics/strands/tanh_agreement.py --limit 40 # a sample per task (what the selftest runs); writes nothing

Standard library only. Simulated data only (the rows are the seeded synthetic demonstrations the arena trains on).
"""

from __future__ import annotations

import argparse
import json
import math
import sys
import time
from pathlib import Path
from typing import Any, Dict, List, Optional

sys.path.insert(0, str(Path(__file__).resolve().parents[2]))

from robotics.strands.policies import SmallLmPolicy, _base  # noqa: E402
from robotics.strands.sim_robot import ROOT, Bridge  # noqa: E402

EVAL_PATH = ROOT / "docs" / "evals" / "strands.json"


def py_label(pol: SmallLmPolicy, sc: str, x: List[float], text_keys: Optional[Dict[str, Any]]) -> Optional[str]:
    """The Python adapter's argmax for one training row, with its own ``_scene``, ``_hidden`` (math.tanh), ``_t`` and ``_logit``."""
    base = _base(sc)
    task = sc if sc in pol.m["labelsByTask"] else base
    labels = pol.m["labels"]
    mask = [labels.index(l) for l in pol.m["labelsByTask"].get(task, [])]
    if not mask:
        return None
    t = pol._t(sc, base, {"text_keys": text_keys or {}})
    s = pol._hidden(pol._scene(x))
    best, bl = -math.inf, -1
    for l in mask:
        v = pol._logit(l, t, s)
        if v > best:
            best, bl = v, l
    return labels[bl] if bl >= 0 else "wait"


def measure(model: str = "ra-lm-h", limit: int = 0, bridge: Optional[Bridge] = None) -> Dict[str, Any]:
    """Argmax agreement, Python vs V8, over the model's training rows (``limit`` > 0: that many rows per task)."""
    t0 = time.time()
    own = bridge is None
    b = bridge or Bridge()
    try:
        r = b.call({"op": "js_lm_rows", "model": model, "limit": int(limit)})
    finally:
        net = b.close().get("network", 0) if own else 0
    if not r.get("ok"):
        raise RuntimeError(r.get("error", "js_lm_rows failed"))
    pol = SmallLmPolicy(model, "stations")
    agree, flips, skipped, py_ok, js_ok, by_task = 0, [], [], 0, 0, {}
    for row in r["data"]:
        py = py_label(pol, row["sc"], row["x"], row.get("text_keys"))
        bt = by_task.setdefault(row["sc"], {"rows": 0, "agree": 0, "flips": 0})
        bt["rows"] += 1
        if py is None:
            skipped.append(row["sc"])
            continue
        if py == row["js"]:
            agree += 1
            bt["agree"] += 1
        else:
            bt["flips"] += 1
            if len(flips) < 10:
                flips.append({"sc": row["sc"], "x": row["x"], "text_keys": row.get("text_keys"), "python": py, "v8": row["js"], "demo": row["demo"]})
        py_ok += 1 if py == row["demo"] else 0
        js_ok += 1 if row["js"] == row["demo"] else 0
    n = len(r["data"])
    compared = n - len(skipped)
    return {
        "model": model, "build": "stations (the arena's published build)", "H": r.get("H"), "rows": n, "trainRows": r.get("trainRows"),
        "rowsEqualTraining": (limit == 0 and n == r.get("trainRows")), "compared": compared, "agree": agree, "flips": compared - agree,
        "flipExamples": flips, "skippedTasks": sorted(set(skipped)), "byTask": by_task,
        "trainAccuracyV8": r.get("trainAccuracy"), "trainAccuracyV8Recomputed": round(js_ok / compared, 4) if compared else None,
        "trainAccuracyPython": round(py_ok / compared, 4) if compared else None,
        "python": f"math.tanh ({sys.version.split()[0]})", "v8": "Math.tanh (node)", "limitPerTask": int(limit), "network": net,
        "seconds": round(time.time() - t0, 1),
        "note": "a flip is a training row where the Python adapter's argmax differs from V8's on the same exported weights; 0 flips means the two tanh implementations never changed a label on these rows",
    }


def main(argv: Optional[List[str]] = None) -> int:
    ap = argparse.ArgumentParser(description=__doc__.split("\n", 1)[0])
    ap.add_argument("--model", default="ra-lm-h")
    ap.add_argument("--limit", type=int, default=0, help="rows per task (0 = every training row)")
    ap.add_argument("--no-write", action="store_true")
    a = ap.parse_args(argv)
    out = measure(a.model, a.limit)
    if a.limit == 0 and not a.no_write:
        doc = json.loads(EVAL_PATH.read_text()) if EVAL_PATH.exists() else {}
        doc["tanhAgreement"] = out
        EVAL_PATH.write_text(json.dumps(doc, indent=1, ensure_ascii=False) + "\n")
    print(json.dumps({k: v for k, v in out.items() if k not in ("flipExamples", "byTask")}))
    for sc, t in out["byTask"].items():
        print(f"  {sc:28s} rows {t['rows']:5d} agree {t['agree']:5d} flips {t['flips']}")
    for f in out["flipExamples"]:
        print("  flip:", json.dumps(f))
    return 0 if out["flips"] == 0 and not out["skippedTasks"] else 1


if __name__ == "__main__":
    sys.exit(main())
