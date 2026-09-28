/**
 * Search metadata and page usability (console WAYFINDER).
 *
 *     node tools/check_seo.mjs
 *
 * Static, on every page tools/gen_seo.mjs stamps: the block is current; one
 * title (<= 60) and description (<= 155), unique across the published pages;
 * canonical, og:title/description/url/image and a Twitter card; each og:image,
 * icon and manifest resolves to a file; JSON-LD parses, the homepage carries
 * Organization, WebSite (with its SearchAction) and an ItemList of every
 * programme, and the track pages carry exactly one Course per programme; the
 * sitemap lists every public page of the published folder and nothing else
 * (no 404, no repo-only page); robots.txt allows them; no public page says
 * noindex; the manifest parses.
 *
 * In the browser at phone size (390 x 844): the homepage, a track page, the
 * 404 page and every app bundle have one <h1>, alt text on every
 * image and no page-level horizontal scroll (the Atlas and the instructor
 * console, as documents, also a <main>); the homepage, the track page and
 * the 404 page have header/nav/main/footer landmarks, a skip link, body text
 * of at least 16 px, primary controls at least 44 px tall, labelled form
 * fields, and a layout shift on load under 0.1; the homepage search tolerates
 * a typo and a union↔trade synonym and fills from ?q=.
 */
import { createServer } from "node:http";
import { existsSync, readFileSync, statSync } from "node:fs";
import { dirname, extname, join, normalize, posix } from "node:path";
import { fileURLToPath } from "node:url";
import { wfPages, wfBlock, WF_BEGIN, WF_END, WF_TITLE_MAX, WF_DESC_MAX, WF_PROGRAMMES, WF_CONFIG } from "./gen_seo.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const WEBXR = join(ROOT, "WebXR");
const DIST = join(WEBXR, "dist");
const PW = process.env.PLAYWRIGHT_MODULE || "/opt/node22/lib/node_modules/playwright/index.mjs";
const EXE = process.env.CHROMIUM_PATH || "/opt/pw-browsers/chromium";

let failures = 0, passes = 0;
function check(ok, what, detail = "") { if (ok) { passes += 1; return; } failures += 1; console.log(`✗ ${what}${detail ? ` — ${detail}` : ""}`); }
const unesc = (s) => s.replace(/&quot;/g, '"').replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&");
const meta = (html, attr, name) => { const m = html.match(new RegExp(`<meta ${attr}="${name}" content="([^"]*)">`)); return m ? unesc(m[1]) : null; };
const link = (html, rel) => { const m = html.match(new RegExp(`<link rel="${rel}" href="([^"]*)"`)); return m ? unesc(m[1]) : null; };

