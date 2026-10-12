// AVATARS-HD — the Omega Hive's software agents in high resolution (console AVATARS-HD, docs/consoles/AVATARS-HD.md).
// SmartCiti.X Holodeck · Powered by AGI Corp.
//
// The desktop "high" tier's agent figure: rounded procedural forms (a lathed torso and head, tapered limbs with rounded joints,
// jointed arms with simple mitten hands, feet), merged into ONE skinned mesh for the body and ONE unlit skinned mesh for what
// glows (the role-coloured visor band, the eyes on it, the thin halo ring, the badge, the tablet's screen), plus the mouth's lit
// opening, shown only while the agent talks. It reads as a software agent, never a person: a pale shell tinted by the agent's role
// colour with graphite joints (no skin tone anywhere), a glowing visor band across the eyes, a halo, and the "software agent ·
// <role>" label the mount adds. No real person's likeness: every figure is built from the persona's own numbers (its four traits,
// role colour and outfit, and a body type from its id).
//
// One description, three uses. aaHdSpec(agent) -> aaHdGeometry(spec) (plain arrays, no three.js) feeds
//   1. aaHdBuild(three, agent)  the three.js figure (SkinnedMesh + Skeleton, GPU skinning; 2 draw calls while silent);
//   2. aaHdRender(...)          a small software rasteriser: the roster portraits (aa-agent-portraits.js aaPortrait) and
//   3. aaHdSilhouette(...)      the silhouette masks the checker compares (the seven agents, 21 pairs).
// The pose is one pure function, aaHdPose(spec, st), applied to the bones in the page and to the arrays in the rasteriser.
//
// Personality in the body (traits in [0, 1], from the persona):
//   caution   upright spine and head, a slower idle and gesture tempo (a less careful agent leans forward a little);
//   warmth    an open stance: arms held away from the body, feet apart, palms turned a little forward, brows a little raised;
//   verbosity more hand motion: beat gestures on each word while speaking, a little hand motion at idle;
//   formality a tidier silhouette: arms close and hands together in front, a collar, weight even (low formality: weight on one
//             leg, a hip shift, a bent knee).
// Speech in the body: the mouth opens on each word onset (aaHdMouth; the mount supplies the onsets, from the voice's boundary
// events when voice is on, from the caption's word timing when it is off). Gestures: raise (a bid), accept (an award), stop (a
// refusal: AVATARS-HD-2, the hand held up in front of the chest, inside the shoulders, palm square to the front and fingers up, so it
// reads as "stop" from in front and never as the bid's raised hand), nod (an approval or a completion).
//
// Budget (desktop high only; balanced keeps crew.js's figure and the phone tier builds none): AA_HD_BUDGET, held by
// tools/check_agent_avatars.mjs. Every top-level name starts with `aa`/`AA_` (the bundler shares one scope). Nothing here calls a
// network, speaks or listens.
//
// SEAM:
//   aaHdSupported(three) -> bool         three.js has SkinnedMesh, Skeleton, Bone and BufferGeometry (else the mount builds today's figure)
//   aaHdSpec(agent) -> spec              body, colours, posture (from the traits), outfit, tablet, phase
//   aaHdGeometry(spec, level?) -> { body, glow, talk, bones, triangles }   plain arrays (positions, normals, colours, skin indices/weights);
//                                        level "full" (default, the outdoor figure) or "room" (AVATARS-HD-2: AA_HD_LOD.room, the robotics
//                                        rooms' figure: the same forms, colours, bones and pose with fewer segments, ≤ AA_HD_ROOM_BUDGET)
//   aaHdPose(spec, st) -> { r, s, o }    bone rotations, scales and offsets; st = { t, walking, walkPhase, speaking, mouth, beat,
//                                        gesture: { kind, k }, blink, reduced }
//   aaHdBuild(three, agent, spec?, { level }?) -> { group, body, glow, talk, bones, skeleton, apply(pose), triangles, spec, level }
//   aaHdRender(geo, pose, { w, h, view, crop, bg, ss }) -> { rgba, mask, w, h }    software raster (front or side, orthographic)
//   aaHdSilhouette(agent, { w, h, view }) -> mask (Uint8Array, 1 = figure)
//   aaHdMaskIoU(a, b) -> intersection over union of two masks
//   aaWordOnsets(text, durMs) -> [{ at, dur, word, char }] (ms from the line's start): the caption's word timing
//   aaHdMouth(onsets, ms) -> openness 0..1 at ms after the line's start

// No imports: the instructor console's bundle draws portraits from this module without crew.js or three.js. The two numbers it shares
// with crew.js (the figure ceiling and the six body types) are copied, and check_agent_avatars holds them equal.

/** The high tier's figure budget: meshes + sprites (crew.js CT_AVATAR_BUDGET, 12, as today), triangles and draw calls per figure. */
export const AA_HD_BUDGET = Object.freeze({ meshesAndSprites: 12, triangles: 3000, drawCallsSilent: 3, drawCallsSpeaking: 5 });
/** AVATARS-HD-2: the robotics rooms' figure budget. Three figures (H3_ROOM_FIGURES) must fit beside the busiest room's shell and its
 * high-tier lighting (2,780 triangles) inside IX_BUDGET's 6,000, so a room figure keeps to 1,000 triangles: no more than today's
 * figure (1,008 in its meshes), with 3 meshes where today's has 9. */
export const AA_HD_ROOM_BUDGET = Object.freeze({ meshesAndSprites: 12, triangles: 1000, drawCallsSilent: 3, drawCallsSpeaking: 5 });
/** AVATARS-HD-2: segment counts per level of detail. "full" is the outdoor figure as it was; "room" drops the thumb, uses lighter
 * trunk and limb profiles and fewer segments everywhere else. */
export const AA_HD_LOD = Object.freeze({
  full: Object.freeze({ trunk: 16, trunkLite: false, small: 12, neck: 10, head: [18, 10], mouth: [10, 4], cap: [10, 6], limb: 10, limbLite: false, hand: [8, 6], thumb: 6, foot: [10, 5], band: 16, eye: [8, 4], halo: [28, 3], badge: 10, talk: [8, 4] }),
  room: Object.freeze({ trunk: 8, trunkLite: true, small: 6, neck: 6, head: [10, 6], mouth: [6, 3], cap: [6, 3], limb: 6, limbLite: true, hand: [6, 3], thumb: 0, foot: [6, 3], band: 8, eye: [6, 2], halo: [12, 3], badge: 6, talk: [6, 3] }),
  // AVATARS-HD-3: the operations room's crowd (seven figures beside the room's own 2,022 triangles inside IX_BUDGET's 6,000): the same
  // forms, colours, bones and pose; a five-ring trunk, a three-ring vest and yoke, two-ring limbs (four-sided arms), a two-ring neck, no
  // brows and no dark mouth slot (the pose still moves their bones; the lit opening still shows the words), fewer segments elsewhere.
  // <= AA_HD_CROWD_BUDGET.
  crowd: Object.freeze({ trunk: 8, trunkLite: "crowd", small: 5, neck: 5, neckLite: true, head: [8, 5], mouth: null, cap: [6, 2], limb: 5, arm: 4, limbLite: "crowd", hand: [4, 3], thumb: 0, foot: [5, 2], band: 6, eye: [3, 2], halo: [8, 3], badge: 6, talk: [4, 2], brows: false, vestLite: true }),
});
/** AVATARS-HD-3: the ops room's crowd figure budget. Seven figures and the room's own 25 meshes and 2,022 triangles must stay inside
 * IX_BUDGET (120 meshes, 6,000 triangles): (6,000 - 2,022) / 7 = 568, so a crowd figure keeps to 540 triangles (3 meshes). */
