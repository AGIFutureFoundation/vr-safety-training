#!/usr/bin/env node
/**
 * ROBOSCENARIOS checker (docs/consoles/ROBOSCENARIOS.md): the construction drilling robot and the port automation
 * lane as gym scenarios with a robot-side result.
 *   1. determinism: the same seed gives a byte-identical episode; different seeds differ
 *   2. the scripted expert beats the random floor on 60 held-out seeds, and passes every one clean
 *   3. invariants: the expert never drills while a person is inside the barricade and never drives into a busy
 *      crossing or a pinned container's keep-out (over every held-out step); a direct probe shows the robot holding
 *   4. the expert does hold for people (the schedule meets it), so the clone has holds to learn from
 *   5. policy results present: docs/evals/colearn.json carries both (BC > random), labelled synthetic
 *   6. teleoperation: RT_TASKS covers both; the skill-1 stand-in passes through the pose path
 *   7. sites: the port yard runs the lane scenario, the Richland deck runs the drilling scenario; AGENTGYM supplement
 *      baselines the construction robot station
 *   9. the hard variants (rb-construction-drilling#hard, rb-port-gantry#hard): one row each — seeded, expert clean on 60 held-out
 *      seeds with the invariant held, random below, the colearn.json row with the gap stated, a teleop task (ROBOTRAIN-5)
 *   8. hygiene: Kids rule on the new text, no model identifier in the files this console touched
 *
 *     node tools/check_roboscenarios.mjs
 */
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { RB_SCENARIOS, RB_SITES, RB_RULES } from "../WebXR/shared/rb-robotics-data.js";
import { rbEnv, rbRollout, rbPolicy } from "../WebXR/shared/rb-env.js";
import { colRandomPolicy, colHeldOut, COL_SCENARIOS, colSyntheticDemos } from "../WebXR/shared/col-learn.js";
import { RT_TASKS, RT_TASK_IDS, rtRecordTakes } from "../WebXR/shared/rt-teleop.js";
import { rt7ReactivePolicy, RT7_REACTIVE_FIELDS } from "../WebXR/shared/rt7-learn.js";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
let passes = 0, failures = 0;
const t0 = Date.now();
function check(name, fn) {
  try { const r = fn(); passes += 1; console.log(`  ✓ ${name}${r ? ` — ${r}` : ""}`); }
  catch (err) { failures += 1; console.log(`  ✗ ${name}\n      ${err.message ?? err}`); }
}
const ok = (v, what) => { if (!v) throw new Error(what); };

const NEW = ["rb-construction-drilling", "rb-port-gantry"];
const INVARIANT = { "rb-construction-drilling": "person-in-barricade", "rb-port-gantry": "crossing-stop-zone" };
const seeds = colHeldOut(60);

console.log("ROBOSCENARIOS — construction drilling robot and port automation lane\n");

check("both scenarios are in RB_SCENARIOS as games with their rules defined and their stations named", () => {
  for (const id of NEW) {
    const sc = RB_SCENARIOS.find((s) => s.id === id);
    ok(sc && sc.kind === "game" && sc.station && sc.maxSteps > 0, `${id} missing or not a game`);
    for (const r of sc.safePractice) ok(RB_RULES[r], `${id}: rule ${r} undefined`);
    ok(sc.safePractice.includes(INVARIANT[id]), `${id}: invariant rule ${INVARIANT[id]} not declared`);
  }
  return `${NEW.length} scenarios, ${NEW.map((id) => RB_SCENARIOS.find((s) => s.id === id).safePractice.length).join("+")} rules`;
});

// 1. determinism
check("deterministic by seed: byte-identical episodes for the same seed, different episodes across six seeds", () => {
  for (const id of NEW) {
    const a = JSON.stringify(rbRollout(rbEnv(id, { seed: 5 }), { skill: 0.65, seed: 5 }));
    const b = JSON.stringify(rbRollout(rbEnv(id, { seed: 5 }), { skill: 0.65, seed: 5 }));
    ok(a === b, `${id}: seed 5 differs run to run`);
    const seen = new Set([1, 2, 3, 4, 5, 6].map((seed) => JSON.stringify(rbRollout(rbEnv(id, { seed }), { skill: 1, seed }).steps.map((s) => s.observation))));
    ok(seen.size > 1, `${id}: six seeds give one episode`);
  }
});

