#!/usr/bin/env node
/**
 * The New Orleans parish worlds (WebXR/parishes, console PARISH,
 * docs/consoles/PARISH.md): every parish's data module validates on the shared
 * schema, the geo fit round-trips, the terrain builds headless within the
 * mobile mesh budget on every tier, every road and site is on ground, every
 * connector's two ends project within 1 km of each other (or is pending when
 * the other parish is not in the tree), every station, programme and union id
 * resolves, and the page is wired (bundler, flat page, links, passport,
 * check_all).
 *
 *     node tools/check_parishes.mjs
 *
 * Headless: the pure modules directly, the builder through the vendored
 * three.js (WebXR/vendor/three), no browser.
 */
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const WEBXR = join(ROOT, "WebXR");
let failures = 0, passes = 0;
const check = (ok, msg) => { if (ok) passes++; else { failures++; console.error(`  FAIL ${msg}`); } };
const note = (msg) => console.log(`  · ${msg}`);
const imp = (p) => import(pathToFileURL(join(WEBXR, p)).href);

const G = await imp("shared/np-geo.js");
const E = await imp("shared/np-parish.js");
const R = await imp("shared/np-parishes.js");
const W = await imp("shared/np-world.js");
const LK = await imp("shared/links.js");
const S = await imp("parishes/js/state.js");
const THREE = await imp("vendor/three/dist/three.module.min.js");
const catalog = JSON.parse(readFileSync(join(WEBXR, "smartcity", "catalog.json"), "utf8"));
const unions = new Set(JSON.parse(readFileSync(join(ROOT, "tools", "unions.json"), "utf8")).unions.map((u) => u.id));
const ctx = {
  stations: new Set(catalog.stations.map((s) => s.id)),
  k12: new Set(catalog.stations.filter((s) => s.id.startsWith("k12-")).map((s) => s.id)),
  programmes: new Set(catalog.curricula.map((c) => c.id)),
  unions,
};

// 1. every data module is registered, and every registered parish has a module
const files = readdirSync(join(WEBXR, "shared")).filter((f) => /^np-data-[a-z0-9-]+\.js$/.test(f));
check(files.length >= 1, "at least one np-data-<parish>.js module");
const modules = [];
for (const f of files) {
  try { const m = await imp(`shared/${f}`); const exp = Object.entries(m).find(([k, v]) => /^NP_/.test(k) && v && typeof v === "object" && v.id); check(!!exp, `${f}: exports one NP_<PARISH> map`); if (exp) modules.push([f, exp[1]]); }
  catch (e) { check(false, `${f}: imports (${e.message})`); }
}
const ids = new Set(R.NP_PARISHES.map((p) => p.id));
for (const [f, p] of modules) check(ids.has(p.id), `${f} (${p.id}) is registered in shared/np-parishes.js`);
check(new Set(R.npParishIds()).size === R.NP_PARISHES.length, "parish ids are unique");
check(R.npParish("orleans")?.name === "Orleans Parish", "Orleans Parish is registered");
check(!R.npParish("nowhere"), "an unknown parish is null");
const parishes = new Map(R.NP_PARISHES.map((p) => [p.id, p]));

