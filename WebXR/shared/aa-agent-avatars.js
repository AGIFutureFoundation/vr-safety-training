// AGENT-AVATARS — the Omega Hive's software agents, embodied at the robot sites
// they manage (console AGENT-AVATARS, docs/consoles/AGENT-AVATARS.md).
// SmartCiti.X Holodeck · Powered by AGI Corp.
//
// One figure per agent: crew.js's ctAvatarFigure (the body every GRIOT character
// has) re-tinted as a hologram of the agent's accent colour — no skin, no face —
// wearing the agent outfit set: a visor where a face would be, a halo above it, a
// high-visibility vest with a neutral glyph badge and a tablet. A floating label
// reads "software agent · <role>" under the agent's name, so nobody can take an
// agent for a person. The whole figure — body, marker, outfit, talk light, label
// and caption — stays inside AA_AGENT_BUDGET (crew.js CT_AVATAR_BUDGET, 12, the
// same ceiling GRIOT's figures keep).
//
// It listens to anything with on(type, fn) — the hive (OMEGA-HIVE's ohHive), the
// VBRIDGE adapter below, or a fixture — for the contract's events:
//   { t, type: "speak" | "move" | "bid" | "award" | "dispatch" | "refused" | "approval-request" | "complete",
//     agent, text?, to?: siteId, jobId?, reason?, caption? }
//   move     → walks to a free standing spot at the target site (property writes per frame, only within GRIOT's
//              animate radius of the learner, hidden beyond its hide radius); a move longer than AA_WALK_MAX re-projects
//              the agent AA_WALK_IN m short of the spot and it walks in; reduced motion or an off-map start jumps.
//   speak    → the talk light runs for exactly the line (aaLineMs, queued per agent so an agent never talks over
//              itself; talkStart/talkEnd let an on-device voice drive it instead) and a caption bubble shows the
//              line above the figure.
//   refused  → a calm stop gesture (the tablet raised, palm-out), with the refusal's own text as a caption.
//   complete → a nod.
// Reduced motion: no walking, no nod or bob — figures jump, gestures hold still, captions still show.
// The phone tier ("low") builds no figures, so its mesh, triangle and texture budgets do not move.
//
// Standing spots sit 9–17 m from a site's centre on its north, east and west sides: outside the robot's
// warning zone (RB_SSM.warn, 6 m) and its pad, never in the south corridor where boards and arrival spots
// are (GRIOT's placement rule). No network, no voice, no microphone: this module draws and listens to
// events only. Every top-level name starts with `aa`/`AA_` (the bundler shares one scope); three.js comes
// from the caller as `three`.
//
// SEAM (the contract in the loop-10 brief):
//   aaMountAgentAvatars({ three, parent, agents, source, siteAt, reducedMotion, tier, groundAt, spotFor, textureScale })
//     spotFor(agent, siteId) -> { x, y?, z, yaw } | null: a fixed standing spot (HIVE-IN-WORLD: a robotics room's agent spot,
//              room-local; yaw is the figure's rotation.y) used instead of a slot round the site; null falls back to a slot.
//     textureScale (default 1): the label and caption canvases are drawn at this fraction of their size (a room on the
//              balanced tier uses 0.5 to stay inside its texture budget); the layout is the same at every scale.
//     blocked(x, z) -> bool: a standing slot (or a re-projected walk start) there is skipped (HIVE-IN-WORLD: inside a
//              building's collider box).
//     route(from, to) -> [{ x, z }, …] | null: the walk follows these waypoints (ending at `to`) instead of a straight line
//              (HIVE-IN-WORLD's hwRouter round the colliders); null walks straight.
//     hd (default false; AVATARS-HD): on the desktop "high" tier, build aa-agent-hd.js's high-detail figure (one skinned body, one
//              skinned glow, a mouth that opens with the words, jointed arms that gesture, posture from the traits); balanced keeps
//              today's figure, the phone tier builds none, and a three.js without skinning builds today's figure. hd: "room"
//              (AVATARS-HD-2) builds the room level instead (AA_HD_ROOM_BUDGET: <= 1,000 triangles, so a robotics room keeps IX_BUDGET).
//     voiced(agentId, text) -> bool (AVATARS-HD-2): an on-device voice holds this line (the page's voice controller `pending`). Such a
//              line shows its caption when it starts and holds the talk light and the mouth until the voice's onstart (talkStart);
//              when the voice lets it go unstarted (turned off, a stuck voice, no local voice) the clock drives it from then.
//     -> { root, handle(ev), animate(t, dt, here), attach(source), detach(source), addAgents(list), agents(), release(id),
//          state(id), talkStart(id, text?), talkWord(id, charIndex, text?), talkEnd(id, text?), talkLog(), captionLog(), gestureLog(),
//          counts(), dispose() }
//     With `text` (the line the voice speaks) talkStart/talkWord/talkEnd act on that line only: a later queued line is brought
//     forward (the voice has moved on), an unknown one is ignored, and a queued line the voice ended unstarted runs on the clock.
//   Gestures (AA_GESTURE_FOR): bid → raise (a raised hand), award → accept (a hand to the chest), refused → stop (palm out),
//     the hive's speak event about "approved" → approve (a nod), complete → nod. All are logged on every tier; the high figure poses
//     every one, today's figure poses stop, nod and approve.
//   aaVoiceHooks(world, agentId, text?) -> { onstart, onboundary, onend } for a voice's say(): the light and the mouth follow the utterance.
//   aaRoomAvatarMount(extra) -> a mount for hwSyncRoom's `mount` (AVATARS-HD-2): the room level of the high-detail figure on high.
//   aaCrowdAvatarMount(extra) -> the same for the hive's operations room (AVATARS-HD-3): the crowd level (AA_HD_CROWD_BUDGET), seven of
//              them inside IX_BUDGET with the room. extra.room + extra.router (hw-hive-world.js hwRouter, passed in: this module imports
//              nothing of the hive's) make the walks between the door and the consoles go round the room's colliders (aaRoomRoute).
//   aaRoomRoute(room, router, opts?) -> route(from, to) round room.colliders (the consoles, chairs and walls), or null.
//   now (option, ms; default performance.now) and talkWord(id, charIndex, text?, atMs?) (AVATARS-HD-3): a word boundary is stamped with
//              its own time (atMs, the event's timeStamp, else now() when it arrives), mapped onto the mount's clock from the last frame,
//              not with the last frame's time; and a frame that comes after a word's opening has passed unseen (a very low frame rate)
//              shows the newest word open, so no word passes without the mouth opening.
//   aaBoundaryWordSec(bw, chars) -> how long a boundary-driven word lasts (s), from the line's boundaries so far (the mouth closes before
//              the next word at the voice's own pace).
//   aaVbridgeAgents(homeSite) -> the four VBRIDGE personas as agents standing at homeSite
//   aaVbridgeSource(vbApi)    -> an on/off source that turns the agent-jobs panel's job (vbApi.state()) into
//                                contract events: the client asks, the governor checks or refuses, the provider
//                                walks to the job's site and runs it, the evaluator nods or refuses. poll() reads.
//   aaEmitter()               -> a small on/off/emit event source (fixtures and adapters)

import { ctAvatarFigure, ctAvatarOption, CT_AVATAR_BUDGET } from "./crew.js";
import { aaAgentLook, aaRoleLabel, aaHash, AA_VBRIDGE_PERSONAS } from "./aa-agent-portraits.js";
import { aaHdSupported, aaHdSpec, aaHdGeometry, AA_HD_NEAR_EXTRA, AA_HD_CROWD_BUDGET, aaHdBuild, aaHdPose, aaWordOnsets, aaHdMouth, AA_HD_GESTURE_MS, AA_HD_LOD, AA_HD_MOODS, aaHdMoodTempo } from "./aa-agent-hd.js";
import { RB_SITES } from "./rb-robotics-data.js";
import { VB_TASKS, VB_REASONS } from "./vb-shared-data.js";

/** Meshes and sprites per agent figure, every part included: crew.js's figure ceiling (GRIOT's figures keep it too). */
export const AA_AGENT_BUDGET = CT_AVATAR_BUDGET;
/** GRIOT's radii (npc.js GR_ANIMATE_RADIUS, GR_HIDE_RADIUS); check_agent_avatars holds them equal. */
export const AA_ANIMATE_RADIUS = 150;
export const AA_HIDE_RADIUS = 600;
/** Walking speed (m/s) and the longest walk. A longer move (robot sites on one map can be a kilometre apart) re-projects
 * the agent AA_WALK_IN metres short of the target, on the line from where it was, and it walks the rest in. */
export const AA_WALK_SPEED = 2.2;
export const AA_WALK_MAX = 150;
export const AA_WALK_IN = 24;
/** AVATARS-HD-4: a routed walk's heading turns through a bend over this many metres either side of the waypoint (no snap). */
export const AA_WALK_TURN = 0.4;
/** A line's duration with no voice driving it: 400 ms plus the words at AA_WPM, clamped. */
export const AA_WPM = 165;
export const AA_LINE_MS = Object.freeze({ min: 1500, max: 12000 });
/** Gesture lengths (ms): stop (a refusal) and nod (a completion) on every built tier; raise (a bid), accept (an award) and approve
 * (an approval: a nod) are posed by the high tier's figure (AVATARS-HD) and logged on every tier. */
