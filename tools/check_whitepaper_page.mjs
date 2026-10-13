/**
 * The whitepaper page holds its own rules (console SEO-WHITEPAPER).
 *
 *     node tools/check_whitepaper_page.mjs
 *
 *  1. The page: WebXR/whitepaper.html and its published copy
 *     WebXR/dist/whitepaper.html carry the same body; every required section
 *     is there with its heading and at least one sourced claim.
 *  2. Every figure is copied, not invented: each number in the page's text
 *     sits inside a claim (.swp-claim), and each number of a claim appears in
 *     one of the files the claim cites; each cited file is committed (tracked
 *     by git). A small number (0 to 9) counts only where it stands as a number
 *     of its own in the cited file with a word it shares with the claim within
 *     SWP_NEAR words either side, so "0" or "6" cannot pass by appearing
 *     anywhere (a planted wrong small number is a negative case below).
 *     Numbers inside <code>, <cite>, <svg>, <script>, <style> and attributes
 *     are names, not figures. The page is what tools/gen_whitepaper_page.mjs
 *     builds (a staleness check).
 *  3. No partnership, customer, price, valuation or fundraising claim, and
 *     no model identifier, in the page's text.
 *  4. Search and share: the generated SEO block, og:type article, an
 *     og:image that is a 1200 x 630 JPEG within the captures' size, a
 *     TechArticle in the JSON-LD and no VideoObject unless its file is
 *     committed; the page is in the sitemap and the no-store header rules.
 *  5. Linked from the homepage (both layouts and the published copy) and
 *     from the docs index.
 *  6. Readable without JavaScript, at 390 x 844 and 1920 x 1080: one <h1>,
 *     every section visible with its text, no horizontal scroll, body text
 *     at least 16 px.
 *
 * New top-level names carry the `swp` prefix.
 */
