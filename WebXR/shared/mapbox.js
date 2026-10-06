// Mapbox under the Bay (docs/mapbox.md): the token lookup, the lazy library
// loader, a Mapbox GL map over the Bay World data (the Bay Atlas,
// WebXR/bayworld/atlas.html) and a satellite ground texture for Bay World
// itself. Positions come from shared/bay-geo.js's affine fit.
//
// The rules this module keeps, and tools/check_mapbox.mjs proves:
//
//   - No token ships. mapboxToken() reads `?mapbox=` on the launch URL (kept
//     for the tab in sessionStorage), then localStorage's
//     "smartciti.mapboxToken", then `mapboxToken` in the deployment's
//     auth-config.json (WebXR/auth-config.json, null out of the box). A
//     value that is not shaped like a Mapbox public token is dropped.
//   - No request to any Mapbox host, and no library load, without a token.
//     Every function here returns null (or resolves to null) before touching
//     the network when there is none.
//   - The library is never vendored: loadMapboxGl() inserts one <script>
//     for the cdnjs copy at runtime and injects the essential stylesheet
//     inline, so a static copy of these pages carries no third-party code
//     and loads none until a viewer supplies a token.
//   - No three.js import: bayGroundTexture() takes the three.js module the
//     caller already loaded, so this file bundles into the DOM-only Bay Atlas
//     without dragging a renderer in. Every absolute URL lives in the two
//     constants below.
import { bayToGeo, bayGeoBounds, bayGeoFit } from "./bay-geo.js";

/** The one library URL: Mapbox GL JS from cdnjs, pinned. */
export const MAPBOX_GL_URL = "https://cdnjs.cloudflare.com/ajax/libs/mapbox-gl/3.4.0/mapbox-gl.min.js";
/** The one Mapbox API URL: the Static Images endpoint for a satellite view. */
export const MAPBOX_STATIC_BASE = "https://api.mapbox.com/styles/v1/mapbox/satellite-v9/static";
/** The style the atlas map opens with (a `mapbox://` style id is not a host). */
export const MAPBOX_STYLE = "mapbox://styles/mapbox/dark-v11";
/** Where a token pasted into the atlas is kept, in this browser only. */
export const MAPBOX_TOKEN_KEY = "smartciti.mapboxToken";
/** The launch-URL parameter that carries a token for one tab. */
export const MAPBOX_URL_PARAM = "mapbox";

// A public token is "pk", a dot, then one or two base64url segments; nothing
// else (a secret "sk." token must never reach a page, so it is refused too).
const MB_TOKEN_RE = /^pk\.[A-Za-z0-9_-]{10,}(\.[A-Za-z0-9_-]{4,})?$/;

/** The token if it is shaped like a Mapbox public token, else null. */
export function cleanMapboxToken(v) {
  if (typeof v !== "string") return null;
  const t = v.trim();
  return t.length <= 512 && MB_TOKEN_RE.test(t) ? t : null;
}

// ------------------------------------------------------------------ storage

function mbStore(name) {
  try { const s = globalThis[name]; return s && typeof s.getItem === "function" ? s : null; } catch (_) { return null; }
}
function mbRead(store, key) { try { return store?.getItem(key) ?? null; } catch (_) { return null; } }
function mbWrite(store, key, value) {
  try { if (value == null) store?.removeItem?.(key); else store?.setItem?.(key, value); return true; } catch (_) { return false; }
}

/**
 * The token this page may use, or null: `?mapbox=` on the launch URL (then
 * remembered in sessionStorage for the tab), else sessionStorage, else
 * localStorage, else `config.mapboxToken` — the parsed auth-config.json a
 * caller already read with readMapboxConfig(). Synchronous and network-free;
 * `opts.search/session/local/config` override the browser's own for tests.
 */
export function mapboxToken(opts = {}) {
  const search = opts.search ?? (typeof location !== "undefined" ? location.search : "");
  const session = opts.session === undefined ? mbStore("sessionStorage") : opts.session;
  const local = opts.local === undefined ? mbStore("localStorage") : opts.local;
  let fromUrl = null;
  try { fromUrl = cleanMapboxToken(new URLSearchParams(search || "").get(MAPBOX_URL_PARAM)); } catch (_) { fromUrl = null; }
  if (fromUrl) { mbWrite(session, MAPBOX_TOKEN_KEY, fromUrl); return fromUrl; }
  return cleanMapboxToken(mbRead(session, MAPBOX_TOKEN_KEY))
    ?? cleanMapboxToken(mbRead(local, MAPBOX_TOKEN_KEY))
    ?? cleanMapboxToken(opts.config?.mapboxToken)
    ?? null;
}

