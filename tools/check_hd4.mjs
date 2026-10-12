#!/usr/bin/env node
/**
 * ENV-HD-4 (console `hd4`, docs/consoles/ENV-HD-4.md): scenes inside and out, and an opt-in Ultra setting. Headless, no browser.
 *
 *   1. Ultra is off by default and offered only on the desktop high tier: never the phone tier, balanced, a headset browser or
 *      an XR session; `?ultra=` and the stored choice; the toggle is at least 44 px and hidden where Ultra is not offered.
 *   2. Ultra's stated budget, measured: the facade atlas at 2048 px leaves every site's meshes and triangles as they were; the
 *      near-camera detail per site and per room (meshes, triangles, draw calls) and the hero textures' bytes inside the budget.
 *   3. The phone and headset tiers are unchanged (rooms and site lights build exactly what they built before), and the high
 *      tier's texture bytes are unchanged with Ultra off; the high tier's added lighting stays inside IX_BUDGET.
 *   4. The six looks (dawn, day, dusk, night, fog, rain) over the app's own clock and weather, every robot site's wide shot
 *      under each (presets 0 -> 36), fog density, wetness and the site lighting policy per look, the site lights' switching.
 *   5. Lit robot rooms: panels, a pendant over every station pad, three beacons and one task spotlight in each of the six.
 *   6. The hive operations room: an INTERIORS style inside its budget on every tier, seven consoles, seven agent spots (one per
 *      role), the screens seam, walkable from the door, and its door beside the dispatcher's home site.
 *   7. The wiring: the app, the bundle, the scene handle's look argument, the checker list and its baseline row.
 *
 *     node tools/check_hd4.mjs
 */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const WEBXR = join(ROOT, "WebXR");
let failures = 0, passes = 0;
const check = (ok, msg, detail = "") => { if (ok) passes++; else { failures++; console.error(`  FAIL ${msg}${detail ? ` — ${detail}` : ""}`); } };
const note = (msg) => console.log(`  · ${msg}`);
const imp = (p) => import(pathToFileURL(join(WEBXR, p)).href);
const fmtB = (b) => `${(b / 1048576).toFixed(2)} MiB`;
const t0 = Date.now();

const THREE = await imp("vendor/three/dist/three.module.min.js");
const IX = await imp("shared/ix-interiors.js");
const IXR = await imp("shared/ixr-robo-interiors.js");
const HD2 = await imp("shared/hd2-room-skins.js");
const FX = await imp("shared/fx-exteriors.js");
const AT = await imp("shared/at-atmos.js");
const R = await imp("shared/np-parishes.js");
const NP = await imp("shared/np-parish.js");
const CW = await imp("shared/cw-cityworks.js");
const RBW = await imp("shared/rb-world.js");
const RB = await imp("shared/rb-robotics-data.js");
const U = await imp("shared/hd4-ultra.js");
const L = await imp("shared/hd4-looks.js");
const H = await imp("shared/hd4-rooms.js");
const appSrc = readFileSync(join(WEBXR, "parishes/js/app.js"), "utf8");
const DESK = "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36";
const QUEST = "Mozilla/5.0 (X11; Linux x86_64; Quest 3) AppleWebKit/537.36 (KHTML, like Gecko) OculusBrowser/33.0 Chrome/124.0 VR Safari/537.36";
const PICO = "Mozilla/5.0 (X11; Linux x86_64; PICO 4 Ultra Enterprise) AppleWebKit/537.36 Chrome/120 Safari/537.36";
const SHELL_SIGNS = IXR.IXR_SHELL_SIGNS.reduce((a, [w, h]) => a + Math.round(w * h * 4 * 4 / 3), 0);

console.log("ENV-HD-4: scenes inside and out, and an opt-in Ultra setting");

