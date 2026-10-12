// ROBOTS-HD — the robots themselves in high detail (console `rhd`, docs/consoles/ROBOTS-HD.md).
// SmartCiti.X Powered by AGI Corp.
//
// The four simulated rig kinds ROBOTICS draws (rb-world.js RB_RIG_TYPES: cobot, amr, gantry, cell) at full detail on the
// DESKTOP HIGH TIER ONLY: a collaborative arm with joint housings, cable runs, a tool flange and a gripper; an AMR carrier with
// bumpers, a lidar puck, a status light bar and casters; a gantry with rails, a carriage, a hoist and a cable chain; and the
// fenced cell's guarding (mesh panels on posts, an interlocked door) round a heavier industrial arm. Procedural and generic by
// kind: geometry from code, one canvas for the guard mesh, no logo, no maker's likeness, no product. Balanced, the phone tier
// and a standalone headset browser keep today's rigs exactly (rhdAllowed is false there and nothing is built).
//
// Robots are simulated. The status light SHOWS a state the page already has and never invents one (rhdLightState): the site's
// own speed-and-separation state from rb-world.js (rbSiteEvent: estopped / locked -> e-stop red, mode "stop" -> protective stop
// amber, otherwise running green) or a VBRIDGE governor monitor decision (vb-governor.js: "estop" -> red, "protective-stop" ->
// amber, "continue" / "slow" -> green). With no state (a room whose site is on another map, a robot locked out on a stand) the
// light is dark. The speed-and-separation zone shows on the floor only when a person is inside the warning distance, by
// rb-env.js rbSsmMode — the same rule the site and the governor use.
//
// Each robot is merged per moving link (one mesh a link, vertex colours, one shared material), plus one status-light mesh and,
// outdoors, one floor-zone mesh. RHD_BUDGET states the triangle and draw-call budget of each robot; tools/check_robots_hd.mjs
// holds every build to it on the high tier and proves balanced / phone / headset build nothing.
//
// SEAMS (every top-level name is rhd/RHD_-prefixed: the bundler shares one scope; three.js comes from the caller):
//   RHD_KINDS, RHD_BUDGET, RHD_LIGHT                     plain data
//   rhdAllowed(tier, ua?)                                -> true only on the desktop high tier (not a Quest / PICO browser)
//   rhdLightState(src)                                   -> "running" | "protective-stop" | "e-stop" | null (dark)
//   rhdBuildRobot(THREE, kind, { zone, detail })         -> { kind, group, links, light, zone, meshes, triangles, calls,
//                                                             setLight(state), setZone(mode), pose(phase), roll(dist) }
//   rhdWorst(a, b)                                       -> the more severe of two light states (e-stop > protective stop > running)
//   rhdJobRun(vb)                                        -> { read() } the agent-jobs panel's live run: the site and each step's
//                                                           governor decision (vb-panel.js state().run), a halted run's last one
//   rhdMountRobots({ THREE, robotics, tier, ua, reducedMotion, jobs }) -> { on, robots, tick(dt, px, pz), measure(), run() }
//   rhdDressRoom({ three, group, room, tier, ua })       -> the room's HD robots (INTERIORS dresser, after ixr's)
//   rhdRoomLights(room, siteState, pose?)                -> the room robots' lights, and their floor zones by the room-local pose
//   rhdRegisterDressers(ix, { ua })                      -> styles registered

import { RB_SSM } from "./rb-robotics-data.js";
import { rbSsmMode } from "./rb-env.js";

export const RHD_KINDS = ["cobot", "amr", "gantry", "cell"];

/** Stated budgets per robot on the desktop high tier (triangles drawn, draw calls). "cell" is the industrial arm plus the
 *  guarding; "cell-arm" is the arm alone (the maintenance bay's arm on its stand). Balanced / phone: not built (0 / 0). */
export const RHD_BUDGET = {
  cobot: { triangles: 2000, calls: 8 },
  amr: { triangles: 1600, calls: 5 },
  gantry: { triangles: 3000, calls: 6 },
  cell: { triangles: 3600, calls: 10 },
  "cell-arm": { triangles: 2400, calls: 6 },
  drill: { triangles: 2400, calls: 5 }, // ROBOTS-HD-2: the drilling deck's robot (base, mast, light + the zone discs)
  "amr-room": { triangles: 600, calls: 3 }, // ROBOTS-HD-3: the AMR's room level (rooms only; the robot without its zone discs)
  straddle: { triangles: 900, calls: 3 }, // ROBOTS-HD-3: the port control room's straddle carrier in the window (rooms only)
};

/** The status light's colours. Three states, each the page's own. */
export const RHD_LIGHT = { running: 0x2fd05a, "protective-stop": 0xffa31a, "e-stop": 0xe02a24, off: 0x2a2f36 };

export function rhdAllowed(tier, ua = typeof navigator !== "undefined" ? navigator.userAgent : "") {
  return tier === "high" && !/OculusBrowser|PICO/i.test(ua || "");
}

/** The light for a state the page already has; null (dark) when there is none. Never a state of its own. */
export function rhdLightState(src) {
  if (!src || typeof src !== "object") return null;
  if (typeof src.action === "string") { // a VBRIDGE governor monitor decision
    if (src.action === "estop") return "e-stop";
    if (src.action === "protective-stop") return "protective-stop";
    if (src.action === "continue" || src.action === "slow") return "running";
    return null;
  }
  if (typeof src.mode === "string") { // an rb-world site state
    if (src.estopped || src.locked) return "e-stop";
    if (src.mode === "stop") return "protective-stop";
    if (src.mode === "full" || src.mode === "reduced") return "running";
  }
  return null;
}

const RHD_SEVERITY = { "e-stop": 3, "protective-stop": 2, running: 1 };
/** The more severe of two light states (null is no state): an e-stop on either wins, then a protective stop. */
export function rhdWorst(a, b) { return (RHD_SEVERITY[a] ?? 0) >= (RHD_SEVERITY[b] ?? 0) ? (a ?? b ?? null) : b; }

/**
 * The agent-jobs panel's live run (vb-panel.js vbMountDispatch): while a job runs on the simulated robot, the site and the
 * governor's monitor decision for the step the panel is on (`state().run`, the preview the panel steps through); once the
 * run is over, a run the governor HALTED (e-stop or protective stop) keeps its last decision — the real run's last step, the
 * one written to the audit chain — until the supervisor takes the next job; a run that finished cleanly hands back at once.
 * Nothing here decides: it only reads what the panel and the governor already decided. null when no run is showing.
 */
export function rhdJobRun(vb) {
  return {
    read() {
      let st = null; try { st = vb?.state?.() ?? null; } catch (_) { st = null; }
      const job = st?.job; if (!job?.id || !job.request?.siteId) return null;
      const base = { jobId: job.id, siteId: job.request.siteId };
      if (job.phase === "TRANSACTION" && st.run && typeof st.run.action === "string") return { ...base, step: st.run.step, of: st.run.of, decision: { action: st.run.action }, live: true };
      const steps = job.deliverable?.episode?.steps, halted = job.deliverable?.evalCard?.halted;
      const last = steps?.length ? steps[steps.length - 1]?.info?.governor : null;
      if (halted && typeof last === "string") return { ...base, step: steps.length - 1, of: steps.length, decision: { action: last }, live: false };
      return null;
    },
  };
}

// ------------------------------------------------------------------------------------------------------------ geometry

