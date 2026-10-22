// The organisation layer (console ENTERPRISE, docs/enterprise.md): the
// platform trains individuals; an enterprise trains cohorts.
//
// One local-first store, `vr-org-v1`, read and written through profiles.js's
// gtStorage() so it is private to the signed-in profile (or to "This device",
// or to the demo tab) exactly like the records and the passport. It holds:
//
//   organisations  name, a wordmark-free colour, the programmes it runs
//   cohorts        name, programme, edition, start date, seats, invite code
//   members        a display name the person typed, a role (learner,
//                  instructor, coordinator), the cohort joined by invite code,
//                  and a progress-sharing consent that is OFF until the person
//                  turns it on. Only with that consent does a data-minimised
//                  progress snapshot (per station: best stars, unsafe actions,
//                  interruptions handled, attempts, last date — no free text,
//                  no identity) sit on the member, and only that snapshot is
//                  ever exported with a cohort.
//   audit          a per-device log of coordinator actions (exports, imports,
//                  role changes, cohort creation), shown in the console.
//
// Privacy is the hard rule: this module makes no network request, never reads
// the sign-in session's raw id, and the member id is a random local handle —
// never an e-mail address, wallet address or provider subject. Moving a cohort
// between devices is an explicit export the coordinator downloads and imports.
//
// The bundler concatenates every module into one scope and erases import
// aliases, so every top-level name here starts with `en`/`EN_`.

import { gtStorage } from "./profiles.js";
import { TrainingRecords, isoDuration } from "./records.js";
import { PP_PROGRAMMES } from "./passport-programmes.js";

export const EN_KEY = "vr-org-v1";
export const EN_SCHEMA_VERSION = 1;
export const EN_ROLES = ["learner", "instructor", "coordinator"];
/** The invite-code alphabet: no 0/O, 1/I/L so a code read aloud survives. */
const EN_CODE_CHARS = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
const EN_MAX_AUDIT = 500;
/** Platform defaults for "needs attention", named as defaults and never as a rule. */
export const EN_ATTENTION = { stuckAttempts: 3, inactiveDays: 14 };

// ------------------------------------------------------------------ store

function enStore() { try { return gtStorage(); } catch (_) { return null; } }

function enText(v, max = 80) {
  return String(v ?? "").replace(/[\u0000-\u001f\u007f<>]/g, "").trim().slice(0, max);
}

function enId(prefix) {
  const bytes = new Uint8Array(6);
  try { globalThis.crypto.getRandomValues(bytes); } catch (_) { for (let i = 0; i < 6; i += 1) bytes[i] = Math.floor(Math.random() * 256); }
  return `${prefix}-${[...bytes].map((b) => b.toString(16).padStart(2, "0")).join("")}`;
}

/** An empty store. */
export function enEmpty() { return { v: EN_SCHEMA_VERSION, orgs: [], cohorts: [], members: [], audit: [] }; }

/** The store as it stands (never throws; a damaged value reads as empty). */
export function enLoad() {
  try {
    const raw = JSON.parse(enStore()?.getItem(EN_KEY) || "null");
    if (!raw || raw.v !== EN_SCHEMA_VERSION) return enEmpty();
    return {
      v: EN_SCHEMA_VERSION,
      orgs: Array.isArray(raw.orgs) ? raw.orgs : [],
      cohorts: Array.isArray(raw.cohorts) ? raw.cohorts : [],
      members: Array.isArray(raw.members) ? raw.members : [],
      audit: Array.isArray(raw.audit) ? raw.audit : [],
    };
  } catch (_) { return enEmpty(); }
}

function enSave(state) {
  try { enStore()?.setItem(EN_KEY, JSON.stringify(state)); return true; } catch (_) { return false; }
}

function enEmit(kind) {
  try { globalThis.dispatchEvent?.(new CustomEvent("en:change", { detail: { kind } })); } catch (_) { /* headless */ }
}

/** Forget every organisation, cohort, member and audit line of this profile. */
export function enClear() { try { enStore()?.removeItem(EN_KEY); } catch (_) { /* ignore */ } enEmit("clear"); }

// ------------------------------------------------------------------ audit

