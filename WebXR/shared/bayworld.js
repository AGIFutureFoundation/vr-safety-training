import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import { box, cyl, ball, torus, group, mat, decal, mergeStatic, hex } from "./kit.js";
import {
  facePaint, paintedMat, brickFace, blockFace, concreteFace, asphaltFace, corrugatedFace,
  grassFace, plasterFace, gravelFace, woodGrainFace, txTexture, txTierPx, txPalette,
} from "./textures.js";
import { streetTree, parkBench, lightMast, fireHydrant, bollardRow, fencePanel, shippingContainer } from "./props.js";
import { sedan, pickup, cargoVan, boxTruck, busTransit, ctServiceLivery } from "./fleet.js";
// standingFigure and holoTag are the two SmartCiti.X-specific set pieces this
// module borrows (see this file's own header): the shared crowd figure and
// the floating AR-style name caption. Everything else it needs (kit.js,
// textures.js, props.js, fleet.js) is already generic to every WebXR app.
import { standingFigure, holoTag } from "../smartcity/js/citykit.js";
import {
  BAY_BOUNDS, BAY_ZONES, BAY_LANDMARKS, BAY_ROADS, BAY_SITES, BAY_MESH_BUDGET, BAY_HEIGHT_RANGE,
  bayHeight, bayZoneAt, bayRoadAt, bwSeededRng,
  TX_BAY_WATER, TX_SHORE_MARGIN, TX_WATER_THICKNESS, TX_SEABED_DROP, txGroundHeight, txTerrainSegments,
  TX_BAY_QUAYS, TX_QUAY_TOP, TX_MARINA_FLOATS, txWaterTopAt, txQuayAt, txGroundSurfaceAt,
} from "./bayworld-data.js";
export {
  BAY_BOUNDS, BAY_ZONES, BAY_LANDMARKS, BAY_ROADS, BAY_SITES, BAY_MESH_BUDGET, BAY_HEIGHT_RANGE,
  bayHeight, bayZoneAt, bayRoadAt,
};

// See bayworld-data.js for the layout data and the pure zone/height/road
// functions; this module is the three.js builder over that data, shared by
// team BAY2 (a free-roam driving-and-exploration game) and team BAY3 (a
// quest/objective layer) — see bayworld-data.js's own header for the split.
//
// Bay World is deliberately built the same way shared/fairway.js's course
// is: a "high" LOD 0 build of the whole 2400×1600 m world for a standalone
// app with its own camera and mesh budget, and a "low" compact preview
// vignette, independent of the zone data, for the shared SmartCiti.X stage
// (smartcity/js/districts.js's "bay-world" entry). `opts.zone` on a "high"
// build restricts the build to one named zone (BAY_ZONES' own ids) rather
// than the whole world — useful for a quest layer that only ever loads the
// zone the learner is standing in.
//
// Every place named here is generic and original: no real organisation,
// brand, address or event is asserted, the same discipline
// bayworld-data.js's own header describes.

// ------------------------------------------------------------------ colour

/** hex 0xRRGGBB * k -> 0xRRGGBB, clamped — the local tint helper this module
 *  needs for "a shade of the zone's own colour" without importing fleet.js's
 *  private flShade. */
function bwShade(c, k) {
  const r = Math.max(0, Math.min(255, Math.round(((c >> 16) & 255) * k)));
  const g = Math.max(0, Math.min(255, Math.round(((c >> 8) & 255) * k)));
  const b = Math.max(0, Math.min(255, Math.round((c & 255) * k)));
  return (r << 16) | (g << 8) | b;
}

// ------------------------------------------------------------ time of day
//
// bayLighting(time) reuses the platform-wide {night, dusk, day} convention
// every district and every station's own `?time=` already follows
// (smartcity/js/stage.js's TIMES_OF_DAY/LIGHTING_BY_TIME is the table other
// SmartCiti.X code reads), but is its OWN small copy rather than an import of
// that table: smartcity/js/stage.js imports smartcity/js/districts.js, which
// imports this module, so importing stage.js back here would be a cycle.
// This is the same shape (sky, fog, hemi, hemiI, key, mast) tuned for an
// outdoor open world rather than an AR station plaza, so a standalone BAY2/
// BAY3 app that never touches stage.js still gets a lit day/dusk/night world.
const BAY_TIME = {
  night: { sky: 0x0a1420, fog: 0x0d1826, hemi: [0x5a7a9a, 0x141a24], hemiI: 1.1, key: [0xbcd4ec, 0.5], mast: 1.0 },
  dusk: { sky: 0x4a3a4c, fog: 0x5c4856, hemi: [0xe6b98f, 0x3a3240], hemiI: 1.6, key: [0xffb27a, 1.4], mast: 0.7 },
  day: { sky: 0x9fc3e8, fog: 0xbfd6ea, hemi: [0xeaf3fb, 0x8a9aa8], hemiI: 1.9, key: [0xfff6e8, 2.4], mast: 0.12 },
};

/** The {sky, fog, hemi, hemiI, key, mast} lighting recipe for a time of day
 *  ("night" | "dusk" | "day", default "night") — see BAY_TIME's own header
 *  for why this is a local copy of the platform's shared convention rather
 *  than an import of it. */
export function bayLighting(time) {
  return BAY_TIME[time] ?? BAY_TIME.night;
}

// ---------------------------------------------------------------- palette
//
// Team PALETTE's world palette for this build — "bayworld-day", "-dusk" or
// "-night" from opts.time — read by the water, the ground and the facades
// below. Set once at the top of buildBayWorld().
let txBayPaletteName = "bayworld-night";

/** A second tiling of an already-painted texture: a clone sharing the same
 *  canvas, so a street of buildings costs one canvas per style, not one per
 *  facade width. */
function txBayTiled(tex, ru, rv = ru) {
  const t = typeof tex?.clone === "function" ? tex.clone() : tex;
  // Texture.clone() deep-copies userData through JSON, which turns the bump
  // and roughness companions (textures.js attachDetailMaps()) into plain
  // objects with no .matrix; paintedMat() then hands them to the renderer,
  // which throws mid-frame and leaves the ground, the water and every hull
  // unrendered (the regatta's sky-blue lower half). Share the originals.
  if (t && t !== tex && tex.userData) t.userData = { ...tex.userData };
  if (t && t !== tex && THREE.RepeatWrapping !== undefined) { t.wrapS = THREE.RepeatWrapping; t.wrapT = THREE.RepeatWrapping; }
  t?.repeat?.set?.(ru, rv);
  return t;
}
/** hex mixed toward white by k — a light tint for a neutral painted facade. */
function txBayTint(c, k = 0.5) {
  const m = (v) => Math.round(v + (255 - v) * k);
  return (m((c >> 16) & 255) << 16) | (m((c >> 8) & 255) << 8) | m(c & 255);
}

// ----------------------------------------------------------------- ground

/** A flat ground slab, height-displaced by bayHeight(), textured with a
 *  grass/gravel blend. Vertex displacement is guarded the same way
 *  shared/fairway.js's bwTerrain() is: the headless content checkers run
 *  against a stub three.js with no real BufferAttribute API, so this checks
 *  for it before touching it and simply builds a flat mesh there instead. */
