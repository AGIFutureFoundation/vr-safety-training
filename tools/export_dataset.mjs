#!/usr/bin/env node
/**
 * Model-ready dataset export — combines headless robot policy rollouts across
 * a deterministic sample of every registered station (reusing
 * tools/robot_train.mjs's own engine, embodiment and headless-suite
 * machinery) with any human episodes handed in as JSON files (what
 * SmartCiti.X's "Export episodes" button downloads — see
 * WebXR/shared/episodes.js), into one dataset: JSON Lines episode shards, a
 * manifest, and a dataset card.
 *
 *     node tools/export_dataset.mjs                                       # default sample, both apps
 *     node tools/export_dataset.mjs --stations 20 --seeds 3 --out /tmp/ds
 *     node tools/export_dataset.mjs --human episodes-a.json,episodes-b.json
 *     node tools/export_dataset.mjs --embodied=false --skills 0.5,1
 *
 * Output layout (never under WebXR/dist — see docs/robot-datasets.md):
 *
 *   <out>/episodes-smartcity.jsonl   one JSON object per line, one per episode
 *   <out>/episodes-trades.jsonl      (only written if that app was sampled)
 *   <out>/episodes-human.jsonl       (only written if --human was given)
 *   <out>/manifest.json              what was run: stations, skills, seeds,
 *                                    totals, the field mapping, the shard list
 *   <out>/DATASET_CARD.md            contents, fields, licence, provenance,
 *                                    known limitations, "not a certification"
 *   <out>/lerobot/                   LeRobot-style layout (meta/info.json,
 *                                    meta/episodes.jsonl, meta/tasks.jsonl,
 *                                    data/chunk-NNN/episode_NNNNNN.jsonl)
 *   <out>/rlds/                      RLDS-style step list (episodes.jsonl,
 *                                    features.json)
 *
 * --formats native,lerobot,rlds picks the extra layouts (all by default; the
 * native shards are always written). See tools/lib/dataset_formats.mjs.
 *
 * Every episode object uses the same four decision fields regardless of
 * source — observation / action / reward / done — plus an `info` bag for
 * everything else (see FIELD_MAP below and docs/robot-datasets.md). Synthetic
 * rollouts are deterministic for a given --seed: rerunning this command with
 * the same arguments reproduces the same shards byte for byte except for
 * `generatedAt`.
 */
