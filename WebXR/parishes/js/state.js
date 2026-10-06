// The parishes — the headless ledger (console PARISH): which sites the
// learner has visited in each parish and which field lessons they have
// passed, kept under the profile's own storage namespace like Sierra
// Summit's. No three.js and no DOM: tools/check_parishes.mjs drives it.
import { gtStorage } from "../../shared/profiles.js";

export const NP_STORE_KEY = "parishes-v1";

export function npBlank() { return { visited: {}, lessons: [] }; }

export function npLoad(store = gtStorage()) {
  try {
    const raw = JSON.parse(store?.getItem(NP_STORE_KEY) || "null");
    if (!raw || typeof raw !== "object") return npBlank();
    const b = npBlank();
    if (raw.visited && typeof raw.visited === "object") for (const [k, v] of Object.entries(raw.visited)) if (Array.isArray(v)) b.visited[k] = [...new Set(v.filter((x) => typeof x === "string"))];
    if (Array.isArray(raw.lessons)) b.lessons = [...new Set(raw.lessons.filter((x) => typeof x === "string"))];
    return b;
  } catch { return npBlank(); }
}

export function npSave(state, store = gtStorage()) { try { store?.setItem(NP_STORE_KEY, JSON.stringify(state)); } catch { /* private mode */ } }

/** Mark a site visited in a parish; true when it is new. */
export function npVisit(state, parishId, siteId) {
  const list = (state.visited[parishId] ??= []);
  if (list.includes(siteId)) return false;
  list.push(siteId);
  return true;
}

export function npVisited(state, parishId, siteId) { return (state.visited[parishId] ?? []).includes(siteId); }

/** Answer a field lesson: { ok } — a right answer passes it once. */
export function npAnswerLesson(state, lesson, choice) {
  const ok = choice === lesson.check.answer;
  if (ok && !state.lessons.includes(lesson.id)) state.lessons.push(lesson.id);
  return { ok };
}