export const AA_HD_CROWD_BUDGET = Object.freeze({ meshesAndSprites: 12, triangles: 540, drawCallsSilent: 3, drawCallsSpeaking: 5 });
/** crew.js CT_AVATAR_STYLES.body's heights and widths (the balanced figure's body types), so a figure keeps its build on every tier. */
export const AA_HD_BODY_DIMS = Object.freeze({ slender: { h: 1.0, w: 0.86 }, average: { h: 1.0, w: 1.0 }, broad: { h: 1.0, w: 1.18 }, tall: { h: 1.1, w: 0.98 }, compact: { h: 0.9, w: 1.04 }, full: { h: 0.98, w: 1.28 } });
/** The skeleton: name -> parent. */
export const AA_HD_BONES = Object.freeze({
  root: null, pelvis: "root", spine: "pelvis", chest: "spine", neck: "chest", head: "neck", mouth: "head", eyeL: "head", eyeR: "head",
  browL: "head", browR: "head", shoulderL: "chest", elbowL: "shoulderL", wristL: "elbowL", shoulderR: "chest", elbowR: "shoulderR",
  wristR: "elbowR", hipL: "pelvis", kneeL: "hipL", ankleL: "kneeL", hipR: "pelvis", kneeR: "hipR", ankleR: "kneeR",
});
const AA_HD_ORDER = Object.keys(AA_HD_BONES);
/** Gesture lengths (ms). */
export const AA_HD_GESTURE_MS = Object.freeze({ raise: 1400, accept: 1200, stop: 1800, nod: 900, approve: 900 });
const AA_HD_BODY_IDS = ["average", "slender", "tall", "broad", "compact", "full"]; // the same pick as the balanced figure
/** AVATARS-HD-2: the stop hand (right arm; Euler XYZ). Found on the real skeleton for all seven bodies: the hand's centre about 0.09 m right
 * of the midline at chest height, 0.36 m in front of the chest, its palm normal within 5 degrees of the figure's front, fingers up. The
 * round-4 pose (shoulder [-1.25, 0, -0.1], elbow [-1.35, pi/2, 0], wrist [0, 0, -0.54]) held it beside the head, near the bid's raise. */
export const AA_HD_STOP_POSE = Object.freeze({ sh: Object.freeze([-0.687, 0.225, 0.3]), el: Object.freeze([-1.224, 2.149, 0]), wr: Object.freeze([0.33, -0.344, -1.065]) });

const aaHdClamp = (v, a, b) => Math.max(a, Math.min(b, v));
const aaHdC01 = (v) => aaHdClamp(v, 0, 1);

/** FNV-1a, the same as aa-agent-portraits.js aaHash (so a figure keeps its body type on every tier). */
function aaHdHash(s) { let h = 2166136261; for (const ch of String(s ?? "")) { h ^= ch.charCodeAt(0); h = Math.imul(h, 16777619) >>> 0; } return h; }
const aaHdRgb = (n) => [((n >>> 16) & 255) / 255, ((n >>> 8) & 255) / 255, (n & 255) / 255];
const aaHdMix = (a, b, k) => [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k, a[2] + (b[2] - a[2]) * k];

export function aaHdSupported(T) { return !!(T && T.SkinnedMesh && T.Skeleton && T.Bone && T.BufferGeometry && T.BufferAttribute); }

// ------------------------------------------------------------------ the spec: who this agent is, as numbers

/** The figure's description from the persona: body, role colours, outfit and the posture its traits give. */
export function aaHdSpec(agent) {
  const id = String(agent?.id ?? "agent"), h = aaHdHash(id);
  const tr = agent?.traits ?? {};
  const pick = (k, sh) => (Number.isFinite(+tr[k]) ? aaHdC01(+tr[k]) : 0.3 + ((h >>> sh) % 5) * 0.1); // personas without traits: from the id
  const traits = { warmth: pick("warmth", 3), formality: pick("formality", 7), verbosity: pick("verbosity", 11), caution: pick("caution", 15) };
  const bodyId = AA_HD_BODY_IDS[h % AA_HD_BODY_IDS.length], B = AA_HD_BODY_DIMS[bodyId] ?? { h: 1, w: 1 };
  const av = agent?.avatar ?? {};
  const accentN = typeof av.accent === "number" ? av.accent : typeof av.accent === "string" && /^#?[0-9a-f]{6}$/i.test(av.accent) ? parseInt(av.accent.replace("#", ""), 16) : (h & 0x7f7f7f) | 0x406080;
  const outfit = String(av.outfit ?? "agent");
  const accent = aaHdRgb(accentN);
  const { warmth: w, formality: f, verbosity: v, caution: c } = traits;
  // A cool porcelain shell and graphite joints (never a skin tone: check_agent_avatars measures the head and hands against crew.js's
  // twelve tones); the role colour goes on the visor band, the halo, the shoulder caps, the belt, the badge and the collar or yoke.
  const colours = {
    accent, glow: aaHdMix(accent, [1, 1, 1], 0.12), shell: [0.83, 0.88, 0.93], shellDeep: [0.6, 0.66, 0.73],
    graphite: [0.2, 0.24, 0.29], joint: [0.26, 0.31, 0.36], hand: [0.7, 0.75, 0.81], cap: aaHdMix(accent, [0.83, 0.88, 0.93], 0.12),
    brow: [0.12, 0.16, 0.2], mouth: [0.05, 0.09, 0.12], eye: [0.96, 0.99, 1], foot: [0.14, 0.17, 0.2],
    vest: [0.85, 1, 0.23], band: [0.87, 0.91, 0.93], talk: aaHdMix(accent, [1, 1, 1], 0.6),
  };
  const posture = {
    lean: (0.55 - c) * 0.24, headPitch: (0.5 - c) * 0.1, headTilt: (w - 0.5) * 0.12 * (1 - f),
    abduct: aaHdClamp(0.06 + 0.32 * w - 0.14 * f, 0.03, 0.4), stance: 0.012 + 0.08 * w, palms: 0.55 * w,
    clasp: f > 0.7 ? aaHdC01((f - 0.7) / 0.25) : 0, shift: (1 - f) * 0.065, kneeBend: (1 - f) * 0.22, chestOpen: 0.12 * w,
    tempo: 1.3 - 0.6 * c, handMotion: 0.1 + 0.6 * v, idleHands: 0.01 + 0.06 * v, browLift: (w - 0.4) * 0.006,
  };
  const tablet = outfit === "tablet" || outfit === "agent";
  return { id, hash: h, traits, body: { id: bodyId, H: B.h, W: B.w }, accentN, colours, outfit, tablet, posture,
    collar: f >= 0.6, vest: outfit === "hivis-vest" || outfit === "agent", yoke: outfit === "visor", bigVisor: outfit === "visor",
    headShape: [1 + ((h >>> 19) % 3 - 1) * 0.05, 1 + ((h >>> 23) % 3 - 1) * 0.06], phase: ((h >>> 5) % 628) / 100 };
}

// ------------------------------------------------------------------ geometry from code (plain arrays)

