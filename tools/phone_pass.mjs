/**
 * The phone pass (console PROVING, docs/consoles/PROVING.md).
 *
 * Opens every world and both station apps at 360 x 640 and 390 x 844 with
 * touch emulation, starts each, and measures: horizontal overflow (the
 * document must not scroll sideways), tap targets (every visible button and
 * link is at least 44 x 44 CSS px), HUD readability (visible HUD text at
 * least 14 px), the first meaningful paint (Chromium's first-contentful-paint
 * entry, budget PP_FCP_BUDGET_MS, 4000 by default under SwiftShader on the
 * shared box) and page errors; saves a capture of each page and size to
 * docs/img/proving/<id>-<w>x<h>.png and the results to docs/perf/phone.json
 * and docs/perf/phone.md. Exits 1 when the overflow, readability or paint
 * budget fails; small tap targets are listed as findings for the owning
 * team (the count is recorded and check_proving holds it to the recorded
 * baseline).
 *
 *     node tools/phone_pass.mjs
 *     PP_ONLY=summit node tools/phone_pass.mjs
 */
import { writeFileSync, mkdirSync, existsSync } from "node:fs";
import { join } from "node:path";
import { pvServe, pvLaunch, pvContext, pvOpen, pvPhone, pvLoad, pvCommit, PV_PAGES, PV_ROOT, PV_DIST } from "./lib/pv_browser.mjs";

const FCP_BUDGET = Number(process.env.PP_FCP_BUDGET_MS) || 4000;
const SIZES = [[360, 640], [390, 844]];
const PAGES = process.env.PP_ONLY ? PV_PAGES.filter((p) => p.id === process.env.PP_ONLY) : PV_PAGES;
const IMG_DIR = join(PV_ROOT, "docs", "img", "proving");
const OUT_DIR = join(PV_ROOT, "docs", "perf");

for (const p of PAGES) if (!existsSync(join(PV_DIST, p.page))) { console.log(`✗ WebXR/dist/${p.page} is missing — run python3 tools/bundle_webxr.py`); process.exit(1); }

/** In the page: overflow, tap targets, HUD text sizes, paint timing. */
function inspect() {
  const vis = (el) => { const cs = getComputedStyle(el); if (cs.display === "none" || cs.visibility === "hidden" || +cs.opacity === 0) return false; const r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0 && r.bottom > 0 && r.right > 0 && r.top < innerHeight && r.left < innerWidth && !el.closest("[hidden]"); };
  const doc = document.scrollingElement || document.documentElement;
  const overflowX = Math.max(0, doc.scrollWidth - innerWidth);
  const small = [];
  let targets = 0;
  for (const el of document.querySelectorAll("button, a[href], [role=button], input, select")) {
    if (!vis(el)) continue;
    targets += 1;
    const r = el.getBoundingClientRect();
    if (r.width < 44 || r.height < 44) small.push(`${el.id ? "#" + el.id : el.tagName.toLowerCase() + (el.className ? "." + String(el.className).split(" ")[0] : "")} ${r.width | 0}x${r.height | 0}`);
  }
  const hudSmall = [];
  for (const el of document.querySelectorAll("#hud *, .hud *, #tc-layer *")) {
    if (!vis(el)) continue;
    const own = [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim());
    if (own && parseFloat(getComputedStyle(el).fontSize) < 14) hudSmall.push(`${el.id || el.className || el.tagName}:${getComputedStyle(el).fontSize}`);
  }
  const paint = performance.getEntriesByType("paint");
  const fcp = paint.find((e) => e.name === "first-contentful-paint")?.startTime ?? null;
  const fp = paint.find((e) => e.name === "first-paint")?.startTime ?? null;
  return { overflowX, targets, small, hudSmall, fcpMs: fcp && +fcp.toFixed(0), fpMs: fp && +fp.toFixed(0), tier: document.documentElement.dataset.tier ?? null, hasStick: !!document.querySelector("#tc-layer .tc-stick") };
}

const server = await pvServe();
let browser;
try { browser = await pvLaunch(); } catch (e) { server.close(); console.log(`✗ ${e.message}`); process.exit(1); }
mkdirSync(IMG_DIR, { recursive: true });
mkdirSync(OUT_DIR, { recursive: true });

