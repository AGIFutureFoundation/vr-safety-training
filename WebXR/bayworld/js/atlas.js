// The Bay Atlas (docs/mapbox.md): every Bay World site and landmark as a
// list with programme chips and deep links, over a map — Mapbox GL when a
// viewer has configured a token (shared/mapbox.js), otherwise an SVG map
// drawn straight from shared/bayworld-data.js (zones, roads, sites,
// landmarks), so the page is fully useful with no token and no network.
//
// Everything that renders is a pure function of the data (atlasSvg(),
// atlasListHtml(), atlasPopupHtml(), atlasDeepLinks()) so
// tools/check_mapbox.mjs can render the page headlessly against a stub
// document and count one marker per site; atlasMount() is the only part
// that touches a DOM, and it takes the document as an argument.
//
// Names here are prefixed `atlas`/`ATLAS_` because tools/bundle_webxr.py
// concatenates this file with shared/bayworld-data.js, bay-geo.js and
// mapbox.js into one scope.
import { BAY_BOUNDS, BAY_ZONES, BAY_LANDMARKS, BAY_ROADS, BAY_SITES } from "../../shared/bayworld-data.js";
import { ctlMount } from "../../shared/controls.js";
import { gdMount } from "../../shared/guide.js";
import { bayToGeo } from "../../shared/bay-geo.js";
import {
  mapboxToken, rememberMapboxToken, forgetMapboxToken, readMapboxConfig, createBayMap,
} from "../../shared/mapbox.js";

/** Where the deep links go, relative to this page's own folder
 *  (WebXR/bayworld/). tools/bundle_webxr.py rewrites both for its dist
 *  layouts, the same way it does Bay World's own mission link. */
export const ATLAS_LINKS = {
  bayworld: "../bayworld/index.html",
  smartcity: "../smartcity/dist/smartcity-x.html",
};

/** The SVG map's drawing size; the viewBox, not the on-screen size. */
export const ATLAS_SVG_SIZE = { width: 800, height: 550 };

function atlasEsc(s) {
  return String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}
function atlasHex(n) { return `#${((typeof n === "number" ? n : 0x4fd1ff) & 0xffffff).toString(16).padStart(6, "0")}`; }
function atlasPretty(id) { return String(id ?? "").replace(/-/g, " "); }

/** World (x, z) → SVG pixel, y-down (Bay World's +z is its south). */
export function atlasProject(x, z, size = ATLAS_SVG_SIZE) {
  const w = BAY_BOUNDS.maxX - BAY_BOUNDS.minX, h = BAY_BOUNDS.maxZ - BAY_BOUNDS.minZ;
  return { x: ((x - BAY_BOUNDS.minX) / w) * size.width, y: ((z - BAY_BOUNDS.minZ) / h) * size.height };
}

/**
 * Every site, then every landmark, as one flat list: `{ kind, id, name,
 * zone, zoneName, accent, position:[x,z], programmes, stations, blurb,
 * lonLat }`. Sites first because they are what a learner launches from.
 */
export function atlasPlaces() {
  const zoneOf = (id) => BAY_ZONES.find((z) => z.id === id);
  const shape = (item, kind) => {
    const zone = zoneOf(item.zone);
    return {
      kind, id: item.id, name: item.name, zone: item.zone, zoneName: zone?.name ?? item.zone,
      accent: atlasHex(zone?.palette?.accent), position: item.position,
      programmes: item.programmes ?? [], stations: item.stations ?? [], blurb: item.blurb ?? "",
      lonLat: bayToGeo(item.position),
    };
  };
  return [...BAY_SITES.map((s) => shape(s, "site")), ...BAY_LANDMARKS.map((l) => shape(l, "landmark"))];
}

/**
 * The deep links for one place: `bayworld` opens Bay World at it
 * (`?site=` or `?landmark=`), `station` launches its first training station
 * in SmartCiti.X (`?sim=`), null when it has none, and `programmes` is one
 * `{ id, href }` per programme (`?programme=`).
 */
export function atlasDeepLinks(place) {
  const enc = encodeURIComponent;
  return {
    bayworld: `${ATLAS_LINKS.bayworld}?${place.kind === "landmark" ? "landmark" : "site"}=${enc(place.id)}`,
    station: place.stations?.[0] ? `${ATLAS_LINKS.smartcity}?sim=${enc(place.stations[0])}&from=atlas` : null,
    programmes: (place.programmes ?? []).map((id) => ({ id, href: `${ATLAS_LINKS.smartcity}?programme=${enc(id)}` })),
  };
}

