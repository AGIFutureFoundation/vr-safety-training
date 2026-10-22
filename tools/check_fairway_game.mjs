/**
 * Headless checks for Fairway Park (WebXR/fairway): a nine-hole golf course
 * plus three outdoor sports mini-games, all pure engines under
 * WebXR/fairway/js/ — golf.js, minigames.js and scores.js touch no DOM,
 * three.js or canvas, so every rule below is driven straight from Node.
 *
 *     node tools/check_fairway_game.mjs
 *
 * What is proved here:
 *
 *  1. **The stub course is sound.** Nine holes, real pars, and course.js's
 *     one-line switch points at the stub (not the real course, which has not
 *     landed yet).
 *  2. **A scripted round finishes.** Power scaled to the remaining distance
 *     (no scripted-to-win aim) plays all nine holes to a hole-out, every
 *     stroke count sane, wind and lie both engaged along the way.
 *  3. **Lies do what the brief says.** A bunker shot carries less than the
 *     same swing from the fairway, which carries less than rough; a shot
 *     into a real water hazard on this course takes a stroke-and-distance
 *     penalty and leaves the ball exactly where it was; so does one hit
 *     deliberately out of bounds.
 *  4. **Putting reads the green.** The break in a putt is exactly the
 *     slope term the engine computes from fairwayHeight — not a fixed
 *     wobble — recomputed independently here from the same two heights.
 *  5. **The groundskeeper's log scores care, not the round.** A courtesy
 *     left unmet costs care score with a plain-language line; the same
 *     courtesy met earns it back; TrainingRecords gets one summary attempt
 *     per round under app id "fairway".
 *  6. **Scores persist.** The nine-hole leaderboard and each mini-game's
 *     table round-trip through a stubbed localStorage, ranked correctly,
 *     capped, and falling back cleanly from a corrupt value.
 *  7. **All three mini-games run a round and score**, capped at 60 s, with
 *     every numeric field finite the whole way.
 *  8. **The app is wired**: bundled, given a combined dist file, linked from
 *     the homepage with a Home chip back, and this checker runs from
 *     check_all.mjs.
 */
import { readFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const WEBXR = join(ROOT, "WebXR");
const FAIRWAY = join(WEBXR, "fairway");

let failures = 0;
async function check(name, fn) {
  try { await fn(); console.log(`  ✓ ${name}`); }
  catch (err) { failures += 1; console.log(`  ✗ ${name}\n      ${err.stack ?? err}`); }
}
function assert(ok, message) { if (!ok) throw new Error(message); }
const eq = (a, b, what) => { if (a !== b) throw new Error(`${what}: expected ${JSON.stringify(b)}, got ${JSON.stringify(a)}`); };

function findNonFinite(value, path, bad) {
  if (typeof value === "number") { if (!Number.isFinite(value)) bad.push(path); return; }
  if (!value || typeof value !== "object" || typeof value === "function") return;
  if (Array.isArray(value)) { value.forEach((v, i) => findNonFinite(v, `${path}[${i}]`, bad)); return; }
  for (const [k, v] of Object.entries(value)) { if (typeof v !== "function") findNonFinite(v, `${path}.${k}`, bad); }
}
function assertFinite(state, label) {
  const bad = [];
  findNonFinite(state, label, bad);
  assert(bad.length === 0, `non-finite value(s): ${bad.slice(0, 5).join(", ")}`);
}

const C = await import(pathToFileURL(join(FAIRWAY, "js", "course.js")).href);
const CJ = await import(pathToFileURL(join(FAIRWAY, "js", "course.js")).href);
const G = await import(pathToFileURL(join(FAIRWAY, "js", "golf.js")).href);
const MG = await import(pathToFileURL(join(FAIRWAY, "js", "minigames.js")).href);
const SC = await import(pathToFileURL(join(FAIRWAY, "js", "scores.js")).href);

console.log("Fairway Park — self-test\n");

// ------------------------------------------------------------- 1. the course

await check("course.js carries nine holes with real pars from the shared course data", () => {
  assert(C.FAIRWAY_HOLES.length === 9, `${C.FAIRWAY_HOLES.length} holes, expected 9`);
  const nums = C.FAIRWAY_HOLES.map((h) => h.number);
  eq(nums.join(","), "1,2,3,4,5,6,7,8,9", "hole numbers, in order");
  const totalPar = C.FAIRWAY_HOLES.reduce((s, h) => s + h.par, 0);
  assert(totalPar >= 27 && totalPar <= 45, `par ${totalPar} is not a plausible nine-hole total`);
  for (const h of C.FAIRWAY_HOLES) {
    assert([3, 4, 5].includes(h.par), `hole ${h.number} has an odd par (${h.par})`);
    assert(h.yards > 0 && h.tee && h.pin && h.green?.radius > 0 && Array.isArray(h.fairway) && h.fairway.length >= 2, `hole ${h.number} is missing a field`);
    assert(Array.isArray(h.bunkers) && Array.isArray(h.water), `hole ${h.number} has no bunkers/water arrays`);
  }
  assert(C.FAIRWAY_FACILITY.track && (C.FAIRWAY_FACILITY.court || C.FAIRWAY_FACILITY.basketballCourt) && C.FAIRWAY_FACILITY.pitch, "the facility is missing the track, court or pitch");
  assert(typeof C.fairwayHeight === "function" && typeof C.fairwayLieAt === "function", "the course is missing part of the course interface");
  // course.js is the one-line switch, and it now points at the shared course:
  // WebXR/shared/fairway-data.js (pure data and lie/height functions) is what
  // the game, the checkers and the district all read; fairway.js adds the
  // three.js builder over it.
  assert(existsSync(join(WEBXR, "shared", "fairway-data.js")), "WebXR/shared/fairway-data.js is missing — course.js points at it");
  const courseSrc = readFileSync(join(FAIRWAY, "js", "course.js"), "utf8");
  assert(courseSrc.includes('from "../../shared/fairway-data.js"'), "course.js does not import the shared course data");
  eq(CJ.FAIRWAY_HOLES, C.FAIRWAY_HOLES, "course.js re-exports a different FAIRWAY_HOLES than it imports");
});

await check("fairwayLieAt classifies every lie, and a point cannot be both green and cart path", () => {
  const kinds = new Set();
  for (const h of C.FAIRWAY_HOLES) {
    kinds.add(C.fairwayLieAt(h.tee[0], h.tee[1]));
    kinds.add(C.fairwayLieAt(h.green.centre[0], h.green.centre[1]));
    const mid = [(h.tee[0] + h.pin[0]) / 2, (h.tee[1] + h.pin[1]) / 2];
    kinds.add(C.fairwayLieAt(mid[0], mid[1]));
    for (const b of h.bunkers) assert(C.fairwayLieAt(b.centre[0], b.centre[1]) === "bunker", `hole ${h.number}'s own bunker centre does not read as bunker`);
    for (const w of h.water) assert(C.fairwayLieAt(w.centre[0], w.centre[1]) === "water", `hole ${h.number}'s own water centre does not read as water`);
    assert(C.fairwayLieAt(h.green.centre[0], h.green.centre[1]) === "green", `hole ${h.number}'s green centre does not read as green`);
    assert(C.fairwayLieAt(h.tee[0], h.tee[1]) === "tee", `hole ${h.number}'s tee does not read as tee`);
  }
  assert(C.fairwayLieAt(1e6, 1e6) === "out", "a point nowhere near any hole should be out of bounds");
  assert(kinds.size >= 3, "fairwayLieAt only ever returned one or two kinds across every hole");
  assert(Number.isFinite(C.fairwayHeight(0, 0)) && Number.isFinite(C.fairwayHeight(1234, -567)), "fairwayHeight is not finite everywhere");
});

// -------------------------------------------------------- helpers for shots

/** The exact aim offset and power that lands a shot at `target` from the
 *  round's current ball, using the same physics golf.js itself uses for a
 *  flat, no-wind, no-noise, no-lie-derating shot (tee or fairway, timing 0). */
function aimAndPowerFor(state, target, clubCarry) {
  const baseYaw = G.glAimYaw(state); // aimOffset is 0 coming into this call
  const toTarget = Math.atan2(target[0] - state.ball.x, target[1] - state.ball.z);
  const distance = Math.hypot(target[0] - state.ball.x, target[1] - state.ball.z);
  return { offset: toTarget - baseYaw, power: distance / clubCarry };
}

const CLUB_CARRY = Object.fromEntries(G.GOLF_CLUBS.map((c) => [c.id, c.carry]));

// -------------------------------------------------------- 2. clubs and lies

await check("four clubs, each with its own distance and loft", () => {
  eq(G.GOLF_CLUBS.length, 4, "club count");
  const ids = G.GOLF_CLUBS.map((c) => c.id);
  assert(["driver", "iron", "wedge", "putter"].every((id) => ids.includes(id)), `unexpected club ids: ${ids.join(", ")}`);
  const carries = G.GOLF_CLUBS.map((c) => c.carry);
  assert(new Set(carries).size === carries.length, "two clubs share a carry distance");
  assert(new Set(G.GOLF_CLUBS.map((c) => c.loft)).size >= 3, "clubs do not carry distinct lofts");
  assert(G.GOLF_CLUBS.find((c) => c.id === "driver").carry > G.GOLF_CLUBS.find((c) => c.id === "wedge").carry, "the driver should out-carry the wedge");
});

await check("a bunker shot carries less than the same swing from the fairway, which carries less than rough", () => {
  const carryFor = (lie) => {
    const s = G.glCreateRound({ seed: 1, holes: [C.FAIRWAY_HOLES[0]] });
    G.glSetWind(s, { speed: 0, dir: 0 });
    s.lastLie = lie;
    G.glSetClub(s, "iron");
    const ev = G.glSwing(s, { power: 1, timing: 0 });
    return ev.carry;
  };
  const fairway = carryFor("fairway"), bunker = carryFor("bunker"), rough = carryFor("rough");
  assert(bunker < fairway, `a bunker shot (${bunker.toFixed(1)}) should carry less than a fairway shot (${fairway.toFixed(1)})`);
  assert(rough < fairway, `a rough shot (${rough.toFixed(1)}) should carry less than a fairway shot (${fairway.toFixed(1)})`);
  assert(bunker < rough, `a bunker shot (${bunker.toFixed(1)}) should carry less than rough (${rough.toFixed(1)}) — it's the harder lie`);
});

await check("a shot hit into a real water hazard on this course takes stroke and distance", () => {
  const hole = C.FAIRWAY_HOLES.find((h) => h.water.length > 0 && h.water[0].centre[0] !== undefined);
  assert(hole, "no hole on this course carries a water hazard");
  const s = G.glCreateRound({ seed: 2, holes: [hole] });
  G.glSetWind(s, { speed: 0, dir: 0 });
  const club = "iron";
  G.glSetClub(s, club);
  {
    // The shared course keeps its water beyond a tee shot; walk the ball up
    // the line to 100 m short of the hazard so the iron can reach it.
    const [wx, wz] = hole.water[0].centre;
    const dx = wx - s.ball.x, dz = wz - s.ball.z, d = Math.hypot(dx, dz);
    if (d > CLUB_CARRY.iron * 0.9) { s.ball = { x: wx - (dx / d) * 100, z: wz - (dz / d) * 100 }; s.lastLie = "fairway"; }
  }
  const { offset, power } = aimAndPowerFor(s, hole.water[0].centre, CLUB_CARRY[club]);
  G.glSetAim(s, offset);
  const before = { ...s.ball };
  const ev = G.glSwing(s, { power, timing: 0 });
  assert(ev.penalty === true, `aiming straight at hole ${hole.number}'s own water hazard did not draw a penalty`);
  eq(s.ball.x, before.x, "ball x should not move on a penalty");
  eq(s.ball.z, before.z, "ball z should not move on a penalty");
  eq(s.strokesThisHole, 2, "a penalty should cost the shot plus one, i.e. two strokes");
  eq(s.penalties, 1, "the round's penalty counter should tick");
});

await check("a shot hit well out of bounds also takes stroke and distance, and the ball stays put", () => {
  const s = G.glCreateRound({ seed: 3, holes: [C.FAIRWAY_HOLES[2]] }); // the long dogleg par 5
  G.glSetWind(s, { speed: 0, dir: 0 });
  G.glSetClub(s, "driver");
  const before = { ...s.ball };
  // Aim wherever a full driver carry leaves the course: the shared course is
  // 600 m wide, so a fixed 90-degree slice would only find rough.
  let target = null;
  for (let i = 0; i < 32 && !target; i++) {
    const yaw = (i / 32) * Math.PI * 2;
    const t = [s.ball.x + Math.sin(yaw) * CLUB_CARRY.driver, s.ball.z + Math.cos(yaw) * CLUB_CARRY.driver];
    if (C.fairwayLieAt(t[0], t[1]) === "out") target = t;
  }
  assert(target, "no direction from this tee leaves the course within a driver carry");
  G.glSetAim(s, aimAndPowerFor(s, target, CLUB_CARRY.driver).offset);
  const ev = G.glSwing(s, { power: 1, timing: 0 });
  assert(ev.penalty === true, "a full driver swing off the course should draw a stroke-and-distance penalty");
  eq(s.ball.x, before.x, "ball x should not move on an out-of-bounds penalty");
  eq(s.ball.z, before.z, "ball z should not move on an out-of-bounds penalty");
});

// ------------------------------------------------------------- 3. the round

function autoPlayRound(seed, holes = C.FAIRWAY_HOLES, care = null) {
  const s = G.glCreateRound({ seed, holes });
  let rngState = seed * 2654435761 >>> 0;
  const rng = () => { rngState = (rngState + 0x6d2b79f5) >>> 0; let t = rngState; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  let swings = 0;
  const cap = holes.length * 40;
  while (!s.finished && swings < cap) {
    swings += 1;
    assertFinite(s.ball, `ball at swing ${swings}`);
    assertFinite({ w: s.wind }, `wind at swing ${swings}`);
    const dist = G.glDistanceToPin(s);
    let club;
    if (G.glCanPutt(s)) club = "putter";
    else club = dist > 150 ? "driver" : dist > 60 ? "iron" : "wedge";
    G.glSetClub(s, club);
    const lieBoost = s.lastLie === "rough" ? 1.35 : s.lastLie === "bunker" ? 1.7 : 1;
    const power = Math.min(1, Math.max(0, (dist / CLUB_CARRY[club]) * lieBoost));
    const timing = (rng() - 0.5) * 0.5;
    const ev = club === "putter" ? G.glPutt(s, { power, timing }) : G.glSwing(s, { power, timing });
    if (care) care(s, ev);
  }
  return { state: s, swings };
}

await check("a scripted round plays all nine holes to a hole-out with sane stroke counts", () => {
  const { state: s, swings } = autoPlayRound(42);
  assert(s.finished, `the round never finished in ${swings} swings`);
  eq(s.scorecard.length, 9, "nine scorecard rows");
  eq(s.scorecard.map((h) => h.hole).join(","), "1,2,3,4,5,6,7,8,9", "holes played in order");
  eq(s.totalPar, C.FAIRWAY_HOLES.reduce((a, h) => a + h.par, 0), "total par should match the course");
  for (const row of s.scorecard) {
    assert(row.strokes >= 1 && row.strokes <= row.par + 8, `hole ${row.hole}: ${row.strokes} strokes against par ${row.par} is not sane`);
    eq(row.rel, row.strokes - row.par, "relative-to-par arithmetic");
  }
  assert(s.totalStrokes >= 9 && s.totalStrokes <= 9 * 12, `total strokes ${s.totalStrokes} is not a plausible nine-hole total`);
  const summary = G.glSummary(s);
  eq(summary.totalStrokes, s.totalStrokes, "glSummary should mirror the round's total");
  eq(summary.scorecard.length, 9, "glSummary should carry all nine rows");
});

await check("a second seed plays out differently, and neither round mutates the shared course data", () => {
  const before = JSON.stringify(C.FAIRWAY_HOLES);
  const a = autoPlayRound(1).state;
  const b = autoPlayRound(2).state;
  assert(a.totalStrokes !== b.totalStrokes || JSON.stringify(a.scorecard) !== JSON.stringify(b.scorecard), "two different seeds produced an identical round");
  eq(JSON.stringify(C.FAIRWAY_HOLES), before, "playing a round mutated the shared FAIRWAY_HOLES data");
});

// -------------------------------------------------------- 4. putting & slope

await check("a putt's break is exactly the slope term computed from fairwayHeight, not a fixed wobble", () => {
  // Pick the green and the spot on it where the course's own slope bends a
  // putt the most, so the slope term is measurable on any layout.
  let best = null;
  for (const h of C.FAIRWAY_HOLES) for (const [ox, oz] of [[-6, 2], [6, -2], [2, 6], [-2, -6]]) {
    const x = h.green.centre[0] + ox, z = h.green.centre[1] + oz, e = 0.4;
    const gx0 = (C.fairwayHeight(x + e, z) - C.fairwayHeight(x - e, z)) / (2 * e);
    const gz0 = (C.fairwayHeight(x, z + e) - C.fairwayHeight(x, z - e)) / (2 * e);
    const toPin = Math.atan2(h.pin[0] - x, h.pin[1] - z);
    const lateral = Math.abs(-gx0 * Math.cos(toPin) + gz0 * Math.sin(toPin));
    if (C.fairwayLieAt(x, z) === "green" && (!best || lateral > best.lateral)) best = { h, x, z, lateral };
  }
  const hole = best.h;
  const s = G.glCreateRound({ seed: 9, holes: [hole] });
  // Drop the ball a few metres off the pin, already on the green, with a
  // clean aim (no manual offset) — glPutt's own auto-aim points at the pin.
  s.ball = { x: best.x, z: best.z };
  s.lastLie = "green";
  G.glSetClub(s, "putter");
  const power = 0.5, timing = 0;
  const putter = G.GOLF_CLUBS.find((c) => c.id === "putter");
  const yaw = G.glAimYaw(s);
  const rollDist = putter.carry * power;
  const eps = 0.4;
  const gx = (C.fairwayHeight(s.ball.x + eps, s.ball.z) - C.fairwayHeight(s.ball.x - eps, s.ball.z)) / (2 * eps);
  const gz = (C.fairwayHeight(s.ball.x, s.ball.z + eps) - C.fairwayHeight(s.ball.x, s.ball.z - eps)) / (2 * eps);
  const breakScale = rollDist * 1.8;
  const expectedLateral = timing * putter.spread * 0.12 + (-gx * Math.cos(yaw) + gz * Math.sin(yaw)) * breakScale * 0.02;
  const fx = Math.sin(yaw), fz = Math.cos(yaw), px = Math.cos(yaw), pz = -Math.sin(yaw);
  const expected = { x: s.ball.x + fx * rollDist + px * expectedLateral, z: s.ball.z + fz * rollDist + pz * expectedLateral };
  const straightLine = { x: s.ball.x + fx * rollDist, z: s.ball.z + fz * rollDist };

  const before = { ...s.ball };
  G.glPutt(s, { power, timing });
  assert(s.scorecard.length === 0, "this putt was chosen to roll past the cup, not into it — a hole-out here means the fixture needs a new distance, not that the test is wrong");
  const landed = s.ball;
  assert(Math.abs(landed.x - expected.x) < 0.01 && Math.abs(landed.z - expected.z) < 0.01, `putt landed at (${landed.x.toFixed(3)},${landed.z.toFixed(3)}), expected (${expected.x.toFixed(3)},${expected.z.toFixed(3)})`);
  const strayFromStraight = Math.hypot(expected.x - straightLine.x, expected.z - straightLine.z);
  assert(strayFromStraight > 0.001, "the slope term should move the ball off a perfectly straight putt on this green");
  assert(before.x !== landed.x || before.z !== landed.z, "the putt did not move the ball at all");
});

// ------------------------------------------------------ 5. the groundskeeper

await check("four care habits, each with a label and a plain-language line for both outcomes", () => {
  eq(G.CARE_HABITS.length, 4, "habit count");
  for (const h of G.CARE_HABITS) {
    assert(h.label && typeof h.ok === "number" && typeof h.miss === "number" && h.miss < 0 && h.ok > 0, `${h.id} is missing a label or its score deltas`);
  }
});

await check("care score falls when a courtesy is left unmet, and recovers when the same courtesy is kept", () => {
  const hole = C.FAIRWAY_HOLES[0]; // has a bunker
  const s = G.glCreateRound({ seed: 4, holes: [hole] });
  G.glSetWind(s, { speed: 0, dir: 0 });
  eq(s.care.score, 100, "a fresh round starts at full care");

  // Leave a divot unattended, then swing again without addressing it.
  s.lastLie = "fairway";
  G.glSetClub(s, "wedge");
  G.glSwing(s, { power: 0.3, timing: 0 }); // lands short, in the fairway again -> opens a divot opportunity
  assert(s.care.pending.divot, "a full swing from the fairway should open a divot opportunity");
  const afterOpen = s.care.score;
  G.glSwing(s, { power: 0.1, timing: 0 }); // the next swing closes the opportunity, unmet
  assert(s.care.score < afterOpen, `care score should fall when a divot is left unrepaired (was ${afterOpen}, now ${s.care.score})`);
  const missLine = s.care.log.find((l) => l.habit === "divot" && !l.ok);
  assert(missLine && /per the course's maintenance plan|maintenance plan/.test(missLine.line), "the miss line should cite the course's maintenance plan");

  // Now do it properly: open the same opportunity and resolve it before moving on.
  s.lastLie = "fairway";
  G.glSwing(s, { power: 0.3, timing: 0 });
  assert(s.care.pending.divot, "expected a second divot opportunity");
  const beforeCourtesy = s.care.score;
  G.glCareEvent(s, "divot");
  assert(s.care.score > beforeCourtesy, `logging the courtesy should raise the care score (was ${beforeCourtesy}, now ${s.care.score})`);
  const okLine = s.care.log.find((l) => l.habit === "divot" && l.ok);
  assert(okLine && /maintenance plan/.test(okLine.line), "the ok line should also cite the course's maintenance plan");
  assert(!/\d[%\d]* (feet|metres|meters|yards)|exactly \d/.test(okLine.line), "a care line should not invent a specific measurement");
});

await check("a full round's care summary writes one attempt to TrainingRecords under app id \"fairway\"", async () => {
  const store = new Map();
  globalThis.localStorage = {
    getItem: (k) => (store.has(k) ? store.get(k) : null),
    setItem: (k, v) => store.set(k, String(v)),
    removeItem: (k) => store.delete(k),
  };
  const RecordsMod = await import(pathToFileURL(join(WEBXR, "shared", "records.js")).href + `?fairway-check`);
  RecordsMod.TrainingRecords.clear();
  const { state: s } = autoPlayRound(7, C.FAIRWAY_HOLES, (state, ev) => {
    // Exercise both sides of at least one courtesy during this round so the
    // summary is not trivially a perfect (or perfectly empty) score.
    if (Math.random() < 0.5) {
      for (const id of Object.keys(state.care.pending)) { G.glCareEvent(state, id); break; }
    }
  });
  const summary = G.glSummary(s);
  const rec = RecordsMod.TrainingRecords.record({
    app: "fairway", simId: "fairway-course", simName: "Fairway Park — the nine",
    category: "Grounds & Facilities Care", trade: "Groundskeeping",
    score: summary.care.score, stars: summary.care.score >= 85 ? 3 : summary.care.score >= 60 ? 2 : summary.care.score >= 35 ? 1 : 0,
    errors: Math.max(0, summary.care.opportunities - summary.care.met), hazardHits: 0, seconds: null, learner: "CHECKER",
  });
  const list = RecordsMod.TrainingRecords.list();
  eq(list.length, 1, "one record should have been written");
  eq(list[0].app, "fairway", "the record's app id");
  eq(list[0].id, rec.id, "record() should return the same entry it stored");
  assert(list[0].category === "Grounds & Facilities Care", "the record should carry a care category, not a golf score category");
});

await check("app.js actually calls TrainingRecords.record under app id \"fairway\" when a round ends", () => {
  const app = readFileSync(join(FAIRWAY, "js", "app.js"), "utf8");
  // Through the learner passport (shared/passport.js), which writes records.js on its behalf.
  assert(/(TrainingRecords\.record|ppRecordStation)\(/.test(app), "app.js never calls TrainingRecords.record (or ppRecordStation)");
  assert(/app:\s*"fairway"/.test(app), "app.js's record is not tagged app: \"fairway\"");
  assert(/glSummary\(/.test(app) && /fgSubmitRound\(/.test(app), "app.js should build its record from glSummary() and also submit the round to the leaderboard");
});

// --------------------------------------------------------------- 6. scores

await check("the nine-hole leaderboard round-trips, ranks by strokes relative to par, and caps at ten", () => {
  const store = new Map();
  const fake = { getItem: (k) => (store.has(k) ? store.get(k) : null), setItem: (k, v) => store.set(k, String(v)) };
  eq(SC.fgLoadScores(fake).rounds.length, 0, "an empty store should give an empty leaderboard");
  let r = SC.fgSubmitRound(fake, "abc", 40, 35);
  eq(r.rank, 1, "the first round should rank first");
  r = SC.fgSubmitRound(fake, "zzz", 33, 35);
  eq(r.rank, 1, "two under par should out-rank five over");
  assert(SC.fgBestRound(fake).name === "ZZZ", "fgBestRound should report the best posted round");
  for (let i = 0; i < 14; i++) SC.fgSubmitRound(fake, `p${i}`, 35 + i, 35);
  eq(SC.fgLoadScores(fake).rounds.length, SC.FAIRWAY_TABLE_SIZE, `leaderboard should cap at ${SC.FAIRWAY_TABLE_SIZE}`);
  store.set(SC.FAIRWAY_STORAGE_KEY, "{not json");
  eq(SC.fgLoadScores(fake).rounds.length, 0, "a corrupt save should fall back to an empty leaderboard");
  eq(SC.fgCrewTag("  team   rocket  crew  "), "TEAM ROCKET", "crew tag should collapse whitespace, cap at 12 characters and upper-case");
});

await check("each mini-game keeps its own high-score table, independent of the others and of the golf leaderboard", () => {
  const store = new Map();
  const fake = { getItem: (k) => (store.has(k) ? store.get(k) : null), setItem: (k, v) => store.set(k, String(v)) };
  for (const g of SC.FAIRWAY_MINIGAMES) {
    const r = SC.fgSubmitMinigame(fake, g, "abc", 500);
    eq(r.rank, 1, `${g}'s first score should rank first`);
  }
  const data = SC.fgLoadScores(fake);
  for (const g of SC.FAIRWAY_MINIGAMES) eq(data[g].length, 1, `${g} table should hold exactly its own submission`);
  eq(data.rounds.length, 0, "submitting mini-game scores should never touch the golf leaderboard");
  let threw = false;
  try { SC.fgSubmitMinigame(fake, "not-a-game", "abc", 1); } catch { threw = true; }
  assert(threw, "submitting to an unknown mini-game should throw");
});

// ---------------------------------------------------------- 7. mini-games

const MINIGAME_SCRIPTS = {
  sprint(state, i) {
    if (state.phase !== "running") return {};
    const side = Math.floor(i / 6) % 2 === 0 ? "left" : "right";
    return i % 6 === 0 ? { tap: true, side } : {};
  },
  freethrow(_state, i) { return i % 25 === 0 ? { shoot: true, power: 0.55 + (i % 7) * 0.02, arc: 0.5 + (i % 5) * 0.02 } : {}; },
  penalties(_state, i) { return i % 25 === 0 ? { kick: true, side: ((i % 9) - 4) / 5, power: 0.6 + (i % 6) * 0.05 } : {}; },
};
const MINIGAME_ENGINES = {
  sprint: { create: MG.sprintCreate, step: MG.sprintStep },
  freethrow: { create: MG.freethrowCreate, step: MG.freethrowStep },
  penalties: { create: MG.penaltyCreate, step: MG.penaltyStep },
};

for (const id of SC.FAIRWAY_MINIGAMES) {
  await check(`${id}: a scripted round runs the full ${MG.MINIGAME_TIME_LIMIT} s cap with no NaN, and scores`, () => {
    const eng = MINIGAME_ENGINES[id];
    const state = eng.create({ seed: 11 });
    const STEPS = Math.round(MG.MINIGAME_TIME_LIMIT * 60) + 30;
    let sawScoringEvent = false;
    for (let i = 0; i < STEPS; i++) {
      const input = MINIGAME_SCRIPTS[id](state, i);
      const events = eng.step(state, 1 / 60, input);
      assertFinite(state, `${id} step ${i}`);
      if (events.some((e) => ["finish", "make", "goal", "saved"].includes(e.type))) sawScoringEvent = true;
      if (state.over) {
        const before = JSON.stringify(state);
        eng.step(state, 1 / 60, input);
        eq(JSON.stringify(state), before, `stepping a finished ${id} round changed its state`);
      }
    }
    assert(state.over, `${id} never ended within its ${MG.MINIGAME_TIME_LIMIT} s cap`);
    assert(state.timeLeft === 0 || state.phase === "finished", `${id} ended without exhausting its clock or crossing the line`);
    assert(typeof state.score === "number" && state.score >= 0, `${id} produced no sane score`);
    assert(sawScoringEvent, `${id}'s scripted round never produced a scoring or finishing event`);
  });
}

await check("the three mini-games are registered with distinct venues, names and control lines", () => {
  eq(MG.FAIRWAY_MINIGAMES_INFO.length, 3, "mini-game count");
  const ids = MG.FAIRWAY_MINIGAMES_INFO.map((g) => g.id);
  eq(new Set(ids).size, 3, "mini-game ids should be distinct");
  eq(ids.slice().sort().join(","), SC.FAIRWAY_MINIGAMES.slice().sort().join(","), "minigames.js and scores.js must agree on the id set");
  for (const g of MG.FAIRWAY_MINIGAMES_INFO) assert(g.name && g.venue && g.blurb && g.controls, `${g.id} is missing a name, venue, blurb or controls line`);
});

// -------------------------------------------------------------- 8. wiring

await check("the fairway app is in the bundler's list with every module, and its dist file is built", () => {
  const bundler = readFileSync(join(ROOT, "tools", "bundle_webxr.py"), "utf8");
  const block = /"fairway":\s*\{[\s\S]*?"modules":\s*\[([\s\S]*?)\]/.exec(bundler)?.[1] ?? "";
  const bundled = [...block.matchAll(/(SHARED|WEBXR)\s*\/\s*"([^"]+)"/g)].map((m) => (m[1] === "SHARED" ? `shared/${m[2]}` : m[2]));
  assert(bundled.length > 0, 'tools/bundle_webxr.py has no "fairway" app');
  for (const f of ["course.js", "golf.js", "minigames.js", "scores.js", "world.js", "app.js"]) {
    assert(bundled.includes(`fairway/js/${f}`), `fairway/js/${f} is not in the bundle`);
  }
  assert(bundled.includes("shared/fairway-data.js") && bundled.includes("shared/fairway.js"), "the bundle is missing the shared course (fairway-data.js and fairway.js)");
  assert(bundled.includes("shared/weather.js") && bundled.includes("shared/records.js"), "the bundle is missing shared/weather.js or shared/records.js");
  assert(/"fairway":\s*"fairway\.html"/.test(bundler), "fairway.html is not copied into the combined WebXR/dist folder");
  assert(existsSync(join(FAIRWAY, "index.html")), "WebXR/fairway/index.html is missing");
  const distPath = join(FAIRWAY, "dist", "fairway.html");
  assert(existsSync(distPath), "WebXR/fairway/dist/fairway.html has not been built — run python3 tools/bundle_webxr.py");
  const dist = readFileSync(distPath, "utf8");
  assert(dist.includes("FAIRWAY_HOLES") && dist.includes("glCreateRound") && dist.includes("sprintCreate") && dist.includes("TrainingRecords"), "WebXR/fairway/dist/fairway.html is stale — run python3 tools/bundle_webxr.py");
  const external = [...dist.matchAll(/<(?:script|link|img|audio|video|source)\b[^>]*>/g)].map((m) => m[0])
    .filter((tag) => !/rel="preconnect"/.test(tag))
    .map((tag) => /(?:src|href)="(https?:[^"]+)"/.exec(tag)?.[1]).filter(Boolean)
    .filter((u) => !/fonts\.(googleapis|gstatic)\.com/.test(u));
  assert(external.every((u) => u.startsWith("https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/")), `the bundle loads an unexpected external asset: ${external.join(", ")}`);
  assert(existsSync(join(WEBXR, "dist", "fairway.html")), "WebXR/dist/fairway.html (the combined folder's copy) is missing — run python3 tools/bundle_webxr.py");
});

await check("the app runs standalone (keyboard, touch and gamepad wiring, view toggle) and has a Home chip", () => {
  const app = readFileSync(join(FAIRWAY, "js", "app.js"), "utf8");
  assert(/addEventListener\("keydown"/.test(app) && /addEventListener\("keyup"/.test(app), "app.js has no keyboard wiring");
  assert(/createGamepad\(/.test(app), "app.js has no gamepad wiring");
  assert(/pointerdown/.test(app), "app.js has no touch wiring");
  assert(/KeyV/.test(app) && /cameraMode/.test(app), "app.js has no V camera toggle");
  const html = readFileSync(join(FAIRWAY, "index.html"), "utf8");
  assert(/class="home-chip"/.test(html) && /href="\.\.\/index\.html"/.test(html), "WebXR/fairway/index.html has no Home chip back to the platform");
});

await check("the homepage links Fairway Park on both variants, and check_all.mjs runs this checker", () => {
  const home = readFileSync(join(WEBXR, "index.html"), "utf8");
  const flat = readFileSync(join(WEBXR, "home.html"), "utf8");
  assert(home.includes('href="fairway/index.html"') && home.includes("Fairway Park"), "WebXR/index.html has no Fairway Park card");
  assert(flat.includes('href="fairway.html"') && flat.includes("Fairway Park"), "WebXR/home.html has no Fairway Park card");
  const gen = readFileSync(join(ROOT, "tools", "gen_home.mjs"), "utf8");
  assert(/fairway:\s*"fairway\/index\.html"/.test(gen) && /fairway:\s*"fairway\.html"/.test(gen), "gen_home.mjs's layouts do not carry a fairway entry");
  const all = readFileSync(join(ROOT, "tools", "check_all.mjs"), "utf8");
  assert(all.includes('"check_fairway_game.mjs"'), "check_all.mjs does not run check_fairway_game.mjs");
});

await check("no real course, club, brand, league or player name appears anywhere in the app", () => {
  const files = ["index.html", "js/app.js", "js/course-stub.js", "js/course.js", "js/golf.js", "js/minigames.js", "js/scores.js", "js/world.js"].map((f) => readFileSync(join(FAIRWAY, f), "utf8")).join("\n");
  const banned = [/\baugusta\b/i, /\bpebble beach\b/i, /\bpga\b/i, /\btitleist\b/i, /\bcallaway\b/i, /\btaylormade\b/i, /\bnike\b/i, /\btiger woods\b/i, /\bmasters\b/i];
  for (const re of banned) assert(!re.test(files), `found a real-world name matching ${re}`);
});

console.log(failures ? `\n${failures} check(s) failed.` : "\nAll Fairway Park checks pass: nine holes play out headless with real lies, penalties, slope and course-care scoring; all three mini-games run and score.");
process.exit(failures ? 1 : 0);
