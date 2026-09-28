// Bay World — the simulation: on-foot and vehicle physics, ambient traffic,
// the day/night clock, weather selection and pedestrians. Pure: no three.js,
// no DOM, so tools/check_bayworld_game.mjs drives every rule here headless at
// any time step, the same way race/js/sim.js and fairway/js/golf.js do for
// their own apps.
import { BAY_BOUNDS, BAY_ROADS, bwZoneAt, bwBuildings, bwJunctions } from "./city.js";
import { lkStationLink, LK_TRADES_PAGE } from "../../shared/links.js";

const bwClamp = (v, lo, hi) => (v < lo ? lo : v > hi ? hi : v);

// ------------------------------------------------------------------ on foot

export const BW_WALK_SPEED = 4.2;   // m/s
export const BW_RUN_SPEED = 7.4;    // m/s

/**
 * One step of on-foot movement. `input`: `{ forward, strafe, turn, run }`,
 * each -1..1 (turn is a yaw rate, the rest are movement relative to the
 * player's own facing — forward/back and strafe left/right, exactly what
 * WASD and a touch stick both produce). Free-roam: no road or building
 * confines a walking player, only the map's own edge does.
 */
export function bwStepPlayer(state, input, dt) {
  const heading = state.heading + bwClamp(input.turn ?? 0, -1, 1) * 2.6 * dt;
  const speed = input.run ? BW_RUN_SPEED : BW_WALK_SPEED;
  const fwd = bwClamp(input.forward ?? 0, -1, 1), str = bwClamp(input.strafe ?? 0, -1, 1);
  const mag = Math.hypot(fwd, str) || 1;
  const nf = mag > 1 ? fwd / mag : fwd, ns = mag > 1 ? str / mag : str;
  const fx = Math.sin(heading), fz = Math.cos(heading);
  const rx = Math.cos(heading), rz = -Math.sin(heading);
  const dx = (fx * nf + rx * ns) * speed * dt;
  const dz = (fz * nf + rz * ns) * speed * dt;
  const x = bwClamp(state.x + dx, BAY_BOUNDS.minX + 1, BAY_BOUNDS.maxX - 1);
  const z = bwClamp(state.z + dz, BAY_BOUNDS.minZ + 1, BAY_BOUNDS.maxZ - 1);
  return { x, z, heading, speed: Math.hypot(dx, dz) / (dt || 1) };
}

// ------------------------------------------------------------------ vehicles
//
// Four fleet vehicles, adapted from the race app's own handling model to a
// city street: a hard speed cap (nobody in this app ever exceeds it, whatever
// a vehicle's own top speed would allow) and no drift, boost or item —
// steering grip falls with speed instead, and lane-keeping assist is off, so
// nothing corrects a bad line for the player. `reputation` mirrors career.js's
// own BW_VEHICLE_UNLOCKS thresholds.

export const BW_SPEED_CAP = 22; // m/s (about 79 km/h) — the city-wide cap

export const BW_VEHICLES = [
  { id: "pool-car", name: "Pool Car", builder: "sedan", top: 18, accel: 9, turn: 2.6, dims: [2.23, 1.45, 4.92], reputation: 0 },
  { id: "pickup", name: "Pickup", builder: "pickup", top: 19, accel: 8, turn: 2.2, dims: [2.39, 1.93, 5.92], reputation: 30 },
  { id: "box-truck", name: "Box Truck", builder: "boxTruck", top: 16, accel: 6, turn: 1.6, dims: [2.49, 2.6, 7.0], reputation: 80 },
  { id: "class-a-tractor", name: "Class A Tractor", builder: "semiTractor", top: 15, accel: 5, turn: 1.1, dims: [3.02, 3.95, 6.86], reputation: 160 },
];
const BW_VEHICLES_BY_ID = new Map(BW_VEHICLES.map((v) => [v.id, v]));
export function bwVehicleParams(id) {
  const v = BW_VEHICLES_BY_ID.get(id);
  if (!v) throw new Error(`unknown vehicle id: ${id}`);
  return v;
}

