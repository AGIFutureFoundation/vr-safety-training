// Device profiles: how the apps run on the head-worn hardware a construction,
// industrial, maritime or emergency-services crew actually wears.
//
// Most of these are assisted-reality or optical see-through AR devices, not
// VR headsets: the wearer keeps direct sight of the real site, the display is
// small and often monocular, and the input is voice, a touchpad or a few
// buttons rather than controllers. A procedure that renders a full plaza with
// rain at 2× pixel ratio behind a 28px HUD is unreadable on an 854-pixel-wide
// monocular display clipped to a hardhat. So each device maps to a run
// profile, and the profile decides: pixel ratio and shadows, whether the
// weather layer and the skyline are built, how large the HUD is drawn, whether
// the scene sits on black (optical see-through: black is transparent) and
// which entry mode the intro offers first.
//
// Detection is by URL (`?device=<id>`, the way a training office pins a
// kiosk), then user agent, then screen size. A wrong guess only changes the
// profile, never the procedure, and the intro names what it chose so a
// learner can correct it.
//
// PPE is not the app's to certify. `ppe` records what the vendor states so
// the procurement page can quote it; the three questions a safety officer
// has to answer (eye protection rating, helmet mount through an approved
// accessory slot, operational suitability) are in docs/devices.md.

export const PROFILES = {
  desktop: {
    label: "Desktop / tablet / phone",
    pixelRatio: 2, shadows: true, weather: true, skyline: true, hudScale: 1, contrast: "normal",
    background: null, prefer: "flat", voicePrompt: false, note: "The full scene.",
  },
  vr: {
    label: "VR headset",
    pixelRatio: 2, shadows: true, weather: true, skyline: true, hudScale: 1, contrast: "normal",
    background: null, prefer: "vr", voicePrompt: false, note: "Immersive VR with controllers or hands.",
  },
  mr: {
    label: "Mixed-reality headset",
    pixelRatio: 1, shadows: false, weather: "light", skyline: false, hudScale: 1.15, contrast: "high",
    background: null, prefer: "ar", voicePrompt: true,
    note: "WebXR immersive AR with hit-test and hands where the browser offers it; the station is placed on the real floor and the plaza is not built.",
  },
  seethrough: {
    label: "Optical see-through AR glasses",
    pixelRatio: 1, shadows: false, weather: false, skyline: false, hudScale: 1.3, contrast: "high",
    background: "black", prefer: "flat", voicePrompt: true,
    note: "Binocular see-through display without WebXR: the scene is drawn on black so the real site shows through, the HUD is enlarged and high-contrast, and voice runs the steps.",
  },
  assisted: {
    label: "Assisted-reality (monocular) display",
    pixelRatio: 1, shadows: false, weather: false, skyline: false, hudScale: 1.5, contrast: "high",
    background: "dark", prefer: "flat", voicePrompt: true,
    note: "A small monocular display on a hardhat: one large step card at a time, voice-driven, no drag gestures required, minimal scene.",
  },
};

/** The device table. `kind` is what the vendor calls it; `profile` is how
 *  the apps run it; `xr` is whether the device's browser is known to offer
 *  WebXR immersive sessions (none / ar / vr / both) — "none" means the flat
 *  mode with the profile's theme. `ppe` and `mount` are the vendor's own
 *  statements, to be verified with the vendor and the safety officer. */
