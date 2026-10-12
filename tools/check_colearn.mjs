#!/usr/bin/env node
// COLEARN checker (docs/consoles/COLEARN.md): humans, robots and agents learning from each other.
//   1. demonstrations: synthetic stand-ins are labelled synthetic and valid DX episodes
//   2. consent: a human episode without an adult consent receipt is refused; the local store is read
//      only while collecting (demo, signed-out, K-12, unknown or not opted in -> nothing)
//   3. training is deterministic (same demos + seed -> the same model hash; the ghost replays identically)
//   4. the behaviour-cloning policy beats random on held-out seeds, with its gap to the scripted expert
//   5. filtering demonstrations to clean passes never does worse than cloning everything
//   6. explanations come from the policy's own features (fixed phrases, every ghost frame)
//   7. the tutor: UCB tries every style, review order follows error rates, local per-profile persistence
//   8. the tutor's simulated gains with 95% intervals (and the population where it does not help)
//   9. no network code; no language-model call; no model identifiers
//  10. wiring: bundle order, the parishes mount, capture through DATAWORKS' gate, reduced motion
//
//     node tools/check_colearn.mjs

import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const SHARED = join(ROOT, "WebXR", "shared");
let passes = 0, failures = 0;
function check(ok, what, detail = "") {
  if (ok) { passes += 1; console.log(`  ✓ ${what}`); } else { failures += 1; console.log(`  ✗ ${what}${detail ? ` — ${detail}` : ""}`); }
}

// A headless browser storage before profiles.js is imported (as check_dataworks does).
class Mem { constructor() { this.m = new Map(); } getItem(k) { return this.m.has(k) ? this.m.get(k) : null; } setItem(k, v) { this.m.set(k, String(v)); } removeItem(k) { this.m.delete(k); } }
globalThis.localStorage = new Mem();
globalThis.sessionStorage = new Mem();
const signIn = () => localStorage.setItem("vr-training-auth-v1", JSON.stringify({ id: "learner-check@example.invalid" }));

const dx = await import("../WebXR/shared/dx-data.js");
const { GT_PROFILE_KEYS } = await import("../WebXR/shared/profiles.js");
const C = await import("../WebXR/shared/col-learn.js");
const { rbEnv } = await import("../WebXR/shared/rb-env.js");
const { colEvalAll, COL_EVAL_PATH } = await import("./col_eval.mjs");

console.log("check_colearn — humans, robots and agents learning from each other");

// 1 demonstrations
console.log("1 demonstrations");
const SC = "rb-cell-entry";
const syn = C.colSyntheticDemos(SC, { n: 12, seed: 3 });
check(syn.every((e) => e.source === "synthetic" && e.consent === null && e.sessionHash === null), `${syn.length} synthetic demonstrations say source "synthetic", carry no consent receipt and no session hash`);
check(syn.every((e) => dx.dxValidateEpisode(e).ok), "every synthetic demonstration is a valid DX episode (dxValidateEpisode)");
check(syn.every((e) => /synthetic human stand-in/.test(e.provenance.policy)), "provenance names them a synthetic human stand-in (scripted expert with lapses + action noise)");

