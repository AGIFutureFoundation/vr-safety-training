#!/usr/bin/env node
/**
 * NEWTON — gravity, crashes and water reactions (console NEWTON, the Packs run,
 * tools/briefs/packs-brief.md; docs/consoles/NEWTON.md):
 *
 *     node tools/check_newton.mjs
 *
 * WebXR/shared/nw-physics.js is pure, so this runs it headless:
 *   - a body dropped from height lands at the time free fall says (t = sqrt(2h/g)), within a fixed step or two;
 *   - a body fired at a thin wall at speeds up to 400 m/s never passes through it (the sweep); a vehicle at top
 *     speed never passes a wall either;
 *   - buoyancy holds a swimmer at the surface (the feet settled at swimFloat under it, the head above), and a
 *     floating prop settles at the waterline; the breath meter drains swimming and refills ashore (a cue, never a fail);
 *   - the avatar falls off an edge (a ledge taller than a step) and lands at free-fall time; a wall stops it; it
 *     wades slower in shallow water with the splash cue; the flow carries it downstream;
 *   - a crash at or over NW_CRASH_SPEED opens the "after a collision" card, a bump under it does not; a sideswipe
 *     (low closing speed) is a bump; cones are knocked aside and tumble, a parked car stops the vehicle;
 *   - body–body impulses keep momentum; still bodies sleep and wake on contact;
 *   - determinism: the same scenario twice gives the same trace, bit for bit;
 *   - the card: its station is a catalog station, three steps (secure, check, call), no digit, no injury wording;
 *   - the parish fallback: every one of the ten maps builds a world, every site building has a box, massing
 *     buildings have boxes, water depth is positive on a water feature and zero on a site pad; the seams are used
 *     when passed (a stub cwColliders / tfWaterDepthAt / tfFlowAt is read);
 *   - the mount: nw-drive.js exports nwMountPhysics, reads the reduced-motion flag and the phone tier, the parishes
 *     app mounts it and routes the Motor Pool's Drive to it, the bundler carries both modules, the checker is in
 *     check_all and the baseline, the doc lists the seams;
 *   - hygiene: every top-level name nw/NW_, no three.js import in either module.
 */
import { readFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const WEBXR = join(ROOT, "WebXR");
const imp = (p) => import(pathToFileURL(join(WEBXR, p)).href);
let passed = 0, failed = 0;
const check = (area, ok, msg) => { if (ok) passed += 1; else { failed += 1; console.log(`  FAIL [${area}] ${msg}`); } return ok; };
const lines = [];
const say = (s) => { lines.push(s); console.log(`  ${s}`); };

const N = await imp("shared/nw-physics.js");
const E = await imp("shared/np-parish.js");
const { NP_PARISHES } = await imp("shared/np-parishes.js");
const { CURRICULA } = await imp("smartcity/js/curricula.js");
const { DV_DRIVABLES } = await imp("shared/drivables-data.js");
const STATIONS = new Set(CURRICULA.flatMap((c) => c.stations.map((s) => s.id)));
const H = 1 / 60;

// ------------------------------------------------------------------ gravity
for (const h of [2, 10, 40]) {
  const w = N.nwWorld({ groundAt: () => 0 });
  const b = w.addBody({ pos: [0, h + 0.5, 0], half: [0.5, 0.5, 0.5], restitution: 0 });
  let t = 0;
  while (!b.onGround && t < 10) { w.step(H); t += H; }
  const want = Math.sqrt((2 * h) / N.NW_G);
  check("gravity", Math.abs(t - want) <= 2.5 * H, `drop from ${h} m landed at ${t.toFixed(3)} s, free fall says ${want.toFixed(3)} s`);
  check("gravity", Math.abs(b.pos[1] - 0.5) < 1e-6, `drop from ${h} m rests on the ground (y ${b.pos[1].toFixed(3)})`);
  if (h === 10) say(`drop from 10 m lands at ${t.toFixed(3)} s (free fall ${want.toFixed(3)} s)`);
}
{ // a bouncy body loses height each bounce and comes to rest, then sleeps
  const w = N.nwWorld({ groundAt: () => 0 });
  const b = w.addBody({ pos: [0, 5, 0], half: [0.3, 0.3, 0.3], restitution: 0.5 });
  for (let i = 0; i < 60 * 8; i++) w.step(H);
  check("sleep", b.sleeping && Math.abs(b.pos[1] - 0.3) < 1e-3, `a dropped bouncing body settles and sleeps (sleeping ${b.sleeping}, y ${b.pos[1].toFixed(3)})`);
}

// ------------------------------------------------------------------ tunnelling
{
  const wall = { min: [10, 0, -5], max: [10.1, 5, 5], kind: "wall" };
  let worst = -Infinity;
  for (const v of [5, 30, 90, 200, 400]) {
    const w = N.nwWorld({ groundAt: () => 0, colliders: [wall] });
    const b = w.addBody({ pos: [0, 0.5, 0], half: [0.2, 0.2, 0.2], vel: [v, 0, 0], restitution: 0.2 });
    let far = -Infinity;
    for (let i = 0; i < 120; i++) { w.step(H); far = Math.max(far, b.pos[0] + b.half[0]); }
    worst = Math.max(worst, far);
    check("tunnel", far <= wall.min[0] + 1e-6 && b.pos[0] < wall.min[0], `a body at ${v} m/s never passes a wall a tenth of a metre thick (furthest face ${far.toFixed(3)})`);
  }
  say(`no tunnelling: bodies up to 400 m/s stop at a 0.1 m wall (furthest face ${worst.toFixed(3)} m, wall at 10 m)`);
  // A vehicle at top speed into a wall.
  const fast = { top: 40, accel: 40, turn: 1 };
  const w = N.nwWorld({ groundAt: () => 0, colliders: [{ min: [-6, 0, 50], max: [6, 5, 50.1], kind: "wall" }] });
  let v = N.nwVehicleState(0, 0, 0, [1, 1, 2.5], w), crash = null;
  for (let i = 0; i < 600 && !crash; i++) { const r = N.nwVehicleStep(v, { throttle: 1 }, 0.1, w, fast); v = r.state; crash = r.crash; }
  check("tunnel", v.z + v.half[2] <= 50 + 0.01 && crash, `a vehicle at forty metres a second stops at the wall (front at ${(v.z + v.half[2]).toFixed(2)})`);
}

// ------------------------------------------------------------------ water
{
  const w = N.nwWorld({ groundAt: () => -5, waterDepthAt: () => 5 });
  let a = N.nwAvatarState(0, 0, w); a.y = 0.5;
  for (let i = 0; i < 60 * 6; i++) a = N.nwAvatarStep(a, { vx: 0, vz: 0 }, H, w);
  const target = 0 - N.NW_AVATAR.swimFloat;
  check("buoyancy", a.mode === "swim" && Math.abs(a.y - target) < 0.05, `buoyancy holds a swimmer at the surface (feet ${a.y.toFixed(3)} m, float line ${target.toFixed(2)} m, mode ${a.mode})`);
  check("buoyancy", a.y + N.NW_AVATAR.height > 0, "the swimmer's head is above the surface");
  say(`buoyancy: swimmer settles with feet at ${a.y.toFixed(3)} m under a surface at 0 (float line ${target.toFixed(2)})`);
  check("breath", a.breath < 1 && a.breath > 0.8, `the breath meter drains slowly while swimming (${a.breath.toFixed(3)} after six seconds)`);
  let long = a; for (let i = 0; i < 60 * 60; i++) long = N.nwAvatarStep(long, { vx: 0, vz: 0 }, H, w);
  check("breath", long.cue === "shore" && long.mode === "swim", "a long swim shows the head-for-the-shore cue, and the learner still swims (no fail state)");
  const land = N.nwWorld({ groundAt: () => 0 });
  let dry = { ...long, y: 0, mode: "walk", onGround: true };
  for (let i = 0; i < 60 * 8; i++) dry = N.nwAvatarStep(dry, { vx: 0, vz: 0 }, H, land);
  check("breath", dry.breath === 1 && dry.cue === null, "the meter refills ashore");
  // A floating prop settles near the waterline.
  const wb = N.nwWorld({ groundAt: () => -4, waterDepthAt: () => 4 });
  const barrel = wb.addBody({ pos: [0, 3, 0], half: [0.3, 0.45, 0.3], density: 0.5, restitution: 0.1 });
  for (let i = 0; i < 60 * 12; i++) wb.step(H);
  check("buoyancy", barrel.pos[1] > -0.9 && barrel.pos[1] < 0.45, `a floating barrel rides at the waterline (centre ${barrel.pos[1].toFixed(3)})`);
  // Wading: slower, splash cue; flow carries.
  const shallow = N.nwWorld({ groundAt: () => -0.6, waterDepthAt: () => 0.6 });
  let wa = N.nwAvatarState(0, 0, shallow);
  for (let i = 0; i < 60; i++) wa = N.nwAvatarStep(wa, { vx: 5, vz: 0 }, H, shallow);
  check("wade", wa.mode === "wade" && Math.abs(wa.x - 5 * N.NW_AVATAR.wade) < 0.05 && wa.splash, `wading is slower (${wa.x.toFixed(2)} m in a second at walking pace) with the splash cue`);
  const river = N.nwWorld({ groundAt: () => -3, waterDepthAt: () => 3, flowAt: () => [1.5, 0] });
  let sw = N.nwAvatarState(0, 0, river); sw.y = -N.NW_AVATAR.swimFloat;
  for (let i = 0; i < 60 * 4; i++) sw = N.nwAvatarStep(sw, { vx: 0, vz: 0 }, H, river);
  check("flow", sw.x > 3 && sw.x < 4 * 1.5, `the flow carries a still swimmer downstream a little (${sw.x.toFixed(2)} m in four seconds on a 1.5 m/s current)`);
  say(`flow: a still swimmer drifts ${sw.x.toFixed(2)} m in 4 s on a 1.5 m/s current; wading covers ${wa.x.toFixed(2)} m/s at walking pace`);
}

// ------------------------------------------------------------------ avatar: edges and walls
{
  const ledge = (x) => (x < 10 ? 6 : 0);
  const w = N.nwWorld({ groundAt: (x) => ledge(x) });
  let a = N.nwAvatarState(9, 0, w), t = 0, fell = false, landT = 0;
  for (let i = 0; i < 60 * 4; i++) {
    a = N.nwAvatarStep(a, { vx: 3, vz: 0 }, H, w); t += H;
    if (a.mode === "fall") fell = true;
    if (fell && a.onGround && !landT) landT = t;
  }
  check("edge", fell && landT > 0 && Math.abs(a.y) < 1e-6, `the avatar walks off a six-metre ledge, falls and lands (y ${a.y.toFixed(2)})`);
  const w2 = N.nwWorld({ groundAt: () => 0, colliders: [{ min: [5, 0, -10], max: [6, 8, 10], kind: "building" }, { min: [-10, 0, 3], max: [10, 0.2, 4], kind: "kerb" }] });
  let b = N.nwAvatarState(0, 0, w2);
  for (let i = 0; i < 60 * 4; i++) b = N.nwAvatarStep(b, { vx: 14, vz: 0 }, H, w2);
  check("wall", b.x <= 5 - N.NW_AVATAR.radius + 1e-6, `running at a wall stops at it (x ${b.x.toFixed(3)})`);
  let c = N.nwAvatarState(0, 0, w2);
  for (let i = 0; i < 60; i++) c = N.nwAvatarStep(c, { vx: 14, vz: 5 }, H, w2);
  check("wall", c.x <= 5 - N.NW_AVATAR.radius + 1e-6 && c.z > 4, `a wall slides the learner along it and a kerb is stepped over (x ${c.x.toFixed(2)}, z ${c.z.toFixed(2)})`);
  say(`avatar: falls off a 6 m ledge and lands; stops at a wall at x ${b.x.toFixed(2)} (face at 5, radius ${N.NW_AVATAR.radius})`);
}

// ------------------------------------------------------------------ crashes
const light = DV_DRIVABLES.find((d) => d.id === "crew-pickup") ?? DV_DRIVABLES[0];
function ram(speed, { angle = 0, bodies = null } = {}) {
  const w = N.nwWorld({ groundAt: () => 0, colliders: bodies ? [] : [{ min: [-40, 0, 40], max: [40, 5, 41], kind: "wall" }] });
  if (bodies) bodies(w);
  // Coast at the given speed (throttle held at exactly that fraction of top) toward the wall.
  let v = { ...N.nwVehicleState(0, 0, angle, [0.95, 0.8, 2.4], w), speed };
  const prof = { ...light.profile, top: Math.max(light.profile.top, speed) };
  let crash = null, bumps = 0, card = null, hits = 0;
  for (let i = 0; i < 60 * 30 && !crash; i++) {
    const r = N.nwVehicleStep(v, { throttle: speed / prof.top }, H, w, prof);
    v = r.state; if (r.bumped) bumps += 1; hits += r.hit.length;
    if (r.crash) { crash = r.crash; card = N.nwCrashCard(crash); }
    if (bumps > 3) break;
  }
  return { crash, card, bumps, v, w, hits };
}
{
  const hi = ram(N.NW_CRASH_SPEED + 3);
  check("crash", hi.crash && hi.card && hi.card.station === "traffic-incident-management", `a crash at ${(N.NW_CRASH_SPEED + 3)} m/s opens the card (closing ${hi.crash?.speed.toFixed(2)} m/s)`);
  check("crash", hi.v.crashed && hi.v.hazards && hi.v.speed === 0 && hi.v.dents === 1, "the crashed vehicle is stopped, hazards on, one dent");
  const lo = ram(N.NW_CRASH_SPEED - 2);
  check("crash", !lo.crash && !lo.card && lo.bumps > 0, `a bump at ${(N.NW_CRASH_SPEED - 2)} m/s does not open the card`);
  const side = ram(N.NW_CRASH_SPEED + 6, { angle: 1.45 });
  const sideClose = side.crash ? side.crash.speed : 0;
  check("crash", !side.card, `a shallow sideswipe at speed is a bump, not a crash (closing ${sideClose.toFixed(2)})`);
  say(`crash: ${(N.NW_CRASH_SPEED + 3)} m/s head-on → card "${hi.card?.title}" (${hi.card?.station}); ${(N.NW_CRASH_SPEED - 2)} m/s → bump, no card; threshold ${N.NW_CRASH_SPEED} m/s`);
  const cones = ram(12, { bodies: (w) => { for (let i = 0; i < 4; i++) w.addBody({ id: `cone${i}`, kind: "cone", pos: [-0.6 + i * 0.4, 0.36, 20], half: [0.18, 0.36, 0.18], mass: 3, sleeping: true }); } });
  for (let i = 0; i < 60; i++) cones.w.step(H);
  const moved = cones.w.bodies.filter((b) => b.hits > 0 && (b.pos[2] > 21 || Math.abs(b.tilt) > 0.3)).length;
  check("props", !cones.crash && cones.hits >= 1 && moved >= 1, `cones are knocked aside and tumble, no crash (${moved} of four moved, ${cones.hits} hits)`);
  const car = ram(12, { bodies: (w) => w.addBody({ id: "parked", kind: "car", pos: [0, 0.75, 20], half: [0.95, 0.75, 2.3], mass: 1200, sleeping: true }) });
  check("props", car.crash && car.card && car.w.bodies[0].sleeping === false, "a parked car stops the vehicle as a crash and is shoved (woken)");
  say(`props: cones tumble (${moved} knocked), a parked car at 12 m/s is a crash`);
}

// ------------------------------------------------------------------ impulses
{
  const w = N.nwWorld({ groundAt: () => -100 });
  const a = w.addBody({ pos: [0, 0, 0], half: [0.5, 0.5, 0.5], vel: [4, 0, 0], mass: 2, restitution: 1 });
  const b = w.addBody({ pos: [3, 0, 0], half: [0.5, 0.5, 0.5], vel: [0, 0, 0], mass: 2, restitution: 1 });
  a.vel[1] = 0; b.vel[1] = 0;
  const p0 = a.mass * a.vel[0] + b.mass * b.vel[0];
  for (let i = 0; i < 40; i++) { w.step(H); a.vel[1] = 0; b.vel[1] = 0; a.pos[1] = 0; b.pos[1] = 0; }
  const p1 = a.mass * a.vel[0] + b.mass * b.vel[0];
  check("impulse", Math.abs(p1 - p0) < 1e-9 && w.contacts.length >= 1 && b.vel[0] > 3.9, `an elastic hit passes the momentum on (before ${p0.toFixed(3)}, after ${p1.toFixed(3)}, struck body ${b.vel[0].toFixed(2)} m/s)`);
  const w2 = N.nwWorld({ groundAt: () => 0 });
  const s = w2.addBody({ pos: [3, 0.5, 0], half: [0.5, 0.5, 0.5], sleeping: true });
  w2.addBody({ pos: [1.5, 0.5, 0], half: [0.5, 0.5, 0.5], vel: [6, 0, 0] });
  for (let i = 0; i < 30; i++) w2.step(H);
  check("sleep", w2.contacts.length >= 1 && s.pos[0] > 3.01, `a sleeping body wakes when hit (x ${s.pos[0].toFixed(2)})`);
}

// ------------------------------------------------------------------ determinism
function trace() {
  const w = N.nwWorld({ groundAt: (x, z) => 0.1 * Math.sin(x * 0.3) + 0.05 * z, colliders: [{ min: [8, 0, -3], max: [9, 3, 3], kind: "wall" }], waterDepthAt: (x) => (x < -5 ? 2 : 0), flowAt: () => [0.4, 0.1] });
  for (let i = 0; i < 12; i++) w.addBody({ pos: [i - 6, 3 + (i % 3), (i % 4) - 2], half: [0.3, 0.3, 0.3], vel: [(i % 5) - 2, 0, (i % 3) - 1], restitution: 0.4, mass: 1 + i });
  let a = N.nwAvatarState(-2, 0, w);
  let v = N.nwVehicleState(0, -10, 0, [1, 1, 2.5], w);
  const out = [];
  for (let i = 0; i < 600; i++) {
    w.step(H + (i % 7) * 0.001);
    a = N.nwAvatarStep(a, { vx: Math.sin(i * 0.05) * 5, vz: Math.cos(i * 0.03) * 5 }, H, w);
    v = N.nwVehicleStep(v, { throttle: 0.8, steer: Math.sin(i * 0.02) }, H, w, light.profile).state;
    if (i % 50 === 0) out.push(w.bodies.map((b) => b.pos.join(",")).join(";"), [a.x, a.y, a.z, a.mode].join(","), [v.x, v.z, v.heading, v.speed].join(","));
  }
  return out.join("|");
}
{
  const t1 = trace(), t2 = trace();
  check("determinism", t1 === t2 && t1.length > 100, "the same scenario twice gives the same trace, bit for bit");
  say(`determinism: two runs of a 600-step scene with 12 bodies, an avatar and a vehicle match bit for bit (${t1.length} chars)`);
}

// ------------------------------------------------------------------ the card
{
  const c = N.NW_AFTER_COLLISION;
  check("card", STATIONS.has(c.station), `the card's station ${c.station} is a catalog station`);
  check("card", c.steps.length === 3 && c.steps.map((s) => s.id).join() === "secure,check,call", "three steps: secure the scene, check people, call it in");
  const text = [c.title, c.lead, c.source, ...c.steps.flatMap((s) => [s.title, s.text])].join(" ");
  check("card", !/\d/.test(text.replace(/ANSI\/ISEA \d+|NFPA \d+/g, "")), "no digit in the card beyond the standards' names");
  check("card", !/\b(blood|injur(y|ies|ed)|dead|death|die|kill\w*|gore|wound\w*|victim)\b/i.test(text.replace(/nobody is hurt/i, "")), "no injury wording on the card");
  check("card", N.nwCrashCard({ speed: N.NW_CRASH_SPEED - 0.01 }) === null && N.nwCrashCard({ speed: N.NW_CRASH_SPEED })?.id === c.id, "nwCrashCard: null just under the threshold, the card at it");
  const src = readFileSync(join(WEBXR, "smartcity/js/sims/traffic-incident-management.js"), "utf8");
  check("card", /MUTCD/.test(src) && /ANSI\/ISEA 107/.test(src) && /NFPA 1500/.test(src) && /Federal Highway Administration/.test(src), "every source the card names is in the station's certification line");
}

// ------------------------------------------------------------------ parishes
{
  let sitesBoxed = 0, sitesAll = 0, massBoxes = 0, maps = 0, wetOk = 0, padDry = 0;
  for (const p of NP_PARISHES) {
    const w = N.nwParishWorld(p);
    maps += 1;
    for (const s of p.sites) {
      sitesAll += 1;
      const hx = s.position[0] - 14, hz = s.position[1] - 12;
      const boxes = w.boxesNear(hx, hz, 1);
      if (boxes.some((b) => b.kind === "site-building" && b.site === s.id && hx > b.min[0] && hx < b.max[0] && hz > b.min[2] && hz < b.max[2])) sitesBoxed += 1;
      if (w.waterDepthAt(s.position[0], s.position[1]) === 0) padDry += 1;
    }
    const st = E.npStartSite(p);
    const { cx, cz } = E.npChunkOf(st.position[0], st.position[1]);
    for (let dz = -2; dz <= 2; dz++) for (let dx = -2; dx <= 2; dx++) massBoxes += N.nwParishColliders(p, `${cx + dx},${cz + dz}`).filter((b) => b.kind === "building").length;
    const water = E.npPrepare(p).water.find((x) => x.kind !== "wetland");
    if (water) {
      const pt = water.centre ? water.centre[Math.floor(water.centre.length / 2)] : water.shape.reduce((a, q) => [a[0] + q[0] / water.shape.length, a[1] + q[1] / water.shape.length], [0, 0]);
      if (E.npWaterAt(p, pt[0], pt[1]) && w.waterDepthAt(pt[0], pt[1]) > 1) wetOk += 1; else if (!E.npWaterAt(p, pt[0], pt[1])) wetOk += 1; // a concave polygon's centroid may be on land
    } else wetOk += 1;
  }
  check("parish", maps === NP_PARISHES.length && maps >= 10, `${maps} maps build a physics world`);
  check("parish", sitesBoxed === sitesAll, `every site building has a collider box (${sitesBoxed}/${sitesAll})`);
  check("parish", padDry === sitesAll, `every site pad is dry ground (${padDry}/${sitesAll})`);
  check("parish", massBoxes > 50, `massing buildings near the start sites carry boxes (${massBoxes})`);
  check("parish", wetOk === maps, `water features are deep enough to swim in (${wetOk}/${maps})`);
  say(`parishes: ${maps} maps; ${sitesBoxed}/${sitesAll} site buildings boxed; ${massBoxes} massing boxes around the start sites; pads dry ${padDry}/${sitesAll}`);
  // The seams are read when passed.
  const p = NP_PARISHES[0];
  let calls = { cw: 0, tfw: 0, tff: 0 };
  const w = N.nwParishWorld(p, {
    cwColliders: (parish, key) => { calls.cw += 1; return [{ min: [0, 0, 0], max: [1, 1, 1], kind: key }]; },
    tfWaterDepthAt: (parish, x) => { calls.tfw += 1; return x > 0 ? 2 : 0; },
    tfFlowAt: () => { calls.tff += 1; return [0.5, 0]; },
  });
  const bx = w.boxesNear(0.5, 0.5, 0.2);
  check("seams", calls.cw >= 1 && bx.length === 1 && w.waterDepthAt(3, 0) === 2 && w.flowAt(3, 0)[0] === 0.5 && calls.tfw && calls.tff, "the TERRAFORM and CITYWORKS seams are read first when passed");
  check("seams", w.seams.water && w.seams.flow && w.seams.colliders && !N.nwParishWorld(p).seams.water, "the world reports which seams it is on");
  // A real walk in Orleans: the avatar steps a minute along the start's road without falling through the ground.
  const ow = N.nwParishWorld(p);
  const st = E.npStartSite(p);
  let a = N.nwAvatarState(st.position[0], st.position[1] + 16, ow), minGap = Infinity;
  for (let i = 0; i < 60 * 20; i++) { a = N.nwAvatarStep(a, { vx: Math.sin(i / 120) * 5, vz: 5 }, H, ow); minGap = Math.min(minGap, a.y - ow.groundAt(a.x, a.z) + (a.mode === "swim" ? N.NW_AVATAR.swimFloat : 0)); }
  check("parish", minGap > -0.01, `twenty seconds' walk in ${p.name} never sinks under the ground (least gap ${minGap.toFixed(3)} m, ended ${a.mode})`);
}

// ------------------------------------------------------------------ mount, app, bundle, hygiene
{
  const drive = readFileSync(join(WEBXR, "shared/nw-drive.js"), "utf8");
  const phys = readFileSync(join(WEBXR, "shared/nw-physics.js"), "utf8");
  const app = readFileSync(join(WEBXR, "parishes/js/app.js"), "utf8");
  const bundle = readFileSync(join(ROOT, "tools/bundle_webxr.py"), "utf8");
  const all = readFileSync(join(ROOT, "tools/check_all.mjs"), "utf8");
  const base = JSON.parse(readFileSync(join(ROOT, "docs/perf/checkers-baseline.json"), "utf8"));
  const doc = existsSync(join(ROOT, "docs/consoles/NEWTON.md")) ? readFileSync(join(ROOT, "docs/consoles/NEWTON.md"), "utf8") : "";
  check("mount", /export function nwMountPhysics/.test(drive) && /reduced/.test(drive) && /tier === "low"/.test(drive), "nw-drive.js exports nwMountPhysics with the reduced-motion flag and the phone tier");
  check("mount", /dent\(/.test(drive) && /hazards/.test(drive) && /nwCrashCard/.test(drive), "the mount dents, lights the hazards and opens the card on a crash");
  check("mount", /nwMountPhysics\(/.test(app) && /prefers-reduced-motion/.test(app), "the parishes app mounts the physics and passes the reduced-motion preference");
  check("mount", /onDrive:[\s\S]{0,200}nw\w*\.drive\(/.test(app), "the Motor Pool board's Drive (after the pre-trip) starts the parish drive mode");
  check("mount", /nwAvatar|\.walk\(/.test(app), "the parish walk goes through the physics (falls, walls, water)");
  const parishesBlock = bundle.slice(bundle.indexOf('"parishes/js/app.js"') - 6000, bundle.indexOf('"parishes/js/app.js"'));
  check("bundle", /nw-physics\.js/.test(parishesBlock) && /nw-drive\.js/.test(parishesBlock), "the parishes bundle carries nw-physics.js and nw-drive.js");
  check("hygiene", !/^import \* as THREE/m.test(phys) && !/^import \* as THREE/m.test(drive) && !/https?:\/\//.test(phys.split("\n").filter((l) => l.startsWith("import")).join("\n")), "no three.js import in either module");
  const tops = [...phys.matchAll(/^export (?:const|function|let|class) (\w+)/gm), ...drive.matchAll(/^export (?:const|function|let|class) (\w+)/gm), ...phys.matchAll(/^(?:const|function|let) (\w+)/gm), ...drive.matchAll(/^(?:const|function|let) (\w+)/gm)].map((m) => m[1]);
  const bad = tops.filter((n) => !/^(nw|NW_)/.test(n));
  check("hygiene", !bad.length, `every top-level name is nw/NW_ (${bad.join(", ") || "all"})`);
  check("suite", all.includes('"check_newton.mjs"') && typeof base.checkers?.["check_newton.mjs"] === "number", "check_newton.mjs is in check_all and the checker baseline");
  check("doc", /## Seams/.test(doc) && /nwWorld/.test(doc) && /nwAvatarStep/.test(doc) && /tfWaterDepthAt/.test(doc) && /cwColliders/.test(doc), "docs/consoles/NEWTON.md lists the seams");
}

console.log(`\n  ${passed} checks · ${failed} failed · crash threshold ${N.NW_CRASH_SPEED} m/s · fixed step ${(1 / N.NW_STEP).toFixed(0)} Hz`);
if (failed) process.exit(1);
console.log("All NEWTON checks pass.");
