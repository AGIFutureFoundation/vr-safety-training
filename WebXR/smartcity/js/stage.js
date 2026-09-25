import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import { box, cyl, ball, torus, group, decal, mat, gradientFill, noiseTexture, ownMaterial, mergeStatic } from "../../shared/kit.js";
import { CITY, skyline, surfaceTexture, texturedMat, pavingFace, deckPlateFace } from "./citykit.js";
import { buildApron, APRON } from "./apron.js";
import { districtFor, selfLight } from "./districts.js";
import { buildWeather, weatherFor } from "../../shared/weather.js";
import { reducedMotion } from "../../shared/a11y.js";
import { buildInterior, interiorFor } from "./interiors.js";
import { stationSignage } from "../../shared/signage.js";

// Flagship banner copy, product-owner-specified: SmartCiti.X is the visitor-facing
// simulator brand; AGI Corp and Visko are the umbrella/co-brands it is built and run under.
const MARQUEE_LINE = "SMARTCITI.X ~VR SIMULATORS";
const MARQUEE_SUB = "POWERED BY AGI CORP & VISKO";

/** Flagship entrance marquee: two support posts, a lit beam, a canvas wordmark and a
 *  small rotating holo-emblem. Built once; the returned refs are cheap to animate
 *  per-frame (no allocations, just property tweaks on cached materials). */
function buildMarquee(g) {
  const spanW = 6.2, postH = 4.6, postR = 0.16, mz = -9.6;
  const marquee = group(g, 0, 0, mz);
  for (const sx of [-1, 1]) {
    cyl(marquee, postR, postR * 1.15, postH, sx * spanW / 2, postH / 2, 0, 0x232b33, { rough: 0.4, metal: 0.65, seg: 14 });
    box(marquee, postR * 2.4, 0.22, postR * 2.4, sx * spanW / 2, 0.11, 0, 0x1a2129, { rough: 0.6, metal: 0.4 });
  }
  box(marquee, spanW + 0.5, 0.5, 0.4, 0, postH + 0.05, 0, 0x171f28, { rough: 0.45, metal: 0.55 });
  const trim = box(marquee, spanW + 0.3, 0.03, 0.05, 0, postH - 0.22, 0.21, CITY.accent,
    { emissive: CITY.accent, ei: 1.6, rough: 0.4, cast: false });

  // The sign is a 3.7:1 panel; the canvas takes that aspect, so nothing here
  // is drawn at a size it cannot fit. Every line is measured and shrunk to the
  // panel's width before it is drawn — the wordmark used to be set at a fixed
  // size that was wider than its canvas, and read "RTCITI.X ~VR SIMULA" from
  // every spawn point in the roster.
  const FAM_C = "'Barlow Condensed', 'Arial Narrow', Arial, sans-serif";
  const FAM = "'Barlow', Arial, sans-serif";
  const sign = decal(marquee, spanW - 0.4, 1.55, 0, postH - 1.0, 0.22, (cx, cw, ch) => {
    gradientFill(cx, cw, ch, [[0, "#04141c"], [1, "#0b2733"]]);
    noiseTexture(cx, cw, ch, { density: 260, alpha: 0.03, tone: "255,255,255" });
    const hair = Math.max(2, Math.round(ch * 0.012));
    cx.strokeStyle = "rgba(143,216,255,0.32)"; cx.lineWidth = hair;
    cx.strokeRect(hair * 1.5, hair * 1.5, cw - hair * 3, ch - hair * 3);
    const maxW = cw * 0.88;
    const fit = (text, weight, family, px) => {
      cx.font = `${weight} ${px}px ${family}`;
      const w = cx.measureText?.(text)?.width;
      const fitted = w && w > maxW ? Math.floor(px * maxW / w) : px;
      cx.font = `${weight} ${fitted}px ${family}`;
    };
    cx.textAlign = "center"; cx.textBaseline = "middle";
    try { cx.letterSpacing = "0.14em"; } catch { /* older canvas */ }
    fit(MARQUEE_SUB, 600, FAM_C, Math.round(ch * 0.115));
    cx.fillStyle = "#8fd8ff";
    cx.fillText(MARQUEE_SUB, cw / 2, ch * 0.165);
    try { cx.letterSpacing = "0.02em"; } catch { /* older canvas */ }
    fit(MARQUEE_LINE, 800, FAM_C, Math.round(ch * 0.40));
    cx.fillStyle = "#f4fbff";
    cx.fillText(MARQUEE_LINE, cw / 2, ch * 0.50);
    cx.fillStyle = CITY.accentCss;
    cx.fillRect(cw * 0.22, ch * 0.72, cw * 0.56, Math.max(2, Math.round(ch * 0.009)));
    try { cx.letterSpacing = "0.12em"; } catch { /* older canvas */ }
    fit("FLAGSHIP AR / VR TRAINING SIMULATORS", 500, FAM, Math.round(ch * 0.095));
    cx.fillStyle = CITY.accentCss;
    cx.fillText("FLAGSHIP AR / VR TRAINING SIMULATORS", cw / 2, ch * 0.86);
  }, { px: 2048, glow: true, ei: 0.85 });

  const emblem = group(marquee, 0, postH + 0.85, 0);
  torus(emblem, 0.4, 0.03, 0, 0, 0, CITY.accent, { emissive: CITY.accent, ei: 2, rough: 0.4, cast: false, seg: 8, seg2: 40 });
  const ring2 = torus(emblem, 0.28, 0.02, 0, 0, 0, CITY.violet, { emissive: CITY.violet, ei: 1.8, rough: 0.4, cast: false, seg: 6, seg2: 32 });
  ring2.rotation.x = Math.PI / 2.4;
  ball(emblem, 0.09, 0, 0, 0, 0xeaf6fb, { emissive: 0xeaf6fb, ei: 2.4, rough: 0.3 });
  const beam = new THREE.PointLight(CITY.accent, 2.2, 9, 2);
  beam.position.set(0, postH - 0.4, 0.4);
  marquee.add(beam);

  // The animate loop writes trim.material.emissiveIntensity every frame, and
  // mat() hands out shared materials — so this one has to be its own.
  ownMaterial(trim);
  return { sign, emblem, ring2, trim };
}

