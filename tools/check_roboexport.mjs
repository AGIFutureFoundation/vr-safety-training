#!/usr/bin/env node
/**
 * ROBOEXPORT checker (docs/consoles/ROBOEXPORT.md): the sim-to-real readiness package, with no hardware claim.
 *   1. exports present: exports/robotics/index.json, governance.json and, for each of the six gym scenarios, the dataset
 *      summary, its card, the LeRobot-/RLDS-style sample (valid by tools/lib/dataset_formats.mjs validateFormats), the
 *      policy's parameters and the eval card; every file small
 *   2. exports current: a fresh in-memory build (tools/rb_export.mjs rxBuild) is byte-identical to the files on disk, which
 *      also proves every trained model's hash equals docs/evals/colearn.json's
 *   3. cards complete: every DATAWORKS datasheet heading plus the source / synthetic label / seeds / counts / licence /
 *      not-this sections; every eval-card field; every episode labelled synthetic with consent null
 *   4. policies load: policy.json is a COLEARN model whose hash matches, and colPolicy(it) runs on a held-out seed
 *   5. governance: the audit chain verifies, the head matches the index and every eval card's head is a line in it;
 *      the lineage holds six datasets, six policies, twelve measured evals
 *   6. report current: docs/perf/robot-policies.html equals tools/rb_report.mjs's output; no script, no external link,
 *      design tokens in both schemes, one card per scenario, every audit head on the page
 *   7. learner-data terms: docs/learner-data-terms.md is marked a draft for counsel; it names what the code enforces
 *      (the eligibility refusals are exercised live, the never-list, both licences, revoke deletes, this device); it
 *      makes no forbidden promise (a scan: any sentence naming a guarantee, a regulation, encryption, anonymity, a
 *      server or an upload must be a negation); it is linked from the consent panel and the Guide's FAQ
 *   8. no hardware, partner, customer or financial claim in anything this console wrote; the bench protocol says no
 *      hardware run has happened; hygiene (no model identifier, no import alias)
 *
 *     node tools/check_roboexport.mjs
 */
