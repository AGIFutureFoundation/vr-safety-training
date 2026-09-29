// SCHOLAR — K-12 lessons as you explore, with a scoreboard (Holodeck Packs run, second wave;
// docs/consoles/SCHOLAR.md, docs/k12.md section 10).
//
// The pure core: no DOM, no three.js. A world registers the K-12 lessons it can play
// (scRegisterLessons), the session panel (sc-session-ui.js) starts one when the learner
// reaches its site, and this module scores it and remembers it.
//
// SEAMS (documented shapes; other consoles read these):
//
//   scStartSession(lessonId, where) -> session | null
//       where: { world, parish?, site?, pos?: [x, z] }. The session is a plain object:
//       { id, lessonId, lesson, where, step, tries, done, startedAt }. Walk it with
//       scStep(session) (next step, then the check) and scAnswer(session, choiceIndex).
//   scAnswer(session, i) -> { right, why, finished, stars, firstTry, streak, badges[], trail[] }
//       Stars: 3 on a first-try answer, 2 on the second, 1 after that. Nothing is taken away.
//   scSessions() -> [{ id, lessonId, world, parish, site, k12, subject, tries, stars, firstTry, at }]
//       Every finished session on this device, oldest first (DEAN reads this for progress).
//   scBoard(classCode, { entries?, me? }) -> { code, cohort, top: [{ rank, name, stars, sessions }],
//       you: { name, stars, sessions, bestStreak, rank|null } | null, hidden, total }
//       A class leaderboard: first names or chosen nicknames only, top ten plus "your best"
//       (no rank shown below the top ten), opted-out learners hidden.
//
// Kids rule: no fear framing, praise for effort, a wrong answer shows the lesson's own why and
// invites another look; the streak "rests", it is never lost. Privacy: local-first, one key
// (`vr-scholar-v1`) through profiles.js's gtStorage; a class board is moved between devices by an
// explicit export/import file, never a network request. No surname, e-mail or id is ever shown.
//
// Every top-level name carries the `sc`/`SC_` prefix (the bundler shares one scope).

import { gtStorage } from "./profiles.js";
import { PP_PROGRAMMES } from "./passport-programmes.js";

export const SC_KEY = "vr-scholar-v1";
export const SC_VERSION = 1;
/** Stars by the try the right answer came on (index 0 = first try); later tries score the last value. */
export const SC_STARS = [3, 2, 1];
/** A badge per set: this many different lessons in one subject, or in one world. */
export const SC_SET_SIZE = 3;
/** How many rows the class board ranks; everyone else sees "your best" without a rank. */
export const SC_BOARD_TOP = 10;
/** The name shown when a nickname or first name cannot be shown safely. */
export const SC_FALLBACK_NAME = "Scholar";
/** The reach, in metres, at which a lesson's site offers a session. */
export const SC_REACH = 28;

/** The four classroom programmes as subjects, with the badge each set earns. */
export const SC_SUBJECTS = {
  "k12-practical-math": { name: "Maths", badge: "Maths Explorer" },
  "k12-science": { name: "Science", badge: "Science Explorer" },
  "k12-history-and-civics": { name: "History and Civics", badge: "History Explorer" },
  "k12-literacy-and-life-skills": { name: "Reading and Life Skills", badge: "Words and Life Explorer" },
};
export const SC_WORLD_NAMES = {
  bayworld: "Bay World", deep: "the Deep", regatta: "the Regatta", fairway: "Fairway Park", summit: "Sierra Summit",
  redwood: "Redwood Reach", parishes: "the Parishes", "san-francisco": "San Francisco",
};
/** Every learner-facing line the session panel shows (the checker reads these against the youngest ceiling). */
export const SC_LINES = {
  offer: "A lesson is here. Want to try it?",
  start: "Start the lesson",
  next: "Next step",
  check: "Now the check.",
  right: "Yes! Well done.",
  firstTry: "First try. Three stars.",
  again: "Take another look. The why is below.",
  rest: "Your run rests here. Try the next one.",
  trail: "Lessons near you",
  badge: "New badge",
  done: "You did it.",
};

// ------------------------------------------------------------------ subjects

const scSubjectIndex = (() => {
  const m = new Map();
  for (const id of Object.keys(SC_SUBJECTS)) for (const s of PP_PROGRAMMES[id]?.stations ?? []) m.set(s, id);
  return m;
})();
/** The classroom programme (subject id) a K-12 station belongs to, or null. */
export function scSubjectOf(stationId) { return scSubjectIndex.get(stationId) ?? null; }
/** True when the id is a classroom station in one of the four programmes. */
export function scIsK12Station(stationId) { return scSubjectIndex.has(stationId); }

