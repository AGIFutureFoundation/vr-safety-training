// ROBOTRAIN-8 (docs/consoles/ROBOTRAIN-8.md): the declared retests, on top of ROBOTRAIN-7 (shared/rt7-learn.js),
// ROBOTRAIN-6 (shared/rt6-learn.js), COLEARN (shared/col-learn.js) and ROBOTICS' gym (shared/rb-env.js). Every robot is
// simulated. Every rule below was declared in docs/consoles/ROBOTRAIN-8.md and committed before any run on the held-out
// seeds 7061–7120.
//
// What each piece IS, plainly:
//   * OVERSAMPLED WINDOW PAIRS for ROBOTRAIN-7's per-step reward: the same windows, features, SYNTHETIC WINDOW RATER and
//     Bradley–Terry fit, but every even pair aims one window at a rule-broken step when its runs have one, so about half
//     the pairs show the model a broken rule. Scored once on the fresh seeds against the rule filter.
//   * LOCAL ROUTE FEATURES ("amr-local", opt-in): what a robot can see around itself, with NO SEARCH OUTPUT of any kind
//     (no shortest path, no planner): the free cells within two steps and the other robots' last moves. The last moves
//     come from the episode's previous observation, added by a wrapper (rt8WithLast); nothing is looked up ahead.
//   * DAGGER-STYLE CORRECTIONS (rt8Dagger): ROBOTRAIN-6's rounds with the last-move wrapper and a held-out range as an
//     argument. The labels are the SCRIPTED EXPERT's action at skill 1, not a person's correction.
//   * A REACTIVE AGENT WITH WAIT-THEN-SIDESTEP (rt8ReactivePolicy): ROBOTRAIN-7's rule-follower plus one rule on AMR.
//     No search, no planner, no learning.
//
// SEAMS
//   RT8_HELD_OUT (7061–7120), RT8_OVERSAMPLE, rt8WindowPairs(scenarioId, { n, seed }) -> { pairs, episodes }
//   rt8EvalStepReward(scenarioId, opts) -> { pairs, model, accuracy, declared, hintOversampled, hintRt7Pairs, ruleFiltered, unfiltered }
//   COL_FEATURE_SETS["amr-local"], COL_FEATURE_SETS["amr-holders-local"] (registered here; opt-in)
//   rt8WithLast(observation, previous) -> observation + lastMoves      rt8Stateful(model) -> (observation) -> action
//   rt8Dagger(scenarioId, { rounds, rollouts, featureSet, seeds, score, aliasingSets }) -> { rounds, expert, gap, aliasing }
//   RT8_SIDESTEP_K, rt8ReactivePolicy(scenarioId) -> (observation) -> action
// Every top-level name is prefixed rt8/RT8_ (the bundler shares one scope). Tools-only, like rt6-learn.js and rt7-learn.js:
// no page loads it, so it is in no bundle list. No network code, no upload, no model call.

import { rng } from "./robot.js";
import { rbEnv, rbRollout } from "./rb-env.js";
import { COL_FEATURES, COL_FEATURE_SETS, colSyntheticDemos, colDemosFromEpisodes, colTrain, colPolicy, colEvalPolicy, colHeldOut, colHash, colBase } from "./col-learn.js";
import { rt6SyntheticPairs, rt6FitReward, rt6PairAccuracy, rt6RaterCeiling, rt6Aliasing, RT6_DAGGER_SEED0, RT6_DAGGER_LABELS } from "./rt6-learn.js";
import { RT7_WINDOW, RT7_WINDOW_FEATURES, RT7_WINDOW_RATER, RT7_RATER_TEMP, RT7_DROP_BELOW, rt7WindowFeatures, rt7WindowPairs, rt7ReactivePolicy, RT7_REACTIVE_FIELDS } from "./rt7-learn.js";

