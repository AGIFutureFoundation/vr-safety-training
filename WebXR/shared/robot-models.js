import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import { box, cyl, ball, torus, lathe, hose, ownMaterial } from "./kit.js";
import { FL, flRig, flDone, flRod, flStrut } from "./fleet.js";

// Shared robot models: detailed, articulated, generic robots for the robot-training stations.
//
// Same contract as shared/fleet.js and shared/equipment.js: `(parent, x, y, z, opts)`, metres, front toward +Z,
// footprint centred, y = 0 the ground, a baked static shell and named parts in `userData.parts`. Every joint is its
// own nested part at its real pivot, so `parts.j2.rotation.x` raises the upper arm and carries the forearm, wrist and
// tool with it. RB_BUDGET below declares each builder's mesh count, footprint and parts; tools/check_fleet.mjs holds
// every builder to it and tools/check_robot_models.mjs proves the kinematics and the speed governor.
//
// Generic on purpose: no manufacturer's name, badge, colour scheme or trade dress, no payload, reach or speed rating.
// Proportions are typical of the class (a floor-mounted six-axis arm, a bench cobot, a warehouse mobile robot, a
// legged inspection robot, a Cartesian gantry). The ratings live in the manufacturer's manual and the cell's risk
// assessment, which every station names instead of quoting.
//
// The speed governor (RB_GOVERNOR) is the one the worker-assist episodes run (tools/gen_ros_assist.mjs,
// exports/ros-assist/index.json): a protective stop inside 0.5 m, 0.25 m/s inside 1.5 m, zero speed while an e-stop
// is held. Stations use rbArmPlayer() so a simulated robot slows and stops by the same rule the data records.

const RB_WHITE = 0xe6e9ec;
const RB_GREY = 0x8c949b;
const RB_DARK = 0x2b2f34;
const RB_YELLOW = 0xf0b323;
const RB_ORANGE = 0xe4622a;
const RB_LED = 0x3fd0ff;

/** The worker-assist speed governor, in metres and metres per second. */
export const RB_GOVERNOR = Object.freeze({ protectiveStopM: 0.5, reducedZoneM: 1.5, reducedSpeedMps: 0.25 });

/** The zone a person at `distM` from the robot stands in: "stop", "reduced" or "normal" (an e-stop is always "stop"). */
export function rbZone(distM, estop = false, gov = RB_GOVERNOR) {
  if (estop || !(distM > gov.protectiveStopM)) return "stop";
  return distM <= gov.reducedZoneM ? "reduced" : "normal";
}

/** The tool speed the governor allows: zero in the stop zone or under e-stop, capped in the reduced zone. Pure. */
export function rbSpeedLimit(distM, { estop = false, nominal = 1.0 } = {}, gov = RB_GOVERNOR) {
  const z = rbZone(distM, estop, gov);
  if (z === "stop") return 0;
  return z === "reduced" ? Math.min(nominal, gov.reducedSpeedMps) : nominal;
}

// ------------------------------------------------------------- kinematics

/**
 * The joint chains, shared by the builders and the forward kinematics so the model and the maths cannot drift:
 * each link is the next joint's pivot in the previous joint's frame (metres, at scale 1) and the axis it turns about.
 * j1 sits on `base`, the tool centre point is `tcp` in the last joint's frame. Home (all zeros) is the upper arm
 * upright and the forearm level, pointing +Z.
 */
export const RB_CHAINS = Object.freeze({
  arm6: {
    base: [0, 0.36, 0],
    links: [
      { name: "j1", at: [0, 0, 0], axis: "y" },          // base yaw
      { name: "j2", at: [0, 0.3, 0.12], axis: "x" },     // shoulder pitch
      { name: "j3", at: [0, 0.78, 0], axis: "x" },       // elbow pitch
      { name: "j4", at: [0, 0.12, 0.2], axis: "z" },     // forearm roll
      { name: "j5", at: [0, 0, 0.56], axis: "x" },       // wrist pitch
      { name: "j6", at: [0, 0, 0.11], axis: "z" },       // flange roll
    ],
    tcp: [0, 0, 0.22],
    limits: [[-2.97, 2.97], [-1.4, 1.9], [-2.4, 1.2], [-3.3, 3.3], [-2.1, 2.1], [-6.3, 6.3]],
  },
  cobot6: {
    base: [0, 0.09, 0],
    links: [
      { name: "j1", at: [0, 0, 0], axis: "y" },
      { name: "j2", at: [0, 0.1, 0], axis: "x" },
      { name: "j3", at: [0, 0.42, 0], axis: "x" },
      { name: "j4", at: [0, 0, 0.39], axis: "x" },
      { name: "j5", at: [0, 0.06, 0.04], axis: "y" },
      { name: "j6", at: [0, 0, 0.08], axis: "z" },
    ],
    tcp: [0, 0, 0.16],
    limits: [[-6.3, 6.3], [-2.2, 2.2], [-2.6, 2.6], [-3.1, 3.1], [-6.3, 6.3], [-6.3, 6.3]],
  },
});

function rbMat4(axis, a, t) {
  const c = Math.cos(a), s = Math.sin(a);
  const R = axis === "x" ? [[1, 0, 0], [0, c, -s], [0, s, c]]
    : axis === "y" ? [[c, 0, s], [0, 1, 0], [-s, 0, c]]
    : [[c, -s, 0], [s, c, 0], [0, 0, 1]];
  return [[...R[0], t[0]], [...R[1], t[1]], [...R[2], t[2]], [0, 0, 0, 1]];
}
function rbMul(A, B) {
  const C = [[0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]];
  for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) for (let k = 0; k < 4; k++) C[i][j] += A[i][k] * B[k][j];
  return C;
}