// ------------------------------------------------------------------ lessons

/**
 * One lesson in the session shape, from any of the shapes the worlds keep: the shared K-12 field
 * lesson (station = the K-12 station), Sierra Summit's (anchor, station = K-12, tradeStation),
 * Redwood Reach's and the parishes' / districts' (site, k12, station = trade), and BAYOU's parish
 * lessons (station = K-12, check.q). `where` fills what the list itself does not carry.
 */
export function scNormalise(l, where = {}) {
  if (!l) return null;
  const c = l.check ?? {};
  const k12 = l.k12 ?? l.station ?? null;
  const world = where.world ?? l.world ?? null;
  return {
    id: String(l.id), world, parish: l.parish ?? where.parish ?? null,
    site: l.site ?? l.anchor?.id ?? l.place ?? where.site ?? null,
    k12, subject: scSubjectOf(k12), band: l.band ?? null,
    title: l.title ?? "", trade: l.trade ?? "", tradeLine: l.tradeLine ?? "",
    steps: Array.isArray(l.steps) ? l.steps.slice() : [],
    check: { q: c.q ?? c.question ?? "", options: (c.options ?? c.choices ?? []).slice(), answer: c.answer, why: c.why ?? "" },
    position: l.position ?? l.at ?? where.position ?? null,
    minutes: l.minutes ?? null,
  };
}

const scRegistry = new Map();

/**
 * Register the lessons a world can play. `where.world` names the world; `where.siteAt(parish, site)`
 * (optional) returns [x, z] for a lesson that carries no position. Returns the normalised list.
 */
export function scRegisterLessons(list, where = {}) {
  const out = [];
  for (const raw of list ?? []) {
    const l = scNormalise(raw, where);
    if (!l) continue;
    if (!l.position && typeof where.siteAt === "function") l.position = where.siteAt(l.parish, l.site) ?? null;
    scRegistry.set(l.id, l);
    out.push(l);
  }
  return out;
}
export function scLesson(id) { return scRegistry.get(id) ?? null; }
export function scRegistered() { return [...scRegistry.values()]; }

// ------------------------------------------------------------------ the store

function scStore() { try { return gtStorage(); } catch (_) { return null; } }

export function scBlank() { return { v: SC_VERSION, sessions: [], nick: "", optOut: false, me: null, boards: {} }; }

export function scLoad(store = scStore()) {
  try {
    const raw = JSON.parse(store?.getItem(SC_KEY) || "null");
    if (!raw || typeof raw !== "object") return scBlank();
    const b = scBlank();
    if (Array.isArray(raw.sessions)) b.sessions = raw.sessions.filter((s) => s && typeof s.lessonId === "string");
    b.nick = typeof raw.nick === "string" ? raw.nick.slice(0, 24) : "";
    b.optOut = !!raw.optOut;
    b.me = typeof raw.me === "string" ? raw.me : null;
    if (raw.boards && typeof raw.boards === "object") for (const [k, v] of Object.entries(raw.boards)) if (Array.isArray(v)) b.boards[k] = v;
    return b;
  } catch (_) { return scBlank(); }
}

export function scSave(state, store = scStore()) {
  try {
    if (state.sessions.length > 1000) state.sessions.splice(0, state.sessions.length - 1000);
    store?.setItem(SC_KEY, JSON.stringify(state));
  } catch (_) { /* private mode — the session stays unsaved */ }
}

/** Every finished session on this device, oldest first. */
export function scSessions(state = scLoad()) { return state.sessions.slice(); }

// ------------------------------------------------------------------ scoring

/** Stars for a right answer on try number `tries` (1-based). */
export function scStarsFor(tries) { return SC_STARS[Math.min(Math.max(1, tries | 0), SC_STARS.length) - 1]; }

/**
 * The learner's totals from a session list: best stars per lesson summed, sessions finished,
 * the current first-try run and the best one, badges by subject and by world.
 */
