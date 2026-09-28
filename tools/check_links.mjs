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
 *  5. ?site= deep links for the Deep and Bay World (three per world; every
 *     site with LINKS_FULL=1): the menu names the site, and the HUD does
 *     once the world is up.
 *  8. Descriptions link to what they describe: each job board's heading to
 *     its ?site=, every programme overview (docs/programmes/) to its
 *     stations, sites and worlds, every track page to its stations.
 * One browser, one page reused for every load in turn, each load capped.
 *  6. The round trip: a room opened from a board offers "Back to <world>",
 *     that link resolves, and with a passport record seeded Bay World comes
 *     home to that site's board.
 *  1b. Every page shows the Home chip and the Guide (console POLISH): every
 *     page in both layouts, three track pages (every one with LINKS_FULL=1);
 *     and every link target renders its environment — one link per distinct
 *     target page (every distinct link with LINKS_FULL=1) is loaded and must
 *     draw a frame on its canvas, or render its heading and content for a
 *     document page, with Home and the Guide and without a page error.
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
const { SM_SITES } = await imp("shared/summit-data.js");
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

const tally = {};
const bump = (world, n = 1) => { tally[world] = (tally[world] ?? 0) + n; };

/**
 * Descriptions link to what they describe (links-brief, round two): the
 * programme overviews under docs/programmes/ (tools/gen_investor.mjs) link
 * every station to its launch link, every site to its world's ?site= page and
 * each world to its page; the track pages link every station they name.
 * Static, from the generated files, resolved in the flat layout they point at.
 */
function lkDescriptionChecks() {
  const progDir = join(ROOT, "docs/programmes");
  const byId = new Map(catalog.curricula.map((c) => [c.id, c]));
  for (const f of readdirSync(progDir).filter((x) => x.endsWith(".md") && x !== "README.md")) {
    const c = byId.get(f.replace(/\.md$/, ""));
    if (!check(!!c, `docs/programmes/${f} names a catalog programme`)) continue;
    const md = readFileSync(join(progDir, f), "utf8");
    const links = [...md.matchAll(/\]\((\.\.\/\.\.\/WebXR\/dist\/[^)\s]+)\)/g)].map((m) => m[1]);
    const hrefs = links.map((l) => new URL(l.replace("../../WebXR/dist/", "./"), originOf("flat") + "/").href);
    for (const h of hrefs) {
      const why = lkWhyBroken("flat", h, originOf("flat"));
      check(!why, `docs/programmes/${f}: link ${short(h)}`, why ?? "");
      bump("programme overviews");
    }
    const launched = new Set(hrefs.map((h) => { const u = new URL(h); return u.searchParams.get("sim") ?? u.searchParams.get("room"); }).filter(Boolean));
    for (const s of c.stations) check(launched.has(s.id), `docs/programmes/${f}: station ${s.id} links to its launch link`);
    const sited = new Set(hrefs.map((h) => new URL(h).searchParams.get("site")).filter(Boolean));
    for (const s of [...BAY_SITES, ...DEEP_SITES].filter((x) => (x.programmes ?? []).includes(c.id))) check(sited.has(s.id), `docs/programmes/${f}: site ${s.id} links to ?site=`);
  }
  for (const rel of TRACK_PAGES) {
    const c = byId.get(rel.replace(/^tracks\/|\.html$/g, ""));
    if (!c) continue;
    const html = readFileSync(join(DIST, rel), "utf8");
    for (const s of c.stations) check(new RegExp(`[?&](sim|room)=${s.id.replace(/[-]/g, "\\-")}(&|")`).test(html.replace(/&amp;/g, "&")), `${rel}: station ${s.id} links to its launch link`);
    bump("track pages");
  }
}

// ------------------------------------------------------------ 2. station links

