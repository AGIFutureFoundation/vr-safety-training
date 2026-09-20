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
import { LEVELS } from "../../shared/variants.js";
import { parseIncident } from "../../shared/incidents.js";
import { ROLES } from "../../shared/crew.js";

// The generators that actually exist today. Listed explicitly (rather than
// inferred from whatever the parser matches) so the UI can be honest about
// what "speaking a simulation into existence" currently covers.
export const SUPPORTED_GAME_TYPES = ["minigolf", "training", "lesson", "incident"];

// A near-miss report is recognised before everything else, because it is the
// one prompt that is a piece of prose rather than a request. "Last week on the
// trench box a spoil pile started moving while the box was going in" names a
// station and would otherwise load that station as an ordinary visit, losing
// the whole point of the report. parseIncident() is what decides whether the
// text is really a report — the words below only say it is worth asking.
const INCIDENT_WORDS = ["near miss", "near-miss", "nearmiss", "close call", "incident",
  "last week", "last month", "yesterday", "last shift", "toolbox talk", "tailgate",
  "what happened", "report says", "reported", "wrote up", "write-up", "accident",
  "almost", "nearly"];

// Asking to run a station as one member of a crew. Only meaningful alongside a
// named station, the same way an assessment request is — "as the signaller" on
// its own has no procedure to be a signaller on. See shared/crew.js, which
// refuses to split a station whose second person has no duties.
const CREW_WORDS = Object.values(ROLES)
  .filter((r) => r.id !== "solo")
  .flatMap((r) => {
    const n = r.name.toLowerCase();
    const short = n.split(" / ")[0];
    return [`as the ${n}`, `as the ${short}`, `as a ${short}`, `${short} role`, `i am the ${short}`, `my role is ${short}`];
  });

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

// Asking to be tested on a station is different from asking to visit it: the
// same procedure, but with the hint rail off, a tighter clock and the alarms
// somewhere the learner has not met them. See shared/variants.js.
const VARIANT_WORDS = {
  pressure: ["under pressure", "hard mode", "make it hard", "toughest"],
  assessment: ["assess", "assessment", "test me", "exam", "certify", "certification run", "no hints", "sign me off", "check me out"],
  practice: ["practice", "practise", "try again", "retake", "another go", "different", "variant", "mix it up"],
};

const BLANK = {
  lesson: null, realSimId: null, matchedRealSim: false, variantLevel: null, matchedVariant: false,
  crewRole: null, matchedCrew: false, incident: null, matchedIncident: false,
  themeId: DEFAULT_THEME_ID, matchedTheme: false, templateId: DEFAULT_TEMPLATE_ID, matchedTemplate: false,
  equipmentId: DEFAULT_EQUIPMENT_ID, matchedEquipment: false,
};

export function localInterpreter(text) {
  const lower = String(text ?? "").toLowerCase();

  // An incident report first. parseIncident() returns null unless the text
  // actually names a station, so a prompt that merely says "almost" falls
  // through to everything below rather than producing a drill about nothing.
  if (INCIDENT_WORDS.some((w) => lower.includes(w))) {
    const incident = parseIncident(text, LESSON_ROSTER);
    if (incident) {
      return { ...BLANK, gameType: "incident", matchedGame: true, incident, matchedIncident: true,
        realSimId: incident.stationId, matchedRealSim: true, raw: text };
    }
  }

  // A programme request first. composeLesson returns null when the sentence
  // names nothing the roster can satisfy, so a prompt that merely contains
  // "course" — "a golf course" — falls through to the scene generators
  // instead of producing an empty syllabus.
  if (LESSON_WORDS.some((w) => lower.includes(w))) {
    const lesson = composeLesson(text, LESSON_ROSTER);
    if (lesson) {
      return { ...BLANK, gameType: "lesson", matchedGame: true, lesson, raw: text };
    }
  }

  // Naming a real station beats generic keyword matching — it's the more
  // specific, more confident signal, so it decides gameType outright.
  const realSim = REAL_SIMS_BY_LENGTH.find((s) => lower.includes(s.name.toLowerCase()));
  const realSimId = realSim?.id ?? null;

  // "Test me on the trench box" is that station, run as an assessment. Only
  // meaningful alongside a named station — "test me" on its own has nothing
  // to be an assessment of.
  let variantLevel = null;
  if (realSimId) {
    for (const [level, words] of Object.entries(VARIANT_WORDS)) {
      if (words.some((w) => lower.includes(w))) { variantLevel = level; break; }
    }
  }

  // "Run the crane yard as the signaller" is that station seen from one post.
  // Like an assessment, it needs a station to be a role on.
  let crewRole = null;
  if (realSimId) {
    const hit = CREW_WORDS.find((w) => lower.includes(w));
    if (hit) {
      const said = hit.replace(/^(as the |as a |i am the |my role is )/, "").replace(/ role$/, "");
      crewRole = Object.values(ROLES).find((r) => r.id !== "solo"
        && (r.id === said || r.name.toLowerCase() === said || r.name.toLowerCase().split(" / ")[0] === said))?.id ?? null;
    }
  }

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
    variantLevel, matchedVariant: !!variantLevel,
    crewRole, matchedCrew: !!crewRole,
    incident: null, matchedIncident: false,
    themeId, matchedTheme,
    templateId, matchedTemplate,
    equipmentId, matchedEquipment,
    raw: text,
  };
}

export async function interpretPrompt(text, { interpreter = localInterpreter } = {}) {
  return interpreter(text);
}
