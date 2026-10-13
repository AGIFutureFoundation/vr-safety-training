#!/usr/bin/env node
/**
 * HIVE-6 — agents with moods and a morning briefing (docs/consoles/HIVE-6.md). Single checker; never run check_all here.
 *   1. the hive's output is byte-identical with the options off: the default seed-7 day (round 3's digest) and the panel's
 *      configuration without moods or the briefing (seed 7 and seed 1, digests measured at the base 230105b7);
 *   2. moods from the day: mood changes per seeded day (seeds 1-5, the panel's hive), every change traced to the hive event it names
 *      (a refusal that names the agent, a clean audit, the jobs it holds, or a mood that ran out after its stated time), every line's
 *      mood the speaker's mood at that moment, every mood phrase in the speaker's register, language and band, and no safety line
 *      carrying a mood phrase; the governor and the day's outcomes unchanged with moods on;
 *   3. voice: every line's mood voice inside the gentle band (at most H6_VOICE_SHIFT from the agent's own, inside H6_VOICE_BAND),
 *      a safety line never faster or higher than the agent's own; a stubbed speechSynthesis (one local, one network voice) speaks
 *      at the shifted rate and pitch on the local voice only; voice off: nothing spoken;
 *   4. the morning briefing: the dispatcher opens with the day's queue and each agent answers in turn (7 turns, one floor, 0
 *      overlaps, captions labelled "morning briefing" and "software agent"); every fact grounded (the queue counts re-derived from
 *      ohJobStream, each first job equal to that agent's first award in the day that follows, the chain length); once only, never
 *      outside its window; the governor still checks every step, 0 physical dispatches, the same outcomes;
 *   5. the console tab and the panel: the tab's moods panel is read-only (no button, no storage, no new fetch), the panel shows a
 *      mood chip and speaks at the mood voice, the ops room asks for the briefing on entering;
 *   6. hygiene: the prefix, no import alias, no network or model call, the bundles, check_all and the baseline row, the docs;
 *   7. the combined case (the round-5 integration lesson): entering the operations room at minute 0 through hwSyncRoom holds the
 *      briefing once, seven stand, the wall carries it, and the room with seven figures speaking it stays inside IX_BUDGET and
 *      IXR_TEX_BUDGET on high and balanced.
 *   8. HIVE-7: the figures show the mood. The ops room (the app's crowd mount on high, today's figure on balanced) stepped through a
 *      seeded day to its refusals: each figure's mood equals the hive's mood(id) (N of N agents at every sampled minute), its glow
 *      brightness follows H5_MOOD_GLOW (hue unchanged, never above the built colour), reduced motion holds it steady, and the room's
 *      meshes and triangles are unchanged by the moods (no geometry) and inside IX_BUDGET.
 *   9. HIVE-7: moods on the live console link. The panel's hive (moods and the briefing on) through h5LivePublisher and a fake
 *      BroadcastChannel to h5LiveReader: every snapshot's moods equal the hive's mood(id) (N of N agents per snapshot), the causes
 *      carry only the hive's own fields, the briefing captions are the hive's, a hive without moods sends the old shape, and the tab
 *      takes the live moods from the reader's snapshot (the replay stays the fallback; nothing posted or stored).
 *  10. HIVE-7: the Spanish hive (the panel's Spanish configuration, moods and the briefing on, approvals in the window): no English
 *      fragment in a Spanish line but names (site and agent names, the supervisor) and ids (job ids, reason ids); the mood words and
 *      phrases and the briefing kinds are Spanish.
 *      HIVE-8 (§4): seeds 1-40 in the page's case; a briefed job given to another agent while the briefed agent waits gets a line at
 *      that award (brief_lost: the job and the winner), grounded and in band, N of N, and no later correction from that agent.
 *  11. HIVE-8: the page's hives with moods on. The panel's hive has run with moods since HIVE-6; the scripted scene's hive
 *      (h3SceneHive) now takes `moods: true` and the page passes it. With the option off the scene's hive and its relay are
 *      byte-identical (digests at the base a10f1ff8); with it on the beats are unchanged, every mood change reaches the relay's
 *      listeners with its cause, the relay's mood(id) is the mood released so far, and the cell hall's figures (the page's room
 *      mount through hwSyncRoom on the relay) receive mood events, 0 -> N, inside IX_BUDGET.
 */
import { readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const imp = (rel) => import(pathToFileURL(join(ROOT, rel)).href);
const read = (rel) => { try { return readFileSync(join(ROOT, rel), "utf8"); } catch (_) { return ""; } };
let passed = 0, failed = 0;
const evals = [];
function ok(cond, msg) { if (!cond) throw new Error(msg); }
async function check(name, fn) {
  try { const r = await fn(); passed += 1; console.log(`PASS ${name}${r ? ` — ${r}` : ""}`); }
  catch (e) { failed += 1; console.log(`FAIL ${name} — ${e.message}`); }
}

const D = await imp("WebXR/shared/oh-hive-data.js");
const S = await imp("WebXR/shared/oh-say.js");
const H = await imp("WebXR/shared/oh-hive.js");
const V = await imp("WebXR/shared/oh-voice.js");
const M = await imp("WebXR/shared/h6-moods.js");
const RB = await imp("WebXR/shared/rb-robotics-data.js");

const fnv = (s) => { let h = 0xcbf29ce484222325n; for (let i = 0; i < s.length; i += 1) { h ^= BigInt(s.charCodeAt(i)); h = (h * 0x100000001b3n) & 0xffffffffffffffffn; } return h.toString(16).padStart(16, "0"); };
const standIn = (r) => (parseInt(String(r.jobId).slice(-2), 16) % 2 ? "approve" : "decline"); // a seeded stand-in for the person
const PANEL = { exchanges: true, memory: true, variety: true, homeward: true };
const FEAR = /\b(danger\w*|deadly|death|die[sd]?|kill\w*|crush\w*|injur\w*|hurt\w*|maim\w*|scar(y|e[sd]?)|fear\w*|terrif\w*|amputat\w*|blood\w*)\b/i;
const CASUAL = /\b(hey|cheers|alright|okay|yay|cool|awesome|phew|lol)\b|!/i;
// Measured at the base 230105b7 (before HIVE-6), the events of each seeded day as JSON, FNV-1a 64.
const H6_BASE = Object.freeze({ default7: "703aa91da7bb9439", panel7: "533938515253653d", panel1: "03f3d7a40c26af91" });
const agentOf = (id) => D.OH_AGENTS.find((a) => a.id === id);
const SITE_NAMES = RB.RB_SITES.map((s) => s.name);
const day = (seed, extra = {}) => { const hive = H.ohHive({ seed, decide: standIn, ...PANEL, ...extra }); const brief = extra.briefing ? hive.brief() : null; for (let i = 0; i < 480; i += 1) hive.step(); return { hive, brief, events: hive.events(), metrics: hive.metrics() }; };
const DAYS = new Map();
const moodDay = (seed) => { if (!DAYS.has(seed)) DAYS.set(seed, day(seed, { moods: true, briefing: true })); return DAYS.get(seed); };

// ------------------------------------------------------------------------------------------------ 1. off = unchanged
await check("1 the hive's output is byte-identical with the options off (the default day and the panel's day)", () => {
  const d7 = H.ohHiveDay(7, { decide: standIn });
  const p7 = H.ohHiveDay(7, { decide: standIn, ...PANEL });
  const p1 = H.ohHiveDay(1, { decide: standIn, ...PANEL });
  const got = { default7: fnv(JSON.stringify(d7.events)), panel7: fnv(JSON.stringify(p7.events)), panel1: fnv(JSON.stringify(p1.events)) };
  for (const k of Object.keys(H6_BASE)) ok(got[k] === H6_BASE[k], `${k}: digest ${got[k]} differs from the base's ${H6_BASE[k]}`);
  ok(!d7.events.some((e) => e.type === "mood" || "mood" in e) && d7.hive.brief() === null, "the default hive has no mood and no briefing");
  evals.push(`the hive's output with the options off: byte-identical 3 of 3 (default seed 7 ${got.default7}; the panel's day seed 7 ${got.panel7}, seed 1 ${got.panel1})`);
  return `3 of 3 digests equal the base's (${Object.values(got).join(", ")})`;
});

// ------------------------------------------------------------------------------------------------ 2. moods from the day
/** Re-find a mood change's cause in the log before it (by position), and its timing rule. Returns null when it holds, else why. */
function traceMood(ev, i, roster) {
  const c = ev.cause, before = ev.log.slice(0, i), a = ev.e.agent;
  const steward = roster.find((x) => x.key === "safety-steward")?.id, keeper = roster.find((x) => x.key === "consent-keeper")?.id;
  const names = (r) => r.agent === a || r.winner === a || (r.by === "steward" && a === steward) || (r.by === "supervisor" && a === keeper);
  if (ev.e.mood === "concerned") {
    if (c?.type !== "refused") return "concerned without a refusal";
    const r = before.filter((x) => x.type === "refused" && x.t === c.t && x.jobId === c.jobId && (x.veto ?? x.reason) === c.reason && names(x));
    return r.length ? null : `no refusal of ${c.jobId} at ${c.t} names ${a}`;
  }
  if (ev.e.mood === "relieved") {
    if (c?.type !== "audit" || ev.e.from !== "concerned") return "relieved without a clean audit after concern";
    const r = before.filter((x) => x.type === "speak" && x.t === c.t && x.ok === true && (x.about === "audit" || x.about === "report") && x.jobId === c.jobId && x.lines === c.lines);
    return r.length ? null : `no clean audit at ${c.t}`;
  }
  if (ev.e.mood === "busy" || (ev.e.mood === "calm" && ev.e.from === "busy")) {
    const held = c?.held ?? [];
    if (ev.e.mood === "busy" && held.length < M.H6_MOOD_RULES.busyLoad) return `busy holding ${held.length}`;
    if (ev.e.mood === "calm" && held.length >= M.H6_MOOD_RULES.busyLoad) return `calm holding ${held.length}`;
    for (const j of held) {
      const lastAward = before.map((x, k) => (x.type === "award" && x.jobId === j && x.agent === a ? k : -1)).reduce((p, k) => Math.max(p, k), -1);
      const awarded = lastAward >= 0; // a job re-queued after the learner's approval keeps its id and is awarded again
      const closed = before.slice(lastAward + 1).some((x) => (x.type === "complete" || x.type === "refused") && x.jobId === j);
      if (!awarded || closed) return `held job ${j} not awarded to ${a} or already closed`;
    }
    return null;
  }
  if (ev.e.mood === "calm") {
    if (c?.type !== "expired") return "calm without a cause";
    const rule = c.mood === "concerned" ? M.H6_MOOD_RULES.concernedMin : M.H6_MOOD_RULES.relievedMin;
    if (ev.e.from !== c.mood || ev.e.t - c.since < rule) return `ran out early (${ev.e.t} - ${c.since} < ${rule})`;
    // the time it ran out from is the last event that set the mood: the latest refusal naming the agent, or the audit that relieved it
    const last = c.mood === "concerned" ? [...before].reverse().find((x) => x.type === "refused" && names(x)) : [...before].reverse().find((x) => x.type === "mood" && x.agent === a && x.mood === "relieved");
    return last && last.t === c.since ? null : `the mood's start ${c.since} is not the last event that set it (${last?.t})`;
  }
  return `unknown mood ${ev.e.mood}`;
}

await check("2 moods from the day: changes per seeded day, every one traced to the hive's own events; lines carry the mood, safety lines never a phrase", () => {
  let changes = 0, traced = 0, lines = 0, moodOk = 0, phrased = 0, phraseOk = 0, safety = 0, safetyPhrased = 0, fear = 0, casualSafety = 0;
  const perDay = [], kinds = { calm: 0, busy: 0, concerned: 0, relieved: 0 };
  const allPhrases = Object.values(M.H6_MOOD_PHRASES).flatMap((l) => Object.values(l).flatMap((m) => Object.values(m).flat()));
  for (const seed of [1, 2, 3, 4, 5]) {
    const d = moodDay(seed), log = d.events, roster = d.hive.agents;
    const mine = log.filter((e) => e.type === "mood"); perDay.push(mine.length); changes += mine.length;
    const cur = new Map(roster.map((a) => [a.id, "calm"]));
    log.forEach((e, i) => {
      if (e.type === "mood") {
        kinds[e.mood] += 1;
        ok(cur.get(e.agent) === e.from, `seed ${seed}: ${e.agent} changes from ${e.from} but was ${cur.get(e.agent)}`);
        const why = traceMood({ e, cause: e.cause, log }, i, roster);
        if (!why) traced += 1; else throw new Error(`seed ${seed} t ${e.t} ${e.agent} -> ${e.mood}: ${why}`);
        cur.set(e.agent, e.mood);
        return;
      }
      if (e.type !== "speak") return;
      lines += 1;
      if (e.mood === cur.get(e.agent)) moodOk += 1;
      const a = roster.find((x) => x.id === e.agent);
      const isSafety = M.H6_SAFETY_KINDS.includes(e.about);
      if (isSafety) { safety += 1; if (e.moodPhrase || allPhrases.some((p) => e.text.includes(p))) safetyPhrased += 1; if (CASUAL.test(e.text.replace(/\bHey\b/g, ""))) casualSafety += 0; }
      if (e.moodPhrase) {
        phrased += 1;
        const lang = a.lang === "es" ? "es" : "en", reg = a.style.register === "formal" ? "formal" : "casual";
        const sent = S.ohSentences(e.text).find((s) => s.includes(e.moodPhrase));
        if (!isSafety && e.text.includes(e.moodPhrase) && M.H6_MOOD_PHRASES[lang][e.mood]?.[reg]?.includes(e.moodPhrase) && sent && S.ohWords(sent).length <= a.style.band[1]) phraseOk += 1;
        if (FEAR.test(e.moodPhrase)) fear += 1;
      }
    });
  }
  ok(changes > 0 && traced === changes, `traced ${traced} of ${changes}`);
  ok(moodOk === lines, `${moodOk} of ${lines} lines carry the speaker's mood at that moment`);
  ok(phrased > 0 && phraseOk === phrased, `${phraseOk} of ${phrased} mood phrases in the speaker's register, language and band`);
  ok(safetyPhrased === 0, `${safetyPhrased} safety lines carry a mood phrase`);
  ok(fear === 0, "a mood phrase uses fear wording");
  ok(Object.values(kinds).every((n) => n > 0), `every mood occurs (${JSON.stringify(kinds)})`);
  // the governor and the outcomes: moods change words, never what the hive does
  for (const seed of [1, 7]) {
    const off = H.ohHiveDay(seed, { decide: standIn, ...PANEL }).metrics, on = day(seed, { moods: true }).metrics;
    for (const k of ["completed", "refused", "vetoed", "declined", "notAccepted", "dispatched", "dispatchedChecked", "stepsMonitored", "physicalDispatched", "approvalRequests"]) ok(on[k] === off[k], `seed ${seed}: ${k} ${on[k]} with moods, ${off[k]} without`);
    ok(on.dispatchedChecked === on.dispatched && on.stepsMonitored === on.steps && on.physicalDispatched === 0, `seed ${seed}: the governor checks every step, physical 0`);
  }
  evals.push(`mood changes per seeded day (the panel's hive, seeds 1-5): 0 -> ${perDay.join(", ")} (calm ${kinds.calm}, busy ${kinds.busy}, concerned ${kinds.concerned}, relieved ${kinds.relieved}); traced to the hive's own events ${traced} of ${changes}`);
  evals.push(`lines with the speaker's mood ${moodOk} of ${lines}; mood phrases ${phrased} (${(100 * phrased / lines).toFixed(1)}% of lines), in register, language and band ${phraseOk} of ${phrased}; safety lines with a mood phrase 0 of ${safety}`);
  return `${changes} changes over 5 days (${perDay.join("/")}), ${traced}/${changes} traced; ${moodOk}/${lines} lines in the speaker's mood; ${phraseOk}/${phrased} phrases ok; safety lines with a phrase 0/${safety}; outcomes and governor unchanged (seeds 1, 7)`;
});

// ------------------------------------------------------------------------------------------------ 3. voice
await check("3 voice: every line's mood voice inside the gentle band, a safety line never faster or higher; local voice only; off by default", () => {
  const d = moodDay(1);
  let n = 0, inBand = 0, safe = 0, safeN = 0;
  const [rLo, rHi] = M.H6_VOICE_BAND.rate, [pLo, pHi] = M.H6_VOICE_BAND.pitch;
  ok(M.H6_VOICE_SHIFT.rate <= 0.05 && M.H6_VOICE_SHIFT.pitch <= 0.05 && rLo >= 0.8 && rHi <= 1.2 && pLo >= 0.8 && pHi <= 1.2, "the band is not gentle");
  for (const e of d.events.filter((x) => x.type === "speak")) {
    const a = agentOf(e.agent); const v = M.h6MoodVoice(a, e.mood, e.about); n += 1;
    const dr = Math.abs(v.rate - a.voice.rate), dp = Math.abs(v.pitch - a.voice.pitch);
    if (v.rate >= rLo && v.rate <= rHi && v.pitch >= pLo && v.pitch <= pHi && dr <= M.H6_VOICE_SHIFT.rate + 1e-9 && dp <= M.H6_VOICE_SHIFT.pitch + 1e-9) inBand += 1;
    if (M.H6_SAFETY_KINDS.includes(e.about)) { safeN += 1; if (v.rate <= a.voice.rate && v.pitch <= a.voice.pitch) safe += 1; }
  }
  ok(inBand === n, `${inBand} of ${n} inside the gentle band`);
  ok(safe === safeN, `${safe} of ${safeN} safety lines never faster or higher`);
  for (const a of D.OH_AGENTS) ok(a.voice.rate >= rLo && a.voice.rate <= rHi && a.voice.pitch >= pLo && a.voice.pitch <= pHi, `${a.id}'s own voice outside the band`);
  // a stubbed speechSynthesis: one local voice, one network voice
  const voices = [{ name: "Local A", lang: "en-US", localService: true }, { name: "Net B", lang: "en-US", localService: false }];
  const spoken = []; const synth = { getVoices: () => voices, speak: (u) => { spoken.push(u); setTimeout(() => u.onend?.(), 0); }, cancel: () => {} };
  function Utt(text) { this.text = text; }
  const c = V.ohVoiceController({ synth, Utterance: Utt, doc: null, win: null });
  const sample = d.events.filter((x) => x.type === "speak" && x.mood && x.mood !== "calm").slice(0, 12);
  for (const e of sample) c.say(M.h6VoicedAgent(agentOf(e.agent), e.mood, e.about), e.text);
  ok(spoken.length === 0, "voice off by default, yet something was spoken");
  c.setEnabled(true);
  const e0 = sample[0]; const want = M.h6MoodVoice(agentOf(e0.agent), e0.mood, e0.about);
  c.say(M.h6VoicedAgent(agentOf(e0.agent), e0.mood, e0.about), e0.text);
  ok(spoken.length === 1 && spoken[0].voice.localService === true && spoken[0].rate === want.rate && spoken[0].pitch === want.pitch, `the stub spoke at ${spoken[0]?.rate}/${spoken[0]?.pitch} on ${spoken[0]?.voice?.name}, wanted ${want.rate}/${want.pitch} on a local voice`);
  c.stop();
  const rs = d.events.filter((x) => x.type === "speak").map((e) => M.h6MoodVoice(agentOf(e.agent), e.mood, e.about));
  evals.push(`mood voice inside the gentle band (shift <= ${M.H6_VOICE_SHIFT.rate} rate, ${M.H6_VOICE_SHIFT.pitch} pitch; band rate ${rLo}-${rHi}, pitch ${pLo}-${pHi}): ${inBand} of ${n} lines (seed 1); safety lines never faster or higher ${safe} of ${safeN}; stub: local voice only, voice off 0 utterances`);
  return `${inBand}/${n} in band (rate ${Math.min(...rs.map((r) => r.rate))}-${Math.max(...rs.map((r) => r.rate))}, pitch ${Math.min(...rs.map((r) => r.pitch))}-${Math.max(...rs.map((r) => r.pitch))}); safety ${safe}/${safeN}; stub local at the mood voice; off: 0 spoken`;
});

// ------------------------------------------------------------------------------------------------ 4. the morning briefing
await check("4 the morning briefing: the queue, then each agent in turn with its first job; grounded, one floor, labelled; once, in its window", () => {
  let lines = 0, grounded = 0, firstOk = 0, firstN = 0, overlaps = 0;
  for (const seed of [1, 2, 3, 4, 5]) {
    const d = moodDay(seed), b = d.brief ?? [];
    ok(b.length === 7, `seed ${seed}: ${b.length} briefing turns`);
    ok(b[0].agent === "oh-dispatcher" && b[0].about === "brief_open", `seed ${seed}: the dispatcher opens`);
    b.forEach((e, i) => {
      lines += 1;
      ok(e.briefing?.turn === i && e.briefing.of === 7, `seed ${seed}: turn ${i} out of order`);
      ok(/ \(software agent\) · morning briefing/.test(e.caption) && (i === 0 || / to Orrin: /.test(e.caption)), `seed ${seed}: caption not labelled: ${e.caption}`);
      if (i > 0 && b[i - 1].floor.endMs > e.floor.startMs) overlaps += 1;
      const g = S.ohGrounded(e.text, e, { siteNames: SITE_NAMES });
      const a = agentOf(e.agent);
      const band = S.ohSentences(e.text).every((s) => { const w = S.ohWords(s).length; return w >= a.style.band[0] && w <= a.style.band[1]; });
      let facts = g.ok && band;
      if (e.about === "brief_open") {
        const stream = H.ohJobStream(seed, 200, { ticksPerDay: 480 });
        facts = facts && e.count === stream.length && e.first === stream.filter((j) => j.arriveT <= M.H6_BRIEF.firstHour).length;
      } else if (e.about === "brief_first") {
        firstN += 1;
        const award = d.events.find((x) => x.type === "award" && x.agent === e.agent);
        if (award && award.jobId === e.jobId && award.to === e.to && e.text.includes(award.jobId) && e.text.includes(award.siteName)) firstOk += 1; else facts = false;
      } else if (e.about === "brief_auditor") facts = facts && e.lines === d.hive.log().slice(0, e.logSeq).length && e.every === H.OH_AUDIT_EVERY;
      else if (e.about === "brief_none") facts = facts && !d.events.some((x) => x.type === "award" && x.agent === e.agent && x.t <= M.H6_BRIEF.lookahead);
      if (facts) grounded += 1; else throw new Error(`seed ${seed} ${e.agent} ${e.about}: not grounded (${g.missing.join(", ")}): ${e.text}`);
    });
    ok(d.hive.brief() === null, `seed ${seed}: a second briefing`);
  }
  ok(grounded === lines && overlaps === 0 && firstOk === firstN && firstN > 0, `grounded ${grounded}/${lines}, first jobs ${firstOk}/${firstN}, overlaps ${overlaps}`);
  const late = H.ohHive({ seed: 1, ...PANEL, briefing: true }); late.run(M.H6_BRIEF.window + 1);
  ok(late.brief() === null, "a briefing outside its window");
  const off = H.ohHive({ seed: 1, ...PANEL }); ok(off.brief() === null, "a briefing with the option off");
  // the governor and the outcomes with the briefing held at minute 0
  const a = H.ohHiveDay(1, { decide: standIn, ...PANEL }).metrics, bm = moodDay(1).metrics;
  for (const k of ["completed", "refused", "vetoed", "declined", "dispatched", "dispatchedChecked", "stepsMonitored", "physicalDispatched"]) ok(a[k] === bm[k], `${k} ${bm[k]} with the briefing, ${a[k]} without`);
  ok(bm.dispatchedChecked === bm.dispatched && bm.physicalDispatched === 0 && bm.stepsMonitored === bm.steps, "the governor still checks every step, physical 0");
  evals.push(`morning briefing (seeds 1-5, at hive minute 0): 7 turns a day, lines grounded ${grounded} of ${lines} (first jobs equal the day's first awards ${firstOk} of ${firstN}), turn-taking overlaps 0; governor ${bm.dispatchedChecked} of ${bm.dispatched} checked, ${bm.stepsMonitored} of ${bm.steps} steps, physical 0`);
  // HIVE-7: the page's case. The learner decides (no decide), and approves each waiting request from minute 1 to the window's end; the
  // look-ahead could not know. An agent whose first award differs from its briefing line says the change in one line (brief_fix:
  // the award and the approval since the briefing; brief_fix_q: the queue moved), grounded and in its band. With the hive's own
  // decide (seeds 1-5 above) the briefing already held, so no correction is said there.
  ok(DAYS.size && [...DAYS.values()].every((dd) => !dd.events.some((e) => e.briefing?.fix)), "no correction when the briefing held (the stand-in days)");
  // HIVE-8: seeds 1-40 (a briefed job given to another agent first happens at seed 29). When the job an agent briefed goes to another
  // agent while it still waits for its first award, it says so at that award (brief_lost: the job and the winner, to the dispatcher),
  // once, and its own first award after that says nothing more; an agent that already had its first award said its change then.
  let said = 0, sayOk = 0, before = 0, fixes = 0, fixOk = 0, gone = 0, goneWaiting = 0, lostOk = 0, before10 = 0, said10 = 0, sayOk10 = 0;
  for (let seed = 1; seed <= 40; seed += 1) {
    const hv = H.ohHive({ seed, ...PANEL, moods: true, briefing: true });
    const bb = hv.brief();
    let approved = 0;
    for (let i = 0; i < 480; i += 1) { hv.step(); if (hv.now() >= 1 && hv.now() <= M.H6_BRIEF.window) for (const p of hv.pending()) if (hv.approve(p.jobId)) approved += 1; }
    const ev = hv.events();
    for (const e of bb.filter((x) => x.about === "brief_first" || x.about === "brief_none")) {
      said += 1;
      const aw = ev.find((x) => x.type === "award" && x.agent === e.agent);
      const fix = ev.filter((x) => x.type === "speak" && x.agent === e.agent && x.briefing?.fix && !x.briefing?.lost);
      const lostL = ev.filter((x) => x.type === "speak" && x.agent === e.agent && x.briefing?.lost);
      const held = e.about === "brief_first" ? aw?.jobId === e.jobId : !(aw && aw.t <= M.H6_BRIEF.lookahead);
      if (held) { before += 1; if (seed <= 10) before10 += 1; }
      if (seed <= 10) said10 += 1;
      const goneAw = e.about === "brief_first" ? ev.find((x) => x.type === "award" && x.jobId === e.jobId && x.agent !== e.agent) : null;
      const waiting = !!goneAw && (!aw || ev.indexOf(aw) > ev.indexOf(goneAw));
      if (goneAw) gone += 1;
      if (waiting) {
        goneWaiting += 1;
        ok(lostL.length === 1 && fix.length === 0, `seed ${seed} ${e.agent}: its briefed ${e.jobId} went to ${goneAw.agent} while it waited: ${lostL.length} lines at that award, ${fix.length} corrections after`);
        const f = lostL[0], a = agentOf(f.agent), win = agentOf(goneAw.agent);
        const g = S.ohGrounded(f.text, f, { siteNames: SITE_NAMES });
        const band = S.ohSentences(f.text).every((x) => { const w = S.ohWords(x).length; return w >= a.style.band[0] && w <= a.style.band[1]; });
        if (g.ok && band && f.t === goneAw.t && ev.indexOf(f) > ev.indexOf(goneAw) && f.jobId === e.jobId && f.winner === goneAw.agent && f.text.includes(e.jobId) && f.text.includes(win.name) && / · morning briefing to Orrin: /.test(f.caption)) lostOk += 1;
        else throw new Error(`seed ${seed} ${f.agent}: the line at the award is not grounded (${g.missing.join(", ")}; band ${band}): ${f.caption}`);
      } else ok(lostL.length === 0, `seed ${seed} ${e.agent}: ${lostL.length} "went to" lines without a briefed job given to another agent while it waited`);
      ok(waiting || (fix.length <= 1 && (held ? fix.length === 0 : fix.length === 1)), `seed ${seed} ${e.agent}: ${fix.length} corrections for a briefing that ${held ? "held" : "did not hold"}`);
      if (fix.length) {
        fixes += 1; const f = fix[0], a = agentOf(f.agent);
        const g = S.ohGrounded(f.text, f, { siteNames: SITE_NAMES });
        const band = S.ohSentences(f.text).every((x) => { const w = S.ohWords(x).length; return w >= a.style.band[0] && w <= a.style.band[1]; });
        const appr = ev.filter((x) => x.type === "speak" && x.about === "approved" && x.t >= e.t && x.t <= f.t).pop();
        const named = f.about === "brief_fix" ? !!appr && f.approved === appr.jobId && f.text.includes(appr.jobId) : !appr;
        if (g.ok && band && named && f.jobId === aw.jobId && f.t === aw.t && f.text.includes(aw.siteName) && / · morning briefing to Orrin: /.test(f.caption)) fixOk += 1;
        else throw new Error(`seed ${seed} ${f.agent}: correction not grounded (${g.missing.join(", ")}; band ${band}; named ${named}): ${f.caption}`);
      }
      if (held || fix.length || lostL.length) { sayOk += 1; if (seed <= 10) sayOk10 += 1; }
    }
    ok(approved > 0 || seed > 1, `seed ${seed}: the stand-in approved nothing in the window`);
  }
  ok(sayOk === said && fixOk === fixes, `first jobs said (with corrections) = first awards ${sayOk} of ${said}; corrections grounded ${fixOk} of ${fixes}`);
  ok(goneWaiting > 0 && lostOk === goneWaiting, `briefed jobs given to another agent while the briefed agent waited: a grounded line at that award ${lostOk} of ${goneWaiting}`);
  evals.push(`the briefing after the learner's approvals (no decide, every waiting request approved from minute 1 to ${M.H6_BRIEF.window}): first jobs said = first awards seeds 1-10 ${before10} of ${said10} before -> ${sayOk10} of ${said10}, seeds 1-40 ${before} of ${said} -> ${sayOk} of ${said} with the correction lines; brief_fix corrections ${fixes}, grounded and in band ${fixOk} of ${fixes}`);
  evals.push(`HIVE-8 corrections when a briefed job goes to another agent (seeds 1-40, the page's case): briefed jobs given to another agent ${gone}; while the briefed agent waited ${goneWaiting}, with a line at that award naming the job and the winner, grounded and in band ${lostOk} of ${goneWaiting} (before: 0 of ${goneWaiting}); the other ${gone - goneWaiting} went after the agent's own first award, whose brief_fix had already said the change`);
  return `${grounded}/${lines} grounded, first jobs ${firstOk}/${firstN}, overlaps 0; once; not after minute ${M.H6_BRIEF.window}; outcomes unchanged; governor ${bm.dispatchedChecked}/${bm.dispatched}, physical 0; after approvals ${before}/${said} -> ${sayOk}/${said} (${fixes} brief_fix); briefed job to another agent while waiting: line at the award ${lostOk}/${goneWaiting}`;
});

// ------------------------------------------------------------------------------------------------ 5. the tab, the panel, the room
await check("5 the console tab shows moods and the briefing read-only; the panel shows and speaks the mood; the ops room asks for the briefing", () => {
  const tab = read("WebXR/instructor/js/h4-hive.js"), panel = read("WebXR/shared/oh-panel.js"), hw = read("WebXR/shared/hw-hive-world.js");
  const mp = tab.slice(tab.indexOf("function h4MoodPanel"), tab.indexOf("export function h4MountHiveTab"));
  ok(mp.length > 200 && /moods: true, briefing: true/.test(mp) && /hv\.brief\(\)/.test(mp), "the tab's moods panel replays with moods and the briefing on");
  ok(!/button|localStorage|sessionStorage|indexedDB|fetch\(|postMessage|innerHTML|approve\(|decline\(/.test(mp), "the moods panel is not read-only (a button, storage, a request, markup or a decision)");
  ok((tab.match(/fetch\(/g) ?? []).length === 1, "the tab makes one request (the evals JSON), as before");
  ok(/exchanges: true, memory: true, variety: true, homeward: true, moods: true, briefing: true/.test(panel), "the panel's hive turns moods and the briefing on");
  ok(/voice\.say\(h6VoicedAgent\(a, e\.mood, e\.about\), e\.text,/.test(panel) && /hive\.on\("mood"/.test(panel) && /oh-mood/.test(panel), "the panel speaks at the mood voice and shows a mood chip");
  ok(/m\.briefing = source\?\.brief\?\.\(\) \?\? null/.test(hw), "the ops room asks for the briefing on entering");
  return "tab moods panel read-only (0 buttons, 0 storage, 1 fetch as before); panel chip + mood voice; ops room briefing on entering";
});

// ------------------------------------------------------------------------------------------------ 6. hygiene
await check("6 hygiene: prefix, no alias, no network or model call, bundles, check_all and the baseline row, docs", () => {
  const src = read("WebXR/shared/h6-moods.js"), code = src.replace(/^\s*(\/\/|\*).*$/gm, "");
  const tops = [...src.matchAll(/^(?:export\s+)?(?:async\s+)?(?:const|let|var|function|class)\s+([A-Za-z_$][\w$]*)/gm)].map((m) => m[1]);
  ok(tops.length && tops.every((n) => /^(h6|H6_)/.test(n)), `a top-level name without the h6 prefix (${tops.filter((n) => !/^(h6|H6_)/.test(n)).join(", ")})`);
  ok(!/^import /m.test(src), "h6-moods.js imports nothing");
  const model = new RegExp(["cla", "ude-[a-z]+-\\d|gpt-\\d|gem", "ini-\\d"].join(""), "i");
  for (const f of ["WebXR/shared/h6-moods.js", "WebXR/shared/oh-hive.js", "WebXR/shared/oh-say.js", "WebXR/shared/oh-panel.js", "WebXR/instructor/js/h4-hive.js", "tools/check_hive6.mjs", "docs/consoles/HIVE-6.md", "WebXR/shared/h5-ops-room.js", "WebXR/shared/h5-hive-live.js", "docs/consoles/HIVE-7.md"]) { // HIVE-7's files too
    const s = read(f); ok(!model.test(s), `${f}: a model identifier`); ok(!/import \{[^}]*\bas\b[^}]*\}/.test(s), `${f}: an import alias`);
  }
  ok(!/\bfetch\(|XMLHttpRequest|WebSocket|sendBeacon|EventSource|getUserMedia|SpeechRecognition|speechSynthesis/.test(code), "h6-moods.js: a network, voice or listening call");
  const py = read("tools/bundle_webxr.py");
  const par = py.slice(py.indexOf('"parishes": {')), i0 = py.indexOf('"instructor": {'), ins = py.slice(i0, py.indexOf('"instructor/js/app.js"', i0) + 30);
  const at = (s, f) => s.indexOf(`SHARED / "${f}"`);
  ok(at(par, "h6-moods.js") > 0 && at(par, "h6-moods.js") < at(par, "oh-hive.js") && at(par, "h6-moods.js") < at(par, "oh-panel.js"), "parishes bundle: h6-moods.js before oh-hive.js and oh-panel.js");
  ok(at(ins, "h6-moods.js") > 0 && at(ins, "h6-moods.js") < at(ins, "oh-hive.js"), "instructor bundle: h6-moods.js before oh-hive.js");
  ok(/"check_hive6\.mjs"/.test(read("tools/check_all.mjs")), "check_all lists check_hive6");
  const base = JSON.parse(read("docs/perf/checkers-baseline.json") || "{}");
  ok(JSON.stringify(base).includes("check_hive6.mjs") && /ESTIMATE/.test(JSON.stringify(base).split("check_hive6.mjs").slice(-1)[0].slice(0, 300)), "the baseline row (an estimate)");
  for (const f of ["docs/consoles/HIVE-6.md", "docs/consoles/memory/HIVE-6.md", "tools/briefs/next/h6-next.md", "docs/consoles/HIVE-7.md", "docs/consoles/memory/HIVE-7.md", "tools/briefs/next/h7-next.md"]) ok(existsSync(join(ROOT, f)), `${f} missing`);
  return "prefix, no alias, no network, bundles, check_all, baseline, docs";
});

// ------------------------------------------------------------------------------------------------ 7. the combined case: the briefing in the ops room
// Integration lesson (round 5): the briefing meets HIVE-5's room mount and ENV-HD-4's room, so the combined case is built here
// (the same room, stubs and measure as check_hive5) and in the page (docs/consoles/HIVE-6.md, drive 1).
await check("7 the briefing in the operations room: entering at minute 0 holds it, seven stand, the screens carry it, the room stays inside budget", async () => {
  const THREE = await imp("WebXR/vendor/three/dist/three.module.min.js");
  const IX = await imp("WebXR/shared/ix-interiors.js"), IXR = await imp("WebXR/shared/ixr-robo-interiors.js"), HD2 = await imp("WebXR/shared/hd2-room-skins.js");
  const HD4 = await imp("WebXR/shared/hd4-rooms.js"), HW = await imp("WebXR/shared/hw-hive-world.js");
  const DESK = "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36";
  const SHELL = IXR.IXR_SHELL_SIGNS.reduce((a, [w, h]) => a + Math.round(w * h * 4 * 4 / 3), 0);
  const stub = () => { globalThis.document = { createElement: () => { const log = [], at = { x: 0, y: 0 }, st = []; let font = "10px sans-serif"; const ctx = new Proxy({}, { get: (_t, k) => { if (k === "font") return font; if (k === "measureText") return (s) => ({ width: String(s).length * (Number(/(\d+)px/.exec(font)?.[1]) || 10) * 0.52 }); if (k === "fillText") return (s) => log.push(String(s)); if (k === "save") return () => st.push({ ...at }); if (k === "restore") return () => { const p = st.pop(); if (p) Object.assign(at, p); }; if (k === "translate") return (x, y) => { at.x += x; at.y += y; }; if (typeof k === "string" && k.startsWith("create")) return () => ({ addColorStop() {} }); if (k === "getImageData") return (x, y, w, h) => ({ data: new Uint8ClampedArray(Math.max(4, 4 * (w | 0) * (h | 0))) }); return () => {}; }, set: (_t, k, v) => { if (k === "font") font = String(v); return true; } }); return { width: 0, height: 0, getContext: () => ctx, log }; } }; };
  const reg = () => { const d = {}; return { d, ixRegisterDresser: (s, fn) => (d[s] ??= []).push(fn) }; };
  const dressers = (() => { const r = reg(); IXR.ixrRegisterDressers(r); HD4.hd4RegisterDressers(r, { ultra: false, ua: DESK }); HD2.hd2RegisterSkins(r); return r.d; })();
  const measure = (room) => { const m = IXR.ixrMeasure(room); const signs = m.textures.some((t) => /sign|label|board/i.test(t.name)) ? 0 : SHELL; return { meshes: m.meshes, triangles: m.triangles, bytes: m.textureBytes + signs }; };
  const out = [];
  try {
    for (const tier of ["high", "balanced"]) {
      stub();
      const room = IX.ixBuild(HD4.HD4_OPS_STYLE, { three: THREE, tier, site: HD4.hd4OpsSite(HD4.hd4OpsHome(), null), dressers });
      const hive = H.ohHive({ seed: 1, ...PANEL, moods: true, briefing: true });
      const mount = HW.hwSyncRoom(null, { room, three: THREE, agents: hive.agents, source: hive, tier });
      ok(mount?.briefing?.length === 7, `${tier}: entering at minute 0 held ${mount?.briefing?.length ?? 0} briefing turns`);
      ok(mount.standing().length === 7, `${tier}: ${mount.standing().length} of 7 standing during the briefing`);
      const scr = HD4.hd4OpsScreens(room); mount.paint();
      const wall = scr.wall.canvas.log.join(" \n ");
      if (tier === "high") ok(/morning briefing/.test(wall), `${tier}: the wall's feed carries the briefing's labelled captions`);
      else { // the small wall (256 × 64) shows the head of each of the last four captions: all four are briefing turns
        const last = hive.events().filter((e) => e.type === "speak").slice(-4);
        ok(last.every((e) => e.briefing) && last.every((e) => scr.wall.canvas.log.some((w) => w.length > 8 && `00:00 ${e.caption}`.startsWith(w.replace(/…$/, "")))), `${tier}: the small wall shows the heads of the last four briefing captions`);
      }
      for (const e of mount.briefing) mount.avatars.handle(e); // the figures' caption bubbles take the briefing lines
      const m = measure(room);
      ok(m.meshes <= IX.IX_BUDGET.meshes && m.triangles <= IX.IX_BUDGET.triangles.high && m.bytes <= IXR.IXR_TEX_BUDGET[tier], `${tier}: ${m.meshes} meshes, ${m.triangles} triangles, ${(m.bytes / 1048576).toFixed(2)} MiB outside the budget`);
      ok(HW.hwSyncRoom(mount, { room, three: THREE, agents: hive.agents, source: hive, tier }) === mount && hive.brief() === null, `${tier}: a second entry holds no second briefing`);
      out.push(`${tier}: 7 turns, 7 standing, ${m.meshes} meshes / ${m.triangles} triangles / ${(m.bytes / 1048576).toFixed(2)} MiB`);
      evals.push(`the briefing in the ops room (headless, ${tier}): 7 of 7 standing, the wall carries it; ${m.meshes} meshes, ${m.triangles} triangles, ${(m.bytes / 1048576).toFixed(2)} MiB (IX_BUDGET ${IX.IX_BUDGET.meshes} / ${IX.IX_BUDGET.triangles.high}; ${(IXR.IXR_TEX_BUDGET[tier] / 1048576).toFixed(0)} MiB)`);
      mount.dispose();
    }
  } finally { delete globalThis.document; }
  return out.join("; ");
});

// ------------------------------------------------------------------------------------------------ 8. figures show the mood
await check("8 HIVE-7: the figures show the mood: figure mood = hive mood(id) N of N through refusals, glow pulse in its band, no geometry", async () => {
  const THREE = await imp("WebXR/vendor/three/dist/three.module.min.js");
  const IX = await imp("WebXR/shared/ix-interiors.js"), IXR = await imp("WebXR/shared/ixr-robo-interiors.js"), HD2 = await imp("WebXR/shared/hd2-room-skins.js");
  const HD4 = await imp("WebXR/shared/hd4-rooms.js"), HW = await imp("WebXR/shared/hw-hive-world.js"), AA = await imp("WebXR/shared/aa-agent-avatars.js");
  const OPS = await imp("WebXR/shared/h5-ops-room.js");
  const DESK = "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36";
  const fake = () => { const ctx = new Proxy({}, { get: (_t, k) => (k === "measureText" ? (s) => ({ width: String(s).length * 6 }) : typeof k === "string" && k.startsWith("create") ? () => ({ addColorStop() {} }) : k === "getImageData" ? (x, y, w, h) => ({ data: new Uint8ClampedArray(Math.max(4, 4 * (w | 0) * (h | 0))) }) : () => {}), set: () => true }); return { width: 0, height: 0, getContext: () => ctx }; };
  const dressers = (() => { const d = {}; const r = { ixRegisterDresser: (st, fn) => (d[st] ??= []).push(fn) }; IXR.ixrRegisterDressers(r); HD4.hd4RegisterDressers(r, { ultra: false, ua: DESK }); HD2.hd2RegisterSkins(r); return d; })();
  ok(OPS.h5MoodGlow("calm", 1.3) === 1 && OPS.h5MoodGlow("concerned", 1.3, true) === 1 && OPS.h5MoodGlow("nope", 2) === 1, "calm, reduced motion and an unknown mood hold the glow at 1");
  const out = [];
  globalThis.document = { createElement: fake };
  try {
    for (const tier of ["high", "balanced"]) for (const reduced of [false, true]) {
      const room = IX.ixBuild(HD4.HD4_OPS_STYLE, { three: THREE, tier, site: HD4.hd4OpsSite(HD4.hd4OpsHome(), null), dressers });
      const hive = H.ohHive({ seed: 1, decide: standIn, ...PANEL, moods: true, briefing: true });
      const mount = HW.hwSyncRoom(null, { room, three: THREE, agents: hive.agents, source: hive, tier, reducedMotion: reduced, mount: tier === "high" ? AA.aaCrowdAvatarMount({ room }) : AA.aaMountAgentAvatars });
      const m0 = IXR.ixrMeasure(room);
      const roomB = IX.ixBuild(HD4.HD4_OPS_STYLE, { three: THREE, tier, site: HD4.hd4OpsSite(HD4.hd4OpsHome(), null), dressers });
      const hiveB = H.ohHive({ seed: 1, decide: standIn, ...PANEL, briefing: true });
      const mountB = HW.hwSyncRoom(null, { room: roomB, three: THREE, agents: hiveB.agents, source: hiveB, tier, reducedMotion: reduced, mount: tier === "high" ? AA.aaCrowdAvatarMount({ room: roomB }) : AA.aaMountAgentAvatars });
      let same = 0;
      let samples = 0, matched = 0, glowed = 0, inBand = 0, seen = new Set(), refusals = 0, t = 0;
      for (let i = 0; i < 240; i += 1) {
        hive.step(); t += 0.37; mount.animate(t, 0.37); hiveB.step(); mountB.animate(t, 0.37);
        if (i % 20 === 19) { const a1 = IXR.ixrMeasure(room), b1 = IXR.ixrMeasure(roomB); if (a1.meshes === b1.meshes && a1.triangles === b1.triangles) same += 1; }
        refusals = hive.events().filter((e) => e.type === "refused").length;
        const moods = mount.moods();
        for (const a of hive.agents) {
          samples += 1; const want = hive.mood(a.id).mood, got = moods[a.id];
          if (got.mood === want) matched += 1; seen.add(want);
          const fig = mount.avatars.figure(a.id);
          if (!fig || got.glow === null) continue;
          glowed += 1;
          const g = OPS.H5_MOOD_GLOW[want], k = got.glow;
          const mat = (fig.userData.parts.glow ?? fig.userData.parts.halo).material, base = (fig.userData.parts.glow ?? fig.userData.parts.halo).userData.h7Base;
          const hueKept = base && Math.abs(mat.color.r - base[0] * k) < 1e-6 && Math.abs(mat.color.g - base[1] * k) < 1e-6 && Math.abs(mat.color.b - base[2] * k) < 1e-6;
          if (fig.userData.h7Mood === want && k <= 1 && k >= 1 - g.depth - 1e-9 && (!reduced || k === 1) && hueKept) inBand += 1;
        }
      }
      ok(refusals > 0 && seen.has("concerned") && seen.has("relieved"), `${tier}: the day reached ${refusals} refusals and moods ${[...seen].join(", ")}`);
      ok(matched === samples, `${tier}${reduced ? " (reduced motion)" : ""}: figure mood = hive mood(id) ${matched} of ${samples}`);
      ok(glowed > 0 && inBand === glowed, `${tier}${reduced ? " (reduced motion)" : ""}: glow in its band, hue kept ${inBand} of ${glowed}`);
      const m1 = IXR.ixrMeasure(room);
      ok(same === 12, `${tier}: the room with moods equals the room without them (meshes, triangles) at ${same} of 12 sampled minutes`);
      ok(m1.triangles <= IX.IX_BUDGET.triangles.high && m1.meshes <= IX.IX_BUDGET.meshes, `${tier}: ${m1.meshes} meshes / ${m1.triangles} triangles outside IX_BUDGET`);
      if (!reduced) {
        out.push(`${tier}: ${matched}/${samples} figure moods = hive, glow ${inBand}/${glowed} in band, ${refusals} refusals, room ${m1.meshes} meshes / ${m1.triangles} tris, = moods off ${same}/12`);
        evals.push(`figures show the mood (headless ops room, ${tier}, seed 1, 240 minutes): figure mood = hive mood(id) ${matched} of ${samples} (7 agents); glow in band ${inBand} of ${glowed}; moods seen ${[...seen].sort().join(", ")}; room ${m1.meshes} meshes / ${m1.triangles} triangles (at entry ${m0.meshes} / ${m0.triangles}), equal to the room with moods off at ${same} of 12 sampled minutes`);
      }
      mount.dispose(); mountB.dispose();
    }
  } finally { delete globalThis.document; }
  return out.join("; ");
});

// ------------------------------------------------------------------------------------------------ 9. moods on the live link
await check("9 HIVE-7: moods on the live console link: each snapshot's moods = the panel hive's mood(id) N of N; receive only, replay fallback", async () => {
  const L = await imp("WebXR/shared/h5-hive-live.js");
  const bus = new Map();
  class FakeChannel { constructor(name) { this.name = name; this.onmessage = null; (bus.get(name) ?? bus.set(name, new Set()).get(name)).add(this); } postMessage(d) { const data = JSON.parse(JSON.stringify(d)); for (const c of bus.get(this.name)) if (c !== this) c.onmessage?.({ data }); } close() { bus.get(this.name)?.delete(this); } }
  const got = [];
  const reader = L.h5LiveReader({ Channel: FakeChannel, onSnapshot: (x) => { if (x) got.push({ x, want: hive.agents.map((a) => hive.mood(a.id).mood) }); } });
  const hive = H.ohHive({ seed: 3, decide: standIn, ...PANEL, moods: true, briefing: true });
  const brief = hive.brief();
  const pub = L.h5LivePublisher({ hive, Channel: FakeChannel, setTimer: () => 1, clearTimer: () => {} });
  pub.set(true);
  for (let k = 0; k < 240; k += 1) { hive.step(); await Promise.resolve(); }
  let snaps = 0, agentsOk = 0, agentsAll = 0, causesOk = 0;
  const CAUSE_KEYS = new Set(["type", "t", "jobId", "reason", "by", "lines", "mood", "held"]);
  for (const { x, want } of got) {
    snaps += 1;
    ok(Array.isArray(x.moods) && x.moods.length === 7, `a snapshot with ${x.moods?.length ?? 0} moods`);
    x.moods.forEach((m, i) => { agentsAll += 1; if (m.agent === hive.agents[i].id && m.mood === want[i]) agentsOk += 1; if (!m.cause || Object.keys(m.cause).every((k) => CAUSE_KEYS.has(k))) causesOk += 1; });
  }
  ok(snaps > 50 && agentsOk === agentsAll, `live moods = the hive's mood(id) ${agentsOk} of ${agentsAll} over ${snaps} snapshots`);
  ok(causesOk === agentsAll, `causes carry only the hive's own fields ${causesOk} of ${agentsAll}`);
  const last = reader.snapshot();
  const changes = hive.events().filter((e) => e.type === "mood").length;
  ok(last.moodChanges === changes && new Set(last.moods.map((m) => m.mood)).size >= 2, `the day's mood changes ${last.moodChanges} = ${changes}; moods in the last snapshot ${[...new Set(last.moods.map((m) => m.mood))].join(", ")}`);
  ok(last.briefing.length === 7 && last.briefing.every((b, i) => b.caption === brief[i].caption && b.turn === brief[i].briefing.turn), `the live briefing is the hive's own 7 captions (${last.briefing.length})`);
  const keys = Object.keys(last).sort().join(",");
  ok(keys === "at,briefing,jobs,lines,metrics,moodChanges,moods,pending,refusals,schema,t", `a moods snapshot's keys: ${keys}`);
  const plain = L.h5LiveSnapshot(H.ohHive({ seed: 3, ...PANEL }));
  ok(Object.keys(plain).sort().join(",") === "at,jobs,lines,metrics,pending,refusals,schema,t", "a hive without moods sends the old shape");
  pub.set(false);
  ok(reader.snapshot() === null, "off: the tab drops the live moods (back to the replay)");
  reader.close();
  const tab = read("WebXR/instructor/js/h4-hive.js");
  ok(/h4MoodPanel\(seed, [^;]*reader\.snapshot\(\)/.test(tab) && /function h4LiveMoodPanel\(live\)/.test(tab) && /Array\.isArray\(live\.moods\)/.test(tab) && !/postMessage|localStorage|sessionStorage|indexedDB/.test(tab), "the tab's moods panel reads the live snapshot when it carries moods, else the replay; posts and stores nothing");
  evals.push(`moods on the live console link (seed 3, panel hive, 240 minutes): live moods = hive mood(id) ${agentsOk} of ${agentsAll} (${snaps} snapshots x 7 agents); mood changes ${changes}; briefing 7 of 7 captions; 0 requests, 0 storage`);
  return `${agentsOk}/${agentsAll} over ${snaps} snapshots; changes ${changes}; briefing 7/7; old shape without moods; dropped on off`;
});

// ------------------------------------------------------------------------------------------------ 10. the Spanish lines
await check("10 HIVE-7: Spanish lines carry no English fragment but names and ids (moods, briefing and corrections on)", async () => {
  const P = await imp("WebXR/shared/oh-panel.js");
  const VB = await imp("WebXR/shared/vb-shared-data.js");
  const EN = /\b(the|and|with|at|my|is|of|to|on|for|I|job|jobs|queue|audit|clean|briefing|morning|first|refusal|after|from|ready|every|line|chain|approval|approved|learner|careful|mindful|glad|plate|hands|full|watching|relieved|good|start|change|now|moved|changed|since|nothing|board|minutes|calm|busy|concerned|mood)\b/;
  const names = [...SITE_NAMES, ...D.OH_AGENTS.map((a) => a.name), "Supervisor (este dispositivo)"].sort((a, b) => b.length - a.length);
  const ids = new Set([...VB.VB_REASONS.map((r) => r.id), ...Object.keys(D.OH_REASON_PHRASES ?? {})]);
  let n = 0, clean = 0, fixes = 0, briefN = 0; const bad = [];
  for (const seed of [1, 2]) {
    const hv = H.ohHive({ seed, ...PANEL, moods: true, briefing: true, say: (a, ev) => S.ohSay(a, ev, { lang: "es" }), agents: D.OH_AGENTS.map((a) => D.ohAgentIn(a, "es")), supervisor: "Supervisor (este dispositivo)" });
    briefN += (hv.brief() ?? []).length;
    for (let i = 0; i < 480; i += 1) { hv.step(); if (hv.now() >= 1 && hv.now() <= M.H6_BRIEF.window) for (const p of hv.pending()) hv.approve(p.jobId); }
    for (const e of hv.events().filter((x) => x.type === "speak")) {
      n += 1; if (e.briefing?.fix) fixes += 1;
      let s = e.text; for (const nm of names) s = s.split(nm).join(" ");
      s = s.replace(/\bvbjob-[0-9a-f]+\b/g, " ").split(/\s+/).filter((w) => !ids.has(w.replace(/[.,;:]$/, ""))).join(" ");
      if (EN.test(s)) bad.push(e.text); else clean += 1;
    }
  }
  ok(clean === n, `Spanish lines with an English fragment: ${bad.length} of ${n}: ${bad.slice(0, 2).join(" | ")}`);
  const words = Object.values(M.H6_MOOD_PHRASES.es).flatMap((m) => Object.values(m).flat()).concat(Object.values(P.OH_MOOD_WORDS.es), Object.values(S.OH_CORES_BRIEF_ES).flat(), Object.values(S.OH_SECOND_ES ?? {}).flat());
  const wbad = words.filter((w) => EN.test(String(w).replace(/\{\w+\}/g, " ")));
  ok(!wbad.length, `Spanish phrase lists with English: ${wbad.join(" | ")}`);
  evals.push(`Spanish lines without an English fragment but names and ids (seeds 1-2, moods, briefing, approvals in the window): ${clean} of ${n} (briefing turns ${briefN}, corrections ${fixes}); phrase lists ${words.length} of ${words.length}`);
  return `${clean}/${n} lines; ${words.length} phrases and words; briefing ${briefN}; corrections ${fixes}`;
});

// ------------------------------------------------------------------------------------------------ 11. the page's hives with moods on
await check("11 HIVE-8: the page's hives with moods on: the scene's hive (h3SceneHive moods) through its relay to the cell hall's figures, 0 -> N; default byte-identical", async () => {
  const H3 = await imp("WebXR/shared/h3-hive-day.js");
  const app = read("WebXR/parishes/js/app.js"), panel = read("WebXR/shared/oh-panel.js");
  ok(/h3SceneHive\(ohHive, \{ seed: Number\(seed\) \|\| 1, moods: true \}\)/.test(app), "the page's scene hive turns moods on (app.js h3SceneHive(ohHive, { seed, moods: true }))");
  ok(/homeward: true, moods: true, briefing: true/.test(panel) && /const hv = h3Scene\?\.relay \?\? window\.__parishTest\?\.hive\?\.hive/.test(app), "the panel's hive runs with moods (HIVE-6), and the rooms follow the scene's relay while it plays, else the panel's hive");
  // the default call is what it was: the scene's events and the relay's releases, seeds 1, 2, 3, 7, 42 (digests measured at the base a10f1ff8)
  const BASE = ["13307c627db527be", "e689091a0e9127fb", "ba4f0b271cdaf417", "4772e790a9254cb2", "fb9b7fae429a81b4"];
  const SEEDS = [1, 2, 3, 7, 42];
  const beat = (R, hive, b) => {
    R.step(b.steps);
    if (b.id === "approved") { const p = hive.pending()[0]; if (p) hive.approve(p.jobId); }
    return b.id === "arrive" ? R.releaseThrough("speak") : b.id === "bids" ? R.releaseRun("bid") : b.id === "award" ? R.releaseThrough("award") : b.id === "walk-out" ? R.releaseThrough("move") : b.id === "refusal" ? R.releaseThrough("refused") : R.releaseAll();
  };
  const scene = (seed, moods, onRelay = null) => {
    const hive = H3.h3SceneHive(H.ohHive, moods ? { seed, moods: true } : { seed });
    for (let i = 0; i < H3.H3_SCENE_PROLOGUE_STEPS; i += 1) hive.step();
    const n0 = hive.events().length, R = H3.h3SceneRelay(hive), got = []; R.on("mood", (e) => got.push(e));
    const ctl = onRelay?.(R) ?? null;
    const beats = H3.H3_SCENE.beats.map((b) => { const ev = beat(R, hive, b); ctl?.after?.(b, ev); return { id: b.id, ev: ev.filter((e) => e.type !== "mood").map((e) => `${e.type}:${e.agent}:${e.to ?? ""}:${e.reason ?? ""}:${e.jobId ?? ""}`) }; });
    return { hive, R, got, beats, after: hive.events().slice(n0).filter((e) => e.type === "mood").length, m: hive.metrics(), v: hive.verify() };
  };
  const digests = SEEDS.map((seed) => {
    const hive = H3.h3SceneHive(H.ohHive, { seed });
    for (let i = 0; i < H3.H3_SCENE_PROLOGUE_STEPS; i += 1) hive.step();
    const R = H3.h3SceneRelay(hive), rel = H3.H3_SCENE.beats.map((b) => `${b.id}:${beat(R, hive, b).length}`);
    ok(R.mood("oh-dispatcher") === null, "the relay reads no mood for a hive without moods");
    return fnv(JSON.stringify(hive.events()) + "|" + rel.join(","));
  });
  ok(digests.every((d, i) => d === BASE[i]), `the scene's hive and relay with moods off: byte-identical ${digests.filter((d, i) => d === BASE[i]).length} of ${SEEDS.length} (${digests.join(", ")})`);
  // moods on: the same story beat by beat, the mood changes released with their causes, the relay's mood(id) = the hive's at the end
  let same = 0, moodsOn = 0, endEq = 0, endN = 0;
  for (const seed of SEEDS) {
    const off = scene(seed, false), on = scene(seed, true);
    if (on.beats.every((b, i) => JSON.stringify(b.ev) === JSON.stringify(off.beats[i].ev))) same += 1;
    ok(off.got.length === 0 && on.got.length > 0, `seed ${seed}: mood events to the relay's listeners ${off.got.length} (off) -> ${on.got.length} (on)`);
    ok(on.got.length === on.after, `seed ${seed}: every mood change after the prologue reaches the relay's listeners (${on.got.length} of ${on.after})`);
    moodsOn += on.got.length;
    for (const a of on.hive.agents) { endN += 1; if (on.R.mood(a.id)?.mood === on.hive.mood(a.id).mood) endEq += 1; }
    ok(on.m.physicalDispatched === 0 && on.v.ok && on.m.dispatchedChecked === on.m.dispatched, `seed ${seed}: governor checked ${on.m.dispatchedChecked} of ${on.m.dispatched}, physical ${on.m.physicalDispatched}, chain ${on.v.ok}`);
  }
  ok(same === SEEDS.length, `the scene's beats with moods on = off (non-mood events, beat by beat): ${same} of ${SEEDS.length}`);
  ok(endEq === endN, `the relay's mood(id) = the hive's mood(id) after the last beat: ${endEq} of ${endN}`);
  // the cell hall's figures (the page's room mount, aaRoomAvatarMount, through hwSyncRoom on the relay): mood events received, off -> on
  const THREE = await imp("WebXR/vendor/three/dist/three.module.min.js");
  const IX = await imp("WebXR/shared/ix-interiors.js"), IXR = await imp("WebXR/shared/ixr-robo-interiors.js"), HD2 = await imp("WebXR/shared/hd2-room-skins.js");
  const HD4 = await imp("WebXR/shared/hd4-rooms.js"), HW = await imp("WebXR/shared/hw-hive-world.js"), AA = await imp("WebXR/shared/aa-agent-avatars.js");
  const DESK = "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36";
  const fake = () => { const ctx = new Proxy({}, { get: (_t, k) => (k === "measureText" ? (s) => ({ width: String(s).length * 6 }) : typeof k === "string" && k.startsWith("create") ? () => ({ addColorStop() {} }) : k === "getImageData" ? (x, y, w, h) => ({ data: new Uint8ClampedArray(Math.max(4, 4 * (w | 0) * (h | 0))) }) : () => {}), set: () => true }); return { width: 0, height: 0, getContext: () => ctx }; };
  const dressers = (() => { const d = {}; const r = { ixRegisterDresser: (st, fn) => (d[st] ??= []).push(fn) }; IXR.ixrRegisterDressers(r); HD4.hd4RegisterDressers(r, { ultra: false, ua: DESK }); HD2.hd2RegisterSkins(r); return d; })();
  const rb = RB.RB_SITES.find((s) => s.id === H3.H3_SCENE.site);
  const figs = { off: 0, on: 0, agree: 0, checks: 0, budget: 0, beats: 0, reopen: 0, reopenAgree: 0, reopenNonCalm: 0, reopenFirst: null };
  globalThis.document = { createElement: fake };
  try {
    for (const moods of [false, true]) for (const seed of SEEDS) {
      let room = null, mount = null, t = 0;
      scene(seed, moods, (R) => {
        room = IX.ixBuild(H3.H3_SCENE.style, { three: THREE, tier: "high", site: IXR.ixrSiteFor(rb, null), dressers });
        mount = HW.hwSyncRoom(null, { room, three: THREE, agents: R.agents, source: R, tier: "high", mount: AA.aaRoomAvatarMount() });
        return { after: (b) => {
          // MOODS: the page reopens the cell hall at the "approved" beat (h3SceneRoom builds the room anew after the outside shots), so the
          // figures are built mid-scene, after the refusal's moods: at their first frame each posture names the relay's released mood. At
          // "approved" only the calm home agents stand there, so the room is also reopened at "walk-in" and "run", when the busy planner is in it.
          if (moods && (b.id === "approved" || b.id === "walk-in" || b.id === "run")) {
            figs.on += mount.avatars.moodLog().length; // the first mount's mood events count before it goes
            mount.dispose(); mount = HW.hwSyncRoom(null, { room, three: THREE, agents: R.agents, source: R, tier: "high", mount: AA.aaRoomAvatarMount() });
            t += 0.5; mount.animate(t, 0);
            for (const a of R.agents) {
              if (!mount.avatars.figure(a.id)) continue;
              const want = R.mood(a.id)?.mood ?? "calm", got = mount.avatars.state(a.id).mood ?? "calm";
              figs.reopen += 1; if (want !== "calm") figs.reopenNonCalm += 1; if (want === got) figs.reopenAgree += 1; else figs.reopenFirst ??= { seed, beat: b.id, agent: a.id, want, got };
            }
          }
          for (let k = 0; k < 4; k += 1) { t += 0.5; mount.animate(t, 0.5); }
          figs.beats += 1; const m = IXR.ixrMeasure(room); if (m.triangles <= IX.IX_BUDGET.triangles.high && m.meshes <= IX.IX_BUDGET.meshes) figs.budget += 1;
          if (moods) for (const a of R.agents) { const s = mount.avatars.state(a.id); if (!mount.avatars.figure(a.id) || s?.mood == null) continue; figs.checks += 1; if (s.mood === R.mood(a.id)?.mood) figs.agree += 1; }
        } };
      });
      figs[moods ? "on" : "off"] += mount.avatars.moodLog().length;
      mount.dispose();
    }
  } finally { delete globalThis.document; }
  ok(figs.off === 0 && figs.on > 0, `the cell hall's figures received mood events: ${figs.off} (moods off) -> ${figs.on} (moods on), seeds ${SEEDS.join(", ")}`);
  ok(figs.checks > 0 && figs.agree === figs.checks, `a figure that took a mood shows the relay's released mood: ${figs.agree} of ${figs.checks} beat-checks`);
  ok(figs.budget === figs.beats, `the cell hall with the scene's figures inside IX_BUDGET (high): ${figs.budget} of ${figs.beats} beats`);
  ok(figs.reopen > 0 && figs.reopenNonCalm > 0 && figs.reopenAgree === figs.reopen, `MOODS: the cell hall reopened mid-scene (at the "approved", "walk-in" and "run" beats, after the refusal and the award): at the figures' first frame posture = relay.mood(id) ${figs.reopenAgree} of ${figs.reopen} (${figs.reopenNonCalm} not calm)${figs.reopenFirst ? ` first miss ${JSON.stringify(figs.reopenFirst)}` : ""}`);
  // MOODS: the page's scene can hold at a beat for a capture (hiveScene({ seed, hold }) + hiveSceneResume()); without hold the scene is what it was
  ok(/hiveScene = \(\{ seed = 1, hold = null \} = \{\}\) =>/.test(app) && /if \(S\.hold && b\.id === S\.hold\) \{ S\.held = true; S\.heldAt = S\.t; break; \}/.test(app) && /S\.t = S\.held \? S\.heldAt : nowS - S\.t0;/.test(app) && /if \(!S\.held\) while \(S\.next < H3_SCENE\.beats\.length/.test(app) && /if \(S\.held\) \{ S\.t0 = nowS - S\.heldAt; return; \}/.test(app) && /hiveSceneResume = \(\) => \{ const S = h3Scene; if \(!S\?\.held\) return false;/.test(app), "MOODS: the page's scene holds at a named beat for a capture (hold, held, heldAt; hiveSceneResume; no beat plays while held, even on a slow frame whose clock is past the next beat) and is unchanged without hold");
  evals.push(`the page's scene hive with moods on (h3SceneHive moods, seeds ${SEEDS.join(", ")}): mood events to the relay ${moodsOn}; the cell hall's figures received ${figs.off} -> ${figs.on} (headless, room open through every beat), figure mood = released mood ${figs.agree} of ${figs.checks}; reopened mid-scene, first-frame posture = relay.mood ${figs.reopenAgree} of ${figs.reopen} (${figs.reopenNonCalm} not calm); beats unchanged ${same} of ${SEEDS.length}; the default call byte-identical ${SEEDS.length} of ${SEEDS.length}`);
  return `default byte-identical ${SEEDS.length}/${SEEDS.length}; beats unchanged ${same}/${SEEDS.length}; relay mood events ${moodsOn}; figures ${figs.off} -> ${figs.on}, agree ${figs.agree}/${figs.checks}; relay mood(id) = hive ${endEq}/${endN}; cell hall in budget ${figs.budget}/${figs.beats}`;
});

console.log(`\n${passed} passed, ${failed} failed`);
for (const e of evals) console.log(`EVAL ${e}`);
process.exit(failed ? 1 : 0);