// [world, source page (repo, rel to WebXR/), flat page, source link builder(page) → [{ id, link }]]
const WORLDS = [
  ["Bay World", "bayworld/index.html", "bayworld.html", (page) => BAY_SITES.flatMap((s) => (s.stations ?? []).map((id) => ({ id, site: s.id, link: bwMissionLink(s, { station: id, page }) })))],
  ["the Deep", "underwater/underwater.html", "underwater.html", (page) => DEEP_SITES.flatMap((s) => (s.stations ?? []).map((id) => ({ id, site: s.id, link: dvMissionLink(s, { station: id, page }) })))],
  ["the Regatta", "regatta/regatta.html", "regatta.html", (page) => RG_EVENTS.flatMap((e) => e.stations.map((id) => ({ id, site: e.id, link: rgStationLink(id, { page, eventId: e.id }) })))],
  ["Sierra Summit", "summit/index.html", "summit.html", (page) => SM_SITES.flatMap((s) => s.stations.map((id) => ({ id, site: s.id, link: LK.lkStationLink(id, { runner: "../smartcity/index.html", from: "summit", page, siteId: s.id }) })))],
  ["Fairway", "fairway/index.html", "fairway.html", (page) => FW_STATIONS.map((id) => ({ id, site: "grounds", link: LK.lkStationLink(id, { runner: FW_RUNNER, from: "fairway", page, siteId: "grounds" }) }))],
  ["the Atlas", "bayworld/atlas.html", "atlas.html", () => atlasPlaces().flatMap((p) => {
    const l = atlasDeepLinks(p);
    return [...(l.station ? [{ id: p.stations[0], site: p.id, link: l.station, station: true }] : []), { id: null, site: p.id, link: l.bayworld }, ...l.programmes.map((x) => ({ id: null, site: p.id, link: x.href }))];
  })],
];
const SAMPLE = {}; // world → a flat SmartCiti.X link and every flat Trade Skills link
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
const short = (u) => String(u).replace(/^http:\/\/127\.0\.0\.1:\d+/, "");

// Station links: resolved against the catalog and the sim chunk table (above).
for (const [world, repoPage, flatPage, build] of WORLDS) {
  const repoLinks = build(`/WebXR/${repoPage}`);
  const flat = lkFlatten(build(`/${flatPage}`).map((x) => x.link));
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

// The Atlas's programme chips open the programme's own track page, never
// SmartCiti.X (console POLISH), in both layouts.
{
  const chips = atlasPlaces().flatMap((p) => atlasDeepLinks(p).programmes);
  const flatChips = lkFlatten(chips.map((c) => c.href));
  chips.forEach((c, i) => {
    for (const [layout, link, pg] of [["repo", c.href, "/WebXR/bayworld/atlas.html"], ["flat", flatChips[i], "/atlas.html"]]) {
      const u = new URL(link, originOf(layout) + pg);
      check(u.pathname.endsWith(`/tracks/${c.id}.html`) && !!lkFileFor(layout, u.pathname), `the Atlas ${layout}: the ${c.id} chip opens its track page`, link);
    }
  });
  bump("Atlas programme chips", chips.length * 2);
}

// One browser, one context, one page, reused for every load in turn.
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
const context = await browser.newContext({ viewport: { width: 1280, height: 720 } });
await context.route(/^https?:\/\/(?!127\.0\.0\.1)/, (r) => r.abort());
await context.route("**/cdnjs.cloudflare.com/ajax/libs/three.js/**", (r) => r.fulfill({ status: 200, contentType: "application/javascript", body: THREE_SRC }));
await context.route(/cdnjs\.cloudflare\.com\/ajax\/libs\/react(-dom)?\/18\.3\.1\/umd\//, (r) => {
  const file = r.request().url().split("/").pop();
  return REACT_SRC[file] ? r.fulfill({ status: 200, contentType: "application/javascript", body: REACT_SRC[file] }) : r.abort();
});
await context.route(/fonts\.(googleapis|gstatic)\.com/, (r) => r.fulfill({ status: 200, contentType: "text/css", body: "" }));
await context.addInitScript(() => { try { localStorage.setItem("holodeck-touch-hint-v1", "1"); } catch { /* private */ } });
const page = await context.newPage();
page.setDefaultTimeout(15000);
let visitErrors = [], visitOk = new Set();
page.on("pageerror", (e) => visitErrors.push(String(e.message).split("\n")[0]));
// A module the page imports that the layout cannot answer fails the whole
// module graph without a page error — count it as one.
page.on("response", (r) => {
  const type = r.request().resourceType();
  if (r.status() === 200) visitOk.add(new URL(r.url()).pathname);
  else if (r.status() === 404 && ["script", "document"].includes(type)) visitErrors.push(`404 ${new URL(r.url()).pathname}`);
});
/** Navigate the one page; `until` "load" waits for the load event (capped), otherwise DOM ready. */
async function lkVisit(url, { until = "domcontentloaded", timeout = 20000, settle = 400 } = {}) {
  visitErrors = []; visitOk = new Set();
  try { await page.goto("about:blank"); } catch { /* next goto reports */ }
  visitErrors = []; visitOk = new Set();
  try { await page.goto(url, { waitUntil: until, timeout }); }
  catch (e) { if (until !== "load") throw e; }
  if (settle) await page.waitForTimeout(settle);
}
async function lkSeed(layout, records) {
  await lkVisit(pageUrl(layout, "index.html"), { settle: 0 });
  await page.evaluate((recs) => { try { localStorage.setItem("vr-training-records-v1", JSON.stringify(recs)); } catch { /* private */ } }, records);
}