/** A merge kit: parts go in with a colour and a transform, one non-indexed BufferGeometry with vertex colours comes out. */
function rhdKit(THREE) {
  const parts = [];
  const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler();
  const put = (geo, col, x, y, z, rx = 0, ry = 0, rz = 0) => {
    m4.compose(new THREE.Vector3(x, y, z), q.setFromEuler(e.set(rx, ry, rz)), new THREE.Vector3(1, 1, 1));
    const g = geo.index ? geo.toNonIndexed() : geo; g.applyMatrix4(m4); parts.push([g, col]);
    if (g !== geo) geo.dispose();
  };
  return {
    box: (w, h, d, x, y, z, col, rx, ry, rz) => put(new THREE.BoxGeometry(w, h, d), col, x, y, z, rx, ry, rz),
    cyl: (rt, rb, h, seg, x, y, z, col, rx, ry, rz, open = false) => put(new THREE.CylinderGeometry(rt, rb, h, seg, 1, open), col, x, y, z, rx, ry, rz),
    tube: (a, b, r, seg, col) => { // a cylinder from point a to point b
      const dx = b[0] - a[0], dy = b[1] - a[1], dz = b[2] - a[2], L = Math.hypot(dx, dy, dz) || 1e-6;
      const g = new THREE.CylinderGeometry(r, r, L, seg, 1, true);
      const dir = new THREE.Vector3(dx / L, dy / L, dz / L), qq = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir);
      m4.compose(new THREE.Vector3((a[0] + b[0]) / 2, (a[1] + b[1]) / 2, (a[2] + b[2]) / 2), qq, new THREE.Vector3(1, 1, 1));
      const n = g.toNonIndexed(); g.dispose(); n.applyMatrix4(m4); parts.push([n, col]);
    },
    plane: (w, h, x, y, z, ry, col) => put(new THREE.PlaneGeometry(w, h), col, x, y, z, 0, ry, 0),
    geometry() {
      let n = 0; for (const [g] of parts) n += g.attributes.position.count;
      const pos = new Float32Array(n * 3), nor = new Float32Array(n * 3), colr = new Float32Array(n * 3), uv = new Float32Array(n * 2);
      const c = new THREE.Color(); let o = 0;
      for (const [g, col] of parts) {
        const k = g.attributes.position.count; c.setHex(col);
        pos.set(g.attributes.position.array, o * 3); nor.set(g.attributes.normal.array, o * 3);
        if (g.attributes.uv) uv.set(g.attributes.uv.array, o * 2);
        for (let i = 0; i < k; i++) { colr[(o + i) * 3] = c.r; colr[(o + i) * 3 + 1] = c.g; colr[(o + i) * 3 + 2] = c.b; }
        o += k; g.dispose();
      }
      parts.length = 0;
      const out = new THREE.BufferGeometry();
      out.setAttribute("position", new THREE.BufferAttribute(pos, 3)); out.setAttribute("normal", new THREE.BufferAttribute(nor, 3));
      out.setAttribute("color", new THREE.BufferAttribute(colr, 3)); out.setAttribute("uv", new THREE.BufferAttribute(uv, 2));
      out.computeBoundingSphere();
      return out;
    },
  };
}

const RHD_C = { white: 0xeef0f2, grey: 0x5d6a78, dark: 0x22272d, mid: 0x8b959c, blue: 0x3a8fd8, orange: 0xe2701f, amber: 0xf2a33a, yellow: 0xe0c341, steel: 0x6b7178, rubber: 0x15181c, black: 0x2a2f36 };
const RHD_MAT_CACHE = new WeakMap();
function rhdBodyMaterial(THREE) {
  let m = RHD_MAT_CACHE.get(THREE);
  if (!m) { m = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.55, metalness: 0.12 }); m.name = "rhd-body"; RHD_MAT_CACHE.set(THREE, m); }
  return m;
}
let rhdMeshTex = null;
/** The guard mesh: a 128 px canvas of wire squares with alpha (drawn from code). */
function rhdGuardTexture(THREE) {
  if (rhdMeshTex) return rhdMeshTex;
  const cv = typeof document !== "undefined" ? document.createElement("canvas") : null;
  if (!cv) return null;
  cv.width = cv.height = 128; const g = cv.getContext("2d");
  g.clearRect(0, 0, 128, 128); g.strokeStyle = "rgba(40,44,50,0.95)"; g.lineWidth = 2;
  for (let i = 0; i <= 128; i += 16) { g.beginPath(); g.moveTo(i, 0); g.lineTo(i, 128); g.stroke(); g.beginPath(); g.moveTo(0, i); g.lineTo(128, i); g.stroke(); }
  rhdMeshTex = new THREE.CanvasTexture(cv); rhdMeshTex.name = "rhd-guard-mesh"; rhdMeshTex.wrapS = rhdMeshTex.wrapT = THREE.RepeatWrapping;
  return rhdMeshTex;
}

function rhdMesh(THREE, kit, name, parent, mat = rhdBodyMaterial(THREE)) {
  const m = new THREE.Mesh(kit.geometry(), mat); m.name = name; parent.add(m); return m;
}

/** A link group at a pivot. */
function rhdLink(THREE, parent, name, x, y, z) { const g = new THREE.Group(); g.name = name; g.position.set(x, y, z); parent.add(g); return g; }

