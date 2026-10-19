"""STRANDS selftest: standard library only (numpy optional). Run from anywhere:

    python3 robotics/strands/selftest.py          # prints one JSON summary line; exit 1 on any failure

Checks: no third-party package needed or imported; serial ports, cameras and sockets never opened (patched to record
and refuse); no credential-like environment variable read (os.environ guarded); hardware refused with the governor's
reason; unknown robot types refused; physical 0; deterministic for a seed; the Python adapters reproduce the arena's
own raRun per seed; compare rows valid; the seed gate; the user's sample runs.
STRANDS-2: the three robot stations through the bridge; station parity with raRun (bc, ra-lm@stations, ra-lm-h, expert
on dev seeds 1-3); the arena's published ra-lm build and ra-lm-h reproduce raRun on the gym scenarios too.
"""

from __future__ import annotations

import builtins
import io
import json
import os
import re
import socket
import subprocess
import sys
import types
from pathlib import Path

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[1]
sys.path.insert(0, str(ROOT))

RESULTS = []


def ok(name: str, cond: bool, detail: str = "") -> None:
    RESULTS.append({"check": name, "ok": bool(cond), "detail": detail})


# ------------------------------------------------------------------ guards (installed before importing the harness)
OPENED_DEV, SOCKETS, ENV_READS, TOUCHED = [], [], set(), []
CRED = re.compile(r"KEY|TOKEN|SECRET|PASSW|CREDENTIAL|AUTH|^AWS_|ANTHROPIC|OPENAI|^HF_|BEARER|COOKIE", re.I)
DEV = re.compile(r"^/dev/(tty|video|serial|usb|cu\.)")

_open, _os_open = builtins.open, os.open


def g_open(file, *a, **k):
    if isinstance(file, (str, bytes, os.PathLike)) and DEV.match(os.fsdecode(file)):
        OPENED_DEV.append(os.fsdecode(file))
        raise PermissionError("selftest: device open refused")
    return _open(file, *a, **k)


def g_os_open(path, *a, **k):
    if DEV.match(os.fsdecode(path)):
        OPENED_DEV.append(os.fsdecode(path))
        raise PermissionError("selftest: device open refused")
    return _os_open(path, *a, **k)


builtins.open, os.open = g_open, g_os_open
io.open = g_open


def g_connect(self, *a, **k):
    SOCKETS.append(repr(a)[:80])
    raise PermissionError("selftest: network refused")


socket.socket.connect = g_connect
socket.socket.connect_ex = g_connect
socket.create_connection = lambda *a, **k: g_connect(None, *a)


class _Recorder(types.ModuleType):
    def __getattr__(self, name):
        TOUCHED.append(f"{self.__name__}.{name}")
        raise PermissionError(f"selftest: {self.__name__} must not be used")


for mod in ("serial", "cv2"):
    sys.modules[mod] = _Recorder(mod)


class GuardedEnv(dict):
    def __getitem__(self, k):
        ENV_READS.add(k)
        return super().__getitem__(k)

    def get(self, k, d=None):
        ENV_READS.add(k)
        return super().get(k, d)

    def __contains__(self, k):
        ENV_READS.add(k)
        return super().__contains__(k)


_real_environ = os.environ
os.environ = GuardedEnv(_real_environ)  # type: ignore[assignment]

# The guards must be live: trip each one on purpose, confirm it recorded, then clear the record.
_tripped = []
# A made-up name that is never set (built at run time so check_strands' source scan still finds no literal env read).
_FAKE = "SELFTEST_FAKE_" + "API_KEY"
os.environ.get(_FAKE); _tripped.append(_FAKE in ENV_READS and bool(CRED.search(_FAKE)))
for _f in (lambda: open("/dev/ttySELFTEST"), lambda: socket.socket().connect(("192.0.2.1", 9)), lambda: sys.modules["serial"].Serial):
    try:
        _f()
        _tripped.append(False)
    except PermissionError:
        _tripped.append(True)