/**
 * Home and the Guide on every page, in the same places (console POLISH,
 * tools/briefs/polish-brief.md): the Home chip in the shared top-left bar
 * (#ctl-nav, shared/controls.js) and the Guide button (#gd-btn,
 * shared/guide.js), both visible. Waits briefly for the late mounts.
 */
async function lkAssertChrome(label) {
  const got = await page.waitForFunction(() => {
    const vis = (el) => { if (!el) return false; const cs = getComputedStyle(el); const r = el.getBoundingClientRect(); return cs.display !== "none" && cs.visibility !== "hidden" && r.width > 1 && r.height > 1; };
    const chip = document.querySelector("#ctl-nav .home-chip");
    return vis(chip) && vis(document.getElementById("gd-btn")) ? { chip: chip.getAttribute("href") } : null;
  }, null, { timeout: 20000 }).then((h) => h.jsonValue(), () => null);
  const what = got ? "" : await page.evaluate(() => `chip ${!!document.querySelector("#ctl-nav .home-chip")}, guide ${!!document.getElementById("gd-btn")}`).catch(() => "page gone");
  check(!!got, `${label}: shows the Home chip and the Guide`, what);
  bump("Home + Guide asserted");
  return !!got;
}

/**
 * The environment a link lands on actually renders (console POLISH): a world
 * or app page draws a frame on its canvas (the canvas's pixels are not one
 * flat fill — a PNG of a single colour compresses to a few kilobytes), a
 * document page (the homepage, a track page, the portal) shows its heading
 * and its content. No page error either way; Home and the Guide on both.
 */
