/**
 * The SmartCiti.X Powered by AGI Corp Holodeck Packs (console PACKS, docs/consoles/PACKS.md).
 *
 *     node tools/gen_packs.mjs
 *
 * Every programme, union package, K-12 track and catalog category becomes its own Holodeck Pack. Read from
 * what exists — WebXR/smartcity/catalog.json (programmes, stations, categories), tools/unions.json (the unions
 * registry) and the worlds' own site data (Bay World, the Deep, Sierra Summit, Redwood Reach and the ten
 * parish/district maps) — and written, deterministically (no timestamps), to:
 *
 *   WebXR/packs/<id>.json          one manifest per pack
 *   WebXR/packs/index.json         the list of packs (id, kind, title, path, file)
 *   WebXR/shared/pk-packs-data.js  the same packs as one compact literal for the bundles (read by pk-packs.js)
 *   WebXR/packs/index.html         the Packs page, source layout (WebXR/packs/ beside the apps' folders)
 *   WebXR/packs/flat/index.html    the Packs page, flat bundle layout (the bundler copies it to WebXR/dist/packs/)
 *
 * Nothing is invented: a pack names only catalog stations and programmes, registry unions and sites the
 * worlds list. No logo file is referenced; the branding line is text.
 */
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const WEBXR = join(ROOT, "WebXR");
export const PK_DIR = join(WEBXR, "packs");
export const PK_DATA_FILE = join(WEBXR, "shared", "pk-packs-data.js");
const imp = (p) => import(pathToFileURL(join(WEBXR, p)).href);

export const PK_BRAND = "SmartCiti.X · Powered by AGI Corp";
export const PK_PATHS = ["union-trades", "k12", "first-responders", "un-training", "disaster-relief", "teachers", "roam"];
export const PK_KINDS = ["programme", "k12", "union", "library"];
export const PK_VERSION = "1.0.0";
export const pkTitle = (name) => `SmartCiti.X ${name} — Powered by AGI Corp`;

/**
 * The STORYLINE path of a programme pack, with any secondary paths. Matched to STORYLINE's own registry
 * (WebXR/shared/st-paths.js, docs/consoles/STORYLINE.md), which names the programmes behind each path:
 *   First Responders: first-responders, situational-awareness, hazmat-environmental
 *   UN Training:      outbreak-response-who
 *   Disaster Relief:  first-responders, hazmat-environmental, water-and-gas-utility-crews, situational-awareness
 *   Teachers:         education-support-staff, the four K-12 programmes, civic-leadership-and-ei
 *   K-12:             the four K-12 programmes (their packs: path k12, also teachers)
 *   Just Roam:        no programmes (it turns the prompts off) — so no pack carries `roam`.
 * A programme STORYLINE lists under more than one path takes the one below as `path` and the rest as `alsoPaths`;
 * a programme not listed is a union-trade programme (its catalog `union` line names the trades that teach it).
 */
export const PK_PROGRAMME_PATHS = {
  "first-responders": { path: "first-responders", also: ["disaster-relief"], audience: "responders" },
  "situational-awareness": { path: "first-responders", also: ["disaster-relief"], audience: "responders" },
  // HAZWOPER-style cleanup and spill response: the disaster-relief crew's programme first (STORYLINE lists it under both).
  "hazmat-environmental": { path: "disaster-relief", also: ["first-responders"], audience: "responders" },
  "water-and-gas-utility-crews": { path: "union-trades", also: ["disaster-relief"], audience: "trades" },
  "outbreak-response-who": { path: "un-training", also: [], audience: "public-health" },
  "education-support-staff": { path: "teachers", also: [], audience: "school-staff" },
  "civic-leadership-and-ei": { path: "teachers", also: [], audience: "community" },
};
/**
 * Unions whose package serves a path other than Union Trades: the unions the first-responders programme's own
 * union line names for fire, EMS, police and crisis work, and the school-staff unions of education-support-staff.
 */
export const PK_UNION_PATHS = {
  iaff: { path: "first-responders", also: ["disaster-relief"], audience: "responders" },
  nage: { path: "first-responders", also: ["disaster-relief"], audience: "responders" },
  fop: { path: "first-responders", also: [], audience: "responders" },
  nasw: { path: "first-responders", also: ["disaster-relief"], audience: "responders" },
  aft: { path: "teachers", also: [], audience: "school-staff" },
  csea: { path: "teachers", also: [], audience: "school-staff" },
};
/**
 * Catalog categories whose station library serves a path other than Union Trades. Every other library is a
 * category of trade stations, so it belongs to Union Trades; none defaults to Just Roam.
 */