export const RT8_VERSION = "rt8/1";
/** This round's held-out seeds, fresh: 7061–7120. Declared before any run; nothing is tuned on them. */
export const RT8_HELD_OUT = colHeldOut(60, 7061);
const rt8R3 = (n) => Math.round(n * 1000) / 1000;
const rt8Dot = (w, x) => { let s = 0; for (let i = 0; i < w.length; i++) s += w[i] * x[i]; return s; };
const rt8Sig = (z) => 1 / (1 + Math.exp(-z));
const rt8Range = (seeds) => (seeds.length ? `${seeds[0]}–${seeds[seeds.length - 1]}` : "none");
const rt8Unsafe = (s) => !!(s.info?.unsafe || s.info?.hazard || s.info?.outcome === "hazard");
// ROBOTRAIN-7's synthetic window rater, the same utility (rt7-learn.js keeps it module-private).
const rt8WindowUtility = (x) => -4 * (x[0] > 0 ? 1 : 0) + 1 * x[2];

// ================================================================ item 1: oversampled window pairs

export const RT8_OVERSAMPLE = "for an even pair index, window A starts 0–2 steps before a rule-broken step drawn uniformly from every rule-broken step of the 400 synthetic runs, and window B starts uniformly in run b of pair i; for an odd index both windows start uniformly in pair i's runs, as ROBOTRAIN-7 (amended before any held-out run: the first rule, pair i's own runs only, gave 23 and 48 of 200)";

/** Seeded synthetic window pairs with the declared oversampling rule, from the same synthetic runs ROBOTRAIN-7 used
 * (ROBOTRAIN-6's 200 synthetic pairs, 400 runs). Labelled synthetic. Each pair says whether it was aimed and whether a
 * window broke a rule. */
export function rt8WindowPairs(sc, { n = 200, seed = 1, W = RT7_WINDOW } = {}) {
  const P = rt6SyntheticPairs(sc, { n, seed });
  const R = rng(seed * 7907 + 31), pairs = [];
  // Every rule-broken step of every run, in run order then step order.
  const pool = P.episodes.flatMap((ep) => ep.steps.map((s, t) => (rt8Unsafe(s) ? [ep, t] : null)).filter(Boolean));
  for (let i = 0; i < n; i++) {
    let a = P.episodes[2 * i], b = P.episodes[2 * i + 1], ta, tb, aimed = false;
    if (i % 2 === 0 && pool.length) {
      const [ep, t0] = pool[Math.floor(R() * pool.length)];
      a = ep; ta = Math.max(0, t0 - Math.floor(R() * W)); tb = Math.floor(R() * b.steps.length);
      aimed = true;
    } else { ta = Math.floor(R() * a.steps.length); tb = Math.floor(R() * b.steps.length); }
    const xa = rt7WindowFeatures(a, ta, W), xb = rt7WindowFeatures(b, tb, W);
    const pa = rt8Sig((rt8WindowUtility(xa) - rt8WindowUtility(xb)) / RT7_RATER_TEMP);
    const aWins = R() < pa;
    const [c, r, xc, xr, tc, tr] = aWins ? [a, b, xa, xb, ta, tb] : [b, a, xb, xa, tb, ta];
    pairs.push({ station: sc, source: "synthetic", window: W, aimed, broken: xa[0] > 0 || xb[0] > 0, ceil: rt8R3(Math.max(pa, 1 - pa)),
      chosen: { runId: `${c.episodeId}@${tc}`, agent: "synthetic", episodeId: c.episodeId }, rejected: { runId: `${r.episodeId}@${tr}`, agent: "synthetic", episodeId: r.episodeId },
      reasons: { chosen: xc[0] < xr[0] ? "safe-order" : "efficient", rejected: xr[0] > 0 ? "unsafe-touch" : "slow" }, x: { chosen: xc, rejected: xr } });
  }
  return { pairs, episodes: P.episodes };
}

/** Item 1 end to end for one scenario, on this round's held-out seeds: the oversampled pairs at the declared threshold
 * (the result), the P < 0.5 hint beside it (on the oversampled pairs and on ROBOTRAIN-7's own pairs), and the rule filter
 * and the unfiltered clone on the same seeds. */
