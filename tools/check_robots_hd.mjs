#!/usr/bin/env node
/**
 * ROBOTS-HD (console `rhd`, docs/consoles/ROBOTS-HD.md): the robots themselves in high detail.
 *   1. Budgets: every HD robot kind built on the desktop high tier inside RHD_BUDGET (triangles, draw calls), against
 *      today's rig (rb-world.js rbDrawRig) measured the same way; generic by kind (no words drawn, no maker named).
 *   2. Tiers: balanced, the phone tier and a standalone headset browser build nothing and leave today's rigs drawn exactly;
 *      on high every site's rig is hidden and its HD robot is in the rig group (so a teleop pose source still drives it).
 *   3. Safety state you can see: the status light over seeded walks of every site (near / far, e-stop, lockout, restart)
 *      matches the site's own state by the stated rule N of N; the three states each shown; a VBRIDGE governor monitor
 *      decision maps the same way N of N; no state -> the light is dark (never invented); the floor zone shows exactly when
 *      rbSsmMode says a person is inside the warning distance.
 *   3b. The agent-jobs run (ROBOTS-HD-2): while the panel runs a job on a site of this map, that site's light follows each
 *      step's governor decision in step order (the real vbRun with the supervisor's e-stop, and a scripted monitor run with an
 *      inside-separation step: green -> amber -> red), the more severe of the run and the site's own state wins, a halted run
 *      keeps its last decision until the next job, a clean run hands back; no run -> the default lights exactly.
 *   3c. The preview and the real run agree (ROBOTS-HD-3): the real vb-panel.js (stand-in DOM) with the page's provider hook;
 *      for every job the governor lets through and every E-stop step, the preview's governor decision equals the real run's at
 *      every step before the stop, the real run stops there with "estop", and a clean run matches its preview in full.
 *   4. Motion: the arm's joints eased (zero speed at each key pose, no jump between frames); the AMR's wheels turn by the
 *      distance it travels and hold still when it stops.
 *   5. Rooms: the robot rooms with the HD robots (and ENV-HD-4's lighting, with and without Ultra) inside IX_BUDGET /
 *      HD4_ULTRA_BUDGET N of 6; the replaced parts are gone; balanced / phone / headset rooms identical to before.
 *   5b. The zone indoors (ROBOTS-HD-2): a headless walk (ixrWalkTo) from the door past each room robot shows its floor zone
 *      exactly inside the warning distance by the room-local pose, N of N; dark with no site state.
 *   6. Wiring: the app mounts, ticks and registers the dresser in order; the bundler lists the module.
 *
 *     node tools/check_robots_hd.mjs
 */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const WEBXR = join(ROOT, "WebXR");
let failures = 0, passes = 0;
const check = (ok, msg, detail = "") => { if (ok) { passes++; console.log(`  ok ${msg}`); } else { failures++; console.error(`  FAIL ${msg}${detail ? ` — ${detail}` : ""}`); } };
const imp = (p) => import(pathToFileURL(join(WEBXR, p)).href);

const THREE = await imp("vendor/three/dist/three.module.min.js");
const RHD = await imp("shared/rhd-robots-hd.js");
const RBW = await imp("shared/rb-world.js");
const RB = await imp("shared/rb-robotics-data.js");
const ENV = await imp("shared/rb-env.js");
const VBG = await imp("shared/vb-governor.js");
const VBB = await imp("shared/vb-bridge.js");
const RB_SSM_ = (await imp("shared/rb-robotics-data.js")).RB_SSM;
const IX = await imp("shared/ix-interiors.js");
const IXR = await imp("shared/ixr-robo-interiors.js");
const H = await imp("shared/hd4-rooms.js");
const HD2 = await imp("shared/hd2-room-skins.js");
const U = await imp("shared/hd4-ultra.js");
const { npParish } = await imp("shared/np-parishes.js");
const DESK = "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36";
const QUEST = "Mozilla/5.0 (X11; Linux x86_64; Quest 3) AppleWebKit/537.36 (KHTML, like Gecko) OculusBrowser/33.0 Chrome/124.0 VR Safari/537.36";
const PICO = "Mozilla/5.0 (X11; Linux x86_64; PICO 4 Ultra Enterprise) AppleWebKit/537.36 Chrome/120 Safari/537.36";
const tri = (m) => (m.geometry.index ? m.geometry.index.count : m.geometry.attributes.position.count) / 3;
const meshesIn = (o) => { const out = []; o.traverse((m) => { if (m.isMesh) out.push(m); }); return out; };

