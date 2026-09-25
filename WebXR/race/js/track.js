// Night Highway Circuit — the track compiler.
//
// A track is data (WebXR/race/tracks/*.js): a list of control points
// [x, z, y, bank°] that close on themselves, plus tables of zones, boost pads,
// item-box rows, hazards and scenery keyed by control-point position `u` (a
// float index: 3.5 is halfway between point 3 and point 4). This file turns
// that into what the simulation and the renderer both read: an arc-length
// resampled centreline every ~2 m with its heading, left normal, slope, bank
// and curvature, and every table converted from `u` to distance `s` along the
// lap.
//
// Pure: no three.js, no DOM. tools/check_race.mjs imports it directly.
//
// Frame (the same one shared/fleet.js uses): metres, y up. A heading `h`
// points along (sin h, cos h) in (x, z), so a vehicle built facing +Z turns to
// it with rotation.y = h. The left normal of a tangent (tx, tz) is (tz, -tx),
// and a lateral offset `d` is positive to the left. Bank is positive when the
// left edge is higher.

export const RC_DS = 2;

function rcCatmull(p0, p1, p2, p3, u) {
  // Centripetal Catmull–Rom (Barry–Goldman): no cusps or overshoot when the
  // control points are unevenly spaced, which hand-placed ones always are.
  const d = (a, b) => Math.max(1e-4, Math.hypot(b[0] - a[0], b[1] - a[1], b[2] - a[2]) ** 0.5);
  const t0 = 0, t1 = t0 + d(p0, p1), t2 = t1 + d(p1, p2), t3 = t2 + d(p2, p3);
  const t = t1 + (t2 - t1) * u;
  const mix = (a, b, ta, tb) => a.map((v, i) => ((tb - t) * v + (t - ta) * b[i]) / (tb - ta));
  const a1 = mix(p0, p1, t0, t1), a2 = mix(p1, p2, t1, t2), a3 = mix(p2, p3, t2, t3);
  const b1 = mix(a1, a2, t0, t2), b2 = mix(a2, a3, t1, t3);
  return mix(b1, b2, t1, t2);
}

export function rcWrapAngle(a) {
  while (a > Math.PI) a -= 2 * Math.PI;
  while (a < -Math.PI) a += 2 * Math.PI;
  return a;
}