const LK_DOC_PAGES = /(^|\/)(index\.html|404\.html|privacy\.html|tracks\/[^/]+\.html|portal\/index\.html|verify\/index\.html|instructor-console\.html|instructor\/index\.html|campus\/index\.html)$/;
const LK_WORLD_START = [[/bayworld(\/index)?\.html$/, ["#menu-start"]], [/underwater\.html$/, ["#menu-start"]], [/fairway(\/index)?\.html$/, ["#menu-play"]], [/regatta\.html$/, ["#menu-enter", "#menu-race"]], [/summit(\/index)?\.html$/, ["#menu-start"]], [/redwood(\/redwood)?\.html$/, ["#menu-start"]]];
async function lkRendersEnvironment(href) {
  const u = new URL(href);
  const label = short(href);
  try {
    await lkVisit(href, { until: "load", timeout: 30000, settle: 600 });
    const docPage = LK_DOC_PAGES.test(u.pathname) && !/\/(smartcity|trades|holodeck|bayworld|fairway|regatta|underwater|race|arcade|summit)\/index\.html$/.test(u.pathname);
    if (docPage) {
      const doc = await page.evaluate(() => ({ h: !!document.querySelector("h1, h2"), text: (document.body?.innerText ?? "").trim().length }));
      check(doc.h && doc.text > 200, `${label}: the page renders its heading and content`, JSON.stringify(doc));
    } else if (/atlas\.html$/.test(u.pathname)) {
      // The Atlas draws its map as SVG (Mapbox GL only with a token): every place a marker.
      const n = await page.waitForFunction(() => document.querySelectorAll("svg [data-place], svg circle, svg .atlas-marker").length || null, null, { timeout: 15000 }).then((h) => h.jsonValue(), () => 0);
      check(n > 5, `${label}: the Atlas draws its map with its places`, `${n} markers`);
    } else {
      // A world opens on its menu; press through it the way a player would.
      for (const sel of LK_WORLD_START.find(([re]) => re.test(u.pathname))?.[1] ?? []) {
        await page.waitForSelector(sel, { state: "visible", timeout: 20000 }).then(() => page.evaluate((x) => document.querySelector(x).click(), sel), () => {});
        await page.waitForTimeout(400);
      }
      const box = await page.waitForFunction(() => {
        const c = [...document.querySelectorAll("canvas")].map((el) => ({ el, r: el.getBoundingClientRect() })).filter((x) => x.r.width > 100 && x.r.height > 100).sort((a, b) => b.r.width * b.r.height - a.r.width * a.r.height)[0];
        return c ? { x: Math.max(0, c.r.x), y: Math.max(0, c.r.y), width: Math.min(innerWidth, c.r.width), height: Math.min(innerHeight, c.r.height) } : null;
      }, null, { timeout: 20000 }).then((h) => h.jsonValue(), () => null);
      if (check(!!box, `${label}: the page draws a canvas`)) {
        await page.waitForTimeout(1500);
        const png = await page.screenshot({ clip: box, timeout: 60000 });
        check(png.length > 8000, `${label}: the canvas shows a drawn frame, not a flat fill`, `${png.length} bytes`);
      }
    }
    await lkAssertChrome(label);
    check(!visitErrors.filter((m) => !/reading .elements./.test(m)).length, `${label}: renders without a page error`, visitErrors.join(" | "));
    bump("link targets rendered");
  } catch (e) { check(false, `${label}: the link target renders`, `${String(e.message).split("\n")[0]} ${visitErrors.join(" | ")}`); }
}

// ------------------------------------------------------------ 1. anchors

const REPO_PAGES = ["index.html", "smartcity/index.html", "trades/index.html", "holodeck/index.html", "instructor/index.html", "race/index.html",
  "arcade/index.html", "fairway/index.html", "bayworld/index.html", "bayworld/atlas.html", "regatta/regatta.html", "underwater/underwater.html", "summit/index.html",
  "portal/index.html", "verify/index.html", "campus/index.html"].filter((p) => existsSync(join(WEBXR, p)));
const FLAT_PAGES = readdirSync(DIST).filter((f) => f.endsWith(".html"));
const TRACK_PAGES = existsSync(join(DIST, "tracks")) ? readdirSync(join(DIST, "tracks")).filter((f) => f.endsWith(".html")).map((f) => `tracks/${f}`) : [];
const RENDERED = {}; // "layout rel" → the anchors the page rendered
for (const [layout, rel] of [...REPO_PAGES.map((p) => ["repo", p]), ...FLAT_PAGES.map((p) => ["flat", p])]) {
  let hrefs = [];
  try {
    await lkVisit(pageUrl(layout, rel), { timeout: 30000, settle: 900 });
    hrefs = await page.evaluate(() => [...document.querySelectorAll("a[href]")].map((a) => ({ href: a.href, text: a.textContent.trim(), cls: a.className })));
  } catch (e) { check(false, `${layout} ${rel} opens`, String(e.message).split("\n")[0]); continue; }
  check(!visitErrors.length, `${layout} ${rel} opens without a page error`, visitErrors.join(" | "));
  await lkAssertChrome(`${layout} ${rel}`);
  RENDERED[`${layout} ${rel}`] = hrefs;
  for (const h of new Set(hrefs.map((a) => a.href))) {
    if (!/^https?:/.test(h)) continue;
    const why = lkWhyBroken(layout, h, originOf(layout));
    check(!why, `${layout} ${rel}: anchor ${short(h)}`, why ?? "");
    bump(`anchors ${layout}`);
  }
}
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

// ------------------------------------------------------------ 1b. every page carries Home and the Guide; every link target renders (POLISH)