/**
 * Forward kinematics, pure: the tool centre point (and each joint's pivot) in the robot's base frame (the floor under
 * j1; a builder centres its footprint by shifting that frame, so add the rig's offset for the root's frame) for joint angles
 * `q` (radians), at scale `k`. Matches the built model exactly because both read RB_CHAINS.
 */
export function rbFk(kind, q = [], k = 1) {
  const ch = RB_CHAINS[kind];
  if (!ch) throw new Error(`rbFk: no chain "${kind}"`);
  let T = rbMat4("y", 0, ch.base.map((v) => v * k));
  const pivots = [];
  ch.links.forEach((l, i) => {
    T = rbMul(T, rbMat4(l.axis, q[i] ?? 0, l.at.map((v) => v * k)));
    pivots.push([T[0][3], T[1][3], T[2][3]]);
  });
  const tcp = rbMul(T, rbMat4("y", 0, ch.tcp.map((v) => v * k)));
  return { tcp: [tcp[0][3], tcp[1][3], tcp[2][3]], pivots };
}

/** Clamp a pose to the chain's joint limits. Pure. */
export function rbClamp(kind, q) {
  return RB_CHAINS[kind].limits.map(([lo, hi], i) => Math.min(hi, Math.max(lo, q[i] ?? 0)));
}

/** Set a built arm's joints to `q` (clamped to its limits). */
export function rbPose(model, q) {
  const P = model.userData.parts, kind = model.userData.chain;
  const qq = rbClamp(kind, q);
  RB_CHAINS[kind].links.forEach((l, i) => { const j = P[l.name]; if (j) j.rotation[l.axis] = qq[i]; });
  model.userData.q = qq;
  return qq;
}

/**
 * A joint-space path player under the governor. `path` is a list of poses; `tick(dt, { distM, estop, nominal })`
 * advances the arm along it so the tool centre point never moves faster than rbSpeedLimit() allows, loops at the
 * end, and returns { q, speed, zone, tcp }. Works headless (no model) for the checker; pass a built arm to drive it.
 */
export function rbArmPlayer(kind, path, { model = null, k = 1, samples = 48 } = {}) {
  // Each segment carries an arc-length table of the tool's travel, so the player advances by distance along the
  // tool's real path, not by joint-space fraction: tool speed then stays at the commanded speed through the whole
  // segment instead of averaging out over it.
  const segs = [];
  for (let i = 0; i < path.length; i++) {
    const a = rbClamp(kind, path[i]), b = rbClamp(kind, path[(i + 1) % path.length]);
    const cum = [0];
    let prev = rbFk(kind, a, k).tcp;
    for (let s = 1; s <= samples; s++) {
      const p = rbFk(kind, a.map((v, j) => v + (b[j] - v) * (s / samples)), k).tcp;
      cum.push(cum[s - 1] + Math.hypot(p[0] - prev[0], p[1] - prev[1], p[2] - prev[2])); prev = p;
    }
    segs.push({ a, b, cum, len: Math.max(cum[samples], 1e-4) });
  }
  let seg = 0, dist = 0;
  const uAt = (sg, d) => {
    const c = sg.cum;
    let lo = 0, hi = c.length - 1;
    while (hi - lo > 1) { const mid = (lo + hi) >> 1; if (c[mid] <= d) lo = mid; else hi = mid; }
    const span = c[hi] - c[lo];
    return (lo + (span > 0 ? (d - c[lo]) / span : 0)) / (c.length - 1);
  };
  const pose = () => { const sg = segs[seg], u = uAt(sg, dist); return sg.a.map((v, j) => v + (sg.b[j] - v) * u); };
  if (model) rbPose(model, pose());
  return {
    get q() { return pose(); },
    tick(dt, { distM = Infinity, estop = false, nominal = 0.6 } = {}) {
      const speed = rbSpeedLimit(distM, { estop, nominal });
      let travel = speed * dt;
      while (travel > 0) {
        const left = segs[seg].len - dist;
        if (travel < left) { dist += travel; travel = 0; }
        else { travel -= left; seg = (seg + 1) % segs.length; dist = 0; }
      }
      const q = pose();
      if (model) rbPose(model, q);
      return { q, speed, zone: rbZone(distM, estop), tcp: rbFk(kind, q, k).tcp };
    },
  };
}

/**
 * Joint-space paths a station can run: a pick-and-place loop for each chain, posed so the tool works in front of the
 * robot at bench or fixture height. Each is a list of joint angle sets (radians) inside the chain's limits.
 */
export const RB_PATHS = Object.freeze({
  arm6: {
    pickPlace: [[0, 0.3, 0.3, 0, 0.9, 0], [0.95, 0.5, 0.5, 0, 0.6, 0], [0.95, 0.32, 0.62, 0, 0.6, 1.0], [-0.8, 0.45, 0.4, 0, 0.7, 0], [-0.8, 0.26, 0.56, 0, 0.8, -1.0]],
  },
  cobot6: {
    pickPlace: [[0, -0.3, 1.2, -0.9, 0, 0], [0.8, -0.1, 1.4, -1.3, 0.4, 0], [0.8, 0.2, 1.2, -1.4, 0.4, 0.6], [-0.6, -0.1, 1.3, -1.2, -0.3, 0]],
  },
});