import { mkdirSync, writeFileSync, appendFileSync, existsSync, rmSync, readFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { ROOT, loadSmartCity, loadTrades } from "./lib/headless.mjs";
import { createFormatWriters } from "./lib/dataset_formats.mjs";

const args = process.argv.slice(2);
const opt = (name, dflt) => { const i = args.indexOf(`--${name}`); return i >= 0 && args[i + 1] && !args[i + 1].startsWith("--") ? args[i + 1] : dflt; };
const flag = (name, dflt = false) => {
  const i = args.indexOf(`--${name}`);
  if (i < 0) return dflt;
  const v = args[i + 1];
  if (!v || v.startsWith("--")) return true;
  return v !== "false" && v !== "0";
};

// ------------------------------------------------------------------- schema
//
// The plain, documented field names this dataset uses for a decision, and
// the generic RL/imitation-learning vocabulary a consumer likely already
// knows. This is a documentation aid, not a claim of byte compatibility with
// any specific framework's on-disk format — see docs/robot-datasets.md.
export const SCHEMA_VERSION = 1;
export const FIELD_MAP = [
  { field: "observation", episodicRL: "observation / state", imitationLearning: "observation" },
  { field: "action", episodicRL: "action", imitationLearning: "expert action (the demonstration)" },
  { field: "reward", episodicRL: "reward", imitationLearning: "usually unused; here it also flags a clean vs. corrected step" },
  { field: "done", episodicRL: "terminal / done flag", imitationLearning: "episode boundary" },
  { field: "info", episodicRL: "infos / auxiliary diagnostics", imitationLearning: "per-step metadata" },
  { field: "episode (the steps array)", episodicRL: "trajectory / rollout", imitationLearning: "demonstration" },
];

const stationsPerApp = +opt("stations", 40);
const seedsPerSkill = +opt("seeds", 2);
const skills = (opt("skills", "0.3,0.65,1") || "").split(",").map(Number).filter((n) => !Number.isNaN(n));
const baseSeed = +opt("seed", 1);
const embodied = flag("embodied", true);
const apps = opt("apps", "smartcity,trades").split(",").map((s) => s.trim()).filter(Boolean);
const humanFiles = (opt("human", "") || "").split(",").map((s) => s.trim()).filter(Boolean);
const out = resolve(opt("out", join(ROOT, "tools", "out", "dataset")));
const formats = opt("formats", "native,lerobot,rlds").split(",").map((s) => s.trim()).filter(Boolean);

// Never the shipped bundle folder — a dataset is build output for a training
// pipeline, not something a browser should ever be asked to fetch.
if (out === resolve(join(ROOT, "WebXR", "dist")) || out.startsWith(resolve(join(ROOT, "WebXR", "dist")) + "/")) {
  console.error(`--out must not be under WebXR/dist (got ${out})`);
  process.exit(1);
}

if (existsSync(out)) rmSync(out, { recursive: true, force: true });
mkdirSync(out, { recursive: true });

// ------------------------------------------------------------- sampling
//
// A deterministic, evenly-spaced subset of a suite's stations rather than
// every one of them: the point of a default run is a fast, broad sample a
// contributor actually runs before pushing, not a full corpus (that is what
// tools/robot_train.mjs --out is for, with no --stations cap). Evenly spaced
// by list index, not random, so the same --stations count always names the
// same stations and the sample spans the whole catalog rather than clumping
// at the front of it.
function sample(list, n) {
  if (!Number.isFinite(n) || n <= 0 || n >= list.length) return list.slice();
  const step = list.length / n;
  const picked = [];
  const seen = new Set();
  for (let i = 0; i < n; i++) {
    const idx = Math.min(list.length - 1, Math.floor(i * step));
    if (!seen.has(idx)) { seen.add(idx); picked.push(list[idx]); }
  }
  return picked;
}

// ------------------------------------------------------ per-decision mapping
//
// One place that turns an engine trajectory record (shared/robot.js's
// runEpisode()/runEmbodiedEpisode() record shape: t, obs, action, reward,
// feedback, hazard[, operator, pose, grasp, maxForce, keepOut,
// keepOutViolation]) into this dataset's plain schema. A human episode
// exported from shared/episodes.js carries the same core fields under
// slightly different names (obs, outcome.kind, outcome.hazard) and is mapped
// by the same function so both sources land in one shape.
function toStep(rec, { isLast }) {
  const outcomeKind = rec.feedback !== undefined ? rec.feedback : rec.outcome?.kind ?? null;
  const hazard = rec.hazard !== undefined ? !!rec.hazard : !!rec.outcome?.hazard;
  return {
    observation: rec.obs ?? null,
    action: rec.action ?? null,
    reward: typeof rec.reward === "number" ? rec.reward : 0,
    done: !!isLast,
    info: {
      t: rec.t ?? null, wall: rec.wall ?? null,
      feedback: outcomeKind, hazard,
      operator: rec.operator ?? "robot",
      pose: rec.pose ?? null, grasp: rec.grasp ?? null, maxForce: rec.maxForce ?? null,
      keepOut: rec.keepOut ?? null, keepOutViolation: !!rec.keepOutViolation,
    },
  };
}

function synthEpisode({ app, room, skill, seed, records, summary }) {
  const steps = records.map((r, i) => toStep(r, { isLast: i === records.length - 1 }));
  return {
    schemaVersion: SCHEMA_VERSION, source: "synthetic",
    app, sourceApp: app, station: room.id, name: room.name ?? room.title, category: room.category ?? null,
    embodied, skill, seed, crewTagHash: null,
    steps,
    summary: {
      score: summary.score, stars: summary.stars, errors: summary.errors, hazardHits: summary.hazardHits,
      seconds: summary.seconds, passed: summary.passed, finished: !!summary.finished,
      ...(embodied ? { keepOutViolations: summary.keepOutViolations, handoffs: summary.handoffs } : {}),
    },
  };
}

function humanEpisode(ep, sourceFile) {
  const records = ep.records ?? [];
  const steps = records.map((r, i) => toStep(r, { isLast: i === records.length - 1 }));
  return {
    schemaVersion: SCHEMA_VERSION, source: "human", sourceFile,
    app: ep.app ?? null, sourceApp: ep.source ?? ep.app ?? null, station: ep.station ?? null, name: ep.station ?? null, category: null,
    embodied: !!ep.embodied, skill: null, seed: null, crewTagHash: ep.crewTagHash ?? null,
    steps,
    summary: ep.summary ?? null,
  };
}

// ------------------------------------------------------------------- run
//
// Same machinery as tools/robot_train.mjs: the headless suite loader, and
// shared/robot.js's runEpisode()/runEmbodiedEpisode() through it, with
// deterministic per-(station, skill, index) seeds so a rerun reproduces the
// same shards.
const shardWriters = new Map(); // app-or-"human" -> file path, opened lazily
function shardPath(name) { return join(out, `episodes-${name}.jsonl`); }
function writeEpisode(shardName, episode) {
  if (!shardWriters.has(shardName)) { writeFileSync(shardPath(shardName), ""); shardWriters.set(shardName, true); }
  appendFileSync(shardPath(shardName), JSON.stringify(episode) + "\n");
}

const manifest = {
  schemaVersion: SCHEMA_VERSION, generatedAt: new Date().toISOString(),
  args: { stations: stationsPerApp, seeds: seedsPerSkill, skills, seed: baseSeed, embodied, apps, human: humanFiles },
  fieldMap: FIELD_MAP,
  licence: {
    synthetic: "CC0-1.0 — the synthetic rollouts in this dataset are generated data with no creative authorship; use them however you like.",
    human: "No licence is asserted here for human-exported episodes. Whoever distributes a dataset that includes them is responsible for having the exporting learner's or hall's permission to do so.",
  },
  notice: "Synthetic rollouts and human episodes in this dataset evidence how a station's procedure plays out under this engine's scoring; they are not a certification, and passing or failing here is not a credential issued by any body a station's `certification` field names.",
  stations: [], human: [], totals: { episodes: 0, steps: 0 },
  files: [],
};

let totalEpisodes = 0, totalSteps = 0;
const writers = createFormatWriters(out, { lerobot: formats.includes("lerobot"), rlds: formats.includes("rlds"), generatedAt: manifest.generatedAt });
const suites = new Map();
async function suiteFor(app) {
  if (!suites.has(app)) suites.set(app, app === "smartcity" ? await loadSmartCity() : app === "trades" ? await loadTrades() : null);
  return suites.get(app);
}

for (const app of apps) {
  const suite = await suiteFor(app);
  if (!suite) { console.error(`unknown app: ${app} (smartcity, trades)`); process.exit(1); }
  suite.Sfx.muted = true;
  const rooms = sample(suite.ROOMS, stationsPerApp);
  console.log(`${app} — sampling ${rooms.length} of ${suite.ROOMS.length} station${suite.ROOMS.length === 1 ? "" : "s"}${embodied ? ", embodied" : ""}, skills ${skills.join(",")}, ${seedsPerSkill} seed(s) each`);
  for (const room of rooms) {
    const root = new suite.THREE.Group();
    let api;
    try { api = room.build(root); } catch (err) { console.log(`  skip ${room.id}: build() threw: ${err.message}`); continue; }
    const runOne = (o) => (embodied
      ? suite.runEmbodiedEpisode(room, api, { ...o, root, SessionClass: suite.Session })
      : suite.runEpisode(room, api, { ...o, SessionClass: suite.Session }));
    let stationEpisodes = 0, stationSteps = 0;
    for (const skill of skills) {
      for (let i = 0; i < seedsPerSkill; i++) {
        const seed = baseSeed * 100000 + Math.round(Math.max(0, Math.min(1, skill)) * 1000) * 100 + i;
        const { summary, records } = runOne({ skill, seed, trajectory: true });
        const episode = synthEpisode({ app, room, skill, seed, records, summary });
        writeEpisode(app, episode);
        writers.add(episode, room);
        stationEpisodes += 1; stationSteps += episode.steps.length;
      }
    }
    totalEpisodes += stationEpisodes; totalSteps += stationSteps;
    manifest.stations.push({ app, id: room.id, name: room.name ?? room.title, category: room.category ?? null, episodes: stationEpisodes, steps: stationSteps });
  }
  manifest.files.push(`episodes-${app}.jsonl`);
}

// -------------------------------------------------------------- human input
//
// Each file is either { schemaVersion, episodes: [...] } (what
// shared/episodes.js's "Export episodes" button downloads) or a bare array of
// the same episode objects. A file that is neither is reported and skipped —
// never fatal, since a dataset build should not fail over one bad hand-in.
for (const file of humanFiles) {
  const path = resolve(file);
  let raw;
  try { raw = JSON.parse(readFileSync(path, "utf8")); } catch (err) { console.error(`  human file skipped, could not read/parse ${file}: ${err.message}`); continue; }
  const episodes = Array.isArray(raw) ? raw : Array.isArray(raw?.episodes) ? raw.episodes : null;
  if (!episodes) { console.error(`  human file skipped, not an episodes export: ${file}`); continue; }
  let count = 0, steps = 0;
  for (const ep of episodes) {
    if (!ep?.station || !Array.isArray(ep.records)) continue; // an in-progress (never finished) episode has no summary; skip rather than guess "done"
    const episode = humanEpisode(ep, file);
    writeEpisode("human", episode);
    const hs = episode.app ? await suiteFor(episode.app) : null;
    writers.add(episode, hs?.ROOMS.find((r) => r.id === episode.station) ?? null);
    count += 1; steps += episode.steps.length;
  }
  if (count) manifest.files.push("episodes-human.jsonl");
  manifest.human.push({ file, episodesRead: episodes.length, episodesWritten: count });
  totalEpisodes += count; totalSteps += steps;
  console.log(`human — ${file}: ${count}/${episodes.length} episode(s) written`);
}

manifest.totals = { episodes: totalEpisodes, steps: totalSteps };
manifest.formats = writers.close();
manifest.files = [...new Set(manifest.files)];
writeFileSync(join(out, "manifest.json"), JSON.stringify(manifest, null, 2));

// -------------------------------------------------------------- dataset card
const stationLines = manifest.stations
  .reduce((by, s) => { (by[s.app] ??= []).push(s); return by; }, {})
;
const cardStationRows = Object.entries(stationLines)
  .map(([app, rows]) => rows.map((r) => `| ${app} | ${r.id} | ${r.name} | ${r.category ?? "—"} | ${r.episodes} | ${r.steps} |`).join("\n"))
  .join("\n");
const card = `# Dataset card — SmartCiti.X / Trade Skills robot & model training export

Generated ${manifest.generatedAt} by \`tools/export_dataset.mjs\`. Schema version ${SCHEMA_VERSION}.

## Contents

${totalEpisodes} episode(s), ${totalSteps} step(s) total, across ${manifest.files.length} JSON Lines shard(s):

${manifest.files.map((f) => `- \`${f}\``).join("\n")}
- \`manifest.json\` — exact arguments, per-station episode/step counts, the field map below, as data
${humanFiles.length ? `\nHuman-exported episodes ingested from: ${humanFiles.map((f) => `\`${f}\``).join(", ")}.\n` : ""}
## Fields

Every line in a shard is one episode:

\`\`\`json
{
  "schemaVersion": ${SCHEMA_VERSION}, "source": "synthetic" | "human",
  "app": "smartcity" | "trades", "station": "<id>", "name": "<display name>", "category": "<or null>",
  "embodied": true, "skill": 0.65, "seed": 100065, "crewTagHash": null,
  "steps": [ { "observation": {...}, "action": {...}, "reward": 0, "done": false, "info": {...} } ],
  "summary": { "score": 0, "stars": 0, "errors": 0, "hazardHits": 0, "seconds": 0, "passed": false }
}
\`\`\`

\`skill\` and \`seed\` are only set for a synthetic rollout (source: "synthetic") — the policy's skill in
[0, 1] (see \`WebXR/shared/robot.js\`) and the deterministic seed it ran under, so the exact episode is
reproducible with \`tools/robot_train.mjs\`. \`crewTagHash\` is only ever a salted hash (see
\`WebXR/shared/episodes.js\`'s \`hashCrewTag()\`) — never a name, and never present for a synthetic rollout.

\`observation\` is \`WebXR/shared/robot.js\`'s \`observe()\`, or, when \`embodied\` is true,
\`WebXR/shared/robot-embodiment.js\`'s \`observeEmbodied()\` — the same shape either way this dataset came from
(a headless rollout or a live session's episode recorder), documented in \`docs/robot-training.md\`.
\`action\` is one of \`WebXR/shared/robot.js\`'s \`applyAction()\` shapes (select / commit / press / release /
rotate / drop / drive / check / wait). \`info\` carries everything a step doesn't put in reward or done:
the sim and wall timestamps, the feedback kind, whether it was a hazard, and — when \`embodied\` — who
performed it (\`"robot"\` or \`"human"\`, a \`noRobot\` step handed to the clinician), the pose worked, the
grasp, the force ceiling and the keep-out account.

### Mapping to common dataset conventions

This dataset's field names are plain and self-describing; the table below is only a bridge to two common
kinds of dataset a consumer may already have tooling for, described generically. **Nothing here claims
byte compatibility with any specific named framework's on-disk format** — a consumer needing that writes
its own converter from these fields.

| this dataset | episodic reinforcement-learning datasets (generic) | imitation-learning datasets (generic) |
| --- | --- | --- |
${FIELD_MAP.map((r) => `| \`${r.field}\` | ${r.episodicRL} | ${r.imitationLearning} |`).join("\n")}

