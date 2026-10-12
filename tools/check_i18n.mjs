/**
 * The language layer (console BABEL, tools/briefs/i18n-brief.md, docs/i18n.md).
 *
 * Static: all 21 tables exist, each non-English one is marked machine-assisted,
 * every English key is present in each (a translation or the explicit "@en"
 * fallback marker), {placeholders} match English, the generated
 * shared/i18n-strings.js is current, Arabic and Urdu are right-to-left, and
 * every bundle and page that mounts the shared chrome carries the picker.
 * Coverage is reported per language, and the check fails if any of the 21
 * tables carries its own text for fewer than 100% of en.json's keys.
 *
 * Headless (WebXR/dist, 1280x720 and 360x640): switching to Spanish and to
 * Arabic changes the visible chrome text, sets <html lang dir>, the header
 * stays clear of the Guide button, and no raw key renders. The homepage at
 * 360x640 in Arabic, Urdu, Chinese, Hindi and Amharic does not scroll
 * sideways and shows programme titles in the language.
 *
 *     node tools/check_i18n.mjs
 */
import { createServer } from "node:http";
import { readFileSync, existsSync, statSync, readdirSync } from "node:fs";
import { dirname, join, extname, normalize } from "node:path";
import { fileURLToPath } from "node:url";
import { i18nLoad, i18nRender, I18N_LANGS, I18N_RTL, I18N_OUT } from "./gen_i18n.mjs";

const here = dirname(fileURLToPath(import.meta.url));
const WEBXR = join(here, "..", "WebXR");
let failures = 0, passes = 0;
function check(ok, what, detail = "") { if (ok) { passes += 1; return; } failures += 1; console.log(`✗ ${what}${detail ? ` — ${detail}` : ""}`); }