/** The distance rbSpeedLimit() reads for a zone a station measured some other way (its own field shapes). */
export function rbDistForZone(zone, gov = RB_GOVERNOR) {
  return zone === "stop" ? 0 : zone === "reduced" ? (gov.protectiveStopM + gov.reducedZoneM) / 2 : Infinity;
}

/**
 * Drive a built arm (industrialArm6, cobotArm6, or a robot cell, cobot bench or palletizer from equipment.js) live
 * under the governor. `tick(dt, { worker, distM, estop, nominal })` measures the floor distance from j1 to `worker`
 * (an Object3D) unless `distM` is given, runs rbArmPlayer, colours the LED rings and field discs by zone, and returns
 * { q, speed, zone, tcp, distM } for a station's readout.
 */
export function rbLive(model, { path = null, nominal = 0.6 } = {}) {
  const kind = model.userData.chain, k = model.userData.k ?? 1;
  const player = rbArmPlayer(kind, path ?? RB_PATHS[kind].pickPlace, { model, k });
  const a = new THREE.Vector3(), b = new THREE.Vector3();
  let lastZone = null;
  return {
    player,
    tick(dt, { worker = null, distM = null, estop = false, nominal: n = nominal } = {}) {
      let d = distM ?? Infinity;
      if (distM == null && worker) {
        model.userData.parts.j1.getWorldPosition(a); worker.getWorldPosition(b);
        d = Math.hypot(a.x - b.x, a.z - b.z);
      }
      const st = player.tick(dt, { distM: d, estop, nominal: n });
      const changed = st.zone !== lastZone;
      if (changed) { rbShowZone(model, st.zone); lastZone = st.zone; }
      return { ...st, distM: d, changed };
    },
  };
}

/** A trotting gait for quadrupedRobot(): diagonal pairs swing together. `speed` 0 stands still. */
export function rbGait(model, t, speed = 1) {
  const L = model.userData.parts.legs ?? [];
  const phase = { fl: 0, rr: 0, fr: Math.PI, rl: Math.PI };
  for (const leg of L) {
    const ph = t * 6 * Math.min(1, speed) + phase[leg.userData.leg];
    const lift = Math.max(0, Math.sin(ph)) * 0.35 * Math.min(1, speed);
    leg.userData.thigh.rotation.x = 0.62 + Math.cos(ph) * 0.22 * Math.min(1, speed);
    leg.userData.knee.rotation.x = -1.24 - lift;
  }
}

/** Show a robot's speed-and-separation field discs (built with `fields: true`) for the zone a person stands in. */
export function rbShowZone(model, zone) {
  const P = model.userData.parts;
  if (P.fieldWarn) P.fieldWarn.visible = zone !== "normal" || P.fieldWarn.userData.always === true;
  if (P.fieldStop) P.fieldStop.visible = zone === "stop" || P.fieldStop.userData.always === true;
  const hex = zone === "stop" ? 0xff2a1e : zone === "reduced" ? 0xffab2e : RB_LED;
  for (const r of P.ledRings ?? []) r.traverse?.((o) => { const e = o.material?.emissive; if (typeof e?.setHex === "function") e.setHex(hex); });
}

// ---------------------------------------------------------------- pieces

const rbS = (o) => ({ rough: 0.4, metal: 0.25, finish: "painted", ...o });

/** A joint motor housing: a short drum on the joint axis with an end cap. */
function rbDrum(p, r, len, axis, colour, k) {
  flRod(p, r * k, len * k, 0, 0, 0, axis, colour, rbS({ seg: 20 }));
  const cap = flRod(p, r * 0.72 * k, (len + 0.02) * k, 0, 0, 0, axis, RB_GREY, { rough: 0.35, metal: 0.5, finish: "brushed", seg: 16 });
  return cap;
}
/** Safety label stripe on a link (yellow/black chevron band). */
function rbStripe(p, w, h, x, y, z, k) {
  box(p, w * k, h * k, 0.004 * k, x * k, y * k, z * k, RB_YELLOW, { rough: 0.5, finish: "painted", cast: false });
}

/**
 * Build a six-axis arm's joints into an existing rig (used by industrialArm6 and by equipment.js's robot cell and
 * palletizer). Returns the joint parts. `at` is j1's mount in the host's frame; `k` scales the whole arm.
 */
