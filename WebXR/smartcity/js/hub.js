import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import { box, cyl, ball, torus, group, decal, repaint, markInteractive, HUD } from "../../shared/kit.js";
import { Progress } from "../../shared/game.js";
import { CITY, holoTag } from "./citykit.js";

// The district selector. Twenty simulators, each its own gamified system, laid
// out as kiosks around a plaza. Selecting one starts that simulator's own
// AR/VR/flat session; the kiosk shows that system's own rank and currency,
// never a shared platform score, because there isn't one.

export function buildHub(root, sims) {
  const hits = {};
  const reg = (obj, id) => { markInteractive(obj, id); hits[id] = obj; return obj; };
  // Scale the ring so kiosk spacing stays roughly constant as the roster grows —
  // 6.4 was tuned for 10 kiosks; keep that floor so a smaller roster never crowds.
  const R = Math.max(6.4, sims.length * 0.4);

  const floor = cyl(root, R + 1.8, R + 1.8, 0.2, 0, -0.1, 0, 0x0d1319, { rough: 0.4, metal: 0.2, seg: 64 });
  floor.receiveShadow = true;
  torus(root, R - 1.0, 0.03, 0, 0.012, 0, CITY.accent,
    { emissive: CITY.accent, ei: 1.4, rough: 0.4, cast: false, seg: 6, seg2: 64 });

  const pillar = group(root, 0, 0, 0);
  cyl(pillar, 0.4, 0.5, 0.9, 0, 0.5, 0, 0x1b232b, { rough: 0.45, metal: 0.4, seg: 24 });
  const beacon = ball(pillar, 0.1, 0, 1.35, 0, CITY.accent, { emissive: CITY.accent, ei: 2.6, rough: 0.3 });
  // Slow-spinning holo halo around the beacon — flagship-plaza flourish, cheap to animate
  // (one rotation.z tweak per frame, no new geometry or materials).
  const halo = torus(pillar, 0.62, 0.012, 0, 1.35, 0, CITY.violet,
    { emissive: CITY.violet, ei: 1.4, rough: 0.4, cast: false, seg: 6, seg2: 40 });
  const titleFace = decal(pillar, 1.3, 0.5, 0, 1.95, 0, () => {}, { px: 640, glow: true, ei: 0.7 });
  function paintTitle() {
    repaint(titleFace, (g, w, h) => {
      g.fillStyle = "rgba(6,14,20,0.0)"; g.clearRect(0, 0, w, h);
      g.fillStyle = "#8fd8ff";
      g.font = `600 ${Math.round(h * 0.12)}px 'Barlow Condensed', Arial, sans-serif`;
      g.textAlign = "center"; g.textBaseline = "middle";
      g.fillText("POWERED BY AGI CORP", w / 2, h * 0.15);
      g.fillStyle = "#4fd1ff";
      g.font = `700 ${Math.round(h * 0.3)}px 'Barlow Condensed', Arial, sans-serif`;
      g.fillText("SMARTCITI.X ~VR SIMULATORS", w / 2, h * 0.52);
      g.fillStyle = "#eaf6fb";
      g.font = `500 ${Math.round(h * 0.14)}px 'Barlow', Arial, sans-serif`;
      g.fillText("AR TRAINING SIMULATORS", w / 2, h * 0.82);
    });
  }
  paintTitle();

  const doorFaces = {};
  sims.forEach((sim, i) => {
    const a = (i / sims.length) * Math.PI * 2 - Math.PI / 2;
    const dx = Math.sin(a) * R, dz = Math.cos(a) * R;
    const kiosk = group(root, dx, 0, dz, a + Math.PI);

    box(kiosk, 1.0, 2.0, 0.18, 0, 1.0, 0, 0x1b232b, { rough: 0.5, metal: 0.45 });
    box(kiosk, 1.06, 0.06, 0.24, 0, 2.02, 0, sim.accent, { emissive: sim.accent, ei: 1.6, rough: 0.4, cast: false });
    box(kiosk, 1.06, 0.03, 0.2, 0, 0.03, 0.02, sim.accent, { emissive: sim.accent, ei: 1.0, rough: 0.4, cast: false });

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
        g.font = `600 ${Math.round(h * 0.1)}px 'Barlow Condensed', Arial, sans-serif`;
        g.textAlign = "center"; g.textBaseline = "middle";
        g.fillText(sim.domain.toUpperCase(), w / 2, h * 0.14);
        g.fillStyle = "#eaf6fb";
        g.font = `600 ${Math.round(h * 0.24)}px 'Barlow Condensed', Arial, sans-serif`;
        g.fillText(sim.name.toUpperCase(), w / 2, h * 0.4);
        g.fillStyle = accentCss;
        g.font = `${Math.round(h * 0.1)}px Arial, sans-serif`;
        g.fillText(sim.trade, w / 2, h * 0.64);
        g.fillStyle = "#6d8296";
        g.font = `500 ${Math.round(h * 0.08)}px 'Barlow Condensed', Arial, sans-serif`;
        g.fillText(`SMARTCITI.X~ ${sim.name.toUpperCase()} VR`, w / 2, h * 0.84);
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

  const key = new THREE.DirectionalLight(0xdbe6f2, 0.7);
  key.position.set(3, 8, 4);
  root.add(key);
  root.add(new THREE.HemisphereLight(0x8ea9c2, 0x1e242b, 1.3));

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