// ------------------------------------------------------------------------------------------------------------ 1. budgets
console.log("1. budgets per robot (desktop high tier): today's rig -> HD robot");
check(JSON.stringify(RHD.RHD_KINDS) === JSON.stringify(RBW.RB_RIG_TYPES), `the HD kinds are ROBOTICS' rig kinds (${RHD.RHD_KINDS.join(", ")})`);
const before = {};
for (const kind of RBW.RB_RIG_TYPES) {
  const g = new THREE.Group(); let n = 0;
  const add = (parent, geo, m, x, y, z, name) => { const mesh = new THREE.Mesh(geo, m); mesh.position.set(x, y, z); mesh.name = name; parent.add(mesh); n++; return mesh; };
  RBW.rbDrawRig(THREE, g, kind, false, add, (c, o = {}) => new THREE.MeshLambertMaterial({ color: c, ...o }));
  before[kind] = { calls: n, triangles: meshesIn(g).reduce((a, m) => a + tri(m), 0) };
}
const rows = [];
for (const kind of [...RHD.RHD_KINDS, "cell-arm", "drill"]) {
  const ground = new THREE.Group(), r = RHD.rhdBuildRobot(THREE, kind, { zone: kind !== "cell-arm", ground });
  const all = new Set([...meshesIn(r.group), ...meshesIn(ground)]);
  const calls = all.size, triangles = [...all].reduce((a, m) => a + tri(m), 0), B = RHD.RHD_BUDGET[kind];
  rows.push([kind, before[kind] ?? null, { calls, triangles }, B]);
  check(calls <= B.calls && triangles <= B.triangles, `${kind}: ${before[kind] ? `${before[kind].calls} draw calls / ${before[kind].triangles} tris -> ` : ""}${calls} draw calls / ${triangles} tris (zone included) <= ${B.calls} / ${B.triangles}`);
  check(r.meshes + (r.zone ? 2 : 0) === calls, `${kind}: the robot reports its own meshes (${r.meshes} + zone ${r.zone ? 2 : 0} = ${calls})`);
}
const src = readFileSync(join(WEBXR, "shared/rhd-robots-hd.js"), "utf8");
check(!/fillText|strokeText/.test(src), "no words drawn on any HD robot (no fillText / strokeText)");
check(!/\b(KUKA|FANUC|ABB|Universal Robots|Yaskawa|Boston Dynamics|Kiva|Locus|Fetch|Konecranes|Liebherr|Hilti)\b/i.test(src), "no robot maker or product named in the module");
check(!/import\s*\{[^}]*\bas\b/.test(src), "no import aliases (the flat bundler strips imports)");
check([...src.matchAll(/^(?:export\s+)?(?:const|let|var|function|class)\s+([A-Za-z_$][\w$]*)/gm)].every((m) => /^(rhd|RHD_)/.test(m[1])), "every top-level name carries the rhd / RHD_ prefix");

// ------------------------------------------------------------------------------------------------------------ 2. tiers
console.log("2. tiers");
const allowed = [["desktop high", "high", DESK, true], ["balanced", "balanced", DESK, false], ["phone (low)", "low", DESK, false], ["Quest browser on high", "high", QUEST, false], ["PICO browser on high", "high", PICO, false]];
check(allowed.every(([, t, ua, want]) => RHD.rhdAllowed(t, ua) === want), `HD robots only on the desktop high tier: ${allowed.filter(([, t, ua, want]) => RHD.rhdAllowed(t, ua) === want).length} of ${allowed.length} cases`);
const parishes = [...new Set(RB.RB_SITES.map((s) => s.parish))];
const mountOn = (pid, tier, ua = DESK) => {
  const root = new THREE.Group(), w = RBW.rbMountRobotics({ three: THREE, root, parish: npParish(pid), tier });
  const pre = meshesIn(root).map((m) => `${m.name}:${m.visible}`).join("|");
  const hd = RHD.rhdMountRobots({ THREE, robotics: w, tier, ua });
  return { root, w, hd, pre, post: meshesIn(root).filter((m) => !/^rhd-/.test(m.name)).map((m) => `${m.name}:${m.visible}`).join("|"), rhd: meshesIn(root).filter((m) => /^rhd-/.test(m.name)).length };
};
let same = 0, total = 0;
for (const pid of parishes) for (const [tier, ua] of [["balanced", DESK], ["low", DESK], ["high", QUEST]]) {
  const m = mountOn(pid, tier, ua); total++;
  if (!m.hd.on && m.rhd === 0 && m.pre === m.post) same++;
}
check(same === total, `balanced, phone and headset keep today's rigs exactly (nothing built, nothing hidden): ${same} of ${total} mounts on ${parishes.length} maps`);
let hiOk = 0, hiN = 0;
const high = {};
for (const pid of parishes) {
  const m = mountOn(pid, "high"); high[pid] = m;
  for (const R of m.hd.robots) {
    hiN++;
    const rigShown = R.rig.children.filter((c) => c.isMesh && c.visible).length, inRig = R.robot.group.parent === R.rig, fence = R.site.getObjectByName("rb-cell-fence");
    if (rigShown === 0 && inRig && (!fence || !fence.visible) && R.kind === m.w.sites.find((s) => s.id === R.id).rig) hiOk++;
  }
}
check(hiN === RB.RB_SITES.length && hiOk === hiN, `high: every site's rig hidden and its HD robot of the site's own kind in the rig group: ${hiOk} of ${hiN}`);

