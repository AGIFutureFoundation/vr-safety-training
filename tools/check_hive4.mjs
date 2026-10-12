#!/usr/bin/env node
/**
 * HIVE-4 — the hive's voices, memory and console (docs/consoles/HIVE-4.md). Single checker; never run check_all here.
 *   1. the default hive is unchanged (its seed-7 day digest is the base's), so round 3's figures still hold;
 *   2. agents talk to each other: exchanges per seeded day, every turn in order and in its speaker's band, captions labelled by
 *      speaker and addressee, one floor per step with no overlap, and every fact re-derived from the award, the winner's bid or
 *      the chain (not from the speak event);
 *   3. a day's memory: every remembered count, site and hive-clock time re-derived from the hive's own chain prefix; planted
 *      errors are caught;
 *   4. the governor still checks every step with the talk on, 0 physical dispatches, and the same safety outcomes as without it;
 *   5. voices: a stubbed speechSynthesis (one local, one network voice) speaks the exchanges in order, local only, never two at once;
 *      with voice off nothing is spoken and every caption shows;
 *   6. trait recovery from text (declared in docs/consoles/HIVE-4.md before the first run): ridge on eight line features, fitted on
 *      persona seeds 1-50, Spearman per trait on held-out seeds 51-100;
 *   7. distinct-2 per agent, before -> after;
 *   8. the instructor console's Omega Hive tab: read-only, local, built without markup strings, the evals from the committed JSON;
 *   9. hygiene: no network or model call, no import aliases, the prefix, check_all and the baseline row, docs present.
 * `--write` regenerates WebXR/instructor/hive4-evals.json from this run; without it, the committed JSON must match what this run computes.
 */
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const WRITE = process.argv.includes("--write");
const imp = (rel) => import(pathToFileURL(join(ROOT, rel)).href);
const read = (rel) => { try { return readFileSync(join(ROOT, rel), "utf8"); } catch (_) { return ""; } };
let passed = 0, failed = 0;
const evals = [];
const rows = [];
function ok(cond, msg) { if (!cond) throw new Error(msg); }
async function check(name, fn) {
  try { const r = await fn(); passed += 1; console.log(`PASS ${name}${r ? ` — ${r}` : ""}`); }
  catch (e) { failed += 1; console.log(`FAIL ${name} — ${e.message}`); }
}

const D = await imp("WebXR/shared/oh-hive-data.js");
const S = await imp("WebXR/shared/oh-say.js");
const H = await imp("WebXR/shared/oh-hive.js");
const V = await imp("WebXR/shared/oh-voice.js");
const RB = await imp("WebXR/shared/rb-robotics-data.js");

const SITES = RB.RB_SITES;
const siteName = (id) => SITES.find((s) => s.id === id)?.name ?? id;
const NAMES = D.OH_AGENTS.map((a) => a.name);
const agentOf = (id) => D.OH_AGENTS.find((a) => a.id === id);
const FEAR = /\b(danger\w*|deadly|death|die[sd]?|kill\w*|crush\w*|injur\w*|hurt\w*|maim\w*|scar(y|e[sd]?)|fear\w*|terrif\w*|amputat\w*|blood\w*)\b/i;
const standIn = (r) => (parseInt(String(r.jobId).slice(-2), 16) % 2 ? "approve" : "decline"); // a seeded stand-in for the person, not a person
const TALK = { exchanges: true, memory: true, variety: true };
const fnv = (s) => { let h = 0xcbf29ce484222325n; for (let i = 0; i < s.length; i += 1) { h ^= BigInt(s.charCodeAt(i)); h = (h * 0x100000001b3n) & 0xffffffffffffffffn; } return h.toString(16).padStart(16, "0"); };
// The seed-7 default day as the base 048869d5 produces it (measured on a git archive of the base; docs/consoles/HIVE-4.md).
const H4_BASE_DIGEST = "703aa91da7bb9439";

let BASEDAY = null, TALKDAY = null;
const baseDay = () => (BASEDAY ??= H.ohHiveDay(7, { decide: standIn }));
const talkDay = () => (TALKDAY ??= H.ohHiveDay(7, { decide: standIn, ...TALK }));
const speaks = (evs) => evs.filter((e) => e.type === "speak");

// 1 — the default path
await check("1 the default hive is unchanged: its seed-7 day is byte-identical to the base's", () => {
  const dig = fnv(JSON.stringify(baseDay().events));
  if (H4_BASE_DIGEST === "PIN") return `digest ${dig} (pin it)`;
  ok(dig === H4_BASE_DIGEST, `digest ${dig} differs from the base's ${H4_BASE_DIGEST}`);
  return `digest ${dig} equals the base's; ${speaks(baseDay().events).length} lines, 0 exchanges, 0 memory lines`;
});