// The arm (cobot or industrial): base, turret (yaw), upper arm (pitch), forearm (pitch), wrist (pitch) with flange and gripper.
function rhdArm(THREE, root, s, heavy, pedestal = true) {
  const C = RHD_C, body = heavy ? C.orange : C.white, accent = heavy ? C.dark : C.blue, seg = heavy ? 14 : 16;
  const k = rhdKit(THREE), links = {};
  // Base: pedestal (cobot) or a block plinth (industrial), the base housing, a cable run down the side to a floor box.
  if (!pedestal) { k.cyl(0.3 * s, 0.32 * s, 0.05, seg, 0, 0.025, 0, C.dark); for (let i = 0; i < 4; i++) k.cyl(0.02, 0.02, 0.03, 6, Math.cos(i * 1.571 + 0.785) * 0.26 * s, 0.06, Math.sin(i * 1.571 + 0.785) * 0.26 * s, C.mid); }
  else if (heavy) { k.box(1.1, 0.9, 1.1, 0, 0.45, 0, 0x4a5058); k.box(1.16, 0.06, 1.16, 0, 0.9, 0, C.dark); for (const [x, z] of [[-0.45, -0.45], [0.45, -0.45], [-0.45, 0.45], [0.45, 0.45]]) k.cyl(0.04, 0.04, 0.05, 8, x, 0.925, z, C.mid); }
  else { k.cyl(0.35, 0.45, 0.8, seg, 0, 0.4, 0, C.grey); k.cyl(0.5, 0.5, 0.04, seg, 0, 0.02, 0, C.dark); for (let i = 0; i < 4; i++) k.cyl(0.03, 0.03, 0.05, 6, Math.cos(i * 1.571 + 0.785) * 0.42, 0.06, Math.sin(i * 1.571 + 0.785) * 0.42, C.mid); }
  const top = !pedestal ? 0.05 : heavy ? 0.93 : 0.82;
  k.cyl(0.26 * s, 0.3 * s, 0.14, seg, 0, top + 0.07, 0, body);
  if (pedestal) {
    k.box(0.08, top - 0.1, 0.06, heavy ? -0.58 : -0.4, (top - 0.1) / 2 + 0.05, 0, C.dark); // cable run down the base
    k.box(0.22, 0.14, 0.18, heavy ? -0.7 : -0.52, 0.07, 0, C.dark); // floor connector box
  } else k.box(0.12 * s, 0.06, 0.1 * s, -0.3 * s, 0.03, 0, C.dark); // connector at the back of the base plate
  rhdMesh(THREE, k, "rhd-arm-base", root);
  // Turret.
  const turret = links.turret = rhdLink(THREE, root, "rhd-arm-turret", 0, top + 0.14, 0);
  k.cyl(0.22 * s, 0.25 * s, 0.24, seg, 0, 0.12, 0, body);
  k.cyl(0.17 * s, 0.17 * s, 0.34 * s, seg, 0, 0.3, 0, body, 0, 0, Math.PI / 2); // shoulder joint housing (axis along x)
  k.cyl(0.175 * s, 0.175 * s, 0.03, seg, 0.17 * s + 0.015, 0.3, 0, accent, 0, 0, Math.PI / 2);
  k.cyl(0.175 * s, 0.175 * s, 0.03, seg, -0.17 * s - 0.015, 0.3, 0, accent, 0, 0, Math.PI / 2);
  rhdMesh(THREE, k, "rhd-arm-turret-body", turret);
  // Upper arm: a tube from the shoulder to the elbow along +y (the link pitches about x), a cable run with clamps.
  const L1 = 0.72 * s, L2 = 0.62 * s, r1 = 0.085 * s, r2 = 0.07 * s;
  const upper = links.upper = rhdLink(THREE, turret, "rhd-arm-upper", 0, 0.3, 0);
  if (heavy) k.box(r1 * 2.4, L1, r1 * 2.2, 0, L1 / 2, 0, body); else k.cyl(r1, r1, L1, seg, 0, L1 / 2, 0, body, 0, 0, 0, true);
  k.cyl(0.14 * s, 0.14 * s, 0.28 * s, seg, 0, L1, 0, body, 0, 0, Math.PI / 2); // elbow housing
  k.cyl(0.145 * s, 0.145 * s, 0.025, seg, 0.14 * s + 0.0125, L1, 0, accent, 0, 0, Math.PI / 2);
  k.tube([-0.12 * s, 0.08, -0.05 * s], [-0.12 * s, L1 - 0.1, -0.05 * s], 0.018 * s, 6, C.dark);
  for (const t of [0.25, 0.6]) k.box(0.05 * s, 0.03, 0.06 * s, -0.1 * s, L1 * t, -0.05 * s, C.mid);
  rhdMesh(THREE, k, "rhd-arm-upper-body", upper);
  // Forearm.
  const fore = links.fore = rhdLink(THREE, upper, "rhd-arm-fore", 0, L1, 0);
  if (heavy) k.box(r2 * 2.2, L2, r2 * 2.2, 0, L2 / 2, 0, body); else k.cyl(r2, r2 * 0.9, L2, seg, 0, L2 / 2, 0, body, 0, 0, 0, true);
  k.cyl(0.1 * s, 0.1 * s, 0.2 * s, seg, 0, L2, 0, body, 0, 0, Math.PI / 2); // wrist housing
  k.tube([0.1 * s, 0.06, -0.04 * s], [0.1 * s, L2 - 0.08, -0.04 * s], 0.015 * s, 6, C.dark);
  k.box(0.04 * s, 0.03, 0.05 * s, 0.09 * s, L2 * 0.5, -0.04 * s, C.mid);
  rhdMesh(THREE, k, "rhd-arm-fore-body", fore);
  // Wrist: a short roll housing, the tool flange (accent ring, bolt circle), the gripper body and two fingers.
  const wrist = links.wrist = rhdLink(THREE, fore, "rhd-arm-wrist", 0, L2, 0);
  k.cyl(0.075 * s, 0.075 * s, 0.14 * s, seg, 0, 0.08 * s, 0, body);
  k.cyl(0.07 * s, 0.07 * s, 0.03 * s, seg, 0, 0.165 * s, 0, accent); // tool flange
  for (let i = 0; i < 6; i++) k.cyl(0.008 * s, 0.008 * s, 0.01, 4, Math.cos(i * 1.047) * 0.05 * s, 0.183 * s, Math.sin(i * 1.047) * 0.05 * s, C.mid);
  k.box(0.16 * s, 0.07 * s, 0.09 * s, 0, 0.215 * s, 0, C.dark); // gripper body
  for (const x of [-0.055, 0.055]) { k.box(0.025 * s, 0.11 * s, 0.05 * s, x * s, 0.3 * s, 0, C.mid); k.box(0.03 * s, 0.025 * s, 0.055 * s, x * s * 0.8, 0.35 * s, 0, C.rubber); }
  rhdMesh(THREE, k, "rhd-arm-wrist-body", wrist);
  // The status light: a ring round the base housing (cobot) or a beacon on the plinth's corner (industrial).
  const lm = new THREE.MeshBasicMaterial({ color: RHD_LIGHT.off, vertexColors: true }); lm.name = "rhd-status-light";
  if (heavy && pedestal) { // a beacon on a post at the plinth's corner, above the guarding's top rail so it reads from outside the fence
    k.box(0.08, 0.08, 1.2, 0.47, 0.98, 0.47, C.dark, Math.PI / 2, 0, 0);
    k.cyl(0.11, 0.11, 0.05, 12, 0.47, 1.6, 0.47, C.dark); k.cyl(0.1, 0.1, 0.28, 14, 0.47, 1.765, 0.47, 0xffffff); k.cyl(0.11, 0.11, 0.04, 12, 0.47, 1.925, 0.47, C.dark);
  }
  else k.cyl(0.305 * s, 0.305 * s, 0.035, seg, 0, top + 0.012, 0, 0xffffff, 0, 0, 0, true);
  const light = rhdMesh(THREE, k, "rhd-status-light", root, lm);
  return { links, light };
}

// The fenced cell's guarding (outdoor): mesh panels on posts round the stop zone, an interlocked door on the front.
function rhdGuarding(THREE, parent) {
  const C = RHD_C, k = rhdKit(THREE), half = (RB_SSM.stop * 2 - 1) / 2, H = 1.8, P = 0.08;
  const posts = [];
  for (let i = -2; i <= 2; i++) { const t = i / 2 * half; posts.push([t, -half], [t, half]); if (Math.abs(i) < 2) posts.push([-half, t], [half, t]); }
  for (const [x, z] of posts) { k.box(P, H + 0.1, P, x, (H + 0.1) / 2, z, C.yellow); k.box(0.2, 0.02, 0.2, x, 0.01, z, C.dark); }
  const rails = [[0, -half, 2 * half, 0], [0, half, 2 * half, 0], [-half, 0, 2 * half, Math.PI / 2], [half, 0, 2 * half, Math.PI / 2]];
  for (const [x, z, L, ry] of rails) for (const y of [0.15, H]) k.box(L, 0.05, 0.04, x, y, z, C.black, 0, ry, 0);
  // The door: a framed leaf on the front (+z) between the centre and the right posts, hinges, a handle and the interlock switch.
  const d0 = half * 0.5 * 0.1, d1 = half * 0.5 * 1.9, dz = half + 0.03, dw = d1 - d0, dc = (d0 + d1) / 2;
  for (const y of [0.18, H - 0.05, H / 2]) k.box(dw, 0.045, 0.045, dc, y, dz, C.yellow);
  for (const x of [d0, d1]) k.box(0.045, H - 0.2, 0.045, x, H / 2 + 0.06, dz, C.yellow);
  for (const y of [0.4, 1.4]) k.cyl(0.03, 0.03, 0.12, 8, d0 - 0.02, y, dz, C.dark);
  k.box(0.04, 0.22, 0.05, d1 - 0.12, 1.05, dz + 0.05, C.dark); // handle
  k.box(0.12, 0.16, 0.08, d1 + 0.12, 1.05, dz + 0.02, 0xd8322a); k.box(0.06, 0.06, 0.05, d1 + 0.03, 1.05, dz + 0.05, C.yellow); // interlock + tongue
  const frame = rhdMesh(THREE, k, "rhd-cell-guard-frame", parent);
  // Mesh infill: one plane a panel bay (both faces drawn), textured with the canvas grid.
  const tex = rhdGuardTexture(THREE);
  const mm = new THREE.MeshStandardMaterial({ color: 0x9aa1a8, roughness: 0.6, metalness: 0.2, transparent: true, alphaTest: 0.05, depthWrite: false, side: THREE.DoubleSide, map: tex });
  mm.name = "rhd-guard-mesh";
  const bay = half / 2;
  for (let i = 0; i < 4; i++) {
    const c = -half + bay * (i + 0.5);
    k.plane(bay - P, H - 0.2, c, H / 2 + 0.07, -half, 0, 0xffffff); k.plane(bay - P, H - 0.2, -half, H / 2 + 0.07, c, Math.PI / 2, 0xffffff); k.plane(bay - P, H - 0.2, half, H / 2 + 0.07, c, Math.PI / 2, 0xffffff);
    if (i !== 2) k.plane(bay - P, H - 0.2, c, H / 2 + 0.07, half, 0, 0xffffff); else k.plane(dw - 0.06, H - 0.3, dc, H / 2 + 0.07, dz, 0, 0xffffff);
  }
  const panels = rhdMesh(THREE, k, "rhd-cell-guard-mesh", parent, mm);
  // UVs in metres so the grid keeps its size on every panel.
  if (tex) { tex.repeat.set(1, 1); const uv = panels.geometry.attributes.uv; for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * bay * 4, uv.getY(i) * (H - 0.2) * 4); uv.needsUpdate = true; }
  return { frame, panels };
}

