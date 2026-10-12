// ECOSYSTEM — the bus adapter (docs/ecosystem.md, docs/consoles/ECOSYSTEM.md).
//
// Emits this platform's learner, governor, hive and arena events in the shapes SmartCiti.X documents in its in-process
// contract layer (github.com/agifuturefoundation/smartciti.x, commit 398f287):
//   bus/bus.mjs        a message is { topic, role, schema_version, event_id, payload }; each topic has ONE permitted publisher
//                      (TOPIC_OWNERS); delivery is at-least-once with dedupe on event_id; SCHEMA_VERSION "1.0.0".
//   bus/telemetry.mjs  the ACP-01 envelope { event_id, ts, clock_skew_ms, ts_source, learner_id, session_id, context: { module_id,
//                      skill_ids, difficulty, modality, device_tier, scaffold_level }, verb, payload }; verb from VERBS; a missing
//                      modality is "quiz"; past MAX_CLOCK_SKEW_MS (two minutes) the receipt time is trusted (ts_source "server");
//                      fewer than MIN_USABLE_EVENTS (3) usable events make NO profile update ("silence is not evidence").
//   bus/audit.mjs      an append-only entry { seq, ts, actor, action, before, after, why, learner, skill }; actor and action required.
//   bus/README.md      ACP-08: affect labels never reach an export.
// SmartCiti.X has no licence file, so nothing of its code is copied: this file is written against those documented shapes,
// and tools/check_eco.mjs cross-checks the output against the real modules when a read-only clone is present.
//
// Mapping. Learner events become `telemetry.event` messages (the one topic a client may publish). Governor decisions, hive
// events and arena results are not learner telemetry and SmartCiti.X has no topic for them at 398f287, so they become audit
// entries (the same log its bus writes decisions to), with `learner: null`; tools/briefs/ecosystem/ proposes the topics.
//
// Privacy (this repo's DATAWORKS rules on top of SmartCiti.X's): a learner event is emitted only for an eligible, opted-in
// adult session (signed in, not demo, not K-12, adult attested, opted in); the learner id must already be a pseudonym
// (the adapter refuses anything that looks like an email or a name); affect, mood and free-text fields are stripped;
// revoking consent clears everything held. Local only: no network, no storage, nothing is sent. Prefix eco/ECO_.

export const ECO_BUS_SOURCE = { repo: "agifuturefoundation/smartciti.x", commit: "398f28703162f6989d5573019c986df727737cef", files: ["bus/bus.mjs", "bus/telemetry.mjs", "bus/audit.mjs", "bus/README.md"] };
/** From bus/bus.mjs at 398f287: the topic this adapter publishes and its single permitted writer, and the schema version. */
export const ECO_TOPIC = "telemetry.event";
export const ECO_TOPIC_ROLE = "client";
export const ECO_SCHEMA_VERSION = "1.0.0";
/** From bus/telemetry.mjs at 398f287: the verb set, the clock-skew guard and the usable-event floor. */
export const ECO_VERBS = ["attempted", "completed", "failed", "hint_requested", "paused", "resumed", "abandoned", "edited", "control_input", "answered"];
export const ECO_MAX_SKEW_MS = 2 * 60 * 1000;
export const ECO_MIN_USABLE = 3;
export const ECO_ENVELOPE_KEYS = ["event_id", "ts", "clock_skew_ms", "ts_source", "learner_id", "session_id", "context", "verb", "payload"];
export const ECO_CONTEXT_KEYS = ["module_id", "skill_ids", "difficulty", "modality", "device_tier", "scaffold_level"];
export const ECO_AUDIT_KEYS = ["seq", "ts", "actor", "action", "before", "after", "why", "learner", "skill"];
/** Payload keys that never leave: affect (ACP-08), mood, and anything free-text or identifying (DATAWORKS). */
export const ECO_STRIP = /^(affect|emotion|mood|frustration|valence|arousal|name|email|text|note|voice|location|ip)$/i;

/** This repo's learner outcomes → SmartCiti.X verbs. Anything else is refused, never guessed. */
export const ECO_LEARNER_VERBS = { start: "attempted", "step-ok": "answered", "step-wrong": "answered", complete: "completed", fail: "failed", hint: "hint_requested", pause: "paused", resume: "resumed", quit: "abandoned", control: "control_input" };