export const AA_GESTURE_MS = Object.freeze({ stop: 1800, nod: 900, raise: AA_HD_GESTURE_MS.raise, accept: AA_HD_GESTURE_MS.accept, approve: AA_HD_GESTURE_MS.approve });
/** Which hive event raises which gesture (AVATARS-HD). The approval is the hive's own speak event about "approved". */
export const AA_GESTURE_FOR = Object.freeze({ bid: "raise", award: "accept", refused: "stop", approved: "approve", complete: "nod" });
/** Canvas sizes (px) for the label (drawn at mount) and the caption (drawn on the first line). */
export const AA_LABEL_PX = Object.freeze([256, 64]);
export const AA_CAPTION_PX = Object.freeze([512, 128]);
/** Texture bytes one figure can hold (RGBA): the label plus the caption. The phone tier holds none. */
export const AA_TEXTURE_BYTES_PER_FIGURE = (AA_LABEL_PX[0] * AA_LABEL_PX[1] + AA_CAPTION_PX[0] * AA_CAPTION_PX[1]) * 4;
/** Which render tiers build figures (perf.js tcTierSettings names). */
export const AA_TIERS = Object.freeze({ low: false, balanced: true, high: true });
export const AA_EVENT_TYPES = Object.freeze(["speak", "move", "bid", "award", "dispatch", "refused", "approval-request", "complete"]);
/** AVATARS-HD-4: HIVE-6's mood event ({ type: "mood", agent, mood, from?, cause }), listened to besides the contract's types, guarded:
 * an unknown mood or agent is ignored, and a source that never emits one leaves every pose as it was. */
export const AA_MOOD_EVENT = "mood";
/** AVATARS-HD-5: an agent's current mood from a source that keeps one (HIVE-6's hive.mood(id), or a relay's `.hive`), as
 * { mood, cause } or null. A figure that enters mid-day takes the mood the hive already has, so its posture names the same mood as
 * HIVE-7's glow (which seeds from hive.mood(id) as the ops room opens) before the next mood event. Guarded: a source without
 * moods, a throwing one or an unknown mood gives null. */
export function aaMoodOf(source, id) {
  const s = source && typeof source.mood === "function" ? source : source?.hive && typeof source.hive.mood === "function" ? source.hive : null;
  if (!s || !id) return null;
  let m = null; try { m = s.mood(id); } catch (_) { m = null; }
  const mood = typeof m === "string" ? m : m?.mood;
  return typeof mood === "string" && AA_HD_MOODS.includes(mood) ? { mood, cause: (m && typeof m === "object" ? m.cause : null) ?? null } : null;
}
/** Standing spots around a site centre ([dx, dz] m): north, west and east sides, 9.3–16 m out. */
export const AA_SLOTS = Object.freeze([[-4, -9.5], [4, -9.5], [-10.5, -3], [10.5, -3], [0, -12.5], [-10.5, 3], [10.5, 3], [-8, -13], [8, -13], [-13, -8], [13, -8], [0, -16]]);

const aaClamp = (v, a, b) => Math.max(a, Math.min(b, v));

/** AVATARS-HD-2: a boundary-driven word's mouth: the expected time to the next boundary is a + b x characters (the word and the space
 * after it); before the line has two boundaries, this brisk prior (about 0.2 s for a five-letter word). The mouth opens for
 * AA_BOUNDARY_FILL of it (it closes at 86% of that, aaHdMouth), so it closes between words at the voice's pace. */
export const AA_BOUNDARY_PRIOR = Object.freeze({ a: 0.05, b: 0.025 });
export const AA_BOUNDARY_FILL = 0.8;
/** AVATARS-HD-3: a frame counts a word as seen when the mouth is at least this open; a word whose opening passed unseen between frames is
 * shown at AA_MOUTH_CATCHUP on the next frame. */
export const AA_MOUTH_SEEN = 0.15;
export const AA_MOUTH_CATCHUP = 0.8;

/** AVATARS-HD-2: seconds a boundary-driven word of `chars` characters will last, from the line's boundaries so far (`bw`: [{ at, char }]):
 * interval = a + b x delta-chars fitted by least squares to the last eight intervals (one interval: a pace per character), else the prior. */
export function aaBoundaryWordSec(bw = [], chars = 5) {
  const pts = [];
  for (let i = Math.max(1, bw.length - 8); i < bw.length; i += 1) {
    const dc = Number(bw[i].char) - Number(bw[i - 1].char), dt = bw[i].at - bw[i - 1].at;
    if (dc > 0 && dt > 0 && dt < 2) pts.push([dc, dt]);
  }
  let { a, b } = AA_BOUNDARY_PRIOR;
  if (pts.length) {
    const n = pts.length, mx = pts.reduce((q, p) => q + p[0], 0) / n, my = pts.reduce((q, p) => q + p[1], 0) / n;
    let sxx = 0, sxy = 0; for (const [x, y] of pts) { sxx += (x - mx) ** 2; sxy += (x - mx) * (y - my); }
    if (n >= 2 && sxx > 1e-9) { b = sxy / sxx; a = my - b * mx; } else { b = my / mx; a = 0; }
    if (b < 0) { b = 0; a = my; } else if (a < 0) { a = 0; b = my / mx; }
  }
  return aaClamp(a + b * Math.max(1, Number(chars) || 1), 0.06, 0.8);
}

/** A line's duration (ms) when no voice drives it. */
export function aaLineMs(text) {
  const words = String(text ?? "").trim().split(/\s+/).filter(Boolean).length;
  return Math.round(aaClamp(400 + (words * 60000) / AA_WPM, AA_LINE_MS.min, AA_LINE_MS.max));
}

/** A small event source: on(type, fn), off(type, fn), emit(ev); "*" hears every type. */
export function aaEmitter() {
  const subs = new Map();
  const api = {
    on(type, fn) { if (typeof fn !== "function") return api; if (!subs.has(type)) subs.set(type, new Set()); subs.get(type).add(fn); return api; },
    off(type, fn) { subs.get(type)?.delete(fn); return api; },
    emit(ev) {
      if (!ev?.type) return 0; let n = 0;
      for (const fn of [...(subs.get(ev.type) ?? []), ...(subs.get("*") ?? [])]) { try { fn(ev); n += 1; } catch (_) { /* a listener's error stays its own */ } }
      return n;
    },
    listeners: (type) => subs.get(type)?.size ?? 0,
  };
  return api;
}

/** AVATARS-HD: the callbacks a voice passes for one agent's line — say(agent, text, aaVoiceHooks(world, agent.id)) — so the light
 * and the mouth follow the utterance: onstart holds the line, onboundary (word boundaries) opens the mouth on each word, onend lets
 * it go. `world` is the mount (or anything with talkStart/talkWord/talkEnd); a missing world is a no-op. */
export function aaVoiceHooks(world, agentId, text = null) {
  return {
    onstart: () => { try { world?.talkStart?.(agentId, text); } catch (_) { /* a figure never stops a voice */ } },
    onboundary: (e) => { try { if (!e || e.name === undefined || e.name === "word") world?.talkWord?.(agentId, Number.isFinite(e?.charIndex) ? e.charIndex : null, text, Number.isFinite(e?.timeStamp) ? e.timeStamp : null); } catch (_) { /* ignore */ } },
    onend: () => { try { world?.talkEnd?.(agentId, text); } catch (_) { /* ignore */ } },
  };
}

/** AVATARS-HD-2: the avatar mount for a robotics room, for hwSyncRoom(..., { mount }): the room level of the high-detail figure on the
 * desktop high tier (AA_HD_ROOM_BUDGET), so a room with H3_ROOM_FIGURES figures stays inside IX_BUDGET; balanced keeps today's figure
 * and the phone tier builds none. `extra` adds options (the page passes `voiced`). */
export function aaRoomAvatarMount(extra = {}) { return (opts = {}) => aaMountAgentAvatars({ triCap: AA_ROOM_TRI_CAP, capFigures: AA_ROOM_FIGURES, ...opts, ...extra, hd: "room" }); }

/** AVATARS-HD-4: a robotics room's triangle cap for its figures (IX_BUDGET.triangles.high, ix-interiors.js; this module imports nothing of
 * the rooms'). With ROBOTS-HD's high-detail robots a room's own triangles grew (the AMR warehouse about 4,600 built), so three room-level
 * figures could take a room over (7,450 built, measured in the built page at 40d97421). The room mount counts the room's triangles as
 * ixrMeasure does (every mesh under the room's group, instanced meshes times their count) before it builds a figure: the room level when
 * it fits, else the crowd level, else no figure (the agent is held, listed but unbuilt, until a figure leaves: state().held). */
export const AA_ROOM_TRI_CAP = 6000;
/** AVATARS-HD-4: the most figures a robotics room shows (hw-hive-world.js / h3 H3_ROOM_FIGURES, 3): a figure takes the room level only
 * when the figures still to come could each have a crowd figure (AA_HD_CROWD_BUDGET) under the cap. */
export const AA_ROOM_FIGURES = 3;

/** AVATARS-HD-3: a route round a room's colliders (room-local boxes: walls, consoles, chairs, props), from `router` (hw-hive-world.js
 * hwRouter(boxesIn, opts), passed in by the caller). Defaults: a 0.3 m body and a 0.05 m margin on a 0.25 m grid (the ops room's spots
 * stand 0.42 m or more from their chairs, so a clear straight walk stays straight and only a blocked one bends). Null without a room
 * or a router. */
export function aaRoomRoute(room, router, { radius = 0.3, margin = 0.05, step = 0.25, reach = 8 } = {}) {
  const boxes = Array.isArray(room?.colliders) ? room.colliders : null;
  if (!boxes || typeof router !== "function") return null;
  const boxesIn = (x0, z0, x1, z1) => boxes.filter((b) => b?.min && b?.max && b.max[0] >= x0 && b.min[0] <= x1 && b.max[2] >= z0 && b.min[2] <= z1);
  try { const r = router(boxesIn, { radius, margin, step, reach }); return typeof r?.route === "function" ? r.route : null; } catch (_) { return null; }
}

/** AVATARS-HD-3: the avatar mount for the hive's operations room (h5-ops-room.js h5MountOpsRoom's `mount`, through hwSyncRoom): the crowd
 * level of the high-detail figure on the desktop high tier (seven figures and the room inside IX_BUDGET); balanced keeps today's figure
 * (HIVE-5 lightens it there) and the phone tier builds none. `extra`: { voiced, room, router } (room + router: walks go round the
 * consoles; aaRoomRoute). */
