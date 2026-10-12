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
import { BAY_BOUNDS, BAY_ZONES, BAY_LANDMARKS, BAY_ROADS, BAY_SITES, CT_BAY_LAYERS, CT_BAY_ASSETS, CT_BAY_ASSET_KINDS, CT_BAY_WILDLIFE, ctProgrammeColour } from "../../shared/bayworld-data.js";
// Sierra Summit's pure data (no three.js), for the Atlas's second section: a
// mountain world has no real-world fit, so its map is always the built-in one.
import { SM_BOUNDS, SM_SIZE, SM_ZONES, SM_SITES, SM_LANDMARKS, SM_PASS_ROAD, SM_SERVICE_ROAD, SM_RIVER, SM_LAKE, SM_GONDOLA, SM_TRANSMISSION, SM_TRAILS, SM_TREELINE, SM_SNOWLINE, SM_SCREE, smHeightAt, smInLake, smZoneAt } from "../../shared/summit-data.js";
import { ctlMount } from "../../shared/controls.js";
import { gdMount } from "../../shared/guide.js";
import { cnMount } from "../../shared/cinema.js";
import { bayToGeo } from "../../shared/bay-geo.js";
import { lkStationLink } from "../../shared/links.js";
import { mapboxToken, rememberMapboxToken, forgetMapboxToken, readMapboxConfig, createBayMap } from "../../shared/mapbox.js";

/** Where the deep links go, relative to this page's own folder
 *  (WebXR/bayworld/). tools/bundle_webxr.py rewrites both for its dist
 *  layouts, the same way it does Bay World's own mission link. */
export const ATLAS_LINKS = {
  bayworld: "../bayworld/index.html",
  smartcity: "../smartcity/dist/smartcity-x.html",
  trades: "../trades/index.html",
  // The programme track pages (tools/gen_tracks.mjs) live in the flat build's
  // tracks/ folder; tools/bundle_webxr.py rewrites this to "./tracks/" there.
  tracks: "../dist/tracks/",
  // Sierra Summit opens at a site or landmark with ?site=<id> (its app resolves both).
  summit: "../summit/index.html",
  // The San Francisco districts on the parish engine (GOLDEN-B): the Bay Bridge's way back lands in Downtown.
  parishes: "../parishes/parishes.html",
};

/** The way back across the Bay Bridge (shared/sg-ways.js SG_WAY_BACK; atlas.html and Bay World's map carry the same link). */
export const ATLAS_WAY_BACK = { label: "The Bay Bridge back to San Francisco", href: `${ATLAS_LINKS.parishes}?parish=sf-downtown`, connector: "sf-bay-bridge" };

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
 * `{ id, href }` per programme (its track page, tracks/<id>.html).
 */
