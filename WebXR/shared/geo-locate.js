// GEO (docs/geo.md, docs/consoles/GEO.md): opt-in "Find me", the baked Sentinel-2 backdrops and the live satellite layer.
//
// Privacy, the hard rules (tools/check_geo.mjs proves each one):
//   - navigator.geolocation.getCurrentPosition is called once per press, and only from a trusted user gesture
//     (a click or key event with isTrusted); nothing on load, nothing on a timer, never watchPosition.
//   - The position lives in this module's memory only (geoState.here). It is never written to localStorage,
//     sessionStorage, IndexedDB or a cookie, never put in a URL, never sent (no fetch, beacon or image request
//     carries it) and never logged. "Forget" drops it; a reload drops it.
//   - It never runs in a demo session or signed out (profiles.js: only kind "account" may use it).
//   - In a K-12 class session it is off unless the teacher's DEAN version sets `geolocation: true`.
//
// The baked backdrop (tools/geo_bake.py): WebXR/assets/geo/<map>.jpg is already in the map's scene frame
// (column = x, row = z over the field), so it drops straight onto the parish canvas map and the ground's uv.
// The live layer (USGS National Map imagery, NASA GIBS daily true colour) is off by default and requests nothing
// until the viewer switches it on; its URLs live in GEO_LIVE below and no map library is vendored.
//
// Every top-level name is prefixed geo/GEO_ (the bundler concatenates all modules into one scope).

import { npBounds, npGeoContains, npGeoDistance, npGeoToXz } from "./np-geo.js";

/** The credit line shown wherever a Sentinel-2 image appears. */
export const GEO_CREDIT = "Contains modified Copernicus Sentinel data 2026";

/** The live imagery sources: the one constant block of URLs (public endpoints, no key). */
export const GEO_LIVE = Object.freeze({
  usgs: Object.freeze({
    label: "USGS National Map imagery",
    credit: "Imagery: USGS The National Map (public domain)",
    tile: "https://basemap.nationalmap.gov/arcgis/rest/services/USGSImageryOnly/MapServer/tile/{z}/{y}/{x}",
    maxZoom: 16,
  }),
  gibs: Object.freeze({
    label: "NASA GIBS daily true colour",
    credit: "Imagery: NASA EOSDIS GIBS, VIIRS true colour (daily; public)",
    tile: "https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/VIIRS_SNPP_CorrectedReflectance_TrueColor/default/{date}/GoogleMapsCompatible_Level9/{z}/{y}/{x}.jpg",
    maxZoom: 9,
  }),
});

/** Where the baked backdrops may sit relative to the page: the source page, a per-app dist, the combined dist. */
export const GEO_ASSET_BASES = ["../assets/geo/", "../../assets/geo/", "assets/geo/"];

// ------------------------------------------------------------------ policy

/**
 * Whether "Find me" may run in this session: `{ ok, reason }`. Pure.
 *  profile: profiles.js's gtProfile() ({ kind: "demo" | "account" | "device" });
 *  k12: whether this is a K-12 class session; version: DEAN's effective version (dnVersion()).
 */
export function geoAllowed({ profile = null, k12 = false, version = null, demo = false } = {}) {
  if (demo || profile?.kind === "demo") return { ok: false, reason: "Find me is off in the demo." };
  if (profile?.kind !== "account") return { ok: false, reason: "Sign in to use Find me." };
  if (k12 && version?.geolocation !== true) return { ok: false, reason: "Find me is off in class sessions unless your teacher turns it on." };
  return { ok: true, reason: "" };
}

/** Whether a DEAN version and the launch make this a K-12 class session. Pure. */
export function geoIsK12({ search = "", version = null, path = null } = {}) {
  const q = new URLSearchParams(search);
  return q.get("k12") === "1" || version?.scope?.kind === "class" || version?.lockedPath === "k12" || path === "k12";
}

// ------------------------------------------------------------------ nearest map

/** The nearest point of a map's lon/lat box to `[lon, lat]` (the point itself when inside). Pure. */
export function geoClampToBox(map, [lon, lat]) {
  const b = npBounds(map);
  return [Math.min(b.maxLon, Math.max(b.minLon, lon)), Math.min(b.maxLat, Math.max(b.minLat, lat))];
}

/**
 * Every map ranked by distance from `[lon, lat]` to its box (0 when inside): `[{ map, inside, metres }]`.
 * Maps without real anchors (a map at the origin, like a programme's demo field) are left out by `skip`.
 */
export function geoRank(maps, here, { skip = (m) => m.region === "programmes" } = {}) {
  return maps.filter((m) => !skip(m)).map((map) => {
    const inside = npGeoContains(map, here);
    return { map, inside, metres: inside ? 0 : npGeoDistance(here, geoClampToBox(map, here)) };
  }).sort((a, b) => a.metres - b.metres || a.map.id.localeCompare(b.map.id));
}

