#!/usr/bin/env node
/**
 * Dataset-quality report for a folder written by tools/export_dataset.mjs —
 * every `episodes-*.jsonl` shard plus its manifest.json, read back and
 * checked the way a consumer building a training pipeline actually would:
 * is the schema what the docs promise, is the action space balanced, does
 * the sample actually touch hazards and interruptions, are there duplicate
 * episodes, does an embodied dataset actually carry pose data, and how
 * broadly is the station/step-kind/skill/seed grid covered.
 *
 *     node tools/eval_dataset.mjs <dataset-dir>
 *     node tools/eval_dataset.mjs tools/out/dataset --out tools/out/dataset
 *
 * Writes `<out>/quality-report.json` (everything, as data) and
 * `<out>/QUALITY_REPORT.md` (the same content, read by a person), and prints
 * a one-line summary plus the score. Deterministic: the same dataset always
 * produces the same numbers (the JSON's `generatedAt` timestamp aside).
 *
 * ---------------------------------------------------------------- the score
 *
 * A single 0-100 number, the weighted sum of seven sub-scores, each already
 * scaled to [0, 1] and multiplied by its weight (weights sum to 100 so the
 * total needs no further scaling):
 *
 *   | sub-score            | weight | what it measures                                          |
 *   | --------------------- | ------ | ---------------------------------------------------------- |
 *   | schemaValidity         |   30   | fraction of steps whose shape matches docs/robot-datasets.md |
 *   | actionBalance           |   15   | normalised entropy of action.type over ACTION_CLASSES        |
 *   | hazardCoverage          |   10   | fraction of episodes touching a hazard, against a target rate |
 *   | interruptionCoverage    |   10   | fraction of episodes presented with a live interrupt, against a target rate |
 *   | duplicateRate           |   15   | 1 - (duplicate episodes / total episodes), by the dedupe key below |
 *   | stationDiversity        |   10   | normalised entropy of the episode count across stations present |
 *   | poseTrackPresence       |   10   | fraction of embodied steps that carry a non-null `info.pose` |
 *
 * `score = round(30*schemaValidity + 15*actionBalance + 10*hazardCoverage +
 *                10*interruptionCoverage + 15*duplicateRate +
 *                10*stationDiversity + 10*poseTrackPresence)`, clipped to
 * [0, 100]. See SCORE_WEIGHTS/HAZARD_TARGET_RATE/INTERRUPT_TARGET_RATE below
 * for the exact constants; every sub-score's raw value and contribution is
 * also written into the report so the total is never a black box.
 *
 * ------------------------------------------------------------ the dedupe key
 *
 * Two exported episodes are the same episode if they agree on `source`,
 * `app`, `station`, `skill`, `seed`, `crewTagHash`, the number of steps and
 * the final score — the fields this dataset's schema (docs/robot-datasets.md)
 * documents as stable for a finished episode. This is the same idea as
 * `WebXR/shared/episodes.js`'s `dedupeKeyFor()` (a content-derived key over
 * fields that do not change once an episode has finished, doubled over a
 * reversed hash to cut accidental collisions) adapted to this exported
 * schema, which does not carry `startedAt` at the top level. It is a
 * deduplication key, not a cryptographic identifier.
 */
import { existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { validateFormats } from "./lib/dataset_formats.mjs";
import { join, resolve, basename } from "node:path";

// ------------------------------------------------------------------ vocab
//
// The full action space `WebXR/shared/robot.js`'s `applyAction()` accepts
// (see docs/robot-training.md and docs/robot-datasets.md) — the fixed
// vocabulary action-class balance is measured against, so a dataset that
// only ever uses two of the nine classes is visibly imbalanced rather than
// scored against whatever happened to appear.
export const ACTION_CLASSES = ["select", "commit", "press", "release", "rotate", "drop", "drive", "check", "wait"];
// The step kinds `WebXR/shared/game.js` implements, plus "none" for a step
// index with no live step (session finished) — see docs/robot-training.md.
export const STEP_KINDS = ["select", "sequence", "find", "gauge", "hold", "track", "turn", "drive", "drag", "none"];

/** How often, as a fraction of episodes, this dataset is expected to touch a
 * hazard or a live interruption for full credit on that sub-score — not a
 * claim that every dataset must hit exactly this rate, just the denominator
 * a partial-credit ramp is measured against (see scoreDataset() below). The
 * default sampler's skill ladder (0.3, 0.65, 1) reliably produces more than
 * this once dozens of stations are sampled; a dataset that samples only
 * expert runs will legitimately score lower here, which is the point. */
export const HAZARD_TARGET_RATE = 0.05;
export const INTERRUPT_TARGET_RATE = 0.03;

export const SCORE_WEIGHTS = {
  schemaValidity: 30, actionBalance: 15, hazardCoverage: 10, interruptionCoverage: 10,
  duplicateRate: 15, stationDiversity: 10, poseTrackPresence: 10,
};

// ------------------------------------------------------------------- fnv1a
//
// Same non-cryptographic hash `WebXR/shared/episodes.js` uses for its dedupe
// key, reimplemented here because that module keeps it private — this is a
// deduplication tool, not a claim of shared code with the browser module.
function fnv1a(str) {
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 0x01000193); }
  return (h >>> 0).toString(36);
}
export function dedupeKeyForExported(episode) {
  const basis = [
    episode.source ?? "", episode.app ?? "", episode.station ?? "", episode.skill ?? "", episode.seed ?? "",
    episode.crewTagHash ?? "", (episode.steps ?? []).length, episode.summary?.score ?? "",
  ].join("|");
  return `${fnv1a(basis)}${fnv1a(basis.split("").reverse().join(""))}`;
}

// ------------------------------------------------------------------ maths
function entropy(counts) {
  const total = counts.reduce((n, c) => n + c, 0);
  if (total <= 0) return 0;
  let h = 0;
  for (const c of counts) { if (c <= 0) continue; const p = c / total; h -= p * Math.log2(p); }
  return h;
}
/** Normalised entropy over a fixed-size vocabulary: 0 = every observation in
 * one class, 1 = spread perfectly evenly over every class in `vocabSize`. */
function normalisedEntropy(counts, vocabSize) {
  if (vocabSize <= 1) return 1;
  return entropy(counts) / Math.log2(vocabSize);
}
const clamp01 = (n) => Math.max(0, Math.min(1, n));
const round3 = (n) => Math.round((Number(n) || 0) * 1000) / 1000;

// -------------------------------------------------------------- schema check
//
// What docs/robot-datasets.md promises every step carries, regardless of
// source: observation, action, reward (number), done (boolean), info
// (object). A step failing any of these is counted, not fatal — a quality
// report describes a dataset, it does not refuse to read one.
function validateStep(step, isLast) {
  const issues = [];
  if (!("observation" in step)) issues.push("missing observation");
  if (!("action" in step)) issues.push("missing action");
  if (typeof step.reward !== "number") issues.push("reward is not a number");
  if (typeof step.done !== "boolean") issues.push("done is not a boolean");
  if (!step.info || typeof step.info !== "object") issues.push("missing info");
  if (typeof step.done === "boolean" && step.done !== isLast) {
    issues.push(isLast ? "last step is not marked done" : "a non-last step is marked done");
  }
  return issues;
}
function validateEpisode(ep) {
  const issues = [];
  if (typeof ep.schemaVersion !== "number") issues.push("missing schemaVersion");
  if (ep.source !== "synthetic" && ep.source !== "human") issues.push(`unexpected source ${JSON.stringify(ep.source)}`);
  if (!ep.station) issues.push("missing station");
  if (!Array.isArray(ep.steps) || ep.steps.length === 0) issues.push("no steps");
  return issues;
}

