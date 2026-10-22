/**
 * The Guide (console COMPASS, tools/briefs/homepage-guide-brief.md).
 *
 * Without a browser: WebXR/shared/guide-kb.js is fresh (tools/gen_guide_kb.mjs
 * is re-run in memory and diffed) and under the cap in gen_guide_kb.mjs (640 KB); every link in it resolves
 * to a real page in WebXR/dist/, a real station, a real world site or a real
 * doc; the only text about wojrc.org is the sourced quotation from
 * tools/briefs/wojrc-brief.md; twenty scripted questions each get an answer
 * whose links resolve, and questions the platform cannot answer get the
 * "nothing in my notes" reply; guideConfig.endpoint in auth-config.json is
 * null; no key-like string sits in the Guide's files; every page (the
 * homepage, every bundle, every track page) mounts the Guide.
 *
 * In headless Chromium (WebXR/ served in-process, cdnjs three.js and React
 * answered from WebXR/vendor/ as tools/check_ui.mjs does), on the homepage, a
 * world and a track page at a phone and a desktop size: the button is
 * visible and named, drags to the other edge and snaps to it, keeps that
 * position after a reload, opens with the keyboard and focuses the question
 * box, answers a question from the lazily loaded knowledge base with links,
 * Esc closes it and returns focus, and the mic button hides where the
 * browser has no speech recognition. If no browser can be launched this
 * checker FAILS.
 *
 *     node tools/check_guide.mjs
 */
import { createServer } from "node:http";
import { readFileSync, existsSync, statSync, readdirSync } from "node:fs";
import { dirname, join, extname, normalize } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const ROOT = join(here, "..");
const WEBXR = join(ROOT, "WebXR");
const DIST = join(WEBXR, "dist");
const { pwModule, pwExecutable, PW, EXE } = await import(new URL("./lib/pw.mjs", import.meta.url).href);

let failures = 0, passes = 0;
function check(ok, what, detail = "") {
  if (ok) { passes += 1; return; }
  failures += 1; console.log(`✗ ${what}${detail ? ` — ${detail}` : ""}`);
}
const imp = (rel) => import(pathToFileURL(join(ROOT, rel)).href);

// ------------------------------------------------------------ the knowledge base
const { gdBuildKb, GD_KB_OUT, GD_KB_CAP } = await imp("tools/gen_guide_kb.mjs");
const fresh = await gdBuildKb();
const onDisk = readFileSync(GD_KB_OUT, "utf8");
check(fresh === onDisk, "WebXR/shared/guide-kb.js is fresh", "run node tools/gen_guide_kb.mjs");
check(onDisk.length <= GD_KB_CAP, `guide-kb.js is at most ${GD_KB_CAP / 1024} KB`, `${(onDisk.length / 1024).toFixed(0)} KB`);

const { GD_KB } = await imp("WebXR/shared/guide-kb.js");
const guide = await imp("WebXR/shared/guide.js");
const chunks = guide.gdDecodeKb(GD_KB);
const index = guide.gdIndex(chunks);
check(chunks.length >= 1000, "the knowledge base covers the platform (at least 1000 chunks)", String(chunks.length));
const kinds = new Set(chunks.map((c) => c.kind));
for (const k of ["programme", "station", "world", "site", "control", "union", "doc", "faq", "sourced"]) check(kinds.has(k), `the knowledge base has ${k} chunks`);

const catalog = JSON.parse(readFileSync(join(WEBXR, "smartcity", "catalog.json"), "utf8"));
const stationIds = new Map(catalog.stations.map((s) => [s.id, s.app]));
for (const c of catalog.curricula) check(chunks.some((k) => k.id === `programme:${c.id}`), `programme ${c.id} is in the knowledge base`);
check(catalog.stations.every((s) => chunks.some((k) => k.id === `station:${s.id}`)), "every station is in the knowledge base");
const bw = await imp("WebXR/shared/bayworld-data.js");
const dw = await imp("WebXR/shared/underwater-data.js");
const sw = await imp("WebXR/shared/summit-data.js");
const rw = await imp("WebXR/redwood/js/rw-data.js");
const sites = { "bayworld.html": new Set(bw.BAY_SITES.map((s) => s.id)), "underwater.html": new Set(dw.DEEP_SITES.map((s) => s.id)), "summit.html": new Set(sw.SM_SITES.map((s) => s.id)), "redwood.html": new Set(rw.RW_SITES.map((s) => s.id)) };
for (const s of rw.RW_SITES) check(chunks.some((k) => k.id === `site:redwood:${s.id}`), `Redwood Reach site ${s.id} is in the knowledge base`);
const REPO = GD_KB.repo;

