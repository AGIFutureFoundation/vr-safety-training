// Track: Beach Boardwalk Sprint.
//
// A dusk boardwalk lap: out along the sand-side promenade, up a ramp onto a
// pier that runs out over the sea on pillars, round the pier head and back,
// then along a stretch of soft beach sand that saps your grip past a
// lifeguard tower, with gulls lifting off the railing as you pass. The pier,
// the tower and the beach are generic; no real boardwalk is depicted.

export const TRACK_BEACH_BOARDWALK = {
  id: "beach-boardwalk",
  name: "Beach Boardwalk Sprint",
  short: "Beach Boardwalk",
  blurb: "A dusk pier over the sea on pillars, a soft-sand stretch that saps your grip past the lifeguard tower, and gulls off the rail.",
  width: 16,
  baseY: 0.3,
  surface: "deck",
  barrier: "rail",
  support: "pillars",
  groundY: 0,
  markings: { centre: "none", dashes: [0], edge: true },
  env: {
    sky: ["#1c2f52", "#f2a35c"], fog: ["#f0b47a", 90, 620],
    hemi: ["#ffdcae", "#233a52", 0.95], sun: { colour: "#ffb066", intensity: 0.95, dir: [0.55, 0.32, -0.6] },
    stars: false, ground: "#d9c48a", exposure: 1.12,
  },
  points: [
    [-40, -170, 0.3],   // 0 start / finish, beach promenade heading east
    [60, -168, 0.3],
    [150, -150, 0.4],
    [214, -108, 1.2],
    [244, -50, 3.0],    // 4 the ramp up onto the pier
    [258, 10, 5.0],     // pier deck over the sea, on pillars
    [252, 74, 5.0],
    [214, 122, 3.6],    // 7 the pier-head turn
    [150, 140, 1.6],
    [80, 150, 0.4],     // 9 back on the boardwalk
    [0, 158, 0.3],
    [-80, 148, 0.3],
    [-150, 118, 0.4],
    [-198, 68, 0.5],
    [-214, 4, 0.5],     // 14 the soft-sand flats
    [-200, -60, 0.4],
    [-160, -112, 0.3],
    [-100, -150, 0.3],
  ],
  zones: [{ kind: "pier", from: 3.4, to: 7.6 }, { kind: "sand", from: 13, to: 15.2 }],
  boostPads: [
    { u: 1.2, d: -3 }, { u: 5.2, d: 0 }, { u: 8.6, d: 3 }, { u: 10.4, d: -3 },
    { u: 12.2, d: 0 }, { u: 15.8, d: 3 }, { u: 17.2, d: -3 },
  ],
  itemBoxes: [
    { u: 2.3, ds: [-5, -1.8, 1.8, 5] },
    { u: 9.4, ds: [-5, -1.8, 1.8, 5] },
    { u: 16.0, ds: [-5, -1.8, 1.8, 5] },
  ],
  hazards: [
    {
      kind: "traffic", count: 5, mix: { pickup: 3, sedan: 2 }, speed: [9, 13],
      lanes: [{ d: -3.4, dir: 1 }, { d: 3.4, dir: -1 }],
    },
    { kind: "slick", from: 13.15, to: 14.9, d: 0, w: 10, what: "soft sand" },
  ],
  scenery: [
    { kind: "sea", x0: 282 },
    { kind: "hills", at: [[-300, 300], [280, -320]] },
    { kind: "lamps", every: 30, height: 8, colour: "#ffd9a0" },
    { kind: "lifeguardTower", x: -44, z: 40, ry: 0.5 },
    { kind: "flock", area: [-260, 60, -50, 220], count: 14, colour: "#f4f4f0", y: 15, period: 9 },
    { kind: "overheadSign", u: 0.6, text: "BOARDWALK SPRINT · MIND THE SAND" },
  ],
  grid: { back: 12, rows: 4, cols: 2, spacing: 10, gap: 6 },
};