_tripped.append(bool(OPENED_DEV) and bool(SOCKETS) and bool(TOUCHED))
ENV_READS.discard(_FAKE); OPENED_DEV.clear(); SOCKETS.clear(); TOUCHED.clear()
ok("guards are live (credential read, device open, socket, serial use each caught when tripped)", all(_tripped), str(_tripped))

before = set(sys.modules)

from robotics.strands import harness, policies, sim_robot  # noqa: E402
from robotics.strands.harness import compare, create_harness, leaderboard, pick_scenario, seed_gate  # noqa: E402
from robotics.strands.policies import POLICY_BASE, Policy, load_policy  # noqa: E402
from robotics.strands.sim_robot import HardwareRefused, RobotTypeRefused, SimRobot  # noqa: E402

THIRD = ("lerobot", "torch", "strands", "strands_robots", "transformers", "requests", "httpx", "boto3", "anthropic", "openai")
imported = sorted(m for m in set(sys.modules) - before if m.split(".")[0] in THIRD)
ok("no third-party package imported", not imported, ", ".join(imported) or "none")
ok("policy base declared", "strands_robots" in POLICY_BASE or "local abstract base" in POLICY_BASE, POLICY_BASE)

# ------------------------------------------------------------------ robot types, tool spec, refusals
types_ok = []
for rt in ("so100", "so101", "cobot", "amr", "gantry"):
    r = SimRobot(rt)
    spec = r.tool_spec
    shape = set(spec) == {"name", "description", "inputSchema"} and spec["inputSchema"]["json"]["properties"]["action"]["enum"] == ["execute", "start", "status", "stop"] \
        and spec["inputSchema"]["json"]["required"] == ["action"]
    types_ok.append((rt, r.scenario, shape))
ok("robot types simulated with the Robot tool_spec shape", all(s for _, _, s in types_ok), "; ".join(f"{a}->{b}" for a, b, _ in types_ok))

try:
    SimRobot("humanoid")
    ok("unknown robot type refused", False)
except RobotTypeRefused as e:
    ok("unknown robot type refused", True, str(e)[:90])

for kw in ({"port": "/dev/ttyACM0"}, {"physical": True}, {"cameras": {"wrist": {"index_or_path": "/dev/video0"}}}):
    try:
        SimRobot("so100", **kw)
        ok(f"hardware refused ({list(kw)[0]})", False)
    except HardwareRefused as e:
        ok(f"hardware refused ({list(kw)[0]})", e.reason == "physical-target", e.reason)

import asyncio  # noqa: E402

arm = SimRobot("so100")
res = []


async def _stream():
    async for ev in arm.stream({"toolUseId": "t1", "input": {"action": "execute", "instruction": "pick", "target": "physical"}}, {}):
        res.append(ev)


asyncio.run(_stream())
ok("stream refuses a physical target with the governor's reason", res and res[0]["status"] == "error" and "physical-target" in res[0]["content"][0]["text"])
ok("sim command allowed by the governor", arm.governor_check("sim")["decision"] == "allow-sim")

# ------------------------------------------------------------------ the Policy interface
ids = list(policies.POLICY_IDS)
pol_ok = []
for pid in ids:
    p = load_policy(pid)
    p.set_robot_state_keys(arm.robot_state_keys)
    p.begin_episode("rb-teleop-pick-place", 1)
    acts = asyncio.run(p.get_actions({"scenario": "rb-teleop-pick-place", "features": [0.1, 0, 0, 0, 0, 0, 0, 0]}, "pick"))
    pol_ok.append(isinstance(p, Policy) and isinstance(p.provider_name, str) and isinstance(acts, list) and all(isinstance(a, dict) for a in acts))
ok("policies runnable through the Policy interface", all(pol_ok), f"{sum(pol_ok)} of {len(ids)}: {', '.join(ids)}")
mock = policies.strands_mock_policy()
ok("strands_robots.MockPolicy", True, "installed: ran" if mock else "not installed (skipped, as declared)")

