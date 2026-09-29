// UNIONSIMS — craft simulations per Bay Program project type (console UNIONSIMS, docs/consoles/UNIONSIMS.md).
// SmartCiti.X Powered by AGI Corp.
//
// SEAMS (documented shapes):
//   usSims() -> US_SIMS   [{ id, project, craft, unions: [unionId], name, briefing, steps: PROJECTSIM steps }]
//   usSim(id) -> sim | null
//   usSimsFor(project) -> [sim]            project: one of US_PROJECTS
//   usPlaces(simId) -> [{ sim, parish, site }]   real sites in this tree (the PROJECTSIM sites of that project type)
//   usScore / usMistakes / usDebrief(sim, run)   PROJECTSIM's own scoring (psScore, psMistakes, psDebrief): run
//        { order: [stepId], calls: { [stepId]: bool } }; order penalties PS_ORDER_PENALTY, pass mark PS_PASS
//   usRecord(simId, result) -> { credits }  Crew Credits through TYCOON tyEarn(simId, { recordId: "unionsims:<id>", level, passed })
//   usDeanModules() -> [{ id: "unionsims:<id>", title, kind: "projectsim", stations, minutes, launch: { world, parish, site } }]
// Union tags are tools/unions.json ids and a trade reference only — no partnership with any union is claimed.
// Every top-level name is prefixed us/US_ (the bundler shares one scope).

import { US_SIMS, US_PROJECTS, US_PLACES_BY_PROJECT } from "./us-unionsims-data.js";
import { psScore, psMistakes, psDebrief, psCreditLevel, psRegisterSims } from "./ps-projectsim.js";
import { tyEarn } from "./ty-economy.js";

export { US_SIMS, US_PROJECTS, US_PLACES_BY_PROJECT };
export function usSims() { return US_SIMS; }
export function usSim(id) { return US_SIMS.find((s) => s.id === id) ?? null; }
export function usSimsFor(project) { return US_SIMS.filter((s) => s.project === project); }
export function usPlaces(simId) {
  const sim = usSim(simId);
  return sim ? (US_PLACES_BY_PROJECT[sim.project] ?? []).map((p) => ({ sim: sim.id, ...p })) : [];
}
export const usScore = (sim, run) => psScore(sim, run);
export const usMistakes = (sim, run) => psMistakes(sim, run);
export const usDebrief = (sim, run) => psDebrief(sim, run);
export function usRecord(simId, result) {
  const sim = usSim(simId);
  if (!sim) return null;
  let credits = null;
  try { credits = tyEarn(simId, { recordId: `unionsims:${simId}`, level: psCreditLevel(result.score), passed: !!result.passed }); } catch (_) { credits = null; }
  return { credits };
}
export function usDeanModules() {
  return US_SIMS.map((sim) => {
    const place = usPlaces(sim.id)[0];
    return { id: `unionsims:${sim.id}`, title: `${sim.name} simulation`, kind: "projectsim", stations: [...new Set(sim.steps.map((s) => s.station))],
      paths: ["union-trades"], minutes: sim.steps.length * 2 + 2, launch: { world: "parishes", parish: place?.parish ?? null, site: place?.site ?? null } };
  });
}

// The craft simulations open from PROJECTSIM's boards and panel at their places (registered once, on import).
psRegisterSims(US_SIMS, (parishId) => US_SIMS.flatMap((sim) => (US_PLACES_BY_PROJECT[sim.project] ?? []).filter((p) => p.parish === parishId).map((p) => ({ sim: sim.id, parish: p.parish, site: p.site }))));
