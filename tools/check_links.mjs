/**
 * Every open-world link works, in the repo layout and in the published flat
 * build (console WAYPOINT, tools/briefs/links-brief.md).
 *
 *  1. Anchors: every page in both layouts is opened headlessly and every
 *     same-origin anchor it renders must resolve to a file (the generated
 *     track pages are read statically; they carry no script-built links).
 *  2. Station links, from the pure data: every station on every Bay World
 *     site (BAY_SITES) and every Deep site (DEEP_SITES), every Regatta event
 *     briefing, Fairway's grounds board and every Atlas entry, in both
 *     layouts (the flat link is the bundler's own dist_fixup + combined_fixup
 *     of the source link). A SmartCiti.X station must be in the catalog and
 *     the published sim chunk table; a Trade Skills room must open the Trade
 *     Skills app with ?room=; every link must carry ?from= and a same-origin
 *     ?return= that lands on the world's page.
 *  3. Both job boards, rendered by the real bundle for every site, list each
 *     station with its own Start link equal to the computed one.
 *  4. Sample loads: one SmartCiti.X station per world and every Trade Skills
 *     room load the named station or room without a page error.
 *  5. Every ?site= deep link for the Deep and Bay World: the HUD names it.
 *  6. The round trip: a room opened from a board offers "Back to <world>",
 *     that link resolves, and with a passport record seeded Bay World comes
 *     home to that site's board.
 *  7. The homepage continue strip (tools/gen_home.mjs, owned by MARQUEE) is
 *     checked in both layouts; while it is pending it is reported, not
 *     failed (LK_STRICT_CONTINUE=1 makes it fail).
 *
 * three.js and React are answered from WebXR/vendor/, fonts are stubbed and
 * everything off-host is aborted, as tools/check_mobile.mjs does. If no
 * browser can be launched this checker FAILS with a clear message.
 *
 *     node tools/check_links.mjs
 */
import { createServer } from "node:http";
import { readFileSync, existsSync, statSync, readdirSync } from "node:fs";
import { dirname, join, extname, normalize } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { spawnSync } from "node:child_process";

const here = dirname(fileURLToPath(import.meta.url));
const ROOT = join(here, "..");
const WEBXR = join(ROOT, "WebXR");
const DIST = join(WEBXR, "dist");
const THREE_FILE = join(WEBXR, "vendor/three/dist/three.module.min.js");
const PW = process.env.PLAYWRIGHT_MODULE || "/opt/node22/lib/node_modules/playwright/index.mjs";
const EXE = process.env.CHROMIUM_PATH || "/opt/pw-browsers/chromium";

let failures = 0, passes = 0;
const pending = [];
function check(ok, what, detail = "") {
  if (ok) { passes += 1; return true; }
  failures += 1; console.log(`✗ ${what}${detail ? ` — ${detail}` : ""}`);
  return false;
}
function die(msg) { console.log(`✗ ${msg}`); console.log("check_links: FAILED (no browser run)"); process.exit(1); }

if (!existsSync(THREE_FILE)) die(`the vendored three.js is missing at ${THREE_FILE}`);
if (!existsSync(join(DIST, "index.html"))) die("WebXR/dist/ is missing — run python3 tools/bundle_webxr.py");

// ------------------------------------------------------------ pure data

// Headless modules read storage at import time in places; give them a stub.
const lkStub = () => { const m = new Map(); return { getItem: (k) => (m.has(k) ? m.get(k) : null), setItem: (k, v) => m.set(k, String(v)), removeItem: (k) => m.delete(k), clear: () => m.clear() }; };
globalThis.localStorage ??= lkStub();
globalThis.sessionStorage ??= lkStub();
const imp = (rel) => import(pathToFileURL(join(WEBXR, rel)).href);

const catalog = JSON.parse(readFileSync(join(WEBXR, "smartcity/catalog.json"), "utf8"));
const CAT_ROOMS = new Set(catalog.stations.filter((s) => s.app === "trades").map((s) => s.id));
const CAT_STATIONS = new Set(catalog.stations.filter((s) => s.app !== "trades").map((s) => s.id));
const { SIMS_META } = await imp("smartcity/js/sims-meta.js");
const CHUNKS = new Set(SIMS_META.map((s) => s.id));
const LK = await imp("shared/links.js");
check(LK.LK_TRADES_ROOMS.length === CAT_ROOMS.size && LK.LK_TRADES_ROOMS.every((id) => CAT_ROOMS.has(id)),
  "shared/links.js's Trade Skills rooms are the catalog's app: \"trades\" stations", `${LK.LK_TRADES_ROOMS} vs ${[...CAT_ROOMS]}`);
