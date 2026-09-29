/**
 * GEO (docs/geo.md): live geolocation and satellite imagery, checked headlessly.
 *
 *     node tools/check_geo.mjs
 *
 * What is proved here:
 *  1. **No call without a gesture.** geoFindMe() with no event, or an untrusted one, never touches
 *     getCurrentPosition; nothing on import or mount calls it; watchPosition appears nowhere in the pages.
 *  2. **Memory only.** A full Find me run (mount, trusted press, result, Forget) against stub storage writes
 *     nothing to localStorage, sessionStorage, IndexedDB or cookies, and logs nothing.
 *  3. **Never sent.** During that run no fetch, XMLHttpRequest, sendBeacon or image request happens, and no URL
 *     anywhere carries the coordinates; geo-locate.js contains no network or logging call.
 *  4. **Who may use it.** Off in a demo and signed out; in a K-12 class session off by default (DEAN's cleaned
 *     version has geolocation false) and on only when the teacher's version sets it true.
 *  5. **Nearest-map arithmetic.** Inside a box: that map, 0 m, and a pin that round-trips through np-geo.js;
 *     outside: the haversine distance to the clamped box point, checked against an independent formula.
 *  6. **The live layer asks nothing until switched on**, then only the GEO_LIVE hosts, at most 16 tiles.
 *  7. **The baked backdrops**: every Louisiana map has <map>.jpg (512 px, quality <= 80, <= 90 KB) and a sidecar
 *     with scenes, date, cloud cover and the credit; the total stays inside the stated budget; the credit is on
 *     the page next to the image; the satellite ground is off by default; the bundler lists the module.
 */
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const WEBXR = join(ROOT, "WebXR"), SHARED = join(WEBXR, "shared"), GEO_DIR = join(WEBXR, "assets", "geo");
const LA_REGIONS = ["louisiana-sites", "louisiana-cities", "new-orleans-districts"];
const BUDGET_KB = 1600; // all baked backdrops together (17 Louisiana maps at <= 90 KB each fit with room)
const realLog = console.log;
let pass = 0, fail = 0;
const check = (ok, what) => { if (ok) pass++; else { fail++; realLog(`FAIL ${what}`); } };

// ------------------------------------------------------------------ stubs: storage, network, logging
const writes = [], requests = [], logs = [];
const store = (name) => ({ getItem: () => null, setItem: (k) => writes.push(`${name}.setItem ${k}`), removeItem: (k) => writes.push(`${name}.removeItem ${k}`), clear: () => writes.push(`${name}.clear`), key: () => null, length: 0 });
globalThis.localStorage = store("localStorage");
globalThis.sessionStorage = store("sessionStorage");
globalThis.indexedDB = { open: () => { writes.push("indexedDB.open"); return {}; } };
globalThis.fetch = (u) => { requests.push(`fetch ${u}`); return Promise.reject(new Error("offline")); };
globalThis.XMLHttpRequest = class { open(m, u) { requests.push(`xhr ${u}`); } send() {} };
let geoCalls = 0, watchCalls = 0;
const HERE = { lon: -91.884, lat: 30.038 }; // inside the New Iberia airport map's box
const geolocation = { getCurrentPosition: (ok) => { geoCalls++; ok({ coords: { longitude: HERE.lon, latitude: HERE.lat } }); }, watchPosition: () => { watchCalls++; } };
Object.defineProperty(globalThis, "navigator", { value: { geolocation, sendBeacon: (u) => { requests.push(`beacon ${u}`); return true; }, webdriver: true }, configurable: true });
let cookieWrites = 0;
globalThis.document = { get cookie() { return ""; }, set cookie(v) { cookieWrites++; } };
class StubImg { set src(u) { requests.push(`img ${u}`); this._src = u; setTimeout(() => this.onerror?.(), 0); } get src() { return this._src; } }
globalThis.Image = StubImg;
for (const k of ["log", "info", "warn", "error", "debug"]) console[k] = (...a) => logs.push(a.join(" "));

