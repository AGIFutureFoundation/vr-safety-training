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
 *     node tools/ra_export_weights.mjs           # write robotics/strands/weights/*.json.gz
 *     node tools/ra_export_weights.mjs --check   # rebuild in memory and compare with the files on disk
 */
import { writeFileSync, readFileSync, mkdirSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { gzipSync, gunzipSync } from "node:zlib";
import { raBuild, raModels, RA_DEMOS, RA_DAGGER, RA_VERSION } from "../WebXR/shared/ra-arena.js";
import { raLmTaskTexts, RA_LM_VERSION } from "../WebXR/shared/ra-lm.js";
import { colF, colHash, colTrain, colPolicy, colSyntheticDemos, colDemosFromEpisodes } from "../WebXR/shared/col-learn.js";
import { rbEnv } from "../WebXR/shared/rb-env.js";
import { rng } from "../WebXR/shared/robot.js";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
export const ST_WEIGHTS_DIR = join(ROOT, "robotics", "strands", "weights");
export const ST_EXPORT_VERSION = "st-weights/1";
export const ST_SCENARIOS = ["rb-teleop-pick-place", "rb-cobot-zone-setup", "rb-amr-fleet-routing", "rb-port-gantry"];
export const ST_VARIANTS = ["rb-amr-fleet-routing#hard", "rb-port-gantry#hard"];
export const ST_KNN = ["bc", "dagger-r1", "dagger-r3"];

const trainedOn = (id) => raModels().find((m) => m.id === id)?.trainedOn ?? "";

// raBuild keeps a clone's model behind its policy (ra-arena.js is ARENA-2's file, read only here), so the clones are
// rebuilt with the same COLEARN calls and the same parameters, and each must hash equal to raBuild's own model hash.
const ST_CACHE = new Map();
function stDemos(sc) {
  if (!ST_CACHE.has(sc)) ST_CACHE.set(sc, colDemosFromEpisodes(colSyntheticDemos(sc, { n: RA_DEMOS.n, seed: RA_DEMOS.seed, skill: RA_DEMOS.skill, noise: RA_DEMOS.noise, station: null }), sc).demos);
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
function stKnn(id, sc) {
  const m = id === "bc" ? colTrain(sc, stDemos(sc), { seed: RA_DEMOS.seed, onlySuccessful: true }) : stDagger(sc, id === "dagger-r1" ? 1 : 3);
  const want = raBuild(id, sc)?.hash;
  if (colHash(m) !== want) throw new Error(`ra_export_weights: ${id} on ${sc} rebuilt with hash ${colHash(m)}, raBuild has ${want}`);
  return m;
}

export function stExport() {
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
  return files;
}

const gz = (o) => gzipSync(Buffer.from(JSON.stringify(o)), { level: 9, mtime: 0 });

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const files = stExport();
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
