// ROBOTICS — a gym-style training interface over the robotics games and the
// robotics stations (docs/robot-training.md, "Robotics scenarios and the gym
// API"). One call builds an environment:
//
//   const env = rbEnv("rb-cell-entry", { seed: 7 });
//   let obs = env.reset();                          // or env.reset(seed)
//   const policy = rbPolicy(env, { skill: 1, seed: 7 });
//   for (;;) { const { observation, reward, done, info } = env.step(policy(obs)); obs = observation; if (done) break; }
//
// Headless and three.js-free, deterministic by seed (shared/robot.js rng), so
// the same seed and the same actions give the same episode byte for byte.
// Observations carry shared/robot-embodiment.js's embodiment fields (grasp,
// maxForce, pose, keepOut with the same zone shape and clearance account),
// and `info` carries exactly the per-step fields tools/export_dataset.mjs
// writes (t, feedback, hazard, operator, pose, grasp, maxForce, keepOut,
// keepOutViolation) plus the safe-practice rule a step broke — so
// tools/rb_rollout.mjs writes episodes in the dataset layer's format with no
// translation. A "station" scenario wraps a catalog station's Session through
// robot.js observe()/applyAction() and observeEmbodied() — the caller hands in
// the built room ({ room, api, SessionClass }), as tools/lib/headless.mjs
// loadSmartCity() provides.
//
// Robots never harm anyone here: every rule a learner can break ends in the
// robot holding a stop, and the penalty is for the missed practice.
// Names prefixed `rb`/`RB_` (the bundler shares one scope).

import { rng, observe, applyAction, RobotAgent } from "./robot.js";
import { observeEmbodied, zoneAt, nearestZone, GRASP_BY_KIND, STANDOFF, ZONE_RADIUS } from "./robot-embodiment.js";
import { RB_SCENARIOS, RB_RULES, RB_FORCE_N, RB_SSM, RB_SCHEMA } from "./rb-robotics-data.js";

const rbR3 = (n) => Math.round(n * 1000) / 1000;
const rbV3 = (v) => v.map(rbR3);
const rbD3 = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);

/** A scenario's plain data by id, or null. */
export function rbScenario(id) { return RB_SCENARIOS.find((s) => s.id === id) ?? null; }

/**
 * The speed-and-separation mode for a person `distance` metres from a robot:
 * "full" outside the warning zone, "reduced" inside it, "stop" inside the
 * stop zone. Shared by the cell-entry scenario and the world sites.
 */
export function rbSsmMode(distance, zones = RB_SSM) {
  if (distance <= zones.stop) return { mode: "stop", speed: 0 };
  if (distance <= zones.warn) return { mode: "reduced", speed: zones.reducedSpeed };
  return { mode: "full", speed: zones.fullSpeed };
}

/** A keep-out account in robot-embodiment.js's shape for one point. */
function rbKeepOut(zones, point, authorised = false) {
  const z = zoneAt(zones, point);
  return { zones: zones.length, inside: z ? z.id : null, part: z ? z.part : null, authorised: !z || authorised, nearest: nearestZone(zones, point) };
}
const rbPose = (p) => ({ position: rbV3(p), normal: [0, 1, 0], approach: rbV3([p[0], p[1] + STANDOFF, p[2]]), standoff: STANDOFF, euler: [0, 0, 0] });

// ------------------------------------------------------------ the core loop

/** Wrap a scenario simulation in the gym contract. `sim` supplies init(seed),
 * observe(), apply(action) -> { reward, feedback, violations[], hazard,
 * operator?, pose?, grasp?, maxForce?, keepOut?, keepOutViolation? },
 * finished(), passed() and expert(obs, random, skill). */
function rbWrap(sc, sim, seed0) {
  let seed = seed0, t = 0, steps = 0, score = 0, done = false, violations = [];
  const env = {
    id: sc.id, scenario: sc, schema: RB_SCHEMA,
    get seed() { return seed; },
    reset(s) {
      if (s !== undefined) seed = s >>> 0;
      t = 0; steps = 0; score = 0; done = false; violations = [];
      sim.init(seed);
      return sim.observe();
    },
    observe() { return sim.observe(); },
    step(action = { type: "wait" }) {
      if (done) return { observation: sim.observe(), reward: 0, done: true, info: { ...env.summary(), note: "episode already done" } };
      const r = sim.apply(action ?? { type: "wait" });
      steps += 1; t = rbR3(steps * (sc.dt ?? 1));
      let reward = r.reward ?? 0;
      for (const v of r.violations ?? []) { violations.push({ rule: v, step: steps }); reward += RB_RULES[v]?.weight ?? -1; }
      reward = rbR3(reward); score = rbR3(score + reward);
      done = sim.finished() || steps >= sc.maxSteps;
      if (done && sim.finalViolations) for (const v of sim.finalViolations()) { violations.push({ rule: v, step: steps }); reward = rbR3(reward + (RB_RULES[v]?.weight ?? -1)); score = rbR3(score + (RB_RULES[v]?.weight ?? -1)); r.violations = [...(r.violations ?? []), v]; }
      const info = {
        t, wall: null, feedback: r.feedback ?? null, hazard: !!r.hazard || !!(r.violations ?? []).length,
        operator: r.operator ?? "robot", pose: r.pose ?? null, grasp: r.grasp ?? null, maxForce: r.maxForce ?? null,
        keepOut: r.keepOut ?? null, keepOutViolation: !!r.keepOutViolation,
        violations: r.violations ?? [], score, steps,
      };
      if (done) Object.assign(info, env.summary());
      return { observation: sim.observe(), reward, done, info };
    },
    summary() {
      return { finished: sim.finished(), truncated: !sim.finished() && steps >= sc.maxSteps, passed: sim.finished() && sim.passed() && !violations.length, score, steps, violationCount: violations.length, violationRules: [...new Set(violations.map((v) => v.rule))] };
    },
    expert(obs, random, skill = 1) { return sim.expert(obs ?? sim.observe(), random, skill); },
    actionSpace() { return { scenario: sc.id, actions: sc.actions ?? ["see robot-embodiment.js actionSpace()"] }; },
  };
  return env;
}