export function aaCrowdAvatarMount({ room = null, router = null, nearest = null, learner = null, triCap = AA_ROOM_TRI_CAP, ...extra } = {}) {
  const route = aaRoomRoute(room, router);
  return (opts = {}) => {
    // AVATARS-HD-4: the console nearest the learner as they enter gets the room level (chosen once, here, when the room mounts: no swap
    // while the learner moves, since a swap rebuilds a skinned mesh); the rest stay at the crowd level.
    // AVATARS-HD-5: the headroom is measured when the room mounts (aaRoomHeadroom: the cap less the room's own triangles and every
    // agent's crowd figure), not the constant AA_HD_NEAR_EXTRA, so anything later added to the room comes out of the room-level figure
    // first: the room stays inside its cap and every figure falls back to the crowd level.
    const role = nearest && AA_HD_LOD[nearest] ? aaNearestRole(room, learner, { agents: opts.agents, level: nearest, extra: aaRoomHeadroom(opts.parent, opts.agents, triCap) }) : null;
    const hdFor = role ? (a) => (a?.key === role ? nearest : null) : null;
    return aaMountAgentAvatars({ ...opts, ...(route ? { route } : {}), ...(hdFor ? { hdFor } : {}), ...extra, hd: "crowd" });
  };
}

/** AVATARS-HD-5: the triangles a room has left for one figure above the crowd level: `cap` less the room group's own triangles (counted
 * as ixrMeasure counts: every mesh, instanced ones times their count) and every agent's crowd figure. The ops room at a10f1ff8: 6,000 −
 * (2,022 + 3,564) = 414 = AA_HD_NEAR_EXTRA. Without a parent, the cap less the figures. */
export function aaRoomHeadroom(parent, agents = [], cap = AA_ROOM_TRI_CAP) {
  let own = 0;
  parent?.traverse?.((o) => { if (!o.isMesh) return; const g = o.geometry, c = g?.index ? g.index.count : g?.attributes?.position?.count ?? 0; own += (c / 3) * (o.isInstancedMesh ? o.count : 1); });
  let crowd = 0;
  for (const a of agents ?? []) { try { crowd += aaHdGeometry(aaHdSpec(a), "crowd").triangles.total; } catch (_) { crowd += AA_HD_CROWD_BUDGET.triangles; } }
  return cap - own - crowd;
}

/** AVATARS-HD-4: the role of the agent spot (room.spots.agent) nearest the learner: `learner` is { x, z } or a function returning it
 * (room-local); without one, where the room's enter() stands the learner (0.8 m inside the door, ixr-robo-interiors.js). Null when
 * the room has no spots. Ties go to the first spot in the room's order. With { agents, level }, the nearest spot whose agent fits: its
 * figure at `level` adds at most `extra` triangles over its crowd figure (AA_HD_NEAR_EXTRA), else the next nearest, else null. */
export function aaNearestRole(room, learner = null, { agents = null, level = null, extra = AA_HD_NEAR_EXTRA } = {}) {
  const spots = Array.isArray(room?.spots?.agent) ? room.spots.agent : [];
  if (!spots.length) return null;
  let at = null; try { at = typeof learner === "function" ? learner() : learner; } catch (_) { at = null; }
  const inRoom = (q) => !!q && Number.isFinite(+q.x) && Number.isFinite(+q.z) && (!(+room?.w > 0) || Math.abs(+q.x) <= +room.w / 2 + 0.5) && (!(+room?.d > 0) || Math.abs(+q.z) <= +room.d / 2 + 0.5);
  if (!inRoom(at)) at = room?.door && Number.isFinite(+room.door.x) && Number.isFinite(+room.door.z) ? { x: +room.door.x, z: +room.door.z - 0.8 } : null;
  if (!at) return null;
  const ranked = spots.map((s, i) => ({ s, i, d: Math.hypot(+s.x - at.x, +s.z - at.z) })).sort((a, b) => a.d - b.d || a.i - b.i);
  if (!Array.isArray(agents) || !level || !AA_HD_LOD[level]) return ranked[0].s.role ?? null;
  // with agents and a level: the nearest whose agent fits the room's headroom at that level (room − crowd triangles ≤ extra)
  const tri = (a, l) => { try { return aaHdGeometry(aaHdSpec(a), l).triangles.total; } catch (_) { return Infinity; } };
  for (const r of ranked) { const a = agents.find((x) => x?.key === r.s.role); if (a && tri(a, level) - tri(a, "crowd") <= extra) return r.s.role; }
  return null;
}

/** A site lookup's answer as { x, y, z } (accepts [x, z], [x, y, z], { x, z }, { position: [x, z] }), or null. */
export function aaSitePoint(v) {
  if (!v) return null;
  if (Array.isArray(v)) return v.length >= 3 ? { x: +v[0], y: +v[1] || 0, z: +v[2] } : v.length === 2 ? { x: +v[0], y: 0, z: +v[1] } : null;
  if (Array.isArray(v.position)) return { x: +v.position[0], y: +(v.y ?? 0) || 0, z: +v.position[1] };
  if (Number.isFinite(+v.x) && Number.isFinite(+v.z)) return { x: +v.x, y: +(v.y ?? 0) || 0, z: +v.z };
  return null;
}

const aaAgentId = (a) => (typeof a === "string" ? a : a?.id ?? null);

// ------------------------------------------------------------------ canvases

function aaCanvas(w, h, scale = 1) {
  try {
    if (typeof document === "undefined" || typeof document.createElement !== "function") return null;
    const k = scale > 0 ? scale : 1;
    const c = document.createElement("canvas"); c.width = Math.max(1, Math.round(w * k)); c.height = Math.max(1, Math.round(h * k));
    const g = c.getContext?.("2d"); if (!g) return null;
    g.scale?.(c.width / w, c.height / h); // draw in the logical w × h box at any scale
    return { c, g, w, h };
  } catch (_) { return null; }
}
const aaCss = (n) => `#${(n >>> 0).toString(16).padStart(6, "0").slice(-6)}`;

function aaRoundRect(g, x, y, w, h, r) {
  g.beginPath(); g.moveTo(x + r, y); g.lineTo(x + w - r, y); g.quadraticCurveTo(x + w, y, x + w, y + r); g.lineTo(x + w, y + h - r);
  g.quadraticCurveTo(x + w, y + h, x + w - r, y + h); g.lineTo(x + r, y + h); g.quadraticCurveTo(x, y + h, x, y + h - r); g.lineTo(x, y + r); g.quadraticCurveTo(x, y, x + r, y); g.closePath();
}

/** Label text room on the label canvas (logical px): the width inside the rounded frame, and the smallest legible font. */
export const AA_LABEL_TEXT = Object.freeze({ maxWidth: AA_LABEL_PX[0] - 20, minPx: 10 });

/** The largest font (from `px` down to `minPx`) at which `text` fits `maxWidth` on context `g`; leaves g.font set to it. */
export function aaFitFont(g, text, maxWidth, px, minPx = AA_LABEL_TEXT.minPx, weight = 500) {
  let size = px, width = Infinity;
  for (; size >= minPx; size -= 1) { g.font = `${weight} ${size}px system-ui, sans-serif`; width = Number(g.measureText(text)?.width) || 0; if (width <= maxWidth) break; }
  if (size < minPx) { size = minPx; g.font = `${weight} ${size}px system-ui, sans-serif`; width = Number(g.measureText(text)?.width) || 0; }
  return { px: size, width, maxWidth, fits: width <= maxWidth };
}

/** The label: the name, then "software agent · <role>" whole, each fitted to the frame (the font shrinks; fillText's maxWidth
 * holds anything still wider), so the words "software agent" are never cut at the canvas edge. Returns the fits. */
function aaDrawLabel(cv, name, roleText, accent) {
  const { g, w, h } = cv, max = AA_LABEL_TEXT.maxWidth;
  g.clearRect(0, 0, w, h);
  aaRoundRect(g, 2, 2, w - 4, h - 4, 14); g.fillStyle = "rgba(8,22,32,0.86)"; g.fill(); g.lineWidth = 3; g.strokeStyle = aaCss(accent); g.stroke();
  g.textAlign = "center"; g.textBaseline = "middle"; g.fillStyle = "#ffffff";
  const nameText = String(name), nameFit = aaFitFont(g, nameText, max, 22, 12, 600);
  g.fillText(nameText, w / 2, h * 0.34, max);
  g.fillStyle = aaCss(accent);
  const roleFit = aaFitFont(g, roleText, max, 17, AA_LABEL_TEXT.minPx, 500);
  g.fillText(roleText, w / 2, h * 0.72, max);
  return { name: { text: nameText, ...nameFit }, role: { text: roleText, ...roleFit } };
}

/** Wrap text into at most `max` lines that fit `width` (an ellipsis marks a cut). */
function aaWrap(g, text, width, max) {
  const words = String(text ?? "").split(/\s+/).filter(Boolean), lines = [];
  let line = "";
  for (const wd of words) {
    const next = line ? `${line} ${wd}` : wd;
    if (g.measureText(next).width <= width || !line) line = next; else { lines.push(line); line = wd; }
    if (lines.length === max) break;
  }
  if (lines.length < max && line) lines.push(line);
  if (lines.length === max && lines.join(" ").length < words.join(" ").length) lines[max - 1] = `${lines[max - 1].replace(/\s*\S*$/, "")}…`;
  return lines;
}

