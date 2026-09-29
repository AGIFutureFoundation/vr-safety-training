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
// The worlds a `world` connector may reach, and their sites (GOLDEN-B's Bay Bridge to Bay World).
const { BAY_SITES } = await imp("shared/bayworld-data.js");
const WORLD_SITES = { bayworld: new Set(BAY_SITES.map((s) => s.id)) };
// The flat link for a source link: the bundler's own two rewrites, run in Python (as tools/check_links.mjs does).
const { spawnSync } = await import("node:child_process");
function lkFlatten(links) {
  const code = "import sys,json; sys.path.insert(0,'tools'); import bundle_webxr as b; " +
    "print(json.dumps([b.combined_fixup(b.dist_fixup('\"'+l))[1:] for l in json.load(sys.stdin)]))";
  const r = spawnSync("python3", ["-c", code], { cwd: ROOT, input: JSON.stringify(links), encoding: "utf8" });
  return r.status === 0 ? JSON.parse(r.stdout) : links.map(() => `(bundler rewrite failed: ${r.stderr.split("\n").slice(-2).join(" ")})`);
}

/** Parishes whose engine geometry (fit, ground, field, chunks, build, massing) is held strict; the others are noted. */
const NP_ENGINE_STRICT = new Set(["orleans", "jefferson", "st-bernard", "plaquemines", "st-tammany", "sf-downtown", "sf-mission", "sf-golden-gate-park", "sf-marina", "sf-bayview", "oak-west-oakland", "oak-downtown-lake", "oak-fruitvale-estuary", "oak-emeryville-berkeley", "bay-san-jose", "bay-san-pablo"]);
const deferred = [];
// 2. each parish
for (const p of R.NP_PARISHES) {
  const tag = p.id;
  // Engine geometry is strict for the parishes brought onto the engine so far; the others' findings are deferred
  // notes for the follow-on run (docs/consoles/CRESCENT-RUN.md), not failures, so the shared gate is not held by them.
  const strict = NP_ENGINE_STRICT.has(p.id);
  const gcheck = (ok, msg) => strict ? check(ok, msg) : (ok ? check(true, msg) : (deferred.push(msg), note(`deferred: ${msg}`)));
  const bad = E.npValidate(p, ctx);
  gcheck(bad.length === 0, `${tag}: validates (${bad.slice(0, 6).join("; ")}${bad.length > 6 ? ` … ${bad.length} problems` : ""})`);
  // geo: the fit round-trips, the residual is small, the field is a few kilometres wide
  const fit = G.npGeoFit(p);
  gcheck(fit && Number.isFinite(fit.inverse.xx), `${tag}: the affine fit exists`);
  for (const a of p.anchors) { const back = G.npGeoToXz(p, G.npToGeo(p, a.xz)); gcheck(Math.hypot(back[0] - a.xz[0], back[1] - a.xz[1]) < 1e-6, `${tag}: ${a.name} round-trips`); }
  const res = G.npGeoResidual(p);
  gcheck(res.max < 150, `${tag}: anchors land within 150 m of their fit (max ${res.max.toFixed(1)})`);
  const b = G.npBounds(p);
  gcheck(b.maxLon > b.minLon && b.maxLat > b.minLat && b.maxLon - b.minLon < 1 && b.maxLat - b.minLat < 1, `${tag}: lon/lat bounds are a sane box`);
  const sc = G.npScale(p);
  // The stylised scale: between one half and six real metres per metre, unless the parish declares a `scale` (real metres
  // per map metre, a decision recorded in docs/parishes.md) — then the fit must agree with the declared scale within 15 %.
  if (Number.isFinite(p.scale)) {
    gcheck(p.scale >= 0.5 && p.scale <= 25, `${tag}: the declared scale ${p.scale} is between one half and twenty-five real metres per metre`);
    gcheck(Math.abs(sc.x / p.scale - 1) < 0.15 && Math.abs(sc.z / p.scale - 1) < 0.15, `${tag}: the fit agrees with the declared scale ${p.scale} within 15 % (${sc.x.toFixed(2)}, ${sc.z.toFixed(2)})`);
    gcheck(readFileSync(join(ROOT, "docs", "parishes.md"), "utf8").includes(`\`${p.id}\``) && new RegExp(`\\b${p.scale} real metres`).test(readFileSync(join(ROOT, "docs", "parishes.md"), "utf8")), `${tag}: docs/parishes.md records the declared scale`);
  } else gcheck(sc.x > 0.5 && sc.x < 6 && sc.z > 0.5 && sc.z < 6, `${tag}: the stylised scale is between one half and six real metres per metre (${sc.x.toFixed(2)}, ${sc.z.toFixed(2)})`);
  gcheck(p.anchors.every((a) => a.lonlat.every((v) => Math.abs(v * 1000 - Math.round(v * 1000)) < 1e-9)), `${tag}: anchors carry three decimals`);
  gcheck(!G.npSatelliteUrl(p, null) && !G.npSatelliteUrl(p, "not-a-token"), `${tag}: no satellite URL without a token`);
  const url = G.npSatelliteUrl(p, "pk.abcdefghij.klmnopqrst");
  gcheck(typeof url === "string" && url.startsWith(G.NP_STATIC_BASE) && /\d+x\d+/.test(url), `${tag}: a satellite URL is built only with a token`);
  // sites and roads on ground
  for (const s of p.sites) {
    const w = E.npWaterAt(p, ...s.position);
    gcheck(!w || w.kind === "wetland", `${tag}/${s.id}: on ground`);
    gcheck(Math.abs(E.npHeightAt(p, s.position[0] + 20, s.position[1]) - E.npHeightAt(p, ...s.position)) < 0.6, `${tag}/${s.id}: its pad is flat`);
    gcheck(s.stations.every((id) => ctx.stations.has(id)), `${tag}/${s.id}: every station resolves`);
    gcheck(s.trades.every((id) => unions.has(id)), `${tag}/${s.id}: every union resolves`);
    gcheck(s.programmes.every((id) => ctx.programmes.has(id)), `${tag}/${s.id}: every programme resolves`);
    for (const id of s.stations) {
      const link = LK.lkStationLink(id, { runner: "../smartcity/index.html", from: "parishes", page: "/parishes/parishes.html", siteId: `${p.id}/${s.id}` });
      gcheck(link.startsWith("../smartcity/index.html?sim=") || link.startsWith("../trades/index.html?room="), `${tag}/${s.id}/${id}: link opens the runner`);
      gcheck(link.includes("from=parishes") && link.includes(encodeURIComponent(`#site=${encodeURIComponent(`${p.id}/${s.id}`)}`)), `${tag}/${s.id}/${id}: link carries the way back`);
    }
  }
  for (const r of p.roads) {
    const wet = E.npRoadWet(p, r);
    gcheck(wet.length === 0, `${tag}/${r.id}: a plain road stays out of the river and lake (${wet.length} wet samples)`);
    if (E.NP_ROAD_KINDS[r.kind]?.clearance) {
      const mid = E.npDeckHeightAt(r, 0.5), end = E.npDeckHeightAt(r, 0);
      gcheck(mid > end + 5, `${tag}/${r.id}: the deck rises over the water (${mid.toFixed(1)} m)`);
    }
  }
  for (const l of p.landmarks) gcheck(!E.npWaterAt(p, ...l.position) || ["wetland"].includes(E.npWaterAt(p, ...l.position).kind) || /shore|point|bayou|canal|lock|riverfront/.test(l.kind), `${tag}/${l.id}: a landmark on water is a shore, point, canal or lock`);
  // the field is a flat delta: heights finite, water beds below the surface, levees above the ground
  let lo = Infinity, hi = -Infinity;
  for (let i = 0; i < 1024; i++) { const h = E.npHeightAt(p, -2048 + (i % 32) * 132, -2048 + Math.floor(i / 32) * 132); gcheck(Number.isFinite(h), `${tag}: height is finite`); lo = Math.min(lo, h); hi = Math.max(hi, h); }
  gcheck(lo <= E.NP_BED + 0.5 && hi >= E.NP_GROUND + 3, `${tag}: relief runs from a water bed to a levee crest (${lo.toFixed(1)} … ${hi.toFixed(1)} m)`);
  for (const l of p.levees) { const m = E.npPolyPointAt(l.pts, 0.5); gcheck(E.npLeveeRise(p, m.x, m.z) >= l.height * 0.95, `${tag}/${l.id}: the crest rises its full height`); }
  for (const w of p.water.filter((x) => x.width)) { const c = w.poly[Math.floor(w.poly.length / 2)]; gcheck(E.npHeightAt(p, ...c) < E.NP_WATER_Y, `${tag}/${w.id}: the bed lies under the water line`); }
  // chunks, LOD and budgets
  gcheck(E.NP_CHUNKS_PER_SIDE * E.NP_CHUNK === E.NP_SIZE && E.NP_CHUNKS_PER_SIDE ** 2 >= 200, "256 m chunks tile the field, 200 or more of them");
  gcheck(E.npChunksAround(0, 0, 3).length === 49 && E.npChunksAround(-2040, -2040, 3).length === 16, "chunk streaming returns a 7×7 square and clamps at the edge");
  for (const [tier, r] of Object.entries(E.NP_STREAM_RADIUS)) gcheck((2 * r + 1) ** 2 <= E.NP_BUDGET.chunksLoaded, `${tier}: the streamed square fits the chunk budget`);
  gcheck(E.NP_LOD_SEGMENTS.every((v, i, a) => i === 0 || v <= a[i - 1]) && E.NP_LOD_SEGMENTS[0] <= 32, "LOD rings coarsen outward from 32 segments or fewer");
  for (const tier of ["low", "balanced", "high"]) gcheck(E.npTriangleEstimate(p, tier) <= E.NP_BUDGET.triangles, `${tag}/${tier}: the worst-case estimate ${E.npTriangleEstimate(p, tier)} is within ${E.NP_BUDGET.triangles}`);
  // headless build on the vendored three.js: meshes and triangles inside the budget at the start and at every site
  for (const tier of ["low", "high"]) {
    const root = new THREE.Group();
    const start = E.npStartSite(p);
    const world = W.npBuildParish(root, THREE, p, { tier, start: start.position });
    let worstTri = 0, worstMesh = 0;
    for (const s of [start, ...p.sites]) { world.update(s.position[0], s.position[1], 999); const st = world.stats(); worstTri = Math.max(worstTri, st.triangles); worstMesh = Math.max(worstMesh, st.meshes); }
    world.animate(0.1);
    gcheck(worstMesh <= E.NP_BUDGET.drawCalls, `${tag}/${tier}: at most ${E.NP_BUDGET.drawCalls} meshes at every site (worst ${worstMesh})`);
    gcheck(worstTri <= E.NP_BUDGET.triangles, `${tag}/${tier}: at most ${E.NP_BUDGET.triangles} triangles at every site (worst ${worstTri})`);
    gcheck(world.siteBoards.length === p.sites.length && world.lessonSigns.length === (p.fieldLessons ?? []).length, `${tag}/${tier}: a board per site and a sign per lesson`);
    gcheck(world.waters.length === p.water.length, `${tag}/${tier}: a surface per water body`);
    const st = world.stats();
    gcheck(st.chunks <= E.NP_BUDGET.chunksLoaded && st.chunks >= 16, `${tag}/${tier}: ${st.chunks} chunks loaded`);
    note(`${tag}/${tier}: ${st.chunks} chunks, worst ${worstMesh} meshes / ${worstTri} triangles, ${st.instances} massing instances at the last site`);
    world.setGroundTexture(new THREE.Texture()); gcheck(world.groundMat.map && !world.groundMat.vertexColors, `${tag}/${tier}: a satellite texture replaces the vertex colours`);
    world.setGroundTexture(null); gcheck(!world.groundMat.map && world.groundMat.vertexColors, `${tag}/${tier}: and the procedural ground comes back`);
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
  gcheck(spots > 100 && badSpots === 0, `${tag}: massing keeps off water, pads and roads (${badSpots} of ${spots} sampled spots off)`);
  gcheck(E.npDistrictAt(p, ...p.sites[0].position) !== undefined, `${tag}: district lookup answers`);
  // connectors: paired by id or by the agreed crossing (same kind and lonlat); road and ferry ends within 2 km, a bridge or
  // causeway listed at its mid-crossing within 40 km, when the other parish is in the tree
  for (const c of R.npResolveConnectors(p)) {
    if (c.kind === "world") {
      // A way out to another world (shared/sg-ways.js): its far end is a page, checked in the San Francisco section below.
      check(c.resolved && G.npInField(p, c.from.position), `${tag}/${c.id}: the world way stands inside the field`);
      check(E.npValidate({ ...p, connectors: [c] }, { worldSites: WORLD_SITES }).filter((m) => m.startsWith(`connector ${c.id}`)).length === 0, `${tag}/${c.id}: the world way validates`);
      continue;
    }
    const other = parishes.get(c.to.parish);
    const fromLL = G.npToGeo(p, c.from.position);
    check(Math.abs(c.from.position[0]) > 1900 || Math.abs(c.from.position[1]) > 1900 || c.kind === "ferry" || c.to.parish === p.id || Array.isArray(c.lonlat), `${tag}/${c.id}: a way out sits at the parish's edge, is a ferry or marks an agreed crossing`);
    if (!other) { note(`${tag}/${c.id}: pending — ${c.to.parish} is not in the tree yet (its end would be ${c.to.lonlat.map((v) => v.toFixed(3)).join(", ")})`); continue; }
    const toLL = G.npToGeo(other, c.to.position);
    const gap = G.npGeoDistance(fromLL, toLL);
    const suggest = G.npGeoToXz(other, fromLL).map(Math.round);
    check(G.npInField(other, c.to.position), `${tag}/${c.id}: the far end lies inside ${other.id}'s field`);
    if (other === p) {
      // A crossing within one parish (a ferry) joins two real banks: its ends are apart by design, over water, inside the field.
      const d = Math.hypot(c.to.position[0] - c.from.position[0], c.to.position[1] - c.from.position[1]);
      check(d > 50 && d < 1500, `${tag}/${c.id}: an in-parish crossing spans a real gap (${Math.round(d)} m)`);
      const mid = [(c.from.position[0] + c.to.position[0]) / 2, (c.from.position[1] + c.to.position[1]) / 2];
      check(c.kind !== "ferry" || !!E.npWaterAt(p, ...mid), `${tag}/${c.id}: a ferry crosses water`);
    } else {
      const span = c.kind === "bridge" || c.kind === "causeway" ? 40000 : 2000;
      check(gap <= span, `${tag}/${c.id}: both ends project within ${span / 1000} km (${Math.round(gap)} m; a to.position of [${suggest}] in ${other.id} would close it)`);
      const pair = (other.connectors ?? []).find((x) => x.id === c.id || (x.kind === c.kind && x.to?.parish === p.id && Array.isArray(x.lonlat) && Array.isArray(c.lonlat) && Math.abs(x.lonlat[0] - c.lonlat[0]) < 1e-6 && Math.abs(x.lonlat[1] - c.lonlat[1]) < 1e-6));
      check(!!pair, `${tag}/${c.id}: ${other.id} pairs the connector by id or by the agreed crossing`);
      if (pair) check(G.npGeoDistance(G.npToGeo(other, pair.from.position), fromLL) <= span, `${tag}/${c.id}: the pair's own end is within ${span / 1000} km too`);
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
  // Coordinates are four-digit numbers, so the facts rule is held by words, not by a year regex.
  check(!/population|founded|built in|opened in|census|since \d|\best\.|\bcirca\b/i.test(src), "orleans: no history or statistics");
  const text = [...o.sites, ...o.landmarks, ...o.districts].map((x) => `${x.name} ${x.blurb ?? ""}`).join(" ");
  // An ordinal in a public name (a numbered street or canal) is a name, not a figure.
  check(!/\d/.test(text.replace(/\b\d+(st|nd|rd|th)\b/g, "")), "orleans: no figure in a site, landmark or district name or blurb");
}

// 2b. regions and hills (console GOLDEN-A, docs/consoles/GOLDEN-A.md): the registry groups maps by region, the five
// parishes stay New Orleans and flat, and the San Francisco districts rise on named, gentle hills.
const app0 = readFileSync(join(WEBXR, "parishes", "js", "app.js"), "utf8");
{
  check(Array.isArray(R.NP_REGIONS) && R.NP_REGIONS[0]?.id === "new-orleans" && R.npRegion("new-orleans")?.noun === "parish" && R.npRegion("san-francisco")?.noun === "district", "regions: New Orleans first (parishes), San Francisco (districts)");
  check(R.NP_REGIONS.every((r) => /^[a-z][a-z0-9-]*$/.test(r.id) && r.title && r.name && r.nouns) && !R.npRegion("atlantis"), "every region has an id, a name, a title and nouns; an unknown region is null");
  for (const p of R.NP_PARISHES) check(!!R.npRegion(R.npRegionOf(p)), `${p.id}: region ${R.npRegionOf(p)} is a known region`);
  const groups = R.npRegionGroups();
  check(groups.reduce((s, g) => s + g.parishes.length, 0) === R.NP_PARISHES.length && groups.every((g, i) => i === 0 || R.NP_REGIONS.indexOf(g.region) > R.NP_REGIONS.indexOf(groups[i - 1].region)), "regions group every map once, in the regions' order");
  check(groups.find((g) => g.region.id === "new-orleans")?.parishes.slice(0, 5).map((p) => p.id).join() === "orleans,jefferson,st-bernard,plaquemines,st-tammany", "the five parishes stay in New Orleans, in selector order");
  const sf = groups.find((g) => g.region.id === "san-francisco")?.parishes ?? [];
  check(["sf-downtown", "sf-mission", "sf-golden-gate-park"].every((id) => sf.some((p) => p.id === id)), "San Francisco: Downtown & Embarcadero, Mission & SoMa and Golden Gate Park are registered");
  for (const p of sf) check(p.id.startsWith("sf-") && p.region === "san-francisco", `${p.id}: an sf- id that names its region`);
  // hills: none in New Orleans; in San Francisco each rises at its centre, ends at its radius, and stays gentle
  for (const p of R.NP_PARISHES.filter((q) => R.npRegionOf(q) === "new-orleans")) check(!(p.hills?.length) && E.npHillRise(p, 0, 0) === 0, `${p.id}: no hills, the delta stays flat`);
  const hillNames = new Set();
  for (const p of sf) {
    check((p.hills ?? []).length >= 1, `${p.id}: at least one hill`);
    for (const h of p.hills ?? []) {
      hillNames.add(h.name);
      check(E.npHillRise(p, ...h.center) >= h.height * 0.95 && E.npHeightAt(p, ...h.center) > E.NP_GROUND + h.height * 0.9, `${p.id}/${h.id}: the ground rises at the hill's centre (${E.npHeightAt(p, ...h.center).toFixed(1)} m)`);
      check(E.npHillRise(p, h.center[0] + h.radius + 1, h.center[1]) === 0 || (p.hills ?? []).some((o) => o !== h && Math.hypot(o.center[0] - h.center[0] - h.radius - 1, o.center[1] - h.center[1]) < o.radius), `${p.id}/${h.id}: the mound ends at its radius`);
      let steep = 0;
      for (let i = 0; i < 16; i++) { const a = (i / 16) * Math.PI * 2, r = h.radius * (0.25 + (i % 3) * 0.25); const x = h.center[0] + Math.cos(a) * r, z = h.center[1] + Math.sin(a) * r; if (Math.abs(x) < 2040 && Math.abs(z) < 2040 && !E.npWaterAt(p, x, z)) steep = Math.max(steep, E.npHillRise(p, x + 2, z) - E.npHillRise(p, x - 2, z), E.npHillRise(p, x, z + 2) - E.npHillRise(p, x, z - 2)); }
      check(steep / 4 < E.NP_HILL.maxSlope, `${p.id}/${h.id}: its flanks are gentle (steepest sampled ${(steep / 4).toFixed(2)})`);
      check(!/\d/.test(h.name) && !/\d/.test(h.id), `${p.id}/${h.id}: a name only, no figure`);
    }
    for (const s of p.sites) {
      const hill = E.npHillAt(p, ...s.position);
      if (hill) check(Math.abs(E.npHeightAt(p, ...s.position) - (E.NP_GROUND + E.npHillRise(p, ...s.position))) < 0.5, `${p.id}/${s.id}: a site on ${hill.name} stands on a terrace at the hill's height, not in a pit`);
    }
  }
  for (const n of ["Twin Peaks", "Nob Hill", "Russian Hill", "Telegraph Hill", "Bernal Heights"]) check(hillNames.has(n), `San Francisco: ${n} rises`);
  // the district briefs: each has the brief's kinds of site, its water, and names no figure or history
  const kinds = { "sf-downtown": ["port", "ferry", "transit", "hospital", "union-hall"], "sf-mission": ["rail", "construction", "school", "stadium", "workshop"], "sf-golden-gate-park": ["park", "lifeguard", "hospital", "campus"] };
  const waters = { "sf-downtown": ["bay"], "sf-mission": ["bay"], "sf-golden-gate-park": ["ocean", "lake"] };
  for (const p of sf) {
    check(p.sites.length >= 8, `${p.id}: eight or more sites (${p.sites.length})`);
    for (const k of kinds[p.id] ?? []) check(p.sites.some((s) => s.kind === k), `${p.id}: a ${k} site`);
    for (const k of waters[p.id] ?? []) check(p.water.some((w) => w.kind === k), `${p.id}: ${k} water`);
    check(p.connectors.some((c) => R.npRegionOf(parishes.get(c.to.parish) ?? { region: "san-francisco" }) === "san-francisco" && c.to.parish !== p.id), `${p.id}: a way to another San Francisco district`);
    const src = readFileSync(join(WEBXR, "shared", `np-data-${p.id}.js`), "utf8");
    check(!/population|founded|built in|opened in|census|since \d|\best\.|\bcirca\b|elevation|feet high|metres high|meters high/i.test(src), `${p.id}: no history, statistics or elevations`);
    const text = [...p.sites, ...p.landmarks, ...p.districts, ...(p.hills ?? [])].map((x) => `${x.name} ${x.blurb ?? ""}`).join(" ") + ` ${p.name} ${p.blurb ?? ""}`;
    check(!/\d/.test(text), `${p.id}: no figure in a name or blurb`);
  }
  check(sf.find((p) => p.id === "sf-golden-gate-park")?.landmarks.some((l) => l.kind === "windmill"), "sf-golden-gate-park: a windmill landmark");
  check(sf.find((p) => p.id === "sf-downtown")?.landmarks.some((l) => l.id === "the-ferry-building"), "sf-downtown: the Ferry Building as a place");
  // the Bay Bridge way out (GOLDEN-B's world connector) leaves from dry ground the learner can walk to
  { const d = R.npParish("sf-downtown"); if (d) { const bb = G.npGeoToXz(d, [-122.387, 37.790]); check(G.npInField(d, bb) && !E.npWaterAt(d, ...bb), `sf-downtown: the Bay Bridge point [-122.387, 37.790] is on dry ground (${bb.map(Math.round)})`); } }
  // the page follows the region
  check(/npRegionGroups\(NP_PARISHES\)/.test(app0) && /document\.title = `\$\{parish\.name\} — \$\{npRegionHere\.title\}`/.test(app0), "the selector shows regions then maps and the page title follows the region");
}
// San Francisco (GOLDEN-B): Marina & Presidio and Bayview & Hunters Point on the region schema, and the Bay Bridge to Bay World.
{
  const SG = await imp("shared/sg-ways.js");
  const ATLAS = await imp("bayworld/js/atlas.js");
  const app = readFileSync(join(WEBXR, "parishes", "js", "app.js"), "utf8");
  const bundler = readFileSync(join(ROOT, "tools", "bundle_webxr.py"), "utf8");
  for (const id of ["sf-marina", "sf-bayview"]) {
    const p = R.npParish(id);
    if (!check(!!p, `${id} is registered`)) continue;
    check(p.region === "san-francisco", `${id}: region is san-francisco`);
    check(Array.isArray(p.hills) && p.hills.length >= 1 && p.hills.every((h) => typeof h.id === "string" && typeof h.name === "string" && Array.isArray(h.center) && h.center.length === 2 && G.npInField(p, h.center) && h.radius > 0 && h.height > 0), `${id}: hills on the brief's shape ({ id, name, center, radius, height })`);
    for (const h of p.hills ?? []) for (const s of p.sites) check(Math.hypot(s.position[0] - h.center[0], s.position[1] - h.center[1]) > h.radius + 40, `${id}/${s.id}: the pad sits clear of ${h.name}, so it stays flat once hills rise`);
    check(p.sites.length >= 8, `${id}: eight or more sites (${p.sites.length})`);
    check((p.fieldLessons ?? []).length >= 5 && p.fieldLessons.every((l) => /^sg-fl-/.test(l.id) && ctx.stations.has(l.station)), `${id}: five or more sg-fl- field lessons, each with a trade station`);
    const src = readFileSync(join(WEBXR, "shared", `np-data-${id}.js`), "utf8");
    check(!/population|founded|built in|opened in|census|since \d|\best\.|\bcirca\b/i.test(src), `${id}: no history or statistics`);
    const text = [...p.sites, ...p.landmarks, ...p.districts, ...(p.hills ?? [])].map((x) => `${x.name} ${x.blurb ?? ""}`).join(" ");
    check(!/\d/.test(text), `${id}: no figure in a site, landmark, district or hill name or blurb`);
  }
  const m = R.npParish("sf-marina"), b = R.npParish("sf-bayview");
  if (m) {
    for (const kind of ["marina", "park", "rescue-station", "bridge"]) check(m.sites.some((s) => s.kind === kind), `sf-marina: a ${kind} site`);
    check(m.landmarks.some((l) => l.id === "golden-gate-bridge" && l.kind === "bridge") && m.roads.some((r) => r.id === "golden-gate-bridge" && r.kind === "bridge"), "sf-marina: the Golden Gate Bridge is a bridge landmark and a bridge deck");
    const gg = m.connectors.find((c) => c.id === "sf-golden-gate-bridge");
    check(!!gg && gg.kind === "bridge" && !parishes.has(gg.to.parish) && gg.to.lonlat[1] > G.npBounds(m).maxLat - 0.01, "sf-marina: the Golden Gate Bridge is a way out north with no map beyond it yet");
    for (const [cid, to] of [["sf-ma-van-ness-north", "sf-downtown"], ["sf-ma-embarcadero-north", "sf-downtown"], ["sf-ma-park-presidio", "sf-golden-gate-park"]]) check(m.connectors.some((c) => c.id === cid && c.to.parish === to && c.kind === "road"), `sf-marina: ${cid} to ${to} (the contract with GOLDEN-A)`);
  }
  if (b) {
    for (const kind of ["shipyard", "remediation", "rail", "recreation", "wetland", "port"]) check(b.sites.some((s) => s.kind === kind), `sf-bayview: a ${kind} site`);
    const hp = catalog.curricula.find((c) => c.id === "hunters-point-bay-restoration").stations.map((s) => s.id);
    const clear = b.sites.filter((s) => s.programmes.includes("hunters-point-bay-restoration"));
    check(clear.length >= 4 && hp.every((id) => b.sites.some((s) => s.stations.includes(id))), `sf-bayview: every station of the C.L.E.A.R. clean-up programme is worked at its sites (${clear.length} sites; missing ${hp.filter((id) => !b.sites.some((s) => s.stations.includes(id))).join(", ")})`);
    for (const cid of ["sf-bv-third-street-south", "sf-bv-bayshore-south"]) check(b.connectors.some((c) => c.id === cid && c.to.parish === "sf-mission" && c.kind === "road"), `sf-bayview: ${cid} to sf-mission (the contract with GOLDEN-A)`);
  }
  // The Bay Bridge: a world connector from Downtown to a West Oakland site in Bay World, and the way back.
  const bb = SG.SG_WAYS.find((w) => w.id === "sf-bay-bridge");
  check(!!bb && bb.kind === "world" && bb.from.parish === "sf-downtown" && bb.lonlat[0] === -122.387 && bb.lonlat[1] === 37.79, "the Bay Bridge leaves sf-downtown at the agreed crossing");
  const bwSite = BAY_SITES.find((s) => s.id === bb?.to.site);
  check(!!bwSite && bwSite.zone === "west-oakland", `the Bay Bridge lands at a West Oakland site in Bay World (${bb?.to.site})`);
  check(bb?.to.href === `../bayworld/index.html?site=${bb?.to.site}`, "the Bay Bridge opens Bay World's page with ?site=");
  const flat = lkFlatten([bb?.to.href ?? "", SG.SG_WAY_BACK.href]);
  check(flat[0] === `./bayworld.html?site=${bb?.to.site}`, `the bundler flattens it to bayworld.html?site= (${flat[0]})`);
  check(flat[1] === "./parishes.html?parish=sf-downtown", `and the way back to parishes.html?parish=sf-downtown (${flat[1]})`);
  const cross = LK.lkWorldLink(bb.to.href, { from: "parishes", page: "/parishes/parishes.html", siteId: "sf-downtown/ferry-building" });
  check(cross.startsWith(bb.to.href + "&from=parishes&return=") && !cross.includes("#"), "the crossing carries from=parishes and an encoded return (no bare hash for Bay World to misread)");
  // Resolved against a stand-in Downtown (the real one is GOLDEN-A's): drawn inside the field and always resolved.
  const stub = { id: "sf-downtown", size: 4096, connectors: [], anchors: [[-600, 0, -122.410, 37.790], [600, 0, -122.396, 37.790], [0, -600, -122.403, 37.798], [0, 600, -122.403, 37.782], [-500, -500, -122.409, 37.797], [500, 500, -122.397, 37.783]].map(([x, z, lon, lat]) => ({ xz: [x, z], lonlat: [lon, lat], approximate: true, name: "stand-in" })) };
  const way = R.npResolveConnectors(stub).find((c) => c.id === "sf-bay-bridge");
  check(!!way && way.resolved && way.world === "bayworld" && G.npInField(stub, way.from.position), "a Downtown map draws the Bay Bridge as a way out inside its field");
  check(!!way && E.npValidate({ ...stub, connectors: [way] }, { worldSites: WORLD_SITES }).filter((x) => x.startsWith("connector")).length === 0, "the Bay Bridge validates as a world connector");
  if (parishes.has("sf-downtown")) note("sf-downtown is in the tree: the Bay Bridge is checked on the real Downtown above");
  else note("sf-bay-bridge: pending on the real sf-downtown (GOLDEN-A's module) — checked here on a stand-in");
  check(!!way && E.npValidate({ ...stub, connectors: [{ ...way, to: { ...way.to, site: "nowhere", href: "../bayworld/index.html?site=nowhere" } }] }, { worldSites: WORLD_SITES }).some((x) => /is not a bayworld site/.test(x)), "a world way to an unknown Bay World site is refused");
  check(ATLAS.ATLAS_WAY_BACK.href === SG.SG_WAY_BACK.href, "the Atlas's way back is the Bay Bridge's");
  check(readFileSync(join(WEBXR, "bayworld", "atlas.html"), "utf8").includes(`href="${SG.SG_WAY_BACK.href}"`), "the Atlas page links the way back to San Francisco");
  check(readFileSync(join(WEBXR, "bayworld", "index.html"), "utf8").includes(`id="map-way-sf" data-way="sf-bay-bridge" href="${SG.SG_WAY_BACK.href}"`), "Bay World's map links the way back to San Francisco");
  check(/c\.world\) \{ npCrossWorld\(c\)/.test(app) && /lkWorldLink\(c\.to\.href, \{ from: "parishes"/.test(app), "the parishes app crosses a world way with lkWorldLink");
  check(bundler.includes('SHARED / "sg-ways.js"'), "sg-ways.js is in the parishes bundle");
}

// Oakland & the East Bay (console BAYMAP, docs/consoles/BAYMAP.md): the third region, its three districts on the strict
// engine, the brief's kinds of site and water, named hills, paired connectors, the Bay Bridge to Downtown and the ways to Bay World.
{
  const BM = await imp("shared/bm-ways.js");
  check(R.npRegion("oakland")?.noun === "district" && R.NP_REGIONS.map((r) => r.id).slice(0, 3).join() === "new-orleans,san-francisco,oakland", "regions: Oakland & the East Bay follows San Francisco (districts)");
  const oak = R.npRegionGroups().find((g) => g.region.id === "oakland")?.parishes ?? [];
  const bmKinds = { "oak-west-oakland": ["port", "rail", "union-hall", "school", "recreation", "transit"], "oak-downtown-lake": ["construction", "hospital", "campus", "civic", "theatre"], "oak-fruitvale-estuary": ["marina", "market", "school", "workshop", "park"] };
  const bmWaters = { "oak-west-oakland": ["bay"], "oak-downtown-lake": ["lake"], "oak-fruitvale-estuary": ["canal", "bay"] };
  check(Object.keys(bmKinds).every((id) => oak.some((p) => p.id === id)), `Oakland: the three districts are registered (${oak.map((p) => p.id).join(", ")})`);
  for (const p of oak.filter((x) => bmKinds[x.id])) {
    check(p.id.startsWith("oak-") && p.region === "oakland" && NP_ENGINE_STRICT.has(p.id), `${p.id}: an oak- id in region oakland, held strict`);
    check(p.sites.length >= 10, `${p.id}: ten or more sites (${p.sites.length})`);
    for (const k of bmKinds[p.id] ?? []) check(p.sites.some((s) => s.kind === k), `${p.id}: a ${k} site`);
    for (const k of bmWaters[p.id] ?? []) check(p.water.some((w) => w.kind === k), `${p.id}: ${k} water`);
    for (const h of p.hills ?? []) for (const s of p.sites) check(Math.hypot(s.position[0] - h.center[0], s.position[1] - h.center[1]) > h.radius + 40, `${p.id}/${s.id}: the pad sits clear of ${h.name}`);
    check((p.fieldLessons ?? []).length >= 3 && p.fieldLessons.every((l) => /^bm-fl-/.test(l.id) && ctx.k12.has(l.k12) && ctx.stations.has(l.station)), `${p.id}: three or more bm-fl- field lessons, each on a K-12 station with a trade station`);
    const src = readFileSync(join(WEBXR, "shared", `np-data-${p.id}.js`), "utf8");
    check(!/population|founded|built in|opened in|census|since \d|\best\.|\bcirca\b|elevation|feet high|metres high|meters high/i.test(src), `${p.id}: no history, statistics or elevations`);
    const text = [...p.sites, ...p.landmarks, ...p.districts, ...(p.hills ?? [])].map((x) => `${x.name} ${x.blurb ?? ""}`).join(" ") + ` ${p.name} ${p.blurb ?? ""}`;
    check(!/\d/.test(text), `${p.id}: no figure in a name or blurb`);
    const pairs = p.connectors.filter((c) => c.to.parish !== p.id);
    check(pairs.filter((c) => /^bm-(wo|dl|fe)-/.test(c.id)).length >= 2 && pairs.every((c) => /^(bm-(wo|dl|fe)|eb-wo)-/.test(c.id)), `${p.id}: two or more bm- connectors (EASTBAY's eb-wo- pair joins Emeryville)`);
    const way = R.npResolveConnectors(p).find((c) => c.kind === "world");
    check(!!way && way.world === "bayworld" && WORLD_SITES.bayworld.has(way.to.site) && G.npInField(p, way.from.position) && !E.npWaterAt(p, ...way.from.position), `${p.id}: a way into Bay World (${way?.to.site}) from dry ground inside the field`);
  }
  check(oak.find((p) => p.id === "oak-downtown-lake")?.landmarks.some((l) => /Theat/.test(l.name) && l.kind === "place"), "oak-downtown-lake: a theatre stands as a place");
  const wo = R.npParish("oak-west-oakland"), dt = R.npParish("sf-downtown");
  const bbW = wo?.connectors.find((c) => c.id === "bm-wo-bay-bridge-west"), bbE = dt?.connectors.find((c) => c.id === "sf-dt-bay-bridge-east");
  check(!!bbW && !!bbE && bbW.kind === "bridge" && bbE.kind === "bridge" && bbW.lonlat.join() === bbE.lonlat.join() && bbW.to.parish === "sf-downtown" && bbE.to.parish === "oak-west-oakland", "the Bay Bridge pairs West Oakland and Downtown (bm-wo-bay-bridge-west, sf-dt-bay-bridge-east) at one mid-crossing");
  if (bbW && bbE) check(!E.npWaterAt(wo, ...bbW.from.position) && !E.npWaterAt(dt, ...bbE.from.position), "both Bay Bridge ends leave from dry ground");
  check(wo?.roads.some((r) => r.kind === "bridge" && r.id === "bay-bridge"), "oak-west-oakland: the Bay Bridge is a bridge deck");
  check(BM.BM_WAYS.every((w) => w.kind === "world" && w.id.startsWith("bm-") && w.to.href === `../bayworld/index.html?site=${w.to.site}`), "every Oakland way opens Bay World's page with ?site=");
  check(BAY_SITES.find((s) => s.id === BM.BM_WAYS.find((w) => w.id === "bm-wo-bay-world")?.to.site)?.zone === "west-oakland", "West Oakland's way lands at a West Oakland site in Bay World");
  check(readFileSync(join(ROOT, "tools", "bundle_webxr.py"), "utf8").includes('SHARED / "bm-ways.js"'), "bm-ways.js is in the parishes bundle");
}

// More of the Bay Area (console EASTBAY, docs/consoles/EASTBAY.md): Emeryville & Berkeley in Oakland, San Pablo & Richmond in
// the North East Bay, Downtown San Jose in the South Bay — strict, 12+ sites of the brief's kinds, named hills clear of every
// pad, paired eb- connectors, the two EPA-named stormwater projects told only in the program's words, and clear of the
// incoming Bay Program maps' areas.
{
  const ebMaps = { "oak-emeryville-berkeley": { region: "oakland", kinds: ["transit", "marina", "campus", "civic", "utility", "wetland"], waters: ["bay", "lake", "canal"], hills: ["the Berkeley Hills", "Albany Hill"] },
    "bay-san-jose": { region: "south-bay", kinds: ["transit", "campus", "civic", "utility", "park", "airport"], waters: ["canal"], hills: [] },
    "bay-san-pablo": { region: "north-east-bay", kinds: ["transit", "civic", "marina", "port", "shipyard", "utility"], waters: ["bay", "canal"], hills: ["the Point Richmond hills", "the El Cerrito hills"] } };
  check(R.npRegion("south-bay")?.name === "South Bay" && R.npRegion("north-east-bay")?.noun === "district", "regions: South Bay and North East Bay are registered (districts)");
  const bp = [["bp-strip-marsh-east (San Pablo Bay along Highway 37)", [-122.30, 38.12]], ["bp-san-leandro-bay", [-122.21, 37.745]]];
  for (const [id, want] of Object.entries(ebMaps)) {
    const p = R.npParish(id);
    check(!!p && p.region === want.region && NP_ENGINE_STRICT.has(id), `${id}: registered in region ${want.region}, held strict`);
    if (!p) continue;
    check(p.sites.length >= 12, `${id}: twelve or more sites (${p.sites.length})`);
    for (const k of want.kinds) check(p.sites.some((s) => s.kind === k), `${id}: a ${k} site`);
    for (const k of want.waters) check(p.water.some((w) => w.kind === k), `${id}: ${k} water`);
    check((p.hills ?? []).map((h) => h.name).join() === want.hills.join(), `${id}: named hills where the ground rises (${(p.hills ?? []).map((h) => h.name).join(", ") || "none — the field is flat"})`);
    for (const h of p.hills ?? []) for (const s of p.sites) check(Math.hypot(s.position[0] - h.center[0], s.position[1] - h.center[1]) > h.radius + 40, `${id}/${s.id}: the pad sits clear of ${h.name}`);
    check(p.landmarks.length >= 5 && p.landmarks.every((l) => !/\d/.test(l.name)), `${id}: five or more named landmarks (${p.landmarks.length})`);
    check((p.fieldLessons ?? []).length >= 3 && p.fieldLessons.every((l) => /^eb-fl-/.test(l.id) && ctx.k12.has(l.k12) && ctx.stations.has(l.station)), `${id}: three or more eb-fl- field lessons, each on a K-12 station with a trade station`);
    const src = readFileSync(join(WEBXR, "shared", `np-data-${id}.js`), "utf8");
    check(!/population|founded|built in|opened in|census|since \d|\best\.|\bcirca\b|elevation|feet high|metres high|meters high|\$|million|acres/i.test(src), `${id}: no history, statistics, amounts or elevations`);
    const text = [...p.sites, ...p.landmarks, ...p.districts, ...(p.hills ?? [])].map((x) => `${x.name} ${x.blurb ?? ""}`).join(" ") + ` ${p.name} ${p.blurb ?? ""}`;
    check(!/\d/.test(text), `${id}: no figure in a name or blurb`);
    const pairs = p.connectors.filter((c) => c.to.parish !== id);
    check(pairs.length >= 2 && pairs.every((c) => /^eb-(em|sp|sj)-/.test(c.id)), `${id}: two or more eb- connectors`);
    for (const c of pairs) check(!E.npWaterAt(p, ...c.from.position), `${id}/${c.id}: leaves from dry ground`);
    for (const [name, ll] of bp) check(!G.npGeoContains(p, ll), `${id}: clear of ${name}`);
  }
  // the EPA facts, only as worded in the program's facts (no amount, the project's own words)
  const sj = R.npParish("bay-san-jose"), sp = R.npParish("bay-san-pablo");
  check(!!sj?.sites.some((s) => s.blurb.includes("develop a green stormwater infrastructure implementation plan") && s.blurb.includes("EPA's San Francisco Bay Program")), "bay-san-jose: the City of San Jose's named project is told in the program's words");
  check(!!sp?.sites.some((s) => s.blurb.includes("green stormwater infrastructure, designed to capture and treat stormwater runoff") && s.blurb.includes("EPA's San Francisco Bay Program")), "bay-san-pablo: the City of San Pablo's named project is told in the program's words");
  const wo = R.npParish("oak-west-oakland"), em = R.npParish("oak-emeryville-berkeley");
  const spa = wo?.connectors.find((c) => c.id === "eb-wo-san-pablo-avenue-north"), spb = em?.connectors.find((c) => c.id === "eb-em-san-pablo-avenue-south");
  check(!!spa && !!spb && spa.lonlat.join() === spb.lonlat.join() && spa.to.parish === em.id && spb.to.parish === wo.id, "San Pablo Avenue pairs West Oakland and Emeryville (eb-wo-san-pablo-avenue-north, eb-em-san-pablo-avenue-south) at one crossing");
  check(readFileSync(join(ROOT, "tools", "bundle_webxr.py"), "utf8").split('SHARED / "np-data-bay-san-pablo.js"').length === 3, "the three EASTBAY modules are in both bundles that carry np-parishes.js");
}

if (deferred.length) console.log(`  · ${deferred.length} engine-geometry finding(s) deferred for ${[...new Set(deferred.map((m) => m.split(/[:/]/)[0]))].join(", ")} — console ASSAYER (the Bayou run) brings each parish onto the engine and adds it to NP_ENGINE_STRICT`);
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
