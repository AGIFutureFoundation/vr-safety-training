// Device profiles: how the apps run on the head-worn hardware a construction,
// industrial, maritime or emergency-services crew actually wears — and the
// headsets a union training centre buys for the training room.
//
// Many of these are assisted-reality or optical see-through AR devices, not
// VR headsets: the wearer keeps direct sight of the real site, the display is
// small and often monocular, and the input is voice, a touchpad or a few
// buttons rather than controllers. A procedure that renders a full plaza with
// rain at 2× pixel ratio behind a 28px HUD is unreadable on an 854-pixel-wide
// monocular display clipped to a hardhat. So each device maps to a run
// profile, and the profile decides: pixel ratio and shadows, whether the
// weather layer and the skyline are built, how large the HUD is drawn, whether
// the scene sits on black (optical see-through: black is transparent), which
// entry mode the intro offers first, and what the select verb is called in a
// hint (a trigger, a pinch, a touchpad, a spoken word).
//
// Detection is by URL (`?device=<id>`, the way a training office pins a
// kiosk), then user agent, then screen size. A wrong guess only changes the
// profile, never the procedure, and the intro names what it chose so a
// learner can correct it. A user-agent rule exists only for devices whose
// browser is known to announce itself (Quest browsers say "OculusBrowser" and
// the model, PICO browsers say "PICO", RealWear, Vuzix M-series, Moverio,
// Rokid, Iristick, ThirdEye, Univet, HoloLens); every other device has
// `ua: null` and is reached by the URL override only. Apple Vision Pro's
// Safari sends a desktop-Mac user agent on purpose, so it is URL-only.
// Specific rules sit above generic ones in the table because the detector
// takes the first match; tools/check_devices.mjs proves no rule shadows
// another.
//
// `class` groups the hardware the way a procurement sheet does:
//   vr        opaque headset, passthrough optional (Quest, Pico, Vive, Varjo,
//             Vision Pro)
//   mr        optical see-through headset with room tracking (HoloLens 2,
//             Magic Leap 2)
//   goggle    binocular see-through glasses without WebXR (Moverio, Shield,
//             ThinkReality A3, Blade, X-Craft, X2, VisionAR)
//   monocular a single small display on a hardhat or a frame (RealWear,
//             Vuzix M-series and Z100, Iristick, Glass EE2)
//   helmet    the display is built into head or face protection (Atom,
//             DAQRI, MIDAS)
//
// `input` is what another team's Controls panel reads: `primary` is the way
// the learner selects, `voiceFirst` means the vendor designs for voice as
// the main input, `controllers` means tracked hand controllers, `hands`
// means the device tracks the learner's bare hands, `keyboard` means a
// keyboard reaches the page, `gaze` means where the learner looks is an
// input the page can act on. `safety` records the vendor's own statements —
// `true` is a vendor claim to be verified, "unverified" means no statement
// was confirmed — and never a certification by this project. The three
// questions a safety officer has to answer (eye protection rating, helmet
// mount through an approved accessory slot, operational suitability) are in
// docs/devices.md.

export const CLASSES = ["vr", "mr", "goggle", "monocular", "helmet"];
export const INPUT_PRIMARY = ["controllers", "hands", "voice", "touchpad", "buttons", "mouse"];

/** A run profile. Beyond the render flags, `display` says what is in front
 *  of the eye (flat screen, opaque headset, binocular see-through, monocular),
 *  `targetScale` is how much larger the app may draw selectable targets,
 *  `selectVerb` is the one word a hint uses for selecting, and `hint` is the
 *  sentence the Controls panel shows before the first step. */