function bwTerrain(cx, cz, w, d, heightAt = txGroundHeight) {
  const [segX, segZ] = txTerrainSegments(w, d);
  const geo = new THREE.PlaneGeometry(w, d, segX, segZ);
  const pos = geo.attributes?.position;
  if (pos && typeof pos.setZ === "function" && typeof pos.getX === "function") {
    for (let i = 0; i < pos.count; i++) {
      // The plane is turned -90 degrees about X below, which sends local +Y
      // to world -Z: sample the height at world z = cz - localY, or the
      // relief (and every carved water bed) lands mirrored across the slab.
      const localX = pos.getX(i), localY = pos.getY(i);
      pos.setZ(i, heightAt(cx + localX, cz - localY));
    }
    pos.needsUpdate = true;
    if (typeof geo.computeVertexNormals === "function") geo.computeVertexNormals();
  }
  const ground = txPalette(txBayPaletteName).ground;
  const tex = txTexture("turfStripe", { a: ground, b: bwShade(ground, 0.88), stripes: 8, seed: 5,
    repeat: Math.max(6, Math.round(Math.max(w, d) / 60)) });
  const mesh = new THREE.Mesh(geo, paintedMat(tex, { rough: 0.92, metal: 0.02 }));
  // Rotated on the mesh, not baked into the geometry — see
  // shared/fairway.js's bwTerrain() for why: a content checker reading a
  // flat floor's footprint off `mesh.rotation` must see a flat slab, not a
  // wall the height of the whole terrain.
  mesh.rotation.x = -Math.PI / 2;
  mesh.position.set(cx, 0, cz);
  mesh.receiveShadow = true;
  // Tagged so bayworld/js/world.js can find the one ground slab and swap
  // its paint for a satellite image when a Mapbox token exists
  // (shared/mapbox.js's bayGroundTexture(), docs/mapbox.md). paintedMat()
  // already marks the material ownMaterial, so mergeStatic() leaves it be.
  mesh.userData.bayGround = true;
  return mesh;
}

/** Still bay water covering the port/estuary side of the world (or a small
 *  patch for the "low" preview). */
function buildWater(parent, cx, cz, w, d, y = -0.4) {
  // Harbour water from the pattern set, in this build's palette: one canvas
  // for every body, each tiled to its own size.
  const tex = txTexture("harbourWater", { palette: txBayPaletteName, seed: 9,
    repeat: [Math.max(4, Math.round(w / 60)), Math.max(4, Math.round(d / 60))] });
  const m = box(parent, w, TX_WATER_THICKNESS, d, cx, y, cz, 0x0f2e3a, { rough: 0.2, metal: 0.6, cast: false });
  m.material = paintedMat(tex, { rough: 0.22, metal: 0.55 });
  m.receiveShadow = false;
  return m;
}

/** One quay (bayworld-data.js's TX_BAY_QUAYS): a concrete slab from the
 *  seabed under the water at `seaY` up to TX_QUAY_TOP, one mesh, its deck
 *  painted with the pattern set's broom-finished concrete. */
function buildQuay(parent, cx, cz, w, d, seaY = -0.4) {
  const bottom = seaY - TX_SEABED_DROP - 0.2;
  const h = TX_QUAY_TOP - bottom;
  const tex = facePaint("bw-quay-deck", (c, cw, ch) => concreteFace(c, cw, ch, { finish: "broom", tone: "#9a9b95", tone2: "#86887f" }),
    { repeat: 6, px: 256 });
  const m = box(parent, w, h, d, cx, bottom + h / 2, cz, 0x9a9b95, { rough: 0.9, cast: false });
  m.material = paintedMat(tex, { rough: 0.9, metal: 0.02 });
  m.userData.bayQuay = true;
  return m;
}

// ------------------------------------------------------------------ roads

/** One road segment as a textured ribbon between two [x, z] points, lane
 *  markings baked into the asphalt texture itself (asphaltFace's own
 *  `o.lanes`) rather than as separate meshes — see shared/fairway.js's
 *  ribbon() for the same "one plane between two arbitrary points" reasoning. */
function roadRibbon(parent, a, b, lanes, withCrossing = false) {
  const [ax, az] = a, [bx, bz] = b;
  const dx = bx - ax, dz = bz - az;
  const len = Math.max(0.5, Math.hypot(dx, dz));
  const mx = (ax + bx) / 2, mz = (az + bz) / 2;
  const width = lanes * 3.5;
  const g = group(parent, mx, 0.02, mz, Math.atan2(-dx, -dz));
  // Lane asphalt with worn paint from the pattern set: one canvas per lane
  // count, tiled along the segment.
  const tex = txTexture("laneAsphalt", { lanes, seed: 3, repeat: [1, Math.max(1, Math.round(len / 16))] });
  const geo = new THREE.PlaneGeometry(width, len);
  const m = new THREE.Mesh(geo, paintedMat(tex, { rough: 0.85, metal: 0.03 }));
  m.rotation.x = -Math.PI / 2;
  m.receiveShadow = true;
  g.add(m);
  // A zebra crosswalk across the carriageway at the segment's far end, where
  // it meets the next junction — one thin plane (BAY_MESH_BUDGET has the
  // headroom), textured from the pattern set.
  if (withCrossing && len > 20) {
    const cw = new THREE.Mesh(new THREE.PlaneGeometry(width, 4), paintedMat(txTexture("crosswalk", { seed: 4, bars: 6, repeat: [Math.max(1, Math.round(width / 6)), 1] }), { rough: 0.8, metal: 0.02 }));
    cw.rotation.x = -Math.PI / 2;
    cw.position.set(0, 0.01, -len / 2 + 4);
    g.add(cw);
  }
  return g;
}

function buildRoads(parent, roads) {
  for (const road of roads) {
    for (let i = 1; i < road.points.length; i++) roadRibbon(parent, road.points[i - 1], road.points[i], road.lanes, true);
  }
}

// -------------------------------------------------------------- buildings

const GLASS_WINDOW_TONES = ["#dbe9ff", "#ffe6b0", "#0d151c"];
/** A curtain-wall grid with a handful of lit and dark cells — the downtown/
 *  uptown tower look, baked into one texture so a whole tower costs one wall
 *  material rather than a mesh per window. */
function glassCurtainFace(g, w, h, o = {}) {
  const cols = o.cols ?? 8, rows = o.rows ?? 14;
  g.fillStyle = "#16232c"; g.fillRect(0, 0, w, h);
  const cw = w / cols, rh = h / rows;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const dark = ((r * 7 + c * 13 + (o.seed ?? 0)) % 5) === 0;
      g.fillStyle = dark ? "#0d151c" : GLASS_WINDOW_TONES[(r + c) % 2];
      g.fillRect(c * cw + cw * 0.1, r * rh + rh * 0.14, cw * 0.8, rh * 0.7);
    }
  }
}

/** A painted low house-front — the Fruitvale-style residential block: flat
 *  colour siding, a lit window band and a shallow pitched roof cap. */
function paintedFace(g, w, h, o = {}) {
  g.fillStyle = o.base ?? "#cfc2b0"; g.fillRect(0, 0, w, h);
  g.fillStyle = "rgba(0,0,0,0.06)";
  for (let y = 0; y < h; y += h / 6) g.fillRect(0, y, w, 1);
  g.fillStyle = "rgba(255,230,176,0.5)";
  for (let i = 0; i < 3; i++) g.fillRect(w * (0.15 + i * 0.28), h * 0.28, w * 0.14, h * 0.22);
}

