// ROBOTRAIN-7 (docs/consoles/ROBOTRAIN-7.md): the robot-learning roadmap's next items, on top of ROBOTRAIN-6
// (shared/rt6-learn.js), COLEARN (shared/col-learn.js), ROBOTICS' gym (shared/rb-env.js) and AGENTGYM's ratings
// (shared/ag-feedback.js). Every robot is simulated.
//
// What each piece IS, plainly:
//   * A PER-STEP REWARD: the same BRADLEY–TERRY fit as rt6FitReward (logistic regression, no intercept, on feature
//     differences), but over SHORT STEP WINDOWS (the step and the next two), so a failing run's good moments are scored
//     apart from its bad ones. The pairs are seeded and SYNTHETIC: one window from each run of ROBOTRAIN-6's synthetic
//     pairs, chosen by a SYNTHETIC WINDOW RATER that prefers the window with no rule broken, then more progress. Before
//     cloning, only the low-reward moments are dropped (RT7_DROP_BELOW, fixed before any held-out seed was run); every
//     other step of every demonstration, passing or failing, is cloned with COLEARN's k-NN.
//   * A NON-PRIVILEGED REACTIVE AGENT for the gym scenarios: fixed rules over a declared list of observation fields
//     (RT7_REACTIVE_FIELDS, the safety fields plus the task's own position and goal); the observation is cut down to those
//     fields before any rule reads it. No search, no planner, no learning. It sits between random and the scripted expert.
//   * ROBOT-RUN RATINGS live on the teleop pad (shared/rt-teleop.js rt7RobotRun and the pad's "Rate two robot runs"):
//     a learner's thumbs up or down on two cloned robot runs goes through AGENTGYM's agRate (adult opt-in only; never K-12,
//     demo or signed-out; local only; revoke deletes), and rt6LocalPairs turns them into pairs while collecting.
//
// SEAMS
//   RT7_WINDOW, RT7_WINDOW_FEATURES, rt7WindowFeatures(episode, t, W) -> number[3]
//   rt7WindowPairs(scenarioId, { n, seed }) -> { pairs, episodes }   (synthetic; agPreferencePairs' shape plus x and ceil)
//   rt7EvalStepReward(scenarioId, opts) -> { pairs, model, accuracy, threshold, ...clone success on held-out seeds, sweep }
//   RT7_REACTIVE_FIELDS, rt7ReactivePolicy(scenarioId) -> (observation) -> action
// Every top-level name is prefixed rt7/RT7_ (the bundler shares one scope). No network code, no upload, no model call.

import { rng } from "./robot.js";
import { colSyntheticDemos, colDemosFromEpisodes, colTrain, colPolicy, colEvalPolicy, colHeldOut, colHash, colBase } from "./col-learn.js";
import { rt6SyntheticPairs, rt6FitReward, rt6PairAccuracy, rt6RaterCeiling } from "./rt6-learn.js";

export const RT7_VERSION = "rt7/1";
const rt7R3 = (n) => Math.round(n * 1000) / 1000;
const rt7Dot = (w, x) => { let s = 0; for (let i = 0; i < w.length; i++) s += w[i] * x[i]; return s; };
const rt7Sig = (z) => 1 / (1 + Math.exp(-z));

// ================================================================ a per-step reward over short windows

/** A window is the step and the next two. Fixed before any held-out seed was run. */
export const RT7_WINDOW = 3;
export const RT7_WINDOW_FEATURES = ["broke", "waitRate", "progress"];
export const RT7_WINDOW_TEXT = {
  broke: "share of the window's steps that broke a safe-practice rule", waitRate: "share of the robots' decisions that were a wait",
  progress: "the robots' summed distance to their drop-offs, start of window minus end, over W × the robots still moving (−1..1)",
};
const rt7Unsafe = (s) => !!(s.info?.unsafe || s.info?.hazard || s.info?.outcome === "hazard");
const rt7Dist = (o) => (o?.robots ?? []).reduce((n, r) => n + (r.delivered ? 0 : Math.abs(r.goal[0] - r.at[0]) + Math.abs(r.goal[1] - r.at[1])), 0);

