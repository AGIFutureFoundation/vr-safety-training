/**
 * Headless checks for the Holodeck prompt-to-course generator.
 *
 * Like check_orbis_stable.mjs, this covers pure logic with no THREE/DOM
 * dependency — the prompt parser, theme registry and ball physics — so it
 * runs directly under plain Node. It cannot exercise the actual 3D
 * rendering or speech input (see WebXR/holodeck/index.html for that); a
 * real-browser pass is the right tool for those, the same way it has been
 * for the union-trade sims.
 *
 *     node tools/check_holodeck.mjs
 */

import { THEMES, findTheme, DEFAULT_THEME_ID } from "../WebXR/holodeck/js/themes.js";
import { localInterpreter, interpretPrompt, SUPPORTED_GAME_TYPES } from "../WebXR/holodeck/js/prompt-parser.js";
import { HOLE_LAYOUTS, buildCourse, createBall, putt, stepBall } from "../WebXR/holodeck/js/minigolf.js";
import { EQUIPMENT, TEMPLATES, buildTrainingRoom } from "../WebXR/holodeck/js/training.js";

// game.js's Sfx.ensure() reads `window` unguarded (unlike its localStorage
// calls, which are already wrapped in try/catch) — stub it before import,
// the same way check_smartcity.mjs and check_trades.mjs do.
globalThis.window = globalThis.window ?? {};
const { Session, Sfx } = await import("../WebXR/shared/game.js");
Sfx.muted = true;

let failures = 0;
function check(name, fn) {
  try {
    fn();
    console.log(`  ✓ ${name}`);
  } catch (err) {
    failures += 1;
    console.log(`  ✗ ${name}\n      ${err.stack ?? err}`);
  }
}

console.log("Holodeck — self-test\n");

check("every theme has a unique id and at least one keyword", () => {
  const ids = new Set();
  for (const t of THEMES) {
    if (ids.has(t.id)) throw new Error(`duplicate theme id "${t.id}"`);
    ids.add(t.id);
    if (!t.keywords?.length) throw new Error(`theme "${t.id}" has no keywords`);
  }
  if (THEMES.length < 3) throw new Error("expected at least 3 themes to prove the theme isn't hardcoded");
});

check("findTheme falls back to the default for an unknown id", () => {
  const t = findTheme("nonexistent-theme-xyz");
  if (t.id !== DEFAULT_THEME_ID) throw new Error(`expected fallback to "${DEFAULT_THEME_ID}", got "${t.id}"`);
});

check('localInterpreter recognizes "make a mini golf game with an alaskan theme"', () => {
  const r = localInterpreter("make a mini golf game with an alaskan theme");
  if (r.gameType !== "minigolf" || !r.matchedGame) throw new Error("did not match mini golf");
  if (r.themeId !== "alaska" || !r.matchedTheme) throw new Error("did not match the Alaskan theme");
});

check("localInterpreter matches every declared theme keyword", () => {
  for (const theme of THEMES) {
    for (const kw of theme.keywords) {
      const r = localInterpreter(`build me a golf course, ${kw} style`);
      if (r.themeId !== theme.id) throw new Error(`keyword "${kw}" resolved to "${r.themeId}", expected "${theme.id}"`);
    }
  }
});

check("an unrecognized prompt still returns a usable default, not a throw", () => {
  const r = localInterpreter("asdkjaslkdj nonsense prompt");
  if (!SUPPORTED_GAME_TYPES.includes(r.gameType)) throw new Error("fell back to an unsupported game type");
  if (r.matchedGame || r.matchedTheme) throw new Error("should not have matched anything");
  if (!findTheme(r.themeId)) throw new Error("fallback theme id does not resolve");
});

await (async () => {
  try {
    const r = await interpretPrompt("mini golf, tropical");
    if (r.themeId !== "tropical") throw new Error("interpretPrompt did not thread through to the default interpreter");
    // The injectable seam a real model would later be wired through.
    const fakeModel = async (text) => ({ gameType: "minigolf", themeId: "desert", matchedGame: true, matchedTheme: true, raw: text });
    const r2 = await interpretPrompt("anything", { interpreter: fakeModel });
    if (r2.themeId !== "desert") throw new Error("interpretPrompt did not use the injected interpreter");
    console.log("  ✓ interpretPrompt supports swapping in a different interpreter");
  } catch (err) {
    failures += 1;
    console.log(`  ✗ interpretPrompt seam\n      ${err.stack ?? err}`);
  }
})();

check("every hole's cup and tee sit inside its own fairway bounds", () => {
  for (const hole of HOLE_LAYOUTS) {
    const halfW = hole.width / 2;
    for (const [label, pt] of [["tee", hole.tee], ["cup", hole.cup]]) {
      if (Math.abs(pt.x) > halfW) throw new Error(`${hole.id}: ${label} x=${pt.x} outside width ${hole.width}`);
      if (pt.z < 0 || pt.z > hole.length) throw new Error(`${hole.id}: ${label} z=${pt.z} outside length ${hole.length}`);
    }
    for (const wall of hole.walls) {
      if (Math.abs(wall.x) + wall.w / 2 > halfW + 1e-6) throw new Error(`${hole.id}: a wall extends past the fairway width`);
    }
  }
});

