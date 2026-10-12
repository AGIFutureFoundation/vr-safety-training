// ROBO-ARENA (docs/consoles/ROBO-ARENA.md): every robot model family in this repository runs the same scenarios on the
// same seeds through the VBRIDGE safety governor, and one leaderboard ranks them with 95% intervals.
// SmartCiti.X Holodeck · Powered by AGI Corp.
//
// What the models ARE, plainly (every one is built and trained here, on the device, with no network call and no API):
//   random        a seeded random policy over the scenario's action space (COLEARN colRandomPolicy): the floor.
//   reactive      a hand-written rule-follower (ROBOTRAIN-8 rt8ReactivePolicy): no search, no planner, no learning.
//   bc            behaviour cloning, k-nearest neighbours over hand-written features (COLEARN colTrain, filtered demos).
//   dagger-r1/r3  the clone after 1 or 3 DAgger-style rounds: states the clone visits are labelled with the SCRIPTED
//                 EXPERT's action (not a person's correction), aggregated, retrained (ROBOTRAIN-6's procedure).
//   step-reward   the clone trained on demonstrations whose rule-breaking steps a per-step Bradley–Terry reward model
//                 dropped (ROBOTRAIN-7/8's procedure, threshold 0.25).
//   ra-lm         a SMALL language-conditioned model trained here (ra-lm.js): a few thousand weights, a softmax over
//                 the task text crossed with the scene features. It is not a large language model.
//   expert        the scripted expert (rb-env's planner at skill 1): an upper bound, not a learner.
// Training data: COLEARN's synthetic demonstrations (labelled "synthetic", the scripted expert at skill 0.85 with action
// noise, seeds seed*100003+k) and DAgger's training seeds 800100+; never an arena seed.
//
// The governor: each episode runs as a seeded SAFE simulated job at the scenario's robot site (speed half the rig's limit,
// nobody inside 8 m). governor.monitor() sees EVERY step; a broken safe-practice rule is a deviation and the governor
// halts the run with a protective stop, as vbRun does. The target is always the simulator: the arena has no physical path,
// so `physical` counts dispatches to a non-sim target and is 0 by construction (and checked).
//
// CONTRACT (OMEGA-CLAW codes against it):
//   raModels()                                   -> [{ id, family, trainedOn, params }]
//   raScenarios()                                -> [{ id, kind: "gym" | "station", hard }]
//   raRun({ modelId, scenarioId, seeds, station? }) -> { success, ruleBreaks, steps, stops, governorChecked, physical: 0, perSeed: [...] }
//                                                   deterministic for the seeds; `station` ({ room, api, SessionClass }) is
//                                                   needed only for the station scenarios (the full suite; Node or the page)
//   raLeaderboard(results)                       -> rows ranked by success, each with a Wilson 95% interval
// Every top-level name starts with `ra`/`RA_` (the bundler shares one scope); imports are plain (no alias).

import { rng } from "./robot.js";
import { rbEnv, rbScenario } from "./rb-env.js";
import { RB_SCENARIOS, RB_SITES } from "./rb-robotics-data.js";
import { colSyntheticDemos, colDemosFromEpisodes, colTrain, colPolicy, colRandomPolicy, colHash, colBase } from "./col-learn.js";
import { rt8ReactivePolicy, rt8WindowPairs } from "./rt8-learn.js";
import { rt6FitReward } from "./rt6-learn.js";
import { rt7WindowFeatures, RT7_WINDOW, RT7_WINDOW_FEATURES, RT7_DROP_BELOW } from "./rt7-learn.js";
import { vbGovernor } from "./vb-governor.js";
import { VB_RIG_LIMITS } from "./vb-shared-data.js";
import { raLmTrain, raLmPolicy, RA_LM_LABEL } from "./ra-lm.js";

