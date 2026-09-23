import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import { box, cyl, torus, lathe, hose, decal, repaint, slab, gradientFill, noiseTexture } from "./kit.js";
import { FL, flCss, flCanvasMat, flPanel, flBox, flSide, flRod, flStrut, flRig, flDone, flLivery } from "./fleet.js";

// Shared tool kit — hand and power tools, meters, radios and the small
// yard kit a pre-trip or a lift plan handles.
//
// Same contract as shared/fleet.js: `(parent, x, y, z, opts)`, metres, y = 0
// the surface the tool rests on, footprint centred, a baked shell plus named
// parts. Every tool costs four meshes or fewer after mergeStatic(): one per
// material in the shell, one per part. Meters carry a live screen
// (`userData.show(text)` repaints it) the way citykit's instrument() does.
// `opts.livery.colour` is the body colour; `opts.livery.fleetName` and
// `unitNumber` go on an asset tag where a tool has room for one. No tool
// carries a maker's name, badge or signature colour scheme.
// TOOLKIT_BUDGET below declares every builder's mesh count, footprint and
// parts, and tools/check_fleet.mjs holds each to it.

const TK_BODY = 0x3a78c9;        // a neutral tool blue, not any maker's colour

function tkRig(parent, x, y, z, opts, kind, offset = null) {
  return flRig(parent, x, y, z, opts, kind, offset);
}
function tkBody(opts, fallback = TK_BODY) {
  return flLivery(opts.livery, { colour: fallback, fleetName: "SMARTCITI FLEET", unitNumber: "T-001" });
}
const tkPaint = (c) => [c, { rough: 0.45, metal: 0.1, finish: "painted" }];
const TK_GRIP = [0x1b1d20, { rough: 0.85, finish: "rubber" }];
/** kit.slab() with `y` as the bottom face (slab itself sits half its height above y). */
function tkSlab(parent, w, h, d, x, y, z, colour, o = {}, extra = {}) {
  return slab(parent, w, h, d, x, y - h / 2, z, colour, { ...o, ...extra });
}

/** A repaintable screen (own canvas, own material) and a show(text) that redraws it. */
function tkScreen(rig, name, host, w, h, x, y, z, draw) {
  const p = rig.part(name, x, y, z, host);
  p.userData.fleetBake = false;
  const face = decal(p, w, h, 0, 0, 0, (g, cw, ch) => draw(g, cw, ch, null), { px: 256, glow: true, ei: 0.7 });
  rig.root.userData.screen = face;
  rig.root.userData.show = (text) => repaint(face, (g, cw, ch) => draw(g, cw, ch, text));
  return p;
}
function tkLcd(title, lines, o = {}) {
  return (g, w, h, text) => {
    g.fillStyle = o.bezel ?? "#22262b"; g.fillRect(0, 0, w, h);
    const sh = h * (o.screenFrac ?? 0.42);
    g.fillStyle = "#b9d3b0"; g.fillRect(w * 0.08, h * 0.06, w * 0.84, sh);
    g.fillStyle = "#15231a"; g.textAlign = "left"; g.textBaseline = "top";
    const rows = String(text ?? lines.join("\n")).split("\n");
    const lh = sh / Math.max(2, rows.length + 0.4);
    const cols = Math.max(4, ...rows.map((r) => r.length));
    g.font = `700 ${Math.round(Math.min(lh * 0.8, (w * 0.78) / (cols * 0.62)))}px monospace`;
    rows.forEach((r, i) => g.fillText(r, w * 0.12, h * 0.08 + i * lh));
    if (o.below) o.below(g, w, h, h * 0.06 + sh);
    if (title) { g.fillStyle = "#d9dde0"; g.font = `700 ${Math.round(h * 0.05)}px Arial`; g.textAlign = "center"; g.fillText(title, w / 2, h * 0.93); }
  };
}

// -------------------------------------------------------------- power tools

/** Cordless drill-driver standing on its battery. Parts: trigger. */
export function drill(parent, x, y, z, opts = {}) {
  const lv = tkBody(opts);
  const rig = tkRig(parent, x, y, z, opts, "drill");
  const S = rig.shell;
  tkSlab(S, 0.08, 0.075, 0.12, 0, 0, -0.01, ...TK_GRIP, { radius: 0.012 });          // battery
  box(S, 0.05, 0.13, 0.055, 0, 0.14, -0.03, ...TK_GRIP);                             // grip
  flRod(S, 0.036, 0.19, 0, 0.23, 0.0, "z", ...tkPaint(lv.colour), { seg: 16 });     // motor housing
  box(S, 0.06, 0.05, 0.1, 0, 0.21, -0.06, ...tkPaint(lv.colour));
  box(S, 0.058, 0.03, 0.09, 0, 0.09, -0.02, ...tkPaint(lv.colour));
  flRod(S, 0.024, 0.06, 0, 0.23, 0.12, "z", ...TK_GRIP, { seg: 14, r2: 0.02 });     // chuck
  flRod(S, 0.004, 0.06, 0, 0.23, 0.18, "z", ...FL.steel, { seg: 6 });               // bit
  const tr = rig.part("trigger", 0, 0.18, 0.005);
  box(tr, 0.014, 0.03, 0.018, 0, 0, 0, ...TK_GRIP);
  return flDone(rig, { footprint: TOOLKIT_BUDGET.drill.footprint });
}

