// DEAN — the control layer teachers and admins use across every world
// (console DEAN, docs/modules.md): a **version** of the platform for a class or
// an organisation (which packs, worlds, paths and programmes are on, and
// whether learners may switch paths), **modules** (an ordered set of lessons,
// stations and field lessons from any world, a due date and a required score,
// assigned to class codes), the file round trip, and the apply step a world
// runs at load.
//
// Seams (docs/consoles/DEAN.md, "Seams"):
//   dnVersion()            -> { id, name, scope, packs|null, worlds|null, paths|null, programmes|null, locked, lockedPath }
//   dnModules()            -> [{ v, kind: "module", id, title, lessons: [{ kind, id, world }], due, requiredScore, assign: [{ classCode, at }] }]
//   dnApplyModule(world)   -> { world, allowed, version, modules, glow: { stations, lessons, sites }, hidden: { worlds, packs, stations } }
//   dnCanSwitchPath(id)    -> boolean   (STORYLINE's picker asks before stChosenPath changes)
//   dnUsePacks(pkPacks)    — PACKS' registry, registered by the host page; until then one pack per catalogue programme
//   dnUseSessions(scSessions) — SCHOLAR's sessions `[{ lessonId, learner, classCode, stars, score, at }]`, guarded
//
// Store `vr-dean-v1` through gtStorage() (private to the signed-in profile,
// listed in GT_PROFILE_KEYS). No network request. The deployment's
// `enterprise` block (auth-config.json, file-only) is always the stricter side:
// a version can switch a world off, never back on. Every top-level name is
// prefixed dn/DN_ (the bundler shares one scope).

import { gtStorage } from "./profiles.js";
import { PP_PROGRAMMES } from "./passport-programmes.js";
import { enLoad, enMyCohorts } from "./org.js";

export const DN_KEY = "vr-dean-v1";
export const DN_SCHEMA_VERSION = 1;
/** The worlds a version may switch (the enterprise block's list, auth.js ENTERPRISE_WORLDS). */
export const DN_WORLDS = ["bayworld", "regatta", "underwater", "summit", "parishes", "fairway", "redwood", "atlas", "smartcity", "holodeck"];
/** STORYLINE's path ids (packs-brief-2.md). */
export const DN_PATHS = ["union-trades", "k12", "first-responders", "un-training", "disaster-relief", "teachers", "roam"];
/** A lesson reference's kinds: a catalogue station, a K-12 field lesson (any world), a BAYOU parish lesson. */
export const DN_LESSON_KINDS = ["station", "field", "parish-lesson"];

const dnHooks = { packs: null, sessions: null, enterprise: null };

/** Register PACKS' `pkPacks` (the host page does this once the module is in its tree). */
export function dnUsePacks(fn) { dnHooks.packs = typeof fn === "function" ? fn : null; }
/** Register SCHOLAR's `scSessions`. */
export function dnUseSessions(fn) { dnHooks.sessions = typeof fn === "function" ? fn : null; }
/** The deployment's enterprise block (Auth.config.enterprise), or null for none. */
export function dnSetEnterprise(e) { dnHooks.enterprise = e && typeof e === "object" ? e : null; }

/**
 * The packs: PACKS' registry when registered, else one fallback pack per
 * catalogue programme — `[{ id, title, programmes, stations, worlds, path, source }]`.
 */
export function dnPacks() {
  let list = null;
  try { list = dnHooks.packs?.() ?? null; } catch (_) { list = null; }
  if (Array.isArray(list) && list.length) return list.map((p) => ({ ...p, source: p.source ?? "pk-packs" }));
  return Object.entries(PP_PROGRAMMES).map(([id, p]) => ({
    id, title: p.name, programmes: [id], stations: [...(p.stations ?? [])], worlds: null, path: null, source: "fallback-programmes",
  }));
}

// ------------------------------------------------------------------ store

function dnStore() { try { return gtStorage(); } catch (_) { return null; } }
export function dnEmpty() { return { v: DN_SCHEMA_VERSION, versions: [], modules: [], active: null }; }

