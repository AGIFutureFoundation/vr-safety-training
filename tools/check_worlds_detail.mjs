/**
 * World detail (console CARTOGRAPHER, tools/briefs/worlds-detail-brief.md):
 * layered maps, interactive assets, service liveries and avatar styles in
 * Bay World and the Deep.
 *
 *  1. Layers: both worlds declare the six layers (roads and transit, job
 *     sites by programme colour, landmarks, activities and eggs, interactive
 *     assets, wildlife), each yields features on the map, inside the canvas;
 *     the in-game maps render and toggle them; the Atlas's SVG fallback draws
 *     each layer and leaves one out when it is off.
 *  2. Interactive assets: at least 60 in Bay World and 20 in the Deep, every
 *     kind the brief names, unique ids, inside the world, reachable (never
 *     inside a job board's E radius, never on top of another asset), and every
 *     asset's link — built by shared/links.js's lkAssetLink — resolves: a
 *     station in the catalog, a programme in the curricula, a site in the
 *     world, a page on disk; both apps open the panel on E.
 *  3. Liveries: the traffic fleet covers every road service, the harbour
 *     fleets their own, names generic (tools/check_fleet.mjs builds each).
 *  4. Avatar styles: the style space is covered (bodies, a wide range of skin
 *     tones, hair and head coverings including hijab, turban and caps, trade
 *     PPE), every option builds under the figure's budget in combination with
 *     every other, no axis is tied to another and there is no gender axis,
 *     the style is stored per profile, the picker is on the account chip and
 *     both worlds dress the learner's own figure from it.
 *  5. Budgets: the worlds' asset builds are one instanced pair per kind, the
 *     shared builders stay inside their documented budgets.
 *
 *     node tools/check_worlds_detail.mjs
 */
import { readFileSync, existsSync } from "node:fs";
import { join, dirname, normalize } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { buildSuite } from "./lib/headless.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const WEBXR = join(ROOT, "WebXR");
const read = (rel) => readFileSync(join(ROOT, rel), "utf8");

// Headless modules read storage at import time in places; give them a stub.
const ctStub = () => { const m = new Map(); return { getItem: (k) => (m.has(k) ? m.get(k) : null), setItem: (k, v) => m.set(k, String(v)), removeItem: (k) => m.delete(k), clear: () => m.clear(), _m: m }; };
globalThis.localStorage ??= ctStub();
globalThis.sessionStorage ??= ctStub();
const imp = (rel) => import(pathToFileURL(join(WEBXR, rel)).href);

let failures = 0, passes = 0;
function check(ok, what) { if (ok) { passes += 1; return true; } failures += 1; console.log(`  ✗ ${what}`); return false; }
async function section(name, fn) {
  const before = failures;
  try { await fn(); } catch (err) { failures += 1; console.log(`  ✗ ${name} — threw ${err?.stack ?? err}`); }
  console.log(`${failures === before ? "✓" : "✗"} ${name}`);
}

const BAY = await imp("shared/bayworld-data.js");
const DEEP = await imp("shared/underwater-data.js");
const LK = await imp("shared/links.js");
const CREW = await imp("shared/crew.js");
const FLEET_SRC = read("WebXR/shared/fleet.js");
const catalog = JSON.parse(read("WebXR/smartcity/catalog.json"));
const CAT_STATIONS = new Set(catalog.stations.map((s) => s.id));
const CAT_PROGRAMMES = new Set(catalog.curricula.map((c) => c.id));
const LAYER_IDS = ["roads", "jobs", "landmarks", "activities", "assets", "wildlife"];
const counts = {};

// ------------------------------------------------------------------ 1. layers

