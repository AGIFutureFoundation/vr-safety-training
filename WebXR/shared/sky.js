import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import { WEATHER, WEATHER_KINDS } from "./weather.js";

// The sky over the open worlds: one procedural dome shared by Bay World
// (bayworld/js/world.js), Fairway Park (fairway/js/world.js) and, when they
// exist, the regatta and the dive game. shared/weather.js is the plaza-scale
// weather (rain, dust, a wet deck); this is the horizon it happens under —
// the gradient by time band, a sun or moon disc, a star field at night and
// a cloud layer whose cover follows WEATHER[kind].sky.
//
// Three entry points:
//   skyFor(time, weather)  the pure recipe { sky, fog, fogDensity, sunDir,
//                          wind: { speed, dir }, visibility } every open
//                          world reads, so a scene's fog, the dome, a game's
//                          own wind and a HUD all agree on one set of numbers.
//   buildSky(parent, o)    the dome itself: a few hundred vertices, animated
//                          by property writes only (cloud drift, star fade).
//   advanceSky(state, dt)  a slow day cycle and a weather drift (clear →
//                          overcast → fog → wind → clear) with an event hook.
//
// Hook for games not in every worktree: the regatta and the dive game read
// skyFor(time, weather) for their own fog, wind and visibility and call
// buildSky() on their own root; nothing here imports them, and nothing in
// them is edited from here. `time` is a bucket ("day" | "dusk" | "night") or
// a clock hour (0–24), mapped by skyTimeBucket() below with the same
// thresholds bayworld/js/world.js's bwHourBucket() uses.
//
// Every top-level name here is prefixed sky…/SKY_… because the bundler
// (tools/bundle_webxr.py) concatenates every module into one scope.

/** The dome's own budget (checked by tools/check_sky.mjs): meshes after the
 *  build, and vertices across the dome, the discs, the stars and the clouds. */
export const SKY_BUDGET = { meshes: 16, vertices: 900, clouds: 10, stars: 240 };

/** Zenith, horizon and fog colours plus a base fog density per time band. */
const SKY_TIME = {
  day: { zenith: 0x4f8fd6, horizon: 0xbfdcf2, fog: 0xbfd6ea, density: 0.0028, sun: 0xfff3c8, sunI: 1, moonI: 0, stars: 0 },
  dusk: { zenith: 0x2e2f5c, horizon: 0xf0a56a, fog: 0x8a6a70, density: 0.0034, sun: 0xffb27a, sunI: 0.8, moonI: 0.3, stars: 0.35 },
  night: { zenith: 0x05080f, horizon: 0x16243a, fog: 0x0d1826, density: 0.004, sun: 0xdfe8f5, sunI: 0, moonI: 1, stars: 1 },
};
const SKY_BANDS = Object.keys(SKY_TIME);

/** The drift the open worlds run when nothing else sets the weather. */
export const SKY_DRIFT = ["clear", "overcast", "fog", "wind", "clear"];

/** Continuous hour → the discrete band the recipe table understands. */
export function skyTimeBucket(time) {
  if (typeof time === "string") return SKY_BANDS.includes(time) ? time : "day";
  const h = ((Number(time) % 24) + 24) % 24;
  if (!Number.isFinite(h)) return "day";
  if (h >= 6 && h < 18) return "day";
  if ((h >= 18 && h < 20) || (h >= 5 && h < 6)) return "dusk";
  return "night";
}

function skyKind(weather) {
  return WEATHER_KINDS.includes(weather) ? weather : "clear";
}

/** 0xRRGGBB scaled by k (clamped), the same tint helper bayworld.js keeps
 *  privately — repeated here so this module imports nothing but weather.js. */
function skyShade(c, k) {
  const r = Math.max(0, Math.min(255, Math.round(((c >> 16) & 255) * k)));
  const g = Math.max(0, Math.min(255, Math.round(((c >> 8) & 255) * k)));
  const b = Math.max(0, Math.min(255, Math.round((c & 255) * k)));
  return (r << 16) | (g << 8) | b;
}
function skyMix(a, b, t) {
  const u = Math.max(0, Math.min(1, t));
  const ch = (s) => Math.round(((a >> s) & 255) * (1 - u) + ((b >> s) & 255) * u);
  return (ch(16) << 16) | (ch(8) << 8) | ch(0);
}

/** Cloud cover 0..1 from a weather kind's own `sky` (brightness) and `fog`
 *  factors: clear 0, overcast a third, rain most, storm full. Fog itself
 *  has no cloud deck — its sky factor is above one — the fog density
 *  carries it instead. */