export function dnLoad() {
  try {
    const raw = dnStore()?.getItem(DN_KEY);
    const s = raw ? JSON.parse(raw) : null;
    if (!s || s.v !== DN_SCHEMA_VERSION) return dnEmpty();
    return { ...dnEmpty(), ...s, versions: Array.isArray(s.versions) ? s.versions : [], modules: Array.isArray(s.modules) ? s.modules : [] };
  } catch (_) { return dnEmpty(); }
}
function dnSave(s) {
  try { dnStore()?.setItem(DN_KEY, JSON.stringify(s)); } catch (_) { return false; }
  try { globalThis.dispatchEvent?.(new Event("dn:change")); } catch (_) { /* headless */ }
  return true;
}
export function dnClear() { try { dnStore()?.removeItem(DN_KEY); } catch (_) { /* ignore */ } }

const dnId = (p) => `${p}-${Math.random().toString(36).slice(2, 8)}${Date.now().toString(36).slice(-4)}`;
const dnText = (v, max = 120) => String(v ?? "").replace(/[\u0000-\u001f]/g, " ").trim().slice(0, max);
const dnList = (v, allowed = null) => (Array.isArray(v) ? [...new Set(v.map((x) => dnText(x, 80)).filter((x) => /^[a-z0-9-]{1,80}$/.test(x) && (!allowed || allowed.includes(x))))] : null);
const dnCode = (v) => String(v ?? "").toUpperCase().replace(/[^A-Z0-9]/g, "").replace(/^(.{4})(.{4})$/, "$1-$2");

// --------------------------------------------------------------- versions

/**
 * A version, cleaned: `{ v, kind: "version", id, name, scope: { kind: "class" | "org" | "device", id },
 * packs, worlds, paths, programmes (each null = all on), locked, lockedPath, updatedAt }`.
 */
export function dnCleanVersion(raw) {
  const r = raw && typeof raw === "object" ? raw : {};
  const sk = ["class", "org", "device"].includes(r.scope?.kind) ? r.scope.kind : "device";
  const paths = dnList(r.paths, DN_PATHS);
  const lockedPath = DN_PATHS.includes(r.lockedPath) ? r.lockedPath : null;
  return {
    v: DN_SCHEMA_VERSION, kind: "version", id: /^ver-[a-z0-9-]{1,40}$/.test(r.id) ? r.id : dnId("ver"),
    name: dnText(r.name, 80) || "Untitled version",
    scope: { kind: sk, id: sk === "class" ? dnCode(r.scope?.id) : dnText(r.scope?.id, 80) || null },
    packs: Array.isArray(r.packs) ? dnList(r.packs) : null,
    worlds: Array.isArray(r.worlds) ? dnList(r.worlds, DN_WORLDS) : null,
    paths: Array.isArray(r.paths) ? paths : null,
    programmes: Array.isArray(r.programmes) ? dnList(r.programmes) : null,
    locked: !!r.locked, lockedPath: r.locked ? lockedPath : null,
    updatedAt: typeof r.updatedAt === "string" ? r.updatedAt : new Date().toISOString(),
  };
}

export function dnVersions() { return dnLoad().versions.slice(); }

/** Save (create or replace by id) a version. */
export function dnSaveVersion(raw) {
  const s = dnLoad();
  const v = dnCleanVersion({ ...raw, updatedAt: new Date().toISOString() });
  s.versions = [...s.versions.filter((x) => x.id !== v.id), v];
  dnSave(s);
  return v;
}
export function dnDeleteVersion(id) { const s = dnLoad(); s.versions = s.versions.filter((x) => x.id !== id); if (s.active === id) s.active = null; dnSave(s); }
/** Make a version the one this device applies whatever the class (an admin's override); null clears it. */
export function dnSetActive(id) { const s = dnLoad(); s.active = s.versions.some((x) => x.id === id) ? id : null; dnSave(s); return s.active; }
/** Lock or unlock a version: a locked version pins learners to `lockedPath` (or to its path list). */
export function dnLockVersion(id, locked, lockedPath = null) {
  const v = dnVersions().find((x) => x.id === id);
  return v ? dnSaveVersion({ ...v, locked: !!locked, lockedPath: locked ? lockedPath : null }) : null;
}

/** The class codes on this device: every cohort joined here (the learner's side of org.js). */
export function dnMyClassCodes() {
  try {
    const mine = new Set(enMyCohorts([]).map((c) => c.cohort.id));
    return enLoad().cohorts.filter((c) => mine.has(c.id)).map((c) => c.code);
  } catch (_) { return []; }
}

const DN_ALL_ON = Object.freeze({ id: "ver-all-on", name: "Everything on", scope: { kind: "device", id: null }, packs: null, worlds: null, paths: null, programmes: null, locked: false, lockedPath: null });

