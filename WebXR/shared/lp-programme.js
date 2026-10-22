// LA-PROGRAMME — the Louisiana Development Training Programme, functions (docs/consoles/LA-PROGRAMME.md). SmartCiti.X Powered by AGI Corp.
//
// Seams (documented shapes):
//   lpTracks() -> LP_TRACKS; lpTrack(id) -> track | null
//   lpGuardPlaces(track, lookup) -> { live: [{ map, site }], pending: [{ map, site }] }
//     lookup(mapId) -> parish | null (np-parishes.js npParish). A place is live only when its map is in the tree AND the site is
//     on it — pjGuardedUs()'s pattern; until the map consoles merge every place stays pending, never a broken link.
//   lpResolve(track, { stationIds, simIds, lookup }) -> track with live station/sim ids per work type, `pending` ids and `places`
//   lpPathways(pathwayId, { stationIds, simIds }) -> [{ level, title, stations, capstone, sims, credential, earnable }]
//   lpMatrix(opts) -> [{ track, workType, union, station }]  (live cells only)
//   lpTemplates(opts) -> [{ module (DEAN doc), pathway, level, sims, dueDays, credential, guide }]
//   lpSetUpCohort({ en, dn, stationIds, simIds }, { orgName, pathwayId, level, seats, startDate }) -> { org, cohort, module, classCode, due }
//   lpSimPlaces(mapId, lookup) -> [{ sim, parish, site }]  guarded places for PROJECTSIM
//   lpRegisterSims({ psRegisterSims, lookup }) -> number of sims registered (the parishes app mounts it; guarded)
//   lpDeanModules() -> [{ id: "laprogramme:<sim>", title, kind: "projectsim", stations, minutes, launch }]
// Only competency.js is imported, so the page and the checker load this without the engine.

import { COMPETENCY_BY_ID } from "./competency.js";
import { LP_NAME, LP_NO_PARTNERSHIP, LP_SOURCES, LP_TRACKS, LP_PATHWAYS, LP_LEVELS, LP_SIMS, LP_SIM_PLACES, LP_K12_LESSONS } from "./lp-programme-data.js";

export { LP_NAME, LP_NO_PARTNERSHIP, LP_SOURCES, LP_TRACKS, LP_PATHWAYS, LP_LEVELS, LP_SIMS, LP_SIM_PLACES, LP_K12_LESSONS };
export function lpTracks() { return LP_TRACKS; }
export function lpTrack(id) { return LP_TRACKS.find((t) => t.id === id || t.short === id) ?? null; }
export function lpPathway(id) { return LP_PATHWAYS.find((p) => p.id === id) ?? null; }
export function lpLevel(id) { return LP_LEVELS.find((l) => l.id === id) ?? null; }
export function lpSim(id) { return LP_SIMS.find((s) => s.id === id) ?? null; }

const lpUniq = (a) => [...new Set(a)];
const lpHas = (set, id) => (set instanceof Set ? set.has(id) : Array.isArray(set) ? set.includes(id) : true);

/** Is `site` on `mapId` in this tree? Guarded: any error or a missing map is "no". */
export function lpSiteLive(mapId, site, lookup) {
  let map = null;
  try { map = typeof lookup === "function" ? lookup(mapId) ?? null : null; } catch (_) { map = null; }
  if (!map) return false;
  return !site || !!map.sites?.some((s) => s.id === site);
}

export function lpGuardPlaces(track, lookup = null) {
  const live = [], pending = [];
  for (const p of track?.places ?? []) for (const site of p.sites) (lpSiteLive(p.map, site, lookup) ? live : pending).push({ map: p.map, site });
  return { live, pending };
}

export function lpResolve(track, { stationIds = null, simIds = null, lookup = null } = {}) {
  const pending = [];
  const keep = (ids, set) => ids.filter((id) => (lpHas(set, id) ? true : (pending.push(id), false)));
  const workTypes = track.workTypes.map((w) => ({ ...w, stations: keep(w.stations, stationIds), sims: keep(w.sims, simIds) }));
  return { ...track, workTypes, pending: lpUniq(pending), places: lpGuardPlaces(track, lookup) };
}

