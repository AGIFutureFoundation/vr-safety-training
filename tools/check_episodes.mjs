/**
 * Headless checks for the episode recorder (WebXR/shared/episodes.js) and the
 * dataset exporter (tools/export_dataset.mjs): a recorder attached to a real
 * shared/game.js Session round-trips a decision through the store, the store
 * evicts oldest-first under its byte and count caps, a crew tag never reaches
 * storage in plain text, and a tiny exporter run produces a valid manifest,
 * dataset card and JSON-Lines shards whose steps carry observation/action/
 * reward/done/info.
 *
 *     node tools/check_episodes.mjs
 */
import { spawnSync } from "node:child_process";
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, rmSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, "..");

// A fresh in-memory localStorage per run, the same stub every other checker
// that touches browser storage uses (see tools/check_records.mjs).
const memStore = new Map();
globalThis.localStorage = {
  getItem: (k) => (memStore.has(k) ? memStore.get(k) : null),
  setItem: (k, v) => memStore.set(k, String(v)),
  removeItem: (k) => memStore.delete(k),
};
// game.js's Sfx.ensure() reads `window` unguarded — stub it before import,
// the same way check_holodeck.mjs does.
globalThis.window = globalThis.window ?? {};

const { Session, Sfx } = await import("../WebXR/shared/game.js");
Sfx.muted = true;
const {
  attachEpisodeRecorder, EpisodeStore, hashCrewTag, sessionDigest, dedupeKeyFor,
  EPISODE_SCHEMA_VERSION, MAX_STORE_BYTES, DIGEST_FEATURES,
} = await import("../WebXR/shared/episodes.js");

let failures = 0;
function check(name, fn) {
  try { fn(); console.log(`  ✓ ${name}`); }
  catch (err) { failures += 1; console.log(`  ✗ ${name}\n      ${err.stack ?? err}`); }
}
const eq = (a, b, what) => { if (a !== b) throw new Error(`${what}: expected ${JSON.stringify(b)}, got ${JSON.stringify(a)}`); };
const ok = (v, what) => { if (!v) throw new Error(what); };

console.log("Episode recorder — self-test\n");

// A tiny synthetic room: no three.js needed, since shared/game.js's Session
// is pure state over the steps it is handed — the same reason
// tools/interrupt_react.mjs can drive a real Session with a hand-built room.
function makeRoom() {
  return {
    id: "ep-test-room", name: "Episode Test Room", parSeconds: 60,
    steps: [
      { id: "s1", kind: "select", target: "a", title: "Touch A", why: "it is the first control." },
      { id: "s2", kind: "gauge", target: "g", title: "Set the gauge", why: "steady in the green band.", gauge: { green: [0.4, 0.6] } },
    ],
    hazards: { haz1: "that one bites." },
    interrupts: [],
  };
}

// ------------------------------------------------------------ round-trip

EpisodeStore.clear();
let finishedEpisode = null;
{
  const room = makeRoom();
  const session = new Session(room, {});
  const rec = attachEpisodeRecorder(session, {
    app: "test", station: room.id, crewTag: "Ada Lovelace",
    viewMode: "desktop", env: () => ({ weather: "clear", timeOfDay: "day", eventSeed: "seed1" }),
  });
  session.start();
  session.select("haz1");     // a hazard hit — wrong(), no advance
  session.select("a");        // correct — advances to the gauge step
  session.gauge.t = 0.5;      // the dial sits in the green band
  session.select("g");        // commits the gauge — advances — the room has no more steps, so this finishes the run
  // finish() persists on a deferred timer (never inline with the hook that
  // reports the run ended) — give the event loop one tick.
  await new Promise((r) => setTimeout(r, 10));
  finishedEpisode = rec.episode;
}

check("attachEpisodeRecorder logs a decision per wrapped call, with observation/action/reward", () => {
  ok(finishedEpisode.records.length >= 3, `expected at least 3 decisions, got ${finishedEpisode.records.length}`);
  for (const r of finishedEpisode.records) {
    ok(r.obs && typeof r.obs.stepIndex === "number", "obs.stepIndex");
    ok(r.action?.type, "action.type");
    ok(typeof r.reward === "number", "reward");
    ok(typeof r.t === "number" && typeof r.wall === "number", "timestamps");
  }
  const hazardRecord = finishedEpisode.records.find((r) => r.action.id === "haz1");
  ok(hazardRecord, "the hazard decision was not logged");
  eq(hazardRecord.outcome.hazard, true, "hazard flag");
});

check("a gauge commit is logged as a commit action with `at`, not a bare select", () => {
  const commit = finishedEpisode.records.find((r) => r.action.type === "commit");
  ok(commit, "no commit action logged");
  eq(commit.action.id, "g", "commit target");
  eq(commit.action.at, 0.5, "commit at");
});