/** A revolved profile [[r, y], …] (bottom to top; r ≈ 0 makes a pole). x = sin(a)·r·sx, z = cos(a)·r·sz; a0..a1 for a partial band. */
function aaHdLathe(profile, seg, { a0 = 0, a1 = Math.PI * 2, sx = 1, sz = 1 } = {}) {
  const full = Math.abs(a1 - a0 - Math.PI * 2) < 1e-6, cols = full ? seg : seg + 1, v = [], f = [], rows = [];
  for (const [r, y] of profile) {
    if (r < 1e-5) { rows.push({ pole: v.length }); v.push([0, y, 0]); continue; }
    const start = v.length;
    for (let j = 0; j < cols; j += 1) { const a = a0 + ((a1 - a0) * j) / seg; v.push([Math.sin(a) * r * sx, y, Math.cos(a) * r * sz]); }
    rows.push({ start });
  }
  for (let k = 0; k + 1 < rows.length; k += 1) {
    const A = rows[k], Bq = rows[k + 1];
    for (let j = 0; j < seg; j += 1) {
      const j1 = full ? (j + 1) % seg : j + 1;
      if (A.pole !== undefined && Bq.pole !== undefined) continue;
      if (A.pole !== undefined) { f.push([A.pole, Bq.start + j1, Bq.start + j]); continue; }
      if (Bq.pole !== undefined) { f.push([A.start + j, A.start + j1, Bq.pole]); continue; }
      const a = A.start + j, b = A.start + j1, cc = Bq.start + j1, d = Bq.start + j;
      f.push([a, b, cc], [a, cc, d]);
    }
  }
  return { v, f };
}
/** An ellipsoid (radii rx, ry, rz) as a lathe. */
function aaHdEllipsoid(rx, ry, rz, seg, rings) {
  const prof = []; for (let i = 0; i <= rings; i += 1) { const th = -Math.PI / 2 + (Math.PI * i) / rings; prof.push([Math.abs(Math.cos(th)) < 1e-6 ? 0 : Math.cos(th) * rz, Math.sin(th) * ry]); }
  return aaHdLathe(prof, seg, { sx: rx / rz });
}
/** A limb hanging from its joint (y = 0) down to y = -L: rounded at both ends, radius r0 at the joint, r1 at the far end. */
function aaHdLimb(L, r0, r1, seg, sx = 1, lite = false) {
  if (lite === "crowd") return aaHdLathe([[0, -L - r1 * 0.9], [r1, -L], [r0, 0], [0, r0 * 0.9]], seg, { sx }); // AVATARS-HD-3: the crowd level
  if (lite) return aaHdLathe([[0, -L - r1 * 0.95], [r1, -L], [((r0 + r1) / 2) * 1.04, -L / 2], [r0, 0], [0, r0 * 0.95]], seg, { sx }); // AVATARS-HD-2: the room level
  return aaHdLathe([[0, -L - r1 * 0.95], [r1 * 0.72, -L - r1 * 0.62], [r1, -L], [((r0 + r1) / 2) * 1.04, -L / 2], [r0, 0], [r0 * 0.72, r0 * 0.62], [0, r0 * 0.95]], seg, { sx });
}
function aaHdTorus(R, r, M, N) {
  const v = [], f = [];
  for (let i = 0; i < M; i += 1) for (let j = 0; j < N; j += 1) { const u = (i / M) * Math.PI * 2, w = (j / N) * Math.PI * 2; v.push([(R + r * Math.cos(w)) * Math.sin(u), r * Math.sin(w), (R + r * Math.cos(w)) * Math.cos(u)]); }
  for (let i = 0; i < M; i += 1) for (let j = 0; j < N; j += 1) { const a = i * N + j, b = ((i + 1) % M) * N + j, c = ((i + 1) % M) * N + ((j + 1) % N), d = i * N + ((j + 1) % N); f.push([a, d, c], [a, c, b]); }
  return { v, f };
}
function aaHdBox(w, h, d) {
  const x = w / 2, y = h / 2, z = d / 2, v = [], f = [];
  const quad = (p) => { const s = v.length; v.push(...p); f.push([s, s + 1, s + 2], [s, s + 2, s + 3]); };
  quad([[-x, -y, z], [x, -y, z], [x, y, z], [-x, y, z]]); quad([[x, -y, -z], [-x, -y, -z], [-x, y, -z], [x, y, -z]]);
  quad([[x, -y, z], [x, -y, -z], [x, y, -z], [x, y, z]]); quad([[-x, -y, -z], [-x, -y, z], [-x, y, z], [-x, y, -z]]);
  quad([[-x, y, z], [x, y, z], [x, y, -z], [-x, y, -z]]); quad([[-x, -y, -z], [x, -y, -z], [x, -y, z], [-x, -y, z]]);
  return { v, f };
}

/** Euler XYZ (three.js order) rotation of a vector. */
function aaHdRot(p, rx = 0, ry = 0, rz = 0) {
  let [x, y, z] = p; let c, s;
  if (rz) { c = Math.cos(rz); s = Math.sin(rz); [x, y] = [x * c - y * s, x * s + y * c]; }
  if (ry) { c = Math.cos(ry); s = Math.sin(ry); [x, z] = [x * c + z * s, -x * s + z * c]; }
  if (rx) { c = Math.cos(rx); s = Math.sin(rx); [y, z] = [y * c - z * s, y * s + z * c]; }
  return [x, y, z];
}

function aaHdBuffer() { return { p: [], n: [], c: [], si: [], sw: [], i: [] }; }
/** Push a primitive: rotated, then moved to `at` (bind pose, figure space); `col` is [r,g,b] or (vertex in figure space) -> [r,g,b];
 * `bone` is a bone name or (vertex) -> [[bone, weight], …] (two at most). Normals: area-weighted per primitive (smooth inside it). */
function aaHdPush(buf, prim, { at = [0, 0, 0], rot = [0, 0, 0], col, bone }) {
  const base = buf.p.length / 3, vn = prim.v.map(() => [0, 0, 0]);
  for (const [a, b, c] of prim.f) {
    const A = prim.v[a], Bv = prim.v[b], C = prim.v[c];
    const ux = Bv[0] - A[0], uy = Bv[1] - A[1], uz = Bv[2] - A[2], wx = C[0] - A[0], wy = C[1] - A[1], wz = C[2] - A[2];
    const nx = uy * wz - uz * wy, ny = uz * wx - ux * wz, nz = ux * wy - uy * wx;
    for (const k of [a, b, c]) { vn[k][0] += nx; vn[k][1] += ny; vn[k][2] += nz; }
  }
  prim.v.forEach((q, k) => {
    const r = aaHdRot(q, rot[0], rot[1], rot[2]), P = [r[0] + at[0], r[1] + at[1], r[2] + at[2]];
    const n = aaHdRot(vn[k], rot[0], rot[1], rot[2]), l = Math.hypot(n[0], n[1], n[2]) || 1;
    buf.p.push(P[0], P[1], P[2]); buf.n.push(n[0] / l, n[1] / l, n[2] / l);
    const cc = typeof col === "function" ? col(P) : col; buf.c.push(cc[0], cc[1], cc[2]);
    const bw = typeof bone === "function" ? bone(P) : [[bone, 1]];
    const i0 = AA_HD_ORDER.indexOf(bw[0][0]), i1 = bw[1] ? AA_HD_ORDER.indexOf(bw[1][0]) : 0;
    buf.si.push(Math.max(0, i0), Math.max(0, i1), 0, 0); buf.sw.push(bw[0][1], bw[1] ? bw[1][1] : 0, 0, 0);
  });
  for (const [a, b, c] of prim.f) buf.i.push(base + a, base + b, base + c);
}