// 2 + 3. the expert vs random on the held-out seeds; invariants over every step
const expertRuns = {};
check("the scripted expert passes every one of 60 held-out seeds clean; the random floor passes none", () => {
  const out = [];
  for (const id of NEW) {
    let exp = 0, rnd = 0, steps = 0;
    expertRuns[id] = seeds.map((seed) => rbRollout(rbEnv(id, { seed }), { skill: 1, seed }));
    for (const r of expertRuns[id]) { if (r.summary.passed && r.summary.violationCount === 0) exp += 1; steps += r.summary.steps; }
    for (const seed of seeds) if (rbRollout(rbEnv(id, { seed }), { seed, policy: colRandomPolicy(id, seed) }).summary.passed) rnd += 1;
    ok(exp === seeds.length, `${id}: expert ${exp}/${seeds.length}`);
    ok(rnd < exp, `${id}: random ${rnd} not below expert ${exp}`);
    out.push(`${id.replace("rb-", "")} expert ${exp}/${seeds.length} (${(steps / seeds.length).toFixed(1)} steps), random ${rnd}/${seeds.length}`);
  }
  return out.join("; ");
});
check("invariants: no expert step drills with a person inside the barricade, drives into a busy crossing or into the pinned keep-out", () => {
  const counts = {};
  for (const id of NEW) for (const r of expertRuns[id]) for (const s of r.steps) {
    for (const v of s.info.violations) ok(!["person-in-barricade", "crossing-stop-zone", "pinned-keep-out", "bit-change-live", "drill-unscanned", "no-barricade", "dust-off"].includes(v), `${id}: expert broke ${v}`);
    if (id === "rb-construction-drilling" && s.action.type === "drill") ok(!s.observation.personInside, `${id}: drilled with a person inside`);
    if (id === "rb-port-gantry" && s.action.type === "move") {
      const o = s.observation, d = { N: [0, -1], S: [0, 1], E: [1, 0], W: [-1, 0] }[s.action.dir], nx = o.at[0] + d[0], ny = o.at[1] + d[1];
      ok(!(o.personOnCrossing && nx === o.crossingColumn && o.at[0] !== o.crossingColumn), `${id}: drove into the busy crossing`);
      ok(!(ny === o.lanes - 1 && nx >= o.pinned[0] && nx <= o.pinned[1]), `${id}: drove into the keep-out`);
    }
    counts[id] = (counts[id] ?? 0) + 1;
  }
  return `${Object.values(counts).reduce((a, b) => a + b, 0)} expert steps over ${seeds.length} seeds × ${NEW.length} scenarios`;
});
check("probe: with a person inside the barricade a drill command is held (no hole, person-in-barricade); a person on the crossing holds a move into it", () => {
  let drilled = null;
  for (let seed = 1; seed < 40 && !drilled; seed++) {
    const env = rbEnv("rb-construction-drilling", { seed });
    for (const t of ["scan", "barricade", "dust-on"]) env.step({ type: t });
    for (let i = 0; i < 20; i++) { const o = env.observe(); if (o.personInside) { const r = env.step({ type: "drill" }); ok(r.observation.drilled === o.drilled && r.info.violations.includes("person-in-barricade") && r.info.feedback === "robot-held-person-inside", "drill not held"); drilled = seed; break; } env.step({ type: "hold" }); }
  }
  ok(drilled, "no seed put a person inside within 20 ticks");
  let held = null;
  for (let seed = 1; seed < 40 && !held; seed++) {
    const env = rbEnv("rb-port-gantry", { seed }); let o = env.observe();
    for (let i = 0; i < 30; i++) {
      if (o.at[0] === o.crossingColumn - 1) { if (o.personOnCrossing) { const r = env.step({ type: "move", dir: "E" }); ok(r.observation.at[0] === o.at[0] && r.info.violations.includes("crossing-stop-zone") && r.info.feedback === "held-at-crossing", "crossing move not held"); held = seed; break; } o = env.step({ type: "hold" }).observation; }
      else o = env.step({ type: "move", dir: "E" }).observation;
    }
  }
  ok(held, "no seed had a person on the crossing at the stop zone within 30 ticks");
  const e2 = rbEnv("rb-port-gantry", { seed: held }); let o2 = e2.observe();
  while (o2.at[1] === 0) o2 = e2.step({ type: "move", dir: "S" }).observation;
  let koHeld = false;
  for (let i = 0; i < 12 && !koHeld; i++) { const r = e2.step({ type: "move", dir: "E" }); koHeld = r.info.violations.includes("pinned-keep-out"); if (r.info.violations.includes("crossing-stop-zone")) e2.step({ type: "hold" }); }
  ok(koHeld, "driving the stack lane east never met the keep-out");
  return `drill held (seed ${drilled}); crossing held (seed ${held}); keep-out held`;
});