/** The competency among `candidates` with the most stations in `stations` (ties: the order given). */
export function lpCredentialFor(stations, candidates) {
  let best = null;
  for (const id of candidates) {
    const c = COMPETENCY_BY_ID[id];
    if (!c) continue;
    const overlap = c.stations.filter((s) => stations.includes(s)).length;
    if (!best || overlap > best.overlap) best = { id, title: c.title, overlap, require: c.require, stillNeeded: Math.max(0, c.require - overlap) };
  }
  return best;
}

const LP_ALL_STATIONS = new Set([...LP_TRACKS.flatMap((t) => t.workTypes.flatMap((w) => w.stations)), ...LP_PATHWAYS.flatMap((p) => [...p.stations, ...p.k12])]);

/** Capstone: the credential's own stations not yet in the module, programme stations first, as many as the rule still needs. */
export function lpCapstone(credential, stations, stationIds = null) {
  const c = credential && COMPETENCY_BY_ID[credential.id];
  if (!c || !credential.stillNeeded) return [];
  const rest = c.stations.filter((s) => !stations.includes(s) && lpHas(stationIds, s));
  return [...rest.filter((s) => LP_ALL_STATIONS.has(s)), ...rest.filter((s) => !LP_ALL_STATIONS.has(s))].slice(0, credential.stillNeeded);
}

/** The five levels of one role pathway (live ids only), each ending in a credential. */
export function lpPathways(pathwayId, opts = {}) {
  const p = lpPathway(pathwayId);
  if (!p) return [];
  const st = p.stations.filter((id) => lpHas(opts.stationIds, id));
  const sims = p.sims.filter((id) => lpHas(opts.simIds, id));
  const k12 = lpUniq([...p.k12, "k12-es-who-does-this-work"]).filter((id) => lpHas(opts.stationIds, id));
  const build = { aware: { stations: k12, sims: [] }, entry: { stations: st.slice(0, 3), sims: sims.slice(0, 1) }, appr: { stations: st, sims }, jw: { stations: st.slice(0, 3), sims }, lead: { stations: st, sims } };
  return LP_LEVELS.map((l) => {
    const b = build[l.id];
    const credential = lpCredentialFor(b.stations, p.credentials[l.id] ?? []);
    const capstone = lpCapstone(credential, b.stations, opts.stationIds);
    return { pathway: p.id, level: l.id, title: l.title, who: l.who, stations: b.stations, capstone, sims: b.sims, requiredScore: l.requiredScore, dueDays: l.dueDays,
      lessons: l.id === "aware" ? (LP_K12_LESSONS[p.id] ?? []) : [],
      credential, earnable: !!credential && credential.overlap + capstone.length >= credential.require, certificate: "org cohort certificate (org.js enCertificateSVG)" };
  });
}

/** Competency matrix: work type × craft × station, live cells only. */
export function lpMatrix(opts = {}) {
  const rows = [];
  for (const tr of LP_TRACKS) {
    const t = lpResolve(tr, opts);
    for (const w of t.workTypes) for (const c of w.crafts) for (const s of w.stations) rows.push({ track: t.id, workType: w.id, facts: w.facts, union: c.union, station: s });
  }
  return rows;
}

/** DEAN module templates: one per pathway and level, with an instructor guide. */
export function lpTemplates(opts = {}) {
  const out = [];
  for (const p of LP_PATHWAYS) {
    for (const lv of lpPathways(p.id, opts)) {
      const level = lpLevel(lv.level);
      const lessons = [...lv.stations, ...lv.capstone].map((id) => ({ kind: "station", id, world: "smartcity" }));
      if (!lessons.length) continue;
      const tracks = p.tracks.map(lpTrack).filter(Boolean);
      const guide = {
        objectives: [`Practise the ${p.title.toLowerCase()} work (${p.kinds}) the Louisiana projects describe, from each station's cited standards.`, ...tracks.slice(0, 3).map((t) => `Place the work: ${t.name} — ${t.where}.`)],
        practice: [...lv.stations, ...lv.capstone].map((id) => ({ station: id, capstone: lv.capstone.includes(id) })),
        simulations: lv.sims.map((id) => ({ sim: id, launch: `projectsim:${id}`, passMark: 80 })),
        debrief: ["Which gate had to be done before anything else, and why?", "Who had the authority to stop the work, and when did they use it?", "What would you tell a new crew member on day one about this work?"],
        assessment: `Every station passed with a module score of ${level.requiredScore} or more${lv.sims.length ? "; every simulation at 80 or more with no order-gate penalty" : ""}. The level ends in the ${lv.credential?.id ?? "—"} competency — ${lv.credential?.require ?? 0} mastery runs, ${lv.credential?.overlap ?? 0} in the pathway${lv.capstone.length ? ` and ${lv.capstone.length} in the capstone` : ""} — and the cohort certificate.`,
      };
      out.push({ pathway: p.id, level: lv.level, dueDays: level.dueDays, sims: lv.sims, credential: lv.credential, guide,
        module: { v: 1, kind: "module", id: `mod-lp-${p.id}-${lv.level}`, title: `${LP_NAME} · ${p.title} · ${level.title}`, lessons, due: null, requiredScore: level.requiredScore, assign: [] } });
    }
  }
  return out;
}

