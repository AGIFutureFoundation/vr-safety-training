import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import { box, cyl, torus, group, mat } from "../../shared/kit.js";
import { CITY, skyline } from "./citykit.js";

// The stage is everything that is *not* the training station.
//
// In AR the learner's own room is the environment, so the stage is almost
// nothing: passthrough behind, and a faint floor grid to anchor the station.
// In VR and on a flat screen there is no real room to stand in, so the same
// station is dropped into a digital-twin plaza with a city skyline around it.

export const STAGE_MODES = ["ar", "vr", "flat"];

export function buildStage(root, mode, scene) {
  const g = group(root);
  const ar = mode === "ar";

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
    return { root: g, ar, animate() {} };
  }

  scene.background = new THREE.Color(0x070c12);
  scene.fog = new THREE.Fog(0x070c12, 20, 62);

  // Plaza deck.
  const deck = cyl(g, 15, 15, 0.3, 0, -0.15, 0, 0x151b22, { rough: 0.55, metal: 0.2, seg: 56 });
  deck.receiveShadow = true;
  for (let i = -7; i <= 7; i++) {
    box(g, 30, 0.004, 0.014, 0, 0.004, i * 2, 0x223140, { cast: false, receive: false });
    box(g, 0.014, 0.004, 30, i * 2, 0.004, 0, 0x223140, { cast: false, receive: false });
  }
  torus(g, 12.4, 0.05, 0, 0.02, 0, CITY.accent,
    { emissive: CITY.accent, ei: 1.5, rough: 0.4, cast: false, seg: 6, seg2: 64 });

  // Perimeter light masts.
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2 + Math.PI / 8;
    const mx = Math.sin(a) * 11.5, mz = Math.cos(a) * 11.5;
    cyl(g, 0.055, 0.075, 5.2, mx, 2.6, mz, 0x2b333c, { rough: 0.5, metal: 0.6, seg: 12 });
    const head = box(g, 0.5, 0.09, 0.26, mx, 5.2, mz, 0x2b333c, { rough: 0.5, metal: 0.6 });
    head.rotation.y = a;
    const lamp = box(g, 0.42, 0.03, 0.2, mx, 5.14, mz, 0xdfeaf2,
      { emissive: 0xdfeaf2, ei: 1.8, rough: 0.4, cast: false });
    lamp.rotation.y = a;
    const light = new THREE.PointLight(0xdfeaf2, 1.6, 16, 2);
    light.position.set(mx * 0.82, 4.6, mz * 0.82);
    g.add(light);
  }

  skyline(g);

  const key = new THREE.DirectionalLight(0xbcd4e8, 0.55);
  key.position.set(4, 9, 5);
  key.castShadow = true;
  key.shadow.mapSize.set(1024, 1024);
  key.shadow.camera.left = -8; key.shadow.camera.right = 8;
  key.shadow.camera.top = 8; key.shadow.camera.bottom = -8;
  g.add(key);
  g.add(new THREE.HemisphereLight(0x6d8296, 0x121820, 1.15));

  return { root: g, ar, animate() {} };
}