const FULL_SWEEP = !!process.env.LINKS_FULL;
{
  // The track pages: three sampled (first, middle, last), every one under LINKS_FULL=1.
  const tracks = FULL_SWEEP ? TRACK_PAGES : [TRACK_PAGES[0], TRACK_PAGES[Math.floor(TRACK_PAGES.length / 2)], TRACK_PAGES[TRACK_PAGES.length - 1]].filter(Boolean);
  for (const rel of tracks) {
    try {
      await lkVisit(pageUrl("flat", rel), { timeout: 30000, settle: 600 });
      check(!visitErrors.length, `flat ${rel} opens without a page error`, visitErrors.join(" | "));
      await lkAssertChrome(`flat ${rel}`);
    } catch (e) { check(false, `flat ${rel} opens`, String(e.message).split("\n")[0]); }
  }
  // Every distinct page a rendered anchor or a track page points at (station
  // launches are loaded in section 4): one link per target page, sampled; every
  // distinct link under LINKS_FULL=1.
  const targets = new Map();
  const add = (layout, href) => {
    let u; try { u = new URL(href); } catch { return; }
    if (u.origin !== originOf(layout) || u.searchParams.get("sim") !== null || u.searchParams.get("room") !== null) return;
    if (!/\.html$|\/$/.test(u.pathname)) return;
    u.hash = "";
    const key = FULL_SWEEP ? `${layout} ${u.pathname}${u.search}` : `${layout} ${u.pathname.replace(/\/tracks\/[^/]+\.html$/, "/tracks/*")}`;
    if (!targets.has(key)) targets.set(key, u.href);
  };
  for (const [k, list] of Object.entries(RENDERED)) for (const a of list) add(k.split(" ")[0], a.href);
  for (const rel of TRACK_PAGES) {
    const html = readFileSync(join(DIST, rel), "utf8");
    for (const m of html.matchAll(/<a\b[^>]*\shref="([^"]+)"/g)) add("flat", new URL(m[1].replace(/&amp;/g, "&"), pageUrl("flat", rel)).href);
  }
  for (const href of targets.values()) await lkRendersEnvironment(href);
}

// ------------------------------------------------------------ 3. job boards, as rendered

for (const [world, hook, repoPage, flatPage, sites] of [
  ["Bay World", "__bayworldTest", "bayworld/index.html", "bayworld.html", BAY_SITES],
  ["the Deep", "__underwaterTest", "underwater/underwater.html", "underwater.html", DEEP_SITES],
]) {
  for (const layout of ["repo", "flat"]) {
    try {
      await lkVisit(pageUrl(layout, layout === "repo" ? repoPage : flatPage));
      await page.waitForFunction((h) => !!window[h]?.jobBoard, hook, { timeout: 20000 });
      const boards = await page.evaluate(({ h, sites }) => sites.map((s) => {
        window[h].jobBoard(s);
        const ul = document.getElementById("jb-stations");
        return { id: s.id, n: s.stations.length, listed: ul.hidden ? [] : [...ul.querySelectorAll("a")].map((a) => ({ id: a.dataset.station, href: a.href })),
          launch: !document.getElementById("jb-launch").hidden, siteLink: document.getElementById("jb-site-link")?.href ?? null,
          stationLinks: [...document.querySelectorAll("#jb-stations a.lk-name")].map((a) => a.href) };
      }), { h: hook, sites: sites.map((s) => ({ id: s.id, name: s.name, zone: s.zone, stations: s.stations ?? [], programmes: s.programmes ?? [] })) });
      for (const b of boards) {
        if (b.n > 1) {
          check(b.listed.length === b.n && !b.launch, `${world} ${layout}: ${b.id}'s board lists all ${b.n} stations with their own Start`, `${b.listed.length} listed`);
          for (const a of b.listed) {
            const why = lkWhyBroken(layout, a.href, originOf(layout), { station: true });
            check(!why, `${world} ${layout}: ${b.id}'s board Start ${a.id}`, why ?? "");
            check(new URL(a.href).searchParams.get(LK.lkIsTradesRoom(a.id) ? "room" : "sim") === a.id, `${world} ${layout}: ${b.id}'s Start ${a.id} opens that station`, a.href);
            bump(world);
          }
        } else check(b.launch === (b.n === 1), `${world} ${layout}: ${b.id}'s single-station board keeps its Start button`);
        // The board's own title links to the site (?site=) — a description that links to what it names.
        if (check(!!b.siteLink, `${world} ${layout}: ${b.id}'s board title links to its site`)) {
          const u = new URL(b.siteLink);
          check(!lkWhyBroken(layout, b.siteLink, originOf(layout)) && u.searchParams.get("site") === b.id, `${world} ${layout}: ${b.id}'s site link resolves`, short(b.siteLink));
        }
      }
      check(!visitErrors.length, `${world} ${layout} board page opens without a page error`, visitErrors.join(" | "));
    } catch (e) { check(false, `${world} ${layout}: the job boards render`, String(e.message).split("\n")[0]); }
  }
}

