import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import { box, cyl, ball, slab, group, decal, signFace } from "../../shared/kit.js";
import { CITY, surfaceTexture, texturedMat, deckPlateFace, pavingFace } from "./citykit.js";

// Interiors: a room for the stations that are actually indoors.
//
// A chlorine room, a machining cell and a theatre loft do not stand on a
// plaza under a city skyline, and putting them there was the last obvious
// lie in the environment. A station declares `indoor: "<style>"` and the
// stage builds a room around it instead: floor, walls, a roller door or an
// exit, a ceiling with real fittings, and rooflights that let the weather
// and the hour through so the room still knows what time it is.
//
// Nine styles, because nine is what the roster actually needs. Each is the
// same shell with different surfaces, dressing and light temperature, so
// the whole layer is about a hundred meshes rather than six separate rooms.

export const INTERIOR_STYLES = ["plant", "shop", "theatre", "service", "garage", "datahall", "kitchen", "clinic", "bar", "hotel"];

const STYLE = {
  plant: {
    label: "Plant room",
    wall: 0xbcc6cc, floor: 0x6d7379, trim: 0x8b959c, ceiling: 0x9aa4ab,
    lamp: 0xeaf4fb, lampI: 1.5, ambient: 0.55, w: 15, d: 11, h: 5.0,
    rooflights: 3, door: "personnel", grime: 0.5,
  },
  shop: {
    label: "Machine shop",
    wall: 0xc4cad0, floor: 0x4e5a63, trim: 0xf2c14b, ceiling: 0x8f989f,
    lamp: 0xf2f8ff, lampI: 1.8, ambient: 0.62, w: 17, d: 12, h: 5.6,
    rooflights: 4, door: "roller", grime: 0.3,
  },
  theatre: {
    label: "Stage house",
    wall: 0x23242a, floor: 0x191a1f, trim: 0xa079ff, ceiling: 0x14151a,
    lamp: 0xd9c7ff, lampI: 0.8, ambient: 0.3, w: 17, d: 13, h: 7.5,
    rooflights: 0, door: "dock", grime: 0.2,
  },
  service: {
    label: "Service room",
    wall: 0xd2d8dc, floor: 0x7b8288, trim: 0x4fb8c9, ceiling: 0xc2c9ce,
    lamp: 0xf4fbff, lampI: 1.4, ambient: 0.6, w: 12, d: 9, h: 4.2,
    rooflights: 1, door: "personnel", grime: 0.35,
  },
  garage: {
    label: "Maintenance bay",
    wall: 0xb3bcc3, floor: 0x585f66, trim: 0xf2a23b, ceiling: 0x8b959c,
    lamp: 0xeef5fb, lampI: 1.6, ambient: 0.58, w: 18, d: 13, h: 6.2,
    rooflights: 3, door: "roller", grime: 0.45,
  },
  // A hall has no windows on purpose — daylight is a heat load and a
  // security problem — so it is the one style with no rooflights at all,
  // and the only light in it is the light somebody installed.
  // A commercial kitchen: white tile walls, a quarry-tile floor that is
  // always a little wet, and the hood line the whole room is arranged under.
  kitchen: {
    label: "Commercial kitchen",
    wall: 0xe6ebee, floor: 0x7a5a48, trim: 0xb8c1c9, ceiling: 0xd8dde2,
    lamp: 0xf8fbff, lampI: 1.8, ambient: 0.62, w: 15, d: 11, h: 4.2,
    rooflights: 0, door: "personnel", grime: 0.3,
  },
  // A dental clinic: the quietest room in the roster. Acoustic-tile ceiling,
  // sheet-vinyl floor, no windows on the operatory side, four rows of light.
  clinic: {
    label: "Clinic",
    wall: 0xeef2f5, floor: 0xb9c4c9, trim: 0x7fd1c9, ceiling: 0xf2f5f7,
    lamp: 0xf6fbff, lampI: 1.6, ambient: 0.66, w: 12, d: 10, h: 3.4,
    rooflights: 0, door: "personnel", grime: 0.05,
  },
  // A bar: the darkest room after the theatre, warm light off the back bar,
  // a long bar top, and the well the whole shift is worked from.
  bar: {
    label: "Bar",
    wall: 0x4a3a30, floor: 0x2e2622, trim: 0xb8862b, ceiling: 0x2a2320,
    lamp: 0xffd9a0, lampI: 0.9, ambient: 0.36, w: 14, d: 10, h: 3.6,
    rooflights: 0, door: "personnel", grime: 0.25,
  },
  // A hotel floor: carpet, warm wall, the corridor's acoustic ceiling and the
  // soft light of a guest floor — where a housekeeping cart, a laundry plant
  // or a banquet set-up is worked.
  hotel: {
    label: "Hotel floor",
    wall: 0xe9e2d6, floor: 0x6b4a3f, trim: 0xb08a5a, ceiling: 0xf1ede6,
    lamp: 0xffe6c0, lampI: 1.2, ambient: 0.55, w: 15, d: 11, h: 3.0,
    rooflights: 0, door: "personnel", grime: 0.05,
  },
  datahall: {
    label: "Data hall",
    wall: 0xdfe4e9, floor: 0x3e4650, trim: 0x2f6f8c, ceiling: 0xc6ccd2,
    lamp: 0xf4fbff, lampI: 1.7, ambient: 0.5, w: 17, d: 12, h: 4.6,
    rooflights: 0, door: "personnel", grime: 0.1,
  },
};

