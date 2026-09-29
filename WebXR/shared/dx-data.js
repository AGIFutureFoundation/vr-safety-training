// DATAWORKS (docs/consoles/DATAWORKS.md, docs/robot-datasets.md "The consented data system"):
// one consented data system across every world — consent, capture, local storage, export and
// analysis — built on robotics-dataset practice (RLDS / LeRobot-style episodes of
// observation/action/reward/done steps, explicit units and frames, a versioned schema,
// provenance and a consent receipt on every episode).
//
// PRIVACY IS THE FIRST REQUIREMENT, NOT A FEATURE:
//   * Nothing is recorded before an explicit opt-in (dxOptIn). The default is off.
//   * K-12, signed-out and demo sessions are never collected. When a signal cannot be read it
//     counts as "unknown", and unknown never collects (dxEligibility).
//   * No name, no free text, no voice, no real-world location — only the in-world position a
//     station already reports. Episodes carry a per-profile salted session hash, never an id.
//   * A consent receipt travels inside every human episode.
//   * One tap revokes and deletes everything local (dxRevoke).
//   * Storage is local only (IndexedDB, localStorage fallback, memory for headless), capped with
//     oldest-first eviction. THIS MODULE CONTAINS NO NETWORK CODE. An upload endpoint exists only as
//     a documented configuration hook (DX_UPLOAD_HOOK); none ships.
//
// SEAMS (plain, dependency-free data and pure functions — ROBOTICS' gym / rb_rollout and
// TQ-BRIDGE's shared export code against these):
//   DX_SCHEMA                      { id, version, units, frames, episodeFields, stepFields, ... }
//   dxMakeEpisode(meta, steps)     -> a schema-shaped episode (synthetic rollouts: source "synthetic", consent null)
//   dxValidateEpisode(ep)          -> { ok, errors[] }
//   dxExportFiles(episodes, opts)  -> { files: [{ path, text }], manifest, card }   (JSON Lines shards by split)
//   dxParseJsonl(text)             -> episodes[]
//   dxDatasetCard(manifest)        -> Markdown datasheet with every DX_CARD_SECTIONS heading
//   dxAnalyze(episodes)            -> success / safe-practice rates, step durations, interruptions,
//                                     error taxonomy, action distribution, quality flags, split
//   dxEligibility(signals?)        -> { eligible, reason, signals }
//   dxOptIn({ licence, adult })    -> { ok, consent } | { ok: false, reason }
//   dxRevoke()                     -> deletes consent, every stored episode and the legacy episode log
//   dxCollecting()                 -> true only when eligible AND opted in
//   dxRecorder(meta)               -> { active, step(...), finish(summary), abort() }  (no-op when not collecting)
//   dxStore                        -> async { put, list, clear, bytes, backend }
//
// Every top-level name carries the dx/DX_ prefix (the bundler shares one scope).

import { gtStorage, gtIsDemo, gtProfile } from "./profiles.js";

// ======================================================================= the schema (plain data)

export const DX_SCHEMA_ID = "smartcitix.holodeck.episode";
export const DX_SCHEMA_VERSION = "2.0.0";

/** The published schema. Plain JSON-safe data: BRIDGE exports it verbatim, ROBOTICS writes to it. */
export const DX_SCHEMA = Object.freeze({
  id: DX_SCHEMA_ID,
  version: DX_SCHEMA_VERSION,
  supersedes: { id: "vr-training-episodes", version: 1, note: "shared/episodes.js EPISODE_SCHEMA_VERSION 1 records convert with dxFromLegacy() (shared/dx-capture.js)" },
  layout: "One JSON object per line (JSON Lines); one line = one episode; `steps` is the RLDS-style step list.",
  units: {
    time: "s (seconds; step `t` is seconds since the episode started, simulation clock)",
    wallClock: "ISO-8601 UTC strings (startedAt, endedAt)",
    distance: "m (metres)",
    angle: "rad (radians); orientations as unit quaternions [x, y, z, w]",
    speed: "m/s",
    force: "N (newtons; only where a station declares a force ceiling)",
    reward: "points (the engine's own score delta for the step; dimensionless)",
  },
  frames: {
    world: "right-handed, +Y up, metres, origin at the world/map origin the scene is built around (three.js convention); in-world only — never a real-world coordinate",
    station: "positions inside a station are in that station's room frame (origin at the room centre floor, +Z toward the learner's start)",
    robot: "robot joint/end-effector values are in the robot's base frame as shared/robot-embodiment.js defines",
  },
  sources: ["human", "synthetic"],
  kinds: ["station", "lesson", "drill", "robot-game", "gym", "field"],
  episodeFields: {
    schema: { type: "string", required: true, doc: `always "${DX_SCHEMA_ID}"` },
    schemaVersion: { type: "string", required: true, doc: "semver of this schema" },
    episodeId: { type: "string", required: true, doc: "random per episode; never derived from a person" },
    sessionHash: { type: "string|null", required: true, doc: "salted per-profile hash of the play session; the train/validation split key. null for synthetic" },
    source: { type: "string", required: true, doc: "human | synthetic" },
    world: { type: "string", required: true, doc: "which world: parishes, smartcity, robotics, bayworld, …" },
    map: { type: "string|null", required: false, doc: "map/parish id inside the world, when there is one" },
    kind: { type: "string", required: true, doc: "station | lesson | drill | robot-game | gym | field" },
    scenario: { type: "string", required: true, doc: "station, lesson, drill or robot scenario id" },
    startedAt: { type: "string", required: true, doc: "ISO-8601 UTC" },
    endedAt: { type: "string|null", required: true, doc: "ISO-8601 UTC; null when the episode was cut off" },
    durationS: { type: "number", required: true, doc: "seconds" },
    steps: { type: "array", required: true, doc: "the step list (see stepFields)" },
    summary: { type: "object", required: true, doc: "{ success, safePractice, score, errors, hazardHits, interrupts: { answered, missed, wrong }, truncated }" },
    consent: { type: "object|null", required: true, doc: "the consent receipt (dxReceipt) for human episodes; null only for synthetic" },
    provenance: { type: "object", required: true, doc: "{ generator, generatorVersion, recordedWith, seed?, policy?, createdAt, notes? }" },
  },
  stepFields: {
    t: { type: "number", required: true, doc: "seconds since episode start" },
    observation: { type: "object", required: true, doc: "shared/robot.js observe() / observeEmbodied() shape, or a game's own observation; in-world values only" },
    action: { type: "object", required: true, doc: "{ type, ...params } — shared/robot.js applyAction() shapes (select, commit, press, release, rotate, drop, drive, check, wait) or a robot-game action" },
    reward: { type: "number", required: true, doc: "points" },
    done: { type: "boolean", required: true, doc: "true on the last step only" },
    info: { type: "object", required: true, doc: "{ outcome?: ok|wrong|hazard|timeout|keep-out|…, hazard?, clean?, interrupt?: { id, outcome, responseS }, unsafe? }" },
  },
  neverCollected: ["name", "crew tag in plain text", "e-mail", "free text", "voice or audio", "camera image", "real-world location", "account or wallet id"],
});

