/**
 * ACADEMY — writes the Bay Restoration Academy programme page, WebXR/bayprogram/academy.html, and its
 * handbook, docs/bay-academy.md, from WebXR/shared/ea-academy.js (tracks, pathways, matrix, DEAN
 * templates), the catalog (station names and each station's cited standards), tools/unions.json (union
 * names) and the simulations (PROJECTSIM's PS_SIMS, plus UNIONSIMS' us-unionsims-data.js when it is in
 * this tree — guarded: an id that does not resolve is listed as pending, never linked).
 * Static HTML so the page reads with no script and tools/check_academy.mjs can verify it.
 *
 *     node tools/gen_academy.mjs
 */
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const imp = (f) => import(pathToFileURL(join(ROOT, f)).href);

/** The ids that exist in this tree: catalog stations and simulations (PROJECTSIM + UNIONSIMS when present). */
export async function eaTreeIds() {
  const catalog = JSON.parse(readFileSync(join(ROOT, "WebXR/smartcity/catalog.json"), "utf8"));
  const { PS_SIMS } = await imp("WebXR/shared/ps-projectsim-data.js");
  const sims = new Map(PS_SIMS.map((s) => [s.id, s]));
  if (existsSync(join(ROOT, "WebXR/shared/us-unionsims-data.js"))) {
    try {
      const us = await imp("WebXR/shared/us-unionsims-data.js");
      for (const v of Object.values(us)) if (Array.isArray(v)) for (const s of v) if (s?.id && Array.isArray(s.steps)) sims.set(s.id, s);
    } catch (_) { /* guarded: UNIONSIMS' module shape may differ; its ids stay pending */ }
  }
  return { catalog, stations: new Map(catalog.stations.map((s) => [s.id, s])), sims };
}

const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