/** Facts in a line: job ids, site names, agent names, hive-clock times and the numbers left once those are removed. */
function factsIn(text) {
  const out = { jobs: [], sites: [], names: [], clocks: [], nums: [] };
  let rest = String(text);
  for (const m of rest.matchAll(/vbjob-[0-9a-f]+/g)) out.jobs.push(m[0]);
  rest = rest.replace(/vbjob-[0-9a-f]+/g, " ");
  for (const s of SITES) if (rest.includes(s.name)) { out.sites.push(s.name); rest = rest.split(s.name).join(" "); }
  for (const n of NAMES) if (new RegExp(`\\b${n}\\b`).test(rest)) { out.names.push(n); rest = rest.replace(new RegExp(`\\b${n}\\b`, "g"), " "); }
  for (const m of rest.matchAll(/\b\d{2}:\d{2}\b/g)) out.clocks.push(m[0]);
  rest = rest.replace(/\b\d{2}:\d{2}\b/g, " ");
  for (const m of rest.matchAll(/(?<![A-Za-z0-9.])-?\d+(?:\.\d+)?/g)) out.nums.push(m[0]);
  return out;
}
const inBand = (agent, text) => S.ohSentences(text).map((s) => S.ohWords(s).length).filter((n) => n < agent.style.band[0] || n > agent.style.band[1]).length;
const clockOf = (at) => { const n = Number(String(at).replace(/^H\+/, "")); return `${String(Math.floor(n / 60)).padStart(2, "0")}:${String(n % 60).padStart(2, "0")}`; };

/** Strict grounding of one exchange line against the hive's own non-speak events and chain (never the speak event's own facts). */
function groundExchange(e, evs, hive) {
  const k = e.exchange.kind;
  const sp = agentOf(e.agent), to = agentOf(e.toAgent);
  const allow = { jobs: new Set(), sites: new Set(), names: new Set([to?.name]), nums: new Set() };
  const bad = [];
  if (k === "handoff" || k === "question") {
    const aw = evs.find((x) => x.type === "award" && x.jobId === e.jobId && x.t === e.t);
    if (!aw) return [`no award for ${e.jobId} at t ${e.t}`];
    const bid = evs.find((x) => x.type === "bid" && x.agent === aw.agent && x.jobId === e.jobId && x.t === e.t);
    allow.jobs.add(aw.jobId); allow.sites.add(aw.siteName); allow.nums.add(String(aw.bid));
    if (k === "question") { if (!bid) return ["no winning bid"]; for (const f of ["hops", "load", "skill"]) allow.nums.add(String(bid[f])); }
    const disp = D.OH_AGENTS.find((a) => a.key === "dispatcher").id, stew = D.OH_AGENTS.find((a) => a.key === "safety-steward").id;
    const opener = k === "handoff" ? disp : stew;
    if (e.exchange.turn === 0 && (e.agent !== opener || e.toAgent !== aw.agent)) bad.push(`${k} opener ${e.agent} -> ${e.toAgent}`);
    if (e.exchange.turn === 1 && (e.agent !== aw.agent || e.toAgent !== opener)) bad.push(`${k} reply ${e.agent} -> ${e.toAgent}`);
  } else if (k === "report") {
    const chain = hive.log();
    if (!(e.lines === e.logSeq && e.lines >= 1 && e.lines <= chain.length && Number(chain[e.lines - 1].at.slice(2)) <= e.t)) bad.push(`report lines ${e.lines} not the chain's length then (${e.logSeq})`);
    if (!hive.jobs().some((j) => j.firstId === e.jobId && j.status !== "future")) bad.push(`report names ${e.jobId}, not a job of the day`);
    allow.jobs.add(e.jobId); allow.nums.add(String(e.logSeq));
  }
  const f = factsIn(e.text);
  for (const j of f.jobs) if (!allow.jobs.has(j)) bad.push(`job ${j}`);
  for (const s of f.sites) if (!allow.sites.has(s)) bad.push(`site ${s}`);
  for (const n of f.names) if (!allow.names.has(n)) bad.push(`name ${n}`);
  for (const n of f.nums) if (!allow.nums.has(n)) bad.push(`number ${n}`);
  if (f.clocks.length) bad.push("a clock in an exchange");
  return bad.map((b) => `${e.exchange.id}/${e.exchange.turn} ${b}`);
}