// ------------------------------------------------------------------------------------------- 3. safety state you can see
console.log("3. the status light and the floor zone");
const rule = (st) => (st.estopped || st.locked ? "e-stop" : st.mode === "stop" ? "protective-stop" : "running");
let seen = new Set(), match = 0, steps = 0, zoneOk = 0;
let seed = 7; const rnd = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; };
for (const pid of parishes) {
  const { w, hd } = high[pid];
  for (const R of hd.robots) {
    const s = w.sites.find((x) => x.id === R.id);
    for (let k = 0; k < 60; k++) {
      const u = rnd();
      if (u < 0.08) w.act(R.id, "press-estop"); else if (u < 0.12) w.act(R.id, "lockout"); else if (u < 0.18) w.act(R.id, "restart"); else if (u < 0.2) w.act(R.id, "test-estop");
      const d = rnd() < 0.5 ? rnd() * 8 : 2 + rnd() * 30, a = rnd() * Math.PI * 2;
      const px = s.position[0] + Math.cos(a) * d, pz = s.position[1] + Math.sin(a) * d;
      w.animate(0.05, px, pz); hd.tick(0.05, px, pz);
      const st = w.state(R.id), got = hd.light(R.id), dd = Math.hypot(px - s.position[0], pz - s.position[1]);
      steps++; if (got === rule(st)) match++; seen.add(got);
      const zoneWant = ENV.rbSsmMode(dd).mode !== "full";
      if (R.robot.zone.visible === zoneWant) zoneOk++;
      const hex = R.robot.light.material.color.getHex();
      if (hex !== RHD.RHD_LIGHT[got]) { match--; }
    }
  }
}
check(match === steps, `the light matches the site's own state (estopped/locked -> e-stop, mode stop -> protective stop, else running) and shows its colour: ${match} of ${steps} steps on ${RB.RB_SITES.length} sites`);
check(["running", "protective-stop", "e-stop"].every((x) => seen.has(x)), `status-light states shown: ${["running", "protective-stop", "e-stop"].filter((x) => seen.has(x)).length} of 3`);
check(zoneOk === steps, `the floor zone shows exactly when a person is inside the warning distance (rbSsmMode): ${zoneOk} of ${steps}`);
// The governor: monitor decisions map the same way.
const gov = VBG.vbGovernor({ estops: [] });
const site0 = RB.RB_SITES[0].id, lim = VBG.vbSiteLimits(site0);
const samples = [
  [{ jobId: "j1", siteId: site0, speed: 0.1, nearestPersonM: 20 }, "running"],
  [{ jobId: "j2", siteId: site0, speed: lim.maxSpeed, nearestPersonM: lim.warn - 0.5 }, "running"], // slow: still running, slower
  [{ jobId: "j3", siteId: site0, speed: 0.1, nearestPersonM: Math.max(0, lim.minSeparation - 0.2) }, "protective-stop"],
  [{ jobId: "j4", siteId: site0, speed: 0.1, nearestPersonM: 20, deviation: "rule 3" }, "protective-stop"],
  [{ jobId: "j5", siteId: site0, speed: 0.1, nearestPersonM: 20, estop: true }, "e-stop"],
  [{ jobId: "j6", siteId: "rb-site-nowhere", speed: 0.1, nearestPersonM: 20 }, "protective-stop"],
];
let gOk = 0; const acts = [];
for (const [smp, want] of samples) { const d = gov.monitor(smp); acts.push(d.action); if (RHD.rhdLightState(d) === want) gOk++; }
check(gOk === samples.length, `a governor monitor decision lights the same way (${[...new Set(acts)].join(", ")}): ${gOk} of ${samples.length}`);
const none = [null, undefined, {}, { action: "unknown" }, { mode: "dancing" }, 7, "running"];
check(none.every((x) => RHD.rhdLightState(x) === null), `no state -> no light (never invented): ${none.filter((x) => RHD.rhdLightState(x) === null).length} of ${none.length}`);
const lone = RHD.rhdBuildRobot(THREE, "cobot"); lone.setLight(null);
check(lone.lightState === null && lone.light.material.color.getHex() === RHD.RHD_LIGHT.off, "a robot given no state stays dark");