import { readFileSync, existsSync, readdirSync, statSync } from "node:fs";
import { join, dirname, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { rxBuild, rxDiff, RX_OUT } from "./rb_export.mjs";
import { rxReportHtml, RX_REPORT_PATH } from "./rb_report.mjs";
import { validateFormats } from "./lib/dataset_formats.mjs";
import { COL_SCENARIOS, COL_VERSION, colPolicy, colHash, colHeldOut } from "../WebXR/shared/col-learn.js";
import { rbEnv, rbRollout } from "../WebXR/shared/rb-env.js";
import { DX_CARD_SECTIONS, DX_NEVER, DX_LICENCES, dxEligibility } from "../WebXR/shared/dx-data.js";
import { ent3VerifyAudit } from "../WebXR/shared/ent3-governance.js";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
let passes = 0, failures = 0;
const t0 = Date.now();
async function check(name, fn) {
  try { const r = await fn(); passes += 1; console.log(`  ✓ ${name}${r ? ` — ${r}` : ""}`); }
  catch (err) { failures += 1; console.log(`  ✗ ${name}\n      ${err.message ?? err}`); }
}
const ok = (v, what) => { if (!v) throw new Error(what); };
const read = (p) => readFileSync(join(ROOT, p), "utf8");
const walk = (dir) => { const out = []; for (const f of readdirSync(dir)) { const p = join(dir, f); if (statSync(p).isDirectory()) out.push(...walk(p)); else out.push(p); } return out; };
const sentences = (text) => text.replace(/\r/g, "").split(/(?<=[.!?])\s+|\n+/).map((s) => s.trim()).filter(Boolean);
const NEGATED = /\b(no|not|never|none|nothing|nobody|without|cannot|does not|do not|is not|are not|has not|have not|neither|nor|refuse[sd]?|rejects?|disabled|unasserted|would|to be measured|not measured|does not promise|makes no|outside)\b/i;

const MINE = ["tools/rb_export.mjs", "tools/rb_report.mjs", "tools/check_roboexport.mjs", "docs/bench-protocol.md", "docs/learner-data-terms.md", "docs/consoles/ROBOEXPORT.md", "docs/perf/robot-policies.html", "exports/robotics/README.md", "WebXR/shared/dx-consent-ui.js"];
const PER = ["dataset.json", "dataset-card.md", "policy.json", "eval-card.json", "eval-card.md", "lerobot/meta/info.json", "lerobot/meta/episodes.jsonl", "lerobot/meta/tasks.jsonl", "rlds/episodes.jsonl", "rlds/features.json"];

console.log("ROBOEXPORT — the sim-to-real readiness package, with no hardware claim\n");

// 1. present
let index = null, cards = {};
await check("exports present: index, governance and ten files per scenario for all six; LeRobot/RLDS samples valid; every file small", () => {
  ok(existsSync(join(RX_OUT, "index.json")) && existsSync(join(RX_OUT, "governance.json")) && existsSync(join(RX_OUT, "README.md")), "index.json / governance.json / README.md missing (node tools/rb_export.mjs)");
  index = JSON.parse(read("exports/robotics/index.json"));
  ok(index.scenarios.length === 6 && COL_SCENARIOS.every((sc) => index.scenarios.some((s) => s.id === sc)), `index lists ${index.scenarios.length} scenarios`);
  let bytes = 0, biggest = 0, nfiles = 0;
  for (const sc of COL_SCENARIOS) {
    for (const f of PER) ok(existsSync(join(RX_OUT, sc, f)), `${sc}/${f} missing`);
    const v = validateFormats(join(RX_OUT, sc));
    ok(v.lerobot?.valid && v.rlds?.valid, `${sc}: sample layouts invalid: ${JSON.stringify(v.lerobot?.issues ?? v.rlds?.issues)}`);
    cards[sc] = JSON.parse(read(`exports/robotics/${sc}/eval-card.json`));
  }
  for (const f of walk(RX_OUT)) { const s = statSync(f).size; bytes += s; biggest = Math.max(biggest, s); nfiles += 1; ok(s <= 160 * 1024, `${relative(RX_OUT, f)} is ${(s / 1024).toFixed(0)} KB (cap 160 KB: summaries and samples, not dumps)`); }
  ok(bytes <= 1.5 * 1024 * 1024, `exports/robotics is ${(bytes / 1024).toFixed(0)} KB (cap 1.5 MB)`);
  return `6 scenarios, ${nfiles} files, ${(bytes / 1024).toFixed(0)} KB, largest ${(biggest / 1024).toFixed(0)} KB`;
});

// 2. current
await check("exports current: a fresh in-memory build is byte-identical to disk (so every model hash equals docs/evals/colearn.json's)", async () => {
  const { files } = await rxBuild();
  const d = rxDiff(files);
  ok(d.same, `differs: missing ${d.missing.join(", ") || "-"}; extra ${d.extra.join(", ") || "-"}; changed ${d.changed.join(", ") || "-"} (node tools/rb_export.mjs)`);
  return `${files.size} files identical`;
});

// 3. cards complete + synthetic labels
await check("cards complete: every datasheet heading plus source / synthetic label / seeds / counts / licence / not-this; every eval-card field; every sample episode labelled synthetic", () => {
  const extra = ["## Source", "## Synthetic label", "## Seeds", "## Counts", "## Licence of the simulated data", "## What this dataset is not"];
  let eps = 0;
  for (const sc of COL_SCENARIOS) {
    const card = read(`exports/robotics/${sc}/dataset-card.md`);
    for (const h of DX_CARD_SECTIONS) ok(card.includes(`## ${h}`), `${sc}: card lacks "${h}"`);
    for (const h of extra) ok(card.includes(h), `${sc}: card lacks "${h}"`);
    const ds = JSON.parse(read(`exports/robotics/${sc}/dataset.json`));
    ok(ds.source === "synthetic" && /SYNTHETIC/.test(ds.label) && ds.licence === "CC0-1.0" && ds.seeds.demonstration.length === 40 && ds.counts.episodes === 40 && ds.notThis.length >= 3, `${sc}: dataset.json summary incomplete`);
    const c = cards[sc];
    for (const k of ["scenario", "name", "station", "policy", "dataSource", "seeds", "results", "invariants", "lineage", "measuredOn"]) ok(c[k] != null, `${sc}: eval-card lacks ${k}`);
    for (const k of ["random", "expert", "bcFiltered", "bcUnfiltered", "gapToExpert"]) ok(c.results[k] != null, `${sc}: eval-card results lack ${k}`);
    for (const k of ["datasetId", "policyId", "auditHead", "sites"]) ok(c.lineage[k] != null, `${sc}: eval-card lineage lacks ${k}`);
    ok(c.dataSource.source === "synthetic" && c.policy.modelHash && c.seeds.n === 60 && typeof c.invariants.policyViolations === "number" && /no hardware run/i.test(c.measuredOn), `${sc}: eval-card fields`);
    ok(/no hardware run/i.test(read(`exports/robotics/${sc}/eval-card.md`)), `${sc}: eval-card.md does not say no hardware run has happened`);
    for (const line of read(`exports/robotics/${sc}/rlds/episodes.jsonl`).split("\n").filter(Boolean)) {
      const m = JSON.parse(line).episode_metadata;
      ok(m.source === "synthetic" && m.consent?.required === false && m.licence === "CC0-1.0" && m.crewTagHash == null, `${sc}: an RLDS episode is not labelled synthetic`);
      eps += 1;
    }
    for (const line of read(`exports/robotics/${sc}/lerobot/meta/episodes.jsonl`).split("\n").filter(Boolean)) ok(JSON.parse(line).source === "synthetic", `${sc}: a LeRobot episode is not labelled synthetic`);
  }
  return `6 datasheets × ${DX_CARD_SECTIONS.length + extra.length} sections, 6 eval cards, ${eps} sample episodes labelled synthetic`;
});

// 4. policies load and run
await check("policies load: policy.json is a COLEARN model whose hash matches its eval card and colearn.json; colPolicy(it) runs a held-out seed", () => {
  const colearn = JSON.parse(read("docs/evals/colearn.json"));
  const out = [];
  for (const sc of COL_SCENARIOS) {
    const p = JSON.parse(read(`exports/robotics/${sc}/policy.json`));
    const { modelHash, trainedWith, dataset, note, ...model } = p;
    ok(model.v === COL_VERSION && model.scenario === sc && Array.isArray(model.rows) && model.rows.length && model.features.length === model.rows[0].x.length, `${sc}: not a COLEARN model`);
    ok(colHash(model) === modelHash && modelHash === cards[sc].policy.modelHash && modelHash === colearn.policies.find((x) => x.scenario === sc).modelHash, `${sc}: model hash mismatch`);
    ok(model.rows.length === cards[sc].dataSource.rows, `${sc}: rows ${model.rows.length} vs card ${cards[sc].dataSource.rows}`);
    const seed = colHeldOut(1)[0];
    const r = rbRollout(rbEnv(sc, { seed }), { seed, policy: colPolicy(model) });
    ok(r.steps.length > 0, `${sc}: the loaded policy produced no steps`);
    out.push(`${sc.replace("rb-", "")} ${model.rows.length} rows, seed ${seed} ${r.summary.passed ? "pass" : "fail"}`);
  }
  return out.join("; ");
});

// 5. governance
await check("governance: the audit chain verifies; the head matches the index and every eval card's head is a line; lineage 6 datasets → 6 policies → 12 measured evals", () => {
  const g = JSON.parse(read("exports/robotics/governance.json"));
  const v = ent3VerifyAudit(g.audit);
  ok(v.ok && g.verify.ok, `audit chain broken at ${v.brokenAt}`);
  ok(g.audit[g.audit.length - 1].hash === g.auditHead && index.governance.auditHead === g.auditHead, "audit head mismatch");
  const hashes = new Set(g.audit.map((a) => a.hash));
  for (const sc of COL_SCENARIOS) ok(hashes.has(cards[sc].lineage.auditHead), `${sc}: its audit head is not a line in the chain`);
  const nodes = (t) => g.lineage.nodes.filter((n) => n.type === t);
  ok(nodes("dataset").length === 6 && nodes("policy").length === 6 && nodes("eval").length === 12 && nodes("eval").every((n) => n.status === "measured"), `lineage: ${nodes("dataset").length} datasets, ${nodes("policy").length} policies, ${nodes("eval").length} evals`);
  ok(g.lineage.edges.filter((e) => e.kind === "trained-on").length === 6 && nodes("dataset").every((n) => n.status === "current") && nodes("policy").every((n) => n.status === "current"), "lineage edges or statuses");
  ok(/in memory/.test(g.registry), "the registry does not say it was built in memory");
  return `${g.audit.length} lines, head ${g.auditHead}; ${nodes("site").length} sim site deployments`;
});

// 6. report current
await check("report current: docs/perf/robot-policies.html equals rb_report's output; static (no script, no external link), tokens in both schemes, one card per scenario, every audit head shown", () => {
  const html = read("docs/perf/robot-policies.html");
  ok(html === rxReportHtml(), "robot-policies.html is stale (node tools/rb_report.mjs)");
  ok(!/<script/i.test(html) && !/https?:\/\//i.test(html) && !/<link/i.test(html) && !/@import/i.test(html), "the page has a script, a link tag or an external URL");
  ok(/--at-bg:/.test(html) && /prefers-color-scheme/.test(html) && /data-theme="light"/.test(html) && /viewport/.test(html), "tokens or viewport missing");
  ok((html.match(/<article/g) ?? []).length === 6, "not six cards");
  for (const sc of COL_SCENARIOS) ok(html.includes(`id="${sc}"`) && html.includes(cards[sc].lineage.auditHead) && html.includes(cards[sc].policy.id), `${sc}: card, head or policy id missing from the page`);
  ok(/No hardware run has happened/.test(html) && /Simulated robots only/.test(html), "the page does not say no hardware run has happened");
  return `${html.length} bytes, 6 cards`;
});

// 7. the learner-data terms
await check("learner-data terms: marked draft for counsel; names what the code enforces (eligibility refusals exercised live, the never-list, both licences, revoke deletes, this device); no forbidden promise; linked from the consent panel and the FAQ", () => {
  const t = read("docs/learner-data-terms.md");
  ok(/draft for counsel/i.test(t.slice(0, 600)), "not marked a draft for counsel near the top");
  // what the code enforces, exercised live
  const base = { demo: false, signedIn: true, k12: false, adult: true };
  ok(dxEligibility(base).eligible, "the eligible baseline is refused");
  for (const [k, v, word] of [["demo", true, /demo/i], ["signedIn", false, /signed out/i], ["k12", true, /K-12/], ["adult", false, /18 or older|adult/i], ["demo", null, /cannot tell|unknown/i]]) {
    ok(!dxEligibility({ ...base, [k]: v }).eligible, `the code does not refuse ${k}=${v}`);
    ok(word.test(t), `the terms do not mention the ${k} refusal`);
  }
  for (const n of DX_NEVER) ok(new RegExp(n.split(" ")[0].replace("-", "-?"), "i").test(t), `the terms do not name "${n}" as never collected`);
  for (const l of DX_LICENCES) ok(t.includes(l), `the terms do not name licence ${l}`);
  ok(/this device|this browser/i.test(t) && /delet/i.test(t) && /Stop and delete everything/.test(t) && /opt in/i.test(t) && /local provider/i.test(t), "storage, revoke, opt-in or training wording missing");
  ok(/does not promise|not promise/i.test(t), "no 'does not promise' section");
  // forbidden promises: a sentence naming any of these must be a negation
  const FORBID = /\b(guarantee[sd]?|GDPR|CCPA|COPPA|HIPAA|FERPA|ISO\s?\d+|compliant|compliance|certif(ied|ies|ication)|encrypt\w*|end-to-end|legally binding|warrant(y|ies|s)?|indemn\w*|re-?identif\w*|anonym\w*|secure(ly)?|server|cloud|upload\w*|we will|we promise|always safe|cannot be (lost|leaked|breached))\b/i;
  const bad = sentences(t).filter((s) => FORBID.test(s) && !NEGATED.test(s));
  ok(!bad.length, `forbidden promise: ${bad.slice(0, 3).join(" | ")}`);
  // links
  const ui = read("WebXR/shared/dx-consent-ui.js");
  ok(ui.includes("learner-data-terms.md") && ui.includes('id: "dx-terms"') && /draft for counsel/i.test(ui), "the consent panel does not link the terms");
  ok(!/\.innerHTML\s*=|\.outerHTML\s*=|insertAdjacentHTML|fetch\(|XMLHttpRequest|sendBeacon|WebSocket/.test(ui), "the consent panel gained an HTML sink or network code");
  const kb = read("tools/gen_guide_kb.mjs");
  ok(/"data-terms"/.test(kb) && kb.includes("docs/learner-data-terms.md"), "the Guide's FAQ has no data-terms entry");
  ok(read("WebXR/shared/guide-kb.js").includes("learner-data-terms.md"), "guide-kb.js not regenerated (node tools/gen_guide_kb.mjs)");
  for (const c of ["tools/check_dataworks.mjs", "tools/check_robotrain.mjs", "tools/check_roboexport.mjs"]) ok(t.includes(c) && existsSync(join(ROOT, c)), `the terms cite ${c}, which should exist`);
  return `${sentences(t).length} sentences scanned, 0 unnegated promises; 5 refusals exercised; ${DX_NEVER.length} never-items named; FAQ + panel linked`;
});

// 8. no hardware / partner / customer / financial claim; hygiene
await check("no hardware, partner, customer or financial claim in anything this console wrote; the bench protocol says no hardware run has happened; no model identifier; no import alias", () => {
  const bench = read("docs/bench-protocol.md");
  ok(/No hardware run has happened/.test(bench) && /method, not a result/i.test(bench) && /VB_PHYSICAL\.enabled/.test(bench) && /e-stop/i.test(bench) && /approv/i.test(bench), "bench protocol lacks the no-run statement, the governor preconditions or the approvers");
  // Partner, customer and financial words must only appear negated; a hardware RESULT is any sentence that says
  // something was achieved, measured or run on hardware, a real or physical robot or a bench (method sentences say
  // "would", "to be measured", "no", "not").
  const CLAIM = /\b(partner(ship|ed|s)?|customers?|clients?|revenue|valuation|fundrais\w*|investment|token price|\$\s?[0-9]|deployed to production|in production)\b/i;
  const RESULT = /\b((achiev|demonstrat|succeed|reach|measur|test|validat|prov|confirm|show|ran|run)\w*\s+(on|with|at)\s+(hardware|a real|the real|a physical|the physical|the bench|a bench)|(was|were|has been|have been)\s+(run|tested|measured|validated|deployed|tried)\s+on\s+(hardware|a robot|a bench|the bench|a physical|a real)|hardware (result|figure|success|pass)s?\b(?!.*\b(none|not|no)\b))/i;
  const files = [...MINE.filter((f) => existsSync(join(ROOT, f))), ...walk(RX_OUT).filter((f) => /\.md$/.test(f)).map((f) => relative(ROOT, f))];
  let scanned = 0;
  for (const f of files) {
    if (f === "tools/check_roboexport.mjs") continue; // this file carries the patterns it scans for
    const src = read(f);
    const bad = sentences(src).filter((s) => (CLAIM.test(s) || RESULT.test(s)) && !NEGATED.test(s));
    ok(!bad.length, `${f}: ${bad.slice(0, 2).join(" | ")}`);
    scanned += 1;
  }
  // Built from pieces so this file's own source does not carry the names it looks for.
  const MODEL = new RegExp("\\b(" + ["gp" + "t-?\\d", "cla" + "ude-\\d", "cla" + "ude [0-9]", "op" + "us", "son" + "net", "hai" + "ku", "gem" + "ini", "lla" + "ma", "mis" + "tral"].join("|") + ")\\b", "i");
  for (const f of files) ok(!MODEL.test(read(f)), `${f}: model identifier`);
  for (const f of MINE.filter((f) => /\.m?js$/.test(f) && existsSync(join(ROOT, f)))) ok(!/import\s*\{[^}]*\bas\b[^}]*\}/.test(read(f)), `${f}: import alias`);
  return `${files.length} files scanned for claims, ${scanned} clean`;
});

console.log(`\ncheck_roboexport: ${passes} passed, ${failures} failed (${Date.now() - t0} ms)`);
process.exit(failures ? 1 : 0);