// A minimal DOM: enough for geoMountFindMe and geoMountLive.
class El {
  constructor(tag, doc) { this.tagName = tag.toUpperCase(); this.ownerDocument = doc; this.children = []; this._text = ""; this.attrs = {}; this.dataset = {}; this.style = {}; this.hidden = false; this.disabled = false; this.listeners = {}; }
  append(...n) { for (const c of n) this.children.push(c); } appendChild(c) { this.children.push(c); return c; }
  set textContent(t) { this._text = String(t); this.children = []; } get textContent() { return this._text + this.children.map((c) => c.textContent ?? c.data ?? "").join(""); }
  setAttribute(k, v) { this.attrs[k] = String(v); } getAttribute(k) { return this.attrs[k] ?? null; }
  addEventListener(t, f) { (this.listeners[t] ??= []).push(f); }
  async fire(t, ev) { for (const f of this.listeners[t] ?? []) await f(ev); }
  set src(u) { requests.push(`img ${u}`); this._src = u; } get src() { return this._src; }
  all() { return [this, ...this.children.flatMap((c) => (c.all ? c.all() : []))]; }
}
const doc = { createElement: (t) => new El(t, doc), createTextNode: (d) => ({ data: d, textContent: d }) };
const newEl = () => new El("div", doc);

const G = await import("../WebXR/shared/geo-locate.js");
const { NP_PARISHES, npParish } = await import("../WebXR/shared/np-parishes.js");
const { npBounds, npGeoToXz, npToGeo } = await import("../WebXR/shared/np-geo.js");
const { dnCleanVersion } = await import("../WebXR/shared/dn-modules.js");
const ACCOUNT = { kind: "account" }, OK = { ok: true };

// ------------------------------------------------------------------ 1. no call without a gesture
check(geoCalls === 0, "importing geo-locate.js asks for no position");
for (const ev of [null, undefined, {}, { isTrusted: false }, { type: "click" }]) {
  const r = await G.geoFindMe(ev, { geolocation, allowed: OK });
  check(!r.ok && geoCalls === 0, `no position without a trusted gesture (${JSON.stringify(ev)})`);
}
const denied = await G.geoFindMe({ isTrusted: true }, { geolocation, allowed: { ok: false, reason: "no" } });
check(!denied.ok && geoCalls === 0, "a trusted press in a session that may not use it asks for nothing");
const el = newEl();
const iberia = npParish("la-avex-new-iberia");
let heard = null;
const ui = G.geoMountFindMe({ el, maps: NP_PARISHES, current: iberia, allowed: () => G.geoAllowed({ profile: ACCOUNT }), onHere: (r) => { heard = r; }, geolocation });
check(geoCalls === 0 && ui.button.textContent === "Find me" && !ui.button.disabled, "mounting the button asks for nothing; the button is live for a signed-in learner");
await ui.button.fire("click", { isTrusted: false });
check(geoCalls === 0, "a scripted (untrusted) click asks for nothing");
await ui.button.fire("click", { isTrusted: true });
check(geoCalls === 1, "one trusted press asks exactly once");
check(watchCalls === 0, "watchPosition is never used");
check(heard?.pin && Array.isArray(heard.pin), "inside the map's box the page gets a pin");
check(/inside this map/.test(ui.line.textContent), "the status says you are inside this map");
check(G.geoHere()?.[0] === HERE.lon, "the position is held in memory");
await ui.forget.fire("click", { isTrusted: true });
check(G.geoHere() === null && heard === null, "Forget drops the position and the pin");
// A second map: outside its box the nearest map is named and linked.
const el2 = newEl();
const ui2 = G.geoMountFindMe({ el: el2, maps: NP_PARISHES, current: npParish("orleans"), allowed: () => OK, geolocation });
await ui2.button.fire("click", { isTrusted: true });
check(geoCalls === 2 && /Nearest map/.test(ui2.line.textContent) && ui2.line.children.some((c) => c.tagName === "A" && c.href === "?parish=la-avex-new-iberia"), "outside this map the nearest map is named and linked");
G.geoForget();

