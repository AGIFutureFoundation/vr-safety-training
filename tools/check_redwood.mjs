/**
 * Redwood Reach (console REDWOOD, docs/consoles/REDWOOD.md): size, chunks,
 * budgets, sites and their stations, the river and the pads, quests and
 * their skill gates, field tins (verbatim lessons), field lessons, scored
 * activities, the progress rules, and the bundle and its links.
 *
 *     node tools/check_redwood.mjs
 */
import { readFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const WEBXR = join(ROOT, "WebXR");
const imp = (rel) => import(pathToFileURL(join(WEBXR, rel)).href);
const D = await imp("redwood/js/rw-data.js");
const L = await imp("redwood/js/rw-lore-data.js");
const C = await imp("redwood/js/rw-career.js");
const { CURRICULA } = await imp("smartcity/js/curricula.js");
const catalog = JSON.parse(readFileSync(join(WEBXR, "smartcity", "catalog.json"), "utf8"));
const stationIds = new Set(catalog.stations.map((s) => s.id));

let fails = 0, passes = 0;
const ok = (cond, what) => { if (cond) passes += 1; else { fails += 1; console.log(`✗ ${what}`); } };

// ---- size, chunks, budgets
ok(D.RW_SIZE >= 4000, `world is at least 4000 m on a side (${D.RW_SIZE})`);
ok(D.RW_CHUNKS * D.RW_CHUNK === D.RW_SIZE && D.RW_CHUNKS >= 16, "the field divides into at least 16 × 16 chunks");
for (const [tier, b] of Object.entries(D.RW_BUDGET)) {
  const ring = (2 * b.radius + 1) ** 2;
  ok(ring * (b.segments + 1) ** 2 <= 60000, `${tier}: streamed ground vertices within 60k (${ring * (b.segments + 1) ** 2})`);
  ok(ring * b.trees <= 9000, `${tier}: tree instances within 9k (${ring * b.trees})`);
  ok(b.radius * D.RW_CHUNK >= b.fog * 0.75, `${tier}: the chunk ring reaches most of the fog distance`);
}
ok(D.RW_BUDGET.low.trees < D.RW_BUDGET.high.trees && D.RW_BUDGET.low.segments < D.RW_BUDGET.high.segments, "the low tier is lighter than high");
let lo = Infinity, hi = -Infinity, finite = true;
for (let x = D.RW_BOUNDS.minX; x <= D.RW_BOUNDS.maxX; x += 128) for (let z = D.RW_BOUNDS.minZ; z <= D.RW_BOUNDS.maxZ; z += 128) {
  const h = D.rwHeightAt(x, z); if (!Number.isFinite(h)) finite = false; lo = Math.min(lo, h); hi = Math.max(hi, h);
}
ok(finite, "the height field is finite everywhere");
ok(lo < 0 && hi > 250, `the land runs from the sea to high ridges (${lo.toFixed(0)}..${hi.toFixed(0)} m)`);
ok(D.rwIsWater(-1040, 1990) && D.rwIsWater(0, 2000), "the estuary and the sea are water");
const { rwChunkTrees } = { rwChunkTrees: null };
void rwChunkTrees;

// ---- sites
ok(D.RW_SITES.length >= 10, `at least ten work sites (${D.RW_SITES.length})`);
const kinds = new Set(D.RW_SITES.map((s) => s.kind));
for (const k of ["fire-station", "lookout", "sawmill", "restoration", "campground", "nursery", "substation", "estuary", "equipment-yard", "trail-camp"]) ok(kinds.has(k), `site kind ${k} exists`);
for (const s of D.RW_SITES) {
  ok(s.stations.length >= 1, `${s.id}: its job board opens at least one station`);
  for (const id of s.stations) ok(stationIds.has(id), `${s.id}: station ${id} is in the catalog`);
  const r = D.rwRiverNearest(...s.position);
  ok(r.d > D.rwRiverHalfWidth(r.t) + s.pad + 60, `${s.id}: its pad stays clear of the river`);
  ok(!D.rwIsWater(...s.position), `${s.id}: stands on land`);
  ok(Math.abs(D.rwHeightAt(...s.position) - s.padY) < 0.5, `${s.id}: the pad is level at its centre`);
  ok(/^[A-Z]/.test(s.name) && s.blurb.length > 40, `${s.id}: has a name and a blurb`);
}

// ---- quests and gates
ok(D.RW_MAIN_ARC.length >= 5, "a main arc of at least five quests");
ok(D.RW_SIDE_QUESTS.length >= 8, `at least eight side quests (${D.RW_SIDE_QUESTS.length})`);
const siteIds = new Set(D.RW_SITES.map((s) => s.id)), actIds = new Set(D.RW_ACTIVITIES.map((a) => a.id));
for (const q of [...D.RW_MAIN_ARC, ...D.RW_SIDE_QUESTS]) {
  for (const st of q.steps) {
    if (st.site) ok(siteIds.has(st.site), `${q.id}: step site ${st.site} exists`);
    if (st.station) ok(stationIds.has(st.station), `${q.id}: step station ${st.station} exists`);
    if (st.activity) ok(actIds.has(st.activity), `${q.id}: step activity ${st.activity} exists`);
  }
}
const gated = D.rwGatedItems();
ok(gated.length >= 8, `gated items exported (${gated.length})`);
for (const g of gated) {
  ok(g.gate.note && g.gate.note.length > 10, `${g.id}: its lock has a reason`);
  for (const id of g.gate.stations ?? []) ok(stationIds.has(id), `${g.id}: gate station ${id} exists`);
}
const noneDone = () => false, allDone = () => true;
const fresh = C.rwFresh();
ok(D.RW_SIDE_QUESTS.every((q) => C.rwQuestStatus(fresh, q, noneDone) === "locked"), "a fresh profile sees every side quest locked");
ok(D.RW_SIDE_QUESTS.every((q) => C.rwQuestStatus(fresh, q, allDone) === "open"), "a profile with the stations sees them open");

// ---- progress rules
{
  const st = C.rwFresh();
  C.rwAdvance(st, { type: "goto", site: "fire-station" }, noneDone);
  C.rwAdvance(st, { type: "goto", site: "old-growth" }, noneDone);
  ok(st.quests["rw-main-1-arrive"]?.done && st.xp >= 100, "the first main quest completes on its two visits");
  ok(C.rwCurrentObjective(st, noneDone)?.quest.id === "rw-main-2-lookout", "the objective moves to the next quest");
  const r = C.rwFind(st, L.RW_EGGS[0].id); const again = C.rwFind(st, L.RW_EGGS[0].id);
  ok(r.fresh && !again.fresh, "a field tin is found once");
  const mem = new Map(); const store = { getItem: (k) => mem.get(k) ?? null, setItem: (k, v) => mem.set(k, v) };
  C.rwSave(store, st);
  ok(C.rwLoad(store).found.length === 1, "progress persists through the store");
  for (const a of D.RW_ACTIVITIES) {
    ok(C.rwScoreActivity(a.id, a.waypoints.map((w) => w.answer)).score === 100, `${a.id}: all safe calls score 100`);
    ok(C.rwScoreActivity(a.id, a.waypoints.map((w) => 1 - w.answer)).score === 0, `${a.id}: no safe calls score 0`);
  }
}

// ---- activities
ok(D.RW_ACTIVITIES.length >= 3, "three scored activities");
for (const id of ["trail-crew-route", "fuel-break-survey", "river-count"]) ok(actIds.has(id), `activity ${id} exists`);
for (const a of D.RW_ACTIVITIES) for (const w of a.waypoints) {
  ok(w.options[w.answer] !== undefined, `${a.id}: every point has a valid answer`);
  ok(!/\d/.test(w.q + w.options.join(" ")), `${a.id}: no number stated as a limit ("${w.q.slice(0, 30)}…")`);
}

// ---- field tins
ok(L.RW_EGGS.length >= 30, `at least thirty field tins (${L.RW_EGGS.length})`);
const whys = new Map();
for (const p of CURRICULA) for (const s of p.stations) whys.set(`${p.id}/${s.id}`, s.why ?? "");
for (const e of L.RW_EGGS) {
  ok(D.rwLandmark(e.landmark), `${e.id}: its landmark exists`);
  ok(whys.get(`${e.cites.programme}/${e.cites.stationId}`)?.includes(e.lesson), `${e.id}: its lesson is a verbatim quote of the cited station's why`);
  ok(!D.rwIsWater(...e.position) || e.landmark === "log-jam", `${e.id}: sits on land`);
}
ok(new Set(L.RW_EGGS.map((e) => e.id)).size === L.RW_EGGS.length, "field tin ids are unique");
ok(new Set(L.RW_EGGS.map((e) => e.set)).size >= 8, "field tins fall into themed sets");

// ---- field lessons
ok(L.RW_FIELD_LESSONS.length >= 10, `ten field lessons (${L.RW_FIELD_LESSONS.length})`);
for (const fl of L.RW_FIELD_LESSONS) {
  ok(stationIds.has(fl.k12) && fl.k12.startsWith("k12-"), `${fl.id}: tied to a K-12 station in the catalog`);
  ok(siteIds.has(fl.site) && D.rwLandmark(fl.landmark), `${fl.id}: anchored at a site and landmark`);
  ok(fl.steps.length >= 2 && fl.steps.length <= 4, `${fl.id}: two to four steps`);
  ok(fl.steps.every((s) => s.split(/\s+/).length <= 26), `${fl.id}: each step is one short idea`);
  ok(fl.check.options[fl.check.answer] !== undefined, `${fl.id}: the check question has an answer`);
  ok(fl.tradeLine && fl.trade, `${fl.id}: names the trade that uses the idea`);
}

// ---- bundle, page and links
const src = readFileSync(join(ROOT, "tools", "bundle_webxr.py"), "utf8");
ok(/"redwood": \{/.test(src) && /"redwood": "redwood.html"/.test(src), "the bundler builds redwood and publishes it flat");
const dist = join(WEBXR, "redwood", "dist", "redwood.html");
ok(existsSync(dist), "WebXR/redwood/dist/redwood.html is built");
if (existsSync(dist)) {
  const html = readFileSync(dist, "utf8");
  ok(html.includes("rwBuildWorld") && html.includes("Redwood Reach"), "the bundle carries the world");
  ok(html.includes('href="../../index.html"'), "the bundle's Home chip reaches the homepage");
}
const page = readFileSync(join(WEBXR, "redwood", "redwood.html"), "utf8");
ok(page.includes('href="../index.html"') && page.includes('id="menu-start"'), "the page has Home and a start button");
const app = readFileSync(join(WEBXR, "redwood", "js", "app.js"), "utf8");
ok(/gdMount\(\)/.test(app) && /ctlMount\(/.test(app), "the page mounts the Guide and the control grammar");
ok(/lkStationLink\(/.test(app) && /from: "redwood"/.test(app), "job boards route through links.js with the way home");
for (const f of ["index.html", "home.html"]) {
  const p = join(WEBXR, f);
  if (existsSync(p)) ok(readFileSync(p, "utf8").includes(f === "index.html" ? "redwood/redwood.html" : "redwood.html"), `${f}: the homepage links Redwood Reach`);
}

console.log(fails ? `check_redwood: ${fails} failed, ${passes} passed` : `check_redwood: all ${passes} checks pass (${D.RW_SIZE} m, ${D.RW_CHUNKS ** 2} chunks, ${D.RW_SITES.length} sites, ${L.RW_EGGS.length} tins, ${L.RW_FIELD_LESSONS.length} lessons, ${D.RW_SIDE_QUESTS.length} gated quests)`);
process.exit(fails ? 1 : 0);
