// LA-COHORTS — FlowHub flows and two-minute apply games for LA-K12's six Louisiana lessons (docs/consoles/LA-COHORTS.md).
// SmartCiti.X Powered by AGI Corp.
//
// The ESTUARY pattern (es-bay-lessons.js, WebXR/flows/es-*.json) for the Louisiana lessons in lk-la-lessons.js:
//
//   LCO_APPLY_GAMES    one two-minute apply game per lesson, at the lesson's first fixed anchor, with three rounds that
//                      use the lesson's one idea (the side-game step shape: { board, prompt, options: [{ text, safe }] },
//                      exactly one right move per round). `mechanic` names the shared side-game mechanic whose panel plays
//                      it (side-game-mechanics.js); the rounds are the game's own.
//   LCO_FLOW_OF        lesson id → flow id (WebXR/flows/lk-*.json, written by tools/gen_lco_flows.mjs)
//   lcoFlowFor(l)      the flow id of a lesson (or null)
//   lcoApplyGame(id)   a game by id; lcoApplyFor(lesson) → { kind: "mini-game", id, game, minutes }
//   lcoApplySteps(id)  the game's rounds (options shuffled deterministically by id)
//   lcoSessionLessons(parishId, opts)  lkSessionLessons plus each lesson's `flow` and `apply` (the seam for a SCHOLAR panel
//                      or the flow agent that can play an apply step)
//
// Kids rule: one idea per round, plain words, no digit, no fear framing. Facts rule: no project figure, company name or
// employer's hiring; places are named as places. The platform has no partnership with any company, agency or union.
// Every top-level name is prefixed `lco`/`LCO_` (the bundler shares one scope); imports are plain (no `as` aliases).

import { LK_LESSONS, lkSessionLessons } from "./lk-la-lessons.js";

export const LCO_APPLY_MINUTES = 2;

function lcoHash(s) { let h = 7; for (const ch of String(s)) h = (h * 31 + ch.charCodeAt(0)) >>> 0; return h; }
/** A round: the board lines, the prompt and two moves, the right one first or second by the id's hash. */
function lcoRound(id, i, board, prompt, right, wrong) {
  const flip = ((lcoHash(id) >> (i + 5)) & 1) === 1;
  const a = { text: right, safe: true }, b = { text: wrong, safe: false };
  return { board, prompt, options: flip ? [b, a] : [a, b] };
}

const lcoGame = (slug, lesson, title, mechanic, idea, summary, rounds) => {
  const l = LK_LESSONS.find((x) => x.id === lesson);
  return { id: `lco-apply-${slug}`, lesson, world: "parishes", kind: "apply-step", parish: l.anchors[0].map, site: l.anchors[0].site,
    title, task: title.toLowerCase(), mechanic, minutes: LCO_APPLY_MINUTES, idea, summary, rounds };
};

