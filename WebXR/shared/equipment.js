import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import { box, cyl, ball, gradientFill, noiseTexture, grimeOverlay } from "./kit.js";
import {
  FL, flPaint, flCss, flShade, flCanvasMat, flPanel, flBox, flSide, flPlan, flRod, flStrut, flBeam,
  flRig, flDone, flLivery, flLiveryMat, flDoorMat, flDoor, flGlassMat, flTreadMat, flGrilleMat,
  flWheel, flAxle, flSteerWheel, flMirror, flLights, flMediumCab,
} from "./fleet.js";

// Shared equipment kit — construction plant and terminal equipment.
//
// Same contract as shared/fleet.js: `(parent, x, y, z, opts)`, metres, front
// toward +Z, footprint centred, y = 0 the ground, a baked static shell and
// named parts in `userData.parts` for everything a station moves or
// registers — an excavator's house, boom, stick and bucket are nested parts
// at their real pivots, so `boom.rotation.x` raises the boom and carries the
// stick and bucket with it. `opts.livery` = { colour, fleetName, unitNumber }
// paints the machine and its side decal; defaults are generic, never a
// manufacturer's name, badge or trade dress. EQUIPMENT_BUDGET below declares
// each builder's mesh count, footprint and parts, and tools/check_fleet.mjs
// holds every builder to it.

const EQ_YELLOW = 0xf0b323;

/** A digging bucket side profile (z, y about the pin) as [back, y] for flSide. */
function eqBucketProfile(k = 1) {
  const zy = [[0.15, 0.1], [0.36, -0.28], [0.46, -0.72], [0.32, -1.08], [-0.02, -1.24], [-0.46, -1.1], [-0.36, -0.98], [-0.08, -0.94], [0.12, -0.7], [0.14, -0.3], [-0.04, 0.06]];
  return zy.map(([z, y]) => [-z * k, y * k]);
}
/** A bucket (shell plus a row of teeth) at a part's origin. */
function eqBucket(p, width, k = 1, colour = 0x4a5057) {
  flSide(p, eqBucketProfile(k), width, 0, 0, 0, colour, { rough: 0.55, metal: 0.35, finish: "painted" }, { bevel: 0.02 });
  const n = Math.max(3, Math.round(width / 0.22));
  for (let i = 0; i < n; i++) {
    const t = box(p, 0.08, 0.06, 0.2 * k, -width / 2 + (i + 0.5) * width / n, -1.12 * k, -0.52 * k, colour, { rough: 0.55, metal: 0.35, finish: "painted" });
    t.rotation.x = 0.5;
  }
}
/** A hydraulic ram from a to b: barrel half in body colour, rod half chrome. */
function eqRam(p, a, b, r, colour) {
  const m = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2, (a[2] + b[2]) / 2];
  flStrut(p, a, m, r, colour, { rough: 0.45, finish: "painted" });
  flStrut(p, m, b, r * 0.55, ...FL.chrome);
}
/** Track shoes: a dark steel band with grouser bars, repeating per metre. */
function eqTrackMat() {
  return flCanvasMat("trackShoes", 128, 128, (g, w, h) => {
    gradientFill(g, w, h, [[0, "#3b3f43"], [1, "#2a2d31"]]);
    noiseTexture(g, w, h, { density: 3000, alpha: 0.16 });
    for (let i = 0; i < 5; i++) {
      g.fillStyle = "#15171a"; g.fillRect(i * w / 5, 0, w / 20, h);
      g.fillStyle = "rgba(255,255,255,0.12)"; g.fillRect(i * w / 5 + w / 20, 0, 2, h);
    }
  }, { rough: 0.8, metal: 0.4, repeat: [1, 1] });
}
/** A crawler track as its own part: band (stadium) plus the frame, idler and sprocket. */
function eqTrack(rig, name, x, len, h, shoe, host) {
  const p = rig.part(name, x, 0, 0, host);
  const r = h / 2, half = len / 2 - r, pts = [];
  for (let i = 0; i <= 8; i++) { const a = -Math.PI / 2 + Math.PI * i / 8; pts.push([-(half + Math.cos(a) * r), r + Math.sin(a) * r]); }
  for (let i = 0; i <= 8; i++) { const a = Math.PI / 2 + Math.PI * i / 8; pts.push([-(-half + Math.cos(a) * r), r + Math.sin(a) * r]); }
  flSide(p, pts, shoe, 0, 0, 0, 0, { material: eqTrackMat() }, { bevel: 0.03 });
  flSide(p, [[-half, r * 0.45], [-half, r * 1.55], [half, r * 1.55], [half, r * 0.45]], shoe + 0.04, 0, 0, 0, ...FL.frame);
  for (const [z, rr] of [[-half, r * 0.82], [half, r * 0.86]]) flRod(p, rr, shoe + 0.06, 0, r, z, "x", ...FL.frame, { seg: 16 });
  return p;
}

// --------------------------------------------------------------- excavator

/**
 * 20 t class tracked excavator in a dig-ready pose: 4.45 m tracks on a
 * 2.39 m gauge (2.99 m over the shoes), 2.75 m tail swing, cab 3.05 m, boom
 * kink 4.7 m, bucket 7.7 m ahead of the swing centre. Parts: trackL,
 * trackR, house (slew about Y), door, boom (pitch at the foot pin), stick
 * (child of boom), bucket (child of stick), lights, counterweight.
 */
export function excavator(parent, x, y, z, opts = {}) {
  const lv = flLivery(opts.livery, { colour: EQ_YELLOW, fleetName: "PLANT", unitNumber: "EX-20" });
  const rig = flRig(parent, x, y, z, opts, "excavator", [0, 0, -2.66]);
  const S = rig.shell, P = flPaint(lv.colour);
  // Undercarriage: carbody, track frames, slewing ring.
  box(S, 1.5, 0.55, 1.6, 0, 0.72, 0, ...FL.frame);
  cyl(S, 0.95, 0.95, 0.14, 0, 1.03, 0, ...FL.frame, { seg: 24 });
  eqTrack(rig, "trackL", 1.195, 4.45, 0.92, 0.6);
  eqTrack(rig, "trackR", -1.195, 4.45, 0.92, 0.6);
  // House.
  const house = rig.part("house", 0, 1.1, 0);
  box(house, 2.54, 0.28, 3.6, 0, 0.14, -0.3, ...P);
  flSide(house, [[-0.95, 0.28], [-0.85, 1.05], [0.6, 1.1], [1.4, 1.1], [1.4, 0.28]], 1.45, -0.54, 0, 0, ...P, { bevel: 0.05 });  // engine hood, right rear
  box(house, 1.0, 0.78, 1.55, 0.76, 0.67, -0.97, ...P);                 // left-side tool compartment
  const cab = [[-2.05, 0.28], [-2.02, 1.35], [-1.85, 1.95], [0.1, 1.95], [0.15, 0.28]];
  flSide(house, cab, 1.0, 0.72, 0, 0, ...P, { bevel: 0.05 });
  const glass = flGlassMat();
  flPanel(house, 0.86, 0.95, 0.72, 1.25, 2.065, glass, "+z", 0.03);
  flPanel(house, 1.6, 0.8, 0.21, 1.45, 1.0, glass, "-x");
  flPanel(house, 0.8, 0.55, 0.72, 1.6, -0.16, glass, "-z");
  const cw = rig.part("counterweight", 0, 0, 0, house);
  const arc = [];
  for (let i = 0; i <= 10; i++) { const xx = -1.27 + 2.54 * i / 10; arc.push([xx, -Math.sqrt(2.75 * 2.75 - xx * xx)]); }
  flPlan(cw, [[1.27, -1.75], ...arc.reverse(), [-1.27, -1.75]], 1.0, 0, 0.28, 0, ...P, { bevel: 0.05 });
  const cwMark = flCanvasMat("cwStripes", 256, 64, (g, w, h) => {
    g.fillStyle = "#15171a"; g.fillRect(0, 0, w, h);
    for (let i = -4; i < 20; i++) { g.fillStyle = flCss(lv.colour); g.beginPath?.(); g.moveTo?.(i * 24, h); g.lineTo?.(i * 24 + 12, h); g.lineTo?.(i * 24 + 12 + h, 0); g.lineTo?.(i * 24 + h, 0); g.closePath?.(); g.fill?.(); }
  }, { rough: 0.5 });
  flPanel(cw, 1.0, 0.2, 0, 0.5, -2.765, cwMark, "-z");
  for (const xx of [-0.6, -0.25]) flRod(house, 0.02, 1.8, xx, 1.45, -0.6, "z", ...FL.black);
  flPanel(house, 1.3, 0.3, 1.264, 0.7, -0.97, flLiveryMat(lv, "exSide", { title: lv.unitNumber, sub: lv.fleetName, titleScale: 0.5, titleY: 0.4, stripeY: 0.92 }), "+x");
  flDoor(rig, "door", 1, 1.22, 0.3, 1.9, 0.95, 1.6, flDoorMat(lv, "L", { window: 0.62, marks: "none" }), { host: house });
  // Boom (foot pin ahead of the cab, right of it), stick, bucket.
  const boom = rig.part("boom", -0.12, 0.85, 1.35, house);
  flBeam(boom, [0, 0, 0], [0, 2.4, 2.3], 0.5, 0.62, ...P);
  flBeam(boom, [0, 2.4, 2.3], [0, 1.6, 5.3], 0.46, 0.55, ...P);
  for (const sx of [1, -1]) eqRam(boom, [sx * 0.34, -0.55, 0.45], [sx * 0.34, 1.25, 1.75], 0.09, lv.colour);
  eqRam(boom, [0, 2.8, 2.1], [0, 2.1, 5.0], 0.08, lv.colour);
  flStrut(boom, [0.18, 0.3, 0.3], [0.18, 2.75, 2.4], 0.025, ...FL.black);
  flStrut(boom, [0.18, 2.75, 2.4], [0.18, 1.95, 5.2], 0.025, ...FL.black);
  const stick = rig.part("stick", 0, 1.6, 5.3, boom);
  flBeam(stick, [0, 0.55, -0.35], [0, -2.1, 0.9], 0.36, 0.48, ...P);
  eqRam(stick, [0, 0.7, 0.05], [0, -1.6, 1.15], 0.07, lv.colour);
  const bucket = rig.part("bucket", 0, -2.1, 0.9, stick);
  eqBucket(bucket, 1.2, 1.0);
  const lights = rig.part("lights", 0, 0, 0, house);
  box(lights, 0.16, 0.12, 0.08, 0.95, 1.98, 2.0, ...FL.lamp);
  box(lights, 0.16, 0.12, 0.08, -0.12, 2.35, 3.4, ...FL.lamp);
  return flDone(rig, { footprint: EQUIPMENT_BUDGET.excavator.footprint, livery: lv });
}