/** The features of the window of `W` steps starting at step `t` of a DX robot-game episode (AMR's route actions). */
export function rt7WindowFeatures(ep, t, W = RT7_WINDOW) {
  const steps = ep?.steps ?? [], n = steps.length;
  if (!n) return [0, 0, 0];
  const a = Math.max(0, Math.min(t, n - 1)), b = Math.min(n, a + W);
  let broke = 0, waits = 0, moves = 0;
  for (let k = a; k < b; k++) {
    const s = steps[k], robots = s.observation?.robots ?? [];
    if (rt7Unsafe(s)) broke += 1;
    (s.action?.moves ?? []).forEach((m, i) => { if (robots[i]?.delivered) return; moves += 1; if (m === "wait") waits += 1; });
  }
  const o0 = steps[a].observation, o1 = (steps[b] ?? steps[n - 1]).observation;
  const moving = (o0?.robots ?? []).filter((r) => !r.delivered).length || 1;
  const progress = Math.max(-1, Math.min(1, (rt7Dist(o0) - rt7Dist(o1)) / (W * moving)));
  return [broke / (b - a), moves ? waits / moves : 0, progress].map(rt7R3);
}

/** The SYNTHETIC WINDOW RATER: ours, not measured. It prefers a window with no rule broken, then more progress; waits are
 * not penalised. Bradley–Terry choice at temperature RT7_RATER_TEMP. */
export const RT7_WINDOW_RATER = "synthetic window rater: utility = −4·(any rule broken in the window) + 1·progress; Bradley–Terry choice at temperature 0.5";
export const RT7_RATER_TEMP = 0.5;
const rt7WindowUtility = (x) => -4 * (x[0] > 0 ? 1 : 0) + 1 * x[2];

/** Seeded synthetic window pairs: for pair i, one window (start drawn by a seeded generator) from each of the two runs of
 * ROBOTRAIN-6's synthetic pair i, chosen by the synthetic window rater. Labelled synthetic. */
export function rt7WindowPairs(sc, { n = 200, seed = 1, W = RT7_WINDOW } = {}) {
  const P = rt6SyntheticPairs(sc, { n, seed });
  const R = rng(seed * 7907 + 29), pairs = [];
  for (let i = 0; i < n; i++) {
    const a = P.episodes[2 * i], b = P.episodes[2 * i + 1];
    const ta = Math.floor(R() * a.steps.length), tb = Math.floor(R() * b.steps.length);
    const xa = rt7WindowFeatures(a, ta, W), xb = rt7WindowFeatures(b, tb, W);
    const pa = rt7Sig((rt7WindowUtility(xa) - rt7WindowUtility(xb)) / RT7_RATER_TEMP);
    const aWins = R() < pa;
    const [c, r, xc, xr, tc, tr] = aWins ? [a, b, xa, xb, ta, tb] : [b, a, xb, xa, tb, ta];
    pairs.push({ station: sc, source: "synthetic", window: W, ceil: rt7R3(Math.max(pa, 1 - pa)),
      chosen: { runId: `${c.episodeId}@${tc}`, agent: "synthetic", episodeId: c.episodeId }, rejected: { runId: `${r.episodeId}@${tr}`, agent: "synthetic", episodeId: r.episodeId },
      reasons: { chosen: xc[0] < xr[0] ? "safe-order" : "efficient", rejected: xr[0] > 0 ? "unsafe-touch" : "slow" }, x: { chosen: xc, rejected: xr } });
  }
  return { pairs, episodes: P.episodes };
}

/** Drop a step when the model's own probability that its window beats the median window is below this. Fixed before any
 * held-out seed was run; the other thresholds are a sensitivity sweep, not chosen from. */
export const RT7_DROP_BELOW = 0.25;
export const RT7_DROP_SWEEP = [0.1, 0.25, 0.5];

/** The per-step reward end to end for one scenario: synthetic window pairs → reward model → every step of the same 40
 * demonstrations colEvalScenario clones scored by its window → the low-reward steps dropped → clone success on the
 * held-out seeds. */
