// Fairway Park — course stub.
//
// Team OW1 is landing the real course as WebXR/shared/fairway.js, exporting
// FAIRWAY_HOLES, FAIRWAY_FACILITY, buildFairwayPark(parent, opts),
// fairwayHeight(x, z) and fairwayLieAt(x, z). This module is a small,
// original nine-hole layout against that exact interface, so Fairway Park
// (WebXR/fairway) runs and its checks pass before that lands — see
// WebXR/fairway/js/course.js for the one-line switch that swaps this stub
// for the real course once it exists.
//
// Coordinates are metres in the same flat x/z ground plane every WebXR app
// builds on (y is up). Holes are laid out one per 500 m lane along x, far
// enough apart that no hole's rough ever reaches another's.

const LANE = 500;
const FAIRWAY_HALF = 11;   // metres either side of the polyline: short rough starts here
const ROUGH_HALF = 34;     // metres either side of the polyline: out of bounds starts here
const TEE_RADIUS = 3.5;

function hole(n, { par, yards, length, bend = 0, bendAt = 0.55, greenR = 9, bunkers = [], water = [] }) {
  const baseX = (n - 1) * LANE + 20;
  const tee = [baseX, 0];
  const pin = [baseX + length, bend];
  const bendPoint = bend ? [baseX + length * bendAt, bend * 0.55] : null;
  const fairway = bendPoint ? [tee, bendPoint, pin] : [tee, pin];
  return {
    number: n,
    par,
    yards,
    tee,
    pin,
    fairway,
    green: { centre: pin, radius: greenR },
    // Bunker/water centres given as a fraction of the tee->pin run plus a
    // lateral offset in metres, resolved to world coordinates here so the
    // hole definition below stays readable.
    bunkers: bunkers.map(({ at, side, r }) => ({ centre: alongHole(tee, pin, at, side), radius: r })),
    water: water.map(({ at, side, r }) => ({ centre: alongHole(tee, pin, at, side), radius: r })),
  };
}

function alongHole(tee, pin, at, side) {
  const dx = pin[0] - tee[0], dz = pin[1] - tee[1];
  const len = Math.hypot(dx, dz) || 1;
  const ux = dx / len, uz = dz / len;
  const px = -uz, pz = ux; // perpendicular, left-handed
  return [tee[0] + ux * at * len + px * side, tee[1] + uz * at * len + pz * side];
}

export const FAIRWAY_HOLES = [
  hole(1, { par: 4, yards: 350, length: 315, bunkers: [{ at: 0.86, side: -13, r: 5 }] }),
  hole(2, { par: 3, yards: 155, length: 140, water: [{ at: 0.78, side: 0, r: 8 }] }),
  hole(3, { par: 5, yards: 525, length: 470, bend: 46, bendAt: 0.55,
    bunkers: [{ at: 0.9, side: 10, r: 5 }, { at: 0.94, side: -9, r: 4 }],
    water: [{ at: 0.5, side: 22, r: 12 }] }),
  hole(4, { par: 4, yards: 300, length: 270, water: [{ at: 0.45, side: -17, r: 10 }], bunkers: [{ at: 0.88, side: 11, r: 4.5 }] }),
  hole(5, { par: 3, yards: 165, length: 150, bunkers: [{ at: 0.85, side: 12, r: 4.5 }, { at: 0.85, side: -12, r: 4.5 }] }),
  hole(6, { par: 4, yards: 380, length: 340, bend: -40, bendAt: 0.5, bunkers: [{ at: 0.48, side: -18, r: 6 }] }),
  hole(7, { par: 5, yards: 495, length: 445, water: [{ at: 0.62, side: 0, r: 13 }],
    bunkers: [{ at: 0.92, side: 10, r: 5 }, { at: 0.9, side: -10, r: 4.5 }] }),
  hole(8, { par: 3, yards: 175, length: 158, water: [{ at: 0.8, side: 0, r: 9 }], bunkers: [{ at: 0.95, side: 12, r: 4 }] }),
  hole(9, { par: 4, yards: 340, length: 305, bunkers: [{ at: 0.5, side: 14, r: 5.5 }, { at: 0.9, side: -11, r: 4.5 }] }),
];

