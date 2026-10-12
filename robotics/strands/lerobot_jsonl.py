"""A LeRobot-style JSONL exporter for the arena dataset (schema smartcitix.robotics.arena-episode@2).

STRANDS-2 (docs/strands-robots.md, "LeRobot-style dataset mapping"). Standard library only. LeRobot's own format stores
its frame tables in Parquet, which needs a dependency this repository does not take, so this writes the same layout
with JSON Lines in place of Parquet: it is LeRobot-STYLE, not a LeRobot dataset, and LeRobot's loader will not read it
as is. Nothing is uploaded or sent anywhere.

Input: an arena dataset directory with ``index.json``, ``schema.json`` and ``instructions.json`` beside the step lines:
  * the full set, written outside the repo with ``node tools/ra_dataset.mjs --full --out <dir>`` (shards listed in
    ``index.json`` ``full.shards``), or
  * the committed sample (``exports/robotics/arena``, files listed in ``index.json`` ``sample``), with ``--sample``.

Output (``<out>``):
  meta/info.json        the codebase version tag, totals, splits (episode index lists), features, and the provenance
  meta/tasks.jsonl      { task_index, task, scenario } (task = the instruction text from instructions.json)
  meta/episodes.jsonl   { episode_index, episode_id, scenario, split, source, consent, length, tasks }
  meta/actions.jsonl    { scenario, action_index, label } (the discrete action-label table per scenario)
  data/chunk-000/episode_NNNNNN.jsonl   one frame per line (fields in FRAME_FIELDS)

The field mapping follows the table in docs/strands-robots.md. Every line in this dataset version is synthetic
(consent null); a consented line would carry its consent receipt through unchanged.

    python3 robotics/strands/lerobot_jsonl.py <dataset_dir> <out_dir> [--sample]
    python3 robotics/strands/lerobot_jsonl.py --check <dataset_dir> <out_dir> [--sample]   # export, read back, compare

The check: episode and frame counts per split and per scenario equal index.json's (the full set) or the sample list's
(the sample); the read-back of the written files gives the same counts; every frame row has the documented fields;
leakage 0 (no episode id in two splits, and no episode drawn from an arena held-out seed range 7121-7300).
"""

from __future__ import annotations

import json
import re
import shutil
import sys
from pathlib import Path
from typing import Any, Dict, List, Tuple

SCHEMA = "smartcitix.robotics.arena-episode@2"
EXPORT_VERSION = "st-lerobot-jsonl/1"
FRAME_FIELDS = ["index", "episode_index", "frame_index", "timestamp", "task_index", "observation.state", "observation.robots_active",
                "action", "action.label", "action.index", "next.reward", "next.done", "rules.unsafe", "rules.outcome", "station.step",
                "source", "consent", "split"]
HELD_OUT_SEEDS = range(7121, 7301)  # the arena's held-out ranges: rounds 6b (7121-7180), 7 (7181-7240), 8 (7241-7300)
ROOT = Path(__file__).resolve().parents[2]


def _scenario_dt() -> Dict[str, float]:
    """The step time per scenario where rb-robotics-data.js states one (the stations: 0.05 s); gym games are turn-based."""
    p = ROOT / "WebXR" / "shared" / "rb-robotics-data.js"
    out: Dict[str, float] = {}
    if p.exists():
        for m in re.finditer(r'id: "(rb-[a-z0-9-]+)"[^}\n]*?dt: ([0-9.]+)', p.read_text(encoding="utf-8")):
            out[m.group(1)] = float(m.group(2))
    return out


def _label(scenario: str, action: Dict[str, Any]) -> str:
    """A discrete label for the action (the env action itself is kept in ``action``)."""
    t = str(action.get("type", "wait"))
    if t == "route":
        return "route:" + ",".join(str(m) for m in action.get("moves", []))
    if t == "set" and "param" in action:
        return f"set-{action['param']}"
    if t == "test" and "what" in action:
        return f"test-{action['what']}"
    if t == "move" and "dir" in action:
        return f"move-{action['dir']}"
    return t


def _files(src: Path, index: Dict[str, Any], sample: bool) -> List[Tuple[str, int]]:
    if sample:
        return [(e["path"], e["lines"]) for e in index["sample"]]
    return [(e["path"], e["lines"]) for e in index["full"]["shards"]]


def _seed_of(episode_id: str) -> int:
    m = re.search(r"-(\d+)$", episode_id)
    return int(m.group(1)) if m else -1


