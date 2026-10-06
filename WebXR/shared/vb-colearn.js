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
// Loop 7 (ROBOTRAIN-3, docs/consoles/ROBOTRAIN-3.md): the last mile. vbColearnLocalSource() reads the learner's OWN consented
// takes through COLEARN's colLocalDemos (nothing unless dxCollecting(): adult, signed in, not K-12, not the demo, opted in) and
// hands them to the provider as `demosFor`; the model is keyed by the takes it saw, so a new take retrains and a revoke (the
// store emptied, the consent gone) drops back to synthetic demonstrations. vbColearnDescribe(model) names the source honestly:
// "your 12 takes" or "synthetic demonstrations".
//
// SEAM:
//   vbColearnModel(sc, { n, seed, skill, demosFor })            -> plain-JSON COLEARN model (cached per key)
//   vbColearnProvider({ n, seed, skill, demosFor })              -> { policyFor(policyId, env, seed), modelFor(sc), describe(sc), models(), id }
//   vbColearnLocalSource({ store, signals })                     -> { refresh(): Promise<{ [sc]: count }>, demosFor(sc), count(sc), tag(sc), clear() }
//   vbColearnDescribe(model)                                      -> "your N takes (...)" | "synthetic demonstrations (scripted stand-in...)"
//   vbProviderCompare({ jobsPerTask, seed, n, skill })           -> { tasks: { [sc]: { scripted, colearn } }, totals, governor: { stepsRun, stepsMonitored, everyStep } }
//
// Every top-level name starts with `vb`/`VB_` (the bundler shares one scope); imports are plain (no `as` alias).

import { colSyntheticDemos, colDemosFromEpisodes, colLocalDemos, colTrain, colPolicy, COL_SCENARIOS } from "./col-learn.js";
import { vbGovernor } from "./vb-governor.js";
import { vbRunJob } from "./vb-bridge.js";
import { RB_SITES } from "./rb-robotics-data.js";
import { VB_RIG_LIMITS } from "./vb-shared-data.js";

export const VB_COLEARN_POLICY_ID = "vb-colearn-bc-knn";
export const VB_COLEARN_SCRIPTED_ID = "vb-scripted-expert";
/** What the panel says the provider is, so no reader mistakes the training data for people. */
export const VB_COLEARN_LABEL = "COLEARN behaviour-cloning policy (k-nearest-neighbour), trained on synthetic demonstrations labelled as a stand-in";

const vbModels = new Map();
export const VB_SOURCE_OWN = "your takes (consented, on this device)";
export const VB_SOURCE_SYNTHETIC = "synthetic human stand-in (colSyntheticDemos)";

/**
 * One COLEARN model per task, trained on clean passes only; cached by (task, n, seed, skill, source). `demosFor(sc)` may return
 * COLEARN demos (from colDemosFromEpisodes) or `{ demos, tag }`, where `tag` names the set so a changed set retrains. Handed-in
 * demos train the model only when at least one clean pass is among them; otherwise the synthetic demonstrations do, and the
 * provenance says so.
 */
export function vbColearnModel(sc, { n = 40, seed = 1, skill = 0.85, demosFor = null } = {}) {
  if (!COL_SCENARIOS.includes(sc)) return null;
  let own = null, tag = "synthetic";
  if (demosFor) { try { const r = demosFor(sc) ?? null; own = Array.isArray(r) ? r : r?.demos ?? null; tag = r?.tag ?? (own?.length ? `handed-in:${own.length}` : "synthetic"); } catch (_) { own = null; } }
  if (!Array.isArray(own) || !own.length) { own = null; tag = "synthetic"; }
  const key = `${sc}|${n}|${seed}|${skill}|${tag}`;
  if (vbModels.has(key)) return vbModels.get(key);
  let model = own ? colTrain(sc, own, { seed, onlySuccessful: true }) : null;
  if (model && model.demos > 0) {
    model.provenance = { source: VB_SOURCE_OWN, own: true, n: own.length, kept: model.demos, skill: null };
  } else {
    const synth = colDemosFromEpisodes(colSyntheticDemos(sc, { n, seed, skill }), sc).demos;
    model = colTrain(sc, synth, { seed, onlySuccessful: true });
    model.provenance = { source: VB_SOURCE_SYNTHETIC, own: false, n: synth.length, kept: model.demos, skill, ownOffered: own ? own.length : 0 };
  }
  vbModels.set(key, model);
  return model;
}

/** What the card says the model was trained on, honestly: the learner's own takes, or the synthetic stand-in. */
export function vbColearnDescribe(model) {
  const p = model?.provenance;
  if (!p) return "synthetic demonstrations (scripted stand-in)";
  if (p.own) return `your ${p.n} take${p.n === 1 ? "" : "s"} (${p.kept} clean pass${p.kept === 1 ? "" : "es"} kept; consented, on this device)`;
  return `synthetic demonstrations (scripted stand-in${p.ownOffered ? `; your ${p.ownOffered} take${p.ownOffered === 1 ? "" : "s"} had no clean pass yet` : ""})`;
}

/**
 * The learner's own consented takes as a `demosFor` source. `refresh()` re-reads the local DX store through colLocalDemos (which
 * returns nothing unless dxCollecting()) for every task COLEARN has features for; `demosFor(sc)` is synchronous for the provider
 * and returns `{ demos, tag }` or null. Revoke empties the store and the consent, so the next refresh clears every task and the
 * provider is back on synthetic demonstrations. Nothing here writes, uploads or fetches anything.
 */
export function vbColearnLocalSource({ store = null, signals = null } = {}) {
  const byTask = new Map();
  const opts = store ? { store, signals } : { signals };
  return {
    async refresh() {
      const counts = {};
      for (const sc of COL_SCENARIOS) {
        let eps = [];
        try { eps = await colLocalDemos(sc, opts); } catch (_) { eps = []; }
        if (!eps.length) { byTask.delete(sc); counts[sc] = 0; continue; }
        const d = colDemosFromEpisodes(eps, sc);
        const ids = eps.map((e) => e.episodeId).sort();
        byTask.set(sc, { demos: d.demos, tag: `own:${ids.length}:${ids.join(",")}`, n: eps.length, refused: d.refused.length });
        counts[sc] = d.demos.length;
      }
      return counts;
    },
    demosFor(sc) { const r = byTask.get(sc); return r ? { demos: r.demos, tag: r.tag } : null; },
    count(sc) { return byTask.get(sc)?.demos.length ?? 0; },
    tag(sc) { return byTask.get(sc)?.tag ?? "synthetic"; },
    clear() { byTask.clear(); },
  };
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
    /** The model the provider would run for a task right now (trains lazily; the teleop pad's ghost replays it). */
    modelFor(sc) { return vbColearnModel(sc, opts); },
    /** The card's provider line for a task: what the policy is and what it was trained on, honestly. */
    describe(sc) { const m = vbColearnModel(sc, opts); return m ? `COLEARN behaviour-cloning policy (k-nearest-neighbour), trained on ${vbColearnDescribe(m)}` : null; },
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
    if (!RB_SITES.some((s) => s.scenario === sc)) continue;
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
