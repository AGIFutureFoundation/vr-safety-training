/**
 * Generates WebXR/shared/radio-quiz-data.js from tools/standards.json, for
 * the Foreman's Radio Easter egg (docs/easter-egg.md).
 *
 *     node tools/gen_radio_quiz.mjs
 *
 * It is run at the end of tools/gen_catalog.mjs, so the quiz can never drift
 * from the registry. Only `id`, `body` and `title` are carried over — the
 * only facts a quiz question is allowed to use — never the `scope`, `source`
 * or `cites` fields, which say nothing a learner could be quizzed on.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

export function writeRadioQuizData() {
  const registry = JSON.parse(readFileSync(join(ROOT, "tools", "standards.json"), "utf8"));
  const standards = (registry.standards ?? [])
    .filter((s) => s?.id && s?.body && s?.title)
    .map((s) => ({ id: s.id, body: s.body, title: s.title }));
  const bodies = [...new Set(standards.map((s) => s.body))].sort();
  const out = `// GENERATED FILE — do not hand-edit. Run \`node tools/gen_radio_quiz.mjs\`
// (or \`node tools/gen_catalog.mjs\`, which runs it).
//
// Every fact the Foreman's Radio quiz can ask with: which body publishes a
// named standard. Lifted verbatim from tools/standards.json's id/body/title —
// nothing here is invented, and nothing else from that registry (scope,
// source, cites) is carried over, because a quiz question is never built on
// anything but the body that publishes a standard and the standard's own
// title.
export const RADIO_STANDARDS = ${JSON.stringify(standards)};
export const RADIO_BODIES = ${JSON.stringify(bodies)};
`;
  const outPath = join(ROOT, "WebXR", "shared", "radio-quiz-data.js");
  writeFileSync(outPath, out);
  console.log(`Wrote WebXR/shared/radio-quiz-data.js — ${standards.length} standards, ${bodies.length} bodies`);
  return outPath;
}

if (import.meta.url === `file://${process.argv[1]}`) writeRadioQuizData();
