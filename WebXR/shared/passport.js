// The learner passport — one read/write API over the stores every app on
// this platform already keeps, so a station finished from a Bay World job
// board shows on that board, in the Deep, on the home page's programme rail,
// in the instructor console and in the export.
//
// It is not a new silo. The attempt log stays records.js's
// (`vr-training-records-v1`), the launch identity stays identity.js's, each
// world's career ledger stays its own (`bayworld-career-v1`,
// `underwater-career-v1`; the regatta pays into Bay World's) and Fairway keeps
// `fairway-park-v1`. The passport reads all of them, never deletes any of
// them, and adds one small key of its own, `vr-passport-v1`, for the three
// things no existing store held: which world an award came from, which job
// board a pass marked done, and which returns a world has already been paid
// for (so a replayed "Back to <world>" can never pay twice).
//
// Every name here is prefixed `pp`/`PP_`: the bundler concatenates modules
// into one scope and erases import aliases (tools/bundle_webxr.py).

import { TrainingRecords, toCSV, toXAPI } from "./records.js";
import { Identity } from "./identity.js";
import { competencyStatus, COMPETENCIES } from "./competency.js";
import { PP_PROGRAMMES } from "./passport-programmes.js";

export const PP_KEY = "vr-passport-v1";
/** The stores a world keeps its own reputation and credits in (read, never written here). */
export const PP_NATIVE_STORES = { bayworld: "bayworld-career-v1", underwater: "underwater-career-v1" };
/** A source whose native awards land in another world's store: the regatta pays into Bay World's. */
export const PP_NATIVE_HOST = { regatta: "bayworld" };
/** Read for the Fairway rounds count; it keeps no currency of its own. */
export const PP_FAIRWAY_KEY = "fairway-park-v1";
/** The worlds (and rooms) that pay into the one ledger, in display order. */
export const PP_SOURCES = ["bayworld", "underwater", "regatta", "fairway", "trades", "holodeck", "smartcity"];
/** A world's display name — the "Back to <world>" label and the export's platform. */
export const PP_APP_NAMES = {
  bayworld: "Bay World", underwater: "the Deep", regatta: "the Bay Regatta", fairway: "Fairway Park",
  trades: "Trade Skills", holodeck: "the Holodeck", smartcity: "SmartCiti.X", atlas: "the Bay Atlas",
};
export const PP_EVENTS = ["station-passed", "programme-milestone", "award"];

const ppListeners = new Map();

function ppStore() { try { return globalThis.localStorage ?? null; } catch (_) { return null; } }

function ppReadJson(key, fallback) {
  try {
    const raw = ppStore()?.getItem(key);
    if (!raw) return fallback;
    const v = JSON.parse(raw);
    return v && typeof v === "object" ? v : fallback;
  } catch (_) { return fallback; }
}

function ppLoad() {
  const raw = ppReadJson(PP_KEY, null) ?? {};
  return {
    v: 1,
    awards: Array.isArray(raw.awards) ? raw.awards.filter((a) => a && a.id && a.source) : [],
    boards: raw.boards && typeof raw.boards === "object" ? raw.boards : {},
    returns: raw.returns && typeof raw.returns === "object" ? raw.returns : {},
  };
}

function ppSave(state) {
  try {
    if (state.awards.length > 2000) state.awards.splice(0, state.awards.length - 2000);
    ppStore()?.setItem(PP_KEY, JSON.stringify(state));
  } catch (_) { /* private mode — the run stays unsaved */ }
}

function ppEmit(event, detail) {
  for (const fn of ppListeners.get(event) ?? []) { try { fn(detail); } catch (_) { /* a listener never breaks a record */ } }
}

/** Subscribe to `station-passed`, `programme-milestone` or `award`. Returns the unsubscribe. */
export function ppOn(event, fn) {
  if (!PP_EVENTS.includes(event)) throw new Error(`unknown passport event: ${event}`);
  if (!ppListeners.has(event)) ppListeners.set(event, new Set());
  ppListeners.get(event).add(fn);
  return () => ppListeners.get(event)?.delete(fn);
}

