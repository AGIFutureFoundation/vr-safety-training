// NEWTON — gravity, crashes and water reactions (console NEWTON, the Packs run,
// tools/briefs/packs-brief.md). A small deterministic physics module: pure (no
// three.js, no DOM), so tools/check_newton.mjs imports it in Node and every
// world's bundle can carry it. Every top-level name is prefixed nw/NW_ (the
// bundler concatenates modules into one scope).
//
// ---------------------------------------------------------------- the seams
//
//   nwWorld({ groundAt, colliders, waterDepthAt, flowAt })
//       -> { addBody(spec), removeBody(body), step(dt), bodies, contacts,
//            groundAt, waterDepthAt, flowAt, boxesNear(x, z, r) }
//     groundAt(x, z) -> metres (the terrain height)
//     colliders: [{ min: [x, y, z], max: [x, y, z], kind }] or a function
//       (x, z, r) -> that array near a point (CITYWORKS' cwColliders shape)
//     waterDepthAt(x, z) -> metres of water over the ground (0 on land)
//       (TERRAFORM's tfWaterDepthAt shape, the parish bound in)
//     flowAt(x, z) -> [vx, vz] m/s (TERRAFORM's tfFlowAt shape)
//   A fixed step (NW_STEP, an accumulator, at most NW_MAX_STEPS a frame),
//   gravity, ground contact, AABB bodies against the boxes swept in sub-steps
//   no longer than a quarter of the body's smallest half-extent (no tunnelling
//   at speed), body-body impulses with restitution, buoyancy and drift in
//   water, and bodies that sleep when still and wake on contact.
//
//   nwAvatarStep(state, input, dt, world) -> state
//     state (nwAvatarState(x, z, world)): { x, y, z, vy, mode, breath, onGround,
//       splash, cue, landed }; y is the feet. input: { vx, vz } the wished
//       horizontal velocity in m/s. Gravity (a drop larger than a step is a
//       fall), walls block (per-axis slide), wading (slower, a splash cue),
//       swimming (held at the surface on a damped spring, slower, a breath
//       meter that is a readiness cue only and refills ashore — never a fail),
//       and carried a little by the flow.
//
//   nwVehicleStep(veh, input, dt, world, profile) -> { state, crash, bumped }
//     MOTORPOOL's dvStepDrive handling (drivables-data.js; the profile's
//     top / accel / turn) with the footprint swept against the boxes and the
//     dynamic bodies. A closing speed at or over NW_CRASH_SPEED against a wall
//     or a heavy body stops the vehicle and reports a crash; under it, a bump.
//
//   nwCrashCard(crash) -> the "after a collision" card or null (under the
//     threshold): secure the scene, check people, call it in — drawn from the
//     catalog station traffic-incident-management. No injury is ever shown.
//
//   nwParishWorld(parish, { tfWaterDepthAt, tfFlowAt, cwColliders })
//     The world over a parish: the seams first when present, else the
//     parish's own npHeightAt / npWaterAt and its building footprints
//     (massing by kind, the site buildings) as boxes.
//
// Every figure here is a game value for a training world, not a measurement.
import { NP_SIZE, NP_CHUNK, NP_CHUNKS_PER_SIDE, NP_WATER_Y, npHeightAt, npWaterAt, npChunkOf, npMassingForChunk, npPrepare } from "./np-parish.js";
import { dvStepDrive } from "./drivables-data.js";

export const NW_G = 9.81;
export const NW_STEP = 1 / 60;
export const NW_MAX_STEPS = 8;
/** The closing speed (m/s, a game value) at or over which a vehicle's contact is a crash, not a bump. */
export const NW_CRASH_SPEED = 6;
/** A body at least this heavy (kg, a game value) stops a vehicle; lighter ones are knocked aside. */
export const NW_HEAVY = 400;
export const NW_AVATAR = {
  radius: 0.35, height: 1.75, stepUp: 0.5, stepDown: 0.6,
  wadeDepth: 0.3, swimDepth: 1.2, swimFloat: 1.3,   // feet below the surface while swimming (the eye rides above it)
  wade: 0.55, swim: 0.4,                            // speed factors
  flowWade: 0.35, flowSwim: 0.6,                    // how much of the flow carries the learner
  breathDrain: 1 / 45, breathFill: 1 / 6, breathCue: 0.35,
};

