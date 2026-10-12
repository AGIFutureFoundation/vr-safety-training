#!/usr/bin/env node
/**
 * ROBOTS-HD (docs/consoles/ROBOTS-HD.md): the page-level proof in the BUILT parishes page (not in the gate).
 *
 *   A. Desktop high tier, one map per rig kind (sf-downtown: cell; oak-west-oakland: gantry and AMR; bay-san-jose: cobot):
 *      each robot framed close at 1920 × 1080; the renderer measured on that view with today's rig shown and the HD robot
 *      hidden (before) and the other way round (after), in one task; the status light running (green) with the learner
 *      outside the warning distance, then a protective stop (amber) with the learner inside the stop distance and the floor
 *      zone shown, then an e-stop pressed through the site's own act() (red) and reset; every light compared with the
 *      site's state through rhdLightState's rule. The AMR's wheels turn while it drives.
 *   B. The six robot rooms (signed in, so the Omega Hive's agents stand in the rooms they belong to), each opened with
 *      __parishTest.ixScene on the high tier: meshes, draw calls, triangles drawn, agents placed, HD robots — inside
 *      IX_BUDGET (and HD4_ULTRA_BUDGET's 8,500 triangles when Ultra is on).
 *   C. Balanced: no HD robot is built and today's rigs draw as before.
 *   Page errors and off-host requests are counted throughout.
 *
 *     python3 tools/bundle_webxr.py parishes && node tools/drive_robots_hd.mjs [port] [outDir] [ultra]
 */