/** The dataset card's required datasheet sections, in order. The checker asserts each heading. */
export const DX_CARD_SECTIONS = Object.freeze([
  "Motivation", "Composition", "Collection process", "Consent", "De-identification",
  "Licence", "Known gaps and biases", "Intended uses", "Out-of-scope uses", "Schema, units and frames",
  "Provenance", "Maintenance",
]);

/** The only licences offered (the same two shared/share-engagement.js offers). */
export const DX_LICENCES = Object.freeze(["CC0-1.0", "CC-BY-4.0"]);

/** What an opted-in learner shares, and what is never collected — the consent panel shows these verbatim. */
export const DX_COLLECTS = Object.freeze([
  "which station, lesson, drill or robot game you played and in which world",
  "each decision you made (the action), what the scene showed at that moment and the score change",
  "timing in seconds, interruptions answered or missed, safe-practice flags",
  "your in-world position and view direction during a station (never a real-world location)",
]);
export const DX_NEVER = DX_SCHEMA.neverCollected;

/**
 * The upload hook — documented, NOT shipped. A deployment that wants episodes to leave the browser
 * adds `{ "dataworks": { "upload": { "endpoint": "https://…", "licence": "CC0-1.0" } } }` to its
 * own deployment config (the tools/seo-config.json style) and writes its own uploader against
 * dxExportFiles(). This module never reads that file and has no fetch/XHR/beacon call.
 */
export const DX_UPLOAD_HOOK = Object.freeze({
  shipped: false,
  configKey: "dataworks.upload.endpoint",
  configStyle: "tools/seo-config.json",
  contract: "POST one manifest + its JSON Lines shards (dxExportFiles output) to an https endpoint the deployment owns; only after the learner presses an explicit share button; refuse when dxCollecting() is false.",
});
/** Validates a deployment's configured endpoint (https only) and returns it, or null. Does not send anything. */
export function dxUploadEndpoint(config) {
  const url = config?.dataworks?.upload?.endpoint;
  return typeof url === "string" && /^https:\/\/[^\s]+$/.test(url) ? url : null;
}

// ======================================================================= small helpers

function dxFnv(s) {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i += 1) { h ^= s.charCodeAt(i); h = Math.imul(h, 0x01000193) >>> 0; }
  return h.toString(16).padStart(8, "0");
}
function dxRandId(n = 8) {
  const b = new Uint8Array(n);
  try { globalThis.crypto.getRandomValues(b); } catch (_) { for (let i = 0; i < n; i += 1) b[i] = Math.floor(Math.random() * 256); }
  return [...b].map((x) => x.toString(16).padStart(2, "0")).join("");
}
function dxNum(v, d = 0) { const n = Number(v); return Number.isFinite(n) ? n : d; }
const dxRound = (n, p = 3) => Math.round(dxNum(n) * 10 ** p) / 10 ** p;
function dxLs() { try { return gtStorage(); } catch (_) { return null; } }
function dxGetJson(key, fallback = null) { try { const v = JSON.parse(dxLs()?.getItem(key) ?? "null"); return v ?? fallback; } catch (_) { return fallback; } }
function dxSetJson(key, v) { try { dxLs()?.setItem(key, JSON.stringify(v)); return true; } catch (_) { return false; } }
function dxDel(key) { try { dxLs()?.removeItem(key); } catch (_) { /* ignore */ } }

