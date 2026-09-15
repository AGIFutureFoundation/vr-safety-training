import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, ball, torus, slab, group, decal, repaint, signFace, particles, markInteractive, mat, HUD,
} from "../../shared/kit.js";
import { Progress } from "../../shared/game.js";

// The hub: a round atrium with one doorway per trade. Each doorway carries the
// learner's own record for that room, so progress is legible from the middle of
// the floor without opening a menu.

export function buildHub(root, rooms) {
  const hits = {};
  const reg = (obj, id) => { markInteractive(obj, id); hits[id] = obj; return obj; };
  const R = 5.6;

  // Floor: polished disc with an inlaid ring and radial seams.
  const floor = cyl(root, R + 1.6, R + 1.6, 0.2, 0, -0.1, 0, 0x1b2027, { rough: 0.35, metal: 0.25, seg: 48 });
  floor.receiveShadow = true;
  torus(root, R - 0.9, 0.03, 0, 0.012, 0, 0x37d6c0, { rough: 0.4, emissive: 0x1c6f66, ei: 1.2, cast: false })
    .rotation.x = -Math.PI / 2;
  torus(root, 1.5, 0.02, 0, 0.012, 0, 0x2c3a46, { rough: 0.5, cast: false }).rotation.x = -Math.PI / 2;

  // Perimeter wall with a clerestory band.
  const wall = cyl(root, R + 1.6, R + 1.6, 3.6, 0, 1.8, 0, 0x39434e,
    { rough: 0.9, seg: 48, open: true, side: 2, cast: false });
  wall.receiveShadow = true;
  torus(root, R + 1.55, 0.05, 0, 3.02, 0, 0x37d6c0, { rough: 0.4, emissive: 0x37d6c0, ei: 2.2, cast: false })
    .rotation.x = -Math.PI / 2;
  cyl(root, R + 1.6, R + 1.6, 0.16, 0, 3.68, 0, 0x232a31, { rough: 0.95, seg: 48, cast: false });
  // Lit cove ring just under the ceiling — this is what stops the frame going black.
  const cove = cyl(root, R + 1.2, R + 1.4, 0.1, 0, 3.5, 0, 0xdfe9f2,
    { rough: 0.4, emissive: 0xcfe0ee, ei: 1.5, seg: 48, cast: false, open: true, side: 2 });
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    const cl = new THREE.PointLight(0xcfe0ee, 1.15, 11, 2);
    cl.position.set(Math.sin(a) * (R - 0.6), 3.2, Math.cos(a) * (R - 0.6));
    root.add(cl);
  }

  // Central progress pillar.
  const pillar = group(root, 0, 0, 0);
  cyl(pillar, 0.55, 0.7, 0.18, 0, 0.09, 0, 0x232b33, { rough: 0.5, metal: 0.3, seg: 30 });
  cyl(pillar, 0.34, 0.4, 0.78, 0, 0.47, 0, 0x2b343d, { rough: 0.45, metal: 0.35, seg: 30 });
  const capital = cyl(pillar, 0.52, 0.36, 0.12, 0, 0.92, 0, 0x323c46, { rough: 0.45, metal: 0.35, seg: 30 });
  const statBoards = [];
  for (let i = 0; i < 3; i++) {
    const a = (i / 3) * Math.PI * 2;
    const b = group(pillar, Math.sin(a) * 0.42, 1.2, Math.cos(a) * 0.42, a);
    box(b, 0.72, 0.5, 0.04, 0, 0, 0, 0x11181f, { rough: 0.6 });
    const faceMesh = decal(b, 0.66, 0.44, 0, 0, 0.025, () => {}, { glow: true, ei: 0.75, px: 512 });
    statBoards.push(faceMesh);
  }
  const beacon = ball(pillar, 0.09, 0, 1.58, 0, 0x37d6c0, { emissive: 0x37d6c0, ei: 2.6, rough: 0.3 });
  const motes = particles(pillar, 60, 0x37d6c0, { size: 0.02, life: 3.2, opacity: 0.5 });
  motes.visible = true;

  function paintStats() {
    const p = Progress;
    const { into, span } = p.xpIntoLevel;
    for (const b of statBoards) {
      repaint(b, (g, w, h) => {
        g.fillStyle = "#0b1219"; g.fillRect(0, 0, w, h);
        g.fillStyle = HUD.accent; g.fillRect(0, 0, w, 5);
        g.fillStyle = HUD.muted;
        g.font = `600 ${Math.round(h * 0.085)}px 'Barlow Condensed', Arial, sans-serif`;
        g.textAlign = "left"; g.textBaseline = "middle";
        g.fillText("APPRENTICE RECORD", w * 0.07, h * 0.16);
        g.fillStyle = HUD.text;
        g.font = `600 ${Math.round(h * 0.24)}px 'Barlow Condensed', Arial, sans-serif`;
        g.fillText(`LEVEL ${p.level}`, w * 0.07, h * 0.37);
        g.font = `600 ${Math.round(h * 0.13)}px 'Barlow Condensed', Arial, sans-serif`;
        g.fillStyle = HUD.accent;
        g.textAlign = "right";
        g.fillText(`${p.totalStars} ★`, w * 0.93, h * 0.37);
        g.textAlign = "left";
        // XP bar
        g.fillStyle = "#1d2833"; g.fillRect(w * 0.07, h * 0.52, w * 0.86, h * 0.07);
        g.fillStyle = HUD.accent;
        g.fillRect(w * 0.07, h * 0.52, w * 0.86 * Math.max(0.02, into / span), h * 0.07);
        g.fillStyle = HUD.muted;
        g.font = `${Math.round(h * 0.085)}px Arial, sans-serif`;
        g.fillText(`${p.data.xp} XP · ${p.completedRooms}/${rooms.length} rooms cleared`, w * 0.07, h * 0.68);
        const badges = p.data.badges.length ? p.data.badges.join(" · ") : "no badges yet";
        g.fillStyle = HUD.text;
        g.fillText(badges.length > 46 ? badges.slice(0, 45) + "…" : badges, w * 0.07, h * 0.83);
      });
    }
  }
  paintStats();

  // One doorway per trade, evenly spaced around the atrium.
  const doorFaces = {};
  rooms.forEach((room, i) => {
    const a = (i / rooms.length) * Math.PI * 2 - Math.PI / 2;
    const dx = Math.sin(a) * R, dz = Math.cos(a) * R;
    const bay = group(root, dx, 0, dz, a + Math.PI);

    // Portal frame.
    box(bay, 2.3, 0.28, 0.34, 0, 2.74, 0, 0x39434d, { rough: 0.5, metal: 0.4 });
    for (const sx of [-1, 1]) box(bay, 0.24, 2.6, 0.34, sx * 1.03, 1.3, 0, 0x39434d, { rough: 0.5, metal: 0.4 });
    const glow = box(bay, 1.84, 2.5, 0.06, 0, 1.3, -0.1, room.accent,
      { emissive: room.accent, ei: 1.05, rough: 0.4, opacity: 0.72, cast: false });
    box(bay, 1.84, 0.05, 0.3, 0, 0.03, 0.06, room.accent, { emissive: room.accent, ei: 1.4, rough: 0.4, cast: false });

    // Trade sign.
    const sign = decal(bay, 2.0, 0.44, 0, 3.05, 0.02, () => {}, { px: 512, glow: true, ei: 0.5 });
    // Record plaque beside the door.
    const plaque = decal(bay, 0.86, 0.62, 1.62, 1.5, 0.06, () => {}, { px: 384, glow: true, ei: 0.45 });
    plaque.rotation.y = -0.5;
    box(bay, 0.92, 0.68, 0.04, 1.62, 1.5, 0.04, 0x11181f, { rough: 0.6 }).rotation.y = -0.5;
    doorFaces[room.id] = { sign, plaque, room };

    // Floor spot in the room's accent, so the hub reads at a glance.
    cyl(bay, 1.05, 1.05, 0.008, 0, 0.014, 0.95, room.accent,
      { rough: 0.6, emissive: room.accent, ei: 0.75, cast: false, seg: 28 });
    reg(box(bay, 1.9, 2.5, 0.5, 0, 1.25, 0.2, 0x000000, { opacity: 0.001, transparent: true, cast: false }),
      `door-${room.id}`);

    const lamp = new THREE.PointLight(room.accent, 2.4, 7, 2);
    lamp.position.set(dx * 0.8, 2.4, dz * 0.8);
    root.add(lamp);
  });

  function paintDoors() {
    for (const id of Object.keys(doorFaces)) {
      const { sign, plaque, room } = doorFaces[id];
      const state = Progress.roomState(id);
      repaint(sign, (g, w, h) => {
        g.fillStyle = "#0b1219"; g.fillRect(0, 0, w, h);
        g.fillStyle = room.accentCss; g.fillRect(0, h - 6, w, 6);
        g.fillStyle = HUD.text;
        g.font = `600 ${Math.round(h * 0.5)}px 'Barlow Condensed', Arial, sans-serif`;
        g.textAlign = "center"; g.textBaseline = "middle";
        g.fillText(room.title.toUpperCase(), w / 2, h * 0.42);
        g.fillStyle = room.accentCss;
        g.font = `600 ${Math.round(h * 0.2)}px 'Barlow Condensed', Arial, sans-serif`;
        g.fillText(room.trade.toUpperCase(), w / 2, h * 0.78);
      });
      repaint(plaque, (g, w, h) => {
        g.fillStyle = "#0b1219"; g.fillRect(0, 0, w, h);
        g.fillStyle = room.accentCss; g.fillRect(0, 0, 6, h);
        g.textAlign = "left"; g.textBaseline = "middle";
        g.fillStyle = HUD.muted;
        g.font = `600 ${Math.round(h * 0.1)}px 'Barlow Condensed', Arial, sans-serif`;
        g.fillText("YOUR RECORD", w * 0.09, h * 0.15);
        g.font = `${Math.round(h * 0.34)}px Arial, sans-serif`;
        g.fillStyle = state.stars ? "#f2c14b" : "#2c3a46";
        g.fillText("★★★".slice(0, state.stars * 1 || 0).padEnd(0), w * 0.09, h * 0.4);
        g.fillStyle = "#2c3a46";
        g.fillText("★★★", w * 0.09, h * 0.4);
        if (state.stars) {
          g.fillStyle = "#f2c14b";
          g.fillText("★★★".slice(0, state.stars), w * 0.09, h * 0.4);
        }
        g.fillStyle = HUD.text;
        g.font = `${Math.round(h * 0.12)}px Arial, sans-serif`;
        g.fillText(state.runs ? `best ${state.best} pts` : "not attempted", w * 0.09, h * 0.66);
        g.fillStyle = HUD.muted;
        g.fillText(state.bestTime != null ? `${state.bestTime}s · ${state.runs} run${state.runs === 1 ? "" : "s"}` : "step in to begin",
          w * 0.09, h * 0.84);
      });
    }
  }
  paintDoors();

  const key = new THREE.DirectionalLight(0xdbe6f2, 0.75);
  key.position.set(3, 8, 4);
  root.add(key);
  root.add(new THREE.HemisphereLight(0x8ea9c2, 0x1e242b, 1.35));

  return {
    hits,
    isHub: true,
    spawnLook: new THREE.Vector3(0, 1.5, 0),
    refresh() { paintStats(); paintDoors(); },
    animate(t, dt) {
      beacon.material.emissiveIntensity = 2.0 + Math.sin(t * 1.6) * 0.7;
      beacon.position.y = 1.58 + Math.sin(t * 0.9) * 0.04;
      capital.rotation.y = t * 0.12;
      motes.userData.step(dt * 0.3, new THREE.Vector3(0, 0.9, 0), 1.1, 0.12, 0.02);
    },
  };
}