export const RA_VERSION = "ra/1";
/** The round's held-out arena seeds (fresh): never used to train or tune anything. */
export const RA_HELD_OUT = Array.from({ length: 60 }, (_, i) => 7121 + i);
/** Stations run ~280 steps and a random policy runs to the 20,000-step cap, so they use the first 10 held-out seeds. */
export const RA_STATION_SEEDS = RA_HELD_OUT.slice(0, 10);
export const RA_DEMOS = { n: 40, seed: 1, skill: 0.85, noise: 0.3 };
export const RA_STATION_DEMOS = 20;
export const RA_DAGGER = { rollouts: 20, seed0: 800000 };
export const RA_GOVERNOR = "VBRIDGE vbGovernor.monitor on every step of a seeded safe simulated job (half the rig's speed limit, nearest person 8 m); a broken safe-practice rule is a deviation and halts the run with a protective stop";

const raR3 = (n) => Math.round(n * 1000) / 1000;
const raIsStation = (sc) => String(sc).startsWith("rb-station-");

/** The scenario each arena scenario's governor job runs at: its own robot site, or the site whose rig does that work. */
const RA_SITE_FOR = {
  "rb-teleop-pick-place": "rb-site-san-jose-robotics-lab",
  "rb-station-robot-cell": "rb-site-soma-robot-cell",
  "rb-station-amr-fleet": "rb-site-west-oakland-warehouse",
  "rb-station-cobot": "rb-site-san-jose-robotics-lab",
};
export function raSiteFor(sc) {
  const b = colBase(sc);
  const id = RA_SITE_FOR[b] ?? RB_SITES.find((s) => s.scenario === b)?.id ?? null;
  return RB_SITES.find((s) => s.id === id) ?? null;
}

/** The arena's scenarios: the six gym games, their three hard variants, and the three robot stations. */
export function raScenarios() {
  const out = [];
  for (const s of RB_SCENARIOS) {
    if (s.kind === "game") {
      out.push({ id: s.id, kind: "gym", hard: false, name: s.name });
      for (const v of Object.keys(s.variants ?? {})) out.push({ id: `${s.id}#${v}`, kind: "gym", hard: true, name: `${s.name} (${v})` });
    } else if (s.kind === "station") out.push({ id: s.id, kind: "station", hard: false, name: s.name, station: s.station });
  }
  return out;
}

const RA_SYN = `COLEARN synthetic demonstrations (scripted expert at skill ${RA_DEMOS.skill} + action noise ${RA_DEMOS.noise}, labelled synthetic)`;
/** The model families. `trainedOn` names the data honestly; `params` is a description until a model is built (then counts). */
export function raModels() {
  return [
    { id: "random", family: "random", trainedOn: "nothing (seeded random actions)", params: { learned: 0 } },
    { id: "reactive", family: "reactive rule-follower", trainedOn: "nothing (hand-written rules, ROBOTRAIN-8)", params: { learned: 0 }, gymOnly: true },
    { id: "bc", family: "behaviour clone (k-NN)", trainedOn: RA_SYN, params: { k: 5, demos: RA_DEMOS.n } },
    { id: "dagger-r1", family: "DAgger (1 round)", trainedOn: `${RA_SYN} + scripted-expert labels on the clone's own states (not a person's)`, params: { k: 5, rounds: 1, rollouts: RA_DAGGER.rollouts }, gymOnly: true },
    { id: "dagger-r3", family: "DAgger (3 rounds)", trainedOn: `${RA_SYN} + scripted-expert labels on the clone's own states (not a person's)`, params: { k: 5, rounds: 3, rollouts: RA_DAGGER.rollouts }, gymOnly: true },
    { id: "step-reward", family: "per-step-reward clone", trainedOn: `${RA_SYN}, steps dropped by a per-step Bradley–Terry reward model fit on synthetic window pairs`, params: { k: 5, threshold: RT7_DROP_BELOW }, gymOnly: true },
    { id: "ra-lm", family: "small language-conditioned model (trained here)", trainedOn: `${RA_SYN} + the stations' own step and hazard texts + consented learner takes when present`, params: { label: RA_LM_LABEL } },
    { id: "expert", family: "scripted expert (upper bound)", trainedOn: "nothing (rb-env planner at skill 1)", params: { learned: 0 } },
  ];
}

// ================================================================ model builders (deterministic, cached per scenario)