// ======================================================================= eligibility

export const DX_CONSENT_KEY = "dx-consent-v1";
export const DX_EPISODES_KEY = "dx-episodes-v1";
const DX_SALT_KEY = "dx-session-salt-v1";
/** Keys dxRevoke() removes besides its own: the legacy episode log and share consent (same data class). */
export const DX_LEGACY_KEYS = Object.freeze([
  "vr-training-episodes-v1", "vr-training-episodes-current-v1", "vr-training-episode-salt-v1",
  "vr-training-share-consent-v1", "vr-training-share-receipts-v1",
]);

/**
 * Read the signals that decide whether this session may be offered collection at all. Each is
 * true / false / null (unknown). Any read that throws yields null, and null never collects.
 *   demo      shared/profiles.js gtIsDemo()
 *   signedIn  shared/profiles.js gtProfile().kind === "account"
 *   k12       a K-12 surface or classroom: ?k12 / ?audience=k12|classroom|kids on the URL, a SCHOLAR
 *             K-12 session on this profile, or DEAN's active version scoped to a class code
 *   adult     the adult attestation the learner gave in the consent panel (stored consent)
 */
export function dxReadSignals({ search = null } = {}) {
  const s = { demo: null, signedIn: null, k12: null, adult: null };
  try { s.demo = !!gtIsDemo(); } catch (_) { s.demo = null; }
  try { s.signedIn = gtProfile().kind === "account"; } catch (_) { s.signedIn = null; }
  try {
    const q = new URLSearchParams(search ?? globalThis.location?.search ?? "");
    const aud = (q.get("audience") || "").toLowerCase();
    let k12 = q.has("k12") || q.has("kids") || ["k12", "k-12", "classroom", "kids", "school"].includes(aud);
    const sc = dxGetJson("vr-scholar-v1", null);
    if (Array.isArray(sc?.sessions) && sc.sessions.length) k12 = true;
    const dn = dxGetJson("vr-dean-v1", null);
    const active = dn?.versions?.find?.((v) => v.id === dn.active);
    if (active?.scope?.kind === "class") k12 = true;
    s.k12 = k12;
  } catch (_) { s.k12 = null; }
  const c = dxGetJson(DX_CONSENT_KEY, null);
  s.adult = c ? c.adult === true : null;
  return s;
}

/**
 * Whether this session may be collected. `stage: "offer"` ignores the adult attestation (the
 * panel is where it is given); `stage: "collect"` needs every signal to be a definite yes/no in the
 * permitting direction. Unknown never collects.
 */
export function dxEligibility(signals = dxReadSignals(), { stage = "collect" } = {}) {
  const sg = { ...signals };
  const no = (reason, text) => ({ eligible: false, reason, text, signals: sg });
  if (sg.demo !== false) return no(sg.demo ? "demo" : "unknown-demo", "The free demo keeps nothing, so nothing is collected.");
  if (sg.signedIn !== true) return no(sg.signedIn === false ? "signed-out" : "unknown-sign-in", "Sign in to be offered data sharing; signed-out play is never collected.");
  if (sg.k12 !== false) return no(sg.k12 ? "k12" : "unknown-k12", "K-12 and classroom sessions are never collected.");
  if (stage === "collect" && sg.adult !== true) return no("age-unknown", "Collection needs your own adult (18+) confirmation in the consent panel.");
  return { eligible: true, reason: "ok", text: "Eligible", signals: sg };
}

// ======================================================================= consent

export function dxConsentStatement({ licence, at }) {
  return [
    "I am 18 or older and I opt in to record my SmartCiti.X Holodeck training episodes on this device",
    "(decisions, in-world observations, timing and scores — no name, no free text, no voice, no real-world location)",
    "for building robot- and model-training datasets.",
    `Licence for anything I later choose to export or share: ${licence}.`,
    "Nothing leaves this device unless I export it myself. I can revoke at any time, which deletes every stored episode.",
    `At: ${at}`,
  ].join("\n");
}

export function dxConsent() { return dxGetJson(DX_CONSENT_KEY, null); }

/** The receipt stored inside every human episode: enough to show what was agreed, nothing about who. */
export function dxReceipt(consent = dxConsent()) {
  if (!consent) return null;
  return {
    consentId: consent.id, at: consent.at, licence: consent.licence, adult: consent.adult === true,
    statementHash: consent.statementHash, schema: `${DX_SCHEMA_ID}@${DX_SCHEMA_VERSION}`,
    collects: "DX_COLLECTS", never: DX_NEVER.slice(), revocable: true, storage: "local-only",
  };
}

/** Opt in: needs an eligible session, a licence from DX_LICENCES and the adult attestation. Local write only. */
export function dxOptIn({ licence, adult = false, signals = null, now = () => new Date() } = {}) {
  if (!DX_LICENCES.includes(licence)) return { ok: false, reason: `Choose a licence: ${DX_LICENCES.join(" or ")}.` };
  if (adult !== true) return { ok: false, reason: "Confirm you are 18 or older — otherwise nothing is collected." };
  const el = dxEligibility(signals ?? dxReadSignals(), { stage: "offer" });
  if (!el.eligible) return { ok: false, reason: el.text, eligibility: el };
  const at = now().toISOString();
  const statement = dxConsentStatement({ licence, at });
  const consent = { v: 1, id: dxRandId(8), at, licence, adult: true, statement, statementHash: dxFnv(statement) + dxFnv(statement.split("").reverse().join("")), schema: DX_SCHEMA_ID, schemaVersion: DX_SCHEMA_VERSION };
  dxSetJson(DX_CONSENT_KEY, consent);
  return { ok: true, consent };
}