/** The bind pose: each bone's position in figure space (feet at y = 0, facing +z; the figure's left is +x). */
function aaHdJoints(spec) {
  const { H, W } = spec.body, hs = spec.headShape;
  const J = {
    root: [0, 0, 0], pelvis: [0, 0.95 * H, 0], spine: [0, 1.08 * H, 0], chest: [0, 1.26 * H, 0], neck: [0, 1.44 * H, 0], head: [0, 1.515 * H, 0],
    shoulderL: [0.232 * W, 1.405 * H, -0.005], shoulderR: [-0.232 * W, 1.405 * H, -0.005],
    hipL: [0.095 * W, 0.92 * H, 0], hipR: [-0.095 * W, 0.92 * H, 0],
  };
  J.elbowL = [J.shoulderL[0], J.shoulderL[1] - 0.27 * H, J.shoulderL[2]]; J.elbowR = [J.shoulderR[0], J.elbowL[1], J.shoulderR[2]];
  J.wristL = [J.elbowL[0], J.elbowL[1] - 0.245 * H, J.elbowL[2]]; J.wristR = [J.elbowR[0], J.wristL[1], J.elbowR[2]];
  J.kneeL = [J.hipL[0], 0.5 * H, 0.005]; J.kneeR = [J.hipR[0], 0.5 * H, 0.005];
  J.ankleL = [J.hipL[0], 0.085 * H, 0]; J.ankleR = [J.hipR[0], 0.085 * H, 0];
  const hc = J.head[1] + 0.1 * hs[1], rx = 0.104 * hs[0], ry = 0.128 * hs[1], rz = 0.114;
  J.headC = [0, hc, 0]; J.headR = [rx, ry, rz];
  J.mouth = [0, hc - 0.058 * hs[1], rz * 0.93 + 0.002]; J.eyeL = [0.037, hc + 0.012, rz + 0.004]; J.eyeR = [-0.037, hc + 0.012, rz + 0.004];
  J.browL = [0.04, hc + 0.05 * hs[1], rz * 0.94]; J.browR = [-0.04, hc + 0.05 * hs[1], rz * 0.94];
  return J;
}

/** The figure as plain arrays: the lit body, the unlit glow, the mouth's lit opening, and the bones (bind positions, parents). */
export function aaHdGeometry(spec, level = "full") {
  const J = aaHdJoints(spec), { H, W } = spec.body, C = spec.colours, P = spec.posture, D = AA_HD_LOD[level] ?? AA_HD_LOD.full;
  const body = aaHdBuffer(), glow = aaHdBuffer(), talk = aaHdBuffer();
  const torsoBone = (q) => { // the trunk bends smoothly: pelvis → spine → chest
    const y = q[1] / H;
    if (y <= 1.0) return [["pelvis", 1]]; if (y < 1.12) { const k = (y - 1.0) / 0.12; return [["pelvis", 1 - k], ["spine", k]]; }
    if (y <= 1.2) return [["spine", 1]]; if (y < 1.32) { const k = (y - 1.2) / 0.12; return [["spine", 1 - k], ["chest", k]]; }
    return [["chest", 1]];
  };
  const sx = 1.24 * W, sz = 0.8 * W;
  // trunk: hips, a belted waist (the role colour), chest and rounded shoulders (cool shell)
  const trunk = (D.trunkLite === "crowd" ? [[0, 0.86], [0.15, 0.93], [0.152, 0.99], [0.138, 1.06], [0.176, 1.29], [0.172, 1.4], [0, 1.462]]
    : D.trunkLite ? [[0, 0.86], [0.148, 0.92], [0.152, 0.98], [0.138, 1.03], [0.14, 1.14], [0.174, 1.28], [0.182, 1.35], [0.15, 1.43], [0, 1.462]]
    : [[0, 0.86], [0.11, 0.872], [0.148, 0.92], [0.152, 0.98], [0.138, 1.05], [0.136, 1.12], [0.152, 1.2], [0.174, 1.28], [0.182, 1.35], [0.17, 1.405], [0.125, 1.445], [0, 1.462]]).map(([r, y]) => [r, y * H]);
  aaHdPush(body, aaHdLathe(trunk, D.trunk, { sx: sx / W, sz: sz / W }), { col: (q) => (q[1] > 0.99 * H && q[1] < 1.06 * H ? C.accent : q[1] < 0.99 * H ? C.shellDeep : C.shell), bone: torsoBone });
  if (spec.vest) { // a high-visibility vest with two reflective bands
    const vp = (D.vestLite ? [[0.138, 1.08], [0.164, 1.2], [0.186, 1.37]] : [[0.138, 1.08], [0.152, 1.17], [0.176, 1.27], [0.186, 1.34], [0.176, 1.4]]).map(([r, y]) => [r + 0.012, y * H]);
    aaHdPush(body, aaHdLathe(vp, D.trunk, { sx: sx / W, sz: sz / W }), { col: (q) => (Math.abs(q[1] - 1.14 * H) < 0.02 || Math.abs(q[1] - 1.25 * H) < 0.02 || (D.vestLite && Math.abs(q[1] - 1.2 * H) < 0.02) ? C.band : C.vest), bone: torsoBone });
  }
  if (spec.yoke) aaHdPush(body, aaHdLathe((D.vestLite ? [[0.19 + 0.014, 1.31 * H], [0.2 + 0.014, 1.37 * H], [0.12, 1.452 * H]] : [[0.19 + 0.014, 1.31 * H], [0.2 + 0.014, 1.37 * H], [0.18 + 0.016, 1.415 * H], [0.12, 1.452 * H]]), D.trunk, { sx: sx / W, sz: sz / W }), { col: C.accent, bone: "chest" });
  if (spec.collar) aaHdPush(body, aaHdLathe([[0.058, 1.43 * H], [0.064, 1.46 * H], [0.06, 1.48 * H]], D.small, { sz: 0.9 }), { col: C.accent, bone: "chest" });
  // neck and head (an egg of the shell colour: no skin)
  aaHdPush(body, aaHdLathe(D.neckLite ? [[0.046, 1.43 * H], [0.043, J.headC[1] - 0.06]] : [[0.046, 1.43 * H], [0.041, 1.5 * H], [0.044, J.headC[1] - 0.06]], D.neck), { col: C.joint, bone: "neck" });
  const [hrx, hry, hrz] = J.headR;
  aaHdPush(body, aaHdEllipsoid(hrx, hry, hrz, D.head[0], D.head[1]), { at: J.headC, col: C.shell, bone: "head" });
  // brows (graphite) and the mouth slot (dark), each on its own bone
  if (D.brows !== false) {
    aaHdPush(body, aaHdBox(0.036, 0.008, 0.012), { at: J.browL, rot: [0, 0.32, 0], col: C.brow, bone: "browL" });
    aaHdPush(body, aaHdBox(0.036, 0.008, 0.012), { at: J.browR, rot: [0, -0.32, 0], col: C.brow, bone: "browR" });
  }
  if (D.mouth) aaHdPush(body, aaHdEllipsoid(0.028, 0.0055, 0.009, D.mouth[0], D.mouth[1]), { at: J.mouth, col: C.mouth, bone: "mouth" });
  // arms: rounded shoulder, upper arm, forearm (shell over graphite), mitten hands with a thumb
  for (const side of ["L", "R"]) {
    const s = side === "L" ? 1 : -1, sh = J[`shoulder${side}`], el = J[`elbow${side}`], wr = J[`wrist${side}`];
    aaHdPush(body, aaHdEllipsoid(0.066, 0.06, 0.062, D.cap[0], D.cap[1]), { at: [sh[0] - s * 0.008, sh[1] + 0.006, sh[2]], col: C.cap, bone: `shoulder${side}` });
    aaHdPush(body, aaHdLimb(0.27 * H, 0.05, 0.041, D.arm ?? D.limb, 1, D.limbLite), { at: sh, col: C.graphite, bone: `shoulder${side}` });
    aaHdPush(body, aaHdLimb(0.245 * H, 0.043, 0.032, D.arm ?? D.limb, 1, D.limbLite), { at: el, col: C.shell, bone: `elbow${side}` });
    aaHdPush(body, aaHdEllipsoid(0.02, 0.07, 0.044, D.hand[0], D.hand[1]), { at: [wr[0], wr[1] - 0.07, wr[2] + 0.004], col: C.hand, bone: `wrist${side}` });
    if (D.thumb) aaHdPush(body, aaHdLimb(0.045, 0.014, 0.011, D.thumb), { at: [wr[0] - s * 0.006, wr[1] - 0.03, wr[2] + 0.04], rot: [0.5, 0, s * 0.35], col: C.hand, bone: `wrist${side}` });
    // legs: thigh, shin and foot
    const hp = J[`hip${side}`], kn = J[`knee${side}`], an = J[`ankle${side}`];
    aaHdPush(body, aaHdLimb(hp[1] - kn[1], 0.086 * W, 0.062, D.limb, 1, D.limbLite), { at: hp, col: C.graphite, bone: `hip${side}` });
    aaHdPush(body, aaHdLimb(kn[1] - an[1], 0.062, 0.044, D.limb, 1, D.limbLite), { at: kn, col: C.shellDeep, bone: `knee${side}` });
    aaHdPush(body, aaHdEllipsoid(0.046, 0.036, 0.105, D.foot[0], D.foot[1]), { at: [an[0], an[1] - 0.045, an[2] + 0.045], col: C.foot, bone: `ankle${side}` });
  }
  if (spec.tablet) { // the tablet in the left hand (its screen glows)
    const wr = J.wristL;
    aaHdPush(body, aaHdBox(0.17, 0.23, 0.014), { at: [wr[0] - 0.035, wr[1] - 0.11, wr[2] + 0.03], col: [0.11, 0.16, 0.2], bone: "wristL" });
    aaHdPush(glow, aaHdBox(0.145, 0.2, 0.004), { at: [wr[0] - 0.035, wr[1] - 0.11, wr[2] + 0.039], col: aaHdMix(C.accent, [1, 1, 1], 0.35), bone: "wristL" });
  }
  // what glows: the role-coloured visor band across the eyes, the eyes on it, the halo, the badge
  const hc = J.headC[1], bandH = spec.bigVisor ? 0.032 : 0.023, ringR = (y) => hrz * Math.sqrt(Math.max(0, 1 - ((y - hc) / hry) ** 2)) + 0.004;
  aaHdPush(glow, aaHdLathe([[ringR(hc + 0.012 - bandH), hc + 0.012 - bandH], [ringR(hc + 0.012) + 0.002, hc + 0.012], [ringR(hc + 0.012 + bandH), hc + 0.012 + bandH]], D.band, { a0: -1.85, a1: 1.85, sx: hrx / hrz }), { col: C.glow, bone: "head" });
  aaHdPush(glow, aaHdEllipsoid(0.017, 0.0105, 0.006, D.eye[0], D.eye[1]), { at: J.eyeL, col: C.eye, bone: "eyeL" });
  aaHdPush(glow, aaHdEllipsoid(0.017, 0.0105, 0.006, D.eye[0], D.eye[1]), { at: J.eyeR, col: C.eye, bone: "eyeR" });
  aaHdPush(glow, aaHdTorus(0.118, 0.0065, D.halo[0], D.halo[1]), { at: [0, hc + hry + 0.065, -0.01], rot: [-0.16, 0, 0], col: C.accent, bone: "head" });
  const chestFront = 0.19 * sz + (spec.vest ? 0.014 : 0.004);
  aaHdPush(glow, aaHdLathe([[0, 0], [0.026, 0]], D.badge), { at: [0.085 * W, 1.3 * H, chestFront], rot: [Math.PI / 2, 0, 0], col: C.accent, bone: "chest" });
  // the mouth's lit opening (its own mesh: visible only while the agent talks)
  aaHdPush(talk, aaHdEllipsoid(0.022, 0.0042, 0.006, D.talk[0], D.talk[1]), { at: [0, 0, 0.0035], col: C.talk, bone: "mouth" });
  const bones = AA_HD_ORDER.map((name) => ({ name, parent: AA_HD_BONES[name], at: J[name] ?? [0, 0, 0] }));
  const tri = (b) => b.i.length / 3;
  return { body, glow, talk, bones, joints: J, level: AA_HD_LOD[level] ? level : "full", triangles: { body: tri(body), glow: tri(glow), talk: tri(talk), total: tri(body) + tri(glow) + tri(talk) } };
}

