"""This repository's own harness for simulated robots on the strands-robots interface.

STRANDS (docs/strands-robots.md). ``create_harness`` here is THIS REPOSITORY'S function. There is no
``strands_harness`` package: it is not part of strands-robots 0.3.8 and not on PyPI. No language model is used:
the instruction picks a scenario by a fixed rule table, and the policy runs on the simulated robot.

    from robotics.strands.harness import create_harness
    from robotics.strands.sim_robot import SimRobot
    create_harness(tools=[SimRobot("so100")])("pick up the red cube")

``compare(policies, scenarios, seeds)`` writes leaderboard rows in docs/evals/arena.json's row shape (Wilson 95%
intervals) to docs/evals/strands.json. Development seeds 1-20 always; the held-out seeds 7181-7240 only through
ARENA-2's committed declaration (docs/evals/arena-declared-r7.json) and this harness's own committed declaration
(docs/evals/strands-declared.json), and only once.

Stations (STRANDS-2): the three robot stations run through the same bridge on development seeds only (the arena's
own convention for stations in development is seeds 1-3). They were not in this harness's held-out declaration, so a
held-out seed on a station is refused. Round 8's protocol-3 seeds 7241-7300 belong to ROBOLEARN-9: they are refused,
except (STRANDS-3) for the one parity check its declaration (docs/evals/arena-declared-r8.json, commit ec8bf4c5,
consumers.STRANDS-2) allows: bc and ra-lm-h on gym scenarios, with this harness's own committed declaration
(docs/evals/strands-declared-r9.json) and the claw's committed record (docs/evals/claw3.json), once, never tuned.
"""

from __future__ import annotations

import json
import math
import re
import subprocess
import time
from pathlib import Path
from typing import Any, Dict, Iterable, List, Optional, Sequence

from .policies import POLICY_BASE, load_policy
from .sim_robot import ROBOT_TYPES, ROOT, SimRobot

EVAL_PATH = ROOT / "docs" / "evals" / "strands.json"
ARENA_DECLARED = "docs/evals/arena-declared-r7.json"
STRANDS_DECLARED = "docs/evals/strands-declared.json"
DEV_SEEDS = list(range(1, 21))
HELD_OUT = list(range(7181, 7241))
HARNESS_VERSION = "st-harness/1"

# The rule table: the first rule whose words appear in the instruction picks the scenario (no language model).
RULES: List[Dict[str, Any]] = [
    {"scenario": "rb-teleop-pick-place", "words": ["pick", "place", "cube", "block", "part", "grasp", "grip", "bin", "fixture"]},
    {"scenario": "rb-cobot-zone-setup", "words": ["zone", "scanner", "separation", "stop distance", "warning", "e-stop"]},
    {"scenario": "rb-amr-fleet-routing", "words": ["route", "deliver", "aisle", "fleet", "pallet", "warehouse", "drop-off"]},
    {"scenario": "rb-port-gantry", "words": ["container", "gantry", "bay", "crane", "spreader", "stack"]},
]
HARD_WORDS = ["hard", "busy", "harder"]
# Station rules: checked first when the instruction names a station or a drill.
STATION_WORDS = ["station", "drill"]
STATION_RULES: List[Dict[str, Any]] = [
    {"scenario": "rb-station-robot-cell", "words": ["lockout", "re-entry", "reentry", "robot cell", "cell"]},
    {"scenario": "rb-station-amr-fleet", "words": ["amr", "fleet", "traffic", "warehouse"]},
    {"scenario": "rb-station-cobot", "words": ["cobot", "risk assessment", "separation", "speed-and-separation"]},
]
STATION_DEV_SEEDS = [1, 2, 3]
PROTOCOL3_SEEDS = list(range(7241, 7301))
# STRANDS-3: the one protocol-3 parity check ec8bf4c5's consumers clause allows this harness.
PROTOCOL3_ARENA_DECLARED = "docs/evals/arena-declared-r8.json"
PROTOCOL3_ARENA_COMMIT = "ec8bf4c5"
PROTOCOL3_CLAW = "docs/evals/claw3.json"
PROTOCOL3_STRANDS_DECLARED = "docs/evals/strands-declared-r9.json"
PROTOCOL3_POLICIES = ["bc", "ra-lm-h"]
PROTOCOL3_BLOCK = "protocol3Parity"


