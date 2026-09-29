/**
 * LA-PROGRAMME — writes the Louisiana Development Training Programme page, WebXR/louisiana/index.html, and its handbook,
 * docs/louisiana-programme.md, from WebXR/shared/lp-programme.js (tracks, role pathways, matrix, DEAN templates, simulations),
 * the catalog (station names and cited standards), tools/unions.json and the parish maps in this tree (np-parishes.js) — every
 * map and site id guarded: a place links only when its map is in the tree and the site is on it; otherwise it is listed pending.
 * Static HTML so the page reads with no script and tools/check_la_programme.mjs can verify it.
 *
 *     node tools/gen_la_programme.mjs
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const imp = (f) => import(pathToFileURL(join(ROOT, f)).href);

/** Station ids, simulation ids and a guarded map lookup for this tree. */
export async function lpTreeIds() {
  const catalog = JSON.parse(readFileSync(join(ROOT, "WebXR/smartcity/catalog.json"), "utf8"));
  const lp = await imp("WebXR/shared/lp-programme.js");
  let lookup = () => null;
  try {
    if (!globalThis.localStorage) { const m = new Map(); globalThis.localStorage = { getItem: (k) => (m.has(k) ? m.get(k) : null), setItem: (k, v) => m.set(k, String(v)), removeItem: (k) => m.delete(k), key: (i) => [...m.keys()][i] ?? null, get length() { return m.size; } }; }
    const np = await imp("WebXR/shared/np-parishes.js");
    lookup = (id) => { try { return np.npParish(id) ?? null; } catch (_) { return null; } };
  } catch (_) { lookup = () => null; }
  return { catalog, stations: new Map(catalog.stations.map((s) => [s.id, s])), sims: new Map(lp.LP_SIMS.map((s) => [s.id, s])), lookup };
}

const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