function rhdAmr(THREE, root, room = false) {
  // ROBOTS-HD-3: `room` is the AMR's room level (RHD_BUDGET["amr-room"]): a robot room never moves its robots, so the casters
  // under the skirts are one block each (no swivel plate or fork), the lidar puck is two rings, the drive wheels coarser; the
  // silhouette, bumpers, skirts, scanner window and the light bar are the same. It gives the AMR warehouse back the triangles
  // a third agent figure needs (the cap AVATARS-HD-5 and ROBOTS-HD-3 agreed: count every mesh that can be drawn).
  const C = RHD_C, k = rhdKit(THREE), links = {};
  // Chassis (forward is +z, the way the site's loop drives it): body, top deck, bumpers front and back, side skirts.
  k.box(0.78, 0.3, 1.14, 0, 0.27, 0, C.amber);
  k.box(0.7, 0.05, 1.0, 0, 0.445, 0, C.blue);
  for (const z of [-0.6, 0.6]) { k.box(0.8, 0.12, 0.07, 0, 0.18, z, C.rubber); k.box(0.62, 0.025, 0.075, 0, 0.255, z, C.yellow); }
  for (const x of [-0.4, 0.4]) k.box(0.025, 0.16, 0.9, x, 0.2, 0, C.dark);
  // Lidar puck on the front: base, a dark window band, a cap; a safety scanner window low on the front bumper.
  if (room) { k.cyl(0.08, 0.08, 0.06, 12, 0, 0.5, 0.42, C.dark); k.cyl(0.07, 0.075, 0.07, 12, 0, 0.565, 0.42, 0x0e1114); }
  else { k.cyl(0.075, 0.08, 0.04, 16, 0, 0.49, 0.42, C.dark); k.cyl(0.07, 0.07, 0.05, 16, 0, 0.535, 0.42, 0x0e1114); k.cyl(0.075, 0.07, 0.03, 16, 0, 0.575, 0.42, C.dark); }
  k.box(0.3, 0.05, 0.02, 0, 0.3, 0.575, 0x0e1114);
  // Casters at the four corners: a swivel plate, a fork and a small wheel.
  for (const [x, z] of [[-0.3, -0.45], [0.3, -0.45], [-0.3, 0.45], [0.3, 0.45]]) {
    if (room) { k.box(0.06, 0.12, 0.08, x, 0.06, z, C.mid); continue; }
    k.cyl(0.04, 0.04, 0.02, 10, x, 0.11, z, C.mid); k.box(0.012, 0.06, 0.05, x - 0.025, 0.07, z, C.mid); k.box(0.012, 0.06, 0.05, x + 0.025, 0.07, z, C.mid);
    k.cyl(0.035, 0.035, 0.03, 10, x, 0.035, z, C.rubber, 0, 0, Math.PI / 2);
  }
  rhdMesh(THREE, k, "rhd-amr-chassis", root);
  // Drive wheels: one axle across the middle, both wheels in one mesh so a turn about x turns both.
  const wheels = links.wheels = rhdLink(THREE, root, "rhd-amr-wheels", 0, 0.09, 0);
  for (const x of [-0.36, 0.36]) { k.cyl(0.09, 0.09, 0.05, room ? 12 : 16, x, 0, 0, C.rubber, 0, 0, Math.PI / 2); k.cyl(0.05, 0.05, 0.055, room ? 8 : 10, x, 0, 0, C.mid, 0, 0, Math.PI / 2); k.box(0.056, 0.02, 0.16, x, 0, 0, C.mid); }
  rhdMesh(THREE, k, "rhd-amr-wheel-pair", wheels);
  // The status light bar round the top edge.
  const lm = new THREE.MeshBasicMaterial({ color: RHD_LIGHT.off, vertexColors: true }); lm.name = "rhd-status-light";
  k.box(0.8, 0.03, 0.02, 0, 0.405, 0.575, 0xffffff); k.box(0.8, 0.03, 0.02, 0, 0.405, -0.575, 0xffffff);
  k.box(0.02, 0.03, 1.12, 0.395, 0.405, 0, 0xffffff); k.box(0.02, 0.03, 1.12, -0.395, 0.405, 0, 0xffffff);
  const light = rhdMesh(THREE, k, "rhd-status-light", root, lm);
  return { links, light };
}

// The gantry: rails on the ground along z (static, `ground`), legs on bogies, a box-girder bridge, a carriage that runs along
// the bridge (x) with a hoist, ropes and a spreader, and a cable chain in a tray on the bridge.
function rhdGantry(THREE, root, ground) {
  const C = RHD_C, k = rhdKit(THREE), links = {};
  if (ground) { for (const x of [-6, 6]) { k.box(0.16, 0.12, 12, x, 0.06, 0, C.steel); k.box(0.4, 0.03, 12, x, 0.015, 0, C.dark); } rhdMesh(THREE, k, "rhd-gantry-rails", ground); }
  for (const x of [-6, 6]) {
    k.box(0.5, 0.35, 1.4, x, 0.28, 0, C.yellow); for (const z of [-0.45, 0.45]) k.cyl(0.13, 0.13, 0.2, 12, x, 0.15, z, C.dark, 0, 0, Math.PI / 2);
    for (const z of [-0.45, 0.45]) k.box(0.32, 4.4, 0.32, x, 2.65, z, C.yellow);
    for (const y of [1.6, 3.2]) k.box(0.18, 0.18, 0.9, x, y, 0, C.yellow);
    k.tube([x, 0.6, -0.45], [x, 3.2, 0.45], 0.06, 6, C.yellow);
    k.box(0.12, 4.0, 0.12, x + (x < 0 ? -0.22 : 0.22), 2.6, 0, C.dark); // cable run down the leg
  }
  k.box(12.6, 0.55, 0.7, 0, 5.0, 0, C.yellow); // box girder
  for (let i = -5; i <= 5; i++) { k.box(0.04, 0.5, 0.74, i, 5.0, 0, C.steel); }
  k.box(12.4, 0.06, 0.08, 0, 5.32, -0.34, C.steel); k.box(12.4, 0.06, 0.08, 0, 5.32, 0.34, C.steel); // carriage rails
  k.box(6.2, 0.1, 0.22, -3.1, 5.33, 0.48, C.dark); // cable-chain tray
  for (let i = 0; i < 24; i++) k.box(0.2, 0.12, 0.16, -5.9 + i * 0.25, 5.43, 0.48, C.black); // chain links lying in the tray
  rhdMesh(THREE, k, "rhd-gantry-frame", root);
  const car = links.carriage = rhdLink(THREE, root, "rhd-gantry-carriage", 0, 0, 0);
  k.box(1.2, 0.5, 1.0, 0, 5.6, 0, 0x3d4650); for (const [x, z] of [[-0.45, -0.34], [0.45, -0.34], [-0.45, 0.34], [0.45, 0.34]]) k.cyl(0.08, 0.08, 0.06, 10, x, 5.38, z, C.dark, 0, 0, Math.PI / 2);
  k.cyl(0.18, 0.18, 0.8, 14, 0, 5.62, -0.15, C.mid, 0, 0, Math.PI / 2); // hoist drum
  for (const x of [-0.3, 0.3]) k.tube([x, 4.7, 0], [x, 2.4, 0], 0.015, 4, C.black); // ropes
  k.box(1.6, 0.12, 0.5, 0, 2.35, 0, C.yellow); k.box(0.12, 0.2, 0.5, -0.76, 2.25, 0, C.dark); k.box(0.12, 0.2, 0.5, 0.76, 2.25, 0, C.dark); // spreader
  k.box(0.2, 0.3, 0.6, 0.4, 5.6, 0.6, C.black); // chain end at the carriage
  rhdMesh(THREE, k, "rhd-gantry-carriage-body", car);
  const lm = new THREE.MeshBasicMaterial({ color: RHD_LIGHT.off, vertexColors: true }); lm.name = "rhd-status-light";
  k.cyl(0.06, 0.07, 0.06, 10, -0.4, 5.88, 0.3, 0x222222); k.cyl(0.07, 0.07, 0.16, 12, -0.4, 6.0, 0.3, 0xffffff);
  const light = rhdMesh(THREE, k, "rhd-status-light", car, lm);
  return { links, light };
}