/** 125 mm angle grinder with its guard and side handle. Parts: guard, disc. */
export function angleGrinder(parent, x, y, z, opts = {}) {
  const lv = tkBody(opts);
  const rig = tkRig(parent, x, y, z, opts, "angleGrinder");
  const S = rig.shell;
  flRod(S, 0.034, 0.24, 0, 0.045, -0.05, "z", ...tkPaint(lv.colour), { seg: 16 });
  flRod(S, 0.03, 0.06, 0, 0.045, -0.2, "z", ...TK_GRIP, { seg: 16 });
  box(S, 0.06, 0.055, 0.07, 0, 0.05, 0.1, ...TK_GRIP);                             // gearhead
  flRod(S, 0.012, 0.11, 0.08, 0.055, 0.1, "x", ...TK_GRIP, { seg: 10 });           // side handle
  const guard = rig.part("guard", 0, 0.03, 0.12);
  const gpts = [];
  for (let i = 0; i <= 10; i++) { const a = Math.PI * (0.05 + 0.9 * i / 10); gpts.push([-Math.cos(a) * 0.068, Math.sin(a) * 0.068]); }
  for (let i = 10; i >= 0; i--) { const a = Math.PI * (0.05 + 0.9 * i / 10); gpts.push([-Math.cos(a) * 0.058, Math.sin(a) * 0.058]); }
  const gd = flSide(guard, gpts, 0.028, 0, 0, 0, ...FL.steel, { bevel: 0.003 });
  gd.rotation.set(0, 0, 0); gd.rotation.x = -Math.PI / 2; gd.rotation.z = Math.PI / 2;
  const disc = rig.part("disc", 0, 0.012, 0.12);
  const dm = flCanvasMat("grinderDisc", 128, 128, (g, w, h) => {
    g.fillStyle = "#3a3d40"; g.fillRect(0, 0, w, h);
    noiseTexture(g, w, h, { density: 6000, alpha: 0.3, tone: "200,200,200" });
    g.fillStyle = "#c8201c"; g.fillRect(0, h * 0.4, w, h * 0.2);
  }, { rough: 0.9 });
  const d = new THREE.Mesh(new THREE.CylinderGeometry(0.0625, 0.0625, 0.004, 24), dm);
  disc.add(d);
  return flDone(rig, { footprint: TOOLKIT_BUDGET.angleGrinder.footprint });
}

/** Cordless 1/2 in impact wrench with a socket on the anvil. Parts: trigger. */
export function impactWrench(parent, x, y, z, opts = {}) {
  const lv = tkBody(opts);
  const rig = tkRig(parent, x, y, z, opts, "impactWrench");
  const S = rig.shell;
  tkSlab(S, 0.085, 0.075, 0.12, 0, 0, -0.015, ...TK_GRIP, { radius: 0.012 });
  box(S, 0.05, 0.12, 0.055, 0, 0.13, -0.03, ...TK_GRIP);
  flRod(S, 0.042, 0.15, 0, 0.225, -0.01, "z", ...tkPaint(lv.colour), { seg: 16 });
  flRod(S, 0.03, 0.04, 0, 0.225, 0.08, "z", ...tkPaint(lv.colour), { seg: 14 });
  flRod(S, 0.018, 0.05, 0, 0.225, 0.12, "z", ...FL.steel, { seg: 12 });            // socket
  const tr = rig.part("trigger", 0, 0.17, 0.0);
  box(tr, 0.014, 0.03, 0.018, 0, 0, 0, ...TK_GRIP);
  return flDone(rig, { footprint: TOOLKIT_BUDGET.impactWrench.footprint });
}