async function main() {
  const lp = await imp("WebXR/shared/lp-programme.js");
  const { COMPETENCY_BY_ID } = await imp("WebXR/shared/competency.js");
  const unions = JSON.parse(readFileSync(join(ROOT, "tools/unions.json"), "utf8")).unions;
  const tree = await lpTreeIds();
  const opts = { stationIds: new Set(tree.stations.keys()), simIds: new Set(tree.sims.keys()), lookup: tree.lookup };
  const sName = (id) => tree.stations.get(id)?.name ?? id;
  const uAbbrev = (id) => unions.find((u) => u.id === id)?.abbrev ?? id;
  const uName = (id) => unions.find((u) => u.id === id)?.name ?? id;
  const sLink = (id) => `<a href="../smartcity/index.html?sim=${encodeURIComponent(id)}&amp;from=louisiana" data-lp-station="${esc(id)}">${esc(sName(id))}</a>`;
  const simTag = (id) => `<span class="at-chip lp-chip" data-lp-sim="${esc(id)}">${esc(lp.lpSim(id)?.name ?? id)}</span>`;
  const uChip = (id) => `<span class="at-chip lp-chip" data-lp-union="${esc(id)}" title="${esc(uName(id))}">${esc(uAbbrev(id))}</span>`;
  const placeHtml = (pl) => `<code data-lp-place="${esc(pl.map)}/${esc(pl.site)}">${esc(pl.site)}</code>`;

  const tracks = lp.LP_TRACKS.map((t) => lp.lpResolve(t, opts));
  const matrix = lp.lpMatrix(opts);
  const templates = lp.lpTemplates(opts);
  const creds = lp.lpCredentialIds(opts);
  const livePlaces = tracks.flatMap((t) => t.places.live), pendingPlaces = tracks.flatMap((t) => t.places.pending);

  const trackHtml = tracks.map((t) => {
    const src = lp.lpTrack(t.id);
    const wt = t.workTypes.map((w) => `
        <tr data-lp-worktype="${esc(t.id)}/${esc(w.id)}">
          <td><q data-lp-facts>${esc(w.facts)}</q><div class="lp-muted">${esc(w.practice)}</div></td>
          <td>${w.crafts.map((c) => `${uChip(c.union)} <span class="lp-muted">${esc(c.role)}</span>`).join("<br>")}</td>
          <td><ul class="lp-list">${w.stations.map((id) => `<li>${sLink(id)}</li>`).join("")}</ul></td>
          <td>${w.sims.map(simTag).join(" ") || "—"}</td>
        </tr>`).join("");
    const maps = src.places.map((p) => {
      const live = t.places.live.filter((x) => x.map === p.map), pend = t.places.pending.filter((x) => x.map === p.map);
      return `<li><code data-lp-map="${esc(p.map)}">${esc(p.map)}</code> — ${live.length ? `walkable: ${live.map(placeHtml).join(" ")}` : ""}${live.length && pend.length ? "; " : ""}${pend.length ? `<span class="lp-muted" data-lp-pending-place>pending until the map is in this build: ${pend.map(placeHtml).join(" ")}</span>` : ""}</li>`;
    }).join("");
    const gaps = (src.gaps ?? []).map((g) => `<p class="lp-muted" data-lp-gap>Not taught yet — ${esc(g.practice)} (<q>${esc(g.facts)}</q>): ${esc(g.note)}.</p>`).join("");
    const notWalk = src.notWalkable?.length ? `<p class="lp-muted">Named in the sources, no map yet: ${src.notWalkable.map(esc).join("; ")}.</p>` : "";
    return `
    <details class="lp-track" id="track-${esc(t.id)}" data-lp-track="${esc(t.id)}">
      <summary><strong>${esc(t.name)}</strong> <span class="lp-muted">${esc(t.where)}</span></summary>
      <p data-lp-figures>What the sources say: ${t.figures.map((f) => `<q data-lp-figure>${esc(f)}</q>`).join(" · ")} <span class="lp-muted">(sources: ${esc(t.source)})</span></p>
      <h4>Where it is walkable</h4>
      <ul class="lp-list">${maps}</ul>
      <p class="lp-muted">The project layout is illustrative; the parish, waterways and towns are real.</p>${notWalk}
      <div class="lp-scroll"><table class="lp-table">
        <thead><tr><th scope="col">Kind of work (the sources' words) and what we teach</th><th scope="col">Crafts (trade reference)</th><th scope="col">Stations</th><th scope="col">Simulations</th></tr></thead>
        <tbody>${wt}
        </tbody>
      </table></div>
      ${gaps}
      <p class="lp-muted">Role pathways: ${src.pathways.map((id) => `<a href="#pathway-${esc(id)}">${esc(lp.lpPathway(id).title)}</a>`).join(" · ")}</p>
    </details>`;
  }).join("\n");

  const pathwayHtml = lp.LP_PATHWAYS.map((p) => {
    const rows = lp.lpPathways(p.id, opts).map((l) => `
          <tr data-lp-pathway="${esc(p.id)}/${esc(l.level)}">
            <th scope="row">${esc(l.title)}</th>
            <td class="num">${l.stations.length}</td><td class="num">${l.capstone.length}</td><td class="num">${l.sims.length}</td>
            <td><span data-lp-credential="${esc(l.credential.id)}">${esc(COMPETENCY_BY_ID[l.credential.id].title)}</span> <span class="lp-muted">${l.credential.overlap + l.capstone.length}/${l.credential.require} mastery runs in the module</span></td>
            <td><code data-lp-module>mod-lp-${esc(p.id)}-${esc(l.level)}</code></td>
          </tr>`).join("");
    return `
    <details class="lp-track" id="pathway-${esc(p.id)}" data-lp-pathwayfamily="${esc(p.id)}">
      <summary><strong>${esc(p.title)}</strong> <span class="lp-muted">${esc(p.kinds)}</span></summary>
      <p>Crafts: ${p.crafts.map((c) => `${uChip(c.union)} <span class="lp-muted">${esc(c.role)}</span>`).join(" · ")}</p>
      <p class="lp-muted">General kinds of work to train, not any employer's hiring. Simulations: ${p.sims.map(simTag).join(" ")}</p>
      <div class="lp-scroll"><table class="lp-table">
        <thead><tr><th scope="col">Level</th><th scope="col" class="num">Stations</th><th scope="col" class="num">Capstone</th><th scope="col" class="num">Simulations</th><th scope="col">Credential</th><th scope="col">DEAN template</th></tr></thead>
        <tbody>${rows}
        </tbody>
      </table></div>
    </details>`;
  }).join("\n");

  const byCell = new Map();
  for (const r of matrix) { const k = `${r.track}|${r.workType}|${r.union}`; (byCell.get(k) ?? byCell.set(k, { ...r, stations: [] }).get(k)).stations.push(r.station); }
  const matrixHtml = [...byCell.values()].map((c) => `
        <tr data-lp-cell="${esc(c.track)}/${esc(c.workType)}/${esc(c.union)}"><td>${esc(lp.lpTrack(c.track).short)}</td><td>${esc(c.workType)}</td><td>${uChip(c.union)}</td><td>${c.stations.map(sLink).join(", ")}</td></tr>`).join("");
  const gapRows = lp.LP_TRACKS.flatMap((t) => (t.gaps ?? []).map((g) => `
        <tr data-lp-gapcell="${esc(t.id)}"><td>${esc(t.short)}</td><td>${esc(g.practice)}</td><td>—</td><td><em>pending — no station yet</em></td></tr>`)).join("");

  const simHtml = lp.LP_SIMS.map((s) => {
    const places = lp.LP_SIM_PLACES.filter((p) => p.sim === s.id);
    return `<li data-lp-simcard="${esc(s.id)}"><strong>${esc(s.name)}</strong> <span class="lp-muted">${s.steps.length} steps · ${s.steps.filter((x) => x.gate).length} order gates · ${s.unions.map(uChip).join(" ")}</span><br><span class="lp-muted">${esc(s.briefing)}</span><br><span class="lp-muted">Plays at: ${places.map((p) => (lp.lpSiteLive(p.map, p.site, tree.lookup) ? placeHtml(p) : `${placeHtml(p)} (pending)`)).join(", ")}</span></li>`;
  }).join("\n      ");

  const live = { stations: [...new Set(templates.flatMap((x) => x.module.lessons.map((l) => l.id)))].sort(), sims: lp.LP_SIMS.map((s) => s.id) };
  const pathOpts = lp.LP_PATHWAYS.map((p) => `<option value="${esc(p.id)}">${esc(p.title)}</option>`).join("");
  const levelOpts = lp.LP_LEVELS.map((l) => `<option value="${esc(l.id)}"${l.id === "appr" ? " selected" : ""}>${esc(l.title)}</option>`).join("");

  const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Louisiana Development Training Programme — SmartCiti.X · Powered by AGI Corp</title>
<meta name="description" content="A training programme an employer, union hall, community college or school district can run for the kinds of work the Louisiana development projects and FastSites describe: project tracks, role pathways, simulations, a competency matrix and DEAN module templates.">
<meta name="generator" content="tools/gen_la_programme.mjs">
<link rel="stylesheet" href="../shared/design.css">
<style>
  body { margin: 0; background: var(--at-bg); }
  main { max-width: var(--at-container); margin: 0 auto; padding: var(--at-sp-6) 16px var(--at-sp-12); }
  section { margin-top: var(--at-sp-10); }
  .lp-scroll { overflow-x: auto; -webkit-overflow-scrolling: touch; }
  .lp-table { width: 100%; border-collapse: collapse; font-size: var(--at-fs-sm); min-width: 640px; }
  .lp-table th, .lp-table td { text-align: left; padding: var(--at-sp-2) var(--at-sp-3); border-bottom: 1px solid var(--at-border); vertical-align: top; }
  .lp-table thead th { color: var(--at-primary); font-weight: var(--at-fw-semibold); }
  td.num, th.num { text-align: right; font-variant-numeric: tabular-nums; }
  .lp-list { margin: 0; padding-left: 16px; }
  .lp-muted { color: var(--at-on-surface-muted); font-size: var(--at-fs-sm); }
  .lp-chip { min-height: 24px; cursor: default; }
  .lp-track { margin: var(--at-sp-3) 0; padding: var(--at-sp-3) var(--at-sp-4); border: 1px solid var(--at-border); border-radius: var(--at-r-md); background: var(--at-surface); overflow-wrap: anywhere; }
  .lp-track summary { cursor: pointer; min-height: 44px; display: flex; flex-wrap: wrap; gap: var(--at-sp-2); align-items: center; }
  .lp-sims { display: grid; gap: var(--at-sp-3); padding: 0; list-style: none; }
  .lp-sims li { background: var(--at-surface); border: 1px solid var(--at-border); border-radius: var(--at-r-md); padding: var(--at-sp-3) var(--at-sp-4); overflow-wrap: anywhere; }
  .lp-form { display: flex; flex-wrap: wrap; gap: var(--at-sp-3); align-items: end; }
  .lp-form label { display: grid; gap: var(--at-sp-1); font-size: var(--at-fs-sm); color: var(--at-on-surface-muted); min-width: 0; max-width: 100%; }
  .lp-form select { width: 100%; max-width: 100%; text-overflow: ellipsis; }
  .lp-form input, .lp-form select { font: inherit; min-height: 44px; padding: 0 var(--at-sp-3); border-radius: var(--at-r-md); border: 1px solid var(--at-border-strong); background: var(--at-surface-2); color: var(--at-on-surface); }
  .lp-out { margin-top: var(--at-sp-3); padding: var(--at-sp-3) var(--at-sp-4); border-radius: var(--at-r-md); background: var(--at-surface-2); }
  main a { color: var(--at-primary); }
  code { overflow-wrap: anywhere; }
  [hidden] { display: none !important; }
</style>
</head>
<body class="at-root">
<a class="home-chip" href="../index.html" aria-label="Back to the homepage">Home</a>
<!-- Generated by tools/gen_la_programme.mjs from WebXR/shared/lp-programme-data.js — edit the data, not this file. -->
<main>
  <p class="at-breadcrumb"><a href="../index.html">Home</a> · Louisiana</p>
  <header class="at-hero">
    <div>
      <p class="at-eyebrow">SmartCiti.X · Powered by AGI Corp · Louisiana</p>
      <h1 class="at-hero__title">${esc(lp.LP_NAME)}</h1>
      <p class="at-hero__lead">One programme an employer, a union hall, a community college or a school district can run for the kinds of work the Louisiana development projects, FastSites site readiness and the growth cities involve. Each track quotes what the sources say, shows where the work is walkable on the maps, and traces it to the crafts, stations and full-procedure simulations that teach it, to a credential on the competency layer.</p>
      <div class="at-hero__actions">
        <a class="at-btn at-btn--primary" href="#tracks">See the project tracks</a>
        <a class="at-btn at-btn--secondary" href="#pathways">Role pathways</a>
        <a class="at-btn at-btn--secondary" href="#cohort">Run a cohort</a>
      </div>
    </div>
  </header>
  <p class="lp-muted" data-lp-nopartner>${esc(lp.LP_NO_PARTNERSHIP)}</p>
  <p class="lp-muted">Figures are quoted only as the sources state them: ${(await imp("WebXR/shared/lp-programme-data.js")).LP_SOURCES.map((s) => `<a href="${esc(s.url)}" rel="noopener">${esc(s.label)}</a>`).join("; ")}. City growth rates are not quoted: the cities are named as places only.</p>

  <section aria-labelledby="h-tracks" id="tracks">
    <div class="at-section-head"><div><h2 id="h-tracks">Project tracks</h2><p>${tracks.length} tracks — the seven projects, FastSites site readiness and the growth cities. ${livePlaces.length} places walkable in this build, ${pendingPlaces.length} pending until their maps merge.</p></div></div>
    ${trackHtml}
  </section>

  <section aria-labelledby="h-pathways" id="pathways">
    <div class="at-section-head"><div><h2 id="h-pathways">Role pathways</h2><p>${lp.LP_PATHWAYS.length} pathways × ${lp.LP_LEVELS.length} levels (awareness and K-12 → pre-apprentice → apprentice → journeyworker refresher → supervisor), each level ending in one of ${creds.length} competencies.</p></div></div>
    ${pathwayHtml}
  </section>

  <section aria-labelledby="h-sims" id="sims">
    <div class="at-section-head"><div><h2 id="h-sims">Simulations</h2><p>${lp.LP_SIMS.length} full-procedure simulations on the project sites; every step is a real station's step, and the order gates are scored.</p></div></div>
    <ul class="lp-sims">
      ${simHtml}
    </ul>
  </section>

  <section aria-labelledby="h-matrix">
    <div class="at-section-head"><div><h2 id="h-matrix">Competency matrix</h2><p>Work type × craft → station: ${byCell.size} cells, ${matrix.length} station links, every one a live catalog station.</p></div></div>
    <div class="lp-scroll"><table class="lp-table">
      <thead><tr><th scope="col">Track</th><th scope="col">Work type</th><th scope="col">Craft</th><th scope="col">Stations</th></tr></thead>
      <tbody>${matrixHtml}${gapRows}
      </tbody>
    </table></div>
  </section>

  <section aria-labelledby="h-cohort" id="cohort">
    <div class="at-section-head"><div><h2 id="h-cohort">Run a cohort</h2><p>Creates the organisation, a cohort with its seats and class code, and the pathway level's module with its due date, on this device. No payment.</p></div></div>
    <form class="lp-form" id="lp-form">
      <label>Organisation<input id="lp-org" type="text" maxlength="80" required placeholder="Your organisation"></label>
      <label>Pathway<select id="lp-path">${pathOpts}</select></label>
      <label>Level<select id="lp-level">${levelOpts}</select></label>
      <label>Seats<input id="lp-seats" type="number" min="1" max="1000" value="20"></label>
      <label>Starts<input id="lp-start" type="date"></label>
      <button class="at-btn at-btn--primary" type="submit">Create the cohort</button>
    </form>
    <div class="lp-out" id="lp-out" role="status" hidden></div>
    <p class="lp-muted">Instructor guides for all ${templates.length} DEAN templates are in the <a href="../../docs/louisiana-programme.md">handbook</a>.</p>
  </section>
  <p class="lp-muted">SmartCiti.X · Powered by AGI Corp</p>
</main>
<script type="application/json" id="lp-live">${JSON.stringify(live)}</script>
<script type="module">
import { lpSetUpCohort, lpLevel } from "../shared/lp-programme.js";
import * as en from "../shared/org.js";
import * as dn from "../shared/dn-modules.js";
const live = JSON.parse(document.getElementById("lp-live").textContent);
const $ = (id) => document.getElementById(id);
$("lp-form").addEventListener("submit", (e) => {
  e.preventDefault();
  const out = $("lp-out"); out.hidden = false; out.textContent = "";
  const r = lpSetUpCohort({ en, dn, stationIds: new Set(live.stations), simIds: new Set(live.sims) }, { orgName: $("lp-org").value.trim(), pathwayId: $("lp-path").value, level: $("lp-level").value, seats: Number($("lp-seats").value) || 20, startDate: $("lp-start").value || null });
  if (!r) { out.textContent = "That cohort could not be created — check the organisation name."; return; }
  const p = document.createElement("p");
  p.textContent = "Class code " + r.classCode + " · " + r.cohort.seats + " seats · module " + r.module.id + " (" + r.module.lessons.length + " lessons, required score " + r.module.requiredScore + ") due " + r.due + (r.sims.length ? " · simulations: " + r.sims.join(", ") : "") + " · " + lpLevel($("lp-level").value).title + ".";
  const a = document.createElement("a"); a.href = "../instructor/index.html"; a.textContent = "Open the instructor console";
  out.append(p, a);
});
</script>
<script type="module">import { ctlMount } from "../shared/controls.js"; ctlMount({ world: "the Louisiana Development Training Programme", except: { move: "A page, not a world: Tab walks the links.", look: "Scroll the page." } });</script>
<script type="module">import { gdMount } from "../shared/guide.js"; gdMount({ root: "../" });</script>
</body>
</html>
`;
  mkdirSync(join(ROOT, "WebXR/louisiana"), { recursive: true });
  writeFileSync(join(ROOT, "WebXR/louisiana/index.html"), html);

  // ---------------------------------------------------------------- handbook
  const md = [];
  md.push(`# ${lp.LP_NAME}`, "", "Generated by `tools/gen_la_programme.mjs` from `WebXR/shared/lp-programme-data.js` — edit the data, not this file. Page: `WebXR/louisiana/index.html`. Gate: `tools/check_la_programme.mjs`. Facts: `docs/sources/la-facts.md` only.", "");
  md.push(lp.LP_NO_PARTNERSHIP, "", "City growth rates are not quoted: Baton Rouge, Lake Charles, Lafayette and Carencro, Monroe and Hammond are named as places only.", "");
  md.push("## How a cohort runs", "", "1. Organisation and cohort with seats (`org.js`; seats are a count; no payment).", "2. The cohort's invite code is the class code.", "3. Load the pathway level's DEAN template (`lpTemplates()`), set the due date and required score, assign it (`lpSetUpCohort()` does all three).", "4. Stations in SmartCiti.X; simulations through PROJECTSIM (`projectsim:<id>`) at their sites once the maps merge.", "5. Debrief and assess with the instructor guide below.", "6. Credential: the level's competency (Open Badges, transcript, xAPI) and the cohort certificate.", "");
  md.push("## Project tracks", "");
  for (const t of tracks) {
    const src = lp.lpTrack(t.id);
    md.push(`### ${t.name}`, "", `**Where:** ${t.where}. **The sources say:** ${t.figures.map((f) => `"${f}"`).join("; ")} (sources: ${t.source}).`, "");
    md.push(`**Walkable:** ${src.places.map((p) => `\`${p.map}\` (${p.sites.map((s) => `\`${s}\``).join(", ")})`).join("; ")} — ${t.places.live.length} live, ${t.places.pending.length} pending until the map is in the tree. The project layout is illustrative; the parish, waterways and towns are real.`, "");
    md.push("| Kind of work (the sources' words) | What we teach | Crafts | Stations | Simulations |", "|---|---|---|---|---|");
    for (const w of t.workTypes) md.push(`| "${w.facts}" | ${w.practice} | ${w.crafts.map((c) => `${uAbbrev(c.union)} (${c.role})`).join("; ")} | ${w.stations.map((id) => `\`${id}\``).join(", ")} | ${w.sims.map((id) => `\`${id}\``).join(", ") || "—"} |`);
    for (const g of src.gaps ?? []) md.push("", `Not taught yet — ${g.practice} ("${g.facts}"): ${g.note}.`);
    md.push("");
  }
  md.push("## Role pathways and instructor guides", "", "| Level | Who | Module score | Due | Content rule |", "|---|---|---|---|---|");
  const rule = { aware: "the pathway's K-12 lessons + who does this work", entry: "first three stations + first simulation", appr: "every station and simulation", jw: "first three stations + every simulation", lead: "every station and simulation; runs the debrief" };
  for (const l of lp.LP_LEVELS) md.push(`| ${l.title} | ${l.who} | ${l.requiredScore} | ${l.dueDays} days | ${rule[l.id]} |`);
  md.push("");
  for (const p of lp.LP_PATHWAYS) {
    md.push(`### ${p.title}`, "", `Kinds of work (general occupational descriptions, not any employer's hiring): ${p.kinds}. Crafts: ${p.crafts.map((c) => `${uAbbrev(c.union)} (${c.role})`).join("; ")}.`, "");
    for (const tpl of templates.filter((x) => x.pathway === p.id)) {
      md.push(`#### \`${tpl.module.id}\` — ${lp.lpLevel(tpl.level).title}`, "");
      md.push(`- **Due:** ${tpl.dueDays} days after the cohort starts · **required score:** ${tpl.module.requiredScore} · **credential:** \`${tpl.credential.id}\` (${COMPETENCY_BY_ID[tpl.credential.id].title})`);
      md.push("- **Objectives:**", ...tpl.guide.objectives.map((o) => `  - ${o}`));
      md.push("- **The practice (each station's cited standards):**", ...tpl.guide.practice.map((x) => `  - \`${x.station}\` ${sName(x.station)}${x.capstone ? " (capstone)" : ""} — ${(tree.stations.get(x.station)?.certification ?? "").split(";")[0].trim()}`));
      if (tpl.guide.simulations.length) md.push("- **Simulations:** " + tpl.guide.simulations.map((s) => `\`${s.launch}\` (pass ${s.passMark}, order gates enforced)`).join(", "));
      md.push("- **Debrief prompts:**", ...tpl.guide.debrief.map((d) => `  - ${d}`));
      md.push(`- **Assessment:** ${tpl.guide.assessment}`, "");
    }
  }
  md.push("## Simulations", "");
  for (const s of lp.LP_SIMS) md.push(`- \`${s.id}\` — ${s.name} (${s.steps.length} steps; stations ${[...new Set(s.steps.map((x) => `\`${x.station}\``))].join(", ")}; plays at ${lp.LP_SIM_PLACES.filter((p) => p.sim === s.id).map((p) => `\`${p.map}/${p.site}\``).join(", ")}, guarded)`);
  md.push("", "## Competency matrix", "", `${byCell.size} cells (work type × craft), ${matrix.length} station links; the page lists every cell.`, "");
  writeFileSync(join(ROOT, "docs/louisiana-programme.md"), md.join("\n"));
  console.log(`Wrote WebXR/louisiana/index.html and docs/louisiana-programme.md — ${tracks.length} tracks, ${lp.LP_PATHWAYS.length} pathways, ${templates.length} DEAN templates, ${byCell.size} matrix cells (${matrix.length} station links), ${lp.LP_SIMS.length} simulations, ${livePlaces.length} live places, ${pendingPlaces.length} pending places`);
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) await main();