// ------------------------------------------------------ amphibious excavator

// The pontoons sit 0.38 m taller than the standard machine's 0.92 m crawler
// tracks, so the carbody and everything it carries — house, boom, stick,
// bucket, counterweight, lights, unchanged from excavator() above — is raised
// by the same amount to sit on the new deck.
const AEX_DY = 0.38;

/**
 * Amphibious (pontoon) excavator: the same 20 t upperstructure as
 * `excavator()` above, carried on a pair of wide steel flotation pontoons in
 * place of conventional crawler tracks — the "swamp buggy" or "marsh buggy"
 * a shoreline and wetland crew calls in where the ground will not carry a
 * wheeled or standard tracked machine at all, spreading the same weight over
 * a wider, buoyant undercarriage instead of a narrow steel shoe. 4.6 m across
 * the pontoons (versus 3.05 m on steel tracks), 5.6 m pontoon length, cab and
 * boom geometry unchanged. Parts: pontoonL, pontoonR, house, door, boom,
 * stick, bucket, lights, counterweight.
 */
export function amphibiousExcavator(parent, x, y, z, opts = {}) {
  const lv = flLivery(opts.livery, { colour: EQ_YELLOW, fleetName: "PLANT", unitNumber: "AEX-1" });
  const rig = flRig(parent, x, y, z, opts, "amphibiousExcavator", [0, 0, -2.66]);
  const S = rig.shell, P = flPaint(lv.colour);
  // Undercarriage: a wide carrier deck on twin flotation pontoons — 1.85 m
  // off centre each way, well outside the 1.195 m gauge of the standard
  // machine's steel tracks — so the whole rig floats or spreads its weight
  // across soft mud a normal track sinks straight through.
  box(S, 1.5, 0.55, 1.6, 0, 0.72 + AEX_DY, 0, ...FL.frame);
  cyl(S, 0.95, 0.95, 0.14, 0, 1.03 + AEX_DY, 0, ...FL.frame, { seg: 24 });
  eqTrack(rig, "pontoonL", 1.85, 5.6, 1.3, 0.85);
  eqTrack(rig, "pontoonR", -1.85, 5.6, 1.3, 0.85);
  // Flat deck cap along each pontoon (a crew's own walkway) and a tapered bow
  // fender at the forward end, so the pontoon reads as a hull and not just an
  // overgrown track.
  for (const sx of [1, -1]) {
    box(S, 0.95, 0.05, 5.0, sx * 1.85, 1.68, -0.15, ...FL.frame);
    flSide(S, [[0.35, 1.3], [0.15, 1.55], [-0.1, 1.6], [-0.1, 1.05], [0.35, 1.05]], 0.9, sx * 1.85, 0, 2.6, 0, ...FL.frame, { bevel: 0.03 });
  }
  const house = rig.part("house", 0, 1.1 + AEX_DY, 0);
  box(house, 2.54, 0.28, 3.6, 0, 0.14, -0.3, ...P);
  flSide(house, [[-0.95, 0.28], [-0.85, 1.05], [0.6, 1.1], [1.4, 1.1], [1.4, 0.28]], 1.45, -0.54, 0, 0, ...P, { bevel: 0.05 });  // engine hood, right rear
  box(house, 1.0, 0.78, 1.55, 0.76, 0.67, -0.97, ...P);                 // left-side tool compartment
  const cab = [[-2.05, 0.28], [-2.02, 1.35], [-1.85, 1.95], [0.1, 1.95], [0.15, 0.28]];
  flSide(house, cab, 1.0, 0.72, 0, 0, ...P, { bevel: 0.05 });
  const glass = flGlassMat();
  flPanel(house, 0.86, 0.95, 0.72, 1.25, 2.065, glass, "+z", 0.03);
  flPanel(house, 1.6, 0.8, 0.21, 1.45, 1.0, glass, "-x");
  flPanel(house, 0.8, 0.55, 0.72, 1.6, -0.16, glass, "-z");
  const cw = rig.part("counterweight", 0, 0, 0, house);
  const arc = [];
  for (let i = 0; i <= 10; i++) { const xx = -1.27 + 2.54 * i / 10; arc.push([xx, -Math.sqrt(2.75 * 2.75 - xx * xx)]); }
  flPlan(cw, [[1.27, -1.75], ...arc.reverse(), [-1.27, -1.75]], 1.0, 0, 0.28, 0, ...P, { bevel: 0.05 });
  const cwMark = flCanvasMat("cwStripesAex", 256, 64, (g, w, h) => {
    g.fillStyle = "#15171a"; g.fillRect(0, 0, w, h);
    for (let i = -4; i < 20; i++) { g.fillStyle = flCss(lv.colour); g.beginPath?.(); g.moveTo?.(i * 24, h); g.lineTo?.(i * 24 + 12, h); g.lineTo?.(i * 24 + 12 + h, 0); g.lineTo?.(i * 24 + h, 0); g.closePath?.(); g.fill?.(); }
  }, { rough: 0.5 });
  flPanel(cw, 1.0, 0.2, 0, 0.5, -2.765, cwMark, "-z");
  for (const xx of [-0.6, -0.25]) flRod(house, 0.02, 1.8, xx, 1.45, -0.6, "z", ...FL.black);
  flPanel(house, 1.3, 0.3, 1.264, 0.7, -0.97, flLiveryMat(lv, "aexSide", { title: lv.unitNumber, sub: lv.fleetName, titleScale: 0.5, titleY: 0.4, stripeY: 0.92 }), "+x");
  flDoor(rig, "door", 1, 1.22, 0.3, 1.9, 0.95, 1.6, flDoorMat(lv, "L", { window: 0.62, marks: "none" }), { host: house });
  // Boom (foot pin ahead of the cab, right of it), stick, bucket — identical
  // to the standard machine, since only the undercarriage changes.
  const boom = rig.part("boom", -0.12, 0.85, 1.35, house);
  flBeam(boom, [0, 0, 0], [0, 2.4, 2.3], 0.5, 0.62, ...P);
  flBeam(boom, [0, 2.4, 2.3], [0, 1.6, 5.3], 0.46, 0.55, ...P);
  for (const sx of [1, -1]) eqRam(boom, [sx * 0.34, -0.55, 0.45], [sx * 0.34, 1.25, 1.75], 0.09, lv.colour);
  eqRam(boom, [0, 2.8, 2.1], [0, 2.1, 5.0], 0.08, lv.colour);
  flStrut(boom, [0.18, 0.3, 0.3], [0.18, 2.75, 2.4], 0.025, ...FL.black);
  flStrut(boom, [0.18, 2.75, 2.4], [0.18, 1.95, 5.2], 0.025, ...FL.black);
  const stick = rig.part("stick", 0, 1.6, 5.3, boom);
  flBeam(stick, [0, 0.55, -0.35], [0, -2.1, 0.9], 0.36, 0.48, ...P);
  eqRam(stick, [0, 0.7, 0.05], [0, -1.6, 1.15], 0.07, lv.colour);
  const bucket = rig.part("bucket", 0, -2.1, 0.9, stick);
  eqBucket(bucket, 1.2, 1.0);
  const lights = rig.part("lights", 0, 0, 0, house);
  box(lights, 0.16, 0.12, 0.08, 0.95, 1.98, 2.0, ...FL.lamp);
  box(lights, 0.16, 0.12, 0.08, -0.12, 2.35, 3.4, ...FL.lamp);
  return flDone(rig, { footprint: EQUIPMENT_BUDGET.amphibiousExcavator.footprint, livery: lv });
}

// ----------------------------------------------------------------- backhoe

/**
 * Loader backhoe, travel pose: 2.35 m loader bucket, ROPS cab to 2.9 m,
 * backhoe folded over the rear. Parts: loaderArms, loaderBucket, swingFrame,
 * boom, stick, bucket, stabilizerL, stabilizerR (as `stabilizers`), wheels
 * [axleFront, axleRear], door, lights.
 */