// ------------------------------------------------------------------ reading
function findShardFiles(dir) {
  return readdirSync(dir)
    .filter((f) => f.endsWith(".jsonl"))
    .sort();
}

function readDataset(dir) {
  const manifestPath = join(dir, "manifest.json");
  const manifest = existsSync(manifestPath) ? JSON.parse(readFileSync(manifestPath, "utf8")) : null;
  const files = findShardFiles(dir);
  const episodes = []; // { episode, file, line }
  const parseErrors = [];
  for (const file of files) {
    const text = readFileSync(join(dir, file), "utf8");
    const lines = text.split("\n");
    for (let i = 0; i < lines.length; i++) {
      const raw = lines[i];
      if (!raw.trim()) continue;
      try { episodes.push({ episode: JSON.parse(raw), file, line: i + 1 }); }
      catch (err) { parseErrors.push({ file, line: i + 1, error: err.message }); }
    }
  }
  return { manifest, files, episodes, parseErrors };
}

// --------------------------------------------------------------- the report
function buildReport(dir) {
  const { manifest, files, episodes, parseErrors } = readDataset(dir);
  if (files.length === 0) {
    return { error: `no *.jsonl shard found in ${dir} — is this an tools/export_dataset.mjs output folder?` };
  }

  let totalSteps = 0, invalidSteps = 0, invalidEpisodes = 0;
  const schemaIssues = [];
  const actionCounts = Object.fromEntries(ACTION_CLASSES.map((c) => [c, 0]));
  let otherActionCount = 0;
  const stepKindCounts = Object.fromEntries(STEP_KINDS.map((k) => [k, { episodes: 0, steps: 0 }]));
  let otherStepKindCount = 0;

  // station -> { app, source set, skills: Map(skillLabel -> { episodes, steps, seeds:Set }), hazardEpisodes, interruptEpisodes, episodes, steps }
  const stations = new Map();
  const stationKey = (ep) => `${ep.app ?? "?"}::${ep.station ?? "?"}`;

  let hazardEpisodes = 0, interruptEpisodes = 0;
  let embodiedEpisodes = 0, embodiedStepsWithPose = 0, embodiedStepsTotal = 0;
  const dedupeKeys = new Map(); // key -> [{file,line,station,skill,seed}]

  for (const { episode: ep, file, line } of episodes) {
    const epIssues = validateEpisode(ep);
    if (epIssues.length) { invalidEpisodes += 1; schemaIssues.push({ file, line, issues: epIssues }); }

    const key = stationKey(ep);
    if (!stations.has(key)) {
      stations.set(key, { app: ep.app ?? null, station: ep.station ?? null, episodes: 0, steps: 0, hazardEpisodes: 0, interruptEpisodes: 0, skills: new Map() });
    }
    const st = stations.get(key);
    st.episodes += 1;

    const skillLabel = ep.source === "human" || ep.skill == null ? "human" : String(ep.skill);
    if (!st.skills.has(skillLabel)) st.skills.set(skillLabel, { episodes: 0, steps: 0, seeds: new Set() });
    const sk = st.skills.get(skillLabel);
    sk.episodes += 1;
    if (ep.seed != null) sk.seeds.add(ep.seed);

    const dk = dedupeKeyForExported(ep);
    if (!dedupeKeys.has(dk)) dedupeKeys.set(dk, []);
    dedupeKeys.get(dk).push({ file, line, station: ep.station, app: ep.app, skill: ep.skill, seed: ep.seed });

    if (ep.embodied) embodiedEpisodes += 1;

    let episodeHazard = false, episodeInterrupt = false;
    const seenKinds = new Set();
    const steps = Array.isArray(ep.steps) ? ep.steps : [];
    steps.forEach((step, i) => {
      totalSteps += 1;
      st.steps += 1;
      sk.steps += 1;
      const issues = validateStep(step, i === steps.length - 1);
      if (issues.length) { invalidSteps += 1; schemaIssues.push({ file, line, step: i, issues }); }

      const actionType = step.action?.type;
      if (ACTION_CLASSES.includes(actionType)) actionCounts[actionType] += 1;
      else otherActionCount += 1;

      const kind = step.observation && "kind" in step.observation ? (step.observation.kind ?? "none") : null;
      if (kind != null) {
        seenKinds.add(kind);
        if (STEP_KINDS.includes(kind)) stepKindCounts[kind].steps += 1;
        else otherStepKindCount += 1;
      }

      if (step.info?.hazard) episodeHazard = true;
      if (step.observation?.interrupt) episodeInterrupt = true;

      if (ep.embodied) {
        embodiedStepsTotal += 1;
        if (step.info?.pose != null) embodiedStepsWithPose += 1;
      }
    });
    for (const k of seenKinds) if (STEP_KINDS.includes(k)) stepKindCounts[k].episodes += 1;
    if (episodeHazard) { hazardEpisodes += 1; st.hazardEpisodes += 1; }
    if (episodeInterrupt) { interruptEpisodes += 1; st.interruptEpisodes += 1; }
  }

  const totalEpisodes = episodes.length;
  const duplicateGroups = [...dedupeKeys.values()].filter((g) => g.length > 1);
  const duplicateEpisodeCount = duplicateGroups.reduce((n, g) => n + g.length - 1, 0);

  // ----------------------------------------------------------- sub-scores
  const schemaValidityFrac = totalSteps > 0 ? clamp01(1 - invalidSteps / totalSteps) : 0;
  const actionBalanceFrac = normalisedEntropy(ACTION_CLASSES.map((c) => actionCounts[c]), ACTION_CLASSES.length);
  const hazardRate = totalEpisodes > 0 ? hazardEpisodes / totalEpisodes : 0;
  const interruptRate = totalEpisodes > 0 ? interruptEpisodes / totalEpisodes : 0;
  const hazardCoverageFrac = clamp01(hazardRate / HAZARD_TARGET_RATE);
  const interruptionCoverageFrac = clamp01(interruptRate / INTERRUPT_TARGET_RATE);
  const duplicateRateValue = totalEpisodes > 0 ? duplicateEpisodeCount / totalEpisodes : 0;
  const duplicateRateFrac = clamp01(1 - duplicateRateValue);
  const stationEpisodeCounts = [...stations.values()].map((s) => s.episodes);
  const stationDiversityFrac = stations.size <= 1 ? 1 : normalisedEntropy(stationEpisodeCounts, stations.size);
  const poseTrackPresenceFrac = embodiedStepsTotal > 0 ? clamp01(embodiedStepsWithPose / embodiedStepsTotal) : 1;

  const subScores = {
    schemaValidity: schemaValidityFrac, actionBalance: actionBalanceFrac, hazardCoverage: hazardCoverageFrac,
    interruptionCoverage: interruptionCoverageFrac, duplicateRate: duplicateRateFrac,
    stationDiversity: stationDiversityFrac, poseTrackPresence: poseTrackPresenceFrac,
  };
  const contributions = Object.fromEntries(
    Object.entries(SCORE_WEIGHTS).map(([k, w]) => [k, round3(w * subScores[k])])
  );
  const score = Math.max(0, Math.min(100, Math.round(
    Object.entries(SCORE_WEIGHTS).reduce((n, [k, w]) => n + w * subScores[k], 0)
  )));

  // ------------------------------------------------------------- coverage
  const stationRows = [...stations.values()].map((s) => ({
    app: s.app, station: s.station, episodes: s.episodes, steps: s.steps,
    hazardEpisodes: s.hazardEpisodes, interruptEpisodes: s.interruptEpisodes,
    skills: [...s.skills.entries()].map(([skill, v]) => ({
      skill, episodes: v.episodes, steps: v.steps, distinctSeeds: v.seeds.size,
    })).sort((a, b) => a.skill.localeCompare(b.skill)),
  })).sort((a, b) => (a.app + a.station).localeCompare(b.app + b.station));

  const expectedSeeds = manifest?.args?.seeds ?? null;
  const incompleteCells = expectedSeeds
    ? stationRows.flatMap((s) => s.skills.filter((sk) => sk.skill !== "human" && sk.distinctSeeds < expectedSeeds)
        .map((sk) => ({ app: s.app, station: s.station, skill: sk.skill, distinctSeeds: sk.distinctSeeds, expectedSeeds })))
    : [];

  const stepKindRows = STEP_KINDS.map((k) => ({ kind: k, episodes: stepKindCounts[k].episodes, steps: stepKindCounts[k].steps }))
    .filter((r) => r.steps > 0 || r.episodes > 0);

  return {
    schemaVersion: 1,
    generatedAt: new Date().toISOString(),
    datasetDir: resolve(dir),
    files,
    manifestPresent: !!manifest,
    totals: { episodes: totalEpisodes, steps: totalSteps, stations: stations.size, embodiedEpisodes },
    score,
    scoreFormula: "score = round(sum(weight_i * subScore_i)), weights sum to 100 — see SCORE_WEIGHTS and each sub-score's own comment in tools/eval_dataset.mjs",
    weights: SCORE_WEIGHTS,
    subScores: Object.fromEntries(Object.entries(subScores).map(([k, v]) => [k, round3(v)])),
    contributions,
    coverage: {
      stations: stationRows,
      stepKinds: stepKindRows,
      incompleteSkillSeedCells: incompleteCells,
      otherStepKindSteps: otherStepKindCount,
    },
    actionBalance: {
      counts: actionCounts, otherCount: otherActionCount,
      normalisedEntropy: round3(actionBalanceFrac),
      classes: ACTION_CLASSES,
    },
    hazardCoverage: { episodes: hazardEpisodes, rate: round3(hazardRate), targetRate: HAZARD_TARGET_RATE },
    interruptionCoverage: { episodes: interruptEpisodes, rate: round3(interruptRate), targetRate: INTERRUPT_TARGET_RATE },
    duplicates: {
      duplicateEpisodeCount, duplicateRate: round3(duplicateRateValue),
      groups: duplicateGroups.slice(0, 20).map((g) => g.map((e) => ({ file: e.file, line: e.line, app: e.app, station: e.station, skill: e.skill, seed: e.seed }))),
      truncated: duplicateGroups.length > 20,
    },
    poseTrack: {
      embodiedEpisodes, embodiedSteps: embodiedStepsTotal, stepsWithPose: embodiedStepsWithPose,
      presenceRate: embodiedStepsTotal > 0 ? round3(poseTrackPresenceFrac) : null,
      note: embodiedStepsTotal > 0 ? null : "no embodied episodes in this dataset — sub-score defaults to full credit",
    },
    schemaValidity: {
      totalSteps, invalidSteps, invalidEpisodes, parseErrors,
      issues: schemaIssues.slice(0, 20), issuesTruncated: schemaIssues.length > 20,
    },
    // The LeRobot-style and RLDS-style layouts, checked structurally (see
    // tools/lib/dataset_formats.mjs validateFormats()). Reported, not scored:
    // the score above describes the episodes, which both layouts share.
    formats: validateFormats(dir),
  };
}

