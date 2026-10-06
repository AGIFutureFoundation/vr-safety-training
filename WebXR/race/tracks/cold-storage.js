// Track: Cold Storage Run.
//
// A lap of an ice-cold distribution warehouse at night: down the yard aisles
// between tall racking, a forklift crossing the lane on its own cycle at each
// end, and a stretch of ice on the aisle floor with no grip. Near the back a
// freezer door opens and closes on a timer — wait for it, or clip it closed.
// The warehouse, its racking and the freezer are generic; no real operator or
// facility is depicted.

export const TRACK_COLD_STORAGE = {
  id: "cold-storage",
  name: "Cold Storage Run",
  short: "Cold Storage",
  blurb: "An ice-cold distribution warehouse: slick aisles, forklifts crossing on their own cycle, and a freezer door that opens on a timer.",
  width: 14,
  baseY: 0.2,
  surface: "concrete",
  barrier: "jersey",
  support: "none",
  groundY: 0,
  markings: { centre: "none", dashes: [], edge: true },
  env: {
    sky: ["#0a1420", "#48607a"], fog: ["#7c98ab", 70, 480],
    hemi: ["#bcd8e8", "#101822", 0.9], sun: { colour: "#dfeeff", intensity: 0.5, dir: [0.3, 0.6, -0.4] },
    stars: true, ground: "#c9d6dc", exposure: 1.1,
  },
  points: [
    [-160, -110, 0.2],  // 0 start / finish, south aisle heading east
    [-40, -114, 0.2],
    [90, -108, 0.2],
    [160, -90, 0.2],    // 3 round the south-east corner
    [190, -40, 0.2],
    [188, 30, 0.2],
    [160, 84, 0.2],     // 6 round the north-east corner
    [90, 108, 0.2],     // north aisle heading west
    [10, 118, 0.2],
    [-40, 96, 0.2],     // 9 a chicane between the racking bays
    [-100, 112, 0.2],
    [-170, 96, 0.2],    // 11 round the north-west corner, the freezer door just ahead
    [-206, 40, 0.2],    // 12 through the freezer chamber
    [-208, -30, 0.2],
    [-186, -86, 0.2],   // 14 round the south-west corner, ice on the floor
  ],
  zones: [{ kind: "chicane", from: 8, to: 10 }, { kind: "freezer", from: 11.5, to: 13.3 }],
  boostPads: [
    { u: 1.0, d: -3 }, { u: 3.6, d: 0 }, { u: 6.0, d: 3 }, { u: 8.0, d: -3 },
    { u: 10.4, d: 0 }, { u: 12.0, d: 3 }, { u: 13.4, d: -3 },
  ],
  itemBoxes: [
    { u: 2.2, ds: [-4.5, -1.6, 1.6, 4.5] },
    { u: 7.4, ds: [-4.5, -1.6, 1.6, 4.5] },
    { u: 11.4, ds: [-4.5, -1.6, 1.6, 4.5] },
  ],
  hazards: [
    {
      kind: "traffic", count: 4, mix: { pickup: 2, dumpTruck: 2 }, speed: [7, 10],
      lanes: [{ d: -3.2, dir: 1 }, { d: 3.2, dir: -1 }],
    },
    { kind: "crossing", u: 3.4, vehicle: "forklift", span: 18, speed: 4, wait: 4, phase: 0 },
    { kind: "crossing", u: 9.6, vehicle: "forklift", span: 18, speed: 4.5, wait: 5, phase: 5 },
    { kind: "gate", u: 11.5, d: 0, w: 11, period: 9, openFor: 4, phase: 2 },
    { kind: "slick", from: 13.2, to: 13.6, d: 0, w: 11, what: "ice" },
  ],
  scenery: [
    { kind: "tunnel", from: 11.5, to: 13.3 },
    { kind: "frames", at: [[280, -40, 50, 30, 7], [280, 60, 50, 30, 7], [-280, -20, 50, 30, 7], [-280, 80, 50, 30, 7], [0, 190, 60, 26, 6], [0, -190, 60, 26, 6]] },
    { kind: "lamps", every: 28, height: 9, colour: "#bfe8ff" },
    { kind: "overheadSign", u: 0.6, text: "COLD STORAGE · HARD HAT AREA" },
    { kind: "overheadSign", u: 11.3, text: "FREEZER DOOR · WAIT FOR GREEN" },
  ],
  grid: { back: 12, rows: 4, cols: 2, spacing: 10, gap: 6 },
};