export function atlasDeepLinks(place) {
  const enc = encodeURIComponent;
  return {
    bayworld: `${ATLAS_LINKS.bayworld}?${place.kind === "landmark" ? "landmark" : "site"}=${enc(place.id)}`,
    // A Trade Skills room opens in the Trade Skills app (shared/links.js).
    station: place.stations?.[0] ? lkStationLink(place.stations[0], { runner: ATLAS_LINKS.smartcity, trades: ATLAS_LINKS.trades, from: "atlas" }) : null,
    // A programme chip opens the programme's own track page, not SmartCiti.X.
    programmes: (place.programmes ?? []).map((id) => ({ id, href: `${ATLAS_LINKS.tracks}${enc(id)}.html` })),
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
  // The layer toggles (CT_BAY_LAYERS): a layer that is off is left out of the markup.
  const on = { ...Object.fromEntries(CT_BAY_LAYERS.map((l) => [l.id, l.on])), ...(opts.layers ?? {}) };
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
  if (on.roads) out.push('<g class="atlas-roads atlas-layer" data-layer="roads" fill="none" stroke="#4a5a68" stroke-linecap="round" stroke-linejoin="round">');
  for (const r of on.roads ? BAY_ROADS : []) {
    const pts = r.points.map(([x, z]) => { const p = atlasProject(x, z, size); return `${p.x.toFixed(1)},${p.y.toFixed(1)}`; }).join(" ");
    out.push(`<polyline points="${pts}" stroke-width="${(r.lanes * 0.8).toFixed(1)}" data-road="${atlasEsc(r.id)}"><title>${atlasEsc(r.name)}</title></polyline>`);
  }
  if (on.roads) out.push("</g>");
  if (on.wildlife) {
    out.push('<g class="atlas-layer" data-layer="wildlife" fill="none" stroke="#59c9c9" stroke-width="1.5">');
    CT_BAY_WILDLIFE.forEach((w, i) => { const p = atlasProject(w.area.x, w.area.z, size); out.push(`<circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="8" data-wildlife="${atlasEsc(`${w.kind}-${i}`)}"><title>Wildlife: ${atlasEsc(w.kind)}</title></circle>`); });
    out.push("</g>");
  }
  if (on.assets) {
    out.push('<g class="atlas-layer" data-layer="assets">');
    for (const a of CT_BAY_ASSETS) {
      const p = atlasProject(a.position[0], a.position[1], size);
      out.push(`<rect x="${(p.x - 2).toFixed(1)}" y="${(p.y - 2).toFixed(1)}" width="4" height="4" fill="${atlasHex(CT_BAY_ASSET_KINDS[a.kind].colour)}" data-asset="${atlasEsc(a.id)}"><title>${atlasEsc(a.name)}</title></rect>`);
    }
    out.push("</g>");
  }
  if (on.activities) {
    // The Atlas holds no quest progress: without `opts.quests` it marks the landmarks where free-roam activities happen.
    out.push('<g class="atlas-layer" data-layer="activities" fill="none" stroke="#8cff5a" stroke-width="1.2">');
    const spots = BAY_LANDMARKS.filter((l) => ["park", "lookout", "stadium", "arena", "marina"].includes(l.kind)).map((l) => ({ id: l.id, site: l.id, title: `Activity: ${l.name}` }));
    for (const q of opts.quests ?? spots) {
      const at = [...BAY_SITES, ...BAY_LANDMARKS].find((p) => p.id === q.site);
      if (!at) continue;
      const p = atlasProject(at.position[0], at.position[1], size);
      out.push(`<circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="9" data-activity="${atlasEsc(q.id)}"${q.done ? ' fill="#8cff5a" fill-opacity="0.3"' : ""}><title>${atlasEsc(q.title ?? q.id)}</title></circle>`);
    }
    out.push("</g>");
  }
  if (on.landmarks) out.push('<g class="atlas-landmarks atlas-layer" data-layer="landmarks">');
  for (const l of on.landmarks ? BAY_LANDMARKS : []) {
    const p = atlasProject(l.position[0], l.position[1], size);
    out.push(`<path d="M${p.x.toFixed(1)} ${(p.y - 6).toFixed(1)} l6 6 l-6 6 l-6 -6 z" fill="#a079ff" stroke="#0a1420" stroke-width="1.2" class="atlas-landmark" data-landmark="${atlasEsc(l.id)}" tabindex="0" role="button" aria-label="${atlasEsc(l.name)}, landmark"><title>${atlasEsc(l.name)}</title></path>`);
  }
  if (on.landmarks) out.push("</g>");
  // Job sites stay drawn (they are what the list and the deep links select);
  // the jobs layer colours each by its first programme instead of one gold.
  out.push('<g class="atlas-sites atlas-layer" data-layer="jobs">');
  for (const s of BAY_SITES) {
    const p = atlasProject(s.position[0], s.position[1], size);
    out.push(`<circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="6" fill="${on.jobs ? atlasHex(ctProgrammeColour(s.programmes?.[0])) : "#f2c14b"}" stroke="#0a1420" stroke-width="1.5" class="atlas-site" data-site="${atlasEsc(s.id)}" tabindex="0" role="button" aria-label="${atlasEsc(s.name)}, training site"><title>${atlasEsc(s.name)}</title></circle>`);
  }
  out.push("</g>");
  const bar = 200 * scale;
  out.push(`<g class="atlas-scale" transform="translate(16 ${size.height - 18})"><rect width="${bar.toFixed(1)}" height="4" fill="#dfe6ec"/><text x="${(bar / 2).toFixed(1)}" y="-4" text-anchor="middle" fill="#9fc3d8" font-size="10" font-family="system-ui, sans-serif">200 m</text></g>`);
  out.push(`<text x="${size.width - 14}" y="${size.height - 12}" text-anchor="end" fill="#628aa0" font-size="10" font-family="system-ui, sans-serif">Bay World · built-in map</text>`);
  out.push("</svg>");
  return out.join("\n");
}

// ------------------------------------------------------------ Sierra Summit
//
// The same shapes for the mountain world: places from SM_SITES and
// SM_LANDMARKS, a hypsometric SVG map drawn from smHeightAt() (north up, not
// geographic — the world is invented), rows with the trade line and station
// chips, and deep links into summit/index.html. Everything but
// atlasMountSummit() is pure so tools/check_summit.mjs can render it.

/** The Summit map's drawing size: the field is square. */
export const ATLAS_SUMMIT_SVG_SIZE = { width: 800, height: 800 };
/** One accent per Summit zone (the data carries none). */
export const ATLAS_SUMMIT_ACCENTS = { valley: "#8cff5a", reservoir: "#4fd1ff", pass: "#f2c14b", summit: "#eaf6ff", ridge: "#ffd24a" };

/** World (x, z) → SVG pixel, y-down (north is -z, so north is up). */
export function atlasSummitProject(x, z, size = ATLAS_SUMMIT_SVG_SIZE) {
  return { x: ((x - SM_BOUNDS.minX) / SM_SIZE) * size.width, y: ((z - SM_BOUNDS.minZ) / SM_SIZE) * size.height };
}

/** Every Summit site, then every landmark: `{ kind, id, name, zone, zoneName, accent, position:[x,z], trade, stations, blurb, height }`. */
export function atlasSummitPlaces() {
  const shape = (item, kind) => {
    const zone = SM_ZONES.find((z) => z.id === (item.zone ?? smZoneAt(item.at[0], item.at[1]).id));
    return {
      kind, id: item.id, name: item.name, zone: zone?.id ?? "", zoneName: zone?.name ?? "", accent: ATLAS_SUMMIT_ACCENTS[zone?.id] ?? "#4fd1ff",
      position: item.at, trade: item.trade ?? "", stations: item.stations ?? [], programmes: [], blurb: item.blurb ?? "",
      height: Math.round(smHeightAt(item.at[0], item.at[1])),
    };
  };
  return [...SM_SITES.map((s) => shape(s, "site")), ...SM_LANDMARKS.map((l) => shape(l, "landmark"))];
}

/** The deep links for one Summit place: `summit` opens the world there; `station` launches its first station, or null. */
export function atlasSummitDeepLinks(place) {
  return {
    summit: `${ATLAS_LINKS.summit}?site=${encodeURIComponent(place.id)}`,
    station: place.stations?.[0] ? lkStationLink(place.stations[0], { runner: ATLAS_LINKS.smartcity, trades: ATLAS_LINKS.trades, from: "atlas" }) : null,
  };
}

/** Station chips for a Summit place (its job board), or the landmark's nothing. */
export function atlasSummitChipsHtml(place) {
  if (!place.stations.length) return place.kind === "site" ? '<span class="atlas-none">The crew musters here; no job board.</span>' : "";
  return `<div class="atlas-chips">${place.stations.map((id) => `<a class="chip" href="${atlasEsc(lkStationLink(id, { runner: ATLAS_LINKS.smartcity, trades: ATLAS_LINKS.trades, from: "atlas" }))}" data-station="${atlasEsc(id)}">${atlasEsc(atlasPretty(id))}</a>`).join("")}</div>`;
}

/** The detail card for a Summit place. */
export function atlasSummitPopupHtml(place) {
  const links = atlasSummitDeepLinks(place);
  const actions = [`<a class="atlas-go" href="${atlasEsc(links.summit)}">Open in Sierra Summit</a>`];
  if (links.station) actions.push(`<a class="atlas-go" href="${atlasEsc(links.station)}">Launch ${atlasEsc(atlasPretty(place.stations[0]))}</a>`);
  return `<b class="atlas-name">${atlasEsc(place.name)}</b>`
    + `<div class="mb-kind atlas-kind">${atlasEsc(place.zoneName)} · ${place.kind} · ${place.height} m</div>`
    + (place.trade ? `<div class="atlas-kind">${atlasEsc(place.trade)}</div>` : "")
    + (place.blurb ? `<p class="atlas-blurb">${atlasEsc(place.blurb)}</p>` : "")
    + atlasSummitChipsHtml(place)
    + `<div class="atlas-actions">${actions.join("")}</div>`;
}

/** One row per Summit place. */
export function atlasSummitListHtml(places) {
  if (!places.length) return '<p class="atlas-none">Nothing matches that.</p>';
  return places.map((p) => {
    const links = atlasSummitDeepLinks(p);
    return `<article class="atlas-row atlas-row-${p.kind}" data-place="${atlasEsc(p.id)}" data-kind="${p.kind}" style="--accent:${p.accent}">
  <h3>${atlasEsc(p.name)}</h3>
  <p class="atlas-kind">${atlasEsc(p.zoneName)} · ${p.kind} · ${p.height} m${p.stations.length ? ` · ${p.stations.length} station${p.stations.length === 1 ? "" : "s"}` : ""}</p>
  ${p.trade ? `<p class="atlas-kind">${atlasEsc(p.trade)}</p>` : ""}
  ${atlasSummitChipsHtml(p)}
  <p class="atlas-links"><a href="${atlasEsc(links.summit)}">Open in Sierra Summit</a>${links.station ? ` · <a href="${atlasEsc(links.station)}">Launch a station</a>` : ""}</p>
</article>`;
  }).join("\n");
}

/** The Summit places whose name, id, zone, trade or station contains `query`. */
export function atlasSummitFilter(places, query = "") {
  const q = String(query ?? "").trim().toLowerCase();
  if (!q) return places;
  return places.filter((p) => [p.name, p.id, p.zoneName, p.zone, p.kind, p.trade, ...p.stations].some((s) => String(s).toLowerCase().includes(q)));
}

/** The height band's colour for the hypsometric tint. */
function atlasSummitTint(h, water) {
  if (water) return "#2b5d7a";
  if (h >= SM_SNOWLINE) return "#dfe7ee";
  if (h >= SM_TREELINE) return "#8d8a82";
  if (h >= SM_SCREE) return "#6f7d55";
  if (h >= 420) return "#4b7444";
  return "#3a6640";
}

/**
 * The Summit map: a hypsometric tint sampled from smHeightAt() on a coarse
 * grid (runs of one band merged into one rect), the reservoir, the river, the
 * roads, the gondola and transmission lines, the trails, a diamond per
 * landmark and a circle per site, with a scale bar. Markup only.
 */
export function atlasSummitSvg(opts = {}) {
  const size = opts.size ?? ATLAS_SUMMIT_SVG_SIZE, n = opts.grid ?? 64;
  const cw = size.width / n, ch = size.height / n, step = SM_SIZE / n;
  const out = [];
  out.push(`<svg class="atlas-svg" viewBox="0 0 ${size.width} ${size.height}" role="img" aria-label="Sierra Summit: ${SM_ZONES.length} zones, ${SM_SITES.length} training sites and ${SM_LANDMARKS.length} landmarks, drawn from the world's own height field, north up" xmlns="http://www.w3.org/2000/svg">`);
  out.push(`<rect width="${size.width}" height="${size.height}" fill="#0a1420"/>`);
  out.push('<g class="atlas-relief" shape-rendering="crispEdges">');
  for (let j = 0; j < n; j++) {
    const z = SM_BOUNDS.minZ + (j + 0.5) * step;
    let runStart = 0, runFill = null;
    for (let i = 0; i <= n; i++) {
      let fill = null;
      if (i < n) { const x = SM_BOUNDS.minX + (i + 0.5) * step; fill = atlasSummitTint(smHeightAt(x, z), smInLake(x, z)); }
      if (fill !== runFill) {
        if (runFill) out.push(`<rect x="${(runStart * cw).toFixed(1)}" y="${(j * ch).toFixed(1)}" width="${((i - runStart) * cw).toFixed(1)}" height="${ch.toFixed(1)}" fill="${runFill}"/>`);
        runStart = i; runFill = fill;
      }
    }
  }
  out.push("</g>");
  const path = (pts) => pts.map(([x, z]) => { const p = atlasSummitProject(x, z, size); return `${p.x.toFixed(1)},${p.y.toFixed(1)}`; }).join(" ");
  const lake = atlasSummitProject(SM_LAKE.centre[0], SM_LAKE.centre[1], size);
  out.push(`<circle cx="${lake.x.toFixed(1)}" cy="${lake.y.toFixed(1)}" r="${(SM_LAKE.radius / SM_SIZE * size.width * 0.92).toFixed(1)}" fill="#2b5d7a" stroke="#4fd1ff" stroke-opacity="0.5" stroke-width="1" data-lake="reservoir"><title>The reservoir</title></circle>`);
  out.push(`<polyline points="${path(SM_RIVER)}" fill="none" stroke="#6cc3ea" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" data-river="tailrace"><title>The tailrace river</title></polyline>`);
  out.push('<g class="atlas-roads" fill="none" stroke-linecap="round" stroke-linejoin="round">');
  out.push(`<polyline points="${path(SM_PASS_ROAD)}" stroke="#f2c14b" stroke-width="2.6" data-road="pass-road"><title>The pass road</title></polyline>`);
  out.push(`<polyline points="${path(SM_SERVICE_ROAD)}" stroke="#c9a86a" stroke-width="1.6" data-road="service-road"><title>The service road</title></polyline>`);
  out.push(`<polyline points="${path(SM_GONDOLA)}" stroke="#e8492f" stroke-width="1.6" stroke-dasharray="3 3" data-line="gondola"><title>The gondola</title></polyline>`);
  out.push(`<polyline points="${path(SM_TRANSMISSION)}" stroke="#ffd24a" stroke-width="1.2" stroke-dasharray="6 3" data-line="transmission"><title>The transmission line</title></polyline>`);
  for (const t of SM_TRAILS) out.push(`<polyline points="${path(t.pts)}" stroke="#fff3c4" stroke-width="1" stroke-dasharray="2 3" data-trail="${atlasEsc(t.id)}"><title>${atlasEsc(t.name)}</title></polyline>`);
  out.push("</g>");
  out.push('<g class="atlas-zones">');
  for (const z of SM_ZONES) {
    const c = atlasSummitProject(z.centre[0], z.centre[1], size);
    out.push(`<text x="${c.x.toFixed(1)}" y="${(c.y - 30).toFixed(1)}" text-anchor="middle" fill="${ATLAS_SUMMIT_ACCENTS[z.id] ?? "#9fc3d8"}" fill-opacity="0.85" font-size="12" font-family="system-ui, sans-serif" letter-spacing="1">${atlasEsc(z.name.toUpperCase())}</text>`);
  }
  out.push("</g>");
  out.push('<g class="atlas-landmarks">');
  for (const l of SM_LANDMARKS) {
    const p = atlasSummitProject(l.at[0], l.at[1], size);
    out.push(`<path d="M${p.x.toFixed(1)} ${(p.y - 6).toFixed(1)} l6 6 l-6 6 l-6 -6 z" fill="#a079ff" stroke="#0a1420" stroke-width="1.2" class="atlas-landmark" data-summit-landmark="${atlasEsc(l.id)}" tabindex="0" role="button" aria-label="${atlasEsc(l.name)}, landmark"><title>${atlasEsc(l.name)}</title></path>`);
  }
  out.push("</g>");
  out.push('<g class="atlas-sites">');
  for (const s of SM_SITES) {
    const p = atlasSummitProject(s.at[0], s.at[1], size);
    out.push(`<circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="6" fill="#f2c14b" stroke="#0a1420" stroke-width="1.5" class="atlas-site" data-summit-site="${atlasEsc(s.id)}" tabindex="0" role="button" aria-label="${atlasEsc(s.name)}, training site"><title>${atlasEsc(s.name)}</title></circle>`);
  }
  out.push("</g>");
  const bar = 1000 / SM_SIZE * size.width;
  out.push(`<g class="atlas-scale" transform="translate(16 ${size.height - 18})"><rect width="${bar.toFixed(1)}" height="4" fill="#dfe6ec"/><text x="${(bar / 2).toFixed(1)}" y="-4" text-anchor="middle" fill="#9fc3d8" font-size="10" font-family="system-ui, sans-serif">1 km</text></g>`);
  out.push(`<text x="${size.width - 14}" y="${size.height - 12}" text-anchor="end" fill="#628aa0" font-size="10" font-family="system-ui, sans-serif">Sierra Summit · built-in map · north up · not a real place</text>`);
  out.push("</svg>");
  return out.join("\n");
}

/** Wire the Summit section, if the page has one (`#atlas-summit-map`); returns its state or null. */
export function atlasMountSummit(doc = globalThis.document) {
  const $ = (id) => doc?.getElementById?.(id) ?? null;
  const mapEl = $("atlas-summit-map"), listEl = $("atlas-summit-list"), detailEl = $("atlas-summit-detail"), countEl = $("atlas-summit-count");
  if (!mapEl && !listEl) return null;
  const places = atlasSummitPlaces();
  const state = { places, selected: null };
  const byId = (kind, id) => places.find((p) => p.kind === kind && p.id === id) ?? null;
  const drawList = (query) => {
    const shown = atlasSummitFilter(places, query);
    if (listEl) listEl.innerHTML = atlasSummitListHtml(shown);
    const sites = shown.filter((p) => p.kind === "site").length, landmarks = shown.length - sites;
    if (countEl) countEl.textContent = `${sites} site${sites === 1 ? "" : "s"} · ${landmarks} landmark${landmarks === 1 ? "" : "s"}`;
  };
  const select = (place) => {
    if (!place) return;
    state.selected = place;
    if (detailEl) { detailEl.innerHTML = atlasSummitPopupHtml(place); detailEl.hidden = false; }
    for (const row of listEl?.querySelectorAll?.("[data-place]") ?? []) {
      const on = row.getAttribute?.("data-place") === place.id;
      row.classList?.toggle?.("atlas-row-on", on);
      if (on) row.scrollIntoView?.({ block: "nearest", behavior: "smooth" });
    }
  };
  const hitPlace = (el) => {
    const hit = el?.closest?.("[data-summit-site],[data-summit-landmark]");
    if (!hit) return null;
    const site = hit.getAttribute("data-summit-site");
    return site ? byId("site", site) : byId("landmark", hit.getAttribute("data-summit-landmark"));
  };
  if (mapEl) mapEl.innerHTML = atlasSummitSvg();
  drawList("");
  $("atlas-summit-search")?.addEventListener?.("input", (e) => drawList(e?.target?.value ?? ""));
  mapEl?.addEventListener?.("click", (e) => select(hitPlace(e?.target)));
  mapEl?.addEventListener?.("keydown", (e) => { if (e?.key !== "Enter" && e?.key !== " ") return; const p = hitPlace(e.target); if (p) { e.preventDefault?.(); select(p); } });
  listEl?.addEventListener?.("click", (e) => {
    if (e?.target?.closest?.("a")) return;
    const row = e?.target?.closest?.("[data-place]");
    if (row) select(byId(row.getAttribute("data-kind"), row.getAttribute("data-place")));
  });
  return state;
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

  // The layer toggles are a view choice for this visit only; nothing is stored.
  state.layers = Object.fromEntries(CT_BAY_LAYERS.map((l) => [l.id, l.on]));
  const drawSvg = () => {
    if (mapEl) { mapEl.innerHTML = atlasSvg({ layers: state.layers }); mapEl.classList?.remove?.("atlas-map-live"); }
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

  // One checkbox per layer; a change redraws the built-in map (Mapbox mode keeps its own markers).
  const layersEl = $("atlas-layers");
  if (layersEl && doc?.createElement) {
    layersEl.textContent = "";
    for (const l of CT_BAY_LAYERS) {
      const label = doc.createElement("label");
      const cb = doc.createElement("input");
      cb.type = "checkbox"; cb.checked = !!state.layers[l.id];
      cb.setAttribute?.("data-layer", l.id);
      cb.addEventListener?.("change", () => {
        state.layers[l.id] = !!cb.checked;
        if (state.mode === "svg") drawSvg();
      });
      const sw = doc.createElement("span");
      sw.className = "swatch";
      if (sw.style) sw.style.background = atlasHex(l.colour);
      label.append?.(cb, sw, l.label);
      layersEl.append?.(label);
    }
  }
  drawSvg();
  drawList("");
  say(statusEl, "Drawn from Bay World's own data. Paste a Mapbox public token to see the same places over a real-world map.");
  state.summit = atlasMountSummit(doc);

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

// The header band plays a recorded loop of Bay World behind the title
// (console CINEMA, shared/cinema.js): poster only under reduced motion or
// Save-Data, and only while the header is on screen.
if (typeof document !== "undefined" && typeof document.querySelector === "function") cnMount(document.querySelector("header.top"), "atlas-header", { scrim: "linear-gradient(180deg,rgba(5,10,16,.62),rgba(5,10,16,.84))" });