// -------------------------------------------------------------- markdown
function toMarkdown(report) {
  if (report.error) return `# Dataset quality report\n\n**Error:** ${report.error}\n`;
  const pct = (n) => `${Math.round(n * 100)}%`;
  const lines = [];
  lines.push(`# Dataset quality report`);
  lines.push("");
  lines.push(`Generated ${report.generatedAt} from \`${report.datasetDir}\`.`);
  lines.push("");
  lines.push(`## Score: ${report.score} / 100`);
  lines.push("");
  lines.push(`| sub-score | value | weight | contribution |`);
  lines.push(`| --- | --- | --- | --- |`);
  for (const [k, w] of Object.entries(report.weights)) {
    lines.push(`| ${k} | ${pct(report.subScores[k])} | ${w} | ${report.contributions[k]} |`);
  }
  lines.push("");
  lines.push(`\`${report.scoreFormula}\``);
  lines.push("");
  lines.push(`## Totals`);
  lines.push("");
  lines.push(`${report.totals.episodes} episode(s), ${report.totals.steps} step(s), ${report.totals.stations} station(s), ${report.totals.embodiedEpisodes} embodied episode(s), across ${report.files.length} shard(s): ${report.files.map((f) => `\`${f}\``).join(", ")}.`);
  lines.push("");
  lines.push(`## Coverage — per station / skill / seed`);
  lines.push("");
  lines.push(`| app | station | episodes | steps | hazard ep. | interrupt ep. | skills (episodes, distinct seeds) |`);
  lines.push(`| --- | --- | --- | --- | --- | --- | --- |`);
  for (const s of report.coverage.stations) {
    const skillsCell = s.skills.map((sk) => `${sk.skill}: ${sk.episodes}ep/${sk.distinctSeeds}seed`).join("; ");
    lines.push(`| ${s.app} | ${s.station} | ${s.episodes} | ${s.steps} | ${s.hazardEpisodes} | ${s.interruptEpisodes} | ${skillsCell} |`);
  }
  if (report.coverage.incompleteSkillSeedCells.length) {
    lines.push("");
    lines.push(`**Incomplete station/skill cells** (fewer seeds than \`manifest.args.seeds\`):`);
    for (const c of report.coverage.incompleteSkillSeedCells) lines.push(`- ${c.app}/${c.station} @ skill ${c.skill}: ${c.distinctSeeds}/${c.expectedSeeds} seed(s)`);
  }
  lines.push("");
  lines.push(`## Coverage — per step kind`);
  lines.push("");
  lines.push(`| kind | episodes containing it | steps |`);
  lines.push(`| --- | --- | --- |`);
  for (const r of report.coverage.stepKinds) lines.push(`| ${r.kind} | ${r.episodes} | ${r.steps} |`);
  lines.push("");
  lines.push(`## Action-class balance`);
  lines.push("");
  lines.push(`Normalised entropy over the ${report.actionBalance.classes.length} documented action classes: **${report.actionBalance.normalisedEntropy}** (1.0 = perfectly even).`);
  lines.push("");
  lines.push(`| action class | count |`);
  lines.push(`| --- | --- |`);
  for (const c of report.actionBalance.classes) lines.push(`| ${c} | ${report.actionBalance.counts[c]} |`);
  if (report.actionBalance.otherCount) lines.push(`| (other/unrecognised) | ${report.actionBalance.otherCount} |`);
  lines.push("");
  lines.push(`## Hazard and interruption coverage`);
  lines.push("");
  lines.push(`- Hazard: ${report.hazardCoverage.episodes} episode(s) touched a hazard (${pct(report.hazardCoverage.rate)}, target ${pct(report.hazardCoverage.targetRate)}).`);
  lines.push(`- Interruption: ${report.interruptionCoverage.episodes} episode(s) were presented with a live interrupt (${pct(report.interruptionCoverage.rate)}, target ${pct(report.interruptionCoverage.targetRate)}).`);
  lines.push("");
  lines.push(`## Duplicate-episode rate`);
  lines.push("");
  lines.push(`${report.duplicates.duplicateEpisodeCount} duplicate episode(s) out of ${report.totals.episodes} (${pct(report.duplicates.duplicateRate)}), by the dedupe key documented at the top of \`tools/eval_dataset.mjs\`.`);
  if (report.duplicates.groups.length) {
    lines.push("");
    lines.push("Example duplicate group(s):");
    for (const g of report.duplicates.groups.slice(0, 5)) lines.push(`- ${g.map((e) => `${e.file}:${e.line}`).join(" = ")}`);
  }
  lines.push("");
  lines.push(`## Pose-track presence`);
  lines.push("");
  lines.push(report.poseTrack.note ?? `${report.poseTrack.stepsWithPose}/${report.poseTrack.embodiedSteps} embodied step(s) carry a pose (${pct(report.poseTrack.presenceRate)}).`);
  lines.push("");
  lines.push(`## Schema validity`);
  lines.push("");
  lines.push(`${report.schemaValidity.invalidSteps}/${report.schemaValidity.totalSteps} step(s) failed a schema check; ${report.schemaValidity.invalidEpisodes} episode(s) had an episode-level issue; ${report.schemaValidity.parseErrors.length} line(s) failed to parse as JSON.`);
  if (report.schemaValidity.issues.length) {
    lines.push("");
    lines.push("First issue(s):");
    for (const i of report.schemaValidity.issues.slice(0, 10)) lines.push(`- ${i.file}:${i.line}${"step" in i ? ` step ${i.step}` : ""} — ${i.issues.join("; ")}`);
  }
  lines.push("");
  lines.push(`## Other layouts`);
  lines.push("");
  for (const [name, f] of Object.entries(report.formats ?? {})) {
    lines.push(f.present
      ? `- \`${name}/\` — ${f.episodes} episode(s), ${name === "lerobot" ? `${f.frames} frame(s)` : `${f.steps} step(s)`}; ${f.valid ? "structurally valid" : `${f.issueCount} issue(s): ${f.issues.slice(0, 5).join("; ")}`}`
      : `- \`${name}/\` — not present`);
  }
  lines.push("");
  lines.push(`## What this is not`);
  lines.push("");
  lines.push(`This report describes the *shape and spread* of a dataset — schema, balance, coverage, duplication. It says nothing about whether a model trained on it will behave well; see \`tools/train_baseline.mjs\` and its \`MODEL_CARD.md\` for that question, and \`docs/robot-datasets.md\` for what this dataset does and does not claim about certification.`);
  lines.push("");
  return lines.join("\n");
}

