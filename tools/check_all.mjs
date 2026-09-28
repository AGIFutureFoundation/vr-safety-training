/**
 * Runs every headless checker in this folder and reports one line each —
 * the single command CI and a contributor both run before pushing.
 *
 *     node tools/check_all.mjs
 */
import { spawnSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

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
  "check_home.mjs", "check_districts.mjs", "check_ladders.mjs", "check_tracks.mjs", "check_signage.mjs", "check_fleet.mjs",
  "check_race.mjs", "check_arcade.mjs", "check_eggs.mjs", "check_eggs_app.mjs", "check_props.mjs", "check_textures.mjs", "check_fairway_game.mjs",
  "check_fairway.mjs", "check_bayworld_game.mjs", "check_bay_quests.mjs", "check_bayworld.mjs", "check_mapbox.mjs",
  "check_unity_export.mjs",
  "check_sky.mjs",
  "check_regatta.mjs",
  "check_underwater.mjs", "check_underwater_game.mjs", "check_dive_quests.mjs",
  "check_investor.mjs",
  "check_mobile.mjs",
  // One learner, one ledger, one set of records across every app (docs/interop.md).
  "check_interop.mjs",
  "check_ui.mjs",
  // The Guide on every page, its knowledge base and its answers (docs/consoles/COMPASS.md).
  "check_guide.mjs",
  // Every open-world link, in the repo layout and the flat build (tools/briefs/links-brief.md).
  "check_links.mjs",
  // The account chip, the free demo and one private profile per person (docs/sign-in.md).
  "check_auth.mjs",
  // 21 languages: the tables, the picker, RTL and a headless language switch (docs/i18n.md).
  "check_i18n.mjs",
];

let failed = 0;
for (const name of CHECKERS) {
  const started = Date.now();
  const r = spawnSync(process.execPath, [join(here, name)], { encoding: "utf8" });
  const ok = r.status === 0;
  const tail = (r.stdout + r.stderr).trim().split("\n").filter(Boolean).pop() ?? "";
  console.log(`${ok ? "✓" : "✗"} ${name.padEnd(24)} ${String(Date.now() - started).padStart(5)} ms  ${tail}`);
  if (!ok) { failed += 1; console.log(r.stdout + r.stderr); }
}
console.log(failed ? `\n${failed} checker(s) failed.` : `\nAll ${CHECKERS.length} checkers pass.`);
process.exit(failed ? 1 : 0);
