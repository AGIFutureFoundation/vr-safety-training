#!/usr/bin/env node
// AVATARS-HD-4 drive (not in the gate): the BUILT parishes page on the desktop high tier, signed in, voice off.
//   A. The hive's operations room (oak-west-oakland) with the page's mount: the console nearest the learner as they enter at the room
//      level, the other six at the crowd level (aaCrowdAvatarMount { nearest: "room" }). The hive is stepped to its first quiet minute
//      after 150 (all seven free), the room entered, and measured with all seven standing and with all seven speaking (the page's own
//      counts); the median frame time over 10 s with the load average beside it; a still from the door; a still of the room-level and
//      a crowd figure each holding the stop hand on a refusal, close.
//   B. The six robot rooms (sf-downtown) with ROBOTS-HD's high-detail robots and the most figures a room allows (H3_ROOM_FIGURES, 3):
//      the agents the hive has put in the room, topped up to three at the room's places by the door; each room measured; the median frame
//      time in the busiest room with its three figures and with none.
//   Page errors and off-host requests throughout. Run it once with the committed dist (before) and once after rebuilding (after).
// Usage: [python3 tools/bundle_webxr.py parishes &&] node tools/drive_avatars_hd4.mjs [port=9154] [outDir] [tag]
import { pathToFileURL, fileURLToPath } from "node:url";
import { join, dirname } from "node:path";
const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const PORT = Number(process.argv[2] ?? 9154), OUT = process.argv[3] ?? ".", TAG = process.argv[4] ?? "after", ONLY = process.argv[5] ?? null; // ONLY: A or B
const { pvServe, pvLaunch, pvContext, pvLoad } = await import(pathToFileURL(join(ROOT, "tools/lib/pv_browser.mjs")).href);
const { IX_BUDGET } = await import(pathToFileURL(join(ROOT, "WebXR/shared/ix-interiors.js")).href);
const { base, close } = await pvServe(PORT);
const browser = await pvLaunch();
const errors = [], offHost = [];
const t0 = Date.now();
let fail = 0;
const check = (cond, what) => { console.log(`${cond ? "PASS" : "FAIL"} ${what}`); if (!cond) fail += 1; };
const hideOverlays = (page) => page.evaluate(() => { for (const el of document.body.querySelectorAll("*")) { if (el.tagName === "CANVAS" || el.querySelector("canvas")) continue; const cs = getComputedStyle(el); if ((cs.position === "fixed" || cs.position === "absolute") && cs.visibility !== "hidden") { el.dataset.ah4Hid = "1"; el.style.visibility = "hidden"; } } });
const showOverlays = (page) => page.evaluate(() => { for (const el of document.querySelectorAll("[data-ah4-hid]")) { el.style.visibility = ""; delete el.dataset.ah4Hid; } });
const pose = (page, x, z, yaw, pitch) => page.evaluate(({ x, z, yaw, pitch }) => { const T = window.__parishTest, ix = T.interiors.mount; ix.pose.x = x; ix.pose.z = z; T.np.yaw = yaw; T.np.pitch = pitch; if (ix.pose.yaw !== undefined) { ix.pose.yaw = yaw; ix.pose.pitch = pitch; } }, { x, z, yaw, pitch });
const frameTime = (page, ms = 10000) => page.evaluate((ms) => new Promise((res) => { const d = []; let last = performance.now(); const start = last; const f = (now) => { d.push(now - last); last = now; if (now - start < ms) requestAnimationFrame(f); else { d.shift(); d.sort((a, b) => a - b); res({ median: +d[Math.floor(d.length / 2)].toFixed(1), frames: d.length, p90: +d[Math.floor(d.length * 0.9)].toFixed(1) }); } }; requestAnimationFrame(f); }), ms);
const timed = async (page) => { const l0 = pvLoad(); const ft = await frameTime(page); return { ...ft, load: [l0, pvLoad()] }; };
async function open(parish) {
  const ctx = await pvContext(browser, { viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 });
  await ctx.addInitScript(() => { try { localStorage.setItem("vr-training-auth-v1", JSON.stringify({ id: "learner-ah4-drive" })); } catch (_) { /* storage blocked */ } });
  const page = await ctx.newPage();
  page.on("pageerror", (e) => errors.push(String(e.message).split("\n")[0]));
  page.on("request", (r) => { const u = r.url(); if (u.startsWith("http://127.0.0.1") || u.startsWith("data:") || u.startsWith("blob:")) return; if (/cdnjs\.cloudflare\.com\/ajax\/libs\/(three\.js|react)/.test(u) || /fonts\.(googleapis|gstatic)/.test(u)) return; offHost.push(u); });
  await page.goto(`${base}/parishes/dist/parishes.html?parish=${parish}&tier=high`, { waitUntil: "load", timeout: 240000 });
  await page.waitForFunction(() => !!window.__parishTest?.hive?.hive && !!window.__parishTest?.hiveWorld, null, { timeout: 240000 });
  await page.evaluate(() => { const s = document.querySelector("[data-ux-ob-skip]"); if (s && s.offsetParent) s.click(); });
  return { ctx, page };
}
const out = { tag: TAG };
try {
  // ------------------------------------------------------------------------------------------------ A. the operations room
  if (ONLY !== "B") {
    const { ctx, page } = await open("oak-west-oakland");
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
    const measure = () => page.evaluate(() => { const r = window.__parishTest.hd4.measure(); return { calls: r.calls, trianglesDrawn: r.triangles, meshes: r.meshes, trianglesBuilt: r.trianglesBuilt, textureMiB: +(r.textureBytes / 1048576).toFixed(2) }; });
    const st = await page.evaluate(() => { const m = window.__parishTest.hiveWorld.room(); const c = m?.avatars?.counts?.() ?? {}; const lv = m?.placed?.map((p) => ({ id: p.agent.id, name: p.agent.name, key: p.agent.key, level: m.avatars.state(p.agent.id)?.level })); return { standing: m?.standing?.()?.length ?? 0, hd: c.hd ?? 0, levels: c.levels ?? null, figures: c.figures ?? 0, figureTriangles: c.triangles ?? 0, placed: lv }; });
    const m7 = await measure();
    out.ops = { at, ...st, standing7: m7 };
    console.log("standing", JSON.stringify({ ...st, ...m7 }));
    const mixed = st.levels?.room === 1 && st.levels?.crowd === 6;
    check(st.standing === 7 && st.hd === 7, `the ops room in the built page: ${st.standing} of 7 standing, ${st.hd} high-detail figures, levels ${JSON.stringify(st.levels)}${TAG === "after" ? (mixed ? " (one room level, six crowd)" : " (expected one room, six crowd)") : ""}`);
    if (TAG === "after" && !mixed) fail += 1;
    check(m7.meshes <= IX_BUDGET.meshes && m7.trianglesBuilt <= IX_BUDGET.triangles.high, `built page, seven standing: ${m7.meshes} meshes, ${m7.trianglesBuilt} triangles built (≤ ${IX_BUDGET.meshes} / ${IX_BUDGET.triangles.high}), ${m7.calls} draw calls, ${m7.trianglesDrawn} drawn, ${m7.textureMiB} MiB`);
    await page.evaluate(() => { const m = window.__parishTest.hiveWorld.room(); for (const a of m.placed.map((p) => p.agent)) m.avatars.handle({ type: "speak", agent: a.id, text: `${a.name} checks the queue with the governor before the next simulated job.` }); });
    await page.waitForTimeout(1500);
    const ms = await measure();
    out.ops.speaking7 = ms;
    check(ms.meshes <= IX_BUDGET.meshes && ms.trianglesBuilt <= IX_BUDGET.triangles.high, `built page, seven speaking (captions up): ${ms.meshes} meshes, ${ms.trianglesBuilt} triangles built, ${ms.calls} draw calls, ${ms.textureMiB} MiB`);
    await page.waitForTimeout(9000); // the lines end
    await pose(page, 0.4, 5.2, 0.0, -0.12);
    await page.waitForTimeout(1500);
    out.ops.frame = await timed(page);
    console.log("ops frame time", JSON.stringify(out.ops.frame));
    if (TAG === "after") {
      await hideOverlays(page); await page.waitForTimeout(300);
      await page.screenshot({ path: join(OUT, "ah4-ops-room-nearest.png") });
      await showOverlays(page);
      // the stop hand, close: the room-level figure and its crowd-level neighbour each refuse (the hive's own refusal event shape)
      const pair = await page.evaluate(() => {
        const m = window.__parishTest.hiveWorld.room(), s = m.placed.map((p) => ({ id: p.agent.id, name: p.agent.name, ...m.avatars.state(p.agent.id) }));
        const near = s.find((x) => x.level === "room") ?? s[0];
        const other = s.filter((x) => x.id !== near.id).sort((a, b) => Math.hypot(a.x - near.x, a.z - near.z) - Math.hypot(b.x - near.x, b.z - near.z))[0];
        // hold the room for the still (a frame can take seconds under load and would end the 1.8 s gesture), refuse, then bring the two
        // figures to the stop hand's full pose by the mount's own clock (0.9 s in; the ease-in takes the first 18%)
        window.__ah4Animate = m.animate; m.animate = () => {};
        for (const x of [near, other]) m.avatars.handle({ type: "refused", agent: x.id, reason: "the governor's safety check", jobId: "ah4-still" });
        const c = m.avatars.clock(); m.avatars.animate(c + 0.9, 0.9, null);
        return { near: { id: near.id, name: near.name, x: near.x, z: near.z, yaw: near.yaw, level: near.level }, other: { id: other.id, name: other.name, x: other.x, z: other.z, yaw: other.yaw, level: other.level } };
      });
      console.log("stop gestures", JSON.stringify(await page.evaluate((ids) => ids.map((id) => window.__parishTest.hiveWorld.room().avatars.state(id).gesture), [pair.near.id, pair.other.id])));
      const mx = (pair.near.x + pair.other.x) / 2, mz = (pair.near.z + pair.other.z) / 2;
      // the figures face +z rotated by yaw; stand 2.4 m in front of the pair, looking back at them
      const fy = (pair.near.yaw + pair.other.yaw) / 2, cx = mx + Math.sin(fy) * 2.4, cz = mz + Math.cos(fy) * 2.4, yaw = Math.atan2(-(mx - cx), -(mz - cz));
      await pose(page, cx, cz, yaw, -0.05);
      await page.waitForTimeout(1200);
      await hideOverlays(page); await page.waitForTimeout(300);
      await page.screenshot({ path: join(OUT, "ah4-stop-hand-room-crowd.png") });
      await showOverlays(page);
      await page.evaluate(() => { const m = window.__parishTest.hiveWorld.room(); if (window.__ah4Animate) m.animate = window.__ah4Animate; });
      console.log("stop still", JSON.stringify({ pair, camera: { x: +cx.toFixed(2), z: +cz.toFixed(2), yaw: +yaw.toFixed(3) } }));
    }
    await ctx.close();
  }
  // ------------------------------------------------------------------------------------------------ B. the six robot rooms
  if (ONLY !== "A") {
    const { ctx, page } = await open("sf-downtown");
    await page.evaluate(() => { const P = window.__parishTest.hive; while (P.hive.now() < 150) P.step(); });
    const styles = await page.evaluate(() => window.__parishTest.roboInteriors.styles);
    let inside = 0; out.rooms = [];
    for (const style of styles) {
      const r = await page.evaluate(async (style) => {
        const T = window.__parishTest; T.ixScene(style);
        const frames = (n) => new Promise((res) => { const f = () => (n-- <= 0 ? res() : requestAnimationFrame(f)); requestAnimationFrame(f); });
        await frames(3);
        const m = T.hiveWorld.room(), had = m?.placed?.length ?? 0;
        // top up to the room's figure limit (H3_ROOM_FIGURES, 3) at the places by the door, with agents not already here
        const here = new Set((m?.placed ?? []).map((p) => p.agent.id)), add = [];
        for (const a of T.hive.hive.agents) { if (had + add.length >= 3) break; if (!here.has(a.id)) add.push(a.id); }
        add.forEach((id, k) => m?.avatars?.handle({ type: "move", agent: id, to: `hw-room:door:${k}` }));
        await frames(6);
        const c = m?.avatars?.counts?.() ?? {};
        const x = T.roboInteriors.measure(), room = T.interiors?.mount?.room ?? null;
        const held = (m?.avatars?.agents?.() ?? []).filter((x) => x.held).length; // AVATARS-HD-4: held by the room's triangle cap
        return { style, had, figures: c.figures ?? 0, held, levels: c.levels ?? null, meshes: x.meshes, calls: x.calls, drawn: x.triangles, built: x.trianglesBuilt, hd: room?.rhd?.robots?.length ?? 0, hdTris: room?.rhd?.triangles ?? 0, added: add };
      }, style);
      const ok = r.meshes <= IX_BUDGET.meshes && r.built <= IX_BUDGET.triangles.high && r.drawn <= IX_BUDGET.triangles.high;
      if (ok) inside += 1;
      out.rooms.push(r);
      check(ok && r.figures + r.held === 3, `room ${style}: ${r.figures} figures and ${r.held} held by the triangle cap (${r.had} the hive's, ${JSON.stringify(r.levels)}), HD robots ${r.hd} (${r.hdTris} tris); ${r.meshes} meshes, ${r.built} triangles built, ${r.drawn} drawn, ${r.calls} draw calls (≤ ${IX_BUDGET.meshes} / ${IX_BUDGET.triangles.high})`);
      if (TAG === "after") { await hideOverlays(page); await page.waitForTimeout(200); await page.screenshot({ path: join(OUT, `ah4-room-${style}.png`) }); await showOverlays(page); }
    }
    check(inside === styles.length, `robot rooms inside IX_BUDGET with the HD robots and three agents each (figures, or held by the cap): ${inside} of ${styles.length}; held ${out.rooms.reduce((a, r) => a + r.held, 0)}`);
    // frame time in the busiest room (most triangles built) with its three figures, then with none
    const busiest = out.rooms.reduce((a, b) => (b.built > a.built ? b : a));
    await page.evaluate(async (style) => { window.__parishTest.ixScene(style); await new Promise((r) => setTimeout(r, 500)); const m = window.__parishTest.hiveWorld.room(), have = new Set((m?.placed ?? []).map((p) => p.agent.id)); let k = 0; for (const a of window.__parishTest.hive.hive.agents) { if ((m?.avatars?.counts?.().figures ?? 0) >= 3) break; if (!have.has(a.id)) m?.avatars?.handle({ type: "move", agent: a.id, to: `hw-room:door:${k++}` }); } }, busiest.style);
    await page.waitForTimeout(1500);
    const with3 = await timed(page);
    const n3 = await page.evaluate(() => window.__parishTest.hiveWorld.room()?.avatars?.counts?.().figures ?? 0);
    await page.evaluate(() => { const m = window.__parishTest.hiveWorld.room(); for (const a of window.__parishTest.hive.hive.agents) m?.avatars?.release?.(a.id); });
    await page.waitForTimeout(1500);
    const with0 = await timed(page);
    out.busiest = { style: busiest.style, with3: { figures: n3, ...with3 }, with0 };
    console.log("busiest room frame time", JSON.stringify(out.busiest));
    await ctx.close();
  }
} finally {
  console.log("pageErrors", JSON.stringify(errors));
  console.log("offHost", JSON.stringify(offHost));
  console.log("seconds", Math.round((Date.now() - t0) / 1000));
  console.log("RESULT", JSON.stringify(out));
  await browser.close(); await close();
}
if (errors.length) fail += 1;
console.log(fail ? `${fail} drive step(s) failed` : "All drive steps pass.");
process.exit(fail ? 1 : 0);