/** Keep a pasted token in this browser (localStorage). Returns the cleaned
 *  token, or null (and stores nothing) when it is not a public token. */
export function rememberMapboxToken(token, opts = {}) {
  const local = opts.local === undefined ? mbStore("localStorage") : opts.local;
  const clean = cleanMapboxToken(token);
  if (clean) mbWrite(local, MAPBOX_TOKEN_KEY, clean);
  return clean;
}

/** Forget a remembered token, in both storages. */
export function forgetMapboxToken(opts = {}) {
  const local = opts.local === undefined ? mbStore("localStorage") : opts.local;
  const session = opts.session === undefined ? mbStore("sessionStorage") : opts.session;
  mbWrite(local, MAPBOX_TOKEN_KEY, null);
  mbWrite(session, MAPBOX_TOKEN_KEY, null);
  return true;
}

/**
 * Read the deployment's auth-config.json (same-origin, beside the page, the
 * same file shared/auth.js reads) for its `mapboxToken`. Resolves to
 * `{ mapboxToken }` (cleaned, possibly null) or null when the file is missing
 * or unreadable. Only runs in a browser (`location` exists) or with
 * `opts.fetch` supplied — never from a headless checker by accident.
 */
export async function readMapboxConfig(url = "../auth-config.json", opts = {}) {
  const f = opts.fetch ?? (typeof location !== "undefined" && typeof globalThis.fetch === "function" ? (...a) => globalThis.fetch(...a) : null);
  if (!f) return null;
  try {
    const res = await f(url, { cache: "no-cache" });
    if (!res?.ok) return null;
    const file = await res.json();
    return file && typeof file === "object" ? { mapboxToken: cleanMapboxToken(file.mapboxToken) } : null;
  } catch (_) { return null; }
}

// ------------------------------------------------------------------ library

/**
 * The essential part of Mapbox GL's stylesheet — the map canvas, markers,
 * popups and controls — injected inline by loadMapboxGl() so no external
 * stylesheet is ever linked. Icons the real sheet draws with data-URI images
 * are replaced by text glyphs; the attribution and wordmark stay visible, as
 * Mapbox's terms ask.
 */
