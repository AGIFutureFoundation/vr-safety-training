import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import { box, cyl, ball } from "./kit.js";
import {
  FL, flPaint, flPanel, flBox, flSide, flPlan, flRod, flStrut,
  flRig, flDone, flLivery, flLiveryMat, flDoorMat, flDoor, flGlassMat, flTreadMat, flGrilleMat,
  flAxle, flSteerWheel, flMirror, flLights, flMediumCab, flLightBar, flArticulate, FLEET_BUILDERS, FLEET_BUDGET,
} from "./fleet.js";
import { EQUIPMENT_BUILDERS, EQUIPMENT_BUDGET } from "./equipment.js";
import { DV_DRIVABLES, dvById } from "./drivables-data.js";

// The Motor Pool kit (console MOTORPOOL): the builders the registry in
// drivables-data.js names that no other kit has, and dvBuild(), which renders
// any registry entry through fleet.js, equipment.js or the builders here.
//
// Same contract as shared/fleet.js: `(parent, x, y, z, opts)`, metres, front
// (or bow) toward +Z, footprint centred, y = 0 the ground (or the keel), a
// baked static shell and named parts; the declared mesh count, footprint and
// parts per builder are DV_BUDGET, held by tools/check_fleet.mjs (this file
// is one of its kits) and tools/check_drivables.mjs. No brand, no emblem;
// liveries are the platform's generic names. Every top-level name is
// prefixed dv/DV_ for the bundler.

// ------------------------------------------------------------ road helpers

/** A medium-duty chassis: frame rails, the shared conventional cab, a steer
 *  axle and one or two dual rear axles, head and tail lights. */
function dvTruck(rig, lv, L, o = {}) {
  const Z = (s) => L / 2 - s;
  const S = rig.shell;
  const r = o.wheelR ?? 0.5;
  for (const sx of [1, -1]) box(S, 0.1, 0.28, L - 0.4, sx * 0.44, r + 0.4, Z(L / 2 + 0.1), ...FL.frame);
  const cab = flMediumCab(rig, lv, Z, { cabW: 2.3, roof: o.roof ?? 2.9, cabBack: o.cabBack ?? 3.35, hoodS: 1.65, frontAxle: 1.2, wheelR: r, body: o.cabColour });
  const rear = o.axles ?? [L - 2.2];
  rig.set("wheels", [
    flSteerWheel(rig, "wheelFL", 1.0, Z(1.2), r, 0.32, { style: "steel" }),
    flSteerWheel(rig, "wheelFR", -1.0, Z(1.2), r, 0.32, { style: "steel" }),
    ...rear.map((s, i) => flAxle(rig, `axle${i + 2}`, Z(s), r, 1.95, { dual: true, style: "steel" })),
  ]);
  flLights(rig, [[0.78, 1.28, Z(0.16)], [-0.78, 1.28, Z(0.16)]], o.markers ?? [[-0.3, (o.roof ?? 2.9) + 0.03, Z(1.95)], [0, (o.roof ?? 2.9) + 0.03, Z(1.95)], [0.3, (o.roof ?? 2.9) + 0.03, Z(1.95)]],
    [[1.0, 0.95, Z(L - 0.05)], [-1.0, 0.95, Z(L - 0.05)]]);
  return { Z, cab };
}

/** A small operator's seat with a wheel and a rollover frame — mowers, small yard machines. */
function dvSeatAndRops(rig, S, y, s, Z, w = 0.9, h = 1.0) {
  const seat = rig.part("seat", 0, y, Z(s));
  box(seat, 0.5, 0.1, 0.5, 0, 0.05, 0, ...FL.black);
  box(seat, 0.5, 0.5, 0.1, 0, 0.32, -0.22, ...FL.black);
  flRod(S, 0.17, 0.03, 0, y + 0.55, Z(s - 0.55), "y", ...FL.black, { seg: 16 });
  flStrut(S, [0, y + 0.2, Z(s - 0.5)], [0, y + 0.55, Z(s - 0.55)], 0.02, ...FL.black);
  const rops = rig.part("rops", 0, y, Z(s));
  for (const sx of [1, -1]) flStrut(rops, [sx * w / 2, 0, 0.1], [sx * w / 2, h, 0.1], 0.035, ...FL.frame);
  box(rops, w + 0.07, 0.07, 0.07, 0, h, 0.1, ...FL.frame);
  return seat;
}

function dvBeacon(rig, x, y, z, name = "beacon") {
  const b = rig.part(name, x, y, z);
  cyl(b, 0.07, 0.08, 0.14, 0, 0, 0, ...FL.amber, { seg: 12 });
  return b;
}

// ------------------------------------------------------------ road builders

/** Flatbed straight truck: stake-pocket deck, headache rack, chain winches. Parts: doorL, doorR, mirrorL, mirrorR, wheels, lights, headacheRack, winches, beacon. */
export function dvFlatbedTruck(parent, x, y, z, opts = {}) {
  const lv = flLivery(opts.livery, { colour: 0x2c5a7a, fleetName: "SMARTCITI FREIGHT", unitNumber: "F-18" });
  const L = 9.4, rig = flRig(parent, x, y, z, opts, "dvFlatbedTruck"), S = rig.shell;
  const { Z } = dvTruck(rig, lv, L, {});
  const b0 = 3.5, bl = L - b0 - 0.1;
  flBox(S, 2.5, 0.12, bl, 0, 1.22, Z(b0 + bl / 2), flTreadMat());
  for (const sx of [1, -1]) box(S, 0.08, 0.14, bl, sx * 1.25, 1.14, Z(b0 + bl / 2), ...FL.frame);
  for (const sx of [1, -1]) for (let i = 0; i < 6; i++) box(S, 0.08, 0.1, 0.16, sx * 1.3, 1.16, Z(b0 + 0.4 + i * (bl - 0.8) / 5), ...FL.frame);
  const rack = rig.part("headacheRack", 0, 1.28, Z(b0 + 0.1));
  for (const sx of [1, -1]) flStrut(rack, [sx * 1.15, 0, 0], [sx * 1.15, 1.6, 0], 0.04, ...FL.steel);
  box(rack, 2.4, 0.06, 0.06, 0, 1.6, 0, ...FL.steel);
  for (let i = 0; i < 5; i++) box(rack, 0.03, 1.5, 0.03, -1.0 + i * 0.5, 0.8, 0, ...FL.steel);
  const winches = rig.part("winches", 0, 1.0, Z(b0 + bl / 2));
  for (const sx of [1, -1]) for (let i = 0; i < 3; i++) cyl(winches, 0.08, 0.08, 0.14, sx * 1.33, 0, -bl / 2 + 0.9 + i * (bl - 1.8) / 2, ...FL.steel, { seg: 10 }).rotation.z = Math.PI / 2;
  dvBeacon(rig, -0.6, 2.98, Z(2.4));
  return flDone(rig, { footprint: DV_BUDGET.dvFlatbedTruck.footprint, livery: lv });
}

/** Water truck: elliptical tank with a rear spray bar and side cannon. Parts: doorL, doorR, mirrorL, mirrorR, wheels, lights, sprayBar, cannon, fillHatch, beacon. */
export function dvWaterTruck(parent, x, y, z, opts = {}) {
  const lv = flLivery(opts.livery, { colour: 0xf2f2ee, accent: 0x1c8f6f, fleetName: "SMARTCITI BUILD", unitNumber: "W-07" });
  const L = 9.4, rig = flRig(parent, x, y, z, opts, "dvWaterTruck"), S = rig.shell;
  const { Z } = dvTruck(rig, lv, L, { axles: [6.6, 8.0] });
  const t0 = 3.6, tl = L - t0 - 0.3;
  const tank = cyl(S, 1.15, 1.15, tl, 0, 2.0, Z(t0 + tl / 2), ...flPaint(lv.colour), { seg: 22 });
  tank.rotation.x = Math.PI / 2; tank.scale.x = 1.08; tank.scale.y = 0.8;
  for (const sx of [1, -1]) flPanel(S, tl * 0.8, 0.5, sx * 1.245, 2.05, Z(t0 + tl / 2), flLiveryMat(lv, "tankSide", { title: lv.fleetName, sub: lv.unitNumber, titleScale: 0.4, titleY: 0.45, stripeY: 0.85 }), sx > 0 ? "+x" : "-x");
  flBox(S, 0.7, 0.04, tl - 0.4, 0, 2.94, Z(t0 + tl / 2), flTreadMat());   // top walkway
  box(S, 2.2, 0.35, 0.3, 0, 0.62, Z(L - 0.2), ...FL.steel);
  const hatch = rig.part("fillHatch", 0, 2.96, Z(t0 + 0.8));
  cyl(hatch, 0.28, 0.28, 0.12, 0, 0.06, 0, ...FL.alu, { seg: 14 });
  const bar = rig.part("sprayBar", 0, 0.8, Z(L - 0.05));
  flRod(bar, 0.05, 2.4, 0, 0, 0, "x", ...FL.steel);
  for (let i = 0; i < 5; i++) cyl(bar, 0.04, 0.06, 0.1, -1.0 + i * 0.5, -0.08, 0, ...FL.black, { seg: 8 });
  const cannon = rig.part("cannon", 0.7, 3.0, Z(t0 + 0.3));
  cyl(cannon, 0.06, 0.06, 0.3, 0, 0.15, 0, ...FL.steel, { seg: 10 });
  const barrel = cyl(cannon, 0.05, 0.07, 0.6, 0, 0.35, 0.28, ...FL.steel, { seg: 10 }); barrel.rotation.x = Math.PI / 2 - 0.4;
  dvBeacon(rig, -0.6, 2.98, Z(2.4));
  return flDone(rig, { footprint: DV_BUDGET.dvWaterTruck.footprint, livery: lv });
}

/** Rear-discharge concrete mixer: inclined drum on a pedestal, charge hopper, discharge chute, water tank. Parts: doorL, doorR, mirrorL, mirrorR, wheels, lights, drum, hopper, chute, waterTank, ladder. */
export function dvMixerTruck(parent, x, y, z, opts = {}) {
  const lv = flLivery(opts.livery, { colour: 0xf2f2ee, accent: 0xe0592a, fleetName: "SMARTCITI BUILD", unitNumber: "M-22" });
  const L = 9.6, rig = flRig(parent, x, y, z, opts, "dvMixerTruck"), S = rig.shell;
  const { Z } = dvTruck(rig, lv, L, { axles: [6.4, 7.8] });
  flSide(S, [[3.5, 1.05], [3.5, 2.4], [4.3, 2.5], [4.4, 1.05]], 1.6, 0, 0, Z(0), ...FL.frame, { bevel: 0.03 });   // front pedestal
  const drum = rig.part("drum", 0, 2.55, Z(6.2));
  const d = cyl(drum, 1.15, 0.75, 4.2, 0, 0, 0, ...flPaint(lv.colour), { seg: 22 });
  d.rotation.x = Math.PI / 2 + 0.22;
  const nose = cyl(drum, 0.75, 0.45, 0.9, 0, 0.55, -2.35, ...flPaint(lv.colour), { seg: 18 }); nose.rotation.x = Math.PI / 2 + 0.22;
  for (const sx of [1, -1]) flPanel(drum, 2.4, 0.5, sx * 1.02, 0.1, 0.2, flLiveryMat(lv, "drumSide", { title: lv.fleetName, sub: lv.unitNumber, titleScale: 0.4, titleY: 0.45, stripeY: 0.86 }), sx > 0 ? "+x" : "-x");
  const hopper = rig.part("hopper", 0, 3.3, Z(L - 0.9));
  const h = cyl(hopper, 0.7, 0.35, 0.7, 0, 0, 0, ...FL.steel, { seg: 14 }); h.rotation.x = -0.3;
  const chute = rig.part("chute", 0, 2.0, Z(L - 0.35));
  const c = box(chute, 0.5, 0.25, 1.4, 0, -0.35, 0.35, ...FL.steel); c.rotation.x = 0.5;
  for (const sx of [1, -1]) flStrut(S, [sx * 0.9, 1.1, Z(L - 0.4)], [sx * 0.6, 3.0, Z(L - 0.9)], 0.06, ...FL.frame);
  const tank = rig.part("waterTank", 0.9, 1.9, Z(4.0));
  const wt = cyl(tank, 0.32, 0.32, 1.6, 0, 0, 0, ...FL.alu, { seg: 14 }); wt.rotation.x = Math.PI / 2;
  const ladder = rig.part("ladder", -1.1, 1.0, Z(L - 1.4));
  for (const sx of [0.15, -0.15]) flRod(ladder, 0.02, 2.0, sx, 1.0, 0, "y", ...FL.alu);
  for (let i = 0; i < 6; i++) flRod(ladder, 0.015, 0.3, 0, 0.3 + i * 0.33, 0, "x", ...FL.alu);
  return flDone(rig, { footprint: DV_BUDGET.dvMixerTruck.footprint, livery: lv });
}

/** Street sweeper: low cab-forward chassis, hopper, two gutter brooms and a pickup head. Parts: doorL, doorR, wheels, lights, brooms [broomL, broomR], pickupHead, hopper, beacon. */
export function dvSweeper(parent, x, y, z, opts = {}) {
  const lv = flLivery(opts.livery, { colour: 0xf2f2ee, accent: 0xf07a1f, fleetName: "SMARTCITI STREETS", unitNumber: "SW-03" });
  const L = 6.4, W = 2.3, Z = (s) => L / 2 - s;
  const rig = flRig(parent, x, y, z, opts, "dvSweeper"), S = rig.shell, P = flPaint(lv.colour);
  for (const sx of [1, -1]) box(S, 0.1, 0.25, L - 0.6, sx * 0.42, 0.75, Z(L / 2), ...FL.frame);
  flSide(S, [[0.1, 0.5], [0.05, 1.6], [0.3, 2.6], [1.9, 2.65], [1.95, 0.5]], W, 0, 0, Z(0), ...P, { bevel: 0.05 });   // cab
  flPanel(S, W - 0.3, 1.0, 0, 2.0, Z(0.1) + 0.05, flGlassMat(), "+z", 0.18);
  flDoor(rig, "doorL", 1, W / 2, 0.9, Z(0.7), 1.0, 1.5, flDoorMat(lv, "L", { marks: "none" }));
  flDoor(rig, "doorR", -1, -W / 2, 0.9, Z(0.7), 1.0, 1.5, flDoorMat(lv, "R", { marks: "none" }));
  const hopper = rig.part("hopper", 0, 1.0, Z(4.1));
  flSide(hopper, [[-1.9, 0.1], [-1.9, 1.7], [1.9, 1.7], [2.0, 0.2]], W - 0.1, 0, 0, 0, ...P, { bevel: 0.04 });
  for (const sx of [1, -1]) flPanel(hopper, 3.2, 0.6, sx * (W / 2 - 0.04), 1.0, 0, flLiveryMat(lv, "sweeperSide", { title: lv.fleetName, sub: lv.unitNumber, titleScale: 0.36, titleY: 0.45, stripeY: 0.85 }), sx > 0 ? "+x" : "-x");
  cyl(S, 0.2, 0.2, 1.2, 0, 2.9, Z(4.2), ...FL.alu, { seg: 12 }).rotation.z = Math.PI / 2;   // fan housing
  const brooms = [];
  for (const [name, sx] of [["broomL", 1], ["broomR", -1]]) {
    const b = rig.part(name, sx * 1.15, 0.2, Z(2.5));
    cyl(b, 0.45, 0.45, 0.2, 0, 0, 0, 0x2a2e33, { rough: 0.9, finish: "rubber", seg: 16 });
    flStrut(b, [0, 0.1, 0], [-sx * 0.5, 0.55, -0.4], 0.03, ...FL.steel);
    brooms.push(b);
  }
  rig.set("brooms", brooms);
  const head = rig.part("pickupHead", 0, 0.15, Z(3.1));
  box(head, 1.6, 0.25, 0.6, 0, 0.12, 0, ...FL.steel);
  rig.set("wheels", [
    flSteerWheel(rig, "wheelFL", 0.95, Z(1.3), 0.42, 0.26, { style: "steel" }),
    flSteerWheel(rig, "wheelFR", -0.95, Z(1.3), 0.42, 0.26, { style: "steel" }),
    flAxle(rig, "axle2", Z(4.9), 0.42, 1.9, { dual: true, style: "steel" }),
  ]);
  flLights(rig, [[0.75, 0.9, Z(0.08)], [-0.75, 0.9, Z(0.08)]], null, [[0.9, 1.0, Z(L - 0.02)], [-0.9, 1.0, Z(L - 0.02)]]);
  dvBeacon(rig, 0, 2.72, Z(1.0));
  return flDone(rig, { footprint: DV_BUDGET.dvSweeper.footprint, livery: lv });
}