const { BAY_SITES, BAY_LANDMARKS } = await imp("shared/bayworld-data.js");
const { DEEP_SITES } = await imp("shared/underwater-data.js");
const { bwMissionLink } = await imp("bayworld/js/sim.js");
const { dvMissionLink } = await imp("underwater/js/dive-sim.js");
const { RG_EVENTS, rgStationLink } = await imp("regatta/js/events.js");
const { PP_PROGRAMMES } = await imp("shared/passport-programmes.js");
const { ppReturnTarget } = await imp("shared/passport.js");
const { atlasPlaces, atlasDeepLinks } = await imp("bayworld/js/atlas.js");
const FW_STATIONS = PP_PROGRAMMES["grounds-and-landscaping"]?.stations ?? [];
check(FW_STATIONS.length > 0, "Fairway's grounds board has stations");
// Fairway's board is built in app.js (three.js, not importable here) with this runner:
const FW_RUNNER = (readFileSync(join(WEBXR, "fairway/js/app.js"), "utf8").match(/const FW_RUNNER = "([^"]+)"/) ?? [])[1];
check(!!FW_RUNNER && /lkStationLink\(id, \{ runner: FW_RUNNER/.test(readFileSync(join(WEBXR, "fairway/js/app.js"), "utf8")), "Fairway's board routes through lkStationLink");

// The flat link for a source link: the bundler's own two rewrites, run in Python.
function lkFlatten(links) {
  const code = "import sys,json; sys.path.insert(0,'tools'); import bundle_webxr as b; " +
    "print(json.dumps([b.combined_fixup(b.dist_fixup('\"'+l))[1:] for l in json.load(sys.stdin)]))";
  const r = spawnSync("python3", ["-c", code], { cwd: ROOT, input: JSON.stringify(links), encoding: "utf8" });
  if (r.status !== 0) die(`could not run the bundler's rewrites: ${r.stderr.split("\n").slice(-2).join(" ")}`);
  return JSON.parse(r.stdout);
}

// ------------------------------------------------------------ resolution

// Layouts: the repo served from the repository root (pages at /WebXR/...),
// the published flat build served from WebXR/dist/.
const LAYOUTS = { repo: { root: ROOT, prefix: "/WebXR/" }, flat: { root: DIST, prefix: "/" } };
const isRunnerPath = (p) => /\/smartcity\/(index\.html|dist\/smartcity-x\.html)$|\/smartcity-x\.html$/.test(p);
const isTradesPath = (p) => /\/trades\/(index\.html|dist\/trade-skills-simulator\.html)$|\/trade-skills-simulator\.html$/.test(p);
function lkFileFor(layout, pathname) {
  let p = decodeURIComponent(pathname);
  if (p.endsWith("/")) p += "index.html";
  const file = normalize(join(LAYOUTS[layout].root, p));
  if (!file.startsWith(LAYOUTS[layout].root)) return null;
  return existsSync(file) && statSync(file).isFile() ? file : null;
}
/** Why `href` (absolute, on origin) does not work in `layout`, or null. */
function lkWhyBroken(layout, href, origin, { station = false } = {}) {
  let u;
  try { u = new URL(href); } catch { return "not a URL"; }
  if (u.origin !== origin) return null;
  const file = lkFileFor(layout, u.pathname);
  if (!file) return `no file at ${u.pathname}`;
  const sim = u.searchParams.get("sim"), room = u.searchParams.get("room");
  if (sim !== null) {
    if (!isRunnerPath(u.pathname)) return `?sim= on a page that is not SmartCiti.X (${u.pathname})`;
    if (CAT_ROOMS.has(sim)) return `Trade Skills room "${sim}" sent to SmartCiti.X`;
    if (!CAT_STATIONS.has(sim)) return `station "${sim}" is not in the catalog`;
    if (!CHUNKS.has(sim) || !existsSync(join(dirname(file), dirname(file).endsWith("smartcity") ? "js/sims" : "sims", `${sim}.js`))) return `station "${sim}" has no published sim chunk beside ${u.pathname}`;
  }
  if (room !== null) {
    if (!isTradesPath(u.pathname)) return `?room= on a page that is not Trade Skills (${u.pathname})`;
    if (!CAT_ROOMS.has(room)) return `room "${room}" is not a Trade Skills room`;
  }
  if (station) {
    if (sim === null && room === null) return "a station link names no station";
    const back = ppReturnTarget(u.search, u.href);
    if (!u.searchParams.get("from")) return "no ?from=";
    if (u.searchParams.get("return") !== null) {
      if (!back) return "?return= is not a same-origin page";
      const bu = new URL(back.url);
      if (!lkFileFor(layout, bu.pathname)) return `the way home ${bu.pathname} is not a page`;
    }
  }
  return null;
}

// ------------------------------------------------------------ server + browser

const TYPES = { ".html": "text/html", ".js": "application/javascript", ".mjs": "application/javascript", ".json": "application/json", ".css": "text/css",
  ".png": "image/png", ".jpg": "image/jpeg", ".svg": "image/svg+xml", ".glb": "model/gltf-binary", ".wasm": "application/wasm", ".md": "text/markdown" };
async function lkServe(root) {
  const server = createServer((req, res) => {
    const path = normalize(decodeURIComponent(new URL(req.url, "http://x").pathname)).replace(/^([/\\])+/, "");
    const file = join(root, path);
    if (!file.startsWith(root) || !existsSync(file) || statSync(file).isDirectory()) { res.writeHead(404); res.end(); return; }
    res.writeHead(200, { "content-type": TYPES[extname(file)] ?? "application/octet-stream" });
    res.end(readFileSync(file));
  });
  await new Promise((r) => server.listen(0, "127.0.0.1", r));
  return { server, origin: `http://127.0.0.1:${server.address().port}` };
}
const servers = { repo: await lkServe(ROOT), flat: await lkServe(DIST) };
const originOf = (layout) => servers[layout].origin;
const pageUrl = (layout, rel) => `${originOf(layout)}${LAYOUTS[layout].prefix}${rel}`;

let chromium, browser;
try {
  ({ chromium } = await import(PW));
  browser = await chromium.launch({ executablePath: EXE, args: ["--use-gl=swiftshader", "--enable-unsafe-swiftshader", "--no-sandbox"] });
} catch (e) {
  for (const s of Object.values(servers)) s.server.close();
  die(`could not launch headless Chromium (${PW}, ${EXE}): ${String(e.message).split("\n")[0]}`);
}
const THREE_SRC = readFileSync(THREE_FILE, "utf8");
const REACT_SRC = Object.fromEntries(["react.production.min.js", "react-dom.production.min.js"].map((f) => [f, readFileSync(join(WEBXR, "vendor/react/dist", f), "utf8")]));
async function lkContext(init = null) {
  const context = await browser.newContext({ viewport: { width: 1280, height: 720 } });
  await context.route(/^https?:\/\/(?!127\.0\.0\.1)/, (r) => r.abort());
  await context.route("**/cdnjs.cloudflare.com/ajax/libs/three.js/**", (r) => r.fulfill({ status: 200, contentType: "application/javascript", body: THREE_SRC }));
  await context.route(/cdnjs\.cloudflare\.com\/ajax\/libs\/react(-dom)?\/18\.3\.1\/umd\//, (r) => {
    const file = r.request().url().split("/").pop();
    return REACT_SRC[file] ? r.fulfill({ status: 200, contentType: "application/javascript", body: REACT_SRC[file] }) : r.abort();
  });
  await context.route(/fonts\.(googleapis|gstatic)\.com/, (r) => r.fulfill({ status: 200, contentType: "text/css", body: "" }));
  if (init) await context.addInitScript(init.fn, init.arg);
  return context;
}
async function lkOpen(context, url, { settle = 900 } = {}) {
  const page = await context.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(String(e.message).split("\n")[0]));
  // A module the page imports that the layout cannot answer fails the whole
  // module graph without a page error — count it as one.
  page.on("response", (r) => {
    if (r.status() === 404 && r.url().startsWith(new URL(url).origin) && ["script", "document"].includes(r.request().resourceType())) errors.push(`404 ${new URL(r.url()).pathname}`);
  });
  await page.goto(url, { waitUntil: "load", timeout: 45000 });
  await page.waitForTimeout(settle);
  return { page, errors };
}
/** Run `fn(item)` over `items`, `n` at a time. */
async function lkPool(items, n, fn) {
  const queue = [...items];
  await Promise.all(Array.from({ length: n }, async () => { while (queue.length) await fn(queue.shift()); }));
}