/** Who is training: the launch identity (identity.js) when a host gave one, else the local crew tag. */
export function ppLearner() {
  let who = Identity.current;
  if (!who) { try { who = Identity.load(); } catch (_) { who = null; } }
  let tag = null;
  try { tag = ppStore()?.getItem("vr-training-profile-name") ?? null; } catch (_) { tag = null; }
  return {
    name: who?.name ?? tag ?? "YOU",
    id: who?.id ?? null,
    homePage: who?.homePage ?? null,
    source: who?.source ?? "local",
  };
}

/** Every attempt, oldest first (records.js is the one attempt log). */
export function ppRecords() { return TrainingRecords.list(); }

/** True when the station has a passing attempt anywhere on the platform. */
export function ppCompleted(stationId) { return ppRecords().some((r) => r.simId === stationId && r.passed); }

/** The programme catalogue the passport counts against (generated from SmartCiti.X's curricula). */
export function ppProgrammeIds() { return Object.keys(PP_PROGRAMMES); }

/**
 * `{ id, name, passed, total, stars, competencyStatus }` for one programme:
 * stations with a passing attempt, the station count, the best stars summed
 * over the programme's stations, and the competency layer's verdict
 * ("demonstrated"/"consistent"/"in progress") over the competencies built
 * from those stations — or null when no competency covers them.
 */
export function ppProgramme(programmeId, records = ppRecords()) {
  const prog = PP_PROGRAMMES[programmeId];
  if (!prog) return null;
  const ids = new Set(prog.stations);
  const best = new Map();
  const passedIds = new Set();
  for (const r of records) {
    if (!ids.has(r.simId)) continue;
    best.set(r.simId, Math.max(best.get(r.simId) ?? 0, r.stars | 0));
    if (r.passed) passedIds.add(r.simId);
  }
  let stars = 0;
  for (const v of best.values()) stars += v;
  const covering = COMPETENCIES.filter((c) => c.stations.some((s) => ids.has(s)));
  let status = null;
  if (covering.length) {
    const all = competencyStatus(records.filter((r) => ids.has(r.simId)));
    const states = covering.map((c) => all[c.id]?.status ?? "in progress");
    status = states.every((s) => s === "consistent") ? "consistent"
      : states.every((s) => s !== "in progress") ? "demonstrated"
      : states.some((s) => s !== "in progress") ? "partly demonstrated" : "in progress";
  }
  return { id: programmeId, name: prog.name, passed: passedIds.size, total: prog.stations.length, stars, competencyStatus: status };
}

function ppMilestone(before, after) {
  if (!after || after.passed === before?.passed) return null;
  const pct = after.total ? after.passed / after.total : 0;
  const prevPct = before?.total ? before.passed / before.total : 0;
  for (const mark of [1, 0.5, 0.25]) if (pct >= mark && prevPct < mark) return mark;
  return null;
}

/**
 * Write one finished attempt through records.js — the ONE record per attempt
 * — stamped with the learner, the app that ran it and the `source` world
 * whose board launched it. When an episode recorder is active
 * (`opts.episode`, shared/episodes.js) the episode and the record carry each
 * other's id, so the dataset and the audit log join on the same attempt.
 * Fires `station-passed` on a pass and `programme-milestone` when a
 * programme crosses a quarter, half or whole.
 */
