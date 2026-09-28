/**
 * The headset pass, as far as a headless box can take it (console PROVING,
 * docs/perf/headset.md).
 *
 * No WebXR runtime or emulator is installed here, so `navigator.xr` is
 * stubbed with an init script that answers isSessionSupported("immersive-vr")
 * with true and refuses requestSession with a named error, the way a browser
 * with WebXR but no headset attached does. For every page this proves what
 * can be proven without a device: whether the page asks for VR at all
 * (renderer.xr.enabled), whether its Enter VR control appears and enables
 * when VR is supported, whether pressing it fails cleanly (the page keeps
 * running, reports the refusal, no page error), and whether the shared
 * controls overlay (H) and the Guide are on the page. Everything that needs a
 * real session — the overlay's legibility in the headset, hand and controller
 * input, the Guide's VR placement — stays on the manual checklist in
 * docs/perf/headset.md.
 *
 * Writes docs/perf/headset.json and the table between the markers in
 * docs/perf/headset.md.
 *
 *     node tools/headset_pass.mjs
 */
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { pvServe, pvLaunch, pvContext, pvOpen, pvWaitReady, pvLoad, pvCommit, PV_PAGES, PV_ROOT } from "./lib/pv_browser.mjs";

const XR_STUB = `
  Object.defineProperty(navigator, "xr", { configurable: true, value: {
    isSessionSupported: async (mode) => mode === "immersive-vr",
    requestSession: async () => { const e = new Error("NotSupportedError: no XR device is attached (headless stub)"); e.name = "NotSupportedError"; throw e; },
    addEventListener() {}, removeEventListener() {},
  } });
  window.__pvXrStub = true;`;

const PAGES = [...PV_PAGES, { id: "holodeck", name: "Holodeck", page: "holodeck.html", start: [], handle: "null", walk: false }];
const OUT_JSON = join(PV_ROOT, "docs", "perf", "headset.json");
const OUT_MD = join(PV_ROOT, "docs", "perf", "headset.md");

function inspect() {
  const vis = (el) => { if (!el) return false; const cs = getComputedStyle(el); const r = el.getBoundingClientRect(); return cs.display !== "none" && cs.visibility !== "hidden" && r.width > 0 && r.height > 0 && !el.closest("[hidden]"); };
  const buttons = [...document.querySelectorAll("button")].filter((b) => /enter vr|start vr|\bvr\b/i.test(b.textContent) || b.id === "enter-vr");
  const vrButton = buttons[0] ?? null;
  return {
    vrButton: vrButton ? { id: vrButton.id || null, text: vrButton.textContent.trim().slice(0, 40), disabled: !!vrButton.disabled, visible: vis(vrButton) } : null,
    helpButton: vis(document.getElementById("ctl-help-btn")), guide: vis(document.getElementById("gd-btn")),
    stubbed: !!window.__pvXrStub,
  };
}

const server = await pvServe();
let browser;
try { browser = await pvLaunch(); } catch (e) { server.close(); console.log(`✗ ${e.message}`); process.exit(1); }