/** Append one coordinator action to this device's audit log. */
export function enAudit(action, detail = "", state = null) {
  const own = !state;
  const s = state ?? enLoad();
  s.audit.push({ at: new Date().toISOString(), action: enText(action, 40), detail: enText(detail, 200) });
  if (s.audit.length > EN_MAX_AUDIT) s.audit.splice(0, s.audit.length - EN_MAX_AUDIT);
  if (own) { enSave(s); enEmit("audit"); }
  return s.audit[s.audit.length - 1];
}

/** The audit log, newest first. */
export function enAuditList() { return enLoad().audit.slice().reverse(); }

// ------------------------------------------------------------ organisation

/** A colour as `#rrggbb`, or the platform's neutral slate. */
export function enColour(v) {
  const s = String(v ?? "").trim();
  return /^#[0-9a-fA-F]{6}$/.test(s) ? s.toLowerCase() : "#4fd1ff";
}

/** Create an organisation. `programmes` are filtered to the passport's catalogue. */
export function enCreateOrg({ name, colour = null, programmes = [] } = {}) {
  const n = enText(name);
  if (!n) return null;
  const s = enLoad();
  const org = {
    id: enId("org"), name: n, colour: enColour(colour),
    programmes: [...new Set((programmes ?? []).filter((p) => PP_PROGRAMMES[p]))],
    createdAt: new Date().toISOString(),
  };
  s.orgs.push(org);
  enAudit("org-create", org.name, s);
  enSave(s); enEmit("org");
  return org;
}

export function enOrgs() { return enLoad().orgs.slice(); }
export function enOrg(id) { return enLoad().orgs.find((o) => o.id === id) ?? null; }

// ----------------------------------------------------------------- cohorts

/** A fresh invite code, `XXXX-XXXX`, unique within this store. */
export function enInviteCode(state = enLoad()) {
  const used = new Set(state.cohorts.map((c) => c.code));
  for (let tries = 0; tries < 50; tries += 1) {
    const bytes = new Uint8Array(8);
    try { globalThis.crypto.getRandomValues(bytes); } catch (_) { for (let i = 0; i < 8; i += 1) bytes[i] = Math.floor(Math.random() * 256); }
    const chars = [...bytes].map((b) => EN_CODE_CHARS[b % EN_CODE_CHARS.length]).join("");
    const code = `${chars.slice(0, 4)}-${chars.slice(4)}`;
    if (!used.has(code)) return code;
  }
  return null;
}

/** Normalise what a learner typed: upper-case, the one hyphen, no spaces. */
export function enNormaliseCode(v) {
  const s = String(v ?? "").toUpperCase().replace(/[^A-Z2-9]/g, "");
  return s.length === 8 ? `${s.slice(0, 4)}-${s.slice(4)}` : null;
}

/** A date as `YYYY-MM-DD`, or null. */
export function enDate(v) {
  const s = String(v ?? "").trim().slice(0, 10);
  return /^\d{4}-\d{2}-\d{2}$/.test(s) && !Number.isNaN(new Date(s).getTime()) ? s : null;
}

/** Create a cohort in an organisation for one programme edition. */
export function enCreateCohort({ orgId, name, programme, edition = "", startDate = null, seats = 20 } = {}) {
  const s = enLoad();
  const org = s.orgs.find((o) => o.id === orgId);
  const n = enText(name);
  if (!org || !n || !PP_PROGRAMMES[programme]) return null;
  const cohort = {
    id: enId("cohort"), orgId: org.id, name: n, programme, edition: enText(edition, 40),
    startDate: enDate(startDate) ?? new Date().toISOString().slice(0, 10),
    seats: Math.min(1000, Math.max(1, Number(seats) | 0 || 20)),
    code: enInviteCode(s), createdAt: new Date().toISOString(),
  };
  s.cohorts.push(cohort);
  enAudit("cohort-create", `${cohort.name} (${cohort.programme}) code ${cohort.code}`, s);
  enSave(s); enEmit("cohort");
  return cohort;
}

/**
 * Set a cohort's seat count (a coordinator action, audited). Seat billing
 * (payments.js, docs/payments.md) calls this when a paid receipt lands, so
 * the seats an organisation licensed become the seats learners can take.
 */
