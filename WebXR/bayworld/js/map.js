// Bay World — the minimap and full map's own geometry and roster, kept
// separate from the canvas drawing (world.js/app.js) so the coordinate
// transform and "every site, once" rule are checkable with no DOM.
import { BAY_BOUNDS, BAY_ROADS, BW_ZONES, BW_LANDMARKS, BW_SITES } from "./city.js";
import { BAY_SITES, BAY_LANDMARKS, CT_BAY_LAYERS, CT_BAY_ASSETS, CT_BAY_ASSET_KINDS, CT_BAY_WILDLIFE, ctProgrammeColour } from "../../shared/bayworld-data.js";
import { bwIsSiteVisited, bwIsFastTravelUnlocked } from "./career.js";
import { k2MapFieldLessons } from "../../shared/field-lessons.js";

/** The K-12 layer: every Bay World field lesson, positioned (shared/field-lessons.js). */
export function bwMapFieldLessons(size = 512) { return k2MapFieldLessons("bayworld", bwWorldToMap, size); }

/** Metres per pixel's inverse — the one uniform scale that fits the whole of
 *  BAY_BOUNDS (whatever its size and aspect) inside a `size`-pixel square
 *  canvas with `pad` pixels of margin. Uniform, so a 2400 × 1600 m field
 *  letterboxes rather than stretches; everything else here reads it. */
export function bwMapScale(size = 512, pad = 18) {
  const w = BAY_BOUNDS.maxX - BAY_BOUNDS.minX, h = BAY_BOUNDS.maxZ - BAY_BOUNDS.minZ;
  return (size - pad * 2) / Math.max(w, h);
}

/** World (x, z) to a `size`-pixel square canvas, y-down, with `pad` pixels of
 *  margin so nothing sits on the rim, the field centred in the canvas. */
export function bwWorldToMap(x, z, size = 512, pad = 18) {
  const w = BAY_BOUNDS.maxX - BAY_BOUNDS.minX, h = BAY_BOUNDS.maxZ - BAY_BOUNDS.minZ;
  const scale = bwMapScale(size, pad);
  const offX = (size - w * scale) / 2, offY = (size - h * scale) / 2;
  return {
    x: offX + (x - BAY_BOUNDS.minX) * scale,
    y: offY + (z - BAY_BOUNDS.minZ) * scale,
  };
}

/** Every road as an array of map-space point lists, ready to stroke. */
export function bwMapRoads(size = 512) {
  return BAY_ROADS.map((road) => {
    const pts = road.points.map(([x, z]) => bwWorldToMap(x, z, size));
    return { id: road.id, lanes: road.lanes, points: pts };
  });
}

/** Every zone with its map-space centre and radius (radius scaled by the
 *  same uniform factor the world-to-map transform uses). */
export function bwMapZones(size = 512) {
  const scale = bwMapScale(size);
  return BW_ZONES.map((z) => ({ id: z.id, name: z.name, color: z.color, ...bwWorldToMap(z.center[0], z.center[1], size), radius: z.radius * scale }));
}

/** Every landmark, positioned. */
export function bwMapLandmarks(size = 512) {
  return BW_LANDMARKS.map((l) => ({ id: l.id, name: l.name, ...bwWorldToMap(l.position[0], l.position[2], size) }));
}


/** The layer toggles live for the page's session only: a view choice, not
 *  progress, so nothing is written to storage (tools/check_interop.mjs keeps
 *  every world write on its existing stores). Keyed by the caller's store
 *  handle so two handles never share a choice. */
const ctBwLayerMem = new WeakMap();
const ctBwLayerDefault = {};

/** Which layers are on: `{ roads: true, … }` — the defaults (CT_BAY_LAYERS' own `on`) plus this session's toggles. */
export function ctBwLayerState(storage) {
  const mine = ctBwLayerMem.get(storage ?? ctBwLayerDefault) ?? {};
  return { ...Object.fromEntries(CT_BAY_LAYERS.map((l) => [l.id, l.on])), ...mine };
}

/** Turn one layer on or off for this session. Returns the new state. */
export function ctBwSetLayer(id, on, storage) {
  const state = ctBwLayerState(storage);
  if (!(id in state)) return state;
  state[id] = !!on;
  ctBwLayerMem.set(storage ?? ctBwLayerDefault, state);
  return state;
}

/**
 * Every layer's features in map space, `{ <layerId>: [feature…] }`, each
 * feature `{ id, x, y, colour, label, … }` (roads carry `points`). `quests`
 * is quest-engine's questState() list, for the activities-and-eggs layer
 * (open or done). Pure: the in-game map draws exactly this and
 * tools/check_worlds_detail.mjs counts it.
 */
export function ctBwMapLayers(size = 512, { quests = [] } = {}) {
  const P = (x, z) => bwWorldToMap(x, z, size);
  const places = new Map([...BAY_SITES, ...BAY_LANDMARKS].map((p) => [p.id, p]));
  return {
    roads: [
      ...BAY_ROADS.map((r) => ({ id: r.id, label: r.name, lanes: r.lanes, colour: 0x8aa2b4, points: r.points.map(([x, z]) => P(x, z)) })),
      ...BAY_LANDMARKS.filter((l) => l.kind === "transit").map((l) => ({ id: l.id, label: l.name, colour: 0x3b7bbf, transit: true, ...P(l.position[0], l.position[1]) })),
    ],
    jobs: BAY_SITES.map((s) => ({ id: s.id, label: s.name, programme: s.programmes?.[0] ?? null, colour: ctProgrammeColour(s.programmes?.[0]), ...P(s.position[0], s.position[1]) })),
    landmarks: BAY_LANDMARKS.map((l) => ({ id: l.id, label: l.name, colour: 0xa079ff, ...P(l.position[0], l.position[1]) })),
    activities: quests.map((q) => ({ q, at: places.get(q.site) })).filter((x) => x.at).map(({ q, at }) => ({
      id: q.id, label: q.title, kind: q.kind, done: !!q.done, colour: q.done ? 0x8cff5a : q.kind === "egg" ? 0xffd54a : 0x6a8a5a, ...P(at.position[0], at.position[1]),
    })),
    assets: CT_BAY_ASSETS.map((a) => ({ id: a.id, label: a.name, kind: a.kind, colour: CT_BAY_ASSET_KINDS[a.kind].colour, ...P(a.position[0], a.position[1]) })),
    wildlife: CT_BAY_WILDLIFE.map((w, i) => ({ id: `${w.kind}-${i}`, label: `Wildlife: ${w.kind}`, kind: w.kind, colour: 0x59c9c9, ...P(w.area.x, w.area.z) })),
  };
}

/**
 * Every site, positioned, with its own visited/fast-travel state — the list
 * the full map's job board and tools/check_bayworld_game.mjs's "the map
 * lists every site" rule both read. `storage` is career.js's own injectable
 * handle.
 */
export function bwMapSites(size = 512, storage) {
  return BW_SITES.map((s) => ({
    id: s.id, name: s.name, zone: s.zone,
    ...bwWorldToMap(s.position[0], s.position[2], size),
    visited: bwIsSiteVisited(s.id, storage),
    fastTravel: bwIsFastTravelUnlocked(s.id, storage),
  }));
}
