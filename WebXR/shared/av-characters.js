// AVATARS — the character registry (console AVATARS, docs/avatars.md,
// docs/consoles/AVATARS.md). SmartCiti.X Holodeck · Powered by AGI Corp.
//
// Every named character, NPC, guide, crew role and robot or agent persona the
// platform shows, in one list, each with the role, the trade, the union (an id
// from tools/unions.json, or null — never a name invented here), the kit.js
// outfit its trade calls for, a palette, and a sprite id. Built at load from
// the data that already exists: GRIOT's roster (npc-data.js), the crew-role
// archetypes (crew.js ROLES), the cohort guides' instructor roles, the robot
// rigs of the robotics sites (rb-robotics-data.js, mirrored here by id so a
// world bundle that never loads the robot gym still has the personas) and the
// software agents the Holodeck names (the Guide, the task agent, the robot
// learner, the tutor, the ACP-shaped client, provider, evaluator and the
// safety governor). The learner is one entry too; their look is read at
// runtime from their own saved style (crew.js CT_AVATAR_KEY).
//
// Every top-level name starts with `av` or `AV_` (the bundler shares one scope).
//
//   avCharacters(kind?)        -> [entry]        kind: character | guide | crew-role | robot | agent | learner
//   avCharacter(id)            -> entry | null   also finds a GRIOT character by its gr- id
//   avLookFor(entry, style?)   -> a look for av-sprites.js (the learner's own style for the learner entry)
//   avSpriteFor(entry, opts)   -> SVG markup (portrait by default; { kind: "token" } for a chip)
//   avOutfitForRole(role)      -> the kit.js outfit name a role's words call for
//   avUnionForRole(role)       -> a tools/unions.json id, or null
//   avPpeForOutfit(outfit)     -> the crew.js PPE option id that dresses a ctAvatarFigure the same way

import { GR_ROSTER } from "./npc-data.js";
import { ROLES, ctAvatarVariety } from "./crew.js";
import { avLookFromStyle, avLookFromOutfit, avRobotLook, avAgentLook, avSpriteSvg, AV_GUIDE_LOOK, AV_OUTFITS } from "./av-sprites.js";

export const AV_REGISTRY_VERSION = 1;

/**
 * Role words → outfit and union. The first rule that matches wins, so the
 * specific trades come before the general ones. Union ids are tools/unions.json
 * ids; a role no union in that file organises gets null rather than a guess.
 */
