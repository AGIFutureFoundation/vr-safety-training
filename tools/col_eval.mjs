#!/usr/bin/env node
/**
 * COLEARN — writes the co-learning eval to docs/evals/colearn.json (docs/consoles/COLEARN.md):
 * behaviour cloning (k-NN) versus a random policy and the scripted expert on held-out seeds, filtered and
 * unfiltered demonstrations, and the adaptive tutor's simulated gains with 95% intervals. Deterministic: the
 * same code writes the same file byte for byte (no timestamp), so tools/check_colearn.mjs can compare it with
 * a live run and every figure quoted elsewhere traces to it. Synthetic demonstrations and simulated learners
 * only; no learner data is read.
 *
 *     node tools/col_eval.mjs            # write docs/evals/colearn.json
 *     node tools/col_eval.mjs --print    # print, do not write
 */
import { writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { COL_SCENARIOS, COL_VERSION, colEvalScenario, colTutorSim } from "../WebXR/shared/col-learn.js";
import { RB_SCENARIOS } from "../WebXR/shared/rb-robotics-data.js";
import { loadSmartCity } from "./lib/headless.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
export const COL_EVAL_PATH = join(ROOT, "docs", "evals", "colearn.json");

/** Behaviour cloning on the station wrappers (rb-station-*): the catalog station's episodes are the demonstrations
 * (DATAWORKS kind "station"; here synthetic, from shared/robot.js RobotAgent at skill 0.85). 20 demos, 10 held-out
 * seeds: a station episode is ~280 steps and a random policy runs to the 20,000-step cap, so fewer seeds than the games. */
async function colEvalStations() {
  const suite = await loadSmartCity(); suite.Sfx.muted = true;
  return RB_SCENARIOS.filter((sc) => sc.kind === "station").map((sc) => {
    const room = suite.ROOMS.find((r) => r.id === sc.station);
    const station = { room, api: room.build(new suite.THREE.Group()), rebuild: () => room.build(new suite.THREE.Group()), SessionClass: suite.Session };
    const f = colEvalScenario(sc.id, { station, demos: 20, heldOut: 10, onlySuccessful: true });
    return { scenario: sc.id, station: sc.station, demosOffered: f.demosOffered, demosKept: f.demos, rows: f.rows, random: f.random, expert: f.expert, bcFiltered: f.bc, gapToExpert: f.gapToExpert, modelHash: f.modelHash };
  });
}

/** The whole eval as plain JSON. */
export async function colEvalAll() {
  const policies = COL_SCENARIOS.map((sc) => {
    const f = colEvalScenario(sc, { onlySuccessful: true });
    const u = colEvalScenario(sc, { onlySuccessful: false });
    return { scenario: sc, demosOffered: f.demosOffered, demosKept: f.demos, rows: f.rows, random: f.random, expert: f.expert, bcFiltered: f.bc, bcUnfiltered: u.bc, bcFilteredShield: f.bcShield, gapToExpert: f.gapToExpert, modelHash: f.modelHash };
  });
  return {
    eval: "COLEARN co-learning", version: COL_VERSION, generator: "tools/col_eval.mjs",
    learners: { robot: "behaviour cloning, k-nearest neighbours (k=5) over hand-written features", tutor: "UCB1 bandit over hint styles + per-step error table", explanations: "heuristic feature attribution, fixed phrases, no model call", shield: "reservation rule (AMR only), not learnt" },
    data: "synthetic demonstrations (scripted expert at skill 0.85 with action noise), labelled synthetic; held-out seeds 7001-7060",
    policies,
    stations: await colEvalStations(),
    tutor: { mixed: colTutorSim({ learners: 300 }), tellBest: colTutorSim({ learners: 300, population: "tell-best" }), note: "simulated learners from colTutorSim's own response model; not measurements of people" },
  };
}

const isMain = process.argv[1]?.endsWith("col_eval.mjs");
if (isMain) {
  const out = JSON.stringify(await colEvalAll(), null, 2) + "\n";
  if (process.argv.includes("--print")) process.stdout.write(out);
  else { writeFileSync(COL_EVAL_PATH, out); console.log(`col_eval: wrote ${COL_EVAL_PATH.slice(ROOT.length + 1)} (${out.length} bytes)`); }
}
