// Bay Regatta — the race engine: one learner-helmed yacht against the rest
// of the fleet on a course from courses.js. Pure and headless — no DOM, no
// three.js — so tools/check_regatta.mjs walks a whole race to the finish.
//
// What is scored (rgScoreRace):
//   - time to the finish line and the place among the fleet;
//   - every turning mark rounded on its correct side;
//   - the harbour-mouth no-wake zone held (speed under the cap, out and home);
//   - right-of-way kept at crossings: when another yacht crosses from the
//     starboard side, this yacht is the give-way vessel and keeps clear by
//     slowing or turning away — taught generically, the way the driving
//     stations score following distance, never as a clause number;
//   - a clean docking at the finish: alongside at the dock, slow, bow the
//     way the berth faces.
// Nothing here is bought or staked: the score is a plain result,
// and the reputation and credits it earns go through Bay World's own career
// ledger (events.js → bayworld/js/career.js).
//
// Conventions: the bow faces +Z at heading 0, port is the yacht's own +X
// (shared/fleet.js), so at heading h forward = (sin h, cos h) and the port
// beam = (cos h, −sin h). Speeds are m/s; RG_YACHT.max ≈ 20 knots.
import { WEATHER } from "../../shared/weather.js";
import { YACHT_FLEET, yachtById } from "../../shared/yacht-fleet.js";
import { rgCourseById, rgOnWater } from "./courses.js";

/** One motor yacht's handling: acceleration, drag, top speed and turn rate. */
export const RG_YACHT = { accel: 1.6, drag: 0.09, max: 10.3, turn: 0.42, reverse: 2.0 };
/** How near a mark counts as a rounding, and the lane the fleet starts in. */
export const RG_MARK_RADIUS = 30;
export const RG_START_GAP = 16;
/** The give-way check's window: another yacht inside this range, forward of
 *  the beam on the starboard side and closing. */
export const RG_GIVE_WAY = { range: 70, hold: 1.5, slowTo: 0.55 };
/** Docking tolerances: within `r` of the dock, slower than `speed`, bow within `heading` radians of the berth's. */
export const RG_DOCK = { r: 10, speed: 1.2, hard: 2.4, heading: 0.6 };

const rgWrap = (a) => Math.atan2(Math.sin(a), Math.cos(a));

/** Wind from the day's weather: speed in m/s from the kind's gust factor,
 *  direction that veers slowly with time — deterministic, so a headless
 *  race repeats. Fog shortens how far a mark can be seen (metres). */
export function rgWindFor(kind, t = 0) {
  const w = WEATHER[kind] ?? WEATHER.clear;
  const speed = 1.5 + (w.gust ?? 0) * 7.0 * (0.8 + 0.2 * Math.sin(t * 0.13));
  const dir = 0.9 + Math.sin(t * 0.021) * 0.6;
  return { kind, speed, dir, visibility: rgMarkVisibility(kind) };
}
export function rgMarkVisibility(kind) {
  const w = WEATHER[kind] ?? WEATHER.clear;
  return (w.fog ?? 1) < 0.5 ? 140 : (w.fog ?? 1) < 0.9 ? 320 : 900;
}

function rgBoat(yacht, x, z, heading, ai) {
  return { id: yacht.id, name: yacht.name, x, z, heading, speed: 0, throttle: 0, rudder: 0, ai, next: 0, lap: 0,
    roundings: [], wasAhead: true, finished: false, finishTime: null, docked: false, docking: null, missed: 0 };
}

/**
 * Starts a race on `courseId` with the learner helming `yachtId` and every
 * other yacht of the fleet as AI (or `opts.fleet`, a list of yacht ids, for
 * a smaller field). Boats line up behind the start line in staggered slots.
 */
export function rgCreateRace(courseId, yachtId, opts = {}) {
  const course = rgCourseById(courseId);
  if (!course) throw new Error(`race: unknown course "${courseId}"`);
  const learner = yachtById(yachtId);
  if (!learner) throw new Error(`race: unknown yacht "${yachtId}"`);
  const field = (opts.fleet ?? YACHT_FLEET.map((y) => y.id)).filter((id) => id !== yachtId).map((id) => yachtById(id)).filter(Boolean);
  const sx = (course.start.a[0] + course.start.b[0]) / 2, sz = (course.start.a[1] + course.start.b[1]) / 2;
  const m0 = course.marks[0];
  const heading = Math.atan2(m0.x - sx, m0.z - sz);
  const fx = Math.sin(heading), fz = Math.cos(heading), px = Math.cos(heading), pz = -Math.sin(heading);
  const all = [learner, ...field];
  const boats = all.map((y, i) => {
    const row = Math.floor(i / 3), col = (i % 3) - 1;
    const back = 12 + row * RG_START_GAP, side = col * RG_START_GAP;
    return rgBoat(y, sx - fx * back + px * side, sz - fz * back + pz * side, heading, i > 0);
  });
  return {
    courseId, course, learnerId: yachtId, boats, t: 0, started: true,
    weather: opts.weather ?? "clear", wind: rgWindFor(opts.weather ?? "clear", 0),
    noWake: { violations: 0, over: 0 },
    giveWay: { active: false, since: 0, violations: 0, other: null },
    finishedOrder: [],
  };
}

