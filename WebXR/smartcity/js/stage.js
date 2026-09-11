import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import { box, cyl, ball, torus, group, decal, mat, gradientFill, noiseTexture } from "../../shared/kit.js";
import { CITY, skyline } from "./citykit.js";

// Flagship banner copy, product-owner-specified: SmartCiti.X is the visitor-facing
// simulator brand; AGI Corp is the umbrella brand it is built and run under.
const MARQUEE_LINE = "SMARTCITI.X ~VR SIMULATORS";
const MARQUEE_SUB = "POWERED BY AGI CORP";

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

  const sign = decal(marquee, spanW - 0.4, 1.55, 0, postH - 1.0, 0.22, (cx, cw, ch) => {
    gradientFill(cx, cw, ch, [[0, "#04141c"], [1, "#0b2733"]]);
    noiseTexture(cx, cw, ch, { density: 260, alpha: 0.03, tone: "255,255,255" });
    cx.fillStyle = "#8fd8ff";
    cx.font = `600 ${Math.round(ch * 0.13)}px 'Barlow Condensed', Arial, sans-serif`;
    cx.textAlign = "center"; cx.textBaseline = "middle";
    cx.fillText(MARQUEE_SUB, cw / 2, ch * 0.18);
    cx.fillStyle = "#eaf6fb";
    cx.font = `700 ${Math.round(ch * 0.36)}px 'Barlow Condensed', Arial, sans-serif`;
    cx.fillText(MARQUEE_LINE, cw / 2, ch * 0.55);
    cx.fillStyle = CITY.accentCss;
    cx.font = `500 ${Math.round(ch * 0.11)}px 'Barlow', Arial, sans-serif`;
    cx.fillText("FLAGSHIP AR / VR TRAINING SIMULATORS", cw / 2, ch * 0.85);
  }, { px: 1024, glow: true, ei: 0.85 });

  const emblem = group(marquee, 0, postH + 0.85, 0);
  torus(emblem, 0.4, 0.03, 0, 0, 0, CITY.accent, { emissive: CITY.accent, ei: 2, rough: 0.4, cast: false, seg: 8, seg2: 40 });
  const ring2 = torus(emblem, 0.28, 0.02, 0, 0, 0, CITY.violet, { emissive: CITY.violet, ei: 1.8, rough: 0.4, cast: false, seg: 6, seg2: 32 });
  ring2.rotation.x = Math.PI / 2.4;
  ball(emblem, 0.09, 0, 0, 0, 0xeaf6fb, { emissive: 0xeaf6fb, ei: 2.4, rough: 0.3 });
  const beam = new THREE.PointLight(CITY.accent, 2.2, 9, 2);
  beam.position.set(0, postH - 0.4, 0.4);
  marquee.add(beam);

  return { sign, emblem, ring2, trim };
}

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

  const sky = skyline(g);
  const marquee = buildMarquee(g);

  const key = new THREE.DirectionalLight(0xbcd4e8, 0.55);
  key.position.set(4, 9, 5);
  key.castShadow = true;
  key.shadow.mapSize.set(1024, 1024);
  key.shadow.camera.left = -8; key.shadow.camera.right = 8;
  key.shadow.camera.top = 8; key.shadow.camera.bottom = -8;
  g.add(key);
  g.add(new THREE.HemisphereLight(0x6d8296, 0x121820, 1.15));

  const beacons = sky.userData.beacons ?? [];
  return {
    root: g, ar,
    animate(t) {
      // Cheap flagship motion: rotate the holo-emblem, pulse its inner ring and the
      // marquee trim, and blink a handful of rooftop beacons — property tweaks on
      // already-built meshes/materials, nothing allocated per frame.
      marquee.emblem.rotation.y = t * 0.5;
      marquee.ring2.rotation.z = t * 0.8;
      marquee.trim.material.emissiveIntensity = 1.4 + Math.sin(t * 1.6) * 0.3;
      for (const beacon of beacons) {
        beacon.material.emissiveIntensity = 1.1 + Math.max(0, Math.sin(t * 1.4 + beacon.userData.phase)) * 1.4;
      }
    },
  };
}