export function enSetCohortSeats(cohortId, seats, reason = "") {
  const s = enLoad();
  const c = s.cohorts.find((x) => x.id === cohortId);
  const n = Math.min(1000, Math.max(1, Number(seats) | 0 || 1));
  if (!c || c.seats === n) return false;
  const before = c.seats; c.seats = n;
  enAudit("cohort-seats", `${c.name}: ${before} → ${n} seats${reason ? ` (${enText(reason, 120)})` : ""}`, s);
  enSave(s); enEmit("cohort");
  return true;
}

export function enCohorts(orgId = null) { return enLoad().cohorts.filter((c) => !orgId || c.orgId === orgId); }
export function enCohort(id) { return enLoad().cohorts.find((c) => c.id === id) ?? null; }
export function enMembers(cohortId) { return enLoad().members.filter((m) => m.cohortId === cohortId); }

// ----------------------------------------------------------------- members

/**
 * Join a cohort by invite code. `local: true` marks the member as the person
 * training on THIS device, whose snapshot can be refreshed from the records
 * here (only with consent). Returns `{ ok, member, cohort, reason }`.
 */
export function enJoin(code, { name, role = "learner", local = false, consent = false } = {}) {
  const c = enNormaliseCode(code);
  if (!c) return { ok: false, reason: "That is not an invite code (eight letters and digits)." };
  const s = enLoad();
  const cohort = s.cohorts.find((k) => k.code === c);
  if (!cohort) return { ok: false, reason: "No cohort on this device carries that invite code." };
  const n = enText(name, 40);
  if (!n) return { ok: false, reason: "A display name is needed — initials are fine." };
  const taken = s.members.filter((m) => m.cohortId === cohort.id && m.role === "learner").length;
  if (role === "learner" && taken >= cohort.seats) return { ok: false, reason: "This cohort has no seat left." };
  const member = {
    id: enId("m"), cohortId: cohort.id, name: n, role: EN_ROLES.includes(role) ? role : "learner",
    joinedAt: new Date().toISOString(), local: !!local, consent: { progress: !!consent }, progress: null,
  };
  s.members.push(member);
  // Audited on the device where the join happens — the learner's own when they
  // join from the sign-in dialog, the coordinator's when they add someone.
  enAudit("member-join", `${member.name} joined ${cohort.name} as ${member.role}${local ? " (this device)" : ""}`, s);
  enSave(s); enEmit("member");
  return { ok: true, member, cohort };
}

/**
 * The learner's own side (the sign-in dialog, the homepage's continue strip):
 * every cohort the person on THIS device has joined, with the programme ladder
 * computed from this device's records. It is shown to the learner only and is
 * never stored, so it does not involve the sharing consent — that governs what
 * the coordinator may see, not what a person sees of their own training.
 */
export function enMyCohorts(records = null) {
  const s = enLoad();
  const out = [];
  for (const m of s.members) {
    if (!m.local) continue;
    const cohort = s.cohorts.find((c) => c.id === m.cohortId);
    if (!cohort) continue;
    const org = s.orgs.find((o) => o.id === cohort.orgId) ?? null;
    const prog = PP_PROGRAMMES[cohort.programme];
    const stations = prog?.stations ?? [];
    const snap = enSnapshot(records ?? (() => { try { return TrainingRecords.list(); } catch (_) { return []; } })(), cohort.programme);
    const by = new Map((snap?.stations ?? []).map((st) => [st.simId, st]));
    const ladder = stations.map((id) => { const st = by.get(id); return { simId: id, state: st ? (st.passed ? "passed" : "tried") : "todo", stars: st?.stars ?? 0, attempts: st?.attempts ?? 0 }; });
    out.push({
      member: { id: m.id, name: m.name, role: m.role, sharing: !!m.consent?.progress },
      cohort: { id: cohort.id, name: cohort.name, edition: cohort.edition, startDate: cohort.startDate },
      org: org ? { id: org.id, name: org.name, colour: org.colour } : null,
      programme: { id: cohort.programme, name: prog?.name ?? cohort.programme, stations },
      ladder, passed: ladder.filter((c) => c.state === "passed").length, total: stations.length,
    });
  }
  return out;
}

