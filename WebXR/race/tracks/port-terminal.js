// Track: Port Terminal Sprint.
//
// A ground-level lap of a container terminal after dark: down the stack
// alleys, under the legs of the quay cranes along the berth, past a reefer row
// on its plug posts and back through the yard. Straddle carriers cross the
// course between the stacks on their own cycle, and yard tractors run the
// terminal roads in both directions. Container colours, crane liveries and the
// terminal itself are generic; no real port or operator is drawn.

export const TRACK_PORT_TERMINAL = {
  id: "port-terminal",
  name: "Port Terminal Sprint",
  short: "Port Terminal",
  blurb: "Container stack alleys, a run under the quay cranes along the berth, a reefer row and straddle carriers crossing the course between the stacks.",
  width: 18,
  baseY: 0.2,
  surface: "concrete",
  barrier: "jersey",
  support: "none",
  groundY: 0,
  markings: { centre: "yellow", dashes: [], edge: true },
  env: {
    sky: ["#060a12", "#2a2f3c"], fog: ["#141925", 120, 640],
    hemi: ["#9aa8c6", "#1c1a18", 0.8], sun: { colour: "#ffd9a8", intensity: 0.6, dir: [0.4, 0.6, -0.5] },
    stars: true, ground: "#23262b", exposure: 1.2,
  },
  points: [
    [0, -122],          // 0 start / finish, heading east along the south alley
    [90, -122],
    [170, -116],
    [222, -86],
    [246, -30],         // 4 the berth road, under the quay cranes
    [248, 40],
    [236, 108],
    [196, 146],
    [120, 158],         // 8 reefer row on the left
    [46, 150],
    [8, 118],
    [-18, 76],          // 11 through the stack block
    [-70, 52],
    [-128, 64],
    [-182, 50],
    [-212, 0],
    [-204, -62],
    [-160, -108],
    [-86, -124],
  ],
  zones: [{ kind: "berth", from: 3.6, to: 6.2 }],
  boostPads: [
    { u: 0.6, d: 3 }, { u: 3.4, d: -3 }, { u: 5.0, d: 0 }, { u: 8.5, d: 3 },
    { u: 12.5, d: -3 }, { u: 15.3, d: 0 }, { u: 17.5, d: 3 },
  ],
  itemBoxes: [
    { u: 1.6, ds: [-6, -2, 2, 6] },
    { u: 7.3, ds: [-6, -2, 2, 6] },
    { u: 13.5, ds: [-6, -2, 2, 6] },
  ],
  hazards: [
    {
      kind: "traffic", count: 6, mix: { yardHustler: 4, sedan: 2 }, speed: [10, 14],
      lanes: [{ d: -4.5, dir: 1 }, { d: 4.5, dir: -1 }],
    },
    { kind: "crossing", u: 2.4, vehicle: "straddleCarrier", span: 26, speed: 5, wait: 5, phase: 0 },
    { kind: "crossing", u: 11.6, vehicle: "straddleCarrier", span: 26, speed: 5.5, wait: 4, phase: 6 },
    { kind: "crossing", u: 15.6, vehicle: "straddleCarrier", span: 26, speed: 4.5, wait: 6, phase: 3 },
  ],
  scenery: [
    { kind: "water", x0: 300 },
    { kind: "containers", rects: [[20, -100, 200, -20], [20, 0, 200, 110], [-180, -95, -30, -10], [-180, 80, -20, 160], [-60, -190, 210, -145], [-270, -120, -225, 110]], avoid: 16, seed: 21 },
    { kind: "quayCranes", at: [[268, -60], [268, 10], [268, 80]], span: [236, 290] },
    { kind: "ship", x: 330, z: 10, len: 220 },
    { kind: "reeferRow", from: [60, 180], to: [170, 180], count: 5 },
    { kind: "masts", every: 70, height: 26, colour: "#ffd29a" },
  ],
  grid: { back: 12, rows: 4, cols: 2, spacing: 10, gap: 6 },
};
