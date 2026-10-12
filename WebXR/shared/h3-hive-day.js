// HIVE-3 — the hive's day, remembered, in two languages (console HIVE-3, docs/consoles/HIVE-3.md).
// SmartCiti.X Holodeck · Powered by AGI Corp.
//
// Four pieces over OMEGA-HIVE's hive (ohHive) and HIVE-IN-WORLD's robotics rooms. This module draws nothing and calls no
// network, voice, model or microphone; it reads the hive's own events and the page's own storage only.
//   1. Who stands in a robotics room (h3RoomPresence): the agents homed at the room's robot site, unless a job has sent them
//      elsewhere, and any agent the hive sends to that site for a job, until the job ends (completed, refused, vetoed or
//      declined). An agent whose last job has ended goes home. hw-hive-world.js stands them in the room: through the door to a
//      free agent spot, else a place by the door, and out through the door when they leave. At most H3_ROOM_FIGURES figures
//      are in a room at once (the cell hall's texture budget, measured with ixrMeasure, holds three; a fourth agent waits
//      outside until a figure has left).
//   2. Remembered settings (h3Settings): the hive panel's voice (on/off), "supervise every job" and the hive's language, kept
//      on this device under the signed-in profile's own namespace (profiles.js gtKeyFor: `h3-hive-settings-v1::id-<digest>`),
//      never uploaded, cleared on sign-out (auth.js signOut removes it). Demo, K-12 and signed-out sessions store nothing and
//      read nothing (the same gate the hive panel mounts behind: DATAWORKS' eligibility at the offer stage, and no ?demo).
//   3. The hive panel's text in Spanish (H3_PANEL_TEXT, h3PanelText, h3RoleIn, h3ChipIn): the panel's UI strings and the agents'
//      role sentences, picked by the hive's language like the agents' lines. English is unchanged. The Spanish is
//      machine-assisted and needs a native speaker's review (the platform's rule for every non-English table).
//   4. "A day in the hive" (H3_SCENE, h3SceneJobs, h3SceneHive): the scripted, seeded scene the parishes app plays on
//      sf-downtown for the reel (window.__parishTest.hiveScene()): a job arrives, the agents bid and one wins and walks out of
//      the cell hall's door to its site, the governor refuses one unsafe request (its reason captioned), and the learner
//      approves one job that names a robot (the simulated job runs; the physical path stays disabled).
//
// SEAMS (every top-level name carries the h3/H3_ prefix: the bundler shares one scope):
//   H3_ROOM_FIGURES                         3: figures a robotics room holds at once
//   h3RoomPresence({ agents, source })      -> { at(id), here(siteId), onChange(fn) -> off, jobsOf(id), dispose() }
//                                              onChange receives { agent, from, to, why: "move" | "job-ended", jobId, t }
//   H3_SETTINGS_KEY                         "h3-hive-settings-v1" (listed in profiles.js GT_PROFILE_KEYS)
//   h3SettingsAllowed({ signals, profile, demo })  -> { ok, reason }: may this session keep the hive's settings?
//   h3Settings({ storage, signals, profile, demo }) -> { allowed, reason, read(), write(patch), clear() }
//                                              read() -> { voice?, supervise?, lang? } ({} when not allowed or nothing stored)
//   H3_PANEL_TEXT                           { en: {...}, es: {...} }: every UI string of the hive panel
//   h3PanelText(lang)                       -> the table for that language (English for any other)
//   h3RoleIn(agent, lang) / h3ChipIn(chip, lang) -> the role sentence / a personality chip in that language
//   H3_SCENE                                the scene's beats (ids, start seconds, camera shot) and its duration
//   h3SceneJobs(seed)                       -> the scene's seeded job list (ohHive's `jobs` shape)
//   h3SceneHive(ohHive, { seed, audit })    -> a hive over those jobs (the caller hands in ohHive: no import cycle)

export const H3_ROOM_FIGURES = 3;

// ------------------------------------------------------------------------------------------------ 1. who is in a room

/**
 * The room-world's whereabouts of every agent: where the hive has it while it holds a job, and home otherwise. Read at once
 * from the hive (jobs() and agentState()), then kept in step with its award, move, complete and refused events.
 */
export function h3RoomPresence({ agents = [], source = null } = {}) {
  const home = new Map((agents ?? []).filter((a) => a?.id).map((a) => [a.id, a.homeSite ?? null]));
  const at = new Map(), jobs = new Map(), winnerOf = new Map();
  for (const id of home.keys()) jobs.set(id, new Set());
  try {
    const held = new Set((source?.pending?.() ?? []).filter((r) => r.reason === "supervise").map((r) => r.jobId));
    for (const j of source?.jobs?.() ?? []) {
      if (!j?.winner || !jobs.has(j.winner)) continue;
      if (j.status === "moving" || j.status === "running" || (j.status === "awaiting-approval" && held.has(j.jobId))) { jobs.get(j.winner).add(j.jobId); winnerOf.set(j.jobId, j.winner); }
    }
  } catch (_) { /* a source without jobs(): everyone starts at home */ }
  for (const [id, h] of home) {
    let s = null;
    if (jobs.get(id).size) { try { s = source?.agentState?.(id)?.site ?? null; } catch (_) { s = null; } }
    at.set(id, s ?? h);
  }
  const listeners = new Set();
  const set = (id, site, why, ev) => {
    const from = at.get(id) ?? null; if (from === site) return;
    at.set(id, site);
    for (const fn of [...listeners]) { try { fn({ agent: id, from, to: site, why, jobId: ev?.jobId ?? null, t: ev?.t ?? null }); } catch (_) { /* a listener never stops the others */ } }
  };
  const end = (id, jobId, ev) => { const js = jobs.get(id); if (!js) return; js.delete(jobId); if (!js.size) set(id, home.get(id) ?? null, "job-ended", ev); };
  const handlers = {
    award: (e) => { if (!jobs.has(e?.agent) || !e.jobId) return; jobs.get(e.agent).add(e.jobId); winnerOf.set(e.jobId, e.agent); },
    move: (e) => { if (!jobs.has(e?.agent) || !e.to) return; if (e.jobId) { jobs.get(e.agent).add(e.jobId); winnerOf.set(e.jobId, e.agent); } set(e.agent, e.to, "move", e); },
    complete: (e) => { if (e?.jobId) end(e.winner ?? winnerOf.get(e.jobId) ?? e.agent, e.jobId, e); },
    refused: (e) => { if (e?.jobId) end(e.winner ?? winnerOf.get(e.jobId) ?? e.agent, e.jobId, e); },
  };
  const subs = [];
  if (source && typeof source.on === "function") for (const [type, fn] of Object.entries(handlers)) { source.on(type, fn); subs.push([type, fn]); }
  return {
    at: (id) => at.get(id) ?? null,
    here: (siteId) => [...at.entries()].filter(([, s]) => s === siteId).map(([id]) => id),
    jobsOf: (id) => [...(jobs.get(id) ?? [])],
    onChange(fn) { if (typeof fn === "function") listeners.add(fn); return () => listeners.delete(fn); },
    dispose() { for (const [type, fn] of subs.splice(0)) { try { source.off?.(type, fn); } catch (_) { /* gone */ } } listeners.clear(); },
  };
}