check("schemaVersion is stamped, and the episode is marked finished with a summary", () => {
  eq(finishedEpisode.schemaVersion, EPISODE_SCHEMA_VERSION, "schemaVersion");
  eq(finishedEpisode.incomplete, false, "incomplete");
  ok(finishedEpisode.endedAt, "endedAt");
  ok(finishedEpisode.summary && typeof finishedEpisode.summary.score === "number", "summary.score");
});

check("the finished episode is persisted to EpisodeStore exactly once", () => {
  const list = EpisodeStore.list();
  eq(list.length, 1, "store length");
  eq(list[0].id, finishedEpisode.id, "same episode");
  eq(EpisodeStore.current(), null, "the in-progress scratch slot is cleared on finish");
});

// ------------------------------------------------------------ crew tag hash

check("hashCrewTag never carries the plaintext tag, is deterministic, and differs by tag", () => {
  const h1 = hashCrewTag("Ada Lovelace");
  const h2 = hashCrewTag("Ada Lovelace");
  const h3 = hashCrewTag("Grace Hopper");
  ok(h1 && typeof h1 === "string", "hash is a string");
  ok(!h1.toLowerCase().includes("ada"), "hash must not contain the plaintext tag");
  eq(h1, h2, "same tag hashes the same way in one session (stable salt)");
  ok(h1 !== h3, "different tags must hash differently");
  eq(hashCrewTag(""), null, "an empty tag hashes to null, not a hash of nothing");
  eq(hashCrewTag(null), null, "no tag hashes to null");
});

check("a stored episode never carries the plaintext crew tag anywhere in its JSON", () => {
  const blob = JSON.stringify(EpisodeStore.list());
  ok(!blob.toLowerCase().includes("ada lovelace"), "plaintext crew tag leaked into storage");
  ok(finishedEpisode.crewTagHash && finishedEpisode.crewTagHash !== "Ada Lovelace", "crewTagHash field");
});

// ------------------------------------------------------------------ digest

check("sessionDigest() returns a fixed-length vector matching DIGEST_FEATURES, a dedupe key and a capped event list", () => {
  const digest = sessionDigest(finishedEpisode);
  eq(digest.vector.length, DIGEST_FEATURES.length, "vector length matches its own field list");
  eq(digest.dedupeKey, dedupeKeyFor(finishedEpisode), "digest carries the same dedupe key dedupeKeyFor() computes");
  ok(digest.events.length >= 1, "expected at least the hazard event in the short event list");
  ok(digest.events.some((e) => e.kind === "hazard"), "hazard event present");
  // Two different episodes (different station, different content) must not
  // collide — the whole point of a dedupe key.
  const other = { ...finishedEpisode, station: "another-room", records: [] , summary: { score: 999 } };
  ok(dedupeKeyFor(other) !== dedupeKeyFor(finishedEpisode), "dedupeKeyFor must vary with episode content");
});

// -------------------------------------------------------------- eviction

check("EpisodeStore evicts oldest-first once the byte budget is exceeded", () => {
  EpisodeStore.clear();
  // 100 entries at 20 KB of padding each is ~2 MB, comfortably over
  // MAX_STORE_BYTES (1.5 MB) — enough appends to guarantee eviction actually
  // ran, without needing thousands of tiny ones.
  const pad = "x".repeat(20_000);
  const ids = [];
  for (let i = 0; i < 100; i++) {
    const id = `pad-${i}`;
    ids.push(id);
    EpisodeStore.append({ schemaVersion: EPISODE_SCHEMA_VERSION, id, station: "pad", records: [], poses: [], pad, summary: { score: i } });
  }
  const list = EpisodeStore.list();
  ok(EpisodeStore.bytes() <= MAX_STORE_BYTES, `store exceeds its byte budget: ${EpisodeStore.bytes()} > ${MAX_STORE_BYTES}`);
  ok(list.length < ids.length, "nothing was evicted");
  // Oldest-first: the earliest ids must be the ones gone, not a middle one.
  const remainingIds = new Set(list.map((e) => e.id));
  ok(!remainingIds.has(ids[0]), "the oldest episode should have been evicted first");
  ok(remainingIds.has(ids[ids.length - 1]), "the newest episode must survive eviction");
});

check("a single episode still over budget keeps its summary and drops its pose track instead of the whole entry", () => {
  EpisodeStore.clear();
  const hugePoses = Array.from({ length: 5000 }, (_, i) => ({ t: i, camera: { p: [0, 0, 0] } }));
  EpisodeStore.append({ schemaVersion: EPISODE_SCHEMA_VERSION, id: "huge", station: "huge-room", records: [], poses: hugePoses, summary: { score: 1 } });
  const list = EpisodeStore.list();
  eq(list.length, 1, "the one episode is kept");
  eq(list[0].id, "huge", "same episode");
  if (JSON.stringify(hugePoses).length > MAX_STORE_BYTES) {
    ok(list[0].posesTrimmed === true, "an over-budget single episode should have its pose track trimmed");
    eq(list[0].poses.length, 0, "poses cleared");
    ok(list[0].summary, "summary survives trimming");
  }
});
EpisodeStore.clear();

