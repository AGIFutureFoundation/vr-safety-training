// MOTORWORKS' parish mount (the environment & robotics wave, prefix mv):
// parked Motor Pool vehicles of fitting classes at fitting sites in any of the
// 22 parish-engine maps, drawn as two instanced meshes per map (a body and a
// cab, per-instance size and livery), each driven through NEWTON's drive mode
// only after its gate opens and its pre-trip is walked on the Motor Pool board
// (the gate contract, unchanged). Per-class handling comes from
// mv-motorworks.js; the crash card is NEWTON's, unchanged.
//
//   mvPlacements(parish, world, { tier }) -> [{ id, site, siteName, drivable, entry, x, z, heading, dims, why }]
//     Pure: which vehicle parks where. `world` is NEWTON's nwParishWorld (its
//     waterDepthAt and boxesNear); every spot is on dry, level-enough ground,
//     clear of the parish's road carriageways (off the centreline by the half
//     width and a margin), of building boxes and of NEWTON's site props.
//   mvDriveEntry(entry, ctx, categories) -> the registry entry with MOTORWORKS'
//     handling as its profile and a livery colour (PALETTE's when present).
//   mvGate(entry, snap) -> { open, missing } from skill-gates' qmMissing.
//   mvMountMotorworks({ three, root, parish, world, tier, categories, region })
//     -> { parked, near(x, z), prompt(p, snap), hide(id), show(id), counts(), meshes }
//
// `three` is passed in (this module names no three.js import, so it rides in
// the parish bundle without kit weight; the full Motor Pool builders stay in
// Bay World's bundle). `categories` is PALETTE's PA_CATEGORIES when the page
// has it — guarded: absent, each class keeps its own colour.
import { NP_SIZE, NP_ROAD_KINDS, npHeightAt, npWaterAt, npNearestRoad, npPolyDistance, npPolyPointAt, npDistrictAt } from "./np-parish.js";
import { nwVehicleState, nwVehicleClear } from "./nw-physics.js";
import { NW_CLASS_DIMS, NW_PROPS } from "./nw-drive.js";
import { DV_DRIVABLES, dvById } from "./drivables-data.js";
import { qmMissing, qmSnapshot } from "./skill-gates.js";
import { MV_SITE_RULES, MV_BUDGET, mvProfile, mvLivery, mvRuleFor } from "./mv-motorworks.js";

/** Clearance (m) past a road's half width that a parked footprint keeps from the centreline. */
export const MV_ROAD_MARGIN = 1.5;
/**
 * Where the parishes app sets the player down at a site (the start and fast travel: app.js puts the eye 16 m on +z from
 * the site). SURVEYOR-2: the first ring's bearing 0 was 1 m from it, so a parked cab stood over the arriving camera (the
 * black shape in the la-avex-new-iberia start capture); a parked footprint now keeps MV_ARRIVAL_CLEAR m past its own
 * half-length from every site's arrival point.
 */
export const MV_ARRIVAL_OFFSET = 16;
export const MV_ARRIVAL_CLEAR = 3;
export function mvArrivalPoint(site) { return [site.position[0], site.position[1] + MV_ARRIVAL_OFFSET]; }

/** Candidate rings around a site (radius m) and bearings. */
const MV_RADII = [17, 23, 30, 38];
const MV_BEARINGS = 12;

/** NEWTON's site props (cones, barrels, parked cars) as points a parked vehicle keeps clear of. */
export function mvPropPoints(site) {
  const [sx, sz] = site.position, out = [];
  for (let i = 0; i < NW_PROPS.cone.n; i++) out.push([sx - 3 + i * 2, sz + 9]);
  for (let i = 0; i < NW_PROPS.barrel.n; i++) out.push([sx + 6 + i * 1.2, sz + 8]);
  for (let i = 0; i < NW_PROPS.car.n; i++) out.push([sx + 18 + i * 3, sz - 6 + i * 6]);
  out.push([sx - 14, sz - 12]); // the site building's centre (its box is also in the world)
  return out;
}

/** The road-side clearance at (x, z): distance from the nearest road centreline minus its half width. */
export function mvRoadClearance(parish, x, z) {
  const near = npNearestRoad(parish, x, z);
  if (!near.road) return { clear: Infinity, d: Infinity, road: null };
  const half = (NP_ROAD_KINDS[near.road.kind]?.width ?? 9) / 2;
  return { clear: near.d - half, d: near.d, half, road: near.road };
}

function mvPick(site, rule) {
  const ids = rule.drivables.filter((id) => { const e = dvById(id); return e && (e.kind === "road" || e.kind === "site"); });
  const stations = new Set(site.stations ?? []);
  return ids.find((id) => (dvById(id).gate?.stations ?? []).some((s) => stations.has(s))) ?? ids[0] ?? null;
}

