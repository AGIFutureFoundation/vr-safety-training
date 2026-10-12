/**
 * LA-COHORTS — writes the Louisiana cohort guides page, WebXR/louisiana/cohorts.html, and its handbook, docs/louisiana-cohorts.md,
 * from WebXR/shared/lco-cohorts.js (run sheets from LA-PROGRAMME's DEAN templates and the K-12 classroom guide), the catalog
 * (station names and cited standards) and the flows and games in WebXR/shared/lco-la-flows.js. Static HTML, so the page reads with
 * no script and tools/check_la_cohorts.mjs can verify it; one small script sets up a classroom on this device.
 *
 *     node tools/gen_lco_guides.mjs
 */
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const imp = (f) => import(pathToFileURL(join(ROOT, f)).href);
const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

const catalog = JSON.parse(readFileSync(join(ROOT, "WebXR/smartcity/catalog.json"), "utf8"));
const stations = new Map(catalog.stations.map((s) => [s.id, s]));
const lp = await imp("WebXR/shared/lp-programme.js");
const C = await imp("WebXR/shared/lco-cohorts.js");
const G = await imp("WebXR/shared/lco-la-flows.js");
const opts = { stationIds: new Set(stations.keys()), simIds: new Set(lp.LP_SIMS.map((s) => s.id)) };
const sheets = C.lcoRunSheets(opts);
const k12 = C.lcoClassroomGuide();
const guides = [k12, ...sheets];

const sName = (id) => stations.get(id)?.name ?? id;
function launchName(l) {
  if (!l) return "";
  if (l.type === "station") return `station — ${sName(l.id)}`;
  if (l.type === "sim") return `simulation — ${lp.lpSim(l.id)?.name ?? l.id}`;
  if (l.type === "flow") return `flow — ${l.id}`;
  if (l.type === "game") return `game — ${G.lcoApplyGame(l.id)?.title ?? l.id}`;
  if (l.type === "lesson") return `lesson — ${l.id}`;
  return l.id;
}
function launchHtml(l) {
  if (!l) return "";
  if (l.type === "station") return `<a href="../smartcity/index.html?sim=${esc(l.id)}&amp;from=louisiana" data-lco-launch="station:${esc(l.id)}">${esc(launchName(l))}</a>`;
  if (l.type === "flow") return `<a href="../flows/${esc(l.id)}.json" data-lco-launch="flow:${esc(l.id)}">${esc(launchName(l))}</a>`;
  return `<span data-lco-launch="${esc(l.type)}:${esc(l.id)}">${esc(launchName(l))}</span>`;
}

function guideHtml(g) {
  const sess = g.sessions.map((s) => `
        <li><strong>${esc(s.title)}</strong> <span class="lp-muted">${s.minutes} minutes planned</span>
          <ol class="lco-blocks">${s.blocks.map((b) => `<li><span class="lco-min">${b.minutes} min</span> ${esc(b.what)}${b.launch ? ` <span class="lp-muted">→ ${launchHtml(b.launch)}</span>` : ""}</li>`).join("")}</ol></li>`).join("");
  return `
    <details class="lp-track" id="${esc(g.id)}" data-lco-guide="${esc(g.id)}">
      <summary><strong>${esc(g.title)}</strong> <span class="lp-muted">${g.sessions.length} sessions · module <code>${esc(g.module)}</code> · score ${g.requiredScore} · due in ${g.dueDays} days${g.credential ? ` · competency <code>${esc(g.credential)}</code>` : ""}</span></summary>
      <p><strong>For:</strong> ${esc(g.who)}. <strong>Run by:</strong> ${esc(g.audience)}.</p>
      ${g.places?.length ? `<p class="lp-muted"><strong>Where the work is on the maps:</strong> ${esc(g.places.join("; "))}</p>` : ""}
      <h4>Roles</h4><ul class="lp-list">${g.roles.map((r) => `<li><strong>${esc(r.role)}</strong> — ${esc(r.does)}</li>`).join("")}</ul>
      <h4>Before the first session</h4><ul class="lp-list">${g.prep.map((x) => `<li>${esc(x)}</li>`).join("")}</ul>
      <h4>Sessions</h4><ol class="lp-list">${sess}</ol>
      <h4>Debrief prompts</h4><ul class="lp-list">${g.debrief.map((x) => `<li>${esc(x)}</li>`).join("")}</ul>
      <h4>Assessment</h4><p>${esc(g.assessment)}</p>
      <h4>Close-out</h4><ul class="lp-list">${g.closeout.map((x) => `<li>${esc(x)}</li>`).join("")}</ul>
    </details>`;
}

const byPath = lp.LP_PATHWAYS.map((p) => `
  <section aria-labelledby="h-${esc(p.id)}" id="path-${esc(p.id)}">
    <div class="at-section-head"><div><h2 id="h-${esc(p.id)}">${esc(p.title)}</h2><p>${esc(p.kinds.charAt(0).toUpperCase() + p.kinds.slice(1))}. One run sheet per level.</p></div></div>
    ${sheets.filter((g) => g.pathway === p.id).map(guideHtml).join("")}
  </section>`).join("");

