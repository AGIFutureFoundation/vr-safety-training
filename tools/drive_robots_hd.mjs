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
 *   A3. ROBOTS-HD-2: the agent-jobs panel runs the cell's job on sf-downtown, stepped by the drive (reduced motion, so the
 *      panel does not auto-advance); every step's light = the more severe of the site's state and that step's governor
 *      decision; a clean run hands back; the supervisor's E-stop mid-run lights red until the next job.
 *   B2. ROBOTS-HD-2: the drilling deck, cell hall, cobot lab and warehouse, each opened on its own site's map: the floor zone
 *      follows the learner's room-local pose exactly inside the warning distance; stills of the HD drilling robot.
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
const { rbSsmMode } = await imp("WebXR/shared/rb-env.js");

const port = Number(process.argv[2]) || 9144, outDir = process.argv[3] || null, ultra = process.argv[4] === "ultra", only = process.env.RHD_ONLY || null; // RHD_ONLY=still: the cell stills alone; RHD_ONLY=jobs: the agent-jobs run alone; RHD_ONLY=rooms: the rooms alone; RHD_ONLY=zone: the zone indoors alone; RHD_ONLY=outdoor: A and C alone; RHD_ONLY=port: the port control room's carrier alone (ROBOTS-HD-3)
if (outDir) mkdirSync(outDir, { recursive: true });
const { base, close } = await pvServe(port);
const browser = await pvLaunch();
const out = { pageErrors: [], offHost: [], failed: 0, lines: 0 };
const say = (ok, msg) => { out.lines++; if (!ok) out.failed++; console.log(`${ok ? "ok  " : "FAIL"} ${msg}`); };
console.log(`drive_robots_hd: port ${port}, load ${pvLoad()}${ultra ? ", Ultra on" : ""}`);