function ecoFnv(s) { let h = 0x811c9dc5; for (const ch of String(s)) { h ^= ch.codePointAt(0); h = Math.imul(h, 0x01000193) >>> 0; } return h.toString(16).padStart(8, "0"); }
function ecoClean(obj) {
  const out = {};
  for (const [k, v] of Object.entries(obj ?? {})) { if (ECO_STRIP.test(k)) continue; if (v === null || ["number", "boolean"].includes(typeof v) || (typeof v === "string" && v.length <= 64)) out[k] = v; }
  return out;
}
/** The DATAWORKS gate, by the same signals dx-data.js's dxEligibility reads; unknown never emits. */
export function ecoEligible(c = {}) {
  if (c.demo !== false) return { ok: false, reason: "demo" };
  if (c.signedIn !== true) return { ok: false, reason: "signed-out" };
  if (c.k12 !== false) return { ok: false, reason: "k12" };
  if (c.adult !== true) return { ok: false, reason: "age-unknown" };
  if (c.optedIn !== true) return { ok: false, reason: "not-opted-in" };
  return { ok: true, reason: "ok" };
}

/**
 * The adapter. `consent` is the session's signals ({ demo, signedIn, k12, adult, optedIn }); `clock` gives the receipt time
 * in ms (deterministic in tests). Returns { learner, governor, hive, arena, messages, audit, signalsUsable, revoke, stats }.
 */
export function ecoBus({ consent = {}, clock = () => 0, sessionId = null } = {}) {
  let messages = [], audit = [];
  const seen = new Set();
  const stats = { emitted: 0, refused: 0, duplicates: 0, audited: 0, network: 0, physical: 0 };
  const refuse = (reason) => { stats.refused += 1; return { ok: false, reason }; };

  function append(actor, action, { before = null, after = null, why = "", skill = null } = {}) {
    const e = Object.freeze({ seq: audit.length, ts: clock(), actor, action, before, after, why: String(why).slice(0, 240), learner: null, skill });
    audit.push(e); stats.audited += 1; return { ok: true, entry: e };
  }

  /** A learner event: { learnerId (a pseudonym), kind (ECO_LEARNER_VERBS key), station, skills?, difficulty?, latencyMs?, rung?, ts?, modality?, tier? } */
  function learner(ev = {}) {
    const gate = ecoEligible(consent);
    if (!gate.ok) return refuse(gate.reason);
    const id = String(ev.learnerId ?? "");
    if (!/^[a-z0-9][a-z0-9-]{5,40}$/.test(id) || id.includes("@")) return refuse("learner id is not a pseudonym");
    const verb = ECO_LEARNER_VERBS[ev.kind];
    if (!verb) return refuse(`unknown learner event "${ev.kind}"`);
    const receivedAt = clock();
    const clientTs = ev.ts ? Date.parse(ev.ts) : NaN;
    const skew = Number.isFinite(clientTs) ? Math.abs(receivedAt - clientTs) : Infinity;
    const useTs = skew > ECO_MAX_SKEW_MS ? receivedAt : clientTs;
    const payload = ecoClean({ latency_ms: ev.latencyMs, rung: ev.rung, correct: ev.kind === "step-ok" ? true : ev.kind === "step-wrong" ? false : undefined, ...ecoClean(ev.payload) });
    for (const k of Object.keys(payload)) if (payload[k] === undefined) delete payload[k];
    const event_id = `eco:${ecoFnv([id, sessionId, ev.station, ev.kind, ev.seq ?? "", Number.isFinite(clientTs) ? clientTs : ""].join("|"))}:${ev.seq ?? 0}`;
    if (seen.has(event_id)) { stats.duplicates += 1; return { ok: true, duplicate: true, event_id }; }
    seen.add(event_id);
    const envelope = {
      event_id, ts: new Date(useTs).toISOString(), clock_skew_ms: Number.isFinite(skew) ? skew : null, ts_source: skew > ECO_MAX_SKEW_MS ? "server" : "client",
      learner_id: id, session_id: sessionId ?? null,
      context: { module_id: ev.station ?? null, skill_ids: Array.isArray(ev.skills) ? ev.skills.map(String) : [], difficulty: Number.isFinite(ev.difficulty) ? ev.difficulty : null, modality: ev.modality ?? "quiz", device_tier: ev.tier ?? "standard", scaffold_level: Number.isFinite(ev.scaffold) ? ev.scaffold : 0 },
      verb, payload,
    };
    const msg = Object.freeze({ topic: ECO_TOPIC, role: ECO_TOPIC_ROLE, schema_version: ECO_SCHEMA_VERSION, event_id, payload: envelope });
    messages.push(msg); stats.emitted += 1;
    return { ok: true, message: msg };
  }

  /** A VBRIDGE governor decision (vb-governor.js check() result plus the command it judged). Physical targets are refused upstream; the adapter records 0. */
  function governor(decision = {}, cmd = {}) {
    if (!["allow-sim", "refuse"].includes(decision.decision)) return refuse("not a governor decision");
    if (cmd.target && cmd.target.kind !== "sim" && decision.decision !== "refuse") return refuse("physical dispatch is never emitted");
    return append("governor", `governor.${decision.decision}`, { after: { reasons: (decision.reasons ?? []).slice(0, 8), site: cmd.siteId ?? null, task: cmd.taskType ?? null, agent: cmd.agentId ?? null, line: decision.line?.seq ?? null }, why: decision.text ?? decision.primary ?? "" });
  }

  /** An Omega Hive event (oh-hive.js: speak, move, bid, award, dispatch, refused, approval-request, complete, mood). */
  function hive(ev = {}) {
    if (!ev.type || !ev.agent) return refuse("hive event without type or agent");
    return append(`software-agent:${ev.agent}`, `hive.${ev.type}`, { after: ecoClean({ t: ev.t, to: ev.to, jobId: ev.jobId, reason: ev.reason }), why: ev.caption ?? ev.reason ?? "" });
  }

  /** An arena result row (ra-arena.js raRun/raLeaderboard: model, scenario, successes of n held-out seeds, Wilson interval). */
  function arena(row = {}) {
    if (!row.modelId || !row.scenarioId || !Number.isFinite(row.n)) return refuse("arena row without model, scenario or n");
    return append("arena", "arena.result", { after: { model: row.modelId, scenario: row.scenarioId, k: row.k ?? null, n: row.n, lo: row.lo ?? null, hi: row.hi ?? null, physical: 0 }, why: `${row.modelId} on ${row.scenarioId}: ${row.k ?? "?"}/${row.n} (simulated)` });
  }

  /** The ACP-01 floor, as telemetry.mjs states it: under three usable events, no profile update. */
  function signalsUsable(learnerId) {
    const n = new Set(messages.filter((m) => m.payload.learner_id === learnerId).map((m) => m.event_id)).size;
    return n >= ECO_MIN_USABLE ? { usable: true, n } : { usable: false, n, reason: "silence is not evidence" };
  }

  /** Revoking consent deletes every learner message held; robot-side audit entries carry no learner and stay. */
  function revoke() { messages = []; seen.clear(); consent = { ...consent, optedIn: false }; return { ok: true, remaining: messages.length }; }

  return { learner, governor, hive, arena, signalsUsable, revoke, messages: () => messages.slice(), audit: () => audit.slice(), stats };
}

