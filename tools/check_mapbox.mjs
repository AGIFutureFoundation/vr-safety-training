/**
 * The Bay Atlas and the Mapbox layer (docs/mapbox.md), checked headlessly.
 *
 *     node tools/check_mapbox.mjs
 *
 * What is proved here:
 *
 *  1. **The fit is sound.** shared/bay-geo.js's eleven anchors are
 *     approximate, three-decimal, inside BAY_BOUNDS, and round-trip through
 *     bayToGeo()/geoToBay() within 1 m (they land within a millimetre); every
 *     site and landmark projects inside bayGeoBounds().
 *  2. **No token ships.** No string shaped like a Mapbox token — `pk.` or
 *     `sk.` followed by a base64url run — anywhere in the repository.
 *  3. **Nothing reaches Mapbox without a token.** With fetch and the script
 *     insertion stubbed and no token, mapboxToken() is null and
 *     loadMapboxGl()/createBayMap()/bayGroundTexture() return null with no
 *     request and no insertion. With a fake token and a stub library, the
 *     loader inserts exactly the pinned cdnjs URL once and injects its CSS
 *     inline, the map gets one marker per site and landmark and one polygon
 *     per zone, and the ground request goes to the Static Images endpoint.
 *  4. **The atlas renders in fallback mode** against a stub document: one
 *     marker per site and per landmark in the SVG, every row, chip and deep
 *     link in the list, "Built-in map" as the mode.
 *  5. **The wiring holds**: auth-config.json carries mapboxToken: null, the
 *     bundler lists the modules and the dist files exist and load no
 *     external asset, world.js applies the ground texture, app.js reads the
 *     ?site= deep link, the home page and Bay World's map screen link the
 *     atlas, docs/mapbox.md says where it works, and check_all runs this.
 */
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, extname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const WEBXR = join(ROOT, "WebXR");

let failures = 0;
async function check(name, fn) {
  try { await fn(); console.log(`  ✓ ${name}`); }
  catch (err) { failures += 1; console.log(`  ✗ ${name}\n      ${err.stack ?? err}`); }
}
function assert(ok, message) { if (!ok) throw new Error(message); }
const eq = (a, b, what) => { if (a !== b) throw new Error(`${what}: expected ${JSON.stringify(b)}, got ${JSON.stringify(a)}`); };
const count = (s, needle) => s.split(needle).length - 1;

function fakeStorage() {
  const m = new Map();
  return { getItem: (k) => (m.has(k) ? m.get(k) : null), setItem: (k, v) => m.set(k, String(v)), removeItem: (k) => m.delete(k), size: () => m.size };
}
// A token-shaped string assembled at runtime, so this file never carries one.
const FAKE_TOKEN = ["pk", "eyJ" + "a".repeat(24), "b".repeat(24)].join(".");

const geo = await import("../WebXR/shared/bay-geo.js");
const data = await import("../WebXR/shared/bayworld-data.js");
const mb = await import("../WebXR/shared/mapbox.js");
const atlas = await import("../WebXR/bayworld/js/atlas.js");
const TRADE_ROOMS = new Set((await import("../WebXR/shared/links.js")).LK_TRADES_ROOMS);
const { BAY_GEO_ANCHORS, bayToGeo, geoToBay, bayGeoBounds, bayGeoContains, bayGeoResidual } = geo;
const { BAY_BOUNDS, BAY_ZONES, BAY_SITES, BAY_LANDMARKS } = data;

// ------------------------------------------------------------- 1. the fit

await check("six to twelve approximate, three-decimal anchors, each inside the field, ids unique", () => {
  assert(BAY_GEO_ANCHORS.length >= 6 && BAY_GEO_ANCHORS.length <= 12, `${BAY_GEO_ANCHORS.length} anchors, expected six to twelve`);
  const ids = new Set();
  for (const a of BAY_GEO_ANCHORS) {
    assert(a.approximate === true, `${a.id} is not marked approximate`);
    assert(!ids.has(a.id), `anchor id ${a.id} repeated`); ids.add(a.id);
    for (const v of a.lonLat) assert(Math.abs(Math.round(v * 1000) / 1000 - v) < 1e-9, `${a.id}'s ${v} has more than three decimals`);
    assert(a.lonLat[0] >= -180 && a.lonLat[0] <= 180 && a.lonLat[1] >= -90 && a.lonLat[1] <= 90, `${a.id}'s lon/lat is off the globe`);
    assert(a.bay[0] >= BAY_BOUNDS.minX && a.bay[0] <= BAY_BOUNDS.maxX && a.bay[1] >= BAY_BOUNDS.minZ && a.bay[1] <= BAY_BOUNDS.maxZ, `${a.id}'s bay position is outside BAY_BOUNDS`);
    const keys = Object.keys(a).sort().join(",");
    eq(keys, "approximate,bay,id,label,lonLat", `${a.id} carries a fact beyond the pair`);
  }
});

await check("anchors and corners round-trip through bayToGeo/geoToBay within 1 m", () => {
  const corners = [[BAY_BOUNDS.minX, BAY_BOUNDS.minZ], [BAY_BOUNDS.maxX, BAY_BOUNDS.minZ], [BAY_BOUNDS.minX, BAY_BOUNDS.maxZ], [BAY_BOUNDS.maxX, BAY_BOUNDS.maxZ]];
  for (const p of [...BAY_GEO_ANCHORS.map((a) => a.bay), ...corners]) {
    const back = geoToBay(bayToGeo(p));
    const off = Math.hypot(back[0] - p[0], back[1] - p[1]);
    assert(off < 1, `(${p}) came back ${off.toFixed(3)} m away`);
  }
  const r = bayGeoResidual();
  assert(Number.isFinite(r.max) && r.max < 400, `the anchors' own residual is ${r.max.toFixed(0)} m — the fit no longer describes them`);
});

await check("every site and landmark projects inside bayGeoBounds(), and the box is sane", () => {
  const b = bayGeoBounds();
  assert(b.minLon < b.maxLon && b.minLat < b.maxLat, "bayGeoBounds is not a box");
  assert(b.maxLon - b.minLon < 1 && b.maxLat - b.minLat < 1, "bayGeoBounds spans more than a degree — the fit has run away");
  for (const item of [...BAY_SITES, ...BAY_LANDMARKS]) {
    assert(bayGeoContains(bayToGeo(item.position)), `${item.id} projects outside bayGeoBounds()`);
  }
  const centre = geoToBay([(b.minLon + b.maxLon) / 2, (b.minLat + b.maxLat) / 2]);
  const halfX = (BAY_BOUNDS.maxX - BAY_BOUNDS.minX) / 4, halfZ = (BAY_BOUNDS.maxZ - BAY_BOUNDS.minZ) / 4;
  assert(Math.abs(centre[0]) < halfX && Math.abs(centre[1]) < halfZ, `the box's centre maps to (${centre.map((v) => v.toFixed(0))}), far from the field's`);
});