// ------------------------------------------------------------------------------------- 3b. the agent-jobs panel's live run
console.log("3b. the light follows a live agent-jobs run");
{
  // A stand-in for vb-panel.js' api: state() -> { job, run }, exactly the shape the panel returns (run: the step it shows).
  const panel = { st: { job: null, run: null }, state() { return this.st; } };
  const cellSite = RB.RB_SITES.find((x) => x.rig === "cell"), pidC = cellSite.parish;
  const root = new THREE.Group(), w = RBW.rbMountRobotics({ three: THREE, root, parish: npParish(pidC), tier: "high" });
  const hd = RHD.rhdMountRobots({ THREE, robotics: w, tier: "high", ua: DESK, jobs: panel });
  const sc = w.sites.find((x) => x.id === cellSite.id), far = [sc.position[0] + 30, sc.position[1] + 30], near = [sc.position[0] + 0.5, sc.position[1] + 0.5], mid = [sc.position[0] + RB_SSM_.warn + 1, sc.position[1]];
  const own = () => RHD.rhdLightState(w.state(cellSite.id)); // the site's own state, by the same rule
  const tick = (p = far) => { w.animate(0.05, ...p); hd.tick(0.05, ...p); return hd.light(cellSite.id); };
  // (a) the real run: the cell's queued job (vb-panel's first job), approved, the supervisor's e-stop at step 4.
  const spec = { seed: 101, client: { id: "client-mock-1" }, request: { taskType: "rb-cell-entry", siteId: cellSite.id, speed: 0.4, nearestPersonM: 8, policyId: "vb-scripted-expert", note: "clear a jam in the cell" } };
  const job = VBB.vbRunJob(spec, VBG.vbGovernor(), { estopAtStep: 4 });
  const runSteps = job.deliverable.episode.steps;
  let okA = 0; const seenA = [];
  for (let i = 0; i < runSteps.length; i++) {
    panel.st = { job: { id: job.id, phase: "TRANSACTION", request: job.request }, run: { step: i, of: runSteps.length, action: runSteps[i].info.governor } };
    const got = tick(); seenA.push(got);
    if (got === RHD.rhdLightState({ action: runSteps[i].info.governor })) okA++;
  }
  check(okA === runSteps.length && seenA[0] === "running" && seenA[seenA.length - 1] === "e-stop", `the real run (cell job, the supervisor's e-stop at step 4): the light matches the governor's decision ${okA} of ${runSteps.length} steps (${seenA.join(" -> ")})`);
  // (b) a scripted monitor run with an inside-separation step: green -> amber -> red in step order.
  const g2 = VBG.vbGovernor(), lim2 = VBG.vbSiteLimits(cellSite.id), jid = "vbjob-rhd-scripted";
  const script = [{ nearestPersonM: 20, speed: 0.2 }, { nearestPersonM: lim2.warn - 0.3, speed: lim2.maxSpeed }, { nearestPersonM: Math.max(0, lim2.minSeparation - 0.3), speed: 0.1 }, { nearestPersonM: 20, speed: 0.1, estop: true }];
  const decisions = script.map((x) => g2.monitor({ jobId: jid, siteId: cellSite.id, ...x }));
  let okB = 0; const seenB = [];
  decisions.forEach((d, i) => { panel.st = { job: { id: jid, phase: "TRANSACTION", request: { siteId: cellSite.id } }, run: { step: i, of: decisions.length, action: d.action } }; const got = tick(); seenB.push(got); if (got === RHD.rhdLightState(d)) okB++; });
  const order = seenB.filter((x, i) => x !== seenB[i - 1]);
  check(okB === decisions.length && JSON.stringify(order) === JSON.stringify(["running", "protective-stop", "e-stop"]), `a scripted run (${decisions.map((d) => d.action).join(", ")}) lights ${order.join(" -> ")} in step order, ${okB} of ${decisions.length} matching the governor`);
  const log = hd.runLog().filter((e) => e.jobId === jid);
  check(log.length === decisions.length && log.every((e, i) => e.step === i && e.light === RHD.rhdLightState({ action: e.action })), `the mount logs every step it showed, in order: ${log.length} of ${decisions.length}`);
  // (c) the more severe wins: the site's own e-stop over a "continue"; the site's protective stop (a person inside) too.
  panel.st = { job: { id: jid, phase: "TRANSACTION", request: { siteId: cellSite.id } }, run: { step: 0, of: 1, action: "continue" } };
  w.act(cellSite.id, "press-estop"); const e1 = tick(); w.act(cellSite.id, "restart");
  const e2 = tick(near); tick(mid); tick(far); // step back out past the warning distance: the site resumes on its own
  check(e1 === "e-stop" && e2 === "protective-stop", `the more severe wins: the site's e-stop over the run's "continue" -> ${e1}; a person inside the stop distance over "continue" -> ${e2}`);
  // (d) after the run: a halted run keeps its last decision until the next job; a clean run hands back at once.
  panel.st = { job, run: null }; const h1 = tick();
  const clean = VBB.vbRunJob({ ...spec, seed: 111 }, VBG.vbGovernor(), {});
  panel.st = { job: clean, run: null }; const h2 = tick();
  panel.st = { job: { id: "vbjob-next", phase: "NEGOTIATION", request: { siteId: cellSite.id } }, run: null }; const h3 = tick();
  check(own() === "running" && h1 === "e-stop" && !clean.deliverable.evalCard.halted && h2 === own() && h3 === own() && hd.run() === null, `after the run: halted by the e-stop -> ${h1} until the next job; a clean run -> ${h2} (handed back to the site's own ${own()}); next job, not running -> ${h3}`);
  // (e) a run on a site of another map lights nothing here; no run -> the default lights exactly.
  panel.st = { job: { id: "vbjob-other", phase: "TRANSACTION", request: { siteId: "rb-site-west-oakland-warehouse" } }, run: { step: 0, of: 3, action: "estop" } };
  const o1 = tick();
  const root2 = new THREE.Group(), w2b = RBW.rbMountRobotics({ three: THREE, root: root2, parish: npParish(pidC), tier: "high" }), hdB = RHD.rhdMountRobots({ THREE, robotics: w2b, tier: "high", ua: DESK });
  const root3 = new THREE.Group(), w3b = RBW.rbMountRobotics({ three: THREE, root: root3, parish: npParish(pidC), tier: "high" }), hdC = RHD.rhdMountRobots({ THREE, robotics: w3b, tier: "high", ua: DESK, jobs: { state: () => ({ job: null }) } });
  let sameD = 0, nD = 0; let sd = 11; const r2 = () => { sd = (sd * 1664525 + 1013904223) >>> 0; return sd / 4294967296; };
  for (let k = 0; k < 120; k++) {
    const u = r2(); const id = cellSite.id; if (u < 0.06) { w2b.act(id, "press-estop"); w3b.act(id, "press-estop"); } else if (u < 0.12) { w2b.act(id, "restart"); w3b.act(id, "restart"); }
    const d = r2() * 10, a = r2() * 6.283, px = sc.position[0] + Math.cos(a) * d, pz = sc.position[1] + Math.sin(a) * d;
    w2b.animate(0.05, px, pz); hdB.tick(0.05, px, pz); w3b.animate(0.05, px, pz); hdC.tick(0.05, px, pz); nD++;
    const RB_ = hdB.robots.find((R) => R.id === id).robot, RC = hdC.robots.find((R) => R.id === id).robot;
    if (hdB.light(id) === hdC.light(id) && RB_.links.upper.rotation.x === RC.links.upper.rotation.x && RB_.zone.visible === RC.zone.visible) sameD++;
  }
  check(o1 === own() && sameD === nD, `a run on another map's site leaves this robot on its own state (${o1}); with no run the lights, pose and zone are the default's exactly: ${sameD} of ${nD} steps`);
}