/** The style a station asked for, or null when it belongs outdoors. */
export function interiorFor(indoor) {
  return INTERIOR_STYLES.includes(indoor) ? STYLE[indoor] : null;
}

/** A run of overhead pipe with hangers — plant rooms and service rooms. */
function overheadPipes(g, style, y, accent) {
  const runs = [[-3.2, 0x8b959c, 0.11], [-2.6, 0xb8853a, 0.07], [2.8, 0x7b8a86, 0.13], [3.3, accent, 0.06]];
  for (const [z, colour, r] of runs) {
    const pipe = cyl(g, r, r, style.w - 1.2, 0, y, z, colour, { rough: 0.5, metal: 0.55, seg: 12, cast: false });
    pipe.rotation.z = Math.PI / 2;
    for (let x = -style.w / 2 + 2; x < style.w / 2 - 1; x += 3.2) {
      cyl(g, 0.02, 0.02, 0.45, x, y + 0.24, z, 0x6d7379, { rough: 0.6, metal: 0.5, seg: 6, cast: false });
      box(g, r * 2.6, 0.04, r * 2.6, x, y + r + 0.02, z, 0x6d7379, { rough: 0.6, metal: 0.5, cast: false });
    }
  }
}

/** Roof trusses across the span — shops and garages. */
function trusses(g, style, y) {
  for (let z = -style.d / 2 + 2; z < style.d / 2 - 1; z += 3.4) {
    box(g, style.w - 0.6, 0.12, 0.12, 0, y, z, 0x6d7379, { rough: 0.55, metal: 0.5, cast: false });
    box(g, style.w - 0.6, 0.12, 0.12, 0, y - 0.7, z, 0x6d7379, { rough: 0.55, metal: 0.5, cast: false });
    for (let x = -style.w / 2 + 1.2; x < style.w / 2 - 0.5; x += 1.7) {
      const web = box(g, 0.06, 0.78, 0.06, x, y - 0.35, z, 0x6d7379, { rough: 0.55, metal: 0.5, cast: false });
      web.rotation.z = (x % 3.4 < 1.7) ? 0.42 : -0.42;
    }
  }
}

/** A black-walled fly tower with a catwalk — the theatre style. */
function flyTower(g, style, y, accent) {
  for (let i = 0; i < 6; i++) {
    const bar = cyl(g, 0.035, 0.035, style.w - 1.4, 0, y - 0.4 - i * 0.0, -3.6 + i * 1.3, 0x14151a, { rough: 0.5, metal: 0.6, seg: 8, cast: false });
    bar.rotation.z = Math.PI / 2;
  }
  const cat = box(g, style.w - 1.0, 0.08, 1.0, 0, y - 2.2, -style.d / 2 + 1.6, 0x2a2b31, { rough: 0.7, metal: 0.3, cast: false });
  for (const dz of [-0.45, 0.45]) box(g, style.w - 1.0, 0.7, 0.04, 0, y - 1.85, -style.d / 2 + 1.6 + dz, 0x2a2b31, { rough: 0.7, metal: 0.3, cast: false });
  box(g, style.w - 1.0, 0.05, 0.05, 0, y - 2.6, -style.d / 2 + 1.1, accent, { emissive: accent, ei: 0.7, rough: 0.5, cast: false });
  void cat;
}