function mvFootprintOk(parish, world, x, z, heading, dims) {
  const [w, h, l] = dims;
  const fx = Math.sin(heading), fz = Math.cos(heading), rx = Math.cos(heading), rz = -Math.sin(heading);
  const pts = [[0, 0], [1, 1], [1, -1], [-1, 1], [-1, -1]].map(([a, b]) => [x + rx * a * (w / 2 + 0.5) + fx * b * (l / 2 + 0.5), z + rz * a * (w / 2 + 0.5) + fz * b * (l / 2 + 0.5)]);
  let lo = Infinity, hi = -Infinity;
  for (const [px, pz] of pts) {
    if (Math.abs(px) > NP_SIZE / 2 - 24 || Math.abs(pz) > NP_SIZE / 2 - 24) return false;
    if (npWaterAt(parish, px, pz) || (world.waterDepthAt(px, pz) || 0) > 0.02) return false; // dry: no water polygon (marsh too), no depth
    const c = mvRoadClearance(parish, px, pz);
    if (c.clear < MV_ROAD_MARGIN) return false;
    const y = npHeightAt(parish, px, pz); lo = Math.min(lo, y); hi = Math.max(hi, y);
  }
  if (hi - lo > 1.2) return false;
  return nwVehicleClear(nwVehicleState(x, z, heading, [w / 2 + 0.4, h / 2, l / 2 + 0.4], world), world);
}

/**
 * Which vehicle parks where (pure, deterministic). Sites whose station lists
 * name the vehicle's own gate station come first; one vehicle per site, no
 * drivable more than twice per map, capped per tier (MV_BUDGET.perMap).
 */
export function mvPlacements(parish, world, { tier = "balanced" } = {}) {
  const cap = MV_BUDGET.perMap[tier] ?? MV_BUDGET.perMap.balanced;
  const cands = [];
  parish.sites.forEach((site, order) => {
    const rule = mvRuleFor(site);
    if (!rule) return;
    const id = mvPick(site, rule);
    if (!id) return;
    const entry = dvById(id);
    const match = (entry.gate?.stations ?? []).some((s) => (site.stations ?? []).includes(s));
    cands.push({ site, rule, id, entry, match, order });
  });
  cands.sort((a, b) => (b.match - a.match) || (a.order - b.order));
  const out = [], per = new Map();
  const arrivals = parish.sites.map(mvArrivalPoint);
  for (const c of cands) {
    if (out.length >= cap) break;
    if ((per.get(c.id) ?? 0) >= 2) continue;
    const dims = NW_CLASS_DIMS[c.entry.class] ?? [2.2, 2.2, 6];
    const props = mvPropPoints(c.site);
    let spot = null;
    for (const r of MV_RADII) {
      for (let k = 0; k < MV_BEARINGS && !spot; k++) {
        const a = (k / MV_BEARINGS) * Math.PI * 2 + (c.order % 3) * 0.35;
        const x = c.site.position[0] + Math.sin(a) * r, z = c.site.position[1] + Math.cos(a) * r;
        if (props.some(([px, pz]) => Math.hypot(px - x, pz - z) < dims[2] / 2 + 2.5)) continue;
        if (out.some((o) => Math.hypot(o.x - x, o.z - z) < 14)) continue;
        if (arrivals.some(([ax, az]) => Math.hypot(ax - x, az - z) < dims[2] / 2 + MV_ARRIVAL_CLEAR)) continue;
        // Park parallel to the nearest road (kerbside), else facing away from the site.
        const rc = mvRoadClearance(parish, x, z);
        let heading = a;
        if (rc.road) { const p = npPolyPointAt(rc.road.pts, npPolyDistance(x, z, rc.road.pts).t); if (typeof p?.yaw === "number") heading = p.yaw; }
        if (mvFootprintOk(parish, world, x, z, heading, dims)) spot = { x, z, heading };
      }
      if (spot) break;
    }
    if (!spot) continue;
    per.set(c.id, (per.get(c.id) ?? 0) + 1);
    out.push({ id: `mv-${parish.id}-${c.site.id}`, site: c.site.id, siteName: c.site.name, siteKind: c.site.kind, drivable: c.id, entry: c.entry, x: +spot.x.toFixed(2), z: +spot.z.toFixed(2), heading: +spot.heading.toFixed(4), dims, why: c.rule.why, match: c.match });
  }
  return out;
}

/** The registry entry with MOTORWORKS' per-class handling and a livery (PALETTE's colour category when passed). */
export function mvDriveEntry(entry, ctx = {}, categories = null) {
  const colour = mvLivery(entry, ctx, categories);
  const kit = { ...entry.kit, opts: { ...(entry.kit?.opts ?? {}), livery: { ...(entry.kit?.opts?.livery ?? {}), colour } } };
  return { ...entry, kit, profile: mvProfile(entry), mv: true };
}

/** The gate contract: open only when every qualifying station is on the passport. */
export function mvGate(entry, snap = qmSnapshot()) {
  const missing = qmMissing(entry.gate, snap);
  return { open: missing.length === 0, missing };
}

