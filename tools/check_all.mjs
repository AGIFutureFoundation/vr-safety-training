/**
 * Runs every headless checker in this folder and reports one line each —
 * the single command CI and a contributor both run before pushing.
 *
 *     node tools/check_all.mjs
 *     CHECK_JOBS=1 node tools/check_all.mjs      # the old one-at-a-time run
 *     CHECK_JOBS=4 node tools/check_all.mjs      # a fixed pool of four
 *     CHECK_ONLY=check_mobile.mjs node tools/check_all.mjs   # re-measure one checker; only its row in checkers-last.json changes
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
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";

const here = dirname(fileURLToPath(import.meta.url));
const CHECKERS = [
  // First, because every other checker reads these files after deleting the
  // part of them most likely to be malformed.
  "check_parse.mjs",
  // Straight after parse, for the same reason: both ask whether the code can
  // run at all, before anything asks whether the content is right.
  "check_imports.mjs",
  "check_smartcity.mjs", "check_trades.mjs", "check_holodeck.mjs",
  "check_records.mjs", "check_identity.mjs", "check_lrs.mjs", "check_share.mjs", "check_episodes.mjs", "check_dataset_tools.mjs", "check_dataworks.mjs", "check_robot.mjs",
  // The skill registry, the export layouts and the draft platform agent (docs/agent-roadmap.md).
  "check_agent.mjs",
  // SmartCiti.X on the Virtuals agent platform: package, offerings, provider stub (docs/virtuals/strategy.md).
  "check_virtuals.mjs",
  "check_platform.mjs", "check_lti.mjs", "check_orbis_stable.mjs", "check_verify.mjs", "check_observer.mjs", "check_budget.mjs", "check_layout.mjs",
  "check_interrupts.mjs", "check_events.mjs", "check_lessons.mjs", "check_hands.mjs", "check_variants.mjs", "check_incidents.mjs", "check_crew.mjs", "check_avatars.mjs",
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
  "check_playlayer.mjs",
  // TYCOON: the Crew Credits play economy — arithmetic, procedural listings, businesses on real stations, never money (docs/consoles/TYCOON.md).
  "check_tycoon.mjs",
  "check_krewe.mjs",
  // MENAGERIE: pets, animals and passers-by on the parish maps and Bay World (docs/consoles/MENAGERIE.md).
  "check_menagerie.mjs",
  // STORYLINE: the seven paths, their side stories and the chosen path (docs/consoles/STORYLINE.md).
  "check_storyline.mjs",
  "check_drills.mjs",
  // BAYQUEST: the Bay Program play layer: the Bay Keeper's Trail, four gated games, Crew Credits, stories (docs/consoles/BAYQUEST.md).
  "check_bayquest.mjs",
  // PROJECTSIM: the Bay Program project simulations (docs/consoles/PROJECTSIM.md).
  "check_projectsim.mjs",
  // CLASSROOMS: rooms that teach — K-12 classrooms, union training centres, programme rooms (docs/consoles/CLASSROOMS.md).
  "check_classrooms.mjs",
  // The Motor Pool: fifty drivables and twenty watercraft, their kit, gates and drive runs (docs/consoles/MOTORPOOL.md).
  "check_drivables.mjs",
  // NEWTON: gravity, walls, wading and swimming, crashes and the after-a-collision card (docs/consoles/NEWTON.md).
  "check_newton.mjs",
  "check_motorworks.mjs",
  // WALKABLE: walk-through connectors round-trip, soft edges, the region atlas (docs/consoles/WALKABLE.md).
  "check_walkable.mjs",
  // ROBOTICS: the gym API, robot sites and games, rollouts in the dataset schema (docs/consoles/ROBOTICS.md).
  "check_robotics.mjs",
  // COLEARN: behaviour cloning from consented/synthetic demonstrations, the robot-demonstrates ghost, the bandit tutor (docs/consoles/COLEARN.md).
  "check_colearn.mjs",
  // AGENTGYM: stations as agent tasks — determinism, scoring parity with the human station, offline, consented ratings (docs/consoles/AGENTGYM.md).
  "check_agentgym.mjs",
  // SILICA: the ConstructionVR drilling-dust study as a station, the opt-in reaction-time eval, aggregates only (docs/consoles/SILICA.md).
  "check_silica.mjs",
  // REACTOR: the engine's hot-path shortcuts are exact, and the per-map boot and streaming profile (docs/consoles/REACTOR.md).
  "check_reactor.mjs",
  // CLEANPORTS: zero-emission port stations, drivables and the WOJRC zero-emission careers level (docs/consoles/CLEANPORTS.md).
  "check_cleanports.mjs",
  "check_unity_export.mjs",
  // The SmartCiti.X Powered by AGI Corp Holodeck Packs: manifests, registry, page, per-pack export (docs/consoles/PACKS.md).
  "check_packs.mjs",
  // COGNITION: the K-12 learning module — unit -> lesson -> flow, adaptive re-teach, the in-world runner (docs/consoles/COGNITION.md).
  "check_cognition.mjs",
  // BAYKEEPER: the Bay Program hub — figures vs the facts, project→station links, union tags, stations 95+ (docs/consoles/BAYKEEPER.md).
  "check_bayprogram.mjs",
  "check_academy.mjs",
  // LA-PROGRAMME: the Louisiana programme — facts, guarded map/site ids, matrix, pathways, sims (docs/consoles/LA-PROGRAMME.md).
  "check_la_programme.mjs",
  "check_robotics_programme.mjs",
  // ROBOTRAIN: the four gap stations, the controller-pose teleoperation recorder, recorded vs synthetic BC (docs/consoles/ROBOTRAIN.md).
  "check_robotrain.mjs",
  // ROBOSCENARIOS: the construction drilling robot and the port lane as gym scenarios — determinism, expert beats random, the person-inside-barricade and stop-zone invariants, policy results (docs/consoles/ROBOSCENARIOS.md).
  "check_roboscenarios.mjs",
  // VBRIDGE: software-agent jobs reach simulated robots only, through the safety governor (docs/consoles/VBRIDGE.md).
  "check_vbridge.mjs",
  // LA-COHORTS: Louisiana lesson flows and apply games, classroom boards, Home links, cohort run sheets (docs/consoles/LA-COHORTS.md).
  "check_la_cohorts.mjs",
  "check_geo.mjs",
  "check_sky.mjs",
  "check_regatta.mjs",
  "check_underwater.mjs", "check_underwater_game.mjs", "check_dive_quests.mjs",
  // Redwood Reach, the forest world (docs/consoles/REDWOOD.md).
  "check_redwood.mjs",
  "check_summit.mjs",
  // The New Orleans parish worlds: every parish's data validates, the terrain builds headless in budget, connectors pair (docs/consoles/PARISH.md).
  "check_parishes.mjs",
  // PALETTE: colour categories, pixel painters and the massing material hook (docs/consoles/PALETTE.md).
  "check_palette.mjs",
  "check_landmarks.mjs",
  // INTERIORS: every room style builds in budget, every site kind maps to a style, enter/exit round-trips, stations launch inside (docs/consoles/INTERIORS.md).
  "check_interiors.mjs",
  "check_la_rooms.mjs",
  // The parish data modules on the shared parish schema (docs/parishes.md, console DELTA); PARISH's check_parishes absorbs it.
  "check_parish_data.mjs",
  // SMILES: the Unspoken Smiles District — stations resolve, game lines trace to the stations, K-12 only in K-12 spots (docs/consoles/SMILES.md).
  "check_smiles.mjs",
  // TERRAFORM: channels below their banks, rivers flowing downstream, deterministic wind, cover off roads/water/pads, budgets (docs/consoles/TERRAFORM.md).
  "check_terraform.mjs",
  // CITYWORKS: street fabric in the field and off water, road graph components, sidewalks dry, a collider per building, budgets (docs/consoles/CITYWORKS.md).
  "check_cityworks.mjs",
  // ATMOS: deterministic weather, lamps at dusk/dawn, fog never hides a board, a silent-by-default synth soundscape, budgets (docs/consoles/ATMOS.md).
  "check_atmos.mjs",
  // FACADES: exterior detail kits per massing kind and region, per-chunk budgets per tier, generic sign words only, determinism (docs/consoles/FACADES.md).
  "check_facades.mjs",
  "check_detail.mjs",
  // INTERFACE: the parishes menu in four tabs, every mount reachable, keyboard/gamepad order, 44 px touch at 390x844, onboarding (docs/consoles/INTERFACE.md).
  "check_interface.mjs",
  // HARVEST: hidden fishing, crab, crawfish, rice and gator-watch spots — beside water, regional species, figure-free lines, adult gate, pay once (docs/consoles/HARVEST.md).
  "check_harvest.mjs",
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
  // DEAN: versions, modules, the world apply step and the Trade Craft Academy shared export (docs/modules.md).
  "check_dean.mjs",
  "check_bridge.mjs",
  // Enterprise seat billing: the payments block, the adapter and mock, the budget agent, the Billing tab, the Worker handler (docs/payments.md).
  "check_payments.mjs",
  // ENTERPRISE-3: training-data governance (consent registry, dataset cards, lineage, audit chain, revoke), the robot fleet registry and the off-by-default billing adapters (docs/billing-adapters.md).
  "check_enterprise3.mjs",
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

// Each checker's own load window (the one-minute average at its start and end, and the peak the five-second sampler
// saw while it ran), recorded beside its time so check_proving can judge a time only when the machine was quiet
// during that checker — console CI-GREEN: a run-level "quiet at both ends" let a time measured under a mid-run load
// spike be judged against the baseline.
const live = new Set();
function runOne(name) {
  return new Promise((resolve) => {
    const started = Date.now(), loadStart = loadavg()[0], win = { peak: loadStart };
    live.add(win);
    let out = "";
    const finish = (ok, text) => {
      live.delete(win);
      const loadEnd = loadavg()[0];
      resolve({ name, ok, ms: Date.now() - started, out: text, loadStart: +loadStart.toFixed(2), loadEnd: +loadEnd.toFixed(2), loadPeak: +Math.max(win.peak, loadEnd).toFixed(2) });
    };
    const child = spawn(process.execPath, [join(here, name)], { stdio: ["ignore", "pipe", "pipe"] });
    child.stdout.on("data", (d) => { out += d; });
    child.stderr.on("data", (d) => { out += d; });
    child.on("close", (status) => finish(status === 0, out.trim()));
    child.on("error", (e) => finish(false, String(e)));
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
const loadSampler = setInterval(() => { const l = loadavg()[0]; loadPeak = Math.max(loadPeak, l); for (const w of live) w.peak = Math.max(w.peak, l); }, 5000);
loadSampler.unref();
// CHECK_ONLY=check_mobile.mjs,check_ui.mjs re-measures the named checkers alone and updates only their rows in
// docs/perf/checkers-last.json (each row carries its own load window); the rest of the record stands.
const ONLY = (process.env.CHECK_ONLY ?? "").split(",").map((s) => s.trim()).filter(Boolean);
const unknown = ONLY.filter((n) => !CHECKERS.includes(n));
if (unknown.length) { console.log(`CHECK_ONLY names checkers not in the list: ${unknown.join(", ")}`); process.exit(2); }
const RUN = ONLY.length ? CHECKERS.filter((n) => ONLY.includes(n)) : CHECKERS;
for (const name of SERIAL_FIRST.filter((n) => RUN.includes(n))) report(await runOne(name));

const queue = RUN.filter((n) => !SERIAL_FIRST.includes(n));
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
const row = (n) => { const r = results.get(n); return { ms: r?.ms ?? null, ok: r?.ok ?? false, loadStart: r?.loadStart ?? null, loadEnd: r?.loadEnd ?? null, loadPeak: r?.loadPeak ?? null }; };
const LAST = join(here, "..", "docs", "perf", "checkers-last.json");
let record = {
  at: new Date().toISOString(), cores: CORES, maxJobs: MAX_JOBS, peakParallel: peak,
  loadAvgStart: +loadAtStart.toFixed(2), loadAvgEnd: +loadavg()[0].toFixed(2), loadAvgPeak: +Math.max(loadPeak, loadavg()[0]).toFixed(2), wallMs, sumMs,
  checkers: Object.fromEntries(CHECKERS.map((n) => [n, row(n)])),
};
if (ONLY.length) {
  // A partial run: only the named rows change; the full run's record (its times, load and wall) stands around them.
  let prev = null;
  try { prev = JSON.parse(readFileSync(LAST, "utf8")); } catch { /* no record yet: the partial rows stand alone */ }
  record = { ...(prev ?? record), checkers: { ...(prev?.checkers ?? {}), ...Object.fromEntries(RUN.map((n) => [n, row(n)])) }, remeasured: { at: record.at, checkers: RUN } };
}
try {
  mkdirSync(join(here, "..", "docs", "perf"), { recursive: true });
  writeFileSync(LAST, JSON.stringify(record, null, 2) + "\n");
} catch { /* a read-only checkout still gets its verdict */ }

const sec = (ms) => (ms / 1000).toFixed(1);
console.log(`\n${sec(wallMs)} s wall for ${sec(sumMs)} s of checker time (up to ${peak} at once on ${CORES} cores; load ${loadAtStart.toFixed(1)} → ${loadavg()[0].toFixed(1)}).`);
console.log(failed ? `\n${failed} checker(s) failed.` : `\nAll ${RUN.length} checkers pass.`);
process.exit(failed ? 1 : 0);