/** Click-type torque wrench, 1/2 in drive, lying flat. Parts: scale (the setting window). */
export function torqueWrench(parent, x, y, z, opts = {}) {
  const rig = tkRig(parent, x, y, z, opts, "torqueWrench");
  const S = rig.shell;
  flRod(S, 0.013, 0.36, 0, 0.016, 0.02, "z", ...FL.chrome, { seg: 12 });
  flRod(S, 0.017, 0.14, 0, 0.018, -0.2, "z", ...TK_GRIP, { seg: 12 });
  flRod(S, 0.022, 0.018, 0, 0.022, 0.22, "y", ...FL.chrome, { seg: 16 });           // ratchet head
  box(S, 0.012, 0.012, 0.012, 0, 0.004, 0.22, ...FL.chrome);                          // square drive
  const sc = rig.part("scale", 0, 0.03, -0.06);
  flPanel(sc, 0.018, 0.08, 0, 0, 0, flCanvasMat("torqueScale", 32, 128, (g, w, h) => {
    g.fillStyle = "#f2f2ea"; g.fillRect(0, 0, w, h);
    g.fillStyle = "#111";
    for (let i = 0; i < 16; i++) g.fillRect(0, i * h / 16, i % 4 ? w * 0.4 : w * 0.8, 2);
    g.fillStyle = "#c8201c"; g.fillRect(0, h * 0.5, w, 3);
  }, { rough: 0.4 }), "+y");
  return flDone(rig, { footprint: TOOLKIT_BUDGET.torqueWrench.footprint });
}

// ------------------------------------------------------------------ meters

/** Digital multimeter in a holster, standing, with its leads. Parts: screen, leadRed, leadBlack. */
export function multimeter(parent, x, y, z, opts = {}) {
  const lv = tkBody(opts, 0xf2c14b);
  const rig = tkRig(parent, x, y, z, opts, "multimeter");
  const S = rig.shell;
  tkSlab(S, 0.095, 0.19, 0.045, 0, 0, 0, lv.colour, { rough: 0.8, finish: "rubber", radius: 0.012 });
  box(S, 0.08, 0.02, 0.05, 0, 0.005, 0.05, lv.colour, { rough: 0.8, finish: "rubber" });       // stand foot
  tkScreen(rig, "screen", rig.base, 0.078, 0.16, 0, 0.1, 0.0235, tkLcd("", ["  0.000", "V DC"], {
    screenFrac: 0.3,
    below: (g, w, h, y0) => {
      g.fillStyle = "#3a3f44"; g.beginPath?.(); g.arc?.(w / 2, y0 + h * 0.25, w * 0.26, 0, Math.PI * 2); g.fill?.();
      g.fillStyle = "#d9dde0"; g.fillRect(w / 2 - 3, y0 + h * 0.08, 6, h * 0.12);
      for (const [cx, col] of [[0.2, "#c8201c"], [0.5, "#111"], [0.8, "#c8201c"]]) { g.fillStyle = col; g.beginPath?.(); g.arc?.(w * cx, h * 0.9, w * 0.07, 0, Math.PI * 2); g.fill?.(); }
    },
  }));
  const lr = rig.part("leadRed");
  hose(lr, [[-0.02, 0.012, 0.025], [-0.05, 0.004, 0.08], [-0.12, 0.006, 0.1], [-0.16, 0.006, 0.02]], 0.004, 0xc8201c, { rough: 0.6 });
  const lb = rig.part("leadBlack");
  hose(lb, [[0.0, 0.012, 0.025], [0.04, 0.004, 0.09], [0.12, 0.006, 0.1], [0.16, 0.006, 0.03]], 0.004, 0x15171a, { rough: 0.6 });
  return flDone(rig, { footprint: TOOLKIT_BUDGET.multimeter.footprint });
}

/** Four-gas monitor (O2, LEL, CO, H2S) with its clip, standing. Parts: screen. */
export function fourGasMeter(parent, x, y, z, opts = {}) {
  const lv = tkBody(opts, 0xe8762b);
  const rig = tkRig(parent, x, y, z, opts, "fourGasMeter");
  const S = rig.shell;
  tkSlab(S, 0.07, 0.12, 0.035, 0, 0, 0, lv.colour, { rough: 0.7, finish: "rubber", radius: 0.01 });
  box(S, 0.03, 0.08, 0.008, 0, 0.06, -0.021, ...TK_GRIP);
  box(S, 0.06, 0.012, 0.045, 0, 0.004, 0, ...TK_GRIP);
  tkScreen(rig, "screen", rig.base, 0.056, 0.09, 0, 0.068, 0.0185, tkLcd("", ["O2  20.9", "LEL    0", "CO     0", "H2S  0.0"], { screenFrac: 0.62, bezel: "#2a2e33" }));
  return flDone(rig, { footprint: TOOLKIT_BUDGET.fourGasMeter.footprint });
}

