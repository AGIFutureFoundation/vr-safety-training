// Track: Downtown Site Shuffle.
//
// A tight, technical lap of a downtown construction site: between two tower
// cranes, over the podium deck and down its ramp, past the trench-box run
// behind its barricade and through the wet slab of a concrete pour (low grip
// until you are across). Site traffic — pickups and dump trucks — uses the
// haul lanes in both directions. The site, its hoarding and its cranes are
// generic.

export const TRACK_DOWNTOWN_SITE = {
  id: "downtown-site",
  name: "Downtown Site Shuffle",
  short: "Downtown Site",
  blurb: "A tight construction-site course between tower cranes, over the podium deck, past a trench-box run and through a wet concrete pour.",
  width: 14,
  baseY: 0.2,
  surface: "concrete",
  barrier: "fence",
  support: "skirt",
  groundY: 0,
  markings: { centre: "none", dashes: [], edge: true },
  env: {
    sky: ["#0a0d18", "#343a55"], fog: ["#1b1f2e", 90, 520],
    hemi: ["#a3b2d6", "#221f1c", 0.85], sun: { colour: "#e2e8ff", intensity: 0.6, dir: [-0.3, 0.7, 0.5] },
    stars: true, ground: "#2d2b29", exposure: 1.2,
  },
  points: [
    [0, -96, 0.2],      // 0 start / finish, heading east along the hoarding
    [70, -96, 0.2],
    [112, -74, 0.2],
    [120, -30, 0.2],
    [102, 0, 0.2],      // 4 chicane between the crane bases
    [122, 32, 0.2],
    [110, 74, 0.2],
    [66, 90, 0.2],
    [22, 74, 0.6],
    [-8, 44, 3.2],      // 9 up the ramp onto the podium deck
    [-50, 40, 6],
    [-84, 68, 6],
    [-124, 70, 4.5],
    [-154, 40, 1.4],    // 13 down the ramp
    [-156, -12, 0.2],
    [-124, -46, 0.2],   // 15 trench-box run on the right
    [-84, -40, 0.2],
    [-62, -78, 0.2],    // 17 the concrete pour
    [-32, -96, 0.2],
  ],
  zones: [{ kind: "podium", from: 9, to: 13 }],
  boostPads: [
    { u: 0.6, d: 2.5 }, { u: 3.5, d: -2.5 }, { u: 7.5, d: 0 }, { u: 10.4, d: 2.5 },
    { u: 12.5, d: -2.5 }, { u: 14.5, d: 0 }, { u: 18.4, d: 2.5 },
  ],
  itemBoxes: [
    { u: 1.4, ds: [-4.5, -1.5, 1.5, 4.5] },
    { u: 8.3, ds: [-4.5, -1.5, 1.5, 4.5] },
    { u: 15.5, ds: [-4.5, -1.5, 1.5, 4.5] },
  ],
  hazards: [
    {
      kind: "traffic", count: 4, mix: { pickup: 2, dumpTruck: 2 }, speed: [7, 10],
      lanes: [{ d: -3.3, dir: 1 }, { d: 3.3, dir: -1 }],
    },
    { kind: "trench", from: 14.4, to: 15.9, d: -5.7, w: 2.4 },
    { kind: "slick", from: 16.9, to: 17.35, d: 1.5, w: 9, what: "wet concrete" },
    { kind: "cones", from: 16.75, to: 17.5, d: -5.5, taper: 0, spacing: 5 },
  ],
  scenery: [
    { kind: "towerCranes", at: [[70, 12, 62, 0.6], [-100, -4, 70, 2.4]] },
    { kind: "frames", at: [[180, -40, 40, 30, 7], [40, 150, 50, 30, 9], [-200, 90, 36, 36, 6], [-40, -170, 60, 26, 5]] },
    { kind: "skyline", count: 34, area: [-320, -300, 320, 300], height: [40, 130], avoid: 60, seed: 51 },
    { kind: "pour", u: 17.1, d: 1.5 },
    { kind: "lamps", every: 30, height: 7, colour: "#dfe8ff" },
  ],
  grid: { back: 12, rows: 4, cols: 2, spacing: 8, gap: 5.5 },
};