export function ppRecordStation(result, { episode = null } = {}) {
  const who = ppLearner();
  const app = result.app ?? "smartcity";
  const touched = Object.entries(PP_PROGRAMMES).filter(([, p]) => p.stations.includes(result.simId)).map(([id]) => id);
  const before = new Map(touched.map((id) => [id, ppProgramme(id)]));
  const record = TrainingRecords.record({
    learnerName: who.id ? who.name : undefined, learnerId: who.id ?? undefined, homePage: who.homePage ?? undefined,
    ...result,
    app,
    source: result.source ?? app,
    ...(episode?.id ? { episodeId: episode.id } : {}),
  });
  if (episode && typeof episode === "object") { try { episode.recordId = record.id; } catch (_) { /* frozen */ } }
  if (record.passed) ppEmit("station-passed", { record, stationId: record.simId, source: record.source });
  for (const id of touched) {
    const after = ppProgramme(id);
    const mark = ppMilestone(before.get(id), after);
    if (mark) ppEmit("programme-milestone", { programmeId: id, mark, progress: after, record });
  }
  return record;
}

/**
 * Pay one award into the ledger with its source kept. `attemptId` (a record
 * id) makes it idempotent: the same source paying for the same attempt twice
 * returns the first award with `duplicate: true` and adds nothing. `native`
 * says the world already added the gain to its own store (Bay World's and the
 * Deep's careers, the regatta through Bay World's), so the ledger counts it
 * from that store and keeps this entry only for the source split and the log.
 */
