// Bay World — city stub.
//
// Team BAY1 is landing the real city as WebXR/shared/bayworld-data.js (pure
// data: BAY_BOUNDS, BAY_ZONES, BAY_LANDMARKS, BAY_ROADS, BAY_SITES, bayHeight,
// bayZoneAt, bayRoadAt) and WebXR/shared/bayworld.js (buildBayWorld(parent,
// opts), bayLighting(time)). This module is a small, original stylised city
// against that exact combined interface — four zones, six landmarks, eight
// sites and a ring-road-plus-grid street layout — so Bay World (WebXR/
// bayworld) runs and its checks pass before that lands. See
// WebXR/bayworld/js/city.js for the one-line-per-module switch that swaps
// this stub for the two real modules once they exist.
//
// Coordinates are metres in the same flat x/z ground plane every WebXR app
// builds on (y is up). The city is a stylised township, not a real place:
// every zone, landmark and site name here is original to this platform.

// ------------------------------------------------------------------ zones

export const BAY_BOUNDS = { minX: -260, maxX: 260, minZ: -260, maxZ: 260 };

export const BAY_ZONES = [
  { id: "downtown", name: "Downtown Bay", center: [-140, -140], radius: 150, color: 0x4fd1ff },
  { id: "harborfront", name: "Harborfront", center: [140, -140], radius: 150, color: 0x3fa9d8 },
  { id: "industrial", name: "Industrial Flats", center: [-140, 140], radius: 150, color: 0xd8a23f },
  { id: "heights", name: "Signal Heights", center: [140, 140], radius: 150, color: 0x6fbf6f },
];

// ------------------------------------------------------------- landmarks

export const BAY_LANDMARKS = [
  { id: "city-hall-tower", name: "City Hall Tower", position: [-140, 0, -245], zone: "downtown" },
  { id: "clocktower-plaza", name: "Clocktower Plaza", position: [-60, 0, -140], zone: "downtown" },
  { id: "ferry-terminal", name: "Ferry Terminal", position: [245, 0, -140], zone: "harborfront" },
  { id: "bay-bridge-span", name: "Bay Bridge Span", position: [245, 0, -230], zone: "harborfront" },
  { id: "water-tower", name: "Water Tower", position: [-245, 0, 190], zone: "industrial" },
  { id: "overlook-point", name: "Overlook Point", position: [140, 0, 245], zone: "heights" },
];

// ------------------------------------------------------------------ roads
//
// A ring road bordering the four zones, two cross streets through the
// middle (the ambient traffic loop, `traffic: true`), and one short spur per
// site off the nearest through-road (`traffic: false` — the player's own
// route in; ambient traffic never turns down one, which keeps the junction
// rules at the eight site mouths simple: a spur always yields to the road it
// meets).

export const BAY_ROADS = [
  { id: "ring-road", loop: true, traffic: true, points: [[-220, -220], [220, -220], [220, 220], [-220, 220]] },
  { id: "center-street", traffic: true, points: [[-220, 0], [220, 0]] },
  { id: "bay-avenue", traffic: true, points: [[0, -220], [0, 220]] },
  { id: "spur-civic-charge-plaza", traffic: false, site: "civic-charge-plaza", points: [[-170, -220], [-170, -190]] },
  { id: "spur-boiler-plant", traffic: false, site: "boiler-plant", points: [[0, -110], [-90, -110]] },
  { id: "spur-harbor-crane-berth", traffic: false, site: "harbor-crane-berth", points: [[190, -220], [190, -190]] },
  { id: "spur-rigging-yard", traffic: false, site: "rigging-yard", points: [[110, 0], [110, -90]] },
  { id: "spur-lift-station-nine", traffic: false, site: "lift-station-nine", points: [[-190, 220], [-190, 190]] },
  { id: "spur-decon-corridor", traffic: false, site: "decon-corridor", points: [[0, 110], [-90, 110]] },
  { id: "spur-transit-yard-dock", traffic: false, site: "transit-yard-dock", points: [[220, 110], [190, 110]] },
  { id: "spur-scaffold-lot", traffic: false, site: "scaffold-lot", points: [[110, 220], [110, 190]] },
];

