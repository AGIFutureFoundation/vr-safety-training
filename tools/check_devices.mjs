#!/usr/bin/env node
// Device profiles: every device names a profile that exists, carries the
// fields the procurement page and the Controls panel read (class, input,
// safety), resolves by `?device=`, and its user-agent rule is not shadowed
// by an earlier one; every profile is complete; the detector resolves the
// URL override, the small-screen heuristic and the default without throwing.
import { DEVICES, PROFILES, CLASSES, INPUT_PRIMARY, detectDevice, applyProfile, weatherUnder, themeScene, describeDevice, describeInput } from "../WebXR/shared/devices.js";

const fail = (m) => { console.error(`✗ ${m}`); process.exitCode = 1; };
const FIELDS = ["brand", "product", "kind", "class", "profile", "xr", "input", "safety", "mount", "ppe", "use", "ua"];
const INPUT_FLAGS = ["voiceFirst", "controllers", "hands", "keyboard", "gaze"];
const SAFETY_FLAGS = ["ansiZ87", "intrinsicallySafe", "helmetMount"];
const boolOrUnverified = (v) => v === true || v === false || v === "unverified";

let uaRules = 0;
for (const [id, d] of Object.entries(DEVICES)) {
  for (const f of FIELDS) if (d[f] === undefined) fail(`${id} lacks ${f}`);
  if (!PROFILES[d.profile]) fail(`${id} names unknown profile ${d.profile}`);
  if (!CLASSES.includes(d.class)) fail(`${id} has class=${d.class}`);
  if (!["none", "ar", "vr", "both"].includes(d.xr)) fail(`${id} has xr=${d.xr}`);
  // input: what the Controls panel reads.
  if (!d.input || typeof d.input !== "object") fail(`${id} input is not a record`);
  else {
    if (!INPUT_PRIMARY.includes(d.input.primary)) fail(`${id} input.primary=${d.input.primary}`);
    for (const f of INPUT_FLAGS) if (typeof d.input[f] !== "boolean") fail(`${id} input.${f} is not a boolean`);
    if (d.input.primary === "controllers" && !d.input.controllers) fail(`${id} selects with controllers it does not have`);
    if (d.input.primary === "hands" && !d.input.hands) fail(`${id} selects with hands it does not track`);
    if (d.input.voiceFirst && d.input.primary !== "voice") fail(`${id} is voice-first but selects with ${d.input.primary}`);
    if (!describeInput(d.input)) fail(`${id} input does not describe`);
  }
  // safety: the vendor's statements, each true / false / "unverified".
  if (!d.safety || typeof d.safety !== "object") fail(`${id} safety is not a record`);
  else {
    for (const f of SAFETY_FLAGS) if (!boolOrUnverified(d.safety[f])) fail(`${id} safety.${f}=${d.safety[f]}`);
    if (typeof d.safety.helmetMount !== "boolean") fail(`${id} safety.helmetMount must be a boolean`);
  }
  // Profile fit: a hands profile is for devices that track hands and have no
  // controllers; an assisted profile is for monoculars; a VR profile for VR.
  if (d.profile === "hands" && (!d.input.hands || d.input.controllers)) fail(`${id} runs the hands profile without bare-hand-only input`);
  if (d.profile === "assisted" && d.class !== "monocular") fail(`${id} runs assisted but is class ${d.class}`);
  if (d.class === "monocular" && d.profile !== "assisted") fail(`${id} is monocular but runs ${d.profile}`);
  if (d.class === "vr" && !["vr", "hands"].includes(d.profile)) fail(`${id} is class vr but runs ${d.profile}`);
  if (d.class === "goggle" && d.profile !== "seethrough") fail(`${id} is a goggle but runs ${d.profile}`);
  // Detection: the URL override always; the user-agent rule, where there is
  // one, resolves the device's own product string to itself — so a specific
  // rule (Quest 3, BT-45C, M4000, Navigator 500) is never shadowed by a
  // generic one earlier in the table.
  const byUrl = detectDevice({ ua: "x", width: 1920, height: 1080, search: `?device=${id}` });
  if (byUrl.id !== id || byUrl.how !== "url") fail(`${id}: ?device= override not honoured`);
  if (d.ua !== null) {
    if (!(d.ua instanceof RegExp)) fail(`${id} ua is neither null nor a RegExp`);
    else {
      uaRules += 1;
      const hit = detectDevice({ ua: `Mozilla/5.0 (Linux; Android 11; ${d.brand} ${d.product}) AppleWebKit/537.36 Chrome/120 Safari/537.36`, width: 1920, height: 1080, search: "" });
      if (hit.id !== id) fail(`${id}: its own product string resolves to ${hit.id} (shadowed or unmatched)`);
    }
  }
  // The intro line names the input style.
  const line = describeDevice(byUrl, applyProfile(byUrl, { root: null }));
  if (!line.includes(describeInput(d.input))) fail(`${id}: describeDevice does not name the input (${line})`);
}

