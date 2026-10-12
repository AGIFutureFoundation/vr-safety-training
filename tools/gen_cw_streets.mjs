#!/usr/bin/env node
/**
 * CITYWORKS (docs/consoles/CITYWORKS.md): generate WebXR/shared/cw-streets-<parish>.js for the five New Orleans parishes
 * from the Trade Craft Academy artifact's street fabric — AUTHORED procedural polylines (NOT the real street grid) in
 * local metres [east_m, north_m] around each file's frame origin, classes arterial / collector / local.
 *
 *   node tools/gen_cw_streets.mjs [--src <dir with <fips>.json>]
 *
 * Every parish takes all five files (the fabric runs on across parish lines), projected local metres → lon/lat (a sphere
 * at the frame origin) → the parish field (np-geo.js npGeoToXz); clipped to the field; split wherever the street or a
 * sidewalk edge stands on water (any body, wetland included), on a levee or in a site pad; simplified; locals thinned to
 * CW_BUDGET.chunkLocalMetres per chunk; and every piece whose road-graph component touches no named road dropped.
 * Deterministic: the same inputs write the same bytes.
 */
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const SHARED = join(ROOT, "WebXR", "shared");
const SP = "/tmp/claude-0/-home-user-vr-safety-training/a03145a7-edb6-5a38-ad6a-02d8825a11f7/scratchpad";
const argv = process.argv.slice(2);
const SRC = argv.includes("--src") ? argv[argv.indexOf("--src") + 1] : join(SP, "packs/tcacademy/parishes/maps/streets");
const FIPS = { "22071": "orleans", "22051": "jefferson", "22087": "st-bernard", "22075": "plaquemines", "22103": "st-tammany" };
const EXPORT = (id) => `CW_STREETS_${id.toUpperCase().replace(/-/g, "_")}`;

// Stub any missing module so cw-cityworks.js imports cleanly while generating.
for (const id of Object.values(FIPS)) {
  const f = join(SHARED, `cw-streets-${id}.js`);
  if (!existsSync(f)) writeFileSync(f, `export const ${EXPORT(id)} = { parish: "${id}", streets: [] };\n`);
}
const G = await import(pathToFileURL(join(SHARED, "np-geo.js")));
const E = await import(pathToFileURL(join(SHARED, "np-parish.js")));
const R = await import(pathToFileURL(join(SHARED, "np-parishes.js")));
const C = await import(pathToFileURL(join(SHARED, "cw-cityworks.js")));

const files = Object.keys(FIPS).map((fips) => {
  const j = JSON.parse(readFileSync(join(SRC, `${fips}.json`), "utf8"));
  if (j.provenance !== "AUTHORED") throw new Error(`${fips}: provenance is ${j.provenance}, expected AUTHORED`);
  const o = typeof j.frame_origin === "string" ? JSON.parse(j.frame_origin) : j.frame_origin;
  const classes = typeof j.classes === "string" ? JSON.parse(j.classes) : j.classes;
  const widths = typeof j.widths_m === "string" ? JSON.parse(j.widths_m) : j.widths_m;
  return { fips, stamp: j.source_stamp, origin: o, classes, widths };
});

function simplify(pts, tol) {
  if (pts.length < 3) return pts;
  const keep = new Uint8Array(pts.length); keep[0] = keep[pts.length - 1] = 1;
  const stack = [[0, pts.length - 1]];
  while (stack.length) {
    const [i, j] = stack.pop();
    let best = -1, bd = tol;
    for (let k = i + 1; k < j; k++) { const d = C.cwSegDist(pts[k][0], pts[k][1], pts[i], pts[j]).d; if (d > bd) { bd = d; best = k; } }
    if (best >= 0) { keep[best] = 1; stack.push([i, best], [best, j]); }
  }
  return pts.filter((_, k) => keep[k]);
}
const len = (pts) => pts.reduce((s, p, i) => (i ? s + Math.hypot(p[0] - pts[i - 1][0], p[1] - pts[i - 1][1]) : 0), 0);

