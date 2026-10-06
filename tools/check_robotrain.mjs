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

// ---------------------------------------------------------------- 6 hygiene
const FILES = { rt: read("WebXR/shared/rt-teleop.js"), console: read("docs/consoles/ROBOTRAIN.md"), data: DATA, fns: FNS, gen: read("tools/gen_robotics_programme.mjs"), page: PAGE, handbook: DOC, ...Object.fromEntries(GAPS.map((id) => [id, read(`WebXR/smartcity/js/sims/${id}.js`)])) };
for (const [k, v] of Object.entries(FILES)) {
  check(v.length > 0, "hygiene", `${k}: missing`);
  check(!/\bfetch\s*\(|XMLHttpRequest|sendBeacon|WebSocket\s*\(|navigator\.sendBeacon/.test(v), "hygiene", `${k}: a network call`);
  check(!/claude-(opus|sonnet|haiku)|\bopus[- ]\d|\bsonnet[- ]\d|\bhaiku[- ]\d|\bgpt-\d/i.test(v), "hygiene", `${k}: a model identifier`);
  check(!/\b(partner(ed|ship)? with|in partnership with|affiliated with|endorsed by|backed by|sponsored by)\b/i.test(v.replace(/no partnership with any[^.]*\./gi, "")), "hygiene", `${k}: affiliation wording`);
}
check(!/import\s*\{[^}]*\sas\s/.test(FILES.rt), "hygiene", "an import alias in rt-teleop.js");
check(!/claude-(opus|sonnet|haiku)|\bopus[- ]\d|\bsonnet[- ]\d|\bhaiku[- ]\d|\bgpt-\d/i.test(read("tools/check_robotrain.mjs")), "hygiene", "checker: a model identifier");
check(/^(export (const|function|let) (rt|RT_)|import |\/\/|\/\*| \*|\s*$|const rt|[})\]]|\s)/m.test(FILES.rt) && [...FILES.rt.matchAll(/^export (?:const|function|let) (\w+)/gm)].every((m) => /^(rt|RT_)/.test(m[1])), "hygiene", "every export of rt-teleop.js is prefixed rt/RT_");
check(/adults only/.test(FILES.rt) && /revoking deletes/.test(FILES.rt) && /no upload endpoint/.test(FILES.rt), "hygiene", "rt-teleop.js states the data rules");
check(FILES.console.includes("## Cycles") && FILES.console.includes("## Seams"), "hygiene", "docs/consoles/ROBOTRAIN.md lacks Cycles or Seams");

const fmt = (x) => `success ${x.success} clean ${x.clean} steps ${x.meanSteps}`;
if (fails.length) { for (const f of fails.slice(0, 40)) console.log("FAIL", f); console.log(`check_robotrain: FAILED ${fails.length} of ${checks} checks`); process.exit(1); }
console.log(`check_robotrain: ok — ${checks} checks · gap coverage before ${before.covered}/${before.of} → after ${after.covered}/${after.of} (${after.gaps.map((g) => `${g.gap}: ${g.id} in ${inLevels(g.id).length} level(s)`).join("; ")}) · meshes ${GAPS.map((id) => meshCounts[id]).join("/")} · programme coverage ${cov.covered}/${cov.of} · recorded vs synthetic BC on ${cmp.heldOut} held-out seeds (N=${cmp.n}, stand-in labelled synthetic): recorded ${fmt(cmp.recorded)} (kept ${cmp.recorded.kept}/${cmp.recorded.offered}) · synthetic ${fmt(cmp.synthetic)} (kept ${cmp.synthetic.kept}/${cmp.synthetic.offered}) · random ${cmp.random.success} · expert ${cmp.expert.success} · recorder inert without consent, human take valid with receipt, revoke deletes · page: loop 5/5 live, recorder live, gaps 4/4`);