/** The checker's own reading of the chain (it does not call ohRecall): an agent's completed jobs of a task, in order. */
function recallFromChain(chain, agentId, task) {
  const aw = new Map(); const done = [];
  for (const l of chain) {
    if (l.action === "oh-award") { const p = l.detail.split(" "); if (p[2] === "@" && p[4] === "->") aw.set(p[0], { task: p[1], site: p[3], agent: p[5] }); }
    if (l.action === "oh-complete" && / completed, /.test(l.detail)) { const id = l.detail.split(" ")[0]; const a = aw.get(id); if (a && a.agent === agentId && a.task === task) done.push({ id, site: a.site, at: l.at }); }
  }
  return done;
}
function groundMemory(e, hive, text = e.text) {
  const chain = hive.log().slice(0, e.logSeq);
  const task = Object.keys(H.OH_TASK_NOUNS).find((k) => H.OH_TASK_NOUNS[k] === e.kinds);
  const done = recallFromChain(chain, e.agent, task);
  const bad = [];
  if (done.length < 2) return [`${e.agent} has ${done.length} completed ${task} in the chain`];
  const last = done[done.length - 2];
  if (done[done.length - 1].id !== e.jobId) bad.push("the newest completed job is not the one just finished");
  const f = factsIn(text);
  if (!text.includes(H.OH_TASK_NOUNS[task])) bad.push("the task kind");
  if (f.nums.length !== 1 || f.nums[0] !== String(done.length)) bad.push(`count ${f.nums.join(",")} vs ${done.length}`);
  if (f.sites.length !== 1 || f.sites[0] !== siteName(last.site)) bad.push(`site ${f.sites.join(",")} vs ${siteName(last.site)}`);
  if (f.clocks.length !== 1 || f.clocks[0] !== clockOf(last.at)) bad.push(`clock ${f.clocks.join(",")} vs ${clockOf(last.at)}`);
  if (f.jobs.length || f.names.length) bad.push("an id or a name in a memory line");
  return bad;
}

// 2 — exchanges
await check("2 agents talk to each other: exchanges per seeded day, turns in order and in band, labelled captions, no overlap, every fact grounded", () => {
  const { hive, events } = talkDay();
  const sp = speaks(events);
  const xs = sp.filter((e) => e.exchange);
  const byId = new Map(); for (const e of xs) { if (!byId.has(e.exchange.id)) byId.set(e.exchange.id, []); byId.get(e.exchange.id).push(e); }
  const kinds = {}; let complete = 0, adjacent = 0, grounded = 0, badBand = 0, sentences = 0, calm = 0; const problems = [];
  for (const [id, turns] of byId) {
    const [a, b] = turns; kinds[a.exchange.kind] = (kinds[a.exchange.kind] ?? 0) + 1;
    if (turns.length === 2 && a.exchange.turn === 0 && b.exchange.turn === 1 && a.agent !== b.agent && a.exchange.with === b.agent && b.exchange.with === a.agent) complete += 1; else problems.push(`${id} turns`);
    if (sp.indexOf(b) === sp.indexOf(a) + 1 && b.floor.startMs >= a.floor.endMs) adjacent += 1; else problems.push(`${id} order`);
  }
  for (const e of xs) {
    const g = groundExchange(e, events, hive); if (!g.length) grounded += 1; else problems.push(...g);
    const sa = agentOf(e.agent), ta = agentOf(e.toAgent);
    ok(e.caption === `${sa.name} (software agent) to ${ta.name}: ${e.text}`, `caption not labelled by speaker and addressee: ${e.caption}`);
    badBand += inBand(sa, e.text); sentences += S.ohSentences(e.text).length; if (!FEAR.test(e.text)) calm += 1;
  }
  // One floor per step: no two lines of a step overlap.
  const byT = new Map(); for (const e of sp) { if (!byT.has(e.t)) byT.set(e.t, []); byT.get(e.t).push(e); }
  let overlaps = 0, floored = 0;
  for (const list of byT.values()) for (let i = 0; i < list.length; i += 1) { if (list[i].floor) floored += 1; if (i && list[i].floor.startMs < list[i - 1].floor.endMs) overlaps += 1; }
  ok(byId.size > 0 && complete === byId.size, `${complete}/${byId.size} exchanges complete: ${problems.slice(0, 3).join(" | ")}`);
  ok(adjacent === byId.size, `${adjacent}/${byId.size} replies follow their opener: ${problems.slice(0, 3).join(" | ")}`);
  ok(grounded === xs.length, `${grounded}/${xs.length} grounded: ${problems.slice(0, 4).join(" | ")}`);
  ok(badBand === 0, `${badBand} of ${sentences} exchange sentences outside the speaker's band`);
  ok(calm === xs.length, "a line failed the calm-text scan");
  ok(overlaps === 0 && floored === sp.length, `${overlaps} overlaps; ${floored}/${sp.length} lines on the floor`);
  const base = speaks(baseDay().events).filter((e) => e.exchange).length;
  // Five more seeded days for the range.
  const per = [1, 2, 3, 4, 5].map((s) => H.ohHiveDay(s, { decide: standIn, nJobs: 120, ticksPerDay: 300, ...TALK }).metrics.exchanges);
  rows.push({ measure: "Agent-to-agent exchanges per seeded day (seed 7, 200 jobs)", before: String(base), after: `${byId.size} (${Object.entries(kinds).map(([k, n]) => `${k} ${n}`).join(", ")})`, source: "check_hive4 2" });
  rows.push({ measure: "Exchange lines grounded (every fact re-derived from the award, the winning bid or the chain)", before: "n/a", after: `${grounded} of ${xs.length}`, source: "check_hive4 2" });
  rows.push({ measure: "Turn-taking: replies directly after their opener / lines overlapping on the floor", before: "n/a", after: `${adjacent} of ${byId.size} / ${overlaps} of ${sp.length}`, source: "check_hive4 2" });
  evals.push(`exchanges per seeded day: ${base} -> ${byId.size} (${JSON.stringify(kinds)}); grounded ${grounded}/${xs.length}; seeds 1-5 (120 jobs): ${per.join(", ")}`);
  return `${byId.size} exchanges (${Object.entries(kinds).map(([k, n]) => `${k} ${n}`).join(", ")}), ${complete} complete, ${adjacent} in order, ${grounded}/${xs.length} lines grounded, ${sentences - badBand}/${sentences} sentences in band, ${overlaps} overlaps over ${sp.length} lines; seeds 1-5: ${per.join(", ")}`;
});