// ------------------------------------------------------------ static
const pages = wfPages();
const titles = new Map(), descs = new Map();
let courses = 0, stamped = 0;
for (const page of pages) {
  for (const [file, at] of page.mirrors) {
    const path = join(WEBXR, file);
    if (!existsSync(path)) { check(!file.startsWith("dist/"), `${file} exists`); continue; }
    const html = readFileSync(path, "utf8");
    const s = html.indexOf(WF_BEGIN), e = html.indexOf(WF_END);
    if (!check(s >= 0 && e > s, `${file} carries the SEO block`) && s < 0) continue;
    stamped += 1;
    const block = html.slice(s, e + WF_END.length);
    check(block === wfBlock(page, at), `${file}'s SEO block is current (run python3 tools/bundle_webxr.py)`);
    const head = html.slice(0, html.indexOf("</head>"));
    check((head.match(/<title>/g) ?? []).length === 1, `${file} has one <title>`);
    check((head.match(/<meta name="description"/g) ?? []).length === 1, `${file} has one meta description`);
    check(/<html[^>]*\blang="[a-z-]+"/.test(html), `${file} names its language`);
    const title = unesc(block.match(/<title>([^<]*)<\/title>/)?.[1] ?? "");
    const desc = meta(block, "name", "description") ?? "";
    check(title.length > 10 && title.length <= WF_TITLE_MAX, `${file}: title within ${WF_TITLE_MAX}`, `${title.length}: ${title}`);
    check(desc.length > 50 && desc.length <= WF_DESC_MAX, `${file}: description within ${WF_DESC_MAX}`, `${desc.length}: ${desc}`);
    for (const [a, n] of [["property", "og:title"], ["property", "og:description"], ["property", "og:url"], ["property", "og:image"], ["property", "og:type"], ["name", "twitter:card"], ["name", "theme-color"]]) {
      check(!!meta(block, a, n), `${file} has ${n}`);
    }
    check(!!link(block, "canonical"), `${file} has a canonical link`);
    check(!/noindex/i.test(head) || !page.public, `${file} is public and says no noindex`);
    if (!WF_CONFIG.baseUrl) {
      const dir = posix.dirname(at); // where the file is served from (home.html is published as dist/index.html)
      for (const ref of [meta(block, "property", "og:image"), link(block, "icon"), link(block, "manifest"), link(block, "apple-touch-icon"), link(block, "canonical")]) {
        check(ref && existsSync(join(WEBXR, posix.normalize(posix.join(dir, ref)))), `${file}: ${ref} resolves to a file`);
      }
    }
    const lds = [...block.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map((m) => { try { return JSON.parse(m[1]); } catch { return null; } });
    check(lds.every(Boolean), `${file}: every JSON-LD block parses`);
    check(lds.every((o) => o?.["@context"] === "https://schema.org" && typeof o["@type"] === "string"), `${file}: every JSON-LD block names schema.org and a @type`);
    if (file.startsWith("dist/")) {
      if (page.public || page.key === "404.html") {
        if (titles.has(title)) check(false, `unique title`, `${title}: ${titles.get(title)} and ${page.key}`); else titles.set(title, page.key);
        if (descs.has(desc)) check(false, `unique description`, `${page.key} and ${descs.get(desc)}`); else descs.set(desc, page.key);
      }
      const types = lds.map((o) => o?.["@type"]);
      if (page.key === "index.html") {
        const org = lds.find((o) => o["@type"] === "Organization");
        check(org?.name === WF_CONFIG.organization.name, "the homepage names the Organization as the repo does");
        const site = lds.find((o) => o["@type"] === "WebSite");
        check(site?.potentialAction?.["@type"] === "SearchAction" && /\?q=\{search_term_string\}$/.test(site.potentialAction.target?.urlTemplate ?? ""), "the homepage's WebSite has a ?q= SearchAction");
        const list = lds.find((o) => o["@type"] === "ItemList");
        check(list?.itemListElement?.length === WF_PROGRAMMES.length && list.numberOfItems === WF_PROGRAMMES.length, "the homepage's ItemList holds every programme", String(list?.itemListElement?.length));
      }
      if (page.key.startsWith("tracks/")) {
        const c = lds.filter((o) => o["@type"] === "Course");
        check(c.length === 1, `${file} carries one Course`);
        const course = c[0];
        if (course) {
          courses += 1;
          check(!!course.name && !!course.description && course.provider?.name === WF_CONFIG.organization.name, `${file}: the Course has name, description and provider`);
          check(course.hasCourseInstance?.["@type"] === "CourseInstance" && course.hasCourseInstance.courseMode === "online", `${file}: the Course has an online CourseInstance`);
        }
        check(types.includes("BreadcrumbList"), `${file} carries a BreadcrumbList`);
      }
    }
  }
}
check(courses === WF_PROGRAMMES.length, "one Course per programme across the track pages", `${courses} of ${WF_PROGRAMMES.length}`);

// Sitemap, robots, manifest.
const sitemap = readFileSync(join(DIST, "sitemap.xml"), "utf8");
const locs = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => unesc(m[1]).replace(WF_CONFIG.baseUrl, ""));
const publicKeys = pages.filter((p) => p.public).map((p) => p.key);
check(/^<\?xml[^>]*\?>\s*(<!--[\s\S]*?-->\s*)?<urlset xmlns="http:\/\/www\.sitemaps\.org\/schemas\/sitemap\/0\.9">/.test(sitemap), "sitemap.xml is a sitemaps.org urlset");
check(JSON.stringify([...locs].sort()) === JSON.stringify([...publicKeys].sort()), "the sitemap lists every public page and nothing else", `${locs.length} vs ${publicKeys.length}`);
check(locs.every((l) => existsSync(join(DIST, l))), "every sitemap entry is a file in the published folder");
check(!locs.some((l) => /404|verify|portal|campus/.test(l)), "no error or repo-only page in the sitemap");
const flatHtml = (await import("node:fs")).readdirSync(DIST).filter((f) => f.endsWith(".html")).filter((f) => f !== "404.html");
check(flatHtml.every((f) => locs.includes(f)), "every published top-level page is in the sitemap", flatHtml.filter((f) => !locs.includes(f)).join(", "));
const robots = readFileSync(join(DIST, "robots.txt"), "utf8");
check(/User-agent: \*/.test(robots) && !/^Disallow: \/\s*$/m.test(robots), "robots.txt allows the public pages");
let manifest = null;
try { manifest = JSON.parse(readFileSync(join(DIST, "manifest.webmanifest"), "utf8")); } catch { /* reported below */ }
check(!!manifest?.name && !!manifest.start_url && manifest.icons?.length >= 2 && manifest.icons.every((i) => existsSync(join(DIST, i.src))), "the web app manifest parses and its icons exist");