export function scSummary(sessions = scSessions()) {
  const best = new Map();
  let streak = 0, bestStreak = 0;
  const bySubject = {}, byWorld = {};
  for (const s of sessions) {
    best.set(s.lessonId, Math.max(best.get(s.lessonId) ?? 0, s.stars | 0));
    streak = s.firstTry ? streak + 1 : 0;
    bestStreak = Math.max(bestStreak, streak);
    const subj = s.subject ?? "other", w = scWorldKey(s);
    (bySubject[subj] ??= { lessons: new Set(), stars: 0, sessions: 0 }).lessons.add(s.lessonId);
    bySubject[subj].sessions += 1;
    (byWorld[w] ??= { lessons: new Set(), stars: 0, sessions: 0 }).lessons.add(s.lessonId);
    byWorld[w].sessions += 1;
  }
  const bestOf = (set) => [...set].reduce((n, id) => n + (best.get(id) ?? 0), 0);
  const flat = (o) => Object.fromEntries(Object.entries(o).map(([k, v]) => [k, { lessons: v.lessons.size, stars: bestOf(v.lessons), sessions: v.sessions }]));
  const subjects = flat(bySubject), worlds = flat(byWorld);
  const badges = [
    ...Object.entries(subjects).filter(([k, v]) => SC_SUBJECTS[k] && v.lessons >= SC_SET_SIZE).map(([k]) => ({ id: `sc-subject-${k}`, kind: "subject", key: k, name: SC_SUBJECTS[k].badge })),
    ...Object.entries(worlds).filter(([, v]) => v.lessons >= SC_SET_SIZE).map(([k]) => ({ id: `sc-world-${k}`, kind: "world", key: k, name: `${scWorldName(k)} Trail Badge` })),
  ];
  return { stars: [...best.values()].reduce((a, b) => a + b, 0), sessions: sessions.length, lessons: best.size, streak, bestStreak, subjects, worlds, badges };
}

/** The world a session counts toward: the parishes split into New Orleans and San Francisco. */
export function scWorldKey(s) {
  if (s.world === "parishes" && typeof s.parish === "string" && s.parish.startsWith("sf-")) return "san-francisco";
  return s.world ?? "other";
}
export function scWorldName(k) { return SC_WORLD_NAMES[k] ?? String(k); }

// ------------------------------------------------------------------ a session

let scSeq = 0;

/** Start a session on a registered lesson (or on `where.lesson`, a raw lesson in any shape). */
export function scStartSession(lessonId, where = {}) {
  const lesson = scLesson(lessonId) ?? (where.lesson ? scNormalise(where.lesson, where) : null);
  if (!lesson || !lesson.steps.length || !lesson.check.options.length) return null;
  scSeq += 1;
  return {
    id: `sc-${Date.now().toString(36)}-${scSeq}`, lessonId: lesson.id, lesson,
    where: { world: where.world ?? lesson.world, parish: where.parish ?? lesson.parish, site: where.site ?? lesson.site, pos: where.pos ?? null },
    step: 0, tries: 0, done: false, startedAt: new Date().toISOString(),
  };
}

/** Move to the next step; returns `{ kind: "step", text, index, of }` or `{ kind: "check", q, options }`. */
export function scStep(session) {
  const L = session.lesson;
  if (session.step < L.steps.length) {
    const out = { kind: "step", text: L.steps[session.step], index: session.step + 1, of: L.steps.length };
    session.step += 1;
    return out;
  }
  return { kind: "check", q: L.check.q, options: L.check.options.slice() };
}

const scAwardFn = (o) => o.award ?? (typeof ppAward === "function" ? ppAward : null); // eslint-disable-line no-undef
const scAwardedFn = (o) => o.awarded ?? (typeof ppAwarded === "function" ? ppAwarded : null); // eslint-disable-line no-undef

/**
 * Answer the check. A wrong answer returns the lesson's why and leaves the session open; a right one
 * finishes it, records it on this device and on the passport (one `sc-session` award per lesson,
 * never twice), and returns the stars, the run, any badge this answer earned and the lesson trail.
 * `opts`: { state, store, award, awarded, lessons (for the trail), pos }.
 */