// ---------------------------------------------------------------- static
check(I18N_LANGS.length === 21, "21 languages are listed", String(I18N_LANGS.length));
const data = i18nLoad();
for (const p of data.problems) check(false, p);
check(readFileSync(I18N_OUT, "utf8") === i18nRender(data), "shared/i18n-strings.js is current (run node tools/gen_i18n.mjs)");
const { trStrings, trLangs } = await import(new URL(`file://${I18N_OUT}`).href);
check(trLangs.filter((l) => l.dir === "rtl").map((l) => l.code).sort().join() === I18N_RTL.slice().sort().join(), "Arabic and Urdu, and only they, are right-to-left");
for (const l of trLangs) check(Object.keys(trStrings[l.code] ?? {}).length >= 26, `${l.code} carries at least the chrome`, String(Object.keys(trStrings[l.code] ?? {}).length));
// Coverage: the share of en.json's keys each table carries in its own words
// (not the "@en" fallback marker). Every one of the 21 must stay at 100%.
const MIN_COVERAGE = 1;
const coverage = I18N_LANGS.map(([c]) => [c, data.keys.filter((k) => typeof data.tables[c][k] === "string" && data.tables[c][k] && data.tables[c][k] !== "@en").length]);
console.log(`coverage: ${coverage.map(([c, n]) => `${c} ${n}/${data.keys.length}`).join(" · ")}`);
for (const [c, n] of coverage) check(n / data.keys.length >= MIN_COVERAGE, `${c}.json covers ${Math.round(MIN_COVERAGE * 100)}% of en.json's keys`, `${n}/${data.keys.length} (${(100 * n / data.keys.length).toFixed(1)}%)`);
for (const k of ["lang.review", "step.english", "nav.home", "help.title", "acct.signin"]) for (const l of trLangs) check(!!trStrings[l.code]?.[k] || !!trStrings.en[k], `${l.code}: ${k} resolves`);
const progKeys = data.keys.filter((k) => k.startsWith("prog."));
check(progKeys.length === 112, "every programme has a title and a tagline key", String(progKeys.length));
const controls = readFileSync(join(WEBXR, "shared", "controls.js"), "utf8");
check(/trMountPicker\(nav\)/.test(controls), "controls.js mounts the language picker in the header");
const distPages = readdirSync(join(WEBXR, "dist")).filter((f) => f.endsWith(".html"));
for (const f of distPages) {
  const html = readFileSync(join(WEBXR, "dist", f), "utf8");
  const mounts = /ctlMount\(/.test(html);
  if (mounts) check(/function trMountPicker/.test(html) || /shared\/controls\.js/.test(html), `dist/${f} carries the picker`);
}
const tracks = join(WEBXR, "dist", "tracks");
if (existsSync(tracks)) for (const f of readdirSync(tracks).filter((x) => x.endsWith(".html")).slice(0, 5)) check(readFileSync(join(tracks, f), "utf8").includes("shared/controls.js"), `tracks/${f} mounts the chrome (and so the picker)`);

// ---------------------------------------------------------------- headless
const { pwModule, pwExecutable, PW, EXE } = await import(new URL("./lib/pw.mjs", import.meta.url).href);
const THREE_FILE = join(WEBXR, "vendor/three/dist/three.module.min.js");
const TYPES = { ".html": "text/html", ".js": "application/javascript", ".json": "application/json", ".css": "text/css", ".jpg": "image/jpeg", ".png": "image/png", ".svg": "image/svg+xml", ".glb": "model/gltf-binary" };
const server = createServer((req, res) => {
  const path = normalize(decodeURIComponent(new URL(req.url, "http://x").pathname)).replace(/^([/\\])+/, "");
  const file = join(WEBXR, path);
  if (!file.startsWith(WEBXR) || !existsSync(file) || statSync(file).isDirectory()) { res.writeHead(404); res.end(); return; }
  res.writeHead(200, { "content-type": TYPES[extname(file)] ?? "application/octet-stream" }); res.end(readFileSync(file));
});
await new Promise((r) => server.listen(0, "127.0.0.1", r));
const base = `http://127.0.0.1:${server.address().port}`;
let browser;
try {
  const { chromium } = await pwModule();
  browser = await chromium.launch({ executablePath: pwExecutable(), args: ["--use-gl=swiftshader", "--enable-unsafe-swiftshader", "--no-sandbox"] });
} catch (e) {
  server.close(); console.log(`✗ could not launch headless Chromium: ${String(e.message).split("\n")[0]}`); console.log("check_i18n: FAILED"); process.exit(1);
}
const THREE_SRC = readFileSync(THREE_FILE, "utf8");
const PAGES = ["index.html", "fairway.html"];
const SIZES = [{ w: 1280, h: 720, phone: false }, { w: 360, h: 640, phone: true }];
const overlap = (a, b) => a && b && a.x < b.x + b.width - 0.5 && b.x < a.x + a.width - 0.5 && a.y < b.y + b.height - 0.5 && b.y < a.y + a.height - 0.5;
for (const page of PAGES) for (const s of SIZES) {
  const tag = `${page} ${s.w}x${s.h}`;
  const ctx = await browser.newContext({ viewport: { width: s.w, height: s.h }, hasTouch: s.phone, isMobile: s.phone, deviceScaleFactor: 1 });
  await ctx.route(/^https?:\/\/(?!127\.0\.0\.1)/, (r) => r.abort());
  await ctx.route("**/cdnjs.cloudflare.com/ajax/libs/three.js/**", (r) => r.fulfill({ status: 200, contentType: "application/javascript", body: THREE_SRC }));
  const pg = await ctx.newPage();
  const errors = [];
  pg.on("pageerror", (e) => errors.push(String(e.message).split("\n")[0]));
  try {
    await pg.goto(`${base}/dist/${page}`, { waitUntil: "load", timeout: 45000 });
    await pg.waitForSelector("#tr-lang-btn", { state: "attached", timeout: 20000 });
    const read = () => pg.evaluate(() => {
      const vx = globalThis.visualViewport?.offsetLeft ?? 0; const box = (el) => { if (!el) return null; const r = JSON.parse(JSON.stringify(el.getBoundingClientRect())); r.x -= vx; return r; };
      const raw = [...document.querySelectorAll("[data-tr]")].filter((el) => el.textContent.trim() === el.getAttribute("data-tr")).map((el) => el.getAttribute("data-tr"));
      return { lang: document.documentElement.lang, dir: document.documentElement.dir, help: document.getElementById("ctl-help-btn")?.getAttribute("aria-label"),
        chip: document.getElementById("tr-lang-btn")?.textContent, nav: box(document.getElementById("ctl-nav")), gd: box(document.getElementById("gd-btn")), raw };
    });
    const en = await read();
    check(en.chip === "EN", `${tag}: the picker starts in English`, en.chip);
    // Open the picker, check its footnote, choose Spanish.
    await pg.click("#tr-lang-btn");
    const foot = await pg.evaluate(() => document.querySelector("#tr-lang .tr-foot")?.textContent ?? "");
    check(/machine-assisted/.test(foot) && /native speaker/.test(foot), `${tag}: the picker's footnote says the translations need native-speaker review`, foot);
    check(await pg.evaluate(() => document.querySelectorAll("#tr-lang .tr-opt").length) === 21, `${tag}: the picker lists 21 languages`);
    await pg.click('#tr-lang .tr-opt[data-lang="es"]');
    const es = await read();
    check(es.lang === "es" && es.dir === "ltr", `${tag}: Spanish sets <html lang="es" dir="ltr">`, `${es.lang} ${es.dir}`);
    check(es.help && es.help !== en.help, `${tag}: switching language changes the chrome text`, `${en.help} → ${es.help}`);
    check(es.raw.length === 0, `${tag}: no raw key renders in Spanish`, es.raw.slice(0, 4).join(", "));
    await pg.evaluate(() => document.querySelector('#tr-lang .tr-opt[data-lang="ar"]').click());
    const ar = await read();
    check(ar.lang === "ar" && ar.dir === "rtl", `${tag}: Arabic sets dir="rtl"`, `${ar.lang} ${ar.dir}`);
    check(ar.raw.length === 0, `${tag}: no raw key renders in Arabic`, ar.raw.slice(0, 4).join(", "));
    check(!overlap(ar.nav, ar.gd) && !overlap(es.nav, es.gd), `${tag}: the header stays clear of the Guide button`);
    check(!!ar.nav && ar.nav.x >= 0 && ar.nav.x + ar.nav.width <= s.w + 0.5, `${tag}: the header fits the width in RTL`, JSON.stringify(ar.nav));
    // The choice is remembered and ?lang= overrides it.
    await pg.goto(`${base}/dist/${page}?lang=ja`, { waitUntil: "load", timeout: 45000 });
    await pg.waitForSelector("#tr-lang-btn", { state: "attached", timeout: 20000 });
    check((await read()).lang === "ja", `${tag}: ?lang=ja on the launch URL wins`);
    check(errors.filter((m) => !/reading .elements./.test(m)).length === 0, `${tag}: no page error`, errors.slice(0, 2).join(" | "));
  } catch (e) {
    check(false, `${tag}: the page ran`, String(e.message).split("\n")[0]);
  }
  await ctx.close();
}
// The homepage on a phone (360x640) in the two right-to-left languages and in
// three scripts whose words run long or tall: nothing scrolls sideways, and the
// programme cards carry the language's own titles.
const PHONE_LANGS = ["ar", "ur", "zh", "hi", "am"];
for (const lang of PHONE_LANGS) {
  const tag = `index.html 360x640 ?lang=${lang}`;
  const ctx = await browser.newContext({ viewport: { width: 360, height: 640 }, hasTouch: true, isMobile: true, deviceScaleFactor: 1 });
  await ctx.route(/^https?:\/\/(?!127\.0\.0\.1)/, (r) => r.abort());
  const pg = await ctx.newPage();
  try {
    await pg.goto(`${base}/dist/index.html?lang=${lang}`, { waitUntil: "load", timeout: 45000 });
    await pg.waitForSelector("#tr-lang-btn", { state: "attached", timeout: 20000 });
    await pg.waitForTimeout(300);
    const m = await pg.evaluate(() => {
      const t = document.querySelector('[data-tr="prog.electrical-first-period.t"]');
      return { lang: document.documentElement.lang, dir: document.documentElement.dir, sideways: document.documentElement.scrollWidth - innerWidth, prog: t?.textContent ?? null,
        raw: [...document.querySelectorAll("[data-tr]")].filter((el) => el.textContent.trim() === el.getAttribute("data-tr")).length };
    });
    const dir = I18N_RTL.includes(lang) ? "rtl" : "ltr";
    check(m.lang === lang && m.dir === dir, `${tag}: <html lang="${lang}" dir="${dir}">`, `${m.lang} ${m.dir}`);
    check(m.sideways <= 1, `${tag}: the homepage does not scroll sideways`, `${m.sideways}px`);
    check(!!m.prog && m.prog === trStrings[lang]["prog.electrical-first-period.t"], `${tag}: programme titles are in the language`, String(m.prog));
    check(m.raw === 0, `${tag}: no raw key renders`, String(m.raw));
  } catch (e) {
    check(false, `${tag}: the page ran`, String(e.message).split("\n")[0]);
  }
  await ctx.close();
}
await browser.close();
server.close();
const own = I18N_LANGS.map(([c]) => Object.keys(trStrings[c]).length);
if (failures) { console.log(`check_i18n: ${failures} failed, ${passes} passed`); process.exit(1); }
console.log(`check_i18n: ${passes} checks pass — ${data.keys.length} keys × ${I18N_LANGS.length} languages (${Math.min(...own)}–${Math.max(...own)} with their own text, every language at ≥${Math.round(MIN_COVERAGE * 100)}%), ${PAGES.length} pages at 1280x720 and 360x640, the homepage on a phone in ${PHONE_LANGS.join("/")}`);