const M = C.LCO_MINUTES;
const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Louisiana Cohort Guides — SmartCiti.X · Powered by AGI Corp</title>
<meta name="description" content="Run sheets a teacher or a union hall can follow to run the Louisiana Development Training Programme with a cohort: preparation, roles, timed sessions that launch real stations, simulations, flows and games, debrief, assessment and close-out.">
<meta name="generator" content="tools/gen_lco_guides.mjs">
<link rel="stylesheet" href="../shared/design.css">
<style>
  body { margin: 0; background: var(--at-bg); }
  main { max-width: var(--at-container); margin: 0 auto; padding: var(--at-sp-6) 16px var(--at-sp-12); }
  section { margin-top: var(--at-sp-10); }
  .lp-list { margin: 0; padding-left: 20px; }
  .lp-muted { color: var(--at-on-surface-muted); font-size: var(--at-fs-sm); }
  .lp-track { margin: var(--at-sp-3) 0; padding: var(--at-sp-3) var(--at-sp-4); border: 1px solid var(--at-border); border-radius: var(--at-r-md); background: var(--at-surface); overflow-wrap: anywhere; }
  .lp-track summary { cursor: pointer; min-height: 44px; display: flex; flex-wrap: wrap; gap: var(--at-sp-2); align-items: center; }
  .lp-track h4 { margin: var(--at-sp-4) 0 var(--at-sp-2); color: var(--at-primary); }
  .lco-blocks { margin: var(--at-sp-2) 0 var(--at-sp-3); padding-left: 20px; }
  .lco-blocks li { margin: var(--at-sp-1) 0; }
  .lco-min { display: inline-block; min-width: 4.2em; font-variant-numeric: tabular-nums; color: var(--at-on-surface-muted); }
  .lp-form { display: flex; flex-wrap: wrap; gap: var(--at-sp-3); align-items: end; }
  .lp-form label { display: grid; gap: var(--at-sp-1); font-size: var(--at-fs-sm); color: var(--at-on-surface-muted); min-width: 0; max-width: 100%; }
  .lp-form input { font: inherit; min-height: 44px; padding: 0 var(--at-sp-3); border-radius: var(--at-r-md); border: 1px solid var(--at-border-strong); background: var(--at-surface-2); color: var(--at-on-surface); max-width: 100%; }
  .lp-out { margin-top: var(--at-sp-3); padding: var(--at-sp-3) var(--at-sp-4); border-radius: var(--at-r-md); background: var(--at-surface-2); }
  main a { color: var(--at-primary); }
  code { overflow-wrap: anywhere; }
  [hidden] { display: none !important; }
</style>
</head>
<body class="at-root">
<a class="home-chip" href="../index.html" aria-label="Back to the homepage">Home</a>
<!-- Generated by tools/gen_lco_guides.mjs from WebXR/shared/lco-cohorts.js — edit the module, not this file. -->
<main>
  <p class="at-breadcrumb"><a href="../index.html">Home</a> · <a href="index.html">Louisiana</a> · Cohort guides</p>
  <header class="at-hero">
    <div>
      <p class="at-eyebrow">SmartCiti.X · Powered by AGI Corp · Louisiana</p>
      <h1 class="at-hero__title">Cohort guides</h1>
      <p class="at-hero__lead">Run sheets a teacher or a union hall can follow to run ${esc(lp.LP_NAME)} with a room of people: what to prepare, who does what, each session in order with timed blocks that open real stations, simulations, lesson flows and games, then the debrief, the assessment and the close-out. ${guides.length} guides: a K-12 classroom guide for the six Louisiana lessons, and a run sheet for each of the ${sheets.length} DEAN templates (${lp.LP_PATHWAYS.length} pathways × ${lp.LP_LEVELS.length} levels).</p>
      <div class="at-hero__actions">
        <a class="at-btn at-btn--primary" href="#lco-guide-la-k12">K-12 classroom guide</a>
        <a class="at-btn at-btn--secondary" href="#path-${esc(lp.LP_PATHWAYS[0].id)}">Union hall run sheets</a>
        <a class="at-btn at-btn--secondary" href="index.html#cohort">Set up a pathway cohort</a>
      </div>
    </div>
  </header>
  <p class="lp-muted" data-lp-nopartner>${esc(lp.LP_NO_PARTNERSHIP)}</p>
  <p class="lp-muted">Minutes are this guide's planning allowances (a station about ${M.station}, a simulation about ${M.sim}, an opening ${M.opening} and a debrief ${M.debrief}; a session is split before ${C.LCO_SESSION_CAP}), not facts about any place or programme. Every practice is taught from each station's own cited safety standards.</p>

  <section aria-labelledby="h-k12" id="k12">
    <div class="at-section-head"><div><h2 id="h-k12">K-12 classroom</h2><p>Six lessons, one per session: look at the place, run the station, answer one check question, play a two-minute game, close on the learner's own words.</p></div></div>
    ${guideHtml(k12)}
    <form class="lp-form" id="lco-form" aria-label="Set up a classroom">
      <label>School or organisation<input id="lco-org" required maxlength="80" autocomplete="organization"></label>
      <label>Seats<input id="lco-seats" type="number" min="1" max="200" value="30"></label>
      <label>Start date<input id="lco-start" type="date"></label>
      <button class="at-btn at-btn--primary" type="submit">Set up the classroom</button>
    </form>
    <div class="lp-out" id="lco-out" role="status" hidden></div>
  </section>