# ------------------------------------------------------------------ physical 0, determinism, parity with raRun
scen = {"so100": "rb-teleop-pick-place", "cobot": "rb-cobot-zone-setup", "amr": "rb-amr-fleet-routing", "gantry": "rb-port-gantry"}
robots = {rt: SimRobot(rt) for rt in scen}
a1 = robots["so100"].run_episode(load_policy("bc"), "pick", seed=3)
a2 = robots["so100"].run_episode(load_policy("bc"), "pick", seed=3)
b1 = robots["amr"].run_episode(load_policy("ra-lm"), "route", seed=4)
b2 = SimRobot("amr").run_episode(load_policy("ra-lm"), "route", seed=4)
ok("deterministic for a seed", a1 == a2 and b1 == b2, f"bc so100 seed 3 steps {a1['steps']}; ra-lm amr seed 4 steps {b1['steps']}")

seeds = [1, 2, 3]
mism, n_par, phys, net = [], 0, 0, 0
for rt, sc in scen.items():
    for pid in ("bc", "dagger-r1", "ra-lm", "expert"):
        py = [robots[rt].run_episode(load_policy(pid), "x", seed=s) for s in seeds]
        js = robots[rt].bridge.call({"op": "js_run", "model": pid, "scenario": sc, "seeds": seeds})["result"]["perSeed"]
        n_par += 1
        phys += sum(p["physical"] for p in py)
        net += sum(p["network"] for p in py)
        if [(p["success"], p["steps"], p["ruleBreaks"]) for p in py] != [(p["success"], p["steps"], p["ruleBreaks"]) for p in js]:
            mism.append(f"{pid}@{sc}")
ok("Python adapters reproduce raRun per seed", not mism, f"{n_par - len(mism)} of {n_par} (model x scenario, seeds 1-3)" + (f"; differ: {mism}" if mism else ""))
ok("physical dispatches 0", phys == 0 and a1["physical"] == 0, str(phys))
ok("every step governor-checked", a1["governorChecked"] == a1["steps"] and b1["governorChecked"] == b1["steps"])

# ------------------------------------------------------------------ STRANDS-2: stations, the published ra-lm build, ra-lm-h
from robotics.strands.policies import STATION_POLICY_IDS  # noqa: E402

st_scen = {"cobot": "rb-station-cobot", "amr": "rb-station-amr-fleet", "cell": "rb-station-robot-cell"}
st_robots = {rt: SimRobot(rt, scenario=sc) for rt, sc in st_scen.items()}
st_runs = [st_robots[rt].run_episode(load_policy("expert"), "run the station drill", seed=1) for rt in st_scen]
ok("station scenarios through the bridge", all(r["success"] and r["physical"] == 0 and r["governorChecked"] == r["steps"] and r["chainOk"] for r in st_runs),
   f"{sum(r['success'] for r in st_runs)} of {len(st_runs)}: " + "; ".join(f"{sc} {r['steps']} steps" for sc, r in zip(st_scen.values(), st_runs)))
oracle = st_robots["cobot"].bridge  # one bridge for every js_run, so the JS side trains each model once
st_mism, st_n, seeds_dev = [], 0, [1, 2, 3]
for rt, sc in st_scen.items():
    for pid in ("bc", "ra-lm@stations", "ra-lm-h", "expert"):
        py = [st_robots[rt].run_episode(load_policy(pid), "x", seed=s, scenario=sc) for s in seeds_dev]
        js = oracle.call({"op": "js_run", "model": pid.split("@")[0], "scenario": sc, "seeds": seeds_dev, "build": "stations"})["result"]["perSeed"]
        st_n += 1
        phys += sum(p["physical"] for p in py)
        net += sum(p["network"] for p in py)
        if [(p["success"], p["steps"], p["ruleBreaks"]) for p in py] != [(p["success"], p["steps"], p["ruleBreaks"]) for p in js]:
            st_mism.append(f"{pid}@{sc}")