// A short outdoor sports facility beside the ninth green: a straight
// hundred-metre track, a half-court with one hoop, and a penalty-kick pitch.
// Coordinates are in the same world frame, tucked into an unused lane so
// nothing overlaps a hole's rough.
const FX = 9 * LANE + 40;
export const FAIRWAY_FACILITY = {
  track: { start: [FX, -40], finish: [FX, -140], laneWidth: 2.2, lanes: 4 },
  court: { centre: [FX + 60, -60], hoop: [FX + 60, -75], freeThrow: [FX + 60, -60], radius: 14 },
  pitch: { spot: [FX + 60, -110], goal: [FX + 60, -128], goalWidth: 7.32, radius: 20 },
  clubhouse: [FX - 30, -20],
};

// ------------------------------------------------------------------ terrain

/** Gentle rolling ground plus small per-green undulation, in metres of rise. */
export function fairwayHeight(x, z) {
  const rolling = Math.sin(x * 0.011) * Math.cos(z * 0.013) * 0.6;
  const undulation = Math.sin(x * 0.07 + z * 0.05) * Math.cos(z * 0.06) * 0.18;
  return rolling + undulation;
}

// -------------------------------------------------------------------- lie

function distToSegment(px, pz, ax, az, bx, bz) {
  const dx = bx - ax, dz = bz - az;
  const len2 = dx * dx + dz * dz || 1e-9;
  let t = ((px - ax) * dx + (pz - az) * dz) / len2;
  t = Math.max(0, Math.min(1, t));
  const cx = ax + dx * t, cz = az + dz * t;
  return Math.hypot(px - cx, pz - cz);
}

function distToPolyline(x, z, pts) {
  let best = Infinity;
  for (let i = 0; i < pts.length - 1; i++) {
    best = Math.min(best, distToSegment(x, z, pts[i][0], pts[i][1], pts[i + 1][0], pts[i + 1][1]));
  }
  return best;
}

// A hole's own fairway polyline runs tee to pin, which is exactly right for
// drawing it, but a real shot can fly past the green (a hot wedge, a badly
// judged approach) or dribble behind the tee. Real courses have rough well
// past both ends before out of bounds starts; this stub's holes are packed
// closer than that, so the corridor used for LIE lookups (never for drawing)
// is extended a further 70 m past the pin and 20 m behind the tee, each along
// the hole's own last/first heading, so an overshot shot lands in this
// hole's rough rather than falling through the gap between two lanes.
const cache = new WeakMap();
function extendedCorridor(h) {
  let ext = cache.get(h);
  if (ext) return ext;
  const pts = h.fairway;
  const [t0x, t0z] = pts[0], [t1x, t1z] = pts[1] ?? pts[0];
  const tlen = Math.hypot(t1x - t0x, t1z - t0z) || 1;
  const behind = [t0x - ((t1x - t0x) / tlen) * 20, t0z - ((t1z - t0z) / tlen) * 20];
  const [p0x, p0z] = pts[pts.length - 2] ?? pts[0], [p1x, p1z] = pts[pts.length - 1];
  const plen = Math.hypot(p1x - p0x, p1z - p0z) || 1;
  const beyond = [p1x + ((p1x - p0x) / plen) * 70, p1z + ((p1z - p0z) / plen) * 70];
  ext = [behind, ...pts, beyond];
  cache.set(h, ext);
  return ext;
}

/** Which lane (0-based hole index) a point is nearest to, for cheap lookups. */
function nearestHole(x) {
  let idx = Math.round((x - 20) / LANE);
  return Math.max(0, Math.min(FAIRWAY_HOLES.length - 1, idx));
}