import { createServer } from "node:http";
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, statSync } from "node:fs";
import { dirname, extname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";
import { wfBlock, wfPages, WF_BEGIN, WF_END, WF_WHITEPAPER } from "./gen_seo.mjs";
import { swpBuildPage } from "./gen_whitepaper_page.mjs";

const SWP_ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const SWP_WEBXR = join(SWP_ROOT, "WebXR");
const SWP_DIST = join(SWP_WEBXR, "dist");
export const SWP_SECTIONS = ["problem", "platform", "hive", "buildings", "bodies", "learning", "arena", "strands", "ecosystem", "loop10", "stack", "roadmap"];
const SWP_REPO_BLOB = "https://github.com/AGIFutureFoundation/vr-safety-training/blob/main/";

let swpFails = 0, swpPasses = 0;
function swpCheck(ok, what, detail = "") {
  if (ok) { swpPasses += 1; console.log(`  ✓ ${what}`); return true; }
  swpFails += 1; console.log(`  ✗ ${what}${detail ? ` — ${detail}` : ""}`); return false;
}
const swpRead = (p) => readFileSync(join(SWP_ROOT, p), "utf8");

/** The visible text of a fragment: names (code, cite, svg, script, style) and attributes removed. */
export function swpText(html) {
  return html
    .replace(/<(script|style|svg|code|cite)\b[\s\S]*?<\/\1>/g, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&#39;|&rsquo;/g, "'")
    .replace(/\s+/g, " ").trim();
}
/** Numbers in text: 3,631 · 0.950 · 5 · 11.5 (a range like 496–524 is two). */
export const swpNumbers = (text) => text.match(/\d+(?:[.,]\d+)*/g) ?? [];
/** A small number's context: the nearest this many content words either side (numbers and short or common words skipped), in the claim and in the cited file. */
export const SWP_NEAR = 4;
/** How many content words a small number's two windows must share (fewer only when the claim has fewer beside it). */
export const SWP_SHARED = 2;
const SWP_STOP = new Set("the and of a an in on to for with at by is are was were it its as or from that this than be no not into each every all now per so one two".split(" "));
const swpTokens = (text) => text.match(/\d+(?:[.,]\d+)*|[A-Za-z][A-Za-z'\u2019-]*/g) ?? [];
const swpStem = (w) => w.toLowerCase().replace(/[\u2019']s$/, "").replace(/s$/, "");
const swpContent = (tok) => /^[A-Za-z]/.test(tok) && tok.length > 2 && !SWP_STOP.has(tok.toLowerCase());
/** For each standalone occurrence of the small number n in text: the set of its SWP_NEAR nearest content words either side. */
function swpWindows(text, n) {
  const toks = swpTokens(text), out = [];
  toks.forEach((tok, i) => {
    if (tok !== n) return;
    const near = new Set();
    for (const step of [-1, 1]) {
      let got = 0;
      for (let j = i + step; j >= 0 && j < toks.length && got < SWP_NEAR; j += step) if (swpContent(toks[j])) { near.add(swpStem(toks[j])); got += 1; }
    }
    out.push(near);
  });
  return out;
}
/** Is the number n of a claim's text found in a cited file's text? A small number needs a shared word beside it. */
export function swpFigureIn(n, claimText, fileText) {
  const plain = n.replace(/,/g, "");
  if (!/^\d$/.test(n)) return fileText.includes(n) || fileText.includes(plain);
  const mine = new Set(swpWindows(claimText, n).flatMap((s) => [...s]));
  return swpWindows(fileText, n).some((near) => [...near].filter((w) => mine.has(w)).length >= Math.max(1, Math.min(SWP_SHARED, mine.size)));
}
/** The claims of a page: each element whose class names swp-claim, with its cited paths. */
export function swpClaims(html) {
  const out = [];
  for (const m of html.matchAll(/<(li|tr|p)\b([^>]*\bclass="[^"]*\bswp-claim\b[^"]*"[^>]*)>([\s\S]*?)<\/\1>/g)) {
    const inner = m[3];
    const cites = [...inner.matchAll(/<cite>\s*<a href="([^"]+)"/g)].map((c) => c[1].startsWith(SWP_REPO_BLOB) ? c[1].slice(SWP_REPO_BLOB.length) : c[1]);
    out.push({ whole: m[0], inner, text: swpText(inner), cites });
  }
  return out;
}

console.log("The whitepaper page\n");
const swpSrc = readFileSync(join(SWP_WEBXR, "whitepaper.html"), "utf8");
const swpDistPath = join(SWP_DIST, "whitepaper.html");
const swpDist = existsSync(swpDistPath) ? readFileSync(swpDistPath, "utf8") : "";
const swpBody = (h) => h.slice(h.indexOf("<body"));

// ------------------------------------------------------------ 1. the page and its sections
swpCheck(!!swpDist && swpBody(swpDist) === swpBody(swpSrc), "the published copy carries the source's body (run python3 tools/bundle_webxr.py)");
const swpMain = swpSrc.slice(swpSrc.indexOf("<main"), swpSrc.indexOf("</main>"));
const swpSecs = [...swpMain.matchAll(/<section\b[^>]*\bid="([^"]+)"[^>]*>([\s\S]*?)<\/section>/g)].map((m) => ({ id: m[1], html: m[2] }));
let swpSourced = 0;
for (const id of SWP_SECTIONS) {
  const sec = swpSecs.find((s) => s.id === id);
  const claims = sec ? swpClaims(sec.html).filter((c) => c.cites.length) : [];
  if (sec && /<h2\b/.test(sec.html) && claims.length) swpSourced += 1;
  swpCheck(!!sec && /<h2\b/.test(sec.html) && claims.length > 0, `section #${id} has its heading and sourced claims`, sec ? `${claims.length} sourced claims` : "missing");
}
swpCheck((swpSrc.match(/<h1[\s>]/g) ?? []).length === 1, "one <h1>");

// ------------------------------------------------------------ 2. every figure copied from a committed file
const swpTracked = new Set(execFileSync("git", ["ls-files"], { cwd: SWP_ROOT, encoding: "utf8" }).split("\n").filter(Boolean));
const swpFileCache = new Map();
const swpFile = (p) => { if (!swpFileCache.has(p)) swpFileCache.set(p, existsSync(join(SWP_ROOT, p)) ? swpRead(p) : null); return swpFileCache.get(p); };
const swpBodyHtml = swpBody(swpSrc);
const swpClaimsAll = swpClaims(swpBodyHtml);
let swpFigures = 0, swpFound = 0;
const swpMissing = [], swpUncited = [], swpBadCites = new Set();
for (const c of swpClaimsAll) {
  for (const p of c.cites) if (!swpTracked.has(p) || swpFile(p) === null) swpBadCites.add(p);
  const nums = swpNumbers(c.text);
  if (nums.length && !c.cites.length) swpUncited.push(c.text.slice(0, 60));
  for (const n of nums) {
    swpFigures += 1;
    const hit = c.cites.some((p) => { const s = swpFile(p); return s && swpFigureIn(n, c.text, s); });
    if (hit) swpFound += 1; else swpMissing.push(`${n} in "${c.text.slice(0, 50)}…" (${c.cites.join(", ")})`);
  }
}
swpCheck(!swpBadCites.size, "every cited file exists and is committed", [...swpBadCites].join(", "));
// The note first: a wiki page summarises; the console note or doc it was written from is the primary file, and it is cited
// first, so a reader has the file to check (console SEO-WHITEPAPER-3).
const swpWikiOnly = swpClaimsAll.filter((c) => c.cites.length && c.cites.every((p) => p.startsWith("docs/wiki/")));
const swpWikiFirst = swpClaimsAll.filter((c) => c.cites.length && c.cites[0].startsWith("docs/wiki/"));
swpCheck(!swpWikiOnly.length && !swpWikiFirst.length, `every claim cites a file outside docs/wiki/, and cites it first: ${swpClaimsAll.length - swpWikiOnly.length} of ${swpClaimsAll.length}`,
  [...swpWikiOnly, ...swpWikiFirst].map((c) => c.text.slice(0, 40)).join(" | "));
swpCheck(!swpUncited.length, "every claim with a figure cites a file", swpUncited.join(" | "));
swpCheck(swpFigures > 0 && swpFound === swpFigures, `figures present in their cited committed files: ${swpFound} of ${swpFigures}`, swpMissing.slice(0, 8).join("; "));
// The tighter rule bites: a planted wrong small number fails where the old lexical rule passed it.
const swpPlant = { file: "The rooms measured 6 of 6 inside budget. The schema version was 4.", good: "rooms measured 6 of 6", bad: "rooms measured 4 of 6" };
swpCheck(swpFigureIn("6", swpPlant.good, swpPlant.file) && !swpFigureIn("4", swpPlant.bad, swpPlant.file) && swpPlant.file.includes("4"),
  "negative case: a small number found only away from the claim's words fails (synthetic)");
const swpReal = swpClaimsAll.find((c) => /Still-only drive/.test(c.text));
// Which wrong digit the wiki happens to hold elsewhere changes when the wiki is rebuilt, so try each digit the file holds
// (other than the true 5): the case needs at least one planted wrong digit that the tighter rule rejects.
const swpRealFile = swpFile("docs/wiki/Roadmap-and-Changelog.md") ?? "";
const swpRealPlants = swpReal ? ["1", "2", "3", "4", "6", "7", "8", "9"].filter((d) => swpRealFile.includes(d)) : [];
const swpRealCaught = swpRealPlants.find((d) => !swpFigureIn(d, swpReal.text.replace("checks passed: 5", `checks passed: ${d}`), swpRealFile));
swpCheck(!!swpReal && swpFigureIn("5", swpReal.text, swpRealFile) && !!swpRealCaught,
  "negative case: the round-seven drive row with a planted wrong digit for its 5 checks passed fails against its cited wiki page, which holds that digit elsewhere",
  swpRealCaught ? `planted ${swpRealCaught}` : `none of ${swpRealPlants.join(", ")} is rejected`);
// The page is the generator's output.
let swpGen = "";
try { swpGen = swpBuildPage(); } catch (e) { swpGen = `error: ${e.message}`; }
swpCheck(swpGen === swpSrc, "the page is what tools/gen_whitepaper_page.mjs builds (run it after a wiki or note change)", swpGen.startsWith("error:") ? swpGen : "stale");
// Nothing outside a claim carries a figure.
let swpRest = swpBodyHtml;
for (const c of swpClaimsAll) swpRest = swpRest.replace(c.whole, " ");
const swpStray = swpNumbers(swpText(swpRest));
swpCheck(!swpStray.length, "no figure outside a sourced claim", swpStray.slice(0, 8).join(", "));

// ------------------------------------------------------------ 3. no commercial claim, no model identifier
const swpAll = swpText(swpBodyHtml);
const SWP_RAISE = /\b(rais(ed|ing) (\$|€|£|\d|(a |an |the |our |new )?(seed|round|funding|capital|money|investment))|fundrais\w*|seed round|series [A-D]\b|investors? (include|such as))/i;
swpCheck(["We raised $2M", "raising a seed round", "the team raised funding", "fundraising"].every((s) => SWP_RAISE.test(s)) && !SWP_RAISE.test("the bid's raised hand"),
  "the fundraising pattern still catches money and rounds, and not a raised hand");
const SWP_FORBIDDEN = [
  [/[$€£]\s?\d/, "a currency amount"], [/\b(USD|EUR|GBP)\b/, "a currency"], [/\bvalu(ed|ation) (at|of)\b/i, "a valuation"],
  // "raised" alone also names a hand (the agents' bid gesture), so it counts as fundraising only beside money or a round.
  [SWP_RAISE, "fundraising"],
  [/\b(pric(e|ed|ing)|per seat|per month|per year|subscription)\b/i, "a price"],
  [/\b(in partnership with|partnered with|our partners?|endorsed by|certified by)\b/i, "a partnership or endorsement"],
  [/\b(customers? (include|such as|like)|trusted by|used by (the|over|more))\b/i, "a customer"],
  [/\b(claude|anthropic|opus|sonnet|haiku|gpt-\d)\b/i, "a model identifier"],
];
for (const [re, what] of SWP_FORBIDDEN) { const m = swpAll.match(re); swpCheck(!m, `no ${what} in the page's text`, m?.[0]); }

// ------------------------------------------------------------ 4. search and share
const swpPage = wfPages().find((p) => p.key === WF_WHITEPAPER.key);
swpCheck(!!swpPage && swpPage.public, "gen_seo.mjs lists the page as public");
const swpBlock = swpDist.slice(swpDist.indexOf(WF_BEGIN), swpDist.indexOf(WF_END) + WF_END.length);
swpCheck(!!swpPage && swpBlock === wfBlock(swpPage, `dist/${WF_WHITEPAPER.key}`), "the published copy's SEO block is current");
swpCheck(/<meta property="og:type" content="article">/.test(swpBlock) && /<meta name="twitter:card" content="summary_large_image">/.test(swpBlock), "og:type article and a large-image Twitter card");
const swpLd = [...swpBlock.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map((m) => JSON.parse(m[1]));
const swpArt = swpLd.find((o) => o["@type"] === "TechArticle");
swpCheck(!!swpArt && !!swpArt.headline && !!swpArt.description && !!swpArt.publisher?.name && swpArt.articleSection?.length === SWP_SECTIONS.length, "the JSON-LD carries a TechArticle with headline, description, publisher and one section per <h2>");
const swpVideos = swpLd.filter((o) => o["@type"] === "VideoObject" || o.video);
swpCheck(swpVideos.every((v) => swpTracked.has(String(v.contentUrl ?? v.video?.contentUrl ?? "").replace(/^\.?\/?/, "WebXR/dist/"))), "no VideoObject without a committed video file", `${swpVideos.length} VideoObject`);
// The video, when there is one: committed under the site's media folder within its rules (docs/home-backgrounds.md:
// H.264 MP4 with the index first and no audio track, at most 1.2 MB, a JPEG poster under 200 KB), published byte-identical.
if (WF_WHITEPAPER.video) {
  const v = WF_WHITEPAPER.video;
  const files = [v.file, v.poster].map((f) => ({ f, src: join(SWP_WEBXR, "home", f), pub: join(SWP_DIST, f) }));
  swpCheck(files.every((x) => swpTracked.has(`WebXR/home/${x.f}`) && swpTracked.has(`WebXR/dist/${x.f}`) && existsSync(x.src) && existsSync(x.pub) && readFileSync(x.src).equals(readFileSync(x.pub))),
    "the video and its poster are committed under WebXR/home/media and published byte-identical", files.map((x) => x.f).join(", "));
  const mp4 = existsSync(files[0].src) ? readFileSync(files[0].src) : Buffer.alloc(0);
  const moov = mp4.indexOf("moov"), mdat = mp4.indexOf("mdat");
  swpCheck(mp4.length > 0 && mp4.length <= 1.2 * 1024 * 1024 && mp4.includes("avc1") && moov > 0 && moov < mdat && !mp4.includes("soun"),
    "the video is an H.264 MP4 of at most 1.2 MB with its index first and no audio track", `${mp4.length} bytes`);
  const jpg = existsSync(files[1].src) ? readFileSync(files[1].src) : Buffer.alloc(0);
  swpCheck(jpg[0] === 0xff && jpg[1] === 0xd8 && jpg.length <= 200 * 1024, "the poster is a JPEG under 200 KB", `${jpg.length} bytes`);
  const art = swpArt?.video ?? {};
  swpCheck(art["@type"] === "VideoObject" && art.contentUrl === v.file && art.thumbnailUrl === v.poster && !!art.uploadDate && !!art.name && !!art.description,
    "the TechArticle's VideoObject names the published clip, its poster, an upload date, a name and a description");
  swpCheck(swpSrc.includes(`<source src="./${v.file}" type="video/mp4">`) && swpSrc.includes(`poster="./${v.poster}"`), "the page shows the same clip with its poster");
}
const swpOg = join(SWP_DIST, WF_WHITEPAPER.og);
const swpOgSrc = join(SWP_WEBXR, "assets", "wf", `og-${WF_WHITEPAPER.og.split("/").pop()}`);
function swpJpegSize(file) {
  const b = readFileSync(file);
  if (b[0] !== 0xff || b[1] !== 0xd8) return null;
  for (let i = 2; i < b.length - 9;) {
    if (b[i] !== 0xff) { i += 1; continue; }
    const m = b[i + 1];
    if (m >= 0xc0 && m <= 0xc3) return { h: b.readUInt16BE(i + 5), w: b.readUInt16BE(i + 7) };
    i += 2 + b.readUInt16BE(i + 2);
  }
  return null;
}
const swpDims = existsSync(swpOgSrc) ? swpJpegSize(swpOgSrc) : null;
swpCheck(swpTracked.has(`WebXR/assets/wf/og-${WF_WHITEPAPER.og.split("/").pop()}`) || existsSync(swpOgSrc), "the og:image capture is in the site's image folder");
swpCheck(!!swpDims && swpDims.w === 1200 && swpDims.h === 630 && statSync(swpOgSrc).size <= 160 * 1024, "the og:image is a 1200 x 630 JPEG of at most 160 KB, like the other captures", swpDims ? `${swpDims.w} x ${swpDims.h}, ${existsSync(swpOgSrc) ? statSync(swpOgSrc).size : 0} bytes` : "not a JPEG");
swpCheck(existsSync(swpOg) && readFileSync(swpOg).equals(readFileSync(swpOgSrc)), "the published og:image is the committed capture");
const swpSitemap = readFileSync(join(SWP_DIST, "sitemap.xml"), "utf8");
swpCheck(swpSitemap.includes(`<loc>${WF_WHITEPAPER.key}</loc>`) || swpSitemap.includes(`${WF_WHITEPAPER.key}</loc>`), "the sitemap lists the page");
const swpHeaders = readFileSync(join(SWP_DIST, "_headers"), "utf8");
swpCheck(new RegExp(`^/${WF_WHITEPAPER.key}\\n\\s+Cache-Control: no-store`, "m").test(swpHeaders), "the edge headers serve the page no-store, like the other navigational pages");

// ------------------------------------------------------------ 5. linked
for (const f of ["WebXR/home.html", "WebXR/index.html", "WebXR/dist/index.html"]) swpCheck(swpRead(f).includes('href="whitepaper.html"'), `${f} links the whitepaper page`);
swpCheck(/\]\(\.\.\/WebXR\/whitepaper\.html\)/.test(swpRead("docs/README.md")), "the docs index links the whitepaper page");

// ------------------------------------------------------------ 6. readable without JavaScript
const SWP_TYPES = { ".html": "text/html", ".js": "application/javascript", ".css": "text/css", ".jpg": "image/jpeg", ".png": "image/png", ".svg": "image/svg+xml", ".woff2": "font/woff2", ".json": "application/json" };
const swpServer = createServer((req, res) => {
  const path = normalize(decodeURIComponent(new URL(req.url, "http://x").pathname)).replace(/^([/\\])+/, "");
  const file = join(SWP_DIST, path);
  if (!file.startsWith(SWP_DIST) || !existsSync(file) || statSync(file).isDirectory()) { res.writeHead(404); res.end(); return; }
  res.writeHead(200, { "content-type": SWP_TYPES[extname(file)] ?? "application/octet-stream" });
  res.end(readFileSync(file));
});
await new Promise((r) => swpServer.listen(Number(process.env.SWP_PORT || 0), "127.0.0.1", r));
const swpBase = `http://127.0.0.1:${swpServer.address().port}`;
try {
  const { pwModule, pwExecutable } = await import(new URL("./lib/pw.mjs", import.meta.url).href);
  const { chromium } = await pwModule();
  const browser = await chromium.launch({ executablePath: pwExecutable(), args: ["--no-sandbox"] });
  for (const size of [{ width: 390, height: 844, mobile: true }, { width: 1920, height: 1080, mobile: false }]) {
    const ctx = await browser.newContext({ viewport: { width: size.width, height: size.height }, isMobile: size.mobile, hasTouch: size.mobile, javaScriptEnabled: false });
    await ctx.route(/^https?:\/\/(?!127\.0\.0\.1)/, (r) => r.abort());
    const page = await ctx.newPage();
    await page.goto(`${swpBase}/${WF_WHITEPAPER.key}`, { waitUntil: "load", timeout: 30000 });
    const r = await page.evaluate((ids) => ({
      h1: document.querySelectorAll("h1").length,
      shown: ids.filter((id) => { const el = document.getElementById(id); const b = el?.getBoundingClientRect(); return el && b.height > 80 && el.innerText.trim().length > 200; }).length,
      hscroll: document.documentElement.scrollWidth - window.innerWidth,
      bodyPx: parseFloat(getComputedStyle(document.body).fontSize),
      wide: [...document.querySelectorAll("main *")].filter((el) => !el.closest(".swp-table") && el.getBoundingClientRect().right > window.innerWidth + 1).map((el) => el.tagName + "." + el.className).slice(0, 3),
    }), SWP_SECTIONS);
    const label = `${size.width} x ${size.height}, no JavaScript`;
    swpCheck(r.h1 === 1 && r.shown === SWP_SECTIONS.length, `${label}: one <h1> and ${r.shown} of ${SWP_SECTIONS.length} sections shown with their text`);
    swpCheck(r.hscroll <= 1 && !r.wide.length, `${label}: no horizontal scroll`, `${r.hscroll}px ${r.wide.join(", ")}`);
    swpCheck(r.bodyPx >= 16, `${label}: body text at least 16 px`, `${r.bodyPx}px`);
    await ctx.close();
  }
  await browser.close();
} catch (e) {
  swpCheck(false, "the page opens in headless Chromium", String(e.message).split("\n")[0]);
}
swpServer.close();

console.log(`\nsections sourced ${swpSourced} of ${SWP_SECTIONS.length}; figures present in committed files ${swpFound} of ${swpFigures}; claims ${swpClaimsAll.length}`);
if (swpFails) { console.log(`${swpFails} whitepaper-page check(s) failed, ${swpPasses} passed.`); process.exit(1); }
console.log(`All whitepaper-page checks pass: ${swpPasses} checks.`);
