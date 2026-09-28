// Skill gates — "locked until the learner has completed these" for any quest,
// side game, treasure or egg on the platform (tools/briefs/frontier-brief.md,
// the shared data contract; docs/skill-gates.md).
//
//   gate: { stations?: [stationId…], programmes?: [{ id, minStars? }…],
//           quests?: [questId…], k12?: [stationId…], note }
//
// A station (or K-12 station) counts as complete at 1+ star in the learner's
// attempt log (records.js, the one log every world's passport reads). A
// programme counts as complete when every one of its stations is complete,
// or — when it names `minStars` — when the best stars summed over its
// stations reach that number (the same sum passport.js's ppProgramme shows).
// A quest counts as complete when Bay World's quest engine, the Deep's dive
// engine or the side-game ledger below has it marked done.
//
// Pure and storage-injectable: no DOM, no three.js. Every world reads it
// through one small hook (bayworld/js/quest-engine.js skips a gated quest
// while qmIsOpen() says no); the lock UI lives in skill-gates-ui.js.
// Every name is prefixed `qm`/`QM_`: the bundler concatenates modules into
// one scope and erases import aliases (tools/bundle_webxr.py).

import { gtStorage } from "./profiles.js";
import { PP_PROGRAMMES } from "./passport-programmes.js";
import { QM_STATION_NAMES } from "./gate-names-data.js";

/** The stores a gate reads (never writes, except the side-game ledger it owns). */
export const QM_RECORDS_KEY = "vr-training-records-v1";
export const QM_QUEST_KEYS = ["bayworld-quests-v1", "underwater-dives-v1"];
/** The side-game ledger: finished games, best safe-practice score, cosmetics earned. */
export const QM_LEDGER_KEY = "qm-side-games-v1";
export const QM_GATE_FIELDS = ["stations", "programmes", "quests", "k12"];

function qmStore(storage) {
  if (storage) return storage;
  try { return gtStorage(); } catch (_) { return null; }
}

function qmReadJson(store, key, fallback) {
  try {
    const raw = store?.getItem(key);
    if (!raw) return fallback;
    const v = JSON.parse(raw);
    return v && typeof v === "object" ? v : fallback;
  } catch (_) { return fallback; }
}

/** The side-game ledger: `{ done: { [gameId]: { score, of, at } }, cosmetics: [id…] }`. */
export function qmLedger(storage) {
  const raw = qmReadJson(qmStore(storage), QM_LEDGER_KEY, {});
  return {
    done: raw.done && typeof raw.done === "object" ? raw.done : {},
    cosmetics: Array.isArray(raw.cosmetics) ? raw.cosmetics : [],
  };
}

/**
 * Record a finished side game. Scored on safe practice only: `score` safe
 * calls out of `of`. A game counts as done (and its cosmetic unlocks) only
 * when every call was the safe one — a run with an unsafe call is a practice
 * run, kept as the best score but never marked done.
 */
export function qmFinishGame(game, { score, of }, storage) {
  const store = qmStore(storage);
  const led = qmLedger(store);
  const prev = led.done[game.id];
  const clean = (score | 0) >= (of | 0) && (of | 0) > 0;
  if (clean || !prev) led.done[game.id] = { score: score | 0, of: of | 0, at: new Date().toISOString(), clean: clean || !!prev?.clean };
  if (clean && game.reward?.cosmetic && !led.cosmetics.includes(game.reward.cosmetic)) led.cosmetics.push(game.reward.cosmetic);
  try { store?.setItem(QM_LEDGER_KEY, JSON.stringify(led)); } catch (_) { /* private mode */ }
  qmInvalidate();
  return { clean, cosmetic: clean ? game.reward?.cosmetic ?? null : null };
}

/**
 * One read of everything a gate can ask about: best stars per station, and
 * the set of finished quest / side-game ids. Take it once per frame or per
 * panel render and pass it to qmIsOpen / qmMissing.
 */
export function qmSnapshot(storage) {
  const store = qmStore(storage);
  const stars = new Map();
  let records = [];
  try { records = JSON.parse(store?.getItem(QM_RECORDS_KEY) || "[]"); } catch (_) { records = []; }
  for (const r of Array.isArray(records) ? records : []) {
    if (!r || !r.simId) continue;
    stars.set(r.simId, Math.max(stars.get(r.simId) ?? 0, r.stars | 0));
  }
  const questsDone = new Set();
  for (const key of QM_QUEST_KEYS) {
    const byId = qmReadJson(store, key, {}).byId ?? {};
    for (const [id, e] of Object.entries(byId)) if (e && e.done) questsDone.add(id);
  }
  for (const [id, e] of Object.entries(qmLedger(store).done)) if (e && e.clean) questsDone.add(id);
  return { stars, questsDone };
}