// ------------------------------------------------------------------- 3c. the preview and the real run agree (ROBOTS-HD-3)
console.log("3c. the panel's preview frames and its real governor run agree step for step");
{
  // While a job plays, the light follows the panel's PREVIEW frames (vbRun on a copy with a fresh governor); the panel's own
  // governor runs the REAL run when the supervisor steps past the end or presses E-stop, and that run is what the audit keeps.
  // This drives the real vb-panel.js (a stand-in DOM, no browser) with the page's provider hook (vb-colearn.js): for every job
  // in VB_PANEL_QUEUE the governor lets through, and for every E-stop step k (plus the clean run to the end), the jobs before
  // it are approved and run to the end first (the panel's governor carries their chain), then the preview's decision at each
  // step before the stop must equal the real run's, the real run must stop at k with "estop", and a clean run must match
  // the preview in full. The light is a function of (site state, decision), so equal decisions light the same.
  const VBP = await imp("shared/vb-panel.js"), VBC = await imp("shared/vb-colearn.js");
  const el = () => ({ style: {}, dataset: {}, children: [], textContent: "", disabled: false, onclick: null, appendChild(c) { this.children.push(c); return c; }, setAttribute() {} });
  const hadDoc = "document" in globalThis, prevDoc = globalThis.document;
  globalThis.document = { createElement: el };
  const provider = VBC.vbColearnProvider({});
  const mount = () => VBP.vbMountDispatch(el(), { reducedMotion: true, policyFor: (p, env, seed) => provider.policyFor(p, env, seed), providerLabel: (sc) => provider.describe(sc) });
  const Q = VBP.VB_PANEL_QUEUE;
  // Bring a fresh panel to job j with every earlier job approved (when the governor allows it) and stepped to its end.
  const panelAt = (j) => { const p = mount(); for (let i = 0; i < j; i++) { const jb = p.next(); if (jb.phase !== "NEGOTIATION") continue; p.approve(); let g = 0; while (p.state().run && g++ < 500) p.step(); } return p; };
  let steps = 0, agree = 0, stops = 0, stopsOk = 0, clean = 0, cleanOk = 0, jobsRun = 0; const bad = [], perJob = [];
  for (let j = 0; j < Q.length; j++) {
    const probe = panelAt(j), jb = probe.next();
    if (jb.phase !== "NEGOTIATION") { perJob.push(`${Q[j].seed}: refused (${jb.governor?.primary})`); continue; }
    probe.approve(); const n = probe.state().run?.of ?? 0; if (!n) { perJob.push(`${Q[j].seed}: no frames`); continue; }
    jobsRun++; let jobSteps = 0, jobAgree = 0;
    for (let k = 0; k <= n; k++) { // k < n: the supervisor's E-stop at step k; k === n: stepped to the end (no E-stop)
      const p = panelAt(j); p.next(); p.approve();
      const preview = [];
      for (let i = 0; i < k && p.state().run; i++) { preview.push(p.state().run.action); p.step(); }
      if (k < n) { if (!p.state().run) { bad.push(`${Q[j].seed}@${k}: preview ended early`); continue; } preview.push(p.state().run.action); p.estop(); }
      const real = p.state().job.deliverable.episode.steps.map((s) => s.info.governor);
      const upto = k < n ? k : Math.max(preview.length, real.length);
      for (let i = 0; i < upto; i++) { steps++; jobSteps++; if (preview[i] === real[i]) { agree++; jobAgree++; } else if (bad.length < 6) bad.push(`${Q[j].seed}@${k} step ${i}: preview ${preview[i]} / real ${real[i]}`); }
      if (k < n) { stops++; if (real.length === k + 1 && real[k] === "estop" && p.state().job.deliverable.evalCard.halted?.action === "estop") stopsOk++; else if (bad.length < 6) bad.push(`${Q[j].seed}@${k}: real run ${real.length} steps ending ${real[real.length - 1]}`); }
      else { clean++; if (real.length === preview.length) cleanOk++; else if (bad.length < 6) bad.push(`${Q[j].seed} clean: preview ${preview.length} / real ${real.length}`); }
    }
    perJob.push(`${Q[j].seed}: ${jobAgree}/${jobSteps} over ${n + 1} runs`);
  }
  if (hadDoc) globalThis.document = prevDoc; else delete globalThis.document;
  console.log(`  per job: ${perJob.join("; ")}`);
  check(jobsRun >= 5 && perJob.length === Q.length && steps > 0 && agree === steps, `the preview's governor decision equals the real run's at every step before the stop: ${agree} of ${steps} steps over ${jobsRun} jobs the governor let through (of ${Q.length} queued; the rest refused before any run) and ${stops + clean} runs`, bad.join(" | "));
  check(stopsOk === stops && cleanOk === clean, `the real run stops at the supervisor's E-stop step with "estop" (${stopsOk} of ${stops}) and a clean run is as long as its preview (${cleanOk} of ${clean})`, bad.join(" | "));
}