def pick_scenario(instruction: str, tool: Optional[SimRobot] = None) -> Dict[str, Any]:
    """The scenario for an instruction by the rule table; restricted to what ``tool`` runs when given."""
    text = " " + re.sub(r"[^a-z0-9\- ]", " ", str(instruction).lower()) + " "
    if any(f" {w}" in text for w in STATION_WORDS):
        for i, rule in enumerate(STATION_RULES):
            hit = [w for w in rule["words"] if f" {w}" in text]
            if not hit:
                continue
            sc = rule["scenario"]
            if tool is not None and sc not in tool.scenarios:
                return {"scenario": None, "rule": f"station-{i}", "matched": hit, "refused": f"{tool.robot_type} does not run {sc} (it runs {', '.join(tool.scenarios)})"}
            return {"scenario": sc, "rule": f"station-{i}", "matched": hit, "refused": None}
    for i, rule in enumerate(RULES):
        hit = [w for w in rule["words"] if f" {w}" in text]
        if not hit:
            continue
        sc = rule["scenario"]
        if any(f" {w} " in text for w in HARD_WORDS) and f"{sc}#hard" in sum((v["scenarios"] for v in ROBOT_TYPES.values()), []):
            sc = f"{sc}#hard"
        if tool is not None and sc not in tool.scenarios:
            return {"scenario": None, "rule": i, "matched": hit, "refused": f"{tool.robot_type} does not run {sc} (it runs {', '.join(tool.scenarios)})"}
        return {"scenario": sc, "rule": i, "matched": hit, "refused": None}
    return {"scenario": None, "rule": None, "matched": [], "refused": "no rule matches the instruction"}


class Harness:
    """A callable: instruction -> result of running the policy on the simulated robot that runs the scenario."""

    def __init__(self, tools: Sequence[SimRobot], policy: Any = None, seeds: Optional[Iterable[int]] = None):
        if not tools:
            raise ValueError("create_harness needs at least one tool")
        self.tools = list(tools)
        self.policy = policy if policy is not None else "bc"
        self.seeds = list(seeds) if seeds is not None else [1]

    def __call__(self, instruction: str, *, quiet: bool = False) -> Dict[str, Any]:
        choice, tool = None, None
        for t in self.tools:
            choice = pick_scenario(instruction, t)
            if choice["scenario"]:
                tool = t
                break
        if tool is None:
            out = {"instruction": instruction, "ok": False, "refused": choice["refused"] if choice else "no tool", "physical": 0}
            if not quiet:
                print(f"refused: {out['refused']}")
            return out
        pol = load_policy(self.policy) if isinstance(self.policy, str) else self.policy
        name = self.policy if isinstance(self.policy, str) else getattr(pol, "provider_name", type(pol).__name__)
        episodes = [tool.run_episode(pol, instruction, seed=s, scenario=choice["scenario"]) for s in self.seeds]
        ok = sum(1 for e in episodes if e["success"])
        out = {
            "instruction": instruction, "ok": True, "tool": tool.tool_name, "robotType": tool.robot_type, "scenario": choice["scenario"],
            "rule": choice["rule"], "matched": choice["matched"], "policy": name, "policyBase": POLICY_BASE, "seeds": self.seeds,
            "successes": ok, "episodes": len(episodes), "perSeed": episodes, "physical": sum(e["physical"] for e in episodes),
            "note": "simulated only; the scene has one part, so colour words are not modelled",
        }
        if not quiet:
            print(f"{instruction!r} -> {choice['scenario']} on simulated {tool.robot_type} with {name}: "
                  f"{ok}/{len(episodes)} succeeded, rule breaks {sum(e['ruleBreaks'] for e in episodes)}, "
                  f"governor-checked steps {sum(e['governorChecked'] for e in episodes)}/{sum(e['steps'] for e in episodes)}, physical {out['physical']}")
        return out