function distToFacilityPath(x, z) {
  // The cart path is modelled as the straight line from each green to the
  // next tee, plus the run from the ninth green to the clubhouse — a cart
  // that strays from that line is off the path.
  let best = Infinity;
  for (let i = 0; i < FAIRWAY_HOLES.length - 1; i++) {
    best = Math.min(best, distToSegment(x, z, FAIRWAY_HOLES[i].pin[0], FAIRWAY_HOLES[i].pin[1], FAIRWAY_HOLES[i + 1].tee[0], FAIRWAY_HOLES[i + 1].tee[1]));
  }
  const last = FAIRWAY_HOLES[FAIRWAY_HOLES.length - 1];
  best = Math.min(best, distToSegment(x, z, last.pin[0], last.pin[1], FAIRWAY_FACILITY.clubhouse[0], FAIRWAY_FACILITY.clubhouse[1]));
  return best;
}

/**
 * 'tee' | 'fairway' | 'rough' | 'green' | 'bunker' | 'water' | 'path' | 'out'.
 * Checked in the order that matters for scoring: greens and hazards and tee
 * boxes first — a putt or a chip near the pin must always read as the green
 * it lands on, never the cart path that happens to start at that same pin —
 * then the cart path (it threads through rough between every green and the
 * next tee), then the fairway corridor, then rough, then out of bounds.
 */
export function fairwayLieAt(x, z) {
  const lanes = new Set([nearestHole(x) - 1, nearestHole(x), nearestHole(x) + 1].filter((i) => i >= 0 && i < FAIRWAY_HOLES.length));
  for (const i of lanes) {
    const h = FAIRWAY_HOLES[i];
    if (Math.hypot(x - h.green.centre[0], z - h.green.centre[1]) <= h.green.radius) return "green";
  }
  for (const i of lanes) {
    const h = FAIRWAY_HOLES[i];
    for (const b of h.bunkers) if (Math.hypot(x - b.centre[0], z - b.centre[1]) <= b.radius) return "bunker";
  }
  for (const i of lanes) {
    const h = FAIRWAY_HOLES[i];
    for (const w of h.water) if (Math.hypot(x - w.centre[0], z - w.centre[1]) <= w.radius) return "water";
  }
  for (const i of lanes) {
    const h = FAIRWAY_HOLES[i];
    if (Math.hypot(x - h.tee[0], z - h.tee[1]) <= TEE_RADIUS) return "tee";
  }
  if (distToFacilityPath(x, z) <= 1.6) return "path";

  let bestFairway = Infinity, bestHole = -1;
  for (const i of lanes) {
    const d = distToPolyline(x, z, extendedCorridor(FAIRWAY_HOLES[i]));
    if (d < bestFairway) { bestFairway = d; bestHole = i; }
  }
  if (bestHole < 0) return "out";
  if (bestFairway <= FAIRWAY_HALF) return "fairway";
  if (bestFairway <= ROUGH_HALF) return "rough";
  // Outside this hole's rough: still "rough" if it falls inside a
  // neighbouring lane's own corridor test above would have caught it, so
  // reaching here means it is past every nearby hole's rough — out of bounds.
  return "out";
}

// -------------------------------------------------------------------- build

function disc(THREE, radius, color, opts = {}) {
  const geo = new THREE.CircleGeometry(radius, 24);
  geo.rotateX(-Math.PI / 2);
  const mat = new THREE.MeshStandardMaterial({ color, roughness: opts.roughness ?? 0.9, metalness: 0 });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.receiveShadow = true;
  return mesh;
}