// The stage is everything that is *not* the training station.
//
// In AR the learner's own room is the environment, so the stage is almost
// nothing: passthrough behind, and a faint floor grid to anchor the station.
// In VR and on a flat screen there is no real room to stand in, so the same
// station is dropped into a digital-twin plaza with a city skyline around it,
// and a district for the station's trade category on the horizon between the
// two (districts.js): pylons behind a substation, a container terminal behind
// a lashing deck, a truss arch behind a company switch, with the sky, fog and
// light-mast tint to match.

export const STAGE_MODES = ["ar", "vr", "flat"];

// Time of day for the plaza: the districts are authored for night, and a
// training hall running a day shift can ask for dusk or day with
// `?time=day|dusk|night`. Day lifts the sky and fog to a pale overcast,
// turns the key light up and the masts down; dusk is the sodium hour in
// between. Emissive props keep their glow (a lit window at noon is a small
// price for not rebuilding every district twice).
export const TIMES_OF_DAY = ["night", "dusk", "day"];
const TIME = {
  night: { sky: null, fog: null, hemi: null, key: [0xd6e4f0, 1.3], mast: 1.0, glow: 0.34, hemiI: 2.0, ambient: 0.55, lift: 1.9 },
  dusk: { sky: 0x4a3a4c, fog: 0x5c4856, hemi: [0xe6b98f, 0x3a3240], key: [0xffb27a, 1.8], mast: 0.8, glow: 0.2, hemiI: 1.8, ambient: 0.45, lift: 1 },
  day: { sky: 0x9fb8cc, fog: 0xb8c9d8, hemi: [0xe9f0f6, 0x7a8590], key: [0xfff6e8, 2.6], mast: 0.15, glow: 0.04, hemiI: 1.6, ambient: 0.35, lift: 1 },
};
/** Lift a dark authored colour toward a readable one (night skies and fog). */
function lift(hex, k) {
  const c = new THREE.Color(hex);
  c.r = Math.min(1, c.r * k + 0.02); c.g = Math.min(1, c.g * k + 0.025); c.b = Math.min(1, c.b * k + 0.035);
  return c;
}
export function timeOfDay() {
  const t = typeof location !== "undefined" ? new URLSearchParams(location.search).get("time") : null;
  return TIMES_OF_DAY.includes(t) ? t : "night";
}