// Per-zone facades (team PALETTE): glass curtain wall downtown, warm stucco
// under tile in the market district (Fruitvale), corrugated and brick on the
// industrial flank (the port, West Oakland, Emery Crossing), painted wood at
// the marinas (the island harbour and the north shoreline).
const BUILDING_STYLE = {
  downtown: "glass", uptown: "brick", "west-oakland": "brick", port: "corrugated",
  fruitvale: "stucco", coliseum: "concrete", lake: "painted", "bridge-approach": null, hills: null,
  // The expansion's zones: painted houses on the island and the north
  // shoreline's town, corrugated sheds in Emery Crossing's distribution town,
  // concrete on the south shoreline's plant side, nothing on the ridge or the
  // open water.
  "island-harbour": "wood", "north-shoreline": "wood", "emery-crossing": "corrugated",
  "south-shoreline": "concrete", "upper-hills": null, "outer-bay": null,
};

/** One simple building: a textured box body and a roof cap, two meshes.
 *  `style` picks the facade painter; `tone` seeds its per-building colour so
 *  a street of them still varies. */
function buildingBox(parent, x, z, w, d, h, style, tone, seed) {
  const g = group(parent, x, 0, z, ((seed % 100) / 100 - 0.5) * 0.3);
  // One neutral canvas per style (the pattern set's, or a shared painter's),
  // tiled to the facade and tinted per building through the material colour
  // — so a whole zone costs one canvas, never one per tone or width.
  let tex, tint = 0xffffff;
  const px = txTierPx(256);
  if (style === "glass") tex = txTexture("glassCurtainWall", { palette: txBayPaletteName, seed: seed % 3, repeat: [Math.max(1, Math.round(w / 12)), Math.max(1, Math.round(h / 16))] });
  else if (style === "stucco") { tex = txTexture("stuccoWarm", { seed: 2, repeat: Math.max(1, Math.round(w / 6)) }); tint = txBayTint(tone, 0.7); }
  else if (style === "brick") { tex = txBayTiled(facePaint("bw-brick", brickFace, { repeat: 1, px }), Math.max(1, Math.round(w / 6))); tint = txBayTint(tone, 0.6); }
  else if (style === "corrugated") { tex = txBayTiled(facePaint("bw-corr", (c, cw, ch) => corrugatedFace(c, cw, ch, { colour: 0xd8dde2 }), { repeat: 1, px }), Math.max(1, Math.round(w / 4))); tint = txBayTint(tone, 0.35); }
  else if (style === "concrete") { tex = txBayTiled(facePaint("bw-conc", concreteFace, { repeat: 1, px }), Math.max(1, Math.round(w / 8))); tint = txBayTint(tone, 0.6); }
  else if (style === "wood") { tex = txBayTiled(facePaint("bw-wood", (c, cw, ch) => woodGrainFace(c, cw, ch, { planks: 10, tones: [0xe8e2d6, 0xdcd4c4, 0xf0ebe0] }), { repeat: 1, px }), Math.max(1, Math.round(w / 5)), 1); tint = txBayTint(tone, 0.45); }
  else { tex = facePaint("bw-paint", (c, cw, ch) => paintedFace(c, cw, ch, { base: "#f2ede4" }), { repeat: 1, px: txTierPx(192) }); tint = txBayTint(tone, 0.4); }
  const body = box(g, w, h, d, 0, h / 2, 0, tone, { rough: 0.75, metal: style === "glass" ? 0.15 : 0.05 });
  body.material = paintedMat(tex, { color: tint, rough: style === "glass" ? 0.35 : 0.8, metal: style === "glass" ? 0.2 : 0.04 });
  const cap = box(g, w * 1.03, Math.max(0.3, h * 0.02), d * 1.03, 0, h + Math.max(0.15, h * 0.01), 0, bwShade(tone, 0.7), { rough: 0.8, cast: false });
  // The roof: corrugated sheet on the sheds, tile over the market's stucco.
  if (style === "corrugated") cap.material = paintedMat(txTexture("corrugatedRoof", { seed: 1, repeat: Math.max(1, Math.round(w / 8)) }), { color: txBayTint(tone, 0.4), rough: 0.6, metal: 0.3 });
  else if (style === "stucco") cap.material = paintedMat(txTexture("tileMosaic", { seed: 6, repeat: Math.max(1, Math.round(w / 4)) }), { rough: 0.7 });
  return g;
}

/** Scatter a handful of simple buildings across a zone's own footprint, in
 *  the style BUILDING_STYLE names for it (or none, for an open zone like the
 *  hills or the bridge approach). */
function dressZoneBuildings(parent, zone, count, rng) {
  const style = BUILDING_STYLE[zone.id];
  if (!style) return;
  const [cx, cz] = zone.centre;
  for (let i = 0; i < count; i++) {
    const a = rng() * Math.PI * 2, r = zone.radius * (0.15 + rng() * 0.75);
    const x = cx + Math.cos(a) * r, z = cz + Math.sin(a) * r;
    const tall = style === "glass";
    const w = tall ? 10 + rng() * 14 : 8 + rng() * 10;
    const d = tall ? 10 + rng() * 14 : 8 + rng() * 10;
    const h = tall ? 20 + rng() * 55 : style === "corrugated" ? 5 + rng() * 6 : 6 + rng() * 8;
    const tone = zone.palette.structure;
    const shade = bwShade(tone, 0.85 + rng() * 0.3), seed = Math.floor(rng() * 1000);
    // Every draw is taken first, so skipping a lot keeps the rest of the
    // zone's dressing where it was: no building stands in open water, only
    // on ground or on a quay (TX_BAY_QUAYS).
    const top = txWaterTopAt(x, z);
    if (top !== null && txQuayAt(x, z) < 0 && txGroundSurfaceAt(x, z) <= top + 0.1) continue;
    buildingBox(parent, x, z, w, d, h, style, shade, seed);
  }
}

// ------------------------------------------------------------ landmarks

function labelFor(parent, name, x, y, z) {
  return holoTag(parent, name, x, y, z, { w: 2.6, h: 0.6, accent: 0x4fd1ff });
}

function buildTower(parent, x, z, name) {
  const h = 62;
  buildingBox(parent, x, z, 16, 16, h, "glass", 0x1c2b36, 11);
  cyl(parent, 0.4, 0.4, 6, x, h + 3, z, 0xc9d0d6, { rough: 0.4, metal: 0.6, seg: 8, cast: false });
  ball(parent, 0.25, x, h + 6.2, z, 0xff5f5f, { emissive: 0xff5f5f, ei: 1.6, seg: 8, seg2: 6, cast: false });
  labelFor(parent, name, x, h + 8, z);
  return 4;
}

function buildTheatre(parent, x, z, name) {
  const g = group(parent, x, 0, z);
  const w = 22, d = 12, h = 9;
  const body = box(g, w, h, d, 0, h / 2, 0, 0x6b3a2e, { rough: 0.85 });
  body.material = paintedMat(facePaint("bw-theatre-brick", (c, cw, ch) => brickFace(c, cw, ch, { brick: [0x6b3a2e, 0x5f3226] }), { repeat: 6, px: 256 }), { rough: 0.85 });
  box(g, w * 0.7, 1.8, 2.2, 0, h * 0.55, d / 2 + 1, 0x7a1f2a, { rough: 0.5, emissive: 0x7a1f2a, ei: 0.3 });
  box(g, 1.6, 6, 0.6, w / 2 - 1.5, 4.2, d / 2 + 0.4, 0x1a1a1a, { emissive: 0xf2c14b, ei: 0.6, rough: 0.5 });
  labelFor(g, name, 0, h + 3, d / 2 + 1.5);
  return 5;
}

