/**
 * Headless checks for the Easter egg, Night Highway Circuit (WebXR/race).
 *
 *     node tools/check_race.mjs
 *
 * What is proved here, on every track in WebXR/race/tracks/:
 *
 *  1. **The track is sound.** The spline closes (the last sample meets the
 *     first at the sample spacing, with no kink), it never crosses itself at
 *     the same level (the figure of eight's crossing is an overpass), it
 *     carries at least six boost pads and eight item boxes, and no hazard —
 *     traffic, a crossing vehicle, a booth, a cone, a trench box, a slick —
 *     spawns inside the start grid.
 *  2. **A race runs to the flag.** An AI-only race at a coarse, fast time step
 *     goes three laps: every finisher crossed the line laps + 1 times with
 *     three lap times that add up to its race time, places are a permutation
 *     and follow finish times, positions during the race follow progress, and
 *     no position, speed or heading is ever NaN.
 *  3. **Items fire and expire.** Each of the six items is fired, dropped
 *     cones and paint expire on their timer, the hard hat blocks a hit.
 *  4. **The unlock rule and the saves.** A top-three Grand Prix opens the next
 *     class and nothing else does; the one localStorage key round-trips and a
 *     corrupt one falls back to a fresh save; ghosts and two-tab snapshots
 *     round-trip.
 *  5. **The world fits.** Each track's scene builds behind a stub three.js
 *     with at most 2,500 meshes before merging (the browser merges further),
 *     and the app is wired: bundled, linked from the homepage and registered
 *     in check_all.
 */
