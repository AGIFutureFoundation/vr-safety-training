#!/usr/bin/env node
// AVATARS-HD-5 drive (not in the gate): the BUILT parishes page on the desktop high tier, signed in, voice off. Moods in the page.
//   The panel's hive runs with moods on (HIVE-6; HIVE-8 turned the scene's hive on too). The hive is stepped past minute 150 to the first
//   minute where one agent is concerned (after a refusal) and another calm; the learner then enters the operations room (oak-west-
//   oakland), mid-day. Each built figure's posture mood (the aa mount's state(id).mood) is compared with HIVE-7's glow mood (the room's
//   moods()) and with the hive's own mood(id), at entry and on every hive step for 60 more minutes. Then a still of the concerned figure
//   beside a calm one, from the front, with the room's counts and page errors / off-host requests throughout. The robot rooms are
//   drive_avatars_hd4.mjs's leg B (run it with tag after and leg B).
// Usage: [python3 tools/bundle_webxr.py parishes &&] node tools/drive_avatars_hd5.mjs [port=9163] [outDir] [tag=after]
import { pathToFileURL, fileURLToPath } from "node:url";
import { join, dirname } from "node:path";
const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const PORT = Number(process.argv[2] ?? 9163), OUT = process.argv[3] ?? ".", TAG = process.argv[4] ?? "after";
const { pvServe, pvLaunch, pvContext, pvLoad } = await import(pathToFileURL(join(ROOT, "tools/lib/pv_browser.mjs")).href);
const { IX_BUDGET } = await import(pathToFileURL(join(ROOT, "WebXR/shared/ix-interiors.js")).href);
const { base, close } = await pvServe(PORT);
const browser = await pvLaunch();
const errors = [], offHost = [];
const t0 = Date.now();
let fail = 0;
const check = (cond, what) => { console.log(`${cond ? "PASS" : "FAIL"} ${what}`); if (!cond) fail += 1; };
const hideOverlays = (page) => page.evaluate(() => { for (const el of document.body.querySelectorAll("*")) { if (el.tagName === "CANVAS" || el.querySelector("canvas")) continue; const cs = getComputedStyle(el); if ((cs.position === "fixed" || cs.position === "absolute") && cs.visibility !== "hidden") { el.dataset.ah5Hid = "1"; el.style.visibility = "hidden"; } } });
const showOverlays = (page) => page.evaluate(() => { for (const el of document.querySelectorAll("[data-ah5-hid]")) { el.style.visibility = ""; delete el.dataset.ah5Hid; } });
const pose = (page, x, z, yaw, pitch) => page.evaluate(({ x, z, yaw, pitch }) => { const T = window.__parishTest, ix = T.interiors.mount; ix.pose.x = x; ix.pose.z = z; T.np.yaw = yaw; T.np.pitch = pitch; if (ix.pose.yaw !== undefined) { ix.pose.yaw = yaw; ix.pose.pitch = pitch; } }, { x, z, yaw, pitch });
const out = { tag: TAG };
try {
  const ctx = await pvContext(browser, { viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 });
  await ctx.addInitScript(() => { try { localStorage.setItem("vr-training-auth-v1", JSON.stringify({ id: "learner-ah5-drive" })); } catch (_) { /* storage blocked */ } });
  const page = await ctx.newPage();
  page.on("pageerror", (e) => errors.push(String(e.message).split("\n")[0]));
  page.on("request", (r) => { const u = r.url(); if (u.startsWith("http://127.0.0.1") || u.startsWith("data:") || u.startsWith("blob:")) return; if (/cdnjs\.cloudflare\.com\/ajax\/libs\/(three\.js|react)/.test(u) || /fonts\.(googleapis|gstatic)/.test(u)) return; offHost.push(u); });
  await page.goto(`${base}/parishes/dist/parishes.html?parish=oak-west-oakland&tier=high`, { waitUntil: "load", timeout: 240000 });
  await page.waitForFunction(() => !!window.__parishTest?.hive?.hive && !!window.__parishTest?.hiveWorld, null, { timeout: 240000 });
  await page.evaluate(() => { const s = document.querySelector("[data-ux-ob-skip]"); if (s && s.offsetParent) s.click(); });
  // the hive to a refusal: the first minute after 150 with a concerned agent and a calm one
  const at = await page.evaluate(() => {
    const P = window.__parishTest.hive, H = P.hive;
    const moods = () => Object.fromEntries(H.agents.map((a) => [a.id, H.mood?.(a.id)?.mood ?? null]));
    while (H.now() < 150) P.step();
    let m = moods();
    while (H.now() < 470 && !(Object.values(m).includes("concerned") && Object.values(m).includes("calm"))) { P.step(); m = moods(); }
    const refusals = H.events().filter((e) => e.type === "refused").length, moodEvents = H.events().filter((e) => e.type === "mood").length;
    return { t: H.now(), moods: m, refusals, moodEvents, hasMood: typeof H.mood === "function" };
  });
  console.log("hive", JSON.stringify(at));
  out.at = at;
  check(at.hasMood && Object.values(at.moods).includes("concerned"), `the page's hive runs with moods: at minute ${at.t} after ${at.refusals} refusals and ${at.moodEvents} mood events, moods ${JSON.stringify(at.moods)}`);
  console.log("enter", JSON.stringify(await page.evaluate(() => window.__parishTest.hd4.opsRoom())));
  await page.waitForTimeout(3000);
  // posture = glow = hive at entry and on every step for 60 more minutes (the room animates between steps)
  const compare = () => page.evaluate(() => {
    const H = window.__parishTest.hive.hive, m = window.__parishTest.hiveWorld.room(), glow = m?.moods?.() ?? {};
    const rows = [];
    for (const p of m?.placed ?? []) {
      const id = p.agent.id; if (!m.avatars.figure(id)) continue;
      rows.push({ id, name: p.agent.name, hive: H.mood(id)?.mood ?? "calm", posture: m.avatars.state(id).mood ?? "calm", glow: glow[id]?.mood ?? null, k: glow[id]?.glow ?? null, painted: m.avatars.figure(id).userData?.h7Mood ?? null, level: m.avatars.state(id).level });
    }
    return { t: H.now(), rows };
  });
  const entry = await compare();
  out.entry = entry;
  console.log("entry moods", JSON.stringify(entry));
  let agree = 0, n = 0, nonCalm = 0, misses = [];
  const tally = (s) => { for (const r of s.rows) { n += 1; if (r.hive !== "calm") nonCalm += 1; if (r.posture === r.hive && r.glow === r.hive && r.painted === r.hive) agree += 1; else if (misses.length < 5) misses.push({ t: s.t, ...r }); } };
  tally(entry);
  // the still first, while the refusal is fresh: step (tallied) until a concerned figure stands beside a calm one, at most 30 minutes
  const hasPair = () => page.evaluate(() => { const m = window.__parishTest.hiveWorld.room(); const s = (m?.placed ?? []).map((p) => ({ id: p.agent.id, ...m.avatars.state(p.agent.id) })).filter((x) => m.avatars.figure(x.id) && !x.walking); return s.some((x) => x.mood === "concerned") && s.some((x) => (x.mood ?? "calm") === "calm"); });
  for (let k = 0; k < 30 && !(await hasPair()); k += 1) { await page.evaluate(() => window.__parishTest.hive.step()); await page.waitForTimeout(400); tally(await compare()); }
  // the still: a concerned figure beside a calm one, from the front (the room held so nothing walks off between the pose and the shot)
  const pair = await page.evaluate(() => {
    const H = window.__parishTest.hive.hive, m = window.__parishTest.hiveWorld.room();
    const s = (m.placed ?? []).map((p) => { const st = m.avatars.state(p.agent.id); return { ...st, id: p.agent.id, name: p.agent.name, mood: st.mood ?? "calm" }; }).filter((x) => m.avatars.figure(x.id) && !x.walking);
    const c = s.find((x) => x.mood === "concerned"); if (!c) return null;
    const calm = s.filter((x) => x.mood === "calm" && x.id !== c.id).sort((a, b) => Math.hypot(a.x - c.x, a.z - c.z) - Math.hypot(b.x - c.x, b.z - c.z))[0]; if (!calm) return null;
    window.__ah5Animate = m.animate; m.animate = (t, dt) => { m.avatars.animate(t, dt, null); };
    return { concerned: { id: c.id, name: c.name, x: c.x, z: c.z, yaw: c.yaw, level: c.level, hive: H.mood(c.id).mood }, calm: { id: calm.id, name: calm.name, x: calm.x, z: calm.z, yaw: calm.yaw, level: calm.level, hive: H.mood(calm.id).mood } };
  });
  out.pair = pair;
  if (pair) {
    const mx = (pair.concerned.x + pair.calm.x) / 2, mz = (pair.concerned.z + pair.calm.z) / 2, fy = (pair.concerned.yaw + pair.calm.yaw) / 2;
    const cx = mx + Math.sin(fy) * 2.4, cz = mz + Math.cos(fy) * 2.4, yaw = Math.atan2(-(mx - cx), -(mz - cz));
    await pose(page, cx, cz, yaw, -0.05);
    await page.waitForTimeout(1500);
    await hideOverlays(page); await page.waitForTimeout(300);
    await page.screenshot({ path: join(OUT, "ah5-concerned-beside-calm.png") });
    await showOverlays(page);
    await page.evaluate(() => { const m = window.__parishTest.hiveWorld.room(); if (window.__ah5Animate) m.animate = window.__ah5Animate; });
    console.log("still", JSON.stringify({ pair, camera: { x: +cx.toFixed(2), z: +cz.toFixed(2), yaw: +yaw.toFixed(3) } }));
  }
  check(!!pair, `a concerned figure beside a calm one for the still: ${pair ? `${pair.concerned.name} (concerned, ${pair.concerned.level}) and ${pair.calm.name} (calm, ${pair.calm.level})` : "none standing"}`);
  for (let k = 0; k < 60; k += 1) {
    await page.evaluate(() => window.__parishTest.hive.step());
    await page.evaluate(() => new Promise((res) => requestAnimationFrame(() => requestAnimationFrame(res))));
    tally(await compare());
  }
  out.agree = { agree, n, nonCalm, misses };
  check(n > 0 && nonCalm > 0 && agree === n, `posture and glow name the same mood in the built page (entered mid-day at minute ${entry.t}, then 60 hive minutes): ${agree} of ${n} figure-samples (posture = glow = hive.mood(id); ${nonCalm} not calm)${misses.length ? ` misses ${JSON.stringify(misses)}` : ""}`);
  const counts = await page.evaluate(() => { const r = window.__parishTest.hd4.measure(); const m = window.__parishTest.hiveWorld.room(); return { meshes: r.meshes, trianglesBuilt: r.trianglesBuilt, drawn: r.triangles, calls: r.calls, levels: m?.avatars?.counts?.().levels ?? null, standing: m?.standing?.()?.length ?? 0 }; });
  out.counts = counts;
  check(counts.meshes <= IX_BUDGET.meshes && counts.trianglesBuilt <= IX_BUDGET.triangles.high, `the ops room in the built page with moods: ${counts.standing} standing, levels ${JSON.stringify(counts.levels)}, ${counts.meshes} meshes, ${counts.trianglesBuilt} triangles built (≤ ${IX_BUDGET.meshes} / ${IX_BUDGET.triangles.high}, margin ${IX_BUDGET.triangles.high - counts.trianglesBuilt}), ${counts.calls} draw calls`);
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