export function rbArm6Into(rig, host, { at = [0, 0, 0], k = 1, colour = RB_ORANGE, tool = "gripper", prefix = "" } = {}) {
  const ch = RB_CHAINS.arm6, L = ch.links;
  const P = {};
  const name = (n) => prefix + n;
  // j1: the turret on its slewing bearing, with the J2 motor and the cable dress loop
  P.j1 = rig.part(name("j1"), at[0], at[1], at[2], host);
  lathe(P.j1, [[0.2 * k, 0], [0.21 * k, 0.03 * k], [0.19 * k, 0.16 * k], [0.15 * k, 0.26 * k], [0.001, 0.27 * k]], 0, 0, 0, colour, rbS({ seg: 24 }));
  torus(P.j1, 0.205 * k, 0.012 * k, 0, 0.015 * k, 0, RB_DARK, { rough: 0.5, metal: 0.4, seg: 8, seg2: 28 }).rotation.x = Math.PI / 2;
  for (const sx of [-1, 1]) box(P.j1, 0.05 * k, 0.26 * k, 0.26 * k, sx * 0.14 * k, 0.3 * k, 0.12 * k, colour, rbS());
  flRod(P.j1, 0.075 * k, 0.16 * k, -0.24 * k, 0.3 * k, 0.12 * k, "x", RB_GREY, { rough: 0.35, metal: 0.5, finish: "brushed", seg: 16 });
  box(P.j1, 0.12 * k, 0.1 * k, 0.1 * k, 0, 0.12 * k, -0.2 * k, RB_DARK, { rough: 0.6 });
  // j2: shoulder drum and the upper arm casting, with the balancer ram behind it
  P.j2 = rig.part(name("j2"), ...L[1].at.map((v) => v * k), P.j1);
  rbDrum(P.j2, 0.13, 0.24, "x", colour, k);
  box(P.j2, 0.17 * k, (L[2].at[1] - 0.06) * k, 0.2 * k, 0, (L[2].at[1] / 2) * k, 0, colour, rbS());
  box(P.j2, 0.13 * k, (L[2].at[1] - 0.2) * k, 0.012 * k, 0, (L[2].at[1] / 2) * k, 0.105 * k, RB_WHITE, rbS({ rough: 0.5 }));
  rbStripe(P.j2, 0.13, 0.05, 0, 0.18, 0.112, k);
  flStrut(P.j2, [0, 0.05 * k, -0.17 * k], [0, 0.46 * k, -0.13 * k], 0.04 * k, RB_GREY, { rough: 0.35, metal: 0.5, finish: "brushed" });
  flStrut(P.j2, [0, 0.46 * k, -0.13 * k], [0, 0.62 * k, -0.11 * k], 0.022 * k, ...FL.chrome);
  hose(P.j2, [[0.1 * k, 0.05 * k, -0.06 * k], [0.12 * k, 0.4 * k, -0.08 * k], [0.1 * k, 0.74 * k, -0.04 * k]], 0.018 * k, RB_DARK, { rough: 0.7, steps: 16, seg: 6 });
  // j3: elbow drum and the forearm motor pack behind the elbow
  P.j3 = rig.part(name("j3"), ...L[2].at.map((v) => v * k), P.j2);
  rbDrum(P.j3, 0.11, 0.22, "x", colour, k);
  box(P.j3, 0.18 * k, 0.16 * k, 0.24 * k, 0, 0.12 * k, -0.04 * k, colour, rbS());
  box(P.j3, 0.14 * k, 0.12 * k, 0.12 * k, 0, 0.12 * k, -0.2 * k, RB_GREY, { rough: 0.45, metal: 0.4 });
  // j4: the forearm tube, rolling about its own axis
  P.j4 = rig.part(name("j4"), ...L[3].at.map((v) => v * k), P.j3);
  flRod(P.j4, 0.075 * k, (L[4].at[2] - 0.04) * k, 0, 0, (L[4].at[2] / 2) * k, "z", colour, rbS({ seg: 18, r2: 0.06 * k }));
  rbStripe(P.j4, 0.1, 0.03, 0, 0.0, 0.15, k);
  torus(P.j4, 0.07 * k, 0.008 * k, 0, 0, 0.02 * k, RB_DARK, { rough: 0.5, seg: 6, seg2: 20 });
  // j5: the wrist clevis
  P.j5 = rig.part(name("j5"), ...L[4].at.map((v) => v * k), P.j4);
  for (const sx of [-1, 1]) box(P.j5, 0.025 * k, 0.11 * k, 0.12 * k, sx * 0.055 * k, 0, 0.02 * k, colour, rbS());
  flRod(P.j5, 0.05 * k, 0.1 * k, 0, 0, 0, "x", RB_GREY, { rough: 0.35, metal: 0.5, finish: "brushed", seg: 14 });
  // j6: the tool flange and the tool
  P.j6 = rig.part(name("j6"), ...L[5].at.map((v) => v * k), P.j5);
  flRod(P.j6, 0.045 * k, 0.03 * k, 0, 0, 0.015 * k, "z", ...FL.alu);
  if (tool === "vacuum") {
    box(P.j6, 0.42 * k, 0.04 * k, 0.32 * k, 0, 0, 0.08 * k, RB_DARK, { rough: 0.5, metal: 0.4 });
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) cyl(P.j6, 0.04 * k, 0.03 * k, 0.04 * k, sx * 0.14 * k, 0, (0.08 + sz * 0.1) * k, 0x1c1e21, { rough: 0.8, finish: "rubber", seg: 12 }).rotation.x = Math.PI / 2;
  } else {
    box(P.j6, 0.12 * k, 0.08 * k, 0.08 * k, 0, 0, 0.07 * k, RB_DARK, { rough: 0.5, metal: 0.4 });
    for (const [n, sx] of [["fingerL", -1], ["fingerR", 1]]) {
      P[n] = rig.part(name(n), sx * 0.035 * k, 0, 0.11 * k, P.j6);
      box(P[n], 0.02 * k, 0.05 * k, 0.1 * k, 0, 0, 0.05 * k, ...FL.alu);
    }
  }
  P.tcp = rig.part(name("tcp"), ...ch.tcp.map((v) => v * k), P.j6);
  return P;
}