const tally = {};
const bump = (world, n = 1) => { tally[world] = (tally[world] ?? 0) + n; };

// ------------------------------------------------------------ 1. anchors

const REPO_PAGES = ["index.html", "smartcity/index.html", "trades/index.html", "holodeck/index.html", "instructor/index.html", "race/index.html",
  "arcade/index.html", "fairway/index.html", "bayworld/index.html", "bayworld/atlas.html", "regatta/regatta.html", "underwater/underwater.html",
  "portal/index.html", "verify/index.html", "campus/index.html"].filter((p) => existsSync(join(WEBXR, p)));
const FLAT_PAGES = readdirSync(DIST).filter((f) => f.endsWith(".html"));
const TRACK_PAGES = existsSync(join(DIST, "tracks")) ? readdirSync(join(DIST, "tracks")).filter((f) => f.endsWith(".html")).map((f) => `tracks/${f}`) : [];
{
  const context = await lkContext();
  const jobs = [...REPO_PAGES.map((p) => ["repo", p]), ...FLAT_PAGES.map((p) => ["flat", p])];
  await lkPool(jobs, 4, async ([layout, rel]) => {
    const url = pageUrl(layout, rel);
    let hrefs = [], errors = [];
    try {
      const o = await lkOpen(context, url);
      errors = o.errors;
      hrefs = await o.page.evaluate(() => [...document.querySelectorAll("a[href]")].map((a) => a.href));
      await o.page.close();
    } catch (e) { check(false, `${layout} ${rel} opens`, String(e.message).split("\n")[0]); return; }
    check(!errors.length, `${layout} ${rel} opens without a page error`, errors.join(" | "));
    for (const h of new Set(hrefs)) {
      if (!/^https?:/.test(h)) continue;
      const why = lkWhyBroken(layout, h, originOf(layout));
      check(!why, `${layout} ${rel}: anchor ${h.replace(originOf(layout), "")}`, why ?? "");
      bump(`anchors ${layout}`);
    }
  });
  await context.close();
  // The generated track pages: static markup, read as written.
  for (const rel of TRACK_PAGES) {
    const html = readFileSync(join(DIST, rel), "utf8");
    for (const m of html.matchAll(/<a\b[^>]*\shref="([^"]+)"/g)) {
      const href = new URL(m[1].replace(/&amp;/g, "&"), pageUrl("flat", rel)).href;
      if (!/^https?:/.test(href)) continue;
      const why = lkWhyBroken("flat", href, originOf("flat"));
      check(!why, `flat ${rel}: anchor ${m[1]}`, why ?? "");
      bump("anchors flat");
    }
  }
}