export function rt8EvalStepReward(sc, { pairs = 200, trainPairs = 150, demos = 40, seed = 1, seeds = RT8_HELD_OUT, W = RT7_WINDOW, threshold = RT7_DROP_BELOW, hint = 0.5 } = {}) {
  const fit = (P) => { const train = P.pairs.slice(0, trainPairs), test = P.pairs.slice(trainPairs); return { train, test, model: rt6FitReward(train, { names: RT7_WINDOW_FEATURES }) }; };
  const P8 = rt8WindowPairs(sc, { n: pairs, seed, W }), P7 = rt7WindowPairs(sc, { n: pairs, seed, W });
  const F8 = fit(P8), F7 = fit(P7);
  const eps = colSyntheticDemos(sc, { n: demos, seed });
  const { demos: ds } = colDemosFromEpisodes(eps, sc);
  const byId = new Map(eps.map((e) => [e.episodeId, e]));
  const broke = ds.map((d) => byId.get(d.id).steps.map(rt8Unsafe));
  const scoreSteps = (model) => {
    const rewards = ds.map((d) => { const ep = byId.get(d.id); return ep.steps.map((s, t) => rt8Dot(model.w, rt7WindowFeatures(ep, t, W))); });
    const all = rewards.flat().sort((x, y) => x - y);
    return { rewards, med: all.length ? (all[(all.length - 1) >> 1] + all[all.length >> 1]) / 2 : 0 };
  };
  const arm = (S, thr) => {
    let dropped = 0, of = 0, brokeOf = 0, brokeDropped = 0;
    const kept = ds.map((d, k) => ({ ...d, steps: d.steps.filter((s, t) => {
      of += 1; if (broke[k][t]) brokeOf += 1;
      if (rt8Sig(S.rewards[k][t] - S.med) < thr) { dropped += 1; if (broke[k][t]) brokeDropped += 1; return false; }
      return true;
    }) }));
    const m = colTrain(sc, kept, { seed, onlySuccessful: false });
    return { threshold: thr, medianStepReward: rt8R3(S.med), stepsDropped: dropped, stepsOf: of, ruleBrokenSteps: brokeOf, ruleBrokenDropped: brokeDropped, demos: m.demos, rows: m.rows.length, ...colEvalPolicy(sc, () => colPolicy(m), { seeds }), modelHash: colHash(m) };
  };
  const plain = (onlySuccessful) => { const m = colTrain(sc, ds, { seed, onlySuccessful }); return { demos: m.demos, rows: m.rows.length, ...colEvalPolicy(sc, () => colPolicy(m), { seeds }), modelHash: colHash(m) }; };
  const describe = (F) => ({ model: { names: F.model.names, w: F.model.w, l2: F.model.l2, iters: F.model.iters, meanNll: F.model.meanNll }, accuracy: { train: rt6PairAccuracy(F.model, F.train), heldOut: rt6PairAccuracy(F.model, F.test), raterCeilingHeldOut: rt6RaterCeiling(F.test) } });
  const withBroken = (P) => P.pairs.filter((p) => p.x.chosen[0] > 0 || p.x.rejected[0] > 0).length;
  const S8 = scoreSteps(F8.model), S7 = scoreSteps(F7.model);
  return {
    scenario: sc, version: RT8_VERSION, heldOut: rt8Range(seeds), window: W, features: RT7_WINDOW_FEATURES, rater: RT7_WINDOW_RATER,
    pairs: { synthetic: P8.pairs.length, train: F8.train.length, heldOut: F8.test.length, rule: RT8_OVERSAMPLE, aimed: P8.pairs.filter((p) => p.aimed).length, withBrokenRule: withBroken(P8), rt7PairsWithBrokenRule: withBroken(P7) },
    ...describe(F8),
    rule: `drop a step when sigmoid(its window's reward − the median step reward) < ${threshold}; keep every other step of every demonstration (no run-level filter)`,
    declared: arm(S8, threshold),
    hintOversampled: arm(S8, hint),
    hintRt7Pairs: { pairs: "ROBOTRAIN-7's own window pairs (rt7WindowPairs), unchanged", ...describe(F7), ...arm(S7, hint) },
    ruleFiltered: plain(true),
    unfiltered: plain(false),
  };
}