/** Portable two-way radio with antenna. Parts: screen, ptt (push-to-talk). */
export function radio(parent, x, y, z, opts = {}) {
  const lv = tkBody(opts, 0x1b1d20);
  const rig = tkRig(parent, x, y, z, opts, "radio");
  const S = rig.shell;
  tkSlab(S, 0.058, 0.13, 0.035, 0, 0, 0, lv.colour, { rough: 0.7, finish: "rubber", radius: 0.008 });
  flRod(S, 0.006, 0.13, -0.017, 0.195, 0, "y", lv.colour, { rough: 0.7, seg: 8 });
  flRod(S, 0.008, 0.015, 0.014, 0.137, 0, "y", lv.colour, { rough: 0.7, seg: 10 });
  tkScreen(rig, "screen", rig.base, 0.046, 0.08, 0, 0.075, 0.0185, tkLcd("", ["CH 04"], {
    screenFrac: 0.3,
    below: (g, w, h, y0) => { for (let i = 0; i < 12; i++) { g.fillStyle = "#3a3f44"; g.fillRect(w * (0.18 + (i % 3) * 0.24), y0 + h * 0.08 + Math.floor(i / 3) * h * 0.12, w * 0.16, h * 0.08); } },
  }));
  const ptt = rig.part("ptt", -0.03, 0.08, 0);
  box(ptt, 0.006, 0.03, 0.014, 0, 0, 0, 0xe8762b, { rough: 0.5 });
  return flDone(rig, { footprint: TOOLKIT_BUDGET.radio.footprint });
}

/** Aluminium flashlight lying on its side. Parts: lens. */
export function flashlight(parent, x, y, z, opts = {}) {
  const rig = tkRig(parent, x, y, z, opts, "flashlight");
  const S = rig.shell;
  flRod(S, 0.016, 0.16, 0, 0.022, -0.02, "z", ...FL.alu, { seg: 14 });
  flRod(S, 0.022, 0.05, 0, 0.022, 0.08, "z", ...FL.alu, { seg: 16, r2: 0.017 });
  flRod(S, 0.017, 0.02, 0, 0.022, -0.105, "z", ...TK_GRIP, { seg: 12 });
  const lens = rig.part("lens", 0, 0.022, 0.106);
  flRod(lens, 0.019, 0.004, 0, 0, 0, "z", ...FL.lamp, { seg: 16 });
  return flDone(rig, { footprint: TOOLKIT_BUDGET.flashlight.footprint });
}

/** 8 m tape measure with the blade run out. Parts: blade. */
export function tapeMeasure(parent, x, y, z, opts = {}) {
  const lv = tkBody(opts, 0xf2c14b);
  const rig = tkRig(parent, x, y, z, opts, "tapeMeasure", [-0.11, 0, 0]);
  const S = rig.shell;
  tkSlab(S, 0.075, 0.075, 0.04, 0, 0, 0, lv.colour, { rough: 0.55, radius: 0.02 });
  box(S, 0.03, 0.03, 0.044, -0.025, 0.02, 0, ...TK_GRIP);
  box(S, 0.012, 0.05, 0.004, 0, 0.04, -0.023, lv.colour, { rough: 0.55 });            // belt clip
  const blade = rig.part("blade", 0.037, 0.004, 0);
  flPanel(blade, 0.22, 0.025, 0.11, 0, 0, flCanvasMat("tapeBlade", 512, 32, (g, w, h) => {
    g.fillStyle = "#f2d03b"; g.fillRect(0, 0, w, h);
    g.fillStyle = "#111";
    for (let i = 0; i < 44; i++) g.fillRect(i * w / 44, 0, 2, i % 5 ? h * 0.3 : h * 0.6);
    g.font = `700 ${Math.round(h * 0.4)}px Arial`;
    for (let i = 1; i < 5; i++) g.fillText(String(i * 5), i * w / 4.4 - 12, h * 0.95);
  }, { rough: 0.4, metal: 0.3 }), "+y");
  box(blade, 0.004, 0.012, 0.026, 0.222, 0.004, 0, ...FL.steel);
  return flDone(rig, { footprint: TOOLKIT_BUDGET.tapeMeasure.footprint });
}

/** 600 mm box-beam spirit level. Parts: vials. */
export function level(parent, x, y, z, opts = {}) {
  const rig = tkRig(parent, x, y, z, opts, "level");
  const S = rig.shell;
  box(S, 0.6, 0.055, 0.025, 0, 0.0275, 0, ...FL.alu);
  for (const sx of [1, -1]) box(S, 0.02, 0.06, 0.028, sx * 0.305, 0.03, 0, ...TK_GRIP);
  const vials = rig.part("vials", 0, 0.0275, 0.0132);
  const vm = flCanvasMat("levelVial", 96, 48, (g, w, h) => {
    g.fillStyle = "#1c2024"; g.fillRect(0, 0, w, h);
    g.fillStyle = "#9be26f"; g.fillRect(w * 0.08, h * 0.25, w * 0.84, h * 0.5);
    g.fillStyle = "#111"; g.fillRect(w * 0.38, h * 0.2, 2, h * 0.6); g.fillRect(w * 0.62, h * 0.2, 2, h * 0.6);
    g.fillStyle = "rgba(255,255,255,0.8)"; g.beginPath?.(); g.arc?.(w * 0.5, h * 0.5, h * 0.18, 0, Math.PI * 2); g.fill?.();
  }, { rough: 0.2, emissive: 0x335522, ei: 0.4 });
  for (const vx of [-0.2, 0, 0.2]) flPanel(vials, 0.06, 0.03, vx, 0, 0, vm, "+z");
  return flDone(rig, { footprint: TOOLKIT_BUDGET.level.footprint });
}