// Real-shaped user agents from browsers known to announce themselves.
const SAMPLES = [
  ["Mozilla/5.0 (X11; Linux x86_64; Quest 3) AppleWebKit/537.36 (KHTML, like Gecko) OculusBrowser/33.0 Chrome/126 VR Safari/537.36", "meta-quest-3"],
  ["Mozilla/5.0 (X11; Linux x86_64; Quest 3S) AppleWebKit/537.36 (KHTML, like Gecko) OculusBrowser/33.0 Chrome/126 VR Safari/537.36", "meta-quest-3s"],
  ["Mozilla/5.0 (X11; Linux x86_64; Quest Pro) AppleWebKit/537.36 (KHTML, like Gecko) OculusBrowser/33.0 Chrome/126 VR Safari/537.36", "meta-quest-pro"],
  ["Mozilla/5.0 (X11; Linux x86_64; Quest 2) AppleWebKit/537.36 (KHTML, like Gecko) OculusBrowser/33.0 Chrome/126 VR Safari/537.36", "meta-quest"],
  ["Mozilla/5.0 (X11; Linux x86_64; Quest) AppleWebKit/537.36 OculusBrowser/20.0 Chrome/104 VR Safari/537.36", "meta-quest"],
  ["Mozilla/5.0 (X11; Linux x86_64; PICO 4 Ultra Enterprise) AppleWebKit/537.36 Chrome/120 Safari/537.36", "pico-4-ultra-enterprise"],
  ["Mozilla/5.0 (X11; Linux x86_64; PICO 4 Enterprise) AppleWebKit/537.36 Chrome/120 Safari/537.36", "pico-4-enterprise"],
  ["Mozilla/5.0 (Linux; Android 11; RealWear HMT-1Z1) AppleWebKit/537.36 Chrome/100 Safari/537.36", "realwear-hmt-1z1"],
  ["Mozilla/5.0 (Linux; Android 11; RealWear Navigator 500) AppleWebKit/537.36 Chrome/100 Safari/537.36", "realwear-navigator-500"],
  ["Mozilla/5.0 (Linux; Android 11; RealWear Navigator 520) AppleWebKit/537.36 Chrome/100 Safari/537.36", "realwear-navigator-520"],
  ["Mozilla/5.0 (Linux; Android 11; Vuzix M4000) AppleWebKit/537.36 Chrome/100 Safari/537.36", "vuzix-m4000"],
  ["Mozilla/5.0 (Linux; Android 11; Epson Moverio BT-45C) AppleWebKit/537.36 Chrome/100 Safari/537.36", "epson-bt-45c"],
  ["Mozilla/5.0 (Linux; Android 11; ThirdEye MIDAS) AppleWebKit/537.36 Chrome/100 Safari/537.36", "thirdeye-midas"],
  // Safari on visionOS sends a desktop-Mac user agent: Vision Pro is URL-only.
  ["Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Safari/605.1.15", "desktop"],
];
for (const [ua, want] of SAMPLES) {
  const hit = detectDevice({ ua, width: 1920, height: 1080, search: "" });
  if (hit.id !== want) fail(`user agent "${ua.slice(0, 60)}…" resolved to ${hit.id}, wanted ${want}`);
}