export function scAnswer(session, i, opts = {}) {
  if (!session || session.done) return { right: false, finished: !!session?.done, why: "", stars: 0, firstTry: false, streak: 0, badges: [], trail: [] };
  const L = session.lesson;
  session.tries += 1;
  if (i !== L.check.answer) return { right: false, finished: false, why: L.check.why, stars: 0, firstTry: false, streak: 0, badges: [], trail: [] };
  session.done = true;
  const state = opts.state ?? scLoad(opts.store);
  const before = scSummary(state.sessions);
  const rec = {
    id: session.id, lessonId: L.id, world: session.where.world ?? L.world, parish: session.where.parish ?? L.parish ?? null,
    site: session.where.site ?? L.site ?? null, k12: L.k12, subject: L.subject, tries: session.tries,
    stars: scStarsFor(session.tries), firstTry: session.tries === 1, at: new Date().toISOString(),
  };
  state.sessions.push(rec);
  scSave(state, opts.store);
  const after = scSummary(state.sessions);
  const had = new Set(before.badges.map((b) => b.id));
  const put = scAwardFn(opts), has = scAwardedFn(opts);
  if (put && !(has && has("sc-session", L.id))) {
    try { put("sc-session", { attemptId: L.id, reputation: rec.stars, reason: `K-12 lesson session: ${L.title}` }); } catch (_) { /* the passport never breaks a lesson */ }
  }
  const done = new Set(state.sessions.map((s) => s.lessonId));
  return {
    right: true, finished: true, why: L.check.why, stars: rec.stars, firstTry: rec.firstTry, streak: after.streak,
    badges: after.badges.filter((b) => !had.has(b.id)),
    trail: scTrail(opts.pos ?? session.where.pos ?? L.position, opts.lessons ?? scRegistered().filter((x) => x.world === L.world), done, L.id),
  };
}

const SC_DIRS = ["north", "north-east", "east", "south-east", "south", "south-west", "west", "north-west"];

/**
 * The lesson trail: up to `n` nearest lessons not yet done, with metres and a compass word
 * (the world's -z is north, as the parish and Redwood maps draw it).
 */
export function scTrail(pos, lessons, done = new Set(), skip = null, n = 3) {
  if (!Array.isArray(pos)) return [];
  return (lessons ?? [])
    .filter((l) => l.id !== skip && !done.has(l.id) && Array.isArray(l.position))
    .map((l) => {
      const dx = l.position[0] - pos[0], dz = l.position[1] - pos[1];
      const ang = (Math.atan2(dx, -dz) * 180 / Math.PI + 360) % 360;
      return { id: l.id, title: l.title, site: l.site, parish: l.parish, metres: Math.round(Math.hypot(dx, dz)), dir: SC_DIRS[Math.round(ang / 45) % 8] };
    })
    .sort((a, b) => a.metres - b.metres)
    .slice(0, n);
}

/** The lessons whose site is within reach of [x, z] (the chip the panel shows), nearest first. */
export function scNearby(pos, lessons, reach = SC_REACH) {
  if (!Array.isArray(pos)) return [];
  return (lessons ?? []).filter((l) => Array.isArray(l.position))
    .map((l) => ({ l, d: Math.hypot(l.position[0] - pos[0], l.position[1] - pos[1]) }))
    .filter((x) => x.d <= reach).sort((a, b) => a.d - b.d).map((x) => x.l);
}

// ------------------------------------------------------------------ names and the class board

/**
 * The only name the board ever shows: the chosen nickname, else the first word of the display name.
 * One word, letters only (no digits, no `@`, no web address), two to sixteen letters; anything else
 * shows as "Scholar". A surname can never appear because only the first word is kept.
 */
