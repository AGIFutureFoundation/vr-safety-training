/**
 * Gates the twenty-level ladders (tools/briefs/ladder-brief.md):
 *
 *   1. every programme in curricula.js has exactly twenty levels, numbered
 *      1–20, the lesson bar is 75 and shared/ladder.js counts twenty
 *   2. every task is a real station under a condition it can honestly run;
 *      no pair twice in a level and no pair shared with an adjacent level;
 *      lessons, par, the partial flag, shortfall and standards recompute from
 *      the real modules and match — and ladders.js is what gen_ladders.mjs
 *      writes now; the condition lists match weather.js and stage.js
 *   3. the bands: 1–5 base and the hour, 6–10 weather and the hour, 11–14
 *      hazard mode and interruptions, 15–18 chains (two tasks, a declared
 *      interruption, a task run under one), 19 a shift of five, 20 the
 *      capstone — the hardest stations as assessment variants, no coaching
 *   4. ladders.overrides.json validates and every entry in it is applied
 *   5. shared/ladder.js: conditions, the levelState truth table, the
 *      level-run functions, the badge and the xAPI statement
 *   6. headless level chains: electrical-first-period level 1 (a Trade Skills
 *      room and SmartCiti.X stations) and a capstone of assessment variants,
 *      played by the software trainee at full skill, pass and open the next
 *      level, and the badge verifies
 *   7. the content gap in docs/ladders.md is the one the generator computes
 *   8. both bundles ship shared/ladder.js; SmartCiti.X ships ladders.js and
 *      variants.js, and reads every condition's query parameter
 *
 *     node tools/check_ladders.mjs
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { ROOT, WEBXR, loadSmartCity, loadTrades } from "./lib/headless.mjs";
import { CURRICULA } from "../WebXR/smartcity/js/curricula.js";
import { LADDERS, LADDER_BY_PROGRAMME, LADDER_STEP_BAR, LADDER_STANDARDS } from "../WebXR/smartcity/js/ladders.js";
import {
  levelState, levelBadge, levelXAPI, nextTask, startLevelRun, recordTask, levelResult, levelTag, parseLevelRef,
  LADDER_LEVELS, LESSON_BAR, readLevelRun, writeLevelRun, clearLevelRun,
  parseCondition, conditionValid, conditionParams, conditionFromQuery, taskKey, CONDITION_WEATHER, CONDITION_TIMES,
} from "../WebXR/shared/ladder.js";
import { makeVariant } from "../WebXR/shared/variants.js";
import { stationMetrics, buildLadders, readOverrides, overrideProblems, resolveTaskRef, STEP_BAR, difficulty } from "./gen_ladders.mjs";

let failures = 0;
const fail = (area, msg) => { failures += 1; console.log(`  ✗ [${area}] ${msg}`); };
const ok = (msg) => console.log(`  ✓ ${msg}`);
const eq = (a, b) => JSON.stringify(a) === JSON.stringify(b);
const kind = (c) => parseCondition(c)?.kind;

const metrics = await stationMetrics();

// ---------------------------------------------------------- 1. twenty levels
if (STEP_BAR !== 75 || LADDER_STEP_BAR !== 75 || LESSON_BAR !== 75) fail("shape", "the lesson bar is 75 in the brief");
if (LADDER_LEVELS !== 20) fail("shape", "shared/ladder.js must count twenty levels");
for (const prog of CURRICULA) if (!LADDER_BY_PROGRAMME[prog.id]) fail("shape", `${prog.id} has no ladder`);
for (const l of LADDERS) {
  if (!CURRICULA.some((c) => c.id === l.programme)) fail("shape", `ladder ${l.programme} names no programme`);
  if (l.levels.length !== 20) fail("shape", `${l.programme} has ${l.levels.length} levels, not 20`);
  l.levels.forEach((lv, i) => {
    if (lv.n !== i + 1) fail("shape", `${l.programme} level ${i + 1} is numbered ${lv.n}`);
    if (lv.programme !== l.programme) fail("shape", `${l.programme}:${lv.n} carries programme ${lv.programme}`);
    if (!lv.title) fail("shape", `${l.programme}:${lv.n} has no title`);
  });
}
const allLevels = LADDERS.flatMap((l) => l.levels);
if (!failures) ok(`${LADDERS.length} programmes, ${allLevels.length} levels, twenty each, numbered 1–20, 75 lessons the bar`);

// ------------------------------------------- 2. tasks, conditions, totals
const before = failures;
// The condition lists in shared/ladder.js are the stage's own, less the defaults.
const weatherSrc = readFileSync(join(WEBXR, "shared/weather.js"), "utf8");
const kinds = (weatherSrc.match(/export const WEATHER_KINDS = \[([^\]]*)\]/)?.[1] ?? "").split(",").map((k) => k.trim().replace(/^["']|["']$/g, "")).filter(Boolean);
if (!eq(kinds.filter((k) => k !== "clear"), CONDITION_WEATHER)) fail("conditions", `CONDITION_WEATHER ${CONDITION_WEATHER} is not weather.js's WEATHER_KINDS less clear (${kinds})`);
const stageSrc = readFileSync(join(WEBXR, "smartcity/js/stage.js"), "utf8");
const times = (stageSrc.match(/export const TIMES_OF_DAY = \[([^\]]*)\]/)?.[1] ?? "").split(",").map((k) => k.trim().replace(/^["']|["']$/g, "")).filter(Boolean);
if (!/TIMES_OF_DAY\.includes\(t\) \? t : "night"/.test(stageSrc)) fail("conditions", "stage.js no longer defaults to night, so base is not the night run");
if (!eq(times.filter((t) => t !== "night").sort(), [...CONDITION_TIMES].sort())) fail("conditions", `CONDITION_TIMES ${CONDITION_TIMES} is not stage.js's TIMES_OF_DAY less night (${times})`);
let taskCount = 0;
for (const l of LADDERS) {
  let prev = new Set();
  for (const lv of l.levels) {
    let lessons = 0, par = 0;
    const std = new Set();
    const declared = [];
    const keys = lv.tasks.map(taskKey);
    for (const t of lv.tasks) {
      taskCount += 1;
      const m = metrics.get(`${t.app}:${t.id}`);
      if (!m) { fail("tasks", `${l.programme}:${lv.n} names ${t.app}:${t.id}, which is not a station`); continue; }
      if (t.station !== `${t.app}:${t.id}`) fail("tasks", `${l.programme}:${lv.n} task ${t.id} has station ${t.station}`);
      if (t.steps !== m.steps) fail("tasks", `${l.programme}:${lv.n} says ${t.id} has ${t.steps} steps; the module has ${m.steps}`);
      if (!parseCondition(t.condition)) fail("conditions", `${l.programme}:${lv.n} ${t.id} has unknown condition "${t.condition}"`);
      else if (!conditionValid(t.condition, m)) fail("conditions", `${l.programme}:${lv.n} ${t.id} cannot honestly run under ${t.condition}`);
      const row = l.stations[`${t.app}:${t.id}`];
      if (!row || row.steps !== m.steps || row.parSeconds !== m.parSeconds || !eq(row.interrupts, m.interrupts) || !eq(row.standards, m.standards)) fail("tasks", `${l.programme}: station table row for ${t.id} is stale`);
      lessons += m.steps; par += m.parSeconds;
      for (const s of m.standards) std.add(s);
      for (const i of m.interrupts) declared.push({ task: m.id, id: i.id });
    }
    if (new Set(keys).size !== keys.length) fail("pairs", `${l.programme}:${lv.n} names the same station under the same condition twice`);
    const shared = keys.filter((k) => prev.has(k));
    if (shared.length) fail("pairs", `${l.programme}:${lv.n} repeats ${shared.join(", ")} from level ${lv.n - 1}`);
    prev = new Set(keys);
    if (lv.lessons !== lessons || lv.steps !== lessons) fail("totals", `${l.programme}:${lv.n} says ${lv.lessons} lessons; its tasks' steps total ${lessons}`);
    if (lv.parSeconds !== par) fail("totals", `${l.programme}:${lv.n} says par ${lv.parSeconds}s; its tasks total ${par}s`);
    if (lv.partial !== lessons < LADDER_STEP_BAR) fail("totals", `${l.programme}:${lv.n} partial flag is ${lv.partial} at ${lessons} lessons`);
    if (lv.shortfall !== Math.max(0, LADDER_STEP_BAR - lessons)) fail("totals", `${l.programme}:${lv.n} shortfall ${lv.shortfall} should be ${Math.max(0, LADDER_STEP_BAR - lessons)}`);
    if (!eq(lv.standards, [...std].sort())) fail("standards", `${l.programme}:${lv.n} standards do not match its tasks' registry hits`);
    for (const id of lv.standards) if (!LADDER_STANDARDS[id]) fail("standards", `${id} is missing from LADDER_STANDARDS`);
    if (lv.hours != null) fail("standards", `${l.programme}:${lv.n} claims ${lv.hours} hours; no registry entry states an hour equivalence`);
    if (lv.n >= 15 && !eq(lv.interruptions, declared)) fail("interrupts", `${l.programme}:${lv.n} interruptions list does not match its tasks' declared interruptions`);
    if (lv.n < 15 && lv.interruptions.length) fail("interrupts", `${l.programme}:${lv.n} exposes chain interruptions below level 15`);
  }
  for (const [k, row] of Object.entries(l.stations)) {
    const m = metrics.get(k);
    if (!m) { fail("tasks", `${l.programme}: station table names ${k}, which is not a station`); continue; }
    for (const id of row.standards) if (!LADDER_STANDARDS[id]) fail("standards", `${id} (station ${k}) is missing from LADDER_STANDARDS`);
  }
  const prog = CURRICULA.find((c) => c.id === l.programme);
  for (const s of prog.stations) if (!l.stations[`${s.app}:${s.id}`]) fail("tasks", `${l.programme}: station table lacks ${s.id}`);
}
const regenerated = await buildLadders(metrics);
for (const g of regenerated.ladders) {
  const have = LADDER_BY_PROGRAMME[g.programme];
  if (!have) continue;
  for (const lv of g.levels) if (!eq(lv, have.levels[lv.n - 1])) fail("drift", `${g.programme}:${lv.n} differs from what gen_ladders.mjs generates now — run node tools/gen_ladders.mjs`);
  if (!eq(g.gap, have.gap) || g.lessons !== have.lessons) fail("drift", `${g.programme}: gap or lesson total differs from what gen_ladders.mjs computes now`);
}
const partial = allLevels.filter((lv) => lv.partial);
if (failures === before) ok(`${taskCount} tasks: every one a real station under a condition it can run; no pair twice in a level or across adjacent levels; lessons, par, partial flags and standards recompute; ${partial.length} of ${allLevels.length} levels partial`);

// ----------------------------------------------------------------- 3. bands
const before3 = failures;
const overrides = readOverrides();
const BAND_KINDS = { orientation: ["base", "time"], procedures: ["base", "time"], weather: ["weather", "time"], hazard: ["hazard", "interrupt"], interrupted: ["hazard", "interrupt"] };
for (const l of LADDERS) {
  const prog = CURRICULA.find((c) => c.id === l.programme);
  const distinct = [...new Set(prog.stations.map((s) => `${s.app}:${s.id}`))];
  const interruptible = distinct.some((k) => metrics.get(k).app === "smartcity" && metrics.get(k).interrupts.length);
  for (const lv of l.levels) {
    const allowed = lv.n <= 5 ? BAND_KINDS.orientation : lv.n <= 10 ? BAND_KINDS.weather : lv.n <= 14 ? BAND_KINDS.hazard : null;
    if (allowed) for (const t of lv.tasks) if (!allowed.includes(kind(t.condition))) fail("bands", `${l.programme}:${lv.n} runs ${t.id} under ${t.condition}; levels ${lv.n <= 5 ? "1–5" : lv.n <= 10 ? "6–10" : "11–14"} take ${allowed.join(" or ")}`);
    if (lv.n >= 11 && lv.n <= 14 && lv.tasks.some((t) => kind(t.condition) === "base")) fail("bands", `${l.programme}:${lv.n} has a base run in the hazard band`);
    if (lv.n <= 19 && lv.coaching !== true) fail("bands", `${l.programme}:${lv.n} must be coached`);
    if (lv.n >= 15 && lv.n <= 18) {
      if (lv.tasks.length < Math.min(2, distinct.length)) fail("chain", `${l.programme}:${lv.n} is a chain of one`);
      if (interruptible && !lv.interruptions.length) fail("chain", `${l.programme}:${lv.n} has no declared interruption for CMD_INTERRUPT to fire`);
      if (interruptible && !lv.tasks.some((t) => kind(t.condition) === "interrupt")) fail("chain", `${l.programme}:${lv.n} runs no task under a declared interruption`);
    }
    if (lv.n === 19 && lv.tasks.length < Math.min(5, distinct.length)) fail("shift", `${l.programme}:19 has ${lv.tasks.length} tasks; a shift is five`);
  }
  const cap = l.levels[19];
  if (cap.coaching !== false) fail("capstone", `${l.programme}:20 must run with coaching: false`);
  if (cap.band !== "capstone") fail("capstone", `${l.programme}:20 is not marked capstone`);
  if (cap.tasks.length < Math.min(3, distinct.length)) fail("capstone", `${l.programme}:20 has ${cap.tasks.length} tasks; a capstone is at least three`);
  for (const t of cap.tasks) {
    const want = t.app === "trades" ? "base" : "variant";
    if (kind(t.condition) !== want) fail("capstone", `${l.programme}:20 runs ${t.id} under ${t.condition}; a capstone task is an assessment variant (a Trade Skills room its base run)`);
  }
  if (!overrides.programmes?.[l.programme]?.["20"]?.tasks) {
    // The hardest stations that can sit in a capstone at all: a Trade Skills
    // room whose base run the shift (level 19) already used cannot, by the
    // adjacent-level rule, so it gives way to the next hardest.
    const shift = new Set(l.levels[18].tasks.map(taskKey));
    const eligible = (m) => (m.app === "trades" ? ["base"] : ["variant:assessment", "variant:pressure"]).some((c) => !shift.has(taskKey({ app: m.app, id: m.id, condition: c })));
    const ranked = distinct.map((k) => metrics.get(k)).filter(eligible).sort((a, b) => b.difficulty - a.difficulty || b.id.localeCompare(a.id));
    const hardest = new Set(ranked.slice(0, cap.tasks.length).map((m) => `${m.app}:${m.id}`));
    for (const t of cap.tasks) if (!hardest.has(`${t.app}:${t.id}`)) fail("capstone", `${l.programme}:20 includes ${t.id}, which is not among its hardest ${cap.tasks.length}`);
    for (const t of cap.tasks) { const m = metrics.get(`${t.app}:${t.id}`); if (m.difficulty !== difficulty(m)) fail("capstone", "difficulty drifted"); }
  }
}
if (failures === before3) ok("bands hold: 1–5 base and the hour, 6–10 weather and the hour, 11–14 hazard mode and interruptions, 15–18 chains with an interruption, 19 a shift of five, 20 the hardest stations as assessment variants with coaching off");

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
    if (o.tasks && !eq(lv.tasks.map(taskKey), o.tasks.map((r) => taskKey(resolveTaskRef(r, prog))))) fail("overrides", `${pid}:${key} tasks not applied`);
    applied += 1;
  }
}
// The validator itself must refuse what it should.
const bad = overrideProblems({ programmes: {
  "no-such-programme": { 1: { title: "x" } },
  "confined-space": {
    21: { title: "x" }, 2: { tasks: ["no-such-station"] }, 3: { colour: "red" }, 20: { tasks: ["valve-vault@variant:assessment"] },
    4: { tasks: ["valve-vault@weather:hail"] }, 5: { tasks: ["valve-vault@interrupt:not-declared"] }, 6: { tasks: ["valve-vault", "valve-vault@base"] },
  },
  "culinary-kitchen": { 7: { tasks: ["trades:kitchen@time:day"] } },
} }, metrics);
if (bad.length < 9) fail("overrides", `the override validator let bad entries through (${bad.length} of 9 caught: ${bad.join("; ")})`);
if (failures === before4) ok(`overrides validate; ${applied} hand-tuned level${applied === 1 ? "" : "s"} applied; the validator refuses a bad programme, level, task, field, capstone, condition, undeclared interruption, repeated pair and a condition Trade Skills cannot run`);

// ---------------------------------------------------------- 5. ladder.js rules
const before5 = failures;
// Conditions.
for (const c of ["base", "hazard", "time:day", "time:dusk", "weather:rain", "weather:smoke", "interrupt:x-1", "variant:assessment", "variant:pressure"]) if (!parseCondition(c)) fail("conditions", `${c} must parse`);
for (const c of ["", "night", "time:night", "time:dawn", "weather:heat", "weather:clear", "variant:practice", "interrupt:", "hazard:coach", "Base"]) if (parseCondition(c)) fail("conditions", `"${c}" must not parse`);
const outdoor = { app: "smartcity", indoor: null, hazards: 4, interrupts: [{ id: "a" }] };
const indoor = { ...outdoor, indoor: "clinic" };
const room = { app: "trades", indoor: null, hazards: 4, interrupts: [{ id: "a" }] };
if (!conditionValid("weather:rain", outdoor) || conditionValid("weather:rain", indoor)) fail("conditions", "weather is valid outdoors and refused indoors");
if (!conditionValid("time:dusk", indoor) || !conditionValid("interrupt:a", indoor) || conditionValid("interrupt:b", indoor)) fail("conditions", "the hour runs indoors; only a declared interruption is valid");
if (conditionValid("hazard", { ...outdoor, hazards: 0 })) fail("conditions", "hazard mode needs a registered hazard");
if (!conditionValid("base", room) || conditionValid("time:day", room) || conditionValid("variant:assessment", room)) fail("conditions", "a Trade Skills room is base only");
for (const c of ["base", "hazard", "time:day", "weather:fog", "interrupt:x-1", "variant:pressure"]) {
  const qs = new URLSearchParams(conditionParams(c, { seed: 7 })).toString();
  if (conditionFromQuery(`?sim=x&${qs}`) !== c) fail("conditions", `${c} does not round-trip through its query (${qs})`);
}
if (!eq(conditionParams("variant:assessment", { seed: "r1-0" }), [["variant", "assessment"], ["seed", "r1-0"]])) fail("conditions", "a variant carries its seed");
if (conditionFromQuery("?sim=x&weather=hail") !== "base") fail("conditions", "an unknown weather is the base run");
// levelState.
const T = (id, condition = "base", steps = 13) => ({ station: `smartcity:${id}`, app: "smartcity", id, condition, steps });
const fake = {
  programme: "demo",
  levels: Array.from({ length: 20 }, (_, i) => ({
    programme: "demo", n: i + 1, title: `L${i + 1}`, coaching: i < 19, steps: 78, lessons: 78, partial: i === 2, shortfall: i === 2 ? 4 : 0,
    tasks: i === 0 ? [T("a"), T("b")] : i === 1 ? [T("c", "time:day"), T("d", "time:day")] : i === 3 ? [T("a", "time:day"), T("a", "time:dusk")] : [T("e")],
    standards: ["osha-1910-147"], interruptions: [],
  })),
};
const good = (simId, run, level = 1, extra = {}, task = 0, condition = "base") => ({
  simId, stars: 3, hazardHits: 0, seconds: 100, parSeconds: 200, at: "2026-09-01T10:00:00Z", condition,
  interrupts: { answered: 2, wrong: 0, missed: 0 }, ladder: { programme: "demo", level, run, task }, ...extra,
});
const L1 = (run, extra0 = {}, extra1 = {}) => [good("a", run, 1, extra0, 0), good("b", run, 1, extra1, 1)];
const L2 = (run) => [good("c", run, 2, {}, 0, "time:day"), good("d", run, 2, {}, 1, "time:day")];
const L3 = (run) => [good("e", run, 3, {}, 0)];
const states = (recs) => levelState(fake, recs).map((s) => s.state[0]).join("");
const tail = (k) => "L".repeat(20 - k);
const table = [
  ["no records", [], "o" + tail(1)],
  ["level 1 mastered in one run", L1("r1"), "po" + tail(2)],
  ["one task unsafe", L1("r1", {}, { hazardHits: 1 }), "o" + tail(1)],
  ["one star", L1("r1", {}, { stars: 1 }), "o" + tail(1)],
  ["missed interruption", L1("r1", {}, { interrupts: { answered: 1, wrong: 0, missed: 1 } }), "o" + tail(1)],
  ["over 1.5x par", L1("r1", {}, { seconds: 301 }), "o" + tail(1)],
  ["tasks split over two runs", [good("a", "r1", 1, {}, 0), good("b", "r2", 1, {}, 1)], "o" + tail(1)],
  ["stations mastered outside a level", L1("r1").map((r) => ({ ...r, ladder: undefined })), "o" + tail(1)],
  ["a level-1 task tagged for another programme", [good("a", "r1"), { ...good("b", "r1", 1, {}, 1), ladder: { programme: "other", level: 1, run: "r1", task: 1 } }], "o" + tail(1)],
  ["level 2 mastered, level 1 not", L2("r2"), "o" + tail(1)],
  ["level 2 played under the wrong condition", [...L1("r1"), good("c", "r2", 2, {}, 0), good("d", "r2", 2, {}, 1)], "po" + tail(2)],
  ["levels 1 and 2 mastered", [...L1("r1"), ...L2("r2")], "ppo" + tail(3)],
  ["a failed retry after a pass keeps the pass", [...L1("r1"), good("a", "r3", 1, { hazardHits: 2 })], "po" + tail(2)],
  ["the same station twice under two conditions: one attempt is not both tasks",
    [...L1("r1"), ...L2("r2"), ...L3("r3"), good("a", "r4", 4, {}, 0, "time:day")], "pppo" + tail(4)],
  ["the same station twice under two conditions, both played", [...L1("r1"), ...L2("r2"), ...L3("r3"), good("a", "r4", 4, {}, 0, "time:day"), good("a", "r4", 4, {}, 1, "time:dusk")], "ppppo" + tail(5)],
];
for (const [name, recs, want] of table) {
  const got = states(recs).replace(/l/g, "L");
  if (got !== want) fail("levelState", `${name}: ${got}, expected ${want}`);
}
const st = levelState(fake, L1("r1"));
if (st.length !== 20) fail("levelState", "levelState returns twenty rows");
if (st[0].run !== "r1" || !st[0].passedAt) fail("levelState", "a passed level names its run and date");
if (!st[2].partial || st[2].shortfall !== 4) fail("levelState", "the partial flag and shortfall pass through");
if (!eq(st[1].conditions, ["time:day", "time:day"]) || st[1].lessons !== 78) fail("levelState", "a row carries its lessons and each task's condition");
if (!eq(parseLevelRef("electrical-first-period:17"), { programme: "electrical-first-period", level: 17 })) fail("parse", "programme:level parses up to 20");
for (const b of ["x:0", "x:21", "x", ":3", "X Y:2"]) if (parseLevelRef(b)) fail("parse", `"${b}" must not parse`);
// A run: ignores a station played on the side or under another condition, ends after the last task.
let run = startLevelRun(fake, 2, { id: "r9", at: "2026-09-02T00:00:00Z" });
if (nextTask(run)?.id !== "c" || nextTask(run).condition !== "time:day" || nextTask(run).of !== 2) fail("run", "a fresh run stands on its first task and names its condition");
run = recordTask(run, { ...good("zzz", "r9", 2), id: "x0" });
if (run.attempts.length !== 0) fail("run", "an attempt on another station must not be folded into a level");
run = recordTask(run, { ...good("c", "r9", 2, {}, 0, "base"), id: "x0b" });
if (run.attempts.length !== 0) fail("run", "an attempt under another condition must not be folded into a level");
run = recordTask(run, { ...good("c", "r9", 2, {}, 0, "time:day"), id: "x1", score: 900 });
run = recordTask(run, { ...good("d", "r9", 2, {}, 1, "time:day"), id: "x2", score: 800, seconds: 250 });
const res = levelResult(run);
if (nextTask(run) !== null || !res.done || !res.passed || res.score !== 1700 || res.rows.length !== 2 || res.lessons !== 26) fail("run", `the finished run reports done, passed, lessons and the shared score (${JSON.stringify({ done: res.done, passed: res.passed, score: res.score, lessons: res.lessons })})`);
if (res.rows[0].condition !== "time:day") fail("run", "a result row names its task's condition");
const failedRun = recordTask(recordTask(startLevelRun(fake, 1), good("a", "r")), good("b", "r", 1, { hazardHits: 1 }, 1));
const fr = levelResult(failedRun);
if (fr.passed || fr.shortfall?.task !== "b" || !/unsafe/.test(fr.shortfall.reason)) fail("run", "a run with an unsafe task fails and names the task and the reason");
if (!eq(levelTag(run, 1), { programme: "demo", level: 2, run: "r9", task: 1 })) fail("run", "levelTag carries programme, level, run and task");
const mem = new Map();
const store = { getItem: (k) => mem.get(k) ?? null, setItem: (k, v) => mem.set(k, v), removeItem: (k) => mem.delete(k) };
writeLevelRun(run, store);
if (!eq(readLevelRun(store), run)) fail("run", "a level run round-trips through storage");
clearLevelRun(store);
if (readLevelRun(store) !== null) fail("run", "clearLevelRun empties it");
const badge = levelBadge(fake.levels[1], { result: res, programmeName: "Demo", standards: { "osha-1910-147": { body: "OSHA", title: "29 CFR 1910.147" } } });
if (badge["@context"] !== "https://w3id.org/openbadges/v2" || badge.type !== "Assertion") fail("badge", "an Open Badges 2.0 assertion");
if (badge.level?.n !== 2 || badge.level.tasks.length !== 2 || badge.level.tasks[0].condition !== "time:day" || badge.level.lessons !== 78 || !eq(badge.level.standards, ["osha-1910-147"])) fail("badge", "the badge carries the level, its lessons, its tasks with conditions and standards");
if (badge.badge.alignment[0]?.targetFramework !== "OSHA" || badge.evidence.length !== 2) fail("badge", "alignment names the body; evidence names the attempts");
if (!/mastery/i.test(badge.badge.criteria.narrative) || !/time:day/.test(badge.badge.criteria.narrative)) fail("badge", "the criteria state the mastery rule and each task's condition");
if (!/of 20 /.test(badge.badge.description)) fail("badge", "the badge says level N of 20");
const x = levelXAPI(fake.levels[1], res, { assertion: badge });
if (!/passed$/.test(x.verb.id) || x.result.score.raw !== 1700 || !x.result.success) fail("xapi", "a passed level sends verb passed with the shared score");
if (!/failed$/.test(levelXAPI(fake.levels[0], fr).verb.id)) fail("xapi", "a failed level sends verb failed");
if (failures === before5) ok(`conditions (parse, validity, query round-trip), levelState truth table (${table.length} cases), level runs, storage, the level badge and its xAPI statement`);

// --------------------------------------------------- 6. headless level chains
const before6 = failures;
const city = await loadSmartCity();
const trades = await loadTrades();
async function playLevel(programme, n) {
  const ladder = LADDER_BY_PROGRAMME[programme];
  const level = ladder.levels[n - 1];
  let lr = startLevelRun(ladder, n, { id: `headless-${programme}-${n}` });
  const records = [];
  let guard = 0;
  const apps = new Set();
  while (nextTask(lr) && guard++ < 40) {
    const t = nextTask(lr);
    const suite = t.app === "trades" ? trades : city;
    let room = suite.ROOMS.find((r) => r.id === t.id);
    if (!room) { fail("chain", `task ${t.app}:${t.id} not in its suite`); break; }
    // A variant task plays the variant the app would build (same id, same procedure).
    const c = parseCondition(t.condition);
    if (c.kind === "variant") {
      const v = makeVariant(room, { seed: `${lr.id}-${t.index}`, level: c.value });
      room = { ...v, id: room.id };
    }
    const root = new suite.THREE.Group();
    const api = room.build(root);
    const { session, summary } = suite.runEpisode(room, api, { skill: 1, seed: 7 + t.index, trajectory: false, SessionClass: suite.Session });
    if (!summary.finished) { fail("chain", `${t.id} did not finish`); break; }
    const iv = session.interruptSummary();
    const attempt = {
      id: `h-${n}-${t.index}`, at: new Date(Date.UTC(2026, 8, 1, 10, t.index)).toISOString(), app: t.app,
      simId: room.id, simName: room.name ?? room.title, score: session.score, stars: session.stars, errors: session.errors,
      hazardHits: session.hazardHits, seconds: Math.round(session.elapsed), parSeconds: room.parSeconds,
      interrupts: iv ? { answered: iv.answered, wrong: iv.wrong, missed: iv.missed } : null,
      condition: t.condition, ladder: levelTag(lr, t.index),
    };
    apps.add(t.app);
    records.push(attempt);
    lr = recordTask(lr, attempt);
  }
  return { ladder, level, lr, records, apps };
}
for (const [programme, n] of [["electrical-first-period", 1], ["air-quality-monitoring", 20]]) {
  const { ladder, level, lr, records, apps } = await playLevel(programme, n);
  const r = levelResult(lr);
  if (!r.done) { fail("chain", `${programme}:${n} did not reach its results`); continue; }
  if (r.rows.length !== level.tasks.length) fail("chain", `results have ${r.rows.length} rows for ${level.tasks.length} tasks`);
  if (r.lessons !== level.lessons) fail("chain", `results count ${r.lessons} lessons; the level has ${level.lessons}`);
  if (!r.passed) fail("chain", `a full-skill trainee did not pass ${programme}:${n}: ${r.shortfall?.task} — ${r.shortfall?.reason}`);
  // The truth table decides what opens: seed the levels below as passed.
  const below = [];
  for (let k = 1; k < n; k++) {
    const lv = ladder.levels[k - 1];
    lv.tasks.forEach((t, i) => below.push({ simId: t.id, stars: 3, hazardHits: 0, seconds: 1, parSeconds: 999, at: "2026-08-01T00:00:00Z", condition: t.condition, ladder: { programme, level: k, run: `seed-${k}`, task: i } }));
  }
  const after = levelState(ladder, [...below, ...records]);
  if (after[n - 1].state !== "passed" || (n < 20 && after[n].state !== "open")) fail("chain", `after ${programme}:${n}: ${after[n - 1].state}${n < 20 ? `, next ${after[n].state}` : ""}`);
  const { validateAssertion } = await import("../WebXR/verify/verify.js");
  const hosted = levelBadge(level, { result: r, programmeName: ladder.name, standards: LADDER_STANDARDS, homePage: "https://hall.example", learnerId: "al-1815", learnerName: "Ada Lovelace" });
  const v = validateAssertion(hosted, { now: Date.parse("2026-09-22T00:00:00.000Z") });
  if (!v.ok) fail("chain", `the level badge fails the verifier: ${v.checks.filter((c) => !c.ok).map((c) => `${c.name} (${c.note})`).join("; ")}`);
  if (hosted.level.tasks.length !== level.tasks.length || hosted.badge.alignment.length !== level.standards.length) fail("chain", "the level badge carries every task and standard");
  if (failures === before6) ok(`headless ${programme}:${n} (${level.title}): ${level.tasks.length} tasks across ${[...apps].join(" and ")} under ${[...new Set(level.tasks.map((t) => t.condition))].join(", ")}, ${r.lessons} lessons, shared score ${r.score}, passed; the badge verifies`);
}

// ------------------------------------------------------------ 7. content gap
const before7 = failures;
const md = readFileSync(join(ROOT, "docs/ladders.md"), "utf8");
for (const l of LADDERS) {
  const row = md.split("\n").find((line) => line.startsWith(`| \`${l.programme}\` |`));
  if (!row) { fail("gap", `docs/ladders.md has no gap row for ${l.programme}`); continue; }
  const cells = row.split("|").map((c) => c.trim());
  if (cells[3] !== `${l.gap.full} / 20`) fail("gap", `${l.programme}: gap row says ${cells[3]}, the ladder has ${l.gap.full} / 20`);
  if (l.gap.full !== l.levels.filter((lv) => !lv.partial).length) fail("gap", `${l.programme}: gap.full disagrees with the levels`);
  const contentPartial = l.gap.partial - l.gap.overridePartial.length;
  if ((contentPartial === 0) !== (l.gap.stationsNeeded === 0)) fail("gap", `${l.programme}: a ladder whose generated levels all reach 75 needs no stations, one with partial generated levels needs some`);
}
if (failures === before7) ok(`the content gap table: ${LADDERS.reduce((a, l) => a + l.gap.full, 0)} of ${allLevels.length} levels at 75 lessons; ${LADDERS.reduce((a, l) => a + (l.gap.stationsNeeded ?? 0), 0)} more 13-step stations fill the rest`);

// ---------------------------------------------------------------- 8. bundles
const before8 = failures;
const bundler = readFileSync(join(ROOT, "tools/bundle_webxr.py"), "utf8");
const block = (app) => bundler.slice(bundler.indexOf(`"${app}": {`), bundler.indexOf('"entry"', bundler.indexOf(`"${app}": {`)));
for (const app of ["smartcity", "trades"]) if (!block(app).includes('SHARED / "ladder.js"')) fail("bundle", `${app} does not bundle shared/ladder.js`);
if (!block("smartcity").includes('"smartcity/js/ladders.js"')) fail("bundle", "smartcity does not bundle ladders.js");
if (!block("smartcity").includes('SHARED / "variants.js"')) fail("bundle", "smartcity does not bundle shared/variants.js, which builds a variant task");
const appSrc = readFileSync(join(WEBXR, "smartcity/js/app.js"), "utf8");
for (const [what, re] of [
  ["?variant= through makeVariant", /makeVariant\(room, \{ seed: urlQuery\.get\("seed"\)/],
  ["?hazard=assess pinning hazard mode", /urlQuery\.get\("hazard"\) === "assess"/],
  ["?interrupt= arming a declared interruption", /state\.urlInterrupt = urlQuery\.get\("interrupt"\)/],
  ["the condition on the record", /condition: state\.condition \?\? "base"/],
  ["a level task setting its condition's query", /setConditionQuery\(t\.condition/],
  ["?programme=&level= opening a rung", /get\("level"\)\);\n\s+if \(programmeLink/],
]) if (!re.test(appSrc)) fail("app", `app.js does not read ${what}`);
if (!/new URLSearchParams\(location\.search\)\.get\("time"\)/.test(stageSrc)) fail("app", "stage.js no longer reads ?time=");
if (!/new URLSearchParams\(location\.search\)\.get\("weather"\)/.test(weatherSrc)) fail("app", "weather.js no longer reads ?weather=");
if (failures === before8) ok("SmartCiti.X bundles ladder.js, ladders.js and variants.js; Trade Skills bundles ladder.js; every condition's query parameter is read");

console.log(failures ? `\n${failures} ladder check(s) failed.` : `\nAll ladder checks pass: ${allLevels.length} levels, ${partial.length} partial.`);
process.exit(failures ? 1 : 0);
