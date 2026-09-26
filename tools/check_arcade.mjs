/**
 * Headless checks for the other Easter egg, Break Room Arcade (WebXR/arcade).
 *
 *     node tools/check_arcade.mjs
 *
 * Every cabinet's engine (games/*.js) is pure — create()/step() touch no DOM,
 * canvas or audio — so each one is run headless here exactly as the browser
 * would drive it:
 *
 *  1. **A scripted 30-second session never throws or goes NaN.** Each game
 *     runs 1800 steps at a 1/60 s tick against a scripted (but not scripted
 *     to win) input stream, and every numeric field anywhere in its state
 *     stays finite the whole way.
 *  2. **Score and level logic hold.** Score never goes negative and never
 *     decreases; level (board/stage) stays within the game's range and never
 *     decreases; lives never go negative; stepping again after game-over is
 *     a no-op.
 *  3. **The stack-lean mechanic is safe.** Forcing a lopsided Pallet Stacker
 *     board triggers a shift that moves a block without creating, losing or
 *     corrupting one.
 *  4. **The high-score table round-trips** through a stubbed localStorage:
 *     ranking, the eight-row cap, and a corrupt value falling back cleanly.
 *  5. **Three cabinets are registered**, each with a genre, a teaching line,
 *     controls text and a working engine, and the app is wired: bundled and
 *     registered in check_all.
 */