/** Does a knowledge-base link resolve to something real? Returns null when it does, else why not. */
function unresolved(href) {
  if (href.startsWith(`${REPO}/blob/main/`)) return existsSync(join(ROOT, href.slice(`${REPO}/blob/main/`.length))) ? null : "no such doc";
  if (/^https?:/.test(href)) return "an external link outside the repository";
  const u = new URL(href, "http://x/dist/");
  const file = decodeURIComponent(u.pathname.replace(/^\/dist\//, ""));
  if (!existsSync(join(DIST, file))) return `WebXR/dist/${file} does not exist`;
  const sim = u.searchParams.get("sim"), room = u.searchParams.get("room");
  if (sim && stationIds.get(sim) !== "smartcity") return `no SmartCiti.X station ${sim}`;
  if (room && stationIds.get(room) !== "trades") return `no Trade Skills room ${room}`;
  const site = new URLSearchParams(u.hash.replace(/^#/, "")).get("site");
  if (site && !sites[file]?.has(site)) return `no site ${site} in ${file}`;
  return null;
}
const bad = [];
for (const c of chunks) for (const l of c.links) { const why = unresolved(l.href); if (why) bad.push(`${c.id}: ${l.href} (${why})`); }
check(bad.length === 0, "every link in the knowledge base resolves to a real page, station, site or doc", bad.slice(0, 5).join("; "));

// The wojrc.org rule: only the sourced text speaks about the organisation.
const brief = readFileSync(join(ROOT, "tools/briefs/wojrc-brief.md"), "utf8");
const quote = brief.split("\n").filter((l) => l.startsWith("> ")).map((l) => l.slice(2).trim());
const sourced = chunks.find((c) => c.kind === "sourced");
check(!!sourced && quote.every((q) => sourced.text.includes(q)), "the wojrc.org chunk carries the sourced quotation verbatim");
const org = /wojrc|joyce/i;
const loose = chunks.filter((c) => c.kind !== "sourced" && org.test(c.text.split(c.title).join("")));
check(loose.length === 0, "no other chunk says anything about wojrc.org beyond naming a programme", loose.slice(0, 5).map((c) => c.id).join(", "));

// Twenty scripted questions.
const QUESTIONS = [
  ["How do I start?", /homepage|world|programme/i],
  ["How is my progress saved?", /browser|record/i],
  ["How do I find my union?", /union/i],
  ["What works on a phone?", /touch|stick/i],
  ["What does a star mean?", /stars?/i],
  ["Where are the controls?", /H|\?/],
  ["How do I move?", /W, A, S, D|stick/],
  ["Open the Pathway Edition", /Pathway/],
  ["Take me to the pier pilings", /Pier/],
  ["Tell me about the Regatta", /Regatta/],
  ["Where is Bay World?", /Bay World/],
  ["What is the Bay Atlas?", /Atlas/],
  ["forklift training", /forklift/i],
  ["welding stations", /weld/i],
  ["IBEW electricians", /IBEW|Electric/i],
  ["confined space entry and rescue", /confined/i],
  ["What is Fairway Park?", /Fairway/],
  ["What is wojrc.org?", /quoted as given/],
  ["Who is Joyce Guy?", /named by the sponsor/],
  ["How does the passport work?", /passport|record/i],
];
for (const [q, want] of QUESTIONS) {
  const a = guide.gdAnswer(index, q);
  check(a.matched, `"${q}" gets an answer from the knowledge base`, a.text.slice(0, 80));
  check(want.test(a.text) || a.links.some((l) => want.test(l.label)), `"${q}" is answered on topic`, a.text.slice(0, 120));
  const broken = a.links.map((l) => [l.href, unresolved(l.href)]).filter(([, w]) => w);
  check(broken.length === 0, `"${q}": every link resolves`, broken.map(([h, w]) => `${h} (${w})`).join("; "));
}
check(guide.gdAnswer(index, "How do I start?").links.length > 0 && guide.gdAnswer(index, "Take me to the pier pilings").links.some((l) => /#site=/.test(l.href)), "answers carry links that navigate, down to a world site");
for (const q of ["What is the capital of France?", "quantum blockchain recipe", "Who won the 1998 World Cup final?"]) {
  const a = guide.gdAnswer(index, q);
  check(!a.matched && a.text === guide.gdNoMatch && a.links.some((l) => l.href.startsWith("index.html")), `"${q}" gets the honest "nothing in my notes" reply and the finder`, a.text.slice(0, 80));
}

// ------------------------------------------------------------ config and keys
const auth = JSON.parse(readFileSync(join(WEBXR, "auth-config.json"), "utf8"));
check(auth.guideConfig && Object.hasOwn(auth.guideConfig, "endpoint") && auth.guideConfig.endpoint === null, "auth-config.json carries guideConfig.endpoint, null by default");
const KEYISH = /\bsk-[A-Za-z0-9_-]{16,}|\bAIza[0-9A-Za-z_-]{20,}|\bBearer\s+[A-Za-z0-9._-]{16,}|["']?api[_-]?key["']?\s*[:=]\s*["'][^"']+["']|\bxox[bp]-[A-Za-z0-9-]{10,}/;
for (const f of ["WebXR/shared/guide.js", "WebXR/shared/guide-kb.js", "WebXR/auth-config.json", "tools/gen_guide_kb.mjs"]) {
  check(!KEYISH.test(readFileSync(join(ROOT, f), "utf8")), `${f} holds no key-like string`);
}

// ------------------------------------------------------------ on every page
const bundler = readFileSync(join(here, "bundle_webxr.py"), "utf8");
check(/"guide\.js", "voice-assist\.js", "guide-kb\.js"/.test(bundler), "the bundler copies guide.js, voice-assist.js and guide-kb.js into WebXR/dist/shared/");
const distPages = readdirSync(DIST).filter((f) => f.endsWith(".html"));
for (const f of distPages) check(/gdMount\(/.test(readFileSync(join(DIST, f), "utf8")), `WebXR/dist/${f} mounts the Guide`);
const tracks = readdirSync(join(DIST, "tracks")).filter((f) => f.endsWith(".html"));
check(tracks.length >= catalog.curricula.length && tracks.every((f) => /gdMount\(/.test(readFileSync(join(DIST, "tracks", f), "utf8"))), `every track page mounts the Guide (${tracks.length})`);
for (const f of ["index.html", "home.html"]) check(/import \{ gdMount \} from "\.\/shared\/guide\.js"/.test(readFileSync(join(WEBXR, f), "utf8")), `WebXR/${f} mounts the Guide`);
for (const f of ["guide.js", "voice-assist.js", "guide-kb.js"]) check(existsSync(join(DIST, "shared", f)) && readFileSync(join(DIST, "shared", f), "utf8") === readFileSync(join(WEBXR, "shared", f), "utf8"), `WebXR/dist/shared/${f} matches the source`);
check(guide.gdAutoRoot("/WebXR/dist/tracks/x.html") === "../" && guide.gdAutoRoot("/WebXR/dist/bayworld.html") === "./" && guide.gdAutoRoot("/WebXR/bayworld/index.html") === "../dist/" && guide.gdAutoRoot("/WebXR/trades/dist/t.html") === "../../dist/", "the Guide finds the published folder from each kind of page");

// ------------------------------------------------------------ in the browser
const THREE_FILE = join(WEBXR, "vendor/three/dist/three.module.min.js");
const REACT_DIR = join(WEBXR, "vendor/react/dist");
const TYPES = { ".html": "text/html", ".js": "application/javascript", ".mjs": "application/javascript", ".json": "application/json", ".css": "text/css",
  ".png": "image/png", ".jpg": "image/jpeg", ".svg": "image/svg+xml", ".glb": "model/gltf-binary", ".wasm": "application/wasm" };
const server = createServer((req, res) => {
  const path = normalize(decodeURIComponent(new URL(req.url, "http://x").pathname)).replace(/^([/\\])+/, "");
  const file = join(WEBXR, path);
  if (!file.startsWith(WEBXR) || !existsSync(file) || statSync(file).isDirectory()) { res.writeHead(404); res.end(); return; }
  res.writeHead(200, { "content-type": TYPES[extname(file)] ?? "application/octet-stream" });
  res.end(readFileSync(file));
});
await new Promise((r) => server.listen(0, "127.0.0.1", r));
const base = `http://127.0.0.1:${server.address().port}`;
let browser;
try {
  const { chromium } = await pwModule();
  browser = await chromium.launch({ executablePath: pwExecutable(), args: ["--use-gl=swiftshader", "--enable-unsafe-swiftshader", "--no-sandbox"] });
} catch (e) {
  server.close();
  console.log(`✗ could not launch headless Chromium (${PW}, ${EXE}): ${String(e.message).split("\n")[0]}`);
  console.log("check_guide: FAILED (no browser run)");
  process.exit(1);
}
const THREE_SRC = readFileSync(THREE_FILE, "utf8");
const REACT_SRC = { "react.production.min.js": readFileSync(join(REACT_DIR, "react.production.min.js"), "utf8"),
  "react-dom.production.min.js": readFileSync(join(REACT_DIR, "react-dom.production.min.js"), "utf8") };
const PAGES = [
  { name: "Home", page: "index.html" },
  { name: "Bay World", page: "bayworld.html", start: ["#menu-start"] },
  { name: "Track", page: "tracks/job-readiness-edition.html" },
];
const SIZES = [{ label: "1280x720", width: 1280, height: 720, phone: false }, { label: "360x640", width: 360, height: 640, phone: true }];
const box = () => { const b = document.getElementById("gd-btn"); if (!b) return null; const r = b.getBoundingClientRect(); const cs = getComputedStyle(b);
  return { x: r.x, y: r.y, w: r.width, h: r.height, vw: innerWidth, vh: innerHeight, shown: cs.display !== "none" && cs.visibility !== "hidden" && r.width > 0, name: b.getAttribute("aria-label") || b.textContent }; };
let pageRuns = 0;
for (const pg of PAGES) for (const size of SIZES) {
  const tag = `${pg.name} ${size.label}`;
  const context = await browser.newContext({ viewport: { width: size.width, height: size.height }, hasTouch: size.phone, isMobile: size.phone, deviceScaleFactor: 1 });
  await context.route(/^https?:\/\/(?!127\.0\.0\.1)/, (r) => r.abort());
  await context.route("**/cdnjs.cloudflare.com/ajax/libs/three.js/**", (r) => r.fulfill({ status: 200, contentType: "application/javascript", body: THREE_SRC }));
  await context.route(/cdnjs\.cloudflare\.com\/ajax\/libs\/react(-dom)?\/18\.3\.1\/umd\//, (r) => {
    const file = r.request().url().split("/").pop();
    return REACT_SRC[file] ? r.fulfill({ status: 200, contentType: "application/javascript", body: REACT_SRC[file] }) : r.abort();
  });
  await context.route(/fonts\.(googleapis|gstatic)\.com/, (r) => r.fulfill({ status: 200, contentType: "text/css", body: "" }));
  // The desktop run has no speech recognition (the mic must hide); the phone run has a stub (the mic must show).
  await context.addInitScript((has) => {
    try { localStorage.setItem("holodeck-touch-hint-v1", "1"); } catch { /* private */ }
    if (has) { window.SpeechRecognition = function () { this.start = () => {}; }; } else { try { delete window.SpeechRecognition; delete window.webkitSpeechRecognition; } catch { /* */ } window.SpeechRecognition = undefined; window.webkitSpeechRecognition = undefined; }
  }, size.phone);
  const page = await context.newPage();
  try {
    await page.goto(`${base}/dist/${pg.page}`, { waitUntil: "load", timeout: 45000 });
    await page.waitForSelector("#gd-btn[data-gd-ready]", { state: "attached", timeout: 30000 });
    for (const sel of pg.start ?? []) {
      await page.waitForSelector(sel, { state: "visible", timeout: 20000 });
      await page.evaluate((s) => document.querySelector(s).click(), sel);
      await page.waitForTimeout(400);
    }
    await page.waitForTimeout(700);
    const b0 = await page.evaluate(box);
    check(b0?.shown, `${tag}: the Guide button is visible`);
    check(/guide/i.test(b0?.name ?? ""), `${tag}: the Guide button has an accessible name`);
    check(b0 && b0.x + b0.w <= b0.vw && b0.y + b0.h <= b0.vh && b0.x >= 0 && b0.y >= 0, `${tag}: the Guide button sits inside the window`, JSON.stringify(b0));
    check(b0 && b0.h >= 44, `${tag}: the Guide button is a full-size target`, String(b0?.h));
    // Drag it across to the left half: it snaps to the left edge.
    const sx = b0.x + b0.w / 2, sy = b0.y + b0.h / 2, tx = b0.vw * 0.3, ty = b0.vh * 0.45;
    if (size.phone) {
      // A phone drags with a finger: an emulated mouse on a long, scrollable page is taken as a
      // pan and cancelled by the browser, which no learner's finger (touch-action: none) is.
      const cdp = await context.newCDPSession(page);
      const at = (x, y) => [{ x, y, id: 1 }];
      await cdp.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: at(sx, sy) });
      for (let i = 1; i <= 10; i++) await cdp.send("Input.dispatchTouchEvent", { type: "touchMove", touchPoints: at(sx + (tx - sx) * i / 10, sy + (ty - sy) * i / 10) });
      await cdp.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
      await cdp.detach().catch(() => {});
    } else {
      await page.mouse.move(sx, sy); await page.mouse.down();
      for (let i = 1; i <= 8; i++) await page.mouse.move(sx + (tx - sx) * i / 8, sy + (ty - sy) * i / 8);
      await page.mouse.up();
    }
    // under load the snap can land late: wait for the button to settle at an edge before measuring
    await page.waitForFunction(() => { const b = document.getElementById("gd-btn"); const r = b && b.getBoundingClientRect(); return r && r.x < 40; }, null, { timeout: 8000 }).catch(() => {});
    await page.waitForTimeout(300);
    const b1 = await page.evaluate(box);
    check(b1.x <= 14, `${tag}: dragged left, the button snaps to the left edge`, JSON.stringify(b1));
    const stored = await page.evaluate(() => { try { return JSON.parse(localStorage.getItem("holodeck-guide-pos-v1")); } catch { return null; } });
    check(stored?.side === "left", `${tag}: the position is remembered`, JSON.stringify(stored));
    const panelAfterDrag = await page.evaluate(() => document.getElementById("gd-panel").hidden);
    check(panelAfterDrag, `${tag}: a drag does not open the panel`);
    await page.reload({ waitUntil: "load" });
    await page.waitForSelector("#gd-btn[data-gd-ready]", { state: "attached", timeout: 30000 });
    await page.waitForTimeout(700);
    const b2 = await page.evaluate(box);
    check(b2.x <= 14, `${tag}: after a reload the button is still on the left`, JSON.stringify(b2));
    // Keyboard: focus it, Enter opens the panel with the question box focused.
    await page.evaluate(() => document.getElementById("gd-btn").focus());
    await page.keyboard.press("Enter");
    await page.waitForTimeout(150);
    const opened = await page.evaluate(() => ({ open: !document.getElementById("gd-panel").hidden, focus: document.activeElement?.id,
      mic: document.getElementById("gd-mic").hidden, expanded: document.getElementById("gd-btn").getAttribute("aria-expanded") }));
    check(opened.open && opened.expanded === "true", `${tag}: Enter on the button opens the panel`);
    check(opened.focus === "gd-q", `${tag}: the question box has focus`, opened.focus);
    check(opened.mic === !size.phone, `${tag}: the mic button ${size.phone ? "shows with" : "hides without"} speech recognition`);
    await page.keyboard.type("What does a star mean?");
    await page.keyboard.press("Enter");
    await page.waitForFunction(() => document.querySelectorAll("#gd-panel .gd-guide").length >= 2, null, { timeout: 15000 });
    const reply = await page.evaluate(() => { const m = [...document.querySelectorAll("#gd-panel .gd-guide")].pop(); return m.textContent; });
    check(/two or more stars/.test(reply), `${tag}: the Guide answers from its lazily loaded knowledge base`, reply.slice(0, 100));
    await page.keyboard.type("Take me to the pier pilings");
    await page.keyboard.press("Enter");
    await page.waitForFunction(() => document.querySelectorAll("#gd-panel .gd-guide").length >= 3, null, { timeout: 15000 });
    const hrefs = await page.evaluate(() => [...[...document.querySelectorAll("#gd-panel .gd-guide")].pop().querySelectorAll("a")].map((a) => a.href));
    const okLinks = hrefs.length > 0 && hrefs.every((h) => { const u = new URL(h); return u.origin === new URL(page.url()).origin && existsSync(join(WEBXR, decodeURIComponent(u.pathname).replace(/^\//, ""))); });
    check(okLinks, `${tag}: the answer's links point at real pages from here`, hrefs.join(" "));
    await page.keyboard.press("Escape");
    await page.waitForTimeout(100);
    const closed = await page.evaluate(() => ({ hidden: document.getElementById("gd-panel").hidden, focus: document.activeElement?.id }));
    check(closed.hidden && closed.focus === "gd-btn", `${tag}: Esc closes the panel and focus returns to the button`, JSON.stringify(closed));
    pageRuns += 1;
  } catch (e) {
    check(false, `${tag}: the page ran`, String(e.message).split("\n")[0]);
  }
  await context.close();
}
await browser.close();
server.close();
if (failures) { console.log(`check_guide: ${failures} failed, ${passes} passed`); process.exit(1); }
console.log(`check_guide: ${passes} checks pass — ${chunks.length} chunks (${(onDisk.length / 1024).toFixed(0)} KB), ${QUESTIONS.length} questions, ${distPages.length + tracks.length} pages mount the Guide, ${pageRuns} browser runs`);
