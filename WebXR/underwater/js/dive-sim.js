// The Deep — the dive simulation: swimming and ROV piloting over the seabed,
// the qualitative reserve gauge, the buddy line, the ascent lines, daylight
// falling off with depth, the day clock and the job-board deep link. Pure:
// no three.js, no DOM, so tools/check_underwater_game.mjs drives every rule
// here headless, the same way bayworld/js/sim.js does for Bay World.
//
// Nothing here is ever shown to a learner as a limit. The reserve is a
// fraction the HUD draws as a bar and names with a word (dvReserveLabel);
// the depth field steers the light and the scenery and is never rendered as
// a number. Depth, gas, decompression and current limits are per the dive
// plan and the tables the supervisor holds.
import { DEEP_BOUNDS, dvDepthAt, dvFloorY } from "./seabed.js";
import { lkStationLink, LK_TRADES_PAGE } from "../../shared/links.js";

const dvClamp = (v, lo, hi) => (v < lo ? lo : v > hi ? hi : v);

// ------------------------------------------------------------------ swimming

export const DV_SWIM_SPEED = 1.6;     // m/s, a steady fin
export const DV_SPRINT_SPEED = 2.6;   // m/s, a hard fin (costs reserve)
export const DV_VERTICAL_SPEED = 0.9; // m/s, rise or sink
export const DV_SURFACE_Y = -0.6;     // the diver's eye just under the surface
export const DV_FLOOR_CLEARANCE = 1.2; // metres kept above the seabed

/**
 * One step of swimming. `state`: `{ x, y, z, heading }` (y negative below the
 * surface). `input`: `{ forward, strafe, turn, rise, sprint }`, each -1..1
 * (rise is up/down). The diver never passes through the seabed or above the
 * surface, and never leaves DEEP_BOUNDS.
 */
export function dvStepDiver(state, input, dt) {
  const heading = state.heading + dvClamp(input.turn ?? 0, -1, 1) * 2.2 * dt;
  const speed = input.sprint ? DV_SPRINT_SPEED : DV_SWIM_SPEED;
  const fwd = dvClamp(input.forward ?? 0, -1, 1), str = dvClamp(input.strafe ?? 0, -1, 1);
  const mag = Math.hypot(fwd, str) || 1;
  const nf = mag > 1 ? fwd / mag : fwd, ns = mag > 1 ? str / mag : str;
  const fx = Math.sin(heading), fz = Math.cos(heading);
  const rx = Math.cos(heading), rz = -Math.sin(heading);
  const dx = (fx * nf + rx * ns) * speed * dt;
  const dz = (fz * nf + rz * ns) * speed * dt;
  const x = dvClamp(state.x + dx, DEEP_BOUNDS.minX + 1, DEEP_BOUNDS.maxX - 1);
  const z = dvClamp(state.z + dz, DEEP_BOUNDS.minZ + 1, DEEP_BOUNDS.maxZ - 1);
  const floor = dvFloorY(x, z) + DV_FLOOR_CLEARANCE;
  const y = dvClamp(state.y + dvClamp(input.rise ?? 0, -1, 1) * DV_VERTICAL_SPEED * dt, floor, DV_SURFACE_Y);
  return { x, y: Math.min(y, DV_SURFACE_Y), z, heading, speed: Math.hypot(dx, dz) / (dt || 1), exertion: input.sprint ? 1 : Math.hypot(nf, ns) * 0.5 };
}

// ---------------------------------------------------------------------- ROV

export const DV_ROV_SPEED = 3.2;      // m/s
export const DV_ROV_VERTICAL = 1.4;   // m/s
export const DV_TETHER_RANGE = 140;   // metres of tether from the launch point

/**
 * One step of ROV piloting. `state`: `{ x, y, z, heading, tether: [x, z] }`.
 * `input`: `{ throttle, steer, rise }`. The ROV keeps to its tether: a move
 * that would take it past DV_TETHER_RANGE from its launch point is refused
 * and `taut` is set, the way a real tether stops a vehicle short rather than
 * letting it snag.
 */
export function dvStepRov(state, input, dt) {
  const heading = state.heading + dvClamp(input.steer ?? 0, -1, 1) * 1.8 * dt;
  const throttle = dvClamp(input.throttle ?? 0, -1, 1);
  const fx = Math.sin(heading), fz = Math.cos(heading);
  let x = state.x + fx * throttle * DV_ROV_SPEED * dt, z = state.z + fz * throttle * DV_ROV_SPEED * dt;
  let taut = false;
  const [tx, tz] = state.tether ?? [state.x, state.z];
  if (Math.hypot(x - tx, z - tz) > DV_TETHER_RANGE) { x = state.x; z = state.z; taut = true; }
  x = dvClamp(x, DEEP_BOUNDS.minX + 1, DEEP_BOUNDS.maxX - 1);
  z = dvClamp(z, DEEP_BOUNDS.minZ + 1, DEEP_BOUNDS.maxZ - 1);
  const floor = dvFloorY(x, z) + 0.8;
  const y = dvClamp(state.y + dvClamp(input.rise ?? 0, -1, 1) * DV_ROV_VERTICAL * dt, floor, DV_SURFACE_Y);
  return { ...state, x, y, z, heading, speed: Math.abs(throttle) * DV_ROV_SPEED, taut, tether: [tx, tz] };
}

// ------------------------------------------------------------------ reserve

/** Seconds a full reserve lasts at rest near the surface. Every dive in this
 *  game is generous by design — the gauge exists to be watched, not raced. */
export const DV_RESERVE_SECONDS = 14 * 60;