// ------------------------------------------------------------------ 2 + 3. memory only, never sent, never logged
check(writes.length === 0, `no storage write during Find me (${writes.join(", ") || "none"})`);
check(cookieWrites === 0, "no cookie written");
check(requests.length === 0, `no network request during Find me (${requests.join(", ") || "none"})`);
check(logs.length === 0, "nothing logged during Find me");
const src = readFileSync(join(SHARED, "geo-locate.js"), "utf8");
const code = src.replace(/\/\/.*$/gm, "").replace(/\/\*[\s\S]*?\*\//g, "");
check(!/\bfetch\s*\(|XMLHttpRequest|sendBeacon|WebSocket|EventSource/.test(code), "geo-locate.js has no fetch, XHR, beacon or socket");
check(!/localStorage|sessionStorage|indexedDB|document\.cookie/.test(code), "geo-locate.js touches no storage");
check(!/console\./.test(code), "geo-locate.js logs nothing");
check(!/watchPosition/.test(code), "geo-locate.js never watches the position");
check((code.match(/getCurrentPosition\(/g) ?? []).length === 1, "getCurrentPosition is called in exactly one place (geoFindMe)");
check(/event\.isTrusted !== true/.test(code), "geoFindMe refuses an untrusted event");
const PAGE_SRC = ["parishes/js/app.js", "parishes/parishes.html"].map((p) => readFileSync(join(WEBXR, p), "utf8"));
const strip = (t) => t.replace(/\/\*[\s\S]*?\*\//g, "").replace(/(^|[^:"'`])\/\/.*$/gm, "$1");
const allShared = readdirSync(SHARED).filter((f) => f.endsWith(".js")).map((f) => ({ f, t: strip(readFileSync(join(SHARED, f), "utf8")) }));
check(![...PAGE_SRC.map(strip), ...allShared.map((x) => x.t)].some((t) => /watchPosition/.test(t)), "no page or shared module watches the position");
const askers = allShared.filter((x) => /getCurrentPosition/.test(x.t)).map((x) => x.f);
check(askers.length === 1 && askers[0] === "geo-locate.js" && !/getCurrentPosition/.test(strip(PAGE_SRC[0])), `only geo-locate.js asks for a position (${askers.join(", ")})`);
check(!/geoHere\(\)[\s\S]{0,80}(fetch|href|src|setItem|console)/.test(PAGE_SRC[0]), "the app never sends, links, stores or logs the position");

// ------------------------------------------------------------------ 4. who may use it
check(!G.geoAllowed({ profile: { kind: "demo" } }).ok, "off in a demo session");
check(!G.geoAllowed({ profile: ACCOUNT, demo: true }).ok, "off with ?demo");
check(!G.geoAllowed({ profile: { kind: "device" } }).ok && !G.geoAllowed({}).ok, "off signed out");
check(G.geoAllowed({ profile: ACCOUNT }).ok, "on for a signed-in learner outside a class session (still only on a press)");
const cleaned = dnCleanVersion({ name: "Period 3", scope: { kind: "class", id: "ABCD1234" } });
check(cleaned.geolocation === false, "DEAN's cleaned version has geolocation off by default");
check(G.geoIsK12({ version: cleaned }) && G.geoIsK12({ search: "?k12=1" }) && G.geoIsK12({ path: "k12" }) && !G.geoIsK12({}), "a K-12 class session is recognised (class version, ?k12=1, the K-12 path)");
check(!G.geoAllowed({ profile: ACCOUNT, k12: true, version: cleaned }).ok, "off in a K-12 class session by default");
check(!G.geoAllowed({ profile: ACCOUNT, k12: true, version: null }).ok, "off in a K-12 session with no version");
const teacherOn = dnCleanVersion({ ...cleaned, geolocation: true });
check(teacherOn.geolocation === true && G.geoAllowed({ profile: ACCOUNT, k12: true, version: teacherOn }).ok, "on in a class session only when the teacher's version turns it on");
check(dnCleanVersion({ geolocation: "yes" }).geolocation === false, "only a literal true turns it on");
check(!G.geoAllowed({ profile: { kind: "demo" }, k12: true, version: teacherOn }).ok, "the teacher's switch never opens a demo session");
const app = PAGE_SRC[0];
check(/geoAllowed\(\{ profile: gtProfile\(\), k12: geoIsK12\(/.test(app) && /npParams\.has\("demo"\)/.test(app), "the app gates Find me on the profile, the K-12 session and ?demo");

// ------------------------------------------------------------------ 5. nearest-map arithmetic
const R = 6371008.8, rad = Math.PI / 180;
const hav = ([a, b], [c, d]) => 2 * R * Math.asin(Math.sqrt(Math.sin((d - b) * rad / 2) ** 2 + Math.cos(b * rad) * Math.cos(d * rad) * Math.sin((c - a) * rad / 2) ** 2));
const real = NP_PARISHES.filter((m) => m.region !== "programmes");
let insideOk = 0, outsideOk = 0;
for (const m of real) {
  const c = npToGeo(m, [0, 0]);
  const n = G.geoNearest(real, c);
  if (n.inside && n.metres === 0 && G.geoRank(real, c).filter((r) => r.inside).some((r) => r.map.id === m.id)) insideOk++;
  const pin = G.geoPinOn(m, c);
  if (!pin || Math.hypot(pin[0], pin[1]) > 1e-3) insideOk -= 100;
}
check(insideOk === real.length, `every map's centre is inside it (0 m) and pins at the origin (${insideOk}/${real.length})`);
for (const m of real) {
  const b = npBounds(m);
  const p = [b.maxLon + 0.5, (b.minLat + b.maxLat) / 2]; // due east of the box
  const r = G.geoRank([m], p)[0];
  const want = hav(p, [b.maxLon, p[1]]);
  if (!r.inside && Math.abs(r.metres - want) < 1 && G.geoPinOn(m, p) === null) outsideOk++;
}
check(outsideOk === real.length, `outside a box the distance is the haversine to the clamped point, and there is no pin (${outsideOk}/${real.length})`);
{
  const b = npBounds(iberia), p = [b.minLon - 0.1, b.minLat - 0.1];
  check(Math.abs(G.geoRank([iberia], p)[0].metres - hav(p, [b.minLon, b.minLat])) < 1, "off a corner the distance is to the corner");
  const q = [-91.884, 30.038], [x, z] = G.geoPinOn(iberia, q), back = npToGeo(iberia, [x, z]);
  check(Math.abs(back[0] - q[0]) < 1e-9 && Math.abs(back[1] - q[1]) < 1e-9, "the pin round-trips through np-geo.js");
  const ny = G.geoNearest(real, [-74.006, 40.713]);
  check(ny && !ny.inside && ny.metres > 1e6 && ny.region, "far away: the nearest map and its region, with the distance");
  check(!G.geoRank(NP_PARISHES, [0, 0]).some((r) => r.map.region === "programmes"), "a map without real anchors is never offered as nearest");
  check(G.geoDistanceText(0) === "you are inside it" && G.geoDistanceText(450) === "450 m away" && G.geoDistanceText(12400) === "12 km away", "distances read plainly");
}

// ------------------------------------------------------------------ 6. the live layer
requests.length = 0;
const liveEl = newEl();
const live = G.geoMountLive({ el: liveEl, map: iberia });
check(requests.length === 0 && live.shown() === null, "the live layer is off by default and requests nothing on mount");
const hosts = Object.values(G.GEO_LIVE).map((s) => new URL(s.tile.replace(/\{\w+\}/g, "0")).host);
check(hosts.length === 2 && hosts.includes("basemap.nationalmap.gov") && hosts.includes("gibs.earthdata.nasa.gov"), "the URLs live in one constant block: USGS National Map and NASA GIBS");
live.show("usgs");
const liveReq = requests.slice();
check(liveReq.length > 0 && liveReq.length <= 16 && liveReq.every((u) => u.startsWith("img https://basemap.nationalmap.gov/")), `switched on: only USGS tiles, at most 16 (${liveReq.length})`);
requests.length = 0; live.show("gibs");
check(requests.length > 0 && requests.every((u) => /img https:\/\/gibs\.earthdata\.nasa\.gov\/.*\/\d{4}-\d{2}-\d{2}\//.test(u)), "the NASA option asks GIBS for a dated daily tile");
const t = G.geoLiveTiles(iberia, "usgs");
check(t.cols * t.rows <= 16 && t.z <= G.GEO_LIVE.usgs.maxZoom, "the tile grid fits the budget and the source's zoom");
const imgs = liveEl.all().filter((e) => e.tagName === "IMG");
imgs[0]?.onerror?.();
check(/could not load/.test(liveEl.textContent), "a failed tile leaves a note (offline or blocked), the baked backdrop stays");
live.show(null);
check(live.shown() === null, "it switches off again");
check(!/geoMountLive\([^)]*\)\.show\(/.test(app) && !/\.show\("(usgs|gibs)"\)/.test(app), "the app never switches the live layer on by itself");

// ------------------------------------------------------------------ 7. the baked backdrops
const jpegInfo = (buf) => { for (let i = 2; i < buf.length - 9;) { if (buf[i] !== 0xff) return null; const m = buf[i + 1], len = buf.readUInt16BE(i + 2); if (m >= 0xc0 && m <= 0xc2) return { h: buf.readUInt16BE(i + 5), w: buf.readUInt16BE(i + 7) }; i += 2 + len; } return null; };
const la = NP_PARISHES.filter((m) => LA_REGIONS.includes(m.region));
let total = 0, good = 0;
for (const m of la) {
  const jp = join(GEO_DIR, `${m.id}.jpg`), js = join(GEO_DIR, `${m.id}.json`);
  if (!existsSync(jp) || !existsSync(js)) { check(false, `${m.id}: backdrop and sidecar exist`); continue; }
  const buf = readFileSync(jp), side = JSON.parse(readFileSync(js, "utf8")), info = jpegInfo(buf);
  total += buf.length;
  const ok = info?.w === 512 && info?.h === 512 && buf.length <= 90_000 && side.quality <= 80 && side.bytes === buf.length
    && side.attribution === G.GEO_CREDIT && Array.isArray(side.scenes) && side.scenes.length && side.scenes.every((s) => s.scene && s.datetime && typeof s.cloud_cover === "number")
    && /^2026-\d{2}-\d{2}$/.test(side.date) && typeof side.cloud_cover === "number" && side.coverage >= 0.95 && side.map === m.id;
  check(ok, `${m.id}: 512 px, q<=80, <=90 KB, sidecar with scenes, date, cloud cover and the credit`);
  if (ok) good++;
}
check(la.length >= 17, `at least the 17 Louisiana maps are baked (${la.length})`);
const allJpg = readdirSync(GEO_DIR).filter((f) => f.endsWith(".jpg"));
const allKb = allJpg.reduce((s, f) => s + statSync(join(GEO_DIR, f)).size, 0) / 1024;
check(allKb <= BUDGET_KB, `all baked backdrops together stay inside the ${BUDGET_KB} KB budget (${allKb.toFixed(0)} KB, ${allJpg.length} maps)`);
check(allJpg.every((f) => existsSync(join(GEO_DIR, f.replace(/\.jpg$/, ".json")))), "every backdrop has its sidecar");
const html = PAGE_SRC[1];
check(html.includes('id="geo-credit"') && html.indexOf('id="geo-credit"') - html.indexOf('id="map-canvas"') < 200 && html.includes(G.GEO_CREDIT), "the credit sits under the map canvas");
check(/id="geo-ground" type="button" aria-pressed="false">Satellite ground: off/.test(html) && html.includes('id="geo-ground-credit"'), "the satellite ground is a toggle, off by default, with its own credit line");
check(/let geoBackdrop = null, geoPin = null, geoGroundOn = false/.test(app) && !/geoGroundOn = true/.test(app), "the app starts with the satellite ground off");
check(/\$\("geo-credit"\)\.hidden = !geoSat/.test(app), "the credit shows whenever the backdrop is drawn");
check(html.includes('id="geo-find"') && html.includes('id="geo-live"'), "Find me is in the Map tab and the live layer in the map screen");
// Item 4 proof: one map's real relief from USGS 3DEP, baked in the scene frame (not wired into the engine yet).
{
  const rp = join(GEO_DIR, "la-shintech-plaquemine.relief.json");
  const rel = existsSync(rp) ? JSON.parse(readFileSync(rp, "utf8")) : null;
  check(rel && rel.grid === 65 && rel.heights.length === 65 * 65 && rel.heights.every(Number.isInteger) && rel.units === "decimetres", "the 3DEP relief proof: a 65 x 65 integer grid in the scene frame");
  check(rel && /USGS 3D Elevation Program/.test(rel.credit) && /public domain/.test(rel.credit) && rel.tiles.every((t) => /^n\d{2}w\d{3}$/.test(t)), "the relief names its source, credit and 3DEP tiles");
  check(rel && new Set(rel.heights).size > 20, "the relief is real data, not a flat fill");
}
const bundler = readFileSync(join(ROOT, "tools", "bundle_webxr.py"), "utf8");
check(/SHARED \/ "geo-locate\.js"/.test(bundler), "the bundler lists geo-locate.js");
check(!/claude-|opus|sonnet|haiku/i.test(src + readFileSync(join(ROOT, "tools", "geo_bake.py"), "utf8")), "no model identifier in the GEO files");

console.log = realLog;
console.log(`check_geo: ${pass} passed, ${fail} failed · ${good}/${la.length} Louisiana backdrops, ${allJpg.length} baked in all, ${allKb.toFixed(0)} KB of ${BUDGET_KB} KB`);
process.exit(fail ? 1 : 0);