// ------------------------------------------------------ 2. no token ships

const TOKEN_RE = /\b(pk|sk)\.[A-Za-z0-9_-]{16,}/;
const BINARY = new Set([".png", ".jpg", ".jpeg", ".gif", ".webp", ".glb", ".gltf", ".bin", ".mp3", ".wav", ".ogg", ".mp4", ".pdf", ".woff", ".woff2", ".ttf", ".otf", ".ico", ".zip", ".unitypackage", ".asset", ".meta", ".dll", ".so", ".dylib"]);
function walkRepo(dir, out = []) {
  for (const name of readdirSync(dir)) {
    if (name === ".git" || name === "node_modules" || name === ".claude") continue;
    const p = join(dir, name);
    const st = statSync(p);
    if (st.isDirectory()) walkRepo(p, out);
    else if (!BINARY.has(extname(name).toLowerCase())) out.push(p);
  }
  return out;
}
await check("no string shaped like a Mapbox token anywhere in the repository", () => {
  const hits = [];
  for (const file of walkRepo(ROOT)) {
    const src = readFileSync(file, "utf8");
    const m = TOKEN_RE.exec(src);
    if (m) hits.push(`${relative(ROOT, file)}: ${m[0].slice(0, 12)}…`);
  }
  assert(hits.length === 0, `token-shaped strings found:\n      ${hits.join("\n      ")}`);
});

// ------------------------------------------------- 3. nothing without a token

function fakeDocument() {
  const made = [], appended = [];
  const el = (tag) => ({
    tag, attrs: {}, children: [], innerHTML: "", textContent: "", hidden: false, value: "", listeners: {},
    classList: { add() {}, remove() {}, toggle() {} },
    setAttribute(k, v) { this.attrs[k] = String(v); }, getAttribute(k) { return this.attrs[k] ?? null; },
    addEventListener(type, fn) { (this.listeners[type] ??= []).push(fn); },
    appendChild(c) { this.children.push(c); appended.push(c); return c; },
    querySelectorAll() { return []; }, scrollIntoView() {},
  });
  const byId = new Map();
  const doc = {
    head: el("head"), body: el("body"),
    createElement(tag) { const e = el(tag); made.push(e); return e; },
    getElementById(id) { if (!byId.has(id)) byId.set(id, el("div")); return byId.get(id); },
    made, appended, byId,
  };
  return doc;
}
const fetchCalls = [];
const realFetch = globalThis.fetch;
globalThis.fetch = (...a) => { fetchCalls.push(String(a[0])); return Promise.reject(new Error("no network in the checker")); };
const noMapbox = () => { assert(!fetchCalls.some((u) => /mapbox/i.test(u)), `a request reached a Mapbox host: ${fetchCalls.join(", ")}`); };

await check("cleanMapboxToken accepts only a public-shaped token", () => {
  eq(mb.cleanMapboxToken(FAKE_TOKEN), FAKE_TOKEN, "a public-shaped token was refused");
  eq(mb.cleanMapboxToken(`  ${FAKE_TOKEN}  `), FAKE_TOKEN, "surrounding whitespace was not trimmed");
  for (const bad of [null, "", "not-a-token", FAKE_TOKEN.replace(/^pk/, "sk"), "pk.<script>alert(1)</script>", "pk.short", FAKE_TOKEN + " x", 42]) {
    eq(mb.cleanMapboxToken(bad), null, `cleanMapboxToken accepted ${JSON.stringify(bad)}`);
  }
});

await check("with no token: mapboxToken() is null, and loader, map and ground make no request and no insertion", async () => {
  const session = fakeStorage(), local = fakeStorage(), doc = fakeDocument();
  const inserted = [];
  eq(mb.mapboxToken({ search: "", session, local, config: { mapboxToken: null } }), null, "mapboxToken with nothing configured");
  eq(mb.mapboxToken({ search: "?mapbox=garbage", session, local, config: null }), null, "a garbage ?mapbox= was accepted");
  eq(session.size(), 0, "a garbage ?mapbox= was stored");
  eq(await mb.loadMapboxGl({ token: null, insert: (u) => inserted.push(u), doc }), null, "loadMapboxGl without a token");
  eq(await mb.createBayMap(doc.getElementById("x"), { token: null, sites: BAY_SITES, landmarks: BAY_LANDMARKS, zones: BAY_ZONES, insert: (u) => inserted.push(u), doc }), null, "createBayMap without a token");
  const loads = [];
  const three = { TextureLoader: class { load(url) { loads.push(url); } } };
  eq(mb.bayGroundTexture(three, { token: null }), null, "bayGroundTexture without a token");
  eq(mb.bayStaticImageUrl("garbage"), null, "bayStaticImageUrl built a URL from garbage");
  eq(inserted.length, 0, "a script was inserted with no token");
  eq(loads.length, 0, "a texture was requested with no token");
  eq(doc.made.filter((e) => e.tag === "script").length, 0, "a script element was created with no token");
  eq(fetchCalls.length, 0, "fetch was called with no token");
  noMapbox();
});

await check("the token lookup order: launch URL (kept for the tab), session, local, then auth-config.json", () => {
  const session = fakeStorage(), local = fakeStorage();
  eq(mb.mapboxToken({ search: `?mapbox=${FAKE_TOKEN}`, session, local }), FAKE_TOKEN, "?mapbox= was not read");
  eq(session.getItem(mb.MAPBOX_TOKEN_KEY), FAKE_TOKEN, "the launch-URL token was not kept in sessionStorage");
  eq(mb.mapboxToken({ search: "", session, local }), FAKE_TOKEN, "the session copy was not read");
  const local2 = fakeStorage();
  eq(mb.rememberMapboxToken(FAKE_TOKEN, { local: local2 }), FAKE_TOKEN, "rememberMapboxToken refused a public token");
  eq(mb.rememberMapboxToken("nope", { local: local2 }), null, "rememberMapboxToken accepted garbage");
  eq(local2.getItem(mb.MAPBOX_TOKEN_KEY), FAKE_TOKEN, "the remembered token was overwritten by garbage");
  eq(mb.mapboxToken({ search: "", session: fakeStorage(), local: local2 }), FAKE_TOKEN, "localStorage was not read");
  eq(mb.mapboxToken({ search: "", session: fakeStorage(), local: fakeStorage(), config: { mapboxToken: FAKE_TOKEN } }), FAKE_TOKEN, "auth-config's token was not read");
  mb.forgetMapboxToken({ local: local2, session });
  eq(local2.size() + session.size(), 0, "forgetMapboxToken left a token behind");
});