const nwClamp = (v, lo, hi) => (v < lo ? lo : v > hi ? hi : v);
let nwIds = 0;

// ------------------------------------------------------------------ geometry

/** Do an AABB (centre p, half h) and a box overlap? */
function nwOverlap(p, h, b) {
  return p[0] + h[0] > b.min[0] && p[0] - h[0] < b.max[0] && p[1] + h[1] > b.min[1] && p[1] - h[1] < b.max[1] && p[2] + h[2] > b.min[2] && p[2] - h[2] < b.max[2];
}

/** A circle (x, z, r) at height [y0, y1] against a box: the push-out [nx, nz, depth] or null. */
export function nwCircleBox(x, z, r, y0, y1, b) {
  if (y1 <= b.min[1] || y0 >= b.max[1]) return null;
  const cx = nwClamp(x, b.min[0], b.max[0]), cz = nwClamp(z, b.min[2], b.max[2]);
  let dx = x - cx, dz = z - cz;
  const d = Math.hypot(dx, dz);
  if (d >= r) return null;
  if (d > 1e-9) return [dx / d, dz / d, r - d];
  // The centre is inside the box: leave by the nearest face.
  const faces = [[x - b.min[0], -1, 0], [b.max[0] - x, 1, 0], [z - b.min[2], 0, -1], [b.max[2] - z, 0, 1]];
  faces.sort((a, c) => a[0] - c[0]);
  const [pen, fx, fz] = faces[0];
  return [fx, fz, pen + r];
}

// --------------------------------------------------------------------- world

/**
 * A physics world. Bodies: `addBody({ pos: [x, y, z], half: [hx, hy, hz], vel?, mass?, restitution?, friction?,
 * density?, kind?, kinematic? })` → the body (`{ id, pos, vel, half, mass, sleeping, onGround, spin, tilt, ... }`).
 * `step(dt)` advances whole fixed steps (the remainder carries) and returns the number taken.
 */