// 3 — memory
await check("3 a day's memory: every remembered count, site and hive-clock time re-derived from the chain prefix; planted errors caught", () => {
  const { hive, events } = talkDay();
  const mem = speaks(events).filter((e) => e.memory);
  let grounded = 0, badBand = 0, sentences = 0; const problems = [];
  for (const e of mem) {
    const g = groundMemory(e, hive); if (!g.length) grounded += 1; else problems.push(`${e.agent}@${e.t}: ${g.join(", ")}`);
    const a = agentOf(e.agent); badBand += inBand(a, e.text); sentences += S.ohSentences(e.text).length;
    ok(e.caption === `${a.name} (software agent): ${e.text}` && !FEAR.test(e.text), "memory caption or calm text");
  }
  ok(mem.length > 0 && grounded === mem.length, `${grounded}/${mem.length} grounded: ${problems.slice(0, 3).join(" | ")}`);
  ok(badBand === 0, `${badBand} of ${sentences} memory sentences outside the band`);
  // Planted errors: a count one too high, another site, another time. Each must be caught.
  const e0 = mem[0];
  const other = SITES.find((s) => !e0.text.includes(s.name)).name;
  const plants = [e0.text.replace(new RegExp(`\\b${e0.count}\\b`), String(e0.count + 1)), e0.text.replace(e0.lastSite, other), e0.text.replace(e0.clock, "23:59")];
  const caught = plants.filter((t) => groundMemory(e0, hive, t).length > 0).length;
  ok(caught === 3, `${caught}/3 planted errors caught`);
  const agents = new Set(mem.map((e) => e.agent));
  rows.push({ measure: "Memory references per seeded day (seed 7)", before: String(speaks(baseDay().events).filter((e) => e.memory).length), after: `${mem.length}, from ${agents.size} agents`, source: "check_hive4 3" });
  rows.push({ measure: "Memory references grounded in the hive's own chain (count, last site, hive-clock time)", before: "n/a", after: `${grounded} of ${mem.length}; planted errors caught ${caught} of 3`, source: "check_hive4 3" });
  evals.push(`memory references: 0 -> ${mem.length}; grounded ${grounded}/${mem.length}; planted ${caught}/3 caught`);
  return `${mem.length} memory lines from ${agents.size} agents, ${grounded}/${mem.length} grounded, ${sentences - badBand}/${sentences} sentences in band, planted errors ${caught}/3 caught; e.g. "${e0.text}"`;
});

