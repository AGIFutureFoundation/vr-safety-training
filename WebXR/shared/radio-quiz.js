// Foreman's Radio — the homepage's second Easter egg (docs/easter-egg.md):
// type "radio" and a retro handheld-radio card opens with a ten-question
// quiz. Every question is generated from RADIO_STANDARDS (WebXR/shared/
// radio-quiz-data.js, itself generated verbatim from tools/standards.json's
// body and title — see tools/gen_radio_quiz.mjs) — never from an invented
// fact. This module is pure: no DOM, so tools/check_eggs.mjs can generate and
// grade quizzes headless.
import { RADIO_STANDARDS, RADIO_BODIES } from "./radio-quiz-data.js";

/** A CFR-style clause, when the title states one plainly enough to quote on its own. */
const CLAUSE = /\b\d{1,3}\s*CFR\s*[0-9]+(?:\.[0-9]+)?\b/;

/** Deterministic when given a seed (an integer), otherwise Math.random(). */
export function makeRng(seed = null) {
  if (seed == null) return Math.random;
  let s = seed >>> 0 || 1;
  return () => {
    s ^= s << 13; s >>>= 0;
    s ^= s >>> 17;
    s ^= s << 5; s >>>= 0;
    return (s >>> 0) / 4294967296;
  };
}

function shuffle(arr, rng) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function pick(arr, n, rng) {
  return shuffle(arr, rng).slice(0, n);
}

/** The question text for one standard: the clause if its title states one plainly, else the full title. */
export function questionText(standard) {
  const m = CLAUSE.exec(standard.title);
  return m ? `Which body publishes ${m[0]}?` : `Which body publishes: “${standard.title}”?`;
}

/**
 * `count` questions, each { id, text, choices, answerIndex, standardId }, no
 * two drawn from the same standard. `choices` has one correct body plus three
 * distractor bodies, in a random order; `rng` defaults to Math.random.
 */
export function buildQuiz(count = 10, { rng = Math.random, standards = RADIO_STANDARDS, bodies = RADIO_BODIES } = {}) {
  const pool = standards.filter((s) => s.body && s.title);
  const chosen = pick(pool, Math.min(count, pool.length), rng);
  return chosen.map((s, i) => {
    const distractors = pick(bodies.filter((b) => b !== s.body), 3, rng);
    const choices = shuffle([s.body, ...distractors], rng);
    return {
      id: `q${i + 1}-${s.id}`,
      text: questionText(s),
      choices,
      answerIndex: choices.indexOf(s.body),
      standardId: s.id,
    };
  });
}

/** Best score in localStorage. */
const SCORE_KEY = "vr-training-radio-quiz-v1";

function store(storage) {
  if (storage) return storage;
  try { return globalThis.localStorage ?? null; } catch (_) { return null; }
}

export function bestRadioScore(storage) {
  try {
    const raw = JSON.parse(store(storage)?.getItem(SCORE_KEY) || "null");
    return raw && Number.isFinite(raw.best) && Number.isFinite(raw.of) ? raw : null;
  } catch (_) { return null; }
}

/** Record a run's score. Returns { best, of, isNewBest }. */
export function recordRadioScore(score, of, storage) {
  const prev = bestRadioScore(storage);
  const best = prev ? Math.max(prev.best, score) : score;
  const isNewBest = !prev || score > prev.best;
  try { store(storage)?.setItem(SCORE_KEY, JSON.stringify({ best, of, runs: (prev?.runs ?? 0) + 1 })); } catch (_) { /* private mode */ }
  return { best, of, isNewBest };
}
