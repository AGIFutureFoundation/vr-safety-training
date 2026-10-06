// Battle mode — an enclosed construction-site arena, items only, three
// hard-hat lives each, last one standing. Four local players or AI fill the
// rest. This module is the whole mode: the pure simulation up top (no
// three.js, no DOM — tools/check_race.mjs runs it headless the way it runs
// sim.js), and the arena's build and per-frame render underneath, on the
// platform's own fleet builders, exactly like the race itself.
//
// Every name, shape and item here is original to this platform.
import { RC_VEHICLES, RC_ITEMS } from "./sim.js";

// ------------------------------------------------------------------ arena

export const BATTLE_ID = "site-arena";
export const BATTLE_NAME = "Construction Site Arena";
export const BATTLE_HALF = 34;      // the pit's half-extent
export const BATTLE_LIVES = 3;
export const BATTLE_FIELD = 4;

// Jersey barriers and shipping containers as cover, each an oriented box
// { x, z, hw, hl, h, ry, colour, kind }. The perimeter wall is drawn and
// collided with separately, as a ring at BATTLE_HALF.
export const BATTLE_OBSTACLES = [
  { x: -14, z: -10, hw: 6.2, hl: 1.4, h: 2.6, ry: 0.3, colour: 0x2d6fa8, kind: "container" },
  { x: 16, z: 8, hw: 6.2, hl: 1.4, h: 2.6, ry: -0.4, colour: 0xb8342a, kind: "container" },
  { x: 0, z: 0, hw: 4.4, hl: 1.2, h: 1.1, ry: 0, colour: 0xd9d6cc, kind: "barrier" },
  { x: -18, z: 18, hw: 4.2, hl: 1.1, h: 1.1, ry: 0.9, colour: 0xd9d6cc, kind: "barrier" },
  { x: 18, z: -18, hw: 4.2, hl: 1.1, h: 1.1, ry: -0.9, colour: 0xd9d6cc, kind: "barrier" },
  { x: -22, z: -22, hw: 5.4, hl: 1.3, h: 2.6, ry: 0.5, colour: 0x2a8a52, kind: "container" },
  { x: 22, z: 22, hw: 5.4, hl: 1.3, h: 2.6, ry: -0.5, colour: 0xd8a12a, kind: "container" },
];

// Eight supply crates, spread round the pit — the same item table as the race.
export const BATTLE_BOXES = [[0, 22], [0, -22], [22, 0], [-22, 0], [13, 13], [-13, -13], [13, -13], [-13, 13]];

const BATTLE_SPAWNS = [[0, BATTLE_HALF - 6], [BATTLE_HALF - 6, 0], [0, -(BATTLE_HALF - 6)], [-(BATTLE_HALF - 6), 0]];

// ------------------------------------------------------------------ helpers