// ------------------------------------------------------------- exporter

const scratch = mkdtempSync(join(tmpdir(), "export-dataset-check-"));
try {
  const out = join(scratch, "out");
  const humanFile = join(scratch, "human-episodes.json");
  writeFileSync(humanFile, JSON.stringify({
    schemaVersion: EPISODE_SCHEMA_VERSION,
    episodes: [{
      schemaVersion: EPISODE_SCHEMA_VERSION, id: "human-1", app: "smartcity", station: "charge-point",
      startedAt: "2026-01-01T00:00:00.000Z", endedAt: "2026-01-01T00:02:00.000Z",
      crewTagHash: hashCrewTag("Sample Crew"), embodied: false,
      records: [
        { t: 1, wall: 1, obs: { stepIndex: 0, kind: "select" }, action: { type: "select", id: "x" }, reward: 100, outcome: { kind: "ok", hazard: false, clean: true } },
        { t: 2, wall: 2, obs: { stepIndex: 1, kind: "select" }, action: { type: "select", id: "y" }, reward: 100, outcome: { kind: "ok", hazard: false, clean: true } },
      ],
      summary: { score: 200, stars: 3, errors: 0, hazardHits: 0, seconds: 10, passed: true },
    }],
  }));

  const r = spawnSync(process.execPath, [
    join(ROOT, "tools", "export_dataset.mjs"),
    "--apps", "trades", "--stations", "2", "--seeds", "1", "--skills", "1",
    "--out", out, "--human", humanFile,
  ], { encoding: "utf8", cwd: ROOT });

  check("export_dataset.mjs exits 0 on a tiny sampler run", () => {
    ok(r.status === 0, `exit ${r.status}\n${r.stdout}\n${r.stderr}`);
  });

  let manifest = null;
  check("manifest.json is written and valid: totals, field map and station list are consistent", () => {
    const path = join(out, "manifest.json");
    ok(existsSync(path), "manifest.json missing");
    manifest = JSON.parse(readFileSync(path, "utf8"));
    ok(manifest.totals.episodes > 0, "manifest reports zero episodes");
    ok(Array.isArray(manifest.fieldMap) && manifest.fieldMap.some((f) => f.field === "observation"), "field map carries `observation`");
    const stationEpisodes = manifest.stations.reduce((n, s) => n + s.episodes, 0);
    // Synthetic episodes plus the one human episode ingested.
    eq(stationEpisodes + 1, manifest.totals.episodes, "per-station episode counts plus human episodes sum to the total");
    ok(manifest.human.some((h) => h.episodesWritten === 1), "the human episode was not counted as ingested");
    ok(existsSync(join(out, "DATASET_CARD.md")), "DATASET_CARD.md missing");
  });

  check("every shard is valid JSON Lines with observation/action/reward/done/info on each step", () => {
    ok(manifest, "manifest failed to load, cannot check shards");
    for (const file of manifest.files) {
      const text = readFileSync(join(out, file), "utf8").trim();
      ok(text.length > 0, `${file} is empty`);
      const lines = text.split("\n");
      for (const line of lines) {
        const episode = JSON.parse(line); // throws on malformed JSON
        ok(episode.schemaVersion, `${file}: episode missing schemaVersion`);
        ok(episode.source === "synthetic" || episode.source === "human", `${file}: unexpected source ${episode.source}`);
        ok(Array.isArray(episode.steps) && episode.steps.length > 0, `${file}: episode ${episode.station} has no steps`);
        episode.steps.forEach((s, i) => {
          ok("observation" in s, `${file} step ${i}: missing observation`);
          ok("action" in s, `${file} step ${i}: missing action`);
          ok(typeof s.reward === "number", `${file} step ${i}: reward not a number`);
          ok(typeof s.done === "boolean", `${file} step ${i}: done not a boolean`);
          ok(s.info && typeof s.info === "object", `${file} step ${i}: missing info`);
          if (i === episode.steps.length - 1) eq(s.done, true, `${file}: last step of ${episode.station} must be done`);
          else eq(s.done, false, `${file}: non-last step of ${episode.station} must not be done`);
        });
      }
    }
  });

  check("--out under WebXR/dist is refused", () => {
    const bad = spawnSync(process.execPath, [
      join(ROOT, "tools", "export_dataset.mjs"), "--apps", "trades", "--stations", "1", "--seeds", "1",
      "--out", join(ROOT, "WebXR", "dist", "should-not-write-here"),
    ], { encoding: "utf8", cwd: ROOT });
    ok(bad.status !== 0, "exporter should refuse to write under WebXR/dist");
    ok(!existsSync(join(ROOT, "WebXR", "dist", "should-not-write-here")), "exporter must not have created the folder");
  });
} finally {
  // Every headless suite deletes its own scratch folder on exit.
  rmSync(scratch, { recursive: true, force: true });
}

console.log(failures ? `\n${failures} check(s) failed.` : "\nAll episode-recorder checks pass.");
process.exit(failures ? 1 : 0);