/** Wrecker: medium chassis with a wheel-lift underreach and a boom with a winch. Parts: doorL, doorR, mirrorL, mirrorR, wheels, lights, boom, wheelLift, winch, lightBar, workLights. */
export function dvWrecker(parent, x, y, z, opts = {}) {
  const lv = flLivery(opts.livery, { colour: 0x14171a, accent: 0xf2b21b, fleetName: "SMARTCITI FLEET", unitNumber: "TW-09" });
  const L = 8.6, rig = flRig(parent, x, y, z, opts, "dvWrecker"), S = rig.shell;
  const { Z } = dvTruck(rig, lv, L, {});
  const b0 = 3.5;
  flSide(S, [[b0, 1.05], [b0, 1.7], [L - 0.4, 1.7], [L - 0.4, 1.05]], 2.3, 0, 0, Z(0), ...flPaint(lv.colour), { bevel: 0.04 });   // body deck
  for (const sx of [1, -1]) flPanel(S, 3.6, 0.5, sx * 1.155, 1.4, Z(b0 + 2.4), flLiveryMat(lv, "wreckerSide", { title: lv.fleetName, sub: lv.unitNumber, titleScale: 0.36, titleY: 0.45, stripeY: 0.86 }), sx > 0 ? "+x" : "-x");
  const boom = rig.part("boom", 0, 1.75, Z(b0 + 0.6));
  flSide(boom, [[0, 0.0], [0.2, 0.9], [3.6, 0.5], [3.6, 0.2]], 0.5, 0, 0, 0, ...FL.frame, { bevel: 0.03 });
  const winch = rig.part("winch", 0, 0.75, 0.6, boom);
  cyl(winch, 0.18, 0.18, 0.5, 0, 0, 0, ...FL.steel, { seg: 12 }).rotation.z = Math.PI / 2;
  const wl = rig.part("wheelLift", 0, 0.5, Z(L - 0.2));
  box(wl, 0.4, 0.2, 1.6, 0, 0, 0.6, ...FL.frame);
  box(wl, 2.2, 0.15, 0.2, 0, 0, 1.4, ...FL.frame);
  for (const sx of [1, -1]) box(wl, 0.15, 0.1, 0.7, sx * 1.0, 0.05, 1.7, ...FL.frame);
  flLightBar(rig, "lightBar", 0, 3.02, Z(2.3), 1.6, { colours: [FL.amber, FL.lamp] });
  const work = rig.part("workLights", 0, 2.6, Z(b0 + 0.05));
  for (const sx of [0.6, -0.6]) box(work, 0.18, 0.12, 0.08, sx, 0, 0, ...FL.lamp);
  return flDone(rig, { footprint: DV_BUDGET.dvWrecker.footprint, livery: lv });
}

/** Digger derrick: line-truck chassis, telescoping derrick with an auger and a pole claw, outriggers. Parts: doorL, doorR, mirrorL, mirrorR, wheels, lights, turret, boom, boomUpper, auger, poleClaw, outriggers, compartments, beacon. */
export function dvDiggerDerrick(parent, x, y, z, opts = {}) {
  const lv = flLivery(opts.livery, { colour: 0xf2f2ee, accent: 0xf07a1f, fleetName: "SMARTCITI UTILITIES", unitNumber: "U-31" });
  const L = 10.2, rig = flRig(parent, x, y, z, opts, "dvDiggerDerrick"), S = rig.shell;
  const { Z } = dvTruck(rig, lv, L, { axles: [7.0, 8.4] });
  const comp = rig.part("compartments", 0, 1.05, Z(6.6));
  for (const sx of [1, -1]) flBox(comp, 0.5, 1.1, 5.8, sx * 0.95, 0.55, 0, flLiveryMat(lv, "compSide", { title: lv.fleetName, sub: lv.unitNumber, titleScale: 0.3, titleY: 0.45, stripeY: 0.86 }));
  flBox(S, 1.4, 0.06, 5.8, 0, 2.18, Z(6.6), flTreadMat());
  const turret = rig.part("turret", 0, 2.2, Z(L - 1.4));
  cyl(turret, 0.55, 0.65, 0.6, 0, 0.3, 0, ...FL.frame, { seg: 16 });
  const boom = rig.part("boom", 0, 0.7, 0, turret);
  const b1 = box(boom, 0.42, 0.42, 5.6, 0, 0.6, 2.6, ...flPaint(lv.accent)); b1.rotation.x = -0.35;
  const upper = rig.part("boomUpper", 0, 2.55, 5.2, boom);
  const b2 = box(upper, 0.3, 0.3, 3.0, 0, 0.5, 1.4, ...flPaint(lv.accent)); b2.rotation.x = -0.35;
  const auger = rig.part("auger", 0, 0.1, 3.0, upper);
  flRod(auger, 0.12, 1.8, 0, -0.9, 0, "y", ...FL.steel);
  for (let i = 0; i < 4; i++) cyl(auger, 0.3, 0.3, 0.04, 0, -0.5 - i * 0.35, 0, ...FL.steel, { seg: 12 });
  const claw = rig.part("poleClaw", 0, 1.0, 2.6, upper);
  for (const sx of [1, -1]) flStrut(claw, [0, 0, 0], [sx * 0.35, -0.5, 0.1], 0.04, ...FL.steel);
  const out = rig.part("outriggers", 0, 0.9, Z(L - 1.4));
  for (const sx of [1, -1]) { box(out, 1.3, 0.2, 0.25, sx * 1.4, 0, 0, ...FL.frame); box(out, 0.18, 0.7, 0.18, sx * 2.0, -0.35, 0, ...FL.frame); }
  dvBeacon(rig, -0.6, 2.98, Z(2.4));
  return flDone(rig, { footprint: DV_BUDGET.dvDiggerDerrick.footprint, livery: lv });
}

/** Aerial ladder truck: long tandem chassis, turntable, a stowed three-section ladder, ground ladders and compartments. Parts: doorL, doorR, doorCrewL, doorCrewR, mirrorL, mirrorR, wheels, lights, turntable, ladder, ladderFly, compartments, outriggers, warningLights. */
export function dvLadderTruck(parent, x, y, z, opts = {}) {
  const lv = flLivery(opts.livery, { colour: 0xd8322c, accent: 0xf4f5f3, fleetName: "SMARTCITI FIRE", unitNumber: "L-04" });
  const L = 12.6, rig = flRig(parent, x, y, z, opts, "dvLadderTruck"), S = rig.shell;
  const { Z } = dvTruck(rig, lv, L, { axles: [8.8, 10.2], roof: 2.95, cabBack: 4.4, cabColour: lv.colour });
  for (const [name, sx] of [["doorCrewL", 1], ["doorCrewR", -1]]) flDoor(rig, name, sx, sx * 1.15, 1.0, Z(3.3), 0.95, 1.8, flDoorMat(lv, sx > 0 ? "L" : "R", { marks: "dot", body: lv.colour }));
  const comp = rig.part("compartments", 0, 1.05, Z(8.2));
  for (const sx of [1, -1]) flBox(comp, 0.55, 1.4, 7.4, sx * 1.02, 0.7, 0, flLiveryMat(lv, "ladderSide", { title: lv.fleetName, sub: lv.unitNumber, titleScale: 0.3, titleY: 0.45, stripeY: 0.9 }));
  flBox(S, 1.3, 0.06, 7.4, 0, 2.48, Z(8.2), flTreadMat());
  const tt = rig.part("turntable", 0, 2.5, Z(L - 1.6));
  cyl(tt, 0.9, 1.0, 0.5, 0, 0.25, 0, ...FL.frame, { seg: 18 });
  const ladder = rig.part("ladder", 0, 0.6, 0, tt);
  for (const sx of [0.45, -0.45]) box(ladder, 0.08, 0.35, 9.6, sx, 0.2, 4.6, ...FL.alu);
  for (let i = 0; i < 20; i++) flRod(ladder, 0.02, 0.9, 0, 0.1, 0.2 + i * 0.47, "x", ...FL.alu);
  const fly = rig.part("ladderFly", 0, 0.42, 0.4, ladder);
  for (const sx of [0.35, -0.35]) box(fly, 0.06, 0.3, 9.0, sx, 0.15, 4.5, ...FL.alu);
  const out = rig.part("outriggers", 0, 1.0, Z(L - 1.6));
  for (const sx of [1, -1]) { box(out, 1.2, 0.22, 0.3, sx * 1.4, 0, 0, ...FL.frame); box(out, 0.2, 0.8, 0.2, sx * 1.95, -0.4, 0, ...FL.frame); }
  flLightBar(rig, "warningLights", 0, 3.08, Z(2.2), 2.0);
  return flDone(rig, { footprint: DV_BUDGET.dvLadderTruck.footprint, livery: lv });
}

/** Streetcar: a single-truck-style body on two bogies, trolley pole, doors on the curb side. Parts: doors [doorFront, doorRear], bogies [bogieF, bogieR], trolleyPole, destinationSign, lights. */
export function dvStreetcar(parent, x, y, z, opts = {}) {
  const lv = flLivery(opts.livery, { colour: 0x2e6b4f, accent: 0xd8322c, fleetName: "SMARTCITI TRANSIT", unitNumber: "SC-12" });
  const L = 14.0, W = 2.5, Z = (s) => L / 2 - s;
  const rig = flRig(parent, x, y, z, opts, "dvStreetcar"), S = rig.shell, P = flPaint(lv.colour);
  flSide(S, [[0.0, 0.5], [0.0, 1.0], [0.4, 1.0], [0.4, 3.0], [0.6, 3.35], [L - 0.6, 3.35], [L - 0.4, 3.0], [L - 0.4, 1.0], [L, 1.0], [L, 0.5]], W, 0, 0, Z(0), ...P, { bevel: 0.05 });
  const side = flLiveryMat(lv, "streetcarSide", { title: lv.fleetName, sub: lv.unitNumber, titleScale: 0.3, titleY: 0.3, stripeY: 0.92, pw: 1536, ph: 384 });
  for (const sx of [1, -1]) flPanel(S, L - 1.4, 1.1, sx * (W / 2 + 0.005), 1.55, Z(L / 2), side, sx > 0 ? "+x" : "-x");
  const glass = flGlassMat();
  for (const sx of [1, -1]) flPanel(S, L - 2.0, 0.75, sx * (W / 2 + 0.008), 2.55, Z(L / 2), glass, sx > 0 ? "+x" : "-x");
  flPanel(S, W - 0.4, 1.2, 0, 2.3, Z(0.4) + 0.01, glass, "+z");
  flPanel(S, W - 0.4, 1.2, 0, 2.3, Z(L - 0.4) - 0.01, glass, "-z");
  const roof = cyl(S, 1.0, 1.0, L - 1.4, 0, 3.2, Z(L / 2), ...flPaint(0x9aa0a6), { seg: 16 }); roof.rotation.x = Math.PI / 2; roof.scale.y = 0.35;
  const doors = [];
  for (const [name, s] of [["doorFront", 1.2], ["doorRear", L - 2.4]]) {
    const d = rig.part(name, -(W / 2 - 0.01), 1.0, Z(s));
    flBox(d, 0.04, 2.1, 1.1, 0, 1.05, -0.55, flDoorMat(lv, "R", { window: 0.5, marks: "none" }));
    d.userData.slide = -1.1; d.userData.openAngle = 0;
    doors.push(d);
  }
  rig.set("doors", doors);
  const bogies = [];
  for (const [name, s] of [["bogieF", 2.6], ["bogieR", L - 2.6]]) {
    const b = rig.part(name, 0, 0.42, Z(s));
    box(b, 2.2, 0.35, 2.2, 0, 0, 0, ...FL.frame);
    for (const dz of [-0.85, 0.85]) for (const sx of [0.75, -0.75]) cyl(b, 0.38, 0.38, 0.1, sx, 0, dz, ...FL.steel, { seg: 16 }).rotation.z = Math.PI / 2;
    bogies.push(b);
  }
  rig.set("bogies", bogies);
  const pole = rig.part("trolleyPole", 0, 3.5, Z(L / 2 + 1.0));
  const p = flRod(pole, 0.03, 4.2, 0, 1.4, -1.6, "y", ...FL.steel); p.rotation.x = 0.85;
  const sign = rig.part("destinationSign", 0, 3.1, Z(0.36));
  box(sign, 1.2, 0.3, 0.05, 0, 0, 0, ...FL.lamp);
  flLights(rig, [[0, 1.3, Z(0.02), 0.3, 0.3]], null, [[0.8, 1.3, Z(L - 0.01)], [-0.8, 1.3, Z(L - 0.01)]]);
  return flDone(rig, { footprint: DV_BUDGET.dvStreetcar.footprint, livery: lv });
}

