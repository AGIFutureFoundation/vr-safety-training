#!/usr/bin/env node
// AVATARS-HD-3 drive (not in the gate): the hive's operations room in the BUILT parishes page (oak-west-oakland, desktop high tier,
// signed in, voice off), with the page's own mount for that room (aaCrowdAvatarMount: the crowd level, walks round the consoles).
//   1. step the panel's hive to its first quiet minute after 150 (all seven free), enter the ops room, and measure it with all seven
//      standing (the page's own counts: meshes, triangles built and drawn, draw calls, textures), then with all seven speaking;
//   2. a still of the room with the seven crowd-level figures;
//   3. step the hive until a figure walks between the door and its console on a routed path, and shoot it mid-walk;
//   4. page errors and off-host requests.
// Usage: python3 tools/bundle_webxr.py parishes && node tools/drive_avatars_hd3.mjs [port=9141] [outDir]
import { pathToFileURL } from "node:url";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const PORT = Number(process.argv[2] ?? 9141), OUT = process.argv[3] ?? ".";
const { pvServe, pvLaunch, pvContext } = await import(pathToFileURL(join(ROOT, "tools/lib/pv_browser.mjs")).href);
const { base, close } = await pvServe(PORT);
const browser = await pvLaunch();
const errors = [], offHost = [];
const t0 = Date.now();
const hideOverlays = (page) => page.evaluate(() => { let n = 0; for (const el of document.body.querySelectorAll("*")) { if (el.tagName === "CANVAS" || el.querySelector("canvas")) continue; const cs = getComputedStyle(el); if ((cs.position === "fixed" || cs.position === "absolute") && cs.visibility !== "hidden") { el.dataset.ah3Hid = "1"; el.style.visibility = "hidden"; n++; } } return n; });
const showOverlays = (page) => page.evaluate(() => { for (const el of document.querySelectorAll("[data-ah3-hid]")) { el.style.visibility = ""; delete el.dataset.ah3Hid; } });
const pose = (page, x, z, yaw, pitch) => page.evaluate(({ x, z, yaw, pitch }) => { const T = window.__parishTest, ix = T.interiors.mount; ix.pose.x = x; ix.pose.z = z; T.np.yaw = yaw; T.np.pitch = pitch; if (ix.pose.yaw !== undefined) { ix.pose.yaw = yaw; ix.pose.pitch = pitch; } }, { x, z, yaw, pitch });
const measure = (page) => page.evaluate(() => { const r = window.__parishTest.hd4.measure(); return { calls: r.calls, trianglesDrawn: r.triangles, meshes: r.meshes, trianglesBuilt: r.trianglesBuilt, lights: r.lights, textureMiB: +(r.textureBytes / 1048576).toFixed(2) }; });
let fail = 0;
const check = (cond, what) => { console.log(`${cond ? "PASS" : "FAIL"} ${what}`); if (!cond) fail += 1; };
try {
  const ctx = await pvContext(browser, { viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 });
  await ctx.addInitScript(() => { try { localStorage.setItem("vr-training-auth-v1", JSON.stringify({ id: "learner-ah3-drive" })); } catch (_) { /* storage blocked */ } });
  const page = await ctx.newPage();
  page.on("pageerror", (e) => errors.push(String(e.message).split("\n")[0]));
  page.on("request", (r) => { const u = r.url(); if (u.startsWith("http://127.0.0.1") || u.startsWith("data:") || u.startsWith("blob:")) return; if (/cdnjs\.cloudflare\.com\/ajax\/libs\/(three\.js|react)/.test(u) || /fonts\.(googleapis|gstatic)/.test(u)) return; offHost.push(u); });
  await page.goto(`${base}/parishes/dist/parishes.html?parish=oak-west-oakland&tier=high`, { waitUntil: "load", timeout: 240000 });
  await page.waitForFunction(() => !!window.__parishTest?.hive?.hive && !!window.__parishTest?.hiveWorld, null, { timeout: 240000 });
  await page.evaluate(() => { const s = document.querySelector("[data-ux-ob-skip]"); if (s && s.offsetParent) s.click(); });
  const at = await page.evaluate(() => {
    const P = window.__parishTest.hive, H = P.hive;
    const busyNow = () => new Set(H.jobs().filter((j) => j.winner && ["moving", "running"].includes(j.status)).map((j) => j.winner));
    while (H.now() < 150) P.step();
    while (H.now() < 470 && busyNow().size > 0) P.step();
    return { t: H.now(), busyAgents: busyNow().size };
  });
  console.log("hive", JSON.stringify(at));
  console.log("enter", JSON.stringify(await page.evaluate(() => window.__parishTest.hd4.opsRoom())));
  await page.waitForTimeout(4000);
  const standing = await page.evaluate(() => { const m = window.__parishTest.hiveWorld.room(); const c = m?.avatars?.counts?.() ?? null; return { standing: m?.standing?.()?.length ?? 0, hd: c?.hd ?? 0, hdLevel: c?.hdLevel ?? null, figures: c?.figures ?? 0, figureTriangles: c?.triangles ?? 0 }; });
  const m7 = await measure(page);
  console.log("standing", JSON.stringify({ ...standing, ...m7 }));
  check(standing.standing === 7 && standing.hd === 7 && standing.hdLevel === "crowd", `the ops room in the built page: ${standing.standing} of 7 standing, ${standing.hd} crowd-level figures (${standing.hdLevel}), figures ${standing.figureTriangles} triangles`);
  check(m7.meshes <= 120 && m7.trianglesBuilt <= 6000, `built page, all seven standing: ${m7.meshes} meshes, ${m7.trianglesBuilt} triangles built (≤ 120 / 6,000), ${m7.calls} draw calls, ${m7.trianglesDrawn} drawn, ${m7.textureMiB} MiB`);
  await page.evaluate(() => { const m = window.__parishTest.hiveWorld.room(); for (const a of m.placed.map((p) => p.agent)) m.avatars.handle({ type: "speak", agent: a.id, text: `${a.name} checks the queue with the governor before the next simulated job.` }); });
  await page.waitForTimeout(1500);
  const ms = await measure(page);
  console.log("speaking", JSON.stringify(ms));
  check(ms.meshes <= 120 && ms.trianglesBuilt <= 6000, `built page, all seven speaking (captions up): ${ms.meshes} meshes, ${ms.trianglesBuilt} triangles built, ${ms.calls} draw calls, ${ms.textureMiB} MiB`);
  await page.waitForTimeout(9000); // the lines end
  await pose(page, 0.4, 5.2, 0.0, -0.12);
  await page.waitForTimeout(1800);
  await hideOverlays(page); await page.waitForTimeout(300);
  console.log("shot ah3-ops-room-crowd.png", JSON.stringify(await measure(page)));
  await page.screenshot({ path: join(OUT, "ah3-ops-room-crowd.png") });
  await showOverlays(page);
  // a routed walk: step the hive until a figure walks in from the door to its console on a path that bends round a console
  const walk = await page.evaluate(async () => {
    const P = window.__parishTest.hive, m = window.__parishTest.hiveWorld.room();
    for (let k = 0; k < 160; k += 1) {
      P.step();
      for (let w = 0; w < 6; w += 1) {
        await new Promise((r) => setTimeout(r, 150));
        for (const p of [...m.placed, ...m.leaving().map((id) => ({ agent: { id } }))]) {
          const s = m.avatars.state(p.agent.id);
          if (s?.walking && s.walkPath && s.walkPath.pts.length > 2 && s.walkPath.pts[0].z > 5 && Math.hypot(s.x - s.walkPath.pts[1].x, s.z - s.walkPath.pts[1].z) > 2.5) return /* walking in from the door, before the bend */ { t: P.hive.now(), agent: s.id, name: s.name, x: s.x, z: s.z, pts: s.walkPath.pts };
        }
      }
    }
    return null;
  });
  console.log("walk", JSON.stringify(walk));
  check(!!walk, "a routed walk between the door and a console in the built page");
  if (walk) {
    // freeze the room's figures mid-walk (the room mount's animate is replaced while the still is taken, then restored), 2-4 m before
    // the bend round the outer console, then frame the figure and that console from the room's middle
    const bend = walk.pts[1];
    const pos = await page.evaluate(({ id, bx, bz }) => new Promise((res) => { const m = window.__parishTest.hiveWorld.room(), t1 = Date.now(); const tick = () => { const s = m.avatars.state(id); const d = Math.hypot(s.x - bx, s.z - bz); if ((d < 4 && d > 1.5) || !s.walking || Date.now() - t1 > 10000) { window.__ah3Animate = m.animate; m.animate = () => {}; res({ x: s.x, z: s.z, walking: s.walking, fromBend: +d.toFixed(2), yaw: s.yaw }); } else setTimeout(tick, 30); }; tick(); }), { id: walk.agent, bx: bend.x, bz: bend.z });
    const tx = (pos.x + bend.x) / 2, tz = (pos.z + bend.z) / 2, cx = tx * 0.15, cz = tz + 4.2, yaw = Math.atan2(-(tx - cx), -(tz - cz));
    await pose(page, cx, cz, yaw, -0.22);
    await page.waitForTimeout(1500);
    await hideOverlays(page); await page.waitForTimeout(300);
    await page.screenshot({ path: join(OUT, "ah3-walk-round-console.png") });
    console.log("shot ah3-walk-round-console.png", JSON.stringify({ figure: pos, path: walk.pts, camera: { x: +cx.toFixed(2), z: +cz.toFixed(2), yaw: +yaw.toFixed(3) } }));
    await page.evaluate(() => { const m = window.__parishTest.hiveWorld.room(); if (window.__ah3Animate) m.animate = window.__ah3Animate; });
    await showOverlays(page);
    check(pos.walking && pos.fromBend > 1.5, `the walk still caught mid-walk (${pos.fromBend} m before the bend)`);
  }
} finally {
  console.log("pageErrors", JSON.stringify(errors));
  console.log("offHost", JSON.stringify(offHost));
  console.log("seconds", Math.round((Date.now() - t0) / 1000));
  await browser.close(); await close();
}
if (errors.length) fail += 1;
console.log(fail ? `${fail} drive step(s) failed` : "All drive steps pass.");
process.exit(fail ? 1 : 0);