function aaDrawCaption(cv, text, accent) {
  const { g, w, h } = cv;
  g.clearRect(0, 0, w, h);
  aaRoundRect(g, 3, 3, w - 6, h - 22, 16); g.fillStyle = "rgba(255,255,255,0.94)"; g.fill(); g.lineWidth = 3; g.strokeStyle = aaCss(accent); g.stroke();
  g.beginPath(); g.moveTo(w / 2 - 12, h - 20); g.lineTo(w / 2, h - 4); g.lineTo(w / 2 + 12, h - 20); g.closePath(); g.fillStyle = "rgba(255,255,255,0.94)"; g.fill();
  g.font = "500 24px system-ui, sans-serif"; g.fillStyle = "#0b1a24"; g.textAlign = "center"; g.textBaseline = "middle";
  const lines = aaWrap(g, text, w - 36, 3), lh = 28, top = (h - 18) / 2 - ((lines.length - 1) * lh) / 2;
  lines.forEach((ln, i) => g.fillText(ln, w / 2, top + i * lh));
}

// ------------------------------------------------------------------ the figure

const AA_BODIES = ["average", "slender", "tall", "broad", "compact", "full"];

function aaSprite(T, cv, w, h) {
  const map = cv && T.CanvasTexture ? new T.CanvasTexture(cv.c) : null;
  if (T.Sprite && T.SpriteMaterial) {
    const s = new T.Sprite(new T.SpriteMaterial({ map, transparent: true, depthWrite: false }));
    s.scale.set(w, h, 1); return s;
  }
  const m = new T.Mesh(new T.PlaneGeometry(w, h), new T.MeshBasicMaterial({ map, transparent: true, depthWrite: false })); return m;
}

/** Build one agent's figure into a new group (feet at y = 0, facing +z). Returns { group, parts, label, caption, captionCv, labelCv, headY }. */
function aaBuildFigure(T, agent, look, textureScale = 1) {
  const h = aaHash(agent.id);
  const body = AA_BODIES[h % AA_BODIES.length];
  const g = ctAvatarFigure(T, { body, skin: "tone-6", hair: "shaved", hairColour: "black", ppe: "none", hardHat: "white" });
  g.name = `aa-agent-${agent.id}`;
  const parts = g.userData.parts;
  const holo = new T.MeshStandardMaterial({ color: look.accent, emissive: look.accent, emissiveIntensity: 0.35, roughness: 0.45, metalness: 0.05, transparent: true, opacity: 0.82 });
  for (const m of Object.values(parts)) { m.material?.dispose?.(); m.material = holo; m.castShadow = false; }
  const B = ctAvatarOption("body", body), H = B.h, W = B.w, headY = parts.head.position.y;
  const add = (name, geo, mat, x, y, z) => { const mesh = new T.Mesh(geo, mat); mesh.position.set(x, y, z); mesh.name = `aa-${name}`; g.add(mesh); parts[name] = mesh; return mesh; };
  add("visor", new T.BoxGeometry(0.25, 0.07, 0.12), new T.MeshStandardMaterial({ color: 0x0b1a24, emissive: look.accent, emissiveIntensity: 0.55, roughness: 0.2, metalness: 0.4 }), 0, headY + 0.01, 0.085);
  const halo = add("halo", new T.TorusGeometry(0.17, 0.018, 6, 24), new T.MeshBasicMaterial({ color: look.accent }), 0, headY + 0.27, 0); halo.rotation.x = Math.PI / 2;
  add("vest", new T.CylinderGeometry(0.25 * W, 0.25 * W, 0.42 * H, 10, 1, true), new T.MeshStandardMaterial({ color: 0xd8ff3a, emissive: 0x202000, roughness: 0.7 }), 0, 1.12 * H, 0);
  add("badge", new T.CircleGeometry(0.055, 16), new T.MeshBasicMaterial({ color: look.accent }), -0.1 * W, 1.24 * H, 0.256 * W);
  const tablet = add("tablet", new T.BoxGeometry(0.2, 0.27, 0.02), new T.MeshStandardMaterial({ color: 0x1d2a33, emissive: look.accent, emissiveIntensity: 0.25, roughness: 0.4 }), 0.2 * W, 1.0 * H, 0.27 * W);
  tablet.rotation.x = -0.6;
  const talk = add("talk", new T.SphereGeometry(0.045, 10, 8), new T.MeshBasicMaterial({ color: 0xffffff }), 0, headY - 0.07, 0.125);
  talk.visible = false;
  const roleText = `software agent · ${aaRoleLabel(agent)}`;
  const labelCv = aaCanvas(AA_LABEL_PX[0], AA_LABEL_PX[1], textureScale);
  const labelFit = labelCv ? aaDrawLabel(labelCv, agent.name ?? agent.id, roleText, look.accent) : null;
  const label = aaSprite(T, labelCv, 1.6, 0.4); label.position.set(0, headY + 0.62, 0); label.name = "aa-label";
  label.userData.text = roleText; label.userData.name = agent.name ?? agent.id; label.userData.fit = labelFit; g.add(label);
  const caption = aaSprite(T, null, 2.8, 0.7); caption.position.set(0, headY + 1.22, 0); caption.name = "aa-caption"; caption.visible = false; caption.userData.text = ""; g.add(caption);
  g.userData.aaAgent = { id: agent.id, name: agent.name ?? agent.id, label: roleText, software: true };
  return { group: g, parts, label, caption, labelCv, captionCv: null, headY, tabletRest: { y: tablet.position.y, z: tablet.position.z, rx: tablet.rotation.x }, roleText };
}

/** AVATARS-HD: the high tier's figure (aa-agent-hd.js: one skinned body, one skinned glow, the mouth's lit opening) with the same
 * label and caption as today's. parts.head is the head bone (a nod pitches it), parts.talk the mouth's lit opening (shown exactly
 * while the agent talks), parts.tablet the left wrist (the tablet's hand). */
function aaBuildHdFigure(T, agent, look, textureScale = 1, level = "full") {
  const hd = aaHdBuild(T, agent, undefined, { level });
  const g = hd.group, headY = hd.headY;
  const roleText = `software agent · ${aaRoleLabel(agent)}`;
  const labelCv = aaCanvas(AA_LABEL_PX[0], AA_LABEL_PX[1], textureScale);
  const labelFit = labelCv ? aaDrawLabel(labelCv, agent.name ?? agent.id, roleText, look.accent) : null;
  const label = aaSprite(T, labelCv, 1.6, 0.4); label.position.set(0, headY + 0.62, 0); label.name = "aa-label";
  label.userData.text = roleText; label.userData.name = agent.name ?? agent.id; label.userData.fit = labelFit; g.add(label);
  const caption = aaSprite(T, null, 2.8, 0.7); caption.position.set(0, headY + 1.22, 0); caption.name = "aa-caption"; caption.visible = false; caption.userData.text = ""; g.add(caption);
  g.userData.parts = { head: hd.bones.head, talk: hd.talk, tablet: hd.bones.wristL, body: hd.body, glow: hd.glow };
  g.userData.aaAgent = { id: agent.id, name: agent.name ?? agent.id, label: roleText, software: true, hd: true, level: hd.level };
  return { group: g, parts: g.userData.parts, label, caption, labelCv, captionCv: null, headY, tabletRest: { y: 0, z: 0, rx: 0 }, roleText, hd };
}

function aaCountObject(obj) {
  let meshes = 0, sprites = 0, triangles = 0;
  obj?.traverse?.((o) => {
    if (o.isSprite) { sprites += 1; triangles += 2; return; }
    if (!o.isMesh) return;
    meshes += 1;
    const geo = o.geometry; const n = geo?.index?.count ?? geo?.attributes?.position?.count ?? 0;
    triangles += Math.floor(n / 3);
  });
  return { meshes, sprites, triangles };
}

// ------------------------------------------------------------------ the mount

/**
 * Mount the agents' figures. `agents` follow the contract (OMEGA-HIVE's OH_AGENTS shape: id, name, role, homeSite,
 * avatar { glyph, accent, outfit }); `source` is anything with on(type, fn) (or an array of them); `siteAt(siteId)`
 * answers this map's site position ({ x, y, z } / [x, z] / null when the site is not on this map). `here` passed to
 * animate is the learner's [x, z] (null = everyone near). Headless without `three`: the state machine still runs.
 */
