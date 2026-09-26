// Course tracking and accountability — the union-hall layer above records.js
// and competency.js.
//
// records.js is the auditable attempt log; competency.js is the sober "can
// this worker actually do it" tier. This module answers a third, blunter
// question a training director or a union rep asks: is this member training
// *regularly*, is anything of theirs going stale, and can an instructor put
// their name on a level a learner claims. Nothing here scores a run — it only
// reads the record, the ladder and the curriculum, the same way every other
// pure layer in shared/ does, so tools/check_records.mjs can run all of it in
// Node with a small fixture ladder rather than the real 30-programme catalog.
//
// Four kinds of thing live here:
//   - myTrainingSummary(): one programme's card — levels, lessons, time on
//     task (measured, never estimated: it is the sum of each attempt's own
//     `seconds`), last station, next level, badges, standards evidenced.
//   - refreshersDue() / refresherInterval(): a station's last CLEAN run
//     (records.js's own pass rule) against a per-programme interval that
//     defaults to 90 days when nothing declares one — always labelled a
//     platform default, never a union rule, because this codebase does not
//     invent one.
//   - SignOffs: an instructor's attestation of a learner's level — a name, a
//     date and a note, never a credential — stored the same append-only way
//     records.js stores an attempt.
//   - buildTranscript()/transcriptHtml(): the exportable "record of simulator
//     activity on this platform, not a certification" — attempts in the same
//     shape records.js stores, plus the roll-up above, as JSON and as a
//     printable page.
//   - the accountability gamification: streak and on-time-refresher XP
//     bonuses, a per-programme clean-run badge series, the hazard-free-week
//     badge, and a programme leaderboard keyed on whatever the learner typed
//     into the crew-tag field (records.js/game.js never collect more than
//     that, so a "first name or initials only" rule is already true of the
//     data this reads).

import { passed } from "./records.js";
import { levelState, ladderLevel } from "./ladder.js";
import { escapeHtml } from "./a11y.js";

const DAY_MS = 24 * 60 * 60 * 1000;

/** The interval this platform falls back to when nothing declares its own. */
export const DEFAULT_REFRESHER_DAYS = 90;

const SIGNOFF_KEY = "vr-training-signoffs-v1";
const MAX_SIGNOFFS = 1000;

// ------------------------------------------------------------------ helpers

function dayOf(at) {
  const s = String(at ?? "");
  return /^\d{4}-\d{2}-\d{2}/.test(s) ? s.slice(0, 10) : null;
}

function timeMs(at) {
  const t = new Date(String(at ?? "")).getTime();
  return Number.isFinite(t) ? t : null;
}

/** Whole seconds as "Hh Mm" / "Mm" / "Ss", for a card a learner reads. */
export function durationText(totalSeconds) {
  const s = Math.max(0, Math.round(totalSeconds | 0));
  const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), sec = s % 60;
  if (h) return `${h}h ${m}m`;
  if (m) return `${m}m ${sec}s`;
  return `${sec}s`;
}

function stationIdsOf(curriculum) {
  return new Set((curriculum?.stations ?? []).map((s) => s.id));
}

// ------------------------------------------------------------- refresh rule
//
// A programme can declare its own interval two ways — CURRICULA[i].completionRule
// .refresherDays, or the ladder's own .refresherDays — and either one wins
// over the platform default. Nothing in this tree declares one yet, so every
// programme runs on the default today; the lookup exists so a hall that needs
// a different cadence for one programme can add the field without this
// module changing.

/** `{ days, isDefault }` — the refresher interval for one programme. */
export function refresherInterval(curriculum, ladder) {
  const custom = curriculum?.completionRule?.refresherDays ?? ladder?.refresherDays ?? null;
  const days = Number.isFinite(custom) && custom > 0 ? custom : DEFAULT_REFRESHER_DAYS;
  return { days, isDefault: custom == null };
}

/** "platform default (90 days)" / "programme rule (45 days)" — the sentence a
 *  card puts next to a due date so nobody mistakes the default for a union rule. */