/** Change a member's role (a coordinator action, audited). */
export function enSetRole(memberId, role) {
  if (!EN_ROLES.includes(role)) return false;
  const s = enLoad();
  const m = s.members.find((x) => x.id === memberId);
  if (!m || m.role === role) return false;
  const before = m.role; m.role = role;
  enAudit("role-change", `${m.name}: ${before} → ${role}`, s);
  enSave(s); enEmit("member");
  return true;
}

/** Turn progress sharing on or off for a member; off also drops the snapshot. */
export function enSetConsent(memberId, on) {
  const s = enLoad();
  const m = s.members.find((x) => x.id === memberId);
  if (!m) return false;
  m.consent = { progress: !!on, at: new Date().toISOString() };
  if (!on) m.progress = null;
  enSave(s); enEmit("member");
  return true;
}

/** Remove a member (audited). */
export function enRemoveMember(memberId) {
  const s = enLoad();
  const i = s.members.findIndex((x) => x.id === memberId);
  if (i < 0) return false;
  enAudit("member-remove", s.members[i].name, s);
  s.members.splice(i, 1);
  enSave(s); enEmit("member");
  return true;
}

// ---------------------------------------------------------------- progress

/**
 * The data-minimised snapshot of a record list for one programme: per
 * station, attempts, best stars, unsafe actions on the best run, interruptions
 * handled (answered) and missed, a pass flag and the last attempt's date.
 * Nothing else from the record — no crew tag, no id, no debrief text.
 */
export function enSnapshot(records, programmeId, at = new Date().toISOString()) {
  const prog = PP_PROGRAMMES[programmeId];
  if (!prog) return null;
  const ids = new Set(prog.stations);
  const by = new Map();
  for (const r of records ?? []) {
    if (!ids.has(r?.simId)) continue;
    const cur = by.get(r.simId) ?? { simId: r.simId, attempts: 0, stars: 0, unsafe: 0, handled: 0, missed: 0, passed: false, lastAt: null };
    cur.attempts += 1;
    const stars = r.stars | 0;
    if (stars > cur.stars || (stars === cur.stars && (r.hazardHits | 0) < cur.unsafe)) { cur.stars = stars; cur.unsafe = r.hazardHits | 0; }
    cur.handled += r.interrupts?.answered | 0;
    cur.missed += (r.interrupts?.missed | 0) + (r.interrupts?.wrong | 0);
    cur.passed = cur.passed || !!r.passed;
    if (!cur.lastAt || String(r.at) > cur.lastAt) cur.lastAt = String(r.at ?? "");
    by.set(r.simId, cur);
  }
  return { at, programme: programmeId, stations: [...by.values()] };
}

/**
 * Refresh the snapshot of every local member who consented, from the records
 * on this device (records.js). Returns how many were refreshed.
 */
export function enRefreshLocal(records = null) {
  const s = enLoad();
  let n = 0;
  for (const m of s.members) {
    if (!m.local || !m.consent?.progress) continue;
    const cohort = s.cohorts.find((c) => c.id === m.cohortId);
    if (!cohort) continue;
    m.progress = enSnapshot(records ?? TrainingRecords.list(), cohort.programme);
    n += 1;
  }
  if (n) enSave(s);
  return n;
}

/**
 * The cohort view's model: the programme ladder as a grid — one row per
 * learner, one column per station — with `{ stars, unsafe, handled, missed,
 * attempts, passed }` in each cell (null when no attempt, or when the learner
 * has not consented to share), plus per-learner totals.
 */