export const PK_LIBRARY_PATHS = {
  "Emergency Services": { path: "first-responders", also: ["disaster-relief"], audience: "responders" },
};

export const PK_WORLD_NAMES = {
  bayworld: "Bay World", underwater: "The Deep", summit: "Sierra Summit", redwood: "Redwood Reach", parishes: "Parishes & Districts",
};

const slugOf = (s) => String(s).toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const escRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/** The unions a piece of the platform's own text names (same rule as shared/signage.js unionsNamed). */
export function pkUnionsNamed(text, unions) {
  const hits = [];
  for (const u of unions) {
    let best = -1;
    for (const alias of u.aliases ?? [u.abbrev]) {
      const m = new RegExp(`(^|[^A-Za-z0-9])${escRe(alias)}(?![A-Za-z0-9])`).exec(String(text ?? ""));
      if (m && (best < 0 || m.index < best)) best = m.index;
    }
    if (best >= 0) hits.push({ id: u.id, at: best });
  }
  return hits.sort((a, b) => a.at - b.at || a.id.localeCompare(b.id)).map((h) => h.id);
}

/** Every world's sites as [{ world, parish, id, name, stations }]. */
export async function pkWorldSites() {
  const { BAY_SITES } = await imp("shared/bayworld-data.js");
  const { DEEP_SITES } = await imp("shared/underwater-data.js");
  const { SM_SITES } = await imp("shared/summit-data.js");
  const { RW_SITES } = await imp("redwood/js/rw-data.js");
  const { NP_PARISHES } = await imp("shared/np-parishes.js");
  const out = [];
  for (const [world, sites] of [["bayworld", BAY_SITES], ["underwater", DEEP_SITES], ["summit", SM_SITES], ["redwood", RW_SITES]]) {
    for (const s of sites) out.push({ world, parish: null, id: s.id, name: s.name, stations: s.stations ?? [] });
  }
  for (const p of NP_PARISHES) {
    for (const s of p.sites ?? []) out.push({ world: "parishes", parish: p.id, parishName: p.name, id: s.id, name: s.name, stations: s.stations ?? [] });
  }
  return { sites: out, parishes: NP_PARISHES.map((p) => ({ id: p.id, name: p.name })) };
}

/** Where a set of stations plays: [{ world, parish?, sites: [siteId] }] in a fixed world order. */
function worldsFor(stationIds, sites) {
  const ids = new Set(stationIds);
  const groups = new Map();
  for (const s of sites) {
    if (!s.stations.some((id) => ids.has(id))) continue;
    const key = s.parish ? `parishes:${s.parish}` : s.world;
    if (!groups.has(key)) groups.set(key, { world: s.world, ...(s.parish ? { parish: s.parish } : {}), sites: [] });
    groups.get(key).sites.push(s.id);
  }
  return [...groups.values()];
}

function versionOf(p) {
  const h = createHash("sha1").update(JSON.stringify([p.stations, p.programmes, p.worlds, p.unions])).digest("hex").slice(0, 8);
  return { version: PK_VERSION, contentHash: h };
}

