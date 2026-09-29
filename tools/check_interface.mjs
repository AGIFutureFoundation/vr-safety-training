/**
 * The parishes app's in-world menu (console INTERFACE, docs/consoles/INTERFACE.md).
 *
 *     node tools/check_interface.mjs            (UX_PORT=8961 by default)
 *
 *   1. Every mount id the menu had at 793d16d still exists (moved, never deleted), plus the reserved
 *      mounts for incoming consoles, and each sits inside a tab panel whose tab shows it.
 *   2. Tabs: Learn, Play, Map, Me in that order; ←/→/Home/End move the selection and the focus
 *      (roving tabindex), and Tab from "Start walking" lands on the selected tab.
 *   3. In-world: the HUD's state is one line; Esc opens the menu ("Resume") and Esc resumes.
 *   4. At 390x844 with touch: every visible control in every tab is at least 44 px, and nothing
 *      scrolls sideways.
 *   5. The first-visit onboarding: three cards, skippable, and a skip is remembered across a reload.
 *
 * WebXR/ is served in-process; the cdnjs three.js URL is answered from WebXR/vendor/three/dist/, every
 * other external request is aborted. Fails loudly if no browser launches.
 */
import { createServer } from "node:http";
import { readFileSync, existsSync, statSync } from "node:fs";
import { dirname, join, extname, normalize } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const WEBXR = join(ROOT, "WebXR");
const THREE_FILE = join(WEBXR, "vendor/three/dist/three.module.min.js");
const PW = process.env.PLAYWRIGHT_MODULE || "/opt/node22/lib/node_modules/playwright/index.mjs";
const EXE = process.env.CHROMIUM_PATH || "/opt/pw-browsers/chromium";
const PORT = Number(process.env.UX_PORT || 8961);
const t0 = Date.now();

let failures = 0, passes = 0;
function check(ok, what, detail = "") {
  if (ok) { passes += 1; console.log(`  ✓ ${what}`); return; }
  failures += 1; console.log(`  ✗ ${what}${detail ? ` — ${detail}` : ""}`);
}

// The menu's mounts at 793d16d (other consoles write into these) and the reserved ones INTERFACE adds.
export const UX_HEADER = ["menu", "menu-eyebrow", "menu-parish", "menu-blurb", "menu-count", "menu-start"];
export const UX_TAB_MOUNTS = {
  learn: ["menu-storyline", "menu-dean", "menu-paths", "menu-cognition", "menu-drills", "menu-sims", "menu-ps", "menu-packs"],
  play: ["menu-ledger", "menu-motorpool", "menu-krewe", "menu-bayquest", "bq-board"],
  map: ["menu-parishes"],
  me: ["menu-passport", "menu-dataworks", "menu-sound"],
};
const UX_TABS = ["learn", "play", "map", "me"];