export function backhoe(parent, x, y, z, opts = {}) {
  const lv = flLivery(opts.livery, { colour: EQ_YELLOW, fleetName: "PLANT", unitNumber: "BH-4" });
  const rig = flRig(parent, x, y, z, opts, "backhoe", [0, 0, 0.2]);
  const S = rig.shell, P = flPaint(lv.colour);
  box(S, 0.95, 0.5, 4.0, 0, 0.95, 0.2, ...P);
  flSide(S, [[-2.35, 0.9], [-2.35, 1.5], [-2.2, 1.72], [-0.6, 1.78], [-0.6, 0.9]], 0.95, 0, 0, 0, ...P, { bevel: 0.07 });
  flPanel(S, 0.6, 0.4, 0, 1.3, 2.36, flGrilleMat("truck", 0x2a2e33), "+z");
  // ROPS cab: posts, roof, glass all round.
  for (const sx of [1, -1]) for (const zz of [0.58, -0.98]) box(S, 0.08, 1.7, 0.08, sx * 0.72, 2.05, zz, ...FL.black);
  flSide(S, [[-0.72, 2.88], [-0.62, 3.0], [1.08, 3.0], [1.12, 2.88]], 1.62, 0, 0, 0, ...P, { bevel: 0.03 });
  const glass = flGlassMat();
  flPanel(S, 1.36, 1.5, 0, 2.05, 0.6, glass, "+z");
  flPanel(S, 1.36, 1.5, 0, 2.05, -1.0, glass, "-z");
  flPanel(S, 1.46, 1.5, -0.74, 2.05, -0.2, glass, "-x");
  box(S, 1.4, 0.06, 1.6, 0, 1.2, -0.2, ...FL.black);
  for (const sx of [1, -1]) {
    flSide(S, [[-1.55, 0.95], [-1.45, 1.25], [-0.65, 1.25], [-0.55, 0.95]], 0.5, sx * 0.93, 0, 0, ...FL.black, { bevel: 0.02 });
    flSide(S, [[0.35, 1.3], [0.45, 1.5], [1.75, 1.5], [1.85, 1.3]], 0.5, sx * 0.93, 0, 0, ...FL.black, { bevel: 0.02 });
  }
  flPanel(S, 1.0, 0.3, 0.48, 1.05, -1.6, flLiveryMat(lv, "bhSide", { title: lv.unitNumber, sub: lv.fleetName, titleScale: 0.5, titleY: 0.4, stripeY: 0.92 }), "+x");
  flDoor(rig, "door", 1, 0.76, 1.2, 0.5, 1.4, 1.62, flDoorMat(lv, "L", { window: 0.85, marks: "none", body: 0x2a2e33 }), { t: 0.03 });
  rig.set("wheels", [
    flAxle(rig, "axleFront", 1.1, 0.5, 1.85, { width: 0.32, style: "equip", tread: "lug" }),
    flAxle(rig, "axleRear", -1.1, 0.66, 1.9, { width: 0.45, style: "equip", tread: "lug" }),
  ]);
  // Loader: arms pinned to the tower at the cab front, bucket at the nose.
  const arms = rig.part("loaderArms", 0, 1.75, 0.35);
  for (const sx of [1, -1]) flBeam(arms, [sx * 0.62, 0, 0], [sx * 0.62, -1.1, 2.55], 0.12, 0.26, ...P);
  flRod(arms, 0.05, 1.3, 0, -1.0, 2.45, "x", ...P);
  const lb = rig.part("loaderBucket", 0, -1.1, 2.6, arms);
  flSide(lb, [[0, 0.35], [-0.35, 0.3], [-0.6, -0.1], [-0.72, -0.62], [-0.05, -0.62], [0.05, -0.2]], 2.35, 0, 0, 0, 0x4a5057, { rough: 0.55, metal: 0.35, finish: "painted" }, { bevel: 0.02 });
  // Backhoe: swing frame at the rear, boom up and back, stick folded, bucket curled.
  const swing = rig.part("swingFrame", 0, 1.05, -2.15);
  box(swing, 0.5, 0.6, 0.4, 0, 0, -0.1, ...P);
  const boom = rig.part("boom", 0, 0.2, -0.2, swing);
  flBeam(boom, [0, 0, 0], [0, 1.2, -0.55], 0.3, 0.4, ...P);
  flBeam(boom, [0, 1.2, -0.55], [0, 2.3, -0.2], 0.3, 0.36, ...P);
  eqRam(boom, [0, -0.25, 0.2], [0, 1.4, -0.2], 0.07, lv.colour);
  const stick = rig.part("stick", 0, 2.3, -0.2, boom);
  flBeam(stick, [0, 0.15, 0.1], [0, -1.55, -0.45], 0.24, 0.3, ...P);
  const bk = rig.part("bucket", 0, -1.55, -0.45, stick);
  bk.rotation.x = 2.2;
  eqBucket(bk, 0.6, 0.62);
  const stabs = [];
  for (const [name, sx] of [["stabilizerL", 1], ["stabilizerR", -1]]) {
    // Stowed: the leg folded up beside the frame. Deployed, rotation.z = sx * 0.9 swings the pad out and down.
    const st = rig.part(name, sx * 0.5, 1.05, -1.85);
    flBeam(st, [0, 0, 0], [sx * 0.35, -0.5, 0], 0.16, 0.2, ...P);
    box(st, 0.3, 0.05, 0.3, sx * 0.4, -0.56, 0, ...FL.frame);
    st.userData.deploy = { axis: "z", stowed: 0, deployed: sx * 0.9 };
    stabs.push(st);
  }
  rig.set("stabilizers", stabs);
  flLights(rig, [[0.55, 2.92, 0.64, 0.14, 0.1], [-0.55, 2.92, 0.64, 0.14, 0.1]], null, [[0.5, 1.3, -1.75, 0.1, 0.1], [-0.5, 1.3, -1.75, 0.1, 0.1]]);
  return flDone(rig, { footprint: EQUIPMENT_BUDGET.backhoe.footprint, livery: lv });
}

// -------------------------------------------------------------- skid steer

/**
 * Wheeled skid-steer loader: 1.83 m bucket, ROPS cab to 2.07 m, lift arms
 * pinned at the rear. Parts: arms, bucket, wheelsL, wheelsR (as `wheels`),
 * door, lights.
 */
export function skidSteer(parent, x, y, z, opts = {}) {
  const lv = flLivery(opts.livery, { colour: EQ_YELLOW, fleetName: "PLANT", unitNumber: "SS-2" });
  const rig = flRig(parent, x, y, z, opts, "skidSteer", [0, 0, -0.28]);
  const S = rig.shell, P = flPaint(lv.colour);
  flSide(S, [[-1.05, 0.3], [-1.05, 0.9], [-0.7, 0.98], [1.1, 0.98], [1.35, 1.3], [1.4, 0.3]], 1.12, 0, 0, 0, ...P, { bevel: 0.05 });
  flSide(S, [[-0.62, 0.95], [-0.62, 2.0], [-0.5, 2.07], [0.7, 2.07], [0.75, 0.95]], 0.98, 0, 0, 0, ...FL.frame, { bevel: 0.04 });
  const glass = flGlassMat();
  for (const sx of [1, -1]) flPanel(S, 1.1, 0.7, sx * 0.495, 1.55, 0.05, glass, sx > 0 ? "+x" : "-x");
  flPanel(S, 0.8, 0.5, 0, 1.4, -0.76, glass, "-z");
  flPanel(S, 0.9, 0.3, 0, 0.62, -1.41, flGrilleMat("vertical", 0x2a2e33), "-z");
  flPanel(S, 0.7, 0.22, 0.562, 0.7, -0.6, flLiveryMat(lv, "ssSide", { title: lv.unitNumber, sub: " ", titleScale: 0.6, titleY: 0.5, stripeY: 2 }), "+x");
  const wl = rig.part("wheelsL", 0.72, 0.37, 0);
  const wr = rig.part("wheelsR", -0.72, 0.37, 0);
  for (const [p, s] of [[wl, 1], [wr, -1]]) for (const zz of [0.55, -0.55]) flWheel(p, 0, 0, zz, 0.37, 0.3, { side: s, style: "black", tread: "lug" });
  rig.set("wheels", [wl, wr]);
  const door = rig.part("door", 0.46, 1.0, 0.74);
  flBox(door, 0.9, 1.0, 0.03, -0.45, 0.5, 0, glass);
  door.userData.openAngle = -1.4;
  const arms = rig.part("arms", 0, 1.55, -0.95);
  for (const sx of [1, -1]) {
    flBeam(arms, [sx * 0.64, 0, 0], [sx * 0.64, 0.25, 1.1], 0.1, 0.22, ...P);
    flBeam(arms, [sx * 0.64, 0.25, 1.1], [sx * 0.64, -1.15, 2.25], 0.1, 0.2, ...P);
  }
  flRod(arms, 0.05, 1.28, 0, -1.1, 2.25, "x", ...P);
  const bucket = rig.part("bucket", 0, -1.2, 2.3, arms);
  flSide(bucket, [[0, 0.3], [-0.25, 0.28], [-0.45, 0.0], [-0.55, -0.33], [0.0, -0.33], [0.05, -0.1]], 1.83, 0, 0, 0, 0x4a5057, { rough: 0.55, metal: 0.35, finish: "painted" }, { bevel: 0.02 });
  flLights(rig, [[0.4, 1.95, 0.72, 0.1, 0.08], [-0.4, 1.95, 0.72, 0.1, 0.08]], null, [[0.45, 0.9, -1.07, 0.08, 0.08], [-0.45, 0.9, -1.07, 0.08, 0.08]]);
  return flDone(rig, { footprint: EQUIPMENT_BUDGET.skidSteer.footprint, livery: lv });
}

