// INTERIORS — walk-in rooms for the parish-engine maps (console `ix`, docs/consoles/INTERIORS.md).
//
// SEAMS (every top-level name is ix/IX_-prefixed: the bundler shares one scope; three.js comes from the caller):
//
//   IX_STYLES                       plain data: the generic room styles { label, w, d, h, colours, dress: [[prop, pattern]] }
//   IX_KIND_STYLE                   plain data: every parish-engine site kind -> a style id
//   ixStyleFor(kind)                -> style id (never null: an unknown kind gets "civic-lobby")
//   ixBuild(styleId, { three, tier = "high", site = null, dressers = IX_DRESSERS })
//                                   -> room { group, style, w, d, h, door: {x, z}, colliders: [{min, max}], actions: [...],
//                                             addAction({ id, kind, x, z, r = 1.4, label, run }), meshes() }
//   ixRegisterDresser(styleId, fn)  another console (CLASSROOMS `cr`) furnishes a style: fn({ three, group, room, site, tier })
//                                   adds its meshes to `group` and calls room.addAction(...) for anything the learner can use.
//                                   It runs after the shell, before the budget is counted (IX_BUDGET holds for the total).
//                                   room.budgetLeft() says how many meshes a dresser may still add. Nothing in a room moves.
//   ixWalk(room, pose, { vx, vz }, dt)  -> new pose: NEWTON's avatar step against the room's wall colliders (the room collider)
//   ixTycoonStyle(listing, business)  -> the style a TYCOON rental opens into (a business's trade, else "rented-room" / "shop")
//   ixDoorSpot(cwDoor, out = 1.4)   -> { x, z, face }: the prompt spot outside a site building's door (off the footprint)
//   ixMountInteriors({ three, scene, hide = [], tier, reduced, onBoard(site), onLaunch(stationId, site), onToast(msg) })
//                                   -> { enter(site, outdoorPose, { style?, title? }), exit() -> outdoorPose, inside(), room, pose, walk(input, dt),
//                                        near() -> action|null, use(), camera(eye) -> {x, y, z, yaw, pitch} }
//
// The rooms are GENERIC BY KIND. No real building's interior is modelled: a map's site is a real, named place, but the room behind
// its door is a procedural stand-in for "a firehouse apparatus bay" or "a clinic", and the room's own sign says so. While inside,
// every object in `hide` (the parishes app passes its world root, which carries the sky, the streamed chunks, streets, water and
// atmosphere) is hidden and the app stops calling the world's update, so nothing streams or draws; exit() restores the visibility
// exactly as it found it and returns the outdoor pose the learner entered from (the door spot). Nothing in a room moves, so reduced
// motion changes nothing. Budget: IX_BUDGET meshes per room on every tier; the phone tier ("low") drops the point light and halves
// the dressing.

import { nwWorld, nwAvatarState, nwAvatarStep } from "./nw-physics.js";

export const IX_BUDGET = { meshes: 120, lights: { high: 3, low: 1 }, triangles: { high: 6000, low: 3000 } };
/** The room is built far above the map so no outdoor object shares its space even if a caller forgets to hide one. */
export const IX_ORIGIN = [0, 4000, 0];

// Prop shapes, all unit boxes scaled per instance: [w, h, d] in metres and a colour key.
const IX_PROPS = {
  bench: [2.4, 0.9, 0.8, "wood"], desk: [1.2, 0.75, 0.6, "wood"], chair: [0.45, 0.9, 0.45, "trim"], rack: [2.4, 2.4, 0.6, "metal"],
  truck: [2.5, 3.0, 8.5, "accent"], bed: [0.95, 0.7, 2.0, "pale"], machine: [1.4, 1.6, 1.2, "metal"], tank: [1.6, 2.6, 1.6, "metal"],
  counter: [3.2, 0.95, 0.8, "pale"], locker: [0.5, 1.9, 0.5, "trim"], crate: [1.2, 1.0, 1.2, "wood"], railcar: [2.6, 3.2, 12, "accent"],
  hood: [3.2, 0.6, 1.0, "metal"], stage: [5, 0.4, 2.5, "wood"], pallet: [1.2, 1.4, 1.0, "wood"], cabinet: [1.0, 1.2, 0.5, "metal"],
};