// ------------------------------------------------------------ 4. sample loads

/** Load a station link and confirm the named station or room is what opened. */
async function lkLoadsStation(href, kind, id) {
  try {
    await lkVisit(href, { settle: 200 });
    await page.waitForSelector("#enter-flat", { state: "visible", timeout: 40000 });
    await page.evaluate(() => document.getElementById("enter-flat").click());
    if (kind === "room") {
      // A room opens on its pre-brief; reading it through starts the named room.
      await page.waitForFunction((id) => window.__tradesTest?.room?.()?.id === id || (() => { const b = document.getElementById("prebrief-start"); return !!b && b.offsetParent !== null; })(), id, { timeout: 30000 });
      await page.evaluate(() => { const b = document.getElementById("prebrief-start"); if (b && b.offsetParent !== null) b.click(); });
      await page.waitForFunction((id) => window.__tradesTest?.room?.()?.id === id, id, { timeout: 20000 });
    } else {
      // The station's own module (the published sim chunk) arrives and its pre-brief or run opens.
      await page.waitForFunction((id) => window.__smartcityTest?.session?.()?.room?.id === id || !!document.getElementById("prebrief-start"), id, { timeout: 20000 });
      check([...visitOk].some((p) => p.endsWith(`/sims/${id}.js`)), `${short(href)}: the station's sim chunk loaded`);
    }
    await page.waitForTimeout(300);
    check(!visitErrors.length, `${short(href)} loads ${id} without a page error`, visitErrors.join(" | "));
    return { ok: true, back: kind === "room" ? await page.evaluate(() => window.__tradesTest.returnTarget?.() ?? null) : null };
  } catch (e) {
    check(false, `${short(href)} loads ${kind} ${id}`, `${String(e.message).split("\n")[0]} ${visitErrors.join(" | ")}`);
    return { ok: false };
  }
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
// And one of each in the repo layout.
{
  const bw = BAY_SITES.find((s) => s.stations?.some((id) => !LK.lkIsTradesRoom(id)));
  const sim = bw.stations.find((id) => !LK.lkIsTradesRoom(id));
  await lkLoadsStation(new URL(bwMissionLink(bw, { station: sim, page: "/WebXR/bayworld/index.html" }), pageUrl("repo", "bayworld/index.html")).href, "sim", sim);
  const room = BAY_SITES.find((s) => s.stations?.some(LK.lkIsTradesRoom));
  const rid = room.stations.find(LK.lkIsTradesRoom);
  await lkLoadsStation(new URL(bwMissionLink(room, { station: rid, page: "/WebXR/bayworld/index.html" }), pageUrl("repo", "bayworld/index.html")).href, "room", rid);
  bump("repo layout loaded", 2);
}

// ------------------------------------------------------------ 5. ?site= deep links

const FULL = !!process.env.LINKS_FULL;
for (const [world, repoPage, flatPage, sites, startText] of [
  ["Bay World", "bayworld/index.html", "bayworld.html", BAY_SITES, (s) => `Start the shift at ${s.name}`],
  ["the Deep", "underwater/underwater.html", "underwater.html", DEEP_SITES, (s) => `Splash in at ${s.name}`],
]) {
  // Three per world (first, middle, last) unless LINKS_FULL=1; the first also in the repo layout.
  const pick = FULL ? sites : [sites[0], sites[Math.floor(sites.length / 2)], sites[sites.length - 1]];
  const jobs = [...pick.map((s, i) => ["flat", s, i === 0]), ["repo", sites[0], false]];
  for (const [layout, s, intoWorld] of jobs) {
    const url = `${pageUrl(layout, layout === "repo" ? repoPage : flatPage)}?site=${encodeURIComponent(s.id)}`;
    try {
      await lkVisit(url, { settle: 200 });
      await page.waitForFunction((t) => (document.getElementById("menu-start")?.textContent ?? "").includes(t), startText(s), { timeout: 15000 })
        .then(() => check(true, ""), () => check(false, `${world} ${layout} ?site=${s.id}: the menu names the site`));
      if (intoWorld) {
        await page.evaluate(() => document.getElementById("menu-start").click());
        await page.waitForFunction((name) => (document.getElementById("hud-prompt")?.textContent ?? "").includes(name), s.name, { timeout: 25000 })
          .then(() => check(true, ""), (e) => check(false, `${world} ${layout} ?site=${s.id}: the HUD names the site`, String(e.message).split("\n")[0]));
      }
      check(!visitErrors.length, `${world} ${layout} ?site=${s.id} opens without a page error`, visitErrors.join(" | "));
      bump(`${world} ?site=`);
    } catch (e) { check(false, `${world} ${layout} ?site=${s.id}`, String(e.message).split("\n")[0]); }
  }
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
    try {
      // Seed the passport with the finished run, then come home.
      await lkSeed("flat", [{ id: `lk-${Date.now()}`, at: new Date().toISOString(), app: "trades", source: "bayworld", simId: roundTrip.id, simName: roundTrip.id, passed: true, stars: 3, score: 900, errors: 0 }]);
      await lkVisit(back.url, { settle: 200 });
      await page.waitForSelector("#menu-start", { state: "visible", timeout: 20000 });
      await page.evaluate(() => document.getElementById("menu-start").click());
      await page.waitForFunction((name) => !document.getElementById("scr-jobboard")?.hidden && document.getElementById("jb-title")?.textContent === name, site?.name, { timeout: 45000 });
      check(await page.evaluate(() => !document.getElementById("jb-done")?.hidden), "home in Bay World, the seeded pass marks that site's board done");
      check(!visitErrors.length, "the round trip home opens without a page error", visitErrors.join(" | "));
      bump("round trip");
    } catch (e) { check(false, "the round trip lands on the site's board", `${String(e.message).split("\n")[0]} ${visitErrors.join(" | ")} ${await page.evaluate(() => [document.getElementById("jb-title")?.textContent, document.getElementById("scr-jobboard")?.hidden, document.getElementById("menu-start")?.textContent].join(" / ")).catch(() => "")}`); }
  }
}