export function nwWorld({ groundAt = () => 0, colliders = [], waterDepthAt = () => 0, flowAt = () => null } = {}) {
  const boxesNear = typeof colliders === "function" ? colliders : () => colliders ?? [];
  const bodies = [];
  const contacts = [];
  let acc = 0, time = 0;

  function addBody(spec = {}) {
    const b = {
      id: spec.id ?? `nw${++nwIds}`, kind: spec.kind ?? "box",
      pos: [...(spec.pos ?? [0, 0, 0])], vel: [...(spec.vel ?? [0, 0, 0])], half: [...(spec.half ?? [0.5, 0.5, 0.5])],
      mass: spec.mass ?? 10, restitution: spec.restitution ?? 0.3, friction: spec.friction ?? 0.6, density: spec.density ?? 0.4,
      kinematic: !!spec.kinematic, sleeping: !!spec.sleeping, still: 0, onGround: false, spin: 0, tilt: 0, yaw: spec.yaw ?? 0, hits: 0,
    };
    bodies.push(b);
    return b;
  }
  function removeBody(b) { const i = bodies.indexOf(b); if (i >= 0) bodies.splice(i, 1); }
  function wake(b) { if (!b.kinematic) { b.sleeping = false; b.still = 0; } }

  function resolveBoxes(b) {
    const r = Math.max(b.half[0], b.half[2]) + 1;
    for (const box of boxesNear(b.pos[0], b.pos[2], r)) {
      if (!nwOverlap(b.pos, b.half, box)) continue;
      // Push out along the axis of least penetration; a body over a box's top lands on it.
      const pen = [
        [b.pos[0] + b.half[0] - box.min[0], 0, -1], [box.max[0] - (b.pos[0] - b.half[0]), 0, 1],
        [b.pos[1] + b.half[1] - box.min[1], 1, -1], [box.max[1] - (b.pos[1] - b.half[1]), 1, 1],
        [b.pos[2] + b.half[2] - box.min[2], 2, -1], [box.max[2] - (b.pos[2] - b.half[2]), 2, 1],
      ];
      pen.sort((a, c) => a[0] - c[0]);
      const [d, ax, sgn] = pen[0];
      b.pos[ax] += d * sgn;
      if (b.vel[ax] * sgn < 0) {
        const vn = Math.abs(b.vel[ax]);
        b.vel[ax] = vn > 0.6 ? vn * b.restitution * sgn : 0;
        b.hits += 1;
        if (ax === 1 && sgn > 0) b.onGround = true;
      }
    }
  }

  function subStep(b, h) {
    // Gravity, and water: buoyancy by the submerged fraction, drag, and the flow's drift.
    b.vel[1] -= NW_G * h;
    const ground = groundAt(b.pos[0], b.pos[2]);
    const depth = waterDepthAt(b.pos[0], b.pos[2]) || 0;
    if (depth > 0) {
      const surface = ground + depth;
      const sub = nwClamp((surface - (b.pos[1] - b.half[1])) / (2 * b.half[1]), 0, 1);
      if (sub > 0) {
        b.vel[1] += NW_G * (sub / Math.max(0.05, b.density)) * h;
        const drag = Math.min(1, 1.8 * sub * h);
        for (let i = 0; i < 3; i++) b.vel[i] -= b.vel[i] * drag;
        const f = flowAt(b.pos[0], b.pos[2]);
        if (f) { b.vel[0] += (f[0] - b.vel[0]) * Math.min(1, 0.8 * sub * h); b.vel[2] += (f[1] - b.vel[2]) * Math.min(1, 0.8 * sub * h); }
      }
    }
    // Sweep: split the move so no piece is longer than a quarter of the smallest half-extent.
    const minHalf = Math.max(0.02, Math.min(b.half[0], b.half[1], b.half[2]));
    const far = Math.max(Math.abs(b.vel[0]), Math.abs(b.vel[1]), Math.abs(b.vel[2])) * h;
    const n = Math.min(256, Math.max(1, Math.ceil(far / (minHalf * 0.25))));
    b.onGround = false;
    for (let k = 0; k < n; k++) {
      for (let i = 0; i < 3; i++) b.pos[i] += (b.vel[i] * h) / n;
      resolveBoxes(b);
      const g = groundAt(b.pos[0], b.pos[2]);
      if (b.pos[1] - b.half[1] < g) {
        b.pos[1] = g + b.half[1];
        if (b.vel[1] < 0) { const vn = -b.vel[1]; b.vel[1] = vn > 1 ? vn * b.restitution : 0; }
        b.onGround = true;
      }
    }
    if (b.onGround) {
      const k = Math.max(0, 1 - b.friction * 6 * h);
      b.vel[0] *= k; b.vel[2] *= k;
      b.spin *= Math.max(0, 1 - 4 * h);
    }
    // A tumbling body turns (drawn by the mount); it settles upright or on its side as it slows.
    b.tilt += b.spin * h;
    const speed = Math.hypot(b.vel[0], b.vel[1], b.vel[2]);
    if ((b.onGround || depth > 0) && speed < 0.08 && Math.abs(b.spin) < 0.1) { b.still += h; if (b.still > 0.5) { b.sleeping = true; b.vel = [0, 0, 0]; b.spin = 0; } }
    else b.still = 0;
  }

  function collidePairs() {
    for (let i = 0; i < bodies.length; i++) {
      const a = bodies[i];
      for (let j = i + 1; j < bodies.length; j++) {
        const c = bodies[j];
        if ((a.sleeping || a.kinematic) && (c.sleeping || c.kinematic)) continue;
        const dx = c.pos[0] - a.pos[0], dy = c.pos[1] - a.pos[1], dz = c.pos[2] - a.pos[2];
        const ox = a.half[0] + c.half[0] - Math.abs(dx), oy = a.half[1] + c.half[1] - Math.abs(dy), oz = a.half[2] + c.half[2] - Math.abs(dz);
        if (ox <= 0 || oy <= 0 || oz <= 0) continue;
        const ax = ox < oy && ox < oz ? 0 : oy < oz ? 1 : 2;
        const pen = [ox, oy, oz][ax], sgn = Math.sign([dx, dy, dz][ax]) || 1;
        const ia = a.kinematic ? 0 : 1 / a.mass, ic = c.kinematic ? 0 : 1 / c.mass;
        if (ia + ic === 0) continue;
        a.pos[ax] -= pen * sgn * (ia / (ia + ic)); c.pos[ax] += pen * sgn * (ic / (ia + ic));
        const vn = (c.vel[ax] - a.vel[ax]) * sgn;
        if (vn < 0) {
          const e = Math.min(a.restitution, c.restitution);
          const jmp = (-(1 + e) * vn) / (ia + ic);
          a.vel[ax] -= jmp * ia * sgn; c.vel[ax] += jmp * ic * sgn;
          contacts.push({ a: a.id, b: c.id, speed: -vn, t: time });
          wake(a); wake(c);
        }
      }
    }
  }

  function fixed(h) {
    for (const b of bodies) if (!b.sleeping && !b.kinematic) subStep(b, h);
    collidePairs();
    time += h;
  }

  function step(dt) {
    acc += Math.max(0, dt);
    let n = 0;
    while (acc >= NW_STEP - 1e-9 && n < NW_MAX_STEPS) { fixed(NW_STEP); acc -= NW_STEP; n += 1; }
    if (n === NW_MAX_STEPS) acc = Math.min(acc, NW_STEP);
    if (contacts.length > 64) contacts.splice(0, contacts.length - 64);
    return n;
  }

  return { addBody, removeBody, step, bodies, contacts, wake, groundAt, waterDepthAt, flowAt, boxesNear, get time() { return time; } };
}

