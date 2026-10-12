"""Policy adapters on the strands-robots ``Policy`` interface.

STRANDS (docs/strands-robots.md). Each adapter implements ``async get_actions(observation_dict, instruction) ->
list[dict]``, ``set_robot_state_keys(keys)`` and ``provider_name``. When strands-robots is installed the adapters
subclass ``strands_robots.policies.Policy``; otherwise they subclass an identical local abstract base class.
``POLICY_BASE`` says which one is in use.

The models are this repository's own, trained here (ra-arena.js) and exported to JSON weights by
``tools/ra_export_weights.mjs`` into ``robotics/strands/weights/``:

    bc, dagger-r1, dagger-r3   k-nearest-neighbour behaviour clones (same distance, tie order and vote as COLEARN)
    ra-lm                      the small language-conditioned model trained here (a masked softmax over the task's
                               own text x scene features; not a large language model). The user's instruction picks
                               the scenario (harness.py); the model reads the scenario's task-text vector.
    expert                     the scripted expert, an upper bound. It reads the simulator's own state, so the
                               adapter asks the bridge to run it ({"expert": true}); it has no weights.
    random                     a seeded random policy over the scenario's action space (Python's own generator, so
                               its numbers differ from the arena's random row).
    strands-mock               strands_robots.MockPolicy, only when strands-robots is installed.

Standard library only; numpy is used for the k-NN distances when present (the same per-feature summation order).
"""

from __future__ import annotations

import abc
import gzip
import json
import math
import random
import warnings
from pathlib import Path
from typing import Any, Dict, List, Optional

WEIGHTS = Path(__file__).resolve().parent / "weights"

try:  # pragma: no cover - depends on the environment
    with warnings.catch_warnings():
        warnings.simplefilter("ignore")
        from strands_robots.policies import Policy as _PolicyBase  # type: ignore
    POLICY_BASE = "strands_robots.policies.Policy (installed)"
except Exception:  # noqa: BLE001 - not installed (or its dependencies are missing)

    class _PolicyBase(abc.ABC):  # type: ignore[no-redef]
        """Identical to strands_robots.policies.Policy (0.3.8): the same three abstract members."""

        @abc.abstractmethod
        async def get_actions(self, observation_dict: Dict[str, Any], instruction: str, **kwargs) -> List[Dict[str, Any]]:
            ...

        @abc.abstractmethod
        def set_robot_state_keys(self, robot_state_keys: List[str]) -> None:
            ...

        @property
        @abc.abstractmethod
        def provider_name(self) -> str:
            ...

    POLICY_BASE = "local abstract base identical to strands_robots.policies.Policy (strands-robots not installed)"

Policy = _PolicyBase

try:  # optional
    import numpy as _np  # type: ignore
except Exception:  # noqa: BLE001
    _np = None


def _base(sc: str) -> str:
    return str(sc).split("#")[0]


def _load(name: str) -> Dict[str, Any]:
    p = WEIGHTS / name
    if not p.exists():
        raise FileNotFoundError(f"{p} is missing: run node tools/ra_export_weights.mjs")
    with gzip.open(p, "rt", encoding="utf-8") as f:
        return json.load(f)


class _Adapter(Policy):
    """Shared plumbing: state keys, and the episode hook SimRobot calls before an episode."""

    model_id = "?"

    def __init__(self) -> None:
        self.robot_state_keys: List[str] = []
        self.scenario: Optional[str] = None
        self.seed = 1

    def set_robot_state_keys(self, robot_state_keys: List[str]) -> None:
        self.robot_state_keys = list(robot_state_keys)

    def begin_episode(self, scenario: str, seed: int) -> None:
        self.scenario, self.seed = scenario, int(seed)

    @property
    def provider_name(self) -> str:
        return f"vr-safety-training/{self.model_id}"