// Patterns: rows(n, prop, z0, spacingZ, cols, spacingX) and wall runs; all generated below from compact specs.
export const IX_STYLES = {
  "union-hall":   { label: "Union hall", w: 18, d: 14, h: 5, wall: 0xd8cfbf, floor: 0x7a5a42, ceiling: 0xe8e2d6, trim: 0x2f5d8c, accent: 0xc0392b, lamp: 0xfff0d8,
    dress: [["stage", "front"], ["chair", "grid:5x6"], ["bench", "wall:2"], ["locker", "back:6"]] },
  "classroom":    { label: "Classroom", w: 12, d: 10, h: 3.4, wall: 0xeef0e6, floor: 0x9aa39a, ceiling: 0xf4f5f2, trim: 0x3f8f5a, accent: 0xf2c14b, lamp: 0xf6fbff,
    dress: [["desk", "grid:4x4"], ["chair", "grid:4x4+"], ["cabinet", "back:4"], ["counter", "front"]] },
  "apparatus-bay":{ label: "Firehouse apparatus bay", w: 16, d: 20, h: 6.5, wall: 0xc9c3b8, floor: 0x6d6f72, ceiling: 0xb9b3a8, trim: 0xb03a2e, accent: 0xc0392b, lamp: 0xf2f8ff,
    dress: [["truck", "bays:2"], ["locker", "wall:10"], ["rack", "back:2"]] },
  "clinic":       { label: "Clinic", w: 12, d: 10, h: 3.2, wall: 0xeef2f5, floor: 0xb9c4c9, ceiling: 0xf2f5f7, trim: 0x7fd1c9, accent: 0x2f8f8c, lamp: 0xf6fbff,
    dress: [["bed", "wall:4"], ["cabinet", "back:4"], ["counter", "front"], ["chair", "row:4"]] },
  "workshop":     { label: "Workshop / machine shop", w: 17, d: 12, h: 5.6, wall: 0xc4cad0, floor: 0x4e5a63, ceiling: 0x8f989f, trim: 0xf2c14b, accent: 0xf2a23b, lamp: 0xf2f8ff,
    dress: [["machine", "grid:2x4"], ["bench", "wall:3"], ["rack", "back:3"], ["cabinet", "row:3"]] },
  "warehouse":    { label: "Warehouse", w: 22, d: 18, h: 8, wall: 0xb8bfc4, floor: 0x5f656b, ceiling: 0x8b959c, trim: 0xf2c14b, accent: 0xf2a23b, lamp: 0xeef5fb,
    dress: [["rack", "aisles:4x3"], ["pallet", "grid:2x5"], ["crate", "row:4"]] },
  "plant-room":   { label: "Treatment plant room", w: 15, d: 11, h: 5, wall: 0xbcc6cc, floor: 0x6d7379, ceiling: 0x9aa4ab, trim: 0x4fb8c9, accent: 0x2f6f8c, lamp: 0xeaf4fb,
    dress: [["tank", "grid:2x3"], ["cabinet", "back:4"], ["machine", "row:2"]] },
  "kitchen":      { label: "Commercial kitchen", w: 14, d: 10, h: 3.8, wall: 0xe6ebee, floor: 0x7a5a48, ceiling: 0xd8dde2, trim: 0xb8c1c9, accent: 0x37d6c0, lamp: 0xf8fbff,
    dress: [["counter", "grid:2x2"], ["hood", "back:2"], ["rack", "wall:2"], ["cabinet", "row:3"]] },
  "transit-barn": { label: "Transit / streetcar barn", w: 18, d: 26, h: 7.5, wall: 0xb3bcc3, floor: 0x585f66, ceiling: 0x8b959c, trim: 0xf2a23b, accent: 0x2f7d4a, lamp: 0xeef5fb,
    dress: [["railcar", "bays:2"], ["bench", "wall:3"], ["rack", "back:2"]] },
  "port-shed":    { label: "Port maintenance shed", w: 20, d: 16, h: 7, wall: 0x9aa7b0, floor: 0x55606a, ceiling: 0x7d8993, trim: 0x2f6f8c, accent: 0xf2a23b, lamp: 0xeef5fb,
    dress: [["crate", "grid:3x4"], ["machine", "row:3"], ["rack", "back:3"], ["bench", "wall:2"]] },
  "civic-lobby":  { label: "Civic lobby", w: 14, d: 12, h: 4.5, wall: 0xe9e2d6, floor: 0x8a8378, ceiling: 0xf1ede6, trim: 0xb08a5a, accent: 0x37d6c0, lamp: 0xffe6c0,
    dress: [["counter", "front"], ["bench", "wall:4"], ["chair", "row:6"]] },
  // TYCOON's rentals (Crew Credits, a play currency): a rented room and a rented shop, generic and procedural like the listings.
  "rented-room":  { label: "Rented room", w: 8, d: 7, h: 3, wall: 0xe8e0d0, floor: 0x7d6450, ceiling: 0xf2eee6, trim: 0x8a6a48, accent: 0x37d6c0, lamp: 0xffe6c0,
    dress: [["bed", "back:1"], ["desk", "wall:1"], ["locker", "back:2"], ["chair", "front"]] },
  "shop":         { label: "Rented shop", w: 11, d: 9, h: 3.6, wall: 0xf0ebe0, floor: 0x9a8f80, ceiling: 0xf4f1ea, trim: 0x2f6f8c, accent: 0xf2c14b, lamp: 0xfff4e0,
    dress: [["counter", "front"], ["rack", "wall:4"], ["crate", "row:2"]] },
};

