#!/usr/bin/env node
// AGENTGYM eval harness: success rate and steps over N stations x seeds for
// each baseline (random, scripted expert, retrieval heuristic), through the
// agent task API in WebXR/shared/ag-gym.js. Writes docs/perf/agent-baselines.json.
//
//   node tools/ag_eval.mjs                 # all smartcity stations in tools/lib/headless.mjs, seeds 1..5
//   node tools/ag_eval.mjs --seeds 3 --stations robot-cell,trench-box --out -   # print only
//   node tools/ag_eval.mjs --legacy        # also the pre-existing robot.js RobotAgent (skill 1 / 0) for comparison
//
// Deterministic: the same arguments give the same JSON byte for byte (no
// wall-clock fields). No network. No language model.
import { writeFileSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { ROOT, loadSmartCity } from "./lib/headless.mjs";
import { agEnv, agRun, AG_BASELINES, AG_SCHEMA, AG_HINT_COST, AG_DT, AG_MAX_STEPS } from "../WebXR/shared/ag-gym.js";

const arg = (name, dflt) => { const i = process.argv.indexOf(`--${name}`); return i > 0 ? process.argv[i + 1] : dflt; };
const nSeeds = +arg("seeds", 5);
const only = arg("stations", null)?.split(",") ?? null;
const out = arg("out", join(ROOT, "docs/perf/agent-baselines.json"));
const legacy = process.argv.includes("--legacy");
const onlyBaselines = arg("baselines", null)?.split(",") ?? null;

export async function agEvaluate({ seeds = 5, stations = null, withLegacy = false, baselines = null, options = {} } = {}) {
  const suite = await loadSmartCity();
  suite.Sfx.muted = true;
  const rooms = suite.ROOMS.filter((r) => !stations || stations.includes(r.id));
  const seedList = Array.from({ length: seeds }, (_, i) => i + 1);
  const per = {}, agg = {};
  const add = (name, s) => {
    const a = (agg[name] ??= { episodes: 0, passed: 0, finished: 0, steps: 0, stepsPassed: 0, hazardHits: 0, errors: 0, hints: 0, stationScore: 0 });
    a.episodes += 1; a.passed += s.passed ? 1 : 0; a.finished += s.finished ? 1 : 0; a.steps += s.steps; a.stepsPassed += s.passed ? s.steps : 0;
    a.hazardHits += s.hazardHits; a.errors += s.errors; a.hints += s.hints ?? 0; a.stationScore += s.stationScore;
  };
  for (const room of rooms) {
    const bind = { room, api: room.build(new suite.THREE.Group()), rebuild: () => room.build(new suite.THREE.Group()), SessionClass: suite.Session };
    const env = agEnv(bind, { seed: 1 });
    per[room.id] = {};
    for (const name of Object.keys(AG_BASELINES).filter((n) => !baselines || baselines.includes(n))) {
      const rs = seedList.map((seed) => agRun(env, name, { seed, keepSteps: false, policy: AG_BASELINES[name](env, { seed, ...options }) }).summary);
      rs.forEach((s) => add(name, s));
      per[room.id][name] = { passed: rs.filter((s) => s.passed).length, of: rs.length, meanSteps: +(rs.reduce((n, s) => n + s.steps, 0) / rs.length).toFixed(1), hints: rs.reduce((n, s) => n + s.hints, 0), hazardHits: rs.reduce((n, s) => n + s.hazardHits, 0) };
    }
    if (withLegacy) for (const skill of [1, 0]) {
      const name = `legacy-robotagent-skill${skill}`;
      const rs = seedList.map((seed) => {
        const api = room.build(new suite.THREE.Group());
        const { summary } = suite.runEpisode(room, api, { skill, seed, trajectory: false, SessionClass: suite.Session, maxTicks: 8000 });
        return { passed: summary.passed, finished: summary.finished, steps: summary.decisions, hazardHits: summary.hazardHits, errors: summary.errors, hints: 0, stationScore: summary.score };
      });
      rs.forEach((s) => add(name, s));
      per[room.id][name] = { passed: rs.filter((s) => s.passed).length, of: rs.length, meanSteps: +(rs.reduce((n, s) => n + s.steps, 0) / rs.length).toFixed(1) };
    }
  }
  const summary = {};
  for (const [name, a] of Object.entries(agg)) summary[name] = {
    episodes: a.episodes, successRate: +(a.passed / a.episodes).toFixed(3), finishRate: +(a.finished / a.episodes).toFixed(3),
    meanSteps: +(a.steps / a.episodes).toFixed(1), meanStepsWhenPassed: a.passed ? +(a.stepsPassed / a.passed).toFixed(1) : null,
    hazardHitsPerEpisode: +(a.hazardHits / a.episodes).toFixed(2), errorsPerEpisode: +(a.errors / a.episodes).toFixed(2),
    hintsPerEpisode: +(a.hints / a.episodes).toFixed(2), meanStationScore: Math.round(a.stationScore / a.episodes),
  };
  return {
    schema: `${AG_SCHEMA}/baselines`, generator: "tools/ag_eval.mjs",
    config: { stations: rooms.length, seeds: seedList, dt: AG_DT, maxSteps: AG_MAX_STEPS, hintCost: AG_HINT_COST, pass: "finished && stars >= 2 && hazardHits === 0 (shared/robot.js runEpisode's rule)" },
    baselines: {
      random: "uniform random over select/confirm/press/release/wait/inspect and the visible ids",
      expert: "scripted expert reading the station's step list (privileged: sees target ids) — an upper bound, not a learner",
      retrieval: "word-overlap retrieval over the step's title, cue and sourced why text; inspects before touching; hint when nothing matches. No language model.",
      ...(withLegacy ? { "legacy-robotagent-skill1": "pre-existing shared/robot.js RobotAgent at skill 1, via runEpisode (direct Session access, not the task API)", "legacy-robotagent-skill0": "the same at skill 0" } : {}),
    },
    summary, perStation: per,
  };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const t0 = Date.now();
  const res = await agEvaluate({ seeds: nSeeds, stations: only, withLegacy: legacy, baselines: onlyBaselines, options: arg("margin", null) != null ? { margin: +arg("margin") } : {} });
  const json = JSON.stringify(res, null, 1) + "\n";
  if (out === "-") process.stdout.write(json);
  else { mkdirSync(dirname(out), { recursive: true }); writeFileSync(out, json); }
  for (const [k, v] of Object.entries(res.summary)) console.log(`${k.padEnd(26)} success ${(v.successRate * 100).toFixed(1).padStart(5)}%  steps ${String(v.meanSteps).padStart(6)}  hazards/ep ${v.hazardHitsPerEpisode}  hints/ep ${v.hintsPerEpisode}  (${v.episodes} episodes)`);
  console.log(`ag_eval: ${res.config.stations} stations x ${res.config.seeds.length} seeds in ${Date.now() - t0} ms${out === "-" ? "" : ` -> ${out.replace(ROOT + "/", "")}`}`);
}
