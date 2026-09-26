// Track: Quarry Night Shift.
//
// Quarry Haul Road run the other way round and worked after dark: down the
// long ramp that was the climb out, across the pit floor past the crusher and
// the stockpiles, and up both banked switchbacks under the light towers, with
// a haul truck crossing the pit floor and another crossing at each
// switchback — a busier night shift than the daytime haul. The pit is the
// same generic one; no real quarry or company is depicted.

export const TRACK_QUARRY_NIGHT_SHIFT = {
  id: "quarry-night-shift",
  name: "Quarry Night Shift",
  short: "Quarry Night Shift",
  blurb: "The quarry haul road run in reverse after dark, lit by light towers, with a haul truck crossing the pit floor and another at each switchback.",
  width: 15,
  baseY: 0,
  surface: "dirt",
  barrier: "berm",
  support: "skirt",
  groundY: -1,
  markings: { centre: "none", dashes: [], edge: false },
  env: {
    sky: ["#050810", "#241c14"], fog: ["#3a3226", 50, 420],
    hemi: ["#c9b48a", "#141018", 0.6], sun: { colour: "#3a2a1a", intensity: 0.15, dir: [0.5, 0.2, -0.3] },
    stars: true, ground: "#4a3a2c", exposure: 1.15, dust: true,
  },
  points: [
    [-214, 50, 28, 6],   // 0 start / finish on the rim, heading down the west wall
    [-216, -40, 22, 8],
    [-170, -112, 15, 6],
    [-92, -152, 8],
    [0, -168, 3],        // 4 the pit floor — a haul truck crosses here
    [92, -162, 1],
    [140, -114, 0, 6],   // 6 switchback one (banked) — a haul truck crosses here too
    [112, -64, 0],
    [50, -42, 2],
    [-30, -32, 6],
    [-102, -20, 10, 10], // 10 switchback two (banked) — and here
    [-112, 22, 12, 10],
    [-40, 40, 15],
    [60, 40, 19],
    [146, 28, 23, 10],
    [174, 62, 25, 10],
    [138, 102, 27],
    [60, 122, 29],
    [-50, 126, 30],
    [-150, 122, 30],     // 19 back along the rim to the start
  ],
  zones: [{ kind: "pit", from: 3.4, to: 8 }],
  boostPads: [
    { u: 1.5, d: -3 }, { u: 3.6, d: 0 }, { u: 6.4, d: 3 }, { u: 9.5, d: -3 },
    { u: 12.6, d: 0 }, { u: 15.6, d: 3 }, { u: 17.5, d: -3 },
  ],
  itemBoxes: [
    { u: 2.4, ds: [-5, -1.7, 1.7, 5] },
    { u: 8.3, ds: [-5, -1.7, 1.7, 5] },
    { u: 14.5, ds: [-5, -1.7, 1.7, 5] },
  ],
  hazards: [
    {
      kind: "traffic", count: 6, mix: { pickup: 3, dumpTruck: 3 }, speed: [9, 13],
      lanes: [{ d: -3.6, dir: 1 }, { d: 3.6, dir: -1 }],
    },
    { kind: "crossing", u: 4.3, vehicle: "haulTruck", span: 34, speed: 6, wait: 5, phase: 2 },
    { kind: "crossing", u: 10.2, vehicle: "haulTruck", span: 22, speed: 5, wait: 6, phase: 4 },
    { kind: "crossing", u: 15.3, vehicle: "haulTruck", span: 22, speed: 5, wait: 6, phase: 0 },
  ],
  scenery: [
    { kind: "benches", centre: [-20, -20], radius: [255, 175], levels: [0, 12, 24, 36], seed: 32 },
    { kind: "stockpiles", at: [[170, -170, 16], [190, -120, 12], [30, -210, 14], [-60, -210, 10]] },
    { kind: "crusher", x: 196, z: -70 },
    { kind: "dust" },
    { kind: "masts", every: 60, height: 30, colour: "#fff3d0" },
    { kind: "haulSigns", u: [3.8, 9.7, 14.8] },
  ],
  grid: { back: 12, rows: 4, cols: 2, spacing: 10, gap: 6 },
};
