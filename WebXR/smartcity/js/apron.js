import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import { box, cyl, slab, group, decal } from "../../shared/kit.js";
import { CITY, holoTag, cone, toolChest, equipmentCabinet, standingFigure } from "./citykit.js";

// The site around the work.
//
// Every station was authored as a 2-to-2.6 metre work area on a 15 metre
// plaza, and the learner was clamped to a 4.5 metre circle around the middle
// of it. You could turn on the spot and reach everything; you could not walk
// anywhere, and the other ten metres of ground were empty pavement.
//
// This fills that ground with the things a real job site has between the gate
// and the work: the entry with its sign-in board, a materials laydown, the
// crew truck and welfare unit, a muster point, and a waste and spill station.
// The learner now spawns outside the work area and walks in past all of it,
// which is both how a shift actually starts and the only way the extra ground
// becomes worth crossing.
//
// The apron is scenery. Nothing in it is a step target or a hazard: the
// procedure is still entirely inside the station's own geometry, so adding
// the apron changed no station's assessment. What it changes is the distance,
// and therefore whether the place reads as somewhere you are standing.

// Where the learner comes in from, and how far out the fence line sits. The
// plaza deck is 15m across with a walk ring at 13.6 and light masts at 11.5,
// so the fence goes just inside the masts and the zones sit between the work
// area and the fence.
export const APRON = {
  fence: 10.8,
  zone: 8.2,
  gateBearing: 0,     // +z, the direction a station already faces
  spawnRadius: 9.4,
};

const SIGN_BG = "#0d1319";

function signBoard(parent, x, z, ry, lines, o = {}) {
  const g = group(parent, x, 0, z, ry);
  const w = o.w ?? 1.5, h = o.h ?? 1.0, y = o.y ?? 1.5;
  for (const sx of [-1, 1]) cyl(g, 0.035, 0.04, y + h / 2, sx * (w / 2 - 0.12), (y + h / 2) / 2, 0, 0x4a535d, { rough: 0.5, metal: 0.6, seg: 10 });
  box(g, w + 0.08, h + 0.08, 0.05, 0, y, 0, 0x2c343d, { rough: 0.7 });
  decal(g, w, h, 0, y, 0.031, (c, cw, ch) => {
    c.fillStyle = o.bg ?? SIGN_BG; c.fillRect(0, 0, cw, ch);
    c.fillStyle = o.accentCss ?? CITY.accentCss; c.fillRect(0, 0, cw, Math.round(ch * 0.055));
    let ty = ch * 0.22;
    lines.forEach((line, i) => {
      const head = i === 0;
      c.fillStyle = head ? (o.accentCss ?? CITY.accentCss) : "#c9d6de";
      c.font = `${head ? 700 : 500} ${Math.round(ch * (head ? 0.15 : 0.092))}px 'Barlow Condensed', Arial, sans-serif`;
      c.textAlign = "left"; c.textBaseline = "middle";
      c.fillText(head ? String(line).toUpperCase() : String(line), cw * 0.06, ty);
      ty += ch * (head ? 0.19 : 0.125);
    });
  }, { px: 512, rough: 0.8 });
  return g;
}

// A pallet of stock: the unit a laydown area is actually counted in.
function pallet(parent, x, z, ry, color, o = {}) {
  const g = group(parent, x, 0, z, ry);
  for (let i = 0; i < 3; i++) box(g, 1.15, 0.035, 0.1, 0, 0.05, -0.4 + i * 0.4, 0x6b5a42, { rough: 0.95 });
  box(g, 1.15, 0.06, 1.0, 0, 0.12, 0, 0x7a6849, { rough: 0.95 });
  const n = o.layers ?? 3;
  for (let i = 0; i < n; i++) box(g, 1.02, 0.17, 0.86, 0, 0.24 + i * 0.19, 0, color, { rough: 0.85 });
  return g;
}

/**
 * Build the site apron. Returns where the learner starts, how far they may
 * walk, and an animate hook for the one thing on it that moves.
 */