await check("readMapboxConfig reads only the file it is given, and never runs headless without a fetch", async () => {
  eq(await mb.readMapboxConfig("../auth-config.json"), null, "readMapboxConfig fetched with no location and no fetch given");
  eq(fetchCalls.length, 0, "readMapboxConfig reached the global fetch headlessly");
  const asked = [];
  const f = async (url) => { asked.push(url); return { ok: true, json: async () => ({ mapboxToken: FAKE_TOKEN, googleClientId: "x" }) }; };
  const cfg = await mb.readMapboxConfig("../auth-config.json", { fetch: f });
  eq(asked.join(","), "../auth-config.json", "readMapboxConfig asked for something else");
  eq(cfg?.mapboxToken, FAKE_TOKEN, "the config's token was not cleaned through");
  eq(Object.keys(cfg).join(","), "mapboxToken", "readMapboxConfig passed other keys through");
  const bad = await mb.readMapboxConfig("../auth-config.json", { fetch: async () => ({ ok: true, json: async () => ({ mapboxToken: "sk.nope" }) }) });
  eq(bad?.mapboxToken, null, "a secret-shaped token in the config was accepted");
});

function stubMapboxGl() {
  const state = { maps: [], markers: [], popups: [], controls: 0 };
  class Map {
    constructor(opts) { this.opts = opts; this.sources = {}; this.layers = []; this.handlers = {}; state.maps.push(this); }
    addControl() { state.controls += 1; return this; }
    on(ev, fn) { (this.handlers[ev] ??= []).push(fn); if (ev === "load") fn(); }
    isStyleLoaded() { return false; }
    getSource(id) { return this.sources[id]; }
    addSource(id, src) { this.sources[id] = src; }
    addLayer(l) { this.layers.push(l); }
    remove() { this.removed = true; }
  }
  class Marker {
    constructor(opts) { this.opts = opts; state.markers.push(this); }
    setLngLat(ll) { this.lngLat = ll; return this; } setPopup(p) { this.popup = p; return this; } addTo(m) { this.map = m; return this; } remove() { this.removed = true; }
  }
  class Popup { constructor(o) { this.o = o; state.popups.push(this); } setHTML(h) { this.html = h; return this; } }
  class NavigationControl {}
  return { Map, Marker, Popup, NavigationControl, state };
}