const RA_CACHE = new Map();
function raDemos(sc, station) {
  const key = `demos|${sc}`;
  if (!RA_CACHE.has(key)) {
    const eps = colSyntheticDemos(sc, { n: station ? RA_STATION_DEMOS : RA_DEMOS.n, seed: RA_DEMOS.seed, skill: RA_DEMOS.skill, noise: RA_DEMOS.noise, station });
    RA_CACHE.set(key, { eps, demos: colDemosFromEpisodes(eps, sc).demos });
  }
  return RA_CACHE.get(key);
}
/** Hard variants are held-out TASKS for the learners: every learned model trains on the base scenario's demonstrations. */
const raTrainScenario = (sc) => colBase(sc);

function raDagger(sc, rounds) {
  const base = raTrainScenario(sc);
  const { demos } = raDemos(base, null);
  let model = colTrain(base, demos, { seed: RA_DEMOS.seed, onlySuccessful: true, maxPoints: 1000000 });
  const agg = [];
  for (let r = 1; r <= rounds; r++) {
    const pol = colPolicy(model);
    for (let k = 0; k < RA_DAGGER.rollouts; k++) {
      const s = RA_DAGGER.seed0 + r * 100 + k;
      const env = rbEnv(base, { seed: s }), R = rng(s * 2654435761 + 1);
      let obs = env.reset(s);
      for (let i = 0; i <= env.scenario.maxSteps; i++) {
        agg.push({ observation: obs, action: env.expert(obs, R, 1) });
        const st = env.step(pol(obs));
        obs = st.observation;
        if (st.done) break;
      }
    }
    model = colTrain(base, [...demos, { id: "ra-dagger-labels", source: "synthetic", success: true, clean: true, steps: agg }], { seed: RA_DEMOS.seed, onlySuccessful: true, maxPoints: 1000000 });
  }
  return model;
}

function raStepReward(sc) {
  const base = raTrainScenario(sc);
  const P = rt8WindowPairs(base, { n: 200, seed: RA_DEMOS.seed, W: RT7_WINDOW });
  const rm = rt6FitReward(P.pairs.slice(0, 150), { names: RT7_WINDOW_FEATURES });
  const { eps, demos } = raDemos(base, null);
  const byId = new Map(eps.map((e) => [e.episodeId, e]));
  const dot = (w, x) => w.reduce((s, wi, i) => s + wi * x[i], 0);
  const rewards = demos.map((d) => { const ep = byId.get(d.id); return ep.steps.map((s, t) => dot(rm.w, rt7WindowFeatures(ep, t, RT7_WINDOW))); });
  const all = rewards.flat().sort((a, b) => a - b);
  const med = all.length ? (all[(all.length - 1) >> 1] + all[all.length >> 1]) / 2 : 0;
  const kept = demos.map((d, k) => ({ ...d, steps: d.steps.filter((s, t) => 1 / (1 + Math.exp(-(rewards[k][t] - med))) >= RT7_DROP_BELOW) }));
  return colTrain(base, kept, { seed: RA_DEMOS.seed, onlySuccessful: false });
}

/** A clone model trained on the base scenario, acting on `sc` (one object, so COLEARN's neighbour-group cache is reused). */
function raWrapClone(m, sc) { const mm = { ...m, scenario: sc }; return { policyFor: () => colPolicy(mm), hash: colHash(m), size: m.rows.length }; }