// ------------------------------------------------------------------ the pose (pure): personality, walking, speech, gestures

const aaHdEase = (k) => { const u = aaHdC01(k); return u < 0.18 ? (u / 0.18) ** 2 * (3 - 2 * (u / 0.18)) : u > 0.82 ? ((1 - u) / 0.18) ** 2 * (3 - 2 * ((1 - u) / 0.18)) : 1; };
const aaHdLerp3 = (a, b, k) => [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k, a[2] + (b[2] - a[2]) * k];

/**
 * Bone rotations (Euler XYZ), scales and offsets for a moment. st = { t (s), walking, walkPhase, speaking, mouth 0..1, beat 0..1,
 * gesture: { kind, k 0..1 } | null, blink 0..1, reduced }. Reduced motion: no idle, breathing, walking or blinking; a gesture
 * holds still at its full pose (no easing in or out) and a nod does not move the head.
 */
export function aaHdPose(spec, st = {}) {
  const P = spec.posture, r = {}, s = {}, o = {}, red = !!st.reduced;
  const t = red ? 0 : (Number(st.t) || 0) * P.tempo, ph = spec.phase;
  const breathe = red ? 0 : Math.sin(t * 1.5 + ph) * 0.012, sway = red ? 0 : Math.sin(t * 0.55 + ph) * 0.025;
  r.pelvis = [0, sway * 0.4, P.shift]; r.spine = [P.lean * 0.6 + breathe, 0, -P.shift * 0.6]; r.chest = [P.lean * 0.4 - P.chestOpen * 0.35 + breathe * 0.6, 0, -P.shift * 0.3];
  r.neck = [-P.lean * 0.45, 0, 0]; r.head = [P.headPitch - P.lean * 0.45, sway * 1.4, P.headTilt];
  // the arms at rest, from warmth (open), formality (clasped) and the outfit (a tablet to read)
  const idle = red ? 0 : P.idleHands * (0.5 + 0.5 * Math.sin(t * 1.25 + ph * 2));
  let L = { sh: [0.04, 0, P.abduct], el: [-0.14 - idle, -P.palms, 0], wr: [0, 0, 0] };
  let R = { sh: [0.04, 0, -P.abduct], el: [-0.14 - idle * 0.8, P.palms, 0], wr: [0, 0, 0] };
  if (P.clasp > 0) {
    const k = P.clasp; L = { sh: aaHdLerp3(L.sh, [-0.34, -0.72, -0.08], k), el: aaHdLerp3(L.el, [-1.32, 0, 0], k), wr: L.wr }; R = { sh: aaHdLerp3(R.sh, [-0.34, 0.72, 0.08], k), el: aaHdLerp3(R.el, [-1.32, 0, 0], k), wr: R.wr };
  }
  if (spec.tablet) L = { sh: [-0.32, -0.38, Math.min(P.abduct, 0.12)], el: [-1.36, 0, 0], wr: [0, 0, 0] };
  // speaking: beat gestures on each word, bigger for a verbose agent (the tablet hand stays on the tablet)
  if (st.speaking && !red) {
    const b = aaHdC01(Number(st.beat) || 0) * P.handMotion;
    R.el = [R.el[0] - 0.55 * b, R.el[1], R.el[2]]; R.sh = [R.sh[0] - 0.25 * b, R.sh[1], R.sh[2] - 0.12 * b];
    if (!spec.tablet) { L.el = [L.el[0] - 0.35 * b, L.el[1], L.el[2]]; L.sh = [L.sh[0] - 0.12 * b, L.sh[1], L.sh[2] + 0.08 * b]; }
  }
  // walking: legs and arms swing (cadence from the mount's walk phase)
  let hipL = [0, 0, P.stance - P.shift], hipR = [0, 0, -P.stance - P.shift], kneeL = [P.kneeBend, 0, 0], kneeR = [0, 0, 0];
  if (P.kneeBend) hipL = [-P.kneeBend * 0.5, 0, hipL[2]];
  const ankL = [-P.kneeBend * 0.5, 0, -hipL[2] * 0.5], ankR = [0, 0, -hipR[2] * 0.5];
  if (st.walking && !red) {
    const w = Number(st.walkPhase) || 0, A = 0.42;
    hipL = [-Math.sin(w) * A, 0, P.stance * 0.4]; hipR = [Math.sin(w) * A, 0, -P.stance * 0.4];
    kneeL = [0.12 + 0.7 * Math.max(0, Math.cos(w)), 0, 0]; kneeR = [0.12 + 0.7 * Math.max(0, -Math.cos(w)), 0, 0];
    if (!spec.tablet) L.sh = [Math.sin(w) * 0.32, L.sh[1], L.sh[2] * 0.5];
    R.sh = [-Math.sin(w) * 0.32, R.sh[1], R.sh[2] * 0.5];
    r.pelvis = [0, Math.sin(w) * 0.06, 0]; r.spine[0] += 0.04;
  }
  // gestures (the hive's events): raise (bid), accept (award), stop (refusal), nod / approve (approval, completion)
  let brow = P.browLift, furrow = 0;
  const g = st.gesture, gk = g ? (red ? 1 : aaHdEase(g.k)) : 0;
  if (g?.kind === "raise") { R = { sh: aaHdLerp3(R.sh, [-2.78, 0, -0.16], gk), el: aaHdLerp3(R.el, [-0.28, Math.PI / 2, 0], gk), wr: aaHdLerp3(R.wr, [0, 0, -0.1], gk) }; brow += 0.007 * gk; }
  else if (g?.kind === "accept") { const pump = red ? 0 : Math.sin(aaHdC01(g.k) * Math.PI * 4) * 0.12; R = { sh: aaHdLerp3(R.sh, [-0.5, 0, 0.12], gk), el: aaHdLerp3(R.el, [-1.8 + pump, 0, 0], gk), wr: R.wr }; brow += 0.004 * gk; }
  else if (g?.kind === "stop") { const S = AA_HD_STOP_POSE; R = { sh: aaHdLerp3(R.sh, S.sh, gk), el: aaHdLerp3(R.el, S.el, gk), wr: aaHdLerp3(R.wr, S.wr, gk) }; furrow = gk; }
  if ((g?.kind === "nod" || g?.kind === "approve") && !red) r.head = [r.head[0] + Math.sin(aaHdC01(g.k) * Math.PI) * 0.35, r.head[1], r.head[2]];
  r.shoulderL = L.sh; r.elbowL = L.el; r.wristL = L.wr; r.shoulderR = R.sh; r.elbowR = R.el; r.wristR = R.wr;
  r.hipL = hipL; r.hipR = hipR; r.kneeL = kneeL; r.kneeR = kneeR; r.ankleL = ankL; r.ankleR = ankR;
  // the face: the mouth opens with the words, the eyes blink, the brows lift or settle
  const m = aaHdC01(Number(st.mouth) || 0);
  s.mouth = [1 + 0.12 * m, 1 + 2.6 * m, 1];
  const bl = red ? 1 : 1 - 0.88 * aaHdC01(Number(st.blink) || 0); s.eyeL = [1, bl, 1]; s.eyeR = [1, bl, 1];
  o.browL = [0, brow - 0.003 * furrow, 0]; o.browR = [0, brow - 0.003 * furrow, 0];
  r.browL = [0, 0, 0.22 * furrow]; r.browR = [0, 0, -0.22 * furrow];
  return { r, s, o };
}

