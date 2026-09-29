/**
 * The design system holds (console ATELIER, docs/design-system/README.md).
 *
 *     node tools/check_design.mjs
 *
 *   1. design.css and the gallery are current with their sources
 *      (tools/gen_design.mjs regenerated in memory and compared), and the
 *      gallery shows every component the library names.
 *   2. Every app page links the shared design stylesheet, and the link
 *      resolves to a file — in the repo layout, every per-app dist and the
 *      flat WebXR/dist/ folder (where the fonts and icons it names must sit
 *      beside it too).
 *   3. No page and no page generator loads Google Fonts: the UI fonts are
 *      self-hosted from WebXR/vendor/fonts/.
 *   4. Every vendored asset is listed in docs/credits.md with its source,
 *      version and licence, and each vendored pack carries its licence file.
 *   5. No emoji is used as a UI icon in the shared chrome: the Home chip,
 *      buttons, the runner's HUD buttons and results, the Easter-egg buttons
 *      (emoji stay only where they are content, like the Guide's chat).
 *   6. Every token contrast pair meets WCAG AA in dark and light.
 */
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const WEBXR = join(ROOT, "WebXR");
const { AT_ROLES, AT_CONTRAST_PAIRS, thContrast } = await import(pathToFileURL(join(WEBXR, "shared/theme.js")).href);
const { AT_ILLO_KINDS, atIllustration } = await import(pathToFileURL(join(WEBXR, "shared/illustrations.js")).href);
const { atDesignCss, atGalleryHtml } = await import(pathToFileURL(join(ROOT, "tools/gen_design.mjs")).href);

let failures = 0, passes = 0;
function check(name, fn) {
  try { fn(); passes += 1; console.log(`  ✓ ${name}`); }
  catch (e) { failures += 1; console.log(`  ✗ ${name}\n      ${e.message}`); }
}
function assert(ok, message) { if (!ok) throw new Error(message); }
const read = (p) => readFileSync(p, "utf8");
const rel = (p) => relative(ROOT, p);

/** The component templates the library documents; each must be in the gallery. */
export const AT_COMPONENTS = ["Hero", "Section header", "World card", "Programme card", "Stat tile", "Badge and chip", "Buttons",
  "Lock state", "Toast", "Dialog", "Tabs", "Breadcrumb", "Footer", "Empty state"];

// Every app page: the source pages, the generated homepage and track pages,
// the gallery, every per-app dist and the flat folder.
const SOURCE_PAGES = [
  "home.html", "index.html", "design/index.html",
  "trades/index.html", "race/index.html", "regatta/regatta.html", "bayworld/index.html", "bayworld/atlas.html",
  "fairway/index.html", "instructor/index.html", "campus/index.html", "holodeck/index.html", "underwater/underwater.html",
  "verify/index.html", "arcade/index.html", "smartcity/index.html", "portal/index.html",
  // ATELIER-2: the frontier worlds, the Treasure Map and the privacy page.
  "summit/index.html", "redwood/redwood.html", "treasures.html", "privacy.html",
  // PACKS: the Holodeck Packs page (tools/gen_packs.mjs).
  "packs/index.html",
].map((p) => join(WEBXR, p));
const htmlIn = (dir) => existsSync(dir) ? readdirSync(dir).filter((f) => f.endsWith(".html")).map((f) => join(dir, f)) : [];
const APP_DIST = readdirSync(WEBXR).filter((d) => d !== "dist" && statSync(join(WEBXR, d)).isDirectory()).flatMap((d) => htmlIn(join(WEBXR, d, "dist")));
const TRACKS = htmlIn(join(WEBXR, "home/tracks"));
const FLAT = [...htmlIn(join(WEBXR, "dist")), ...htmlIn(join(WEBXR, "dist/tracks")), ...htmlIn(join(WEBXR, "dist/packs")), join(WEBXR, "dist/design/index.html")];
const PAGES = [...SOURCE_PAGES, ...TRACKS, ...APP_DIST, ...FLAT];