/** Build a six-axis cobot's joints into an existing rig (used by cobotArm6 and equipment.js's cobot bench). */
export function rbCobotInto(rig, host, { at = [0, 0, 0], k = 1, colour = 0x3a78c9, prefix = "" } = {}) {
  const L = RB_CHAINS.cobot6.links;
  const P = {}, rings = [];
  const name = (n) => prefix + n;
  const module = (p, r, len, axis) => {
    flRod(p, r * k, len * k, 0, 0, 0, axis, RB_WHITE, rbS({ rough: 0.3, seg: 22 }));
    flRod(p, r * 0.94 * k, (len + 0.014) * k, 0, 0, 0, axis, colour, rbS({ rough: 0.35, seg: 22 }));
    const ring = ownMaterial(torus(p, r * 1.0 * k, 0.006 * k, 0, 0, 0, RB_LED, { emissive: RB_LED, ei: 1.0, seg: 6, seg2: 24 }));
    if (axis === "x") ring.rotation.y = Math.PI / 2; else if (axis === "y") ring.rotation.x = Math.PI / 2;
    rings.push(ring);
  };
  P.j1 = rig.part(name("j1"), at[0], at[1], at[2], host);
  module(P.j1, 0.065, 0.1, "y");
  P.j2 = rig.part(name("j2"), ...L[1].at.map((v) => v * k), P.j1);
  module(P.j2, 0.062, 0.12, "x");
  flRod(P.j2, 0.045 * k, (L[2].at[1] - 0.1) * k, 0, (L[2].at[1] / 2) * k, 0, "y", RB_WHITE, rbS({ rough: 0.3, seg: 18 }));
  P.j3 = rig.part(name("j3"), ...L[2].at.map((v) => v * k), P.j2);
  module(P.j3, 0.055, 0.11, "x");
  flRod(P.j3, 0.038 * k, (L[3].at[2] - 0.09) * k, 0, 0, (L[3].at[2] / 2) * k, "z", RB_WHITE, rbS({ rough: 0.3, seg: 18 }));
  P.j4 = rig.part(name("j4"), ...L[3].at.map((v) => v * k), P.j3);
  module(P.j4, 0.045, 0.09, "x");
  P.j5 = rig.part(name("j5"), ...L[4].at.map((v) => v * k), P.j4);
  module(P.j5, 0.045, 0.08, "y");
  P.j6 = rig.part(name("j6"), ...L[5].at.map((v) => v * k), P.j5);
  module(P.j6, 0.04, 0.05, "z");
  // force-torque sensor ring and a two-finger gripper
  flRod(P.j6, 0.04 * k, 0.02 * k, 0, 0, 0.04 * k, "z", RB_DARK, { rough: 0.4, metal: 0.4, seg: 18 });
  box(P.j6, 0.07 * k, 0.05 * k, 0.05 * k, 0, 0, 0.075 * k, RB_DARK, { rough: 0.5, metal: 0.3 });
  for (const [n, sx] of [["fingerL", -1], ["fingerR", 1]]) {
    P[n] = rig.part(name(n), sx * 0.022 * k, 0, 0.1 * k, P.j6);
    box(P[n], 0.012 * k, 0.03 * k, 0.05 * k, 0, 0, 0.025 * k, 0x1c1e21, { rough: 0.8, finish: "rubber" });
  }
  P.tcp = rig.part(name("tcp"), ...RB_CHAINS.cobot6.tcp.map((v) => v * k), P.j6);
  P.ledRings = rings;
  return P;
}

/** The field discs a mobile robot or cell shows: the warning (reduced-speed) and protective-stop rings. */
function rbFields(rig, host, y = 0.006) {
  const warn = rig.part("fieldWarn", 0, y, 0, host);
  cyl(warn, RB_GOVERNOR.reducedZoneM, RB_GOVERNOR.reducedZoneM, 0.004, 0, 0, 0, RB_YELLOW, { rough: 0.7, opacity: 0.22, transparent: true, cast: false, seg: 40 });
  const stop = rig.part("fieldStop", 0, y + 0.004, 0, host);
  cyl(stop, RB_GOVERNOR.protectiveStopM, RB_GOVERNOR.protectiveStopM, 0.004, 0, 0, 0, 0xd8322c, { rough: 0.7, opacity: 0.32, transparent: true, cast: false, seg: 32 });
  return { warn, stop };
}

// ------------------------------------------------------------- builders

/**
 * A floor-mounted six-axis industrial arm on a riser with its anchor plate, cable inlet and stack light. Joints
 * j1-j6 at their real pivots (RB_CHAINS.arm6), a two-finger gripper (fingerL, fingerR) or a vacuum plate
 * (`opts.tool: "vacuum"`), and a tcp marker at the tool centre point. `opts.k` scales the arm. Parts: j1..j6,
 * fingerL, fingerR, tcp, stackLight.
 */
export function industrialArm6(parent, x, y, z, opts = {}) {
  const k = opts.k ?? 1, colour = opts.colour ?? RB_ORANGE;
  const rig = flRig(parent, x, y, z, opts, "industrialArm6", [0, 0, -(opts.tool === "vacuum" ? 0.31 : 0.29) * k]);
  const S = rig.shell;
  box(S, 0.64 * k, 0.04 * k, 0.64 * k, 0, 0.02 * k, 0, RB_GREY, { rough: 0.5, metal: 0.45, finish: "galvanised" });
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) cyl(S, 0.022 * k, 0.022 * k, 0.05 * k, sx * 0.27 * k, 0.05 * k, sz * 0.27 * k, ...FL.steel, { seg: 6 });
  lathe(S, [[0.24 * k, 0.04 * k], [0.22 * k, 0.1 * k], [0.21 * k, 0.36 * k], [0.001, 0.36 * k]], 0, 0, 0, RB_DARK, { rough: 0.5, metal: 0.3, seg: 24 });
  box(S, 0.16 * k, 0.12 * k, 0.1 * k, 0, 0.12 * k, -0.26 * k, RB_DARK, { rough: 0.6 });
  hose(S, [[0, 0.1 * k, -0.31 * k], [0, 0.04 * k, -0.5 * k], [0.2 * k, 0.01 * k, -0.6 * k]], 0.02 * k, 0x1c1e21, { rough: 0.8, steps: 12, seg: 6 });
  const P = rbArm6Into(rig, rig.base, { at: RB_CHAINS.arm6.base.map((v) => v * k), k, colour, tool: opts.tool ?? "gripper" });
  const stack = rig.part("stackLight", 0.24 * k, 0.04 * k, -0.24 * k);
  cyl(stack, 0.012 * k, 0.012 * k, 0.5 * k, 0, 0.25 * k, 0, RB_DARK, { rough: 0.5, seg: 8 });
  [FL.green, FL.amber, FL.red].forEach((m, i) => cyl(stack, 0.04 * k, 0.04 * k, 0.06 * k, 0, (0.53 + i * 0.065) * k, 0, ...m, { seg: 14 }));
  const done = flDone(rig, { footprint: RB_BUDGET.industrialArm6.footprint });
  done.userData.chain = "arm6"; done.userData.k = k; void P;
  return done;
}