// ------------------------------------------------------------------ the three.js figure

/** Build the high-detail figure (feet at y = 0, facing +z): one skinned body, one skinned glow, the mouth's lit opening. */
export function aaHdBuild(T, agent, spec = aaHdSpec(agent), { level = "full" } = {}) {
  const geo = aaHdGeometry(spec, level);
  const group = new T.Group(); group.name = `aa-agent-${spec.id}`;
  const bones = {}, list = [];
  for (const b of geo.bones) {
    const bone = new T.Bone(); bone.name = `aa-bone-${b.name}`;
    const parent = b.parent ? geo.bones.find((x) => x.name === b.parent).at : [0, 0, 0];
    bone.position.set(b.at[0] - parent[0], b.at[1] - parent[1], b.at[2] - parent[2]);
    bone.userData.bind = [bone.position.x, bone.position.y, bone.position.z];
    bones[b.name] = bone; list.push(bone);
    if (b.parent) bones[b.parent].add(bone);
  }
  const skeleton = new T.Skeleton(list);
  // three.js r152+ reads vertex colours as linear: the spec's colours are sRGB, so convert them (portraits use them as they are)
  const lin = T.ColorManagement?.enabled !== false && Number(T.REVISION) >= 152 ? (c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4) : (c) => c;
  const toGeo = (buf) => {
    const g = new T.BufferGeometry();
    g.setAttribute("position", new T.BufferAttribute(new Float32Array(buf.p), 3));
    g.setAttribute("normal", new T.BufferAttribute(new Float32Array(buf.n), 3));
    g.setAttribute("color", new T.BufferAttribute(new Float32Array(buf.c.map(lin)), 3));
    g.setAttribute("skinIndex", new T.BufferAttribute(new Uint16Array(buf.si), 4));
    g.setAttribute("skinWeight", new T.BufferAttribute(new Float32Array(buf.sw), 4));
    g.setIndex(new T.BufferAttribute(buf.p.length / 3 > 65535 ? new Uint32Array(buf.i) : new Uint16Array(buf.i), 1));
    return g;
  };
  // a cool lift in the shade (not the role colour: an accent glow over the whole body read as a coloured suit and warmed the head)
  const bodyMat = new T.MeshStandardMaterial({ vertexColors: true, roughness: 0.42, metalness: 0.12, emissive: 0x5a6e82, emissiveIntensity: 0.5 });
  const body = new T.SkinnedMesh(toGeo(geo.body), bodyMat); body.name = "aa-hd-body";
  const glow = new T.SkinnedMesh(toGeo(geo.glow), new T.MeshBasicMaterial({ vertexColors: true, side: T.DoubleSide ?? 2 })); glow.name = "aa-hd-glow";
  body.add(bones.root);
  group.add(body, glow);
  group.updateMatrixWorld?.(true);
  body.bind(skeleton); glow.bind(skeleton, body.matrixWorld);
  for (const m of [body, glow]) { m.frustumCulled = false; m.castShadow = false; }
  // the mouth's lit opening: a plain mesh on the mouth bone (it opens with the bone's scale); vertices are bone-local
  const tg = new T.BufferGeometry();
  const tp = geo.talk.p.slice(), J = geo.joints.mouth; for (let i = 0; i < tp.length; i += 3) { tp[i] -= J[0]; tp[i + 1] -= J[1]; tp[i + 2] -= J[2]; }
  tg.setAttribute("position", new T.BufferAttribute(new Float32Array(tp), 3)); tg.setAttribute("normal", new T.BufferAttribute(new Float32Array(geo.talk.n), 3));
  tg.setIndex(new T.BufferAttribute(new Uint16Array(geo.talk.i), 1));
  const talk = new T.Mesh(tg, new T.MeshBasicMaterial({ color: (Math.round(spec.colours.talk[0] * 255) << 16) | (Math.round(spec.colours.talk[1] * 255) << 8) | Math.round(spec.colours.talk[2] * 255) }));
  talk.name = "aa-talk"; talk.visible = false; bones.mouth.add(talk);
  function apply(pose) {
    for (const [name, bone] of Object.entries(bones)) {
      const rr = pose.r[name], ss = pose.s[name], oo = pose.o[name], b0 = bone.userData.bind;
      if (rr) bone.rotation.set(rr[0], rr[1], rr[2]); else bone.rotation.set(0, 0, 0);
      if (ss) bone.scale.set(ss[0], ss[1], ss[2]); else bone.scale.set(1, 1, 1);
      bone.position.set(b0[0] + (oo?.[0] ?? 0), b0[1] + (oo?.[1] ?? 0), b0[2] + (oo?.[2] ?? 0));
    }
  }
  apply(aaHdPose(spec, { t: 0 }));
  return { group, body, glow, talk, bones, skeleton, apply, spec, level: geo.level, triangles: geo.triangles, headY: geo.joints.headC[1] };
}