def create_harness(tools: Sequence[SimRobot], policy: Any = None, seeds: Optional[Iterable[int]] = None) -> Harness:
    """This repository's harness (not a strands-robots function): see the module docstring."""
    return Harness(tools, policy=policy, seeds=seeds)


# ---------------------------------------------------------------------------------------------- compare

def wilson(k: int, n: int, z: float = 1.96) -> List[float]:
    """Wilson score 95% interval, rounded to 3 places as ra-arena.js raWilson."""
    if not n:
        return [0, 0]
    p = k / n
    d = 1 + z * z / n
    c = p + z * z / (2 * n)
    h = z * math.sqrt(p * (1 - p) / n + z * z / (4 * n * n))
    return [_r3(max(0.0, (c - h) / d)), _r3(min(1.0, (c + h) / d))]


def _r3(x: float) -> float:
    # JS Math.round(x * 1000) / 1000 (half up), not Python's banker's rounding.
    return math.floor(x * 1000 + 0.5) / 1000


def leaderboard(results: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """Rows per model in arena.json's row shape, ranked by success, then fewer rule breaks per episode, then id."""
    by: Dict[str, Dict[str, Any]] = {}
    for r in results:
        e = by.setdefault(r["modelId"], {"modelId": r["modelId"], "scenarios": 0, "episodes": 0, "successes": 0, "ruleBreaks": 0,
                                         "stepsRun": 0, "stepsChecked": 0, "stops": 0, "physical": 0, "perScenario": {}})
        e["scenarios"] += 1; e["episodes"] += r["n"]; e["successes"] += r["successes"]; e["ruleBreaks"] += r["ruleBreaks"]
        e["stepsRun"] += r["stepsRun"]; e["stepsChecked"] += r["stepsChecked"]; e["stops"] += r["stops"]; e["physical"] += r["physical"]
        e["perScenario"][r["scenarioId"]] = {"success": r["success"], "ci95": wilson(r["successes"], r["n"]), "n": r["n"]}
    rows = []
    for e in by.values():
        n = e["episodes"] or 1
        rows.append({"modelId": e["modelId"], "scenarios": e["scenarios"], "episodes": e["episodes"], "success": _r3(e["successes"] / n),
                     "ci95": wilson(e["successes"], e["episodes"]), "ruleBreaks": e["ruleBreaks"], "ruleBreaksPerEpisode": _r3(e["ruleBreaks"] / n),
                     "meanSteps": _r3(e["stepsRun"] / n), "stops": e["stops"],
                     "governorChecked": _r3(e["stepsChecked"] / e["stepsRun"]) if e["stepsRun"] else 1, "physical": e["physical"], "perScenario": e["perScenario"]})
    rows.sort(key=lambda r: (-r["success"], r["ruleBreaksPerEpisode"], r["modelId"]))
    return [{"rank": i + 1, **r} for i, r in enumerate(rows)]


def _robot_for(sc: str) -> str:
    for rt in ("so100", "cobot", "amr", "gantry", "cell"):
        if sc in ROBOT_TYPES[rt]["scenarios"]:
            return rt
    raise ValueError(f"no simulated robot type runs {sc}")


def _committed(path: str) -> Optional[str]:
    try:
        out = subprocess.run(["git", "log", "-1", "--format=%H", "--", path], cwd=str(ROOT), capture_output=True, text=True, timeout=20,
                             env={"PATH": "/usr/bin:/bin:/usr/local/bin"})
        return out.stdout.strip() or None
    except Exception:  # noqa: BLE001
        return None


def _is_ancestor(commit: str) -> bool:
    try:
        out = subprocess.run(["git", "merge-base", "--is-ancestor", commit, "HEAD"], cwd=str(ROOT), capture_output=True, text=True, timeout=20,
                             env={"PATH": "/usr/bin:/bin:/usr/local/bin"})
        return out.returncode == 0
    except Exception:  # noqa: BLE001
        return False


def _protocol3_gate(s: set, stations: List[str], policies: Optional[Sequence[str]]) -> Dict[str, Any]:
    """The one parity check ec8bf4c5 allows: bc and ra-lm-h, gym scenarios, seeds within 7241-7300, every cited file
    committed (ec8bf4c5 an ancestor of HEAD), and no protocol3Parity block in strands.json yet. Anything else is refused."""
    who = "seeds 7241-7300 are round 8's protocol-3 held-out seeds (ROBOLEARN-9, ec8bf4c5)"
    if not s <= set(PROTOCOL3_SEEDS):
        return {"ok": False, "reason": f"{who}; a run must stay within them"}
    if stations:
        return {"ok": False, "reason": f"{who}; the declared parity check is gym only ({', '.join(stations)} refused)"}
    if policies is None or not policies or not set(policies) <= set(PROTOCOL3_POLICIES):
        return {"ok": False, "reason": f"{who}; the declared parity check names only {', '.join(PROTOCOL3_POLICIES)} (got {', '.join(policies or []) or 'no policies'})"}
    if not _is_ancestor(PROTOCOL3_ARENA_COMMIT):
        return {"ok": False, "reason": f"{who}; the declaration {PROTOCOL3_ARENA_COMMIT} is not on this branch"}
    claw, mine = _committed(PROTOCOL3_CLAW), _committed(PROTOCOL3_STRANDS_DECLARED)
    if not claw:
        return {"ok": False, "reason": f"{who}; the claw's record ({PROTOCOL3_CLAW}) is not committed, so there is nothing to compare with"}
    if not mine:
        return {"ok": False, "reason": f"{who}; this harness's declaration ({PROTOCOL3_STRANDS_DECLARED}) is not committed"}
    try:
        decl = json.loads((ROOT / PROTOCOL3_STRANDS_DECLARED).read_text())
    except Exception:  # noqa: BLE001
        decl = {}
    if not str(decl.get("arenaDeclaration", {}).get("commit", "")).startswith(PROTOCOL3_ARENA_COMMIT):
        return {"ok": False, "reason": f"{who}; this harness's declaration does not cite {PROTOCOL3_ARENA_COMMIT}"}
    prev = json.loads(EVAL_PATH.read_text()) if EVAL_PATH.exists() else {}
    if prev.get(PROTOCOL3_BLOCK):
        return {"ok": False, "reason": f"the declared protocol-3 parity check has already run once (docs/evals/strands.json {PROTOCOL3_BLOCK}); it is never run again or tuned"}
    return {"ok": True, "split": PROTOCOL3_BLOCK, "declarations": {"arena": PROTOCOL3_ARENA_COMMIT, "claw": claw, "strands": mine}}


def seed_gate(seeds: Sequence[int], scenarios: Optional[Sequence[str]] = None, policies: Optional[Sequence[str]] = None) -> Dict[str, Any]:
    """Development seeds 1-20 always. Held-out 7181-7240 only with both declarations committed and no earlier run.
    Stations: development seeds only (not in the held-out declaration). Protocol-3 seeds 7241-7300: only the one
    declared parity check (_protocol3_gate), which needs ``policies``."""
    s = set(int(x) for x in seeds)
    stations = [sc for sc in (scenarios or []) if str(sc).startswith("rb-station-")]
    if s & set(PROTOCOL3_SEEDS):
        return _protocol3_gate(s, stations, policies)
    if s <= set(DEV_SEEDS):
        return {"ok": True, "split": "dev"}
    if stations:
        return {"ok": False, "reason": f"station scenarios run on development seeds only ({', '.join(stations)} were not in a held-out declaration)"}
    if s <= set(HELD_OUT):
        a, b = _committed(ARENA_DECLARED), _committed(STRANDS_DECLARED)
        if not a:
            return {"ok": False, "reason": f"held-out seeds need ARENA-2's committed declaration ({ARENA_DECLARED})"}
        if not b:
            return {"ok": False, "reason": f"held-out seeds need this harness's committed declaration ({STRANDS_DECLARED})"}
        prev = json.loads(EVAL_PATH.read_text()) if EVAL_PATH.exists() else {}
        if prev.get("heldOut"):
            return {"ok": False, "reason": "the declared held-out comparison has already run once (docs/evals/strands.json heldOut)"}
        return {"ok": True, "split": "heldOut", "arenaDeclaration": a, "strandsDeclaration": b}
    return {"ok": False, "reason": "seeds must be development seeds 1-20, or exactly within the declared held-out range 7181-7240"}


def parity_vs_claw(results: List[Dict[str, Any]], claw_path: Path = ROOT / PROTOCOL3_CLAW) -> Dict[str, Any]:
    """Per (policy, scenario): the Python path's successes and rule breaks against the claw's record (claw3.json runs[].results[]),
    as ec8bf4c5's consumers clause requires. Steps are reported beside them, not compared."""
    claw = json.loads(claw_path.read_text())
    rows, equal = [], 0
    for r in results:
        rec = next((x for run in claw.get("runs", []) if run.get("scenarioId") == r["scenarioId"] for x in run.get("results", []) if x.get("modelId") == r["modelId"]), None)
        row = {"scenarioId": r["scenarioId"], "modelId": r["modelId"], "python": {"successes": r["successes"], "n": r["n"], "ruleBreaks": r["ruleBreaks"], "steps": r["stepsRun"]},
               "claw": None if rec is None else {"successes": rec.get("k"), "n": rec.get("n"), "ruleBreaks": rec.get("ruleBreaks"), "steps": rec.get("steps")}}
        row["equal"] = rec is not None and rec.get("k") == r["successes"] and rec.get("n") == r["n"] and rec.get("ruleBreaks") == r["ruleBreaks"]
        equal += 1 if row["equal"] else 0
        rows.append(row)
    scs = sorted({r["scenarioId"] for r in results})
    protocol = [s for s in claw.get("protocol", {}).get("scenarios", [])]
    return {"record": PROTOCOL3_CLAW, "protocol": claw.get("protocol", {}).get("version"), "equal": equal, "of": len(rows), "rows": rows,
            "scenariosCompared": scs, "scenariosNotRun": [s for s in protocol if s not in scs],
            "note": "equal = successes, n and rule breaks match the claw's record for that policy and scenario; the scenarios not run have no simulated robot type in sim_robot.py"}


def seed_sensitivity(results: List[Dict[str, Any]]) -> Dict[str, Any]:
    """Per (policy, station): the episode length per seed, how many distinct lengths there are, and how many seeds give a
    different length or outcome from the first seed (STRANDS-3 item 2: do seeds change a station episode at all?)."""
    out: Dict[str, Any] = {"rows": [], "seedsThatChangeAnEpisode": 0, "of": 0}
    changed_seeds = set()
    seeds_all = set()
    for r in results:
        per = r["perSeed"]
        if not per:
            continue
        first = per[0]
        steps = {str(p["seed"]): p["steps"] for p in per}
        diff = [p["seed"] for p in per if p["steps"] != first["steps"] or p["success"] != first["success"] or p["ruleBreaks"] != first["ruleBreaks"]]
        changed_seeds.update(diff)
        seeds_all.update(p["seed"] for p in per)
        out["rows"].append({"modelId": r["modelId"], "scenarioId": r["scenarioId"], "stepsBySeed": steps, "distinctLengths": len(set(steps.values())),
                            "seedsDifferingFromFirst": len(diff), "of": len(per), "successes": r["successes"]})
    out["seedsThatChangeAnEpisode"] = len(changed_seeds)
    out["of"] = len(seeds_all)
    return out


def compare(policies: Sequence[str], scenarios: Sequence[str], seeds: Sequence[int], *, write: bool = True,
            path: Path = EVAL_PATH, log=None, block_key: Optional[str] = None) -> Dict[str, Any]:
    """Run every policy on every scenario over the seeds through the simulated robots; leaderboard rows to strands.json
    (in the block named by the seed split, or ``block_key``, e.g. "devStations")."""
    gate = seed_gate(seeds, scenarios, policies)
    if not gate["ok"]:
        raise PermissionError(gate["reason"])
    t0 = time.time()
    robots: Dict[str, SimRobot] = {}
    results = []
    try:
        for sc in scenarios:
            rt = _robot_for(sc)
            robot = robots.setdefault(rt, SimRobot(rt))
            for pid in policies:
                pol = load_policy(pid)
                per = [robot.run_episode(pol, f"strands compare {sc}", seed=s, scenario=sc) for s in seeds]
                n = len(per)
                k = sum(1 for p in per if p["success"])
                run = sum(p["steps"] for p in per)
                results.append({"modelId": pid, "scenarioId": sc, "robotType": rt, "applicable": True, "n": n, "seeds": f"{seeds[0]}–{seeds[-1]}",
                                "success": _r3(k / n), "successes": k, "ruleBreaks": sum(p["ruleBreaks"] for p in per), "steps": _r3(run / n),
                                "stops": sum(1 for p in per if p["stopped"]), "governorChecked": _r3(sum(p["governorChecked"] for p in per) / run) if run else 1,
                                "stepsRun": run, "stepsChecked": sum(p["governorChecked"] for p in per), "physical": sum(p["physical"] for p in per),
                                "auditOk": all(p["chainOk"] for p in per), "network": sum(p["network"] for p in per),
                                "perSeed": [{"seed": p["seed"], "success": p["success"], "steps": p["steps"], "ruleBreaks": p["ruleBreaks"], "stopped": p["stopped"]} for p in per]})
                if log:
                    log(f"{pid} {sc}: {k}/{n}")
        net = sum(r.close().get("network", 0) for r in robots.values())
    finally:
        for r in robots.values():
            r.close()
    block = {"seeds": f"{seeds[0]}–{seeds[-1]} ({len(seeds)})", "policies": list(policies), "scenarios": list(scenarios),
             "leaderboard": leaderboard(results), "results": results,
             "totals": {"episodes": sum(r["n"] for r in results), "stepsRun": sum(r["stepsRun"] for r in results),
                        "stepsChecked": sum(r["stepsChecked"] for r in results), "physical": sum(r["physical"] for r in results),
                        "networkBlocked": net + sum(r["network"] for r in results), "auditChainsOk": all(r["auditOk"] for r in results)},
             "seconds": round(time.time() - t0, 1)}
    if gate["split"] == "heldOut":
        block["declarations"] = {"arena": gate["arenaDeclaration"], "strands": gate["strandsDeclaration"]}
    if gate["split"] == PROTOCOL3_BLOCK:
        block["declarations"] = gate["declarations"]
        block["parity"] = parity_vs_claw(results)
        block["once"] = "run once as declared in docs/evals/strands-declared-r9.json; never tuned; reported as measured"
    if all(str(sc).startswith("rb-station-") for sc in scenarios):
        block["seedSensitivity"] = seed_sensitivity(results)
    if write:
        doc = json.loads(path.read_text()) if path.exists() else {}
        doc.update({
            "eval": "STRANDS: this repository's policies on the strands-robots Policy interface, run on simulated robots through the arena bridge",
            "version": HARNESS_VERSION, "generator": "robotics/strands/harness.py compare()", "policyBase": POLICY_BASE,
            "rowShape": "docs/evals/arena.json leaderboard rows (Wilson 95% intervals)",
            "governor": "tools/ra_bridge.mjs: vbGovernor.monitor on every step, as ra-arena.js raEpisode (seeded safe simulated job, a broken rule halts with a protective stop); target always the simulator",
            "honesty": "simulated only; no strands_harness package exists (create_harness is this repo's); no hosted or large language model; strands-robots not installed; ra-lm is the gym-only build of the small model trained here",
        })
        doc[block_key or gate["split"]] = block
        path.write_text(json.dumps(doc, indent=1, ensure_ascii=False) + "\n")
    return block