// -------------------------------------------------------------------- avatar

/** A fresh avatar standing at (x, z). */
export function nwAvatarState(x, z, world) {
  // Placed in deep water (a teleport, a fast travel), the learner starts afloat at the surface, not on the bed.
  const g = world.groundAt(x, z), d = world.waterDepthAt(x, z) || 0;
  if (d >= NW_AVATAR.swimDepth) return { x, y: g + d - NW_AVATAR.swimFloat, z, vy: 0, mode: "swim", breath: 1, onGround: false, splash: false, cue: null, landed: 0 };
  return { x, y: g, z, vy: 0, mode: "walk", breath: 1, onGround: true, splash: false, cue: null, landed: 0 };
}

/** Is the avatar's circle at (x, z), feet at y, clear of every wall (a box taller than a step)? */
function nwAvatarClear(world, x, z, y) {
  const A = NW_AVATAR;
  for (const b of world.boxesNear(x, z, A.radius + 1)) {
    if (b.max[1] <= y + A.stepUp) continue; // a kerb or a low box is stepped over
    if (nwCircleBox(x, z, A.radius, y, y + A.height, b)) return false;
  }
  return true;
}

/** One avatar step (see the header). Pure: returns a new state. */
export function nwAvatarStep(state, input, dt, world) {
  const A = NW_AVATAR;
  const s = { ...state, splash: false, landed: 0 };
  dt = Math.max(0, Math.min(0.1, dt));
  const depth0 = world.waterDepthAt(s.x, s.z) || 0;
  const mode0 = depth0 >= A.swimDepth ? "swim" : depth0 >= A.wadeDepth ? "wade" : "walk";
  const k = mode0 === "swim" ? A.swim : mode0 === "wade" ? A.wade : 1;
  const f = mode0 === "walk" ? null : world.flowAt(s.x, s.z);
  const push = mode0 === "swim" ? A.flowSwim : mode0 === "wade" ? A.flowWade : 0;
  const vx = (input?.vx ?? 0) * k + (f ? f[0] * push : 0), vz = (input?.vz ?? 0) * k + (f ? f[1] * push : 0);
  // Horizontal: sub-steps no longer than the radius, each axis tried alone so a wall slides the learner along it.
  const dist = Math.hypot(vx, vz) * dt;
  const n = Math.max(1, Math.ceil(dist / (A.radius * 0.8)));
  const lim = NP_SIZE / 2 - 5;
  const okAt = (x, z) => Math.abs(x) < lim && Math.abs(z) < lim && nwAvatarClear(world, x, z, s.y) && world.groundAt(x, z) <= s.y + A.stepUp;
  for (let i = 0; i < n; i++) {
    // Each axis alone; a blocked piece is halved a few times so the learner comes right up to the wall.
    for (const ax of ["x", "z"]) {
      let d = ((ax === "x" ? vx : vz) * dt) / n;
      for (let tries = 0; tries < 4 && Math.abs(d) > 1e-4; tries++, d /= 2) {
        const x = ax === "x" ? s.x + d : s.x, z = ax === "z" ? s.z + d : s.z;
        if (okAt(x, z)) { s.x = x; s.z = z; break; }
      }
    }
  }
  // Vertical.
  const ground = world.groundAt(s.x, s.z);
  const depth = world.waterDepthAt(s.x, s.z) || 0;
  const surface = ground + depth;
  s.mode = depth >= A.swimDepth ? "swim" : depth >= A.wadeDepth ? "wade" : "walk";
  if (s.mode === "swim") {
    // Buoyancy: a damped spring holds the feet at swimFloat under the surface (the head above it).
    const target = surface - A.swimFloat;
    s.vy += (-(s.y - target) * 14 - s.vy * 5) * dt;
    s.y += s.vy * dt;
    if (s.y < ground) { s.y = ground; s.vy = Math.max(0, s.vy); }
    s.onGround = false;
    s.breath = Math.max(0, s.breath - A.breathDrain * dt);
  } else {
    const airborne = !s.onGround || s.y - ground > A.stepDown;
    if (airborne) {
      s.onGround = false;
      s.vy -= NW_G * dt;
      s.y += s.vy * dt;
      if (s.y <= ground) { s.landed = -s.vy; s.y = ground; s.vy = 0; s.onGround = true; }
      if (depth > 0 && s.vy < 0) s.vy *= Math.max(0, 1 - 6 * dt); // water breaks a fall
    } else { s.y = ground; s.vy = 0; s.onGround = true; }
    s.breath = Math.min(1, s.breath + A.breathFill * dt);
    s.splash = s.mode === "wade" && Math.hypot(input?.vx ?? 0, input?.vz ?? 0) > 0.5;
  }
  s.mode = s.onGround || s.mode === "swim" ? s.mode : "fall";
  s.cue = s.mode === "swim" && s.breath < A.breathCue ? "shore" : null;
  return s;
}

