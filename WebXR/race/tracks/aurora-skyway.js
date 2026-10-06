// Track: Aurora Skyway.
//
// A high, elevated transit viaduct threading the neon towers at night: a
// banked sweep with the guard rail down for maintenance on its outer edge
// (mind the drop), a chicane past a piling under repair where a gantry crane
// slides back and forth building the next span, and civilian traffic running
// both ways the length of the deck. The skyway and its towers are generic; no
// real transit system is depicted.

export const TRACK_AURORA_SKYWAY = {
  id: "aurora-skyway",
  name: "Aurora Skyway",
  short: "Aurora Skyway",
  blurb: "A high transit viaduct through the neon towers at night: a banked sweep with no rail on its outer edge, and a gantry crane sliding along the next span.",
  width: 15,
  baseY: 45,
  surface: "deck",
  barrier: "rail",
  support: "pillars",
  groundY: 0,
  markings: { centre: "none", dashes: [0], edge: true },
  env: {
    sky: ["#04061a", "#3a1f52"], fog: ["#241a3a", 120, 780],
    hemi: ["#8f9cff", "#141020", 0.95], sun: { colour: "#d8c8ff", intensity: 0.5, dir: [-0.5, 0.6, 0.3] },
    stars: true, moon: { dir: [0.7, 0.32, -0.2], size: 28 }, ground: "#12141c", exposure: 1.25,
  },
  points: [
    [20, -220, 44],     // 0 start / finish, the west deck heading north
    [24, -40, 44],
    [30, 140, 45],
    [60, 230, 46, 6],   // 3 the banked sweep begins — no rail on its outer edge
    [140, 268, 47, 10],
    [220, 220, 47, 10],
    [246, 120, 46, 6],  // 6 sweep out, onto the east deck
    [244, -40, 45],
    [230, -90, 45],     // 8 a chicane past the piling under repair
    [246, -130, 45],
    [222, -170, 45, 6], // 10 the south sweep
    [150, -224, 45, 8],
    [70, -244, 44, 6],
  ],
  zones: [{ kind: "sweep", from: 2.6, to: 6.4 }, { kind: "sweep", from: 9.4, to: 12.2 }],
  noRailZones: [{ from: 3.0, to: 6.0, side: 1 }],
  boostPads: [
    { u: 0.6, d: -3 }, { u: 2.4, d: 0 }, { u: 4.6, d: 3 }, { u: 6.6, d: -3 },
    { u: 8.6, d: 0 }, { u: 10.6, d: 3 }, { u: 12.2, d: -3 },
  ],
  itemBoxes: [
    { u: 1.4, ds: [-4.6, -1.6, 1.6, 4.6] },
    { u: 5.6, ds: [-4.6, -1.6, 1.6, 4.6] },
    { u: 9.4, ds: [-4.6, -1.6, 1.6, 4.6] },
  ],
  hazards: [
    {
      kind: "traffic", count: 8, mix: { sedan: 5, tractorTrailer: 3 }, speed: [13, 18],
      lanes: [{ d: -3.4, dir: 1 }, { d: 3.4, dir: -1 }],
    },
    { kind: "parked", u: 4.3, d: -5.6, vehicle: "bucketTruck" },
  ],
  scenery: [
    { kind: "skyline", count: 60, area: [280, -280, 520, 320], height: [40, 160], avoid: 30, seed: 41 },
    { kind: "skyline", count: 40, area: [-280, -280, -20, 320], height: [30, 130], avoid: 30, seed: 42 },
    { kind: "skyline", count: 24, area: [-60, 300, 320, 460], height: [30, 110], avoid: 30, seed: 43 },
    { kind: "moon" },
    { kind: "movingGantry", from: 7.2, to: 9.8, d: 0, height: 13, period: 16 },
    { kind: "lamps", every: 26, height: 9, colour: "#7ee8ff" },
    { kind: "overheadSign", u: 0.4, text: "AURORA SKYWAY · NIGHT SERVICE" },
  ],
  grid: { back: 12, rows: 4, cols: 2, spacing: 10, gap: 6 },
};