export const DEVICES = {
  "realwear-navigator-520": { brand: "RealWear", product: "Navigator 520 / 500", kind: "Assisted reality, monocular", profile: "assisted", xr: "none", input: ["voice", "buttons"],
    mount: "Clips to standard safety helmets; used with safety glasses or prescription eyewear", ppe: "Worn with certified hardhat and eyewear; the device itself is not eye protection", use: "Construction, utilities, oil and gas, remote expert support, inspection", ua: /RealWear|Navigator ?5[02]0/i },
  "realwear-hmt-1z1": { brand: "RealWear", product: "HMT-1Z1", kind: "Assisted reality, monocular, intrinsically safe", profile: "assisted", xr: "none", input: ["voice", "buttons"],
    mount: "Helmet-mountable, hazardous-area rated", ppe: "Zone 1 / C1D1 rated per vendor; verify the site's classification", use: "Industrial response, petrochemical, mining, emergency maintenance", ua: /HMT-?1Z1/i },
  "vuzix-m400": { brand: "Vuzix", product: "M400", kind: "Smart glasses, monocular", profile: "assisted", xr: "none", input: ["voice", "touchpad", "buttons"],
    mount: "M-Series Safety Helmet Mounts (left/right) for standard helmet accessory slots, about 30° display rotation", ppe: "Worn with certified helmet; eye protection separate", use: "Field inspection, public-sector inspection, construction service teams", ua: /Vuzix.*M400|M400/i },
  "vuzix-m4000": { brand: "Vuzix", product: "M4000", kind: "Smart glasses, monocular waveguide", profile: "assisted", xr: "none", input: ["voice", "touchpad", "buttons"],
    mount: "M-Series helmet-mount accessory system", ppe: "Worn with certified helmet; eye protection separate", use: "Remote assistance, procedures, asset inspection", ua: /M4000/i },
  "vuzix-blade-2": { brand: "Vuzix", product: "Blade 2 / Blade Upgraded", kind: "Smart glasses, see-through", profile: "seethrough", xr: "none", input: ["voice", "touchpad"],
    mount: "PPE and helmet mounting via integrator configuration", ppe: "ANSI Z87.1 per vendor for the Blade 2 frames; confirm for the configuration bought", use: "Lighter-duty logistics, field operations, guided workflows", ua: /Blade/i },
  "epson-bt-45cs": { brand: "Epson", product: "Moverio BT-45CS", kind: "Binocular see-through AR, headband with helmet options", profile: "seethrough", xr: "none", input: ["controller", "voice"],
    mount: "Adjustable padded headband plus helmet-mounting options; flip-up display", ppe: "Accepts add-on clear or tinted ANSI Z87.1-compatible shields per vendor", use: "Construction supervision, maintenance, training, inspection", ua: /Moverio|BT-45/i },
  "epson-bt-45c": { brand: "Epson", product: "Moverio BT-45C", kind: "Binocular see-through AR", profile: "seethrough", xr: "none", input: ["controller", "voice"],
    mount: "Helmet-mounting options; shock and dust resistant configuration", ppe: "Accepts Z87.1-compatible shields per vendor", use: "Hands-free remote guidance and jobsite workflows", ua: /BT-45C\b/i },
  "rokid-x-craft": { brand: "Rokid", product: "X-Craft", kind: "Binocular see-through AR, helmet-first, ruggedised", profile: "seethrough", xr: "none", input: ["voice", "buttons"],
    mount: "Designed to attach to industrial safety helmets", ppe: "IP66 and ATEX/IECEx positioning per vendor; verify the certificate for the site's zone", use: "Utilities, energy, rail, aviation, industrial construction", ua: /Rokid|X-?Craft/i },
  "iristick-g2": { brand: "Iristick", product: "Iristick.G2", kind: "Smart safety glasses, monocular display", profile: "assisted", xr: "none", input: ["voice", "touch", "phone"],
    mount: "Works with helmets, hats, safety glasses and face shields", ppe: "Safety-glasses form; confirm the rating for the frame bought", use: "First-response communications, field service, assisted procedures", ua: /Iristick/i },
  "thirdeye-x2": { brand: "ThirdEye", product: "X2 MR Glasses", kind: "Binocular mixed-reality glasses", profile: "seethrough", xr: "none", input: ["voice", "gesture", "buttons"],
    mount: "Protective-eyewear form; used with helmets by integrators", ppe: "Confirm eye-protection rating with the vendor", use: "EMS, fire and public safety, telemedicine, incident documentation", ua: /ThirdEye|X2 MR/i },
  "thirdeye-midas": { brand: "ThirdEye", product: "MIDAS", kind: "Display embedded in a protective mask", profile: "seethrough", xr: "none", input: ["voice", "buttons"],
    mount: "Integrated into the mask", ppe: "The mask's own certification governs; verify decontamination procedure", use: "Firefighters, hazmat, defence, zero-visibility response", ua: /MIDAS/i },
  "univet-visionar": { brand: "Univet Optics", product: "VisionAR", kind: "AR safety glasses", profile: "seethrough", xr: "none", input: ["phone", "voice"],
    mount: "Safety-glasses form; confirm compatibility with the helmet system", ppe: "Certified to EN166 and ANSI Z87.1+ per vendor", use: "Construction, manufacturing, industrial safety workflows", ua: /Univet|VisionAR/i },
  "hololens-2": { brand: "Microsoft", product: "HoloLens 2 Industrial Edition", kind: "Mixed-reality headset", profile: "mr", xr: "ar", input: ["hands", "voice", "gaze"],
    mount: "Hardhat adapter systems; the headset does not replace PPE", ppe: "Industrial Edition rated for clean-room and hazardous-location classes per vendor; verify", use: "BIM overlays, construction QA/QC, digital-twin visualisation, design review", ua: /HoloLens|Windows Mixed Reality/i },
  "xyz-reality-atom": { brand: "XYZ Reality", product: "Atom", kind: "AR built into a certified construction hardhat", profile: "mr", xr: "none", input: ["proprietary"],
    mount: "Integrated hardhat", ppe: "Certified hardhat per vendor", use: "High-precision BIM layout, structural verification; no general web browser — content is delivered through the vendor's platform, so these apps run beside it on a tablet or the vendor's tooling", ua: /XYZ ?Reality|Atom HMD/i },
  "daqri-smart-helmet": { brand: "DAQRI", product: "Smart Helmet", kind: "Integrated AR hardhat and visor (legacy)", profile: "mr", xr: "none", input: ["proprietary"],
    mount: "Integrated", ppe: "Legacy product; verify current sourcing and vendor support before procurement", use: "Pilot reference for smart-hardhat concepts", ua: /DAQRI/i },
  "meta-quest": { brand: "Meta", product: "Quest 2 / 3 / Pro", kind: "VR headset with passthrough", profile: "vr", xr: "both", input: ["controllers", "hands"],
    mount: "Not PPE; training-room use", ppe: "None", use: "Immersive VR training and passthrough AR in the training room", ua: /OculusBrowser|Quest/i },
};