import { pathToFileURL, fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { mkdirSync } from "node:fs";
const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const imp = (f) => import(pathToFileURL(join(ROOT, f)).href);
const { pvServe, pvLaunch, pvContext, pvLoad } = await imp("tools/lib/pv_browser.mjs");
const { RB_SITES } = await imp("WebXR/shared/rb-robotics-data.js");
const { IX_BUDGET } = await imp("WebXR/shared/ix-interiors.js");

const port = Number(process.argv[2]) || 9144, outDir = process.argv[3] || null, ultra = process.argv[4] === "ultra", only = process.env.RHD_ONLY || null; // RHD_ONLY=still: the amber still alone
if (outDir) mkdirSync(outDir, { recursive: true });
const { base, close } = await pvServe(port);
const browser = await pvLaunch();
const out = { pageErrors: [], offHost: [], failed: 0, lines: 0 };
const say = (ok, msg) => { out.lines++; if (!ok) out.failed++; console.log(`${ok ? "ok  " : "FAIL"} ${msg}`); };
console.log(`drive_robots_hd: port ${port}, load ${pvLoad()}${ultra ? ", Ultra on" : ""}`);

async function openPage(parish, tier, { auth = false } = {}) {
  const context = await pvContext(browser, { viewport: { width: 1920, height: 1080 } });
  if (auth) await context.addInitScript(() => { try { localStorage.setItem("vr-training-auth-v1", JSON.stringify({ id: "learner-rhd-drive" })); } catch (_) { /* storage blocked */ } });
  const page = await context.newPage();
  page.on("pageerror", (e) => out.pageErrors.push(e.message));
  page.on("request", (r) => { const u = r.url(); if (u.startsWith("http://127.0.0.1") || u.startsWith("data:") || u.startsWith("blob:")) return; if (/cdnjs\.cloudflare\.com\/ajax\/libs\/three\.js\//.test(u)) return; /* the import map's three.js URL, as drive_exteriors_page.mjs exempts it */ out.offHost.push(u); });
  await page.goto(`${base}/parishes/dist/parishes.html?parish=${parish}&tier=${tier}${ultra ? "&ultra=1" : ""}`, { waitUntil: "load", timeout: 180000 });
  await page.waitForFunction(() => !!window.__parishTest?.robotics && "robotsHd" in window.__parishTest, null, { timeout: 180000 });
  await page.evaluate(() => { window.__parishTest.setTime?.(1); const m = document.getElementById("menu"); if (m) m.hidden = true; window.__parishTest.np.playing = true; window.__parishTest.np.modal = null; });
  return { page, context };
}
const frames = (page, n) => page.evaluate((n) => new Promise((res) => { let k = 0; const f = () => (++k >= n ? res() : requestAnimationFrame(f)); requestAnimationFrame(f); }), n);

/** Stand the learner `dc` metres from the SITE CENTRE (the speed-and-separation distance), on the line from the centre through
 *  the robot (an AMR is out on its loop, the gantry off centre), looking at the robot. */
const standAt = (page, id, dc, pitch) => page.evaluate(([id, dc, pitch]) => {
  const T = window.__parishTest, s = T.robotics.sites.find((x) => x.id === id), rig = T.robotics.rigNode(id);
  const p = rig.getWorldPosition(new rig.position.constructor());
  const cx = s.position[0], cz = s.position[1];
  let ox = p.x - cx, oz = p.z - cz; const L = Math.hypot(ox, oz);
  if (L < 0.5) { ox = 0.55; oz = 0.83; } else { ox /= L; oz /= L; }
  const lx = cx + ox * dc, lz = cz + oz * dc;
  let tx = p.x, tz = p.z; if (Math.hypot(lx - tx, lz - tz) < 0.8) { tx = cx; tz = cz; }
  const yaw = Math.atan2(lx - tx, lz - tz);
  T.teleport(lx, lz, yaw, pitch);
  return { at: [+lx.toFixed(2), +lz.toFixed(2)], dist: +Math.hypot(lx - cx, lz - cz).toFixed(2), robotFromCentre: +L.toFixed(2) };
}, [id, dc, pitch]);
const robotOffset = (page, id) => page.evaluate((id) => { const T = window.__parishTest, s = T.robotics.sites.find((x) => x.id === id), rig = T.robotics.rigNode(id), p = rig.getWorldPosition(new rig.position.constructor()); return Math.hypot(p.x - s.position[0], p.z - s.position[1]); }, id);

const rule = (st) => (!st ? null : st.estopped || st.locked ? "e-stop" : st.mode === "stop" ? "protective-stop" : "running");

// ------------------------------------------------------------------------------------------------ A. the robots outdoors
const perRobot = [];
for (const parish of only ? [] : ["sf-downtown", "oak-west-oakland", "bay-san-jose"]) {
  const { page, context } = await openPage(parish, "high");
  const hd = await page.evaluate(() => window.__parishTest.robotsHd?.measure?.() ?? null);
  say(hd && hd.robots.length === RB_SITES.filter((s) => s.parish === parish).length, `${parish}: HD robots built on high: ${hd?.robots.map((r) => `${r.kind} ${r.meshes} meshes / ${r.triangles} tris`).join(", ")}`);
  for (const r of hd?.robots ?? []) {
    const far = Math.max(r.kind === "gantry" ? 11 : 7.5, (await robotOffset(page, r.id)) + 3.2), near = 2.2;
    // running: the learner outside the warning distance
    const pos = await standAt(page, r.id, far, r.kind === "gantry" ? 0.12 : -0.18);
    await frames(page, 30);
    const run = await page.evaluate((id) => ({ light: window.__parishTest.robotsHd.light(id), st: window.__parishTest.robotics.state(id), zone: window.__parishTest.robotsHd.measure().robots.find((x) => x.id === id).zone }), r.id);
    say(run.light === "running" && run.light === rule(run.st) && !run.zone, `${r.id} (${r.kind}) at ${pos.dist} m: light ${run.light}, site mode ${run.st.mode}, zone ${run.zone ? "shown" : "hidden"}`);
    // before -> after on this view, in one task
    const cost = await page.evaluate((id) => {
      const T = window.__parishTest, R = T.robotsHd.robots.find((x) => x.id === id), ren = T.npRenderer;
      const ground = R.site.getObjectByName(`rhd-ground-${id}`), rigMeshes = R.rig.children.filter((m) => m.isMesh), fence = R.site.getObjectByName("rb-cell-fence");
      const m = () => { ren.info.autoReset = true; ren.render(T.threeScene, T.camera); return { calls: ren.info.render.calls, triangles: ren.info.render.triangles }; };
      const setHd = (on) => { R.robot.group.visible = on; ground.visible = on; for (const x of rigMeshes) x.visible = !on; if (fence) fence.visible = !on; };
      setHd(false); const before = m(); setHd(true); const after = m();
      return { before, after };
    }, r.id);
    perRobot.push({ id: r.id, kind: r.kind, before: cost.before, after: cost.after, meshes: r.meshes, triangles: r.triangles });
    say(cost.after.calls >= cost.before.calls && cost.after.triangles > cost.before.triangles, `${r.id}: on this view draw calls ${cost.before.calls} -> ${cost.after.calls}, triangles ${cost.before.triangles} -> ${cost.after.triangles}`);
    if (outDir) await page.screenshot({ path: join(outDir, `${r.kind}-running.png`) });
    // the AMR's wheels turn with its travel
    if (r.kind === "amr") {
      const a0 = await page.evaluate((id) => window.__parishTest.robotsHd.robots.find((x) => x.id === id).robot.links.wheels.rotation.x, r.id);
      await frames(page, 20);
      const a1 = await page.evaluate((id) => window.__parishTest.robotsHd.robots.find((x) => x.id === id).robot.links.wheels.rotation.x, r.id);
      say(Math.abs(a1 - a0) > 1e-3, `${r.id}: the drive wheels turn while it drives (${a0.toFixed(3)} -> ${a1.toFixed(3)} rad)`);
    }
    // protective stop: the learner inside the stop distance
    const pn = await standAt(page, r.id, near, r.kind === "gantry" ? 0.35 : -0.42);
    await frames(page, 20);
    const stop = await page.evaluate((id) => ({ light: window.__parishTest.robotsHd.light(id), st: window.__parishTest.robotics.state(id), zone: window.__parishTest.robotsHd.measure().robots.find((x) => x.id === id).zone }), r.id);
    say(stop.light === "protective-stop" && stop.light === rule(stop.st) && stop.zone, `${r.id} at ${pn.dist} m from the centre: light ${stop.light}, site mode ${stop.st.mode}, zone ${stop.zone ? "shown" : "hidden"}`);
    if (outDir) await page.screenshot({ path: join(outDir, `${r.kind}-protective-stop-close.png`) });
    // e-stop: pressed through the site's own act(), then reset
    await standAt(page, r.id, far, r.kind === "gantry" ? 0.12 : -0.18);
    await page.evaluate((id) => window.__parishTest.robotics.act(id, "press-estop"), r.id);
    await frames(page, 6);
    const es = await page.evaluate((id) => ({ light: window.__parishTest.robotsHd.light(id), st: window.__parishTest.robotics.state(id) }), r.id);
    say(es.light === "e-stop" && es.light === rule(es.st), `${r.id}: e-stop pressed -> light ${es.light} (estopped ${es.st.estopped})`);
    if (outDir) await page.screenshot({ path: join(outDir, `${r.kind}-estop.png`) });
    await page.evaluate((id) => window.__parishTest.robotics.act(id, "restart"), r.id);
    await frames(page, 6);
    const back = await page.evaluate((id) => window.__parishTest.robotsHd.light(id), r.id);
    say(back === "running", `${r.id}: restarted from outside -> light ${back}`);
  }
  await context.close();
}

// ------------------------------------------------------------------- A2. a protective stop still (amber), from outside
if (outDir) {
  const { page, context } = await openPage("sf-downtown", "high");
  const id = RB_SITES.find((s) => s.parish === "sf-downtown").id;
  // the learner steps inside the stop distance (the robot holds a protective stop), then the camera alone backs out
  await standAt(page, id, 2.2, -0.4); await frames(page, 15);
  await page.screenshot({ path: join(outDir, "cell-protective-stop-inside.png") });
  const st = await page.evaluate((id) => window.__parishTest.robotics.state(id), id);
  // freeze the learner's position for the site (the camera moves; the person the robot sees stays at 2.2 m)
  await page.evaluate((id) => { const T = window.__parishTest, R = T.robotics, s = R.sites.find((x) => x.id === id), A = R.animate, H = T.robotsHd, tk = H.tick; const px = s.position[0] + 0.55 * 2.2, pz = s.position[1] + 0.83 * 2.2; R.animate = (dt) => A(dt, px, pz); H.tick = (dt) => tk(dt, px, pz); }, id);
  await standAt(page, id, 6.8, -0.3); await frames(page, 20);
  const s2 = await page.evaluate((id) => ({ light: window.__parishTest.robotsHd.light(id), zone: window.__parishTest.robotsHd.measure().robots.find((x) => x.id === id).zone }), id);
  say(st.mode === "stop" && s2.light === "protective-stop" && s2.zone, `protective-stop still: site mode ${st.mode}, light ${s2.light}, zone ${s2.zone ? "shown" : "hidden"}`);
  await page.screenshot({ path: join(outDir, "cell-protective-stop.png") });
  if (only) { // the same framing for the other two states (the learner moved back outside the warning distance)
    await page.evaluate((id) => { const T = window.__parishTest, R = T.robotics, s = R.sites.find((x) => x.id === id), A = R.animate, H = T.robotsHd, tk = H.tick; const px = s.position[0] + 0.55 * 9, pz = s.position[1] + 0.83 * 9; R.animate = (dt) => A(dt, px, pz); H.tick = (dt) => tk(dt, px, pz); }, id);
    await frames(page, 20);
    const g = await page.evaluate((id) => window.__parishTest.robotsHd.light(id), id);
    say(g === "running", `cell still, running: light ${g}`); await page.screenshot({ path: join(outDir, "cell-running.png") });
    await page.evaluate((id) => window.__parishTest.robotics.act(id, "press-estop"), id); await frames(page, 8);
    const e = await page.evaluate((id) => window.__parishTest.robotsHd.light(id), id);
    say(e === "e-stop", `cell still, e-stop: light ${e}`); await page.screenshot({ path: join(outDir, "cell-estop.png") });
  }
  await context.close();
}

// ------------------------------------------------------------------------------- B. the six rooms with the hive's agents
if (!only) {
  const { page, context } = await openPage("sf-downtown", "high", { auth: true });
  const styles = await page.evaluate(() => window.__parishTest.roboInteriors.styles);
  let inside = 0;
  for (const st of styles) {
    const r = await page.evaluate(async (style) => {
      const T = window.__parishTest; const s = T.ixScene(style);
      await new Promise((res) => requestAnimationFrame(() => requestAnimationFrame(() => requestAnimationFrame(res))));
      const m = T.roboInteriors.measure(), room = T.interiors?.mount?.room ?? null;
      return { style: s?.style, meshes: m.meshes, calls: m.calls, triangles: m.triangles, built: m.trianglesBuilt, hd: room?.rhd?.robots?.length ?? 0, hdTris: room?.rhd?.triangles ?? 0, agents: T.hiveWorld?.room?.()?.placed?.length ?? 0, hive: !!T.hive };
    }, st);
    const triCap = ultra ? 8500 : IX_BUDGET.triangles.high;
    const ok = r.meshes <= IX_BUDGET.meshes && r.triangles <= triCap && r.built <= triCap;
    if (ok) inside++;
    say(ok, `room ${st}: ${r.meshes} meshes, ${r.calls} draw calls, ${r.triangles} triangles drawn (${r.built} built) <= ${IX_BUDGET.meshes} / ${triCap}; HD robots ${r.hd} (${r.hdTris} tris), hive agents in the room ${r.agents} (hive mounted: ${r.hive})`);
    if (outDir) await page.screenshot({ path: join(outDir, `room-${st}.png`) });
  }
  say(inside === styles.length, `robot rooms inside IX_BUDGET with the HD robots and the hive's agents: ${inside} of ${styles.length}`);
  await context.close();
}

// ------------------------------------------------------------------------------------------------------- C. balanced
if (!only) {
  const { page, context } = await openPage("oak-west-oakland", "balanced");
  const r = await page.evaluate(() => { const T = window.__parishTest; let rhd = 0, rig = 0; T.threeScene.traverse((o) => { if (o.isMesh && /^rhd-/.test(o.name)) rhd++; if (o.isMesh && /^rb-(amr|gantry|arm|cell)/.test(o.name) && o.visible) rig++; }); return { on: T.robotsHd?.on ?? null, rhd, rig }; });
  say(r.on === false && r.rhd === 0 && r.rig > 0, `balanced: HD off (${r.on}), ${r.rhd} HD meshes, today's rig meshes drawn ${r.rig}`);
  await context.close();
}

say(out.pageErrors.length === 0, `page errors ${out.pageErrors.length}${out.pageErrors.length ? `: ${out.pageErrors.slice(0, 3).join(" | ")}` : ""}`);
say(out.offHost.length === 0, `off-host requests ${out.offHost.length}${out.offHost.length ? `: ${[...new Set(out.offHost)].slice(0, 4).join(" ")}` : ""}`);
console.log("per robot (high, the robot's own view): " + perRobot.map((r) => `${r.kind} calls ${r.before.calls}->${r.after.calls} tris ${r.before.triangles}->${r.after.triangles}`).join("; "));
console.log(`drive_robots_hd: ${out.lines - out.failed} ok, ${out.failed} failed`);
await browser.close(); await close();
process.exit(out.failed ? 1 : 0);
