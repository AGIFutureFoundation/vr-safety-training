/**
 * Headless checks for the dataset-quality reporter (tools/eval_dataset.mjs)
 * and the behaviour-cloning baseline trainer (tools/train_baseline.mjs), on
 * a tiny dataset generated for this run only: exporter → eval → trainer
 * round trip, accuracy above chance on the tiny set, a weights round-trip,
 * and a replay smoke test — the whole pipeline docs/robot-datasets.md
 * describes, exercised end to end in seconds rather than minutes.
 *
 *     node tools/check_dataset_tools.mjs       # or node tools/check_all.mjs
 */
import { spawnSync } from "node:child_process";
import { mkdtempSync, mkdirSync, readFileSync, writeFileSync, copyFileSync, existsSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, "..");
const NODE = process.execPath;

let failures = 0;
async function check(name, fn) {
  try { await fn(); console.log(`  ✓ ${name}`); }
  catch (err) { failures += 1; console.log(`  ✗ ${name}\n      ${err.stack ?? err}`); }
}
const ok = (v, what) => { if (!v) throw new Error(what); };
const eq = (a, b, what) => { if (a !== b) throw new Error(`${what}: expected ${JSON.stringify(b)}, got ${JSON.stringify(a)}`); };

console.log("Dataset tools (eval_dataset.mjs, train_baseline.mjs) — self-test\n");

const scratch = mkdtempSync(join(tmpdir(), "dataset-tools-check-"));
// Belt-and-braces: a thrown error still deletes this in the finally block
// below, but a hard process exit before that runs (a crash, not a normal
// failure) should not leave scratch data behind either.
process.on("exit", () => { try { rmSync(scratch, { recursive: true, force: true }); } catch { /* best effort */ } });