export const MAPBOX_GL_CSS = `
.mapboxgl-map{position:relative;overflow:hidden;font:12px/20px system-ui,sans-serif;-webkit-tap-highlight-color:transparent}
.mapboxgl-canvas{position:absolute;left:0;top:0}
.mapboxgl-canvas-container.mapboxgl-interactive{cursor:grab}
.mapboxgl-canvas-container.mapboxgl-interactive:active{cursor:grabbing}
.mapboxgl-canvas-container.mapboxgl-touch-zoom-rotate,.mapboxgl-canvas-container.mapboxgl-touch-drag-pan{touch-action:none}
.mapboxgl-marker{position:absolute;top:0;left:0;will-change:transform;opacity:1;transition:opacity .2s}
.mapboxgl-popup{position:absolute;top:0;left:0;display:flex;will-change:transform;pointer-events:none;z-index:3}
.mapboxgl-popup-anchor-top,.mapboxgl-popup-anchor-top-left,.mapboxgl-popup-anchor-top-right{flex-direction:column}
.mapboxgl-popup-anchor-bottom,.mapboxgl-popup-anchor-bottom-left,.mapboxgl-popup-anchor-bottom-right{flex-direction:column-reverse}
.mapboxgl-popup-anchor-left{flex-direction:row}
.mapboxgl-popup-anchor-right{flex-direction:row-reverse}
.mapboxgl-popup-tip{width:0;height:0;border:10px solid transparent;z-index:1}
.mapboxgl-popup-anchor-top .mapboxgl-popup-tip{align-self:center;border-top:none;border-bottom-color:#0d1e2b}
.mapboxgl-popup-anchor-top-left .mapboxgl-popup-tip{align-self:flex-start;border-top:none;border-left:none;border-bottom-color:#0d1e2b}
.mapboxgl-popup-anchor-top-right .mapboxgl-popup-tip{align-self:flex-end;border-top:none;border-right:none;border-bottom-color:#0d1e2b}
.mapboxgl-popup-anchor-bottom .mapboxgl-popup-tip{align-self:center;border-bottom:none;border-top-color:#0d1e2b}
.mapboxgl-popup-anchor-bottom-left .mapboxgl-popup-tip{align-self:flex-start;border-bottom:none;border-left:none;border-top-color:#0d1e2b}
.mapboxgl-popup-anchor-bottom-right .mapboxgl-popup-tip{align-self:flex-end;border-bottom:none;border-right:none;border-top-color:#0d1e2b}
.mapboxgl-popup-anchor-left .mapboxgl-popup-tip{align-self:center;border-left:none;border-right-color:#0d1e2b}
.mapboxgl-popup-anchor-right .mapboxgl-popup-tip{align-self:center;border-right:none;border-left-color:#0d1e2b}
.mapboxgl-popup-content{position:relative;background:#0d1e2b;color:#eaf6ff;border:1px solid rgba(140,200,230,.4);border-radius:8px;box-shadow:0 8px 24px rgba(0,0,0,.45);padding:12px 14px;pointer-events:auto;max-width:280px;font-size:13px;line-height:1.45}
.mapboxgl-popup-content a{color:#4fd1ff}
.mapboxgl-popup-close-button{position:absolute;right:2px;top:0;border:0;border-radius:0 8px 0 0;background:transparent;color:#9cc0d6;cursor:pointer;font-size:16px;line-height:1;padding:4px 7px}
.mapboxgl-popup-close-button:hover{color:#fff}
.mapboxgl-ctrl-top-left,.mapboxgl-ctrl-top-right,.mapboxgl-ctrl-bottom-left,.mapboxgl-ctrl-bottom-right{position:absolute;pointer-events:none;z-index:2}
.mapboxgl-ctrl-top-left{top:0;left:0}.mapboxgl-ctrl-top-right{top:0;right:0}.mapboxgl-ctrl-bottom-left{bottom:0;left:0}.mapboxgl-ctrl-bottom-right{bottom:0;right:0}
.mapboxgl-ctrl{clear:both;pointer-events:auto;transform:translate(0)}
.mapboxgl-ctrl-top-left .mapboxgl-ctrl{margin:10px 0 0 10px;float:left}
.mapboxgl-ctrl-top-right .mapboxgl-ctrl{margin:10px 10px 0 0;float:right}
.mapboxgl-ctrl-bottom-left .mapboxgl-ctrl{margin:0 0 10px 10px;float:left}
.mapboxgl-ctrl-bottom-right .mapboxgl-ctrl{margin:0 10px 10px 0;float:right}
.mapboxgl-ctrl-group{background:#0d1e2b;border:1px solid rgba(140,200,230,.4);border-radius:6px;overflow:hidden}
.mapboxgl-ctrl-group button{width:30px;height:30px;display:block;padding:0;border:0;background:transparent;color:#eaf6ff;cursor:pointer;font:700 18px/30px system-ui,sans-serif}
.mapboxgl-ctrl-group button+button{border-top:1px solid rgba(140,200,230,.25)}
.mapboxgl-ctrl-group button:hover{background:rgba(79,209,255,.18)}
.mapboxgl-ctrl-group button:focus-visible{outline:2px solid #4fd1ff;outline-offset:-2px}
.mapboxgl-ctrl-icon{display:block;width:100%;height:100%}
.mapboxgl-ctrl-zoom-in .mapboxgl-ctrl-icon::before{content:"+"}
.mapboxgl-ctrl-zoom-out .mapboxgl-ctrl-icon::before{content:"\\2212"}
.mapboxgl-ctrl-compass .mapboxgl-ctrl-icon::before{content:"N";font-size:13px}
.mapboxgl-ctrl-attrib{padding:0 6px;background:rgba(6,14,22,.72);color:#9cc0d6;font-size:11px;line-height:18px;border-radius:4px}
.mapboxgl-ctrl-attrib a{color:#dcf1ff;text-decoration:none}
.mapboxgl-ctrl-attrib-button{display:none}
.mapboxgl-ctrl-logo{display:block;width:auto;height:18px;padding:0 6px;color:#dcf1ff;font:700 11px/18px system-ui,sans-serif;text-decoration:none;background:rgba(6,14,22,.72);border-radius:4px}
.mapboxgl-ctrl-logo::after{content:"Mapbox"}
.mb-pin{width:16px;height:16px;border-radius:50%;border:2px solid #0a1420;background:#f2c14b;padding:0;cursor:pointer;box-shadow:0 0 0 2px rgba(255,255,255,.35)}
.mb-pin.mb-pin-landmark{background:#a079ff;border-radius:3px;transform:rotate(45deg)}
.mb-pin:focus-visible{outline:2px solid #4fd1ff;outline-offset:2px}
.mb-chips{display:flex;flex-wrap:wrap;gap:4px;margin-top:6px}
.mb-chip{display:inline-block;padding:1px 7px;border-radius:999px;border:1px solid rgba(79,209,255,.45);background:rgba(79,209,255,.12);color:#dcf1ff;font-size:11.5px;text-decoration:none}
.mb-kind{color:#9cc0d6;font-size:12px;margin:1px 0 4px}
`;