/** Where two segments (each [x, z] endpoint pairs) cross or touch, else
 *  null — the standard two-line parametric solve, not a shared-endpoint
 *  lookup, so a spur's own end meeting the middle of a through road (a
 *  T-junction) and two through roads crossing in open ground (an X) both
 *  count, not only two roads that happen to share a listed vertex. */
function segmentCross(a1, a2, b1, b2) {
  const [x1, y1] = a1, [x2, y2] = a2, [x3, y3] = b1, [x4, y4] = b2;
  const d = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);
  if (Math.abs(d) < 1e-9) return null; // parallel (or collinear — no single crossing point)
  const t = ((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)) / d;
  const u = ((x1 - x3) * (y1 - y2) - (y1 - y3) * (x1 - x2)) / d;
  const eps = 1e-6;
  if (t < -eps || t > 1 + eps || u < -eps || u > 1 + eps) return null;
  return [x1 + t * (x2 - x1), y1 + t * (y2 - y1)];
}

/** Every point where two different roads' own segments cross or touch —
 *  where ambient traffic and a player's own route both have to give way, an
 *  X between two through streets as much as a T where a site's own spur
 *  meets one. Used by sim.js's traffic AI and by the map to draw a junction
 *  marker. */
export function bayJunctions() {
  const at = new Map();
  const key = (p) => `${Math.round(p[0] * 4)},${Math.round(p[1] * 4)}`; // quarter-metre buckets
  const segs = (road) => {
    const pts = road.loop ? [...road.points, road.points[0]] : road.points;
    const out = [];
    for (let i = 0; i < pts.length - 1; i++) out.push([pts[i], pts[i + 1]]);
    return out;
  };
  for (let i = 0; i < BAY_ROADS.length; i++) {
    for (let j = i + 1; j < BAY_ROADS.length; j++) {
      const ra = BAY_ROADS[i], rb = BAY_ROADS[j];
      for (const [a1, a2] of segs(ra)) {
        for (const [b1, b2] of segs(rb)) {
          const p = segmentCross(a1, a2, b1, b2);
          if (!p) continue;
          const k = key(p);
          if (!at.has(k)) at.set(k, { point: p, roads: new Set() });
          at.get(k).roads.add(ra.id).add(rb.id);
        }
      }
    }
  }
  return [...at.values()].map((v) => ({ point: v.point, roads: [...v.roads] }));
}

// -------------------------------------------------------------------- sites

export const BAY_SITES = [
  { id: "civic-charge-plaza", name: "Civic Charge Plaza", zone: "downtown", position: [-170, 0, -190], programmes: ["electrical-first-period"], stations: ["charge-point"] },
  { id: "boiler-plant", name: "Municipal Boiler Plant", zone: "downtown", position: [-90, 0, -110], programmes: ["stationary-engineer"], stations: ["boiler-room"] },
  { id: "harbor-crane-berth", name: "Harbor Crane Berth", zone: "harborfront", position: [190, 0, -190], programmes: ["port-operations"], stations: ["dock-crane"] },
  { id: "rigging-yard", name: "Rigging Yard", zone: "harborfront", position: [110, 0, -90], programmes: ["rigging-lifting"], stations: ["crane-yard"] },
  { id: "lift-station-nine", name: "Lift Station Nine", zone: "industrial", position: [-190, 0, 190], programmes: ["confined-space"], stations: ["lift-station"] },
  { id: "decon-corridor", name: "Decon Corridor", zone: "industrial", position: [-90, 0, 110], programmes: ["hazmat-environmental"], stations: ["decon-line"] },
  { id: "transit-yard-dock", name: "Transit Yard Dock", zone: "heights", position: [190, 0, 110], programmes: ["transit-ramp"], stations: ["forklift-dock"] },
  { id: "scaffold-lot", name: "Scaffold Lot", zone: "heights", position: [110, 0, 190], programmes: ["fall-protection"], stations: ["scaffold-erection"] },
];

// ------------------------------------------------------------------ terrain

/** Flat city streets with a gentle rise under Signal Heights and a shoreline
 *  drop past the harborfront water's edge (x > 235). Metres of rise. */
export function bayHeight(x, z) {
  const rolling = Math.sin(x * 0.01) * Math.cos(z * 0.012) * 0.12;
  const hdx = x - 140, hdz = z - 140;
  const hillDist = Math.hypot(hdx, hdz);
  const hill = hillDist < 130 ? Math.cos((hillDist / 130) * (Math.PI / 2)) ** 2 * 9 : 0;
  const shore = x > 235 ? -0.3 - Math.min(2, (x - 235) * 0.05) : 0;
  return rolling + hill + shore;
}