// 4. the expert holds for people
check("the expert holds for people: a hold with a person inside the barricade, and a hold in the stop zone with a person on the crossing, both occur on the held-out seeds", () => {
  const dh = expertRuns["rb-construction-drilling"].flatMap((r) => r.steps).filter((s) => s.action.type === "hold" && s.observation.personInside).length;
  const ph = expertRuns["rb-port-gantry"].flatMap((r) => r.steps).filter((s) => s.action.type === "hold" && s.observation.personOnCrossing && Math.abs(s.observation.at[0] - s.observation.crossingColumn) <= s.observation.stopZone).length;
  ok(dh > 0 && ph > 0, `drill holds ${dh}, stop-zone holds ${ph}`);
  return `${dh} drill holds, ${ph} stop-zone holds`;
});

// 5. policy results present (COLEARN's own eval file)
check("policy results present: docs/evals/colearn.json carries both scenarios with BC above random on 60 held-out seeds, from synthetic demonstrations", () => {
  const ev = JSON.parse(readFileSync(join(ROOT, "docs/evals/colearn.json"), "utf8"));
  const out = [];
  for (const id of NEW) {
    ok(COL_SCENARIOS.includes(id), `${id} not in COL_SCENARIOS`);
    const p = ev.policies.find((x) => x.scenario === id);
    ok(p, `${id} not in colearn.json (node tools/col_eval.mjs regenerates it)`);
    ok(p.bcFiltered.n === 60 && p.bcFiltered.success > p.random.success && p.expert.success >= p.bcFiltered.success - 0.02, `${id}: BC ${p.bcFiltered.success}, random ${p.random.success}, expert ${p.expert.success}`);
    out.push(`${id.replace("rb-", "")} random ${p.random.success} → BC ${p.bcFiltered.success} (expert ${p.expert.success}, ${p.demosKept}/${p.demosOffered} demos)`);
  }
  ok(/synthetic/.test(ev.data), "the eval file does not say its demonstrations are synthetic");
  const demos = colSyntheticDemos("rb-port-gantry", { n: 3, seed: 2 });
  ok(demos.every((e) => e.source === "synthetic" && /synthetic/.test(e.provenance.policy)), "synthetic demonstrations not labelled");
  return out.join("; ");
});

// 6. teleoperation tasks
check("teleoperation: RT_TASKS covers both; the skill-1 stand-in passes each through the pose path; recorded takes are labelled synthetic", () => {
  const out = [];
  for (const id of NEW) {
    ok(RT_TASK_IDS.includes(id) && RT_TASKS[id].poseToAction && RT_TASKS[id].human, `${id} not an RT task`);
    const env = rbEnv(id, { seed: 5 }), human = RT_TASKS[id].human(env, { seed: 5, skill: 1 });
    const r = rbRollout(env, { seed: 5, policy: (o) => RT_TASKS[id].poseToAction(human(o), o) });
    ok(r.summary.passed && r.summary.violationCount === 0, `${id}: pose path ${JSON.stringify(r.summary)}`);
    const takes = rtRecordTakes({ n: 3, scenario: id });
    ok(takes.every((e) => e.source === "synthetic" && e.consent === null && /stand-in/.test(e.provenance?.policy ?? "")), `${id}: takes not labelled synthetic`);
    out.push(`${id.replace("rb-", "")} ${r.summary.steps} steps`);
  }
  return out.join("; ");
});

// 7. sites and the AGENTGYM supplement
check("sites: the West Oakland port yard runs the lane scenario and the Richland deck runs the drilling scenario; the construction robot station is baselined in the AGENTGYM supplement", () => {
  const port = RB_SITES.find((s) => s.id === "rb-site-west-oakland-port-automation"), deck = RB_SITES.find((s) => s.id === "rb-site-richland-drilling-robot");
  ok(port?.scenario === "rb-port-gantry" && port.parish === "oak-west-oakland", "port yard scenario");
  ok(deck?.scenario === "rb-construction-drilling" && deck.parish === "la-meta-richland" && deck.station === "rp-construction-drilling-robot-setup", "Richland deck");
  const sup = JSON.parse(readFileSync(join(ROOT, "docs/perf/agent-baselines-robotics.json"), "utf8"));
  const row = sup.perStation["rp-construction-drilling-robot-setup"], portRow = sup.perStation[port.station];
  ok(row && row.expert.passed === row.expert.of && portRow, "construction or port station not baselined");
  return `supplement ${sup.config.stations} stations × ${sup.config.seeds.length} seeds; construction robot station expert ${row.expert.passed}/${row.expert.of}, retrieval-ask ${row["retrieval-ask"].passed}/${row["retrieval-ask"].of}`;
});

