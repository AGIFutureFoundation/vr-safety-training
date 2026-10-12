#!/usr/bin/env node
/**
 * STRANDS (docs/strands-robots.md): export this repository's trained arena models to plain JSON weights, so the Python
 * adapters in robotics/strands/policies.py can run them through the strands-robots `Policy` interface.
 *
 * Exported (every one built and trained here by ra-arena.js's own builders, deterministic, no network):
 *   bc, dagger-r1, dagger-r3   k-nearest-neighbour behaviour clones: rows { x, label, p, w? }, k, feature weights.
 *   ra-lm                      the small language-conditioned model (a masked softmax over task text × scene features,
 *                              not a large language model): weights w, labels, per-task masks, the task-text vectors and
 *                              the nearest-moment parameter table. The gym-only build (no station suite loaded).
 * The scripted expert and the random floor carry no weights (the expert reads the simulator's state; the random
 * policy is seeded in Python).
 *
 * Scenarios: the four the simulated robot types map to (robotics/strands/sim_robot.py): teleop pick-and-place (the
 * desktop arm), cobot zone set-up, AMR fleet routing and the port gantry. Hard variants reuse their base task's model.
 *
 * STRANDS-2 adds, with the headless station suite loaded as tools/arena_eval.mjs raStations() loads it:
 *   bc--rb-station-*.json.gz   the clone for each of the three robot stations (trained on RA_STATION_DEMOS synthetic
 *                              station episodes, hash-equal to raBuild's)
 *   ra-lm@stations.json.gz     the ra-lm build the arena publishes (task texts with the stations' step and hazard texts,
 *                              trained on the six gym tasks and the three station tasks), beside the gym-only ra-lm.json.gz
 *   ra-lm-h@stations.json.gz   ra-lm-h (ARENA-2's declared hidden layer), the same published build
 * Each ra-lm file says which build it is (`build`). A station's instruction vector changes with the drill step (and,
 * for ra-lm-h, a pending interruption), so the files carry `tCombos`: the normalised vector for each (step, interrupt)
 * pair, computed here with raLmT's own arithmetic, so Python reads them instead of re-normalising.
 *
 *     node tools/ra_export_weights.mjs           # write robotics/strands/weights/*.json.gz
 *     node tools/ra_export_weights.mjs --check   # rebuild in memory and compare with the files on disk
 */