// ================================================================ item 2: local route features (no search output)

const RT8_SHELF = (x, y) => [1, 2, 6, 7].includes(x) && [1, 2, 4, 5].includes(y);
const RT8_DIRS = { N: [0, -1], S: [0, 1], E: [1, 0], W: [-1, 0] };
/** The cells at Manhattan distance 2, in the declared order E2, W2, S2, N2, NE, NW, SE, SW (north is −y). */
const RT8_RING2 = [[2, 0], [-2, 0], [0, 2], [0, -2], [1, -1], [-1, -1], [1, 1], [-1, 1]];
const RT8_LOCAL_NAMES = ["freeE2", "freeW2", "freeS2", "freeN2", "freeNE", "freeNW", "freeSE", "freeSW", "stillN", "stillS", "stillE", "stillW", "towardN", "towardS", "towardE", "towardW"];
const RT8_LOCAL_WEIGHTS = [1, 1, 1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 2, 2, 2, 2];
const RT8_LOCAL_TEXT = [
  ...["two cells east", "two cells west", "two cells south", "two cells north", "the cell north-east", "the cell north-west", "the cell south-east", "the cell south-west"].map((c) => [`${c} is free`, `${c} is taken`]),
  ...["north", "south", "east", "west"].map((d) => [`the robot just ${d} did not move last tick`, `no stopped robot just ${d}`]),
  ...["north", "south", "east", "west"].map((d) => [`the nearest robot to the ${d} moved toward this one last tick`, `no robot to the ${d} is coming this way`]),
];

/** The episode's last moves, added to an AMR observation: each robot's cell now minus its cell in `prev` ([0, 0] without one). */
export function rt8WithLast(obs, prev) {
  if (!obs?.robots) return obs;
  return { ...obs, lastMoves: obs.robots.map((r, i) => { const p = prev?.robots?.[i]; return p ? [r.at[0] - p.at[0], r.at[1] - p.at[1]] : [0, 0]; }) };
}

/** Per robot: [order, 8 free cells within two steps, 4 still neighbours, 4 robots coming toward it]. Reads the grid, the
 * shelves, the pallet, the robots' cells and lastMoves only: no path, no search. */
function rt8LocalFeatures(o) {
  const moving = o.robots.map((r, i) => (r.delivered ? -1 : i)).filter((i) => i >= 0);
  const at = new Map(o.robots.map((r, i) => [r.at.join(","), i]));
  const last = o.lastMoves ?? o.robots.map(() => [0, 0]);
  const open = (a, b) => a >= 0 && b >= 0 && a < o.width && b < o.height && !RT8_SHELF(a, b) && !(o.blocked && o.blocked[0] === a && o.blocked[1] === b);
  return o.robots.map((r, i) => {
    const [x, y] = r.at;
    const pos = moving.indexOf(i), order = pos < 0 || moving.length < 2 ? 0 : pos / (moving.length - 1);
    const free2 = RT8_RING2.map(([dx, dy]) => (open(x + dx, y + dy) && !at.has(`${x + dx},${y + dy}`) ? 1 : 0));
    const still = ["N", "S", "E", "W"].map((d) => { const j = at.get(`${x + RT8_DIRS[d][0]},${y + RT8_DIRS[d][1]}`); return j !== undefined && j !== i && last[j][0] === 0 && last[j][1] === 0 ? 1 : 0; });
    const toward = ["N", "S", "E", "W"].map((d) => {
      const [dx, dy] = RT8_DIRS[d];
      for (let k = 1; k <= 2; k++) { const j = at.get(`${x + dx * k},${y + dy * k}`); if (j !== undefined && j !== i) return last[j][0] === -dx && last[j][1] === -dy ? 1 : 0; }
      return 0;
    });
    return [order, ...free2, ...still, ...toward];
  });
}

