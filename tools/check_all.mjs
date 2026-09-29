/**
 * Runs every headless checker in this folder and reports one line each —
 * the single command CI and a contributor both run before pushing.
 *
 *     node tools/check_all.mjs
 *     CHECK_JOBS=1 node tools/check_all.mjs      # the old one-at-a-time run
 *     CHECK_JOBS=4 node tools/check_all.mjs      # a fixed pool of four
 *
 * Console PROVING (docs/consoles/PROVING.md): the checkers are independent
 * processes that never write into the tree (each writes under its own
 * scratch dir), so after the two gatekeepers — check_parse, then
 * check_imports, which ask whether the code can run at all — the rest run in
 * a pool. The pool respects the shared machine: a checker starts only while
 * the weighted number running is under the job limit, and the limit itself
 * follows the one-minute load average (cores minus the load other people
 * put on the box, never under 1, never over CHECK_JOBS or the core count).
 * Browser checkers weigh two: headless Chromium under SwiftShader uses more
 * than one core and more than one of them at once slows both. Every
 * assertion is still run by its checker exactly as before — this file only
 * schedules them.
 *
 * Each run is recorded to docs/perf/checkers-last.json (per-checker ms, the
 * wall time, the sum of the checker times — what the one-at-a-time run would
 * have taken — the job limit used and the load average), which
 * tools/check_proving.mjs compares to docs/perf/checkers-baseline.json.
 */
import { spawn } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { availableParallelism, loadavg } from "node:os";
import { mkdirSync, writeFileSync } from "node:fs";