// ------------------------------------------------------------------- vehicle

/** A vehicle's state: MOTORPOOL's drive state plus the footprint half-extents [w/2, h/2, l/2]. */
export function nwVehicleState(x, z, heading, half, world) {
  return { x, z, y: world.groundAt(x, z), heading, speed: 0, half: [...half], crashed: false, hazards: false, dents: 0 };
}

/** The circles along a vehicle's length (radius half-width) at (x, z, heading). */
function nwVehicleCircles(half, x, z, heading) {
  const n = Math.max(2, Math.ceil(half[2] / half[0]) + 1);
  const fx = Math.sin(heading), fz = Math.cos(heading);
  const out = [];
  for (let i = 0; i < n; i++) { const t = -half[2] + half[0] + ((2 * half[2] - 2 * half[0]) * i) / (n - 1); out.push([x + fx * t, z + fz * t]); }
  return out;
}

/** Is a vehicle's footprint clear of every box (a place it can start from)? */
export function nwVehicleClear(veh, world) {
  const r = veh.half[0], y0 = veh.y + 0.4, y1 = veh.y + veh.half[1] * 2;
  for (const [cx, cz] of nwVehicleCircles(veh.half, veh.x, veh.z, veh.heading)) {
    for (const b of world.boxesNear(cx, cz, r + 1)) if (nwCircleBox(cx, cz, r, y0, y1, b)) return false;
    if ((world.waterDepthAt(cx, cz) || 0) > 0.6) return false;
  }
  return true;
}

/**
 * One drive step. Returns `{ state, crash, bumped, hit }`: `crash` = { speed, x, z, normal: [nx, nz], local: [lx, lz],
 * with } when the closing speed reached NW_CRASH_SPEED against a wall or a heavy body. Light bodies (cones, barrels)
 * are knocked aside and tumble. Deep water refuses the move (a road vehicle stops at the bank).
 */