// -------------------------------------------------------------- hand tools

/** 20 oz framing hammer lying flat. Parts: head. */
export function hammer(parent, x, y, z, opts = {}) {
  const lv = tkBody(opts, 0xe8762b);
  const rig = tkRig(parent, x, y, z, opts, "hammer");
  const S = rig.shell;
  flRod(S, 0.013, 0.24, 0, 0.016, -0.02, "z", ...tkPaint(lv.colour), { seg: 10 });
  flRod(S, 0.017, 0.11, 0, 0.018, -0.12, "z", ...TK_GRIP, { seg: 10 });
  const head = rig.part("head", 0, 0.018, 0.13);
  flRod(head, 0.016, 0.07, 0.035, 0, 0, "x", ...FL.steel, { seg: 12 });
  box(head, 0.06, 0.028, 0.03, -0.03, 0, 0, ...FL.steel);
  box(head, 0.05, 0.018, 0.012, -0.075, 0, 0, ...FL.steel).rotation.y = 0.3;
  return flDone(rig, { footprint: TOOLKIT_BUDGET.hammer.footprint });
}

/** Combination wrench set, 8–19 mm, in a canvas roll. Parts: wrenches. */
export function wrenchSet(parent, x, y, z, opts = {}) {
  const rig = tkRig(parent, x, y, z, opts, "wrenchSet");
  const S = rig.shell;
  flBox(S, 0.42, 0.006, 0.3, 0, 0.003, 0, flCanvasMat("wrenchRoll", 128, 96, (g, w, h) => {
    g.fillStyle = "#2a2e33"; g.fillRect(0, 0, w, h);
    noiseTexture(g, w, h, { density: 3000, alpha: 0.2 });
    for (let i = 0; i < 8; i++) { g.fillStyle = "rgba(0,0,0,0.35)"; g.fillRect(w * (0.08 + i * 0.11), h * 0.1, w * 0.07, h * 0.8); }
  }, { rough: 0.95 }));
  const wr = rig.part("wrenches");
  for (let i = 0; i < 8; i++) {
    const len = 0.13 + i * 0.012, wx = -0.17 + i * 0.047;
    box(wr, 0.012, 0.004, len, wx, 0.009, 0, ...FL.chrome);
    flRod(wr, 0.011 + i * 0.001, 0.005, wx, 0.009, len / 2, "y", ...FL.chrome, { seg: 10 });
    box(wr, 0.02 + i * 0.001, 0.005, 0.014, wx, 0.009, -len / 2, ...FL.chrome);
  }
  return flDone(rig, { footprint: TOOLKIT_BUDGET.wrenchSet.footprint });
}

/** Hard hat with a cap lamp on the front bracket. Parts: lamp. */
export function hardHatLamp(parent, x, y, z, opts = {}) {
  const lv = tkBody(opts, 0xf4f5f2);
  const rig = tkRig(parent, x, y, z, opts, "hardHatLamp");
  const S = rig.shell;
  lathe(S, [[0.14, 0], [0.145, 0.004], [0.11, 0.012], [0.108, 0.05], [0.1, 0.1], [0.075, 0.135], [0.03, 0.152], [0.001, 0.155]], 0, 0, 0, lv.colour, { rough: 0.45, seg: 24 });
  box(S, 0.03, 0.03, 0.02, 0, 0.07, 0.11, ...TK_GRIP);                                 // lamp bracket
  box(S, 0.05, 0.035, 0.03, 0, 0.075, 0.125, ...TK_GRIP);
  torus(S, 0.105, 0.004, 0, 0.03, 0, ...TK_GRIP, { seg: 6, seg2: 24 }).rotation.x = Math.PI / 2;  // lamp cord band
  const lamp = rig.part("lamp", 0, 0.075, 0.141);
  flRod(lamp, 0.014, 0.004, 0, 0, 0, "z", ...FL.lamp, { seg: 14 });
  return flDone(rig, { footprint: TOOLKIT_BUDGET.hardHatLamp.footprint });
}

// ----------------------------------------------------------------- yard kit