// -------------------------------------------------------------------- zone

function dist2(ax, az, bx, bz) { const dx = ax - bx, dz = az - bz; return dx * dx + dz * dz; }

/** The zone whose centre a point is nearest to — a simple Voronoi split that
 *  covers the whole map, water included (the harborfront's own water). */
export function bayZoneAt(x, z) {
  let best = null, bestD = Infinity;
  for (const z2 of BAY_ZONES) {
    const d = dist2(x, z, z2.center[0], z2.center[1]);
    if (d < bestD) { bestD = d; best = z2; }
  }
  return best ? best.id : null;
}

// -------------------------------------------------------------------- road

function distToSegment(px, pz, ax, az, bx, bz) {
  const dx = bx - ax, dz = bz - az;
  const len2 = dx * dx + dz * dz || 1e-9;
  let t = ((px - ax) * dx + (pz - az) * dz) / len2;
  t = Math.max(0, Math.min(1, t));
  const cx = ax + dx * t, cz = az + dz * t;
  return { d: Math.hypot(px - cx, pz - cz), t, cx, cz };
}

export const BAY_ROAD_HALF = 5;      // metres either side of centreline: the paved lanes
export const BAY_ROAD_SHOULDER = 9;  // metres either side: sidewalk before the building line

/**
 * `{ id, distance, heading, lane }` for the nearest road to a point — `lane`
 * is "road" (on the pavement), "shoulder" (the sidewalk) or "off" (a
 * building lot). Heading points along the segment toward its second point,
 * in the same 0 = +z convention every WebXR app's vehicles use.
 */
export function bayRoadAt(x, z) {
  let best = null;
  for (const road of BAY_ROADS) {
    const pts = road.points;
    const segCount = road.loop ? pts.length : pts.length - 1;
    for (let i = 0; i < segCount; i++) {
      const a = pts[i], b = pts[(i + 1) % pts.length];
      const s = distToSegment(x, z, a[0], a[1], b[0], b[1]);
      if (!best || s.d < best.distance) {
        const heading = Math.atan2(b[0] - a[0], b[1] - a[1]);
        best = { id: road.id, distance: s.d, heading, t: s.t, segIndex: i };
      }
    }
  }
  if (!best) return { id: null, distance: Infinity, heading: 0, lane: "off" };
  const lane = best.distance <= BAY_ROAD_HALF ? "road" : best.distance <= BAY_ROAD_SHOULDER ? "shoulder" : "off";
  return { ...best, lane };
}

// -------------------------------------------------------------------- build

