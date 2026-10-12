#!/usr/bin/env node
/**
 * Generates WebXR/shared/skill-registry.js — the task and skill registry a
 * robot policy or an agent planner can consume directly.
 *
 *     node tools/gen_skill_registry.mjs            # write the file
 *     node tools/gen_skill_registry.mjs --check    # exit 1 if the file is stale
 *
 * Two layers, both read straight off the real station content through the
 * same headless loader tools/robot_train.mjs uses (tools/lib/headless.mjs):
 *
 *   SK_PRIMITIVES  every step kind WebXR/shared/game.js knows, as a robot
 *                  primitive with its parameters (select → reach-and-press,
 *                  turn → rotate-to-angle, drag → pick-and-place, gauge →
 *                  hold-in-band, track → track-a-signal, drive → path-follow,
 *                  and the three the brief left implicit: sequence → ordered
 *                  reach-and-press, find → search-and-press, hold →
 *                  press-and-hold) and the engine actions it is made of
 *                  (WebXR/shared/robot.js's applyAction() vocabulary).
 *   SK_STATIONS    every station in both apps as a task graph of those
 *                  primitives: nodes in the engine's own step order, the
 *                  preconditions a station establishes (PPE, lockout) and the
 *                  step index at which each becomes a precondition for what
 *                  follows, and failure labels (the station's hazards, and
 *                  its interruptions as missed-interruption labels).
 *
 * Preconditions are derived from the step text with a documented keyword
 * rule (see PRECONDITION_RULES) — a label for a planner, not a safety
 * determination. No personal data, no keys, no network: this file only reads
 * the repository.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { ROOT, loadSmartCity, loadTrades } from "./lib/headless.mjs";
import { CURRICULA } from "../WebXR/smartcity/js/curricula.js";
import { UNIONS } from "../WebXR/shared/unions.js";

const OUT = join(ROOT, "WebXR", "shared", "skill-registry.js");
export const SK_REGISTRY_VERSION = 1;

// The primitive vocabulary. `params` names what a node of this primitive
// carries; `actions` is the subset of robot.js's applyAction() types a
// policy emits to perform it.
export const PRIMITIVES = [
  { id: "reach-and-press", kind: "select", params: { target: "interactable id" }, actions: ["select"], success: "the engine answers the select with an ok feedback" },
  { id: "ordered-reach-and-press", kind: "sequence", params: { targets: "interactable ids", ordered: "true when the order matters" }, actions: ["select"], success: "every target selected, in order when ordered" },
  { id: "search-and-press", kind: "find", params: { targets: "interactable ids to find, any order" }, actions: ["select"], success: "every target found" },
  { id: "hold-in-band", kind: "gauge", params: { target: "instrument id", band: "[lo, hi] on a 0-1 dial" }, actions: ["commit"], success: "committed with the needle inside the band" },
  { id: "press-and-hold", kind: "hold", params: { target: "interactable id", seconds: "hold duration" }, actions: ["press", "release"], success: "held for the full duration without a break" },
  { id: "track-a-signal", kind: "track", params: { target: "control id", band: "[lo, hi] the signal must stay inside" }, actions: ["press", "release"], success: "kept the signal inside the band for the required time" },
  { id: "rotate-to-angle", kind: "turn", params: { target: "handle id", turns: "turns required" }, actions: ["rotate"], success: "rotated through the required turns" },
  { id: "pick-and-place", kind: "drag", params: { target: "object id", to: "drop socket id", radius: "placement tolerance (m)" }, actions: ["drop"], success: "placed within the tolerance radius" },
  { id: "path-follow", kind: "drive", params: { checks: "the checks due along the path" }, actions: ["drive", "check"], success: "reached the end of the path in lane, every check on time" },
];

// Keyword rules for the two preconditions the brief names. A step whose id,
// title or cue matches establishes the precondition for every later step.
export const PRECONDITION_RULES = {
  ppe: /\b(ppe|gloves?|goggles?|respirator|face ?shield|hard ?hat|helmet|harness|hi-?vis|vest|ear ?(plugs|muffs|defenders)|hearing protection|gown|apron|mask|n95|safety glasses|boots|don(ning)?)\b/i,
  lockout: /\b(lock ?out|lockout|loto|tag ?out|tagout|isolat(e|ion|ing)|de-?energi[sz]e|blank(ing)?|zero energy|try-?out|lock the)\b/i,
};

const round3 = (n) => Math.round(n * 1000) / 1000;

function unionFor(room) {
  if (room.union) {
    const byAlias = UNIONS.find((u) => u.abbrev === room.union || u.aliases.includes(room.union) || room.union.startsWith(u.abbrev));
    return byAlias ? byAlias.id : null;
  }
  const text = `${room.certification ?? ""}`;
  let best = null, at = Infinity;
  for (const u of UNIONS) {
    for (const name of [u.abbrev, ...u.aliases]) {
      const esc = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const m = new RegExp(`(^|[^A-Za-z])${esc}([^A-Za-z]|$)`).exec(text);
      if (m && m.index < at) { at = m.index; best = u.id; }
    }
  }
  return best;
}

function nodeFor(step) {
  const p = PRIMITIVES.find((x) => x.kind === step.kind);
  const n = { id: step.id, p: p ? p.id : "unknown" };
  switch (step.kind) {
    case "select": n.target = step.target; break;
    case "sequence": n.targets = step.targets; n.ordered = !step.anyOrder; break;
    case "find": n.targets = step.targets; break;
    case "gauge": n.target = step.target; n.band = (step.gauge?.green ?? [0.44, 0.62]).map(round3); break;
    case "hold": n.target = step.target; n.seconds = step.seconds ?? null; break;
    case "track": n.target = step.target; n.band = (step.track?.green ?? [0.42, 0.62]).map(round3); break;
    case "turn": n.target = step.target; n.turns = step.turn?.turns ?? 1; break;
    case "drag": n.target = step.target; n.to = step.drag?.to ?? null; n.radius = step.drag?.radius ?? 0.35; break;
    case "drive": n.checks = (step.drive?.checks ?? []).map((c) => c.kind); break;
    default: break;
  }
  if (step.noRobot) n.noRobot = true;
  return n;
}

function stationFor(app, room, programmesByStation) {
  const gates = {};
  room.steps.forEach((step, i) => {
    const text = `${step.id} ${step.title ?? ""} ${step.cue ?? ""}`;
    for (const [kind, re] of Object.entries(PRECONDITION_RULES)) if (gates[kind] == null && re.test(text)) gates[kind] = i;
  });
  return {
    id: room.id, app, name: room.name ?? room.title ?? room.id, category: room.category ?? room.trade ?? null,
    union: unionFor(room),
    programmes: programmesByStation.get(`${app}:${room.id}`) ?? [],
    preconditions: Object.entries(gates).map(([kind, at]) => ({ kind, establishedBy: room.steps[at].id, fromStep: at })),
    failures: {
      hazards: Object.keys(room.hazards ?? {}),
      missedInterruptions: (room.interrupts ?? []).map((it) => it.id),
    },
    nodes: room.steps.map(nodeFor),
  };
}

export async function buildRegistry() {
  const programmesByStation = new Map();
  for (const c of CURRICULA) for (const s of c.stations) {
    const k = `${s.app}:${s.id}`;
    if (!programmesByStation.has(k)) programmesByStation.set(k, []);
    programmesByStation.get(k).push(c.id);
  }
  const stations = [];
  for (const [app, load] of [["smartcity", loadSmartCity], ["trades", loadTrades]]) {
    const suite = await load();
    for (const room of suite.ROOMS) stations.push(stationFor(app, room, programmesByStation));
  }
  return { version: SK_REGISTRY_VERSION, primitives: PRIMITIVES, stations };
}

function render(reg) {
  const lines = reg.stations.map((s) => `  ${JSON.stringify(s)},`).join("\n");
  return `/**
 * GENERATED FILE — do not hand-edit. Run \`node tools/gen_skill_registry.mjs\`
 * after changing a station's steps, hazards or interruptions, or a programme.
 *
 * The task and skill registry: every step kind as a robot primitive
 * (SK_PRIMITIVES) and every station as a task graph of those primitives
 * (SK_STATIONS) with its preconditions and failure labels — see
 * docs/robot-datasets.md and docs/agent-roadmap.md. Pure data plus lookups;
 * no personal data, no network. Top-level names carry the \`sk\` prefix
 * because the bundler concatenates every module into one scope.
 *
 * \`failures.hazards\` are the station's hazard ids (an unsafe action's label);
 * \`failures.missedInterruptions\` its interruption ids (missed or wrong).
 * A station's graph is its node list in the engine's step order: node i
 * follows node i-1. A precondition applies to every node from \`fromStep\` on.
 */