const bClamp = (v, lo, hi) => (v < lo ? lo : v > hi ? hi : v);
function bWrap(a) { while (a > Math.PI) a -= 2 * Math.PI; while (a < -Math.PI) a += 2 * Math.PI; return a; }
function bRng(seed) {
  let a = (seed >>> 0) || 0x9e3779b9;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Physics parameters from a stat card — an arena car is a little quicker to turn than on a track. */
function bParams(vehicle) {
  const { speed, handling, weight } = vehicle.stats;
  const [w, , l] = vehicle.dims;
  return {
    top: 19 + speed * 1.9, accel: 9 + (6 - weight) * 1.2 + (5 - speed) * 0.4,
    turn: 1.7 + handling * 0.2, mass: 0.8 + weight * 0.45, w: w * vehicle.scale, l: l * vehicle.scale,
  };
}

/** Circle against an oriented box; returns null or the push-out (same maths as sim.js rcCircleBox). */
function bCircleBox(cx, cz, rad, bx, bz, bh, hw, hl) {
  const s = Math.sin(bh), c = Math.cos(bh);
  const dx = cx - bx, dz = cz - bz;
  const along = dx * s + dz * c, side = dx * c - dz * s;
  const ca = bClamp(along, -hl, hl), cs = bClamp(side, -hw, hw);
  const ea = along - ca, es = side - cs;
  const dist2 = ea * ea + es * es;
  if (dist2 >= rad * rad) return null;
  let nx, nz, pen;
  if (dist2 > 1e-9) {
    const d = Math.sqrt(dist2), la = ea / d, ls = es / d;
    nx = la * s + ls * c; nz = la * c - ls * s; pen = rad - d;
  } else {
    const pa = hl - Math.abs(along), ps = hw - Math.abs(side);
    if (pa < ps) { const g = Math.sign(along) || 1; nx = g * s; nz = g * c; pen = pa + rad; }
    else { const g = Math.sign(side) || 1; nx = g * c; nz = -g * s; pen = ps + rad; }
  }
  return { nx, nz, pen };
}

// ------------------------------------------------------------------ setup

/**
 * A new battle. `racers` is a list of { vehicle (id), human, name, player };
 * the arena fills to `field` (BATTLE_FIELD, 4) with AI. `seed` makes every
 * headless run and every local match reproducible.
 */
export function rcCreateBattle({ racers = [], field = BATTLE_FIELD, seed = 1 } = {}) {
  const rng = bRng(seed);
  const list = racers.slice(0, field).map((r) => ({ ...r }));
  const taken = new Set(list.map((r) => r.vehicle));
  const pool = RC_VEHICLES.filter((v) => !taken.has(v.id));
  while (list.length < field) {
    const v = pool.length ? pool.splice(Math.floor(rng() * pool.length), 1)[0] : RC_VEHICLES[Math.floor(rng() * RC_VEHICLES.length)];
    list.push({ vehicle: v.id, human: false });
  }
  const battle = {
    t: 0, phase: "fight", rng, seed, finished: 0, winner: null,
    racers: [], boxes: BATTLE_BOXES.map(([x, z]) => ({ x, z, t: 0 })), drops: [], events: [],
  };
  list.forEach((spec, i) => {
    const vehicle = RC_VEHICLES.find((v) => v.id === spec.vehicle) ?? RC_VEHICLES[0];
    const [sx, sz] = BATTLE_SPAWNS[i % BATTLE_SPAWNS.length];
    battle.racers.push({
      id: i, name: spec.name ?? `Fighter ${i + 1}`, vehicle: vehicle.id, veh: vehicle, human: !!spec.human, player: spec.player ?? null,
      p: bParams(vehicle), x: sx, z: sz, h: Math.atan2(-sx, -sz), v: 0,
      lives: BATTLE_LIVES, alive: true, place: null, outAt: null, itemsUsed: 0,
      item: null, rolling: null, rollT: 0, shieldT: 0, boostT: 0, spinT: 0, spinDir: 1, invulnT: 1.5,
      ai: { skill: 0.72 + rng() * 0.24, think: rng() * 0.3, itemT: rng() * 2, pref: (rng() - 0.5) * 0.7 },
    });
  });
  return battle;
}

// ------------------------------------------------------------------ AI

function bAIInput(battle, r, dt) {
  const inp = { steer: 0, throttle: 1, brake: 0, item: false };
  const ai = r.ai;
  // Wedged against an obstacle, the wall or another car: judged by actual
  // ground covered over the last beat, not by instantaneous speed (two cars
  // can sit nose to nose with their speeds cancelling every frame and never
  // read as "slow" for an instant). Back off, turn hard and let the
  // per-racer heading bias below carry it clear, so a fight can never wedge
  // forever — even against its own mirror image.
  ai.posT = (ai.posT ?? 0) + dt;
  if (ai.posT > 0.5) {
    const moved = Math.hypot(r.x - (ai.lastX ?? r.x), r.z - (ai.lastZ ?? r.z));
    if (moved < 1.0 && !(ai.unstickT > 0)) { ai.unstickT = 0.8 + battle.rng() * 0.6; ai.unstickDir = ai.pref >= 0 ? 1 : -1; }
    ai.lastX = r.x; ai.lastZ = r.z; ai.posT = 0;
  }
  if (ai.unstickT > 0) {
    ai.unstickT -= dt;
    inp.throttle = 0; inp.brake = 1; inp.steer = ai.unstickDir;
    return inp;
  }
  const others = battle.racers.filter((o) => o !== r && o.alive);
  if (!others.length) { inp.throttle = 0; return inp; }
  ai.think -= dt;
  if (ai.think <= 0 || ai.targetId == null) {
    ai.think = 0.3;
    const opp = others.reduce((a, b) => (!a || Math.hypot(b.x - r.x, b.z - r.z) < Math.hypot(a.x - r.x, a.z - r.z) ? b : a), null);
    ai.targetId = opp.id;
  }
  const opp = others.find((o) => o.id === ai.targetId) ?? others[0];
  // Empty-handed, head for the nearest live supply crate — items only, so
  // this is the only way to arm up. Holding one, close on the nearest
  // opponent to use it.
  let target = opp;
  if (!r.item && !r.rolling) {
    let best = null, bd = Infinity;
    for (const b of battle.boxes) { if (b.t > 0) continue; const d = Math.hypot(b.x - r.x, b.z - r.z); if (d < bd) { bd = d; best = b; } }
    if (best) target = best;
  }
  // Steer straight for the target. Wedging against cover or the wall is the
  // stuck-detector's job above, not a potential field here — one that tried
  // to also steer round obstacles fought the wall's own sliding response
  // hard enough to orbit the boundary forever, which was worse.
  const dx = target.x - r.x, dz = target.z - r.z;
  const dist = Math.hypot(dx, dz);
  // A small fixed per-racer bias, so two cars closing head-on never make the
  // identical decision forever.
  const desired = Math.atan2(dx, dz) + ai.pref * Math.max(0, 1 - dist / 14);
  const diff = bWrap(desired - r.h);
  inp.steer = bClamp(diff * (2.4 + ai.skill), -1, 1);
  inp.throttle = dist > 4 ? 1 : 0.5;
  if (r.item) {
    ai.itemT -= dt;
    const oppDist = Math.hypot(opp.x - r.x, opp.z - r.z);
    const oppDiff = Math.abs(bWrap(Math.atan2(opp.x - r.x, opp.z - r.z) - r.h));
    if (ai.itemT <= 0 && (oppDist < 28 || oppDiff < 0.55)) { inp.item = true; ai.itemT = 1 + battle.rng() * 2; }
  }
  return inp;
}

// ------------------------------------------------------------------ items

function bDrop(battle, r, kind, back, off, rad, ttl) {
  const s = Math.sin(r.h), c = Math.cos(r.h);
  const x = r.x - s * back + c * off, z = r.z - c * back - s * off;
  battle.drops.push({ id: battle.drops.length + 1, kind, x, z, r: rad, ttl, owner: r.id, born: battle.t });
}

function bHit(battle, r, why) {
  if (!r.alive || r.invulnT > 0) return false;
  if (r.shieldT > 0) { r.shieldT = 0; battle.events.push({ type: "shield", id: r.id, why }); return false; }
  r.lives -= 1;
  r.spinT = 0.8; r.spinDir = battle.rng() < 0.5 ? -1 : 1;
  battle.events.push({ type: "hit", id: r.id, why, lives: r.lives });
  if (r.lives <= 0) {
    r.alive = false; r.outAt = battle.t;
    r.place = battle.racers.filter((o) => o.alive).length + 1;
    battle.events.push({ type: "out", id: r.id });
  } else {
    const [sx, sz] = BATTLE_SPAWNS[Math.floor(battle.rng() * BATTLE_SPAWNS.length)];
    r.x = sx; r.z = sz; r.v = 0; r.invulnT = 1.5;
  }
  return true;
}

/** Fire the racer's held item. Exported so a checker can fire each one, as sim.js's rcUseItem is. */
export function rcBattleUseItem(battle, r, forced = null) {
  const item = forced ?? r.item;
  if (!item) return false;
  if (item === "cones") { for (const off of [-1.3, 0, 1.3]) bDrop(battle, r, "cone", r.p.l / 2 + 2.2 + Math.abs(off) * 0.6, off, 0.5, 16); }
  else if (item === "paint") bDrop(battle, r, "paint", r.p.l / 2 + 2.6, 0, 2.4, 12);
  else if (item === "hardhat") r.shieldT = 8;
  else if (item === "horn") {
    for (const o of battle.racers) {
      if (o === r || !o.alive) continue;
      const dx = o.x - r.x, dz = o.z - r.z, dist = Math.hypot(dx, dz);
      if (dist < 15) {
        if (!bHit(battle, o, "horn")) continue;
        const push = (15 - dist) * 0.5 / o.p.mass;
        o.x += (dx / (dist || 1)) * push; o.z += (dz / (dist || 1)) * push;
      }
    }
  } else if (item === "tow") {
    let best = null, bd = 40;
    for (const o of battle.racers) { if (o === r || !o.alive) continue; const d = Math.hypot(o.x - r.x, o.z - r.z); if (d < bd) { bd = d; best = o; } }
    if (best) { r.h = Math.atan2(best.x - r.x, best.z - r.z); r.boostT = Math.max(r.boostT, 1.1); } else r.boostT = Math.max(r.boostT, 1.0);
  } else if (item === "flatbed") r.boostT = Math.max(r.boostT, 2.2);
  if (!forced) r.item = null;
  r.itemsUsed += 1;
  battle.events.push({ type: "item", id: r.id, item });
  return true;
}

function bRollItem(battle) {
  const ids = RC_ITEMS.map((i) => i.id);
  return ids[Math.floor(battle.rng() * ids.length)];
}

// ------------------------------------------------------------------ physics

function bDrive(battle, r, inp, dt) {
  const P = r.p;
  let steer = bClamp(Number(inp.steer) || 0, -1, 1);
  let thr = bClamp(Number(inp.throttle) || 0, 0, 1);
  const brk = bClamp(Number(inp.brake) || 0, 0, 1);
  if (r.spinT > 0) { steer = 0; thr = 0; }
  let cap = P.top;
  if (r.boostT > 0) cap *= 1.35;
  if (r.spinT > 0) cap *= 0.3;
  if (brk > 0.05) { if (r.v > 0.8) r.v -= 22 * brk * dt; else r.v = Math.max(-6, r.v - 9 * brk * dt); }
  else if (thr > 0) { if (r.v < 0) r.v += 16 * dt; else r.v += thr * P.accel * Math.max(0.1, 1 - r.v / Math.max(1, cap)) * dt; }
  else r.v -= Math.sign(r.v) * Math.min(Math.abs(r.v), 4 * dt);
  if (r.boostT > 0) r.v += 22 * dt;
  if (r.v > cap) r.v = cap;
  let yaw = steer * P.turn * Math.min(1, Math.abs(r.v) / 6) * (r.v < -0.2 ? -1 : 1);
  if (r.spinT > 0) yaw = r.spinDir * 6.5;
  r.h = bWrap(r.h + yaw * dt);
  r.x += Math.sin(r.h) * r.v * dt;
  r.z += Math.cos(r.h) * r.v * dt;
  // The arena wall is round (rcBuildBattleArena): push back onto it and damp
  // only the component of speed driving further out, leaving heading alone
  // — the AI's own steering (toward its target, away from the wall) still
  // owns r.h every frame, so a car cannot get stuck riding the boundary the
  // way overwriting its heading here would.
  const lim = BATTLE_HALF - P.w / 2 - 1;
  const distC = Math.hypot(r.x, r.z);
  if (distC > lim && distC > 1e-4) {
    const nx = r.x / distC, nz = r.z / distC;
    r.x = nx * lim; r.z = nz * lim;
    const into = Math.sin(r.h) * r.v * nx + Math.cos(r.h) * r.v * nz;
    if (into > 0) r.v -= into;
  }
  for (const o of BATTLE_OBSTACLES) {
    const hit = bCircleBox(r.x, r.z, P.w * 0.55, o.x, o.z, o.ry ?? 0, o.hw, o.hl);
    if (hit) {
      r.x += hit.nx * hit.pen; r.z += hit.nz * hit.pen;
      const into = Math.sin(r.h) * r.v * hit.nx + Math.cos(r.h) * r.v * hit.nz;
      if (into > 0) r.v -= into;
    }
  }
  // A hard safety clamp: several overlapping pushes in one frame (the wall
  // and more than one crate of cover at once) must never compound into a
  // runaway speed.
  r.v = bClamp(r.v, -P.top * 1.5, P.top * 1.5);
  r.boostT = Math.max(0, r.boostT - dt);
  r.spinT = Math.max(0, r.spinT - dt);
  r.shieldT = Math.max(0, r.shieldT - dt);
  r.invulnT = Math.max(0, r.invulnT - dt);
}

function bCollide(battle) {
  const R = battle.racers.filter((r) => r.alive);
  for (let i = 0; i < R.length; i++) {
    for (let j = i + 1; j < R.length; j++) {
      const a = R[i], b = R[j];
      const dx = b.x - a.x, dz = b.z - a.z, dist = Math.hypot(dx, dz), rad = (a.p.w + b.p.w) * 0.28;
      if (dist >= rad || dist < 1e-6) continue;
      // Items only: bumping another car just bounces both apart, no life lost.
      const pen = rad - dist, nx = dx / dist, nz = dz / dist, ma = a.p.mass, mb = b.p.mass, tot = ma + mb;
      a.x -= nx * pen * (mb / tot); a.z -= nz * pen * (mb / tot);
      b.x += nx * pen * (ma / tot); b.z += nz * pen * (ma / tot);
      const rel = (Math.sin(a.h) * nx + Math.cos(a.h) * nz) * a.v - (Math.sin(b.h) * nx + Math.cos(b.h) * nz) * b.v;
      if (rel > 0) { a.v -= rel * (mb / tot) * 0.6; b.v += rel * (ma / tot) * 0.6; }
    }
  }
  for (const r of R) {
    for (let k = battle.drops.length - 1; k >= 0; k--) {
      const h = battle.drops[k];
      if (h.owner === r.id && battle.t - h.born < 0.6) continue;
      if (Math.hypot(h.x - r.x, h.z - r.z) < h.r + r.p.w * 0.5) {
        if (h.kind === "paint") bHit(battle, r, "paint"); else bHit(battle, r, "cone");
        battle.drops.splice(k, 1);
      }
    }
  }
}

function bPickup(battle, r, dt) {
  for (const b of battle.boxes) {
    if (b.t > 0) continue;
    if (Math.hypot(b.x - r.x, b.z - r.z) < 2.2 + r.p.w * 0.4) {
      b.t = 5;
      if (!r.item && !r.rolling) { r.rolling = bRollItem(battle); r.rollT = 1.0; }
    }
  }
  if (r.rolling) {
    r.rollT -= dt;
    if (r.rollT <= 0) { r.item = r.rolling; r.rolling = null; }
  }
}

// ------------------------------------------------------------------ step

/**
 * Advance the battle by dt seconds. `inputs` maps a racer id to its input
 * ({ steer, throttle, brake, item }); a racer with no entry, and every racer
 * that is not human, is driven by the AI. Events append to battle.events;
 * the caller drains them.
 */
export function rcBattleStep(battle, dt, inputs = {}) {
  if (battle.phase === "done") return battle;
  battle.t += dt;
  for (const r of battle.racers) {
    if (!r.alive) continue;
    const inp = r.human ? (inputs[r.id] ?? {}) : bAIInput(battle, r, dt);
    if (inp.item && r.item) rcBattleUseItem(battle, r);
    bDrive(battle, r, inp, dt);
  }
  bCollide(battle);
  for (const r of battle.racers) if (r.alive) bPickup(battle, r, dt);
  for (const b of battle.boxes) if (b.t > 0) b.t = Math.max(0, b.t - dt);
  for (let k = battle.drops.length - 1; k >= 0; k--) {
    const h = battle.drops[k];
    h.ttl -= dt;
    if (h.ttl <= 0) battle.drops.splice(k, 1);
  }
  const alive = battle.racers.filter((r) => r.alive);
  if (alive.length <= 1 && battle.phase === "fight") {
    battle.phase = "done";
    if (alive.length === 1) { alive[0].place = 1; battle.winner = alive[0].id; }
    battle.finished = battle.racers.length;
    battle.events.push({ type: "battledone", winner: battle.winner });
  }
  return battle;
}

/** The results table, winner first. */
export function rcBattleStandings(battle) {
  return battle.racers.slice().sort((a, b) => (a.place ?? 99) - (b.place ?? 99)).map((r) => ({
    place: r.place, id: r.id, name: r.name, vehicle: r.vehicle, human: r.human, player: r.player,
    lives: r.lives, itemsUsed: r.itemsUsed,
  }));
}

// ------------------------------------------------------------------ render
//
// Everything below touches three.js; tools/check_race.mjs exercises it
// through the same stubbed THREE it uses for world.js, never directly.
import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import { box, group, mat, mergeStatic } from "../../shared/kit.js";
import { rcBuildVehicle } from "./world.js";

/** The arena's fixed geometry: floor, perimeter wall and the cover boxes. */
export function rcBuildBattleArena(root) {
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(BATTLE_HALF * 2 + 24, BATTLE_HALF * 2 + 24), mat(0x2c2a26, { finish: "concrete", rough: 0.92 }));
  floor.rotation.x = -Math.PI / 2;
  root.add(floor);
  const g = group(root);
  const seg = 28, wallH = 3.4;
  for (let i = 0; i < seg; i++) {
    const a0 = (i / seg) * Math.PI * 2;
    const x = Math.cos(a0) * (BATTLE_HALF + 2), z = Math.sin(a0) * (BATTLE_HALF + 2);
    const m = box(g, 3.2, wallH, 0.7, x, wallH / 2, z, 0xd9d6cc, { finish: "painted" });
    m.rotation.y = a0;
  }
  for (const o of BATTLE_OBSTACLES) {
    const m = box(g, o.hw * 2, o.h, o.hl * 2, o.x, o.h / 2, o.z, o.colour, { finish: "painted" });
    m.rotation.y = o.ry ?? 0;
  }
  mergeStatic(g, { local: true });
  root.add(new THREE.HemisphereLight(0xbfd0ff, 0x1a1a22, 1.0));
  const sun = new THREE.DirectionalLight(0xffe9c0, 0.95);
  sun.position.set(30, 70, 20);
  root.add(sun);
  return { wall: g };
}

