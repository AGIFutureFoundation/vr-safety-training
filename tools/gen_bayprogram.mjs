/**
 * BAYKEEPER — writes the Bay Program resource hub, WebXR/bayprogram/index.html,
 * from WebXR/shared/bk-bayprogram.js (the facts), the catalog (station names)
 * and tools/unions.json (union names). Static HTML so the page reads with no
 * script and tools/check_bayprogram.mjs can verify every figure on it.
 *
 *     node tools/gen_bayprogram.mjs
 */
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const bk = await import(pathToFileURL(join(ROOT, "WebXR/shared/bk-bayprogram.js")).href);
const catalog = JSON.parse(readFileSync(join(ROOT, "WebXR/smartcity/catalog.json"), "utf8"));
const unions = JSON.parse(readFileSync(join(ROOT, "tools/unions.json"), "utf8")).unions;

const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const stationName = (id) => catalog.stations.find((s) => s.id === id)?.name || catalog.stations.find((s) => s.id === id)?.title || id;
const unionName = (id) => { const u = unions.find((x) => x.id === id); return u ? `${u.abbrev}` : id; };
const unionFull = (id) => unions.find((x) => x.id === id)?.name || id;
const stationLink = (id) => `<a href="../smartcity/index.html?sim=${encodeURIComponent(id)}&amp;from=bayprogram">${esc(stationName(id))}</a>`;
const src = (s) => `<a href="${esc(s.url)}" rel="noopener">${esc(s.publisher)} — ${esc(s.title)}</a>${s.date ? `, ${esc(s.date)}` : ""}`;

const P = bk.BK_PROGRAM, CP = bk.BK_CLEAN_PORTS, S = bk.BK_SOURCES;

const rows = bk.BK_PROJECTS.map((p) => {
  const m = p.marker;
  const where = m.world === "parishes"
    ? `<a href="${esc(m.href)}" data-bk-marker="${esc(m.parish)}${m.site ? `/${esc(m.site)}` : ""}">${esc(m.note)}</a>${m.bayworld ? ` · <a href="../bayworld/index.html" data-bk-bayworld="${esc(m.bayworld)}">Bay World's West Oakland port</a>` : ""}`
    : `<a href="${esc(m.href)}" data-bk-marker="regional">${esc(m.note)}</a>`;
  return `      <tr id="${esc(p.id)}" data-bk-project="${esc(p.id)}">
        <th scope="row">${esc(p.recipient)}</th>
        <td data-bk-amount>${esc(p.amount)}</td>
        <td data-bk-place>${esc(p.place)}</td>
        <td data-bk-does>${esc(p.does)}</td>
        <td><ul class="bk-list">${p.stations.map((id) => `<li data-bk-station="${esc(id)}">${stationLink(id)}</li>`).join("")}</ul></td>
        <td>${p.unions.map((u) => `<span class="at-chip bk-chip" data-bk-union="${esc(u)}" title="${esc(unionFull(u))}">${esc(unionName(u))}</span>`).join(" ")}</td>
        <td>${where}</td>
      </tr>`;
}).join("\n");

const cats = Object.entries(bk.BK_CATEGORY_STATIONS).map(([c, ids]) => `<li><strong>${esc(c)}</strong>: ${ids.map((id) => `<span data-bk-station="${esc(id)}">${stationLink(id)}</span>`).join(", ")}</li>`).join("\n        ");
const partners = CP.partners.map((x) => `<li><strong>${esc(x.name)}</strong> — ${esc(x.role)}</li>`).join("\n        ");
const crafts = bk.BK_CRAFTS.map((c) => `<li><span class="at-chip bk-chip" data-bk-union="${esc(c.union)}">${esc(unionName(c.union))}</span> ${esc(unionFull(c.union))} — ${esc(c.craft)}</li>`).join("\n        ");

const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<title>Bay Program Hub — SmartCiti.X · Powered by AGI Corp</title>
<meta name="description" content="The U.S. EPA San Francisco Bay Program awards of September 2026 and the Port of Oakland's Clean Ports program, with the SmartCiti.X stations that teach the work.">
<meta name="generator" content="tools/gen_bayprogram.mjs">
<link rel="stylesheet" href="../shared/design.css">
<style>
  body{margin:0}
  .bk-wrap{max-width:1200px;margin:0 auto;padding:56px 16px 32px}
  .bk-sec{margin:28px 0}
  .bk-sec h2{font:var(--at-fw-bold) var(--at-fs-lg)/var(--at-lh-snug) var(--at-font-display);margin:0 0 8px}
  .bk-scroll{overflow-x:auto;-webkit-overflow-scrolling:touch}
  .bk-table{width:100%;border-collapse:collapse;font-size:var(--at-fs-sm);min-width:880px}
  .bk-table th,.bk-table td{border-bottom:1px solid var(--at-border);padding:8px;text-align:left;vertical-align:top}
  .bk-table thead th{color:var(--at-on-surface-muted);font-weight:var(--at-fw-semibold)}
  .bk-list{margin:0;padding-left:16px}
  .bk-chip{min-height:24px;cursor:default}
  .bk-note,.bk-src{color:var(--at-on-surface-muted);font-size:var(--at-fs-sm)}
  .bk-wrap a{color:var(--at-primary)}
  .bk-fig{display:flex;flex-wrap:wrap;gap:12px;margin:12px 0;padding:0;list-style:none}
  .bk-fig li{background:var(--at-surface);border:1px solid var(--at-border);border-radius:var(--at-r-md);padding:10px 14px}
  .bk-fig b{display:block;font-size:var(--at-fs-lg)}
