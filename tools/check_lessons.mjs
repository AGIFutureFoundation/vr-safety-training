/**
 * Validates the lesson composer against the real station roster.
 *
 *     node tools/check_lessons.mjs
 *
 * A generated lesson is handed to a union hall as a programme, so every claim
 * on it has to be true: the stations have to exist and be enterable, the
 * standards printed on it have to come off those stations, the points target
 * has to be reachable, and a prompt that asks for something the roster cannot
 * satisfy has to be refused rather than filled with whatever scored above zero.
 */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { composeLesson, lessonProgress, unionsOf } from "../WebXR/shared/lessons.js";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const catalog = JSON.parse(readFileSync(join(ROOT, "WebXR/smartcity/catalog.json"), "utf8"));
const roster = catalog.stations.filter((s) => !s.flat).map((s) => ({
  app: s.app, id: s.id, name: s.name, category: s.category,
  certification: s.certification ?? "", tagline: s.tagline ?? "",
  stepCount: s.steps ?? s.stepCount ?? 0, parSeconds: s.parSeconds ?? 240,
  interruptCount: s.interrupts ?? s.interruptCount ?? 0,
}));
const byId = new Map(roster.map((s) => [s.id, s]));

let failures = 0;
const note = (what, msg) => { failures += 1; console.log(`  ✗ ${what}: ${msg}`); };
const ok = (msg) => console.log(`  ✓ ${msg}`);

console.log(`Lesson composer — against ${roster.length} enterable stations\n`);

// Prompts a training director would actually type.
const PROMPTS = [
  "build a lockout refresher for IBEW journeymen",
  "confined space entry programme for apprentices",
  "work at height block for the ironworkers",
  "arc flash and electrical safe work practice, annual recert",
  "rigging and suspended loads for IUOE crews",
  "respiratory and atmospheric hazards for the hazmat crew",
  "machine guarding for UAW apprentices",
  "situational awareness interruption drill for leads",
  "maritime block for ILWU",
];

const lessons = [];
for (const p of PROMPTS) {
  const lesson = composeLesson(p, roster);
  if (!lesson) { note(p, "composed nothing — the roster should satisfy this"); continue; }
  lessons.push([p, lesson]);
}
if (lessons.length === PROMPTS.length) ok(`${PROMPTS.length} realistic prompts all compose a lesson`);

for (const [p, lesson] of lessons) {
  const missing = lesson.stations.filter((s) => !byId.has(s.id));
  if (missing.length) note(p, `names stations that are not in the roster: ${missing.map((s) => s.id).join(", ")}`);
  const dupes = lesson.stations.map((s) => s.id).filter((id, i, a) => a.indexOf(id) !== i);
  if (dupes.length) note(p, `repeats a station: ${dupes.join(", ")}`);
  if (!lesson.stations.length) note(p, "composed an empty lesson");
  if (lesson.points.target <= 0 || lesson.points.target > lesson.points.perfect) {
    note(p, `points target ${lesson.points.target} is not inside 0..${lesson.points.perfect}`);
  }
  // Every standard printed on the lesson has to come off one of its stations.
  for (const std of lesson.standards) {
    const seen = lesson.stations.some((s) => (byId.get(s.id)?.certification ?? "").includes(std.slice(0, 18)));
    if (!seen) note(p, `prints standard "${std}" that none of its stations carry`);
  }
  // Every union it claims has to come off one of its stations too.
  for (const u of lesson.unions) {
    const seen = lesson.stations.some((s) => unionsOf(byId.get(s.id) ?? {}).includes(u));
    if (!seen) note(p, `claims ${u} but no station in it is a ${u} station`);
  }
}
if (!failures) ok("every lesson names only real stations, real standards and real locals");

// A prompt the roster cannot satisfy must be refused, not filled.
for (const junk of ["make me a sandwich", "hello", "a course about nothing in particular"]) {
  if (composeLesson(junk, roster)) note(junk, "composed a lesson out of a prompt that asks for nothing");
}
if (!failures) ok("prompts that name nothing the roster has are refused rather than filled");

// The pass bar has to be reachable by a clean run and out of reach of a poor one.
for (const [p, lesson] of lessons) {
  const perfectRecords = lesson.stations.map((s) => ({ simId: s.id, score: s.steps * 100 + s.interrupts * 120 }));
  const clean = lessonProgress(lesson, perfectRecords);
  if (!clean.passed) note(p, "a clean run of every station does not clear the pass bar");
  const halfRecords = lesson.stations.map((s) => ({ simId: s.id, score: Math.round(s.steps * 30) }));
  if (lessonProgress(lesson, halfRecords).passed) note(p, "a poor run clears the pass bar");
  const partial = lessonProgress(lesson, perfectRecords.slice(0, 1));
  if (partial.passed) note(p, "passes without completing every station");
}
if (!failures) ok("a clean run passes, a poor run does not, and an incomplete block never passes");

const sample = lessons[0]?.[1];
if (sample) {
  console.log(`\n  e.g. "${sample.prompt}"\n   → ${sample.title}`);
  for (const s of sample.stations) console.log(`      ${s.order}. ${s.name} (${s.steps} steps) — ${s.why}`);
  console.log(`      target ${sample.points.target} of ${sample.points.perfect} pts · ~${sample.estimate.minutes} min · ${sample.unions.join(", ") || "cross-craft"}`);
}

console.log(failures ? `\n${failures} lesson problem(s) found.` : `\nAll lesson checks pass.`);
process.exit(failures ? 1 : 0);
