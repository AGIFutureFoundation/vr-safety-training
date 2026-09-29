#!/usr/bin/env node
/**
 * WALKABLE checker (docs/consoles/WALKABLE.md): the 22 maps and the standalone worlds as one walkable world.
 *     node tools/check_walkable.mjs
 *   - pairing: every paired connector's far end is mutual (the far map's connector pairs back to it);
 *   - round trip: A -> B (land onward of the far connector) -> walk back into it -> A lands within a pad of the start;
 *   - no ping-pong: every landing lies outside the far connector's trigger;
 *   - state carries: time of day, weather and a vehicle being driven survive wkCarry -> wkArrival;
 *   - no crossing lands on water or on a road centreline (every landing dry and off the carriageway);
 *   - edges: the soft band always pushes inward, names a way on, and a walker pinned at the rim is never trapped;
 *   - atlas: every map, every region and every standalone world, each world with a way in;
 *   - solids: parked-vehicle boxes contain their vehicle; the app wires crossing, edge, atlas and the guarded import;
 *   - browser (skip with --no-browser; WK_PORT=9003): open a map by a carry URL, check the landing, facing and carried
 *     time/weather, walk into the paired connector and ride back, landing within a pad of the start; reduced motion
 *     crosses with no fade; no page errors.
 */
import { readFileSync, existsSync, statSync } from "node:fs";
import { createServer } from "node:http";
import { dirname, join, extname, normalize } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const WEBXR = join(ROOT, "WebXR");
const imp = (p) => import(pathToFileURL(join(WEBXR, p)).href);
let passed = 0, failed = 0;
const check = (area, ok, msg) => { if (ok) passed += 1; else { failed += 1; console.log(`  FAIL [${area}] ${msg}`); } return ok; };
const say = (s) => console.log(`  ${s}`);

const W = await imp("shared/wk-walkable.js");
const { NP_PARISHES, NP_REGIONS, npResolveConnectors } = await imp("shared/np-parishes.js");
const { npWaterAt } = await imp("shared/np-parish.js");
const d2 = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1]);

// ------------------------------------------------------------ pairing and round trips
const pairs = W.wkPairs();
check("pairs", pairs.length >= 60, `${pairs.length} paired crossings (at least 60 expected)`);
let worst = 0, mutual = 0, decks = 0;
// Connectors authored in open water with no deck (the Twin Spans at Orleans' corner): the landing is the nearest shore.
const far = new Set(NP_PARISHES.flatMap((p) => npResolveConnectors(p).filter((c) => npWaterAt(p, ...c.from.position) && !W.wkDeckAt(p, ...c.from.position)).map((c) => c.id)));
for (const pr of pairs) {
  const tag = `${pr.from}:${pr.conn.id} -> ${pr.to.id}:${pr.back.id}`;
  const A = NP_PARISHES.find((p) => p.id === pr.from);
  const rev = W.wkPair(pr.to, pr.back);
  if (check("mutual", rev && rev.back.id === pr.conn.id && rev.to.id === A.id, `${tag} pairs back to ${rev?.back.id}`)) mutual += 1;
  // A -> B: the page on B opened by the carry URL lands where the pair says.
  const url = W.wkCarry(pr, { time: 2, weather: 3, drive: "dv-test-truck" });
  const q = new URLSearchParams(url.slice(1));
  check("carry", q.get("parish") === pr.to.id, `${tag}: the carry URL opens ${q.get("parish")}`);
  const arr = W.wkArrival(q, pr.to);
  check("state", arr && arr.time === 2 && arr.weather === 3 && arr.drive === "dv-test-truck", `${tag}: time, weather and vehicle carry (${JSON.stringify(arr && { t: arr.time, w: arr.weather, d: arr.drive })})`);
  if (!arr) continue;
  check("landing", d2(arr.landing, pr.landing) < 1e-6, `${tag}: arrival lands at the paired spot`);
  check("no-ping-pong", d2(arr.landing, pr.back.from.position) > W.WK_TRIGGER, `${tag}: lands outside the far trigger (${d2(arr.landing, pr.back.from.position).toFixed(1)} m)`);
  const deck = W.wkDeckAt(pr.to, ...arr.landing);
  if (deck) decks += 1;
  check("dry", !npWaterAt(pr.to, ...arr.landing) || !!deck, `${tag}: lands on dry ground or a deck's kerb lane at ${arr.landing}`);
  check("road", W.wkRoadClear(pr.to, ...arr.landing) >= (deck ? 0.4 : W.WK_SHOULDER), `${tag}: lands off the carriageway (${W.wkRoadClear(pr.to, ...arr.landing).toFixed(2)} half-widths)`);
  // B -> A: walk from the landing into the back connector; the carry lands on A near where the trip began.
  const back = W.wkPair(pr.to, pr.back);
  const q2 = new URLSearchParams(W.wkCarry(back, { time: arr.time, weather: arr.weather }).slice(1));
  const home = W.wkArrival(q2, A);
  const err = home ? d2(home.landing, pr.conn.from.position) : Infinity;
  worst = Math.max(worst, err);
  // The start is wherever the walker stood inside A's trigger, so a pad around any point of the trigger.
  const tol = W.WK_PAD + W.WK_TRIGGER;
  check("round-trip", err <= tol || (!pr.conn.dryStart && far.has(pr.conn.id)), `${tag}: A->B->A lands ${err.toFixed(1)} m from the connector (a pad of ${W.WK_PAD} m around the ${W.WK_TRIGGER} m trigger)`);
  if (err > tol) say(`shore landing: ${tag} (the connector stands in open water; you land on the nearest shore, ${err.toFixed(0)} m)`);
  check("state", home?.time === 2 && home?.weather === 3, `${tag}: state survives the round trip`);
}
say(`paired crossings: ${pairs.length}, mutual ${mutual}, worst round trip ${worst.toFixed(1)} m (pad ${W.WK_PAD}), ${decks} land on a bridge or causeway kerb lane`);