// The straddle carrier (the port control room's window, ROBOTS-HD-3): two side frames on four wheels each, legs braced to a top
// beam, two cross beams, a cab high on one corner, a machinery house on top, a spreader on four ropes with a container under
// it, and two amber-capable beacons with a light bar along the top beam. Built at full size in metres (local origin on the
// ground at its centre, length along x, the two sides at ±z); the room shows it scaled down and flattened into the window
// band. Generic by kind, no words, no maker.
function rhdStraddle(THREE, root) {
  const C = RHD_C, k = rhdKit(THREE);
  for (const z of [-2.6, 2.6]) {
    for (const x of [-3.9, -2.4, 2.4, 3.9]) k.cyl(0.75, 0.75, 0.5, 12, x, 0.75, z, C.rubber, Math.PI / 2, 0, 0);
    k.box(9.4, 0.7, 0.7, 0, 1.6, z, C.yellow); // sill beam over the wheels
    for (const x of [-3.9, 3.9]) k.box(0.7, 12.4, 0.7, x, 8.1, z, C.yellow); // legs
    k.tube([-3.6, 2.2, z], [-1.2, 13.6, z], 0.18, 6, C.yellow); k.tube([3.6, 2.2, z], [1.2, 13.6, z], 0.18, 6, C.yellow); // braces
    k.box(9.8, 1.1, 0.9, 0, 14.4, z, C.yellow); // top beam
  }
  for (const x of [-3.9, 3.9]) k.box(0.9, 0.9, 6.1, x, 14.4, 0, C.yellow); // cross beams
  k.box(2.4, 2.3, 2.1, 4.3, 12.4, 3.4, C.white); k.box(2.42, 0.8, 2.12, 4.3, 12.9, 3.4, 0x0e1114); // cab, its window band
  k.box(3.0, 1.8, 2.2, -2.6, 15.85, 0, C.grey); // machinery house on top
  for (const [x, z] of [[-2.9, -1.0], [2.9, -1.0], [-2.9, 1.0], [2.9, 1.0]]) k.box(0.08, 4.6, 0.08, x, 11.6, z, C.dark); // ropes
  k.box(6.4, 0.45, 2.5, 0, 9.1, 0, C.dark); // spreader
  k.box(6.1, 2.6, 2.44, 0, 7.5, 0, C.blue); // the container it carries
  rhdMesh(THREE, k, "rhd-straddle-body", root);
  const lm = new THREE.MeshBasicMaterial({ color: RHD_LIGHT.off, vertexColors: true }); lm.name = "rhd-status-light";
  for (const x of [-4.6, 4.6]) k.box(0.9, 0.9, 0.9, x, 15.4, 2.6, 0xffffff); // beacons on the top beam's ends
  k.box(8.2, 0.45, 0.12, 0, 14.4, 3.1, 0xffffff); // light bar along the top beam's outer face
  const light = rhdMesh(THREE, k, "rhd-status-light", root, lm);
  return { links: {}, light };
}