export function nwVehicleStep(veh, input, dt, world, profile, { bodies = world.bodies ?? [] } = {}) {
  if (veh.crashed) return { state: { ...veh, speed: 0 }, crash: null, bumped: false, hit: [] };
  const next = dvStepDrive({ x: veh.x, z: veh.z, heading: veh.heading, speed: veh.speed }, input ?? {}, dt, profile, { bounds: { minX: -NP_SIZE / 2 + 4, maxX: NP_SIZE / 2 - 4, minZ: -NP_SIZE / 2 + 4, maxZ: NP_SIZE / 2 - 4 } });
  const s = { ...veh, heading: next.heading, speed: next.speed };
  const dx = next.x - veh.x, dz = next.z - veh.z;
  const dist = Math.hypot(dx, dz);
  const n = Math.max(1, Math.ceil(dist / (veh.half[0] * 0.5)));
  const r = veh.half[0], y0 = veh.y + 0.4, y1 = veh.y + veh.half[1] * 2;
  const fwd = [Math.sin(s.heading), Math.cos(s.heading)], dir = Math.sign(s.speed || veh.speed || 1);
  let crash = null, bumped = false;
  const hit = [];
  for (let i = 1; i <= n && !crash && !bumped; i++) {
    const px = veh.x + (dx * i) / n, pz = veh.z + (dz * i) / n;
    if ((world.waterDepthAt(px, pz) || 0) > 0.6) { s.speed = 0; bumped = true; break; }
    for (const [cx, cz] of nwVehicleCircles(veh.half, px, pz, s.heading)) {
      let contact = null;
      for (const b of world.boxesNear(cx, cz, r + 1)) {
        const p = nwCircleBox(cx, cz, r, y0, y1, b);
        // Only a contact the vehicle is moving into counts (backing away from a wall is always allowed).
        if (p && (fwd[0] * p[0] + fwd[1] * p[1]) * dir < 0) { contact = { normal: [p[0], p[1]], with: b.kind ?? "wall", heavy: true }; break; }
      }
      if (!contact) for (const b of bodies) {
        if (b.kinematic) continue;
        const box = { min: [b.pos[0] - b.half[0], b.pos[1] - b.half[1], b.pos[2] - b.half[2]], max: [b.pos[0] + b.half[0], b.pos[1] + b.half[1], b.pos[2] + b.half[2]] };
        const p = nwCircleBox(cx, cz, r, y0 - 0.4, y1, box);
        if (!p) continue;
        if (b.mass < NW_HEAVY) {
          // A light body is knocked ahead of the vehicle and tumbles; the vehicle carries on.
          const v = Math.abs(s.speed) * Math.sign(s.speed || 1);
          b.vel = [fwd[0] * v * 1.2 - p[0] * 1.5, 1.5 + Math.abs(v) * 0.25, fwd[1] * v * 1.2 - p[1] * 1.5];
          b.spin = 2 + Math.abs(v) * 0.8; b.sleeping = false; b.still = 0; b.hits += 1;
          s.speed *= 1 - Math.min(0.3, b.mass / 1000);
          hit.push(b.id);
          continue;
        }
        if ((fwd[0] * p[0] + fwd[1] * p[1]) * dir >= 0) continue;
        contact = { normal: [p[0], p[1]], with: b.kind ?? "body", heavy: true, body: b };
        break;
      }
      if (!contact) continue;
      const closing = Math.abs(s.speed) * Math.abs(fwd[0] * contact.normal[0] + fwd[1] * contact.normal[1]);
      // The impact point, in the world and in the vehicle's own frame (x to the right, z forward) for the dent.
      const ix = cx - contact.normal[0] * r, iz = cz - contact.normal[1] * r;
      const lx = (ix - px) * Math.cos(s.heading) - (iz - pz) * Math.sin(s.heading), lz = (ix - px) * fwd[0] + (iz - pz) * fwd[1];
      if (contact.body) {
        const b = contact.body;
        b.vel[0] -= contact.normal[0] * closing * 0.5; b.vel[2] -= contact.normal[1] * closing * 0.5; b.sleeping = false; b.still = 0; b.hits += 1;
      }
      if (closing >= NW_CRASH_SPEED) {
        crash = { speed: closing, x: ix, z: iz, normal: contact.normal, local: [lx, lz], with: contact.with };
        s.speed = 0; s.crashed = true; s.hazards = true; s.dents += 1;
      } else { s.speed *= -0.15; bumped = true; }
      break;
    }
    if (!crash && !bumped) { s.x = px; s.z = pz; }
  }
  s.y = world.groundAt(s.x, s.z);
  return { state: s, crash, bumped, hit };
}