export function refresherLabel(interval) {
  return `${interval.isDefault ? "platform default" : "programme rule"} (${interval.days} day${interval.days === 1 ? "" : "s"})`;
}

/**
 * Stations in `curriculum` whose last CLEAN run (records.js's own pass rule —
 * two or more stars, no unsafe action) is older than the programme's
 * refresher interval. A station never run, or never passed, is not "due" —
 * there is no clean baseline yet to age.
 */
export function refreshersDue(records = [], { curriculum = null, ladder = null, now = new Date() } = {}) {
  const interval = refresherInterval(curriculum, ladder);
  const ids = curriculum ? stationIdsOf(curriculum) : null;
  const lastClean = new Map();
  for (const r of records) {
    if (!r?.simId) continue;
    if (ids && !ids.has(r.simId)) continue;
    if (!passed(r)) continue;
    const at = String(r.at ?? "");
    const prev = lastClean.get(r.simId);
    if (!prev || at > prev.at) lastClean.set(r.simId, { at, simName: r.simName ?? r.simId });
  }
  const nowMs = now.getTime();
  const out = [];
  for (const [stationId, last] of lastClean) {
    const t = timeMs(last.at);
    if (t == null) continue;
    const ageDays = Math.floor((nowMs - t) / DAY_MS);
    if (ageDays > interval.days) {
      out.push({
        programme: curriculum?.id ?? null, stationId, stationName: last.simName,
        lastCleanAt: last.at, ageDays, dueDays: interval.days, isDefaultInterval: interval.isDefault,
        overdueDays: ageDays - interval.days,
      });
    }
  }
  out.sort((a, b) => b.overdueDays - a.overdueDays);
  return out;
}

// ---------------------------------------------------------------- streak

/**
 * Consecutive calendar days (UTC) with at least one attempt, counted back
 * from the most recent day trained. `active` says whether that streak still
 * covers today or yesterday — a learner who trained every day for a month
 * and then stopped keeps the number on their record, but the card should not
 * claim they are "on" a streak that ended three weeks ago.
 */
export function trainingStreak(records = [], now = new Date()) {
  const days = new Set(records.map((r) => dayOf(r.at)).filter(Boolean));
  if (!days.size) return { days: 0, active: false, lastDay: null };
  const lastDay = [...days].sort().pop();
  let count = 1;
  const cursor = new Date(`${lastDay}T00:00:00.000Z`);
  for (;;) {
    cursor.setUTCDate(cursor.getUTCDate() - 1);
    const key = cursor.toISOString().slice(0, 10);
    if (days.has(key)) count += 1; else break;
  }
  const today = dayOf(now.toISOString());
  const yesterday = dayOf(new Date(now.getTime() - DAY_MS).toISOString());
  return { days: count, active: lastDay === today || lastDay === yesterday, lastDay };
}

// ------------------------------------------------------------- my training

/**
 * One programme's card, read entirely from the training record and its
 * ladder: levels completed of 20, lessons completed of the ladder's total,
 * time on task (the sum of each attempt's own measured `seconds` — never an
 * estimate), the last station trained, the next open level, every badge
 * earned on one of this programme's stations, and the standards evidenced by
 * the levels actually passed (their titles, from `standardsById`, a lookup
 * like smartcity/js/ladders.js's LADDER_STANDARDS — an id alone when the
 * caller does not supply one).
 */
