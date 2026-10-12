#!/usr/bin/env node
/**
 * ROBO-ARENA — trainable sets for robotics: the gym's episodes exported in a documented, versioned JSONL schema with a
 * dataset card, under exports/robotics/arena/ (docs/consoles/ROBO-ARENA.md). Deterministic (fixed seeds, no timestamp),
 * so tools/check_arena.mjs rebuilds it in memory and compares byte for byte.
 *
 * One JSONL line per step (schema RA_DS_SCHEMA): episode id, step index, split, source, consent provenance, scenario,
 * linked station, instruction id (texts in instructions.json), observation (the scenario's named scene features; AMR:
 * one feature vector per robot), action, reward, rule flags, done. Episodes are sharded so no file exceeds 120 KB.
 *
 * Splits are fixed by generator seed and never overlap (checked): train = colSyntheticDemos seed 1 (episode seeds
 * 100004+), validation = seed 3 (300010+), test = seed 5 (500016+). The arena's held-out seeds 7121–7180 are in no split.
 * Every episode here is SYNTHETIC (consent null). Consented learner takes are added only by the page, from the learner's
 * own local store, through dxValidateEpisode (a human episode without an adult consent receipt is refused); none is read
 * here.
 *
 *     node tools/ra_dataset.mjs          # write exports/robotics/arena/
 *     node tools/ra_dataset.mjs --check  # compare a fresh build with the files on disk
 */
