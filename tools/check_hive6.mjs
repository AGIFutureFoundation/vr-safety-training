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
  return `${grounded}/${lines} grounded, first jobs ${firstOk}/${firstN}, overlaps 0; once; not after minute ${M.H6_BRIEF.window}; outcomes unchanged; governor ${bm.dispatchedChecked}/${bm.dispatched}, physical 0`;
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
  for (const f of ["WebXR/shared/h6-moods.js", "WebXR/shared/oh-hive.js", "WebXR/shared/oh-say.js", "WebXR/shared/oh-panel.js", "WebXR/instructor/js/h4-hive.js", "tools/check_hive6.mjs", "docs/consoles/HIVE-6.md"]) {
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
  for (const f of ["docs/consoles/HIVE-6.md", "docs/consoles/memory/HIVE-6.md", "tools/briefs/next/h6-next.md"]) ok(existsSync(join(ROOT, f)), `${f} missing`);
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

console.log(`\n${passed} passed, ${failed} failed`);
for (const e of evals) console.log(`EVAL ${e}`);
process.exit(failed ? 1 : 0);