import { writeFileSync, readFileSync, mkdirSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { gzipSync, gunzipSync } from "node:zlib";
import { raBuild, raModels, RA_DEMOS, RA_STATION_DEMOS, RA_DAGGER, RA_VERSION } from "../WebXR/shared/ra-arena.js";
import { raLmTaskTexts, RA_LM_VERSION, RA_LM_H_VERSION, RA_LM_STATION_TASKS } from "../WebXR/shared/ra-lm.js";
import { colF, colHash, colTrain, colPolicy, colSyntheticDemos, colDemosFromEpisodes } from "../WebXR/shared/col-learn.js";
import { rbEnv } from "../WebXR/shared/rb-env.js";
import { rng } from "../WebXR/shared/robot.js";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
export const ST_WEIGHTS_DIR = join(ROOT, "robotics", "strands", "weights");
export const ST_EXPORT_VERSION = "st-weights/1";
export const ST_SCENARIOS = ["rb-teleop-pick-place", "rb-cobot-zone-setup", "rb-amr-fleet-routing", "rb-port-gantry"];
export const ST_VARIANTS = ["rb-amr-fleet-routing#hard", "rb-port-gantry#hard"];
export const ST_KNN = ["bc", "dagger-r1", "dagger-r3"];
export const ST_STATIONS = RA_LM_STATION_TASKS;

const trainedOn = (id) => raModels().find((m) => m.id === id)?.trainedOn ?? "";

// raBuild keeps a clone's model behind its policy (ra-arena.js is ARENA-2's file, read only here), so the clones are
// rebuilt with the same COLEARN calls and the same parameters, and each must hash equal to raBuild's own model hash.
const ST_CACHE = new Map();
function stDemos(sc, station = null) {
  if (!ST_CACHE.has(sc)) ST_CACHE.set(sc, colDemosFromEpisodes(colSyntheticDemos(sc, { n: station ? RA_STATION_DEMOS : RA_DEMOS.n, seed: RA_DEMOS.seed, skill: RA_DEMOS.skill, noise: RA_DEMOS.noise, station }), sc).demos);
  return ST_CACHE.get(sc);
}
function stDagger(sc, rounds) {
  const demos = stDemos(sc);
  let model = colTrain(sc, demos, { seed: RA_DEMOS.seed, onlySuccessful: true, maxPoints: 1000000 });
  const agg = [];
  for (let r = 1; r <= rounds; r++) {
    const pol = colPolicy(model);
    for (let k = 0; k < RA_DAGGER.rollouts; k++) {
      const s = RA_DAGGER.seed0 + r * 100 + k;
      const env = rbEnv(sc, { seed: s }), R = rng(s * 2654435761 + 1);
      let obs = env.reset(s);
      for (let i = 0; i <= env.scenario.maxSteps; i++) {
        agg.push({ observation: obs, action: env.expert(obs, R, 1) });
        const st = env.step(pol(obs));
        obs = st.observation;
        if (st.done) break;
      }
    }
    model = colTrain(sc, [...demos, { id: "ra-dagger-labels", source: "synthetic", success: true, clean: true, steps: agg }], { seed: RA_DEMOS.seed, onlySuccessful: true, maxPoints: 1000000 });
  }
  return model;
}
function stKnn(id, sc, station = null) {
  const m = id === "bc" ? colTrain(sc, stDemos(sc, station), { seed: RA_DEMOS.seed, onlySuccessful: true }) : stDagger(sc, id === "dagger-r1" ? 1 : 3);
  const want = raBuild(id, sc, { station })?.hash;
  if (colHash(m) !== want) throw new Error(`ra_export_weights: ${id} on ${sc} rebuilt with hash ${colHash(m)}, raBuild has ${want}`);
  return m;
}

/** raLmT's arithmetic (ra-lm.js), for every (step, interrupt) pair of a station task: base + step (+ interrupt), L2-normalised. */
function stTCombos(lm) {
  const out = {};
  for (const sc of ST_STATIONS) {
    const base = lm._tv.task[sc], steps = lm._tv.step?.[sc] ?? {}, ints = lm._tv.int?.[sc] ?? {};
    if (!base) continue;
    const m = {};
    for (const sk of ["", ...Object.keys(steps)]) for (const ik of ["", ...Object.keys(ints)]) {
      if (!sk && !ik) continue;
      const stp = sk ? steps[sk] : null, itx = ik ? ints[ik] : null;
      const v = base.map((x, i) => x + (stp ? stp[i] : 0) + (itx ? itx[i] : 0)); const n = Math.hypot(...v) || 1;
      m[`${sk}|${ik}`] = v.map((x) => x / n);
    }
    out[sc] = m;
  }
  return out;
}

/** The arena's published build of ra-lm or ra-lm-h (texts with stations, station tasks trained), as one JSON file. */
function stLmStations(modelId, envs, texts) {
  const stationFor = (sc) => envs[sc] ?? null;
  const lm = raBuild(modelId, ST_STATIONS[0], { station: envs[ST_STATIONS[0]], lmOptions: { texts, stationFor } })?.model;
  if (!lm) return null;
  const all = [...ST_SCENARIOS, ...ST_VARIANTS, ...ST_STATIONS], own = [...ST_SCENARIOS, ...ST_STATIONS];
  const tv = {};
  for (const sc of all) tv[sc] = lm._tv.task[sc] ?? lm._tv.task[sc.split("#")[0]];
  const fw = Object.fromEntries(own.map((sc) => { const F = colF(sc); return [sc, F.weights ?? F.names.map(() => 1)]; }));
  return {
    v: ST_EXPORT_VERSION, arena: RA_VERSION, model: modelId, lmVersion: modelId === "ra-lm-h" ? RA_LM_H_VERSION : RA_LM_VERSION, kind: lm.kind, trainedOn: trainedOn(modelId), synthetic: true,
    build: "stations (the arena's published build: task texts with the three stations' step and hazard texts; trained on the six gym tasks and the three station tasks, as tools/arena_eval.mjs runs it)",
    T: lm.T, D: lm.D, H: lm.H ?? 0, labels: lm.labels, labelsByTask: Object.fromEntries(own.map((sc) => [sc, lm.labelsByTask[sc]])),
    w: lm.w, ...(lm.H ? { V: lm.V } : {}), pReg: Object.fromEntries(own.map((sc) => [sc, lm.pReg[sc] ?? {}])), taskVectors: tv, tCombos: stTCombos(lm), featureWeights: fw, paramK: 5,
    params: lm.params, hash: colHash(lm.w), generator: "tools/ra_export_weights.mjs",
  };
}

export function stExport({ envs = null, texts: stTexts = null } = {}) {
  const files = {};
  for (const id of ST_KNN) {
    for (const sc of ST_SCENARIOS) {
      const m = stKnn(id, sc);
      const F = colF(sc, m.featureSet ?? null);
      files[`${id}--${sc}.json.gz`] = {
        v: ST_EXPORT_VERSION, arena: RA_VERSION, model: id, kind: m.kind, scenario: sc, trainedOn: trainedOn(id), synthetic: true,
        demos: { n: RA_DEMOS.n, seed: RA_DEMOS.seed, skill: RA_DEMOS.skill, noise: RA_DEMOS.noise },
        k: m.k, features: F.names, weights: m.weights, rows: m.rows, hash: colHash(m), hashEqualsArena: true, generator: "tools/ra_export_weights.mjs",
      };
    }
  }
  const texts = raLmTaskTexts(() => null);
  const lm = raBuild("ra-lm", ST_SCENARIOS[0], { lmOptions: { texts } })?.model;
  if (lm) {
    const tv = {};
    for (const sc of [...ST_SCENARIOS, ...ST_VARIANTS]) tv[sc] = lm._tv.task[sc] ?? lm._tv.task[sc.split("#")[0]];
    const fw = Object.fromEntries(ST_SCENARIOS.map((sc) => { const F = colF(sc); return [sc, F.weights ?? F.names.map(() => 1)]; }));
    files["ra-lm.json.gz"] = {
      v: ST_EXPORT_VERSION, arena: RA_VERSION, model: "ra-lm", lmVersion: RA_LM_VERSION, kind: lm.kind, trainedOn: trainedOn("ra-lm"), synthetic: true,
      build: "gym-only (no station suite loaded; the arena's published ra-lm rows also trained on the three station tasks)",
      T: lm.T, D: lm.D, labels: lm.labels, labelsByTask: Object.fromEntries(ST_SCENARIOS.map((sc) => [sc, lm.labelsByTask[sc]])),
      w: lm.w, pReg: Object.fromEntries(ST_SCENARIOS.map((sc) => [sc, lm.pReg[sc] ?? {}])), taskVectors: tv, featureWeights: fw, paramK: 5,
      params: lm.params, hash: colHash(lm.w), generator: "tools/ra_export_weights.mjs",
    };
  }
  if (envs && stTexts) {
    for (const sc of ST_STATIONS) {
      const m = stKnn("bc", sc, envs[sc]);
      const F = colF(sc, m.featureSet ?? null);
      files[`bc--${sc}.json.gz`] = {
        v: ST_EXPORT_VERSION, arena: RA_VERSION, model: "bc", kind: m.kind, scenario: sc, trainedOn: trainedOn("bc"), synthetic: true,
        demos: { n: RA_STATION_DEMOS, seed: RA_DEMOS.seed, skill: RA_DEMOS.skill, noise: RA_DEMOS.noise, station: true },
        k: m.k, features: F.names, weights: m.weights, rows: m.rows, hash: colHash(m), hashEqualsArena: true, generator: "tools/ra_export_weights.mjs",
      };
    }
    for (const id of ["ra-lm", "ra-lm-h"]) { const f = stLmStations(id, envs, stTexts); if (f) files[`${id}@stations.json.gz`] = f; }
  }
  return files;
}

const gz = (o) => gzipSync(Buffer.from(JSON.stringify(o)), { level: 9, mtime: 0 });

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const { raStations, raTexts } = await import("./arena_eval.mjs");
  const files = stExport({ envs: await raStations(), texts: raTexts() });
  const check = process.argv.includes("--check");
  let total = 0, bad = 0;
  if (!check) mkdirSync(ST_WEIGHTS_DIR, { recursive: true });
  for (const [name, obj] of Object.entries(files)) {
    const p = join(ST_WEIGHTS_DIR, name);
    if (check) {
      const same = existsSync(p) && JSON.stringify(JSON.parse(gunzipSync(readFileSync(p)).toString())) === JSON.stringify(obj);
      if (!same) bad += 1;
      console.log(`${same ? "same" : "DIFFERS"} ${name}`);
    } else {
      const buf = gz(obj); writeFileSync(p, buf); total += buf.length;
      console.log(`${name} ${buf.length} B${obj.rows ? `, ${obj.rows.length} rows` : `, ${obj.params} weights`}`);
    }
  }
  if (check) { console.log(bad ? `${bad} file(s) differ` : "weights match a fresh build"); process.exit(bad ? 1 : 0); }
  console.log(`${Object.keys(files).length} files, ${total} B`);
}