function buildPortCranes(parent, x, z, name) {
  const rng = bwSeededRng(303);
  let n = 0;
  for (let i = 0; i < 3; i++) {
    const cx = x + (i - 1) * 26, cz = z;
    const c = group(parent, cx, 0, cz);
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) { cyl(c, 0.5, 0.6, 22, sx * 5, 11, sz * 4, 0x6b7885, { rough: 0.55, metal: 0.55, seg: 8, cast: false }); n++; }
    box(c, 12, 1.0, 9, 0, 22, 0, 0x6b7885, { rough: 0.55, metal: 0.55, cast: false }); n++;
    const boom = box(c, 2.0, 1.4, 30, 0, 23.5, -12, 0x75828f, { rough: 0.55, metal: 0.55, cast: false }); n++;
    boom.rotation.x = -0.1;
    box(c, 3.0, 3.0, 3.0, 0, 20, 6, 0x4a5561, { rough: 0.6, metal: 0.4, cast: false }); n++;
    ball(c, 0.2, 0, 26, -2 - rng() * 4, 0xff5f5f, { emissive: 0xff5f5f, ei: 1.4, seg: 8, seg2: 6, cast: false }); n++;
  }
  labelFor(parent, name, x, 30, z + 10);
  return n;
}

function buildPlaza(parent, x, z, name, accent) {
  const g = group(parent, x, 0, z);
  const pad = box(g, 26, 0.15, 26, 0, 0.075, 0, 0xb9b29d, { rough: 0.85, cast: false });
  pad.material = paintedMat(facePaint("bw-plaza-paving", (c, cw, ch) => concreteFace(c, cw, ch, { finish: "smooth" }), { repeat: 6, px: 256 }), { rough: 0.85 });
  cyl(g, 3.2, 3.2, 0.3, 0, 0.2, 0, accent, { rough: 0.5, metal: 0.2, seg: 24, cast: false });
  cyl(g, 0.4, 0.4, 1.6, 0, 1.0, 0, 0xdfe6ec, { rough: 0.4, metal: 0.3, seg: 12 });
  for (const [bx, bz] of [[-9, -9], [9, -9], [-9, 9], [9, 9]]) parkBench(g, bx, 0, bz, { ry: Math.atan2(-bx, -bz) });
  labelFor(g, name, 0, 3, -13);
  return 8;
}

function buildTollPlaza(parent, x, z, name, accent) {
  const g = group(parent, x, 0, z);
  for (const bx of [-10, -3.3, 3.3, 10]) box(g, 2.2, 3.4, 5, bx, 1.7, 0, 0xdfe6ec, { rough: 0.5, metal: 0.2 });
  box(g, 30, 0.6, 6, 0, 3.6, 0, 0x2b2f33, { rough: 0.6, metal: 0.3 });
  for (const bx of [-10, -3.3, 3.3, 10]) box(g, 3.2, 0.15, 0.15, bx, 1.1, 3.2, accent, { rough: 0.4, emissive: accent, ei: 0.6 });
  labelFor(g, name, 0, 5, 4);
  return 6;
}

function buildStadiumBowl(parent, x, z, name, accent) {
  const g = group(parent, x, 0, z);
  const field = cyl(g, 34, 34, 0.1, 0, 0.05, 0, 0x3f8a44, { rough: 0.85, seg: 32, cast: false });
  field.material = paintedMat(facePaint("bw-stadium-field", (c, cw, ch) => grassFace(c, cw, ch, { stripes: 12 }), { repeat: 4, px: 256 }), { rough: 0.8 });
  let n = 1;
  const rows = 12;
  for (let i = 0; i < rows; i++) {
    const a = (i / rows) * Math.PI * 2;
    const bx = Math.sin(a) * 40, bz = Math.cos(a) * 40;
    const seg = box(g, 12, 8, 6, bx, 4, bz, 0x8b929a, { rough: 0.6, metal: 0.15, cast: false });
    seg.rotation.y = a; n++;
  }
  for (const [mx, mz] of [[38, 38], [-38, 38], [38, -38], [-38, -38]]) { lightMast(g, mx, 0, mz, { lit: 1.2 }); n += 10; }
  labelFor(g, name, 0, 20, 44);
  return n + 1;
}

function buildArenaBuilding(parent, x, z, name, accent) {
  const g = group(parent, x, 0, z);
  const shell = cyl(g, 24, 26, 16, 0, 8, 0, 0x2b3138, { rough: 0.6, metal: 0.2, seg: 24, cast: false });
  shell.material = paintedMat(facePaint("bw-arena-shell", (c, cw, ch) => concreteFace(c, cw, ch, { finish: "smooth" }), { repeat: 8, px: 256 }), { rough: 0.75 });
  cyl(g, 25, 25, 1.2, 0, 16.6, 0, accent, { rough: 0.5, emissive: accent, ei: 0.3, seg: 24, cast: false });
  box(g, 10, 6, 4, 0, 3, 27, 0xdfe6ec, { rough: 0.5 });
  labelFor(g, name, 0, 18, 0);
  return 4;
}

function buildTransitStation(parent, x, z, name, elevated) {
  const g = group(parent, x, 0, z);
  const deckY = elevated ? 7 : 0.1;
  if (elevated) for (const sx of [-10, 0, 10]) { cyl(g, 0.6, 0.7, deckY, sx, deckY / 2, 0, 0x8b98a5, { rough: 0.6, metal: 0.4, seg: 10, cast: false }); }
  box(g, 26, 0.5, 5, 0, deckY, 0, 0x75828f, { rough: 0.6, metal: 0.3, cast: false });
  box(g, 26.4, 3.2, 5.4, 0, deckY + 3.4, 0, 0xdfe6ec, { rough: 0.5, opacity: 0.55, cast: false });
  box(g, 27, 0.2, 6, 0, deckY + 5.2, 0, 0x4a5561, { rough: 0.6, metal: 0.3, cast: false });
  for (const bx of [-9, 9]) cyl(g, 0.08, 0.08, deckY + 5, bx, (deckY + 5) / 2, 2.8, 0xb9c0c6, { rough: 0.5, metal: 0.5, seg: 8, cast: false });
  labelFor(g, name, 0, deckY + 7, 0);
  return elevated ? 9 : 6;
}

function buildMarketStalls(parent, x, z, name) {
  const g = group(parent, x, 0, z);
  const tones = [0xb3261e, 0x2f6f8f, 0x3d6b3a, 0x8a7a2c, 0xb86bd6];
  let n = 0;
  for (let i = 0; i < 5; i++) {
    const sx = -16 + i * 8;
    box(g, 3.2, 0.1, 2.4, sx, 0.9, 0, 0x8b6a45, { rough: 0.8 }); n++;
    const awn = box(g, 3.6, 0.1, 2.8, sx, 2.1, 0, tones[i], { rough: 0.7, emissive: tones[i], ei: 0.15 });
    awn.rotation.x = 0.15; n++;
    box(g, 0.08, 1.9, 0.08, sx, 1.0, 1.2, 0x2b2f33, { rough: 0.6 }); n++;
  }
  labelFor(g, name, 0, 4, -3);
  return n;
}

function buildLookout(parent, x, z, name) {
  const g = group(parent, x, 0, z);
  box(g, 8, 0.15, 5, 0, 0.075, 0, 0xb9b29d, { rough: 0.85 });
  box(g, 8.2, 0.9, 0.08, 0, 0.9, -2.5, 0xb8c1c9, { rough: 0.5, metal: 0.4 });
  parkBench(g, 0, 0.15, 1.2, {});
  labelFor(g, name, 0, 2.5, -2.5);
  return 4;
}

