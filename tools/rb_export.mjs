#!/usr/bin/env node
/**
 * ROBOEXPORT (docs/consoles/ROBOEXPORT.md) — the sim-to-real readiness package for the six robot-gym scenarios,
 * written to exports/robotics/ with an index. Per scenario:
 *
 *   <scenario>/dataset.json       the synthetic demonstration set COLEARN trains on (seeds, counts, hash) — a summary
 *   <scenario>/dataset-card.md    DATAWORKS' datasheet (dxDatasetCard) plus the source, the synthetic label, the seeds,
 *                                 the counts, the licence and what the dataset is NOT
 *   <scenario>/lerobot/, rlds/    a small labelled SAMPLE of those demonstrations in the LeRobot-/RLDS-style layouts
 *                                 (tools/lib/dataset_formats.mjs); the full set is reproduced by seed, not shipped
 *   <scenario>/policy.json        the trained k-NN behaviour-cloning policy's parameters (shared/col-learn.js colTrain:
 *                                 its feature names, weights, k and the demonstration rows it votes over)
 *   <scenario>/eval-card.json/.md the policy's eval card: success vs random and the expert on the 60 held-out seeds
 *                                 (from docs/evals/colearn.json), invariant violations counted live, lineage, audit head
 *   governance.json               ENTERPRISE-3 registry built in memory: lineage (dataset -> policy -> eval -> site) and
 *                                 the hash-chained audit log with its head
 *   index.json, README.md         the index
 *
 * Deterministic: fixed timestamps, so the same code writes the same bytes and tools/check_roboexport.mjs can compare
 * the files on disk with a fresh in-memory build. Every episode is synthetic (a scripted expert with lapses and action
 * noise standing in for a person) and labelled so; no learner data is read, nothing is uploaded, no robot exists
 * outside the simulation.
 *
 *     node tools/rb_export.mjs            # write exports/robotics/
 *     node tools/rb_export.mjs --check    # build in memory and compare with disk (exit 1 on a difference)
 */