// 9. the hard variants (ROBOTRAIN-4 built them, ROBOTRAIN-5 pins them): one row each — seeded, the expert clean on all 60 held-out
//    seeds with the invariants held on every step, the random floor below, colearn.json's measured row with the gap stated, and a teleop task
for (const id of NEW.map((b) => `${b}#hard`)) {
  check(`hard variant ${id}: seeded; expert 60/60 clean with the invariant held on every step; random below; colearn.json row with the gap stated; a teleop task`, () => {
    const base = id.split("#")[0];
    const a = JSON.stringify(rbRollout(rbEnv(id, { seed: 5 }), { skill: 0.65, seed: 5 }));
    ok(a === JSON.stringify(rbRollout(rbEnv(id, { seed: 5 }), { skill: 0.65, seed: 5 })), `${id}: seed 5 differs run to run`);
    ok(new Set([1, 2, 3, 4, 5, 6].map((seed) => JSON.stringify(rbEnv(id, { seed }).reset()))).size > 1, `${id}: six seeds give one start`);
    let exp = 0, rnd = 0, steps = 0;
    for (const seed of seeds) {
      const r = rbRollout(rbEnv(id, { seed }), { skill: 1, seed });
      if (r.summary.passed && r.summary.violationCount === 0) exp += 1;
      for (const st of r.steps) {
        steps += 1;
        ok(!st.info.violations.includes(INVARIANT[base]), `${id}: expert broke ${INVARIANT[base]} (seed ${seed})`);
        if (base === "rb-construction-drilling" && st.action.type === "drill") ok(!st.observation.personInside, `${id}: drilled with a person inside`);
        if (base === "rb-port-gantry" && st.action.type === "move") { const o = st.observation, d = { N: [0, -1], S: [0, 1], E: [1, 0], W: [-1, 0] }[st.action.dir]; ok(!(o.personOnCrossing && o.at[0] + d[0] === o.crossingColumn && o.at[0] !== o.crossingColumn), `${id}: drove into the busy crossing`); }
      }
      if (rbRollout(rbEnv(id, { seed }), { seed, policy: colRandomPolicy(id, seed) }).summary.passed) rnd += 1;
    }
    ok(exp === seeds.length && rnd < exp, `${id}: expert ${exp}/${seeds.length}, random ${rnd}`);
    const ev = JSON.parse(readFileSync(join(ROOT, "docs/evals/colearn.json"), "utf8"));
    const v = (ev.variants ?? []).find((x) => x.id === id);
    ok(v && v.bcFiltered.n === 60 && v.random.n === 60 && v.expert.n === 60, `${id}: no 60-seed row in colearn.json variants`);
    ok(v.bcFiltered.success > v.random.success && Math.abs(v.gapToExpert - (v.expert.success - v.bcFiltered.success)) < 0.002, `${id}: clone ${v.bcFiltered.success}, random ${v.random.success}, gap ${v.gapToExpert}`);
    ok(RT_TASK_IDS.includes(id) && RT_TASKS[id].poseToAction === RT_TASKS[base].poseToAction, `${id}: not a teleop task on its base controls`);
    // The skill-1 stand-in through the pose path on seeds 1–20: its hand lags, so on the hard port lane it can reach the stop zone as a
    // pedestrian steps on; the env then refuses the move and holds the gantry (the only rule it may record is the crossing hold).
    // The pass rate is reported as measured (base port lane 13/20, hard 8/20 when this row was written); at least one pass is required.
    let sp = 0; const rules = new Set();
    for (let seed = 1; seed <= 20; seed++) {
      const env = rbEnv(id, { seed }), human = RT_TASKS[id].human(env, { seed, skill: 1 });
      const pr = rbRollout(env, { seed, policy: (o) => RT_TASKS[id].poseToAction(human(o), o) });
      if (pr.summary.passed) sp += 1;
      for (const r of pr.summary.violationRules ?? []) rules.add(r);
    }
    ok(sp >= 1 && [...rules].every((r) => r === "crossing-stop-zone"), `${id}: the stand-in passed ${sp}/20 through the pose path; rules ${[...rules].join(",")}`);
    return `expert ${exp}/${seeds.length} clean over ${steps} steps, random ${rnd}/${seeds.length}; colearn.json clone ${v.bcFiltered.success} (clean ${v.bcFiltered.clean}) vs expert ${v.expert.success}, gap ${v.gapToExpert}; stand-in through the pose path ${sp}/20${rules.size ? ` (held by the env: ${[...rules].join(", ")})` : ""}`;
  });
}

