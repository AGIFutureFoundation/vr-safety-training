// Bay World — the three.js scene: the city (BAY1's own shared/bayworld.js),
// the fleet (shared/fleet.js), pedestrians, weather (shared/weather.js) and
// the two cameras (third-person chase, first-person). Everything that
// touches three.js lives here and in app.js; sim.js, career.js,
// quest-engine.js and map.js never import three.js, so they all run
// headless.
//
// buildBayWorld()/bayLighting() are imported straight from
// ../../shared/bayworld.js, never through city.js — the same way fairway/js/
// world.js imports buildFairwayPark straight from shared/fairway.js: a
// module that touches three.js never belongs on city.js's pure side.
import { buildBayWorld, bayLighting } from "../../shared/bayworld.js";
import { BW_SITES } from "./city.js";
import { sedan, pickup, boxTruck, semiTractor } from "../../shared/fleet.js";
import { buildWeather, weatherFor } from "../../shared/weather.js";
import { BW_VEHICLES } from "./sim.js";

const BW_EYE_HEIGHT = 1.62;
const BW_VEHICLE_BUILDERS = { sedan, pickup, boxTruck, semiTractor };
/** Where each of the four fleet vehicles is parked at the downtown motor
 *  pool — "enter and exit at parked vehicles" starts here for every one of
 *  them, whether or not it is unlocked yet (an unseen vehicle just waits). */
const BW_DEPOT = { x: -40, z: -40, spacing: 9 };

function bwPersonFigure(THREE, { body = 0x3a6ea5, skin = 0xd8b090, cap = 0xf2c14b } = {}) {
  const g = new THREE.Group();
  const torso = new THREE.Mesh(new THREE.CapsuleGeometry(0.24, 0.62, 4, 8), new THREE.MeshStandardMaterial({ color: body, roughness: 0.8 }));
  torso.position.y = 1.02;
  torso.castShadow = true;
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.15, 12, 10), new THREE.MeshStandardMaterial({ color: skin, roughness: 0.7 }));
  head.position.y = 1.55;
  const hat = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, 0.09, 12), new THREE.MeshStandardMaterial({ color: cap, roughness: 0.6 }));
  hat.position.y = 1.66;
  const legs = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.15, 0.75, 8), new THREE.MeshStandardMaterial({ color: 0x2a2f36, roughness: 0.9 }));
  legs.position.y = 0.38;
  g.add(torso, head, hat, legs);
  g.castShadow = true;
  return g;
}

function bwSignBoard(THREE, text) {
  // A borderless text plane using a canvas texture — cheap, and legible from
  // a driving distance without a full UI kit dependency here.
  const canvas = typeof document !== "undefined" ? document.createElement("canvas") : { width: 256, height: 64, getContext: () => null };
  canvas.width = 256; canvas.height = 64;
  const ctx = canvas.getContext && canvas.getContext("2d");
  if (ctx) {
    ctx.fillStyle = "#123449"; ctx.fillRect(0, 0, 256, 64);
    ctx.fillStyle = "#eaf6ff"; ctx.font = "bold 22px sans-serif"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.fillText(text.slice(0, 24), 128, 32);
  }
  const tex = new THREE.CanvasTexture(canvas);
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(2.3, 0.6), new THREE.MeshBasicMaterial({ map: tex, transparent: true }));
  return mesh;
}

// BAY1's own bayLighting(time) takes one of three named buckets ("night" |
// "dusk" | "day") and returns a { sky, fog, hemi:[sky,ground], hemiI, key:
// [color,intensity], mast } recipe — the same table every district and
// station already reads from smartcity/js/stage.js's own copy of it. This
// app's day clock is a continuous hour (sim.js's bwAdvanceClock()), so
// bwHourBucket() below is the one place that turns a continuous hour into
// the discrete bucket bayLighting() understands.
export function bwHourBucket(hours) {
  const h = ((hours % 24) + 24) % 24;
  if (h >= 6 && h < 18) return "day";
  if ((h >= 18 && h < 20) || (h >= 5 && h < 6)) return "dusk";
  return "night";
}

/**
 * Builds the whole scene into `root` (a THREE.Group already in the app's own
 * scene). `THREE` is the three.js module the app already loaded (BAY1's
 * buildBayWorld() imports its own copy from the same CDN URL, so this never
 * has to pass it through). Returns handles the render loop and the HUD both
 * read from every frame.
 */
