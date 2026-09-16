import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import { box, cyl, ball, torus, group, decal, repaint, markInteractive, HUD } from "../../shared/kit.js";
import { Progress } from "../../shared/game.js";
import { CITY, holoTag, surfaceTexture, texturedMat, pavingFace, deckPlateFace } from "./citykit.js";

// The district selector. Twenty simulators, each its own gamified system, laid
// out as kiosks around a plaza. Selecting one starts that simulator's own
// AR/VR/flat session; the kiosk shows that system's own rank and currency,
// never a shared platform score, because there isn't one.

/** Clip a single line to `maxWidth` with an ellipsis, using the context's current font. */
function fitText(g, text, maxWidth) {
  let s = String(text);
  if (g.measureText(s).width <= maxWidth) return s;
  while (s.length > 1 && g.measureText(s + "…").width > maxWidth) s = s.slice(0, -1);
  return s.trimEnd() + "…";
}

export function buildHub(root, sims) {
  const hits = {};
  const reg = (obj, id) => { markInteractive(obj, id); hits[id] = obj; return obj; };
  // Scale the ring so kiosk spacing stays roughly constant as the roster grows —
  // 6.4 was tuned for 10 kiosks; keep that floor so a smaller roster never crowds.
  const R = Math.max(6.4, sims.length * 0.4);

  // Atrium floor: the same cast-concrete paving as the plaza, with a
  // deck-plate walk ring under the kiosks so the selector lane reads as a
  // different, tougher surface than the paving inside it.
  const floor = cyl(root, R + 1.8, R + 1.8, 0.2, 0, -0.1, 0, 0x0d1319, { rough: 0.4, metal: 0.2, seg: 64 });
  floor.material = texturedMat(
    surfaceTexture((cx, w, h) => pavingFace(cx, w, h, { tiles: 4, base: "#161e27", base2: "#111820" }), { repeat: 6, px: 512 }),
    { rough: 0.9, metal: 0.04, color: 0xd6dbe1 });
  floor.receiveShadow = true;
  const lane = cyl(root, R + 0.9, R + 0.9, 0.03, 0, 0.012, 0, 0x232b33, { rough: 0.6, metal: 0.5, seg: 64, cast: false });
  lane.material = texturedMat(surfaceTexture((cx, w, h) => deckPlateFace(cx, w, h), { repeat: 16, px: 256 }),
    { rough: 0.55, metal: 0.55, color: 0xcfd6dd });
  lane.receiveShadow = true;
  cyl(root, R - 1.1, R - 1.1, 0.035, 0, 0.018, 0, 0x121920, { rough: 0.9, metal: 0.05, seg: 64, cast: false })
    .material = texturedMat(surfaceTexture((cx, w, h) => pavingFace(cx, w, h, { tiles: 3, base: "#1b232c", base2: "#161d25" }), { repeat: 4, px: 512 }),
      { rough: 0.9, metal: 0.04, color: 0xd0d6dc });
  torus(root, R - 1.0, 0.03, 0, 0.04, 0, CITY.accent,
    { emissive: CITY.accent, ei: 1.4, rough: 0.4, cast: false, seg: 6, seg2: 64 });
  torus(root, R + 0.95, 0.018, 0, 0.03, 0, CITY.hiVis,
    { emissive: CITY.hiVis, ei: 0.55, rough: 0.5, cast: false, seg: 6, seg2: 72 });

  const pillar = group(root, 0, 0, 0);
  cyl(pillar, 0.4, 0.5, 0.9, 0, 0.5, 0, 0x1b232b, { rough: 0.45, metal: 0.4, seg: 24 });
  const beacon = ball(pillar, 0.1, 0, 1.35, 0, CITY.accent, { emissive: CITY.accent, ei: 2.6, rough: 0.3 });
  // Slow-spinning holo halo around the beacon — flagship-plaza flourish, cheap to animate
  // (one rotation.z tweak per frame, no new geometry or materials).
  const halo = torus(pillar, 0.62, 0.012, 0, 1.35, 0, CITY.violet,
    { emissive: CITY.violet, ei: 1.4, rough: 0.4, cast: false, seg: 6, seg2: 40 });
  const titleFace = decal(pillar, 1.3, 0.5, 0, 1.95, 0, () => {}, { px: 640, glow: true, ei: 0.7 });
  // The pillar is wayfinding, not branding — the marquee behind it already
  // carries the SmartCiti.X / AGI Corp & Visko wordmark, and repeating it
  // here put two copies of the same text in one sightline.
  const categoryCount = new Set(sims.map((s) => s.category ?? s.domain)).size;
  function paintTitle() {
    repaint(titleFace, (g, w, h) => {
      g.fillStyle = "rgba(6,14,20,0.0)"; g.clearRect(0, 0, w, h);
      g.fillStyle = "#8fd8ff";
      g.font = `600 ${Math.round(h * 0.12)}px 'Barlow Condensed', Arial, sans-serif`;
      g.textAlign = "center"; g.textBaseline = "middle";
      g.fillText("SMARTCITI.X · TRAINING CAMPUS", w / 2, h * 0.15);
      g.fillStyle = "#4fd1ff";
      g.font = `700 ${Math.round(h * 0.3)}px 'Barlow Condensed', Arial, sans-serif`;
      g.fillText("SELECT A STATION", w / 2, h * 0.52);
      g.fillStyle = "#eaf6fb";
      g.font = `500 ${Math.round(h * 0.14)}px 'Barlow', Arial, sans-serif`;
      g.fillText(`${sims.length} STATIONS · ${categoryCount} CATEGORIES`, w / 2, h * 0.82);
    });
  }
  paintTitle();

  const doorFaces = {};
  sims.forEach((sim, i) => {
    const a = (i / sims.length) * Math.PI * 2 - Math.PI / 2;
    const dx = Math.sin(a) * R, dz = Math.cos(a) * R;
    const kiosk = group(root, dx, 0, dz, a + Math.PI);

    // Kiosk: a brushed-steel frame around a dark face, a plinth, and two
    // vertical light bars in the station's accent so it reads as a lit
    // totem from across the atrium rather than a flat painted slab.
    box(kiosk, 1.22, 0.08, 0.44, 0, 0.04, 0.02, CITY.darkSteel, { rough: 0.55, metal: 0.6 });
    box(kiosk, 1.08, 2.0, 0.18, 0, 1.04, 0, 0x1b232b, { rough: 0.5, metal: 0.45 });
    for (const sx of [-1, 1]) {
      box(kiosk, 0.05, 2.02, 0.22, sx * 0.565, 1.04, 0, CITY.steel, { rough: 0.35, metal: 0.75 });
      box(kiosk, 0.02, 1.84, 0.02, sx * 0.535, 1.04, 0.1, sim.accent, { emissive: sim.accent, ei: 1.3, rough: 0.4, cast: false });
    }
    box(kiosk, 1.16, 0.06, 0.26, 0, 2.08, 0, CITY.steel, { rough: 0.35, metal: 0.75 });
    box(kiosk, 1.08, 0.04, 0.24, 0, 2.13, 0, sim.accent, { emissive: sim.accent, ei: 1.6, rough: 0.4, cast: false });
    box(kiosk, 1.06, 0.03, 0.2, 0, 0.09, 0.05, sim.accent, { emissive: sim.accent, ei: 1.0, rough: 0.4, cast: false });

    const indexBadge = decal(kiosk, 0.3, 0.3, -0.3, 1.7, 0.1, () => {}, { px: 256, glow: true, ei: 0.7 });
    const sign = decal(kiosk, 0.94, 0.7, 0.02, 1.15, 0.1, () => {}, { px: 512, glow: true, ei: 0.6 });
    const record = decal(kiosk, 0.94, 0.44, 0, 0.4, 0.1, () => {}, { px: 512, glow: true, ei: 0.5 });
    doorFaces[sim.id] = { indexBadge, sign, record, sim };

    const spot = cyl(kiosk, 0.7, 0.7, 0.008, 0, 0.012, 0.6, sim.accent,
      { rough: 0.6, emissive: sim.accent, ei: 0.7, cast: false, seg: 24 });
    reg(box(kiosk, 1.1, 2.0, 0.5, 0, 1.0, 0.2, 0x000000, { opacity: 0.001, transparent: true, cast: false }),
      `enter-${sim.id}`);

    const lamp = new THREE.PointLight(sim.accent, 1.8, 5.5, 2);
    lamp.position.set(dx * 0.85, 2.1, dz * 0.85);
    root.add(lamp);
  });

  function paintKiosks() {
    for (const id of Object.keys(doorFaces)) {
      const { indexBadge, sign, record, sim } = doorFaces[id];
      const accentCss = sim.accentCss;
      repaint(indexBadge, (g, w, h) => {
        g.fillStyle = "rgba(10,16,22,0.85)"; g.fillRect(0, 0, w, h);
        g.fillStyle = accentCss;
        g.font = `700 ${Math.round(h * 0.55)}px 'Barlow Condensed', Arial, sans-serif`;
        g.textAlign = "center"; g.textBaseline = "middle";
        g.fillText(sim.index, w / 2, h * 0.5);
      });
      repaint(sign, (g, w, h) => {
        g.fillStyle = "rgba(10,16,22,0.92)"; g.fillRect(0, 0, w, h);
        g.fillStyle = accentCss; g.fillRect(0, h - 6, w, 6);
        g.fillStyle = "#8fb3c4";
        g.font = `600 ${Math.round(h * 0.09)}px 'Barlow Condensed', Arial, sans-serif`;
        g.textAlign = "center"; g.textBaseline = "middle";
        g.fillText((sim.category ?? sim.domain).toUpperCase(), w / 2, h * 0.12);
        g.fillStyle = "#eaf6fb";
        g.font = `600 ${Math.round(h * 0.24)}px 'Barlow Condensed', Arial, sans-serif`;
        g.fillText(sim.name.toUpperCase(), w / 2, h * 0.37);
        g.fillStyle = accentCss;
        g.font = `${Math.round(h * 0.095)}px Arial, sans-serif`;
        g.fillText(sim.trade, w / 2, h * 0.58);
        // The real union + credential for this trade, split at the em dash so
        // the union sits on its own line and the credential is clipped to fit.
        const [union, credential] = String(sim.certification ?? "").split(" — ");
        g.fillStyle = "#c9dbe6";
        g.font = `600 ${Math.round(h * 0.08)}px 'Barlow Condensed', Arial, sans-serif`;
        g.fillText((union ?? "").toUpperCase(), w / 2, h * 0.74);
        g.fillStyle = "#6d8296";
        g.font = `${Math.round(h * 0.07)}px Arial, sans-serif`;
        g.fillText(fitText(g, credential ?? "", w * 0.92), w / 2, h * 0.87);
      });
      const rank = Progress.simRank(sim.id, sim.game);
      const state = Progress.roomState(sim.id);
      repaint(record, (g, w, h) => {
        g.fillStyle = "rgba(10,16,22,0.9)"; g.fillRect(0, 0, w, h);
        g.fillStyle = accentCss; g.fillRect(0, 0, 5, h);
        g.textAlign = "left"; g.textBaseline = "middle";
        g.fillStyle = "#8fb3c4";
        g.font = `600 ${Math.round(h * 0.11)}px 'Barlow Condensed', Arial, sans-serif`;
        g.fillText(sim.game?.system?.toUpperCase() ?? "PROGRESS", w * 0.07, h * 0.16);
        g.fillStyle = "#eaf6fb";
        g.font = `600 ${Math.round(h * 0.2)}px 'Barlow Condensed', Arial, sans-serif`;
        g.fillText(rank.name.toUpperCase(), w * 0.07, h * 0.42);
        g.fillStyle = accentCss;
        g.font = `600 ${Math.round(h * 0.13)}px 'Barlow Condensed', Arial, sans-serif`;
        g.textAlign = "right";
        g.fillText(`${rank.xp} ${sim.game?.currency ?? "XP"}`, w * 0.93, h * 0.42);
        g.textAlign = "left";
        g.fillStyle = "#1d2833"; g.fillRect(w * 0.07, h * 0.58, w * 0.86, h * 0.08);
        g.fillStyle = accentCss;
        g.fillRect(w * 0.07, h * 0.58, w * 0.86 * (rank.max ? 1 : Math.max(0.02, rank.into / Math.max(1, rank.span))), h * 0.08);
        g.fillStyle = "#8fb3c4";
        g.font = `${Math.round(h * 0.095)}px Arial, sans-serif`;
        const stars = "★".repeat(state.stars) + "☆".repeat(3 - state.stars);
        g.fillText(state.runs ? `${stars}  best ${state.best}` : "not attempted", w * 0.07, h * 0.78);
        const badgeCount = state.badges?.length ?? 0;
        g.fillText(badgeCount ? `${badgeCount} badge${badgeCount === 1 ? "" : "s"} earned` : "no badges yet", w * 0.07, h * 0.92);
      });
    }
  }
  paintKiosks();

  const key = new THREE.DirectionalLight(0xdbe6f2, 0.85);
  key.position.set(3, 8, 4);
  key.castShadow = true;
  key.shadow.mapSize.set(2048, 2048);
  key.shadow.camera.left = -10; key.shadow.camera.right = 10;
  key.shadow.camera.top = 10; key.shadow.camera.bottom = -10;
  key.shadow.bias = -0.0008;
  root.add(key);
  root.add(new THREE.HemisphereLight(0x8ea9c2, 0x1e242b, 1.4));
  const rim = new THREE.DirectionalLight(0x6fb8ff, 0.3);
  rim.position.set(-4, 5, -7);
  root.add(rim);

  return {
    hits,
    isHub: true,
    spawnLook: new THREE.Vector3(0, 1.5, 0),
    refresh() { paintKiosks(); },
    animate(t) {
      beacon.material.emissiveIntensity = 2.0 + Math.sin(t * 1.5) * 0.7;
      beacon.position.y = 1.35 + Math.sin(t * 0.8) * 0.04;
      halo.rotation.z = t * 0.4;
      halo.position.y = beacon.position.y;
    },
  };
}