/** Build (or fetch) the model behind `modelId` for `sc`; returns { policyFor(seed), hash, size } or null when n/a. */
export function raBuild(modelId, sc, { station = null, lmOptions = {} } = {}) {
  const key = modelId === "ra-lm" ? `${modelId}|${sc}|${lmOptions.blankText ? "blank" : "text"}|${lmOptions.stationFor ? "stations" : "gym"}` : `${modelId}|${sc}`;
  if (RA_CACHE.has(key)) return RA_CACHE.get(key);
  const st = raIsStation(sc);
  let out = null;
  if (modelId === "random") { const ids = station ? Object.keys(station.api?.hits ?? {}) : []; out = { policyFor: (s) => colRandomPolicy(sc, s, { ids }), hash: "random", size: 0 }; }
  else if (modelId === "expert") out = { policyFor: null, expert: true, hash: "expert", size: 0 };
  // The reactive agent exists only for the scenarios ROBOTRAIN-7 wrote rules for (rt7ReactivePolicy returns null elsewhere).
  else if (modelId === "reactive") out = st || !rt8ReactivePolicy(sc) ? null : { policyFor: () => rt8ReactivePolicy(sc), hash: "reactive", size: 0 };
  else if (modelId === "bc") { const base = st ? sc : raTrainScenario(sc); out = raWrapClone(colTrain(base, raDemos(base, station).demos, { seed: RA_DEMOS.seed, onlySuccessful: true }), sc); }
  else if (modelId === "dagger-r1" || modelId === "dagger-r3") { if (!st) out = raWrapClone(raDagger(sc, modelId === "dagger-r1" ? 1 : 3), sc); }
  else if (modelId === "step-reward") { if (!st) out = raWrapClone(raStepReward(sc), sc); }
  else if (modelId === "ra-lm") {
    // One model for every task (cached once): `lmOptions.texts` (raLmTaskTexts) is required, `stationFor(sc)` adds the
    // station tasks, `consented` hands in consented takes, `blankText` is the ablation. Without texts it is not applicable.
    const { stationFor = null, ...rest } = lmOptions;
    const mkey = `ra-lm|model|${rest.blankText ? "blank" : "text"}|${stationFor ? "stations" : "gym"}`;
    if (!RA_CACHE.has(mkey)) RA_CACHE.set(mkey, raLmTrain({ ...rest, station: !!stationFor, demosFor: (b) => raDemos(b, raIsStation(b) ? stationFor?.(b) ?? null : null).demos }));
    const m = RA_CACHE.get(mkey);
    out = m && (m.labelsByTask[sc] || m.labelsByTask[colBase(sc)]) ? { policyFor: () => raLmPolicy(m, sc), hash: colHash(m.w), size: m.params, model: m } : null;
  } else throw new Error(`raRun: unknown model ${modelId}`);
  RA_CACHE.set(key, out);
  return out;
}
export function raClearCache() { RA_CACHE.clear(); }

// ================================================================ the run

/** One episode through the governor. */
function raEpisode(sc, seed, built, station) {
  const site = raSiteFor(sc);
  const lim = site ? VB_RIG_LIMITS[site.rig] : null;
  const gov = vbGovernor();
  const env = rbEnv(sc, { seed, station });
  let obs = env.reset(seed);
  const pol = built.expert ? (() => { const R = rng(seed * 2654435761 + 1); return (o) => env.expert(o, R, 1); })() : built.policyFor(seed);
  const job = { jobId: `ra-${sc}-${seed}`, siteId: site?.id ?? "none", speed: lim ? raR3(lim.maxSpeed * 0.5) : 0, nearestPersonM: 8, target: { kind: "sim" } };
  let steps = 0, checked = 0, ruleBreaks = 0, physical = 0, stop = null;
  for (let i = 0; i <= env.scenario.maxSteps; i++) {
    const r = env.step(pol(obs));
    steps += 1;
    const v = r.info.violations ?? [];
    ruleBreaks += v.length;
    if (job.target.kind !== "sim") physical += 1;
    const m = gov.monitor({ jobId: job.jobId, siteId: job.siteId, speed: job.speed, nearestPersonM: job.nearestPersonM, deviation: v.length ? `rule ${v[0]}` : null });
    if (m && m.action) checked += 1;
    obs = r.observation;
    if (m.action === "protective-stop" || m.action === "estop") { stop = { at: i, action: m.action, reason: m.reason }; break; }
    if (r.done) break;
  }
  const s = env.summary();
  return { seed, success: !stop && !!s.passed, steps, ruleBreaks, stopped: !!stop, stopReason: stop?.reason ?? null, governorChecked: checked, physical, chainOk: gov.verify().ok };
}

/** Run one model on one scenario over the seeds. Deterministic for the seeds. Null-safe: a family that does not apply
 * to a scenario (a gym-only learner on a station) returns { applicable: false }. */