const results = [];
for (const spec of PAGES) {
  const context = await pvContext(browser);
  await context.addInitScript(XR_STUB);
  const load0 = pvLoad();
  try {
    const { page, errors } = await pvOpen(context, server.base, spec);
    if (spec.handle !== "null") await pvWaitReady(page, spec).catch(() => {});
    await page.waitForTimeout(1500);
    const xrEnabled = spec.handle === "null" ? null : await page.evaluate((h) => { try { return !!eval(h)?.renderer?.xr?.enabled; } catch { return null; } }, spec.handle);
    const before = await page.evaluate(inspect);
    let pressed = null;
    if (before.vrButton && !before.vrButton.disabled) {
      await page.evaluate(() => { const b = [...document.querySelectorAll("button")].find((x) => /enter vr|start vr|\bvr\b/i.test(x.textContent) || x.id === "enter-vr"); b.click(); });
      await page.waitForTimeout(1500);
      pressed = await page.evaluate(() => ({ stillRunning: !!document.body, rail: (document.querySelector("#rail, .rail, [role=status], [role=alert]")?.textContent ?? "").trim().slice(0, 120) }));
    }
    // H opens the shared help overlay.
    await page.keyboard.press("h"); await page.waitForTimeout(400);
    const help = await page.evaluate(() => { const el = document.getElementById("ctl-help"); return el ? !el.hidden && el.querySelectorAll("li, tr, dt").length : null; });
    await page.keyboard.press("Escape");
    const r = { id: spec.id, name: spec.name, page: spec.page, xrEnabled, vrButton: before.vrButton, pressed, helpButton: before.helpButton, helpOpens: !!help, helpRows: help || 0, guide: before.guide, errors: errors.slice(0, 3), loadAvg: [load0, pvLoad()] };
    r.proved = {
      asksForVr: xrEnabled === true, vrControlEnables: !!(before.vrButton && !before.vrButton.disabled), cleanRefusal: pressed ? pressed.stillRunning && errors.length === 0 : null,
      controlsOverlay: r.helpOpens && r.helpRows > 0, guideReachable: before.guide,
    };
    results.push(r);
    console.log(`${xrEnabled ? "✓" : "·"} ${spec.name.padEnd(36)} xr.enabled ${xrEnabled}  VR control ${before.vrButton ? `${before.vrButton.disabled ? "disabled" : "enabled"} ("${before.vrButton.text}")` : "none"}  press: ${pressed ? (pressed.rail || "kept running") : "—"}  help ${r.helpOpens ? `${r.helpRows} rows` : "no"}  guide ${before.guide}  load ${load0}→${r.loadAvg[1]}${errors.length ? `  error: ${errors[0]}` : ""}`);
  } catch (e) {
    results.push({ id: spec.id, name: spec.name, page: spec.page, failed: String(e.message).split("\n")[0], loadAvg: [load0, pvLoad()] });
    console.log(`✗ ${spec.name}: ${String(e.message).split("\n")[0]}`);
  }
  await context.close();
}
await browser.close();
server.close();

const record = { at: new Date().toISOString(), commit: pvCommit(), note: "navigator.xr stubbed (supported, no device); nothing here is a real headset session.", results };
writeFileSync(OUT_JSON, JSON.stringify(record, null, 2) + "\n");
const rows = results.map((r) => r.failed ? `| ${r.name} | — | — | — | — | — | failed: ${r.failed} |`
  : `| ${r.name} | ${r.xrEnabled === null ? "n/a (no handle)" : r.xrEnabled ? "yes" : "**no**"} | ${r.vrButton ? `${r.vrButton.disabled ? "present, disabled" : "enabled"} ("${r.vrButton.text}")` : "none"} | ${r.pressed ? (r.errors.length ? `page error: ${r.errors[0]}` : `clean: ${r.pressed.rail || "kept running"}`) : "—"} | ${r.proved.controlsOverlay ? `yes (${r.helpRows} rows)` : "no"} | ${r.guide ? "yes" : "no"} | load ${r.loadAvg.join("→")} |`);
const table = [`Measured ${record.at} at commit ${record.commit} with the stub described above.`, "",
  "| Page | asks for VR (renderer.xr.enabled) | Enter VR control with VR supported | pressing it with no device | controls overlay (H) | Guide on page | conditions |", "|---|---|---|---|---|---|---|", ...rows].join("\n");
const START = "<!-- headset:start -->", END = "<!-- headset:end -->";
let md = existsSync(OUT_MD) ? readFileSync(OUT_MD, "utf8") : `# Headset pass\n\n${START}\n${END}\n`;
if (!md.includes(START)) md += `\n${START}\n${END}\n`;
md = md.replace(new RegExp(`${START}[\\s\\S]*?${END}`), `${START}\n${table}\n${END}`);
writeFileSync(OUT_MD, md);
console.log(`wrote docs/perf/headset.json (${results.length} pages) and the table in docs/perf/headset.md`);
process.exit(results.some((r) => r.failed) ? 1 : 0);
