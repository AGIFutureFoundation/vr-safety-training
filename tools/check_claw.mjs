#!/usr/bin/env node
/**
 * OMEGA-CLAW (docs/omega-claw.md, docs/consoles/OMEGA-CLAW.md): the software agents that run robot training and model
 * testing, and the persistent robot world. Every claim in the console's hand-back is a line this prints.
 *   1. five software agents (planner, trainer, evaluator, auditor, promoter): labelled, invented names apart from the hive's,
 *      no language model, no network call, no key anywhere in the claw's modules
 *   2. the protocol was committed before the held-out run (git ancestry), and has not changed since (its hash in the record)
 *   3. the claw on a stub arena: a clear win is promoted; every refusal fires for its own reason and runs nothing; the
 *      chain is deterministic and a tampered line is caught
 *   4. the measured record: N declared comparisons all run once on held-out seeds; refusals exercised 3 of 3; promotions
 *      only with a clear interval N of N; every verdict re-derives from the record's own numbers; chain intact
 *   5. the persistent world: deterministic for a seed, restores by replay, governor on every step, 0 physical dispatches,
 *      the promoted model used, paused while hidden (0 steps), catch-up capped, local storage only
 *   6. people beside robots: learner values only when eligible, counts only in the chain
 *   7. wiring: the parishes mount and its gate, the instructor tab, the bundle lists, check_all and the estimated baseline row
 *   8. controls at least 44 px; hygiene: no model identifier, no claim wording
 *   9. protocol 2 (round 7): seeds only through ARENA-2's committed declaration (8ea01d3c), which precedes the protocol,
 *      which precedes its record; N comparisons run once; verdicts re-derive; refusals 3 of 3 plus not-held-out; chain intact
 *  10. people and robots side by side per scenario (learner stations re-derived from the programme's tracks; learner values
 *      only when eligible); the page module carries both records with chains trimmed to heads that match the JSON
 *  11. the world in the scene: a lamp per robot site on the desktop high tier only, inside its stated budget, busy or idle
 *  12 protocol 3 (round 8, ROBOLEARN-9): seeds only through the committed declaration arena-declared-r8.json (ec8bf4c5),
 *     which precedes the protocol, which precedes its record; 36 comparisons run once; verdicts re-derive; refusals 3 of 3
 *     plus not-held-out; promotions clear; ra-lm-h and ra-lm-h48 applicable everywhere; arena.json retest8 equals the record
 * Run: node tools/check_claw.mjs   (OC_ROOT=<tree> runs it against another checkout, for a before measurement)
 */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { execFileSync } from "node:child_process";

const ROOT = process.env.OC_ROOT || join(dirname(fileURLToPath(import.meta.url)), "..");
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
const json = (f) => { try { return JSON.parse(src(f)); } catch (_) { return null; } };

const OC = await imp("WebXR/shared/oc-claw.js");
const OW = await imp("WebXR/shared/oc-world.js");
const HD = await imp("WebXR/shared/oh-hive-data.js");
const REC = json("docs/evals/claw.json");
const OC_FILES = ["WebXR/shared/oc-claw.js", "WebXR/shared/oc-world.js", "WebXR/shared/oc-panel.js"];

/** A deterministic stub arena (the contract's shape: success a rate, successes/stepsRun/stepsChecked counts). */
function stubArena({ rates = {}, breaks = {}, gap = {}, physical = {}, models = null } = {}) {
  const ms = models ?? [
    { id: "inc", family: "behaviour clone", trainedOn: "synthetic demos", params: { k: 5 } },
    { id: "win", family: "DAgger", trainedOn: "synthetic demos", params: { k: 5 } },
    { id: "close", family: "DAgger", trainedOn: "synthetic demos", params: { k: 5 } },
    { id: "dirty", family: "DAgger", trainedOn: "synthetic demos", params: { k: 5 } },
    { id: "gappy", family: "DAgger", trainedOn: "synthetic demos", params: { k: 5 } },
    { id: "phys", family: "DAgger", trainedOn: "synthetic demos", params: { k: 5 } },
    { id: "exp", family: "scripted expert (upper bound)", trainedOn: "nothing (planner)", params: { learned: 0 } },
    { id: "leaky", family: "behaviour clone", trainedOn: { seeds: [1, 2, 7125] }, params: { k: 5 } },
  ];
  const calls = [];
  return {
    calls,
    raModels: () => ms,
    raScenarios: () => [{ id: "sc", kind: "gym", hard: false }, { id: "sc2", kind: "gym", hard: false }],
    raRun: ({ modelId, scenarioId, seeds }) => {
      calls.push({ modelId, scenarioId, seeds: seeds.slice() });
      const p = rates[modelId] ?? 0.5;
      const perSeed = seeds.map((s, i) => ({ seed: s, success: (i + 0.5) / seeds.length < p, steps: 10, ruleBreaks: i < (breaks[modelId] ?? 0) ? 1 : 0 }));
      const k = perSeed.filter((x) => x.success).length, stepsRun = seeds.length * 10;
      return { modelId, scenarioId, applicable: true, n: seeds.length, success: k / seeds.length, successes: k, ruleBreaks: breaks[modelId] ?? 0, steps: 10, stepsRun, stepsChecked: stepsRun - (gap[modelId] ?? 0), stops: 0, governorChecked: (stepsRun - (gap[modelId] ?? 0)) / stepsRun, physical: physical[modelId] ?? 0, perSeed };
    },
    raLeaderboard: (rs) => rs.map((r, i) => ({ rank: i + 1, modelId: r.modelId, success: r.success })),
    trainingSeeds: (m) => OC.ocTrainingSeeds(m),
  };
}