function buildParkEntrance(parent, x, z, name, kind) {
  const g = group(parent, x, 0, z);
  let n = 0;
  if (kind === "lake-necklace") {
    const r = 30;
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      lightMast(g, Math.sin(a) * r, 0, Math.cos(a) * r, { lit: 1.0 });
      n += 10;
    }
  } else {
    for (const sx of [-2.2, 2.2]) { box(g, 0.4, 3, 0.4, sx, 1.5, 0, 0x5c4a34, { rough: 0.8 }); n++; }
    box(g, 5.2, 0.3, 0.4, 0, 3.1, 0, 0x5c4a34, { rough: 0.8 }); n++;
    for (let i = 0; i < 3; i++) { bwTreeCluster(g, -6 + i * 6, 4 + (i % 2) * 3, 400 + i); n += 3; }
  }
  labelFor(g, name, 0, kind === "lake-necklace" ? 3 : 4.5, kind === "lake-necklace" ? -33 : 4);
  return n;
}

function buildCivicBlock(parent, x, z, name, accent) {
  const g = group(parent, x, 0, z);
  const body = box(g, 16, 6, 10, 0, 3, 0, 0xcfd6dc, { rough: 0.8 });
  body.material = paintedMat(facePaint("bw-civic-block", (c, cw, ch) => blockFace(c, cw, ch, { block: 0xcfd6dc }), { repeat: 4, px: 256 }), { rough: 0.85 });
  for (const bx of [-4, 4]) box(g, 3.4, 3.6, 0.1, bx, 1.8, 5.05, 0x2b2f33, { rough: 0.6, metal: 0.3 });
  box(g, 15, 0.5, 0.2, 0, 6.2, 5.05, accent, { rough: 0.5, emissive: accent, ei: 0.4 });
  labelFor(g, name, 0, 8, 0);
  return 5;
}

function buildCollegeQuad(parent, x, z, name) {
  const g = group(parent, x, 0, z);
  let n = 0;
  for (const [bx, bz] of [[-14, -8], [14, -8], [0, 12]]) {
    buildingBox(g, bx, bz, 12, 10, 9 + (bx === 0 ? 3 : 0), "brick", 0x8b6a45, Math.abs(bx) + 3);
    n += 2;
  }
  cyl(g, 8, 8, 0.1, 0, 0.05, 0, 0x3f8a44, { rough: 0.85, seg: 16, cast: false }); n++;
  labelFor(g, name, 0, 12, -14);
  return n;
}

function buildHospitalBlock(parent, x, z, name) {
  const g = group(parent, x, 0, z);
  const body = box(g, 20, 9, 10, 0, 4.5, 0, 0xcfd6dc, { rough: 0.8 });
  body.material = paintedMat(facePaint("bw-hospital-block", (c, cw, ch) => blockFace(c, cw, ch, { block: 0xcfd6dc }), { repeat: 5, px: 256 }), { rough: 0.85 });
  const cross = group(g, 8, 8, 5.06);
  box(cross, 1.6, 0.5, 0.1, 0, 0, 0, 0x4fd6a5, { emissive: 0x4fd6a5, ei: 1.5 });
  box(cross, 0.5, 1.6, 0.1, 0, 0, 0, 0x4fd6a5, { emissive: 0x4fd6a5, ei: 1.5 });
  box(g, 6, 0.2, 3.2, -6, 3.1, 5.6, 0x8b98a5, { rough: 0.6, metal: 0.4 });
  labelFor(g, name, 0, 11, 0);
  return 5;
}

function buildIndustrialBlock(parent, x, z, name, kind, rng) {
  const g = group(parent, x, 0, z);
  let n = 0;
  if (kind === "truck-yard") {
    fencePanel(g, -10, 0, -8, { ry: 0 }); n += 5;
    fencePanel(g, 10, 0, -8, { ry: 0 }); n += 5;
    boxTruck(g, -6, 0, 2, { ry: 0.1 }); n += 8;
    boxTruck(g, 6, 0, 2, { ry: -0.1 }); n += 8;
  } else {
    for (let i = 0; i < 3; i++) {
      buildingBox(g, -14 + i * 14, 0, 11, 9, 6 + rng() * 3, "corrugated", 0x8b929a, i + 5);
      n += 2;
    }
  }
  labelFor(g, name, 0, kind === "truck-yard" ? 5 : 9, 0);
  return n;
}

function buildMarinaDocks(parent, x, z, name) {
  const g = group(parent, x, 0, z);
  const dock = box(g, 3, 0.2, 26, 0, -0.15, 0, 0x8b6a45, { rough: 0.85, cast: false });
  const finger = box(g, 14, 0.2, 2.4, 6, -0.15, 4, 0x8b6a45, { rough: 0.85, cast: false });
  finger.rotation.y = Math.PI / 2;
  for (const bz of [-8, 0, 8]) cyl(g, 0.18, 0.18, 1.6, -1.6, 0.6, bz, 0x5c4a34, { rough: 0.85, seg: 8, cast: false });
  labelFor(g, name, 0, 3, -14);
  return 5;
}

// ------------------------------------------------- the expansion's set pieces

/** A marina with berths: a main float, finger docks off it at regular
 *  spacing and a small hull moored in every other berth — the island's yacht
 *  harbour, the north shoreline's marina and the south shoreline's marina
 *  all build this at their own site. `berths` finger docks, so a caller can
 *  size it to its zone. */
function buildMarina(parent, x, z, name, accent, berths = 6) {
  const g = group(parent, x, 0, z);
  let n = 0;
  const len = berths * 6 + 6;
  box(g, 3, 0.25, len, 0, -0.1, 0, 0x8b6a45, { rough: 0.85, cast: false }); n++;
  for (let i = 0; i < berths; i++) {
    const bz = -len / 2 + 6 + i * 6;
    box(g, 12, 0.2, 1.6, 7.5, -0.12, bz, 0x8b6a45, { rough: 0.85, cast: false }); n++;
    cyl(g, 0.16, 0.16, 1.4, 1.8, 0.5, bz, 0x5c4a34, { rough: 0.85, seg: 8, cast: false }); n++;
    if (i % 2 === 0) {
      // A small hull alongside the finger: a low white box and a cabin.
      box(g, 7, 0.9, 2.4, 8, 0.25, bz + 2.6, 0xf2f2ee, { rough: 0.5, metal: 0.1, cast: false }); n++;
      box(g, 2.6, 1.0, 1.8, 7.5, 1.2, bz + 2.6, accent, { rough: 0.5, metal: 0.1, cast: false }); n++;
    }
  }
  cyl(g, 0.12, 0.12, 6, -2.2, 3, -len / 2 + 2, 0xb9c0c6, { rough: 0.5, metal: 0.5, seg: 8, cast: false }); n++;
  ball(g, 0.22, -2.2, 6.2, -len / 2 + 2, 0xffd27a, { emissive: 0xffd27a, ei: 1.2, seg: 8, seg2: 6, cast: false }); n++;
  labelFor(g, name, 0, 4, -len / 2 - 3);
  return n + 1;
}