let mbCssInjected = false;
/** Insert MAPBOX_GL_CSS into the document once. Returns whether it is there. */
export function injectMapboxCss(doc = globalThis.document) {
  if (mbCssInjected) return true;
  if (!doc?.createElement) return false;
  const style = doc.createElement("style");
  style.setAttribute?.("data-mapbox-gl-css", "inline");
  style.textContent = MAPBOX_GL_CSS;
  (doc.head ?? doc.body ?? doc.documentElement)?.appendChild?.(style);
  mbCssInjected = true;
  return true;
}

function mbInsertScript(url, done, doc = globalThis.document) {
  if (!doc?.createElement) { done(false); return; }
  const s = doc.createElement("script");
  s.src = url; s.async = true; s.crossOrigin = "anonymous";
  s.onload = () => done(true);
  s.onerror = () => done(false);
  (doc.head ?? doc.body ?? doc.documentElement).appendChild(s);
}

let mbGlPending = null;
/** Forget a finished or failed load so the next loadMapboxGl() inserts the
 *  script again — a test seam (tools/check_mapbox.mjs runs several loader
 *  scenarios in one process); a page never needs it. */
export function resetMapboxGlLoader() { mbGlPending = null; mbCssInjected = false; }

/**
 * Lazily load Mapbox GL JS from cdnjs — one <script>, inserted once — and
 * inject the stylesheet above. Resolves to the `mapboxgl` global, or null:
 * without a token (nothing is inserted at all), when the insertion fails
 * (blocked host, offline), or when the script loaded but defined nothing.
 * `opts.insert(url, done, doc)` replaces the DOM insertion for tests and
 * for a host that wants to load the library its own way.
 */
export function loadMapboxGl(opts = {}) {
  const token = opts.token ?? mapboxToken();
  if (!token) return Promise.resolve(null);
  const g = globalThis;
  if (g.mapboxgl?.Map) { injectMapboxCss(opts.doc); return Promise.resolve(g.mapboxgl); }
  if (!mbGlPending) {
    mbGlPending = new Promise((resolve) => {
      let settled = false;
      const done = (ok) => {
        if (settled) return;
        settled = true;
        const lib = ok && g.mapboxgl?.Map ? g.mapboxgl : null;
        if (!lib) mbGlPending = null; // a later call may try again (a token pasted after a failure)
        resolve(lib);
      };
      try { (opts.insert ?? mbInsertScript)(MAPBOX_GL_URL, done, opts.doc); } catch (_) { done(false); }
    }).then((lib) => { if (lib) injectMapboxCss(opts.doc); return lib; });
  }
  return mbGlPending;
}

// ---------------------------------------------------------------------- map

function mbEscape(s) {
  return String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}
function mbHex(n) { return `#${((typeof n === "number" ? n : 0x4fd1ff) & 0xffffff).toString(16).padStart(6, "0")}`; }
function mbCentre(zone) { return zone.centre ?? zone.center ?? [0, 0]; }
function mbPosition(item) {
  const p = item.position ?? [0, 0];
  return p.length === 3 ? [p[0], p[2]] : [p[0], p[1]];
}

/** A zone's circle, as a closed lon/lat ring: points around the centre in
 *  Bay metres, each through bayToGeo(), so the ring is the exact affine
 *  image of the circle (an ellipse on the map when the fit is anisotropic —
 *  which is the truth of it, not an artefact). */
export function mapboxZoneRing(zone, steps = 48) {
  const [cx, cz] = mbCentre(zone), r = zone.radius ?? 100;
  const ring = [];
  for (let i = 0; i <= steps; i++) {
    const a = (i / steps) * Math.PI * 2;
    ring.push(bayToGeo([cx + Math.cos(a) * r, cz + Math.sin(a) * r]));
  }
  return ring;
}