export function bwBuildWorld(root, THREE, opts = {}) {
  const city = buildBayWorld(root, { detail: opts.detail ?? "high", zone: opts.zone, time: "day" });

  // BAY1's own buildBayWorld() already added a HemisphereLight and a
  // DirectionalLight straight into `root` (bayLighting("day")'s own recipe);
  // this app drives THOSE SAME lights for its continuous day/night cycle
  // (bwApplyLighting() below) rather than adding a second pair on top of
  // them, so mergeStatic()-ing the rest of the city never leaves the scene
  // double-lit.
  let hemi = null, sun = null;
  root.traverse((o) => {
    if (o.isHemisphereLight && !hemi) hemi = o;
    if (o.isDirectionalLight && !sun) sun = o;
  });

  const player = bwPersonFigure(THREE);
  root.add(player);

  // The fleet, parked at the motor pool. Each is a real fleet.js build, so it
  // shares the platform's own vehicle kit rather than a bespoke arcade model.
  const vehicles = {};
  BW_VEHICLES.forEach((v, i) => {
    const builder = BW_VEHICLE_BUILDERS[v.builder];
    const x = BW_DEPOT.x + i * BW_DEPOT.spacing, z = BW_DEPOT.z;
    const mesh = builder(root, x, 0, z, {});
    mesh.userData.bwVehicleId = v.id;
    mesh.userData.bwParked = [x, z];
    vehicles[v.id] = mesh;
  });

  // Site signs, drawn once — one per BW_SITES entry, however many the shared
  // map carries (nothing here assumes a count), spread across a world the
  // size of BAY_BOUNDS, so a sign is a single cheap unmerged plane rather
  // than anything heavier.
  for (const site of BW_SITES) {
    const sign = bwSignBoard(THREE, site.name);
    sign.position.set(site.position[0], 4.1, site.position[2]);
    root.add(sign);
  }

  // Ambient traffic: a small reusable pool of vehicle meshes, moved (never
  // rebuilt) every frame from sim.js's own bwStepTraffic() output.
  const trafficBuilders = [sedan, pickup, boxTruck];
  function bwSpawnTrafficMeshes(count) {
    const out = [];
    for (let i = 0; i < count; i++) {
      const builder = trafficBuilders[i % trafficBuilders.length];
      out.push(builder(root, 0, 0, 0, {}));
    }
    return out;
  }

  // Pedestrians: a small pool of person figures, likewise moved from sim.js's
  // own bwStepPedestrian() output.
  function bwSpawnPedestrianMeshes(count) {
    const out = [];
    const palette = [0x3a6ea5, 0xa5563a, 0x4a9a5a, 0x8a6fbf];
    for (let i = 0; i < count; i++) out.push(bwPersonFigure(THREE, { body: palette[i % palette.length] }));
    return out;
  }

  // Weather: one live instance at a time, torn down and rebuilt when the kind
  // changes (buildWeather() is cheap — a few hundred points and a plane).
  let weather = null, weatherKind = null;
  function bwSetWeather(kind) {
    const wanted = weatherFor(kind);
    if (wanted === weatherKind) return weather;
    if (weather?.dispose) weather.dispose();
    else if (weather?.group?.parent) weather.group.parent.remove(weather.group);
    const group = new THREE.Group();
    root.add(group);
    weather = { ...buildWeather(group, opts.scene ?? { fog: null }, wanted), group };
    weatherKind = wanted;
    return weather;
  }

  /** Applies bayLighting(bucket)'s recipe (see bwHourBucket()) to the same
   *  hemi/sun lights BAY1's own buildBayWorld() built, plus the scene's
   *  fog/sky. Returns the bucket and a couple of plain flags the HUD reads. */
  function bwApplyLighting(scene, hours) {
    const bucket = bwHourBucket(hours);
    const L = bayLighting(bucket);
    if (hemi) { hemi.color?.setHex?.(L.hemi[0]); hemi.groundColor?.setHex?.(L.hemi[1]); hemi.intensity = L.hemiI; }
    if (sun) { sun.color?.setHex?.(L.key[0]); sun.intensity = L.key[1]; }
    if (scene) {
      if (!scene.fog && THREE.FogExp2) scene.fog = new THREE.FogExp2(L.fog, 0.006);
      if (scene.fog) scene.fog.color?.setHex?.(L.fog);
      scene.background?.setHex?.(L.sky);
    }
    return { bucket, isNight: bucket === "night", streetlightsOn: bucket !== "day", mast: L.mast };
  }

  /** Third-person chase (mode "chase") or first-person (mode "first") camera,
   *  behind/at `subject` (the player figure or the active vehicle mesh) at
   *  world position (x, y, z) facing `heading`. */
  function placeCamera(camera, mode, x, y, z, heading) {
    const fx = Math.sin(heading), fz = Math.cos(heading);
    if (mode === "first") {
      camera.position.set(x, y + BW_EYE_HEIGHT, z);
      camera.lookAt(x + fx * 20, y + BW_EYE_HEIGHT - 0.3, z + fz * 20);
    } else {
      camera.position.set(x - fx * 8, y + 4.2, z - fz * 8);
      camera.lookAt(x + fx * 6, y + 1.2, z + fz * 6);
    }
  }

  return {
    city, player, vehicles, sun, hemi,
    bwSpawnTrafficMeshes, bwSpawnPedestrianMeshes, bwSetWeather, bwApplyLighting, placeCamera,
  };
}