const RT8_AMR = COL_FEATURES["rb-amr-fleet-routing"];
/** "amr-local": COLEARN's 9 AMR features, the robot's place in the order, and the 16 local features. No search output. */
COL_FEATURE_SETS["amr-local"] = {
  needsLast: true,
  names: [...RT8_AMR.names, "order", ...RT8_LOCAL_NAMES],
  weights: [...RT8_AMR.weights, 4, ...RT8_LOCAL_WEIGHTS],
  mid: [...RT8_AMR.mid, 0.5, ...RT8_LOCAL_NAMES.map(() => 0.5)],
  text: [...RT8_AMR.text, ["this robot moves late in the order", "this robot moves early in the order"], ...RT8_LOCAL_TEXT],
  perRobot: (o) => { const base = RT8_AMR.perRobot(o), loc = rt8LocalFeatures(o); return o.robots.map((r, i) => ({ delivered: base[i].delivered, f: [...base[i].f, ...loc[i]] })); },
};
/** "amr-holders-local": ROBOTRAIN-7's "amr-holders" (which keeps amr-path's static route around shelves and the pallet)
 * plus the same 16 local features; it shows what the local view adds on top of that route. */
COL_FEATURE_SETS["amr-holders-local"] = {
  needsLast: true,
  names: [...COL_FEATURE_SETS["amr-holders"].names, ...RT8_LOCAL_NAMES],
  weights: [...COL_FEATURE_SETS["amr-holders"].weights, ...RT8_LOCAL_WEIGHTS],
  mid: [...COL_FEATURE_SETS["amr-holders"].mid, ...RT8_LOCAL_NAMES.map(() => 0.5)],
  text: [...COL_FEATURE_SETS["amr-holders"].text, ...RT8_LOCAL_TEXT],
  perRobot: (o) => { const base = COL_FEATURE_SETS["amr-holders"].perRobot(o), loc = rt8LocalFeatures(o); return o.robots.map((r, i) => ({ delivered: base[i].delivered, f: [...base[i].f, ...loc[i].slice(1)] })); },
};

/** A cloned policy that adds the episode's last moves to each AMR observation before the clone reads it. One per episode. */
export function rt8Stateful(model) {
  const pol = colPolicy(model), aug = colBase(model.scenario) === "rb-amr-fleet-routing";
  let prev = null;
  return (obs) => { const o = aug ? rt8WithLast(obs, prev) : obs; prev = obs; return pol(o); };
}
const rt8AugmentSteps = (steps) => steps.map((s, t) => ({ ...s, observation: rt8WithLast(s.observation, t ? steps[t - 1].observation : null) }));

/** The scripted expert (skill 1) on the same seeds, as colEvalScenario measures it. */
export function rt8Expert(sc, seeds = RT8_HELD_OUT) {
  let success = 0, clean = 0, steps = 0;
  for (const s of seeds) { const r = rbRollout(rbEnv(sc, { seed: s }), { seed: s, skill: 1 }); if (r.summary.passed) success += 1; if (r.summary.violationCount === 0) clean += 1; steps += r.summary.steps; }
  const n = seeds.length || 1;
  return { n: seeds.length, success: rt8R3(success / n), clean: rt8R3(clean / n), meanSteps: rt8R3(steps / n) };
}

/**
 * DAgger-style rounds (ROBOTRAIN-6's rt6Dagger, the same training seeds and labels) with two changes: AMR observations carry
 * the episode's last moves (demonstrations, labelled states and rollouts alike), and the held-out seeds are an argument
 * (this round's 7061–7120 by default). `score: false` runs the rounds without touching any held-out seed (for a ceiling).
 */