const here = dirname(fileURLToPath(import.meta.url));
const CHECKERS = [
  // First, because every other checker reads these files after deleting the
  // part of them most likely to be malformed.
  "check_parse.mjs",
  // Straight after parse, for the same reason: both ask whether the code can
  // run at all, before anything asks whether the content is right.
  "check_imports.mjs",
  "check_smartcity.mjs", "check_trades.mjs", "check_holodeck.mjs",
  "check_records.mjs", "check_identity.mjs", "check_lrs.mjs", "check_share.mjs", "check_episodes.mjs", "check_dataset_tools.mjs", "check_robot.mjs",
  // The skill registry, the export layouts and the draft platform agent (docs/agent-roadmap.md).
  "check_agent.mjs",
  // SmartCiti.X on the Virtuals agent platform: package, offerings, provider stub (docs/virtuals/strategy.md).
  "check_virtuals.mjs",
  "check_platform.mjs", "check_lti.mjs", "check_orbis_stable.mjs", "check_verify.mjs", "check_observer.mjs", "check_budget.mjs", "check_layout.mjs",
  "check_interrupts.mjs", "check_events.mjs", "check_lessons.mjs", "check_hands.mjs", "check_variants.mjs", "check_incidents.mjs", "check_crew.mjs",
  "check_devices.mjs", "check_input.mjs", "check_standards.mjs", "check_console.mjs", "check_competency.mjs", "check_models.mjs",
  "check_flowhub.mjs",
  // The four classroom programmes, their stations, flows and world anchors (docs/k12.md).
  "check_k12.mjs",
  // SCHOLAR: K-12 lesson sessions in the worlds, the scoreboard and the class board (docs/consoles/SCHOLAR.md).
  "check_scholar.mjs",
  "check_home.mjs", "check_districts.mjs", "check_ladders.mjs", "check_tracks.mjs", "check_signage.mjs", "check_fleet.mjs",
  "check_race.mjs", "check_arcade.mjs", "check_eggs.mjs", "check_eggs_app.mjs", "check_treasures.mjs", "check_props.mjs", "check_textures.mjs", "check_fairway_game.mjs",
  "check_fairway.mjs", "check_bayworld_game.mjs", "check_bay_quests.mjs", "check_bayworld.mjs", "check_mapbox.mjs",
  "check_gates.mjs",
  // The five New Orleans parishes' play layer: the storm-season arc, side games, hand-offs, path boards (docs/parish-play.md).
  "check_parish_play.mjs",
  "check_krewe.mjs",
  // The Motor Pool: fifty drivables and twenty watercraft, their kit, gates and drive runs (docs/consoles/MOTORPOOL.md).
  "check_drivables.mjs",
  "check_unity_export.mjs",
  "check_sky.mjs",
  "check_regatta.mjs",
  "check_underwater.mjs", "check_underwater_game.mjs", "check_dive_quests.mjs",
  // Redwood Reach, the forest world (docs/consoles/REDWOOD.md).
  "check_redwood.mjs",
  "check_summit.mjs",
  // The New Orleans parish worlds: every parish's data validates, the terrain builds headless in budget, connectors pair (docs/consoles/PARISH.md).
  "check_parishes.mjs",
  // The parish data modules on the shared parish schema (docs/parishes.md, console DELTA); PARISH's check_parishes absorbs it.
  "check_parish_data.mjs",
  // NPC characters that pass knowledge along: verbatim lines, hand-offs, placement, the phone panel (docs/consoles/GRIOT.md).
  "check_npc.mjs",
  "check_investor.mjs",
  "check_mobile.mjs",
  // One learner, one ledger, one set of records across every app (docs/interop.md).
  "check_interop.mjs",
  "check_ui.mjs",
  // The Guide on every page, its knowledge base and its answers (docs/consoles/COMPASS.md).
  "check_guide.mjs",
  // Every open-world link, in the repo layout and the flat build (tools/briefs/links-brief.md).
  "check_links.mjs",
  "check_treasures_live.mjs",
  // The account chip, the free demo and one private profile per person (docs/sign-in.md).
  "check_auth.mjs",
  // The organisation layer: cohorts, the cohort view, the enterprise block, audit and privacy (docs/enterprise.md).
  "check_enterprise.mjs",
  // Enterprise seat billing: the payments block, the adapter and mock, the budget agent, the Billing tab, the Worker handler (docs/payments.md).
  "check_payments.mjs",
  // 21 languages: the tables, the picker, RTL and a headless language switch (docs/i18n.md).
  "check_i18n.mjs",
  // Titles, descriptions, canonical, Open Graph, JSON-LD, the sitemap and phone usability on every page (docs/consoles/WAYFINDER.md).
  "check_seo.mjs",
  // One design system: the shared stylesheet on every page, self-hosted fonts,
  // credited vendored packs, no emoji icons in the chrome, AA token pairs (docs/design-system/README.md).
  "check_design.mjs",
  // Layered maps, interactive assets, service liveries and avatar styles (docs/consoles/CARTOGRAPHER.md).
  "check_worlds_detail.mjs",
  // The Cloudflare deployment: wrangler.toml, the edge files, the /api router, the deploy agent's plan (docs/deploy-cloudflare.md).
  "check_deploy.mjs",
  // The perf files, their budgets and the checkers' own speed (docs/consoles/PROVING.md).
  "check_proving.mjs",
];

// The two gatekeepers run alone and in order, then the two checkers that
// rewrite a generated file in the tree (check_interop regenerates
// shared/passport-programmes.js, which check_gates and check_links read;
// check_standards rewrites docs/standards/README.md) — under a second
// together, and nothing may read those files while they are written.
// Everything after them may run together. Browser checkers (headless
// Chromium) weigh two slots.
const SERIAL_FIRST = ["check_parse.mjs", "check_imports.mjs", "check_interop.mjs", "check_standards.mjs"];
const HEAVY = new Set(["check_links.mjs", "check_ui.mjs", "check_guide.mjs", "check_home.mjs", "check_mobile.mjs", "check_i18n.mjs"]);
const weightOf = (name) => (HEAVY.has(name) ? 2 : 1);

const CORES = Math.max(1, availableParallelism());
const MAX_JOBS = Math.max(1, Math.min(CORES, Number(process.env.CHECK_JOBS) || CORES));

/** How many weighted slots may run right now: the cores that the rest of the
 *  machine is not using (the load average less what we run ourselves). */