import { readFileSync, mkdtempSync, rmSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const WEBXR = join(ROOT, "WebXR");
const ARCADE = join(WEBXR, "arcade");

// A scratch folder for this run, removed on exit regardless of how the
// process ends (same discipline as check_race.mjs's dist stub folder).
const scratch = mkdtempSync(join(tmpdir(), "arcade-check-"));
process.on("exit", () => { try { rmSync(scratch, { recursive: true, force: true }); } catch { /* best effort */ } });

let failures = 0;
async function check(name, fn) {
  try { await fn(); console.log(`  ✓ ${name}`); }
  catch (err) { failures += 1; console.log(`  ✗ ${name}\n      ${err.stack ?? err}`); }
}
function assert(ok, message) { if (!ok) throw new Error(message); }

const SY = await import(pathToFileURL(join(ARCADE, "js", "games", "spoolyard.js")).href);
const CR = await import(pathToFileURL(join(ARCADE, "js", "games", "crewrun.js")).href);
const PS = await import(pathToFileURL(join(ARCADE, "js", "games", "palletstacker.js")).href);
const SCORES = await import(pathToFileURL(join(ARCADE, "js", "scores.js")).href);
const CAB = await import(pathToFileURL(join(ARCADE, "js", "cabinets.js")).href);

console.log("Break Room Arcade — self-test\n");

// ------------------------------------------------------------ NaN scanning

function findNonFinite(value, path, bad) {
  if (typeof value === "number") { if (!Number.isFinite(value)) bad.push(path); return; }
  if (!value || typeof value !== "object" || typeof value === "function") return;
  if (Array.isArray(value)) { value.forEach((v, i) => findNonFinite(v, `${path}[${i}]`, bad)); return; }
  for (const [k, v] of Object.entries(value)) {
    if (typeof v === "function") continue;
    findNonFinite(v, `${path}.${k}`, bad);
  }
}
function assertFinite(state, label) {
  const bad = [];
  findNonFinite(state, label, bad);
  assert(bad.length === 0, `non-finite value(s): ${bad.slice(0, 5).join(", ")}`);
}

// A deterministic input stream that presses a bit of everything without
// trying to win — the point is to exercise ladders, jumps, rotations and
// hard drops alike, not to reach the best possible score.
function scriptedInput(id, i, extra) {
  const t = i / 60;
  if (id === "spoolyard") {
    return { left: Math.sin(t * 0.9) > 0.1, right: Math.sin(t * 0.9) < -0.1, up: Math.sin(t * 1.7) > 0.3, down: Math.sin(t * 1.7) < -0.6 };
  }
  if (id === "crewrun") {
    return { up: (i % 47) === 0, down: Math.sin(t * 2.3) > 0.7 };
  }
  if (id === "palletstacker") {
    const one = { left: Math.sin(t * 1.1) > 0.2, right: Math.sin(t * 1.1) < -0.2, down: (i % 5) === 0, rotate: (i % 23) === 0, hardDrop: (i % 97) === 0 };
    if (extra?.players !== 2) return one;
    const two = { left: Math.cos(t * 1.3) > 0.2, right: Math.cos(t * 1.3) < -0.2, down: (i % 7) === 0, rotate: (i % 29) === 0, hardDrop: (i % 113) === 0 };
    return { 0: one, 1: two };
  }
  return {};
}

const STEPS = 30 * 60; // a 30-second session at 60 Hz

// ------------------------------------------------------------ Spool Yard

await check("Spool Yard: 30 s scripted session, no NaN, score/level/lives hold", () => {
  const state = SY.syCreate({ seed: 5 });
  let lastScore = 0, lastLevel = state.level, boardsCompleted = 0, floorsReached = 0;
  for (let i = 0; i < STEPS; i++) {
    const events = SY.syStep(state, 1 / 60, scriptedInput("spoolyard", i));
    assertFinite(state, `spoolyard step ${i}`);
    assert(state.score >= lastScore, `score dropped from ${lastScore} to ${state.score} at step ${i}`);
    lastScore = state.score;
    assert(state.level >= lastLevel && state.level >= 1 && state.level <= SY.SY_BOARDS.length, `level ${state.level} out of range at step ${i}`);
    lastLevel = state.level;
    assert(state.lives >= 0 && state.lives <= 3, `lives ${state.lives} out of range at step ${i}`);
    for (const e of events) { if (e.type === "board-complete") boardsCompleted += 1; if (e.type === "floor") floorsReached += 1; }
    if (state.over) {
      const before = JSON.stringify(state);
      const again = SY.syStep(state, 1 / 60, { up: true, right: true });
      assert(again.length === 0, "stepping a finished game produced events");
      assert(JSON.stringify(state) === before, "stepping a finished game changed its state");
    }
  }
  assert(floorsReached > 0, "the player never climbed a single floor in 30 s of scripted input");
  console.log(`      final score ${Math.round(state.score)}, board ${state.level}, ${boardsCompleted} board(s) completed, ${floorsReached} floor-climbs, over=${state.over}`);
});

// ------------------------------------------------------------ Crew Run

await check("Crew Run: 30 s scripted session, no NaN, score/level/lives hold", () => {
  const state = CR.crCreate({ seed: 9 });
  let lastScore = 0, lastLevel = state.level, ppeSeen = 0, stomps = 0;
  for (let i = 0; i < STEPS; i++) {
    const events = CR.crStep(state, 1 / 60, scriptedInput("crewrun", i));
    assertFinite(state, `crewrun step ${i}`);
    assert(state.score >= lastScore - 1e-6, `score dropped from ${lastScore} to ${state.score} at step ${i}`);
    lastScore = state.score;
    assert(state.level >= lastLevel && state.level >= 1 && state.level <= CR.CR_STAGES.length, `level ${state.level} out of range at step ${i}`);
    lastLevel = state.level;
    assert(state.lives >= 0 && state.lives <= 3, `lives ${state.lives} out of range at step ${i}`);
    assert(state.ppe >= 0, `negative PPE count at step ${i}`);
    for (const e of events) { if (e.type === "ppe") ppeSeen += 1; if (e.type === "stomp") stomps += 1; }
    if (state.over) {
      const before = JSON.stringify(state);
      const again = CR.crStep(state, 1 / 60, { up: true });
      assert(again.length === 0 && JSON.stringify(state) === before, "stepping a finished game changed it");
    }
  }
  assert(ppeSeen + stomps > 0, "30 s of scripted input never collected PPE nor stomped a hazard");
  console.log(`      final score ${Math.round(state.score)}, stage ${state.level}, ${ppeSeen} PPE, ${stomps} stomp(s), over=${state.over}`);
});

// ------------------------------------------------------------ Pallet Stacker

await check("Pallet Stacker: 30 s scripted session (1 player), no NaN, score/level hold", () => {
  const state = PS.psCreate({ seed: 3, players: 1 });
  const b = state.boards[0];
  let lastScore = 0, lastLevel = b.level, ships = 0;
  for (let i = 0; i < STEPS; i++) {
    const events = PS.psStep(state, 1 / 60, scriptedInput("palletstacker", i, { players: 1 }));
    assertFinite(state, `palletstacker step ${i}`);
    assert(b.score >= lastScore, `score dropped from ${lastScore} to ${b.score} at step ${i}`);
    lastScore = b.score;
    assert(b.level >= lastLevel && b.level >= 1, `level ${b.level} went backwards at step ${i}`);
    lastLevel = b.level;
    for (const e of events) if (e.type === "ship") ships += 1;
    for (const row of b.grid) for (const cell of row) assert(Number.isInteger(cell) && cell >= 0 && cell <= 7, `bad cell value ${cell}`);
    if (state.over) {
      const before = JSON.stringify(state);
      PS.psStep(state, 1 / 60, { 0: { left: true } });
      assert(JSON.stringify(state) === before, "stepping a topped-out board changed it");
    }
  }
  console.log(`      final score ${b.score}, level ${b.level}, ${ships} row(s) shipped, over=${state.over}`);
});

await check("Pallet Stacker: two independent boards run split-screen without cross-talk", () => {
  const state = PS.psCreate({ seed: 11, players: 2 });
  assert(state.boards.length === 2, `expected 2 boards, got ${state.boards.length}`);
  for (let i = 0; i < STEPS; i++) {
    PS.psStep(state, 1 / 60, scriptedInput("palletstacker", i, { players: 2 }));
    assertFinite(state, `2p step ${i}`);
  }
  assert(!state.boards[0].grid.some((row, y) => row.some((c, x) => c !== 0 && state.boards[1].grid[y][x] !== 0 && state.boards[0] === state.boards[1])), "boards share state");
  assert(state.boards[0] !== state.boards[1], "the two boards are the same object");
  console.log(`      P1 score ${state.boards[0].score} (level ${state.boards[0].level}), P2 score ${state.boards[1].score} (level ${state.boards[1].level})`);
});

await check("Pallet Stacker: a leaning stack shifts without creating or losing a block", () => {
  const state = PS.psCreate({ seed: 21, players: 1 });
  const board = state.boards[0];
  // Build a lopsided stack directly: column 0 tall, the rest empty.
  for (let y = PS.PS_ROWS - 10; y < PS.PS_ROWS; y++) board.grid[y][0] = 1;
  board.piece.y = 0; // keep the falling piece out of the way at the top
  board.shiftT = 0;
  const before = board.grid.flat().filter(Boolean).length;
  let shifted = false;
  for (let i = 0; i < 240 && !shifted; i++) {
    const events = PS.psStep(state, 1 / 60, {});
    if (events.some((e) => e.type === "shift")) shifted = true;
    assertFinite(state, `shift step ${i}`);
  }
  assert(shifted, "a 10-tall lean against an empty board never triggered a shift in 4 s");
  const after = board.grid.flat().filter(Boolean).length;
  assert(after === before, `shift changed the block count from ${before} to ${after}`);
  for (const row of board.grid) for (const cell of row) assert(Number.isInteger(cell) && cell >= 0 && cell <= 7, "shift produced a bad cell value");
});

// ------------------------------------------------------------ high scores

await check("high scores round-trip through a stubbed localStorage", () => {
  const store = new Map();
  const fake = { getItem: (k) => (store.has(k) ? store.get(k) : null), setItem: (k, v) => store.set(k, String(v)) };
  const empty = SCORES.arLoadScores(fake);
  assert(SCORES.ARCADE_GAMES.every((g) => Array.isArray(empty[g]) && empty[g].length === 0), "an empty store should give empty tables");
  let r = SCORES.arSubmitScore(fake, "spoolyard", "abc", 1200);
  assert(r.rank === 1, "the first score should rank first");
  r = SCORES.arSubmitScore(fake, "spoolyard", "zzz", 900);
  assert(r.rank === 2, "a lower score should rank below the first");
  r = SCORES.arSubmitScore(fake, "spoolyard", "top", 5000);
  assert(r.rank === 1 && r.table[0].name === "TOP", "a higher score did not take first place");
  for (let i = 0; i < 10; i++) SCORES.arSubmitScore(fake, "crewrun", `p${i}`, i * 10);
  const loaded = SCORES.arLoadScores(fake);
  assert(loaded.crewrun.length === SCORES.ARCADE_TABLE_SIZE, `crewrun table has ${loaded.crewrun.length} rows, expected ${SCORES.ARCADE_TABLE_SIZE}`);
  assert(loaded.crewrun[0].score === 90, "the crewrun table did not keep the top scores");
  assert(loaded.palletstacker.length === 0, "submitting to one cabinet should not touch another's table");
  store.set(SCORES.ARCADE_STORAGE_KEY, "{not json");
  assert(SCORES.arLoadScores(fake).spoolyard.length === 0, "a corrupt save should fall back to fresh, empty tables");
  let threw = false;
  try { SCORES.arSubmitScore(fake, "not-a-cabinet", "abc", 10); } catch { threw = true; }
  assert(threw, "submitting to an unknown cabinet should throw, not silently drop the score");
});

// ------------------------------------------------------------ cabinets and wiring

await check("three cabinets are registered, each with a genre, teaching line, controls and a working engine", () => {
  assert(CAB.ARCADE_CABINETS.length === 3, `expected 3 cabinets, found ${CAB.ARCADE_CABINETS.length}`);
  const ids = CAB.ARCADE_CABINETS.map((c) => c.id);
  assert(new Set(ids).size === 3, "two cabinets share an id");
  assert(["spoolyard", "crewrun", "palletstacker"].every((id) => ids.includes(id)), `unexpected cabinet ids: ${ids.join(", ")}`);
  for (const cab of CAB.ARCADE_CABINETS) {
    assert(cab.name && cab.genre && cab.blurb && cab.teaches && cab.controls, `${cab.id} is missing a name, genre, blurb, teaches or controls line`);
    assert(typeof cab.engine?.create === "function" && typeof cab.engine?.step === "function" && typeof cab.engine?.render === "function", `${cab.id}'s engine is missing create/step/render`);
    const s = cab.engine.create({ seed: 1, players: cab.players === 2 ? 2 : undefined });
    cab.engine.step(s, 1 / 60, {});
    assert(s, `${cab.id}'s engine did not produce a state`);
  }
});

await check("the arcade app is in the bundler's list with every module, and its dist file is built", () => {
  const bundler = readFileSync(join(ROOT, "tools", "bundle_webxr.py"), "utf8");
  const block = /"arcade":\s*\{[\s\S]*?"modules":\s*\[([\s\S]*?)\]/.exec(bundler)?.[1] ?? "";
  const bundled = [...block.matchAll(/(SHARED|WEBXR)\s*\/\s*"([^"]+)"/g)].map((m) => (m[1] === "SHARED" ? `shared/${m[2]}` : m[2]));
  assert(bundled.length > 0, 'tools/bundle_webxr.py has no "arcade" app');
  for (const f of ["scores.js", "audio.js", "cabinets.js", "app.js", "games/spoolyard.js", "games/crewrun.js", "games/palletstacker.js"]) {
    assert(bundled.includes(`arcade/js/${f}`), `arcade/js/${f} is not in the bundle`);
  }
  assert(/"arcade":\s*"arcade\.html"/.test(bundler), "arcade.html is not copied into the combined WebXR/dist folder");
  assert(existsSync(join(ARCADE, "index.html")), "WebXR/arcade/index.html is missing");
  const distPath = join(WEBXR, "dist", "arcade.html");
  assert(existsSync(distPath), "WebXR/dist/arcade.html has not been built — run python3 tools/bundle_webxr.py");
  const dist = readFileSync(distPath, "utf8");
  assert(dist.includes("ARCADE_CABINETS") && dist.includes("syCreate") && dist.includes("psCreate") && dist.includes("crCreate"), "WebXR/dist/arcade.html is stale — run python3 tools/bundle_webxr.py");
  const external = [...dist.matchAll(/<(?:script|link|img|audio|video|source)\b[^>]*>/g)].map((m) => m[0])
    .filter((tag) => !/rel="preconnect"/.test(tag))
    .map((tag) => /(?:src|href)="(https?:[^"]+)"/.exec(tag)?.[1]).filter(Boolean)
    .filter((u) => !/fonts\.(googleapis|gstatic)\.com/.test(u));
  assert(external.length === 0, `the bundle loads external assets: ${external.join(", ")}`);
});

await check("check_all.mjs runs this checker, and the docs describe the arcade", () => {
  const all = readFileSync(join(ROOT, "tools", "check_all.mjs"), "utf8");
  assert(all.includes('"check_arcade.mjs"'), "check_all.mjs does not run check_arcade.mjs");
  const doc = readFileSync(join(ROOT, "docs", "easter-egg.md"), "utf8");
  assert(/break room arcade/i.test(doc), "docs/easter-egg.md does not mention the Break Room Arcade");
  for (const name of ["Spool Yard", "Crew Run", "Pallet Stacker"]) assert(doc.includes(name), `docs/easter-egg.md does not mention ${name}`);
  assert(/arcade\.html/.test(doc), "docs/easter-egg.md does not say how to open arcade.html");
  assert(existsSync(join(ROOT, "docs", "screenshots", "arcade")), "docs/screenshots/arcade is missing");
});

console.log(failures ? `\n${failures} check(s) failed.` : "\nAll Break Room Arcade checks pass: three cabinets run 30 s headless sessions clean; scores and the stack-lean mechanic hold.");
process.exit(failures ? 1 : 0);
