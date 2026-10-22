#!/usr/bin/env node
/**
 * ROBO-ARENA — every robot model family runs the same scenarios on the same seeds through the VBRIDGE governor
 * (WebXR/shared/ra-arena.js), and the small language-conditioned model (WebXR/shared/ra-lm.js) is compared with the
 * behaviour clone on held-out tasks and seeds. Writes docs/evals/arena.json. Deterministic: the same code writes the same
 * file byte for byte (no timestamp, no timing), so tools/check_arena.mjs can compare a live re-run of any part with it.
 * Synthetic demonstrations and simulated robots only; no learner data is read (a consented take would come from the page).
 *
 * The protocol is declared in docs/evals/arena-declared.json, committed before any held-out run; this tool refuses to run
 * the held-out seeds unless that file is present and names the same seeds, models and scenarios as the code.
 *
 *     node tools/arena_eval.mjs              # held-out run (7121–7180), write docs/evals/arena.json
 *     node tools/arena_eval.mjs --dev        # development seeds 1–20 only, print a summary, write nothing
 *     node tools/arena_eval.mjs --no-stations  # skip the three station scenarios (they need the full headless suite)
 *     node tools/arena_eval.mjs --r7         # ARENA-2's declared retest on 7181–7240 (docs/evals/arena-declared-r7.json):
 *                                            # bc, ra-lm and ra-lm-h, run once; adds `retest7` to docs/evals/arena.json
 *     node tools/arena_eval.mjs --r7 --dev   # the same on development seeds (gym 1–20, stations 1–3), writes nothing
 */
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { RA_VERSION, RA_HELD_OUT, RA_STATION_SEEDS, RA_HELD_OUT_R7, RA_STATION_SEEDS_R7, RA_MODELS_R6, RA_GOVERNOR, RA_DEMOS, RA_STATION_DEMOS, RA_DAGGER, raModels, raScenarios, raRun, raLeaderboard, raWilson } from "../WebXR/shared/ra-arena.js";
import { RA_LM_VERSION, RA_LM_LABEL, RA_LM_TRAIN, RA_LM_T, RA_LM_D, RA_LM_H_VERSION, RA_LM_H_LABEL, RA_LM_H_TRAIN, raLmTaskTexts } from "../WebXR/shared/ra-lm.js";
import { RB_SCENARIOS } from "../WebXR/shared/rb-robotics-data.js";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
export const RA_EVAL_PATH = join(ROOT, "docs", "evals", "arena.json");
export const RA_DECLARED_PATH = join(ROOT, "docs", "evals", "arena-declared.json");
export const RA_DECLARED_R7_PATH = join(ROOT, "docs", "evals", "arena-declared-r7.json");
/** Round 7's three models (arena-declared-r7.json). */
export const RA_R7_MODELS = ["bc", "ra-lm", "ra-lm-h"];
/** The round-6b families only (the published rows); raModels() now also lists ra-lm-h. */
const raModelsR6 = () => raModels().filter((m) => RA_MODELS_R6.includes(m.id));
const RA_STATIONS_DIR = join(ROOT, "exports", "unity", "SmartCitiX", "Content", "stations");
export const RA_DEV_SEEDS = Array.from({ length: 20 }, (_, i) => i + 1);

const r3 = (n) => Math.round(n * 1000) / 1000;
/** A station's exported JSON (steps and hazards), or null. */
export function raReadStation(id) { const p = join(RA_STATIONS_DIR, `${id}.json`); return existsSync(p) ? JSON.parse(readFileSync(p, "utf8")) : null; }
export const raTexts = () => raLmTaskTexts(raReadStation);

/** The three station environments from the headless suite (the same construction COLEARN's eval uses). */
export async function raStations() {
  const { loadSmartCity } = await import("./lib/headless.mjs");
  const suite = await loadSmartCity(); suite.Sfx.muted = true;
  const out = {};
  for (const sc of RB_SCENARIOS.filter((s) => s.kind === "station")) {
    const room = suite.ROOMS.find((r) => r.id === sc.station);
    out[sc.id] = { room, api: room.build(new suite.THREE.Group()), rebuild: () => room.build(new suite.THREE.Group()), SessionClass: suite.Session };
  }
  return out;
}

