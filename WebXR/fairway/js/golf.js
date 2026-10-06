// Fairway Park — the golf engine.
//
// Pure and store-injectable, exactly like WebXR/race/js/sim.js and the arcade
// cabinets' engines: create()/swing()/putt() touch no DOM, canvas, three.js
// or audio, so tools/check_fairway_game.mjs drives a full nine holes headless
// against a stubbed course with no browser at all. WebXR/fairway/js/world.js
// and app.js are the only files that touch three.js or the page.
//
// The swing model is a power/timing pair, the way a swing-meter UI naturally
// produces one: `power` (0..1) is how far the meter filled before the first
// click, `timing` (-1..1) is how far off-centre the second click landed on
// the accuracy band, 0 being a pure strike. Distance and lateral drift both
// come from those two numbers, the club, the lie and the wind — nothing here
// depends on a frame rate or an animation, so the same two numbers always
// produce the same shot (seeded noise aside), which is what makes a scripted
// round in the checker deterministic.

import { fairwayHeight, fairwayLieAt } from "./course.js";

// ------------------------------------------------------------------ clubs

/**
 * carry: full-power, perfect-strike distance on the tee in metres.
 * loft: flavour text only, shown in the HUD.
 * spread: lateral drift at full carry, in metres, before lie/timing scale it.
 * windMul: how much a metre of wind's worth of drift this club picks up
 *          (a low, hot driver ball flies through wind more than a wedge's).
 */
export const GOLF_CLUBS = [
  { id: "driver", name: "Driver", loft: "low", carry: 205, spread: 14, windMul: 1.0 },
  { id: "iron", name: "Iron", loft: "mid", carry: 140, spread: 8, windMul: 0.7 },
  { id: "wedge", name: "Wedge", loft: "high", carry: 75, spread: 5, windMul: 0.45 },
  { id: "putter", name: "Putter", loft: "none", carry: 15, spread: 0.9, windMul: 0 },
];
const CLUB_BY_ID = Object.fromEntries(GOLF_CLUBS.map((c) => [c.id, c]));

/** Full-swing lie effects. Water and out have none — they never take a swing. */
const LIE_FACTORS = {
  tee: { carry: 1.0, spread: 1.0 },
  fairway: { carry: 1.0, spread: 1.0 },
  path: { carry: 0.92, spread: 1.15 },
  rough: { carry: 0.72, spread: 1.7 },
  bunker: { carry: 0.5, spread: 1.4 },
};

export const HOLE_CUP_RADIUS = 0.15; // metres: the ball must finish inside this of the pin to be holed
const GREEN_FRINGE = 1.2; // metres of "just off" tolerance before a putt is refused