// ------------------------------------------------------------------------------------------------ 1. the Ultra setting
console.log("1. Ultra: off by default, desktop high only");
const desk = { ua: DESK, coarse: false, width: 1920, height: 1080, xr: false };
const cases = [
  ["desktop high", { tier: "high", ...desk }, true], ["desktop balanced", { tier: "balanced", ...desk }, false], ["desktop low", { tier: "low", ...desk }, false],
  ["phone 390x844 (coarse, low)", { tier: "low", ua: "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)", coarse: true, width: 390, height: 844 }, false],
  ["phone forced to high", { tier: "high", ua: "Mozilla/5.0 (Linux; Android 14; Pixel 8)", coarse: true, width: 412, height: 915 }, false],
  ["headset (OculusBrowser) on high", { tier: "high", ...desk, ua: QUEST }, false], ["headset (PICO) on high", { tier: "high", ...desk, ua: PICO }, false],
  ["inside an XR session", { tier: "high", ...desk, xr: true }, false], ["a small desktop window (560 px tall)", { tier: "high", ...desk, height: 560 }, false],
];
for (const [what, env, want] of cases) check(U.hd4UltraAllowed(env) === want, `Ultra ${want ? "offered" : "not offered"}: ${what}`);
const store = (v) => { const m = new Map(v ? [[U.HD4_ULTRA_KEY, v]] : []); return { getItem: (k) => m.get(k) ?? null, setItem: (k, x) => m.set(k, String(x)), removeItem: (k) => m.delete(k), m }; };
const choice = (o) => U.hd4UltraChoice({ tier: "high", search: "", storage: store(null), env: desk, ...o });
check(choice({}).on === false && choice({}).source === "default", "off by default on a desktop high tier (no URL, nothing stored)");
check(choice({ storage: store("on") }).on === true && choice({ storage: store("on") }).source === "chosen", "on when the viewer chose it (stored)");
check(choice({ search: "?ultra=1" }).on === true && choice({ search: "?ultra=1" }).source === "url", "?ultra=1 turns it on for one load");
check(choice({ search: "?ultra=0", storage: store("on") }).on === false, "?ultra=0 turns it off even when stored");
check(choice({ tier: "low", search: "?ultra=1", storage: store("on"), env: { ua: "iPhone", coarse: true, width: 390, height: 844 } }).on === false, "never on the phone tier, even with ?ultra=1 and a stored choice");
check(choice({ search: "?ultra=1", storage: store("on"), env: { ...desk, ua: QUEST } }).on === false, "never in a headset browser, even with ?ultra=1 and a stored choice");
check(choice({ tier: "balanced", storage: store("on") }).on === false, "never on balanced, even with a stored choice");
{ const s = store(null); check(U.hd4SetUltra(true, s) && s.m.get(U.HD4_ULTRA_KEY) === "on" && U.hd4SetUltra(false, s) && !s.m.has(U.HD4_ULTRA_KEY), "hd4SetUltra stores and clears the choice"); }
{
  // the toggle against a minimal document: hidden where not offered, 44 px, its label and aria-pressed follow the choice
  const el = () => ({ style: {}, attrs: {}, hidden: false, children: [], parentElement: null, listeners: {}, setAttribute(k, v) { this.attrs[k] = v; }, getAttribute(k) { return this.attrs[k] ?? null; }, addEventListener(t, f) { this.listeners[t] = f; }, appendChild(c) { c.parentElement = this; this.children.push(c); }, insertAdjacentElement(_p, c) { this.parentElement.appendChild(c); } });
  const doc = { createElement: () => el() };
  const host = el(), after = el(); host.appendChild(after);
  const on = U.hd4MountUltraToggle({ host, after, state: { on: false, allowed: true }, doc, onChange: () => {} });
  const off = U.hd4MountUltraToggle({ host: el(), state: { on: false, allowed: false }, doc });
  check(on && on.style.minHeight === "44px" && !on.hidden && on.textContent === "Ultra detail: off" && on.getAttribute("aria-pressed") === "false", "the Ultra toggle: 44 px min height, visible where offered, labelled off by default");
  check(off && off.hidden === true, "the Ultra toggle is hidden where Ultra is not offered (the phone tier never shows it)");
  const parishesHtml = readFileSync(join(WEBXR, "parishes/parishes.html"), "utf8");
  check(/\.ux-panel a\.btn,\.ux-panel button\{min-height:44px\}/.test(parishesHtml), "the Me tab's buttons are at least 44 px (parishes.html), the toggle among them");
}

