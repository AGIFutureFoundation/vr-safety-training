#!/usr/bin/env node
/**
 * A small behaviour-cloning baseline trained on a tools/export_dataset.mjs
 * folder: featurise every step's `observation`, fit a multinomial logistic-
 * regression policy over the action classes with mini-batch gradient
 * descent, hold out 20% of episodes *by station*, report top-1/top-3 action
 * accuracy, then replay the learned policy through the real procedure engine
 * headlessly (the same suite loader tools/robot_train.mjs uses) on the
 * held-out stations and compare its pass rate and mean score against the
 * scripted expert (skill 1) and novice (skill 0) policies from
 * WebXR/shared/robot.js.
 *
 *     node tools/train_baseline.mjs tools/out/dataset --out tools/out/baseline
 *     node tools/train_baseline.mjs tools/out/dataset --out /tmp/b --epochs 10 --limit 2000
 *
 * No external dependencies — plain Node, the same headless machinery every
 * other tool in this folder already uses.
 *
 * Writes:
 *   <out>/weights.json      the trained model, feature spec and vocab — see
 *                           WEIGHTS_LAYOUT below for the exact shape
 *   <out>/training-report.json / .md   accuracy per step kind and per
 *                           station, plus the replay comparison
 *   <out>/MODEL_CARD.md     intended use, architecture, data, limitations —
 *                           a research baseline, not a certification
 *
 * -------------------------------------------------------------- featurising
 *
 * Every step's `observation` (docs/robot-datasets.md's field of that name;
 * `WebXR/shared/robot.js`'s `observe()`, or, embodied, `robot-embodiment.js`'s
 * `observeEmbodied()`) becomes one fixed-length numeric vector, three parts
 * concatenated:
 *
 *   1. OBS_NUMERIC_FEATURES (below) — a fixed, documented set of scalars
 *      pulled from whichever of the observation's optional sub-objects
 *      (gauge/track/hold/turn/drive/interrupt/keepOut) the current step kind
 *      populates, each defaulting to 0 when that sub-object is absent. This
 *      is deliberately its own thing, not `WebXR/shared/episodes.js`'s
 *      per-*episode* `sessionDigest()` (that one summarises a whole finished
 *      run; this one summarises one decision's observation).
 *   2. a one-hot over KIND_VOCAB — which step kind this decision was made
 *      under (`WebXR/shared/game.js`'s nine step kinds, plus "none" for no
 *      live step and "other" as a catch-all).
 *   3. a hashed bag of interactable ids over HASH_BUCKETS buckets — built
 *      from `observation.interactables` when present (the live recorder adds
 *      this field; see docs/robot-datasets.md), falling back to
 *      `observation.targets` (present on every step from every source) so a
 *      synthetic episode's observation, which does not carry
 *      `interactables`, still contributes something to this part of the
 *      vector rather than an all-zero block.
 *
 * ------------------------------------------------------------------- model
 *
 * Multinomial logistic regression: `logits = x·W + b`, softmax, cross-entropy
 * loss, mini-batch gradient descent (BATCH_SIZE examples per step, a fixed
 * decaying learning rate, small L2 — see the constants below). This predicts
 * an *action class* (docs/robot-datasets.md's `action.type`), not the full
 * action (an id, a gauge `at`, a rotate `delta`, …) — see "replaying the
 * policy" below and MODEL_CARD.md's limitations for what that does and does
 * not mean for the replay numbers.
 *
 * -------------------------------------------------------------- the split
 *
 * Held out *by station*, not by episode, so the reported accuracy says
 * something about a station the model never trained on: every distinct
 * `app/station` pair is sorted lexicographically, and `round(0.2 * N)`
 * (at least 1, if there are at least 2 stations) are picked evenly spaced
 * through that sorted list — the same evenly-spaced-by-index idea
 * `tools/export_dataset.mjs`'s `sample()` uses for picking stations,
 * reused here so the split is deterministic without needing a shared seed.
 *
 * -------------------------------------------------------- replaying the policy
 *
 * The classifier only names an action's *class*; running it against the real
 * engine still needs a concrete action (an id, a gauge value, a rotate
 * delta, …). `LearnedAgent` fills those in with the same simple, fixed rules
 * for every step kind (the step's own single valid target where there is
 * only one, the green band's centre for a gauge commit, a fixed small
 * rotate/drop, `WebXR/shared/game.js`'s `drivePolicy` at a fixed moderate
 * skill for a drive step) — what the classifier actually decides is *when*
 * to press/release/wait/commit/select at all, most visibly on hold, track,
 * gauge and interruption steps, where more than one class is a live option.
 * This is a baseline for whether a station's procedure was learned in
 * outline, not a fine-motor controller — MODEL_CARD.md says so directly.
 */
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join, resolve, basename } from "node:path";
import { fileURLToPath } from "node:url";
import { loadSmartCity, loadTrades } from "./lib/headless.mjs";