export function buildApron(parent, o = {}) {
  const accent = o.accent ?? CITY.accent;
  const accentCss = o.accentCss ?? CITY.accentCss;
  const g = group(parent);
  const R = APRON.zone;

  // ------------------------------------------------------------ the fence line
  // Not a full ring — a site is fenced where it meets the public and open
  // where it meets the rest of the works. Two arcs, with the gate in the gap.
  //
  // Heras panels drawn honestly cost eleven meshes each, and a ring of them is
  // three hundred meshes of scenery nobody walks up to. One segment here is two
  // posts, two rails and a single mesh decal: four meshes, and at the six
  // metres you ever see it from it reads the same.
  const meshTex = (c, cw, ch) => {
    c.clearRect(0, 0, cw, ch);
    c.strokeStyle = "rgba(196,206,214,0.85)"; c.lineWidth = Math.max(1, cw * 0.006);
    for (let i = 0; i <= 16; i++) { const x = (i / 16) * cw; c.beginPath(); c.moveTo(x, 0); c.lineTo(x, ch); c.stroke(); }
    for (let i = 0; i <= 6; i++) { const y = (i / 6) * ch; c.beginPath(); c.moveTo(0, y); c.lineTo(cw, y); c.stroke(); }
  };
  const SEGS = 14, SEG_W = (Math.PI * 2 * APRON.fence) / SEGS - 0.35;
  for (let i = 0; i < SEGS; i++) {
    const a = (i / SEGS) * Math.PI * 2;
    // Leave a gap at the gate bearing and a second one opposite, for the
    // plant route that every site has and nobody draws.
    const d = Math.abs(((a - APRON.gateBearing + Math.PI) % (Math.PI * 2)) - Math.PI);
    if (d < 0.5 || Math.abs(d - Math.PI) < 0.4) continue;
    const seg = group(g, Math.sin(a) * APRON.fence, 0, Math.cos(a) * APRON.fence, a);
    for (const sx of [-1, 1]) cyl(seg, 0.028, 0.028, 2.0, sx * (SEG_W / 2), 1.0, 0, 0x8b949c, { rough: 0.5, metal: 0.6, seg: 6 });
    for (const y of [0.1, 1.95]) box(seg, SEG_W, 0.05, 0.035, 0, y, 0, 0x8b949c, { rough: 0.5, metal: 0.6, cast: false });
    decal(seg, SEG_W, 1.8, 0, 1.03, 0, meshTex, { px: 192, transparent: true, rough: 0.7 });
  }

  // ------------------------------------------------------------------ the gate
  const gx = Math.sin(APRON.gateBearing) * APRON.fence, gz = Math.cos(APRON.gateBearing) * APRON.fence;
  const gate = group(g, gx, 0, gz, APRON.gateBearing);
  for (const sx of [-1, 1]) {
    cyl(gate, 0.09, 0.11, 2.9, sx * 1.9, 1.45, 0, 0x3d464f, { rough: 0.5, metal: 0.6, seg: 12 });
    box(gate, 0.5, 0.5, 0.5, sx * 1.9, 0.25, 0, 0x2b323a, { rough: 0.9 });
  }
  box(gate, 4.1, 0.26, 0.14, 0, 2.86, 0, 0x3d464f, { rough: 0.5, metal: 0.5 });
  decal(gate, 3.7, 0.2, 0, 2.86, 0.08, (c, cw, ch) => {
    c.fillStyle = "#11181f"; c.fillRect(0, 0, cw, ch);
    c.fillStyle = accentCss;
    c.font = `700 ${Math.round(ch * 0.72)}px 'Barlow Condensed', Arial, sans-serif`;
    c.textAlign = "center"; c.textBaseline = "middle";
    c.fillText("SITE ACCESS — ALL VISITORS REPORT TO THE OFFICE", cw / 2, ch * 0.56);
  }, { px: 768, glow: true, ei: 0.5, rough: 0.6 });

  // Sign-in board and the PPE notice beside it: the two boards on every gate.
  signBoard(gate, -2.9, 0.9, 0.5, [
    "Site induction",
    "Sign in and sign out. Every visit.",
    "Hard hat · hi-vis · safety boots",
    "Eye and hearing protection in marked areas",
    "Report every incident, however small",
  ], { accentCss, w: 1.6, h: 1.15, y: 1.45 });
  signBoard(gate, 2.9, 0.9, -0.5, [
    "Today on site",
    "Permit holder at the work area",
    "First aider: crew truck",
    "Nearest hospital: 4.2 km — see office",
  ], { accentCss: "#5ad18a", w: 1.5, h: 1.0, y: 1.45 });

  // The walk in: a painted route from the gate to the work area, so there is
  // somewhere the learner is meant to be while crossing the open ground.
  const walk = decal(g, 2.6, APRON.fence - 3.2, Math.sin(APRON.gateBearing) * ((APRON.fence + 3.2) / 2), 0.04,
    Math.cos(APRON.gateBearing) * ((APRON.fence + 3.2) / 2), (c, cw, ch) => {
      c.clearRect(0, 0, cw, ch);
      // A tinted running surface, not two hairlines: this is the only thing
      // telling a learner which way the work is across ten metres of pavement.
      c.fillStyle = "rgba(240,198,92,0.16)";
      c.fillRect(cw * 0.08, 0, cw * 0.84, ch);
      c.strokeStyle = "#f6cb56"; c.lineWidth = Math.max(4, cw * 0.05);
      c.beginPath(); c.moveTo(cw * 0.08, 0); c.lineTo(cw * 0.08, ch);
      c.moveTo(cw * 0.92, 0); c.lineTo(cw * 0.92, ch); c.stroke();
      // Chevrons pointing at the work, spaced so one is always underfoot.
      c.fillStyle = "rgba(246,203,86,0.72)";
      for (let i = 0; i < 9; i++) {
        const y = ch - (i + 0.62) * (ch / 9);
        c.beginPath();
        c.moveTo(cw * 0.5, y - ch * 0.030);
        c.lineTo(cw * 0.76, y + ch * 0.016);
        c.lineTo(cw * 0.66, y + ch * 0.016);
        c.lineTo(cw * 0.5, y - ch * 0.008);
        c.lineTo(cw * 0.34, y + ch * 0.016);
        c.lineTo(cw * 0.24, y + ch * 0.016);
        c.closePath(); c.fill();
      }
      // The one word a site walkway always has painted on it.
      c.save();
      c.translate(cw * 0.5, ch * 0.5); c.rotate(-Math.PI / 2);
      c.fillStyle = "rgba(246,203,86,0.5)";
      c.font = `700 ${Math.round(cw * 0.2)}px 'Barlow Condensed', Arial, sans-serif`;
      c.textAlign = "center"; c.textBaseline = "middle";
      c.fillText("WALKWAY — KEEP INSIDE THE LINES", 0, 0);
      c.restore();
    }, { px: 320, transparent: true, rough: 0.9 });
  walk.rotation.x = -Math.PI / 2;
  walk.rotation.z = -APRON.gateBearing;

  // --------------------------------------------------------------- the zones
  // Each sits on the ring between the work area and the fence, far enough
  // apart that walking between them takes a few seconds.
  const at = (bearing, r = R) => [Math.sin(bearing) * r, Math.cos(bearing) * r];

  // Materials laydown — marked bays, pallets, pipe stock, drums on a bund.
  {
    const [x, z] = at(2.25);
    const lay = group(g, x, 0, z, 2.25 - Math.PI);
    const bay = decal(lay, 5.0, 3.4, 0, 0.03, 0, (c, cw, ch) => {
      c.clearRect(0, 0, cw, ch);
      c.strokeStyle = "#d8dde3"; c.lineWidth = Math.max(2, cw * 0.007);
      c.strokeRect(cw * 0.02, ch * 0.03, cw * 0.96, ch * 0.94);
      c.beginPath(); c.moveTo(cw / 3, ch * 0.03); c.lineTo(cw / 3, ch * 0.97);
      c.moveTo((cw * 2) / 3, ch * 0.03); c.lineTo((cw * 2) / 3, ch * 0.97); c.stroke();
    }, { px: 512, transparent: true, rough: 0.9 });
    bay.rotation.x = -Math.PI / 2;
    pallet(lay, -1.6, 0.2, 0.1, 0x8d7f6a, { layers: 3 });
    pallet(lay, 0.1, -0.3, -0.12, 0x5f6b74, { layers: 2 });
    for (let i = 0; i < 4; i++) {
      const p = cyl(lay, 0.085, 0.085, 3.0, 1.7 + (i % 2) * 0.19, 0.1 + Math.floor(i / 2) * 0.17, 0.2, 0x8a6b4a, { rough: 0.85, seg: 10 });
      p.rotation.x = Math.PI / 2;
    }
    box(lay, 1.5, 0.12, 1.1, 1.8, 0.06, -1.2, 0x4a535d, { rough: 0.8, metal: 0.3 });
    for (const dx of [-0.35, 0.35]) cyl(lay, 0.26, 0.26, 0.85, 1.8 + dx, 0.53, -1.2, 0x2f6fa8, { rough: 0.7, seg: 14 });
    signBoard(lay, -2.0, -1.9, 0.2, ["Laydown", "Stock in marked bays only", "Nothing stored in the walkway"], { accentCss, w: 1.2, h: 0.72, y: 1.2 });
    holoTag(lay, "materials laydown", 0, 1.1, 1.8, { css: accentCss, w: 0.6 });
  }

  // Crew truck and welfare unit — where the shift starts and the kit lives.
  {
    const [x, z] = at(4.05);
    const yard = group(g, x, 0, z, 4.05 - Math.PI);
    // Welfare cabin on skids.
    const cab = group(yard, -1.4, 0, 0);
    box(cab, 3.0, 0.18, 2.4, 0, 0.16, 0, 0x2f3740, { rough: 0.85 });
    slab(cab, 3.0, 2.35, 2.4, 0, 1.35, 0, 0xd8dde3, { radius: 0.05, rough: 0.7 });
    box(cab, 3.1, 0.14, 2.5, 0, 2.55, 0, 0x39424b, { rough: 0.7, metal: 0.3 });
    box(cab, 0.9, 1.95, 0.06, -0.9, 1.2, 1.21, 0x4a6b8a, { rough: 0.5 });
    for (const wx of [0.55, 1.5]) box(cab, 0.7, 0.6, 0.05, wx, 1.6, 1.21, 0x93b8d4, { rough: 0.25, metal: 0.4 });
    holoTag(cab, "welfare · first aid · muster list", 0, 2.75, 1.1, { css: "#5ad18a", w: 0.78 });
    // Crew truck: flatbed with a rack and a set of kit on it.
    const truck = group(yard, 2.2, 0, 0.2, -0.25);
    box(truck, 2.0, 0.55, 4.6, 0, 0.72, 0, 0x8a3a2f, { rough: 0.6, metal: 0.25 });
    slab(truck, 1.95, 1.15, 1.7, 0, 1.55, -1.3, 0x9c4536, { radius: 0.06, rough: 0.55, metal: 0.3 });
    box(truck, 1.7, 0.55, 0.05, 0, 1.75, -0.44, 0x9fc2d8, { rough: 0.25, metal: 0.45 });
    box(truck, 1.9, 0.06, 2.7, 0, 1.02, 1.0, 0x4a535d, { rough: 0.7, metal: 0.4 });
    for (const sz of [-0.1, 2.2]) for (const sx of [-1, 1]) cyl(truck, 0.07, 0.07, 1.0, sx * 0.9, 1.52, sz, 0x59636d, { rough: 0.5, metal: 0.6, seg: 8 });
    box(truck, 1.8, 0.1, 0.07, 0, 2.02, 1.05, 0x59636d, { rough: 0.5, metal: 0.6 });
    for (const [wx, wz] of [[-0.95, -1.5], [0.95, -1.5], [-0.95, 1.6], [0.95, 1.6]]) {
      const w = cyl(truck, 0.42, 0.42, 0.28, wx, 0.42, wz, 0x15181c, { rough: 0.95, seg: 14 });
      w.rotation.z = Math.PI / 2;
    }
    holoTag(truck, "crew truck", 0, 2.3, 1.05, { css: accentCss, w: 0.4 });
    toolChest(yard, 0.4, 1.5, { ry: 0.3 });
    standingFigure(yard, -0.1, 2.3, { ry: 2.6, cloth: 0xe3a534 });
  }

  // Muster point — green, visible from anywhere, with the headcount board.
  {
    const [x, z] = at(5.3, R + 0.8);
    const m = group(g, x, 0, z, 5.3 - Math.PI);
    const disc = decal(m, 3.0, 3.0, 0, 0.032, 0, (c, cw, ch) => {
      c.clearRect(0, 0, cw, ch);
      c.fillStyle = "rgba(42,140,84,0.65)";
      c.beginPath(); c.arc(cw / 2, ch / 2, cw * 0.46, 0, Math.PI * 2); c.fill();
      c.strokeStyle = "#8ff0b4"; c.lineWidth = cw * 0.02;
      c.beginPath(); c.arc(cw / 2, ch / 2, cw * 0.46, 0, Math.PI * 2); c.stroke();
    }, { px: 256, transparent: true, rough: 0.9 });
    disc.rotation.x = -Math.PI / 2;
    cyl(m, 0.05, 0.06, 2.4, 0, 1.2, -1.1, 0x4a535d, { rough: 0.5, metal: 0.6, seg: 10 });
    box(m, 1.0, 0.7, 0.05, 0, 2.2, -1.1, 0x1f7a46, { rough: 0.7 });
    decal(m, 0.92, 0.62, 0, 2.2, -1.07, (c, cw, ch) => {
      c.fillStyle = "#1f7a46"; c.fillRect(0, 0, cw, ch);
      c.fillStyle = "#eafff2";
      c.font = `700 ${Math.round(ch * 0.26)}px 'Barlow Condensed', Arial, sans-serif`;
      c.textAlign = "center"; c.textBaseline = "middle";
      c.fillText("MUSTER", cw / 2, ch * 0.3);
      c.font = `500 ${Math.round(ch * 0.16)}px 'Barlow Condensed', Arial, sans-serif`;
      c.fillText("ASSEMBLY POINT A", cw / 2, ch * 0.62);
      c.fillText("HEADCOUNT HERE", cw / 2, ch * 0.83);
    }, { px: 384, glow: true, ei: 0.45, rough: 0.7 });
    holoTag(m, "muster point A", 0, 0.42, 1.2, { css: "#5ad18a", w: 0.44 });
  }

  // Waste, spill kit and the wash station — the end of every shift.
  {
    const [x, z] = at(1.15, R - 0.4);
    const waste = group(g, x, 0, z, 1.15 - Math.PI);
    // Skip.
    const skip = group(waste, -0.9, 0, 0, 0.15);
    for (const [bw, bd, by] of [[2.6, 1.5, 0.05]]) box(skip, bw, 0.1, bd, 0, by, 0, 0x4a4036, { rough: 0.9 });
    for (const [sx, sz, sw, sd] of [[0, -0.75, 2.6, 0.08], [0, 0.75, 2.6, 0.08], [-1.3, 0, 0.08, 1.5], [1.3, 0, 0.08, 1.5]]) {
      box(skip, sw, 0.95, sd, sx, 0.55, sz, 0x8a5a30, { rough: 0.85, metal: 0.2 });
    }
    for (let i = 0; i < 3; i++) box(skip, 0.78, 0.3, 1.2, -0.82 + i * 0.82, 1.0, 0, i % 2 ? 0x6b6255 : 0x574f44, { rough: 0.95 });
    holoTag(skip, "segregated waste", 0, 1.35, 0.85, { css: accentCss, w: 0.5 });
    equipmentCabinet(waste, 0.8, 1.2, 0.45, 1.5, 0, { color: 0xd8b13a, accent: 0xd8b13a });
    holoTag(waste, "spill kit", 1.5, 1.45, 0.3, { css: "#f2c14b", w: 0.3 });
    // Wash / eyewash station.
    const wash = group(waste, 2.7, 0, -0.4, -0.2);
    cyl(wash, 0.06, 0.07, 1.35, 0, 0.67, 0, 0x2f8f5a, { rough: 0.6, metal: 0.4, seg: 10 });
    box(wash, 0.55, 0.12, 0.4, 0, 1.4, 0, 0x2f8f5a, { rough: 0.6 });
    cyl(wash, 0.26, 0.26, 0.1, 0, 1.0, 0.2, 0xdfe6ec, { rough: 0.5, seg: 14 });
    holoTag(wash, "emergency eyewash", 0, 1.68, 0, { css: "#5ad18a", w: 0.46 });
  }

  // Cones down the walkway, because a route is only a route if it is marked.
  for (const s of [-1, 1]) {
    for (let i = 0; i < 2; i++) {
      const d = 4.8 + i * 2.8;
      cone(g, Math.sin(APRON.gateBearing) * d + s * 1.35 * Math.cos(APRON.gateBearing),
        Math.cos(APRON.gateBearing) * d - s * 1.35 * Math.sin(APRON.gateBearing), {});
    }
  }

  const beacon = box(gate, 0.16, 0.1, 0.16, 0, 3.05, 0, 0xf2a03a,
    { emissive: 0xf2a03a, ei: 1.4, rough: 0.4, cast: false });
  void accent;

  return {
    root: g,
    // Where a shift starts: outside the gate, facing the work.
    spawn: {
      x: Math.sin(APRON.gateBearing) * APRON.spawnRadius,
      z: Math.cos(APRON.gateBearing) * APRON.spawnRadius,
      ry: APRON.gateBearing,
    },
    // How far out the learner may walk — just inside the fence line.
    roam: APRON.fence - 0.7,
    animate(t) {
      beacon.material.emissiveIntensity = 1.0 + Math.max(0, Math.sin(t * 2.2)) * 1.3;
    },
  };
}