check('buildCourse(theme) returns all three holes by default', () => {
  const course = buildCourse(findTheme("alaska"));
  if (course.holes.length !== HOLE_LAYOUTS.length) throw new Error(`expected ${HOLE_LAYOUTS.length} holes, got ${course.holes.length}`);
});

check("a straight, well-aimed putt sinks on the straight hole", () => {
  const hole = HOLE_LAYOUTS.find((h) => h.id === "straight");
  const ball = createBall(hole);
  // Enough power to cover the distance to the cup and still be under the
  // sink-speed limit when it gets there — too hard and it rolls straight
  // over the cup, which is realistic and exercised by the test below.
  putt(ball, hole.cup.x - ball.x, hole.cup.z - ball.z, 0.79);
  let sunk = false;
  for (let i = 0; i < 60 * 8 && !sunk; i++) {
    const { sunk: s } = stepBall(ball, hole, 1 / 60);
    sunk = s;
  }
  if (!sunk) throw new Error("a direct shot at the cup never sank");
  if (ball.strokes !== 1) throw new Error(`expected 1 stroke, got ${ball.strokes}`);
});

check("ball physics stay finite and in-bounds on every hole under a hard putt", () => {
  for (const hole of HOLE_LAYOUTS) {
    const ball = createBall(hole);
    putt(ball, 0.3, 1, 1);
    for (let i = 0; i < 60 * 10; i++) {
      stepBall(ball, hole, 1 / 60);
      if (!Number.isFinite(ball.x) || !Number.isFinite(ball.z)) throw new Error(`${hole.id}: ball position went non-finite`);
      const halfW = hole.width / 2;
      if (ball.x < -halfW - 1e-6 || ball.x > halfW + 1e-6) throw new Error(`${hole.id}: ball escaped fairway width (x=${ball.x})`);
      if (ball.z < -1e-6 || ball.z > hole.length + 1e-6) throw new Error(`${hole.id}: ball escaped fairway length (z=${ball.z})`);
      if (ball.sunk) break;
    }
  }
});

check("every template and equipment entry has a unique id and keywords", () => {
  for (const [label, list] of [["template", TEMPLATES], ["equipment", EQUIPMENT]]) {
    const ids = new Set();
    for (const item of list) {
      if (ids.has(item.id)) throw new Error(`duplicate ${label} id "${item.id}"`);
      ids.add(item.id);
      if (!item.keywords?.length) throw new Error(`${label} "${item.id}" has no keywords`);
    }
  }
  if (TEMPLATES.length < 2) throw new Error("expected at least 2 templates to prove the generator isn't one hardcoded procedure");
});

check('localInterpreter recognizes "run a lockout training on a forklift"', () => {
  const r = localInterpreter("run a lockout training on a forklift");
  if (r.gameType !== "training") throw new Error(`expected gameType "training", got "${r.gameType}"`);
  if (r.templateId !== "lockout") throw new Error(`expected template "lockout", got "${r.templateId}"`);
  if (r.equipmentId !== "forklift") throw new Error(`expected equipment "forklift", got "${r.equipmentId}"`);
});

check('localInterpreter recognizes "confined space entry simulation for a storage tank"', () => {
  const r = localInterpreter("confined space entry simulation for a storage tank");
  if (r.gameType !== "training") throw new Error(`expected gameType "training", got "${r.gameType}"`);
  if (r.templateId !== "confined-space") throw new Error(`expected template "confined-space", got "${r.templateId}"`);
  if (r.equipmentId !== "tank") throw new Error(`expected equipment "tank", got "${r.equipmentId}"`);
});

/** A generic scripted "perfect run" driver — the same idea as
 * check_smartcity.mjs's player, general enough for any generated room
 * since generated procedures only ever use select/turn/gauge steps. */
function playPerfect(session) {
  let guard = 0;
  while (!session.finished) {
    if (++guard > 1000) throw new Error("perfect run did not finish — possible infinite loop");
    const step = session.step;
    if (!step) throw new Error("session has no current step but is not finished");
    if (step.kind === "turn") {
      session.rotate(step.target, (step.turn?.turns ?? 1) + 0.01);
    } else if (step.kind === "gauge") {
      const [lo, hi] = step.gauge.green;
      session.gauge.t = (lo + hi) / 2;
      session.select(step.target);
    } else {
      session.select(step.target);
    }
  }
}

check("every template x equipment combination generates a well-formed, playable room", () => {
  for (const tpl of TEMPLATES) {
    for (const eq of EQUIPMENT) {
      const room = buildTrainingRoom({ templateId: tpl.id, equipmentId: eq.id });
      if (!room.steps.length) throw new Error(`${room.id}: no steps generated`);
      if (!(room.parSeconds > 0)) throw new Error(`${room.id}: invalid parSeconds`);
      if (!Object.keys(room.hazards).length) throw new Error(`${room.id}: no hazards generated`);
      const session = new Session(room, {});
      session.start();
      playPerfect(session);
      if (!session.finished) throw new Error(`${room.id}: session never finished`);
      if (session.errors !== 0) throw new Error(`${room.id}: a perfect run logged ${session.errors} error(s)`);
      if (!(session.score > 0)) throw new Error(`${room.id}: perfect run scored ${session.score}`);
    }
  }
});

console.log(failures === 0 ? "\nAll Holodeck checks pass." : `\n${failures} check(s) failed.`);
process.exit(failures === 0 ? 0 : 1);
