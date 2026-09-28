#!/usr/bin/env node
/**
 * Sierra Summit (WebXR/summit, console SUMMIT): size, chunks, sites, links,
 * eggs, field lessons, quests and gates, activities, budgets and wiring.
 *
 *     node tools/check_summit.mjs
 *
 * Headless: reads shared/summit-data.js and summit/js/state.js directly,
 * the catalog for every station id, and each cited station's own source
 * file for every field-note quote.
 */
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const WEBXR = join(ROOT, "WebXR");
let failures = 0, passes = 0;
const check = (ok, msg) => { if (ok) passes++; else { failures++; console.error(`  FAIL ${msg}`); } };

const D = await import(pathToFileURL(join(WEBXR, "shared", "summit-data.js")).href);
const S = await import(pathToFileURL(join(WEBXR, "summit", "js", "state.js")).href);
const LK = await import(pathToFileURL(join(WEBXR, "shared", "links.js")).href);
const catalog = JSON.parse(readFileSync(join(WEBXR, "smartcity", "catalog.json"), "utf8"));
const stationIds = new Set(catalog.stations.map((s) => s.id));
const programmeIds = new Set(catalog.curricula.map((c) => c.id));

// 1. size and chunks
check(D.SM_BOUNDS.maxX - D.SM_BOUNDS.minX >= 4000 && D.SM_BOUNDS.maxZ - D.SM_BOUNDS.minZ >= 4000, "world is at least 4000 x 4000 m");
check(D.SM_CHUNKS_PER_SIDE * D.SM_CHUNK === D.SM_SIZE, "chunks tile the field exactly");
check(D.SM_CHUNKS_PER_SIDE ** 2 >= 200, "at least 200 terrain chunks");
for (const [tier, r] of Object.entries(D.SM_STREAM_RADIUS)) check((2 * r + 1) ** 2 <= D.SM_BUDGET.chunksLoaded, `${tier}: streamed square fits the chunk budget`);
const mid = D.smChunksAround(0, 0, 3);
check(mid.length === 49 && mid.filter((c) => c.ring === 0).length === 1, "smChunksAround returns a 7x7 square with one centre chunk");
check(D.smChunksAround(-2040, -2040, 3).length === 16, "streaming clamps at the world edge");
let lo = Infinity, hi = -Infinity;
for (let i = 0; i < 4096; i++) { const h = D.smHeightAt(-2048 + (i % 64) * 64, -2048 + Math.floor(i / 64) * 64); lo = Math.min(lo, h); hi = Math.max(hi, h); check(Number.isFinite(h), "height is finite"); }
check(hi - lo > 1000, `relief over 1000 m (got ${Math.round(hi - lo)})`);
check(hi > D.SM_SNOWLINE && lo < D.SM_TREELINE, "the field spans valley forest to snow");
const trees = D.smTreesForChunk(3, 12);
check(trees.length > 20 && trees.every((t) => t.y < D.SM_TREELINE), "a valley chunk carries conifers, all below the treeline");

// 1b. frame budget (tools/briefs/next/summit-next.md, phase 1): the pure
// estimate of one streamed view per tier stays inside SM_BUDGET.triangles,
// ring 2 carries at most half of ring 0's trees and draws impostors, and the
// player's chunk is held to 32 segments or fewer.
for (const tier of Object.keys(D.SM_STREAM_RADIUS)) {
  const est = D.smTriangleEstimate(tier);
  check(est <= D.SM_BUDGET.triangles, `${tier}: worst-case streamed view ${est} triangles within the ${D.SM_BUDGET.triangles} budget`);
}
check(D.smTriangleEstimate("low") < D.smTriangleEstimate("high"), "the low tier streams fewer triangles than high");
check(D.SM_TREE_RING_FACTOR[2] <= 0.3 && D.SM_IMPOSTOR_RING <= 2, "ring 2 carries at most three tenths of the trees and draws billboard impostors");
check(D.SM_LOD_SEGMENTS[0] <= 32 && D.SM_LOD_SEGMENTS.every((v, i, a) => i === 0 || v <= a[i - 1]), "LOD ring 0 is 32 segments or fewer and the rings coarsen outward");
check(D.SM_TRI.impostor < D.SM_TRI.conifer / 4, "an impostor costs under a quarter of a conifer");

