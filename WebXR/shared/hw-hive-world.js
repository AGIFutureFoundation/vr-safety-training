// HIVE-IN-WORLD — the Omega Hive's agents in person (console `hw`, docs/consoles/HIVE-IN-WORLD.md).
// SmartCiti.X Holodeck · Powered by AGI Corp.
//
// This module only joins other consoles' pieces:
//   - OMEGA-HIVE's hive (ohHive: `agents`, `on(type, fn)`) and AGENT-AVATARS' figures (aaMountAgentAvatars);
//   - ROBO-INTERIORS' rooms (the ixr-* styles on INTERIORS' shell, room.spots.agent, ixrAgentSpot) and ROBO-EXTERIORS'
//     building doors (fxDoorFor).
// 1. Agents inside the robotics rooms: on entering an ixr-* room, each hive agent whose homeSite is that robot site stands at
//    ixrAgentSpot(room, agent) (a free spot when two agents would share one), its figure in room.group facing the spot's yaw,
//    and the hive's speak captions show over it: the same figure, talk light and caption bubble as outdoors. The phone tier
//    builds no figures (AGENT-AVATARS' rule); the balanced tier draws the label and caption canvases at half size so the room
//    stays inside IXR_TEX_BUDGET; IX_BUDGET's meshes and triangles hold with the figures in.
// 2. One door: a robot site's room opens from its exterior building's door: fxDoorFor(parish, siteId).out, the spot 1.4 m
//    outside the door on the pad side, becomes the room's door spot.
// 3. Return into the room: a station launched from a robotics room carries the room's style in its return link
//    (`#site=<parish>/<site>&ixr=<style>`); on arrival the page re-enters that room.
// Agents are software and say so (AGENT-AVATARS' label, hologram tint and no face come with the figure). No network, no voice,
// no microphone, no model call: this module positions figures and reads URLs.
//
// SEAMS (every top-level name carries the hw/HW_ prefix: the bundler shares one scope; three.js comes from the caller):
//   HW_ROOM_TEXTURE_SCALE              { high: 1, balanced: 0.5, low: 0 }: label and caption canvas scale in a room (low: no figures)
//   hwFigureYaw(spotYaw)               -> the figure's rotation.y. A spot's yaw is the learner's (0 faces the back wall, +π/2
//                                         faces −x); crew.js's figure faces +z at rotation 0, so it turns by π to face that way.
//   hwIsRobotRoom(room)                -> true for an ixr-* room
//   hwRoomSiteId(room)                 -> the robot site id the room was entered for (room.site.id), or null
//   hwRoomAgents(room, agents)         -> [{ agent, spot }]: the agents homed at that site, each on its role's spot, else a free one
//   hwMountRoomAgents({ three, room, agents, source, tier, reducedMotion, mount })
//                                      -> { room, siteId, placed, avatars, animate(t, dt), counts(), dispose() } | null
//   hwSyncRoom(current, { room, three, agents, source, tier, reducedMotion, mount })
//                                      -> the mount for the room open now: kept while the room stays, disposed on exit,
//                                         re-mounted on a change (call it every frame and right after an enter). HIVE-5: the
//                                         hive operations room (hd4-hive-ops) gets h5-ops-room.js's mount (all seven agents at
//                                         their consoles, walking out to jobs and back, the screens painted from the hive)
//   hwFxDoorAt(fxDoor)                 -> { x, z, face } for ixrDoorsFor's doorAt (the door's outside spot), or null
//   hwReturnHash(style)                -> "ixr=<style>" for a robotics room (appended to a station link's return), else ""
//   hwRoomFromHash(hash, search?)      -> the ixr style a return asks to re-enter, or null
// 4. Walks round buildings: the agents' outdoor walks (AGENT-AVATARS' walk-ins) follow a route round the page's collider boxes
//    (CITYWORKS' buildings or NEWTON's massing fallback, parked vehicles, the robotics buildings), and a standing slot inside a
//    box is skipped:
//   hwBoxesIn(colliders, parish, x0, z0, x1, z1, { size, chunk, pad }) -> the boxes overlapping the rectangle (a box is filed
//                                         under its centre's chunk, so the chunks within `pad` m are read; cached per chunk)
//   hwSegBox(a, b, box)                -> true when the segment a–b passes through the box { x0, z0, x1, z1 }
//   hwRouter(boxesIn, { radius, margin, step, reach }) -> { route(from, to), blocked(x, z) }: route returns waypoints ending at
//                                         `to` (straight when the line is clear, else an A* path on a `step` grid round the boxes
//                                         grown by radius + margin, pulled tight), or null when no path exists

