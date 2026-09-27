// The Deep — the four scored activities: a kelp transect time trial, a wreck
// photo survey, a debris sweep and a marsh-mouth drift. Not dives in the
// engine's sense (they carry their own scoring), so dives.js exposes their
// definitions as DV_ACTIVITIES and this module runs them. Pure and
// storage-injectable: tools/check_underwater_game.mjs starts, steps and
// scores every one of them headlessly. No violence, no gambling: every score
// is a time, a count or a fraction of a run held, kept the way a leaderboard is.
import { DV_LINES, DV_LANDMARKS, DV_SITES } from "./seabed.js";

const DV_ACTIVITY_KEY = "underwater-activities-v1";

/** A small deterministic PRNG (mulberry32) of this module's own, so the
 *  debris scatter never depends on which seabed module is bundled. */
function dvActRng(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
export const DV_ACTIVITY_REACH = 5; // metres to a checkpoint, viewpoint or item

function dvActStorage(storage) {
  if (storage) return storage;
  try { return globalThis.localStorage ?? null; } catch (_) { return null; }
}
function dvLoadBest(storage) {
  try { const raw = JSON.parse(dvActStorage(storage)?.getItem(DV_ACTIVITY_KEY) || "null"); return raw && typeof raw === "object" ? raw : {}; } catch (_) { return {}; }
}

/** A point at fraction `t` (0..1) along a polyline. */
function dvAlong(points, t) {
  let total = 0;
  const segs = [];
  for (let i = 1; i < points.length; i++) { const len = Math.hypot(points[i][0] - points[i - 1][0], points[i][1] - points[i - 1][1]); segs.push(len); total += len; }
  let d = t * total;
  for (let i = 0; i < segs.length; i++) {
    if (d <= segs[i] || i === segs.length - 1) {
      const k = segs[i] ? Math.min(1, d / segs[i]) : 0;
      return [points[i][0] + (points[i + 1][0] - points[i][0]) * k, points[i][1] + (points[i + 1][1] - points[i][1]) * k];
    }
    d -= segs[i];
  }
  return points[0];
}

function dvPlacePoint(name, lists) {
  for (const list of lists) { const hit = list.find((p) => p.id === name || p.name === name); if (hit) return [hit.position[0], hit.position[2]]; }
  return null;
}

/**
 * Starts an activity from its definition (dives-data.js's DV_ACTIVITIES
 * shape): resolves its markers against the seabed's own lines, landmarks and
 * sites and returns a fresh state `{ id, kind, markers, hit, elapsed, done,
 * score }`. Deterministic: the same definition always lays the same markers.
 */
export function dvStartActivity(def, { lines = DV_LINES, landmarks = DV_LANDMARKS, sites = DV_SITES } = {}) {
  const base = { id: def.id, kind: def.kind, title: def.title, elapsed: 0, done: false, score: 0, hit: [], summary: "" };
  if (def.kind === "time-trial") {
    const line = lines.find((l) => l.id === def.line || l.name === def.line);
    if (!line) throw new Error(`activity ${def.id}: no dive line "${def.line}"`);
    const n = def.scoring?.checkpoints ?? 5;
    const markers = Array.from({ length: n }, (_, i) => ({ id: `cp-${i + 1}`, point: dvAlong(line.points, (i + 1) / n), kind: "checkpoint" }));
    return { ...base, markers, next: 0 };
  }
  if (def.kind === "photo") {
    const c = dvPlacePoint(def.landmark ?? def.site, [landmarks, sites]);
    if (!c) throw new Error(`activity ${def.id}: no place "${def.landmark ?? def.site}"`);
    const n = def.scoring?.viewpointsToFrame ?? 6, r = 12;
    const markers = Array.from({ length: n }, (_, i) => ({ id: `view-${i + 1}`, point: [c[0] + Math.cos((i / n) * Math.PI * 2) * r, c[1] + Math.sin((i / n) * Math.PI * 2) * r], kind: "viewpoint" }));
    return { ...base, markers };
  }
  if (def.kind === "sweep") {
    const c = dvPlacePoint(def.site, [sites, landmarks]);
    if (!c) throw new Error(`activity ${def.id}: no site "${def.site}"`);
    const rng = dvActRng(Math.round(c[0] * 7 + c[1] * 13) >>> 0);
    const n = def.scoring?.items ?? 8, hazardous = def.scoring?.hazardousItems ?? 2;
    const markers = Array.from({ length: n }, (_, i) => {
      const ang = rng() * Math.PI * 2, r = 8 + rng() * 30;
      return { id: `item-${i + 1}`, point: [c[0] + Math.cos(ang) * r, c[1] + Math.sin(ang) * r], kind: i < hazardous ? "hazardous" : "debris" };
    });
    return { ...base, markers, limit: def.scoring?.seconds ?? 180 };
  }
  if (def.kind === "drift") {
    const line = lines.find((l) => l.id === def.line || l.name === def.line);
    if (!line) throw new Error(`activity ${def.id}: no dive line "${def.line}"`);
    const corridor = def.scoring?.corridorHalfWidth ?? 8;
    return { ...base, markers: [], corridor: line.points, corridorHalfWidth: corridor, limit: def.scoring?.seconds ?? 90, held: 0 };
  }
  throw new Error(`activity ${def.id}: unknown kind "${def.kind}"`);
}

function dvDistToPolyline(x, z, points) {
  let best = Infinity;
  for (let i = 1; i < points.length; i++) {
    const [ax, az] = points[i - 1], [bx, bz] = points[i];
    const abx = bx - ax, abz = bz - az, l2 = abx * abx + abz * abz;
    const t = l2 > 0 ? Math.max(0, Math.min(1, ((x - ax) * abx + (z - az) * abz) / l2)) : 0;
    best = Math.min(best, Math.hypot(x - (ax + abx * t), z - (az + abz * t)));
  }
  return best;
}

/**
 * One step of an activity against `{ player: { x, z }, interact }`. Returns a
 * new state; `done` and `score` are set when the run ends. Time trials end at
 * the last checkpoint (score: seconds, lower is better); a photo survey ends
 * when every viewpoint is framed (score: viewpoints, non-competitive); a
 * sweep ends at its time limit or when every item is handled (score: debris
 * collected plus hazardous items flagged, never collected); a drift ends at
 * its time limit (score: the fraction of the run held inside the corridor).
 */
export function dvStepActivity(state, snapshot, dt) {
  if (state.done) return state;
  const s = { ...state, elapsed: state.elapsed + dt, hit: [...state.hit] };
  const { x, z } = snapshot.player ?? { x: 0, z: 0 };
  const near = (m) => Math.hypot(x - m.point[0], z - m.point[1]) <= DV_ACTIVITY_REACH;
  if (s.kind === "time-trial") {
    const m = s.markers[s.next];
    if (m && near(m)) { s.hit.push(m.id); s.next += 1; }
    if (s.next >= s.markers.length) { s.done = true; s.score = Math.round(s.elapsed * 10) / 10; s.summary = "transect run"; }
  } else if (s.kind === "photo") {
    if (snapshot.interact) for (const m of s.markers) if (!s.hit.includes(m.id) && near(m)) { s.hit.push(m.id); break; }
    if (s.hit.length >= s.markers.length) { s.done = true; s.score = s.hit.length; s.summary = "every viewpoint framed"; }
  } else if (s.kind === "sweep") {
    if (snapshot.interact) for (const m of s.markers) if (!s.hit.includes(m.id) && near(m)) { s.hit.push(m.id); break; }
    const handled = s.hit.length;
    if (s.elapsed >= s.limit || handled >= s.markers.length) {
      s.done = true;
      const collected = s.hit.filter((id) => s.markers.find((m) => m.id === id)?.kind === "debris").length;
      const flagged = s.hit.length - collected;
      s.score = collected + flagged * 2;
      s.summary = `${collected} collected, ${flagged} flagged for the work plan`;
    }
  } else if (s.kind === "drift") {
    const inside = dvDistToPolyline(x, z, s.corridor) <= s.corridorHalfWidth;
    s.held = (s.held ?? 0) + (inside ? dt : 0);
    if (s.elapsed >= s.limit) { s.done = true; s.score = Math.round((s.held / s.limit) * 100) / 100; s.summary = "corridor held"; }
  }
  return s;
}

/** Records a finished run's score; returns `{ best, isNewBest }`. Lower is
 *  better for a time trial, higher for everything else. */
export function dvRecordActivityScore(id, kind, score, storage) {
  const all = dvLoadBest(storage);
  const prev = all[id];
  const better = prev == null || (kind === "time-trial" ? score < prev : score > prev);
  if (better) all[id] = score;
  try { dvActStorage(storage)?.setItem(DV_ACTIVITY_KEY, JSON.stringify(all)); } catch (_) { /* private mode */ }
  return { best: all[id], isNewBest: better };
}

export function dvBestActivityScore(id, storage) { return dvLoadBest(storage)[id] ?? null; }