export const LCO_APPLY_GAMES = [
  lcoGame("marsh-builder", "lk-lesson-new-marsh", "Marsh Builder", "survey-transect",
    "Mud behind a wall, grass on top, and feet on the mats.",
    "Help the crew build a patch of new marsh: pick where the mud goes, what holds it and where you stand to watch.",
    [
      [["  open water where marsh used to be", "  [earth wall] ── pipe ── dredge"], "The dredge is ready to pump mud. Where should it go?", "Behind the earth wall, where the water is calm.", "Straight into the open water, where the waves are."],
      [["  new mud behind the wall", "  bare mud · no plants yet"], "The mud has settled. What will hold it in place?", "Plant marsh grass so the roots grip the mud.", "Leave it bare so the waves can smooth it."],
      [["  crew planting grass", "  boardwalk · mats · soft mud"], "You want a closer look at the planting. Where do you stand?", "On the boardwalk mats, beside the crew leader.", "Out on the soft new mud, next to the plants."],
    ]),
  lcoGame("lock-keeper", "lk-lesson-lock-and-levee", "Lock Keeper", "switching-order",
    "One gate at a time, and only when the levels match.",
    "Take a model boat up through a lock: let the water in, wait for the levels to match, then open the next gate.",
    [
      [["  low river │ chamber │ high river", "  boat in the chamber · both gates shut"], "The boat is in the chamber. How do you lift it?", "Let water in slowly from the high side while both gates stay shut.", "Open the top gate wide so the water rushes in."],
      [["  low river │ chamber ≈ high river", "  levels nearly match"], "The chamber is still a little lower than the river. What now?", "Wait until the gauge shows both levels match.", "Open the top gate now; it is close enough."],
      [["  levels match · top gate opening", "  visitors at the rail"], "The top gate is opening. Where do the visitors stay?", "Behind the rail, while the lock crew handles the lines.", "At the edge, helping to pull the ropes."],
    ]),
  lcoGame("energy-path", "lk-lesson-power-path", "Energy Path", "line-follow",
    "Energy changes form at every step and never disappears.",
    "Follow the energy from the store to the computers and out as heat, one stop at a time.",
    [
      [["  stored gas ─▶ turbine and generator ─▶ ?"], "The generator makes electricity. Where does it go next?", "To the substation, which gets it ready for the site.", "Straight back into the gas store."],
      [["  substation ─▶ computers ─▶ ?"], "The computers use the electricity. What does most of it become?", "Heat, which has to be carried away.", "Nothing at all; it simply vanishes."],
      [["  computers ─▶ heat ─▶ ?", "  fenced yard · cooling plant"], "The hall is getting warm. What carries the heat away?", "The cooling plant, run by trained technicians.", "Opening the fence gate to let the breeze in."],
    ]),
  lcoGame("walk-round", "lk-lesson-wing-lift", "Walk-Round", "inspection-grid",
    "A moving wing pushes air down, and the air pushes the wing up.",
    "Walk round a parked model aircraft with the mechanic and check what gives the wing its lift.",
    [
      [["  parked aircraft · wings level", "  ▶ the wing"], "The wing moves through the air. Which way does it push the air?", "Down, so the air pushes the wing up.", "Up, so the wing is pulled down."],
      [["  ✓ the wing  ▶ the flaps"], "The aircraft will take off slowly. What do the flaps do?", "Change the wing's shape to give more lift at slow speed.", "Nothing; flaps are only there for looks."],
      [["  ✓ the wing  ✓ the flaps  ▶ the hinges"], "One flap hinge feels stiff on the walk-round. What is the call?", "Tell the mechanic so it is fixed before flight.", "Say nothing; it will loosen up in the air."],
    ]),
  lcoGame("load-to-the-mark", "lk-lesson-steel-hull", "Load to the Mark", "lift-sequencer",
    "A hollow hull pushes aside lots of water, and the water pushes back up.",
    "Shape a model hull, load it to its mark and send it down the slip.",
    [
      [["  test tank · two pieces of the same steel", "  [lump]   [hollow hull]"], "Which one will float?", "The hollow hull, because it pushes aside more water.", "The lump, because it is smaller."],
      [["  hull afloat · load mark on the side", "  crates on the dock"], "You are loading crates. When do you stop?", "When the water reaches the load mark.", "When the dock is empty, wherever the mark is."],
      [["  hull loaded · crates all at one end"], "The hull tips to one side. What do you do?", "Spread the load evenly from end to end.", "Add more crates to the other end until it is full."],
    ]),
  lcoGame("build-order", "lk-lesson-crews-behind-the-build", "Build Order", "delivery-run",
    "Many trades work in turn, and an apprentice learns step by step.",
    "Put the crews of a big build in order, then plan a first step into a trade.",
    [
      [["  empty site · survey stakes", "  crews waiting at the gate"], "Which crew starts the job?", "The surveyors, who mark where everything goes.", "The painters, so the site looks finished."],
      [["  ✓ survey  ✓ ground work  ▶ next"], "The ground is ready. Who comes next?", "The concrete and steel crews, who build the frame.", "The electricians, before there are any walls."],
      [["  workforce centre · notice board"], "A friend wants to start in a trade. What is a good first step?", "Learn the basics, then apply for an apprenticeship.", "Turn up at a site and ask to start work today."],
    ]),
];

/** Lesson id → flow id (WebXR/flows/<flow>.json). */
export const LCO_FLOW_OF = Object.fromEntries(LK_LESSONS.map((l) => [l.id, `lk-${l.id.replace(/^lk-lesson-/, "")}`]));

export function lcoFlowFor(lesson) { return LCO_FLOW_OF[typeof lesson === "string" ? lesson : lesson?.id] ?? null; }
export function lcoApplyGame(id) { return LCO_APPLY_GAMES.find((g) => g.id === id) ?? null; }
export function lcoGameFor(lesson) { const id = typeof lesson === "string" ? lesson : lesson?.id; return LCO_APPLY_GAMES.find((g) => g.lesson === id) ?? null; }
export function lcoApplySteps(id) {
  const g = lcoApplyGame(id);
  return g ? g.rounds.map(([board, prompt, right, wrong], i) => lcoRound(g.id, i, board, prompt, right, wrong)) : [];
}
export function lcoApplyFor(lesson) {
  const g = lcoGameFor(lesson);
  return g ? { kind: "mini-game", id: g.id, game: g, steps: lcoApplySteps(g.id), minutes: LCO_APPLY_MINUTES } : null;
}

/** COGNITION's runner hook (cgMountRunner's `games`): an apply node's ref → { id, title, summary, idea, steps } | null. */
export function lcoGameLookup(ref) {
  const g = lcoApplyGame(ref);
  return g ? { id: g.id, title: g.title, summary: g.summary, idea: g.idea, minutes: g.minutes, steps: lcoApplySteps(g.id) } : null;
}

/** lkSessionLessons plus the lesson's flow id and apply game (same ids and places; the base lesson id before `@`). */
export function lcoSessionLessons(parishId, opts = {}) {
  return lkSessionLessons(parishId, opts).map((s) => {
    const base = s.id.split("@")[0];
    const g = lcoGameFor(base);
    return { ...s, flow: lcoFlowFor(base), apply: g ? { id: g.id, title: g.title, mechanic: g.mechanic, minutes: g.minutes } : null };
  });
}