/** PALETTE's categories when the page has them (guarded: a bundled const, a global, or nothing). */
export function mvPaletteCategories() {
  try { if (typeof PA_CATEGORIES !== "undefined") return PA_CATEGORIES; } catch { /* not in scope */ } // eslint-disable-line no-undef
  return globalThis.PA_CATEGORIES ?? null;
}

/** Mount the parked vehicles in a parish page (see the header). */
export function mvMountMotorworks({ three, root, parish, world, tier = "balanced", categories = undefined, region = null } = {}) {
  const T = three;
  const cats = categories === undefined ? mvPaletteCategories() : categories;
  const parked = mvPlacements(parish, world, { tier }).map((p, i) => {
    const character = npDistrictAt(parish, p.x, p.z)?.character ?? null;
    const drive = mvDriveEntry(p.entry, { region: region ?? parish.region ?? "new-orleans", character, seed: p.id }, cats);
    return { ...p, index: i, character, drive, colour: drive.kit.opts.livery.colour, hidden: false };
  });
  const meshes = [];
  let body = null, cab = null;
  if (T && root && parked.length) {
    const bodyGeo = new T.BoxGeometry(1, 1, 1); bodyGeo.translate(0, 0.5, 0);
    const cabGeo = new T.BoxGeometry(1, 1, 1); cabGeo.translate(0, 0.5, 0);
    body = new T.InstancedMesh(bodyGeo, new T.MeshLambertMaterial({ color: 0xffffff }), parked.length);
    cab = new T.InstancedMesh(cabGeo, new T.MeshLambertMaterial({ color: 0x2c3a46 }), parked.length);
    body.name = "mv-parked-body"; cab.name = "mv-parked-cab";
    const col = new T.Color();
    parked.forEach((p) => body.setColorAt(p.index, col.setHex(p.colour)));
    if (body.instanceColor) body.instanceColor.needsUpdate = true;
    meshes.push(body, cab);
    root.add(body, cab);
  }
  const m4 = T ? new T.Matrix4() : null, q = T ? new T.Quaternion() : null, v = T ? new T.Vector3() : null, s = T ? new T.Vector3() : null, up = T ? new T.Vector3(0, 1, 0) : null;
  function draw(p) {
    if (!body) return;
    const [w, h, l] = p.dims, y = npHeightAt(parish, p.x, p.z);
    q.setFromAxisAngle(up, p.heading);
    const k = p.hidden ? 0 : 1;
    m4.compose(v.set(p.x, y + 0.35, p.z), q, s.set(w * k || 1e-4, h * 0.55 * k || 1e-4, l * k || 1e-4)); body.setMatrixAt(p.index, m4);
    const fwd = l * 0.18;
    m4.compose(v.set(p.x + Math.sin(p.heading) * fwd, y + 0.35 + h * 0.55, p.z + Math.cos(p.heading) * fwd), q, s.set(w * 0.92 * k || 1e-4, h * 0.4 * k || 1e-4, Math.min(l * 0.4, 2.6) * k || 1e-4)); cab.setMatrixAt(p.index, m4);
    body.instanceMatrix.needsUpdate = true; cab.instanceMatrix.needsUpdate = true;
  }
  parked.forEach(draw);
  const byId = new Map(parked.map((p) => [p.id, p]));
  return {
    parked, meshes,
    /** The nearest shown parked vehicle within the prompt distance of (x, z), or null. */
    near(x, z, within = MV_BUDGET.prompt) {
      let best = null, bd = Infinity;
      for (const p of parked) {
        if (p.hidden) continue;
        const d = Math.hypot(p.x - x, p.z - z) - Math.max(p.dims[0], p.dims[2]) / 2;
        if (d < within && d < bd) { bd = d; best = p; }
      }
      return best;
    },
    /** The enter prompt for a parked vehicle, with the gate state. */
    prompt(p, snap = qmSnapshot()) {
      const g = mvGate(p.entry, snap);
      return { open: g.open, missing: g.missing, text: g.open ? `E — pre-trip and drive the ${p.entry.name.toLowerCase()}` : `E — ${p.entry.name}: locked until its pre-trip station is on your passport` };
    },
    hide(id) { const p = byId.get(id); if (p) { p.hidden = true; draw(p); } },
    show(id) { const p = byId.get(id); if (p) { p.hidden = false; draw(p); } },
    counts() { return { parked: parked.length, meshes: meshes.length, drivables: [...new Set(parked.map((p) => p.drivable))], palette: !!cats }; },
  };
}

/** Every drivable a site rule names, for the checker (and TQ-BRIDGE's export). */
export const MV_RULE_DRIVABLES = [...new Set(MV_SITE_RULES.flatMap((r) => r.drivables))].filter((id) => DV_DRIVABLES.some((d) => d.id === id));
