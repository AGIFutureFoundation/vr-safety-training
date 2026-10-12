"""SimRobot: a simulated robot tool with the strands-robots ``Robot`` tool's actions and ``tool_spec`` shape.

STRANDS (docs/strands-robots.md). Simulated only. This module never opens a serial port, a camera or a network
socket, and never imports lerobot, torch, serial or cv2. It drives this repository's arena scenarios through
``tools/ra_bridge.mjs`` (JSONL over stdin/stdout, deterministic for a seed); every step goes through the VBRIDGE
safety governor in the bridge, and the bridge reports ``physical: 0`` on every reply.

Robot types (generic, by kind; no product is simulated):

    so100, so100_follower, so101, so101_follower  -> the arena's desktop arm, teleop pick-and-place
                                                     (a generic six-joint arm; the sim exposes its effector in metres)
    cobot                                          -> cobot safety-zone set-up; the cobot station (rb-station-cobot)
    amr                                            -> AMR fleet routing (and its hard variant); the AMR station
                                                      (rb-station-amr-fleet)
    cell                                           -> the robot cell lockout and re-entry station (rb-station-robot-cell)

The three stations are the catalog drills the arena wraps (rb-env station scenarios); the bridge loads the headless
station suite for them the first time one is reset.
    gantry                                         -> port gantry lane (and its hard variant)

Any other type is refused with a reason. A request for real hardware (a ``port``, ``cameras``, ``physical=True`` or
``target="physical"``) is refused with the governor's own reason (``physical-target``).
"""

from __future__ import annotations

import asyncio
import json
import os
import shutil
import subprocess
import threading
import time
from pathlib import Path
from typing import Any, Dict, List, Optional

ROOT = Path(__file__).resolve().parents[2]
BRIDGE = ROOT / "tools" / "ra_bridge.mjs"

ROBOT_TYPES: Dict[str, Dict[str, Any]] = {
    "so100": {"scenarios": ["rb-teleop-pick-place"], "kind": "desktop arm (generic six-joint arm, by kind)"},
    "so100_follower": {"scenarios": ["rb-teleop-pick-place"], "kind": "desktop arm (generic six-joint arm, by kind)"},
    "so101": {"scenarios": ["rb-teleop-pick-place"], "kind": "desktop arm (generic six-joint arm, by kind)"},
    "so101_follower": {"scenarios": ["rb-teleop-pick-place"], "kind": "desktop arm (generic six-joint arm, by kind)"},
    "cobot": {"scenarios": ["rb-cobot-zone-setup", "rb-station-cobot"], "kind": "collaborative arm cell (zone set-up; the cobot risk-assessment station)"},
    "amr": {"scenarios": ["rb-amr-fleet-routing", "rb-amr-fleet-routing#hard", "rb-station-amr-fleet"], "kind": "warehouse mobile robots (fleet; the AMR traffic and e-stop station)"},
    "cell": {"scenarios": ["rb-station-robot-cell"], "kind": "industrial robot cell (the lockout and safe re-entry station)"},
    "gantry": {"scenarios": ["rb-port-gantry", "rb-port-gantry#hard"], "kind": "port gantry crane lane"},
}
# State keys a joint-style policy (strands_robots.MockPolicy) is given on the desktop arm: the effector in metres
# plus the gripper, because the simulated arm is driven in Cartesian space (documented in docs/strands-robots.md).
ARM_STATE_KEYS = ["ee.x", "ee.y", "ee.z", "gripper.pos"]
HARDWARE_KWARGS = ("port", "cameras", "robot_config", "serial_port", "device")


class RobotTypeRefused(ValueError):
    """The robot type has no simulated scenario here."""


class HardwareRefused(PermissionError):
    """Real hardware was requested; the governor refuses a physical target."""

    def __init__(self, reason: str, text: str):
        super().__init__(f"{reason}: {text}")
        self.reason = reason
        self.text = text


def _node() -> str:
    exe = shutil.which("node")
    if not exe:
        raise RuntimeError("node is required to run the arena bridge (tools/ra_bridge.mjs)")
    return exe