export function enCohortProgress(cohortId) {
  const s = enLoad();
  const cohort = s.cohorts.find((c) => c.id === cohortId);
  if (!cohort) return null;
  const prog = PP_PROGRAMMES[cohort.programme];
  const stations = prog?.stations ?? [];
  const learners = s.members.filter((m) => m.cohortId === cohort.id && m.role === "learner");
  const rows = learners.map((m) => {
    const by = new Map((m.progress?.stations ?? []).map((st) => [st.simId, st]));
    const cells = stations.map((id) => {
      const st = by.get(id);
      return st ? { stars: st.stars, unsafe: st.unsafe, handled: st.handled, missed: st.missed, attempts: st.attempts, passed: st.passed } : null;
    });
    const passed = cells.filter((c) => c?.passed).length;
    const stars = cells.reduce((a, c) => a + (c?.stars ?? 0), 0);
    const lastAt = (m.progress?.stations ?? []).map((st) => st.lastAt).filter(Boolean).sort().pop() ?? null;
    return { memberId: m.id, name: m.name, shared: !!m.consent?.progress, cells, passed, total: stations.length, stars, lastAt };
  });
  return { cohort, programme: { id: cohort.programme, name: prog?.name ?? cohort.programme, stations }, rows };
}

/**
 * Learners who need attention, with the platform-default thresholds named:
 * stuck (≥ `stuckAttempts` attempts at a station without a pass), inactive
 * (no attempt in `inactiveDays`, counted from the cohort's start date when
 * there is none), and not sharing (no consent, so nothing can be seen).
 */
export function enNeedsAttention(cohortId, { now = Date.now(), stuckAttempts = EN_ATTENTION.stuckAttempts, inactiveDays = EN_ATTENTION.inactiveDays } = {}) {
  const view = enCohortProgress(cohortId);
  if (!view) return [];
  const out = [];
  for (const row of view.rows) {
    if (!row.shared) { out.push({ memberId: row.memberId, name: row.name, kind: "not-sharing", note: "has not turned on progress sharing, so nothing can be seen here" }); continue; }
    row.cells.forEach((c, i) => {
      if (c && !c.passed && c.attempts >= stuckAttempts) out.push({ memberId: row.memberId, name: row.name, kind: "stuck", station: view.programme.stations[i], note: `${c.attempts} attempts at ${view.programme.stations[i]} without a pass` });
    });
    const since = row.lastAt ? new Date(row.lastAt).getTime() : new Date(view.cohort.startDate).getTime();
    const days = Math.floor((now - since) / 86400000);
    if (row.passed < row.total && Number.isFinite(days) && days >= inactiveDays) out.push({ memberId: row.memberId, name: row.name, kind: "inactive", note: row.lastAt ? `no attempt in ${days} days` : `no attempt since the cohort started ${days} days ago` });
  }
  return out;
}

// ----------------------------------------------------------------- exports