import { readFileSync, writeFileSync, mkdtempSync, rmSync, readdirSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const WEBXR = join(ROOT, "WebXR");
const RACE = join(WEBXR, "race");
const MESH_CEILING = 2500;

let failures = 0;
async function check(name, fn) {
  try { await fn(); console.log(`  ✓ ${name}`); }
  catch (err) { failures += 1; console.log(`  ✗ ${name}\n      ${err.stack ?? err}`); }
}
function assert(ok, message) { if (!ok) throw new Error(message); }

const T = await import(pathToFileURL(join(RACE, "js", "track.js")).href);
const S = await import(pathToFileURL(join(RACE, "js", "sim.js")).href);
const { RACE_TRACKS } = await import(pathToFileURL(join(RACE, "js", "tracks.js")).href);
const compiled = RACE_TRACKS.map((def) => T.rcCompileTrack(def));

console.log("Night Highway Circuit — self-test\n");

// ------------------------------------------------------------ 1. tracks

await check(`five or more tracks, one data module each, all registered`, () => {
  const files = readdirSync(join(RACE, "tracks")).filter((f) => f.endsWith(".js"));
  assert(RACE_TRACKS.length >= 5, `only ${RACE_TRACKS.length} tracks in race/js/tracks.js`);
  assert(files.length === RACE_TRACKS.length, `${files.length} files in race/tracks but ${RACE_TRACKS.length} registered`);
  const ids = new Set(RACE_TRACKS.map((t) => t.id));
  assert(ids.size === RACE_TRACKS.length, "two tracks share an id");
  for (const t of RACE_TRACKS) assert(t.name && t.blurb && Array.isArray(t.points) && t.env, `${t.id} is missing a name, blurb, points or env`);
});

for (const tr of compiled) {
  await check(`${tr.id}: the spline closes smoothly and never crosses itself at the same level`, () => {
    const c = T.rcClosure(tr);
    assert(Math.abs(c.gap - c.ds) < 0.05 * c.ds, `closing gap ${c.gap.toFixed(3)} m against a sample spacing of ${c.ds.toFixed(3)} m`);
    assert(c.maxTurn < 0.3, `a ${c.maxTurn.toFixed(3)} rad kink between neighbouring samples`);
    assert(c.minRadius > 8, `a ${c.minRadius.toFixed(1)} m corner is tighter than any racer can take`);
    const flaws = T.rcSelfApproaches(tr, tr.width - 1).filter((p) => p.dy < 4.5);
    assert(flaws.length === 0, `${flaws.length} same-level self-crossings, e.g. at s=${(flaws[0]?.a * tr.ds).toFixed(0)} and s=${(flaws[0]?.b * tr.ds).toFixed(0)}`);
    for (const k of ["x", "y", "z", "tx", "tz", "bank", "curv"]) assert(tr[k].every(Number.isFinite), `${k} has a non-finite sample`);
  });
  await check(`${tr.id}: at least six boost pads and eight item boxes, all on the road`, () => {
    assert(tr.boostPads.length >= 6, `${tr.boostPads.length} boost pads`);
    assert(tr.boxes.length >= 8, `${tr.boxes.length} item boxes`);
    for (const p of tr.boostPads) assert(Math.abs(p.d) + p.w / 2 <= tr.half, `a boost pad at d=${p.d} hangs off the road`);
    for (const b of tr.boxes) assert(Math.abs(b.d) <= tr.limit, `an item box at d=${b.d} is outside the barriers`);
  });
  await check(`${tr.id}: no hazard spawns inside the start grid`, () => {
    for (const seed of [1, 2, 3]) for (const cls of S.RC_CLASSES) {
      const race = S.rcCreateRace({ track: tr, cls, seed });
      for (const t of race.traffic) assert(!T.rcInGrid(tr, t.s), `${cls.id}/seed ${seed}: a ${t.kind} spawned in the grid at s=${t.s.toFixed(0)}`);
      for (const c of race.crossings) assert(!T.rcInGrid(tr, c.s, 20), `a ${c.kind} crosses at the grid (s=${c.s.toFixed(0)})`);
      for (const st of race.statics) assert(!T.rcInGrid(tr, st.s, 10), `a ${st.kind} stands in the grid (s=${st.s.toFixed(0)})`);
      for (const z of race.slicks) assert(!T.rcInGrid(tr, z.s0) && !T.rcInGrid(tr, z.s1), "a slick lies in the grid");
      for (const z of race.floods) assert(!T.rcInGrid(tr, z.s0) && !T.rcInGrid(tr, z.s1), "a tide gate's flood zone lies in the grid");
      // And the grid itself sits on the road, every car clear of the next.
      for (const r of race.racers) assert(T.rcInGrid(tr, r.s) && Math.abs(r.d) <= tr.limit, `${r.vehicle} starts off the grid`);
    }
  });
}

// ------------------------------------------------------------ mirror class

await check(`mirror class: every course compiles flipped, with its pads, boxes and closure intact`, () => {
  for (const def of RACE_TRACKS) {
    const mdef = T.rcMirrorTrackDef(def);
    assert(mdef.id === `${def.id}-mirror` && mdef.points.length === def.points.length, `${def.id}: a mirrored def should keep its point count`);
    const mtr = T.rcCompileTrack(mdef);
    const c = T.rcClosure(mtr);
    assert(Math.abs(c.gap - c.ds) < 0.05 * c.ds, `${mdef.id}: closing gap ${c.gap.toFixed(3)} m against a sample spacing of ${c.ds.toFixed(3)} m`);
    assert(c.maxTurn < 0.3, `${mdef.id}: a ${c.maxTurn.toFixed(3)} rad kink between neighbouring samples`);
    assert(c.minRadius > 8, `${mdef.id}: a ${c.minRadius.toFixed(1)} m corner is tighter than any racer can take`);
    assert(mtr.boostPads.length >= 6 && mtr.boxes.length >= 8, `${mdef.id}: lost pads or boxes when mirrored`);
    for (const p of mtr.boostPads) assert(Math.abs(p.d) + p.w / 2 <= mtr.half, `${mdef.id}: a mirrored boost pad at d=${p.d} hangs off the road`);
    for (const b of mtr.boxes) assert(Math.abs(b.d) <= mtr.limit, `${mdef.id}: a mirrored item box at d=${b.d} is outside the barriers`);
    const race = S.rcCreateRace({ track: mtr, cls: "journey", seed: 2 });
    for (const t of race.traffic) assert(!T.rcInGrid(mtr, t.s), `${mdef.id}: a ${t.kind} spawned in the mirrored grid`);
  }
});

// ------------------------------------------------------------ 2. races

const itemsFired = new Set();
const expiredByTtl = new Set();
for (const tr of compiled) {
  await check(`${tr.id}: an AI-only race at fast time goes three laps with sound lap and position logic`, () => {
    const race = S.rcCreateRace({ track: tr, cls: "journey", mode: "demo", seed: 7 });
    const dt = 1 / 30;
    let steps = 0, rankFaults = 0;
    const lapEvents = new Map();
    while (race.phase !== "done" && steps < 30 * 1500) {
      S.rcStep(race, dt, {});
      steps += 1;
      for (const e of race.events) {
        if (e.type === "item") itemsFired.add(e.item);
        if (e.type === "expire" && e.why === "ttl") expiredByTtl.add(e.kind);
        if (e.type === "lap") lapEvents.set(e.id, (lapEvents.get(e.id) ?? 0) + 1);
      }
      race.events.length = 0;
      for (const r of race.racers) {
        if (![r.x, r.y, r.z, r.v, r.h, r.m, r.s, r.d, r.progress].every(Number.isFinite)) throw new Error(`NaN in ${r.vehicle} at step ${steps}`);
      }
      if (race.phase === "race" && steps % 30 === 0) {
        const running = race.racers.filter((r) => r.finishT == null).sort((a, b) => a.place - b.place);
        for (let i = 1; i < running.length; i++) if (running[i].progress > running[i - 1].progress + 1e-6) rankFaults += 1;
      }
    }
    assert(race.phase === "done", `the race never ended (${steps} steps)`);
    assert(rankFaults === 0, `${rankFaults} ranking samples put a racer behind one with less progress`);
    const places = race.racers.map((r) => r.place).sort((a, b) => a - b);
    assert(places.every((p, i) => p === i + 1), `places are not 1..${race.racers.length}: ${places.join(",")}`);
    const byPlace = race.racers.slice().sort((a, b) => a.place - b.place);
    for (let i = 1; i < byPlace.length; i++) assert(byPlace[i].finishT >= byPlace[i - 1].finishT, "a later place has an earlier finish time");
    const home = race.racers.filter((r) => !r.projected);
    assert(home.length >= 6, `only ${home.length} of ${race.racers.length} AI racers finished three laps`);
    for (const r of home) {
      assert(r.crossings === race.laps + 1, `${r.vehicle} finished with ${r.crossings} line crossings`);
      assert(r.lapTimes.length === race.laps, `${r.vehicle} has ${r.lapTimes.length} lap times`);
      assert(lapEvents.get(r.id) === race.laps, `${r.vehicle} raised ${lapEvents.get(r.id)} lap events`);
      const sum = r.lapTimes.reduce((a, b) => a + b, 0);
      const first = r.finishT - sum;
      assert(first >= -1e-6 && first < 20, `${r.vehicle}'s laps add to ${sum.toFixed(2)} s against a finish of ${r.finishT.toFixed(2)} s`);
      const minLap = tr.L / (r.p.top * 1.4);
      for (const lt of r.lapTimes) assert(lt > minLap, `${r.vehicle} lapped in ${lt.toFixed(1)} s, faster than physics allows (${minLap.toFixed(1)} s)`);
    }
    const st = S.rcStandings(race);
    assert(st.length === race.racers.length && st[0].place === 1, "the standings table is not first to last");
    const pts = S.rcRacePoints(race);
    assert(pts[st[0].id] === S.RC_POINTS[0] && pts[st[st.length - 1].id] === S.RC_POINTS[st.length - 1], "Grand Prix points do not follow the places");
  });
}

// ------------------------------------------------------------ 3. items

await check("each of the six items fires, drops expire on their timer, and the hard hat blocks a hit", () => {
  const tr = compiled[0];
  const race = S.rcCreateRace({ track: tr, cls: "journey", mode: "demo", seed: 3, traffic: false });
  while (race.phase === "countdown") S.rcStep(race, 1 / 30, {});
  for (let i = 0; i < 90; i++) S.rcStep(race, 1 / 30, {});
  race.events.length = 0;
  const shooter = race.racers.slice().sort((a, b) => b.progress - a.progress)[3];
  for (const item of S.RC_ITEMS.map((i) => i.id)) {
    shooter.item = item;
    assert(S.rcUseItem(race, shooter), `${item} did not fire`);
    assert(shooter.item === null, `${item} stayed in the slot after firing`);
    itemsFired.add(item);
  }
  const fired = race.events.filter((e) => e.type === "item").map((e) => e.item);
  assert(fired.length === 6, `expected six item events, saw ${fired.join(",")}`);
  assert(shooter.shieldT > 0 || race.events.some((e) => e.type === "shield"), "the hard hat gave no shield");
  const drops = race.drops.length;
  assert(drops >= 4, `cones and paint left ${drops} drops`);
  // Everything the shooter left on the road is gone within its lifetime (or
  // when hit). The AI racers keep racing — and keep dropping their own cones —
  // so only the drops that existed at the moment of firing are held to it.
  const firedAt = race.t;
  for (let i = 0; i < 30 * 20; i++) S.rcStep(race, 1 / 30, {});
  const stale = race.drops.filter((h) => h.born <= firedAt);
  assert(stale.length === 0, `${stale.length} drops outlived their timer`);
  // The hard hat eats exactly one hit.
  const v = race.racers[5];
  v.shieldT = 5;
  v.spinT = 0;
  race.events.length = 0;
  v.item = "horn";
  const shooter2 = race.racers.find((o) => o !== v && Math.hypot(o.x - v.x, o.z - v.z) < 16) ?? race.racers[6];
  shooter2.x = v.x + 3; shooter2.z = v.z; shooter2.y = v.y;
  S.rcUseItem(race, shooter2, "horn");
  assert(v.shieldT === 0 && v.spinT === 0, "the shield did not absorb the horn blast");
  S.rcUseItem(race, shooter2, "horn");
  assert(v.spinT > 0, "without a shield the horn blast did not land");
});

await check("across the AI races every item was used and drops expired by their timers", () => {
  for (const id of S.RC_ITEMS.map((i) => i.id)) assert(itemsFired.has(id), `${id} never fired`);
  assert(expiredByTtl.size >= 1, "no dropped item ever expired on its timer during the races");
});

await check("the safety bonus pays for a signalled lane change, more with the mirrors checked", () => {
  const tr = compiled[1];
  const race = S.rcCreateRace({ track: tr, cls: "journey", racers: [{ vehicle: "sedan", human: true }], seed: 5, traffic: false });
  while (race.phase === "countdown") S.rcStep(race, 1 / 30, { 0: { throttle: 1 } });
  const me = race.racers[0];
  for (let i = 0; i < 60; i++) S.rcStep(race, 1 / 30, { 0: { throttle: 1 } });
  race.events.length = 0;
  const before = me.safety;
  S.rcStep(race, 1 / 30, { 0: { throttle: 1, lookback: true } });
  S.rcStep(race, 1 / 30, { 0: { throttle: 1, signal: me.d > 0 ? -1 : 1 } });
  const dir = me.signal.dir;
  for (let i = 0; i < 60 && me.safety === before; i++) S.rcStep(race, 1 / 30, { 0: { throttle: 1, steer: dir * 0.5 } });
  const ev = race.events.find((e) => e.type === "safety" && e.id === 0);
  assert(ev, "no safety bonus for a signalled lane change");
  assert(ev.mirrors && me.safety - before === 2, `mirrors were checked first, so the bonus should count double (got ${me.safety - before})`);
});

// ------------------------------------------------------------ 4. saves and the unlock rule

await check("the unlock rule: a top-three Grand Prix opens the next class, nothing else does", () => {
  let save = S.rcNewSave();
  assert(S.rcClassUnlocked(save, "apprentice") && !S.rcClassUnlocked(save, "journey") && !S.rcClassUnlocked(save, "master"), "a fresh save should open Apprentice only");
  let r = S.rcApplyGrandPrix(save, "apprentice", 4);
  assert(r.unlocked === null && !S.rcClassUnlocked(r.save, "journey"), "fourth place opened a class");
  r = S.rcApplyGrandPrix(r.save, "apprentice", 3);
  assert(r.unlocked === "journey" && S.rcClassUnlocked(r.save, "journey") && !S.rcClassUnlocked(r.save, "master"), "third place on Apprentice did not open Journey (and only Journey)");
  const again = S.rcApplyGrandPrix(r.save, "apprentice", 1);
  assert(again.unlocked === null, "re-opening an open class was reported as an unlock");
  r = S.rcApplyGrandPrix(again.save, "journey", 1);
  assert(r.unlocked === "master" && S.rcClassUnlocked(r.save, "master"), "a Journey win did not open Master");
  const top = S.rcApplyGrandPrix(r.save, "master", 1);
  assert(top.unlocked === null, "Master has no class above it");
  assert(r.save.gp.apprentice.best === 1 && r.save.gp.apprentice.runs === 3, "Grand Prix bests are not kept");
  assert(save.unlocked.length === 1, "applying a result mutated the save it was given");
});

await check("mirror class: a top-three Master Grand Prix opens it, nothing else does", () => {
  const save = S.rcNewSave();
  assert(save.mirror === false, "a fresh save should not carry Mirror");
  let r = S.rcApplyGrandPrix(save, "journey", 1);
  assert(r.mirrorUnlocked === false && r.save.mirror === false, "a Journey win should not open Mirror");
  r = S.rcApplyGrandPrix(r.save, "master", 4);
  assert(r.mirrorUnlocked === false && r.save.mirror === false, "fourth place on Master opened Mirror");
  r = S.rcApplyGrandPrix(r.save, "master", 3);
  assert(r.mirrorUnlocked === true && r.save.mirror === true, "third place on Master did not open Mirror");
  const again = S.rcApplyGrandPrix(r.save, "master", 1);
  assert(again.mirrorUnlocked === false, "re-opening Mirror was reported as a fresh unlock");
});

await check("one localStorage key holds the save; a corrupt value falls back to a fresh save", () => {
  const store = new Map();
  const fake = { getItem: (k) => (store.has(k) ? store.get(k) : null), setItem: (k, v) => store.set(k, String(v)) };
  const s0 = S.rcLoadSave(fake);
  assert(s0.unlocked.join() === "apprentice", "an empty store should give a fresh save");
  const s1 = S.rcApplyGrandPrix(s0, "apprentice", 2).save;
  S.rcOfferGhost(s1, "night-highway", "apprentice", 61.5, [[0, 7, 0, 0.1], [1, 7, 2, 0.12]]);
  assert(S.rcStoreSave(fake, s1), "the save did not store");
  assert([...store.keys()].length === 1 && store.has(S.RC_STORAGE_KEY), `expected exactly the one key ${S.RC_STORAGE_KEY}`);
  const s2 = S.rcLoadSave(fake);
  assert(S.rcClassUnlocked(s2, "journey") && s2.tt["night-highway|apprentice"].best === 61.5, "the save did not round-trip");
  assert(!S.rcOfferGhost(s2, "night-highway", "apprentice", 70, [[0, 0, 0, 0]]), "a slower lap replaced the best ghost");
  store.set(S.RC_STORAGE_KEY, "{not json");
  assert(S.rcLoadSave(fake).unlocked.join() === "apprentice", "a corrupt save was not replaced by a fresh one");
  store.set(S.RC_STORAGE_KEY, JSON.stringify({ v: 1, unlocked: ["master", "bogus"], gp: {}, tt: {} }));
  const odd = S.rcLoadSave(fake);
  assert(odd.unlocked.includes("apprentice") && !odd.unlocked.includes("bogus"), "an edited save kept an unknown class or lost Apprentice");
});

await check("time-trial ghosts and two-tab snapshots round-trip", () => {
  const rows = Array.from({ length: 40 }, (_, i) => [i * 3.3, 7 + Math.sin(i) * 0.4, -i * 1.7, (i * 0.05) % 3]);
  const back = S.rcGhostDecode(S.rcGhostEncode(rows));
  assert(back.length === rows.length, "ghost lost samples");
  for (let i = 0; i < rows.length; i++) for (let k = 0; k < 3; k++) assert(Math.abs(back[i][k] - rows[i][k]) <= 0.051, "ghost position drifted");
  const mid = S.rcGhostAt(back, 1.05);
  assert(mid && Math.abs(mid.x - (rows[10][0] + rows[11][0]) / 2) < 0.2, "ghost interpolation is off");
  const tr = compiled[0];
  const host = S.rcCreateRace({ track: tr, cls: "journey", racers: [{ vehicle: "sedan", human: true }], seed: 9 });
  const tab = S.rcCreateRace({ track: tr, cls: "journey", racers: [{ vehicle: "sedan", human: true }], seed: 9 });
  assert(host.racers.map((r) => r.vehicle).join() === tab.racers.map((r) => r.vehicle).join(), "the same seed gave the two tabs different grids");
  for (let i = 0; i < 300; i++) S.rcStep(host, 1 / 30, { 0: { throttle: 1 } });
  S.rcApplySnapshot(tab, JSON.parse(JSON.stringify(S.rcSnapshot(host))));
  for (let i = 0; i < host.racers.length; i++) assert(Math.abs(host.racers[i].x - tab.racers[i].x) < 0.02 && host.racers[i].place === tab.racers[i].place, "a snapshot did not carry a racer across");
  assert(host.traffic.every((t, i) => Math.abs(t.x - tab.traffic[i].x) < 0.02), "a snapshot did not carry the traffic across");
});

// ------------------------------------------------------------ 5. the world

const THREE_STUB = `
const noop = () => {};
class Vec2 { constructor(x=0,y=0){this.x=x;this.y=y;} set(x,y){this.x=x;this.y=y;return this;} }
class Vec3 {
  constructor(x=0,y=0,z=0){this.x=x;this.y=y;this.z=z;}
  set(x,y,z){this.x=x;this.y=y;this.z=z;return this;}
  setScalar(v){return this.set(v,v,v);} copy(v){return this.set(v.x,v.y,v.z);} clone(){return new Vec3(this.x,this.y,this.z);}
  add(v){this.x+=v.x;this.y+=v.y;this.z+=v.z;return this;} sub(v){this.x-=v.x;this.y-=v.y;this.z-=v.z;return this;}
  addScaledVector(v,s){this.x+=v.x*s;this.y+=v.y*s;this.z+=v.z*s;return this;}
  multiplyScalar(s){this.x*=s;this.y*=s;this.z*=s;return this;}
  normalize(){const l=Math.hypot(this.x,this.y,this.z)||1;return this.multiplyScalar(1/l);}
  length(){return Math.hypot(this.x,this.y,this.z);} lengthSq(){return this.x**2+this.y**2+this.z**2;}
  distanceTo(v){return Math.hypot(this.x-v.x,this.y-v.y,this.z-v.z);} lerp(v,t){this.x+=(v.x-this.x)*t;this.y+=(v.y-this.y)*t;this.z+=(v.z-this.z)*t;return this;}
  applyMatrix4(){return this;} setFromMatrixPosition(){return this;}
}
class Euler { constructor(){this.x=0;this.y=0;this.z=0;} set(x,y,z){this.x=x;this.y=y;this.z=z;return this;} }
class Obj3D {
  constructor(){ this.children=[]; this.parent=null; this.visible=true; this.userData={};
    this.position=new Vec3(); this.rotation=new Euler(); this.scale=new Vec3(1,1,1);
    this.castShadow=false; this.receiveShadow=false; this.name=""; this.matrixWorld={}; this.renderOrder=0; this.frustumCulled=true; }
  add(...cs){for(const c of cs){if(!c)continue;c.parent=this;this.children.push(c);}return this;}
  remove(c){const i=this.children.indexOf(c);if(i>=0){this.children.splice(i,1);c.parent=null;}return this;}
  traverse(fn){fn(this);for(const c of this.children)c.traverse(fn);}
  lookAt(){return this;} updateMatrix(){} clone(){return this;}
}
class Geometry { constructor(){this.attributes={position:{needsUpdate:false}};} dispose(){} rotateX(){return this;} translate(){return this;} setAttribute(){return this;} setFromPoints(){return this;} }
class Color { constructor(v=0){this.v=v;} set(v){this.v=v;return this;} }
class Material { constructor(p={}){ Object.assign(this,p); this.userData={}; this.color=new Color(p.color??0xffffff); this.emissive=new Color(p.emissive??0); }
  clone(){const m=new Material();Object.assign(m,this);m.userData={};return m;} dispose(){} }
class Mesh extends Obj3D { constructor(g,m){super();this.geometry=g;this.material=m;this.isMesh=true;} }
class Points extends Obj3D { constructor(g,m){super();this.geometry=g;this.material=m;this.isPoints=true;} }
class Shape { moveTo(){} lineTo(){} quadraticCurveTo(){} }
export const FrontSide=0, BackSide=1, DoubleSide=2, AdditiveBlending=1, NormalBlending=0;
export { Vec2 as Vector2, Vec3 as Vector3, Mesh, Points, Shape, Color };
export class Group extends Obj3D {}
export class Object3D extends Obj3D {}
export class BoxGeometry extends Geometry {}
export class CylinderGeometry extends Geometry {}
export class SphereGeometry extends Geometry {}
export class TorusGeometry extends Geometry {}
export class PlaneGeometry extends Geometry {}
export class CircleGeometry extends Geometry {}
export class ExtrudeGeometry extends Geometry {}
export class LatheGeometry extends Geometry {}
export class TubeGeometry extends Geometry {}
export class BufferGeometry extends Geometry {}
export class BufferAttribute { constructor(a,n){this.array=a;this.itemSize=n;} }
export class CatmullRomCurve3 { constructor(p){this.points=p;} }
export class MeshStandardMaterial extends Material {}
export class MeshBasicMaterial extends Material {}
export class PointsMaterial extends Material {}
export class CanvasTexture { constructor(){this.needsUpdate=false;} dispose(){} }
export class DirectionalLight extends Obj3D { constructor(c,i){super();this.color=c;this.intensity=i;} }
export class HemisphereLight extends Obj3D {}
export class PointLight extends Obj3D {}
export class Matrix4 { identity(){return this;} copy(){return this;} invert(){return this;} }
`;

function installDomStubs() {
  const ctx2d = new Proxy({}, {
    get(_t, prop) {
      if (prop === "measureText") return () => ({ width: 10 });
      if (prop === "createLinearGradient") return () => ({ addColorStop() {} });
      return () => {};
    },
    set() { return true; },
  });
  globalThis.document = { createElement: () => ({ width: 0, height: 0, getContext: () => ctx2d }) };
  globalThis.window = globalThis.window ?? {};
}
const IMPORT_RE = /^import\s+[\s\S]*?from\s+["'][^"']+["'];\s*$/gm;
const EXPORT_BLOCK_RE = /^export\s*\{[^}]*\}\s*;\s*$/gm;
const EXPORT_KEYWORD_RE = /^export\s+(?=(const|let|var|function|class|async))/gm;
const strip = (src) => src.replace(IMPORT_RE, "").replace(EXPORT_BLOCK_RE, "").replace(EXPORT_KEYWORD_RE, "");