export function myTrainingSummary(records = [], { curriculum = null, ladder = null, standardsById = {}, now = new Date() } = {}) {
  const ids = stationIdsOf(curriculum);
  const progRecords = curriculum ? records.filter((r) => ids.has(r?.simId)) : records.slice();
  const sorted = [...progRecords].sort((a, b) => String(a.at ?? "").localeCompare(String(b.at ?? "")));
  const last = sorted[sorted.length - 1] ?? null;

  const levels = ladder ? levelState(ladder, records) : [];
  const passedLevels = levels.filter((l) => l.state === "passed");
  const lessonsTotal = ladder?.lessons ?? levels.reduce((a, l) => a + (l.lessons | 0), 0);
  const lessonsCompleted = passedLevels.reduce((a, l) => a + (l.lessons | 0), 0);
  const nextLevel = levels.find((l) => l.state === "open") ?? null;

  const standardIds = new Set();
  for (const l of passedLevels) {
    const full = ladder ? ladderLevel(ladder, l.n) : null;
    for (const id of full?.standards ?? []) standardIds.add(id);
  }
  const standardsEvidenced = [...standardIds]
    .map((id) => (standardsById[id] ? `${standardsById[id].body} ${standardsById[id].title}` : id))
    .sort();

  return {
    id: curriculum?.id ?? null, name: curriculum?.name ?? null,
    attempts: progRecords.length,
    levelsCompleted: passedLevels.length, levelsTotal: levels.length,
    lessonsCompleted, lessonsTotal,
    timeOnTaskSeconds: progRecords.reduce((a, r) => a + (r.seconds | 0), 0),
    lastStation: last ? (last.simName ?? last.simId) : null,
    lastAt: last?.at ?? null,
    nextLevel: nextLevel ? { n: nextLevel.n, title: nextLevel.title } : null,
    badgesEarned: [...new Set(progRecords.flatMap((r) => r.badges ?? []))],
    standardsEvidenced,
    refreshersDue: refreshersDue(records, { curriculum, ladder, now }),
  };
}

/** Every programme's card, most-attempts-first — what the My Training card lists. */
export function allMyTraining(records = [], { curricula = [], ladders = [], standardsById = {}, now = new Date() } = {}) {
  return curricula
    .map((curriculum) => myTrainingSummary(records, {
      curriculum, ladder: ladders.find((l) => l.programme === curriculum.id) ?? null, standardsById, now,
    }))
    .filter((p) => p.attempts > 0)
    .sort((a, b) => b.attempts - a.attempts);
}

// -------------------------------------------------------------- sign-offs
//
// An instructor's attestation of a learner's level: a name, a date and a
// note, stored the same append-only way records.js stores an attempt. It is
// never treated as a credential — see buildTranscript()/transcriptHtml()
// below, which render it as "instructor attestation" and nothing stronger.

function loadSignOffs() {
  try {
    const raw = JSON.parse(localStorage.getItem(SIGNOFF_KEY) || "[]");
    return Array.isArray(raw) ? raw : [];
  } catch (_) { return []; }
}
function saveSignOffs(list) {
  try { localStorage.setItem(SIGNOFF_KEY, JSON.stringify(list)); } catch (_) { /* private mode */ }
}

export const SignOffs = {
  list() { return loadSignOffs(); },

  /** `{ programme, level, learner, instructor, note, at }` — programme,
   *  level and instructor are required; the rest may be blank. */
  add({ programme, level, learner = null, instructor, note = "", at = new Date().toISOString() } = {}) {
    if (!programme || !level || !String(instructor ?? "").trim()) {
      throw new Error("A sign-off needs a programme, a level and the instructor's name.");
    }
    const list = loadSignOffs();
    const entry = {
      id: `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`,
      programme: String(programme), level: level | 0,
      learner: learner ? String(learner).slice(0, 40) : null,
      instructor: String(instructor).trim().slice(0, 80),
      note: String(note ?? "").trim().slice(0, 500),
      at,
    };
    list.push(entry);
    if (list.length > MAX_SIGNOFFS) list.splice(0, list.length - MAX_SIGNOFFS);
    saveSignOffs(list);
    return entry;
  },

  clear() { try { localStorage.removeItem(SIGNOFF_KEY); } catch (_) { /* ignore */ } },

  /** Sign-offs for one programme's level, newest first — a learner named
   *  filters to their own, `null` returns every learner's (single-learner
   *  browser, or an instructor's own view). */
  forLevel(programme, level, learner = null) {
    return loadSignOffs()
      .filter((s) => s.programme === programme && s.level === level && (learner == null || s.learner == null || s.learner === learner))
      .sort((a, b) => String(b.at ?? "").localeCompare(String(a.at ?? "")));
  },
};