import { aaMountAgentAvatars } from "./aa-agent-avatars.js";
import { ixrAgentSpot, IXR_ROOMS } from "./ixr-robo-interiors.js";
import { h3RoomPresence, H3_ROOM_FIGURES } from "./h3-hive-day.js";
import { h5IsOpsRoom, h5MountOpsRoom } from "./h5-ops-room.js";

export const HW_ROOM_TEXTURE_SCALE = Object.freeze({ high: 1, balanced: 0.5, low: 0 });

export function hwFigureYaw(spotYaw) { return (Number(spotYaw) || 0) + Math.PI; }

export function hwIsRobotRoom(room) { return !!(room && IXR_ROOMS[room.id]); }

export function hwRoomSiteId(room) { return hwIsRobotRoom(room) ? room.site?.id ?? null : null; }

/** The hive agents homed at the room's robot site, each on its role's spot (ixrAgentSpot), else the first free spot. */
export function hwRoomAgents(room, agents = []) {
  const siteId = hwRoomSiteId(room);
  if (!siteId) return [];
  const spots = room.spots?.agent ?? [];
  const used = new Set();
  const out = [];
  for (const a of agents ?? []) {
    if (!a?.id || a.homeSite !== siteId) continue;
    let spot = ixrAgentSpot(room, a);
    if (!spot || used.has(spot.id)) spot = spots.find((s) => !used.has(s.id)) ?? null;
    if (!spot) continue; // more agents than spots: the rest stay outside (no room has more agents than spots today)
    used.add(spot.id);
    out.push({ agent: a, spot });
  }
  return out;
}

/** Stand the room's agents at their spots, listening to the hive for captions (see the header).
 * HIVE-3: who is in the room follows the hive (h3RoomPresence): an agent the hive sends to this site for a job comes in
 * through the door to a free agent spot (its role's first), else a place by the door, and walks out through the door when the
 * job ends or the hive sends it elsewhere; an agent homed here leaves the same way while a job holds it elsewhere and comes
 * back when that job ends. At most H3_ROOM_FIGURES figures are in the room at once (a further agent waits outside until a
 * figure has gone), and a figure that has walked out is released (its meshes and canvases disposed), so the room stays inside
 * IX_BUDGET and IXR_TEX_BUDGET. Reduced motion: figures appear and go without walking. The hive's move events never reach the
 * figures directly: the mount turns them into walks between the room's own places. */
