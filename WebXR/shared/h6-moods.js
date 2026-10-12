// HIVE-6 — agents with moods and a morning briefing (console `h6`, docs/consoles/HIVE-6.md). SmartCiti.X Holodeck · Powered by AGI Corp.
//
// Moods from the day. Each agent carries a mood derived ONLY from the hive's own events (h6MoodTracker):
//   calm       the start of the day, and whatever follows a quiet spell;
//   busy       the agent holds two jobs or more (read from the hive's own job list when an event about the agent arrives);
//   concerned  a refusal names the agent: the governor refused the job it won, the steward vetoed it (the steward too, as the one
//              who vetoed), or the learner declined a job it was holding or asking about (the consent keeper too);
//   relieved   a clean audit (the auditor's chain check came back intact) while the agent was concerned.
// Concerned lasts H6_MOOD_RULES.concernedMin hive minutes after its last refusal, relieved H6_MOOD_RULES.relievedMin; then calm.
// Every change is a `mood` event { t, type: "mood", agent, mood, from, cause } whose cause names the hive event it comes from
// (type, t, jobId, reason, or the held job ids for busy, or the mood that ran out for calm), so a grounding check can re-find it
// (tools/check_hive6.mjs). The figures can use the mood event; nothing else is inferred or invented.
//
// The mood shows in three places, all off unless ohHive({ moods: true }):
//   * lines: a short mood phrase in the speaker's register and language joins the line as a clause when it fits the speaker's
//     band (never on a safety line: refusals, vetoes, halts, approvals, declines, coaching, a broken chain or supervision lines
//     carry no mood phrase at all, so a safety line never sounds casual);
//   * voice: h6MoodVoice shifts the agent's rate and pitch by at most H6_VOICE_SHIFT (the gentle band), clamped inside
//     H6_VOICE_BAND; on a safety line the voice never goes faster or higher than the agent's own;
//   * the speak event carries `mood` and `moodCause`, and the mood events themselves.
// The morning briefing (ohHive({ briefing: true }).brief()): see h6BriefFirstJobs and oh-hive.js.
// No network, no model call: the phrases are fixed per mood and register, and each one only says what the cause says.
//
// Every top-level name starts with `h6`/`H6_` (the bundler shares one scope). This module imports nothing.

export const H6_MOODS = Object.freeze(["calm", "busy", "concerned", "relieved"]);
export const H6_MOOD_RULES = Object.freeze({ busyLoad: 2, concernedMin: 30, relievedMin: 20 });
/** Kinds of line that are about safety: they never carry a mood phrase, and their voice never goes faster or higher. */
export const H6_SAFETY_KINDS = Object.freeze(["refused", "veto", "halted", "approval", "approved", "declined", "coach", "audit_broken", "supervise", "supervise_on", "standing", "wait", "question", "question_far", "question_load", "answer", "brief_steward", "brief_keeper", "brief_keeper_sup"]);
/** The mood phrases, by language, mood and register. Each says only what its cause says (a full queue, a refusal, a clean audit). */
export const H6_MOOD_PHRASES = Object.freeze({
  en: Object.freeze({
    busy: Object.freeze({ formal: Object.freeze(["with a full queue", "while my queue is full"]), casual: Object.freeze(["plenty on my plate", "hands full right now"]) }),
    concerned: Object.freeze({ formal: Object.freeze(["mindful of the last refusal", "with care after that refusal"]), casual: Object.freeze(["watching closely after that refusal", "careful after that refusal"]) }),
    relieved: Object.freeze({ formal: Object.freeze(["with the audit clean", "glad the audit came back clean"]), casual: Object.freeze(["good to see a clean audit", "relieved the audit is clean"]) }),
  }),
  // HIVE-7: the Spanish re-read for fluency by a software agent (not a native speaker): "con las manos ocupadas" (busy), a casual
  // concerned pair that no longer repeats the formal one, "más tranquilo" (relieved). A native speaker's review is still open.
  es: Object.freeze({
    busy: Object.freeze({ formal: Object.freeze(["con la cola llena", "con mi cola completa"]), casual: Object.freeze(["con mucho entre manos", "con las manos ocupadas"]) }),
    concerned: Object.freeze({ formal: Object.freeze(["atento al último rechazo", "con cuidado tras ese rechazo"]), casual: Object.freeze(["con los ojos bien abiertos tras ese rechazo", "con más cuidado tras ese rechazo"]) }),
    relieved: Object.freeze({ formal: Object.freeze(["con la auditoría limpia", "con la auditoría en orden"]), casual: Object.freeze(["qué bien, auditoría limpia", "más tranquilo con la auditoría limpia"]) }),
  }),
});
/** The gentle band: a mood moves rate and pitch by at most this much, and never outside H6_VOICE_BAND. */
export const H6_VOICE_SHIFT = Object.freeze({ rate: 0.05, pitch: 0.05 });
export const H6_VOICE_BAND = Object.freeze({ rate: Object.freeze([0.85, 1.15]), pitch: Object.freeze([0.85, 1.2]) });
export const H6_MOOD_VOICE = Object.freeze({ calm: Object.freeze({ rate: 0, pitch: 0 }), busy: Object.freeze({ rate: 0.04, pitch: 0.01 }), concerned: Object.freeze({ rate: -0.04, pitch: -0.03 }), relieved: Object.freeze({ rate: 0.01, pitch: 0.03 }) });
/** The briefing: who may brief (the hive's first minutes) and how far the briefing looks ahead on the hive's own seeded queue. */
export const H6_BRIEF = Object.freeze({ window: 30, lookahead: 120, firstHour: 60 });