// ------------------------------------------------- game: teleop pick-and-place

function rbTeleopSim(sc) {
  const P = sc.params;
  const BIN = [-0.4, 0.1, 0], FIX = [0.4, 0.1, 0];
  let s;
  const zones = () => [{ id: "bystander-0", label: "teammate at the bench", kind: "sphere", source: "rb-teleop", part: "bystander", center: s.mate, radius: P.teammateRadius ?? ZONE_RADIUS.bystander }];
  const part = () => s.parts[s.i] ?? null;
  return {
    init(seed) {
      const R = rng(seed * 7919 + 11);
      s = {
        p: [0, 0.3, -0.35], last: null, carrying: false, i: 0, placed: 0, mode: "run",
        mate: rbV3([(R() - 0.5) * 0.1, 0.1, 0.3 + R() * 0.06]),
        parts: Array.from({ length: P.parts }, (_, k) => ({ id: `part-${k}`, force: R() < 0.5 ? "light" : "firm" })),
      };
    },
    observe() {
      const pt = part(), cls = pt?.force ?? "none", ceil = RB_FORCE_N[cls];
      const target = s.carrying ? FIX : BIN;
      return {
        scenario: sc.id, effector: rbV3(s.p), carrying: s.carrying, mode: s.mode,
        part: pt ? { id: pt.id, maxForce: cls, ceilingN: ceil, minGripN: rbR3(ceil * 0.35) } : null,
        bin: BIN, fixture: FIX, placed: s.placed, remaining: s.parts.length - s.placed,
        grasp: GRASP_BY_KIND.drag, maxForce: cls, pose: rbPose(target), keepOut: rbKeepOut(zones(), s.p), lastFeedback: s.last ?? null,
      };
    },
    apply(a) {
      const out = { reward: -0.005, violations: [], grasp: GRASP_BY_KIND.drag, maxForce: part()?.force ?? "none" };
      if (a.type === "estop") { s.mode = "estop"; out.feedback = "estop"; }
      else if (a.type === "reset") { s.mode = "run"; out.feedback = "reset"; }
      else if (s.mode !== "run" && a.type !== "wait") out.feedback = "stopped";
      else if (a.type === "move") {
        const cap = P.speed, cl = (v) => Math.max(-cap, Math.min(cap, +v || 0));
        const next = [s.p[0] + cl(a.dx), Math.max(0, s.p[1] + cl(a.dy)), s.p[2] + cl(a.dz)];
        const ko = rbKeepOut(zones(), next);
        if (ko.inside) { out.violations.push("keep-out"); out.keepOutViolation = true; out.feedback = "protective-stop"; out.keepOut = ko; }
        else { s.p = next; out.feedback = "moved"; out.keepOut = ko; }
      } else if (a.type === "grip") {
        const pt = part();
        if (!pt || s.carrying) out.feedback = "nothing-to-grip";
        else if (rbD3(s.p, BIN) > P.tolerance * 2) out.feedback = "missed";
        else {
          const f = +a.force || 0, ceil = RB_FORCE_N[pt.force];
          if (f > ceil) { out.violations.push("over-force"); out.feedback = "over-force"; }
          else if (f < ceil * 0.35) out.feedback = "slip";
          else { s.carrying = true; out.feedback = "gripped"; }
        }
      } else if (a.type === "release") {
        if (!s.carrying) out.feedback = "empty";
        else if (rbD3(s.p, FIX) <= P.tolerance * 2) { s.carrying = false; s.placed += 1; s.i += 1; out.reward += 1; out.feedback = "placed"; }
        else { s.carrying = false; out.reward -= 0.2; out.feedback = "returned-to-bin"; }
      }
      out.pose = rbPose(s.p);
      out.keepOut = out.keepOut ?? rbKeepOut(zones(), s.p);
      // A policy re-routing after a stop reads this back; "backing-off" lasts until it is clear on the far side.
      s.last = out.feedback === "protective-stop" || (s.last !== null && s.last !== undefined && (s.last === "protective-stop" || s.last === "backing-off") && s.p[2] > -0.25 && a.type === "move") ? (out.feedback === "protective-stop" ? "protective-stop" : "backing-off") : out.feedback ?? null;
      return out;
    },
    finished() { return s.placed >= s.parts.length; },
    passed() { return s.placed >= s.parts.length; },
    expert(o, R, skill) {
      const lapse = R() < (1 - skill) * 0.4;
      if (o.mode !== "run") return { type: "reset" };
      const pt = o.part; if (!pt) return { type: "wait" };
      const goal = o.carrying ? FIX : BIN;
      if (rbD3(o.effector, goal) <= P.tolerance) {
        if (o.carrying) return { type: "release" };
        // A novice's lapse grips at the full "firm" force whatever the part says.
        return { type: "grip", force: lapse ? RB_FORCE_N.firm + 8 : rbR3((pt.ceilingN + pt.minGripN) / 2) };
      }
      // Route around the teammate: stage on the far side (z < 0) unless a lapse cuts straight across.
      const via = [0, 0.18, -0.3];
      // Once a protective stop has held it at the edge of the space, even a novice re-routes.
      const atEdge = o.lastFeedback === "protective-stop" || o.lastFeedback === "backing-off";
      const wantVia = (!lapse || atEdge) && Math.sign(o.effector[0]) !== Math.sign(goal[0]) && Math.abs(o.effector[0]) > 0.05 && o.effector[2] > -0.25;
      const tgt = atEdge && o.effector[2] > -0.25 ? [o.effector[0], 0.18, -0.3] : wantVia ? via : goal;
      const d = [tgt[0] - o.effector[0], tgt[1] - o.effector[1], tgt[2] - o.effector[2]];
      const len = Math.hypot(...d) || 1, k = Math.min(1, P.speed / len);
      return { type: "move", dx: rbR3(d[0] * k), dy: rbR3(d[1] * k), dz: rbR3(d[2] * k) };
    },
  };
}