/** A clock on a post at the head of a ferry ramp, plus the ramp itself. */
function buildClockPost(parent, x, z, name, accent) {
  const g = group(parent, x, 0, z);
  box(g, 10, 0.15, 6, 0, 0.075, 0, 0xb9b29d, { rough: 0.85, cast: false });
  const ramp = box(g, 4, 0.2, 12, 0, 0.3, 9, 0x8b98a5, { rough: 0.6, metal: 0.3, cast: false });
  ramp.rotation.x = 0.06;
  cyl(g, 0.16, 0.2, 4.2, 0, 2.1, -1.5, 0x2b2f33, { rough: 0.5, metal: 0.5, seg: 10, cast: false });
  cyl(g, 0.8, 0.8, 0.25, 0, 4.6, -1.5, 0xf6f1e4, { rough: 0.4, metal: 0.1, seg: 20, emissive: 0xf6f1e4, ei: 0.25, cast: false });
  box(g, 0.08, 0.5, 0.05, 0, 4.8, -1.35, accent, { rough: 0.4, cast: false });
  box(g, 0.35, 0.08, 0.05, 0.14, 4.6, -1.35, accent, { rough: 0.4, cast: false });
  labelFor(g, name, 0, 6.2, -1.5);
  return 7;
}

/** A paved walk along a sandy beach with benches facing the water. */
function buildEsplanade(parent, x, z, name) {
  const g = group(parent, x, 0, z);
  let n = 0;
  box(g, 40, 0.12, 4, 0, 0.06, 0, 0xb9b29d, { rough: 0.85, cast: false }); n++;
  const sand = box(g, 40, 0.08, 14, 0, 0.04, 9, 0xd9c79a, { rough: 0.95, cast: false }); n++;
  sand.receiveShadow = true;
  for (const bx of [-14, -4, 6, 16]) { parkBench(g, bx, 0.12, -1.2, { ry: Math.PI }); n += 4; }
  for (const bx of [-18, 0, 18]) { lightMast(g, bx, 0, -3, { lit: 0.8 }); n += 10; }
  labelFor(g, name, 0, 3.5, -4);
  return n + 1;
}

/** A long public pier on piles, railed both sides, with a lamp at the end. */
function buildPier(parent, x, z, name) {
  const g = group(parent, x, 0, z);
  let n = 0;
  const len = 48;
  box(g, 5, 0.3, len, 0, 0.9, 0, 0x8b6a45, { rough: 0.85, cast: false }); n++;
  for (let i = 0; i < 6; i++) {
    const bz = -len / 2 + 4 + i * 8;
    for (const sx of [-2, 2]) { cyl(g, 0.22, 0.26, 1.6, sx, 0.2, bz, 0x4a3a28, { rough: 0.9, seg: 8, cast: false }); n++; }
  }
  for (const sx of [-2.4, 2.4]) { box(g, 0.08, 0.9, len, sx, 1.5, 0, 0xb8c1c9, { rough: 0.5, metal: 0.4, cast: false }); n++; }
  lightMast(g, 0, 1.05, len / 2 - 2, { lit: 1.0 }); n += 10;
  labelFor(g, name, 0, 4.5, -len / 2 - 2);
  return n + 1;
}

/** The ridge lookout: a raised viewing deck on posts, a rail, a trail
 *  signpost and a bench — the summit of the upper hills' trail. */
function buildRidgeSummit(parent, x, z, name, accent) {
  const g = group(parent, x, 0, z);
  let n = 0;
  for (const [px, pz] of [[-3, -2], [3, -2], [-3, 2], [3, 2]]) { cyl(g, 0.2, 0.24, 2.2, px, 1.1, pz, 0x4a3a28, { rough: 0.9, seg: 8, cast: false }); n++; }
  box(g, 8, 0.25, 5, 0, 2.3, 0, 0x8b6a45, { rough: 0.85, cast: false }); n++;
  box(g, 8.2, 0.9, 0.08, 0, 2.9, -2.5, 0xb8c1c9, { rough: 0.5, metal: 0.4, cast: false }); n++;
  for (const sx of [-4.05, 4.05]) { box(g, 0.08, 0.9, 5, sx, 2.9, 0, 0xb8c1c9, { rough: 0.5, metal: 0.4, cast: false }); n++; }
  parkBench(g, 0, 2.42, 1.4, {}); n += 4;
  cyl(g, 0.08, 0.1, 2.6, 6, 1.3, 1, 0x5c4a34, { rough: 0.85, seg: 8, cast: false }); n++;
  box(g, 1.4, 0.3, 0.06, 6.6, 2.4, 1, accent, { rough: 0.5, emissive: accent, ei: 0.2, cast: false }); n++;
  labelFor(g, name, 0, 5, -2.5);
  return n + 1;
}

/** A lit navigation buoy at the channel's edge: a float, a lattice mast and
 *  a light. */
function buildChannelMarker(parent, x, z, name, accent) {
  const g = group(parent, x, 0, z);
  cyl(g, 1.6, 1.4, 1.2, 0, 0.2, 0, accent, { rough: 0.5, metal: 0.3, seg: 16, cast: false });
  cyl(g, 0.12, 0.16, 4.4, 0, 3.0, 0, 0x2b2f33, { rough: 0.5, metal: 0.6, seg: 8, cast: false });
  box(g, 1.2, 0.08, 1.2, 0, 4.2, 0, 0x2b2f33, { rough: 0.5, metal: 0.6, cast: false });
  ball(g, 0.3, 0, 5.5, 0, 0xff5f5f, { emissive: 0xff5f5f, ei: 1.8, seg: 8, seg2: 6, cast: false });
  labelFor(g, name, 0, 7.2, 0);
  return 5;
}

const LANDMARK_BUILDERS = {
  "downtown-tower": (p, x, z, l) => buildTower(p, x, z, l.name),
  "historic-theatre": (p, x, z, l) => buildTheatre(p, x, z, l.name),
  "port-cranes": (p, x, z, l) => buildPortCranes(p, x, z, l.name),
  "waterfront-square": (p, x, z, l, zone) => buildPlaza(p, x, z, l.name, zone.palette.accent),
  "bridge-approach-plaza": (p, x, z, l, zone) => buildTollPlaza(p, x, z, l.name, zone.palette.accent),
  "civic-stadium": (p, x, z, l, zone) => buildStadiumBowl(p, x, z, l.name, zone.palette.accent),
  "bayside-arena": (p, x, z, l, zone) => buildArenaBuilding(p, x, z, l.name, zone.palette.accent),
  "elevated-transit-station": (p, x, z, l) => buildTransitStation(p, x, z, l.name, true),
  "rail-depot": (p, x, z, l) => buildTransitStation(p, x, z, l.name, false),
  "market-street-stalls": (p, x, z, l) => buildMarketStalls(p, x, z, l.name),
  "overlook-point": (p, x, z, l) => buildLookout(p, x, z, l.name),
  "redwood-grove-entrance": (p, x, z, l) => buildParkEntrance(p, x, z, l.name, "redwood"),
  "lake-necklace": (p, x, z, l) => buildParkEntrance(p, x, z, l.name, "lake-necklace"),
  "tidewater-shoreline-park": (p, x, z, l) => buildParkEntrance(p, x, z, l.name, "shoreline"),
  "fire-station": (p, x, z, l, zone) => buildCivicBlock(p, x, z, l.name, zone.palette.accent),
  "union-hall": (p, x, z, l, zone) => buildCivicBlock(p, x, z, l.name, zone.palette.accent),
  "bay-city-college": (p, x, z, l) => buildCollegeQuad(p, x, z, l.name),
  "bay-general-hospital": (p, x, z, l) => buildHospitalBlock(p, x, z, l.name),
  "warehouse-district": (p, x, z, l, zone, rng) => buildIndustrialBlock(p, x, z, l.name, "warehouse", rng),
  "truck-yard": (p, x, z, l, zone, rng) => buildIndustrialBlock(p, x, z, l.name, "truck-yard", rng),
  // The marina's floats lie in the water beside its quay (TX_MARINA_FLOATS).
  "estuary-marina": (p, x, z, l) => buildMarinaDocks(p, ...(TX_MARINA_FLOATS[l.id] ?? [x, z]), l.name),
  // The expansion's landmarks.
  "island-ferry-landing-clock": (p, x, z, l, zone) => buildClockPost(p, x, z, l.name, zone.palette.accent),
  "island-beach-esplanade": (p, x, z, l) => buildEsplanade(p, x, z, l.name),
  "north-pier": (p, x, z, l) => buildPier(p, x, z, l.name),
  "emery-public-market": (p, x, z, l) => buildMarketStalls(p, x, z, l.name),
  "south-shoreline-park": (p, x, z, l) => buildParkEntrance(p, x, z, l.name, "shoreline"),
  "ridge-trail-summit": (p, x, z, l, zone) => buildRidgeSummit(p, x, z, l.name, zone.palette.accent),
  "channel-marker": (p, x, z, l, zone) => buildChannelMarker(p, x, z, l.name, zone.palette.accent),
};