import { mkdirSync, writeFileSync, rmSync, existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join, dirname, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { tmpdir } from "node:os";
import { RB_SCENARIOS, RB_SITES, RB_RULES, RB_SCHEMA } from "../WebXR/shared/rb-robotics-data.js";
import { rbEnv, rbRollout } from "../WebXR/shared/rb-env.js";
import { COL_SCENARIOS, COL_VERSION, colSyntheticDemos, colDemosFromEpisodes, colTrain, colPolicy, colHeldOut, colHash } from "../WebXR/shared/col-learn.js";
import { dxDatasetCard, DX_SCHEMA_ID, DX_SCHEMA_VERSION } from "../WebXR/shared/dx-data.js";
import { ent3UseStorage, ent3RegisterDataset, ent3RegisterPolicy, ent3RecordEval, ent3Deploy, ent3Lineage, ent3AuditList, ent3VerifyAudit } from "../WebXR/shared/ent3-governance.js";
import { createFormatWriters, validateFormats } from "./lib/dataset_formats.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
export const RX_OUT = join(ROOT, "exports", "robotics");
export const RX_VERSION = "rx/1";
export const RX_FIXED_TIME = "2026-01-01T00:00:00.000Z";
export const RX_SAMPLE_N = 3;
export const RX_DEMOS = 40;
export const RX_DEMO_SEED = 1;
export const RX_LICENCE = "CC0-1.0";
const RX_ORG = "smartcitix-holodeck";

const r3 = (n) => Math.round(n * 1000) / 1000;

/** The seeds colSyntheticDemos draws for demonstration k (shared/col-learn.js): seed*100003 + k + 1. */
export const rxDemoSeeds = (n = RX_DEMOS, seed = RX_DEMO_SEED) => Array.from({ length: n }, (_, k) => seed * 100003 + k + 1);

/** A Storage-shaped memory store for the ENTERPRISE-3 registry. */
function rxMemStorage() { const m = new Map(); return { getItem: (k) => (m.has(k) ? m.get(k) : null), setItem: (k, v) => m.set(k, String(v)), removeItem: (k) => m.delete(k) }; }

/** The policy's safe-practice violations on the held-out seeds, by rule. */
function rxViolations(sc, policyFor, seeds) {
  const byRule = {}; let total = 0, steps = 0, episodes = 0;
  for (const seed of seeds) {
    const r = rbRollout(rbEnv(sc, { seed }), { seed, policy: policyFor(seed) });
    steps += r.steps.length;
    let n = 0;
    for (const s of r.steps) for (const v of s.info.violations ?? []) { byRule[v] = (byRule[v] ?? 0) + 1; total += 1; n += 1; }
    if (n) episodes += 1;
  }
  // A held protective stop (keep-out, a busy crossing) repeats on every step the policy keeps pushing, so the
  // step count is reported beside the number of episodes it is concentrated in.
  return { total, steps, byRule, episodes, of: seeds.length };
}

/** Build the whole package in memory: { files: Map<relativePath, string>, index } plus the sample layouts on disk under `scratch`. */
export async function rxBuild({ scratch = join(tmpdir(), `rx-sample-${process.pid}`) } = {}) {
  const colearn = JSON.parse(readFileSync(join(ROOT, "docs/evals/colearn.json"), "utf8"));
  const heldOut = colHeldOut(60);
  const files = new Map();
  const put = (p, s) => files.set(p, s);
  ent3UseStorage(rxMemStorage());
  const entries = [];

  for (const sc of COL_SCENARIOS) {
    const scen = RB_SCENARIOS.find((s) => s.id === sc);
    const evalRow = colearn.policies.find((p) => p.scenario === sc);
    if (!scen || !evalRow) throw new Error(`${sc}: not in RB_SCENARIOS or docs/evals/colearn.json`);
    const eps = colSyntheticDemos(sc, { n: RX_DEMOS, seed: RX_DEMO_SEED });
    const { demos } = colDemosFromEpisodes(eps, sc);
    const model = colTrain(sc, demos, { seed: RX_DEMO_SEED, onlySuccessful: true });
    const modelHash = colHash(model);
    if (modelHash !== evalRow.modelHash) throw new Error(`${sc}: trained model ${modelHash} differs from docs/evals/colearn.json ${evalRow.modelHash} (node tools/col_eval.mjs regenerates it)`);
    const kept = demos.filter((d) => d.success && d.clean);
    const steps = eps.reduce((n, e) => n + e.steps.length, 0);
    const seeds = rxDemoSeeds();
    const demoHash = colHash(eps.map((e) => [e.episodeId, e.summary.success, e.summary.safePractice, e.steps.length]));

    // --- the dataset summary and card
    const dir = sc;
    const sample = eps.slice(0, RX_SAMPLE_N);
    const dataset = {
      v: RX_VERSION, scenario: sc, name: scen.name, station: scen.station, kind: "robot-game", source: "synthetic",
      label: "SYNTHETIC — a scripted expert at skill 0.85 with action noise standing in for a person; no learner episode is in this set",
      generator: "shared/col-learn.js colSyntheticDemos (via tools/rb_export.mjs)", schema: { id: DX_SCHEMA_ID, version: DX_SCHEMA_VERSION, env: RB_SCHEMA.env },
      seeds: { demonstration: seeds, heldOut: { from: heldOut[0], to: heldOut[heldOut.length - 1], n: heldOut.length } },
      counts: { episodes: eps.length, keptForTraining: kept.length, steps, rows: model.rows.length, sampleEpisodes: sample.length, sampleSteps: sample.reduce((n, e) => n + e.steps.length, 0) },
      licence: RX_LICENCE, demoSetHash: demoHash, safePractice: scen.safePractice.map((r) => ({ rule: r, weight: RB_RULES[r].weight, text: RB_RULES[r].text })),
      reproduce: `colSyntheticDemos("${sc}", { n: ${RX_DEMOS}, seed: ${RX_DEMO_SEED}, skill: 0.85, noise: 0.3 })`,
      sample: { note: `${sample.length} of ${eps.length} demonstrations, written in the LeRobot- and RLDS-style layouts (lerobot/, rlds/); the full set is reproduced by seed`, lerobot: "lerobot/", rlds: "rlds/" },
      notThis: [
        "not recorded from any person: every episode is generated by a scripted policy",
        "not a measurement of any physical robot, site or machine; the scenario is procedural",
        "not a certification of safe practice; the rules are this engine's, not a standards body's",
        "not large: the set is a few thousand steps on a small discrete task and does not generalise beyond it",
      ],
    };
    put(`${dir}/dataset.json`, JSON.stringify(dataset, null, 2) + "\n");
    const card = dxDatasetCard({
      name: `${scen.name} — synthetic demonstrations (${sc})`, createdAt: RX_FIXED_TIME, generator: dataset.generator,
      schema: { id: DX_SCHEMA_ID, version: DX_SCHEMA_VERSION },
      counts: { episodes: eps.length, human: 0, synthetic: eps.length, steps, scenarios: 1, worlds: ["robotics"], train: eps.length, validation: 0 },
      licences: [RX_LICENCE], consentReceipts: 0, shards: [{ path: "rlds/episodes.jsonl (sample)", episodes: sample.length }],
    });
    put(`${dir}/dataset-card.md`, [
      card.trimEnd(), "",
      "## Source", "", `Headless rollouts of the gym scenario \`${sc}\` (${scen.name}, beside the catalog station \`${scen.station}\`) in \`WebXR/shared/rb-env.js\`, driven by the scripted expert at skill 0.85 with action noise 0.3 (\`shared/col-learn.js colSyntheticDemos\`). This is the exact set \`tools/col_eval.mjs\` trains the k-NN clone on.`, "",
      "## Synthetic label", "", `Every episode carries \`source: "synthetic"\`, \`consent: null\` and a provenance policy line naming the stand-in. No person was recorded. The label is checked by \`tools/check_roboexport.mjs\`.`, "",
      "## Seeds", "", `Demonstrations: ${eps.length} seeds, ${seeds[0]}–${seeds[seeds.length - 1]} (seed × 100003 + k + 1). Held-out evaluation seeds: ${heldOut[0]}–${heldOut[heldOut.length - 1]}, never used to make demonstrations. Deterministic: \`${dataset.reproduce}\` reproduces the set (hash \`${demoHash}\`).`, "",
      "## Counts", "", `${eps.length} episodes, ${steps} steps; ${kept.length} episodes passed clean and are kept for filtered behaviour cloning (${model.rows.length} training rows after the wait filter). ${sample.length} episodes (${dataset.counts.sampleSteps} steps) are written here as a sample in \`lerobot/\` and \`rlds/\`.`, "",
      "## Licence of the simulated data", "", `${RX_LICENCE}. Generated data, no person involved.`, "",
      "## What this dataset is not", "", ...dataset.notThis.map((t) => `- ${t.charAt(0).toUpperCase()}${t.slice(1)}.`), "",
    ].join("\n"));

    // --- the sample in the LeRobot/RLDS layouts (written to scratch, then read back as files)
    const sdir = join(scratch, sc);
    if (existsSync(sdir)) rmSync(sdir, { recursive: true, force: true });
    mkdirSync(sdir, { recursive: true });
    const fw = createFormatWriters(sdir, { lerobot: true, rlds: true, generatedAt: RX_FIXED_TIME });
    const room = { name: scen.name, tagline: scen.blurb, steps: [] };
    for (const e of sample) fw.add({ ...e, station: sc, app: "robotics", skill: 0.85, seed: e.provenance.seed, embodied: true }, room);
    fw.close({ sample: `${sample.length} of ${eps.length} synthetic demonstrations; the full set is reproduced by seed (dataset.json)`, label: "synthetic" });
    const v = validateFormats(sdir);
    if (!v.lerobot?.valid || !v.rlds?.valid) throw new Error(`${sc}: sample layouts invalid: ${JSON.stringify(v)}`);
    for (const f of rxWalk(sdir)) put(`${dir}/${relative(sdir, f).split("\\").join("/")}`, readFileSync(f, "utf8"));

    // --- the policy's parameters
    const policy = { ...model, modelHash, trainedWith: "shared/col-learn.js colTrain (filtered: successful, clean demonstrations)", dataset: `${dir}/dataset.json`, note: "k-nearest-neighbour behaviour cloning: the parameters ARE these rows (feature vector, action label, mean action parameters); colPolicy(this) is the policy. It does not plan or generalise beyond its demonstrations." };
    put(`${dir}/policy.json`, JSON.stringify(policy) + "\n");

    // --- the eval card: colearn.json's measured row plus live invariant counts
    const bcViol = rxViolations(sc, () => colPolicy(model), heldOut);
    const expertViol = rxViolations(sc, (seed) => null, heldOut); // policy null -> rbPolicy skill 1 inside rbRollout
    const sites = RB_SITES.filter((s) => s.scenario === sc).map((s) => s.id);
    const datasetId = `rx-ds-${sc}`, policyId = `rx-bc-${sc}`;
    const ds = ent3RegisterDataset({ id: datasetId, orgId: RX_ORG, name: `${scen.name} synthetic demonstrations`, source: "synthetic", episodes: eps.length, steps, licences: [RX_LICENCE], scenarios: [sc], worlds: ["robotics"], generator: "tools/rb_export.mjs", createdAt: RX_FIXED_TIME }, { at: RX_FIXED_TIME });
    if (!ds.ok) throw new Error(`${sc}: ${ds.reason}`);
    const pol = ent3RegisterPolicy({ id: policyId, version: modelHash.slice(0, 8), name: `${scen.name} k-NN clone`, method: "behaviour-cloning-knn", trainedOn: [datasetId] }, { at: RX_FIXED_TIME });
    if (!pol.ok) throw new Error(`${sc}: ${pol.reason}`);
    for (const [metric, value, baseline] of [["success", evalRow.bcFiltered.success, evalRow.random.success], ["clean", evalRow.bcFiltered.clean, evalRow.random.clean]]) {
      const ev = ent3RecordEval(policyId, { suite: `COLEARN held-out seeds ${heldOut[0]}-${heldOut[heldOut.length - 1]} (docs/evals/colearn.json)`, metric, value, n: 60, seeds: [heldOut[0], heldOut[heldOut.length - 1]], baseline, measured: true, at: RX_FIXED_TIME });
      if (!ev.ok) throw new Error(`${sc}: ${ev.reason}`);
    }
    for (const siteId of sites) { const d = ent3Deploy({ policyId, siteId }, { at: RX_FIXED_TIME }); if (!d.ok) throw new Error(`${sc}: ${d.reason}`); }
    const audit = ent3AuditList();
    const auditHead = audit[audit.length - 1].hash;
    const evalCard = {
      v: RX_VERSION, scenario: sc, name: scen.name, station: scen.station, policy: { id: policyId, version: modelHash.slice(0, 8), method: "behaviour-cloning-knn", file: `${dir}/policy.json`, modelHash },
      dataSource: { id: datasetId, source: "synthetic", file: `${dir}/dataset.json`, demosOffered: evalRow.demosOffered, demosKept: evalRow.demosKept, rows: evalRow.rows },
      seeds: { heldOut: `${heldOut[0]}-${heldOut[heldOut.length - 1]}`, n: 60 },
      results: { random: evalRow.random, expert: evalRow.expert, bcFiltered: evalRow.bcFiltered, bcUnfiltered: evalRow.bcUnfiltered, gapToExpert: evalRow.gapToExpert },
      invariants: { rules: scen.safePractice, unit: "violation steps (a held protective stop repeats every step)", policyViolations: bcViol.total, policyViolationsByRule: bcViol.byRule, policyEpisodesWithViolations: bcViol.episodes, policySteps: bcViol.steps, expertViolations: expertViol.total, expertEpisodesWithViolations: expertViol.episodes, expertSteps: expertViol.steps, of: 60 },
      lineage: { datasetId, policyId, sites, auditHead, auditLines: audit.length },
      measuredOn: "the simulated scenario only; no hardware run has happened",
    };
    put(`${dir}/eval-card.json`, JSON.stringify(evalCard, null, 2) + "\n");
    const pct = (x) => `${Math.round(x * 1000) / 10}%`;
    put(`${dir}/eval-card.md`, [
      `# Eval card — ${scen.name} k-NN clone (${policyId}@${modelHash.slice(0, 8)})`, "",
      `Scenario \`${sc}\` (beside station \`${scen.station}\`). Method: behaviour cloning, k-nearest neighbours (k=${model.k}) over ${model.features.length} hand-written features. Trained on \`${datasetId}\` (synthetic: ${evalRow.demosKept} of ${evalRow.demosOffered} demonstrations kept, ${evalRow.rows} rows). Parameters in \`policy.json\` (hash \`${modelHash}\`).`, "",
      "## Results on 60 held-out seeds (" + evalCard.seeds.heldOut + ")", "",
      "| Policy | Success | Clean (no rule broken) | Mean steps |", "|---|---:|---:|---:|",
      `| Random floor | ${pct(evalRow.random.success)} | ${pct(evalRow.random.clean)} | ${evalRow.random.meanSteps} |`,
      `| k-NN clone, filtered demonstrations | **${pct(evalRow.bcFiltered.success)}** | ${pct(evalRow.bcFiltered.clean)} | ${evalRow.bcFiltered.meanSteps} |`,
      `| k-NN clone, every demonstration | ${pct(evalRow.bcUnfiltered.success)} | ${pct(evalRow.bcUnfiltered.clean)} | ${evalRow.bcUnfiltered.meanSteps} |`,
      `| Scripted expert (ceiling) | ${pct(evalRow.expert.success)} | ${pct(evalRow.expert.clean)} | ${evalRow.expert.meanSteps} |`, "",
      `Gap to the expert (success): ${evalRow.gapToExpert}. Source: \`docs/evals/colearn.json\` (\`tools/col_eval.mjs\`).`, "",
      "## Invariant violations (counted live over the same 60 seeds)", "",
      `Rules: ${scen.safePractice.map((r) => `\`${r}\``).join(", ")}. Clone: **${bcViol.total}** violation step${bcViol.total === 1 ? "" : "s"} in ${bcViol.episodes} of ${bcViol.of} episodes (${bcViol.steps} steps)${bcViol.total ? ` — ${Object.entries(bcViol.byRule).map(([k, n]) => `${k} ${n}`).join(", ")}; a held protective stop repeats on every step the policy keeps pushing, so the steps concentrate in the failed episodes` : ""}. Expert: ${expertViol.total} in ${expertViol.episodes} of ${expertViol.of} episodes (${expertViol.steps} steps).`, "",
      "## Lineage and audit", "",
      `ENTERPRISE-3 registry (built in memory by \`tools/rb_export.mjs\`, \`governance.json\`): dataset \`${datasetId}\` → policy \`${policyId}\` → ${2} measured evals → deployed (sim) to ${sites.length ? sites.map((s) => `\`${s}\``).join(", ") : "no site"}. Audit chain head after this policy's lines: \`${auditHead}\` (${audit.length} lines, chain verified).`, "",
      "## Read honestly", "",
      "- Measured on the simulated scenario only. No hardware run has happened; `docs/bench-protocol.md` says how one would be scored.", "- The demonstrations are synthetic (a scripted expert with lapses and noise), so this measures whether the clone copies that expert, not whether it learns from people.",
      "- The scenario is small and discrete; a clone that reaches the expert shows the features name what the expert looks at, not that the task is hard.", "",
    ].join("\n"));

    entries.push({ id: sc, name: scen.name, station: scen.station, dir: `${dir}/`, files: ["dataset.json", "dataset-card.md", "lerobot/", "rlds/", "policy.json", "eval-card.json", "eval-card.md"].map((f) => `${dir}/${f}`), counts: dataset.counts, results: { random: evalRow.random.success, bc: evalRow.bcFiltered.success, expert: evalRow.expert.success, gapToExpert: evalRow.gapToExpert }, invariantViolations: bcViol.total, invariantEpisodes: bcViol.episodes, lineage: evalCard.lineage });
  }

  const audit = ent3AuditList();
  const verify = ent3VerifyAudit();
  if (!verify.ok) throw new Error(`audit chain broken at ${verify.brokenAt}`);
  const governance = { v: RX_VERSION, registry: "WebXR/shared/ent3-governance.js, built in memory by tools/rb_export.mjs (no device store was read or written)", lineage: ent3Lineage(), audit, auditHead: audit[audit.length - 1].hash, verify };
  put("governance.json", JSON.stringify(governance, null, 2) + "\n");
  const index = {
    v: RX_VERSION, generator: "tools/rb_export.mjs", colearn: { version: colearn.version, data: colearn.data }, fixedTime: RX_FIXED_TIME,
    label: "Every dataset here is SYNTHETIC and says so; every policy is evaluated on the simulated scenario only. No hardware run has happened.",
    licence: RX_LICENCE, scenarios: entries, governance: { file: "governance.json", auditHead: governance.auditHead, auditLines: audit.length, verified: verify.ok },
    docs: { report: "docs/perf/robot-policies.html", bench: "docs/bench-protocol.md", terms: "docs/learner-data-terms.md", console: "docs/consoles/ROBOEXPORT.md" },
  };
  put("index.json", JSON.stringify(index, null, 2) + "\n");
  put("README.md", [
    "# Robotics exports — the sim-to-real readiness package", "",
    "Written by `node tools/rb_export.mjs` (console ROBOEXPORT, `docs/consoles/ROBOEXPORT.md`). Six gym scenarios, each with a labelled synthetic demonstration dataset (summary, datasheet and a small LeRobot-/RLDS-style sample), the trained k-NN behaviour-cloning policy's parameters and its eval card; `governance.json` holds the lineage and the hash-chained audit log. Deterministic (fixed timestamps): `tools/check_roboexport.mjs` rebuilds it in memory and compares.", "",
    `**${index.label}** Licence of the simulated data: ${RX_LICENCE}.`, "",
    "| Scenario | Station | Demos kept / offered | Random | k-NN clone | Expert | Gap | Clone violation steps (episodes of 60) | Policy id |", "|---|---|---:|---:|---:|---:|---:|---:|---|",
    ...entries.map((e) => `| [${e.name}](${e.dir}) | \`${e.station}\` | ${e.counts.keptForTraining} / ${e.counts.episodes} | ${e.results.random} | **${e.results.bc}** | ${e.results.expert} | ${e.results.gapToExpert} | ${e.invariantViolations} (${e.invariantEpisodes}) | \`${e.lineage.policyId}\` |`), "",
    `Audit chain head \`${governance.auditHead}\` (${audit.length} lines, verified). Report: \`docs/perf/robot-policies.html\` (\`node tools/rb_report.mjs\`). Bench protocol (method only, no result): \`docs/bench-protocol.md\`. Learner-data terms (draft for counsel): \`docs/learner-data-terms.md\`.`, "",
  ].join("\n"));
  rmSync(scratch, { recursive: true, force: true });
  return { files, index, governance };
}

