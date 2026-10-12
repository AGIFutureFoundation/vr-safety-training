#!/usr/bin/env node
/**
 * ROBOEXPORT (docs/consoles/ROBOEXPORT.md) — the policy evaluation report: docs/perf/robot-policies.html, one card per
 * trained policy from exports/robotics/ (tools/rb_export.mjs): its scenario, data source, seeds, success against the
 * random floor and the scripted expert, invariant violations, lineage id and the audit chain head.
 *
 * Pure static HTML: no <script>, no external request, the design system's tokens inlined (WebXR/shared/design.css
 * --at-* names and values, light and dark). Deterministic: the same exports write the same bytes, so the checker can
 * rebuild the page in memory and compare ("report current").
 *
 *     node tools/rb_report.mjs            # write docs/perf/robot-policies.html
 *     node tools/rb_report.mjs --check    # rebuild and compare with the file on disk
 */
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
export const RX_REPORT_PATH = join(ROOT, "docs", "perf", "robot-policies.html");
const EXPORTS = join(ROOT, "exports", "robotics");

const esc = (s) => String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const pct = (x) => `${Math.round(Number(x) * 1000) / 10}%`;

/** Build the page from exports/robotics/ (or a handed-in { index, cards, governance }). */
export function rxReportHtml({ index = null, cards = null, governance = null } = {}) {
  index ??= JSON.parse(readFileSync(join(EXPORTS, "index.json"), "utf8"));
  governance ??= JSON.parse(readFileSync(join(EXPORTS, "governance.json"), "utf8"));
  cards ??= index.scenarios.map((s) => JSON.parse(readFileSync(join(EXPORTS, s.id, "eval-card.json"), "utf8")));
  const n = cards.length;
  const atExpert = cards.filter((c) => c.results.gapToExpert <= 0.02).length;
  const cleanClones = cards.filter((c) => c.invariants.policyViolations === 0).length;

  const card = (c) => {
    const r = c.results;
    const bar = (label, v, cls) => `<div class="row"><span class="lab">${esc(label)}</span><span class="bar"><i class="${cls}" style="width:${Math.max(0, Math.min(100, Number(v) * 100)).toFixed(1)}%"></i></span><span class="val">${pct(v)}</span></div>`;
    const viol = c.invariants;
    return `<article class="card" id="${esc(c.scenario)}">
<header><p class="eyebrow">${esc(c.policy.method)} · ${esc(c.policy.id)}@${esc(c.policy.version)}</p><h2>${esc(c.name)}</h2><p class="muted">Scenario <code>${esc(c.scenario)}</code> · beside station <code>${esc(c.station)}</code></p></header>
<dl class="facts">
<dt>Data source</dt><dd><strong>Synthetic</strong> demonstrations, labelled so (<code>${esc(c.dataSource.id)}</code>): ${c.dataSource.demosKept} of ${c.dataSource.demosOffered} kept, ${c.dataSource.rows} rows. No learner episode.</dd>
<dt>Seeds</dt><dd>Held-out ${esc(c.seeds.heldOut)} (${c.seeds.n}); demonstrations drawn from other seeds.</dd>
<dt>Invariant violations</dt><dd>${viol.policyViolations === 0 ? "<strong>0</strong>" : `<strong>${viol.policyViolations}</strong> violation steps in ${viol.policyEpisodesWithViolations} of ${viol.of} episodes`} over ${viol.policySteps} steps${viol.policyViolations ? ` (${Object.entries(viol.policyViolationsByRule).map(([k, v]) => `${esc(k)} ${v}`).join(", ")}; a held protective stop repeats every step)` : ""}. Expert: ${viol.expertViolations} in ${viol.expertEpisodesWithViolations} of ${viol.of}. Rules: ${viol.rules.map((x) => `<code>${esc(x)}</code>`).join(", ")}.</dd>
<dt>Lineage</dt><dd><code>${esc(c.lineage.datasetId)}</code> → <code>${esc(c.lineage.policyId)}</code> → 2 measured evals${c.lineage.sites.length ? ` → deployed (sim) to ${c.lineage.sites.map((s) => `<code>${esc(s)}</code>`).join(", ")}` : " → no site deployment"}.</dd>
<dt>Audit chain head</dt><dd><code>${esc(c.lineage.auditHead)}</code> after ${c.lineage.auditLines} lines.</dd>
</dl>
<div class="bars" aria-label="success on ${c.seeds.n} held-out seeds">
${bar("Random floor", r.random.success, "floor")}
${bar("k-NN clone (filtered)", r.bcFiltered.success, "clone")}
${bar("k-NN clone (every demo)", r.bcUnfiltered.success, "clone dim")}
${bar("Scripted expert", r.expert.success, "expert")}
</div>
<p class="gap">Gap to the expert: <strong>${esc(r.gapToExpert)}</strong>${r.gapToExpert > 0.02 ? " — the clone does not reach the expert on this task" : " — the clone matches the expert on this small task"}. Clean episodes: clone ${pct(r.bcFiltered.clean)}, expert ${pct(r.expert.clean)}. Mean steps: clone ${r.bcFiltered.meanSteps}, expert ${r.expert.meanSteps}, random ${r.random.meanSteps}.</p>
<p class="muted small">Files: <code>exports/robotics/${esc(c.scenario)}/</code> (dataset.json, dataset-card.md, lerobot/, rlds/, policy.json, eval-card.json). Measured on ${esc(c.measuredOn)}.</p>
</article>`;
  };

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Robot Policy Evaluation</title>
<meta name="description" content="One card per trained robot policy in the SmartCiti.X Holodeck: scenario, synthetic data source, seeds, success against the random floor and the scripted expert, invariant violations, lineage and the audit chain head. Simulated robots only; no hardware run has happened.">
<style>
:root{--at-bg:#050a10;--at-surface:#0b141d;--at-surface-2:#101b27;--at-raised:#142130;--at-on-surface:#edf6fb;--at-on-surface-muted:#a9c3d2;--at-on-surface-dim:#8aa6b8;--at-primary:#4fd1ff;--at-primary-strong:#7ee6ff;--at-secondary:#a079ff;--at-success:#59c97b;--at-warning:#f2c14b;--at-danger:#f0645b;--at-border:rgba(126,170,200,.16);--at-border-strong:rgba(126,170,200,.36);--at-font-body:"Barlow",system-ui,-apple-system,"Segoe UI",sans-serif;--at-font-display:"Barlow Condensed","Barlow",system-ui,sans-serif;--at-font-mono:ui-monospace,"SFMono-Regular",Menlo,Consolas,monospace;--at-fs-xs:12px;--at-fs-sm:14px;--at-fs-md:16px;--at-fs-lg:19px;--at-fs-xl:23px;--at-fs-2xl:28px;--at-fs-3xl:34px;--at-sp-1:4px;--at-sp-2:8px;--at-sp-3:12px;--at-sp-4:16px;--at-sp-6:24px;--at-sp-8:32px;--at-sp-10:40px;--at-r-sm:6px;--at-r-md:10px;--at-r-lg:14px;--at-measure:68ch;--at-container:1200px;color-scheme:dark}
@media (prefers-color-scheme: light){:root:not([data-theme="dark"]){--at-bg:#f3f7fa;--at-surface:#ffffff;--at-surface-2:#f6fafc;--at-raised:#e9f1f6;--at-on-surface:#0b1822;--at-on-surface-muted:#34505f;--at-on-surface-dim:#4a6574;--at-primary:#006f93;--at-primary-strong:#005a78;--at-secondary:#5b35c4;--at-success:#1d6b36;--at-warning:#8a5a00;--at-danger:#b3261e;--at-border:rgba(20,50,70,.14);--at-border-strong:rgba(20,50,70,.32);color-scheme:light}}
:root[data-theme="light"]{--at-bg:#f3f7fa;--at-surface:#ffffff;--at-surface-2:#f6fafc;--at-raised:#e9f1f6;--at-on-surface:#0b1822;--at-on-surface-muted:#34505f;--at-on-surface-dim:#4a6574;--at-primary:#006f93;--at-primary-strong:#005a78;--at-secondary:#5b35c4;--at-success:#1d6b36;--at-warning:#8a5a00;--at-danger:#b3261e;--at-border:rgba(20,50,70,.14);--at-border-strong:rgba(20,50,70,.32);color-scheme:light}
*{box-sizing:border-box}
body{margin:0;background:var(--at-bg);color:var(--at-on-surface);font:400 var(--at-fs-md)/1.55 var(--at-font-body)}
main{max-width:var(--at-container);margin:0 auto;padding:var(--at-sp-6) 16px var(--at-sp-10)}
h1,h2,h3{font-family:var(--at-font-display);line-height:1.15;margin:0;text-wrap:balance}
h1{font-size:var(--at-fs-3xl)}h2{font-size:var(--at-fs-xl)}
p{margin:0}
code{font-family:var(--at-font-mono);font-size:.85em;background:var(--at-surface-2);padding:.05em .35em;border-radius:4px;overflow-wrap:anywhere}
a{color:var(--at-primary)}
.muted{color:var(--at-on-surface-muted)}.small{font-size:var(--at-fs-sm)}
.eyebrow{font-family:var(--at-font-display);text-transform:uppercase;letter-spacing:.08em;font-size:var(--at-fs-xs);color:var(--at-on-surface-dim);font-weight:600}
.lede{max-width:var(--at-measure);color:var(--at-on-surface-muted);margin-top:var(--at-sp-3)}
.notice{margin-top:var(--at-sp-4);padding:var(--at-sp-3) var(--at-sp-4);border-left:4px solid var(--at-warning);background:var(--at-surface);border-radius:var(--at-r-sm);max-width:var(--at-measure)}
.stats{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:var(--at-sp-3);margin-top:var(--at-sp-6)}
.stat{padding:var(--at-sp-3) var(--at-sp-4);border-radius:var(--at-r-md);background:var(--at-surface-2)}
.stat b{display:block;font-size:var(--at-fs-xl);font-variant-numeric:tabular-nums}
.stat span{font-size:var(--at-fs-sm);color:var(--at-on-surface-muted)}
.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(min(100%,340px),1fr));gap:var(--at-sp-4);margin-top:var(--at-sp-8)}
.card{background:var(--at-surface);border:1px solid var(--at-border);border-radius:var(--at-r-lg);padding:var(--at-sp-4);display:grid;gap:var(--at-sp-3);align-content:start}
.card header{display:grid;gap:var(--at-sp-1)}
.facts{margin:0;display:grid;grid-template-columns:auto 1fr;gap:var(--at-sp-1) var(--at-sp-3);font-size:var(--at-fs-sm)}
.facts dt{color:var(--at-on-surface-dim);font-weight:600}.facts dd{margin:0}
.bars{display:grid;gap:var(--at-sp-2);font-size:var(--at-fs-sm)}
.row{display:grid;grid-template-columns:minmax(0,10em) 1fr 3.5em;gap:var(--at-sp-2);align-items:center}
.lab{color:var(--at-on-surface-muted)}.val{text-align:right;font-variant-numeric:tabular-nums}
.bar{display:block;height:10px;background:var(--at-raised);border-radius:5px;overflow:hidden}
.bar i{display:block;height:100%;background:var(--at-primary);border-radius:5px}
.bar i.floor{background:var(--at-on-surface-dim)}.bar i.expert{background:var(--at-success)}.bar i.dim{opacity:.5}
.gap{font-size:var(--at-fs-sm)}
table{width:100%;border-collapse:collapse;font-size:var(--at-fs-sm);margin-top:var(--at-sp-4)}
th,td{text-align:left;padding:var(--at-sp-2) var(--at-sp-3);border-bottom:1px solid var(--at-border);vertical-align:top}
th{color:var(--at-primary);font-weight:600}
td.num,th.num{text-align:right;font-variant-numeric:tabular-nums}
.scroll{overflow-x:auto}
footer{margin-top:var(--at-sp-10);padding-top:var(--at-sp-4);border-top:1px solid var(--at-border);font-size:var(--at-fs-sm);color:var(--at-on-surface-muted);max-width:var(--at-measure)}
@media (max-width:480px){.row{grid-template-columns:minmax(0,7em) 1fr 3.5em}.facts{grid-template-columns:1fr}}
</style>
</head>
<body>
<main>
<p class="eyebrow">SmartCiti.X Holodeck · robotics programme · policy evaluation</p>
<h1>Robot policy evaluation report</h1>
<p class="lede">One card per trained policy from <code>exports/robotics/</code> (<code>node tools/rb_export.mjs</code>): the scenario, the data it learned from, the seeds it was judged on, its success against a random floor and the scripted expert, the safe-practice invariants it broke, and where it sits in the ENTERPRISE-3 lineage with the audit chain's head. Written by <code>node tools/rb_report.mjs</code>; a static page with no script.</p>
<p class="notice"><strong>Simulated robots only.</strong> Every policy here was trained on synthetic demonstrations (a scripted expert with lapses and action noise, labelled synthetic; no learner episode) and evaluated on the simulated scenario. No hardware run has happened and none is claimed; <code>docs/bench-protocol.md</code> describes how one would be scored.</p>
<div class="stats">
<div class="stat"><b>${n}</b><span>policies, one per gym scenario</span></div>
<div class="stat"><b>${atExpert} of ${n}</b><span>clones within 0.02 of the expert</span></div>
<div class="stat"><b>${cleanClones} of ${n}</b><span>clones with zero violation steps</span></div>
<div class="stat"><b>${cards[0]?.seeds.n ?? 60}</b><span>held-out seeds per policy</span></div>
<div class="stat"><b>${governance.audit.length}</b><span>audit lines, chain ${governance.verify.ok ? "verified" : "BROKEN"}</span></div>
</div>
<div class="scroll"><table>
<thead><tr><th>Policy</th><th>Scenario</th><th class="num">Random</th><th class="num">Clone</th><th class="num">Expert</th><th class="num">Gap</th><th class="num">Violation steps (episodes)</th><th>Audit head</th></tr></thead>
<tbody>
${cards.map((c) => `<tr><td><a href="#${esc(c.scenario)}">${esc(c.policy.id)}</a></td><td>${esc(c.name)}</td><td class="num">${pct(c.results.random.success)}</td><td class="num"><strong>${pct(c.results.bcFiltered.success)}</strong></td><td class="num">${pct(c.results.expert.success)}</td><td class="num">${esc(c.results.gapToExpert)}</td><td class="num">${c.invariants.policyViolations} (${c.invariants.policyEpisodesWithViolations} of ${c.invariants.of})</td><td><code>${esc(c.lineage.auditHead)}</code></td></tr>`).join("\n")}
</tbody></table></div>
<section class="grid" aria-label="policy cards">
${cards.map(card).join("\n")}
</section>
<footer>
<p>Method, named plainly: behaviour cloning with a k-nearest-neighbour classifier over hand-written features (<code>WebXR/shared/col-learn.js</code>). It copies the action the most similar demonstrated moments took; it does not plan and does not generalise beyond its demonstrations. Success figures come from <code>docs/evals/colearn.json</code> (<code>tools/col_eval.mjs</code>); invariant violations are counted live by the exporter over the same seeds. The audit chain is FNV-1a hashed, a local tamper-evidence aid and not cryptographic proof. Registry head <code>${esc(governance.auditHead)}</code>; registry built in memory, no device store read or written. Related: <code>exports/robotics/README.md</code>, <code>docs/bench-protocol.md</code>, <code>docs/learner-data-terms.md</code>, <code>docs/consoles/ROBOEXPORT.md</code>.</p>
</footer>
</main>
</body>
</html>
`;
}

const isMain = process.argv[1]?.endsWith("rb_report.mjs");
if (isMain) {
  const html = rxReportHtml();
  if (process.argv.includes("--check")) {
    const same = existsSync(RX_REPORT_PATH) && readFileSync(RX_REPORT_PATH, "utf8") === html;
    console.log(`rb_report --check: docs/perf/robot-policies.html is ${same ? "current" : "STALE"}`);
    process.exit(same ? 0 : 1);
  }
  writeFileSync(RX_REPORT_PATH, html);
  console.log(`rb_report: wrote docs/perf/robot-policies.html (${html.length} bytes, ${(html.match(/<article/g) ?? []).length} cards, no script)`);
}
