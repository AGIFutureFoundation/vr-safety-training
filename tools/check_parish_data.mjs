#!/usr/bin/env node
/**
 * The parish data modules (console DELTA, crescent brief): every
 * WebXR/shared/np-data-<parish>.js validates against the shared parish schema
 * and against the platform's registries, with no engine and no browser.
 *
 *     node tools/check_parish_data.mjs
 *
 * Pure Node. Discovers every np-data-*.js under WebXR/shared, fits each
 * parish's own affine from its anchors (the same least squares as
 * shared/bay-geo.js, so it needs nothing from PARISH's np-geo.js), and holds:
 *   - the shape the brief prints (id, name, size 4096, anchors, water, levees,
 *     roads, districts, sites, landmarks, connectors, fieldLessons, gated);
 *   - anchors: six to ten, three decimals, `approximate: true`, inside the
 *     field, and the fit puts each one back within 150 ground metres;
 *   - every point of every water body, levee, road and district inside the
 *     field; every road and water kind from the schema's list;
 *   - eight or more sites, ids unique across every parish, on the field and
 *     out of the lake and gulf, every trade a tools/unions.json id, every
 *     programme a catalog curriculum id, every station a catalog station id;
 *   - connectors: schema kinds, `from` is this parish, both ends project
 *     within 1 km of each other through their parishes' fits (an end in a
 *     parish this tree does not hold — Orleans, in PARISH's worktree — is
 *     checked against the connector's agreed `lonlat` instead);
 *   - field lessons on the RW_FIELD_LESSONS shape (id with -fl-, site,
 *     optional landmark, K-12 station, trade line, two to four minutes, three
 *     steps, a check with options, an answer and a why), no digits anywhere;
 *   - gated items on the gate contract (id, kind, title, site, world, gate
 *     with a note and resolvable stations / programmes / k12), no digits in
 *     the note;
 *   - regions and hills (console GOLDEN-A): `region` is optional (a map
 *     without one is a New Orleans parish) and a known region when given;
 *     `hills` are named gentle mounds on the field, crowns out of the water;
 *     the bay and ocean water kinds and the park district character;
 *   - the facts rule: no digits in any name or lesson text, no Mapbox token
 *     shape anywhere in the modules.
 * PARISH's check_parishes.mjs is meant to absorb this file; until then it
 * runs on its own and is not in check_all.
 */
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const WEBXR = join(ROOT, "WebXR");
const SHARED = join(WEBXR, "shared");
let ndPasses = 0, ndFailures = 0;
const ndCheck = (ok, msg) => { if (ok) ndPasses++; else { ndFailures++; console.error(`  FAIL ${msg}`); } };
const ndNotes = [];

// ------------------------------------------------------------ registries
const ndCatalog = JSON.parse(readFileSync(join(WEBXR, "smartcity", "catalog.json"), "utf8"));
const ndStationIds = new Set(ndCatalog.stations.map((s) => s.id));
const ndProgrammeIds = new Set(ndCatalog.curricula.map((c) => c.id));
const ndK12Ids = new Set(ndCatalog.curricula.filter((c) => c.audience === "classroom").flatMap((c) => c.stations.map((s) => s.id)));
const ndUnionIds = new Set(JSON.parse(readFileSync(join(ROOT, "tools", "unions.json"), "utf8")).unions.map((u) => u.id));
let ndPP = null;
try { ndPP = (await import(pathToFileURL(join(SHARED, "passport-programmes.js")).href)).PP_PROGRAMMES ?? null; } catch { ndPP = null; }