/** One-tap revoke: the consent, every dx episode (both backends) and the legacy episode log go. */
export async function dxRevoke({ store = dxStore } = {}) {
  dxDel(DX_CONSENT_KEY);
  dxDel(DX_SALT_KEY);
  for (const k of DX_LEGACY_KEYS) dxDel(k);
  dxLiveRecorders.forEach((r) => r.abort());
  dxLiveRecorders.clear();
  await store.clear();
  return { ok: true, remaining: (await store.list()).length };
}

/** True only when the session is eligible AND the learner has opted in. Checked at every capture. */
export function dxCollecting(signals = null) {
  const c = dxConsent();
  if (!c || c.adult !== true || c.schema !== DX_SCHEMA_ID) return false;
  return dxEligibility(signals ?? dxReadSignals()).eligible;
}

/** The salted per-profile session hash: the split key. Rotates on revoke; never derived from an id. */
export function dxSessionHash() {
  let salt = dxGetJson(DX_SALT_KEY, null);
  if (!salt) { salt = dxRandId(12); dxSetJson(DX_SALT_KEY, salt); }
  const day = new Date().toISOString().slice(0, 10);
  return `s-${dxFnv(`${salt}|${day}`)}${dxFnv(`${day}|${salt}`)}`;
}

// ======================================================================= episodes

/** Build a schema-shaped episode. Human episodes get the receipt automatically when collecting. */
export function dxMakeEpisode(meta = {}, steps = []) {
  const clean = steps.map((s, i) => ({
    t: dxRound(s.t ?? i, 3),
    observation: s.observation ?? s.obs ?? {},
    action: s.action ?? { type: "wait" },
    reward: dxNum(s.reward, 0),
    done: i === steps.length - 1 ? s.done !== false && !meta.truncated : false,
    info: s.info ?? {},
  }));
  const sm = meta.summary ?? {};
  const hazards = clean.filter((s) => s.info?.hazard).length;
  const source = meta.source === "synthetic" ? "synthetic" : "human";
  const startedAt = meta.startedAt ?? new Date().toISOString();
  const durationS = dxRound(meta.durationS ?? (clean.length ? clean[clean.length - 1].t : 0), 2);
  return {
    schema: DX_SCHEMA_ID, schemaVersion: DX_SCHEMA_VERSION,
    episodeId: meta.episodeId ?? `ep-${dxRandId(8)}`,
    sessionHash: source === "synthetic" ? (meta.sessionHash ?? null) : (meta.sessionHash ?? dxSessionHash()),
    source, world: meta.world ?? "unknown", map: meta.map ?? null, kind: meta.kind ?? "station",
    scenario: meta.scenario ?? "unknown",
    startedAt, endedAt: meta.truncated ? null : (meta.endedAt ?? startedAt), durationS,
    steps: clean,
    summary: {
      success: sm.success ?? !!sm.passed ?? false,
      safePractice: sm.safePractice ?? ((sm.hazardHits ?? hazards) === 0 && !clean.some((s) => s.info?.unsafe)),
      score: dxNum(sm.score, clean.reduce((n, s) => n + s.reward, 0)),
      errors: dxNum(sm.errors, clean.filter((s) => s.info?.clean === false).length),
      hazardHits: dxNum(sm.hazardHits, hazards),
      interrupts: { answered: dxNum(sm.interrupts?.answered), missed: dxNum(sm.interrupts?.missed), wrong: dxNum(sm.interrupts?.wrong) },
      truncated: !!meta.truncated,
    },
    consent: source === "synthetic" ? null : (meta.consent ?? dxReceipt()),
    provenance: {
      generator: meta.generator ?? "shared/dx-data.js", generatorVersion: DX_SCHEMA_VERSION,
      recordedWith: meta.recordedWith ?? (source === "synthetic" ? "headless" : "browser"),
      ...(meta.seed != null ? { seed: meta.seed } : {}), ...(meta.policy ? { policy: meta.policy } : {}),
      createdAt: meta.createdAt ?? new Date().toISOString(), ...(meta.notes ? { notes: meta.notes } : {}),
    },
  };
}

const DX_FORBIDDEN_KEYS = /^(name|learnerName|learner|crewTag|email|e-mail|freeText|text|note|voice|audio|image|lat|lng|lon|latitude|longitude|geo|address|wallet|accountId|userId)$/i;