/** The exhaust hood line along the back wall of a kitchen: stainless canopy,
 *  baffle filters, a duct up through the ceiling, and the fire-suppression
 *  nozzles that NFPA 96 puts over every appliance. */
function hoodLine(g, style, y, accent) {
  const z = -style.d / 2 + 1.35, w = style.w - 3;
  box(g, w, 0.9, 1.6, 0, y - 0.55, z, 0xc9d0d6, { rough: 0.35, metal: 0.8, cast: false });
  for (let x = -w / 2 + 0.6; x < w / 2 - 0.3; x += 0.55) box(g, 0.5, 0.42, 0.04, x, y - 0.72, z + 0.5, 0xaeb7bf, { rough: 0.4, metal: 0.7, cast: false });
  box(g, 1.2, 0.3, 1.2, -w / 4, y - 0.05, z, 0xb0b9c2, { rough: 0.45, metal: 0.7, cast: false });
  box(g, 1.2, 0.3, 1.2, w / 4, y - 0.05, z, 0xb0b9c2, { rough: 0.45, metal: 0.7, cast: false });
  for (let x = -w / 2 + 1.2; x < w / 2 - 0.6; x += 1.5) cyl(g, 0.03, 0.03, 0.22, x, y - 1.05, z + 0.2, 0xb3261e, { rough: 0.5, seg: 6, cast: false });
  box(g, w, 0.04, 0.04, 0, y - 1.0, z + 0.78, accent, { emissive: accent, ei: 0.5, rough: 0.5, cast: false });
}

/** The back bar along the back wall: shelved bottles under a lit mirror
 *  strip, the bar top with its rail, and the pendant lights over it. The
 *  well, the taps and everything the learner touches belong to the station. */
function backBar(g, style, h, accent) {
  const z = -style.d / 2 + 0.55, w = style.w - 4;
  box(g, w, 2.4, 0.5, 0, 1.2, z, 0x2b211c, { rough: 0.6, cast: false });
  for (let i = 0; i < 3; i++) box(g, w - 0.4, 0.04, 0.38, 0, 0.9 + i * 0.55, z + 0.02, 0xb8862b, { rough: 0.4, metal: 0.6, cast: false });
  box(g, w - 0.4, 0.05, 0.1, 0, 2.55, z + 0.2, accent, { emissive: accent, ei: 0.9, rough: 0.5, cast: false });
  const tones = [0x7a3a2c, 0x2c5a3a, 0xb8862b, 0x5a4a7a, 0x9a8a5a, 0x3a5a7a];
  for (let i = 0; i < 3; i++) for (let x = -w / 2 + 0.5; x < w / 2 - 0.3; x += 0.42) {
    cyl(g, 0.045, 0.045, 0.3, x, 1.07 + i * 0.55, z + 0.06, tones[(Math.round(x * 7) + i) % tones.length], { rough: 0.25, metal: 0.1, seg: 8, cast: false });
  }
  box(g, w + 1, 0.08, 0.7, 0, 1.08, z + 2.4, 0x3d2a1e, { rough: 0.35, metal: 0.05, cast: false });
  box(g, w + 1, 1.0, 0.12, 0, 0.55, z + 2.7, 0x2b211c, { rough: 0.6, cast: false });
  cyl(g, 0.025, 0.025, w + 0.8, 0, 1.18, z + 2.72, 0xb8862b, { rough: 0.3, metal: 0.8, seg: 8, cast: false }).rotation.z = Math.PI / 2;
  for (let x = -w / 2 + 1; x < w / 2; x += 2.2) {
    cyl(g, 0.01, 0.01, h - 1.9, x, h - (h - 1.9) / 2, z + 2.4, 0x1a1512, { rough: 0.6, seg: 4, cast: false });
    cyl(g, 0.16, 0.06, 0.16, x, 1.95, z + 2.4, 0xffd9a0, { emissive: 0xffd9a0, ei: 1.4, rough: 0.5, seg: 10, cast: false });
  }
}