// Every non-world connector to another built map is paired (none silently left as a press-E-only way).
let unpaired = 0;
for (const p of NP_PARISHES) for (const c of npResolveConnectors(p)) if (!c.world && c.resolved && c.to.parish !== p.id && !W.wkPair(p, c)) { unpaired += 1; say(`unpaired: ${p.id}:${c.id} -> ${c.to.parish} (stays a way out)`); }
say(`unpaired cross-map connectors (kept as "ways out"): ${unpaired}`);

// ------------------------------------------------------------ edges
let rimChecks = 0;
for (const p of NP_PARISHES) {
  const h = (p.size ?? 4096) / 2;
  for (const [sx, sz] of [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [-1, -1], [0.5, -1], [-1, 0.3]]) {
    let x = sx * (h - 1), z = sz * (h - 1);
    const e = W.wkEdge(p, x, z);
    rimChecks += 1;
    check("edge", e.soft && (e.push[0] * x <= 0) && (e.push[1] * z <= 0) && Math.hypot(...e.push) > 0, `${p.id}: the rim at (${x}, ${z}) pushes inward`);
    check("edge", !!e.way?.conn, `${p.id}: the rim names a way on`);
    // A walker who keeps pushing outward for 20 s stays in the field; turning back gets them out of the band.
    for (let t = 0; t < 20 * 30; t++) { const ee = W.wkEdge(p, x, z); x += (sx * 5 + ee.push[0]) / 30; z += (sz * 5 + ee.push[1]) / 30; [x, z] = W.wkClamp(p, x, z); }
    check("edge", Math.abs(x) < h && Math.abs(z) < h, `${p.id}: pushing outward stays in the field`);
    for (let t = 0; t < 30 * 30; t++) { const ee = W.wkEdge(p, x, z); x += (-sx * 5 + ee.push[0]) / 30; z += (-sz * 5 + ee.push[1]) / 30; }
    check("edge", !W.wkEdge(p, x, z).soft, `${p.id}: walking back in leaves the soft band (not trapped)`);
  }
  // Mid-map there is no boundary at all.
  check("edge", !W.wkEdge(p, 0, 0).soft, `${p.id}: no boundary mid-map`);
  // Every connector's trigger is reachable (inside the clamp).
  for (const c of npResolveConnectors(p)) { const [cx, cz] = W.wkClamp(p, ...c.from.position); check("edge", d2([cx, cz], c.from.position) < W.WK_TRIGGER, `${p.id}:${c.id} trigger is reachable inside the field`); }
}
say(`edges: ${rimChecks} rim probes over ${NP_PARISHES.length} maps`);

