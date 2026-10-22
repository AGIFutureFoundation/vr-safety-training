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
import { COL_SCENARIOS, COL_VARIANTS, COL_VERSION, colEvalScenario, colTutorSim } from "../WebXR/shared/col-learn.js";
import { RB_SCENARIOS } from "../WebXR/shared/rb-robotics-data.js";
import { RT6_VERSION, RT6_KEEP, RT6_RATER, RT6_TRAJ_FEATURES, rt6EvalPreference, rt6Dagger } from "../WebXR/shared/rt6-learn.js";
import { rt7EvalStepReward, rt7ReactivePolicy } from "../WebXR/shared/rt7-learn.js";
import { RT8_VERSION, RT8_HELD_OUT, RT8_SIDESTEP_K, RT8_REACTIVE, rt8EvalStepReward, rt8Dagger, rt8ReactivePolicy } from "../WebXR/shared/rt8-learn.js";
import { rbEnv, rbRollout } from "../WebXR/shared/rb-env.js";
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
  // ROBOTRAIN-4: the harder variants (rbEnv("<scenario>#hard")), measured the same way; the gap to the expert is the result, whatever it is.
  const variants = COL_VARIANTS.map(({ scenario, variant }) => {
    const id = `${scenario}#${variant}`;
    const f = colEvalScenario(id, { onlySuccessful: true });
    const u = colEvalScenario(id, { onlySuccessful: false });
    // ROBOTRAIN-5: the AMR variant also reports the reservation shield (a rule, not learning), as the base AMR row does.
    return { scenario, variant, id, demosOffered: f.demosOffered, demosKept: f.demos, rows: f.rows, random: f.random, expert: f.expert, bcFiltered: f.bc, bcUnfiltered: u.bc, ...(f.bcShield ? { bcFilteredShield: f.bcShield } : {}), gapToExpert: f.gapToExpert, modelHash: f.modelHash };
  });
  return {
    eval: "COLEARN co-learning", version: COL_VERSION, generator: "tools/col_eval.mjs",
    learners: { robot: "behaviour cloning, k-nearest neighbours (k=5) over hand-written features", tutor: "UCB1 bandit over hint styles + per-step error table", explanations: "heuristic feature attribution, fixed phrases, no model call", shield: "reservation rule (AMR only), not learnt" },
    data: "synthetic demonstrations (scripted expert at skill 0.85 with action noise), labelled synthetic; held-out seeds 7001-7060",
    policies,
    variants,
    stations: await colEvalStations(),
    tutor: { mixed: colTutorSim({ learners: 300 }), tellBest: colTutorSim({ learners: 300, population: "tell-best" }), note: "simulated learners from colTutorSim's own response model; not measurements of people" },
    // ROBOTRAIN-6 (shared/rt6-learn.js): preference pairs train a Bradley–Terry reward model that ranks and filters the
    // demonstrations before cloning; DAgger-style rounds on the hardest gap. Appended last, so every row above is unchanged.
    preference: {
      version: RT6_VERSION, learner: "Bradley–Terry reward model: logistic regression, no intercept, on the difference of two runs' trajectory features; L2 0.01, 500 full-batch steps from zero",
      features: RT6_TRAJ_FEATURES, rater: RT6_RATER, keep: `the top ${RT6_KEEP * 100}% of the 40 demonstrations by learned reward, fixed before any held-out seed was run; the other shares are a sensitivity sweep`,
      pairs: "200 synthetic pairs per scenario (150 to fit, 50 held out), each two runs of one seed by the scripted stand-in at two skills; labelled synthetic. A learner's consented local pairs join the fit only through rt6LocalPairs (0 here: no person's pairs exist)",
      // ROBOTRAIN-7 (shared/rt7-learn.js): a per-step reward on short step windows; only the low-reward moments are dropped
      // before cloning. Appended as the last key of each scenario, so the arms above it are unchanged.
      scenarios: ["rb-amr-fleet-routing", "rb-amr-fleet-routing#hard"].map((sc) => ({ ...rt6EvalPreference(sc), stepReward: rt7EvalStepReward(sc) })),
    },
    // The same rounds with COLEARN's AMR features plus four route features (col-learn.js COL_FEATURE_SETS["amr-path"], opt-in):
    // measured once, after the aliasing figure above pointed at the features; COLEARN's default clone is unchanged.
    // ROBOTRAIN-7: the aliasing ceiling of "amr-robots" on the amr-path rounds' own labelled training states (measured first),
    // then the same declared rounds, run once, with the per-robot features (col-learn.js COL_FEATURE_SETS["amr-robots"], opt-in).
    dagger: { ...rt6Dagger("rb-amr-fleet-routing#hard", { rounds: 5, rollouts: 20 }), pathFeatures: rt6Dagger("rb-amr-fleet-routing#hard", { rounds: 5, rollouts: 20, featureSet: "amr-path", aliasingSets: ["amr-robots", "amr-holders"] }),
      robotFeatures: rt6Dagger("rb-amr-fleet-routing#hard", { rounds: 5, rollouts: 20, featureSet: "amr-robots" }),
      // The ablation, declared after the result above: the holder and order features without the detour move, run once.
      holderFeatures: rt6Dagger("rb-amr-fleet-routing#hard", { rounds: 5, rollouts: 20, featureSet: "amr-holders" }) },
    // ROBOTRAIN-8 (shared/rt8-learn.js): the declared retests on this round's fresh held-out seeds 7061–7120. Every rule was
    // declared and committed before any run on them (docs/consoles/ROBOTRAIN-8.md). Appended last, so every row above is unchanged.
    rt8: colEvalRt8(),
  };
}