// ------------------------------------------------------------ 7. the continue strip (MARQUEE)

for (const rec of [{ app: "trades", simId: "kitchen" }, { app: "smartcity", simId: [...CHUNKS][0] }]) {
  for (const layout of ["repo", "flat"]) {
    try {
      await lkSeed(layout, [{ id: `lk-c-${rec.simId}`, at: new Date().toISOString(), simName: rec.simId, passed: true, stars: 2, ...rec }]);
      await lkVisit(pageUrl(layout, "index.html"), { settle: 300 });
      const href = await page.evaluate(() => { const a = document.getElementById("continue-link"); return a && !document.getElementById("continue")?.hidden ? a.href : null; });
      const why = href ? lkWhyBroken(layout, href, originOf(layout)) : "the strip did not show";
      if (why) {
        const msg = `homepage continue strip (${layout}, ${rec.app}): ${why}`;
        if (process.env.LK_STRICT_CONTINUE) check(false, msg); else pending.push(msg);
      } else check(true, "");
      bump("continue strip");
    } catch (e) { check(false, `homepage continue strip (${layout})`, String(e.message).split("\n")[0]); }
  }
}

// ------------------------------------------------------------ 8. descriptions link to what they describe

lkDescriptionChecks();

await browser.close();
for (const s of Object.values(servers)) s.server.close();
for (const p of pending) console.log(`… pending (tools/gen_home.mjs, team MARQUEE): ${p}`);
const summary = Object.entries(tally).map(([k, v]) => `${k} ${v}`).join(", ");
if (failures) { console.log(`\n${failures} link problem(s) found (${passes} checks pass).`); process.exit(1); }
console.log(`check_links: ${passes} checks pass — ${summary}${pending.length ? ` · ${pending.length} continue-strip item(s) pending MARQUEE` : ""}`);
