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
const EV = colEvalAll();
for (const p of EV.policies) check(p.bcFiltered.success > p.random.success, `${p.scenario}: BC ${p.bcFiltered.success} > random ${p.random.success}; expert ${p.expert.success}; gap to expert ${p.gapToExpert}${p.bcFilteredShield ? `; BC + reservation shield ${p.bcFilteredShield.success}` : ""} (${p.demosKept}/${p.demosOffered} demos kept, ${p.rows} rows)`);
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

console.log(`\ncheck_colearn: ${passes} passed, ${failures} failed`);
process.exit(failures ? 1 : 0);