// ----------------------------------------------------------------- transcript

/**
 * The exportable transcript: every attempt in the exact shape records.js
 * stores (so it round-trips through JSON.stringify/parse unchanged), plus the
 * roll-up my-training gives per programme, sign-offs, time on task and a
 * streak — labelled, once at the top, plainly: a record of activity, not a
 * credential.
 */
export const TRANSCRIPT_DISCLAIMER = "This is a record of simulator activity on this platform, not a certification.";

export function buildTranscript(records = [], {
  learner = null, curricula = [], ladders = [], standardsById = {}, signOffs = null, now = new Date(),
} = {}) {
  const offs = signOffs ?? SignOffs.list();
  const learnerName = learner ?? records.find((r) => r.learnerName || r.learner)?.learnerName
    ?? records.find((r) => r.learner)?.learner ?? "YOU";
  const programmes = curricula
    .map((curriculum) => {
      const ladder = ladders.find((l) => l.programme === curriculum.id) ?? null;
      const summary = myTrainingSummary(records, { curriculum, ladder, standardsById, now });
      return { ...summary, signOffs: offs.filter((s) => s.programme === curriculum.id) };
    })
    .filter((p) => p.attempts > 0 || p.signOffs.length > 0);
  return {
    generatedAt: now.toISOString(),
    learner: learnerName,
    disclaimer: TRANSCRIPT_DISCLAIMER,
    totals: {
      attempts: records.length,
      timeOnTaskSeconds: records.reduce((a, r) => a + (r.seconds | 0), 0),
      streak: trainingStreak(records, now),
      badges: [...new Set(records.flatMap((r) => r.badges ?? []))],
    },
    attempts: records,
    programmes,
  };
}

function fmtStamp(at) { return String(at ?? "").replace("T", " ").slice(0, 16) || "—"; }

/**
 * A printable HTML page from buildTranscript()'s data — pure string assembly
 * with every learner-, note- and station-supplied value passed through
 * escapeHtml, so this runs identically in Node (tools/check_records.mjs) and
 * in a browser's print window. Never uses the word "certified": the one
 * credential-shaped word in the whole page is "certification", and only in
 * the disclaimer's negation of it.
 */