function generate(parish) {
  const half = (parish.size ?? E.NP_SIZE) / 2 - 8;
  const sites = parish.sites ?? [];
  const bad = (x, z) => Math.abs(x) > half || Math.abs(z) > half || E.npWaterAt(parish, x, z) || E.npLeveeRise(parish, x, z) > 0.3
    || sites.some((s) => Math.hypot(x - s.position[0], z - s.position[1]) < E.NP_PAD + 6);
  const raw = [];
  for (const f of files) {
    const mLon = G.npMetresPerDegLon(f.origin.lat);
    for (const cls of ["arterial", "collector", "local"]) {
      const c = C.CW_CLASSES[cls];
      const reach = c.width / 2 + (c.sidewalk ? C.CW_KERB + C.CW_SIDEWALK : 0.5);
      for (const line of f.classes[cls] ?? []) {
        const xz = line.map(([e, n]) => G.npGeoToXz(parish, [f.origin.lng + e / mLon, f.origin.lat + n / G.NP_M_PER_DEG_LAT]));
        // densify to ≤ 6 m, test the centre and both outer edges, split into dry runs
        let run = [];
        const flush = () => { if (run.length >= 2) raw.push({ cls, pts: run }); run = []; };
        for (let i = 1; i < xz.length; i++) {
          const a = xz[i - 1], b = xz[i], L = Math.hypot(b[0] - a[0], b[1] - a[1]);
          if (L > 20000) { flush(); continue; }
          const n = Math.max(1, Math.ceil(L / 6)), nx = -(b[1] - a[1]) / (L || 1), nz = (b[0] - a[0]) / (L || 1);
          for (let k = i === 1 ? 0 : 1; k <= n; k++) {
            const x = a[0] + ((b[0] - a[0]) * k) / n, z = a[1] + ((b[1] - a[1]) * k) / n;
            if (bad(x, z) || bad(x + nx * reach, z + nz * reach) || bad(x - nx * reach, z - nz * reach)) { flush(); continue; }
            run.push([x, z]);
          }
        }
        flush();
      }
    }
  }
  let pieces = raw.map((p) => ({ cls: p.cls, pts: simplify(p.pts, 1).map(([x, z]) => [Math.round(x * 10) / 10, Math.round(z * 10) / 10]) }))
    .filter((p) => len(p.pts) >= (p.cls === "local" ? 40 : 30));
  // Thin locals: per chunk (by the piece's midpoint), keep the longest until the chunk's local length budget is spent.
  const budget = new Map();
  const locals = pieces.filter((p) => p.cls === "local").map((p) => ({ p, L: len(p.pts), key: E.npChunkOf(...p.pts[Math.floor(p.pts.length / 2)]).key }));
  locals.sort((a, b) => b.L - a.L || a.p.pts[0][0] - b.p.pts[0][0] || a.p.pts[0][1] - b.p.pts[0][1]);
  const keepLocal = new Set();
  for (const l of locals) { const used = budget.get(l.key) ?? 0; if (used + l.L <= C.CW_BUDGET.chunkLocalMetres) { budget.set(l.key, used + l.L); keepLocal.add(l.p); } }
  pieces = pieces.filter((p) => p.cls !== "local" || keepLocal.has(p));
  // Drop islands: keep only pieces whose component touches a named road.
  const named = (parish.roads ?? []).filter((r) => E.NP_ROAD_KINDS[r.kind] && r.pts?.length >= 2).map((r) => ({ id: r.id, cls: r.kind, width: E.NP_ROAD_KINDS[r.kind].width, pts: r.pts, named: true }));
  const streets = pieces.map((p, i) => ({ id: `cw-${p.cls[0]}${i}`, cls: p.cls, width: C.CW_CLASSES[p.cls].width, pts: p.pts }));
  const graph = C.cwBuildGraph([...named, ...streets]);
  const comp = C.cwComponents(graph);
  const namedComp = new Set(graph.edges.filter((e) => named.some((n) => n.id === e.line)).map((e) => comp.of[e.a]));
  const keepIds = new Set(graph.edges.filter((e) => namedComp.has(comp.of[e.a])).map((e) => e.line));
  const kept = streets.filter((s) => keepIds.has(s.id));
  // Stable ids after the drop.
  const counters = { arterial: 0, collector: 0, local: 0 };
  return { kept: kept.map((s) => ({ id: `cw-${s.cls}-${++counters[s.cls]}`, cls: s.cls, pts: s.pts })), counters, raw: raw.length, dropped: streets.length - kept.length };
}

for (const [fips, id] of Object.entries(FIPS)) {
  const parish = R.npParish(id);
  const { kept, counters, raw, dropped } = generate(parish);
  const src = files.find((f) => f.fips === fips);
  const vertices = kept.reduce((s, k) => s + k.pts.length, 0);
  const body = kept.map((s) => `    { id: ${JSON.stringify(s.id)}, cls: ${JSON.stringify(s.cls)}, pts: ${JSON.stringify(s.pts)} },`).join("\n");
  const out = `// GENERATED by tools/gen_cw_streets.mjs — do not edit (CITYWORKS, docs/consoles/CITYWORKS.md).
// ${parish.name}: AUTHORED procedural street fabric, NOT the real street grid. Source: the Trade Craft Academy artifact's
// street polylines (pack "parishes", files ${Object.keys(FIPS).join(", ")}, source_stamp ${src.stamp}), local metres
// projected into this parish's field through np-geo.js, clipped to the field, cut off water, levees and site pads,
// locals thinned to the per-chunk budget, islands dropped. The parish's own named roads are unchanged.
export const ${EXPORT(id)} = {
  parish: ${JSON.stringify(id)},
  provenance: "AUTHORED procedural street fabric (Trade Craft Academy artifact) — not the real street grid",
  fips: ${JSON.stringify(fips)},
  sourceStamp: ${JSON.stringify(src.stamp)},
  sourceWidthsM: ${JSON.stringify(src.widths)},
  drawnWidthsM: ${JSON.stringify(Object.fromEntries(Object.entries(C.CW_CLASSES).map(([k, v]) => [k, v.width])))},
  counts: ${JSON.stringify(counters)},
  vertices: ${vertices},
  streets: [
${body}
  ],
};
`;
  writeFileSync(join(SHARED, `cw-streets-${id}.js`), out);
  console.log(`${id}: ${raw} dry runs → ${kept.length} streets (${JSON.stringify(counters)}), ${vertices} vertices, ${dropped} island pieces dropped, ${(out.length / 1024).toFixed(0)} KB`);
}