// ------------------------------------------------------------------------------------------------ 2. Ultra's budget, measured
console.log("2. Ultra's stated budget, measured");
const B = U.HD4_ULTRA_BUDGET;
const mapsWithSites = R.NP_PARISHES.filter((p) => FX.fxSitesFor(p).length);
let siteN = 0, worstDetail = 0, sameFx = 0, sitesTotal = 0;
for (const p of mapsWithSites) {
  for (const l of FX.fxLayoutsFor(p)) {
    sitesTotal++;
    const a = FX.fxBuildSite(THREE, l, "high"), b = FX.fxBuildSite(THREE, l, "high", { atlasPx: B.facadeAtlasPx });
    if (a.userData.fx.meshes === b.userData.fx.meshes && a.userData.fx.triangles === b.userData.fx.triangles) sameFx++;
    const d = U.hd4UltraSiteDetail(THREE, l);
    worstDetail = Math.max(worstDetail, d.userData.hd4.triangles); siteN++;
    note(`${l.id} (${l.kind}): high ${a.userData.fx.meshes} meshes / ${a.userData.fx.triangles} tris; Ultra adds 1 mesh / ${d.userData.hd4.triangles} tris (railings, roof plant, ladder)`);
    a.dispose(); b.dispose(); d.geometry.dispose();
  }
}
check(sitesTotal === 6, `six robot sites built (${sitesTotal})`);
check(sameFx === sitesTotal, `the 2048 px facade atlas leaves every site's meshes and triangles as on high: ${sameFx} of ${sitesTotal}`);
check(worstDetail > 0 && worstDetail <= B.siteTrianglesAdded, `Ultra's near-camera detail per site: worst ${worstDetail} triangles <= ${B.siteTrianglesAdded}, 1 mesh (1 draw call) per site`);
const facadeBytes = U.hd4UltraTextureBytes("facade"), highFacade = Math.round(1024 * 1024 * 4 * 4 / 3 + 256 * 256 * 4 * 4 / 3);
check(facadeBytes <= B.facadeTextureBytes, `facade texture bytes per map: high ${fmtB(highFacade)} (FX_BUDGET ${fmtB(FX.FX_BUDGET.textureBytes.high)}) -> Ultra ${fmtB(facadeBytes)} <= ${fmtB(B.facadeTextureBytes)} (2048 atlas + 512 mask)`);
const reg = () => { const d = {}; return { d, ixRegisterDresser: (st, fn) => (d[st] ??= []).push(fn) }; };
const roomsWith = (opts) => { const r = reg(); IXR.ixrRegisterDressers(r); if (opts) H.hd4RegisterDressers(r, opts); HD2.hd2RegisterSkins(r); return r.d; };
const plain = roomsWith(null), lit = roomsWith({ ultra: false, ua: DESK }), ultra = roomsWith({ ultra: true, ua: DESK }), headset = roomsWith({ ultra: true, ua: QUEST });
const stats = (room) => { const m = IXR.ixrMeasure(room); let lights = 0; room.group.traverse((o) => { if (o.isLight) lights++; }); const signs = m.textures.some((t) => /sign|label|board/i.test(t.name)) ? 0 : SHELL_SIGNS; return { meshes: m.meshes, triangles: m.triangles, lights, bytes: m.textureBytes + signs, textures: m.textures }; };
const rbFor = (style) => RB.RB_SITES.find((s) => IXR.IXR_SITE_STYLE[s.id] === style) ?? null;
const siteFor = (style) => (style === H.HD4_OPS_STYLE ? H.hd4OpsSite(H.hd4OpsHome(), null) : IXR.ixrSiteFor(rbFor(style), null));
const build = (style, tier, dressers) => IX.ixBuild(style, { three: THREE, tier, site: siteFor(style), dressers });
const STYLES = Object.keys(IXR.IXR_ROOMS);
const ultraRows = [];
for (const st of STYLES) {
  const hi = stats(build(st, "high", lit)), u = build(st, "high", ultra), us = stats(u);
  const floor = u.group.getObjectByName("ix-floor")?.material?.map?.image?.width, wall = u.group.getObjectByName("ix-wall-0")?.material?.map?.image?.width;
  ultraRows.push([st, hi, us]);
  check(floor === B.roomHeroPx && wall === B.roomHeroPx, `${st}: Ultra draws the hero floor and walls at ${B.roomHeroPx} px (${floor} / ${wall})`);
  check(us.meshes - hi.meshes === B.roomMeshesAdded && us.triangles - hi.triangles <= B.roomTrianglesAdded, `${st}: Ultra adds ${us.meshes - hi.meshes} meshes (draw calls) and ${us.triangles - hi.triangles} triangles (trusses, cable trays) <= ${B.roomMeshesAdded} / ${B.roomTrianglesAdded}`);
  check(us.meshes <= B.roomMeshesTotal && us.triangles <= B.roomTrianglesTotal && us.lights <= B.roomLightsTotal && us.bytes <= B.roomTextureBytes, `${st}: Ultra room inside its budget: ${us.meshes} meshes <= ${B.roomMeshesTotal}, ${us.triangles} tris <= ${B.roomTrianglesTotal}, ${us.lights} lights <= ${B.roomLightsTotal}, ${fmtB(us.bytes)} <= ${fmtB(B.roomTextureBytes)}`);
}
console.log("  style               high: meshes  tris  lights  textures   |  Ultra: meshes  tris  lights  textures");
for (const [st, a, b] of ultraRows) console.log(`  ${st.padEnd(20)} ${String(a.meshes).padStart(12)} ${String(a.triangles).padStart(5)} ${String(a.lights).padStart(7)} ${fmtB(a.bytes).padStart(10)}   | ${String(b.meshes).padStart(13)} ${String(b.triangles).padStart(5)} ${String(b.lights).padStart(7)} ${fmtB(b.bytes).padStart(10)}`);