const PROFILE_FIELDS = ["label", "pixelRatio", "shadows", "weather", "skyline", "hudScale", "contrast", "background", "prefer", "voicePrompt", "display", "targetScale", "selectVerb", "hint", "note"];
for (const [id, p] of Object.entries(PROFILES)) {
  for (const f of PROFILE_FIELDS) if (p[f] === undefined) fail(`profile ${id} lacks ${f}`);
  if (!["flat", "opaque", "seethrough", "monocular"].includes(p.display)) fail(`profile ${id} display=${p.display}`);
  if (!(p.targetScale >= 1)) fail(`profile ${id} targetScale=${p.targetScale}`);
  if (!p.hint.toLowerCase().includes(p.selectVerb === "say" ? "say" : p.selectVerb)) fail(`profile ${id} hint does not name its select verb ${p.selectVerb}`);
}
if (!(PROFILES.hands.hudScale > PROFILES.vr.hudScale && PROFILES.hands.targetScale > PROFILES.vr.targetScale)) fail("hands profile is not larger than vr");
if (PROFILES.hands.selectVerb !== "pinch" || /trigger/i.test(PROFILES.hands.hint)) fail("hands profile hint must name a pinch, not a trigger");
if (PROFILES.seethrough.display !== "seethrough" || PROFILES.assisted.display !== "monocular") fail("seethrough must be binocular see-through and assisted monocular");
for (const id of ["desktop", "vr", "hands", "mr", "seethrough", "assisted"]) if (!PROFILES[id]) fail(`profile ${id} missing`);

const small = detectDevice({ ua: "Mozilla/5.0 (Linux; Android 9) Chrome", width: 854, height: 480, search: "" });
if (small.profile !== "assisted" || small.class !== "monocular" || !small.input || !small.safety) fail(`small screen should resolve to assisted monocular with input and safety, got ${small.profile}`);
const desk = detectDevice({ ua: "Mozilla/5.0 (X11; Linux x86_64) Chrome", width: 2560, height: 1440, search: "" });
if (desk.profile !== "desktop" || !desk.input || !desk.safety) fail(`desktop should resolve to desktop with input and safety, got ${desk.profile}`);
if (detectDevice({ ua: "x", width: 1920, height: 1080, search: "?device=no-such-device" }).id !== "desktop") fail("unknown ?device= should fall through");
// applyProfile against a stub renderer and a stub root.
const calls = [];
const renderer = { setPixelRatio: (v) => calls.push(["dpr", v]), shadowMap: { enabled: true } };
const root = { dataset: {}, style: { setProperty: (k, v) => calls.push([k, v]) } };
const prof = applyProfile({ id: "realwear-navigator-520", ...DEVICES["realwear-navigator-520"] }, { renderer, root });
if (prof.id !== "assisted" || renderer.shadowMap.enabled !== false) fail("assisted profile did not disable shadows");
if (root.dataset.profile !== "assisted" || !calls.some(([k]) => k === "--hud-scale")) fail("profile did not mark the page");
const avp = detectDevice({ ua: "x", width: 1920, height: 1080, search: "?device=apple-vision-pro" });
const avpProfile = applyProfile(avp, { renderer, root });
if (avpProfile.id !== "hands" || root.dataset.profile !== "hands" || avpProfile.selectVerb !== "pinch") fail("Vision Pro did not run the hands profile");
if (!/hands and gaze/.test(describeDevice(avp, avpProfile))) fail(`Vision Pro line lacks "hands and gaze": ${describeDevice(avp, avpProfile)}`);
if (weatherUnder(prof, "storm") !== "clear" || weatherUnder(PROFILES.mr, "storm") !== "overcast" || weatherUnder(PROFILES.desktop, "rain") !== "rain" || weatherUnder(PROFILES.hands, "rain") !== "rain") fail("weatherUnder wrong");
const scene = { background: null, fog: {} }; const seen = [];
const stageRoot = { traverse: (fn) => { for (const n of ["skyline", "district", "other"]) fn({ name: n, set visible(v) { seen.push([n, v]); } }); } };
themeScene({ ...PROFILES.seethrough, id: "seethrough" }, scene, stageRoot, { Color: class { constructor(h) { this.h = h; } } });
if (scene.fog !== null || !seen.some(([n, v]) => n === "skyline" && v === false)) fail("themeScene did not black out and hide the skyline");
const byClass = {};
for (const d of Object.values(DEVICES)) byClass[d.class] = (byClass[d.class] ?? 0) + 1;
if (!process.exitCode) console.log(`All ${Object.keys(DEVICES).length} device profiles check out: ${Object.keys(PROFILES).length} profiles, ${uaRules} user-agent rules unshadowed, ${Object.keys(DEVICES).length - uaRules} URL-only; by class ${Object.entries(byClass).map(([k, v]) => `${k} ${v}`).join(", ")}.`);