// `opts.skyline` / `opts.district` false leave the horizon unbuilt: a device
// profile that cannot carry it (shared/devices.js) or a real-world
// environment that replaces it (shared/environment.js). They are skipped
// here rather than hidden afterwards because mergeStatic() folds the
// scenery into shared meshes, after which hiding the source groups does
// nothing.
//
// `opts.station` is the station the stage is being built for (the sim
// module, or anything with id, category and certification). With it the
// stage stands the station's union sign beside the pad and, when the
// station's mesh count leaves room under the headset budget, the safety sign
// for its category's dominant hazard (shared/signage.js). Without it — the
// hub, a district preview — no signs are built.
export function buildStage(root, mode, scene, accent = CITY.accent, category = null, weather = null, indoor = null, opts = {}) {
  const g = group(root);
  const ar = mode === "ar";
  const district = districtFor(category);
  const tod = TIME[timeOfDay()];
  const accentCss = `#${accent.toString(16).padStart(6, "0")}`;
  // Built after the merge below so the signs stay their own meshes: the
  // union sign repaints itself when a licensed logo loads, and fit() may
  // take the safety sign down once the station's own count is known.
  const signsFor = (stageRoot, where = {}) => (opts.station
    ? stationSignage(stageRoot, opts.station, { ar, accentCss, meshesUsed: opts.station.meshes ?? null, ...where })
    : null);

  if (ar) {
    // Passthrough: no sky, no ground, nothing that would paint over the room.
    scene.background = null;
    scene.fog = null;
    // A low-contrast grid disc so the station still feels placed on the floor.
    for (let ring = 1; ring <= 3; ring++) {
      torus(g, ring * 0.9, 0.004, 0, 0.004, 0, CITY.accent,
        { emissive: CITY.accent, ei: 0.5, rough: 0.4, cast: false, seg: 6, seg2: 48 });
    }
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2;
      const spoke = box(g, 0.004, 0.004, 2.7, Math.sin(a) * 1.35, 0.004, Math.cos(a) * 1.35,
        CITY.accent, { emissive: CITY.accent, ei: 0.35, rough: 0.4, cast: false });
      spoke.rotation.y = a;
    }
    root.add(new THREE.HemisphereLight(0xdfeaf2, 0x6a7480, 1.5));
    const key = new THREE.DirectionalLight(0xffffff, 0.7);
    key.position.set(2.5, 5, 3);
    root.add(key);
    // No apron in AR: the learner's own room is the site, and a fence line
    // through their furniture helps nobody. The union sign still stands off
    // the pad — it is the one piece of the site a station carries everywhere.
    const signage = signsFor(g);
    return { root: g, ar, roam: null, spawn: null, signage, weather: { kind: "clear", label: "Passthrough", note: "In AR the learner's own room is the environment; the stage adds nothing." }, animate() {} };
  }

  // A station that is indoors gets a room, not a plaza with a skyline behind
  // it. The weather still exists — it is what the rooflights are showing —
  // and the hour still sets how bright they are.
  const interiorStyle = interiorFor(indoor);
  if (interiorStyle) {
    scene.background = new THREE.Color(0x0b0e13);
    scene.fog = new THREE.Fog(0x0b0e13, 26, 70);
    const wxIn = buildWeather(g, scene, weatherFor(weather));
    const daylight = { night: 0.06, dusk: 0.22, day: 0.7 }[timeOfDay()] ?? 0.06;
    const room = buildInterior(g, indoor, { accent, daylight, weatherKind: wxIn.kind });
    // Indoors the weather particles belong outside the shell; keep only its
    // label and note, which are what the learner is actually told.
    wxIn.root.visible = false;
    // An interior is already a walkable space; the learner may use all of it
    // up to the walls, and they start at the door rather than mid-floor.
    const half = Math.min(room?.w ?? 12, room?.d ?? 12) / 2 - 1.1;
    const doorSpawn = { x: 0, z: Math.max(2.6, (room?.d ?? 12) / 2 - 1.6), ry: 0 };
    return {
      root: g, ar, indoor, signage: signsFor(g, { indoor: true, spawn: doorSpawn }),
      roam: Math.max(3.4, half),
      spawn: doorSpawn,
      weather: { kind: wxIn.kind, label: wxIn.label, note: wxIn.note },
      animate(t, dt = 0.016) {
        if (reducedMotion()) return;
        room?.animate(t, dt);
      },
    };
  }

  // A district that is a whole scene rather than a horizon (districts.js:
  // golden-gate-deck, bay-underwater) says so with `plaza: false`. It brings
  // its own ground, so the plaza disc, masts, marquee and site apron are not
  // built under it; it may carry its own sky for every hour (`skyByTime`),
  // its own fog distances (`fogRange`), a default or forced weather, its own
  // spawn and roam, and a camera far plane (`far`). It is built even where a
  // device profile drops the horizon, because without it there is no floor.
  const scenic = district.plaza === false;
  const hour = timeOfDay();
  if (district.skyByTime) {
    const c = district.skyByTime[hour] ?? district.skyByTime.night;
    scene.background = new THREE.Color(c.sky);
    scene.fog = new THREE.Fog(new THREE.Color(c.fog), ...(district.fogRange ?? [22, 64]));
  } else {
    scene.background = tod.sky !== null ? new THREE.Color(tod.sky) : lift(district.sky, tod.lift);
    // A district on the horizon needs the fog held back past it (r ≈ 20–46).
    const range = district.fogRange ?? (district.build ? [36, 96] : [22, 64]);
    scene.fog = new THREE.Fog(tod.fog !== null ? new THREE.Color(tod.fog) : lift(district.fog, tod.lift), range[0], range[1]);
  }

  // Plaza deck: cast-concrete paving tiled across the disc (the cylinder cap's
  // planar UVs make a repeating texture read as a real slab grid), with a
  // deck-plate walk ring around the perimeter so the edge reads as a
  // different material rather than the same colour to the horizon.
  //
  // NOTE FOR STATION AUTHORS: this disc is solid, 15m in radius, and occupies
  // y from -0.30 to 0. Anything a station builds below that is under a slab
  // and cannot be seen — though it can still be clicked, because picking
  // raycasts against state.selectables rather than the scene, so no checker
  // and no scripted drive will ever tell you. The stations with below-grade
  // content that read correctly (trench-box, valve-vault, hot-tap) all do the
  // same thing: raise a local pad or apron above the deck and cut the
  // excavation into that, so the hole has a visible rim. A station with
  // nothing to raise — a ship's side, a quay — builds its outboard
  // arrangement above plaza level instead and accepts the compressed
  // freeboard. Either way, look at a spawn screenshot before you believe it.
  if (!scenic) {
    const pavingTex = surfaceTexture((cx, w, h) => pavingFace(cx, w, h, { tiles: 4 }), { repeat: 7, px: 512 });
    const deck = cyl(g, 15, 15, 0.3, 0, -0.15, 0, 0x151b22, { rough: 0.55, metal: 0.2, seg: 64 });
    deck.material = texturedMat(pavingTex, { rough: 0.9, metal: 0.04, color: 0xd8dde3 });
    deck.receiveShadow = true;
    const plateTex = surfaceTexture((cx, w, h) => deckPlateFace(cx, w, h), { repeat: 22, px: 256 });
    const walkRing = cyl(g, 13.6, 13.6, 0.04, 0, 0.02, 0, 0x232b33, { rough: 0.6, metal: 0.5, seg: 64 });
    walkRing.material = texturedMat(plateTex, { rough: 0.55, metal: 0.55, color: 0xcfd6dd });
    walkRing.receiveShadow = true;
    cyl(g, 11.8, 11.8, 0.05, 0, 0.025, 0, 0x121920, { rough: 0.9, metal: 0.05, seg: 64, cast: false })
      .material = texturedMat(surfaceTexture((cx, w, h) => pavingFace(cx, w, h, { tiles: 3, base: "#1c242d", base2: "#171e26" }), { repeat: 5, px: 512 }), { rough: 0.9, metal: 0.04, color: 0xd0d6dc });
    // Station-accent glow ring and an inner hazard-yellow kerb line: the ring
    // takes the current station's colour so each sim's plaza is subtly its own.
    torus(g, 12.6, 0.05, 0, 0.03, 0, accent,
      { emissive: accent, ei: 1.6, rough: 0.4, cast: false, seg: 6, seg2: 72 });
    torus(g, 11.75, 0.02, 0, 0.055, 0, CITY.hiVis,
      { emissive: CITY.hiVis, ei: 0.6, rough: 0.5, cast: false, seg: 6, seg2: 72 });

    // Perimeter light masts.
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2 + Math.PI / 8;
      const mx = Math.sin(a) * 11.5, mz = Math.cos(a) * 11.5;
      cyl(g, 0.055, 0.075, 5.2, mx, 2.6, mz, 0x2b333c, { rough: 0.5, metal: 0.6, seg: 12 });
      const head = box(g, 0.5, 0.09, 0.26, mx, 5.2, mz, 0x2b333c, { rough: 0.5, metal: 0.6 });
      head.rotation.y = a;
      const lamp = box(g, 0.42, 0.03, 0.2, mx, 5.14, mz, district.mast,
        { emissive: district.mast, ei: 1.8 * tod.mast, rough: 0.4, cast: false });
      lamp.rotation.y = a;
      const light = new THREE.PointLight(district.mast, 1.6 * tod.mast, 16, 2);
      light.position.set(mx * 0.82, 4.6, mz * 0.82);
      g.add(light);
    }
  }

  // `skyline: false` on a district leaves the ring out entirely (there is no
  // city on the bottom of the bay); `skyline: {…}` passes its own gap, base,
  // radius and height to the ring (a city seen from a bridge deck).
  const skyOpts = district.skyline === false ? null : { gap: district.skylineGap ?? null, ...(district.skyline ?? {}) };
  const sky = opts.skyline === false || !skyOpts ? null : skyline(g, skyOpts);
  if (sky) sky.name = "skyline";
  const marquee = scenic ? null : buildMarquee(g);
  // Weather goes on after the sky and fog are set for the hour, because it
  // scales both; the stage hands its label and note back to the app. A
  // district may name the weather it stands in when the station names none
  // (`weather`), or insist on its own whatever the station or the URL asks
  // (`forceWeather`): there is no rain on the bottom of the bay.
  const wxKind = district.forceWeather ? district.weather : weatherFor(weather ?? district.weather);
  const wx = buildWeather(g, scene, wxKind, { wetDeck: !scenic });
  let districtAnimate = null;
  if (district.build && (opts.district !== false || scenic)) {
    const dg = group(g);
    // themeScene() hides groups named "district" on a profile with no
    // horizon; a scenic district is the floor, so it goes under another name.
    dg.name = scenic ? "district-scene" : "district";
    districtAnimate = district.build(dg, accent, { time: hour, weather: wx.kind });
    // A scenic district lights itself; the blanket self-glow would clone
    // every material it touches, and a cloned material cannot be merged.
    if (!scenic) selfLight(dg, tod.glow);
  }

  const key = new THREE.DirectionalLight(district.key ?? tod.key[0], tod.key[1] * wx.lightScale);
  key.position.set(4, 9, 5);
  key.castShadow = true;
  key.shadow.mapSize.set(2048, 2048);
  key.shadow.camera.left = -9; key.shadow.camera.right = 9;
  key.shadow.camera.top = 9; key.shadow.camera.bottom = -9;
  key.shadow.bias = -0.0008;
  g.add(key);
  const hemi = district.skyByTime ? district.hemi : tod.hemi ?? [lift(district.hemi[0], 1.35).getHex(), lift(district.hemi[1], 1.6).getHex()];
  g.add(new THREE.HemisphereLight(hemi[0], hemi[1], tod.hemiI));
  // A flat fill so no face of a station ever goes to black — the districts and
  // the station props are authored bright enough to read at a glance.
  g.add(new THREE.AmbientLight(0xb8c8d8, tod.ambient));
  // A soft overhead wash in the station's own accent — the one light that
  // changes per sim, so the same plaza reads warm for a boiler room and cool
  // for a chiller plant without rebuilding anything.
  const wash = new THREE.PointLight(accent, 1.6 * wx.lightScale, 12, 2);
  wash.position.set(0, 4.2, 0.6);
  g.add(wash);
  // Cool rim from behind the marquee so silhouettes separate from the skyline.
  const rim = new THREE.DirectionalLight(0x6fb8ff, 0.55);
  rim.position.set(-3, 4, -8);
  g.add(rim);

  // The site around the work: gate, sign-in, laydown, crew truck, muster point
  // and waste station, spread across ground that used to be empty pavement the
  // learner was not allowed to walk on anyway. See apron.js.
  // A scenic district is its own site (a lane closure on the deck, a dive
  // stage on the bottom), so it gets no apron; it keeps the apron's gate
  // spawn and roam unless it names its own.
  // `opts.apron === false` leaves the site apron out: the kit gallery lays
  // vehicles across the whole plaza and a fence line through them helps nobody.
  const apron = scenic || opts.apron === false ? null : buildApron(g, { accent, accentCss: `#${accent.toString(16).padStart(6, "0")}` });
  const spawn = district.spawn ?? apron?.spawn ?? { x: Math.sin(APRON.gateBearing) * APRON.spawnRadius, z: Math.cos(APRON.gateBearing) * APRON.spawnRadius, ry: APRON.gateBearing };
  const roam = district.roam ?? apron?.roam ?? APRON.fence - 0.7;

  const beacons = sky?.userData.beacons ?? [];

  // Collapse the scenery into one mesh per material. An outdoor scene was
  // measuring 518 draw calls with 652 visible meshes; almost all of that is
  // the skyline, the district, the masts and the site apron, none of which
  // moves or is ever clicked. The station itself is never merged — it is the
  // part the procedure touches. See mergeStatic() in shared/kit.js.
  //
  // The beacons and the marquee trim animate their own materials and carry
  // the ownMaterial flag, so the merge steps over them and they still pulse.
  const merged = mergeStatic(g);
  const signage = signsFor(g);

  return {
    root: g, ar, roam, spawn, merged, signage, far: district.far ?? null,
    // A district may carry a HUD chip of its own: gym-court's scoreboard
    // (react-ui.js courtReadout). Only its labels come from here.
    scoreboard: district.scoreboard ?? null,
    // A forced district weather reports the district's own conditions.
    weather: district.forceWeather && district.weatherLabel
      ? { kind: district.weatherKind ?? wx.kind, label: district.weatherLabel, note: district.weatherNote ?? wx.note }
      : { kind: wx.kind, label: wx.label, note: wx.note },
    animate(t, dt = 0.016) {
      // A learner who asked their system for less animation gets a still
      // plaza: the station itself still moves, because the procedure needs
      // it, but the scenery, the weather and the beacons hold.
      if (reducedMotion()) return;
      // Cheap flagship motion: rotate the holo-emblem, pulse its inner ring and the
      // marquee trim, and blink a handful of rooftop beacons — property tweaks on
      // already-built meshes/materials, nothing allocated per frame.
      if (marquee) {
        marquee.emblem.rotation.y = t * 0.5;
        marquee.ring2.rotation.z = t * 0.8;
        marquee.trim.material.emissiveIntensity = 1.4 + Math.sin(t * 1.6) * 0.3;
      }
      for (const beacon of beacons) {
        beacon.material.emissiveIntensity = 1.1 + Math.max(0, Math.sin(t * 1.4 + beacon.userData.phase)) * 1.4;
      }
      if (districtAnimate) districtAnimate(t, dt);
      apron?.animate(t, dt);
      wx.animate(t, dt);
    },
  };
}