// ------------------------------------------------------------------------------------------------ 3. phone and headset unchanged
console.log("3. the phone and headset tiers unchanged; high's texture bytes unchanged with Ultra off");
let same = 0, total = 0, hiBytesSame = 0, hiLitOk = 0;
for (const st of STYLES) {
  for (const tier of ["low", "balanced"]) {
    total++;
    const a = stats(build(st, tier, plain)), b = stats(build(st, tier, ultra));
    if (a.meshes === b.meshes && a.triangles === b.triangles && a.lights === b.lights && a.bytes === b.bytes) same++;
    else check(false, `${st}/${tier}: unchanged`, `${a.meshes}/${a.triangles}/${a.lights}/${a.bytes} vs ${b.meshes}/${b.triangles}/${b.lights}/${b.bytes}`);
  }
  total++;
  const a = stats(build(st, "high", plain)), hs = stats(build(st, "high", headset)), h = stats(build(st, "high", lit));
  if (a.meshes === hs.meshes && a.triangles === hs.triangles && a.lights === hs.lights && a.bytes === hs.bytes) same++;
  else check(false, `${st}/headset: unchanged`, `${a.meshes}/${a.triangles}/${a.lights} vs ${hs.meshes}/${hs.triangles}/${hs.lights}`);
  if (a.bytes === h.bytes) hiBytesSame++;
  if (h.meshes - a.meshes === H.HD4_ROOM_LIGHT_BUDGET.meshesAdded.high && h.triangles - a.triangles <= H.HD4_ROOM_LIGHT_BUDGET.trianglesAdded.high && h.lights <= IX.IX_BUDGET.lights.high && h.meshes <= IX.IX_BUDGET.meshes && h.triangles <= IX.IX_BUDGET.triangles.high) hiLitOk++;
  note(`${st}: high ${a.meshes} -> ${h.meshes} meshes, ${a.triangles} -> ${h.triangles} tris, ${a.lights} -> ${h.lights} lights, ${fmtB(a.bytes)} -> ${fmtB(h.bytes)} (lighting); phone/balanced/headset identical`);
}
check(same === total, `robot rooms identical with the hd4 dressers on the phone tier, balanced and a headset browser (Ultra asked for): ${same} of ${total} builds`);
check(hiBytesSame === STYLES.length, `high tier texture bytes per room unchanged with Ultra off: ${hiBytesSame} of ${STYLES.length} (the lighting draws no texture)`);
check(hiLitOk === STYLES.length, `high tier lighting inside IX_BUDGET (meshes +${H.HD4_ROOM_LIGHT_BUDGET.meshesAdded.high}, triangles +<=${H.HD4_ROOM_LIGHT_BUDGET.trianglesAdded.high}, lights <= ${IX.IX_BUDGET.lights.high}): ${hiLitOk} of ${STYLES.length}`);
for (const tier of ["low", "balanced"]) {
  const p = mapsWithSites[0], sl = L.hd4MountSiteLights({ THREE, root: new THREE.Group(), layouts: FX.fxLayoutsFor(p), tier, ua: DESK });
  check(!sl.built && sl.counts().meshes === 0, `site lights on ${tier}: none built (0 meshes)`);
}
{ const sl = L.hd4MountSiteLights({ THREE, root: new THREE.Group(), layouts: FX.fxLayoutsFor(mapsWithSites[0]), tier: "high", ua: QUEST }); check(!sl.built, "site lights in a headset browser on high: none built"); }
check(/const px = tierKey === "high" && atlasPx \? atlasPx : null;/.test(readFileSync(join(WEBXR, "shared/fx-exteriors.js"), "utf8")), "fxMountExteriors draws the Ultra atlas on the high tier only (balanced and the phone keep 512 px / none)");