export function rt7EvalStepReward(sc, { pairs = 200, trainPairs = 150, demos = 40, seed = 1, heldOut = 60, W = RT7_WINDOW, threshold = RT7_DROP_BELOW, sweep = RT7_DROP_SWEEP } = {}) {
  const P = rt7WindowPairs(sc, { n: pairs, seed, W });
  const train = P.pairs.slice(0, trainPairs), test = P.pairs.slice(trainPairs);
  const model = rt6FitReward(train, { names: RT7_WINDOW_FEATURES });
  const eps = colSyntheticDemos(sc, { n: demos, seed });
  const { demos: ds } = colDemosFromEpisodes(eps, sc);
  const byId = new Map(eps.map((e) => [e.episodeId, e]));
  const rewards = ds.map((d) => { const ep = byId.get(d.id); return ep.steps.map((s, t) => rt7Dot(model.w, rt7WindowFeatures(ep, t, W))); });
  const broke = ds.map((d) => byId.get(d.id).steps.map(rt7Unsafe));
  const all = rewards.flat().sort((a, b) => a - b), med = all.length ? (all[(all.length - 1) >> 1] + all[all.length >> 1]) / 2 : 0;
  const seeds = colHeldOut(heldOut);
  const arm = (thr) => {
    let dropped = 0, of = 0, brokeOf = 0, brokeDropped = 0;
    const kept = ds.map((d, k) => ({ ...d, steps: d.steps.filter((s, t) => {
      of += 1; if (broke[k][t]) brokeOf += 1;
      if (rt7Sig(rewards[k][t] - med) < thr) { dropped += 1; if (broke[k][t]) brokeDropped += 1; return false; }
      return true;
    }) }));
    const m = colTrain(sc, kept, { seed, onlySuccessful: false });
    return { threshold: thr, stepsDropped: dropped, stepsOf: of, ruleBrokenSteps: brokeOf, ruleBrokenDropped: brokeDropped, demos: m.demos, rows: m.rows.length, ...colEvalPolicy(sc, () => colPolicy(m), { seeds }), modelHash: colHash(m) };
  };
  const main = arm(threshold);
  return {
    version: RT7_VERSION, window: W, features: RT7_WINDOW_FEATURES, rater: RT7_WINDOW_RATER,
    pairs: { synthetic: P.pairs.length, train: train.length, heldOut: test.length, from: "one window from each run of ROBOTRAIN-6's synthetic pair i (labelled synthetic)" },
    model: { names: model.names, w: model.w, l2: model.l2, iters: model.iters, meanNll: model.meanNll },
    accuracy: { train: rt6PairAccuracy(model, train), heldOut: rt6PairAccuracy(model, test), raterCeilingHeldOut: rt6RaterCeiling(test) },
    medianStepReward: rt7R3(med),
    rule: `drop a step when sigmoid(its window's reward − the median step reward) < ${threshold}; keep every other step of every demonstration (no run-level filter)`,
    ...main,
    sweep: sweep.map((t) => (t === threshold ? main : arm(t))).map((a) => ({ threshold: a.threshold, stepsDropped: a.stepsDropped, demos: a.demos, rows: a.rows, n: a.n, success: a.success, clean: a.clean, meanSteps: a.meanSteps })),
  };
}

// ================================================================ a non-privileged reactive agent

/** The only observation fields each scenario's reactive rules may read: the safety fields plus the task's own position and
 * goal. The observation is cut down to these before any rule runs. The AMR rules also know the aisle layout (the same
 * shelf cells COLEARN's features use); the agent keeps one bit per robot (which way it stepped aside around the pallet). */
export const RT7_REACTIVE_FIELDS = {
  "rb-construction-drilling": ["personInside", "scanned", "barricaded", "dust", "isolated", "bitWorn", "remaining"],
  "rb-port-gantry": ["at", "carrying", "job", "lanes", "width", "crossingColumn", "personOnCrossing", "pinned", "obstruction"],
  "rb-amr-fleet-routing": ["robots", "width", "height", "walkwayColumn", "personOnWalkway", "walkways", "blocked"],
};
export const RT7_REACTIVE = "a reactive rule-follower: no search, no planner, no learning; it reads only RT7_REACTIVE_FIELDS (the safety fields plus the task's own position and goal)";
const RT7_SHELF = (x, y) => [1, 2, 6, 7].includes(x) && [1, 2, 4, 5].includes(y);
const RT7_DIRS = { N: [0, -1], S: [0, 1], E: [1, 0], W: [-1, 0] };