/** Rail switcher: end-cab yard locomotive on two trucks, long hood, walkways and handrails. Parts: cabDoor, trucks [truckF, truckR], couplers [couplerF, couplerR], bell, horn, lights, headlights, markerLights, tailLights. */
export function dvRailSwitcher(parent, x, y, z, opts = {}) {
  const lv = flLivery(opts.livery, { colour: 0x2c5a7a, accent: 0xf0b323, fleetName: "SMARTCITI RAIL", unitNumber: "RS-08" });
  const L = 13.8, W = 3.0, Z = (s) => L / 2 - s;
  const rig = flRig(parent, x, y, z, opts, "dvRailSwitcher"), S = rig.shell, P = flPaint(lv.colour);
  flBox(S, W, 0.3, L - 1.0, 0, 1.25, Z(L / 2), flTreadMat());   // frame / walkway deck
  flSide(S, [[0.5, 1.4], [0.5, 3.4], [9.6, 3.4], [9.6, 1.4]], W - 0.9, 0, 0, Z(0), ...P, { bevel: 0.05 });   // long hood
  flSide(S, [[9.6, 1.4], [9.6, 4.0], [12.9, 4.0], [12.9, 1.4]], W - 0.2, 0, 0, Z(0), ...P, { bevel: 0.05 });   // cab
  const glass = flGlassMat();
  for (const sx of [1, -1]) flPanel(S, 2.6, 0.9, sx * (W / 2 - 0.09), 3.1, Z(11.25), glass, sx > 0 ? "+x" : "-x");
  flPanel(S, W - 0.6, 0.9, 0, 3.1, Z(9.6) + 0.01, glass, "+z");
  flPanel(S, W - 0.6, 0.9, 0, 3.1, Z(12.9) - 0.01, glass, "-z");
  for (const sx of [1, -1]) flPanel(S, 7.6, 1.3, sx * (W / 2 - 0.44), 2.4, Z(5.0), flLiveryMat(lv, "hoodSide", { title: lv.fleetName, sub: lv.unitNumber, titleScale: 0.34, titleY: 0.45, stripeY: 0.9, pw: 1536, ph: 384 }), sx > 0 ? "+x" : "-x");
  for (const sx of [1, -1]) { flRod(S, 0.02, L - 1.4, sx * (W / 2 - 0.05), 2.1, Z(L / 2), "z", ...FL.alu); for (let s = 1.0; s < L - 0.8; s += 1.6) flRod(S, 0.018, 0.75, sx * (W / 2 - 0.05), 1.75, Z(s), "y", ...FL.alu); }
  box(S, 1.2, 0.6, 1.0, 0, 3.75, Z(4.5), ...FL.frame);   // exhaust / radiator housing
  const trucks = [];
  for (const [name, s] of [["truckF", 3.2], ["truckR", L - 3.2]]) {
    const t = rig.part(name, 0, 0.5, Z(s));
    box(t, 2.4, 0.5, 2.9, 0, 0, 0, ...FL.frame);
    for (const dz of [-1.0, 1.0]) for (const sx of [0.8, -0.8]) cyl(t, 0.5, 0.5, 0.12, sx, 0, dz, ...FL.steel, { seg: 16 }).rotation.z = Math.PI / 2;
    trucks.push(t);
  }
  rig.set("trucks", trucks);
  const couplers = [];
  for (const [name, s, k] of [["couplerF", 0.15, 1], ["couplerR", L - 0.15, -1]]) {
    const c = rig.part(name, 0, 0.95, Z(s));
    box(c, 0.3, 0.3, 0.5, 0, 0, k * 0.1, ...FL.steel);
    box(c, 0.45, 0.35, 0.2, 0, 0, k * 0.35, ...FL.steel);
    couplers.push(c);
  }
  rig.set("couplers", couplers);
  const bell = rig.part("bell", 0.6, 4.1, Z(10.0));
  cyl(bell, 0.12, 0.16, 0.2, 0, 0, 0, 0xc9a04a, { rough: 0.35, metal: 0.7, seg: 12 });
  const horn = rig.part("horn", -0.5, 4.1, Z(10.4));
  for (let i = 0; i < 3; i++) cyl(horn, 0.03, 0.08, 0.4, i * 0.14 - 0.14, 0, 0, ...FL.chrome, { seg: 10 }).rotation.x = Math.PI / 2;
  flLights(rig, [[0, 3.0, Z(0.5) + 0.03, 0.4, 0.3], [0, 3.6, Z(12.9) - 0.03, 0.4, 0.3]], [[0, 4.05, Z(11.3)]], [[1.0, 1.55, Z(L - 0.5)], [-1.0, 1.55, Z(L - 0.5)]]);
  return flDone(rig, { footprint: DV_BUDGET.dvRailSwitcher.footprint, livery: lv });
}

/** Stand-up reach truck: narrow-aisle lift truck with outrigger legs and a pantograph reach. Parts: mast, innerMast, carriage, forks, reach, overheadGuard, controls, wheels, lights, beacon. */
export function dvReachTruck(parent, x, y, z, opts = {}) {
  const lv = flLivery(opts.livery, { colour: 0xe0592a, fleetName: "", unitNumber: "RT-5" });
  const L = 2.7, W = 1.2, Z = (s) => L / 2 - s;
  const rig = flRig(parent, x, y, z, opts, "dvReachTruck", [0, 0, -0.34]), S = rig.shell, P = flPaint(lv.colour);
  flSide(S, [[1.2, 0.15], [1.2, 1.2], [1.4, 1.35], [2.65, 1.35], [2.68, 0.2]], W - 0.12, 0, 0, Z(0), ...P, { bevel: 0.04 });   // power unit
  for (const sx of [1, -1]) box(S, 0.18, 0.28, 1.3, sx * (W / 2 - 0.09), 0.2, Z(0.65), ...P);   // outrigger legs
  flPanel(S, 0.5, 0.2, -(W / 2 - 0.05), 0.85, Z(2.0), flLiveryMat(lv, "reachSide", { title: lv.unitNumber, sub: " ", titleScale: 0.6, titleY: 0.5, stripeY: 2 }), "-x");
  const og = rig.part("overheadGuard", 0, 0, Z(1.9));
  for (const sx of [1, -1]) { flStrut(og, [sx * 0.5, 1.3, -0.5], [sx * 0.5, 2.3, -0.5], 0.035, ...FL.black); flStrut(og, [sx * 0.5, 1.3, 0.5], [sx * 0.5, 2.3, 0.5], 0.035, ...FL.black); }
  for (let i = 0; i < 5; i++) box(og, 1.05, 0.04, 0.05, 0, 2.3, -0.45 + i * 0.22, ...FL.black);
  const mast = rig.part("mast", 0, 0.2, Z(0.9));
  for (const sx of [1, -1]) box(mast, 0.08, 2.4, 0.12, sx * 0.4, 1.2, 0, ...FL.frame);
  box(mast, 0.9, 0.08, 0.1, 0, 2.38, 0, ...FL.frame);
  const inner = rig.part("innerMast", 0, 0.05, 0.04, mast);
  for (const sx of [1, -1]) box(inner, 0.06, 2.4, 0.08, sx * 0.3, 1.2, 0.08, ...FL.frame);
  const reach = rig.part("reach", 0, 0.3, 0.16, mast);
  for (const sx of [1, -1]) flStrut(reach, [sx * 0.25, 0, 0], [sx * 0.25, 0.5, 0.3], 0.03, ...FL.steel);
  const carriage = rig.part("carriage", 0, 0, 0.35, reach);
  box(carriage, 0.9, 0.5, 0.05, 0, 0.35, 0, ...FL.frame);
  const forks = rig.part("forks", 0, 0, 0, carriage);
  for (const sx of [1, -1]) { box(forks, 0.1, 0.4, 0.05, sx * 0.28, 0.2, 0.04, ...FL.steel); box(forks, 0.1, 0.04, 1.05, sx * 0.28, -0.02, 0.55, ...FL.steel); }
  const ctl = rig.part("controls", 0.25, 1.2, Z(1.55));
  box(ctl, 0.35, 0.08, 0.25, 0, 0, 0, ...FL.black);
  ball(ctl, 0.03, 0.1, 0.1, 0, ...FL.red, { seg: 8, seg2: 6 });
  rig.set("wheels", [
    flAxle(rig, "wheelsLoad", Z(0.45), 0.13, 1.0, { width: 0.1, style: "black", tread: "smooth", hubR: 0.04 }),
    flAxle(rig, "wheelsDrive", Z(2.3), 0.2, 0.7, { width: 0.16, style: "black", tread: "smooth", hubR: 0.05 }),
  ]);
  flLights(rig, [[0.45, 2.2, Z(1.45), 0.1, 0.08], [-0.45, 2.2, Z(1.45), 0.1, 0.08]], null, [[0.45, 1.0, Z(L - 0.02), 0.1, 0.08], [-0.45, 1.0, Z(L - 0.02), 0.1, 0.08]]);
  dvBeacon(rig, -0.4, 2.38, Z(2.3));
  return flDone(rig, { footprint: DV_BUDGET.dvReachTruck.footprint, livery: lv });
}

/** Straddle carrier (CLEANPORTS): four legs on wheeled sills, a top frame with the cab high on one side, a container spreader slung between the legs, and an orange battery box on the frame — generic, no maker's shape. Parts: legs, spreader, cab, battery, wheels, lights, beacon. */
export function dvStraddleCarrier(parent, x, y, z, opts = {}) {
  const lv = flLivery(opts.livery, { colour: 0xd8a42b, fleetName: "", unitNumber: "SC-1" });
  const L = 5.2, W = 3.4, H = 6.2, Z = (s) => L / 2 - s;
  const rig = flRig(parent, x, y, z, opts, "dvStraddleCarrier", [0, 0, 0]), S = rig.shell, P = flPaint(lv.colour);
  const legs = rig.part("legs", 0, 0, 0);
  for (const sx of [1, -1]) {
    box(legs, 0.35, 0.4, L, sx * (W / 2 - 0.18), 0.55, 0, ...P);                       // wheeled sill
    for (const sz of [1, -1]) box(legs, 0.3, H - 0.8, 0.3, sx * (W / 2 - 0.18), (H - 0.8) / 2 + 0.7, sz * (L / 2 - 0.4), ...P);
  }
  box(S, W, 0.35, 0.4, 0, H - 0.2, Z(0.4), ...P);                                       // top frame
  box(S, W, 0.35, 0.4, 0, H - 0.2, -Z(0.4), ...P);
  for (const sx of [1, -1]) box(S, 0.3, 0.35, L - 0.8, sx * (W / 2 - 0.18), H - 0.2, 0, ...P);
  const bat = rig.part("battery", -0.6, H - 0.2, 0);
  box(bat, 1.0, 0.45, 1.6, 0, 0.4, 0, ...FL.black);
  box(bat, 1.02, 0.08, 1.62, 0, 0.62, 0, 0xf07a1f, { rough: 0.5 });
  const cab = rig.part("cab", W / 2 - 0.5, H - 1.2, Z(0.9));
  box(cab, 0.9, 1.0, 1.0, 0, 0, 0, ...FL.frame);
  box(cab, 0.92, 0.5, 0.02, 0, 0.15, 0.51, 0x9fc4d8, { rough: 0.1, metal: 0.5, opacity: 0.7, transparent: true });
  const spreader = rig.part("spreader", 0, 3.2, 0);
  box(spreader, 2.4, 0.2, L - 1.4, 0, 0, 0, ...FL.steel);
  for (const sx of [1, -1]) flStrut(spreader, [sx * 1.0, 0.1, 0], [sx * 1.4, H - 3.5, 0], 0.03, ...FL.black);
  rig.set("wheels", [
    flAxle(rig, "wheelsFront", Z(0.5), 0.45, W - 0.36, { width: 0.3, style: "black", tread: "lug", hubR: 0.12 }),
    flAxle(rig, "wheelsRear", -Z(0.5), 0.45, W - 0.36, { width: 0.3, style: "black", tread: "lug", hubR: 0.12 }),
  ]);
  flLights(rig, [[W / 2 - 0.2, 1.2, Z(0.02), 0.14, 0.1], [-(W / 2 - 0.2), 1.2, Z(0.02), 0.14, 0.1]], null, [[W / 2 - 0.2, 1.2, -Z(0.02), 0.14, 0.1], [-(W / 2 - 0.2), 1.2, -Z(0.02), 0.14, 0.1]]);
  dvBeacon(rig, 0.6, H + 0.02, 0);
  return flDone(rig, { footprint: DV_BUDGET.dvStraddleCarrier.footprint, livery: lv });
}

/** Telehandler: four-wheel chassis, side cab, telescoping boom with a fork carriage, front stabilisers. Parts: boom, boomTele, carriage, forks, door, stabilisers, wheels, lights, beacon. */
export function dvTelehandler(parent, x, y, z, opts = {}) {
  const lv = flLivery(opts.livery, { colour: 0xf2b21b, fleetName: "SMARTCITI BUILD", unitNumber: "TH-6" });
  const L = 6.0, W = 2.4, Z = (s) => L / 2 - s;
  const rig = flRig(parent, x, y, z, opts, "dvTelehandler", [0, 0, -1.54]), S = rig.shell, P = flPaint(lv.colour);
  flSide(S, [[1.0, 0.6], [1.0, 1.5], [5.7, 1.5], [5.8, 0.6]], W - 0.8, 0, 0, Z(0), ...P, { bevel: 0.05 });   // chassis
  flSide(S, [[1.6, 1.0], [1.55, 2.1], [1.8, 2.7], [3.4, 2.7], [3.5, 1.0]], 1.0, 0.7, 0, Z(0), ...P, { bevel: 0.05 });   // cab, left
  flPanel(S, 0.9, 1.0, 0.7, 2.15, Z(1.6) + 0.03, flGlassMat(), "+z", 0.12);
  flPanel(S, 1.6, 0.8, 1.21, 2.2, Z(2.5), flGlassMat(), "+x");
  flDoor(rig, "door", -1, 0.19, 1.05, Z(1.9), 0.9, 1.4, flDoorMat(lv, "L", { window: 0.5, marks: "none" }));
  flPanel(S, 1.8, 0.4, -1.21, 1.2, Z(3.5), flLiveryMat(lv, "thSide", { title: lv.fleetName, sub: lv.unitNumber, titleScale: 0.36, titleY: 0.45, stripeY: 0.86 }), "-x");
  box(S, 0.8, 0.9, 1.2, -0.7, 1.9, Z(4.9), ...P);   // engine hood, right rear
  const boom = rig.part("boom", -0.35, 2.1, Z(5.4));
  const b1 = box(boom, 0.5, 0.5, 5.2, 0, 0.35, 2.6, ...P); b1.rotation.x = -0.12;
  const tele = rig.part("boomTele", 0, 0.9, 4.6, boom);
  const b2 = box(tele, 0.38, 0.38, 2.6, 0, 0, 1.3, ...P); b2.rotation.x = -0.12;
  const carriage = rig.part("carriage", 0, -0.3, 2.6, tele);
  box(carriage, 1.2, 0.6, 0.08, 0, 0.3, 0, ...FL.frame);
  const forks = rig.part("forks", 0, 0, 0, carriage);
  for (const sx of [1, -1]) { box(forks, 0.12, 0.5, 0.06, sx * 0.35, 0.25, 0.06, ...FL.steel); box(forks, 0.12, 0.05, 1.2, sx * 0.35, 0, 0.66, ...FL.steel); }
  const stab = rig.part("stabilisers", 0, 0.5, Z(0.6));
  for (const sx of [1, -1]) { box(stab, 0.6, 0.18, 0.25, sx * 1.1, 0, 0, ...FL.frame); box(stab, 0.16, 0.5, 0.16, sx * 1.35, -0.2, 0, ...FL.frame); }
  rig.set("wheels", [
    flSteerWheel(rig, "wheelFL", 1.05, Z(1.3), 0.62, 0.4, { style: "black", tread: "lug" }),
    flSteerWheel(rig, "wheelFR", -1.05, Z(1.3), 0.62, 0.4, { style: "black", tread: "lug" }),
    flAxle(rig, "axleRear", Z(4.8), 0.62, 2.1, { width: 0.4, style: "black", tread: "lug" }),
  ]);
  flLights(rig, [[0.9, 1.4, Z(1.05), 0.16, 0.12], [-0.9, 1.4, Z(1.05), 0.16, 0.12]], null, [[0.9, 1.3, Z(L - 0.03), 0.16, 0.1], [-0.9, 1.3, Z(L - 0.03), 0.16, 0.1]]);
  dvBeacon(rig, 0.7, 2.77, Z(2.6));
  return flDone(rig, { footprint: DV_BUDGET.dvTelehandler.footprint, livery: lv });
}