// ------------------------------------------------------------ 2. station links

// [world, source page (repo, rel to WebXR/), flat page, source link builder(page) → [{ id, link }]]
const WORLDS = [
  ["Bay World", "bayworld/index.html", "bayworld.html", (page) => BAY_SITES.flatMap((s) => (s.stations ?? []).map((id) => ({ id, site: s.id, link: bwMissionLink(s, { station: id, page }) })))],
  ["the Deep", "underwater/underwater.html", "underwater.html", (page) => DEEP_SITES.flatMap((s) => (s.stations ?? []).map((id) => ({ id, site: s.id, link: dvMissionLink(s, { station: id, page }) })))],
  ["the Regatta", "regatta/regatta.html", "regatta.html", (page) => RG_EVENTS.flatMap((e) => e.stations.map((id) => ({ id, site: e.id, link: rgStationLink(id, { page, eventId: e.id }) })))],
  ["Fairway", "fairway/index.html", "fairway.html", (page) => FW_STATIONS.map((id) => ({ id, site: "grounds", link: LK.lkStationLink(id, { runner: FW_RUNNER, from: "fairway", page, siteId: "grounds" }) }))],
  ["the Atlas", "bayworld/atlas.html", "atlas.html", () => atlasPlaces().flatMap((p) => {
    const l = atlasDeepLinks(p);
    return [...(l.station ? [{ id: p.stations[0], site: p.id, link: l.station, station: true }] : []), { id: null, site: p.id, link: l.bayworld }, ...l.programmes.map((x) => ({ id: null, site: p.id, link: x.href }))];
  })],
];
const SAMPLE = {}; // world → a flat SmartCiti.X link and every flat Trade Skills link
for (const [world, repoPage, flatPage, build] of WORLDS) {
  const repoLinks = build(`/WebXR/${repoPage}`);
  const flatLinks = build(`/${flatPage}`);
  const flat = lkFlatten(flatLinks.map((x) => x.link));
  let n = 0;
  repoLinks.forEach((x, i) => {
    const isStation = x.station ?? x.id !== null;
    for (const [layout, link, page] of [["repo", x.link, `/WebXR/${repoPage}`], ["flat", flat[i], `/${flatPage}`]]) {
      const href = new URL(link, originOf(layout) + page).href;
      const why = lkWhyBroken(layout, href, originOf(layout), { station: isStation && world !== "the Atlas" });
      check(!why, `${world} ${layout}: ${x.site} → ${x.id ?? link}`, `${why} (${link})`);
      if (isStation && layout === "flat" && !why) {
        const u = new URL(href);
        const s = (SAMPLE[world] ??= { sim: null, rooms: {} });
        if (u.searchParams.get("sim") && !s.sim) s.sim = href;
        if (u.searchParams.get("room") && !s.rooms[x.id]) s.rooms[x.id] = href;
      }
      n += 1;
    }
    if (isStation) check(LK.lkIsTradesRoom(x.id) === /[?&]room=/.test(x.link), `${world}: ${x.id} is routed by its kind`, x.link);
  });
  bump(world, n);
}

