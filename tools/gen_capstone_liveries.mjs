/**
 * Generates WebXR/race/js/capstone-liveries.js from WebXR/smartcity/js/
 * ladders.js, for the Capstone skins Easter egg (docs/easter-egg.md).
 *
 *     node tools/gen_capstone_liveries.mjs
 *
 * It is run at the end of tools/gen_catalog.mjs (after gen_ladders.mjs), so
 * the race can never list a locked livery for a programme whose ladder no
 * longer exists, or miss one for a programme that just gained a ladder.
 * Only `programme`, `name` and `accent` are carried over — a livery names the
 * programme and paints itself in the programme's own accent, nothing more.
 */
import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

export async function writeCapstoneLiveries() {
  const { LADDERS } = await import(pathToFileURL(join(ROOT, "WebXR", "smartcity", "js", "ladders.js")));
  const liveries = LADDERS.map((l) => ({ programme: l.programme, name: l.name, accent: l.accent }));
  const out = `// GENERATED FILE — do not hand-edit. Run \`node tools/gen_capstone_liveries.mjs\`
// (or \`node tools/gen_catalog.mjs\`, which runs it, after gen_ladders.mjs).
//
// One locked livery per programme with a twenty-level ladder (shared/ladder.js
// LADDER_LEVELS), named and coloured after the programme itself
// (WebXR/smartcity/js/ladders.js). See WebXR/race/js/liveries.js for the
// unlock rule and docs/easter-egg.md for what "finishing the capstone" means.
export const CAPSTONE_LIVERIES = ${JSON.stringify(liveries, null, 2)};
`;
  const outPath = join(ROOT, "WebXR", "race", "js", "capstone-liveries.js");
  writeFileSync(outPath, out);
  console.log(`Wrote WebXR/race/js/capstone-liveries.js — ${liveries.length} programmes`);
  return outPath;
}

if (import.meta.url === `file://${process.argv[1]}`) await writeCapstoneLiveries();