// Static usability on the generated pages.
for (const rel of ["index.html", "tracks/electrical-first-period.html", "404.html"]) {
  const html = readFileSync(join(DIST, rel), "utf8");
  const body = html.slice(html.indexOf("<body"));
  check((body.match(/<h1[\s>]/g) ?? []).length === 1, `${rel}: one <h1> in the markup`);
  check(!/<img(?![^>]*\balt=)[^>]*>/.test(body.replace(/<script[\s\S]*?<\/script>/g, "")), `${rel}: every <img> has alt text`);
  check(!/>\s*(click here|here|more)\s*<\/a>/i.test(body), `${rel}: no "click here" link text`);
}
console.log(`static: ${stamped} stamped pages, ${titles.size} unique titles, ${courses} courses, ${locs.length} sitemap entries`);

// ------------------------------------------------------------ browser
const TYPES = { ".html": "text/html", ".js": "application/javascript", ".json": "application/json", ".css": "text/css",
  ".png": "image/png", ".jpg": "image/jpeg", ".svg": "image/svg+xml", ".glb": "model/gltf-binary", ".webmanifest": "application/manifest+json" };
const server = createServer((req, res) => {
  const path = normalize(decodeURIComponent(new URL(req.url, "http://x").pathname)).replace(/^([/\\])+/, "");
  const file = join(DIST, path);
  if (!file.startsWith(DIST) || !existsSync(file) || statSync(file).isDirectory()) { res.writeHead(404); res.end(); return; }
  res.writeHead(200, { "content-type": TYPES[extname(file)] ?? "application/octet-stream" });
  res.end(readFileSync(file));
});
await new Promise((r) => server.listen(0, "127.0.0.1", r));
const base = `http://127.0.0.1:${server.address().port}`;
let browser;
try {
  const { chromium } = await import(PW);
  browser = await chromium.launch({ executablePath: EXE, args: ["--use-gl=swiftshader", "--enable-unsafe-swiftshader", "--no-sandbox"] });
} catch (e) {
  server.close();
  console.log(`✗ could not launch headless Chromium (${PW}, ${EXE}): ${String(e.message).split("\n")[0]}`);
  console.log("check_seo: FAILED (no browser run)");
  process.exit(1);
}
const THREE_SRC = readFileSync(join(WEBXR, "vendor/three/dist/three.module.min.js"), "utf8");
const REACT = Object.fromEntries(["react.production.min.js", "react-dom.production.min.js"].map((f) => [f, readFileSync(join(WEBXR, "vendor/react/dist", f), "utf8")]));
const context = await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true, deviceScaleFactor: 1 });
await context.route(/^https?:\/\/(?!127\.0\.0\.1)/, (r) => r.abort());
await context.route("**/cdnjs.cloudflare.com/ajax/libs/three.js/**", (r) => r.fulfill({ status: 200, contentType: "application/javascript", body: THREE_SRC }));
await context.route(/cdnjs\.cloudflare\.com\/ajax\/libs\/react(-dom)?\/18\.3\.1\/umd\//, (r) => {
  const f = r.request().url().split("/").pop();
  return REACT[f] ? r.fulfill({ status: 200, contentType: "application/javascript", body: REACT[f] }) : r.abort();
});
await context.addInitScript(() => {
  try { localStorage.setItem("holodeck-touch-hint-v1", "1"); } catch { /* private */ }
  window.__wfCls = 0;
  try { new PerformanceObserver((l) => { for (const e of l.getEntries()) if (!e.hadRecentInput) window.__wfCls += e.value; }).observe({ type: "layout-shift", buffered: true }); } catch { /* unsupported */ }
});

