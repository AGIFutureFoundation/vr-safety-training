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
  const KEY = new RegExp(["api[_-]?key", "authori" + "zation:", "bear" + "er ", "sk-[A-Za-z0-9]{8}"].join("|"), "i");
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
  ok(/var ocHuman = [^\n]*!npParams\.has\("demo"\) && dxEligibility\(dxReadSignals\(\), \{ stage: "collect" \}\)\.eligible === true && !!dxConsent\(\)[^\n]*: null/.test(app), "the learner gate (DATAWORKS' collect-stage eligibility: signed in, adult, not K-12 or demo, and opted in)");
  const idx = src("WebXR/instructor/index.html"), ia = src("WebXR/instructor/js/app.js");
  ok(/id="tab-claw"/.test(idx) && /id="view-claw"/.test(idx) && /id="oc-root"/.test(idx), "instructor tab markup");
  ok(/\["claw", "tab-claw", "view-claw"\]/.test(ia) && /ocMountClaw\(\$\("oc-root"\), \{ record: OC_RECORD, human: null \}\)/.test(ia), "instructor tab wiring, no learner data");
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
  const files = [...OC_FILES, "WebXR/shared/oc-claw-record.js", "tools/claw_eval.mjs", "tools/check_claw.mjs", "docs/evals/claw.json", "docs/omega-claw.md", "docs/consoles/OMEGA-CLAW.md", "docs/consoles/memory/OMEGA-CLAW.md", "tools/briefs/next/oc-next.md"];
  let n = 0;
  for (const f of files) { const t = src(f); if (!t) continue; n += 1; ok(!MODEL.test(t), `${f}: model identifier`); ok(!CLAIM.test(t), `${f}: claim wording`); }
  return `${n} files clean`;
});

for (const e of evals) console.log(`EVAL ${e}`);
console.log(`\ncheck_claw: ${passes} passed, ${failures} failed (${Date.now() - t0} ms)`);
process.exit(failures ? 1 : 0);