// The city's own buildings, computed once at full detail regardless of what
// is actually rendered — a vehicle collides with the same city no matter how
// far off a distant zone is drawn.
const BW_COLLISION_BUILDINGS = bwBuildings("high", null);
const BW_VEHICLE_HALF_WIDTH = 1.3;

/** The building (if any) a circle of the given radius at (x, z) overlaps. */
export function bwBuildingAt(x, z, halfWidth = BW_VEHICLE_HALF_WIDTH) {
  for (const b of BW_COLLISION_BUILDINGS) {
    if (Math.abs(x - b.x) < b.w / 2 + halfWidth && Math.abs(z - b.z) < b.d / 2 + halfWidth) return b;
  }
  return null;
}

/**
 * One step of vehicle physics. `state`: `{ x, z, heading, speed, vehicleId }`.
 * `input`: `{ throttle, steer, brake }` from shared/input.js's own
 * `driveInputFrom()` — throttle/steer -1..1, brake a bool. Blocked by a
 * building or a prop (bwBuildingAt): the move is refused and speed sheds hard,
 * the way hitting something solid should feel, never a wall the vehicle slides
 * along.
 */
export function bwStepVehicle(state, input, dt) {
  const veh = bwVehicleParams(state.vehicleId);
  const top = Math.min(veh.top, BW_SPEED_CAP);
  const throttle = bwClamp(input.throttle ?? 0, -1, 1);
  let speed = state.speed ?? 0;
  const targetSpeed = throttle >= 0 ? throttle * top : throttle * top * 0.5;
  if (speed < targetSpeed) speed = Math.min(targetSpeed, speed + veh.accel * dt);
  else speed = Math.max(targetSpeed, speed - veh.accel * 1.6 * dt);
  if (input.brake) speed = speed > 0 ? Math.max(0, speed - veh.accel * 2.4 * dt) : Math.min(0, speed + veh.accel * 2.4 * dt);

  const steer = bwClamp(input.steer ?? 0, -1, 1);
  // Grip falls off with speed rather than any drift mechanic: near a stop the
  // wheel turns the vehicle fast (a parking-lot pivot); at top speed it turns
  // it gently, the way a real cap on lock-to-lock steering feel would.
  const gripFactor = 1 - 0.55 * Math.min(1, Math.abs(speed) / top);
  const heading = state.heading + steer * veh.turn * gripFactor * Math.sign(speed || 1) * dt;

  const fx = Math.sin(heading), fz = Math.cos(heading);
  let x = state.x + fx * speed * dt, z = state.z + fz * speed * dt;
  let collided = false;
  if (bwBuildingAt(x, z)) {
    collided = true;
    x = state.x; z = state.z;
    speed *= -0.15;
  }
  x = bwClamp(x, BAY_BOUNDS.minX + 1, BAY_BOUNDS.maxX - 1);
  z = bwClamp(z, BAY_BOUNDS.minZ + 1, BAY_BOUNDS.maxZ - 1);
  return { ...state, x, z, heading, speed, collided };
}

/** `../smartcity/index.html?sim=<id>&from=bayworld` — the one deep link
 *  every mission launches by, or `../trades/index.html?room=<id>&from=bayworld`
 *  when the station is a Trade Skills room (shared/links.js). `station`
 *  defaults to the site's first one. `page` (this world's own path) adds the
 *  way home the runner's "Back to Bay World" button takes:
 *  `&return=<page>#site=<id>` (docs/interop.md). */
export function bwMissionLink(site, { base = "../smartcity/index.html", trades = LK_TRADES_PAGE, station = null, page = null } = {}) {
  const sim = station ?? site.stations?.[0];
  if (!sim) throw new Error(`site "${site.id}" has no station to launch`);
  return lkStationLink(sim, { runner: base, trades, from: "bayworld", page, siteId: site.id });
}

// -------------------------------------------------------------------- traffic

