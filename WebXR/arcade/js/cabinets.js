// Break Room Arcade — the cabinet registry. Three original games, each with
// a pure engine module (create()/step()/render()), a title/controls card and
// its teaching line. Adding a fourth cabinet means a new games/*.js engine,
// an entry here, and a slot in tools/check_arcade.mjs.

import * as SpoolYard from "./games/spoolyard.js";
import * as CrewRun from "./games/crewrun.js";
import * as PalletStacker from "./games/palletstacker.js";

export const ARCADE_CABINETS = [
  {
    id: "spoolyard",
    name: "Spool Yard",
    genre: "Climbing platformer",
    players: 1,
    blurb: "Climb the steel frame while cable spools roll down off the ramps. Tie off at each level's anchor for a bonus, then reach the crane cab. Four boards, rising difficulty.",
    teaches: SpoolYard.SY_TEACHES,
    controls: "Move: ← → or A/D. Climb: hold ↑/↓ or W/S against a ladder. Esc pauses.",
    width: SpoolYard.SY_WIDTH,
    height: SpoolYard.SY_HEIGHT,
    engine: { create: SpoolYard.syCreate, step: SpoolYard.syStep, render: SpoolYard.syRender },
  },
  {
    id: "crewrun",
    name: "Crew Run",
    genre: "Side-scrolling platformer",
    players: 1,
    blurb: "A hard-hatted apprentice runs the jobsite: jump the trenches, duck the swinging loads, stomp the hazard icons and pick up PPE. A foreman checks your kit at the end of each of three stages.",
    teaches: CrewRun.CR_TEACHES,
    controls: "Jump: ↑ / W / Space. Duck: ↓ / S (hold under a swinging load). Esc pauses.",
    width: CrewRun.CR_WIDTH,
    height: CrewRun.CR_HEIGHT,
    engine: { create: CrewRun.crCreate, step: CrewRun.crStep, render: CrewRun.crRender },
  },
  {
    id: "palletstacker",
    name: "Pallet Stacker",
    genre: "Falling-block stacker",
    players: 2,
    blurb: "Pallets of different shapes drop into the truck bed. Complete a row to ship it. The load shifts if the stack leans, and levels speed up. Two-player split screen.",
    teaches: PalletStacker.PS_TEACHES,
    controls: "P1: A/D move, W rotate, S soft drop, Space hard drop. P2: ← → move, ↑ rotate, ↓ soft drop, Enter hard drop. Esc pauses.",
    width: null, // sized from psBoardSize() × player count at run time
    height: null,
    engine: { create: PalletStacker.psCreate, step: PalletStacker.psStep, render: PalletStacker.psRender },
  },
];

export const ARCADE_CABINET_IDS = ARCADE_CABINETS.map((c) => c.id);