// -------------------------------------------------------------- dump truck

/**
 * Tri-axle dump truck: conventional cab, 5.3 m steel body with cab
 * protector, hinged tailgate, telescopic hoist. 9.6 m × 2.55 m × 3.35 m.
 * Parts: bed (tips about its rear hinge, negative rotation.x raises),
 * tailgate (child of bed), hoist, doorL, doorR, mirrorL, mirrorR, wheels,
 * lights.
 */
export function dumpTruck(parent, x, y, z, opts = {}) {
  const lv = flLivery(opts.livery, { colour: 0xe0591f, fleetName: "CITY HAULING", unitNumber: "D-31" });
  const L = 9.6, Z = (s) => L / 2 - s;
  const rig = flRig(parent, x, y, z, opts, "dumpTruck");
  const S = rig.shell;
  for (const sx of [1, -1]) box(S, 0.1, 0.3, L - 0.4, sx * 0.44, 0.95, Z(L / 2 + 0.1), ...FL.frame);
  flMediumCab(rig, lv, Z, { cabW: 2.3, roof: 2.9, cabBack: 3.35, hoodS: 1.65, frontAxle: 1.2, wheelR: 0.52 });
  // Body on its hinge at the rear of the frame.
  const bed = rig.part("bed", 0, 1.3, Z(L - 0.25));
  const bl = 5.4, bw = 2.5, bh = 1.3;
  const bodyP = flPaint(0x9aa0a6);
  box(bed, bw, 0.12, bl, 0, 0.06, bl / 2, ...bodyP);
  for (const sx of [1, -1]) {
    box(bed, 0.08, bh, bl, sx * (bw / 2 - 0.04), bh / 2, bl / 2, ...bodyP);
    for (let i = 0; i < 6; i++) box(bed, 0.06, bh - 0.1, 0.1, sx * (bw / 2 + 0.03), bh / 2, 0.4 + i * (bl - 0.8) / 5, ...bodyP);
    box(bed, 0.1, 0.1, bl, sx * (bw / 2 + 0.03), bh, bl / 2, ...bodyP);
  }
  box(bed, bw, bh + 0.62, 0.1, 0, (bh + 0.62) / 2, bl, ...bodyP);
  box(bed, bw, 0.08, 0.9, 0, bh + 0.62, bl + 0.4, ...bodyP);      // cab protector
  const tg = rig.part("tailgate", 0, bh, 0.02, bed);
  flBox(tg, bw - 0.02, bh - 0.05, 0.08, 0, -(bh - 0.05) / 2, 0, flCanvasMat("tailgate", 256, 128, (g, w, h) => {
    gradientFill(g, w, h, [[0, "#a3a9af"], [1, "#868d94"]]);
    for (let i = 0; i < 5; i++) { g.fillStyle = "rgba(0,0,0,0.25)"; g.fillRect(i * w / 5, 0, 4, h); }
    for (let i = 0; i < 10; i++) { g.fillStyle = i % 2 ? "#f4f4f0" : "#c8201c"; g.fillRect(i * w / 10, h * 0.86, w / 10, h * 0.08); }
    grimeOverlay(g, w, h, { blotches: 4, streaks: 6, alpha: 0.18 });
  }, { rough: 0.5, metal: 0.4 }));
  tg.userData.openAxis = "x"; tg.userData.openAngle = 0.9;
  const hoist = rig.part("hoist", 0, 1.1, Z(3.75));
  flRod(hoist, 0.13, 0.35, 0, 0.17, 0, "y", ...FL.chrome, { seg: 14 });
  box(S, 2.1, 0.5, 0.12, 0, 1.6, Z(3.55), ...FL.frame);
  rig.set("wheels", [
    flSteerWheel(rig, "wheelFL", 1.0, Z(1.2), 0.52, 0.32, { style: "steel" }),
    flSteerWheel(rig, "wheelFR", -1.0, Z(1.2), 0.52, 0.32, { style: "steel" }),
    flAxle(rig, "axle2", Z(6.7), 0.52, 1.95, { dual: true, style: "steel" }),
    flAxle(rig, "axle3", Z(8.05), 0.52, 1.95, { dual: true, style: "steel" }),
  ]);
  flLights(rig, [[0.78, 1.28, Z(0.16)], [-0.78, 1.28, Z(0.16)]],
    [[-0.3, 2.93, Z(1.95)], [0, 2.93, Z(1.95)], [0.3, 2.93, Z(1.95)]],
    [[1.0, 0.95, Z(L - 0.05)], [-1.0, 0.95, Z(L - 0.05)]]);
  return flDone(rig, { footprint: EQUIPMENT_BUDGET.dumpTruck.footprint, livery: lv });
}

// ------------------------------------------------------------ mobile crane

/**
 * Rough-terrain mobile crane, travel pose: carrier 8.9 m on four 1.6 m
 * tyres, outriggers stowed, boom retracted over the front. Parts:
 * outriggers [outriggerFL, outriggerFR, outriggerRL, outriggerRR] (each
 * slides out along X; `userData.reach`), house (slews), counterweight, cabDoor,
 * boom (luffs at its heel pin), boomSections [boomSection2..4] (each
 * telescopes along +Z inside the one before), hook, wheels, lights.
 */
export function mobileCrane(parent, x, y, z, opts = {}) {
  const lv = flLivery(opts.livery, { colour: EQ_YELLOW, fleetName: "CITY LIFT", unitNumber: "RT-30" });
  const rig = flRig(parent, x, y, z, opts, "mobileCrane", [0, 0, -1.25]);
  const S = rig.shell, P = flPaint(lv.colour);
  // Carrier.
  flSide(S, [[-4.45, 0.9], [-4.45, 1.55], [-4.2, 1.72], [4.2, 1.72], [4.45, 1.5], [4.45, 0.9]], 2.4, 0, 0, 0, ...P, { bevel: 0.06 });
  for (const zz of [3.35, -3.35]) box(S, 2.5, 0.55, 0.7, 0, 1.1, zz, ...FL.frame);
  for (const sx of [1, -1]) for (const zz of [1.7, -1.7]) {
    const arc = [];
    for (let i = 0; i <= 8; i++) { const a = Math.PI * (0.05 + 0.9 * i / 8); arc.push([-(zz + 0.95 * Math.cos(a)), 0.8 + 0.95 * Math.sin(a)]); }
    arc.push([-(zz - 0.9), 1.72], [-(zz + 0.9), 1.72]);
    flSide(S, arc, 0.62, sx * 1.12, 0, 0, ...FL.black, { bevel: 0.02 });
  }
  flBox(S, 0.6, 0.04, 1.2, 1.05, 1.74, -0.6, flTreadMat());
  const outs = [];
  for (const [name, sx, zz] of [["outriggerFL", 1, 3.35], ["outriggerFR", -1, 3.35], ["outriggerRL", 1, -3.35], ["outriggerRR", -1, -3.35]]) {
    const o = rig.part(name, sx * 0.95, 1.1, zz);
    box(o, 0.5, 0.4, 0.45, sx * 0.1, 0, 0, ...FL.frame);
    flRod(o, 0.1, 0.55, sx * 0.25, -0.35, 0, "y", ...FL.frame, { seg: 12 });
    cyl(o, 0.28, 0.28, 0.08, sx * 0.25, -0.64, 0, ...FL.frame, { seg: 16 });
    o.userData.reach = 2.4;
    outs.push(o);
  }
  rig.set("outriggers", outs);
  rig.set("wheels", [
    flAxle(rig, "axleFront", 1.7, 0.8, 2.24, { width: 0.6, style: "equip", tread: "lug" }),
    flAxle(rig, "axleRear", -1.7, 0.8, 2.24, { width: 0.6, style: "equip", tread: "lug" }),
  ]);
  // Superstructure.
  const house = rig.part("house", 0, 1.72, -0.4);
  cyl(house, 1.1, 1.1, 0.2, 0, 0.1, 0, ...FL.frame, { seg: 24 });
  box(house, 1.3, 0.9, 3.2, -0.25, 0.65, -0.5, ...P);
  const cab = [[-2.2, 0.2], [-2.15, 1.35], [-1.85, 1.7], [-0.4, 1.7], [-0.4, 0.2]];
  flSide(house, cab, 0.95, 0.92, 0, 0, ...P, { bevel: 0.04 });
  const glass = flGlassMat();
  flPanel(house, 0.8, 0.9, 0.92, 1.1, 2.19, glass, "+z", 0.1);
  flPanel(house, 1.3, 0.7, 1.4, 1.2, 1.3, glass, "+x");
  flPanel(house, 1.4, 0.5, -0.905, 0.75, -1.2, flLiveryMat(lv, "craneSide", { titleScale: 0.34, titleY: 0.4, stripeY: 0.82 }), "-x");
  const door = flDoor(rig, "cabDoor", 1, 1.4, 0.25, 0.75, 0.55, 1.3, flDoorMat(lv, "L", { window: 0.55, marks: "none" }), { t: 0.03 });
  door.parent.remove(door); house.add(door);
  const cw = rig.part("counterweight", -0.25, 0.25, -2.45, house);
  flSide(cw, [[0, 0], [0, 1.3], [0.35, 1.3], [0.55, 1.0], [0.55, 0]], 2.3, 0, 0, 0, ...P, { bevel: 0.05 });
  const boom = rig.part("boom", -0.25, 1.35, -1.5, house);
  boom.rotation.x = 0.05;
  const sec = (name, host, len, w, h, colour) => {
    const p = rig.part(name, 0, 0, 0, host);
    box(p, w, h, len, 0, 0, len / 2, ...colour);
    return p;
  };
  box(boom, 0.75, 0.85, 8.2, 0, 0, 4.1, ...P);
  eqRam(boom, [0, -1.0, 0.8], [0, -0.35, 2.6], 0.14, lv.colour);
  const sections = [];
  let host = boom, len = 8.0;
  for (let i = 0; i < 3; i++) {
    const w = 0.64 - i * 0.1, h = 0.72 - i * 0.1;
    const s = sec(`boomSection${i + 2}`, host, len, w, h, P);
    s.position.z = i === 0 ? 0.3 : 0.25;
    s.userData.extend = len - 0.8;
    sections.push(s); host = s; len -= 0.25;
  }
  rig.set("boomSections", sections);
  const tip = rig.part("boomHead", 0, 0, len + 0.35, host);
  box(tip, 0.5, 0.6, 0.5, 0, 0, 0, ...FL.frame);
  flRod(tip, 0.28, 0.12, 0, -0.05, 0.2, "x", ...FL.frame, { seg: 16 });
  const hook = rig.part("hook", 0, -0.5, 0.25, tip);
  flRod(hook, 0.012, 1.0, 0.06, -0.5, 0, "y", ...FL.steel);
  flRod(hook, 0.012, 1.0, -0.06, -0.5, 0, "y", ...FL.steel);
  box(hook, 0.35, 0.45, 0.25, 0, -1.2, 0, 0xf2c14b, { rough: 0.5 });
  box(hook, 0.08, 0.3, 0.08, 0, -1.55, 0, ...FL.steel);
  flLights(rig, [[0.9, 1.45, 4.46, 0.2, 0.12], [-0.9, 1.45, 4.46, 0.2, 0.12]], null, [[0.9, 1.4, -4.46, 0.2, 0.12], [-0.9, 1.4, -4.46, 0.2, 0.12]]);
  return flDone(rig, { footprint: EQUIPMENT_BUDGET.mobileCrane.footprint, livery: lv });
}