export const PROFILES = {
  desktop: {
    label: "Desktop / tablet / phone",
    pixelRatio: 2, shadows: true, weather: true, skyline: true, hudScale: 1, contrast: "normal",
    background: null, prefer: "flat", voicePrompt: false, display: "flat", targetScale: 1, selectVerb: "click",
    hint: "Click or tap a highlighted part to select it.", note: "The full scene.",
  },
  vr: {
    label: "VR headset",
    pixelRatio: 2, shadows: true, weather: true, skyline: true, hudScale: 1, contrast: "normal",
    background: null, prefer: "vr", voicePrompt: false, display: "opaque", targetScale: 1, selectVerb: "trigger",
    hint: "Point the controller at a part and pull the trigger to select it.", note: "Immersive VR with controllers, hands where the browser offers them.",
  },
  hands: {
    label: "Hand-tracked headset",
    pixelRatio: 2, shadows: true, weather: true, skyline: true, hudScale: 1.1, contrast: "normal",
    background: null, prefer: "vr", voicePrompt: false, display: "opaque", targetScale: 1.15, selectVerb: "pinch",
    hint: "Look at a part and pinch thumb and finger together to select it.",
    note: "Immersive VR driven by tracked hands with no controllers: the HUD and the selectable targets are drawn a little larger, and every hint names a pinch rather than a trigger.",
  },
  mr: {
    label: "Mixed-reality headset",
    pixelRatio: 1, shadows: false, weather: "light", skyline: false, hudScale: 1.15, contrast: "high",
    background: null, prefer: "ar", voicePrompt: true, display: "seethrough", targetScale: 1.15, selectVerb: "pinch",
    hint: "Air-tap: pinch thumb and finger on a part to select it.",
    note: "WebXR immersive AR with hit-test and hands where the browser offers it; the station is placed on the real floor and the plaza is not built.",
  },
  seethrough: {
    label: "Optical see-through AR glasses",
    pixelRatio: 1, shadows: false, weather: false, skyline: false, hudScale: 1.3, contrast: "high",
    background: "black", prefer: "flat", voicePrompt: true, display: "seethrough", targetScale: 1.2, selectVerb: "touchpad",
    hint: "Select with the glasses' touchpad or controller; voice reads each step back.",
    note: "Binocular see-through display without WebXR: the scene is drawn on black so the real site shows through, the HUD is enlarged and high-contrast, and voice runs the steps.",
  },
  assisted: {
    label: "Assisted-reality (monocular) display",
    pixelRatio: 1, shadows: false, weather: false, skyline: false, hudScale: 1.5, contrast: "high",
    background: "dark", prefer: "flat", voicePrompt: true, display: "monocular", targetScale: 1.3, selectVerb: "say",
    hint: "Say the part's name or press the action button to select it.",
    note: "A small monocular display on a hardhat: one large step card at a time, voice-driven, no drag gestures required, minimal scene.",
  },
};

// Record builders, as function declarations: the bundler reads a one-line
// `const` with destructured defaults as several declared names.
function IN(primary, flags = {}) {
  return { primary, voiceFirst: false, controllers: false, hands: false, keyboard: false, gaze: false, ...flags };
}
function SAFE(flags = {}) {
  return { ansiZ87: false, intrinsicallySafe: false, helmetMount: false, ...flags };
}
const NOT_PPE = "Not PPE; training-room use";

/** The device table. `kind` is what the vendor calls it; `class` is the
 *  procurement grouping above; `profile` is how the apps run it; `xr` is
 *  whether the device's browser is known to offer WebXR immersive sessions
 *  (none / ar / vr / both) — "none" means the flat mode with the profile's
 *  theme, and is also what an unverified browser gets. `mount` and `ppe` are
 *  the vendor's own statements, to be verified with the vendor and the
 *  safety officer. Order matters for user-agent detection: a specific rule
 *  sits above the generic rule of the same family. */