// ------------------------------------------------------------------ a software rasteriser: silhouettes and portraits

/** Bone world matrices (3x4, row-major [r00 r01 r02 tx, …]) for a pose; skinning matrix = world × inverse(bind translation). */
function aaHdSkin(geo, pose) {
  const W = {}, out = [];
  for (const b of geo.bones) {
    const parent = b.parent ? geo.bones.find((x) => x.name === b.parent).at : [0, 0, 0];
    const rr = pose.r[b.name] ?? [0, 0, 0], ss = pose.s[b.name] ?? [1, 1, 1], oo = pose.o[b.name] ?? [0, 0, 0];
    const [x, y, z] = rr, a = Math.cos(x), bb = Math.sin(x), c = Math.cos(y), d = Math.sin(y), e = Math.cos(z), f = Math.sin(z);
    const ae = a * e, af = a * f, be = bb * e, bf = bb * f;
    const R = [c * e, -c * f, d, af + be * d, ae - bf * d, -bb * c, bf - ae * d, be + af * d, a * c]; // three.js makeRotationFromEuler, XYZ
    const M = [R[0] * ss[0], R[1] * ss[1], R[2] * ss[2], b.at[0] - parent[0] + oo[0], R[3] * ss[0], R[4] * ss[1], R[5] * ss[2], b.at[1] - parent[1] + oo[1], R[6] * ss[0], R[7] * ss[1], R[8] * ss[2], b.at[2] - parent[2] + oo[2]];
    const Pm = b.parent ? W[b.parent] : null;
    const G = Pm ? [
      Pm[0] * M[0] + Pm[1] * M[4] + Pm[2] * M[8], Pm[0] * M[1] + Pm[1] * M[5] + Pm[2] * M[9], Pm[0] * M[2] + Pm[1] * M[6] + Pm[2] * M[10], Pm[0] * M[3] + Pm[1] * M[7] + Pm[2] * M[11] + Pm[3],
      Pm[4] * M[0] + Pm[5] * M[4] + Pm[6] * M[8], Pm[4] * M[1] + Pm[5] * M[5] + Pm[6] * M[9], Pm[4] * M[2] + Pm[5] * M[6] + Pm[6] * M[10], Pm[4] * M[3] + Pm[5] * M[7] + Pm[6] * M[11] + Pm[7],
      Pm[8] * M[0] + Pm[9] * M[4] + Pm[10] * M[8], Pm[8] * M[1] + Pm[9] * M[5] + Pm[10] * M[9], Pm[8] * M[2] + Pm[9] * M[6] + Pm[10] * M[10], Pm[8] * M[3] + Pm[9] * M[7] + Pm[10] * M[11] + Pm[11],
    ] : M;
    W[b.name] = G;
    out.push([G[0], G[1], G[2], G[3] - (G[0] * b.at[0] + G[1] * b.at[1] + G[2] * b.at[2]), G[4], G[5], G[6], G[7] - (G[4] * b.at[0] + G[5] * b.at[1] + G[6] * b.at[2]), G[8], G[9], G[10], G[11] - (G[8] * b.at[0] + G[9] * b.at[1] + G[10] * b.at[2])]);
  }
  return out;
}
function aaHdDeform(buf, S) {
  const n = buf.p.length / 3, p = new Float32Array(n * 3), nn = new Float32Array(n * 3);
  for (let i = 0; i < n; i += 1) {
    const x = buf.p[3 * i], y = buf.p[3 * i + 1], z = buf.p[3 * i + 2], nx = buf.n[3 * i], ny = buf.n[3 * i + 1], nz = buf.n[3 * i + 2];
    let X = 0, Y = 0, Z = 0, NX = 0, NY = 0, NZ = 0;
    for (let k = 0; k < 2; k += 1) {
      const w = buf.sw[4 * i + k]; if (!w) continue; const M = S[buf.si[4 * i + k]];
      X += w * (M[0] * x + M[1] * y + M[2] * z + M[3]); Y += w * (M[4] * x + M[5] * y + M[6] * z + M[7]); Z += w * (M[8] * x + M[9] * y + M[10] * z + M[11]);
      NX += w * (M[0] * nx + M[1] * ny + M[2] * nz); NY += w * (M[4] * nx + M[5] * ny + M[6] * nz); NZ += w * (M[8] * nx + M[9] * ny + M[10] * nz);
    }
    const l = Math.hypot(NX, NY, NZ) || 1;
    p[3 * i] = X; p[3 * i + 1] = Y; p[3 * i + 2] = Z; nn[3 * i] = NX / l; nn[3 * i + 1] = NY / l; nn[3 * i + 2] = NZ / l;
  }
  return { p, n: nn };
}

/**
 * Rasterise the posed figure, orthographic. view "front" (looking along -z) or "side" (looking along -x, the figure's left side).
 * crop = [x0, y0, x1, y1] in figure metres (default: the whole figure); ss supersamples. Returns { rgba, mask, w, h }: rgba with
 * Lambert shading for the body and flat colour for the glow (bg [r,g,b,a] 0..255 behind), mask 1 where the figure covers.
 */