/** The programme chips for a place, as anchors (or an "no programme" note). */
export function atlasChipsHtml(place) {
  const links = atlasDeepLinks(place);
  if (!links.programmes.length) return place.kind === "site" ? '<span class="atlas-none">No training programme posted here yet.</span>' : "";
  return `<div class="atlas-chips">${links.programmes.map((p) => `<a class="chip" href="${atlasEsc(p.href)}" data-programme="${atlasEsc(p.id)}">${atlasEsc(atlasPretty(p.id))}</a>`).join("")}</div>`;
}

/** The popup / detail card for a place: name, zone and kind, blurb, chips,
 *  and the two deep links. Shared by the SVG detail panel and the Mapbox
 *  popups, so both modes say the same thing. */
export function atlasPopupHtml(place) {
  const links = atlasDeepLinks(place);
  const actions = [`<a class="atlas-go" href="${atlasEsc(links.bayworld)}">Open in Bay World</a>`];
  if (links.station) actions.push(`<a class="atlas-go" href="${atlasEsc(links.station)}">Launch ${atlasEsc(atlasPretty(place.stations[0]))}</a>`);
  return `<b class="atlas-name">${atlasEsc(place.name)}</b>`
    + `<div class="mb-kind atlas-kind">${atlasEsc(place.zoneName)} · ${place.kind}</div>`
    + (place.blurb ? `<p class="atlas-blurb">${atlasEsc(place.blurb)}</p>` : "")
    + atlasChipsHtml(place)
    + `<div class="atlas-actions">${actions.join("")}</div>`;
}

/** The places whose name, id, zone, programme or station contains `query`
 *  (case-insensitive); all of them for an empty query. */
export function atlasFilter(places, query = "") {
  const q = String(query ?? "").trim().toLowerCase();
  if (!q) return places;
  return places.filter((p) => [p.name, p.id, p.zoneName, p.zone, p.kind, ...p.programmes, ...p.stations].some((s) => String(s).toLowerCase().includes(q)));
}

/** One row per place: name, zone, chips, deep links. `data-place` carries
 *  the id so the map can highlight the row. */
export function atlasListHtml(places) {
  if (!places.length) return '<p class="atlas-none">Nothing matches that.</p>';
  return places.map((p) => {
    const links = atlasDeepLinks(p);
    return `<article class="atlas-row atlas-row-${p.kind}" data-place="${atlasEsc(p.id)}" data-kind="${p.kind}" style="--accent:${p.accent}">
  <h3>${atlasEsc(p.name)}</h3>
  <p class="atlas-kind">${atlasEsc(p.zoneName)} · ${p.kind}${p.stations.length ? ` · ${p.stations.length} station${p.stations.length === 1 ? "" : "s"}` : ""}</p>
  ${atlasChipsHtml(p)}
  <p class="atlas-links"><a href="${atlasEsc(links.bayworld)}">Open in Bay World</a>${links.station ? ` · <a href="${atlasEsc(links.station)}">Launch a station</a>` : ""}</p>
</article>`;
  }).join("\n");
}

/**
 * The fallback map: an SVG drawn from the data alone — zone circles in
 * their accents, roads by lane count, a diamond per landmark and a circle
 * per site (`data-site="<id>"`, one each, focusable), with a scale bar.
 * Returns markup; nothing here reads a DOM.
 */