export function skyCloudCover(weather) {
  const w = WEATHER[skyKind(weather)];
  return Math.max(0, Math.min(1, (1 - w.sky) * 3 + (1 - w.fog) * 0.5));
}

/**
 * The one recipe for a time and a weather:
 *   sky         0xRRGGBB, the background/horizon colour
 *   fog         0xRRGGBB, the fog colour
 *   fogDensity  for THREE.FogExp2 (per metre)
 *   sunDir      unit vector toward the sun (or, at night, the moon)
 *   wind        { speed (m/s), dir (radians, 0 = +z) }
 *   visibility  metres, roughly where fog hides a large object
 *   band, kind, label, cover
 * Pure: the same inputs always return the same numbers.
 */
export function skyFor(time, weather) {
  const band = skyTimeBucket(time);
  const kind = skyKind(weather);
  const t = SKY_TIME[band], w = WEATHER[kind];
  let sky = skyShade(skyMix(t.horizon, t.zenith, 0.35), w.sky);
  let fog = skyShade(t.fog, Math.min(1, w.sky));
  if (w.tint !== undefined) { sky = skyMix(sky, w.tint, 0.55); fog = skyMix(fog, w.tint, 0.6); }
  const fogDensity = Math.min(0.05, t.density / w.fog);
  const visibility = Math.max(50, Math.min(5000, Math.round(3 / fogDensity)));
  // Sun high and south-west by day, low in the west at dusk, the moon
  // high-ish and east by night.
  const raw = band === "day" ? [0.45, 0.78, 0.35] : band === "dusk" ? [0.85, 0.16, 0.3] : [-0.35, 0.62, -0.5];
  const len = Math.hypot(...raw);
  const sunDir = { x: raw[0] / len, y: raw[1] / len, z: raw[2] / len };
  const speed = Math.round((1.5 + w.gust * 9) * 10) / 10;
  const dir = ((WEATHER_KINDS.indexOf(kind) * 0.9 + 0.4) % (Math.PI * 2));
  return { band, kind, label: w.label, cover: skyCloudCover(kind), sky, fog, fogDensity, sunDir, wind: { speed, dir }, visibility };
}