/** Polyurethane wheel chock with a rope handle. Parts: handle. */
export function chock(parent, x, y, z, opts = {}) {
  const lv = tkBody(opts, 0xf2c14b);
  const rig = tkRig(parent, x, y, z, opts, "chock");
  const S = rig.shell;
  flSide(S, [[-0.14, 0], [-0.14, 0.02], [0.06, 0.2], [0.14, 0.2], [0.14, 0]], 0.2, 0, 0, 0, lv.colour, { rough: 0.7, finish: "rubber" }, { bevel: 0.01 });
  const h = rig.part("handle", 0, 0.21, -0.1);
  torus(h, 0.04, 0.006, 0, 0, 0, ...TK_GRIP, { seg: 6, seg2: 16 });
  return flDone(rig, { footprint: TOOLKIT_BUDGET.chock.footprint });
}

/** A coiled 16 mm tag line with a snap hook. Parts: hook. */
export function tagLine(parent, x, y, z, opts = {}) {
  const rig = tkRig(parent, x, y, z, opts, "tagLine");
  const S = rig.shell;
  for (let i = 0; i < 5; i++) {
    const t = torus(S, 0.14 + i * 0.006, 0.008, i * 0.004, 0.016 + i * 0.012, 0, 0xe8762b, { rough: 0.85, seg: 6, seg2: 28 });
    t.rotation.x = Math.PI / 2 + (i % 2 ? 0.05 : -0.05);
  }
  hose(S, [[0.14, 0.02, 0], [0.2, 0.01, 0.05], [0.24, 0.008, 0.1]], 0.008, 0xe8762b, { rough: 0.85 });
  const hk = rig.part("hook", 0.26, 0.012, 0.12);
  torus(hk, 0.025, 0.005, 0, 0, 0, ...FL.steel, { seg: 6, seg2: 14 }).rotation.x = Math.PI / 2;
  box(hk, 0.012, 0.008, 0.03, -0.02, 0, -0.02, ...FL.steel);
  return flDone(rig, { footprint: TOOLKIT_BUDGET.tagLine.footprint });
}

/** 2 in ratchet tie-down: coiled webbing, the ratchet and a wire hook. Parts: ratchet, hook. */
export function tieDownStrap(parent, x, y, z, opts = {}) {
  const lv = tkBody(opts, 0xf2a623);
  const rig = tkRig(parent, x, y, z, opts, "tieDownStrap");
  const S = rig.shell;
  const web = flCanvasMat(`webbing:${lv.colour}`, 64, 64, (g, w, h) => {
    g.fillStyle = flCss(lv.colour); g.fillRect(0, 0, w, h);
    for (let i = 0; i < w; i += 4) { g.fillStyle = "rgba(0,0,0,0.12)"; g.fillRect(i, 0, 2, h); }
  }, { rough: 0.9 });
  const coil = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.05, 24), web);
  coil.position.set(-0.1, 0.025, 0); S.add(coil);
  flBox(S, 0.18, 0.004, 0.05, 0.02, 0.003, 0, web);
  const rt = rig.part("ratchet", 0.14, 0.02, 0);
  box(rt, 0.1, 0.02, 0.06, 0, 0, 0, ...FL.chrome);
  box(rt, 0.08, 0.012, 0.02, 0.02, 0.018, 0, ...FL.chrome).rotation.z = 0.25;
  flRod(rt, 0.015, 0.064, -0.02, 0.005, 0, "z", ...FL.chrome, { seg: 10 });
  const hk = rig.part("hook", 0.22, 0.01, 0);
  flStrut(hk, [0, 0, 0], [0.04, 0.02, 0], 0.004, ...FL.steel);
  flStrut(hk, [0.04, 0.02, 0], [0.03, 0.035, 0], 0.004, ...FL.steel);
  return flDone(rig, { footprint: TOOLKIT_BUDGET.tieDownStrap.footprint });
}

/**
 * A glad-hand test gauge: a service (blue) glad hand with a pressure gauge
 * on it, for checking air at the coupling. Parts: dial (live; show(psi)).
 */