/** Schema validation — required fields and types, step shape, consent on human episodes, no personal keys. */
export function dxValidateEpisode(ep) {
  const errors = [];
  const typeOk = (v, t) => t.split("|").some((one) => (one === "null" ? v === null : one === "array" ? Array.isArray(v) : one === "object" ? v !== null && typeof v === "object" && !Array.isArray(v) : typeof v === one));
  if (!ep || typeof ep !== "object") return { ok: false, errors: ["not an object"] };
  for (const [k, f] of Object.entries(DX_SCHEMA.episodeFields)) {
    if (!(k in ep)) { if (f.required) errors.push(`missing ${k}`); continue; }
    if (!typeOk(ep[k], f.type)) errors.push(`${k} should be ${f.type}`);
  }
  if (ep.schema !== DX_SCHEMA_ID) errors.push(`schema is ${ep.schema}`);
  if (typeof ep.schemaVersion === "string" && ep.schemaVersion.split(".")[0] !== DX_SCHEMA_VERSION.split(".")[0]) errors.push(`schemaVersion ${ep.schemaVersion} is not major ${DX_SCHEMA_VERSION.split(".")[0]}`);
  if (!DX_SCHEMA.sources.includes(ep.source)) errors.push(`source ${ep.source}`);
  if (ep.source === "human" && !ep.consent?.consentId) errors.push("human episode without a consent receipt");
  if (ep.source === "synthetic" && ep.consent) errors.push("synthetic episode carries a consent receipt");
  (ep.steps ?? []).forEach((s, i) => {
    for (const [k, f] of Object.entries(DX_SCHEMA.stepFields)) if (!(k in s) || !typeOk(s[k], f.type)) errors.push(`step ${i}: ${k} should be ${f.type}`);
    if (s.done && i !== ep.steps.length - 1) errors.push(`step ${i}: done before the last step`);
  });
  const walk = (v, path, depth) => {
    if (depth > 6 || !v || typeof v !== "object") return;
    for (const [k, x] of Object.entries(v)) {
      if (DX_FORBIDDEN_KEYS.test(k) && x != null && x !== "") errors.push(`personal-looking field ${path}${k}`);
      walk(x, `${path}${k}.`, depth + 1);
    }
  };
  walk({ ...ep, consent: null, provenance: null }, "", 0);
  return { ok: errors.length === 0, errors };
}

// ======================================================================= recording (buffered)

const dxLiveRecorders = new Set();
const dxIdle = (fn) => (typeof globalThis.requestIdleCallback === "function" ? globalThis.requestIdleCallback(fn, { timeout: 2000 }) : setTimeout(fn, 0));

/**
 * A buffered recorder. When dxCollecting() is false at creation it is inert — `active: false`,
 * every call a no-op, nothing buffered. step() only pushes to memory; finish() hands the episode to
 * dxStore on an idle callback, never inside a frame. Consent is re-checked at finish, so a revoke
 * mid-episode discards it.
 */
export function dxRecorder(meta = {}, { store = dxStore, signals = null, clock = () => Date.now() } = {}) {
  if (!dxCollecting(signals)) return { active: false, step() {}, finish() { return null; }, abort() {}, episode: null };
  const t0 = clock();
  const startedAt = new Date(t0).toISOString();
  const steps = [];
  let done = false;
  const rec = {
    active: true, episode: null,
    step(observation, action, reward = 0, info = {}) {
      if (done) return;
      steps.push({ t: (clock() - t0) / 1000, observation, action, reward, info });
    },
    finish(summary = {}, { truncated = false } = {}) {
      if (done) return rec.episode;
      done = true; dxLiveRecorders.delete(rec);
      if (!dxCollecting(signals)) return null;
      rec.episode = dxMakeEpisode({ ...meta, startedAt, endedAt: new Date(clock()).toISOString(), durationS: (clock() - t0) / 1000, summary, truncated, source: "human" }, steps);
      const ep = rec.episode;
      dxIdle(() => { if (dxCollecting(signals)) store.put(ep); });
      return ep;
    },
    abort() { done = true; steps.length = 0; dxLiveRecorders.delete(rec); },
  };
  dxLiveRecorders.add(rec);
  return rec;
}

// ======================================================================= storage (local only)

export const DX_MAX_BYTES = 4_000_000;      // IndexedDB budget (JSON length)
export const DX_MAX_BYTES_LS = 1_000_000;   // localStorage fallback budget
export const DX_MAX_EPISODES = 600;

/** Oldest-first eviction to fit both caps. Pure: returns the kept list. */
export function dxEvict(list, { maxBytes = DX_MAX_BYTES, maxEpisodes = DX_MAX_EPISODES } = {}) {
  const out = list.slice().sort((a, b) => String(a.startedAt).localeCompare(String(b.startedAt)));
  const size = (x) => JSON.stringify(x).length;
  let total = out.reduce((n, e) => n + size(e), 0);
  while (out.length > maxEpisodes || (out.length > 1 && total > maxBytes)) total -= size(out.shift());
  return out;
}