/**
 * A six-axis collaborative arm on a round base plate: identical joint modules with status LED rings, slim links, a
 * force-torque sensor at the wrist and a soft two-finger gripper. Joints j1-j6 (RB_CHAINS.cobot6). Parts: j1..j6,
 * fingerL, fingerR, tcp, ledRings (a list; rbShowZone() colours them by zone).
 */
export function cobotArm6(parent, x, y, z, opts = {}) {
  const k = opts.k ?? 1;
  const rig = flRig(parent, x, y, z, opts, "cobotArm6", [0, 0, -0.28 * k]);
  const S = rig.shell;
  cyl(S, 0.1 * k, 0.11 * k, 0.03 * k, 0, 0.015 * k, 0, RB_GREY, { rough: 0.4, metal: 0.45, finish: "brushed", seg: 24 });
  cyl(S, 0.075 * k, 0.08 * k, 0.06 * k, 0, 0.06 * k, 0, RB_WHITE, rbS({ rough: 0.3, seg: 22 }));
  box(S, 0.05 * k, 0.03 * k, 0.04 * k, 0, 0.04 * k, -0.09 * k, RB_DARK, { rough: 0.6 });
  const P = rbCobotInto(rig, rig.base, { at: RB_CHAINS.cobot6.base.map((v) => v * k), k, colour: opts.colour ?? 0x3a78c9 });
  rig.set("ledRings", P.ledRings);
  const done = flDone(rig, { footprint: RB_BUDGET.cobotArm6.footprint });
  done.userData.chain = "cobot6"; done.userData.k = k;
  return done;
}

/**
 * A warehouse autonomous mobile robot: a low chassis with a black bumper, front and rear safety laser scanners,
 * a 3-D camera, two drive wheels and four casters, a status light strip on both sides, e-stop mushrooms on two
 * corners and a lift deck. `opts.fields: true` adds the reduced-speed and protective-stop field discs at the
 * governor's radii. Parts: driveL, driveR, deck, lightStrip, scannerF, scannerR, camera, estopL, estopR
 * (and fieldWarn, fieldStop with fields).
 */
export function mobileRobot(parent, x, y, z, opts = {}) {
  const colour = opts.colour ?? 0x8b929a;
  const rig = flRig(parent, x, y, z, opts, "mobileRobot");
  const S = rig.shell;
  box(S, 0.64, 0.2, 0.86, 0, 0.16, 0, colour, rbS());
  box(S, 0.6, 0.02, 0.82, 0, 0.27, 0, RB_DARK, { rough: 0.6 });
  box(S, 0.68, 0.07, 0.92, 0, 0.08, 0, 0x1c1e21, { rough: 0.85, finish: "rubber" });
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
    cyl(S, 0.035, 0.035, 0.05, sx * 0.25, 0.035, sz * 0.36, 0x1c1e21, { rough: 0.7, seg: 10 });
    box(S, 0.04, 0.04, 0.04, sx * 0.25, 0.065, sz * 0.36, ...FL.steel);
  }
  box(S, 0.3, 0.012, 0.004, 0, 0.18, 0.432, RB_YELLOW, { rough: 0.5, cast: false });
  box(S, 0.3, 0.012, 0.004, 0, 0.18, -0.432, RB_YELLOW, { rough: 0.5, cast: false });
  for (const [n, sx] of [["driveL", -1], ["driveR", 1]]) {
    const w = rig.part(n, sx * 0.31, 0.075, 0);
    flRod(w, 0.075, 0.05, 0, 0, 0, "x", 0x1c1e21, { rough: 0.8, finish: "rubber", seg: 18 });
    flRod(w, 0.045, 0.054, 0, 0, 0, "x", ...FL.alu, { seg: 12 });
  }
  const deck = rig.part("deck", 0, 0.29, 0);
  box(deck, 0.56, 0.03, 0.78, 0, 0, 0, 0x6f7a83, { rough: 0.5, metal: 0.4 });
  for (let i = 0; i < 4; i++) box(deck, 0.5, 0.006, 0.02, 0, 0.018, -0.3 + i * 0.2, 0x53585e, { rough: 0.6, cast: false });
  const strip = rig.part("lightStrip", 0, 0.2, 0);
  for (const sx of [-1, 1]) ownMaterial(box(strip, 0.006, 0.02, 0.7, sx * 0.322, 0, 0, RB_LED, { emissive: RB_LED, ei: 1.1 }));
  for (const [n, sz] of [["scannerF", 1], ["scannerR", -1]]) {
    const sc = rig.part(n, sz * 0.2, 0.13, sz * 0.43);
    box(sc, 0.1, 0.09, 0.08, 0, 0, 0, RB_YELLOW, rbS());
    cyl(sc, 0.035, 0.035, 0.03, 0, 0, sz * 0.04, 0x161d24, { rough: 0.15, seg: 14 }).rotation.x = Math.PI / 2;
  }
  const cam = rig.part("camera", 0, 0.22, 0.435);
  box(cam, 0.14, 0.035, 0.02, 0, 0, 0, RB_DARK, { rough: 0.4 });
  for (const sx of [-0.04, 0.04]) ball(cam, 0.01, sx, 0, 0.012, 0x0c1218, { rough: 0.1, seg: 8 });
  for (const [n, sx, sz] of [["estopL", -0.27, 0.36], ["estopR", 0.27, -0.36]]) {
    const e = rig.part(n, sx, 0.27, sz);
    box(e, 0.06, 0.02, 0.06, 0, 0.01, 0, RB_YELLOW, rbS());
    cyl(e, 0.025, 0.022, 0.03, 0, 0.035, 0, ...FL.red, { seg: 14 });
  }
  if (opts.fields) rbFields(rig, rig.base);
  return flDone(rig, { footprint: opts.fields ? RB_BUDGET["mobileRobot:fields"].footprint : RB_BUDGET.mobileRobot.footprint });
}