/** Newcombe's hybrid score interval for a difference of two proportions (95%). */
export function raDiffCI(k1, n1, k2, n2) {
  const [l1, u1] = raWilson(k1, n1), [l2, u2] = raWilson(k2, n2), p1 = k1 / n1, p2 = k2 / n2, d = p1 - p2;
  return { diff: r3(d), ci95: [r3(d - Math.sqrt((p1 - l1) ** 2 + (u2 - p2) ** 2)), r3(d + Math.sqrt((u1 - p1) ** 2 + (p2 - l2) ** 2))] };
}

const raSlim = (r) => { const { perSeed, ...rest } = r; return { ...rest, perSeed: (perSeed ?? []).map((p) => [p.seed, p.success ? 1 : 0, p.steps, p.ruleBreaks, p.stopped ? 1 : 0]) }; };

/** The declaration the code implies: compared with the committed docs/evals/arena-declared.json before a held-out run. */
export function raDeclaration() {
  return {
    version: RA_VERSION,
    models: raModelsR6().map((m) => m.id),
    scenarios: raScenarios().map((s) => s.id),
    seeds: { gym: `${RA_HELD_OUT[0]}–${RA_HELD_OUT[RA_HELD_OUT.length - 1]}`, stations: `${RA_STATION_SEEDS[0]}–${RA_STATION_SEEDS[RA_STATION_SEEDS.length - 1]}` },
    lm: { version: RA_LM_VERSION, train: RA_LM_TRAIN, T: RA_LM_T, D: RA_LM_D },
  };
}