/** Ride-on mower: mid-mount deck, rear engine, rollover bar, seat. Parts: deck, blades, seat, rops, wheels, lights. */
export function dvMower(parent, x, y, z, opts = {}) {
  const lv = flLivery(opts.livery, { colour: 0x2e8b57, fleetName: "SMARTCITI PARKS", unitNumber: "MW-2" });
  const L = 2.6, W = 1.5, Z = (s) => L / 2 - s;
  const rig = flRig(parent, x, y, z, opts, "dvMower"), S = rig.shell, P = flPaint(lv.colour);
  flSide(S, [[0.3, 0.3], [0.3, 0.55], [1.3, 0.55], [1.5, 0.95], [2.4, 0.95], [2.45, 0.3]], 1.0, 0, 0, Z(0), ...P, { bevel: 0.04 });
  flPanel(S, 0.8, 0.3, 0.505, 0.75, Z(1.95), flLiveryMat(lv, "mowerSide", { title: lv.unitNumber, sub: " ", titleScale: 0.6, titleY: 0.5, stripeY: 2 }), "+x");
  flRod(S, 0.05, 0.6, 0.35, 0.55, Z(1.5), "z", ...FL.black);   // footrest rail
  const deck = rig.part("deck", 0, 0.12, Z(1.05));
  box(deck, W, 0.14, 0.9, 0, 0, 0, ...P);
  box(deck, W + 0.1, 0.04, 0.95, 0, -0.08, 0, ...FL.black);
  const blades = rig.part("blades", 0, -0.02, 0, deck);
  for (const sx of [-0.45, 0.45]) box(blades, 0.5, 0.01, 0.06, sx, 0, 0, ...FL.steel);
  dvSeatAndRops(rig, S, 0.95, 1.85, Z, 0.8, 1.0);
  rig.set("wheels", [
    flAxle(rig, "wheelsFront", Z(0.55), 0.16, 1.1, { width: 0.14, style: "black", tread: "smooth", hubR: 0.04 }),
    flAxle(rig, "wheelsRear", Z(2.15), 0.3, 1.05, { width: 0.24, style: "black", tread: "lug", hubR: 0.06 }),
  ]);
  flLights(rig, [[0.3, 0.6, Z(0.32), 0.1, 0.08], [-0.3, 0.6, Z(0.32), 0.1, 0.08]], null, [[0.35, 0.7, Z(L - 0.13), 0.08, 0.06], [-0.35, 0.7, Z(L - 0.13), 0.08, 0.06]]);
  return flDone(rig, { footprint: DV_BUDGET.dvMower.footprint, livery: lv });
}

/** Utility terrain vehicle: two-seat side-by-side with a cargo bed, cage and lights. Parts: cage, bed, seats, wheels, lights, lightBar. */
export function dvUtv(parent, x, y, z, opts = {}) {
  const lv = flLivery(opts.livery, { colour: 0x2e8b57, fleetName: "SMARTCITI PARKS", unitNumber: "UT-1" });
  const L = 3.1, W = 1.55, Z = (s) => L / 2 - s;
  const rig = flRig(parent, x, y, z, opts, "dvUtv"), S = rig.shell, P = flPaint(lv.colour);
  flSide(S, [[0.05, 0.4], [0.1, 0.85], [0.8, 0.95], [1.1, 0.6], [2.2, 0.6], [2.2, 0.4]], W - 0.1, 0, 0, Z(0), ...P, { bevel: 0.04 });
  box(S, W - 0.2, 0.06, 1.0, 0, 0.4, Z(1.7), ...FL.black);   // floor
  flPanel(S, 0.5, 0.25, 0, 0.75, Z(1.0), flGrilleMat("car"), "+z");
  const cage = rig.part("cage", 0, 0.45, Z(1.6));
  for (const sx of [1, -1]) { flStrut(cage, [sx * 0.7, 0, -0.5], [sx * 0.65, 1.45, -0.3], 0.03, ...FL.frame); flStrut(cage, [sx * 0.7, 0, 0.6], [sx * 0.65, 1.45, 0.3], 0.03, ...FL.frame); flStrut(cage, [sx * 0.65, 1.45, -0.3], [sx * 0.65, 1.45, 0.3], 0.03, ...FL.frame); }
  box(cage, 1.36, 0.05, 0.05, 0, 1.45, -0.3, ...FL.frame); box(cage, 1.36, 0.05, 0.05, 0, 1.45, 0.3, ...FL.frame);
  flPanel(cage, 1.2, 0.5, 0, 1.15, 0.45, flGlassMat(), "+z", 0.3);
  const seats = rig.part("seats", 0, 0.45, Z(1.7));
  for (const sx of [0.35, -0.35]) { box(seats, 0.5, 0.1, 0.5, sx, 0.05, 0, ...FL.black); box(seats, 0.5, 0.55, 0.1, sx, 0.35, -0.25, ...FL.black); }
  const bed = rig.part("bed", 0, 0.62, Z(2.6));
  box(bed, W - 0.1, 0.04, 0.9, 0, 0, 0, ...P);
  for (const sx of [1, -1]) box(bed, 0.04, 0.3, 0.9, sx * (W / 2 - 0.07), 0.15, 0, ...P);
  box(bed, W - 0.1, 0.3, 0.04, 0, 0.15, 0.43, ...P);
  rig.set("wheels", [
    flSteerWheel(rig, "wheelFL", 0.7, Z(0.55), 0.33, 0.24, { style: "black", tread: "lug" }),
    flSteerWheel(rig, "wheelFR", -0.7, Z(0.55), 0.33, 0.24, { style: "black", tread: "lug" }),
    flAxle(rig, "axleRear", Z(2.5), 0.33, 1.4, { width: 0.24, style: "black", tread: "lug" }),
  ]);
  flLights(rig, [[0.45, 0.7, Z(0.03), 0.16, 0.1], [-0.45, 0.7, Z(0.03), 0.16, 0.1]], null, [[0.55, 0.65, Z(L - 0.03), 0.12, 0.08], [-0.55, 0.65, Z(L - 0.03), 0.12, 0.08]]);
  const lb = rig.part("lightBar", 0, 1.92, Z(1.3));
  box(lb, 0.9, 0.06, 0.08, 0, 0, 0, ...FL.lamp);
  return flDone(rig, { footprint: DV_BUDGET.dvUtv.footprint, livery: lv });
}

/** Rigid-frame haul truck: high cab deck on the left, a large body with a canopy over the cab, six big tyres. Parts: body, cabDoor, ladder, wheels, lights, beacon. */
export function dvHaulTruck(parent, x, y, z, opts = {}) {
  const lv = flLivery(opts.livery, { colour: 0xf2b21b, fleetName: "SMARTCITI QUARRY", unitNumber: "H-14" });
  const L = 9.4, W = 4.6, Z = (s) => L / 2 - s;
  const rig = flRig(parent, x, y, z, opts, "dvHaulTruck"), S = rig.shell, P = flPaint(lv.colour);
  flSide(S, [[0.4, 1.4], [0.4, 2.6], [1.6, 2.7], [1.6, 3.4], [3.2, 3.4], [3.2, 1.4]], W - 1.2, 0, 0, Z(0), ...P, { bevel: 0.06 });   // hood and front deck
  flSide(S, [[3.2, 1.2], [3.2, 2.0], [9.0, 2.0], [9.0, 1.2]], 2.6, 0, 0, Z(0), ...FL.frame, { bevel: 0.04 });   // frame
  flSide(S, [[1.6, 3.4], [1.6, 5.0], [3.0, 5.0], [3.0, 3.4]], 1.5, 1.2, 0, Z(0), ...P, { bevel: 0.05 });   // cab, left
  flPanel(S, 1.3, 1.1, 1.2, 4.4, Z(1.6) + 0.03, flGlassMat(), "+z", 0.1);
  flPanel(S, 1.2, 0.9, 1.96, 4.4, Z(2.3), flGlassMat(), "+x");
  flBox(S, W - 1.4, 0.06, 1.6, -0.6, 3.42, Z(2.4), flTreadMat());   // deck
  flDoor(rig, "cabDoor", -1, 0.44, 3.5, Z(1.9), 0.9, 1.4, flDoorMat(lv, "L", { window: 0.5, marks: "none" }));
  const body = rig.part("body", 0, 2.1, Z(L - 0.2));
  const bl = 6.2, bw = W - 0.2;
  box(body, bw, 0.2, bl, 0, 0.1, bl / 2, ...FL.steel);
  for (const sx of [1, -1]) box(body, 0.15, 2.2, bl, sx * (bw / 2 - 0.08), 1.1, bl / 2, ...P);
  box(body, bw, 2.2, 0.15, 0, 1.1, bl - 0.08, ...P);
  const canopy = box(body, bw, 0.15, 2.8, 0, 2.5, bl + 1.0, ...P); canopy.rotation.x = 0.15;
  for (const sx of [1, -1]) flPanel(body, 4.4, 1.0, sx * (bw / 2 + 0.005), 1.1, bl / 2, flLiveryMat(lv, "haulSide", { title: lv.fleetName, sub: lv.unitNumber, titleScale: 0.4, titleY: 0.45, stripeY: 0.88 }), sx > 0 ? "+x" : "-x");
  const ladder = rig.part("ladder", 1.8, 1.0, Z(1.0));
  for (const sx of [0.2, -0.2]) flRod(ladder, 0.025, 2.4, sx, 1.2, 0, "y", ...FL.alu);
  for (let i = 0; i < 7; i++) flRod(ladder, 0.02, 0.4, 0, 0.2 + i * 0.35, 0, "x", ...FL.alu);
  rig.set("wheels", [
    flSteerWheel(rig, "wheelFL", 1.9, Z(2.2), 1.15, 0.7, { style: "black", tread: "lug" }),
    flSteerWheel(rig, "wheelFR", -1.9, Z(2.2), 1.15, 0.7, { style: "black", tread: "lug" }),
    flAxle(rig, "axleRear", Z(7.2), 1.15, 3.0, { width: 0.7, dual: true, style: "black", tread: "lug" }),
  ]);
  flLights(rig, [[1.4, 2.2, Z(0.42), 0.3, 0.16], [-1.4, 2.2, Z(0.42), 0.3, 0.16]], null, [[1.5, 1.6, Z(L - 0.02), 0.25, 0.14], [-1.5, 1.6, Z(L - 0.02), 0.25, 0.14]]);
  dvBeacon(rig, 1.2, 5.07, Z(2.4));
  return flDone(rig, { footprint: DV_BUDGET.dvHaulTruck.footprint, livery: lv });
}

// ----------------------------------------------------------- water helpers

/**
 * A parametric hull: `L` × `W`, a fine or bluff bow (`bowK` is how far aft
 * the bow taper starts as a fraction of L), hull height `H`, a deck of
 * tread plate, an optional house (`house: { s0, s1, w, h, glass }`), a mast
 * (`mast: { s, h }`) with navigation lights, a rub rail. Port is +X. Returns
 * the rig with `Z(s)`, `hw` and `deckY` so a builder can add its own gear.
 */
function dvHull(parent, x, y, z, opts, kind, spec) {
  const { L, W, H = 1.0, bowK = 0.3, colour, deckColour = null, house = null, mast = null, bluff = 0.25 } = spec;
  const lv = flLivery(opts.livery, { colour, fleetName: spec.fleetName ?? "SMARTCITI PORT", unitNumber: spec.unit ?? "P-01", accent: spec.accent ?? 0xf0b323 });
  const Z = (s) => L / 2 - s, hw = W / 2;
  const rig = flRig(parent, x, y, z, opts, kind);
  const S = rig.shell;
  const b = bowK * L;
  const plan = (k) => [[k * hw, -L / 2], [k * hw, L / 2 - b], [k * hw * 0.62, L / 2 - b * 0.45], [k * hw * bluff, L / 2 - 0.08], [0, L / 2], [-k * hw * bluff, L / 2 - 0.08], [-k * hw * 0.62, L / 2 - b * 0.45], [-k * hw, L / 2 - b], [-k * hw, -L / 2]];
  const P = flPaint(lv.colour);
  flPlan(S, plan(0.84), H * 0.45, 0, 0, 0, 0x2b3138, { rough: 0.5, metal: 0.4, finish: "painted", bevel: 0.06 });   // below the boot top
  flPlan(S, plan(1.0), H * 0.6, 0, H * 0.42, 0, ...P, { bevel: 0.05 });
  const deckY = H * 1.02;
  if (deckColour) box(S, W - 0.3, 0.03, L - b - 0.6, 0, deckY, Z((b + L - 0.3) / 2), deckColour, { rough: 0.85, finish: "wood" });
  else flBox(S, W - 0.3, 0.03, L - b - 0.6, 0, deckY, Z((b + L - 0.3) / 2), flTreadMat());
  for (const sx of [1, -1]) flRod(S, Math.min(0.08, W * 0.03), L - b - 0.4, sx * (hw + 0.04), H * 0.95, Z((b + L - 0.2) / 2), "z", ...FL.black);   // rub rail
  if (spec.livery !== false) {
    const side = flLiveryMat(lv, `hull:${kind}`, { title: lv.fleetName, sub: lv.unitNumber, titleScale: 0.32, titleY: 0.4, stripeY: 0.8 });
    for (const sx of [1, -1]) flPanel(S, Math.min(4.6, L * 0.5), H * 0.42, sx * (hw + 0.045), H * 0.72, Z(b + (L - b) * 0.45), side, sx > 0 ? "+x" : "-x");
  }
  let houseTop = deckY;
  if (house) {
    const { s0, s1, w, h, glass = true, colour: hc = 0xf0f1ee } = house;
    flSide(S, [[s0, deckY], [s0 - 0.1, deckY + h * 0.55], [s0 + 0.1, deckY + h], [s1, deckY + h], [s1, deckY]], w, house.x ?? 0, 0, Z(0), hc, { rough: 0.4, metal: 0.2, finish: "painted", bevel: 0.04 });
    if (glass) {
      const g = flGlassMat();
      flPanel(S, w * 0.85, h * 0.3, house.x ?? 0, deckY + h * 0.76, Z(s0 - 0.02) + 0.05, g, "+z", 0.35);
      for (const sx of [1, -1]) flPanel(S, (s1 - s0) * 0.7, h * 0.28, (house.x ?? 0) + sx * (w / 2 + 0.005), deckY + h * 0.72, Z((s0 + s1) / 2), g, sx > 0 ? "+x" : "-x");
    }
    houseTop = deckY + h;
    const door = rig.part("houseDoor", (house.x ?? 0) - w / 2 + 0.35, deckY, Z(s1) - 0.02);
    flBox(door, 0.6, h * 0.8, 0.04, 0.3, h * 0.4, 0, flDoorMat(lv, "R", { window: 0.4, marks: "none", body: hc }));
    door.userData.openAngle = -1.4;
  }
  const nav = rig.part("navLights"); nav.userData.fleetBake = false;
  const ms = mast?.s ?? (house ? (house.s0 + house.s1) / 2 : L * 0.45), mh = mast?.h ?? 1.2;
  if (mast !== false) flRod(S, 0.035, mh, 0, houseTop + mh / 2, Z(ms), "y", ...FL.alu);
  const ly = house ? houseTop - 0.05 : deckY + 0.5;
  const port = rig.part("portLight", (house ? (house.w / 2) : hw * 0.6), ly, Z(house ? house.s0 + 0.3 : L * 0.35), nav);
  box(port, 0.07, 0.07, 0.09, 0, 0, 0, ...FL.red);
  const stbd = rig.part("starboardLight", -(house ? (house.w / 2) : hw * 0.6), ly, Z(house ? house.s0 + 0.3 : L * 0.35), nav);
  box(stbd, 0.07, 0.07, 0.09, 0, 0, 0, ...FL.green);
  const mhl = rig.part("mastheadLight", 0, houseTop + (mast === false ? 0.3 : mh), Z(ms), nav);
  cyl(mhl, 0.045, 0.045, 0.09, 0, 0, 0, ...FL.lamp, { seg: 10 });
  rig.set("lights", nav);
  return { rig, S, Z, hw, deckY, houseTop, lv, L, W, H, P };
}