// 1 — agents
await check("1 five software agents, labelled, invented names apart from the hive's; no language model, network call or key", () => {
  need(OC);
  const A = OC.OC_AGENTS;
  ok(A.length === 5, `agents ${A.length}`);
  ok(["planner", "trainer", "evaluator", "auditor", "promoter"].every((k) => A.some((a) => a.key === k)), "roles");
  ok(A.every((a) => a.label === "software agent" && a.name && a.role && a.avatar?.glyph), "label, name, role, badge");
  const hive = new Set((HD.OH_AGENTS ?? []).map((a) => a.name));
  ok(A.every((a) => !hive.has(a.name)) && new Set(A.map((a) => a.name)).size === 5, "names distinct from the hive's and each other");
  const NET = /\b(fetch|XMLHttpRequest|WebSocket|EventSource|sendBeacon|importScripts)\s*\(|navigator\.sendBeacon|https?:\/\//;
  // The key-prefix pattern starts at a word boundary: unanchored it matched inside the station id "ri·sk-assessment".
  const KEY = new RegExp(["api[_-]?key", "authori" + "zation:", "bear" + "er ", "\\bsk-[A-Za-z0-9]{8}"].join("|"), "i");
  for (const f of OC_FILES) { const t = src(f).replace(/\/\/.*$/gm, ""); ok(t, `${f} missing`); ok(!NET.test(t), `${f}: network code`); ok(!KEY.test(t), `${f}: key wording`); }
  return `${A.map((a) => `${a.name} (${a.key})`).join(", ")}; ${OC_FILES.length} modules: no network code, no key`;
});

// 2 — protocol before the run
await check("2 the protocol was committed before the held-out run and is unchanged since", () => {
  need(OC); ok(REC, "docs/evals/claw.json missing");
  ok(REC.protocol.hash === OC.ocHash(OC.OC_PROTOCOL), `protocol hash ${REC.protocol.hash} != current ${OC.ocHash(OC.OC_PROTOCOL)} (the protocol changed after the run)`);
  ok(OC.OC_PROTOCOL.seeds.length === 60 && OC.OC_PROTOCOL.seeds[0] === 7121 && OC.OC_PROTOCOL.seeds[59] === 7180, "held-out seeds 7121–7180");
  let note = "git not available (archive): ancestry not checked";
  try {
    const git = (...a) => execFileSync("git", a, { cwd: ROOT, encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim();
    const p = git("log", "--format=%H", "--reverse", "-S", "export const OC_PROTOCOL", "--", "WebXR/shared/oc-claw.js").split("\n")[0];
    const r = git("log", "--format=%H", "--reverse", "--diff-filter=A", "--", "docs/evals/claw.json").split("\n")[0];
    if (p && r) {
      ok(p !== r, "the protocol and the record landed in the same commit");
      let anc = true; try { git("merge-base", "--is-ancestor", p, r); } catch (_) { anc = false; }
      ok(anc, `protocol commit ${p.slice(0, 8)} is not an ancestor of the record's ${r.slice(0, 8)}`);
      note = `protocol ${p.slice(0, 8)} precedes record ${r.slice(0, 8)}`;
    }
  } catch (e) { if (/ancestor|same commit/.test(String(e?.message))) throw e; }
  return `${note}; protocol hash ${REC.protocol.hash}`;
});

// 3 — the claw on a stub arena
await check("3 stub arena: a clear win promoted; each refusal fires for its own reason and runs nothing; chain deterministic, tamper caught", () => {
  need(OC);
  const H = OC.OC_HELD_OUT;
  const mk = () => stubArena({ rates: { inc: 0.3, win: 0.95, close: 0.4, dirty: 0.97, gappy: 0.97, phys: 0.97, exp: 1 }, breaks: { dirty: 2 }, gap: { gappy: 3 }, physical: { phys: 1 } });
  const run = (arena) => {
    const c = OC.ocClaw({ arena });
    ok(c.declare({ id: "d1", scenarioId: "sc", models: ["inc", "win", "close", "dirty", "gappy", "phys", "exp"], incumbent: "inc", challengers: ["win", "close", "dirty", "gappy", "phys", "exp"], seeds: H }).ok, "declare d1");
    c.train("d1");
    const before = arena.calls.length;
    const r0 = c.evaluate("never-declared");
    ok(!r0.ok && r0.reason === "undeclared" && arena.calls.length === before, "undeclared refused without a run");
    const rx = c.evaluate("d1", { as: { seeds: H.slice(0, 30) } });
    ok(!rx.ok && rx.reason === "declaration-changed" && arena.calls.length === before, "a changed comparison refused without a run");
    ok(c.evaluate("d1").ok, "d1 runs");
    ok(arena.calls.length === before + 7, "each declared model ran once");
    const again = c.evaluate("d1"); ok(!again.ok && again.reason === "already-run", "already-run");
    const p = c.promote("d1");
    const v = Object.fromEntries(p.verdicts.map((x) => [x.challenger, x.verdict]));
    ok(v.win === "clear" && v.close === "interval-overlap" && v.dirty === "rule-broken" && v.gappy === "governor-gap" && v.phys === "physical" && v.exp === "reference-only", `verdicts ${JSON.stringify(v)}`);
    ok(p.promotion && p.promotion.to === "win" && p.promotion.cCi[0] > p.promotion.iCi[1], "win promoted with a clear interval");
    ok(c.declare({ id: "d2", scenarioId: "sc", models: ["inc", "win"], incumbent: "inc", challengers: ["win"], seeds: H.slice(5, 15) }).ok, "declare d2");
    const n2 = arena.calls.length; const r2 = c.evaluate("d2");
    ok(!r2.ok && r2.reason === "seed-reused" && arena.calls.length === n2, "seed-reused refused without a run");
    const r3 = c.declare({ id: "d3", scenarioId: "sc2", models: ["inc", "win"], incumbent: "inc", challengers: ["win"], seeds: [7000, 7121] });
    ok(!r3.ok && r3.reason === "not-held-out", "a seed outside the held-out set refused at declaration");
    ok(c.declare({ id: "d4", scenarioId: "sc2", models: ["inc", "leaky"], incumbent: "inc", challengers: ["leaky"], seeds: H }).ok, "declare d4");
    c.train("d4"); const n4 = arena.calls.length; const r4 = c.evaluate("d4");
    ok(!r4.ok && r4.reason === "leakage" && arena.calls.length === n4, "a model trained on a held-out seed refused without a run");
    const au = c.auditAll(); ok(au.ok && au.declaredFirst && au.seedOnce && au.heldOnly, "audit");
    return c;
  };
  const a = run(mk()), b = run(mk());
  ok(JSON.stringify(a.log()) === JSON.stringify(b.log()) && JSON.stringify(a.events()) === JSON.stringify(b.events()), "deterministic chain and events");
  ok(a.verify().ok, "chain intact");
  const lines = a.log(); lines[3] = { ...lines[3], detail: lines[3].detail.replace(/\d/, "9") };
  const t = OC.ocVerifyChain(lines); ok(!t.ok && t.brokenAt === 3, `tamper at line 3 caught (${JSON.stringify(t)})`);
  const reasons = [...new Set(a.refusals().map((r) => r.reason))].sort();
  ok(a.events().every((e) => e.label === "software agent" && typeof e.text === "string" && e.text.length > 0), "every line labelled and built");
  return `refusals ${reasons.join(", ")}; promotion inc -> win; ${a.log().length} chain lines, a tampered line caught at 3`;
});

// 4 — the measured record
await check("4 the record: every declared comparison run once on held-out seeds; refusals 3 of 3; promotions only clear; verdicts re-derive; chain intact", () => {
  need(OC); ok(REC, "docs/evals/claw.json missing");
  const decls = OC.ocProtocolDeclarations();
  const N = decls.reduce((n, d) => n + d.challengers.length, 0);
  ok(REC.counts.declaredComparisons === N && REC.comparisons.length === N, `comparisons ${REC.comparisons.length} != declared ${N}`);
  for (const d of decls) ok(REC.declarations.some((x) => x.id === d.id && x.scenarioId === d.scenarioId), `declaration ${d.id} missing`);
  ok(REC.runs.length === decls.length, `runs ${REC.runs.length}`);
  const held = new Set(OC.OC_HELD_OUT);
  ok(REC.declarations.every((d) => { const [a, b] = d.seedRange.split("–").map(Number); return held.has(a) && held.has(b); }), "every declaration's seeds held out");
  ok(REC.audit.ok && REC.audit.declaredFirst && REC.audit.seedOnce && REC.audit.heldOnly, "audit flags");
  const ex = REC.counts.exercised; ok(ex.undeclared && ex["seed-reused"] && ex["rule-broken"], `exercised ${JSON.stringify(ex)}`);
  ok(REC.probes.find((p) => p.kind === "runs-added-by-probes")?.n === 0, "the probes ran nothing");
  // Every verdict re-derived from the record's own result rows with the promoter's rule.
  const claw = OC.ocClaw({ arena: stubArena() });
  let rederived = 0;
  for (const c of REC.comparisons) {
    const run = REC.runs.find((r) => r.declId === c.declId);
    const ch = run.results.find((x) => x.modelId === c.challenger), inc = run.results.find((x) => x.modelId === c.incumbent);
    ok(claw.judge(ch, inc) === c.verdict, `${c.declId} ${c.challenger}: ${c.verdict} does not re-derive (${claw.judge(ch, inc)})`);
    rederived += 1;
  }
  const clear = REC.promotions.filter((p) => p.cCi[0] > p.iCi[1] && p.ruleBreaks === 0 && p.governorChecked === p.steps && p.physical === 0).length;
  ok(clear === REC.promotions.length, "a promotion without a clear interval");
  ok(REC.comparisons.filter((c) => c.verdict === "clear").length >= REC.promotions.length, "promotions exceed clear verdicts");
  let steps = 0, checked = 0, phys = 0;
  for (const r of REC.runs) for (const x of r.results) { steps += x.steps; checked += x.governorChecked; phys += x.physical; }
  ok(steps === checked && steps === REC.counts.stepsRun && phys === 0, `governor ${checked}/${steps}, physical ${phys}`);
  const ch = OC.ocVerifyChain(REC.chain); ok(ch.ok, `chain broken at ${ch.brokenAt}`);
  const rec2 = src("WebXR/shared/oc-claw-record.js"); ok(rec2.includes(REC.protocol.hash) && rec2.includes(REC.chain[REC.chain.length - 1].hash), "the page module is out of date with docs/evals/claw.json (node tools/claw_eval.mjs --module-only)");
  const intervalBlocked = REC.comparisons.filter((c) => c.verdict === "rule-broken" && !c.negativeControl && c.cCi[0] > c.iCi[1]);
  evals.push(`declared comparisons: 0 -> ${N}, run once on held-out seeds ${REC.counts.comparisonsRunOnce}/${N} (${REC.counts.episodes} episodes)`);
  evals.push(`refusals exercised: 0 -> ${Object.values(ex).filter(Boolean).length}/3 ${JSON.stringify(REC.counts.refusalsByReason)}`);
  evals.push(`promotions with a clear interval: ${clear}/${REC.promotions.length}; clear-interval wins refused for rule breaks: ${intervalBlocked.map((c) => `${c.challenger} on ${c.scenarioId}`).join(", ") || "none"}`);
  evals.push(`arena governor: ${checked}/${steps} steps, physical ${phys}; audit chain intact (${ch.lines} lines)`);
  return `${N} comparisons, ${rederived} verdicts re-derived, ${REC.promotions.length} promotions, chain ${ch.lines} lines intact`;
});

// 5 — the persistent world
await check("5 the world: deterministic, restores by replay, governor every step, 0 physical, promoted model used, paused while hidden, catch-up capped", () => {
  need(OW);
  const pol = (m, sc, env) => (m === "good" ? (obs) => env.expert(obs, () => 0.5, 1) : null);
  const promoted = { "rb-cell-entry": "good", "rb-cobot-zone-setup": "good", "rb-teleop-pick-place": "good", "rb-amr-fleet-routing": "good" };
  const a = OW.ocWorld({ seed: 3, promoted, policyFor: pol }), b = OW.ocWorld({ seed: 3, promoted, policyFor: pol });
  a.run(700); b.run(700);
  const sa = a.stats(), sb = b.stats();
  ok(JSON.stringify(sa) === JSON.stringify(sb), "deterministic for a seed");
  const r = OW.ocWorldRestore(a.snapshot(), { promoted, policyFor: pol });
  ok(JSON.stringify(r.stats()) === JSON.stringify(sa), "restore by replay");
  ok(sa.day === 1 && sa.minutes === 700, `day rollover (${sa.day}, ${sa.minutes})`);
  ok(sa.governorEveryStep && sa.steps > 0 && sa.stepsMonitored === sa.steps, "governor on every step");
  ok(sa.physicalDispatched === 0, "physical 0");
  ok(Object.values(sa.models).every((m) => m.model === "good" && m.runs > 0), `promoted model used ${JSON.stringify(sa.models)}`);
  // The loop on a fake page.
  const store = new Map(); const storage = { getItem: (k) => store.get(k) ?? null, setItem: (k, v) => store.set(k, String(v)), removeItem: (k) => store.delete(k) };
  const listeners = {}; const doc = { visibilityState: "visible", addEventListener: (t, f) => { (listeners[t] ??= []).push(f); }, removeEventListener() {} };
  const timers = new Map(); let tid = 0, clock = 1_000_000;
  const loop = OW.ocWorldLoop({ seed: 5, promoted, policyFor: pol, doc, win: { addEventListener() {}, removeEventListener() {} }, storage, now: () => clock, setTimer: (fn) => { tid += 1; timers.set(tid, fn); return tid; }, clearTimer: (h) => timers.delete(h) });
  const fire = (n) => { for (let i = 0; i < n; i += 1) for (const fn of [...timers.values()]) fn(); };
  fire(30); const m1 = loop.world.minutes();
  ok(m1 === 30 && !loop.paused(), `running: ${m1}`);
  doc.visibilityState = "hidden"; for (const f of listeners.visibilitychange ?? []) f();
  fire(50); const m2 = loop.world.minutes();
  ok(loop.paused() && m2 === m1 && timers.size === 0, `hidden: ${m2 - m1} steps`);
  doc.visibilityState = "visible"; for (const f of listeners.visibilitychange ?? []) f();
  fire(10); ok(loop.world.minutes() === m1 + 10, "resumes");
  loop.stop();
  ok([...store.keys()].every((k) => k === OW.OC_WORLD_KEY), `stored keys ${[...store.keys()]}`);
  const saved = JSON.parse(store.get(OW.OC_WORLD_KEY)); ok(saved.seed === 5 && saved.minutes === m1 + 10, "snapshot is (seed, minutes)");
  clock += 10 * 24 * 3600 * 1000; // ten days away
  const loop2 = OW.ocWorldLoop({ seed: 5, promoted, policyFor: pol, doc, win: null, storage, now: () => clock, setTimer: () => 1, clearTimer: () => {} });
  ok(loop2.catchUp === OW.OC_WORLD_CATCHUP_MAX && loop2.world.minutes() === m1 + 10 + OW.OC_WORLD_CATCHUP_MAX, `catch-up capped (${loop2.catchUp})`);
  loop2.stop();
  evals.push(`persistent world: ${sa.minutes} simulated minutes (seed 3), ${sa.completed} jobs, governor ${sa.stepsMonitored}/${sa.steps} steps, physical dispatches ${sa.physicalDispatched}; steps while hidden ${m2 - m1}; catch-up capped at ${OW.OC_WORLD_CATCHUP_MAX}`);
  if (REC?.world) evals.push(`record world (the clone at every site, as promoted): ${REC.world.minutes} minutes, ${REC.world.completed} jobs, governor ${REC.world.stepsMonitored}/${REC.world.steps}, physical ${REC.world.physicalDispatched}`);
  return `${sa.minutes} min, ${sa.completed} jobs, governor ${sa.stepsMonitored}/${sa.steps}, physical 0; hidden 0 steps; catch-up ${loop2.catchUp}`;
});

// 6 — people beside robots
await check("6 people beside robots: learner values only when eligible; counts only in the chain", () => {
  need(OC); ok(REC, "record");
  const human = { drills: { best: { "drill-a": 60, "drill-b": 95 } }, tutor: { steps: { lockout: { tries: 4, errors: 3 }, verify: { tries: 3, errors: 0 } } } };
  const no = OC.ocPracticeNeeds({ runs: REC.runs, promoted: REC.promoted, human: { ...human, eligible: false } });
  ok(no.people.length === 0 && no.learnerData === "none", "ineligible learner shows nothing");
  const yes = OC.ocPracticeNeeds({ runs: REC.runs, promoted: REC.promoted, human: { ...human, eligible: true } });
  ok(yes.people.some((p) => p.id === "drill-a") && !yes.people.some((p) => p.id === "drill-b") && yes.people.some((p) => p.id === "lockout") && !yes.people.some((p) => p.id === "verify"), JSON.stringify(yes.people));
  ok(yes.robots.length === no.robots.length && yes.robots.every((r) => REC.promoted[r.scenarioId] === r.modelId), "robots from the promoted models");
  const c = OC.ocClaw({ arena: stubArena() });
  c.reportHumans({ ...human, eligible: true });
  const line = c.log().pop(); ok(line.action === "oc-practice" && !/drill-a|lockout|60/.test(line.detail), `chain line carries values: ${line.detail}`);
  evals.push(`practice needs from the record: robots on ${no.robots.length} scenarios (${no.robots.map((r) => r.scenarioId).join(", ")}); people only when opted in (local)`);
  return `robots ${no.robots.length}; people (fixture, eligible) ${yes.people.length}; ineligible 0; chain line counts only`;
});

// 7 — wiring
await check("7 wiring: the parishes mount and its gate, the instructor tab, the bundle lists, check_all, the estimated baseline row", () => {
  const app = src("WebXR/parishes/js/app.js");
  ok(/ocMountClaw\(\$\("menu-drills"\)/.test(app) && /ocMountWorld\(/.test(app) && /ocWorldLoop\(/.test(app), "parishes mounts");
  ok(/var ocReadHuman = [^\n]*!npParams\.has\("demo"\) && dxEligibility\(dxReadSignals\(\), \{ stage: "collect" \}\)\.eligible === true && !!dxConsent\(\)[^\n]*: null/.test(app), "the learner gate (DATAWORKS' collect-stage eligibility: signed in, adult, not K-12 or demo, and opted in)");
  const idx = src("WebXR/instructor/index.html"), ia = src("WebXR/instructor/js/app.js");
  ok(/id="tab-claw"/.test(idx) && /id="view-claw"/.test(idx) && /id="oc-root"/.test(idx), "instructor tab markup");
  ok(/\["claw", "tab-claw", "view-claw"\]/.test(ia) && /ocMountClaw\(\$\("oc-root"\), \{ record: OC_RECORD, records: OC_RECORDS, human: null \}\)/.test(ia), "instructor tab wiring, no learner data");
  const b = src("tools/bundle_webxr.py");
  for (const f of ["rt6-learn.js", "rt7-learn.js", "rt8-learn.js", "ra-lm.js", "ra-arena.js", "oc-claw.js", "oc-world.js", "oc-claw-record.js", "oc-panel.js"]) ok(b.includes(`SHARED / "${f}"`), `bundle list: ${f}`);
  ok(b.indexOf('SHARED / "oh-hive.js"') < b.indexOf('SHARED / "oc-world.js"'), "oc-world.js after oh-hive.js");
  ok(/"check_claw\.mjs"/.test(src("tools/check_all.mjs")), "check_all lists check_claw");
  const base = json("docs/perf/checkers-baseline.json");
  const row = Object.values(base ?? {}).find((v) => v && typeof v === "object" && "check_claw.mjs" in v && typeof v["check_claw.mjs"] === "number");
  ok(row, "baseline row"); ok(/ESTIMATE/.test(base.notes?.["check_claw.mjs"] ?? ""), "baseline row labelled an estimate");
  return "parishes + instructor + bundles + check_all + baseline";
});

// 8 — controls and hygiene
await check("8 controls at least 44 px; no model identifier and no claim wording in the files this console wrote", () => {
  const css = src("WebXR/shared/oc-panel.js");
  ok(/\.oc-panel select,\.oc-panel button\{min-height:44px;min-width:44px/.test(css), "44 px controls");
  const MODEL = new RegExp("\\b(" + ["gp" + "t-?\\d", "cla" + "ude-\\d", "cla" + "ude [0-9]", "op" + "us", "son" + "net", "hai" + "ku", "gem" + "ini", "lla" + "ma", "mis" + "tral"].join("|") + ")\\b", "i");
  const CLAIM = new RegExp("\\b(" + ["partnered " + "with", "in partner" + "ship with", "endorsed " + "by", "our " + "customers", "valuation " + "of", "token " + "price", "raised \\$", "funding " + "round"].join("|") + ")", "i");
  const files = [...OC_FILES, "WebXR/shared/oc-claw-record.js", "tools/claw_eval.mjs", "tools/check_claw.mjs", "docs/evals/claw.json", "docs/omega-claw.md", "docs/consoles/OMEGA-CLAW.md", "docs/consoles/memory/OMEGA-CLAW.md", "tools/briefs/next/oc-next.md", "docs/evals/claw2.json", "docs/consoles/CLAW-2.md", "docs/consoles/memory/CLAW-2.md", "tools/briefs/next/oc2-next.md", "docs/evals/claw3.json", "docs/evals/arena-declared-r8.json", "docs/consoles/ROBOLEARN-9.md", "docs/consoles/memory/ROBOLEARN-9.md", "tools/briefs/next/rl9-next.md"];
  let n = 0;
  for (const f of files) { const t = src(f); if (!t) continue; n += 1; ok(!MODEL.test(t), `${f}: model identifier`); ok(!CLAIM.test(t), `${f}: claim wording`); }
  return `${n} files clean`;
});

// 9 — protocol 2 (round 7)
const REC2 = json("docs/evals/claw2.json");
await check("9 protocol 2: seeds only through ARENA-2's committed declaration; declared before its one run; N run once; verdicts re-derive; refusals 3 of 3 (+ not-held-out); chain intact", () => {
  need(OC); ok(OC.OC_PROTOCOL_2, "OC_PROTOCOL_2 missing"); ok(REC2, "docs/evals/claw2.json missing");
  const P = OC.OC_PROTOCOL_2;
  ok(REC2.dev === false, "the record is a development run");
  ok(REC2.protocol.hash === OC.ocHash(P), `protocol 2 hash ${REC2.protocol.hash} != current ${OC.ocHash(P)} (changed after the run)`);
  const decl = json(P.seedSource.file); ok(decl?.protocol?.seeds?.gym, `${P.seedSource.file} missing`);
  const [a, b] = String(decl.protocol.seeds.gym).split("–").map(Number);
  ok(P.seeds[0] === a && P.seeds[P.seeds.length - 1] === b && P.seeds.length === b - a + 1, `seeds ${P.seeds[0]}–${P.seeds[P.seeds.length - 1]} != declared ${decl.protocol.seeds.gym}`);
  ok(!P.seeds.some((s) => OC.OC_HELD_OUT.includes(s)), "protocol 2 reuses protocol 1's seeds");
  let note = "git not available (archive): ancestry not checked";
  try {
    const git = (...x) => execFileSync("git", x, { cwd: ROOT, encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim();
    const p = git("log", "--format=%H", "--reverse", "-S", "export const OC_PROTOCOL_2", "--", "WebXR/shared/oc-claw.js").split("\n")[0];
    const r = git("log", "--format=%H", "--reverse", "--diff-filter=A", "--", "docs/evals/claw2.json").split("\n")[0];
    const s = git("log", "--format=%H", "--reverse", "--diff-filter=A", "--", P.seedSource.file).split("\n")[0];
    if (p && r && s) {
      ok(p !== r, "protocol 2 and its record landed in the same commit");
      const anc = (x, y) => { try { git("merge-base", "--is-ancestor", x, y); return true; } catch (_) { return false; } };
      ok(s.startsWith(P.seedSource.commit), `the declaration file was added in ${s.slice(0, 8)}, not ${P.seedSource.commit}`);
      ok(anc(s, p), `ARENA-2's declaration ${s.slice(0, 8)} is not an ancestor of protocol 2's ${p.slice(0, 8)}`);
      ok(anc(p, r), `protocol 2's commit ${p.slice(0, 8)} is not an ancestor of its record's ${r.slice(0, 8)}`);
      note = `declaration ${s.slice(0, 8)} -> protocol ${p.slice(0, 8)} -> record ${r.slice(0, 8)}`;
    }
  } catch (e) { if (/ancestor|same commit|added in/.test(String(e?.message))) throw e; }
  const decls = OC.ocProtocolDeclarations(P);
  const N = decls.reduce((n, d) => n + d.challengers.length, 0);
  ok(REC2.counts.declaredComparisons === N && REC2.comparisons.length === N && REC2.counts.comparisonsRunOnce === N, `comparisons ${REC2.comparisons.length} != declared ${N}`);
  ok(REC2.runs.length === decls.length && decls.every((d) => REC2.declarations.some((x) => x.id === d.id && x.hash)), "declarations and runs");
  ok(REC2.declarations.every((d) => d.seedRange === `${a}–${b}` || /probe/.test(d.id)), "every comparison on ARENA-2's declared seeds");
  ok(REC2.audit.ok && REC2.audit.declaredFirst && REC2.audit.seedOnce && REC2.audit.heldOnly, "audit flags");
  const ex = REC2.counts.exercised; ok(ex.undeclared && ex["seed-reused"] && ex["rule-broken"] && ex["not-held-out"], `exercised ${JSON.stringify(ex)}`);
  ok(REC2.probes.find((x) => x.kind === "runs-added-by-probes")?.n === 0, "the probes ran nothing");
  const claw = OC.ocClaw({ arena: stubArena() });
  for (const c of REC2.comparisons) {
    const run = REC2.runs.find((r) => r.declId === c.declId);
    ok(claw.judge(run.results.find((x) => x.modelId === c.challenger), run.results.find((x) => x.modelId === c.incumbent)) === c.verdict, `${c.declId} ${c.challenger}: ${c.verdict} does not re-derive`);
  }
  const clear = REC2.promotions.filter((x) => x.cCi[0] > x.iCi[1] && x.ruleBreaks === 0 && x.governorChecked === x.steps && x.physical === 0).length;
  ok(clear === REC2.promotions.length, "a protocol-2 promotion without a clear interval");
  let steps = 0, checked = 0, phys = 0;
  for (const r of REC2.runs) for (const x of r.results) { steps += x.steps; checked += x.governorChecked; phys += x.physical; }
  ok(steps === checked && steps === REC2.counts.stepsRun && phys === 0, `governor ${checked}/${steps}, physical ${phys}`);
  ok(REC2.world.physicalDispatched === 0 && REC2.world.governorEveryStep && REC2.world.stepsMonitored === REC2.world.steps, "protocol-2 world: governor and physical");
  const ch = OC.ocVerifyChain(REC2.chain); ok(ch.ok, `protocol-2 chain broken at ${ch.brokenAt}`);
  const lm = REC2.runs.map((r) => r.results.find((x) => x.modelId === "ra-lm")).filter((x) => x && x.applicable);
  ok(lm.length === decls.length, `ra-lm applicable on ${lm.length} of ${decls.length} scenarios`);
  const N1 = REC ? REC.counts.declaredComparisons : 0;
  evals.push(`declared comparisons: ${N1} -> ${N1 + N} (protocol 2: ${N} on ${a}–${b}, run once ${REC2.counts.comparisonsRunOnce}/${N}, ${REC2.counts.episodes} episodes)`);
  evals.push(`protocol 2 refusals exercised: 3/3 (+ not-held-out) ${JSON.stringify(REC2.counts.refusalsByReason)}; promotions ${REC2.promotions.length}, clear ${clear}/${REC2.promotions.length}`);
  evals.push(`small model (ra-lm) vs clone (bc), measured once on ${a}–${b}: ${REC2.smallModel.map((s) => `${s.scenarioId} ${s.lm} vs ${s.bc} (${s.verdict})`).join("; ")}`);
  evals.push(`protocol 2 governor ${checked}/${steps} steps, physical ${phys}; world ${REC2.world.minutes} min, ${REC2.world.completed} jobs, governor ${REC2.world.stepsMonitored}/${REC2.world.steps}, physical dispatches ${REC2.world.physicalDispatched}; chain intact (${ch.lines} lines)`);
  return `${note}; ${N} comparisons, verdicts re-derived, ${REC2.promotions.length} promotions, chain ${ch.lines} lines intact`;
});

// 10 — people and robots side by side; the trimmed page module
await check("10 side by side: each robot scenario with its learner stations (from the programme), gaps for both, learner values only when eligible; the page module trimmed to chain heads", async () => {
  need(OC); ok(REC2, "docs/evals/claw2.json missing");
  const RP = need(await imp("WebXR/shared/rp-programme-data.js"));
  const derived = OC.ocScenarioDrills(RP.RP_TRACKS, (id) => Object.prototype.hasOwnProperty.call(RP.RP_ROBOT_STATIONS, id));
  ok(JSON.stringify(derived) === JSON.stringify(OC.OC_SCENARIO_DRILLS), `OC_SCENARIO_DRILLS differs from the programme's tracks: ${JSON.stringify(derived)}`);
  const no = OC.ocSideBySide({ runs: REC2.runs, promoted: REC2.promoted, human: { eligible: false, stations: { "robot-cell": { passed: true } } } });
  ok(no.length === REC2.runs.length && no.every((x) => x.robot && x.people), "a row per scenario with both sides");
  ok(no.every((x) => x.people.learner === null), "ineligible: no learner value");
  const uncovered = no.filter((x) => !x.people.stations.length).map((x) => x.scenarioId);
  ok(uncovered.every((sc) => no.find((x) => x.scenarioId === sc).people.gap === true), "an uncovered scenario shows as a programme gap");
  const yes = OC.ocSideBySide({ runs: REC2.runs, promoted: REC2.promoted, human: { eligible: true, stations: { "robot-cell": { passed: true, best: 90 }, "rt-teach-pendant-safe-jogging": { passed: false, best: 60 } } } });
  const ce = yes.find((x) => x.scenarioId === "rb-cell-entry");
  ok(ce.people.learner.passed.join() === "robot-cell" && ce.people.learner.todo.includes("rt-teach-pendant-safe-jogging") && ce.people.gap === true, `cell entry learner side ${JSON.stringify(ce.people)}`);
  ok(yes.every((x, i) => JSON.stringify(x.robot) === JSON.stringify(no[i].robot)), "the robot side does not depend on the learner");
  const robotGaps = no.filter((x) => x.robot.gap).map((x) => x.scenarioId);
  const app = src("WebXR/parishes/js/app.js");
  ok(/var ocReadHuman = [^\n]*dxConsent\(\); return ok \? \{ eligible: true, [^\n]*stations: [^\n]*ppRecords\(\)[^\n]*: null;/.test(app), "the learner's station records are read only inside the DATAWORKS gate");
  ok(/ocMountClaw\(\$\("menu-drills"\), \{ record: OC_RECORD, records: OC_RECORDS, human: ocHuman \}\)/.test(app), "parishes passes both records");
  // Round 8 (ROBOLEARN-9): the gate became a function (ocReadHuman) so the consent panel's onChange can re-read it and
  // re-mount the people blocks without a reload; the regexes above follow the rename, the gate itself is unchanged.
  ok(/var ocHuman = ocReadHuman\(\);/.test(app) && /function ocRefreshPeople\(\) \{ try \{ [^\n]*ocHuman = ocReadHuman\(\); const next = ocMountClaw\(/.test(app) && /dxMountConsent\(\$\("menu-dataworks"\), \{ onChange: \(\) => \{[^\n]*ocRefreshPeople\(\);/.test(app) && /id === "dx-revoke" \|\| id === "dx-optin"\) setTimeout\(ocRefreshPeople, 0\)/.test(app), "the people blocks re-mount on a consent change, through the same gate");
  // The page module: both records, each chain trimmed to its head, the head matching the committed record.
  const M = need(await imp("WebXR/shared/oc-claw-record.js"));
  // Round 8 adds protocol 3's record (claw3.json), so the module carries three records, the latest shown first.
  const REC3m = json("docs/evals/claw3.json");
  const want = REC3m ? 3 : 2;
  ok(M.OC_RECORDS?.length === want && M.OC_RECORD === M.OC_RECORDS[want - 1], `${want} records, the latest first shown`);
  for (const [m, full] of [[M.OC_RECORDS[0], REC], [M.OC_RECORDS[1], REC2], ...(REC3m ? [[M.OC_RECORDS[2], REC3m]] : [])]) {
    ok(!("chain" in m) && m.chainHead.lines === full.chain.length && m.chainHead.hash === full.chain[full.chain.length - 1].hash, `${m.protocol.version}: head does not match the committed chain`);
    ok(OC.ocVerifyHead(m.chainHead, m.chainTail).ok, `${m.protocol.version}: head check`);
    const bad = [{ ...m.chainTail[0], detail: m.chainTail[0].detail + "x" }]; ok(!OC.ocVerifyHead(m.chainHead, bad).ok, "a tampered last line is caught");
  }
  const bytes = Buffer.byteLength(src("WebXR/shared/oc-claw-record.js"));
  const full = (r) => Buffer.byteLength(JSON.stringify(r.chain));
  evals.push(`people beside robots, per scenario: ${no.length} rows; robot gaps ${robotGaps.length} (${robotGaps.join(", ")}); scenarios with no matching learner station ${uncovered.length} (${uncovered.join(", ")}); learner side only when eligible (fixture: cell entry 1 of ${ce.people.stations.length} passed)`);
  evals.push(`page module: ${want} records in ${bytes} B; chains trimmed to head + last line (full chains ${full(REC)} B, ${full(REC2)} B${REC3m ? ` and ${full(REC3m)} B` : ""} stay in docs/evals/claw.json, claw2.json${REC3m ? " and claw3.json" : ""})`);
  return `${no.length} rows; robot gaps ${robotGaps.length}; uncovered ${uncovered.length}; module ${bytes} B`;
});

// 11 — the world in the scene
await check("11 the world in the scene: a lamp per robot site on the desktop high tier only, inside its stated budget, busy or idle from the world", async () => {
  need(OW); ok(OW.ocMountSiteLamps && OW.OC_LAMP_BUDGET, "ocMountSiteLamps missing");
  const T = need(await imp("WebXR/vendor/three/dist/three.module.min.js"));
  const sites = [{ id: "rb-site-soma-robot-cell", position: [10, 20], y: 1 }, { id: "rb-site-x", position: [0, 0], y: 0 }];
  for (const tier of ["low", "balanced"]) { const g = new T.Group(); ok(OW.ocMountSiteLamps({ three: T, root: g, sites, tier }) === null && g.children.length === 0, `${tier}: lamps mounted`); }
  const g = new T.Group();
  const L = OW.ocMountSiteLamps({ three: T, root: g, sites, tier: "high" });
  ok(L && g.children.length === sites.length, "one lamp per site on high");
  let tris = 0, tex = 0, lights = 0; g.traverse((o) => { if (o.isMesh) { const gi = o.geometry.index; tris += (gi ? gi.count : o.geometry.attributes.position.count) / 3; if (o.material.map) tex += 1; } if (o.isLight) lights += 1; });
  const B = OW.OC_LAMP_BUDGET;
  ok(tris === B.trianglesPerSite * sites.length && lights === 0 && tex === 0, `lamps: ${tris} triangles, ${lights} lights, ${tex} textures (budget ${B.trianglesPerSite} a site, 0, 0)`);
  ok(L.counts().triangles === tris, "counts() agrees with the geometry");
  L.update({ sites: [{ siteId: "rb-site-soma-robot-cell", busy: 2 }, { siteId: "rb-site-x", busy: 0 }] });
  ok(JSON.stringify(L.states()) === JSON.stringify([{ site: "rb-site-soma-robot-cell", state: "busy" }, { site: "rb-site-x", state: "idle" }]), `states ${JSON.stringify(L.states())}`);
  const w = OW.ocWorld({ seed: 2, promoted: {}, policyFor: () => null }); w.run(120);
  const st = w.stats(); const L2 = OW.ocMountSiteLamps({ three: T, root: new T.Group(), sites: st.sites.map((s, i) => ({ id: s.siteId, position: [i, i], y: 0 })), tier: "high" });
  L2.update(st); ok(L2.states().every((s, i) => s.state === (st.sites[i].busy > 0 ? "busy" : "idle")), "lamps follow ocWorld.stats().sites");
  const app = src("WebXR/parishes/js/app.js");
  ok(/ocMountSiteLamps\(\{ three: THREE, root, sites: rbWorld\?\.sites \?\? \[\], tier: npTierName \}\)/.test(app) && /loop\.onTick\(\(\) => lamps\.update\(loop\.world\.stats\(\)\)\)/.test(app), "parishes mounts the lamps with the tier in force and updates them each tick");
  evals.push(`world in the scene: a lamp per robot site on high only (low and balanced: 0), ${B.trianglesPerSite} triangles and 1 mesh a site, 0 lights, 0 textures; busy/idle from the world`);
  return `${sites.length} lamps, ${tris} triangles, 0 lights, 0 textures; low/balanced none`;
});

// 12 — protocol 3 (round 8, ROBOLEARN-9)
const REC3 = json("docs/evals/claw3.json");
await check("12 protocol 3: seeds only through the committed declaration (arena-declared-r8.json); declared before its one run; 36 run once; verdicts re-derive; refusals 3 of 3 (+ not-held-out); promotions clear; arena.json retest8 equals the record", () => {
  need(OC); ok(OC.OC_PROTOCOL_3, "OC_PROTOCOL_3 missing"); ok(REC3, "docs/evals/claw3.json missing");
  const P = OC.OC_PROTOCOL_3;
  ok(REC3.dev === false, "the record is a development run");
  ok(REC3.protocol.hash === OC.ocHash(P), `protocol 3 hash ${REC3.protocol.hash} != current ${OC.ocHash(P)} (changed after the run)`);
  const decl = json(P.seedSource.file); ok(decl?.protocol?.seeds?.gym, `${P.seedSource.file} missing`);
  for (const k of ["version", "idPrefix", "scenarios", "models", "incumbent", "challengers", "negativeControl"]) ok(JSON.stringify(decl.protocol[k]) === JSON.stringify(P[k]), `OC_PROTOCOL_3.${k} differs from the declaration`);
  const [a, b] = String(decl.protocol.seeds.gym).split("–").map(Number);
  ok(P.seeds[0] === a && P.seeds[P.seeds.length - 1] === b && P.seeds.length === b - a + 1, `seeds ${P.seeds[0]}–${P.seeds[P.seeds.length - 1]} != declared ${decl.protocol.seeds.gym}`);
  ok(!P.seeds.some((x) => OC.OC_HELD_OUT.includes(x) || OC.OC_HELD_OUT_2.includes(x)), "protocol 3 reuses protocol 1's or 2's seeds");
  let note = "git not available (archive): ancestry not checked";
  try {
    const git = (...x) => execFileSync("git", x, { cwd: ROOT, encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim();
    const p = git("log", "--format=%H", "--reverse", "-S", "export const OC_PROTOCOL_3", "--", "WebXR/shared/oc-claw.js").split("\n")[0];
    const r = git("log", "--format=%H", "--reverse", "--diff-filter=A", "--", "docs/evals/claw3.json").split("\n")[0];
    const sd = git("log", "--format=%H", "--reverse", "--diff-filter=A", "--", P.seedSource.file).split("\n")[0];
    if (p && r && sd) {
      ok(p !== r && sd !== r, "the declaration or protocol 3 landed in the same commit as its record");
      const anc = (x, y) => { try { git("merge-base", "--is-ancestor", x, y); return true; } catch (_) { return false; } };
      ok(sd.startsWith(P.seedSource.commit), `the declaration file was added in ${sd.slice(0, 8)}, not ${P.seedSource.commit}`);
      ok(anc(sd, p), `the declaration ${sd.slice(0, 8)} is not an ancestor of protocol 3's ${p.slice(0, 8)}`);
      ok(anc(p, r), `protocol 3's commit ${p.slice(0, 8)} is not an ancestor of its record's ${r.slice(0, 8)}`);
      note = `declaration ${sd.slice(0, 8)} -> protocol ${p.slice(0, 8)} -> record ${r.slice(0, 8)}`;
    }
  } catch (e) { if (/ancestor|same commit|added in/.test(String(e?.message))) throw e; }
  const decls = OC.ocProtocolDeclarations(P);
  const N = decls.reduce((n, d) => n + d.challengers.length, 0);
  ok(N === 36 && REC3.counts.declaredComparisons === N && REC3.comparisons.length === N && REC3.counts.comparisonsRunOnce === N, `comparisons ${REC3.comparisons.length} != declared ${N}`);
  ok(REC3.runs.length === decls.length && decls.every((d) => REC3.declarations.some((x) => x.id === d.id && x.hash)), "declarations and runs");
  ok(REC3.declarations.every((d) => d.seedRange === `${a}–${b}` || /probe/.test(d.id)), "every comparison on the declared seeds");
  ok(REC3.audit.ok && REC3.audit.declaredFirst && REC3.audit.seedOnce && REC3.audit.heldOnly, "audit flags");
  const ex = REC3.counts.exercised; ok(ex.undeclared && ex["seed-reused"] && ex["rule-broken"] && ex["not-held-out"], `exercised ${JSON.stringify(ex)}`);
  ok(REC3.probes.find((x) => x.kind === "runs-added-by-probes")?.n === 0, "the probes ran nothing");
  const claw = OC.ocClaw({ arena: stubArena() });
  for (const c of REC3.comparisons) {
    const run = REC3.runs.find((r) => r.declId === c.declId);
    ok(claw.judge(run.results.find((x) => x.modelId === c.challenger), run.results.find((x) => x.modelId === c.incumbent)) === c.verdict, `${c.declId} ${c.challenger}: ${c.verdict} does not re-derive`);
  }
  const clear = REC3.promotions.filter((x) => x.cCi[0] > x.iCi[1] && x.ruleBreaks === 0 && x.governorChecked === x.steps && x.physical === 0).length;
  ok(clear === REC3.promotions.length, "a protocol-3 promotion without a clear interval");
  let steps = 0, checked = 0, phys = 0;
  for (const r of REC3.runs) for (const x of r.results) { steps += x.steps; checked += x.governorChecked; phys += x.physical; }
  ok(steps === checked && steps === REC3.counts.stepsRun && phys === 0, `governor ${checked}/${steps}, physical ${phys}`);
  ok(REC3.world.physicalDispatched === 0 && REC3.world.governorEveryStep && REC3.world.stepsMonitored === REC3.world.steps, "protocol-3 world: governor and physical");
  const ch = OC.ocVerifyChain(REC3.chain); ok(ch.ok, `protocol-3 chain broken at ${ch.brokenAt}`);
  for (const id of ["ra-lm-h", "ra-lm-h48"]) { const n = REC3.runs.map((r) => r.results.find((x) => x.modelId === id)).filter((x) => x && x.applicable).length; ok(n === decls.length, `${id} applicable on ${n} of ${decls.length} scenarios`); }
  // arena.json retest8 is a copy of this one run, not a second run.
  const A = json("docs/evals/arena.json"); const r8 = A?.retest8; ok(r8, "arena.json lacks retest8");
  ok(r8.declared?.commit === P.seedSource.commit, "retest8 cites a different declaration");
  for (const x of r8.results) { const y = REC3.runs.find((r) => r.scenarioId === x.scenarioId)?.results.find((z) => z.modelId === x.modelId); ok(y && y.k === x.k && y.n === x.n && y.ruleBreaks === x.ruleBreaks && y.resultHash === x.resultHash, `retest8 ${x.modelId} ${x.scenarioId} differs from claw3.json`); }
  ok(JSON.stringify(r8.comparisons) === JSON.stringify(REC3.challengerRows.declared), "retest8 comparisons differ from the record's");
  const h = REC3.challengerRows.declared.amrHeadline;
  const N12 = (REC ? REC.counts.declaredComparisons : 0) + (REC2 ? REC2.counts.declaredComparisons : 0);
  evals.push(`declared comparisons: ${N12} -> ${N12 + N} (protocol 3: ${N} on ${a}–${b}, run once ${REC3.counts.comparisonsRunOnce}/${N}, ${REC3.counts.episodes} episodes)`);
  evals.push(`protocol 3 refusals exercised: 3/3 (+ not-held-out) ${JSON.stringify(REC3.counts.refusalsByReason)}; promotions ${REC3.promotions.length}, clear ${clear}/${REC3.promotions.length}: ${REC3.promotions.map((x) => `${x.scenarioId} ${x.from} -> ${x.to}`).join("; ")}`);
  evals.push(`AMR base headline ra-lm-h48 - bc: ${h["ra-lm-h48"]} vs ${h.bc}, ${h.diff} [${h.ci95.join(", ")}]${h.ci95[0] <= 0 && h.ci95[1] >= 0 ? " (spans 0: no claim)" : ""}`);
  evals.push(`protocol 3 governor ${checked}/${steps} steps, physical ${phys}; chain intact (${ch.lines} lines); arena.json retest8 = claw3.json (${r8.results.length} rows)`);
  return `${note}; ${N} comparisons, verdicts re-derived, ${REC3.promotions.length} promotions (clear ${clear}), chain ${ch.lines} lines intact, retest8 ${r8.results.length} rows equal`;
});

for (const e of evals) console.log(`EVAL ${e}`);
console.log(`\ncheck_claw: ${passes} passed, ${failures} failed (${Date.now() - t0} ms)`);
process.exit(failures ? 1 : 0);