// The browser bundle's own module list, so this cannot drift from what ships.
const bundler = readFileSync(join(ROOT, "tools", "bundle_webxr.py"), "utf8");
const raceBlock = /"race":\s*\{[\s\S]*?"modules":\s*\[([\s\S]*?)\]/.exec(bundler)?.[1] ?? "";
const bundled = [...raceBlock.matchAll(/(SHARED|WEBXR)\s*\/\s*"([^"]+)"/g)].map((m) => (m[1] === "SHARED" ? `shared/${m[2]}` : m[2]));

await check("the race app is in the bundler's list with every race module, and its dist file is built", () => {
  assert(bundled.length > 0, "tools/bundle_webxr.py has no \"race\" app");
  for (const f of readdirSync(join(RACE, "tracks"))) assert(bundled.includes(`race/tracks/${f}`), `race/tracks/${f} is not in the bundle`);
  for (const f of ["tracks.js", "track.js", "sim.js", "world.js", "battle.js", "audio.js", "net.js", "app.js"]) assert(bundled.includes(`race/js/${f}`), `race/js/${f} is not in the bundle`);
  assert(/"race":\s*"race\.html"/.test(bundler), "race.html is not copied into the combined WebXR/dist folder");
  const dist = readFileSync(join(WEBXR, "dist", "race.html"), "utf8");
  assert(dist.includes("rcCompileTrack") && dist.includes("TRACK_DOWNTOWN_SITE"), "WebXR/dist/race.html is stale — run python3 tools/bundle_webxr.py");
  const external = [...dist.matchAll(/<(?:script|link|img|audio|video|source)\b[^>]*>/g)].map((m) => m[0])
    .filter((tag) => !/rel="preconnect"/.test(tag))
    .map((tag) => /(?:src|href)="(https?:[^"]+)"/.exec(tag)?.[1]).filter(Boolean)
    .filter((u) => !/fonts\.(googleapis|gstatic)\.com/.test(u));
  assert(external.length === 0, `the bundle loads external assets: ${external.join(", ")}`);
  const imports = [...dist.matchAll(/from\s+"(https?:[^"]+)"/g)].map((m) => m[1]);
  assert(imports.every((u) => u.startsWith("https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/")), `unexpected module import: ${imports.join(", ")}`);
});