export const DEVICES = {
  // RealWear — monocular, voice-first. The HMT-1Z1 and Navigator 500 rules
  // sit above the 520's, whose "RealWear" alternative is the family fallback.
  "realwear-hmt-1z1": { brand: "RealWear", product: "HMT-1Z1", kind: "Assisted reality, monocular, intrinsically safe", class: "monocular", profile: "assisted", xr: "none",
    input: IN("voice", { voiceFirst: true }), safety: SAFE({ intrinsicallySafe: true, helmetMount: true }),
    mount: "Helmet-mountable, hazardous-area rated", ppe: "Zone 1 / C1D1 rated per vendor; verify the site's classification", use: "Industrial response, petrochemical, mining, emergency maintenance", ua: /HMT-?1Z1/i },
  "realwear-navigator-500": { brand: "RealWear", product: "Navigator 500", kind: "Assisted reality, monocular, modular", class: "monocular", profile: "assisted", xr: "none",
    input: IN("voice", { voiceFirst: true }), safety: SAFE({ helmetMount: true }),
    mount: "Clips to standard safety helmets; used with safety glasses or prescription eyewear; modular camera and battery", ppe: "Worn with certified hardhat and eyewear; the device itself is not eye protection", use: "Construction, utilities, oil and gas, remote expert support, inspection", ua: /Navigator ?500/i },
  "realwear-navigator-520": { brand: "RealWear", product: "Navigator 520", kind: "Assisted reality, monocular", class: "monocular", profile: "assisted", xr: "none",
    input: IN("voice", { voiceFirst: true }), safety: SAFE({ helmetMount: true }),
    mount: "Clips to standard safety helmets; used with safety glasses or prescription eyewear", ppe: "Worn with certified hardhat and eyewear; the device itself is not eye protection", use: "Construction, utilities, oil and gas, remote expert support, inspection", ua: /RealWear|Navigator ?520/i },
  // Vuzix — M-series monoculars, Blade and Shield see-through, Z100 monocular
  // driven from a phone. M4000 sits above M400 so "M400\b" cannot see it.
  "vuzix-m4000": { brand: "Vuzix", product: "M4000", kind: "Smart glasses, monocular waveguide", class: "monocular", profile: "assisted", xr: "none",
    input: IN("voice", { voiceFirst: true }), safety: SAFE({ helmetMount: true }),
    mount: "M-Series helmet-mount accessory system", ppe: "Worn with certified helmet; eye protection separate", use: "Remote assistance, procedures, asset inspection", ua: /M4000\b/i },
  "vuzix-m400": { brand: "Vuzix", product: "M400", kind: "Smart glasses, monocular", class: "monocular", profile: "assisted", xr: "none",
    input: IN("voice", { voiceFirst: true }), safety: SAFE({ helmetMount: true }),
    mount: "M-Series Safety Helmet Mounts (left/right) for standard helmet accessory slots, about 30° display rotation", ppe: "Worn with certified helmet; eye protection separate", use: "Field inspection, public-sector inspection, construction service teams", ua: /M400\b/i },
  "vuzix-blade-2": { brand: "Vuzix", product: "Blade 2 / Blade Upgraded", kind: "Smart glasses, see-through", class: "goggle", profile: "seethrough", xr: "none",
    input: IN("touchpad"), safety: SAFE({ ansiZ87: true }),
    mount: "PPE and helmet mounting via integrator configuration", ppe: "ANSI Z87.1 per vendor for the Blade 2 frames; confirm for the configuration bought", use: "Lighter-duty logistics, field operations, guided workflows", ua: /Blade/i },
  "vuzix-shield": { brand: "Vuzix", product: "Shield", kind: "Smart safety glasses, binocular see-through waveguide", class: "goggle", profile: "seethrough", xr: "none",
    input: IN("voice", { voiceFirst: true }), safety: SAFE({ ansiZ87: true }),
    mount: "Safety-glasses form worn under a hardhat; no helmet clip", ppe: "ANSI Z87.1 per vendor; confirm the certificate for the lot bought", use: "Guided workflows and remote assistance where the glasses must also be the eye protection", ua: null },
  "vuzix-z100": { brand: "Vuzix", product: "Z100", kind: "Ultralight smart glasses, monocular monochrome waveguide", class: "monocular", profile: "assisted", xr: "none",
    input: IN("buttons"), safety: SAFE({ ansiZ87: "unverified" }),
    mount: "Eyeglass frame; no helmet mount stated", ppe: "Not sold as safety eyewear; confirm any safety-frame option", use: "Glanceable text and prompts pushed from a paired phone — the glasses have no browser, so the apps run on the phone and the step card is mirrored", ua: null },
  // Epson Moverio — binocular see-through. BT-45C sits above BT-45CS, whose
  // "Moverio" alternative is the family fallback (it also catches a BT-40
  // whose BO-IC400 controller announces Moverio).
  "epson-bt-45c": { brand: "Epson", product: "Moverio BT-45C", kind: "Binocular see-through AR", class: "goggle", profile: "seethrough", xr: "none",
    input: IN("touchpad"), safety: SAFE({ ansiZ87: "unverified", helmetMount: true }),
    mount: "Helmet-mounting options; shock and dust resistant configuration", ppe: "Accepts Z87.1-compatible shields per vendor", use: "Hands-free remote guidance and jobsite workflows", ua: /BT-45C\b/i },
  "epson-bt-45cs": { brand: "Epson", product: "Moverio BT-45CS", kind: "Binocular see-through AR, headband with helmet options", class: "goggle", profile: "seethrough", xr: "none",
    input: IN("touchpad"), safety: SAFE({ ansiZ87: "unverified", helmetMount: true }),
    mount: "Adjustable padded headband plus helmet-mounting options; flip-up display", ppe: "Accepts add-on clear or tinted ANSI Z87.1-compatible shields per vendor", use: "Construction supervision, maintenance, training, inspection", ua: /Moverio|BT-45/i },
  "epson-bt-40": { brand: "Epson", product: "Moverio BT-40 / BT-40S", kind: "Binocular see-through AR, USB-C tethered", class: "goggle", profile: "seethrough", xr: "none",
    input: IN("touchpad", { keyboard: true }), safety: SAFE({ ansiZ87: "unverified" }),
    mount: "Glasses form tethered by USB-C to a PC, a phone or the BO-IC400 controller; no helmet mount stated", ppe: "Not sold as safety eyewear; confirm shield options", use: "Training rooms and remote assistance where the glasses tether to a PC or the vendor controller", ua: null },
  // Rokid, Iristick, ThirdEye, Univet, Lenovo A3 — see-through and monocular.
  // MIDAS sits above X2, whose "ThirdEye" alternative is the family fallback.
  "rokid-x-craft": { brand: "Rokid", product: "X-Craft", kind: "Binocular see-through AR, helmet-first, ruggedised", class: "goggle", profile: "seethrough", xr: "none",
    input: IN("voice", { voiceFirst: true }), safety: SAFE({ intrinsicallySafe: true, helmetMount: true }),
    mount: "Designed to attach to industrial safety helmets", ppe: "IP66 and ATEX/IECEx positioning per vendor; verify the certificate for the site's zone", use: "Utilities, energy, rail, aviation, industrial construction", ua: /Rokid|X-?Craft/i },
  "iristick-g2": { brand: "Iristick", product: "Iristick.G2", kind: "Smart safety glasses, monocular display", class: "monocular", profile: "assisted", xr: "none",
    input: IN("voice", { voiceFirst: true }), safety: SAFE({ ansiZ87: "unverified" }),
    mount: "Works with helmets, hats, safety glasses and face shields", ppe: "Safety-glasses form; confirm the rating for the frame bought", use: "First-response communications, field service, assisted procedures", ua: /Iristick/i },
  "thirdeye-midas": { brand: "ThirdEye", product: "MIDAS", kind: "Display embedded in a protective mask", class: "helmet", profile: "seethrough", xr: "none",
    input: IN("voice", { voiceFirst: true }), safety: SAFE({ ansiZ87: "unverified", intrinsicallySafe: "unverified" }),
    mount: "Integrated into the mask", ppe: "The mask's own certification governs; verify decontamination procedure", use: "Firefighters, hazmat, defence, zero-visibility response", ua: /MIDAS/i },
  "thirdeye-x2": { brand: "ThirdEye", product: "X2 MR Glasses", kind: "Binocular mixed-reality glasses", class: "goggle", profile: "seethrough", xr: "none",
    input: IN("voice", { voiceFirst: true, hands: true }), safety: SAFE({ ansiZ87: "unverified" }),
    mount: "Protective-eyewear form; used with helmets by integrators", ppe: "Confirm eye-protection rating with the vendor", use: "EMS, fire and public safety, telemedicine, incident documentation", ua: /ThirdEye|X2 MR/i },
  "univet-visionar": { brand: "Univet Optics", product: "VisionAR", kind: "AR safety glasses", class: "goggle", profile: "seethrough", xr: "none",
    input: IN("voice"), safety: SAFE({ ansiZ87: true }),
    mount: "Safety-glasses form; confirm compatibility with the helmet system", ppe: "Certified to EN166 and ANSI Z87.1+ per vendor", use: "Construction, manufacturing, industrial safety workflows; driven from a paired phone", ua: /Univet|VisionAR/i },
  "lenovo-thinkreality-a3": { brand: "Lenovo", product: "ThinkReality A3", kind: "Binocular see-through smart glasses, USB-C tethered", class: "goggle", profile: "seethrough", xr: "none",
    input: IN("mouse", { keyboard: true }), safety: SAFE({ ansiZ87: "unverified" }),
    mount: "Glasses form tethered by USB-C to a PC or a supported Motorola phone; industrial frame per vendor", ppe: "Confirm the safety-frame option and its rating", use: "PC-tethered virtual screens and phone-tethered guided workflows", ua: null },
  "google-glass-ee2": { brand: "Google", product: "Glass Enterprise Edition 2", kind: "Monocular prism display, discontinued", class: "monocular", profile: "assisted", xr: "none",
    input: IN("touchpad"), safety: SAFE({ ansiZ87: "unverified" }),
    mount: "Frame-mounted pod; third-party safety frames were offered", ppe: "Discontinued in 2023; verify remaining support before procurement", use: "Legacy assisted-reality pilots, checklists, remote expert", ua: null },
  // Mixed reality — optical see-through with room tracking.
  "hololens-2": { brand: "Microsoft", product: "HoloLens 2 Industrial Edition", kind: "Mixed-reality headset", class: "mr", profile: "mr", xr: "ar",
    input: IN("hands", { hands: true, gaze: true }), safety: SAFE({ intrinsicallySafe: "unverified", helmetMount: true }),
    mount: "Hardhat adapter systems; the headset does not replace PPE", ppe: "Industrial Edition rated for clean-room and hazardous-location classes per vendor; verify", use: "BIM overlays, construction QA/QC, digital-twin visualisation, design review", ua: /HoloLens|Windows Mixed Reality/i },
  "magic-leap-2": { brand: "Magic Leap", product: "Magic Leap 2", kind: "Optical see-through AR headset with compute pack", class: "mr", profile: "seethrough", xr: "none",
    input: IN("controllers", { controllers: true, hands: true, gaze: true }), safety: SAFE(),
    mount: "Headset with tethered compute pack; no helmet mount stated", ppe: "Not PPE; worn over safety eyewear only where the fit allows", use: "Design review, guided assembly, clinical and training use; runs on the see-through profile until its browser's WebXR AR is verified", ua: null },
  // Helmets — the display is part of the head protection.
  "xyz-reality-atom": { brand: "XYZ Reality", product: "Atom", kind: "AR built into a certified construction hardhat", class: "helmet", profile: "mr", xr: "none",
    input: IN("buttons"), safety: SAFE({ ansiZ87: "unverified", helmetMount: true }),
    mount: "Integrated hardhat", ppe: "Certified hardhat per vendor", use: "High-precision BIM layout, structural verification; no general web browser — content is delivered through the vendor's platform, so these apps run beside it on a tablet or the vendor's tooling", ua: /XYZ ?Reality|Atom HMD/i },
  "daqri-smart-helmet": { brand: "DAQRI", product: "Smart Helmet", kind: "Integrated AR hardhat and visor (legacy)", class: "helmet", profile: "mr", xr: "none",
    input: IN("buttons"), safety: SAFE({ ansiZ87: "unverified", helmetMount: true }),
    mount: "Integrated", ppe: "Legacy product; verify current sourcing and vendor support before procurement", use: "Pilot reference for smart-hardhat concepts", ua: /DAQRI/i },
  // VR headsets — the training-room devices. Quest 3S, Quest 3 and Quest
  // Pro sit above the generic Quest rule; the Meta Quest Browser announces
  // "OculusBrowser" and the model name. PICO 4 Ultra sits above PICO 4.
  "meta-quest-3s": { brand: "Meta", product: "Quest 3S", kind: "VR headset with colour passthrough", class: "vr", profile: "vr", xr: "both",
    input: IN("controllers", { controllers: true, hands: true }), safety: SAFE(),
    mount: NOT_PPE, ppe: "None", use: "Immersive VR and colour-passthrough AR in the training room; the budget fleet headset", ua: /Quest 3S\b/i },
  "meta-quest-3": { brand: "Meta", product: "Quest 3", kind: "VR headset with colour passthrough", class: "vr", profile: "vr", xr: "both",
    input: IN("controllers", { controllers: true, hands: true }), safety: SAFE(),
    mount: NOT_PPE, ppe: "None", use: "Immersive VR and colour-passthrough AR in the training room", ua: /Quest 3\b/i },
  "meta-quest-pro": { brand: "Meta", product: "Quest Pro", kind: "VR headset with colour passthrough, eye and face tracking", class: "vr", profile: "vr", xr: "both",
    input: IN("controllers", { controllers: true, hands: true }), safety: SAFE(),
    mount: NOT_PPE, ppe: "None", use: "Immersive VR and passthrough AR; its eye tracking is not exposed to the browser", ua: /Quest Pro\b/i },
  "meta-quest": { brand: "Meta", product: "Quest 2 / other Quest browsers", kind: "VR headset with passthrough", class: "vr", profile: "vr", xr: "both",
    input: IN("controllers", { controllers: true, hands: true }), safety: SAFE(),
    mount: NOT_PPE, ppe: "None", use: "Immersive VR training and passthrough AR in the training room", ua: /OculusBrowser|Quest/i },
  "pico-4-ultra-enterprise": { brand: "Pico", product: "Pico 4 Ultra Enterprise", kind: "VR headset with colour passthrough", class: "vr", profile: "vr", xr: "vr",
    input: IN("controllers", { controllers: true, hands: true }), safety: SAFE(),
    mount: NOT_PPE, ppe: "None", use: "Immersive VR in the training room with enterprise device management", ua: /PICO 4 Ultra/i },
  "pico-4-enterprise": { brand: "Pico", product: "Pico 4 Enterprise", kind: "VR headset with colour passthrough", class: "vr", profile: "vr", xr: "vr",
    input: IN("controllers", { controllers: true, hands: true }), safety: SAFE(),
    mount: NOT_PPE, ppe: "None", use: "Immersive VR in the training room with enterprise device management", ua: /PICO 4(?! Ultra)/i },
  "htc-vive-focus-3": { brand: "HTC", product: "Vive Focus 3", kind: "Standalone VR headset", class: "vr", profile: "vr", xr: "none",
    input: IN("controllers", { controllers: true, hands: true }), safety: SAFE(),
    mount: NOT_PPE, ppe: "None", use: "Immersive VR in the training room; swappable battery for all-day classes", ua: null },
  "htc-vive-xr-elite": { brand: "HTC", product: "Vive XR Elite", kind: "Standalone VR headset with colour passthrough", class: "vr", profile: "vr", xr: "none",
    input: IN("controllers", { controllers: true, hands: true }), safety: SAFE(),
    mount: NOT_PPE, ppe: "None", use: "Immersive VR and passthrough in the training room; converts to a glasses form on a tether", ua: null },
  "lenovo-thinkreality-vrx": { brand: "Lenovo", product: "ThinkReality VRX", kind: "Standalone VR headset with colour passthrough", class: "vr", profile: "vr", xr: "none",
    input: IN("controllers", { controllers: true, hands: true }), safety: SAFE(),
    mount: NOT_PPE, ppe: "None", use: "Immersive VR in the training room with enterprise device management", ua: null },
  "varjo-xr-4": { brand: "Varjo", product: "XR-4", kind: "PC-tethered VR headset with video passthrough", class: "vr", profile: "vr", xr: "vr",
    input: IN("controllers", { controllers: true, keyboard: true }), safety: SAFE(),
    mount: NOT_PPE, ppe: "None", use: "High-resolution PC VR for the training room; runs in a desktop WebXR browser over OpenXR, so the page sees a PC user agent", ua: null },
  "apple-vision-pro": { brand: "Apple", product: "Vision Pro", kind: "Spatial computer with video passthrough, no controllers", class: "vr", profile: "hands", xr: "vr",
    input: IN("hands", { hands: true, keyboard: true, gaze: true }), safety: SAFE(),
    mount: NOT_PPE, ppe: "None", use: "Immersive VR in Safari on visionOS driven by look-and-pinch; Safari sends a desktop-Mac user agent, so pin it with ?device=apple-vision-pro", ua: null },
};