// The ceiling-drilling robot (the drilling deck, ROBOTS-HD-2): a tracked base with outrigger jacks, a yellow upper body with
// an e-stop, a mast with a feed carriage and a cable chain, a drill head with a bit inside a dust shroud and its hose, and a
// swappable battery pack. Generic by kind; local origin at the centre of the base on the floor, the mast towards -z.
function rhdDrill(THREE, root) {
  const C = RHD_C, k = rhdKit(THREE), links = {};
  // Tracks: on each side a belt (a box with rounded ends), a drive sprocket, an idler, four road wheels and grouser pads.
  for (const x of [-0.55, 0.55]) {
    k.box(0.2, 0.06, 1.1, x, 0.03, 0, C.rubber); k.box(0.2, 0.06, 1.1, x, 0.27, 0, C.rubber);
    for (const z of [-0.55, 0.55]) k.cyl(0.15, 0.15, 0.2, 10, x, 0.15, z, C.rubber, 0, 0, Math.PI / 2);
    for (const z of [-0.55, 0.55]) k.cyl(0.11, 0.11, 0.22, 10, x, 0.15, z, C.steel, 0, 0, Math.PI / 2);
    for (const z of [-0.3, -0.1, 0.1, 0.3]) k.cyl(0.07, 0.07, 0.22, 8, x, 0.12, z, C.mid, 0, 0, Math.PI / 2);
    for (let i = 0; i < 9; i++) { const z = -0.48 + i * 0.12; k.box(0.21, 0.025, 0.04, x, 0.305, z, C.black); }
    k.box(0.04, 0.16, 1.0, x + (x < 0 ? 0.12 : -0.12), 0.16, 0, C.dark); // track frame
  }
  // Chassis between the tracks; four outrigger jacks with pads at the corners (deployed to the deck, the set-up position).
  k.box(0.86, 0.3, 1.36, 0, 0.36, 0, 0x2e3338);
  for (const [x, z] of [[-0.62, -0.72], [0.62, -0.72], [-0.62, 0.72], [0.62, 0.72]]) {
    k.box(0.32, 0.08, 0.1, x * 0.8, 0.42, z, C.yellow); k.box(0.08, 0.38, 0.08, x * 1.05, 0.23, z, C.yellow); k.cyl(0.1, 0.12, 0.04, 10, x * 1.05, 0.02, z, C.dark);
  }
  // The upper body: a yellow housing with a dark top plate, side vents, an e-stop on the rear corner, a slew ring below it.
  k.cyl(0.36, 0.36, 0.06, 20, 0, 0.54, 0, C.dark);
  k.box(0.8, 0.46, 0.9, 0, 0.8, 0.05, C.yellow); k.box(0.82, 0.04, 0.92, 0, 1.05, 0.05, C.dark);
  for (const x of [-0.405, 0.405]) for (let i = 0; i < 4; i++) k.box(0.01, 0.03, 0.5, x, 0.68 + i * 0.07, 0.1, C.dark);
  k.box(0.14, 0.1, 0.14, 0.3, 1.12, 0.42, C.yellow); k.cyl(0.055, 0.055, 0.05, 12, 0.3, 1.19, 0.42, 0xd8322a); // e-stop
  // The swappable battery pack on the rear deck: a case with a handle, two terminal caps, a charge strip.
  k.box(0.45, 0.28, 0.35, 0, 1.21, 0.42, 0x3f8f5a); k.box(0.47, 0.03, 0.37, 0, 1.36, 0.42, C.dark);
  k.box(0.3, 0.03, 0.03, 0, 1.43, 0.42, C.dark); for (const x of [-0.14, 0.14]) k.box(0.03, 0.07, 0.03, x, 1.395, 0.42, C.dark);
  for (const x of [-0.12, 0.12]) k.cyl(0.025, 0.025, 0.03, 8, x, 1.38, 0.32, x < 0 ? 0xd8322a : C.black);
  k.box(0.3, 0.02, 0.005, 0, 1.28, 0.598, 0x9be27a);
  // The control box and its cable to the mast.
  k.box(0.3, 0.26, 0.16, -0.24, 1.2, -0.25, C.dark); k.tube([-0.24, 1.33, -0.25], [-0.12, 1.5, -0.42], 0.02, 6, C.black);
  rhdMesh(THREE, k, "rhd-drill-base", root);
  // The mast (a square section with rails and slots), a feed carriage near the top, a cable chain beside it, the drill head
  // (motor housing, gearbox, chuck), the bit inside a dust shroud at the soffit, and the shroud's hose down to the deck.
  const mast = links.mast = rhdLink(THREE, root, "rhd-drill-mast", 0, 1.05, -0.1);
  k.box(0.2, 2.2, 0.2, 0, 1.1, 0, 0x5d6a78); k.box(0.24, 0.12, 0.24, 0, 0.06, 0, C.dark); k.box(0.24, 0.08, 0.24, 0, 2.18, 0, C.dark);
  for (const x of [-0.11, 0.11]) k.box(0.025, 2.1, 0.05, x, 1.1, -0.07, C.steel); // feed rails
  for (let i = 0; i < 3; i++) k.box(0.12, 0.04, 0.005, 0, 0.4 + i * 0.6, 0.1, C.dark); // slots
  k.box(0.08, 1.9, 0.12, 0.16, 1.05, 0.06, C.black); for (let i = 0; i < 8; i++) k.box(0.09, 0.05, 0.13, 0.16, 0.2 + i * 0.24, 0.06, C.dark); // cable chain
  k.box(0.3, 0.34, 0.12, 0, 1.92, -0.15, C.yellow); // feed carriage
  k.cyl(0.13, 0.13, 0.3, 16, 0, 2.3, -0.15, C.dark); k.cyl(0.1, 0.13, 0.08, 16, 0, 2.49, -0.15, C.mid); // motor housing, gearbox
  k.cyl(0.045, 0.06, 0.08, 12, 0, 2.57, -0.15, C.steel); // chuck
  k.cyl(0.012, 0.012, 0.42, 6, 0, 2.82, -0.15, 0xc3c8cd); // bit
  k.cyl(0.14, 0.1, 0.16, 16, 0, 3.0, -0.15, 0x2c3a46, 0, 0, 0, true); k.cyl(0.145, 0.145, 0.02, 16, 0, 3.08, -0.15, C.rubber, 0, 0, 0, true); // dust shroud, open at the soffit, a brush lip
  k.tube([0.1, 2.95, -0.15], [0.3, 2.6, -0.1], 0.03, 6, C.black); k.tube([0.3, 2.6, -0.1], [0.36, 0.3, 0.0], 0.03, 6, C.black); // shroud hose down the mast
  rhdMesh(THREE, k, "rhd-drill-mast-body", mast);
  // The status light: a beacon on the upper body's front corner.
  const lm = new THREE.MeshBasicMaterial({ color: RHD_LIGHT.off, vertexColors: true }); lm.name = "rhd-status-light";
  k.cyl(0.07, 0.07, 0.04, 12, -0.3, 1.09, 0.42, C.dark); k.cyl(0.06, 0.06, 0.16, 14, -0.3, 1.19, 0.42, 0xffffff); k.cyl(0.065, 0.065, 0.03, 12, -0.3, 1.285, 0.42, C.dark);
  const light = rhdMesh(THREE, k, "rhd-status-light", root, lm);
  return { links, light };
}

/** The floor zone: an amber warning annulus and a red stop disc, shown only when a person is inside the warning distance. */
function rhdZone(THREE, parent) {
  const k = rhdKit(THREE);
  const warn = new THREE.RingGeometry(RB_SSM.stop, RB_SSM.warn, 48); const stop = new THREE.CircleGeometry(RB_SSM.stop, 40);
  const mats = [new THREE.MeshBasicMaterial({ color: 0xffb020, transparent: true, opacity: 0.22, depthWrite: false, side: 2 }), new THREE.MeshBasicMaterial({ color: 0xe0402a, transparent: true, opacity: 0.28, depthWrite: false, side: 2 })];
  const g = new THREE.Group(); g.name = "rhd-ssm-zone"; g.visible = false; parent.add(g);
  // ROBOTS-HD-3: hidden until a person is inside the warning distance, so it CAN be drawn and a room's cap counts it (the rule
  // agreed with AVATARS-HD-5: every hidden mesh under a robot room's group carries this tag; one hidden for good leaves the group).
  g.userData.rhdCanShow = "ssm-zone";
  const a = new THREE.Mesh(warn, mats[0]); a.name = "rhd-zone-warn"; a.rotation.x = -Math.PI / 2; a.position.y = 0.13;
  const b = new THREE.Mesh(stop, mats[1]); b.name = "rhd-zone-stop"; b.rotation.x = -Math.PI / 2; b.position.y = 0.14;
  a.userData.rhdCanShow = b.userData.rhdCanShow = "ssm-zone";
  g.add(a, b);
  return g;
}

/** The arm's key poses (turret yaw is the site's own sweep; these are the pitch joints), cycled with an eased blend. */
const RHD_ARM_KEYS = [[0.35, 1.25, 0.9], [0.75, 1.0, 0.75], [0.55, 1.45, 1.05], [0.2, 1.1, 0.7]];
function rhdEase(t) { return t * t * t * (t * (t * 6 - 15) + 10); } // smootherstep: zero speed and acceleration at each key

/**
 * Build one HD robot. kind: "cobot" | "amr" | "gantry" | "cell" | "cell-arm" | "drill". `zone` adds the floor zone (outdoors).
 * `ground` (optional): where static ground parts go (the gantry's rails, the cell's guarding) when the robot's group moves.
 */