function bwRng(seed) {
  let a = (seed >>> 0) || 0x9e3779b9;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * The city's building footprints — pure, deterministic and three.js-free, so
 * both buildBayWorld() (which turns each one into a box mesh) and sim.js's
 * vehicle collision (which never loads a renderer) place, and therefore
 * collide with, the exact same buildings. Same shape as buildBayWorld()'s own
 * `detail`/`zone` options.
 */
export function bayBuildings(detail = "high", zone = null) {
  const out = [];
  for (const z of BAY_ZONES) {
    const zoneDetail = zone ? (z.id === zone ? "high" : "low") : detail;
    const count = zoneDetail === "high" ? 14 : 5;
    const rng = bwRng(z.center[0] * 733 + z.center[1] * 17 + count);
    let placed = 0, tries = 0;
    while (placed < count && tries < count * 8) {
      tries += 1;
      const ang = rng() * Math.PI * 2, r = 30 + rng() * (z.radius - 45);
      const x = z.center[0] + Math.cos(ang) * r, zz = z.center[1] + Math.sin(ang) * r;
      if (x > 232) continue; // don't build into the water
      if (bayRoadAt(x, zz).lane !== "off") continue;
      let clearOfSite = true;
      for (const s of BAY_SITES) if (Math.hypot(x - s.position[0], zz - s.position[2]) < 14) { clearOfSite = false; break; }
      if (!clearOfSite) continue;
      const w = 6 + rng() * 10, d = 6 + rng() * 10, h = 6 + rng() * (zoneDetail === "high" ? 30 : 14);
      const shade = 0.55 + rng() * 0.35;
      out.push({ x, z: zz, w, d, h, zone: z.id, shade });
      placed += 1;
    }
  }
  return out;
}

/** A hex colour scaled channel-wise by `k` — plain arithmetic rather than
 *  three.js's own Color.multiplyScalar(), so this never depends on a method a
 *  headless checker's stub renderer may not carry. */
function bwShade(hex, k) {
  const r = Math.min(255, Math.round(((hex >> 16) & 0xff) * k));
  const g = Math.min(255, Math.round(((hex >> 8) & 0xff) * k));
  const b = Math.min(255, Math.round((hex & 0xff) * k));
  return (r << 16) | (g << 8) | b;
}

function bwBox(THREE, w, h, d, x, y, z, color, opts = {}) {
  const geo = new THREE.BoxGeometry(w, h, d);
  const mat = new THREE.MeshStandardMaterial({ color, roughness: opts.roughness ?? 0.85, metalness: opts.metalness ?? 0.05 });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.position.set(x, y + h / 2, z);
  mesh.castShadow = true; mesh.receiveShadow = true;
  return mesh;
}

function bwDisc(THREE, radius, color, x, y, z, opts = {}) {
  const geo = new THREE.CircleGeometry(radius, opts.segments ?? 28);
  geo.rotateX(-Math.PI / 2);
  const mat = new THREE.MeshStandardMaterial({ color, roughness: opts.roughness ?? 0.95, metalness: opts.metalness ?? 0 });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.position.set(x, y, z);
  mesh.receiveShadow = true;
  return mesh;
}

function bwRibbon(THREE, pts, half, color, y = 0.02, opts = {}) {
  const group = new THREE.Group();
  for (let i = 0; i < pts.length - 1; i++) {
    const [ax, az] = pts[i], [bx, bz] = pts[i + 1];
    const dx = bx - ax, dz = bz - az;
    const len = Math.hypot(dx, dz) || 1;
    const geo = new THREE.PlaneGeometry(half * 2, len);
    geo.rotateX(-Math.PI / 2);
    const mesh = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ color, roughness: opts.roughness ?? 1 }));
    mesh.position.set((ax + bx) / 2, y, (az + bz) / 2);
    mesh.rotation.y = -Math.atan2(dz, dx) + Math.PI / 2;
    mesh.receiveShadow = true;
    group.add(mesh);
  }
  return group;
}

function bwTower(THREE, x, z, h, w, color, spireColor) {
  const g = new THREE.Group();
  g.add(bwBox(THREE, w, h, w, 0, 0, 0, color));
  const spire = new THREE.Mesh(new THREE.CylinderGeometry(0.2, w * 0.5, h * 0.22, 6), new THREE.MeshStandardMaterial({ color: spireColor ?? color }));
  spire.position.set(0, h + (h * 0.11), 0);
  spire.castShadow = true;
  g.add(spire);
  g.position.set(x, 0, z);
  return g;
}

