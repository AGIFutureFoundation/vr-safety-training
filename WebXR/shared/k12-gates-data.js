// K-12 gated items (docs/skill-gates.md, QUESTMASTER-3): a small course at a
// landmark, opened by the K-12 field lesson's full station — the lesson that
// teaches the idea where the learner is standing (shared/field-lessons.js,
// SCHOLAR). Each item is a side game in the shared contract: a gate with a
// `k12` requirement, three safe-practice calls, one cosmetic. tools/check_gates.mjs
// discovers `K2_GATED` by name; Bay World and the Deep list the items, pin them
// on their maps and mount the stage at the landmark when one is open.
//
// Facts rule: no digits in titles, notes or summaries. Names prefixed `qm`
// or `K2_` (the bundler shares one scope).

import { K2_FIELD_LESSONS } from "./field-lessons.js";

/** The lessons that open a course, and the course each one opens. */
const QM_K12_COURSES = [
  ["bw-fl-ferry-map-scale", "Ferry Landing Map Course", "map course", ["plan", "comms", "stopwork"], "map reader's compass charm",
    "Walk the ferry landing from a scaled plan, calling each landmark as you reach it."],
  ["bw-fl-crane-load-chart-ratio", "Load Chart Lift Puzzle", "chart lift", ["lift", "comms", "zone"], "load-chart reader's hardhat decal",
    "Order three picks under the gantry cranes so every load sits inside the chart and clear of the walkway."],
  ["bw-fl-reading-a-safety-sign", "Safety Sign Inspection Walk", "sign walk", ["inspect", "ppe", "label"], "sign reader's sleeve patch",
    "Walk the hazmat yard fence and read every sign's signal word before you pass it."],
  ["bw-fl-first-aid-call", "Call for Help Run", "help call", ["plan", "comms", "stopwork"], "first-aid caller's wristband",
    "Run the call for help from the fire station: what happened, where, and who is hurt, in the plan's order."],
  ["bw-fl-court-area", "Court Measure and Marking", "court marking", ["plan", "inspect", "zone"], "court marker's chalk pin",
    "Measure the arena court from its scaled plan and mark each line from the edge, never across wet paint."],
  ["dp-fl-kelp-food-web", "Kelp Food Web Transect", "food web transect", ["plan", "buddy", "stopwork"], "kelp food web fin tag",
    "Follow the transect line through the kelp cathedral, logging each layer of the food web with your buddy."],
  ["dp-fl-tide-gauge-reading", "Tide Gauge Reading Watch", "gauge watch", ["plan", "comms", "buddy"], "tide reader's slate bead",
    "Hold a watch at the gauge post and log each reading on the slate by the plan."],
];

const QM_K12_WORLD = { bayworld: "bayworld", deep: "underwater", regatta: "regatta", fairway: "fairway" };

function qmK12Item([lessonId, title, task, practices, cosmetic, summary]) {
  const l = K2_FIELD_LESSONS.find((x) => x.id === lessonId);
  if (!l) return null;
  return {
    id: `qm-k12-${lessonId.replace(/^[a-z]+-fl-/, "")}`,
    world: QM_K12_WORLD[l.world] ?? l.world,
    kind: "side-game",
    title, task, practices, summary,
    site: l.anchor.id, siteKind: l.anchor.kind, siteName: null,
    anchor: [l.position[0], l.position[1]], pin: [l.position[0], l.position[1]],
    lesson: l.id, station: l.station,
    gate: { k12: [l.station], note: `The K-12 lesson "${l.title}" at ${l.anchor.id.replace(/-/g, " ")} before you take the ${task}.` },
    reward: { cosmetic },
  };
}

/** The K-12 gated courses, discovered by the checker and listed by their worlds. */
export const K2_GATED = QM_K12_COURSES.map(qmK12Item).filter(Boolean);

/** The courses in one world's app id ("bayworld", "underwater", ...). */
export function qmK12GatedFor(world) { return K2_GATED.filter((it) => it.world === world); }