// --------------------------------------------------------------- crash card

/**
 * The "after a collision" card. Every line is drawn from the catalog station
 * `traffic-incident-management` (the First Responder series: the MUTCD's
 * incident traffic control, the FHWA-sponsored Traffic Incident Management
 * responder training, ANSI/ISEA 107 high-visibility apparel, NFPA 1500), put
 * in a driver's words. No injury is shown or described; the world's
 * collision is a practice bump.
 */
export const NW_AFTER_COLLISION = {
  id: "nw-after-a-collision",
  title: "After a collision",
  station: "traffic-incident-management",
  lead: "A practice collision in a training world — nobody is hurt. This is what a driver does next.",
  steps: [
    { id: "secure", title: "Secure the scene", text: "Stop, hazard lights on. Put the high-visibility vest on before you step out, leave on the side away from traffic, and never stand in a live lane." },
    { id: "check", title: "Check people", text: "Ask whether anyone is hurt from a safe place. Bring people behind the barrier or well off the road, speak calmly, and offer to fetch what they need so nobody walks back toward traffic." },
    { id: "call", title: "Call it in", text: "Say where you are, what happened and what the vehicle needs, so the right help comes the first time. Then tell your supervisor and write it up while it is fresh." },
  ],
  source: "From the Traffic Incident Management station: the MUTCD's incident traffic control, the Traffic Incident Management responder training the Federal Highway Administration sponsors, ANSI/ISEA 107 high-visibility apparel and NFPA 1500.",
};

/** The card for a crash, or null for a bump under the threshold. */
export function nwCrashCard(crash) {
  if (!crash || !(crash.speed >= NW_CRASH_SPEED)) return null;
  return { ...NW_AFTER_COLLISION, speed: crash.speed, with: crash.with ?? "wall" };
}

// ------------------------------------------------------------ parish world

/** Footprints (w, d) per massing kind, from np-world.js's geometries; trees stop you at the trunk; reeds are walked through. */
export const NW_MASS_FOOT = {
  quarterBlock: [16, 12], gardenHouse: [12, 10], suburbHouse: [10, 9], shed: [40, 22], tower: [22, 22], campusBlock: [28, 18],
  tank: [18, 18], stack: [3.2, 3.2], crane: [20, 2], liveOak: [1.6, 1.6], cypress: [2.2, 2.2],
};
const NW_UNIT_H = new Set(["shed", "tower", "campusBlock", "tank", "stack"]);
const NW_TREE_H = { cypress: 12.5, liveOak: 10 };

/** A rotated footprint's axis-aligned box. */
function nwFootBox(x, z, w, d, rot, y0, y1, kind) {
  const c = Math.abs(Math.cos(rot)), s = Math.abs(Math.sin(rot));
  const hx = (c * w + s * d) / 2, hz = (s * w + c * d) / 2;
  return { min: [x - hx, y0, z - hz], max: [x + hx, y1, z + hz], kind };
}

/**
 * The parish's own solid boxes in one chunk (the fallback until CITYWORKS' cwColliders lands): every massing
 * building by kind (scaled as np-world.js scales it) and every site building (np-world.js's house beside each
 * pad). Trees are their trunks.
 */