/** TYCOON: the room a rental opens into — a business's trade picks a matching style; otherwise the generic room or shop. */
export const IX_BUSINESS_STYLE = { "food-truck": "kitchen", "tool-rental": "workshop", "bike-repair": "workshop", "corner-shop": "shop", "boat-charter": "port-shed" };
export function ixTycoonStyle(listing, business = null) {
  if (business?.id && IX_BUSINESS_STYLE[business.id]) return IX_BUSINESS_STYLE[business.id];
  return listing?.type === "shop" ? "shop" : "rented-room";
}

/** Every site kind on the 22 maps -> a generic style. Outdoor kinds (parks, levees, wetlands) get the field office they would have. */
export const IX_KIND_STYLE = {
  "union-hall": "union-hall", school: "classroom", campus: "classroom", nursery: "classroom", events: "civic-lobby",
  "fire-station": "apparatus-bay", fire: "apparatus-bay", "rescue-station": "apparatus-bay", lifeguard: "apparatus-bay",
  hospital: "clinic", clinic: "clinic",
  workshop: "workshop", construction: "workshop", shipyard: "workshop", boatyard: "workshop", industrial: "workshop", "timber-yard": "workshop",
  yard: "workshop", "bridge-yard": "workshop", staging: "workshop", forestry: "workshop", remediation: "workshop",
  warehouse: "warehouse", trucking: "warehouse", market: "warehouse", airport: "warehouse",
  plant: "plant-room", pump: "plant-room", "pumping-station": "plant-room", substation: "plant-room", utility: "plant-room", refinery: "plant-room",
  stormwater: "plant-room", floodgate: "plant-room", lock: "plant-room", monitoring: "plant-room", "trash-capture": "plant-room",
  hospitality: "kitchen", hotel: "kitchen",
  streetcar: "transit-barn", rail: "transit-barn", transit: "transit-barn", "transit-barn": "transit-barn",
  port: "port-shed", harbour: "port-shed", marina: "port-shed", ferry: "port-shed", landing: "port-shed", boating: "port-shed", bridge: "port-shed",
  levee: "port-shed", seawall: "port-shed", floodwall: "port-shed", shoreline: "port-shed", shore: "port-shed", wetland: "port-shed",
  civic: "civic-lobby", park: "civic-lobby", recreation: "civic-lobby", stadium: "civic-lobby", theatre: "civic-lobby", trail: "civic-lobby",
};

/**
 * Each style's signature fittings, the few things that make one room read as its kind at a glance, all generic:
 * [w, h, d, x, y, z, colourKey] boxes in room-local metres (x, z as fractions of w/2 and d/2; y absolute), drawn as ONE
 * InstancedMesh per room. Colour keys: wall, trim, accent, metal, dark, pale, wood.
 */