installDomStubs();
const dir = mkdtempSync(join(tmpdir(), "race-world-"));
process.on("exit", () => { try { rmSync(dir, { recursive: true, force: true }); } catch { /* scratch folder; best effort */ } });
writeFileSync(join(dir, "three-mock.mjs"), THREE_STUB);
const worldModules = bundled.filter((f) => !/race\/js\/(app|audio|net)\.js$/.test(f) && f !== "shared/input.js");
writeFileSync(join(dir, "suite.mjs"), `import * as THREE from "./three-mock.mjs";\n\n${worldModules.map((f) => strip(readFileSync(join(WEBXR, f), "utf8"))).join("\n\n")}\n\nexport { rcBuildWorld, rcEnvironment, RACE_TRACKS as SUITE_TRACKS, rcCompileTrack as suiteCompile, rcCreateRace as suiteRace, rcCreateBattle as suiteCreateBattle, rcBattleStep as suiteBattleStep, rcBattleStandings as suiteBattleStandings, rcBuildBattleWorld as suiteBuildBattleWorld, BATTLE_FIELD as SUITE_BATTLE_FIELD, THREE };\n`);
const W = await import(pathToFileURL(join(dir, "suite.mjs")).href);

for (const def of W.SUITE_TRACKS) {
  await check(`${def.id}: the world builds with at most ${MESH_CEILING} meshes before merging`, () => {
    const tr = W.suiteCompile(def);
    const race = W.suiteRace({ track: tr, cls: "master", seed: 4 });       // Master: the most traffic
    const root = new W.THREE.Group();
    W.rcEnvironment(root, def);
    const world = W.rcBuildWorld(root, race);
    world.update(race, 1 / 60, 1);
    let meshes = 0;
    root.traverse((o) => { if (o.isMesh) meshes += 1; });
    assert(meshes > 50, `only ${meshes} meshes: the world did not build`);
    assert(meshes <= MESH_CEILING, `${meshes} meshes, over the ${MESH_CEILING} ceiling`);
    assert(world.racerModels.length === race.racers.length && world.trafficModels.length === race.traffic.length, "a racer or a traffic vehicle has no model");
    console.log(`      ${meshes} meshes (authored, before merging), ${race.traffic.length} traffic, ${race.crossings.length} crossings, ${race.statics.length} statics`);
  });
}