async function main() {
  const ea = await imp("WebXR/shared/ea-academy.js");
  const { COMPETENCY_BY_ID } = await imp("WebXR/shared/competency.js");
  const unions = JSON.parse(readFileSync(join(ROOT, "tools/unions.json"), "utf8")).unions;
  const tree = await eaTreeIds();
  const opts = { stationIds: new Set(tree.stations.keys()), simIds: new Set(tree.sims.keys()) };
  const sName = (id) => tree.stations.get(id)?.name ?? id;
  const simName = (id) => tree.sims.get(id)?.name ?? id;
  const uAbbrev = (id) => unions.find((u) => u.id === id)?.abbrev ?? id;
  const uName = (id) => unions.find((u) => u.id === id)?.name ?? id;
  const sLink = (id) => `<a href="../smartcity/index.html?sim=${encodeURIComponent(id)}&amp;from=academy" data-ea-station="${esc(id)}">${esc(sName(id))}</a>`;
  const simTag = (id) => `<span class="at-chip ea-chip" data-ea-sim="${esc(id)}">${esc(simName(id))}</span>`;
  const uChip = (id) => `<span class="at-chip ea-chip" data-ea-union="${esc(id)}" title="${esc(uName(id))}">${esc(uAbbrev(id))}</span>`;
  const cred = (c) => `<span data-ea-credential="${esc(c.id)}">${esc(c.id)}</span>`;

  const tracks = ea.EA_TRACKS.map((t) => ea.eaResolve(t, opts));
  const pending = [...new Set(tracks.flatMap((t) => t.pending))].sort();
  const matrix = ea.eaMatrix(opts);
  const templates = ea.eaTemplates(opts);
  const creds = ea.eaCredentialIds(opts);

  // ---------------------------------------------------------------- tracks
  const trackHtml = tracks.map((t) => {
    const pw = ea.eaPathways(ea.eaTrack(t.id), opts);
    const wt = t.workTypes.map((w) => `
        <tr data-ea-worktype="${esc(t.id)}/${esc(w.id)}">
          <td><q data-ea-facts>${esc(w.facts)}</q><div class="ea-muted">${esc(w.practice)}</div></td>
          <td>${w.crafts.map((c) => `${uChip(c.union)} <span class="ea-muted">${esc(c.role)}</span>`).join("<br>")}</td>
          <td><ul class="ea-list">${w.stations.map((id) => `<li>${sLink(id)}</li>`).join("")}</ul></td>
          <td>${w.sims.map(simTag).join(" ") || "—"}</td>
          <td><ul class="ea-list">${w.k12.map((id) => `<li>${sLink(id)}</li>`).join("") || "—"}</ul></td>
        </tr>`).join("");
    const pwRows = pw.map((p) => `
          <tr data-ea-pathway="${esc(t.id)}/${esc(p.role)}">
            <th scope="row">${esc(p.title)}</th>
            <td class="num">${p.stations.length}</td><td class="num">${p.capstone.length}</td><td class="num">${p.sims.length}</td>
            <td>${cred(p.credential)} <span class="ea-muted">${p.credential.overlap + p.capstone.length}/${p.credential.require} mastery runs in the module</span></td>
            <td><code data-ea-module>mod-ea-${esc(t.short)}-${esc(p.role)}</code></td>
          </tr>`).join("");
    const gaps = (ea.eaTrack(t.id).gaps ?? []).map((g) => `<p class="ea-muted" data-ea-gap>Not taught yet: <q>${esc(g.facts)}</q> — ${esc(g.note)}.</p>`).join("");
    return `
    <details class="ea-track" id="track-${esc(t.id)}" data-ea-track="${esc(t.id)}">
      <summary><strong>${esc(t.recipient)}</strong> <span class="ea-muted">${t.workTypes.length} work types · ${new Set(t.workTypes.flatMap((w) => w.stations)).size} stations · ${new Set(t.workTypes.flatMap((w) => w.sims)).size} simulations</span></summary>
      <div class="ea-scroll"><table class="ea-table">
        <thead><tr><th scope="col">Work type (the sources' words) and what we teach</th><th scope="col">Crafts (trade reference)</th><th scope="col">Stations</th><th scope="col">Simulations</th><th scope="col">K-12 lessons</th></tr></thead>
        <tbody>${wt}
        </tbody>
      </table></div>
      ${gaps}
      <h4>Role pathways</h4>
      <div class="ea-scroll"><table class="ea-table">
        <thead><tr><th scope="col">Role</th><th scope="col" class="num">Stations</th><th scope="col" class="num">Capstone</th><th scope="col" class="num">Simulations</th><th scope="col">Credential</th><th scope="col">DEAN template</th></tr></thead>
        <tbody>${pwRows}
        </tbody>
      </table></div>
    </details>`;
  }).join("\n");

  // ---------------------------------------------------------------- matrix (work type × craft → stations)
  const byCell = new Map();
  for (const r of matrix) { const k = `${r.track}|${r.workType}|${r.union}`; (byCell.get(k) ?? byCell.set(k, { ...r, stations: [] }).get(k)).stations.push(r.station); }
  const matrixHtml = [...byCell.values()].map((c) => `
        <tr data-ea-cell="${esc(c.track)}/${esc(c.workType)}/${esc(c.union)}"><td>${esc(ea.eaTrack(c.track).short)}</td><td>${esc(c.workType)}</td><td>${uChip(c.union)}</td><td>${c.stations.map(sLink).join(", ")}</td></tr>`).join("");

  // ---------------------------------------------------------------- credential ladder
  const ladder = ea.EA_ROLES.map((r) => {
    const ids = [...new Set(tracks.map((t) => ea.eaPathways(ea.eaTrack(t.id), opts).find((p) => p.role === r.id)?.credential.id))];
    return `<li><strong>${esc(r.title)}</strong> <span class="ea-muted">(${esc(r.who)}; module score ${r.requiredScore}, due ${r.dueDays} days after the cohort starts)</span> → ${ids.map((id) => `${cred({ id })} <span class="ea-muted">${esc(COMPETENCY_BY_ID[id].title)}</span>`).join("; ")}</li>`;
  }).join("\n        ");

  const live = { stations: [...new Set(tracks.flatMap((t) => t.workTypes.flatMap((w) => [...w.stations, ...w.k12])).concat(templates.flatMap((x) => x.module.lessons.map((l) => l.id))))].sort(), sims: [...new Set(tracks.flatMap((t) => t.workTypes.flatMap((w) => w.sims)))].sort() };
  const trackOpts = ea.EA_TRACKS.map((t) => `<option value="${esc(t.id)}">${esc(t.recipient)}</option>`).join("");
  const roleOpts = ea.EA_ROLES.map((r) => `<option value="${esc(r.id)}"${r.id === "appr" ? " selected" : ""}>${esc(r.title)}</option>`).join("");

  const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Bay Restoration Academy — SmartCiti.X · Powered by AGI Corp</title>
<meta name="description" content="A training programme an employer, union hall, public agency or school district can run for the restoration work the EPA San Francisco Bay Program awards and the Port of Oakland's Clean Ports program describe: project tracks, role pathways, a competency matrix, DEAN module templates and instructor guides.">
<meta name="generator" content="tools/gen_academy.mjs">
<link rel="stylesheet" href="../shared/design.css">
<style>
  body { margin: 0; background: var(--at-bg); }
  main { max-width: var(--at-container); margin: 0 auto; padding: var(--at-sp-6) 16px var(--at-sp-12); }
  section { margin-top: var(--at-sp-10); }
  .ea-scroll { overflow-x: auto; -webkit-overflow-scrolling: touch; }
  .ea-table { width: 100%; border-collapse: collapse; font-size: var(--at-fs-sm); min-width: 720px; }
  .ea-table th, .ea-table td { text-align: left; padding: var(--at-sp-2) var(--at-sp-3); border-bottom: 1px solid var(--at-border); vertical-align: top; }
  .ea-table thead th { color: var(--at-primary); font-weight: var(--at-fw-semibold); }
  td.num, th.num { text-align: right; font-variant-numeric: tabular-nums; }
  .ea-list { margin: 0; padding-left: 16px; }
  .ea-muted { color: var(--at-on-surface-muted); font-size: var(--at-fs-sm); }
  .ea-chip { min-height: 24px; cursor: default; }
  .ea-track { margin: var(--at-sp-3) 0; padding: var(--at-sp-3) var(--at-sp-4); border: 1px solid var(--at-border); border-radius: var(--at-r-md); background: var(--at-surface); }
  .ea-track summary { cursor: pointer; min-height: 44px; display: flex; flex-wrap: wrap; gap: var(--at-sp-2); align-items: center; }
  .ea-steps { counter-reset: s; list-style: none; padding: 0; display: grid; gap: var(--at-sp-3); grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); }
  .ea-steps li { background: var(--at-surface); border: 1px solid var(--at-border); border-radius: var(--at-r-md); padding: var(--at-sp-3) var(--at-sp-4); }
  .ea-form { display: flex; flex-wrap: wrap; gap: var(--at-sp-3); align-items: end; }
  .ea-form label { display: grid; gap: var(--at-sp-1); font-size: var(--at-fs-sm); color: var(--at-on-surface-muted); }
  .ea-form input, .ea-form select { font: inherit; min-height: 44px; padding: 0 var(--at-sp-3); border-radius: var(--at-r-md); border: 1px solid var(--at-border-strong); background: var(--at-surface-2); color: var(--at-on-surface); }
  .ea-out { margin-top: var(--at-sp-3); padding: var(--at-sp-3) var(--at-sp-4); border-radius: var(--at-r-md); background: var(--at-surface-2); }
  main a { color: var(--at-primary); }
  [hidden] { display: none !important; }
