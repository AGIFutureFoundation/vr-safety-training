// Track: Marsh Levee Loop.
//
// A levee road around a restored wetland: a dip where the road drops toward
// the marsh floor, closed off by a tide gate that floods it on a timer, and
// egrets lifting off the reeds as you pass. The levee, its gate and the
// wetland are generic; no real restoration project is depicted.

export const TRACK_MARSH_LEVEE = {
  id: "marsh-levee",
  name: "Marsh Levee Loop",
  short: "Marsh Levee",
  blurb: "A levee road around a restored wetland: a tide gate floods the low dip on a timer, and egrets lift off the reeds as you pass.",
  width: 15,
  baseY: 4,
  surface: "dirt",
  barrier: "berm",
  support: "skirt",
  groundY: 0,
  markings: { centre: "none", dashes: [], edge: false },
  env: {
    sky: ["#274a3c", "#bcd98a"], fog: ["#a9c48a", 80, 560],
    hemi: ["#cfe8a0", "#2a3a24", 0.9], sun: { colour: "#fff0b0", intensity: 0.9, dir: [0.4, 0.55, -0.4] },
    stars: false, ground: "#5a6b48", exposure: 1.1,
  },
  points: [
    [-180, 60, 4],      // 0 start / finish, the levee heading south-east
    [-90, 90, 4],
    [10, 86, 4],
    [100, 60, 4],
    [160, 10, 4.5],     // 4 the corner above the marsh
    [176, -70, 4.5],
    [140, -140, 4],     // 6 the dip begins
    [70, -176, 2],      // 7 the low point — flooded when the gate is open
    [-10, -170, 2],
    [-80, -140, 3],     // 9 the dip ends, climbing back
    [-150, -90, 4],
    [-196, -20, 4, 4],
    [-206, 30, 4],
  ],
  zones: [{ kind: "dip", from: 5.6, to: 9.2 }],
  boostPads: [
    { u: 0.8, d: -3 }, { u: 2.6, d: 0 }, { u: 4.6, d: 3 }, { u: 6.8, d: 0 },
    { u: 8.8, d: -3 }, { u: 10.6, d: 3 }, { u: 12.0, d: -3 },
  ],
  itemBoxes: [
    { u: 1.6, ds: [-4.6, -1.6, 1.6, 4.6] },
    { u: 5.4, ds: [-4.6, -1.6, 1.6, 4.6] },
    { u: 9.6, ds: [-4.6, -1.6, 1.6, 4.6] },
  ],
  hazards: [
    {
      kind: "traffic", count: 6, mix: { pickup: 4, dumpTruck: 2 }, speed: [9, 13],
      lanes: [{ d: -3.3, dir: 1 }, { d: 3.3, dir: -1 }],
    },
    { kind: "tidegate", from: 6.0, to: 8.6, d: 0, w: 11, period: 15, openFor: 6, phase: 3 },
  ],
  scenery: [
    { kind: "hills", at: [[-320, 320], [320, -320], [320, 320], [-320, -320]] },
    { kind: "lamps", every: 34, height: 7, colour: "#dfead0" },
    { kind: "flock", area: [-150, -250, 60, -60], count: 12, colour: "#f2f2ea", y: 9, period: 11 },
    { kind: "tideGate", u: 6.0, d: -1 },
    { kind: "overheadSign", u: 0.5, text: "LEVEE LOOP · WATCH FOR HIGH WATER" },
  ],
  grid: { back: 12, rows: 4, cols: 2, spacing: 10, gap: 6 },
};