// ------------------------------------------------------------------------------------------------ 4. looks and presets
console.log("4. the six looks and the exterior presets");
const NP_TIMES = JSON.parse(appSrc.match(/const NP_TIMES = (\[[^\]]*\])/)[1]);
const NP_WEATHERS = JSON.parse(appSrc.match(/const NP_WEATHERS = (\[[^\]]*\])/)[1]);
check(L.HD4_LOOK_IDS.join(",") === "dawn,day,dusk,night,fog,rain", `six looks: ${L.HD4_LOOK_IDS.join(", ")}`);
check(NP_WEATHERS.indexOf("live") === 5 && NP_WEATHERS[NP_WEATHERS.length - 1] === "rain", `the app's weathers gain "rain" last (carried indices keep their meaning): ${NP_WEATHERS.join(", ")}`);
for (const id of L.HD4_LOOK_IDS) check(NP_TIMES.includes(L.HD4_LOOKS[id].time) && NP_WEATHERS.includes(L.HD4_LOOKS[id].weather), `${id}: time "${L.HD4_LOOKS[id].time}" and weather "${L.HD4_LOOKS[id].weather}" are the app's own`);
{ // sky.js imports three.js from its CDN URL, so it is read, not imported: a string band other than day/dusk/night falls to day,
  // and the hours 5–6 fall in the dusk (low-sun) band
  const sky = readFileSync(join(WEBXR, "shared/sky.js"), "utf8");
  check(/if \(typeof time === "string"\) return SKY_BANDS\.includes\(time\) \? time : "day";/.test(sky) && /\(h >= 5 && h < 6\)\) return "dusk"/.test(sky) && /time: NP_TIMES\[np\.timeIdx\] === "dawn" \? 5\.5 : NP_TIMES\[np\.timeIdx\]/.test(appSrc), "dawn draws the low-sun sky (sky.js maps the string \"dawn\" to day; the app passes the hour 5.5, the dusk band)"); }