// ------------------------------------------------------------ aerial lifts

/**
 * 60 ft telescopic boom lift, stowed: 8.6 m × 2.44 m × 2.6 m. Parts:
 * turntable (slews), boom (luffs), boomTele (telescopes, child of boom), jib
 * (child of boomTele), platform (child of jib), controls (platform control
 * box), groundControls, wheels [axleFront, axleRear], beacon.
 */
export function aerialBoomLift(parent, x, y, z, opts = {}) {
  const lv = flLivery(opts.livery, { colour: 0xe8762b, fleetName: "RENTAL", unitNumber: "BL-60" });
  const rig = flRig(parent, x, y, z, opts, "aerialBoomLift", [0, 0, -2.7]);
  const S = rig.shell, P = flPaint(lv.colour);
  box(S, 2.0, 0.55, 3.2, 0, 0.62, 0, ...P);
  box(S, 2.3, 0.1, 3.3, 0, 0.35, 0, ...FL.frame);
  rig.set("wheels", [
    flAxle(rig, "axleFront", 1.25, 0.55, 2.0, { width: 0.42, style: "equip", tread: "lug" }),
    flAxle(rig, "axleRear", -1.25, 0.55, 2.0, { width: 0.42, style: "equip", tread: "lug" }),
  ]);
  const tt = rig.part("turntable", 0, 0.9, -0.2);
  cyl(tt, 0.8, 0.8, 0.12, 0, 0.06, 0, ...FL.frame, { seg: 20 });
  flSide(tt, [[0.2, 0.12], [0.2, 1.15], [0.5, 1.25], [1.25, 1.25], [1.45, 1.0], [1.45, 0.12]], 2.25, 0, 0, 0, ...P, { bevel: 0.06 });
  flPanel(tt, 1.0, 0.35, 1.13, 0.65, -0.8, flLiveryMat(lv, "blSide", { title: lv.unitNumber, sub: lv.fleetName, titleScale: 0.5, titleY: 0.4, stripeY: 0.92 }), "+x");
  const gc = rig.part("groundControls", -1.13, 0.55, -0.6, tt);
  box(gc, 0.06, 0.4, 0.5, 0, 0, 0, 0x2f353b, { rough: 0.5 });
  box(gc, 0.02, 0.06, 0.06, -0.04, 0.12, 0.15, ...FL.red);
  const boom = rig.part("boom", 0, 1.45, -0.55, tt);
  box(boom, 0.46, 0.52, 5.9, 0, 0, 2.95, ...P);
  eqRam(boom, [0, -1.05, 1.0], [0, -0.28, 2.2], 0.1, lv.colour);
  const tele = rig.part("boomTele", 0, 0, 0.35, boom);
  box(tele, 0.36, 0.42, 5.9, 0, 0, 2.95, 0xd9dde0, { rough: 0.4, metal: 0.3, finish: "painted" });
  const jib = rig.part("jib", 0, 0, 6.05, tele);
  box(jib, 0.3, 0.3, 0.3, 0, 0, 0, ...P);
  flBeam(jib, [0, 0, 0.1], [0, -0.9, 0.7], 0.2, 0.2, ...P);
  const plat = rig.part("platform", 0, -1.3, 0.9, jib);
  flBox(plat, 2.3, 0.06, 0.9, 0, 0.03, 0.2, flTreadMat());
  for (const sx of [1, -1]) for (const zz of [-0.22, 0.62]) flRod(plat, 0.022, 1.1, sx * 1.12, 0.6, zz, "y", 0xf2c14b, { rough: 0.5 });
  for (const yy of [0.6, 1.12]) {
    for (const zz of [-0.22, 0.62]) flRod(plat, 0.022, 2.24, 0, yy, zz, "x", 0xf2c14b, { rough: 0.5 });
    for (const sx of [1, -1]) flRod(plat, 0.022, 0.84, sx * 1.12, yy, 0.2, "z", 0xf2c14b, { rough: 0.5 });
  }
  const ctl = rig.part("controls", 0.5, 1.0, -0.26, plat);
  box(ctl, 0.45, 0.3, 0.12, 0, 0, 0, 0x2f353b, { rough: 0.5 });
  box(ctl, 0.06, 0.06, 0.04, 0.12, 0.06, 0.07, ...FL.red);
  const bc = rig.part("beacon", -0.7, 1.35, -0.9, tt);
  cyl(bc, 0.06, 0.07, 0.12, 0, 0, 0, ...FL.amber, { seg: 12 });
  return flDone(rig, { footprint: EQUIPMENT_BUDGET.aerialBoomLift.footprint, livery: lv });
}

/**
 * Electric slab scissor lift, 26 ft class, stowed: 2.3 m × 1.17 m × 2.2 m to
 * the guardrail. Parts: scissors (scale Y to raise), platform (raise with
 * it), extensionDeck (slides +Z), controls, gate, potholeGuards, wheels
 * [axleFront, axleRear], beacon.
 */
export function scissorLift(parent, x, y, z, opts = {}) {
  const lv = flLivery(opts.livery, { colour: 0x2f6fb5, fleetName: "RENTAL", unitNumber: "SL-26" });
  const rig = flRig(parent, x, y, z, opts, "scissorLift");
  const S = rig.shell, P = flPaint(lv.colour);
  box(S, 1.02, 0.38, 2.3, 0, 0.3, 0, ...P);
  flPanel(S, 0.8, 0.2, 0.512, 0.32, -0.3, flLiveryMat(lv, "slSide", { title: lv.unitNumber, sub: " ", titleScale: 0.6, titleY: 0.5, stripeY: 2 }), "+x");
  rig.set("wheels", [
    flAxle(rig, "axleFront", 0.8, 0.2, 1.02, { width: 0.14, style: "grey", tread: "smooth", hubR: 0.04 }),
    flAxle(rig, "axleRear", -0.8, 0.2, 1.02, { width: 0.14, style: "grey", tread: "smooth", hubR: 0.04 }),
  ]);
  const ph = rig.part("potholeGuards", 0, 0.14, 0);
  for (const sx of [1, -1]) box(ph, 0.05, 0.05, 1.1, sx * 0.49, 0, 0, ...FL.steel);
  const sc = rig.part("scissors", 0, 0.5, 0);
  for (let lvl = 0; lvl < 4; lvl++) for (const sx of [1, -1]) {
    const y0 = lvl * 0.13;
    flStrut(sc, [sx * 0.42, y0, -0.95], [sx * 0.42, y0 + 0.13, 0.95], 0.03, ...FL.frame);
    flStrut(sc, [sx * 0.42, y0 + 0.13, -0.95], [sx * 0.42, y0, 0.95], 0.03, ...FL.frame);
  }
  const plat = rig.part("platform", 0, 1.04, 0);
  flBox(plat, 1.12, 0.06, 2.24, 0, 0.03, 0, flTreadMat());
  const rail = (p, w, d) => {
    for (const sx of [1, -1]) for (const zz of [-d / 2, 0, d / 2]) flRod(p, 0.02, 1.1, sx * w / 2, 0.6, zz, "y", ...P);
    for (const yy of [0.58, 1.12]) {
      for (const sx of [1, -1]) flRod(p, 0.02, d, sx * w / 2, yy, 0, "z", ...P);
      flRod(p, 0.02, w, 0, yy, d / 2, "x", ...P);
    }
  };
  rail(plat, 1.08, 1.5);
  const ext = rig.part("extensionDeck", 0, 0.07, 0.4, plat);
  flBox(ext, 1.04, 0.04, 1.3, 0, 0, 0, flTreadMat());
  rail(ext, 1.0, 1.3);
  ext.userData.slide = 0.9;
  const gate = rig.part("gate", 0, 0, -1.08, plat);
  for (const yy of [0.58, 1.12]) flRod(gate, 0.02, 1.0, 0, yy, 0, "x", 0xf2c14b, { rough: 0.5 });
  const ctl = rig.part("controls", 0.3, 1.12, 0.62, ext);
  box(ctl, 0.32, 0.22, 0.12, 0, 0, 0, 0x2f353b, { rough: 0.5 });
  box(ctl, 0.05, 0.05, 0.03, 0.1, 0.06, 0.07, ...FL.red);
  const bc = rig.part("beacon", -0.4, 0.55, -1.0);
  cyl(bc, 0.05, 0.06, 0.1, 0, 0, 0, ...FL.amber, { seg: 12 });
  return flDone(rig, { footprint: EQUIPMENT_BUDGET.scissorLift.footprint, livery: lv });
}