// ------------------------------------------------------------ the affine
// Least squares `target ≈ p·x + q·z + r` over the anchors, as bay-geo.js does.
function ndSolve3(m, rhs) {
  const a = m.map((row, i) => [...row, rhs[i]]);
  for (let col = 0; col < 3; col++) {
    let pivot = col;
    for (let r = col + 1; r < 3; r++) if (Math.abs(a[r][col]) > Math.abs(a[pivot][col])) pivot = r;
    if (Math.abs(a[pivot][col]) < 1e-12) return null;
    if (pivot !== col) [a[col], a[pivot]] = [a[pivot], a[col]];
    for (let r = 0; r < 3; r++) {
      if (r === col) continue;
      const f = a[r][col] / a[col][col];
      for (let c = col; c < 4; c++) a[r][c] -= f * a[col][c];
    }
  }
  return [a[0][3] / a[0][0], a[1][3] / a[1][1], a[2][3] / a[2][2]];
}
function ndFitAxis(anchors, target) {
  const n = [[0, 0, 0], [0, 0, 0], [0, 0, 0]], rhs = [0, 0, 0];
  for (const a of anchors) {
    const row = [a.xz[0], a.xz[1], 1], y = target(a);
    for (let i = 0; i < 3; i++) { rhs[i] += row[i] * y; for (let j = 0; j < 3; j++) n[i][j] += row[i] * row[j]; }
  }
  return ndSolve3(n, rhs);
}
function ndFit(anchors) {
  const lon = ndFitAxis(anchors, (a) => a.lonlat[0]), lat = ndFitAxis(anchors, (a) => a.lonlat[1]);
  if (!lon || !lat) return null;
  return ([x, z]) => [lon[0] * x + lon[1] * z + lon[2], lat[0] * x + lat[1] * z + lat[2]];
}
/** Ground metres between two lon/lat pairs (equirectangular; fine under 100 km). */
function ndGroundMetres([lon1, lat1], [lon2, lat2]) {
  const mid = ((lat1 + lat2) / 2) * Math.PI / 180;
  return Math.hypot((lon2 - lon1) * 111320 * Math.cos(mid), (lat2 - lat1) * 110574);
}

// ------------------------------------------------------------ helpers
const ndIsXz = (p) => Array.isArray(p) && p.length === 2 && p.every((v) => Number.isFinite(v));
const ndInField = (p, half) => ndIsXz(p) && Math.abs(p[0]) <= half && Math.abs(p[1]) <= half;
const ndDigits = (s) => /\d/.test(String(s ?? ""));
const ndSlug = (s) => typeof s === "string" && /^[a-z][a-z0-9-]*$/.test(s);
function ndInPoly([x, z], poly) {
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, zi] = poly[i], [xj, zj] = poly[j];
    if ((zi > z) !== (zj > z) && x < ((xj - xi) * (z - zi)) / (zj - zi) + xi) inside = !inside;
  }
  return inside;
}
/** Map metres from a point to a polyline (the shortest distance to any segment). */
function ndRibbonDistance([x, z], pts) {
  let best = Infinity;
  for (let i = 1; i < pts.length; i++) {
    const [ax, az] = pts[i - 1], [bx, bz] = pts[i], dx = bx - ax, dz = bz - az, L = dx * dx + dz * dz || 1;
    const t = Math.max(0, Math.min(1, ((x - ax) * dx + (z - az) * dz) / L));
    best = Math.min(best, Math.hypot(x - ax - t * dx, z - az - t * dz));
  }
  return best;
}
const ND_WATER_KINDS = new Set(["river", "lake", "canal", "bayou", "wetland", "gulf", "bay", "ocean"]);
/** The regions a map may name (np-parishes.js NP_REGIONS); a map with no `region` is a New Orleans parish. */
const ND_REGIONS = new Set(["new-orleans", "san-francisco", "oakland", "north-east-bay", "south-bay", "bay-program", "programmes"]);
const ND_ROAD_KINDS = new Set(["interstate", "avenue", "street", "riverroad", "bridge", "causeway", "ferry"]);
const ND_DISTRICT_CHARACTERS = new Set(["quarter", "downtown", "garden", "industrial", "suburb", "port", "wetland", "refinery", "campus", "park"]);
const ND_CONNECTOR_KINDS = new Set(["bridge", "causeway", "ferry", "road"]);
const ND_TOKEN_SHAPE = /\bpk\.[A-Za-z0-9_-]{20,}/;

// ------------------------------------------------------------ discover
const ndFiles = readdirSync(SHARED).filter((f) => /^np-data-[a-z-]+\.js$/.test(f)).sort();
ndCheck(ndFiles.length >= 4, `at least four parish data modules under WebXR/shared (found ${ndFiles.length})`);
const ndParishes = new Map();
for (const f of ndFiles) {
  const src = readFileSync(join(SHARED, f), "utf8");
  ndCheck(!/^import\s/m.test(src), `${f}: pure data, imports nothing`);
  ndCheck(!ND_TOKEN_SHAPE.test(src), `${f}: no Mapbox token shape`);
  ndCheck(!/THREE\./.test(src), `${f}: does not spell THREE.`);
  let mod;
  try { mod = await import(pathToFileURL(join(SHARED, f)).href); } catch (e) { ndCheck(false, `${f} imports: ${e.message}`); continue; }
  const entries = Object.entries(mod).filter(([, v]) => v && typeof v === "object" && typeof v.id === "string" && v.size !== undefined);
  ndCheck(entries.length === 1, `${f}: exports exactly one parish object (found ${entries.length})`);
  for (const [name, v] of entries) {
    ndCheck(/^NP_[A-Z_]+$/.test(name), `${f}: export ${name} is named NP_<PARISH>`);
    ndCheck(f === `np-data-${v.id}.js`, `${f}: file name matches parish id ${v.id}`);
    ndParishes.set(v.id, { ...v, file: f });
  }
}

