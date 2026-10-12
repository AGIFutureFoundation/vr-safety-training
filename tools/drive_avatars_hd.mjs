#!/usr/bin/env node
/**
 * AVATARS-HD (docs/consoles/AVATARS-HD.md): the headless drive of the BUILT parishes page and instructor console.
 *
 *   A. Per render tier (low, balanced, high) on sf-downtown, signed in (so the hive is mounted): the agent layer's figures
 *      (how many are high-detail), meshes, sprites and triangles, and the renderer's draw calls and triangles with the camera on
 *      the robot site, layer shown against layer hidden (hidden = no agent drawn: nothing else differs).
 *   B. 1920 × 1080 stills, high and balanced: the seven hive agents brought to the SoMa robot cell through the mount's own
 *      move events, then stood in a row for the capture (the drive writes the figures' positions and holds the mount's animate
 *      while the frame is taken, so the pose in the still is the one asked for). Stills: ah-seven-high.png, ah-seven-balanced.png,
 *      ah-speaking-high.png (one of the hive's own lines, seed 1, replayed on its agent: mouth open, caption showing) and
 *      ah-stop-high.png (one of the hive's own refusals replayed: the stop hand). Draw calls with the seven in view, both tiers.
 *   C. The instructor console's governance roster at device pixel ratio 2 and 3: portraits drawn from the figure, 2× and 3× PNGs.
 *   Page errors and off-host requests are counted throughout (three.js is served from the vendored copy).
 *
 * Not in the gate. Build first, then run (one drive at a time on the machine):
 *     python3 tools/bundle_webxr.py parishes instructor && node tools/drive_avatars_hd.mjs [port] [stillsDir]
 */
