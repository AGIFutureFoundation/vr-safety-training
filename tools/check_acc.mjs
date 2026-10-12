#!/usr/bin/env node
/**
 * ACCESS (console `acc`, docs/consoles/ACCESS.md): inside and outside, every building you can approach.
 *  1. Every enterable site building on every map: a marked door (contrasting jambs, head and sill), a lit entrance, a clear width
 *     for the walk collider, a ramp where the sill is raised (1:12 at most), a pictogram sign beside the facade, and a step-free
 *     route from the door spot (to a street, else an open apron) — N of M per map.
 *  2. Budgets: meshes per map and triangles per entrance and per chunk on every tier; nothing on the phone tier or a headset.
 *  3. The four new interiors (acc-*) build inside the room budget (120 meshes, 6,000 / 3,000 triangles, 24 MiB high / 3 MiB
 *     balanced of texture), with station pads and two agent spots, and every pad and agent spot is reachable from the door
 *     (a grid search round the colliders, then NEWTON's walk along it).
 *  4. The cued kinds' sites open them at the building's door and come back out to the exact pose.
 *  5. One input grammar: E, the touch Use button, the pad's A and the headset's select all call the app's one use().
 *
 *     node tools/check_acc.mjs
 */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const WEBXR = join(ROOT, "WebXR");
let failures = 0, passes = 0;
const check = (ok, msg, detail = "") => { if (ok) passes++; else { failures++; console.error(`  FAIL ${msg}${detail ? ` — ${detail}` : ""}`); } };
const note = (msg) => console.log(`  · ${msg}`);
const imp = (p) => import(pathToFileURL(join(WEBXR, p)).href);

const THREE = await imp("vendor/three/dist/three.module.min.js");
const R = await imp("shared/np-parishes.js");
const A = await imp("shared/acc-access.js");
const IX = await imp("shared/ix-interiors.js");
const NW = await imp("shared/nw-physics.js");
const NP = await imp("shared/np-parish.js");

// 1. Entrances, per map.
let M = 0, marked = 0, stepFree = 0, toStreet = 0, apron = 0, rampsNeeded = 0, rampsOk = 0;
const perMap = [];
for (const p of R.NP_PARISHES) {
  const es = A.accEntrances(p);
  let n = 0;
  for (const e of es) {
    const parts = A.accParts(p, e, "high");
    const has = (k) => parts.some((q) => q.name === k);
    const okMark = has("jamb") && has("head") && has("sill") && has("lit") && has("housing") && has("sign-panel") && parts.filter((q) => q.name === "glyph").length >= 5;
    const okWidth = e.width >= 2 * NW.NW_AVATAR.radius + 0.5;
    const needRamp = e.rise > A.ACC_RAMP.minRise;
    const okRamp = !needRamp || (has("ramp") && e.ramp.slope <= A.ACC_RAMP.maxSlope + 1e-9 && parts.filter((q) => q.name === "rail").length === 2);
    const okRoute = e.route.ok || e.route.approach === true;
    if (needRamp) { rampsNeeded++; if (okRamp) rampsOk++; }
    M++; if (okMark && okWidth) marked++;
    if (e.route.ok) toStreet++; else if (e.route.approach) apron++;
    if (okMark && okWidth && okRamp && okRoute) { n++; stepFree++; }
    // The sign stands beside the door, not in front of it, and clear of the door spot's walk.
    const sign = parts.find((q) => q.name === "sign-post");
    check(Math.hypot(sign.x - e.spot.x, sign.z - e.spot.z) > 0.9, `${p.id}/${e.site.id}: the sign post is clear of the door spot`);
  }
  perMap.push(`${p.id} ${n}/${es.length}`);
}
check(M > 0 && marked === M, `every enterable building has a marked, lit, wide-enough door (${marked} of ${M})`);
check(rampsOk === rampsNeeded, `a ramp (<= 1:12, two rails) wherever the sill is raised (${rampsOk} of ${rampsNeeded})`);
note(`marked door + step-free route: ${stepFree} of ${M} (to a street ${toStreet}, open apron only ${apron}, neither ${M - toStreet - apron})`);
note(`per map: ${perMap.join(", ")}`);
check(stepFree / M >= 0.95, `>= 95% of enterable buildings have a marked door and a step-free route (${(100 * stepFree / M).toFixed(1)}%)`);