/** Site-anchored set pieces the expansion's zones build beyond their
 *  landmarks: a marina with berths at each of the three marina sites. Keyed
 *  by BAY_SITES id; the site stands on its quay, and the marina's floats lie
 *  at the site's TX_MARINA_FLOATS water point beside it (the site's own
 *  position where none is listed). */
const SITE_BUILDERS = {
  "island-yacht-harbor": (p, x, z, s, zone) => buildMarina(p, ...(TX_MARINA_FLOATS[s.id] ?? [x, z]), s.name, zone.palette.accent, 8),
  "north-marina-pier": (p, x, z, s, zone) => buildMarina(p, ...(TX_MARINA_FLOATS[s.id] ?? [x, z]), s.name, zone.palette.accent, 5),
  "south-shoreline-marina": (p, x, z, s, zone) => buildMarina(p, ...(TX_MARINA_FLOATS[s.id] ?? [x, z]), s.name, zone.palette.accent, 6),
};

// -------------------------------------------------------------- scenery

/** A simple two-tone tree — the hill slopes' own scatter, independent of
 *  shared/fairway.js's private bwTreeCluster() (not exported from that
 *  module). */
function bwTreeCluster(parent, x, z, seed) {
  const r = bwSeededRng(seed);
  const g = group(parent, x, 0, z, r() * Math.PI * 2);
  const trunkH = 3 + r() * 3;
  cyl(g, 0.18, 0.26, trunkH, 0, trunkH / 2, 0, 0x4a3a28, { rough: 0.9, seg: 8, cast: false });
  ball(g, 2 + r() * 1.2, 0, trunkH + 1.6, 0, r() < 0.5 ? 0x2f6b34 : 0x39793d, { rough: 0.95, seg: 8, seg2: 6, cast: false });
  return g;
}

function dressHillTrees(parent, zone, count, rng) {
  const [cx, cz] = zone.centre;
  for (let i = 0; i < count; i++) {
    const a = rng() * Math.PI * 2, r = zone.radius * (0.1 + rng() * 0.85);
    bwTreeCluster(parent, cx + Math.cos(a) * r, cz + Math.sin(a) * r, Math.floor(rng() * 1e6));
  }
}

const BW_FLEET_BUILDERS = [sedan, pickup, cargoVan];
/** The service a zone's parked work vehicles are painted for (fleet.js's
 *  CT_SERVICE_LIVERIES); sedans stay private cars in every zone. */
export const CT_ZONE_SERVICE = {
  downtown: "transit", uptown: "construction", lake: "utility", "estuary-waterfront": "port", port: "port",
  "west-oakland": "delivery", fruitvale: "utility", coliseum: "emergency", hills: "utility", "bridge-approach": "construction",
  "island-harbour": "port", "north-shoreline": "utility", "emery-crossing": "delivery", "south-shoreline": "utility",
  "upper-hills": "construction", "outer-bay": "port",
};
function dressParkedFleet(parent, zone, count, rng) {
  const [cx, cz] = zone.centre;
  for (let i = 0; i < count; i++) {
    const fn = BW_FLEET_BUILDERS[Math.floor(rng() * BW_FLEET_BUILDERS.length)];
    const a = rng() * Math.PI * 2, r = zone.radius * (0.2 + rng() * 0.6);
    const livery = fn === sedan ? undefined : ctServiceLivery(CT_ZONE_SERVICE[zone.id], i + 1);
    fn(parent, cx + Math.cos(a) * r, 0, cz + Math.sin(a) * r, { ry: rng() * Math.PI * 2, ...(livery ? { livery } : {}) });
  }
}

const PROP_BUILDERS = [
  (p, x, z, o) => streetTree(p, x, 0, z, o),
  (p, x, z, o) => parkBench(p, x, 0, z, o),
  (p, x, z, o) => lightMast(p, x, 0, z, { ...o, lit: 1.0 }),
  (p, x, z) => fireHydrant(p, x, 0, z),
];
function dressStreetFurniture(parent, zone, count, rng) {
  const [cx, cz] = zone.centre;
  for (let i = 0; i < count; i++) {
    const fn = PROP_BUILDERS[Math.floor(rng() * PROP_BUILDERS.length)];
    const a = rng() * Math.PI * 2, r = zone.radius * (0.15 + rng() * 0.7);
    fn(parent, cx + Math.cos(a) * r, cz + Math.sin(a) * r, { ry: rng() * Math.PI * 2 });
  }
}

const FIGURE_OUTFITS = {
  port: "marine", "west-oakland": "construction", coliseum: "sport",
  "island-harbour": "marine", "north-shoreline": "marine", "south-shoreline": "marine", "emery-crossing": "construction",
};
function dressCrowd(parent, zone, count, rng) {
  const [cx, cz] = zone.centre;
  const outfit = FIGURE_OUTFITS[zone.id] ?? "office";
  for (let i = 0; i < count; i++) {
    const a = rng() * Math.PI * 2, r = zone.radius * (0.1 + rng() * 0.5);
    // Face cards at the tier's size, and on a phone a small set of looks so
    // the crowd's clothing canvases repeat rather than each painting its own.
    const lowTier = txTierPx(512) < 512;
    standingFigure(parent, cx + Math.cos(a) * r, cz + Math.sin(a) * r, { ry: rng() * Math.PI * 2, outfit,
      facePx: txTierPx(512), ...(lowTier ? { seed: 101 + (i % 6) * 977 } : {}) });
  }
}

function dressPortContainers(parent, zone, rng) {
  const [cx, cz] = zone.centre;
  const tones = [0x7a3a2c, 0x2c5a7a, 0x3d6b3a, 0x8a7a2c];
  for (let i = 0; i < 3; i++) {
    const x = cx - 60 + i * 22, z = cz - 40;
    for (let r = 0; r < 2; r++) for (let h = 0; h < 3; h++) {
      shippingContainer(parent, x, h * 2.65, z + r * 2.6, { livery: { colour: tones[(i + r + h) % tones.length] } });
    }
  }
}