export const SK_REGISTRY_VERSION = ${reg.version};

export const SK_PRIMITIVES = ${JSON.stringify(reg.primitives, null, 2)};

export const SK_STATIONS = [
${lines}
];

const skPrimByKind = Object.fromEntries(SK_PRIMITIVES.map((p) => [p.kind, p]));
const skPrimById = Object.fromEntries(SK_PRIMITIVES.map((p) => [p.id, p]));
const skStationByKey = new Map(SK_STATIONS.map((s) => [\`\${s.app}:\${s.id}\`, s]));

/** The primitive a step kind maps to, or null. */
export function skPrimitiveForKind(kind) { return skPrimByKind[kind] ?? null; }
/** A primitive by its id (e.g. "pick-and-place"), or null. */
export function skPrimitive(id) { return skPrimById[id] ?? null; }
/** A station's task graph by id, optionally scoped to an app. */
export function skStation(id, app = null) {
  if (app) return skStationByKey.get(\`\${app}:\${id}\`) ?? null;
  return SK_STATIONS.find((s) => s.id === id) ?? null;
}
/** The preconditions in force at a node index of a station. */
export function skPreconditionsAt(station, stepIndex) {
  return (station?.preconditions ?? []).filter((p) => stepIndex > p.fromStep).map((p) => p.kind);
}
/** Every station a programme names, as task graphs. */
export function skStationsForProgramme(programmeId) {
  return SK_STATIONS.filter((s) => s.programmes.includes(programmeId));
}
`;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const reg = await buildRegistry();
  const text = render(reg);
  if (process.argv.includes("--check")) {
    let cur = "";
    try { cur = readFileSync(OUT, "utf8"); } catch { /* missing */ }
    if (cur !== text) { console.error("skill-registry.js is stale — run node tools/gen_skill_registry.mjs"); process.exit(1); }
    console.log(`skill-registry.js is current: ${reg.stations.length} stations, ${reg.primitives.length} primitives`);
  } else {
    writeFileSync(OUT, text);
    console.log(`Wrote ${OUT}: ${reg.stations.length} stations, ${reg.stations.reduce((n, s) => n + s.nodes.length, 0)} nodes, ${reg.primitives.length} primitives (${Math.round(text.length / 1024)} KB)`);
  }
}