/**
 * The effective version on this device: the active override, else the version of a class
 * joined here, else an organisation's, else everything on — then intersected with the
 * deployment's enterprise block (worlds, programmes), which always wins.
 */
export function dnVersion({ classCodes = null, enterprise = dnHooks.enterprise } = {}) {
  const s = dnLoad();
  const codes = (classCodes ?? dnMyClassCodes()).map(dnCode);
  const pick = s.versions.find((v) => v.id === s.active)
    ?? s.versions.find((v) => v.scope.kind === "class" && codes.includes(v.scope.id))
    ?? s.versions.find((v) => v.scope.kind === "org")
    ?? DN_ALL_ON;
  const cut = (mine, theirs) => (Array.isArray(theirs) ? (Array.isArray(mine) ? mine.filter((x) => theirs.includes(x)) : theirs.slice()) : mine);
  return { ...pick, worlds: cut(pick.worlds, enterprise?.worlds), programmes: cut(pick.programmes, enterprise?.programmes) };
}

/** Whether a world is on in a version. */
export function dnWorldOn(world, version = dnVersion()) { return !Array.isArray(version.worlds) || version.worlds.includes(world); }

/** Whether a learner may pick this path: a locked version allows only its locked path (or its path list). */
export function dnCanSwitchPath(pathId, version = dnVersion()) {
  if (!DN_PATHS.includes(pathId)) return false;
  if (Array.isArray(version.paths) && !version.paths.includes(pathId)) return false;
  if (version.locked) return version.lockedPath ? pathId === version.lockedPath : Array.isArray(version.paths) && version.paths.includes(pathId);
  return true;
}

/**
 * What a version hides: `{ worlds: Set, packs: Set, stations: Set }`. A station is hidden when
 * every pack carrying it is off (a station in no pack follows the programmes list), so turning
 * one pack off never hides a station another pack still teaches.
 */
export function dnHidden(version = dnVersion(), packs = dnPacks()) {
  const worlds = new Set(DN_WORLDS.filter((w) => !dnWorldOn(w, version)));
  const packOn = (p) => !Array.isArray(version.packs) || version.packs.includes(p.id);
  const progOn = (id) => !Array.isArray(version.programmes) || version.programmes.includes(id);
  const hiddenPacks = new Set(packs.filter((p) => !packOn(p) || (p.programmes?.length && !p.programmes.some(progOn))).map((p) => p.id));
  const carriers = new Map();
  for (const p of packs) for (const st of p.stations ?? []) { if (!carriers.has(st)) carriers.set(st, []); carriers.get(st).push(p.id); }
  const stations = new Set([...carriers].filter(([, ids]) => ids.every((id) => hiddenPacks.has(id))).map(([st]) => st));
  return { worlds, packs: hiddenPacks, stations };
}

// ---------------------------------------------------------------- modules

/** A module, cleaned (docs/modules.md). Lessons keep their order; duplicates are dropped. */
export function dnCleanModule(raw) {
  const r = raw && typeof raw === "object" ? raw : {};
  const seen = new Set();
  const lessons = (Array.isArray(r.lessons) ? r.lessons : []).map((l) => ({
    kind: DN_LESSON_KINDS.includes(l?.kind) ? l.kind : "station", id: dnText(l?.id, 120), world: dnText(l?.world, 40) || null,
  })).filter((l) => l.id && !seen.has(`${l.kind}:${l.id}`) && seen.add(`${l.kind}:${l.id}`));
  const due = /^\d{4}-\d{2}-\d{2}$/.test(r.due ?? "") ? r.due : null;
  const score = Number(r.requiredScore);
  return {
    v: DN_SCHEMA_VERSION, kind: "module", id: /^mod-[a-z0-9-]{1,40}$/.test(r.id) ? r.id : dnId("mod"),
    title: dnText(r.title, 100) || "Untitled module", lessons, due,
    requiredScore: Number.isFinite(score) ? Math.max(0, Math.min(100, Math.round(score))) : 80,
    assign: (Array.isArray(r.assign) ? r.assign : []).map((a) => ({ classCode: dnCode(a?.classCode), at: typeof a?.at === "string" ? a.at : new Date().toISOString() }))
      .filter((a) => /^[A-Z0-9]{4}-[A-Z0-9]{4}$/.test(a.classCode)),
    createdAt: typeof r.createdAt === "string" ? r.createdAt : new Date().toISOString(),
  };
}