// --------------------------------------------------------------------------------------------------------- 4. motion
console.log("4. motion");
const arm = RHD.rhdBuildRobot(THREE, "cobot"), ang = (p) => { arm.pose(p); return [arm.links.upper.rotation.x, arm.links.fore.rotation.x, arm.links.wrist.rotation.x]; };
const keyPhase = (i) => i / 0.35, eps = 1e-3;
let eased = 0;
for (let i = 0; i < 4; i++) { const a = ang(keyPhase(i) - eps), b = ang(keyPhase(i) + eps); const v = Math.max(...a.map((x, j) => Math.abs(b[j] - x) / (2 * eps))); if (v < 1e-3) eased++; }
check(eased === 4, `arm joints come to rest at each key pose (eased, zero joint speed): ${eased} of 4`);
let worst = 0; let prev = ang(0);
for (let k = 1; k <= 2000; k++) { const c = ang(k * 0.6 / 60); worst = Math.max(worst, ...c.map((x, j) => Math.abs(x - prev[j]))); prev = c; }
check(worst < 0.02, `no joint jumps between frames at full speed (worst ${worst.toFixed(4)} rad per 60 Hz frame)`);
const amrP = parishes.find((p) => high[p].hd.robots.some((R) => R.kind === "amr")), { w: aw, hd: ahd } = high[amrP], A = ahd.robots.find((R) => R.kind === "amr");
aw.act(A.id, "restart");
const s = aw.sites.find((x) => x.id === A.id), far = [s.position[0] + 40, s.position[1] + 40];
const r0 = A.robot.rolled;
let dist = 0; for (let k = 0; k < 30; k++) { const q = A.rig.position.clone(); aw.animate(1 / 60, ...far); ahd.tick(1 / 60, ...far); dist += A.rig.position.distanceTo(q); }
const rolled = A.robot.rolled - r0, wrap = (x) => ((x % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
check(dist > 0.01 && Math.abs(Math.abs(rolled) - dist) < 0.02 * dist + 1e-3 && Math.abs(wrap(A.robot.links.wheels.rotation.x) - wrap(A.robot.rolled / 0.09)) < 1e-6, `the AMR's wheels turn by its travel along its heading: travelled ${dist.toFixed(3)} m, rolled ${rolled.toFixed(3)} m = ${(rolled / 0.09).toFixed(2)} rad of a 0.09 m wheel`);
aw.act(A.id, "press-estop");
const w2 = A.robot.links.wheels.rotation.x; for (let k = 0; k < 30; k++) { aw.animate(1 / 60, ...far); ahd.tick(1 / 60, ...far); }
check(A.robot.links.wheels.rotation.x === w2 && ahd.light(A.id) === "e-stop", "e-stopped, the AMR and its wheels hold still and the light is red");
aw.act(A.id, "restart");

// ---------------------------------------------------------------------------------------------------------- 5. rooms
console.log("5. the robot rooms");
const reg = () => { const d = {}; return { d, ixRegisterDresser: (st, fn) => (d[st] ??= []).push(fn) }; };
const roomsWith = ({ rhd, ultra = false, ua = DESK }) => { const r = reg(); IXR.ixrRegisterDressers(r); if (rhd) RHD.rhdRegisterDressers(r, { ua }); H.hd4RegisterDressers(r, { ultra, ua }); HD2.hd2RegisterSkins(r); return r.d; };
const STYLES = Object.keys(IXR.IXR_ROOMS);
const rbFor = (style) => RB.RB_SITES.find((x) => IXR.IXR_SITE_STYLE[x.id] === style) ?? null;
const build = (style, tier, dressers) => IX.ixBuild(style, { three: THREE, tier, site: IXR.ixrSiteFor(rbFor(style), null), dressers });
const lights = (room) => { let n = 0; room.group.traverse((o) => { if (o.isLight) n++; }); return n; };
const B = U.HD4_ULTRA_BUDGET;
let inBudget = 0, inUltra = 0, withHd = 0;
console.log("  room                 before (high, lit): meshes  tris  ->  with HD robots: meshes  tris  robots  | Ultra + HD: meshes  tris");
for (const st of STYLES) {
  const a = build(st, "high", roomsWith({ rhd: false })), b = build(st, "high", roomsWith({ rhd: true })), u = build(st, "high", roomsWith({ rhd: true, ultra: true }));
  const ma = IXR.ixrMeasure(a), mb = IXR.ixrMeasure(b), mu = IXR.ixrMeasure(u), n = b.rhd?.robots?.length ?? 0;
  if (n) withHd++;
  const ok = mb.meshes <= IX.IX_BUDGET.meshes && mb.triangles <= IX.IX_BUDGET.triangles.high && lights(b) <= IX.IX_BUDGET.lights.high;
  const okU = mu.meshes <= B.roomMeshesTotal && mu.triangles <= B.roomTrianglesTotal && lights(u) <= B.roomLightsTotal;
  if (ok) inBudget++; if (okU) inUltra++;
  console.log(`  ${st.padEnd(20)} ${String(ma.meshes).padStart(22)} ${String(ma.triangles).padStart(5)}  -> ${String(mb.meshes).padStart(21)} ${String(mb.triangles).padStart(5)} ${String(n).padStart(7)}  | ${String(mu.meshes).padStart(17)} ${String(mu.triangles).padStart(5)}`);
  if (n) {
    const spec = RHD.RHD_ROOM_ROBOTS[st], left = [];
    b.group.traverse((o) => { if (o.isInstancedMesh && o.userData.ixrTags) left.push(...o.userData.ixrTags.filter((t) => spec.strip.some(([tag]) => tag === t))); });
    const strippedOk = st === "ixr-cobot-lab" ? left.every((t) => t === "second cobot cell") && left.length >= 1 : left.length === 0;
    check(strippedOk && b.rhd.dropped > 0, `${st}: the HD robots replace ROBO-INTERIORS' blocky robot (${b.rhd.dropped} parts dropped${st === "ixr-cobot-lab" ? `, the second cell's bench kept` : ""})`);
  }
}
check(inBudget === STYLES.length, `robot rooms inside IX_BUDGET with the HD robots (${IX.IX_BUDGET.meshes} meshes, ${IX.IX_BUDGET.triangles.high} tris, ${IX.IX_BUDGET.lights.high} lights): ${inBudget} of ${STYLES.length} (${withHd} carry HD robots)`);
check(inUltra === STYLES.length, `with Ultra too, inside HD4_ULTRA_BUDGET (${B.roomMeshesTotal} meshes, ${B.roomTrianglesTotal} tris): ${inUltra} of ${STYLES.length}`);
let roomSame = 0, roomN = 0;
for (const st of STYLES) for (const [tier, ua] of [["balanced", DESK], ["low", DESK], ["high", QUEST]]) {
  roomN++;
  const a = IXR.ixrMeasure(build(st, tier, roomsWith({ rhd: false, ua }))), b = IXR.ixrMeasure(build(st, tier, roomsWith({ rhd: true, ua })));
  if (a.meshes === b.meshes && a.triangles === b.triangles && a.instances === b.instances && a.textureBytes === b.textureBytes) roomSame++;
}
check(roomSame === roomN, `balanced, phone and headset rooms identical with the HD dresser registered: ${roomSame} of ${roomN}`);
const lit = build("ixr-amr-warehouse", "high", roomsWith({ rhd: true }));
const L1 = RHD.rhdRoomLights(lit, { mode: "stop", estopped: false, locked: false }), L2 = RHD.rhdRoomLights(lit, null);
const bay = build("ixr-maint-bay", "high", roomsWith({ rhd: true })), L3 = RHD.rhdRoomLights(bay, { mode: "full", estopped: false, locked: false });
check(L1.every((x) => x === "protective-stop") && L2.every((x) => x === null) && L3.every((x) => x === null), "room robots show their site's state, dark with none, and the locked-out robots on the stand and the lift stay dark");

// ------------------------------------------------------------------------------- 5b. the floor zone indoors (ROBOTS-HD-2)
console.log("5b. the floor zone indoors: a walk past every robot");
{
  const live = { mode: "full", estopped: false, locked: false };
  let steps = 0, okSteps = 0, robotsN = 0, robotsShown = 0, darkOk = 0, darkN = 0, onFloor = 0, zoned = 0;
  const lines = [];
  for (const st of Object.keys(RHD.RHD_ROOM_ROBOTS)) {
    const room = build(st, "high", roomsWith({ rhd: true }));
    const rs = room.rhd.robots, withZone = rs.filter((q) => q.robot.zone);
    for (const q of rs) { if (q.robot.zone) { zoned++; const wp = new THREE.Vector3(); q.robot.zone.getWorldPosition(wp); if (Math.abs(wp.y) < 1e-6) onFloor++; } else if (q.light === "site") zoned = -999; }
    const start = { x: room.door.x, z: room.door.z - 0.8, yaw: 0, pitch: 0 };
    const seenIn = new Map(withZone.map((q) => [q, false]));
    // The learner walks from the door to a point beside each robot (the first walkable one of a few offsets), and back.
    const rec = (rm, pose, input, dt) => {
      const p = IX.ixWalk(rm, pose, input, dt);
      RHD.rhdRoomLights(room, live, p);
      for (const q of withZone) {
        const d = Math.hypot(p.x - q.x, p.z - q.z), want = ENV.rbSsmMode(d).mode !== "full";
        steps++; if (q.robot.zone.visible === want) okSteps++;
        if (want && q.robot.zone.visible) seenIn.set(q, true);
      }
      RHD.rhdRoomLights(room, null, p); darkN++; if (withZone.every((q) => !q.robot.zone.visible)) darkOk++; // the site on another map: dark
      RHD.rhdRoomLights(room, live, p);
      return p;
    };
    let from = start;
    for (const q of withZone) {
      let reached = null;
      for (const [ox, oz] of [[0, 1.6], [1.6, 0], [-1.6, 0], [0, 2.4], [2.2, 1.6], [-2.2, 1.6], [0, -1.8]]) {
        const r = IXR.ixrWalkTo(room, from, { x: q.x + ox, z: q.z + oz }, rec);
        if (r.ok) { reached = r.pose; break; }
      }
      if (reached) from = reached;
      robotsN++; if (seenIn.get(q)) robotsShown++;
      lines.push(`${st.replace("ixr-", "")}/${q.kind}${seenIn.get(q) ? "" : " (never inside)"}`);
    }
    IXR.ixrWalkTo(room, from, start, rec);
  }
  check(zoned > 0 && onFloor === zoned, `every room robot that shows its site's state has a floor zone on the room floor (benches lift the robot, not the zone): ${onFloor} of ${zoned}; the maintenance bay's locked-out robots have none`);
  check(steps > 0 && okSteps === steps && robotsShown === robotsN, `walking from the door past each robot (ixrWalkTo): the zone shows exactly inside the warning distance ${okSteps} of ${steps} robot-steps; inside it at least once for ${robotsShown} of ${robotsN} robots (${lines.join(", ")})`);
  check(darkN > 0 && darkOk === darkN, `with no site state (the site on another map) every zone stays dark: ${darkOk} of ${darkN} steps`);
}

// --------------------------------------------------------------------------------------------------------- 6. wiring
console.log("6. wiring");
const app = readFileSync(join(WEBXR, "parishes/js/app.js"), "utf8"), bundler = readFileSync(join(ROOT, "tools/bundle_webxr.py"), "utf8");
check(/import \{ rhdMountRobots, rhdRegisterDressers, rhdRoomLights \} from "\.\.\/\.\.\/shared\/rhd-robots-hd\.js"/.test(app), "the parishes app imports the module");
check(/jobs: \{ state: \(\) => window\.__parishTest\.vbridge\?\.state\?\.\(\) \?\? null \}/.test(app) && /run: job && job\.phase === "TRANSACTION" && frames\.length \? \{ step: fi, of: frames\.length, action: frames\[fi\]\?\.info\?\.governor/.test(readFileSync(join(WEBXR, "shared/vb-panel.js"), "utf8")), "the app hands the agent-jobs panel's state to the HD robots, and the panel reports its live run's step and governor decision");
check(/rhdMountRobots\(\{ THREE, robotics: rbWorld, tier: npTierName/.test(app) && app.indexOf("rhdMountRobots(") > app.indexOf("var rbWorld = rbMountRobotics("), "the app mounts the HD robots on the robotics sites, after them, with the page's tier");
check(/rbWorld\?\.animate\(dt, np\.x, np\.z\);\n\s*rhdWorld\?\.tick\(dt, np\.x, np\.z\);/.test(app), "the app ticks the HD robots right after the sites animate (the same learner position)");
check(app.indexOf("rhdRegisterDressers(") > app.indexOf("ixrRegisterDressers(typeof") && app.indexOf("rhdRegisterDressers(") < app.indexOf("hd4RegisterDressers(typeof"), "the room dresser registers after ROBO-INTERIORS' and before ENV-HD-4's");
check(/rhdRoomLights\(ixWorld\.room, rbWorld\?\.state\(ixWorld\.room\.ixr\?\.site\) \?\? null, ixWorld\.pose\)/.test(app), "a room's robots take their site's state and the learner's room-local pose each frame");
check(bundler.indexOf('"rhd-robots-hd.js"') > bundler.indexOf('SHARED / "ixr-robo-interiors.js"') && bundler.indexOf('"rhd-robots-hd.js"') > bundler.indexOf('SHARED / "rb-world.js"'), "the bundler lists the module after rb-world.js and ixr-robo-interiors.js");

console.log(`check_robots_hd: ${passes} passed, ${failures} failed`);
process.exit(failures ? 1 : 0);