/** Build every pack from the catalog, the unions registry and the worlds. Pure apart from reading files. */
export async function pkBuild() {
  const catalog = JSON.parse(readFileSync(join(WEBXR, "smartcity", "catalog.json"), "utf8"));
  const unions = JSON.parse(readFileSync(join(ROOT, "tools", "unions.json"), "utf8")).unions;
  const { sites } = await pkWorldSites();
  const byId = new Map(catalog.stations.map((s) => [s.id, s]));
  const isK12 = (id) => id.startsWith("k12-");
  const st = (id) => ({ app: byId.get(id)?.app ?? "smartcity", id });
  const packs = [];

  // Programmes and K-12 tracks: one pack per catalog programme.
  for (const c of catalog.curricula) {
    const k12 = isK12(c.id);
    const map = PK_PROGRAMME_PATHS[c.id];
    const ids = c.stations.map((s) => s.id);
    packs.push({
      id: c.id, kind: k12 ? "k12" : "programme", name: c.name, title: pkTitle(c.name),
      audience: k12 ? "classroom" : map?.audience ?? "trades",
      summary: c.summary, certification: c.certification,
      programmes: [c.id], stations: ids.map(st),
      unions: k12 ? [] : pkUnionsNamed(c.union, unions), unionLine: c.union,
      k12Bands: k12 && c.band ? [c.band] : [],
      path: k12 ? "k12" : map?.path ?? "union-trades",
      alsoPaths: k12 ? ["teachers"] : map?.also ?? [],
      worlds: worldsFor(ids, sites),
    });
  }

  // Union packages: every registry union the platform's text ties to a (non-K-12) station.
  const unionStations = new Map(), unionProgs = new Map();
  const add = (m, k, v) => { if (!m.has(k)) m.set(k, new Set()); m.get(k).add(v); };
  for (const c of catalog.curricula) {
    if (isK12(c.id)) continue;
    for (const u of pkUnionsNamed(c.union, unions)) {
      add(unionProgs, u, c.id);
      for (const s of c.stations) if (!isK12(s.id)) add(unionStations, u, s.id);
    }
  }
  for (const s of catalog.stations) {
    if (isK12(s.id)) continue;
    for (const u of pkUnionsNamed(`${s.union ?? ""} ${s.certification ?? ""}`, unions)) add(unionStations, u, s.id);
  }
  const order = new Map(catalog.stations.map((s, i) => [s.id, i]));
  for (const u of unions) {
    const set = unionStations.get(u.id);
    if (!set?.size) continue;
    const ids = [...set].sort((a, b) => order.get(a) - order.get(b));
    const name = `${u.abbrev} Union Package`;
    packs.push({
      id: `union-${u.id}`, kind: "union", name, title: pkTitle(name),
      audience: PK_UNION_PATHS[u.id]?.audience ?? "trades",
      summary: `Every station the platform ties to ${u.name}: the programmes whose union line names it and the stations whose own certification does.`,
      certification: null,
      programmes: [...(unionProgs.get(u.id) ?? [])].sort(), stations: ids.map(st),
      unions: [u.id], unionLine: u.name, k12Bands: [],
      path: PK_UNION_PATHS[u.id]?.path ?? "union-trades", alsoPaths: PK_UNION_PATHS[u.id]?.also ?? [],
      worlds: worldsFor(ids, sites),
    });
  }

  // Station libraries: one per catalog category, non-K-12 stations (the home of stations no programme lists).
  const inProgramme = new Set(catalog.curricula.flatMap((c) => c.stations.map((s) => s.id)));
  for (const cat of catalog.categories) {
    const ids = cat.stations.filter((id) => !isK12(id) && byId.has(id));
    if (!ids.length) continue;
    const name = `${cat.name} Station Library`;
    const loose = ids.filter((id) => !inProgramme.has(id)).length;
    packs.push({
      id: `library-${slugOf(cat.name)}`, kind: "library", name, title: pkTitle(name),
      audience: PK_LIBRARY_PATHS[cat.name]?.audience ?? "trades",
      summary: `Every ${cat.name} station in the catalog in one pack${loose ? ` — including ${loose === 1 ? "one station" : "stations"} no programme lists yet` : ""}.`,
      certification: null,
      // A library holds stations, not programmes: the programmes that share its stations are named as related only,
      // so an exported library carries no programme whose other stations it does not hold.
      programmes: [],
      relatedProgrammes: [...new Set(catalog.curricula.filter((c) => !isK12(c.id) && c.stations.some((s) => ids.includes(s.id))).map((c) => c.id))].sort(),
      stations: ids.map(st), unions: [], unionLine: null, k12Bands: [],
      path: PK_LIBRARY_PATHS[cat.name]?.path ?? "union-trades", alsoPaths: PK_LIBRARY_PATHS[cat.name]?.also ?? [],
      worlds: worldsFor(ids, sites),
    });
  }

  for (const p of packs) {
    p.stationNames = Object.fromEntries(p.stations.map((s) => [s.id, byId.get(s.id)?.name ?? s.id]));
    Object.assign(p, versionOf(p), { brand: PK_BRAND, generator: "tools/gen_packs.mjs" });
    p.provenance = "Generated from WebXR/smartcity/catalog.json, tools/unions.json and the worlds' site data; nothing hand-typed.";
  }
  return { packs, catalog, unions, sites };
}