// --------------------------------------------------------------- compactor

/**
 * Single-drum vibratory soil compactor: 2.13 m smooth drum, articulated
 * frame, ROPS canopy to 3.0 m. 5.8 m × 2.3 m. Parts: frontFrame (steers about
 * the hitch), drum (child of frontFrame, rolls about X), wheels, rops, seat,
 * controls, lights, beacon.
 */
export function compactor(parent, x, y, z, opts = {}) {
  const lv = flLivery(opts.livery, { colour: EQ_YELLOW, fleetName: "PLANT", unitNumber: "CP-8" });
  const rig = flRig(parent, x, y, z, opts, "compactor", [0, 0, 0.09]);
  const S = rig.shell, P = flPaint(lv.colour);
  flSide(S, [[0.3, 0.55], [0.3, 1.05], [0.55, 1.1], [2.35, 1.1], [2.9, 1.45], [2.9, 0.6], [2.6, 0.5]], 1.5, 0, 0, 0, ...P, { bevel: 0.06 });
  flSide(S, [[0.9, 1.1], [0.9, 1.7], [1.1, 1.8], [2.6, 1.8], [2.85, 1.5], [2.85, 1.1]], 1.3, 0, 0, 0, ...P, { bevel: 0.08 });
  flPanel(S, 1.0, 0.25, 0, 1.3, -2.91, flGrilleMat("vertical", 0x2a2e33), "-z");
  flPanel(S, 1.2, 0.3, 0.752, 1.35, -1.9, flLiveryMat(lv, "cpSide", { title: lv.unitNumber, sub: lv.fleetName, titleScale: 0.5, titleY: 0.4, stripeY: 0.92 }), "+x");
  flBox(S, 1.4, 0.05, 0.8, 0, 1.12, -0.45, flTreadMat());
  box(S, 0.4, 0.4, 0.5, 0, 0.8, 0.45, ...FL.frame);                 // hitch
  rig.set("wheels", [flAxle(rig, "axleRear", -1.85, 0.78, 1.72, { width: 0.58, style: "equip", tread: "lug" })]);
  const ff = rig.part("frontFrame", 0, 0, 0.55);
  box(ff, 2.35, 0.35, 0.5, 0, 1.4, 1.35, ...P);
  for (const sx of [1, -1]) box(ff, 0.12, 1.0, 1.7, sx * 1.14, 0.95, 1.35, ...P);
  box(ff, 2.3, 0.3, 0.35, 0, 1.25, 0.25, ...P);
  const drum = rig.part("drum", 0, 0.76, 1.35, ff);
  flRod(drum, 0.75, 2.13, 0, 0, 0, "x", 0x9aa1a8, { rough: 0.35, metal: 0.55, finish: "brushed", seg: 28 });
  const rops = rig.part("rops", 0, 1.12, -0.45);
  for (const sx of [1, -1]) for (const zz of [0.4, -0.5]) box(rops, 0.08, 1.8, 0.08, sx * 0.72, 0.9, zz, ...FL.black);
  box(rops, 1.6, 0.08, 1.2, 0, 1.84, -0.05, ...FL.black);
  const seat = rig.part("seat", 0, 1.15, -0.55);
  box(seat, 0.5, 0.1, 0.45, 0, 0.05, 0, ...FL.black);
  box(seat, 0.5, 0.5, 0.1, 0, 0.32, -0.2, ...FL.black);
  const ctl = rig.part("controls", 0, 1.15, 0.05);
  flStrut(ctl, [0, 0, 0], [0, 0.55, -0.12], 0.03, ...FL.black);
  flRod(ctl, 0.16, 0.03, 0, 0.56, -0.13, "y", ...FL.black, { seg: 16 });
  flLights(rig, [[0.6, 3.0, 0.15, 0.12, 0.08], [-0.6, 3.0, 0.15, 0.12, 0.08]], null, [[0.6, 1.2, -2.91, 0.1, 0.08], [-0.6, 1.2, -2.91, 0.1, 0.08]]);
  const bc = rig.part("beacon", 0, 3.06, -0.5);
  cyl(bc, 0.06, 0.07, 0.12, 0, 0, 0, ...FL.amber, { seg: 12 });
  return flDone(rig, { footprint: EQUIPMENT_BUDGET.compactor.footprint, livery: lv });
}

// ------------------------------------------------------ towable site plant

/** A single-axle site trailer: frame, A-frame tongue, coupler, fenders, jack and axle. Shared by the towables. */
function eqTowTrailer(rig, len, width, track, tongue, wheelR = 0.33) {
  const S = rig.shell;
  box(S, width - 0.1, 0.12, len, 0, 0.5, 0, ...FL.frame);
  for (const sx of [1, -1]) flBeam(S, [sx * 0.5, 0.5, len / 2 - 0.1], [0, 0.5, len / 2 + tongue - 0.2], 0.1, 0.12, ...FL.frame);
  box(S, 0.14, 0.12, 0.3, 0, 0.52, len / 2 + tongue - 0.1, ...FL.steel);
  for (const sx of [1, -1]) flSide(S, [[-0.6, 0.62], [-0.5, 0.82], [0.5, 0.82], [0.6, 0.62]], 0.28, sx * (track / 2), 0, 0, ...FL.black, { bevel: 0.02 });
  rig.set("wheels", [flAxle(rig, "axle", 0, wheelR, track, { width: 0.2, style: "grey" })]);
  const jack = rig.part("jack", 0.15, 0, len / 2 + tongue * 0.55);
  flRod(jack, 0.04, 0.6, 0, 0.35, 0, "y", ...FL.steel);
  box(jack, 0.14, 0.03, 0.14, 0, 0.03, 0, ...FL.steel);
  flRod(jack, 0.012, 0.2, 0.1, 0.68, 0, "x", ...FL.steel);
  flLights(rig, [], null, [[width / 2 - 0.12, 0.62, -len / 2 - 0.02, 0.12, 0.08], [-(width / 2 - 0.12), 0.62, -len / 2 - 0.02, 0.12, 0.08]]);
}

/** Louvred enclosure face: panel seams, louvre bank, warning label. */
function eqEnclosureMat(colour, kind) {
  return flCanvasMat(`enclosure:${colour}:${kind}`, 256, 192, (g, w, h) => {
    gradientFill(g, w, h, [[0, flCss(flShade(colour, 1.05))], [1, flCss(flShade(colour, 0.86))]]);
    noiseTexture(g, w, h, { density: 1200, alpha: 0.06 });
    g.strokeStyle = "rgba(0,0,0,0.4)"; g.lineWidth = 3; g.strokeRect?.(3, 3, w - 6, h - 6);
    for (let i = 0; i < 9; i++) { g.fillStyle = "rgba(0,0,0,0.45)"; g.fillRect(w * 0.12, h * 0.18 + i * h * 0.06, w * 0.5, h * 0.025); }
    if (kind === "door") { g.fillStyle = "#2a2e33"; g.fillRect(w * 0.82, h * 0.45, w * 0.06, h * 0.12); }
    g.fillStyle = "#f2c14b"; g.fillRect(w * 0.7, h * 0.12, w * 0.22, h * 0.14);
    g.fillStyle = "#111"; g.font = `700 ${Math.round(h * 0.06)}px Arial`; g.textAlign = "center"; g.fillText("WARNING", w * 0.81, h * 0.21);
    grimeOverlay(g, w, h, { blotches: 2, streaks: 3, alpha: 0.12 });
  }, { rough: 0.5, metal: 0.3 });
}
/** A control panel face: gauges, breakers, a hour meter. */
function eqControlFaceMat(title) {
  return flCanvasMat(`control:${title}`, 256, 192, (g, w, h) => {
    gradientFill(g, w, h, [[0, "#30363c"], [1, "#22272c"]]);
    g.fillStyle = "#d9dde0"; g.font = `700 ${Math.round(h * 0.08)}px Arial`; g.textAlign = "center"; g.fillText(title, w / 2, h * 0.12);
    for (let i = 0; i < 3; i++) {
      g.fillStyle = "#f2f2ea"; g.beginPath?.(); g.arc?.(w * (0.22 + i * 0.28), h * 0.36, h * 0.13, 0, Math.PI * 2); g.fill?.();
      g.strokeStyle = "#c8201c"; g.lineWidth = 3; g.beginPath?.(); g.moveTo?.(w * (0.22 + i * 0.28), h * 0.36); g.lineTo?.(w * (0.22 + i * 0.28) + 16, h * 0.3); g.stroke?.();
    }
    for (let i = 0; i < 6; i++) { g.fillStyle = "#15181b"; g.fillRect(w * (0.1 + i * 0.14), h * 0.6, w * 0.1, h * 0.16); g.fillStyle = "#e4e7ea"; g.fillRect(w * (0.13 + i * 0.14), h * 0.63, w * 0.04, h * 0.07); }
    g.fillStyle = "#0f1a14"; g.fillRect(w * 0.3, h * 0.82, w * 0.4, h * 0.1);
    g.fillStyle = "#59e38a"; g.font = `700 ${Math.round(h * 0.07)}px monospace`; g.fillText("0000.0 h", w / 2, h * 0.895);
  }, { rough: 0.5, metal: 0.3 });
}