// ---------------------------------------------------- game: AMR fleet routing

const RB_DIRS = { N: [0, -1], S: [0, 1], E: [1, 0], W: [-1, 0], wait: [0, 0] };

function rbAmrSim(sc) {
  const P = sc.params, W = P.width, H = P.height, WC = P.walkwayColumn;
  const shelf = (x, y) => [1, 2, 6, 7].includes(x) && [1, 2, 4, 5].includes(y);
  const inside = (x, y) => x >= 0 && y >= 0 && x < W && y < H;
  let s;
  const person = (tick) => ((tick + s.phase) % s.period) < s.cross;
  return {
    init(seed) {
      const R = rng(seed * 104729 + 3);
      const rows = [0, 3, 6];
      const goals = rows.slice().sort(() => R() - 0.5);
      s = { tick: 0, phase: Math.floor(R() * 12), period: 12 + Math.floor(R() * 6), cross: 4,
        robots: rows.slice(0, P.robots).map((y, i) => ({ id: `amr-${i + 1}`, x: 0, y, gx: W - 1, gy: goals[i], done: false })), delivered: 0 };
    },
    observe() {
      return {
        scenario: sc.id, tick: s.tick, width: W, height: H, walkwayColumn: WC, personOnWalkway: person(s.tick),
        robots: s.robots.map((r) => ({ id: r.id, at: [r.x, r.y], goal: [r.gx, r.gy], delivered: r.done })),
        delivered: s.delivered, grasp: null, maxForce: "none", pose: null,
        keepOut: { zones: person(s.tick) ? 1 : 0, inside: null, part: person(s.tick) ? "bystander" : null, authorised: true, nearest: null },
      };
    },
    apply(a) {
      const out = { reward: -0.01, violations: [], maxForce: "none", feedback: "tick" };
      const busy = person(s.tick);
      if (a.type === "route") {
        const moves = a.moves ?? [];
        const prop = s.robots.map((r, i) => {
          if (r.done) return [r.x, r.y];
          const d = RB_DIRS[moves[i]] ?? RB_DIRS.wait;
          const nx = r.x + d[0], ny = r.y + d[1];
          if (!inside(nx, ny) || shelf(nx, ny)) return [r.x, r.y];
          if (busy && nx === WC && r.x !== WC) { out.violations.push("yield-missed"); out.feedback = "held-for-walkway"; return [r.x, r.y]; }
          return [nx, ny];
        });
        // Conflicts: two robots to one cell, or a swap — both hold.
        const hold = new Set();
        for (let i = 0; i < prop.length; i++) for (let j = i + 1; j < prop.length; j++) {
          const same = prop[i][0] === prop[j][0] && prop[i][1] === prop[j][1];
          const swap = prop[i][0] === s.robots[j].x && prop[i][1] === s.robots[j].y && prop[j][0] === s.robots[i].x && prop[j][1] === s.robots[i].y && (prop[i][0] !== s.robots[i].x || prop[i][1] !== s.robots[i].y);
          if (same || swap) { hold.add(i); hold.add(j); out.violations.push("conflict"); out.feedback = "conflict-held"; }
        }
        // A robot moving into a cell whose robot holds also holds (repeat to a fixed point).
        let changed = true;
        while (changed) {
          changed = false;
          for (let i = 0; i < prop.length; i++) {
            if (hold.has(i)) continue;
            for (let j = 0; j < prop.length; j++) {
              if (i === j) continue;
              const jStays = hold.has(j) || (prop[j][0] === s.robots[j].x && prop[j][1] === s.robots[j].y);
              if (jStays && prop[i][0] === s.robots[j].x && prop[i][1] === s.robots[j].y && (prop[i][0] !== s.robots[i].x || prop[i][1] !== s.robots[i].y)) { hold.add(i); changed = true; if (!s.robots[j].done) { out.violations.push("conflict"); out.feedback = "conflict-held"; } }
            }
          }
        }
        s.robots.forEach((r, i) => {
          if (r.done || hold.has(i)) return;
          [r.x, r.y] = prop[i];
          if (r.x === r.gx && r.y === r.gy) { r.done = true; s.delivered += 1; out.reward += 1; out.feedback = "delivered"; }
        });
      } else if (a.type === "estop") out.feedback = "fleet-hold";
      s.tick += 1;
      return out;
    },
    finished() { return s.delivered >= s.robots.length; },
    passed() { return s.delivered >= s.robots.length; },
    expert(o, R, skill) {
      const busy = o.personOnWalkway;
      const reserved = new Set(), key = (x, y) => `${x},${y}`;
      const moves = [];
      o.robots.forEach((r, i) => {
        if (r.delivered) { moves.push("wait"); reserved.add(key(...r.at)); return; }
        const lapse = R() < (1 - skill) * 0.5;
        const blocked = new Set(reserved);
        if (!lapse) o.robots.forEach((q, j) => { if (j > i) blocked.add(key(...q.at)); });
        // BFS to the goal through free cells; the first move of the path is this tick's move.
        const start = key(...r.at), goal = key(...r.goal), prev = new Map([[start, null]]), queue = [r.at];
        while (queue.length) {
          const [x, y] = queue.shift();
          if (key(x, y) === goal) break;
          for (const [dn, [dx, dy]] of Object.entries(RB_DIRS)) {
            if (dn === "wait") continue;
            const nx = x + dx, ny = y + dy, k = key(nx, ny);
            if (!inside(nx, ny) || shelf(nx, ny) || prev.has(k) || (blocked.has(k) && k !== goal)) continue;
            prev.set(k, [key(x, y), dn]); queue.push([nx, ny]);
          }
        }
        let move = "wait";
        if (prev.has(goal)) { let k = goal; while (prev.get(k) && prev.get(k)[0] !== start) k = prev.get(k)[0]; move = prev.get(k)?.[1] ?? "wait"; }
        const d = RB_DIRS[move], nx = r.at[0] + d[0], ny = r.at[1] + d[1];
        if (!lapse && (reserved.has(key(nx, ny)) || (busy && nx === o.walkwayColumn && r.at[0] !== o.walkwayColumn))) move = "wait";
        const fin = move === "wait" ? r.at : [nx, ny];
        reserved.add(key(...fin)); if (move !== "wait") reserved.add(key(...r.at));
        moves.push(move);
      });
      return { type: "route", moves };
    },
  };
}

