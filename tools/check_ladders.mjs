/**
 * Gates the ten-level ladders (tools/briefs/ladder-brief.md):
 *
 *   1. every programme in curricula.js has exactly ten levels, numbered 1–10
 *   2. every task is a real station, and every step count, par total, partial
 *      flag, shortfall and standards list recomputes from the real modules
 *      and matches — and the generated file is what gen_ladders.mjs writes now
 *   3. level 10 is a capstone: its programme's hardest 3–4 stations, no
 *      coaching; levels 1–9 are coached; 7+ carry a declared interruption
 *   4. ladders.overrides.json validates and every entry in it is applied
 *   5. shared/ladder.js: the levelState truth table, the level-run functions,
 *      the badge and the xAPI statement
 *   6. a headless run of one level chain on electrical-first-period — a
 *      Trade Skills room and SmartCiti.X stations, played by the software
 *      trainee at full skill — reaches its results, passes, opens level 2, and its badge verifies
 *   7. both bundles ship shared/ladder.js, and SmartCiti.X ships ladders.js
 *
 *     node tools/check_ladders.mjs
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { ROOT, loadSmartCity, loadTrades } from "./lib/headless.mjs";
import { CURRICULA } from "../WebXR/smartcity/js/curricula.js";
import { LADDERS, LADDER_BY_PROGRAMME, LADDER_STEP_BAR, LADDER_STANDARDS } from "../WebXR/smartcity/js/ladders.js";
import {
  levelState, levelBadge, levelXAPI, nextTask, startLevelRun, recordTask, levelResult, levelTag, parseLevelRef,
  LADDER_LEVELS, readLevelRun, writeLevelRun, clearLevelRun,
} from "../WebXR/shared/ladder.js";
import { stationMetrics, buildLadders, readOverrides, overrideProblems, resolveTaskRef, STEP_BAR, difficulty } from "./gen_ladders.mjs";

let failures = 0;
const fail = (area, msg) => { failures += 1; console.log(`  ✗ [${area}] ${msg}`); };
const ok = (msg) => console.log(`  ✓ ${msg}`);
const eq = (a, b) => JSON.stringify(a) === JSON.stringify(b);

const metrics = await stationMetrics();

// ------------------------------------------------------------ 1. ten levels
if (STEP_BAR !== 50 || LADDER_STEP_BAR !== 50) fail("shape", "the step bar is 50 in the brief");
if (LADDER_LEVELS !== 10) fail("shape", "shared/ladder.js must count ten levels");
for (const prog of CURRICULA) if (!LADDER_BY_PROGRAMME[prog.id]) fail("shape", `${prog.id} has no ladder`);
for (const l of LADDERS) {
  if (!CURRICULA.some((c) => c.id === l.programme)) fail("shape", `ladder ${l.programme} names no programme`);
  if (l.levels.length !== 10) fail("shape", `${l.programme} has ${l.levels.length} levels, not 10`);
  l.levels.forEach((lv, i) => {
    if (lv.n !== i + 1) fail("shape", `${l.programme} level ${i + 1} is numbered ${lv.n}`);
    if (lv.programme !== l.programme) fail("shape", `${l.programme}:${lv.n} carries programme ${lv.programme}`);
    if (!lv.title) fail("shape", `${l.programme}:${lv.n} has no title`);
  });
}
const allLevels = LADDERS.flatMap((l) => l.levels);
if (!failures) ok(`${LADDERS.length} programmes, ${allLevels.length} levels, ten each, numbered 1–10`);

// ------------------------------------------------ 2. tasks exist, totals match
const before = failures;
for (const l of LADDERS) {
  for (const lv of l.levels) {
    let steps = 0, par = 0;
    const std = new Set();
    const declared = [];
    for (const t of lv.tasks) {
      const m = metrics.get(`${t.app}:${t.id}`);
      if (!m) { fail("tasks", `${l.programme}:${lv.n} names ${t.app}:${t.id}, which is not a station`); continue; }
      if (t.steps !== m.steps) fail("tasks", `${l.programme}:${lv.n} says ${t.id} has ${t.steps} steps; the module has ${m.steps}`);
      const row = l.stations[`${t.app}:${t.id}`];
      if (!row || row.steps !== m.steps || row.parSeconds !== m.parSeconds || !eq(row.interrupts, m.interrupts)) fail("tasks", `${l.programme}: station table row for ${t.id} is stale`);
      steps += m.steps; par += m.parSeconds;
      for (const s of m.standards) std.add(s);
      for (const i of m.interrupts) declared.push({ task: m.id, id: i.id });
    }
    if (new Set(lv.tasks.map((t) => `${t.app}:${t.id}`)).size !== lv.tasks.length) fail("tasks", `${l.programme}:${lv.n} names a task twice`);
    if (lv.steps !== steps) fail("totals", `${l.programme}:${lv.n} says ${lv.steps} steps; its tasks total ${steps}`);
    if (lv.parSeconds !== par) fail("totals", `${l.programme}:${lv.n} says par ${lv.parSeconds}s; its tasks total ${par}s`);
    if (lv.partial !== steps < LADDER_STEP_BAR) fail("totals", `${l.programme}:${lv.n} partial flag is ${lv.partial} at ${steps} steps`);
    if (lv.shortfall !== Math.max(0, LADDER_STEP_BAR - steps)) fail("totals", `${l.programme}:${lv.n} shortfall ${lv.shortfall} should be ${Math.max(0, LADDER_STEP_BAR - steps)}`);
    if (!eq(lv.standards, [...std].sort())) fail("standards", `${l.programme}:${lv.n} standards do not match its tasks' registry hits`);
    for (const id of lv.standards) if (!LADDER_STANDARDS[id]) fail("standards", `${id} is missing from LADDER_STANDARDS`);
    if (lv.hours != null) fail("standards", `${l.programme}:${lv.n} claims ${lv.hours} hours; no registry entry states an hour equivalence`);
    if (lv.n >= 7 && !eq(lv.interruptions, declared)) fail("interrupts", `${l.programme}:${lv.n} interruptions list does not match its tasks' declared interruptions`);
    if (lv.n < 7 && lv.interruptions.length) fail("interrupts", `${l.programme}:${lv.n} exposes interruptions below level 7`);
  }
}
const regenerated = await buildLadders(metrics);
for (const g of regenerated.ladders) {
  const have = LADDER_BY_PROGRAMME[g.programme];
  if (!have) continue;
  for (const lv of g.levels) if (!eq(lv, have.levels[lv.n - 1])) fail("drift", `${g.programme}:${lv.n} differs from what gen_ladders.mjs generates now — run node tools/gen_ladders.mjs`);
}
const partial = allLevels.filter((lv) => lv.partial);
if (failures === before) ok(`every task is a real station; steps, par, partial flags and standards recompute and match; ${partial.length} of ${allLevels.length} levels partial`);

// -------------------------------------------------------------- 3. capstone
const before3 = failures;
const overrides = readOverrides();
for (const l of LADDERS) {
  const prog = CURRICULA.find((c) => c.id === l.programme);
  for (const lv of l.levels.slice(0, 9)) if (lv.coaching !== true) fail("capstone", `${l.programme}:${lv.n} must be coached`);
  const cap = l.levels[9];
  if (cap.coaching !== false) fail("capstone", `${l.programme}:10 must run with coaching: false`);
  if (cap.band !== "capstone") fail("capstone", `${l.programme}:10 is not marked capstone`);
  const distinct = new Set(prog.stations.map((s) => `${s.app}:${s.id}`)).size;
  const want = Math.min(distinct, 3);
  if (cap.tasks.length < want || cap.tasks.length > 4) fail("capstone", `${l.programme}:10 has ${cap.tasks.length} tasks; a capstone is the hardest 3–4`);
  if (!overrides.programmes?.[l.programme]?.["10"]?.tasks) {
    const ranked = [...new Set(prog.stations.map((s) => `${s.app}:${s.id}`))].map((k) => metrics.get(k))
      .sort((a, b) => b.difficulty - a.difficulty || b.id.localeCompare(a.id));
    const hardest = new Set(ranked.slice(0, cap.tasks.length).map((m) => `${m.app}:${m.id}`));
    for (const t of cap.tasks) if (!hardest.has(`${t.app}:${t.id}`)) fail("capstone", `${l.programme}:10 includes ${t.id}, which is not among its hardest ${cap.tasks.length}`);
    for (const t of cap.tasks) { const m = metrics.get(`${t.app}:${t.id}`); if (m.difficulty !== difficulty(m)) fail("capstone", "difficulty drifted"); }
  }
  for (const lv of l.levels.slice(6)) {
    if (!lv.interruptions.length) fail("interrupts", `${l.programme}:${lv.n} has no declared interruption for CMD_INTERRUPT to fire`);
  }
  for (const lv of l.levels.slice(6, 8)) if (lv.tasks.length < Math.min(2, distinct)) fail("chain", `${l.programme}:${lv.n} is a chain of one`);
}
if (failures === before3) ok("level 10 is the hardest 3–4 stations with coaching off in every programme; 1–9 coached; every 7+ chain declares an interruption");

// -------------------------------------------------------------- 4. overrides
const before4 = failures;
for (const p of overrideProblems(overrides, metrics)) fail("overrides", p);
let applied = 0;
for (const [pid, levels] of Object.entries(overrides.programmes ?? {})) {
  const prog = CURRICULA.find((c) => c.id === pid);
  for (const [key, o] of Object.entries(levels)) {
    const lv = LADDER_BY_PROGRAMME[pid]?.levels[Number(key) - 1];
    if (!lv) continue;
    if (lv.source !== "override") fail("overrides", `${pid}:${key} is not marked as an override in ladders.js`);
    if (o.title && lv.title !== o.title) fail("overrides", `${pid}:${key} title not applied`);
    if (o.tasks && !eq(lv.tasks.map((t) => `${t.app}:${t.id}`), o.tasks.map((r) => { const t = resolveTaskRef(r, prog); return `${t.app}:${t.id}`; }))) fail("overrides", `${pid}:${key} tasks not applied`);
    applied += 1;
  }
}
// The validator itself must refuse what it should.
const bad = overrideProblems({ programmes: {
  "no-such-programme": { 1: { title: "x" } },
  "confined-space": { 11: { title: "x" }, 2: { tasks: ["no-such-station"] }, 3: { colour: "red" }, 10: { tasks: ["valve-vault"] } },
} }, metrics);
if (bad.length < 5) fail("overrides", `the override validator let bad entries through (${bad.length} of 5 caught)`);
if (failures === before4) ok(`overrides validate; ${applied} hand-tuned level${applied === 1 ? "" : "s"} applied; the validator refuses a bad programme, level, task, field and capstone`);

// ---------------------------------------------------------- 5. ladder.js rules
const before5 = failures;
const T = (id, steps = 13) => ({ app: "smartcity", id, steps });
const fake = {
  programme: "demo",
  levels: Array.from({ length: 10 }, (_, i) => ({
    programme: "demo", n: i + 1, title: `L${i + 1}`, coaching: i < 9, steps: 52, partial: i === 2, shortfall: i === 2 ? 4 : 0,
    tasks: i === 0 ? [T("a"), T("b")] : i === 1 ? [T("c"), T("d")] : [T("e")], standards: ["osha-1910-147"], interruptions: [],
  })),
};
const good = (simId, run, level = 1, extra = {}) => ({
  simId, stars: 3, hazardHits: 0, seconds: 100, parSeconds: 200, at: "2026-09-01T10:00:00Z",
  interrupts: { answered: 2, wrong: 0, missed: 0 }, ladder: { programme: "demo", level, run, task: 0 }, ...extra,
});
const states = (recs) => levelState(fake, recs).map((s) => s.state[0]).join("");
const table = [
  ["no records", [], "oLLLLLLLLL"],
  ["level 1 mastered in one run", [good("a", "r1"), good("b", "r1")], "poLLLLLLLL"],
  ["one task unsafe", [good("a", "r1"), good("b", "r1", 1, { hazardHits: 1 })], "oLLLLLLLLL"],
  ["one star", [good("a", "r1"), good("b", "r1", 1, { stars: 1 })], "oLLLLLLLLL"],
  ["missed interruption", [good("a", "r1"), good("b", "r1", 1, { interrupts: { answered: 1, wrong: 0, missed: 1 } })], "oLLLLLLLLL"],
  ["over 1.5x par", [good("a", "r1"), good("b", "r1", 1, { seconds: 301 })], "oLLLLLLLLL"],
  ["tasks split over two runs", [good("a", "r1"), good("b", "r2")], "oLLLLLLLLL"],
  ["stations mastered outside a level", [{ ...good("a", "r1"), ladder: undefined }, { ...good("b", "r1"), ladder: undefined }], "oLLLLLLLLL"],
  ["a level-1 task tagged for another programme", [good("a", "r1"), { ...good("b", "r1"), ladder: { programme: "other", level: 1, run: "r1" } }], "oLLLLLLLLL"],
  ["level 2 mastered, level 1 not", [good("c", "r2", 2), good("d", "r2", 2)], "oLLLLLLLLL"],
  ["levels 1 and 2 mastered", [good("a", "r1"), good("b", "r1"), good("c", "r2", 2), good("d", "r2", 2)], "ppoLLLLLLL"],
  ["a failed retry after a pass keeps the pass", [good("a", "r1"), good("b", "r1"), good("a", "r3", 1, { hazardHits: 2 })], "poLLLLLLLL"],
];
for (const [name, recs, want] of table) {
  const got = states(recs).replace(/l/g, "L");
  if (got !== want) fail("levelState", `${name}: ${got}, expected ${want}`);
}
const st = levelState(fake, [good("a", "r1"), good("b", "r1")]);
if (st[0].run !== "r1" || !st[0].passedAt) fail("levelState", "a passed level names its run and date");
if (!st[2].partial || st[2].shortfall !== 4) fail("levelState", "the partial flag and shortfall pass through");
if (!eq(parseLevelRef("electrical-first-period:7"), { programme: "electrical-first-period", level: 7 })) fail("parse", "programme:level parses");
for (const b of ["x:0", "x:11", "x", ":3", "X Y:2"]) if (parseLevelRef(b)) fail("parse", `"${b}" must not parse`);
// A run: ignores a station played on the side, ends after the last task.
let run = startLevelRun(fake, 1, { id: "r9", at: "2026-09-02T00:00:00Z" });
if (nextTask(run)?.id !== "a" || nextTask(run).of !== 2) fail("run", "a fresh run stands on its first task");
run = recordTask(run, { ...good("zzz", "r9"), id: "x0" });
if (run.attempts.length !== 0) fail("run", "an attempt on another station must not be folded into a level");
run = recordTask(run, { ...good("a", "r9"), id: "x1", score: 900 });
run = recordTask(run, { ...good("b", "r9"), id: "x2", score: 800, seconds: 250 });
const res = levelResult(run);
if (nextTask(run) !== null || !res.done || !res.passed || res.score !== 1700 || res.rows.length !== 2) fail("run", `the finished run reports done, passed and the shared score (${JSON.stringify({ done: res.done, passed: res.passed, score: res.score })})`);
const failedRun = recordTask(recordTask(startLevelRun(fake, 1), good("a", "r")), good("b", "r", 1, { hazardHits: 1 }));
const fr = levelResult(failedRun);
if (fr.passed || fr.shortfall?.task !== "b" || !/unsafe/.test(fr.shortfall.reason)) fail("run", "a run with an unsafe task fails and names the task and the reason");
if (!eq(levelTag(run, 1), { programme: "demo", level: 1, run: "r9", task: 1 })) fail("run", "levelTag carries programme, level, run and task");
const mem = new Map();
const store = { getItem: (k) => mem.get(k) ?? null, setItem: (k, v) => mem.set(k, v), removeItem: (k) => mem.delete(k) };
writeLevelRun(run, store);
if (!eq(readLevelRun(store), run)) fail("run", "a level run round-trips through storage");
clearLevelRun(store);
if (readLevelRun(store) !== null) fail("run", "clearLevelRun empties it");
const badge = levelBadge(fake.levels[0], { result: res, programmeName: "Demo", standards: { "osha-1910-147": { body: "OSHA", title: "29 CFR 1910.147" } } });
if (badge["@context"] !== "https://w3id.org/openbadges/v2" || badge.type !== "Assertion") fail("badge", "an Open Badges 2.0 assertion");
if (badge.level?.n !== 1 || badge.level.tasks.length !== 2 || !eq(badge.level.standards, ["osha-1910-147"])) fail("badge", "the badge carries the level, its tasks and standards");
if (badge.badge.alignment[0]?.targetFramework !== "OSHA" || badge.evidence.length !== 2) fail("badge", "alignment names the body; evidence names the attempts");
if (!/mastery/i.test(badge.badge.criteria.narrative)) fail("badge", "the criteria state the mastery rule");
const x = levelXAPI(fake.levels[0], res, { assertion: badge });
if (!/passed$/.test(x.verb.id) || x.result.score.raw !== 1700 || !x.result.success) fail("xapi", "a passed level sends verb passed with the shared score");
if (!/failed$/.test(levelXAPI(fake.levels[0], fr).verb.id)) fail("xapi", "a failed level sends verb failed");
if (failures === before5) ok(`levelState truth table (${table.length} cases), level runs, storage, the level badge and its xAPI statement`);

// ----------------------------------------------------- 6. a headless level chain
const before6 = failures;
{
  const city = await loadSmartCity();
  const trades = await loadTrades();
  const ladder = LADDER_BY_PROGRAMME["electrical-first-period"];
  const level = ladder.levels[0];
  let lr = startLevelRun(ladder, 1, { id: "headless-efp-1" });
  const records = [];
  let guard = 0, apps = new Set();
  while (nextTask(lr) && guard++ < 20) {
    const t = nextTask(lr);
    const suite = t.app === "trades" ? trades : city;
    const room = suite.ROOMS.find((r) => r.id === t.id);
    if (!room) { fail("chain", `task ${t.app}:${t.id} not in its suite`); break; }
    const root = new suite.THREE.Group();
    const api = room.build(root);
    const { session, summary } = suite.runEpisode(room, api, { skill: 1, seed: 7 + t.index, trajectory: false, SessionClass: suite.Session });
    if (!summary.finished) { fail("chain", `${t.id} did not finish`); break; }
    const iv = session.interruptSummary();
    const attempt = {
      id: `h-${t.index}`, at: new Date(Date.UTC(2026, 8, 1, 10, t.index)).toISOString(), app: t.app,
      simId: room.id, simName: room.name ?? room.title, score: session.score, stars: session.stars, errors: session.errors,
      hazardHits: session.hazardHits, seconds: Math.round(session.elapsed), parSeconds: room.parSeconds,
      interrupts: iv ? { answered: iv.answered, wrong: iv.wrong, missed: iv.missed } : null,
      ladder: levelTag(lr, t.index),
    };
    apps.add(t.app);
    records.push(attempt);
    lr = recordTask(lr, attempt);
  }
  const r = levelResult(lr);
  if (!r.done) fail("chain", "the level chain did not reach its results");
  if (r.rows.length !== level.tasks.length) fail("chain", `results have ${r.rows.length} rows for ${level.tasks.length} tasks`);
  if (r.steps !== level.steps) fail("chain", `results count ${r.steps} steps; the level has ${level.steps}`);
  if (!r.passed) fail("chain", `a full-skill trainee did not pass level 1: ${r.shortfall?.task} — ${r.shortfall?.reason}`);
  const after = levelState(ladder, records);
  if (after[0].state !== "passed" || after[1].state !== "open" || after[2].state !== "locked") fail("chain", `after the run: ${after.slice(0, 3).map((s) => s.state).join(", ")}`);
  const b = levelBadge(level, { result: r, programmeName: ladder.name, standards: LADDER_STANDARDS });
  if (b.level.tasks.length !== level.tasks.length || b.badge.alignment.length !== level.standards.length) fail("chain", "the level badge carries every task and standard");
  // The same verifier a third party would use (WebXR/verify/verify.js).
  const { validateAssertion } = await import("../WebXR/verify/verify.js");
  const hosted = levelBadge(level, { result: r, programmeName: ladder.name, standards: LADDER_STANDARDS, homePage: "https://hall.example", learnerId: "al-1815", learnerName: "Ada Lovelace" });
  const v = validateAssertion(hosted, { now: Date.parse("2026-09-22T00:00:00.000Z") });
  if (!v.ok) fail("chain", `the level badge fails the verifier: ${v.checks.filter((c) => !c.ok).map((c) => `${c.name} (${c.note})`).join("; ")}`);
  if (failures === before6) ok(`headless level chain: electrical-first-period level 1, ${level.tasks.length} tasks across ${[...apps].join(" and ")}, ${r.steps} steps, shared score ${r.score}, passed; level 2 opens; the level badge verifies`);
}

// ---------------------------------------------------------------- 7. bundles
const before7 = failures;
const bundler = readFileSync(join(ROOT, "tools/bundle_webxr.py"), "utf8");
const block = (app) => bundler.slice(bundler.indexOf(`"${app}": {`), bundler.indexOf('"entry"', bundler.indexOf(`"${app}": {`)));
for (const app of ["smartcity", "trades"]) if (!block(app).includes('SHARED / "ladder.js"')) fail("bundle", `${app} does not bundle shared/ladder.js`);
if (!block("smartcity").includes('"smartcity/js/ladders.js"')) fail("bundle", "smartcity does not bundle ladders.js");
if (failures === before7) ok("SmartCiti.X bundles ladder.js and ladders.js; Trade Skills bundles ladder.js");

console.log(failures ? `\n${failures} ladder check(s) failed.` : `\nAll ladder checks pass: ${allLevels.length} levels, ${partial.length} partial.`);
process.exit(failures ? 1 : 0);
