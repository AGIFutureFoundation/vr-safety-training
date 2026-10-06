// VBRIDGE × COLEARN — a COLEARN-trained behaviour-cloning policy as the agent-jobs PROVIDER (console ROBOTRAIN-2,
// docs/consoles/ROBOTRAIN-2.md; the seam VBRIDGE left open in docs/consoles/VBRIDGE.md). SmartCiti.X Holodeck · Powered by AGI Corp.
//
// vb-bridge.js runs a job's TRANSACTION phase through `policyFor(policyId, env, seed)`; without it only the two scripted
// policies run. This module supplies that hook: for the policy id `vb-colearn-bc-knn` (registered as current in
// vb-shared-data.js and in ENTERPRISE-3's table when it is handed in) it trains one COLEARN k-NN behaviour-cloning model per
// task from demonstrations and returns `colPolicy(model)`. Every other policy id returns null, so vb-bridge.js falls back to
// its scripted policies. The governor is untouched: vbRun still calls `governor.monitor` on every step of a COLEARN-driven
// run, the e-stop still wins and a deviation still halts the robot. Simulated robots only.
//
// Demonstrations: by default COLEARN's synthetic demonstrations (the scripted expert at skill 0.85 with action noise,
// written with source "synthetic" and labelled "synthetic human stand-in"). A caller may hand in `demosFor(sc)` to train on
// consented local episodes instead (COLEARN's colLocalDemos, which returns nothing unless the learner is collecting);
// nothing here reads a store, uploads or fetches anything.
//
// SEAM:
//   vbColearnModel(sc, { n, seed, skill, demosFor })            -> plain-JSON COLEARN model (cached per key)
//   vbColearnProvider({ n, seed, skill, demosFor })              -> { policyFor(policyId, env, seed), models(), id }
//   vbProviderCompare({ jobsPerTask, seed, n, skill })           -> { tasks: { [sc]: { scripted, colearn } }, totals, governor: { stepsRun, stepsMonitored, everyStep } }
//
// Every top-level name starts with `vb`/`VB_` (the bundler shares one scope); imports are plain (no `as` alias).

import { colSyntheticDemos, colDemosFromEpisodes, colTrain, colPolicy, COL_SCENARIOS } from "./col-learn.js";
import { vbGovernor } from "./vb-governor.js";
import { vbRunJob } from "./vb-bridge.js";
import { RB_SITES } from "./rb-robotics-data.js";
import { VB_RIG_LIMITS, VB_TASKS } from "./vb-shared-data.js";

export const VB_COLEARN_POLICY_ID = "vb-colearn-bc-knn";
export const VB_COLEARN_SCRIPTED_ID = "vb-scripted-expert";
/** What the panel says the provider is, so no reader mistakes the training data for people. */
export const VB_COLEARN_LABEL = "COLEARN behaviour-cloning policy (k-nearest-neighbour), trained on synthetic demonstrations labelled as a stand-in";

const vbModels = new Map();

/** One COLEARN model per task, trained on clean passes only; cached by (task, n, seed, skill, source). */
export function vbColearnModel(sc, { n = 40, seed = 1, skill = 0.85, demosFor = null } = {}) {
  if (!COL_SCENARIOS.includes(sc)) return null;
  const key = `${sc}|${n}|${seed}|${skill}|${demosFor ? "handed-in" : "synthetic"}`;
  if (vbModels.has(key)) return vbModels.get(key);
  let demos = null;
  if (demosFor) { try { demos = demosFor(sc) ?? null; } catch (_) { demos = null; } }
  if (!Array.isArray(demos) || !demos.length) demos = colDemosFromEpisodes(colSyntheticDemos(sc, { n, seed, skill }), sc).demos;
  const model = colTrain(sc, demos, { seed, onlySuccessful: true });
  model.provenance = { source: demosFor && Array.isArray(demos) ? "handed-in demonstrations" : "synthetic human stand-in (colSyntheticDemos)", n: demos.length, kept: model.demos, skill };
  vbModels.set(key, model);
  return model;
}