export const IX_FEATURES = {
  "union-hall":    [[6, 1.2, 0.05, 0, 3.2, -0.99, "accent"], [0.08, 2.2, 0.08, -0.35, 1.1, -0.85, "metal"], [0.08, 2.2, 0.08, 0.35, 1.1, -0.85, "metal"], [2.4, 1.2, 0.05, -0.99, 2.2, 0.2, "pale"]],
  "classroom":     [[4, 1.2, 0.04, 0, 1.6, -0.99, "pale"], [4.2, 0.06, 0.12, 0, 0.95, -0.97, "metal"], [0.04, 1.4, 3, 0.99, 1.7, -0.1, "wood"], [2, 1.6, 0.04, 0.5, 1.8, 0.99, "trim"]],
  "apparatus-bay": [[0.12, 6.4, 0.12, -0.85, 3.2, 0.2, "metal"], [4.6, 0.3, 0.3, -0.5, 5.2, 0.99, "dark"], [4.6, 0.3, 0.3, 0.5, 5.2, 0.99, "dark"], [0.3, 0.02, 8, -0.5, 0.01, -0.2, "accent"], [0.3, 0.02, 8, 0.5, 0.01, -0.2, "accent"]],
  "clinic":        [[0.04, 0.04, 2.4, -0.6, 2.9, -0.4, "metal"], [0.04, 0.04, 2.4, 0.0, 2.9, -0.4, "metal"], [0.02, 1.8, 2.2, -0.6, 1.9, -0.4, "pale"], [1.2, 0.8, 0.05, 0.6, 1.5, -0.99, "accent"]],
  "workshop":      [[0.2, 0.3, 1, 0, 4.8, 0, "accent"], [16, 0.25, 0.25, 0, 4.9, -0.2, "metal"], [0.08, 0.02, 10, -0.2, 0.01, 0, "accent"], [0.08, 0.02, 10, 0.2, 0.01, 0, "accent"]],
  "warehouse":     [[3.2, 3.6, 0.1, -0.6, 1.8, -0.99, "metal"], [3.2, 3.6, 0.1, 0, 1.8, -0.99, "metal"], [3.2, 3.6, 0.1, 0.6, 1.8, -0.99, "metal"], [0.15, 0.02, 16, 0.85, 0.01, 0, "accent"]],
  "plant-room":    [[13, 0.25, 0.25, 0, 3.8, -0.7, "metal"], [13, 0.18, 0.18, 0, 3.4, -0.6, "accent"], [0.25, 3.6, 0.25, 0.9, 1.8, -0.7, "metal"], [1, 1.4, 0.3, -0.9, 1.4, 0.4, "dark"]],
  "kitchen":       [[10, 0.9, 0.7, 0, 0.45, -0.85, "metal"], [0.9, 2, 0.8, 0.9, 1, 0.3, "pale"], [1.6, 2.1, 0.1, -0.9, 1.05, 0.99, "metal"]],
  "transit-barn":  [[0.1, 0.06, 24, -0.55, 0.03, 0, "metal"], [0.1, 0.06, 24, -0.35, 0.03, 0, "metal"], [0.1, 0.06, 24, 0.35, 0.03, 0, "metal"], [0.1, 0.06, 24, 0.55, 0.03, 0, "metal"], [0.05, 0.05, 24, -0.45, 6.4, 0, "dark"], [0.05, 0.05, 24, 0.45, 6.4, 0, "dark"]],
  "port-shed":     [[19, 0.4, 0.4, 0, 6.2, -0.3, "accent"], [19, 0.4, 0.4, 0, 6.2, 0.3, "accent"], [0.6, 0.5, 5, 0.2, 5.9, 0, "dark"], [5, 4.5, 0.1, 0, 2.25, -0.99, "metal"]],
  "civic-lobby":   [[0.06, 1, 0.06, -0.3, 0.5, 0.2, "metal"], [0.06, 1, 0.06, 0.3, 0.5, 0.2, "metal"], [4.2, 0.05, 0.05, 0, 0.95, 0.2, "accent"], [3, 0.8, 0.05, 0, 3.2, -0.99, "pale"]],
  "rented-room":   [[1.4, 1.1, 0.05, 0.4, 1.5, -0.99, "pale"], [2.4, 0.02, 1.8, -0.1, 0.01, 0.1, "accent"]],
  "shop":          [[3, 1, 0.05, 0, 2.6, -0.99, "accent"], [2.4, 2.2, 0.05, 0.5, 1.2, 0.99, "pale"]],
};

