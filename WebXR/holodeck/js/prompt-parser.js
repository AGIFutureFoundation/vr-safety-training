/**
 * Turns a spoken or typed prompt into a scene request: { gameType, themeId }.
 *
 * There is no live model behind this yet — no working API endpoint or
 * credentials have been wired into this project (the same reason the
 * Reactor/Orbis-Stable integrations elsewhere in this repo are stubs, not
 * live calls), and this is a public, static-hosted, client-only app with
 * nowhere safe to hold a real API key even if one existed. `localInterpreter`
 * is a small keyword-matching stand-in that actually runs and actually
 * works for the vocabulary it knows.
 *
 * The seam is real, though: `interpretPrompt` takes an injectable
 * `interpreter`, exactly like createOrbisClient's `transport` in
 * shared/orbis-stable.js. Swapping in a real model later — one that reads
 * arbitrary prompts and returns a richer scene description — means passing
 * a different `interpreter` here, not rewriting the app around it. Whatever
 * a real interpreter returns must stay data (a plain object describing what
 * to build), never code to execute — the renderer in minigolf.js is the
 * only thing that turns a scene request into 3D content.
 */
import { THEMES, DEFAULT_THEME_ID } from "./themes.js";
import { EQUIPMENT, TEMPLATES, DEFAULT_EQUIPMENT_ID, DEFAULT_TEMPLATE_ID } from "./training.js";
import { SIMS_META } from "../../smartcity/js/sims-meta.js";
import { composeLesson } from "../../shared/lessons.js";

// The generators that actually exist today. Listed explicitly (rather than
// inferred from whatever the parser matches) so the UI can be honest about
// what "speaking a simulation into existence" currently covers.
export const SUPPORTED_GAME_TYPES = ["minigolf", "training", "lesson"];

// A lesson is a programme of real stations rather than a scene — see
// shared/lessons.js. It is recognised before anything else, because "put me a
// lockout block together for the apprentices" names a station vocabulary the
// other generators would happily match one word of and then build a single
// generic drill from.
const LESSON_WORDS = ["lesson", "programme", "program", "curriculum", "block",
  "refresher", "course", "syllabus", "training plan", "recert", "apprentices",
  "journeymen", "put together", "build me a", "onboarding"];

// The roster a lesson is composed over: every enterable station both apps
// ship, with the fields shared/lessons.js matches on.
export const LESSON_ROSTER = SIMS_META.filter((s) => !s.flat).map((s) => ({
  app: "smartcity", id: s.id, name: s.name, category: s.category,
  certification: s.certification ?? "", tagline: s.tagline ?? "",
  stepCount: s.stepCount ?? 0, parSeconds: s.parSeconds ?? 240,
  interruptCount: s.interruptCount ?? 0,
}));

// Naming one of these directly loads the real SmartCiti.X station instead of
// building a generic Mad-Libs procedure — see app.js's loadRealSim(). The
// roster is SmartCiti.X's own generated metadata, so a station added there is
// reachable here by name the moment it exists; every interaction kind a
// SmartCiti.X step can use (select/sequence/find/gauge/hold/turn/drag) has a
// Holodeck gesture behind it. Flat briefing stations (no 3D scene) are the
// one exclusion — they render as a dossier card SmartCiti.X owns.
export const REAL_SIMS = SIMS_META.filter((s) => !s.flat).map((s) => ({ id: s.id, name: s.name }));
// Longest name first so "dock crane" can't be shadow-matched by a shorter
// name that happens to be a substring of a longer phrase.
const REAL_SIMS_BY_LENGTH = [...REAL_SIMS].sort((a, b) => b.name.length - a.name.length);

const GAME_KEYWORDS = {
  // Checked before minigolf: a phrase like "confined space entry training"
  // never mentions golf, but "training" alone is unambiguous, so order only
  // matters for a prompt that could plausibly say both.
  training: ["training", "safety simulation", "simulation training", "procedure", ...TEMPLATES.flatMap((t) => t.keywords)],
  minigolf: ["mini golf", "minigolf", "mini-golf", "golf course", "putt putt", "putt-putt", "golf"],
};

export function localInterpreter(text) {
  const lower = String(text ?? "").toLowerCase();

  // A programme request first. composeLesson returns null when the sentence
  // names nothing the roster can satisfy, so a prompt that merely contains
  // "course" — "a golf course" — falls through to the scene generators
  // instead of producing an empty syllabus.
  if (LESSON_WORDS.some((w) => lower.includes(w))) {
    const lesson = composeLesson(text, LESSON_ROSTER);
    if (lesson) {
      return { gameType: "lesson", matchedGame: true, lesson, realSimId: null, matchedRealSim: false,
        themeId: DEFAULT_THEME_ID, matchedTheme: false, templateId: DEFAULT_TEMPLATE_ID, matchedTemplate: false,
        equipmentId: DEFAULT_EQUIPMENT_ID, matchedEquipment: false, raw: text };
    }
  }

  // Naming a real station beats generic keyword matching — it's the more
  // specific, more confident signal, so it decides gameType outright.
  const realSim = REAL_SIMS_BY_LENGTH.find((s) => lower.includes(s.name.toLowerCase()));
  const realSimId = realSim?.id ?? null;

  let gameType = realSimId ? "training" : "minigolf"; // the fallback if nothing at all matches
  let matchedGame = !!realSimId;
  if (!realSimId) {
    for (const [type, words] of Object.entries(GAME_KEYWORDS)) {
      if (words.some((w) => lower.includes(w))) { gameType = type; matchedGame = true; break; }
    }
  }

  let themeId = DEFAULT_THEME_ID;
  let matchedTheme = false;
  for (const theme of THEMES) {
    if (theme.keywords.some((w) => lower.includes(w))) { themeId = theme.id; matchedTheme = true; break; }
  }

  let templateId = DEFAULT_TEMPLATE_ID;
  let matchedTemplate = false;
  for (const tpl of TEMPLATES) {
    if (tpl.keywords.some((w) => lower.includes(w))) { templateId = tpl.id; matchedTemplate = true; break; }
  }

  let equipmentId = DEFAULT_EQUIPMENT_ID;
  let matchedEquipment = false;
  for (const eq of EQUIPMENT) {
    if (eq.keywords.some((w) => lower.includes(w))) { equipmentId = eq.id; matchedEquipment = true; break; }
  }

  return {
    gameType, matchedGame,
    realSimId, matchedRealSim: !!realSimId,
    themeId, matchedTheme,
    templateId, matchedTemplate,
    equipmentId, matchedEquipment,
    raw: text,
  };
}

export async function interpretPrompt(text, { interpreter = localInterpreter } = {}) {
  return interpreter(text);
}