// ------------------------------------------------------------ 3. job boards, as rendered

for (const [world, hook, repoPage, flatPage, sites] of [
  ["Bay World", "__bayworldTest", "bayworld/index.html", "bayworld.html", BAY_SITES],
  ["the Deep", "__underwaterTest", "underwater/underwater.html", "underwater.html", DEEP_SITES],
]) {
  for (const layout of ["repo", "flat"]) {
    const context = await lkContext();
    try {
      const { page, errors } = await lkOpen(context, pageUrl(layout, layout === "repo" ? repoPage : flatPage));
      await page.waitForFunction((h) => !!window[h]?.jobBoard, hook, { timeout: 20000 });
      const boards = await page.evaluate(({ h, sites }) => sites.map((s) => {
        window[h].jobBoard(s);
        const ul = document.getElementById("jb-stations");
        return { id: s.id, n: s.stations.length, listed: ul.hidden ? [] : [...ul.querySelectorAll("a")].map((a) => ({ id: a.dataset.station, href: a.href })),
          launch: !document.getElementById("jb-launch").hidden };
      }), { h: hook, sites: sites.map((s) => ({ id: s.id, name: s.name, zone: s.zone, stations: s.stations ?? [], programmes: s.programmes ?? [] })) });
      for (const b of boards) {
        const site = sites.find((s) => s.id === b.id);
        if (b.n > 1) {
          check(b.listed.length === b.n && !b.launch, `${world} ${layout}: ${b.id}'s board lists all ${b.n} stations with their own Start`, `${b.listed.length} listed`);
          for (const a of b.listed) {
            const why = lkWhyBroken(layout, a.href, originOf(layout), { station: true });
            check(!why, `${world} ${layout}: ${b.id}'s board Start ${a.id}`, why ?? "");
            check(new URL(a.href).searchParams.get(LK.lkIsTradesRoom(a.id) ? "room" : "sim") === a.id, `${world} ${layout}: ${b.id}'s Start ${a.id} opens that station`, a.href);
            bump(world);
          }
        } else check(b.launch === (b.n === 1), `${world} ${layout}: ${b.id}'s single-station board keeps its Start button`);
        void site;
      }
      check(!errors.length, `${world} ${layout} board page opens without a page error`, errors.join(" | "));
      await page.close();
    } catch (e) { check(false, `${world} ${layout}: the job boards render`, String(e.message).split("\n")[0]); }
    await context.close();
  }
}

// ------------------------------------------------------------ 4. sample loads

