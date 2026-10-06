// ROBOPROG — the Holodeck Robotics & Human–Robot Collaboration Programme, functions (docs/consoles/ROBOPROG.md).
// SmartCiti.X Powered by AGI Corp.
//
// Seams (documented shapes):
//   rpTracks() -> RP_TRACKS; rpTrack(id) -> track | null; rpLevel(id) -> level | null
//   rpLadder(trackId, { stationIds }) -> [{ track, level, title, stations, robotStations, capstone, credential, earnable, loop }]
//     stationIds: a Set of catalog ids in this tree; an id not in it is dropped (pending), never a broken link.
//   rpCoverage({ stationIds }) -> { levels: [{ track, level, robot, total, covered }], byLevel: { level: { covered, of } }, covered, of }
//     The programme's eval: a level is covered when at least one of its own live stations (capstones not counted) is a robot
//     station (RP_ROBOT_STATIONS); an AI-training level also needs a loop station (demonstration collection or policy review).
//   rpLoop({ dx, col }) -> [{ ...RP_LOOP step, live }]   live when module `dx`/`col` exports the named function (guarded, no import)
//   rpTemplates({ stationIds }) -> [{ module (DEAN doc), track, level, credential, guide }]
//   rpSetUpCohort({ en, dn, stationIds }, { orgName, trackId, level, seats, startDate }) -> { org, cohort, module, classCode, due } | null
//   rpCredentialIds({ stationIds }) -> competency ids the ladders end in
// Only competency.js is imported, so the page and the checker load this without the engine.

import { COMPETENCY_BY_ID } from "./competency.js";
import { RP_NAME, RP_BRAND, RP_NO_PARTNERSHIP, RP_STANDARDS, RP_LEVELS, RP_ROBOT_STATIONS, RP_NEW_STATIONS, RP_GAP_STATIONS, RP_TELEOP_RECORDER, RP_TRACKS, RP_LOOP } from "./rp-programme-data.js";

export { RP_NAME, RP_BRAND, RP_NO_PARTNERSHIP, RP_STANDARDS, RP_LEVELS, RP_ROBOT_STATIONS, RP_NEW_STATIONS, RP_GAP_STATIONS, RP_TELEOP_RECORDER, RP_TRACKS, RP_LOOP };
export function rpTracks() { return RP_TRACKS; }
export function rpTrack(id) { return RP_TRACKS.find((t) => t.id === id) ?? null; }
export function rpLevel(id) { return RP_LEVELS.find((l) => l.id === id) ?? null; }
export function rpIsRobotStation(id) { return Object.prototype.hasOwnProperty.call(RP_ROBOT_STATIONS, id); }

const rpUniq = (a) => [...new Set(a)];
const rpHas = (set, id) => (set instanceof Set ? set.has(id) : Array.isArray(set) ? set.includes(id) : true);

/** The competency among `candidates` with the most stations in `stations` (ties: the order given). */
export function rpCredentialFor(stations, candidates) {
  let best = null;
  for (const id of candidates ?? []) {
    const c = COMPETENCY_BY_ID[id];
    if (!c) continue;
    const overlap = c.stations.filter((s) => stations.includes(s)).length;
    if (!best || overlap > best.overlap) best = { id, title: c.title, overlap, require: c.require, stillNeeded: Math.max(0, c.require - overlap) };
  }
  return best;
}

/** Capstone: the credential's own live stations not yet in the level, robot stations first, as many as the rule still needs. */
export function rpCapstone(credential, stations, stationIds = null) {
  const c = credential && COMPETENCY_BY_ID[credential.id];
  if (!c || !credential.stillNeeded) return [];
  const rest = c.stations.filter((s) => !stations.includes(s) && rpHas(stationIds, s));
  return [...rest.filter(rpIsRobotStation), ...rest.filter((s) => !rpIsRobotStation(s))].slice(0, credential.stillNeeded);
}