function enCsvCell(v) {
  if (v == null) return "";
  const s = String(v);
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export const EN_CSV_COLUMNS = ["cohort", "programme", "learner", "station", "attempts", "bestStars", "unsafeActions", "interruptsHandled", "interruptsMissed", "passed", "lastAt"];

/** One RFC 4180 row per learner per attempted station; learners who did not share contribute nothing. */
export function enCohortCSV(cohortId) {
  const view = enCohortProgress(cohortId);
  if (!view) return "";
  const lines = [EN_CSV_COLUMNS.join(",")];
  for (const row of view.rows) {
    if (!row.shared) continue;
    row.cells.forEach((c, i) => {
      if (!c) return;
      const st = view.programme.stations[i];
      lines.push([view.cohort.name, view.programme.id, row.name, st, c.attempts, c.stars, c.unsafe, c.handled, c.missed, c.passed, row.lastAt ?? ""].map(enCsvCell).join(","));
    });
  }
  return lines.join("\r\n") + "\r\n";
}

/**
 * xAPI 1.0.3 statements per learner per attempted station (the best run), in
 * the same verb, activity and extension vocabulary records.js's toXAPI uses.
 * The actor account is the local member handle under the cohort's activity
 * id — never an e-mail address or wallet address.
 */
export function enCohortXAPI(cohortId, { homePage = "https://smartciti.example" } = {}) {
  const view = enCohortProgress(cohortId);
  if (!view) return { statements: [] };
  const ext = (k) => `${homePage}/xapi/ext/${k}`;
  const statements = [];
  for (const row of view.rows) {
    if (!row.shared) continue;
    row.cells.forEach((c, i) => {
      if (!c) return;
      const st = view.programme.stations[i];
      const m = enLoad().members.find((x) => x.id === row.memberId);
      statements.push({
        id: `${view.cohort.id}:${row.memberId}:${st}`,
        timestamp: (m?.progress?.stations ?? []).find((x) => x.simId === st)?.lastAt || new Date().toISOString(),
        actor: { objectType: "Agent", name: row.name, account: { homePage: `${homePage}/cohorts/${view.cohort.id}`, name: row.memberId } },
        verb: { id: c.passed ? "http://adlnet.gov/expapi/verbs/passed" : "http://adlnet.gov/expapi/verbs/failed", display: { "en-US": c.passed ? "passed" : "failed" } },
        object: { objectType: "Activity", id: `${homePage}/smartcity/${st}`, definition: { name: { "en-US": st }, type: "http://adlnet.gov/expapi/activities/simulation" } },
        result: { success: !!c.passed, completion: true, extensions: { [ext("stars")]: c.stars, [ext("unsafe-actions")]: c.unsafe, [ext("interrupts-caught")]: c.handled, [ext("interrupts-missed")]: c.missed, [ext("attempts")]: c.attempts } },
        context: {
          platform: "SmartCiti.X ~Holodeck · cohort view",
          contextActivities: { grouping: [{ objectType: "Activity", id: `${homePage}/programmes/${view.programme.id}`, definition: { name: { "en-US": view.programme.name } } }] },
          extensions: { [ext("cohort")]: view.cohort.name, [ext("programme")]: view.programme.id },
        },
      });
    });
  }
  return { statements };
}

// ----------------------------------------------------- move between devices

/**
 * A cohort as one JSON document a coordinator can carry to another device:
 * the organisation, the cohort and its members — a member's snapshot only
 * when they consented. Audited. Never the audit log itself, never the
 * sign-in session.
 */
export function enExportCohort(cohortId) {
  const s = enLoad();
  const cohort = s.cohorts.find((c) => c.id === cohortId);
  if (!cohort) return null;
  const org = s.orgs.find((o) => o.id === cohort.orgId) ?? null;
  const members = s.members.filter((m) => m.cohortId === cohort.id).map((m) => ({
    id: m.id, name: m.name, role: m.role, joinedAt: m.joinedAt, consent: { progress: !!m.consent?.progress },
    progress: m.consent?.progress ? m.progress ?? null : null,
  }));
  enAudit("cohort-export", `${cohort.name}: ${members.length} members, ${members.filter((m) => m.progress).length} with shared progress`, s);
  enSave(s); enEmit("audit");
  return { v: EN_SCHEMA_VERSION, kind: "cohort", exportedAt: new Date().toISOString(), org, cohort, members };
}

/** Is this a cohort document this module wrote (or one shaped like it)? */
export function enValidateCohortDoc(doc) {
  const errors = [];
  if (!doc || typeof doc !== "object") return ["not an object"];
  if (doc.v !== EN_SCHEMA_VERSION) errors.push(`v must be ${EN_SCHEMA_VERSION}`);
  if (doc.kind !== "cohort") errors.push('kind must be "cohort"');
  if (!doc.org?.id || !enText(doc.org?.name)) errors.push("org needs an id and a name");
  const c = doc.cohort;
  if (!c?.id || !enText(c?.name) || !PP_PROGRAMMES[c?.programme] || !enNormaliseCode(c?.code)) errors.push("cohort needs id, name, a known programme and an invite code");
  if (!Array.isArray(doc.members)) errors.push("members must be a list");
  else doc.members.forEach((m, i) => { if (!m?.id || !enText(m?.name) || !EN_ROLES.includes(m?.role)) errors.push(`member ${i} needs id, name and a role`); });
  return errors;
}

/**
 * Import a cohort document: organisations, cohorts and members merge by id
 * (a member already here keeps its own consent and snapshot unless the
 * imported one is newer). Returns `{ ok, errors, added: { orgs, cohorts, members } }`.
 */
export function enImportCohort(doc) {
  const errors = enValidateCohortDoc(doc);
  if (errors.length) return { ok: false, errors, added: { orgs: 0, cohorts: 0, members: 0 } };
  const s = enLoad();
  const added = { orgs: 0, cohorts: 0, members: 0 };
  if (!s.orgs.some((o) => o.id === doc.org.id)) {
    s.orgs.push({ id: doc.org.id, name: enText(doc.org.name), colour: enColour(doc.org.colour), programmes: (doc.org.programmes ?? []).filter((p) => PP_PROGRAMMES[p]), createdAt: doc.org.createdAt ?? new Date().toISOString() });
    added.orgs += 1;
  }
  const c = doc.cohort;
  if (!s.cohorts.some((k) => k.id === c.id)) {
    s.cohorts.push({ id: c.id, orgId: doc.org.id, name: enText(c.name), programme: c.programme, edition: enText(c.edition, 40), startDate: enDate(c.startDate) ?? new Date().toISOString().slice(0, 10), seats: Math.min(1000, Math.max(1, Number(c.seats) | 0 || 20)), code: enNormaliseCode(c.code), createdAt: c.createdAt ?? new Date().toISOString() });
    added.cohorts += 1;
  }
  for (const m of doc.members) {
    const have = s.members.find((x) => x.id === m.id);
    const snap = m.consent?.progress && m.progress && Array.isArray(m.progress.stations) ? { at: m.progress.at ?? new Date().toISOString(), programme: c.programme, stations: m.progress.stations.map((st) => ({ simId: String(st.simId), attempts: st.attempts | 0, stars: st.stars | 0, unsafe: st.unsafe | 0, handled: st.handled | 0, missed: st.missed | 0, passed: !!st.passed, lastAt: st.lastAt ? String(st.lastAt) : null })) } : null;
    if (have) {
      if (snap && (!have.progress || String(snap.at) > String(have.progress.at))) { have.progress = snap; have.consent = { progress: true, at: snap.at }; }
      continue;
    }
    s.members.push({ id: m.id, cohortId: c.id, name: enText(m.name, 40), role: m.role, joinedAt: m.joinedAt ?? new Date().toISOString(), local: false, consent: { progress: !!m.consent?.progress }, progress: snap });
    added.members += 1;
  }
  enAudit("cohort-import", `${enText(c.name)}: +${added.orgs} org, +${added.cohorts} cohort, +${added.members} members`, s);
  enSave(s); enEmit("import");
  return { ok: true, errors: [], added };
}

// ------------------------------------------------------------- certificate

function enEsc(s) { return String(s ?? "").replace(/[&<>"']/g, (ch) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch])); }

/**
 * A printable completion certificate as a procedural SVG (A4 landscape in
 * millimetres): the organisation's name and the programme's, the learner's
 * display name, the cohort and edition, stations passed of total, stars, the
 * date — and "PROTOTYPE — NOT A CREDENTIAL" across it. No logo, no image, no
 * script. Returns null unless the learner has passed every station.
 */
export function enCertificateSVG({ org, cohort, programme, learner, passed, total, stars, date = new Date().toISOString().slice(0, 10), allowPartial = false } = {}) {
  if (!org || !programme || !learner) return null;
  if (!allowPartial && (!(total > 0) || passed < total)) return null;
  const colour = enColour(org.colour);
  const W = 297, H = 210;
  const line = (y) => `<line x1="20" y1="${y}" x2="${W - 20}" y2="${y}" stroke="${colour}" stroke-width="0.6"/>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}mm" height="${H}mm" viewBox="0 0 ${W} ${H}" role="img" aria-label="Completion certificate — prototype, not a credential">
<rect width="${W}" height="${H}" fill="#fbfbf7"/>
<rect x="8" y="8" width="${W - 16}" height="${H - 16}" fill="none" stroke="${colour}" stroke-width="1.4"/>
<rect x="11" y="11" width="${W - 22}" height="${H - 22}" fill="none" stroke="#1a2230" stroke-width="0.4"/>
<text x="${W / 2}" y="30" text-anchor="middle" font-family="Georgia, serif" font-size="7" letter-spacing="1.2" fill="#1a2230">${enEsc(org.name.toUpperCase())}</text>
${line(36)}
<text x="${W / 2}" y="58" text-anchor="middle" font-family="Georgia, serif" font-size="14" fill="#1a2230">Certificate of Completion</text>
<text x="${W / 2}" y="72" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="5.2" fill="#3a4656">This records that</text>
<text x="${W / 2}" y="90" text-anchor="middle" font-family="Georgia, serif" font-size="12" fill="${colour}">${enEsc(learner)}</text>
<text x="${W / 2}" y="103" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="5.2" fill="#3a4656">completed every station of the programme</text>
<text x="${W / 2}" y="116" text-anchor="middle" font-family="Georgia, serif" font-size="9" fill="#1a2230">${enEsc(programme.name ?? programme.id)}</text>
<text x="${W / 2}" y="128" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="4.6" fill="#3a4656">${enEsc(cohort?.name ?? "")}${cohort?.edition ? ` · ${enEsc(cohort.edition)}` : ""} · ${passed} of ${total} stations passed · ${stars} stars in total</text>
${line(140)}
<text x="30" y="152" font-family="Arial, Helvetica, sans-serif" font-size="4.2" fill="#3a4656">Date: ${enEsc(date)}</text>
<text x="${W - 30}" y="152" text-anchor="end" font-family="Arial, Helvetica, sans-serif" font-size="4.2" fill="#3a4656">SmartCiti.X ~Holodeck · procedure engine record</text>
<text x="30" y="160" font-family="Arial, Helvetica, sans-serif" font-size="3.6" fill="#5a6676">A pass is two or more stars with no unsafe action on the station's ordered procedure. This page evidences simulator practice; it is not a licence, a card or a certification.</text>
<g transform="translate(${W / 2} ${H / 2}) rotate(-18)" opacity="0.16"><text text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-weight="700" font-size="15" fill="#b0262e">PROTOTYPE — NOT A CREDENTIAL</text></g>
<text x="${W / 2}" y="${H - 16}" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-weight="700" font-size="4.4" fill="#b0262e">PROTOTYPE — NOT A CREDENTIAL</text>
</svg>`;
}

/** Whole seconds as an xAPI duration (re-exported for the console). */
export const enDuration = isoDuration;

// ------------------------------------------------------------- sample data

/**
 * A sample organisation with one cohort of four learners and synthetic
 * snapshots, clearly named as a sample, for the console's empty state, the
 * capture and the checker. Idempotent: a second call returns the existing one.
 */
export function enLoadSample({ programme = "fall-protection" } = {}) {
  const have = enLoad().cohorts.find((c) => c.name === "Sample cohort");
  if (have) return { org: enOrg(have.orgId), cohort: have, fresh: false };
  const org = enCreateOrg({ name: "Sample Organisation", colour: "#4fd1ff", programmes: [programme] });
  const cohort = enCreateCohort({ orgId: org.id, name: "Sample cohort", programme, edition: "2026 spring", startDate: "2026-03-02", seats: 12 });
  const stations = PP_PROGRAMMES[programme].stations;
  const people = [
    { name: "A. Learner", done: stations.length, stuck: null, daysAgo: 1 },
    { name: "B. Learner", done: Math.ceil(stations.length / 2), stuck: stations[Math.ceil(stations.length / 2)], daysAgo: 3 },
    { name: "C. Learner", done: 1, stuck: null, daysAgo: 30 },
    { name: "D. Learner", done: 0, stuck: null, daysAgo: null, consent: false },
  ];
  for (const p of people) {
    const res = enJoin(cohort.code, { name: p.name, consent: p.consent !== false });
    if (!res.ok) continue;
    const st = [];
    stations.slice(0, p.done).forEach((id, i) => st.push({ simId: id, attempts: 1 + (i % 2), stars: 3 - (i % 2), unsafe: 0, handled: 1 + (i % 2), missed: 0, passed: true, lastAt: new Date(Date.now() - (p.daysAgo + i) * 86400000).toISOString() }));
    if (p.stuck) st.push({ simId: p.stuck, attempts: 4, stars: 1, unsafe: 1, handled: 1, missed: 2, passed: false, lastAt: new Date(Date.now() - p.daysAgo * 86400000).toISOString() });
    const s2 = enLoad();
    const m = s2.members.find((x) => x.id === res.member.id);
    if (m && m.consent.progress) m.progress = { at: new Date().toISOString(), programme, stations: st };
    enSave(s2);
  }
  enAudit("sample-load", `${org.name} / ${cohort.name}`);
  return { org, cohort, fresh: true };
}