// 1c. terrain character (phase 2): the snowline varies with aspect, the
// river descends from the powerhouse and stays out of the reservoir and off
// every pad, and it yields to the pass road at one culvert.
check(D.smSnowlineAt(-1) < D.SM_SNOWLINE && D.smSnowlineAt(1) > D.SM_SNOWLINE, "the snowline is lower on north-facing ground and higher on south-facing");
check(Math.abs(D.smGradAt(250, -1600).aspect + 1) < 0.3 && Math.abs(D.smGradAt(250, -1100).aspect - 1) < 0.3, "the main peak's north face reads north and its south face south");
{
  const R = D.SM_RIVER, ph = D.smPlace("powerhouse");
  check(Math.hypot(R[0][0] - ph.at[0], R[0][1] - ph.at[1]) < 60, "the river rises at the powerhouse");
  check(Math.abs(R[R.length - 1][0]) >= 2000 || Math.abs(R[R.length - 1][1]) >= 2000, "the river leaves the field");
  const lens = [0]; for (let i = 1; i < R.length; i++) lens.push(lens[i - 1] + Math.hypot(R[i][0] - R[i - 1][0], R[i][1] - R[i - 1][1]));
  const total = lens[lens.length - 1];
  let prev = null, rises = 0, culverts = 0, wet = 0;
  for (let k = 0; k <= 200; k++) {
    const d = total * k / 200; let i = 1; while (i < lens.length - 1 && lens[i] < d) i++;
    const u = (d - lens[i - 1]) / (lens[i] - lens[i - 1]);
    const x = R[i - 1][0] + (R[i][0] - R[i - 1][0]) * u, z = R[i - 1][1] + (R[i][1] - R[i - 1][1]) * u;
    const nearRoad = D.smPolyDistance(x, z, D.SM_PASS_ROAD).d < 40;
    const h = D.smHeightAt(x, z);
    if (prev !== null && h > prev + 0.6 && !nearRoad) rises++;
    if (nearRoad) culverts++;
    if (D.smInRiver(x, z) && !nearRoad) wet++;
    prev = h;
    check(!D.smInLake(x, z), "the river is not in the reservoir");
    check(D.SM_SITES.every((st) => Math.hypot(x - st.at[0], z - st.at[1]) > st.pad * 1.8), "the river keeps off every site pad");
  }
  check(rises === 0, `the river bed never rises downstream away from the culvert (${rises} rises)`);
  check(culverts > 0 && culverts < 12, `the river crosses the pass road once, under a culvert (${culverts} samples near the road)`);
  check(wet > 180, `the channel reads as water along its length (${wet} of 200 samples)`);
  check(D.smRiverSurfaceAt(0) > D.smRiverSurfaceAt(1), "the river's surface descends from source to exit");
  check(D.smTreesForChunk(4, 12).every((t) => D.smPolyDistance(t.x, t.z, R).d > D.SM_RIVER_CHANNEL.width), "no conifer stands in the river channel");
}
const builderSrc = readFileSync(join(WEBXR, "shared", "summit.js"), "utf8");
check(/smImpostorGeometry/.test(builderSrc) && /SM_IMPOSTOR_RING/.test(builderSrc), "the builder draws impostors from the impostor ring");
check(/smSnowlineAt\(aspect\)/.test(builderSrc) && /smBandNoise/.test(builderSrc), "the ground colour uses the aspect snowline and banded strata");
check(/summit-river/.test(builderSrc) && /smRiverSurfaceAt/.test(builderSrc), "the builder lays the river on its own descending surface");