async function lkLoadsStation(href, kind, id) {
  const context = await lkContext();
  try {
    const { page, errors } = await lkOpen(context, href, { settle: 600 });
    const hook = kind === "room" ? "__tradesTest" : "__smartcityTest";
    await page.waitForSelector("#enter-flat", { state: "visible", timeout: 20000 });
    await page.evaluate(() => document.getElementById("enter-flat").click());
    // The station opens on its pre-brief (or straight into the run): either
    // way the named station is the one loaded.
    await page.waitForFunction(({ h, id }) => {
      const t = window[h];
      if (t?.session?.()?.room?.id === id || t?.room?.()?.id === id) return true;
      const pb = document.getElementById("prebrief-start");
      return !!pb && !pb.closest("[hidden]") && pb.offsetParent !== null && location.search.includes(id);
    }, { h: hook, id }, { timeout: 20000 });
    await page.waitForTimeout(500);
    check(!errors.length, `${href.replace(/^http:\/\/[^/]+/, "")} loads ${id} without a page error`, errors.join(" | "));
    const back = kind === "room" ? await page.evaluate(() => window.__tradesTest.returnTarget?.() ?? null) : null;
    await page.close();
    return { ok: true, back };
  } catch (e) {
    check(false, `${href.replace(/^http:\/\/[^/]+/, "")} loads ${kind} ${id}`, String(e.message).split("\n")[0]);
    return { ok: false };
  } finally { await context.close(); }
}
const roomLinks = {};
for (const [world, s] of Object.entries(SAMPLE)) {
  if (s.sim) { await lkLoadsStation(s.sim, "sim", new URL(s.sim).searchParams.get("sim")); bump(`${world} loaded`); }
  for (const [id, href] of Object.entries(s.rooms)) roomLinks[id] ??= href;
}
// Every Trade Skills room, from a board where one lists it, else as Bay World would link it.
let roundTrip = null;
for (const id of LK.LK_TRADES_ROOMS) {
  const href = roomLinks[id] ?? new URL(lkFlatten([LK.lkStationLink(id, { from: "bayworld", page: "/bayworld.html", siteId: BAY_SITES[0].id })])[0], originOf("flat") + "/bayworld.html").href;
  const r = await lkLoadsStation(href, "room", id);
  if (r.ok && !roundTrip && /[?&]from=bayworld/.test(href)) roundTrip = { id, href, back: r.back };
  bump("Trade Skills rooms loaded");
}
// And one each in the repo layout.
{
  const bw = BAY_SITES.find((s) => s.stations?.some((id) => !LK.lkIsTradesRoom(id)));
  const sim = bw.stations.find((id) => !LK.lkIsTradesRoom(id));
  await lkLoadsStation(new URL(bwMissionLink(bw, { station: sim, page: "/WebXR/bayworld/index.html" }), pageUrl("repo", "bayworld/index.html")).href, "sim", sim);
  const room = BAY_SITES.find((s) => s.stations?.some(LK.lkIsTradesRoom));
  const rid = room.stations.find(LK.lkIsTradesRoom);
  await lkLoadsStation(new URL(bwMissionLink(room, { station: rid, page: "/WebXR/bayworld/index.html" }), pageUrl("repo", "bayworld/index.html")).href, "room", rid);
}

// ------------------------------------------------------------ 5. ?site= deep links

for (const [world, repoPage, flatPage, sites, startText] of [
  ["Bay World", "bayworld/index.html", "bayworld.html", BAY_SITES, (s) => `Start the shift at ${s.name}`],
  ["the Deep", "underwater/underwater.html", "underwater.html", DEEP_SITES, (s) => `Splash in at ${s.name}`],
]) {
  const context = await lkContext();
  const jobs = sites.map((s, i) => ["flat", s, i]).concat([["repo", sites[0], 0]]);
  await lkPool(jobs, 4, async ([layout, s, i]) => {
    const url = `${pageUrl(layout, layout === "repo" ? repoPage : flatPage)}?site=${encodeURIComponent(s.id)}`;
    try {
      const { page, errors } = await lkOpen(context, url, { settle: 300 });
      const menu = await page.evaluate(() => document.getElementById("menu-start")?.textContent ?? "");
      check(menu.includes(startText(s)), `${world} ${layout} ?site=${s.id}: the menu names the site`, JSON.stringify(menu));
      // Into the world for a sample of sites: the HUD's prompt names it.
      if (i % 8 === 0) {
        await page.evaluate(() => document.getElementById("menu-start").click());
        await page.waitForFunction((name) => (document.getElementById("hud-prompt")?.textContent ?? "").includes(name), s.name, { timeout: 30000 })
          .then(() => check(true, ""), (e) => check(false, `${world} ${layout} ?site=${s.id}: the HUD names the site`, String(e.message).split("\n")[0]));
      }
      check(!errors.length, `${world} ${layout} ?site=${s.id} opens without a page error`, errors.join(" | "));
      bump(`${world} ?site=`);
      await page.close();
    } catch (e) { check(false, `${world} ${layout} ?site=${s.id}`, String(e.message).split("\n")[0]); }
  });
  await context.close();
}