</style>
</head>
<body class="at-root at-scheme--dark">
<a class="home-chip" href="../index.html" aria-label="Back to the homepage">Home</a>
<!-- Generated by tools/gen_bayprogram.mjs from WebXR/shared/bk-bayprogram.js — edit the data, not this file. -->
<main class="bk-wrap">
  <header class="at-section-head">
    <div>
      <p class="at-eyebrow">SmartCiti.X · Powered by AGI Corp · Bay Program</p>
      <h1 class="at-section-head__title">The Bay Program hub</h1>
      <p data-bk-program>${esc(P.paragraph)}</p>
      <p class="bk-src">Source: ${src(S.epa)}; coverage: ${src(S.stormwater)}.</p>
      <ul class="bk-fig">
        <li><b data-bk-fig="total">${esc(P.total)}</b>grant funding</li>
        <li><b data-bk-fig="projects">${P.projectCount}</b>projects</li>
        <li><b data-bk-fig="named">${P.namedCount}</b>named in our sources</li>
      </ul>
    </div>
  </header>

  <section class="bk-sec" aria-labelledby="bk-projects">
    <h2 id="bk-projects">The eight named projects</h2>
    <p class="bk-note">Recipient, amount, place and what each does are exactly as the sources state them. Where a project plays on the platform's maps is our choice, not the release's; a project outside the walkable maps is shown in Bay World's regional atlas.</p>
    <div class="bk-scroll">
    <table class="bk-table">
      <thead><tr><th scope="col">Recipient</th><th scope="col">Amount</th><th scope="col">Place</th><th scope="col">What it does</th><th scope="col">Stations that teach the work</th><th scope="col">Union crafts</th><th scope="col">Where it plays</th></tr></thead>
      <tbody>
${rows}
      </tbody>
    </table>
    </div>
    <p data-bk-unnamed>The sources we could read name eight of the twenty projects — ${esc(P.unnamedLine)}. We do not name, place or price those.</p>
  </section>

  <section class="bk-sec" aria-labelledby="bk-cats">
    <h2 id="bk-cats">Training by category</h2>
    <p class="bk-note">The programme <a href="../home/tracks/${esc(bk.BK_PROGRAMME_ID)}.html">SF Bay Program Projects</a> gathers these stations. They teach the trade practice from each station's own sourced safety content; they are sited generically, not at any project.</p>
    <ul>
        ${cats}
    </ul>
  </section>

  <section class="bk-sec" aria-labelledby="bk-ports">
    <h2 id="bk-ports">Port of Oakland — Clean Ports</h2>
    <p data-bk-cleanports>${esc(CP.paragraph)}</p>
    <ul class="bk-fig">
      <li><b data-bk-fig="cp-award">${esc(CP.award)}</b>Clean Ports award</li>
      <li><b data-bk-fig="cp-equipment">${CP.equipment.total}</b>zero-emissions pieces</li>
      <li><b data-bk-fig="cp-drayage">${CP.equipment.drayage}</b>drayage trucks</li>
      <li><b data-bk-fig="cp-che">${CP.equipment.cargoHandling}</b>cargo handling equipment</li>
      <li><b data-bk-fig="cp-ghg">${esc(CP.ghgTonsAnnual)}</b>tons of greenhouse gas a year, expected</li>
    </ul>
    <p><strong>Workforce partners</strong> — the Port partners with three local workforce development organisations:</p>
    <ul>
        ${partners}
    </ul>
    <p>${esc(CP.jobs)} The platform's <a href="${esc(CP.track)}">WOJRC Pathway Edition</a> track builds on this; it is not the WOJRC program itself.</p>
    <p class="bk-src">Sources: ${src(S.cleanPorts)}; ${src(S.cleanPortsGrant)}; coverage: ${src(S.cleanPortsCoverage)}.</p>
  </section>

  <section class="bk-sec" aria-labelledby="bk-crafts">
    <h2 id="bk-crafts">Union crafts on this work</h2>
    <p class="bk-note">Only unions the platform's registry lists, described as the registry describes them. No partner curriculum is reproduced here.</p>
    <ul>
        ${crafts}
    </ul>
  </section>
  <p class="bk-src">SmartCiti.X · Powered by AGI Corp</p>
</main>
<script type="module">import { ctlMount } from "../shared/controls.js"; ctlMount({ world: "the Bay Program hub", except: { move: "A page, not a world: Tab walks the links.", look: "Scroll the page.", interact: "Enter opens the focused link.", map: "Each world keeps its own map.", view: "—", quality: "Set inside each world." } });</script>
</body>
</html>
`;
mkdirSync(join(ROOT, "WebXR/bayprogram"), { recursive: true });
writeFileSync(join(ROOT, "WebXR/bayprogram/index.html"), html);
console.log(`Wrote WebXR/bayprogram/index.html — ${bk.BK_PROJECTS.length} named projects, ${new Set(bk.BK_PROJECTS.flatMap((p) => p.stations)).size} stations linked`);