function dvOutboard(rig, name, x, y, z, size = 1, host = undefined) {
  const ob = rig.part(name, x, y, z, host);
  box(ob, 0.4 * size, 0.55 * size, 0.5 * size, 0, 0.45 * size, -0.22 * size, 0x1b1e22, { rough: 0.45, metal: 0.3, finish: "painted" });
  box(ob, 0.12 * size, 0.85 * size, 0.18 * size, 0, -0.2 * size, -0.2 * size, 0x1b1e22, { rough: 0.45, metal: 0.3 });
  return ob;
}
function dvBitts(rig, S, spots, r = 0.09, h = 0.5) {
  const list = [];
  for (const [name, x, y, z] of spots) { const b = rig.part(name, x, y, z); cyl(b, r, r, h, 0, h / 2, 0, ...FL.steel, { seg: 10 }); cyl(b, r * 1.3, r * 1.3, 0.06, 0, h, 0, ...FL.steel, { seg: 10 }); list.push(b); }
  rig.set("bitts", list);
  void S;
  return list;
}
function dvFenders(S, hw, y, spots, r = 0.12, len = 0.6, colour = 0x1b1e22) {
  for (const sx of [1, -1]) for (const s of spots) cyl(S, r, r, len, sx * (hw + r), y, s, colour, { seg: 10, rough: 0.8, finish: "rubber" });
}
function dvRails(S, hw, y, z0, len, h = 0.9, pitch = 1.2) {
  for (const sx of [1, -1]) {
    flRod(S, 0.022, len, sx * (hw - 0.1), y + h, z0, "z", ...FL.alu);
    for (let s = -len / 2; s <= len / 2; s += pitch) flRod(S, 0.02, h, sx * (hw - 0.1), y + h / 2, z0 + s, "y", ...FL.alu);
  }
}

// ---------------------------------------------------------- water builders

/** Pilot boat: deep-vee hull, forward wheelhouse, boarding platform aft, heavy fendering. Parts: houseDoor, navLights, portLight, starboardLight, mastheadLight, boardingPlatform, bitts, radar. */
export function dvPilotBoat(parent, x, y, z, opts = {}) {
  const h = dvHull(parent, x, y, z, opts, "dvPilotBoat", { L: 16, W: 5.0, H: 1.6, bowK: 0.34, colour: 0xe0592a, fleetName: "SMARTCITI PILOTS", unit: "PB-2", accent: 0xf4f5f3, house: { s0: 4.5, s1: 8.5, w: 3.4, h: 2.3 }, mast: { s: 7.5, h: 2.4 } });
  const { rig, S, Z, hw, deckY } = h;
  dvFenders(S, hw, deckY - 0.3, [Z(6), Z(8), Z(10), Z(12)], 0.18, 1.2, 0x2a2e33);
  dvRails(S, hw, deckY, Z(12.2), 6.4);
  const bp = rig.part("boardingPlatform", 0, deckY + 0.3, Z(5.2));
  flBox(bp, 3.0, 0.06, 1.6, 0, 0, 0, flTreadMat());
  for (const sx of [1, -1]) flRod(bp, 0.02, 0.9, sx * 1.4, 0.45, -0.7, "y", ...FL.alu);
  const radar = rig.part("radar", 0, h.houseTop + 0.6, Z(7.0));
  box(radar, 1.0, 0.12, 0.2, 0, 0, 0, ...FL.alu);
  dvBitts(rig, S, [["bittBow", 0, deckY, Z(1.2)], ["bittSternP", hw - 0.5, deckY, Z(15.2)], ["bittSternS", -(hw - 0.5), deckY, Z(15.2)]]);
  return flDone(rig, { footprint: DV_BUDGET.dvPilotBoat.footprint, livery: h.lv, draft: 0.9 });
}

/** Harbour tug: bluff bow with a bow fender, tall house with an upper wheelhouse, towing winch aft, big tyres as fenders. Parts: houseDoor, navLights, portLight, starboardLight, mastheadLight, towWinch, towHook, bitts, stack. */
export function dvTug(parent, x, y, z, opts = {}) {
  const h = dvHull(parent, x, y, z, opts, "dvTug", { L: 24, W: 9.0, H: 2.6, bowK: 0.28, bluff: 0.55, colour: 0x14171a, fleetName: "SMARTCITI TOWING", unit: "TG-5", accent: 0xf0b323, house: { s0: 7, s1: 14, w: 6.0, h: 2.6, colour: 0xf0f1ee }, mast: { s: 11, h: 3.0 } });
  const { rig, S, Z, hw, deckY, houseTop } = h;
  flSide(S, [[8.5, houseTop], [8.4, houseTop + 1.6], [8.7, houseTop + 2.5], [12.5, houseTop + 2.5], [12.5, houseTop]], 3.6, 0, 0, Z(0), 0xf0f1ee, { rough: 0.4, metal: 0.2, finish: "painted", bevel: 0.04 });   // upper wheelhouse
  const g = flGlassMat();
  flPanel(S, 3.0, 0.7, 0, houseTop + 2.0, Z(8.5) + 0.05, g, "+z", 0.3);
  for (const sx of [1, -1]) flPanel(S, 3.2, 0.7, sx * 1.805, houseTop + 2.0, Z(10.5), g, sx > 0 ? "+x" : "-x");
  const stack = rig.part("stack", 0, houseTop, Z(13.2));
  cyl(stack, 0.5, 0.6, 2.2, 0, 1.1, 0, ...FL.frame, { seg: 14 });
  cyl(S, 1.2, 1.2, hw * 1.6, 0, deckY - 0.9, Z(0.4), 0x1b1e22, { seg: 14, rough: 0.9, finish: "rubber" }).rotation.z = Math.PI / 2;   // bow fender
  dvFenders(S, hw, deckY - 0.8, [Z(7), Z(10), Z(13), Z(16), Z(19)], 0.45, 0.35, 0x1b1e22);
  dvRails(S, hw, deckY, Z(18.5), 10.5, 1.0, 1.5);
  const winch = rig.part("towWinch", 0, deckY, Z(17.0));
  cyl(winch, 0.7, 0.7, 1.8, 0, 0.75, 0, ...FL.steel, { seg: 14 }).rotation.z = Math.PI / 2;
  box(winch, 2.4, 0.4, 0.4, 0, 0.2, 0, ...FL.frame);
  const hook = rig.part("towHook", 0, deckY + 0.4, Z(19.5));
  box(hook, 0.3, 0.5, 0.3, 0, 0.25, 0, ...FL.steel);
  dvBitts(rig, S, [["bittBowP", hw - 1.0, deckY, Z(3.5)], ["bittBowS", -(hw - 1.0), deckY, Z(3.5)], ["bittSternP", hw - 1.0, deckY, Z(22.5)], ["bittSternS", -(hw - 1.0), deckY, Z(22.5)]], 0.16, 0.8);
  return flDone(rig, { footprint: DV_BUDGET.dvTug.footprint, livery: h.lv, draft: 2.2 });
}

/** River push boat with two deck barges faced up ahead: square bow with push knees, a raised pilothouse, the barges as fleet.js's own deckBarge. Parts: houseDoor, navLights, portLight, starboardLight, mastheadLight, pushKnees, barges, bitts. */
export function dvPushBoat(parent, x, y, z, opts = {}) {
  const BL = 16, TL = 18, total = TL + BL * 2;
  const root = flRig(parent, x, y, z, opts, "dvPushBoat").root;
  root.name = "dvPushBoat";
  const boatZ = -total / 2 + TL / 2;
  const h = dvHull(root, 0, 0, boatZ, {}, "dvPushBoatHull", { L: TL, W: 7.5, H: 2.2, bowK: 0.06, bluff: 0.98, colour: 0xf2f2ee, fleetName: "SMARTCITI RIVER", unit: "PB-9", accent: 0x2c5a7a, house: { s0: 5, s1: 12, w: 5.0, h: 2.4 }, mast: { s: 9, h: 2.6 } });
  const { rig, S, Z, hw, deckY, houseTop } = h;
  flSide(S, [[7, houseTop], [6.9, houseTop + 1.7], [7.2, houseTop + 2.6], [10.5, houseTop + 2.6], [10.5, houseTop]], 3.4, 0, 0, Z(0), 0xf0f1ee, { rough: 0.4, metal: 0.2, finish: "painted", bevel: 0.04 });   // pilothouse
  flPanel(S, 2.8, 0.7, 0, houseTop + 2.1, Z(7) + 0.05, flGlassMat(), "+z", 0.3);
  const knees = rig.part("pushKnees", 0, deckY, Z(0.3));
  for (const sx of [1, -1]) box(knees, 0.5, 2.6, 0.6, sx * 2.4, 1.3, 0, ...FL.frame);
  for (const sx of [1, -1]) cyl(S, 0.5, 0.5, 2.0, sx * 0.9, deckY + 1.0, Z(TL - 1.5), ...FL.frame, { seg: 12 });   // stacks
  dvRails(S, hw, deckY, Z(9), 15, 1.0, 1.6);
  dvBitts(rig, S, [["bittBowP", hw - 0.6, deckY, Z(1.5)], ["bittBowS", -(hw - 0.6), deckY, Z(1.5)], ["bittSternP", hw - 0.6, deckY, Z(TL - 1.2)], ["bittSternS", -(hw - 0.6), deckY, Z(TL - 1.2)]], 0.14, 0.7);
  const barges = [];
  for (let i = 0; i < 2; i++) barges.push(FLEET_BUILDERS.deckBarge(root, 0, 0.2, boatZ + TL / 2 + BL / 2 + i * BL, { livery: { colour: 0x3d4f5c, fleetName: "SMARTCITI RIVER", unitNumber: `B-${i + 1}` } }));
  rig.set("barges", barges);
  const out = flDone(rig, { footprint: DV_BUDGET.dvPushBoat.footprint, livery: h.lv, draft: 2.0 });
  root.userData.parts = out.userData.parts; root.userData.kind = "dvPushBoat"; root.userData.footprint = DV_BUDGET.dvPushBoat.footprint; root.userData.livery = h.lv; root.userData.draft = 2.0;
  return root;
}

/** Offshore crew boat: long low hull, forward house, open aft cargo deck with a cargo rail, twin stacks. Parts: houseDoor, navLights, portLight, starboardLight, mastheadLight, cargoRail, bowBitts, bitts. */
export function dvCrewBoat(parent, x, y, z, opts = {}) {
  const h = dvHull(parent, x, y, z, opts, "dvCrewBoat", { L: 30, W: 7.0, H: 2.4, bowK: 0.3, colour: 0xf2f2ee, fleetName: "SMARTCITI OFFSHORE", unit: "CB-3", accent: 0x2c5a7a, house: { s0: 5, s1: 13, w: 5.6, h: 2.6 }, mast: { s: 8, h: 3.2 } });
  const { rig, S, Z, hw, deckY, houseTop } = h;
  for (const sx of [1, -1]) cyl(S, 0.35, 0.4, 1.6, sx * 1.6, houseTop + 0.8, Z(12.4), ...FL.frame, { seg: 12 });
  const rail = rig.part("cargoRail", 0, deckY, Z(21.5));
  for (const sx of [1, -1]) { flRod(rail, 0.04, 16, sx * (hw - 0.25), 1.1, 0, "z", ...FL.steel); for (let s = -8; s <= 8; s += 2) flRod(rail, 0.035, 1.1, sx * (hw - 0.25), 0.55, s, "y", ...FL.steel); }
  dvFenders(S, hw, deckY - 0.5, [Z(15), Z(19), Z(23), Z(27)], 0.25, 0.8, 0x2a2e33);
  dvBitts(rig, S, [["bittBowP", hw - 0.8, deckY, Z(2.5)], ["bittBowS", -(hw - 0.8), deckY, Z(2.5)], ["bittSternP", hw - 0.7, deckY, Z(29)], ["bittSternS", -(hw - 0.7), deckY, Z(29)]], 0.14, 0.7);
  rig.set("bowBitts", [rig.parts.bittBowP, rig.parts.bittBowS]);
  return flDone(rig, { footprint: DV_BUDGET.dvCrewBoat.footprint, livery: h.lv, draft: 1.6 });
}

/** Airboat: flat aluminium hull, raised seats, caged propeller and rudders aft. Parts: fanCage, rudders, seats, navLights, portLight, starboardLight, mastheadLight, pushPole. */
export function dvAirboat(parent, x, y, z, opts = {}) {
  const h = dvHull(parent, x, y, z, opts, "dvAirboat", { L: 5.6, W: 2.4, H: 0.55, bowK: 0.22, bluff: 0.8, colour: 0xc8ced4, fleetName: "SMARTCITI MARSH", unit: "AB-1", accent: 0x2e8b57, mast: false, livery: false });
  const { rig, S, Z, hw, deckY } = h;
  const seats = rig.part("seats", 0, deckY, Z(2.6));
  for (const [sx, sy, sz] of [[0.45, 0.6, -0.2], [-0.45, 0.6, -0.2], [0, 1.1, 0.7]]) { box(seats, 0.5, 0.08, 0.5, sx, sy, sz, ...FL.black); box(seats, 0.5, 0.5, 0.08, sx, sy + 0.3, sz - 0.25, ...FL.black); for (const k of [0.2, -0.2]) flStrut(seats, [sx + k, 0, sz], [sx + k, sy, sz], 0.02, ...FL.alu); }
  const cage = rig.part("fanCage", 0, deckY + 1.3, Z(4.7));
  const ring = cyl(cage, 1.1, 1.1, 0.35, 0, 0, 0, ...FL.alu, { seg: 20 }); ring.rotation.x = Math.PI / 2;
  cyl(cage, 0.15, 0.15, 0.4, 0, 0, 0, ...FL.black, { seg: 10 }).rotation.x = Math.PI / 2;
  for (let i = 0; i < 3; i++) { const b = box(cage, 0.2, 1.9, 0.04, 0, 0, 0.05, 0x2a2e33, { rough: 0.6 }); b.rotation.z = i * Math.PI / 3; }
  for (const sx of [1, -1]) flStrut(cage, [sx * 0.8, -1.3, -0.2], [sx * 0.5, -0.9, 0], 0.03, ...FL.alu);
  box(S, 0.9, 0.9, 0.9, 0, deckY + 0.45, Z(4.0), 0x3a4148, { rough: 0.5, metal: 0.4 });   // engine
  const rud = rig.part("rudders", 0, deckY + 1.3, Z(5.4));
  for (const sx of [0.5, -0.5]) box(rud, 0.04, 1.8, 0.5, sx, 0, 0, ...FL.alu);
  const pole = rig.part("pushPole", hw - 0.15, deckY + 0.1, Z(2.8));
  flRod(pole, 0.02, 3.6, 0, 0, 0, "z", 0xc9a04a, { rough: 0.6 });
  void hw;
  return flDone(rig, { footprint: DV_BUDGET.dvAirboat.footprint, livery: h.lv, draft: 0.2 });
}

