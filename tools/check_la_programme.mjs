/**
 * LA-PROGRAMME gate — the Louisiana Development Training Programme (docs/consoles/LA-PROGRAMME.md).
 *
 *   1  facts:     every figure and work-type phrase is verbatim in docs/sources/la-facts.md; every money figure and job figure
 *                 on the page and in the handbook appears in the facts file; no growth percentage; no partnership claim
 *   2  places:    every map/site id is guarded — live only when its map is in this tree and the site is on it; a map that is in
 *                 the tree must carry every site the programme names; the guard proven both ways on a stub; ids match the map
 *                 consoles' published ids files when they are readable
 *   3  training:  every station resolves in the catalog, every union in tools/unions.json, every matrix cell to both
 *   4  pathways:  6 pathways × 5 levels, each ending in a credential that is earnable in its module
 *   5  sims:      6+ simulations, every step a real station step, gates and requires consistent, every sim placed on a fixed
 *                 site, registration with PROJECTSIM guarded
 *   6  templates: DEAN module docs validate (dnValidateDoc), every template has an instructor guide
 *   7  page:      generated page and handbook are current, design system, Home chip, Guide, no model identifier
 *
 *     node tools/check_la_programme.mjs
 */
import { readFileSync, existsSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const W = join(ROOT, "WebXR");
const mem = new Map();
globalThis.localStorage ??= { getItem: (k) => (mem.has(k) ? mem.get(k) : null), setItem: (k, v) => mem.set(k, String(v)), removeItem: (k) => mem.delete(k), key: (i) => [...mem.keys()][i] ?? null, get length() { return mem.size; } };
globalThis.sessionStorage ??= globalThis.localStorage;
const imp = (f) => import(pathToFileURL(join(ROOT, f)).href);

let checks = 0; const fails = [];
const check = (ok, area, msg) => { checks++; if (!ok) fails.push(`[${area}] ${msg}`); };

const lp = await imp("WebXR/shared/lp-programme.js");
const data = await imp("WebXR/shared/lp-programme-data.js");
const { COMPETENCY_BY_ID } = await imp("WebXR/shared/competency.js");
const catalog = JSON.parse(readFileSync(join(W, "smartcity/catalog.json"), "utf8"));
const stations = new Map(catalog.stations.map((s) => [s.id, s]));
const unions = new Set(JSON.parse(readFileSync(join(ROOT, "tools/unions.json"), "utf8")).unions.map((u) => u.id));
let lookup = () => null, npIds = [];
try { const np = await imp("WebXR/shared/np-parishes.js"); lookup = (id) => { try { return np.npParish(id) ?? null; } catch (_) { return null; } }; npIds = np.NP_PARISHES.map((p) => p.id); } catch (e) { check(false, "places", `np-parishes.js did not load: ${e.message}`); }
const opts = { stationIds: new Set(stations.keys()), simIds: new Set(lp.LP_SIMS.map((s) => s.id)), lookup };

// ---------------------------------------------------------------- 1 facts
const norm = (s) => s.replace(/\*\*/g, "").replace(/\s+/g, " ").trim();
const FACTS = norm(readFileSync(join(ROOT, "docs/sources/la-facts.md"), "utf8"));
const inFacts = (s) => FACTS.includes(norm(s));
let figures = 0;
for (const t of lp.LP_TRACKS) {
  for (const f of t.figures) { figures++; check(inFacts(f), "facts", `${t.id}: figure not verbatim in the facts file: "${f}"`); }
  for (const w of t.workTypes) check(inFacts(w.facts), "facts", `${t.id}/${w.id}: work-type phrase not in the facts file: "${w.facts}"`);
  for (const g of t.gaps ?? []) check(inFacts(g.facts), "facts", `${t.id}: gap phrase not in the facts file: "${g.facts}"`);
  check(inFacts(t.source.split(";")[0].trim()), "facts", `${t.id}: source not named by the facts file: ${t.source}`);
}
const PAGE = existsSync(join(W, "louisiana/index.html")) ? readFileSync(join(W, "louisiana/index.html"), "utf8") : "";
const DOC = existsSync(join(ROOT, "docs/louisiana-programme.md")) ? readFileSync(join(ROOT, "docs/louisiana-programme.md"), "utf8") : "";
const text = (h) => h.replace(/<script[\s\S]*?<\/script>/g, " ").replace(/<style[\s\S]*?<\/style>/g, " ").replace(/<[^>]+>/g, " ").replace(/&amp;/g, "&").replace(/&quot;/g, "\"").replace(/&lt;/g, "<").replace(/&gt;/g, ">");
const TXT = { page: text(PAGE), handbook: DOC };
const DATA_SRC = readFileSync(join(W, "shared/lp-programme-data.js"), "utf8");
for (const [where, body] of Object.entries({ ...TXT, data: DATA_SRC })) {
  for (const m of body.matchAll(/\$\s?[\d][\d,.]*\+?\s*(?:million|billion|M|B)?/gi)) check(inFacts(m[0].trim()), "facts", `${where}: money figure "${m[0].trim()}" is not in the facts file`);
  for (const m of body.matchAll(/\b\d{1,3}(?:,\d{3})+\+?\s+(?:[a-z-]+\s){0,3}(?:jobs|positions|opportunities)/gi)) check(inFacts(m[0]), "facts", `${where}: job figure "${m[0]}" is not in the facts file`);
  for (const m of body.matchAll(/\d+(?:\.\d+)?\s?%/g)) { const ctx = body.slice(Math.max(0, m.index - 40), m.index + 30); check(/60–80% hired locally/.test(ctx), "facts", `${where}: a percentage is not allowed ("${ctx.replace(/\s+/g, " ")}")`); }
  check(!/\b(boomtown|fastest[- ]growing|growth rate of)\b/i.test(body), "facts", `${where}: growth claim`);
  // partnership: only the no-partnership statement and the facts file's own "coastal restoration partnering" may use the word
  const stripped = body.split(lp.LP_NO_PARTNERSHIP).join(" ").split(data.LP_NO_PARTNERSHIP.replace(/"/g, "&quot;")).join(" ").replace(/coastal restoration partnering \(marsh creation\)/g, " ").replace(/no partnership/gi, " ").replace(/LP_NO_PARTNERSHIP/g, " ");
  check(!/partner/i.test(stripped), "facts", `${where}: the word "partner" outside the no-partnership statement ("${(stripped.match(/.{0,50}partner.{0,40}/i) ?? [""])[0]}")`);
  check(!/\b(official|certified|approved) (training )?(provider|programme|program) (of|for)\b|\bon behalf of\b|\bhiring (for|now)\b|\bwill hire\b/i.test(stripped), "facts", `${where}: an employer or partner claim`);
}
check(PAGE.includes("data-lp-nopartner") && DOC.includes("no partnership"), "facts", "page or handbook lacks the no-partnership statement");

// ---------------------------------------------------------------- 2 places (guarded)
const SP = "/tmp/claude-0/-home-user-vr-safety-training/a03145a7-edb6-5a38-ad6a-02d8825a11f7/scratchpad/louisiana";
const published = new Set();
let idsFiles = 0;
if (existsSync(SP)) for (const f of readdirSync(SP).filter((f) => f.endsWith("-ids.md"))) { idsFiles++; for (const m of readFileSync(join(SP, f), "utf8").matchAll(/\b([a-z][a-z0-9]*(?:-[a-z0-9]+)+)\b/g)) published.add(m[1]); }
let placeCount = 0, livePlaces = 0, mapsInTree = new Set();
for (const t of lp.LP_TRACKS) {
  const g = lp.lpGuardPlaces(t, lookup);
  placeCount += g.live.length + g.pending.length; livePlaces += g.live.length;
  for (const p of t.places) {
    const inTree = !!lookup(p.map);
    if (inTree) mapsInTree.add(p.map);
    for (const s of p.sites) {
      if (inTree) check(lp.lpSiteLive(p.map, s, lookup), "places", `${t.id}: ${p.map} is in the tree but has no site ${s}`);
      if (published.size) check(published.has(s), "places", `${t.id}: site ${s} is not in any published ids file`);
    }
    if (published.size) check(published.has(p.map), "places", `${t.id}: map ${p.map} is not in any published ids file`);
  }
}
for (const p of lp.LP_SIM_PLACES) check(lp.LP_TRACKS.some((t) => t.places.some((q) => q.map === p.map && q.sites.includes(p.site))) || published.has(p.site), "places", `sim place ${p.map}/${p.site} is not a fixed site`);
// the guard both ways, on a stub
const stubMap = { id: "la-meta-richland", sites: [{ id: "lmr-data-hall-fitout" }] };
const stub = (id) => (id === "la-meta-richland" ? stubMap : null);
check(lp.lpGuardPlaces(lp.lpTrack("meta-richland"), stub).live.length === 1, "places", "guard: a landed map's site did not go live");
check(lp.lpGuardPlaces(lp.lpTrack("meta-richland"), () => null).live.length === 0, "places", "guard: an absent map's site went live");
check(lp.lpSimPlaces("la-meta-richland", stub).some((p) => p.sim === "lp-sim-data-hall-energised-work" && p.site === "lmr-data-hall-fitout"), "places", "guard: a landed sim place did not resolve");
check(lp.lpSimPlaces("la-meta-richland", () => null).length === 0, "places", "guard: a sim place resolved with no map");
check(lp.lpSimPlaces("la-meta-richland", () => { throw new Error("x"); }).length === 0, "places", "guard: a throwing lookup broke the guard");
for (const pend of lp.LP_TRACKS.flatMap((t) => lp.lpGuardPlaces(t, lookup).pending)) check(!PAGE.includes(`href="../parishes/index.html?parish=${pend.map}`), "places", `page links a pending map ${pend.map}`);

// ---------------------------------------------------------------- 3 training
let cells = 0;
for (const t of lp.LP_TRACKS) {
  check(t.workTypes.length >= 2 || t.id === "growth-cities", "training", `${t.id}: fewer than two kinds of work`);
  check(new Set(t.workTypes.flatMap((w) => w.crafts.map((c) => c.union))).size >= 3 || t.id === "fastsites", "training", `${t.id}: fewer than three crafts`);
  for (const w of t.workTypes) {
    for (const s of w.stations) check(stations.has(s), "training", `${t.id}/${w.id}: station ${s} is not in the catalog`);
    for (const c of w.crafts) check(unions.has(c.union), "training", `${t.id}/${w.id}: union ${c.union} is not in tools/unions.json`);
    for (const s of w.sims) check(opts.simIds.has(s), "training", `${t.id}/${w.id}: sim ${s} is not defined`);
    check(w.stations.length >= 1, "training", `${t.id}/${w.id}: no station`);
  }
  for (const p of t.pathways) check(!!lp.lpPathway(p), "training", `${t.id}: pathway ${p} missing`);
}
for (const r of lp.lpMatrix(opts)) { cells++; check(stations.has(r.station) && unions.has(r.union), "training", `matrix cell ${r.track}/${r.workType}/${r.union}/${r.station} does not resolve`); }
check(cells >= 100, "training", `matrix has only ${cells} links`);

// ---------------------------------------------------------------- 4 pathways
const LEVELS = ["aware", "entry", "appr", "jw", "lead"];
check(lp.LP_PATHWAYS.length === 6, "pathways", `expected 6 role pathways, found ${lp.LP_PATHWAYS.length}`);
let levels = 0;
for (const p of lp.LP_PATHWAYS) {
  for (const s of [...p.stations, ...p.k12]) check(stations.has(s), "pathways", `${p.id}: station ${s} is not in the catalog`);
  for (const c of p.crafts) check(unions.has(c.union), "pathways", `${p.id}: union ${c.union} is not in tools/unions.json`);
  for (const t of p.tracks) check(!!lp.lpTrack(t), "pathways", `${p.id}: track ${t} missing`);
  const ls = lp.lpPathways(p.id, opts);
  check(ls.map((l) => l.level).join() === LEVELS.join(), "pathways", `${p.id}: levels ${ls.map((l) => l.level).join()}`);
  for (const l of ls) {
    levels++;
    check(!!l.credential && !!COMPETENCY_BY_ID[l.credential.id], "pathways", `${p.id}/${l.level}: no credential`);
    check(l.earnable, "pathways", `${p.id}/${l.level}: credential ${l.credential?.id} not earnable in the module (${l.credential?.overlap}+${l.capstone.length}/${l.credential?.require})`);
    check(l.stations.length > 0, "pathways", `${p.id}/${l.level}: empty`);
  }
}

// ---------------------------------------------------------------- 5 sims
const stepCache = new Map();
const stepsOf = (id) => {
  if (!stepCache.has(id)) {
    const f = join(W, "smartcity", "js", "sims", `${id}.js`);
    const src = existsSync(f) ? readFileSync(f, "utf8") : null;
    stepCache.set(id, src ? new Set([...src.matchAll(/\b"?id"?: "([^"]+)"/g)].filter((m) => { const w = src.slice(m.index, m.index + 1500); const end = w.indexOf("\n    },"); const body = end > 0 ? w.slice(0, end) : w; return /\b"?title"?: "/.test(body) && /\b"?cue"?: "/.test(body); }).map((m) => m[1])) : null);
  }
  return stepCache.get(id);
};
const FEAR = /\b(injur\w*|blood\w*|gore|death|die[sd]?|dying|kill\w*|victim|terrif\w*|panic|horror|wound\w*|fatal\w*|electrocut\w*)\b/i;
check(lp.LP_SIMS.length >= 6, "sims", `only ${lp.LP_SIMS.length} simulations`);
let simSteps = 0;
for (const sim of lp.LP_SIMS) {
  check(sim.id.startsWith("lp-sim-") && sim.name && sim.briefing?.length > 80, "sims", `${sim.id}: id, name or briefing`);
  check(!!lp.lpTrack(sim.track), "sims", `${sim.id}: track ${sim.track}`);
  for (const u of sim.unions) check(unions.has(u), "sims", `${sim.id}: union ${u}`);
  check(sim.steps.length >= 6 && sim.steps.some((s) => s.gate), "sims", `${sim.id}: needs 6+ steps and an order gate`);
  check(new Set(sim.steps.map((s) => s.id)).size === sim.steps.length, "sims", `${sim.id}: duplicate step ids`);
  const gates = new Set(sim.steps.filter((s) => s.gate).map((s) => s.id));
  for (const s of sim.steps) {
    simSteps++;
    check(stations.has(s.station), "sims", `${sim.id}/${s.id}: station ${s.station} not in the catalog`);
    check(stepsOf(s.station)?.has(s.step), "sims", `${sim.id}/${s.id}: ${s.station} has no step ${s.step}`);
    for (const r of s.requires) check(gates.has(r), "sims", `${sim.id}/${s.id}: requires ${r}, not a gate of this sim`);
    check(s.practice && s.safe && s.unsafe, "sims", `${sim.id}/${s.id}: practice/safe/unsafe`);
    check(!FEAR.test(`${s.practice} ${s.safe} ${s.unsafe}`), "sims", `${sim.id}/${s.id}: fear or injury wording`);
    check(!/\$|million|billion/.test(`${s.practice} ${s.safe} ${s.unsafe}`), "sims", `${sim.id}/${s.id}: a project figure in a step`);
  }
  check(!FEAR.test(sim.briefing), "sims", `${sim.id}: fear or injury wording in the briefing`);
  check(lp.LP_SIM_PLACES.some((p) => p.sim === sim.id), "sims", `${sim.id}: no place`);
}
const reg = []; const places = [];
const n = lp.lpRegisterSims({ psRegisterSims: (sims, f) => { reg.push(...sims); places.push(f); }, lookup: stub });
check(n === lp.LP_SIMS.length && reg.length === n && places[0]?.("la-meta-richland").length >= 1 && places[0]?.("orleans").length === 0, "sims", "lpRegisterSims did not register guarded places");
check(lp.lpRegisterSims({}) === 0, "sims", "lpRegisterSims without PROJECTSIM should do nothing");
check(lp.lpDeanModules().every((m) => m.id.startsWith("laprogramme:") && m.stations.every((s) => stations.has(s))), "sims", "DEAN simulation modules");
const APP = readFileSync(join(W, "parishes/js/app.js"), "utf8");
check(/lpRegisterSims\(/.test(APP), "sims", "the parishes app does not mount lpRegisterSims");

// ---------------------------------------------------------------- 6 templates
const dn = await imp("WebXR/shared/dn-modules.js");
const tpls = lp.lpTemplates(opts);
check(tpls.length === 30, "templates", `expected 30 DEAN templates, found ${tpls.length}`);
for (const t of tpls) {
  let v = null; try { v = dn.dnValidateDoc(t.module); } catch (e) { v = { ok: false, errors: [e.message] }; }
  const ok = v === true || v?.ok === true || (Array.isArray(v) && v.length === 0) || (v && Array.isArray(v.errors) && v.errors.length === 0);
  check(ok, "templates", `${t.module.id}: dnValidateDoc ${JSON.stringify(v).slice(0, 160)}`);
  check(t.module.lessons.every((l) => stations.has(l.id)), "templates", `${t.module.id}: a lesson does not resolve`);
  check(t.guide.objectives.length && t.guide.debrief.length && t.guide.assessment, "templates", `${t.module.id}: instructor guide incomplete`);
  check(DOC.includes(`\`${t.module.id}\``), "templates", `${t.module.id}: missing from the handbook`);
}

// ---------------------------------------------------------------- 7 page
check(PAGE.length > 0 && DOC.length > 0, "page", "run node tools/gen_la_programme.mjs");
check(/shared\/design\.css/.test(PAGE) && /class="home-chip"/.test(PAGE) && /gdMount/.test(PAGE), "page", "design system, Home chip or Guide missing");
check(/SmartCiti\.X · Powered by AGI Corp/.test(PAGE), "page", "brand line missing");
for (const t of lp.LP_TRACKS) check(PAGE.includes(`data-lp-track="${t.id}"`), "page", `track ${t.id} missing from the page`);
for (const s of lp.LP_SIMS) check(PAGE.includes(`data-lp-simcard="${s.id}"`), "page", `sim ${s.id} missing from the page`);
check(PAGE.includes("The project layout is illustrative; the parish, waterways and towns are real."), "page", "illustrative-layout line missing");
const files = { page: PAGE, handbook: DOC, data: DATA_SRC, fns: readFileSync(join(W, "shared/lp-programme.js"), "utf8"), console: existsSync(join(ROOT, "docs/consoles/LA-PROGRAMME.md")) ? readFileSync(join(ROOT, "docs/consoles/LA-PROGRAMME.md"), "utf8") : "" };
for (const [k, v] of Object.entries(files)) check(!/claude-(opus|sonnet|haiku)|\bopus[- ]\d|\bsonnet[- ]\d/i.test(v), "page", `${k}: a model identifier`);
check(files.console.includes("## Cycles"), "page", "docs/consoles/LA-PROGRAMME.md has no Cycles section");

if (fails.length) { for (const f of fails.slice(0, 40)) console.log("FAIL", f); console.log(`check_la_programme: FAILED ${fails.length} of ${checks} checks`); process.exit(1); }
console.log(`check_la_programme: ok — ${checks} checks · ${lp.LP_TRACKS.length} tracks (${figures} quoted figures, all in the facts file) · ${lp.LP_PATHWAYS.length} pathways × ${LEVELS.length} levels (${levels}, all earnable) · ${tpls.length} DEAN templates · ${cells} matrix links · ${lp.LP_SIMS.length} simulations (${simSteps} steps, all real station steps) · places ${livePlaces} live / ${placeCount - livePlaces} pending (guarded; ${mapsInTree.size} programme maps in this tree; ${idsFiles} ids files read)`);