export function gladHandGauge(parent, x, y, z, opts = {}) {
  const lv = tkBody(opts, 0x1f5fb8);
  const rig = tkRig(parent, x, y, z, opts, "gladHandGauge");
  const S = rig.shell;
  box(S, 0.12, 0.03, 0.06, 0, 0.015, 0, lv.colour, { rough: 0.5, metal: 0.3 });
  flRod(S, 0.03, 0.02, -0.03, 0.04, 0, "y", lv.colour, { rough: 0.5, metal: 0.3, seg: 14 });
  flRod(S, 0.009, 0.05, 0.03, 0.055, 0, "y", ...FL.chrome, { seg: 8 });
  flRod(S, 0.04, 0.02, 0.03, 0.1, 0, "z", ...FL.chrome, { seg: 18 });
  const face = (g, w, h, psi) => {
    g.fillStyle = "#f4f4ee"; g.fillRect(0, 0, w, h);
    g.strokeStyle = "#111"; g.lineWidth = 3;
    for (let i = 0; i <= 12; i++) { const a = Math.PI * (0.75 + i * 1.5 / 12); g.beginPath?.(); g.moveTo?.(w / 2 + Math.cos(a) * w * 0.36, h / 2 + Math.sin(a) * h * 0.36); g.lineTo?.(w / 2 + Math.cos(a) * w * 0.44, h / 2 + Math.sin(a) * h * 0.44); g.stroke?.(); }
    const v = Math.max(0, Math.min(150, Number(psi ?? 0)));
    const a = Math.PI * (0.75 + v / 150 * 1.5);
    g.strokeStyle = "#c8201c"; g.lineWidth = 4; g.beginPath?.(); g.moveTo?.(w / 2, h / 2); g.lineTo?.(w / 2 + Math.cos(a) * w * 0.38, h / 2 + Math.sin(a) * h * 0.38); g.stroke?.();
    g.fillStyle = "#111"; g.font = `700 ${Math.round(h * 0.12)}px Arial`; g.textAlign = "center"; g.fillText("PSI", w / 2, h * 0.75);
  };
  tkScreen(rig, "dial", rig.base, 0.066, 0.066, 0.03, 0.1, 0.0105, face);
  return flDone(rig, { footprint: TOOLKIT_BUDGET.gladHandGauge.footprint });
}

/** Dual-foot truck tyre gauge (stick type) lying flat. Parts: bar (the calibrated slide). */
export function tireGauge(parent, x, y, z, opts = {}) {
  const rig = tkRig(parent, x, y, z, opts, "tireGauge");
  const S = rig.shell;
  flRod(S, 0.009, 0.2, 0, 0.01, 0, "z", ...FL.chrome, { seg: 10 });
  box(S, 0.03, 0.016, 0.03, 0, 0.012, 0.11, ...TK_GRIP);
  for (const sx of [1, -1]) box(S, 0.008, 0.012, 0.03, sx * 0.012, 0.012, 0.13, ...TK_GRIP);
  const bar = rig.part("bar", 0, 0.012, -0.12);
  flPanel(bar, 0.008, 0.08, 0, 0, 0, flCanvasMat("tyreGaugeBar", 16, 128, (g, w, h) => {
    g.fillStyle = "#f4f4ee"; g.fillRect(0, 0, w, h);
    g.fillStyle = "#111"; for (let i = 0; i < 16; i++) g.fillRect(0, i * h / 16, i % 4 ? w * 0.5 : w, 2);
  }, { rough: 0.4 }), "+y");
  return flDone(rig, { footprint: TOOLKIT_BUDGET.tireGauge.footprint });
}

/** Mechanic's creeper: padded board on a steel frame with six casters. Parts: casters. */
export function creeper(parent, x, y, z, opts = {}) {
  const lv = tkBody(opts, 0xc8201c);
  const rig = tkRig(parent, x, y, z, opts, "creeper");
  const S = rig.shell;
  tkSlab(S, 0.44, 0.03, 0.98, 0, 0.075, 0, ...TK_GRIP, { radius: 0.04 });
  tkSlab(S, 0.3, 0.03, 0.18, 0, 0.1, 0.38, ...TK_GRIP, { radius: 0.03 });
  for (const sx of [1, -1]) box(S, 0.03, 0.03, 0.96, sx * 0.2, 0.06, 0, ...tkPaint(lv.colour));
  for (const zz of [-0.45, 0, 0.45]) box(S, 0.42, 0.03, 0.03, 0, 0.06, zz, ...tkPaint(lv.colour));
  const cs = rig.part("casters");
  for (const sx of [1, -1]) for (const zz of [-0.45, 0, 0.45]) {
    flRod(cs, 0.025, 0.02, sx * 0.2, 0.025, zz, "x", ...TK_GRIP, { seg: 12 });
    box(cs, 0.03, 0.025, 0.02, sx * 0.2, 0.045, zz, ...TK_GRIP);
  }
  return flDone(rig, { footprint: TOOLKIT_BUDGET.creeper.footprint });
}

/** Spring-rewind air hose reel on its bracket, standing on the bench. Parts: drum (turns about X), nozzle. */
export function hoseReel(parent, x, y, z, opts = {}) {
  const lv = tkBody(opts, 0x9aa1a8);
  const rig = tkRig(parent, x, y, z, opts, "hoseReel");
  const S = rig.shell;
  box(S, 0.24, 0.02, 0.2, 0, 0.01, 0, ...tkPaint(lv.colour));
  for (const sx of [1, -1]) box(S, 0.02, 0.24, 0.12, sx * 0.13, 0.13, 0, ...tkPaint(lv.colour));
  const drum = rig.part("drum", 0, 0.2, 0);
  for (const sx of [1, -1]) flRod(drum, 0.17, 0.012, sx * 0.1, 0, 0, "x", ...tkPaint(lv.colour), { seg: 24 });
  for (let i = 0; i < 4; i++) { const t = torus(drum, 0.1 + i * 0.012, 0.012, 0, 0, 0, 0x2b2f33, { rough: 0.8, seg: 6, seg2: 24 }); t.rotation.y = Math.PI / 2; t.position.x = -0.06 + i * 0.04; }
  const nz = rig.part("nozzle", 0.02, 0.05, 0.16);
  hose(nz, [[0, 0.03, -0.06], [0, 0.0, 0.0], [0.05, -0.02, 0.05]], 0.009, ...FL.chrome);
  return flDone(rig, { footprint: TOOLKIT_BUDGET.hoseReel.footprint });
}

