#!/usr/bin/env node
// check_agentgym — AGENTGYM's proofs (docs/consoles/AGENTGYM.md):
//   1. determinism: the same seed gives the same episode (summary and engine trace) for every baseline,
//      and the eval harness gives byte-identical JSON twice;
//   2. scoring parity with the human station: an agent run's engine actions replayed through a bare
//      shared/game.js Session (the path a learner's clicks take) give the same score, stars, errors and
//      hazard hits; the per-step station deltas add up to the station's score;
//   3. the observation never carries the step's target ids;
//   4. baselines: the scripted expert passes every station; retrieval beats random; numbers match
//      docs/perf/agent-baselines.json's configuration;
//   5. no network calls (static scan + a live run with fetch/XHR/WebSocket/beacon trapped) and the
//      external-agent adapter is off by default;
//   6. no collection without consent: ratings are refused signed-out, in the demo, in K-12 and before
//      opt-in; stored only after opt-in, valid DX episodes, paired; revoke deletes them;
//   7. agent → human: walkthroughs exist and step through real frames; the page is wired and offline;
//   8. no model identifiers in AGENTGYM's files.
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { ROOT, loadSmartCity } from "./lib/headless.mjs";
import { rng } from "../WebXR/shared/robot.js";

let passes = 0, failures = 0;
function check(ok, what, detail = "") {
  if (ok) { passes += 1; console.log(`  ✓ ${what}`); } else { failures += 1; console.log(`  ✗ ${what}${detail ? ` — ${detail}` : ""}`); }
}
const t0 = Date.now();
console.log("check_agentgym — stations as tasks for software agents");

// Trap every network primitive before anything runs; any call is a failure.
let netCalls = 0;
const trap = (name) => function () { netCalls += 1; throw new Error(`network call: ${name}`); };
globalThis.fetch = trap("fetch");
globalThis.XMLHttpRequest = trap("XMLHttpRequest");
globalThis.WebSocket = trap("WebSocket");
globalThis.EventSource = trap("EventSource");

const suite = await loadSmartCity();
suite.Sfx.muted = true;
try { Object.defineProperty(globalThis.navigator, "sendBeacon", { value: trap("sendBeacon"), configurable: true }); } catch { /* no navigator */ }
const ag = await import("../WebXR/shared/ag-gym.js");
const { agEnv, agRun, AG_BASELINES } = ag;

const STATIONS = ["robot-cell", "trench-box", "valve-vault", "boiler-room", "crane-yard"];
const bindOf = (id) => { const room = suite.ROOMS.find((r) => r.id === id); return { room, api: room.build(new suite.THREE.Group()), rebuild: () => room.build(new suite.THREE.Group()), SessionClass: suite.Session }; };
const envs = Object.fromEntries(STATIONS.map((id) => [id, agEnv(bindOf(id), { seed: 1 })]));
check(STATIONS.every((id) => envs[id]?.room?.id === id), `task envs build over ${STATIONS.length} stations (${STATIONS.join(", ")})`);

// 1. determinism
let detOk = true, detWhy = "";
for (const id of STATIONS) for (const name of Object.keys(AG_BASELINES)) for (const seed of [1, 4]) {
  const a = agRun(envs[id], name, { seed }); const b = agRun(envs[id], name, { seed });
  if (JSON.stringify([a.summary, a.trace, a.steps.map((s) => s.reward)]) !== JSON.stringify([b.summary, b.trace, b.steps.map((s) => s.reward)])) { detOk = false; detWhy = `${id}/${name}/seed ${seed}`; }
}
check(detOk, `deterministic: same station, baseline and seed → identical summary, engine trace and rewards (${STATIONS.length} stations × ${Object.keys(AG_BASELINES).length} baselines × 2 seeds)`, detWhy);
const r1 = agRun(envs["robot-cell"], "random", { seed: 1 }), r2 = agRun(envs["robot-cell"], "random", { seed: 2 });
check(JSON.stringify(r1.trace) !== JSON.stringify(r2.trace), "different seeds give different random-baseline episodes");
const { agEvaluate } = await import("./ag_eval.mjs");
const e1 = JSON.stringify(await agEvaluate({ seeds: 2, stations: ["robot-cell", "valve-vault"] }));
const e2 = JSON.stringify(await agEvaluate({ seeds: 2, stations: ["robot-cell", "valve-vault"] }));
check(e1 === e2, "eval harness: the same arguments give byte-identical JSON (no wall-clock fields)");