// 2 consent
console.log("2 consent");
const human = (consent) => dx.dxMakeEpisode({ source: "human", world: "robotics", kind: "robot-game", scenario: SC, episodeId: `h-${consent ? "c" : "n"}`, consent, startedAt: "2026-01-01T00:00:00.000Z", createdAt: "2026-01-01T00:00:00.000Z", summary: { success: true, safePractice: true } }, syn[0].steps);
const receipt = { consentId: "c-check", at: "2026-01-01T00:00:00.000Z", licence: "CC0-1.0", adult: true, statementHash: "x", schema: "s", collects: "DX_COLLECTS", never: [], revocable: true, storage: "local-only" };
const noReceipt = human(null);
const { demos: d1, refused } = C.colDemosFromEpisodes([noReceipt, human(receipt), ...syn.slice(0, 2)], SC);
check(refused.length === 1 && refused[0].id === "h-n" && d1.length === 3, `a human episode without a consent receipt is refused (${refused[0]?.why}); one with an adult receipt and the synthetic ones are kept`);
const { refused: r2 } = C.colDemosFromEpisodes([human({ ...receipt, adult: false })], SC);
check(r2.length === 1, `a receipt without the adult attestation is refused (${r2[0]?.why})`);
const store = dx.dxMakeStore(dx.dxMemBackend());
await store.put(human(receipt));
const gates = [["not signed in, no consent", null]];
signIn();
for (const [label, sg] of [["demo", { demo: true, signedIn: true, k12: false, adult: true }], ["signed out", { demo: false, signedIn: false, k12: false, adult: true }], ["K-12", { demo: false, signedIn: true, k12: true, adult: true }], ["unknown K-12", { demo: false, signedIn: true, k12: null, adult: true }]]) gates.push([label, sg]);
gates.push(["eligible but not opted in", { demo: false, signedIn: true, k12: false, adult: true }]);
const got = [];
for (const [label, sg] of gates) got.push([label, (await C.colLocalDemos(SC, { store, signals: sg })).length]);
check(got.every(([, n]) => n === 0), `the local store is not read without consent: ${got.map(([l, n]) => `${l} ${n}`).join(", ")}`);
const opt = dx.dxOptIn({ licence: "CC0-1.0", adult: true, signals: { demo: false, signedIn: true, k12: false, adult: null } });
const after = await C.colLocalDemos(SC, { store, signals: { demo: false, signedIn: true, k12: false, adult: true } });
const k12After = await C.colLocalDemos(SC, { store, signals: { demo: false, signedIn: true, k12: true, adult: true } });
check(opt.ok && after.length === 1 && k12After.length === 0, `after an adult opt-in the learner's own episode is read (${after.length}); a K-12 session still reads none (${k12After.length})`);
await dx.dxRevoke({ store });
check((await C.colLocalDemos(SC, { store, signals: { demo: false, signedIn: true, k12: false, adult: true } })).length === 0 && (await store.list()).length === 0, "after revoke nothing is left to learn from");

// 3 determinism
console.log("3 determinism");
const mk = (seed) => C.colTrain(SC, C.colDemosFromEpisodes(C.colSyntheticDemos(SC, { n: 20, seed: 1 }), SC).demos, { seed });
const h1 = C.colHash(mk(1)), h2 = C.colHash(mk(1)), h3 = C.colHash(mk(2));
check(h1 === h2, `training twice gives the same model (hash ${h1})`);
check(h1 !== h3, "a different training seed gives a different (seeded) row order");
const g1 = C.colHash(C.colGhost(mk(1), { seed: 7001 })), g2 = C.colHash(C.colGhost(mk(1), { seed: 7001 }));
check(g1 === g2, `the robot-demonstrates ghost replays identically (hash ${g1})`);
check(C.colHash(C.colTutorSim({ learners: 40 })) === C.colHash(C.colTutorSim({ learners: 40 })), "the tutor simulation is deterministic by seed");

// 4–5 policy evals (tools/col_eval.mjs computes them; docs/evals/colearn.json must match a live run)
console.log("4 behaviour cloning versus random and the expert (held-out seeds 7001–7060)");
const t0 = Date.now();
const EV = await colEvalAll();
for (const p of EV.policies) check(p.bcFiltered.success > p.random.success, `${p.scenario}: BC ${p.bcFiltered.success} > random ${p.random.success}; expert ${p.expert.success}; gap to expert ${p.gapToExpert}${p.bcFilteredShield ? `; BC + reservation shield ${p.bcFilteredShield.success}` : ""} (${p.demosKept}/${p.demosOffered} demos kept, ${p.rows} rows)`);
for (const p of EV.stations) check(p.bcFiltered.success > p.random.success && p.demosKept > 0, `${p.scenario} (station ${p.station}, learnt from its station episodes): BC ${p.bcFiltered.success} > random ${p.random.success}; expert ${p.expert.success}; gap ${p.gapToExpert} (${p.demosKept}/${p.demosOffered} demos, ${p.bcFiltered.n} held-out seeds)`);
console.log("5 filtered versus unfiltered demonstrations");
for (const p of EV.policies) check(p.bcFiltered.success >= p.bcUnfiltered.success, `${p.scenario}: cloning clean passes only ${p.bcFiltered.success} >= cloning every demonstration ${p.bcUnfiltered.success}`);
check(EV.policies.every((p) => p.expert.success >= p.bcFiltered.success - 0.02), `the scripted expert stays the ceiling (mean gap ${(EV.policies.reduce((n, p) => n + p.gapToExpert, 0) / EV.policies.length).toFixed(3)}; eval ${Date.now() - t0} ms)`);
let committed = null; try { committed = readFileSync(COL_EVAL_PATH, "utf8"); } catch (_) { /* missing */ }
check(committed === JSON.stringify(EV, null, 2) + "\n", "docs/evals/colearn.json matches a live run byte for byte (node tools/col_eval.mjs regenerates it)");