// 2. sites and stations
const work = D.SM_SITES.filter((s) => s.stations.length);
check(work.length >= 8, "at least eight work sites with job boards");
for (const need of ["substation", "ridge-line", "dam", "pass-road", "tunnel-portal", "gondola-shop", "ranger-station", "water-plant"]) check(D.SM_SITES.some((s) => s.id === need), `site ${need} exists`);
for (const s of D.SM_SITES) {
  for (const id of s.stations) check(stationIds.has(id), `${s.id}: station ${id} is in the catalog`);
  check(!D.smInLake(...s.at), `${s.id}: not in the reservoir`);
  check(D.smZoneAt(...s.at).id === s.zone, `${s.id}: sits in its own zone (${s.zone})`);
  check(Math.abs(D.smHeightAt(s.at[0] + s.pad * 0.5, s.at[1]) - D.smHeightAt(...s.at)) < 0.5, `${s.id}: its pad is flat`);
  for (const id of s.stations) {
    const link = LK.lkStationLink(id, { runner: "../smartcity/index.html", from: "summit", page: "/summit/index.html", siteId: s.id });
    check(link.startsWith("../smartcity/index.html?sim=") || link.startsWith("../trades/index.html?room="), `${id}: link opens the runner`);
    check(link.includes("from=summit") && link.includes(encodeURIComponent(`#site=${s.id}`)), `${id}: link carries the way back to ${s.id}`);
  }
}

// 3. eggs: count, verbatim quotes, places
check(D.SM_EGGS.length >= 30, `at least 30 field notes (got ${D.SM_EGGS.length})`);
check(new Set(D.SM_EGGS.map((e) => e.id)).size === D.SM_EGGS.length, "egg ids are unique");
for (const e of D.SM_EGGS) {
  const f = join(WEBXR, "smartcity", "js", "sims", `${e.cites.stationId}.js`);
  check(existsSync(f), `${e.id}: cited station source exists`);
  if (existsSync(f)) {
    const src = readFileSync(f, "utf8").replace(/\\'/g, "'").replace(/\\"/g, '"');
    check(src.includes(e.lesson), `${e.id}: lesson is quoted verbatim from ${e.cites.stationId}`);
    check(new RegExp(`id:\\s*"${e.cites.stepId}"`).test(src), `${e.id}: cited step ${e.cites.stepId} exists`);
  }
  check(e.kind === "egg" && e.steps.length === 2 && e.reward?.badge, `${e.id}: Bay World egg shape`);
  check(!D.smInLake(...e.at) && Math.abs(e.at[0]) < 2048 && Math.abs(e.at[1]) < 2048, `${e.id}: on dry land inside the field`);
  check(!!D.smPlace(e.place), `${e.id}: its place ${e.place} exists`);
}

// 4. field lessons
check(D.SM_FIELD_LESSONS.length >= 10, "at least 10 field lessons");
for (const l of D.SM_FIELD_LESSONS) {
  check(stationIds.has(l.k12) && l.k12.startsWith("k12-"), `${l.id}: tied to a K-12 station`);
  check(stationIds.has(l.station), `${l.id}: tied to a trade station`);
  check(l.minutes >= 2 && l.minutes <= 4 && l.steps.length >= 3, `${l.id}: 2-4 minutes, 3+ steps`);
  check(l.check.answer >= 0 && l.check.answer < l.check.choices.length, `${l.id}: check question has a valid answer`);
  check(!!D.smPlace(l.place) && !D.smInLake(...l.at), `${l.id}: anchored at a place on dry land`);
}