class Bridge:
    """One ``node tools/ra_bridge.mjs`` process. Its environment carries PATH only (no credential reaches it)."""

    def __init__(self) -> None:
        env = {"PATH": os.environ.get("PATH", "/usr/bin:/bin")}
        self.proc = subprocess.Popen([_node(), str(BRIDGE)], stdin=subprocess.PIPE, stdout=subprocess.PIPE,
                                     stderr=subprocess.PIPE, text=True, cwd=str(ROOT), env=env, bufsize=1)
        self.lock = threading.Lock()

    def call(self, msg: Dict[str, Any]) -> Dict[str, Any]:
        with self.lock:
            assert self.proc.stdin and self.proc.stdout
            self.proc.stdin.write(json.dumps(msg) + "\n")
            self.proc.stdin.flush()
            line = self.proc.stdout.readline()
        if not line:
            err = self.proc.stderr.read() if self.proc.stderr else ""
            raise RuntimeError(f"ra_bridge exited: {err[-400:]}")
        out = json.loads(line)
        if out.get("physical", 0) != 0:
            raise RuntimeError("ra_bridge reported a physical dispatch")
        return out

    def close(self) -> Dict[str, Any]:
        try:
            out = self.call({"op": "bye"})
        except Exception:  # noqa: BLE001
            out = {"ok": False}
        try:
            self.proc.wait(timeout=5)
        except Exception:  # noqa: BLE001
            self.proc.kill()
        return out