// 4 — the governor
await check("4 the governor still checks every step with the talk on; 0 physical dispatches; the same safety outcomes as without it", () => {
  const a = baseDay().metrics, b = talkDay().metrics;
  ok(b.dispatched > 0 && b.dispatchedChecked === b.dispatched && b.stepsMonitored === b.steps && b.physicalDispatched === 0, `checked ${b.dispatchedChecked}/${b.dispatched}, monitored ${b.stepsMonitored}/${b.steps}, physical ${b.physicalDispatched}`);
  for (const k of ["completed", "refused", "vetoed", "declined", "notAccepted", "approvalRequests", "approved", "dispatched", "steps"]) ok(a[k] === b[k], `${k} ${a[k]} vs ${b[k]}`);
  // The e-stop still wins with the talk on.
  const site = "rb-site-soma-robot-cell";
  const hv = H.ohHive({ seed: 7, decide: standIn, ...TALK });
  hv.governor.setEstop?.(site, true);
  hv.run(480);
  const ranThere = hv.jobs().filter((j) => j.site === site && ["running", "completed", "not-accepted"].includes(j.status)).length;
  ok(ranThere === 0, `${ranThere} jobs ran at ${site} with the e-stop held`);
  rows.push({ measure: "Governor with the talk on: dispatched steps checked / physical dispatches", before: `${a.dispatchedChecked} of ${a.dispatched}, ${a.stepsMonitored} of ${a.steps} steps / 0`, after: `${b.dispatchedChecked} of ${b.dispatched}, ${b.stepsMonitored} of ${b.steps} steps / ${b.physicalDispatched}`, source: "check_hive4 4" });
  evals.push(`governor: checked ${b.dispatchedChecked}/${b.dispatched}, monitored ${b.stepsMonitored}/${b.steps}, physical ${b.physicalDispatched}; outcomes identical to the talk off`);
  return `checked ${b.dispatchedChecked}/${b.dispatched}, monitored ${b.stepsMonitored}/${b.steps}, physical 0; completed/refused/vetoed/declined ${b.completed}/${b.refused}/${b.vetoed}/${b.declined} in both; e-stop held: 0 runs at the soma cell`;
});

// 5 — voices
await check("5 voices: the exchanges spoken in order on the local voice only, never two at once; with voice off nothing is spoken", async () => {
  const voices = [{ name: "Local Test Voice", lang: "en-US", localService: true }, { name: "Network Test Voice", lang: "en-US", localService: false }];
  let active = 0, most = 0; const spoken = [];
  const synth = { getVoices: () => voices, cancel() {}, speak(u) { active += 1; most = Math.max(most, active); spoken.push({ voice: u.voice?.name, text: u.text }); setTimeout(() => { u.onstart?.(); setTimeout(() => { active -= 1; u.onend?.(); }, 1); }, 0); } };
  function Utt(text) { this.text = text; }
  const lines = speaks(H.ohHive({ seed: 7, decide: standIn, ...TALK }).run(40)).filter((e) => e.exchange);
  let captions = 0;
  const off = V.ohVoiceController({ synth, Utterance: Utt, doc: null, win: null, enabled: false, onCaption: () => { captions += 1; } });
  for (const e of lines) off.say(agentOf(e.agent), e.text);
  ok(spoken.length === 0 && captions === lines.length, `voice off: ${spoken.length} spoken, ${captions}/${lines.length} captions`);
  const on = V.ohVoiceController({ synth, Utterance: Utt, doc: null, win: null, enabled: true });
  for (const e of lines) on.say(agentOf(e.agent), e.text);
  for (let i = 0; i < 400 && (on.queued() || on.speaking()); i += 1) await new Promise((r) => setTimeout(r, 2));
  const inOrder = spoken.every((s, i) => s.text === lines[i].text);
  ok(spoken.length === lines.length && inOrder, `${spoken.length}/${lines.length} spoken in order`);
  ok(spoken.every((s) => s.voice === "Local Test Voice") && most === 1, `network voice used or overlap (most at once ${most})`);
  rows.push({ measure: "Exchange lines spoken (stubbed voices: one local, one network)", before: "n/a", after: `${spoken.length} of ${lines.length} in order, local voice only, at most ${most} at once; voice off: 0 spoken, ${captions} captions`, source: "check_hive4 5" });
  return `${spoken.length}/${lines.length} exchange lines spoken in order on the local voice, network 0, at most ${most} at once; voice off: 0 spoken, ${captions} captions`;
});

