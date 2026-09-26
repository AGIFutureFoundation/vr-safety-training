// Liveries the race unlocks from the rest of the platform (docs/easter-egg.md):
//
//  - Hard Hat Gold, unlocked when all twelve hard hats (shared/eggs.js) are
//    found.
//  - One skin per programme with a twenty-level ladder, named after the
//    programme, unlocked by a passed attempt tagged as that programme's
//    level-20 capstone (shared/ladder.js's LADDER_LEVELS) — see
//    shared/records.js for the `.ladder` tag a station attempt carries, and
//    shared/ladder.js's levelTag() for where it comes from. "Finishing the
//    capstone" here means one passed attempt on the capstone level's chain,
//    not a full mastery run of every task in it (that fuller rule lives in
//    shared/ladder.js's levelResult, for the ladder itself) — a livery is a
//    lighter bar than the level badge, honestly stated as such.
//
// Pure: no THREE, no DOM, so tools/check_eggs.mjs can grade the unlock rule
// headless against a fake localStorage.
import { CAPSTONE_LIVERIES } from "./capstone-liveries.js";
import { HARD_HAT_TOTAL } from "../../shared/eggs.js";

export const LADDER_CAPSTONE_LEVEL = 20;

/** True once every attempt record shows a passed attempt on that programme's capstone level. */
export function capstoneUnlocked(records, programme) {
  return (records ?? []).some((r) => r?.passed && r?.ladder?.programme === programme && r?.ladder?.level === LADDER_CAPSTONE_LEVEL);
}

/**
 * Every livery the race can show, in a stable order: Hard Hat Gold first,
 * then one row per programme with a ladder. Each row is
 * { id, name, colour, fleetName, unlocked, programme? }.
 */
export function liveryList(records, hardHatsFoundCount) {
  const list = [{
    id: "hardhat-gold", name: "Hard Hat Gold", fleetName: "HARD HAT HUNT",
    colour: 0xf2c14b, unlocked: (hardHatsFoundCount | 0) >= HARD_HAT_TOTAL,
    note: `${hardHatsFoundCount | 0}/${HARD_HAT_TOTAL} hard hats found`,
  }];
  for (const l of CAPSTONE_LIVERIES) {
    list.push({
      id: `capstone:${l.programme}`, name: l.name, fleetName: l.name.toUpperCase(),
      colour: hexToColour(l.accent), unlocked: capstoneUnlocked(records, l.programme),
      programme: l.programme, note: `Level ${LADDER_CAPSTONE_LEVEL} capstone, ${l.name}`,
    });
  }
  return list;
}

function hexToColour(hex) {
  const m = /^#?([0-9a-f]{6})$/i.exec(String(hex ?? ""));
  return m ? Number.parseInt(m[1], 16) : 0x7ee6ff;
}