try {
  const datasetDir = join(scratch, "dataset");
  const baselineDir = join(scratch, "baseline");
  mkdirSync(datasetDir, { recursive: true });

  // ------------------------------------------------------------ 1. export
  //
  // The trades suite (9 rooms) rather than smartcity (hundreds) so this
  // check stays a matter of seconds. Two stations, two skills, two seeds —
  // enough for a real train/test station split and real skill/seed cells,
  // small enough to be a "tiny generated dataset."
  const exportRun = spawnSync(NODE, [
    join(ROOT, "tools", "export_dataset.mjs"),
    "--apps", "trades", "--stations", "5", "--seeds", "2", "--skills", "0.3,1", "--out", datasetDir,
  ], { encoding: "utf8", cwd: ROOT });

  await check("export_dataset.mjs produces a tiny dataset", () => {
    ok(exportRun.status === 0, `exit ${exportRun.status}\n${exportRun.stdout}\n${exportRun.stderr}`);
    ok(existsSync(join(datasetDir, "manifest.json")), "manifest.json missing");
  });
  const manifest = JSON.parse(readFileSync(join(datasetDir, "manifest.json"), "utf8"));

  // -------------------------------------------------------------- 2. eval
  const evalRun = spawnSync(NODE, [join(ROOT, "tools", "eval_dataset.mjs"), datasetDir], { encoding: "utf8", cwd: ROOT });
  await check("eval_dataset.mjs exits 0 and writes both report files", () => {
    ok(evalRun.status === 0, `exit ${evalRun.status}\n${evalRun.stdout}\n${evalRun.stderr}`);
    ok(existsSync(join(datasetDir, "quality-report.json")), "quality-report.json missing");
    ok(existsSync(join(datasetDir, "QUALITY_REPORT.md")), "QUALITY_REPORT.md missing");
  });
  const report1 = JSON.parse(readFileSync(join(datasetDir, "quality-report.json"), "utf8"));

  await check("the quality report's score is a 0-100 number built from documented sub-scores", () => {
    ok(typeof report1.score === "number" && report1.score >= 0 && report1.score <= 100, `score out of range: ${report1.score}`);
    const total = Object.entries(report1.weights).reduce((n, [k, w]) => n + w, 0);
    eq(total, 100, "sub-score weights must sum to 100");
    ok(report1.totals.episodes === manifest.totals.episodes, "report episode total must match the exporter's own manifest");
  });

  await check("schema validity and duplicate rate are both clean on a fresh, non-tampered export", () => {
    eq(report1.schemaValidity.invalidSteps, 0, "a freshly exported dataset should have no invalid steps");
    eq(report1.duplicates.duplicateEpisodeCount, 0, "a freshly exported dataset should have no duplicate episodes");
  });

  await check("eval_dataset.mjs is deterministic: rerunning it on the same dataset reproduces every number", () => {
    const rerun = spawnSync(NODE, [join(ROOT, "tools", "eval_dataset.mjs"), datasetDir], { encoding: "utf8", cwd: ROOT });
    ok(rerun.status === 0, "rerun failed");
    const report2 = JSON.parse(readFileSync(join(datasetDir, "quality-report.json"), "utf8"));
    const strip = (r) => { const { generatedAt, ...rest } = r; return rest; };
    eq(JSON.stringify(strip(report2)), JSON.stringify(strip(report1)), "report content (aside from generatedAt) must be identical");
  });

  await check("eval_dataset.mjs catches an injected duplicate episode", () => {
    const shard = manifest.files.find((f) => f.startsWith("episodes-"));
    const lines = readFileSync(join(datasetDir, shard), "utf8").trimEnd().split("\n");
    const dupedPath = join(scratch, "duped-" + shard);
    writeFileSync(dupedPath, lines.join("\n") + "\n" + lines[0] + "\n");
    // Build a throwaway dataset dir with only the duplicated shard, so the
    // manifest's own totals (which would disagree with the tamper) do not
    // confuse the check — eval_dataset.mjs works from the shards themselves.
    const dupDir = join(scratch, "dup-dataset");
    mkdirSync(dupDir, { recursive: true });
    copyFileSync(dupedPath, join(dupDir, shard));
    const r = spawnSync(NODE, [join(ROOT, "tools", "eval_dataset.mjs"), dupDir], { encoding: "utf8", cwd: ROOT });
    ok(r.status === 0, "eval on the tampered copy should still exit 0 (a quality report, not a gate)");
    const dupReport = JSON.parse(readFileSync(join(dupDir, "quality-report.json"), "utf8"));
    ok(dupReport.duplicates.duplicateEpisodeCount >= 1, "the injected duplicate was not detected");
  });

  await check("the LeRobot-style and RLDS-style layouts are written, structurally valid, and agree with the native shards", () => {
    const f = report1.formats;
    ok(f?.lerobot?.present && f?.rlds?.present, "both layouts should be present in a default export");
    ok(f.lerobot.valid, `lerobot layout issues: ${JSON.stringify(f.lerobot.issues)}`);
    ok(f.rlds.valid, `rlds layout issues: ${JSON.stringify(f.rlds.issues)}`);
    eq(f.lerobot.episodes, manifest.totals.episodes, "lerobot episode count");
    eq(f.lerobot.frames, manifest.totals.steps, "lerobot frame count");
    eq(f.rlds.steps, manifest.totals.steps, "rlds step count");
    const first = JSON.parse(readFileSync(join(datasetDir, "rlds", "episodes.jsonl"), "utf8").split("\n")[0]);
    ok(first.steps.some((s) => typeof s.language_instruction === "string" && s.language_instruction.length > 0), "no language_instruction from the step prompt");
    ok(first.episode_metadata.consent && first.episode_metadata.licence, "licence and consent fields missing");
  });

  const primRun = spawnSync(NODE, [join(ROOT, "tools", "robot_train.mjs"), "--from-lerobot", join(datasetDir, "lerobot"), "--out", join(scratch, "prim")], { encoding: "utf8", cwd: ROOT });
  await check("robot_train.mjs --from-lerobot reports a success rate per registry primitive", async () => {
    ok(primRun.status === 0, `exit ${primRun.status}\n${primRun.stdout}\n${primRun.stderr}`);
    const r = JSON.parse(readFileSync(join(scratch, "prim", "baseline-primitives.json"), "utf8"));
    const { SK_PRIMITIVES } = await import("../WebXR/shared/skill-registry.js");
    eq(r.primitives.length, SK_PRIMITIVES.length, "one row per primitive");
    ok(r.primitives.some((p) => typeof p.demoSuccessRate === "number"), "no primitive has a success rate");
    ok(r.testStations.length > 0 && r.trainStations.every((s) => !r.testStations.includes(s)), "train/held-out stations must be disjoint and non-empty");
  });

  // ---------------------------------------------------------- 3. trainer
  const trainRun = spawnSync(NODE, [
    join(ROOT, "tools", "train_baseline.mjs"), datasetDir, "--out", baselineDir, "--epochs", "15",
  ], { encoding: "utf8", cwd: ROOT, timeout: 120_000 });

  await check("train_baseline.mjs exits 0 and writes weights + reports on a tiny dataset", () => {
    ok(trainRun.status === 0, `exit ${trainRun.status}\n${trainRun.stdout}\n${trainRun.stderr}`);
    for (const f of ["weights.json", "training-report.json", "training-report.md", "MODEL_CARD.md"]) {
      ok(existsSync(join(baselineDir, f)), `${f} missing`);
    }
  });

  const weights = JSON.parse(readFileSync(join(baselineDir, "weights.json"), "utf8"));
  const trainingReport = JSON.parse(readFileSync(join(baselineDir, "training-report.json"), "utf8"));

  await check("the held-out split is by station, and both splits are non-empty on a multi-station dataset", () => {
    ok(weights.trainStations.length > 0, "no training stations");
    ok(weights.testStations.length > 0, "no held-out stations");
    const overlap = weights.trainStations.filter((s) => weights.testStations.includes(s));
    eq(overlap.length, 0, "train and test station sets must be disjoint");
  });

  await check("top-1 accuracy on the held-out set beats chance across the documented action classes", async () => {
    const { ACTION_CLASSES } = await import("./train_baseline.mjs");
    const chance = 1 / ACTION_CLASSES.length;
    const top1 = trainingReport.accuracy.test.overall.top1;
    ok(typeof top1 === "number", "no held-out top-1 accuracy reported");
    ok(top1 > chance * 1.5, `top-1 accuracy ${top1} is not comfortably above chance (${chance.toFixed(3)})`);
  });

  await check("weights.json round-trips: deserialising it twice yields byte-identical predictions", async () => {
    const { deserializeModel, predictProbs, featurize, FEATURE_DIM, ACTION_CLASSES } = await import("./train_baseline.mjs");
    eq(weights.featureDim, FEATURE_DIM, "weights.json's featureDim must match this build's feature spec");
    eq(JSON.stringify(weights.actionClasses), JSON.stringify(ACTION_CLASSES), "weights.json's actionClasses must match this build's vocabulary");
    eq(weights.model.W.length, FEATURE_DIM * ACTION_CLASSES.length, "W is the wrong length for its own declared layout");
    eq(weights.model.b.length, ACTION_CLASSES.length, "b is the wrong length");

    const sample = featurize({ stepIndex: 1, kind: "select", targets: ["a"], score: 100, streak: 1, errors: 0, hazardHits: 0, elapsed: 3 });
    const modelA = deserializeModel(weights.featureDim, ACTION_CLASSES.length, weights.model);
    const modelB = deserializeModel(weights.featureDim, ACTION_CLASSES.length, JSON.parse(JSON.stringify(weights.model)));
    const probsA = predictProbs(modelA, sample), probsB = predictProbs(modelB, sample);
    eq(JSON.stringify(probsA), JSON.stringify(probsB), "two independent deserialisations of the same weights must predict identically");
    const sum = probsA.reduce((s, p) => s + p, 0);
    ok(Math.abs(sum - 1) < 1e-6, `softmax output should sum to 1, got ${sum}`);
  });

  await check("the replay smoke test ran the real engine and produced sane summaries for all three policies", () => {
    const heldOutStations = weights.testStations.length;
    for (const name of ["learned", "expert", "novice"]) {
      const s = trainingReport.replay.overall[name];
      ok(s, `no replay summary for ${name}`);
      eq(s.episodes, heldOutStations * trainingReport.replay.episodesPerPolicy, `${name}: episode count should be heldOutStations * episodesPerPolicy`);
      ok(s.passRate >= 0 && s.passRate <= 1, `${name}: passRate out of range (${s.passRate})`);
      ok(Number.isFinite(s.meanScore), `${name}: meanScore is not finite`);
    }
    ok(trainingReport.replay.perStation.length === heldOutStations, "one replay row expected per held-out station");
  });
} finally {
  // This checker's own scratch folder, deleted whether every check passed or
  // not — see also the process.on("exit") fallback above.
  rmSync(scratch, { recursive: true, force: true });
}

console.log(failures ? `\n${failures} check(s) failed.` : "\nAll dataset-tools checks pass.");
process.exit(failures ? 1 : 0);