// 2. each parish
for (const p of R.NP_PARISHES) {
  const tag = p.id;
  const bad = E.npValidate(p, ctx);
  check(bad.length === 0, `${tag}: validates (${bad.slice(0, 6).join("; ")}${bad.length > 6 ? ` … ${bad.length} problems` : ""})`);
  // geo: the fit round-trips, the residual is small, the field is a few kilometres wide
  const fit = G.npGeoFit(p);
  check(fit && Number.isFinite(fit.inverse.xx), `${tag}: the affine fit exists`);
  for (const a of p.anchors) { const back = G.npGeoToXz(p, G.npToGeo(p, a.xz)); check(Math.hypot(back[0] - a.xz[0], back[1] - a.xz[1]) < 1e-6, `${tag}: ${a.name} round-trips`); }
  const res = G.npGeoResidual(p);
  check(res.max < 150, `${tag}: anchors land within 150 m of their fit (max ${res.max.toFixed(1)})`);
  const b = G.npBounds(p);
  check(b.maxLon > b.minLon && b.maxLat > b.minLat && b.maxLon - b.minLon < 1 && b.maxLat - b.minLat < 1, `${tag}: lon/lat bounds are a sane box`);
  const sc = G.npScale(p);
  check(sc.x > 0.5 && sc.x < 6 && sc.z > 0.5 && sc.z < 6, `${tag}: the stylised scale is between one half and six real metres per metre (${sc.x.toFixed(2)}, ${sc.z.toFixed(2)})`);
  check(p.anchors.every((a) => a.lonlat.every((v) => Math.abs(v * 1000 - Math.round(v * 1000)) < 1e-9)), `${tag}: anchors carry three decimals`);
  check(!G.npSatelliteUrl(p, null) && !G.npSatelliteUrl(p, "not-a-token"), `${tag}: no satellite URL without a token`);
  const url = G.npSatelliteUrl(p, "pk.abcdefghij.klmnopqrst");
  check(typeof url === "string" && url.startsWith(G.NP_STATIC_BASE) && /\d+x\d+/.test(url), `${tag}: a satellite URL is built only with a token`);
  // sites and roads on ground
  for (const s of p.sites) {
    const w = E.npWaterAt(p, ...s.position);
    check(!w || w.kind === "wetland", `${tag}/${s.id}: on ground`);
    check(Math.abs(E.npHeightAt(p, s.position[0] + 20, s.position[1]) - E.npHeightAt(p, ...s.position)) < 0.6, `${tag}/${s.id}: its pad is flat`);
    check(s.stations.every((id) => ctx.stations.has(id)), `${tag}/${s.id}: every station resolves`);
    check(s.trades.every((id) => unions.has(id)), `${tag}/${s.id}: every union resolves`);
    check(s.programmes.every((id) => ctx.programmes.has(id)), `${tag}/${s.id}: every programme resolves`);
    for (const id of s.stations) {
      const link = LK.lkStationLink(id, { runner: "../smartcity/index.html", from: "parishes", page: "/parishes/parishes.html", siteId: `${p.id}/${s.id}` });
      check(link.startsWith("../smartcity/index.html?sim=") || link.startsWith("../trades/index.html?room="), `${tag}/${s.id}/${id}: link opens the runner`);
      check(link.includes("from=parishes") && link.includes(encodeURIComponent(`#site=${p.id}/${s.id}`)), `${tag}/${s.id}/${id}: link carries the way back`);
    }
  }
  for (const r of p.roads) {
    const wet = E.npRoadWet(p, r);
    check(wet.length === 0, `${tag}/${r.id}: a plain road stays out of the river and lake (${wet.length} wet samples)`);
    if (E.NP_ROAD_KINDS[r.kind]?.clearance) {
      const mid = E.npDeckHeightAt(r, 0.5), end = E.npDeckHeightAt(r, 0);
      check(mid > end + 5, `${tag}/${r.id}: the deck rises over the water (${mid.toFixed(1)} m)`);
    }
  }
  for (const l of p.landmarks) check(!E.npWaterAt(p, ...l.position) || ["wetland"].includes(E.npWaterAt(p, ...l.position).kind) || /shore|point|bayou|canal|lock|riverfront/.test(l.kind), `${tag}/${l.id}: a landmark on water is a shore, point, canal or lock`);
  // the field is a flat delta: heights finite, water beds below the surface, levees above the ground
  let lo = Infinity, hi = -Infinity;
  for (let i = 0; i < 1024; i++) { const h = E.npHeightAt(p, -2048 + (i % 32) * 132, -2048 + Math.floor(i / 32) * 132); check(Number.isFinite(h), `${tag}: height is finite`); lo = Math.min(lo, h); hi = Math.max(hi, h); }
  check(lo <= E.NP_BED + 0.5 && hi >= E.NP_GROUND + 3, `${tag}: relief runs from a water bed to a levee crest (${lo.toFixed(1)} … ${hi.toFixed(1)} m)`);
  for (const l of p.levees) { const m = E.npPolyPointAt(l.pts, 0.5); check(E.npLeveeRise(p, m.x, m.z) >= l.height * 0.95, `${tag}/${l.id}: the crest rises its full height`); }
  for (const w of p.water.filter((x) => x.width)) { const c = w.poly[Math.floor(w.poly.length / 2)]; check(E.npHeightAt(p, ...c) < E.NP_WATER_Y, `${tag}/${w.id}: the bed lies under the water line`); }
  // chunks, LOD and budgets
  check(E.NP_CHUNKS_PER_SIDE * E.NP_CHUNK === E.NP_SIZE && E.NP_CHUNKS_PER_SIDE ** 2 >= 200, "256 m chunks tile the field, 200 or more of them");
  check(E.npChunksAround(0, 0, 3).length === 49 && E.npChunksAround(-2040, -2040, 3).length === 16, "chunk streaming returns a 7×7 square and clamps at the edge");
  for (const [tier, r] of Object.entries(E.NP_STREAM_RADIUS)) check((2 * r + 1) ** 2 <= E.NP_BUDGET.chunksLoaded, `${tier}: the streamed square fits the chunk budget`);
  check(E.NP_LOD_SEGMENTS.every((v, i, a) => i === 0 || v <= a[i - 1]) && E.NP_LOD_SEGMENTS[0] <= 32, "LOD rings coarsen outward from 32 segments or fewer");
  for (const tier of ["low", "balanced", "high"]) check(E.npTriangleEstimate(p, tier) <= E.NP_BUDGET.triangles, `${tag}/${tier}: the worst-case estimate ${E.npTriangleEstimate(p, tier)} is within ${E.NP_BUDGET.triangles}`);
  // headless build on the vendored three.js: meshes and triangles inside the budget at the start and at every site
  for (const tier of ["low", "high"]) {
    const root = new THREE.Group();
    const start = E.npStartSite(p);
    const world = W.npBuildParish(root, THREE, p, { tier, start: start.position });
    let worstTri = 0, worstMesh = 0;
    for (const s of [start, ...p.sites]) { world.update(s.position[0], s.position[1], 999); const st = world.stats(); worstTri = Math.max(worstTri, st.triangles); worstMesh = Math.max(worstMesh, st.meshes); }
    world.animate(0.1);
    check(worstMesh <= E.NP_BUDGET.drawCalls, `${tag}/${tier}: at most ${E.NP_BUDGET.drawCalls} meshes at every site (worst ${worstMesh})`);
    check(worstTri <= E.NP_BUDGET.triangles, `${tag}/${tier}: at most ${E.NP_BUDGET.triangles} triangles at every site (worst ${worstTri})`);
    check(world.siteBoards.length === p.sites.length && world.lessonSigns.length === (p.fieldLessons ?? []).length, `${tag}/${tier}: a board per site and a sign per lesson`);
    check(world.waters.length === p.water.length, `${tag}/${tier}: a surface per water body`);
    const st = world.stats();
    check(st.chunks <= E.NP_BUDGET.chunksLoaded && st.chunks >= 16, `${tag}/${tier}: ${st.chunks} chunks loaded`);
    note(`${tag}/${tier}: ${st.chunks} chunks, worst ${worstMesh} meshes / ${worstTri} triangles, ${st.instances} massing instances at the last site`);
    world.setGroundTexture(new THREE.Texture()); check(world.groundMat.map && !world.groundMat.vertexColors, `${tag}/${tier}: a satellite texture replaces the vertex colours`);
    world.setGroundTexture(null); check(!world.groundMat.map && world.groundMat.vertexColors, `${tag}/${tier}: and the procedural ground comes back`);
  }
  // massing is off roads, out of water and clear of pads
  let spots = 0, badSpots = 0;
  for (let cz = 0; cz < E.NP_CHUNKS_PER_SIDE; cz += 3) for (let cx = 0; cx < E.NP_CHUNKS_PER_SIDE; cx += 3) for (const m of E.npMassingForChunk(p, cx, cz)) {
    spots++;
    const w = E.npWaterAt(p, m.x, m.z);
    if (w && w.kind !== "wetland") badSpots++;
    else if (p.sites.some((s) => Math.hypot(m.x - s.position[0], m.z - s.position[1]) < E.NP_PAD)) badSpots++;
    else { const near = E.npNearestRoad(p, m.x, m.z); if (near.road && near.road.kind !== "ferry" && near.d < (E.NP_ROAD_KINDS[near.road.kind]?.width ?? 8) / 2) badSpots++; }
  }
  check(spots > 100 && badSpots === 0, `${tag}: massing keeps off water, pads and roads (${badSpots} of ${spots} sampled spots off)`);
  check(E.npDistrictAt(p, ...p.sites[0].position) !== undefined, `${tag}: district lookup answers`);
  // connectors: paired by id; both ends within 1 km when the other parish is in the tree
  for (const c of R.npResolveConnectors(p)) {
    const other = parishes.get(c.to.parish);
    const fromLL = G.npToGeo(p, c.from.position);
    check(Math.abs(c.from.position[0]) > 1900 || Math.abs(c.from.position[1]) > 1900 || c.kind === "ferry" || c.to.parish === p.id, `${tag}/${c.id}: a way out sits at the parish's edge or is a ferry`);
    if (!other) { note(`${tag}/${c.id}: pending — ${c.to.parish} is not in the tree yet (its end would be ${c.to.lonlat.map((v) => v.toFixed(3)).join(", ")})`); continue; }
    const toLL = G.npToGeo(other, c.to.position);
    const gap = G.npGeoDistance(fromLL, toLL);
    const suggest = G.npGeoToXz(other, fromLL).map(Math.round);
    check(gap <= 1000, `${tag}/${c.id}: both ends project within 1 km (${Math.round(gap)} m; a to.position of [${suggest}] in ${other.id} would close it)`);
    check(G.npInField(other, c.to.position), `${tag}/${c.id}: the far end lies inside ${other.id}'s field`);
    if (other !== p) {
      const pair = (other.connectors ?? []).find((x) => x.id === c.id);
      check(!!pair, `${tag}/${c.id}: ${other.id} pairs the connector by id`);
      if (pair) check(G.npGeoDistance(G.npToGeo(other, pair.from.position), fromLL) <= 1000, `${tag}/${c.id}: the pair's own end is within 1 km too`);
    }
  }
}
check(R.NP_PARISHES.some((p) => p.id === "orleans" && p.sites.length >= 10), "Orleans Parish has ten or more sites");
{
  const o = R.npParish("orleans");
  for (const kind of ["port", "levee", "pump", "streetcar", "rail", "hospital", "campus", "stadium", "hospitality", "wetland"]) check(o.sites.some((s) => s.kind === kind), `orleans: a ${kind} site`);
  for (const kind of ["river", "lake", "canal", "bayou", "wetland"]) check(o.water.some((w) => w.kind === kind), `orleans: ${kind} water`);
  check(o.roads.some((r) => r.kind === "bridge") && o.roads.some((r) => r.kind === "ferry") && o.roads.some((r) => r.kind === "interstate"), "orleans: a bridge, a ferry and an interstate");
  check(o.connectors.some((c) => c.to.parish === "jefferson") && o.connectors.some((c) => c.to.parish === "st-bernard"), "orleans: ways to Jefferson and St. Bernard");
  const src = readFileSync(join(WEBXR, "shared", "np-data-orleans.js"), "utf8");
  check(!/\b(19|20)\d\d\b/.test(src.replace(/\/\/.*$/gm, "")), "orleans: no year in the data");
  check(!/population|founded|built in|est\./i.test(src), "orleans: no history or statistics");
}