// 6 explanations
console.log("6 explanations");
const FEAR = /\b(danger\w*|deadly|death|die[sd]?|kill\w*|crush\w*|injur\w*|hurt\w*|maim\w*|scar(y|e[sd]?)|fear\w*|terrif\w*|amputat\w*|blood\w*)\b/i;
const COL_PHRASES = new Set(Object.values(C.COL_FEATURES).flatMap((F) => F.text.flat()));
let frames = 0, bad = [];
for (const sc of C.COL_SCENARIOS) {
  const model = C.colTrain(sc, C.colDemosFromEpisodes(C.colSyntheticDemos(sc, { n: 30, seed: 1 }), sc).demos, { seed: 1 });
  const obs = rbEnv(sc, { seed: 7005 }).reset(7005);
  const e = C.colExplain(model, obs);
  if (!(e.because.length >= 1 && e.because.every((b) => COL_PHRASES.has(b.says)) && /^The robot chose to /.test(e.text) && e.agree >= 1 && e.agree <= e.k)) bad.push(`${sc}: ${e.text}`);
  for (const fr of C.colGhost(model, { seed: 7005 })) { frames += 1; if (!fr.explain || /undefined|NaN/.test(fr.explain) || FEAR.test(fr.explain)) bad.push(`${sc}: ${fr.explain}`); }
}
check(!bad.length, `${frames} ghost frames over ${C.COL_SCENARIOS.length} scenarios each carry a plain explanation built from the policy's features`, bad.slice(0, 2).join(" | "));

// 7 tutor mechanics
console.log("7 tutor");
const tu = C.colTutor({ state: { v: 1, styles: Object.fromEntries(C.COL_HINT_STYLES.map((s) => [s, { n: 0, r: 0 }])), steps: {}, pending: null } });
const firsts = [];
for (let i = 0; i < 4; i++) { const h = tu.hint("lockout"); firsts.push(h.style); tu.record("lockout", i % 2 === 0); }
check(new Set(firsts).size === 4, `UCB1 tries every hint style once first (${firsts.join(", ")})`);
for (let i = 0; i < 5; i++) tu.record("verify", false);
check(tu.nextReview()[0] === "verify", `the step with the highest error rate is reviewed first (${tu.nextReview().slice(0, 3).join(", ")})`);
const mem = new Mem();
const t2 = C.colTutor({ storage: mem }); t2.record("enter", false); t2.save();
const t3 = C.colTutor({ storage: mem });
check(t3.state.steps.enter?.errors === 1 && GT_PROFILE_KEYS.includes(C.COL_TUTOR_KEY), `tutor counts persist locally per profile (${C.COL_TUTOR_KEY} is a per-profile key)`);
C.colTutorForget(mem);
check(mem.getItem(C.COL_TUTOR_KEY) === null, "colTutorForget clears them");
check(C.COL_TUTOR_STEPS.every((s) => C.COL_HINT_STYLES.every((k) => typeof s[k] === "string" && s[k].length > 8 && !FEAR.test(s[k]))), `${C.COL_TUTOR_STEPS.length} steps × ${C.COL_HINT_STYLES.length} hint styles written, calm wording`);