// ------------------------------------------------- game: cobot safety-zone setup

function rbCobotSim(sc) {
  const P = sc.params, HUMAN = 1.6, LATENCY = 0.1; // procedural approach speed (m/s) and scanner latency (s)
  let s;
  const required = () => rbR3(HUMAN * (s.stopTime + LATENCY) + s.speed * s.stopTime + P.intrusion);
  return {
    init(seed) {
      const R = rng(seed * 15485863 + 5);
      s = { stopTime: rbR3(0.3 + R() * 0.3), speed: 1, warn: 1, stop: 0.5, tested: { scanner: false, estop: false, "zone-walk": false }, committed: false, ok: false };
    },
    observe() {
      return {
        scenario: sc.id, speed: s.speed, warn: s.warn, stop: s.stop,
        stopTime: s.tested["zone-walk"] ? s.stopTime : null, requiredStop: s.tested["zone-walk"] ? required() : null,
        tested: { ...s.tested }, committed: s.committed,
        grasp: null, maxForce: "none", pose: null,
        keepOut: { zones: 1, inside: null, part: "bystander", authorised: true, nearest: { id: "stop-zone", clearance: rbR3(s.warn - s.stop) } },
      };
    },
    apply(a) {
      const out = { reward: -0.01, violations: [], maxForce: "none", feedback: a.type };
      if (a.type === "set") {
        const v = Math.max(0, +a.value || 0);
        if (a.param === "speed") s.speed = rbR3(Math.min(1.5, Math.max(0.25, v)));
        else if (a.param === "warn") s.warn = rbR3(Math.min(8, v));
        else if (a.param === "stop") s.stop = rbR3(Math.min(8, v));
        else out.feedback = "unknown-param";
      } else if (a.type === "test" && a.what in s.tested) { s.tested[a.what] = true; out.feedback = `tested-${a.what}`; }
      else if (a.type === "commit") {
        s.committed = true;
        if (s.stop < required()) out.violations.push("zone-too-small");
        if (s.warn <= s.stop) out.violations.push("warn-inside-stop");
        if (!s.tested.scanner) out.violations.push("skip-scanner-test");
        if (!s.tested.estop) out.violations.push("skip-estop-test");
        s.ok = !out.violations.length;
        if (s.ok) out.reward += 2 + 0.5 * (s.speed / 1.5); // a clean setup, and a little for keeping the cell productive
        out.feedback = s.ok ? "committed" : "committed-with-findings";
      }
      return out;
    },
    finished() { return s.committed; },
    passed() { return s.ok; },
    expert(o, R, skill) {
      const lapse = R() < (1 - skill) * 0.5;
      if (!o.tested["zone-walk"]) return { type: "test", what: "zone-walk" };
      const target = rbR3(o.requiredStop * (lapse ? 0.8 : 1.15));
      if (Math.abs(o.stop - target) > 0.02 && !(lapse && o.stop >= target)) return { type: "set", param: "stop", value: target };
      if (o.warn < o.stop + 1) return { type: "set", param: "warn", value: rbR3(o.stop + 1.2) };
      if (!o.tested.scanner && !lapse) return { type: "test", what: "scanner" };
      if (!o.tested.estop && !lapse) return { type: "test", what: "estop" };
      return { type: "commit" };
    },
  };
}

// ------------------------------------------------------- game: robot cell entry

