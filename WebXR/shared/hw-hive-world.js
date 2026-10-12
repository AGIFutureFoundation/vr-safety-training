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
//                                         re-mounted on a change (call it every frame and right after an enter)
//   hwFxDoorAt(fxDoor)                 -> { x, z, face } for ixrDoorsFor's doorAt (the door's outside spot), or null
//   hwReturnHash(style)                -> "ixr=<style>" for a robotics room (appended to a station link's return), else ""
//   hwRoomFromHash(hash, search?)      -> the ixr style a return asks to re-enter, or null

import { aaMountAgentAvatars } from "./aa-agent-avatars.js";
import { ixrAgentSpot, IXR_ROOMS } from "./ixr-robo-interiors.js";

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

/** Stand the room's agents at their spots, listening to the hive for captions (see the header). */
export function hwMountRoomAgents({ three = null, room = null, agents = [], source = null, tier = "high", reducedMotion = false, mount = aaMountAgentAvatars } = {}) {
  const siteId = hwRoomSiteId(room);
  if (!siteId || !room.group || typeof mount !== "function") return null;
  const placed = hwRoomAgents(room, agents);
  const at = new Map(placed.map((p) => [p.agent.id, p.spot]));
  const scale = HW_ROOM_TEXTURE_SCALE[tier] ?? 1;
  const avatars = placed.length ? mount({
    three, parent: room.group, agents: placed.map((p) => p.agent), source, tier, reducedMotion,
    siteAt: (id) => (id === siteId ? { x: 0, y: 0, z: 0 } : null), // any other site is off this room: the figure hides
    spotFor: (a, id) => { const s = id === siteId ? at.get(a.id) : null; return s ? { x: s.x, y: 0, z: s.z, yaw: hwFigureYaw(s.yaw) } : null; },
    textureScale: scale > 0 ? scale : 1,
  }) : null;
  return {
    room, siteId, placed, avatars,
    animate(t, dt) { avatars?.animate(t, dt, null); },
    counts() { return { agents: placed.length, spots: room.spots?.agent?.length ?? 0, ...(avatars?.counts() ?? { figures: 0, meshes: 0, sprites: 0, triangles: 0, textureBytes: 0 }) }; },
    dispose() { try { avatars?.dispose(); } catch (_) { /* the room's own exit already disposed the meshes */ } },
  };
}

/** Keep one mount for the room that is open now. */
export function hwSyncRoom(current, { room = null, three = null, agents = [], source = null, tier = "high", reducedMotion = false, mount = aaMountAgentAvatars } = {}) {
  if (current && current.room === room) return current;
  if (current) current.dispose();
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