export function hwMountRoomAgents({ three = null, room = null, agents = [], source = null, tier = "high", reducedMotion = false, mount = aaMountAgentAvatars } = {}) {
  const siteId = hwRoomSiteId(room);
  if (!siteId || !room.group || typeof mount !== "function") return null;
  const roster = (agents ?? []).filter((a) => a?.id);
  const byId = new Map(roster.map((a) => [a.id, a]));
  const spots = room.spots?.agent ?? [];
  const scale = HW_ROOM_TEXTURE_SCALE[tier] ?? 1;
  const door = room.door && Number.isFinite(+room.door.x) && Number.isFinite(+room.door.z) ? room.door : { x: 0, z: (Number(room.d) || 10) / 2 - 1.1 };
  // The room's places as pseudo-sites for the avatar mount: each agent spot, H3_ROOM_FIGURES places by the door (inside it,
  // facing into the room) and the doorway itself (facing out: where a figure is released).
  const P = "hw-room:";
  const place = new Map();
  for (const s of spots) place.set(`${P}spot:${s.id}`, { x: s.x, y: 0, z: s.z, yaw: hwFigureYaw(s.yaw), spot: s });
  for (let k = 0; k < H3_ROOM_FIGURES; k += 1) {
    const s = { id: `door-${k}`, name: "inside the door", x: door.x + (k % 2 ? -1 : 1) * (1.2 + 0.9 * Math.floor(k / 2)), z: door.z - 1.5, yaw: 0 };
    place.set(`${P}door:${k}`, { x: s.x, y: 0, z: s.z, yaw: hwFigureYaw(s.yaw), spot: s });
  }
  place.set(`${P}exit`, { x: door.x, y: 0, z: door.z, yaw: 0 });
  const relay = source && typeof source.on === "function" ? { // everything but the hive's own moves (the room has its own)
    on: (type, fn) => { if (type !== "move") source.on(type, fn); },
    off: (type, fn) => { if (type !== "move") source.off?.(type, fn); },
    // MOODS (loop 10 round 9): the source's current mood passes through (the hive's mood(id), or a scene relay's released mood), so a
    // figure built mid-day or mid-scene seeds its posture from it (aa-agent-avatars' aaMoodOf); without one the figures start calm as before
    ...(typeof source.mood === "function" ? { mood: (id) => source.mood(id) } : typeof source.hive?.mood === "function" ? { mood: (id) => source.hive.mood(id) } : {}),
  } : null;
  const avatars = roster.length ? mount({
    three, parent: room.group, agents: roster, source: relay, tier, reducedMotion,
    siteAt: (id) => (place.has(id) ? { x: 0, y: 0, z: 0 } : null), // a real site id is off this room: its figure waits unbuilt
    spotFor: (_a, id) => { const q = place.get(id); return q ? { x: q.x, y: 0, z: q.z, yaw: q.yaw } : null; },
    textureScale: scale > 0 ? scale : 1,
  }) : null;
  const presence = h3RoomPresence({ agents: roster, source });
  const holder = new Map(); // place id -> agent id
  const where = new Map(); // agent id -> { id: place id, spot }
  const placed = []; // live: [{ agent, spot }] for the agents standing (or walking to their place) in the room
  const leaving = new Set(); // agents walking out (their figures still exist until released)
  const waiting = []; // agents here by the hive with no room left: they come in when a figure has gone
  const log = []; // { t, agent, what: "in" | "out" | "wait" | "promote", place }
  const homeOf = (id) => byId.get(id)?.homeSite ?? null;
  const tNow = () => avatars?.clock?.() ?? 0;
  function freePlace(a) {
    if (where.size + leaving.size >= H3_ROOM_FIGURES) return null; // the room's figure budget
    const role = ixrAgentSpot(room, a);
    const order = [...(role ? [role] : []), ...spots.filter((s) => s !== role)];
    for (const s of order) { const id = `${P}spot:${s.id}`; if (!holder.has(id)) return id; }
    for (let k = 0; k < H3_ROOM_FIGURES; k += 1) { const id = `${P}door:${k}`; if (!holder.has(id)) return id; }
    return null;
  }
  function takePlace(a, id) { holder.set(id, a.id); const q = place.get(id); where.set(a.id, { id, spot: q.spot }); placed.push({ agent: a, spot: q.spot }); }
  function dropPlace(id) {
    const w = where.get(id); if (!w) return null;
    where.delete(id); holder.delete(w.id);
    const i = placed.findIndex((p) => p.agent.id === id); if (i >= 0) placed.splice(i, 1);
    return w;
  }
  function arrive(a, walkIn) {
    if (!avatars || where.has(a.id)) return;
    const turning = leaving.delete(a.id); // walking out and sent back: it turns round where it is
    const id = freePlace(a);
    if (!id) { if (turning) leaving.add(a.id); if (!waiting.includes(a.id)) { waiting.push(a.id); log.push({ t: tNow(), agent: a.id, what: "wait" }); } return; }
    takePlace(a, id);
    if (walkIn && !turning && !reducedMotion) avatars.handle({ type: "move", agent: a.id, to: `${P}exit` }); // appears in the doorway
    avatars.handle({ type: "move", agent: a.id, to: id }); // the first placement jumps; from the doorway it walks
    log.push({ t: tNow(), agent: a.id, what: "in", place: id });
  }
  function release(id) { leaving.delete(id); avatars?.release?.(id); refill(); }
  function leave(id) {
    const wi = waiting.indexOf(id); if (wi >= 0) waiting.splice(wi, 1);
    if (!dropPlace(id)) return;
    log.push({ t: tNow(), agent: id, what: "out" });
    if (reducedMotion) { avatars?.release?.(id); refill(); return; }
    leaving.add(id);
    avatars.handle({ type: "move", agent: id, to: `${P}exit` });
    refill();
  }
  function refill() {
    // a figure by the door steps over to a spot that has come free, then a waiting agent comes in if the budget allows
    for (const s of spots) {
      const sid = `${P}spot:${s.id}`; if (holder.has(sid)) continue;
      const by = [...where.entries()].find(([, w]) => w.id.startsWith(`${P}door:`)); if (!by) break;
      const [aid] = by; dropPlace(aid); takePlace(byId.get(aid), sid);
      avatars.handle({ type: "move", agent: aid, to: sid }); log.push({ t: tNow(), agent: aid, what: "promote", place: sid });
    }
    while (waiting.length && where.size + leaving.size < H3_ROOM_FIGURES) { const aid = waiting.shift(); if (presence.at(aid) === siteId) arrive(byId.get(aid), true); }
  }
  for (const a of roster) if (presence.at(a.id) === siteId) arrive(a, false); // who is here as the room opens: in place at once
  const offChange = presence.onChange((c) => {
    const a = byId.get(c.agent); if (!a) return;
    if (c.to === siteId) arrive(a, true); else if (c.from === siteId) leave(a.id);
  });
  return {
    room, siteId, placed, avatars, presence,
    animate(t, dt) {
      avatars?.animate(t, dt, null);
      for (const id of [...leaving]) { const s = avatars?.state(id); if (!s || !s.walking) release(id); } // out of the doorway: gone
    },
    visitors() { return [...where.keys()].filter((id) => homeOf(id) !== siteId); },
    waiting() { return waiting.slice(); },
    leaving() { return [...leaving]; },
    log() { return log.slice(); },
    counts() {
      const c = avatars?.counts() ?? { figures: 0, meshes: 0, sprites: 0, triangles: 0, textureBytes: 0 };
      return { agents: where.size, visitors: [...where.keys()].filter((id) => homeOf(id) !== siteId).length, leaving: leaving.size, waiting: waiting.length, spots: spots.length, ...c };
    },
    dispose() { offChange(); presence.dispose(); try { avatars?.dispose(); } catch (_) { /* the room's own exit already disposed the meshes */ } },
  };
}