/** The current target for a boat: the next mark, then the finish line, then the dock. */
export function rgTargetFor(state, boat) {
  const c = state.course;
  const total = c.marks.length * (c.laps ?? 1);
  if (boat.next < total) { const m = c.marks[boat.next % c.marks.length]; return { kind: "mark", x: m.x, z: m.z, side: m.side, mark: m }; }
  if (boat.next === total) return { kind: "line", x: (c.start.a[0] + c.start.b[0]) / 2, z: (c.start.a[1] + c.start.b[1]) / 2 };
  return { kind: "dock", x: c.dock.x, z: c.dock.z, heading: c.dock.heading };
}

/** Relative position of (x, z) from a boat: `ahead` along the bow, `port` along the port beam (negative = starboard). */
function rgRelative(boat, x, z) {
  const dx = x - boat.x, dz = z - boat.z;
  return { ahead: dx * Math.sin(boat.heading) + dz * Math.cos(boat.heading), port: dx * Math.cos(boat.heading) - dz * Math.sin(boat.heading), dist: Math.hypot(dx, dz) };
}

/** Whether `boat` currently has a give-way duty: another yacht within range,
 *  forward of the beam on the starboard side, and the range closing. */
export function rgGiveWayDuty(state, boat) {
  for (const o of state.boats) {
    if (o === boat || o.finished) continue;
    const rel = rgRelative(boat, o.x, o.z);
    if (rel.dist > RG_GIVE_WAY.range || rel.ahead <= 0 || rel.port >= -3) continue;
    const vx = Math.sin(o.heading) * o.speed - Math.sin(boat.heading) * boat.speed;
    const vz = Math.cos(o.heading) * o.speed - Math.cos(boat.heading) * boat.speed;
    const closing = (vx * (o.x - boat.x) + vz * (o.z - boat.z)) < 0;
    if (closing) return o;
  }
  return null;
}

/**
 * The autopilot every AI yacht steers by — and the helm the headless checker
 * gives the learner's yacht to walk a race to the finish. Steers for the
 * target offset to the rounding side, holds spacing behind a yacht ahead,
 * keeps the no-wake cap inside the harbour-mouth zone, gives way when it
 * must, and comes in slow to the dock. Returns `{ throttle, rudder }`.
 */
export function rgAutoHelm(state, boat) {
  const tgt = rgTargetFor(state, boat);
  let ax = tgt.x, az = tgt.z;
  if (tgt.kind === "mark") {
    // Aim a boat-length to the side the mark must be kept on, so the mark
    // passes down that side rather than under the bow.
    const bearing = Math.atan2(tgt.x - boat.x, tgt.z - boat.z);
    const off = tgt.side === "port" ? -14 : 14;   // the mark to port → aim to starboard of it
    ax += Math.cos(bearing) * off; az += -Math.sin(bearing) * off;
  }
  const want = Math.atan2(ax - boat.x, az - boat.z);
  const err = rgWrap(want - boat.heading);
  let rudder = Math.max(-1, Math.min(1, err * 2.2));
  let throttle = Math.abs(err) > 1.2 ? 0.45 : 1;
  const c = state.course;
  const inNoWake = Math.hypot(boat.x - c.noWake.x, boat.z - c.noWake.z) <= c.noWake.r + 12;
  if (inNoWake && boat.speed > c.noWake.cap * 0.9) throttle = Math.min(throttle, boat.speed > c.noWake.cap ? -0.3 : 0.15);
  else if (inNoWake) throttle = Math.min(throttle, 0.25);
  // Spacing: a yacht close ahead means ease the throttle rather than push past.
  for (const o of state.boats) {
    if (o === boat || o.finished) continue;
    const rel = rgRelative(boat, o.x, o.z);
    if (rel.ahead > 0 && rel.ahead < 42 && Math.abs(rel.port) < 12) throttle = Math.min(throttle, 0.3);
  }
  if (rgGiveWayDuty(state, boat)) { throttle = Math.min(throttle, 0.2); rudder = Math.min(rudder, -0.6); }
  if (tgt.kind === "dock") {
    // Come in along the berth's own heading: first to an approach point a
    // boat-length and a half short of the dock, then creep in bow-first.
    const d = Math.hypot(tgt.x - boat.x, tgt.z - boat.z);
    const apx = tgt.x - Math.sin(tgt.heading) * 36, apz = tgt.z - Math.cos(tgt.heading) * 36;
    if (!boat.approached && Math.hypot(apx - boat.x, apz - boat.z) > 10 && d > 30) {
      const w2 = Math.atan2(apx - boat.x, apz - boat.z);
      rudder = Math.max(-1, Math.min(1, rgWrap(w2 - boat.heading) * 2.2));
    } else boat.approached = true;
    if (d < 60) throttle = boat.speed > 1.6 ? -0.4 : 0.18;
    if (d < 25) throttle = boat.speed > 0.9 ? -0.4 : 0.1;
    if (d < RG_DOCK.r) {
      const hErr = rgWrap(tgt.heading - boat.heading);
      rudder = Math.max(-1, Math.min(1, hErr * 2.5));
      // Creep while the bow comes round; stop once it points the berth's way.
      throttle = Math.abs(hErr) > RG_DOCK.heading * 0.7 ? (boat.speed > 0.8 ? 0 : 0.12) : (boat.speed > 0.4 ? -0.5 : 0);
    }
  }
  return { throttle, rudder };
}

