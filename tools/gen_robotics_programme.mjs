/**
 * ROBOPROG — writes the Holodeck Robotics & Human–Robot Collaboration Programme page, WebXR/robotics/programme.html, and its
 * handbook, docs/robotics-programme.md, from WebXR/shared/rp-programme.js (tracks, the five-level ladder, robot-station
 * coverage, the demonstration → policy → evaluation loop, DEAN templates with instructor guides) and the catalog (station names
 * and cited sources). Static HTML so the page reads with no script and tools/check_robotics_programme.mjs can verify it.
 * Station ids not in this tree are listed as pending, never linked.
 *
 *     node tools/gen_robotics_programme.mjs
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const imp = (f) => import(pathToFileURL(join(ROOT, f)).href);
const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/** Catalog station ids, and the guarded COLEARN / DATAWORKS modules (null when not in this tree). */
export async function rpTreeIds() {
  const catalog = JSON.parse(readFileSync(join(ROOT, "WebXR/smartcity/catalog.json"), "utf8"));
  const tryImp = async (f) => { if (!existsSync(join(ROOT, f))) return null; try { return await imp(f); } catch (_) { return null; } };
  if (!globalThis.localStorage) { const m = new Map(); globalThis.localStorage = { getItem: (k) => (m.has(k) ? m.get(k) : null), setItem: (k, v) => m.set(k, String(v)), removeItem: (k) => m.delete(k), key: (i) => [...m.keys()][i] ?? null, get length() { return m.size; } }; }
  return { catalog, stations: new Map(catalog.stations.map((s) => [s.id, s])), dx: await tryImp("WebXR/shared/dx-data.js"), col: await tryImp("WebXR/shared/col-learn.js") };
}

