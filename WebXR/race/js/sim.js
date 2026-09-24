// Night Highway Circuit — the simulation.
//
// The platform's Easter egg: an arcade racer driven in the fleet the stations
// already use. This module is the whole game with no pixels in it — vehicle
// stats and engine classes, the physics (throttle, brake, drift and mini
// boost, walls, collisions), the AI drivers, the six construction-themed
// items, boost pads and item boxes, civilian traffic and the track hazards,
// laps and positions, the safety bonus, Grand Prix points, the unlock ladder
// and the time-trial ghost. It is pure: no three.js and no DOM, so
// tools/check_race.mjs runs whole races headless at any time step, and the
// two-tab mode can run it in one tab and only draw it in the other.
//
// Every name, item and rule here is original to this platform.
import {
  rcFrame, rcPointAt, rcProject, rcAhead, rcInGrid, rcWrapAngle, rcIndexAt,
} from "./track.js";

// ------------------------------------------------------------------ tables

/**
 * The eight racers. `dims` is the real vehicle's [width, height, length] from
 * the fleet and equipment budgets; `scale` shrinks or grows it to a kart-sized
 * racer (about five metres long) so a bus and a skid steer can share a grid.
 * Stats run 1–5 and every card sums to ten.
 */
export const RC_VEHICLES = [
  { id: "sedan", name: "Commuter", builder: "sedan", dims: [2.23, 1.45, 4.92], scale: 1.0, stats: { speed: 4, handling: 4, weight: 2 }, colour: 0x2f6fd8, blurb: "The all-rounder. Quick off the line and tidy in the corners, but light in a shove." },
  { id: "pickup", name: "Crew Cab", builder: "pickup", dims: [2.39, 1.93, 5.92], scale: 0.88, stats: { speed: 4, handling: 3, weight: 3 }, colour: 0xd8412f, blurb: "Plenty of pull and a bit of heft. Holds a line through traffic." },
  { id: "semi", name: "Bobtail", builder: "semiTractor", dims: [3.02, 3.95, 6.86], scale: 0.78, stats: { speed: 5, handling: 1, weight: 4 }, colour: 0x2a9a5a, blurb: "A tractor with no trailer: the highest top speed on the grid, and it corners like a tractor." },
  { id: "forklift", name: "Counterweight", builder: "forkliftCounterbalance", dims: [1.12, 2.28, 3.57], scale: 1.35, stats: { speed: 2, handling: 4, weight: 4 }, colour: 0xf2b21c, blurb: "Slow, but the counterweight makes it the one nobody pushes around." },
  { id: "skidsteer", name: "Skid Pup", builder: "skidSteer", dims: [1.83, 2.07, 3.31], scale: 1.45, stats: { speed: 2, handling: 5, weight: 3 }, colour: 0xf07a1c, blurb: "Turns on the spot. The best in the chicanes and the worst on the straights." },
  { id: "dump", name: "Tri-Axle", builder: "dumpTruck", dims: [3.02, 3.26, 9.57], scale: 0.58, stats: { speed: 3, handling: 2, weight: 5 }, colour: 0xc9c2b0, blurb: "Heaviest on the grid. Shrugs off a horn blast and a bump from anything." },
  { id: "bucket", name: "Lineman", builder: "bucketTruck", dims: [3.3, 3.44, 9.6], scale: 0.58, stats: { speed: 3, handling: 3, weight: 4 }, colour: 0xe8e8e2, blurb: "Balanced and sturdy, with the boom stowed for the race." },
  { id: "bus", name: "Night Owl", builder: "busTransit", dims: [3.3, 3.26, 12.42], scale: 0.46, stats: { speed: 4, handling: 1, weight: 5 }, colour: 0x7a4fd0, blurb: "The last bus home. Long, heavy and quicker than it looks." },
];

/** Engine classes: the difficulty ladder. */
export const RC_CLASSES = [
  { id: "apprentice", name: "Apprentice", speedMul: 0.86, aiSkill: 0.7, traffic: 0.6, badge: "APPRENTICE CLASS", blurb: "Gentle pace, forgiving drivers, light traffic. Open from the start." },
  { id: "journey", name: "Journey", speedMul: 1.0, aiSkill: 0.86, traffic: 1.0, badge: "JOURNEY CLASS", blurb: "Full speed, sharper drivers, normal traffic. Finish an Apprentice Grand Prix in the top three to open it." },
  { id: "master", name: "Master", speedMul: 1.14, aiSkill: 1.0, traffic: 1.4, badge: "MASTER CLASS", blurb: "Flat out, drivers who never lift, heavy traffic. Finish a Journey Grand Prix in the top three to open it." },
];

/** The six items. Construction-themed and original. */
export const RC_ITEMS = [
  { id: "cones", name: "Cone Drop", blurb: "Drops three traffic cones behind you. Anyone who clips one spins." },
  { id: "paint", name: "Wet-Paint Slick", blurb: "Leaves a slick of wet line paint behind you. No grip on it." },
  { id: "hardhat", name: "Hard-Hat Shield", blurb: "Eight seconds of protection that stops the next hit." },
  { id: "horn", name: "Air-Horn Shockwave", blurb: "Everyone close by is blown aside and slowed; traffic swerves." },
  { id: "tow", name: "Tow-Strap Grab", blurb: "Hooks the racer ahead, reels you in and slingshots you past." },
  { id: "flatbed", name: "Flatbed Boost", blurb: "A long, strong boost." },
];
const RC_ITEM_IDS = RC_ITEMS.map((i) => i.id);

/** Grand Prix points, first to eighth. */
export const RC_POINTS = [10, 8, 6, 5, 4, 3, 2, 1];
/** The one localStorage key that holds unlocks, Grand Prix bests and ghosts. */
export const RC_STORAGE_KEY = "night-highway-circuit-v1";

/** Civilian and hazard vehicles: [width, length] in metres at the scale drawn. */
export const RC_TRAFFIC_DIMS = {
  sedan: [2.23, 4.92], tractorTrailer: [3.02, 20.71], yardHustler: [2.91, 5.61],
  pickup: [2.39, 5.92], dumpTruck: [3.02, 9.57], bucketTruck: [3.3, 9.6],
  straddleCarrier: [5.2, 9.5], haulTruck: [4.8, 15.3],
};

const RC_NAMES = ["Rosa", "Dev", "Mika", "Tomas", "Ines", "Kofi", "Lena", "Arlo", "Priya", "Sol", "Wren", "Otto"];

// ------------------------------------------------------------------ helpers