const SYNTHETIC = {
  "generic-assisted": { brand: "Unknown", product: "Small monocular display", kind: "Assisted reality", class: "monocular", profile: "assisted", xr: "none", input: IN("voice", { voiceFirst: true }), safety: SAFE({ ansiZ87: "unverified", intrinsicallySafe: "unverified" }) },
  desktop: { brand: "—", product: "Desktop, tablet or phone browser", kind: "Flat screen", class: "flat", profile: "desktop", xr: "unknown", input: IN("mouse", { keyboard: true }), safety: SAFE() },
};

/** Which device this page is on: the URL wins, then the user agent, then a
 *  small-monocular screen heuristic, else desktop. */
export function detectDevice({ ua = typeof navigator !== "undefined" ? navigator.userAgent : "", width = typeof screen !== "undefined" ? screen.width : 1920, height = typeof screen !== "undefined" ? screen.height : 1080, search = typeof location !== "undefined" ? location.search : "" } = {}) {
  const q = new URLSearchParams(search).get("device");
  if (q && DEVICES[q]) return { id: q, ...DEVICES[q], how: "url" };
  for (const [id, d] of Object.entries(DEVICES)) if (d.ua?.test(ua)) return { id, ...d, how: "user agent" };
  if (width <= 900 && height <= 540) return { id: "generic-assisted", ...SYNTHETIC["generic-assisted"], how: "screen size" };
  return { id: "desktop", ...SYNTHETIC.desktop, how: "default" };
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

/** The input style in one clause, from a device's `input` record: what the
 *  Controls panel and the intro say the learner drives the station with. */
export function describeInput(input) {
  if (!input) return "";
  if (input.voiceFirst) return "voice-first";
  switch (input.primary) {
    case "hands": return input.gaze ? "hands and gaze" : "hands";
    case "controllers": return input.hands ? "controllers or hands" : "controllers";
    case "mouse": return input.keyboard ? "mouse, touch and keyboard" : "mouse or touch";
    case "touchpad": return input.keyboard ? "touchpad or keyboard" : "touchpad";
    case "buttons": return "buttons";
    case "voice": return "voice";
    default: return String(input.primary);
  }
}

/** One line for the intro: what was detected, how it will run and what
 *  drives it. */
export function describeDevice(device, profile) {
  const name = device.brand === "—" ? device.product : `${device.brand} ${device.product}`;
  const drive = describeInput(device.input);
  return `${name} — ${profile.label.toLowerCase()} profile${drive ? `, ${drive}` : ""} (${device.how}).`;
}
