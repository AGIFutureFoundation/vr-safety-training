// The Deep — the minimap and full map's geometry and roster, kept apart from
// the canvas drawing (app.js) so the transform and the "every site, once"
// rule are checkable with no DOM. Mirrors bayworld/js/map.js over DEEP_BOUNDS.
import { DEEP_BOUNDS, DV_LINES, DV_ZONES, DV_LANDMARKS, DV_SITES } from "./seabed.js";
import { dvIsSiteVisited, dvIsAscentUnlocked } from "./dive-career.js";
import { DEEP_SITES, DEEP_LANDMARKS, DEEP_LINES, CT_DEEP_LAYERS, CT_DEEP_ASSETS, CT_DEEP_ASSET_KINDS, CT_DEEP_WILDLIFE } from "../../shared/underwater-data.js";

/** The layer toggles' per-viewer memory (a convenience only; defaults are CT_DEEP_LAYERS' own `on`). */
const CT_DV_LAYER_KEY = "underwater-map-layers-v1";

/** A programme id's map colour — the same rule as Bay World's ctProgrammeColour, kept here so this bundle needs no Bay World data. */
const CT_DV_PALETTE = [0xf2c14b, 0x4fd1ff, 0xf07a1f, 0x59c97b, 0xd86bd0, 0xe25c5c, 0x3b7bbf, 0xc9a06a, 0x8cff5a, 0xa079ff, 0x59c9c9, 0xffffff];
export function ctDvProgrammeColour(id) {
  if (!id) return 0x7f8c96;
  let h = 7;
  for (const c of String(id)) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return CT_DV_PALETTE[h % CT_DV_PALETTE.length];
}

/** Which layers are on: `{ roads: true, … }`, from `storage` when it holds a choice. */
export function ctDvLayerState(storage) {
  const out = Object.fromEntries(CT_DEEP_LAYERS.map((l) => [l.id, l.on]));
  try { Object.assign(out, JSON.parse(storage?.getItem(CT_DV_LAYER_KEY) || "{}")); } catch (_) { /* defaults */ }
  return out;
}

/** Turn one layer on or off and remember it. Returns the new state. */
export function ctDvSetLayer(id, on, storage) {
  const state = ctDvLayerState(storage);
  if (!(id in state)) return state;
  state[id] = !!on;
  try { storage?.setItem(CT_DV_LAYER_KEY, JSON.stringify(state)); } catch (_) { /* private mode */ }
  return state;
}

/**
 * Every layer's features in map space, `{ <layerId>: [feature…] }`. `dives`
 * is dive-engine's dvDiveState() list and `eggs` the lantern dives
 * (`{ id, title, anchor:[x,z] }`), `activities` the activity definitions:
 * together the activities-and-eggs layer, open or done.
 */
export function ctDvMapLayers(size = 512, { dives = [], eggs = [], activities = [] } = {}) {
  const P = (x, z) => dvWorldToMap(x, z, size);
  const done = new Set(dives.filter((d) => d.done).map((d) => d.id));
  const byName = new Map(DEEP_SITES.map((s) => [s.name, s]));
  return {
    roads: DEEP_LINES.map((l) => ({ id: l.id, label: l.name, kind: l.kind, colour: l.kind === "channel" ? 0x3b7bbf : 0x9fb6c8, points: l.points.map(([x, z]) => P(x, z)) })),
    jobs: DEEP_SITES.map((s) => ({ id: s.id, label: s.name, programme: s.programmes?.[0] ?? null, colour: ctDvProgrammeColour(s.programmes?.[0]), ...P(s.position[0], s.position[1]) })),
    landmarks: DEEP_LANDMARKS.map((l) => ({ id: l.id, label: l.name, colour: 0xa8f0e0, ...P(l.position[0], l.position[1]) })),
    activities: [
      ...eggs.filter((e) => Array.isArray(e.anchor)).map((e) => ({ id: e.id, label: e.title, kind: "egg", done: done.has(e.id), colour: done.has(e.id) ? 0x8cff5a : 0xffd54a, ...P(e.anchor[0], e.anchor[1]) })),
      ...activities.map((a) => ({ a, at: byName.get(a.site) })).filter((x) => x.at).map(({ a, at }) => ({ id: a.id, label: a.title, kind: a.kind, colour: 0x6ad0a0, ...P(at.position[0], at.position[1]) })),
    ],
    assets: CT_DEEP_ASSETS.map((a) => ({ id: a.id, label: a.name, kind: a.kind, colour: CT_DEEP_ASSET_KINDS[a.kind].colour, ...P(a.position[0], a.position[1]) })),
    wildlife: CT_DEEP_WILDLIFE.map((w, i) => ({ id: `${w.kind}-${i}`, label: `Wildlife: ${w.kind}`, kind: w.kind, colour: 0x59c9c9, ...P(w.area.x, w.area.z) })),
  };
}

/** The one uniform scale that fits all of DEEP_BOUNDS inside a `size`-pixel
 *  square canvas with `pad` pixels of margin (letterboxing, never stretching). */
export function dvMapScale(size = 512, pad = 18) {
  const w = DEEP_BOUNDS.maxX - DEEP_BOUNDS.minX, h = DEEP_BOUNDS.maxZ - DEEP_BOUNDS.minZ;
  return (size - pad * 2) / Math.max(w, h);
}

/** World (x, z) to a `size`-pixel square canvas, y-down, the field centred. */
export function dvWorldToMap(x, z, size = 512, pad = 18) {
  const w = DEEP_BOUNDS.maxX - DEEP_BOUNDS.minX, h = DEEP_BOUNDS.maxZ - DEEP_BOUNDS.minZ;
  const scale = dvMapScale(size, pad);
  const offX = (size - w * scale) / 2, offY = (size - h * scale) / 2;
  return { x: offX + (x - DEEP_BOUNDS.minX) * scale, y: offY + (z - DEEP_BOUNDS.minZ) * scale };
}

/** Every dive line as a map-space point list, ready to stroke. */
export function dvMapLines(size = 512) {
  return DV_LINES.map((line) => ({ id: line.id, kind: line.kind, points: line.points.map(([x, z]) => dvWorldToMap(x, z, size)) }));
}

/** Every zone with its map-space centre and radius. */
export function dvMapZones(size = 512) {
  const scale = dvMapScale(size);
  return DV_ZONES.map((z) => ({ id: z.id, name: z.name, color: z.color, ...dvWorldToMap(z.center[0], z.center[1], size), radius: z.radius * scale }));
}

/** Every landmark, positioned. */
export function dvMapLandmarks(size = 512) {
  return DV_LANDMARKS.map((l) => ({ id: l.id, name: l.name, ...dvWorldToMap(l.position[0], l.position[2], size) }));
}

/** Every site, positioned, with its visited/ascent-line state — the roster
 *  the full map lists and the checker's "every site, once" rule reads. */
export function dvMapSites(size = 512, storage) {
  return DV_SITES.map((s) => ({
    id: s.id, name: s.name, zone: s.zone,
    ...dvWorldToMap(s.position[0], s.position[2], size),
    visited: dvIsSiteVisited(s.id, storage),
    ascent: dvIsAscentUnlocked(s.id, storage),
  }));
}