export function rhdBuildRobot(THREE, kind, { zone = false, ground = null, scale = 1, pedestal = true, detail = "full" } = {}) {
  const group = new THREE.Group(); group.name = `rhd-robot-${kind}`; group.userData.rhd = kind;
  let r;
  if (kind === "cobot") r = rhdArm(THREE, group, scale, false, pedestal);
  else if (kind === "cell" || kind === "cell-arm") r = rhdArm(THREE, group, 1.45 * scale, true, pedestal);
  else if (kind === "amr") r = rhdAmr(THREE, group, detail === "room");
  else if (kind === "gantry") r = rhdGantry(THREE, group, ground ?? group);
  else if (kind === "drill") r = rhdDrill(THREE, group);
  else if (kind === "straddle") r = rhdStraddle(THREE, group);
  else throw new Error(`rhd: unknown robot kind "${kind}"`);
  let guard = null;
  if (kind === "cell") guard = rhdGuarding(THREE, ground ?? group);
  const zoneG = zone ? rhdZone(THREE, ground ?? group) : null;
  const meshesOf = (o) => { const out = []; o?.traverse?.((m) => { if (m.isMesh) out.push(m); }); return out; };
  const own = [...meshesOf(group), ...(guard ? [guard.frame, guard.panels] : []), ...(ground && kind === "gantry" ? meshesOf(ground).filter((m) => m.name === "rhd-gantry-rails") : [])];
  const tri = (m) => (m.geometry.index ? m.geometry.index.count : m.geometry.attributes.position.count) / 3;
  let wheelAngle = 0, rolled = 0, lightState = null;
  const robot = {
    kind, group, links: r.links, light: r.light, zone: zoneG, guard,
    meshes: own.length, triangles: own.reduce((a, m) => a + tri(m), 0), calls: own.length,
    zoneTriangles: zoneG ? meshesOf(zoneG).reduce((a, m) => a + tri(m), 0) : 0,
    get lightState() { return lightState; },
    /** Metres the AMR has rolled forward (signed), so a check can compare the wheels with the travel. */
    get rolled() { return rolled; },
    /** Show a state the page has (rhdLightState's output); null darkens the light. */
    setLight(state) { lightState = state && RHD_LIGHT[state] != null && state !== "off" ? state : null; r.light.material.color.setHex(RHD_LIGHT[lightState ?? "off"]); return lightState; },
    /** The floor zone for a speed-and-separation mode ("full" hides it). */
    setZone(mode) { if (!zoneG) return false; zoneG.visible = mode === "reduced" || mode === "stop"; zoneG.children[0].material.opacity = mode === "reduced" ? 0.34 : 0.18; zoneG.children[1].material.opacity = mode === "stop" ? 0.42 : 0.22; return zoneG.visible; },
    /** Pose for the site's phase: arm pitch joints eased between key poses, the gantry's carriage eased along the bridge. */
    pose(phase) {
      if (r.links.upper) {
        const t = ((phase * 0.35) % RHD_ARM_KEYS.length + RHD_ARM_KEYS.length) % RHD_ARM_KEYS.length, i = Math.floor(t), f = rhdEase(t - i);
        const a = RHD_ARM_KEYS[i], b = RHD_ARM_KEYS[(i + 1) % RHD_ARM_KEYS.length];
        r.links.upper.rotation.x = a[0] + (b[0] - a[0]) * f; r.links.fore.rotation.x = a[1] + (b[1] - a[1]) * f; r.links.wrist.rotation.x = a[2] + (b[2] - a[2]) * f;
      }
      if (r.links.carriage) { const t = (phase * 0.25) % 2, f = rhdEase(t < 1 ? t : 2 - t); r.links.carriage.position.x = -4 + 8 * f; }
    },
    /** Turn the AMR's drive wheels by a distance travelled along its forward axis (metres; negative backs up). */
    roll(dist) { if (!r.links.wheels) return 0; rolled += dist; wheelAngle = (wheelAngle + dist / 0.09) % (Math.PI * 2); r.links.wheels.rotation.x = wheelAngle; return wheelAngle; },
  };
  robot.pose(0);
  return robot;
}

// ------------------------------------------------------------------------------------------------------- outdoor mount

/**
 * Replace each robot site's rig with its HD robot on the desktop high tier (the rb-world rig meshes are hidden, not removed,
 * so a teleop pose source that drives the rig group still drives the HD robot inside it). Elsewhere: { on: false } and
 * nothing is built or hidden.
 */
export function rhdMountRobots({ THREE = null, robotics = null, tier = "balanced", ua = typeof navigator !== "undefined" ? navigator.userAgent : "", reducedMotion = false, jobs = null } = {}) {
  const off = { on: false, robots: [], tick() {}, measure: () => ({ robots: [] }), light: () => null, run: () => null };
  if (!THREE || !robotics || !rhdAllowed(tier, ua)) return off;
  const robots = [];
  for (const s of robotics.sites ?? []) {
    const rig = robotics.rigNode?.(s.id); if (!rig || !rig.parent) continue;
    const site = rig.parent, hidden = [];
    for (const m of rig.children) if (m.isMesh) { m.visible = false; hidden.push(m.name); }
    const fence = site.getObjectByName("rb-cell-fence"); if (fence) { fence.visible = false; hidden.push(fence.name); }
    const kind = s.rig === "cell" ? "cell" : s.rig;
    const ground = new THREE.Group(); ground.name = `rhd-ground-${s.id}`; site.add(ground);
    const robot = rhdBuildRobot(THREE, kind, { zone: true, ground });
    rig.add(robot.group);
    robots.push({ id: s.id, kind, robot, rig, site, hidden, last: { x: rig.position.x, z: rig.position.z }, phase: 0 });
  }
  const fwd = { x: 0, z: 0 };
  const follow = jobs ? (typeof jobs.read === "function" ? jobs : rhdJobRun(jobs)) : null;
  let run = null; const runLog = []; // one entry per (job, step) the light showed, for the drive and the check
  return {
    on: true, robots,
    /** Per frame, after rb-world's animate: the light from the site's state (and, while the agent-jobs panel runs a job on
     *  this site, the governor's decision for the step — the more severe wins), the zone from rbSsmMode, joints, wheels. */
    tick(dt, px = Infinity, pz = Infinity) {
      run = follow ? follow.read() : null;
      for (const R of robots) {
        const st = robotics.state?.(R.id) ?? null, s = robotics.sites.find((x) => x.id === R.id);
        const mine = run && run.siteId === R.id ? run : null;
        const shown = R.robot.setLight(mine ? rhdWorst(rhdLightState(st), rhdLightState(mine.decision)) : rhdLightState(st));
        if (mine) { const k = `${mine.jobId}:${mine.step}:${mine.live}`; if (runLog[runLog.length - 1]?.k !== k) { runLog.push({ k, jobId: mine.jobId, siteId: R.id, step: mine.step, of: mine.of, action: mine.decision.action, live: mine.live, site: rhdLightState(st), light: shown }); if (runLog.length > 400) runLog.shift(); } }
        const d = s ? Math.hypot(px - s.position[0], pz - s.position[1]) : Infinity;
        R.robot.setZone(rbSsmMode(d).mode);
        const speed = st && !st.estopped && !st.locked && (shown === "running") ? rbSsmMode(d).speed : 0;
        if (!reducedMotion) R.phase += dt * speed * 0.6;
        R.robot.pose(R.phase);
        if (R.kind === "amr") {
          const dx = R.rig.position.x - R.last.x, dz = R.rig.position.z - R.last.z, ry = R.rig.rotation.y;
          fwd.x = Math.sin(ry); fwd.z = Math.cos(ry);
          R.robot.roll(dx * fwd.x + dz * fwd.z);
          R.last.x = R.rig.position.x; R.last.z = R.rig.position.z;
        }
      }
    },
    light: (id) => robots.find((R) => R.id === id)?.robot.lightState ?? null,
    /** The agent-jobs run the lights followed on the last tick (null when none), and every (job, step) they showed. */
    run: () => run, runLog: () => runLog.map((e) => ({ ...e })),
    measure: () => ({ robots: robots.map((R) => ({ id: R.id, kind: R.kind, meshes: R.robot.meshes, triangles: R.robot.triangles, calls: R.robot.calls, zoneTriangles: R.robot.zoneTriangles, light: R.robot.lightState, zone: !!R.robot.zone?.visible, hidden: R.hidden })) }),
  };
}

// -------------------------------------------------------------------------------------------------------- the rooms