/** The nearest map and its region: `{ map, region, inside, metres }` or null for no maps. */
export function geoNearest(maps, here, opts = {}) {
  const r = geoRank(maps, here, opts)[0];
  return r ? { ...r, region: r.map.region ?? null } : null;
}

/** Where the viewer stands on a map, in scene metres, when inside its box; else null. Pure. */
export function geoPinOn(map, here) {
  if (!npGeoContains(map, here)) return null;
  const [x, z] = npGeoToXz(map, here), h = (map.size ?? 4096) / 2;
  return [Math.max(-h, Math.min(h, x)), Math.max(-h, Math.min(h, z))];
}

// ------------------------------------------------------------------ Find me (runtime, opt-in)

/** The one piece of state: the position, in memory only. */
const geoState = { here: null, busy: false };
export function geoHere() { return geoState.here ? geoState.here.slice() : null; }
export function geoForget() { geoState.here = null; }

/**
 * Ask for the position once, from a user gesture. Resolves `{ ok, here?, reason? }`; never throws, never stores.
 *  event: the click/key event that asked (must be trusted); geolocation: navigator.geolocation (injectable).
 */
export function geoFindMe(event, { geolocation = globalThis.navigator?.geolocation, allowed = { ok: false, reason: "not allowed" } } = {}) {
  if (!event || event.isTrusted !== true) return Promise.resolve({ ok: false, reason: "Find me runs only when you press it." });
  if (!allowed?.ok) return Promise.resolve({ ok: false, reason: allowed?.reason || "Find me is off here." });
  if (!geolocation?.getCurrentPosition) return Promise.resolve({ ok: false, reason: "This browser cannot share a location." });
  if (geoState.busy) return Promise.resolve({ ok: false, reason: "Still finding you…" });
  geoState.busy = true;
  return new Promise((resolve) => {
    geolocation.getCurrentPosition((pos) => {
      geoState.busy = false;
      const lon = Number(pos?.coords?.longitude), lat = Number(pos?.coords?.latitude);
      if (!Number.isFinite(lon) || !Number.isFinite(lat)) return resolve({ ok: false, reason: "No position came back." });
      geoState.here = [lon, lat];
      resolve({ ok: true, here: [lon, lat] });
    }, (err) => {
      geoState.busy = false;
      resolve({ ok: false, reason: err?.code === 1 ? "Location permission was not given; nothing was shared." : "Your location could not be found." });
    }, { enableHighAccuracy: false, timeout: 10000, maximumAge: 60000 });
  });
}

/** A distance for people: "inside this map", "3 km", "140 km". */
export function geoDistanceText(metres) {
  if (metres <= 0) return "you are inside it";
  return metres < 1000 ? `${Math.round(metres / 10) * 10} m away` : `${Math.round(metres / 1000)} km away`;
}

/**
 * The "Find me" block: a button, a status line, a Forget button. `allowed()` is asked at press time.
 * `onHere({ here, nearest, pin })` lets the page draw its pin; `hrefFor(map)` links the nearest map.
 */
export function geoMountFindMe({ el, maps, current, allowed, onHere = null, hrefFor = (m) => `?parish=${encodeURIComponent(m.id)}`, geolocation } = {}) {
  if (!el) return null;
  const doc = el.ownerDocument;
  el.textContent = "";
  const row = doc.createElement("div"); row.className = "row";
  const btn = doc.createElement("button"); btn.type = "button"; btn.className = "btn"; btn.id = "geo-find-me"; btn.textContent = "Find me";
  const forget = doc.createElement("button"); forget.type = "button"; forget.className = "btn"; forget.textContent = "Forget my location"; forget.hidden = true;
  const line = doc.createElement("p"); line.className = "note"; line.setAttribute("aria-live", "polite");
  const gate = allowed?.() ?? { ok: false, reason: "" };
  line.textContent = gate.ok ? "Shows the nearest map, and a pin when you are inside this one. Asked once, kept in memory only, never stored or sent." : gate.reason;
  btn.disabled = !gate.ok;
  row.append(btn, forget); el.append(row, line);
  btn.addEventListener("click", async (e) => {
    const r = await geoFindMe(e, { geolocation, allowed: allowed?.() });
    if (!r.ok) { line.textContent = r.reason; return; }
    const nearest = geoNearest(maps, r.here);
    const pin = current ? geoPinOn(current, r.here) : null;
    line.textContent = "";
    if (nearest) {
      const t = doc.createTextNode(pin ? "You are inside this map: the red pin marks you. " : `Nearest map: `);
      line.append(t);
      if (!pin) { const a = doc.createElement("a"); a.href = hrefFor(nearest.map); a.textContent = nearest.map.name ?? nearest.map.id; line.append(a, doc.createTextNode(` (${geoDistanceText(nearest.metres)}).`)); }
    }
    forget.hidden = false;
    onHere?.({ here: r.here, nearest, pin });
  });
  forget.addEventListener("click", () => { geoForget(); forget.hidden = true; line.textContent = "Forgotten. Nothing was stored."; onHere?.(null); });
  return { button: btn, forget, line };
}