function rgAdvanceBoat(state, boat, input, dt) {
  const throttle = Math.max(-1, Math.min(1, input.throttle ?? 0)), rudder = Math.max(-1, Math.min(1, input.rudder ?? 0));
  boat.throttle = throttle; boat.rudder = rudder;
  const target = throttle >= 0 ? throttle * RG_YACHT.max : throttle * RG_YACHT.reverse;
  boat.speed += (target - boat.speed) * Math.min(1, RG_YACHT.accel * dt / Math.max(1, Math.abs(target - boat.speed) * 0.35 + 1));
  boat.speed -= boat.speed * RG_YACHT.drag * dt;
  if (Math.abs(boat.speed) < 0.01 && throttle === 0) boat.speed = 0;
  const steer = rudder * RG_YACHT.turn * Math.min(1, Math.abs(boat.speed) / 3 + 0.15) * dt;
  boat.heading = rgWrap(boat.heading + steer * (boat.speed >= 0 ? 1 : -1));
  // Wind: sets the hull down-wind and weathercocks the bow a little.
  const w = state.wind, leeway = w.speed * 0.04;
  boat.heading = rgWrap(boat.heading + Math.sin(w.dir - boat.heading) * 0.004 * w.speed * dt);
  const nx = boat.x + (Math.sin(boat.heading) * boat.speed + Math.sin(w.dir) * leeway) * dt;
  const nz = boat.z + (Math.cos(boat.heading) * boat.speed + Math.cos(w.dir) * leeway) * dt;
  if (rgOnWater(nx, nz)) { boat.x = nx; boat.z = nz; } else boat.speed *= 0.2;   // the shore stops a hull
}

function rgProgress(state, boat, dt) {
  const c = state.course, tgt = rgTargetFor(state, boat);
  const rel = rgRelative(boat, tgt.x, tgt.z);
  if (tgt.kind === "mark") {
    // A rounding is recorded as the mark comes abeam inside the rounding
    // radius, on whichever side it actually passed; a mark passed wide is
    // still advanced past once it is well astern, and counted as missed.
    if (boat.wasAhead && rel.ahead <= 0) {
      if (rel.dist <= RG_MARK_RADIUS) {
        const side = rel.port > 0 ? "port" : "starboard";
        boat.roundings.push({ mark: tgt.mark.id, side, ok: side === tgt.side });
        boat.next += 1;
      } else if (rel.dist <= RG_MARK_RADIUS * 3) {
        boat.roundings.push({ mark: tgt.mark.id, side: null, ok: false });
        boat.missed += 1; boat.next += 1;
      }
    }
    boat.wasAhead = rel.ahead > 0;
  } else if (tgt.kind === "line") {
    if (boat.wasAhead && rel.ahead <= 0 && rel.dist <= 40) {
      boat.next += 1; boat.finishTime = state.t;
      state.finishedOrder.push(boat.id);
    }
    boat.wasAhead = rel.ahead > 0;
  } else if (tgt.kind === "dock" && !boat.finished) {
    const bowOk = Math.abs(rgWrap(tgt.heading - boat.heading)) <= RG_DOCK.heading;
    // Docked once alongside and slow with the bow the berth's way — or at a
    // dead stop whatever the bow is doing, so a helm that gives up still
    // gets an honest result.
    if (rel.dist <= RG_DOCK.r && Math.abs(boat.speed) < RG_DOCK.speed && (bowOk || Math.abs(boat.speed) < 0.05)) {
      boat.docking = { speed: Math.abs(boat.speed), bowOk, hard: boat.docking?.hard ?? false, clean: bowOk && !(boat.docking?.hard ?? false) };
      boat.docked = true; boat.finished = true; boat.speed = 0;
    } else if (rel.dist <= RG_DOCK.r && Math.abs(boat.speed) >= RG_DOCK.hard) {
      boat.docking = { ...(boat.docking ?? {}), hard: true };
    }
  }
  void dt;
}