export function dnModules() { return dnLoad().modules.slice(); }
export function dnModule(id) { return dnLoad().modules.find((m) => m.id === id) ?? null; }
export function dnSaveModule(raw) { const s = dnLoad(); const m = dnCleanModule(raw); s.modules = [...s.modules.filter((x) => x.id !== m.id), m]; dnSave(s); return m; }
export function dnDeleteModule(id) { const s = dnLoad(); s.modules = s.modules.filter((m) => m.id !== id); dnSave(s); }
/** Assign a module to a class code (a cohort's invite code); idempotent. */
export function dnAssign(moduleId, classCode) {
  const m = dnModule(moduleId); const code = dnCode(classCode);
  if (!m || !/^[A-Z0-9]{4}-[A-Z0-9]{4}$/.test(code)) return null;
  if (m.assign.some((a) => a.classCode === code)) return m;
  return dnSaveModule({ ...m, assign: [...m.assign, { classCode: code, at: new Date().toISOString() }] });
}
export function dnUnassign(moduleId, classCode) { const m = dnModule(moduleId); return m ? dnSaveModule({ ...m, assign: m.assign.filter((a) => a.classCode !== dnCode(classCode)) }) : null; }

/**
 * What is wrong with a module or version file (an empty list when it is sound).
 * `index` (dn-index.js's dnLessonIndex) resolves every lesson id when given.
 */
export function dnValidateDoc(doc, index = null) {
  const bad = [];
  if (!doc || typeof doc !== "object") return ["not a JSON object"];
  if (doc.v !== DN_SCHEMA_VERSION) bad.push(`v must be ${DN_SCHEMA_VERSION}`);
  if (doc.kind === "module") {
    if (!/^mod-[a-z0-9-]{1,40}$/.test(doc.id ?? "")) bad.push("id must look like mod-…");
    if (!Array.isArray(doc.lessons) || !doc.lessons.length) bad.push("lessons must be a non-empty list");
    for (const l of doc.lessons ?? []) {
      if (!DN_LESSON_KINDS.includes(l?.kind)) bad.push(`lesson ${l?.id}: kind must be one of ${DN_LESSON_KINDS.join(", ")}`);
      else if (index && !index.resolve(l)) bad.push(`lesson ${l.kind}:${l.id} does not resolve`);
    }
    if (doc.due != null && !/^\d{4}-\d{2}-\d{2}$/.test(doc.due)) bad.push("due must be YYYY-MM-DD or null");
    if (!(Number(doc.requiredScore) >= 0 && Number(doc.requiredScore) <= 100)) bad.push("requiredScore must be 0..100");
  } else if (doc.kind === "version") {
    if (doc.worlds != null && (!Array.isArray(doc.worlds) || doc.worlds.some((w) => !DN_WORLDS.includes(w)))) bad.push("worlds must be null or known world ids");
    if (doc.paths != null && (!Array.isArray(doc.paths) || doc.paths.some((p) => !DN_PATHS.includes(p)))) bad.push("paths must be null or path ids");
    if (doc.lockedPath != null && !DN_PATHS.includes(doc.lockedPath)) bad.push("lockedPath must be a path id");
  } else if (doc.kind === "dean-bundle") {
    for (const m of doc.modules ?? []) bad.push(...dnValidateDoc(m, index).map((x) => `module ${m?.id}: ${x}`));
    for (const v of doc.versions ?? []) bad.push(...dnValidateDoc(v, index).map((x) => `version ${v?.id}: ${x}`));
  } else bad.push("kind must be module, version or dean-bundle");
  return bad;
}

/** The file for one module or version (by id), or every one as a bundle: plain JSON, pretty. */
export function dnExport(id = null) {
  const s = dnLoad();
  const doc = id ? (s.modules.find((m) => m.id === id) ?? s.versions.find((v) => v.id === id) ?? null)
    : { v: DN_SCHEMA_VERSION, kind: "dean-bundle", exportedAt: new Date().toISOString(), versions: s.versions, modules: s.modules };
  return doc ? JSON.stringify(doc, null, 2) : null;
}