/**
 * A legged inspection robot: a body with a sensor head (two cameras and a thermal window), a carry handle, a
 * payload rail and an e-stop on its back, and four three-joint legs (hip abduction, thigh, knee) standing on the
 * ground. rbGait() trots it. Parts: body, head, estop, legs (a list), and per leg hipFL/thighFL/kneeFL etc.
 */
export function quadrupedRobot(parent, x, y, z, opts = {}) {
  const colour = opts.colour ?? RB_YELLOW;
  const rig = flRig(parent, x, y, z, opts, "quadrupedRobot");
  const H = 0.495;
  const body = rig.part("body", 0, H, 0);
  box(body, 0.3, 0.14, 0.66, 0, 0, 0, colour, rbS());
  box(body, 0.26, 0.04, 0.6, 0, 0.09, 0, RB_DARK, { rough: 0.6 });
  box(body, 0.24, 0.02, 0.4, 0, 0.12, -0.04, RB_GREY, { rough: 0.45, metal: 0.5 });
  for (const sx of [-1, 1]) flStrut(body, [sx * 0.08, 0.11, 0.16], [sx * 0.08, 0.18, 0.08], 0.01, ...FL.steel);
  flRod(body, 0.01, 0.16, 0, 0.18, 0.08, "x", ...FL.steel);
  const head = rig.part("head", 0, 0.01, 0.35, body);
  box(head, 0.22, 0.1, 0.08, 0, 0, 0, RB_DARK, { rough: 0.4 });
  for (const sx of [-0.06, 0.06]) ball(head, 0.018, sx, 0.01, 0.042, 0x0c1218, { rough: 0.1, seg: 10 });
  box(head, 0.05, 0.03, 0.01, 0, -0.025, 0.042, 0x6a3a8a, { rough: 0.2, emissive: 0x3a1a5a, ei: 0.5 });
  const estop = rig.part("estop", 0, 0.12, -0.26, body);
  cyl(estop, 0.024, 0.024, 0.02, 0, 0.01, 0, RB_YELLOW, rbS({ seg: 12 }));
  cyl(estop, 0.02, 0.018, 0.025, 0, 0.03, 0, ...FL.red, { seg: 12 });
  const legs = [];
  for (const [id, sx, sz] of [["fl", -1, 1], ["fr", 1, 1], ["rl", -1, -1], ["rr", 1, -1]]) {
    const tag = id.toUpperCase();
    const hip = rig.part(`hip${tag}`, sx * 0.17, -0.02, sz * 0.26, body);
    flRod(hip, 0.045, 0.07, 0, 0, 0, "x", RB_DARK, { rough: 0.45, metal: 0.4, seg: 14 });
    const thigh = rig.part(`thigh${tag}`, sx * 0.045, 0, 0, hip);
    flRod(thigh, 0.04, 0.05, 0, 0, 0, "x", RB_GREY, { rough: 0.4, metal: 0.45, seg: 14 });
    box(thigh, 0.045, 0.27, 0.06, 0, -0.13, 0, colour, rbS());
    const knee = rig.part(`knee${tag}`, 0, -0.27, 0, thigh);
    flRod(knee, 0.03, 0.05, 0, 0, 0, "x", RB_DARK, { rough: 0.45, metal: 0.4, seg: 12 });
    cyl(knee, 0.022, 0.014, 0.27, 0, -0.135, 0, RB_DARK, { rough: 0.5, metal: 0.3, seg: 10 });
    ball(knee, 0.026, 0, -0.275, 0, 0x1c1e21, { rough: 0.85, finish: "rubber", seg: 10 });
    thigh.rotation.x = 0.62; knee.rotation.x = -1.24;
    hip.userData.leg = id; hip.userData.thigh = thigh; hip.userData.knee = knee;
    legs.push(hip);
  }
  rig.set("legs", legs);
  return flDone(rig, { footprint: RB_BUDGET.quadrupedRobot.footprint });
}

/**
 * A three-axis Cartesian gantry over a work area: four posts, two runway beams along Z, a bridge that travels along
 * them, a carriage that travels across the bridge, a vertical Z-axis with a parallel gripper, a cable chain and a
 * beacon. Parts: bridge (move position.z), carriage (move position.x), zAxis (move position.y), gripper, beacon.
 */