/** Fireboat: work hull with a forward house, a raised monitor tower, deck monitors and a pump manifold. Parts: houseDoor, navLights, portLight, starboardLight, mastheadLight, monitors, towerMonitor, manifold, lightBar, bitts. */
export function dvFireboat(parent, x, y, z, opts = {}) {
  const h = dvHull(parent, x, y, z, opts, "dvFireboat", { L: 20, W: 6.2, H: 2.0, bowK: 0.3, colour: 0xd8322c, fleetName: "SMARTCITI FIRE", unit: "FB-1", accent: 0xf4f5f3, house: { s0: 5.5, s1: 11, w: 4.4, h: 2.4 }, mast: { s: 9, h: 2.2 } });
  const { rig, S, Z, hw, deckY, houseTop } = h;
  const mons = rig.part("monitors");
  for (const [sx, s] of [[1.2, 2.5], [-1.2, 2.5], [0, 15]]) { const m = rig.part(`monitor${sx > 0 ? "P" : sx < 0 ? "S" : "A"}`, sx, deckY, Z(s), mons); cyl(m, 0.12, 0.14, 0.5, 0, 0.25, 0, ...FL.steel, { seg: 10 }); const n = cyl(m, 0.06, 0.1, 0.8, 0, 0.6, 0.3, ...FL.chrome, { seg: 10 }); n.rotation.x = Math.PI / 2 - 0.5; }
  const tower = rig.part("towerMonitor", 0, houseTop, Z(8));
  flRod(tower, 0.14, 1.6, 0, 0.8, 0, "y", ...FL.steel);
  const tn = cyl(tower, 0.07, 0.11, 1.0, 0, 1.75, 0.35, ...FL.chrome, { seg: 10 }); tn.rotation.x = Math.PI / 2 - 0.6;
  const man = rig.part("manifold", -(hw - 0.9), deckY, Z(13));
  box(man, 0.6, 0.9, 2.4, 0, 0.45, 0, ...FL.frame);
  for (let i = 0; i < 4; i++) cyl(man, 0.11, 0.11, 0.3, -0.4, 0.55, -0.9 + i * 0.6, ...FL.red, { seg: 10 }).rotation.z = Math.PI / 2;
  flLightBar(rig, "lightBar", 0, houseTop + 0.1, Z(6.2), 1.6);
  dvRails(S, hw, deckY, Z(15.5), 8, 1.0, 1.4);
  dvBitts(rig, S, [["bittBow", 0, deckY, Z(1.2)], ["bittSternP", hw - 0.6, deckY, Z(19.2)], ["bittSternS", -(hw - 0.6), deckY, Z(19.2)]], 0.13, 0.6);
  return flDone(rig, { footprint: DV_BUDGET.dvFireboat.footprint, livery: h.lv, draft: 1.4 });
}

/** Harbour patrol boat: centre-console hull with a T-top, twin outboards, a light bar. Parts: console, tTop, outboards, lightBar, navLights, portLight, starboardLight, mastheadLight, bitts. */
export function dvPatrolBoat(parent, x, y, z, opts = {}) {
  const h = dvHull(parent, x, y, z, opts, "dvPatrolBoat", { L: 8.5, W: 2.8, H: 0.9, bowK: 0.34, colour: 0x2c5a7a, fleetName: "SMARTCITI HARBOR", unit: "HP-4", accent: 0xf4f5f3, mast: false });
  const { rig, S, Z, hw, deckY } = h;
  const con = rig.part("console", 0, deckY, Z(4.2));
  box(con, 1.2, 1.0, 1.1, 0, 0.5, 0, 0xe9ecee, { rough: 0.45, metal: 0.15, finish: "painted" });
  flPanel(con, 1.1, 0.4, 0, 1.15, 0.45, flGlassMat(), "+z", 0.5);
  const top = rig.part("tTop", 0, deckY, Z(4.2));
  for (const [sx, sz] of [[0.55, 0.4], [-0.55, 0.4], [0.55, -0.6], [-0.55, -0.6]]) flRod(top, 0.03, 2.1, sx, 1.05, sz, "y", ...FL.alu);
  box(top, 1.9, 0.06, 2.0, 0, 2.12, -0.1, 0x2a2e33, { rough: 0.7 });
  const lb = rig.part("lightBar", 0, deckY + 2.2, Z(3.9));
  box(lb, 1.2, 0.08, 0.1, 0, 0, 0, ...FL.blue);
  const obs = rig.part("outboards", 0, deckY - 0.2, Z(8.5) - 0.05);
  obs.userData.fleetBake = false;
  for (const sx of [0.45, -0.45]) dvOutboard(rig, `outboard${sx > 0 ? "P" : "S"}`, sx, 0, 0, 1, obs);
  dvRails(S, hw, deckY, Z(2.2), 3.2, 0.7, 1.0);
  dvBitts(rig, S, [["bittBow", 0, deckY, Z(0.5)], ["bittSternP", hw - 0.3, deckY, Z(8.0)], ["bittSternS", -(hw - 0.3), deckY, Z(8.0)]], 0.06, 0.2);
  return flDone(rig, { footprint: DV_BUDGET.dvPatrolBoat.footprint, livery: h.lv, draft: 0.5 });
}

/** Passenger ferry: double-ended hull, long enclosed cabin, upper deck with rails, wheelhouses at both ends. Parts: houseDoor, gangwayDoors, navLights, portLight, starboardLight, mastheadLight, upperDeck, bitts. */
export function dvFerry(parent, x, y, z, opts = {}) {
  const h = dvHull(parent, x, y, z, opts, "dvFerry", { L: 34, W: 10, H: 2.8, bowK: 0.18, bluff: 0.6, colour: 0xf2f2ee, fleetName: "SMARTCITI FERRY", unit: "FY-2", accent: 0x1c8f6f, house: { s0: 5, s1: 29, w: 8.4, h: 2.8, colour: 0xf4f5f3 }, mast: { s: 17, h: 3.6 } });
  const { rig, S, Z, hw, deckY, houseTop } = h;
  const g = flGlassMat();
  for (const sx of [1, -1]) for (let s = 7; s < 28; s += 3) flPanel(S, 2.2, 1.1, sx * 4.205, deckY + 1.8, Z(s), g, sx > 0 ? "+x" : "-x");
  const upper = rig.part("upperDeck", 0, houseTop, Z(17));
  flBox(upper, 8.0, 0.05, 20, 0, 0.02, 0, flTreadMat());
  for (const sx of [1, -1]) { flRod(upper, 0.03, 20, sx * 3.9, 1.05, 0, "z", ...FL.alu); for (let s = -10; s <= 10; s += 2.5) flRod(upper, 0.025, 1.05, sx * 3.9, 0.52, s, "y", ...FL.alu); }
  for (const s of [3.0, 31.0]) { flSide(S, [[s - 1.2, houseTop], [s - 1.3, houseTop + 1.3], [s - 1.0, houseTop + 2.2], [s + 1.2, houseTop + 2.2], [s + 1.2, houseTop]], 3.2, 0, 0, Z(0), 0xf4f5f3, { rough: 0.4, metal: 0.2, finish: "painted", bevel: 0.04 }); }
  const doors = rig.part("gangwayDoors");
  for (const sx of [1, -1]) { const d = rig.part(`gangway${sx > 0 ? "P" : "S"}`, sx * 4.2, deckY, Z(17), doors); flBox(d, 0.05, 2.0, 1.6, 0, 1.0, 0, flDoorMat(h.lv, sx > 0 ? "L" : "R", { window: 0.5, marks: "none", body: 0xf4f5f3 })); d.userData.slide = 1.6; }
  dvFenders(S, hw, deckY - 1.0, [Z(6), Z(12), Z(17), Z(22), Z(28)], 0.4, 0.5, 0x1b1e22);
  dvBitts(rig, S, [["bittBowP", hw - 1.2, deckY, Z(2.0)], ["bittBowS", -(hw - 1.2), deckY, Z(2.0)], ["bittSternP", hw - 1.2, deckY, Z(32)], ["bittSternS", -(hw - 1.2), deckY, Z(32)]], 0.16, 0.8);
  return flDone(rig, { footprint: DV_BUDGET.dvFerry.footprint, livery: h.lv, draft: 1.8 });
}

/** Shrimp trawler: forward house, tall outriggers with net booms, a winch and a working deck aft. Parts: houseDoor, navLights, portLight, starboardLight, mastheadLight, outriggers, winch, nets, bitts. */
export function dvTrawler(parent, x, y, z, opts = {}) {
  const h = dvHull(parent, x, y, z, opts, "dvTrawler", { L: 22, W: 6.4, H: 2.2, bowK: 0.32, colour: 0xf2f2ee, fleetName: "GULF STAR", unit: " ", accent: 0x2c5a7a, house: { s0: 5, s1: 10.5, w: 4.6, h: 2.5, colour: 0xf4f5f3 }, mast: { s: 8, h: 4.0 } });
  const { rig, S, Z, hw, deckY, houseTop } = h;
  const out = rig.part("outriggers", 0, houseTop, Z(11));
  const mastH = 6.0;
  flRod(out, 0.12, mastH, 0, mastH / 2, 0, "y", ...FL.steel);
  for (const sx of [1, -1]) { const b = flStrut(out, [0, mastH - 0.4, 0], [sx * 7.5, mastH - 3.0, 0.5], 0.06, ...FL.steel); void b; flStrut(out, [sx * 7.5, mastH - 3.0, 0.5], [sx * (hw - 0.3), -houseTop + deckY + 0.3, 3.5], 0.015, 0xb0b4b8, { rough: 0.5 }); }
  const winch = rig.part("winch", 0, deckY, Z(13));
  cyl(winch, 0.45, 0.45, 2.2, 0, 0.5, 0, ...FL.steel, { seg: 12 }).rotation.z = Math.PI / 2;
  const nets = rig.part("nets", 0, deckY, Z(16));
  for (const sx of [1.2, -1.2]) ball(nets, 0.7, sx, 0.6, 0, 0x5b7c4a, { rough: 0.95, seg: 10, seg2: 8 });
  dvRails(S, hw, deckY, Z(16.5), 10, 0.9, 1.4);
  dvBitts(rig, S, [["bittBow", 0, deckY, Z(1.3)], ["bittSternP", hw - 0.6, deckY, Z(21)], ["bittSternS", -(hw - 0.6), deckY, Z(21)]], 0.13, 0.6);
  return flDone(rig, { footprint: DV_BUDGET.dvTrawler.footprint, livery: h.lv, draft: 1.5 });
}

/** Oyster lugger: low broad wooden hull, small aft house, dredge and culling table forward. Parts: houseDoor, navLights, portLight, starboardLight, mastheadLight, dredge, cullingTable, dredgeBoom, bitts. */
export function dvLugger(parent, x, y, z, opts = {}) {
  const h = dvHull(parent, x, y, z, opts, "dvLugger", { L: 14, W: 5.2, H: 1.5, bowK: 0.3, bluff: 0.5, colour: 0xf2f2ee, fleetName: "BAYOU PEARL", unit: " ", accent: 0x2e8b57, deckColour: 0x9c7a4c, house: { s0: 9.5, s1: 13, w: 3.6, h: 2.1, colour: 0xf4f5f3 }, mast: { s: 11.2, h: 1.6 } });
  const { rig, S, Z, hw, deckY } = h;
  const table = rig.part("cullingTable", 0, deckY, Z(5.5));
  flBox(table, 3.2, 0.06, 1.6, 0, 0.9, 0, flTreadMat());
  for (const [sx, sz] of [[1.5, 0.7], [-1.5, 0.7], [1.5, -0.7], [-1.5, -0.7]]) flRod(table, 0.03, 0.9, sx, 0.45, sz, "y", ...FL.steel);
  const boom = rig.part("dredgeBoom", 0, deckY, Z(8.5));
  flRod(boom, 0.07, 3.2, 0, 1.6, 0, "y", ...FL.steel);
  flStrut(boom, [0, 3.0, 0], [hw - 0.6, 1.8, -1.5], 0.05, ...FL.steel);
  const dredge = rig.part("dredge", hw - 0.7, deckY + 0.2, Z(7.0));   // stowed inboard on the rail
  box(dredge, 1.0, 0.5, 0.9, 0, 0.25, 0, ...FL.steel);
  for (let i = 0; i < 6; i++) box(dredge, 0.06, 0.25, 0.9, -0.45 + i * 0.18, -0.1, 0, ...FL.steel);
  dvRails(S, hw, deckY, Z(5), 7, 0.6, 1.2);
  dvBitts(rig, S, [["bittBow", 0, deckY, Z(0.9)], ["bittSternP", hw - 0.5, deckY, Z(13.4)], ["bittSternS", -(hw - 0.5), deckY, Z(13.4)]], 0.1, 0.5);
  return flDone(rig, { footprint: DV_BUDGET.dvLugger.footprint, livery: h.lv, draft: 1.2 });
}

/** Bay shrimper with skimmer frames: small forward-house hull, two hinged skimmer frames outboard, a sorting box. Parts: houseDoor, navLights, portLight, starboardLight, mastheadLight, skimmerFrames, sortingBox, bitts. */
export function dvBayShrimper(parent, x, y, z, opts = {}) {
  const h = dvHull(parent, x, y, z, opts, "dvBayShrimper", { L: 12, W: 4.2, H: 1.3, bowK: 0.3, colour: 0xf2f2ee, fleetName: "MISS DELTA", unit: " ", accent: 0xe0592a, house: { s0: 3.5, s1: 7, w: 3.0, h: 2.2 }, mast: { s: 5.2, h: 2.0 } });
  const { rig, S, Z, hw, deckY } = h;
  const frames = rig.part("skimmerFrames", 0, deckY + 0.3, Z(6.5));
  for (const sx of [1, -1]) {
    flStrut(frames, [sx * (hw - 0.2), 0, 0], [sx * (hw + 3.2), 2.4, 0.2], 0.05, ...FL.steel);
    flStrut(frames, [sx * (hw + 3.2), 2.4, 0.2], [sx * (hw + 3.6), -0.6, 1.2], 0.04, ...FL.steel);
    flStrut(frames, [sx * (hw + 3.2), 2.4, 0.2], [sx * (hw + 3.6), -0.6, -0.8], 0.04, ...FL.steel);
    box(frames, 0.06, 2.8, 2.0, sx * (hw + 3.55), 0.8, 0.2, 0x5b7c4a, { rough: 0.95, transparent: true, opacity: 0.6 });
  }
  const sort = rig.part("sortingBox", 0, deckY, Z(9.5));
  box(sort, 2.0, 0.7, 1.2, 0, 0.35, 0, ...FL.alu);
  dvRails(S, hw, deckY, Z(9.5), 4.5, 0.6, 1.1);
  dvBitts(rig, S, [["bittBow", 0, deckY, Z(0.8)], ["bittSternP", hw - 0.4, deckY, Z(11.5)], ["bittSternS", -(hw - 0.4), deckY, Z(11.5)]], 0.08, 0.4);
  return flDone(rig, { footprint: DV_BUDGET.dvBayShrimper.footprint, livery: h.lv, draft: 1.0 });
}