async function openPage(parish, tier, { auth = false, reducedMotion = null } = {}) {
  const context = await pvContext(browser, { viewport: { width: 1920, height: 1080 }, ...(reducedMotion ? { reducedMotion } : {}) });
  if (auth) await context.addInitScript(() => { try { localStorage.setItem("vr-training-auth-v1", JSON.stringify({ id: "learner-rhd-drive" })); } catch (_) { /* storage blocked */ } });
  const page = await context.newPage();
  page.on("pageerror", (e) => out.pageErrors.push(e.message));
  page.on("request", (r) => { const u = r.url(); if (u.startsWith("http://127.0.0.1") || u.startsWith("data:") || u.startsWith("blob:")) return; if (/cdnjs\.cloudflare\.com\/ajax\/libs\/three\.js\//.test(u)) return; /* the import map's three.js URL, as drive_exteriors_page.mjs exempts it */ out.offHost.push(u); });
  await page.goto(`${base}/parishes/dist/parishes.html?parish=${parish}&tier=${tier}${ultra ? "&ultra=1" : ""}`, { waitUntil: "load", timeout: 180000 });
  await page.waitForFunction(() => !!window.__parishTest?.robotics && "robotsHd" in window.__parishTest, null, { timeout: 180000 });
  await page.evaluate(() => { window.__parishTest.setTime?.(1); const m = document.getElementById("menu"); if (m) m.hidden = true; window.__parishTest.np.playing = true; window.__parishTest.np.modal = null; });
  return { page, context };
}
/** ROBOTS-HD-3: a still that waits longer on a loaded machine and never ends the drive (a missed still is logged, not a failure of the page). */
const shot = async (page, file) => { try { await page.screenshot({ path: file, timeout: 120000 }); return true; } catch (e) { console.log(`still missed (${file.split("/").pop()}): ${String(e.message).split("\n")[0]}`); return false; } };
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

/** Hold the person the robot sees `d` metres from the site centre while the camera moves (a drive-only trick). The page's
 *  own animate and tick are kept ONCE (on first use) and every later call only moves the held point — round 6's still-only
 *  rerun wrapped the wrapper, so its second hold still passed the first one's 2.2 m and the "running" frame stayed amber. */
const holdLearner = (page, id, d) => page.evaluate(([id, d]) => {
  const T = window.__parishTest, R = T.robotics, H = T.robotsHd, s = R.sites.find((x) => x.id === id);
  let h = window.__rhdHold;
  if (!h) {
    h = window.__rhdHold = { animate: R.animate, tick: H.tick, px: 0, pz: 0, wrapped: 0 };
    R.animate = (dt) => h.animate(dt, h.px, h.pz); H.tick = (dt) => h.tick(dt, h.px, h.pz); h.wrapped++;
  }
  h.px = s.position[0] + 0.55 * d; h.pz = s.position[1] + 0.83 * d;
  return { d: +Math.hypot(h.px - s.position[0], h.pz - s.position[1]).toFixed(2), wrapped: h.wrapped };
}, [id, d]);

const rule = (st) => (!st ? null : st.estopped || st.locked ? "e-stop" : st.mode === "stop" ? "protective-stop" : "running");

// ------------------------------------------------------------------------------------------------ A. the robots outdoors
const perRobot = [];
for (const parish of only && only !== "outdoor" ? [] : ["sf-downtown", "oak-west-oakland", "bay-san-jose"]) {
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
if (outDir && (!only || only === "still")) {
  const { page, context } = await openPage("sf-downtown", "high");
  const id = RB_SITES.find((s) => s.parish === "sf-downtown").id;
  // the learner steps inside the stop distance (the robot holds a protective stop), then the camera alone backs out
  await standAt(page, id, 2.2, -0.4); await frames(page, 15);
  await page.screenshot({ path: join(outDir, "cell-protective-stop-inside.png") });
  const st = await page.evaluate((id) => window.__parishTest.robotics.state(id), id);
  // freeze the learner's position for the site (the camera moves; the person the robot sees stays at 2.2 m)
  await holdLearner(page, id, 2.2);
  await standAt(page, id, 6.8, -0.3); await frames(page, 20);
  const s2 = await page.evaluate((id) => ({ light: window.__parishTest.robotsHd.light(id), zone: window.__parishTest.robotsHd.measure().robots.find((x) => x.id === id).zone }), id);
  say(st.mode === "stop" && s2.light === "protective-stop" && s2.zone, `protective-stop still: site mode ${st.mode}, light ${s2.light}, zone ${s2.zone ? "shown" : "hidden"}`);
  await page.screenshot({ path: join(outDir, "cell-protective-stop.png") });
  if (only) { // the same framing for the other two states (the learner moved back outside the warning distance)
    const held = await holdLearner(page, id, 9);
    await frames(page, 30);
    const g = await page.evaluate((id) => ({ light: window.__parishTest.robotsHd.light(id), st: window.__parishTest.robotics.state(id), zone: window.__parishTest.robotsHd.measure().robots.find((x) => x.id === id).zone }), id);
    say(held.wrapped === 1 && g.light === "running" && g.light === rule(g.st) && !g.zone, `cell still, running: the held learner moved to ${held.d} m (wrapped once: ${held.wrapped}), site mode ${g.st.mode}, light ${g.light}, zone ${g.zone ? "shown" : "hidden"}`);
    await page.screenshot({ path: join(outDir, "cell-running.png") });
    await page.evaluate((id) => window.__parishTest.robotics.act(id, "press-estop"), id); await frames(page, 8);
    const e = await page.evaluate((id) => window.__parishTest.robotsHd.light(id), id);
    say(e === "e-stop", `cell still, e-stop: light ${e}`); await page.screenshot({ path: join(outDir, "cell-estop.png") });
  }
  await context.close();
}

// ------------------------------------------------- A3. the light follows a live agent-jobs run (ROBOTS-HD-2), step by step
// Reduced motion is emulated so the panel does not auto-advance (vb-panel.js steps every 350 ms otherwise, faster than a
// loaded SwiftShader frame): the drive presses Step itself, waits two frames, and reads what the light showed for that step.
if (!only || only === "jobs") {
  const { page, context } = await openPage("sf-downtown", "high", { reducedMotion: "reduce" });
  const id = RB_SITES.find((s) => s.parish === "sf-downtown" && s.rig === "cell").id;
  await standAt(page, id, 9, -0.25); await frames(page, 10);
  const want = (site, action) => { const a = action === "estop" ? "e-stop" : action === "protective-stop" ? "protective-stop" : action === "continue" || action === "slow" ? "running" : null; const sev = { "e-stop": 3, "protective-stop": 2, running: 1 }; return (sev[site] ?? 0) >= (sev[a] ?? 0) ? (site ?? a) : a; };
  const runJob = async (estopAt) => {
    const shown = [];
    for (let k = 0; k < 400; k++) {
      const r = await page.evaluate((id) => { const T = window.__parishTest, v = T.vbridge.state(); return { run: v.run, phase: v.job?.phase, site: v.job?.request?.siteId, light: T.robotsHd.light(id), siteState: T.robotics.state(id) }; }, id);
      if (!r.run) break;
      shown.push({ step: r.run.step, of: r.run.of, action: r.run.action, light: r.light, want: want(rule(r.siteState), r.run.action) });
      if (estopAt != null && r.run.step >= estopAt) { await page.evaluate(() => window.__parishTest.vbridge.estop()); break; }
      await page.evaluate(() => window.__parishTest.vbridge.step()); await frames(page, 2);
    }
    await frames(page, 2);
    return shown;
  };
  // Job 1 in the queue: the cell. Approve and step through the whole run.
  const j1 = await page.evaluate(() => { const v = window.__parishTest.vbridge; const j = v.next(); return { site: j.request.siteId, decision: j.governor?.decision }; });
  await page.evaluate(() => window.__parishTest.vbridge.approve()); await frames(page, 2);
  const s1 = await runJob(null);
  const ok1 = s1.filter((x) => x.light === x.want).length, inOrder = s1.every((x, i) => x.step === i);
  const after1 = await page.evaluate((id) => ({ light: window.__parishTest.robotsHd.light(id), st: window.__parishTest.robotics.state(id), job: window.__parishTest.vbridge.state().job, run: window.__parishTest.robotsHd.run() }), id);
  say(j1.site === id && s1.length > 1 && ok1 === s1.length && inOrder && s1.length === s1[0].of, `agent-jobs run on the cell (job 1, ${j1.decision}): the light followed the governor's decision ${ok1} of ${s1.length} steps in order (${[...new Set(s1.map((x) => x.action))].join(", ")} -> ${[...new Set(s1.map((x) => x.light))].join(", ")})`);
  say(after1.light === rule(after1.st) && !after1.job.deliverable.evalCard.halted, `run finished (${after1.job.phase}, not halted): the light hands back to the site's own state -> ${after1.light}`);
  // Cycle to the cell's next allowed job (the learned-policy job), approve, step twice, then the supervisor's E-stop.
  let j2 = null;
  for (let k = 0; k < 12; k++) { j2 = await page.evaluate(() => { const j = window.__parishTest.vbridge.next(); return { site: j.request.siteId, decision: j.governor?.decision, seed: j.seed }; }); if (j2.site === id && j2.decision === "allow-sim") break; }
  await page.evaluate(() => window.__parishTest.vbridge.approve()); await frames(page, 2);
  if (outDir) await page.screenshot({ path: join(outDir, "cell-job-running.png") });
  const s2 = await runJob(2);
  const halted = await page.evaluate((id) => { const T = window.__parishTest, j = T.vbridge.state().job, st = j.deliverable.episode.steps; return { light: T.robotsHd.light(id), last: st[st.length - 1].info.governor, halted: j.deliverable.evalCard.halted, phase: j.phase, audit: T.vbridge.state().verify }; }, id);
  if (outDir) await page.screenshot({ path: join(outDir, "cell-job-estop.png") });
  say(s2.every((x) => x.light === x.want) && halted.halted?.action === "estop" && halted.light === "e-stop" && halted.last === "estop", `the supervisor's E-stop at step ${s2.length - 1} of job seed ${j2.seed}: the governor's last decision ${halted.last} (${halted.phase}, audit ${halted.audit.lines} lines, chain ${halted.audit.ok ? "intact" : "BROKEN"}) -> light ${halted.light}, held until the next job`);
  await page.evaluate(() => window.__parishTest.vbridge.next()); await frames(page, 3);
  const back = await page.evaluate((id) => ({ light: window.__parishTest.robotsHd.light(id), st: window.__parishTest.robotics.state(id), run: window.__parishTest.robotsHd.run() }), id);
  say(back.run === null && back.light === rule(back.st), `next job taken: the light hands back to the site's own state -> ${back.light}`);
  const log = await page.evaluate(() => window.__parishTest.robotsHd.runLog());
  say(log.length > 0 && log.every((e) => e.light === want(e.site, e.action)), `the page's run log: ${log.length} (job, step) entries, every light = the more severe of the site's state and the governor's decision`);
  await context.close();
}

// ------------------------------------------------------------------------------- B. the six rooms with the hive's agents
if (!only || only === "rooms") {
  const { page, context } = await openPage("sf-downtown", "high", { auth: true });
  const styles = await page.evaluate(() => window.__parishTest.roboInteriors.styles);
  let inside = 0;
  for (const st of styles) {
    const r = await page.evaluate(async (style) => {
      const T = window.__parishTest; const s = T.ixScene(style);
      const frames = (n) => new Promise((res) => { const f = () => (n-- <= 0 ? res() : requestAnimationFrame(f)); requestAnimationFrame(f); });
      await frames(3);
      // ROBOTS-HD-3 with AVATARS-HD-5: top the room up to its figure limit (3, as drive_avatars_hd4.mjs does: agents not already
      // here walk to the places by the door), then count figures and agents held by the room mount's triangle cap.
      const mt = T.hiveWorld?.room?.(), had = mt?.placed?.length ?? 0, here = new Set((mt?.placed ?? []).map((p) => p.agent.id)), add = [];
      for (const a of T.hive?.hive?.agents ?? []) { if (had + add.length >= 3) break; if (!here.has(a.id)) add.push(a.id); }
      add.forEach((id, k) => mt?.avatars?.handle({ type: "move", agent: id, to: `hw-room:door:${k}` }));
      await frames(6);
      const c = mt?.avatars?.counts?.() ?? {}, held = (mt?.avatars?.agents?.() ?? []).filter((x) => x.held).length;
      const m = T.roboInteriors.measure(), room = T.interiors?.mount?.room ?? null;
      return { style: s?.style, meshes: m.meshes, calls: m.calls, triangles: m.triangles, built: m.trianglesBuilt, hd: room?.rhd?.robots?.length ?? 0, hdKinds: (room?.rhd?.robots ?? []).map((q) => q.kind).join("+"), hdTris: room?.rhd?.triangles ?? 0, agents: mt?.placed?.length ?? 0, had, figures: c.figures ?? 0, levels: c.levels ?? null, held, hive: !!T.hive };
    }, st);
    const triCap = ultra ? 8500 : IX_BUDGET.triangles.high;
    const ok = r.meshes <= IX_BUDGET.meshes && r.triangles <= triCap && r.built <= triCap && r.held === 0 && r.figures === 3;
    if (ok) inside++;
    say(ok, `room ${st}: ${r.meshes} meshes, ${r.calls} draw calls, ${r.triangles} triangles drawn (${r.built} built) <= ${IX_BUDGET.meshes} / ${triCap}; HD robots ${r.hd} ${r.hdKinds} (${r.hdTris} tris); figures ${r.figures} ${JSON.stringify(r.levels)}, held ${r.held} (${r.had} the hive's own, topped up to 3; hive mounted: ${r.hive})`);
    if (outDir) await shot(page, join(outDir, `room-${st}.png`));
  }
  say(inside === styles.length, `robot rooms inside IX_BUDGET with the HD robots and three agent figures each, 0 held: ${inside} of ${styles.length}`);
  await context.close();
}

// ----------------------------------------- B2. the floor zone indoors, each room opened on its own site's map (ROBOTS-HD-2)
// The room's site is on this map, so the robots show its state; the learner's room-local pose walks from the room's camera
// preset towards each robot and the zone must show exactly inside the warning distance (rbSsmMode), in the page's own frame loop.
if (!only || only === "zone") {
  let okAll = 0, nAll = 0, robotsIn = 0, robotsN = 0;
  for (const [parish, style] of [["la-meta-richland", "ixr-drilling-deck"], ["sf-downtown", "ixr-cell-hall"], ["bay-san-jose", "ixr-cobot-lab"], ["oak-west-oakland", "ixr-amr-warehouse"]]) {
    const { page, context } = await openPage(parish, "high");
    const opened = await page.evaluate((style) => window.__parishTest.ixScene(style), style);
    await frames(page, 4);
    const info = await page.evaluate(() => { const room = window.ixWorld.room; return { site: room.ixr?.site ?? null, st: window.__parishTest.robotics.state(room.ixr?.site), robots: (room.rhd?.robots ?? []).map((q, i) => ({ i, kind: q.kind, x: q.x, z: q.z, zone: !!q.robot.zone, light: q.robot.lightState })), pose: { x: window.ixWorld.pose.x, z: window.ixWorld.pose.z } }; });
    let ok = 0, n = 0, shot = false;
    for (const q of info.robots.filter((r) => r.zone)) {
      robotsN++; let inside = false;
      const L = Math.hypot(q.x - info.pose.x, q.z - info.pose.z);
      for (let k = 0; k <= 24; k++) {
        const f = (k / 24) * Math.max(0, (L - 1.2) / L);
        const r = await page.evaluate(([q, f, p0]) => new Promise((res) => {
          const P = window.ixWorld.pose; P.x = p0.x + (q.x - p0.x) * f; P.z = p0.z + (q.z - p0.z) * f;
          requestAnimationFrame(() => requestAnimationFrame(() => { const R = window.ixWorld.room.rhd.robots[q.i]; res({ d: Math.hypot(P.x - q.x, P.z - q.z), zone: R.robot.zone.visible, light: R.robot.lightState }); }));
        }), [q, f, info.pose]);
        const want = rbSsmMode(r.d).mode !== "full";
        n++; if (r.zone === want) ok++; if (want && r.zone) inside = true;
        if (outDir && !shot && style === "ixr-drilling-deck" && r.d < 3.2) { await page.screenshot({ path: join(outDir, "room-drill-zone.png") }); shot = true; }
      }
      if (inside) robotsIn++;
      await page.evaluate((p0) => { window.ixWorld.pose.x = p0.x; window.ixWorld.pose.z = p0.z; }, info.pose); await frames(page, 2);
    }
    okAll += ok; nAll += n;
    say(opened?.here && info.st && n > 0 && ok === n, `room ${style} on ${parish} (its site ${info.site} here, light ${info.robots.map((r) => r.light).join("/")}): the floor zone followed the room-local pose ${ok} of ${n} steps past ${info.robots.filter((r) => r.zone).length} robot(s)`);
    if (outDir && style === "ixr-drilling-deck") {
      await page.evaluate(() => window.__parishTest.ixScene("ixr-drilling-deck")); await frames(page, 4);
      await page.screenshot({ path: join(outDir, "room-drill.png") });
    }
    await context.close();
  }
  say(nAll > 0 && okAll === nAll && robotsIn === robotsN, `the zone indoors in the built page: ${okAll} of ${nAll} steps exactly inside the warning distance; shown for ${robotsIn} of ${robotsN} robots`);
}

// ------------------------------------------------- B3. the port control room's straddle carrier on its own map (ROBOTS-HD-3)
if (!only || only === "port") {
  const { page, context } = await openPage("oak-west-oakland", "high");
  const opened = await page.evaluate(() => window.__parishTest.ixScene("ixr-port-control"));
  await frames(page, 4);
  const info = await page.evaluate(() => { const T = window.__parishTest, room = window.ixWorld.room, q = room.rhd?.robots?.[0]; const m = T.roboInteriors.measure(); return { site: room.ixr?.site ?? null, st: T.robotics.state(room.ixr?.site), kind: q?.kind ?? null, light: q?.robot?.lightState ?? null, tris: q?.robot?.triangles ?? 0, calls: q?.robot?.calls ?? 0, meshes: m.meshes, drawn: m.triangles, built: m.trianglesBuilt, dc: m.calls }; });
  const rule = (st) => (!st ? null : st.estopped ? "e-stop" : st.locked || st.mode === "stop" ? "protective-stop" : "running");
  say(opened?.here && info.kind === "straddle" && info.light === rule(info.st) && info.meshes <= IX_BUDGET.meshes && info.built <= IX_BUDGET.triangles.high, `port control room on oak-west-oakland (its site ${info.site} here): the straddle carrier in the window, ${info.tris} tris / ${info.calls} calls, beacons ${info.light} = the site's state; room ${info.meshes} meshes, ${info.dc} calls, ${info.drawn} drawn (${info.built} built)`);
  if (outDir) await shot(page, join(outDir, "room-port-carrier.png"));
  // ROBOTS-HD-4: the carrier travels its yard lane in the page's own frame loop while the site runs, and holds after the e-stop.
  const sample = (frames) => page.evaluate((frames) => new Promise((res) => { const m = () => window.ixWorld.room.rhd.motion()[0]; const a = m(); let n = 0, moved = 0, last = a.x; const step = () => { const c = m(); if (c.x !== last) moved++; last = c.x; if (++n < frames) requestAnimationFrame(step); else res({ from: a.pos, to: c.pos, moved, frames: n, light: window.ixWorld.room.rhd.robots[0].robot.lightState, half: window.ixWorld.room.rhd.robots[0].lane.length / 2 }); }; requestAnimationFrame(step); }), frames);
  const go = await sample(40);
  say(go.light === "running" && go.moved >= 30 && Math.abs(go.to) <= go.half && Math.abs(go.from) <= go.half, `the carrier travels while the site runs: ${go.moved} of ${go.frames} frames moved it, ${go.from.toFixed(2)} -> ${go.to.toFixed(2)} m along its ${go.half * 2} m lane (beacons ${go.light})`);
  // e-stop the port site through its own act(): the beacons go red; reset.
  const red = await page.evaluate(async () => { const T = window.__parishTest, id = window.ixWorld.room.ixr.site; T.robotics.act(id, "press-estop"); await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))); const l = window.ixWorld.room.rhd.robots[0].robot.lightState; return { l, st: T.robotics.state(id) }; });
  say(red.l === "e-stop" && red.st?.estopped, `the port site's e-stop pressed: the carrier's beacons -> ${red.l}`);
  const hold = await sample(40);
  say(hold.light === "e-stop" && hold.moved === 0 && hold.from === hold.to, `the carrier holds after the e-stop: ${hold.moved} of ${hold.frames} frames moved it, at ${hold.to.toFixed(2)} m (beacons ${hold.light})`);
  if (outDir) {
    // close: the learner at the centre desk looking at the pane the carrier stands in
    await page.evaluate(() => { const P = window.ixWorld.pose; P.x = -7.25; P.z = -4.0; });
    await frames(page, 3); await shot(page, join(outDir, "room-port-carrier-close.png"));
  }
  await page.evaluate(async () => { const T = window.__parishTest; T.robotics.act(window.ixWorld.room.ixr.site, "restart"); });
  await context.close();
}

// ------------------------------------------------------------------------------------------------------- C. balanced
if (!only || only === "outdoor") {
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