/** The guarded loop: a step is live only when the module handed in exports its function. */
/** ROBOTRAIN's gap coverage: which of the four gap stations are in the tree (`stationIds`), in a track level and a robot station. */
export function rpGapCoverage({ stationIds = null } = {}) {
  const inLevel = new Set(RP_TRACKS.flatMap((t) => Object.values(t.levels).flat()));
  const gaps = RP_GAP_STATIONS.map((g) => ({ ...g, inTree: !stationIds || stationIds.has(g.id), inLevel: inLevel.has(g.id), robot: g.id in RP_ROBOT_STATIONS }));
  return { gaps, covered: gaps.filter((g) => g.inTree && g.inLevel && g.robot).length, of: gaps.length };
}

/** The teleoperation recorder, live when the guarded module `rt` exports the named function (no import). */
export function rpRecorder({ rt = null } = {}) {
  let live = false; try { live = typeof rt?.[RP_TELEOP_RECORDER.fn] === "function"; } catch (_) { live = false; }
  return { ...RP_TELEOP_RECORDER, live };
}

export function rpLoop({ dx = null, col = null } = {}) {
  const mods = { "dx-data.js": dx, "col-learn.js": col };
  return RP_LOOP.map((s) => { let live = false; try { live = typeof mods[s.module]?.[s.fn] === "function"; } catch (_) { live = false; } return { ...s, live }; });
}

/** The five levels of one track (live ids only), each ending in a credential; the AI-training level carries the loop. */
export function rpLadder(trackId, opts = {}) {
  const t = rpTrack(trackId);
  if (!t) return [];
  return RP_LEVELS.map((l) => {
    const stations = rpUniq(t.levels[l.id] ?? []).filter((id) => rpHas(opts.stationIds, id));
    const pending = (t.levels[l.id] ?? []).filter((id) => !rpHas(opts.stationIds, id));
    const credential = rpCredentialFor(stations, t.credentials[l.id]);
    const capstone = rpCapstone(credential, stations, opts.stationIds);
    return { track: t.id, level: l.id, title: l.title, who: l.who, stations, pending, capstone, robotStations: stations.filter(rpIsRobotStation), loopStations: l.id === "ai-training" ? stations.filter((id) => RP_LOOP.some((x) => x.station === id)) : [],
      requiredScore: l.requiredScore, dueDays: l.dueDays, credential, earnable: !!credential && credential.overlap + capstone.length >= credential.require,
      loop: l.id === "ai-training" ? { scenario: t.scenario, steps: RP_LOOP.map((s) => s.id) } : null, collectsData: l.id === "ai-training" };
  });
}

/** The eval: robot-station coverage of every track × level. */
export function rpCoverage(opts = {}) {
  const levels = [];
  for (const t of RP_TRACKS) for (const lv of rpLadder(t.id, opts)) levels.push({ track: t.id, level: lv.level, robot: lv.robotStations.length, total: lv.stations.length, covered: lv.robotStations.length > 0 && (lv.level !== "ai-training" || lv.loopStations.length > 0) });
  const byLevel = Object.fromEntries(RP_LEVELS.map((l) => { const xs = levels.filter((x) => x.level === l.id); return [l.id, { covered: xs.filter((x) => x.covered).length, of: xs.length, robot: xs.reduce((a, x) => a + x.robot, 0) }]; }));
  return { levels, byLevel, covered: levels.filter((x) => x.covered).length, of: levels.length };
}