## Other layouts

${manifest.formats.lerobot ? `- \`lerobot/\` — a LeRobot-style episode layout: \`meta/info.json\`, \`meta/episodes.jsonl\` (one row per
  episode, with its labels), \`meta/tasks.jsonl\` and \`data/chunk-NNN/episode_NNNNNN.jsonl\` (one frame per line:
  \`observation\`, \`action\`, \`reward\`, \`done\`, \`primitive\`, \`language_instruction\`). ${manifest.formats.lerobot.episodes} episode(s),
  ${manifest.formats.lerobot.frames} frame(s), ${manifest.formats.lerobot.tasks} task(s). JSON Lines values, no parquet.\n` : ""}${manifest.formats.rlds ? `- \`rlds/\` — an RLDS-style step list: \`episodes.jsonl\` (\`episode_metadata\` plus \`steps\`, each with
  \`observation\`, \`action\`, \`reward\`, \`discount\`, \`is_first\`, \`is_last\`, \`is_terminal\`,
  \`language_instruction\` from the step prompt) and \`features.json\`. ${manifest.formats.rlds.episodes} episode(s), ${manifest.formats.rlds.steps} step(s).\n` : ""}
Both carry, per episode: the station, its programmes and union, its hazard and interruption labels (and the
ones this episode actually hit or saw), the passport's source app, a licence and a consent field, and only the
anonymised crew-tag hash. The primitive vocabulary is \`WebXR/shared/skill-registry.js\`. Neither layout is the
byte format of any framework's own loader.

## Provenance

- **Synthetic rollouts** (\`source: "synthetic"\`) are generated by \`tools/export_dataset.mjs\` running
  \`WebXR/shared/robot.js\`'s skill-parameterised policy against the real procedure engine
  (\`WebXR/shared/game.js\`), headlessly, through \`tools/lib/headless.mjs\`'s stub renderer — the same
  machinery \`tools/robot_train.mjs\` uses. Deterministic for a given \`--seed\`: rerunning this command with
  the same arguments reproduces the same shards (\`generatedAt\` aside).
- **Human episodes** (\`source: "human"\`) are whatever was handed to \`--human\`: a JSON file downloaded from
  SmartCiti.X's "Export episodes" button (\`WebXR/shared/episodes.js\`), carrying no name and no free text —
  only a salted crew-tag hash, if the run carried one at all.

## Licence

- Synthetic rollouts: **CC0-1.0** — generated data with no creative authorship behind it; use freely.
- Human episodes: **no licence is asserted here.** Whoever distributes a dataset that includes them is
  responsible for having the exporting learner's or hall's permission to do so.

## Known limitations

- A synthetic rollout's policy is a model of a learner (\`WebXR/shared/robot.js\`'s \`RobotAgent\`, a single
  skill parameter in [0, 1]), not a recording of a real one — it is useful for calibration and for bulk,
  cheap trajectories, and it is not a substitute for human episodes where those are available.
- A \`track\` step's wobble is seeded from \`Math.random()\` inside the engine (see
  \`docs/robot-training.md\`), so an episode containing one is reproducible in its decisions but not in its
  exact tick timing.
- \`--stations\` samples a deterministic, evenly-spaced subset of a suite's catalog for a fast default run;
  it is not the full catalog. Run \`tools/robot_train.mjs\` directly (no station cap) for a complete corpus.
- \`embodied\` observations (poses, keep-out accounts) are only as good as a station's own \`forceClass\`/
  \`noRobot\` declarations — see \`docs/robot-training.md\`'s "dental rule set" for how those are authored and
  checked.

## What this is not

This dataset evidences how a station's procedure plays out under this engine's scoring. **It is not a
certification**, and passing or failing a station here is not a credential issued by any standards body a
station's own \`certification\` field names (see \`docs/proof-of-training.md\`).

## Per-station counts

| app | station | name | category | episodes | steps |
| --- | --- | --- | --- | --- | --- |
${cardStationRows}
`;
writeFileSync(join(out, "DATASET_CARD.md"), card);

console.log(`\nWrote ${manifest.files.length} shard(s), ${totalEpisodes} episode(s), ${totalSteps} step(s) → ${out}`);