export function lpDueDate(start, days) {
  const d = new Date(`${/^\d{4}-\d{2}-\d{2}$/.test(start ?? "") ? start : new Date().toISOString().slice(0, 10)}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

/** A cohort on the org layer (no payment, seats a count) with the pathway level's DEAN module assigned to its class code. */
export function lpSetUpCohort({ en, dn, stationIds = null, simIds = null }, { orgName, pathwayId, level = "appr", seats = 20, startDate = null } = {}) {
  const p = lpPathway(pathwayId);
  const tpl = lpTemplates({ stationIds, simIds }).find((x) => x.pathway === p?.id && x.level === level);
  if (!p || !tpl || !orgName) return null;
  // The org layer accepts only its registered programmes: the pathway's own competency programmes, apprentice level first.
  const programmes = lpUniq([...(p.credentials.appr ?? []), ...(p.credentials.lead ?? []), ...(p.credentials[level] ?? [])]);
  const org = en.enOrgs().find((o) => o.name === orgName) ?? en.enCreateOrg({ name: orgName, programmes });
  if (!org) return null;
  let cohort = null;
  for (const programme of programmes) { cohort = en.enCreateCohort({ orgId: org.id, name: `${p.title} · ${lpLevel(level).title}`, programme, edition: LP_NAME, startDate, seats }); if (cohort) break; }
  if (!cohort) return null;
  const due = lpDueDate(cohort.startDate, tpl.dueDays);
  const module = dn.dnSaveModule({ ...tpl.module, due });
  dn.dnAssign(module.id, cohort.code);
  return { org, cohort, module: dn.dnModule(module.id), classCode: cohort.code, due, sims: tpl.sims };
}

/** Every credential the pathways end in. */
export function lpCredentialIds(opts = {}) {
  return lpUniq(LP_PATHWAYS.flatMap((p) => lpPathways(p.id, opts).map((l) => l.credential?.id).filter(Boolean)));
}

/** Guarded PROJECTSIM places on one map: only sites that exist on a map that is in the tree. */
export function lpSimPlaces(mapId, lookup = null) {
  return LP_SIM_PLACES.filter((p) => p.map === mapId && lpSiteLive(p.map, p.site, lookup)).map((p) => ({ sim: p.sim, parish: p.map, site: p.site, guarded: true }));
}

/** Register the programme's simulations with PROJECTSIM (psRegisterSims), places guarded by `lookup`. */
export function lpRegisterSims({ psRegisterSims, lookup } = {}) {
  if (typeof psRegisterSims !== "function") return 0;
  try { psRegisterSims(LP_SIMS, (mapId) => lpSimPlaces(mapId, lookup)); } catch (_) { return 0; }
  return LP_SIMS.length;
}

export function lpDeanModules(lookup = null) {
  return LP_SIMS.map((sim) => {
    const place = LP_SIM_PLACES.find((p) => p.sim === sim.id && lpSiteLive(p.map, p.site, lookup)) ?? null;
    return { id: `laprogramme:${sim.id}`, title: `${sim.name} simulation`, kind: "projectsim", stations: lpUniq(sim.steps.map((s) => s.station)),
      minutes: sim.steps.length * 2 + 2, launch: { world: "parishes", parish: place?.map ?? null, site: place?.site ?? null } };
  });
}