// 10. ROBOTRAIN-6: every hard variant has an AGENTGYM baseline in the supplement (tools/ag_eval.mjs --seeds 3 --scenarios …), on the
//     station rows' seeds; random and the scripted expert re-measured live here; the word-overlap agents listed as not applicable.
check("hard variants with an AGENTGYM baseline in the robotics supplement (random, the reactive agent and the scripted expert, seeds 1–3, re-measured live; retrieval agents not applicable)", () => {
  const sup = JSON.parse(readFileSync(join(ROOT, "docs/perf/agent-baselines-robotics.json"), "utf8"));
  const ids = RB_SCENARIOS.flatMap((s) => Object.keys(s.variants ?? {}).map((v) => `${s.id}#${v}`));
  ok(ids.length === 3 && sup.scenarioConfig && JSON.stringify(sup.scenarioConfig.seeds) === JSON.stringify(sup.config.seeds), "supplement scenario config missing or on other seeds");
  const out = [];
  for (const id of ids) {
    const row = sup.perScenario?.[id];
    ok(row?.random && row?.expert && row?.reactive && row.retrieval === null && row["retrieval-ask"] === null, `${id}: no baseline row`);
    const live = (mk) => sup.scenarioConfig.seeds.filter((seed) => { const env = rbEnv(id, { seed }); return rbRollout(env, { seed, policy: mk(env, seed) }).summary.passed; }).length;
    const lr = live((env, seed) => colRandomPolicy(id, seed)), le = live((env, seed) => rbPolicy(env, { skill: 1, seed })), lx = live(() => rt7ReactivePolicy(id));
    ok(lr === row.random.passed && le === row.expert.passed && lx === row.reactive.passed && row.expert.of === sup.scenarioConfig.seeds.length, `${id}: file random ${row.random.passed} / reactive ${row.reactive.passed} / expert ${row.expert.passed}, live ${lr} / ${lx} / ${le}`);
    out.push(`${id} random ${row.random.passed}/${row.random.of}, reactive ${row.reactive.passed}/${row.reactive.of}, expert ${row.expert.passed}/${row.expert.of}`);
  }
  // ROBOTRAIN-7: the reactive agent reads only its declared fields (the observation is cut down before any rule runs) and has no planner.
  const rsrc = readFileSync(join(ROOT, "WebXR/shared/rt7-learn.js"), "utf8").split("// ================================================================ a non-privileged reactive agent")[1].split("// ================================================================ robot-run ratings")[0];
  ok(Object.keys(RT7_REACTIVE_FIELDS).length === 3 && /const o = see\(o0\)/.test(rsrc) && !/expert|rbPolicy|queue|prev\.set|colPathMove|colDetour/.test(rsrc), "the reactive agent must read only the projected observation and carry no search or expert call");
  return `${ids.length} of ${ids.length} hard variants baselined: ${out.join("; ")}; the reactive agent reads only its declared fields, with no planner; retrieval and retrieval-ask n/a (no step text in a gym observation)`;
});

// 8. hygiene
check("Kids rule and hygiene: calm text in the new scenarios and rules; no model identifier in the files this console touched", () => {
  const FEAR = /\b(danger\w*|deadly|death|die[sd]?|kill\w*|crush\w*|injur\w*|hurt\w*|maim\w*|scar(y|e[sd]?)|fear\w*|terrif\w*|amputat\w*|blood\w*)\b/i;
  const texts = NEW.flatMap((id) => { const sc = RB_SCENARIOS.find((s) => s.id === id); return [sc.name, sc.blurb, ...sc.safePractice.map((r) => RB_RULES[r].text)]; });
  const bad = texts.filter((t) => FEAR.test(t)); ok(!bad.length, `fear framing: ${bad.join(" | ")}`);
  // Built from pieces so this file's own source does not carry the names it looks for.
  const MODEL = new RegExp("\\b(" + ["gp" + "t-?\\d", "cla" + "ude-\\d", "cla" + "ude [0-9]", "op" + "us", "son" + "net", "hai" + "ku", "gem" + "ini", "lla" + "ma", "mis" + "tral"].join("|") + ")\\b", "i");
  for (const f of ["WebXR/shared/rb-env.js", "WebXR/shared/rb-robotics-data.js", "WebXR/shared/col-learn.js", "WebXR/shared/rt-teleop.js", "tools/check_roboscenarios.mjs", "docs/consoles/ROBOSCENARIOS.md"]) {
    let src = ""; try { src = readFileSync(join(ROOT, f), "utf8"); } catch (_) { continue; }
    ok(!MODEL.test(src), `${f}: model identifier`);
  }
  return `${texts.length} strings`;
});

console.log(`\ncheck_roboscenarios: ${passes} passed, ${failures} failed (${Date.now() - t0} ms)`);
process.exit(failures ? 1 : 0);