/** A suspended acoustic-tile ceiling: the grid lines and the return grilles. */
function tileCeiling(g, style, y) {
  for (let x = -style.w / 2 + 0.6; x < style.w / 2; x += 0.6) box(g, 0.025, 0.02, style.d - 0.4, x, y, 0, 0xd0d5da, { rough: 0.6, metal: 0.3, cast: false });
  for (let z = -style.d / 2 + 0.6; z < style.d / 2; z += 0.6) box(g, style.w - 0.4, 0.02, 0.025, 0, y, z, 0xd0d5da, { rough: 0.6, metal: 0.3, cast: false });
  for (const [x, z] of [[-style.w * 0.3, -style.d * 0.3], [style.w * 0.3, style.d * 0.3]]) box(g, 0.58, 0.03, 0.58, x, y - 0.01, z, 0xaeb7bf, { rough: 0.5, metal: 0.5, cast: false });
}

/** Ladder tray, dual busway and a fibre run overhead — the data-hall style.
 *  The A and B busways are the point of the room: two feeds a metre apart in
 *  identical housings, which is what makes the hall maintainable and what
 *  makes working in it dangerous. */
function cableTrays(g, style, y, accent) {
  for (const z of [-3.9, 3.9]) {
    for (const dz of [-0.24, 0.24]) box(g, style.w - 1.0, 0.07, 0.05, 0, y, z + dz, 0x8f979e, { rough: 0.6, metal: 0.5, cast: false });
    for (let x = -style.w / 2 + 1; x < style.w / 2 - 0.6; x += 0.55) box(g, 0.05, 0.04, 0.5, x, y, z, 0x8f979e, { rough: 0.6, metal: 0.5, cast: false });
    for (let x = -style.w / 2 + 1.6; x < style.w / 2 - 1; x += 2.8) cyl(g, 0.02, 0.02, 0.55, x, y + 0.3, z, 0x6d7379, { rough: 0.6, metal: 0.5, seg: 6, cast: false });
    const bundle = cyl(g, 0.1, 0.1, style.w - 1.2, 0, y + 0.12, z, 0x2f3a45, { rough: 0.7, seg: 8, cast: false });
    bundle.rotation.z = Math.PI / 2;
  }
  for (const [z, tone] of [[-2.3, 0xb34b3a], [2.3, 0x2f6f8c]]) {
    box(g, style.w - 1.4, 0.26, 0.26, 0, y - 0.4, z, tone, { rough: 0.5, metal: 0.5, cast: false });
    for (let x = -style.w / 2 + 2.6; x < style.w / 2 - 1.6; x += 3.4) {
      box(g, 0.5, 0.42, 0.44, x, y - 0.72, z, 0x2a3138, { rough: 0.6, metal: 0.4, cast: false });
      ball(g, 0.045, x + 0.18, y - 0.58, z + 0.24, 0x59c97b, { emissive: 0x59c97b, ei: 1.4, cast: false, seg: 8, seg2: 6 });
    }
  }
  box(g, style.w - 1.0, 0.05, 0.3, 0, y + 0.6, 0, accent, { emissive: accent, ei: 0.45, rough: 0.5, cast: false });
}

/**
 * Build a room around the station.
 *   parent   a group inside the stage
 *   indoor   the style name the station declared
 *   accent   the station's accent, used on the trim stripe and a wall sign
 *   tod      { lift, mast, ambient } from the stage's time of day
 *   wx       the weather handle, so rooflights show what is happening outside
 * Returns { animate(t, dt), label } or null when the style is unknown.
 */