/** ROBOTRAIN-8's retests: the per-step reward with oversampled pairs, the local route features (ceiling on training states
 * first, then the rounds), the port-lane correction rounds and the reactive agent with wait-then-sidestep. */
function colEvalRt8() {
  const amr = "rb-amr-fleet-routing#hard";
  const reactiveOn = (mk, seeds) => {
    const rs = seeds.map((s) => rbRollout(rbEnv(amr, { seed: s }), { seed: s, policy: mk(amr) }).summary);
    return { n: rs.length, passed: rs.filter((s) => s.passed).length, truncated: rs.filter((s) => s.truncated).length, violations: rs.reduce((n, s) => n + s.violationCount, 0), meanSteps: Math.round((rs.reduce((n, s) => n + s.steps, 0) / rs.length) * 1000) / 1000 };
  };
  const training = Array.from({ length: 30 }, (_, i) => 101 + i);
  const ceiling = rt8Dagger(amr, { featureSet: "amr-path", score: false, aliasingSets: ["amr-path", "amr-holders", "amr-robots", "amr-local", "amr-holders-local"] });
  return {
    version: RT8_VERSION, heldOut: `${RT8_HELD_OUT[0]}–${RT8_HELD_OUT[RT8_HELD_OUT.length - 1]} (fresh this round; every rule declared before any run on them)`,
    data: "synthetic pairs, synthetic demonstrations and simulated robots; correction labels are the scripted expert's action, not a person's",
    stepReward: ["rb-amr-fleet-routing", amr].map((sc) => rt8EvalStepReward(sc)),
    routeCeiling: { featureSet: ceiling.featureSet, seeds: ceiling.seeds, onTheAmrPathRoundsStates: ceiling.aliasingOnTheseStates },
    localFeatures: rt8Dagger(amr, { featureSet: "amr-local" }),
    holdersLocal: rt8Dagger(amr, { featureSet: "amr-holders-local" }),
    holdersFresh: rt8Dagger(amr, { featureSet: "amr-holders" }),
    robotsFresh: rt8Dagger(amr, { featureSet: "amr-robots" }),
    portLane: rt8Dagger("rb-port-gantry#hard"),
    reactive: { scenario: amr, agent: RT8_REACTIVE, k: RT8_SIDESTEP_K,
      training: { seeds: "101–130", rt7: reactiveOn(rt7ReactivePolicy, training), rt8: reactiveOn(rt8ReactivePolicy, training) },
      heldOut: { seeds: `${RT8_HELD_OUT[0]}–${RT8_HELD_OUT[RT8_HELD_OUT.length - 1]}`, rt7: reactiveOn(rt7ReactivePolicy, RT8_HELD_OUT), rt8: reactiveOn(rt8ReactivePolicy, RT8_HELD_OUT) } },
  };
}

const isMain = process.argv[1]?.endsWith("col_eval.mjs");
if (isMain) {
  const out = JSON.stringify(await colEvalAll(), null, 2) + "\n";
  if (process.argv.includes("--print")) process.stdout.write(out);
  else { writeFileSync(COL_EVAL_PATH, out); console.log(`col_eval: wrote ${COL_EVAL_PATH.slice(ROOT.length + 1)} (${out.length} bytes)`); }
}