ok("station parity with raRun per seed", not st_mism, f"{st_n - len(st_mism)} of {st_n} (model x station, dev seeds 1-3)" + (f"; differ: {st_mism}" if st_mism else ""))
gy_mism, gy_n = [], 0
for rt, sc in scen.items():
    for pid in ("ra-lm@stations", "ra-lm-h"):
        py = [robots[rt].run_episode(load_policy(pid), "x", seed=s) for s in seeds]
        js = oracle.call({"op": "js_run", "model": pid.split("@")[0], "scenario": sc, "seeds": seeds, "build": "stations"})["result"]["perSeed"]
        gy_n += 1
        phys += sum(p["physical"] for p in py)
        if [(p["success"], p["steps"], p["ruleBreaks"]) for p in py] != [(p["success"], p["steps"], p["ruleBreaks"]) for p in js]:
            gy_mism.append(f"{pid}@{sc}")
ok("published ra-lm build and ra-lm-h reproduce raRun on the gym scenarios", not gy_mism, f"{gy_n - len(gy_mism)} of {gy_n} (model x scenario, dev seeds 1-3)" + (f"; differ: {gy_mism}" if gy_mism else ""))
ok("station policies listed", set(STATION_POLICY_IDS) <= set(policies.POLICY_IDS), ", ".join(STATION_POLICY_IDS))
# STRANDS-3: Python's math.tanh against V8's Math.tanh on ra-lm-h's own training rows (a sample per task here; every row in
# robotics/strands/tanh_agreement.py, recorded in docs/evals/strands.json tanhAgreement). The oracle bridge has the model cached.
try:
    from robotics.strands.tanh_agreement import measure as st_tanh_measure  # noqa: E402
    tanh = st_tanh_measure("ra-lm-h", limit=40, bridge=oracle)
    ok("tanh argmax agreement Python vs V8 (sample of the training rows)", tanh["flips"] == 0 and not tanh["skippedTasks"] and tanh["compared"] > 0,
       f"{tanh['agree']} of {tanh['compared']} rows agree over {len(tanh['byTask'])} tasks; flips {tanh['flips']}" + (f"; tasks not exported: {tanh['skippedTasks']}" if tanh["skippedTasks"] else ""))
except Exception as e:  # noqa: BLE001
    ok("tanh argmax agreement Python vs V8 (sample of the training rows)", False, str(e)[:160])
ok("seed gate: stations dev only, protocol-3 seeds refused", seed_gate([1, 2, 3], ["rb-station-cobot"])["ok"] and not seed_gate([7181], ["rb-station-cobot"])["ok"]
   and not seed_gate([7241])["ok"] and not seed_gate([7300], ["rb-teleop-pick-place"])["ok"],
   "undeclared uses of 7241-7300 refused (no policies; a station; a single seed)")
# STRANDS-3: the one declared parity check (bc, ra-lm-h, gym, ec8bf4c5) is refused for any other policy or station, and refused
# again once docs/evals/strands.json carries its protocol3Parity block (run once, never tuned).
_p3 = list(range(7241, 7301))
_p3_again = seed_gate(_p3, ["rb-port-gantry"], ["bc", "ra-lm-h"])
_p3_block = bool(json.loads((ROOT / "docs" / "evals" / "strands.json").read_text()).get("protocol3Parity")) if (ROOT / "docs" / "evals" / "strands.json").exists() else False
ok("seed gate: protocol-3 parity only as declared, once", not seed_gate(_p3, ["rb-port-gantry"], ["random"])["ok"] and not seed_gate(_p3, ["rb-station-cobot"], ["bc"])["ok"]
   and not seed_gate([7241, 1], ["rb-port-gantry"], ["bc"])["ok"] and (not _p3_again["ok"] if _p3_block else True),
   ("second run refused: " + _p3_again.get("reason", "")[:70]) if _p3_block else "not yet run")
ok("station rule table", pick_scenario("run the cobot station drill")["scenario"] == "rb-station-cobot" and pick_scenario("robot cell lockout drill")["scenario"] == "rb-station-robot-cell"
   and pick_scenario("AMR fleet traffic station")["scenario"] == "rb-station-amr-fleet" and pick_scenario("pick up the red cube")["scenario"] == "rb-teleop-pick-place")