export function rt8Dagger(sc, { rounds = 5, rollouts = 20, demos = 40, seed = 1, seeds = RT8_HELD_OUT, maxPoints = 1000000, featureSet = null, score = true, aliasingSets = null } = {}) {
  const aug = colBase(sc) === "rb-amr-fleet-routing";
  const eps = colSyntheticDemos(sc, { n: demos, seed });
  const { demos: ds0 } = colDemosFromEpisodes(eps, sc);
  const ds = aug ? ds0.map((d) => ({ ...d, steps: rt8AugmentSteps(d.steps) })) : ds0;
  const agg = [], out = [];
  let model = colTrain(sc, ds, { seed, onlySuccessful: true, maxPoints, featureSet });
  const scoreRound = (round) => out.push({ round, labelledStates: agg.length, rows: model.rows.length, ...(score ? colEvalPolicy(sc, () => rt8Stateful(model), { seeds }) : {}), modelHash: colHash(model) });
  scoreRound(0);
  for (let r = 1; r <= rounds; r++) {
    for (let k = 0; k < rollouts; k++) {
      const s = RT6_DAGGER_SEED0 + r * 100 + k;
      const env = rbEnv(sc, { seed: s }), R = rng(s * 2654435761 + 1), pol = rt8Stateful(model);
      let obs = env.reset(s), prev = null;
      for (let i = 0; i <= env.scenario.maxSteps; i++) {
        agg.push({ observation: aug ? rt8WithLast(obs, prev) : obs, action: env.expert(obs, R, 1) });
        const st = env.step(pol(obs));
        prev = obs; obs = st.observation;
        if (st.done) break;
      }
    }
    model = colTrain(sc, [...ds, { id: "rt8-dagger-labels", source: "synthetic", success: true, clean: true, steps: agg }], { seed, onlySuccessful: true, maxPoints, featureSet });
    scoreRound(r);
  }
  const expert = score ? rt8Expert(sc, seeds) : null, last = out[out.length - 1];
  return { scenario: sc, ...(featureSet ? { featureSet } : {}), rollouts, labels: RT6_DAGGER_LABELS, aliasing: rt6Aliasing(sc, agg, featureSet),
    seeds: `training ${RT6_DAGGER_SEED0 + 100}–${RT6_DAGGER_SEED0 + rounds * 100 + rollouts - 1}; held-out ${score ? rt8Range(seeds) : "none (no held-out seed scored)"}`,
    rounds: out, ...(score ? { expert, gap: rt8R3(expert.success - last.success) } : {}),
    ...(aliasingSets?.length ? { aliasingOnTheseStates: Object.fromEntries(aliasingSets.map((fs) => [fs, rt6Aliasing(sc, agg, fs)])) } : {}) };
}

// ================================================================ item 4: a reactive agent with wait-then-sidestep

/** Declared before any run: sidestep after the same robot has stood on the first productive cell for this many ticks. */
export const RT8_SIDESTEP_K = 3;
export const RT8_REACTIVE = "ROBOTRAIN-7's reactive rule-follower plus wait-then-sidestep on AMR (k = 3): no search, no planner, no learning; it reads only RT7_REACTIVE_FIELDS";

/** The reactive agent with the wait-then-sidestep rule (AMR); every other scenario is ROBOTRAIN-7's agent unchanged.
 * Stateful only in two small maps per robot: which way it stepped aside around the pallet, and who has blocked it how long. */