function ribbon(THREE, pts, half, color) {
  // A flat strip of quads following the polyline — enough to read as a
  // fairway from above without a real mesh-skinning pass.
  const group = new THREE.Group();
  for (let i = 0; i < pts.length - 1; i++) {
    const [ax, az] = pts[i], [bx, bz] = pts[i + 1];
    const dx = bx - ax, dz = bz - az;
    const len = Math.hypot(dx, dz) || 1;
    const geo = new THREE.PlaneGeometry(half * 2, len);
    geo.rotateX(-Math.PI / 2);
    const mesh = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ color, roughness: 0.95 }));
    mesh.position.set((ax + bx) / 2, 0.01, (az + bz) / 2);
    mesh.rotation.y = -Math.atan2(dz, dx) + Math.PI / 2;
    mesh.receiveShadow = true;
    group.add(mesh);
  }
  return group;
}

function flag(THREE, pos, colour = 0xe0453f) {
  const g = new THREE.Group();
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 2.1, 6), new THREE.MeshStandardMaterial({ color: 0xd9dde2 }));
  pole.position.y = 1.05;
  const cloth = new THREE.Mesh(new THREE.PlaneGeometry(0.5, 0.32), new THREE.MeshStandardMaterial({ color: colour, side: THREE.DoubleSide }));
  cloth.position.set(0.26, 1.85, 0);
  const cup = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.11, 0.05, 12), new THREE.MeshStandardMaterial({ color: 0x11140f }));
  cup.position.y = 0.02;
  g.add(pole, cloth, cup);
  g.position.set(pos[0], 0, pos[1]);
  return g;
}

function teeMarkers(THREE, pos) {
  const g = new THREE.Group();
  for (const side of [-1, 1]) {
    const m = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.18, 0.18), new THREE.MeshStandardMaterial({ color: 0x2f6fe0 }));
    m.position.set(pos[0] + side * 1.1, 0.09, pos[1]);
    g.add(m);
  }
  return g;
}

/**
 * Builds the whole park into `parent` (a THREE.Group). `opts.THREE` is the
 * three.js module the app already has loaded (this stub never imports its
 * own copy, so it never fights the app's version). Kept to a modest mesh
 * budget: a handful of flat shapes per hole rather than sculpted terrain.
 */