// ------------------------------------------------------------------ budget

/** Declared mesh count (≤ 4), footprint [width X, height Y, length Z] and parts per tool; see FLEET_BUDGET. */
export const TOOLKIT_BUDGET = {
  drill: { build: "drill", meshes: 4, footprint: [0.08, 0.27, 0.32], parts: ["trigger"], note: "cordless drill-driver" },
  angleGrinder: { build: "angleGrinder", meshes: 4, footprint: [0.2, 0.07, 0.42], parts: ["guard", "disc"], note: "125 mm angle grinder with guard" },
  impactWrench: { build: "impactWrench", meshes: 4, footprint: [0.09, 0.27, 0.23], parts: ["trigger"], note: "1/2 in cordless impact wrench" },
  torqueWrench: { build: "torqueWrench", meshes: 3, footprint: [0.04, 0.04, 0.51], parts: ["scale"], note: "click-type torque wrench" },
  multimeter: { build: "multimeter", meshes: 4, footprint: [0.33, 0.2, 0.13], parts: ["screen", "leadRed", "leadBlack"], note: "digital multimeter, live screen" },
  fourGasMeter: { build: "fourGasMeter", meshes: 3, footprint: [0.07, 0.12, 0.05], parts: ["screen"], note: "O2 / LEL / CO / H2S monitor, live screen" },
  radio: { build: "radio", meshes: 4, footprint: [0.06, 0.26, 0.04], parts: ["screen", "ptt"], note: "portable two-way radio" },
  flashlight: { build: "flashlight", meshes: 3, footprint: [0.04, 0.04, 0.22], parts: ["lens"], note: "aluminium flashlight" },
  tapeMeasure: { build: "tapeMeasure", meshes: 4, footprint: [0.3, 0.07, 0.05], parts: ["blade"], note: "8 m tape, blade run out" },
  level: { build: "level", meshes: 3, footprint: [0.63, 0.06, 0.03], parts: ["vials"], note: "600 mm spirit level" },
  hammer: { build: "hammer", meshes: 3, footprint: [0.17, 0.03, 0.32], parts: ["head"], note: "framing hammer" },
  wrenchSet: { build: "wrenchSet", meshes: 2, footprint: [0.42, 0.01, 0.3], parts: ["wrenches"], note: "combination wrenches in a roll" },
  hardHatLamp: { build: "hardHatLamp", meshes: 3, footprint: [0.29, 0.16, 0.29], parts: ["lamp"], note: "hard hat with cap lamp" },
  chock: { build: "chock", meshes: 2, footprint: [0.2, 0.26, 0.28], parts: ["handle"], note: "wheel chock" },
  tagLine: { build: "tagLine", meshes: 2, footprint: [0.45, 0.08, 0.34], parts: ["hook"], note: "coiled tag line with snap hook" },
  tieDownStrap: { build: "tieDownStrap", meshes: 3, footprint: [0.43, 0.05, 0.14], parts: ["ratchet", "hook"], note: "2 in ratchet tie-down" },
  gladHandGauge: { build: "gladHandGauge", meshes: 3, footprint: [0.13, 0.14, 0.06], parts: ["dial"], note: "glad-hand air gauge, live dial" },
  tireGauge: { build: "tireGauge", meshes: 3, footprint: [0.03, 0.02, 0.31], parts: ["bar"], note: "dual-foot truck tyre gauge" },
  creeper: { build: "creeper", meshes: 3, footprint: [0.44, 0.13, 0.98], parts: ["casters"], note: "mechanic's creeper" },
  hoseReel: { build: "hoseReel", meshes: 4, footprint: [0.28, 0.37, 0.39], parts: ["drum", "nozzle"], note: "air hose reel" },
};

/** The builders by the name TOOLKIT_BUDGET's `build` field uses. */
export const TOOLKIT_BUILDERS = {
  drill, angleGrinder, impactWrench, torqueWrench, multimeter, fourGasMeter, radio, flashlight, tapeMeasure,
  level, hammer, wrenchSet, hardHatLamp, chock, tagLine, tieDownStrap, gladHandGauge, tireGauge, creeper, hoseReel,
};
void cyl; void gradientFill;