/** The documented message shape (bus/bus.mjs + telemetry.mjs at 398f287). Returns a list of problems; empty means valid. */
export function ecoValidateMessage(m) {
  const p = [];
  if (!m || typeof m !== "object") return ["not an object"];
  for (const k of ["topic", "role", "schema_version", "event_id", "payload"]) if (!(k in m)) p.push(`missing ${k}`);
  if (m.topic !== ECO_TOPIC) p.push(`topic ${m.topic} is not ${ECO_TOPIC}`);
  if (m.role !== ECO_TOPIC_ROLE) p.push(`role ${m.role} may not publish ${m.topic}`);
  if (m.schema_version !== ECO_SCHEMA_VERSION) p.push("schema_version");
  const e = m.payload ?? {};
  const keys = Object.keys(e);
  if (keys.join() !== ECO_ENVELOPE_KEYS.join()) p.push(`envelope keys ${keys.join()}`);
  if (Object.keys(e.context ?? {}).join() !== ECO_CONTEXT_KEYS.join()) p.push("context keys");
  if (e.event_id !== m.event_id) p.push("event_id differs");
  if (!e.learner_id) p.push("missing learner_id");
  if (!ECO_VERBS.includes(e.verb)) p.push(`verb ${e.verb}`);
  if (!["client", "server"].includes(e.ts_source)) p.push("ts_source");
  if (Number.isNaN(Date.parse(e.ts))) p.push("ts");
  if (!Array.isArray(e.context?.skill_ids)) p.push("skill_ids");
  for (const k of Object.keys(e.payload ?? {})) if (ECO_STRIP.test(k)) p.push(`payload carries ${k}`);
  return p;
}

/** The documented audit entry shape (bus/audit.mjs at 398f287), plus this repo's rule that robot-side entries carry no learner. */
export function ecoValidateAudit(a) {
  const p = [];
  if (!a || typeof a !== "object") return ["not an object"];
  if (Object.keys(a).join() !== ECO_AUDIT_KEYS.join()) p.push(`keys ${Object.keys(a).join()}`);
  if (!a.actor || !a.action) p.push("actor and action are required");
  if (!Number.isInteger(a.seq)) p.push("seq");
  if (a.learner !== null) p.push("robot-side entry names a learner");
  if (a.after && a.after.physical && a.after.physical !== 0) p.push("physical");
  return p;
}