/** A compass word for a wind direction (radians, 0 = +z = north here). */
export function skyCompass(dir) {
  const names = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
  const i = Math.round((((dir % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2)) / (Math.PI / 4)) % 8;
  return names[i];
}

// ------------------------------------------------------------------ dome

/** Vertex-colour the dome by height: horizon colour at the rim, zenith at
 *  the top. Guarded like bayworld.js's bwTerrain(): the headless stub has
 *  no real attribute API, and there the dome simply stays one colour. */
function skyPaintDome(geo, zenith, horizon) {
  const pos = geo.attributes?.position;
  if (!pos || typeof pos.getY !== "function" || typeof pos.count !== "number") return false;
  const colours = new Float32Array(pos.count * 3);
  const a = new THREE.Color(horizon), b = new THREE.Color(zenith);
  for (let i = 0; i < pos.count; i++) {
    const k = Math.max(0, Math.min(1, pos.getY(i)));
    const u = Math.pow(k, 0.6);
    colours[i * 3] = a.r + (b.r - a.r) * u;
    colours[i * 3 + 1] = a.g + (b.g - a.g) * u;
    colours[i * 3 + 2] = a.b + (b.b - a.b) * u;
  }
  const Attr = THREE.Float32BufferAttribute ?? THREE.BufferAttribute;
  geo.setAttribute("color", new Attr(colours, 3));
  const c = geo.attributes?.color;
  if (c) c.needsUpdate = true;
  return true;
}

function skyDisc(parent, radius, colour) {
  const geo = new THREE.CircleGeometry(radius, 24);
  const m = new THREE.MeshBasicMaterial({ color: colour, fog: false, transparent: true, opacity: 1, depthWrite: false });
  m.userData.ownMaterial = true;
  const mesh = new THREE.Mesh(geo, m);
  mesh.userData.noMerge = true;
  mesh.frustumCulled = false;
  parent.add(mesh);
  return mesh;
}

/**
 * Build the sky dome.
 *   parent  the world's root group (the dome is freed with it)
 *   o       { time, weather, radius = 600 }
 * Returns { root, set(time, weather), animate(t, dt, eye), recipe, vertices,
 * meshCount }. `eye` is a camera or any { position } — the dome follows it
 * so the horizon never comes within the far plane on a world wider than the
 * dome. Everything after the build is a property write: cloud positions and
 * opacities, disc positions, star opacity.
 */
export function buildSky(parent, o = {}) {
  const radius = o.radius ?? 600;
  const root = new THREE.Group();
  root.name = "sky";
  root.userData.sky = true;
  parent.add(root);
  let vertices = 0;

  // The dome: a sphere seen from inside, vertex-coloured by height.
  const domeGeo = new THREE.SphereGeometry(radius, 24, 12);
  vertices += 25 * 13;
  const domeMat = new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.BackSide ?? 1, fog: false, depthWrite: false, vertexColors: true });
  domeMat.userData.ownMaterial = true;
  const dome = new THREE.Mesh(domeGeo, domeMat);
  dome.userData.noMerge = true;
  dome.frustumCulled = false;
  dome.renderOrder = -10;
  root.add(dome);

  const sun = skyDisc(root, radius * 0.06, 0xfff3c8); vertices += 26;
  const moon = skyDisc(root, radius * 0.035, 0xdfe8f5); vertices += 26;
  sun.renderOrder = -9; moon.renderOrder = -9;

  // Stars: one point cloud over the upper hemisphere, faded by the band.
  const starCount = SKY_BUDGET.stars;
  const starPos = new Float32Array(starCount * 3);
  let seed = 7;
  const rnd = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
  for (let i = 0; i < starCount; i++) {
    const az = rnd() * Math.PI * 2, el = 0.08 + rnd() * 1.4;
    const r = radius * 0.96;
    starPos[i * 3] = Math.cos(el) * Math.cos(az) * r;
    starPos[i * 3 + 1] = Math.sin(el) * r;
    starPos[i * 3 + 2] = Math.cos(el) * Math.sin(az) * r;
  }
  vertices += starCount;
  const starGeo = new THREE.BufferGeometry();
  const Attr = THREE.Float32BufferAttribute ?? THREE.BufferAttribute;
  starGeo.setAttribute("position", new Attr(starPos, 3));
  const starMat = new THREE.PointsMaterial({ color: 0xeef3ff, size: 2.2, fog: false, transparent: true, opacity: 0, depthWrite: false, sizeAttenuation: false });
  starMat.userData.ownMaterial = true;
  const stars = new THREE.Points(starGeo, starMat);
  stars.frustumCulled = false;
  stars.renderOrder = -9;
  root.add(stars);

  // Clouds: a handful of flat quads at cloud height, drifting with the wind,
  // their opacity the weather kind's cover.
  const clouds = [];
  const cloudMat = new THREE.MeshBasicMaterial({ color: 0xffffff, fog: false, transparent: true, opacity: 0, depthWrite: false, side: THREE.DoubleSide ?? 2 });
  cloudMat.userData.ownMaterial = true;
  const cloudY = radius * 0.28;
  for (let i = 0; i < SKY_BUDGET.clouds; i++) {
    const w = radius * (0.18 + rnd() * 0.22), d = w * (0.35 + rnd() * 0.3);
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(w, d), cloudMat);
    vertices += 4;
    mesh.rotation.x = -Math.PI / 2;
    mesh.position.set((rnd() - 0.5) * radius * 1.2, cloudY + (rnd() - 0.5) * 30, (rnd() - 0.5) * radius * 1.2);
    mesh.userData.noMerge = true;
    mesh.frustumCulled = false;
    mesh.renderOrder = -8;
    root.add(mesh);
    clouds.push(mesh);
  }

  let recipe = null;
  function set(time, weather) {
    recipe = skyFor(time, weather);
    const t = SKY_TIME[recipe.band];
    const w = WEATHER[recipe.kind];
    let zenith = skyShade(t.zenith, w.sky), horizon = skyShade(t.horizon, w.sky);
    if (w.tint !== undefined) { zenith = skyMix(zenith, w.tint, 0.4); horizon = skyMix(horizon, w.tint, 0.6); }
    if (!skyPaintDome(domeGeo, zenith, horizon)) domeMat.color?.set?.(skyMix(zenith, horizon, 0.5));
    const sd = recipe.sunDir;
    sun.position.set(sd.x * radius * 0.93, sd.y * radius * 0.93, sd.z * radius * 0.93);
    sun.lookAt?.(0, 0, 0);
    sun.material.color?.set?.(t.sun);
    sun.material.opacity = t.sunI * (w.tint !== undefined ? 0.7 : 1) * (1 - recipe.cover * 0.6);
    sun.visible = sun.material.opacity > 0.02;
    moon.position.set(-sd.x * radius * 0.93, Math.abs(sd.y) * radius * 0.9, -sd.z * radius * 0.93);
    moon.lookAt?.(0, 0, 0);
    moon.material.opacity = t.moonI * (1 - recipe.cover * 0.8);
    moon.visible = moon.material.opacity > 0.02;
    starMat.opacity = t.stars * (1 - recipe.cover) * Math.min(1, w.fog);
    stars.visible = starMat.opacity > 0.02;
    cloudMat.opacity = recipe.cover * 0.85;
    cloudMat.color?.set?.(skyMix(0xffffff, skyShade(horizon, 0.6), recipe.cover * 0.8 + (1 - t.sunI) * 0.3));
    for (const c of clouds) c.visible = recipe.cover > 0.02;
    return recipe;
  }
  set(o.time ?? "day", o.weather ?? "clear");

  let meshCount = 0;
  root.traverse((n) => { if (n.isMesh || n.isPoints) meshCount += 1; });

  return {
    root, set, vertices, meshCount,
    get recipe() { return recipe; },
    /** Follow the eye, drift the clouds with the wind, twinkle the stars. */
    animate(t, dt, eye) {
      const p = eye?.position ?? eye;
      if (p && typeof p.x === "number") root.position.set(p.x, 0, p.z);
      if (recipe) {
        const vx = Math.sin(recipe.wind.dir) * recipe.wind.speed * 0.6, vz = Math.cos(recipe.wind.dir) * recipe.wind.speed * 0.6;
        const lim = radius * 0.7;
        for (const c of clouds) {
          c.position.x += vx * dt; c.position.z += vz * dt;
          if (c.position.x > lim) c.position.x = -lim; else if (c.position.x < -lim) c.position.x = lim;
          if (c.position.z > lim) c.position.z = -lim; else if (c.position.z < -lim) c.position.z = lim;
        }
        if (stars.visible) starMat.opacity = SKY_TIME[recipe.band].stars * (1 - recipe.cover) * (0.9 + Math.sin(t * 1.7) * 0.1);
      }
    },
  };
}