export function aaHdRender(geo, pose, { w = 64, h = 128, view = "front", crop = null, bg = [0, 0, 0, 0], ss = 1, talk = false } = {}) {
  const S = aaHdSkin(geo, pose), W = w * ss, Hh = h * ss;
  const box = crop ?? [-0.75, -0.02, 0.75, 2.05];
  const sxk = W / (box[2] - box[0]), syk = Hh / (box[3] - box[1]);
  const col = new Float32Array(W * Hh * 3), cov = new Uint8Array(W * Hh), depth = new Float32Array(W * Hh).fill(-Infinity);
  const L = [0.42, 0.62, 0.66], ll = Math.hypot(...L); L[0] /= ll; L[1] /= ll; L[2] /= ll;
  const layers = [[geo.body, true], [geo.glow, false]];
  if (talk) layers.push([geo.talk, false]);
  for (const [buf, lit] of layers) {
    if (!buf.i.length) continue;
    const d = aaHdDeform(buf, S);
    const px = (i) => (view === "side" ? -d.p[3 * i + 2] : d.p[3 * i]), pz = (i) => (view === "side" ? d.p[3 * i] : d.p[3 * i + 2]);
    for (let t = 0; t < buf.i.length; t += 3) {
      const ia = buf.i[t], ib = buf.i[t + 1], ic = buf.i[t + 2];
      const ax = (px(ia) - box[0]) * sxk, ay = (box[3] - d.p[3 * ia + 1]) * syk, bx = (px(ib) - box[0]) * sxk, by = (box[3] - d.p[3 * ib + 1]) * syk, cx = (px(ic) - box[0]) * sxk, cy = (box[3] - d.p[3 * ic + 1]) * syk;
      const area = (bx - ax) * (cy - ay) - (cx - ax) * (by - ay); if (Math.abs(area) < 1e-9) continue;
      const x0 = Math.max(0, Math.floor(Math.min(ax, bx, cx))), x1 = Math.min(W - 1, Math.ceil(Math.max(ax, bx, cx))), y0 = Math.max(0, Math.floor(Math.min(ay, by, cy))), y1 = Math.min(Hh - 1, Math.ceil(Math.max(ay, by, cy)));
      for (let y = y0; y <= y1; y += 1) for (let x = x0; x <= x1; x += 1) {
        const qx = x + 0.5, qy = y + 0.5;
        const w0 = ((bx - qx) * (cy - qy) - (cx - qx) * (by - qy)) / area, w1 = ((cx - qx) * (ay - qy) - (ax - qx) * (cy - qy)) / area, w2 = 1 - w0 - w1;
        if (w0 < 0 || w1 < 0 || w2 < 0) continue;
        const z = w0 * pz(ia) + w1 * pz(ib) + w2 * pz(ic), k = y * W + x;
        if (z <= depth[k]) continue;
        depth[k] = z; cov[k] = 1;
        const cr = w0 * buf.c[3 * ia] + w1 * buf.c[3 * ib] + w2 * buf.c[3 * ic], cg = w0 * buf.c[3 * ia + 1] + w1 * buf.c[3 * ib + 1] + w2 * buf.c[3 * ic + 1], cb = w0 * buf.c[3 * ia + 2] + w1 * buf.c[3 * ib + 2] + w2 * buf.c[3 * ic + 2];
        let sh = 1;
        if (lit) {
          let nx = w0 * d.n[3 * ia] + w1 * d.n[3 * ib] + w2 * d.n[3 * ic], ny = w0 * d.n[3 * ia + 1] + w1 * d.n[3 * ib + 1] + w2 * d.n[3 * ic + 1], nz = w0 * d.n[3 * ia + 2] + w1 * d.n[3 * ib + 2] + w2 * d.n[3 * ic + 2];
          if (view === "side") [nx, nz] = [-nz, nx];
          const nl = Math.hypot(nx, ny, nz) || 1; sh = 0.42 + 0.68 * Math.max(0, (nx * L[0] + ny * L[1] + nz * L[2]) / nl) + 0.12 * Math.max(0, nz / nl);
        }
        col[3 * k] = Math.min(1, cr * sh); col[3 * k + 1] = Math.min(1, cg * sh); col[3 * k + 2] = Math.min(1, cb * sh);
      }
    }
  }
  const rgba = new Uint8ClampedArray(w * h * 4), mask = new Uint8Array(w * h);
  for (let y = 0; y < h; y += 1) for (let x = 0; x < w; x += 1) {
    let r = 0, g = 0, b = 0, a = 0;
    for (let yy = 0; yy < ss; yy += 1) for (let xx = 0; xx < ss; xx += 1) { const k = (y * ss + yy) * W + x * ss + xx; if (cov[k]) { r += col[3 * k]; g += col[3 * k + 1]; b += col[3 * k + 2]; a += 1; } }
    const n = ss * ss, cv = a / n, o = (y * w + x) * 4;
    mask[y * w + x] = cv >= 0.5 ? 1 : 0;
    const fr = a ? r / a : 0, fg = a ? g / a : 0, fb = a ? b / a : 0;
    rgba[o] = fr * 255 * cv + bg[0] * (1 - cv); rgba[o + 1] = fg * 255 * cv + bg[1] * (1 - cv); rgba[o + 2] = fb * 255 * cv + bg[2] * (1 - cv); rgba[o + 3] = 255 * cv + bg[3] * (1 - cv);
  }
  return { rgba, mask, w, h };
}

/** The agent's standing silhouette (its rest pose from its traits), as a mask w × h; "front" and "side" views. */
export function aaHdSilhouette(agent, { w = 64, h = 128, view = "front" } = {}) {
  const spec = aaHdSpec(agent);
  return aaHdRender(aaHdGeometry(spec), aaHdPose(spec, { t: 0 }), { w, h, view }).mask;
}
export function aaHdMaskIoU(a, b) { let i = 0, u = 0; for (let k = 0; k < a.length; k += 1) { if (a[k] && b[k]) i += 1; if (a[k] || b[k]) u += 1; } return u ? i / u : 1; }

// ------------------------------------------------------------------ speech timing

/** The caption's word timing: word onsets (ms from the line's start) spread over the line by word length, with a short lead and tail. */
export function aaWordOnsets(text, durMs, { leadMs = 180, tailMs = 220 } = {}) {
  const src = String(text ?? ""), words = []; const re = /\S+/g; let m;
  while ((m = re.exec(src))) words.push({ word: m[0], char: m.index });
  if (!words.length) return [];
  const span = Math.max(words.length * 60, (Number(durMs) || 0) - leadMs - tailMs), wt = words.map((x) => x.word.length + 2), tot = wt.reduce((a, b) => a + b, 0);
  let acc = 0;
  return words.map((x, i) => { const at = leadMs + (acc / tot) * span, dur = (wt[i] / tot) * span; acc += wt[i]; return { at, dur, word: x.word, char: x.char }; });
}
/** Mouth openness at `ms` after the line's start, from word onsets [{ at, dur }]: it opens at each onset and closes before the next. */
export function aaHdMouth(onsets, ms) {
  let k = -1; for (let i = 0; i < onsets.length; i += 1) { if (onsets[i].at <= ms) k = i; else break; }
  if (k < 0) return 0;
  const u = (ms - onsets[k].at) / Math.max(1e-6, onsets[k].dur); // any unit: ms or s, as long as `at`, `dur` and `ms` agree
  return u >= 0.86 ? 0 : Math.pow(Math.sin(Math.PI * Math.min(1, u / 0.86)), 0.6);
}