// 2. scoring parity with the human station
const replay = (bind, trace, seed) => {
  // The same seeded cosmetic stream the env lends the engine, then the learner's path: applyAction + tick.
  const engineRandom = rng(seed * 48271 + 17);
  const seeded = (fn) => { const m = Math.random; Math.random = engineRandom; try { return fn(); } finally { Math.random = m; } };
  const api = bind.rebuild();
  const s = seeded(() => new suite.Session(bind.room, { onStep: (x, y) => api.onStep?.(x, y), onStepComplete: (x, y) => api.onStepComplete?.(x, y), onFeedback: (f, y) => api.onFeedback?.(f, y), onHazard: (h, y) => api.onHazard?.(h, y) }));
  seeded(() => s.start());
  for (const a of trace) seeded(() => { suite.applyAction(s, a); s.tick(ag.AG_DT); });
  return { score: s.score, stars: s.stars, errors: s.errors, hazardHits: s.hazardHits, finished: s.finished };
};
let parOk = true, parWhy = "", sumOk = true, compared = 0;
for (const id of STATIONS) for (const name of ["expert", "retrieval", "random"]) {
  const run = agRun(envs[id], name, { seed: 3 });
  const h = replay(bindOf(id), run.trace, 3);
  const g = run.summary;
  compared += 1;
  if (h.score !== g.stationScore || h.stars !== g.stars || h.errors !== g.errors || h.hazardHits !== g.hazardHits || h.finished !== g.finished) { parOk = false; parWhy = `${id}/${name}: human path ${JSON.stringify(h)} vs agent ${JSON.stringify(g)}`; }
  const deltas = run.steps.reduce((n, s) => n + s.info.stationDelta, 0);
  const floor = run.steps.some((s, i) => i > 0 && s.observation.score === 0 && s.info.stationDelta < 0);   // the engine floors a score at 0
  if (!floor && deltas !== g.stationScore) { sumOk = false; parWhy ||= `${id}/${name}: deltas ${deltas} vs ${g.stationScore}`; }
}
check(parOk, `scoring parity: ${compared} agent runs replayed through a bare Session on the human input path give the same score, stars, errors, hazard hits`, parWhy);
check(sumOk, "rewards are the station's own score: per-step station deltas sum to the final station score", parWhy);
const hintRun = agRun(envs["robot-cell"], "retrieval", { seed: 1, policy: AG_BASELINES.retrieval(envs["robot-cell"], { seed: 1, margin: 0.6 }) });
const rsum = Math.round(hintRun.steps.reduce((n, s) => n + s.reward, 0) * 1000), expect = Math.round((hintRun.summary.stationScore / 100 - hintRun.summary.hints * ag.AG_HINT_COST) * 1000);
check(hintRun.summary.hints > 0 && Math.abs(rsum - expect) <= hintRun.steps.length, `the only gym-side term is the documented hint cost (${ag.AG_HINT_COST}/hint; ${hintRun.summary.hints} hints, station score untouched)`, `${rsum} vs ${expect}`);

// 3. observation hides the answer
const leaks = [];
for (const id of STATIONS) {
  const env = envs[id]; let obs = env.reset(2);
  for (let i = 0; i < 400; i++) {
    const keys = JSON.stringify(obs);
    if (/"target"|"targets"|"remaining"/.test(keys)) { leaks.push(id); break; }
    const r = env.step(AG_BASELINES.expert(env, { seed: 2 })(obs)); obs = r.observation; if (r.done) break;
  }
}
check(!leaks.length, "observations carry step text, visible objects, known hazards and control state — never a target id", leaks.join(", "));
const o0 = envs["robot-cell"].reset(1);
check(o0.title && o0.cue && Array.isArray(o0.visible) && o0.visible.length > 3 && Array.isArray(o0.hazardsKnown) && "control" in o0, "observation shape: title, cue, why, visible[{id,name}], hazardsKnown, control");
check(JSON.stringify(ag.AG_ACTIONS.slice(0, 4)) === JSON.stringify(["select", "inspect", "confirm", "hint"]), `discrete actions: ${ag.AG_ACTIONS.join(", ")}`);
envs["robot-cell"].reset(1);
const ins = envs["robot-cell"].step({ type: "inspect", id: "curtain-bypass" });
check(ins.observation.lastInspect?.hazard === true && ins.observation.hazardsKnown.includes("curtain-bypass") && ins.info.stationDelta === 0, "inspect reveals a hazard without touching it (no score change)");

