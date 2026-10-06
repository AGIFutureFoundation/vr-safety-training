// Fairway Park — the three.js scene: the park (course.js's buildFairwayPark),
// the ball, and the two cameras (third-person follow, first-person address).
// Everything that touches three.js lives here and in app.js; golf.js,
// minigames.js and scores.js never import three.js, so they run headless.

import { buildFairwayPark } from "../../shared/fairway.js";
import { weatherFor } from "../../shared/weather.js";
import { buildSky } from "../../shared/sky.js";
import { buildWildlife } from "../../shared/wildlife.js";
import { fairwayHeight } from "./course.js";

const EYE_HEIGHT = 1.55;

export function fwBuildWorld(root, THREE, opts = {}) {
  const park = buildFairwayPark(root, { THREE });

  const hemi = new THREE.HemisphereLight(0xdcefff, 0x1c2a14, 1.0);
  const sun = new THREE.DirectionalLight(0xfff3d6, 0.95);
  sun.position.set(80, 140, 60);
  root.add(hemi, sun);

  // The same sky as Bay World (shared/sky.js): the dome, built after the
  // park's own mergeStatic(), and its recipe applied to the scene's fog and
  // background, so `?weather=` and the time band read the same here as
  // there. A small gull flock over the park is the one wildlife group.
  const weather = weatherFor(opts.weather ?? "clear");
  const sky = buildSky(root, { time: opts.time ?? "day", weather });
  const recipe = sky.recipe;
  const scene = opts.scene;
  if (scene) {
    scene.background?.setHex?.(recipe.sky);
    if (scene.fog) {
      scene.fog.color?.setHex?.(recipe.fog);
      if ("far" in scene.fog) { scene.fog.near = recipe.visibility * 0.2; scene.fog.far = recipe.visibility; }
      if ("density" in scene.fog) scene.fog.density = recipe.fogDensity;
    }
  }
  const gulls = buildWildlife(root, { zone: { x: 0, z: 0, w: 120, d: 120, y: 0 }, kind: "gulls", count: 4 });
  let skyClock = 0;
  function stepSky(dt, camera) {
    skyClock += dt;
    sky.animate(skyClock, dt, camera);
    gulls.animate(skyClock, dt);
    return recipe;
  }

  const ball = new THREE.Mesh(
    new THREE.SphereGeometry(0.11, 16, 12),
    new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.35 }),
  );
  ball.castShadow = true;
  root.add(ball);

  function placeBall(x, z) {
    ball.position.set(x, fairwayHeight(x, z) + 0.11, z);
  }

  /**
   * Aims the given camera at the ball. `mode` is "follow" (third-person,
   * behind the ball looking toward the aim yaw) or "address" (first-person,
   * eye height, standing just behind the ball). `yaw` is the current aim
   * direction in radians (0 = +z).
   */
  function placeCamera(camera, mode, x, z, yaw) {
    const y = fairwayHeight(x, z);
    const fx = Math.sin(yaw), fz = Math.cos(yaw);
    if (mode === "address") {
      camera.position.set(x - fx * 0.6, y + EYE_HEIGHT, z - fz * 0.6);
      camera.lookAt(x + fx * 20, y + EYE_HEIGHT - 0.4, z + fz * 20);
    } else {
      camera.position.set(x - fx * 7, y + 3.4, z - fz * 7);
      camera.lookAt(x + fx * 10, y + 0.6, z + fz * 10);
    }
  }

  return { park, ball, sky, gulls, recipe, stepSky, placeBall, placeCamera };
}