// 1 (static): the html keeps every id.
const html = readFileSync(join(WEBXR, "parishes/parishes.html"), "utf8");
const app = readFileSync(join(WEBXR, "parishes/js/app.js"), "utf8");
const allIds = [...UX_HEADER, ...Object.values(UX_TAB_MOUNTS).flat(), "hud-stats", "hud-credits", "hud-visited", "hud-lessons", "hud-alt", "hud-clock", "hud-weather", "hud-prompt", "board", "lesson", "map", "parishes", "motorpool", "tycoon", "ty-ledger", "dv-board", "board-ty"];
const missing = allIds.filter((id) => !html.includes(`id="${id}"`));
check(!missing.length, `mounts: ${allIds.length - missing.length}/${allIds.length} ids present in parishes.html`, missing.join(", "));
check(app.includes('from "../../shared/ux-menu.js"') && /uxMountTabs\(\$\("menu"\)/.test(app), "the parishes app mounts the tabs (ux-menu.js)");

if (!existsSync(THREE_FILE)) { console.log(`✗ the vendored three.js is missing at ${THREE_FILE}`); process.exit(1); }
const TYPES = { ".html": "text/html", ".js": "application/javascript", ".mjs": "application/javascript", ".json": "application/json", ".css": "text/css",
  ".png": "image/png", ".jpg": "image/jpeg", ".svg": "image/svg+xml", ".woff2": "font/woff2", ".webmanifest": "application/manifest+json" };
const server = createServer((req, res) => {
  const path = normalize(decodeURIComponent(new URL(req.url, "http://x").pathname)).replace(/^([/\\])+/, "");
  const file = join(WEBXR, path);
  if (!file.startsWith(WEBXR) || !existsSync(file) || statSync(file).isDirectory()) { res.writeHead(404); res.end(); return; }
  res.writeHead(200, { "content-type": TYPES[extname(file)] ?? "application/octet-stream" });
  res.end(readFileSync(file));
});
await new Promise((r) => { server.once("error", () => server.listen(0, "127.0.0.1", r)); server.listen(PORT, "127.0.0.1", r); });
const base = `http://127.0.0.1:${server.address().port}`;
const THREE_SRC = readFileSync(THREE_FILE, "utf8");

let browser;
try {
  const { chromium } = await import(PW);
  browser = await chromium.launch({ executablePath: EXE, args: ["--use-gl=swiftshader", "--enable-unsafe-swiftshader", "--no-sandbox"] });
} catch (e) {
  server.close();
  console.log(`✗ could not launch headless Chromium: ${String(e.message).split("\n")[0]}`);
  console.log("check_interface: FAILED (no browser run)"); process.exit(1);
}

async function open(ctxOpts, query = "", init = null) {
  const ctx = await browser.newContext(ctxOpts);
  if (init) await ctx.addInitScript(init);
  await ctx.route("**/*", (route) => {
    const u = route.request().url();
    if (u.startsWith(base)) return route.continue();
    if (/three(\.module)?(\.min)?\.js$/.test(u)) return route.fulfill({ status: 200, contentType: "application/javascript", body: THREE_SRC });
    return route.abort();
  });
  const page = await ctx.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(String(e.message).split("\n")[0]));
  await page.goto(`${base}/parishes/parishes.html?parish=orleans${query}`, { waitUntil: "load" });
  await page.waitForFunction(() => !!window.__parishTest?.ux, null, { timeout: 60000 });
  return { ctx, page, errors };
}

