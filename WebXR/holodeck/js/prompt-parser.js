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

// The only generator that actually exists today. Listed explicitly (rather
// than inferred from whatever the parser matches) so the UI can be honest
// about what "speaking a simulation into existence" currently covers.
export const SUPPORTED_GAME_TYPES = ["minigolf"];

const GAME_KEYWORDS = {
  minigolf: ["mini golf", "minigolf", "mini-golf", "golf course", "putt putt", "putt-putt", "golf"],
};

export function localInterpreter(text) {
  const lower = String(text ?? "").toLowerCase();

  let gameType = "minigolf"; // the only one there is right now
  let matchedGame = false;
  for (const [type, words] of Object.entries(GAME_KEYWORDS)) {
    if (words.some((w) => lower.includes(w))) { gameType = type; matchedGame = true; break; }
  }

  let themeId = DEFAULT_THEME_ID;
  let matchedTheme = false;
  for (const theme of THEMES) {
    if (theme.keywords.some((w) => lower.includes(w))) { themeId = theme.id; matchedTheme = true; break; }
  }

  return { gameType, matchedGame, themeId, matchedTheme, raw: text };
}

export async function interpretPrompt(text, { interpreter = localInterpreter } = {}) {
  return interpreter(text);
}
