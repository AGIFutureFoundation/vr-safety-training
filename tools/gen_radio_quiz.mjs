/**
 * Generates WebXR/shared/radio-quiz-data.js from tools/standards.json, for
 * the Foreman's Radio Easter egg (docs/easter-egg.md).
 *
 *     node tools/gen_radio_quiz.mjs
 *
 * It is run at the end of tools/gen_catalog.mjs, so the quiz can never drift
 * from the registry. Only `id`, `body`, `title` and `scope` are carried over.
 * `id`, `body` and `title` are the only facts a question's own text or answer
 * is ever built from — never the `source` or `cites` fields, which say
 * nothing a learner could be quizzed on. `scope` carries no fact into a
 * question either: it is the registry's own list of the catalog categories a
 * standard governs, kept only so `buildQuiz()` can be asked for a quiz in one
 * category (a programme's own trade) without a single word of the question
 * changing — the global, all-categories quiz this always was is still the
 * default.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

export function writeRadioQuizData() {
  const registry = JSON.parse(readFileSync(join(ROOT, "tools", "standards.json"), "utf8"));
  const standards = (registry.standards ?? [])
    .filter((s) => s?.id && s?.body && s?.title)
    .map((s) => ({ id: s.id, body: s.body, title: s.title, scope: Array.isArray(s.scope) ? [...s.scope].sort() : [] }));
  const bodies = [...new Set(standards.map((s) => s.body))].sort();
  const categories = [...new Set(registry.categories ?? [])].sort();
  const out = `// GENERATED FILE — do not hand-edit. Run \`node tools/gen_radio_quiz.mjs\`
// (or \`node tools/gen_catalog.mjs\`, which runs it).
//
// Every fact the Foreman's Radio quiz can ask with: which body publishes a
// named standard. \`id\`, \`body\` and \`title\` are lifted verbatim from
// tools/standards.json — nothing here is invented, because a quiz question is
// never built on anything but the body that publishes a standard and the
// standard's own title. \`scope\` (the registry's own catalog categories) rides
// along too, so shared/radio-quiz.js can filter the pool to one category —
// never so a question can state a fact scope itself never says. RADIO_BODIES
// and RADIO_CATEGORIES are the full, honest choice lists a filtered pool is
// still drawn against.
export const RADIO_STANDARDS = ${JSON.stringify(standards)};
export const RADIO_BODIES = ${JSON.stringify(bodies)};
export const RADIO_CATEGORIES = ${JSON.stringify(categories)};
`;
  const outPath = join(ROOT, "WebXR", "shared", "radio-quiz-data.js");
  writeFileSync(outPath, out);
  console.log(`Wrote WebXR/shared/radio-quiz-data.js — ${standards.length} standards, ${bodies.length} bodies, ${categories.length} categories`);
  return outPath;
}

if (import.meta.url === `file://${process.argv[1]}`) writeRadioQuizData();