/**
 * The reserve, a fraction 0..1 that shrinks with time, faster with depth and
 * with exertion, and refills at the surface. `depthFrac` is the diver's
 * depth as a fraction of the field's range (0 at the surface), `exertion`
 * 0..1 from dvStepDiver. Never a number a learner sees: the HUD draws it as
 * a bar and names it with dvReserveLabel().
 */
export function dvReserveStep(reserve, { depthFrac = 0, exertion = 0, atSurface = false } = {}, dt) {
  if (atSurface) return Math.min(1, reserve + dt / 20);
  const rate = (1 / DV_RESERVE_SECONDS) * (1 + dvClamp(depthFrac, 0, 1) * 1.6 + dvClamp(exertion, 0, 1) * 0.8);
  return Math.max(0, reserve - rate * dt);
}

export const DV_RESERVE_LABELS = ["full", "good", "half", "low", "turn back"];

/** A word for the bar, never a figure. */
export function dvReserveLabel(reserve) {
  if (reserve > 0.85) return "full";
  if (reserve > 0.55) return "good";
  if (reserve > 0.35) return "half";
  if (reserve > 0.15) return "low";
  return "turn back";
}

// -------------------------------------------------------------------- light

/** The depth band the shared deepLighting() takes. */
export function dvLightBand(depth) {
  if (depth < 12) return "shallow";
  if (depth < 35) return "mid";
  return "deep";
}

/** How much of the day's light reaches `depth` at `hours` (0-24): a plain
 *  exponential fall-off under a day curve, 0..1. */
export function dvDaylightFactor(depth, hours) {
  const t = ((hours % 24) + 24) % 24;
  const day = t >= 6 && t <= 18 ? Math.sin(Math.PI * (t - 6) / 12) : 0;
  return Math.max(0.03, day) * Math.exp(-Math.max(0, depth) / 22);
}

// ------------------------------------------------------------------- buddy

export const DV_BUDDY_LINE = 6;      // metres of buddy line
export const DV_BUDDY_FOLLOW = 2.4;  // where the buddy settles, behind and left

/** The buddy swims to a point behind-left of the diver, closing at the
 *  diver's own speed so a slack line stays slack. */
export function dvStepBuddy(buddy, diver, dt) {
  const fx = Math.sin(diver.heading), fz = Math.cos(diver.heading);
  const rx = Math.cos(diver.heading), rz = -Math.sin(diver.heading);
  const tx = diver.x - fx * DV_BUDDY_FOLLOW - rx * 1.4, tz = diver.z - fz * DV_BUDDY_FOLLOW - rz * 1.4, ty = diver.y + 0.3;
  const k = Math.min(1, dt * 2.2);
  const x = buddy.x + (tx - buddy.x) * k, z = buddy.z + (tz - buddy.z) * k, y = buddy.y + (ty - buddy.y) * k;
  return { x, y, z, heading: Math.atan2(diver.x - x, diver.z - z) };
}

/** `{ length, taut }` — the buddy line's current length and whether it has
 *  gone taut (the buddy fell behind further than the line allows). */
export function dvBuddyLine(diver, buddy) {
  const length = Math.hypot(diver.x - buddy.x, diver.y - buddy.y, diver.z - buddy.z);
  return { length, taut: length > DV_BUDDY_LINE };
}

// ------------------------------------------------------------- ascent lines

/** Every site's ascent line: a vertical line from the seabed to the surface
 *  beside the site pad, `{ siteId, x, z, bottomY, topY: 0 }`. */
export function dvAscentLines(sites) {
  return sites.map((s) => ({ siteId: s.id, x: s.position[0] + 3, z: s.position[2] + 3, bottomY: dvFloorY(s.position[0] + 3, s.position[2] + 3), topY: 0 }));
}

/** The nearest ascent line within `radius`, or null. */
export function dvNearestAscentLine(x, z, lines, radius = 8) {
  let best = null, bestD = radius;
  for (const l of lines) { const d = Math.hypot(x - l.x, z - l.z); if (d <= bestD) { bestD = d; best = l; } }
  return best;
}

// ------------------------------------------------------------------- clock

/** Real seconds for one full 24-hour cycle. */
export const DV_DAY_SECONDS = 24 * 60;

export function dvAdvanceClock(hours, dtSeconds, daySeconds = DV_DAY_SECONDS) {
  const perSecond = 24 / daySeconds;
  return ((hours + dtSeconds * perSecond) % 24 + 24) % 24;
}

// ------------------------------------------------------------------ helpers

/** `../smartcity/dist/smartcity-x.html?sim=<id>&from=underwater` — the one
 *  deep link every job board launches by. */
export function dvMissionLink(site, { base = "../smartcity/dist/smartcity-x.html", trades = LK_TRADES_PAGE, station = null, page = null } = {}) {
  const sim = station ?? site.stations?.[0];
  if (!sim) throw new Error(`site "${site.id}" has no station to launch`);
  // `page` (this world's own path) is the way home: `&return=<page>#site=<id>` (docs/interop.md).
  // A Trade Skills room opens in the Trade Skills app (shared/links.js).
  return lkStationLink(sim, { runner: base, trades, from: "underwater", page, siteId: site.id });
}

/** The nearest site or landmark to (x, z) within `radius`, or null. */
export function dvNearestPlace(x, z, places, radius = 14) {
  let best = null, bestD = radius;
  for (const p of places) {
    const pos = p.position ? [p.position[0], p.position[2]] : p.center;
    if (!pos) continue;
    const d = Math.hypot(x - pos[0], z - pos[1]);
    if (d <= bestD) { bestD = d; best = p; }
  }
  return best;
}

/** The diver's depth as a fraction of the field's own range — for the
 *  reserve rate and the light, never for the HUD. */
export function dvDepthFraction(y, range) { return dvClamp(-y / range[1], 0, 1); }

export { dvDepthAt };
