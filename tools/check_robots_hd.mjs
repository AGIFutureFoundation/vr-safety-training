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
 *   4. Motion: the arm's joints eased (zero speed at each key pose, no jump between frames); the AMR's wheels turn by the
 *      distance it travels and hold still when it stops.
 *   5. Rooms: the robot rooms with the HD robots (and ENV-HD-4's lighting, with and without Ultra) inside IX_BUDGET /
 *      HD4_ULTRA_BUDGET N of 6; the replaced parts are gone; balanced / phone / headset rooms identical to before.
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
for (const kind of [...RHD.RHD_KINDS, "cell-arm"]) {
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

// --------------------------------------------------------------------------------------------------------- 6. wiring
console.log("6. wiring");
const app = readFileSync(join(WEBXR, "parishes/js/app.js"), "utf8"), bundler = readFileSync(join(ROOT, "tools/bundle_webxr.py"), "utf8");
check(/import \{ rhdMountRobots, rhdRegisterDressers, rhdRoomLights \} from "\.\.\/\.\.\/shared\/rhd-robots-hd\.js"/.test(app), "the parishes app imports the module");
check(/rhdMountRobots\(\{ THREE, robotics: rbWorld, tier: npTierName/.test(app) && app.indexOf("rhdMountRobots(") > app.indexOf("var rbWorld = rbMountRobotics("), "the app mounts the HD robots on the robotics sites, after them, with the page's tier");
check(/rbWorld\?\.animate\(dt, np\.x, np\.z\);\n\s*rhdWorld\?\.tick\(dt, np\.x, np\.z\);/.test(app), "the app ticks the HD robots right after the sites animate (the same learner position)");
check(app.indexOf("rhdRegisterDressers(") > app.indexOf("ixrRegisterDressers(typeof") && app.indexOf("rhdRegisterDressers(") < app.indexOf("hd4RegisterDressers(typeof"), "the room dresser registers after ROBO-INTERIORS' and before ENV-HD-4's");
check(/rhdRoomLights\(ixWorld\.room, rbWorld\?\.state\(ixWorld\.room\.ixr\?\.site\)/.test(app), "a room's robots take their site's state each frame");
check(bundler.indexOf('"rhd-robots-hd.js"') > bundler.indexOf('SHARED / "ixr-robo-interiors.js"') && bundler.indexOf('"rhd-robots-hd.js"') > bundler.indexOf('SHARED / "rb-world.js"'), "the bundler lists the module after rb-world.js and ixr-robo-interiors.js");

console.log(`check_robots_hd: ${passes} passed, ${failures} failed`);
process.exit(failures ? 1 : 0);