// ------------------------------------------------------------------ baked backdrop (build time)

/**
 * Load a map's baked backdrop, trying each asset base in turn; resolves the loaded Image or null.
 * `Img` is injectable (the checker's stub); a missing file simply resolves null (the drawn map stays).
 */
export function geoLoadBackdrop(mapId, { Img = globalThis.Image, bases = GEO_ASSET_BASES } = {}) {
  if (!Img || !/^[a-z0-9-]{1,80}$/.test(String(mapId))) return Promise.resolve(null);
  return new Promise((resolve) => {
    let i = 0;
    const next = () => {
      if (i >= bases.length) return resolve(null);
      const img = new Img();
      img.onload = () => resolve(img);
      img.onerror = () => next();
      img.src = `${bases[i++]}${mapId}.jpg`;
    };
    next();
  });
}

// ------------------------------------------------------------------ live layer (runtime, optional)

function geoTileXY(lon, lat, z) {
  const n = 2 ** z, r = (lat * Math.PI) / 180;
  return [Math.floor(((lon + 180) / 360) * n), Math.floor(((1 - Math.log(Math.tan(r) + 1 / Math.cos(r)) / Math.PI) / 2) * n)];
}

/** The tiles covering a map's box for a source: `{ z, x0, y0, cols, rows, urls: [[url…]…] }`, at most `max` per side. Pure. */
export function geoLiveTiles(map, kind = "usgs", { max = 4, date = null } = {}) {
  const src = GEO_LIVE[kind];
  if (!src) return null;
  const b = npBounds(map);
  let z = src.maxZoom;
  for (; z > 1; z--) {
    const [x0, y0] = geoTileXY(b.minLon, b.maxLat, z), [x1, y1] = geoTileXY(b.maxLon, b.minLat, z);
    if (x1 - x0 + 1 <= max && y1 - y0 + 1 <= max) break;
  }
  const [x0, y0] = geoTileXY(b.minLon, b.maxLat, z), [x1, y1] = geoTileXY(b.maxLon, b.minLat, z);
  const day = date ?? new Date(Date.now() - 86400000).toISOString().slice(0, 10); // yesterday: today's pass may not be processed
  const urls = [];
  for (let y = y0; y <= y1; y++) urls.push(Array.from({ length: x1 - x0 + 1 }, (_, i) => src.tile.replace("{z}", z).replace("{x}", x0 + i).replace("{y}", y).replace("{date}", day)));
  return { z, x0, y0, cols: x1 - x0 + 1, rows: y1 - y0 + 1, urls, credit: src.credit, label: src.label };
}

/**
 * The live layer panel: two switches (USGS, NASA GIBS), off by default; nothing is requested until one is pressed.
 * A tile that fails (offline, blocked) leaves a note and the baked backdrop in place. Returns { show(kind|null), shown() }.
 */
export function geoMountLive({ el, map } = {}) {
  if (!el) return null;
  const doc = el.ownerDocument;
  el.textContent = "";
  const row = doc.createElement("div"); row.className = "row";
  const grid = doc.createElement("div"); grid.className = "geo-live-grid"; grid.hidden = true;
  const note = doc.createElement("p"); note.className = "note"; note.textContent = "Live satellite: off. Switch it on to fetch today's public imagery of this map's box in your browser.";
  let on = null;
  const buttons = {};
  function show(kind) {
    on = kind && GEO_LIVE[kind] ? kind : null;
    for (const [k, b] of Object.entries(buttons)) b.setAttribute("aria-pressed", String(k === on));
    grid.textContent = "";
    if (!on) { grid.hidden = true; note.textContent = "Live satellite: off."; return; }
    const t = geoLiveTiles(map, on);
    grid.hidden = false; grid.style.display = "grid"; grid.style.gridTemplateColumns = `repeat(${t.cols}, 1fr)`; grid.style.maxWidth = "512px";
    let failed = 0;
    note.textContent = `${t.label}, north up. ${t.credit}.`;
    for (const r of t.urls) for (const u of r) {
      const img = doc.createElement("img"); img.alt = ""; img.style.width = "100%"; img.style.display = "block"; img.referrerPolicy = "no-referrer";
      img.onerror = () => { failed++; img.style.visibility = "hidden"; note.textContent = `${t.label}: ${failed} tile(s) could not load (offline or blocked). The baked backdrop stays on the map.`; };
      img.src = u; grid.appendChild(img);
    }
  }
  for (const k of Object.keys(GEO_LIVE)) {
    const b = doc.createElement("button"); b.type = "button"; b.className = "btn"; b.dataset.geoLive = k; b.setAttribute("aria-pressed", "false");
    b.textContent = GEO_LIVE[k].label; b.addEventListener("click", () => show(on === k ? null : k)); buttons[k] = b; row.appendChild(b);
  }
  el.append(row, note, grid);
  return { show, shown: () => on };
}
