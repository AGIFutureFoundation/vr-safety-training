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
const PPG = await import(pathToFileURL(join(WEBXR, "shared", "passport-programmes.js")).href);
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
// 1d. the pass road (SUMMIT-3, phase 4): switchbacks carry the climb between
// the crew yard and the pass saddle, the chute sign stays on the road, and the
// road bed's grade stays under SM_ROAD_MAX_GRADE everywhere outside the tunnel.
{
  const [a, b] = D.SM_SWITCHBACKS, R = D.SM_PASS_ROAD, L = D.SM_ROAD_LENGTHS;
  check(b - a >= 4, `the switchback section has four or more legs (${b - a})`);
  const straight = Math.hypot(R[b][0] - R[a][0], R[b][1] - R[a][1]), along = L[b] - L[a];
  check(along / straight >= 2, `the switchbacks more than double the straight-line climb (${(along / straight).toFixed(2)}x)`);
  check(D.smPolyDistance(...D.smPlace("avalanche-gallery").at, R).d < 1 && D.smPolyDistance(...D.smPlace("pass-road").at, R).d < 1 && D.smPolyDistance(...D.smPlace("pass-summit").at, R).d < 1, "the crew yard, the chute sign and the saddle sit on the road");
  check(Math.abs(L[L.length - 1] - D.SM_ROAD_LENGTH) < 1e-6 && D.SM_ROAD_LENGTH > 6500, `the road's length is recorded (${Math.round(D.SM_ROAD_LENGTH)} m)`);
  check(D.SM_ROAD_PROFILE.every((p, i, P) => i === 0 || p[0] > P[i - 1][0]) && D.SM_ROAD_PROFILE[0][0] === 0 && D.SM_ROAD_PROFILE.at(-1)[0] === 1, "the profile's fractions run from 0 to 1 in order");
  const inTunnel = (t) => t > D.SM_TUNNEL_SPAN[0] && t < D.SM_TUNNEL_SPAN[1];
  let steepest = 0, steepAt = 0;
  for (let d = 20; d <= D.SM_ROAD_LENGTH; d += 20) {
    const t0 = (d - 20) / D.SM_ROAD_LENGTH, t1 = d / D.SM_ROAD_LENGTH;
    if (inTunnel(t0) || inTunnel(t1)) continue;
    const g = Math.abs(D.smRoadHeightAt(t1) - D.smRoadHeightAt(t0)) / 20;
    if (g > steepest) { steepest = g; steepAt = d; }
  }
  check(steepest <= D.SM_ROAD_MAX_GRADE + 1e-9, `the road bed's steepest grade outside the tunnel is ${(steepest * 100).toFixed(1)}% at ${steepAt} m, under the ${D.SM_ROAD_MAX_GRADE * 100}% maximum`);
  check(D.smRoadGradeAt(0.5) > 0.05 && D.smRoadGradeAt(0.95) < -0.05, "the grade climbs on the way to the pass and descends past the tunnel");
  // The terrain follows the bed on the switchbacks: the ground under the road's centre line is within a metre of the profile (outside the crew yard's flat pad, which wins there).
  let off = 0;
  for (let d = L[a]; d <= L[b]; d += 25) {
    const p = D.smRoadPointAt(d);
    if (D.SM_SITES.some((s) => Math.hypot(p.x - s.at[0], p.z - s.at[1]) < s.pad * 1.8)) continue;
    if (Math.abs(D.smHeightAt(p.x, p.z) - D.smRoadHeightAt(p.t)) > 1) off++;
  }
  check(off === 0, `the ground under the switchbacks sits on the road profile (${off} samples off by over a metre)`);
  const p = D.smRoadPointAt(L[a] + 10);
  check(Math.abs(p.x - R[a][0] - (R[a + 1][0] - R[a][0]) * 10 / (L[a + 1] - L[a])) < 1e-6 && p.t > 0 && p.t < 1, "smRoadPointAt walks the polyline by metres");
}
// 1e. the river reads as water (phase 7): the surface sits above the bed and below both banks at every sample.
{
  const R = D.SM_RIVER, W = D.SM_RIVER_CHANNEL.width;
  check(W >= 20 && D.SM_RIVER_CHANNEL.depth >= 3.5, "the channel is at least 20 m half-width and 3.5 m deep");
  check(D.SM_RIVER_SURFACE > 0.5 && D.SM_RIVER_SURFACE < D.SM_RIVER_CHANNEL.depth, "the water sits over the bed and under the bank tops");
  const lens = [0]; for (let i = 1; i < R.length; i++) lens.push(lens[i - 1] + Math.hypot(R[i][0] - R[i - 1][0], R[i][1] - R[i - 1][1]));
  const total = lens[lens.length - 1];
  let under = 0, drowned = 0, n = 0;
  for (let k = 0; k <= 200; k++) {
    const d = total * k / 200; let i = 1; while (i < lens.length - 1 && lens[i] < d) i++;
    const u = (d - lens[i - 1]) / (lens[i] - lens[i - 1]);
    const x = R[i - 1][0] + (R[i][0] - R[i - 1][0]) * u, z = R[i - 1][1] + (R[i][1] - R[i - 1][1]) * u;
    if (D.smPolyDistance(x, z, D.SM_PASS_ROAD).d < 60) continue;
    const dx = R[i][0] - R[i - 1][0], dz = R[i][1] - R[i - 1][1], l = Math.hypot(dx, dz) || 1, nx = -dz / l, nz = dx / l;
    const s = D.smRiverSurfaceAt(k / 200);
    n++;
    if (s <= D.smHeightAt(x, z)) under++;
    // A bank probe that lands back in the channel (the inside of a hairpin bend) is water, not bank: skip it.
    for (const sgn of [1, -1]) {
      const bx = x + sgn * nx * W * 1.3, bz = z + sgn * nz * W * 1.3;
      if (D.smPolyDistance(bx, bz, R).d < W) continue;
      if (s >= D.smHeightAt(bx, bz)) drowned++;
    }
  }
  check(n > 150 && under === 0, `the river's surface is above its bed at every sample (${under} of ${n} under)`);
  check(drowned === 0, `both banks stand above the water at every sample (${drowned} of ${n} drowned)`);
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

// 4. field lessons: twenty on SCHOLAR-2's schema, validated by its own
// validator against this world's anchors, ten of them at the tunnel, the
// gondola and the ridge; each also links a trade station.
const FL = await import(pathToFileURL(join(WEBXR, "shared", "field-lessons.js")).href);
check(D.SM_FIELD_LESSONS.length >= 20, `at least 20 field lessons (got ${D.SM_FIELD_LESSONS.length})`);
check(new Set(D.SM_FIELD_LESSONS.map((l) => l.id)).size === D.SM_FIELD_LESSONS.length, "lesson ids are unique");
const k12Ids = new Set([...stationIds].filter((id) => id.startsWith("k12-")));
const anchors = new Set([...D.SM_SITES.map((s) => `site:${s.id}`), ...D.SM_LANDMARKS.map((l) => `landmark:${l.id}`)]);
for (const l of D.SM_FIELD_LESSONS) {
  const bad = FL.k2ValidateFieldLesson(l, { stations: k12Ids, anchors });
  check(bad.length === 0, `${l.id}: ${bad.join("; ")}`);
  check(l.world === "summit" && !!FL.K2_WORLD_PAGES.summit, `${l.id}: in the summit world, which the schema's page table knows`);
  check(stationIds.has(l.tradeStation) && !l.tradeStation.startsWith("k12-"), `${l.id}: links a trade station`);
  const place = D.smPlace(l.anchor.id);
  check(!!place && Math.hypot(l.position[0] - place.at[0], l.position[1] - place.at[1]) < 60, `${l.id}: placed within 60 m of its anchor`);
  check(!D.smInLake(...l.position) && !D.smInRiver(...l.position), `${l.id}: on dry land`);
  for (const other of D.SM_FIELD_LESSONS) if (other !== l) check(Math.hypot(l.position[0] - other.position[0], l.position[1] - other.position[1]) >= 10, `${l.id}: at least 10 m from ${other.id}`);
  for (const e of D.SM_EGGS) check(Math.hypot(l.position[0] - e.at[0], l.position[1] - e.at[1]) >= 10, `${l.id}: at least 10 m from cairn ${e.id}`);
}
for (const [anchor, want] of [["tunnel-portal", 3], ["gondola-shop", 2], ["gondola-top", 2], ["ridge-line", 4]]) {
  const n = D.SM_FIELD_LESSONS.filter((l) => l.anchor.id === anchor).length;
  check(n >= want, `${anchor} has ${want}+ field lessons (got ${n})`);
}
{
  const l = D.SM_FIELD_LESSONS[0], st = S.smBlank();
  check(!S.smAnswerLesson(st, l.id, (l.check.answer + 1) % 3).ok && st.lessons.length === 0, "a wrong answer does not pass a lesson");
  check(S.smAnswerLesson(st, l.id, l.check.answer).ok && st.lessons.includes(l.id), "the right answer passes it once");
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
// The answers come from QUESTMASTER's engine (shared/skill-gates.js) through
// smSnapshot, which also carries this world's own finished quests.
const fresh = S.smBlank();
const none = () => false;
const stateSrc = readFileSync(join(WEBXR, "summit", "js", "state.js"), "utf8");
check(/from "\.\.\/\.\.\/shared\/skill-gates\.js"/.test(stateSrc) && /qmMissing\(/.test(stateSrc) && !/ppProgramme\(/.test(stateSrc), "state.js answers gates through shared/skill-gates.js, not its own copy");
for (const q of D.SM_SIDE_QUESTS) {
  check(!S.smGateOpen(q.gate, fresh, none), `${q.id}: locked for a fresh profile`);
  const rows = S.smGateMissing(q.gate, fresh, none);
  check(rows.every((m) => m.kind && m.id && m.label), `${q.id}: the lock rows carry kind, id and label`);
  const done = new Set([...(q.gate.stations ?? []), ...(q.gate.k12 ?? []), ...(q.gate.programmes ?? []).flatMap((p) => PPG.PP_PROGRAMMES[p.id]?.stations ?? [])]);
  check(S.smGateOpen(q.gate, fresh, (id) => done.has(id)), `${q.id}: open once its stations (and programme stations) are done`);
}
{
  const gate = { quests: ["sm-side-night-patrol"], note: "after the night patrol" };
  const st = S.smBlank();
  check(!S.smGateOpen(gate, st, none), "a gate on a Summit quest is locked until that quest is done here");
  st.quests.push("sm-side-night-patrol");
  check(S.smGateOpen(gate, st, none), "and open once this ledger has it");
}
// The main arc advances with visits and passes.
const st = S.smBlank();
st.visited.push("water-plant");
const got = S.smAdvanceQuests(st, (id) => id === "chlorine-room");
check(got.includes("sm-main-00-arrive") && got.includes("sm-main-01-water"), "visiting and passing advance the main arc in order");
check(S.smCurrentMain(st)?.id === "sm-main-02-dam", "the next main quest is the dam");
const lockedEgg = D.SM_EGGS.find((e) => e.gate);
check(S.smFindEgg(S.smBlank(), lockedEgg.id, none).locked === true, "a gated field note stays locked for a fresh profile");

// 5b. rides (SUMMIT-3, phase 3): a quest step ridden in the crew pickup, scored on safe practice only.
check(D.SM_RIDES.length >= 1, "at least one ride");
for (const r of D.SM_RIDES) {
  for (const k of ["from", "to", "stopAt"]) check(!!D.smPlace(r[k]), `${r.id}: ${k} ${r[k]} exists`);
  for (const k of ["from", "to", "stopAt"]) check(D.smPolyDistance(...D.smPlace(r[k]).at, D.SM_PASS_ROAD).d < 30, `${r.id}: ${r[k]} is on the pass road`);
  check(stationIds.has(r.advice.stationId), `${r.id}: the advice cites a real station`);
  const f = join(WEBXR, "smartcity", "js", "sims", `${r.advice.stationId}.js`);
  if (existsSync(f)) {
    const src = readFileSync(f, "utf8").replace(/\\'/g, "'").replace(/\\"/g, '"');
    check(src.includes(r.advice.text), `${r.id}: the advice is quoted verbatim from ${r.advice.stationId}`);
    check(new RegExp(`id:\\s*"${r.advice.stepId}"`).test(src), `${r.id}: cited step ${r.advice.stepId} exists`);
  }
  check(r.scoring.brakeAtPullout > r.scoring.brakeLate && r.scoring.brakeLate > 0 && r.scoring.noBrake < -r.scoring.arrive, `${r.id}: the pull-out brake scores most, a late brake less, no brake costs more than arriving earns`);
  check(!("speed" in r.scoring) && r.speed > 0, `${r.id}: speed is never scored`);
  const dt = 0.1;
  const ride = (brakeWhen) => {
    const run = S.smRideStart(r.id); let guard = 0;
    while (!run.done && guard++ < 100000) { const phase = run.phase; S.smRideStep(run, dt, { brake: brakeWhen === phase && !run.brake }); }
    return run;
  };
  const good = ride("stopped"), late = ride("descent"), none = ride(null);
  check(good.done && good.brakeAt === "pullout" && good.score === r.scoring.brakeAtPullout + r.scoring.arrive, `${r.id}: the brake at the pull-out scores ${r.scoring.brakeAtPullout + r.scoring.arrive} (got ${good.score})`);
  check(late.done && late.brakeAt === "late" && late.score === r.scoring.brakeLate + r.scoring.arrive, `${r.id}: a late brake scores ${r.scoring.brakeLate + r.scoring.arrive} (got ${late.score})`);
  check(none.done && !none.brake && none.score === r.scoring.noBrake + r.scoring.arrive && none.score < 0, `${r.id}: no brake ends below zero (got ${none.score})`);
  check(good.log.includes("pull-out") && good.log.includes("down the grade"), `${r.id}: the ride stops at the pull-out before the grade`);
  check(Math.abs(good.d - S.smRoadMetresOf(r.to)) < 1 && good.t > 60, `${r.id}: the ride ends at ${r.to} after a real drive (${Math.round(good.t)} s)`);
  const st = S.smBlank();
  check(!S.smRideFinish(st, late) && !S.smRideFinish(st, none) && (st.rides ?? []).length === 0, `${r.id}: a late or missing brake does not satisfy the step`);
  check(S.smRideFinish(st, good) && st.rides.includes(r.id), `${r.id}: the pull-out brake satisfies the step`);
  check(S.smStepDone({ type: "ride", target: r.id }, st), `${r.id}: a ride step reads the ledger`);
}
check(D.SM_MAIN_QUESTS.some((q) => q.steps.some((s) => s.type === "ride" && D.SM_RIDES.some((r) => r.id === s.target))), "the main arc rides the pass with the crew");
{
  const st = S.smBlank(); const saved = JSON.parse(JSON.stringify(st)); saved.rides = ["sm-ride-pass-descent"];
  const store = { getItem: () => JSON.stringify(saved), setItem() {} };
  check(S.smLoad(store).rides.includes("sm-ride-pass-descent"), "the ledger keeps finished rides");
}

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
// Phase 3 and 7: mountain wildlife through the shared budget table (never a private copy), and the crew pickup on the pass road.
const wl = readFileSync(join(WEBXR, "shared", "wildlife.js"), "utf8");
check(/raptors:\s*\{\s*count:\s*\d+,\s*meshes:\s*\d+/.test(wl) && /deer:\s*\{\s*count:\s*\d+,\s*meshes:\s*\d+/.test(wl), "wildlife.js budgets raptors and deer");
check(/kind: "raptors"/.test(app) && /kind: "deer"/.test(app) && /kind: "gulls"/.test(app), "the app builds gulls, raptors and deer from the shared module");
check(!/wlRaptors|wlDeer/.test(app), "the app carries no private wildlife builders");
check(/\bpickup\(root/.test(app) && !/pickup as /.test(app) && /smDriveTruck\(dt\)/.test(app) && /SHARED \/ "fleet\.js"[\s\S]*summit-data\.js/.test(bundler), "the crew pickup drives the pass road and fleet.js is bundled for it");
check(/smRideFrame\(dt\)/.test(app) && /smRideStart\(/.test(app) && /smRideFinish\(/.test(app) && /advice\.text/.test(app), "the app rides the pickup through state.js and shows the station's advice");
check(readFileSync(join(WEBXR, "shared", "passport.js"), "utf8").includes('summit: "Sierra Summit"'), "the runner can say Back to Sierra Summit");
// Phase 6: the Atlas carries a Sierra Summit section drawn from this world's data (SM_SITES, SM_LANDMARKS), with deep links into the page.
const atlasSrc = readFileSync(join(WEBXR, "bayworld", "js", "atlas.js"), "utf8");
const atlasHtml = readFileSync(join(WEBXR, "bayworld", "atlas.html"), "utf8");
check(/from "\.\.\/\.\.\/shared\/summit-data\.js"/.test(atlasSrc) && /atlasSummitSvg/.test(atlasSrc) && /atlasSummitPlaces/.test(atlasSrc), "atlas.js reads summit-data.js for a Summit section");
check(/id="atlas-summit-map"/.test(atlasHtml) && /id="atlas-summit-list"/.test(atlasHtml), "atlas.html has the Summit map and list");
check(/"atlas":\s*\{[\s\S]*?SHARED \/ "summit-data\.js"[\s\S]*?bayworld\/js\/atlas\.js/.test(bundler), "the atlas bundle carries summit-data.js");
{
  const A = await import(pathToFileURL(join(WEBXR, "bayworld", "js", "atlas.js")).href);
  const places = A.atlasSummitPlaces();
  check(places.filter((p) => p.kind === "site").length === D.SM_SITES.length && places.filter((p) => p.kind === "landmark").length === D.SM_LANDMARKS.length, "the Summit atlas lists every site and landmark");
  const svg = A.atlasSummitSvg();
  check((svg.match(/data-summit-site="/g) ?? []).length === D.SM_SITES.length && (svg.match(/data-summit-landmark="/g) ?? []).length === D.SM_LANDMARKS.length, "the Summit map draws one marker per site and landmark");
  check(/data-road="pass-road"/.test(svg) && /data-river/.test(svg), "the Summit map draws the pass road and the river");
  const list = A.atlasSummitListHtml(places);
  for (const s of D.SM_SITES) check(list.includes(`${A.ATLAS_LINKS.summit}?site=${encodeURIComponent(s.id)}"`), `${s.id}: the atlas deep-links into Sierra Summit`);
  check(A.atlasSummitDeepLinks(places.find((p) => p.stations.length)).station?.includes("from=atlas"), "a Summit station launches from the atlas");
}
// The homepage card lands with the next phase (tools/briefs/next/summit-next.md).

const dist = join(WEBXR, "summit", "dist", "summit.html");
check(existsSync(dist) && !/<script type="module" src=/.test(readFileSync(dist, "utf8")), "the dist bundle is built and self-contained");

console.log(`check_summit: ${passes} passed, ${failures} failed`);
process.exit(failures ? 1 : 0);