// ------------------------------------------------------------ atlas
const atlas = W.wkAtlas();
const listed = new Set(atlas.regions.flatMap((r) => r.maps.map((m) => m.id)));
check("atlas", NP_PARISHES.every((p) => listed.has(p.id)), `the atlas lists every map (${listed.size}/${NP_PARISHES.length})`);
check("atlas", atlas.regions.length === 6 && NP_REGIONS.every((r) => atlas.regions.some((x) => x.id === r.id)), `the atlas shows six regions (${atlas.regions.length})`);
for (const w of ["Bay World", "the Deep", "Redwood Reach", "Sierra Summit", "Regatta"]) {
  const x = atlas.worlds.find((a) => a.name === w);
  check("atlas", !!x && !!x.href && (x.ways.length > 0 || !!x.ride), `the atlas lists ${w} with a way in`);
}
check("atlas", atlas.links.length >= pairs.length / 2 - 1, `the atlas joins maps by ${atlas.links.length} connectors`);
say(`atlas: ${atlas.regions.length} regions, ${listed.size} maps, ${atlas.links.length} links, ${atlas.worlds.length} worlds (${atlas.worlds.map((w) => `${w.name}:${w.ways.length}`).join(", ")})`);

// ------------------------------------------------------------ solids
{
  const boxes = W.wkSolidBoxes([{ id: "mv-a", x: 10, z: 20, heading: Math.PI / 2, dims: [2.4, 2.6, 7] }], () => 1);
  const b = boxes[0];
  check("solids", b.kind === "parked-vehicle" && b.max[0] - b.min[0] > 6.9 && b.max[2] - b.min[2] > 2.3 && b.min[1] < 1 && b.max[1] > 3.5, `a parked vehicle turned 90 degrees is a ${(b.max[0] - b.min[0]).toFixed(1)} x ${(b.max[2] - b.min[2]).toFixed(1)} box`);
}