/**
 * Advances the race by `dt` seconds: the learner's yacht by `input`
 * (`{ throttle: -1..1, rudder: -1..1 }`), every AI yacht by rgAutoHelm(),
 * then the mark, line, dock, no-wake and give-way checks. Mutates and
 * returns `state`.
 */
export function rgStepRace(state, input, dt) {
  state.t += dt;
  state.wind = rgWindFor(state.weather, state.t);
  for (const boat of state.boats) {
    if (boat.finished) continue;
    const helm = boat.ai || !input ? rgAutoHelm(state, boat) : input;
    rgAdvanceBoat(state, boat, helm, dt);
    rgProgress(state, boat, dt);
  }
  const me = state.boats.find((b) => b.id === state.learnerId);
  if (me && !me.finished) {
    const c = state.course;
    if (Math.hypot(me.x - c.noWake.x, me.z - c.noWake.z) <= c.noWake.r && me.speed > c.noWake.cap) {
      state.noWake.over += dt;
      if (state.noWake.over >= 1 && !state.noWake.flagged) { state.noWake.violations += 1; state.noWake.flagged = true; }
    } else { state.noWake.over = 0; state.noWake.flagged = false; }
    const other = rgGiveWayDuty(state, me);
    if (other) {
      // Keeping clear means easing right down or turning away from the
      // other yacht; holding course and speed for longer than the window is
      // a violation.
      const keptClear = me.speed < RG_YACHT.max * RG_GIVE_WAY.slowTo || me.rudder < -0.3;
      state.giveWay.other = other.id;
      if (!state.giveWay.active) { state.giveWay.active = true; state.giveWay.since = state.t; state.giveWay.flagged = false; }
      if (!keptClear && state.t - state.giveWay.since > RG_GIVE_WAY.hold && !state.giveWay.flagged) { state.giveWay.violations += 1; state.giveWay.flagged = true; }
      if (keptClear) state.giveWay.since = state.t;
    } else { state.giveWay.active = false; state.giveWay.other = null; state.giveWay.flagged = false; }
  }
  return state;
}

/** The learner's boat. */
export function rgLearner(state) { return state.boats.find((b) => b.id === state.learnerId); }

/** Place by finish-line order among boats that have crossed (1-based), or null. */
export function rgPlaceOf(state, boatId) { const i = state.finishedOrder.indexOf(boatId); return i < 0 ? null : i + 1; }

/**
 * The learner's result, in the shape events.js pays out on: time, place,
 * the four checks and a star count — one star each for a clean sheet on the
 * marks, the harbour rules (no-wake and give-way together) and the docking,
 * and `passed` when every mark was rounded and the yacht docked.
 */
export function rgScoreRace(state) {
  const me = rgLearner(state);
  const marksTotal = state.course.marks.length * (state.course.laps ?? 1);
  const marksOk = me.roundings.filter((r) => r.ok).length;
  const noWakeOk = state.noWake.violations === 0;
  const giveWayOk = state.giveWay.violations === 0;
  const dockingOk = !!me.docking?.clean;
  const stars = (marksOk === marksTotal ? 1 : 0) + (noWakeOk && giveWayOk ? 1 : 0) + (dockingOk ? 1 : 0);
  return {
    yacht: me.id, course: state.courseId, time: me.finishTime, place: rgPlaceOf(state, me.id), fleet: state.boats.length,
    marksOk, marksTotal, noWakeOk, giveWayOk, dockingOk, noWakeViolations: state.noWake.violations, giveWayViolations: state.giveWay.violations,
    finished: me.finished, stars, passed: me.finished && me.roundings.length === marksTotal && me.missed === 0,
  };
}
