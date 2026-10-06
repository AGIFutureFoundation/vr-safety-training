// Track: Quarry Haul Road.
//
// Dirt haul road into an open pit at dusk: along the rim, down two banked
// switchbacks cut into the benches, across the pit floor past the crusher and
// the stockpiles, and up the long ramp to the rim again. The road is edged
// with safety berms, as a real haul road is. A haul truck crosses the pit
// floor on its own cycle from the loading face to the crusher; pickups and
// dump trucks use the road in both directions. The pit is generic.

export const TRACK_QUARRY_HAUL = {
  id: "quarry-haul",
  name: "Quarry Haul Road",
  short: "Quarry Haul",
  blurb: "A dirt haul road into an open pit: banked switchbacks down the benches, dust, safety berms and a haul truck crossing the pit floor.",
  width: 15,
  baseY: 0,
  surface: "dirt",
  barrier: "berm",
  support: "skirt",
  groundY: -1,
  markings: { centre: "none", dashes: [], edge: false },
  env: {
    sky: ["#2a2340", "#c7835a"], fog: ["#8d6c52", 60, 520],
    hemi: ["#f0c9a0", "#4a3a2c", 0.95], sun: { colour: "#ffb070", intensity: 1.0, dir: [0.8, 0.28, -0.3] },
    stars: false, ground: "#6b5440", exposure: 1.05, dust: true,
  },
  points: [
    [-150, 122, 30],    // 0 start / finish on the rim, heading east
    [-50, 126, 30],
    [60, 122, 29],
    [138, 102, 27],
    [174, 62, 25, 10],  // 4 switchback one (right-hander), banked
    [146, 28, 23, 10],
    [60, 40, 19],
    [-40, 40, 15],
    [-112, 22, 12, 10], // 8 switchback two (left-hander), banked
    [-102, -20, 10, 10],
    [-30, -32, 6],
    [50, -42, 2],
    [112, -64, 0],      // 12 the pit floor
    [140, -114, 0, 6],
    [92, -162, 1],
    [0, -168, 3],       // 15 haul-truck crossing
    [-92, -152, 8],
    [-170, -112, 15, 6],
    [-216, -40, 22, 8], // 18 the long ramp up the west wall
    [-214, 50, 28, 6],
    [-194, 102, 30],
  ],
  zones: [{ kind: "pit", from: 11, to: 16 }],
  boostPads: [
    { u: 0.5, d: 3 }, { u: 2.4, d: -3 }, { u: 6.5, d: 0 }, { u: 10.5, d: 3 },
    { u: 14.5, d: -3 }, { u: 18.5, d: 0 }, { u: 19.6, d: 3 },
  ],
  itemBoxes: [
    { u: 1.5, ds: [-5, -1.7, 1.7, 5] },
    { u: 7.3, ds: [-5, -1.7, 1.7, 5] },
    { u: 16.5, ds: [-5, -1.7, 1.7, 5] },
  ],
  hazards: [
    {
      kind: "traffic", count: 6, mix: { pickup: 3, dumpTruck: 3 }, speed: [9, 13],
      lanes: [{ d: -3.6, dir: 1 }, { d: 3.6, dir: -1 }],
    },
    { kind: "crossing", u: 14.6, vehicle: "haulTruck", span: 34, speed: 6, wait: 5, phase: 2 },
  ],
  scenery: [
    { kind: "benches", centre: [-20, -20], radius: [255, 175], levels: [0, 12, 24, 36], seed: 31 },
    { kind: "stockpiles", at: [[170, -170, 16], [190, -120, 12], [30, -210, 14], [-60, -210, 10]] },
    { kind: "crusher", x: 196, z: -70 },
    { kind: "dust" },
    { kind: "haulSigns", u: [14.1, 15.1] },
  ],
  grid: { back: 12, rows: 4, cols: 2, spacing: 10, gap: 6 },
};