/** Which ROBO-INTERIORS parts each room's HD robots replace (tag + a test on the part's centre), and where the robots stand
 *  (room-local metres, yaw about +y). The drilling deck's tracked robot is the "drill" kind (ROBOTS-HD-2), rooms only.
 *  ROBOTS-HD-3: the port control room watches the yard through its window, so its robot is a straddle carrier OUT THERE: the
 *  window is a picture plane on the shell's north wall (ixr's "window wall", z = -5.99) with the mullions 0.12 m deep in front
 *  of it, so the carrier stands in one pane as a relief — 1:16 scale, turned three-quarters on, flattened to 7 cm between the
 *  picture and the mullions (`relief: { scale, depth }`), its wheels on the yard's pavement band. It replaces no part, has no
 *  floor zone (the zone would be on the yard, not the room floor) and shows the port site's state on its beacons. */
export const RHD_ROOM_ROBOTS = {
  "ixr-cell-hall": { strip: [["cell robot", () => true]], robots: [{ kind: "cell-arm", x: 0, y: 0, z: -4, yaw: 0, light: "site" }] },
  "ixr-cobot-lab": { strip: [["cobot arm", () => true], ["second cobot cell", (y) => y > 0.95]], robots: [{ kind: "cobot", x: -0.4, y: 0.9, z: -2.2, yaw: 0, light: "site", scale: 0.85, pedestal: false }, { kind: "cobot", x: -5.12, y: 0.9, z: -4.2, yaw: 0, light: "site", scale: 0.7, pedestal: false }] },
  "ixr-amr-warehouse": { strip: [["AMR", () => true], ["docked AMR", () => true]], robots: [{ kind: "amr", x: -3.5, y: 0, z: -3.0, yaw: 0, light: "site" }, { kind: "amr", x: -10.9, y: 0, z: 3.5, yaw: Math.PI / 2, light: "site" }] },
  "ixr-port-control": { strip: [], robots: [{ kind: "straddle", x: -5.69, y: 1.18, z: -5.95, yaw: -0.55, light: "site", zone: false, relief: { scale: 1 / 16, depth: 0.07 } }] },
  "ixr-drilling-deck": { strip: [["drilling robot", () => true], ["robot battery", () => true]], robots: [{ kind: "drill", x: 0, y: 0, z: -3.5, yaw: 0, light: "site" }] },
  "ixr-maint-bay": { strip: [["robot arm on the stand", () => true], ["AMR on the lift", () => true]], robots: [{ kind: "cell-arm", x: 3.6, y: 0.9, z: -3.2, yaw: 0, light: null, scale: 0.75, pedestal: false, parked: true }, { kind: "amr", x: 5.8, y: 0.7, z: -0.2, yaw: Math.PI / 2, light: null }] },
};

/** Drop the tagged instances from an ixr InstancedMesh (compacting it, so the dropped parts draw nothing). */
function rhdStrip(im, rules, THREE) {
  const tags = im.userData?.ixrTags; if (!tags) return 0;
  const m4 = new THREE.Matrix4(), c = new THREE.Color(), p = new THREE.Vector3(), keep = [];
  for (let i = 0; i < im.count; i++) {
    im.getMatrixAt(i, m4); p.setFromMatrixPosition(m4);
    if (!rules.some(([tag, test]) => tags[i] === tag && test(p.y))) keep.push(i);
  }
  const dropped = im.count - keep.length; if (!dropped) return 0;
  const mats = keep.map((i) => { const m = new THREE.Matrix4(); im.getMatrixAt(i, m); return m; });
  const cols = im.instanceColor ? keep.map((i) => { const cc = new THREE.Color(); im.getColorAt(i, cc); return cc; }) : null;
  keep.forEach((_, j) => { im.setMatrixAt(j, mats[j]); if (cols) im.setColorAt(j, cols[j] ?? c); });
  im.userData.ixrTags = keep.map((i) => tags[i]);
  im.count = keep.length; im.instanceMatrix.needsUpdate = true; if (im.instanceColor) im.instanceColor.needsUpdate = true;
  return dropped;
}

/** INTERIORS dresser (runs after ixr's): the room's HD robots on the desktop high tier; elsewhere nothing. */
export function rhdDressRoom({ three: THREE, group, room, tier = "high", ua = typeof navigator !== "undefined" ? navigator.userAgent : "" }) {
  const spec = RHD_ROOM_ROBOTS[room?.id];
  if (!THREE || !spec || !rhdAllowed(tier, ua)) return null;
  let dropped = 0;
  group.traverse((o) => { if (o.isInstancedMesh && /^ixr-/.test(o.name)) dropped += rhdStrip(o, spec.strip, THREE); });
  const robots = spec.robots.map((q) => {
    // ROBOTS-HD-2: a robot that shows its site's state also gets the floor zone, on the room's floor under it (a bench or a
    // stand lifts the robot, never the zone); a robot locked out on a stand or a lift has none (de-energised).
    const floor = q.light === "site" && q.zone !== false ? new THREE.Group() : null;
    if (floor) { floor.name = `rhd-room-zone-${q.kind}`; floor.position.set(q.x, 0, q.z); group.add(floor); }
    const r = rhdBuildRobot(THREE, q.kind, { scale: q.scale ?? 1, pedestal: q.pedestal !== false, zone: !!floor, ground: floor, detail: q.kind === "amr" ? "room" : "full" });
    r.pose(q.parked ? 2.2 : 0);
    r.setLight(null); // dark until the app gives it the site's state (rhdRoomLights); a robot locked out on a stand stays dark
    if (q.relief) {
      // ROBOTS-HD-3: a relief in the window band. The holder scales the robot down and flattens it along the room's z (the
      // window's normal); the robot turns inside it, so its depth is squeezed after the turn and it stays inside `depth`.
      const holder = new THREE.Group(); holder.name = `rhd-relief-${q.kind}`; holder.position.set(q.x, q.y ?? 0, q.z);
      r.group.rotation.y = q.yaw; r.group.updateMatrixWorld(true);
      const box = new THREE.Box3().setFromObject(r.group), deep = Math.max(1e-6, box.max.z - box.min.z);
      holder.scale.set(q.relief.scale, q.relief.scale, q.relief.depth / deep);
      holder.add(r.group); group.add(holder);
    } else { r.group.position.set(q.x, q.y ?? 0, q.z); r.group.rotation.y = q.yaw; group.add(r.group); }
    return { ...q, robot: r };
  });
  room.rhd = { robots, dropped, triangles: robots.reduce((a, q) => a + q.robot.triangles, 0) };
  return room.rhd;
}

/** The room robots' lights from the room's site state (only robots marked "site"; a robot on a stand stays dark), and
 *  (ROBOTS-HD-2) each one's floor zone from the learner's room-local pose by rbSsmMode — the same rule as outdoors —
 *  shown only while the room has its site's state (dark when the site is on another map). */
export function rhdRoomLights(room, state, pose = null) {
  const out = [];
  const live = !!state && typeof state === "object" && typeof state.mode === "string";
  for (const q of room?.rhd?.robots ?? []) {
    out.push(q.robot.setLight(q.light === "site" ? rhdLightState(state) : null));
    if (q.robot.zone) q.robot.setZone(live && pose && Number.isFinite(pose.x) && Number.isFinite(pose.z) ? rbSsmMode(Math.hypot(pose.x - q.x, pose.z - q.z)).mode : "full");
  }
  return out;
}

export function rhdRegisterDressers(ix, { ua } = {}) {
  if (!ix || typeof ix.ixRegisterDresser !== "function") return [];
  const out = [];
  for (const st of Object.keys(RHD_ROOM_ROBOTS)) { ix.ixRegisterDresser(st, (a) => rhdDressRoom({ ...a, ...(ua != null ? { ua } : {}) })); out.push(st); }
  return out;
}
