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
  "check_smartcity.mjs", "check_trades.mjs", "check_holodeck.mjs",
  "check_records.mjs", "check_identity.mjs", "check_lrs.mjs", "check_robot.mjs", "check_platform.mjs", "check_lti.mjs", "check_orbis_stable.mjs", "check_verify.mjs", "check_observer.mjs", "check_a11y.mjs", "check_budget.mjs", "check_layout.mjs", "check_interrupts.mjs",
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