import { pathToFileURL, fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { mkdirSync } from "node:fs";
const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const { pvServe, pvLaunch, pvContext } = await import(pathToFileURL(join(ROOT, "tools/lib/pv_browser.mjs")).href);

const PORT = Number(process.argv[2]) || 9121, SHOTS = process.argv[3] ?? process.env.AH_SHOTS ?? join(ROOT, ".ah-shots"), ONLY = String(process.argv[4] ?? "ABC").toUpperCase();
mkdirSync(SHOTS, { recursive: true });
const { base, close } = await pvServe(PORT);
const browser = await pvLaunch();
const out = { pageErrors: [], offHost: [], fails: 0 };
const log = (k, v) => console.log(k, typeof v === "string" ? v : JSON.stringify(v));
const want = (cond, what, detail) => { if (!cond) out.fails += 1; console.log(`${cond ? "  ✓" : "  ✗"} ${what}${detail !== undefined ? ` — ${typeof detail === "string" ? detail : JSON.stringify(detail)}` : ""}`); return cond; };

async function open(url, { tier = "high", width = 800, height = 450, dpr = 1, auth = true, plain = false } = {}) {
  const context = await pvContext(browser, { viewport: { width, height }, deviceScaleFactor: dpr });
  if (auth) await context.addInitScript(() => { try { localStorage.setItem("vr-training-auth-v1", JSON.stringify({ id: "learner-ah-drive" })); } catch (_) { /* storage blocked */ } });
  const page = await context.newPage();
  page.on("pageerror", (e) => out.pageErrors.push(`${url.split("?")[1] ?? url}: ${String(e.message).split("\n")[0]}`));
  page.on("request", (r) => { const u = r.url(); if (u.startsWith("http://127.0.0.1") || u.startsWith("data:") || u.startsWith("blob:")) return; if (/cdnjs\.cloudflare\.com\/ajax\/libs\/(three\.js|react)/.test(u) || /fonts\.(googleapis|gstatic)/.test(u)) return; out.offHost.push(u); });
  await page.goto(plain ? url : `${url}&tier=${tier}`, { waitUntil: "load", timeout: 180000 });
  if (!plain) await page.waitForFunction(() => "agentAvatars" in (window.__parishTest ?? {}) && !!window.__parishTest?.robotics && "hive" in window.__parishTest, null, { timeout: 180000 });
  return { page, context };
}
const parishUrl = (map) => `${base}/parishes/dist/parishes.html?parish=${map}`;
const frames = (page, n = 2) => page.evaluate((k) => new Promise((r) => { let i = 0; const f = () => (++i >= k ? r() : requestAnimationFrame(f)); requestAnimationFrame(f); }), n);

// ---------------------------------------------------------------- A. per tier: the layer's cost, measured in the page
const tiers = {};
for (const tier of ONLY.includes("A") ? ["low", "balanced", "high"] : []) {
  const { page, context } = await open(parishUrl("sf-downtown"), { tier });
  tiers[tier] = await page.evaluate(async () => {
    const T = window.__parishTest, aa = T.agentAvatars, site = T.robotics.sites[0];
    const frame = () => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
    T.teleport(site.position[0], site.position[1] + 24, 0, -0.12);
    for (let i = 0; i < 24; i += 1) await frame();
    const sceneCount = () => { let meshes = 0, sprites = 0; aa?.root?.traverseVisible?.((o) => { if (o.isSprite) sprites += 1; else if (o.isMesh) meshes += 1; }); return { layerMeshes: meshes, layerSprites: sprites }; }; // (__parishTest.scene is the exteriors' shot preset now)
    const measure = async () => { await frame(); const i = T.npRenderer.info.render; return { calls: i.calls, triangles: i.triangles, ...sceneCount() }; };
    const withLayer = await measure();
    if (aa?.root) aa.root.visible = false;
    const without = await measure();
    if (aa?.root) aa.root.visible = true;
    return { hive: !!T.hive?.hive, layer: aa?.counts() ?? null, before: without, after: withLayer };
  });
  log(`A.${tier}`, tiers[tier]);
  await context.close();
}
if (ONLY.includes("A")) want(tiers.low.layer?.figures === 0 && tiers.low.after.calls === tiers.low.before.calls && tiers.low.after.triangles === tiers.low.before.triangles, "phone tier: no agent figure — draw calls and triangles unchanged with the layer", { before: tiers.low.before, after: tiers.low.after });
if (ONLY.includes("A")) want(tiers.balanced.layer?.figures > 0 && tiers.balanced.layer.hd === 0, `balanced: today's figure (${tiers.balanced.layer?.figures} figures, 0 high-detail)`, tiers.balanced.layer);
if (ONLY.includes("A")) want(tiers.high.layer?.figures > 0 && tiers.high.layer.hd === tiers.high.layer.figures && tiers.high.layer.worstPerFigure <= 12, `high: every figure high-detail (${tiers.high.layer?.hd} of ${tiers.high.layer?.figures}), worst ${tiers.high.layer?.worstPerFigure} meshes + sprites per figure`, tiers.high.layer);

// ---------------------------------------------------------------- B. the seven at 1920 × 1080, high and balanced
const stills = {};
for (const tier of ONLY.includes("B") ? ["high", "balanced"] : []) {
  const { page, context } = await open(parishUrl("sf-downtown"), { tier, width: 1920, height: 1080 });
  const setup = await page.evaluate(async () => {
    const T = window.__parishTest, aa = T.agentAvatars, hv = T.hive?.hive;
    if (!aa || !hv) return { ok: false, aa: !!aa, hive: !!hv };
    const frame = () => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
    const site = T.robotics.sites.find((s) => s.id === "rb-site-soma-robot-cell") ?? T.robotics.sites[0];
    // the hive's own day (seed 1): collect its lines and refusals; then bring the seven to the cell through the mount's moves
    const said = [], refusals = [];
    const onSpeak = (e) => said.push(e), onRef = (e) => refusals.push(e);
    hv.on("speak", onSpeak); hv.on("refused", onRef);
    for (let i = 0; i < 40 && (refusals.length < 1 || said.length < 12); i += 1) hv.step();
    hv.off?.("speak", onSpeak); hv.off?.("refused", onRef);
    const seven = hv.agents.map((a) => a.id);
    for (const id of seven) aa.handle({ type: "move", agent: id, to: site.id });
    for (let i = 0; i < 6; i += 1) await frame();
    window.__ahSeven = { seven, site: { id: site.id, x: site.position[0], z: site.position[1] }, said, refusals };
    return { ok: true, seven, said: said.length, refusals: refusals.length, site: site.id };
  });
  log(`B.${tier}.setup`, setup);
  if (!setup.ok) { want(false, `${tier}: the hive and the avatars are mounted for the stills`, setup); await context.close(); continue; }
  // the row: the seven 1.3 m apart, 10 m north of the cell's centre, facing south; the camera south of the row, looking north
  async function shoot(name, focusSrc, cam) {
    const info = await page.evaluate(async ({ focusSrc, cam }) => {
      const T = window.__parishTest, aa = T.agentAvatars, S = window.__ahSeven;
      if (!aa.__ahAnimate) aa.__ahAnimate = aa.animate;
      const frame = () => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
      aa.animate = aa.__ahAnimate; await frame();
      const rowZ = S.site.z - 10, n = S.seven.length, GAP = 1.75;
      const place = () => S.seven.forEach((id, i) => { const g = aa.figure(id); if (!g) return; const st = aa.state(id); g.position.set(S.site.x + (i - (n - 1) / 2) * GAP, st.y, rowZ); g.rotation.y = 0; g.visible = true; });
      // the page's own panels are hidden for the still (the canvas and its parents stay); the 3D frame is the page's own
      const cv = T.npRenderer.domElement; for (const el of document.body.querySelectorAll("*")) if (el !== cv && !el.contains(cv)) el.style.visibility = "hidden";
      if (cam.settle) { let t = aa.clock(); for (let k = 0; k < 60; k += 1) { t += 0.5; aa.__ahAnimate(t, 0.5, null); } } // let earlier lines end: no caption in the row still
      let held = null;
      if (focusSrc) { const fn = new Function("aa", "S", focusSrc); aa.animate = () => {}; held = fn(aa, S); } // the focus runs the mount's clock itself
      aa.animate = () => {};
      place();
      const tx = S.site.x + (cam.dx ?? 0), tz = rowZ + cam.dz;
      T.teleport(tx, tz, cam.yaw ?? 0, cam.pitch ?? -0.06);
      for (let i = 0; i < 3; i += 1) await frame();
      const i0 = T.npRenderer.info.render; const withLayer = { calls: i0.calls, triangles: i0.triangles };
      aa.root.visible = false; await frame(); const i1 = T.npRenderer.info.render; const without = { calls: i1.calls, triangles: i1.triangles }; aa.root.visible = true; await frame();
      return { held, withLayer, without, hd: aa.counts().hd, figures: aa.counts().figures };
    }, { focusSrc, cam });
    await frames(page, 2);
    const file = join(SHOTS, name);
    await page.screenshot({ path: file, type: "png" });
    log(`B.${tier}.${name}`, info);
    return { file, ...info };
  }
  stills[`seven-${tier}`] = await shoot(`ah-seven-${tier}.png`, null, { dz: 6.4, pitch: -0.06, settle: true });
  if (tier === "high") {
    // a speaking agent: one of the hive's own lines (seed 1) replayed on its agent; the mount's clock runs to a moment the mouth is wide open
    stills.speaking = await shoot("ah-speaking-high.png", `
      const e = S.said.find((x) => S.seven.includes(x.agent) && String(x.text ?? "").split(/\\s+/).length >= 6) ?? S.said[0];
      const i = S.seven.indexOf(e.agent); let t = aa.clock() + 0.05; aa.__ahAnimate(t, 0.05, null);
      aa.handle(e); let m = 0;
      for (let k = 0; k < 400 && m < 0.9; k += 1) { t += 0.01; aa.__ahAnimate(t, 0.01, null); m = aa.state(e.agent).mouth; }
      return { agent: e.agent, index: i, text: e.text, caption: aa.state(e.agent).caption, mouth: m, talk: aa.state(e.agent).talkVisible };
    `, { dz: 2.7, pitch: 0.18, dx: 0 });
    // re-aim at the speaker if it is not in the middle of the row
    if (stills.speaking?.held && stills.speaking.held.index !== 3) stills.speaking = await shoot("ah-speaking-high.png", `
      const e = S.said.find((x) => x.agent === "${stills.speaking.held.agent}" && String(x.text ?? "").split(/\\s+/).length >= 6) ?? S.said[0];
      let t = aa.clock() + 0.05; aa.__ahAnimate(t, 0.05, null); aa.handle(e); let m = 0;
      for (let k = 0; k < 400 && m < 0.9; k += 1) { t += 0.01; aa.__ahAnimate(t, 0.01, null); m = aa.state(e.agent).mouth; }
      return { agent: e.agent, index: S.seven.indexOf(e.agent), text: e.text, caption: aa.state(e.agent).caption, mouth: m, talk: aa.state(e.agent).talkVisible };
    `, { dz: 2.7, pitch: 0.18, dx: (stills.speaking.held.index - 3) * 1.75 });
    // a refusal: one of the hive's own refusals replayed; the clock runs to the middle of the stop gesture
    stills.stop = await shoot("ah-stop-high.png", `
      const e = S.refusals.find((x) => S.seven.includes(x.agent)) ?? S.refusals[0];
      let t = aa.clock() + 0.05; aa.__ahAnimate(t, 0.05, null); aa.handle(e);
      for (let k = 0; k < 90; k += 1) { t += 0.01; aa.__ahAnimate(t, 0.01, null); }
      return { agent: e.agent, index: S.seven.indexOf(e.agent), reason: e.reason, gesture: aa.state(e.agent).gesture, caption: aa.state(e.agent).caption };
    `, { dz: 3.4, pitch: 0.02, dx: 0 });
    if (stills.stop?.held && stills.stop.held.index !== 3 && stills.stop.held.index >= 0) stills.stop = await shoot("ah-stop-high.png", `
      const e = S.refusals.find((x) => x.agent === "${stills.stop.held.agent}") ?? S.refusals[0];
      let t = aa.clock() + 0.05; aa.__ahAnimate(t, 0.05, null); aa.handle(e);
      for (let k = 0; k < 90; k += 1) { t += 0.01; aa.__ahAnimate(t, 0.01, null); }
      return { agent: e.agent, index: S.seven.indexOf(e.agent), reason: e.reason, gesture: aa.state(e.agent).gesture, caption: aa.state(e.agent).caption };
    `, { dz: 3.4, pitch: 0.02, dx: (stills.stop.held.index - 3) * 1.75 });
  }
  await context.close();
}
const sh = stills["seven-high"], sb = stills["seven-balanced"];
if (sh && sb) {
  want(sh.hd === sh.figures && sh.hd >= 7 && sb.hd === 0, `the seven in one view: high ${sh.hd} high-detail figures, balanced today's figures`, { high: sh.figures, balanced: sb.figures });
  log("B.calls", { high: { without: sh.without, with: sh.withLayer, added: sh.withLayer.calls - sh.without.calls, tris: sh.withLayer.triangles - sh.without.triangles }, balanced: { without: sb.without, with: sb.withLayer, added: sb.withLayer.calls - sb.without.calls, tris: sb.withLayer.triangles - sb.without.triangles } });
}
if (stills.speaking?.held) want(stills.speaking.held.mouth >= 0.9 && stills.speaking.held.talk && !!stills.speaking.held.caption, `speaking still: ${stills.speaking.held.agent}'s mouth open (${stills.speaking.held.mouth?.toFixed(2)}) with its caption`, stills.speaking.held.caption);
if (stills.stop?.held) want(stills.stop.held.gesture === "stop", `stop still: ${stills.stop.held.agent} raises the stop hand on the hive's refusal (${stills.stop.held.reason})`, stills.stop.held.caption);

// ---------------------------------------------------------------- C. the instructor roster at 2× and 3×: portraits from the figure
for (const dpr of ONLY.includes("C") ? [2, 3] : []) {
  const { page, context } = await open(`${base}/instructor/dist/instructor-console.html`, { plain: true, auth: false, dpr, width: 1280, height: 800 });
  await page.waitForFunction(() => !!document.getElementById("tab-governance"), null, { timeout: 90000 });
  const r = await page.evaluate(async () => {
    document.getElementById("tab-governance").click();
    const t0 = performance.now();
    while (performance.now() - t0 < 15000) { const imgs = [...document.querySelectorAll("#view-governance .aa-card img")]; if (imgs.length && imgs.every((i) => i.dataset.aaRaster)) break; await new Promise((res) => setTimeout(res, 100)); }
    const imgs = [...document.querySelectorAll("#view-governance .aa-card img")];
    return { dpr: devicePixelRatio, cards: imgs.length, imgs: imgs.map((i) => ({ css: i.width, natural: i.naturalWidth, raster: i.dataset.aaRaster ?? null, source: i.dataset.aaSource ?? null })) };
  });
  log(`C.${dpr}x`, { dpr: r.dpr, cards: r.cards, first: r.imgs[0] });
  want(r.cards >= 4 && r.imgs.every((i) => i.source === "figure" && i.natural === i.css * dpr && i.raster === `png@${dpr}x`), `instructor roster at ${dpr}×: ${r.cards} portraits drawn from the figure, ${r.imgs[0]?.natural} px PNGs at ${r.imgs[0]?.css} px`);
  if (dpr === 3) { try { await page.locator("#view-governance .aa-roster").first().screenshot({ path: join(SHOTS, "ah-roster-3x.png"), timeout: 30000 }); } catch (e) { console.log("  (roster screenshot skipped: " + String(e.message).split("\n")[0] + ")"); } }
  await context.close();
}

want(out.pageErrors.length === 0, `page errors: ${out.pageErrors.length}`, out.pageErrors.slice(0, 5));
want(out.offHost.length === 0, `off-host requests: ${out.offHost.length}`, out.offHost.slice(0, 5));
await browser.close(); close();
console.log(out.fails ? `\n${out.fails} drive step(s) failed.` : "\nAll drive steps pass.");
process.exit(out.fails ? 1 : 0);