await check("loadMapboxGl with the insertion stubbed: the pinned cdnjs URL once, CSS injected inline once, then cached", async () => {
  const doc = fakeDocument();
  const inserted = [];
  const gl = stubMapboxGl();
  const insert = (url, done) => { inserted.push(url); globalThis.mapboxgl = gl; done(true); };
  const lib = await mb.loadMapboxGl({ token: FAKE_TOKEN, insert, doc });
  assert(lib === gl, "loadMapboxGl did not resolve to the library the script defined");
  eq(inserted.join(","), mb.MAPBOX_GL_URL, "the loader inserted something other than the one pinned cdnjs URL");
  assert(/^https:\/\/cdnjs\.cloudflare\.com\/ajax\/libs\/mapbox-gl\/3\.4\.0\//.test(mb.MAPBOX_GL_URL), "the library URL is not the pinned cdnjs copy");
  const styles = doc.head.children.filter((e) => e.tag === "style");
  eq(styles.length, 1, "the essential CSS was not injected exactly once");
  for (const sel of [".mapboxgl-marker", ".mapboxgl-popup", ".mapboxgl-popup-content", ".mapboxgl-ctrl-group", ".mapboxgl-ctrl-attrib", ".mapboxgl-canvas"]) {
    assert(styles[0].textContent.includes(sel), `the inline CSS lacks ${sel}`);
  }
  assert(!/<link/i.test(styles[0].textContent) && !/@import/i.test(styles[0].textContent), "the inline CSS pulls an external stylesheet");
  const again = await mb.loadMapboxGl({ token: FAKE_TOKEN, insert, doc });
  assert(again === gl && inserted.length === 1, "a second call inserted the script again");
  eq(doc.head.children.filter((e) => e.tag === "style").length, 1, "a second call injected the CSS again");
  delete globalThis.mapboxgl;
  eq(await mb.loadMapboxGl({ token: null, insert, doc }), null, "loadMapboxGl loaded without a token");
  eq(inserted.length, 1, "loadMapboxGl inserted without a token");
  eq(fetchCalls.length, 0, "the loader used fetch");
});

await check("createBayMap with a stub library: fitted to the bounds, one marker per site and landmark, one polygon per zone, popups with chips", async () => {
  const doc = fakeDocument();
  const gl = stubMapboxGl();
  const inserted = [];
  const selected = [];
  const handle = await mb.createBayMap(doc.getElementById("map"), {
    token: FAKE_TOKEN, mapboxgl: gl, insert: (u) => inserted.push(u), doc,
    zones: BAY_ZONES, landmarks: BAY_LANDMARKS, sites: BAY_SITES, onSelect: (item, kind) => selected.push(`${kind}:${item.id}`),
  });
  assert(handle?.map, "createBayMap returned no handle");
  eq(inserted.length, 0, "the loader was used although the library was supplied");
  eq(gl.accessToken, FAKE_TOKEN, "the token was not set on the library");
  const b = bayGeoBounds();
  eq(JSON.stringify(gl.state.maps[0].opts.bounds), JSON.stringify([[b.minLon, b.minLat], [b.maxLon, b.maxLat]]), "the map is not fitted to bayGeoBounds()");
  eq(gl.state.markers.length, BAY_SITES.length + BAY_LANDMARKS.length, "markers");
  eq(handle.markers.filter((m) => m.kind === "site").length, BAY_SITES.length, "site markers");
  for (const m of gl.state.markers) assert(bayGeoContains(m.lngLat), "a marker sits outside the bounds");
  const src = gl.state.maps[0].sources["bay-zones"];
  eq(src?.data?.features?.length, BAY_ZONES.length, "zone polygons");
  for (const f of src.data.features) {
    const ring = f.geometry.coordinates[0];
    assert(ring.length > 8 && ring[0][0] === ring[ring.length - 1][0], `${f.properties.id}'s ring is not closed`);
    assert(/^#[0-9a-f]{6}$/.test(f.properties.color), `${f.properties.id}'s colour is ${f.properties.color}`);
  }
  eq(gl.state.maps[0].layers.length, 2, "zone fill and line layers");
  const port = handle.markers.find((m) => m.item.id === "port-container-terminal");
  assert(port?.marker.popup?.html.includes("Port Container Terminal") && port.marker.popup.html.includes('class="mb-chip"'), "the site popup lacks its name or programme chips");
  eq(count(port.marker.popup.html, 'class="mb-chip"'), port.item.programmes.length, "one chip per programme");
  port.marker.opts.element.listeners.click[0]();
  eq(selected.join(","), "site:port-container-terminal", "onSelect did not fire for the clicked marker");
  handle.destroy();
  assert(gl.state.maps[0].removed && gl.state.markers.every((m) => m.removed), "destroy() left the map or a marker behind");
  eq(fetchCalls.length, 0, "createBayMap used fetch");
  noMapbox();
});

await check("bayGroundTexture with a token asks the Static Images endpoint once; the uv matrix lines the image up with the field", async () => {
  const loads = [];
  const tex = { matrix: { set() {} }, needsUpdate: false };
  const three = { TextureLoader: class { load(url, onLoad) { loads.push(url); onLoad(tex); } }, SRGBColorSpace: "srgb", ClampToEdgeWrapping: 1001 };
  const got = await mb.bayGroundTexture(three, { token: FAKE_TOKEN });
  assert(got === tex, "bayGroundTexture did not resolve to the loaded texture");
  eq(loads.length, 1, "one image request");
  const url = new URL(loads[0]);
  eq(url.origin + url.pathname.split("/static")[0] + "/static", mb.MAPBOX_STATIC_BASE, "the image is not from the Static Images endpoint");
  eq(url.searchParams.get("access_token"), FAKE_TOKEN, "the token is not on the request");
  const size = /\/(\d+)x(\d+)(@2x)?$/.exec(url.pathname);
  assert(size && Number(size[1]) <= 1280 && Number(size[2]) <= 1280, `the image size ${url.pathname} is over the endpoint's 1280 px`);
  const b = bayGeoBounds();
  assert(url.pathname.includes(`[${b.minLon.toFixed(6)},${b.minLat.toFixed(6)},${b.maxLon.toFixed(6)},${b.maxLat.toFixed(6)}]`), "the image box is not bayGeoBounds()");
  eq(tex.colorSpace, "srgb", "the texture was not marked sRGB");
  eq(tex.wrapS, 1001, "the texture was not clamped");
  // The uv matrix: the ground plane's four uv corners land on the image's
  // bounding box exactly (min 0, max 1 on each axis) — the box was built
  // from the same four corners.
  const m = mb.bayGroundUvMatrix({ cx: 0, cz: 0, w: BAY_BOUNDS.maxX - BAY_BOUNDS.minX, d: BAY_BOUNDS.maxZ - BAY_BOUNDS.minZ });
  eq(m.length, 9, "nine numbers for a Matrix3");
  const pts = [[0, 0], [1, 0], [0, 1], [1, 1]].map(([u, v]) => [m[0] * u + m[1] * v + m[2], m[3] * u + m[4] * v + m[5]]);
  const s = pts.map((p) => p[0]), t = pts.map((p) => p[1]);
  for (const [lo, hi, name] of [[Math.min(...s), Math.max(...s), "s"], [Math.min(...t), Math.max(...t), "t"]]) {
    assert(Math.abs(lo) < 1e-6 && Math.abs(hi - 1) < 1e-6, `the ${name} axis spans [${lo.toFixed(4)}, ${hi.toFixed(4)}], not [0, 1]`);
  }
  // uv (0.5, 0.5) is the field's centre, which bayToGeo() places somewhere inside the image.
  const c = [m[0] * 0.5 + m[1] * 0.5 + m[2], m[3] * 0.5 + m[4] * 0.5 + m[5]];
  assert(c[0] > 0 && c[0] < 1 && c[1] > 0 && c[1] < 1, "the field's centre maps outside the image");
  eq(fetchCalls.length, 0, "bayGroundTexture used fetch");
});

// ------------------------------------------------------- 4. the atlas page

await check("the atlas renders headlessly in fallback mode: one marker per site and landmark, every row, chip and deep link", async () => {
  const doc = fakeDocument();
  const state = atlas.atlasMount(doc, { readConfig: false, search: "", session: fakeStorage(), local: fakeStorage() });
  await state.ready;
  eq(state.mode, "svg", "mode");
  eq(state.hasToken, false, "hasToken");
  eq(doc.getElementById("atlas-mode").textContent, "Built-in map", "the mode badge");
  const svg = doc.getElementById("atlas-map").innerHTML;
  assert(svg.startsWith("<svg"), "the map container does not hold an SVG");
  eq(count(svg, 'data-site="'), BAY_SITES.length, "site markers in the SVG");
  eq(count(svg, 'data-landmark="'), BAY_LANDMARKS.length, "landmark markers in the SVG");
  eq(count(svg, 'data-road="'), data.BAY_ROADS.length, "roads in the SVG");
  for (const s of BAY_SITES) assert(svg.includes(`data-site="${s.id}"`), `${s.id} has no marker`);
  eq(count(svg, "<circle"), BAY_SITES.length + BAY_ZONES.length, "one circle per site and per zone");
  assert(!/https?:\/\//.test(svg.replace(/http:\/\/www\.w3\.org\/2000\/svg/g, "")), "the SVG references something external beyond its own namespace");
  const list = doc.getElementById("atlas-list").innerHTML;
  eq(count(list, 'data-place="'), BAY_SITES.length + BAY_LANDMARKS.length, "rows in the list");
  const chips = BAY_SITES.reduce((n, s) => n + s.programmes.length, 0);
  eq(count(list, 'data-programme="'), chips, "one chip per programme");
  for (const s of BAY_SITES) {
    assert(list.includes(`index.html?site=${encodeURIComponent(s.id)}"`), `${s.id} has no Bay World deep link`);
    // A Trade Skills room opens in the Trade Skills app (shared/links.js).
    if (s.stations.length) assert(list.includes(`${TRADE_ROOMS.has(s.stations[0]) ? `trades/index.html?room=` : `smartcity-x.html?sim=`}${encodeURIComponent(s.stations[0])}&amp;from=atlas"`), `${s.id} has no station deep link`);
    else assert(!list.includes(`?sim=&amp;from=atlas"`), `${s.id} links an empty station`);
  }
  for (const l of BAY_LANDMARKS) assert(list.includes(`index.html?landmark=${encodeURIComponent(l.id)}"`), `${l.id} has no Bay World deep link`);
  eq(doc.getElementById("atlas-count").textContent, `${BAY_SITES.length} sites · ${BAY_LANDMARKS.length} landmarks`, "the count line");
  eq(fetchCalls.length, 0, "the atlas fetched something with readConfig off");
  // Filtering narrows the list, and the detail card carries the same links.
  eq(atlas.atlasFilter(state.places, "rigging").every((p) => [p.name, ...p.programmes, ...p.stations].join(" ").toLowerCase().includes("rigging")), true, "the filter matched something else");
  const portPlace = state.places.find((p) => p.id === "port-container-terminal");
  const card = atlas.atlasPopupHtml(portPlace);
  assert(card.includes("Open in Bay World") && card.includes("Launch") && count(card, "data-programme=") === portPlace.programmes.length, "the detail card lacks its links or chips");
  // Hostile names never reach an attribute unescaped.
  const evil = atlas.atlasListHtml([{ kind: "site", id: 'x" onmouseover="1', name: "<b>x</b>", zone: "z", zoneName: "z", accent: "#000000", position: [0, 0], programmes: ['p"q'], stations: [], blurb: "" }]);
  assert(!evil.includes('id="x" onmouseover') && !evil.includes("<b>x</b>") && !evil.includes('data-programme="p"q"'), "markup in a name or id reached the page unescaped");
});

await check("the atlas reads auth-config.json beside itself and nothing else; a null token keeps the built-in map", async () => {
  const doc = fakeDocument();
  const asked = [];
  const f = async (url) => { asked.push(url); return { ok: true, json: async () => ({ mapboxToken: null }) }; };
  const state = atlas.atlasMount(doc, { fetch: f, search: "", session: fakeStorage(), local: fakeStorage() });
  await state.ready;
  eq(asked.join(","), "../auth-config.json", "the atlas asked for something other than the deployment's config");
  eq(state.mode, "svg", "mode with a null config token");
  eq(fetchCalls.length, 0, "the global fetch was used");
  noMapbox();
});

await check("the atlas with a token and a stub library switches to Mapbox mode; a load failure falls back to the SVG", async () => {
  const doc = fakeDocument();
  const gl = stubMapboxGl();
  const session = fakeStorage();
  const state = atlas.atlasMount(doc, { readConfig: false, search: `?mapbox=${FAKE_TOKEN}`, session, local: fakeStorage(), mapboxgl: gl });
  await state.ready;
  eq(state.mode, "mapbox", "mode with a token");
  eq(doc.getElementById("atlas-mode").textContent, "Mapbox", "the mode badge");
  eq(gl.state.markers.length, BAY_SITES.length + BAY_LANDMARKS.length, "markers on the live map");
  const popup = gl.state.markers.find((m) => m.opts.element.title === "Port Container Terminal")?.popup?.html ?? "";
  assert(popup.includes("Open in Bay World") && popup.includes("data-programme="), "the live popup lacks the atlas's links or chips");
  eq(session.getItem(mb.MAPBOX_TOKEN_KEY), FAKE_TOKEN, "the launch-URL token was not kept for the tab");
  // The library never arrives: the SVG comes back. (The loader cached the
  // earlier stub load; a page never sees that, the checker resets it.)
  mb.resetMapboxGlLoader();
  delete globalThis.mapboxgl;
  const doc2 = fakeDocument();
  const state2 = atlas.atlasMount(doc2, { readConfig: false, search: "", session: fakeStorage(), local: fakeStorage(), config: { mapboxToken: FAKE_TOKEN }, insert: (u, done) => done(false) });
  await state2.ready;
  eq(state2.mode, "svg", "mode after a failed load");
  eq(count(doc2.getElementById("atlas-map").innerHTML, 'data-site="'), BAY_SITES.length, "the SVG did not come back after the failure");
  assert(/built-in map/i.test(doc2.getElementById("atlas-status").textContent), "the status line does not say the built-in map took over");
  eq(fetchCalls.length, 0, "fetch was used");
  noMapbox();
});
globalThis.fetch = realFetch;

// ---------------------------------------------------------- 5. the wiring

const read = (...p) => readFileSync(join(ROOT, ...p), "utf8");

await check("WebXR/auth-config.json carries mapboxToken: null, and the docs say so", () => {
  const cfg = JSON.parse(read("WebXR", "auth-config.json"));
  assert("mapboxToken" in cfg, "auth-config.json has no mapboxToken key");
  eq(cfg.mapboxToken, null, "auth-config.json's mapboxToken must ship null");
  assert(/mapboxToken/.test(read("docs", "sign-in.md")), "docs/sign-in.md does not mention mapboxToken");
});

await check("mapbox.js reaches only the two named hosts, and no library is vendored", () => {
  const src = read("WebXR", "shared", "mapbox.js");
  const urls = [...src.matchAll(/https?:\/\/[^\s"'`)]+/g)].map((m) => m[0]);
  assert(urls.length >= 2, "mapbox.js names no URL at all");
  for (const u of urls) {
    assert(u.startsWith("https://cdnjs.cloudflare.com/ajax/libs/mapbox-gl/") || u.startsWith("https://api.mapbox.com/styles/v1/mapbox/satellite-v9/static"),
      `mapbox.js names an unexpected URL: ${u}`);
  }
  for (const file of ["shared/mapbox.js", "shared/bay-geo.js", "bayworld/js/atlas.js"]) {
    const code = read("WebXR", file);
    for (const api of ["XMLHttpRequest", "new Image(", "sendBeacon", "WebSocket", "EventSource", "importScripts"]) assert(!code.includes(api), `${file} reaches for ${api}`);
  }
  assert(!/import\s+\*\s+as\s+THREE|three\.module/.test(src), "mapbox.js imports three.js — it must take the module as an argument");
  const vendored = [];
  (function walk(dir) {
    for (const name of readdirSync(dir)) {
      const p = join(dir, name);
      if (statSync(p).isDirectory()) walk(p); else if (/mapbox-gl/i.test(name)) vendored.push(relative(ROOT, p));
    }
  })(WEBXR);
  eq(vendored.length, 0, `the Mapbox library is vendored: ${vendored.join(", ")}`);
});

await check("the bundler lists the modules, the dist pages are built and load no external asset", () => {
  const bundler = read("tools", "bundle_webxr.py");
  const block = (app) => /"__APP__":\s*\{[\s\S]*?"modules":\s*\[([\s\S]*?)\]/.source.replace("__APP__", app);
  const listed = (app) => [...(new RegExp(block(app)).exec(bundler)?.[1] ?? "").matchAll(/(SHARED|WEBXR)\s*\/\s*"([^"]+)"/g)].map((m) => (m[1] === "SHARED" ? `shared/${m[2]}` : m[2]));
  const atlasMods = listed("atlas");
  for (const f of ["shared/bayworld-data.js", "shared/bay-geo.js", "shared/mapbox.js", "bayworld/js/atlas.js"]) assert(atlasMods.includes(f), `the atlas bundle lacks ${f}`);
  const bay = listed("bayworld");
  assert(bay.includes("shared/bay-geo.js") && bay.includes("shared/mapbox.js"), "the bayworld bundle lacks bay-geo.js or mapbox.js");
  assert(bay.indexOf("shared/mapbox.js") < bay.indexOf("bayworld/js/world.js"), "mapbox.js must be listed before world.js");
  assert(/"atlas":\s*"atlas\.html"/.test(bundler), "atlas.html is not copied into the combined WebXR/dist folder");
  assert(/AUTH_CONFIG_APPS\s*=\s*\[[^\]]*"atlas"/.test(bundler) && /AUTH_CONFIG_APPS\s*=\s*\[[^\]]*"bayworld"/.test(bundler), "auth-config.json is not copied beside the atlas and Bay World bundles");
  for (const p of [["WebXR", "bayworld", "dist", "atlas.html"], ["WebXR", "dist", "atlas.html"], ["WebXR", "dist", "auth-config.json"], ["WebXR", "bayworld", "dist", "auth-config.json"]]) {
    assert(existsSync(join(ROOT, ...p)), `${p.join("/")} has not been built — run python3 tools/bundle_webxr.py`);
  }
  for (const p of [["WebXR", "bayworld", "dist", "atlas.html"], ["WebXR", "dist", "atlas.html"]]) {
    const dist = read(...p);
    assert(dist.includes("atlasMount") && dist.includes("bayGeoBounds") && dist.includes("MAPBOX_GL_URL"), `${p.join("/")} is stale — run python3 tools/bundle_webxr.py`);
    assert(!/three\.module/.test(dist), `${p.join("/")} loads three.js, which the DOM-only atlas never needs`);
    const external = [...dist.matchAll(/<(?:script|link|img|audio|video|source|iframe)\b[^>]*>/g)].map((m) => m[0])
      .filter((tag) => !/rel="preconnect"/.test(tag))
      .map((tag) => /(?:src|href)="(https?:[^"]+)"/.exec(tag)?.[1]).filter(Boolean)
      .filter((u) => !/fonts\.(googleapis|gstatic)\.com/.test(u));
    eq(external.join(","), "", `${p.join("/")} loads an external asset statically`);
  }
  const combined = read("WebXR", "dist", "atlas.html");
  assert(combined.includes('"./bayworld.html?') || combined.includes("./bayworld.html"), "the combined atlas does not link the bundled bayworld.html");
  assert(combined.includes("./smartcity-x.html"), "the combined atlas does not link the bundled smartcity-x.html");
  assert(combined.includes('"./auth-config.json"'), "the combined atlas does not read the config beside itself");
  const bayDist = read("WebXR", "dist", "bayworld.html");
  assert(bayDist.includes("bwApplySatelliteGround") && bayDist.includes("bayGroundUvMatrix"), "WebXR/dist/bayworld.html is stale — run python3 tools/bundle_webxr.py");
  assert(bayDist.includes('href="./atlas.html"'), "the bundled Bay World does not link the atlas beside it");
});

await check("world.js applies the ground texture only when it resolves; app.js reads the atlas deep link; the pages link each other", () => {
  const world = read("WebXR", "bayworld", "js", "world.js");
  assert(/import\s*\{[^}]*bayGroundTexture[^}]*\}\s*from\s*"\.\.\/\.\.\/shared\/mapbox\.js"/.test(world), "world.js does not import bayGroundTexture from shared/mapbox.js");
  assert(/bayGroundUvMatrix\(/.test(world) && /userData\?\.bayGround/.test(world), "world.js does not line the texture up on the tagged ground");
  assert(/userData\.bayGround\s*=\s*true/.test(read("WebXR", "shared", "bayworld.js")), "shared/bayworld.js does not tag its ground slab");
  const app = read("WebXR", "bayworld", "js", "app.js");
  assert(/get\("site"\)/.test(app) && /get\("landmark"\)/.test(app), "app.js does not read ?site= / ?landmark=");
  assert(read("WebXR", "bayworld", "index.html").includes('href="./atlas.html"'), "Bay World's map screen does not link the atlas");
  const page = read("WebXR", "bayworld", "atlas.html");
  assert(/class="home-chip"/.test(page) && /href="\.\.\/index\.html"/.test(page), "the atlas has no Home chip");
  for (const id of ["atlas-map", "atlas-list", "atlas-mode", "atlas-status", "atlas-token", "atlas-token-save", "atlas-token-clear", "atlas-search", "atlas-detail"]) assert(page.includes(`id="${id}"`), `atlas.html lacks #${id}`);
  assert(/stays in this browser/.test(page), "the token field does not say the token stays in this browser");
  assert(read("WebXR", "index.html").includes('href="bayworld/atlas.html"'), "WebXR/index.html does not link the atlas");
  assert(read("WebXR", "home.html").includes('href="atlas.html"'), "WebXR/home.html does not link the atlas");
  const gen = read("tools", "gen_home.mjs");
  assert(/atlas:\s*"bayworld\/atlas\.html"/.test(gen) && /atlas:\s*"atlas\.html"/.test(gen), "gen_home.mjs's layouts carry no atlas entry");
});

// ------------------------------------------------ 6. RELIEF: Mapbox relief under the parish maps (docs/consoles/RELIEF.md)

const RL = await import("../WebXR/shared/rl-relief.js");
const NPE = await import("../WebXR/shared/np-parish.js");
const NPG = await import("../WebXR/shared/np-geo.js");
const NPR = await import("../WebXR/shared/np-parishes.js");
const rlStats = { requests: 0, tiles: 0, maps: 0, chunks: 0, cap: 0, flat: 0, water: 0 };

// A stub Terrain-RGB service: every tile's pixels encode `terrain(lon, lat)` metres exactly as Mapbox does, so decoding
// must give the same heights back. Nothing leaves the process; every URL asked for is recorded.
function rlEncode(m) { const v = Math.round((m + 10000) * 10); return [(v >> 16) & 255, (v >> 8) & 255, v & 255]; }
function rlStubService(terrain, { failOne = false } = {}) {
  const urls = [];
  const fetch = async (url) => {
    urls.push(url);
    const m = /\/(\d+)\/(\d+)\/(\d+)\.pngraw\?access_token=/.exec(url);
    if (!m || (failOne && urls.length === 2)) return { ok: false, status: 404 };
    return { ok: true, status: 200, tile: { z: +m[1], x: +m[2], y: +m[3] } };
  };
  const decodeImage = async (res) => {
    const { z, x, y } = res.tile, w = 64, h = 64, data = new Uint8ClampedArray(w * h * 4), n = 2 ** z;
    for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) {
      const gx = x + (i + 0.5) / w, gy = y + (j + 0.5) / h;
      const lon = (gx / n) * 360 - 180, lat = (Math.atan(Math.sinh(Math.PI * (1 - (2 * gy) / n))) * 180) / Math.PI;
      const [r, g, b] = rlEncode(terrain(lon, lat)), k = (j * w + i) * 4;
      data[k] = r; data[k + 1] = g; data[k + 2] = b; data[k + 3] = 255;
    }
    return { width: w, height: h, data };
  };
  return { urls, fetch, decodeImage };
}

await check("RELIEF: Terrain-RGB decodes Mapbox's encoding exactly (known pixels)", () => {
  for (const [rgb, m] of [[[0, 0, 0], -10000], [[1, 134, 160], 0], [[1, 135, 4], 10], [[1, 146, 152], 306.4], [[255, 255, 255], 1667721.5]]) {
    const got = RL.rlDecodeTerrainRgb(...rgb);
    assert(Math.abs(got - m) < 1e-6, `rgb(${rgb}) decodes to ${got}, expected ${m}`);
  }
  const px = RL.rlDecodePixels({ width: 2, height: 1, data: new Uint8ClampedArray([1, 134, 160, 255, 1, 135, 4, 255]) });
  assert(Math.abs(px[0]) < 1e-6 && Math.abs(px[1] - 10) < 1e-6, `a two-pixel tile decodes to ${[...px]}`);
  for (const m of [-12.3, 0, 4.5, 281.7]) assert(Math.abs(RL.rlDecodeTerrainRgb(...rlEncode(m)) - m) < 0.051, `${m} m round-trips`);
});

await check("RELIEF: no token, no request — rlLoadRelief/rlPrepareRelief resolve null, no drape or tile URL, the engine untouched", async () => {
  const p = NPR.npParish("sf-mission");
  const svc = rlStubService(() => 100);
  for (const token of [null, undefined, "", "not-a-token", ["sk", "s".repeat(20), "a".repeat(8)].join(".")]) {
    eq(await RL.rlLoadRelief(p, { token, fetch: svc.fetch, decodeImage: svc.decodeImage }), null, `rlLoadRelief with token ${JSON.stringify(token)}`);
    eq(await RL.rlPrepareRelief(p, { token, fetch: svc.fetch, decodeImage: svc.decodeImage }), null, `rlPrepareRelief with token ${JSON.stringify(token)}`);
    eq(RL.rlDrapeUrl(p, token), null, "rlDrapeUrl without a token");
    eq(RL.rlTileUrl({ z: 12, x: 655, y: 1583 }, token), null, "rlTileUrl without a token");
  }
  eq(svc.urls.length, 0, "requests made without a token");
  eq(NPE.NP_TERRAIN_HOOKS.relief, null, "NP_TERRAIN_HOOKS.relief without a token");
  // the phone tier asks for nothing even with a token
  eq(await RL.rlLoadRelief(p, { token: FAKE_TOKEN, tier: "low", fetch: svc.fetch, decodeImage: svc.decodeImage }), null, "phone-tier relief");
  eq(svc.urls.length, 0, "requests made on the phone tier");
});

await check("RELIEF: every map's box fits the tile budget per tier (any map, by its lon/lat box); drapes are capped", () => {
  for (const p of NPR.NP_PARISHES) {
    const box = NPG.npBounds(p);
    const zh = RL.rlReliefZoom(box, "high"), zb = RL.rlReliefZoom(box, "balanced");
    assert(zh != null && RL.rlTilesForBox(box, zh).length <= RL.RL_BUDGET.high.maxTiles, `${p.id}: high tier ${zh} → ${zh == null ? "none" : RL.rlTilesForBox(box, zh).length} tiles`);
    assert(zb != null && RL.rlTilesForBox(box, zb).length <= RL.RL_BUDGET.balanced.maxTiles, `${p.id}: balanced tier over budget`);
    eq(RL.rlReliefZoom(box, "low"), null, `${p.id}: phone-tier zoom`);
    for (const [tier, side] of [["high", 1280], ["balanced", 1024], ["low", 640]]) {
      const url = RL.rlDrapeUrl(p, FAKE_TOKEN, tier), m = /\/(\d+)x(\d+)\?/.exec(url ?? "");
      assert(url?.startsWith(mb.MAPBOX_STATIC_BASE) && m && Math.max(+m[1], +m[2]) <= side, `${p.id}/${tier}: drape ${url?.slice(0, 60)} capped at ${side}`);
    }
    rlStats.maps++;
  }
});

await check("RELIEF: with a token the stub service is asked for Terrain-RGB tiles only, covering the box; decoded relief shapes the ground inside the schematic range", async () => {
  const p = NPR.npParish("sf-mission");
  // A synthetic ridge (sea level elsewhere), placed well clear of the named hills.
  const ridge = NPG.npToGeo(p, [-900, -300]);
  const terrain = (lon, lat) => 240 * Math.exp(-(((lon - ridge[0]) / 0.006) ** 2 + ((lat - ridge[1]) / 0.005) ** 2));
  const svc = rlStubService(terrain);
  const sampler = await RL.rlLoadRelief(p, { token: FAKE_TOKEN, tier: "high", fetch: svc.fetch, decodeImage: svc.decodeImage });
  assert(sampler, "no sampler with a token");
  const box = NPG.npBounds(p), tiles = RL.rlTilesForBox(box, sampler.stats.zoom);
  eq(svc.urls.length, tiles.length, "requests (one per tile)");
  assert(svc.urls.every((u) => u.startsWith(`${RL.RL_TERRAIN_BASE}/${sampler.stats.zoom}/`) && u.includes(".pngraw?access_token=")), "a request went somewhere other than the Terrain-RGB endpoint");
  const keys = new Set(tiles.map((t) => `${t.x},${t.y}`));
  for (const [lon, lat] of [[box.minLon, box.minLat], [box.maxLon, box.maxLat], [box.minLon, box.maxLat], [box.maxLon, box.minLat]]) {
    const [gx, gy] = RL.rlLonLatToPixel(lon, lat, sampler.stats.zoom).map((v) => Math.floor(v / RL.RL_TILE_PX));
    assert(keys.has(`${gx},${gy}`), `the box corner ${lon},${lat} is outside the fetched tiles`);
  }
  // decoded real heights come back through the sampler within a pixel's worth
  assert(Math.abs(sampler.real(...ridge) - 240) < 8, `real height at the ridge ${sampler.real(...ridge).toFixed(1)}, expected about 240`);
  const cap = RL.rlReliefCap(p);
  eq(sampler.stats.cap, cap, "the relief cap is the map's tallest hill");
  let top = 0;
  for (let z = -700; z <= 100; z += 40) for (let x = -1300; x <= -500; x += 40) top = Math.max(top, sampler.at(x, z)); // around the ridge
  assert(top <= cap + 1e-6 && top > cap * 0.5, `relief peaks at ${top.toFixed(1)} m (cap ${cap})`);
  rlStats.requests = svc.urls.length; rlStats.tiles = tiles.length; rlStats.cap = cap;
  // mounted: the ground rises on the ridge, above the named hills there
  const base = NPE.npHeightAt(p, -900, -300);
  RL.rlMountRelief(p, sampler);
  try {
    const lifted = NPE.npHeightAt(p, -900, -300);
    assert(lifted > base + cap * 0.5, `the ridge lifts the ground from ${base.toFixed(1)} to ${lifted.toFixed(1)} m`);
    assert(NPE.npGroundRise(p, -900, -300) >= NPE.npHillRise(p, -900, -300), "the relief never lowers a named hill");
    // another map reads no relief from this one's sampler
    const other = NPR.npParish("orleans");
    assert(NPE.NP_TERRAIN_HOOKS.relief(other, 0, 0) === 0, "another map reads this map's relief");
  } finally { RL.rlUnmountRelief(); }
  eq(NPE.npHeightAt(p, -900, -300), base, "unmounted, the height field is the schematic one again");
});

await check("RELIEF: the blend keeps every pad flat (a terrace at the ground's rise) and every water body level", async () => {
  for (const id of ["sf-golden-gate-park", "oak-downtown-lake", "orleans"]) {
    const p = NPR.npParish(id);
    if (!p) continue;
    // rough real ground everywhere: several ridges plus noise, so pads and shores sit on slopes
    const terrain = (lon, lat) => 60 + 120 * Math.sin(lon * 900) * Math.cos(lat * 700) + 40 * Math.sin((lon + lat) * 3100);
    const svc = rlStubService(terrain);
    const sampler = await RL.rlLoadRelief(p, { token: FAKE_TOKEN, tier: "balanced", fetch: svc.fetch, decodeImage: svc.decodeImage });
    assert(sampler, `${id}: no sampler`);
    const waterPts = [];
    for (let z = -2000; z <= 2000; z += 131) for (let x = -2000; x <= 2000; x += 131) { const w = NPE.npWaterAt(p, x, z); if (w && w.kind !== "wetland" && !p.sites.some((s) => Math.hypot(s.position[0] - x, s.position[1] - z) < NPE.NP_PAD * 1.8)) waterPts.push([x, z, NPE.npHeightAt(p, x, z)]); } // a pad's own blend owns the water at its edge
    RL.rlMountRelief(p, sampler);
    try {
      for (const s of p.sites) {
        const [sx, sz] = s.position, c = NPE.npHeightAt(p, sx, sz);
        assert(Math.abs(c - (NPE.NP_GROUND + NPE.npGroundRise(p, sx, sz))) < 0.5, `${id}/${s.id}: the pad is not a terrace at the ground's rise`);
        for (let i = 0; i < 8; i++) {
          const a = (i / 8) * Math.PI * 2, r = NPE.NP_PAD * 0.7, h = NPE.npHeightAt(p, sx + Math.cos(a) * r, sz + Math.sin(a) * r);
          assert(Math.abs(h - c) < 0.05, `${id}/${s.id}: the pad tilts (${(h - c).toFixed(2)} m across it)`);
        }
        rlStats.flat++;
      }
      for (const [x, z, h0] of waterPts) { assert(NPE.npHeightAt(p, x, z) === h0, `${id}: the water bed at ${x},${z} moved with the relief`); rlStats.water++; }
      // cached per chunk: sampling one chunk again builds nothing new, and never more grids than chunks
      const before = sampler.cachedChunks();
      for (let i = 0; i < 50; i++) sampler.at(100 + i, 100 + i);
      const once = sampler.cachedChunks();
      for (let i = 0; i < 50; i++) sampler.at(100 + i, 100 + i);
      assert(sampler.cachedChunks() === once && once >= before && once <= (4096 / NPE.NP_CHUNK) ** 2, `${id}: the per-chunk cache grew on a repeat (${once} → ${sampler.cachedChunks()})`);
      rlStats.chunks = Math.max(rlStats.chunks, once);
      // beside open water the relief has faded to nothing, so the shore meets the water line
      for (const [x, z] of waterPts.slice(0, 40)) assert(RL.rlShoreFade(p, x, z) === 0 && sampler.at(x, z) < 0.1 * RL.rlReliefCap(p), `${id}: relief ${sampler.at(x, z).toFixed(2)} m on the water at ${x},${z} (only a grid cell's leak is allowed; the bed ignores it)`);
    } finally { RL.rlUnmountRelief(); }
  }
});

await check("RELIEF: all tiles or none — a failed tile or a timeout leaves the schematic ground", async () => {
  const p = NPR.npParish("oak-fruitvale-estuary");
  const bad = rlStubService(() => 50, { failOne: true });
  eq(await RL.rlPrepareRelief(p, { token: FAKE_TOKEN, fetch: bad.fetch, decodeImage: bad.decodeImage }), null, "relief with a failed tile");
  eq(NPE.NP_TERRAIN_HOOKS.relief, null, "the hook after a failed tile");
  const never = { fetch: () => new Promise(() => {}), decodeImage: async () => null };
  eq(await RL.rlPrepareRelief(p, { token: FAKE_TOKEN, timeoutMs: 30, ...never }), null, "relief after a timeout");
  eq(NPE.NP_TERRAIN_HOOKS.relief, null, "the hook after a timeout");
});

await check("RELIEF: the parishes app awaits relief only with a token, before the world is built; the bundle carries rl-relief.js; docs say so", () => {
  const app = read("WebXR", "parishes", "js", "app.js");
  assert(/import \{[^}]*rlPrepareRelief[^}]*\} from "\.\.\/\.\.\/shared\/rl-relief\.js"/.test(app), "app.js does not import rlPrepareRelief");
  const gate = app.indexOf("mapboxToken() ? await rlPrepareRelief(parish"), build = app.indexOf("npBuildParish(root, THREE, parish");
  assert(gate > 0 && build > gate, "the relief is not token-gated before the world is built");
  assert(/RL_BUDGET\[npTierName\]/.test(app), "the drape is not capped by tier");
  assert(read("tools", "bundle_webxr.py").includes('SHARED / "rl-relief.js"'), "the parishes bundle does not list rl-relief.js");
  const src = read("WebXR", "shared", "rl-relief.js");
  assert(!/access_token=pk\./.test(src) && (src.match(/https:\/\/[^"`\s]+/g) ?? []).every((u) => u.startsWith("https://api.mapbox.com/")), "rl-relief.js names a host other than Mapbox's API, or carries a token");
  const doc = read("docs", "mapbox.md");
  for (const needle of ["Terrain-RGB", "rl-relief.js", "pads", "phone"]) assert(doc.includes(needle), `docs/mapbox.md does not mention ${needle}`);
  assert(read("docs", "parishes.md").includes("approximate position"), "docs/parishes.md does not say hills sit at an approximate position");
});

await check("docs/mapbox.md says how to get a token, where to put it and where it works; check_all runs this checker", () => {
  const doc = read("docs", "mapbox.md");
  for (const needle of ["auth-config.json", "smartciti.mapboxToken", "?mapbox=", "GitHub Pages", "content policy", "public", "SVG", "Static Images", "cdnjs"]) {
    assert(doc.includes(needle), `docs/mapbox.md does not mention ${needle}`);
  }
  assert(read("docs", "README.md").includes("mapbox.md"), "docs/README.md does not index mapbox.md");
  assert(read("tools", "check_all.mjs").includes('"check_mapbox.mjs"'), "check_all.mjs does not run check_mapbox.mjs");
});

const residual = bayGeoResidual();
console.log(failures
  ? `\n${failures} Bay Atlas / Mapbox problem(s) found.`
  : `\nBay Atlas: ${BAY_GEO_ANCHORS.length} approximate anchors round-trip exactly (anchor residual ≤ ${residual.max.toFixed(0)} m), ${BAY_SITES.length} sites and ${BAY_LANDMARKS.length} landmarks inside the lon/lat box; no token-shaped string in the repository; nothing reaches Mapbox without a token, and with one the loader inserts the pinned cdnjs URL once; the atlas renders headlessly with one marker per site; auth-config.json ships mapboxToken: null.`
    + `\nRELIEF: Terrain-RGB decodes exactly; no token (or the phone tier) makes no request; ${rlStats.maps} maps fit the tile budget by their lon/lat box; with a stub service ${rlStats.requests} tile requests, relief capped at ${rlStats.cap} m; ${rlStats.flat} pads stay flat and ${rlStats.water} water samples stay level under relief; ≤ ${rlStats.chunks} chunk grids cached.`);
process.exit(failures ? 1 : 0);
