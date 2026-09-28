// The quest board, adapted from the real thing.
//
// Team BAY3's WebXR/bayworld/js/quests.js and quests-data.js have landed:
// the real quest layer, generated from smartcity/js/curricula.js and keyed
// by plain site/landmark NAME strings rather than by importing BAY1's
// shared/bayworld-data.js directly (see quests.js's own header — this quest
// layer takes no dependency on the map, on purpose). This module is the
// switch every other file in this app imports the quest list from, plus the
// adapter every one of BAY3's quests needs to run on this app's own
// quest-engine.js:
//   - a quest's own `site` (a display name) resolved to the map's own site
//     id, via quests.js's own resolveQuestSite();
//   - every goto/find/drive/talk step's own `target` resolved the same way,
//     to a site id (bwResolveTarget()'s first try) or a landmark id (its
//     second) — except an egg's own found-object id (always starts with
//     "bw-egg-", never a place name) and an NPC/object name that names no
//     place at all (a giver's own name, "maintenance-radio"): both are left
//     exactly as BAY3 wrote them, and quest-engine.js's own anchor fallback
//     (`quest.anchor`, set below to the quest's own resolved site or
//     landmark) is what still lets a "find" or "talk" step at one of those
//     resolve to a real location;
//   - `reward.xp` turned into this app's own `{ reputation, credits }` shape
//     (`badge`/`xp` carried through too, harmlessly, for a HUD that wants
//     them later).
import { ALL_QUESTS, GATED_QUESTS, resolveQuestSite, resolveLandmark } from "./quests.js";
import { BW_SITES, BW_LANDMARKS } from "./city.js";

/** Shift credits per reputation point a quest's own xp awards — the same
 *  4x this app's mission-return formula in career.js roughly works out to. */
const BW_XP_TO_CREDITS = 4;

function bwResolveTarget(target) {
  if (typeof target !== "string" || target.startsWith("bw-egg-")) return target;
  const site = resolveQuestSite({ site: target }, BW_SITES);
  if (site) return site.id;
  const landmark = resolveLandmark(target, BW_LANDMARKS);
  if (landmark) return landmark.id;
  return target; // an NPC, a radio, or any other name that is not a place —
                 // the quest's own anchor (below) covers this step instead.
}

function bwAdaptQuest(quest) {
  const site = resolveQuestSite(quest, BW_SITES);
  const landmark = resolveLandmark(quest.landmark ?? quest.site, BW_LANDMARKS);
  const anchor = site ? [site.position[0], site.position[2]] : landmark ? [landmark.position[0], landmark.position[2]] : null;
  const xp = quest.reward?.xp | 0;
  return {
    ...quest,
    site: site?.id ?? quest.site,
    anchor,
    steps: quest.steps.map((step) => (step.type === "station" ? step : { ...step, target: bwResolveTarget(step.target) })),
    reward: { reputation: xp, credits: xp * BW_XP_TO_CREDITS, badge: quest.reward?.badge ?? null, xp, ...(quest.reward?.cosmetic ? { cosmetic: quest.reward.cosmetic } : {}) },
  };
}

/** Every one of BAY3's quests (main arc, side quests, egg field notes),
 *  adapted for this app's own quest-engine.js. */
export const BW_QUESTS = ALL_QUESTS.map(bwAdaptQuest);

/** The skill-gated side quests (docs/skill-gates.md), adapted the same way.
 *  They register with the engine like any quest; quest-engine.js's gate hook
 *  keeps each one still until shared/skill-gates.js says its gate is open. */
export const BW_GATED_QUESTS = GATED_QUESTS.map(bwAdaptQuest);