function rcRng(seed) {
  let a = (seed >>> 0) || 0x9e3779b9;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rcClamp = (v, lo, hi) => (v < lo ? lo : v > hi ? hi : v);

/** Physics parameters from a stat card and a class. */
export function rcParams(vehicle, cls) {
  const { speed, handling, weight } = vehicle.stats;
  const k = cls?.speedMul ?? 1;
  const [w, , l] = vehicle.dims;
  return {
    top: (24 + speed * 2.1) * k,
    accel: (8 + (6 - weight) * 1.3 + (5 - speed) * 0.5) * (0.85 + 0.15 * k),
    turn: 1.4 + handling * 0.17,
    grip: 3.6 + handling * 1.05,
    mass: 0.8 + weight * 0.45,
    w: w * vehicle.scale, l: l * vehicle.scale,
  };
}

/** The circles a racer collides with: one or two along its length. */
function rcShape(r) {
  const rad = r.p.w * 0.55;
  const off = Math.max(0, r.p.l / 2 - rad);
  if (off < 0.4) return [[r.x, r.z, rad]];
  const sx = Math.sin(r.h) * off, sz = Math.cos(r.h) * off;
  return [[r.x + sx, r.z + sz, rad], [r.x - sx, r.z - sz, rad]];
}

/** Circle against an oriented box. Returns null or the push-out. */
function rcCircleBox(cx, cz, rad, bx, bz, bh, hw, hl) {
  const s = Math.sin(bh), c = Math.cos(bh);
  const dx = cx - bx, dz = cz - bz;
  const along = dx * s + dz * c, side = dx * c - dz * s;
  const ca = rcClamp(along, -hl, hl), cs = rcClamp(side, -hw, hw);
  const ea = along - ca, es = side - cs;
  const dist2 = ea * ea + es * es;
  if (dist2 >= rad * rad) return null;
  let nx, nz, pen;
  if (dist2 > 1e-9) {
    const d = Math.sqrt(dist2);
    const la = ea / d, ls = es / d;
    nx = la * s + ls * c; nz = la * c - ls * s; pen = rad - d;
  } else {
    // Centre inside the box: push out along the nearer face.
    const pa = hl - Math.abs(along), ps = hw - Math.abs(side);
    if (pa < ps) { const g = Math.sign(along) || 1; nx = g * s; nz = g * c; pen = pa + rad; }
    else { const g = Math.sign(side) || 1; nx = g * c; nz = -g * s; pen = ps + rad; }
  }
  return { nx, nz, pen };
}

// ------------------------------------------------------------------ setup

/**
 * A new race. `racers` is a list of { vehicle (id), human, name, player };
 * the grid is filled with AI up to `field` (8). `mode` is "race" (single race
 * or a Grand Prix round), "timetrial" (one racer, no traffic, no items) or
 * "demo" (all AI).
 */
export function rcCreateRace({ track, cls, laps = 3, racers = [], field = 8, mode = "race", seed = 1, traffic = true, items = true }) {
  const rng = rcRng(seed);
  const tr = track;
  const klass = typeof cls === "string" ? RC_CLASSES.find((c) => c.id === cls) : (cls ?? RC_CLASSES[1]);
  const race = {
    track: tr, cls: klass, laps, mode, seed, rng, t: 0, count: 3.5, phase: "countdown",
    racers: [], traffic: [], crossings: [], statics: [], slicks: [], drops: [], boxes: [], events: [],
    finished: 0, endAt: null, nextId: 1, items: items && mode !== "timetrial",
  };
  const list = racers.slice(0, field).map((r) => ({ ...r }));
  if (mode !== "timetrial") {
    const taken = new Set(list.map((r) => r.vehicle));
    const pool = RC_VEHICLES.filter((v) => !taken.has(v.id));
    while (list.length < field) {
      const v = pool.length ? pool.splice(Math.floor(rng() * pool.length), 1)[0] : RC_VEHICLES[Math.floor(rng() * RC_VEHICLES.length)];
      list.push({ vehicle: v.id, human: false });
    }
  }
  const names = RC_NAMES.slice();
  list.forEach((spec, k) => {
    const vehicle = RC_VEHICLES.find((v) => v.id === spec.vehicle) ?? RC_VEHICLES[0];
    const row = Math.floor(k / tr.grid.cols), col = k % tr.grid.cols;
    const s = tr.L - tr.grid.back - row * tr.grid.spacing - col * 3.5;
    const d = (tr.grid.cols === 1 ? 0 : (col === 0 ? 1 : -1) * tr.grid.gap / 2);
    const pt = rcPointAt(tr, s, d);
    const name = spec.name ?? names.splice(Math.floor(rng() * names.length), 1)[0] ?? `Racer ${k + 1}`;
    race.racers.push({
      id: k, name, vehicle: vehicle.id, veh: vehicle, human: !!spec.human, player: spec.player ?? null, remote: !!spec.remote,
      p: rcParams(vehicle, klass), grid: k,
      x: pt.x, y: pt.y, z: pt.z, h: pt.head, m: pt.head, v: 0, s, d, idx: rcIndexAt(tr, s), prevS: s,
      crossings: 0, half: false, lapStart: 0, lapTimes: [], bestLap: null, finishT: null, place: k + 1, progress: s - tr.L,
      item: null, rolling: null, rollT: 0, itemsUsed: 0, shieldT: 0, boostT: 0, spinT: 0, spinDir: 1, slickT: 0, towT: 0, towTarget: null,
      drifting: false, driftDir: 0, driftCharge: 0, driftHeld: false, hopT: 0,
      signal: null, lookT: -99, safety: 0, safetyT: -99, stuckT: 0, wrongT: 0, wrong: false, thrAt: null, startBoost: false,
      padLast: -1, padT: -99, bumpT: 0,
      ai: { skill: klass.aiSkill * (0.93 + rng() * 0.1), lane: d, pref: (rng() - 0.5) * 0.6, think: rng() * 0.25, pending: null, itemT: 0, driftT: 0, lookFor: 0, reverseT: 0 },
    });
  });
  // Item boxes.
  for (const b of tr.boxes) {
    const pt = rcPointAt(tr, b.s, b.d);
    race.boxes.push({ s: b.s, d: b.d, x: pt.x, y: pt.y, z: pt.z, t: 0 });
  }
  // Hazards from the track's table.
  for (const hz of tr.hazards) {
    if (hz.kind === "traffic" && traffic && mode !== "timetrial") rcSpawnTraffic(race, hz, rng);
    else if (hz.kind === "crossing") {
      const [w, l] = RC_TRAFFIC_DIMS[hz.vehicle] ?? [5, 10];
      race.crossings.push({ kind: hz.vehicle, s: hz.s, span: hz.span ?? tr.half + 14, speed: hz.speed ?? 5, wait: hz.wait ?? 5,
        pos: -(hz.span ?? tr.half + 14), dir: 1, waitT: hz.phase ?? 0, w, l, x: 0, y: 0, z: 0, h: 0, warn: false });
    } else if (hz.kind === "booths") {
      for (const d of hz.ds) rcAddStatic(race, { kind: "booth", s: hz.s, d, w: hz.w ?? 2.4, l: hz.len ?? 5, solid: true });
    } else if (hz.kind === "parked") {
      const [w, l] = RC_TRAFFIC_DIMS[hz.vehicle] ?? [3, 9];
      rcAddStatic(race, { kind: "parked", vehicle: hz.vehicle, s: hz.s, d: hz.d, w, l, solid: true });
    } else if (hz.kind === "trench") {
      for (let s = hz.s0; rcAhead(tr, s, hz.s1) > 0; s += 5) rcAddStatic(race, { kind: "trench", s, d: hz.d, w: hz.w ?? 2.6, l: 5, solid: true });
    } else if (hz.kind === "cones") {
      const span = rcAhead(tr, hz.s0, hz.s1);
      const step = hz.spacing ?? 6;
      for (let a = 0; a <= span; a += step) {
        const f = a / span;
        // A taper at each end: cones walk in from the edge over `taper` of the run.
        const tp = hz.taper ?? 0;
        let d = hz.d;
        if (tp > 0) {
          const edge = Math.sign(hz.d) * (tr.half - 0.6);
          const k = f < tp ? f / tp : f > 1 - tp ? (1 - f) / tp : 1;
          d = edge + (hz.d - edge) * k;
        }
        rcAddStatic(race, { kind: "cone", s: hz.s0 + a, d, w: 0.5, l: 0.5, solid: false });
      }
    } else if (hz.kind === "slick") {
      race.slicks.push({ s0: hz.s0, s1: hz.s1, d: hz.d ?? 0, w: hz.w ?? 6, what: hz.what ?? "slick" });
    }
  }
  return race;
}

function rcAddStatic(race, o) {
  const pt = rcPointAt(race.track, o.s, o.d);
  race.statics.push({ ...o, x: pt.x, y: pt.y, z: pt.z, h: pt.head, down: 0, id: race.statics.length });
}

function rcSpawnTraffic(race, hz, rng) {
  const tr = race.track;
  const count = Math.round((hz.count ?? 8) * (race.cls.traffic ?? 1));
  const kinds = [];
  const mix = hz.mix ?? { sedan: 1 };
  const total = Object.values(mix).reduce((a, b) => a + b, 0) || 1;
  for (const [k, n] of Object.entries(mix)) for (let i = 0; i < Math.round((n / total) * count); i++) kinds.push(k);
  while (kinds.length < count) kinds.push(Object.keys(mix)[0]);
  kinds.length = count;
  const lanes = hz.lanes ?? [{ d: -3, dir: 1 }];
  // Evenly round the lap per lane, never inside the grid zone, and oncoming
  // vehicles never within 260 m ahead of the grid, so the first contact comes
  // once the field has spread out.
  const perLane = lanes.map(() => []);
  kinds.forEach((k, i) => perLane[i % lanes.length].push(k));
  lanes.forEach((lane, li) => {
    const n = perLane[li].length;
    perLane[li].forEach((kind, j) => {
      let s = ((j + 0.5 + (rng() - 0.5) * 0.4) / n) * tr.L + li * 37;
      for (let guard = 0; guard < 60; guard++) {
        const bad = rcInGrid(tr, s, 40) || (lane.dir < 0 && ((s % tr.L) + tr.L) % tr.L < 260);
        if (!bad) break;
        s += 23;
      }
      s = ((s % tr.L) + tr.L) % tr.L;
      const [w, l] = RC_TRAFFIC_DIMS[kind] ?? [2.2, 5];
      const v = (hz.speed?.[0] ?? 12) + rng() * ((hz.speed?.[1] ?? 16) - (hz.speed?.[0] ?? 12));
      race.traffic.push({ id: race.traffic.length, kind, s, s0: s, d: lane.d, laneD: lane.d, lanes: lanes.filter((q) => q.dir === lane.dir).map((q) => q.d),
        dir: lane.dir, v, v0: v, w, l, x: 0, y: 0, z: 0, h: 0, swerveT: 0 });
    });
  });
  for (const t of race.traffic) rcPlaceTraffic(race, t);
}

function rcPlaceTraffic(race, t) {
  const pt = rcPointAt(race.track, t.s, t.d);
  t.x = pt.x; t.y = pt.y; t.z = pt.z; t.h = pt.head + (t.dir < 0 ? Math.PI : 0);
}

// ------------------------------------------------------------------ AI

function rcObstaclesAhead(race, r, range) {
  const tr = race.track, out = [];
  for (const t of race.traffic) {
    const a = rcAhead(tr, r.s, t.s);
    if (a > -t.l / 2 && a < range + t.l / 2 && Math.abs(t.y - r.y) < 4) {
      const closing = t.dir > 0 ? Math.max(0, r.v - t.v) : r.v + t.v;
      out.push({ a: a - t.l / 2, d: t.d, hw: t.w / 2, weight: t.dir > 0 ? 1 : 2.4, closing });
    }
  }
  for (const s of race.statics) {
    if (s.down > 0) continue;
    const a = rcAhead(tr, r.s, s.s);
    if (a > -2 && a < range) out.push({ a, d: s.d, hw: s.w / 2, weight: s.solid ? 2 : 0.8, closing: r.v });
  }
  for (const h of race.drops) {
    const a = rcAhead(tr, r.s, h.s);
    if (a > 0 && a < range) out.push({ a, d: h.d, hw: h.r, weight: 1.6, closing: r.v });
  }
  for (const o of race.racers) {
    if (o === r) continue;
    const a = rcAhead(tr, r.s, o.s);
    if (a > 0 && a < 26) out.push({ a, d: o.d, hw: o.p.w / 2, weight: 0.5, closing: Math.max(0, r.v - o.v) });
  }
  return out;
}

function rcAIInput(race, r, dt) {
  const tr = race.track, ai = r.ai, skill = ai.skill;
  const inp = { steer: 0, throttle: 1, brake: 0, drift: false, item: false, lookback: false, signal: 0 };
  // Lane planning, four times a second.
  ai.think -= dt;
  if (ai.think <= 0 && race.phase === "race") {
    ai.think = 0.25;
    const obs = rcObstaclesAhead(race, r, 60);
    const lim = tr.limit - r.p.w / 2 - 0.3;
    const cands = [-1, -0.55, -0.2, 0.2, 0.55, 1].map((k) => k * lim);
    let curvAhead = 0;
    for (let a = 10; a <= 60; a += 10) curvAhead += rcFrame(tr, r.s + a).curv;
    let best = ai.lane, bestScore = Infinity, curDanger = 0;
    for (const c of cands) {
      let danger = 0;
      for (const o of obs) {
        if (Math.abs(o.d - c) < o.hw + r.p.w / 2 + 0.9) danger += (62 - o.a) * o.weight * (1 + o.closing / 20);
      }
      if (!r.item && race.items) for (const b of race.boxes) {
        const a = rcAhead(tr, r.s, b.s);
        if (b.t <= 0 && a > 5 && a < 55 && Math.abs(b.d - c) < 1.6) danger -= 18;
      }
      for (const p of tr.boostPads) {
        const a = rcAhead(tr, r.s, p.s);
        if (a > 5 && a < 55 && Math.abs(p.d - c) < p.w / 2) danger -= 12 * skill;
      }
      const inside = -Math.sign(curvAhead) * lim * 0.5;
      const score = danger + Math.abs(c - r.d) * 0.9 + Math.abs(c - (inside + ai.pref * lim)) * 0.5;
      if (Math.abs(c - ai.lane) < 0.1) curDanger = danger;
      if (score < bestScore) { bestScore = score; best = c; }
    }
    if (Math.abs(best - ai.lane) > 2.5) {
      const urgent = curDanger > 60;
      if (urgent) { ai.lane = best; ai.pending = null; }
      else if (!ai.pending) {
        // Signal first, check the mirrors, then move: the lesson the joke carries.
        ai.pending = { lane: best, t: 0.55 };
        inp.signal = best > r.d ? 1 : -1;
        if (race.rng() < skill) ai.lookFor = 0.45;
      }
    }
  }
  if (ai.pending) {
    ai.pending.t -= dt;
    if (ai.pending.t <= 0) { ai.lane = ai.pending.lane; ai.pending = null; }
  }
  if (ai.lookFor > 0) { ai.lookFor -= dt; inp.lookback = true; }
  // Steering: aim at a point ahead on the chosen lane.
  const look = 8 + Math.max(0, r.v) * 0.45;
  const tgt = rcPointAt(tr, r.s + look, rcClamp(ai.lane, -tr.limit, tr.limit));
  const desired = Math.atan2(tgt.x - r.x, tgt.z - r.z);
  const diff = rcWrapAngle(desired - r.h);
  inp.steer = rcClamp(diff * 2.8, -1, 1);
  // Speed: the tightest bend in the braking window sets the pace.
  let maxC = 0;
  const win = 16 + Math.max(0, r.v) * 1.3;
  for (let a = 4; a < win; a += 4) maxC = Math.max(maxC, Math.abs(rcFrame(tr, r.s + a).curv));
  const latA = (11 + 11 * skill) * (0.82 + 0.06 * r.veh.stats.handling);
  let vSafe = maxC > 1e-4 ? Math.sqrt(latA / maxC) : 99;
  // A crossing vehicle in the way: wait for it.
  for (const c of race.crossings) {
    const a = rcAhead(tr, r.s, c.s);
    if (a > 0 && a < 55) {
      const eta = a / Math.max(4, r.v);
      const future = c.waitT > eta ? c.pos : c.pos + c.dir * c.speed * Math.max(0, eta - c.waitT);
      if (Math.abs(future) < tr.half + c.l / 2 + 2 || Math.abs(c.pos) < tr.half + c.l / 2 + 1) vSafe = Math.min(vSafe, Math.max(0, (a - 12) * 0.5));
    }
  }
  if (r.v < vSafe) { inp.throttle = 1; inp.brake = 0; }
  else { inp.throttle = 0; inp.brake = r.v > vSafe + 2.5 ? rcClamp((r.v - vSafe) / 8, 0.2, 1) : 0; }
  // Drift through the long bends.
  if (ai.driftT > 0) {
    ai.driftT -= dt;
    inp.drift = true;
    if (maxC < 1 / 90) ai.driftT = 0;
  } else if (!r.drifting && maxC > 1 / 55 && r.v > 15 && race.rng() < skill * dt * 2.5) {
    const cNow = rcFrame(tr, r.s + 12).curv;
    if (Math.sign(cNow) === Math.sign(diff) && Math.abs(inp.steer) > 0.3) ai.driftT = 1.2 + race.rng() * 1.4;
    inp.drift = ai.driftT > 0;
  }
  // Items.
  if (r.item && race.items) {
    ai.itemT -= dt;
    if (ai.itemT <= 0) {
      const behind = race.racers.some((o) => o !== r && rcAhead(tr, o.s, r.s) > 0 && rcAhead(tr, o.s, r.s) < 30);
      const near = race.racers.some((o) => o !== r && Math.hypot(o.x - r.x, o.z - r.z) < 12);
      const ahead = race.racers.some((o) => o !== r && rcAhead(tr, r.s, o.s) > 3 && rcAhead(tr, r.s, o.s) < 70);
      const straight = maxC < 1 / 120;
      const held = -ai.itemT;
      const use = {
        flatbed: straight || held > 4, tow: ahead || held > 6, horn: near || held > 7,
        cones: behind || held > 9, paint: behind || held > 9, hardhat: true,
      }[r.item];
      if (use) inp.item = true;
    }
  }
  // Unsticking: back off the wall, then go again.
  if (race.phase === "race" && Math.abs(r.v) < 1.5 && !r.finished) ai.stuck = (ai.stuck ?? 0) + dt; else ai.stuck = 0;
  if (ai.stuck > 1.2 && ai.reverseT <= 0) ai.reverseT = 0.9;
  if (ai.reverseT > 0) {
    ai.reverseT -= dt;
    inp.throttle = 0; inp.brake = 1; inp.steer = -inp.steer; inp.drift = false;
  }
  return inp;
}

// ------------------------------------------------------------------ items

function rcRollItem(race, r) {
  const n = race.racers.length;
  const p = n > 1 ? (r.place - 1) / (n - 1) : 0.5;
  const w = { cones: 3 - 2 * p, paint: 2.5 - 1.5 * p, hardhat: 2 - p, horn: 1 + 1.5 * p, tow: 0.5 + 2.5 * p, flatbed: 0.8 + 2.4 * p };
  const total = Object.values(w).reduce((a, b) => a + b, 0);
  let x = race.rng() * total;
  for (const id of RC_ITEM_IDS) { x -= w[id]; if (x <= 0) return id; }
  return "flatbed";
}

function rcDrop(race, r, kind, back, d, rad, ttl) {
  const tr = race.track;
  const s = r.s - back;
  const pt = rcPointAt(tr, s, rcClamp(d, -tr.limit, tr.limit));
  const drop = { id: race.nextId++, kind, s: ((s % tr.L) + tr.L) % tr.L, d, x: pt.x, y: pt.y, z: pt.z, r: rad, ttl, life: ttl, owner: r.id, born: race.t };
  race.drops.push(drop);
  return drop;
}

/** Fire the racer's held item. Exported so a checker can fire each one. */
export function rcUseItem(race, r, forced = null) {
  const item = forced ?? r.item;
  if (!item) return false;
  const tr = race.track;
  const back = r.p.l / 2 + 2.5;
  if (item === "cones") {
    for (const off of [-1.3, 0, 1.3]) rcDrop(race, r, "cone", back + Math.abs(off) * 0.8, r.d + off, 0.5, 18);
  } else if (item === "paint") {
    rcDrop(race, r, "paint", back + 1.5, r.d, 2.7, 14);
  } else if (item === "hardhat") {
    r.shieldT = 8;
  } else if (item === "horn") {
    for (const o of race.racers) {
      if (o === r) continue;
      const dx = o.x - r.x, dz = o.z - r.z, dist = Math.hypot(dx, dz);
      if (dist < 16 && Math.abs(o.y - r.y) < 3) {
        if (!rcHit(race, o, "horn", 0.55)) continue;
        const push = (16 - dist) * 0.5 / o.p.mass;
        o.x += (dx / (dist || 1)) * push; o.z += (dz / (dist || 1)) * push;
      }
    }
    for (const t of race.traffic) {
      if (Math.hypot(t.x - r.x, t.z - r.z) < 24 && t.lanes.length > 1) {
        t.laneD = t.lanes.find((d) => Math.abs(d - t.d) > 1) ?? t.laneD; t.swerveT = 4;
      }
    }
  } else if (item === "tow") {
    let best = null, bestA = 95;
    for (const o of race.racers) {
      if (o === r || o.finishT != null) continue;
      const a = rcAhead(tr, r.s, o.s);
      if (a > 3 && a < bestA && Math.abs(o.y - r.y) < 4) { bestA = a; best = o; }
    }
    if (best) { r.towT = 2.2; r.towTarget = best.id; }
    else r.boostT = Math.max(r.boostT, 1.0);
  } else if (item === "flatbed") {
    r.boostT = Math.max(r.boostT, 2.3);
  }
  if (!forced) r.item = null;
  r.itemsUsed += 1;
  race.events.push({ type: "item", id: r.id, item });
  return true;
}

/** A hit from an item or a hazard. The hard hat eats one. Returns true if it landed. */
function rcHit(race, r, why, spin = 0.9) {
  if (r.shieldT > 0) {
    r.shieldT = 0;
    race.events.push({ type: "shield", id: r.id, why });
    return false;
  }
  r.spinT = Math.max(r.spinT, spin);
  r.spinDir = race.rng() < 0.5 ? -1 : 1;
  r.v *= 0.55;
  r.drifting = false;
  race.events.push({ type: "hit", id: r.id, why });
  return true;
}

// ------------------------------------------------------------------ physics

function rcDrive(race, r, inp, dt) {
  const tr = race.track, P = r.p;
  let steer = rcClamp(Number(inp.steer) || 0, -1, 1);
  let thr = rcClamp(Number(inp.throttle) || 0, 0, 1);
  const brk = rcClamp(Number(inp.brake) || 0, 0, 1);
  if (r.spinT > 0) { steer = 0; thr = 0; }
  const surf = tr.def.surface === "dirt" ? 0.94 : 1;
  const slick = race.slicks.some((z) => rcAhead(tr, z.s0, r.s) >= 0 && rcAhead(tr, r.s, z.s1) >= 0 && Math.abs(r.d - z.d) < z.w / 2);
  if (slick) r.slickT = Math.max(r.slickT, 0.25);

  if (race.phase === "countdown") {
    // The rolling start: the whole grid creeps forward on its line while the
    // lights count down. Throttle timing at the green earns a start boost.
    if (thr > 0.5 && r.thrAt == null) r.thrAt = race.count;
    if (thr < 0.5) r.thrAt = null;
    r.v += (3 - r.v) * Math.min(1, 2 * dt);
    const tgt = rcPointAt(tr, r.s + 10, r.ai.lane);
    const want = Math.atan2(tgt.x - r.x, tgt.z - r.z);
    r.h = rcWrapAngle(r.h + rcWrapAngle(want - r.h) * Math.min(1, 3 * dt));
    r.m = r.h;
  } else {
    const band = r.band ?? 1;
    let cap = P.top * band;
    if (r.boostT > 0) cap *= 1.33;
    if (r.towT > 0) cap *= 1.22;
    if (r.spinT > 0) cap *= 0.35;
    if (r.slickT > 0) cap *= 0.82;
    if (r.finishT != null && r.human) cap *= 0.6;
    cap *= surf;
    if (brk > 0.05) {
      if (r.v > 0.8) r.v -= 24 * brk * dt;
      else r.v = Math.max(-7, r.v - 10 * brk * dt);
    } else if (thr > 0) {
      if (r.v < 0) r.v += 18 * dt;
      else r.v += thr * P.accel * Math.max(0.1, 1 - r.v / Math.max(1, cap)) * dt;
    } else {
      r.v -= Math.sign(r.v) * Math.min(Math.abs(r.v), 4.5 * dt);
    }
    if (r.boostT > 0) r.v += 26 * dt;
    if (r.v > cap) r.v = Math.max(cap, r.v - (r.v - cap) * 2.2 * dt - 3 * dt);
    r.v -= 9.8 * rcFrame(tr, r.s).slope * 0.45 * dt;
  }

  // Steering, drift and the mini boost.
  const av = Math.abs(r.v);
  const vf = Math.min(1, av / 7) * (1 - 0.3 * Math.min(1, av / P.top));
  const driftPressed = !!inp.drift && !r.driftHeld;
  r.driftHeld = !!inp.drift;
  if (driftPressed && !r.drifting && Math.abs(steer) > 0.25 && r.v > 11 && r.spinT <= 0 && race.phase === "race") {
    r.drifting = true; r.driftDir = Math.sign(steer); r.driftCharge = 0; r.hopT = 0.2;
    race.events.push({ type: "drift", id: r.id });
  }
  let yaw;
  if (r.drifting) {
    if (!inp.drift || r.v < 8 || r.spinT > 0) {
      const level = r.driftCharge >= 2.0 ? 2 : r.driftCharge >= 0.9 ? 1 : 0;
      if (level) {
        r.boostT = Math.max(r.boostT, level === 2 ? 1.25 : 0.7);
        race.events.push({ type: "miniboost", id: r.id, level });
      }
      r.drifting = false;
      yaw = steer * P.turn * vf;
    } else {
      yaw = r.driftDir * P.turn * (0.72 + 0.42 * steer * r.driftDir);
      r.driftCharge += dt * (0.7 + 0.6 * Math.abs(steer));
    }
  } else {
    yaw = steer * P.turn * vf * (r.v < -0.2 ? -1 : 1);
  }
  if (r.spinT > 0) yaw = r.spinDir * 7;
  if (race.phase === "countdown") yaw = 0;
  // The tow strap reels you toward the racer you hooked.
  if (r.towT > 0) {
    const tgt = race.racers[r.towTarget];
    if (tgt) {
      const want = Math.atan2(tgt.x - r.x, tgt.z - r.z);
      r.h = rcWrapAngle(r.h + rcWrapAngle(want - r.h) * Math.min(1, 2.5 * dt));
    }
  }
  r.h = rcWrapAngle(r.h + yaw * dt);
  const grip = r.spinT > 0 ? 1.1 : r.drifting ? 2.3 : r.slickT > 0 ? 0.9 : P.grip;
  r.m = rcWrapAngle(r.m + rcWrapAngle(r.h - r.m) * Math.min(1, grip * dt));
  r.x += Math.sin(r.m) * r.v * dt;
  r.z += Math.cos(r.m) * r.v * dt;

  // Back onto the centreline; the barriers.
  const pj = rcProject(tr, r.x, r.z, r.idx);
  r.idx = pj.i;
  let d = pj.d;
  if (Math.abs(d) > tr.limit) {
    const sg = Math.sign(d), over = Math.abs(d) - tr.limit;
    const f = rcFrame(tr, pj.s);
    r.x -= f.lx * sg * over; r.z -= f.lz * sg * over;
    const vx = Math.sin(r.m) * r.v, vz = Math.cos(r.m) * r.v;
    const into = (vx * f.lx + vz * f.lz) * sg;
    if (into > 0) {
      const nvx = vx - f.lx * sg * into * 1.25, nvz = vz - f.lz * sg * into * 1.25;
      const sp = Math.hypot(nvx, nvz);
      if (sp > 0.01) { r.m = Math.atan2(nvx, nvz); r.v = sp * (r.v < 0 ? -1 : 1) * 0.97; if (r.v < 0) r.m = rcWrapAngle(r.m + Math.PI); }
      if (into > 5 && race.t - r.bumpT > 0.4) { r.bumpT = race.t; race.events.push({ type: "wall", id: r.id, force: into }); }
      // Turn the nose away from the barrier so grip does not drive it back in.
      const rel = rcWrapAngle(r.h - f.head);
      if (rel * sg > 0) r.h = rcWrapAngle(r.h - rel * Math.min(1, 3 * dt));
    }
    d = sg * tr.limit;
  }
  r.prevS = r.s;
  r.s = pj.s; r.d = d;
  const pt = rcPointAt(tr, r.s, r.d);
  r.y = pt.y;
  r.pitch = Math.atan(rcFrame(tr, r.s).slope) * Math.cos(rcWrapAngle(r.h - pt.head));
  r.roll = pt.bank * Math.cos(rcWrapAngle(r.h - pt.head));

  // Timers.
  r.boostT = Math.max(0, r.boostT - dt);
  r.spinT = Math.max(0, r.spinT - dt);
  r.slickT = Math.max(0, r.slickT - dt);
  r.shieldT = Math.max(0, r.shieldT - dt);
  r.hopT = Math.max(0, r.hopT - dt);
  if (r.towT > 0) {
    r.towT -= dt;
    const tgt = race.racers[r.towTarget];
    if (!tgt || r.towT <= 0 || Math.hypot(tgt.x - r.x, tgt.z - r.z) < r.p.l / 2 + tgt.p.l / 2 + 1) {
      r.towT = 0;
      r.boostT = Math.max(r.boostT, 0.9);
      if (tgt) tgt.v *= 0.85;
      race.events.push({ type: "tow", id: r.id, target: tgt?.id ?? null });
    }
  }
  // Wrong way, and a roadside assist for anyone stuck for good.
  const rel = Math.abs(rcWrapAngle(r.m - pt.head));
  r.wrongT = rel > 1.9 && r.v > 3 ? r.wrongT + dt : 0;
  r.wrong = r.wrongT > 1.5;
  r.stuckT = race.phase === "race" && Math.abs(r.v) < 1 ? r.stuckT + dt : 0;
  if (r.stuckT > 6 || r.wrongT > 8) rcRecover(race, r);
}

/** Put a racer back on the centreline, facing the right way (roadside assist). */
export function rcRecover(race, r) {
  const tr = race.track;
  const pt = rcPointAt(tr, r.s, 0);
  r.x = pt.x; r.y = pt.y; r.z = pt.z; r.d = 0; r.h = r.m = pt.head; r.v = 4;
  r.idx = rcIndexAt(tr, r.s); r.stuckT = 0; r.wrongT = 0; r.spinT = 0; r.drifting = false;
  race.events.push({ type: "recover", id: r.id });
}

function rcLaps(race, r) {
  const tr = race.track, L = tr.L;
  if (r.prevS > L * 0.75 && r.s < L * 0.25) {
    if (r.undo) {
      // Back over the line and forward again: restore, never a new lap.
      r.undo = false;
      r.crossings += 1;
    } else if (r.crossings === 0 || r.half) {
      r.crossings += 1;
      r.half = false;
      if (r.crossings === 1) r.lapStart = Math.max(0, race.t);
      else if (r.finishT == null) {
        const lt = race.t - r.lapStart;
        r.lapTimes.push(lt);
        if (r.bestLap == null || lt < r.bestLap) r.bestLap = lt;
        r.lapStart = race.t;
        race.events.push({ type: "lap", id: r.id, lap: r.crossings - 1, time: lt });
        if (r.crossings === race.laps + 1) {
          r.finishT = race.t;
          r.place = ++race.finished;
          r.finishedPlace = r.place;
          race.events.push({ type: "finish", id: r.id, place: r.place, time: r.finishT });
        } else if (r.crossings === race.laps) {
          race.events.push({ type: "finallap", id: r.id });
        }
      }
    }
  } else if (r.prevS < L * 0.25 && r.s > L * 0.75) {
    if (r.crossings > 0 && r.finishT == null && !r.undo) { r.crossings -= 1; r.undo = true; }
  }
  if (r.s > L * 0.35 && r.s < L * 0.65) r.half = true;
  r.progress = (r.crossings - 1) * L + r.s;
}

function rcCollide(race) {
  const R = race.racers;
  // Racer against racer: push apart by weight and trade a little speed.
  for (let i = 0; i < R.length; i++) {
    for (let j = i + 1; j < R.length; j++) {
      const a = R[i], b = R[j];
      if (Math.abs(a.y - b.y) > 2.5) continue;
      if (Math.abs(a.x - b.x) > 14 || Math.abs(a.z - b.z) > 14) continue;
      for (const [ax, az, ar] of rcShape(a)) for (const [bx, bz, br] of rcShape(b)) {
        const dx = bx - ax, dz = bz - az, dist = Math.hypot(dx, dz);
        if (dist >= ar + br || dist < 1e-6) continue;
        const pen = ar + br - dist, nx = dx / dist, nz = dz / dist;
        const ma = a.p.mass, mb = b.p.mass, tot = ma + mb;
        a.x -= nx * pen * (mb / tot); a.z -= nz * pen * (mb / tot);
        b.x += nx * pen * (ma / tot); b.z += nz * pen * (ma / tot);
        const va = (Math.sin(a.m) * nx + Math.cos(a.m) * nz) * a.v;
        const vb = (Math.sin(b.m) * nx + Math.cos(b.m) * nz) * b.v;
        const rel = va - vb;
        if (rel > 0) {
          a.v -= rel * (mb / tot) * 0.6;
          b.v += rel * (ma / tot) * 0.6;
          if (rel > 4 && race.t - a.bumpT > 0.3) { a.bumpT = race.t; race.events.push({ type: "bump", id: a.id, other: b.id }); }
        }
      }
    }
  }
  // Racer against traffic, crossings and solid statics.
  for (const r of R) {
    for (const t of race.traffic) {
      if (Math.abs(t.y - r.y) > 3 || Math.abs(t.x - r.x) > 16 || Math.abs(t.z - r.z) > 16) continue;
      for (const [cx, cz, cr] of rcShape(r)) {
        const hit = rcCircleBox(cx, cz, cr, t.x, t.z, t.h, t.w / 2, t.l / 2);
        if (!hit) continue;
        r.x += hit.nx * hit.pen; r.z += hit.nz * hit.pen;
        if (race.t - r.bumpT > 0.5) {
          r.bumpT = race.t;
          const headOn = Math.cos(rcWrapAngle(r.m - t.h)) < -0.3;
          r.v *= 0.3 + 0.06 * r.veh.stats.weight;
          if (headOn) rcHit(race, r, "traffic", 0.8);
          race.events.push({ type: "traffic", id: r.id, kind: t.kind });
        }
      }
    }
    for (const c of race.crossings) {
      if (Math.abs(c.y - r.y) > 4) continue;
      for (const [cx, cz, cr] of rcShape(r)) {
        const hit = rcCircleBox(cx, cz, cr, c.x, c.z, c.h, c.w / 2, c.l / 2);
        if (!hit) continue;
        r.x += hit.nx * hit.pen; r.z += hit.nz * hit.pen;
        if (race.t - r.bumpT > 0.6) { r.bumpT = race.t; r.v *= 0.35; rcHit(race, r, c.kind, 0.7); }
      }
    }
    for (const s of race.statics) {
      if (s.down > 0 || Math.abs(s.y - r.y) > 3 || Math.abs(s.x - r.x) > 14 || Math.abs(s.z - r.z) > 14) continue;
      for (const [cx, cz, cr] of rcShape(r)) {
        const hit = rcCircleBox(cx, cz, cr, s.x, s.z, s.h, s.w / 2, s.l / 2);
        if (!hit) continue;
        if (s.solid) {
          r.x += hit.nx * hit.pen; r.z += hit.nz * hit.pen;
          if (race.t - r.bumpT > 0.4) { r.bumpT = race.t; r.v *= 0.55; race.events.push({ type: "bump", id: r.id, other: s.kind }); }
        } else {
          s.down = 10; r.v *= 0.88;
          race.events.push({ type: "cone", id: r.id });
        }
      }
    }
    // Dropped items.
    for (let k = race.drops.length - 1; k >= 0; k--) {
      const h = race.drops[k];
      if (h.owner === r.id && race.t - h.born < 0.8) continue;
      if (Math.abs(h.y - r.y) > 3) continue;
      if (Math.hypot(h.x - r.x, h.z - r.z) < h.r + r.p.w * 0.5) {
        if (h.kind === "paint") { r.slickT = 1.4; rcHit(race, r, "paint", 0.6); }
        else rcHit(race, r, "cone", 0.9);
        race.drops.splice(k, 1);
        race.events.push({ type: "expire", drop: h.id, kind: h.kind, why: "hit" });
      }
    }
  }
}

function rcPickups(race, r) {
  const tr = race.track;
  if (race.items) for (const b of race.boxes) {
    if (b.t > 0 || Math.abs(b.y - r.y) > 3) continue;
    if (Math.hypot(b.x - r.x, b.z - r.z) < 2.0 + r.p.w * 0.4) {
      b.t = 4;
      if (!r.item && !r.rolling) {
        r.rolling = rcRollItem(race, r); r.rollT = 1.0;
        race.events.push({ type: "box", id: r.id });
      }
    }
  }
  tr.boostPads.forEach((p, i) => {
    if (Math.abs(rcAhead(tr, p.s, r.s)) < p.len / 2 && Math.abs(r.d - p.d) < p.w / 2 + r.p.w * 0.3) {
      if (r.padLast !== i || race.t - r.padT > 1.5) {
        r.padLast = i; r.padT = race.t;
        r.boostT = Math.max(r.boostT, 1.0);
        race.events.push({ type: "pad", id: r.id });
      }
    }
  });
  if (r.rolling) {
    r.rollT -= race._dt;
    if (r.rollT <= 0) {
      r.item = r.rolling; r.rolling = null;
      r.ai.itemT = 0.8 + race.rng() * 3 * (1.5 - r.ai.skill);
      race.events.push({ type: "gotitem", id: r.id, item: r.item });
    }
  }
}

/** The safety bonus: signal, check your mirrors, then change lanes. */
function rcSafety(race, r, inp) {
  if (inp.signal) {
    r.signal = { dir: Math.sign(inp.signal), t: race.t, d0: r.d };
    race.events.push({ type: "signal", id: r.id, dir: r.signal.dir });
  }
  if (inp.lookback) r.lookT = race.t;
  if (!r.signal) return;
  if (race.t - r.signal.t > 3.5) { r.signal = null; return; }
  if ((r.d - r.signal.d0) * r.signal.dir >= 3.2 && race.t - r.safetyT > 2 && race.phase === "race") {
    const mirrors = r.lookT >= r.signal.t - 3 && race.t - r.lookT < 3.5;
    r.boostT = Math.max(r.boostT, mirrors ? 1.0 : 0.55);
    r.safety += mirrors ? 2 : 1;
    r.safetyT = race.t;
    race.events.push({ type: "safety", id: r.id, mirrors });
    r.signal = null;
  }
}

function rcMoveTraffic(race, dt) {
  const tr = race.track;
  for (const t of race.traffic) {
    // Keep a gap to whatever is ahead in the lane, as traffic does.
    let v = t.v0;
    for (const o of race.traffic) {
      if (o === t || o.dir !== t.dir || Math.abs(o.d - t.d) > 2) continue;
      const a = rcAhead(tr, t.s, o.s) * t.dir;
      const gap = a - (t.l + o.l) / 2;
      if (a > 0 && gap < 22) v = Math.min(v, o.v * (gap < 8 ? 0.6 : 1));
    }
    // Merge out of a closed lane (a work zone, a toll booth, a trench run).
    if (t.lanes.length > 1 && t.swerveT <= 0) {
      for (const s of race.statics) {
        const a = rcAhead(tr, t.s, s.s) * t.dir;
        if (a > 0 && a < 60 && Math.abs(s.d - t.laneD) < 2.4) {
          const other = t.lanes.find((d) => Math.abs(d - s.d) > 2.6);
          if (other != null) { t.laneD = other; t.swerveT = 5; }
          break;
        }
      }
    }
    t.v += (v - t.v) * Math.min(1, 2 * dt);
    t.s = (((t.s + t.dir * t.v * dt) % tr.L) + tr.L) % tr.L;
    if (t.swerveT > 0) { t.swerveT -= dt; if (t.swerveT <= 0) t.laneD = t.lanes.reduce((a, b) => (Math.abs(b - t.d) < Math.abs(a - t.d) ? b : a), t.laneD); }
    t.d += rcClamp(t.laneD - t.d, -3 * dt, 3 * dt);
    rcPlaceTraffic(race, t);
  }
  for (const c of race.crossings) {
    if (c.waitT > 0) c.waitT -= dt;
    else {
      c.pos += c.dir * c.speed * dt;
      if (Math.abs(c.pos) >= c.span) { c.pos = Math.sign(c.pos) * c.span; c.dir = -c.dir; c.waitT = c.wait; }
    }
    const f = rcFrame(tr, c.s);
    const pt = rcPointAt(tr, c.s, rcClamp(c.pos, -tr.half, tr.half));
    c.x = f.x + f.lx * c.pos; c.z = f.z + f.lz * c.pos; c.y = pt.y;
    c.h = rcWrapAngle(f.head + (c.dir > 0 ? -Math.PI / 2 : Math.PI / 2));
    c.warn = Math.abs(c.pos) < tr.half + c.l / 2 + 10;
  }
  for (const s of race.statics) if (s.down > 0) s.down = Math.max(0, s.down - dt);
  for (const b of race.boxes) if (b.t > 0) b.t = Math.max(0, b.t - dt);
  for (let k = race.drops.length - 1; k >= 0; k--) {
    const h = race.drops[k];
    h.ttl -= dt;
    if (h.ttl <= 0) { race.drops.splice(k, 1); race.events.push({ type: "expire", drop: h.id, kind: h.kind, why: "ttl" }); }
  }
}

function rcRank(race) {
  const order = race.racers.slice().sort((a, b) => {
    if (a.finishT != null && b.finishT != null) return a.finishT - b.finishT;
    if (a.finishT != null) return -1;
    if (b.finishT != null) return 1;
    return b.progress - a.progress;
  });
  order.forEach((r, i) => { r.place = i + 1; });
  // A little catch-up for AI behind the leading human, and a touch of drag
  // for AI ahead: close racing without teleporting anyone.
  const humans = race.racers.filter((r) => r.human);
  const lead = humans.length ? Math.max(...humans.map((r) => r.progress)) : null;
  for (const r of race.racers) {
    if (r.human || lead == null) { r.band = 1; continue; }
    r.band = 1 + rcClamp((lead - r.progress) / 500, -0.05, 0.07);
  }
  return order;
}

/**
 * Advance the race by dt seconds. `inputs` maps a racer id to its input
 * ({ steer, throttle, brake, drift, item, lookback, signal }); racers with no
 * entry, and every racer that is not human, are driven by the AI.
 * Events for this step are appended to race.events; the caller drains them.
 */
export function rcStep(race, dt, inputs = {}) {
  if (race.phase === "done") return race;
  race._dt = dt;
  if (race.phase === "countdown") {
    const before = Math.ceil(race.count - 0.5);
    race.count -= dt;
    const after = Math.ceil(race.count - 0.5);
    if (after !== before && after > 0) race.events.push({ type: "count", n: after });
    if (race.count <= 0.5) {
      race.phase = "race";
      race.t = 0;
      race.events.push({ type: "go" });
      for (const r of race.racers) {
        const inp = r.human ? (inputs[r.id] ?? {}) : null;
        const good = r.human ? (r.thrAt != null && r.thrAt < 1.6) : race.rng() < r.ai.skill * 0.7;
        if (good) { r.boostT = 0.9; r.startBoost = true; race.events.push({ type: "startboost", id: r.id }); }
        void inp;
      }
    }
  } else {
    race.t += dt;
  }
  for (const r of race.racers) {
    const human = r.human && r.finishT == null;
    const inp = human ? (inputs[r.id] ?? {}) : rcAIInput(race, r, dt);
    if (inp.item && (r.item) && race.phase === "race") rcUseItem(race, r);
    rcSafety(race, r, inp);
    rcDrive(race, r, inp, dt);
    rcPickups(race, r);
  }
  rcCollide(race);
  for (const r of race.racers) rcLaps(race, r);
  rcMoveTraffic(race, dt);
  rcRank(race);
  // The end: everyone home, or every human home and a short cool-down, or a
  // hard cap so a race always ends.
  const humans = race.racers.filter((r) => r.human);
  const allHome = race.racers.every((r) => r.finishT != null);
  const humansHome = humans.length > 0 && humans.every((r) => r.finishT != null);
  if (race.phase === "race") {
    if (allHome) race.endAt = race.endAt ?? race.t;
    else if (humansHome) race.endAt = race.endAt ?? race.t + 4;
    else if (!humans.length && race.finished > 0) race.endAt = race.endAt ?? race.t + 75;
    if (race.t > 900) race.endAt = race.endAt ?? race.t;
    if (race.endAt != null && race.t >= race.endAt) rcFinishRace(race);
  }
  return race;
}

/** Close the race: anyone still running gets a projected time from their pace. */
export function rcFinishRace(race) {
  const tr = race.track;
  const left = race.racers.filter((r) => r.finishT == null).sort((a, b) => b.progress - a.progress);
  for (const r of left) {
    const remaining = Math.max(0, race.laps * tr.L - r.progress);
    const pace = Math.max(8, r.p.top * 0.75);
    r.finishT = race.t + remaining / pace;
    r.projected = true;
  }
  const order = race.racers.slice().sort((a, b) => a.finishT - b.finishT);
  order.forEach((r, i) => { r.place = i + 1; });
  race.finished = race.racers.length;
  race.phase = "done";
  race.events.push({ type: "done" });
}

/** The results table, first to last. */
export function rcStandings(race) {
  return race.racers.slice().sort((a, b) => a.place - b.place).map((r) => ({
    place: r.place, id: r.id, name: r.name, vehicle: r.vehicle, vehicleName: r.veh.name, human: r.human, player: r.player,
    time: r.finishT, projected: !!r.projected, bestLap: r.bestLap, laps: r.lapTimes.slice(), safety: r.safety, items: r.itemsUsed,
  }));
}

/** Grand Prix points for a finished race: racer id → points. */
export function rcRacePoints(race) {
  const out = {};
  for (const r of race.racers) out[r.id] = RC_POINTS[r.place - 1] ?? 0;
  return out;
}

// ------------------------------------------------------------------ saves

/** The whole saved state, under RC_STORAGE_KEY. */
export function rcNewSave() {
  return { v: 1, unlocked: ["apprentice"], gp: {}, tt: {}, settings: { music: true } };
}

export function rcLoadSave(storage) {
  try {
    const raw = storage?.getItem?.(RC_STORAGE_KEY);
    if (!raw) return rcNewSave();
    const s = JSON.parse(raw);
    if (!s || s.v !== 1 || !Array.isArray(s.unlocked)) return rcNewSave();
    const clean = rcNewSave();
    clean.unlocked = RC_CLASSES.map((c) => c.id).filter((id) => s.unlocked.includes(id));
    if (!clean.unlocked.includes("apprentice")) clean.unlocked.unshift("apprentice");
    clean.gp = typeof s.gp === "object" && s.gp ? s.gp : {};
    clean.tt = typeof s.tt === "object" && s.tt ? s.tt : {};
    clean.settings = { ...clean.settings, ...(s.settings ?? {}) };
    return clean;
  } catch {
    return rcNewSave();
  }
}

export function rcStoreSave(storage, save) {
  try { storage?.setItem?.(RC_STORAGE_KEY, JSON.stringify(save)); return true; } catch { return false; }
}

export function rcClassUnlocked(save, clsId) {
  return (save?.unlocked ?? ["apprentice"]).includes(clsId);
}

/**
 * The unlock rule: finishing a Grand Prix in the top three on a class opens
 * the next class. Returns a new save and the id it unlocked (or null).
 */
export function rcApplyGrandPrix(save, clsId, place) {
  const next = JSON.parse(JSON.stringify(save ?? rcNewSave()));
  const prev = next.gp[clsId]?.best;
  next.gp[clsId] = { best: prev == null ? place : Math.min(prev, place), runs: (next.gp[clsId]?.runs ?? 0) + 1 };
  let unlocked = null;
  const i = RC_CLASSES.findIndex((c) => c.id === clsId);
  if (i >= 0 && place >= 1 && place <= 3 && i + 1 < RC_CLASSES.length) {
    const id = RC_CLASSES[i + 1].id;
    if (!next.unlocked.includes(id)) { next.unlocked.push(id); unlocked = id; }
  }
  return { save: next, unlocked };
}

// ------------------------------------------------------------------ ghosts

/** A lap recorded at 10 Hz as [x, y, z, h] rows, packed to a short string. */
export function rcGhostEncode(samples) {
  return samples.map((s) => [Math.round(s[0] * 10), Math.round(s[1] * 10), Math.round(s[2] * 10), Math.round(s[3] * 100)].join(",")).join(";");
}

export function rcGhostDecode(str) {
  if (typeof str !== "string" || !str) return [];
  return str.split(";").map((row) => {
    const [x, y, z, h] = row.split(",").map(Number);
    return [x / 10, y / 10, z / 10, h / 100];
  }).filter((r) => r.every(Number.isFinite));
}

/** The ghost's pose t seconds into its lap. */
export function rcGhostAt(rows, t) {
  if (!rows?.length) return null;
  const f = rcClamp(t * 10, 0, rows.length - 1);
  const i = Math.floor(f), k = Math.min(rows.length - 1, i + 1), a = f - i;
  const A = rows[i], B = rows[k];
  return { x: A[0] + (B[0] - A[0]) * a, y: A[1] + (B[1] - A[1]) * a, z: A[2] + (B[2] - A[2]) * a, h: A[3] + rcWrapAngle(B[3] - A[3]) * a };
}

/** Keep a lap as the track-and-class best if it beats the stored one. */
export function rcOfferGhost(save, trackId, clsId, lapTime, samples) {
  const key = `${trackId}|${clsId}`;
  const prev = save.tt[key];
  if (prev && prev.best <= lapTime) return false;
  save.tt[key] = { best: lapTime, ghost: rcGhostEncode(samples) };
  return true;
}

// ------------------------------------------------------------------ two-tab

/** The dynamic state the hosting tab sends the other one. */
export function rcSnapshot(race) {
  const q = (v) => Math.round(v * 100) / 100;
  return {
    t: q(race.t), c: q(race.count), ph: race.phase,
    r: race.racers.map((r) => [q(r.x), q(r.y), q(r.z), q(r.h), q(r.v), q(r.s), q(r.d), r.crossings, r.place, r.item ?? 0, q(r.shieldT), q(r.boostT), q(r.spinT), r.drifting ? 1 : 0, r.finishT == null ? -1 : q(r.finishT), r.signal ? r.signal.dir : 0, q(r.pitch ?? 0), q(r.roll ?? 0), r.safety, r.rolling ? 1 : 0, r.towT > 0 ? r.towTarget : -1, r.wrong ? 1 : 0, q(r.bestLap ?? -1), r.lapTimes.length]),
    tf: race.traffic.map((t) => [q(t.x), q(t.y), q(t.z), q(t.h)]),
    cx: race.crossings.map((c) => [q(c.x), q(c.y), q(c.z), q(c.h), c.warn ? 1 : 0]),
    st: race.statics.map((s) => (s.down > 0 ? 1 : 0)),
    bx: race.boxes.map((b) => (b.t > 0 ? 1 : 0)),
    dr: race.drops.map((h) => [h.id, h.kind, q(h.x), q(h.y), q(h.z), q(h.ttl)]),
  };
}

export function rcApplySnapshot(race, snap) {
  race.t = snap.t; race.count = snap.c; race.phase = snap.ph;
  snap.r.forEach((a, i) => {
    const r = race.racers[i];
    if (!r) return;
    [r.x, r.y, r.z, r.h, r.v, r.s, r.d, r.crossings, r.place] = a;
    r.item = a[9] || null; r.shieldT = a[10]; r.boostT = a[11]; r.spinT = a[12]; r.drifting = !!a[13];
    r.finishT = a[14] < 0 ? null : a[14]; r.signal = a[15] ? { dir: a[15], t: race.t, d0: r.d } : null;
    r.pitch = a[16]; r.roll = a[17]; r.safety = a[18]; r.rolling = a[19] ? "rolling" : null;
    r.towT = a[20] >= 0 ? 1 : 0; r.towTarget = a[20] >= 0 ? a[20] : null; r.wrong = !!a[21];
    r.bestLap = a[22] < 0 ? null : a[22];
    r.m = r.h;
    r.progress = (r.crossings - 1) * race.track.L + r.s;
    r.lapCount = a[23];
  });
  snap.tf.forEach((a, i) => { const t = race.traffic[i]; if (t) [t.x, t.y, t.z, t.h] = a; });
  snap.cx.forEach((a, i) => { const c = race.crossings[i]; if (c) { [c.x, c.y, c.z, c.h] = a; c.warn = !!a[4]; } });
  snap.st.forEach((dn, i) => { if (race.statics[i]) race.statics[i].down = dn ? 1 : 0; });
  snap.bx.forEach((b, i) => { if (race.boxes[i]) race.boxes[i].t = b ? 1 : 0; });
  race.drops = snap.dr.map(([id, kind, x, y, z, ttl]) => ({ id, kind, x, y, z, ttl, r: kind === "paint" ? 2.7 : 0.5 }));
}