// ------------------------------------------------------------ each parish
const ndAllSiteIds = new Map(), ndAllLessonIds = new Set(), ndAllGatedIds = new Set(), ndAllConnectorIds = new Set();
const ndFits = new Map();
let ndSites = 0, ndStationRefs = 0, ndConnectors = 0, ndAnchors = 0, ndLessons = 0, ndGated = 0, ndLandmarks = 0;

for (const [pid, p] of ndParishes) {
  const where = p.file;
  ndCheck(ndSlug(pid), `${where}: id is a slug`);
  ndCheck(typeof p.name === "string" && p.name.length > 2 && !ndDigits(p.name), `${where}: a name with no digits`);
  ndCheck(p.size === 4096, `${where}: size is 4096`);
  // region (console GOLDEN-A): optional — a map without one is a New Orleans parish — and a known region when given
  ndCheck(p.region === undefined || ND_REGIONS.has(p.region), `${where}: region ${p.region ?? "(New Orleans by default)"} is a known region`);
  ndCheck(!pid.startsWith("sf-") || p.region === "san-francisco", `${where}: an sf- map names region san-francisco`);
  // hills (console GOLDEN-A): optional; each a named gentle mound on the field, clear of the water
  if (p.hills !== undefined) {
    ndCheck(Array.isArray(p.hills), `${where}: hills is an array`);
    const hillIds = new Set();
    for (const h of Array.isArray(p.hills) ? p.hills : []) {
      const hw = `${where}: hill ${h.id}`;
      ndCheck(ndSlug(h.id) && !hillIds.has(h.id), `${hw}: slug id, unique`);
      hillIds.add(h.id);
      ndCheck(typeof h.name === "string" && h.name.length > 2 && !ndDigits(h.name), `${hw}: a name with no digits`);
      ndCheck(ndInField(h.center, (p.size ?? 4096) / 2), `${hw}: center on the field`);
      ndCheck(Number.isFinite(h.radius) && h.radius >= 80 && h.radius <= 1500, `${hw}: radius 80–1500 map metres (${h.radius})`);
      ndCheck(Number.isFinite(h.height) && h.height > 0 && h.height <= 120 && (h.height * Math.PI) / (2 * h.radius) < 0.35, `${hw}: a gentle mound (height ${h.height}, radius ${h.radius})`);
      for (const w of p.water ?? []) if (!w.width && Array.isArray(w.poly) && w.poly.length >= 3) ndCheck(!ndInPoly(h.center, w.poly), `${hw}: its crown is not in ${w.id}`);
    }
  }
  const half = (p.size ?? 4096) / 2;
  for (const key of ["anchors", "water", "levees", "roads", "districts", "sites", "landmarks", "connectors", "fieldLessons", "gated"]) ndCheck(Array.isArray(p[key]), `${where}: ${key} is an array`);
  if (!Array.isArray(p.anchors) || !Array.isArray(p.sites)) continue;

  // anchors and the fit
  ndCheck(p.anchors.length >= 6 && p.anchors.length <= 10 + 1, `${where}: six to ten anchors (found ${p.anchors.length})`);
  for (const a of p.anchors) {
    ndCheck(ndInField(a.xz, half), `${where}: anchor ${a.name} xz on the field`);
    ndCheck(Array.isArray(a.lonlat) && a.lonlat.length === 2 && a.lonlat[0] > -180 && a.lonlat[0] < 180 && Math.abs(a.lonlat[1]) < 90, `${where}: anchor ${a.name} lonlat is a lon/lat pair`);
    ndCheck(a.approximate === true, `${where}: anchor ${a.name} is marked approximate`);
    ndCheck(Array.isArray(a.lonlat) && a.lonlat.every((v) => Math.abs(Math.round(v * 1000) / 1000 - v) < 1e-9), `${where}: anchor ${a.name} has at most three decimals`);
    ndCheck(typeof a.name === "string" && a.name.length > 1 && !ndDigits(a.name), `${where}: anchor ${a.name} has a name with no digits`);
  }
  ndAnchors += p.anchors.length;
  const toGeo = ndFit(p.anchors);
  ndCheck(!!toGeo, `${where}: the anchors fit an affine (not collinear)`);
  if (toGeo) {
    ndFits.set(pid, toGeo);
    let worst = 0;
    for (const a of p.anchors) worst = Math.max(worst, ndGroundMetres(toGeo(a.xz), a.lonlat));
    ndCheck(worst < 150, `${where}: the fit puts every anchor back within 150 ground metres (worst ${Math.round(worst)} m)`);
    const [cornerLon] = toGeo([-half, 0]), [cornerLon2] = toGeo([half, 0]);
    const groundWidth = ndGroundMetres(toGeo([-half, 0]), toGeo([half, 0]));
    // A walkable map (console NEIGHBORHOODS) declares its `scale` (real metres per map metre, recorded in docs/parishes.md):
    // its ground width is then the field times that scale, within 15 %, instead of the eight-kilometre floor.
    const ndDeclared = Number.isFinite(p.scale) && Math.abs(groundWidth / ((p.size ?? 4096) * p.scale) - 1) < 0.15;
    ndCheck((groundWidth > 8000 || ndDeclared) && groundWidth < 120000 && cornerLon < cornerLon2, `${where}: the field spans a plausible ground width, east to the right (${Math.round(groundWidth / 1000)} km${ndDeclared ? `, the declared scale ${p.scale}` : ""})`);
    const groundHeight = ndGroundMetres(toGeo([0, -half]), toGeo([0, half]));
    const aniso = groundWidth / groundHeight;
    ndCheck(aniso > 0.8 && aniso < 1.25 && toGeo([0, -half])[1] > toGeo([0, half])[1], `${where}: near-uniform scale with north up (width/height ${aniso.toFixed(2)})`);
  }

  // geometry
  const lakes = [];
  for (const w of p.water ?? []) {
    ndCheck(ndSlug(w.id) && ND_WATER_KINDS.has(w.kind), `${where}: water ${w.id} has a slug id and a schema kind (${w.kind})`);
    ndCheck(Array.isArray(w.poly) && w.poly.length >= 2 && w.poly.every((q) => ndInField(q, half)), `${where}: water ${w.id} points on the field`);
    ndCheck(w.width === undefined || (Number.isFinite(w.width) && w.width > 0), `${where}: water ${w.id} width is a positive number when given`);
    ndCheck(w.width !== undefined || w.poly.length >= 3, `${where}: water ${w.id} is a polygon (three or more points) or a ribbon with a width`);
    if (["lake", "gulf", "bay", "ocean"].includes(w.kind) && !w.width) lakes.push(w);
  }
  for (const l of p.levees ?? []) {
    ndCheck(ndSlug(l.id) && Array.isArray(l.pts) && l.pts.length >= 2 && l.pts.every((q) => ndInField(q, half)), `${where}: levee ${l.id} has two or more points on the field`);
    ndCheck(Number.isFinite(l.height) && l.height > 0 && l.height < 12, `${where}: levee ${l.id} has a plausible height`);
  }
  for (const r of p.roads ?? []) {
    ndCheck(ndSlug(r.id) && ND_ROAD_KINDS.has(r.kind), `${where}: road ${r.id} has a slug id and a schema kind (${r.kind})`);
    ndCheck(Array.isArray(r.pts) && r.pts.length >= 2 && r.pts.every((q) => ndInField(q, half)), `${where}: road ${r.id} has two or more points on the field`);
  }
  ndCheck((p.roads ?? []).length >= 5, `${where}: five or more roads (${(p.roads ?? []).length})`);
  ndCheck((p.water ?? []).length >= 3 && (p.levees ?? []).length >= 2, `${where}: water and levees present`);
  for (const d of p.districts ?? []) {
    ndCheck(ndSlug(d.id) && typeof d.name === "string" && !ndDigits(d.name), `${where}: district ${d.id} has a slug id and a name with no digits`);
    ndCheck(ND_DISTRICT_CHARACTERS.has(d.character), `${where}: district ${d.id} character is from the schema (${d.character})`);
    ndCheck(Array.isArray(d.poly) && d.poly.length >= 3 && d.poly.every((q) => ndInField(q, half)), `${where}: district ${d.id} is a polygon on the field`);
  }
  ndCheck((p.districts ?? []).length >= 5, `${where}: five or more districts (${(p.districts ?? []).length})`);

  // sites
  ndCheck(p.sites.length >= 8, `${where}: eight or more sites (${p.sites.length})`);
  const siteIds = new Set();
  for (const s of p.sites) {
    const sw = `${where}: site ${s.id}`;
    ndCheck(ndSlug(s.id) && !siteIds.has(s.id), `${sw}: slug id, unique in the parish`);
    ndCheck(!ndAllSiteIds.has(s.id) || ndAllSiteIds.get(s.id) === pid, `${sw}: id unique across parishes (also in ${ndAllSiteIds.get(s.id)})`);
    siteIds.add(s.id); ndAllSiteIds.set(s.id, pid);
    ndCheck(typeof s.name === "string" && s.name.length > 3 && !ndDigits(s.name), `${sw}: a name with no digits`);
    ndCheck(typeof s.kind === "string" && ndSlug(s.kind), `${sw}: a kind`);
    ndCheck(ndInField(s.position, half), `${sw}: position on the field`);
    ndCheck(!lakes.some((w) => ndInPoly(s.position, w.poly)), `${sw}: not in the lake or the gulf`);
    // …and on the bank of every ribbon (a river, a canal, a bayou), not in its water: further than half its width plus a
    // pad's margin from its centre line. Landmarks are exempt (a bridge, a lock and a canal sit on the water by nature).
    for (const w of p.water ?? []) if (w.width) ndCheck(ndRibbonDistance(s.position, w.poly) > w.width / 2 + 8, `${sw}: on the bank of ${w.id}, not in it (${Math.round(ndRibbonDistance(s.position, w.poly))} m from the centre line, half width ${w.width / 2})`);
    ndCheck(Array.isArray(s.trades) && s.trades.length >= 1 && s.trades.every((t) => ndUnionIds.has(t)), `${sw}: every trade is a tools/unions.json id (${(s.trades ?? []).filter((t) => !ndUnionIds.has(t)).join(", ") || "ok"})`);
    ndCheck(Array.isArray(s.programmes) && s.programmes.length >= 1 && s.programmes.every((c) => ndProgrammeIds.has(c)), `${sw}: every programme is a catalog curriculum (${(s.programmes ?? []).filter((c) => !ndProgrammeIds.has(c)).join(", ") || "ok"})`);
    ndCheck(Array.isArray(s.stations) && s.stations.length >= 2 && s.stations.every((id) => ndStationIds.has(id)), `${sw}: two or more stations, every one a catalog station (${(s.stations ?? []).filter((id) => !ndStationIds.has(id)).join(", ") || "ok"})`);
    ndCheck(new Set(s.stations ?? []).size === (s.stations ?? []).length, `${sw}: no station listed twice`);
    ndStationRefs += (s.stations ?? []).filter((id) => ndStationIds.has(id)).length;
    // two sites do not share a spot (the E radius on a board is about 14 m)
    for (const o of p.sites) if (o !== s && o.id < s.id) ndCheck(Math.hypot(o.position[0] - s.position[0], o.position[1] - s.position[1]) > 30, `${sw}: more than 30 m from ${o.id}`);
  }
  ndSites += p.sites.length;

  // landmarks
  const landmarkIds = new Set();
  for (const m of p.landmarks ?? []) {
    ndCheck(ndSlug(m.id) && !landmarkIds.has(m.id) && !siteIds.has(m.id), `${where}: landmark ${m.id} has a slug id distinct from every site and landmark`);
    landmarkIds.add(m.id);
    ndCheck(typeof m.name === "string" && !ndDigits(m.name) && typeof m.kind === "string", `${where}: landmark ${m.id} has a name with no digits and a kind`);
    ndCheck(ndInField(m.position, half), `${where}: landmark ${m.id} on the field`);
  }
  ndCheck((p.landmarks ?? []).length >= 6, `${where}: six or more landmarks (${(p.landmarks ?? []).length})`);
  ndLandmarks += (p.landmarks ?? []).length;

  // field lessons (RW_FIELD_LESSONS shape plus `why`)
  for (const f of p.fieldLessons ?? []) {
    const fw = `${where}: field lesson ${f.id}`;
    ndCheck(ndSlug(f.id) && f.id.includes("-fl-") && !ndAllLessonIds.has(f.id), `${fw}: slug id with -fl-, unique`);
    ndAllLessonIds.add(f.id);
    ndCheck(siteIds.has(f.site), `${fw}: site ${f.site} is a site of this parish`);
    ndCheck(f.landmark === undefined || landmarkIds.has(f.landmark), `${fw}: landmark ${f.landmark} is a landmark of this parish`);
    ndCheck(ndK12Ids.has(f.k12), `${fw}: k12 ${f.k12} is a classroom station`);
    ndCheck(typeof f.trade === "string" && typeof f.tradeLine === "string" && f.tradeLine.length > 20, `${fw}: trade and trade line`);
    ndCheck(Number.isInteger(f.minutes) && f.minutes >= 2 && f.minutes <= 4, `${fw}: two to four minutes`);
    ndCheck(Array.isArray(f.steps) && f.steps.length === 3 && f.steps.every((s) => typeof s === "string" && s.length > 10), `${fw}: three steps`);
    const c = f.check ?? {};
    ndCheck(typeof c.q === "string" && Array.isArray(c.options) && c.options.length >= 2 && c.options.length <= 4 && Number.isInteger(c.answer) && c.answer >= 0 && c.answer < c.options.length && typeof c.why === "string", `${fw}: check has q, options, a valid answer and a why`);
    const text = [f.title, f.tradeLine, ...(f.steps ?? []), c.q, ...(c.options ?? []), c.why].join(" ");
    ndCheck(!ndDigits(text), `${fw}: no digits in the lesson text`);
  }
  ndCheck((p.fieldLessons ?? []).length >= 3, `${where}: three or more field lessons (${(p.fieldLessons ?? []).length})`);
  ndLessons += (p.fieldLessons ?? []).length;

  // gated items (the gate contract)
  for (const g of p.gated ?? []) {
    const gw = `${where}: gated ${g.id}`;
    ndCheck(ndSlug(g.id) && !ndAllGatedIds.has(g.id), `${gw}: slug id, unique`);
    ndAllGatedIds.add(g.id);
    ndCheck(typeof g.kind === "string" && typeof g.title === "string" && !ndDigits(g.title), `${gw}: kind and a title with no digits`);
    ndCheck(siteIds.has(g.site), `${gw}: site ${g.site} is a site of this parish`);
    ndCheck(g.world === pid || g.world === "parishes", `${gw}: world names this parish or the parishes page`);
    const gate = g.gate ?? {};
    ndCheck(typeof gate.note === "string" && gate.note.length > 10 && !ndDigits(gate.note.replace(/K-12/g, "")), `${gw}: a lock note with no digits`);
    const req = [...(gate.stations ?? []), ...(gate.k12 ?? []), ...(gate.programmes ?? []), ...(gate.quests ?? [])];
    ndCheck(req.length >= 1, `${gw}: the gate requires something`);
    for (const id of gate.stations ?? []) ndCheck(ndStationIds.has(id), `${gw}: station ${id} resolves`);
    for (const id of gate.k12 ?? []) ndCheck(ndK12Ids.has(id), `${gw}: K-12 station ${id} resolves`);
    for (const pr of gate.programmes ?? []) ndCheck(pr && (ndPP ? !!ndPP[pr.id] : ndProgrammeIds.has(pr.id)) && (pr.minStars == null || Number.isInteger(pr.minStars)), `${gw}: programme ${pr?.id} resolves`);
    ndCheck(gate.quests === undefined || gate.quests.length === 0, `${gw}: no quest gates yet (SECONDLINE's quests are not in this tree)`);
  }
  ndCheck((p.gated ?? []).length >= 2, `${where}: two or more gated items (${(p.gated ?? []).length})`);
  ndGated += (p.gated ?? []).length;
}