function rbCellSim(sc) {
  const P = sc.params, GATE = RB_SSM.stop - 0.5, POST = GATE + 1;
  let s;
  return {
    init(seed) {
      const R = rng(seed * 32452843 + 9);
      s = { d: P.start + Math.floor(R() * 4), mode: "full", estopTested: false, estopped: false, locked: false, verified: false, inside: false, jam: true, restarted: false, slowedSeen: false, credited: {} };
      s.mode = rbSsmMode(s.d).mode;
    },
    observe() {
      const ssm = rbSsmMode(s.inside ? 0 : s.d);
      const mode = s.restarted ? "full" : s.locked ? "locked-out" : s.estopped ? "estopped" : ssm.mode;
      return {
        scenario: sc.id, distance: rbR3(s.inside ? 0 : s.d), gate: GATE, estopPost: POST, zones: { warn: RB_SSM.warn, stop: RB_SSM.stop },
        robotMode: mode, robotSpeed: mode === "full" || mode === "reduced" ? (s.estopped || s.locked ? 0 : ssm.speed) : 0,
        estopTested: s.estopTested, estopped: s.estopped, locked: s.locked, verified: s.verified, inside: s.inside, jam: s.jam, restarted: s.restarted,
        grasp: null, maxForce: "none", pose: null,
        keepOut: { zones: 1, inside: s.inside || s.d <= RB_SSM.stop ? "person-0" : null, part: "bystander", authorised: true, nearest: { id: "person-0", clearance: rbR3((s.inside ? 0 : s.d) - RB_SSM.stop) } },
      };
    },
    apply(a) {
      const out = { reward: -0.01, violations: [], maxForce: "none", operator: "human", feedback: a.type };
      const credit = (k, r) => { if (!s.credited[k]) { s.credited[k] = true; out.reward += r; } };
      const nearPost = !s.inside && s.d <= POST + 0.01;
      switch (a.type) {
        case "walk": {
          if (s.inside) { out.feedback = "inside"; break; }
          const step = Math.max(-P.walk, Math.min(P.walk, +a.d || 0));
          const nd = rbR3(Math.max(GATE, s.d - step));
          s.d = nd;
          const m = rbSsmMode(s.d).mode;
          if (m === "reduced" && !s.slowedSeen) { s.slowedSeen = true; out.feedback = "robot-slowed"; }
          if (m === "stop") out.feedback = "robot-protective-stop";
          break;
        }
        case "test-estop": if (!nearPost) { out.feedback = "too-far"; break; } s.estopTested = true; credit("estop-test", 0.2); out.feedback = "estop-tested"; break;
        case "press-estop": if (!nearPost) { out.feedback = "too-far"; break; } s.estopped = true; out.feedback = "estopped"; break;
        case "lockout":
          if (!nearPost) { out.feedback = "too-far"; break; }
          if (!s.estopped) { out.violations.push("lockout-order"); out.feedback = "not-stopped"; break; }
          s.locked = true; credit("lockout", 0.2); out.feedback = "locked"; break;
        case "verify": if (!s.locked) { out.feedback = "no-lock"; break; } s.verified = true; credit("verify", 0.2); out.feedback = "zero-energy"; break;
        case "enter":
          if (s.inside || s.d > GATE + 0.01) { out.feedback = s.inside ? "inside" : "too-far"; break; }
          if (!s.locked) out.violations.push("enter-live-cell");
          else if (!s.verified) out.violations.push("no-verify");
          s.inside = true; out.feedback = s.locked ? "entered" : "entered-robot-held-stop"; break;
        case "clear-jam": if (!s.inside || !s.jam) { out.feedback = "nothing"; break; } s.jam = false; out.reward += 1; out.feedback = "jam-cleared"; break;
        case "exit": if (!s.inside) { out.feedback = "outside"; break; } s.inside = false; out.feedback = "exited"; break;
        case "remove-lock": if (s.inside || !s.locked) { out.feedback = "nothing"; break; } s.locked = false; s.verified = false; out.feedback = "lock-removed"; break;
        case "restart":
          if (s.inside) { out.feedback = "person-in-cell"; break; }
          if (s.locked) { out.violations.push("restart-with-lock"); out.feedback = "lock-still-on"; break; }
          if (s.jam) { out.feedback = "jam-still-there"; break; }
          s.estopped = false; s.restarted = true; out.reward += 0.5; out.feedback = "restarted"; break;
        default: break;
      }
      return out;
    },
    finished() { return s.restarted; },
    passed() { return s.restarted && !s.jam; },
    finalViolations() {
      const v = [];
      if (!s.estopTested) v.push("skip-estop-test");
      if (!s.restarted && s.locked && !s.jam) v.push("left-locked");
      return v;
    },
    expert(o, R, skill) {
      const lapse = R() < (1 - skill) * 0.35;
      if (!o.jam && o.inside) return { type: "exit" };
      if (!o.jam && o.locked) return { type: "remove-lock" };
      if (!o.jam) return { type: "restart" };
      if (o.distance > o.gate + 0.01 && !o.inside) return { type: "walk", d: 1 };
      if (!o.estopTested && !lapse) return { type: "test-estop" };
      if (!o.estopped && !(lapse && !o.locked)) return { type: "press-estop" };
      if (!o.locked && !lapse) return { type: "lockout" };
      if (o.locked && !o.verified && !lapse) return { type: "verify" };
      if (!o.inside) return { type: "enter" };
      return { type: "clear-jam" };
    },
  };
}


// --------------------------------------- game: construction ceiling-drilling robot (ROBOSCENARIOS)