// ------------------------------------------------------------ battle mode

await check("battle mode: an AI-only fight ends with one survivor within a time cap", () => {
  const battle = W.suiteCreateBattle({ field: W.SUITE_BATTLE_FIELD, seed: 5 });
  const dt = 1 / 30;
  const cap = 30 * 200;     // 200 s at a fast time step: a generous cap for four AI to fight it out
  let steps = 0;
  while (battle.phase !== "done" && steps < cap) {
    W.suiteBattleStep(battle, dt, {});
    steps += 1;
    for (const r of battle.racers) {
      if (![r.x, r.z, r.h, r.v].every(Number.isFinite)) throw new Error(`NaN in fighter ${r.vehicle} at step ${steps}`);
    }
    battle.events.length = 0;
  }
  assert(battle.phase === "done", `the fight never ended (${steps} steps)`);
  const alive = battle.racers.filter((r) => r.alive);
  assert(alive.length === 1, `${alive.length} fighters still standing at the end`);
  assert(battle.winner === alive[0].id && alive[0].place === 1, "the survivor was not recorded as the winner");
  const standings = W.suiteBattleStandings(battle);
  const places = standings.map((r) => r.place).sort((a, b) => a - b);
  assert(places.every((p, i) => p === i + 1), `battle places are not 1..${battle.racers.length}: ${places.join(",")}`);
});