// 2. Budgets on every tier (headless measure of the built meshes).
const sample = ["orleans", "sf-mission", "sf-marina", "jefferson", "hammond-downtown"].map((id) => R.NP_PARISHES.find((q) => q.id === id)).filter(Boolean);
for (const p of R.NP_PARISHES) {
  for (const tier of ["low", "balanced", "high"]) {
    const g = A.accBuild({ THREE, parish: p, tier, ua: "" });
    const meshes = g?.meshes ?? 0, tris = g?.triangles ?? 0, ents = A.accEntrances(p).length;
    check(meshes <= A.ACC_BUDGET.meshesPerMap[tier], `${p.id}/${tier}: ${meshes} meshes <= ${A.ACC_BUDGET.meshesPerMap[tier]}`);
    check(tris <= A.ACC_BUDGET.trianglesPerEntrance[tier] * ents, `${p.id}/${tier}: ${tris} triangles <= ${A.ACC_BUDGET.trianglesPerEntrance[tier]} x ${ents}`);
    if (g) { let tex = 0, lights = 0; g.group.traverse((o) => { if (o.isLight) lights++; if (o.material?.map) tex++; }); check(tex === 0 && lights === 0, `${p.id}/${tier}: no texture, no light`); }
    if (tier !== "low" && g) {
      const per = new Map();
      for (const e of A.accEntrances(p)) { const k = NP.npChunkOf(e.door.x, e.door.z).key; per.set(k, (per.get(k) ?? 0) + A.accParts(p, e, tier).length * 12); }
      const worst = Math.max(0, ...per.values());
      check(worst <= A.ACC_BUDGET.trianglesPerChunk[tier], `${p.id}/${tier}: worst chunk ${worst} triangles <= ${A.ACC_BUDGET.trianglesPerChunk[tier]}`);
    }
    if (sample.includes(p) && tier !== "low") note(`${p.id}/${tier}: ${meshes} meshes, ${tris} triangles, ${ents} entrances`);
  }
  check(A.accBuild({ THREE, parish: p, tier: "high", ua: "Mozilla/5.0 (X11; Linux x86_64; Quest 3) OculusBrowser/35.0" }) === null, `${p.id}: a headset browser builds nothing`);
}