export function buildInterior(parent, indoor, { accent = CITY.accent, daylight = 0.25, weatherKind = "clear" } = {}) {
  const style = interiorFor(indoor);
  if (!style) return null;
  const g = new THREE.Group();
  parent.add(g);
  const { w, d, h } = style;

  // Floor: sealed concrete in the light styles, deck plate in the shop.
  const floorTex = surfaceTexture(
    (cx, cw, ch) => (indoor === "shop" || indoor === "garage" || indoor === "datahall"
      ? deckPlateFace(cx, cw, ch)
      : indoor === "kitchen" ? pavingFace(cx, cw, ch, { tiles: 6, base: "#7a5a48", base2: "#6b4e3e", seam: "rgba(240,230,215,0.55)" })
      : indoor === "clinic" ? pavingFace(cx, cw, ch, { tiles: 2, base: "#b9c4c9", base2: "#aeb9bf", seam: "rgba(0,0,0,0.12)" })
      : indoor === "bar" ? pavingFace(cx, cw, ch, { tiles: 8, base: "#3a2f28", base2: "#2b221d", seam: "rgba(0,0,0,0.5)" })
      : indoor === "hotel" ? pavingFace(cx, cw, ch, { tiles: 16, base: "#6b4a3f", base2: "#5e4037", seam: "rgba(0,0,0,0.06)" })
      : pavingFace(cx, cw, ch, { tiles: 3, base: "#6a7076", base2: "#5f656b" })),
    { repeat: indoor === "shop" ? 10 : indoor === "datahall" ? 14 : indoor === "kitchen" ? 12 : 6, px: 512 });
  const floor = box(g, w, 0.2, d, 0, -0.1, 0, style.floor, { rough: 0.85, metal: 0.1 });
  floor.material = texturedMat(floorTex, { rough: 0.8, metal: 0.12, color: style.floor });
  floor.receiveShadow = true;
  // A painted walkway and a hazard-yellow edge stripe, the way a real floor is marked.
  slab(g, w - 3.2, 0.01, 1.4, 0, 0.005, d / 2 - 1.6, 0x2f6f8c, { radius: 0.02, rough: 0.9, opacity: 0.35, transparent: true, cast: false });
  for (let i = 0; i < 2; i++) box(g, w - 3.2, 0.006, 0.07, 0, 0.008, d / 2 - 1.6 + (i ? 0.72 : -0.72), 0xf2c14b, { rough: 0.85, cast: false });

  // Walls, with a trim stripe at working height in the station's accent.
  const walls = [[w, h, 0.2, 0, h / 2, -d / 2], [w, h, 0.2, 0, h / 2, d / 2],
    [0.2, h, d, -w / 2, h / 2, 0], [0.2, h, d, w / 2, h / 2, 0]];
  // Painted block, not a flat swatch. The floor has had a texture since the
  // interiors went in; the walls are the largest surface in the room and were
  // still one uniform grey, which is most of why these rooms read as diagrams.
  // The maps are shared per finish, so this is texture memory rather than
  // draw calls — see surface() in shared/kit.js.
  // Tiled per axis against each wall's own dimensions, so the grain is the
  // same physical size on a long wall and a short one.
  const PER_M = 1 / 2.4;
  for (const [ww, hh, dd, x, y, z] of walls) {
    const across = Math.max(2, Math.round(Math.max(ww, dd) * PER_M));
    box(g, ww, hh, dd, x, y, z, style.wall,
      { rough: 0.9, metal: 0.05, finish: "painted", tile: [across, Math.max(2, Math.round(hh * PER_M))] });
  }
  for (const [ww, dd, x, z] of [[w, 0.06, 0, -d / 2 + 0.11], [0.06, d, -w / 2 + 0.11, 0], [0.06, d, w / 2 - 0.11, 0]]) {
    box(g, ww, 0.12, dd, x, 1.15, z, accent, { emissive: accent, ei: 0.35, rough: 0.6, cast: false });
    box(g, ww, 0.5, dd, x, 0.25, z, style.trim,
      { rough: 0.85, cast: false, finish: "concrete", tile: [Math.max(3, Math.round(Math.max(ww, dd) * PER_M)), 1] });
  }

  // Ceiling deck and its structure.
  box(g, w, 0.2, d, 0, h + 0.1, 0, style.ceiling,
    { rough: 0.9, finish: "painted", tile: [Math.round(w * PER_M), Math.round(d * PER_M)] });
  if (indoor === "theatre") flyTower(g, style, h - 0.4, accent);
  else if (indoor === "datahall") cableTrays(g, style, h - 0.9, accent);
  else if (indoor === "kitchen") hoodLine(g, style, h - 0.3, accent);
  else if (indoor === "clinic" || indoor === "hotel") tileCeiling(g, style, h - 0.02);
  else if (indoor === "bar") backBar(g, style, h, accent);
  else if (indoor === "shop" || indoor === "garage") trusses(g, style, h - 0.5);
  else overheadPipes(g, style, h - 0.7, accent);

  // Light fittings: emissive panels with one point light each.
  const lamps = [];
  const rows = indoor === "theatre" ? 2 : (indoor === "datahall" || indoor === "clinic") ? 4 : 3;
  for (let r = 0; r < rows; r++) {
    for (const sx of [-1, 1]) {
      const x = sx * w * 0.24;
      const z = -d / 2 + (d / (rows + 1)) * (r + 1);
      box(g, 1.5, 0.08, 0.3, x, h - 0.35, z, 0x3a4048, { rough: 0.6, metal: 0.4, cast: false });
      const panel = box(g, 1.35, 0.03, 0.22, x, h - 0.41, z, style.lamp,
        { emissive: style.lamp, ei: style.lampI, rough: 0.4, cast: false });
      const light = new THREE.PointLight(style.lamp, style.lampI * 0.9, 13, 2);
      light.position.set(x, h - 0.6, z);
      g.add(light);
      lamps.push(panel);
    }
  }
  g.add(new THREE.AmbientLight(0xc8d2dc, style.ambient));
  g.add(new THREE.HemisphereLight(0xdfe8f0, style.floor, 0.9));

  // Rooflights: the room's only honest connection to the hour and the
  // weather. Their brightness follows the time of day; in rain they go
  // grey and a faint running-water tint crosses them.
  const skylights = [];
  for (let i = 0; i < style.rooflights; i++) {
    const x = (i - (style.rooflights - 1) / 2) * (w / (style.rooflights + 0.6));
    box(g, 2.2, 0.1, 1.6, x, h + 0.02, -1.0, 0x2c343d, { rough: 0.6, metal: 0.4, cast: false });
    const glass = box(g, 2.0, 0.04, 1.4, x, h - 0.02, -1.0, 0xdce9f4,
      { emissive: 0xdce9f4, ei: daylight, rough: 0.2, cast: false, transparent: true, opacity: 0.85 });
    skylights.push(glass);
  }

  // The way out: a roller shutter, a personnel door, or a dock opening.
  if (style.door === "roller") {
    const rd = group(g, 0, 0, d / 2 - 0.12);
    box(rd, 4.6, 0.25, 0.4, 0, 4.1, 0, 0x5a626a, { rough: 0.6, metal: 0.4 });
    for (let i = 0; i < 12; i++) box(rd, 4.4, 0.28, 0.08, 0, 0.16 + i * 0.3, 0, 0x98a2aa, { rough: 0.7, metal: 0.35, cast: false });
    for (const sx of [-1, 1]) box(rd, 0.16, 4.0, 0.2, sx * 2.35, 2.0, 0, style.trim, { rough: 0.7, metal: 0.3 });
  } else if (style.door === "dock") {
    const op = group(g, 0, 0, d / 2 - 0.12);
    box(op, 3.4, 0.3, 0.3, 0, 4.4, 0, 0x2a2b31, { rough: 0.7 });
    for (const sx of [-1, 1]) box(op, 0.3, 4.4, 0.3, sx * 1.85, 2.2, 0, 0x2a2b31, { rough: 0.7 });
    box(op, 3.2, 4.2, 0.06, 0, 2.1, 0.05, 0x0c0d10, { rough: 0.95 });
  } else {
    const pd = group(g, w / 2 - 0.14, 0, d / 4);
    box(pd, 0.1, 2.1, 0.95, 0, 1.05, 0, 0x8f979e, { rough: 0.7, metal: 0.3 });
    box(pd, 0.12, 2.3, 1.15, 0.02, 1.15, 0, style.trim, { rough: 0.8 });
    ball(pd, 0.045, -0.08, 1.05, 0.35, 0xdfe6ec, { rough: 0.4, metal: 0.7, seg: 10, seg2: 8 });
    box(pd, 0.03, 0.22, 0.5, -0.07, 2.35, 0, 0x2f7d4a, { emissive: 0x2f7d4a, ei: 1.1, rough: 0.5, cast: false });
  }

  // The room says what it is and what the station's accent belongs to.
  decal(g, 2.4, 0.42, 0, 2.6, -d / 2 + 0.12, signFace(style.label.toUpperCase(), { bg: "#101820", accent: "#eaf6fb", scale: 0.5 }), { px: 512 });

  return {
    label: style.label,
    root: g,
    // The stage needs the room's footprint to decide how far a learner may
    // walk in it and where the door they start at is.
    w: style.w, d: style.d,
    animate(t) {
      // Fittings hum rather than sit dead; rooflights breathe with the sky.
      const flicker = 1 + Math.sin(t * 0.9) * 0.02;
      for (const p of lamps) p.material.emissiveIntensity = style.lampI * flicker;
      for (const s of skylights) {
        const rain = weatherKind === "rain" || weatherKind === "storm";
        s.material.emissiveIntensity = daylight * (rain ? 0.55 + Math.sin(t * 3.1) * 0.06 : 1);
      }
    },
  };
}