// ------------------------------------------------------------------ writing

const stable = (v) => JSON.stringify(v, null, 2) + "\n";

/** The compact literal the bundles carry (station ids as indexes into one list). */
export function pkDataModule(packs, catalog) {
  const ids = catalog.stations.map((s) => s.id);
  const at = new Map(ids.map((id, i) => [id, i]));
  const trades = catalog.stations.filter((s) => s.app !== "smartcity").map((s) => s.id);
  const progIds = catalog.curricula.map((c) => c.id);
  const progAt = new Map(progIds.map((id, i) => [id, i]));
  const places = {};
  packs.forEach((p, i) => { for (const w of p.worlds) (places[w.parish ? `parishes:${w.parish}` : w.world] ??= []).push(i); });
  const rows = packs.map((p) => ({
    id: p.id, kind: p.kind, name: p.name, audience: p.audience, path: p.path, alsoPaths: p.alsoPaths,
    unions: p.unions, k12Bands: p.k12Bands, version: p.version,
    p: p.programmes.map((id) => progAt.get(id)), s: p.stations.map((s) => at.get(s.id)),
  }));
  return `/**
 * GENERATED by tools/gen_packs.mjs — edit the generator, not this file. The Holodeck Packs as one compact
 * literal for the bundles: a row's \`s\` holds indexes into PK_STATION_IDS and \`p\` into PK_PROGRAMME_IDS;
 * PK_PLACES maps a place ("bayworld", "underwater", "summit", "redwood" or "parishes:<map id>") to the indexes of
 * the packs that play there (the site ids are in each pack's manifest, WebXR/packs/<id>.json). Read through
 * WebXR/shared/pk-packs.js (pkPacks, pkPack, pkPackOf, pkPacksAt). Provenance: WebXR/smartcity/catalog.json,
 * tools/unions.json and the worlds' site data.
 */
export const PK_STATION_IDS = ${JSON.stringify(ids)};
export const PK_NON_SMARTCITY = ${JSON.stringify(trades)};
export const PK_PROGRAMME_IDS = ${JSON.stringify(progIds)};
export const PK_PLACES = ${JSON.stringify(places)};
export const PK_DATA = ${JSON.stringify(rows)};
`;
}