/**
 * Towable diesel generator on a single-axle trailer: 4.4 m × 1.9 m × 2.1 m.
 * Parts: doorL, doorR (enclosure access), controlPanel, eStop, wheels, jack,
 * lights.
 */
export function generatorTrailer(parent, x, y, z, opts = {}) {
  const lv = flLivery(opts.livery, { colour: 0xe7e9e6, fleetName: "SITE POWER", unitNumber: "G-60" });
  const rig = flRig(parent, x, y, z, opts, "generatorTrailer", [0, 0, -0.68]);
  const S = rig.shell;
  eqTowTrailer(rig, 3.1, 1.3, 1.62, 1.35);
  const H = 1.45, W = 1.2, L = 3.0;
  box(S, W, H, L, 0, 0.56 + H / 2, 0, ...flPaint(lv.colour));
  flRod(S, 0.06, 0.4, -0.3, 0.56 + H + 0.2, -0.9, "y", ...FL.frame);
  const side = eqEnclosureMat(lv.colour, "side");
  for (const sx of [1, -1]) flPanel(S, 1.3, H - 0.1, sx * (W / 2 + 0.004), 0.56 + H / 2, -0.75, side, sx > 0 ? "+x" : "-x");
  flPanel(S, 1.4, 0.3, W / 2 + 0.006, 0.56 + H - 0.22, -0.75, flLiveryMat(lv, "genSide", { titleScale: 0.38, titleY: 0.4, stripeY: 0.85 }), "+x");
  const dm = eqEnclosureMat(lv.colour, "door");
  flDoor(rig, "doorL", 1, W / 2, 0.62, 1.3, 1.25, H - 0.15, dm, { t: 0.03 });
  flDoor(rig, "doorR", -1, -W / 2, 0.62, 1.3, 1.25, H - 0.15, dm, { t: 0.03 });
  const cp = rig.part("controlPanel", 0, 0.56 + H * 0.6, -L / 2 - 0.006);
  flPanel(cp, 0.8, 0.6, 0, 0, 0, eqControlFaceMat("GENERATOR"), "-z");
  const es = rig.part("eStop", 0.32, 0.56 + H * 0.6 + 0.2, -L / 2 - 0.03);
  flRod(es, 0.045, 0.05, 0, 0, 0, "z", ...FL.red, { seg: 14 });
  box(es, 0.12, 0.12, 0.02, 0, 0, 0.02, 0xf2c14b, { rough: 0.5 });
  return flDone(rig, { footprint: EQUIPMENT_BUDGET.generatorTrailer.footprint, livery: lv });
}

/**
 * Towable light tower, mast raised (`opts.raised: false` stows it):
 * 3.9 m × 1.45 m, lamps at 8.8 m. Parts: mast, mastUpper (telescopes),
 * lamps, outriggers [four], controlPanel, wheels, jack, lights.
 */
export function lightTower(parent, x, y, z, opts = {}) {
  const lv = flLivery(opts.livery, { colour: 0xf2c14b, fleetName: "SITE POWER", unitNumber: "LT-4" });
  const raised = opts.raised !== false;
  const rig = flRig(parent, x, y, z, opts, "lightTower", [0, 0, raised ? -0.55 : -1.27]);
  const S = rig.shell;
  eqTowTrailer(rig, 2.3, 1.2, 1.3, 1.1, 0.3);
  box(S, 1.1, 1.1, 2.2, 0, 1.12, 0, ...flPaint(lv.colour));
  const side = eqEnclosureMat(lv.colour, "side");
  for (const sx of [1, -1]) flPanel(S, 1.4, 0.9, sx * 0.554, 1.12, 0.2, side, sx > 0 ? "+x" : "-x");
  const cp = rig.part("controlPanel", 0, 1.2, -1.106);
  flPanel(cp, 0.6, 0.45, 0, 0, 0, eqControlFaceMat("LIGHT TOWER"), "-z");
  const mast = rig.part("mast", 0, 1.67, -0.8);
  if (!raised) mast.rotation.x = Math.PI / 2;
  box(mast, 0.2, 3.8, 0.2, 0, 1.9, 0, 0xdfe3e6, { rough: 0.4, metal: 0.4, finish: "galvanised" });
  const up = rig.part("mastUpper", 0, raised ? 3.4 : 0.2, 0, mast);
  box(up, 0.15, 3.8, 0.15, 0, 1.9, 0, 0xdfe3e6, { rough: 0.4, metal: 0.4, finish: "galvanised" });
  const lamps = rig.part("lamps", 0, 3.8, 0, up);
  box(lamps, 1.3, 0.08, 0.08, 0, 0, 0, ...FL.frame);
  for (const [lx, ly] of [[-0.45, 0.25], [0.45, 0.25], [-0.45, -0.2], [0.45, -0.2]]) {
    box(lamps, 0.4, 0.34, 0.12, lx, ly, 0.06, ...FL.frame);
    box(lamps, 0.34, 0.28, 0.02, lx, ly, 0.13, ...FL.lamp);
  }
  const outs = [];
  for (const [i, sx, zz] of [[0, 1, 0.9], [1, -1, 0.9], [2, 1, -0.9], [3, -1, -0.9]]) {
    // Deployed with the mast up; slid in for the tow.
    const o = rig.part(`outrigger${i + 1}`, sx * (raised ? 0.55 : 0.1), 0.55, zz);
    flBeam(o, [0, 0, 0], [sx * 0.55, 0, 0], 0.08, 0.08, ...FL.steel);
    flRod(o, 0.03, 0.5, sx * 0.55, -0.25, 0, "y", ...FL.steel);
    box(o, 0.14, 0.03, 0.14, sx * 0.55, -0.52, 0, ...FL.steel);
    outs.push(o);
  }
  rig.set("outriggers", outs);
  return flDone(rig, { footprint: EQUIPMENT_BUDGET[raised ? "lightTower" : "lightTower:stowed"].footprint, livery: lv });
}

/**
 * Trailer-mounted concrete line pump (small): hopper and grate at the rear,
 * S-tube outlet, engine enclosure forward. 4.7 m × 1.9 m × 1.8 m. Parts:
 * hopper, grate (never reached through while running), outlet, controlPanel,
 * outriggers [two], wheels, jack, lights.
 */
export function concretePump(parent, x, y, z, opts = {}) {
  const lv = flLivery(opts.livery, { colour: 0xd8d9d4, fleetName: "CITY CONCRETE", unitNumber: "CP-2" });
  const rig = flRig(parent, x, y, z, opts, "concretePump", [0, 0, -0.35]);
  const S = rig.shell;
  eqTowTrailer(rig, 3.2, 1.3, 1.6, 1.2);
  box(S, 1.2, 1.0, 1.9, 0, 1.08, 0.55, ...flPaint(lv.colour));
  const side = eqEnclosureMat(lv.colour, "side");
  for (const sx of [1, -1]) flPanel(S, 1.4, 0.8, sx * 0.604, 1.08, 0.55, side, sx > 0 ? "+x" : "-x");
  flPanel(S, 1.4, 0.26, 0.606, 1.45, 0.55, flLiveryMat(lv, "cpumpSide", { titleScale: 0.38, titleY: 0.4, stripeY: 0.85 }), "+x");
  flRod(S, 0.1, 0.9, 0, 0.9, -0.6, "z", ...FL.steel);          // pumping cylinders
  const hop = rig.part("hopper", 0, 0.6, -1.25);
  box(hop, 1.1, 0.08, 0.7, 0, 0.1, 0, ...flPaint(lv.colour));
  for (const sx of [1, -1]) { const w = box(hop, 0.06, 0.8, 0.9, sx * 0.62, 0.5, 0, ...flPaint(lv.colour)); w.rotation.z = sx * 0.3; }
  for (const sz of [1, -1]) { const w = box(hop, 1.3, 0.8, 0.06, 0, 0.5, sz * 0.47, ...flPaint(lv.colour)); w.rotation.x = -sz * 0.2; }
  const grate = rig.part("grate", 0, 1.52, -1.25);
  for (let i = 0; i < 8; i++) flRod(grate, 0.012, 1.0, 0, 0, -0.42 + i * 0.12, "x", ...FL.steel);
  for (const sx of [1, -1]) flRod(grate, 0.015, 0.95, sx * 0.5, 0, 0, "z", ...FL.steel);
  const out = rig.part("outlet", 0, 0.75, -1.72);
  flRod(out, 0.1, 0.35, 0, 0, -0.15, "z", 0x3a3f44, { rough: 0.5, metal: 0.4, r2: 0.07 });
  flRod(out, 0.08, 0.06, 0, 0, -0.35, "z", ...FL.frame);
  const cp = rig.part("controlPanel", 0.608, 0.95, -0.3);
  flPanel(cp, 0.5, 0.38, 0, 0, 0, eqControlFaceMat("PUMP"), "+x");
  const outs = [];
  for (const [name, sx] of [["outriggerL", 1], ["outriggerR", -1]]) {
    const o = rig.part(name, sx * 0.6, 0.5, -1.55);
    flBeam(o, [0, 0, 0], [sx * 0.35, 0, 0], 0.08, 0.08, ...FL.steel);
    flRod(o, 0.03, 0.45, sx * 0.35, -0.22, 0, "y", ...FL.steel);
    box(o, 0.14, 0.03, 0.14, sx * 0.35, -0.47, 0, ...FL.steel);
    outs.push(o);
  }
  rig.set("outriggers", outs);
  return flDone(rig, { footprint: EQUIPMENT_BUDGET.concretePump.footprint, livery: lv });
}