/** In-memory backend (headless and the last resort). */
export function dxMemBackend() {
  let list = [];
  return { kind: "memory", async all() { return list.slice(); }, async save(l) { list = l.slice(); }, async clear() { list = []; } };
}
/** localStorage backend through shared/profiles.js gtStorage (per profile; never the demo — collection refuses it). */
export function dxLsBackend() {
  return {
    kind: "localStorage", maxBytes: DX_MAX_BYTES_LS,
    async all() { return dxGetJson(DX_EPISODES_KEY, []); },
    async save(l) { if (!dxSetJson(DX_EPISODES_KEY, l)) dxSetJson(DX_EPISODES_KEY, dxEvict(l, { maxBytes: DX_MAX_BYTES_LS / 2 })); },
    async clear() { dxDel(DX_EPISODES_KEY); },
  };
}
/** IndexedDB backend: one database per profile namespace, one object store, the list under one key. */
export function dxIdbBackend(idb = globalThis.indexedDB) {
  let ns = "device";
  try { ns = gtProfile().ns || gtProfile().kind; } catch (_) { /* default */ }
  const name = `dx-episodes-${ns}`;
  const open = () => new Promise((res, rej) => {
    const r = idb.open(name, 1);
    r.onupgradeneeded = () => r.result.createObjectStore("episodes");
    r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error);
  });
  const tx = async (mode, fn) => { const db = await open(); return new Promise((res, rej) => { const t = db.transaction("episodes", mode); const s = t.objectStore("episodes"); const out = fn(s); t.oncomplete = () => { db.close(); res(out?.result); }; t.onerror = () => { db.close(); rej(t.error); }; }); };
  return {
    kind: "indexedDB", name, maxBytes: DX_MAX_BYTES,
    async all() { return (await tx("readonly", (s) => s.get("list"))) ?? []; },
    async save(l) { await tx("readwrite", (s) => s.put(l, "list")); },
    async clear() { await tx("readwrite", (s) => s.delete("list")); try { idb.deleteDatabase(name); } catch (_) { /* ignore */ } },
  };
}

/** Make a store over a backend. put() validates and evicts; nothing here touches the network. */
export function dxMakeStore(backend) {
  const b = backend;
  return {
    get backend() { return b.kind; },
    async put(ep) {
      if (!dxValidateEpisode(ep).ok) return false;
      const list = (await b.all()).filter((e) => e.episodeId !== ep.episodeId);
      await b.save(dxEvict([...list, ep], { maxBytes: b.maxBytes ?? DX_MAX_BYTES }));
      return true;
    },
    async list() { return b.all(); },
    async bytes() { return JSON.stringify(await b.all()).length; },
    async clear() { await b.clear(); },
  };
}

function dxPickBackend() {
  try { if (globalThis.indexedDB?.open) return dxIdbBackend(); } catch (_) { /* fall through */ }
  try { if (globalThis.localStorage) return dxLsBackend(); } catch (_) { /* fall through */ }
  return dxMemBackend();
}
/** The page's store: IndexedDB, else localStorage, else memory. Swap with dxUseStore() in tests. */
export let dxStore = dxMakeStore(dxPickBackend());
export function dxUseStore(s) { dxStore = s; return s; }

// ======================================================================= split, export, card

export const DX_VALIDATION_PERCENT = 20;
/** Train/validation by session hash, so one session never straddles the split. Synthetic: by seed or id. */
export function dxSplitOf(ep, pct = DX_VALIDATION_PERCENT) {
  const key = ep.sessionHash ?? `${ep.provenance?.seed ?? ""}|${ep.episodeId}`;
  return parseInt(dxFnv(String(key)), 16) % 100 < pct ? "validation" : "train";
}

export function dxToJsonl(episodes) { return episodes.map((e) => JSON.stringify(e)).join("\n") + (episodes.length ? "\n" : ""); }
export function dxParseJsonl(text) { return String(text).split(/\r?\n/).filter((l) => l.trim()).map((l) => JSON.parse(l)); }

/** JSON Lines shards (split × shardSize), a manifest and the dataset card. Pure — the page downloads, tools write. */
export function dxExportFiles(episodes, { shardSize = 250, name = "smartcitix-holodeck-episodes", createdAt = new Date().toISOString(), generator = "shared/dx-data.js" } = {}) {
  const valid = episodes.filter((e) => dxValidateEpisode(e).ok);
  const bySplit = { train: [], validation: [] };
  for (const e of valid) bySplit[dxSplitOf(e)].push(e);
  const files = [], shards = [];
  for (const [split, list] of Object.entries(bySplit)) {
    const n = Math.max(1, Math.ceil(list.length / shardSize));
    if (!list.length) continue;
    for (let i = 0; i < n; i += 1) {
      const part = list.slice(i * shardSize, (i + 1) * shardSize);
      const path = `data/${split}-${String(i).padStart(5, "0")}-of-${String(n).padStart(5, "0")}.jsonl`;
      const text = dxToJsonl(part);
      files.push({ path, text });
      shards.push({ path, split, episodes: part.length, steps: part.reduce((k, e) => k + e.steps.length, 0), bytes: text.length, fnv: dxFnv(text) });
    }
  }
  const licences = [...new Set(valid.map((e) => (e.source === "synthetic" ? "CC0-1.0" : e.consent?.licence)).filter(Boolean))];
  const manifest = {
    name, createdAt, generator, schema: { id: DX_SCHEMA_ID, version: DX_SCHEMA_VERSION },
    units: DX_SCHEMA.units, frames: DX_SCHEMA.frames,
    counts: {
      episodes: valid.length, rejected: episodes.length - valid.length,
      human: valid.filter((e) => e.source === "human").length, synthetic: valid.filter((e) => e.source === "synthetic").length,
      train: bySplit.train.length, validation: bySplit.validation.length,
      steps: valid.reduce((k, e) => k + e.steps.length, 0),
      worlds: [...new Set(valid.map((e) => e.world))].sort(), scenarios: [...new Set(valid.map((e) => e.scenario))].length,
    },
    split: { key: "sessionHash", validationPercent: DX_VALIDATION_PERCENT },
    licences, consentReceipts: valid.filter((e) => e.consent).length,
    upload: { shipped: false, hook: DX_UPLOAD_HOOK.configKey },
    shards,
  };
  const card = dxDatasetCard(manifest);
  files.push({ path: "manifest.json", text: JSON.stringify(manifest, null, 2) + "\n" });
  files.push({ path: "DATASET_CARD.md", text: card });
  return { files, manifest, card };
}