export function transcriptHtml(data) {
  const esc = escapeHtml;
  const t = data.totals;
  const sections = data.programmes.map((p) => `
    <section>
      <h2>${esc(p.name ?? p.id ?? "Programme")}</h2>
      <p class="meta">${p.levelsCompleted} of ${p.levelsTotal} levels complete &middot; ${p.lessonsCompleted} of ${p.lessonsTotal} lessons &middot; time on task ${esc(durationText(p.timeOnTaskSeconds))}</p>
      <p class="meta">${p.lastStation ? `Last station: ${esc(p.lastStation)}` : "No station played yet"}${p.nextLevel ? ` &middot; Next level: ${p.nextLevel.n} &mdash; ${esc(p.nextLevel.title)}` : ""}</p>
      <p>Badges earned: ${p.badgesEarned.length ? p.badgesEarned.map(esc).join(", ") : "none yet"}</p>
      <p>Standards evidenced: ${p.standardsEvidenced.length ? p.standardsEvidenced.map(esc).join("; ") : "none yet"}</p>
      ${p.refreshersDue.length ? `<p class="due">Refreshers due (${esc(refresherLabel({ days: p.refreshersDue[0].dueDays, isDefault: p.refreshersDue[0].isDefaultInterval }))}): ${p.refreshersDue.map((d) => esc(d.stationName ?? d.stationId)).join(", ")}</p>` : ""}
      ${p.signOffs.length ? `<div class="attest"><p class="eyebrow">Instructor attestation</p><ul>${p.signOffs.map((s) => `<li>Level ${s.level}, attested by ${esc(s.instructor)} on ${esc(fmtStamp(s.at))}${s.note ? ` &mdash; ${esc(s.note)}` : ""}</li>`).join("")}</ul></div>` : ""}
    </section>`).join("\n");
  return `<!doctype html>
<html lang="en">
<head><meta charset="utf-8"><title>Training activity record — ${esc(data.learner)}</title>
<style>
  body{ font:13px/1.5 "Helvetica Neue", Arial, sans-serif; color:#111; margin:32px; max-width:960px }
  h1{ font-size:21px; margin:0 0 2px; text-transform:uppercase; letter-spacing:.04em }
  h2{ font-size:15px; margin:20px 0 2px; page-break-after:avoid }
  .eyebrow{ font-size:10px; letter-spacing:.16em; text-transform:uppercase; color:#666; margin:0 0 4px }
  .disclaimer{ border:1px solid #ccc; border-left:3px solid #111; padding:8px 11px; margin:12px 0 18px; font-size:12px; background:#f7f7f7 }
  .meta{ color:#555; font-size:11.5px; margin:2px 0 4px }
  .due{ color:#8a4b00 }
  .attest{ margin-top:6px; padding:8px 10px; background:#f2f6f2; border-left:3px solid #3a7d3a }
  .attest ul{ margin:4px 0 0 18px; padding:0; font-size:11.5px }
  section{ page-break-inside:avoid; border-bottom:1px solid #ddd; padding-bottom:6px }
  footer{ margin-top:20px; border-top:1px solid #ccc; padding-top:8px; font-size:10.5px; color:#555 }
  @media print{ body{ margin:12mm } }
</style></head>
<body>
  <p class="eyebrow">SmartCiti.X &middot; training activity record</p>
  <h1>Training Activity Record</h1>
  <p class="disclaimer"><b>${esc(data.disclaimer)}</b></p>
  <p class="meta">${esc(data.learner)} &middot; ${t.attempts} attempt${t.attempts === 1 ? "" : "s"} &middot; time on task ${esc(durationText(t.timeOnTaskSeconds))} &middot; ${t.streak.days} consecutive training day${t.streak.days === 1 ? "" : "s"}${t.streak.active ? " (current)" : ""}</p>
${sections}
  <footer>Generated ${esc(fmtStamp(data.generatedAt))} from this browser's own training record. A level's instructor attestation records that an instructor watched and signed it; it is not a licence or a certification issued by any standards body.</footer>
</body>
</html>
`;
}

// ---------------------------------------------------------- accountability
//
// Bonuses and badges computed straight from the record, never a separate
// mutable ledger — the same "pure function over the record" shape as
// competency.js, so a bonus a card shows today is exactly reproducible from
// the same attempts tomorrow.

/** Cumulative XP for reaching a streak milestone — every tier reached adds. */
export const STREAK_XP_BONUSES = [
  { days: 3, xp: 50 }, { days: 7, xp: 150 }, { days: 14, xp: 400 }, { days: 30, xp: 1000 },
];
export function streakBonusXp(streakDays) {
  return STREAK_XP_BONUSES.filter((t) => (streakDays | 0) >= t.days).reduce((a, t) => a + t.xp, 0);
}

/** XP for each refresher run that renewed a station before it went overdue:
 *  a second clean run on the same station, at least 60% of the way through
 *  the interval but before it lapsed. */
