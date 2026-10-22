#!/usr/bin/env node
/**
 * HIVE-IN-WORLD (docs/consoles/HIVE-IN-WORLD.md): the headless drive of the BUILT parishes page (not in the gate).
 *
 *   A. Signed in, sf-downtown (the SoMa robot cell; the hive's safety steward and auditor are homed there):
 *      1. outdoors, the hive's agents homed on this map are embodied (the avatars attach the hive itself);
 *      2. one door: walk from the robot pad along ROBO-EXTERIORS' approach to the building door with W held, the prompt reads
 *         "E — go inside", E enters the cell hall;
 *      3. inside: the steward and the auditor stand at their room spots in the room's group; the hive's next line from one of
 *         them shows as a caption over its figure; the room measures inside IX_BUDGET and IXR_TEX_BUDGET with them in;
 *         the HUD location chip names the room (generic by kind); every label's text fits in the real font;
 *      4. the return: a station pad launched in the room returns (the runner's Back link, followed) into the same room,
 *         with the agents standing again;
 *      5. out of the door: the chip names the street again.
 *   B. Signed out: a robotics room opens with no agents in it (the hive is not mounted outside its gate).
 *   C. Signed in, device pixel ratio 2: the hive panel's seven cards show 96 px PNG portraits at 48 px, each labelled
 *      "software agent"; "Supervise every job" switched on: 0 dispatches without the learner, the queue asks, an approval runs.
 *   D. The instructor console's Data governance tab: a refused registry import and a successful one each show their message
 *      on the tab itself (the console's toast line sits in the hidden Live-class view).
 *   Page errors and off-host requests are counted throughout (three.js is served from the vendored copy).
 *
 *     python3 tools/bundle_webxr.py parishes && node tools/drive_hive_world.mjs [port]
 */