function bwLandmarkMesh(THREE, landmark) {
  const [x, , z] = landmark.position;
  switch (landmark.id) {
    case "city-hall-tower": return bwTower(THREE, x, z, 26, 9, 0xcbd6df, 0x8ea0ac);
    case "clocktower-plaza": {
      const g = bwTower(THREE, x, z, 14, 4, 0xd8c9a3, 0x8a6f3f);
      const face = new THREE.Mesh(new THREE.CircleGeometry(1.3, 20), new THREE.MeshStandardMaterial({ color: 0xf4ead0, emissive: 0x4a3a10, emissiveIntensity: 0.25 }));
      face.position.set(x, 14 + 0.5, z + 2.05);
      g.add(face);
      return g;
    }
    case "ferry-terminal": {
      const g = new THREE.Group();
      g.add(bwBox(THREE, 30, 7, 12, x, 0, z, 0xe9ecef));
      g.add(bwBox(THREE, 34, 0.6, 16, x, 7, z, 0x3fa9d8, { roughness: 0.6 }));
      return g;
    }
    case "bay-bridge-span": {
      const g = new THREE.Group();
      for (const side of [-1, 1]) g.add(bwBox(THREE, 2.4, 30, 2.4, x, 0, z + side * 10, 0x8a3a2f, { metalness: 0.2 }));
      const deck = bwBox(THREE, 3, 0.8, 26, x, 6, z, 0x555a60);
      deck.rotation.y = Math.PI / 2;
      g.add(deck);
      return g;
    }
    case "water-tower": {
      const g = new THREE.Group();
      const tank = new THREE.Mesh(new THREE.CylinderGeometry(6, 6, 8, 16), new THREE.MeshStandardMaterial({ color: 0xc9c2b0, metalness: 0.3, roughness: 0.5 }));
      tank.position.set(x, 20, z);
      tank.castShadow = true;
      g.add(tank);
      for (const [dx, dz] of [[-4, -4], [4, -4], [-4, 4], [4, 4]]) {
        const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.35, 16, 6), new THREE.MeshStandardMaterial({ color: 0x555a60 }));
        leg.position.set(x + dx, 8, z + dz);
        g.add(leg);
      }
      return g;
    }
    case "overlook-point": {
      const g = new THREE.Group();
      g.add(bwBox(THREE, 8, 1, 8, x, 8, z, 0x8a8f78));
      for (const [dx, dz] of [[-3, -3], [3, -3], [-3, 3], [3, 3]]) g.add(bwBox(THREE, 0.4, 8, 0.4, x + dx, 0, z + dz, 0x6f7a66));
      g.add(bwBox(THREE, 8.4, 0.9, 8.4, x, 8.9, z, 0xf4ead0, { roughness: 0.6 }));
      return g;
    }
    default: return bwBox(THREE, 6, 6, 6, x, 0, z, 0x888888);
  }
}

function bwSiteMesh(THREE, site) {
  const [x, , z] = site.position;
  const g = new THREE.Group();
  const pad = bwDisc(THREE, 6, 0xf2c14b, x, 0.03, z, { roughness: 0.7 });
  g.add(pad);
  const post = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.14, 3.4, 8), new THREE.MeshStandardMaterial({ color: 0x2a2f36 }));
  post.position.set(x, 1.7, z);
  g.add(post);
  const board = new THREE.Mesh(new THREE.BoxGeometry(2.4, 1.4, 0.12), new THREE.MeshStandardMaterial({ color: 0x123449, emissive: 0x0a1f2c, emissiveIntensity: 0.3 }));
  board.position.set(x, 3.2, z);
  g.add(board);
  g.userData.bwSite = site.id;
  return g;
}

/**
 * Builds a small stylised city into `parent`. `opts.THREE` is the app's own
 * three.js module; `opts.detail` ("low" | "high", default "high") scales the
 * building count and street furniture; `opts.zone`, when given, builds only
 * that zone at "high" and every other zone at "low" — a cheap LOD split for a
 * world this size, ready for the real district streamer once it lands.
 */