export function ixStyleFor(kind) { return IX_KIND_STYLE[kind] ?? "civic-lobby"; }

/** The door spot of a site building: `out` metres outside CITYWORKS' door (cwDoorOf) on its face, clear of the footprint. */
export const IX_DOOR_OUT = { n: [0, -1], s: [0, 1], e: [1, 0], w: [-1, 0] };
export function ixDoorSpot(door, out = 1.4) {
  const o = IX_DOOR_OUT[door?.face] ?? [0, 1];
  return { x: door.x + o[0] * out, z: door.z + o[1] * out, face: door?.face ?? "s" };
}

/** Other consoles' furnishers per style (CLASSROOMS). */
export const IX_DRESSERS = {};
export function ixRegisterDresser(styleId, fn) { (IX_DRESSERS[styleId] ??= []).push(fn); }

/** Instance transforms for one dressing spec, in room-local metres (x across, z from back wall -d/2 to door wall +d/2). */
function ixPattern(pattern, style, prop, low) {
  const [pw, , pd] = IX_PROPS[prop];
  const { w, d } = style, out = [];
  const [kind, arg = ""] = pattern.split(":");
  const n = parseInt(arg, 10) || 1;
  if (kind === "grid" || kind === "aisles") {
    const [r, c] = arg.replace("+", "").split("x").map(Number);
    const behind = arg.endsWith("+") ? 0.7 : 0; // chairs behind desks
    const sx = (w - 5) / Math.max(1, c), sz = (d - 6) / Math.max(1, r);
    for (let i = 0; i < r; i++) for (let j = 0; j < c; j++) out.push([-w / 2 + 2.5 + sx * (j + 0.5), -d / 2 + 2.5 + sz * (i + 0.5) + behind, 0]);
  } else if (kind === "bays") {
    for (let j = 0; j < n; j++) out.push([(j - (n - 1) / 2) * (w / n), -d / 2 + pd / 2 + 2.5, 0]);
  } else if (kind === "wall") { // along the left and right walls
    for (let j = 0; j < n; j++) { const side = j % 2 ? 1 : -1, k = Math.floor(j / 2), m = Math.ceil(n / 2);
      out.push([side * (w / 2 - pd / 2 - 0.3), -d / 2 + 2 + (d - 5) * (m > 1 ? k / (m - 1) : 0.5), Math.PI / 2]); }
  } else if (kind === "back") { // along the back wall
    for (let j = 0; j < n; j++) out.push([(j - (n - 1) / 2) * Math.min(pw + 0.4, (w - 3) / n), -d / 2 + pd / 2 + 0.25, 0]);
  } else if (kind === "row") { // a row across the room's front third
    for (let j = 0; j < n; j++) out.push([(j - (n - 1) / 2) * Math.min(pw + 0.8, (w - 4) / n), d / 2 - 4.2, 0]);
  } else if (kind === "front") {
    out.push([0, -d / 2 + pd / 2 + 0.6, 0]);
  }
  return low ? out.filter((_, i) => i % 2 === 0) : out;
}

/** A canvas sign when a document exists (headless: a flat colour). */
function ixSignMaterial(THREE, lines, bg = "#101820") {
  if (typeof document === "undefined" || !document.createElement) return new THREE.MeshBasicMaterial({ color: 0x101820 });
  const c = document.createElement("canvas"); c.width = 512; c.height = 256;
  const g = c.getContext("2d"); if (!g) return new THREE.MeshBasicMaterial({ color: 0x101820 });
  g.fillStyle = bg; g.fillRect(0, 0, 512, 256); g.fillStyle = "#eaf6fb"; g.textAlign = "center";
  lines.forEach((t, i) => { g.font = i ? "22px system-ui, sans-serif" : "bold 40px system-ui, sans-serif"; g.fillText(String(t).slice(0, 44), 256, 70 + i * 44); });
  const tex = new THREE.CanvasTexture(c); if ("colorSpace" in tex) tex.colorSpace = THREE.SRGBColorSpace;
  return new THREE.MeshBasicMaterial({ map: tex });
}