export function atlasSvg(opts = {}) {
  const size = opts.size ?? ATLAS_SVG_SIZE;
  const scale = size.width / (BAY_BOUNDS.maxX - BAY_BOUNDS.minX);
  const out = [];
  out.push(`<svg class="atlas-svg" viewBox="0 0 ${size.width} ${size.height}" role="img" aria-label="Bay World: ${BAY_ZONES.length} zones, ${BAY_SITES.length} training sites and ${BAY_LANDMARKS.length} landmarks, drawn from the world's own data" xmlns="http://www.w3.org/2000/svg">`);
  out.push(`<rect width="${size.width}" height="${size.height}" fill="#0a1420"/>`);
  out.push('<g class="atlas-zones">');
  for (const z of BAY_ZONES) {
    const c = atlasProject(z.centre[0], z.centre[1], size), accent = atlasHex(z.palette?.accent);
    out.push(`<circle cx="${c.x.toFixed(1)}" cy="${c.y.toFixed(1)}" r="${(z.radius * scale).toFixed(1)}" fill="${accent}" fill-opacity="0.13" stroke="${accent}" stroke-opacity="0.45" stroke-width="1"/>`);
    out.push(`<text x="${c.x.toFixed(1)}" y="${(c.y - z.radius * scale + 14).toFixed(1)}" text-anchor="middle" fill="#9fc3d8" font-size="11" font-family="system-ui, sans-serif">${atlasEsc(z.name)}</text>`);
  }
  out.push("</g>");
  out.push('<g class="atlas-roads" fill="none" stroke="#4a5a68" stroke-linecap="round" stroke-linejoin="round">');
  for (const r of BAY_ROADS) {
    const pts = r.points.map(([x, z]) => { const p = atlasProject(x, z, size); return `${p.x.toFixed(1)},${p.y.toFixed(1)}`; }).join(" ");
    out.push(`<polyline points="${pts}" stroke-width="${(r.lanes * 0.8).toFixed(1)}" data-road="${atlasEsc(r.id)}"><title>${atlasEsc(r.name)}</title></polyline>`);
  }
  out.push("</g>");
  out.push('<g class="atlas-landmarks">');
  for (const l of BAY_LANDMARKS) {
    const p = atlasProject(l.position[0], l.position[1], size);
    out.push(`<path d="M${p.x.toFixed(1)} ${(p.y - 6).toFixed(1)} l6 6 l-6 6 l-6 -6 z" fill="#a079ff" stroke="#0a1420" stroke-width="1.2" class="atlas-landmark" data-landmark="${atlasEsc(l.id)}" tabindex="0" role="button" aria-label="${atlasEsc(l.name)}, landmark"><title>${atlasEsc(l.name)}</title></path>`);
  }
  out.push("</g>");
  out.push('<g class="atlas-sites">');
  for (const s of BAY_SITES) {
    const p = atlasProject(s.position[0], s.position[1], size);
    out.push(`<circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="6" fill="#f2c14b" stroke="#0a1420" stroke-width="1.5" class="atlas-site" data-site="${atlasEsc(s.id)}" tabindex="0" role="button" aria-label="${atlasEsc(s.name)}, training site"><title>${atlasEsc(s.name)}</title></circle>`);
  }
  out.push("</g>");
  const bar = 200 * scale;
  out.push(`<g class="atlas-scale" transform="translate(16 ${size.height - 18})"><rect width="${bar.toFixed(1)}" height="4" fill="#dfe6ec"/><text x="${(bar / 2).toFixed(1)}" y="-4" text-anchor="middle" fill="#9fc3d8" font-size="10" font-family="system-ui, sans-serif">200 m</text></g>`);
  out.push(`<text x="${size.width - 14}" y="${size.height - 12}" text-anchor="end" fill="#628aa0" font-size="10" font-family="system-ui, sans-serif">Bay World · built-in map</text>`);
  out.push("</svg>");
  return out.join("\n");
}

// -------------------------------------------------------------------- mount

/**
 * Wire the page. `doc` is the document (a stub in the checker); `opts` are
 * the test seams: `search/session/local/config/readConfig/fetch` for the
 * token lookup, `mapboxgl/insert` for the map. Draws the SVG map and the
 * list at once, then — only if a token turns up — tries Mapbox and swaps
 * the SVG out on success. Returns `{ mode, places, ready }`, `ready`
 * resolving once the token lookup (and any map attempt) has settled.
 */