// 3. the ledger
{
  const st = S.npBlank();
  check(S.npVisit(st, "orleans", "port-terminal") && !S.npVisit(st, "orleans", "port-terminal") && S.npVisited(st, "orleans", "port-terminal"), "a visit is recorded once");
  const l = R.npParish("orleans").fieldLessons[0];
  check(!S.npAnswerLesson(st, l, (l.check.answer + 1) % l.check.options.length).ok && !st.lessons.includes(l.id), "a wrong answer does not pass a lesson");
  check(S.npAnswerLesson(st, l, l.check.answer).ok && st.lessons.includes(l.id), "the right answer passes it");
  const store = { getItem: () => JSON.stringify(st), setItem() {} };
  check(S.npLoad(store).lessons.includes(l.id) && S.npLoad({ getItem: () => "garbage" }).lessons.length === 0, "the ledger loads and survives garbage");
}

// 4. wiring: bundler, dist, links, passport, page, check_all, wildlife
const bundler = readFileSync(join(ROOT, "tools", "bundle_webxr.py"), "utf8");
check(/"parishes":\s*\{[\s\S]*?"out":\s*"parishes\.html"/.test(bundler), "bundle_webxr.py builds parishes.html");
check(/"parishes":\s*"parishes\.html"/.test(bundler), "parishes.html is copied into WebXR/dist");
check(/SHARED \/ "np-geo\.js"[\s\S]*SHARED \/ "np-parish\.js"[\s\S]*SHARED \/ "np-data-orleans\.js"[\s\S]*SHARED \/ "np-parishes\.js"[\s\S]*SHARED \/ "np-world\.js"/.test(bundler), "the parish modules are listed in dependency order");
for (const [f] of modules) check(bundler.includes(`SHARED / "${f}"`), `${f} is in the parishes bundle`);
const html = readFileSync(join(WEBXR, "parishes", "parishes.html"), "utf8");
check(html.includes('href="../index.html"') && html.includes("../shared/design.css"), "the page links Home and the design stylesheet");
const app = readFileSync(join(WEBXR, "parishes", "js", "app.js"), "utf8");
check(/gdMount\(\)/.test(app) && /ctlMount\(/.test(app), "the page mounts the Guide and the control grammar");
check(/lkStationLink\(id, \{ runner: NP_RUNNER, from: "parishes"/.test(app), "job boards route through lkStationLink");
check(/ppReturnSite\(location\.hash, location\.search\)/.test(app), "a return from a station lands at its site");
check(/mapboxToken\(\)/.test(app) && /npSatelliteUrl\(parish, token\)/.test(app) && !/access_token=pk\./.test(app), "the satellite ground needs the viewer's token and ships none");
check(/kind: "egrets"/.test(app) && /kind: "pelicans"/.test(app) && /kind: "herons"/.test(app), "egrets, pelicans and herons come from the shared wildlife module");
check(/menu-parishes/.test(app) && /\?parish=/.test(app), "the parish selector is drawn");
check(readFileSync(join(WEBXR, "shared", "passport.js"), "utf8").includes('parishes: "the Parishes"'), "the runner can say Back to the Parishes");
check(LK.LK_ASSET_WORLDS.parishes?.page === "parishes.html" && LK.lkParishLink("orleans", "port-terminal").includes("parish=orleans&site=port-terminal"), "links.js knows the parishes page");
check(readFileSync(join(WEBXR, "shared", "field-lessons.js"), "utf8").includes('parishes: "../parishes/parishes.html"'), "the field-lesson page table knows the parishes");
check(readFileSync(join(ROOT, "tools", "check_all.mjs"), "utf8").includes('"check_parishes.mjs"'), "check_all runs this checker");
const wl = readFileSync(join(WEBXR, "shared", "wildlife.js"), "utf8");
check(/egrets:\s*\{\s*count:\s*\d+,\s*meshes:\s*\d+/.test(wl) && /herons:\s*\{\s*count:\s*\d+,\s*meshes:\s*\d+/.test(wl), "wildlife.js budgets egrets and herons");
const dist = join(WEBXR, "parishes", "dist", "parishes.html");
check(existsSync(dist) && !/<script type="module" src=/.test(readFileSync(dist, "utf8")), "the dist bundle is built and self-contained");
check(!/pk\.[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}/.test([app, readFileSync(join(WEBXR, "shared", "np-geo.js"), "utf8")].join("")), "no token shape anywhere in the parish code");

console.log(`check_parishes: ${passes} passed, ${failures} failed (${R.NP_PARISHES.length} parish${R.NP_PARISHES.length === 1 ? "" : "es"}: ${R.NP_PARISHES.map((p) => `${p.id} ${p.sites.length} sites, ${p.roads.length} roads, ${p.districts.length} districts, ${p.connectors.length} connectors`).join("; ")})`);
process.exit(failures ? 1 : 0);