/** Build one room (see the header). */
export function ixBuild(styleId, { three: THREE, tier = "high", site = null, title = null, dressers = IX_DRESSERS } = {}) {
  const style = IX_STYLES[styleId];
  if (!style || !THREE) return null;
  const low = tier === "low";
  const { w, d, h } = style;
  const group = new THREE.Group(); group.name = `ix-room-${styleId}`;
  const mat = (color, o = {}) => new THREE.MeshStandardMaterial({ color, roughness: 0.85, metalness: 0.05, ...o });
  const boxMesh = (bw, bh, bd, x, y, z, m, name) => {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(bw, bh, bd), m); mesh.position.set(x, y, z); mesh.name = name; group.add(mesh); return mesh;
  };
  // Shell: floor, ceiling, four walls (the door wall is +z), a trim band.
  boxMesh(w, 0.2, d, 0, -0.1, 0, mat(style.floor), "ix-floor");
  boxMesh(w, 0.2, d, 0, h + 0.1, 0, mat(style.ceiling), "ix-ceiling");
  const wallM = mat(style.wall), T = 0.3;
  const walls = [[w + 2 * T, h, T, 0, -d / 2 - T / 2], [w + 2 * T, h, T, 0, d / 2 + T / 2], [T, h, d, -w / 2 - T / 2, 0], [T, h, d, w / 2 + T / 2, 0]];
  const colliders = [];
  walls.forEach(([ww, hh, dd, x, z], i) => {
    boxMesh(ww, hh, dd, x, hh / 2, z, wallM, `ix-wall-${i}`);
    colliders.push({ min: [x - ww / 2, 0, z - dd / 2], max: [x + ww / 2, hh, z + dd / 2], kind: "ix-wall" });
  });
  boxMesh(w - 0.02, 0.5, d - 0.02, 0, 0.25, 0, mat(style.trim, { side: THREE.BackSide }), "ix-trim");
  // The door (exit) in the middle of the +z wall, and its lit exit sign.
  const door = { x: 0, z: d / 2 - 1.1 };
  boxMesh(1.6, 2.3, 0.1, 0, 1.15, d / 2 - 0.02, mat(0x5e4128), "ix-door");
  boxMesh(0.8, 0.25, 0.05, 0, 2.6, d / 2 - 0.05, new THREE.MeshBasicMaterial({ color: 0x2f7d4a }), "ix-exit-sign");
  // Light: one instanced run of emissive panels, a hemisphere light, and one point light off the phone tier.
  const rows = Math.max(2, Math.round(d / 5)), cols = Math.max(2, Math.round(w / 6));
  const lampGeo = new THREE.BoxGeometry(1.3, 0.05, 0.3), lampM = new THREE.MeshStandardMaterial({ color: style.lamp, emissive: style.lamp, emissiveIntensity: 1.2 });
  const lamps = new THREE.InstancedMesh(lampGeo, lampM, rows * cols); lamps.name = "ix-lamps";
  const m4 = new THREE.Matrix4();
  for (let r = 0, k = 0; r < rows; r++) for (let c = 0; c < cols; c++, k++) { m4.makeTranslation(-w / 2 + (w / cols) * (c + 0.5), h - 0.05, -d / 2 + (d / rows) * (r + 0.5)); lamps.setMatrixAt(k, m4); }
  group.add(lamps);
  group.add(new THREE.HemisphereLight(0xf2f6fa, style.floor, low ? 1.6 : 1.1));
  if (!low) { const pl = new THREE.PointLight(style.lamp, 1.2, Math.max(w, d) * 1.5, 1.5); pl.position.set(0, h - 0.6, 0); group.add(pl); }
  // Dressing: one InstancedMesh per prop type; each prop's footprint is a collider (a tall one stops the walk, a low one is stepped).
  const colour = { wood: 0x8a6a48, metal: 0x8b959c, trim: style.trim, accent: style.accent, pale: 0xe6ecef };
  for (const [prop, pattern] of style.dress) {
    const spots = ixPattern(pattern, style, prop, low);
    if (!spots.length) continue;
    const [pw, ph, pd, ck] = IX_PROPS[prop];
    const im = new THREE.InstancedMesh(new THREE.BoxGeometry(pw, ph, pd), mat(colour[ck]), spots.length); im.name = `ix-dress-${prop}`;
    const q = new THREE.Quaternion(), s = new THREE.Vector3(1, 1, 1), up = new THREE.Vector3(0, 1, 0);
    spots.forEach(([x, z, ry], i) => {
      q.setFromAxisAngle(up, ry); m4.compose(new THREE.Vector3(x, ph / 2, z), q, s); im.setMatrixAt(i, m4);
      const [hx, hz] = ry ? [pd / 2, pw / 2] : [pw / 2, pd / 2];
      colliders.push({ min: [x - hx, 0, z - hz], max: [x + hx, ph, z + hz], kind: "ix-prop", prop });
    });
    group.add(im);
  }
  // Signature fittings: one InstancedMesh (IX_FEATURES), the same on both tiers — they are what makes the kind readable.
  const feats = IX_FEATURES[styleId] ?? [];
  if (feats.length) {
    const fc = { ...colour, wall: style.wall, dark: 0x2a2f36 };
    const fm = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1, 1), new THREE.MeshStandardMaterial({ roughness: 0.7, metalness: 0.2 }), feats.length);
    fm.name = "ix-features";
    const cc = new THREE.Color(), q0 = new THREE.Quaternion();
    feats.forEach(([fw, fh, fd, fx, fy, fz, ck], i) => {
      const cx = fx * (w / 2 - 0.2), cz = fz * (d / 2 - 0.2);
      m4.compose(new THREE.Vector3(cx, fy, cz), q0, new THREE.Vector3(fw, fh, fd));
      fm.setMatrixAt(i, m4); fm.setColorAt(i, cc.setHex(fc[ck] ?? 0x888888));
      // A free-standing fitting that reaches the floor and stands taller than a step (a pole, a post) is a collider too.
      if (fy - fh / 2 < 0.3 && fh > 0.5 && Math.abs(fz) < 0.95 && Math.abs(fx) < 0.95) {
        colliders.push({ min: [cx - fw / 2, 0, cz - fd / 2], max: [cx + fw / 2, fy + fh / 2, cz + fd / 2], kind: "ix-prop", prop: "feature" });
      }
    });
    group.add(fm);
  }
  // The site's job board beside the door, and the room's honesty sign on the back wall.
  const actions = [];
  const room = {
    id: styleId, style, group, w, d, h, door, colliders, actions, site, tier,
    addAction(a) { const act = { r: 1.4, kind: "use", ...a }; actions.push(act); return act; },
    meshes() { let n = 0; group.traverse((o) => { if (o.isMesh) n++; }); return n; },
  };
  const boardX = Math.min(w / 2 - 1.2, 3);
  boxMesh(1.6, 1.1, 0.08, boardX, 1.6, d / 2 - 0.08, ixSignMaterial(THREE, [site?.name ?? style.label, "Job board — E to open"], "#c0561f"), "ix-board");
  room.addAction({ id: "board", kind: "board", x: boardX, z: d / 2 - 1.1, label: `${site?.name ?? style.label} job board` });
  boxMesh(3.6, 1.2, 0.05, 0, Math.min(h - 0.9, 2.8), -d / 2 + 0.03,
    ixSignMaterial(THREE, [(title ?? style.label).toUpperCase(), "A generic room for this kind of site —", "not a model of the real building."]), "ix-label");
  room.addAction({ id: "exit", kind: "exit", x: door.x, z: door.z, label: "Go back outside" });
  // The site's stations: one lit pad each along the door-side row (instanced), each launching its station.
  const stations = (site?.stations ?? []).slice(0, low ? 4 : 8);
  if (stations.length) {
    const pads = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.45, 0.45, 0.06, low ? 10 : 18), new THREE.MeshStandardMaterial({ color: style.accent, emissive: style.accent, emissiveIntensity: 0.6 }), stations.length);
    pads.name = "ix-station-pads";
    stations.forEach((id, i) => {
      const x = (i - (stations.length - 1) / 2) * Math.min(2.2, (w - 3) / stations.length), z = d / 2 - 3.4;
      m4.makeTranslation(x, 0.03, z); pads.setMatrixAt(i, m4);
      room.addAction({ id: `station:${id}`, kind: "station", station: id, x, z, r: 1.0, label: `Start station: ${id}` });
    });
    group.add(pads);
  }
  // Headroom for other consoles' dressers: what is left of IX_BUDGET.meshes after the shell (read it before adding meshes).
  const shellMeshes = room.meshes();
  room.budgetLeft = () => IX_BUDGET.meshes - room.meshes();
  room.shellMeshes = shellMeshes;
  for (const fn of dressers?.[styleId] ?? []) { try { fn({ three: THREE, group, room, site, tier }); } catch (e) { console.warn("ix dresser failed", e); } }
  return room;
}