/** A ceiling-drilling robot on a concrete deck (procedural). A worker steps inside the barricade now and then on a
 * seeded schedule; while they are inside the robot holds and a drill command is a missed practice, never harm. */
function rbDrillSim(sc) {
  const P = sc.params;
  let s;
  const personInside = () => ((s.tick + s.phase) % s.period) < P.personStay;
  const DRILL = [0, 2.4, 0];
  const keepOutOf = (inside) => ({ zones: 1, inside: inside ? "person-0" : null, part: "bystander", authorised: true, nearest: { id: "barricade", clearance: inside ? 0 : 1 } });
  return {
    init(seed) {
      const R = rng(seed * 7877 + 13);
      s = { tick: 0, phase: Math.floor(R() * P.personPeriod), period: P.personPeriod + Math.floor(R() * 4), holes: P.holes + Math.floor(R() * 3), drilled: 0, scanned: false, barricaded: false, dust: false, wear: 0, isolated: false, bitChanges: 0, credited: {} };
    },
    observe() {
      const inside = personInside();
      return {
        scenario: sc.id, tick: s.tick, holesTotal: s.holes, drilled: s.drilled, remaining: s.holes - s.drilled,
        scanned: s.scanned, barricaded: s.barricaded, dust: s.dust, bitWear: rbR3(s.wear / P.bitLife), bitWorn: s.wear >= P.bitLife, isolated: s.isolated, personInside: inside,
        grasp: null, maxForce: "none", pose: rbPose(DRILL), keepOut: keepOutOf(inside),
      };
    },
    apply(a) {
      const out = { reward: -0.01, violations: [], maxForce: "none", operator: "human", feedback: a.type, pose: rbPose(DRILL) };
      const credit = (k, r) => { if (!s.credited[k]) { s.credited[k] = true; out.reward += r; } };
      const inside = personInside();
      switch (a.type) {
        case "scan": s.scanned = true; credit("scan", 0.2); out.feedback = "deck-scanned"; break;
        case "barricade": s.barricaded = true; credit("barricade", 0.2); out.feedback = "barricade-set"; break;
        case "dust-on": s.dust = true; credit("dust", 0.1); out.feedback = "dust-collection-on"; break;
        case "hold": case "estop": out.feedback = inside ? "held-for-person" : "held"; if (inside) credit("hold", 0.2); break;
        case "isolate": s.isolated = true; out.feedback = "battery-isolated"; break;
        case "change-bit": if (!s.isolated) out.violations.push("bit-change-live"); s.wear = 0; s.bitChanges += 1; out.feedback = s.isolated ? "bit-changed" : "bit-changed-live"; break;
        case "restore": s.isolated = false; out.feedback = "battery-restored"; break;
        case "drill":
          if (inside) { out.violations.push("person-in-barricade"); out.feedback = "robot-held-person-inside"; break; }
          if (s.isolated) { out.feedback = "battery-isolated"; break; }
          if (s.drilled >= s.holes) { out.feedback = "layout-done"; break; }
          if (s.wear >= P.bitLife) { out.feedback = "bit-worn"; break; }
          if (!s.scanned) out.violations.push("drill-unscanned");
          if (!s.barricaded) out.violations.push("no-barricade");
          if (!s.dust) out.violations.push("dust-off");
          s.drilled += 1; s.wear += 1; out.reward += 1; out.feedback = "hole-drilled"; break;
        default: break;
      }
      out.keepOut = keepOutOf(inside);
      s.tick += 1;
      return out;
    },
    finished() { return s.drilled >= s.holes && !s.isolated; },
    passed() { return s.drilled >= s.holes && !s.isolated; },
    expert(o, R, skill) {
      const lapse = R() < (1 - skill) * 0.4;
      // A lapse is the shortcut: drill (or swap the bit) now, whatever is still undone.
      if (lapse) return o.bitWorn ? { type: "change-bit" } : o.isolated ? { type: "restore" } : { type: "drill" };
      if (o.personInside) return { type: "hold" };
      if (!o.scanned) return { type: "scan" };
      if (!o.barricaded) return { type: "barricade" };
      if (o.bitWorn && o.remaining > 0) return o.isolated ? { type: "change-bit" } : { type: "isolate" };
      if (o.isolated) return { type: "restore" };
      if (!o.dust) return { type: "dust-on" };
      if (o.remaining > 0) return { type: "drill" };
      return { type: "wait" };
    },
  };
}

// ------------------------------------------------ game: port automation lane (ROBOSCENARIOS)

const RB_LANE_DIRS = { N: [0, -1], S: [0, 1], E: [1, 0], W: [-1, 0] };

/** One automated stacking gantry in a two-lane container yard (procedural): lane 0 is the travel lane, lane 1 the
 * stack lane with the bays. A pedestrian crossing spans both lanes at one column on a seeded schedule; a pinned
 * container's keep-out covers a span of the stack lane. Driving into either is held by the gantry and scored as a
 * missed practice. */