export async function raEvalAll({ seeds = RA_HELD_OUT, stationSeeds = RA_STATION_SEEDS, stations = true, log = () => {} } = {}) {
  const texts = raTexts();
  const envs = stations ? await raStations() : {};
  const stationFor = stations ? (sc) => envs[sc] ?? null : null;
  const lmOptions = { texts, stationFor };
  const results = [], ablation = [];
  for (const sc of raScenarios()) {
    if (sc.kind === "station" && !stations) continue;
    const s = sc.kind === "station" ? stationSeeds : seeds, station = envs[sc.id] ?? null;
    for (const m of raModelsR6()) {
      const r = raRun({ modelId: m.id, scenarioId: sc.id, seeds: s, station, lmOptions });
      results.push(r); log(`${sc.id} ${m.id} ${r.applicable ? r.success : "n/a"}`);
    }
    const b = raRun({ modelId: "ra-lm", scenarioId: sc.id, seeds: s, station, lmOptions: { ...lmOptions, blankText: true } });
    ablation.push(b); log(`${sc.id} ra-lm(blank text) ${b.applicable ? b.success : "n/a"}`);
  }
  const gymIds = raScenarios().filter((s) => s.kind === "gym").map((s) => s.id);
  const hardIds = raScenarios().filter((s) => s.hard).map((s) => s.id);
  const pick = (ids, list = results) => list.filter((r) => ids.includes(r.scenarioId));
  const pool = (list, model) => list.filter((r) => r.modelId === model && r.applicable).reduce((a, r) => ({ k: a.k + r.successes, n: a.n + r.n }), { k: 0, n: 0 });
  const vsClone = (ids, label) => {
    const lm = pool(pick(ids), "ra-lm"), bc = pool(pick(ids), "bc"), bl = pool(pick(ids, ablation), "ra-lm");
    return { label, scenarios: ids, lm: { success: r3(lm.k / (lm.n || 1)), ci95: raWilson(lm.k, lm.n), n: lm.n }, bc: { success: r3(bc.k / (bc.n || 1)), ci95: raWilson(bc.k, bc.n), n: bc.n }, lmMinusBc: lm.n && bc.n ? raDiffCI(lm.k, lm.n, bc.k, bc.n) : null, blankText: { success: r3(bl.k / (bl.n || 1)), ci95: raWilson(bl.k, bl.n), n: bl.n }, textMinusBlank: lm.n && bl.n ? raDiffCI(lm.k, lm.n, bl.k, bl.n) : null };
  };
  const lmModel = results.find((r) => r.modelId === "ra-lm" && r.applicable);
  const allIds = raScenarios().map((s) => s.id);
  const all = results.filter((r) => r.applicable);
  return {
    eval: "ROBO-ARENA: robot model families compared on the same scenarios and seeds through the governor", version: RA_VERSION, generator: "tools/arena_eval.mjs",
    declared: "docs/evals/arena-declared.json (committed before this run)",
    seeds: { gym: `${seeds[0]}–${seeds[seeds.length - 1]} (${seeds.length})`, stations: stations ? `${stationSeeds[0]}–${stationSeeds[stationSeeds.length - 1]} (${stationSeeds.length})` : "not run" },
    governor: RA_GOVERNOR,
    data: `synthetic demonstrations only (COLEARN colSyntheticDemos: scripted expert at skill ${RA_DEMOS.skill}, action noise ${RA_DEMOS.noise}, ${RA_DEMOS.n} per gym task and ${RA_STATION_DEMOS} per station, seed ${RA_DEMOS.seed}); DAgger labels are the scripted expert's (seeds ${RA_DAGGER.seed0 + 100}+), not a person's; consented learner takes: 0 present in this headless run`,
    models: raModelsR6(),
    scenarios: raScenarios(),
    leaderboard: { gym: raLeaderboard(pick(gymIds)), all: raLeaderboard(all) },
    smallModel: {
      label: RA_LM_LABEL, version: RA_LM_VERSION,
      params: lmModel?.modelSize ?? null, train: RA_LM_TRAIN,
      heldOutTasks: vsClone(hardIds, "held-out tasks: the three hard variants (trained on the base tasks only), held-out seeds"),
      heldOutSeeds: vsClone(allIds, "every arena scenario, held-out seeds"),
    },
    totals: {
      families: raModelsR6().length, scenarios: raScenarios().filter((s) => stations || s.kind !== "station").length,
      episodes: all.reduce((a, r) => a + r.n, 0), stepsRun: all.reduce((a, r) => a + r.stepsRun, 0), stepsChecked: all.reduce((a, r) => a + r.stepsChecked, 0),
      physical: all.reduce((a, r) => a + r.physical, 0), auditChainsOk: all.every((r) => r.auditOk),
    },
    results: results.map(raSlim),
    ablation: ablation.map(raSlim),
  };
}

/** Round 7's declaration as the code implies it: compared with the committed docs/evals/arena-declared-r7.json. */
export function raDeclarationR7() {
  const { epochs, lr, l2, seed, hidden, interruptText } = RA_LM_H_TRAIN;
  return {
    version: "ra/2",
    models: RA_R7_MODELS,
    scenarios: raScenarios().map((s) => s.id),
    seeds: { gym: `${RA_HELD_OUT_R7[0]}–${RA_HELD_OUT_R7[RA_HELD_OUT_R7.length - 1]}`, stations: `${RA_STATION_SEEDS_R7[0]}–${RA_STATION_SEEDS_R7[RA_STATION_SEEDS_R7.length - 1]}` },
    lmH: { version: RA_LM_H_VERSION, change: "hidden layer", H: hidden, activation: "tanh", train: { epochs, lr, l2, seed }, T: RA_LM_T, D: RA_LM_D, interruptText },
  };
}