export function rt8ReactivePolicy(sc0) {
  const sc = colBase(sc0);
  if (sc !== "rb-amr-fleet-routing") return rt7ReactivePolicy(sc0);
  const fields = RT7_REACTIVE_FIELDS[sc];
  const see = (o) => Object.fromEntries(fields.filter((k) => k in o).map((k) => [k, o[k]]));
  const aside = new Map(), stuck = new Map();
  return (o0) => {
    const o = see(o0);
    const ws = o.walkways ?? [{ column: o.walkwayColumn, busy: o.personOnWalkway }];
    const claimed = new Set(o.robots.map((r) => r.at.join(",")));
    const standing = new Map(o.robots.map((r) => [r.at.join(","), r.id]));
    const moves = o.robots.map((r) => {
      if (r.delivered) return "wait";
      const [x, y] = r.at, [gx, gy] = r.goal;
      const pallet = (a, b) => !!o.blocked && o.blocked[0] === a && o.blocked[1] === b;
      const free = (a, b) => a >= 0 && b >= 0 && a < o.width && b < o.height && !RT8_SHELF(a, b) && !pallet(a, b) && !claimed.has(`${a},${b}`);
      const safe = (d) => { const nx = x + RT8_DIRS[d][0], ny = y + RT8_DIRS[d][1]; return free(nx, ny) && !ws.some((w) => w.busy && nx === w.column && x !== w.column); };
      const h = gx > x ? "E" : gx < x ? "W" : null, v = gy > y ? "S" : gy < y ? "N" : null;
      if (aside.has(r.id) && (!o.blocked || x > o.blocked[0])) aside.delete(r.id);
      // ROBOTRAIN-7's rules; the one change (ROBOTRAIN-8, amended on training seeds) is that the pallet rule looks two cells
      // ahead in the row, so a robot changes rows before it enters the dead end between the shelves and the pallet.
      const order = Math.abs(gx - x) > Math.abs(gy - y) ? [h, v] : [v, h];
      let pick = null;
      if (aside.has(r.id)) pick = h && safe(h) ? h : safe(aside.get(r.id)) ? aside.get(r.id) : null;
      else {
        const palletAhead = !!h && (pallet(x + RT8_DIRS[h][0], y) || pallet(x + 2 * RT8_DIRS[h][0], y));
        pick = palletAhead ? null : order.find((d) => d && safe(d)) ?? null;
        if (!pick && palletAhead) { const side = ["N", "S"].find((d) => safe(d)); if (side) { aside.set(r.id, side); pick = side; } }
      }
      // ROBOTRAIN-8: wait-then-sidestep. Count the ticks the same robot stands on the first productive open cell (inside, no
      // shelf, no pallet); at k, a robot later in the move order than that robot (or blocked by a parked one) steps to a free,
      // safe cell at right angles (toward the goal's row or column first), then counts again from zero.
      if (pick) stuck.delete(r.id);
      else {
        const openFloor = (d) => { const nx = x + RT8_DIRS[d][0], ny = y + RT8_DIRS[d][1]; return nx >= 0 && ny >= 0 && nx < o.width && ny < o.height && !RT8_SHELF(nx, ny) && !pallet(nx, ny); };
        const first = order.find((d) => d && openFloor(d)) ?? null;
        const by = first ? standing.get(`${x + RT8_DIRS[first][0]},${y + RT8_DIRS[first][1]}`) : undefined;
        const was = stuck.get(r.id);
        const n = by === undefined || by === r.id ? 0 : was?.by === by ? was.n + 1 : 1;
        const blocker = o.robots.find((q) => q.id === by), yields = !!blocker && (blocker.delivered || o.robots.indexOf(blocker) < o.robots.indexOf(r));
        if (n >= RT8_SIDESTEP_K && yields) {
          const across = first === "E" || first === "W" ? [v, "N", "S"] : [h, "E", "W"];
          const side = across.find((d) => d && safe(d)) ?? null;
          if (side) { pick = side; stuck.delete(r.id); } else stuck.set(r.id, { by, n });
        } else if (n) stuck.set(r.id, { by, n });
        else stuck.delete(r.id);
      }
      if (!pick) return "wait";
      claimed.delete(`${x},${y}`); claimed.add(`${x + RT8_DIRS[pick][0]},${y + RT8_DIRS[pick][1]}`);
      return pick;
    });
    return { type: "route", moves };
  };
}
// ================================================================ end of the reactive agent
