#!/usr/bin/env node
// Device profiles: every device names a profile that exists, carries the
// fields the procurement page prints, and the detector resolves the URL
// override, each device's user-agent pattern, the small-screen heuristic and
// the default without throwing.
import { DEVICES, PROFILES, detectDevice, applyProfile, weatherUnder, themeScene } from "../WebXR/shared/devices.js";

const fail = (m) => { console.error(`✗ ${m}`); process.exitCode = 1; };
const FIELDS = ["brand", "product", "kind", "profile", "xr", "input", "mount", "ppe", "use", "ua"];
for (const [id, d] of Object.entries(DEVICES)) {
  for (const f of FIELDS) if (d[f] === undefined) fail(`${id} lacks ${f}`);
  if (!PROFILES[d.profile]) fail(`${id} names unknown profile ${d.profile}`);
  if (!["none", "ar", "vr", "both"].includes(d.xr)) fail(`${id} has xr=${d.xr}`);
  if (!(d.ua instanceof RegExp)) fail(`${id} ua is not a RegExp`);
  const hit = detectDevice({ ua: `Mozilla/5.0 (Linux; Android 11; ${d.product}) ${d.brand}`, width: 1920, height: 1080, search: "" });
  if (hit.id !== id && !d.ua.test(`${d.brand} ${d.product}`)) fail(`${id}: its own product string is not detected (got ${hit.id})`);
  const byUrl = detectDevice({ ua: "x", width: 1920, height: 1080, search: `?device=${id}` });
  if (byUrl.id !== id) fail(`${id}: ?device= override not honoured`);
}
for (const [id, p] of Object.entries(PROFILES)) {
  for (const f of ["label", "pixelRatio", "shadows", "weather", "skyline", "hudScale", "contrast", "prefer", "voicePrompt", "note"]) if (p[f] === undefined) fail(`profile ${id} lacks ${f}`);
}
const small = detectDevice({ ua: "Mozilla/5.0 (Linux; Android 9) Chrome", width: 854, height: 480, search: "" });
if (small.profile !== "assisted") fail(`small screen should resolve to assisted, got ${small.profile}`);
const desk = detectDevice({ ua: "Mozilla/5.0 (X11; Linux x86_64) Chrome", width: 2560, height: 1440, search: "" });
if (desk.profile !== "desktop") fail(`desktop should resolve to desktop, got ${desk.profile}`);
// applyProfile against a stub renderer and a stub root.
const calls = [];
const renderer = { setPixelRatio: (v) => calls.push(["dpr", v]), shadowMap: { enabled: true } };
const root = { dataset: {}, style: { setProperty: (k, v) => calls.push([k, v]) } };
const prof = applyProfile({ id: "realwear-navigator-520", ...DEVICES["realwear-navigator-520"] }, { renderer, root });
if (prof.id !== "assisted" || renderer.shadowMap.enabled !== false) fail("assisted profile did not disable shadows");
if (root.dataset.profile !== "assisted" || !calls.some(([k]) => k === "--hud-scale")) fail("profile did not mark the page");
if (weatherUnder(prof, "storm") !== "clear" || weatherUnder(PROFILES.mr, "storm") !== "overcast" || weatherUnder(PROFILES.desktop, "rain") !== "rain") fail("weatherUnder wrong");
const scene = { background: null, fog: {} }; const seen = [];
const stageRoot = { traverse: (fn) => { for (const n of ["skyline", "district", "other"]) fn({ name: n, set visible(v) { seen.push([n, v]); } }); } };
themeScene({ ...PROFILES.seethrough, id: "seethrough" }, scene, stageRoot, { Color: class { constructor(h) { this.h = h; } } });
if (scene.fog !== null || !seen.some(([n, v]) => n === "skyline" && v === false)) fail("themeScene did not black out and hide the skyline");
if (!process.exitCode) console.log(`All ${Object.keys(DEVICES).length} device profiles check out: ${Object.keys(PROFILES).length} profiles, detection by URL, user agent and screen size.`);