/** ARENA-2's retest: bc, ra-lm and ra-lm-h on every scenario, on the round-7 seeds, with the declared comparisons. */
export async function raEvalR7({ seeds = RA_HELD_OUT_R7, stationSeeds = RA_STATION_SEEDS_R7, log = () => {} } = {}) {
  const texts = raTexts(), envs = await raStations();
  const lmOptions = { texts, stationFor: (sc) => envs[sc] ?? null };
  const results = [];
  for (const sc of raScenarios()) for (const m of RA_R7_MODELS) {
    const r = raRun({ modelId: m, scenarioId: sc.id, seeds: sc.kind === "station" ? stationSeeds : seeds, station: envs[sc.id] ?? null, lmOptions });
    results.push(r); log(`${sc.id} ${m} ${r.applicable ? `${r.successes}/${r.n}` : "n/a"}`);
  }
  const pool = (ids, model) => results.filter((r) => r.modelId === model && r.applicable && ids.includes(r.scenarioId)).reduce((a, r) => ({ k: a.k + r.successes, n: a.n + r.n }), { k: 0, n: 0 });
  const one = (ids, model) => { const p = pool(ids, model); return { success: r3(p.k / (p.n || 1)), successes: p.k, ci95: raWilson(p.k, p.n), n: p.n }; };
  const diff = (ids, a, b, label) => { const pa = pool(ids, a), pb = pool(ids, b); return { label, scenarios: ids, [a]: one(ids, a), [b]: one(ids, b), diff: pa.n && pb.n ? raDiffCI(pa.k, pa.n, pb.k, pb.n) : null }; };
  const gaps = ["rb-amr-fleet-routing", "rb-port-gantry"], hardIds = raScenarios().filter((s) => s.hard).map((s) => s.id), allIds = raScenarios().map((s) => s.id);
  const lmh = results.find((r) => r.modelId === "ra-lm-h" && r.applicable);
  const all = results.filter((r) => r.applicable);
  return {
    eval: "ARENA-2 retest: the small model with one declared change (ra-lm-h) against the clone and ra-lm, run once", generator: "tools/arena_eval.mjs --r7",
    declared: "docs/evals/arena-declared-r7.json (committed 8ea01d3c before any run on these seeds; amendment 1 committed before this run)",
    seeds: { gym: `${seeds[0]}–${seeds[seeds.length - 1]} (${seeds.length})`, stations: `${stationSeeds[0]}–${stationSeeds[stationSeeds.length - 1]} (${stationSeeds.length})` },
    governor: RA_GOVERNOR,
    models: raModels().filter((m) => RA_R7_MODELS.includes(m.id)),
    newModel: { id: "ra-lm-h", label: RA_LM_H_LABEL, version: RA_LM_H_VERSION, train: RA_LM_H_TRAIN, params: lmh?.modelSize ?? null, beside: { id: "ra-lm", label: RA_LM_LABEL, version: RA_LM_VERSION } },
    comparisons: {
      headline: diff(gaps, "ra-lm-h", "bc", "ra-lm-h minus bc, pooled over AMR and port (the two declared gaps)"),
      amr: diff(["rb-amr-fleet-routing"], "ra-lm-h", "bc", "AMR base"),
      port: diff(["rb-port-gantry"], "ra-lm-h", "bc", "port base"),
      changeOnGaps: diff(gaps, "ra-lm-h", "ra-lm", "ra-lm-h minus ra-lm on AMR and port (the effect of the change, same seeds)"),
      allScenarios: diff(allIds, "ra-lm-h", "bc", "every arena scenario"),
      heldOutTasks: diff(hardIds, "ra-lm-h", "bc", "the three hard variants (held-out tasks)"),
      cobotStation: Object.fromEntries(RA_R7_MODELS.map((m) => { const r = results.find((x) => x.modelId === m && x.scenarioId === "rb-station-cobot"); return [m, r ? `${r.successes} of ${r.n}` : "n/a"]; })),
    },
    leaderboard: raLeaderboard(all),
    totals: { episodes: all.reduce((a, r) => a + r.n, 0), stepsRun: all.reduce((a, r) => a + r.stepsRun, 0), stepsChecked: all.reduce((a, r) => a + r.stepsChecked, 0), physical: all.reduce((a, r) => a + r.physical, 0), auditChainsOk: all.every((r) => r.auditOk) },
    results: results.map(raSlim),
  };
}