// 4. baselines
const evalSmall = JSON.parse(e1);
const sm = evalSmall.summary;
check(sm.expert.successRate === 1, `scripted expert passes every episode (${sm.expert.episodes}/${sm.expert.episodes} on the probe set)`);
const baseFile = join(ROOT, "docs/perf/agent-baselines.json");
const base = existsSync(baseFile) ? JSON.parse(readFileSync(baseFile, "utf8")) : null;
check(!!base && ["random", "expert", "retrieval"].every((k) => base.summary?.[k]), "docs/perf/agent-baselines.json has random, expert and retrieval");
if (base) {
  const b = base.summary;
  check(b.expert.successRate === 1 && b.retrieval.successRate > b.random.successRate, `full eval: expert ${(b.expert.successRate * 100).toFixed(1)}% > retrieval ${(b.retrieval.successRate * 100).toFixed(1)}% > random ${(b.random.successRate * 100).toFixed(1)}% (${base.config.stations} stations × ${base.config.seeds.length} seeds)`);
  check(base.config.maxSteps === ag.AG_MAX_STEPS && base.config.hintCost === ag.AG_HINT_COST && base.config.dt === ag.AG_DT, "baseline file's configuration matches the module's constants");
}

// 5. network + adapter
const files = ["WebXR/shared/ag-gym.js", "WebXR/shared/ag-feedback.js", "WebXR/shared/ag-walkthroughs.js", "WebXR/agentgym/index.html", "tools/ag_eval.mjs"];
const NET = /\bfetch\s*\(|XMLHttpRequest|new\s+WebSocket|sendBeacon|EventSource|navigator\.sendBeacon|import\s*\(\s*["']https?:/;
const netHits = files.filter((f) => existsSync(join(ROOT, f)) && NET.test(readFileSync(join(ROOT, f), "utf8")));
check(!netHits.length, "no fetch / XHR / WebSocket / beacon / remote import in AGENTGYM's files", netHits.join(", "));
check(netCalls === 0, `no network calls during ${compared + 30 + 4} runs and two evals (fetch/XHR/WebSocket/beacon trapped)`);
check(ag.AG_ADAPTER.enabled === false && ag.agAdapterPolicy(envs["robot-cell"]) === null, "external-agent adapter is off by default (agAdapterPolicy returns null)");
const adapted = ag.agAdapterPolicy(envs["robot-cell"], { enabled: true, decide: () => ({ type: "wait" }) });
check(typeof adapted === "function" && adapted(o0).type === "wait" && ag.agAdapterPolicy(envs["robot-cell"], { enabled: true, decide: () => ({ type: "rm -rf" }) })(o0).type === "wait", "an enabled adapter only passes through actions from the discrete action space");

// 6. consent
const dx = await import("../WebXR/shared/dx-data.js");
const fb = await import("../WebXR/shared/ag-feedback.js");
const store = dx.dxUseStore(dx.dxMakeStore(dx.dxMemBackend()));
const demo = agRun(envs["valve-vault"], "expert", { seed: 1 }), demo2 = agRun(envs["valve-vault"], "random", { seed: 1 });
const ADULT = { demo: false, signedIn: true, k12: false, adult: true };
const tryRate = (signals, run = demo, rating = "up", reason = "safe-order", agent = "expert") => fb.agRate({ run, agent, rating, reason, signals });
check(!(await tryRate(ADULT)).ok && (await store.list()).length === 0, "no rating is stored before opt-in, even in an eligible session");
check(!dx.dxOptIn({ licence: "CC0-1.0", adult: true, signals: { demo: false, signedIn: true, k12: true } }).ok, "opt-in is refused in a K-12 session");
const opt = dx.dxOptIn({ licence: "CC0-1.0", adult: true, signals: { demo: false, signedIn: true, k12: false } });
check(opt.ok, "an adult in a signed-in, non-K-12, non-demo session can opt in");
check(!(await tryRate({ ...ADULT, k12: true })).ok && !(await tryRate({ ...ADULT, demo: true })).ok && !(await tryRate({ ...ADULT, signedIn: false })).ok && !(await tryRate({ ...ADULT, adult: null })).ok, "after opt-in, K-12, demo, signed-out and age-unknown sessions still store nothing");
check((await store.list()).length === 0, "store still empty after the refused ratings");
check(!(await fb.agRate({ run: demo, agent: "expert", rating: "up", reason: "free text here", signals: ADULT })).ok, "a rating reason must come from the fixed list (no free text)");
const up = await tryRate(ADULT, demo, "up", "safe-order", "expert");
const down = await tryRate(ADULT, demo2, "down", "unsafe-touch", "random");
const stored = await store.list();
check(up.ok && down.ok && stored.length === 2 && stored.every((e) => dx.dxValidateEpisode(e).ok && e.source === "human" && e.consent?.consentId && e.kind === "gym"), "with consent, ratings are stored locally as valid DX episodes (source human, kind gym, consent receipt)");
const pairs = fb.agPreferencePairs(stored);
check(pairs.length === 1 && pairs[0].chosen.agent === "expert" && pairs[0].rejected.agent === "random" && pairs[0].station === "valve-vault", "ratings pair up as preference pairs { station, chosen, rejected, reasons }");
await dx.dxRevoke({ store });
check((await store.list()).length === 0 && fb.agPreferencePairs(await store.list()).length === 0 && !(await tryRate(ADULT)).ok, "revoke deletes every rating, and nothing is stored afterwards");

// 7. walkthroughs + page
const w = ag.agWalkthrough(demo, envs["valve-vault"].room, envs["valve-vault"].names());
check(w.frames.length > 0 && w.frames.every((f) => f.say && f.stepTitle) && new Set(w.frames.map((f) => f.stepIndex)).size === envs["valve-vault"].room.steps.length, `agent → human: the expert's run is a ${w.frames.length}-frame walkthrough covering all ${envs["valve-vault"].room.steps.length} steps`);
let wt = null;
try { wt = (await import("../WebXR/shared/ag-walkthroughs.js")).AG_WALKTHROUGHS; } catch { /* missing */ }
check(Array.isArray(wt) && wt.length >= 4 && wt.every((r) => r.frames.length && r.runId && r.summary), `recorded walkthroughs for the page: ${wt?.length ?? 0} runs`);
const page = existsSync(join(ROOT, "WebXR/agentgym/index.html")) ? readFileSync(join(ROOT, "WebXR/agentgym/index.html"), "utf8") : "";
check(/ag-walkthroughs\.js/.test(page) && /ag-feedback\.js/.test(page) && /dxMountConsent/.test(page) && /<title>/.test(page), "WebXR/agentgym/index.html steps through walkthroughs and rates through the consent panel");
const bundler = readFileSync(join(ROOT, "tools/bundle_webxr.py"), "utf8");
check(/"agentgym"/.test(bundler) && /ag-feedback\.js/.test(bundler) && /ag-walkthroughs\.js/.test(bundler), "the bundler copies the page and its shared modules");

// 8. no model identifiers
// Built from pieces so this file does not match itself.
const MODEL = new RegExp(`\\b(${["cla" + "ude-[a-z0-9]", "g" + "pt-\\d", "o" + "pus", "son" + "net", "hai" + "ku", "gem" + "ini", "lla" + "ma", "mis" + "tral"].join("|")})\\b`, "i");
const mHits = [...files, "tools/check_agentgym.mjs", "docs/consoles/AGENTGYM.md", "docs/perf/agent-baselines.json"].filter((f) => existsSync(join(ROOT, f)) && MODEL.test(readFileSync(join(ROOT, f), "utf8")));
check(!mHits.length, "no model identifiers in AGENTGYM's files", mHits.join(", "));

console.log(`\ncheck_agentgym: ${passes} passed, ${failures} failed (${Date.now() - t0} ms)`);
process.exit(failures ? 1 : 0);
