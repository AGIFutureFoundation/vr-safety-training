#!/usr/bin/env node
// MOODS drive (loop 10 round 9; not in the gate): the BUILT parishes page on the desktop high tier, signed in, voice off.
//   A. The operations room (oak-west-oakland). The panel's hive is stepped past minute 150 to the first minute with a concerned agent and
//      a calm one; the learner enters the room. At the figures' FIRST FRAME (the first animation frame after the room mounts) and after
//      60 more hive minutes, every built figure's posture mood (the aa mount's state(id).mood), HIVE-7's glow mood (the room's moods() and
//      the mood the glow last painted) and the hive's own mood(id) are compared. Then a still from the door (the entry pose), with one
//      concerned figure in the room, and the distance from the camera to it.
//   B. "A day in the hive" on sf-downtown with hold: "award": the scene stops once the award has played, the cell hall's figures are
//      compared with the relay's released moods, a still is taken (the planner busy at the award, the caption bar up), and the scene is
//      resumed to its end. Page errors and off-host requests are recorded throughout.
// Usage: python3 tools/bundle_webxr.py parishes && node tools/drive_moods.mjs [port=9172] [outDir] [tag=after] [legs=AB]
import { pathToFileURL, fileURLToPath } from "node:url";
import { join, dirname } from "node:path";
const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const PORT = Number(process.argv[2] ?? 9172), OUT = process.argv[3] ?? ".", TAG = process.argv[4] ?? "after", LEGS = process.argv[5] ?? "AB";
const { pvServe, pvLaunch, pvContext, pvLoad } = await import(pathToFileURL(join(ROOT, "tools/lib/pv_browser.mjs")).href);
const { IX_BUDGET } = await import(pathToFileURL(join(ROOT, "WebXR/shared/ix-interiors.js")).href);
const { base, close } = await pvServe(PORT);
const browser = await pvLaunch();
const errors = [], offHost = [];
const t0 = Date.now();
let fail = 0;
const check = (cond, what) => { console.log(`${cond ? "PASS" : "FAIL"} ${what}`); if (!cond) fail += 1; };
const hideOverlays = (page, keep = null) => page.evaluate((keep) => { for (const el of document.body.querySelectorAll("*")) { if (el.tagName === "CANVAS" || el.querySelector("canvas")) continue; if (keep && (el.id === keep || el.closest(`#${keep}`))) continue; const cs = getComputedStyle(el); if ((cs.position === "fixed" || cs.position === "absolute") && cs.visibility !== "hidden") { el.dataset.mdHid = "1"; el.style.visibility = "hidden"; } } }, keep);
const showOverlays = (page) => page.evaluate(() => { for (const el of document.querySelectorAll("[data-md-hid]")) { el.style.visibility = ""; delete el.dataset.mdHid; } });
const frame = (page) => page.evaluate(() => new Promise((res) => requestAnimationFrame(() => res())));
const out = { tag: TAG, load0: pvLoad() };
const newPage = async (ctx) => {
  const page = await ctx.newPage();
  page.on("pageerror", (e) => errors.push(String(e.message).split("\n")[0]));
  page.on("request", (r) => { const u = r.url(); if (u.startsWith("http://127.0.0.1") || u.startsWith("data:") || u.startsWith("blob:")) return; if (/cdnjs\.cloudflare\.com\/ajax\/libs\/(three\.js|react)/.test(u) || /fonts\.(googleapis|gstatic)/.test(u)) return; offHost.push(u); });
  return page;
};
try {
  const ctx = await pvContext(browser, { viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 });
  await ctx.addInitScript(() => { try { localStorage.setItem("vr-training-auth-v1", JSON.stringify({ id: "learner-md-drive" })); } catch (_) { /* storage blocked */ } });
  if (LEGS.includes("A")) {
    const page = await newPage(ctx);
    await page.goto(`${base}/parishes/dist/parishes.html?parish=oak-west-oakland&tier=high`, { waitUntil: "load", timeout: 240000 });
    await page.waitForFunction(() => !!window.__parishTest?.hive?.hive && !!window.__parishTest?.hiveWorld, null, { timeout: 240000 });
    await page.evaluate(() => { const s = document.querySelector("[data-ux-ob-skip]"); if (s && s.offsetParent) s.click(); });
    const at = await page.evaluate(() => {
      const P = window.__parishTest.hive, H = P.hive;
      const moods = () => Object.fromEntries(H.agents.map((a) => [a.id, H.mood?.(a.id)?.mood ?? null]));
      while (H.now() < 150) P.step();
      let m = moods();
      while (H.now() < 470 && !(Object.values(m).includes("concerned") && Object.values(m).includes("calm"))) { P.step(); m = moods(); }
      return { t: H.now(), moods: m, refusals: H.events().filter((e) => e.type === "refused").length, moodEvents: H.events().filter((e) => e.type === "mood").length };
    });
    out.at = at;
    console.log("hive", JSON.stringify(at));
    const compare = () => page.evaluate(() => {
      const H = window.__parishTest.hive.hive, m = window.__parishTest.hiveWorld.room(), glow = m?.moods?.() ?? {};
      const rows = [];
      for (const p of m?.placed ?? []) {
        const id = p.agent.id; if (!m.avatars.figure(id)) continue;
        const s = m.avatars.state(id);
        rows.push({ id, name: p.agent.name, hive: H.mood(id)?.mood ?? "calm", posture: s.mood ?? "calm", seeded: !!m.avatars.figure(id) && s.mood != null && !m.avatars.moodLog().some((e) => e.agent === id), glow: glow[id]?.mood ?? null, painted: m.avatars.figure(id).userData?.h7Mood ?? null, level: s.level, x: s.x, z: s.z, walking: !!s.walking });
      }
      return { t: H.now(), rows, mounted: !!m };
    });
    // enter, then sample at the figures' first frame: the first animation frame after the room has mounted its figures
    const enter = await page.evaluate(() => { const r = window.__parishTest.hd4.opsRoom(); return { ...r, pose: { x: window.__parishTest.interiors.mount.pose.x, z: window.__parishTest.interiors.mount.pose.z } }; });
    console.log("enter", JSON.stringify(enter));
    let frames = 0, first = null;
    for (; frames < 120; frames += 1) { await frame(page); const s = await compare(); if (s.mounted && s.rows.length) { first = s; break; } }
    out.first = { frames: frames + 1, ...first };
    const agreeOf = (s) => s.rows.filter((r) => r.posture === r.hive && r.glow === r.hive && r.painted === r.hive).length;
    console.log("first frame", JSON.stringify(out.first));
    check(!!first && first.rows.length > 0 && agreeOf(first) === first.rows.length, `posture = glow = hive.mood(id) at the figures' first frame (frame ${frames + 1} after entering at minute ${first?.t}): ${first ? agreeOf(first) : 0} of ${first?.rows.length ?? 0} figures (${first?.rows.filter((r) => r.hive !== "calm").length ?? 0} not calm: ${[...new Set(first?.rows.filter((r) => r.hive !== "calm").map((r) => r.hive) ?? [])].join(", ")})`);
    // 60 hive minutes, a frame per minute, every figure tallied; then the sample at minute 60
    let agree = 0, n = 0, nonCalm = 0; const misses = [];
    const tally = (s) => { for (const r of s.rows) { n += 1; if (r.hive !== "calm") nonCalm += 1; if (r.posture === r.hive && r.glow === r.hive && r.painted === r.hive) agree += 1; else if (misses.length < 5) misses.push({ t: s.t, ...r }); } };
    tally(first);
    let last = first;
    for (let k = 0; k < 60; k += 1) { await page.evaluate(() => window.__parishTest.hive.step()); await frame(page); last = await compare(); tally(last); }
    out.minute60 = last; out.agree = { agree, n, nonCalm, misses };
    check(agreeOf(last) === last.rows.length && last.rows.length > 0, `posture = glow = hive.mood(id) after 60 hive minutes (minute ${last.t}): ${agreeOf(last)} of ${last.rows.length} figures (${last.rows.filter((r) => r.hive !== "calm").length} not calm)`);
    check(n > 0 && nonCalm > 0 && agree === n, `every frame between: ${agree} of ${n} figure-samples agree (${nonCalm} not calm)${misses.length ? ` misses ${JSON.stringify(misses)}` : ""}`);
    // the still from the door: the entry pose (the learner at the door corner), with a concerned figure standing in the room
    let standing = last.rows.filter((r) => !r.walking && r.posture === "concerned");
    for (let k = 0; k < 40 && !standing.length; k += 1) { await page.evaluate(() => window.__parishTest.hive.step()); await frame(page); last = await compare(); standing = last.rows.filter((r) => !r.walking && r.posture === "concerned"); }
    const cam = await page.evaluate(() => { const ix = window.__parishTest.interiors.mount; return { x: ix.pose.x, z: ix.pose.z, yaw: window.__parishTest.np.yaw }; });
    const dist = standing.length ? Math.hypot(standing[0].x - cam.x, standing[0].z - cam.z) : null;
    await page.waitForTimeout(800);
    await hideOverlays(page); await page.waitForTimeout(200);
    await page.screenshot({ path: join(OUT, "md-ops-room-from-door.png") });
    await showOverlays(page);
    out.doorStill = { camera: cam, concerned: standing.map((r) => ({ name: r.name, x: r.x, z: r.z, level: r.level })), distance: dist, moods: last.rows.map((r) => `${r.name}:${r.posture}`) };
    console.log("door still", JSON.stringify(out.doorStill));
    check(standing.length > 0, `the still from the door has a concerned figure standing: ${standing.map((r) => `${r.name} (${r.level})`).join(", ") || "none"} at ${dist?.toFixed(1) ?? "?"} m from the camera`);
    const counts = await page.evaluate(() => { const r = window.__parishTest.hd4.measure(); const m = window.__parishTest.hiveWorld.room(); return { meshes: r.meshes, trianglesBuilt: r.trianglesBuilt, drawn: r.triangles, calls: r.calls, levels: m?.avatars?.counts?.().levels ?? null, standing: m?.standing?.()?.length ?? 0 }; });
    out.counts = counts;
    check(counts.meshes <= IX_BUDGET.meshes && counts.trianglesBuilt <= IX_BUDGET.triangles.high, `the ops room in the built page: ${counts.standing} standing, levels ${JSON.stringify(counts.levels)}, ${counts.meshes} meshes, ${counts.trianglesBuilt} triangles built (≤ ${IX_BUDGET.meshes} / ${IX_BUDGET.triangles.high}, margin ${IX_BUDGET.triangles.high - counts.trianglesBuilt}), ${counts.calls} draw calls`);
    await page.close();
  }
  if (LEGS.includes("B")) {
    const page = await newPage(ctx);
    await page.goto(`${base}/parishes/dist/parishes.html?parish=sf-downtown&tier=high`, { waitUntil: "load", timeout: 240000 });
    await page.waitForFunction(() => !!window.__parishTest?.hive?.hive && typeof window.__parishTest?.hiveScene === "function", null, { timeout: 240000 });
    await page.evaluate(() => { const s = document.querySelector("[data-ux-ob-skip]"); if (s && s.offsetParent) s.click(); });
    const started = await page.evaluate(() => { const r = window.__parishTest.hiveScene({ seed: 1, hold: "award" }); return { ok: r.ok, hold: r.hold, seed: r.seed }; });
    console.log("scene", JSON.stringify(started));
    check(started.ok && started.hold === "award", `the scene starts with hold: "award" (seed ${started.seed})`);
    await page.waitForFunction(() => window.__parishTest.hiveSceneState()?.held === true, null, { timeout: 120000 });
    await frame(page);
    const held = await page.evaluate(() => window.__parishTest.hiveSceneState());
    out.held = held;
    console.log("held", JSON.stringify(held));
    const planner = "oh-maintenance-planner";
    const pairs = Object.entries(held.room?.posture ?? {}).map(([id, p]) => ({ id, posture: p ?? "calm", relay: held.moods[id] ?? "calm" }));
    check(held.held && held.beats === 4 && held.moods[planner] === "busy", `the scene holds at the award: ${held.beats} beats played, t ${held.t}; the planner's released mood is ${held.moods[planner]}`);
    check(pairs.length > 0 && pairs.every((p) => p.posture === p.relay), `the cell hall's figures' posture = the relay's released mood while held: ${pairs.filter((p) => p.posture === p.relay).length} of ${pairs.length} (${pairs.map((p) => `${p.id.replace("oh-", "")}:${p.posture}`).join(", ")})`);
    // the still: the award beat held, the planner busy, the caption bar up (it is the scene's own caption)
    await page.waitForTimeout(600);
    await hideOverlays(page, "h3-scene"); await page.waitForTimeout(200);
    const tStill = Date.now();
    await page.screenshot({ path: join(OUT, "md-scene-award-held.png") });
    await showOverlays(page);
    const after = await page.evaluate(() => window.__parishTest.hiveSceneState());
    out.stillSeconds = Math.round((Date.now() - tStill) / 1000); out.afterStill = after;
    check(after?.held === true && after.beats === 4, `the scene is still held after the still (${out.stillSeconds} s in software rendering): ${after?.beats} beats, t ${after?.t}`);
    await page.evaluate(() => window.__parishTest.hiveSceneResume());
    const done = await page.evaluate(() => Promise.race([window.__parishTest.hiveSceneDone, new Promise((res) => setTimeout(() => res(null), 150000))]));
    out.sceneDone = done ? { beats: done.beats.length, errors: done.errors, metrics: done.metrics, verify: done.verify } : null;
    check(!!done && done.beats.length === 12 && done.errors === 0 && done.metrics.physicalDispatched === 0 && done.verify.ok, `resumed to the end: ${done?.beats.length} of 12 beats, scene errors ${done?.errors}, physical dispatched ${done?.metrics.physicalDispatched}, chain ${done?.verify.ok ? "intact" : "broken"}`);
    await page.close();
  }
  out.load = pvLoad();
  await ctx.close();
} finally {
  console.log("pageErrors", JSON.stringify(errors));
  console.log("offHost", JSON.stringify(offHost));
  console.log("seconds", Math.round((Date.now() - t0) / 1000), "load", pvLoad());
  console.log("RESULT", JSON.stringify(out));
  await browser.close(); await close();
}
if (errors.length || offHost.length) fail += 1;
console.log(fail ? `${fail} drive step(s) failed` : "All drive steps pass.");
process.exit(fail ? 1 : 0);