// 6 — trait recovery (declared in docs/consoles/HIVE-4.md before the first run)
const mulberry = (seed) => { let a = seed >>> 0; return () => { a = (a + 0x6d2b79f5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; };
const r3 = (x) => Math.round(x * 1000) / 1000;
function persona(seed) {
  const r = mulberry(seed * 7919 + 13);
  const traits = { warmth: r3(r()), formality: r3(r()), verbosity: r3(r()), caution: r3(r()) };
  const like = D.OH_AGENTS[seed % 7];
  return { ...like, id: `h4-persona-${seed}`, name: like.name, traits, style: D.ohStyleFromTraits(traits, like.lexicon) };
}
const STRIP = new Set(["type", "agent", "text", "caption", "floor", "exchange", "memory"]);
function linesOf(sayer, events) {
  const recent = []; const out = [];
  for (const e of speaks(events)) {
    const facts = Object.fromEntries(Object.entries(e).filter(([k]) => !STRIP.has(k)));
    const line = S.ohSay(sayer, facts, { variety: true, recent: recent.slice(-4) });
    if (line) { out.push(line); recent.push(line); }
  }
  return out;
}
const RX = {
  warm: /\b(thanks|thank|glad|nice|good|cheers|everyone|team|teamwork|friends|hi|hey|great|pleased|gladly|kindly|patience)\b/gi,
  formal: /\b(note|noted|record|recorded|confirming|kindly|please|verified|logged|clarity|may)\b/gi,
  careful: /(simulated robot only|e-stop|governor agrees|site's limits|\bsafe\b|\bchecking\b)/gi,
  brisk: /(without delay|right away|as quick as the rules allow|moving on|\bnext\b|done here|\bonward\b|that is all)/gi,
};
function features(lines) {
  const f = [0, 0, 0, 0, 0, 0, 0, 0];
  for (const l of lines) {
    const ss = S.ohSentences(l); const words = ss.reduce((a, s) => a + S.ohWords(s).length, 0);
    const first = /^((?:\S+\s){0,3}\S+?)[,:]\s/.exec(l); const opener = !!first && !NAMES.includes(l.split(/[\s,:]/)[0]);
    f[0] += words / Math.max(1, ss.length); f[1] += ss.length; f[2] += opener ? 1 : 0;
    f[3] += (l.match(RX.warm) ?? []).length; f[4] += (l.match(RX.formal) ?? []).length; f[5] += (l.match(RX.careful) ?? []).length; f[6] += (l.match(RX.brisk) ?? []).length;
    f[7] += (l.match(/,/g) ?? []).length / Math.max(1, ss.length);
  }
  return f.map((x) => x / Math.max(1, lines.length));
}
function ridge(X, y, lambda = 1) {
  const n = X.length, p = X[0].length;
  const mu = Array.from({ length: p }, (_, j) => X.reduce((a, r) => a + r[j], 0) / n);
  const sd = Array.from({ length: p }, (_, j) => Math.sqrt(X.reduce((a, r) => a + (r[j] - mu[j]) ** 2, 0) / n) || 1);
  const Z = X.map((r) => r.map((v, j) => (v - mu[j]) / sd[j]));
  const ym = y.reduce((a, b) => a + b, 0) / n;
  const A = Array.from({ length: p }, (_, i) => Array.from({ length: p }, (_, j) => Z.reduce((a, r) => a + r[i] * r[j], 0) + (i === j ? lambda : 0)));
  const bvec = Array.from({ length: p }, (_, i) => Z.reduce((a, r, k) => a + r[i] * (y[k] - ym), 0));
  for (let i = 0; i < p; i += 1) { let piv = i; for (let k = i + 1; k < p; k += 1) if (Math.abs(A[k][i]) > Math.abs(A[piv][i])) piv = k; [A[i], A[piv]] = [A[piv], A[i]]; [bvec[i], bvec[piv]] = [bvec[piv], bvec[i]]; for (let k = i + 1; k < p; k += 1) { const f = A[k][i] / A[i][i]; for (let j = i; j < p; j += 1) A[k][j] -= f * A[i][j]; bvec[k] -= f * bvec[i]; } }
  const w = new Array(p).fill(0); for (let i = p - 1; i >= 0; i -= 1) { let s = bvec[i]; for (let j = i + 1; j < p; j += 1) s -= A[i][j] * w[j]; w[i] = s / A[i][i]; }
  return (x) => ym + x.reduce((a, v, j) => a + ((v - mu[j]) / sd[j]) * w[j], 0);
}
const ranks = (xs) => { const idx = xs.map((v, i) => [v, i]).sort((a, b) => a[0] - b[0]); const r = new Array(xs.length); for (let i = 0; i < idx.length;) { let j = i; while (j + 1 < idx.length && idx[j + 1][0] === idx[i][0]) j += 1; for (let k = i; k <= j; k += 1) r[idx[k][1]] = (i + j) / 2 + 1; i = j + 1; } return r; };
const pearson = (a, b) => { const n = a.length, ma = a.reduce((x, y) => x + y, 0) / n, mb = b.reduce((x, y) => x + y, 0) / n; let num = 0, da = 0, db = 0; for (let i = 0; i < n; i += 1) { num += (a[i] - ma) * (b[i] - mb); da += (a[i] - ma) ** 2; db += (b[i] - mb) ** 2; } return num / Math.sqrt(da * db || 1); };
const spearman = (a, b) => pearson(ranks(a), ranks(b));
await check("6 trait recovery from text: ridge on eight declared line features, fit seeds 1-50, Spearman per trait on held-out seeds 51-100", () => {
  const unit = (seed) => { const p = persona(seed); const day = H.ohHiveDay(seed, { nJobs: 60, ticksPerDay: 160, decide: standIn, ...TALK }); return { p, x: features(linesOf(p, day.events)) }; };
  const fit = Array.from({ length: 50 }, (_, i) => unit(i + 1));
  const held = Array.from({ length: 50 }, (_, i) => unit(i + 51));
  const out = {}; const real = {};
  const day101 = H.ohHiveDay(101, { nJobs: 60, ticksPerDay: 160, decide: standIn, ...TALK });
  const realX = D.OH_AGENTS.map((a) => features(linesOf(a, day101.events)));
  for (const k of D.OH_TRAITS) {
    const model = ridge(fit.map((u) => u.x), fit.map((u) => u.p.traits[k]), 1);
    out[k] = r3(spearman(held.map((u) => model(u.x)), held.map((u) => u.p.traits[k])));
    real[k] = r3(spearman(realX.map((x) => model(x)), D.OH_AGENTS.map((a) => a.traits[k])));
  }
  rows.push({ measure: "Trait recovery: Spearman rho per trait, 50 held-out personas (seeds 51-100; ridge fitted on seeds 1-50)", before: "not measured", after: D.OH_TRAITS.map((k) => `${k} ${out[k]}`).join(", "), source: "check_hive4 6 (declared in docs/consoles/HIVE-4.md, commit ca8e2deb; the first held-out run, before the band fix changed the padding, read warmth 0.963, formality 0.812, verbosity 0.979, caution 0.804)" });
  rows.push({ measure: "Trait recovery on the seven real agents (seed 101; n = 7, secondary)", before: "not measured", after: D.OH_TRAITS.map((k) => `${k} ${real[k]}`).join(", "), source: "check_hive4 6" });
  evals.push(`trait recovery (held-out 51-100): ${JSON.stringify(out)}; real agents (n=7): ${JSON.stringify(real)}`);
  return `held-out Spearman ${D.OH_TRAITS.map((k) => `${k} ${out[k]}`).join(", ")}; the seven agents ${D.OH_TRAITS.map((k) => `${k} ${real[k]}`).join(", ")}`;
});

// 7 — distinct-2
function distinct2(lines) {
  const mask = (l) => { let s = l.replace(/vbjob-[0-9a-f]+/g, " J "); for (const x of SITES) s = s.split(x.name).join(" S "); for (const n of NAMES) s = s.replace(new RegExp(`\\b${n}\\b`, "g"), " A "); return s.replace(/\b\d{2}:\d{2}\b/g, " N ").replace(/-?\d+(?:\.\d+)?/g, " N "); };
  const seen = new Set(); let total = 0;
  for (const l of lines) { const w = S.ohWords(mask(l).toLowerCase()).map((x) => x.replace(/[^\p{L}\p{N}'-]/gu, "")).filter(Boolean); for (let i = 1; i < w.length; i += 1) { seen.add(`${w[i - 1]} ${w[i]}`); total += 1; } }
  return total ? r3(seen.size / total) : 0;
}
await check("7 repetition per agent (distinct-2 over fact-masked lines), before -> after", () => {
  const before = speaks(baseDay().events), after = speaks(talkDay().events);
  const varOnly = speaks(H.ohHiveDay(7, { decide: standIn, variety: true }).events);
  const per = D.OH_AGENTS.map((a) => {
    const b = distinct2(before.filter((e) => e.agent === a.id).map((e) => e.text)), x = distinct2(after.filter((e) => e.agent === a.id).map((e) => e.text)), v = distinct2(varOnly.filter((e) => e.agent === a.id).map((e) => e.text));
    return { a, b, x, v };
  });
  const better = per.filter((r) => r.x > r.b).length, betterV = per.filter((r) => r.v > r.b).length;
  ok(better >= 6, `distinct-2 rose for ${better} of 7 agents`);
  rows.push({ measure: "Distinct-2 per agent (seed 7, fact-masked): before -> after (variety only, same events)", before: per.map((r) => `${r.a.name} ${r.b}`).join(", "), after: per.map((r) => `${r.a.name} ${r.x} (${r.v})`).join(", "), source: "check_hive4 7" });
  evals.push(`distinct-2: ${per.map((r) => `${r.a.name} ${r.b} -> ${r.x} (variety only ${r.v})`).join("; ")}`);
  return `${better}/7 agents rose with the talk on, ${betterV}/7 with variety only: ${per.map((r) => `${r.a.name} ${r.b} -> ${r.x} (${r.v})`).join(", ")}`;
});

// 8 — the console tab
const TAB = "WebXR/instructor/js/h4-hive.js";
const JSON_PATH = "WebXR/instructor/hive4-evals.json";
await check("8 the instructor console's Omega Hive tab: read-only and local, built without markup strings, the evals from the committed JSON", () => {
  const html = read("WebXR/instructor/index.html"), app = read("WebXR/instructor/js/app.js"), tab = read(TAB), py = read("tools/bundle_webxr.py");
  ok(/id="tab-hive" role="tab"[^>]*aria-controls="view-hive"[^>]*>Omega Hive</.test(html) && /<section id="view-hive" role="tabpanel" aria-labelledby="tab-hive" hidden>/.test(html) && html.includes('id="h4-root"'), "index.html: the tab and its panel");
  ok(/\["hive", "tab-hive", "view-hive"\]/.test(app) && /h4MountHiveTab\(/.test(app), "app.js: the view switch and the mount");
  ok(tab.length > 0 && !/innerHTML|outerHTML|insertAdjacentHTML|document\.write/.test(tab), "the tab builds from createElement/textContent only");
  ok(!/\.(approve|decline|setSupervise|setEstop)\(|auditAppend|ent3AuditAppend|localStorage|sessionStorage|\.speak\(/.test(tab), "the tab is read-only: no approve, decline, supervise, e-stop, audit write, storage or speech");
  const urls = [.../export const H4_EVALS_URLS = Object\.freeze\(\[([^\]]+)\]\)/.exec(tab)?.[1].matchAll(/"([^"]+)"/g) ?? []].map((m) => m[1]);
  const fetches = [...tab.matchAll(/fetch\(([^)]*)\)/g)].map((m) => m[1]);
  ok(fetches.length === 1 && fetches[0] === "H4_EVALS_URLS[i]" && urls.length === 2 && urls.every((u) => /^\.\.?\/hive4-evals\.json$/.test(u)) && existsSync(join(ROOT, JSON_PATH)), `the tab fetches only the committed evals JSON beside the page, same origin (${fetches.join(" ")}: ${urls.join(", ")})`);
  ok(/audit: null/.test(tab), "the tab's hive writes nothing to the governance registry");
  ok(py.indexOf('WEBXR / "instructor/js/h4-hive.js"') > py.indexOf('SHARED / "oh-hive.js"', py.indexOf('"instructor": {')) && py.indexOf('WEBXR / "instructor/js/h4-hive.js"') < py.indexOf('WEBXR / "instructor/js/app.js"'), "bundle_webxr.py: the instructor bundle lists the hive and the tab before app.js");
  return "tab and panel present, read-only, one same-origin fetch (the evals JSON), bundled before app.js";
});

// 9 — hygiene
await check("9 hygiene: no network or model call in the hive and the tab, no import aliases, the prefix, check_all and baseline, docs", () => {
  const files = ["WebXR/shared/oh-hive.js", "WebXR/shared/oh-say.js", "WebXR/shared/oh-panel.js", TAB];
  const model = new RegExp(["cla", "ude-[a-z]+-\\d|gpt-\\d|gem", "ini-\\d"].join(""), "i");
  for (const f of files) {
    const src = read(f).replace(/^\s*(\/\/|\*).*$/gm, "");
    ok(!/import \{[^}]*\bas\b[^}]*\}/.test(src), `${f}: an import alias`);
    ok(!model.test(read(f)), `${f}: a model identifier`);
    ok(!/XMLHttpRequest|WebSocket|sendBeacon|EventSource|getUserMedia|SpeechRecognition/.test(src), `${f}: a network or listening call`);
    if (f !== TAB) ok(!/\bfetch\(/.test(src), `${f}: fetch`);
  }
  for (const m of read(TAB).matchAll(/^(?:export )?(?:async )?(?:function|const|let|var|class) ([A-Za-z_$][\w$]*)/gm)) ok(/^(h4|H4_)/.test(m[1]), `${TAB}: top-level ${m[1]} lacks the h4 prefix`);
  ok(read("tools/check_all.mjs").includes("check_hive4.mjs") && /check_hive4/.test(read("docs/perf/checkers-baseline.json")), "check_all.mjs and the baseline row");
  for (const f of ["docs/consoles/HIVE-4.md", "docs/consoles/memory/HIVE-4.md", "tools/briefs/next/h4-next.md"]) ok(existsSync(join(ROOT, f)), `missing ${f}`);
  return `${files.length} files clean; check_all and the baseline list this checker; docs present`;
});

// The committed evals JSON (the console tab reads it).
await check("10 WebXR/instructor/hive4-evals.json matches this run", () => {
  const doc = { schema: "smartcitix.holodeck.hive4-evals@1", note: "Written by node tools/check_hive4.mjs --write. Before is the base 048869d5 (the default hive, byte-identical); after is the panel's configuration. No timings.", rows };
  if (WRITE) { writeFileSync(join(ROOT, JSON_PATH), `${JSON.stringify(doc, null, 2)}\n`); return `wrote ${rows.length} rows`; }
  const have = (() => { try { return JSON.parse(read(JSON_PATH)); } catch (_) { return null; } })();
  ok(have && JSON.stringify(have.rows) === JSON.stringify(rows), "the committed JSON differs from this run (node tools/check_hive4.mjs --write)");
  return `${rows.length} rows match`;
});

console.log(`\n${passed} passed, ${failed} failed`);
for (const e of evals) console.log(`EVAL ${e}`);
process.exitCode = failed ? 1 : 0;