def export(src: Path, out: Path, sample: bool = False) -> Dict[str, Any]:
    index = json.loads((src / "index.json").read_text(encoding="utf-8"))
    schema = json.loads((src / "schema.json").read_text(encoding="utf-8"))
    instr = json.loads((src / "instructions.json").read_text(encoding="utf-8"))
    if index.get("schema") != SCHEMA or schema.get("schema") != SCHEMA:
        raise ValueError(f"expected schema {SCHEMA}, found {index.get('schema')} / {schema.get('schema')}")
    dt = _scenario_dt()
    if out.exists():
        shutil.rmtree(out)
    (out / "meta").mkdir(parents=True)
    (out / "data" / "chunk-000").mkdir(parents=True)

    episodes: Dict[str, Dict[str, Any]] = {}
    frames: Dict[str, List[Dict[str, Any]]] = {}
    lines_read, expected_lines = 0, 0
    for rel, n in _files(src, index, sample):
        expected_lines += n
        with open(src / rel, encoding="utf-8") as f:
            for line in f:
                if not line.strip():
                    continue
                d = json.loads(line)
                lines_read += 1
                if d.get("schema") != SCHEMA:
                    raise ValueError(f"{rel}: line with schema {d.get('schema')}")
                eid = d["episode"]
                if eid not in episodes:
                    episodes[eid] = {"episode_id": eid, "scenario": d["scenario"], "split": d["split"], "source": d["source"], "consent": d["consent"],
                                     "station": d.get("station"), "instruction": d["instruction"]}
                    frames[eid] = []
                elif episodes[eid]["split"] != d["split"]:
                    episodes[eid]["leak"] = True
                frames[eid].append(d)

    tasks: Dict[str, int] = {}
    actions: Dict[Tuple[str, str], int] = {}
    per_scenario_labels: Dict[str, int] = {}
    order = sorted(episodes, key=lambda e: (["train", "validation", "test"].index(episodes[e]["split"]), episodes[e]["scenario"], e))
    gidx = 0
    ep_rows, splits = [], {"train": [], "validation": [], "test": []}
    for ei, eid in enumerate(order):
        ep = episodes[eid]
        sc = ep["scenario"]
        key = ep["instruction"]
        if key not in tasks:
            tasks[key] = len(tasks)
        fr = sorted(frames[eid], key=lambda d: d["t"])
        with open(out / "data" / "chunk-000" / f"episode_{ei:06d}.jsonl", "w", encoding="utf-8") as f:
            for d in fr:
                obs = d["observation"]
                if "robots" in obs:
                    width = max((len(r) for r in obs["robots"] if r), default=0)
                    state = [x for r in obs["robots"] for x in (r if r else [0] * width)]
                    active = [r is not None for r in obs["robots"]]
                else:
                    state, active = list(obs.get("f", [])), None
                label = _label(sc, d["action"])
                if (sc, label) not in actions:
                    actions[(sc, label)] = per_scenario_labels.get(sc, 0)
                    per_scenario_labels[sc] = per_scenario_labels.get(sc, 0) + 1
                row = {"index": gidx, "episode_index": ei, "frame_index": d["t"],
                       "timestamp": round(d["t"] * dt[sc], 6) if sc in dt else d["t"], "task_index": tasks[key],
                       "observation.state": state, "observation.robots_active": active, "action": d["action"], "action.label": label,
                       "action.index": actions[(sc, label)], "next.reward": d["reward"], "next.done": d["done"],
                       "rules.unsafe": d["rules"]["unsafe"], "rules.outcome": d["rules"]["outcome"], "station.step": d.get("step"),
                       "source": d["source"], "consent": d["consent"], "split": d["split"]}
                f.write(json.dumps(row, separators=(",", ":")) + "\n")
                gidx += 1
        ep_rows.append({"episode_index": ei, "episode_id": eid, "scenario": sc, "split": ep["split"], "source": ep["source"], "consent": ep["consent"],
                        "length": len(fr), "tasks": [instr["instructions"].get(key, key)]})
        splits[ep["split"]].append(ei)

    with open(out / "meta" / "episodes.jsonl", "w", encoding="utf-8") as f:
        for r in ep_rows:
            f.write(json.dumps(r, ensure_ascii=False) + "\n")
    with open(out / "meta" / "tasks.jsonl", "w", encoding="utf-8") as f:
        for key, ti in sorted(tasks.items(), key=lambda kv: kv[1]):
            f.write(json.dumps({"task_index": ti, "task": instr["instructions"].get(key, key), "scenario": key}, ensure_ascii=False) + "\n")
    with open(out / "meta" / "actions.jsonl", "w", encoding="utf-8") as f:
        for (sc, label), ai in sorted(actions.items()):
            f.write(json.dumps({"scenario": sc, "action_index": ai, "label": label}) + "\n")
    info = {
        "codebase_version": EXPORT_VERSION, "format": "LeRobot-style layout in JSON Lines (no Parquet; not readable by LeRobot's loader as is)",
        "source": {"schema": SCHEMA, "version": index.get("version"), "generator": index.get("generator"), "set": "sample" if sample else "full",
                   "contentHash": index.get("full", {}).get("contentHash")},
        "total_episodes": len(ep_rows), "total_frames": gidx, "total_tasks": len(tasks), "chunks_size": max(1, len(ep_rows)),
        "fps": None, "time": {"stations": "timestamp = frame_index x the scenario's dt (0.05 s)", "gym": "turn-based: timestamp = frame_index (one step)"},
        "splits": {k: f"{v[0]}:{v[-1] + 1}" if v else "" for k, v in splits.items()},
        "data_path": "data/chunk-{episode_chunk:03d}/episode_{episode_index:06d}.jsonl",
        "features": {"observation.state": {"dtype": "float", "names": schema.get("features", {})}, "action": {"dtype": "json", "note": "the env action as taken"},
                     "observation.images": "none (the simulator has no cameras)"},
        "provenance": "every episode synthetic (COLEARN scripted expert with action noise), consent null; no learner data",
    }
    (out / "meta" / "info.json").write_text(json.dumps(info, indent=1, ensure_ascii=False) + "\n", encoding="utf-8")
    leaks = sorted(e for e, v in episodes.items() if v.get("leak"))
    held = sorted(e for e in episodes if _seed_of(e) in HELD_OUT_SEEDS)
    return {"episodes": len(ep_rows), "frames": gidx, "linesRead": lines_read, "linesExpected": expected_lines, "tasks": len(tasks),
            "leakage": len(leaks) + len(held), "leaks": leaks[:5], "heldOutSeeds": held[:5], "index": index, "sample": sample}