/** The default popup: name, zone and kind, blurb, and one chip per
 *  programme. A caller with real links passes `renderPopup` instead. */
export function mapboxDefaultPopup(item, kind, zoneName = "") {
  const chips = (item.programmes ?? []).map((p) => `<span class="mb-chip">${mbEscape(p.replace(/-/g, " "))}</span>`).join("");
  return `<b>${mbEscape(item.name)}</b><div class="mb-kind">${mbEscape(zoneName || item.zone || "")}${kind ? ` · ${mbEscape(kind)}` : ""}</div>`
    + (item.blurb ? `<div>${mbEscape(item.blurb)}</div>` : "")
    + (chips ? `<div class="mb-chips">${chips}</div>` : "");
}

/**
 * A Mapbox GL map over the Bay: fitted to bayGeoBounds(), a marker per site
 * and per landmark placed by bay-geo, a translucent circle per zone in its
 * own accent, and a popup per marker (programme chips by default, or
 * `opts.renderPopup(item, kind)`'s HTML). `opts.onSelect(item, kind)` fires
 * when a marker is clicked. Resolves to `{ map, markers, destroy }`, or to
 * null — without a token before anything is requested, or when the library
 * could not be loaded. `opts.mapboxgl` and `opts.insert` are the test seams.
 */
export async function createBayMap(container, opts = {}) {
  const token = opts.token ?? mapboxToken();
  if (!token || !container) return null;
  const gl = opts.mapboxgl ?? await loadMapboxGl({ token, insert: opts.insert, doc: opts.doc });
  if (!gl?.Map) return null;
  gl.accessToken = token;
  const b = bayGeoBounds();
  const map = new gl.Map({
    container, style: opts.style ?? MAPBOX_STYLE,
    bounds: [[b.minLon, b.minLat], [b.maxLon, b.maxLat]], fitBoundsOptions: { padding: 28 },
    attributionControl: true, cooperativeGestures: false,
  });
  if (gl.NavigationControl) map.addControl(new gl.NavigationControl({ visualizePitch: false }), "top-right");

  const zones = opts.zones ?? [], landmarks = opts.landmarks ?? [], sites = opts.sites ?? [];
  const zoneName = (id) => zones.find((z) => z.id === id)?.name ?? id ?? "";
  const doc = opts.doc ?? globalThis.document;
  const markers = [];
  const place = (item, kind) => {
    const el = doc?.createElement?.("button");
    if (!el) return;
    el.className = `mb-pin mb-pin-${kind}`;
    el.type = "button";
    el.setAttribute?.("aria-label", `${item.name} (${kind})`);
    el.title = item.name;
    el.addEventListener?.("click", () => opts.onSelect?.(item, kind));
    const html = opts.renderPopup ? opts.renderPopup(item, kind) : mapboxDefaultPopup(item, kind, zoneName(item.zone));
    const popup = gl.Popup ? new gl.Popup({ offset: 14, maxWidth: "280px" }).setHTML(html) : null;
    const marker = new gl.Marker({ element: el, anchor: "center" }).setLngLat(bayToGeo(mbPosition(item)));
    if (popup) marker.setPopup(popup);
    marker.addTo(map);
    markers.push({ marker, item, kind });
  };
  for (const l of landmarks) place(l, "landmark");
  for (const s of sites) place(s, "site");

  const features = zones.map((z) => ({
    type: "Feature",
    properties: { id: z.id, name: z.name, color: mbHex(z.palette?.accent ?? z.color) },
    geometry: { type: "Polygon", coordinates: [mapboxZoneRing(z)] },
  }));
  const addZones = () => {
    if (!features.length || map.getSource?.("bay-zones")) return;
    map.addSource("bay-zones", { type: "geojson", data: { type: "FeatureCollection", features } });
    map.addLayer({ id: "bay-zones-fill", type: "fill", source: "bay-zones", paint: { "fill-color": ["get", "color"], "fill-opacity": 0.14 } });
    map.addLayer({ id: "bay-zones-line", type: "line", source: "bay-zones", paint: { "line-color": ["get", "color"], "line-width": 1.5, "line-opacity": 0.7 } });
  };
  if (map.isStyleLoaded?.()) addZones(); else map.on("load", addZones);

  return {
    map, markers,
    destroy() { for (const m of markers) m.marker.remove?.(); map.remove?.(); },
  };
}

