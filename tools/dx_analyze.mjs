#!/usr/bin/env node
// DATAWORKS headless analysis (docs/robot-datasets.md "The consented data system"): the same numbers the
// analysis page (WebXR/data/index.html) shows, from exported episodes, computed by shared/dx-data.js dxAnalyze().
//
//   node tools/dx_analyze.mjs <export-dir | shard.jsonl | episodes.json> ... [--json] [--export <out-dir>]
//   node tools/dx_analyze.mjs --fixture [--json]          the deterministic synthetic fixture
//
// Inputs: an export directory (manifest.json + data/*.jsonl), a JSON Lines shard, a JSON array of schema-2
// episodes, or a legacy shared/episodes.js export (schema 1 — converted with dxFromLegacy). Local files only;
// this tool makes no network call. `--export` re-shards what it read into JSON Lines + manifest + dataset card.

import { readFileSync, writeFileSync, mkdirSync, existsSync, statSync } from "node:fs";
import { join, dirname } from "node:path";
import { dxAnalyze, dxParseJsonl, dxValidateEpisode, dxExportFiles, dxSyntheticFixture, DX_SCHEMA_ID } from "../WebXR/shared/dx-data.js";

const args = process.argv.slice(2);
const flag = (f) => args.includes(f);
const opt = (f) => { const i = args.indexOf(f); return i >= 0 ? args[i + 1] : null; };
const inputs = args.filter((a, i) => !a.startsWith("--") && args[i - 1] !== "--export");

async function readEpisodes(path) {
  if (statSync(path).isDirectory()) {
    const man = JSON.parse(readFileSync(join(path, "manifest.json"), "utf8"));
    return man.shards.flatMap((s) => dxParseJsonl(readFileSync(join(path, s.path), "utf8")));
  }
  const text = readFileSync(path, "utf8");
  if (path.endsWith(".jsonl")) return dxParseJsonl(text);
  const raw = JSON.parse(text);
  const list = Array.isArray(raw) ? raw : raw.episodes ?? [];
  const legacy = list.filter((e) => e && e.schema !== DX_SCHEMA_ID && Array.isArray(e.records));
  if (!legacy.length) return list;
  const { dxFromLegacy } = await import("../WebXR/shared/dx-capture.js");
  return list.map((e) => (legacy.includes(e) ? dxFromLegacy(e, { consent: null }) : e));
}

let episodes = [];
if (flag("--fixture")) episodes = dxSyntheticFixture();
for (const p of inputs) {
  if (!existsSync(p)) { console.error(`dx_analyze: no such input ${p}`); process.exit(2); }
  episodes.push(...(await readEpisodes(p)));
}
if (!episodes.length) { console.error("usage: node tools/dx_analyze.mjs <export-dir|shard.jsonl|episodes.json> … | --fixture [--json] [--export dir]"); process.exit(2); }

const invalid = episodes.map((e) => [e?.episodeId, dxValidateEpisode(e)]).filter(([, v]) => !v.ok);
const a = dxAnalyze(episodes);

if (flag("--json")) {
  console.log(JSON.stringify({ ...a, invalid: invalid.map(([id, v]) => ({ id, errors: v.errors })) }, null, 2));
} else {
  const pct = (x) => (x == null ? "—" : `${Math.round(x * 100)}%`);
  console.log(`dx_analyze — ${a.schema}`);
  console.log(`  episodes ${a.total} (human ${a.bySource.human}, synthetic ${a.bySource.synthetic}) · success ${pct(a.successRate)} · safe practice ${pct(a.safeRate)}`);
  console.log("  by scenario:");
  for (const [k, r] of Object.entries(a.byScenario)) console.log(`    ${k.padEnd(44)} ${String(r.episodes).padStart(4)} ep · success ${pct(r.successRate).padStart(4)} · safe ${pct(r.safeRate).padStart(4)} · mean ${r.meanDurationS}s`);
  console.log(`  step durations: n ${a.stepDurations.n} · mean ${a.stepDurations.meanS}s · median ${a.stepDurations.medianS}s · p90 ${a.stepDurations.p90S}s`);
  console.log(`  interruptions: answered ${a.interrupts.answered} · missed ${a.interrupts.missed} · wrong ${a.interrupts.wrong} · response rate ${pct(a.interrupts.responseRate)} · mean response ${a.interrupts.meanResponseS ?? "—"}s`);
  console.log(`  errors: ${Object.entries(a.errors).map(([k, v]) => `${k} ${v}`).join(" · ") || "none"}`);
  console.log(`  actions: ${Object.entries(a.actions).map(([k, v]) => `${k} ${v}`).join(" · ")}`);
  console.log(`  quality flags: truncated ${a.flags.truncated} · idle ${a.flags.idle} · duplicate ${a.flags.duplicate}`);
  console.log(`  split by session hash: train ${a.split.train} · validation ${a.split.validation} · sessions in both ${a.split.sessionOverlap}`);
  if (invalid.length) console.log(`  ✗ ${invalid.length} episode(s) fail the schema: ${invalid.slice(0, 3).map(([id, v]) => `${id}: ${v.errors[0]}`).join("; ")}`);
}

const out = opt("--export");
if (out) {
  const { files, manifest } = dxExportFiles(episodes, { generator: "tools/dx_analyze.mjs" });
  for (const f of files) { const p = join(out, f.path); mkdirSync(dirname(p), { recursive: true }); writeFileSync(p, f.text); }
  console.log(`  exported ${manifest.counts.episodes} episodes in ${manifest.shards.length} shard(s) + manifest.json + DATASET_CARD.md to ${out}`);
}
if (!flag("--json")) console.log(`dx_analyze: ${a.total} episodes, success ${a.successRate}, safe ${a.safeRate}, flags ${a.flags.truncated}/${a.flags.idle}/${a.flags.duplicate}, ${invalid.length} invalid`);
process.exit(invalid.length ? 1 : 0);