class SimRobot:
    """A simulated robot tool. Same actions as strands-robots' ``Robot`` (execute, start, status, stop) and the same
    ``tool_spec`` shape; ``policy_port`` is accepted and ignored (policies run in this process, see policies.py)."""

    def __init__(self, robot_type: str, tool_name: Optional[str] = None, *, scenario: Optional[str] = None,
                 action_horizon: int = 8, physical: bool = False, **kwargs: Any):
        self.robot_type = str(robot_type)
        self.tool_name_str = tool_name or f"sim_{self.robot_type}"
        self.action_horizon = int(action_horizon)
        self._bridge: Optional[Bridge] = None
        hw = [k for k in HARDWARE_KWARGS if kwargs.get(k)]
        if physical or hw or kwargs.get("target") == "physical":
            d = self.governor_check(target="physical")
            raise HardwareRefused(d["primary"], d["text"])
        if self.robot_type not in ROBOT_TYPES:
            raise RobotTypeRefused(f"robot type '{self.robot_type}' has no simulated arena scenario here "
                                   f"(simulated types: {', '.join(sorted(ROBOT_TYPES))})")
        spec = ROBOT_TYPES[self.robot_type]
        self.scenarios: List[str] = list(spec["scenarios"])
        self.kind: str = spec["kind"]
        if scenario is not None and scenario not in self.scenarios:
            raise RobotTypeRefused(f"{self.robot_type} does not run {scenario} (it runs {', '.join(self.scenarios)})")
        self.scenario = scenario or self.scenarios[0]
        self.robot_state_keys = list(ARM_STATE_KEYS) if self.scenario == "rb-teleop-pick-place" else []
        self._state = {"status": "idle", "instruction": "", "steps": 0, "result": None, "error": ""}
        self._thread: Optional[threading.Thread] = None
        self._stop = threading.Event()
        self.policy = None

    # ------------------------------------------------------------------ bridge
    @property
    def bridge(self) -> Bridge:
        if self._bridge is None:
            self._bridge = Bridge()
        return self._bridge

    def close(self) -> Dict[str, Any]:
        out = self._bridge.close() if self._bridge else {"ok": True, "network": 0}
        self._bridge = None
        return out

    def governor_check(self, target: str = "sim") -> Dict[str, Any]:
        """The governor's decision for a command to this robot; ``target="physical"`` is refused with its reason."""
        b = self._bridge or Bridge()
        try:
            sc = getattr(self, "scenario", None) or "rb-teleop-pick-place"
            return b.call({"op": "check", "target": target, "robot": self.robot_type, "scenario": sc})
        finally:
            if b is not self._bridge:
                b.close()

    # ------------------------------------------------------------------ one episode
    def run_episode(self, policy: Any, instruction: str, seed: int = 1, scenario: Optional[str] = None) -> Dict[str, Any]:
        """Run ``policy`` (a strands-robots-style Policy) for one seeded episode. Returns the per-seed result."""
        sc = scenario or self.scenario
        if sc not in self.scenarios:
            raise RobotTypeRefused(f"{self.robot_type} does not run {sc}")
        r = self.bridge.call({"op": "reset", "scenario": sc, "seed": int(seed)})
        if not r.get("ok"):
            raise RuntimeError(r.get("error"))
        if hasattr(policy, "set_robot_state_keys"):
            policy.set_robot_state_keys(self.robot_state_keys)
        if hasattr(policy, "begin_episode"):
            policy.begin_episode(sc, int(seed))
        obs, done, steps = r["obs"], False, 0
        while not done and not self._stop.is_set():
            actions = asyncio.run(policy.get_actions(obs, instruction))
            if not actions:
                actions = [{"type": "wait"}]
            for a in actions[: max(1, self.action_horizon)]:
                s = self.bridge.call({"op": "step", "action": self._to_bridge(a)})
                if not s.get("ok"):
                    raise RuntimeError(s.get("error"))
                obs, done, steps = s["obs"], s["done"], s["steps"]
                self._state["steps"] = steps
                if done or self._stop.is_set():
                    break
        out = self.bridge.call({"op": "summary"})
        out.pop("ok", None)
        out["stoppedByUser"] = self._stop.is_set() and not done
        return out

    def _to_bridge(self, a: Dict[str, Any]) -> Dict[str, Any]:
        """A policy action to the bridge. Native forms pass through; a LeRobot-style joint dict (keys from
        ``robot_state_keys``, as MockPolicy returns) is mapped to an effector move or a grip on the desktop arm."""
        if any(k in a for k in ("type", "label", "moves", "expert")):
            return a
        if self.robot_state_keys and any(k in a for k in self.robot_state_keys):
            g = float(a.get("gripper.pos", 0.0))
            if g > 0.08:
                return {"type": "grip", "force": 8}
            if g < -0.08:
                return {"type": "release"}
            clip = lambda v: max(-0.12, min(0.12, float(v)))  # noqa: E731
            return {"type": "move", "dx": clip(a.get("ee.x", 0)), "dy": clip(a.get("ee.y", 0)), "dz": clip(a.get("ee.z", 0))}
        return {"type": "wait"}

    # ------------------------------------------------------------------ the tool's four actions
    def execute(self, instruction: str, policy: Any = None, seed: int = 1, **_: Any) -> Dict[str, Any]:
        """Blocking run (strands-robots ``action="execute"``)."""
        if not instruction:
            return {"status": "error", "content": [{"text": "instruction is required for execute"}]}
        pol = policy or self.policy
        if pol is None:
            from .policies import load_policy  # local import: policies imports nothing from here
            pol = load_policy("bc")
        self._stop.clear()
        self._state.update(status="running", instruction=instruction, steps=0, error="")
        t0 = time.time()
        try:
            res = self.run_episode(pol, instruction, seed=seed)
        except Exception as e:  # noqa: BLE001
            self._state.update(status="error", error=str(e))
            return {"status": "error", "content": [{"text": f"{self.tool_name_str}: {e}"}]}
        self._state.update(status="stopped" if res.get("stoppedByUser") else "completed", result=res)
        text = (f"Task: '{instruction}' - {self._state['status']} (simulated {self.robot_type}, {self.scenario}, seed {seed})\n"
                f"success {res['success']}, steps {res['steps']}, rule breaks {res['ruleBreaks']}, "
                f"governor checked {res['governorChecked']} of {res['steps']}, physical {res['physical']}, "
                f"{time.time() - t0:.2f} s")
        return {"status": "success", "content": [{"text": text}, {"json": res}]}

    def start(self, instruction: str, policy: Any = None, seed: int = 1, **_: Any) -> Dict[str, Any]:
        """Non-blocking run in a thread (``action="start"``); poll ``status``."""
        if self._state["status"] == "running":
            return {"status": "error", "content": [{"text": "a task is already running; use stop first"}]}
        self._state["status"] = "running"
        self._thread = threading.Thread(target=self.execute, args=(instruction, policy, seed), daemon=True)
        self._thread.start()
        return {"status": "success", "content": [{"text": f"started '{instruction}' on simulated {self.robot_type}; use status"}]}

    def status(self, **_: Any) -> Dict[str, Any]:
        s = dict(self._state)
        return {"status": "success", "content": [{"text": f"{self.tool_name_str}: {s['status']}, steps {s['steps']}"}, {"json": s}]}

    def stop(self, **_: Any) -> Dict[str, Any]:
        if self._state["status"] != "running":
            return {"status": "success", "content": [{"text": f"no task running (current: {self._state['status']})"}]}
        self._stop.set()
        if self._thread:
            self._thread.join(timeout=30)
        return {"status": "success", "content": [{"text": f"stopped; {self._state['steps']} steps"}]}

    # ------------------------------------------------------------------ AgentTool-shaped surface
    @property
    def tool_name(self) -> str:
        return self.tool_name_str

    @property
    def tool_type(self) -> str:
        return "robot"

    @property
    def tool_spec(self) -> Dict[str, Any]:
        return {
            "name": self.tool_name_str,
            "description": (f"Simulated robot ({self.robot_type}: {self.kind}; arena scenario {self.scenario}). "
                            "Actions: execute (blocking), start (async), status, stop. Simulated only: every step "
                            "passes the safety governor and nothing reaches hardware."),
            "inputSchema": {
                "json": {
                    "type": "object",
                    "properties": {
                        "action": {"type": "string", "description": "Action to perform: execute (blocking), start (async), status, stop",
                                   "enum": ["execute", "start", "status", "stop"], "default": "execute"},
                        "instruction": {"type": "string", "description": "Natural language instruction (required for execute/start actions)"},
                        "policy_port": {"type": "integer", "description": "Accepted for shape compatibility and ignored: policies run in-process"},
                        "policy_host": {"type": "string", "description": "Accepted and ignored (no policy server is contacted)", "default": "localhost"},
                        "policy_provider": {"type": "string", "description": "Policy id from robotics/strands/policies.py", "default": "bc"},
                        "duration": {"type": "number", "description": "Accepted for shape compatibility; episodes end at the scenario's step cap", "default": 30.0},
                        "seed": {"type": "integer", "description": "Simulation seed (deterministic)", "default": 1},
                    },
                    "required": ["action"],
                }
            },
        }

    async def stream(self, tool_use: Dict[str, Any], invocation_state: Optional[dict] = None, **_: Any):
        """The ``AgentTool.stream`` shape: yields one result dict for a tool use."""
        tid = tool_use.get("toolUseId", "")
        inp = tool_use.get("input", {}) or {}
        action = inp.get("action", "execute")
        if inp.get("target") == "physical":
            d = self.governor_check(target="physical")
            yield {"toolUseId": tid, "status": "error", "content": [{"text": f"refused by the governor ({d['primary']}): {d['text']}"}]}
            return
        pol = None
        if action in ("execute", "start") and inp.get("policy_provider"):
            from .policies import load_policy
            pol = load_policy(inp["policy_provider"])
        fn = {"execute": self.execute, "start": self.start, "status": self.status, "stop": self.stop}.get(action)
        if fn is None:
            yield {"toolUseId": tid, "status": "error", "content": [{"text": f"Unknown action: {action}. Valid actions: execute, start, status, stop"}]}
            return
        kw = {"instruction": inp.get("instruction", ""), "policy": pol, "seed": int(inp.get("seed", 1))} if action in ("execute", "start") else {}
        yield {"toolUseId": tid, **fn(**kw)}