export function scSafeName(nick, name = "") {
  for (const cand of [nick, name]) {
    const s = String(cand ?? "").trim();
    if (!s || /@|https?:|www\.|\.[a-z]{2,}(\s|$)|\d/i.test(s)) continue;
    const w = s.split(/\s+/)[0].replace(/[^\p{L}'-]/gu, "").slice(0, 16);
    if (w.length >= 2) return w;
  }
  return SC_FALLBACK_NAME;
}

/** A class code as the organisation layer writes it (`XXXX-XXXX`, its alphabet), or null. */
export function scNormaliseCode(v) {
  const s = String(v ?? "").toUpperCase().replace(/[^A-Z2-9]/g, "");
  return s.length === 8 ? `${s.slice(0, 4)}-${s.slice(4)}` : null;
}

function scMe(state) {
  if (!state.me) state.me = `me-${Math.random().toString(36).slice(2, 10)}`;
  return state.me;
}

/** Set the nickname and the opt-out on this device (the dashboard's two controls). */
export function scSetNick(nick, store) { const s = scLoad(store); s.nick = String(nick ?? "").slice(0, 24); scSave(s, store); return scSafeName(s.nick); }
export function scSetOptOut(on, store) {
  const s = scLoad(store); s.optOut = !!on;
  for (const list of Object.values(s.boards)) for (const e of list) if (e.member === s.me) e.optOut = s.optOut;
  scSave(s, store); return s.optOut;
}

/** Put this learner's own entry on a class board (updates it when already there). */
export function scShareToClass(classCode, { name = "", store } = {}) {
  const code = scNormaliseCode(classCode);
  if (!code) return null;
  const s = scLoad(store);
  const sum = scSummary(s.sessions);
  const entry = { member: scMe(s), nick: scSafeName(s.nick, name), stars: sum.stars, sessions: sum.sessions, bestStreak: sum.bestStreak, optOut: s.optOut, at: new Date().toISOString() };
  const list = (s.boards[code] ??= []);
  const i = list.findIndex((e) => e.member === entry.member);
  if (i >= 0) list[i] = entry; else list.push(entry);
  scSave(s, store);
  return entry;
}

/** A class board as a file the teacher moves between devices: `{ kind, v, code, entries }`. */
export function scExportBoard(classCode, store) {
  const code = scNormaliseCode(classCode);
  const s = scLoad(store);
  return { kind: "sc-class-board", v: SC_VERSION, code, entries: (s.boards[code] ?? []).map(scCleanEntry) };
}

function scCleanEntry(e) {
  return {
    member: String(e?.member ?? "").slice(0, 40), nick: scSafeName(e?.nick), stars: Math.max(0, Math.round(Number(e?.stars) || 0)),
    sessions: Math.max(0, Math.round(Number(e?.sessions) || 0)), bestStreak: Math.max(0, Math.round(Number(e?.bestStreak) || 0)),
    optOut: !!e?.optOut, at: typeof e?.at === "string" ? e.at.slice(0, 30) : null,
  };
}

/** Merge a class-board file; every entry is re-cleaned (names re-derived), the newer entry per member wins. */
export function scImportBoard(file, store) {
  if (!file || file.kind !== "sc-class-board") return { ok: false, reason: "That is not a class board file." };
  const code = scNormaliseCode(file.code);
  if (!code) return { ok: false, reason: "The file has no class code." };
  const s = scLoad(store);
  const list = (s.boards[code] ??= []);
  let n = 0;
  for (const raw of Array.isArray(file.entries) ? file.entries : []) {
    const e = scCleanEntry(raw);
    if (!e.member) continue;
    const i = list.findIndex((x) => x.member === e.member);
    if (i < 0) { list.push(e); n += 1; } else if (String(e.at ?? "") >= String(list[i].at ?? "")) { list[i] = e; n += 1; }
  }
  scSave(s, store);
  return { ok: true, code, merged: n };
}

/**
 * The class leaderboard. `opts.entries` overrides the stored board (the checker's fixtures);
 * `opts.me` names this learner's member handle. The cohort's name comes from the organisation
 * layer when it is loaded (`enCohorts`, guarded). Ranks are by stars, then sessions, then name.
 */
export function scBoard(classCode, opts = {}) {
  const code = scNormaliseCode(classCode);
  if (!code) return null;
  const s = opts.entries ? null : scLoad(opts.store);
  const me = opts.me ?? s?.me ?? null;
  const all = (opts.entries ?? s?.boards[code] ?? []).map(scCleanEntry);
  const shown = all.filter((e) => !e.optOut);
  shown.sort((a, b) => b.stars - a.stars || b.sessions - a.sessions || a.nick.localeCompare(b.nick));
  const top = shown.slice(0, SC_BOARD_TOP).map((e, i) => ({ rank: i + 1, name: e.nick, stars: e.stars, sessions: e.sessions, you: e.member === me }));
  const mine = all.find((e) => e.member === me) ?? null;
  const rank = mine && !mine.optOut ? shown.findIndex((e) => e.member === me) : -1;
  let cohort = null;
  try { cohort = (typeof enCohorts === "function" ? enCohorts() : []).find((c) => c.code === code)?.name ?? null; } catch (_) { cohort = null; } // eslint-disable-line no-undef
  return {
    code, cohort, top,
    you: mine ? { name: mine.nick, stars: mine.stars, sessions: mine.sessions, bestStreak: mine.bestStreak, rank: rank >= 0 && rank < SC_BOARD_TOP ? rank + 1 : null, optOut: mine.optOut } : null,
    hidden: all.length - shown.length, total: all.length,
  };
}
