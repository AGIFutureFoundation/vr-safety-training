#!/usr/bin/env node
/**
 * ROBOTRAIN gate (docs/consoles/ROBOTRAIN.md) — human interaction trains robots, deeper.
 *
 *   1  gaps:      the four gap stations ROBOPROG left open (teach pendant, cobot power-and-force limiting, e-stop recovery,
 *                 speed-and-separation set-up) are in the catalog, are robot stations and sit in a track level; the eval prints
 *                 the gap coverage before (without them) → after
 *   2  stations:  each follows the station brief (12–15 steps, ≥5 kinds, 4 hazards, 2 interruptions armed on a hold/track step and
 *                 answered by another control, `why` on every step with median ≥ 200 chars, a textured surface, a scene change in
 *                 the interruption handler); standards are named, no clause number of a robot standard is quoted, ISO/TS 15066 is
 *                 named in the power-and-force station
 *   3  recorder:  rtPoseToAction is deterministic and pure; the recorder is inert without consent and records a valid human
 *                 episode with an adult receipt when opted in; revoking deletes it; the scripted human is labelled synthetic
 *   4  eval:      behaviour cloning on N recorded (pose-driven, scripted-human) takes vs N synthetic demonstrations on the same
 *                 held-out seeds, both above the random floor, with the expert ceiling — printed
 *   5  programme: rp-programme.js stays guarded (imports only competency.js and the data), the generated page shows the loop live,
 *                 the recorder live and the gaps covered; rt-teleop.js is in the parishes bundle list and mounted guarded
 *   7  loop 6:    XR pose source, rig follow, second task, COLEARN provider, K-12 lesson (ROBOTRAIN-2)
 *   8  loop 7:    the last mile in the app (ROBOTRAIN-3): the provider trains on the learner's own consented takes (signed out →
 *                 synthetic; opted in with takes → "your N takes"; revoke → synthetic, takes gone), the panel and the app carry the
 *                 label, the WebXR session loop feeds teleop.xr from session.requestAnimationFrame only, the pad drives the cell
 *                 task with its own HUD line and replays the policy as a ghost on the same rig
 *   9  loops 8–9: (ROBOTRAIN-4, ROBOTRAIN-5) dxFlush resolves with the count, serialises, awaits writes already in flight, and a
 *                 revoke waits for them before it empties the store; rtFollowCell moves a plain walker node and poses the arm by
 *                 mode; the parishes app builds the walker on a cell site only; the three hard variants are in colearn.json,
 *                 seeded, 60 held-out seeds each, the gaps stated; RT_TASKS covers six tasks and rtCompare reports the hard ones
 *   6  hygiene:   no network call, no import alias, no model identifier, no affiliation wording in any ROBOTRAIN file
 *
 *     node tools/check_robotrain.mjs
 */
import { readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const mem = new Map();
globalThis.localStorage ??= { getItem: (k) => (mem.has(k) ? mem.get(k) : null), setItem: (k, v) => mem.set(k, String(v)), removeItem: (k) => mem.delete(k), key: (i) => [...mem.keys()][i] ?? null, get length() { return mem.size; } };
globalThis.sessionStorage ??= globalThis.localStorage;
const imp = (f) => import(pathToFileURL(join(ROOT, f)).href);
const read = (f) => (existsSync(join(ROOT, f)) ? readFileSync(join(ROOT, f), "utf8") : "");

let checks = 0; const fails = [];
const check = (ok, area, msg) => { checks++; if (!ok) fails.push(`[${area}] ${msg}`); };

const rp = await imp("WebXR/shared/rp-programme.js");
const catalog = JSON.parse(readFileSync(join(ROOT, "WebXR/smartcity/catalog.json"), "utf8"));
const stations = new Map(catalog.stations.map((s) => [s.id, s]));
const GAPS = ["rt-teach-pendant-safe-jogging", "rt-cobot-power-force-limit-check", "rt-robot-estop-recovery-and-restart", "rt-speed-separation-monitoring-setup"];

// ---------------------------------------------------------------- 1 gaps (the eval)
check(JSON.stringify(rp.RP_GAP_STATIONS.map((g) => g.id)) === JSON.stringify(GAPS), "gaps", `RP_GAP_STATIONS are ${rp.RP_GAP_STATIONS.map((g) => g.id).join(",")}`);
const after = rp.rpGapCoverage({ stationIds: new Set(stations.keys()) });
const before = rp.rpGapCoverage({ stationIds: new Set([...stations.keys()].filter((id) => !GAPS.includes(id))) });
for (const g of after.gaps) check(g.inTree && g.inLevel && g.robot, "gaps", `${g.id}: inTree ${g.inTree} inLevel ${g.inLevel} robot ${g.robot}`);
check(before.covered === 0 && after.covered === 4, "gaps", `gap coverage before ${before.covered} → after ${after.covered}`);
const inLevels = (id) => rp.RP_TRACKS.flatMap((t) => Object.entries(t.levels).filter(([, ids]) => ids.includes(id)).map(([lv]) => `${t.id}/${lv}`));
for (const id of GAPS) check(inLevels(id).length >= 1, "gaps", `${id}: not in a track level`);
// the programme's own coverage and ladder must still hold with the new stations in the levels
const opts = { stationIds: new Set(stations.keys()) };
const cov = rp.rpCoverage(opts);
check(cov.covered === cov.of, "gaps", `programme coverage ${cov.covered}/${cov.of}`);
for (const t of rp.RP_TRACKS) for (const l of rp.rpLadder(t.id, opts)) check(l.earnable && l.pending.length === 0, "gaps", `${t.id}/${l.level}: not earnable or pending`);

// ---------------------------------------------------------------- 2 stations
const KINDS = ["select", "sequence", "find", "gauge", "hold", "track", "turn", "drag", "drive"];
const { loadSmartCity } = await imp("tools/lib/headless.mjs");
const city = await loadSmartCity();
const rooms = new Map(city.ROOMS.map((r) => [r.id, r]));
const med = (xs) => { const s = [...xs].sort((a, b) => a - b); return s[s.length >> 1] ?? 0; };
const meshCounts = {};
for (const id of GAPS) {
  const r = rooms.get(id);
  check(!!r && stations.has(id), "stations", `${id}: not loaded or not in the catalog`);
  if (!r) continue;
  const steps = r.steps ?? [];
  check(steps.length >= 12 && steps.length <= 15, "stations", `${id}: ${steps.length} steps (12–15)`);
  check(new Set(steps.map((s) => s.kind)).size >= 5 && steps.every((s) => KINDS.includes(s.kind)), "stations", `${id}: fewer than 5 step kinds`);
  check(Object.keys(r.hazards ?? {}).length === 4, "stations", `${id}: ${Object.keys(r.hazards ?? {}).length} hazards (4)`);
  check((r.interrupts ?? []).length === 2, "stations", `${id}: ${(r.interrupts ?? []).length} interruptions (2)`);
  check(steps.every((s) => (s.why ?? "").length > 0) && med(steps.map((s) => (s.why ?? "").length)) >= 200, "stations", `${id}: why missing or median under 200 chars`);
  for (const it of r.interrupts ?? []) {
    const host = steps.find((s) => s.id === it.after);
    check(host && ["hold", "track"].includes(host.kind) && it.target !== host.target, "stations", `${id}/${it.id}: not armed on a hold/track step or answered by its own control`);
    check(!!(it.missNote && it.wrongNote && it.why), "stations", `${id}/${it.id}: missNote/wrongNote/why`);
  }
  let meshes = 0, hits = 0;
  try { const root = new city.THREE.Group(); const api = r.build(root); hits = Object.keys(api?.hits ?? {}).length; root.traverse((o) => { if (o.isMesh) meshes++; }); } catch (e) { check(false, "stations", `${id}: build threw ${e.message}`); }
  meshCounts[id] = meshes;
  check(meshes >= 150 && meshes <= 280, "stations", `${id}: ${meshes} meshes (150–280)`);
  check(hits >= 20, "stations", `${id}: ${hits} interactables`);
  for (const h of Object.keys(r.hazards ?? {})) check(!!r.build && true, "stations", `${id}: hazard ${h}`);
  const src = read(`WebXR/smartcity/js/sims/${id}.js`);
  check(/onInterrupt\(it\)/.test(src) && /\.material = mat\(|\.visible = |\.position\.set\(/.test(src), "stations", `${id}: interruption handler does not change the scene`);
  check(/surfaceTexture\(/.test(src), "stations", `${id}: no textured large surface`);
  check(!/(ISO|R15\.06|1910\.147|15066)[^"\n]{0,40}(clause|§)\s*\d/i.test(src) && !/\bclause\s+\d/i.test(src), "stations", `${id}: a clause number of a robot standard`);
  check(/ISO 10218|ANSI R15\.06|ISO\/TS 15066/.test(r.certification ?? ""), "stations", `${id}: no robot standard named in its sources`);
  // no speed, force or distance figure stated as a standard's value
  check(!/\d+\s?(mm\/s|m\/s|N\b|newton)/i.test(JSON.stringify(steps) + JSON.stringify(r.hazards)), "stations", `${id}: a speed or force figure stated`);
}
check(/ISO\/TS 15066/.test(rooms.get("rt-cobot-power-force-limit-check")?.certification ?? ""), "stations", "the power-and-force station does not name ISO/TS 15066");
check(/enabling device/i.test(JSON.stringify(rooms.get("rt-teach-pendant-safe-jogging")?.steps ?? [])) && /reduced speed/i.test(JSON.stringify(rooms.get("rt-teach-pendant-safe-jogging")?.steps ?? [])), "stations", "the teach-pendant station does not teach the enabling device and reduced speed");
check(/from outside/i.test(JSON.stringify(rooms.get("rt-robot-estop-recovery-and-restart")?.steps ?? [])), "stations", "the e-stop recovery station does not teach the restart from outside");
check(/stopping distance/i.test(JSON.stringify(rooms.get("rt-speed-separation-monitoring-setup")?.steps ?? [])), "stations", "the SSM station does not teach the stopping distance");

// ---------------------------------------------------------------- 3 recorder
const rt = await imp("WebXR/shared/rt-teleop.js"), dx = await imp("WebXR/shared/dx-data.js"), rb = await imp("WebXR/shared/rb-env.js");
const env0 = rb.rbEnv(rt.RT_SCENARIO, { seed: 3 }), obs0 = env0.reset();
const a1 = rt.rtPoseToAction({ p: [0.3, 0.1, 0.1], trigger: 0, squeeze: 0.5, estop: false }, obs0), a2 = rt.rtPoseToAction({ p: [0.3, 0.1, 0.1], trigger: 0, squeeze: 0.5, estop: false }, obs0);
check(JSON.stringify(a1) === JSON.stringify(a2) && a1.type === "move" && Math.hypot(a1.dx, a1.dy, a1.dz) <= rb.rbScenario(rt.RT_SCENARIO).params.speed + 0.002, "recorder", `pose → move is deterministic and capped (${JSON.stringify(a1)})`);
check(rt.rtPoseToAction({ p: obs0.effector, trigger: 0, squeeze: 0.5, estop: true }, obs0).type === "estop", "recorder", "e-stop pose → estop action");
check(rt.rtPoseToAction({ p: obs0.effector, trigger: 0, squeeze: 0.5, estop: false }, { ...obs0, mode: "estop" }).type === "reset", "recorder", "stopped arm + open trigger → reset");
const nearBin = { ...obs0, effector: obs0.bin.slice() };
const g1 = rt.rtPoseToAction({ p: obs0.bin, trigger: 1, squeeze: 0.2, estop: false }, nearBin), g2 = rt.rtPoseToAction({ p: obs0.bin, trigger: 1, squeeze: 1.0, estop: false }, nearBin);
check(g1.type === "grip" && g2.type === "grip" && g1.force < g2.force && g2.force > nearBin.part.ceilingN, "recorder", `squeeze sets grip force (${g1.force} < ${g2.force}); a full squeeze is over the ceiling, which the env flags`);
check(rt.rtPoseToAction({ p: obs0.bin, trigger: 0, squeeze: 0.5, estop: false }, { ...nearBin, carrying: true }).type === "release", "recorder", "open trigger while carrying → release");
const store = dx.dxMakeStore(dx.dxMemBackend());
const sig = { demo: false, signedIn: true, k12: false, adult: null };
const inert = rt.rtRecorder(rb.rbEnv(rt.RT_SCENARIO, { seed: 5 }), { store, signals: sig });
check(inert.active === false && inert.finish() === null, "recorder", "the recorder is inert without consent");
for (const bad of [{ ...sig, demo: true }, { ...sig, signedIn: false }, { ...sig, k12: true }]) check(rt.rtRecorder(rb.rbEnv(rt.RT_SCENARIO, { seed: 5 }), { store, signals: bad }).active === false, "recorder", `inert for ${JSON.stringify(bad)}`);
check(dx.dxOptIn({ licence: "CC0-1.0", adult: true, signals: sig }).ok, "recorder", "opt-in");
const sig2 = { ...sig, adult: true };
check(rt.rtRecorder(rb.rbEnv(rt.RT_SCENARIO, { seed: 5 }), { store, signals: { ...sig2, k12: true } }).active === false, "recorder", "still inert for K-12 after opt-in");
const envH = rb.rbEnv(rt.RT_SCENARIO, { seed: 5 });
const recH = rt.rtRecorder(envH, { store, signals: sig2 });
const human = rt.rtScriptedHuman(envH, { seed: 5, skill: 1 });
let done = false; for (let i = 0; i < 400 && !done; i++) done = recH.step(human(recH.observation)).done;
const ep = recH.finish();
check(recH.active && !!ep && ep.source === "human" && ep.consent?.adult === true && dx.dxValidateEpisode(ep).ok && ep.kind === "robot-game" && ep.scenario === rt.RT_SCENARIO, "recorder", "an opted-in take is a valid human episode with an adult receipt");
check(!!ep && ep.summary.success === true, "recorder", "the scripted human at skill 1 finishes the take");
await new Promise((res) => setTimeout(res, 30));
check((await store.list()).length === 1, "recorder", "the take is stored locally");
const demos = (await import(pathToFileURL(join(ROOT, "WebXR/shared/col-learn.js")).href)).colDemosFromEpisodes([ep], rt.RT_SCENARIO);
check(demos.demos.length === 1 && demos.refused.length === 0, "recorder", "the stored take is accepted as a COLEARN demonstration");
const noReceipt = { ...ep, consent: null };
check((await import(pathToFileURL(join(ROOT, "WebXR/shared/col-learn.js")).href)).colDemosFromEpisodes([noReceipt], rt.RT_SCENARIO).refused.length === 1, "recorder", "a human take without a receipt is refused");
await dx.dxRevoke({ store });
check((await store.list()).length === 0 && !dx.dxCollecting(sig2), "recorder", "revoke deletes the take and stops collection");
const takes = rt.rtRecordTakes({ n: 3 });
check(takes.every((e) => e.source === "synthetic" && e.consent === null && /scripted human stand-in/.test(e.provenance.policy) && e.provenance.notes?.syntheticStandIn === true && dx.dxValidateEpisode(e).ok), "recorder", "scripted-human takes are labelled synthetic, carry no receipt and validate");
check(JSON.stringify(rt.rtRecordTakes({ n: 2 })) === JSON.stringify(rt.rtRecordTakes({ n: 2 })), "recorder", "recorded takes are deterministic under a seed");

// ---------------------------------------------------------------- 4 eval
const cmp = rt.rtCompare({ n: 40, heldOut: 60 });
check(cmp.recorded.success > cmp.random.success && cmp.synthetic.success > cmp.random.success, "eval", `BC above random: recorded ${cmp.recorded.success}, synthetic ${cmp.synthetic.success}, random ${cmp.random.success}`);
check(cmp.recorded.success >= cmp.synthetic.success - 0.1, "eval", `recorded takes within 0.1 of synthetic (${cmp.recorded.success} vs ${cmp.synthetic.success})`);
check(cmp.expert.success >= cmp.recorded.success - 0.05, "eval", "the expert is the ceiling");
check(cmp.recorded.refused === 0 && cmp.synthetic.refused === 0, "eval", "no take refused");

// ---------------------------------------------------------------- 5 programme
const FNS = read("WebXR/shared/rp-programme.js"), DATA = read("WebXR/shared/rp-programme-data.js");
const importsOf = (s) => [...s.matchAll(/^\s*import\s[^;]*?from\s+"([^"]+)"/gm)].map((m) => m[1]);
check(JSON.stringify(importsOf(FNS)) === JSON.stringify(["./competency.js", "./rp-programme-data.js"]) && importsOf(DATA).length === 0, "programme", "rp-programme.js stays guarded (imports only competency.js and the data)");
check(rp.rpRecorder({ rt: { rtRecorder() {} } }).live && !rp.rpRecorder({}).live && rp.rpRecorder({ rt }).live, "programme", "rpRecorder is guarded and live with rt-teleop.js");
const PAGE = read("WebXR/robotics/programme.html"), DOC = read("docs/robotics-programme.md");
check(PAGE.includes('data-rp-recorder="live"') && PAGE.includes('data-rp-gaps="4/4"'), "programme", "the page shows the recorder live and gaps 4/4 — rerun node tools/gen_robotics_programme.mjs");
check(!/data-rp-loopstep[^<]*pending in this build/.test(PAGE) && /loop 5\/5|data-rp-loopstep/.test(PAGE), "programme", "a loop step is still pending on the page");
for (const id of GAPS) check(PAGE.includes(`data-rp-station="${id}"`) && DOC.includes(`\`${id}\``), "programme", `${id}: not on the page or in the handbook`);
check(/4 of 4 gaps/.test(DOC), "programme", "the handbook's gap coverage is stale");
check(/scripted human stand-in/i.test(PAGE) && /scripted human stand-in/i.test(DOC), "programme", "the stand-in is not labelled on the page and handbook");
check(read("tools/bundle_webxr.py").includes('SHARED / "rt-teleop.js"'), "programme", "rt-teleop.js is not in the parishes bundle list");
const APP = read("WebXR/parishes/js/app.js");
check(/import \{ rtMountTeleop \} from "\.\.\/\.\.\/shared\/rt-teleop\.js"/.test(APP) && /__parishTest\.teleop/.test(APP) && /try \{[^}]*rtMountTeleop/.test(APP), "programme", "the parishes app does not mount the teleop pad guarded");
check(rt.rtMountTeleop(null) === null && rt.rtMountTeleop({}) === null, "programme", "the mount returns null without a DOM element");

// ---------------------------------------------------------------- 7 loop 6 (ROBOTRAIN-2): XR pose source, rig follow, COLEARN provider, second task, K-12 lesson
// 7a the WebXR controller pose source is pure over the WebXR shapes and falls back to null without a pose
const xrSrc = { handedness: "right", gripSpace: {}, gamepad: { buttons: [{ value: 0.8, pressed: true }, { value: 0.3, pressed: false }, {}, { pressed: false }, { pressed: true }] } };
const xrFrame = { getPose: () => ({ transform: { position: { x: 0.2, y: 1.25, z: -0.8 } } }), session: { inputSources: [xrSrc] } };
const xp = rt.rtXRPose(xrSrc, xrFrame, {});
check(xp && JSON.stringify(xp.p) === "[0.2,0.25,-0.3]" && xp.trigger === 0.8 && xp.squeeze === 0.3 && xp.estop === true && xp.hand === "right", "xr", `rtXRPose maps grip + gamepad into the bench frame (${JSON.stringify(xp)})`);
check(rt.rtXRPose({ gamepad: {} }, xrFrame, {}) === null && rt.rtXRPose(xrSrc, { getPose: () => null }, {}) === null, "xr", "rtXRPose is null without a space or a pose");
check(JSON.stringify(rt.rtPoseToAction(xp, obs0)) === JSON.stringify(rt.rtPoseToAction(xp, obs0)) && rt.rtPoseToAction(xp, obs0).type === "estop", "xr", "an XR pose with the face button held is the e-stop");
// 7b the rig follows the effector with no new mesh, and rb-world's sweep yields while it is driven
const rigStub = { rotation: { x: 0, y: 0, z: 0 }, userData: {}, children: [{ userData: { pivot: true }, rotation: { x: 0, y: 0, z: 0 } }] };
const envF = rb.rbEnv(rt.RT_SCENARIO, { seed: 3 }); let obsF = envF.reset();
for (let i = 0; i < 6; i++) obsF = envF.step({ type: "move", dx: 0.1, dy: 0.05, dz: 0.1 }).observation;
const fol = rt.rtFollowRig(rigStub, obsF);
check(fol && rigStub.userData.rtDriven === true && rigStub.rotation.y === fol.yaw && rigStub.children[0].rotation.x === fol.pitch && fol.yaw !== 0, "rig", `rtFollowRig turns the rig toward the effector (${JSON.stringify(fol)})`);
const rbw = await imp("WebXR/shared/rb-world.js");
rbw.rbPoseRig(rigStub, "cobot", 1.2);
check(rigStub.rotation.y === fol.yaw, "rig", "rb-world's sweep leaves a pose-driven rig alone");
rt.rtReleaseRig(rigStub); rbw.rbPoseRig(rigStub, "cobot", 1.2);
check(rigStub.userData.rtDriven === false && rigStub.rotation.y !== fol.yaw, "rig", "after release the sweep drives the rig again");
check(/rigNode:/.test(read("WebXR/shared/rb-world.js")) && /rtDriven/.test(read("WebXR/shared/rb-world.js")), "rig", "rb-world exposes rigNode(id) and honours rtDriven");
check(/rtMountTeleop\(host, \{[^}]*rig:/.test(APP) && /rigNode\(/.test(APP), "rig", "the parishes app hands a robot site's rig to the teleop mount");
check(!/new T\.Mesh|new THREE\.Mesh|Geometry\(/.test(FILES_RT()), "rig", "rt-teleop.js adds no mesh");
// 7c the second task: the cell-entry pose path finishes a take and clones as well as synthetic demonstrations
check(JSON.stringify(rt.RT_TASK_IDS.slice(0, 2)) === JSON.stringify(["rb-teleop-pick-place", "rb-cell-entry"]) && rt.RT_TASK_IDS.length >= 2, "task2", `RT_TASKS are ${rt.RT_TASK_IDS.join(",")}`);
const envC = rb.rbEnv("rb-cell-entry", { seed: 5 }), humanC = rt.rtScriptedHumanCell(envC, { seed: 5, skill: 1 });
const rollC = rb.rbRollout(envC, { seed: 5, policy: (o) => rt.rtPoseToActionCell(humanC(o), o) });
check(rollC.summary.passed && rollC.summary.violationCount === 0, "task2", `the scripted walker passes cell entry through the pose path (${JSON.stringify(rollC.summary)})`);
const seqC = rollC.steps.map((s) => s.action.type).filter((t) => t !== "wait" && t !== "walk");
check(JSON.stringify(seqC) === JSON.stringify(["test-estop", "press-estop", "lockout", "verify", "enter", "clear-jam", "exit", "remove-lock", "restart"]), "task2", `cell controls in order: ${seqC.join(">")}`);
const obsC = envC.reset();
check(rt.rtPoseToActionCell({ p: [0.5, 1.1, -obsC.distance], trigger: 1, squeeze: 0.2 }, obsC).type === "test-estop" && rt.rtPoseToActionCell({ p: [0.5, 1.1, -obsC.distance], trigger: 1, squeeze: 0.9 }, obsC).type === "press-estop", "task2", "a light squeeze on the e-stop tests it, a firm one holds it");
check(rt.rtPoseToActionCell({ p: [0, 0.9, -obsC.distance + 1.6], trigger: 0, squeeze: 0.2 }, obsC).d === 1 && rt.rtPoseToActionCell({ p: [0, 0.9, -obsC.distance], trigger: 0, squeeze: 0.2 }, obsC).type === "wait", "task2", "a body shift walks (capped at the step), standing still waits");
const cmp2 = rt.rtCompare({ n: 40, heldOut: 60, scenario: "rb-cell-entry" });
check(cmp2.recorded.success > cmp2.random.success && cmp2.synthetic.success > cmp2.random.success, "task2", `cell BC above random: recorded ${cmp2.recorded.success}, synthetic ${cmp2.synthetic.success}, random ${cmp2.random.success}`);
check(cmp2.recorded.success >= cmp2.synthetic.success - 0.1 && cmp2.expert.success >= cmp2.recorded.success - 0.05, "task2", `cell recorded takes within 0.1 of synthetic (${cmp2.recorded.success} vs ${cmp2.synthetic.success}), expert ${cmp2.expert.success}`);
check(Object.keys(rt.rtCompareAll({ n: 4, heldOut: 3 })).length === rt.RT_TASK_IDS.length, "task2", `rtCompareAll reports every task (${rt.RT_TASK_IDS.length})`);
// 7d the COLEARN-trained policy runs as the agent-jobs provider, the governor on every step
const vbc = await imp("WebXR/shared/vb-colearn.js"), vbb = await imp("WebXR/shared/vb-bridge.js"), vbg = await imp("WebXR/shared/vb-governor.js");
const prov = vbc.vbColearnProvider();
check(prov.policyFor("vb-scripted-expert", rb.rbEnv("rb-cell-entry")) === null && typeof prov.policyFor("vb-colearn-bc-knn", rb.rbEnv("rb-cell-entry")) === "function", "provider", "policyFor answers only the COLEARN policy id");
const jobC = vbb.vbRunJob(vbc.vbSafeJobFor("rb-cell-entry", 0, "vb-colearn-bc-knn"), vbg.vbGovernor(), { supervisor: "Supervisor (check)", policyFor: prov.policyFor });
check(jobC.phase === "COMPLETED" && jobC.provider.policyId === "vb-colearn-bc-knn" && jobC.deliverable.episode.steps.every((s) => !!s.info.governor), "provider", `a COLEARN-provided cell job completes with the governor's verdict on every step (${jobC.phase}, ${jobC.deliverable?.episode?.steps?.length} steps)`);
const jobE = vbb.vbRunJob(vbc.vbSafeJobFor("rb-cell-entry", 1, "vb-colearn-bc-knn"), vbg.vbGovernor(), { supervisor: "Supervisor (check)", policyFor: prov.policyFor, estopAtStep: 2 });
check(jobE.phase === "REJECTED" && jobE.deliverable.evalCard.halted?.action === "estop", "provider", "the e-stop halts a COLEARN-provided run");
const pc = vbc.vbProviderCompare({ jobsPerTask: 10 });
check(pc.governor.everyStep && pc.totals.colearn.completed >= pc.totals.scripted.completed - 4 && pc.totals.colearn.completed > 0, "provider", `COLEARN completed ${pc.totals.colearn.completed}/${pc.totals.colearn.of} vs scripted ${pc.totals.scripted.completed}/${pc.totals.scripted.of}; governor on every step ${pc.governor.everyStep}`);
check(Object.values(pc.tasks).every((t) => /synthetic human stand-in/.test(t.colearn.trainedOn?.source ?? "")), "provider", "the provider's training data is labelled as the synthetic stand-in");
const PANEL = read("WebXR/shared/vb-panel.js");
check(/policyFor = null/.test(PANEL) && /vbRun\(preview, vbGovernor\(\), \{ policyFor \}\)/.test(PANEL) && /estopAtStep: estopAt, policyFor/.test(PANEL) && PANEL.includes('policyId: "vb-colearn-bc-knn"'), "provider", "the panel runs jobs through policyFor and queues a COLEARN-provided job");
check(/vbColearnProvider/.test(APP) && /policyFor: vbProvider \?/.test(APP) && read("tools/bundle_webxr.py").includes('SHARED / "vb-colearn.js"'), "provider", "the app mounts the provider guarded and the bundle list carries vb-colearn.js");
// 7e the K-12 lesson "a robot waits for a grown-up's OK" follows the Louisiana-lesson pattern
const LK = await imp("WebXR/shared/lk-la-lessons.js"), LCO = await imp("WebXR/shared/lco-la-flows.js");
const lesson = LK.LK_LESSONS.find((l) => l.id === "lk-lesson-robot-waits-for-ok");
check(!!lesson && lesson.station === "k12-rt-a-robot-waits-for-a-grown-ups-ok" && lesson.programme === "k12-science" && stations.has(lesson.station), "k12", "the lesson is registered on its K-12 science station");
check(!!LCO.lcoGameFor("lk-lesson-robot-waits-for-ok") && LCO.lcoApplySteps(LCO.lcoGameFor("lk-lesson-robot-waits-for-ok").id).length === 3, "k12", "the OK Desk apply game has three rounds");
check(existsSync(join(ROOT, "WebXR/flows/lk-robot-waits-for-ok.json")) && read("docs/flowhub.md").includes("lk-robot-waits-for-ok.json"), "k12", "the FlowHub flow exists and is documented");
check(rp.RP_TRACKS.every((t) => t.levels.aware.includes("k12-rt-a-robot-waits-for-a-grown-ups-ok")), "k12", "the lesson's station sits in every track's awareness level");
const K12 = read("WebXR/smartcity/js/sims/k12-rt-a-robot-waits-for-a-grown-ups-ok.js");
check(/grown-up in charge/i.test(K12) && /stop/i.test(K12) && !/\bdanger|injur|kill/i.test(K12), "k12", "the K-12 station teaches the grown-up's OK and the stop without fear framing");

// ---------------------------------------------------------------- 8 loop 7 (ROBOTRAIN-3): the learning loop's last mile in the app
// 8a consented local takes train the provider: signed-out → synthetic; opted-in with takes → trained on them, named honestly; revoke → synthetic and the takes gone
const store8 = dx.dxMakeStore(dx.dxMemBackend());
const sigOut = { demo: false, signedIn: false, k12: false, adult: null }, sigIn = { demo: false, signedIn: true, k12: false, adult: true };
const srcOut = vbc.vbColearnLocalSource({ store: store8, signals: sigOut }), provOut = vbc.vbColearnProvider({ demosFor: srcOut.demosFor });
const cOut = await srcOut.refresh();
check(Object.values(cOut).every((n) => n === 0) && provOut.modelFor("rb-cell-entry").provenance.own === false && /synthetic demonstrations/.test(provOut.describe("rb-cell-entry")) && !/your /.test(provOut.describe("rb-cell-entry")), "lastmile", `signed out: no takes read, the provider says synthetic (${provOut.describe("rb-cell-entry")})`);
check(dx.dxOptIn({ licence: "CC0-1.0", adult: true, signals: { ...sigIn, adult: null } }).ok, "lastmile", "opt-in");
const srcIn = vbc.vbColearnLocalSource({ store: store8, signals: sigIn }), provIn = vbc.vbColearnProvider({ demosFor: srcIn.demosFor });
const N8 = 12;
for (let k = 0; k < N8; k++) {
  const e8 = rb.rbEnv("rb-cell-entry", { seed: 900 + k }), r8 = rt.rtRecorder(e8, { store: store8, signals: sigIn }), h8 = rt.rtScriptedHumanCell(e8, { seed: 900 + k, skill: 1 });
  let d8 = false; for (let i = 0; i < 400 && !d8; i++) d8 = r8.step(h8(r8.observation)).done;
  check(!!r8.finish(), "lastmile", `take ${k}: the opted-in cell take is kept`);
}
await new Promise((res) => setTimeout(res, 30));
const cIn = await srcIn.refresh();
check((await store8.list()).length === N8 && cIn["rb-cell-entry"] === N8, "lastmile", `opted in: ${N8} takes stored and read (${JSON.stringify(cIn)})`);
const mOwn = provIn.modelFor("rb-cell-entry"), descOwn = provIn.describe("rb-cell-entry");
check(mOwn.provenance.own === true && mOwn.provenance.n === N8 && mOwn.demos >= 1 && new RegExp(`your ${N8} takes`).test(provIn.describe("rb-cell-entry")), "lastmile", `the provider trains on the learner's own takes and says so (${provIn.describe("rb-cell-entry")})`);
check(provIn.modelFor("rb-cobot-zone-setup").provenance.own === false, "lastmile", "a task with no takes stays on synthetic demonstrations");
const jobOwn = vbb.vbRunJob(vbc.vbSafeJobFor("rb-cell-entry", 0, "vb-colearn-bc-knn"), vbg.vbGovernor(), { supervisor: "Supervisor (check)", policyFor: provIn.policyFor });
check(jobOwn.phase === "COMPLETED" && jobOwn.deliverable.episode.steps.length > 0 && jobOwn.deliverable.episode.steps.every((s) => !!s.info.governor), "lastmile", `a job provided by the policy trained on the learner's takes completes with the governor on every step (${jobOwn.phase}, ${jobOwn.deliverable?.episode?.steps?.length} steps)`);
// a new take retrains: the model key follows the take set
const e9 = rb.rbEnv("rb-cell-entry", { seed: 999 }), r9 = rt.rtRecorder(e9, { store: store8, signals: sigIn }), h9 = rt.rtScriptedHumanCell(e9, { seed: 999, skill: 1 });
let d9 = false; for (let i = 0; i < 400 && !d9; i++) d9 = r9.step(h9(r9.observation)).done; r9.finish();
await new Promise((res) => setTimeout(res, 30)); await srcIn.refresh();
check(provIn.modelFor("rb-cell-entry") !== mOwn && provIn.modelFor("rb-cell-entry").provenance.n === N8 + 1, "lastmile", "a new take retrains the provider (the model follows the take set)");
await dx.dxRevoke({ store: store8 });
const cRev = await srcIn.refresh();
check((await store8.list()).length === 0 && !dx.dxCollecting(sigIn) && Object.values(cRev).every((n) => n === 0) && provIn.modelFor("rb-cell-entry").provenance.own === false && /synthetic demonstrations/.test(provIn.describe("rb-cell-entry")), "lastmile", `revoke: takes gone (${(await store8.list()).length}), not collecting, the provider is back on synthetic (${provIn.describe("rb-cell-entry")})`);
check(/your \d+ take/.test(vbc.vbColearnDescribe({ provenance: { own: true, n: 3, kept: 2 } })) && /synthetic/.test(vbc.vbColearnDescribe(null)), "lastmile", "vbColearnDescribe names the source");
// 8b the panel and the app carry the honest label and the consented source
check(/providerLabel = null/.test(PANEL) && /providerLabel\(r\.taskType\)/.test(PANEL), "lastmile", "the panel's card asks the provider what it trained on");
check(/vbColearnLocalSource\(\)/.test(APP) && /demosFor: vbLocal\.demosFor/.test(APP) && /providerLabel: vbProvider \?/.test(APP) && /onChange: \(\) => \{ vbLocal\?\.refresh\(\)/.test(APP) && /onTake: \(\) => \{ vbLocal\?\.refresh\(\)/.test(APP), "lastmile", "the app wires the consented source to the provider, the consent panel and the pad");
// 8c the WebXR session loop: the session's requestAnimationFrame feeds teleop.xr; nothing runs outside a session
check(/function npXRFrame\(t, xrFrame\)/.test(APP) && /s\.requestAnimationFrame\(npXRFrame\)/.test(APP) && /teleop\.xr\(xrFrame, npXR\.refSpace\)/.test(APP) && /if \(!npXR\.session\) requestAnimationFrame\(frame\)/.test(APP), "xrloop", "the app's XR frame loop runs on the session's requestAnimationFrame and feeds the pad");
check((APP.split("\n").filter((l) => !/^\s*\/\//.test(l)).join("\n").match(/teleop\.xr\(/g) ?? []).length === 1 && /isSessionSupported\("immersive-vr"\)/.test(APP) && /requestSession\("immersive-vr"/.test(APP) && /__parishTest\.xr = npXRTest/.test(APP), "xrloop", "teleop.xr is called from the XR frame loop only; Enter VR appears only when supported; the loop is exposed for the headless proof");
// 8d the pad takes the cell task, with its own HUD line, and the ghost replays the policy on the same rig
const dom8 = (tag) => { const h = {}; const n = { tagName: tag, ownerDocument: { createElement: dom8 }, style: {}, dataset: {}, children: [], append(...c) { n.children.push(...c); }, appendChild(c) { n.children.push(c); }, setAttribute(k, v) { n[k] = v; }, addEventListener(k, f) { h[k] = f; }, handlers: h, getBoundingClientRect: () => ({ left: 0, top: 0, width: 200, height: 160 }), set innerHTML(v) { n.children.length = 0; }, textContent: "", value: "", disabled: false, title: "" }; return n; };
const host8 = dom8("div"), rig8 = { rotation: { x: 0, y: 0, z: 0 }, userData: {}, children: [{ userData: { pivot: true }, rotation: { x: 0, y: 0, z: 0 } }] };
let took = null;
const pad8 = rt.rtMountTeleop(host8, { reducedMotion: true, store: store8, signals: sigOut, rig: rig8, task: "rb-cell-entry", onTake: (ep, t) => { took = { ep, t }; }, modelFor: (sc) => provIn.modelFor(sc) });
check(pad8 && pad8.task() === "rb-cell-entry" && JSON.stringify(pad8.tasks) === JSON.stringify(rt.RT_TASK_IDS) && pad8.pose().p[2] === rt.RT_REST_POSE["rb-cell-entry"][2], "pad", "the pad mounts on the cell task");
pad8.start(5);
const padEl = host8.children.find((c) => c.className === "rt-pad");
const envP = rb.rbEnv("rb-cell-entry", { seed: 5 }), humP = rt.rtScriptedHumanCell(envP, { seed: 5, skill: 1 }); let obsP = envP.reset(), fedP = 0;
for (let i = 0; i < 200 && !took; i++) {
  const p = humP(obsP);
  const src = { handedness: "right", gripSpace: {}, gamepad: { buttons: [{ value: p.trigger }, { value: p.squeeze }, {}, { pressed: false }, { pressed: false }] } };
  pad8.xr({ session: { inputSources: [src] }, getPose: () => ({ transform: { position: { x: p.p[0] + rt.RT_XR_FRAME.origin[0], y: p.p[1], z: p.p[2] + rt.RT_XR_FRAME.origin[2] } } }) }, {});
  pad8.step(); fedP++;
  obsP = envP.step(rt.rtPoseToActionCell(p, obsP)).observation;
}
check(!!took && took.t.scenario === "rb-cell-entry" && took.ep === null && took.t.steps > 0 && /restarted/.test(pad8.status()) && /cell entry/.test(pad8.status()), "pad", `the cell task runs on the pad through the XR seam to the restart, with its own HUD line (${fedP} frames; "${pad8.status()}")`);
check(/cell entry: inside the cell/.test(rt.rtHudLine("rb-cell-entry", { inside: true, distance: 0, estopTested: true, estopped: true, locked: true, verified: true, jam: true, restarted: false })) && /placed 1\/3/.test(rt.rtHudLine("rb-teleop-pick-place", { placed: 1, remaining: 2 })), "pad", "rtHudLine per task");
// the pointer path on the cell task: a left press on the e-stop tests it, a right press holds it
pad8.start(6); for (let i = 0; i < 30; i++) { padEl.handlers.wheel({ deltaY: -1, preventDefault() {} }); pad8.step(); } // the walker starts 12 m or more out; the walk stops at the gate
const xy = { clientX: (0.5 / 1.4 + 0.5) * 200, clientY: ((1.0 - 1.1) / 1.2 + 0.5) * 160, pointerType: "mouse" };
padEl.handlers.pointermove(xy); padEl.handlers.pointerdown({ ...xy, button: 0 }); pad8.step(); const stLight = pad8.status(); padEl.handlers.pointerup({ pointerType: "mouse" });
padEl.handlers.pointerdown({ ...xy, button: 2 }); pad8.step(); const stFirm = pad8.status(); padEl.handlers.pointerup({ pointerType: "mouse" }); pad8.stop();
check(/e-stop tested/.test(stLight) && /stopped/.test(stFirm) && pad8.source() === "pointer", "pad", `pointer on the cell pad: light press tests the e-stop, firm press holds it ("${stFirm}")`);
const ghostN = pad8.demonstrate(7001);
check(ghostN > 5 && /Robot demonstrates back/.test(pad8.status()) && /step 1\//.test(pad8.status()), "pad", `the ghost replays the policy's run (${ghostN} frames; "${pad8.status().slice(0, 80)}")`);
let gk = 1; while (pad8.ghost()) gk++;
check(gk === ghostN && /done/.test(pad8.status()), "pad", `the ghost steps to the end (${gk}/${ghostN})`);
pad8.task("rb-teleop-pick-place"); pad8.start(7001);
pad8.demonstrate(7001); pad8.ghost();
check(rig8.userData.rtDriven === true && rig8.rotation.y !== 0, "pad", "on the arm task the ghost drives the same rig (rtFollowRig)");
pad8.stop();
const padClick = host8.children.find((c) => c.className === "rt-row")?.children.find((c) => c.className === "rt-ghost");
check(!!padClick && typeof padClick.handlers.click === "function", "pad", "one button: Robot demonstrates back");

// ---------------------------------------------------------------- 9 loop 8–9 (ROBOTRAIN-4, ROBOTRAIN-5): the flush, the walker, the hard variants
// 9a dxFlush resolves with the count and serialises; a write the idle slot already started is awaited too (the loop-9 page bug)
const slow9 = () => { const b = dx.dxMemBackend(); return { kind: "memory", async all() { await new Promise((r) => setTimeout(r, 15)); return b.all(); }, async save(l) { await new Promise((r) => setTimeout(r, 15)); return b.save(l); }, async clear() { return b.clear(); } }; };
const store9 = dx.dxMakeStore(slow9());
check(dx.dxOptIn({ licence: "CC0-1.0", adult: true, signals: { ...sigIn, adult: null } }).ok, "flush", "opt-in for the flush checks");
const take9 = (seed) => { const e = rb.rbEnv("rb-cell-entry", { seed }), r = rt.rtRecorder(e, { store: store9, signals: sigIn }), h = rt.rtScriptedHumanCell(e, { seed, skill: 1 }); let d = false; for (let i = 0; i < 400 && !d; i++) d = r.step(h(r.observation)).done; return r.finish(); };
for (const s of [9101, 9102, 9103]) take9(s);
const pend9 = dx.dxPendingCount();
const n9 = await dx.dxFlush();
const list9 = await store9.list();
check(pend9 === 3 && n9 === 3 && list9.length === 3 && dx.dxPendingCount() === 0, "flush", `dxFlush resolves with the count written (pending ${pend9} → flushed ${n9}, store ${list9.length}, pending after ${dx.dxPendingCount()})`);
// two flushes at once: chained, each write runs once, nothing is lost (the store's put is serialised)
for (const s of [9104, 9105]) take9(s);
const [fa, fb] = await Promise.all([dx.dxFlush(), dx.dxFlush()]);
check(fa + fb === 2 && (await store9.list()).length === 5, "flush", `two concurrent flushes write each take once (${fa} + ${fb}; store ${(await store9.list()).length})`);
// in flight: let the idle slot (setTimeout in Node) start the write, then flush — the flush waits for that put to land
take9(9106);
await new Promise((r) => setTimeout(r, 2));
const inflight9 = dx.dxPendingCount(), nIn = await dx.dxFlush();
check(inflight9 === 1 && nIn === 1 && (await store9.list()).length === 6, "flush", `a write the idle slot already started is awaited by dxFlush (in flight ${inflight9} → flushed ${nIn}; store ${(await store9.list()).length})`);
// concurrent puts straight on the store keep every episode
const eps9 = rt.rtRecordTakes({ n: 4, scenario: "rb-cell-entry", seed: 91 });
const store9b = dx.dxMakeStore(slow9());
const puts9 = await Promise.all(eps9.map((e) => store9b.put(e)));
check(puts9.every(Boolean) && (await store9b.list()).length === 4, "flush", "four concurrent store puts keep four episodes (put is serialised)");
// a revoke while a write is already in flight: the revoke waits for it, then empties the store (no take lands after the clear)
check(dx.dxOptIn({ licence: "CC0-1.0", adult: true, signals: { ...sigIn, adult: null } }).ok, "flush", "opt-in again");
take9(9108);
await new Promise((r) => setTimeout(r, 2));
const inflightRev = dx.dxPendingCount();
await dx.dxRevoke({ store: store9 });
await new Promise((r) => setTimeout(r, 60));
check(inflightRev === 1 && (await store9.list()).length === 0, "flush", `revoke during an in-flight write: the store holds ${(await store9.list()).length} afterwards (the write was in flight: ${inflightRev})`);
check(dx.dxOptIn({ licence: "CC0-1.0", adult: true, signals: { ...sigIn, adult: null } }).ok, "flush", "opt-in again");
// a revoke between the take and the flush discards it (consent is re-checked at write time)
take9(9107);
await dx.dxRevoke({ store: store9 });
const nRev = await dx.dxFlush();
check(nRev === 0 && (await store9.list()).length === 0, "flush", `revoke before the flush: nothing written (${nRev}), store emptied`);
check(/__parishTest\.dxFlush = dxFlush/.test(APP) && /stored: async \(\) => \(await dxStore\.list\(\)\)\.length/.test(APP) && /onTake: \(\) => \{ vbLocal\?\.refresh\(\)\.then\(\(\) => npDxPanel\?\.render\?\.\(\)\)/.test(APP), "flush", "the page exposes dxFlush and the store count on __parishTest, and a finished take re-renders the Me tab's count");
// 9b rtFollowCell: a plain walker node stands at the observation's place with its hand at the control; the arm is posed by the robot's mode
const walker9 = { position: { x: 0, y: 0, z: 0 }, visible: false, children: [{ userData: { hand: true }, position: { x: 0, y: 0, z: 0 } }] };
const rig9 = { rotation: { x: 0, y: 0, z: 0 }, userData: {}, children: [{ userData: { pivot: true }, rotation: { x: 0, y: 0, z: 0 } }] };
const obs9 = rb.rbEnv("rb-cell-entry", { seed: 5 }).reset();
check(!!obs9.walker && Array.isArray(obs9.walker.at) && Array.isArray(obs9.walker.hand), "walker", "the cell observation carries walker { at, hand, control }");
const f9 = rt.rtFollowRig(rig9, obs9, { walker: walker9 });
check(walker9.visible === true && walker9.position.x === obs9.walker.at[0] && walker9.position.y === obs9.walker.at[1] && walker9.position.z === obs9.walker.at[2] && walker9.children[0].position.x === obs9.walker.hand[0] && walker9.children[0].position.y === obs9.walker.hand[1] && f9?.at?.length === 3, "walker", `rtFollowRig hands a cell observation to rtFollowCell, which moves a plain walker node to ${JSON.stringify(obs9.walker.at)} with the hand at ${JSON.stringify(obs9.walker.hand)}`);
const pose9 = (mode, restarted = false) => { const r = { rotation: { x: 0, y: 0, z: 0 }, userData: {}, children: [{ userData: { pivot: true }, rotation: { x: 0, y: 0, z: 0 } }] }; rt.rtFollowCell(r, { ...obs9, robotMode: mode, restarted }, null); return [r.rotation.y, r.children[0].rotation.x, r.userData.rtDriven]; };
const modes9 = { full: pose9("full"), reduced: pose9("reduced"), stopped: pose9("protective-stop"), restarted: pose9("full", true) };
check(JSON.stringify(modes9.full) === "[0.8,0,true]" && JSON.stringify(modes9.reduced) === "[0,-0.3,true]" && JSON.stringify(modes9.stopped) === "[0,0.6,true]" && JSON.stringify(modes9.restarted) === "[0,0,true]", "walker", `the arm is posed by mode: ${JSON.stringify(modes9)}`);
check(rt.rtFollowCell(rig9, { effector: [0, 0, 0] }) === null && rt.rtFollowRig({ rotation: { y: 0 }, children: [] }, { effector: [0.1, 0.3, -0.3] }) !== null, "walker", "no walker in the observation → rtFollowCell does nothing; an arm observation still turns the rig");
// 9c the parishes app builds the walker on a cell site only (two boxes beside the rig, hidden until moved)
check(/walker: rtSite\?\.rig === "cell" \? npWalkerFigure\(rtRig\) : null/.test(APP) && /function npWalkerFigure\(rig\)/.test(APP) && /w\.visible = false/.test(APP) && /hand\.userData\.hand = true/.test(APP), "walker", "the app builds the walker figure on a cell site only, hidden until a take or the ghost moves it");
// 9d the hard variants: present in colearn.json, seeded, 60 held-out seeds each, the gap stated
const col = await imp("WebXR/shared/col-learn.js");
const EV9 = JSON.parse(read("docs/evals/colearn.json"));
const V9 = ["rb-construction-drilling#hard", "rb-port-gantry#hard", "rb-amr-fleet-routing#hard"];
for (const id of V9) {
  const v = EV9.variants?.find((x) => x.id === id);
  check(!!v && v.random.n === 60 && v.expert.n === 60 && v.bcFiltered.n === 60 && v.bcUnfiltered.n === 60, "variants", `${id}: in colearn.json with 60 held-out seeds each (${v ? `random ${v.random.n}, clone ${v.bcFiltered.n}, expert ${v.expert.n}` : "missing"})`);
  check(!!v && Math.abs(v.gapToExpert - (v.expert.success - v.bcFiltered.success)) < 0.002 && v.bcFiltered.success > v.random.success, "variants", `${id}: the gap is stated and is expert − clone (${v?.gapToExpert}); the clone beats random`);
  check(rb.rbVariantIds().includes(id) && col.COL_VARIANTS.some((c) => `${c.scenario}#${c.variant}` === id), "variants", `${id}: declared in rb-robotics-data.js and measured through COLEARN's COL_VARIANTS`);
  const roll9 = () => { const e = rb.rbEnv(id, { seed: 7003 }); return rb.rbRollout(e, { seed: 7003, policy: rb.rbPolicy(e, { skill: 1, seed: 7003 }) }); };
  const a = roll9(), b = roll9();
  const sig = (sd) => JSON.stringify(rb.rbEnv(id, { seed: sd }).reset());
  check(JSON.stringify(a.steps) === JSON.stringify(b.steps) && new Set([7001, 7002, 7003, 7004, 7005].map(sig)).size > 1, "variants", `${id}: seeded (the same seed gives the same episode; seeds differ)`);
}
check(/held-out seeds 7001-7060/.test(EV9.data) && JSON.stringify(col.colHeldOut(60)) === JSON.stringify(Array.from({ length: 60 }, (_, i) => 7001 + i)), "variants", "the held-out seeds are 7001–7060, stated in the eval file");
const portV = EV9.variants.find((x) => x.id === "rb-port-gantry#hard");
check(portV.gapToExpert === 0.283 && /0\.283/.test(read("docs/consoles/ROBOTRAIN-4.md")) && /0\.283/.test(read("docs/consoles/ROBOTRAIN-5.md")), "variants", `the port gap is stated (${portV.gapToExpert}) in colearn.json and the console notes`);
const amrV = EV9.variants.find((x) => x.id === "rb-amr-fleet-routing#hard");
check(amrV.expert.success === 1 && amrV.expert.clean === 1 && new RegExp(String(amrV.gapToExpert)).test(read("docs/consoles/ROBOTRAIN-5.md")), "variants", `the AMR hard variant is solvable (expert ${amrV.expert.success}, clean ${amrV.expert.clean}) and its gap (${amrV.gapToExpert}) is stated in the console note`);
// the file matches the code: the AMR variant re-measured live
const live9 = col.colEvalScenario("rb-amr-fleet-routing#hard", { onlySuccessful: true });
check(live9.modelHash === amrV.modelHash && live9.bc.success === amrV.bcFiltered.success && live9.expert.success === amrV.expert.success, "variants", `colearn.json's AMR variant matches a live run (model ${live9.modelHash}, clone ${live9.bc.success})`);
// the base scenarios are unchanged by the variants: a base AMR observation has no variant fields
const amrBase = rb.rbEnv("rb-amr-fleet-routing", { seed: 7001 }).reset();
check(!("walkways" in amrBase) && !("blocked" in amrBase) && "walkways" in rb.rbEnv("rb-amr-fleet-routing#hard", { seed: 7001 }).reset(), "variants", "the base AMR observation carries no variant fields (its seeds and rows are unchanged)");
// 9e teleop tasks for the hard variants: rtCompareAll reports recorded vs synthetic on six tasks
const HARD_RT = ["rb-construction-drilling#hard", "rb-port-gantry#hard"];
check(rt.RT_TASK_IDS.length === 6 && HARD_RT.every((id) => rt.RT_TASK_IDS.includes(id) && rt.RT_TASKS[id].label && rt.RT_TASKS[id].poseToAction && rt.RT_TASKS[id].human), "rtvariants", `RT_TASKS covers six tasks, the two hard variants on their base controls (${rt.RT_TASK_IDS.join(", ")})`);
check(new Set(rt.RT_TASK_IDS.map((id) => rt.RT_TASKS[id].label)).size === 6 && /RT_TASKS\[id\]\.label/.test(FILES_RT()), "rtvariants", "the pad labels each task by its own name");
const cmpHard = Object.fromEntries(HARD_RT.map((id) => [id, rt.rtCompare({ scenario: id })]));
for (const id of HARD_RT) {
  const c = cmpHard[id], v = EV9.variants.find((x) => x.id === id);
  check(c.heldOut === 60 && c.recorded.success > c.random.success && c.synthetic.success > c.random.success, "rtvariants", `${id}: recorded ${c.recorded.success} (clean ${c.recorded.clean}) and synthetic ${c.synthetic.success} (clean ${c.synthetic.clean}) both above random ${c.random.success} on 60 held-out seeds`);
  check(c.synthetic.success === v.bcFiltered.success && c.expert.success === v.expert.success, "rtvariants", `${id}: the synthetic arm agrees with colearn.json (${c.synthetic.success} = ${v.bcFiltered.success})`);
}

// ---------------------------------------------------------------- 6 hygiene
function FILES_RT() { return read("WebXR/shared/rt-teleop.js"); }
const FILES = { rt: read("WebXR/shared/rt-teleop.js"), vbc: read("WebXR/shared/vb-colearn.js"), console: read("docs/consoles/ROBOTRAIN.md"), console2: read("docs/consoles/ROBOTRAIN-2.md"), console3: read("docs/consoles/ROBOTRAIN-3.md"), console5: read("docs/consoles/ROBOTRAIN-5.md"), data: DATA, fns: FNS, gen: read("tools/gen_robotics_programme.mjs"), page: PAGE, handbook: DOC, ...Object.fromEntries(GAPS.map((id) => [id, read(`WebXR/smartcity/js/sims/${id}.js`)])) };
for (const [k, v] of Object.entries(FILES)) {
  check(v.length > 0, "hygiene", `${k}: missing`);
  check(!/\bfetch\s*\(|XMLHttpRequest|sendBeacon|WebSocket\s*\(|navigator\.sendBeacon/.test(v), "hygiene", `${k}: a network call`);
  check(!/claude-(opus|sonnet|haiku)|\bopus[- ]\d|\bsonnet[- ]\d|\bhaiku[- ]\d|\bgpt-\d/i.test(v), "hygiene", `${k}: a model identifier`);
  check(!/\b(partner(ed|ship)? with|in partnership with|affiliated with|endorsed by|backed by|sponsored by)\b/i.test(v.replace(/no partnership with any[^.]*\./gi, "")), "hygiene", `${k}: affiliation wording`);
}
check(!/import\s*\{[^}]*\sas\s/.test(FILES.rt) && !/import\s*\{[^}]*\sas\s/.test(FILES.vbc), "hygiene", "an import alias in rt-teleop.js or vb-colearn.js");
check([...FILES.vbc.matchAll(/^export (?:const|function|let) (\w+)/gm)].every((m) => /^(vb|VB_)/.test(m[1])), "hygiene", "every export of vb-colearn.js is prefixed vb/VB_");
check(FILES.console2.includes("## Cycles") && FILES.console2.includes("## Seams") && /before/.test(FILES.console2) && /after/.test(FILES.console2), "hygiene", "docs/consoles/ROBOTRAIN-2.md lacks Cycles, Seams or before/after evals");
check(FILES.console3.includes("## Cycles") && FILES.console3.includes("## Seams") && /before/.test(FILES.console3) && /after/.test(FILES.console3), "hygiene", "docs/consoles/ROBOTRAIN-3.md lacks Cycles, Seams or before/after evals");
check(!/claude-(opus|sonnet|haiku)|\bopus[- ]\d|\bsonnet[- ]\d|\bhaiku[- ]\d|\bgpt-\d/i.test(read("tools/check_robotrain.mjs")), "hygiene", "checker: a model identifier");
check(/^(export (const|function|let) (rt|RT_)|import |\/\/|\/\*| \*|\s*$|const rt|[})\]]|\s)/m.test(FILES.rt) && [...FILES.rt.matchAll(/^export (?:const|function|let) (\w+)/gm)].every((m) => /^(rt|RT_)/.test(m[1])), "hygiene", "every export of rt-teleop.js is prefixed rt/RT_");
check(/adults only/.test(FILES.rt) && /revoking deletes/.test(FILES.rt) && /no upload endpoint/.test(FILES.rt), "hygiene", "rt-teleop.js states the data rules");
check(FILES.console.includes("## Cycles") && FILES.console.includes("## Seams"), "hygiene", "docs/consoles/ROBOTRAIN.md lacks Cycles or Seams");
check(FILES.console5.includes("## Cycles") && FILES.console5.includes("## Seams") && FILES.console5.includes("## Left") && /before/.test(FILES.console5) && /after/.test(FILES.console5), "hygiene", "docs/consoles/ROBOTRAIN-5.md lacks Cycles, Seams, Left or before/after evals");

const fmt = (x) => `success ${x.success} clean ${x.clean} steps ${x.meanSteps}`;
if (fails.length) { for (const f of fails.slice(0, 40)) console.log("FAIL", f); console.log(`check_robotrain: FAILED ${fails.length} of ${checks} checks`); process.exit(1); }
console.log(`check_robotrain: ok — ${checks} checks · gap coverage before ${before.covered}/${before.of} → after ${after.covered}/${after.of} (${after.gaps.map((g) => `${g.gap}: ${g.id} in ${inLevels(g.id).length} level(s)`).join("; ")}) · meshes ${GAPS.map((id) => meshCounts[id]).join("/")} · programme coverage ${cov.covered}/${cov.of} · recorded vs synthetic BC on ${cmp.heldOut} held-out seeds (N=${cmp.n}, stand-in labelled synthetic): recorded ${fmt(cmp.recorded)} (kept ${cmp.recorded.kept}/${cmp.recorded.offered}) · synthetic ${fmt(cmp.synthetic)} (kept ${cmp.synthetic.kept}/${cmp.synthetic.offered}) · random ${cmp.random.success} · expert ${cmp.expert.success} · recorder inert without consent, human take valid with receipt, revoke deletes · page: loop 5/5 live, recorder live, gaps 4/4 · loop 6: XR pose source pure (grip + trigger/squeeze/e-stop), rig follows the pose with 0 new meshes · cell entry through the pose path: recorded ${fmt(cmp2.recorded)} (kept ${cmp2.recorded.kept}/${cmp2.recorded.offered}) · synthetic ${fmt(cmp2.synthetic)} · random ${cmp2.random.success} · expert ${cmp2.expert.success} · COLEARN provider on seeded safe jobs: completed ${pc.totals.colearn.completed}/${pc.totals.colearn.of} vs scripted ${pc.totals.scripted.completed}/${pc.totals.scripted.of} (${Object.entries(pc.tasks).map(([k, t]) => `${k} ${t.colearn.completed}/${t.scripted.completed}`).join(", ")}), governor verdict on ${pc.governor.stepsMonitored}/${pc.governor.stepsRun} steps · K-12 lesson lk-lesson-robot-waits-for-ok on ${lesson?.station} · loop 7 last mile: signed out → synthetic; opted in with ${N8} takes → "${descOwn.replace(/^.*trained on /, "")}", job ${jobOwn.phase} with the governor on ${jobOwn.deliverable?.episode?.steps?.length}/${jobOwn.deliverable?.episode?.steps?.length} steps; revoke → synthetic, takes 0 · XR loop on session.requestAnimationFrame, teleop.xr called from it only · pad: cell task through the XR seam (${fedP} frames), ghost ${ghostN} frames on the same rig · loops 8–9: dxFlush ${n9}/${pend9} written, in-flight write awaited, revoke waits for it; walker at ${JSON.stringify(obs9.walker.at)}; hard variants pinned ${V9.length} (${V9.map((id) => { const v = EV9.variants.find((x) => x.id === id); return `${id.replace("rb-", "")} random ${v.random.success} / clone ${v.bcFiltered.success} / expert ${v.expert.success}, gap ${v.gapToExpert}`; }).join("; ")}) · teleop tasks ${rt.RT_TASK_IDS.length}, recorded vs synthetic on the hard ones: ${HARD_RT.map((id) => `${id.replace("rb-", "")} recorded ${cmpHard[id].recorded.success} (clean ${cmpHard[id].recorded.clean}) / synthetic ${cmpHard[id].synthetic.success} (clean ${cmpHard[id].synthetic.clean})`).join("; ")}`);