/** The datasheet (Gebru et al. "Datasheets for Datasets" sections, adapted). Every DX_CARD_SECTIONS heading appears. */
export function dxDatasetCard(m = { counts: {}, licences: [], shards: [] }) {
  const c = m.counts ?? {};
  const body = {
    "Motivation": `Episodes of people and scripted policies practising workplace-safety procedures in the SmartCiti.X Holodeck, for training and evaluating robot and software agents on safe practice (stop, isolate, verify before acting). Built by the DATAWORKS layer; not a certification of any person.`,
    "Composition": `${c.episodes ?? 0} episodes (${c.human ?? 0} human, ${c.synthetic ?? 0} synthetic), ${c.steps ?? 0} steps, ${c.scenarios ?? 0} scenarios across worlds: ${(c.worlds ?? []).join(", ") || "none"}. One JSON Lines line per episode; each episode is a list of steps with observation, action, reward (points), done and info. Split by session hash: ${c.train ?? 0} train / ${c.validation ?? 0} validation.`,
    "Collection process": `Human episodes are recorded in the browser only after an explicit opt-in, buffered in memory and written to local storage (IndexedDB, localStorage fallback) off the render loop. Synthetic episodes come from headless rollouts (shared/robot.js policies, ROBOTICS' rb_rollout) with their seed in provenance.`,
    "Consent": `Off by default. A learner opts in from the Me tab after confirming they are 18 or older and choosing a licence (${DX_LICENCES.join(" or ")}). K-12, classroom, signed-out and demo sessions are never collected, and an unreadable signal counts as "do not collect". Every human episode carries its consent receipt (consent id, time, licence, statement hash). One tap revokes and deletes every stored episode. ${m.consentReceipts ?? 0} receipts in this export.`,
    "De-identification": `No name, e-mail, crew tag, free text, voice, camera image, account/wallet id or real-world location is collected. Positions are in-world coordinates only. Sessions are keyed by a salted per-profile hash that rotates daily and on revoke; the salt never leaves the device. This is data minimisation, not anonymisation proof: small cohorts may still be re-identifiable from timing patterns.`,
    "Licence": `${(m.licences ?? []).join(", ") || "none"}. Synthetic rollouts are CC0-1.0. Human episodes carry the licence their learner chose, per episode, in the consent receipt.`,
    "Known gaps and biases": `Learners who opt in are self-selected adults on devices that can run WebXR; stations and worlds are unevenly covered; synthetic policies model a single skill parameter, not a real learner; scoring reflects this engine's rules, not a standards body's; phone and headset users produce different timing distributions.`,
    "Intended uses": `Training and evaluating agents and robots on safe-practice procedure following; studying where learners hesitate or err so stations can be improved; benchmarking policies on the same scenarios as people.`,
    "Out-of-scope uses": `Assessing, ranking, hiring, disciplining or identifying any individual; certification or licensing decisions; inferring age, identity, health or location; any use that re-links episodes to a person.`,
    "Schema, units and frames": `Schema ${m.schema?.id ?? DX_SCHEMA_ID}@${m.schema?.version ?? DX_SCHEMA_VERSION}. Units: time in seconds, distance in metres, angles in radians (quaternions [x,y,z,w]), speed m/s, force N, reward in points. Frames: world is right-handed +Y up in metres (three.js), in-world only. Full field list in manifest.json and docs/robot-datasets.md.`,
    "Provenance": `Each episode's provenance names its generator, version, recorder (browser or headless), seed and policy when synthetic, and creation time. Shards: ${(m.shards ?? []).map((s) => `${s.path} (${s.episodes})`).join("; ") || "none"}.`,
    "Maintenance": `Maintained with the SmartCiti.X Holodeck repository. The schema is versioned (semver); a major bump means a converter is required. No upload endpoint ships; a deployment may configure ${DX_UPLOAD_HOOK.configKey} and is then responsible for the transfer and its own retention policy.`,
  };
  const lines = [`# Dataset card — ${m.name ?? "SmartCiti.X Holodeck episodes"}`, "", `Created ${m.createdAt ?? "—"} by ${m.generator ?? "shared/dx-data.js"}.`, ""];
  for (const h of DX_CARD_SECTIONS) lines.push(`## ${h}`, "", body[h], "");
  return lines.join("\n");
}

// ======================================================================= analysis

export const DX_IDLE_GAP_S = 60;   // a gap between steps longer than this flags the episode idle

