import { box, group, mat } from "../../shared/kit.js";
import { holoTag } from "./citykit.js";
import { FLEET_BUDGET, FLEET_BUILDERS } from "../../shared/fleet.js";
import { EQUIPMENT_BUDGET, EQUIPMENT_BUILDERS } from "../../shared/equipment.js";
import { TOOLKIT_BUDGET, TOOLKIT_BUILDERS } from "../../shared/toolkit.js";

// The kit gallery: `?gallery=fleet|equipment|toolkit` lays every builder of
// one shared kit out on the plaza with a label naming it and the mesh count it
// actually cost in this browser, for screenshots and for the retrofit teams to
// see what they are getting. Vehicles and plant face +Z (toward the spawn) in
// rows, shortest at the front; tools lie on a bench. Nothing here is a
// station: there are no steps and nothing is clickable.

export const GALLERY_KINDS = {
  fleet: { table: FLEET_BUDGET, builders: FLEET_BUILDERS },
  equipment: { table: EQUIPMENT_BUDGET, builders: EQUIPMENT_BUILDERS },
  toolkit: { table: TOOLKIT_BUDGET, builders: TOOLKIT_BUILDERS },
};

function meshCount(g) {
  let n = 0;
  g.traverse((o) => { if (o.isMesh || o.isPoints || o.isLine) n += 1; });
  return n;
}

/**
 * Build one kit's gallery under `root`. Returns the placed items (key,
 * group, centre, footprint, measured and declared meshes) and an overview
 * eye/target pair the app points the camera along.
 */
export function buildGallery(root, kind) {
  const spec = GALLERY_KINDS[kind];
  if (!spec) return null;
  const entries = Object.entries(spec.table);
  const items = [];
  const g = group(root);
  // Ground past the plaza's edge, so a 20 m rig in the back row is not parked on the void.
  box(g, 160, 0.02, 160, 0, -0.02, 0, 0x5b6167, { rough: 0.95, finish: "concrete", tile: 40 });

  if (kind === "toolkit") {
    // Tools on a bench, packed in rows by their own footprints.
    const top = 0.9, gap = 0.2, maxRow = 2.8;
    const rows = [];
    let row = [], w = 0;
    for (const it of entries) {
      const fw = it[1].footprint[0];
      if (row.length && w + fw + gap > maxRow) { rows.push(row); row = []; w = 0; }
      row.push(it); w += fw + gap;
    }
    if (row.length) rows.push(row);
    const depthOf = (r) => Math.max(...r.map(([, e]) => e.footprint[2])) + 0.16;
    const benchD = rows.reduce((d, r) => d + depthOf(r), 0) + gap * (rows.length - 1) + 0.2;
    const benchW = maxRow + 0.4;
    box(g, benchW, 0.05, benchD, 0, top - 0.025, 0, 0x6d5a44, { rough: 0.8, finish: "painted" });
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) box(g, 0.06, top - 0.05, 0.06, sx * (benchW / 2 - 0.1), (top - 0.05) / 2, sz * (benchD / 2 - 0.1), 0x2b3138, { rough: 0.6, metal: 0.5 });
    let front = benchD / 2 - 0.1;
    for (const r of rows) {
      const width = r.reduce((sum, [, e]) => sum + e.footprint[0], 0) + gap * (r.length - 1);
      const depth = depthOf(r);
      let x = -width / 2;
      for (const [key, e] of r) {
        const [fw, fh, fl] = e.footprint;
        const cx = x + fw / 2, cz = front - 0.14 - (depth - 0.16) / 2;
        const fn = spec.builders[e.build];
        const item = fn(g, cx, top, cz, { ...(e.opts ?? {}) });
        const label = holoTag(g, `${key} · ${meshCount(item)}`, cx, top + 0.004, front - 0.05, { w: Math.max(0.3, fw), h: 0.05 });
        label.rotation.x = -Math.PI / 2;
        items.push({ key, group: item, label, centre: [cx, top + fh / 2, cz], footprint: e.footprint, meshes: meshCount(item), declared: e.meshes });
        x += fw + gap;
      }
      front -= depth + gap;
    }
    return { root: g, items, overview: { eye: [0, top + 1.9, benchD / 2 + 1.2], target: [0, top, 0] } };
  }

  // Rows across X, shortest vehicles at the front so the long ones behind still show.
  const sorted = entries.slice().sort((a, b) => a[1].footprint[2] - b[1].footprint[2]);
  const gap = kind === "fleet" ? 1.8 : 2.2, maxRow = 30;
  const rows = [];
  let row = [], w = 0;
  for (const it of sorted) {
    const fw = it[1].footprint[0];
    if (row.length && w + fw + gap > maxRow) { rows.push(row); row = []; w = 0; }
    row.push(it); w += fw + gap;
  }
  if (row.length) rows.push(row);
  let front = 9;
  for (const r of rows) {
    const width = r.reduce((s, [, e]) => s + e.footprint[0], 0) + gap * (r.length - 1);
    let x = -width / 2;
    const depth = Math.max(...r.map(([, e]) => e.footprint[2]));
    for (const [key, e] of r) {
      const [fw, fh, fl] = e.footprint;
      const cx = x + fw / 2, cz = front - fl / 2;
      const fn = spec.builders[e.build];
      const item = fn(g, cx, 0, cz, { ...(e.opts ?? {}) });
      const label = holoTag(g, `${key} · ${meshCount(item)}`, cx, fh + 0.45, front + 0.2, { w: Math.max(1.6, Math.min(2.8, fw * 0.95)), h: 0.3 });
      items.push({ key, group: item, label, centre: [cx, fh / 2, cz], footprint: e.footprint, meshes: meshCount(item), declared: e.meshes });
      x += fw + gap;
    }
    front -= depth + gap * 1.6;
  }
  void mat;
  return { root: g, items, overview: { eye: [0, 16, 26], target: [0, 0, front / 2 + 2] } };
}
