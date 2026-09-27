// Fairway Park — the three.js scene: the park (course.js's buildFairwayPark),
// the ball, and the two cameras (third-person follow, first-person address).
// Everything that touches three.js lives here and in app.js; golf.js,
// minigames.js and scores.js never import three.js, so they run headless.

import { buildFairwayPark, fairwayHeight } from "./course.js";

const EYE_HEIGHT = 1.55;

export function fwBuildWorld(root, THREE, opts = {}) {
  const park = buildFairwayPark(root, { THREE });

  const sky = new THREE.HemisphereLight(0xdcefff, 0x1c2a14, 1.0);
  const sun = new THREE.DirectionalLight(0xfff3d6, 0.95);
  sun.position.set(80, 140, 60);
  root.add(sky, sun);

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

  return { park, ball, placeBall, placeCamera };
}
