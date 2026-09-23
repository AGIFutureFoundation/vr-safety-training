/**
 * Writes WebXR/shared/unions.js from tools/unions.json and the registry.
 *
 *     node tools/gen_unions.mjs
 *
 * tools/unions.json is the source of record for every union the platform
 * names (see its `note`). The browser cannot read tools/, and the headless
 * checkers concatenate modules rather than fetch, so the same data ships as a
 * generated ES module beside signage.js — the arrangement sims-meta.js already
 * uses. Each entry is carried through as written and gains two fields read
 * from tools/standards.json: the training body's `title` (the sign's
 * "Training partner" line) and its `scope` (the categories it trains for,
 * which is how a station in a programme that names several unions is given
 * the one whose training fund covers its category).
 *
 * tools/check_signage.mjs regenerates in memory and fails if the file on disk
 * differs, so the module can never drift from the JSON.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
export const UNIONS_JSON = join(ROOT, "tools/unions.json");
export const UNIONS_MODULE = join(ROOT, "WebXR/shared/unions.js");

/** The generated module's text, from the JSON and the registry on disk. */
export function renderUnionsModule() {
  const data = JSON.parse(readFileSync(UNIONS_JSON, "utf8"));
  const registry = JSON.parse(readFileSync(join(ROOT, "tools/standards.json"), "utf8"));
  const byId = Object.fromEntries(registry.standards.map((s) => [s.id, s]));
  const rows = data.unions.map((u) => {
    const body = u.trainingBody ? byId[u.trainingBody] : null;
    return {
      id: u.id, abbrev: u.abbrev, name: u.name, aliases: u.aliases ?? [u.abbrev],
      local: u.local ?? null, colors: u.colors ?? null,
      trainingBody: u.trainingBody ?? null,
      trainingTitle: body?.title ?? null,
      scope: body?.scope ?? [],
      note: u.note ?? "",
    };
  });
  const lines = rows.map((r) => `  ${JSON.stringify(r)},`).join("\n");
  return `/**
 * GENERATED FILE — do not hand-edit. Run \`node tools/gen_unions.mjs\` after
 * changing tools/unions.json or a union entry in tools/standards.json.
 *
 * Every union the platform names, for WebXR/shared/signage.js: the wordmark
 * a sign typesets (abbrev, name, local), the palette (colors, null = the
 * platform's own), the training body from the registry (its id, title and
 * the categories it covers) and the spellings the platform's own text uses
 * (aliases). No logo lives here or anywhere else in the repository; see
 * docs/signage.md.
 */
export const UNIONS = [
${lines}
];
export const UNIONS_BY_ID = Object.fromEntries(UNIONS.map((u) => [u.id, u]));
`;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const text = renderUnionsModule();
  writeFileSync(UNIONS_MODULE, text);
  console.log(`wrote ${UNIONS_MODULE} (${text.match(/^\s+\{"id"/gm).length} unions)`);
}