export function nwParishColliders(parish, key) {
  const [cx, cz] = String(key).split(",").map(Number);
  const out = [];
  for (const m of npMassingForChunk(parish, cx, cz)) {
    const foot = NW_MASS_FOOT[m.kind];
    if (!foot) continue;
    const tree = NW_TREE_H[m.kind];
    const sc = tree ? m.h / tree : m.s;
    const h = NW_UNIT_H.has(m.kind) ? m.h : m.kind === "crane" ? 34 * m.s : m.h;
    if (m.kind === "crane") {
      // Two legs, not a solid block: the gantry is walked (or driven) under.
      for (const sx of [-9, 9]) {
        const lx = m.x + Math.cos(m.rot) * sx * m.s, lz = m.z - Math.sin(m.rot) * sx * m.s;
        out.push(nwFootBox(lx, lz, 1.6 * m.s, 1.6 * m.s, m.rot, m.y - 0.2, m.y + h, "crane-leg"));
      }
      continue;
    }
    out.push(nwFootBox(m.x, m.z, foot[0] * sc, foot[1] * sc, m.rot, m.y - 0.2, m.y + (tree ? 5 * sc : h), tree ? "trunk" : "building"));
  }
  const x0 = -NP_SIZE / 2 + cx * NP_CHUNK, z0 = -NP_SIZE / 2 + cz * NP_CHUNK;
  npPrepare(parish).sites.forEach((s, i) => {
    const w = 16 + (i % 3) * 4, d = 10 + (i % 2) * 4, h = 5 + (i % 4);
    const hx = s.position[0] - 14, hz = s.position[1] - 12;
    if (hx < x0 || hx >= x0 + NP_CHUNK || hz < z0 || hz >= z0 + NP_CHUNK) return;
    const y = npHeightAt(parish, s.position[0], s.position[1]);
    out.push({ min: [hx - w / 2, y - 0.2, hz - d / 2], max: [hx + w / 2, y + h, hz + d / 2], kind: "site-building", site: s.id });
  });
  return out;
}

/** Water depth over the ground from the parish itself (the fallback until TERRAFORM's tfWaterDepthAt lands). */
export function nwParishWaterDepth(parish, x, z) {
  const w = npWaterAt(parish, x, z);
  if (!w) return 0;
  return Math.max(0, NP_WATER_Y - npHeightAt(parish, x, z));
}

/**
 * The world over a parish: TERRAFORM's water and flow and CITYWORKS' colliders when passed, else the parish's own.
 * Chunks' boxes are cached; `boxesNear(x, z, r)` gathers the chunks a circle touches.
 */
export function nwParishWorld(parish, { tfWaterDepthAt = null, tfFlowAt = null, cwColliders = null } = {}) {
  const cache = new Map();
  const chunkBoxes = (key) => {
    let hit = cache.get(key);
    if (!hit) {
      let boxes = null;
      try { boxes = cwColliders?.(parish, key) ?? null; } catch { boxes = null; }
      hit = Array.isArray(boxes) ? boxes : nwParishColliders(parish, key);
      cache.set(key, hit);
      if (cache.size > 64) cache.delete(cache.keys().next().value);
    }
    return hit;
  };
  const colliders = (x, z, r = 2) => {
    const a = npChunkOf(x - r, z - r), b = npChunkOf(x + r, z + r);
    if (a.key === b.key) return chunkBoxes(a.key);
    const out = [];
    for (let iz = a.cz; iz <= b.cz; iz++) for (let ix = a.cx; ix <= b.cx; ix++) if (ix < NP_CHUNKS_PER_SIDE && iz < NP_CHUNKS_PER_SIDE) out.push(...chunkBoxes(`${ix},${iz}`));
    return out;
  };
  const waterDepthAt = (x, z) => { const d = tfWaterDepthAt?.(parish, x, z); return typeof d === "number" ? d : nwParishWaterDepth(parish, x, z); };
  const flowAt = (x, z) => { const f = tfFlowAt?.(parish, x, z); return Array.isArray(f) ? f : null; };
  const world = nwWorld({ groundAt: (x, z) => npHeightAt(parish, x, z), colliders, waterDepthAt, flowAt });
  world.seams = { water: !!tfWaterDepthAt, flow: !!tfFlowAt, colliders: !!cwColliders };
  world.chunkBoxes = chunkBoxes;
  return world;
}