const presets = L.hd4LookPresets(R.NP_PARISHES, FX.fxSitesFor);
check(presets.length === 36 && new Set(presets.map((p) => p.id)).size === 36, `exterior presets: 0 -> ${presets.length} (six robot sites x six looks, unique ids)`);
for (const s of new Set(presets.map((p) => p.siteId))) check(presets.filter((p) => p.siteId === s).length === 6, `${s}: six looks`);
console.log("  look     time   weather  fog far (m)  density  wet    rain on  site lights");
const lookRows = {};
for (const id of L.HD4_LOOK_IDS) {
  const lk = L.HD4_LOOKS[id], hour = AT.AT_BUCKET_HOUR[lk.time], w = AT.atWeatherOf(lk.weather, hour), f = AT.atFog({ weather: w, band: w.band, nearWater: 0 });
  const level = L.hd4LightLevel({ band: lk.time, weather: w });
  lookRows[id] = { f, w, level };
  console.log(`  ${id.padEnd(8)} ${lk.time.padEnd(6)} ${lk.weather.padEnd(8)} ${String(f.far).padStart(11)}  ${f.density.toFixed(3).padStart(7)}  ${String(w.wet).padEnd(5)}  ${String(w.rain > 0.3).padEnd(7)}  ${level}`);
}
check(lookRows.fog.f.density >= 0.7 && lookRows.day.f.density === 0, `fog density: fog ${lookRows.fog.f.density} (>= 0.7), clear day 0`);
{ const lf = L.hd4LookFog("fog", lookRows.fog.f), ld = L.hd4LookFog("day", lookRows.day.f); check(lf.far >= AT.AT_BOARD_READ * 3 && lf.far < lookRows.fog.f.far && ld.far === lookRows.day.f.far, `the fog look draws ATMOS's fog in to a ground fog at the site: far ${lookRows.fog.f.far} -> ${lf.far} m (floor ${AT.AT_BOARD_READ * 3} m, a board stays legible); clear looks keep ATMOS's fog`); }
check(lookRows.rain.w.wet >= 0.8 && lookRows.rain.w.rain > 0.3 && lookRows.night.w.wet === 0, `wet ground: rain ${lookRows.rain.w.wet} with TERRAFORM's rain on; clear looks dry`);
check(lookRows.night.level === 1 && lookRows.day.level === 0 && lookRows.dusk.level > 0.5 && lookRows.dawn.level > 0 && lookRows.fog.level > 0 && lookRows.rain.level > 0, "site lighting policy: night 1, day 0, dusk and dawn on, fog and rain on");
check(L.hd4LightLevel({ band: "day", weather: AT.atWeatherOf("fog", 12) }) === 0.45 && L.hd4LightLevel({ band: "day", weather: AT.atWeatherOf("storm", 12) }) === 0.45, "floodlights on by day in fog and storms (0.45)");
{
  const p = R.NP_PARISHES.find((x) => x.id === "oak-west-oakland") ?? mapsWithSites[0], layouts = FX.fxLayoutsFor(p);
  const glow = new THREE.MeshLambertMaterial({ emissive: 0 }), wetM = new THREE.MeshLambertMaterial();
  const sl = L.hd4MountSiteLights({ THREE, root: new THREE.Group(), layouts, tier: "high", ua: DESK, glow: [glow], wet: [wetM] });
  const c = sl.counts();
  check(sl.built && c.meshes === L.HD4_SITE_LIGHTS_BUDGET.meshesPerMap.high && c.lights === 0 && c.perSite <= L.HD4_SITE_LIGHTS_BUDGET.trianglesPerSite.high, `site lights on high (${p.id}, ${layouts.length} sites): ${c.meshes} meshes per map, ${c.triangles} triangles (${c.perSite} a site <= ${L.HD4_SITE_LIGHTS_BUDGET.trianglesPerSite.high}), ${c.masts} masts, ${c.docks} dock lamps, ${c.pools} light pools, 0 real lights`);
  note(`site lights on high (${p.id}, ${layouts.length} sites): ${c.meshes} meshes, ${c.triangles} triangles (${c.perSite} a site, budget ${L.HD4_SITE_LIGHTS_BUDGET.trianglesPerSite.high}), ${c.masts} masts, ${c.docks} dock lamps, ${c.flares} lamp glares, ${c.pools} light pools, 0 real lights, 0 texture bytes`);
  const night = sl.set({ band: "night", weather: AT.atWeatherOf("clear", 23) }), pools = sl.group.getObjectByName("hd4-site-pools");
  check(night.lit && pools.visible && glow.emissive.getHex() === 0xffcf8a && glow.emissiveIntensity > 0.9, "night: floodlights, dock lamps and pools on; window glow at full");
  const day = sl.set({ band: "day", weather: AT.atWeatherOf("clear", 12) });
  check(!day.lit && !pools.visible && glow.emissive.getHex() === 0, "day: lamps off, no pools, no window glow");
  const rain = sl.set({ band: "dusk", weather: AT.atWeatherOf("rain", 19) });
  check(rain.lit && rain.wet >= 0.8 && wetM.userData.hd4Wet?.uHd4Wet.value === rain.wet && /hd4-wet/.test(wetM.customProgramCacheKey()), `rain at dusk: lit, the facades' wet tint at ${rain.wet} (an up-facing material tweak, no texture)`);
  const dawn = sl.set({ band: "dawn", weather: AT.atWeatherOf("clear", 6.5) });
  check(dawn.lit && glow.emissiveIntensity < 0.8 && glow.emissiveIntensity > 0.3, `dawn: lamps on at ${dawn.level}, windows dimmer (${glow.emissiveIntensity.toFixed(2)})`);
  sl.dispose();
}

// ------------------------------------------------------------------------------------------------ 5. lit robot rooms
console.log("5. lit robot rooms");
let litRooms = 0;
for (const st of STYLES) {
  const room = build(st, "high", lit), Lr = room.hd4Lights, pads = room.actions.filter((a) => a.kind === "station").length;
  const spot = room.group.getObjectByName("hd4-task-spot");
  const ok = Lr && Lr.panels > 0 && Lr.pendants === pads && Lr.beacons === 3 && spot?.isSpotLight && room.group.getObjectByName("hd4-light-pools")?.count === pads;
  if (ok) litRooms++;
  check(!!ok, `${st}: ${Lr?.panels} light panels, ${Lr?.pendants} pendant task lights over ${pads} station pads (each with a floor pool), ${Lr?.beacons} warning beacons, 1 task spotlight`);
}
check(litRooms === 6, `robot rooms with lighting: 0 -> ${litRooms} of 6`);