console.log("Design system\n");

check("design.css and the gallery are current, and the gallery shows every component, illustration and icon", () => {
  assert(read(join(WEBXR, "shared/design.css")) === atDesignCss(), "WebXR/shared/design.css is stale — run node tools/gen_design.mjs");
  const gallery = read(join(WEBXR, "design/index.html"));
  assert(gallery === atGalleryHtml(), "WebXR/design/index.html is stale — run node tools/gen_design.mjs");
  for (const c of AT_COMPONENTS) assert(gallery.includes(`aria-label="${c}"`), `the gallery has no "${c}" specimen`);
  for (const k of Object.keys(AT_ILLO_KINDS)) assert(gallery.includes(`at-illo--${k}`), `the gallery has no ${k} illustration`);
  assert(/at-scheme--light/.test(gallery) && /at-scheme--dark/.test(gallery), "the gallery does not preview both schemes");
  for (const f of readdirSync(join(WEBXR, "vendor/icons")).filter((n) => n.endsWith(".svg"))) {
    assert(gallery.includes(`at-i--${f.replace(/\.svg$/, "")}`), `the gallery does not show the ${f} icon`);
  }
  const svg = atIllustration("robotics", { title: "x" });
  assert(/^<svg[^>]*role="img"/.test(svg) && !/<(image|text|script)/.test(svg), "an illustration is not a pure-shape SVG");
});

check(`every app page links the shared design stylesheet, and the link resolves (${PAGES.length} pages)`, () => {
  const bad = [];
  for (const page of PAGES) {
    if (!existsSync(page)) { bad.push(`${rel(page)} is missing`); continue; }
    const m = /<link rel="stylesheet" href="([^"]*shared\/design\.css)">/.exec(read(page));
    if (!m) { bad.push(`${rel(page)} does not link shared/design.css`); continue; }
    // The track pages are written for the flat folder's tracks/ (their shared/ is dist/shared/).
    const base = page.startsWith(join(WEBXR, "home/tracks")) ? join(WEBXR, "dist/tracks") : dirname(page);
    if (!existsSync(resolve(base, m[1]))) bad.push(`${rel(page)} → ${m[1]} (no file)`);
  }
  assert(!bad.length, `${bad.length} page(s): ${bad.slice(0, 4).join("; ")}`);
  const css = read(join(WEBXR, "shared/design.css"));
  const urls = [...css.matchAll(/url\((\.\.\/vendor\/[^)]+)\)/g)].map((m) => m[1]);
  assert(urls.length >= 8, "design.css names no self-hosted fonts");
  for (const u of urls) {
    assert(existsSync(resolve(WEBXR, "shared", u)), `design.css → ${u} is missing from WebXR/vendor/`);
    assert(existsSync(resolve(WEBXR, "dist/shared", u)), `design.css → ${u} is missing from WebXR/dist/vendor/ — run python3 tools/bundle_webxr.py`);
  }
  assert(read(join(WEBXR, "dist/shared/design.css")) === css, "WebXR/dist/shared/design.css is stale — run python3 tools/bundle_webxr.py");
});

check("no page and no page generator loads Google Fonts", () => {
  const files = [...PAGES, join(ROOT, "tools/gen_home.mjs"), join(ROOT, "tools/gen_tracks.mjs"), join(ROOT, "tools/gen_design.mjs")];
  const bad = files.filter((f) => existsSync(f) && /fonts\.(googleapis|gstatic)\.com/.test(read(f))).map(rel);
  assert(!bad.length, `${bad.length} file(s) still load Google Fonts: ${bad.slice(0, 5).join(", ")}`);
});