export function atlasMount(doc = globalThis.document, opts = {}) {
  const $ = (id) => doc?.getElementById?.(id) ?? null;
  const places = atlasPlaces();
  const state = { mode: "svg", places, hasToken: false, map: null, ready: null };
  const mapEl = $("atlas-map"), listEl = $("atlas-list"), modeEl = $("atlas-mode"), statusEl = $("atlas-status");
  const detailEl = $("atlas-detail"), countEl = $("atlas-count"), tokenIn = $("atlas-token"), tokenState = $("atlas-token-state");
  const say = (el, text) => { if (el) el.textContent = text; };
  const storage = { search: opts.search, session: opts.session, local: opts.local };

  const drawSvg = () => {
    if (mapEl) { mapEl.innerHTML = atlasSvg(); mapEl.classList?.remove?.("atlas-map-live"); }
    state.mode = "svg"; state.map = null;
    say(modeEl, "Built-in map");
  };
  const drawList = (query) => {
    const shown = atlasFilter(places, query);
    if (listEl) listEl.innerHTML = atlasListHtml(shown);
    const sites = shown.filter((p) => p.kind === "site").length, landmarks = shown.length - sites;
    say(countEl, `${sites} site${sites === 1 ? "" : "s"} · ${landmarks} landmark${landmarks === 1 ? "" : "s"}`);
  };
  const select = (place) => {
    if (!place) return;
    if (detailEl) { detailEl.innerHTML = atlasPopupHtml(place); detailEl.hidden = false; }
    const rows = listEl?.querySelectorAll?.("[data-place]") ?? [];
    for (const row of rows) {
      const on = row.getAttribute?.("data-place") === place.id;
      row.classList?.toggle?.("atlas-row-on", on);
      if (on) row.scrollIntoView?.({ block: "nearest", behavior: "smooth" });
    }
  };
  const byId = (kind, id) => places.find((p) => p.kind === kind && p.id === id) ?? null;

  drawSvg();
  drawList("");
  say(statusEl, "Drawn from Bay World's own data. Paste a Mapbox public token to see the same places over a real-world map.");

  $("atlas-search")?.addEventListener?.("input", (e) => drawList(e?.target?.value ?? ""));
  mapEl?.addEventListener?.("click", (e) => {
    const hit = e?.target?.closest?.("[data-site],[data-landmark]");
    if (!hit) return;
    const site = hit.getAttribute("data-site"), landmark = hit.getAttribute("data-landmark");
    select(site ? byId("site", site) : byId("landmark", landmark));
  });
  mapEl?.addEventListener?.("keydown", (e) => {
    if (e?.key !== "Enter" && e?.key !== " ") return;
    const hit = e.target?.closest?.("[data-site],[data-landmark]");
    if (!hit) return;
    e.preventDefault?.();
    const site = hit.getAttribute("data-site"), landmark = hit.getAttribute("data-landmark");
    select(site ? byId("site", site) : byId("landmark", landmark));
  });
  listEl?.addEventListener?.("click", (e) => {
    if (e?.target?.closest?.("a")) return;
    const row = e?.target?.closest?.("[data-place]");
    if (row) select(byId(row.getAttribute("data-kind"), row.getAttribute("data-place")));
  });

  const tryMapbox = async (token) => {
    if (!mapEl || !token) return false;
    say(statusEl, "Loading the Mapbox map…");
    mapEl.innerHTML = "";
    mapEl.classList?.add?.("atlas-map-live");
    const handle = await createBayMap(mapEl, {
      token, zones: BAY_ZONES, landmarks: BAY_LANDMARKS, sites: BAY_SITES, doc,
      renderPopup: (item, kind) => atlasPopupHtml(byId(kind, item.id) ?? { ...item, kind, zoneName: item.zone }),
      onSelect: (item, kind) => select(byId(kind, item.id)),
      mapboxgl: opts.mapboxgl, insert: opts.insert,
    });
    if (!handle) {
      drawSvg();
      say(statusEl, "The Mapbox library or its tiles could not be loaded here (blocked host, offline or a token the map refused) — showing the built-in map instead. See docs/mapbox.md for where Mapbox mode works.");
      return false;
    }
    state.map = handle; state.mode = "mapbox";
    say(modeEl, "Mapbox");
    say(statusEl, "Real-world map: the same sites and landmarks, placed by an approximate fit. Click a marker for its programmes and links.");
    return true;
  };

  $("atlas-token-save")?.addEventListener?.("click", async () => {
    const clean = rememberMapboxToken(tokenIn?.value, storage);
    if (!clean) { say(tokenState, "That is not shaped like a Mapbox public token (they begin with pk.). Nothing was stored."); return; }
    if (tokenIn) tokenIn.value = "";
    state.hasToken = true;
    say(tokenState, "Token kept in this browser only (localStorage). It is sent to Mapbox with each map request and nowhere else.");
    await tryMapbox(clean);
  });
  $("atlas-token-clear")?.addEventListener?.("click", () => {
    forgetMapboxToken(storage);
    state.map?.destroy?.();
    state.hasToken = false;
    drawSvg();
    say(tokenState, "Token forgotten. The built-in map is showing.");
    say(statusEl, "Drawn from Bay World's own data.");
  });

  state.ready = (async () => {
    const config = opts.config ?? (opts.readConfig === false ? null : await readMapboxConfig("../auth-config.json", { fetch: opts.fetch }));
    const token = mapboxToken({ ...storage, config });
    state.hasToken = !!token;
    say(tokenState, token
      ? "A token is configured for this browser (the launch URL, this browser's storage or the deployment's auth-config.json)."
      : "No token configured — the built-in map is showing, and nothing has been sent to Mapbox.");
    if (token) await tryMapbox(token);
    return state;
  })();
  return state;
}

// The real page has a document with getElementById; the headless checker's
// stub document does not, and calls atlasMount() itself with its own.
if (typeof document !== "undefined" && typeof document.getElementById === "function") atlasMount(document);

// The shared control grammar and help overlay (shared/controls.js, docs/ui-review.md).
// The Guide (shared/guide.js): the floating help button and its question panel.
gdMount();
ctlMount({
  world: "the Atlas",
  except: { move: "Drag or arrow keys pan the map.", look: "Scroll or pinch to zoom.", interact: "Enter on a site opens it.", map: "This page is the map.", view: "—", quality: "—" },
});
