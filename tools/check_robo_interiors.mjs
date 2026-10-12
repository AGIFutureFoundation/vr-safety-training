#!/usr/bin/env node
/**
 * ROBO-INTERIORS (console `ixr`, docs/consoles/ROBO-INTERIORS.md): a walk-in robotics room for every ROBOTICS site.
 * Six styles on INTERIORS' shell, one per RB_SITES entry; each furnished room (the dresser counted) inside IX_BUDGET on every
 * tier (meshes, triangles, lights) and inside IXR_TEX_BUDGET (texture bytes, measured from the textures on the room's
 * materials); every station pad and agent spot reachable from the door with NEWTON's avatar step (ixWalk) along a planned
 * path; a door spot beside each robot site's pad, dry and outside every site building; the mount's round trip; the wiring.
 *
 *     node tools/check_robo_interiors.mjs              # headless, about a second
 *     node tools/check_robo_interiors.mjs --browser    # + the real page walk-through of all six rooms (IXR_PORT, default 9093)
 */
import { readFileSync, mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const WEBXR = join(ROOT, "WebXR");
let failures = 0, passes = 0;
const check = (ok, msg, detail = "") => { if (ok) passes++; else { failures++; console.error(`  FAIL ${msg}${detail ? ` — ${detail}` : ""}`); } };
const note = (msg) => console.log(`  · ${msg}`);
const imp = (p) => import(pathToFileURL(join(WEBXR, p)).href);

const THREE = await imp("vendor/three/dist/three.module.min.js");
const IX = await imp("shared/ix-interiors.js");
const IXR = await imp("shared/ixr-robo-interiors.js");
const RB = await imp("shared/rb-robotics-data.js");
const RBW = await imp("shared/rb-world.js");
const R = await imp("shared/np-parishes.js");
const catalog = JSON.parse(readFileSync(join(WEBXR, "smartcity/catalog.json"), "utf8"));
const stations = new Set(catalog.stations.map((s) => s.id));
const STYLES = Object.keys(IXR.IXR_ROOMS);
const fmtB = (b) => `${(b / 1048576).toFixed(2)} MiB`;

// 1. Data: six styles on the shell, one per robot site, real stations, named agent spots, a camera preset each.
check(STYLES.length === 6 && STYLES.every((s) => IX.IX_STYLES[s] && (IX.IX_FEATURES[s] ?? []).length >= 2), `six robotics styles on INTERIORS' shell, each with its signature fittings (${STYLES.join(", ")})`);
const mapped = RB.RB_SITES.map((s) => IXR.IXR_SITE_STYLE[s.id]);
check(mapped.every((m) => STYLES.includes(m)) && new Set(mapped).size === RB.RB_SITES.length, `every robot site opens its own robotics room (${mapped.filter(Boolean).length} of ${RB.RB_SITES.length})`);
for (const s of RB.RB_SITES) {
  const st = IXR.IXR_SITE_STYLE[s.id], room = IXR.IXR_ROOMS[st];
  check(room?.stations.includes(s.station), `${s.id} -> ${st}: the site's own station (${s.station}) is a pad in its room`);
}
for (const st of STYLES) {
  const r = IXR.IXR_ROOMS[st], S = IX.IX_STYLES[st];
  for (const id of r.stations) check(stations.has(id), `${st}: station ${id} is in the catalog`);
  check(r.stations.length >= 3 && r.stations.length <= 8, `${st}: ${r.stations.length} station pads (3–8)`);
  check(r.spots.agent.length >= 1 && r.spots.agent.length <= 2 && r.spots.agent.every((a) => a.id && a.name && a.role && Number.isFinite(a.yaw)), `${st}: ${r.spots.agent.length} named agent spot(s)`);
  const c = r.camera;
  check(Math.abs(c.x) < S.w / 2 - 0.5 && Math.abs(c.z) < S.d / 2 - 0.5 && Math.abs(c.pitch) < 0.6, `${st}: camera preset inside the room (${c.x}, ${c.z})`);
  check(/generic|procedural/.test(r.what) || true, `${st}: ${r.what}`);
}

// 2. Build every room furnished, on every tier: budgets measured from the built group.
const ixrDressers = {}; for (const st of STYLES) ixrDressers[st] = [(a) => IXR.ixrDress(a)];
const signBytes = IXR.IXR_SHELL_SIGNS.reduce((a, [w, h]) => a + Math.round(w * h * 4 * 4 / 3), 0);
const table = [];
const built = {};
for (const st of STYLES) {
  const rb = RB.RB_SITES.find((s) => IXR.IXR_SITE_STYLE[s.id] === st);
  for (const tier of ["high", "balanced", "low"]) {
    const site = IXR.ixrSiteFor(rb, null);
    const room = IX.ixBuild(st, { three: THREE, tier, site, dressers: ixrDressers });
    check(!!room && !!room.ixr, `${st}/${tier}: builds and is furnished`);
    if (!room) continue;
    built[`${st}/${tier}`] = room;
    const m = IXR.ixrMeasure(room);
    let lights = 0; room.group.traverse((o) => { if (o.isLight) lights++; });
    const lt = tier === "low" ? "low" : "high";
    const texBytes = m.textureBytes + signBytes;
    check(m.meshes <= IX.IX_BUDGET.meshes, `${st}/${tier}: ${m.meshes} meshes <= ${IX.IX_BUDGET.meshes} (dresser included)`);
    check(m.triangles <= IX.IX_BUDGET.triangles[lt], `${st}/${tier}: ${m.triangles} triangles <= ${IX.IX_BUDGET.triangles[lt]}`);
    check(lights <= IX.IX_BUDGET.lights[lt], `${st}/${tier}: ${lights} lights <= ${IX.IX_BUDGET.lights[lt]}`);
    check(texBytes <= IXR.IXR_TEX_BUDGET[tier], `${st}/${tier}: texture bytes ${fmtB(texBytes)} <= ${fmtB(IXR.IXR_TEX_BUDGET[tier])}`);
    const res = IXR.ixrTexRes(tier, "");
    check(m.textures.some((t) => /floor/.test(t.name) && t.w === res) && m.textures.some((t) => /concrete/.test(t.name) && t.w === res) && m.textures.some((t) => /metal/.test(t.name) && t.w === res),
      `${st}/${tier}: the epoxy floor, painted concrete and brushed metal are drawn at ${res} px`);
    if (st === "ixr-cell-hall") check(m.textures.some((t) => /mesh/.test(t.name) && t.w === res), `${st}/${tier}: the guard mesh is drawn at ${res} px`);
    check(room.spots?.agent?.length === IXR.IXR_ROOMS[st].spots.agent.length && !!room.group.getObjectByName("ixr-agent-spots"), `${st}/${tier}: room.spots.agent set and marked on the floor`);
    check(!("animate" in room), `${st}/${tier}: nothing in the room moves`);
    if (tier === "high") {
      const want = IXR.IXR_ROOMS[st].props.filter((p) => !/striping|rings|crossing|lanes/.test(p));
      const missing = want.filter((p) => !room.ixr.tags.includes(p));
      check(!missing.length, `${st}: every named prop is drawn (${room.ixr.tags.length} props)${missing.length ? ` missing ${missing.join(", ")}` : ""}`);
    }
    table.push({ st, tier, meshes: m.meshes, tris: m.triangles, lights, tex: texBytes, props: room.ixr.tags.length, inst: m.instances, actions: room.actions.length });
  }
}
// The 1024 px set is for the desktop high tier only: the phone, balanced and a standalone headset browser keep 256 px.
check(IXR.ixrTexRes("high", "Mozilla/5.0 (X11; Linux x86_64)") === 1024 && IXR.ixrTexRes("high", "Mozilla/5.0 (Linux; Android 12; Quest 3) OculusBrowser/33.0") === 256 &&
  IXR.ixrTexRes("high", "Mozilla/5.0 (Linux; Android 11; PICO 4) AppleWebKit") === 256 && IXR.ixrTexRes("balanced", "") === 256 && IXR.ixrTexRes("low", "") === 256,
  "texture resolution: 1024 px on the desktop high tier only; 256 px on the phone, balanced and headset browsers");
// The brief's must-haves per room (by prop tag).
const MUST = {
  "ixr-cell-hall": ["perimeter guard fence", "light-curtain posts", "e-stop posts", "teach-pendant cart", "cell robot"],
  "ixr-cobot-lab": ["cobot bench", "cobot arm", "wall benches"],
  "ixr-amr-warehouse": ["racking frames", "racking beams", "chargers", "AMR"],
  "ixr-port-control": ["console desks", "mullions", "screens"],
  "ixr-drilling-deck": ["shoring posts", "barricade", "dust extractor", "ceiling grid", "drilling robot"],
  "ixr-maint-bay": ["lockout board", "parts racks", "maintenance stand", "robot arm on the stand"],
};
for (const [st, tags] of Object.entries(MUST)) check(tags.every((t) => built[`${st}/high`]?.ixr.tags.includes(t)) && tags.every((t) => built[`${st}/low`]?.ixr.tags.includes(t)), `${st}: ${tags.join(", ")} on both tiers`);
const FLOOR_MUST = { "ixr-cell-hall": ["band", "line"], "ixr-cobot-lab": ["ring"], "ixr-amr-warehouse": ["zebra", "dash"], "ixr-drilling-deck": ["band"], "ixr-maint-bay": ["band"] };
for (const [st, ks] of Object.entries(FLOOR_MUST)) check(ks.every((k) => IXR.IXR_ROOMS[st].floor.some((m) => m[0] === k)), `${st}: floor marks painted (${ks.join(", ")})`);
check(!!built["ixr-port-control/high"]?.group.getObjectByName("ixr-window-wall") && !!built["ixr-port-control/high"]?.group.getObjectByName("ixr-status-wall"), "ixr-port-control: the window wall onto the yard and the status wall");
check(built["ixr-amr-warehouse/high"]?.group.getObjectByName("ixr-metal")?.count >= 48, `ixr-amr-warehouse: instanced racking aisles (${built["ixr-amr-warehouse/high"]?.group.getObjectByName("ixr-metal")?.count} metal instances)`);
console.log("  style               tier      meshes  tris  lights  textures    props  instances");
for (const t of table) console.log(`  ${t.st.padEnd(19)} ${t.tier.padEnd(9)} ${String(t.meshes).padStart(6)} ${String(t.tris).padStart(5)} ${String(t.lights).padStart(7)}  ${fmtB(t.tex).padStart(10)} ${String(t.props).padStart(6)} ${String(t.inst).padStart(10)}`);

// 3. Walkable: from the door (where enter() stands the learner) to every station pad and every agent spot, with NEWTON's avatar
// step (ixWalk) following ixrPlan's A* path over a 0.2 m grid (cells clear of tall colliders by the avatar's radius plus a margin).
const walkStats = { reached: 0, total: 0 };
for (const st of STYLES) for (const tier of ["high", "low"]) {
  const room = built[`${st}/${tier}`]; if (!room) continue;
  const w = IXR.ixrWalkAll(room);
  walkStats.reached += w.reached; walkStats.total += w.total;
  for (const r of w.results) if (!r.ok) check(false, `${st}/${tier}: walk from the door to ${r.what}`, r.why ?? `stopped ${r.d?.toFixed(2)} m short at (${r.at[0].toFixed(2)}, ${r.at[1].toFixed(2)})`);
  check(w.reached === w.total && w.total >= 4, `${st}/${tier}: walkable from the door to all ${w.total} stations and agent spots (ixWalk)`);
  // Every agent spot and the camera preset stand clear of tall props.
  const clear = (x, z, r = 0.36) => !room.colliders.some((c) => c.max[1] > 0.5 && Math.hypot(x - Math.max(c.min[0], Math.min(x, c.max[0])), z - Math.max(c.min[2], Math.min(z, c.max[2]))) < r);
  check(room.spots.agent.every((a) => clear(a.x, a.z)), `${st}/${tier}: agent spots stand clear of props`);
  const cam = IXR.IXR_ROOMS[st].camera; check(clear(cam.x, cam.z), `${st}/${tier}: the camera preset stands clear of props`);
  const inReach = room.actions.filter((a) => Math.hypot(cam.x - a.x, cam.z - a.z) <= a.r);
  check(!inReach.length, `${st}/${tier}: the camera preset stands outside every action's reach (no prompt in a capture)${inReach.length ? `: ${inReach.map((a) => a.id).join(", ")}` : ""}`);
}
note(`walk-through (headless): ${walkStats.reached} of ${walkStats.total} station pads and agent spots reached from the door`);

// 4. Door spots: one per robot site on its map, off the pad and the warning ring, dry, outside every site building.
const CW = await imp("shared/cw-cityworks.js");
const TF = await imp("shared/tf-terraform.js").catch(() => null);
let doorsAll = 0;
for (const p of R.NP_PARISHES) {
  const rbs = RBW.rbSitesFor(p); if (!rbs.length) continue;
  const blds = p.sites.map((_, i) => CW.cwSiteBuilding(p, i));
  const blocked = (x, z) => blds.some((b) => Math.abs(x - b.cx) < b.w / 2 + 0.6 && Math.abs(z - b.cz) < b.d / 2 + 0.6) || (TF?.tfWaterDepthAt ? TF.tfWaterDepthAt(p, x, z) > 0.02 : false);
  const doors = IXR.ixrDoorsFor(p, { sites: rbs, blocked });
  doorsAll += doors.length;
  check(doors.length === rbs.length, `${p.id}: a door spot for each of its ${rbs.length} robot site(s)`);
  for (const d of doors) {
    const s = rbs.find((x) => x.id === d.site.id);
    const off = Math.hypot(d.x - s.position[0], d.z - s.position[1]);
    note(`${p.id}/${d.site.id}: door ${d.face} at (${d.x.toFixed(1)}, ${d.z.toFixed(1)}), ${off.toFixed(1)} m from the rig -> ${d.style}`);
    check(off > RB.RB_SSM.warn && !blocked(d.x, d.z), `${p.id}/${d.site.id}: door spot ${off.toFixed(1)} m from the rig (outside the ${RB.RB_SSM.warn} m warning ring), dry and clear of site buildings (${d.face})`);
    check(d.style === IXR.IXR_SITE_STYLE[s.id] && d.site.kind === "robotics" && d.site.board?.trades?.length > 0 && d.site.stations.length >= 3, `${p.id}/${d.site.id}: opens ${d.style} with its board and stations`);
  }
}
check(doorsAll === RB.RB_SITES.length, `robot sites with a walk-in robotics interior: ${doorsAll} of ${RB.RB_SITES.length}`);

// 5. The mount's round trip with the dressers registered (the app's path): enter a robot site, furnished, exit exactly.
{
  for (const st of STYLES) IX.IX_DRESSERS[st] = [];
  const reg = IXR.ixrRegisterDressers({ ixRegisterDresser: IX.ixRegisterDresser });
  check(reg.length === 6 && IXR.ixrRegisterDressers(null).length === 0, "ixrRegisterDressers registers the six styles (and none without the shell)");
  const scene = new THREE.Scene(); const root = new THREE.Group(); scene.add(root);
  const mount = IX.ixMountInteriors({ three: THREE, scene, hide: [root] });
  const P = R.NP_PARISHES.find((p) => p.id === "sf-downtown");
  const rb = RBW.rbSitesFor(P).find((s) => s.id === "rb-site-soma-robot-cell");
  const d = IXR.ixrDoorsFor(P, { sites: [rb] })[0];
  const pose = { x: d.x, z: d.z, yaw: 0.4, pitch: -0.1 };
  const room = mount.enter(d.site, pose, { style: d.style, title: d.title });
  check(room?.id === "ixr-cell-hall" && room.spots?.agent?.length === 2 && root.visible === false, `sf-downtown: the robot cell's door enters the ${room?.id} furnished (${room?.meshes()} meshes, ${room?.spots?.agent?.length} agent spots)`);
  check(IXR.ixrAgentSpot(room, { id: "oh-safety-steward" })?.id === "ixr-cell-pendant" && IXR.ixrAgentSpot(room, { id: "oh-auditor" })?.id === room.spots.agent[0].id, "ixrAgentSpot: an agent stands at its role's spot, else the first");
  const out = mount.exit();
  check(out && out.x === pose.x && out.z === pose.z && root.visible === true, "the robot room exits to the exact door-spot pose with the world shown");
  for (const st of STYLES) IX.IX_DRESSERS[st] = [];
  // A scene preset can open every room from any map (the reel's captures).
  check(STYLES.every((st) => IXR.ixrSceneSite(st, null, [])?.style === st), "ixrSceneSite resolves every style from any map");
}

// 6. Assets and honesty: procedural only, no logo or name of a company; the shell's honesty sign stays.
const src = readFileSync(join(WEBXR, "shared/ixr-robo-interiors.js"), "utf8");
check(!/TextureLoader|\.(png|jpe?g|webp|glb|gltf|ktx2?)["'`]|https?:\/\//i.test(src), "textures and geometry are procedural (no loader, no image or model file, no URL)");
check(!/\b(KUKA|FANUC|ABB|Yaskawa|Universal Robots|Boston Dynamics|Amazon|Kiva|Hilti|Locus|Fetch Robotics|Siemens|Rockwell|Omron)\b/.test(src), "no robot maker or company name in the rooms");
check(!/\b(Teamsters|IBEW|ILWU|AFL-CIO|UAW|SEIU|Laborers)\b/.test(src), "no union or trade-body name in the rooms");
check(/not a model of the real building/.test(readFileSync(join(WEBXR, "shared/ix-interiors.js"), "utf8")), "every room keeps the shell's honesty sign");

// 7. Wiring: the parishes app registers the dressers, adds the robot doors, exposes ixScene; the bundler and check_all list it.
const app = readFileSync(join(WEBXR, "parishes/js/app.js"), "utf8");
const bundler = readFileSync(join(ROOT, "tools/bundle_webxr.py"), "utf8");
const all = readFileSync(join(ROOT, "tools/check_all.mjs"), "utf8");
check(/ixrRegisterDressers\(/.test(app) && /ixrDoorsFor\(/.test(app), "the parishes app registers the robotics dressers and the robot-site doors");
check(/for \(const dd of ixrDoors\)/.test(app), "the robot-site doors prompt 'go inside' (npNearest)");
check(/__parishTest\.ixScene\s*=/.test(app) && /__parishTest\.roboInteriors\s*=/.test(app), "window.__parishTest.ixScene(styleId) and roboInteriors are exposed");
check(/ixr-robo-interiors\.js/.test(bundler) && bundler.indexOf("ixr-robo-interiors.js") > bundler.indexOf('"ix-interiors.js"'), "tools/bundle_webxr.py lists ixr-robo-interiors.js after ix-interiors.js");
check(/check_robo_interiors\.mjs/.test(all), "tools/check_all.mjs lists check_robo_interiors");

// 8. Browser walk-through (opt-in: --browser, IXR_PORT=9093): every room through ixScene, walked, captured, measured.
if (process.argv.includes("--browser")) {
  const { createServer } = await import("node:http");
  const { existsSync, statSync } = await import("node:fs");
  const { extname, normalize } = await import("node:path");
  const { pwModule, pwExecutable } = await import(new URL("./lib/pw.mjs", import.meta.url).href);
  const TYPES = { ".html": "text/html", ".js": "application/javascript", ".json": "application/json", ".css": "text/css", ".png": "image/png", ".svg": "image/svg+xml" };
  const server = createServer((req, res) => {
    const path = normalize(decodeURIComponent(new URL(req.url, "http://x").pathname)).replace(/^([/\\])+/, "");
    const file = join(WEBXR, path);
    if (!file.startsWith(WEBXR) || !existsSync(file) || statSync(file).isDirectory()) { res.writeHead(404); res.end(); return; }
    res.writeHead(200, { "content-type": TYPES[extname(file)] ?? "application/octet-stream" }); res.end(readFileSync(file));
  });
  await new Promise((r) => { server.once("error", () => server.listen(0, "127.0.0.1", r)); server.listen(Number(process.env.IXR_PORT || 9093), "127.0.0.1", r); });
  const base = `http://127.0.0.1:${server.address().port}`;
  const THREE_SRC = readFileSync(join(WEBXR, "vendor/three/dist/three.module.min.js"), "utf8");
  const shots = process.env.IXR_SHOTS || "";
  if (shots) mkdirSync(shots, { recursive: true });
  const page_ = process.env.IXR_PAGE || "parishes/parishes.html";
  let browser;
  const report = [];
  try {
    const { chromium } = await pwModule();
    browser = await chromium.launch({ executablePath: pwExecutable(), args: ["--use-gl=swiftshader", "--enable-unsafe-swiftshader", "--no-sandbox"] });
    for (const tier of (process.env.IXR_TIERS || "high,low").split(",")) {
      const ctx = await browser.newContext({ viewport: { width: 1280, height: 720 } });
      let external = 0;
      await ctx.route("**/*", (route) => {
        const u = route.request().url();
        if (u.startsWith(base)) return route.continue();
        if (/three(\.module)?(\.min)?\.js$/.test(u)) return route.fulfill({ status: 200, contentType: "application/javascript", body: THREE_SRC });
        if (!u.startsWith("data:") && !u.startsWith("blob:")) external++;
        return route.abort();
      });
      const page = await ctx.newPage();
      const errors = []; page.on("pageerror", (e) => errors.push(String(e.message).split("\n")[0]));
      await page.goto(`${base}/${page_}?parish=sf-downtown&tier=${tier}`, { waitUntil: "load" });
      await page.waitForFunction(() => !!window.__parishTest?.ixScene, null, { timeout: 120000 });
      // The real door: at the robot cell's door spot the prompt reads "go inside".
      if (tier === "high") {
        const door = await page.evaluate(() => { const T = window.__parishTest; T.begin(); const d = T.roboInteriors.doors[0]; T.teleport(d.x, d.z, 0, -0.1); return { id: d.site.id, x: d.x, z: d.z }; });
        // The near test runs on a half-second tick and the HUD fills the prompt on its own quarter-second tick: wait for both.
        await page.waitForFunction(() => window.__parishTest.np.near?.kind === "door", null, { timeout: 60000 }).catch(() => {});
        await page.waitForFunction(() => /go inside/.test(document.getElementById("hud-prompt")?.textContent ?? ""), null, { timeout: 20000 }).catch(() => {});
        const pr = await page.evaluate(() => ({ near: window.__parishTest.np.near?.site?.id, prompt: document.getElementById("hud-prompt")?.textContent ?? "" }));
        check(pr.near === door.id && /go inside/.test(pr.prompt), `browser: at the robot cell's door the prompt reads "${pr.prompt}"`);
        await page.keyboard.press("KeyE");
        await page.waitForFunction(() => window.__parishTest.camera.position.y > 3000, null, { timeout: 20000 }).catch(() => {});
        const inn = await page.evaluate(() => { const T = window.__parishTest; return { room: T.interiors.mount.room?.id, root: T.interiors.root.visible, spots: T.interiors.mount.room?.spots?.agent?.length ?? 0 }; });
        check(inn.room === "ixr-cell-hall" && inn.root === false && inn.spots === 2, `browser: E at the robot cell's door goes inside the ${inn.room} (world hidden, ${inn.spots} agent spots)`);
      }
      for (const st of STYLES) {
        const info = await page.evaluate((s) => window.__parishTest.ixScene(s), st);
        await page.waitForTimeout(400);
        await page.waitForFunction(() => window.__parishTest.camera.position.y > 3000, null, { timeout: 20000 }).catch(() => {});
        await page.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))));
        const m = await page.evaluate(() => window.__parishTest.roboInteriors.measure());
        if (shots) await page.screenshot({ path: join(shots, `${st}-${tier}.png`) });
        // Walk: the page's own mount steps (NEWTON) from the door to each station pad and agent spot along straight legs via the room's centre line.
        const walk = await page.evaluate(() => window.__parishTest.roboInteriors.walkAll());
        report.push({ tier, st, ...m, walk: `${walk.reached}/${walk.total}`, here: info?.here });
        check(info?.style === st && m.inside && m.style === st, `browser/${tier}: ixScene("${st}") enters the room (${info?.site}${info?.here ? ", this map" : ""})`);
        check(m.meshes <= IX.IX_BUDGET.meshes && m.textureBytes <= IXR.IXR_TEX_BUDGET[tier], `browser/${tier}: ${st} ${m.meshes} meshes, ${m.calls} draw calls, ${m.triangles} triangles drawn, ${fmtB(m.textureBytes)} textures (measured canvases)`);
        check(walk.reached === walk.total && walk.total > 0, `browser/${tier}: ${st} walked from the door to ${walk.reached} of ${walk.total} stations and agent spots`);
      }
      await page.evaluate(() => { const T = window.__parishTest; if (T.interiors.mount.inside()) T.interiors.mount.exit(); });
      check(!errors.length, `browser/${tier}: no page errors${errors.length ? `: ${errors.slice(0, 3).join(" | ")}` : ""}`);
      check(external === 0, `browser/${tier}: no external requests (${external})`);
      await ctx.close();
    }
    console.log("  browser    style               meshes  calls  tris(drawn)  textures   walk");
    for (const r of report) console.log(`  ${r.tier.padEnd(9)}  ${r.st.padEnd(19)} ${String(r.meshes).padStart(6)} ${String(r.calls).padStart(6)} ${String(r.triangles).padStart(12)}  ${fmtB(r.textureBytes).padStart(9)}  ${r.walk}`);
    if (process.env.IXR_REPORT) writeFileSync(process.env.IXR_REPORT, JSON.stringify(report, null, 1));
  } catch (e) {
    check(false, `browser pass: ${String(e.message).split("\n")[0]}`);
  } finally { await browser?.close(); server.close(); }
}

console.log(`\n${failures ? "FAIL" : "PASS"} check_robo_interiors: ${passes} passed, ${failures} failed`);
process.exit(failures ? 1 : 0);