await section("1. map layers are declared, carry features and are rendered in both worlds and the Atlas", async () => {
  for (const [world, layers] of [["Bay World", BAY.CT_BAY_LAYERS], ["the Deep", DEEP.CT_DEEP_LAYERS]]) {
    check(Array.isArray(layers) && LAYER_IDS.every((id) => layers.some((l) => l.id === id)), `${world}: declares the six layers ${LAYER_IDS.join(", ")}`);
    for (const l of layers ?? []) check(l.label && typeof l.colour === "number" && typeof l.on === "boolean", `${world}: layer ${l.id} has a label, a colour and a default`);
  }
  const MAP = await imp("bayworld/js/map.js");
  const { BW_QUESTS } = await imp("bayworld/js/quests-select.js");
  const quests = BW_QUESTS.map((q, i) => ({ id: q.id, title: q.title, site: q.site, kind: q.kind ?? "side", done: i % 3 === 0 }));
  const bw = MAP.ctBwMapLayers(512, { quests });
  const DMAP = await imp("underwater/js/dive-map.js");
  const { DV_DIVES } = await imp("underwater/js/dives-select.js");
  const { DV_ACTIVITIES } = await imp("underwater/js/dives.js");
  const eggs = DV_DIVES.filter((q) => q.kind === "egg");
  const dv = DMAP.ctDvMapLayers(512, { dives: eggs.slice(0, 1).map((e) => ({ id: e.id, done: true })), eggs, activities: DV_ACTIVITIES });
  for (const [world, L] of [["Bay World", bw], ["the Deep", dv]]) {
    for (const id of LAYER_IDS) {
      const feats = L[id] ?? [];
      check(feats.length > 0, `${world}: the ${id} layer has features on the map`);
      const pts = feats.flatMap((f) => f.points ?? [f]);
      check(pts.every((p) => p.x >= 0 && p.x <= 512 && p.y >= 0 && p.y <= 512), `${world}: every ${id} feature lands inside the 512 px map`);
      counts[`${world} ${id}`] = feats.length;
    }
    check(L.activities.some((f) => f.done) && L.activities.some((f) => !f.done), `${world}: the activities layer tells done from open`);
    check(new Set(L.jobs.map((f) => f.colour)).size >= 5, `${world}: job sites are coloured by programme (several colours)`);
  }
  check(bw.jobs.length === BAY.BAY_SITES.length && dv.jobs.length === DEEP.DEEP_SITES.length, "every site is on its world's jobs layer once");
  check(bw.assets.length === BAY.CT_BAY_ASSETS.length && dv.assets.length === DEEP.CT_DEEP_ASSETS.length, "every asset is on its world's assets layer once");
  // Toggle memory: a layer turned off stays off for the session (never written to storage).
  const st = ctStub();
  check(MAP.ctBwSetLayer("assets", true, st).assets === true && MAP.ctBwLayerState(st).assets === true && MAP.ctBwSetLayer("roads", false, st).roads === false, "Bay World: a toggled layer stays toggled for the session");
  check(DMAP.ctDvSetLayer("wildlife", true, st).wildlife === true && DMAP.ctDvLayerState(st).wildlife === true, "the Deep: a toggled layer stays toggled for the session");
  // The in-game maps render every layer through the toggles.
  for (const [world, app, html, draw, toggles, cfg] of [
    ["Bay World", "WebXR/bayworld/js/app.js", "WebXR/bayworld/index.html", "ctDrawLayers(ctx, size)", "ctRenderLayerToggles()", "CT_BAY_LAYERS"],
    ["the Deep", "WebXR/underwater/js/app.js", "WebXR/underwater/underwater.html", "ctDvDrawLayers(ctx, size)", "ctDvRenderLayerToggles()", "CT_DEEP_LAYERS"],
  ]) {
    const src = read(app), page = read(html);
    check(src.includes(draw) && src.includes(toggles) && src.includes(`for (const l of ${cfg})`), `${world}: the full map draws and toggles every layer`);
    check(page.includes('id="map-layers"'), `${world}: the map screen has the layer toggles`);
  }
  // The Atlas's SVG fallback: every layer drawn when on, left out when off.
  const ATLAS = await imp("bayworld/js/atlas.js");
  const all = ATLAS.atlasSvg({ layers: Object.fromEntries(LAYER_IDS.map((id) => [id, true])) });
  for (const id of LAYER_IDS) check(all.includes(`data-layer="${id}"`), `the Atlas draws the ${id} layer`);
  check((all.match(/data-asset="/g) ?? []).length === BAY.CT_BAY_ASSETS.length, "the Atlas marks every Bay World asset");
  const none = ATLAS.atlasSvg({ layers: { roads: false, landmarks: false, activities: false, assets: false, wildlife: false } });
  check(!none.includes('data-layer="assets"') && !none.includes('data-layer="roads"') && none.includes('data-site="'), "the Atlas leaves a layer out when it is off, and always keeps the sites");
  check(read("WebXR/bayworld/atlas.html").includes('id="atlas-layers"'), "the Atlas page has the layer toggles");
  // The built bundles carry it (python3 tools/bundle_webxr.py).
  for (const [page, needle] of [["WebXR/dist/bayworld.html", "ctBwMapLayers"], ["WebXR/dist/underwater.html", "ctDvMapLayers"], ["WebXR/dist/atlas.html", "atlas-layers"]]) {
    check(existsSync(join(ROOT, page)) && read(page).includes(needle), `${page} is built with the layers (run python3 tools/bundle_webxr.py)`);
  }
});

// ------------------------------------------------------ 2. interactive assets

/** Resolve an href relative to a world's folder in the repo layout. */
function ctResolves(href, worldDir) {
  const [path, query = ""] = href.split("?");
  const params = new URLSearchParams(query.split("#")[0]);
  const file = path ? normalize(join(WEBXR, worldDir, path)) : join(WEBXR, worldDir, worldDir === "bayworld" ? "index.html" : "underwater.html");
  if (!existsSync(file)) return `no file ${file.slice(ROOT.length + 1)}`;
  const sim = params.get("sim") ?? params.get("room");
  if (sim && !CAT_STATIONS.has(sim)) return `station ${sim} is not in the catalog`;
  const prog = params.get("programme");
  if (prog && !CAT_PROGRAMMES.has(prog)) return `programme ${prog} is not in the curricula`;
  const site = params.get("site");
  const sites = worldDir === "bayworld" ? BAY.BAY_SITES : DEEP.DEEP_SITES;
  if (site && !sites.some((s) => s.id === site)) return `site ${site} is not in the world`;
  if (path.includes("smartcity") && !(sim || prog)) return "a SmartCiti.X link names nothing to open";
  return null;
}

await section("2. interactive assets: counts, kinds, placement and every link resolves", async () => {
  for (const [world, dir, assets, kinds, min, sites, bounds, need] of [
    ["Bay World", "bayworld", BAY.CT_BAY_ASSETS, BAY.CT_BAY_ASSET_KINDS, 60, BAY.BAY_SITES, BAY.BAY_BOUNDS, ["kiosk", "bench", "notice-board", "tool-crib", "bus-stop", "dock-box"]],
    ["the Deep", "underwater", DEEP.CT_DEEP_ASSETS, DEEP.CT_DEEP_ASSET_KINDS, 20, DEEP.DEEP_SITES, DEEP.DEEP_BOUNDS, ["buoy", "dive-slate", "survey-marker", "tool-basket"]],
  ]) {
    check(assets.length >= min, `${world}: ${assets.length} interactive assets (at least ${min})`);
    counts[`${world} assets`] = assets.length;
    check(new Set(assets.map((a) => a.id)).size === assets.length, `${world}: asset ids are unique`);
    for (const k of need) check(assets.some((a) => a.kind === k), `${world}: has at least one ${k}`);
    let bad = 0, unreachable = 0, outside = 0, stacked = 0;
    for (const a of assets) {
      if (!kinds[a.kind]) { check(false, `${world}: ${a.id} has an unknown kind ${a.kind}`); continue; }
      const [x, z] = a.position;
      if (x < bounds.minX || x > bounds.maxX || z < bounds.minZ || z > bounds.maxZ) outside += 1;
      if (sites.some((s) => Math.hypot(s.position[0] - x, s.position[1] - z) <= 14)) unreachable += 1;
      if (assets.some((b) => b !== a && Math.hypot(b.position[0] - x, b.position[1] - z) < 6)) stacked += 1;
      let href = null;
      try { href = LK.lkAssetLink(a, { world: dir, page: dir === "bayworld" ? "../bayworld/index.html" : "../underwater/underwater.html" }); } catch (err) { href = null; }
      const why = href ? ctResolves(href, dir) : "lkAssetLink threw";
      if (why) { bad += 1; if (bad <= 5) check(false, `${world}: ${a.id} → ${href} — ${why}`); }
      if (href && a.link.type === "station" && !/[?&]from=/.test(href)) { bad += 1; check(false, `${world}: ${a.id} station link carries no ?from=`); }
      if (a.link.type !== kinds[a.kind].link && !(a.kind === "bench" && a.link.type === "site")) { bad += 1; check(false, `${world}: ${a.id} links a ${a.link.type}, its kind says ${kinds[a.kind].link}`); }
    }
    check(bad === 0, `${world}: every asset's link resolves through links.js (${assets.length - bad}/${assets.length})`);
    check(outside === 0, `${world}: every asset is inside the world (${outside} outside)`);
    check(unreachable === 0, `${world}: no asset sits inside a job board's 14 m E radius (${unreachable})`);
    check(stacked === 0, `${world}: no two assets share one 6 m prompt radius (${stacked})`);
  }
  check(/export function lkAssetLink\(/.test(read("WebXR/shared/links.js")), "links.js exports lkAssetLink");
  for (const [world, app, open] of [["Bay World", "WebXR/bayworld/js/app.js", "ctOpenAsset(bwApp.nearAsset)"], ["the Deep", "WebXR/underwater/js/app.js", "ctDvOpenAsset(dvApp.nearAsset)"]]) {
    const src = read(app);
    check(src.includes(open) && src.includes("lkAssetLink(asset"), `${world}: E at an asset opens its panel with the links.js link`);
  }
  for (const page of ["WebXR/bayworld/index.html", "WebXR/underwater/underwater.html"]) check(/id="scr-asset"[\s\S]*id="asset-link"/.test(read(page)), `${page}: has the asset panel and its link`);
});

// ---------------------------------------------------------------- 3. liveries

await section("3. service liveries cover the traffic and harbour fleets with generic names", async () => {
  const suite = await buildSuite(["shared/kit.js", "shared/textures.js", "shared/perf.js", "shared/fleet.js"],
    "export { CT_SERVICE_LIVERIES, CT_TRAFFIC_SERVICES, CT_TRAFFIC_FLEET, CT_HARBOUR_FLEET, FLEET_BUILDERS };", "ct-fleet");
  for (const svc of ["transit", "utility", "delivery", "emergency", "construction", "port"]) {
    check(suite.CT_TRAFFIC_FLEET.some((e) => e.service === svc), `traffic runs a ${svc} vehicle in its livery`);
  }
  for (const e of [...suite.CT_TRAFFIC_FLEET, ...suite.CT_HARBOUR_FLEET]) check(typeof suite.FLEET_BUILDERS[e.builder] === "function", `fleet entry ${e.id ?? e.builder} names a kit builder`);
  const deep = suite.CT_HARBOUR_FLEET.filter((e) => e.world === "underwater");
  check(deep.some((e) => e.builder === "workboat") && deep.some((e) => e.builder === "rov") && deep.some((e) => e.service === "survey" && e.builder !== "rov"), "the Deep's workboats, survey vessel and ROV are liveried");
  const brands = /\b(ups|fedex|dhl|usps|amazon|bart|muni|ac transit|pg&e|caltrans|maersk|matson|uber|lyft)\b/i;
  check(Object.values(suite.CT_SERVICE_LIVERIES).every((l) => !brands.test(l.fleetName)), "no livery carries a real operator or brand");
  check(read("tools/check_fleet.mjs").includes("livery coverage"), "check_fleet.mjs gates livery coverage");
  check(/ctBuildLiveried\(root, entry/.test(read("WebXR/bayworld/js/world.js")) && /ctBuildLiveried\(root, h/.test(read("WebXR/bayworld/js/world.js")), "Bay World's traffic and harbour boats wear their service liveries");
  counts.liveries = Object.keys(suite.CT_SERVICE_LIVERIES).length;
  void FLEET_SRC;
});

// ----------------------------------------------------------- 4. avatar styles

await section("4. the avatar style space is covered, respectful, stored per profile and used by both worlds", async () => {
  const S = CREW.CT_AVATAR_STYLES;
  check(S.body.length >= 5, `bodies: ${S.body.length} proportions (at least 5)`);
  check(S.skin.length >= 10, `skin tones: ${S.skin.length} (at least 10)`);
  const lum = S.skin.map((o) => { const r = (o.hex >> 16) & 255, g = (o.hex >> 8) & 255, b = o.hex & 255; return 0.2126 * r + 0.7152 * g + 0.0722 * b; });
  check(Math.max(...lum) - Math.min(...lum) > 150, "skin tones span very light to very deep");
  for (const id of ["hijab", "turban", "cap", "headwrap", "patka", "kippah", "braids", "locs", "coily", "shaved"]) check(S.hair.some((o) => o.id === id), `hair and head coverings include ${id}`);
  for (const id of ["hard-hat-hivis", "electrical", "dive", "chef", "scrubs", "flight-crew", "marine"]) check(S.ppe.some((o) => o.id === id), `trade PPE includes ${id}`);
  check(S.hardHat.length >= 5, `hard hat colours: ${S.hardHat.length}`);
  check(!Object.keys(S).some((k) => /gender|sex|male|female/i.test(k)), "there is no gender axis");
  // No option on one axis names or depends on another axis.
  const axes = new Set(Object.keys(S));
  check(Object.values(S).every((opts) => opts.every((o) => Object.keys(o).every((k) => !axes.has(k)))), "no option on one axis is tied to an option on another");
  check(CREW.CT_AVATAR_AXES.every((a) => axes.has(a)) && CREW.CT_AVATAR_AXES.length === axes.size, "the picker shows every axis");
  // Every option on every axis builds, in combination (ppe × hair × body, every skin tone), under budget.
  const suite = await buildSuite(["shared/crew.js"], "export { ctAvatarFigure, THREE };", "ct-crew");
  let built = 0, over = 0, maxMeshes = 0;
  const meshesOf = (g) => { let n = 0; g.traverse((o) => { if (o.isMesh) n += 1; }); return n; };
  for (const ppe of S.ppe) for (const hair of S.hair) for (const body of S.body) {
    const g = suite.ctAvatarFigure(suite.THREE, { ppe: ppe.id, hair: hair.id, body: body.id, skin: S.skin[built % S.skin.length].id, hardHat: S.hardHat[built % S.hardHat.length].id, hairColour: S.hairColour[built % S.hairColour.length].id });
    const n = meshesOf(g); maxMeshes = Math.max(maxMeshes, n); if (n > CREW.CT_AVATAR_BUDGET) over += 1;
    if (!g.userData.parts.head || !g.userData.parts.torso) over += 1;
    built += 1;
  }
  check(over === 0, `all ${built} ppe × hair × body figures build with a head and torso inside ${CREW.CT_AVATAR_BUDGET} meshes (max ${maxMeshes})`);
  counts.avatarCombos = built; counts.avatarMaxMeshes = maxMeshes;
  const hijabHat = suite.ctAvatarFigure(suite.THREE, { hair: "hijab", ppe: "hard-hat-hivis" });
  check(hijabHat.userData.parts.hardHat && hijabHat.userData.parts.headwear, "a hard hat goes over a hijab (and every covering)");
  // A crowd spreads every trade across looks.
  const crowd = Array.from({ length: 216 }, (_, i) => CREW.ctAvatarVariety(i));
  for (const p of S.ppe) {
    const mine = crowd.filter((c) => c.ppe === p.id);
    const skins = new Set(mine.map((c) => c.skin)).size, bodies = new Set(mine.map((c) => c.body)).size, hairs = new Set(mine.map((c) => c.hair)).size;
    check(skins >= 4 && bodies >= 3 && hairs >= 4, `${p.label}: worn across ${skins} skin tones, ${bodies} bodies, ${hairs} hair styles in a crowd`);
  }
  for (const axis of CREW.CT_AVATAR_AXES) check(new Set(crowd.map((c) => c[axis])).size === S[axis].length, `a crowd shows every ${axis} option`);
  // Stored per profile.
  const P = await imp("shared/profiles.js");
  check(P.GT_PROFILE_KEYS.includes(CREW.CT_AVATAR_KEY), "the avatar key is one of profiles.js's profile-private stores");
  check(P.gtKeyFor(CREW.CT_AVATAR_KEY, { kind: "account", ns: "id-a" }) !== P.gtKeyFor(CREW.CT_AVATAR_KEY, { kind: "account", ns: "id-b" }), "two signed-in people keep two avatars");
  const st = ctStub();
  CREW.ctAvatarSave({ body: "tall", skin: "tone-11", hair: "turban", ppe: "chef", hardHat: "blue", hairColour: "navy" }, st);
  const back = CREW.ctAvatarLoad(st);
  check(back.hair === "turban" && back.skin === "tone-11" && back.ppe === "chef", "a saved style loads back");
  check(CREW.ctAvatarNormalize({ skin: "nope", hair: "hijab" }).hair === "hijab" && CREW.ctAvatarNormalize({ skin: "nope" }).skin === CREW.CT_AVATAR_DEFAULT.skin, "an unknown option falls back on its own axis only");
  // The picker on the account chip, and both worlds dress the learner's figure from it.
  const acct = read("WebXR/shared/account.js");
  check(/function ctAvatarView\(/.test(acct) && acct.includes('id: "ct-av-save"') && acct.includes("ctAvatarSave(style, gtStorage())") && acct.includes("ctAvatarSwatch(), text"), "the account chip shows the avatar and its dialog saves the picker per profile");
  check(/ctAvatarLoad\(gtStorage\(\)\)/.test(read("WebXR/bayworld/js/app.js")) && /bwSetAvatar/.test(read("WebXR/bayworld/js/world.js")), "Bay World dresses the learner's figure from the profile");
  check(/ctAvatarLoad\(gtStorage\(\)\)/.test(read("WebXR/underwater/js/app.js")) && /ppe: "dive"/.test(read("WebXR/underwater/js/world.js")), "the Deep dresses the learner's diver from the profile, in dive gear");
  check(/SHARED \/ "crew\.js"/.test(read("tools/bundle_webxr.py")) && read("WebXR/dist/bayworld.html").includes("ctAvatarFigure"), "the bundles carry the style space before the account chip");
});

// ------------------------------------------------------------------ 5. budgets

await section("5. budgets: one instanced pair per asset kind, shared builders inside their budgets", async () => {
  const bare = () => ({ children: [], add(...cs) { this.children.push(...cs); }, remove() {}, traverse(fn) { fn(this); for (const c of this.children) if (c.traverse) c.traverse(fn); } });
  const B = await buildSuite([
    "shared/kit.js", "shared/textures.js", "shared/perf.js", "shared/fleet.js", "shared/props.js", "shared/weather.js", "shared/sky.js", "shared/wildlife.js",
    "shared/crew.js", "smartcity/js/citykit.js", "shared/bayworld-data.js", "shared/bayworld.js", "shared/bay-geo.js", "shared/mapbox.js",
    "bayworld/js/city.js", "bayworld/js/sim.js", "bayworld/js/world.js",
  ], "export { bwBuildWorld, THREE };", "ct-bw");
  const w = B.bwBuildWorld(bare(), B.THREE, { detail: "high" });
  const bwKinds = Object.keys(BAY.CT_BAY_ASSET_KINDS).length;
  check(w.ctAssetMeshes.length <= bwKinds * 2 && w.ctAssetMeshes.every((m) => m.isInstancedMesh), `Bay World: ${BAY.CT_BAY_ASSETS.length} assets in ${w.ctAssetMeshes.length} instanced meshes (≤ ${bwKinds * 2})`);
  check(w.ctAssetMeshes.reduce((n, m) => n + m.count, 0) === BAY.CT_BAY_ASSETS.length * 2, "Bay World: every asset is instanced, body and top");
  check(w.harbour.length === 4 && w.harbour.every((h) => h.userData.ctService), "Bay World: the harbour fleet is built in its liveries");
  const D = await buildSuite([
    "shared/kit.js", "shared/textures.js", "shared/perf.js", "shared/fleet.js", "shared/props.js", "smartcity/js/citykit.js", "shared/crew.js",
    "shared/underwater-data.js", "shared/underwater.js", "underwater/js/seabed.js", "underwater/js/dive-sim.js", "underwater/js/world.js",
  ], "export { dvBuildWorld, THREE };", "ct-dv");
  const d = D.dvBuildWorld(bare(), D.THREE, { detail: "high" });
  const dvKinds = Object.keys(DEEP.CT_DEEP_ASSET_KINDS).length;
  check(d.ctAssetMeshes.length <= dvKinds * 2 && d.ctAssetMeshes.every((m) => m.isInstancedMesh), `the Deep: ${DEEP.CT_DEEP_ASSETS.length} assets in ${d.ctAssetMeshes.length} instanced meshes (≤ ${dvKinds * 2})`);
  check(d.harbour.length === 3 && d.rov.userData.ctService === "survey", "the Deep: workboats, survey skiff and ROV are built in their liveries");
  check(BAY.BAY_MESH_BUDGET.high === 3600 && DEEP.DEEP_MESH_BUDGET.high === 1400, "the documented world budgets are unchanged (check_bayworld and check_underwater measure them)");
  counts.bwAssetMeshes = w.ctAssetMeshes.length; counts.dvAssetMeshes = d.ctAssetMeshes.length;
});

check(read("tools/check_all.mjs").includes('"check_worlds_detail.mjs"'), "check_all.mjs runs this checker");

if (failures) {
  console.log(`\n${failures} world-detail check(s) failed.`);
  process.exit(1);
}
console.log(`\nWorld detail: 6 layers in each world and the Atlas; ${counts["Bay World assets"]} Bay World and ${counts["the Deep assets"]} Deep assets, every link resolving; ${counts.liveries} service liveries over the traffic and harbour fleets; ${counts.avatarCombos} avatar combinations inside ${CREW.CT_AVATAR_BUDGET} meshes; assets in ${counts.bwAssetMeshes} + ${counts.dvAssetMeshes} instanced meshes (${passes} checks).`);