// 5. quests and gates
const qIds = new Set([...D.SM_MAIN_QUESTS, ...D.SM_SIDE_QUESTS].map((q) => q.id));
D.SM_MAIN_QUESTS.forEach((q, i) => check(i === 0 ? q.requires === null : q.requires === D.SM_MAIN_QUESTS[i - 1].id, `${q.id}: the main arc is one chain`));
check(D.SM_SIDE_QUESTS.length >= 6 && D.SM_SIDE_QUESTS.every((q) => q.gate?.note), "six or more side quests, each gated with a note");
for (const q of [...D.SM_MAIN_QUESTS, ...D.SM_SIDE_QUESTS]) {
  for (const s of q.steps) {
    if (s.type === "station") check(stationIds.has(s.target), `${q.id}: step station ${s.target} exists`);
    if (s.type === "goto") check(!!D.smPlace(s.target), `${q.id}: step place ${s.target} exists`);
  }
  if (q.requires) check(qIds.has(q.requires), `${q.id}: requires a real quest`);
}
for (const g of D.SM_GATED) {
  for (const id of g.gate.stations ?? []) check(stationIds.has(id), `${g.id}: gate station ${id} exists`);
  for (const id of g.gate.k12 ?? []) check(stationIds.has(id), `${g.id}: gate K-12 station ${id} exists`);
  for (const p of g.gate.programmes ?? []) check(programmeIds.has(p.id), `${g.id}: gate programme ${p.id} exists`);
  for (const id of g.gate.quests ?? []) check(qIds.has(id), `${g.id}: gate quest ${id} exists`);
  check(!!g.gate.note, `${g.id}: gate has a note`);
}
// Fresh profile: every gated side quest locked; with its stations done: open.
const fresh = S.smBlank();
const none = () => false;
for (const q of D.SM_SIDE_QUESTS) {
  check(!S.smGateOpen(q.gate, fresh, none), `${q.id}: locked for a fresh profile`);
  const done = new Set([...(q.gate.stations ?? []), ...(q.gate.k12 ?? [])]);
  const missing = S.smGateMissing(q.gate, fresh, (id) => done.has(id)).filter((m) => m.kind !== "programme");
  check(missing.length === 0, `${q.id}: open once its stations are done`);
}
// The main arc advances with visits and passes.
const st = S.smBlank();
st.visited.push("water-plant");
const got = S.smAdvanceQuests(st, (id) => id === "chlorine-room");
check(got.includes("sm-main-00-arrive") && got.includes("sm-main-01-water"), "visiting and passing advance the main arc in order");
check(S.smCurrentMain(st)?.id === "sm-main-02-dam", "the next main quest is the dam");
const lockedEgg = D.SM_EGGS.find((e) => e.gate);
check(S.smFindEgg(S.smBlank(), lockedEgg.id, none).locked === true, "a gated field note stays locked for a fresh profile");

// 6. activities
check(D.SM_ACTIVITIES.some((a) => a.kind === "orienteering") && D.SM_ACTIVITIES.some((a) => a.kind === "survey"), "an orienteering course and a survey route");
{
  const a = D.SM_ACTIVITIES.find((v) => v.kind === "orienteering");
  const run = S.smActStart(a.id);
  for (const [x, z] of a.controls) { S.smActStep(run, x, z, 0.1); S.smActStep(run, x, z, 0, { mapOpen: true }); }
  check(run.done && run.mapChecks === a.controls.length && run.score === a.controls.length * (a.scoring.control + a.scoring.mapCheck), "a clean orienteering run scores every control and map check");
  const b = D.SM_ACTIVITIES.find((v) => v.kind === "survey");
  const r2 = S.smActStart(b.id);
  S.smActStep(r2, b.avoid[0].at[0], b.avoid[0].at[1], 0.1);
  check(r2.score === -b.scoring.zoneEntryPenalty, "entering a marked avalanche zone costs points");
}

// 7. wiring: bundler, dist, homepage, passport name, links
const bundler = readFileSync(join(ROOT, "tools", "bundle_webxr.py"), "utf8");
check(/"summit":\s*\{[\s\S]*?"out":\s*"summit\.html"/.test(bundler), "bundle_webxr.py builds summit.html");
check(/"summit":\s*"summit\.html"/.test(bundler), "summit.html is copied into WebXR/dist");
const html = readFileSync(join(WEBXR, "summit", "index.html"), "utf8");
check(html.includes('href="../index.html"'), "the page links Home");
const app = readFileSync(join(WEBXR, "summit", "js", "app.js"), "utf8");
check(/gdMount\(\)/.test(app) && /ctlMount\(/.test(app), "the page mounts the Guide and the control grammar");
check(/lkStationLink\(id, \{ runner: SM_RUNNER, from: "summit"/.test(app), "job boards route through lkStationLink");
check(readFileSync(join(WEBXR, "shared", "passport.js"), "utf8").includes('summit: "Sierra Summit"'), "the runner can say Back to Sierra Summit");
// The homepage card lands with the next phase (tools/briefs/next/summit-next.md).

const dist = join(WEBXR, "summit", "dist", "summit.html");
check(existsSync(dist) && !/<script type="module" src=/.test(readFileSync(dist, "utf8")), "the dist bundle is built and self-contained");

console.log(`check_summit: ${passes} passed, ${failures} failed`);
process.exit(failures ? 1 : 0);
