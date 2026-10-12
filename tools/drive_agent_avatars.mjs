#!/usr/bin/env node
/**
 * AGENT-AVATARS (docs/consoles/AGENT-AVATARS.md): the headless drive of the BUILT parishes page and instructor console.
 *
 *   1. Per render tier (low, balanced, high) on sf-downtown: the agent layer's meshes, sprites, triangles and texture bytes,
 *      and the renderer's draw calls and triangles with the camera on the robot site, layer shown against layer hidden
 *      (hidden = the tree before this console: nothing else differs).
 *   2. High tier, sf-downtown: the agent-jobs panel runs queue job 1; the provider's figure must stand at the job's site,
 *      the client, governor and evaluator speak with captions, the evaluator nods.
 *   3. High tier, oak-west-oakland: a fixture hive of three agents (the contract's events, played in real frames); the talk
 *      light must be on exactly in each line's window (every frame sampled), a caption must carry every line, a move walks.
 *   4. Reduced motion: the same move jumps; captions still show.
 *   5. The instructor console's governance tab at deviceScaleFactor 2: the roster's portraits rasterise to 2× PNGs.
 *   Page errors and external requests are counted throughout (three.js is served from the vendored copy).
 *
 * Not in the gate (it boots the full page several times). Build first, then run:
 *     python3 tools/bundle_webxr.py parishes instructor && node tools/drive_agent_avatars.mjs [port]
 */