class KnnClonePolicy(_Adapter):
    """A behaviour clone (k-NN over hand-written scene features), from exported weights."""

    def __init__(self, model_id: str = "bc") -> None:
        super().__init__()
        self.model_id = model_id
        self._models: Dict[str, Dict[str, Any]] = {}

    def _model(self, sc: str) -> Dict[str, Any]:
        b = _base(sc)
        if b not in self._models:
            m = _load(f"{self.model_id}--{b}.json.gz")
            m["_X"] = _np.array([r["x"] for r in m["rows"]], dtype=float) if _np is not None and m["rows"] else None
            self._models[b] = m
        return self._models[b]

    def _neighbours(self, m: Dict[str, Any], x: List[float]):
        w, rows, k = m["weights"], m["rows"], m["k"]
        if m.get("_X") is not None:
            X = m["_X"]
            s = _np.zeros(len(rows))
            for f in range(len(x)):  # the same per-feature order as COLEARN's colNeighbours
                d = (x[f] - X[:, f]) * w[f]
                s += d * d
            idx = _np.argsort(s, kind="stable")[:k]
            return [(int(i), float(s[i])) for i in idx]
        scored = []
        for i, r in enumerate(rows):
            s = 0.0
            for f in range(len(x)):
                d = (x[f] - r["x"][f]) * w[f]
                s += d * d
            scored.append((s, i))
        scored.sort()
        return [(i, s) for s, i in scored[:k]]

    def _vote(self, m: Dict[str, Any], x: List[float]):
        nb = self._neighbours(m, x)
        votes: Dict[str, float] = {}
        for i, s in nb:
            r = m["rows"][i]
            votes[r["label"]] = votes.get(r["label"], 0.0) + r.get("w", 1) / (math.sqrt(s) + 0.05)
        label = sorted(votes, key=lambda l: (-votes[l], l))[0]
        return label, [m["rows"][i]["p"] for i, _ in nb if m["rows"][i]["label"] == label]

    async def get_actions(self, observation_dict: Dict[str, Any], instruction: str, **kwargs) -> List[Dict[str, Any]]:
        sc = observation_dict.get("scenario") or self.scenario
        m = self._model(sc)
        if not m["rows"]:
            return [{"type": "wait"}]
        if "robots" in observation_dict:
            return [{"moves": ["wait" if f is None else self._vote(m, f)[0] for f in observation_dict["robots"]]}]
        label, ps = self._vote(m, observation_dict["features"])
        return [{"label": label, "params": ps}]


class SmallLmPolicy(_Adapter):
    """The small language-conditioned model trained here (not a large language model), from exported weights."""

    model_id = "ra-lm"

    def __init__(self) -> None:
        super().__init__()
        self.m = _load("ra-lm.json.gz")

    def _scene(self, x: List[float]) -> List[float]:
        D = self.m["D"]
        s = [0.0] * (D + 1)
        for i in range(min(len(x), D)):
            s[i] = max(-4.0, min(4.0, x[i]))
        s[D] = 1.0
        return s

    def _logit(self, l: int, t: List[float], s: List[float]) -> float:
        w, S = self.m["w"], len(s)
        off, z = l * self.m["T"] * S, 0.0
        for a in range(len(t)):
            ta = t[a]
            if not ta:
                continue
            o, u = off + a * S, 0.0
            for b in range(S):
                u += w[o + b] * s[b]
            z += ta * u
        return z

    async def get_actions(self, observation_dict: Dict[str, Any], instruction: str, **kwargs) -> List[Dict[str, Any]]:
        sc = observation_dict.get("scenario") or self.scenario
        base = _base(sc)
        task = sc if sc in self.m["labelsByTask"] else base
        labels = self.m["labels"]
        mask = [labels.index(l) for l in self.m["labelsByTask"].get(task, [])]
        if not mask:
            return [{"type": "wait"}]
        t = self.m["taskVectors"].get(sc) or self.m["taskVectors"][base]

        def pick(s: List[float]) -> str:
            best, bl = -math.inf, -1
            for l in mask:
                v = self._logit(l, t, s)
                if v > best:
                    best, bl = v, l
            return labels[bl] if bl >= 0 else "wait"

        if "robots" in observation_dict:
            return [{"moves": ["wait" if f is None else pick(self._scene(f)) for f in observation_dict["robots"]]}]
        s = self._scene(observation_dict["features"])
        label = pick(s)
        reg = self.m["pReg"].get(task, {}).get(label) or []
        fw = self.m["featureWeights"][base]
        d = []
        for i, (x, p) in enumerate(reg):
            z = 0.0
            for f in range(len(x)):
                e = (x[f] - s[f]) * (fw[f] if f < len(fw) else 1)
                z += e * e
            d.append((z, i, p))
        d.sort(key=lambda e: (e[0], e[1]))
        return [{"label": label, "params": [e[2] for e in d[: self.m["paramK"]]]}]