export function ppAward(source, { reputation = 0, credits = 0, reason = "", attemptId = null, native = false } = {}) {
  const state = ppLoad();
  const id = attemptId ? `${source}:${attemptId}` : `${source}:${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
  const existing = state.awards.find((a) => a.id === id);
  if (existing) return { duplicate: true, award: existing };
  const award = {
    id, source: String(source), attemptId: attemptId ?? null,
    reputation: Math.max(0, Math.round(Number(reputation) || 0)), credits: Math.max(0, Math.round(Number(credits) || 0)),
    reason: String(reason ?? "").slice(0, 200), native: !!native, at: new Date().toISOString(),
  };
  state.awards.push(award);
  ppSave(state);
  ppEmit("award", award);
  return { duplicate: false, award };
}

/** True when this source has already paid for this attempt. */
export function ppAwarded(source, attemptId) { return ppLoad().awards.some((a) => a.id === `${source}:${attemptId}`); }

/**
 * Reputation and credits summed across every world: Bay World's and the
 * Deep's own careers read as they are (legacy totals included — migrated by
 * reading, never rewritten), the regatta's share carved out of Bay World's
 * store by its recorded native awards, and every passport-only award added
 * on top. `{ reputation, credits, bySource: { <source>: { reputation, credits } }, rounds, awards }`.
 */
export function ppLedger() {
  const state = ppLoad();
  const bySource = Object.fromEntries(PP_SOURCES.map((s) => [s, { reputation: 0, credits: 0 }]));
  const add = (src, rep, cr) => {
    if (!bySource[src]) bySource[src] = { reputation: 0, credits: 0 };
    bySource[src].reputation += rep; bySource[src].credits += cr;
  };
  for (const [src, key] of Object.entries(PP_NATIVE_STORES)) {
    const raw = ppReadJson(key, {});
    add(src, Number.isFinite(raw.reputation) ? raw.reputation : 0, Number.isFinite(raw.credits) ? raw.credits : 0);
  }
  for (const a of state.awards) {
    if (a.native) {
      const host = PP_NATIVE_HOST[a.source];
      if (host) { add(host, -a.reputation, -a.credits); add(a.source, a.reputation, a.credits); }
    } else add(a.source, a.reputation, a.credits);
  }
  for (const s of Object.values(bySource)) { s.reputation = Math.max(0, s.reputation); s.credits = Math.max(0, s.credits); }
  let reputation = 0, credits = 0;
  for (const s of Object.values(bySource)) { reputation += s.reputation; credits += s.credits; }
  const fw = ppReadJson(PP_FAIRWAY_KEY, {});
  return { reputation, credits, bySource, rounds: Array.isArray(fw.rounds) ? fw.rounds.length : 0, awards: state.awards.slice() };
}

// ----------------------------------------------------------- the round trip

/**
 * The deep link a job board launches by, with the way home on it:
 * `<runner>?sim=<id>&from=<app>&return=<the world's page>#site=<siteId>`.
 * `page` is the world's own path (location.pathname in a browser); the
 * runner only honours a same-origin return (ppReturnTarget below).
 */
export function ppLaunchLink(base, { sim, from, page, siteId = null, extra = "" }) {
  const ret = page ? `${page}${siteId ? `#site=${encodeURIComponent(siteId)}` : ""}` : null;
  return `${base}?sim=${encodeURIComponent(sim)}&from=${encodeURIComponent(from)}${ret ? `&return=${encodeURIComponent(ret)}` : ""}${extra}`;
}

/** The world page currently open (for ppLaunchLink's `page`), or null headless. */
export function ppHerePage() { try { return location.pathname || null; } catch (_) { return null; } }

/**
 * The runner's side: `{ from, url, label }` for the "Back to <world>" button,
 * from `?from=` and `?return=` — or null. The return must resolve to this
 * same origin (never an open redirect) and to an http(s) or file page.
 */
export function ppReturnTarget(search, here) {
  let params;
  try { params = new URLSearchParams(search || ""); } catch (_) { return null; }
  const from = params.get("from"), ret = params.get("return");
  if (!from || !ret) return null;
  try {
    const base = new URL(here);
    const u = new URL(ret, base);
    if (u.origin !== base.origin || !/^(https?|file):$/.test(u.protocol)) return null;
    return { from, url: u.href, label: `Back to ${PP_APP_NAMES[from] ?? from}` };
  } catch (_) { return null; }
}

/** The site a return lands on: `#site=<id>` (or `?site=`), else null. */
export function ppReturnSite(hash, search = "") {
  const h = String(hash ?? "").replace(/^#/, "");
  try {
    const fromHash = new URLSearchParams(h).get("site");
    if (fromHash) return fromHash;
    return new URLSearchParams(search || "").get("site");
  } catch (_) { return null; }
}

/** Mark a world's job board done for a site (on a pass). */
export function ppMarkBoard(app, siteId, recordId = null) {
  if (!app || !siteId) return false;
  const state = ppLoad();
  state.boards[app] = state.boards[app] ?? {};
  if (state.boards[app][siteId]) return false;
  state.boards[app][siteId] = { at: new Date().toISOString(), recordId };
  ppSave(state);
  return true;
}

/**
 * True when a world's board for this site is done: marked on a return, or —
 * migrated by reading — every station the site lists already has a pass.
 */
export function ppBoardDone(app, site) {
  const id = typeof site === "string" ? site : site?.id;
  if (ppLoad().boards[app]?.[id]) return true;
  const stations = typeof site === "object" ? site?.stations ?? [] : [];
  return stations.length > 0 && stations.every((s) => ppCompleted(s));
}

/**
 * Fresh returns for a world: every attempt at one of `sites`' stations this
 * world has not yet been handed, in record order, each marked handed so a
 * replay yields nothing. A pass marks that site's board done. `seen` seeds
 * the handed set from a world's own older ledger (migration by reading).
 * Returns `[{ record, site }]`.
 */
export function ppReturns(app, sites, { seen = [] } = {}) {
  const state = ppLoad();
  const handed = new Set([...(Array.isArray(state.returns[app]) ? state.returns[app] : []), ...seen]);
  const bySim = new Map();
  for (const s of sites) for (const sim of s.stations ?? []) if (!bySim.has(sim)) bySim.set(sim, s);
  const out = [];
  for (const r of ppRecords()) {
    if (!r?.id || handed.has(r.id)) continue;
    const site = bySim.get(r.simId);
    if (!site) continue;
    handed.add(r.id);
    out.push({ record: r, site });
  }
  if (out.length) {
    const fresh = ppLoad();
    fresh.returns[app] = [...handed].slice(-1000);
    for (const { record, site } of out) {
      if (!record.passed) continue;
      fresh.boards[app] = fresh.boards[app] ?? {};
      if (!fresh.boards[app][site.id]) fresh.boards[app][site.id] = { at: new Date().toISOString(), recordId: record.id };
    }
    ppSave(fresh);
  }
  return out;
}

/**
 * One call a world makes when the learner comes home: every fresh return
 * (`ppReturns`), paid once through `pay(record, site)` — which returns
 * `{ reputation, credits, native }` — into the ledger with the attempt id
 * (idempotent), then `advance(record, site)` for any quest step naming that
 * station. Returns `[{ record, site, award, duplicate }]`.
 */
export function ppCompleteReturns(app, sites, { pay = null, advance = null, seen = [] } = {}) {
  const out = [];
  for (const { record, site } of ppReturns(app, sites, { seen })) {
    const gain = pay ? pay(record, site) ?? {} : {};
    const res = ppAward(app, { ...gain, attemptId: record.id, reason: `${site.name ?? site.id}: ${record.passed ? "passed" : "attempted"} ${record.simName ?? record.simId}` });
    try { advance?.(record, site); } catch (_) { /* a quest never blocks a payout */ }
    out.push({ record, site, award: res.award, duplicate: res.duplicate });
  }
  return out;
}

// ------------------------------------------------------------ the chip

/**
 * The one programme progress widget: "<passed>/<total> passed · <stars>★ ·
 * <competency status>", with a bar, rendered into `el`. Reads only the
 * passport. Plain DOM, no innerHTML from data. Returns the progress or null.
 */
export function ppProgressChip(el, programmeId) {
  const p = ppProgramme(programmeId);
  if (!el) return p;
  try {
    el.textContent = "";
    el.classList?.add("pp-chip");
    if (!p) { el.hidden = true; return null; }
    el.hidden = false;
    const pct = p.total ? Math.round((p.passed / p.total) * 100) : 0;
    const doc = el.ownerDocument ?? globalThis.document;
    const bar = doc.createElement("span");
    bar.className = "pp-bar";
    bar.setAttribute("aria-hidden", "true");
    bar.style.cssText = `display:block;height:4px;border-radius:2px;margin-top:4px;background:linear-gradient(90deg,currentColor ${pct}%,rgba(127,127,127,.25) ${pct}%)`;
    const line = doc.createElement("span");
    line.className = "pp-line";
    line.textContent = `${p.passed}/${p.total} passed · ${p.stars}★${p.competencyStatus ? ` · ${p.competencyStatus}` : ""}`;
    el.append(line, bar);
    el.setAttribute("title", `${p.name}: ${p.passed} of ${p.total} stations passed`);
  } catch (_) { /* headless */ }
  return p;
}

// ------------------------------------------------------------ records out

/** The xAPI `context.platform` for an attempt: the world it came from. */
export function ppPlatform(r) {
  const src = r.source ?? r.app ?? "smartcity";
  const via = r.app && r.app !== src ? ` via ${PP_APP_NAMES[r.app] ?? r.app}` : "";
  return `SmartCiti.X ~Holodeck · ${PP_APP_NAMES[src] ?? src}${via}`;
}

/**
 * Every attempt out: `{ csv, xapi }` — records.js's CSV (whose columns
 * include `app` and `source`, the same columns Unity's TrainingRecord.cs
 * writes) and xAPI 1.0.3 statements whose `context.platform` names the
 * source world and whose `source-app` extension carries its id.
 */
export function ppExport({ records = ppRecords(), homePage = null } = {}) {
  const who = ppLearner();
  const home = homePage ?? who.homePage ?? "https://smartciti.example";
  const rows = records.map((r) => ({ ...r, source: r.source ?? r.app ?? "smartcity" }));
  const xapi = toXAPI(rows, { actorName: who.name, homePage: home });
  xapi.statements.forEach((st, i) => { st.context.platform = ppPlatform(rows[i]); });
  return { csv: toCSV(rows), xapi };
}