${byPath}
  <p class="lp-muted">${esc(C.LCO_BRAND)}</p>
</main>
<script type="application/json" id="lco-module">${JSON.stringify(C.lcoClassroomModule())}</script>
<script type="module">
import * as en from "../shared/org.js";
import * as dn from "../shared/dn-modules.js";
const $ = (id) => document.getElementById(id);
const mod = JSON.parse($("lco-module").textContent);
const programmes = ${JSON.stringify([...new Set((await imp("WebXR/shared/lk-la-lessons.js")).LK_LESSONS.map((l) => l.programme))])};
$("lco-form").addEventListener("submit", (e) => {
  e.preventDefault();
  const out = $("lco-out"); out.hidden = false; out.textContent = "";
  const name = $("lco-org").value.trim();
  const org = en.enOrgs().find((o) => o.name === name) ?? en.enCreateOrg({ name, programmes });
  let cohort = null;
  for (const programme of programmes) { cohort = org && en.enCreateCohort({ orgId: org.id, name: "K-12 Louisiana lessons", programme, edition: ${JSON.stringify(lp.LP_NAME)}, startDate: $("lco-start").value || null, seats: Number($("lco-seats").value) || 30 }); if (cohort) break; }
  if (!cohort) { out.textContent = "That classroom could not be created — check the organisation name."; return; }
  const d = new Date(cohort.startDate + "T00:00:00Z"); d.setUTCDate(d.getUTCDate() + 14);
  const m = dn.dnSaveModule({ ...mod, due: d.toISOString().slice(0, 10) });
  dn.dnAssign(m.id, cohort.code);
  const p = document.createElement("p");
  p.textContent = "Class code " + cohort.code + " · " + cohort.seats + " seats · module " + m.id + " (" + m.lessons.length + " lessons) due " + m.due + ".";
  const a = document.createElement("a"); a.href = "../instructor/index.html"; a.textContent = "Open the instructor console";
  out.append(p, a);
});
</script>
<script type="module">import { ctlMount } from "../shared/controls.js"; ctlMount({ world: "the Louisiana cohort guides", except: { move: "A page, not a world: Tab walks the links.", look: "Scroll the page." } });</script>
<script type="module">import { gdMount } from "../shared/guide.js"; gdMount({ root: "../" });</script>
</body>
</html>
`;
mkdirSync(join(ROOT, "WebXR/louisiana"), { recursive: true });
writeFileSync(join(ROOT, "WebXR/louisiana/cohorts.html"), html);

// ---------------------------------------------------------------- handbook
const md = [`# Louisiana cohort guides`, "",
  "Generated by `tools/gen_lco_guides.mjs` from `WebXR/shared/lco-cohorts.js` — edit the module, not this file. Page: `WebXR/louisiana/cohorts.html`. Gate: `tools/check_la_cohorts.mjs`. SmartCiti.X Powered by AGI Corp.", "",
  `> ${lp.LP_NO_PARTNERSHIP}`, "",
  `Minutes are this guide's planning allowances, not facts about any place or programme. ${guides.length} guides: the K-12 classroom guide and ${sheets.length} run sheets, one per DEAN template of \`lp-programme.js\`.`, ""];
for (const g of guides) {
  md.push(`## ${g.title}`, "", `\`${g.id}\` · module \`${g.module}\` · score ${g.requiredScore} · due in ${g.dueDays} days${g.credential ? ` · competency \`${g.credential}\`` : ""}`, "",
    `- **For:** ${g.who}. **Run by:** ${g.audience}.`,
    "- **Roles:**", ...g.roles.map((r) => `  - ${r.role} — ${r.does}`),
    "- **Before the first session:**", ...g.prep.map((x) => `  - ${x}`),
    "- **Sessions:**");
  for (const s of g.sessions) {
    md.push(`  ${s.n}. ${s.title} (${s.minutes} minutes planned)`);
    for (const b of s.blocks) md.push(`     - ${b.minutes} min — ${b.what}${b.launch ? ` → ${launchName(b.launch)} (\`${b.launch.id}\`)` : ""}`);
  }
  md.push("- **Debrief prompts:**", ...g.debrief.map((x) => `  - ${x}`), `- **Assessment:** ${g.assessment}`, "- **Close-out:**", ...g.closeout.map((x) => `  - ${x}`), "");
}
writeFileSync(join(ROOT, "docs/louisiana-cohorts.md"), md.join("\n"));
console.log(`gen_lco_guides: ${guides.length} guides (${sheets.length} run sheets + the K-12 classroom guide) → WebXR/louisiana/cohorts.html, docs/louisiana-cohorts.md`);