export function aaMountAgentAvatars({ three = null, parent = null, agents = [], source = null, siteAt = () => null, reducedMotion = false, tier = "high", groundAt = null, spotFor = null, textureScale = 1, blocked = null, route = null, hd = false, voiced = null, now = null, hdFor = null, triCap = null, capFigures = 1, moodOf = null } = {}) {
  const T = three;
  const build = !!(T && parent && AA_TIERS[tier] !== false);
  // AVATARS-HD: the high-detail figure is opt-in (the outdoor mount asks for it) and only ever on the desktop "high" tier; balanced
  // keeps today's figure and the phone tier builds none. A three.js without skinning (the checkers' stub) builds today's figure.
  const hdOn = !!(hd && build && tier === "high" && aaHdSupported(T));
  const hdLevel = typeof hd === "string" && AA_HD_LOD[hd] ? hd : "full"; // AVATARS-HD-2: the robotics rooms ask for "room"; AVATARS-HD-3: the ops room for "crowd"
  // AVATARS-HD-4: a level per agent (the ops room's nearest console at the room level); null or an unknown level keeps hdLevel
  const levelOf = (agent) => { if (typeof hdFor !== "function") return hdLevel; let l = null; try { l = hdFor(agent); } catch (_) { l = null; } return typeof l === "string" && AA_HD_LOD[l] ? l : hdLevel; };
  // AVATARS-HD-3: the page's clock in ms (performance.now), so a word boundary keeps its own time between frames
  const nowMs = typeof now === "function" ? now : () => (typeof performance !== "undefined" && typeof performance.now === "function" ? performance.now() : NaN);
  let frameMs = NaN; // nowMs() at the last frame (animate)
  const root = build ? new T.Group() : null;
  if (root) { root.name = "aa-agent-avatars"; parent.add(root); }
  const figures = new Map();
  const occupied = new Map(); // siteId -> Set(slot index)
  const talkLog = [], captionLog = [], gestureLog = [], moodLog = [], heldLog = [];
  let clock = 0, textureBytes = 0;
  const sources = new Set();
  const subs = new Map();

  const sitePt = (id) => { if (!id) return null; let p = null; try { p = aaSitePoint(siteAt(id)); } catch (_) { p = null; } return p; };
  const isBlocked = (x, z) => { if (typeof blocked !== "function") return false; try { return !!blocked(x, z); } catch (_) { return false; } };
  function takeSlot(siteId, agentIndex) {
    const used = occupied.get(siteId) ?? new Set();
    const c = typeof blocked === "function" ? sitePt(siteId) : null; // a slot inside a building is skipped while another is free
    const clear = (s) => !c || !isBlocked(c.x + AA_SLOTS[s][0], c.z + AA_SLOTS[s][1]);
    let i = -1; const start = agentIndex % AA_SLOTS.length;
    for (let k = 0; k < AA_SLOTS.length && i < 0; k += 1) { const s = (start + k) % AA_SLOTS.length; if (!used.has(s) && clear(s)) i = s; }
    for (let k = 0; k < AA_SLOTS.length && i < 0; k += 1) { const s = (start + k) % AA_SLOTS.length; if (!used.has(s)) i = s; }
    if (i < 0) i = 0;
    used.add(i); occupied.set(siteId, used); return i;
  }
  /** A walk from `from` to the spot `to`: along route()'s waypoints when it answers, else straight. */
  function walkPlan(from, to) {
    let pts = null;
    if (typeof route === "function") { try { const r = route({ x: from.x, z: from.z }, { x: to.x, z: to.z }); if (Array.isArray(r) && r.length) pts = [{ x: from.x, z: from.z }, ...r.map((q) => ({ x: +q.x, z: +q.z }))]; } catch (_) { pts = null; } }
    if (!pts || pts.length < 2 || pts.some((q) => !Number.isFinite(q.x) || !Number.isFinite(q.z))) return { from: { x: from.x, y: from.y, z: from.z }, to, start: clock, dur: Math.hypot(to.x - from.x, to.z - from.z) / AA_WALK_SPEED };
    pts[pts.length - 1] = { x: to.x, z: to.z };
    const cum = [0]; for (let i = 1; i < pts.length; i += 1) cum.push(cum[i - 1] + Math.hypot(pts[i].x - pts[i - 1].x, pts[i].z - pts[i - 1].z));
    return { from: { x: from.x, y: from.y, z: from.z }, to, start: clock, dur: Math.max(1e-3, cum[cum.length - 1] / AA_WALK_SPEED), pts, cum, routed: pts.length > 2 };
  }
  const freeSlot = (siteId, i) => occupied.get(siteId)?.delete(i);
  function spotAt(siteId, slot, agent = null) {
    if (typeof spotFor === "function" && agent && siteId) { // a fixed spot (a room's agent spot) wins over the slots
      let o = null; try { o = spotFor(agent, siteId); } catch (_) { o = null; }
      if (o && Number.isFinite(+o.x) && Number.isFinite(+o.z)) return { x: +o.x, y: Number.isFinite(+o.y) ? +o.y : 0, z: +o.z, cx: +o.x, cz: +o.z, yaw: Number.isFinite(+o.yaw) ? +o.yaw : 0, fixed: true };
    }
    const c = sitePt(siteId); if (!c) return null;
    const [dx, dz] = AA_SLOTS[slot]; const x = c.x + dx, z = c.z + dz;
    const y = groundAt ? Number(groundAt(x, z)) || c.y : c.y;
    return { x, y, z, cx: c.x, cz: c.z, yaw: Math.atan2(c.x - x, c.z - z) };
  }

  /** AVATARS-HD-4: the triangles under the parent (the room's group), counted as ixrMeasure counts them. */
  function parentTris() {
    let n = 0;
    parent?.traverse?.((o) => { if (!o.isMesh) return; const g = o.geometry, c = g?.index ? g.index.count : g?.attributes?.position?.count ?? 0; n += (c / 3) * (o.isInstancedMesh ? o.count : 1); });
    return n;
  }
  /** AVATARS-HD-4: the level this figure gets under the room's cap (triCap): its own level when it fits, else the crowd level, else null
   * (no figure for now). Without a cap, its own level. */
  function capLevel(f, want) {
    if (!(Number(triCap) > 0)) return want;
    const used = parentTris(), spec = f.spec ??= aaHdSpec(f.agent);
    const built = [...figures.values()].filter((g) => g.fig).length, rest = Math.max(0, (Number(capFigures) || 1) - built - 1) * AA_HD_CROWD_BUDGET.triangles;
    const tri = (l) => { try { return aaHdGeometry(spec, l).triangles.total; } catch (_) { return Infinity; } };
    if (want !== "crowd" && used + tri(want) + rest <= triCap) return want; // its own level, with room left for the figures still to come
    if (used + tri("crowd") <= triCap) return "crowd";
    return null;
  }
  function ensureFig(f) {
    if (!build || f.fig) return;
    let lvl = hdOn ? levelOf(f.agent) : null;
    if (hdOn) { lvl = capLevel(f, lvl); if (!lvl) { if (!f.held) { f.held = true; heldLog.push({ agent: f.agent.id, at: clock, site: f.site }); } return; } f.held = false; }
    f.fig = hdOn ? aaBuildHdFigure(T, f.agent, f.look, textureScale, lvl) : aaBuildFigure(T, f.agent, f.look, textureScale);
    f.fig.group.position.set(f.x, f.y, f.z); f.fig.group.rotation.y = f.yaw; f.fig.group.visible = f.visible;
    root.add(f.fig.group);
    if (f.fig.labelCv) textureBytes += f.fig.labelCv.c.width * f.fig.labelCv.c.height * 4;
  }

  function addAgents(list) {
    for (const a of list ?? []) {
      if (!a?.id || figures.has(a.id)) continue;
      const look = aaAgentLook(a);
      const idx = figures.size;
      const site = a.homeSite ?? null;
      const slot = site ? takeSlot(site, idx) : 0;
      const spot = site ? spotAt(site, slot, a) : null;
      const hh = aaHash(a.id);
      const f = { agent: a, look, idx, site, slot, x: spot?.x ?? 0, y: spot?.y ?? 0, z: spot?.z ?? 0, yaw: spot?.yaw ?? 0, offMap: !spot,
        walk: null, queue: [], talk: null, caption: null, gesture: null, visible: !!spot, fig: null,
        walkPhase: 0, mood: null, idleK: 1, idleOff: 0, blinkPeriod: 3.2 + (hh % 200) / 100, blinkOff: ((hh >>> 8) % 300) / 100, mouth: 0 };
      if (spot) ensureFig(f); // an agent whose site is on another map gets its figure when it first arrives here
      figures.set(a.id, f);
      seedMood(f); // AVATARS-HD-5: an agent added mid-day stands in the mood its hive already has
    }
    return figures.size;
  }

  // ---- talk and captions
  function showCaption(f, text, start, end, kind) {
    f.caption = { text: String(text ?? ""), start, end, kind };
    captionLog.push({ agent: f.agent.id, text: f.caption.text, start, end, kind });
    const cap = f.fig?.caption;
    if (cap) {
      if (!f.fig.captionCv) {
        f.fig.captionCv = aaCanvas(AA_CAPTION_PX[0], AA_CAPTION_PX[1], textureScale);
        if (f.fig.captionCv && T.CanvasTexture) { cap.material.map = new T.CanvasTexture(f.fig.captionCv.c); cap.material.needsUpdate = true; textureBytes += f.fig.captionCv.c.width * f.fig.captionCv.c.height * 4; }
      }
      if (f.fig.captionCv) { aaDrawCaption(f.fig.captionCv, f.caption.text, f.look.accent); if (cap.material.map) cap.material.map.needsUpdate = true; }
      cap.userData.text = f.caption.text; cap.visible = true;
    }
  }
  /** AVATARS-HD-2: does an on-device voice hold this line of the agent (the page's `voiced`, the voice controller's `pending`)? */
  const voicedFor = (f, text) => { if (typeof voiced !== "function") return false; try { return voiced(f.agent.id, text) === true; } catch (_) { return false; } };
  const wordsFrom = (text, ms) => aaWordOnsets(text, ms).map((w) => ({ at: clock + w.at / 1000, dur: w.dur / 1000, char: w.char }));
  /** The light and the mouth are on: the line has started (a voiced line waits for its onstart) and has not ended. */
  const talkOn = (f) => !!(f.talk && !f.talk.wait && clock >= f.talk.start && (f.talk.voiced || clock < f.talk.end));
  function startNextLine(f, prevEnd) {
    const next = f.queue.shift(); if (!next) return false;
    const start = Math.max(next.at, prevEnd ?? next.at); // a queued line follows the last one exactly, never before it arrived
    // AVATARS-HD: the caption's word timing (onsets spread over the line's window) drives the mouth until a voice takes the line
    const words = aaWordOnsets(next.text, next.ms).map((w) => ({ at: start + w.at / 1000, dur: w.dur / 1000, char: w.char }));
    // AVATARS-HD-2: a line an on-device voice holds waits for the voice's onstart (the caption shows now, the light and mouth then)
    const wait = !next.unvoiced && voicedFor(f, next.text);
    f.talk = { text: next.text, start, end: start + next.ms / 1000, ms: next.ms, voiced: false, wait, jobId: next.jobId ?? null, words, bw: null, log: null };
    f.talk.log = { agent: f.agent.id, text: next.text, start, end: f.talk.end, ...(wait ? { waited: true } : {}) };
    talkLog.push(f.talk.log);
    showCaption(f, next.caption ?? next.text, start, f.talk.end, "speak");
    if (f.fig) f.fig.parts.talk.visible = !wait;
    return true;
  }
  /** AVATARS-HD-2: the voice let a waiting line go without starting it: the clock drives it from now (light, mouth, caption). */
  function unwait(f) {
    const tk = f.talk; tk.wait = false; tk.start = clock; tk.end = clock + tk.ms / 1000; tk.words = wordsFrom(tk.text, tk.ms);
    tk.log.start = clock; tk.log.end = tk.end; tk.log.clock = true;
    if (f.caption) f.caption.end = Math.max(f.caption.end, tk.end);
    if (f.fig) f.fig.parts.talk.visible = true;
  }
  function tickTalk(f) {
    if (f.talk?.wait && !voicedFor(f, f.talk.text)) unwait(f);
    if (f.talk && !f.talk.voiced && !f.talk.wait && clock >= f.talk.end) {
      const end = f.talk.end; f.talk = null;
      if (f.fig) f.fig.parts.talk.visible = false;
      if (f.queue.length) startNextLine(f, end);
    }
    if (f.caption && clock >= f.caption.end && !(f.talk && (f.talk.voiced || f.talk.wait))) { f.caption = null; if (f.fig) { f.fig.caption.visible = false; f.fig.caption.userData.text = ""; } }
  }
  /** AVATARS-HD-2: the agent's line a voice names: the current one, or a later queued one brought forward (the lines before it end
   * now: the voice has moved on); null when the line is not here (a voice that never reaches this mount's lines). No text: current. */
  function lineFor(f, text) {
    if (text == null) return f.talk;
    const want = String(text).trim();
    if (f.talk?.text === want) return f.talk;
    const i = f.queue.findIndex((q) => q.text === want);
    if (i < 0) return null;
    if (f.talk) { f.talk.log.end = Math.min(f.talk.log.end, clock); f.talk = null; }
    f.queue.splice(0, i);
    startNextLine(f, clock);
    return f.talk;
  }
  function talkStart(id, text = null) {
    const f = figures.get(id); const tk = f ? lineFor(f, text) : null; if (!tk) return false;
    if (!tk.voiced) { // AVATARS-HD: the voice starts now, so the mouth's word timing restarts from now at the voice's rate
      if (tk.wait) { tk.start = clock; tk.log.start = clock; } // AVATARS-HD-2: the light and the mouth start at onstart
      tk.voiced = true; tk.wait = false;
      const rate = Number(f.agent.voice?.rate) > 0 ? Number(f.agent.voice.rate) : 1;
      tk.words = wordsFrom(tk.text, aaLineMs(tk.text) / rate);
    }
    if (f.fig) f.fig.parts.talk.visible = true;
    return true;
  }
  /** AVATARS-HD: a voice's word boundary (SpeechSynthesisUtterance onboundary, `charIndex`): the mouth opens on this word now. Once a
   * line has had a boundary the mouth follows the boundaries only. AVATARS-HD-2: each word lasts as long as the voice's own pace says
   * (aaBoundaryWordSec), so the mouth closes between words. */
  function talkWord(id, charIndex = null, text = null, atMs = null) {
    const f = figures.get(id); let tk = f ? lineFor(f, text) : null; if (!tk) return false;
    if (tk.wait) { talkStart(id, text); tk = f.talk; } // a boundary before onstart: the voice has started
    if (!tk.bw) tk.bw = [];
    const est = tk.words ?? [], ci = Number.isFinite(charIndex) ? charIndex : null;
    const w = est.find((x) => x.char === ci) ?? est[tk.bw.length] ?? null, c0 = ci ?? w?.char ?? null;
    const nextChar = c0 == null ? null : est.find((x) => x.char > c0)?.char ?? tk.text.length + 1;
    const sec = aaBoundaryWordSec(tk.bw, c0 == null ? 5 : nextChar - c0);
    tk.bw.push({ at: stampOf(atMs, tk), dur: sec * AA_BOUNDARY_FILL, char: c0 });
    f.mouthClock = NaN; // the next state() reads the mouth afresh
    return true;
  }
  function talkEnd(id, text = null) {
    const f = figures.get(id); if (!f) return false;
    if (text != null && f.talk?.text !== String(text).trim()) { // AVATARS-HD-2: a later line the voice ended unstarted runs on the clock
      const q = f.queue.find((x) => x.text === String(text).trim() && !x.unvoiced); if (!q) return false; q.unvoiced = true; return true;
    }
    const tk = f.talk; if (!tk) return false;
    if (tk.wait) { unwait(f); return true; } // AVATARS-HD-2: the voice let it go unspoken (turned off, the page hidden): the clock drives it
    tk.voiced = false; tk.end = clock; tk.log.end = clock; if (f.caption) f.caption.end = clock; tickTalk(f); return true;
  }

  // ---- the events
  /** Start a gesture and log it with the event that raised it. The latest event wins, except that a refusal's stop hand is never
   * cut short by a bid's raise or an award's accept: that one waits and follows the stop (at most one waits; a newer one
   * replaces it). */
  function gesture(f, kind, ev, extra = {}) {
    const on = ev?.type === "speak" ? ev.about ?? "speak" : ev?.type ?? null, ms = (AA_GESTURE_MS[kind] ?? 1000) / 1000;
    const cur = f.gesture && clock < f.gesture.end ? f.gesture : null;
    if (cur?.kind === "stop" && (kind === "raise" || kind === "accept")) {
      if (f.nextGesture) f.nextGesture.entry.dropped = true; // a newer one replaces the one waiting
      const entry = { agent: f.agent.id, kind, start: cur.end, end: cur.end + ms, on, jobId: ev?.jobId ?? null, queued: true, ...extra };
      f.nextGesture = { kind, ms, entry }; gestureLog.push(entry);
      return;
    }
    if (f.nextGesture && kind !== "raise" && kind !== "accept") { f.nextGesture.entry.dropped = true; f.nextGesture = null; } // a newer stop or nod
    f.gesture = { kind, start: clock, end: clock + ms };
    gestureLog.push({ agent: f.agent.id, ...f.gesture, on, jobId: ev?.jobId ?? null, ...extra });
    poseGesture(f);
  }
  function handle(ev) {
    if (!ev?.type) return false;
    const f = figures.get(aaAgentId(ev.agent)); if (!f) return false;
    if (ev.type === AA_MOOD_EVENT) return setMood(f, ev);
    if (ev.type === "speak") {
      const text = String(ev.text ?? ev.caption ?? "").trim(); if (!text) return false;
      tickTalk(f);
      f.queue.push({ text, at: clock, caption: ev.caption && ev.caption !== ev.text ? String(ev.caption) : null, ms: Number(ev.ms) > 0 ? Number(ev.ms) : aaLineMs(text), jobId: ev.jobId });
      if (!f.talk) startNextLine(f, clock);
      if (ev.about === "approved") gesture(f, AA_GESTURE_FOR.approved, ev); // the learner's approval: the agent who relays it nods
      return true;
    }
    if (ev.type === "move") { moveTo(f, ev.to); return true; }
    if (ev.type === "refused") {
      gesture(f, AA_GESTURE_FOR.refused, ev, { reason: ev.reason ?? null });
      const t = ev.caption ?? ev.text ?? (ev.reason ? `Stopped: ${ev.reason}` : null);
      if (t && !f.talk) showCaption(f, t, clock, clock + Math.max(AA_GESTURE_MS.stop, aaLineMs(t)) / 1000, "refused");
      return true;
    }
    if (ev.type === "complete") { gesture(f, AA_GESTURE_FOR.complete, ev); return true; }
    if (ev.type === "bid" || ev.type === "award") gesture(f, AA_GESTURE_FOR[ev.type], ev); // a raised hand to bid; a hand to the chest to accept
    if ((ev.type === "approval-request" || ev.type === "award" || ev.type === "dispatch" || ev.type === "bid") && ev.caption && !f.talk) {
      showCaption(f, ev.caption, clock, clock + aaLineMs(ev.caption) / 1000, ev.type); return true;
    }
    return ev.type === "bid" || ev.type === "award";
  }

  /** AVATARS-HD-4: the agent's mood (HIVE-6's event), for the posture; logged with its cause. The idle clock keeps its phase across a
   * tempo change (busy), so the figure never jumps. */
  function setMood(f, ev, seeded = false) {
    const mood = String(ev.mood ?? ""); if (!AA_HD_MOODS.includes(mood)) return false;
    const k = hdOn ? aaHdMoodTempo(f.fig?.hd?.spec ?? (f.spec ??= aaHdSpec(f.agent)), mood) : 1;
    if (k !== f.idleK) { f.idleOff += clock * (f.idleK - k); f.idleK = k; }
    f.mood = { mood, cause: ev.cause ?? null, at: clock, ...(seeded ? { seeded: true } : {}) };
    if (!seeded) moodLog.push({ agent: f.agent.id, mood, from: ev.from ?? null, cause: ev.cause ?? null, at: clock, t: ev.t ?? null });
    if (f.fig?.hd) poseHd(f);
    return true;
  }
  /** AVATARS-HD-5: a figure without a mood yet takes the one its hive already has (the `moodOf(id)` option, else aaMoodOf over the
   * attached sources); not logged as an event (moodLog stays the hive's own mood events). */
  function seedMood(f) {
    if (f.mood) return false;
    let m = null;
    if (typeof moodOf === "function") { try { m = moodOf(f.agent.id); } catch (_) { m = null; } m = typeof m === "string" ? { mood: m } : m; }
    if (!m?.mood) for (const s of sources) { m = aaMoodOf(s, f.agent.id); if (m) break; }
    return m?.mood ? setMood(f, { mood: m.mood, cause: m.cause ?? null }, true) : false;
  }

  function moveTo(f, siteId) {
    if (!siteId) return;
    const prevSite = f.site, prevSlot = f.slot;
    if (prevSite === siteId && !f.offMap) return;
    if (prevSite) freeSlot(prevSite, prevSlot);
    const slot = takeSlot(siteId, f.idx);
    const spot = spotAt(siteId, slot, f.agent);
    f.site = siteId; f.slot = slot;
    if (!spot) { f.offMap = true; f.walk = null; f.visible = false; if (f.fig) f.fig.group.visible = false; return; }
    const dist = Math.hypot(spot.x - f.x, spot.z - f.z);
    if (!reducedMotion && !f.offMap && dist > AA_WALK_MAX) { // re-project short of the spot, then walk in
      const ux = (f.x - spot.x) / dist, uz = (f.z - spot.z) / dist; let sx = spot.x + ux * AA_WALK_IN, sz = spot.z + uz * AA_WALK_IN;
      if (isBlocked(sx, sz)) { // a start clear of buildings: further or nearer on the same bearing, then turning round the spot
        search: for (const deg of [0, 20, -20, 40, -40, 60, -60, 90, -90, 120, -120, 150, -150, 180]) {
          const a = (deg * Math.PI) / 180, vx = ux * Math.cos(a) - uz * Math.sin(a), vz = ux * Math.sin(a) + uz * Math.cos(a);
          for (const d of [AA_WALK_IN, 28, 20, 32, 16, 36, 12, 40]) { const x = spot.x + vx * d, z = spot.z + vz * d; if (!isBlocked(x, z)) { sx = x; sz = z; break search; } }
        }
      }
      f.x = sx; f.z = sz; f.y = spot.y;
      f.walk = { ...walkPlan({ x: f.x, y: f.y, z: f.z }, spot), reprojected: true };
      if (f.fig) f.fig.group.position.set(f.x, f.y, f.z);
      return;
    }
    if (reducedMotion || f.offMap || dist < 0.05) {
      f.offMap = false; f.walk = null; f.x = spot.x; f.y = spot.y; f.z = spot.z; f.yaw = spot.yaw; f.visible = true;
      ensureFig(f);
      if (f.fig) { f.fig.group.position.set(f.x, f.y, f.z); f.fig.group.rotation.y = f.yaw; f.fig.group.visible = true; }
      return;
    }
    f.walk = walkPlan({ x: f.x, y: f.y, z: f.z }, spot);
  }

  function poseGesture(f) {
    const fig = f.fig; if (!fig) return;
    if (fig.hd) { poseHd(f); return; }
    const tab = fig.parts.tablet, head = fig.parts.head, r = fig.tabletRest;
    const g = f.gesture && clock < f.gesture.end ? f.gesture : null;
    if (g?.kind === "stop") { tab.position.y = r.y + 0.32; tab.position.z = r.z + 0.12; tab.rotation.x = 0; }
    else { tab.position.y = r.y; tab.position.z = r.z; tab.rotation.x = r.rx; }
    if ((g?.kind === "nod" || g?.kind === "approve") && !reducedMotion) head.rotation.x = Math.sin(((clock - g.start) / (g.end - g.start)) * Math.PI) * 0.35;
    else head.rotation.x = 0;
  }
  /** AVATARS-HD-3: a boundary's time on the mount's clock: the event's own time (atMs, else now() as it arrives) measured from the last
   * frame, never before the line started and never more than 2 s after the last frame (a stray timestamp falls back to the frame). */
  function stampOf(atMs, tk) {
    const ms = Number.isFinite(atMs) ? Number(atMs) : nowMs();
    const d = Number.isFinite(ms) && Number.isFinite(frameMs) ? (ms - frameMs) / 1000 : 0;
    const at = Math.abs(d) <= 2 ? clock + d : clock;
    return Math.max(at, tk?.start ?? -Infinity, tk?.bw?.length ? tk.bw[tk.bw.length - 1].at : -Infinity);
  }
  /** AVATARS-HD-3: the mouth this frame. As mouthAt, but when the newest word's opening has passed between two frames without being shown
   * (about one frame a second), this frame shows that word open (AA_MOUTH_CATCHUP): at a normal frame rate every word is seen open on its
   * own (only a frame within a few ms of a word's onset, before the mouth reaches 15%, shows it open a frame early). */
  function mouthShown(f) {
    const m = mouthAt(f), tk = f.talk;
    if (!tk || m === 0 && (tk.wait || clock < tk.start || (!tk.voiced && clock >= tk.end))) return m;
    const on = tk.bw?.length ? tk.bw : tk.words ?? [];
    let n = -1; for (let i = 0; i < on.length; i += 1) { if (on[i].at <= clock) n = i; else break; }
    const key = tk.bw?.length ? "seenB" : "seenW";
    if (n < 0) return m;
    if (m >= AA_MOUTH_SEEN) { tk[key] = n; return m; }
    // a word not yet seen open (its opening passed between frames, or this frame is at its very edge)
    if (n > (tk[key] ?? -1) && !reducedMotion) { tk[key] = n; tk.caught = (tk.caught ?? 0) + 1; return AA_MOUTH_CATCHUP; }
    return m;
  }
  /** AVATARS-HD: the mouth's openness now (0 while silent; held half open, still, under reduced motion). */
  function mouthAt(f) {
    const tk = f.talk; if (!tk || tk.wait || clock < tk.start || (!tk.voiced && clock >= tk.end)) return 0;
    if (reducedMotion) return 0.55;
    return aaHdMouth(tk.bw?.length ? tk.bw : tk.words ?? [], clock);
  }
  /** AVATARS-HD: the high figure's whole pose for this moment — posture from its traits, walking, the mouth and beat hands with
   * the words, a blink, and the gesture the hive's last event raised (aa-agent-hd.js aaHdPose). */
  function poseHd(f) {
    const fig = f.fig, g = f.gesture && clock < f.gesture.end ? f.gesture : null;
    const m = f.mouthClock === clock ? f.mouth : mouthAt(f), ph = (clock + f.blinkOff) % f.blinkPeriod;
    const tIdle = f.idleK === 1 && f.idleOff === 0 ? clock : clock * f.idleK + f.idleOff; // AVATARS-HD-4: busy's tempo, phase kept
    fig.hd.apply(aaHdPose(fig.hd.spec, { t: tIdle, ...(f.mood && f.mood.mood !== "calm" ? { mood: f.mood.mood } : {}), walking: !!f.walk, walkPhase: f.walkPhase, speaking: talkOn(f), mouth: m, beat: m,
      gesture: g ? { kind: g.kind, k: (clock - g.start) / Math.max(1e-6, g.end - g.start) } : null, blink: ph < 0.14 ? Math.sin((ph / 0.14) * Math.PI) : 0, reduced: reducedMotion }));
  }

  function animate(t, dt = 0, here = null) {
    clock = Number.isFinite(t) ? t : clock + (dt || 0);
    frameMs = nowMs();
    for (const s of sources) s.poll?.();
    for (const f of figures.values()) {
      tickTalk(f);
      if (f.gesture && clock >= f.gesture.end) {
        const prevEnd = f.gesture.end; f.gesture = null;
        if (f.nextGesture) { // the gesture that waited behind a stop hand starts where the stop ended
          const n = f.nextGesture; f.nextGesture = null;
          f.gesture = { kind: n.kind, start: prevEnd, end: prevEnd + n.ms }; n.entry.start = prevEnd; n.entry.end = prevEnd + n.ms;
          if (clock >= f.gesture.end) f.gesture = null;
        }
      }
      if (f.walk) {
        const w = f.walk, k = aaClamp((clock - w.start) / w.dur, 0, 1);
        if (w.pts) { // along the route's legs, at the same speed
          const d = k * w.cum[w.cum.length - 1]; let i = 1; while (i < w.cum.length - 1 && w.cum[i] < d) i += 1;
          const a = w.pts[i - 1], b = w.pts[i], u = aaClamp((d - w.cum[i - 1]) / ((w.cum[i] - w.cum[i - 1]) || 1), 0, 1);
          f.x = a.x + (b.x - a.x) * u; f.z = a.z + (b.z - a.z) * u; f.y = w.from.y + (w.to.y - w.from.y) * k;
          f.yaw = Math.atan2(b.x - a.x, b.z - a.z);
          // AVATARS-HD-4: the heading turns through a bend over the last and first AA_WALK_TURN m of the legs that meet there (the path
          // itself, and so its clearance from the boxes, is unchanged): no snap at the waypoint.
          const toEnd = w.cum[i] - d, fromStart = d - w.cum[i - 1];
          const turn = (p, q, r, u2) => { const y0 = Math.atan2(q.x - p.x, q.z - p.z), y1 = Math.atan2(r.x - q.x, r.z - q.z); let dy = y1 - y0; dy -= Math.round(dy / (2 * Math.PI)) * 2 * Math.PI; return y0 + dy * u2; };
          if (i < w.pts.length - 1 && toEnd < AA_WALK_TURN) f.yaw = turn(a, b, w.pts[i + 1], 0.5 * (1 - toEnd / AA_WALK_TURN));
          else if (i > 1 && fromStart < AA_WALK_TURN) f.yaw = turn(w.pts[i - 2], a, b, 0.5 + 0.5 * (fromStart / AA_WALK_TURN));
        } else {
          f.x = w.from.x + (w.to.x - w.from.x) * k; f.z = w.from.z + (w.to.z - w.from.z) * k; f.y = w.from.y + (w.to.y - w.from.y) * k;
          f.yaw = Math.atan2(w.to.x - w.from.x, w.to.z - w.from.z);
        }
        if (k >= 1) { f.walk = null; f.yaw = w.to.yaw; }
        // AVATARS-HD: the stride's phase (a careful agent's cadence is a little slower; the travel speed is the same for all)
        if (!reducedMotion) f.walkPhase += (Number(dt) || 0) * Math.PI * 2 * 1.8 * (1.1 - 0.25 * (Number(f.agent.traits?.caution) || 0.5));
      }
      f.mouth = mouthShown(f); f.mouthClock = clock;
      if (!f.fig) continue;
      const d = here ? Math.hypot(here[0] - f.x, here[1] - f.z) : 0;
      const vis = !f.offMap && d <= AA_HIDE_RADIUS;
      f.visible = vis; f.fig.group.visible = vis;
      if (!vis || d > AA_ANIMATE_RADIUS) continue;
      // property writes, within GRIOT's animate radius only
      const bob = f.walk && !reducedMotion ? Math.abs(Math.sin(clock * 7)) * 0.04 : 0;
      f.fig.group.position.set(f.x, f.y + bob, f.z); f.fig.group.rotation.y = f.yaw;
      const on = talkOn(f);
      const tk = f.fig.parts.talk; tk.visible = on;
      if (on && !f.fig.hd) { const s = reducedMotion ? 1 : 0.75 + 0.5 * Math.abs(Math.sin(clock * 11)); tk.scale.set(1, s, 1); } // the HD mouth opens with the words instead
      poseGesture(f);
    }
  }

  // ---- sources
  function attach(src) {
    for (const s of Array.isArray(src) ? src : [src]) {
      if (!s || typeof s.on !== "function" || sources.has(s)) continue;
      const fns = AA_EVENT_TYPES.map((type) => { const fn = (ev) => handle({ ...ev, type: ev?.type ?? type }); s.on(type, fn); return [type, fn]; });
      try { const fn = (ev) => handle({ ...ev, type: AA_MOOD_EVENT }); s.on(AA_MOOD_EVENT, fn); fns.push([AA_MOOD_EVENT, fn]); } catch (_) { /* a source without moods */ } // AVATARS-HD-4
      subs.set(s, fns); sources.add(s);
    }
    for (const f of figures.values()) seedMood(f); // AVATARS-HD-5
    return sources.size;
  }
  function detach(src) { const fns = subs.get(src); if (!fns) return; for (const [type, fn] of fns) { try { src.off?.(type, fn); } catch (_) { /* gone */ } } subs.delete(src); sources.delete(src); }

  addAgents(agents);
  if (source) attach(source);

  function counts() {
    let worst = 0, meshes = 0, sprites = 0, triangles = 0;
    for (const f of figures.values()) {
      if (!f.fig) continue;
      const c = aaCountObject(f.fig.group); worst = Math.max(worst, c.meshes + c.sprites); meshes += c.meshes; sprites += c.sprites; triangles += c.triangles;
    }
    return { figures: [...figures.values()].filter((f) => f.fig).length, agents: figures.size, meshes, sprites, triangles, worstPerFigure: worst, budget: AA_AGENT_BUDGET, textureBytes, tier, built: build,
      hd: [...figures.values()].filter((f) => f.fig?.hd).length, hdLevel: hdOn ? hdLevel : null,
      levels: [...figures.values()].reduce((o, f) => { const l = f.fig?.hd?.level; if (l) o[l] = (o[l] ?? 0) + 1; return o; }, {}) }; // AVATARS-HD-4
  }
  const stateOf = (f) => ({ id: f.agent.id, name: f.agent.name ?? f.agent.id, label: f.fig?.roleText ?? `software agent · ${aaRoleLabel(f.agent)}`, site: f.site, slot: f.slot, x: f.x, y: f.y, z: f.z, yaw: f.yaw, offMap: f.offMap, visible: f.visible, walking: !!f.walk, routed: !!f.walk?.routed,
    speaking: talkOn(f), waiting: !!f.talk?.wait, line: f.talk?.text ?? null, caption: f.caption?.text ?? null, gesture: f.gesture?.kind ?? null, queued: f.queue.length,
    talkVisible: f.fig ? !!f.fig.parts.talk.visible : null, captionVisible: f.fig ? !!f.fig.caption.visible : null, headPitch: f.fig ? f.fig.parts.head.rotation.x : null, tabletY: f.fig ? f.fig.parts.tablet.position.y : null,
    mouth: f.mouthClock === clock ? f.mouth : mouthAt(f), caughtUp: f.talk?.caught ?? 0, walkPath: f.walk ? { start: f.walk.start, pts: (f.walk.pts ?? [f.walk.from, f.walk.to]).map((q) => ({ x: q.x, z: q.z })) } : null, hd: !!f.fig?.hd, voiced: !!f.talk?.voiced, boundaries: f.talk?.bw?.length ?? 0,
    mood: f.mood?.mood ?? null, moodCause: f.mood?.cause ?? null, level: f.fig?.hd?.level ?? null, held: !!f.held }); // AVATARS-HD-4

  return {
    root, handle, animate, attach, detach, addAgents,
    agents: () => [...figures.values()].map(stateOf),
    state: (id) => { const f = figures.get(id); return f ? stateOf(f) : null; },
    figure: (id) => figures.get(id)?.fig?.group ?? null,
    /** An on-device voice can drive the talk light instead of the clock: start holds it on, end lets it go (talkStart above). */
    talkStart, talkWord, talkEnd,
    /** AVATARS-HD-3: the current line's word boundaries as stamped (the mount's clock, s). */
    boundaryLog: (id) => (figures.get(id)?.talk?.bw ?? []).map((b) => b.at),
    talkLog: () => talkLog.slice(), captionLog: () => captionLog.slice(), gestureLog: () => gestureLog.slice(), moodLog: () => moodLog.slice(), heldLog: () => heldLog.slice(),
    clock: () => clock, counts, sources: () => sources.size,
    /** HIVE-3: take one figure out (a visitor that has walked out of a robotics room): its meshes and canvases are disposed and
     * its slot freed; the agent stays listed, off the map, and gets a new figure when a move next brings it here. */
    release(id) {
      const f = figures.get(id); if (!f) return false;
      if (f.site != null) freeSlot(f.site, f.slot);
      f.site = null; f.walk = null; f.offMap = true; f.visible = false; f.talk = null; f.queue.length = 0; f.caption = null; f.gesture = null; f.nextGesture = null;
      if (f.fig) {
        const g = f.fig.group; g.parent?.remove(g);
        g.traverse((o) => { o.geometry?.dispose?.(); o.material?.map?.dispose?.(); o.material?.dispose?.(); });
        f.fig.hd?.skeleton?.dispose?.();
        for (const cv of [f.fig.labelCv, f.fig.captionCv]) if (cv?.c) textureBytes -= cv.c.width * cv.c.height * 4;
        f.fig = null;
      }
      f.held = false;
      for (const g of figures.values()) if (g.held && !g.offMap && build) ensureFig(g); // AVATARS-HD-4: a held agent gets its figure once one has gone
      return true;
    },
    dispose() { for (const s of [...sources]) detach(s); for (const f of figures.values()) f.fig?.hd?.skeleton?.dispose?.(); if (root) { root.parent?.remove(root); root.traverse((o) => { o.geometry?.dispose?.(); o.material?.map?.dispose?.(); o.material?.dispose?.(); }); } figures.clear(); },
  };
}