const h6Clamp = (v, [lo, hi]) => Math.min(hi, Math.max(lo, v));
const h6R2 = (n) => Math.round(n * 100) / 100;

/** The voice for a line said in a mood: the agent's own rate and pitch, moved inside the gentle band; a safety line never brighter. */
export function h6MoodVoice(agent, mood = "calm", kind = null) {
  const base = agent?.voice ?? {};
  const r0 = Number(base.rate ?? 1), p0 = Number(base.pitch ?? 1);
  const d = H6_MOOD_VOICE[mood] ?? H6_MOOD_VOICE.calm;
  let rate = h6R2(h6Clamp(r0 + h6Clamp(d.rate, [-H6_VOICE_SHIFT.rate, H6_VOICE_SHIFT.rate]), H6_VOICE_BAND.rate));
  let pitch = h6R2(h6Clamp(p0 + h6Clamp(d.pitch, [-H6_VOICE_SHIFT.pitch, H6_VOICE_SHIFT.pitch]), H6_VOICE_BAND.pitch));
  if (kind && H6_SAFETY_KINDS.includes(kind)) { rate = Math.min(rate, r0); pitch = Math.min(pitch, p0); }
  return { rate, pitch };
}
/** The agent as it speaks a line in a mood (a copy whose voice carries the shifted rate and pitch). */
export function h6VoicedAgent(agent, mood = "calm", kind = null) {
  if (!agent?.voice || !mood || mood === "calm") return agent;
  const v = h6MoodVoice(agent, mood, kind);
  return { ...agent, voice: { ...agent.voice, rate: v.rate, pitch: v.pitch } };
}

const h6Words = (s) => String(s ?? "").split(/\s+/).filter((w) => /[\p{L}\p{N}]/u.test(w));
function h6Fnv(s) { let h = 2166136261; for (const ch of String(s)) { h ^= ch.charCodeAt(0); h = Math.imul(h, 16777619) >>> 0; } return h; }

/**
 * A line with its mood phrase: joined as a clause to the first sentence that stays inside the speaker's band, else unchanged.
 * Calm adds nothing; a safety kind adds nothing. Returns { text, phrase } (phrase null when none was added).
 */
export function h6WithMood(agent, kind, text, mood, { t = 0, jobId = "" } = {}) {
  const s = String(text ?? "");
  if (!s || !mood || mood === "calm" || H6_SAFETY_KINDS.includes(kind)) return { text: s, phrase: null };
  const lang = agent?.lang === "es" ? "es" : "en";
  const reg = agent?.style?.register === "formal" ? "formal" : "casual";
  const pool = H6_MOOD_PHRASES[lang]?.[mood]?.[reg] ?? [];
  if (!pool.length) return { text: s, phrase: null };
  const phrase = pool[h6Fnv(`${agent?.id}|${kind}|${t}|${jobId}|${mood}`) % pool.length];
  const hi = (agent?.style?.band ?? [6, 14])[1];
  const parts = s.split(/(?<=[.!?])\s+/);
  for (let i = 0; i < parts.length; i += 1) {
    const m = /^(.*?)([.!?])$/.exec(parts[i]);
    if (!m) continue;
    if (h6Words(m[1]).length + h6Words(phrase).length > hi) continue;
    parts[i] = `${m[1]}, ${phrase}${m[2]}`;
    return { text: parts.join(" "), phrase };
  }
  return { text: s, phrase: null };
}