const DOC_PAGES = new Set(["atlas.html", "instructor-console.html"]);

/** Everything measured in one page, at phone size. */
async function audit(rel, full) {
  const page = await context.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(String(e.message).split("\n")[0]));
  try {
    await page.goto(`${base}/${rel}`, { waitUntil: "load", timeout: 60000 });
    await page.waitForTimeout(full ? 1500 : 2500);
    const r = await page.evaluate((full) => {
      const vis = (el) => { const b = el.getBoundingClientRect(); const cs = getComputedStyle(el); return b.width > 0 && b.height > 0 && cs.visibility !== "hidden" && cs.display !== "none"; };
      const out = {
        h1: document.querySelectorAll("h1").length,
        main: document.querySelectorAll("main, [role=main]").length,
        noAlt: [...document.querySelectorAll("img")].filter((i) => !i.hasAttribute("alt")).map((i) => i.src.slice(-40)),
        hscroll: document.documentElement.scrollWidth - window.innerWidth,
        cls: window.__wfCls,
      };
      if (full) {
        out.landmarks = ["header", "nav", "main", "footer"].filter((t) => !document.querySelector(t));
        out.skip = !!document.querySelector('a[href^="#"].skip, a.skip');
        out.bodyPx = parseFloat(getComputedStyle(document.body).fontSize);
        // Primary controls: the page's own navigation, actions and buttons outside dialogs.
        const sel = ".hm-act, .hm-nav a, .wf-nav a, .wf-crumbs a, .back, .launch, main .btn, main button, main input, main select, nav[aria-label='Ways back'] a";
        // A control inside a sentence is exempt, as WCAG 2.5.8 exempts inline targets.
        out.small = [...document.querySelectorAll(sel)].filter((el) => vis(el) && !el.closest("dialog") && !el.parentElement.closest("p") && el.getBoundingClientRect().height < 44 - 0.5)
          .map((el) => `${el.tagName.toLowerCase()}.${el.className || el.id} "${(el.textContent || el.value || "").trim().slice(0, 24)}" ${Math.round(el.getBoundingClientRect().height)}px`);
        out.unlabelled = [...document.querySelectorAll("main input:not([type=hidden]), main select, main textarea")].filter((el) => vis(el)
          && !el.closest("label") && !el.getAttribute("aria-label") && !(el.id && document.querySelector(`label[for="${el.id}"]`))).map((el) => el.id || el.name);
        // Body copy under 16 px: paragraphs of real text in the main column.
        out.smallText = [...document.querySelectorAll("main p, main li")].filter((el) => vis(el) && el.textContent.trim().length > 60
          && !el.closest("dialog, .eyebrow, .st-meta, .lessons, .lvl-foot, .flag") && !el.classList.contains("eyebrow")
          && parseFloat(getComputedStyle(el).fontSize) < 16 && el.children.length < 4).slice(0, 12)
          .map((el) => `${el.className || el.tagName}${el.parentElement?.className ? " in ." + el.parentElement.className : ""} ${getComputedStyle(el).fontSize}`);
      }
      return out;
    }, full);
    check(r.h1 === 1, `${rel}: exactly one <h1>`, String(r.h1));
    // A game page is one full-screen canvas under its own menu; the document pages carry the landmarks.
    if (full || DOC_PAGES.has(rel)) check(r.main >= 1, `${rel}: a <main> landmark`);
    check(!r.noAlt.length, `${rel}: every image has alt text`, r.noAlt.slice(0, 3).join(", "));
    check(r.hscroll <= 1, `${rel}: no horizontal scroll on a phone`, `${r.hscroll}px`);
    if (full) {
      check(!r.landmarks.length, `${rel}: header, nav, main and footer landmarks`, r.landmarks.join(", "));
      check(r.skip, `${rel}: a skip link`);
      check(r.bodyPx >= 16, `${rel}: body text at least 16 px on a phone`, `${r.bodyPx}px`);
      check(!r.smallText.length, `${rel}: body copy at least 16 px on a phone`, r.smallText.join("; "));
      check(!r.small.length, `${rel}: primary controls at least 44 px tall on a phone`, r.small.slice(0, 5).join("; "));
      check(!r.unlabelled.length, `${rel}: every form field has a label`, r.unlabelled.join(", "));
      check(r.cls < 0.1, `${rel}: layout shift on load under 0.1`, r.cls.toFixed(3));
    }
    check(!errors.length, `${rel}: no page error`, errors.slice(0, 2).join(" | "));
  } catch (e) { check(false, `${rel} opens`, String(e.message).split("\n")[0]); }
  await page.close();
}