try {
  // 1–3: desktop.
  {
    const { ctx, page, errors } = await open({ viewport: { width: 1280, height: 800 } });
    const order = await page.evaluate(() => [...document.querySelectorAll('#ux-tabs [role="tab"]')].map((t) => t.dataset.uxTab));
    check(JSON.stringify(order) === JSON.stringify(UX_TABS), `tab order: ${order.join(" → ")}`);
    let reach = 0; const unreached = [];
    for (const [tab, ids] of Object.entries(UX_TAB_MOUNTS)) {
      await page.evaluate((t) => window.__parishTest.ux.select(t), tab);
      for (const id of ids) {
        const ok = await page.evaluate(({ id, tab }) => {
          const el = document.getElementById(id); if (!el) return false;
          const panel = el.closest('[role="tabpanel"]'); if (!panel || panel.hidden) return false;
          const tabEl = document.querySelector(`[aria-controls="${panel.id}"]`);
          return tabEl?.dataset.uxTab === tab && tabEl.getAttribute("aria-selected") === "true";
        }, { id, tab });
        if (ok) reach += 1; else unreached.push(`${id}@${tab}`);
      }
    }
    const total = Object.values(UX_TAB_MOUNTS).flat().length;
    check(reach === total, `every mount id reachable from its tab: ${reach}/${total}`, unreached.join(", "));
    // Keyboard: Tab from Start lands on the selected tab; arrows move the selection and the focus.
    await page.evaluate(() => window.__parishTest.ux.select("learn"));
    await page.focus("#menu-start"); await page.keyboard.press("Tab");
    const afterTab = await page.evaluate(() => document.activeElement?.id);
    check(afterTab === "ux-tab-learn", `Tab from "Start walking" lands on the selected tab (${afterTab})`);
    const seq = [];
    for (const k of ["ArrowRight", "ArrowRight", "End", "Home", "ArrowLeft"]) { await page.keyboard.press(k); seq.push(await page.evaluate(() => `${window.__parishTest.ux.current()}:${document.activeElement?.dataset?.uxTab}`)); }
    check(seq.join(" ") === "play:play map:map me:me learn:learn me:me", `arrow keys: ${seq.join(" ")}`);
    const roving = await page.evaluate(() => [...document.querySelectorAll('#ux-tabs [role="tab"]')].filter((t) => t.tabIndex === 0).length);
    check(roving === 1, `roving tabindex: ${roving} tab in the Tab order`);
    // In-world: one line of state; Esc opens the menu and resumes.
    await page.click("#menu-start");
    await page.waitForTimeout(400);
    const hud = await page.evaluate(() => { const el = document.querySelector("#hud-stats .ux-state"); const lh = parseFloat(getComputedStyle(el).lineHeight) || parseFloat(getComputedStyle(el).fontSize) * 1.3; return { h: el.getBoundingClientRect().height, lh, menu: document.getElementById("menu").hidden }; });
    check(hud.menu && hud.h <= hud.lh * 1.5, `the HUD's state is one line (${Math.round(hud.h)} px, line ${Math.round(hud.lh)} px)`);
    await page.keyboard.press("Escape"); await page.waitForTimeout(150);
    const reopened = await page.evaluate(() => ({ menu: !document.getElementById("menu").hidden, label: document.getElementById("menu-start").textContent, playing: window.__parishTest.np.playing }));
    check(reopened.menu && reopened.label === "Resume" && !reopened.playing, `Esc opens the in-world menu ("${reopened.label}")`);
    await page.keyboard.press("Escape"); await page.waitForTimeout(150);
    const resumed = await page.evaluate(() => document.getElementById("menu").hidden && window.__parishTest.np.playing);
    check(resumed, "Esc resumes the walk");
    // The contextual prompt sits over the board it names (walk 6 m south of the first board, face it).
    await page.evaluate(() => { const t = window.__parishTest, b = t.world.siteBoards[0]; t.teleport(b.x, b.z + 6, 0, 0.05); });
    // dt is clamped per frame, so a slow software-GL frame needs several frames before the near test runs.
    await page.waitForFunction(() => !!document.getElementById("hud-prompt").dataset.uxAnchor, null, { timeout: 20000 }).catch(() => {});
    const pr = await page.evaluate(() => { const p = document.getElementById("hud-prompt"); const r = p.getBoundingClientRect(); const t = window.__parishTest, b = t.world.siteBoards[0]; return { anchor: p.dataset.uxAnchor ?? "", hidden: p.hidden, top: Math.round(r.top), h: innerHeight, text: p.textContent, dbg: `np ${t.np.x.toFixed(1)},${t.np.z.toFixed(1)} board ${b.x.toFixed(1)},${b.z.toFixed(1)} near ${t.np.near?.kind} playing ${t.np.playing} modal ${t.np.modal}` }; });
    check(!pr.hidden && pr.anchor === "board" && pr.top < pr.h - 160, `the prompt sits over what it names (${pr.anchor || "unanchored"} at y ${pr.top}/${pr.h}: "${pr.text}")`, pr.dbg);
    check(!errors.length, `desktop: no page errors`, errors.slice(0, 3).join(" | "));
    await ctx.close();
  }
  // 4: phone 390x844 with touch.
  {
    const { ctx, page, errors } = await open({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true, deviceScaleFactor: 2 });
    const small = [], scroll = [];
    let counted = 0;
    for (const tab of UX_TABS) {
      await page.evaluate((t) => window.__parishTest.ux.select(t), tab);
      const r = await page.evaluate(() => {
        const vis = (el) => { const cs = getComputedStyle(el); const b = el.getBoundingClientRect(); return cs.display !== "none" && cs.visibility !== "hidden" && b.width > 0 && b.height > 0 && !el.closest("[hidden]"); };
        const inline = (el) => el.tagName === "A" && getComputedStyle(el).display === "inline" && el.parentElement?.closest("p,li,small,span");
        const out = { small: [], n: 0 };
        for (const el of document.querySelectorAll('#menu button, #menu a, #menu [role="tab"], #menu input, #menu select, .home-chip')) {
          if (!vis(el) || inline(el)) continue;
          out.n += 1;
          const b = el.getBoundingClientRect();
          if (b.height < 43.5 || b.width < 43.5) out.small.push(`${el.id || el.textContent.trim().slice(0, 24)}:${Math.round(b.width)}x${Math.round(b.height)}`);
        }
        const card = document.querySelector("#menu .card");
        out.hscroll = document.documentElement.scrollWidth > innerWidth + 1 || card.scrollWidth > card.clientWidth + 1;
        out.widths = `${document.documentElement.scrollWidth}/${innerWidth} card ${card.scrollWidth}/${card.clientWidth}`;
        return out;
      });
      counted += r.n;
      small.push(...r.small.map((s) => `${tab}:${s}`));
      if (r.hscroll) scroll.push(`${tab} ${r.widths}`);
    }
    check(!small.length, `touch targets at 390x844: ${counted - small.length}/${counted} controls >= 44 px`, small.slice(0, 8).join(", "));
    check(!scroll.length, "no horizontal scroll at 390x844 in any tab", scroll.join("; "));
    await page.click("#menu-start"); await page.waitForTimeout(400);
    const touch = await page.evaluate(() => [...document.querySelectorAll("#tc-layer .tc-btn")].map((b) => { const r = b.getBoundingClientRect(); return `${b.id}:${Math.round(Math.min(r.width, r.height))}`; }));
    const menuBtn = touch.find((s) => s.startsWith("np-menu"));
    check(!!menuBtn && Number(menuBtn.split(":")[1]) >= 44, `the touch layer has a Menu button >= 44 px (${touch.join(" ")})`);
    const hscroll = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1);
    check(!hscroll, "no horizontal scroll at 390x844 in the world");
    check(!errors.length, "phone: no page errors", errors.slice(0, 3).join(" | "));
    await ctx.close();
  }
  // 5: onboarding — a learner's first visit (not an automated run), skip, reload.
  {
    const init = () => { Object.defineProperty(Navigator.prototype, "webdriver", { get: () => false }); };
    const { ctx, page, errors } = await open({ viewport: { width: 390, height: 844 }, hasTouch: true }, "", init);
    const first = await page.evaluate(() => ({ shown: !document.getElementById("ux-onboard").hidden, count: document.querySelector("[data-ux-ob-count]").textContent }));
    check(first.shown && first.count === "1 of 3", `onboarding on a first visit (${first.count})`);
    await page.click("[data-ux-ob-next]"); await page.click("[data-ux-ob-next]");
    const third = await page.evaluate(() => document.querySelector("[data-ux-ob-count]").textContent);
    await page.click("[data-ux-ob-skip]");
    const gone = await page.evaluate(() => document.getElementById("ux-onboard").hidden);
    check(third === "3 of 3" && gone, `three cards, then skipped (${third})`);
    await page.reload({ waitUntil: "load" });
    await page.waitForFunction(() => !!window.__parishTest?.ux, null, { timeout: 60000 });
    const again = await page.evaluate(() => !document.getElementById("ux-onboard").hidden);
    check(!again, "the skip is remembered across a reload");
    check(!errors.length, "onboarding: no page errors", errors.slice(0, 3).join(" | "));
    await ctx.close();
  }
} finally {
  await browser.close();
  server.close();
}
console.log(`check_interface: ${failures ? "FAILED" : "OK"} — ${passes} passed, ${failures} failed (${Date.now() - t0} ms)`);
process.exit(failures ? 1 : 0);