/** Compile a track definition. Throws on a malformed one. */
export function rcCompileTrack(def) {
  const pts = def.points;
  if (!Array.isArray(pts) || pts.length < 4) throw new Error(`${def.id}: a track needs at least four control points`);
  const baseY = def.baseY ?? 0;
  const cps = pts.map((p) => [p[0], p[2] ?? baseY, p[1]]);          // [x, y, z]
  const banks = pts.map((p) => p[3] ?? 0);
  const m = cps.length, SUB = 40;
  const dense = [];
  const cpDense = [];
  for (let i = 0; i < m; i++) {
    cpDense.push(dense.length);
    const P0 = cps[(i - 1 + m) % m], P1 = cps[i], P2 = cps[(i + 1) % m], P3 = cps[(i + 2) % m];
    for (let k = 0; k < SUB; k++) {
      const u = k / SUB;
      const [x, y, z] = rcCatmull(P0, P1, P2, P3, u);
      const e = u * u * (3 - 2 * u);
      dense.push({ x, y, z, bank: banks[i] + (banks[(i + 1) % m] - banks[i]) * e, u: i + u });
    }
  }
  const cum = [0];
  for (let j = 1; j < dense.length; j++) {
    const a = dense[j - 1], b = dense[j];
    cum.push(cum[j - 1] + Math.hypot(b.x - a.x, b.y - a.y, b.z - a.z));
  }
  const last = dense[dense.length - 1], first = dense[0];
  const L = cum[cum.length - 1] + Math.hypot(first.x - last.x, first.y - last.y, first.z - last.z);
  const n = Math.max(16, Math.round(L / RC_DS));
  const ds = L / n;
  const x = new Float64Array(n), y = new Float64Array(n), z = new Float64Array(n);
  const bankMag = new Float64Array(n), uu = new Float64Array(n);
  let j = 0;
  for (let k = 0; k < n; k++) {
    const target = k * ds;
    while (j < dense.length - 1 && cum[j + 1] < target) j++;
    const a = dense[j], b = dense[(j + 1) % dense.length];
    const segLen = (j + 1 < dense.length ? cum[j + 1] : L) - cum[j];
    const f = segLen > 0 ? (target - cum[j]) / segLen : 0;
    x[k] = a.x + (b.x - a.x) * f; y[k] = a.y + (b.y - a.y) * f; z[k] = a.z + (b.z - a.z) * f;
    bankMag[k] = a.bank + (b.bank - a.bank) * f;
    const ub = j + 1 < dense.length ? b.u : m;
    uu[k] = a.u + (ub - a.u) * f;
  }
  const tx = new Float64Array(n), tz = new Float64Array(n), head = new Float64Array(n);
  const slope = new Float64Array(n), curv = new Float64Array(n), bank = new Float64Array(n);
  for (let k = 0; k < n; k++) {
    const p = (k - 1 + n) % n, q = (k + 1) % n;
    const dx = x[q] - x[p], dz = z[q] - z[p];
    const l = Math.hypot(dx, dz) || 1;
    tx[k] = dx / l; tz[k] = dz / l;
    head[k] = Math.atan2(tx[k], tz[k]);
    slope[k] = (y[q] - y[p]) / (2 * ds);
  }
  for (let k = 0; k < n; k++) {
    const p = (k - 1 + n) % n, q = (k + 1) % n;
    curv[k] = rcWrapAngle(head[q] - head[p]) / (2 * ds);     // + = turning left
  }
  // Bank is authored as a magnitude "into the corner"; its sign comes from the
  // curvature averaged over ±24 m so it never flips at an inflection.
  const W = Math.round(24 / ds);
  for (let k = 0; k < n; k++) {
    let c = 0;
    for (let o = -W; o <= W; o++) c += curv[(k + o + n) % n];
    bank[k] = (-Math.sign(c) || 0) * bankMag[k] * Math.PI / 180;
  }
  const cpS = cpDense.map((di) => cum[di]);
  const uToS = (u) => {
    const uw = ((u % m) + m) % m;
    const i = Math.floor(uw), f = uw - i;
    const s0 = cpS[i], s1 = i + 1 < m ? cpS[i + 1] : L;
    return s0 + (s1 - s0) * f;
  };
  const width = def.width ?? 18, half = width / 2;
  const tr = {
    def, id: def.id, name: def.name, L, n, ds, x, y, z, tx, tz, head, slope, curv, bank, u: uu, cpS,
    width, half, limit: half - (def.edgeMargin ?? 1.1), uToS,
  };
  // Tables, converted from u to s.
  tr.zones = (def.zones ?? []).map((zn) => ({ ...zn, s0: uToS(zn.from), s1: uToS(zn.to) }));
  tr.boostPads = (def.boostPads ?? []).map((b) => ({ s: uToS(b.u), d: b.d ?? 0, len: b.len ?? 7, w: b.w ?? 4 }));
  tr.boxes = [];
  for (const row of def.itemBoxes ?? []) for (const d of row.ds ?? [-6, -2, 2, 6]) tr.boxes.push({ s: uToS(row.u), d });
  tr.hazards = (def.hazards ?? []).map((hz, i) => ({
    ...hz, idx: i,
    s: hz.u !== undefined ? uToS(hz.u) : undefined,
    s0: hz.from !== undefined ? uToS(hz.from) : undefined,
    s1: hz.to !== undefined ? uToS(hz.to) : undefined,
  }));
  const g = def.grid ?? {};
  tr.grid = { back: g.back ?? 12, rows: g.rows ?? 4, cols: g.cols ?? 2, spacing: g.spacing ?? 8, gap: g.gap ?? 7 };
  // The grid zone, s in [gridS0, L) or [0, gridS1): nothing may spawn there.
  tr.gridS0 = L - tr.grid.back - (tr.grid.rows - 1) * tr.grid.spacing - 8;
  tr.gridS1 = 10;
  return tr;
}

/** Index of the sample at or before s. */
export function rcIndexAt(tr, s) {
  const sw = ((s % tr.L) + tr.L) % tr.L;
  return Math.min(tr.n - 1, Math.floor(sw / tr.ds));
}

/** The centreline frame at s, interpolated between samples. */
export function rcFrame(tr, s) {
  const sw = ((s % tr.L) + tr.L) % tr.L;
  const i = Math.min(tr.n - 1, Math.floor(sw / tr.ds));
  const k = (i + 1) % tr.n;
  const f = (sw - i * tr.ds) / tr.ds;
  const lin = (a) => a[i] + (a[k] - a[i]) * f;
  const hx = tr.tx[i] + (tr.tx[k] - tr.tx[i]) * f, hz = tr.tz[i] + (tr.tz[k] - tr.tz[i]) * f;
  const hl = Math.hypot(hx, hz) || 1;
  const txn = hx / hl, tzn = hz / hl;
  return {
    s: sw, i, x: lin(tr.x), y: lin(tr.y), z: lin(tr.z), tx: txn, tz: tzn, lx: tzn, lz: -txn,
    head: Math.atan2(txn, tzn), bank: lin(tr.bank), slope: lin(tr.slope), curv: lin(tr.curv),
  };
}