function jobLimit(running) {
  if (process.env.CHECK_JOBS) return MAX_JOBS;
  const others = Math.max(0, loadavg()[0] - running);
  return Math.max(1, Math.min(MAX_JOBS, Math.floor(CORES - others + 0.5)));
}

function runOne(name) {
  return new Promise((resolve) => {
    const started = Date.now();
    let out = "";
    const child = spawn(process.execPath, [join(here, name)], { stdio: ["ignore", "pipe", "pipe"] });
    child.stdout.on("data", (d) => { out += d; });
    child.stderr.on("data", (d) => { out += d; });
    child.on("close", (status) => resolve({ name, ok: status === 0, ms: Date.now() - started, out: out.trim() }));
    child.on("error", (e) => resolve({ name, ok: false, ms: Date.now() - started, out: String(e) }));
  });
}

const results = new Map();
let failed = 0;
function report(r) {
  results.set(r.name, r);
  const tail = r.out.split("\n").filter(Boolean).pop() ?? "";
  console.log(`${r.ok ? "✓" : "✗"} ${r.name.padEnd(24)} ${String(r.ms).padStart(6)} ms  ${tail}`);
  if (!r.ok) { failed += 1; console.log(r.out); }
}

const wallStart = Date.now();
const loadAtStart = loadavg()[0];
// The load's peak across the run, sampled every five seconds: other work that starts and stops mid-run (a console's
// own checkers) leaves both ends quiet, and check_proving judges a run's times only when the peak stayed low too.
let loadPeak = loadAtStart;
const loadSampler = setInterval(() => { loadPeak = Math.max(loadPeak, loadavg()[0]); }, 5000);
loadSampler.unref();
for (const name of SERIAL_FIRST) report(await runOne(name));

const queue = CHECKERS.filter((n) => !SERIAL_FIRST.includes(n));
let running = 0, runningWeight = 0, peak = 0;
const limitsSeen = [];
await new Promise((done) => {
  const pump = () => {
    while (queue.length) {
      const limit = jobLimit(running);
      const w = weightOf(queue[0]);
      // Never starve a heavy checker: it may start when nothing else runs.
      if (running && runningWeight + w > limit) break;
      const name = queue.shift();
      running += 1; runningWeight += w; peak = Math.max(peak, running); limitsSeen.push(limit);
      runOne(name).then((r) => { running -= 1; runningWeight -= w; report(r); if (!queue.length && !running) done(); else pump(); });
    }
    if (!queue.length && !running) done();
  };
  pump();
});

const wallMs = Date.now() - wallStart;
const sumMs = [...results.values()].reduce((a, r) => a + r.ms, 0);
const record = {
  at: new Date().toISOString(), cores: CORES, maxJobs: MAX_JOBS, peakParallel: peak,
  loadAvgStart: +loadAtStart.toFixed(2), loadAvgEnd: +loadavg()[0].toFixed(2), loadAvgPeak: +Math.max(loadPeak, loadavg()[0]).toFixed(2), wallMs, sumMs,
  checkers: Object.fromEntries(CHECKERS.map((n) => [n, { ms: results.get(n)?.ms ?? null, ok: results.get(n)?.ok ?? false }])),
};
try {
  mkdirSync(join(here, "..", "docs", "perf"), { recursive: true });
  writeFileSync(join(here, "..", "docs", "perf", "checkers-last.json"), JSON.stringify(record, null, 2) + "\n");
} catch { /* a read-only checkout still gets its verdict */ }

const sec = (ms) => (ms / 1000).toFixed(1);
console.log(`\n${sec(wallMs)} s wall for ${sec(sumMs)} s of checker time (up to ${peak} at once on ${CORES} cores; load ${loadAtStart.toFixed(1)} → ${loadavg()[0].toFixed(1)}).`);
console.log(failed ? `\n${failed} checker(s) failed.` : `\nAll ${CHECKERS.length} checkers pass.`);
process.exit(failed ? 1 : 0);