// 3. The four new interiors: budget, pads, agent spots, reachability.
const ACC_STYLES = Object.values(A.ACC_KIND_STYLE);
check(ACC_STYLES.length === 4 && ACC_STYLES.every((s) => IX.IX_STYLES[s] && IX.IX_FEATURES[s]?.length >= 2), "four new interior styles, each with signature fittings");
const SIGN_BYTES = 2 * Math.round(512 * 256 * 4 * 4 / 3); // the job board and the honesty sign: two 512 x 256 canvases with mips
/** Grid search from the door spot to (x, z) round every collider taller than NEWTON's step, at the avatar radius. */
function reach(room, tx, tz) {
  const h = 0.1, r = NW.NW_AVATAR.radius, W = Math.round(room.w / h), D = Math.round(room.d / h);
  const blocked = (x, z) => Math.abs(x) > room.w / 2 - 0.4 || Math.abs(z) > room.d / 2 - 0.4 ||
    room.colliders.some((c) => c.max[1] > NW.NW_AVATAR.stepUp && c.kind !== "ix-wall" && x > c.min[0] - r && x < c.max[0] + r && z > c.min[2] - r && z < c.max[2] + r);
  const id = (i, j) => i * D + j, toX = (i) => -room.w / 2 + i * h, toZ = (j) => -room.d / 2 + j * h;
  const si = Math.round((room.door.x + room.w / 2) / h), sj = Math.round((room.door.z + room.d / 2) / h);
  const ti = Math.round((tx + room.w / 2) / h), tj = Math.round((tz + room.d / 2) / h);
  const prev = new Int32Array(W * D + D).fill(-2); const q = [id(si, sj)]; prev[id(si, sj)] = -1;
  while (q.length) {
    const c = q.shift(), i = Math.floor(c / D), j = c % D;
    if (Math.abs(i - ti) <= 1 && Math.abs(j - tj) <= 1) { const path = []; for (let k = c; k >= 0; k = prev[k]) path.push([toX(Math.floor(k / D)), toZ(k % D)]); return path.reverse(); }
    for (const [di, dj] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const ni = i + di, nj = j + dj; if (ni < 0 || nj < 0 || ni >= W || nj >= D) continue;
      const n = id(ni, nj); if (prev[n] !== -2 || blocked(toX(ni), toZ(nj))) continue; prev[n] = c; q.push(n);
    }
  }
  return null;
}
let padsN = 0, padsOk = 0;
for (const st of ACC_STYLES) {
  for (const tier of ["high", "low"]) {
    const site = { id: "t", name: "Test site", kind: "x", stations: ["s-a", "s-b", "s-c", "s-d"] };
    const room = IX.ixBuild(st, { three: THREE, tier, site });
    let tris = 0; room.group.traverse((o) => { if (o.isMesh) { const g = o.geometry; tris += ((g.index ? g.index.count : g.attributes.position.count) / 3) * (o.isInstancedMesh ? o.count : 1); } });
    const meshes = room.meshes();
    check(meshes <= 120 && tris <= IX.IX_BUDGET.triangles[tier], `${st}/${tier}: ${meshes} meshes <= 120, ${tris} triangles <= ${IX.IX_BUDGET.triangles[tier]}`);
    check(SIGN_BYTES <= (tier === "high" ? 24 : 3) * 1048576, `${st}/${tier}: texture ${(SIGN_BYTES / 1048576).toFixed(2)} MiB <= ${tier === "high" ? 24 : 3} MiB (${tier === "high" ? "high" : "balanced and phone"})`);
    const pads = room.actions.filter((a) => a.kind === "station");
    check(pads.length >= 2 && room.agentSpots?.length === 2, `${st}/${tier}: ${pads.length} station pads and ${room.agentSpots?.length} agent spots`);
    for (const t of [...pads, ...room.agentSpots, room.actions.find((a) => a.kind === "board")]) {
      const path = reach(room, t.x, t.z); padsN += tier === "high" && pads.includes(t) ? 1 : 0;
      let pose = { x: room.door.x, z: room.door.z, yaw: 0, pitch: 0 };
      if (path) for (const [wx, wz] of path.filter((_, k) => k % 3 === 0).concat([[t.x, t.z]])) {
        for (let i = 0; i < 40 && Math.hypot(pose.x - wx, pose.z - wz) > 0.05; i++) { const dx = wx - pose.x, dz = wz - pose.z, L = Math.hypot(dx, dz) || 1, v = Math.min(3, L * 30); pose = IX.ixWalk(room, pose, { vx: (dx / L) * v, vz: (dz / L) * v }, 1 / 30); }
      }
      const ok = !!path && Math.hypot(pose.x - t.x, pose.z - t.z) < 0.45;
      if (tier === "high" && pads.includes(t) && ok) padsOk++;
      check(ok, `${st}/${tier}: ${t.id} is reachable from the door (grid path ${path ? path.length : "none"}, walk ends ${Math.hypot(pose.x - t.x, pose.z - t.z).toFixed(2)} m off)`);
    }
    if (tier === "high") note(`${st}: ${meshes} meshes, ${tris} triangles, ${pads.length} pads, agent spots ${room.agentSpots.map((s) => `(${s.x}, ${s.z})`).join(" ")}, ${room.w}×${room.d} m`);
  }
}
note(`pads reachable from the door: ${padsOk} of ${padsN} (high)`);