/** Sailing dinghy: small open hull, mast with a mainsail, boom, rudder and tiller, daggerboard. Parts: mast, sail, boom, rudder, tiller, daggerboard, navLights, portLight, starboardLight, mastheadLight. */
export function dvDinghy(parent, x, y, z, opts = {}) {
  const h = dvHull(parent, x, y, z, opts, "dvDinghy", { L: 4.2, W: 1.6, H: 0.5, bowK: 0.4, colour: 0xf4f5f3, fleetName: "SMARTCITI SAILING", unit: " ", accent: 0x2c5a7a, mast: false, livery: false });
  const { rig, S, Z, hw, deckY } = h;
  const mast = rig.part("mast", 0, deckY - 0.3, Z(1.4));
  flRod(mast, 0.035, 6.0, 0, 3.0, 0, "y", ...FL.alu);
  const boom = rig.part("boom", 0, 1.0, 0, mast);
  flRod(boom, 0.03, 2.4, 0, 0, -1.2, "z", ...FL.alu);
  const sail = rig.part("sail", 0, 1.05, -0.05, mast);
  flPanel(sail, 2.2, 4.6, -1.1, 2.3, 0, dvSailMat(), "+x");
  const rud = rig.part("rudder", 0, deckY - 0.5, Z(4.2) - 0.02);
  box(rud, 0.03, 0.9, 0.3, 0, 0, -0.1, 0xf4f5f3, { rough: 0.4 });
  const tiller = rig.part("tiller", 0, 0.5, -0.05, rud);
  flRod(tiller, 0.02, 1.0, 0, 0.05, 0.5, "z", 0xc9a04a, { rough: 0.6 });
  const db = rig.part("daggerboard", 0, deckY - 0.4, Z(2.0));
  box(db, 0.03, 0.7, 0.35, 0, 0, 0, 0xf4f5f3, { rough: 0.4 });
  for (const sx of [1, -1]) box(S, 0.25, 0.05, 2.4, sx * (hw - 0.25), deckY + 0.02, Z(2.4), 0xc9a04a, { rough: 0.6 });   // side benches
  return flDone(rig, { footprint: DV_BUDGET.dvDinghy.footprint, livery: h.lv, draft: 0.5 });
}
let dvSailMaterial = null;
function dvSailMat() {
  if (!dvSailMaterial) { dvSailMaterial = new THREE.MeshStandardMaterial({ color: 0xf4f5f3, roughness: 0.8, metalness: 0, side: THREE.DoubleSide }); dvSailMaterial.userData.ownMaterial = true; }
  return dvSailMaterial;
}

/** Pontoon boat: two aluminium tubes under a fenced deck, a helm console, a canopy. Parts: tubes, fence, console, canopy, outboard, navLights, portLight, starboardLight, mastheadLight. */
export function dvPontoon(parent, x, y, z, opts = {}) {
  const L = 7.0, W = 2.6, Z = (s) => L / 2 - s;
  const lv = flLivery(opts.livery, { colour: 0x2c5a7a, fleetName: "SMARTCITI MARINA", unitNumber: "PT-3", accent: 0xf4f5f3 });
  const rig = flRig(parent, x, y, z, opts, "dvPontoon"), S = rig.shell;
  const tubes = rig.part("tubes", 0, 0.32, 0);
  for (const sx of [0.9, -0.9]) { const t = cyl(tubes, 0.32, 0.32, L - 0.6, sx, 0, 0, ...FL.alu, { seg: 14 }); t.rotation.x = Math.PI / 2; ball(tubes, 0.32, sx, 0, Z(0.3), ...FL.alu, { seg: 12, seg2: 8 }); }
  flBox(S, W, 0.06, L - 0.8, 0, 0.68, Z(L / 2 + 0.2), flTreadMat());
  const fence = rig.part("fence", 0, 0.7, Z(L / 2 + 0.2));
  for (const sx of [1, -1]) { box(fence, 0.04, 0.7, L - 1.6, sx * (W / 2 - 0.02), 0.4, 0, ...flPaint(lv.colour)); flRod(fence, 0.02, L - 1.6, sx * (W / 2 - 0.02), 0.78, 0, "z", ...FL.alu); }
  box(fence, W - 0.6, 0.7, 0.04, 0, 0.4, -(L - 1.6) / 2, ...flPaint(lv.colour));
  for (const sx of [1, -1]) flPanel(fence, 3.0, 0.4, sx * (W / 2 + 0.005), 0.42, 0.3, flLiveryMat(lv, "pontoonSide", { title: lv.fleetName, sub: lv.unitNumber, titleScale: 0.34, titleY: 0.45, stripeY: 0.85 }), sx > 0 ? "+x" : "-x");
  const con = rig.part("console", -0.6, 0.72, Z(3.6));
  box(con, 0.7, 0.9, 0.6, 0, 0.45, 0, 0xe9ecee, { rough: 0.45, metal: 0.15, finish: "painted" });
  flPanel(con, 0.65, 0.3, 0, 1.0, 0.25, flGlassMat(), "+z", 0.5);
  const canopy = rig.part("canopy", 0, 0.72, Z(3.4));
  for (const [sx, sz] of [[1.0, 1.4], [-1.0, 1.4], [1.0, -1.4], [-1.0, -1.4]]) flRod(canopy, 0.025, 2.0, sx, 1.0, sz, "y", ...FL.alu);
  box(canopy, 2.3, 0.05, 3.0, 0, 2.02, 0, 0x2c5a7a, { rough: 0.85 });
  for (const sx of [0.7, -0.7]) { box(S, 0.5, 0.1, 1.2, sx, 0.98, Z(1.6), ...FL.black); box(S, 0.5, 0.5, 0.1, sx, 1.25, Z(2.2), ...FL.black); }
  dvOutboard(rig, "outboard", 0, 0.45, Z(L) - 0.05, 1);
  const nav = rig.part("navLights"); nav.userData.fleetBake = false;
  const port = rig.part("portLight", W / 2 - 0.1, 1.5, Z(0.8), nav); box(port, 0.06, 0.06, 0.08, 0, 0, 0, ...FL.red);
  const stbd = rig.part("starboardLight", -(W / 2 - 0.1), 1.5, Z(0.8), nav); box(stbd, 0.06, 0.06, 0.08, 0, 0, 0, ...FL.green);
  const mh = rig.part("mastheadLight", 0, 2.75, Z(3.4), nav); cyl(mh, 0.04, 0.04, 0.08, 0, 0, 0, ...FL.lamp, { seg: 10 });
  rig.set("lights", nav);
  return flDone(rig, { footprint: DV_BUDGET.dvPontoon.footprint, livery: lv, draft: 0.4 });
}

/** Sea kayak: a long narrow hull with a cockpit, deck lines and a paddle across the deck. Parts: cockpit, paddle, deckLines, hatches. */
export function dvKayak(parent, x, y, z, opts = {}) {
  const L = 5.0, W = 0.6, Z = (s) => L / 2 - s;
  const lv = flLivery(opts.livery, { colour: 0xe0592a, fleetName: "", unitNumber: "" });
  const rig = flRig(parent, x, y, z, opts, "dvKayak"), S = rig.shell;
  const hw = W / 2;
  const plan = [[0, L / 2], [hw * 0.5, L / 2 - 0.8], [hw, L / 2 - 2.0], [hw, -L / 2 + 1.6], [hw * 0.45, -L / 2 + 0.4], [0, -L / 2], [-hw * 0.45, -L / 2 + 0.4], [-hw, -L / 2 + 1.6], [-hw, L / 2 - 2.0], [-hw * 0.5, L / 2 - 0.8]];
  flPlan(S, plan, 0.22, 0, 0, 0, ...flPaint(lv.colour), { bevel: 0.05 });
  flPlan(S, plan.map(([a, b]) => [a * 0.92, b * 0.98]), 0.1, 0, 0.21, 0, 0xf4f5f3, { rough: 0.5, finish: "painted", bevel: 0.04 });
  const cp = rig.part("cockpit", 0, 0.3, Z(2.6));
  const rim = cyl(cp, 0.42, 0.42, 0.05, 0, 0, 0, ...FL.black, { seg: 16 }); rim.scale.z = 1.9;
  box(cp, 0.3, 0.08, 0.3, 0, -0.08, -0.3, ...FL.black);   // seat
  const hatches = rig.part("hatches");
  for (const s of [1.0, 4.0]) { const hh = rig.part(`hatch${s < 2 ? "Fore" : "Aft"}`, 0, 0.31, Z(s), hatches); cyl(hh, 0.18, 0.18, 0.04, 0, 0, 0, ...FL.black, { seg: 14 }); }
  const lines = rig.part("deckLines", 0, 0.33, 0);
  for (const sx of [0.22, -0.22]) flRod(lines, 0.006, 1.6, sx, 0, Z(1.2), "z", 0x2a2e33, { rough: 0.6 });
  for (const sx of [0.22, -0.22]) flRod(lines, 0.006, 1.2, sx, 0, Z(4.0), "z", 0x2a2e33, { rough: 0.6 });
  const paddle = rig.part("paddle", 0, 0.36, Z(2.0));
  flRod(paddle, 0.015, 2.2, 0, 0, 0, "x", 0xc9a04a, { rough: 0.6 });
  for (const sx of [1.1, -1.1]) box(paddle, 0.4, 0.02, 0.18, sx, 0, 0, ...flPaint(lv.colour));
  return flDone(rig, { footprint: DV_BUDGET.dvKayak.footprint, livery: lv, draft: 0.15 });
}

/** Research vessel: work hull, midships house, an A-frame aft with a sheave and a CTD rosette, a lab container, a winch. Parts: houseDoor, navLights, portLight, starboardLight, mastheadLight, aFrame, winch, rosette, labContainer, bitts. */
export function dvResearchVessel(parent, x, y, z, opts = {}) {
  const h = dvHull(parent, x, y, z, opts, "dvResearchVessel", { L: 26, W: 8.0, H: 2.6, bowK: 0.3, colour: 0xf2f2ee, fleetName: "SMARTCITI SCIENCE", unit: "RV-1", accent: 0x2c5a7a, house: { s0: 5, s1: 13, w: 6.2, h: 2.8 }, mast: { s: 9, h: 3.6 } });
  const { rig, S, Z, hw, deckY } = h;
  const af = rig.part("aFrame", 0, deckY, Z(24));
  for (const sx of [1, -1]) flStrut(af, [sx * 2.8, 0, -0.8], [sx * 0.6, 5.5, 0.6], 0.14, ...FL.frame);
  box(af, 1.6, 0.3, 0.3, 0, 5.55, 0.6, ...FL.frame);
  cyl(af, 0.3, 0.3, 0.14, 0, 5.3, 0.9, ...FL.steel, { seg: 12 }).rotation.z = Math.PI / 2;
  const winch = rig.part("winch", 0, deckY, Z(17));
  cyl(winch, 0.6, 0.6, 1.8, 0, 0.65, 0, ...FL.steel, { seg: 14 }).rotation.z = Math.PI / 2;
  box(winch, 2.4, 0.4, 0.5, 0, 0.2, 0, ...FL.frame);
  const ros = rig.part("rosette", 0, deckY, Z(21.5));
  for (let i = 0; i < 6; i++) { const a = i * Math.PI / 3; cyl(ros, 0.1, 0.1, 1.1, Math.cos(a) * 0.5, 0.6, Math.sin(a) * 0.5, 0x8a949d, { rough: 0.4, metal: 0.6, seg: 8 }); }
  for (const yy of [0.15, 1.15]) { const r = cyl(ros, 0.62, 0.62, 0.05, 0, yy, 0, ...FL.alu, { seg: 14 }); void r; }
  const lab = rig.part("labContainer", -(hw - 1.6), deckY, Z(15.5));
  box(lab, 2.4, 2.5, 6.0, 0, 1.25, 0, 0x2c5a7a, { rough: 0.55, finish: "painted" });
  dvRails(S, hw, deckY, Z(19), 12, 1.0, 1.5);
  dvBitts(rig, S, [["bittBowP", hw - 0.8, deckY, Z(2.5)], ["bittBowS", -(hw - 0.8), deckY, Z(2.5)], ["bittSternP", hw - 0.8, deckY, Z(25.2)], ["bittSternS", -(hw - 0.8), deckY, Z(25.2)]], 0.14, 0.7);
  return flDone(rig, { footprint: DV_BUDGET.dvResearchVessel.footprint, livery: h.lv, draft: 1.6 });
}

/** Buoy tender: work hull with an aft house, a long open foredeck, a knuckle crane and a buoy on deck. Parts: houseDoor, navLights, portLight, starboardLight, mastheadLight, crane, craneBoom, hook, buoy, bitts. */
export function dvBuoyTender(parent, x, y, z, opts = {}) {
  const h = dvHull(parent, x, y, z, opts, "dvBuoyTender", { L: 20, W: 7.0, H: 2.4, bowK: 0.26, bluff: 0.5, colour: 0x14171a, fleetName: "SMARTCITI AIDS", unit: "BT-6", accent: 0xf0b323, house: { s0: 12.5, s1: 18.5, w: 5.4, h: 2.6, colour: 0xf4f5f3 }, mast: { s: 15.5, h: 2.8 } });
  const { rig, S, Z, hw, deckY } = h;
  const crane = rig.part("crane", -(hw - 1.4), deckY, Z(11.5));
  cyl(crane, 0.5, 0.6, 1.6, 0, 0.8, 0, ...FL.frame, { seg: 14 });
  const boom = rig.part("craneBoom", 0, 1.6, 0, crane);
  const b1 = box(boom, 0.4, 0.45, 5.5, 0, 1.4, 2.4, ...flPaint(0xf0b323)); b1.rotation.x = -0.55;
  const b2 = box(boom, 0.32, 0.36, 4.0, 0, 3.6, 5.6, ...flPaint(0xf0b323)); b2.rotation.x = 0.35;
  const hook = rig.part("hook", 0, 2.5, 7.2, boom);
  flRod(hook, 0.01, 1.6, 0, -0.8, 0, "y", 0xb0b4b8, { rough: 0.5 });
  box(hook, 0.2, 0.3, 0.12, 0, -1.7, 0, ...FL.steel);
  const buoy = rig.part("buoy", 1.2, deckY, Z(6.5));
  cyl(buoy, 1.1, 1.1, 1.6, 0, 0.8, 0, ...flPaint(0x2e8b57), { seg: 16 });
  cyl(buoy, 0.5, 0.9, 1.4, 0, 2.3, 0, ...flPaint(0x2e8b57), { seg: 14 });
  flRod(buoy, 0.08, 1.8, 0, 3.9, 0, "y", ...FL.steel);
  dvRails(S, hw, deckY, Z(6.5), 10, 1.0, 1.5);
  dvBitts(rig, S, [["bittBowP", hw - 0.8, deckY, Z(1.6)], ["bittBowS", -(hw - 0.8), deckY, Z(1.6)], ["bittSternP", hw - 0.8, deckY, Z(19.4)], ["bittSternS", -(hw - 0.8), deckY, Z(19.4)]], 0.14, 0.7);
  return flDone(rig, { footprint: DV_BUDGET.dvBuoyTender.footprint, livery: h.lv, draft: 1.5 });
}

