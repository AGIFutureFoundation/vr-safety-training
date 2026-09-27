// Bay World — the three.js scene: the city (city.js's buildBayWorld), the
// fleet (shared/fleet.js), pedestrians, weather (shared/weather.js) and the
// two cameras (third-person chase, first-person). Everything that touches
// three.js lives here and in app.js; sim.js, career.js, quest-engine.js and
// map.js never import three.js, so they all run headless.
import { buildBayWorld, bayLighting, BAY_SITES, BAY_LANDMARKS } from "./city.js";
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

/**
 * Builds the whole scene into `root` (a THREE.Group already in the app's own
 * scene). `opts.THREE` is the three.js module the app already loaded.
 * Returns handles the render loop and the HUD both read from every frame.
 */
export function bwBuildWorld(root, THREE, opts = {}) {
  const city = buildBayWorld(root, { THREE, detail: opts.detail ?? "high" });

  const hemi = new THREE.HemisphereLight(0xdcefff, 0x1c2a14, 1.0);
  const sun = new THREE.DirectionalLight(0xfff3d6, 1.0);
  sun.castShadow = false; // a city this size skips shadow maps for frame time, not realism
  root.add(hemi, sun);

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

  // Site signs and landmark labels, drawn once.
  for (const site of BAY_SITES) {
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

  /** Applies bayLighting(time)'s table to the lights, the scene's fog/sky and
   *  every parked vehicle and lamp's own headlight/glow state. */
  function bwApplyLighting(scene, time) {
    const L = bayLighting(time);
    hemi.intensity = L.ambient.intensity;
    hemi.color?.setHex?.(L.ambient.color);
    sun.intensity = L.sun.intensity;
    sun.color?.setHex?.(L.sun.color);
    sun.position.set(...L.sun.position);
    if (scene) {
      if (!scene.fog && THREE.FogExp2) scene.fog = new THREE.FogExp2(L.fog.color, L.fog.density);
      if (scene.fog) { scene.fog.color?.setHex?.(L.fog.color); if ("density" in scene.fog) scene.fog.density = L.fog.density; }
      scene.background?.setHex?.(L.sky.top);
    }
    return L;
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