/**
 * The provider hook for vb-bridge.js: `policyFor(policyId, env, seed)` returns a COLEARN policy for VB_COLEARN_POLICY_ID
 * on a task COLEARN has features for, and null otherwise (vbRun then runs its scripted policies).
 */
export function vbColearnProvider(opts = {}) {
  return {
    id: VB_COLEARN_POLICY_ID,
    label: VB_COLEARN_LABEL,
    policyFor(policyId, env) {
      if (policyId !== VB_COLEARN_POLICY_ID || !env?.scenario?.id) return null;
      const model = vbColearnModel(env.scenario.id, opts);
      return model ? colPolicy(model) : null;
    },
    models() { return [...vbModels.values()].map((m) => ({ scenario: m.scenario, rows: m.rows.length, kept: m.demos, provenance: m.provenance })); },
  };
}

/** A seeded SAFE job for a task at a site that does it: speed under the rig's limit, nobody inside the warning distance. */
export function vbSafeJobFor(sc, k, policyId, seed = 1) {
  const site = RB_SITES.find((s) => s.scenario === sc);
  if (!site) return null;
  const lim = VB_RIG_LIMITS[site.rig];
  const speed = Math.round(lim.maxSpeed * (0.5 + 0.3 * ((k * 7 + seed) % 5) / 5) * 1000) / 1000;
  return { seed: seed * 1000 + k + 1, client: { id: `client-eval-${(k % 3) + 1}` }, request: { taskType: sc, siteId: site.id, speed, nearestPersonM: 8 + (k % 4), policyId, note: `seeded eval job ${k + 1}` } };
}

/**
 * The eval: the same seeded safe jobs run through the whole lifecycle (governor negotiation, a named supervisor, the
 * governor on every step, the scenario's own evaluator) with the scripted expert and with the COLEARN-trained policy as the
 * provider. Reports COMPLETED counts per task and in total, and that every step of every COLEARN-driven run carried the
 * governor's verdict (`info.governor`: the governor checks every step). Deterministic under `seed`.
 */
export function vbProviderCompare({ jobsPerTask = 10, seed = 1, n = 40, skill = 0.85 } = {}) {
  const provider = vbColearnProvider({ n, seed, skill });
  const tasks = {};
  let stepsMonitored = 0, stepsRun = 0;
  const totals = { scripted: { completed: 0, of: 0 }, colearn: { completed: 0, of: 0 } };
  for (const sc of COL_SCENARIOS) {
    if (!RB_SITES.some((s) => s.scenario === sc) || !VB_TASKS[sc]) continue; // only tasks the governor allowlists (VB_TASKS) run as jobs
    const row = { scripted: { completed: 0, of: 0, halted: 0 }, colearn: { completed: 0, of: 0, halted: 0, trainedOn: null } };
    for (const [who, policyId, policyFor] of [["scripted", VB_COLEARN_SCRIPTED_ID, null], ["colearn", VB_COLEARN_POLICY_ID, provider.policyFor]]) {
      for (let k = 0; k < jobsPerTask; k++) {
        const gov = vbGovernor();
        const job = vbRunJob(vbSafeJobFor(sc, k, policyId, seed), gov, { supervisor: "Supervisor (eval)", policyFor });
        row[who].of += 1;
        if (job.phase === "COMPLETED") row[who].completed += 1;
        if (job.deliverable?.evalCard?.halted) row[who].halted += 1;
        if (who === "colearn") for (const st of job.deliverable?.episode?.steps ?? []) { stepsRun += 1; if (st.info?.governor) stepsMonitored += 1; }
      }
      totals[who].completed += row[who].completed; totals[who].of += row[who].of;
    }
    const m = vbColearnModel(sc, { n, seed, skill });
    row.colearn.trainedOn = m ? { ...m.provenance, rows: m.rows.length } : null;
    tasks[sc] = row;
  }
  return { v: "vb-colearn/1", policy: VB_COLEARN_POLICY_ID, label: VB_COLEARN_LABEL, jobsPerTask, seed, tasks, totals, governor: { stepsRun, stepsMonitored, everyStep: stepsRun > 0 && stepsMonitored === stepsRun }, simulated: true };
}