/** Lift boat: a barge-like hull with three jack-up legs (raised), a forward house, a deck crane. Parts: houseDoor, navLights, portLight, starboardLight, mastheadLight, legs [legP, legS, legA], jackHouses, crane, craneBoom, bitts. */
export function dvLiftBoat(parent, x, y, z, opts = {}) {
  const h = dvHull(parent, x, y, z, opts, "dvLiftBoat", { L: 30, W: 12, H: 2.8, bowK: 0.15, bluff: 0.9, colour: 0xf2b21b, fleetName: "SMARTCITI OFFSHORE", unit: "LB-2", accent: 0x14171a, house: { s0: 3, s1: 11, w: 9.0, h: 5.4, colour: 0xf4f5f3 }, mast: { s: 7, h: 3.0 } });
  const { rig, S, Z, hw, deckY } = h;
  const legs = [], houses = rig.part("jackHouses");
  for (const [name, sx, s] of [["legP", hw - 1.8, 4], ["legS", -(hw - 1.8), 4], ["legA", 0, 27]]) {
    const jh = rig.part(`jack${name}`, sx, deckY, Z(s), houses);
    box(jh, 3.2, 4.0, 3.2, 0, 2.0, 0, ...flPaint(0xf4f5f3));
    const leg = rig.part(name, sx, deckY, Z(s));
    cyl(leg, 0.9, 0.9, 26, 0, 13 + 1.5, 0, ...FL.frame, { seg: 16 });
    cyl(leg, 2.2, 2.2, 0.6, 0, 1.6, 0, ...FL.steel, { seg: 16 });   // pad, raised to the hull
    legs.push(leg);
  }
  rig.set("legs", legs);
  const crane = rig.part("crane", -(hw - 3.0), deckY, Z(13.5));
  cyl(crane, 0.8, 0.9, 2.4, 0, 1.2, 0, ...FL.frame, { seg: 14 });
  const boom = rig.part("craneBoom", 0, 2.4, 0, crane);
  const b1 = box(boom, 0.6, 0.7, 14, 0, 3.6, 6.2, ...flPaint(0xf2b21b)); b1.rotation.x = -0.55;
  dvRails(S, hw, deckY, Z(20), 16, 1.1, 2.0);
  dvBitts(rig, S, [["bittBowP", hw - 0.8, deckY, Z(1.2)], ["bittBowS", -(hw - 0.8), deckY, Z(1.2)], ["bittSternP", hw - 0.8, deckY, Z(29.2)], ["bittSternS", -(hw - 0.8), deckY, Z(29.2)]], 0.16, 0.8);
  return flDone(rig, { footprint: DV_BUDGET.dvLiftBoat.footprint, livery: h.lv, draft: 1.8 });
}

// ------------------------------------------------------------------ budget

/** Declared mesh count (after mergeStatic), footprint [w, h, l] and named parts per builder here — measured by `node tools/check_fleet.mjs --measure`, then declared. */
export const DV_BUDGET = {
  dvFlatbedTruck: { build: "dvFlatbedTruck", meshes: 19, footprint: [3.02, 3.05, 9.37], parts: ["doorL", "doorR", "mirrorL", "mirrorR", "wheels", "lights", "headacheRack", "winches", "beacon"], note: "flatbed straight truck, stake pockets, headache rack, winches" },
  dvWaterTruck: { build: "dvWaterTruck", meshes: 24, footprint: [3.02, 3.53, 9.41], parts: ["doorL", "doorR", "mirrorL", "mirrorR", "wheels", "lights", "sprayBar", "cannon", "fillHatch", "beacon"], note: "water truck with rear spray bar and cannon" },
  dvMixerTruck: { build: "dvMixerTruck", meshes: 23, footprint: [3.02, 4.13, 9.57], parts: ["doorL", "doorR", "mirrorL", "mirrorR", "wheels", "lights", "drum", "hopper", "chute", "waterTank", "ladder"], note: "rear-discharge concrete mixer" },
  dvSweeper: { build: "dvSweeper", meshes: 19, footprint: [3.2, 3.1, 6.44], parts: ["doorL", "doorR", "wheels", "lights", "brooms", "broomL", "broomR", "pickupHead", "hopper", "beacon"], note: "street sweeper, two gutter brooms" },
  dvWrecker: { build: "dvWrecker", meshes: 24, footprint: [3.02, 3.15, 8.6], parts: ["doorL", "doorR", "mirrorL", "mirrorR", "wheels", "lights", "boom", "wheelLift", "winch", "lightBar", "workLights"], note: "wrecker with wheel lift and boom winch" },
  dvDiggerDerrick: { build: "dvDiggerDerrick", meshes: 25, footprint: [4.18, 6.61, 10.17], parts: ["doorL", "doorR", "mirrorL", "mirrorR", "wheels", "lights", "turret", "boom", "boomUpper", "auger", "poleClaw", "outriggers", "compartments", "beacon"], note: "digger derrick line truck" },
  dvLadderTruck: { build: "dvLadderTruck", meshes: 27, footprint: [4.1, 3.82, 12.57], parts: ["doorL", "doorR", "doorCrewL", "doorCrewR", "mirrorL", "mirrorR", "wheels", "lights", "turntable", "ladder", "ladderFly", "compartments", "outriggers", "warningLights"], note: "aerial ladder truck, ladder stowed" },
  dvStreetcar: { build: "dvStreetcar", meshes: 14, footprint: [2.52, 6.27, 14.02], parts: ["doors", "doorFront", "doorRear", "bogies", "bogieF", "bogieR", "trolleyPole", "destinationSign", "lights"], note: "streetcar on two bogies, trolley pole" },
  dvRailSwitcher: { build: "dvRailSwitcher", meshes: 17, footprint: [3, 4.2, 14.4], parts: ["trucks", "truckF", "truckR", "couplers", "couplerF", "couplerR", "bell", "horn", "lights", "headlights", "markerLights", "tailLights"], note: "end-cab yard switcher" },
  dvStraddleCarrier: { build: "dvStraddleCarrier", meshes: 30, footprint: [3.4, 6.66, 5.2], parts: ["legs", "spreader", "cab", "battery", "wheels", "lights", "beacon"], note: "battery-electric straddle carrier, spreader slung between four legs (CLEANPORTS)" },
  dvReachTruck: { build: "dvReachTruck", meshes: 16, footprint: [1.2, 2.65, 3.39], parts: ["mast", "innerMast", "reach", "carriage", "forks", "overheadGuard", "controls", "wheels", "lights", "beacon"], note: "stand-up narrow-aisle reach truck" },
  dvTelehandler: { build: "dvTelehandler", meshes: 16, footprint: [2.86, 3.34, 9.05], parts: ["boom", "boomTele", "carriage", "forks", "door", "stabilisers", "wheels", "lights", "beacon"], note: "telehandler, boom stowed" },
  dvMower: { build: "dvMower", meshes: 13, footprint: [1.6, 1.99, 2.2], parts: ["deck", "blades", "seat", "rops", "wheels", "lights"], note: "ride-on mower with a rollover bar" },
  dvUtv: { build: "dvUtv", meshes: 14, footprint: [1.64, 1.95, 3.09], parts: ["cage", "bed", "seats", "wheels", "lights", "lightBar"], note: "side-by-side utility terrain vehicle" },
  dvHaulTruck: { build: "dvHaulTruck", meshes: 15, footprint: [4.5, 5.14, 9.01], parts: ["body", "cabDoor", "ladder", "wheels", "lights", "beacon"], note: "rigid-frame quarry haul truck" },
  dvPilotBoat: { build: "dvPilotBoat", meshes: 19, footprint: [5.72, 6.38, 16], parts: ["houseDoor", "navLights", "portLight", "starboardLight", "mastheadLight", "boardingPlatform", "bitts", "radar"], note: "pilot boat, boarding platform aft" },
  dvTug: { build: "dvTug", meshes: 22, footprint: [10.8, 8.3, 24.8], parts: ["houseDoor", "navLights", "portLight", "starboardLight", "mastheadLight", "towWinch", "towHook", "bitts", "stack"], note: "harbour tug, towing winch aft" },
  dvPushBoat: { build: "dvPushBoat", meshes: 44, footprint: [7.74, 7.29, 50], parts: ["houseDoor", "navLights", "portLight", "starboardLight", "mastheadLight", "pushKnees", "barges", "bitts"], note: "river push boat faced up to two deck barges" },
  dvCrewBoat: { build: "dvCrewBoat", meshes: 19, footprint: [8, 8.29, 30], parts: ["houseDoor", "navLights", "portLight", "starboardLight", "mastheadLight", "cargoRail", "bowBitts", "bitts"], note: "offshore crew boat, open aft deck" },
  dvAirboat: { build: "dvAirboat", meshes: 15, footprint: [2.62, 2.96, 5.65], parts: ["fanCage", "rudders", "seats", "navLights", "portLight", "starboardLight", "mastheadLight", "pushPole"], note: "airboat with caged propeller" },
  dvFireboat: { build: "dvFireboat", meshes: 28, footprint: [6.44, 6.69, 20], parts: ["houseDoor", "navLights", "portLight", "starboardLight", "mastheadLight", "monitors", "towerMonitor", "manifold", "lightBar", "bitts"], note: "fireboat with deck and tower monitors" },
  dvPatrolBoat: { build: "dvPatrolBoat", meshes: 21, footprint: [3.04, 3.16, 9.02], parts: ["console", "tTop", "outboards", "lightBar", "navLights", "portLight", "starboardLight", "mastheadLight", "bitts"], note: "centre-console harbour patrol boat" },
  dvFerry: { build: "dvFerry", meshes: 21, footprint: [11.6, 9.3, 34], parts: ["houseDoor", "gangwayDoors", "navLights", "portLight", "starboardLight", "mastheadLight", "upperDeck", "bitts"], note: "double-ended passenger ferry" },
  dvTrawler: { build: "dvTrawler", meshes: 19, footprint: [15.05, 10.74, 22], parts: ["houseDoor", "navLights", "portLight", "starboardLight", "mastheadLight", "outriggers", "winch", "nets", "bitts"], note: "shrimp trawler, outriggers raised" },
  dvLugger: { build: "dvLugger", meshes: 19, footprint: [5.44, 5.28, 14], parts: ["houseDoor", "navLights", "portLight", "starboardLight", "mastheadLight", "dredge", "cullingTable", "dredgeBoom", "bitts"], note: "oyster lugger with dredge and culling table" },
  dvBayShrimper: { build: "dvBayShrimper", meshes: 18, footprint: [11.5, 5.57, 12], parts: ["houseDoor", "navLights", "portLight", "starboardLight", "mastheadLight", "skimmerFrames", "sortingBox", "bitts"], note: "bay shrimper with skimmer frames" },
  dvDinghy: { build: "dvDinghy", belowGround: true, meshes: 14, footprint: [1.99, 6.65, 4.47], parts: ["mast", "sail", "boom", "rudder", "tiller", "daggerboard", "navLights", "portLight", "starboardLight", "mastheadLight"], note: "sailing dinghy, one sail" },
  dvPontoon: { build: "dvPontoon", belowGround: true, meshes: 15, footprint: [2.61, 2.97, 7.54], parts: ["tubes", "fence", "console", "canopy", "outboard", "navLights", "portLight", "starboardLight", "mastheadLight"], note: "pontoon boat with a canopy" },
  dvKayak: { build: "dvKayak", meshes: 8, footprint: [2.6, 0.38, 5], parts: ["cockpit", "paddle", "deckLines", "hatches"], note: "sea kayak with paddle" },
  dvResearchVessel: { build: "dvResearchVessel", meshes: 23, footprint: [8.24, 9.1, 26], parts: ["houseDoor", "navLights", "portLight", "starboardLight", "mastheadLight", "aFrame", "winch", "rosette", "labContainer", "bitts"], note: "research vessel with an A-frame and rosette" },
  dvBuoyTender: { build: "dvBuoyTender", meshes: 22, footprint: [7.24, 8.5, 20], parts: ["houseDoor", "navLights", "portLight", "starboardLight", "mastheadLight", "crane", "craneBoom", "hook", "buoy", "bitts"], note: "buoy tender with a knuckle crane" },
  dvLiftBoat: { build: "dvLiftBoat", meshes: 27, footprint: [12.8, 30.36, 30], parts: ["houseDoor", "navLights", "portLight", "starboardLight", "mastheadLight", "legs", "legP", "legS", "legA", "jackHouses", "crane", "craneBoom", "bitts"], note: "three-leg lift boat, legs raised" },
};

/** The builders by the name DV_BUDGET's `build` field uses. */
export const DV_BUILDERS = {
  dvFlatbedTruck, dvWaterTruck, dvMixerTruck, dvSweeper, dvWrecker, dvDiggerDerrick, dvLadderTruck, dvStreetcar, dvRailSwitcher, dvReachTruck, dvStraddleCarrier, dvTelehandler, dvMower, dvUtv, dvHaulTruck,
  dvPilotBoat, dvTug, dvPushBoat, dvCrewBoat, dvAirboat, dvFireboat, dvPatrolBoat, dvFerry, dvTrawler, dvLugger, dvBayShrimper, dvDinghy, dvPontoon, dvKayak, dvResearchVessel, dvBuoyTender, dvLiftBoat,
};

// ---------------------------------------------------------------- dispatch

const DV_KITS = { fleet: [FLEET_BUILDERS, FLEET_BUDGET], equipment: [EQUIPMENT_BUILDERS, EQUIPMENT_BUDGET], drivables: [DV_BUILDERS, DV_BUDGET] };

/** The budget entry (meshes, footprint, parts) a registry entry renders under. */
export function dvBudgetFor(entry) {
  const [, table] = DV_KITS[entry.kit.module] ?? [];
  if (!table) return null;
  const key = Object.keys(table).find((k) => table[k].build === entry.kit.build && JSON.stringify(table[k].opts ?? {}) === JSON.stringify(dvBudgetOpts(entry)));
  return table[key ?? entry.kit.build] ?? null;
}
// A livery never changes a budget row; the structural options (cab, trailer kind, service-cart kind) do.
function dvBudgetOpts(entry) { const { livery, ...rest } = entry.kit.opts ?? {}; void livery; return rest; }

/**
 * Build a registry entry (or its id) at (x, y, z): the fleet, equipment or
 * Motor Pool builder it names, with its kit options and any `opts` on top.
 * A watercraft comes back with `userData.draft`, so a world floats it at
 * `y = waterY - draft`. An articulated tractor-trailer is re-hung for
 * driving (fleet.js's flArticulate).
 */
export function dvBuild(parent, entryOrId, x, y, z, opts = {}) {
  const entry = typeof entryOrId === "string" ? dvById(entryOrId) : entryOrId;
  if (!entry) throw new Error(`drivables: unknown entry ${entryOrId}`);
  const [builders] = DV_KITS[entry.kit.module] ?? [];
  const fn = builders?.[entry.kit.build];
  if (typeof fn !== "function") throw new Error(`drivables: ${entry.id} names no builder ${entry.kit.module}.${entry.kit.build}`);
  const g = fn(parent, x, y, z, { ...(entry.kit.opts ?? {}), ...opts });
  g.userData.drivable = entry.id;
  if (entry.articulated) flArticulate(g);
  return g;
}

/** Every registry entry's builder resolves — what the board and the checker both ask before rendering. */
export function dvUnresolved() {
  return DV_DRIVABLES.filter((e) => typeof (DV_KITS[e.kit.module]?.[0] ?? {})[e.kit.build] !== "function").map((e) => e.id);
}

void THREE; void flGrilleMat;