function rxWalk(dir) { const out = []; for (const f of readdirSync(dir)) { const p = join(dir, f); if (statSync(p).isDirectory()) out.push(...rxWalk(p)); else out.push(p); } return out.sort(); }

/** Compare an in-memory build with exports/robotics/ on disk: { same, missing, extra, changed }. */
export function rxDiff(files, out = RX_OUT) {
  const disk = existsSync(out) ? rxWalk(out).map((p) => relative(out, p).split("\\").join("/")) : [];
  const missing = [...files.keys()].filter((k) => !disk.includes(k));
  const extra = disk.filter((k) => !files.has(k));
  const changed = [...files.keys()].filter((k) => disk.includes(k) && readFileSync(join(out, k), "utf8") !== files.get(k));
  return { same: !missing.length && !extra.length && !changed.length, missing, extra, changed };
}

const isMain = process.argv[1]?.endsWith("rb_export.mjs");
if (isMain) {
  const t0 = Date.now();
  const { files, index } = await rxBuild();
  if (process.argv.includes("--check")) {
    const d = rxDiff(files);
    console.log(`rb_export --check: ${d.same ? "exports/robotics is current" : `differs: ${d.missing.length} missing, ${d.extra.length} extra, ${d.changed.length} changed`} (${Date.now() - t0} ms)`);
    process.exit(d.same ? 0 : 1);
  }
  if (existsSync(RX_OUT)) rmSync(RX_OUT, { recursive: true, force: true });
  let bytes = 0;
  for (const [p, s] of files) { mkdirSync(dirname(join(RX_OUT, p)), { recursive: true }); writeFileSync(join(RX_OUT, p), s); bytes += Buffer.byteLength(s); }
  console.log(`rb_export: ${index.scenarios.length} scenarios, ${files.size} files, ${(bytes / 1024).toFixed(0)} KB → exports/robotics (audit head ${index.governance.auditHead}, ${Date.now() - t0} ms)`);
}