export const ON_TIME_REFRESHER_XP = 100;
export function onTimeRefreshers(records = [], { curriculum = null, ladder = null } = {}) {
  const interval = refresherInterval(curriculum, ladder);
  const ids = curriculum ? stationIdsOf(curriculum) : null;
  const byStation = new Map();
  for (const r of records) {
    if (!r?.simId || (ids && !ids.has(r.simId)) || !passed(r)) continue;
    if (!byStation.has(r.simId)) byStation.set(r.simId, []);
    byStation.get(r.simId).push(r);
  }
  let count = 0;
  for (const runs of byStation.values()) {
    const sorted = [...runs].sort((a, b) => String(a.at ?? "").localeCompare(String(b.at ?? "")));
    for (let i = 1; i < sorted.length; i++) {
      const prev = timeMs(sorted[i - 1].at), cur = timeMs(sorted[i].at);
      if (prev == null || cur == null) continue;
      const ageDays = (cur - prev) / DAY_MS;
      if (ageDays >= interval.days * 0.6 && ageDays <= interval.days) count += 1;
    }
  }
  return count;
}
export function onTimeRefresherXp(records, opts) { return onTimeRefreshers(records, opts) * ON_TIME_REFRESHER_XP; }

/** A run with no correction and no unsafe action — the bar the "clean run"
 *  badge series counts, per programme. */
function isCleanRun(r) { return (r.hazardHits | 0) === 0 && (r.errors | 0) === 0; }
export const CLEAN_RUN_TIERS = [5, 10, 20];
export function cleanRunCount(records = [], curriculum = null) {
  const ids = curriculum ? stationIdsOf(curriculum) : null;
  return records.filter((r) => (!ids || ids.has(r.simId)) && isCleanRun(r)).length;
}
/** Every clean-run tier this programme has reached, lowest first. */
export function cleanRunBadges(records = [], curriculum = null) {
  const n = cleanRunCount(records, curriculum);
  return CLEAN_RUN_TIERS.filter((tier) => n >= tier).map((tier) => ({
    id: `clean-run-${curriculum?.id ?? "all"}-${tier}`,
    tier, count: n,
    label: `${tier} Clean Runs${curriculum ? ` — ${curriculum.name}` : ""}`,
  }));
}

/** A coarse, deterministic week bucket (days since epoch / 7) — good enough
 *  to ask "did every run this week come back clean", not a calendar system. */
function weekBucket(at) {
  const t = timeMs(at);
  return t == null ? null : Math.floor(t / (7 * DAY_MS));
}
/** Week buckets in which every attempt (platform-wide) had zero unsafe actions. */
export function hazardFreeWeeks(records = []) {
  const byWeek = new Map();
  for (const r of records) {
    const wk = weekBucket(r.at);
    if (wk == null) continue;
    if (!byWeek.has(wk)) byWeek.set(wk, []);
    byWeek.get(wk).push(r);
  }
  const weeks = [];
  for (const [wk, runs] of byWeek) if (runs.length && runs.every((r) => (r.hazardHits | 0) === 0)) weeks.push(wk);
  return weeks.sort((a, b) => a - b);
}
export function hazardFreeWeekBadge(records = []) {
  const weeks = hazardFreeWeeks(records);
  return weeks.length ? { id: "hazard-free-week", weeks: weeks.length, label: "Hazard-Free Week" } : null;
}

/**
 * A programme's leaderboard by lessons completed. Grouped on whatever the
 * learner typed into the crew-tag field (game.js's `learnerName`/`learner` —
 * the app never asks for more than a first name or initials), so this reads
 * only what the learner themselves chose to be called; it invents nothing.
 */
export function programmeLeaderboard(records = [], { curriculum = null, ladder = null } = {}) {
  const ids = curriculum ? stationIdsOf(curriculum) : null;
  const byLearner = new Map();
  for (const r of records) {
    if (ids && !ids.has(r.simId)) continue;
    const name = String(r.learnerName ?? r.learner ?? "").trim();
    if (!name) continue;
    if (!byLearner.has(name)) byLearner.set(name, []);
    byLearner.get(name).push(r);
  }
  const rows = [...byLearner.entries()].map(([name, list]) => {
    const summary = myTrainingSummary(list, { curriculum, ladder });
    return { name, lessonsCompleted: summary.lessonsCompleted, levelsCompleted: summary.levelsCompleted };
  });
  rows.sort((a, b) => b.lessonsCompleted - a.lessonsCompleted || b.levelsCompleted - a.levelsCompleted || a.name.localeCompare(b.name));
  return rows;
}