const results = [];
let failures = 0;
for (const spec of PAGES) {
  for (const [w, h] of SIZES) {
    const tag = `${spec.name} ${w}x${h}`;
    const context = await pvContext(browser, pvPhone(w, h));
    const load0 = pvLoad();
    try {
      const { page, errors } = await pvOpen(context, server.base, spec);
      await page.waitForTimeout(2500);
      await page.evaluate(() => document.getElementById("tc-hint")?.remove());
      const m = await page.evaluate(inspect);
      const shot = `${spec.id}-${w}x${h}.png`;
      await page.screenshot({ path: join(IMG_DIR, shot) });
      const res = { id: spec.id, name: spec.name, page: spec.page, size: `${w}x${h}`, ...m, errors: errors.slice(0, 3), capture: `docs/img/proving/${shot}`, loadAvg: [load0, pvLoad()] };
      res.pass = { overflow: m.overflowX === 0, hudText: m.hudSmall.length === 0, paint: m.fcpMs !== null && m.fcpMs <= FCP_BUDGET, noError: errors.length === 0 };
      results.push(res);
      const bad = Object.entries(res.pass).filter(([, ok]) => !ok).map(([k]) => k);
      if (bad.length) failures += 1;
      console.log(`${bad.length ? "✗" : "✓"} ${tag.padEnd(44)} overflow ${m.overflowX}px  fcp ${m.fcpMs} ms  ${m.targets} targets, ${m.small.length} under 44 px  hud<14px ${m.hudSmall.length}  tier ${m.tier}  load ${load0}→${res.loadAvg[1]}${bad.length ? `  FAILED ${bad.join(",")}` : ""}${errors.length ? `  error: ${errors[0]}` : ""}`);
    } catch (e) {
      failures += 1;
      results.push({ id: spec.id, name: spec.name, page: spec.page, size: `${w}x${h}`, failed: String(e.message).split("\n")[0], loadAvg: [load0, pvLoad()] });
      console.log(`✗ ${tag}: ${String(e.message).split("\n")[0]}`);
    }
    await context.close();
  }
}
await browser.close();
server.close();

const record = { at: new Date().toISOString(), commit: pvCommit(), fcpBudgetMs: FCP_BUDGET, sizes: SIZES.map(([w, h]) => `${w}x${h}`),
  note: "Headless Chromium with touch emulation under SwiftShader on a shared machine; paint times are relative to this box, the layout measurements are exact CSS px.",
  smallTargets: results.reduce((a, r) => a + (r.small?.length ?? 0), 0), results };
writeFileSync(join(OUT_DIR, "phone.json"), JSON.stringify(record, null, 2) + "\n");

const md = [
  "# Phone pass",
  "",
  `Measured ${record.at} at commit ${record.commit}: every world and both station apps at 360×640 and 390×844, touch emulation, headless Chromium under SwiftShader (paint times are relative to this shared machine; layout numbers are exact CSS px). First-contentful-paint budget ${FCP_BUDGET} ms. Captures under \`docs/img/proving/\`. Tool: \`node tools/phone_pass.mjs\`.`,
  "",
  "| Page | Size | horizontal overflow | first contentful paint | tap targets (under 44 px) | HUD text under 14 px | tier | page errors | capture |",
  "|---|---|---:|---:|---|---|---|---|---|",
  ...results.map((r) => r.failed
    ? `| ${r.name} | ${r.size} | — | — | — | — | — | failed: ${r.failed} | — |`
    : `| ${r.name} | ${r.size} | ${r.overflowX} px | ${r.fcpMs} ms | ${r.targets} (${r.small.length}) | ${r.hudSmall.length} | ${r.tier} | ${r.errors.length} | [${r.size}](../img/proving/${r.capture.split("/").pop()}) |`),
  "",
  "## Tap targets under 44 px, by page",
  "",
  ...results.filter((r) => r.small?.length).map((r) => `- **${r.name} ${r.size}**: ${r.small.slice(0, 12).join(", ")}${r.small.length > 12 ? ` … (${r.small.length} in all)` : ""}`),
  "",
  "These are findings for the owning teams (the shared touch controls themselves are held to 48 px by `check_mobile`); `check_proving` holds the total to the recorded baseline so it cannot grow unnoticed.",
  "",
].join("\n");
writeFileSync(join(OUT_DIR, "phone.md"), md);
console.log(`wrote docs/perf/phone.json, docs/perf/phone.md and ${results.filter((r) => !r.failed).length} captures; ${failures ? `${failures} page size(s) failed a budget` : "every budget holds"}`);
process.exit(failures ? 1 : 0);