/** The first commit that added `rel`, or null (no git, or not committed). */
export function raFirstCommit(rel) {
  try { const out = execFileSync("git", ["log", "--diff-filter=A", "--format=%H", "--", rel], { cwd: ROOT, encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim().split("\n").filter(Boolean); return out.length ? out[out.length - 1] : null; } catch (_) { return null; }
}

async function mainR7(args) {
  if (args.has("--dev")) {
    const out = await raEvalR7({ seeds: RA_DEV_SEEDS, stationSeeds: RA_DEV_SEEDS.slice(0, 3), log: (l) => console.log(l) });
    console.log(JSON.stringify({ comparisons: out.comparisons, totals: out.totals }, null, 1));
    return;
  }
  const rel = "docs/evals/arena-declared-r7.json";
  if (!existsSync(RA_DECLARED_R7_PATH)) { console.error(`arena_eval --r7: ${rel} is missing; declare (and commit) before any held-out run`); process.exit(1); }
  let dirty = "";
  try { dirty = execFileSync("git", ["status", "--porcelain", "--", rel], { cwd: ROOT, encoding: "utf8" }).trim(); } catch (_) { dirty = "no git"; }
  if (dirty || !raFirstCommit(rel)) { console.error(`arena_eval --r7: ${rel} must be committed, unchanged, before the held-out run (${dirty || "not committed"})`); process.exit(1); }
  const declared = JSON.parse(readFileSync(RA_DECLARED_R7_PATH, "utf8")), want = raDeclarationR7();
  for (const k of Object.keys(want)) if (JSON.stringify(declared.protocol?.[k]) !== JSON.stringify(want[k])) { console.error(`arena_eval --r7: the code's ${k} differs from the declaration`); process.exit(1); }
  const arena = JSON.parse(readFileSync(RA_EVAL_PATH, "utf8"));
  if (arena.retest7) { console.error("arena_eval --r7: arena.json already holds retest7; the declared retest runs once"); process.exit(1); }
  arena.retest7 = await raEvalR7({ log: (l) => (args.has("--quiet") ? null : console.log(l)) });
  writeFileSync(RA_EVAL_PATH, `${JSON.stringify(arena, null, 1)}\n`);
  console.log(`wrote retest7 into ${RA_EVAL_PATH}`);
}

async function main() {
  const args = new Set(process.argv.slice(2));
  if (args.has("--r7")) return mainR7(args);
  const stations = !args.has("--no-stations");
  if (args.has("--dev")) {
    const out = await raEvalAll({ seeds: RA_DEV_SEEDS, stationSeeds: RA_DEV_SEEDS.slice(0, 3), stations, log: (l) => console.log(l) });
    console.log(JSON.stringify({ leaderboard: out.leaderboard.gym.map((r) => [r.modelId, r.success, r.ci95]), smallModel: out.smallModel, totals: out.totals }, null, 1));
    return;
  }
  if (!existsSync(RA_DECLARED_PATH)) { console.error("arena_eval: docs/evals/arena-declared.json is missing; declare (and commit) before any held-out run"); process.exit(1); }
  const declared = JSON.parse(readFileSync(RA_DECLARED_PATH, "utf8"));
  const want = raDeclaration();
  for (const k of ["version", "models", "scenarios", "seeds", "lm"]) if (JSON.stringify(declared.protocol?.[k]) !== JSON.stringify(want[k])) { console.error(`arena_eval: the code's ${k} differs from the declaration`); process.exit(1); }
  const out = await raEvalAll({ stations, log: (l) => (args.has("--quiet") ? null : console.log(l)) });
  writeFileSync(RA_EVAL_PATH, `${JSON.stringify(out, null, 1)}\n`);
  console.log(`wrote ${RA_EVAL_PATH}`);
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) main();