// ------------------------------------------------------------------ vocab
export const ACTION_CLASSES = ["select", "commit", "press", "release", "rotate", "drop", "drive", "check", "wait"];
export const KIND_VOCAB = ["select", "sequence", "find", "gauge", "hold", "track", "turn", "drive", "drag", "none", "other"];
export const HASH_BUCKETS = 16;
export const OBS_NUMERIC_FEATURES = [
  "stepIndexNorm", "hasInterrupt", "interruptLeftNorm", "remainingFrac", "anyOrder",
  "gaugeT", "gaugeInBand", "gaugeCommitted",
  "trackV", "trackInBand", "trackHolding",
  "holdRatio", "holding",
  "turnRatio",
  "driveSpeedNorm", "driveOffsetAbs", "driveCurvature", "driveReverse",
  "scoreNorm", "streakNorm", "errorsNorm", "hazardHitsNorm", "elapsedNorm",
  "forceNorm", "noRobot",
  "keepOutZonesNorm", "keepOutInside", "keepOutClearanceNorm",
];
export const FEATURE_DIM = OBS_NUMERIC_FEATURES.length + KIND_VOCAB.length + HASH_BUCKETS;

// ------------------------------------------------------------- hyperparameters
const BATCH_SIZE = 64;
const BASE_LR = 0.5;
const LR_DECAY = 0.03; // lr(epoch) = BASE_LR / (1 + LR_DECAY * epoch)
const L2 = 1e-4;
const SHUFFLE_SEED = 42;
const REPLAY_EPISODES = 5; // per held-out station, per policy

// -------------------------------------------------------------------- fnv1a
function fnv1a(str) {
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 0x01000193); }
  return h >>> 0;
}
/** Deterministic PRNG (mulberry32) — same algorithm WebXR/shared/robot.js's
 * `rng()` uses, reimplemented here since it is not part of the headless
 * suite's exported surface, only for shuffling batches and for the fixed
 * moderate-skill fallback drivePolicy() call during replay. */