class ScriptedExpertPolicy(_Adapter):
    """The scripted expert (an upper bound, not a learner). It reads the simulator's state, so the bridge runs it."""

    model_id = "expert"

    async def get_actions(self, observation_dict: Dict[str, Any], instruction: str, **kwargs) -> List[Dict[str, Any]]:
        return [{"expert": True}]


class RandomPolicy(_Adapter):
    """A seeded random policy over the scenario's action space (the floor). Reseeded per episode."""

    model_id = "random"

    def begin_episode(self, scenario: str, seed: int) -> None:
        super().begin_episode(scenario, seed)
        self.R = random.Random(int(seed) * 9973 + 5)

    async def get_actions(self, observation_dict: Dict[str, Any], instruction: str, **kwargs) -> List[Dict[str, Any]]:
        R = getattr(self, "R", None) or random.Random(1)
        b = _base(observation_dict.get("scenario") or self.scenario or "")
        r3 = lambda v: round(v, 3)  # noqa: E731
        if b == "rb-teleop-pick-place":
            t = R.choice(["move", "move", "move", "grip", "release"])
            if t == "move":
                return [{"type": "move", "dx": r3((R.random() - 0.5) * 0.24), "dy": r3((R.random() - 0.5) * 0.24), "dz": r3((R.random() - 0.5) * 0.24)}]
            return [{"type": "grip", "force": r3(R.random() * 45)}] if t == "grip" else [{"type": "release"}]
        if b == "rb-cobot-zone-setup":
            t = R.choice(["set", "set", "test", "commit"])
            if t == "set":
                return [{"type": "set", "param": R.choice(["warn", "stop", "speed"]), "value": r3(R.random() * 4)}]
            return [{"type": "test", "what": R.choice(["scanner", "estop", "zone-walk"])}] if t == "test" else [{"type": "commit"}]
        if b == "rb-port-gantry":
            t = R.choice(["move", "move", "move", "move", "hold", "lift", "set"])
            return [{"type": "move", "dir": R.choice("NSEW")}] if t == "move" else [{"type": t}]
        if b == "rb-amr-fleet-routing":
            return [{"type": "route", "moves": [R.choice(["N", "S", "E", "W", "wait"]) for _ in observation_dict.get("robots", [])]}]
        return [{"type": "wait"}]


def strands_mock_policy() -> Optional[Any]:
    """strands_robots.MockPolicy when strands-robots is installed, else None (it is not installed in this repo)."""
    try:
        with warnings.catch_warnings():
            warnings.simplefilter("ignore")
            from strands_robots.policies import MockPolicy  # type: ignore
        return MockPolicy()
    except Exception:  # noqa: BLE001
        return None


POLICY_IDS = ["random", "bc", "dagger-r1", "dagger-r3", "ra-lm", "expert"]


def load_policy(policy_id: str) -> Any:
    """A policy adapter by id (see the module docstring)."""
    if policy_id in ("bc", "dagger-r1", "dagger-r3"):
        return KnnClonePolicy(policy_id)
    if policy_id == "ra-lm":
        return SmallLmPolicy()
    if policy_id == "expert":
        return ScriptedExpertPolicy()
    if policy_id == "random":
        return RandomPolicy()
    if policy_id in ("strands-mock", "mock"):
        p = strands_mock_policy()
        if p is None:
            raise LookupError("strands_robots.MockPolicy needs strands-robots installed; it is not installed here")
        return p
    raise LookupError(f"unknown policy '{policy_id}' (known: {', '.join(POLICY_IDS)}, strands-mock)")