// ------------------------------------------------------------------------------------------------ 6. the hive operations room
console.log("6. the hive operations room");
const OPS = H.HD4_OPS_STYLE;
check(!!IX.IX_STYLES[OPS] && (IX.IX_FEATURES[OPS] ?? []).length >= 2, `${OPS}: an INTERIORS style with signature fittings`);
check(HD2.HD2_SKIN_STYLES[OPS]?.set === "tile", `${OPS}: takes ENV-HD-2's tile set (floor and walls)`);
for (const tier of ["high", "balanced", "low"]) {
  const room = build(OPS, tier, lit), s = stats(room), Bo = H.HD4_OPS_BUDGET;
  check(s.meshes <= Bo.meshes[tier] && s.meshes <= IX.IX_BUDGET.meshes && s.triangles <= Bo.triangles[tier] && s.lights <= Bo.lights[tier] && s.bytes <= Bo.textureBytes[tier], `${OPS}/${tier}: ${s.meshes} meshes <= ${Bo.meshes[tier]}, ${s.triangles} tris <= ${Bo.triangles[tier]}, ${s.lights} lights <= ${Bo.lights[tier]}, ${fmtB(s.bytes)} <= ${fmtB(Bo.textureBytes[tier])}`);
  const ops = room.hd4Ops, roles = new Set(room.spots?.agent?.map((x) => x.role));
  check(ops?.consoles?.length === 7 && room.spots?.agent?.length === 7 && roles.size === 7 && H.HD4_OPS_ROLES.every((r) => roles.has(r)), `${OPS}/${tier}: seven consoles, seven agent spots, one per role`);
  const scr = H.hd4OpsScreens(room);
  check(scr && scr.cells.length === 7 && scr.wall && typeof scr.paint === "function" && typeof scr.repaint === "function", `${OPS}/${tier}: the screens seam (7 console cells on one canvas, the video wall, paint and repaint)`);
  const walk = IXR.ixrWalkAll(room);
  check(walk.reached === walk.total && walk.total >= 7, `${OPS}/${tier}: walkable from the door to every station pad and agent spot (${walk.reached} of ${walk.total})`);
  if (tier === "high") note(`${OPS}: ${s.meshes} meshes, ${s.triangles} tris, ${s.lights} lights, ${fmtB(s.bytes)}; consoles at ${ops.consoles.map((c) => `${c.key} (${c.x.toFixed(1)}, ${c.z.toFixed(1)})`).join(", ")}`);
}
{
  const home = H.hd4OpsHome(), p = R.NP_PARISHES.find((x) => x.id === home.parish);
  const sites = RBW.rbSitesFor(p);
  const blds = p.sites.map((_, i) => { try { return CW.cwSiteBuilding(p, i); } catch { return null; } }).filter(Boolean);
  const blocked = (x, z) => blds.some((b) => Math.abs(x - b.cx) < b.w / 2 + 0.6 && Math.abs(z - b.cz) < b.d / 2 + 0.6) || NP.npWaterAt(p, x, z);
  const doorAt = (id) => { const d = FX.fxDoorFor(p, id); return d?.out ? { x: d.out[0], z: d.out[1], face: d.face } : null; };
  const doors = IXR.ixrDoorsFor(p, { sites, blocked, doorAt });
  const spot = H.hd4OpsDoor({ doors, homeSite: home.id, blocked, colliders: FX.fxColliders(p) });
  const home3 = doors.find((d) => d.site?.id === home.id);
  check(!!spot && !blocked(spot.x, spot.z) && Math.hypot(spot.x - home3.x, spot.z - home3.z) >= 2.5, `the ops room's door on ${p.id}: beside ${home.id}'s room door (${spot ? Math.hypot(spot.x - home3.x, spot.z - home3.z).toFixed(1) : "?"} m along), dry, clear of buildings and the lots`);
}