// ---------------------------------------------------------------- assembly

/** Zones that are open ground or open water: few parked cars, little street
 *  furniture, no crowd. */
const OPEN_ZONES = new Set(["hills", "bridge-approach", "upper-hills", "outer-bay"]);

/** Everything that belongs to one zone: its own buildings, scenery, crowd
 *  and (for the port, the hills, the ridge and the marinas) its own special
 *  dressing. */
function buildZoneContent(parent, zone, opts) {
  const rng = bwSeededRng(zone.id.split("").reduce((a, c) => a * 31 + c.charCodeAt(0), 7));
  const buildingCounts = {
    downtown: 14, uptown: 10, "west-oakland": 12, fruitvale: 10, coliseum: 8,
    port: 6, lake: 4, "bridge-approach": 3, hills: 0,
    "island-harbour": 6, "north-shoreline": 6, "emery-crossing": 8, "south-shoreline": 4, "upper-hills": 0, "outer-bay": 0,
  };
  const open = OPEN_ZONES.has(zone.id);
  dressZoneBuildings(parent, zone, buildingCounts[zone.id] ?? 6, rng);
  if (zone.id === "hills") dressHillTrees(parent, zone, 30, rng);
  if (zone.id === "upper-hills") dressHillTrees(parent, zone, 24, rng);
  if (zone.id === "port") dressPortContainers(parent, zone, rng);
  if (zone.id !== "outer-bay") dressParkedFleet(parent, zone, open ? 1 : 3, rng);
  dressStreetFurniture(parent, zone, zone.id === "outer-bay" ? 0 : open ? 2 : 5, rng);
  dressCrowd(parent, zone, open ? 0 : 2, rng);

  for (const landmark of BAY_LANDMARKS) {
    if (landmark.zone !== zone.id) continue;
    const build = LANDMARK_BUILDERS[landmark.id];
    if (!build) continue;
    build(parent, landmark.position[0], landmark.position[1], landmark, zone, rng);
  }
  for (const site of BAY_SITES) {
    if (site.zone !== zone.id) continue;
    const build = SITE_BUILDERS[site.id];
    if (!build) continue;
    build(parent, site.position[0], site.position[1], site, zone, rng);
  }
}

/** The whole world (or one named zone): terrain, water, roads, every zone's
 *  own buildings, scenery, crowd and landmarks. LOD 0 — documented budget
 *  BAY_MESH_BUDGET.high. */
function buildWorld(parent, opts) {
  const zones = opts.zone ? BAY_ZONES.filter((z) => z.id === opts.zone) : BAY_ZONES;
  const { minX, maxX, minZ, maxZ } = BAY_BOUNDS;
  const w = maxX - minX, d = maxZ - minZ, cx = (minX + maxX) / 2, cz = (minZ + maxZ) / 2;
  parent.add(bwTerrain(cx, cz, w, d));
  // Bay water across the port/estuary side of the world (west and south of
  // downtown), the same shoreline the port and estuary-waterfront zones sit
  // against.
  // The expansion's water: the outer bay and its shipping channel west of
  // the port, the open water the north shoreline's marina and pier face, and
  // the strip of bay along the world's southern edge that the island and the
  // south shoreline both look out on; then the lake. Every body is laid over
  // its TX_BAY_WATER rectangle grown by twice TX_SHORE_MARGIN, over a
  // terrain carved beneath it (bayworld-data.js's water header), so the
  // ground never covers the water again.
  for (const [wx, wz, ww, wd, wy] of TX_BAY_WATER) {
    buildWater(parent, wx, wz, ww + TX_SHORE_MARGIN * 4, wd + TX_SHORE_MARGIN * 4, wy);
  }
  // The quays the port, the estuary front, the island and the south shore
  // stand on, where their water carves the ground away (TX_BAY_QUAYS). A
  // one-zone build lays only the quays inside that zone.
  for (const [qx, qz, qw, qd] of TX_BAY_QUAYS) {
    if (opts.zone && bayZoneAt(qx, qz).id !== opts.zone) continue;
    buildQuay(parent, qx, qz, qw, qd);
  }
  if (!opts.zone) buildRoads(parent, BAY_ROADS);
  else buildRoads(parent, BAY_ROADS.filter((r) => r.points.some(([x, z]) => bayZoneAt(x, z).id === opts.zone)));
  for (const zone of zones) buildZoneContent(parent, zone, opts);
  return {};
}

/** A compact street-corner vignette near the world origin, independent of
 *  the zone/site/landmark data — sized for the shared SmartCiti.X stage's own
 *  scenic-district budget (SCENIC_BUDGET, see smartcity/js/districts.js),
 *  the same convention shared/fairway.js's own buildPreview() follows. */
function buildBayPreview(parent, opts) {
  parent.add(bwTerrain(0, 0, 90, 70, bayHeight));
  // The vignette's strip of water lies just over the highest ground under
  // it, so the uncarved preview terrain can never cover it.
  let shore = -Infinity;
  for (let x = -45; x <= 45; x += 5) for (let z = 29; z <= 47; z += 2) shore = Math.max(shore, bayHeight(x, z));
  buildWater(parent, 0, 38, 90, 18, shore + 0.08);
  roadRibbon(parent, [-20, -6], [20, -6], 4);
  buildingBox(parent, -22, 10, 14, 12, 34, "glass", 0x1c2b36, 3);
  buildingBox(parent, 20, 12, 12, 10, 8, "brick", 0x7a4a3a, 9);
  sedan(parent, -6, 0, -10, { ry: 0.2 });
  streetTree(parent, -14, 0, -4, { size: "medium" });
  parkBench(parent, -10, 0, -2, { ry: 0.4 });
  lightMast(parent, 12, 0, -2, { lit: 1.2 });
  fireHydrant(parent, 2, 0, -8);
  standingFigure(parent, -4, 4, { ry: 0.6, outfit: "office" });
  return {};
}

/**
 * Build Bay World.
 *   parent  a group (or scene) to build into
 *   opts    { detail: "low" | "high" (default "high"), zone: a BAY_ZONES id
 *             to build only that zone on a "high" build, time, weather }
 * Returns { detail, meshCount, merged, animate(t, dt) }. `meshCount` is the
 * authored count before mergeStatic() (see BAY_MESH_BUDGET's doc); `animate`
 * is a no-op placeholder today, kept so a caller wiring this into a district
 * or a game's own animate loop never has to special-case "this build
 * returned nothing" — see shared/fairway.js's buildFairwayPark() for the
 * same contract.
 */
export function buildBayWorld(parent, opts = {}) {
  const detail = opts.detail === "low" ? "low" : "high";
  const tod = bayLighting(opts.time);
  txBayPaletteName = `bayworld-${BAY_TIME[opts.time] ? opts.time : "night"}`;
  const hemi = new THREE.HemisphereLight(tod.hemi[0], tod.hemi[1], tod.hemiI);
  parent.add(hemi);
  const sun = new THREE.DirectionalLight(tod.key[0], tod.key[1]);
  sun.position.set(80, 120, 60);
  parent.add(sun);

  if (detail === "low") buildBayPreview(parent, opts);
  else buildWorld(parent, opts);

  let meshCount = 0;
  parent.traverse((o) => { if (o.isMesh || o.isPoints || o.isLine) meshCount += 1; });
  const merged = mergeStatic(parent);

  return {
    detail,
    meshCount,
    merged,
    animate() {},
  };
}