// ---------------------------------------------------------- terminal plant

/**
 * Telescopic container spreader, set to 40 ft: twistlock centres 11.98 m
 * apart across 2.26 m, overall 12.2 m × 2.44 m, headblock on top. y = 0 is
 * the container top it lands on. Parts: headblock, telescopeFore,
 * telescopeAft (each extends along Z; `userData.extend20` is how far in they
 * go for a 20 ft box), twistlocks [four, each turns about Y], flippers
 * [four], indicators {landed, locked, unlocked}.
 */
export function craneSpreader(parent, x, y, z, opts = {}) {
  const lv = flLivery(opts.livery, { colour: EQ_YELLOW, fleetName: "PORT", unitNumber: "SP-7" });
  const rig = flRig(parent, x, y, z, opts, "craneSpreader");
  const S = rig.shell, P = flPaint(lv.colour);
  box(S, 1.2, 0.8, 6.0, 0, 0.72, 0, ...P);
  box(S, 2.44, 0.3, 1.0, 0, 0.47, 0, ...P);
  box(S, 0.8, 0.5, 1.2, 0, 1.36, -1.8, ...FL.frame);          // hydraulic power pack
  flPanel(S, 2.6, 0.5, 0.602, 0.72, 1.4, flLiveryMat(lv, "spSide", { title: lv.unitNumber, sub: lv.fleetName, titleScale: 0.5, titleY: 0.4, stripeY: 0.92 }), "+x");
  const hb = rig.part("headblock", 0, 1.12, 0);
  box(hb, 2.0, 0.5, 1.6, 0, 0.25, 0, ...P);
  for (const sx of [1, -1]) for (const zz of [0.5, -0.5]) flRod(hb, 0.3, 0.1, sx * 0.7, 0.75, zz, "x", ...FL.frame, { seg: 16 });
  const tws = [], flips = [];
  for (const [name, sz] of [["telescopeFore", 1], ["telescopeAft", -1]]) {
    const t = rig.part(name, 0, 0, sz * 2.6);
    for (const sx of [1, -1]) box(t, 0.3, 0.4, 4.0, sx * 0.35, 0.72, sz * 1.5, ...P);
    box(t, 2.44, 0.5, 0.36, 0, 0.37, sz * 3.28, ...P);
    t.userData.extend20 = 3.05;
    for (const sx of [1, -1]) {
      const corner = `${sz > 0 ? "F" : "A"}${sx > 0 ? "L" : "R"}`;
      const tw = rig.part(`twistlock${corner}`, sx * 1.13, 0.06, sz * 3.39, t);
      box(tw, 0.1, 0.12, 0.2, 0, 0, 0, ...FL.steel);
      box(tw, 0.16, 0.06, 0.12, 0, -0.03, 0, ...FL.steel);
      tws.push(tw);
      const fl = rig.part(`flipper${corner}`, sx * 1.22, 0.62, sz * 3.4, t);
      box(fl, 0.05, 0.55, 0.45, 0, 0.27, 0, 0xf2c14b, { rough: 0.5 });
      fl.userData.down = sx * Math.PI;
      flips.push(fl);
    }
  }
  rig.set("twistlocks", tws);
  rig.set("flippers", flips);
  const ind = rig.part("indicators"); ind.userData.fleetBake = false;
  for (const [name, colour, dz] of [["landed", FL.amber, -0.25], ["locked", FL.green, 0], ["unlocked", FL.red, 0.25]]) {
    const p = rig.part(name, 0.61, 1.0, 1.0 + dz, ind);
    box(p, 0.03, 0.12, 0.12, 0, 0, 0, ...colour);
  }
  return flDone(rig, { footprint: EQUIPMENT_BUDGET.craneSpreader.footprint, livery: lv });
}

// ------------------------------------------------------------------ budget

/** Declared mesh count, footprint [width X, height Y, length Z] and parts per builder; see FLEET_BUDGET. */
export const EQUIPMENT_BUDGET = {
  excavator: { build: "excavator", meshes: 21, footprint: [3.05, 4.83, 10.78], parts: ["trackL", "trackR", "house", "door", "boom", "stick", "bucket", "lights", "counterweight"], note: "20 t tracked excavator, dig-ready" },
  amphibiousExcavator: { build: "amphibiousExcavator", meshes: 22, footprint: [4.65, 5.21, 10.81], parts: ["pontoonL", "pontoonR", "house", "door", "boom", "stick", "bucket", "lights", "counterweight"], note: "amphibious pontoon excavator, dig-ready" },
  backhoe: { build: "backhoe", meshes: 23, footprint: [2.36, 3.75, 7.46], parts: ["loaderArms", "loaderBucket", "swingFrame", "boom", "stick", "bucket", "stabilizers", "wheels", "door", "lights"], note: "loader backhoe, travel pose" },
  skidSteer: { build: "skidSteer", meshes: 12, footprint: [1.83, 2.07, 3.31], parts: ["arms", "bucket", "wheelsL", "wheelsR", "wheels", "door", "lights"], note: "wheeled skid steer" },
  dumpTruck: { build: "dumpTruck", meshes: 20, footprint: [3.02, 3.26, 9.57], parts: ["bed", "tailgate", "hoist", "doorL", "doorR", "mirrorL", "mirrorR", "wheels", "lights"], note: "tri-axle dump truck" },
  mobileCrane: { build: "mobileCrane", meshes: 27, footprint: [2.96, 3.49, 11.46], parts: ["outriggers", "house", "counterweight", "cabDoor", "boom", "boomSections", "hook", "wheels", "lights"], note: "rough-terrain crane, travel pose" },
  aerialBoomLift: { build: "aerialBoomLift", meshes: 19, footprint: [2.42, 2.61, 9], parts: ["turntable", "boom", "boomTele", "jib", "platform", "controls", "groundControls", "wheels", "beacon"], note: "60 ft telescopic boom lift, stowed" },
  scissorLift: { build: "scissorLift", meshes: 15, footprint: [1.16, 2.34, 2.3], parts: ["scissors", "platform", "extensionDeck", "controls", "gate", "potholeGuards", "wheels", "beacon"], note: "26 ft slab scissor, stowed" },
  compactor: { build: "compactor", meshes: 14, footprint: [2.4, 3.12, 5.68], parts: ["frontFrame", "drum", "wheels", "rops", "seat", "controls", "lights", "beacon"], note: "single-drum soil compactor" },
  generatorTrailer: { build: "generatorTrailer", meshes: 14, footprint: [1.9, 2.41, 4.54], parts: ["doorL", "doorR", "controlPanel", "eStop", "wheels", "jack", "lights"], note: "towable diesel generator" },
  lightTower: { build: "lightTower", meshes: 17, footprint: [2.34, 9.29, 3.49], parts: ["mast", "mastUpper", "lamps", "outriggers", "controlPanel", "wheels", "jack"], note: "towable light tower, raised" },
  "lightTower:stowed": { build: "lightTower", opts: { raised: false }, meshes: 17, footprint: [1.58, 1.77, 4.81], parts: ["mast", "mastUpper", "lamps", "outriggers", "controlPanel", "wheels", "jack"], note: "towable light tower, stowed for tow" },
  concretePump: { build: "concretePump", meshes: 16, footprint: [2.04, 1.58, 4.95], parts: ["hopper", "grate", "outlet", "controlPanel", "outriggers", "wheels", "jack", "lights"], note: "trailer line pump" },
  craneSpreader: { build: "craneSpreader", belowGround: true, meshes: 18, footprint: [2.49, 2.17, 12.45], parts: ["headblock", "telescopeFore", "telescopeAft", "twistlocks", "flippers", "indicators", "landed", "locked", "unlocked"], note: "telescopic container spreader, 40 ft" },
};

/** The builders by the name EQUIPMENT_BUDGET's `build` field uses. */
export const EQUIPMENT_BUILDERS = {
  excavator, amphibiousExcavator, backhoe, skidSteer, dumpTruck, mobileCrane, aerialBoomLift, scissorLift, compactor,
  generatorTrailer, lightTower, concretePump, craneSpreader,
};
void THREE; void ball; void flSteerWheel; void flMirror; void flPlan;