/** The reactive agent for one gym scenario (base or variant): observation -> action. Stateful only as noted above. */
export function rt7ReactivePolicy(sc0) {
  const sc = colBase(sc0), fields = RT7_REACTIVE_FIELDS[sc];
  if (!fields) return null;
  const see = (o) => Object.fromEntries(fields.filter((k) => k in o).map((k) => [k, o[k]]));
  if (sc === "rb-construction-drilling") {
    return (o0) => {
      const o = see(o0);
      if (o.personInside) return { type: "hold" };
      if (!o.scanned) return { type: "scan" };
      if (!o.barricaded) return { type: "barricade" };
      if (!o.dust) return { type: "dust-on" };
      if (o.bitWorn && o.remaining > 0) return o.isolated ? { type: "change-bit" } : { type: "isolate" };
      if (o.isolated) return { type: "restore" };
      return o.remaining > 0 ? { type: "drill" } : { type: "wait" };
    };
  }
  if (sc === "rb-port-gantry") {
    return (o0) => {
      const o = see(o0), j = o.job;
      if (!j) return { type: "wait" };
      const gx = o.carrying ? j.to : j.from, lane = o.lanes - 1, [x, y] = o.at;
      if (x === gx && y === lane) return { type: o.carrying ? "set" : "lift" };
      const pinned = (a, b) => b === lane && a >= o.pinned[0] && a <= o.pinned[1];
      const wall = (a, b) => !!o.obstruction && o.obstruction[0] === a && o.obstruction[1] === b;
      const crossingBusy = (a) => o.personOnCrossing && a === o.crossingColumn && x !== o.crossingColumn;
      const ok = (a, b) => a >= 0 && b >= 0 && a < o.width && b < o.lanes && !wall(a, b) && !pinned(a, b) && !crossingBusy(a);
      const dx = Math.sign(gx - x), go = (dir) => ({ type: "move", dir }), along = dx > 0 ? "E" : "W", hold = { type: "hold" };
      // At the bay's column: down to the stack lane.
      if (dx === 0) return ok(x, y + 1) ? go("S") : hold;
      // Travel on the travel lane (the pinned span is on the stack lane); use the stack lane only to pass the obstruction.
      if (y === lane) {
        if ((wall(x + dx, 0) || wall(x, 0)) && ok(x + dx, y)) return go(along);
        if (ok(x, y - 1)) return go("N");
        return ok(x + dx, y) ? go(along) : hold;
      }
      if (ok(x + dx, y)) return go(along);
      if (wall(x + dx, y) && ok(x, y + 1)) return go("S");
      return hold;
    };
  }
  if (sc === "rb-amr-fleet-routing") {
    const aside = new Map();
    return (o0) => {
      const o = see(o0);
      const ws = o.walkways ?? [{ column: o.walkwayColumn, busy: o.personOnWalkway }];
      const claimed = new Set(o.robots.map((r) => r.at.join(",")));
      const moves = o.robots.map((r, i) => {
        if (r.delivered) return "wait";
        const [x, y] = r.at, [gx, gy] = r.goal;
        const pallet = (a, b) => !!o.blocked && o.blocked[0] === a && o.blocked[1] === b;
        const free = (a, b) => a >= 0 && b >= 0 && a < o.width && b < o.height && !RT7_SHELF(a, b) && !pallet(a, b) && !claimed.has(`${a},${b}`);
        const safe = (d) => { const nx = x + RT7_DIRS[d][0], ny = y + RT7_DIRS[d][1]; return free(nx, ny) && !ws.some((w) => w.busy && nx === w.column && x !== w.column); };
        const h = gx > x ? "E" : gx < x ? "W" : null, v = gy > y ? "S" : gy < y ? "N" : null;
        if (aside.has(r.id) && (!o.blocked || x > o.blocked[0])) aside.delete(r.id);
        let pick = null;
        if (aside.has(r.id)) pick = h && safe(h) ? h : safe(aside.get(r.id)) ? aside.get(r.id) : null;
        else {
          // The longer way first (ties: change rows first); the other productive move when the first is not safe.
          const order = Math.abs(gx - x) > Math.abs(gy - y) ? [h, v] : [v, h];
          pick = order.find((d) => d && safe(d)) ?? null;
          // The pallet is in this aisle and no productive move is open: step aside (north first) and keep going round it.
          if (!pick && h && pallet(x + RT7_DIRS[h][0], y)) { const side = ["N", "S"].find((d) => safe(d)); if (side) { aside.set(r.id, side); pick = side; } }
        }
        if (!pick) return "wait";
        claimed.delete(`${x},${y}`); claimed.add(`${x + RT7_DIRS[pick][0]},${y + RT7_DIRS[pick][1]}`);
        return pick;
      });
      return { type: "route", moves };
    };
  }
  return null;
}