/** World position of the road surface at (s, d). */
export function rcPointAt(tr, s, d = 0) {
  const f = rcFrame(tr, s);
  const c = Math.cos(f.bank), sn = Math.sin(f.bank);
  return { x: f.x + f.lx * d * c, y: f.y + d * sn, z: f.z + f.lz * d * c, head: f.head, bank: f.bank, slope: f.slope };
}

/**
 * Project a world (x, z) onto the centreline, searching only near `hint` (a
 * sample index) so a figure-of-eight's two levels never swap at the crossing.
 * A hint of -1 searches the whole lap (spawning only).
 */
export function rcProject(tr, px, pz, hint = -1, span = 18) {
  let best = -1, bestD = Infinity;
  if (hint < 0) {
    for (let k = 0; k < tr.n; k++) {
      const dd = (tr.x[k] - px) ** 2 + (tr.z[k] - pz) ** 2;
      if (dd < bestD) { bestD = dd; best = k; }
    }
  } else {
    for (let o = -span; o <= span; o++) {
      const k = (hint + o + tr.n) % tr.n;
      const dd = (tr.x[k] - px) ** 2 + (tr.z[k] - pz) ** 2;
      if (dd < bestD) { bestD = dd; best = k; }
    }
  }
  // Refine on the segment either side of the nearest sample.
  let s = best * tr.ds, d = 0, dist2 = Infinity;
  for (const a of [(best - 1 + tr.n) % tr.n, best]) {
    const b = (a + 1) % tr.n;
    const ex = tr.x[b] - tr.x[a], ez = tr.z[b] - tr.z[a];
    const el2 = ex * ex + ez * ez || 1;
    let f = ((px - tr.x[a]) * ex + (pz - tr.z[a]) * ez) / el2;
    f = Math.max(0, Math.min(1, f));
    const cx = tr.x[a] + ex * f, cz = tr.z[a] + ez * f;
    const dd = (px - cx) ** 2 + (pz - cz) ** 2;
    if (dd < dist2) {
      dist2 = dd;
      s = (a * tr.ds + f * tr.ds) % tr.L;
      const l = Math.sqrt(el2);
      d = ((px - cx) * (ez / l) + (pz - cz) * (-ex / l)) / (Math.cos(tr.bank[a]) || 1);
    }
  }
  return { i: best, s, d, dist: Math.sqrt(dist2) };
}

/** Signed distance ahead from s0 to s1 around the lap, in (-L/2, L/2]. */
export function rcAhead(tr, s0, s1) {
  let v = (s1 - s0) % tr.L;
  if (v > tr.L / 2) v -= tr.L;
  if (v <= -tr.L / 2) v += tr.L;
  return v;
}

/** Is s inside the start-grid zone (where nothing may spawn)? */
export function rcInGrid(tr, s, margin = 0) {
  const sw = ((s % tr.L) + tr.L) % tr.L;
  return sw >= tr.gridS0 - margin || sw < tr.gridS1 + margin;
}

/**
 * The closure report: the gap between the last sample and the first against
 * the sample spacing, the largest heading change between neighbours, and the
 * tightest radius on the lap.
 */
export function rcClosure(tr) {
  const k = tr.n - 1;
  const gap = Math.hypot(tr.x[0] - tr.x[k], tr.y[0] - tr.y[k], tr.z[0] - tr.z[k]);
  let maxTurn = 0, maxCurv = 0;
  for (let i = 0; i < tr.n; i++) {
    maxTurn = Math.max(maxTurn, Math.abs(rcWrapAngle(tr.head[(i + 1) % tr.n] - tr.head[i])));
    maxCurv = Math.max(maxCurv, Math.abs(tr.curv[i]));
  }
  return { gap, ds: tr.ds, maxTurn, minRadius: maxCurv > 0 ? 1 / maxCurv : Infinity, L: tr.L };
}

/**
 * Places where the lap passes near itself: an overpass when the levels
 * differ, a flaw when they do not. Pairs are sample indices at least `apart`
 * metres apart along the lap.
 */
export function rcSelfApproaches(tr, within = null, apart = 60) {
  const lim = within ?? tr.width + 2;
  const step = Math.max(1, Math.round(4 / tr.ds));
  const out = [];
  for (let a = 0; a < tr.n; a += step) {
    for (let b = a + step; b < tr.n; b += step) {
      const along = Math.min(Math.abs(a - b), tr.n - Math.abs(a - b)) * tr.ds;
      if (along < apart) continue;
      const dxz = Math.hypot(tr.x[a] - tr.x[b], tr.z[a] - tr.z[b]);
      if (dxz < lim) out.push({ a, b, dxz, dy: Math.abs(tr.y[a] - tr.y[b]) });
    }
  }
  return out;
}