/** Read a file's text: `{ ok, errors, modules, versions }`; merges by id. */
export function dnImport(text, index = null) {
  let doc;
  try { doc = typeof text === "string" ? JSON.parse(text) : text; } catch (_) { return { ok: false, errors: ["not valid JSON"], modules: 0, versions: 0 }; }
  const errors = dnValidateDoc(doc, index);
  if (errors.length) return { ok: false, errors, modules: 0, versions: 0 };
  const mods = doc.kind === "module" ? [doc] : doc.kind === "dean-bundle" ? doc.modules ?? [] : [];
  const vers = doc.kind === "version" ? [doc] : doc.kind === "dean-bundle" ? doc.versions ?? [] : [];
  const s = dnLoad();
  for (const m of mods.map(dnCleanModule)) s.modules = [...s.modules.filter((x) => x.id !== m.id), m];
  for (const v of vers.map(dnCleanVersion)) s.versions = [...s.versions.filter((x) => x.id !== v.id), v];
  dnSave(s);
  return { ok: true, errors: [], modules: mods.length, versions: vers.length };
}

// ------------------------------------------------------------------ apply

/** The modules assigned to a class joined on this device (or to the given codes). */
export function dnAssignedModules(classCodes = dnMyClassCodes()) {
  const codes = classCodes.map(dnCode);
  return dnModules().filter((m) => m.assign.some((a) => codes.includes(a.classCode)));
}

/**
 * What a world does at load: whether it is on, the modules assigned here, what glows (station
 * ids, lesson ids, and the sites of `sites` — `[{ id, stations }]` — that carry a glowing
 * station) and what the version hides.
 */
export function dnApplyModule(world, { sites = [], classCodes = null } = {}) {
  const codes = classCodes ?? dnMyClassCodes();
  const version = dnVersion({ classCodes: codes });
  const hidden = dnHidden(version);
  const modules = dnAssignedModules(codes);
  const refs = modules.flatMap((m) => m.lessons);
  const stations = new Set(refs.filter((l) => l.kind === "station" && !hidden.stations.has(l.id)).map((l) => l.id));
  const lessons = new Set(refs.filter((l) => l.kind !== "station" && (!l.world || l.world === world)).map((l) => l.id));
  const glowSites = new Set(sites.filter((s) => (s.stations ?? []).some((id) => stations.has(id))).map((s) => s.id));
  return { world, allowed: dnWorldOn(world, version), version, modules, glow: { stations, lessons, sites: glowSites }, hidden };
}

// --------------------------------------------------------------- progress

/**
 * Progress on a module per learner of a class: org.js's consented snapshots (the cohort whose
 * invite code is the class code) for stations, SCHOLAR's sessions (when registered) for field
 * and parish lessons. `{ module, classCode, rows: [{ name, shared, cells: [null | { done, score }], done, total, score, meets }] }`.
 */
export function dnProgress(moduleId, classCode) {
  const m = dnModule(moduleId); const code = dnCode(classCode);
  if (!m) return null;
  const s = enLoad();
  const cohort = s.cohorts.find((c) => c.code === code);
  let sessions = [];
  try { sessions = dnHooks.sessions?.() ?? []; } catch (_) { sessions = []; }
  const learners = cohort ? s.members.filter((x) => x.cohortId === cohort.id && x.role === "learner") : [];
  const rows = learners.map((mem) => {
    const by = new Map((mem.progress?.stations ?? []).map((st) => [st.simId, st]));
    const cells = m.lessons.map((l) => {
      if (l.kind === "station") {
        const st = mem.consent?.progress ? by.get(l.id) : null;
        return st ? { done: !!st.passed, score: Math.round(((st.stars ?? 0) / 3) * 100) } : null;
      }
      const sess = sessions.filter((x) => x?.lessonId === l.id && (x.classCode == null || dnCode(x.classCode) === code) && (x.learner === mem.name || x.learner === mem.id));
      if (!sess.length) return null;
      const best = Math.max(...sess.map((x) => Number(x.score ?? ((x.stars ?? 0) / 3) * 100) || 0));
      return { done: true, score: Math.round(best) };
    });
    const done = cells.filter((c) => c?.done).length;
    const scored = cells.filter(Boolean);
    const score = scored.length ? Math.round(scored.reduce((a, c) => a + c.score, 0) / m.lessons.length) : 0;
    return { name: mem.name, shared: !!mem.consent?.progress, cells, done, total: m.lessons.length, score, meets: done === m.lessons.length && score >= m.requiredScore };
  });
  return { module: m, classCode: code, cohort: cohort ? { id: cohort.id, name: cohort.name } : null, rows };
}
