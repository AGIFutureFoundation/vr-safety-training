#!/usr/bin/env node
/**
 * ROBO-ARENA checker (docs/consoles/ROBO-ARENA.md): the robot arena, the small language-conditioned model, the trainable
 * robotics sets and the read-only panel.
 *   1. contract: raModels / raScenarios / raRun / raLeaderboard return the contract's shapes; raRun is deterministic for
 *      its seeds; every step is governor-checked; physical is 0; a gym-only family on a station is "not applicable"
 *   2. declared first: docs/evals/arena-declared.json matches the code's protocol, and (with git) it was committed before
 *      docs/evals/arena.json was first committed
 *   3. no seed reuse: every training seed (demonstrations, DAgger rollouts, dataset splits) is disjoint from 7121–7180
 *   4. arena.json: 8 families, 12 scenarios; every applicable row checked on every step, 0 physical, audit chains intact;
 *      the leaderboard and the small-model comparison recompute from the rows; Wilson and Newcombe intervals agree
 *   5. arena.json current: a live re-run of a sample of rows (random, reactive, bc, dagger-r1, expert; dev-cost only)
 *      equals the file's rows
 *   6. the small model is small and named for what it is: it trains here, its weight count is the file's, and every
 *      mention of "large language model" in the arena's files is a negation; no network, no key, no alias, prefixed names
 *   7. the dataset: tools/ra_dataset.mjs's build equals exports/robotics/arena/ byte for byte; leakage re-measured from
 *      the full set's lines is 0; every line synthetic with consent null and the schema's fields; the card carries every
 *      DATAWORKS datasheet heading and the five best practices; a human episode without a receipt is refused
 *   8. the panel: the robotics programme page carries the arena section with every leaderboard row's figures from
 *      arena.json, no script inside it, and the hero link
 *
 *     node tools/check_arena.mjs
 */
import { readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { execFileSync } from "node:child_process";
import { RA_HELD_OUT, RA_STATION_SEEDS, RA_HELD_OUT_R7, RA_STATION_SEEDS_R7, RA_MODELS_R6, RA_DEMOS, RA_STATION_DEMOS, RA_DAGGER, raModels, raScenarios, raRun, raLeaderboard, raWilson } from "../WebXR/shared/ra-arena.js";
import { RA_LM_LABEL } from "../WebXR/shared/ra-lm.js";
import { raDeclaration, raDiffCI } from "./arena_eval.mjs";
import { raDsBuild, RA_DS_OUT, RA_DS_SPLITS, RA_DS_SCHEMA } from "./ra_dataset.mjs";
import { RX_FOREIGN } from "./rb_export.mjs";
import { DX_CARD_SECTIONS } from "../WebXR/shared/dx-data.js";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
let passes = 0, failures = 0;
const t0 = Date.now();
async function check(name, fn) {
  try { const r = await fn(); passes += 1; console.log(`  ✓ ${name}${r ? ` — ${r}` : ""}`); }
  catch (err) { failures += 1; console.log(`  ✗ ${name}\n      ${err.message ?? err}`); }
}
const ok = (v, what) => { if (!v) throw new Error(what); };
const read = (p) => readFileSync(join(ROOT, p), "utf8");
const DEV = [1, 2, 3, 4, 5];
const MINE = ["WebXR/shared/ra-arena.js", "WebXR/shared/ra-lm.js", "WebXR/shared/ra-panel.js", "tools/arena_eval.mjs", "tools/ra_dataset.mjs", "tools/check_arena.mjs", "docs/consoles/ROBO-ARENA.md", "exports/robotics/arena/dataset-card.md"];

console.log("ROBO-ARENA — robots compete on the same scenarios and seeds through the governor\n");
const arena = JSON.parse(read("docs/evals/arena.json"));

await check("contract: the four functions return the contract's shapes; deterministic; governor on every step; physical 0", () => {
  const models = raModels(), scs = raScenarios();
  // 9 since ARENA-2 (round 7): ra-lm-h sits beside ra-lm; the round-6b declaration still names the first eight (RA_MODELS_R6).
  ok(models.length === 9 && models.slice(0, 7).concat(models.slice(8)).map((m) => m.id).join() === RA_MODELS_R6.join() && models.every((m) => m.id && m.family && m.trainedOn && m.params && typeof m.params === "object"), "raModels shape");
  ok(scs.length === 12 && scs.every((s) => s.id && (s.kind === "gym" || s.kind === "station") && typeof s.hard === "boolean"), "raScenarios shape");
  ok(scs.filter((s) => s.hard).length === 3 && scs.filter((s) => s.kind === "station").length === 3, "3 hard variants and 3 stations");
  const a = raRun({ modelId: "bc", scenarioId: "rb-port-gantry#hard", seeds: DEV }), b = raRun({ modelId: "bc", scenarioId: "rb-port-gantry#hard", seeds: DEV });
  for (const k of ["success", "ruleBreaks", "steps", "stops", "governorChecked", "physical", "perSeed"]) ok(k in a, `raRun lacks ${k}`);
  ok(JSON.stringify(a) === JSON.stringify(b), "raRun is not deterministic for its seeds");
  ok(a.physical === 0 && a.governorChecked === 1 && a.perSeed.length === DEV.length, "governor coverage or physical");
  const r = raRun({ modelId: "random", scenarioId: "rb-cell-entry", seeds: DEV });
  ok(r.stops > 0 && r.ruleBreaks >= r.stops && r.governorChecked === 1, "a rule break must end in a governor stop");
  let threw = false; try { raRun({ modelId: "bc", scenarioId: "rb-station-cobot", seeds: DEV }); } catch (_) { threw = true; }
  ok(threw, "a station run without its station must refuse");
  ok(raRun({ modelId: "reactive", scenarioId: "rb-cell-entry", seeds: DEV }).applicable === false, "reactive on a scenario without rules must be n/a");
  const lb = raLeaderboard([a, r]);
  ok(lb.length === 2 && lb.every((x) => x.rank && Array.isArray(x.ci95) && x.ci95.length === 2), "raLeaderboard rows");
  return `9 models (8 of round 6b + ra-lm-h), 12 scenarios; bc on port#hard ${a.success} over dev seeds 1–5, twice identical; random cell-entry ${r.stops} stops`;
});

await check("declared first: arena-declared.json matches the code, committed before arena.json", () => {
  const d = JSON.parse(read("docs/evals/arena-declared.json"));
  ok(JSON.stringify(d.protocol) === JSON.stringify(raDeclaration()), "the declaration differs from the code's protocol");
  ok(/devDisclosure/.test(JSON.stringify(d.training)) && d.comparisons?.smallModelHeadline, "declaration lacks the disclosure or the headline");
  let order = "git not available";
  try {
    const first = (f) => execFileSync("git", ["log", "--diff-filter=A", "--format=%H %ct", "--", f], { cwd: ROOT, encoding: "utf8" }).trim().split("\n").pop();
    const dl = first("docs/evals/arena-declared.json"), ar = first("docs/evals/arena.json");
    if (dl && ar) {
      const anc = (() => { try { execFileSync("git", ["merge-base", "--is-ancestor", dl.split(" ")[0], ar.split(" ")[0]], { cwd: ROOT }); return true; } catch (_) { return false; } })();
      ok(anc && dl.split(" ")[0] !== ar.split(" ")[0], "arena.json was not first committed after the declaration");
      order = `declared ${dl.slice(0, 8)} → results ${ar.slice(0, 8)}`;
    } else order = "not committed yet";
  } catch (e) { if (/declaration/.test(String(e.message))) throw e; }
  return order;
});

await check("no seed reuse: training seeds are disjoint from the held-out 7121–7180", () => {
  const held = new Set(RA_HELD_OUT);
  const demo = (seed, n) => Array.from({ length: n }, (_, k) => seed * 100003 + k + 1);
  const train = [...demo(RA_DEMOS.seed, RA_DEMOS.n), ...demo(RA_DEMOS.seed, RA_STATION_DEMOS), ...RA_DS_SPLITS.flatMap((s) => demo(s.seed, s.n))];
  for (const r of [1, 2, 3]) for (let k = 0; k < RA_DAGGER.rollouts; k++) train.push(RA_DAGGER.seed0 + r * 100 + k);
  ok(train.every((s) => !held.has(s)), "a training seed is a held-out seed");
  ok(RA_STATION_SEEDS.every((s) => held.has(s)), "station seeds outside the held-out range");
  const splitSeeds = RA_DS_SPLITS.map((s) => new Set(demo(s.seed, s.n)));
  ok(splitSeeds.every((a, i) => splitSeeds.every((b, j) => i === j || [...a].every((x) => !b.has(x)))), "dataset split seeds overlap");
  return `${train.length} training seeds, 0 in 7121–7180; dataset splits disjoint by seed`;
});

await check("arena.json: 8 families × 12 scenarios; every step governor-checked; 0 physical; leaderboard and comparisons recompute", () => {
  ok(arena.models.length === 8 && arena.scenarios.length === 12, "families or scenarios");
  ok(arena.results.length === 96 && arena.ablation.length === 12, `rows ${arena.results.length}`);
  const app = arena.results.filter((r) => r.applicable);
  for (const r of app) {
    ok(r.governorChecked === 1 && r.stepsChecked === r.stepsRun && r.physical === 0 && r.auditOk, `${r.modelId} on ${r.scenarioId}: governor, physical or audit`);
    ok(r.n === (r.scenarioId.startsWith("rb-station-") ? RA_STATION_SEEDS.length : RA_HELD_OUT.length), `${r.modelId} on ${r.scenarioId}: ${r.n} seeds`);
    ok(r.perSeed.length === r.n && r.perSeed.reduce((a, p) => a + p[1], 0) === r.successes && r.perSeed[0][0] === (r.scenarioId.startsWith("rb-station-") ? RA_STATION_SEEDS[0] : RA_HELD_OUT[0]), `${r.modelId} on ${r.scenarioId}: per-seed rows`);
  }
  ok(arena.totals.physical === 0 && arena.totals.stepsChecked === arena.totals.stepsRun && arena.totals.auditChainsOk, "totals");
  const gymIds = arena.scenarios.filter((s) => s.kind === "gym").map((s) => s.id);
  ok(JSON.stringify(raLeaderboard(arena.results.filter((r) => gymIds.includes(r.scenarioId)))) === JSON.stringify(arena.leaderboard.gym), "the gym leaderboard does not recompute from the rows");
  ok(JSON.stringify(raLeaderboard(arena.results)) === JSON.stringify(arena.leaderboard.all), "the full leaderboard does not recompute");
  const ht = arena.smallModel.heldOutTasks;
  const pool = (list, m, ids) => list.filter((r) => r.modelId === m && r.applicable && ids.includes(r.scenarioId)).reduce((a, r) => ({ k: a.k + r.successes, n: a.n + r.n }), { k: 0, n: 0 });
  const lm = pool(arena.results, "ra-lm", ht.scenarios), bc = pool(arena.results, "bc", ht.scenarios);
  ok(lm.n === 180 && bc.n === 180, "held-out tasks: 180 episodes each");
  ok(JSON.stringify(raDiffCI(lm.k, lm.n, bc.k, bc.n)) === JSON.stringify(ht.lmMinusBc) && JSON.stringify(raWilson(lm.k, lm.n)) === JSON.stringify(ht.lm.ci95), "the small-model comparison does not recompute");
  return `${app.length} applicable rows, ${arena.totals.stepsChecked}/${arena.totals.stepsRun} steps checked, ${arena.totals.physical} physical; ra-lm − bc on held-out tasks ${ht.lmMinusBc.diff} [${ht.lmMinusBc.ci95.join(", ")}]`;
});

await check("arena.json current: a live re-run of sampled rows equals the file", () => {
  const sample = [["random", "rb-port-gantry"], ["reactive", "rb-amr-fleet-routing#hard"], ["bc", "rb-cell-entry"], ["bc", "rb-construction-drilling#hard"], ["dagger-r1", "rb-cobot-zone-setup"], ["expert", "rb-teleop-pick-place"]];
  for (const [m, sc] of sample) {
    const live = raRun({ modelId: m, scenarioId: sc, seeds: RA_HELD_OUT });
    const file = arena.results.find((r) => r.modelId === m && r.scenarioId === sc);
    const slim = live.perSeed.map((p) => [p.seed, p.success ? 1 : 0, p.steps, p.ruleBreaks, p.stopped ? 1 : 0]);
    ok(file && JSON.stringify(slim) === JSON.stringify(file.perSeed) && live.modelHash === file.modelHash, `${m} on ${sc}: live ≠ file`);
  }
  return `${sample.length} rows identical (verification re-runs of the published rows; nothing is tuned)`;
});

await check("small model: small, trained here, named for what it is; no network, no key, no alias; prefixed names", () => {
  ok(/not a large language model/.test(RA_LM_LABEL), "the label must say it is not a large language model");
  const lmRow = arena.results.find((r) => r.modelId === "ra-lm" && r.applicable);
  ok(lmRow && lmRow.modelSize === arena.smallModel.params && arena.smallModel.params < 100000, `weights ${arena.smallModel.params}`);
  ok(arena.models.find((m) => m.id === "ra-lm").trainedOn.includes("synthetic"), "trainedOn must name the synthetic data");
  let mentions = 0;
  for (const f of MINE.filter((p) => existsSync(join(ROOT, p)))) {
    const t = read(f);
    for (const m of t.matchAll(/[^.\n]*\blarge language model\b[^.\n]*/gi)) { mentions += 1; ok(/\b(not|never|no|nor)\b/i.test(m[0]) || f === "tools/check_arena.mjs", `${f}: "${m[0].trim().slice(0, 90)}" is not a negation`); }
    if (f.endsWith(".js")) {
      ok(!/\bfetch\(|XMLHttpRequest|WebSocket|https?:\/\/|api[_-]?key/i.test(t.replace(/^\s*\/\/.*$/gm, "")), `${f}: network or key`);
      ok(!/import\s*\{[^}]*\sas\s/.test(t), `${f}: import alias`);
      for (const m of t.matchAll(/^(?:export\s+)?(?:const|let|function|class)\s+([A-Za-z_$][\w$]*)/gm)) ok(/^(ra|RA_)/.test(m[1]), `${f}: top-level ${m[1]} lacks the ra prefix`);
    }
    if (f !== "tools/check_arena.mjs") ok(!/\b(claude|opus|sonnet|haiku|gpt-?\d)\b/i.test(t), `${f}: model identifier`);
  }
  return `${arena.smallModel.params} weights; ${mentions} mentions of "large language model", all negations`;
});

await check("dataset: build equals disk; leakage 0 re-measured from the full lines; synthetic, consent null; card complete; refusals", async () => {
  const { files, full, index } = raDsBuild();
  for (const [k, v] of files) ok(existsSync(join(RA_DS_OUT, k)) && readFileSync(join(RA_DS_OUT, k), "utf8") === v, `exports/robotics/arena/${k} is not current (node tools/ra_dataset.mjs)`);
  ok(RX_FOREIGN === "arena/", "rb_export may skip only arena/");
  const bySplit = new Map(); let lines = 0;
  const eps = new Map();
  for (const [k, v] of full) for (const l of v.trim().split("\n")) {
    const o = JSON.parse(l); lines += 1;
    ok(o.schema === RA_DS_SCHEMA && o.source === "synthetic" && o.consent === null && o.split && o.scenario && o.instruction && o.observation && o.action && "reward" in o && o.rules && "done" in o, `${k}: a line lacks the schema's fields or is not synthetic`);
    const e = eps.get(o.episode) ?? { split: o.split, sc: o.scenario, body: [] }; e.body.push([o.observation, o.action]); eps.set(o.episode, e);
  }
  for (const e of eps.values()) { const key = `${e.sc}|${JSON.stringify(e.body)}`; const s = bySplit.get(key) ?? new Set(); s.add(e.split); bySplit.set(key, s); }
  const leaks = [...bySplit.values()].filter((s) => s.size > 1).length;
  ok(leaks === 0 && index.leakage === 0, `leakage ${leaks}`);
  ok(lines === index.totals.steps && eps.size === index.totals.episodes, "index totals differ from the lines");
  const card = files.get("dataset-card.md");
  for (const h of DX_CARD_SECTIONS) ok(card.includes(`## ${h}`), `card lacks ${h}`);
  for (const bp of ["Fixed held-out splits", "No leakage between splits", "Consent provenance per sample", "Class balance", "Versioning"]) ok(card.includes(bp), `card lacks the practice "${bp}"`);
  const bad = { ...JSON.parse(full.values().next().value.split("\n")[0]) };
  const human = { schema: "x", source: "human", episodeId: "h-1", scenario: "rb-cell-entry", consent: null, steps: [] };
  const r = raDsBuild({ consented: [human] });
  ok(r.index.refused.length === 1 && r.index.totals.consented === 0, "a human episode without a consent receipt must be refused");
  return `${index.totals.episodes} episodes, ${index.totals.steps} steps (${Object.entries(index.bySplit).map(([k, v]) => `${k} ${v.episodes}`).join(", ")}); cross-split copies removed ${index.crossSplitRemoved}; leakage ${leaks}; ${bad.schema}`;
});

await check("panel: the programme page carries the arena section with the file's figures, static", () => {
  const html = read("WebXR/robotics/programme.html");
  const m = html.match(/<section aria-labelledby="h-arena" id="arena"[\s\S]*?<\/section>/);
  ok(m, "no arena section on WebXR/robotics/programme.html (node tools/gen_robotics_programme.mjs)");
  const sec = m[0];
  ok(!/<script/i.test(sec), "a script inside the arena section");
  const pct = (x) => `${Math.round(x * 1000) / 10}%`;
  for (const r of arena.leaderboard.gym) {
    const row = sec.match(new RegExp(`<tr data-ra-row="${r.modelId}">[\\s\\S]*?</tr>`));
    ok(row && row[0].includes(pct(r.success)) && row[0].includes(`${pct(r.ci95[0])}–${pct(r.ci95[1])}`), `leaderboard row ${r.modelId} differs from arena.json`);
  }
  ok((sec.match(/data-ra-scenario=/g) ?? []).length === 12, "per-scenario cards");
  ok(html.includes('href="#arena"'), "hero link to the arena");
  ok(/simulated/.test(sec) && /Read-only/.test(sec), "the section must say read-only and simulated");
  return `${arena.leaderboard.gym.length} leaderboard rows, 12 scenario cards, no script`;
});

console.log(`\ncheck_arena: ${passes} passed, ${failures} failed (${Date.now() - t0} ms)`);
process.exit(failures ? 1 : 0);