export function gantryRobot(parent, x, y, z, opts = {}) {
  const colour = opts.colour ?? RB_ORANGE;
  const W = opts.width ?? 2.4, Lz = opts.length ?? 3.0, Hh = opts.height ?? 2.4;
  const rig = flRig(parent, x, y, z, opts, "gantryRobot");
  const S = rig.shell;
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
    box(S, 0.14, Hh, 0.14, sx * W / 2, Hh / 2, sz * Lz / 2, RB_GREY, { rough: 0.45, metal: 0.45, finish: "painted" });
    box(S, 0.3, 0.02, 0.3, sx * W / 2, 0.01, sz * Lz / 2, ...FL.steel);
  }
  for (const sx of [-1, 1]) {
    box(S, 0.16, 0.18, Lz + 0.14, sx * W / 2, Hh + 0.09, 0, colour, rbS());
    box(S, 0.04, 0.03, Lz, sx * W / 2, Hh + 0.195, 0, ...FL.chrome);
  }
  const bridge = rig.part("bridge", 0, Hh + 0.2, 0);
  box(bridge, W + 0.1, 0.16, 0.2, 0, 0.08, 0, colour, rbS());
  box(bridge, W, 0.03, 0.04, 0, 0.175, 0.04, ...FL.chrome);
  box(bridge, W * 0.8, 0.06, 0.08, 0, 0.2, -0.08, 0x1c1e21, { rough: 0.8 });
  const carriage = rig.part("carriage", 0, 0.04, 0.14, bridge);
  box(carriage, 0.3, 0.26, 0.12, 0, 0, 0, RB_GREY, { rough: 0.45, metal: 0.4 });
  box(carriage, 0.12, 0.12, 0.14, 0, 0.19, -0.02, RB_DARK, { rough: 0.5 });
  const zAxis = rig.part("zAxis", 0, -0.2, 0.09, carriage);
  box(zAxis, 0.1, 1.1, 0.1, 0, -0.35, 0, colour, rbS());
  box(zAxis, 0.03, 1.0, 0.02, 0, -0.35, 0.06, ...FL.chrome);
  const grip = rig.part("gripper", 0, -0.92, 0, zAxis);
  box(grip, 0.22, 0.08, 0.14, 0, 0, 0, RB_DARK, { rough: 0.5, metal: 0.4 });
  for (const sx of [-1, 1]) box(grip, 0.025, 0.16, 0.1, sx * 0.09, -0.11, 0, ...FL.alu);
  const beacon = rig.part("beacon", W / 2, Hh + 0.2, Lz / 2);
  cyl(beacon, 0.05, 0.05, 0.1, 0, 0.05, 0, ...FL.amber, { seg: 14 });
  return flDone(rig, { footprint: RB_BUDGET.gantryRobot.footprint });
}

// ------------------------------------------------------------------ budget

export const RB_BUDGET = {
  industrialArm6: { build: "industrialArm6", meshes: 31, footprint: [0.64, 1.65, 1.82], parts: ["j1", "j2", "j3", "j4", "j5", "j6", "fingerL", "fingerR", "tcp", "stackLight"], note: "floor-mounted six-axis industrial arm with gripper, home pose" },
  "industrialArm6:vacuum": { build: "industrialArm6", opts: { tool: "vacuum" }, meshes: 30, footprint: [0.64, 1.65, 1.85], parts: ["j1", "j2", "j3", "j4", "j5", "j6", "tcp", "stackLight"], note: "six-axis arm with a vacuum plate (palletizing tool)" },
  cobotArm6: { build: "cobotArm6", meshes: 25, footprint: [0.22, 0.72, 0.77], parts: ["j1", "j2", "j3", "j4", "j5", "j6", "fingerL", "fingerR", "tcp", "ledRings"], note: "six-axis collaborative arm with LED joint rings, F/T sensor and soft gripper" },
  mobileRobot: { build: "mobileRobot", meshes: 24, footprint: [0.68, 0.32, 0.97], parts: ["driveL", "driveR", "deck", "lightStrip", "scannerF", "scannerR", "camera", "estopL", "estopR"], note: "warehouse AMR with front/rear safety scanners, 3-D camera, light strip, e-stops and lift deck" },
  "mobileRobot:fields": { build: "mobileRobot", opts: { fields: true }, meshes: 26, footprint: [3, 0.32, 3], parts: ["driveL", "driveR", "deck", "lightStrip", "scannerF", "scannerR", "camera", "estopL", "estopR", "fieldWarn", "fieldStop"], note: "the AMR with its reduced-speed and protective-stop fields at the governor's radii" },
  quadrupedRobot: { build: "quadrupedRobot", meshes: 33, footprint: [0.48, 0.71, 0.87], parts: ["body", "head", "estop", "legs", "hipFL", "thighFL", "kneeFL", "hipRR", "thighRR", "kneeRR"], note: "legged inspection robot, standing, with sensor head and e-stop" },
  gantryRobot: { build: "gantryRobot", meshes: 14, footprint: [2.7, 2.89, 3.3], parts: ["bridge", "carriage", "zAxis", "gripper", "beacon"], note: "three-axis Cartesian gantry over a 2.4 x 3.0 m work area" },
};

/** The builders by the name RB_BUDGET's `build` field uses. */
export const RB_BUILDERS = { industrialArm6, cobotArm6, mobileRobot, quadrupedRobot, gantryRobot };
void THREE;