check("every vendored asset is in docs/credits.md with source, version and licence; each pack carries its licence", () => {
  const credits = existsSync(join(ROOT, "docs/credits.md")) ? read(join(ROOT, "docs/credits.md")) : "";
  assert(credits, "docs/credits.md is missing");
  const missing = [];
  for (const sub of ["fonts", "icons"]) {
    for (const f of readdirSync(join(WEBXR, "vendor", sub))) {
      if (/^LICEN[SC]E/i.test(f)) continue;
      if (!credits.includes(`\`${f}\``)) missing.push(`vendor/${sub}/${f}`);
    }
  }
  assert(!missing.length, `${missing.length} vendored file(s) not listed in docs/credits.md: ${missing.slice(0, 5).join(", ")}`);
  for (const [pack, version, licence, dir] of [
    ["lucide-static", "1.48.0", "ISC", "icons"], ["@fontsource/barlow", "5.3.0", "OFL-1.1", "fonts"],
    ["@fontsource/barlow-condensed", "5.3.0", "OFL-1.1", "fonts"], ["@fontsource/press-start-2p", "5.3.0", "OFL-1.1", "fonts"],
    ["three", "r160", "MIT", "three"], ["react", "18.3.1", "MIT", "react"],
  ]) {
    const row = credits.split("\n").find((l) => l.includes(`\`${pack}\``));
    assert(row && row.includes(version) && row.includes(licence), `docs/credits.md has no row for ${pack} ${version} (${licence})`);
    assert(readdirSync(join(WEBXR, "vendor", dir)).some((f) => /^LICEN[SC]E/i.test(f)), `WebXR/vendor/${dir}/ carries no licence file`);
  }
});

// The chrome every page shares, where an emoji would be an icon rather than content.
export const AT_CHROME = [
  "shared/controls.js", "shared/account.js", "shared/theme.js", "shared/eggs-app.js", "shared/i18n-strings.js",
  "smartcity/js/react-ui.js", "holodeck/js/react-ui.js", "race/js/app.js", "smartcity/js/app.js", "trades/js/app.js", "instructor/js/app.js", "bayworld/js/atlas.js",
];
const PICTO = /\p{Extended_Pictographic}|\\u\{1F[0-9A-Fa-f]{3}\}/u;
check("no emoji is used as a UI icon in the chrome (the Home chip, buttons, HUD, results, egg buttons)", () => {
  const bad = [];
  for (const f of AT_CHROME) {
    read(join(WEBXR, f)).split("\n").forEach((line, i) => {
      // Canvas text in the arcade mini-games (lives as hearts) is content, not chrome.
      if (PICTO.test(line) && !/fillText\(/.test(line)) bad.push(`${f}:${i + 1}`);
    });
  }
  // The chrome in every page's markup: the Home chip, buttons and the station runner's controls.
  for (const page of [...SOURCE_PAGES, ...TRACKS]) {
    const html = read(page).replace(/<script[\s\S]*?<\/script>/g, "");
    for (const m of html.matchAll(/<(button|a class="home-chip)[^>]*>([\s\S]*?)<\/(button|a)>/g)) {
      if (PICTO.test(m[2]) || /[⌂⛳]|&#(8962|9971);/.test(m[2])) bad.push(`${rel(page)}: ${m[2].trim().slice(0, 40)}`);
    }
  }
  assert(!bad.length, `${bad.length} emoji icon(s) in the chrome: ${bad.slice(0, 5).join("; ")}`);
});

check("every token contrast pair meets WCAG AA in dark and light", () => {
  const bad = [];
  for (const scheme of ["dark", "light"]) {
    for (const [fg, bg, min] of AT_CONTRAST_PAIRS) {
      const r = thContrast(AT_ROLES[scheme][fg], AT_ROLES[scheme][bg]);
      if (!(r >= min)) bad.push(`${scheme} ${fg} on ${bg} ${r.toFixed(2)}:1 < ${min}`);
    }
  }
  assert(!bad.length, bad.join("; "));
});

console.log(failures ? `\n${failures} design check(s) failed.` : `\nAll design checks pass: ${passes} checks, ${PAGES.length} pages, ${AT_CONTRAST_PAIRS.length * 2} contrast pairs.`);
process.exit(failures ? 1 : 0);