/** Which device this page is on: the URL wins, then the user agent, then a
 *  small-monocular screen heuristic, else desktop. */
export function detectDevice({ ua = typeof navigator !== "undefined" ? navigator.userAgent : "", width = typeof screen !== "undefined" ? screen.width : 1920, height = typeof screen !== "undefined" ? screen.height : 1080, search = typeof location !== "undefined" ? location.search : "" } = {}) {
  const q = new URLSearchParams(search).get("device");
  if (q && DEVICES[q]) return { id: q, ...DEVICES[q], how: "url" };
  for (const [id, d] of Object.entries(DEVICES)) if (d.ua?.test(ua)) return { id, ...d, how: "user agent" };
  if (width <= 900 && height <= 540) return { id: "generic-assisted", brand: "Unknown", product: "Small monocular display", kind: "Assisted reality", profile: "assisted", xr: "none", input: ["voice"], how: "screen size" };
  return { id: "desktop", brand: "—", product: "Desktop, tablet or phone browser", kind: "Flat screen", profile: "desktop", xr: "unknown", input: ["mouse", "touch"], how: "default" };
}

/** Apply a device's profile to the renderer and the page. Returns the
 *  profile with the device attached so the app can read its flags. */
export function applyProfile(device, { renderer = null, root = typeof document !== "undefined" ? document.documentElement : null } = {}) {
  const profile = { ...(PROFILES[device.profile] ?? PROFILES.desktop), id: device.profile, device };
  if (renderer) {
    const dpr = typeof devicePixelRatio === "number" ? devicePixelRatio : 1;
    renderer.setPixelRatio(Math.min(dpr, profile.pixelRatio));
    renderer.shadowMap.enabled = profile.shadows;
  }
  if (root) {
    root.dataset.profile = profile.id;
    root.dataset.device = device.id;
    root.style.setProperty("--hud-scale", String(profile.hudScale));
  }
  return profile;
}

/** The weather kind a station should build under this profile. */
export function weatherUnder(profile, kind) {
  if (profile.weather === true) return kind;
  if (profile.weather === "light") return kind === "storm" || kind === "rain" || kind === "smoke" ? "overcast" : kind;
  return "clear";
}

/** Sit the scene on the profile's background: black for optical
 *  see-through (transparent to the wearer), a flat dark tone for a
 *  monocular display, untouched for everything else. Hides the skyline
 *  group when the profile does not build a horizon. */
export function themeScene(profile, scene, stageRoot, THREE) {
  if (profile.background === "black") { scene.background = new THREE.Color(0x000000); scene.fog = null; }
  else if (profile.background === "dark") { scene.background = new THREE.Color(0x06090f); scene.fog = null; }
  if (!profile.skyline && stageRoot) stageRoot.traverse((o) => { if (o.name === "skyline" || o.name === "district") o.visible = false; });
}

/** One line for the intro: what was detected and how it will run. */
export function describeDevice(device, profile) {
  return `${device.brand === "—" ? device.product : `${device.brand} ${device.product}`} — ${profile.label.toLowerCase()} profile (${device.how}).`;
}
