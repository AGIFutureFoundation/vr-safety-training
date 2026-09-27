// The Deep — the dive board adapter (bayworld/js/quests-select.js's mirror):
// every dive in dives.js, adapted for dive-engine.js —
//   - a dive's `site` (a display name) resolved to the seabed's site id;
//   - every goto/find/rov/talk step's `target` resolved to a site id (first
//     try) or a landmark id (second) — except a lantern's own found-object id
//     (always "dv-egg-…") and a giver's own name ("dive-supervisor",
//     "supervisor-comms"), which are left as written: the engine's anchor
//     fallback (`dive.anchor`, the dive's own resolved site or landmark)
//     still gives such a step a real place;
//   - `reward.xp` turned into this app's `{ reputation, credits }`.
import { DV_ALL_DIVES, dvResolveDiveSite, dvResolveLandmark } from "./dives.js";
import { DV_SITES, DV_LANDMARKS } from "./seabed.js";

/** Survey credits per reputation point a dive's xp awards. */
const DV_XP_TO_CREDITS = 4;

function dvResolveTarget(target) {
  if (typeof target !== "string" || target.startsWith("dv-egg-")) return target;
  const site = dvResolveDiveSite({ site: target }, DV_SITES);
  if (site) return site.id;
  const landmark = dvResolveLandmark(target, DV_LANDMARKS);
  if (landmark) return landmark.id;
  return target;
}

function dvAdaptDive(dive) {
  const site = dvResolveDiveSite(dive, DV_SITES);
  const landmark = dvResolveLandmark(dive.landmark ?? dive.site, DV_LANDMARKS);
  const anchor = site ? [site.position[0], site.position[2]] : landmark ? [landmark.position[0], landmark.position[2]] : null;
  const xp = dive.reward?.xp | 0;
  return {
    ...dive,
    site: site?.id ?? dive.site,
    anchor,
    steps: dive.steps.map((step) => (step.type === "station" ? step : { ...step, target: dvResolveTarget(step.target) })),
    reward: { reputation: xp, credits: xp * DV_XP_TO_CREDITS, badge: dive.reward?.badge ?? null, xp },
  };
}

/** Every dive (main arc, side dives, lantern eggs), adapted for dive-engine.js. */
export const DV_DIVES = DV_ALL_DIVES.map(dvAdaptDive);