// BAY1's whole road network (a freeway spine, its arterial branches, the
// waterfront boulevard and the hill switchback) — every one a real through
// road, so every one carries ambient traffic; none of them loop.
const BW_TRAFFIC_ROADS = BAY_ROADS;
const BW_JUNCTIONS = bwJunctions();
export const BW_JUNCTION_RADIUS = 7;
export const BW_JUNCTION_PAUSE = 1.4; // seconds an ambient vehicle holds at a crossing

function roadPoints(road) { return road.loop ? [...road.points, road.points[0]] : road.points; }
function roadLength(road) {
  const pts = roadPoints(road);
  let len = 0;
  for (let i = 0; i < pts.length - 1; i++) len += Math.hypot(pts[i + 1][0] - pts[i][0], pts[i + 1][1] - pts[i][1]);
  return len;
}
const BW_ROAD_LENGTHS = new Map(BW_TRAFFIC_ROADS.map((r) => [r.id, roadLength(r)]));

/** Position and heading at arc-length `s` along `road` (wrapping for a loop,
 *  clamped for an open road). */
export function bwRoadPointAt(road, s) {
  const pts = roadPoints(road);
  const total = BW_ROAD_LENGTHS.get(road.id) ?? roadLength(road);
  let d = road.loop ? ((s % total) + total) % total : bwClamp(s, 0, total);
  for (let i = 0; i < pts.length - 1; i++) {
    const [ax, az] = pts[i], [bx, bz] = pts[i + 1];
    const segLen = Math.hypot(bx - ax, bz - az) || 1e-6;
    if (d <= segLen || i === pts.length - 2) {
      const t = bwClamp(d / segLen, 0, 1);
      const x = ax + (bx - ax) * t, z = az + (bz - az) * t;
      const heading = Math.atan2(bx - ax, bz - az);
      return { x, z, heading };
    }
    d -= segLen;
  }
  return { x: pts[0][0], z: pts[0][1], heading: 0 };
}

/** A fresh ambient-traffic vehicle on `roadId` at arc-length `s0`. */
export function bwCreateTrafficVehicle(id, roadId, s0 = 0, dir = 1, speed = 6) {
  return { id, roadId, s: s0, dir, speed, cruiseSpeed: speed, waitTimer: 0, atJunction: null };
}

/** One step of every ambient-traffic vehicle: follows its own road's
 *  centreline, reverses at the ends of an open road, loops on the ring road,
 *  and pauses BW_JUNCTION_PAUSE seconds the first time it enters a crossing
 *  shared with another traffic road (never a second time for that same
 *  crossing while still inside it) — a plain, deterministic stand-in for a
 *  stop sign. Returns the same array, mutated in place, as x/z/heading. */
export function bwStepTraffic(vehicles, dt) {
  for (const v of vehicles) {
    const road = BW_TRAFFIC_ROADS.find((r) => r.id === v.roadId);
    if (!road) continue;
    const total = BW_ROAD_LENGTHS.get(road.id);
    const here = bwRoadPointAt(road, v.s);
    const junction = BW_JUNCTIONS.find((j) => Math.hypot(here.x - j.point[0], here.z - j.point[1]) <= BW_JUNCTION_RADIUS);

    if (junction) {
      if (v.atJunction !== junction) { v.atJunction = junction; v.waitTimer = BW_JUNCTION_PAUSE; }
    } else if (v.atJunction) {
      v.atJunction = null;
    }

    if (v.waitTimer > 0) {
      v.waitTimer -= dt;
      v.speed = Math.max(0, v.speed - v.cruiseSpeed * 3 * dt);
    } else {
      v.speed = Math.min(v.cruiseSpeed, v.speed + v.cruiseSpeed * 1.5 * dt);
    }

    let s = v.s + v.dir * v.speed * dt;
    if (road.loop) {
      s = ((s % total) + total) % total;
    } else if (s < 0 || s > total) {
      v.dir *= -1;
      s = bwClamp(s, 0, total);
    }
    v.s = s;
    const p = bwRoadPointAt(road, v.s);
    v.x = p.x; v.z = p.z;
    v.heading = v.dir >= 0 ? p.heading : p.heading + Math.PI;
  }
  return vehicles;
}