export function buildFairwayPark(parent, opts = {}) {
  const THREE = opts.THREE;
  if (!THREE) throw new Error("buildFairwayPark(parent, { THREE }) needs a three.js module");
  const root = new THREE.Group();
  root.name = "fairway-park";

  const roughMat = new THREE.MeshStandardMaterial({ color: 0x2f6b2f, roughness: 1 });
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(FAIRWAY_HOLES.length * LANE + 400, 400), roughMat);
  ground.rotation.x = -Math.PI / 2;
  ground.position.set((FAIRWAY_HOLES.length * LANE) / 2, -0.02, -60);
  ground.receiveShadow = true;
  root.add(ground);

  for (const h of FAIRWAY_HOLES) {
    root.add(ribbon(THREE, h.fairway, FAIRWAY_HALF, 0x4c9a3f));
    root.add(disc(THREE, h.green.radius, 0x63c24a, { roughness: 0.6 }));
    const g = root.children[root.children.length - 1];
    g.position.set(h.green.centre[0], 0.015, h.green.centre[1]);
    for (const b of h.bunkers) {
      const bm = disc(THREE, b.radius, 0xdcc281, { roughness: 1 });
      bm.position.set(b.centre[0], 0.012, b.centre[1]);
      root.add(bm);
    }
    for (const w of h.water) {
      const wm = disc(THREE, w.radius, 0x2f7fbf, { roughness: 0.2, metalness: 0.1 });
      wm.position.set(w.centre[0], 0.008, w.centre[1]);
      root.add(wm);
    }
    root.add(teeMarkers(THREE, h.tee));
    root.add(flag(THREE, h.pin));
  }

  // The path: a thin grey ribbon linking green to next tee.
  const pathPts = FAIRWAY_HOLES.map((h) => h.pin).flatMap((p, i) => (i === 0 ? [p] : [p]));
  for (let i = 0; i < FAIRWAY_HOLES.length - 1; i++) {
    root.add(ribbon(THREE, [FAIRWAY_HOLES[i].pin, FAIRWAY_HOLES[i + 1].tee], 1.4, 0x9a978d));
  }

  // The sports facility: a track oval (outline only), a court disc with a
  // hoop post, and a pitch rectangle with a goal frame.
  const fac = new THREE.Group();
  fac.name = "fairway-facility";
  const trackMat = new THREE.MeshStandardMaterial({ color: 0xaa5a3a, roughness: 1 });
  const trackLen = Math.hypot(FAIRWAY_FACILITY.track.finish[0] - FAIRWAY_FACILITY.track.start[0], FAIRWAY_FACILITY.track.finish[1] - FAIRWAY_FACILITY.track.start[1]);
  const trackGeo = new THREE.PlaneGeometry(FAIRWAY_FACILITY.track.laneWidth * FAIRWAY_FACILITY.track.lanes, trackLen);
  trackGeo.rotateX(-Math.PI / 2);
  const trackMesh = new THREE.Mesh(trackGeo, trackMat);
  trackMesh.position.set(FAIRWAY_FACILITY.track.start[0], 0.01, (FAIRWAY_FACILITY.track.start[1] + FAIRWAY_FACILITY.track.finish[1]) / 2);
  fac.add(trackMesh);

  const courtMesh = disc(THREE, FAIRWAY_FACILITY.court.radius, 0xc98a4b, { roughness: 0.8 });
  courtMesh.position.set(FAIRWAY_FACILITY.court.centre[0], 0.01, FAIRWAY_FACILITY.court.centre[1]);
  fac.add(courtMesh);
  const hoopPost = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 3.05, 8), new THREE.MeshStandardMaterial({ color: 0x333333 }));
  hoopPost.position.set(FAIRWAY_FACILITY.court.hoop[0], 1.52, FAIRWAY_FACILITY.court.hoop[1]);
  fac.add(hoopPost);
  const rim = new THREE.Mesh(new THREE.TorusGeometry(0.23, 0.02, 8, 16), new THREE.MeshStandardMaterial({ color: 0xff7a1a }));
  rim.position.set(FAIRWAY_FACILITY.court.hoop[0], 3.05, FAIRWAY_FACILITY.court.hoop[1] + 0.25);
  rim.rotation.x = Math.PI / 2;
  fac.add(rim);

  const pitchMesh = new THREE.Mesh(new THREE.PlaneGeometry(FAIRWAY_FACILITY.pitch.radius * 1.6, FAIRWAY_FACILITY.pitch.radius * 2.2), new THREE.MeshStandardMaterial({ color: 0x3d8f3d, roughness: 1 }));
  pitchMesh.rotation.x = -Math.PI / 2;
  pitchMesh.position.set(FAIRWAY_FACILITY.pitch.spot[0], 0.005, (FAIRWAY_FACILITY.pitch.spot[1] + FAIRWAY_FACILITY.pitch.goal[1]) / 2);
  fac.add(pitchMesh);
  const goalMat = new THREE.MeshStandardMaterial({ color: 0xf4f4f4 });
  const postGeo = new THREE.CylinderGeometry(0.06, 0.06, 2.44, 8);
  for (const side of [-1, 1]) {
    const post = new THREE.Mesh(postGeo, goalMat);
    post.position.set(FAIRWAY_FACILITY.pitch.goal[0] + side * FAIRWAY_FACILITY.pitch.goalWidth / 2, 1.22, FAIRWAY_FACILITY.pitch.goal[1]);
    fac.add(post);
  }
  const bar = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, FAIRWAY_FACILITY.pitch.goalWidth, 8), goalMat);
  bar.rotation.z = Math.PI / 2;
  bar.position.set(FAIRWAY_FACILITY.pitch.goal[0], 2.44, FAIRWAY_FACILITY.pitch.goal[1]);
  fac.add(bar);

  root.add(fac);
  parent.add(root);
  return root;
}