for (const rel of ["index.html", "tracks/electrical-first-period.html", "404.html"]) await audit(rel, true);
for (const rel of flatHtml.filter((f) => f !== "index.html")) await audit(rel, false);

// The homepage search: a typo, a synonym, and ?q=.
{
  const page = await context.newPage();
  try {
    await page.goto(`${base}/index.html`, { waitUntil: "load", timeout: 60000 });
    const count = async (term) => {
      await page.fill("#hm-find-q", term);
      await page.waitForTimeout(150);
      return page.evaluate(() => [...document.querySelectorAll("#hm-progs .prog")].filter((el) => !el.hidden).length + (document.getElementById("hm-find-more").hidden ? 0 : 1000));
    };
    const exact = await count("electrical");
    check(exact > 0, "the finder finds 'electrical'");
    check(await count("electrcal") > 0, "the finder tolerates a typo ('electrcal')");
    check(await count("ibew") > 0 && await count("electrician") > 0, "the finder matches a union and its trade ('IBEW', 'electrician')");
    check(await count("zzqxv") === 0 && await page.isVisible("#hm-find-none"), "an empty result shows a way back");
    await page.goto(`${base}/index.html?q=plumber`, { waitUntil: "load", timeout: 60000 });
    await page.waitForTimeout(400);
    const q = await page.evaluate(() => ({ v: document.getElementById("hm-find-q").value, shown: [...document.querySelectorAll("#hm-progs .prog")].filter((el) => !el.hidden).length, all: document.querySelectorAll("#hm-progs .prog").length }));
    check(q.v === "plumber" && q.shown > 0 && q.shown < q.all, "?q= fills the finder and filters it", JSON.stringify(q));
  } catch (e) { check(false, "the homepage search runs", String(e.message).split("\n")[0]); }
  await page.close();
}

await browser.close();
server.close();
if (failures) { console.log(`\n${failures} SEO check(s) failed, ${passes} passed.`); process.exit(1); }
console.log(`All SEO checks pass: ${passes} checks, ${stamped} stamped pages, ${courses} courses, ${locs.length} sitemap entries.`);
