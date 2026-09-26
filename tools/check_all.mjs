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
  "check_records.mjs", "check_identity.mjs", "check_lrs.mjs", "check_robot.mjs", "check_platform.mjs", "check_lti.mjs", "check_orbis_stable.mjs", "check_verify.mjs", "check_observer.mjs", "check_budget.mjs", "check_layout.mjs", "check_interrupts.mjs", "check_lessons.mjs", "check_hands.mjs", "check_variants.mjs", "check_incidents.mjs", "check_crew.mjs", "check_devices.mjs", "check_input.mjs", "check_standards.mjs", "check_console.mjs", "check_competency.mjs", "check_models.mjs", "check_flowhub.mjs", "check_home.mjs", "check_districts.mjs", "check_ladders.mjs", "check_tracks.mjs", "check_signage.mjs", "check_fleet.mjs", "check_race.mjs", "check_arcade.mjs", "check_eggs.mjs",
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