function mulberry32(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ------------------------------------------------------------- featurising
function inBand(v, band) { if (!band || v == null) return 0; const [lo, hi] = band; return v >= lo && v <= hi ? 1 : 0; }

export function numericFeatures(obs) {
  const o = obs || {};
  const gauge = o.gauge, track = o.track, hold = o.hold, turn = o.turn, drive = o.drive, interrupt = o.interrupt, keepOut = o.keepOut;
  const targetsLen = Array.isArray(o.targets) ? o.targets.length : (o.targets ? 1 : 0);
  const remainingLen = Array.isArray(o.remaining) ? o.remaining.length : 0;
  const forceMap = { none: 0, light: 0.5, firm: 1 };
  return [
    Math.min(1, (o.stepIndex ?? 0) / 50),
    interrupt ? 1 : 0,
    interrupt ? Math.min(1, (interrupt.left ?? 0) / 15) : 0,
    targetsLen > 0 ? remainingLen / targetsLen : 0,
    o.anyOrder ? 1 : 0,
    gauge ? gauge.t : 0,
    gauge ? inBand(gauge.t, gauge.green) : 0,
    gauge?.committed ? 1 : 0,
    track ? track.v : 0,
    track ? Math.min(1, track.inBand) : 0,
    track?.holding ? 1 : 0,
    hold && hold.seconds ? Math.min(1, hold.holdFor / hold.seconds) : 0,
    (hold?.holding || track?.holding) ? 1 : 0,
    turn && turn.required ? Math.min(1, turn.amount / turn.required) : 0,
    drive ? Math.min(1, (drive.speed ?? 0) / 20) : 0,
    drive ? Math.min(1, Math.abs(drive.offset ?? 0)) : 0,
    drive ? Math.min(1, Math.abs(drive.curvature ?? 0)) : 0,
    drive?.reverse ? 1 : 0,
    Math.min(1, (o.score ?? 0) / 2000),
    Math.min(1, (o.streak ?? 0) / 10),
    Math.min(1, (o.errors ?? 0) / 10),
    Math.min(1, (o.hazardHits ?? 0) / 5),
    Math.min(1, (o.elapsed ?? 0) / 120),
    o.maxForce != null ? (forceMap[o.maxForce] ?? 0) : 0,
    o.noRobot ? 1 : 0,
    keepOut ? Math.min(1, (keepOut.zones ?? 0) / 5) : 0,
    keepOut?.inside ? 1 : 0,
    keepOut?.nearest ? Math.min(1, keepOut.nearest.clearance ?? 1) : 1,
  ];
}
function oneHotKind(kind) {
  const v = new Array(KIND_VOCAB.length).fill(0);
  const label = kind == null ? "none" : kind;
  const idx = KIND_VOCAB.indexOf(label);
  v[idx >= 0 ? idx : KIND_VOCAB.length - 1] = 1;
  return v;
}
function hashedBag(ids) {
  const v = new Array(HASH_BUCKETS).fill(0);
  if (!ids || !ids.length) return v;
  for (const id of ids) v[fnv1a(String(id)) % HASH_BUCKETS] += 1;
  return v.map((n) => n / ids.length);
}
export function featurize(obs) {
  const o = obs || {};
  const ids = o.interactables ?? o.targets ?? [];
  return [...numericFeatures(o), ...oneHotKind(o.kind), ...hashedBag(Array.isArray(ids) ? ids : [ids])];
}

// ---------------------------------------------------------------- the model
function softmax(logits) {
  const m = Math.max(...logits);
  const exps = logits.map((v) => Math.exp(v - m));
  const s = exps.reduce((a, b) => a + b, 0) || 1;
  return exps.map((v) => v / s);
}
/** W is FEATURE_DIM rows x K columns (K = ACTION_CLASSES.length), row-major
 * as a flat Float64Array indexed [d * K + k] — documented in weights.json's
 * own `layout` field. */
function makeModel(dim, k) { return { dim, k, W: new Float64Array(dim * k), b: new Float64Array(k) }; }
function logitsFor(model, x) {
  const { W, b, k, dim } = model;
  const out = new Array(k).fill(0);
  for (let d = 0; d < dim; d++) { const xd = x[d]; if (!xd) continue; for (let c = 0; c < k; c++) out[c] += xd * W[d * k + c]; }
  for (let c = 0; c < k; c++) out[c] += b[c];
  return out;
}
export function predictProbs(model, x) { return softmax(logitsFor(model, x)); }

function trainModel(examples, { epochs, dim, k }) {
  const model = makeModel(dim, k);
  const n = examples.length;
  const rand = mulberry32(SHUFFLE_SEED);
  const order = Array.from({ length: n }, (_, i) => i);
  const lossHistory = [];
  for (let epoch = 0; epoch < epochs; epoch++) {
    // Fisher-Yates with the deterministic PRNG — same order every run for a
    // given SHUFFLE_SEED and epoch count.
    for (let i = order.length - 1; i > 0; i--) { const j = Math.floor(rand() * (i + 1)); [order[i], order[j]] = [order[j], order[i]]; }
    const lr = BASE_LR / (1 + LR_DECAY * epoch);
    let epochLoss = 0;
    for (let bStart = 0; bStart < n; bStart += BATCH_SIZE) {
      const batchIdx = order.slice(bStart, bStart + BATCH_SIZE);
      const gradW = new Float64Array(dim * k), gradB = new Float64Array(k);
      for (const idx of batchIdx) {
        const { x, y } = examples[idx];
        const probs = predictProbs(model, x);
        epochLoss += -Math.log(Math.max(1e-9, probs[y]));
        for (let c = 0; c < k; c++) {
          const err = probs[c] - (c === y ? 1 : 0);
          gradB[c] += err;
          for (let d = 0; d < dim; d++) { const xd = x[d]; if (xd) gradW[d * k + c] += err * xd; }
        }
      }
      const m = batchIdx.length;
      for (let d = 0; d < dim; d++) for (let c = 0; c < k; c++) {
        const g = gradW[d * k + c] / m + L2 * model.W[d * k + c];
        model.W[d * k + c] -= lr * g;
      }
      for (let c = 0; c < k; c++) model.b[c] -= lr * (gradB[c] / m);
    }
    lossHistory.push({ epoch, meanLoss: +(epochLoss / n).toFixed(4), lr: +lr.toFixed(4) });
  }
  return { model, lossHistory };
}

function serializeModel(model) { return { W: Array.from(model.W), b: Array.from(model.b) }; }
/** The inverse of serializeModel() — the round-trip tools/check_dataset_tools.mjs
 * exercises: weights.json's `model` field back into the {dim, k, W, b} shape
 * predictProbs()/logitsFor() expect. */
export function deserializeModel(dim, k, obj) { return { dim, k, W: Float64Array.from(obj.W), b: Float64Array.from(obj.b) }; }

// ---------------------------------------------------------------- accuracy
function topK(probs, k) {
  return probs.map((p, i) => [p, i]).sort((a, b) => b[0] - a[0]).slice(0, k).map(([, i]) => i);
}
function accuracyBucket() { return { n: 0, top1: 0, top3: 0 }; }
function addHit(bucket, model, x, y) {
  bucket.n += 1;
  const probs = predictProbs(model, x);
  const t3 = topK(probs, 3);
  if (t3[0] === y) bucket.top1 += 1;
  if (t3.includes(y)) bucket.top3 += 1;
}
function finalizeBucket(b) { return { n: b.n, top1: b.n ? +(b.top1 / b.n).toFixed(4) : null, top3: b.n ? +(b.top3 / b.n).toFixed(4) : null }; }

// --------------------------------------------------------------- reading data
function findShardFiles(dir) { return readdirSync(dir).filter((f) => f.endsWith(".jsonl")).sort(); }
function readEpisodes(dir) {
  const episodes = [];
  for (const file of findShardFiles(dir)) {
    for (const line of readFileSync(join(dir, file), "utf8").split("\n")) {
      if (!line.trim()) continue;
      try { episodes.push(JSON.parse(line)); } catch { /* eval_dataset.mjs reports parse errors; a trainer just skips them */ }
    }
  }
  return episodes;
}

/** Evenly-spaced ~20% of a sorted list of station keys, deterministic, no
 * shared seed — see "the split" in the header comment. */
function pickHoldout(stationKeys) {
  const sorted = [...stationKeys].sort();
  const n = sorted.length;
  if (n < 2) return { train: sorted, test: [] };
  const testCount = Math.max(1, Math.round(n * 0.2));
  const step = n / testCount;
  const testSet = new Set();
  for (let i = 0; i < testCount; i++) testSet.add(sorted[Math.min(n - 1, Math.floor(i * step))]);
  return { train: sorted.filter((s) => !testSet.has(s)), test: sorted.filter((s) => testSet.has(s)) };
}

// -------------------------------------------------------------- replay agent
/** Fills in a concrete action for a predicted action class — see "replaying
 * the policy" in the header comment for what is and is not learned here. */
function fillAction(cls, step, session, suite, driveRand) {
  const alarm = session.activeInterrupt;
  if (!step) return { type: "wait" };
  if (alarm) return cls === "wait" ? { type: "wait" } : { type: "select", id: alarm.target };
  switch (step.kind) {
    case "select": return { type: "select", id: step.target };
    case "sequence": case "find": {
      const remaining = step.targets.filter((t) => !session.sequence.includes(t));
      return remaining.length ? { type: "select", id: remaining[0] } : { type: "wait" };
    }
    case "gauge": {
      if (!session.gauge || session.gauge.committed) return { type: "wait" };
      if (cls === "wait") return { type: "wait" };
      const [lo, hi] = session.gauge.green;
      return { type: "commit", id: step.target, at: (lo + hi) / 2 };
    }
    case "hold": {
      if (!session.holding) return cls === "wait" ? { type: "wait" } : { type: "press", id: step.target };
      return cls === "release" ? { type: "release" } : { type: "wait" };
    }
    case "track": {
      if (session.holding) return cls === "release" ? { type: "release" } : { type: "wait" };
      return cls === "press" ? { type: "press", id: step.target } : { type: "wait" };
    }
    case "turn": return { type: "rotate", id: step.target, delta: 0.3 };
    case "drag": return { type: "drop", id: step.target, distance: 0.05 };
    case "drive": {
      const a = suite.drivePolicy(session, { skill: 0.7, random: driveRand });
      return { type: "drive", throttle: +a.throttle.toFixed(3), steer: +a.steer.toFixed(3), check: a.check };
    }
    default: return { type: "wait" };
  }
}

class LearnedAgent {
  constructor(model, { embodied, room, api, suite }) {
    this.model = model; this.embodied = embodied; this.room = room; this.api = api; this.suite = suite;
    this.driveRand = mulberry32(SHUFFLE_SEED);
  }
  observation(session) {
    return this.embodied ? this.suite.observeEmbodied(session, this.api, { room: this.room }) : this.suite.observe(session);
  }
  act(session) {
    const obs = this.observation(session);
    this._lastObs = obs;
    const probs = predictProbs(this.model, featurize(obs));
    const cls = ACTION_CLASSES[topK(probs, 1)[0]];
    return fillAction(cls, session.step, session, this.suite, this.driveRand);
  }
}

/** One episode with any agent exposing `.act(session)` — mirrors
 * WebXR/shared/robot.js's runEpisode()/robot-embodiment.js's
 * runEmbodiedEpisode() loop closely enough to report the same summary
 * shape, but generic over the agent so a LearnedAgent can be dropped in
 * where those two hard-code a RobotAgent. Keep-out violations are
 * approximated from the *observation's own* keepOut account for the step's
 * primary target (what observeEmbodied() already computes) rather than
 * recomputed for the exact id acted on — see MODEL_CARD.md's limitations. */
function runWithAgent(suite, room, api, agent, { embodied, dt = 0.05, maxTicks = 20000 } = {}) {
  const session = new suite.Session(room, {});
  session.start();
  let ticks = 0, violations = 0;
  while (!session.finished && ticks < maxTicks) {
    const action = agent.act(session);
    if (embodied && agent._lastObs?.keepOut?.inside && !agent._lastObs.keepOut.authorised && action.type !== "wait") violations += 1;
    suite.applyAction(session, action);
    session.tick(dt);
    try { api.animate?.(ticks * dt, dt, session); } catch { /* cosmetics only */ }
    ticks += 1;
  }
  return {
    finished: session.finished, score: session.score, stars: session.stars, errors: session.errors,
    hazardHits: session.hazardHits, seconds: +session.elapsed.toFixed(1),
    passed: session.finished && session.stars >= 2 && session.hazardHits === 0 && (!embodied || violations === 0),
    keepOutViolations: embodied ? violations : null,
  };
}

function summarizeRuns(runs) {
  const n = runs.length || 1;
  return {
    episodes: runs.length,
    passRate: +(runs.filter((r) => r.passed).length / n).toFixed(3),
    meanScore: Math.round(runs.reduce((s, r) => s + r.score, 0) / n),
    meanHazardHits: +(runs.reduce((s, r) => s + r.hazardHits, 0) / n).toFixed(2),
  };
}

// ------------------------------------------------------------------- main
async function main() {
  const args = process.argv.slice(2);
  const positional = args.find((a) => !a.startsWith("--"));
  const opt = (name, dflt) => { const i = args.indexOf(`--${name}`); return i >= 0 && args[i + 1] && !args[i + 1].startsWith("--") ? args[i + 1] : dflt; };
  if (!positional) { console.error("usage: node tools/train_baseline.mjs <dataset-dir> --out <dir> [--epochs N] [--limit N]"); process.exit(1); }
  const datasetDir = resolve(positional);
  if (!existsSync(datasetDir)) { console.error(`no such directory: ${datasetDir}`); process.exit(1); }
  const outDir = resolve(opt("out", join(datasetDir, "baseline")));
  const epochs = Math.max(1, +opt("epochs", 25));
  const limit = Math.max(1, +opt("limit", 100000));
  mkdirSync(outDir, { recursive: true });

  const manifestPath = join(datasetDir, "manifest.json");
  const manifest = existsSync(manifestPath) ? JSON.parse(readFileSync(manifestPath, "utf8")) : null;
  const episodes = readEpisodes(datasetDir);
  if (!episodes.length) { console.error(`no episodes found under ${datasetDir} — run tools/export_dataset.mjs first`); process.exit(1); }
  console.log(`Loaded ${episodes.length} episode(s) from ${datasetDir}`);

  // ------------------------------------------------------------- examples
  const examples = []; // { x, y, kind, stationKey, app, station }
  let skippedActions = 0;
  const stationKeys = new Set();
  for (const ep of episodes) {
    const stationKey = `${ep.app ?? "?"}/${ep.station ?? "?"}`;
    stationKeys.add(stationKey);
    for (const step of ep.steps ?? []) {
      const type = step.action?.type;
      const yi = ACTION_CLASSES.indexOf(type);
      if (yi < 0) { skippedActions += 1; continue; }
      examples.push({ x: featurize(step.observation), y: yi, kind: step.observation?.kind ?? "none", stationKey, app: ep.app, station: ep.station });
    }
  }
  console.log(`${examples.length} step(s) usable as training examples (${skippedActions} skipped: unrecognised action.type), across ${stationKeys.size} station(s)`);

  const { train: trainStations, test: testStations } = pickHoldout([...stationKeys]);
  const trainSet = new Set(trainStations), testSet = new Set(testStations);
  let trainExamples = examples.filter((e) => trainSet.has(e.stationKey));
  const testExamples = examples.filter((e) => testSet.has(e.stationKey));
  console.log(`Held out ${testStations.length}/${stationKeys.size} station(s) for evaluation: ${testStations.join(", ") || "(none — too few stations to hold any out)"}`);

  // Deterministic, evenly-spaced downsample of the *training* set only, so
  // --limit never touches the held-out evaluation.
  if (trainExamples.length > limit) {
    const step = trainExamples.length / limit;
    const picked = [];
    for (let i = 0; i < limit; i++) picked.push(trainExamples[Math.min(trainExamples.length - 1, Math.floor(i * step))]);
    trainExamples = picked;
    console.log(`--limit ${limit}: downsampled training examples to ${trainExamples.length}`);
  }

  // ------------------------------------------------------------- training
  const started = Date.now();
  const { model, lossHistory } = trainModel(trainExamples, { epochs, dim: FEATURE_DIM, k: ACTION_CLASSES.length });
  console.log(`Trained ${epochs} epoch(s) on ${trainExamples.length} example(s) in ${((Date.now() - started) / 1000).toFixed(1)}s — final mean loss ${lossHistory.at(-1)?.meanLoss}`);

  // ------------------------------------------------------------- accuracy
  function accuracyReport(set) {
    const overall = accuracyBucket();
    const perKind = new Map(), perStation = new Map();
    for (const e of set) {
      addHit(overall, model, e.x, e.y);
      if (!perKind.has(e.kind)) perKind.set(e.kind, accuracyBucket());
      addHit(perKind.get(e.kind), model, e.x, e.y);
      if (!perStation.has(e.stationKey)) perStation.set(e.stationKey, accuracyBucket());
      addHit(perStation.get(e.stationKey), model, e.x, e.y);
    }
    return {
      overall: finalizeBucket(overall),
      perKind: Object.fromEntries([...perKind.entries()].sort().map(([k, b]) => [k, finalizeBucket(b)])),
      perStation: Object.fromEntries([...perStation.entries()].sort().map(([k, b]) => [k, finalizeBucket(b)])),
    };
  }
  const trainAccuracy = accuracyReport(trainExamples);
  const testAccuracy = accuracyReport(testExamples);
  console.log(`Test accuracy — top-1 ${testAccuracy.overall.top1} / top-3 ${testAccuracy.overall.top3} (n=${testAccuracy.overall.n})`);

  // ---------------------------------------------------------------- weights
  const weightsPath = join(outDir, "weights.json");
  const weights = {
    schemaVersion: 1, trainedAt: new Date().toISOString(), datasetDir,
    layout: "W is featureDim rows x actionClasses.length columns, flattened row-major: logit[k] = b[k] + sum_d(x[d] * W[d*K + k]). Rebuild with numericFeatures()/oneHotKind()/hashedBag() from tools/train_baseline.mjs (KIND_VOCAB order, HASH_BUCKETS count) to reproduce x.",
    featureDim: FEATURE_DIM, numericFeatures: OBS_NUMERIC_FEATURES, kindVocab: KIND_VOCAB, hashBuckets: HASH_BUCKETS,
    actionClasses: ACTION_CLASSES,
    trainStations, testStations,
    hyperparameters: { epochs, limit, batchSize: BATCH_SIZE, baseLr: BASE_LR, lrDecay: LR_DECAY, l2: L2, shuffleSeed: SHUFFLE_SEED },
    model: serializeModel(model),
  };
  writeFileSync(weightsPath, JSON.stringify(weights));
  console.log(`Wrote ${weightsPath}`);

  // ----------------------------------------------------------------- replay
  console.log(`\nReplaying learned/expert/novice policies on ${testStations.length} held-out station(s), ${REPLAY_EPISODES} episode(s) each...`);
  const embodied = !!manifest?.args?.embodied;
  const byApp = new Map();
  for (const key of testStations) { const [app, ...rest] = key.split("/"); if (!byApp.has(app)) byApp.set(app, []); byApp.get(app).push(rest.join("/")); }

  const replayRuns = { learned: [], expert: [], novice: [] };
  const perStationReplay = [];
  for (const [app, stationIds] of byApp.entries()) {
    let suite;
    if (app === "smartcity") suite = await loadSmartCity();
    else if (app === "trades") suite = await loadTrades();
    else { console.log(`  skip app "${app}" — not a known headless suite (smartcity, trades)`); continue; }
    suite.Sfx.muted = true;
    for (const id of stationIds) {
      const room = suite.ROOMS.find((r) => r.id === id);
      if (!room) { console.log(`  skip ${app}/${id}: not found in this suite's catalog`); continue; }
      const root = new suite.THREE.Group();
      let api;
      try { api = room.build(root); } catch (err) { console.log(`  skip ${app}/${id}: build() threw: ${err.message}`); continue; }

      const learnedRuns = [], expertRuns = [], noviceRuns = [];
      for (let i = 0; i < REPLAY_EPISODES; i++) {
        const agent = new LearnedAgent(model, { embodied, room, api, suite });
        learnedRuns.push(runWithAgent(suite, room, api, agent, { embodied }));
        const scriptedRun = (skill) => (embodied
          ? suite.runEmbodiedEpisode(room, api, { skill, seed: 900000 + i, trajectory: false, root, SessionClass: suite.Session })
          : suite.runEpisode(room, api, { skill, seed: 900000 + i, trajectory: false, SessionClass: suite.Session }));
        expertRuns.push(scriptedRun(1).summary);
        noviceRuns.push(scriptedRun(0).summary);
      }
      replayRuns.learned.push(...learnedRuns); replayRuns.expert.push(...expertRuns); replayRuns.novice.push(...noviceRuns);
      perStationReplay.push({
        app, station: id,
        learned: summarizeRuns(learnedRuns), expert: summarizeRuns(expertRuns), novice: summarizeRuns(noviceRuns),
      });
    }
  }
  const replay = {
    embodied, episodesPerPolicy: REPLAY_EPISODES,
    overall: { learned: summarizeRuns(replayRuns.learned), expert: summarizeRuns(replayRuns.expert), novice: summarizeRuns(replayRuns.novice) },
    perStation: perStationReplay,
  };
  console.log(`Replay — learned pass rate ${replay.overall.learned.passRate} (mean score ${replay.overall.learned.meanScore}), expert ${replay.overall.expert.passRate}/${replay.overall.expert.meanScore}, novice ${replay.overall.novice.passRate}/${replay.overall.novice.meanScore}`);

  // ------------------------------------------------------------- report out
  const report = {
    schemaVersion: 1, generatedAt: new Date().toISOString(), datasetDir, weightsPath: resolve(weightsPath),
    hyperparameters: weights.hyperparameters,
    dataset: { episodes: episodes.length, examples: examples.length, skippedActions, stations: stationKeys.size, trainStations: trainStations.length, testStations: testStations.length },
    lossHistory,
    accuracy: { train: trainAccuracy, test: testAccuracy },
    replay,
  };
  writeFileSync(join(outDir, "training-report.json"), JSON.stringify(report, null, 2));
  writeFileSync(join(outDir, "training-report.md"), toMarkdown(report));
  writeFileSync(join(outDir, "MODEL_CARD.md"), modelCard(report));
  console.log(`Wrote ${join(outDir, "training-report.json")}, training-report.md and MODEL_CARD.md`);
}

function pct(n) { return n == null ? "n/a" : `${Math.round(n * 100)}%`; }
function toMarkdown(r) {
  const lines = [];
  lines.push(`# Baseline training report`);
  lines.push("");
  lines.push(`Generated ${r.generatedAt} from \`${r.datasetDir}\` → \`${r.weightsPath}\`.`);
  lines.push("");
  lines.push(`## Data`);
  lines.push("");
  lines.push(`${r.dataset.episodes} episode(s), ${r.dataset.examples} usable step(s) (${r.dataset.skippedActions} skipped), ${r.dataset.stations} station(s) — ${r.dataset.trainStations} train / ${r.dataset.testStations} held out.`);
  lines.push("");
  lines.push(`## Accuracy — held-out stations`);
  lines.push("");
  lines.push(`Overall: top-1 **${pct(r.accuracy.test.overall.top1)}**, top-3 **${pct(r.accuracy.test.overall.top3)}** (n=${r.accuracy.test.overall.n}).`);
  lines.push("");
  lines.push(`| step kind | n | top-1 | top-3 |`);
  lines.push(`| --- | --- | --- | --- |`);
  for (const [k, v] of Object.entries(r.accuracy.test.perKind)) lines.push(`| ${k} | ${v.n} | ${pct(v.top1)} | ${pct(v.top3)} |`);
  lines.push("");
  lines.push(`| station | n | top-1 | top-3 |`);
  lines.push(`| --- | --- | --- | --- |`);
  for (const [k, v] of Object.entries(r.accuracy.test.perStation)) lines.push(`| ${k} | ${v.n} | ${pct(v.top1)} | ${pct(v.top3)} |`);
  lines.push("");
  lines.push(`## Accuracy — training stations (reference only)`);
  lines.push("");
  lines.push(`Overall: top-1 ${pct(r.accuracy.train.overall.top1)}, top-3 ${pct(r.accuracy.train.overall.top3)} (n=${r.accuracy.train.overall.n}).`);
  lines.push("");
  lines.push(`## Replay through the real engine — held-out stations`);
  lines.push("");
  lines.push(`${r.replay.episodesPerPolicy} episode(s) per policy per station, ${r.replay.embodied ? "embodied" : "plain"}.`);
  lines.push("");
  lines.push(`| policy | episodes | pass rate | mean score | mean hazard hits |`);
  lines.push(`| --- | --- | --- | --- | --- |`);
  for (const [name, s] of Object.entries(r.replay.overall)) lines.push(`| ${name} | ${s.episodes} | ${pct(s.passRate)} | ${s.meanScore} | ${s.meanHazardHits} |`);
  lines.push("");
  lines.push(`| station | learned pass/score | expert pass/score | novice pass/score |`);
  lines.push(`| --- | --- | --- | --- |`);
  for (const s of r.replay.perStation) lines.push(`| ${s.app}/${s.station} | ${pct(s.learned.passRate)}/${s.learned.meanScore} | ${pct(s.expert.passRate)}/${s.expert.meanScore} | ${pct(s.novice.passRate)}/${s.novice.meanScore} |`);
  lines.push("");
  return lines.join("\n");
}
/** A concrete, run-specific note on the gap (if any) between per-decision
 * classification accuracy and the replayed policy's pass rate — a signature
 * of compounding error in behaviour cloning: a classifier can score well on
 * isolated held-out decisions while a long continuous-adjustment step
 * (track/hold, ticked every 0.05s rather than once per logged decision)
 * still drifts once a single tick's action differs from the scripted
 * policy's, carrying the episode into states the classifier never trained
 * on. Written from this run's own numbers, not asserted in the abstract. */
function gapNote(r) {
  const top1 = r.accuracy.test.overall.top1, learnedPass = r.replay.overall.learned.passRate, expertPass = r.replay.overall.expert.passRate;
  if (top1 == null || learnedPass == null) return "";
  const gap = expertPass - learnedPass;
  if (gap <= 0.05) {
    return `- In this run, the learned policy's replayed pass rate (${pct(learnedPass)}) tracked the scripted expert's (${pct(expertPass)}) reasonably closely, alongside ${pct(top1)} top-1 held-out accuracy.`;
  }
  return `- **Observed in this run:** ${pct(top1)} top-1 accuracy on held-out decisions did not carry over to a comparable replayed pass rate (learned ${pct(learnedPass)} vs. the scripted expert's ${pct(expertPass)}). This is a signature of compounding error in behaviour cloning: a continuous-adjustment step (\`track\`/\`hold\`) is ticked far more often than it is logged as a decision, so a single tick where the classifier's choice differs from the expert's can carry the episode into a state distribution the classifier never saw in training, and the error compounds for the rest of that step rather than being isolated to one wrong decision. High per-decision accuracy is necessary but not sufficient for a good replayed policy — the replay numbers above are the ones that matter for "does this policy actually run the procedure," not the accuracy table alone.`;
}

function modelCard(r) {
  return `# Model card — SmartCiti.X procedure-following baseline

Generated ${r.generatedAt} by \`tools/train_baseline.mjs\` from \`${r.datasetDir}\`.

## Intended use

A **research baseline** for procedure-following agents trained on this project's synthetic and
human-exported robot/model training data (see \`docs/robot-datasets.md\`). It exists so a future,
better policy has something to beat, and so a contributor changing the exporter or the engine can see
whether a trivial learner still tracks a station's procedure at all. It is small, plain-JS multinomial
logistic regression on a hand-picked feature set — not a competitive model architecture, and not tuned
per station.

## What it is not

**Not a certification of anything.** A pass rate or a score this model produces in replay is a measure
of how well a small classifier imitates the scripted policies' *choice of action class* on a station it
never trained on — it is not a credential, and it says nothing about a real robot, a real learner, or
any standards body's certification (see \`docs/proof-of-training.md\`). It is also not a claim that this
architecture, these features, or these hyperparameters are well-suited to any dataset other than the one
named above.

## Architecture

Multinomial logistic regression: \`logits = x·W + b\`, softmax, cross-entropy loss, mini-batch gradient
descent (batch size ${r.hyperparameters.batchSize}, ${r.hyperparameters.epochs} epoch(s), base learning
rate ${r.hyperparameters.baseLr} decaying as \`lr(epoch) = baseLr / (1 + ${r.hyperparameters.lrDecay} * epoch)\`,
L2 ${r.hyperparameters.l2}). Trained on \`x\` = a fixed-length featurisation of a step's \`observation\`
(numeric digest features, a one-hot step kind, a hashed bag of interactable ids — see the header comment
of \`tools/train_baseline.mjs\`), \`y\` = the action class (\`action.type\`) actually taken at that step.
It predicts a *class*, never the full action (an id, a gauge value, a rotate delta, a drive input) — see
"Replay" below.

## Data

${r.dataset.episodes} episode(s), ${r.dataset.examples} usable (observation, action-class) pair(s) from
\`${r.datasetDir}\` (built by \`tools/export_dataset.mjs\`; see its own \`DATASET_CARD.md\` for that data's
own provenance and licence). Held out **by station**: ${r.dataset.testStations} of
${r.dataset.stations} station(s) never appear in training, evenly spaced through the sorted station list
(see \`tools/train_baseline.mjs\`'s \`pickHoldout()\`), so the reported accuracy is on stations this model
never saw a single decision from.

## Results

Held-out top-1 accuracy: **${pct(r.accuracy.test.overall.top1)}**; top-3: **${pct(r.accuracy.test.overall.top3)}**
(n=${r.accuracy.test.overall.n}). Full per-step-kind and per-station tables are in
\`training-report.md\` next to this file.

Replayed through the real engine on the held-out stations (${r.replay.episodesPerPolicy} episode(s) per
policy per station): learned pass rate ${pct(r.replay.overall.learned.passRate)} (mean score
${r.replay.overall.learned.meanScore}) against the scripted expert's ${pct(r.replay.overall.expert.passRate)}
(${r.replay.overall.expert.meanScore}) and novice's ${pct(r.replay.overall.novice.passRate)}
(${r.replay.overall.novice.meanScore}).

## Limitations

${gapNote(r)}
- **Predicts a class, not a full action.** Replaying it through the real engine (\`fillAction()\` in
  \`tools/train_baseline.mjs\`) fills in the id/parameters a real action needs with the same fixed, simple
  rule for every step of a given kind (the step's one valid target, the gauge band's centre, a fixed
  rotate/drop, a moderate-skill \`drivePolicy()\` fallback). What the classifier actually influences is
  *when* to press/release/wait/select/commit at all — most visibly on hold, track, gauge and
  interruption steps — not fine motor parameters.
- **A prediction the live step cannot accept is sanitised to a safe default for that step**, so an
  episode can always finish; the accuracy numbers above are the raw classifier's, the replay numbers are
  this sanitised policy's.
- **Keep-out violations in replay are approximated** from the current observation's own keep-out account
  for the step's primary target, not recomputed for the exact id the fallback rule chose — see
  \`runWithAgent()\`'s own comment in \`tools/train_baseline.mjs\`.
- **A small, hand-picked feature set and a linear model.** No claim is made that either is the right
  choice for a harder task than "does this classifier track the procedure's rhythm at all."
- **Trained on this project's own synthetic (and, if supplied, human) episodes only** — see this
  dataset's own \`DATASET_CARD.md\` for what that data does and does not represent (a skill-parameterised
  scripted policy, not a recording of every possible real learner or robot).
`;
}

// Only run as a script — tools/check_dataset_tools.mjs imports this module's
// pure functions (featurize, deserializeModel, predictProbs, …) directly, and
// must not trigger a training run just by importing them.
if (process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1])) {
  main();
}