// ------------------------------------------------------------------- ground

function mbMercatorY(latDeg) { const phi = (latDeg * Math.PI) / 180; return Math.log(Math.tan(Math.PI / 4 + phi / 2)); }

/** The static image's pixel size: the widest the endpoint allows on the
 *  long side, the short side in the bounds' own Web Mercator aspect, so the
 *  image is the box and nothing more (the endpoint fits the box inside the
 *  requested frame, so a mismatched aspect would pad one axis). */
export function bayStaticImageSize(longSide = 1280) {
  const b = bayGeoBounds();
  const dx = ((b.maxLon - b.minLon) * Math.PI) / 180;
  const dy = mbMercatorY(b.maxLat) - mbMercatorY(b.minLat);
  const aspect = dx / dy;
  const side = Math.max(1, Math.min(1280, Math.round(longSide)));
  return aspect >= 1
    ? { width: side, height: Math.max(1, Math.round(side / aspect)) }
    : { width: Math.max(1, Math.round(side * aspect)), height: side };
}

/** The Static Images URL for a satellite view of bayGeoBounds(). Pure — it
 *  builds a string and requests nothing; the token is required so no URL
 *  without one can exist. */
export function bayStaticImageUrl(token, opts = {}) {
  const clean = cleanMapboxToken(token);
  if (!clean) return null;
  const b = bayGeoBounds();
  const { width, height } = bayStaticImageSize(opts.longSide);
  const box = [b.minLon, b.minLat, b.maxLon, b.maxLat].map((v) => v.toFixed(6)).join(",");
  return `${MAPBOX_STATIC_BASE}/[${box}]/${width}x${height}${opts.retina ? "@2x" : ""}?access_token=${encodeURIComponent(clean)}`;
}

/**
 * The 3×3 uv transform (row-major, nine numbers for a three.js Matrix3's
 * set()) that maps a Bay World ground plane's own uv square onto the static
 * image of bayGeoBounds(). The plane is shared/bayworld.js's bwTerrain():
 * a PlaneGeometry `w` by `d` centred at (cx, cz) and rotated flat, so its
 * u runs +x and its v runs −z. Composed affine → affine → affine, so the
 * texture lands exactly where the fit says the ground is, rotation and all.
 */
export function bayGroundUvMatrix({ cx = 0, cz = 0, w, d } = {}) {
  const fit = bayGeoFit();
  const b = bayGeoBounds();
  const dLon = b.maxLon - b.minLon || 1, dLat = b.maxLat - b.minLat || 1;
  const [a, bb, c] = fit.lon, [dd, e, f] = fit.lat;
  // x = cx − w/2 + u·w ; z = cz + d/2 − v·d
  const x0 = cx - w / 2, z0 = cz + d / 2;
  const s0 = (a * x0 + bb * z0 + c - b.minLon) / dLon, su = (a * w) / dLon, sv = (-bb * d) / dLon;
  const t0 = (dd * x0 + e * z0 + f - b.minLat) / dLat, tu = (dd * w) / dLat, tv = (-e * d) / dLat;
  return [su, sv, s0, tu, tv, t0, 0, 0, 1];
}

/**
 * A satellite image of bayGeoBounds() as a texture for the Bay World ground,
 * via `three.TextureLoader`. Returns null synchronously when there is no
 * token (nothing is requested), else a promise that resolves to the texture,
 * or to null if the image could not load — the caller keeps the procedural
 * ground either way. `three` is the three.js module the caller already has.
 */
export function bayGroundTexture(three, opts = {}) {
  const token = opts.token ?? mapboxToken();
  if (!token || typeof three?.TextureLoader !== "function") return null;
  const url = bayStaticImageUrl(token, opts);
  if (!url) return null;
  return new Promise((resolve) => {
    try {
      const loader = new three.TextureLoader();
      loader.setCrossOrigin?.("anonymous");
      loader.load(url, (tex) => {
        if (tex) {
          if (three.SRGBColorSpace) tex.colorSpace = three.SRGBColorSpace;
          if (three.ClampToEdgeWrapping !== undefined) { tex.wrapS = three.ClampToEdgeWrapping; tex.wrapT = three.ClampToEdgeWrapping; }
          tex.anisotropy = opts.anisotropy ?? 4;
          tex.needsUpdate = true;
        }
        resolve(tex ?? null);
      }, undefined, () => resolve(null));
    } catch (_) { resolve(null); }
  });
}