export const AV_ROLE_RULES = Object.freeze([
  { test: /longshore|terminal foreman|lasher|stevedor/i, outfit: "longshore", union: "ilwu" },
  { test: /lineworker|line ?worker|lineman/i, outfit: "lineworker", union: "ibew" },
  { test: /\bweld/i, outfit: "welder", union: "ua" },
  { test: /fire watch/i, outfit: "construction", union: null },
  { test: /wildland|crew boss|fire lookout|firefight/i, outfit: "firefighter", union: "iaff" },
  { test: /\bnurses?\b|nursing|patient care|healthcare/i, outfit: "healthcare", union: "nnu" },
  { test: /\bchef\b|\bcook\b|banquet|hospitality/i, outfit: "chef", union: "unite-here" },
  { test: /robot technician|robotics technician|cobot/i, outfit: "robotTech", union: "uaw" },
  { test: /ai[- ]training|training specialist|teleop/i, outfit: "aiTrainer", union: null },
  { test: /silica|cement mason|concrete/i, outfit: "silica", union: "liuna" },
  { test: /track inspector|yard conductor|conductor|rail/i, outfit: "construction", union: "smart-td" },
  { test: /streetcar|transit mechanic|bus mechanic/i, outfit: "construction", union: "atu" },
  { test: /millwright/i, outfit: "construction", union: "carpenters" },
  { test: /stagehand|arena/i, outfit: "construction", union: "iatse" },
  { test: /electrician/i, outfit: "construction", union: "ibew" },
  { test: /(dam|water|pump).*operator|operator.*(dam|water|pump)|water treatment|pumping station/i, outfit: "construction", union: "afscme" },
  { test: /levee inspector|tunnel crew|road crew|foreman|laborer|labourer/i, outfit: "construction", union: "liuna" },
  { test: /crane operator|^operator$|operating engineer/i, outfit: "construction", union: "iuoe" },
  { test: /signaller|rigger|attendant|entrant/i, outfit: "construction", union: null },
  { test: /pilot/i, outfit: "office", union: "alpa" },
  { test: /teacher|instructor|lead \(/i, outfit: "office", union: "aft" },
  { test: /ranger|watershed|estuary|scientist|nursery|campground/i, outfit: "office", union: null },
  { test: /peer review|cohort|learner/i, outfit: "office", union: null },
]);

/** The kit.js outfit a role's words call for ("office" when none do). */
export function avOutfitForRole(role) {
  const r = AV_ROLE_RULES.find((x) => x.test.test(String(role ?? "")));
  return r?.outfit ?? "office";
}

/** The tools/unions.json id a role's words call for, or null. */
export function avUnionForRole(role) {
  const r = AV_ROLE_RULES.find((x) => x.test.test(String(role ?? "")));
  return r?.union ?? null;
}

/** The crew.js PPE option that dresses a ctAvatarFigure the way the outfit dresses standingFigure. */
export const AV_OUTFIT_PPE = Object.freeze({
  construction: "hard-hat-hivis", longshore: "hard-hat-hivis", silica: "hard-hat-hivis", lineworker: "electrical", welder: "electrical",
  robotTech: "none", aiTrainer: "none", firefighter: "hard-hat-hivis", marine: "marine", diver: "dive", clinical: "scrubs", healthcare: "scrubs",
  kitchen: "chef", chef: "chef", office: "none", sport: "none",
});
export function avPpeForOutfit(outfit) { return AV_OUTFIT_PPE[outfit] ?? "none"; }

/** Palette hex strings for a human look (what a roster or a card may tint with). */
function avPalette(look) {
  const hx = (c) => (c == null ? null : `#${Number(c).toString(16).padStart(6, "0")}`);
  return look.kind === "human"
    ? { skin: hx(look.skin), hair: hx(look.hair), cloth: hx(look.cloth), gear: hx(look.helmet ?? look.cap ?? look.scrubCap ?? look.diveHood ?? look.vest ?? look.cloth) }
    : { accent: hx(look.accent), body: hx(look.body ?? look.dark) };
}

/** A seed from an id, the way figureSeed() hashes a position: stable across builds. */
function avSeed(id) {
  let h = 2166136261;
  for (const ch of String(id)) { h ^= ch.charCodeAt(0); h = Math.imul(h, 16777619) >>> 0; }
  return h;
}

const AV_ROBOTS = [
  { id: "robot-amr", name: "AMR unit", role: "Autonomous mobile robot (warehouse and port aisles)", rig: "amr", accent: 0xf07a1f, scenario: "rb-amr-fleet-routing", sites: ["rb-site-west-oakland-warehouse", "rb-site-orleans-warehouse"] },
  { id: "robot-gantry", name: "Automated gantry", role: "Automated stacking gantry (port automation yard)", rig: "gantry", accent: 0x2a7de1, scenario: "rb-amr-fleet-routing", sites: ["rb-site-west-oakland-port-automation"] },
  { id: "robot-cobot", name: "Cobot arm", role: "Collaborative robot arm (speed-and-separation monitored)", rig: "cobot", accent: 0x3d9a4a, scenario: "rb-cobot-zone-setup", sites: ["rb-site-san-jose-robotics-lab"] },
  { id: "robot-cell", name: "Cell robot", role: "Industrial robot in a fenced cell (lockout before entry)", rig: "cell", accent: 0xd8322c, scenario: "rb-cell-entry", sites: ["rb-site-soma-robot-cell"] },
  { id: "robot-teleop", name: "Teleop arm", role: "Teleoperated pick-and-place arm (driven by a human's controller)", rig: "teleop", accent: 0xf2c14b, scenario: "rb-teleop-pick-place", sites: [] },
];

const AV_AGENTS = [
  { id: "agent-guide", name: "Guide", role: "Platform guide (on-device retrieval over this platform's own pages; no model call)", glyph: "guide", accent: 0x8fe3ff, module: "shared/guide.js" },
  { id: "agent-task", name: "Task agent", role: "Software agent playing a station as a task (AGENTGYM)", glyph: "task", accent: 0xb9d3de, module: "shared/ag-gym.js" },
  { id: "agent-robot-learner", name: "Robot learner", role: "Behaviour-cloned robot policy trained on demonstrations (COLEARN)", glyph: "learner", accent: 0x3d9a4a, module: "shared/col-learn.js" },
  { id: "agent-tutor", name: "Tutor", role: "Hint-style bandit that picks what to re-teach (COLEARN)", glyph: "tutor", accent: 0xf2c14b, module: "shared/col-learn.js" },
  { id: "agent-client", name: "Client agent", role: "External agent that requests a robot job (ACP-shaped; mocked in this build)", glyph: "client", accent: 0xd8b86a, module: "shared/vb-bridge.js" },
  { id: "agent-provider", name: "Robot-site agent", role: "SmartCiti.X provider agent that runs a policy in the simulator (ACP-shaped)", glyph: "provider", accent: 0xf07a1f, module: "shared/vb-bridge.js" },
  { id: "agent-evaluator", name: "Evaluator", role: "Scores a delivered episode against the station's own rubric (ACP-shaped)", glyph: "evaluator", accent: 0x8fe3ff, module: "shared/vb-bridge.js" },
  { id: "agent-governor", name: "Safety governor", role: "Allowlist, speed and separation limits, e-stop first, stale-policy refusal, audit log (every agent command passes it)", glyph: "governor", accent: 0xd8322c, module: "shared/vb-governor.js" },
];

const AV_INSTRUCTORS = [
  { id: "instructor-lead", name: "Lead", role: "Lead (teacher or outreach instructor)", source: "lco-cohorts" },
  { id: "instructor-journey", name: "Lead instructor", role: "Lead instructor (a journey-level instructor in the craft)", source: "lco-cohorts", outfit: "construction", union: null },
  { id: "peer-reviewer", name: "Peer reviewer", role: "Peer reviewers (the cohort)", source: "lco-cohorts" },
];

let avCache = null;

/** Build the registry once, from the data already in the tree. */
function avBuild() {
  const out = [];
  for (const ch of GR_ROSTER) {
    const outfit = avOutfitForRole(ch.role);
    out.push({
      id: ch.id, kind: "character", name: ch.name, role: ch.role, trade: ch.role, union: avUnionForRole(ch.role),
      world: ch.world, site: ch.site, outfit, ppe: avPpeForOutfit(outfit), styleIndex: ch.style?.i ?? 0, sprite: `av-${ch.id}`,
      source: "npc-data.js",
    });
  }
  out.push({ id: "learner", kind: "learner", name: "You", role: "Learner", trade: null, union: null, outfit: null, ppe: null, sprite: "av-learner", dynamic: true, source: "crew.js CT_AVATAR_KEY" });
  for (const [id, r] of Object.entries(ROLES)) {
    if (id === "solo") continue;
    const outfit = avOutfitForRole(r.name);
    out.push({ id: `crew-${id}`, kind: "crew-role", name: r.name, role: r.post, trade: r.name, union: avUnionForRole(r.name), pair: r.pair, outfit, ppe: avPpeForOutfit(outfit), sprite: `av-crew-${id}`, source: "crew.js ROLES" });
  }
  for (const i of AV_INSTRUCTORS) {
    const outfit = i.outfit ?? avOutfitForRole(i.role);
    out.push({ id: i.id, kind: "crew-role", name: i.name, role: i.role, trade: i.role, union: "union" in i ? i.union : avUnionForRole(i.role), outfit, ppe: avPpeForOutfit(outfit), sprite: `av-${i.id}`, source: i.source });
  }
  for (const r of AV_ROBOTS) out.push({ id: r.id, kind: "robot", name: r.name, role: r.role, trade: null, union: null, outfit: null, ppe: null, rig: r.rig, accent: r.accent, scenario: r.scenario, sites: r.sites, sprite: `av-${r.id}`, source: "rb-robotics-data.js" });
  for (const a of AV_AGENTS) out.push({ id: a.id, kind: "agent", name: a.name, role: a.role, trade: null, union: null, outfit: null, ppe: null, glyph: a.glyph, accent: a.accent, module: a.module, sprite: `av-${a.id}`, source: a.module });
  for (const e of out) e.palette = avPalette(avLookFor(e));
  return out;
}

/** Every entry, or those of one kind. */
export function avCharacters(kind = null) {
  avCache ??= avBuild();
  return kind ? avCache.filter((e) => e.kind === kind) : avCache.slice();
}

/** One entry by id (a GRIOT gr- id works too). */
export function avCharacter(id) {
  avCache ??= avBuild();
  return avCache.find((e) => e.id === id) ?? null;
}

/**
 * The av-sprites.js look for an entry. A GRIOT character keeps the skin, hair
 * and body its crew.js style index gives it (so the sprite is the same person
 * as the figure in the world) and wears its registry outfit; a crew role is
 * seeded from its id; the learner is read from `style` (their saved one).
 */
export function avLookFor(entry, style = null) {
  if (!entry) return avLookFromOutfit("office", 0);
  if (entry.kind === "robot") return avRobotLook(entry.rig, entry.accent);
  if (entry.kind === "agent") return entry.id === "agent-guide" ? AV_GUIDE_LOOK : avAgentLook(entry.glyph, entry.accent);
  if (entry.kind === "learner") return avLookFromStyle(style ?? {});
  if (entry.kind === "character") return avLookFromStyle(ctAvatarVariety(entry.styleIndex ?? 0, { ppe: entry.ppe }), entry.outfit);
  return avLookFromOutfit(entry.outfit && AV_OUTFITS?.[entry.outfit] ? entry.outfit : "office", avSeed(entry.id));
}

/** The sprite for an entry, as SVG markup. */
export function avSpriteFor(entry, opts = {}) {
  return avSpriteSvg(avLookFor(entry, opts.style ?? null), { title: entry ? `${entry.name} — ${entry.trade ?? entry.role}` : "", ...opts });
}