</style>
</head>
<body class="at-root">
<a class="home-chip" href="../index.html" aria-label="Back to the homepage">Home</a>
<!-- Generated by tools/gen_academy.mjs from WebXR/shared/ea-academy.js — edit the data, not this file. -->
<main>
  <p class="at-breadcrumb"><a href="../index.html">Home</a> · <a href="index.html">Bay Program hub</a></p>
  <header class="at-hero">
    <div>
      <p class="at-eyebrow">SmartCiti.X · Powered by AGI Corp · Bay Program</p>
      <h1 class="at-hero__title">${esc(ea.EA_NAME)}</h1>
      <p class="at-hero__lead">One programme an employer, a union hall, a public agency or a school district can run for the restoration work the U.S. EPA's San Francisco Bay Program awards and the Port of Oakland's Clean Ports program describe. Each project track traces the work the sources state, to the crafts that do it, to the stations, simulations and K-12 lessons that teach it, to a credential on the competency layer.</p>
      <div class="at-hero__actions">
        <a class="at-btn at-btn--primary" href="#tracks">See the project tracks</a>
        <a class="at-btn at-btn--secondary" href="#cohort">Run a cohort</a>
      </div>
    </div>
  </header>
  <p class="ea-muted" data-ea-nopartner>${esc(ea.EA_NO_PARTNERSHIP)}</p>
  <p class="ea-muted">The work types are quoted from the sources: ${ea.EA_FACTS_SOURCES.map((s) => `<a href="${esc(s.url)}" rel="noopener">${esc(s.label)}</a>`).join("; ")}. The sources name eight of the twenty projects; the other twelve are not named, placed or trained for here.</p>

  <section aria-labelledby="h-how">
    <div class="at-section-head"><div><h2 id="h-how">How the Academy runs</h2><p>On the layers the platform already has — nothing new to install, no payment in the public build.</p></div></div>
    <ol class="ea-steps">
      <li><strong>1 · Organisation and seats</strong><br><span class="ea-muted">A coordinator creates the organisation and a cohort with its seat count in the <a href="../instructor/index.html">instructor console</a> (org layer). Seat licensing is a seat count; the public build takes no payment.</span></li>
      <li><strong>2 · Class code</strong><br><span class="ea-muted">Each cohort gets an invite code; learners join with it and choose whether to share progress.</span></li>
      <li><strong>3 · Module</strong><br><span class="ea-muted">Load the track's DEAN template for the role, set the due date and the required score, assign it to the class code.</span></li>
      <li><strong>4 · Train</strong><br><span class="ea-muted">Stations in SmartCiti.X, full-procedure simulations on the walkable maps, K-12 lessons in class. Assigned lessons glow on the site boards.</span></li>
      <li><strong>5 · Debrief and assess</strong><br><span class="ea-muted">The instructor guide for each module: objectives, the station's cited practice, debrief prompts, the assessment rule (<a href="../../docs/bay-academy.md">handbook</a>).</span></li>
      <li><strong>6 · Credential</strong><br><span class="ea-muted">Mastery runs demonstrate the pathway's competency: Open Badges, a transcript and an xAPI export from the competency layer, and the cohort certificate.</span></li>
    </ol>
  </section>

  <section aria-labelledby="h-tracks" id="tracks">
    <div class="at-section-head"><div><h2 id="h-tracks">Project tracks</h2><p>${tracks.length} tracks — the eight named EPA projects and Clean Ports — each with its role pathways.</p></div></div>
    ${trackHtml}
  </section>

  <section aria-labelledby="h-ladder">
    <div class="at-section-head"><div><h2 id="h-ladder">Credential ladder</h2><p>Every pathway ends in an existing competency (${creds.length} across the Academy); where the track's own stations do not yet meet its mastery rule, the module adds a capstone from the competency's list.</p></div></div>
    <ul>
        ${ladder}
    </ul>
  </section>

  <section aria-labelledby="h-matrix">
    <div class="at-section-head"><div><h2 id="h-matrix">Competency matrix</h2><p>Work type × craft → station: ${byCell.size} cells, ${matrix.length} station links, every one a live catalog station.</p></div></div>
    <div class="ea-scroll"><table class="ea-table">
      <thead><tr><th scope="col">Track</th><th scope="col">Work type</th><th scope="col">Craft</th><th scope="col">Stations</th></tr></thead>
      <tbody>${matrixHtml}
      </tbody>
    </table></div>
  </section>

  <section aria-labelledby="h-cohort" id="cohort">
    <div class="at-section-head"><div><h2 id="h-cohort">Run a cohort</h2><p>Creates the organisation, a cohort with its seats and class code, and the track's module with its due date, on this device.</p></div></div>
    <form class="ea-form" id="ea-form">
      <label>Organisation<input id="ea-org" type="text" maxlength="80" required placeholder="Your organisation"></label>
      <label>Track<select id="ea-track">${trackOpts}</select></label>
      <label>Role<select id="ea-role">${roleOpts}</select></label>
      <label>Seats<input id="ea-seats" type="number" min="1" max="1000" value="20"></label>
      <label>Starts<input id="ea-start" type="date"></label>
      <button class="at-btn at-btn--primary" type="submit">Create the cohort</button>
    </form>
    <div class="ea-out" id="ea-out" role="status" hidden></div>
  </section>

  <section aria-labelledby="h-pending">
    <div class="at-section-head"><div><h2 id="h-pending">Coming from UNIONSIMS</h2><p>Craft stations and simulations the tracks name that are not in this build yet (${pending.length}). They join their pathways when they land; until then nothing links to them.</p></div></div>
    <p class="ea-muted" data-ea-pending>${pending.map((id) => `<code>${esc(id)}</code>`).join(" ") || "none — every id resolves"}</p>
  </section>
  <p class="ea-muted">SmartCiti.X · Powered by AGI Corp</p>