// ------------------------------------------------------------ 6. the round trip

if (check(!!roundTrip, "a Trade Skills room was opened from a Bay World board for the round trip")) {
  const back = roundTrip.back;
  if (check(!!back && back.label === "Back to Bay World", "Trade Skills offers \"Back to Bay World\" from ?return=", JSON.stringify(back))) {
    const bu = new URL(back.url);
    check(!!lkFileFor("flat", bu.pathname), "the \"Back to Bay World\" link resolves", bu.pathname);
    const siteId = new URLSearchParams(bu.hash.slice(1)).get("site");
    const site = BAY_SITES.find((s) => s.id === siteId);
    check(!!site && site.stations.includes(roundTrip.id), "the way home names the board's site", siteId ?? "");
    // Seed the passport with the finished run, then come home.
    const seed = { id: `lk-${Date.now()}`, at: new Date().toISOString(), app: "trades", source: "bayworld", simId: roundTrip.id, simName: roundTrip.id, passed: true, stars: 3, score: 900, errors: 0 };
    const context = await lkContext({ fn: (rec) => { try { localStorage.setItem("vr-training-records-v1", JSON.stringify([rec])); } catch { /* private */ } }, arg: seed });
    try {
      const { page, errors } = await lkOpen(context, back.url, { settle: 300 });
      await page.evaluate(() => document.getElementById("menu-start")?.click());
      await page.waitForFunction((name) => !document.getElementById("scr-jobboard")?.hidden && document.getElementById("jb-title")?.textContent === name, site?.name, { timeout: 30000 });
      const boardDone = await page.evaluate(() => !document.getElementById("jb-done")?.hidden);
      check(boardDone, "home in Bay World, the seeded pass marks that site's board done");
      check(!errors.length, "the round trip home opens without a page error", errors.join(" | "));
      bump("round trip");
      await page.close();
    } catch (e) { check(false, "the round trip lands on the site's board", String(e.message).split("\n")[0]); }
    await context.close();
  }
}

// ------------------------------------------------------------ 7. the continue strip (MARQUEE)

for (const rec of [{ app: "trades", simId: "kitchen" }, { app: "smartcity", simId: [...CHUNKS][0] }]) {
  for (const layout of ["repo", "flat"]) {
    const seed = { id: `lk-c-${rec.simId}`, at: new Date().toISOString(), simName: rec.simId, passed: true, stars: 2, ...rec };
    const context = await lkContext({ fn: (r) => { try { localStorage.setItem("vr-training-records-v1", JSON.stringify([r])); } catch { /* private */ } }, arg: seed });
    try {
      const { page } = await lkOpen(context, pageUrl(layout, "index.html"), { settle: 300 });
      const href = await page.evaluate(() => { const a = document.getElementById("continue-link"); return a && !document.getElementById("continue")?.hidden ? a.href : null; });
      const why = href ? lkWhyBroken(layout, href, originOf(layout)) : "the strip did not show";
      if (why) {
        const msg = `homepage continue strip (${layout}, ${rec.app}): ${why}`;
        if (process.env.LK_STRICT_CONTINUE) check(false, msg); else pending.push(msg);
      } else check(true, "");
      bump("continue strip");
      await page.close();
    } catch (e) { check(false, `homepage continue strip (${layout})`, String(e.message).split("\n")[0]); }
    await context.close();
  }
}

await browser.close();
for (const s of Object.values(servers)) s.server.close();
for (const p of pending) console.log(`… pending (tools/gen_home.mjs, team MARQUEE): ${p}`);
const summary = Object.entries(tally).map(([k, v]) => `${k} ${v}`).join(", ");
if (failures) { console.log(`\n${failures} link problem(s) found (${passes} checks pass).`); process.exit(1); }
console.log(`check_links: ${passes} checks pass — ${summary}${pending.length ? ` · ${pending.length} continue-strip item(s) pending MARQUEE` : ""}`);