// ------------------------------------------------------------------------------------------------ 7. wiring
console.log("7. wiring");
const bundle = readFileSync(join(ROOT, "tools/bundle_webxr.py"), "utf8");
check(['hd4-ultra.js', 'hd4-looks.js', 'hd4-rooms.js'].every((f) => appSrc.includes(`from "../../shared/${f}"`)), "the parishes app imports hd4-ultra.js, hd4-looks.js and hd4-rooms.js");
check(/"hd2-room-skins\.js",[\s\S]{0,400}"hd4-ultra\.js",\s*SHARED \/ "hd4-looks\.js",\s*SHARED \/ "hd4-rooms\.js"/.test(bundle), "the parishes bundle lists the three modules after hd2-room-skins.js");
check(/const fxSceneHandle = \(siteId, shot = "wide", look = null\)/.test(appSrc) && (appSrc.match(/\.\.\.hd4ApplyLook\(look\)/g) ?? []).length === 2, "__parishTest.scene takes a look (robot and non-robot presets)");
check(/const \[sid, shot, look\] = q\.split\(":"\)/.test(appSrc), "?scene=<siteId>:<shot>:<look> applies the look at boot");
check(/hd4Sites\?\.set\(\{ band: NP_TIMES\[np\.timeIdx\], weather: atWeatherNow \}\)/.test(appSrc), "the sky hook drives the site lights on every time or weather change (T, F, a look)");
check(/hd4RegisterDressers\(typeof ixRegisterDresser === "function"/.test(appSrc) && appSrc.indexOf("hd4RegisterDressers(") < appSrc.indexOf("hd2RegisterSkins(typeof"), "the room dressers are registered after ROBO-INTERIORS' and before ENV-HD-2's skins");
check(/hd4MountUltraToggle\(\{ host: \$\("ux-reduced"\)/.test(appSrc), "the Ultra toggle sits beside reduced motion in the Me tab");
check(/window\.__parishTest\.hd4 = \{/.test(appSrc) && /frameTime\(n = 12\)/.test(appSrc) && /opsRoom\(\)/.test(appSrc), "__parishTest.hd4: looks, presets, Ultra counts, ops room, measure, frameTime");
const all = readFileSync(join(ROOT, "tools/check_all.mjs"), "utf8"), base = JSON.parse(readFileSync(join(ROOT, "docs/perf/checkers-baseline.json"), "utf8"));
check(all.includes('"check_hd4.mjs"'), "check_all.mjs lists check_hd4.mjs");
check(Object.values(base).some((v) => typeof v === "object" && Number.isFinite(v?.["check_hd4.mjs"])) && Object.values(base).some((v) => typeof v === "object" && /ESTIMATE/.test(String(v?.["check_hd4.mjs"] ?? ""))), "docs/perf/checkers-baseline.json has an estimated row for check_hd4.mjs, labelled as an estimate");
const hd4Tops = new Map();
for (const f of ["hd4-ultra.js", "hd4-looks.js", "hd4-rooms.js"]) {
  const src = readFileSync(join(WEBXR, "shared", f), "utf8");
  for (const m of src.matchAll(/^(?:export\s+)?(?:const|let|var|function|class)\s+([A-Za-z_$][\w$]*)/gm)) hd4Tops.set(m[1], [...(hd4Tops.get(m[1]) ?? []), f]);
  check(!/fillText|strokeText/.test(src), `${f}: draws no words (no fillText)`);
  check(!/import\s*\{[^}]*\sas\s/.test(src), `${f}: no import aliases (the flat bundler strips imports)`);
  const tops = [...src.matchAll(/^(?:export\s+)?(?:const|let|var|function|class)\s+([A-Za-z_$][\w$]*)/gm)].map((m) => m[1]);
  check(tops.every((n) => /^(hd4|HD4_)/.test(n)), `${f}: every top-level name carries the hd4 prefix (${tops.length})`);
}
{ const dup = [...hd4Tops].filter(([, fs]) => fs.length > 1); check(dup.length === 0, `no top-level name is declared in two hd4 modules (the bundle shares one scope)`, dup.map(([n, fs]) => `${n}: ${fs.join(", ")}`).join("; ")); }

const ms = Date.now() - t0;
console.log(failures ? `\nENV-HD-4: ${failures} FAILED, ${passes} passed (${(ms / 1000).toFixed(1)} s).` : `\nENV-HD-4: all ${passes} checks pass (${(ms / 1000).toFixed(1)} s).`);
process.exit(failures ? 1 : 0);