def read_back(out: Path) -> Dict[str, Any]:
    """Counts from the written files only: per split and scenario, episodes and frames; frames with every field."""
    eps = [json.loads(l) for l in (out / "meta" / "episodes.jsonl").read_text(encoding="utf-8").splitlines() if l.strip()]
    counts: Dict[str, Dict[str, Dict[str, int]]] = {}
    bad, frames = 0, 0
    for e in eps:
        p = out / "data" / "chunk-000" / f"episode_{e['episode_index']:06d}.jsonl"
        rows = [json.loads(l) for l in p.read_text(encoding="utf-8").splitlines() if l.strip()]
        frames += len(rows)
        bad += sum(1 for r in rows if list(r) != FRAME_FIELDS or r["episode_index"] != e["episode_index"])
        bad += 0 if [r["frame_index"] for r in rows] == list(range(len(rows))) and len(rows) == e["length"] else 1
        c = counts.setdefault(e["scenario"], {}).setdefault(e["split"], {"episodes": 0, "steps": 0})
        c["episodes"] += 1
        c["steps"] += len(rows)
    return {"episodes": len(eps), "frames": frames, "badRows": bad, "counts": counts}


def check(src: Path, out: Path, sample: bool = False) -> Dict[str, Any]:
    ex = export(src, out, sample)
    rb = read_back(out)
    index = ex.pop("index")
    problems = []
    if ex["linesRead"] != ex["linesExpected"]:
        problems.append(f"lines read {ex['linesRead']} != listed {ex['linesExpected']}")
    if sample:
        want_eps = sum(e["episodes"] for e in index["sample"])
        want_steps = sum(e["lines"] for e in index["sample"])
        if (rb["episodes"], rb["frames"]) != (want_eps, want_steps):
            problems.append(f"sample: read back {rb['episodes']} episodes / {rb['frames']} frames, index lists {want_eps} / {want_steps}")
    else:
        if (rb["episodes"], rb["frames"]) != (index["totals"]["episodes"], index["totals"]["steps"]):
            problems.append(f"totals: read back {rb['episodes']} / {rb['frames']}, index {index['totals']['episodes']} / {index['totals']['steps']}")
        for sc, by in index["counts"].items():
            for split, c in by.items():
                got = rb["counts"].get(sc, {}).get(split, {"episodes": 0, "steps": 0})
                if (got["episodes"], got["steps"]) != (c["episodes"], c["steps"]):
                    problems.append(f"{sc} {split}: {got} != index {c['episodes']}/{c['steps']}")
    if rb["badRows"]:
        problems.append(f"{rb['badRows']} rows or episodes malformed")
    if ex["leakage"]:
        problems.append(f"leakage {ex['leakage']}: {ex['leaks']} {ex['heldOutSeeds']}")
    return {"ok": not problems, "set": "sample" if sample else "full", "episodes": rb["episodes"], "frames": rb["frames"], "tasks": ex["tasks"],
            "scenarios": len(rb["counts"]), "rowsValid": f"{rb['frames'] - rb['badRows']} of {rb['frames']}" if not rb["badRows"] else f"{rb['badRows']} bad",
            "leakage": ex["leakage"], "problems": problems}


def main(argv: List[str]) -> int:
    args = [a for a in argv if not a.startswith("--")]
    sample = "--sample" in argv
    if len(args) != 2:
        print(__doc__)
        return 2
    src, out = Path(args[0]), Path(args[1])
    if "--check" in argv:
        r = check(src, out, sample)
        print(json.dumps(r))
        return 0 if r["ok"] else 1
    r = export(src, out, sample)
    r.pop("index")
    print(json.dumps(r))
    return 0 if not r["leakage"] else 1


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