await check(`battle arena: the world builds with at most ${MESH_CEILING} meshes before merging`, () => {
  const battle = W.suiteCreateBattle({ field: W.SUITE_BATTLE_FIELD, seed: 8 });
  const root = new W.THREE.Group();
  const world = W.suiteBuildBattleWorld(root, battle);
  world.update(battle, 1 / 60, 1);
  let meshes = 0;
  root.traverse((o) => { if (o.isMesh) meshes += 1; });
  assert(meshes > 10, `only ${meshes} meshes: the arena did not build`);
  assert(meshes <= MESH_CEILING, `${meshes} meshes, over the ${MESH_CEILING} ceiling`);
});

// ------------------------------------------------------------ wiring

await check("the homepage opens the egg three ways, and check_all runs this checker", () => {
  const gen = readFileSync(join(ROOT, "tools", "gen_home.mjs"), "utf8");
  for (const code of ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "KeyB", "KeyA"]) assert(gen.includes(code), `the key sequence never mentions ${code}`);
  assert(/egg["']?\)?\s*===\s*["']race["']|egg=race/.test(gen), "?egg=race is not handled");
  assert(/id="egg"/.test(gen) && /taps?/.test(gen), "the hard-hat glyph in the footer is missing");
  const home = readFileSync(join(WEBXR, "index.html"), "utf8"), flat = readFileSync(join(WEBXR, "home.html"), "utf8");
  assert(home.includes('data-egg="race/index.html"') && flat.includes('data-egg="race.html"'), "the homepage variants do not point the egg at the race page");
  assert(existsSync(join(WEBXR, "race", "index.html")) && existsSync(join(WEBXR, "dist", "race.html")), "the egg's target page is missing from WebXR/race or WebXR/dist");
  const all = readFileSync(join(ROOT, "tools", "check_all.mjs"), "utf8");
  assert(all.includes('"check_race.mjs"'), "check_all.mjs does not run check_race.mjs");
  const doc = readFileSync(join(ROOT, "docs", "easter-egg.md"), "utf8");
  assert(/local multiplayer/i.test(doc) && /no server/i.test(doc) && /original/i.test(doc), "docs/easter-egg.md must say local multiplayer, no server, and that the assets are original");
  for (const t of RACE_TRACKS) assert(doc.includes(t.name), `docs/easter-egg.md does not list ${t.name}`);
});

console.log(failures ? `\n${failures} check(s) failed.` : `\nAll race checks pass: ${RACE_TRACKS.length} tracks race three laps headless; items, unlocks and saves hold.`);
process.exit(failures ? 1 : 0);