/**
 * The mood of every agent, from the hive's own events. `heldBy(agentId)` returns the job ids the agent holds now (the hive's own
 * job list); `steward`, `keeper` and `auditor` are agent ids. observe(event) and tick(t) return the mood changes to emit.
 */
export function h6MoodTracker({ agents = [], heldBy = () => [], steward = null, keeper = null, auditor = null } = {}) {
  const st = new Map(agents.map((a) => [a.id, { mood: "calm", since: 0, cause: { type: "start", t: 0 } }]));
  const set = (id, mood, t, cause, out) => {
    const s = st.get(id); if (!s) return;
    if (s.mood === mood && mood !== "concerned") return;
    const from = s.mood;
    s.since = t; s.cause = cause;
    if (from === mood) return; // a fresh refusal while concerned renews the time, without a new change
    s.mood = mood;
    out.push({ type: "mood", agent: id, mood, from, cause });
  };
  const busyCheck = (id, t, e, out) => {
    const s = st.get(id); if (!s || s.mood === "concerned" || s.mood === "relieved") return;
    const held = (heldBy(id) ?? []).slice();
    if (held.length >= H6_MOOD_RULES.busyLoad && s.mood !== "busy") set(id, "busy", t, { type: e.type, t, jobId: e.jobId ?? null, held }, out);
    else if (held.length < H6_MOOD_RULES.busyLoad && s.mood === "busy") set(id, "calm", t, { type: e.type, t, jobId: e.jobId ?? null, held }, out);
  };
  return {
    observe(e) {
      const out = [];
      if (!e || e.type === "mood") return out;
      const t = e.t ?? 0;
      if (e.type === "refused") {
        const cause = { type: "refused", t, jobId: e.jobId ?? null, reason: e.veto ?? e.reason ?? null, by: e.by ?? null };
        const who = new Set([e.agent, e.winner].filter(Boolean));
        if (e.by === "steward" && steward) who.add(steward);
        if (e.by === "supervisor" && keeper) who.add(keeper);
        for (const id of who) set(id, "concerned", t, cause, out);
        return out;
      }
      if (e.type === "speak" && e.ok === true && (e.about === "audit" || (e.about === "report" && e.exchange?.turn === 0))) {
        const cause = { type: "audit", t, jobId: e.jobId ?? null, lines: e.lines ?? null, by: e.agent };
        for (const [id, s] of st) if (s.mood === "concerned") set(id, "relieved", t, cause, out);
        return out;
      }
      if (["award", "dispatch", "complete", "move"].includes(e.type) && e.agent) busyCheck(e.agent, t, e, out);
      return out;
    },
    tick(t) {
      const out = [];
      for (const [id, s] of st) {
        if (s.mood === "concerned" && t - s.since >= H6_MOOD_RULES.concernedMin) set(id, "calm", t, { type: "expired", t, mood: "concerned", since: s.since, of: s.cause }, out);
        else if (s.mood === "relieved" && t - s.since >= H6_MOOD_RULES.relievedMin) set(id, "calm", t, { type: "expired", t, mood: "relieved", since: s.since, of: s.cause }, out);
      }
      return out;
    },
    mood(id) { return st.get(id)?.mood ?? "calm"; },
    cause(id) { return st.get(id)?.cause ?? null; },
    all() { return [...st].map(([id, s]) => ({ agent: id, mood: s.mood, since: s.since, cause: s.cause })); },
  };
}

/**
 * The briefing's first jobs: each agent's first award, read from the hive's own award events (the live hive's, when it has
 * already awarded one, else a look-ahead of the same seeded day: a second hive with the same seed, jobs and options run on its
 * own, which is the hive's own queue played forward, not a guess). Returns Map(agentId -> award event).
 */
export function h6BriefFirstJobs(liveEvents = [], lookahead = null, steps = H6_BRIEF.lookahead) {
  const first = new Map();
  for (const e of liveEvents) if (e.type === "award" && !first.has(e.agent)) first.set(e.agent, e);
  if (lookahead) {
    for (let i = 0; i < steps; i += 1) {
      for (const e of lookahead.step()) if (e.type === "award" && !first.has(e.agent)) first.set(e.agent, { ...e, ahead: true });
    }
  }
  return first;
}