// 8 tutor simulation
console.log("8 tutor simulation (simulated learners — colTutorSim's own response model)");
const sim = EV.tutor.mixed, tb = EV.tutor.tellBest;
const ci = (s) => `${s.mean} [${s.lo}, ${s.hi}]`;
check(sim.gain.mistakes.lo > 0, `mixed learners (n=${sim.learners}): mistakes static ${ci(sim.static.mistakes)} → adaptive ${ci(sim.adaptive.mistakes)}; gain ${ci(sim.gain.mistakes)} (95% CI, paired)`);
check(sim.gain.attempts.mean > 0 && sim.gain.attempts.lo <= sim.gain.attempts.mean && sim.gain.attempts.mean <= sim.gain.attempts.hi, `steps to pass static ${ci(sim.static.attempts)} → adaptive ${ci(sim.adaptive.attempts)}; gain ${ci(sim.gain.attempts)}; hints given static ${sim.static.hints.mean} vs adaptive ${sim.adaptive.hints.mean}`);
check(tb.gain.attempts.mean < sim.gain.attempts.mean, `honest limit: when the static "tell" hint is already best for everyone, adaptive gains ${ci(tb.gain.attempts)} steps and ${ci(tb.gain.mistakes)} mistakes (exploration costs)`);

// 9 no network
console.log("9 no network, no model call");
const src = readFileSync(join(SHARED, "col-learn.js"), "utf8");
check(!/\bfetch\s*\(|XMLHttpRequest|sendBeacon|WebSocket|EventSource|https?:\/\//.test(src), "col-learn.js has no fetch / XHR / beacon / socket / URL");
const MODEL_ID = new RegExp("\\b(" + ["cla" + "ude-", "gp" + "t-", "gem" + "ini", "ll" + "ama", "op" + "us", "son" + "net", "hai" + "ku"].join("|") + ")", "i");
let docText = ""; try { docText = readFileSync(join(ROOT, "docs", "consoles", "COLEARN.md"), "utf8"); } catch (_) { /* written with the run */ }
check(!MODEL_ID.test(src) && !MODEL_ID.test(docText), "no model identifier in col-learn.js or docs/consoles/COLEARN.md");
check(/BEHAVIOUR CLONING/.test(src) && /MULTI-ARMED BANDIT/.test(src) && /HEURISTIC/.test(src), "the module names each learner for what it is (behaviour cloning, a bandit, a heuristic)");

// 10 wiring
console.log("10 wiring");
const py = readFileSync(join(ROOT, "tools", "bundle_webxr.py"), "utf8");
const at = (f) => py.indexOf(`SHARED / "${f}"`, py.indexOf('"parishes": {'));
check(at("col-learn.js") > at("rb-env.js") && at("col-learn.js") > at("dx-data.js") && at("rb-env.js") > 0, "col-learn.js is in the parishes bundle after rb-env.js and dx-data.js");
const app = readFileSync(join(ROOT, "WebXR", "parishes", "js", "app.js"), "utf8");
check(/colMountCoLearn\(\$\("menu-drills"\), \{ reducedMotion: npReduced, capture: \(steps, meta\) => dxCaptureRollout\(steps, meta\) \}\)/.test(app), "the parishes app mounts the panel in the drills menu; a finished try goes only through dxCaptureRollout (inert unless opted in)");
check(/if \(!reducedMotion\) timer = setInterval/.test(src) && /prefers-reduced-motion: reduce/.test(src), "reduced motion: the ghost does not autoplay (Next steps it) and the dot does not animate");
check(/tutor\.nextReview\(\)\[0\]/.test(src) && /Review first: /.test(src), "the panel previews the learner's most-missed step first (the per-step error table re-orders review)");
const dw = readFileSync(join(SHARED, "dx-world.js"), "utf8");
check(/export function dxCaptureRollout[\s\S]{0,80}if \(!dxCollecting\(\)\) return null;/.test(dw), "dxCaptureRollout returns before recording when not collecting");

// 11 preference pairs train a reward model (ROBOTRAIN-6, shared/rt6-learn.js)
console.log("11 preference pairs → Bradley–Terry reward model → reward-filtered cloning (ROBOTRAIN-6; synthetic pairs, synthetic rater)");
const R6 = await import("../WebXR/shared/rt6-learn.js");
const fb = await import("../WebXR/shared/ag-feedback.js");
const P6 = R6.rt6SyntheticPairs("rb-amr-fleet-routing", { n: 40, seed: 1 });
const m6a = R6.rt6FitReward(P6.pairs), m6b = R6.rt6FitReward(R6.rt6SyntheticPairs("rb-amr-fleet-routing", { n: 40, seed: 1 }).pairs);
check(C.colHash(m6a) === C.colHash(m6b) && P6.pairs.every((p) => p.source === "synthetic" && p.x.chosen.length === R6.RT6_TRAJ_FEATURES.length && fb.AG_RATING_REASONS.up.includes(p.reasons.chosen) && fb.AG_RATING_REASONS.down.includes(p.reasons.rejected)), `the reward model fits deterministically (hash ${C.colHash(m6a)}) from synthetic pairs in AGENTGYM's pair shape, each labelled synthetic, reasons from AG_RATING_REASONS`);
for (const p of EV.preference.scenarios) {
  check(p.pairs.synthetic === 200 && p.pairs.local === 0 && p.accuracy.heldOut > 0.5 && [p.unfiltered, p.ruleFiltered, p.rewardFiltered].every((a) => a.n === 60) && p.keep === R6.RT6_KEEP,
    `${p.scenario}: held-out pair accuracy ${p.accuracy.heldOut} (chance 0.5; the rater's own ceiling ${p.accuracy.raterCeilingHeldOut}); clone success on 60 held-out seeds: reward-filtered ${p.rewardFiltered.success} (top ${p.keep * 100}%, ${p.rewardFiltered.demos} demos, ${p.keptClean} clean passes) · rule-filtered ${p.ruleFiltered.success} (${p.ruleFiltered.demos}) · unfiltered ${p.unfiltered.success} (${p.unfiltered.demos}); sweep ${p.sweep.map((s) => `${s.keep}: ${s.success}`).join(", ")}`);
}
check(EV.preference.scenarios.every((p) => p.rewardWeighted?.n === 60 && p.rewardWeighted.demos === p.unfiltered.demos) && !C.colTrain("rb-amr-fleet-routing", C.colDemosFromEpisodes(C.colSyntheticDemos("rb-amr-fleet-routing", { n: 4, seed: 1 }), "rb-amr-fleet-routing").demos).rows.some((r) => "w" in r),
  `reward-weighted votes (every demonstration kept, each vote scaled by the model's P(preferred over the median demonstration); default models carry no weight): ${EV.preference.scenarios.map((p) => `${p.scenario} ${p.rewardWeighted.success} (weights ${p.rewardWeighted.minWeight}–${p.rewardWeighted.maxWeight}) vs rule-filtered ${p.ruleFiltered.success}, unfiltered ${p.unfiltered.success}`).join("; ")}`);
// ROBOTRAIN-7: a per-step reward on short step windows (shared/rt7-learn.js); only the low-reward moments are dropped.
const R7 = await import("../WebXR/shared/rt7-learn.js");
const W7a = R7.rt7WindowPairs("rb-amr-fleet-routing", { n: 30, seed: 1 }), W7b = R7.rt7WindowPairs("rb-amr-fleet-routing", { n: 30, seed: 1 });
const m7a = R6.rt6FitReward(W7a.pairs, { names: R7.RT7_WINDOW_FEATURES }), m7b = R6.rt6FitReward(W7b.pairs, { names: R7.RT7_WINDOW_FEATURES });
check(C.colHash(m7a) === C.colHash(m7b) && W7a.pairs.every((p) => p.source === "synthetic" && p.window === R7.RT7_WINDOW && p.x.chosen.length === R7.RT7_WINDOW_FEATURES.length) && EV.preference.scenarios.every((p) => p.stepReward?.n === 60 && p.stepReward.threshold === R7.RT7_DROP_BELOW && p.stepReward.window === R7.RT7_WINDOW && p.stepReward.pairs.synthetic === 200 && p.stepReward.sweep.length === R7.RT7_DROP_SWEEP.length),
  `a per-step reward (Bradley–Terry on ${R7.RT7_WINDOW}-step windows, synthetic window pairs, deterministic hash ${C.colHash(m7a)}); steps whose window the model prefers to the median one with P < ${R7.RT7_DROP_BELOW} are dropped, every other step kept: ${EV.preference.scenarios.map((p) => `${p.scenario} ${p.stepReward.success} (dropped ${p.stepReward.stepsDropped} of ${p.stepReward.stepsOf} steps, ${p.stepReward.ruleBrokenDropped} of ${p.stepReward.ruleBrokenSteps} rule-broken; window-pair accuracy ${p.stepReward.accuracy.heldOut}, ceiling ${p.stepReward.accuracy.raterCeilingHeldOut}) vs rule-filtered ${p.ruleFiltered.success}, unfiltered ${p.unfiltered.success}; sweep ${p.stepReward.sweep.map((x) => `${x.threshold}: ${x.success}`).join(", ")} (not chosen from)`).join("; ")}`);
// A learner's consented pairs join only while collecting; K-12 and revoke leave none (DATAWORKS' rules).
const lstore = dx.dxMakeStore(dx.dxMemBackend());
await dx.dxRevoke({ store: lstore });
const ADULT6 = { demo: false, signedIn: true, k12: false, adult: true };
const fakeRun = (passed, hazard) => ({ summary: { station: "valve-vault", passed, stationScore: passed ? 90 : 20, errors: hazard, hazardHits: hazard, seed: 1 },
  steps: [{ t: 1, observation: { stepIndex: 0 }, action: { type: "select", id: "a" }, info: { hazard: hazard > 0, stationDelta: 0 } }, { t: 2, observation: { stepIndex: 1 }, action: { type: "confirm", id: "b" }, info: { stationDelta: 10 } }] });
const before6 = await R6.rt6LocalPairs({ store: lstore, signals: ADULT6 });
dx.dxOptIn({ licence: "CC0-1.0", adult: true, signals: { demo: false, signedIn: true, k12: false } });
const up6 = await fb.agRate({ run: fakeRun(true, 0), agent: "expert", rating: "up", reason: "safe-order", signals: ADULT6 }, { store: lstore });
const down6 = await fb.agRate({ run: fakeRun(false, 2), agent: "random", rating: "down", reason: "unsafe-touch", signals: ADULT6 }, { store: lstore });
const local6 = await R6.rt6LocalPairs({ store: lstore, signals: ADULT6 });
const k12six = await R6.rt6LocalPairs({ store: lstore, signals: { ...ADULT6, k12: true } });
const mixed6 = R6.rt6FitReward([...P6.pairs, ...local6]);
await dx.dxRevoke({ store: lstore });
const after6 = await R6.rt6LocalPairs({ store: lstore, signals: ADULT6 });
check(before6.length === 0 && up6.ok && down6.ok && local6.length === 1 && local6[0].source === "human" && k12six.length === 0 && mixed6.sources.join() === "human,synthetic" && after6.length === 0 && (await lstore.list()).length === 0,
  `a learner's consented pairs join the fit only while collecting: before opt-in ${before6.length}, opted in ${local6.length} (source human), K-12 ${k12six.length}, after revoke ${after6.length} and the store empty`);

// ROBOTRAIN-7: ratings of two cloned robot runs (the teleop pad's "Rate two robot runs", rt7RobotRun) through agRate; rt6LocalPairs
// returns them only while collecting; K-12, demo and signed-out sessions store and return nothing; revoke empties them.
const RTT = await import("../WebXR/shared/rt-teleop.js");
const rstore = dx.dxMakeStore(dx.dxMemBackend());
await dx.dxRevoke({ store: rstore });
const rsc = "rb-teleop-pick-place", rmod = C.colTrain(rsc, C.colDemosFromEpisodes(C.colSyntheticDemos(rsc, { n: 10, seed: 1 }), rsc).demos, { seed: 1 });
const runA7 = RTT.rt7RobotRun(rmod, 7001), runB7 = RTT.rt7RobotRun(rmod, 7002);
const rate7 = async (signals) => { const r = [await fb.agRate({ run: runA7, agent: "robot-clone:synthetic", rating: "up", reason: "safe-order", signals }, { store: rstore }), await fb.agRate({ run: runB7, agent: "robot-clone:synthetic", rating: "down", reason: "slow", signals }, { store: rstore })]; return r.filter((x) => x.ok).length; };
const K12_7 = { ...ADULT6, k12: true }, DEMO7 = { ...ADULT6, demo: true }, OUT7 = { ...ADULT6, signedIn: false };
const notOpted7 = await rate7(ADULT6);
dx.dxOptIn({ licence: "CC0-1.0", adult: true, signals: { demo: false, signedIn: true, k12: false } });
const refused7 = { k12: await rate7(K12_7), demo: await rate7(DEMO7), signedOut: await rate7(OUT7), stored: (await rstore.list()).length };
const kept7 = await rate7(ADULT6);
const pairs7 = await R6.rt6LocalPairs({ store: rstore, signals: ADULT6 });
const none7 = { k12: (await R6.rt6LocalPairs({ store: rstore, signals: K12_7 })).length, demo: (await R6.rt6LocalPairs({ store: rstore, signals: DEMO7 })).length, signedOut: (await R6.rt6LocalPairs({ store: rstore, signals: OUT7 })).length };
await dx.dxRevoke({ store: rstore });
const revoked7 = { pairs: (await R6.rt6LocalPairs({ store: rstore, signals: ADULT6 })).length, stored: (await rstore.list()).length };
check(notOpted7 === 0 && refused7.k12 + refused7.demo + refused7.signedOut + refused7.stored === 0 && kept7 === 2 && pairs7.length === 1 && pairs7[0].source === "human" && pairs7[0].station === rsc && pairs7[0].x.chosen.length === R6.RT6_TRAJ_FEATURES.length && none7.k12 + none7.demo + none7.signedOut === 0 && revoked7.pairs + revoked7.stored === 0,
  `robot-run ratings (two cloned runs of ${rsc}, thumbs up and down through agRate): kept before opt-in ${notOpted7}; opted in but K-12 ${refused7.k12}, demo ${refused7.demo}, signed-out ${refused7.signedOut}; an opted-in adult ${kept7} → rt6LocalPairs ${pairs7.length} pair (source human); K-12, demo and signed-out read ${none7.k12 + none7.demo + none7.signedOut}; after revoke ${revoked7.pairs} pairs, store ${revoked7.stored}`);
const rtsrc = readFileSync(join(SHARED, "rt-teleop.js"), "utf8"), bundle7 = readFileSync(join(ROOT, "tools/bundle_webxr.py"), "utf8");
check(/const on = dxCollecting\(signals\);/.test(rtsrc) && /b\.disabled = !on;/.test(rtsrc) && /await agRate\(\{ run, agent: `robot-clone:/.test(rtsrc) && bundle7.indexOf('SHARED / "ag-feedback.js"') > bundle7.indexOf('SHARED / "dx-data.js",\n            SHARED / "dx-consent-ui.js",\n            SHARED / "dx-world.js"') && bundle7.indexOf('SHARED / "ag-feedback.js"') < bundle7.indexOf('SHARED / "rt-teleop.js"'),
  "the teleop pad's \"Rate two robot runs\": its thumbs are enabled only while collecting and store only through agRate; ag-feedback.js is bundled after dx-data.js and before rt-teleop.js");

// 12 DAgger-style corrections on the hardest gap (ROBOTRAIN-6)
console.log("12 DAgger-style corrections on rb-amr-fleet-routing#hard (ROBOTRAIN-6; the labels are the scripted expert's, not a person's)");
const D6 = EV.dagger, V6 = EV.variants.find((v) => v.id === D6.scenario);
check(D6.rounds.length === 6 && D6.rounds.every((r) => r.n === 60) && D6.rounds[0].success === V6?.bcFiltered.success && /scripted expert/.test(D6.labels) && /not a person/.test(D6.labels),
  `${D6.scenario}: success per round on 60 held-out seeds ${D6.rounds.map((r) => r.success).join(" → ")} (round 0 is the filtered clone in variants; ${D6.rounds.at(-1).labelledStates} expert-labelled states from ${D6.rollouts} rollouts a round; expert ${V6?.expert.success})`);
check(D6.aliasing && D6.aliasing.ceiling > 0 && D6.aliasing.ceiling <= 1,
  `the clone's features against the expert's labels: ${D6.aliasing?.rows} labelled rows on ${D6.aliasing?.vectors} feature vectors; ${D6.aliasing?.ambiguousVectors} vectors carry more than one expert label (${D6.aliasing?.rowsOnAmbiguousVectors} rows); best agreement any policy over these features could reach: ${D6.aliasing?.ceiling}`);
const DP6 = D6.pathFeatures;
check(DP6?.featureSet === "amr-path" && DP6.rounds.length === 6 && DP6.rounds.every((r) => r.n === 60) && C.colF("rb-amr-fleet-routing", "amr-path").names.length === C.colF("rb-amr-fleet-routing").names.length + 4 && !("featureSet" in C.colTrain("rb-amr-fleet-routing", [], {})),
  `the same rounds with four route features (opt-in set amr-path; COLEARN's default unchanged): ${DP6?.rounds.map((r) => r.success).join(" → ")}; gap to the expert after round ${DP6?.rounds.length - 1}: ${(V6?.expert.success - DP6?.rounds.at(-1).success).toFixed(3)}; best agreement over these features ${DP6?.aliasing?.ceiling} (${DP6?.aliasing?.ambiguousVectors} of ${DP6?.aliasing?.vectors} vectors ambiguous)`);
const DR7 = D6.robotFeatures, AL7 = DP6?.aliasingOnTheseStates?.["amr-robots"];
check(DR7?.featureSet === "amr-robots" && DR7.rounds.length === 6 && DR7.rounds.every((r) => r.n === 60) && AL7?.rows === DP6?.aliasing?.rows && C.colF("rb-amr-fleet-routing", "amr-robots").names.length === C.colF("rb-amr-fleet-routing", "amr-path").names.length + 6 && C.colF("rb-amr-fleet-routing").names.length === 9,
  `the other robots in view (opt-in set amr-robots: who holds the route's next cell and its move order, a way around the robots): the aliasing ceiling first, on the amr-path rounds' ${AL7?.rows} labelled training rows, ${DP6?.aliasing?.ceiling} → ${AL7?.ceiling} (${AL7?.ambiguousVectors} of ${AL7?.vectors} vectors ambiguous); then the declared 5 rounds, once: ${DR7?.rounds.map((r) => r.success).join(" → ")}; AMR hard gap after round ${DR7?.rounds.length - 1}: ${(V6?.expert.success - DR7?.rounds.at(-1).success).toFixed(3)} (0.583 with amr-path)`);
const src7 = readFileSync(join(SHARED, "rt7-learn.js"), "utf8");
check(!/\bfetch\s*\(|XMLHttpRequest|sendBeacon|WebSocket|EventSource|https?:\/\//.test(src7) && !MODEL_ID.test(src7) && /PER-STEP REWARD/.test(src7) && /SYNTHETIC WINDOW RATER/.test(src7) && /NON-PRIVILEGED REACTIVE AGENT/.test(src7) && !/import\s*\{[^}]*\bas\b/.test(src7),
  "rt7-learn.js: no network, no model identifier, no import alias; it names each piece for what it is (a per-step reward, a synthetic window rater, a reactive agent)");
const src6 = readFileSync(join(SHARED, "rt6-learn.js"), "utf8");
check(!/\bfetch\s*\(|XMLHttpRequest|sendBeacon|WebSocket|EventSource|https?:\/\//.test(src6) && !MODEL_ID.test(src6) && /BRADLEY–TERRY/.test(src6) && /DAGGER/.test(src6) && /SCRIPTED EXPERT/.test(src6) && /SYNTHETIC RATER/.test(src6) && !/import\s*\{[^}]*\bas\b/.test(src6),
  "rt6-learn.js: no network, no model identifier, no import alias; it names each piece for what it is (a Bradley–Terry model, DAgger rounds, the scripted expert's labels, a synthetic rater)");

console.log(`\ncheck_colearn: ${passes} passed, ${failures} failed`);
process.exit(failures ? 1 : 0);