# ------------------------------------------------------------------ harness: rules, compare rows, seed gate
cases = {"pick up the red cube": "rb-teleop-pick-place", "route the warehouse robots to the drop-off": "rb-amr-fleet-routing",
         "move the container to the bay": "rb-port-gantry", "set the cobot's stop zone": "rb-cobot-zone-setup",
         "route the fleet on the hard layout": "rb-amr-fleet-routing#hard"}
got = {k: pick_scenario(k)["scenario"] for k in cases}
ok("rule table picks scenarios deterministically", got == cases, json.dumps(got)[:160])
ok("an instruction for another robot is refused", pick_scenario("move the container to the bay", arm)["refused"] is not None)

blk = compare(["bc", "expert"], ["rb-teleop-pick-place", "rb-port-gantry"], [1, 2, 3], write=False)
need = {"rank", "modelId", "scenarios", "episodes", "success", "ci95", "ruleBreaks", "ruleBreaksPerEpisode", "meanSteps", "stops", "governorChecked", "physical", "perScenario"}
rows = blk["leaderboard"]
valid = all(set(r) == need and 0 <= r["ci95"][0] <= r["success"] <= r["ci95"][1] <= 1 and r["physical"] == 0 for r in rows) and [r["rank"] for r in rows] == list(range(1, len(rows) + 1))
ok("compare rows valid (arena.json row shape, Wilson 95%)", valid and blk["totals"]["stepsRun"] == blk["totals"]["stepsChecked"], f"{len(rows)} rows")
ok("Wilson interval matches the arena's", harness.wilson(57, 60) == [0.863, 0.983], str(harness.wilson(57, 60)))
ok("seed gate: dev seeds allowed", seed_gate(list(range(1, 21)))["ok"])
ok("seed gate: other seeds refused", not seed_gate([7300])["ok"] and not seed_gate([21])["ok"])

# ------------------------------------------------------------------ execute / start / status / stop
r = robots["gantry"].execute("move the container", policy=load_policy("expert"), seed=2)
st = robots["gantry"].start("move the container", policy=load_policy("expert"), seed=2)
if robots["gantry"]._thread:
    robots["gantry"]._thread.join(timeout=60)
s2 = robots["gantry"].status()
ok("execute / start / status / stop", r["status"] == "success" and st["status"] == "success" and s2["content"][1]["json"]["status"] == "completed"
   and robots["gantry"].stop()["status"] == "success")

# ------------------------------------------------------------------ the user's sample runs
env = {"PATH": _real_environ.get("PATH", "/usr/bin:/bin")}
out = subprocess.run([sys.executable, str(HERE / "examples" / "pick_red_cube.py")], capture_output=True, text=True, timeout=120, env=env, cwd=str(ROOT))
ok("the sample runs", out.returncode == 0 and "succeeded" in out.stdout and "physical 0" in out.stdout, out.stdout.strip()[:160] or out.stderr[-200:])

closing = [rb.close() for rb in [arm, *robots.values(), *st_robots.values()]]
net += sum(c.get("network", 0) for c in closing)

# ------------------------------------------------------------------ guards' verdicts
ok("serial ports and cameras never opened", not OPENED_DEV and not TOUCHED, ", ".join(OPENED_DEV + TOUCHED) or "none")
ok("network calls 0 (Python sockets and the bridge)", not SOCKETS and net == 0, f"python {len(SOCKETS)}, bridge {net}")
cred = sorted(k for k in ENV_READS if CRED.search(str(k)))
ok("no API key or credential read from the environment", not cred, f"reads: {sorted(ENV_READS)}"[:160])

os.environ = _real_environ  # type: ignore[assignment]
summary = {"selftest": "robotics/strands", "pass": sum(r["ok"] for r in RESULTS), "fail": sum(not r["ok"] for r in RESULTS), "policyBase": POLICY_BASE, "results": RESULTS}
print(json.dumps(summary))
sys.exit(1 if summary["fail"] else 0)
