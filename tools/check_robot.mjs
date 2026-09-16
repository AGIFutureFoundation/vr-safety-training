/**
 * Headless checks for the robot trainee layer (WebXR/shared/robot.js): a
 * seeded agent is reproducible, an expert passes every room clean, a novice
 * fails more than an expert, trajectories carry observation/action/reward,
 * and the curriculum lands a station inside its target band.
 *
 *     node tools/check_robot.mjs
 */
import { loadTrades, loadSmartCity } from "./lib/headless.mjs";

let failures = 0;
function check(name, fn) {
  try { fn(); console.log(`  ✓ ${name}`); }
  catch (err) { failures += 1; console.log(`  ✗ ${name}\n      ${err.stack ?? err}`); }
}
const eq = (a, b, what) => { if (a !== b) throw new Error(`${what}: expected ${JSON.stringify(b)}, got ${JSON.stringify(a)}`); };
const ok = (v, what) => { if (!v) throw new Error(what); };

console.log("Robot trainees — self-test\n");

const trades = await loadTrades();
trades.Sfx.muted = true;
const build = (suite, room) => room.build(new suite.THREE.Group());

check("an expert (skill 1) passes every Trade Skills room with three stars and no unsafe action", () => {
  for (const room of trades.ROOMS) {
    const { summary } = trades.runEpisode(room, build(trades, room), { skill: 1, seed: 3, SessionClass: trades.Session });
    ok(summary.finished, `${room.id} did not finish`);
    eq(summary.stars, 3, `${room.id} stars`); eq(summary.hazardHits, 0, `${room.id} unsafe actions`); eq(summary.errors, 0, `${room.id} errors`);
  }
});

check("a seeded episode is reproducible decision for decision", () => {
  const room = trades.ROOMS[0];
  const a = trades.runEpisode(room, build(trades, room), { skill: 0.4, seed: 42, SessionClass: trades.Session });
  const b = trades.runEpisode(room, build(trades, room), { skill: 0.4, seed: 42, SessionClass: trades.Session });
  eq(JSON.stringify(a.records.map((r) => r.action)), JSON.stringify(b.records.map((r) => r.action)), "action sequence");
  eq(a.summary.score, b.summary.score, "score");
});

check("trajectories carry observation, action and reward, and rewards sum to the score", () => {
  const room = trades.ROOMS[6];
  const { summary, records, session } = trades.runEpisode(room, build(trades, room), { skill: 0.7, seed: 5, SessionClass: trades.Session });
  ok(records.length > 0, "no records");
  for (const r of records) { ok(r.obs && typeof r.obs.stepIndex === "number", "obs"); ok(r.action?.type, "action"); ok(typeof r.reward === "number", "reward"); }
  // Every point in the final score is some logged record's reward — including
  // the end-of-run bonuses, which land on the decision that finishes the run.
  const sum = records.reduce((n, r) => n + r.reward, 0);
  eq(sum, summary.score, "reward accounting");
  ok((session.timeBonus | 0) > 0, "a finished run has a time bonus to account for");
  ok(records.some((r) => r.obs.kind === "gauge" && r.action.type === "commit"), "gauge commits recorded");
  ok(records.some((r) => r.obs.kind === "hold" || r.obs.kind === "track"), "timed steps recorded");
});

check("a novice (skill 0.15) passes less often and hits more hazards than an expert, over 12 seeds", () => {
  const room = trades.ROOMS[0];
  let novicePass = 0, expertPass = 0, noviceHaz = 0;
  for (let i = 0; i < 12; i++) {
    const n = trades.runEpisode(room, build(trades, room), { skill: 0.15, seed: 100 + i, SessionClass: trades.Session }).summary;
    const e = trades.runEpisode(room, build(trades, room), { skill: 1, seed: 100 + i, SessionClass: trades.Session }).summary;
    novicePass += n.passed ? 1 : 0; expertPass += e.passed ? 1 : 0; noviceHaz += n.hazardHits;
  }
  eq(expertPass, 12, "expert passes"); ok(novicePass < 12, `novice passed ${novicePass}/12`); ok(noviceHaz > 0, "novice never hit a hazard");
});

check("calibrate() finds a skill whose success rate lands in the band, and records the curve", () => {
  const room = trades.ROOMS[1];
  const cal = trades.calibrate(room, build(trades, room), { band: [0.5, 0.9], episodes: 10, seed: 9, SessionClass: trades.Session });
  ok(cal.history.length >= 3, "curve too short");
  ok(cal.optimal.successRate >= 0.5 && cal.optimal.successRate <= 0.9, `optimal ${JSON.stringify(cal.optimal)} outside band`);
  const rates = cal.history.filter((h) => h.skill === 0 || h.skill === 1);
  ok(rates.find((h) => h.skill === 1).successRate >= rates.find((h) => h.skill === 0).successRate, "expert should not do worse than random");
});

const city = await loadSmartCity();
city.Sfx.muted = true;
check("an expert passes every SmartCiti.X station, including the flat briefing, clean", () => {
  for (const room of city.ROOMS) {
    const { summary } = city.runEpisode(room, build(city, room), { skill: 1, seed: 2, SessionClass: city.Session });
    ok(summary.finished, `${room.id} did not finish`);
    eq(summary.hazardHits, 0, `${room.id} unsafe actions`); eq(summary.errors, 0, `${room.id} errors`); ok(summary.stars >= 2, `${room.id} stars ${summary.stars}`);
  }
});

console.log(failures ? `\n${failures} check(s) failed.` : "\nAll robot-trainee checks pass.");
process.exit(failures ? 1 : 0);