// ---------------------------------------------------------------- drift

/**
 * A sky state for advanceSky():
 *   hours       the clock (0–24); advances at `dayRate` hours per second
 *               (0 when the caller's own clock owns the hour, as Bay World's does)
 *   weather     the current kind
 *   driftEvery  seconds between drift steps (0 disables the drift)
 *   hooks       listeners from skyOn()
 */
export function skyState(o = {}) {
  return {
    hours: o.hours ?? 9,
    weather: skyKind(o.weather ?? "clear"),
    dayRate: o.dayRate ?? 1 / 90,
    driftEvery: o.driftEvery ?? 180,
    driftIndex: Math.max(0, SKY_DRIFT.indexOf(skyKind(o.weather ?? "clear"))),
    untilDrift: o.driftEvery ?? 180,
    hooks: [],
  };
}

/** Register a listener: fn({ type: "weather", from, to }) or fn({ type: "band", from, to }). */
export function skyOn(state, fn) {
  if (typeof fn === "function") state.hooks.push(fn);
  return () => { state.hooks = state.hooks.filter((h) => h !== fn); };
}

/**
 * Advance the day cycle and the weather drift by dt seconds. Returns the
 * events this step produced (also delivered to every skyOn() hook), so a
 * caller can either poll or subscribe.
 */
export function advanceSky(state, dt) {
  const events = [];
  const bandBefore = skyTimeBucket(state.hours);
  if (state.dayRate > 0) state.hours = (((state.hours + dt * state.dayRate) % 24) + 24) % 24;
  const bandAfter = skyTimeBucket(state.hours);
  if (bandAfter !== bandBefore) events.push({ type: "band", from: bandBefore, to: bandAfter });
  if (state.driftEvery > 0) {
    state.untilDrift -= dt;
    while (state.untilDrift <= 0) {
      state.untilDrift += state.driftEvery;
      state.driftIndex = (state.driftIndex + 1) % SKY_DRIFT.length;
      const to = SKY_DRIFT[state.driftIndex];
      if (to !== state.weather) { events.push({ type: "weather", from: state.weather, to }); state.weather = to; }
    }
  }
  for (const e of events) for (const h of state.hooks) h(e, state);
  return events;
}

/** Point the drift at a kind (a URL override, a game's own choice). */
export function skySetWeather(state, weather) {
  const to = skyKind(weather);
  const from = state.weather;
  state.weather = to;
  state.driftIndex = Math.max(0, SKY_DRIFT.indexOf(to));
  if (from !== to) for (const h of state.hooks) h({ type: "weather", from, to }, state);
  return to;
}