async function main() {
  const rp = await imp("WebXR/shared/rp-programme.js");
  const { COMPETENCY_BY_ID } = await imp("WebXR/shared/competency.js");
  const tree = await rpTreeIds();
  const opts = { stationIds: new Set(tree.stations.keys()) };
  const sName = (id) => tree.stations.get(id)?.name ?? id;
  const sLink = (id) => `<a href="../smartcity/index.html?sim=${encodeURIComponent(id)}&amp;from=robotics-programme" data-rp-station="${esc(id)}">${esc(sName(id))}</a>${rp.rpIsRobotStation(id) ? ' <span class="at-chip rp-chip" data-rp-robot>robot</span>' : ""}`;
  const cov = rp.rpCoverage(opts);
  const templates = rp.rpTemplates(opts);
  const creds = rp.rpCredentialIds(opts);
  const loop = rp.rpLoop({ dx: tree.dx, col: tree.col });
  const stdLabel = (id) => rp.RP_STANDARDS.find((s) => s.id === id)?.label ?? id;

  const trackHtml = rp.RP_TRACKS.map((t) => {
    const rows = rp.rpLadder(t.id, opts).map((l) => `
          <tr data-rp-level="${esc(t.id)}/${esc(l.level)}">
            <th scope="row">${esc(l.title)}</th>
            <td><ul class="rp-list">${l.stations.map((id) => `<li>${sLink(id)}</li>`).join("")}${l.capstone.map((id) => `<li>${sLink(id)} <span class="rp-muted">(capstone)</span></li>`).join("")}</ul>${l.pending.length ? `<p class="rp-muted" data-rp-pending>pending in this build: ${l.pending.map((id) => `<code>${esc(id)}</code>`).join(" ")}</p>` : ""}</td>
            <td class="num" data-rp-robotcount>${l.robotStations.length}</td>
            <td><span data-rp-credential="${esc(l.credential?.id ?? "")}">${esc(l.credential ? COMPETENCY_BY_ID[l.credential.id].title : "—")}</span> <span class="rp-muted">${l.credential ? `${l.credential.overlap + l.capstone.length}/${l.credential.require} mastery runs in the module` : ""}</span>${l.loop ? ` <span class="at-chip rp-chip" data-rp-loop="${esc(l.loop.scenario)}">loop: ${esc(l.loop.scenario)}</span>` : ""}</td>
            <td><code data-rp-module>mod-rp-${esc(t.id)}-${esc(l.level)}</code></td>
          </tr>`).join("");
    return `
    <details class="rp-track" id="track-${esc(t.id)}" data-rp-track="${esc(t.id)}">
      <summary><strong>${esc(t.title)}</strong> <span class="rp-muted">${esc(t.kinds)}</span></summary>
      <p class="rp-muted">Standards named (no clause quoted): ${t.standards.map((s) => esc(stdLabel(s).split(" — ")[0])).join(" · ")}. Robotics gym scenario: <code>${esc(t.scenario)}</code>${t.rbSites.length ? `; robot sites in the open worlds: ${t.rbSites.map((s) => `<code>${esc(s)}</code>`).join(" ")}` : ""}.</p>
      <div class="rp-scroll"><table class="rp-table">
        <thead><tr><th scope="col">Level</th><th scope="col">Stations</th><th scope="col" class="num">Robot stations</th><th scope="col">Credential</th><th scope="col">DEAN template</th></tr></thead>
        <tbody>${rows}
        </tbody>
      </table></div>
    </details>`;
  }).join("\n");

  const covRows = rp.RP_LEVELS.map((l) => `<tr data-rp-coverage="${esc(l.id)}"><th scope="row">${esc(l.title)}</th><td class="num">${cov.byLevel[l.id].covered}/${cov.byLevel[l.id].of}</td><td class="num">${cov.byLevel[l.id].robot}</td></tr>`).join("");
  const loopHtml = loop.map((s) => `<li data-rp-loopstep="${esc(s.id)}"><strong>${esc(s.title)}</strong> <span class="rp-muted">— <code>${esc(s.module)}</code> <code>${esc(s.fn)}()</code>${s.live ? "" : " (pending in this build)"}; taught at ${sLink(s.station)}</span><br><span class="rp-muted">${esc(s.what)}</span></li>`).join("\n      ");
  const live = { stations: [...new Set(templates.flatMap((x) => x.module.lessons.map((l) => l.id)))].sort() };
  const trackOpts = rp.RP_TRACKS.map((t) => `<option value="${esc(t.id)}">${esc(t.title)}</option>`).join("");
  const levelOpts = rp.RP_LEVELS.map((l) => `<option value="${esc(l.id)}"${l.id === "operator" ? " selected" : ""}>${esc(l.title)}</option>`).join("");
  const newStations = rp.RP_NEW_STATIONS.filter((id) => tree.stations.has(id));

  const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Robotics Programme — SmartCiti.X Holodeck · Powered by AGI Corp</title>
<meta name="description" content="The Holodeck Robotics & Human–Robot Collaboration Programme: six tracks, a five-level ladder from awareness to AI-training specialist, robot stations at every level, a demonstration → policy → evaluation loop under consent, and DEAN cohort templates.">
<meta name="generator" content="tools/gen_robotics_programme.mjs">
<link rel="stylesheet" href="../shared/design.css">
<style>
  body { margin: 0; background: var(--at-bg); }
  main { max-width: var(--at-container); margin: 0 auto; padding: var(--at-sp-6) 16px var(--at-sp-12); }
  section { margin-top: var(--at-sp-10); }
  .rp-scroll { overflow-x: auto; -webkit-overflow-scrolling: touch; }
  .rp-table { width: 100%; border-collapse: collapse; font-size: var(--at-fs-sm); min-width: 640px; }
  .rp-table.rp-small { min-width: 0; max-width: 520px; }
  .rp-table th, .rp-table td { text-align: left; padding: var(--at-sp-2) var(--at-sp-3); border-bottom: 1px solid var(--at-border); vertical-align: top; }
  .rp-table thead th { color: var(--at-primary); font-weight: var(--at-fw-semibold); }
  td.num, th.num { text-align: right; font-variant-numeric: tabular-nums; }
  .rp-list { margin: 0; padding-left: 16px; }
  .rp-muted { color: var(--at-on-surface-muted); font-size: var(--at-fs-sm); }
  .rp-chip { min-height: 22px; cursor: default; }
  .rp-track { margin: var(--at-sp-3) 0; padding: var(--at-sp-3) var(--at-sp-4); border: 1px solid var(--at-border); border-radius: var(--at-r-md); background: var(--at-surface); overflow-wrap: anywhere; }
  .rp-track summary { cursor: pointer; min-height: 44px; display: flex; flex-wrap: wrap; gap: var(--at-sp-2); align-items: center; }
  .rp-loop { display: grid; gap: var(--at-sp-3); padding: 0; list-style: none; }
  .rp-loop li { background: var(--at-surface); border: 1px solid var(--at-border); border-radius: var(--at-r-md); padding: var(--at-sp-3) var(--at-sp-4); overflow-wrap: anywhere; }
  .rp-form { display: flex; flex-wrap: wrap; gap: var(--at-sp-3); align-items: end; }
  .rp-form label { display: grid; gap: var(--at-sp-1); font-size: var(--at-fs-sm); color: var(--at-on-surface-muted); min-width: 0; max-width: 100%; }
  .rp-form select { width: 100%; max-width: 100%; text-overflow: ellipsis; }
  .rp-form input, .rp-form select { font: inherit; min-height: 44px; padding: 0 var(--at-sp-3); border-radius: var(--at-r-md); border: 1px solid var(--at-border-strong); background: var(--at-surface-2); color: var(--at-on-surface); }
  .rp-out { margin-top: var(--at-sp-3); padding: var(--at-sp-3) var(--at-sp-4); border-radius: var(--at-r-md); background: var(--at-surface-2); }
  main a { color: var(--at-primary); }
  code { overflow-wrap: anywhere; }
  [hidden] { display: none !important; }
</style>
</head>
<body class="at-root">
<a class="home-chip" href="../index.html" aria-label="Back to the homepage">Home</a>
<!-- Generated by tools/gen_robotics_programme.mjs from WebXR/shared/rp-programme-data.js — edit the data, not this file. -->
<main>
  <p class="at-breadcrumb"><a href="../index.html">Home</a> · Robotics programme</p>
  <header class="at-hero">
    <div>
      <p class="at-eyebrow">${esc(rp.RP_BRAND)}</p>
      <h1 class="at-hero__title">${esc(rp.RP_NAME)}</h1>
      <p class="at-hero__lead">One programme an employer, a training centre, a union hall or a school can run for people who work beside robots: industrial cells, cobots, AMRs, construction robots, robot maintenance and the data and AI-training roles. Five levels — awareness / K-12, robot operator, technician, integrator / safety lead and AI-training specialist — each made of scored stations and ending in a credential on the competency layer.</p>
      <div class="at-hero__actions">
        <a class="at-btn at-btn--primary" href="#tracks">See the tracks</a>
        <a class="at-btn at-btn--secondary" href="#loop">The learning loop</a>
        <a class="at-btn at-btn--secondary" href="#cohort">Run a cohort</a>
      </div>
    </div>
  </header>
  <p class="rp-muted" data-rp-nopartner>${esc(rp.RP_NO_PARTNERSHIP)}</p>

  <section aria-labelledby="h-coverage" id="coverage">
    <div class="at-section-head"><div><h2 id="h-coverage">Robot stations at every level</h2><p>A level counts as covered when at least one of its own stations (capstones not counted) puts a robot at the centre of the practice; an AI-training level also needs a station from the learning loop. ${cov.covered} of ${cov.of} track levels are covered in this build.</p></div></div>
    <div class="rp-scroll"><table class="rp-table rp-small">
      <thead><tr><th scope="col">Level</th><th scope="col" class="num">Tracks covered</th><th scope="col" class="num">Robot-station places</th></tr></thead>
      <tbody>${covRows}</tbody>
    </table></div>
    <p class="rp-muted">New stations written for the gaps: ${newStations.map(sLink).join(" · ") || "none in this build"}.</p>
  </section>

  <section aria-labelledby="h-tracks" id="tracks">
    <div class="at-section-head"><div><h2 id="h-tracks">Tracks and the ladder</h2><p>${rp.RP_TRACKS.length} tracks × ${rp.RP_LEVELS.length} levels, each level ending in one of ${creds.length} competencies.</p></div></div>
    ${trackHtml}
  </section>

  <section aria-labelledby="h-loop" id="loop">
    <div class="at-section-head"><div><h2 id="h-loop">The learning loop at the AI-training level</h2><p>People demonstrate, a robot policy learns from the demonstrations, the policy is evaluated on seeds it never saw, and the robot demonstrates back. Each mechanism is named for what it is.</p></div></div>
    <ul class="rp-loop">
      ${loopHtml}
    </ul>
    <p class="rp-muted" data-rp-consent>Training data is collected only with opt-in consent from signed-in adults — never in K-12, demo or signed-out sessions. It stays on the device (there is no upload endpoint), and revoking consent deletes it and marks dependent policies stale.</p>
  </section>

  <section aria-labelledby="h-cohort" id="cohort">
    <div class="at-section-head"><div><h2 id="h-cohort">Run a cohort</h2><p>Creates the organisation, a cohort with its seats and class code, and the level's module with its due date, on this device. No payment.</p></div></div>
    <form class="rp-form" id="rp-form">
      <label>Organisation<input id="rp-org" type="text" maxlength="80" required placeholder="Your organisation"></label>
      <label>Track<select id="rp-track">${trackOpts}</select></label>
      <label>Level<select id="rp-level">${levelOpts}</select></label>
      <label>Seats<input id="rp-seats" type="number" min="1" max="1000" value="12"></label>
      <label>Starts<input id="rp-start" type="date"></label>
      <button class="at-btn at-btn--primary" type="submit">Create the cohort</button>
    </form>
    <div class="rp-out" id="rp-out" role="status" hidden></div>
    <p class="rp-muted">Instructor guides for all ${templates.length} DEAN templates are in the <a href="../../docs/robotics-programme.md">handbook</a>.</p>
  </section>
  <p class="rp-muted">${esc(rp.RP_BRAND)}</p>
</main>
<script type="application/json" id="rp-live">${JSON.stringify(live)}</script>
<script type="module">
import { rpSetUpCohort, rpLevel } from "../shared/rp-programme.js";
import * as en from "../shared/org.js";
import * as dn from "../shared/dn-modules.js";
const live = JSON.parse(document.getElementById("rp-live").textContent);
const $ = (id) => document.getElementById(id);
$("rp-form").addEventListener("submit", (e) => {
  e.preventDefault();
  const out = $("rp-out"); out.hidden = false; out.textContent = "";
  const r = rpSetUpCohort({ en, dn, stationIds: new Set(live.stations) }, { orgName: $("rp-org").value.trim(), trackId: $("rp-track").value, level: $("rp-level").value, seats: Number($("rp-seats").value) || 12, startDate: $("rp-start").value || null });
  if (!r) { out.textContent = "That cohort could not be created — check the organisation name."; return; }
  const p = document.createElement("p");
  p.textContent = "Class code " + r.classCode + " · " + r.cohort.seats + " seats · module " + r.module.id + " (" + r.module.lessons.length + " lessons, required score " + r.module.requiredScore + ") due " + r.due + " · " + rpLevel($("rp-level").value).title + ".";
  const a = document.createElement("a"); a.href = "../instructor/index.html"; a.textContent = "Open the instructor console";
  out.append(p, a);
});
</script>
<script type="module">import { ctlMount } from "../shared/controls.js"; ctlMount({ world: "the Robotics Programme", except: { move: "A page, not a world: Tab walks the links.", look: "Scroll the page." } });</script>
<script type="module">import { gdMount } from "../shared/guide.js"; gdMount({ root: "../" });</script>
</body>
</html>
`;
  mkdirSync(join(ROOT, "WebXR/robotics"), { recursive: true });
  writeFileSync(join(ROOT, "WebXR/robotics/programme.html"), html);

  // ---------------------------------------------------------------- handbook
  const md = [];
  md.push(`# ${rp.RP_NAME}`, "", `${rp.RP_BRAND}. Generated by \`tools/gen_robotics_programme.mjs\` from \`WebXR/shared/rp-programme-data.js\` — edit the data, not this file. Page: \`WebXR/robotics/programme.html\`. Gate: \`tools/check_robotics_programme.mjs\`. Console notes: \`docs/consoles/ROBOPROG.md\`.`, "");
  md.push(rp.RP_NO_PARTNERSHIP, "");
  md.push("## Standards named", "", "Named so learners can find them; no clause text is quoted. Each station teaches the practice in general terms from its own cited sources.", "", ...rp.RP_STANDARDS.map((s) => `- ${s.label}`), "");
  md.push("## How a cohort runs", "", "1. Organisation and cohort with seats (`org.js`; seats are a count; no payment).", "2. The cohort's invite code is the class code.", "3. Load the level's DEAN template (`rpTemplates()`), set the due date and required score, assign it (`rpSetUpCohort()` does all three).", "4. Stations in SmartCiti.X; the robot rigs at the ROBOTICS sites in the open worlds; the robotics gym (`rb-env.js`) for the loop.", "5. Debrief and assess with the instructor guide below.", "6. Credential: the level's competency (Open Badges, transcript, xAPI) and the cohort certificate.", "");
  md.push("## Robot-station coverage (the programme's eval)", "", "A level is covered when one of its own stations (capstones not counted) is a robot station; an AI-training level also needs a loop station.", "", "| Level | Tracks covered | Robot-station places |", "|---|---|---|");
  for (const l of rp.RP_LEVELS) md.push(`| ${l.title} | ${cov.byLevel[l.id].covered}/${cov.byLevel[l.id].of} | ${cov.byLevel[l.id].robot} |`);
  md.push("", `Total: ${cov.covered}/${cov.of} track levels covered.`, "");
  md.push("## The learning loop (AI-training level)", "");
  for (const s of loop) md.push(`- **${s.title}** — \`${s.module}\` \`${s.fn}()\`${s.live ? "" : " (pending in this build)"}; station \`${s.station}\`. ${s.what}`);
  md.push("", "Data rules (DATAWORKS): opt-in only, adults only, never in K-12, demo or signed-out sessions; local only, no upload endpoint; revoking deletes the data and marks dependent policies stale.", "");
  md.push("## Levels", "", "| Level | Who | Module score | Due |", "|---|---|---|---|");
  for (const l of rp.RP_LEVELS) md.push(`| ${l.title} | ${l.who} | ${l.requiredScore} | ${l.dueDays} days |`);
  md.push("");
  md.push("## Tracks and instructor guides", "");
  for (const t of rp.RP_TRACKS) {
    md.push(`### ${t.title}`, "", `Kinds of work: ${t.kinds}. Standards named: ${t.standards.map((s) => stdLabel(s).split(" — ")[0]).join(", ")}. Gym scenario: \`${t.scenario}\`.`, "");
    for (const tpl of templates.filter((x) => x.track === t.id)) {
      md.push(`#### \`${tpl.module.id}\` — ${rp.rpLevel(tpl.level).title}`, "");
      md.push(`- **Due:** ${tpl.dueDays} days after the cohort starts · **required score:** ${tpl.module.requiredScore} · **credential:** \`${tpl.credential?.id}\` (${COMPETENCY_BY_ID[tpl.credential?.id]?.title ?? "—"})`);
      md.push("- **Objectives:**", ...tpl.guide.objectives.map((o) => `  - ${o}`));
      md.push("- **The practice (each station's cited sources):**", ...tpl.guide.practice.map((x) => `  - \`${x.station}\` ${sName(x.station)}${x.robot ? " (robot)" : ""}${x.capstone ? " (capstone)" : ""} — ${(tree.stations.get(x.station)?.certification ?? "").split(";")[0].trim()}`));
      if (tpl.guide.loop.length) md.push("- **The loop:**", ...tpl.guide.loop.map((s) => `  - ${s.title} (\`${s.station}\`): ${s.what}`));
      md.push(`- **Consent:** ${tpl.guide.consent}`);
      md.push("- **Debrief prompts:**", ...tpl.guide.debrief.map((d) => `  - ${d}`));
      md.push(`- **Assessment:** ${tpl.guide.assessment}`, "");
    }
  }
  writeFileSync(join(ROOT, "docs/robotics-programme.md"), md.join("\n"));
  console.log(`Wrote WebXR/robotics/programme.html and docs/robotics-programme.md — ${rp.RP_TRACKS.length} tracks, ${rp.RP_LEVELS.length} levels, ${templates.length} DEAN templates, coverage ${cov.covered}/${cov.of}, loop ${loop.filter((s) => s.live).length}/${loop.length} live`);
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) await main();