function glRng(seed) {
  let a = (seed >>> 0) || 0x9e3779b9;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const golfClamp = (v, lo, hi) => (v < lo ? lo : v > hi ? hi : v);
const dist = (a, b) => Math.hypot(a.x - b.x, a.z - b.z);

// -------------------------------------------------------------- care habits

/** One row per habit the groundskeeper's log scores. Order is the panel order. */
export const CARE_HABITS = [
  { id: "rake", label: "Rake the bunker", ok: 2, miss: -4 },
  { id: "divot", label: "Replace the divot", ok: 2, miss: -4 },
  { id: "repair", label: "Repair the ball mark", ok: 2, miss: -4 },
  { id: "cartPath", label: "Keep carts on the path", ok: 1, miss: -3 },
];
const HABIT_BY_ID = Object.fromEntries(CARE_HABITS.map((h) => [h.id, h]));

const CARE_LINES = {
  rake: {
    ok: (n) => `Raked the bunker smooth on hole ${n}, per the course's maintenance plan.`,
    miss: (n) => `Left the bunker unraked on hole ${n} — the course's maintenance plan expects it smoothed before the next group plays through.`,
  },
  divot: {
    ok: (n) => `Replaced the divot on hole ${n}, per the course's maintenance plan.`,
    miss: (n) => `Left a divot unrepaired on hole ${n} — the course's maintenance plan calls for tamping or filling it right away.`,
  },
  repair: {
    ok: (n) => `Repaired the ball mark on the hole ${n} green, per the course's maintenance plan.`,
    miss: (n) => `Putted over an unrepaired ball mark on the hole ${n} green — the course's maintenance plan asks that it be fixed before the next putt.`,
  },
  cartPath: {
    ok: (n) => `Kept the cart on the path leaving the hole ${n} green, per the course's maintenance plan.`,
    miss: (n) => `Cut across the turf instead of the cart path leaving the hole ${n} green — against the course's maintenance plan.`,
  },
};

function glNewCare() {
  return { score: 100, opportunities: 0, met: 0, pending: {}, log: [] };
}

function careResolve(state, habitId, ok) {
  const pend = state.care.pending[habitId];
  if (!pend) return;
  const h = HABIT_BY_ID[habitId];
  state.care.opportunities += 1;
  if (ok) state.care.met += 1;
  state.care.score = golfClamp(state.care.score + (ok ? h.ok : h.miss), 0, 100);
  state.care.log.push({ habit: habitId, hole: pend.hole, ok, line: CARE_LINES[habitId][ok ? "ok" : "miss"](pend.hole) });
  delete state.care.pending[habitId];
}

/** Resolve every habit still open as a miss — called on hole-out and round end. */
function careSweep(state) {
  for (const id of Object.keys(state.care.pending)) careResolve(state, id, false);
}

/**
 * The player claims a courtesy — rake the bunker, replace a divot, repair a
 * ball mark, or confirm the cart stayed on the path. A call with no matching
 * open opportunity is simply ignored (the panel only offers the ones open).
 */
export function glCareEvent(state, habitId) {
  if (!HABIT_BY_ID[habitId]) throw new Error(`unknown care habit: ${habitId}`);
  careResolve(state, habitId, true);
  return state.care;
}

// ------------------------------------------------------------------ round

/**
 * `course` is the { FAIRWAY_HOLES, ... } shape from course.js — passed in
 * rather than imported twice, so a caller (or the checker) can hand this a
 * fixture course as easily as the real one.
 */
export function glCreateRound({ seed = 1, holes } = {}) {
  const H = holes ?? [];
  if (!H.length) throw new Error("glCreateRound needs at least one hole");
  const rng = glRng(seed);
  const state = {
    seed, rng, holes: H,
    holeIndex: 0,
    strokesThisHole: 0,
    club: "driver",
    aimOffset: 0,
    lastLie: "tee",
    wind: { speed: 0, dir: 0 },
    scorecard: [],
    totalStrokes: 0,
    totalPar: 0,
    penalties: 0,
    holedOuts: 0,
    events: [],
    care: glNewCare(),
    finished: false,
  };
  state.ball = { x: H[0].tee[0], z: H[0].tee[1] };
  rollWind(state);
  return state;
}

function rollWind(state) {
  state.wind = { speed: state.rng() * 6, dir: state.rng() * Math.PI * 2 };
}

/** Lets the app feed a live reading (e.g. shared/weather.js's gust, scaled to
 *  m/s) in place of the round's own random wind. Optional — a round never
 *  needs this called to work. */
export function glSetWind(state, { speed = 0, dir = 0 } = {}) {
  state.wind = { speed: Math.max(0, speed), dir };
}

export function glCurrentHole(state) { return state.holes[state.holeIndex]; }

export function glSetClub(state, clubId) {
  if (!CLUB_BY_ID[clubId]) throw new Error(`unknown club: ${clubId}`);
  state.club = clubId;
}

/** Aim is the pin direction plus this offset, in radians (positive = right). */
export function glAdjustAim(state, deltaRad) { state.aimOffset += deltaRad; }
export function glSetAim(state, offsetRad) { state.aimOffset = offsetRad; }

function pinDir(hole, ball) {
  return Math.atan2(hole.pin[0] - ball.x, hole.pin[1] - ball.z);
}

export function glAimYaw(state) {
  return pinDir(glCurrentHole(state), state.ball) + state.aimOffset;
}

export function glDistanceToPin(state) {
  const h = glCurrentHole(state);
  return Math.hypot(h.pin[0] - state.ball.x, h.pin[1] - state.ball.z);
}

export function glCanPutt(state) { return state.lastLie === "green"; }

function advanceHole(state) {
  const h = glCurrentHole(state);
  state.scorecard.push({ hole: h.number, par: h.par, strokes: state.strokesThisHole, rel: state.strokesThisHole - h.par });
  state.totalStrokes += state.strokesThisHole;
  state.totalPar += h.par;
  state.holedOuts += 1;
  careSweep(state);
  // The cart-path opportunity opens the moment a hole ends, resolved before
  // (or forgotten by) the first swing of the next one.
  state.care.pending.cartPath = { hole: h.number };
  if (state.holeIndex + 1 >= state.holes.length) {
    careSweep(state); // in case the round ends without another swing to catch the last cart-path check
    state.finished = true;
    return;
  }
  state.holeIndex += 1;
  const nh = glCurrentHole(state);
  state.ball = { x: nh.tee[0], z: nh.tee[1] };
  state.lastLie = "tee";
  state.club = "driver";
  state.aimOffset = 0;
  state.strokesThisHole = 0;
  rollWind(state);
}

/** Any habit opportunity still open when a new swing starts was missed. */
function closeStaleOpportunities(state, keep) {
  for (const id of Object.keys(state.care.pending)) {
    if (id === keep) continue;
    careResolve(state, id, false);
  }
}

/**
 * A full swing with the current club, from the current lie. `power` in
 * [0,1], `timing` in [-1,1] (0 = pure strike). Returns the shot's own event;
 * the same object is pushed onto state.events for a UI to drain.
 */
export function glSwing(state, { power, timing = 0 } = {}) {
  if (state.finished) throw new Error("the round is already finished");
  if (state.club === "putter") return glPutt(state, { power, timing });
  if (state.lastLie === "water" || state.lastLie === "out") throw new Error(`cannot swing from lie "${state.lastLie}" — take the drop first`);

  closeStaleOpportunities(state, null);

  const club = CLUB_BY_ID[state.club];
  const lieF = LIE_FACTORS[state.lastLie] ?? LIE_FACTORS.rough;
  const p = golfClamp(power, 0, 1);
  const t = golfClamp(timing, -1, 1);
  const hole = glCurrentHole(state);
  const fromLie = state.lastLie;
  const fromBall = { ...state.ball };

  const carry = club.carry * p * lieF.carry;
  const noise = (state.rng() - 0.5) * club.spread * 0.35 * lieF.spread;
  const lateral = (t * club.spread + noise) * (carry / (club.carry || 1)) * lieF.spread;

  const yaw = pinDir(hole, state.ball) + state.aimOffset;
  const fx = Math.sin(yaw), fz = Math.cos(yaw);
  const px = Math.cos(yaw), pz = -Math.sin(yaw);

  const windAlong = Math.cos(state.wind.dir - yaw) * state.wind.speed * club.windMul * (carry / 100);
  const windCross = Math.sin(state.wind.dir - yaw) * state.wind.speed * club.windMul * (carry / 100);

  const dx = fx * (carry + windAlong) + px * (lateral + windCross);
  const dz = fz * (carry + windAlong) + pz * (lateral + windCross);
  const landing = { x: state.ball.x + dx, z: state.ball.z + dz };
  const newLie = fairwayLieAt(landing.x, landing.z);

  state.strokesThisHole += 1;
  let event = { type: "swing", hole: hole.number, club: club.id, fromLie, carry, newLie, penalty: false, holed: false };

  if (newLie === "water" || newLie === "out") {
    // Stroke and distance: the shot counts, plus one penalty stroke, and the
    // ball is replayed from where it was before this swing.
    state.strokesThisHole += 1;
    state.penalties += 1;
    state.ball = fromBall;
    event.penalty = true;
    event.newLie = fromLie;
  } else {
    const holedHere = newLie === "green" && dist(landing, { x: hole.pin[0], z: hole.pin[1] }) <= HOLE_CUP_RADIUS;
    // A courtesy is only owed on a shot that leaves the hole still to play —
    // a chip-in ends the hole outright, with nothing left to tend to.
    if (!holedHere) {
      if (fromLie === "bunker" && newLie !== "bunker") state.care.pending.rake = { hole: hole.number };
      if (fromLie === "fairway" || fromLie === "rough" || fromLie === "tee") state.care.pending.divot = { hole: hole.number };
      if (newLie === "green" && fromLie !== "green") state.care.pending.repair = { hole: hole.number };
    }
    state.ball = landing;
    state.lastLie = newLie;
    event.holed = holedHere;
  }

  state.events.push(event);
  if (event.holed) advanceHole(state);
  return event;
}

/**
 * A putt on the green. Direction is the pin line plus the aim offset (for a
 * deliberate miss-left/right read); the local slope from fairwayHeight bends
 * the line the rest of the way, the way a real green would.
 */
export function glPutt(state, { power, timing = 0 } = {}) {
  if (state.finished) throw new Error("the round is already finished");
  if (!glCanPutt(state)) throw new Error(`cannot putt from lie "${state.lastLie}"`);

  closeStaleOpportunities(state, "repair");
  // A putt without repairing an open ball mark plays over it — resolved as a
  // miss right here, whether or not the player ever gets around to it.
  if (state.care.pending.repair) careResolve(state, "repair", false);

  const club = CLUB_BY_ID.putter;
  const hole = glCurrentHole(state);
  const p = golfClamp(power, 0, 1);
  const t = golfClamp(timing, -1, 1);
  const rollDist = club.carry * p;

  const yaw = pinDir(hole, state.ball) + state.aimOffset;
  const eps = 0.4;
  const gx = (fairwayHeight(state.ball.x + eps, state.ball.z) - fairwayHeight(state.ball.x - eps, state.ball.z)) / (2 * eps);
  const gz = (fairwayHeight(state.ball.x, state.ball.z + eps) - fairwayHeight(state.ball.x, state.ball.z - eps)) / (2 * eps);
  // The ball breaks downhill: subtract the gradient (uphill direction),
  // scaled by how far it travels, so a longer putt breaks more.
  const breakScale = rollDist * 1.8;
  const lateralRad = t * club.spread * 0.12 + (-gx * Math.cos(yaw) + gz * Math.sin(yaw)) * breakScale * 0.02;

  const fx = Math.sin(yaw), fz = Math.cos(yaw);
  const px = Math.cos(yaw), pz = -Math.sin(yaw);
  const landing = { x: state.ball.x + fx * rollDist + px * lateralRad, z: state.ball.z + fz * rollDist + pz * lateralRad };
  const newLie = fairwayLieAt(landing.x, landing.z);

  state.strokesThisHole += 1;
  const holed = dist(landing, { x: hole.pin[0], z: hole.pin[1] }) <= HOLE_CUP_RADIUS;
  const event = { type: "putt", hole: hole.number, club: "putter", newLie, holed, penalty: false };
  if (holed) {
    state.ball = { x: hole.pin[0], z: hole.pin[1] };
  } else {
    state.ball = landing;
    state.lastLie = newLie === "green" || dist(landing, { x: hole.pin[0], z: hole.pin[1] }) <= HOLE_CUP_RADIUS + GREEN_FRINGE ? "green" : newLie;
  }
  state.events.push(event);
  if (holed) advanceHole(state);
  return event;
}

/** A voluntary drop from a hazard without swinging into it (rare — normally
 *  glSwing resolves water/OB itself). Kept for a UI "take the drop" button
 *  offered while the ball sits in a hazard from a source other than a swing. */
export function glTakeDrop(state) {
  if (state.lastLie !== "water" && state.lastLie !== "out") return false;
  state.penalties += 1;
  state.strokesThisHole += 1;
  state.lastLie = fairwayLieAt(state.ball.x, state.ball.z);
  return true;
}

/** A plain scorecard summary for the HUD and for TrainingRecords. */
export function glSummary(state) {
  return {
    holes: state.scorecard.length,
    totalStrokes: state.totalStrokes,
    totalPar: state.totalPar,
    relative: state.totalStrokes - state.totalPar,
    penalties: state.penalties,
    care: { score: state.care.score, opportunities: state.care.opportunities, met: state.care.met, log: state.care.log.slice() },
    scorecard: state.scorecard.slice(),
  };
}