export function buildBayWorld(parent, opts = {}) {
  const THREE = opts.THREE;
  if (!THREE) throw new Error("buildBayWorld(parent, { THREE }) needs a three.js module");
  const baseDetail = opts.detail ?? "high";
  const focusZone = opts.zone ?? null;
  const root = new THREE.Group();
  root.name = "bay-world";

  // Ground: one tinted plane per zone, plus a darker paved yard under each
  // zone's own two sites.
  for (const zone of BAY_ZONES) {
    const ground = bwDisc(THREE, zone.radius + 40, bwShade(zone.color, 0.28), zone.center[0], -0.03, zone.center[1], { roughness: 1 });
    root.add(ground);
  }
  // Water, past the harborfront's own edge.
  const water = new THREE.Mesh(new THREE.PlaneGeometry(120, 620), new THREE.MeshStandardMaterial({ color: 0x1c5f86, roughness: 0.25, metalness: 0.15 }));
  water.rotation.x = -Math.PI / 2;
  water.position.set(295, -0.4, 0);
  root.add(water);

  // Roads.
  for (const road of BAY_ROADS) {
    const pts = road.loop ? [...road.points, road.points[0]] : road.points;
    const half = road.traffic ? BAY_ROAD_HALF : BAY_ROAD_HALF * 0.8;
    root.add(bwRibbon(THREE, pts, half, road.traffic ? 0x2c2f33 : 0x3a3d40, 0.02));
    root.add(bwRibbon(THREE, pts, half + (BAY_ROAD_SHOULDER - BAY_ROAD_HALF), 0x9a978d, 0.012));
  }

  // Landmarks.
  for (const landmark of BAY_LANDMARKS) root.add(bwLandmarkMesh(THREE, landmark));

  // Job-board sites.
  for (const site of BAY_SITES) root.add(bwSiteMesh(THREE, site));

  // Buildings: a deterministic scatter per zone (bayBuildings(), also used
  // headlessly for vehicle collision), thicker at "high" detail.
  const buildingsGroup = new THREE.Group();
  buildingsGroup.name = "bay-buildings";
  const zoneById = new Map(BAY_ZONES.map((z) => [z.id, z]));
  for (const b of bayBuildings(baseDetail, focusZone)) {
    const zoneColor = zoneById.get(b.zone)?.color ?? 0x888888;
    const color = bwShade(zoneColor, b.shade * 0.6 + 0.25);
    buildingsGroup.add(bwBox(THREE, b.w, b.h, b.d, b.x, bayHeight(b.x, b.z), b.z, color));
  }
  root.add(buildingsGroup);

  // Street furniture at "high" detail: a lamp post every third ring-road
  // waypoint edge and at each site's own pad edge.
  if (baseDetail === "high" && !focusZone) {
    const lampMat = new THREE.MeshStandardMaterial({ color: 0x2a2f36 });
    const lampGlow = new THREE.MeshStandardMaterial({ color: 0xffe6a8, emissive: 0xffcf6b, emissiveIntensity: 0.6 });
    for (const site of BAY_SITES) {
      for (const [dx, dz] of [[-8, 0], [8, 0]]) {
        const [x, , z] = site.position;
        const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 4.2, 6), lampMat);
        pole.position.set(x + dx, bayHeight(x + dx, z + dz) + 2.1, z + dz);
        const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.22, 8, 6), lampGlow);
        bulb.position.set(x + dx, bayHeight(x + dx, z + dz) + 4.3, z + dz);
        root.add(pole, bulb);
      }
    }
  }

  parent.add(root);
  return root;
}

// ----------------------------------------------------------------- lighting

/**
 * The day/night table for a given hour (0-24, wraps). Pure and deterministic:
 * the same `time` always yields the same sun, ambient, sky and fog, so the
 * checker and the renderer never disagree about when the street lights are on.
 */
export function bayLighting(time) {
  const t = ((time % 24) + 24) % 24;
  const dayPhase = Math.max(0, Math.min(1, (t - 6) / 12));            // 0 at 06:00, 1 at 18:00
  const elevation = Math.sin(Math.PI * dayPhase) * (t >= 6 && t <= 18 ? 1 : 0);
  const isNight = t < 5.25 || t > 19.75;
  const isDusk = !isNight && (t < 6.75 || t > 18.25);
  const warmth = isDusk ? 1 : 0; // dawn/dusk skew the sun orange

  const sunColor = isNight ? 0x2a3a55 : isDusk ? 0xff9a5a : 0xfff3d6;
  const sunIntensity = isNight ? 0.05 : Math.max(0.12, elevation) * (isDusk ? 0.85 : 1.05);
  const ambientColor = isNight ? 0x0e1626 : isDusk ? 0x8a6a55 : 0xdcefff;
  const ambientIntensity = isNight ? 0.28 : isDusk ? 0.55 : 0.85;
  const skyTop = isNight ? 0x040a16 : isDusk ? 0x2a3a66 : 0x6fb8ea;
  const skyBottom = isNight ? 0x0a1220 : isDusk ? 0xd88a5a : 0xcfeaff;
  const fogColor = isNight ? 0x060b14 : isDusk ? 0x4a3a3a : 0xbcd7e6;
  const fogDensity = isNight ? 0.012 : isDusk ? 0.009 : 0.006;

  const sunAngle = (dayPhase) * Math.PI; // 0 at sunrise (east), PI at sunset (west)
  const sun = {
    color: sunColor, intensity: sunIntensity,
    position: [Math.cos(sunAngle) * -200, Math.max(6, elevation * 220), Math.sin(sunAngle) * 60],
  };
  return {
    time: t, isNight, isDusk, sunElevation: elevation, warmth,
    sun, ambient: { color: ambientColor, intensity: ambientIntensity },
    sky: { top: skyTop, bottom: skyBottom },
    fog: { color: fogColor, density: fogDensity },
    streetlightsOn: isNight || isDusk,
  };
}