// ------------------------------------------------------------ the app
const app = readFileSync(join(WEBXR, "parishes/js/app.js"), "utf8");
const html = readFileSync(join(WEBXR, "parishes/parishes.html"), "utf8");
check("app", app.includes('from "../../shared/wk-walkable.js"'), "the parishes app imports wk-walkable.js");
check("app", /wkArrival\(npParams, parish\)/.test(app), "the app reads the arrival (landing, facing, carried state)");
check("app", /wkCross\(/.test(app) && /wkCarry\(/.test(app), "walking into a paired connector carries you across");
check("app", /wkEdge\(parish/.test(app), "the soft edge runs in the walk");
check("app", /npReduced \? 0 : WK_FADE_MS/.test(app), "reduced motion: no fade");
check("app", /import\("\.\.\/\.\.\/shared\/mv-world\.js"\)[^;]*\.catch\(/.test(app), "MOTORWORKS' mv-world.js import is guarded");
check("app", /npCrossWorld\(c\)/.test(app) && /location\.href = `\?parish=/.test(app), "the existing ways out still work (E at a way out)");
check("html", /id="ux-panel-map"[\s\S]*?id="wk-atlas"[\s\S]*?<\/div>\s*<div class="ux-panel" role="tabpanel" id="ux-panel-me"/.test(html), "the region atlas mounts inside the Map tab");
check("html", html.includes('id="wk-fade"'), "the crossing fade layer is on the page");

// ------------------------------------------------------------ the browser round trip
if (!process.argv.includes("--no-browser")) {
  const PW = process.env.PLAYWRIGHT_MODULE || "/opt/node22/lib/node_modules/playwright/index.mjs";
  const EXE = process.env.CHROMIUM_PATH || "/opt/pw-browsers/chromium";
  const TYPES = { ".html": "text/html", ".js": "application/javascript", ".mjs": "application/javascript", ".json": "application/json", ".css": "text/css", ".png": "image/png", ".svg": "image/svg+xml" };
  const server = createServer((req, res) => {
    const path = normalize(decodeURIComponent(new URL(req.url, "http://x").pathname)).replace(/^([/\\])+/, "");
    const file = join(WEBXR, path);
    if (!file.startsWith(WEBXR) || !existsSync(file) || statSync(file).isDirectory()) { res.writeHead(404); res.end(); return; }
    res.writeHead(200, { "content-type": TYPES[extname(file)] ?? "application/octet-stream" }); res.end(readFileSync(file));
  });
  await new Promise((r) => { server.once("error", () => server.listen(0, "127.0.0.1", r)); server.listen(Number(process.env.WK_PORT || 9003), "127.0.0.1", r); });
  const origin = `http://127.0.0.1:${server.address().port}`;
  const base = `${origin}/parishes/parishes.html`;
  const THREE_SRC = readFileSync(join(WEBXR, "vendor/three/dist/three.module.min.js"), "utf8");
  let browser = null;
  try { const { chromium } = await import(PW); browser = await chromium.launch({ executablePath: EXE, args: ["--use-gl=swiftshader", "--enable-unsafe-swiftshader", "--no-sandbox"] }); }
  catch (e) { check("browser", false, `could not launch headless Chromium: ${String(e.message).split("\n")[0]}`); }
  if (browser) {
    // Jefferson's crossing into Orleans: open Orleans as the carry URL does, then walk back into the crossing.
    const pr = pairs.find((p) => p.from === "jefferson" && p.to.id === "orleans" && p.dry) ?? pairs[0];
    const A = NP_PARISHES.find((p) => p.id === pr.from);
    for (const reduced of [false, true]) {
      const ctx = await browser.newContext({ viewport: { width: 1000, height: 700 }, reducedMotion: reduced ? "reduce" : "no-preference" });
      await ctx.route("**/*", (route) => {
        const u = route.request().url();
        if (u.startsWith(origin)) return route.continue();
        if (/three(\.module)?(\.min)?\.js$/.test(u)) return route.fulfill({ status: 200, contentType: "application/javascript", body: THREE_SRC });
        return route.abort();
      });
      const page = await ctx.newPage();
      const errors = []; page.on("pageerror", (e) => errors.push(String(e.message).split("\n")[0]));
      const tag = reduced ? "reduced motion" : "full motion";
      try {
        await page.goto(`${base}${W.wkCarry(pr, { time: 3, weather: 2 })}`);
        await page.waitForFunction(() => !!window.__parishTest?.walkable, null, { timeout: 90000 });
        const got = await page.evaluate(() => { const t = window.__parishTest; return { x: t.np.x, z: t.np.z, yaw: t.np.yaw, time: t.np.timeIdx, wx: t.np.weatherIdx, parish: t.parish.id, armed: t.walkable.armed(), url: location.search }; });
        check("browser", got.parish === pr.to.id && Math.hypot(got.x - pr.landing[0], got.z - pr.landing[1]) < 2, `${tag}: arrives on ${got.parish} at (${got.x.toFixed(0)}, ${got.z.toFixed(0)}), the paired spot (${pr.landing})`);
        check("browser", got.time === 3 && got.wx === 2, `${tag}: time of day and weather carried (${got.time}, ${got.wx})`);
        check("browser", !got.armed && !/wkvia/.test(got.url), `${tag}: trigger disarmed on arrival, the URL tidied (${got.url})`);
        // Walk out of the trigger (re-arm), then into the far connector: the page carries us back to A.
        await page.evaluate(() => window.__parishTest.begin?.());
        await page.evaluate(([x, z]) => window.__parishTest.teleport(x, z), [pr.landing[0] + (pr.landing[0] - pr.back.from.position[0]), pr.landing[1] + (pr.landing[1] - pr.back.from.position[1])]);
        await page.waitForFunction(() => window.__parishTest.walkable.armed(), null, { timeout: 15000 });
        const t0 = Date.now();
        const nav = page.waitForURL((u) => u.searchParams.get("parish") === A.id, { timeout: 30000 });
        await page.evaluate(([x, z]) => window.__parishTest.teleport(x, z), pr.back.from.position);
        await nav;
        await page.waitForFunction(() => !!window.__parishTest?.walkable, null, { timeout: 90000 });
        const home = await page.evaluate(() => { const t = window.__parishTest; return { x: t.np.x, z: t.np.z, parish: t.parish.id, time: t.np.timeIdx, wx: t.np.weatherIdx }; });
        const err = Math.hypot(home.x - pr.conn.from.position[0], home.z - pr.conn.from.position[1]);
        check("browser", home.parish === A.id && err <= W.WK_PAD + W.WK_TRIGGER, `${tag}: walking into ${pr.back.name} rides back to ${home.parish}, ${err.toFixed(1)} m from the start`);
        check("browser", home.time === 3 && home.wx === 2, `${tag}: state survives the round trip in the page (${home.time}, ${home.wx})`);
        check("browser", !errors.length, `${tag}: no page errors (${errors.slice(0, 2).join(" | ")})`);
        say(`browser (${tag}): ${pr.from}:${pr.conn.id} -> ${pr.to.id} -> walked back -> ${home.parish}, round trip ${err.toFixed(1)} m, state ${home.time}/${home.wx}, crossing ${((Date.now() - t0) / 1000).toFixed(1)} s incl. load`);
      } catch (e) { check("browser", false, `${tag}: ${String(e.message).split("\n")[0]} ${errors.slice(0, 2).join(" | ")}`); }
      await ctx.close();
    }
    await browser.close();
  }
  server.close();
}

console.log(`\ncheck_walkable: ${passed} passed, ${failed} failed`);
process.exit(failed ? 1 : 0);