let qmCache = null;
/**
 * qmSnapshot() for a per-frame caller (the quest engine's hook): re-read at
 * most once a second per storage, and at once after qmInvalidate() (a
 * mission return, a finished side game).
 */
export function qmCachedSnapshot(storage, now = Date.now()) {
  if (qmCache && qmCache.storage === (storage ?? null) && now - qmCache.at < 1000) return qmCache.snap;
  qmCache = { storage: storage ?? null, at: now, snap: qmSnapshot(storage) };
  return qmCache.snap;
}
/** Drop the cached snapshot so the next gate read sees fresh completions. */
export function qmInvalidate() { qmCache = null; }

function qmStationDone(id, snap) { return (snap.stars.get(id) ?? 0) >= 1; }

function qmProgrammeState(p, snap) {
  const prog = PP_PROGRAMMES[p.id];
  if (!prog) return { done: false, stars: 0, total: 0, passed: 0 };
  let stars = 0, passed = 0;
  for (const s of prog.stations) { const n = snap.stars.get(s) ?? 0; stars += n; if (n >= 1) passed += 1; }
  const done = p.minStars ? stars >= p.minStars : passed >= prog.stations.length;
  return { done, stars, total: prog.stations.length, passed };
}

/**
 * What still stands between the learner and this gate, as display-ready
 * rows: `[{ kind: "station"|"k12"|"programme"|"quest", id, label, detail }]`.
 * An empty list means open. A missing or empty gate is always open.
 */
export function qmMissing(gate, snap = qmSnapshot()) {
  if (!gate) return [];
  const out = [];
  for (const id of gate.stations ?? []) if (!qmStationDone(id, snap)) out.push({ kind: "station", id, label: qmLabel(id) });
  for (const id of gate.k12 ?? []) if (!qmStationDone(id, snap)) out.push({ kind: "k12", id, label: qmLabel(id) });
  for (const p of gate.programmes ?? []) {
    const st = qmProgrammeState(p, snap);
    if (st.done) continue;
    const name = PP_PROGRAMMES[p.id]?.name ?? qmLabel(p.id);
    out.push({ kind: "programme", id: p.id, label: name,
      detail: p.minStars ? `${st.stars} of ${p.minStars} stars` : `${st.passed} of ${st.total} stations` });
  }
  for (const id of gate.quests ?? []) if (!snap.questsDone.has(id)) out.push({ kind: "quest", id, label: qmQuestTitles.get(id) ?? qmLabel(id.replace(/^(bw|dv|qm)-/, "")) });
  return out;
}

/** True when every requirement in the gate is met (or there is no gate). */
export function qmIsOpen(gate, snap) {
  if (!gate) return true;
  return qmMissing(gate, snap ?? qmSnapshot()).length === 0;
}

/** Every station id a gate names, stations and K-12 alike (the lock's links). */
export function qmGateStations(gate) {
  return [...(gate?.stations ?? []), ...(gate?.k12 ?? [])];
}

const qmQuestTitles = new Map();
/** Teach the lock UI a world's quest titles, so a quest requirement reads "Yard Qualified", not its id. */
export function qmNameQuests(list) { for (const q of list ?? []) if (q?.id && q.title) qmQuestTitles.set(q.id, q.title); }

/** A station's display name from the catalog (gate-names-data.js, generated by tools/gen_gate_names.mjs), else the id read aloud: "crane-yard" -> "crane yard". */
export function qmLabel(id) { return QM_STATION_NAMES[id] ?? String(id ?? "").replace(/-/g, " "); }

/**
 * The "Skills to unlock" roll-up for a quest log: every station still
 * missing across the locked items, with the items each one opens, most
 * doors first. `items` is any list of `{ id, title, gate }`.
 */
export function qmSkillsToUnlock(items, snap = qmSnapshot()) {
  const by = new Map();
  for (const it of items) {
    for (const m of qmMissing(it.gate, snap)) {
      const key = `${m.kind}:${m.id}`;
      if (!by.has(key)) by.set(key, { ...m, opens: [] });
      by.get(key).opens.push(it.title ?? it.id);
    }
  }
  return [...by.values()].sort((a, b) => b.opens.length - a.opens.length || a.label.localeCompare(b.label));
}

/** Validate the gate's shape (the checker and the data modules share this). */
export function qmGateProblems(gate) {
  const out = [];
  if (!gate || typeof gate !== "object") return ["no gate object"];
  if (typeof gate.note !== "string" || gate.note.trim().length < 12) out.push("gate has no one-line note");
  const any = QM_GATE_FIELDS.some((f) => Array.isArray(gate[f]) && gate[f].length);
  if (!any) out.push("gate names no requirement");
  for (const k of Object.keys(gate)) if (k !== "note" && !QM_GATE_FIELDS.includes(k)) out.push(`unknown gate field "${k}"`);
  for (const p of gate.programmes ?? []) if (!p || typeof p.id !== "string") out.push("programme entry without an id");
  return out;
}