/** Racer models, item crates and drops for one battle. */
export function rcBuildBattleWorld(root, battle) {
  const arena = rcBuildBattleArena(root);
  const models = battle.racers.map((r) => rcBuildVehicle(root, r.veh.builder, r.veh.scale, { colour: r.veh.colour, fleetName: "SITE ARENA", unitNumber: String(r.id + 1) }));
  const crateGeo = new THREE.BoxGeometry(1.4, 1.4, 1.4);
  const crateMat = new THREE.MeshStandardMaterial({ color: 0xf2c230, emissive: 0x402d00, emissiveIntensity: 0.4 });
  const crates = battle.boxes.map((b) => { const m = new THREE.Mesh(crateGeo, crateMat); m.position.set(b.x, 0.9, b.z); root.add(m); return m; });
  const handle = {
    models, crates, arena,
    meshCount() { let n = 0; root.traverse((o) => { if (o.isMesh && o.visible !== false) n += 1; }); return n; },
    update(battle2, dt, now) {
      battle2.racers.forEach((r, i) => {
        const m = models[i];
        m.visible = r.alive;
        m.position.set(r.x, 0, r.z);
        m.rotation.y = r.h;
      });
      battle2.boxes.forEach((b, i) => { crates[i].visible = b.t <= 0; crates[i].rotation.y = now * 1.4 + i; });
    },
  };
  return handle;
}