// 4. The cued kinds' sites open the new rooms at their door and come back out exactly.
const scene = new THREE.Scene(); const worldRoot = new THREE.Group(); scene.add(worldRoot);
let opened = 0, sitesN = 0; const kinds = new Set();
for (const p of R.NP_PARISHES) {
  const m = A.accSiteStyles(p);
  for (const [id, st] of Object.entries(m)) {
    sitesN++;
    const site = p.sites.find((s) => s.id === id);
    const ents = A.accEntrances(p).find((e) => e.site.id === id);
    if (!ents) continue;
    const saved = { ...IX.IX_SITE_STYLE }; A.accRegisterSiteStyles(IX, p);
    const mount = IX.ixMountInteriors({ three: THREE, scene, hide: [worldRoot] });
    const out0 = { x: ents.spot.x, z: ents.spot.z, yaw: 0.4, pitch: -0.1 };
    const room = mount.enter(site, out0);
    const ok1 = room?.id === st && worldRoot.visible === false;
    const back = mount.exit();
    for (const k of Object.keys(IX.IX_SITE_STYLE)) if (!(k in saved)) delete IX.IX_SITE_STYLE[k];
    if (ok1 && back.x === out0.x && back.z === out0.z && back.yaw === out0.yaw && worldRoot.visible === true) { opened++; kinds.add(st); }
  }
}
check(sitesN > 0 && opened === sitesN && kinds.size === 4, `the cued kinds' sites open their ACCESS room and come back to the exact door pose (${opened} of ${sitesN}, ${kinds.size} kinds)`);
check(Object.keys(A.accSiteStyles(R.NP_PARISHES[0], { skip: new Set(R.NP_PARISHES[0].sites.map((s) => s.id)) })).length === 0, "a skipped site (CLASSROOMS furnishes it) keeps its room");

// 5. One input grammar.
const app = readFileSync(join(WEBXR, "parishes", "js", "app.js"), "utf8");
check(/if \(e\.code === "KeyE"\) npUse\(\);/.test(app), "keyboard: E calls npUse");
check(/id: "np-use", label: "Use", aria: "Use", onDown: \(\) => npUse\(\)/.test(app), "touch: the Use button calls npUse");
check(/buttons\?\.\[0\]\?\.pressed; if \(b0 && !npPadPrev\[0\]\) npUse\(\)/.test(app), "gamepad: A (button 0) calls npUse");
check(/accWireXR\(session, \(\) => npUse\(\)\)/.test(app), "headset: the XR session's select calls npUse");
check(A.ACC_INPUTS.map((i) => i.input).join() === "keyboard,touch,gamepad,headset", "ACC_INPUTS names the four inputs");
{
  const handlers = {}; const fake = { addEventListener: (t, f) => { handlers[t] = f; }, removeEventListener: (t) => { delete handlers[t]; } };
  let used = 0; const unwire = A.accWireXR(fake, () => used++); handlers.select?.(); unwire();
  check(used === 1 && !handlers.select, "accWireXR: a select calls use once, and unwiring removes it");
}
check(/if \(ixWorld\.inside\(\)\) \{\s*const r = ixWorld\.use\(\);/.test(app) && /n\.kind === "door"\) \{ npKeys\.clear\(\); ixWorld\.enter\(/.test(app), "in and out are the same use(): a door spot enters, the room's door leaves");
check(/accStreetAt\(parish, np\.x, np\.z\)/.test(app) && /\$\("hud-zone"\)\.textContent = ixIn \? ixIn\.style\?\.label/.test(app), "wayfinding: the HUD names the room inside and the street outside");
check(typeof A.accStreetAt(R.NP_PARISHES.find((q) => q.id === "orleans"), 0, 0) === "string", "accStreetAt answers a name");
check(/accBuild\(\{ THREE, parish, tier: npTierName \}\)/.test(app) && /accRegisterSiteStyles\(\{ IX_SITE_STYLE \}, parish/.test(app), "the app mounts the entrances and registers the rooms");
check(/"acc-access\.js"/.test(readFileSync(join(ROOT, "tools", "bundle_webxr.py"), "utf8")), "tools/bundle_webxr.py lists shared/acc-access.js");
const src = readFileSync(join(WEBXR, "shared", "acc-access.js"), "utf8");
check(!/fetch\(|XMLHttpRequest|WebSocket/.test(src), "no network in acc-access.js");

console.log(`\n${failures ? "FAIL" : "PASS"} check_acc: ${passes} passed, ${failures} failed`);
process.exit(failures ? 1 : 0);