/** Keep one mount for the room that is open now. */
export function hwSyncRoom(current, { room = null, three = null, agents = [], source = null, tier = "high", reducedMotion = false, mount = aaMountAgentAvatars } = {}) {
  if (current && current.room === room) return current;
  if (current) current.dispose();
  if (h5IsOpsRoom(room) && agents?.length) { // HIVE-5: the hive's own room
    const m = h5MountOpsRoom({ three, room, agents, source, tier, reducedMotion, mount });
    // HIVE-6: the learner enters at the start of the hive's day: the morning briefing (once; the hive says no outside its window)
    if (m) { try { m.briefing = source?.brief?.() ?? null; } catch (_) { m.briefing = null; } }
    return m;
  }
  if (!room || !hwIsRobotRoom(room) || !agents?.length) return null;
  return hwMountRoomAgents({ three, room, agents, source, tier, reducedMotion, mount });
}

/** ROBO-EXTERIORS' door as a room door spot: the outside spot (`out`, 1.4 m out on the pad side), else the door itself. */
export function hwFxDoorAt(door) {
  const out = Array.isArray(door?.out) ? door.out : null;
  if (out && Number.isFinite(+out[0]) && Number.isFinite(+out[1])) return { x: +out[0], z: +out[1], face: door.face ?? "s" };
  if (door && Number.isFinite(+door.x) && Number.isFinite(+door.z)) return { x: +door.x, z: +door.z, face: door.face ?? "s" };
  return null;
}

export function hwReturnHash(style) { return style && IXR_ROOMS[style] ? `ixr=${encodeURIComponent(style)}` : ""; }

