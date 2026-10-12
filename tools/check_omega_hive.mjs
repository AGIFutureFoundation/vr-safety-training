#!/usr/bin/env node
/**
 * OMEGA-HIVE (docs/omega-hive.md, docs/consoles/OMEGA-HIVE.md): the agent collective that manages the simulated robots.
 * Every claim in the console's hand-back is a line this prints.
 *   1. seven agents: persona (invented name, role, home robot site), avatar (an av-sprites glyph, an outfit), traits in [0, 1],
 *      a style that re-derives from the traits, voice parameters, the "software agent" label
 *   2. the contract with AGENT-AVATARS: the API, the eight event types, every event's agent and site, on/off, "*"
 *   3. determinism by seed
 *   4. the governor: every dispatched job checked, every run step monitored, no physical dispatch, vetoes never grant,
 *      approvals requested wherever the physical path is named, approving lets only a simulated job run, e-stop first
 *   5. ENTERPRISE-3's audit chain gets every award, veto, refusal, approval request, approval and decline; chain intact
 *   6. style adherence: each agent's words per sentence inside its band
 *   7. grounding: every number, id and site name in a line appears in its event
 *   8. the Kids rule's calm-text scan over every line
 *   9. personality distinctiveness: naive Bayes trained on seeds 1-100, tested on 101-200 (with a neutral-style control)
 *  10. coordination: a seeded 200-job day, the hive against a single dispatcher
 *  11. voice: on-device only (a stubbed network voice is never chosen), off by default, captions without voice, a queue
 *      with no overlap, stop on page hide, rate and pitch applied
 *  12. nothing listens, nothing is sent: no microphone, recognition or network code; the adapter refuses unconfigured
 *  13. wiring: the panel mount behind DATAWORKS' eligibility (not K-12, demo or signed-out), the bundle list, check_all
 *  14. hygiene: no model identifier, no claim wording
 * Run: node tools/check_omega_hive.mjs   (OH_ROOT=<tree> runs it against another checkout, for a before measurement)
 */
import { readFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const ROOT = process.env.OH_ROOT || join(dirname(fileURLToPath(import.meta.url)), "..");
const t0 = Date.now();
let passes = 0, failures = 0;
const evals = [];
async function check(name, fn) {
  try { const note = await fn(); passes += 1; console.log(`ok   ${name}${note ? ` — ${note}` : ""}`); }
  catch (e) { failures += 1; console.log(`FAIL ${name} — ${e?.message ?? e}`); }
}
function ok(cond, msg) { if (!cond) throw new Error(msg); }
const imp = async (f) => { try { return await import(pathToFileURL(join(ROOT, f)).href); } catch (e) { return { __missing: `${f}: ${String(e?.message ?? e).split("\n")[0]}` }; } };
const need = (m) => { if (m.__missing) throw new Error(m.__missing); return m; };
const src = (f) => { try { return readFileSync(join(ROOT, f), "utf8"); } catch (_) { return ""; } };

const D = await imp("WebXR/shared/oh-hive-data.js");
const S = await imp("WebXR/shared/oh-say.js");
const H = await imp("WebXR/shared/oh-hive.js");
const V = await imp("WebXR/shared/oh-voice.js");
const RB = await imp("WebXR/shared/rb-robotics-data.js");
const AV = await imp("WebXR/shared/av-sprites.js");
const NPC = await imp("WebXR/shared/npc-data.js");
const E3 = await imp("WebXR/shared/ent3-governance.js");
const DX = await imp("WebXR/shared/dx-data.js");
const VG = await imp("WebXR/shared/vb-governor.js");

const SITE_NAMES = (RB.RB_SITES ?? []).map((s) => s.name);
const FEAR = /\b(danger\w*|deadly|death|die[sd]?|kill\w*|crush\w*|injur\w*|hurt\w*|maim\w*|scar(y|e[sd]?)|fear\w*|terrif\w*|amputat\w*|blood\w*)\b/i;
const standIn = (r) => (parseInt(String(r.jobId).slice(-2), 16) % 2 ? "approve" : "decline"); // a seeded stand-in for the person, labelled as such
let DAY = null, SINGLE = null;
const day = () => { if (!DAY) DAY = need(H).ohHiveDay(7, { decide: standIn }); return DAY; };

// 1 — the seven agents
await check("1 seven agents with a persona, a voice and an avatar; styles re-derive from the traits", () => {
  need(D); need(RB); need(AV);
  const A = D.OH_AGENTS; ok(A.length === 7, `${A.length} agents`);
  const keys = ["dispatcher", "safety-steward", "maintenance-planner", "consent-keeper", "trainer", "auditor", "logistics"];
  ok(keys.every((k) => A.some((a) => a.key === k)), "a role is missing");
  ok(new Set(A.map((a) => a.id)).size === 7 && new Set(A.map((a) => a.name)).size === 7, "ids or names repeat");
  const griot = new Set((NPC.GR_ROSTER ?? []).map((c) => c.name));
  let full = 0;
  for (const a of A) {
    ok(/^[A-Z][a-z]{1,9}$/.test(a.name) && !griot.has(a.name), `${a.id}: name "${a.name}" is not one invented first name`);
    ok(a.label === "software agent", `${a.id}: label`);
    ok(typeof a.role === "string" && a.role.length > 30 && a.role.startsWith(a.key === "safety-steward" ? "Safety steward" : a.key === "maintenance-planner" ? "Maintenance planner" : a.key === "consent-keeper" ? "Consent keeper" : a.key[0].toUpperCase() + a.key.slice(1)), `${a.id}: role sentence`);
    ok(RB.RB_SITES.some((s) => s.id === a.homeSite), `${a.id}: home site ${a.homeSite}`);
    ok(AV.AV_GLYPHS.includes(a.avatar.glyph) && Number.isInteger(a.avatar.accent) && D.OH_OUTFITS.includes(a.avatar.outfit), `${a.id}: avatar`);
    ok(AV.avSpriteSvg(AV.avAgentLook(a.avatar.glyph, a.avatar.accent), { kind: "portrait" }).startsWith("<svg"), `${a.id}: portrait`);
    ok(D.OH_TRAITS.every((k) => typeof a.traits[k] === "number" && a.traits[k] >= 0 && a.traits[k] <= 1), `${a.id}: traits`);
    ok(JSON.stringify(a.style) === JSON.stringify(D.ohStyleFromTraits(a.traits, a.lexicon)), `${a.id}: style does not re-derive from the traits`);
    ok(a.style.band[1] - a.style.band[0] === 6 && a.style.openers.length >= 2 && a.style.closers.length === 2 && a.style.pad.length >= 3, `${a.id}: style parts`);
    ok(a.voice.lang === "en-US" && a.voice.rate >= 0.5 && a.voice.rate <= 2 && a.voice.pitch >= 0.5 && a.voice.pitch <= 2 && Array.isArray(a.voice.prefer), `${a.id}: voice`);
    full += 1;
  }
  const bands = A.map((a) => `${a.key} ${a.style.band.join("-")}`).join(", ");
  evals.push(`agents with a persona, voice and avatar: 0 -> ${full}/7`);
  return `${full}/7 complete; bands ${bands}`;
});

// 2 — the contract
await check("2 the contract with AGENT-AVATARS: API, event types, agents and sites, on/off and '*'", () => {
  need(H);
  const hive = H.ohHive({ seed: 3, nJobs: 30, ticksPerDay: 60, decide: standIn });
  for (const f of ["step", "run", "on", "off", "events", "approve", "decline"]) ok(typeof hive[f] === "function", `missing ${f}()`);
  ok(Array.isArray(hive.agents) && hive.agents.length === 7, "agents");
  let star = 0, speaks = 0; const fn = () => { speaks += 1; };
  hive.on("*", () => { star += 1; }); hive.on("speak", fn);
  hive.run(20); const mid = speaks; hive.off("speak", fn); hive.run(40);
  const ev = hive.events(); const ids = new Set(D.OH_AGENTS.map((a) => a.id)); const sites = new Set(RB.RB_SITES.map((s) => s.id));
  ok(star === ev.length - ev.filter((e) => e.t === 0).length, `"*" saw ${star} of ${ev.length - ev.filter((e) => e.t === 0).length}`);
  ok(speaks === mid && mid > 0, "off() did not stop delivery");
  for (const e of ev) {
    ok(H.OH_EVENT_TYPES.includes(e.type), `type ${e.type}`);
    ok(Number.isInteger(e.t) && ids.has(e.agent), `event agent ${e.agent}`);
    if (e.to != null) ok(sites.has(e.to), `site ${e.to}`);
    if (e.type === "speak") ok(typeof e.text === "string" && e.text && e.caption.includes("software agent"), "speak without text or label");
  }
  const types = [...new Set(ev.map((e) => e.type))].sort();
  return `${ev.length} events, types seen: ${types.join(", ")}`;
});

// 2b — against a fixture of AGENT-AVATARS' side (aaMountAgentAvatars reads only on(type, fn) and the events)
await check("2b against an avatar-side fixture: figures follow move events, every job starts where its agent stands, one talk span per line", () => {
  // The fixture: one figure per agent at its home site; move -> walks to `to`; speak -> the talk indicator for that line only.
  const aaFixture = ({ agents, source }) => {
    const fig = new Map(agents.map((a) => [a.id, { site: a.homeSite, talking: false, talks: 0, moves: 0 }]));
    const bad = [];
    for (const ty of ["speak", "move", "dispatch", "refused", "complete", "approval-request", "award", "bid"]) source.on(ty, (e) => {
      const f = fig.get(e.agent); if (!f) { bad.push(`unknown agent ${e.agent}`); return; }
      if (ty === "move") { if (!e.to) bad.push("move without to"); if (e.to === f.site) bad.push(`move to where ${e.agent} already stands`); f.site = e.to; f.moves += 1; }
      if (ty === "speak") { if (f.talking) bad.push("talk overlap"); f.talking = true; f.talks += 1; if (!e.text) bad.push("speak without text"); f.talking = false; }
      if (ty === "dispatch" && e.to !== f.site) bad.push(`${e.agent} starts ${e.jobId} at ${e.to} while standing at ${f.site}`);
    });
    return { fig, bad };
  };
  const hive = H.ohHive({ seed: 7, decide: standIn });
  const fx = aaFixture({ agents: D.OH_AGENTS, source: hive });
  hive.run(480);
  ok(!fx.bad.length, `${fx.bad.length} problems: ${fx.bad.slice(0, 3).join(" | ")}`);
  const moves = [...fx.fig.values()].reduce((a, f) => a + f.moves, 0), talks = [...fx.fig.values()].reduce((a, f) => a + f.talks, 0);
  const dispatches = hive.events().filter((e) => e.type === "dispatch").length;
  return `${moves} moves followed, ${dispatches}/${dispatches} jobs started where their agent stands, ${talks} speak events with one talk span each`;
});

// 3 — determinism
await check("3 deterministic by seed", () => {
  const a = JSON.stringify(H.ohHiveDay(7, { decide: standIn, nJobs: 60, ticksPerDay: 160 }).events);
  const b = JSON.stringify(H.ohHiveDay(7, { decide: standIn, nJobs: 60, ticksPerDay: 160 }).events);
  const c = JSON.stringify(H.ohHiveDay(8, { decide: standIn, nJobs: 60, ticksPerDay: 160 }).events);
  ok(a === b, "the same seed gave different events"); ok(a !== c, "different seeds gave the same events");
  return `seed 7 twice identical (${a.length} bytes), seed 8 differs`;
});

// 4 — the governor
await check("4 governor: every dispatched step checked, vetoes never grant, approvals wherever the physical path is named, e-stop first", () => {
  const { hive, metrics: m, events: ev } = day();
  ok(m.dispatched > 100 && m.dispatchedChecked === m.dispatched, `dispatched ${m.dispatched}, checked allow ${m.dispatchedChecked}`);
  ok(m.stepsMonitored === m.steps, `steps monitored ${m.stepsMonitored} of ${m.steps}`);
  ok(m.physicalDispatched === 0, `${m.physicalDispatched} physical dispatches`);
  const jobs = hive.jobs(); const log = hive.log();
  const dispatchedIds = new Set(ev.filter((e) => e.type === "dispatch").map((e) => e.jobId));
  const vetoed = jobs.filter((j) => j.status === "vetoed");
  ok(vetoed.length > 0 && vetoed.every((j) => !dispatchedIds.has(j.jobId) && j.phase === "NEGOTIATION"), "a vetoed job moved past negotiation");
  const refusedIds = new Set(log.filter((l) => l.action === "oh-refuse").map((l) => l.detail.split(" ")[0]));
  ok(!log.some((l) => l.action === "oh-veto" && refusedIds.has(l.detail.split(" ")[0])), "the steward was consulted on a governor refusal");
  const needApproval = jobs.filter((j) => j.firstId && (j.target === "physical" || j.approvedSim));
  const requested = new Set(ev.filter((e) => e.type === "approval-request").map((e) => e.jobId));
  ok(needApproval.length > 0 && needApproval.every((j) => requested.has(j.firstId)), `approval requests ${requested.size} for ${needApproval.length} physical-path jobs`);
  const approved = jobs.filter((j) => j.approvedSim);
  ok(approved.every((j) => j.target === "sim" && j.jobId !== j.firstId && !dispatchedIds.has(j.firstId)), "an approval dispatched something other than a new simulated job");
  ok(jobs.filter((j) => j.status === "declined").every((j) => !dispatchedIds.has(j.jobId)), "a declined job ran");
  // e-stop first: an e-stop held at one site from the start means no job ever runs there.
  const site = "rb-site-soma-robot-cell";
  const gov = need(VG).vbGovernor({ estops: [site] });
  const hs = H.ohHiveDay(7, { decide: standIn, governor: gov });
  const ranThere = hs.events.filter((e) => e.type === "dispatch" && e.to === site).length;
  const refusedThere = hs.events.filter((e) => e.type === "refused" && e.to === site && e.reason === "estop-held").length;
  ok(ranThere === 0 && refusedThere > 0, `e-stop: ${ranThere} ran, ${refusedThere} refused estop-held`);
  evals.push(`governor: dispatched jobs checked ${m.dispatchedChecked}/${m.dispatched}; run steps monitored ${m.stepsMonitored}/${m.steps}; vetoes ${vetoed.length}, dispatched after a veto 0; approvals requested ${needApproval.filter((j) => requested.has(j.firstId)).length}/${needApproval.length} (100%); physical dispatches 0; e-stop site: 0 runs, ${refusedThere} refused`);
  return `checked ${m.dispatchedChecked}/${m.dispatched}, monitored ${m.stepsMonitored}/${m.steps}, vetoed ${vetoed.length} (0 ran), approvals ${requested.size}/${needApproval.length}, approved ${approved.length} ran as new sim jobs only, e-stop site 0 runs / ${refusedThere} refused`;
});

// 5 — ENTERPRISE-3's audit chain
await check("5 ENTERPRISE-3's audit chain gets every award, veto, refusal, approval request, approval and decline", () => {
  need(E3);
  const mem = new Map(); E3.ent3UseStorage({ getItem: (k) => (mem.has(k) ? mem.get(k) : null), setItem: (k, v) => mem.set(k, String(v)), removeItem: (k) => mem.delete(k) });
  try {
    const { hive, events: ev } = H.ohHiveDay(11, { decide: standIn, audit: E3.ent3AuditAppend, nJobs: 40, ticksPerDay: 100 });
    const lines = E3.ent3AuditList(); const count = (a) => lines.filter((l) => l.action === a).length;
    const n = (type, pred = () => true) => ev.filter((e) => e.type === type && pred(e)).length;
    const want = { "oh-award": n("award"), "oh-veto": n("refused", (e) => e.reason === "steward-veto"), "oh-refuse": n("refused", (e) => e.by === "governor"), "oh-approval-request": n("approval-request"), "oh-decline": n("refused", (e) => e.reason === "supervisor-declined"), "oh-dispatch": n("dispatch"), "oh-complete": n("complete") };
    for (const [a, k] of Object.entries(want)) ok(count(a) === k, `${a}: ${count(a)} lines for ${k} events`);
    ok(count("oh-approve") === hive.log().filter((l) => l.action === "oh-approve").length, "approvals");
    ok(count("vb-allow") + count("vb-refuse") > 0, "the governor's own lines are not in the chain");
    const v = E3.ent3VerifyAudit(); ok(v.ok, `chain broken at ${v.brokenAt}`);
    ok(hive.verify().ok && hive.verify().lines === lines.filter((l) => l.action.startsWith("oh-")).length, "the hive's own chain and ENTERPRISE-3's disagree");
    return `${lines.length} lines intact (${Object.entries(want).map(([a, k]) => `${a} ${k}`).join(", ")}, oh-approve ${count("oh-approve")}, governor ${count("vb-allow") + count("vb-refuse")})`;
  } finally { E3.ent3UseStorage(null); }
});

// speak lines of the seeded day
const speaksOf = (ev) => ev.filter((e) => e.type === "speak");

// 6 — style adherence
await check("6 style adherence: each agent's words per sentence inside its declared band", () => {
  const sp = speaksOf(day().events); const rows = [];
  let inside = 0, allS = 0, inS = 0;
  for (const a of D.OH_AGENTS) {
    const lens = sp.filter((e) => e.agent === a.id).flatMap((e) => S.ohSentences(e.text).map((x) => S.ohWords(x).length));
    ok(lens.length > 0, `${a.id} said nothing`);
    const mean = lens.reduce((x, y) => x + y, 0) / lens.length;
    const hit = lens.filter((n) => n >= a.style.band[0] && n <= a.style.band[1]).length; allS += lens.length; inS += hit;
    if (mean >= a.style.band[0] && mean <= a.style.band[1]) inside += 1;
    rows.push(`${a.key} ${mean.toFixed(1)} in ${a.style.band.join("-")} (${hit}/${lens.length})`);
  }
  ok(inside === 7, `${inside}/7 inside: ${rows.join("; ")}`);
  evals.push(`style adherence: ${inside}/7 agents' mean words per sentence inside the band; ${inS}/${allS} sentences (${(100 * inS / allS).toFixed(1)}%) inside`);
  return `${inside}/7; ${rows.join("; ")}`;
});

// 7 — grounding
await check("7 grounding: every number, id and site name in a line appears in its event", () => {
  const sp = speaksOf(day().events); let good = 0; const bad = [];
  for (const e of sp) { const g = S.ohGrounded(e.text, e, { siteNames: SITE_NAMES }); if (g.ok && g.facts.length) good += 1; else bad.push(`${e.text} [${g.missing.join(", ") || "no fact"}]`); }
  const factless = sp.filter((e) => !S.ohGrounded(e.text, e, { siteNames: SITE_NAMES }).facts.length).length;
  ok(bad.length === factless && bad.every((b) => b.endsWith("[no fact]")), `ungrounded: ${bad.filter((b) => !b.endsWith("[no fact]")).slice(0, 3).join(" | ")}`);
  // a planted fact is caught
  const e0 = sp.find((e) => e.jobId); ok(!S.ohGrounded(`${e0.text} Score 0.123 at rb-site-nowhere.`, e0, { siteNames: SITE_NAMES }).ok, "a planted number and site id were not caught");
  const total = sp.length - factless;
  evals.push(`grounding: ${good}/${total} lines with facts have every fact in their event (${factless} lines carry no fact)`);
  return `${good}/${total} grounded; ${factless} lines with no fact; a planted fact is caught`;
});

// 8 — calm text
await check("8 Kids rule: calm text in every line, role and panel note", () => {
  const texts = [...speaksOf(day().events).map((e) => e.text), ...D.OH_AGENTS.map((a) => a.role), ...Object.values(D.OH_REASON_PHRASES), src("WebXR/shared/oh-panel.js").match(/"Seven software agents[^"]+"/)?.[0] ?? ""];
  const bad = texts.filter((t) => FEAR.test(t)); ok(!bad.length, `fear framing: ${bad.slice(0, 3).join(" | ")}`);
  return `${texts.length} strings, 0 flagged`;
});

// 9 — distinctiveness
await check("9 personality distinctiveness: naive Bayes trained on seeds 1-100 names the speaker on seeds 101-200", () => {
  const norm = (t) => S.ohWords(t.toLowerCase().replace(/vbjob-[0-9a-f]+/g, " jobid ").replace(/\d+(\.\d+)?/g, " num ")).map((w) => w.replace(/[^a-z0-9'-]/g, "")).filter(Boolean);
  const corpus = (lo, hi) => { const rows = []; for (let s = lo; s <= hi; s += 1) for (const e of speaksOf(H.ohHiveDay(s, { decide: standIn, nJobs: 12, ticksPerDay: 40 }).events)) rows.push(e); return rows; };
  const train = corpus(1, 100), test = corpus(101, 200);
  const agents = D.OH_AGENTS.map((a) => a.id);
  const fit = (rows, textOf) => {
    const m = { prior: {}, counts: {}, totals: {}, vocab: new Set() };
    for (const id of agents) { m.prior[id] = 0; m.counts[id] = new Map(); m.totals[id] = 0; }
    for (const r of rows) { m.prior[r.agent] += 1; for (const w of norm(textOf(r))) { m.vocab.add(w); m.counts[r.agent].set(w, (m.counts[r.agent].get(w) ?? 0) + 1); m.totals[r.agent] += 1; } }
    return m;
  };
  const predict = (m, text, n) => { let best = null, bs = -Infinity; for (const id of agents) { let s = Math.log((m.prior[id] + 1) / (n + agents.length)); for (const w of norm(text)) s += Math.log(((m.counts[id].get(w) ?? 0) + 1) / (m.totals[id] + m.vocab.size)); if (s > bs) { bs = s; best = id; } } return best; };
  const score = (textOf) => { const m = fit(train, textOf); let hit = 0; for (const r of test) if (predict(m, textOf(r), train.length) === r.agent) hit += 1; return hit / test.length; };
  const acc = score((r) => r.text);
  const agentOf = (id) => D.OH_AGENTS.find((a) => a.id === id);
  const neutral = score((r) => S.ohSay(agentOf(r.agent), r, { neutral: true }));
  const counts = {}; for (const r of test) counts[r.agent] = (counts[r.agent] ?? 0) + 1;
  const majority = Math.max(...Object.values(counts)) / test.length;
  ok(acc >= 0.85, `accuracy ${acc.toFixed(3)} under the pinned 0.85`);
  ok(acc > neutral, `personality ${acc.toFixed(3)} does not beat the neutral control ${neutral.toFixed(3)}`);
  evals.push(`personality distinctiveness: naive Bayes accuracy ${acc.toFixed(3)} on ${test.length} held-out lines (seeds 101-200; trained on ${train.length} lines, seeds 1-100) vs chance ${(1 / 7).toFixed(3)}; majority-class baseline ${majority.toFixed(3)}; same events in one neutral style (role signal only) ${neutral.toFixed(3)}`);
  return `accuracy ${acc.toFixed(3)} (chance ${(1 / 7).toFixed(3)}, majority ${majority.toFixed(3)}, neutral control ${neutral.toFixed(3)}); train ${train.length}, test ${test.length}`;
});

// 10 — coordination
await check("10 coordination: a seeded 200-job day, the hive against a single dispatcher", () => {
  const h = day().metrics; if (!SINGLE) SINGLE = H.ohHiveDay(7, { decide: standIn, mode: "single" }).metrics; const s = SINGLE;
  ok(h.jobs === 200 && s.jobs === 200, "not a 200-job day");
  ok(h.doubleAwards === 0 && s.doubleAwards === 0 && h.maxJobsPerRobot === 1 && s.maxJobsPerRobot === 1, "a job was awarded twice or a robot ran two jobs at once");
  ok(h.siteConflictsResolved === h.siteConflicts && s.siteConflictsResolved === s.siteConflicts, "a site conflict was left unresolved");
  ok(h.completed >= s.completed && h.meanTicksToAward < s.meanTicksToAward, "the hive did not beat the single dispatcher");
  ok(h.refused === s.refused && h.vetoed === s.vetoed && h.approvalRequests === s.approvalRequests, "the safety outcomes depend on who works the job");
  const row = (x) => `completed ${x.completed}/200, not accepted ${x.notAccepted}, refused ${x.refused}, vetoed ${x.vetoed}, declined ${x.declined}; mean steps to award ${x.meanTicksToAward}, to completion ${x.meanTicksToComplete}; contested awards ${x.contested} resolved (0 double awards); site conflicts ${x.siteConflictsResolved}/${x.siteConflicts} resolved; max jobs per robot ${x.maxJobsPerRobot}; awards to the best-skilled agent ${x.awardsToBestSkill}/${x.awards}`;
  evals.push(`coordination (seed 7, 200 jobs, 480 steps of one simulated minute): hive — ${row(h)} | single dispatcher — ${row(s)}`);
  return `hive: ${row(h)} || single: ${row(s)}`;
});

// 11 — voice
await check("11 voice: on-device only, off by default, captions without voice, no overlap, stop on hide, rate and pitch applied", () => {
  need(V);
  const mkSynth = (voices) => {
    const st = { spoken: [], speaking: null, overlaps: 0, cancels: 0 };
    return { st, getVoices: () => voices, speak(u) { if (st.speaking) st.overlaps += 1; st.speaking = u; st.spoken.push(u); u.onstart?.(); }, cancel() { st.cancels += 1; st.speaking = null; }, end() { const u = st.speaking; st.speaking = null; u?.onend?.(); } };
  };
  class U { constructor(text) { this.text = text; } }
  const local = { name: "Local Test Voice", lang: "en-US", localService: true }, network = { name: "Network Test Voice", lang: "en-US", localService: false };
  // off by default: nothing spoken, captions still emitted
  const synth0 = mkSynth([network, local]); const caps = [];
  const c0 = V.ohVoiceController({ synth: synth0, Utterance: U, doc: null, win: null, onCaption: (a, t) => caps.push(t) });
  for (const a of D.OH_AGENTS) c0.say(a, `line from ${a.name}`);
  ok(!c0.enabled() && synth0.st.spoken.length === 0 && caps.length === 7, `off by default: spoke ${synth0.st.spoken.length}, captions ${caps.length}`);
  // on: only the local voice, queued, never overlapping, with the agent's rate and pitch
  const synth = mkSynth([network, local]); const listeners = {};
  const doc = { visibilityState: "visible", addEventListener: (k, f) => { listeners[k] = f; } };
  const c = V.ohVoiceController({ synth, Utterance: U, doc, win: null }); c.setEnabled(true);
  let lines = 0; for (let i = 0; i < 3; i += 1) for (const a of D.OH_AGENTS) { c.say(a, `line ${i} from ${a.name}`); lines += 1; }
  ok(synth.st.spoken.length === 1 && c.queued() === lines - 1, "lines did not queue");
  while (synth.st.speaking) synth.end();
  ok(synth.st.spoken.length === lines && synth.st.overlaps === 0, `spoke ${synth.st.spoken.length}/${lines}, overlaps ${synth.st.overlaps}`);
  ok(synth.st.spoken.every((u) => u.voice === local && u.voice.localService === true), "a network voice was chosen");
  ok(synth.st.spoken.every((u, i) => { const a = D.OH_AGENTS[i % 7]; return u.rate === a.voice.rate && u.pitch === a.voice.pitch; }), "rate or pitch not applied");
  // only a network voice: silent, never chosen
  const synthN = mkSynth([network]); const cN = V.ohVoiceController({ synth: synthN, Utterance: U, doc: null, win: null }); cN.setEnabled(true); cN.say(D.OH_AGENTS[0], "hello");
  ok(synthN.st.spoken.length === 0 && V.ohPickVoice(D.OH_AGENTS[0], [network]) === null, "the network-only case spoke");
  // stop on hide
  for (const a of D.OH_AGENTS) c.say(a, "after");
  doc.visibilityState = "hidden"; listeners.visibilitychange?.();
  ok(c.queued() === 0 && !c.speaking() && synth.st.cancels >= 1, "hiding the page did not stop speech");
  evals.push(`voice: stubbed speechSynthesis with one local and one network voice — ${synth.st.spoken.length} utterances, all on the local voice, network voice chosen 0 times, overlaps 0; off by default (0 spoken, 7 captions)`);
  return `${synth.st.spoken.length} utterances on the local voice, network 0, overlaps 0; off by default spoke 0 with 7 captions; network-only silent; hide stops and empties the queue`;
});

// 12 — nothing listens, nothing is sent
await check("12 nothing listens and nothing is sent: no microphone, recognition or network code; the adapter refuses unconfigured", async () => {
  const files = ["oh-hive-data.js", "oh-say.js", "oh-voice.js", "oh-hive.js", "oh-panel.js"].map((f) => `WebXR/shared/${f}`);
  const bad = /SpeechRecognition|getUserMedia|MediaRecorder|webkitSpeech|\bfetch\s*\(|XMLHttpRequest|WebSocket|sendBeacon|EventSource|navigator\.mediaDevices/;
  for (const f of files) { const t = src(f); ok(t.length > 0, `${f} missing`); const code = t.split("\n").filter((l) => !/^\s*(\/\/|\*)/.test(l)).join("\n"); ok(!bad.test(code), `${f}: ${code.match(bad)?.[0]}`); }
  let fetched = 0; const saved = globalThis.fetch; globalThis.fetch = () => { fetched += 1; return Promise.reject(new Error("no")); };
  try {
    const ad = S.ohDialogueAdapter(D.OH_AGENTS[0]);
    const r = await ad.respond({ about: "announce", jobId: "vbjob-0123abcd", to: RB.RB_SITES[0].id, siteName: RB.RB_SITES[0].name, t: 1 });
    ok(r.ok === false && r.reason === S.OH_REFUSAL && r.source === "on-device" && fetched === 0, "the unconfigured adapter did not refuse cleanly");
    ad.configure({ endpoint: "https://example.invalid", model: "x" });
    ok(ad.describe().configured === false && ad.describe().missing.includes("transport"), "configured without a handed-in transport");
    const ad2 = S.ohDialogueAdapter(D.OH_AGENTS[0], { transport: async () => ({ text: "Job vbjob-ffff runs at 99 kph." }) }); ad2.configure({ endpoint: "https://example.invalid", model: "x" });
    const r2 = await ad2.respond({ about: "announce", jobId: "vbjob-0123abcd", to: RB.RB_SITES[0].id, siteName: RB.RB_SITES[0].name, t: 1 });
    ok(r2.source === "on-device" && fetched === 0, "an ungrounded configured reply was spoken");
  } finally { globalThis.fetch = saved; }
  return `${files.length} modules scanned clean; unconfigured adapter refused with "${S.OH_REFUSAL}", fetch called 0 times; an ungrounded configured reply falls back to the on-device line`;
});

// 13 — wiring
await check("13 wiring: the panel mounts behind DATAWORKS' eligibility (not K-12, demo or signed-out), bundle list, check_all, docs", () => {
  need(DX);
  const app = src("WebXR/parishes/js/app.js");
  ok(/import \{ ohMountHive \} from "\.\.\/\.\.\/shared\/oh-panel\.js"/.test(app), "app.js does not import ohMountHive");
  ok(/window\.__parishTest\.hive = [^\n]*!npParams\.has\("demo"\) && dxEligibility\(dxReadSignals\(\), \{ stage: "offer" \}\)[^\n]*ohMountHive\(\$\("menu-drills"\)/.test(app), "the mount is not gated by ?demo and dxEligibility at the offer stage");
  const el = (sg) => DX.dxEligibility(sg, { stage: "offer" }).eligible;
  ok(!el({ demo: true, signedIn: true, k12: false }) && !el({ demo: false, signedIn: false, k12: false }) && !el({ demo: false, signedIn: true, k12: true }) && !el({ demo: null, signedIn: true, k12: false }) && el({ demo: false, signedIn: true, k12: false }), "the gate's logic");
  const py = src("tools/bundle_webxr.py");
  // The parishes list carries the hive after the agent-jobs panel; the instructor list also carries oh-hive-data.js (the governance
  // tab's roster), earlier in the file, so each module is looked up after vb-panel.js's position.
  const vbAt = py.indexOf(`SHARED / "vb-panel.js"`);
  const order = ["vb-panel.js", "oh-hive-data.js", "oh-say.js", "oh-voice.js", "oh-hive.js", "oh-panel.js"].map((f, i) => (i === 0 ? vbAt : py.indexOf(`SHARED / "${f}"`, vbAt)));
  ok(order.every((i) => i > 0) && order.every((x, i) => i === 0 || x > order[i - 1]), "the bundle list order");
  ok(src("tools/check_all.mjs").includes('"check_omega_hive.mjs"'), "check_all does not list check_omega_hive.mjs");
  const doc = src("docs/omega-hive.md"); ok(/software agent/i.test(doc) && /What it is not/i.test(doc), "docs/omega-hive.md");
  return "app mount gated by ?demo and dxEligibility (demo, signed-out, K-12 and unknown all refused), 5 modules listed after vb-panel.js, check_all lists it, docs present";
});

// 14 — hygiene
await check("14 hygiene: no model identifier and no claim wording in the files this console wrote", () => {
  const MODEL = new RegExp("\\b(" + ["gp" + "t-?\\d", "cla" + "ude-\\d", "cla" + "ude [0-9]", "op" + "us", "son" + "net", "hai" + "ku", "gem" + "ini", "lla" + "ma", "mis" + "tral"].join("|") + ")\\b", "i");
  // Built from pieces so this file's own source does not carry the phrases it looks for.
  const CLAIM = new RegExp("\\b(" + ["partnered " + "with", "in partner" + "ship with", "endorsed " + "by", "our " + "customers", "valuation " + "of", "token " + "price", "raised \\$", "funding " + "round"].join("|") + ")\\b", "i");
  const files = ["WebXR/shared/oh-hive-data.js", "WebXR/shared/oh-say.js", "WebXR/shared/oh-voice.js", "WebXR/shared/oh-hive.js", "WebXR/shared/oh-panel.js", "tools/check_omega_hive.mjs", "docs/omega-hive.md", "docs/consoles/OMEGA-HIVE.md"];
  let n = 0;
  for (const f of files) { const t = src(f); if (!t) continue; n += 1; ok(!MODEL.test(t), `${f}: model identifier`); ok(!CLAIM.test(t), `${f}: claim wording`); }
  return `${n} files clean`;
});

for (const e of evals) console.log(`EVAL ${e}`);
console.log(`\ncheck_omega_hive: ${passes} passed, ${failures} failed (${Date.now() - t0} ms)`);
process.exit(failures ? 1 : 0);
