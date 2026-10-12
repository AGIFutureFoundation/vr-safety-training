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
 */
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { RA_VERSION, RA_HELD_OUT, RA_STATION_SEEDS, RA_GOVERNOR, RA_DEMOS, RA_STATION_DEMOS, RA_DAGGER, raModels, raScenarios, raRun, raLeaderboard, raWilson } from "../WebXR/shared/ra-arena.js";
import { RA_LM_VERSION, RA_LM_LABEL, RA_LM_TRAIN, RA_LM_T, RA_LM_D, raLmTaskTexts } from "../WebXR/shared/ra-lm.js";
import { RB_SCENARIOS } from "../WebXR/shared/rb-robotics-data.js";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
export const RA_EVAL_PATH = join(ROOT, "docs", "evals", "arena.json");
export const RA_DECLARED_PATH = join(ROOT, "docs", "evals", "arena-declared.json");
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
    models: raModels().map((m) => m.id),
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
    for (const m of raModels()) {
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
    models: raModels(),
    scenarios: raScenarios(),
    leaderboard: { gym: raLeaderboard(pick(gymIds)), all: raLeaderboard(all) },
    smallModel: {
      label: RA_LM_LABEL, version: RA_LM_VERSION,
      params: lmModel?.modelSize ?? null, train: RA_LM_TRAIN,
      heldOutTasks: vsClone(hardIds, "held-out tasks: the three hard variants (trained on the base tasks only), held-out seeds"),
      heldOutSeeds: vsClone(allIds, "every arena scenario, held-out seeds"),
    },
    totals: {
      families: raModels().length, scenarios: raScenarios().filter((s) => stations || s.kind !== "station").length,
      episodes: all.reduce((a, r) => a + r.n, 0), stepsRun: all.reduce((a, r) => a + r.stepsRun, 0), stepsChecked: all.reduce((a, r) => a + r.stepsChecked, 0),
      physical: all.reduce((a, r) => a + r.physical, 0), auditChainsOk: all.every((r) => r.auditOk),
    },
    results: results.map(raSlim),
    ablation: ablation.map(raSlim),
  };
}

async function main() {
  const args = new Set(process.argv.slice(2));
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