// ------------------------------------------------------------ connectors
const ndNeighbours = new Map();
for (const [pid, p] of ndParishes) {
  const where = p.file, half = (p.size ?? 4096) / 2;
  const fitFrom = ndFits.get(pid);
  for (const c of p.connectors ?? []) {
    const cw = `${where}: connector ${c.id}`;
    ndCheck(ndSlug(c.id) && !ndAllConnectorIds.has(c.id), `${cw}: slug id, unique`);
    ndAllConnectorIds.add(c.id);
    ndCheck(ND_CONNECTOR_KINDS.has(c.kind), `${cw}: kind from the schema (${c.kind})`);
    ndCheck(typeof c.name === "string" && !ndDigits(c.name), `${cw}: a name with no digits`);
    ndCheck(c.from?.parish === pid && ndInField(c.from?.position, half), `${cw}: from is this parish, on the field`);
    ndCheck(typeof c.to?.parish === "string" && (c.to.parish !== pid || c.kind === "ferry"), `${cw}: to names another parish, or a ferry crosses inside this one`);
    const other = ndParishes.get(c.to?.parish);
    const fromGeo = fitFrom ? fitFrom(c.from.position) : null;
    if (other) {
      const fitTo = ndFits.get(other.id);
      ndCheck(ndInField(c.to.position, (other.size ?? 4096) / 2), `${cw}: to position on ${other.id}'s field`);
      if (fitTo && fromGeo && ndIsXz(c.to.position) && other !== p) {
        const d = ndGroundMetres(fromGeo, fitTo(c.to.position));
        // a bridge or causeway is listed at its mid-crossing, far from both shores; a road or ferry meets at the line
        const ndSpan = c.kind === "bridge" || c.kind === "causeway" ? 40000 : 2000;
        ndCheck(d < ndSpan, `${cw}: both ends project within ${ndSpan / 1000} km (${Math.round(d)} m)`);
      }
      const back = other === p ? true : (other.connectors ?? []).find((o) => o.to?.parish === pid && o.kind === c.kind && Math.abs(o.lonlat?.[0] - c.lonlat?.[0]) < 1e-6 && Math.abs(o.lonlat?.[1] - c.lonlat?.[1]) < 1e-6);
      ndCheck(!!back, `${cw}: ${other.id} lists the same crossing back (same kind and lonlat)`);
    } else {
      ndNotes.push(`${cw}: ${c.to?.parish} is not in this tree; its end is ${c.to?.position === null ? "null (PARISH fills it from lonlat)" : "given"}`);
      ndCheck(c.to?.position === null || ndIsXz(c.to?.position), `${cw}: to position is null or an xz pair`);
    }
    ndCheck(Array.isArray(c.lonlat) && c.lonlat.length === 2 && c.approximate === true, `${cw}: carries the agreed crossing lonlat, marked approximate`);
    if (fromGeo && Array.isArray(c.lonlat) && c.to?.parish !== pid) {
      const d = ndGroundMetres(fromGeo, c.lonlat);
      const ndNear = c.kind === "bridge" || c.kind === "causeway" ? 40000 : 2000;
      ndCheck(d < ndNear, `${cw}: the from end projects within ${ndNear / 1000} km of the agreed crossing (${Math.round(d)} m)`);
    }
    const key = [pid, c.to?.parish].sort().join("↔");
    ndNeighbours.set(key, (ndNeighbours.get(key) ?? 0) + 1);
  }
  ndCheck((p.connectors ?? []).length >= 2, `${where}: two or more connectors (${(p.connectors ?? []).length})`);
  ndCheck((p.connectors ?? []).some((c) => c.to?.parish && c.to.parish !== pid), `${where}: at least one connector reaches another parish`);
  ndConnectors += (p.connectors ?? []).length;
}
// The five connect: the causeway (Jefferson–St. Tammany), the river bridges and roads (Jefferson–Orleans,
// Jefferson–Plaquemines), the river road (St. Bernard–Plaquemines), a ferry (St. Bernard–Orleans).
// The San Francisco districts connect too (console GOLDEN-A): Downtown–Mission, Downtown–Golden Gate Park, Mission–Golden Gate Park.
for (const pair of ["jefferson↔st-tammany", "jefferson↔plaquemines", "plaquemines↔st-bernard", "jefferson↔orleans", "orleans↔st-bernard", "orleans↔st-tammany", ...(ndParishes.has("sf-downtown") ? ["sf-downtown↔sf-mission", "sf-downtown↔sf-golden-gate-park", "sf-golden-gate-park↔sf-mission"] : []), ...(ndParishes.has("sf-north-beach") ? ["sf-downtown↔sf-north-beach", "sf-marina↔sf-north-beach", "sf-golden-gate-park↔sf-haight-castro", "sf-haight-castro↔sf-mission", "sf-downtown↔sf-haight-castro", "sf-golden-gate-park↔sf-sunset-south"] : [])]) {
  ndCheck((ndNeighbours.get(pair) ?? 0) >= 1, `the parishes connect across ${pair}`);
}
// The walkable San Francisco districts (console NEIGHBORHOODS, docs/consoles/NEIGHBORHOODS.md): each declares a walkable
// scale, holds twelve or more sites, named hills, sn-fl- lessons and sn- gated items, and pairs its roads with the coarse districts.
for (const id of ["sf-north-beach", "sf-haight-castro", "sf-sunset-south"]) {
  const p = ndParishes.get(id);
  if (!ndCheck(!!p, `${id}: the walkable district is in the tree`)) continue;
  ndCheck(p.region === "san-francisco" && Number.isFinite(p.scale) && p.scale >= 0.9 && p.scale <= 1.5, `${id}: region san-francisco at a walkable declared scale (${p.scale})`);
  ndCheck(p.sites.length >= 12, `${id}: twelve or more sites (${p.sites.length})`);
  ndCheck((p.hills ?? []).length >= 1 && p.hills.every((h) => !ndDigits(h.name)), `${id}: named hills (${(p.hills ?? []).map((h) => h.name).join(", ")})`);
  ndCheck((p.fieldLessons ?? []).every((l) => l.id.startsWith("sn-fl-") && ndStationIds.has(l.station)), `${id}: every field lesson is sn-fl- with a trade station`);
  ndCheck((p.gated ?? []).every((g) => g.id.startsWith("sn-")), `${id}: every gated item is sn-`);
  const coarse = new Set((p.connectors ?? []).map((c) => c.to?.parish).filter((t) => ndParishes.has(t) && !["sf-north-beach", "sf-haight-castro", "sf-sunset-south"].includes(t)));
  ndCheck(coarse.size >= 1 && (p.connectors ?? []).every((c) => c.id.startsWith("sf-") && c.kind === "road"), `${id}: road connectors paired with the coarse districts (${[...coarse].join(", ")})`);
}
// Every announced project, walkable (console PROJECTLANDS, docs/consoles/PROJECTLANDS.md): a representative map says so in
// its data and its docs row; precinct sites are flagged, carry two or more stations and a trade, and state no figure.
for (const [pid, p] of ndParishes) {
  if (p.representative !== undefined) {
    ndCheck(p.representative === true && p.region === "bay-program" && /representative/.test(p.name), `${pid}: a representative map is flagged, in bay-program, and names itself representative`);
    ndCheck(readFileSync(join(ROOT, "docs", "parishes.md"), "utf8").split("\n").some((l) => l.includes(`\`${pid}\``) && /representative/.test(l)), `${pid}: its docs/parishes.md row says representative`);
    ndCheck((p.fieldLessons ?? []).every((l) => l.id.startsWith("pj-")) && (p.gated ?? []).every((g) => g.id.startsWith("bp-")), `${pid}: pj- field lessons and bp- gated items`);
  }
  for (const s of (p.sites ?? []).filter((x) => x.precinct)) {
    ndCheck(s.precinct === true && s.stations.length >= 2 && s.trades.length >= 1 && !ndDigits(`${s.name} ${s.blurb}`) && !/\$|million|acres|gallons|partner/i.test(s.blurb ?? ""), `${pid}: precinct site ${s.id} is flagged, staffed and states no figure or partnership`);
  }
}
ndCheck(["bp-san-mateo-shoreline", "bp-nutrient-pilot"].every((id) => ndParishes.get(id)?.representative === true), "PROJECTLANDS: bp-san-mateo-shoreline and bp-nutrient-pilot are in the tree, representative");
ndCheck([...ndParishes.values()].reduce((n, p) => n + (p.sites ?? []).filter((s) => s.precinct).length, 0) >= 15, "PROJECTLANDS: fifteen or more precinct sites on the maps that already held a project");
ndCheck([...ndParishes.values()].some((p) => (p.connectors ?? []).some((c) => c.kind === "causeway")), "a causeway connector exists");
ndCheck([...ndParishes.values()].some((p) => (p.connectors ?? []).some((c) => c.kind === "ferry")), "a ferry connector exists");
ndCheck([...ndParishes.values()].some((p) => (p.connectors ?? []).some((c) => c.kind === "bridge")), "a bridge connector exists");

// ------------------------------------------------------------ the map document
const doc = join(ROOT, "docs", "parishes.md");
ndCheck(existsSync(doc), "docs/parishes.md exists");
if (existsSync(doc)) {
  const text = readFileSync(doc, "utf8");
  for (const pid of ndParishes.keys()) ndCheck(text.includes(pid), `docs/parishes.md names ${pid}`);
  ndCheck(text.includes("orleans") && /Causeway/i.test(text), "docs/parishes.md names Orleans and the Causeway");
  for (const [, p] of ndParishes) for (const c of p.connectors ?? []) ndCheck(text.includes(c.id), `docs/parishes.md lists connector ${c.id}`);
}

// ------------------------------------------------------------ report
for (const n of ndNotes) console.log(`  note ${n}`);
const line = `check_parish_data: ${ndParishes.size} parishes, ${ndSites} sites, ${ndStationRefs} station references resolved, ${ndLandmarks} landmarks, ${ndConnectors} connectors, ${ndAnchors} anchors, ${ndLessons} field lessons, ${ndGated} gated items — ${ndPasses} checks pass, ${ndFailures} fail`;
console.log(line);
process.exit(ndFailures ? 1 : 0);