// ------------------------------------------------------------------- main
const args = process.argv.slice(2);
const positional = args.find((a) => !a.startsWith("--"));
const opt = (name, dflt) => { const i = args.indexOf(`--${name}`); return i >= 0 && args[i + 1] && !args[i + 1].startsWith("--") ? args[i + 1] : dflt; };

if (!positional) {
  console.error("usage: node tools/eval_dataset.mjs <dataset-dir> [--out <dir>]");
  process.exit(1);
}
const datasetDir = resolve(positional);
if (!existsSync(datasetDir) || !statSync(datasetDir).isDirectory()) {
  console.error(`not a directory: ${datasetDir}`);
  process.exit(1);
}
const outDir = resolve(opt("out", datasetDir));
mkdirSync(outDir, { recursive: true });

const report = buildReport(datasetDir);
writeFileSync(join(outDir, "quality-report.json"), JSON.stringify(report, null, 2));
writeFileSync(join(outDir, "QUALITY_REPORT.md"), toMarkdown(report));

if (report.error) {
  console.error(report.error);
  process.exit(1);
}
console.log(`${basename(datasetDir)} — ${report.totals.episodes} episode(s), ${report.totals.steps} step(s), ${report.totals.stations} station(s)`);
console.log(`Quality score: ${report.score}/100`);
for (const [k, w] of Object.entries(report.weights)) {
  console.log(`  ${k.padEnd(22)} ${(report.subScores[k]).toFixed(3)}  (x${w} = ${report.contributions[k].toFixed(1)})`);
}
for (const [name, f] of Object.entries(report.formats)) {
  console.log(`  ${name.padEnd(22)} ${f.present ? `${f.episodes} episode(s), ${f.frames ?? f.steps} row(s), ${f.valid ? "valid" : `${f.issueCount} issue(s)`}` : "not present"}`);
}
console.log(`Wrote ${join(outDir, "quality-report.json")} and ${join(outDir, "QUALITY_REPORT.md")}`);