import { writeFileSync, readFileSync, mkdirSync, existsSync, readdirSync, rmSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { COL_SCENARIOS, colSyntheticDemos, colF, colHash } from "../WebXR/shared/col-learn.js";
import { dxValidateEpisode } from "../WebXR/shared/dx-data.js";
import { RB_SCENARIOS } from "../WebXR/shared/rb-robotics-data.js";
import { raLmTaskTexts } from "../WebXR/shared/ra-lm.js";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
export const RA_DS_OUT = join(ROOT, "exports", "robotics", "arena");
export const RA_DS_SCHEMA = "smartcitix.robotics.arena-episode@1";
export const RA_DS_VERSION = "ra-ds/1";
export const RA_DS_SPLITS = [
  { split: "train", seed: 1, n: 40 },
  { split: "validation", seed: 3, n: 10 },
  { split: "test", seed: 5, n: 10 },
];
export const RA_DS_SHARD_BYTES = 120 * 1024;
export const RA_DS_SAMPLE = 1;
const RA_DS_GEN = { skill: 0.85, noise: 0.3 };
const r4 = (n) => Math.round(n * 1e4) / 1e4;

function raDsReadStation(id) { const p = join(ROOT, "exports", "unity", "SmartCitiX", "Content", "stations", `${id}.json`); return existsSync(p) ? JSON.parse(readFileSync(p, "utf8")) : null; }

/** The observation as named scene features (AMR: per robot). */
function raDsObs(sc, obs) {
  const F = colF(sc);
  if (sc === "rb-amr-fleet-routing") return { robots: F.perRobot(obs).map((r) => (r.delivered ? null : r.f.map(r4))) };
  return { f: F.of(obs).map(r4) };
}

/** Build every file in memory: Map(relative path -> text) plus the summary. `consented` (page only) is a list of DX episodes. */
export function raDsBuild({ consented = [] } = {}) {
  const files = new Map(), full = new Map();
  const texts = raLmTaskTexts(raDsReadStation);
  const instructions = Object.fromEntries(COL_SCENARIOS.map((sc) => [sc, texts.task[sc]]));
  const counts = {}, labels = {}, seen = new Map(), leakage = [], dupes = [], refused = [];
  const lines = [];
  const add = (ep, split, sc) => {
    const v = dxValidateEpisode(ep);
    if (!v.ok) { refused.push({ id: ep?.episodeId ?? "?", why: v.errors[0] }); return; }
    if (ep.source === "human" && !(ep.consent?.consentId && ep.consent?.adult === true)) { refused.push({ id: ep.episodeId, why: "no adult consent receipt" }); return; }
    // Dedup and leakage: an episode is identified by its content (scenario plus every step's observation and action).
    // Splits are filled in the order train, validation, test: a duplicate inside a split is dropped, and a later split's
    // copy of an earlier split's episode is REMOVED from the later split (counted in crossSplitRemoved), so the leakage
    // left in the files is 0 by construction; tools/check_arena.mjs re-measures it from the written lines.
    const key = colHash([sc, ep.steps.map((s) => [s.observation, s.action])]);
    if (seen.has(key)) { if (seen.get(key) !== split) leakage.push({ id: ep.episodeId, removedFrom: split, keptIn: seen.get(key) }); else dupes.push(ep.episodeId); return; }
    seen.set(key, split);
    const c = ((counts[sc] ??= {})[split] ??= { episodes: 0, steps: 0, synthetic: 0, consented: 0, passed: 0 });
    c.episodes += 1; c[ep.source === "human" ? "consented" : "synthetic"] += 1; if (ep.summary?.success) c.passed += 1;
    ep.steps.forEach((s, t) => {
      c.steps += 1;
      const lab = s.action?.type ?? "?"; (labels[sc] ??= {})[lab] = (labels[sc][lab] ?? 0) + 1;
      lines.push({ sc, split, line: JSON.stringify({
        schema: RA_DS_SCHEMA, episode: ep.episodeId, t, split, source: ep.source,
        consent: ep.source === "human" ? { consentId: ep.consent.consentId, adult: true, licence: ep.consent.licence } : null,
        scenario: sc, station: RB_SCENARIOS.find((x) => x.id === sc)?.station ?? null, instruction: sc,
        observation: raDsObs(sc, s.observation), action: s.action, reward: r4(s.reward ?? 0),
        rules: { unsafe: !!s.info?.unsafe, outcome: s.info?.outcome ?? null }, done: !!s.done,
      }) });
    });
  };
  for (const sc of COL_SCENARIOS) {
    for (const { split, seed, n } of RA_DS_SPLITS) for (const ep of colSyntheticDemos(sc, { n, seed, ...RA_DS_GEN })) add(ep, split, sc);
    for (const ep of consented.filter((e) => e?.scenario === sc)) add(ep, "train", sc);
  }
  // Shards: per scenario and split, cut at RA_DS_SHARD_BYTES.
  const shards = [];
  for (const sc of COL_SCENARIOS) for (const { split } of RA_DS_SPLITS) {
    const mine = lines.filter((l) => l.sc === sc && l.split === split).map((l) => l.line);
    let part = 0, buf = [], size = 0;
    const flush = () => { if (!buf.length) return; const p = `${split}/${sc}-${String(part).padStart(3, "0")}.jsonl`; full.set(p, `${buf.join("\n")}\n`); shards.push({ path: p, lines: buf.length, bytes: Buffer.byteLength(full.get(p)) }); part += 1; buf = []; size = 0; };
    for (const l of mine) { const b = Buffer.byteLength(l) + 1; if (size + b > RA_DS_SHARD_BYTES) flush(); buf.push(l); size += b; }
    flush();
  }
  // The committed sample: the first RA_DS_SAMPLE episodes of each scenario and split (exports/robotics holds summaries and
  // samples, not dumps: ROBOEXPORT's 1.5 MB cap on the folder). The full set is written with --full --out <dir>.
  const sample = [];
  for (const sc of COL_SCENARIOS) for (const { split } of RA_DS_SPLITS) {
    const mine = lines.filter((l) => l.sc === sc && l.split === split).map((l) => l.line), eps = [];
    for (const l of mine) { const id = JSON.parse(l).episode; if (!eps.includes(id)) { if (eps.length === RA_DS_SAMPLE) break; eps.push(id); } }
    const keep = mine.filter((l) => eps.includes(JSON.parse(l).episode));
    const p = `sample/${split}/${sc}.jsonl`; files.set(p, `${keep.join("\n")}\n`); sample.push({ path: p, episodes: eps.length, lines: keep.length });
  }
  const features = Object.fromEntries(COL_SCENARIOS.map((sc) => [sc, colF(sc).names]));
  files.set("instructions.json", `${JSON.stringify({ schema: RA_DS_SCHEMA, note: "task texts: scenario name, blurb, actions, rules and the linked station's step titles, prompts and hazards (exports/unity stations)", sources: Object.fromEntries(COL_SCENARIOS.map((sc) => [sc, texts.sources[sc]])), instructions }, null, 1)}\n`);
  const schema = {
    schema: RA_DS_SCHEMA, version: RA_DS_VERSION,
    fields: {
      schema: "this schema id", episode: "episode id (unique)", t: "step index from 0", split: "train | validation | test (fixed by generator seed)",
      source: "synthetic | human", consent: "null for synthetic; { consentId, adult: true, licence } for a consented human take",
      scenario: "rb-* gym scenario id", station: "the catalog station the scenario is drawn from", instruction: "key into instructions.json",
      observation: "{ f: [scene features] } or, AMR, { robots: [[features] | null when delivered] }; names per scenario in features",
      action: "the env action as taken", reward: "the env reward for the step", rules: "{ unsafe: a safe-practice rule broken at this step, outcome }", done: "episode ended",
    },
    features,
  };
  files.set("schema.json", `${JSON.stringify(schema, null, 1)}\n`);
  const totals = { episodes: 0, steps: 0, synthetic: 0, consented: 0 };
  for (const sc of Object.keys(counts)) for (const c of Object.values(counts[sc])) { totals.episodes += c.episodes; totals.steps += c.steps; totals.synthetic += c.synthetic; totals.consented += c.consented; }
  const bySplit = Object.fromEntries(RA_DS_SPLITS.map(({ split }) => [split, Object.values(counts).reduce((a, c) => ({ episodes: a.episodes + (c[split]?.episodes ?? 0), steps: a.steps + (c[split]?.steps ?? 0) }), { episodes: 0, steps: 0 })]));
  const index = { schema: RA_DS_SCHEMA, version: RA_DS_VERSION, generator: "tools/ra_dataset.mjs", totals, bySplit, counts, actionLabels: labels, crossSplitRemoved: leakage.length, crossSplitRemovedIds: leakage, withinSplitDuplicates: dupes.length, leakage: 0, refused, full: { shards, contentHash: colHash([...full.entries()].map(([k, v]) => [k, colHash(v)])), write: "node tools/ra_dataset.mjs --full --out <dir>" }, sample };
  files.set("index.json", `${JSON.stringify(index, null, 1)}\n`);
  files.set("dataset-card.md", raDsCard(index));
  return { files, full, index };
}

function raDsCard(ix) {
  const row = (sc) => RA_DS_SPLITS.map(({ split }) => { const c = ix.counts[sc]?.[split]; return c ? `${c.episodes} / ${c.steps}` : "0 / 0"; }).join(" | ");
  return `# Dataset card — robot arena episodes (${RA_DS_VERSION})

Schema \`${RA_DS_SCHEMA}\`, written by \`node tools/ra_dataset.mjs\` (console ROBO-ARENA, \`docs/consoles/ROBO-ARENA.md\`).
Deterministic: \`tools/check_arena.mjs\` rebuilds it in memory and compares byte for byte. The full set's content hash is \`${ix.full.contentHash}\` (${ix.full.shards.length} shards, written with \`${ix.full.write}\`); this folder commits the card, the schema, the instruction texts, the index and a sample (the first ${RA_DS_SAMPLE} episodes of each scenario and split, under \`sample/\`), because \`exports/robotics\` holds summaries and samples, not dumps.

**Every episode in this version is SYNTHETIC** (the scripted expert at skill ${RA_DS_GEN.skill} with action noise ${RA_DS_GEN.noise}, a stand-in for people in tests) and carries \`consent: null\`. No person's data is in it.

## Motivation
Trainable sets for the robot gym: the same episodes the arena's learners train on, in one documented, versioned, line-per-step format, so a model trained elsewhere can be compared on the same splits.

## Composition
${ix.totals.episodes} episodes, ${ix.totals.steps} steps: ${ix.totals.synthetic} synthetic, ${ix.totals.consented} consented. Episodes / steps per scenario and split:

| scenario | train | validation | test |
|---|---|---|---|
${Object.keys(ix.counts).map((sc) => `| ${sc} | ${row(sc)} |`).join("\n")}

The three robot stations are not in this version (they need the full headless suite); the arena runs them.

## Collection process
Generated headlessly by \`colSyntheticDemos\` (shared/col-learn.js) through \`dxMakeEpisode\`, the same path a consented human episode takes, with fixed seeds per split: train seed 1 (episode seeds 100004+), validation seed 3 (300010+), test seed 5 (500016+).

## Consent
Synthetic episodes carry \`consent: null\`. A consented learner take can be added only from the learner's own device under DATAWORKS' rules (opt-in adults only; never K-12, the demo or a signed-out session; local; revoke deletes), and every one passes \`dxValidateEpisode\`: a human episode without an adult consent receipt is refused (${ix.refused.length} refused in this build). Consent provenance is per sample: every line carries its own \`source\` and \`consent\`.

## De-identification
Nothing to de-identify in this version: no person is in it. A consented take carries only its consent receipt id, the adult attestation and its licence; no name, account, voice, video or location.

## Licence
Synthetic data: CC0-1.0. A consented take keeps the licence its learner chose (CC0-1.0 or CC-BY-4.0).

## Known gaps and biases
One scripted generator: the demonstrations share its habits and lapses. Six simple simulated tasks; no real robot, no sensor noise model, no station scenarios yet.

## Intended uses
Training and comparing small robot policies in this simulator on fixed splits; teaching how a robotics dataset is built.

## Out-of-scope uses
Any claim about a real robot, a real workplace or a person; tuning on the test split; any use as evidence of hardware performance.

## Schema, units and frames
\`schema.json\` names every field and each scenario's feature names; \`instructions.json\` holds the task texts the \`instruction\` key points to. Units are the simulator's (metres, seconds, grid cells).

## Provenance
Generator \`tools/ra_dataset.mjs\` over \`shared/col-learn.js\` and \`shared/rb-env.js\`; instruction texts from \`shared/rb-robotics-data.js\` and the exported station files.

## Maintenance
Versioned: a change to the schema bumps \`${RA_DS_SCHEMA}\`; a change to the content bumps \`${RA_DS_VERSION}\` and the content hash. Regenerate with \`node tools/ra_dataset.mjs\`.

## Best practices this set follows
- **Fixed held-out splits:** splits are fixed by generator seed, and the arena's held-out seeds (7121–7180) are in no split.
- **No leakage between splits:** an episode is keyed by its content (scenario, every observation and action). Splits fill in the order train, validation, test, and a later split's copy of an earlier split's episode is removed from the later split: ${ix.crossSplitRemoved} removed in this build (the scripted generator sometimes repeats an episode exactly). Leakage left in the files: 0, re-measured from the written lines by the checker.
- **Dedup:** the same content twice inside a split is kept once (${ix.withinSplitDuplicates} dropped).
- **Consent provenance per sample:** every line carries \`source\` and \`consent\`.
- **Class balance:** the same number of episodes generated per scenario in each split (40 / 10 / 10, before dedup; the counts after dedup are in the table); action labels are not resampled, and their counts per scenario are in \`index.json\` (\`actionLabels\`) so a trainer can weight them.
- **Versioning:** a schema id, a dataset version and a content hash.
`;
}

const isMain = process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1];
if (isMain) {
  const { files, index } = raDsBuild();
  if (process.argv.includes("--check")) {
    const disk = existsSync(RA_DS_OUT) ? readdirSync(RA_DS_OUT, { recursive: true }).filter((f) => /\.(jsonl|json|md)$/.test(f)).map((f) => String(f).split("\\").join("/")) : [];
    const bad = [...files.keys()].filter((k) => !disk.includes(k) || readFileSync(join(RA_DS_OUT, k), "utf8") !== files.get(k));
    const extra = disk.filter((k) => !files.has(k));
    console.log(bad.length || extra.length ? `differs: ${[...bad, ...extra].join(", ")}` : "same");
    process.exit(bad.length || extra.length ? 1 : 0);
  }
  if (process.argv.includes("--full")) {
    const i = process.argv.indexOf("--out"), out = i > 0 ? process.argv[i + 1] : null;
    if (!out || out.startsWith(RA_DS_OUT)) { console.error("ra_dataset: --full needs --out <dir> outside exports/robotics/arena (the repo keeps the sample)"); process.exit(1); }
    for (const [k, v] of [...files, ...full]) { mkdirSync(dirname(join(out, k)), { recursive: true }); writeFileSync(join(out, k), v); }
    console.log(`wrote the full set to ${out}: ${full.size} shards`);
    process.exit(0);
  }
  if (existsSync(RA_DS_OUT)) rmSync(RA_DS_OUT, { recursive: true });
  for (const [k, v] of files) { mkdirSync(dirname(join(RA_DS_OUT, k)), { recursive: true }); writeFileSync(join(RA_DS_OUT, k), v); }
  console.log(`wrote ${files.size} files: ${index.totals.episodes} episodes, ${index.totals.steps} steps, cross-split copies removed ${index.crossSplitRemoved}, within-split duplicates ${index.withinSplitDuplicates}`);
}