import { pathToFileURL, fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const { pvServe, pvLaunch, pvContext } = await import(pathToFileURL(join(ROOT, "tools/lib/pv_browser.mjs")).href);

const { base, close } = await pvServe(Number(process.argv[2]) || 9092);
const browser = await pvLaunch();
const out = { pageErrors: [], offHost: [], fails: 0 };
const log = (k, v) => console.log(k, typeof v === "string" ? v : JSON.stringify(v));
const want = (cond, what, detail) => { if (!cond) out.fails += 1; console.log(`${cond ? "  ✓" : "  ✗"} ${what}${detail !== undefined ? ` — ${typeof detail === "string" ? detail : JSON.stringify(detail)}` : ""}`); };

async function open(url, opts = {}) {
  const context = await pvContext(browser, opts);
  const page = await context.newPage();
  page.on("pageerror", (e) => out.pageErrors.push(`${url.split("?")[1] ?? url}: ${String(e.message).split("\n")[0]}`));
  page.on("request", (r) => { const u = r.url(); if (u.startsWith("http://127.0.0.1") || u.startsWith("data:") || u.startsWith("blob:")) return; if (/cdnjs\.cloudflare\.com\/ajax\/libs\/(three\.js|react)/.test(u) || /fonts\.(googleapis|gstatic)/.test(u)) return; out.offHost.push(u); });
  await page.goto(url, { waitUntil: "load", timeout: 120000 });
  return { page, context };
}
const parishUrl = (map, extra = "") => `${base}/parishes/dist/parishes.html?parish=${map}${extra}`;
const ready = (page) => page.waitForFunction(() => !!window.__parishTest?.vbridge && "agentAvatars" in window.__parishTest && !!window.__parishTest?.robotics, null, { timeout: 120000 });

// ---------------------------------------------------------------- 1. per tier: the layer's cost, measured
const tiers = {};
for (const tier of ["low", "balanced", "high"]) {
  const { page, context } = await open(parishUrl("sf-downtown", `&tier=${tier}`));
  await ready(page);
  tiers[tier] = await page.evaluate(async () => {
    const T = window.__parishTest, aa = T.agentAvatars, site = T.robotics.sites[0];
    const frame = () => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
    // stand 24 m south of the site looking north at it (the agents stand on its north, east and west sides)
    T.teleport(site.position[0], site.position[1] + 24, 0, -0.12);
    for (let i = 0; i < 30; i++) await frame();
    const sceneCount = () => { let meshes = 0, sprites = 0; T.scene.traverseVisible((o) => { if (o.isSprite) sprites += 1; else if (o.isMesh) meshes += 1; }); return { meshes, sprites }; };
    const measure = async () => { await frame(); const i = T.npRenderer.info.render; return { calls: i.calls, triangles: i.triangles, ...sceneCount() }; };
    const withLayer = await measure();
    if (aa?.root) aa.root.visible = false;
    const without = await measure();
    if (aa?.root) aa.root.visible = true;
    const c = aa?.counts() ?? null;
    return { tier: document.documentElement.dataset.tier ?? null, layer: c, before: without, after: withLayer, figuresAt: aa?.agents().map((s) => [s.id, s.site, s.slot, s.visible]) ?? [] };
  });
  log(`1.${tier}`, tiers[tier]);
  await context.close();
}
want(tiers.low.layer?.figures === 0 && tiers.low.after.meshes === tiers.low.before.meshes && tiers.low.after.calls === tiers.low.before.calls, "phone tier: no agent figures — meshes, draw calls and triangles unchanged", { before: tiers.low.before, after: tiers.low.after });
for (const tier of ["balanced", "high"]) {
  const L = tiers[tier].layer;
  want(L?.figures === 4 && L.worstPerFigure <= L.budget, `${tier}: 4 VBRIDGE personas embodied at the robot site, worst ${L?.worstPerFigure} meshes + sprites per figure (≤ ${L?.budget})`, { meshes: L?.meshes, sprites: L?.sprites, triangles: L?.triangles, textureBytes: L?.textureBytes });
}

// ---------------------------------------------------------------- 2. the agent-jobs panel runs a job: the provider stands at the job's site
{
  const { page, context } = await open(parishUrl("sf-downtown"));
  await ready(page);
  const r = await page.evaluate(async () => {
    const T = window.__parishTest, aa = T.agentAvatars, vb = T.vbridge;
    const frame = () => new Promise((res) => requestAnimationFrame(res));
    const job = vb.next(); for (let i = 0; i < 5; i++) await frame();
    const client = aa.state("agent-client"), gov = aa.state("agent-governor");
    vb.approve(); for (let i = 0; i < 10; i++) await frame();
    const prov = aa.state("agent-provider");
    for (let i = 0; i < 200 && vb.state().job.phase === "TRANSACTION"; i++) vb.step();
    for (let i = 0; i < 10; i++) await frame();
    // read the logs, not the instant: under load a frame can outlast a short line
    const caps = aa.captionLog(), lastCap = (id) => caps.filter((c) => c.agent === id).map((c) => c.text).pop() ?? null;
    const site = T.robotics.sites.find((s) => s.id === job.request.siteId);
    return { jobSite: job.request.siteId, phase: vb.state().job.phase, client: lastCap("agent-client"), governor: lastCap("agent-governor"), provider: { site: prov.site, visible: prov.visible, dist: site ? Math.hypot(prov.x - site.position[0], prov.z - site.position[1]) : null, caption: lastCap("agent-provider") },
      evaluator: { caption: lastCap("agent-evaluator"), gesture: aa.gestureLog().filter((g) => g.agent === "agent-evaluator").map((g) => g.kind).pop() ?? null }, client0: client.caption, governor0: gov.caption, labels: aa.agents().map((s) => s.label) };
  });
  log("2.vbridge", r);
  want(r.provider.site === r.jobSite && r.provider.visible && r.provider.dist < 17, "the agent-jobs panel ran job 1: the provider's figure stands at the job's site", `${r.jobSite}, ${r.provider.dist?.toFixed(1)} m from its centre`);
  want(/^Job [0-9a-f]{6}: /.test(r.client ?? "") && /allowed in the sim/.test(r.governor ?? "") && /^Running job/.test(r.provider.caption ?? ""), "the client asks, the governor checks and the provider runs it, each line a caption");
  want(r.phase === "COMPLETED" && r.evaluator.gesture === "nod" && /completed/.test(r.evaluator.caption ?? ""), "the evaluator nods at the completed job", r.evaluator);
  want(r.labels.every((l) => /^software agent · /.test(l)), "every figure is labelled software agent", r.labels);
  await context.close();
}

// ---------------------------------------------------------------- 3. a fixture hive, in real frames
const FIXTURE = `(() => {
  const subs = {}; const src = { on(t, f) { (subs[t] ??= []).push(f); }, off(t, f) { subs[t] = (subs[t] ?? []).filter((x) => x !== f); }, emit(ev) { for (const f of subs[ev.type] ?? []) f(ev); } };
  const A = [
    { id: "fx-dispatcher", name: "Fixture dispatcher", role: "dispatcher", homeSite: "rb-site-west-oakland-port-automation", avatar: { glyph: "dispatch", accent: 0x5ec8d8, outfit: "agent" } },
    { id: "fx-safety-steward", name: "Fixture steward", role: "safety steward", homeSite: "rb-site-west-oakland-warehouse", avatar: { glyph: "steward", accent: 0xd8322c, outfit: "agent" } },
    { id: "fx-logistics", name: "Fixture logistics", role: "logistics", homeSite: "rb-site-west-oakland-port-automation", avatar: { glyph: "logistics", accent: 0xf2c14b, outfit: "agent" } },
  ];
  return { src, A };
})()`;
async function hiveRun(page) {
  return page.evaluate(async (FIX) => {
    const T = window.__parishTest, aa = T.agentAvatars;
    const { src, A } = eval(FIX);
    aa.addAgents(A); aa.attach(src);
    const EV = [
      { type: "speak", agent: "fx-dispatcher", text: "Job j-0001 is up: AMR fleet routing at Automated Warehouse Aisle." },
      { type: "bid", agent: "fx-logistics", jobId: "j-0001" },
      { type: "award", agent: "fx-dispatcher", jobId: "j-0001", caption: "Awarded to logistics." },
      { type: "move", agent: "fx-logistics", to: "rb-site-west-oakland-warehouse" },
      { type: "speak", agent: "fx-logistics", text: "On my way to the warehouse aisle for j-0001." },
      { type: "speak", agent: "fx-logistics", text: "Arrived. Holding at the walkway until it is clear." },
      { type: "refused", agent: "fx-safety-steward", reason: "speed over the site limit", text: "Veto on j-0002: speed over the site limit." },
      { type: "speak", agent: "fx-safety-steward", text: "j-0003 would touch the physical path, which stays disabled. Asking the supervisor." },
      { type: "complete", agent: "fx-logistics", jobId: "j-0001" },
      { type: "speak", agent: "fx-dispatcher", text: "j-0001 complete. Next job in the queue." },
    ];
    const samples = []; let walkSeen = false, walkFrames = 0; const startX = aa.state("fx-logistics").x;
    const frame = () => new Promise((res) => requestAnimationFrame(res));
    const sample = () => { const c = aa.clock(); for (const a of A) { const s = aa.state(a.id); samples.push({ t: c, id: a.id, talk: s.talkVisible, cap: s.captionVisible, text: s.caption }); if (a.id === "fx-logistics" && s.walking) { walkSeen = true; walkFrames += 1; } } };
    for (const ev of EV) { src.emit(ev); sample(); for (let i = 0; i < 25; i++) { await frame(); sample(); } }
    const t0 = performance.now(); while (performance.now() - t0 < 14000) { await frame(); sample(); }
    const logT = aa.talkLog().filter((w) => A.some((a) => a.id === w.agent));
    let exact = 0, bubbles = 0;
    for (const w of logT) {
      const mine = samples.filter((s) => s.id === w.agent);
      const inW = mine.filter((s) => s.t > w.start && s.t < w.end), outAll = mine.filter((s) => !logT.some((x) => x.agent === w.agent && s.t >= x.start && s.t < x.end) && !logT.some((x) => x.agent === w.agent && Math.abs(s.t - x.end) < 1e-6));
      if (inW.length && inW.every((s) => s.talk) && outAll.every((s) => !s.talk)) exact += 1;
      if (mine.some((s) => s.t >= w.start && s.t < w.end && s.cap && s.text === w.text)) bubbles += 1;
    }
    const end = aa.state("fx-logistics");
    return { speaks: EV.filter((e) => e.type === "speak").length, lines: logT.length, exact, bubbles, frames: samples.length / A.length, walkSeen, walkFrames, gestures: aa.gestureLog().filter((g) => A.some((a) => a.id === g.agent)).map((g) => `${g.agent}:${g.kind}`), moved: { from: startX, to: end.x, site: end.site, walking: end.walking }, steward: aa.state("fx-safety-steward").gesture ?? null, figures: aa.counts().figures, worst: aa.counts().worstPerFigure };
  }, FIXTURE);
}
{
  const { page, context } = await open(parishUrl("oak-west-oakland"));
  await ready(page);
  const r = await hiveRun(page);
  log("3.hive", r);
  want(r.lines === r.speaks && r.exact === r.speaks, `fixture hive in real frames: the talk light is on exactly during each line, ${r.exact} of ${r.speaks} (${r.frames} frames sampled)`);
  want(r.bubbles === r.speaks, `a caption bubble carries every speak event's line: ${r.bubbles} of ${r.speaks}`);
  want(r.moved.site === "rb-site-west-oakland-warehouse" && r.walkSeen && r.figures === 7 && r.worst <= 12, `move: logistics walked into the warehouse aisle (${r.walkFrames} frames walking; the two sites are ${Math.round(Math.abs(r.moved.to - r.moved.from))} m apart in x, so it re-projected 24 m short first); 3 hive + 4 VBRIDGE figures, worst ${r.worst}`);
  want(r.gestures.includes("fx-safety-steward:stop") && r.gestures.includes("fx-logistics:nod"), "the steward's veto is a stop gesture, the completion a nod", r.gestures);
  await context.close();
}

// ---------------------------------------------------------------- 4. reduced motion
{
  const { page, context } = await open(parishUrl("oak-west-oakland"), { reducedMotion: "reduce" });
  await ready(page);
  const r = await hiveRun(page);
  log("4.reduced", r);
  want(!r.walkSeen && r.moved.site === "rb-site-west-oakland-warehouse" && r.bubbles === r.speaks, "reduced motion: no walking (the figure jumps), every caption still shows", { bubbles: r.bubbles, speaks: r.speaks });
  await context.close();
}

// ---------------------------------------------------------------- 5. the instructor console's roster at 2×
{
  const { page, context } = await open(`${base}/instructor/dist/instructor-console.html`, { deviceScaleFactor: 2 });
  await page.waitForFunction(() => !!document.getElementById("tab-governance"), null, { timeout: 60000 });
  const r = await page.evaluate(async () => {
    document.getElementById("tab-governance").click();
    const t0 = performance.now();
    while (performance.now() - t0 < 8000) { const imgs = [...document.querySelectorAll("#view-governance .aa-card img")]; if (imgs.length && imgs.every((i) => i.dataset.aaRaster)) break; await new Promise((res) => setTimeout(res, 100)); }
    const imgs = [...document.querySelectorAll("#view-governance .aa-card img")];
    const cards = [...document.querySelectorAll("#view-governance .aa-card")];
    return { dpr: devicePixelRatio, cards: cards.length, chips: cards.filter((c) => /software agent/.test(c.textContent)).length, imgs: imgs.map((i) => ({ css: i.width, natural: i.naturalWidth, raster: i.dataset.aaRaster ?? null, png: i.src.startsWith("data:image/png") })), overflowX: document.documentElement.scrollWidth > innerWidth };
  });
  log("5.instructor", r);
  want(r.cards === 4 && r.chips === 4 && r.imgs.every((i) => i.png && i.natural === i.css * 2 && i.raster === "png@2x"), `instructor console: ${r.cards} agent cards on the governance tab, each portrait a ${r.imgs[0]?.natural} px PNG shown at ${r.imgs[0]?.css} px (2× device pixels), labelled software agent`);
  await page.screenshot({ path: join(process.env.AA_SHOTS ?? ".", "aa-instructor-roster.png"), clip: await page.evaluate(() => { const r = document.querySelector("#view-governance .aa-roster")?.getBoundingClientRect(); return r ? { x: Math.max(0, r.x - 8), y: Math.max(0, r.y - 40), width: Math.min(innerWidth, r.width + 16), height: r.height + 48 } : { x: 0, y: 0, width: 800, height: 400 }; }) }).catch(() => {});
  await context.close();
}

want(out.pageErrors.length === 0, `page errors: ${out.pageErrors.length}`, out.pageErrors.slice(0, 5).join(" | "));
want(out.offHost.length === 0, `external requests: ${out.offHost.length}`, out.offHost.slice(0, 5).join(" | "));
await browser.close(); close();
console.log(out.fails ? `\n${out.fails} drive check(s) failed.` : "\nThe agent-avatars drive passes.");
process.exit(out.fails ? 1 : 0);