import { readFileSync } from "node:fs";
import { pathToFileURL, fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const { pvServe, pvLaunch, pvContext } = await import(pathToFileURL(join(ROOT, "tools/lib/pv_browser.mjs")).href);

const { base, close } = await pvServe(Number(process.argv[2]) || 9101);
const browser = await pvLaunch();
const out = { pageErrors: [], offHost: [], fails: 0 };
const want = (cond, what, detail) => { if (!cond) out.fails += 1; console.log(`${cond ? "  ✓" : "  ✗"} ${what}${detail !== undefined ? ` — ${typeof detail === "string" ? detail : JSON.stringify(detail)}` : ""}`); return cond; };

async function open(url, { auth = false, tier = "high", dpr = 1, plain = false } = {}) {
  const context = await pvContext(browser, { viewport: { width: 800, height: 450 }, deviceScaleFactor: dpr, acceptDownloads: true }); // a small frame: the headless page draws in software
  if (auth) await context.addInitScript(() => { try { localStorage.setItem("vr-training-auth-v1", JSON.stringify({ id: "learner-hw-drive" })); } catch (_) { /* storage blocked */ } });
  // The station runner is not what this drive tests: answer it with a stub page that keeps its URL (the Back link is in it).
  await context.route("**/smartcity/index.html*", (r) => r.fulfill({ status: 200, contentType: "text/html", body: "<!doctype html><title>runner stub</title><p>runner</p>" }));
  const page = await context.newPage();
  page.on("pageerror", (e) => out.pageErrors.push(`${url.split("?")[1] ?? url}: ${String(e.message).split("\n")[0]}`));
  page.on("request", (r) => { const u = r.url(); if (u.startsWith("http://127.0.0.1") || u.startsWith("data:") || u.startsWith("blob:")) return; if (/cdnjs\.cloudflare\.com\/ajax\/libs\/(three\.js|react)/.test(u) || /fonts\.(googleapis|gstatic)/.test(u)) return; out.offHost.push(u); });
  await page.goto(plain ? url : `${url}${url.includes("?") ? "&" : "?"}tier=${tier}`, { waitUntil: "load", timeout: 120000 });
  if (!plain) await ready(page);
  return { page, context };
}
const ready = (page) => page.waitForFunction(() => !!window.__parishTest?.hiveWorld && "agentAvatars" in window.__parishTest && !!window.__parishTest?.exteriors, null, { timeout: 120000 });
const parishUrl = (map) => `${base}/parishes/dist/parishes.html?parish=${map}`;
const frames = (page, n = 2) => page.evaluate((k) => new Promise((r) => { let i = 0; const f = () => (++i >= k ? r() : requestAnimationFrame(f)); requestAnimationFrame(f); }), n);

// ------------------------------------------------------------------------------------------------ A. signed in, sf-downtown
const SITE = "rb-site-soma-robot-cell", STYLE = "ixr-cell-hall";
{
  const { page, context } = await open(parishUrl("sf-downtown"), { auth: true });
  console.log("A. signed in, sf-downtown");
  const outdoor = await page.evaluate(() => {
    const T = window.__parishTest, hv = T.hive?.hive;
    const here = (T.agentAvatars?.agents() ?? []).filter((s) => /^oh-/.test(s.id));
    return { hive: !!hv, homedHere: (hv?.agents ?? []).filter((a) => T.robotics.sites.some((s) => s.id === a.homeSite)).map((a) => a.id), figures: here.filter((s) => s.visible).map((s) => s.id), sources: T.agentAvatars?.sources() ?? 0 };
  });
  want(outdoor.hive && outdoor.homedHere.length === 2 && outdoor.figures.length === outdoor.homedHere.length, "outdoors: the hive's agents homed on this map are embodied (the avatars attach the hive itself)", outdoor);

  // 2. one door: from the pad along the approach to the building door, W held, then E
  await page.evaluate(() => window.__parishTest.begin());
  const plan = await page.evaluate((site) => {
    const T = window.__parishTest, l = T.exteriors.layouts.find((x) => x.id === site), d = T.hiveWorld.doors.find((x) => x.site.id === site);
    return { pad: l.pad, approach: l.approach, door: d ? { x: d.x, z: d.z, style: d.style } : null, fxOut: l.door.out };
  }, SITE);
  want(!!plan.door && Math.abs(plan.door.x - plan.fxOut[0]) < 1e-9 && Math.abs(plan.door.z - plan.fxOut[1]) < 1e-9, "the room's door spot is the building door's outside spot (fxDoorFor)", plan.door);
  await page.evaluate(([x, z]) => window.__parishTest.teleport(x, z), [plan.pad[0], plan.pad[2]]);
  await page.mouse.click(5, 5).catch(() => {});
  await page.evaluate(() => { document.getElementById("menu").hidden = true; window.__parishTest.np.playing = true; window.__parishTest.np.modal = null; });
  const pts = [...plan.approach.slice(1).map(([x, z]) => ({ x, z })), { x: plan.door.x, z: plan.door.z }];
  await page.keyboard.down("KeyW");
  let walked = 0, stuck = null;
  for (const p of pts) {
    const r = await page.evaluate(async (pt) => {
      // The page's own walk at its own frame rate (a few frames a second headless): run (Shift) until 3 m out, then walk in.
      const T = window.__parishTest, np = T.np; const t0 = performance.now(); let last = [np.x, np.z], still = 0;
      const shift = (on) => dispatchEvent(new KeyboardEvent(on ? "keydown" : "keyup", { code: "ShiftLeft", key: "Shift" }));
      while (performance.now() - t0 < 150000) {
        const dx = pt.x - np.x, dz = pt.z - np.z, d = Math.hypot(dx, dz);
        shift(d > 3);
        if (d < 0.5) { shift(false); return { ok: true, d }; }
        np.yaw = Math.atan2(-dx, -dz);
        await new Promise((res) => requestAnimationFrame(res));
        if (Math.hypot(np.x - last[0], np.z - last[1]) < 1e-4) { still += 1; if (still > 90) return { ok: false, d, at: [np.x, np.z], why: "stopped" }; } else still = 0;
        last = [np.x, np.z];
      }
      shift(false);
      return { ok: false, d: Math.hypot(pt.x - np.x, pt.z - np.z), at: [np.x, np.z], why: "timeout" };
    }, p);
    walked += 1;
    if (!r.ok) { stuck = r; break; }
  }
  await page.keyboard.up("KeyW");
  await frames(page, 12);
  const atDoor = await page.evaluate(() => ({ near: window.__parishTest.np.near?.kind ?? null, style: window.__parishTest.np.near?.style ?? null, prompt: document.getElementById("hud-prompt")?.textContent ?? "", hidden: document.getElementById("hud-prompt")?.hidden }));
  want(!stuck && walked === pts.length && atDoor.near === "door" && atDoor.style === STYLE && /^E — go inside: /.test(atDoor.prompt) && !atDoor.hidden, `walked from the pad to the building door along the approach (${pts.length} legs, W held, the page's own walk) and the prompt offers the room`, stuck ?? atDoor);
  await page.keyboard.press("KeyE");
  await frames(page, 6);
  const inside = await page.evaluate(() => { const ix = window.__parishTest.interiors.mount; return { inside: ix.inside(), room: ix.room?.id ?? null }; });
  want(inside.inside && inside.room === STYLE, "E at the building door enters the cell hall", inside);

  // 3. inside: the agents at their spots, a caption over a figure, the budget, the chip, the labels
  const room = await page.evaluate(() => {
    const T = window.__parishTest, m = T.hiveWorld.room(), ix = T.interiors.mount;
    if (!m) return null;
    const rows = m.placed.map(({ agent, spot }) => {
      const s = m.avatars.state(agent.id), fig = m.avatars.figure(agent.id);
      let inGroup = false; for (let o = fig; o; o = o.parent) if (o === ix.room.group) inGroup = true;
      const lab = fig?.children.find((o) => o.name === "aa-label");
      return { id: agent.id, spot: spot.id, at: Math.abs(s.x - spot.x) < 1e-6 && Math.abs(s.z - spot.z) < 1e-6, inGroup, visible: fig?.visible, faces: Math.abs(fig.rotation.y - (spot.yaw + Math.PI)) < 1e-6, fit: lab?.userData.fit ? { px: lab.userData.fit.role.px, width: Math.round(lab.userData.fit.role.width), fits: lab.userData.fit.role.fits, text: lab.userData.fit.role.text } : null };
    });
    return { rows, measure: T.roboInteriors.measure(), zone: document.getElementById("hud-zone").textContent, near: document.getElementById("hud-near").textContent };
  });
  want(!!room && room.rows.length === 2 && room.rows.every((r) => r.at && r.inGroup && r.visible && r.faces), "inside: the steward and the auditor stand at their room spots, in the room's group, facing the spot's way", room?.rows.map((r) => `${r.id}@${r.spot}`));
  want(!!room && room.measure.meshes <= 120 && room.measure.trianglesBuilt <= 6000 && room.measure.textureBytes <= 24 * 1048576, `the room with its agents measures inside the budget: ${room?.measure.meshes} meshes (≤ 120), ${room?.measure.trianglesBuilt} triangles built (≤ 6000), ${(room?.measure.textureBytes / 1048576).toFixed(2)} MiB of textures, every one in the room counted (the shell's signs, the figures' labels; ≤ 24 MiB high), ${room?.measure.calls} draw calls`, room?.measure && { meshes: room.measure.meshes, tris: room.measure.trianglesBuilt, calls: room.measure.calls, triangles: room.measure.triangles });
  want(room?.zone === "Robot cell hall" && /^generic room · /.test(room?.near ?? ""), "the HUD location chip names the room, generic by kind, while inside", `${room?.zone} | ${room?.near}`);
  want(!!room && room.rows.every((r) => r.fit?.fits && /^software agent · /.test(r.fit.text)), "the room figures' labels fit in the real font", room?.rows.map((r) => r.fit));
  const cap = await page.evaluate(async () => {
    const T = window.__parishTest, hv = T.hive.hive, m = T.hiveWorld.room(), ids = new Set(m.placed.map((p) => p.agent.id));
    let ev = null; const fn = (e) => { if (!ev && ids.has(e.agent)) ev = e; };
    hv.on("speak", fn);
    for (let i = 0; i < 200 && !ev; i += 1) T.hive.step();
    hv.off("speak", fn);
    if (!ev) return { ev: null };
    await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
    const s = m.avatars.state(ev.agent), fig = m.avatars.figure(ev.agent), c = fig.children.find((o) => o.name === "aa-caption");
    return { ev: { agent: ev.agent, caption: ev.caption, t: ev.t }, shown: s.captionVisible && s.caption === ev.caption && c.visible && c.position.y > fig.userData.parts.head.position.y, now: s.caption };
  });
  want(!!cap.ev && cap.shown, "the hive's next line from a room agent shows as a caption over its figure", cap.ev ? `${cap.ev.agent}: "${cap.ev.caption}"` : "no line in 200 steps");
  const m2 = await page.evaluate(() => window.__parishTest.roboInteriors.measure());
  want(m2.inside && m2.meshes <= 120 && m2.textureBytes <= 24 * 1048576, `with a caption drawn too: ${m2.meshes} meshes, ${(m2.textureBytes / 1048576).toFixed(2)} MiB of textures (≤ 24 MiB high)`);
  // (an agent homed on another map has no figure here until it arrives: only built figures carry a label)
  const fitsOut = await page.evaluate(() => (window.__parishTest.agentAvatars?.agents() ?? []).map((s) => ({ s, fig: window.__parishTest.agentAvatars.figure(s.id) })).filter((x) => x.fig).map(({ s, fig }) => { const f = fig.children.find((o) => o.name === "aa-label")?.userData.fit?.role; return f ? { id: s.id, px: f.px, width: Math.round(f.width), fits: f.fits } : { id: s.id, fits: false }; }));
  want(fitsOut.length > 0 && fitsOut.every((f) => f.fits), `outdoors: every built figure's "software agent · <role>" fits its label in the real font (${fitsOut.length} figures; smallest ${Math.min(...fitsOut.map((f) => f.px))} px)`, fitsOut);

  // the room's job board: its station links carry the room as well
  const board = await page.evaluate(() => {
    const T = window.__parishTest, ix = T.interiors.mount, a = ix.room.actions.find((x) => x.kind === "board"); ix.pose.x = a.x; ix.pose.z = a.z; T.interiors.use();
    const links = [...document.querySelectorAll("#board-stations a[data-station]")].map((x) => decodeURIComponent(new URL(x.href).searchParams.get("return") ?? ""));
    const np = window.__parishTest.np; if (np.modal) document.getElementById(np.modal).hidden = true; np.modal = null; // close it again for the steps below
    return { n: links.length, withRoom: links.filter((r) => /&ixr=ixr-cell-hall$/.test(r)).length, sample: links[0] ?? null };
  });
  want(board.n > 0 && board.withRoom === board.n, `the room's job board: ${board.withRoom} of ${board.n} station links return into the room`, board.sample);
  // 4. the return: launch a pad in the room, follow the runner's Back link, land back inside the same room
  const launch = page.waitForURL(/smartcity\/index\.html/, { timeout: 30000 });
  await page.evaluate(() => { const ix = window.__parishTest.interiors.mount, a = ix.room.actions.find((x) => x.kind === "station"); ix.pose.x = a.x; ix.pose.z = a.z; window.__parishTest.interiors.use(); });
  await launch;
  const runner = new URL(page.url()), ret = runner.searchParams.get("return");
  want(!!ret && /ixr=ixr-cell-hall/.test(decodeURIComponent(ret)), "the pad's station link carries the room's style on its return", ret);
  await page.goto(new URL(ret, runner).href, { waitUntil: "load", timeout: 120000 });
  await ready(page);
  await frames(page, 4);
  const back = await page.evaluate(() => { const T = window.__parishTest, m = T.hiveWorld.room(); return { returned: T.hiveWorld.returned, room: T.interiors.mount.room?.id ?? null, agents: m?.placed.map((p) => p.agent.id) ?? [], zone: document.getElementById("hud-zone").textContent }; });
  want(back.room === STYLE && back.returned?.style === STYLE && back.agents.length === 2 && back.zone === "Robot cell hall", "back from the station: inside the same room, with its agents standing and the chip naming the room", back);

  // 5. out of the door: the chip names the street again
  const outside = await page.evaluate(async () => {
    const T = window.__parishTest, ix = T.interiors.mount; ix.pose.x = ix.room.door.x; ix.pose.z = ix.room.door.z - 0.2; T.interiors.use();
    await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
    return { inside: ix.inside(), mount: !!T.hiveWorld.room(), zone: document.getElementById("hud-zone").textContent, near: document.getElementById("hud-near").textContent };
  });
  want(!outside.inside && !outside.mount && outside.zone !== "Robot cell hall" && / m$/.test(outside.near), "out of the door: the room's agents are gone with it and the chip names the street again", outside);
  await context.close();
}

// ------------------------------------------------------------------------------------------------ B. signed out
{
  const { page, context } = await open(parishUrl("sf-downtown"));
  console.log("B. signed out, sf-downtown");
  const r = await page.evaluate(async (style) => { const T = window.__parishTest; const s = T.ixScene(style); await new Promise((res) => requestAnimationFrame(() => requestAnimationFrame(res))); return { hive: T.hive, room: s?.style ?? null, mount: T.hiveWorld.room(), zone: document.getElementById("hud-zone").textContent }; }, STYLE);
  want(r.hive === null && r.room === STYLE && r.mount === null && r.zone === "Robot cell hall", "signed out: the room opens with no agents (the hive is not mounted outside its gate); the chip still names the room", r);
  await context.close();
}

// ------------------------------------------------------------------------------------------------ C. the hive panel at 2×, supervise every job
{
  const { page, context } = await open(parishUrl("sf-downtown"), { auth: true, dpr: 2 });
  console.log("C. signed in, device pixel ratio 2: the hive panel");
  const r = await page.evaluate(async () => {
    const panel = document.getElementById("oh-hive"), t0 = performance.now();
    while (performance.now() - t0 < 15000) { const imgs = [...panel.querySelectorAll(".oh-card img")]; if (imgs.length === 7 && imgs.every((i) => i.dataset.aaRaster)) break; await new Promise((res) => setTimeout(res, 100)); }
    const cards = [...panel.querySelectorAll(".oh-card")], imgs = [...panel.querySelectorAll(".oh-card img")];
    return { dpr: devicePixelRatio, cards: cards.length, labelled: cards.filter((c) => c.querySelector(".oh-label")?.textContent === "software agent").length, imgs: imgs.map((i) => ({ css: i.width, natural: i.naturalWidth, raster: i.dataset.aaRaster ?? null, png: i.src.startsWith("data:image/png") })), badges: panel.querySelectorAll(".oh-card svg").length };
  });
  want(r.cards === 7 && r.labelled === 7 && r.imgs.length === 7 && r.imgs.every((i) => i.png && i.css === 48 && i.natural === 96 && i.raster === "png@2x"), `the roster's ${r.cards} cards show 2× portraits (${r.imgs[0]?.natural} px PNGs at ${r.imgs[0]?.css} px, device pixel ratio ${r.dpr}), each labelled "software agent"`, { labelled: r.labelled, badges: r.badges });
  const sup = await page.evaluate(() => {
    const h = window.__parishTest.hive, btn = document.querySelector('#oh-hive button[data-oh="supervise"]');
    const before = btn.getAttribute("aria-pressed"); btn.click();
    for (let i = 0; i < 40; i += 1) h.step();
    const m = h.hive.metrics(), reqs = [...document.querySelectorAll('#oh-hive .oh-req[data-reason="supervise"]')], first = reqs[0]?.dataset.job ?? null;
    reqs[0]?.querySelector('button[data-oh="approve"]')?.click();
    for (let i = 0; i < 8; i += 1) h.step();
    return { before, after: btn.getAttribute("aria-pressed"), label: btn.textContent, dispatchedWhileWaiting: m.dispatched, without: m.dispatchedWithoutLearner, waiting: reqs.length, first, ran: h.hive.events().some((e) => e.type === "dispatch" && e.jobId === first), withoutAfter: h.hive.metrics().dispatchedWithoutLearner };
  });
  want(sup.before === "false" && sup.after === "true" && sup.without === 0 && sup.dispatchedWhileWaiting === 0 && sup.waiting > 0 && sup.ran && sup.withoutAfter === 0, `"Supervise every job" (off by default) switched on: after 40 steps ${sup.dispatchedWhileWaiting} dispatches and ${sup.waiting} jobs waiting in the queue; the one approved there runs; dispatches without the learner ${sup.withoutAfter}`, sup);
  await context.close();
}

// ------------------------------------------------------------------------------------------------ D. the governance tab's import messages
{
  const { page, context } = await open(`${base}/instructor/dist/instructor-console.html`, { plain: true });
  console.log("D. the instructor console's Data governance tab");
  await page.waitForFunction(() => !!document.getElementById("tab-governance") && !!document.getElementById("ent3-import-file"), null, { timeout: 60000 });
  await page.evaluate(() => document.getElementById("tab-governance").click());
  const note = () => page.evaluate(() => { const n = document.getElementById("ent3-notice"), sent = document.getElementById("sent"); return { text: n?.textContent ?? null, kind: n?.dataset.kind ?? null, role: n?.getAttribute("role") ?? null, visible: !!n && n.checkVisibility(), onTab: !!n?.closest("#view-governance"), inRegistryPanel: !!n?.closest("section")?.querySelector("#ent3-import-file"), sentVisible: !!sent && sent.checkVisibility(), sentText: sent?.textContent ?? "" }; });
  await page.setInputFiles("#ent3-import-file", { name: "tampered.json", mimeType: "application/json", buffer: Buffer.from(JSON.stringify({ schema: "not-a-registry" })) });
  await page.waitForFunction(() => /^Refused/.test(document.getElementById("ent3-notice")?.textContent ?? ""), null, { timeout: 15000 }).catch(() => {});
  const bad = await note();
  want(bad.visible && bad.onTab && bad.inRegistryPanel && bad.kind === "bad" && bad.role === "alert" && /^Refused \(/.test(bad.text ?? ""), "a refused registry import shows its refusal on the governance tab, in the registry panel (the toast line #sent is hidden while the tab is open)", bad);
  const [dl] = await Promise.all([page.waitForEvent("download", { timeout: 15000 }), page.evaluate(() => [...document.querySelectorAll("#ent3-root button")].find((b) => b.textContent === "Export registry")?.click())]);
  const buf = readFileSync(await dl.path());
  await page.setInputFiles("#ent3-import-file", { name: "registry.json", mimeType: "application/json", buffer: buf });
  await page.waitForFunction(() => /^(Nothing new|Imported)/.test(document.getElementById("ent3-notice")?.textContent ?? ""), null, { timeout: 15000 }).catch(() => {});
  const good = await note();
  want(good.visible && good.onTab && good.kind === "ok" && good.role === "status" && /^(Nothing new|Imported)/.test(good.text ?? ""), "a successful import (this device's own export, re-imported) shows its result on the tab too", good);
  await context.close();
}

console.log(`pageErrors ${JSON.stringify(out.pageErrors)}`);
console.log(`offHost ${JSON.stringify(out.offHost)}`);
want(out.pageErrors.length === 0 && out.offHost.length === 0, `page errors ${out.pageErrors.length}, off-host requests ${out.offHost.length}`);
await browser.close(); await close();
console.log(out.fails ? `\ndrive_hive_world: ${out.fails} problem(s).` : "\ndrive_hive_world: all steps pass.");
process.exit(out.fails ? 1 : 0);