</main>
<script type="application/json" id="ea-live">${JSON.stringify(live)}</script>
<script type="module">
import { eaSetUpCohort, eaRole } from "../shared/ea-academy.js";
import * as en from "../shared/org.js";
import * as dn from "../shared/dn-modules.js";
const live = JSON.parse(document.getElementById("ea-live").textContent);
const $ = (id) => document.getElementById(id);
$("ea-form").addEventListener("submit", (e) => {
  e.preventDefault();
  const out = $("ea-out"); out.hidden = false; out.textContent = "";
  const r = eaSetUpCohort({ en, dn, stationIds: new Set(live.stations), simIds: new Set(live.sims) }, { orgName: $("ea-org").value.trim(), trackId: $("ea-track").value, role: $("ea-role").value, seats: Number($("ea-seats").value) || 20, startDate: $("ea-start").value || null });
  if (!r) { out.textContent = "That cohort could not be created — check the organisation name."; return; }
  const p = document.createElement("p");
  p.textContent = "Class code " + r.classCode + " · " + r.cohort.seats + " seats · module " + r.module.id + " (" + r.module.lessons.length + " lessons, required score " + r.module.requiredScore + ") due " + r.due + (r.sims.length ? " · simulations: " + r.sims.join(", ") : "") + " · " + eaRole($("ea-role").value).title + ".";
  const a = document.createElement("a"); a.href = "../instructor/index.html"; a.textContent = "Open the instructor console";
  out.append(p, a);
});
</script>
<script type="module">import { ctlMount } from "../shared/controls.js"; ctlMount({ world: "the Bay Restoration Academy", except: { move: "A page, not a world: Tab walks the links.", look: "Scroll the page." } });</script>
<script type="module">import { gdMount } from "../shared/guide.js"; gdMount({ root: "../" });</script>
</body>
</html>
`;
  writeFileSync(join(ROOT, "WebXR/bayprogram/academy.html"), html);

  // ---------------------------------------------------------------- handbook
  const md = [];
  md.push(`# ${ea.EA_NAME}`, "", "Generated by `tools/gen_academy.mjs` from `WebXR/shared/ea-academy.js` — edit the data, not this file. Page: `WebXR/bayprogram/academy.html` (linked from the Bay Program hub). Gate: `tools/check_academy.mjs`.", "");
  md.push(ea.EA_NO_PARTNERSHIP, "", "Sources of every work type quoted below:", ...ea.EA_FACTS_SOURCES.map((s) => `- [${s.label}](${s.url})`), "", "The sources name eight of the twenty projects; the other twelve are not named, placed or trained for here. Where a project's sites are not stated, a map is a representative procedural area chosen by the platform.", "");
  md.push("## How a cohort runs", "", "1. Organisation and cohort with seats (org layer, `WebXR/shared/org.js`; seats are a count; the public build takes no payment).", "2. The cohort's invite code is the class code.", "3. Load the track's DEAN template for the role (`eaTemplates()`), set the due date and required score, assign to the class code (`dnSaveModule`, `dnAssign`); `eaSetUpCohort()` does all three.", "4. Stations in SmartCiti.X, simulations through PROJECTSIM (`projectsim:<id>`), K-12 lessons through SCHOLAR.", "5. Debrief and assess with the instructor guide below.", "6. Credential: the pathway's competency (`competency.js`: Open Badges, transcript, xAPI; `eaCredentials()`), and the cohort certificate (`enCertificateSVG`).", "");
  md.push("## Role pathways and credential ladder", "", "| Role | Who | Module score | Due | Content rule |", "|---|---|---|---|---|");
  const rule = { aware: "the track's K-12 lessons + who does this work", entry: "first station of each work type + first simulation", appr: "every station and simulation", jw: "first station of each work type + every simulation", lead: "every station and simulation; runs the debrief" };
  for (const r of ea.EA_ROLES) md.push(`| ${r.title} | ${r.who} | ${r.requiredScore} | ${r.dueDays} days | ${rule[r.id]} |`);
  md.push("", "Each pathway ends in an existing competency; where the track's stations do not meet its mastery rule, the module adds a **capstone** from that competency's own station list.", "");
  for (const t of tracks) {
    const src = ea.eaTrack(t.id);
    md.push(`## Track: ${t.recipient}`, "");
    md.push("| Work type (the sources' words) | What we teach | Crafts | Stations | Simulations | K-12 |", "|---|---|---|---|---|---|");
    for (const w of t.workTypes) md.push(`| "${w.facts}" | ${w.practice} | ${w.crafts.map((c) => `${uAbbrev(c.union)} (${c.role})`).join("; ")} | ${w.stations.map((id) => `\`${id}\``).join(", ")} | ${w.sims.map((id) => `\`${id}\``).join(", ") || "—"} | ${w.k12.map((id) => `\`${id}\``).join(", ") || "—"} |`);
    for (const g of src.gaps ?? []) md.push("", `Not taught yet: "${g.facts}" — ${g.note}.`);
    if (t.pending.length) md.push("", `Pending (UNIONSIMS, not in this tree yet): ${t.pending.map((id) => `\`${id}\``).join(", ")}.`);
    md.push("", "### Instructor guides", "");
    for (const tpl of templates.filter((x) => x.track === t.id)) {
      md.push(`#### \`${tpl.module.id}\` — ${ea.eaRole(tpl.role).title}`, "");
      md.push(`- **Due:** ${tpl.dueDays} days after the cohort starts · **required score:** ${tpl.module.requiredScore} · **credential:** \`${tpl.credential.id}\` (${COMPETENCY_BY_ID[tpl.credential.id].title})`);
      md.push("- **Objectives:**", ...tpl.guide.objectives.map((o) => `  - ${o}`));
      md.push("- **The practice (each station's cited standards):**", ...tpl.guide.practice.map((p) => `  - \`${p.station}\` ${sName(p.station)}${p.capstone ? " (capstone)" : ""} — ${(tree.stations.get(p.station)?.certification ?? "").split(";")[0].trim()}`));
      if (tpl.guide.simulations.length) md.push("- **Simulations:** " + tpl.guide.simulations.map((s) => `\`${s.sim}\` (pass ${s.passMark}, order gates enforced)`).join(", "));
      md.push("- **Debrief prompts:**", ...tpl.guide.debrief.map((d) => `  - ${d}`));
      md.push(`- **Assessment:** ${tpl.guide.assessment}`, "");
    }
  }
  md.push("## Pending UNIONSIMS ids", "", pending.length ? pending.map((id) => `\`${id}\``).join(", ") : "None — every id resolves.", "");
  writeFileSync(join(ROOT, "docs/bay-academy.md"), md.join("\n"));
  console.log(`Wrote WebXR/bayprogram/academy.html and docs/bay-academy.md — ${tracks.length} tracks, ${templates.length} DEAN templates, ${byCell.size} matrix cells (${matrix.length} station links), ${creds.length} credentials, ${pending.length} pending ids`);
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) await main();