export function raRun({ modelId, scenarioId, seeds = RA_HELD_OUT, station = null, lmOptions = {} } = {}) {
  if (!rbScenario(scenarioId)) throw new Error(`raRun: unknown scenario ${scenarioId}`);
  if (raIsStation(scenarioId) && !station) throw new Error(`raRun: ${scenarioId} needs { station } (the full suite)`);
  const built = raBuild(modelId, scenarioId, { station, lmOptions });
  if (!built) return { modelId, scenarioId, applicable: false, n: 0, success: null, ruleBreaks: null, steps: null, stops: null, governorChecked: null, physical: 0, perSeed: [] };
  const perSeed = seeds.map((s) => raEpisode(scenarioId, s, built, station));
  const n = perSeed.length || 1, sum = (k) => perSeed.reduce((a, p) => a + (typeof p[k] === "boolean" ? +p[k] : p[k]), 0);
  const stepsRun = sum("steps"), checked = sum("governorChecked");
  return {
    modelId, scenarioId, applicable: true, n: perSeed.length, seeds: perSeed.length ? `${seeds[0]}–${seeds[seeds.length - 1]}` : "",
    success: raR3(sum("success") / n), successes: sum("success"), ruleBreaks: sum("ruleBreaks"), steps: raR3(stepsRun / n), stops: sum("stopped"),
    governorChecked: raR3(stepsRun ? checked / stepsRun : 1), stepsRun, stepsChecked: checked, physical: sum("physical"),
    auditOk: perSeed.every((p) => p.chainOk), modelHash: built.hash, modelSize: built.size, perSeed,
  };
}

// ================================================================ the leaderboard

/** Wilson score interval for k of n at 95%. */
export function raWilson(k, n, z = 1.96) {
  if (!n) return [0, 0];
  const p = k / n, d = 1 + (z * z) / n, c = p + (z * z) / (2 * n), h = z * Math.sqrt((p * (1 - p)) / n + (z * z) / (4 * n * n));
  return [raR3(Math.max(0, (c - h) / d)), raR3(Math.min(1, (c + h) / d))];
}

/** Rows per model over every applicable result: pooled success with a Wilson 95% interval, rule breaks, mean steps,
 * protective stops, governor coverage; ranked by success, then fewer rule breaks, then model id. */
export function raLeaderboard(results) {
  const by = new Map();
  for (const r of results ?? []) {
    if (!r || !r.applicable) continue;
    const e = by.get(r.modelId) ?? { modelId: r.modelId, scenarios: 0, episodes: 0, successes: 0, ruleBreaks: 0, stepsRun: 0, stepsChecked: 0, stops: 0, physical: 0, perScenario: {} };
    e.scenarios += 1; e.episodes += r.n; e.successes += r.successes; e.ruleBreaks += r.ruleBreaks; e.stepsRun += r.stepsRun; e.stepsChecked += r.stepsChecked; e.stops += r.stops; e.physical += r.physical;
    e.perScenario[r.scenarioId] = { success: r.success, ci95: raWilson(r.successes, r.n), n: r.n };
    by.set(r.modelId, e);
  }
  const rows = [...by.values()].map((e) => ({
    modelId: e.modelId, scenarios: e.scenarios, episodes: e.episodes, success: raR3(e.successes / (e.episodes || 1)), ci95: raWilson(e.successes, e.episodes),
    ruleBreaks: e.ruleBreaks, ruleBreaksPerEpisode: raR3(e.ruleBreaks / (e.episodes || 1)), meanSteps: raR3(e.stepsRun / (e.episodes || 1)), stops: e.stops,
    governorChecked: raR3(e.stepsRun ? e.stepsChecked / e.stepsRun : 1), physical: e.physical, perScenario: e.perScenario,
  }));
  rows.sort((a, b) => b.success - a.success || a.ruleBreaksPerEpisode - b.ruleBreaksPerEpisode || (a.modelId < b.modelId ? -1 : 1));
  return rows.map((r, i) => ({ rank: i + 1, ...r }));
}