const dxMean = (a) => (a.length ? a.reduce((n, x) => n + x, 0) / a.length : 0);
function dxQuantile(a, q) { if (!a.length) return 0; const s = a.slice().sort((x, y) => x - y); return s[Math.min(s.length - 1, Math.floor(q * (s.length - 1) + 0.5))]; }

/** The key two episodes share when they are the same episode recorded twice. */
export function dxDedupeKey(ep) {
  const basis = [ep.world, ep.scenario, ep.startedAt, ep.sessionHash ?? "", ep.steps?.length ?? 0, ep.summary?.score ?? ""].join("|");
  return dxFnv(basis) + dxFnv(basis.split("").reverse().join(""));
}

/** Per-episode quality flags: truncated, idle, duplicate. */
export function dxQualityFlags(episodes) {
  const seen = new Map();
  return episodes.map((ep) => {
    const flags = [];
    const steps = ep.steps ?? [];
    if (ep.summary?.truncated || !steps.length || !steps[steps.length - 1].done || ep.endedAt == null) flags.push("truncated");
    const gaps = steps.slice(1).map((s, i) => s.t - steps[i].t);
    if (!steps.length || steps.every((s) => s.action?.type === "wait") || gaps.some((g) => g > DX_IDLE_GAP_S)) flags.push("idle");
    const k = dxDedupeKey(ep);
    if (seen.has(k)) flags.push("duplicate"); else seen.set(k, ep.episodeId);
    return { episodeId: ep.episodeId, flags };
  });
}

/** All the analysis numbers, headless and in the page alike. */
export function dxAnalyze(episodes) {
  const eps = episodes.filter((e) => e && Array.isArray(e.steps));
  const by = (keyFn) => {
    const m = {};
    for (const e of eps) {
      const k = keyFn(e);
      const r = (m[k] ??= { episodes: 0, success: 0, safe: 0, durations: [] });
      r.episodes += 1; if (e.summary?.success) r.success += 1; if (e.summary?.safePractice) r.safe += 1; r.durations.push(dxNum(e.durationS));
    }
    for (const r of Object.values(m)) { r.successRate = dxRound(r.success / r.episodes); r.safeRate = dxRound(r.safe / r.episodes); r.meanDurationS = dxRound(dxMean(r.durations), 2); delete r.durations; }
    return m;
  };
  const stepDur = [];
  const actions = {}, errors = {};
  const it = { answered: 0, missed: 0, wrong: 0, responses: [] };
  for (const e of eps) {
    e.steps.forEach((s, i) => {
      if (i > 0) stepDur.push(dxRound(s.t - e.steps[i - 1].t, 3));
      const a = s.action?.type ?? "none"; actions[a] = (actions[a] ?? 0) + 1;
      const inf = s.info ?? {};
      if (inf.hazard) errors.hazard = (errors.hazard ?? 0) + 1;
      else if (inf.clean === false || (inf.outcome && inf.outcome !== "ok")) { const k = inf.outcome || "error"; errors[k] = (errors[k] ?? 0) + 1; }
      if (inf.interrupt?.responseS != null) it.responses.push(dxNum(inf.interrupt.responseS));
    });
    const si = e.summary?.interrupts ?? {};
    it.answered += dxNum(si.answered); it.missed += dxNum(si.missed); it.wrong += dxNum(si.wrong);
  }
  const itTotal = it.answered + it.missed + it.wrong;
  const flags = dxQualityFlags(eps);
  const flagCounts = { truncated: 0, idle: 0, duplicate: 0 };
  for (const f of flags) for (const x of f.flags) flagCounts[x] += 1;
  const split = { train: 0, validation: 0 };
  const sessions = { train: new Set(), validation: new Set() };
  for (const e of eps) { const s = dxSplitOf(e); split[s] += 1; sessions[s].add(e.sessionHash ?? e.episodeId); }
  const overlap = [...sessions.train].filter((x) => sessions.validation.has(x)).length;
  return {
    schema: `${DX_SCHEMA_ID}@${DX_SCHEMA_VERSION}`,
    total: eps.length,
    bySource: { human: eps.filter((e) => e.source === "human").length, synthetic: eps.filter((e) => e.source === "synthetic").length },
    successRate: eps.length ? dxRound(eps.filter((e) => e.summary?.success).length / eps.length) : 0,
    safeRate: eps.length ? dxRound(eps.filter((e) => e.summary?.safePractice).length / eps.length) : 0,
    byScenario: by((e) => e.scenario), byWorld: by((e) => e.world), byKind: by((e) => e.kind),
    stepDurations: { n: stepDur.length, meanS: dxRound(dxMean(stepDur)), medianS: dxRound(dxQuantile(stepDur, 0.5)), p90S: dxRound(dxQuantile(stepDur, 0.9)) },
    interrupts: { answered: it.answered, missed: it.missed, wrong: it.wrong, responseRate: itTotal ? dxRound(it.answered / itTotal) : null, meanResponseS: it.responses.length ? dxRound(dxMean(it.responses)) : null },
    errors, actions,
    flags: flagCounts, flagged: flags.filter((f) => f.flags.length),
    split: { ...split, sessionOverlap: overlap, key: "sessionHash", validationPercent: DX_VALIDATION_PERCENT },
  };
}