/** NEWTON's avatar step against the room's colliders (flat floor, no water): the room collider keeps the learner in. */
export function ixWalk(room, pose, input, dt) {
  room._nw ??= nwWorld({ groundAt: () => 0, colliders: room.colliders });
  const st = pose._nw ?? nwAvatarState(pose.x, pose.z, room._nw);
  const next = nwAvatarStep({ ...st, x: pose.x, z: pose.z }, input, dt, room._nw);
  // Belt and braces: never outside the shell, whatever the step did.
  const x = Math.max(-room.w / 2 + 0.4, Math.min(room.w / 2 - 0.4, next.x)), z = Math.max(-room.d / 2 + 0.4, Math.min(room.d / 2 - 0.4, next.z));
  return { ...pose, x, z, _nw: { ...next, x, z } };
}

/** The nearest action within reach of a room-local pose. */
export function ixNear(room, x, z) {
  let best = null, bd = Infinity;
  for (const a of room.actions) { const dd = Math.hypot(x - a.x, z - a.z); if (dd <= a.r && dd < bd) { bd = dd; best = a; } }
  return best;
}

/** Mount the interiors layer (see the header). */
export function ixMountInteriors({ three, scene, hide = [], tier = "high", onBoard = null, onLaunch = null, onToast = null } = {}) {
  let room = null, saved = null, pose = null;
  const api = {
    get room() { return room; },
    get pose() { return pose; },
    inside: () => !!room,
    enter(site, outdoor, { style = null, title = null } = {}) {
      if (room) return room;
      const styleId = style && IX_STYLES[style] ? style : ixStyleFor(site?.kind);
      room = ixBuild(styleId, { three, tier, site, title });
      if (!room) return null;
      saved = { pose: { ...outdoor }, vis: hide.map((o) => (o ? o.visible : null)), fog: scene?.fog ?? null };
      for (const o of hide) if (o) o.visible = false;
      if (scene) { scene.fog = null; room.group.position.set(IX_ORIGIN[0], IX_ORIGIN[1], IX_ORIGIN[2]); scene.add(room.group); }
      pose = { x: room.door.x, z: room.door.z - 0.8, yaw: 0, pitch: 0 };
      onToast?.(`Inside: ${title ?? room.style.label} at ${site?.name ?? "this site"} — a generic room, not the real building. Walk to the door to leave.`);
      return room;
    },
    exit() {
      if (!room) return null;
      if (scene) scene.remove(room.group);
      room.group.traverse((o) => { if (o.isMesh) { o.geometry?.dispose?.(); for (const m of [].concat(o.material)) { m?.map?.dispose?.(); m?.dispose?.(); } } });
      hide.forEach((o, i) => { if (o && saved.vis[i] !== null) o.visible = saved.vis[i]; });
      if (scene) scene.fog = saved.fog;
      const out = saved.pose;
      room = null; pose = null; saved = null;
      return out;
    },
    walk(input, dt) { if (!room) return null; pose = ixWalk(room, pose, input, dt); return pose; },
    turn(dyaw, dpitch = 0) { if (pose) { pose.yaw += dyaw; pose.pitch = Math.max(-1.2, Math.min(1, pose.pitch + dpitch)); } },
    near() { return room && pose ? ixNear(room, pose.x, pose.z) : null; },
    use() {
      const a = api.near();
      if (!a) return null;
      if (a.kind === "exit") return { kind: "exit", pose: api.exit() };
      if (a.kind === "board") { onBoard?.(room.site); return { kind: "board" }; }
      if (a.kind === "station") { onLaunch?.(a.station, room.site); return { kind: "station", station: a.station }; }
      a.run?.(a, room); return { kind: a.kind, id: a.id };
    },
    camera(eye = 1.6) { return pose ? { x: IX_ORIGIN[0] + pose.x, y: IX_ORIGIN[1] + eye, z: IX_ORIGIN[2] + pose.z, yaw: pose.yaw, pitch: pose.pitch } : null; },
  };
  return api;
}