export function hwRoomFromHash(hash = "", search = "") {
  const read = (s) => { try { return new URLSearchParams(String(s ?? "").replace(/^[#?]/, "")).get("ixr"); } catch (_) { return null; } };
  const v = read(hash) ?? read(search);
  return v && IXR_ROOMS[v] ? v : null;
}

// ------------------------------------------------------------------------------------------------ 4. walks round buildings

/** The collider boxes that overlap a rectangle (`colliders(parish, "cx,cz")`, the page's seam), cached per chunk. The seam
 * files a box under the chunk of its centre, so a long building reaches into the next chunk: the chunks of the rectangle grown
 * by `pad` metres are read, and only the boxes that overlap the rectangle are kept. */
export function hwBoxesIn(colliders, parish, x0, z0, x1, z1, { size = 4096, chunk = 256, cache = null, pad = 64 } = {}) {
  const n = size / chunk, out = [], memo = cache ?? new Map();
  const lx = Math.min(x0, x1), hx = Math.max(x0, x1), lz = Math.min(z0, z1), hz = Math.max(z0, z1);
  const c0x = Math.max(0, Math.floor((lx - pad + size / 2) / chunk)), c1x = Math.min(n - 1, Math.floor((hx + pad + size / 2) / chunk));
  const c0z = Math.max(0, Math.floor((lz - pad + size / 2) / chunk)), c1z = Math.min(n - 1, Math.floor((hz + pad + size / 2) / chunk));
  for (let cx = c0x; cx <= c1x; cx += 1) for (let cz = c0z; cz <= c1z; cz += 1) {
    const key = `${cx},${cz}`;
    if (!memo.has(key)) { let list = []; try { list = colliders(parish, key) ?? []; } catch (_) { list = []; } memo.set(key, list); }
    for (const b of memo.get(key)) if (b?.min && b?.max && b.max[0] >= lx && b.min[0] <= hx && b.max[2] >= lz && b.min[2] <= hz) out.push(b);
  }
  return out;
}

/** Does the segment a–b pass through the open box { x0, z0, x1, z1 }? (the slab test in two dimensions) */
export function hwSegBox(a, b, q) {
  let t0 = 0, t1 = 1;
  const dx = b.x - a.x, dz = b.z - a.z;
  for (const [p, d, lo, hi] of [[a.x, dx, q.x0, q.x1], [a.z, dz, q.z0, q.z1]]) {
    if (Math.abs(d) < 1e-12) { if (p <= lo || p >= hi) return false; continue; }
    let u = (lo - p) / d, v = (hi - p) / d; if (u > v) [u, v] = [v, u];
    t0 = Math.max(t0, u); t1 = Math.min(t1, v); if (t0 >= t1) return false;
  }
  return true;
}

/** A router round axis-aligned boxes (see the header). `boxesIn(x0, z0, x1, z1)` answers the boxes near a rectangle. */
export function hwRouter(boxesIn, { radius = 0.35, margin = 0.3, step = 0.5, reach = 30, minHeight = 0.5 } = {}) {
  const r = radius + margin;
  const grown = (x0, z0, x1, z1) => (boxesIn(Math.min(x0, x1), Math.min(z0, z1), Math.max(x0, x1), Math.max(z0, z1)) ?? [])
    .filter((b) => Array.isArray(b?.min) && Array.isArray(b?.max) && !(Number.isFinite(b.max[1]) && b.max[1] <= minHeight))
    .map((b) => ({ x0: b.min[0] - r, z0: b.min[2] - r, x1: b.max[0] + r, z1: b.max[2] + r }));
  const inside = (g, x, z) => g.some((q) => x > q.x0 && x < q.x1 && z > q.z0 && z < q.z1);
  const clear = (g, a, b) => !g.some((q) => hwSegBox(a, b, q));
  function blocked(x, z) { return inside(grown(x - 1, z - 1, x + 1, z + 1), x, z); }
  function route(from, to) {
    const x0 = Math.min(from.x, to.x) - reach, z0 = Math.min(from.z, to.z) - reach, x1 = Math.max(from.x, to.x) + reach, z1 = Math.max(from.z, to.z) + reach;
    const g = grown(x0, z0, x1, z1);
    if (clear(g, from, to)) return [{ x: to.x, z: to.z }];
    const nx = Math.max(2, Math.ceil((x1 - x0) / step)), nz = Math.max(2, Math.ceil((z1 - z0) / step));
    const cx = (i) => x0 + (i + 0.5) * step, cz = (j) => z0 + (j + 0.5) * step;
    const free = new Uint8Array(nx * nz);
    for (let i = 0; i < nx; i += 1) for (let j = 0; j < nz; j += 1) free[i * nz + j] = inside(g, cx(i), cz(j)) ? 0 : 1;
    const cell = (x, z) => [Math.max(0, Math.min(nx - 1, Math.floor((x - x0) / step))), Math.max(0, Math.min(nz - 1, Math.floor((z - z0) / step)))];
    const nearestFree = ([i0, j0]) => { for (let rr = 0; rr < 40; rr += 1) for (let di = -rr; di <= rr; di += 1) for (let dj = -rr; dj <= rr; dj += 1) { const i = i0 + di, j = j0 + dj; if (i >= 0 && j >= 0 && i < nx && j < nz && free[i * nz + j]) return [i, j]; } return null; };
    const s0 = nearestFree(cell(from.x, from.z)), g0 = nearestFree(cell(to.x, to.z));
    if (!s0 || !g0) return null;
    // A* with a binary heap over 8-connected cells (no corner cutting)
    const N = nx * nz, dist = new Float64Array(N).fill(Infinity), prev = new Int32Array(N).fill(-1), done = new Uint8Array(N);
    const heap = []; const push = (k, f) => { heap.push([f, k]); let i = heap.length - 1; while (i > 0) { const pa = (i - 1) >> 1; if (heap[pa][0] <= heap[i][0]) break; [heap[pa], heap[i]] = [heap[i], heap[pa]]; i = pa; } };
    const pop = () => { const top = heap[0], last = heap.pop(); if (heap.length) { heap[0] = last; let i = 0; for (;;) { const l = 2 * i + 1, rt = l + 1; let m = i; if (l < heap.length && heap[l][0] < heap[m][0]) m = l; if (rt < heap.length && heap[rt][0] < heap[m][0]) m = rt; if (m === i) break; [heap[m], heap[i]] = [heap[i], heap[m]]; i = m; } } return top; };
    const goal = g0[0] * nz + g0[1], start = s0[0] * nz + s0[1];
    dist[start] = 0; push(start, 0);
    while (heap.length) {
      const [, k] = pop(); if (done[k]) continue; done[k] = 1; if (k === goal) break;
      const i = Math.floor(k / nz), j = k % nz;
      for (const [di, dj, c] of HW_STEPS) {
        const a = i + di, b = j + dj; if (a < 0 || b < 0 || a >= nx || b >= nz) continue;
        const kk = a * nz + b; if (!free[kk] || (di && dj && (!free[(i + di) * nz + j] || !free[i * nz + j + dj]))) continue;
        const nd = dist[k] + c * step;
        if (nd < dist[kk]) { dist[kk] = nd; prev[kk] = k; push(kk, nd + Math.hypot(a - g0[0], b - g0[1]) * step); }
      }
    }
    if (!Number.isFinite(dist[goal])) return null;
    const cells = []; for (let k = goal; k !== -1; k = prev[k]) cells.push({ x: cx(Math.floor(k / nz)), z: cz(k % nz) });
    cells.reverse();
    const path = [{ x: from.x, z: from.z }, ...cells, { x: to.x, z: to.z }];
    // pulled tight: from each point, the farthest later point in a clear straight line
    const out = []; let at = 0;
    while (at < path.length - 1) { let j = path.length - 1; while (j > at + 1 && !clear(g, path[at], path[j])) j -= 1; out.push(path[j]); at = j; }
    return out;
  }
  return { route, blocked };
}
const HW_STEPS = [[1, 0, 1], [-1, 0, 1], [0, 1, 1], [0, -1, 1], [1, 1, Math.SQRT2], [1, -1, Math.SQRT2], [-1, 1, Math.SQRT2], [-1, -1, Math.SQRT2]];