function rbPortSim(sc) {
  const P = sc.params, W = P.width, H = P.lanes, C = P.crossingColumn;
  let s;
  const personOn = () => ((s.tick + s.phase) % s.period) < s.stay;
  const keepOut = (x, y) => y === H - 1 && x >= s.ko && x < s.ko + P.keepOutSpan;
  const inside = (x, y) => x >= 0 && y >= 0 && x < W && y < H;
  const job = () => s.jobs[s.done] ?? null;
  const clearance = () => (s.at[1] === H - 1 ? Math.max(0, Math.min(Math.abs(s.at[0] - s.ko), Math.abs(s.at[0] - (s.ko + P.keepOutSpan - 1)))) : 1);
  return {
    init(seed) {
      const R = rng(seed * 6151 + 29);
      const ko = R() < 0.5 ? 2 + Math.floor(R() * 2) : 8 + Math.floor(R() * 2);
      const bays = [];
      for (let x = 1; x < W - 1; x++) if (Math.abs(x - C) > 1 && !(x >= ko && x < ko + P.keepOutSpan)) bays.push(x);
      const pick = () => bays.splice(Math.floor(R() * bays.length), 1)[0];
      s = { tick: 0, phase: Math.floor(R() * 10), period: 10 + Math.floor(R() * 5), stay: 3, ko, at: [0, 0], carrying: false, done: 0, jobs: Array.from({ length: P.jobs }, (_, i) => ({ id: `box-${i}`, from: pick(), to: pick() })) };
    },
    observe() {
      const j = job(), on = personOn();
      return {
        scenario: sc.id, tick: s.tick, width: W, lanes: H, crossingColumn: C, stopZone: P.stopZone, personOnCrossing: on,
        pinned: [s.ko, s.ko + P.keepOutSpan - 1], at: s.at.slice(), carrying: s.carrying, goal: j ? [s.carrying ? j.to : j.from, H - 1] : s.at.slice(),
        job: j ? { id: j.id, from: j.from, to: j.to } : null, delivered: s.done, remaining: s.jobs.length - s.done,
        grasp: s.carrying ? GRASP_BY_KIND.drag : null, maxForce: "none", pose: null,
        keepOut: { zones: on ? 2 : 1, inside: null, part: on ? "bystander" : "pinned-container", authorised: true, nearest: { id: "pinned-container", clearance: clearance() } },
      };
    },
    apply(a) {
      const out = { reward: -0.01, violations: [], maxForce: "none", feedback: a.type };
      const on = personOn(), j = job();
      if (a.type === "move") {
        const d = RB_LANE_DIRS[a.dir];
        if (!d) out.feedback = "unknown-direction";
        else {
          const nx = s.at[0] + d[0], ny = s.at[1] + d[1];
          if (!inside(nx, ny)) out.feedback = "edge-of-yard";
          else if (nx === C && s.at[0] !== C && on) { out.violations.push("crossing-stop-zone"); out.feedback = "held-at-crossing"; }
          else if (keepOut(nx, ny)) { out.violations.push("pinned-keep-out"); out.feedback = "held-at-keep-out"; }
          else { s.at = [nx, ny]; out.feedback = Math.abs(nx - C) <= P.stopZone && nx !== C ? "in-stop-zone" : "moved"; }
        }
      } else if (a.type === "hold" || a.type === "estop") {
        const inZone = on && Math.abs(s.at[0] - C) <= P.stopZone && s.at[0] !== C;
        out.feedback = inZone ? "held-in-stop-zone" : "held";
        if (inZone) out.reward += 0.05;
      } else if (a.type === "lift") {
        if (!j || s.carrying) out.feedback = "nothing-to-lift";
        else if (s.at[0] !== j.from || s.at[1] !== H - 1) out.feedback = "not-at-bay";
        else { s.carrying = true; out.reward += 0.5; out.feedback = "lifted"; }
      } else if (a.type === "set") {
        if (!j || !s.carrying) out.feedback = "nothing-to-set";
        else if (s.at[0] !== j.to || s.at[1] !== H - 1) out.feedback = "not-at-bay";
        else { s.carrying = false; s.done += 1; out.reward += 1; out.feedback = "set-down"; }
      }
      out.grasp = s.carrying ? GRASP_BY_KIND.drag : null;
      out.keepOut = { zones: on ? 2 : 1, inside: null, part: on ? "bystander" : "pinned-container", authorised: true, nearest: { id: "pinned-container", clearance: clearance() } };
      s.tick += 1;
      return out;
    },
    finished() { return s.done >= s.jobs.length; },
    passed() { return s.done >= s.jobs.length; },
    expert(o, R, skill) {
      const lapse = R() < (1 - skill) * 0.5;
      const j = o.job; if (!j) return { type: "wait" };
      const goal = [o.carrying ? j.to : j.from, o.lanes - 1];
      if (o.at[0] === goal[0] && o.at[1] === goal[1]) return { type: o.carrying ? "set" : "lift" };
      // BFS through free cells; a careful driver treats the crossing as blocked while a person is on it.
      const ko = (x, y) => y === o.lanes - 1 && x >= o.pinned[0] && x <= o.pinned[1];
      const blocked = (x, y) => !lapse && (ko(x, y) || (o.personOnCrossing && x === o.crossingColumn));
      const key = (x, y) => `${x},${y}`, start = key(...o.at), gk = key(...goal), prev = new Map([[start, null]]), queue = [o.at];
      while (queue.length) {
        const [x, y] = queue.shift();
        if (key(x, y) === gk) break;
        for (const [dn, [dx, dy]] of Object.entries(RB_LANE_DIRS)) {
          const nx = x + dx, ny = y + dy, k = key(nx, ny);
          if (nx < 0 || ny < 0 || nx >= o.width || ny >= o.lanes || prev.has(k) || blocked(nx, ny)) continue;
          prev.set(k, [key(x, y), dn]); queue.push([nx, ny]);
        }
      }
      const first = (target) => { let k = target; while (prev.get(k) && prev.get(k)[0] !== start) k = prev.get(k)[0]; return prev.get(k)?.[1] ?? null; };
      if (prev.has(gk)) return { type: "move", dir: first(gk) };
      // The crossing is busy between here and the bay: drive up to the stop zone's edge on the travel lane, then hold there.
      const side = Math.sign(o.crossingColumn - o.at[0]) || 1, waitAt = key(o.crossingColumn - side, 0);
      if (start === waitAt || Math.abs(o.at[0] - o.crossingColumn) <= 1) return { type: "hold" };
      const dir = prev.has(waitAt) ? first(waitAt) : null;
      return dir ? { type: "move", dir } : { type: "hold" };
    },
  };
}