/** DEAN module templates: one per track and level, with an instructor guide. */
export function rpTemplates(opts = {}) {
  const out = [];
  for (const t of RP_TRACKS) {
    for (const lv of rpLadder(t.id, opts)) {
      const level = rpLevel(lv.level);
      const ids = [...lv.stations, ...lv.capstone];
      if (!ids.length) continue;
      const lessons = ids.map((id) => ({ kind: "station", id, world: "smartcity" }));
      const guide = {
        objectives: [`Practise ${t.title.toLowerCase()} work (${t.kinds}) at the ${level.title.toLowerCase()} level, from each station's cited sources.`,
          `Name the standards that apply (${t.standards.map((s) => RP_STANDARDS.find((x) => x.id === s)?.label.split(" — ")[0]).filter(Boolean).join(", ")}) and explain the practice in your own words; no clause is quoted.`,
          ...(lv.loop ? ["Run the demonstration → policy → evaluation loop on the robotics gym and say plainly what the policy is (behaviour cloning), what it was measured on and what it cannot do."] : [])],
        practice: ids.map((id) => ({ station: id, capstone: lv.capstone.includes(id), robot: rpIsRobotStation(id) })),
        loop: lv.loop ? RP_LOOP.map((s) => ({ step: s.id, title: s.title, station: s.station, what: s.what })) : [],
        debrief: lv.level === "aware"
          ? ["How did the robot know someone was near?", "Who is allowed to start a robot again after it stops?", "Which job on a robot team would you like to try?"]
          : ["Where was the safeguarded space, and what kept people out of it while the robot could move?", "What had to be true before anyone went in, and who checked it?", lv.loop ? "What did the evaluation measure, what did it not measure, and would you deploy this policy?" : "What would you tell a new operator about this cell on day one?"],
        consent: lv.collectsData ? "Collection is opt-in, adults only, never in K-12, demo or signed-out sessions; the data stays on the device and revoking deletes it (DATAWORKS)." : "This level collects no training data.",
        assessment: `Every station passed with a module score of ${level.requiredScore} or more. The level ends in the ${lv.credential?.id ?? "—"} competency — ${lv.credential?.require ?? 0} mastery runs, ${lv.credential?.overlap ?? 0} in the level${lv.capstone.length ? ` and ${lv.capstone.length} in the capstone` : ""} — and the cohort certificate.`,
      };
      out.push({ track: t.id, level: lv.level, dueDays: level.dueDays, credential: lv.credential, guide,
        module: { v: 1, kind: "module", id: `mod-rp-${t.id}-${lv.level}`, title: `${RP_NAME} · ${t.title} · ${level.title}`, lessons, due: null, requiredScore: level.requiredScore, assign: [] } });
    }
  }
  return out;
}

export function rpDueDate(start, days) {
  const d = new Date(`${/^\d{4}-\d{2}-\d{2}$/.test(start ?? "") ? start : new Date().toISOString().slice(0, 10)}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

/** A cohort on the org layer (no payment, seats a count) with the level's DEAN module assigned to its class code. */
export function rpSetUpCohort({ en, dn, stationIds = null }, { orgName, trackId, level = "operator", seats = 12, startDate = null } = {}) {
  const t = rpTrack(trackId);
  const tpl = rpTemplates({ stationIds }).find((x) => x.track === t?.id && x.level === level);
  if (!t || !tpl || !orgName) return null;
  // The org layer accepts only its registered programmes: the track's own competency programmes.
  const programmes = rpUniq([...(t.credentials[level] ?? []), ...Object.values(t.credentials).flat()]).filter((id) => COMPETENCY_BY_ID[id]);
  const org = en.enOrgs().find((o) => o.name === orgName) ?? en.enCreateOrg({ name: orgName, programmes });
  if (!org) return null;
  let cohort = null;
  for (const programme of programmes) { cohort = en.enCreateCohort({ orgId: org.id, name: `${t.title} · ${rpLevel(level).title}`, programme, edition: RP_NAME, startDate, seats }); if (cohort) break; }
  if (!cohort) return null;
  const due = rpDueDate(cohort.startDate, tpl.dueDays);
  const module = dn.dnSaveModule({ ...tpl.module, due });
  dn.dnAssign(module.id, cohort.code);
  return { org, cohort, module: dn.dnModule(module.id), classCode: cohort.code, due };
}

/** Every credential the ladders end in. */
export function rpCredentialIds(opts = {}) {
  return rpUniq(RP_TRACKS.flatMap((t) => rpLadder(t.id, opts).map((l) => l.credential?.id).filter(Boolean)));
}