// ------------------------------------------------------------------ VBRIDGE: the four personas and their events

/** The four VBRIDGE personas (av-characters.js registry entries) as agents standing at `homeSite`. */
export function aaVbridgeAgents(homeSite = null) {
  return AA_VBRIDGE_PERSONAS.map((p) => ({ ...p, homeSite }));
}

const aaSiteName = (id) => RB_SITES.find((s) => s.id === id)?.name ?? String(id ?? "");

/**
 * The agent-jobs panel (vb-panel.js vbMountDispatch's api) as a contract source. poll() reads vbApi.state() and
 * emits what changed: a new job → the client asks and the governor checks (or refuses, with its own reason); the
 * supervisor's approval → the provider walks to the job's site and runs it; a supervisor's refusal → the provider
 * stops; the evaluation → the evaluator nods (completed) or stops (rejected, with the evaluation's reason). Every
 * fact in a line comes from the job. Reads only; the panel is never driven from here.
 */
export function aaVbridgeSource(vb, { siteName = aaSiteName } = {}) {
  const em = aaEmitter(); const log = [];
  let last = { id: null, phase: null, evaluated: false }, t = 0;
  function poll() {
    let st = null; try { st = vb?.state?.() ?? null; } catch (_) { st = null; }
    const job = st?.job; if (!job?.id) return 0;
    const out = [];
    const ev = (o) => out.push({ t: (t += 1), jobId: job.id, ...o });
    const short = String(job.id).replace(/^vbjob-/, "").slice(0, 6);
    const site = siteName(job.request?.siteId), task = VB_TASKS[job.request?.taskType]?.label ?? job.request?.taskType ?? "job";
    if (job.id !== last.id) {
      ev({ type: "speak", agent: "agent-client", text: `Job ${short}: ${task} at ${site}.` });
      if (job.governor?.decision === "refuse") {
        const why = job.governor.why ?? VB_REASONS.find((r) => r.id === job.governor.primary)?.text ?? job.governor.primary;
        ev({ type: "refused", agent: "agent-governor", reason: job.governor.primary, text: `Job ${short} refused: ${why}` });
      } else if (job.governor) ev({ type: "speak", agent: "agent-governor", text: `Job ${short} checked: allowed in the sim. The supervisor decides.` });
      last = { id: job.id, phase: job.phase, evaluated: false };
    }
    if (job.phase !== last.phase) {
      if (job.phase === "TRANSACTION") {
        ev({ type: "move", agent: "agent-provider", to: job.request.siteId });
        ev({ type: "speak", agent: "agent-provider", text: `Running job ${short} on the simulated robot at ${site}.` });
      }
      if (job.phase === "REJECTED" && job.approval && job.approval.approve === false) ev({ type: "refused", agent: "agent-provider", reason: "refused by the supervisor", text: `Job ${short} refused by the supervisor.` });
      last.phase = job.phase;
    }
    if (job.evaluation && !last.evaluated) {
      last.evaluated = true;
      if (job.evaluation.accepted) { ev({ type: "speak", agent: "agent-evaluator", text: `Job ${short} completed: ${job.evaluation.reason}.` }); ev({ type: "complete", agent: "agent-evaluator" }); }
      else ev({ type: "refused", agent: "agent-evaluator", reason: job.evaluation.reason, text: `Job ${short} not accepted: ${job.evaluation.reason}.` });
    }
    for (const e of out) { log.push(e); em.emit(e); }
    return out.length;
  }
  return { on: em.on, off: em.off, poll, events: () => log.slice() };
}