// --------------------------------------------------------- station scenarios

function rbStationSim(sc, bind) {
  const { room, SessionClass, rebuild = null } = bind ?? {};
  let api = bind?.api ?? null;
  if (!room || !api || !SessionClass) throw new Error(`rbEnv(${sc.id}): a station scenario needs { station: { room, api, SessionClass } } (tools/lib/headless.mjs loadSmartCity())`);
  let session, fb = null, agent = null, agentSeed = 1, engineRandom = Math.random;
  // The engine draws a little cosmetic noise from Math.random (a track step's wobble, shared/game.js); for an
  // episode to be deterministic by seed, the env lends it a seeded stream for the length of each call only.
  const seeded = (fn) => { const m = Math.random; Math.random = engineRandom; try { return fn(); } finally { Math.random = m; } };
  const ids = () => { const hitIds = Object.keys(api.hits ?? {}); return { hitIds, hazardIds: Object.keys(room.hazards ?? {}).filter((id) => hitIds.includes(id)) }; };
  return {
    init(seed) {
      // A station moves its props as it runs (a drag carries a part), so a reset rebuilds it when the caller can.
      if (rebuild) api = rebuild();
      fb = null; agent = null; agentSeed = seed; engineRandom = rng(seed * 48271 + 17);
      session = seeded(() => new SessionClass(room, {
        onStep: (st, x) => api.onStep?.(st, x), onStepComplete: (st, x) => api.onStepComplete?.(st, x),
        onFeedback: (f, x) => { fb = f; api.onFeedback?.(f, x); }, onHazard: (id, x) => api.onHazard?.(id, x),
      }));
      seeded(() => session.start());
    },
    observe() { const o = observeEmbodied(session, api, { room }); return { scenario: sc.id, station: room.id, ...o }; },
    apply(a) {
      const before = session.score; fb = null;
      seeded(() => { applyAction(session, a); session.tick(sc.dt); });
      const o = observeEmbodied(session, api, { room });
      return { reward: (session.score - before) / 100, violations: fb?.hazard ? ["hazard"] : [], hazard: !!fb?.hazard, feedback: fb?.kind ?? null, grasp: o.grasp ?? null, maxForce: o.maxForce ?? null, pose: o.pose ?? null, keepOut: o.keepOut ?? null, operator: o.operator ?? "robot" };
    },
    finished() { return session.finished; },
    passed() { return session.finished && session.stars >= 2 && session.hazardHits === 0; },
    expert(o, R, skill) {
      if (!agent || agent.skill !== skill) agent = new RobotAgent({ skill, seed: agentSeed, ...ids() });
      return agent.act(session);
    },
    raw() { return observe(session); },
  };
}

const RB_SIMS = { "rb-teleop-pick-place": rbTeleopSim, "rb-amr-fleet-routing": rbAmrSim, "rb-cobot-zone-setup": rbCobotSim, "rb-cell-entry": rbCellSim, "rb-construction-drilling": rbDrillSim, "rb-port-gantry": rbPortSim };

/**
 * Build an environment for a scenario id. Options: `seed` (default 1) and,
 * for a station scenario, `station: { room, api, SessionClass }`.
 */
export function rbEnv(scenarioId, { seed = 1, station = null } = {}) {
  const sc = rbScenario(scenarioId);
  if (!sc) throw new Error(`rbEnv: unknown scenario ${scenarioId}`);
  const sim = sc.kind === "station" ? rbStationSim(sc, station) : RB_SIMS[sc.id]?.(sc);
  if (!sim) throw new Error(`rbEnv: no simulation for ${scenarioId}`);
  const env = rbWrap(sc, sim, seed >>> 0);
  env.reset();
  return env;
}

/** A seeded, skill-parameterised scripted policy for an env: skill 1 is the
 * safe-practice expert (the demonstration), lower skills lapse. Returns
 * `(observation) => action`. */
export function rbPolicy(env, { skill = 1, seed = 1 } = {}) {
  const R = rng(seed * 2654435761 + 1);
  return (obs) => env.expert(obs, R, skill);
}

/** Run one episode headlessly and return { steps, summary } — each step the
 * { observation, action, reward, done, info } the dataset layer writes. */
export function rbRollout(env, { skill = 1, seed = env.seed, policy = null } = {}) {
  let obs = env.reset(seed);
  const pol = policy ?? rbPolicy(env, { skill, seed });
  const steps = [];
  for (let i = 0; i <= env.scenario.maxSteps; i++) {
    const action = pol(obs);
    const r = env.step(action);
    steps.push({ observation: obs, action, reward: r.reward, done: r.done, info: r.info });
    obs = r.observation;
    if (r.done) break;
  }
  return { steps, summary: env.summary() };
}