/** A deterministic starter fleet: two vehicles per traffic road, spread
 *  evenly around it, opposite directions. */
export function bwSpawnTraffic(perRoad = 2) {
  const out = [];
  let n = 0;
  for (const road of BW_TRAFFIC_ROADS) {
    const total = BW_ROAD_LENGTHS.get(road.id);
    for (let i = 0; i < perRoad; i++) {
      n += 1;
      out.push(bwCreateTrafficVehicle(`traffic-${n}`, road.id, (total / perRoad) * i, i % 2 === 0 ? 1 : -1, 5 + (i % 3)));
    }
  }
  return out;
}

// ---------------------------------------------------------------- pedestrians

const BW_PED_SPEED = 1.3;

/** A pedestrian that wanders a small loop around its own spawn point —
 *  deterministic (driven by an ever-advancing phase, never Math.random()), so
 *  the same time step always lands in the same place. */
export function bwCreatePedestrian(id, x, z, radius = 9) {
  return { id, x, z, homeX: x, homeZ: z, radius, phase: (x * 13 + z * 7) % (Math.PI * 2), heading: 0 };
}

export function bwStepPedestrian(p, dt) {
  const phase = p.phase + dt * 0.5;
  const x = p.homeX + Math.cos(phase) * p.radius * 0.5;
  const z = p.homeZ + Math.sin(phase * 1.3) * p.radius * 0.5;
  const heading = Math.atan2(x - p.x, z - p.z) || p.heading;
  return { ...p, x, z, heading, phase };
}

// ------------------------------------------------------------- day and weather

/** Real seconds for one full 24-hour cycle. Twenty minutes: long enough that
 *  a mission does not blur day into night, short enough that night always
 *  comes around inside one sitting. */
export const BW_DAY_SECONDS = 20 * 60;

export function bwAdvanceClock(hours, dtSeconds, daySeconds = BW_DAY_SECONDS) {
  const perSecond = 24 / daySeconds;
  return ((hours + dtSeconds * perSecond) % 24 + 24) % 24;
}

// Mirrors WEATHER_KINDS in ../../shared/weather.js, which is what actually
// renders each one (world.js imports it there). Duplicated here as bare
// strings only, so this pure module never pulls in a copy of three.js from a
// CDN just to name eight words.
export const BW_WEATHER_KINDS = ["clear", "overcast", "rain", "fog", "wind", "storm", "smoke", "heat-haze"];

function bwHash(n) { const x = Math.sin(n * 12.9898) * 43758.5453; return x - Math.floor(x); }

/** The weather for a given hour bucket of a given day — deterministic, and
 *  clear more often than not, the way an actual forecast mostly is. */
export function bwWeatherFor(hours, day = 0) {
  const r = bwHash(Math.floor(hours) + day * 24);
  if (r < 0.55) return "clear";
  if (r < 0.75) return "overcast";
  if (r < 0.85) return "fog";
  if (r < 0.93) return "rain";
  if (r < 0.97) return "wind";
  return "storm";
}

// ------------------------------------------------------------------- helpers

/** The nearest site or landmark to a point within `radius`, or null — what
 *  the HUD's "press E" prompt and the quest engine's own proximity checks
 *  both key off. `places` is any list of `{ id, position | center }`. */
export function bwNearestPlace(x, z, places, radius = 14) {
  let best = null, bestD = radius;
  for (const p of places) {
    const pos = p.position ? [p.position[0], p.position[2]] : p.center;
    if (!pos) continue;
    const d = Math.hypot(x - pos[0], z - pos[1]);
    if (d <= bestD) { bestD = d; best = p; }
  }
  return best;
}

export { bwZoneAt };