const esc = (v) => String(v ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");

/** Links per layout: "source" is WebXR/packs/index.html, "dist" is WebXR/dist/packs/index.html. */
export const PK_LINKS = {
  source: {
    home: "../index.html", css: "../shared/design.css",
    station: (app, id) => (app === "trades" ? `../trades/index.html?room=${id}` : `../smartcity/index.html?sim=${id}`),
    world: (w, parish) => ({ bayworld: "../bayworld/index.html", underwater: "../underwater/underwater.html", summit: "../summit/index.html", redwood: "../redwood/redwood.html" }[w] ?? `../parishes/parishes.html?parish=${parish}`),
    track: (id) => `../home/tracks/${id}.html`,
    manifest: (id) => `./${id}.json`,
  },
  dist: {
    home: "../index.html", css: "../shared/design.css",
    station: (app, id) => (app === "trades" ? `../trade-skills-simulator.html?room=${id}` : `../smartcity-x.html?sim=${id}`),
    world: (w, parish) => ({ bayworld: "../bayworld.html", underwater: "../underwater.html", summit: "../summit.html", redwood: "../redwood.html" }[w] ?? `../parishes.html?parish=${parish}`),
    track: (id) => `../tracks/${id}.html`,
    manifest: (id) => `./${id}.json`,
  },
};

/** Stations listed inline on a card; the rest load from the manifest when the list is opened. */
export const PK_INLINE = 12;
const KIND_LABEL = { programme: "Programme", k12: "K-12 track", union: "Union package", library: "Station library" };
const PATH_LABEL = {
  "union-trades": "Union Trades", k12: "K-12", "first-responders": "First Responders", "un-training": "UN Training",
  "disaster-relief": "Disaster Relief", teachers: "Teachers", roam: "Just Roam",
};
const AUDIENCE_LABEL = { trades: "Trade learners", classroom: "Classroom", responders: "Responders", "public-health": "Public health", "school-staff": "School staff", community: "Community & civic" };

/** The Packs page for one layout. */
export function pkPageHtml(packs, catalog, unions, parishes, layout = "source") {
  const L = PK_LINKS[layout];
  const byId = new Map(catalog.stations.map((s) => [s.id, s]));
  const parishName = new Map(parishes.map((p) => [p.id, p.name]));
  const unionAbbrev = new Map(unions.map((u) => [u.id, u.abbrev]));
  const trackExists = (id) => existsSync(join(WEBXR, "home", "tracks", `${id}.html`));
  const usedUnions = [...new Set(packs.flatMap((p) => p.unions))].sort((a, b) => unionAbbrev.get(a).localeCompare(unionAbbrev.get(b)));
  const opt = (v, label) => `<option value="${esc(v)}">${esc(label)}</option>`;
  const card = (p) => {
    const worlds = p.worlds.map((w) => `<li><a href="${esc(L.world(w.world, w.parish))}">${esc(w.parish ? parishName.get(w.parish) : PK_WORLD_NAMES[w.world])}</a> <span class="pk-dim">· ${w.sites.length} site${w.sites.length === 1 ? "" : "s"}</span></li>`).join("");
    const stations = p.stations.slice(0, PK_INLINE).map((s) => `<li><a href="${esc(L.station(s.app, s.id))}">${esc(byId.get(s.id)?.name ?? s.id)}</a></li>`).join("")
      + (p.stations.length > PK_INLINE ? `<li class="pk-more">and ${p.stations.length - PK_INLINE} more in the <a href="${esc(L.manifest(p.id))}">manifest</a></li>` : "");
    const chips = p.unions.map((u) => `<span class="at-chip pk-chip">${esc(unionAbbrev.get(u))}</span>`).join("");
    const track = p.kind === "programme" || p.kind === "k12" ? (trackExists(p.id) ? ` · <a href="${esc(L.track(p.id))}">Training track</a>` : "") : "";
    return `<article class="at-card pk-card" id="pack-${esc(p.id)}" data-kind="${p.kind}" data-path="${esc([p.path, ...p.alsoPaths].join(" "))}" data-audience="${esc(p.audience)}" data-unions="${esc(p.unions.join(" "))}">
  <div class="at-card__body">
    <p class="at-eyebrow">${esc(KIND_LABEL[p.kind])} · ${esc(PATH_LABEL[p.path])}${p.alsoPaths.length ? ` <span class="pk-dim">(also ${esc(p.alsoPaths.map((x) => PATH_LABEL[x]).join(", "))})</span>` : ""}</p>
    <h2 class="pk-title">${esc(p.title)}</h2>
    <p class="pk-meta">${esc(AUDIENCE_LABEL[p.audience])}${p.k12Bands.length ? ` · ${esc(p.k12Bands.join(", "))}` : ""} · ${p.stations.length} station${p.stations.length === 1 ? "" : "s"} · ${p.worlds.length} world${p.worlds.length === 1 ? "" : "s"} · v${esc(p.version)}</p>
    ${chips ? `<div class="pk-chips">${chips}</div>` : ""}
    <p class="pk-sum">${esc(p.summary)}</p>
    ${worlds ? `<p class="pk-h">Plays in</p><ul class="pk-worlds">${worlds}</ul>` : `<p class="pk-dim">Plays in the station apps; no world site lists these stations yet.</p>`}
    <details data-pack="${esc(p.id)}"><summary>Stations (${p.stations.length})</summary><ul class="pk-stations">${stations}</ul></details>
    <p class="pk-links"><a href="${esc(L.manifest(p.id))}">Manifest</a>${track}</p>
    <p class="pk-brand">${esc(PK_BRAND)}</p>
  </div>
</article>`;
  };
  const counts = PK_KINDS.map((k) => `${packs.filter((p) => p.kind === k).length} ${KIND_LABEL[k].toLowerCase()}${packs.filter((p) => p.kind === k).length === 1 ? "" : "s"}`).join(" · ");
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<title>Holodeck Packs — ${esc(PK_BRAND)}</title>
<meta name="description" content="Every programme, union package, K-12 track and station library as its own SmartCiti.X Holodeck Pack.">
<meta name="generator" content="tools/gen_packs.mjs">
<link rel="stylesheet" href="${L.css}">
<style>
  body{margin:0}
  .pk-wrap{max-width:1200px;margin:0 auto;padding:56px 16px 32px}
  .pk-filters{display:flex;flex-wrap:wrap;gap:12px;margin:0 0 20px}
  .pk-filters label{display:flex;flex-direction:column;gap:4px;font-size:var(--at-fs-sm);color:var(--at-on-surface-muted)}
  .pk-filters select{min-height:40px;border-radius:var(--at-r-md);background:var(--at-surface-2);color:var(--at-on-surface);border:1px solid var(--at-border-strong);padding:0 10px;font:inherit;max-width:100%}
  .pk-title{margin:0;font:var(--at-fw-bold) var(--at-fs-lg)/var(--at-lh-snug) var(--at-font-display)}
  .pk-meta,.pk-dim,.pk-brand{color:var(--at-on-surface-muted);font-size:var(--at-fs-sm);margin:0}
  .pk-sum{margin:0;font-size:var(--at-fs-sm)}
  .pk-h{margin:4px 0 0;font-weight:var(--at-fw-semibold);font-size:var(--at-fs-sm)}
  .pk-worlds,.pk-stations{margin:0;padding-left:18px;font-size:var(--at-fs-sm)}
  .pk-stations{max-height:260px;overflow:auto}
  .pk-chips{display:flex;flex-wrap:wrap;gap:6px}
  .pk-chip{min-height:28px;cursor:default}
  .pk-card a{color:var(--at-primary)}
  .pk-card:target{border-color:var(--at-primary)}
  .pk-brand{margin-top:auto;padding-top:8px;letter-spacing:var(--at-tracking-caps)}
  .pk-count{margin:0 0 12px;color:var(--at-on-surface-muted)}
</style>
</head>
<body class="at-root at-scheme--dark">
<a class="home-chip" href="${L.home}" aria-label="Back to the homepage">Home</a>
<!-- Generated by tools/gen_packs.mjs from WebXR/smartcity/catalog.json, tools/unions.json and the worlds' site data — edit the generator, not this file. -->
<main class="pk-wrap">
  <header class="at-section-head">
    <div>
      <p class="at-eyebrow">${esc(PK_BRAND)}</p>
      <h1 class="at-section-head__title">SmartCiti.X Holodeck Packs</h1>
      <p>Every programme, union package, K-12 track and station library ships as its own Holodeck Pack: a manifest naming its stations, the worlds and sites where it plays, the union(s) it is taught under and the path it belongs to. ${packs.length} packs: ${counts}.</p>
    </div>
  </header>
  <form class="pk-filters" id="pk-filters" aria-label="Filter the packs">
    <label>Path<select id="pk-path"><option value="">Every path</option>${PK_PATHS.filter((p) => p !== "roam").map((p) => opt(p, PATH_LABEL[p])).join("")}</select></label>
    <label>Audience<select id="pk-audience"><option value="">Every audience</option>${Object.entries(AUDIENCE_LABEL).map(([k, v]) => opt(k, v)).join("")}</select></label>
    <label>Union<select id="pk-union"><option value="">Every union</option>${usedUnions.map((u) => opt(u, unionAbbrev.get(u))).join("")}</select></label>
    <label>Kind<select id="pk-kind"><option value="">Every kind</option>${PK_KINDS.map((k) => opt(k, KIND_LABEL[k])).join("")}</select></label>
  </form>
  <p class="pk-count" id="pk-count" aria-live="polite">${packs.length} packs shown</p>
  <div class="at-grid" id="pk-grid">
${packs.map(card).join("\n")}
  </div>
</main>
<footer class="at-footer">
  <p>${esc(PK_BRAND)} — Holodeck Packs are generated from the catalog, the unions registry and the worlds' own site data; export one with <code>node tools/export_pack.mjs &lt;id&gt;</code>. Evidencing readiness against a standard is not a licence or a certification issued by its body.</p>
  <p><a href="${L.home}">Back to the homepage</a></p>
</footer>
<script>
(function () {
  var q = new URLSearchParams(location.search), sel = { path: "pk-path", audience: "pk-audience", union: "pk-union", kind: "pk-kind" };
  Object.keys(sel).forEach(function (k) { var v = q.get(k), el = document.getElementById(sel[k]); if (v && el && el.querySelector('option[value="' + v.replace(/[^a-z0-9-]/g, "") + '"]')) el.value = v; });
  function apply() {
    var f = {}; Object.keys(sel).forEach(function (k) { f[k] = document.getElementById(sel[k]).value; });
    var n = 0;
    document.querySelectorAll(".pk-card").forEach(function (c) {
      var ok = (!f.path || c.dataset.path.split(" ").indexOf(f.path) >= 0) && (!f.audience || c.dataset.audience === f.audience) &&
        (!f.union || c.dataset.unions.split(" ").indexOf(f.union) >= 0) && (!f.kind || c.dataset.kind === f.kind);
      c.hidden = !ok; if (ok) n++;
    });
    document.getElementById("pk-count").textContent = n + (n === 1 ? " pack" : " packs") + " shown";
  }
  document.getElementById("pk-filters").addEventListener("change", apply);
  apply();
  var ST = ${JSON.stringify(layout === "dist" ? { s: "../smartcity-x.html?sim=", t: "../trade-skills-simulator.html?room=" } : { s: "../smartcity/index.html?sim=", t: "../trades/index.html?room=" })};
  document.querySelectorAll("details[data-pack]").forEach(function (d) {
    d.addEventListener("toggle", function () {
      if (!d.open || d.dataset.loaded || !window.fetch) return; d.dataset.loaded = "1";
      fetch("./" + d.dataset.pack + ".json").then(function (r) { return r.ok ? r.json() : null; }).then(function (m) {
        if (!m) return; var ul = d.querySelector("ul"); ul.textContent = "";
        m.stations.forEach(function (s) { var li = document.createElement("li"), a = document.createElement("a"); a.href = (s.app === "trades" ? ST.t : ST.s) + encodeURIComponent(s.id); a.textContent = (m.stationNames && m.stationNames[s.id]) || s.id; li.appendChild(a); ul.appendChild(li); });
      }).catch(function () {});
    });
  });
  var want = q.get("pack"); if (want) { var el = document.getElementById("pack-" + want.replace(/[^a-z0-9-]/g, "")); if (el) { el.hidden = false; el.scrollIntoView({ block: "start" }); } }
})();
</script>
<script type="module">import { ctlMount } from "../shared/controls.js"; ctlMount({ world: "the Holodeck Packs", except: { move: "A page, not a world: Tab walks the packs.", look: "Scroll the page.", interact: "Enter opens the focused link.", map: "Each world keeps its own map.", view: "—", quality: "Set inside each world." } });</script>
<script type="module">import { gdMount } from "../shared/guide.js"; gdMount({ root: "../" });</script>
</body>
</html>
`;
}

export async function pkWriteAll() {
  const { packs, catalog, unions } = await pkBuild();
  const { parishes } = await pkWorldSites();
  mkdirSync(join(PK_DIR, "flat"), { recursive: true });
  // Drop manifests of packs that no longer exist.
  const want = new Set(packs.map((p) => `${p.id}.json`).concat("index.json"));
  for (const f of readdirSync(PK_DIR)) if (f.endsWith(".json") && !want.has(f)) rmSync(join(PK_DIR, f));
  for (const p of packs) writeFileSync(join(PK_DIR, `${p.id}.json`), stable(p));
  writeFileSync(join(PK_DIR, "index.json"), stable({
    brand: PK_BRAND, generator: "tools/gen_packs.mjs", paths: PK_PATHS, kinds: PK_KINDS,
    packs: packs.map((p) => ({ id: p.id, kind: p.kind, title: p.title, path: p.path, file: `${p.id}.json` })),
  }));
  writeFileSync(PK_DATA_FILE, pkDataModule(packs, catalog));
  writeFileSync(join(PK_DIR, "index.html"), pkPageHtml(packs, catalog, unions, parishes, "source"));
  writeFileSync(join(PK_DIR, "flat", "index.html"), pkPageHtml(packs, catalog, unions, parishes, "dist"));
  return packs;
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) {
  const packs = await pkWriteAll();
  const by = (k) => packs.filter((p) => p.kind === k).length;
  console.log(`[packs] ${packs.length} packs (${by("programme")} programme, ${by("k12")} K-12, ${by("union")} union, ${by("library")} library) → WebXR/packs/, WebXR/shared/pk-packs-data.js`);
}
