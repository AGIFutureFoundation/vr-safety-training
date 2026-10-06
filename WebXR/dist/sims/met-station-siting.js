import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, ball, torus, group, decal, repaint, signFace, particles,
} from "../../../shared/kit.js";
import {
  CITY, stationPad, holoPanel, holoTag, toolChest, cone, barrierPanel, instrument,
  standingFigure, surfaceTexture, pavingFace, texturedMat, reg,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Met Station Siting VR — Community Environmental Justice,
// station one hundred fifty-seven, the third of four Hunters Point Edition
// stations. A generic community yard beside a fenced cleanup parcel — no
// real site, no real backyard, no clause number nobody here can source.
//
// The job: site and commission the community's own weather station, the
// instrument every other station in this neighbourhood's air-monitoring
// network leans on to say which way the wind was actually blowing when a
// reading came in. A wind sensor mounted too close to a shed reads the
// shed's own turbulence, not the block's wind; a rain gauge that isn't
// level over- or under-catches every storm it measures for as long as it
// stands there; a mast aligned to magnetic north instead of true north
// mislabels every wind direction the network records by the local
// declination, silently, for good. None of that shows up in a single
// reading — it shows up as a network everyone quietly stops trusting.

const MSS_ACCENT = 0x7fb8e0;

/** The community yard's own gravel-and-grass patch this station sits on —
 *  worn dirt where feet cross it, grass at the edges, not a flat green
 *  rectangle. */
function mssYardFace(g, w, h) {
  g.fillStyle = "#5a6b3f"; g.fillRect(0, 0, w, h);
  g.fillStyle = "rgba(70,58,34,0.35)";
  g.fillRect(w * 0.3, h * 0.2, w * 0.4, h * 0.6);
  for (let i = 0; i < 400; i++) {
    g.fillStyle = `rgba(${60 + Math.random() * 30},${80 + Math.random() * 30},${30 + Math.random() * 20},0.25)`;
    g.fillRect(Math.random() * w, Math.random() * h, 2, 2);
  }
}

export const SIM_MET_STATION_SITING = {
  id: "met-station-siting",
  index: "157",
  domain: "Environmental",
  trade: "Community environmental monitor",
  category: "Community Environmental Justice",
  district: "Environmental Monitoring",
  weather: "wind",
  certification: "The community air network's own siting protocol, drawn from WMO and NOAA/NWS surface-observation siting standards; NFPA 780 lightning protection for the mast's own ground rod; OSHA 29 CFR 1926 fall protection if a tilt-up mast is ever climbed instead of lowered; EPA 40 CFR Part 58 meteorological support requirements for a network whose readings get compared against a federal cleanup order's own air data",
  name: "Met Station Siting",
  title: simTitle("Met Station Siting"),
  tagline: "Siting the community's own weather station: exposure clear of buildings, a tilt-up mast raised and guyed, the datalogger wired and grounded, the mast turned to true north, the rain gauge levelled, and the first day's data checked against the airport's own record",
  accent: MSS_ACCENT,
  accentCss: "#7fb8e0",
  parSeconds: 310,
  footprint: 2.5,
  badge: { id: "true-north-set", name: "True North Set", note: "Sited clear of every obstruction, aligned to true north, levelled, grounded, and the first day's data checked against the airport's before anyone trusts a wind direction off it" },

  game: system({
    name: "Station Siting",
    currency: "SITING",
    ranks: ["Yard Hand", "Mast Rigger", "Siting Lead", "Network Authority", "Siting Certified"],
    badges: [
      { id: "clear-exposure", name: "Clear Exposure", note: "Found the obstruction and sited clear of it, first time", test: AWARD.stepClean("survey-site") },
      { id: "never-shorted", name: "Never Shorted", note: "Never skipped the ground rod, never wired the logger live, never sited on magnetic north", test: AWARD.safe },
      { id: "true-and-level", name: "True and Level", note: "Held the compass alignment and the rain gauge level near band centre", test: AWARD.precise(0.7) },
    ],
    challenges: [
      { id: "clean-siting", name: "Clean Siting", note: "No corrections anywhere in the commissioning", test: AWARD.clean },
      { id: "unbroken-plumb", name: "Unbroken Plumb", note: "Never broke the co-location check", test: AWARD.unbroken },
      { id: "sited-fast", name: "Sited Fast", note: "Logged the siting inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "site-too-close": "You sited the mast in the spot right beside the shed instead of the clear ground the survey found. A wind sensor that close to a building reads the building's own turbulence off its roofline, not the neighbourhood's wind — every direction and speed this station logs from that spot is a reading of the shed, dressed up as a reading of the block.",
    "skip-ground": "You clipped the jumper wire across the ground rod connection instead of running the mast's ground lead to it. A mast is the tallest thing in this yard the moment it's raised, and the ground rod is the only path a lightning strike has to the earth that doesn't run through the logger, the sensors and whoever is standing near them — bypassing it to save a few minutes of driving a rod into hard ground is a bet made with someone else's storm.",
    "wire-live": "You connected the sensor cables to the logger's terminals while the logger was still powered on. A live terminal block does not care whether the hands touching it know the wiring diagram — it shorts, sparks, or slowly fries a channel exactly the same either way, and the fix for a fried input channel on a community station with one spare is however long it takes to get a replacement shipped.",
    "ignore-declination": "You hit the quick-set button and pointed the mast at magnetic north instead of turning it to the true north the compass reading and the local declination actually call for. Every wind direction this station logs from now on is off by the same fixed error nobody sees in any single reading — the network's map of which way the plume moved on a given day is wrong in exactly the direction this shortcut was taken.",
  },

  lateNotes: {
    "compass-align": "Nothing to align yet — the mast has to actually be standing and guyed before turning it means anything, or you're aligning a pole that's still lying on the ground.",
    "rain-gauge-level": "The gauge has to be seated in clear, sited ground first — levelling it before the site survey is done just means levelling it in the wrong spot.",
    "power-switch": "Nothing to power up yet — the sensors have to actually be wired to the logger first, or you're energising a board with nothing connected to it.",
    "datalogger-clock": "Sync it after the station is powered, not before — a clock synced on a dead logger drifts right back to zero the moment power comes on.",
    "colocate-instrument": "Nothing to compare yet — the station has to actually be logging first, or the reference instrument has no live reading to check itself against.",
    "airport-data-board": "Pull this after the co-location check, not before — comparing a full day of data against the airport means nothing until that day has actually been logged.",
  },

  // Both interruptions are armed on a hold or a track step, per the shared
  // interrupt layer — a select, sequence, find, drag, turn or gauge step
  // resolves in one action, too fast for the fuse to ever catch the learner
  // mid-task.
  interrupts: [
    {
      id: "gust-off-plumb",
      kind: "Gust off plumb",
      after: "raise-mast", delay: 4, seconds: 13,
      alert: "A gust just caught the mast as it came up — it's leaning hard to one side and the guys aren't tensioned yet to hold it there.",
      cue: "Grab the steadying handle and hold the mast plumb now, before the next gust puts it on the ground.",
      target: "steady-mast-handle",
      why: "A tilt-up mast between horizontal and vertical, with its guys still slack, is entirely dependent on whoever is holding it — a gust that catches it in that window can walk it right off plumb and into a fall that bends the mast, breaks a sensor mount, or comes down on whoever is standing where the guys were about to go. Steadying it by hand is the only thing holding it up until the first guy line is actually staked.",
      missNote: "The mast leaned further with every gust until it came down against the fence, bending the mount the wind sensor was supposed to sit on — the siting this station spent the last ten minutes getting right now has a bent mast to match it.",
      wrongNote: "Not that — grab the steadying handle. Nothing else in this yard holds a half-raised mast up against the next gust.",
    },
    {
      id: "clock-drift",
      kind: "Clock drift",
      after: "colocate-check", delay: 4, seconds: 13,
      alert: "Checking the co-location readout against your own watch, the logger's timestamp is a full hour off true time.",
      cue: "Reset the logger's clock to true time now, before another hour of readings logs under the wrong timestamp.",
      target: "clock-reset",
      why: "Every reading this network takes is only as useful as the timestamp on it — a station whose clock has drifted an hour logs a real gust or a real exceedance under a time nobody else's record agrees with, which is exactly the kind of discrepancy that lets a comparison against the airport's data, or against another station in the network, be waved away as noise instead of taken as a match.",
      missNote: "The drift went uncorrected through the rest of the day-one check, and every reading logged in that window now carries a timestamp an hour off from what actually happened — a mismatch that shows up the first time anyone tries to line this station's data up against another one.",
      wrongNote: "Not that — reset the logger's clock. Nothing else on this mast fixes a timestamp that's already drifted.",
    },
  ],

  steps: [
    {
      id: "read-siting-guide", kind: "select", target: "siting-guide-board",
      title: "Read the community network's siting protocol",
      cue: "Check the required wind-sensor height, the clearance rule from obstructions, and the rain-gauge levelling spec before you touch a mast.",
      why: "This protocol is where the actual numbers come from — the sensor height, the minimum clearance from anything tall enough to disturb the wind, the levelling tolerance on the rain gauge — and every one of them exists so this station's readings can be compared, honestly, against the airport's and against every other station in the network built to the same spec.",
    },
    {
      id: "survey-site", kind: "find", noHint: true,
      targets: ["shed-obstruction"],
      itemNames: { "shed-obstruction": "shed inside the clearance radius" },
      itemNotes: { "shed-obstruction": "That shed sits well inside the minimum clearance the siting protocol calls for — a mast raised anywhere near it reads the shed's own wind shadow, not the yard's actual exposure." },
      title: "Survey the yard for obstructions",
      cue: "Walk the yard and click the one structure that sits inside the required clearance.",
      why: "A tape measure tells you how far something is; it doesn't tell you whether that's far enough for a given obstruction's height, and walking the yard before committing to a spot is what actually catches a shed or a fence line close enough to disturb the exposure this station is supposed to be reading.",
    },
    {
      id: "site-mast", kind: "drag", target: "mast",
      title: "Carry the mast to the clear ground",
      cue: "Pull the mast off the cart and set its base in the socket the survey found clear.",
      why: "Where this base gets seated decides what every reading the mast ever takes is actually exposed to — seated near the obstruction the survey just found, the mast reads that obstruction's own turbulence for as long as it stands there; seated on the clear ground, it reads the yard's own wind the way the protocol assumes it will.",
      drag: { to: "mast-socket", radius: 0.42, missNote: "Not seated in the clear socket — a base set short of it still sits inside the shed's own wind shadow, not the open exposure the survey found." },
    },
    {
      id: "raise-mast", kind: "hold", target: "mast-crank", seconds: 5,
      title: "Raise the tilt-up mast",
      cue: "Hold the crank turning until the mast locks upright — a rushed crank leaves it swinging on the hinge.",
      why: "A tilt-up mast exists so nobody ever has to climb it — the sensors get mounted at the base and the whole pole is winched upright afterward — and holding the crank through the full raise, rather than letting it free-spin the last stretch, is what brings it to vertical under control instead of letting momentum snap it past plumb on its own hinge.",
      holdBreakNote: "Released the crank before it locked — the mast is still short of vertical. Hold it through to the lock, not to wherever looks close enough.",
    },
    {
      id: "guy-mast", kind: "sequence", anyOrder: true,
      targets: ["guy-n", "guy-e", "guy-w"],
      itemNames: { "guy-n": "north guy line", "guy-e": "east guy line", "guy-w": "west guy line" },
      title: "Stake and tension the guy lines",
      cue: "Stake and tension all three guy lines the moment the mast locks upright.",
      why: "A freshly raised mast is only as stable as the hands that raised it until the guys are tensioned — three lines staked to the ground and pulled tight is what turns a mast someone is still steadying by hand into one that will actually stand through the first real gust after everyone walks away from it.",
    },
    {
      id: "mount-datalogger", kind: "select", target: "datalogger-enclosure",
      title: "Mount the datalogger enclosure",
      cue: "Secure the weatherproof enclosure to the mast before running a single sensor cable to it.",
      why: "Every sensor on this mast terminates at this box, and a box that isn't actually secured and sealed before the cables are run is a box that's still going to need moving — pulling three sets of cable slack loose to reposition an enclosure is exactly the kind of rework that mounting it first, once, avoids.",
    },
    {
      id: "wire-sensors", kind: "sequence", anyOrder: true,
      targets: ["wire-wind", "wire-temp", "wire-rain"],
      itemNames: { "wire-wind": "wind sensor cable", "wire-temp": "temperature sensor cable", "wire-rain": "rain gauge cable" },
      title: "Wire the sensors to the logger",
      cue: "Connect all three sensor cables to their labelled terminals on the powered-down logger.",
      why: "Each sensor's cable has to land on the specific terminal the logger's manual assigns it, or the station logs wind speed into the rain channel and calls it data — checking every cable against its label, with the logger dead, is what makes the wiring something a second person could verify later rather than something only the installer remembers doing right.",
    },
    {
      id: "align-compass", kind: "turn", target: "compass-align",
      title: "Turn the mast to true north",
      cue: "Turn the mounting collar until the reference mark lines up with true north on the compass plate, correcting for local declination.",
      why: "A compass needle points at magnetic north, not true north, and the gap between them at this latitude is large enough to matter — turning the collar to the corrected mark, not just to wherever the needle itself points, is what keeps every wind direction this station ever logs pointed at the actual compass rose the rest of the network and the airport both report against.",
      turn: { turns: 0.55, axis: "y", label: "TRUE NORTH" },
    },
    {
      id: "level-rain-gauge", kind: "gauge", target: "rain-gauge-level",
      title: "Level the rain gauge",
      cue: "Walk the gauge's feet out and commit only once the bubble settles dead centre.",
      why: "A rain gauge that leans even slightly funnels water toward one side of its own funnel instead of catching it evenly, over- or under-reading every storm it measures for as long as it stands there — levelling it once, correctly, before the first rain is the only chance this station gets to make that number honest.",
      gauge: {
        label: "GAUGE LEVEL", speed: 0.55, green: [0.46, 0.54],
        readout: (t) => `${(Math.abs(t - 0.5) * 9).toFixed(1)}° off plumb`,
        missNote: "Not level — the bubble drifted before you committed. Walk a foot back out and settle it dead centre.",
      },
    },
    {
      id: "power-on", kind: "select", target: "power-switch",
      title: "Power up the station",
      cue: "Switch the logger on now that every sensor is wired, grounded and mounted.",
      why: "This is the first moment any of today's wiring actually gets tested — a station powered up only after every cable is checked against its label is a station whose first live reading tells you whether the install is right, instead of whether it's simply live.",
    },
    {
      id: "sync-clock", kind: "select", target: "datalogger-clock",
      title: "Sync the logger's clock",
      cue: "Set the logger's clock to a reference time source before the first reading logs.",
      why: "Every reading this station ever takes carries whatever timestamp the logger's clock reads at that instant, and a clock set from guesswork instead of a reference source is a station whose entire record is offset by however wrong that guess was — syncing it now, at commissioning, is the only chance to start the record honest.",
    },
    {
      id: "colocate-check", kind: "track", target: "colocate-instrument", seconds: 8,
      title: "Run the co-location check",
      cue: "Hold the calibrated reference anemometer beside the new sensor and keep the two readings tracking together.",
      why: "A brand-new sensor can be wired correctly and still read wrong — the only way to catch that at commissioning, rather than a season later when the data finally looks strange, is to hold a known-good instrument beside it and watch the two agree in real time before trusting the new one to run unattended.",
      track: {
        start: 0.5, green: [0.4, 0.6], rise: 0.5, fall: 0.46, drift: 0.14, label: "AGREEMENT",
        readout: (v) => (v < 0.4 ? "new sensor reading low" : v > 0.6 ? "new sensor reading high" : "readings agree"),
      },
      holdBreakNote: "The readings drifted apart — hold the reference instrument steady beside the new sensor until they track together again.",
    },
    {
      id: "compare-airport", kind: "select", target: "airport-data-board",
      title: "Check the first day against the airport's record",
      cue: "Pull the airport's own hourly record for the same day and compare it against this station's first full day of data.",
      why: "The airport's station is the one instrument in the region every reading eventually gets measured against, and a rough match on wind direction and general trend, even with the expected local differences, is the last proof that this siting actually captured this yard's weather rather than something the install itself introduced.",
    },
    {
      id: "log-siting", kind: "select", target: "siting-log",
      title: "Log the siting",
      cue: "Record the mast location, height, true-north alignment and the day-one comparison before you leave the station running.",
      why: "The next technician who services this mast, and the network coordinator deciding whether to trust its data, both read this entry instead of asking the person who installed it — a station left running with no siting record behind it is one nobody but its installer can vouch for.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.5, MSS_ACCENT);

    // -------------------------------------------------------------- ground
    const groundMesh = box(g, 6.2, 0.14, 5.6, 0, 0.07, 0, 0xffffff, { rough: 0.95 });
    groundMesh.material = texturedMat(
      surfaceTexture((cx, w, h) => mssYardFace(cx, w, h), { repeat: 5, px: 512 }),
      { rough: 0.95, metal: 0.02, color: 0xa9b596 },
    );
    const walkway = box(g, 1.2, 0.02, 5.4, -2.1, 0.151, 0, 0xffffff, { rough: 0.8, metal: 0.02, cast: false });
    walkway.material = texturedMat(
      surfaceTexture((cx, w, h) => pavingFace(cx, w, h, { tiles: 3, base: "#8f8d84", base2: "#807e75" }), { repeat: 3, px: 320 }),
      { rough: 0.8, metal: 0.02, color: 0x9a9890 },
    );

    // -------------------------------------------------------------- fence
    for (const z of [-2.2, -0.9]) barrierPanel(g, 2.6, z, { ry: Math.PI / 2, color: 0xe4622a, w: 1.3 });
    for (const z of [0.4, 1.7]) barrierPanel(g, 2.6, z, { ry: Math.PI / 2, color: 0xe4622a, w: 1.3 });
    holoTag(g, "fenced cleanup parcel beyond", 2.6, 1.5, 0.4, { css: "#e4622a", w: 0.6 });

    // ---------------------------------------------------------------- shed
    const shed = group(g, 1.3, 0.14, 1.9);
    box(shed, 0.9, 0.7, 0.7, 0, 0.35, 0, 0xb08a5e, { rough: 0.85 });
    box(shed, 1.0, 0.06, 0.8, 0, 0.72, 0, 0x6a4a30, { rough: 0.8 });
    holoTag(shed, "shed", 0, 0.95, 0, { css: "#7fb8e0", w: 0.24 });
    const clearanceRing = cyl(g, 0.9, 0.9, 0.006, 1.3, 0.153, 1.9, 0xd2312b, { rough: 0.6, opacity: 0.14, transparent: true, cast: false, seg: 28 });
    holoTag(clearanceRing, "clearance radius", 0, 0.05, 0, { css: "#d2312b", w: 0.4 });
    const shedSpot = ball(shed, 0.06, 0, 0.95, 0.4, 0xd2312b, { emissive: 0xd2312b, ei: 0.3, rough: 0.5 });
    reg(hits, shedSpot, "shed-obstruction");
    reg(hits, clearanceRing, "site-too-close");

    // --------------------------------------------------------- siting guide
    const boardPost = group(g, -2.2, 0, -1.9, 0.4);
    holoPanel(boardPost, 0.95, 0.62, 0, 1.3, 0, (ctx, w, h) => {
      ctx.fillStyle = "#0a2436"; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#7fb8e0"; ctx.fillRect(0, 0, w, 6);
      ctx.font = `600 ${Math.round(h * 0.1)}px 'Barlow Condensed', Arial, sans-serif`;
      ctx.textAlign = "left"; ctx.textBaseline = "middle";
      ctx.fillStyle = "#e4f2fb"; ctx.fillText("MET STATION SITING PROTOCOL", w * 0.05, h * 0.12);
      ctx.font = `${Math.round(h * 0.072)}px Arial, sans-serif`; ctx.fillStyle = "#e4f2fb";
      ["Wind sensor height: 10 m standard mast", "Clearance: 10x obstruction height, minimum",
       "Rain gauge: level within 0.5°", "Align mast to TRUE north, not magnetic",
       "Ground every mast to code", "Check day one against the airport's record"].forEach((line, i) => {
        ctx.fillText(line, w * 0.05, h * (0.26 + i * 0.115));
      });
    }, { accent: MSS_ACCENT });
    reg(hits, boardPost, "siting-guide-board");

    // ------------------------------------------------------------- mast cart
    const mastCartPos = group(g, -1.4, 0.14, -1.6);
    const mast = group(mastCartPos, 0, 0, 0, 0.3);
    hits["mast"] = mast;
    const hinge = group(mast, 0, 0.05, 0);
    const pole = group(hinge, 0, 0, 0);
    cyl(pole, 0.03, 0.035, 1.6, 0, 0.8, 0, CITY.steel, { rough: 0.45, metal: 0.65, seg: 12 });
    const crossarm = group(pole, 0, 1.55, 0);
    box(crossarm, 0.5, 0.02, 0.02, 0, 0, 0, CITY.steel, { rough: 0.45, metal: 0.6 });
    const cups = group(crossarm, 0, 0.06, 0);
    for (let i = 0; i < 3; i++) { const c = group(cups, 0, 0, 0, (i * Math.PI * 2) / 3); box(c, 0.13, 0.008, 0.008, 0.065, 0, 0, CITY.steel, { rough: 0.5, metal: 0.6 }); ball(c, 0.024, 0.13, 0, 0, 0x22262b, { rough: 0.6 }); }
    const vaneTail = group(crossarm, 0.25, -0.02, 0, 0.4);
    box(vaneTail, 0.03, 0.09, 0.005, 0, 0, 0, 0xe8eef2, { rough: 0.6 });
    holoTag(pole, "10 m wind mast", 0, 1.75, 0, { css: "#7fb8e0", w: 0.36 });
    // Steadying handle for the gust interrupt — distinct from the crank.
    const steadyHandle = box(pole, 0.06, 0.14, 0.03, 0.06, 0.5, 0, 0xf2ae14, { rough: 0.5 });
    reg(hits, steadyHandle, "steady-mast-handle");
    // Radiation shield for temperature sensor, lower on the mast.
    const shield = group(pole, 0, 0.9, 0.06);
    for (let i = 0; i < 4; i++) cyl(shield, 0.045, 0.045, 0.01, 0, i * 0.03, 0, 0xf3efe4, { rough: 0.6, seg: 16 });

    const mastCrank = group(mastCartPos, 0.12, 0.05, 0.12);
    cyl(mastCrank, 0.05, 0.05, 0.03, 0, 0, 0, 0x2b2f34, { rough: 0.55, metal: 0.4, seg: 16 });
    const crankHandle = box(mastCrank, 0.09, 0.02, 0.02, 0.06, 0.02, 0, 0xb8402f, { rough: 0.5 });
    void crankHandle;
    holoTag(mastCrank, "tilt-up crank", 0, 0.12, 0, { css: "#7fb8e0", w: 0.3 });
    reg(hits, mastCrank, "mast-crank");

    // ------------------------------------------------------------- mast site
    const mastSocket = group(g, -0.8, 0.15, 0.4);
    hits["mast-socket"] = mastSocket;
    const siteRing = cyl(g, 0.16, 0.16, 0.006, -0.8, 0.153, 0.4, 0x7fb8e0, { rough: 0.6, opacity: 0.4, transparent: true, cast: false, seg: 24 });
    void siteRing;
    // Ground rod and its bypass jumper hazard, beside the eventual mast site.
    const groundRod = group(g, -1.0, 0.14, 0.7);
    cyl(groundRod, 0.012, 0.012, 0.3, 0, 0.15, 0, 0x8a5a3a, { rough: 0.7, metal: 0.3, seg: 10 });
    holoTag(groundRod, "ground rod", 0, 0.32, 0, { css: "#7fb8e0", w: 0.3 });
    const groundJumper = box(groundRod, 0.14, 0.01, 0.01, 0.1, 0.3, 0, 0xd2312b, { rough: 0.5 });
    decal(groundJumper, 0.12, 0.02, 0, 0.011, 0, signFace("SHORT GROUND?", { bg: "#2a0c0c", accent: "#ffffff", scale: 0.4 }));
    reg(hits, groundJumper, "skip-ground");

    // -------------------------------------------------------- guy anchors
    const guyDefs = [
      { id: "guy-n", x: -0.8, z: -0.5 },
      { id: "guy-e", x: -0.15, z: 0.7 },
      { id: "guy-w", x: -1.45, z: 0.7 },
    ];
    const guyLines = [];
    for (const gd of guyDefs) {
      const stake = group(g, gd.x, 0.14, gd.z);
      cyl(stake, 0.012, 0.015, 0.14, 0, 0.07, 0, CITY.darkSteel, { rough: 0.6, metal: 0.5, seg: 6 });
      const line = cyl(stake, 0.004, 0.004, 1.1, 0, 0.55, 0, 0xcfd6da, { rough: 0.6, metal: 0.2, seg: 6, cast: false });
      line.visible = false;
      guyLines.push(line);
      reg(hits, stake, gd.id);
    }

    // ------------------------------------------------------------- logger
    const loggerBox = group(mastSocket, 0.12, 0.35, 0, 0.4);
    box(loggerBox, 0.26, 0.32, 0.16, 0, 0, 0, 0x4a545e, { rough: 0.6, metal: 0.3 });
    box(loggerBox, 0.22, 0.28, 0.02, 0, 0, 0.09, 0x39424b, { rough: 0.6, metal: 0.3 });
    holoTag(loggerBox, "datalogger enclosure", 0, 0.3, 0, { css: "#7fb8e0", w: 0.42 });
    reg(hits, loggerBox, "datalogger-enclosure");
    const terminals = group(loggerBox, 0, -0.02, 0.1);
    for (let i = 0; i < 3; i++) box(terminals, 0.05, 0.02, 0.01, -0.06 + i * 0.06, 0, 0, 0x22262b, { rough: 0.6 });
    const wireWind = cyl(terminals, 0.004, 0.004, 0.12, -0.06, -0.08, 0, 0x2f6f4a, { rough: 0.6, seg: 6 });
    const wireTemp = cyl(terminals, 0.004, 0.004, 0.12, 0, -0.08, 0, 0xf2ae14, { rough: 0.6, seg: 6 });
    const wireRain = cyl(terminals, 0.004, 0.004, 0.12, 0.06, -0.08, 0, 0x6fb4d8, { rough: 0.6, seg: 6 });
    reg(hits, wireWind, "wire-wind"); reg(hits, wireTemp, "wire-temp"); reg(hits, wireRain, "wire-rain");
    const liveLight = ball(loggerBox, 0.014, -0.1, 0.1, 0.081, 0xd2312b, { emissive: 0xd2312b, ei: 0.6, rough: 0.5 });
    decal(loggerBox, 0.06, 0.02, -0.05, 0.13, 0.081, signFace("LIVE", { bg: "#2a0c0c", accent: "#ffffff", scale: 0.5 }));
    reg(hits, liveLight, "wire-live");
    const pwrSwitch = box(loggerBox, 0.03, 0.05, 0.01, 0.1, 0, 0.081, 0x22262b, { rough: 0.6 });
    reg(hits, pwrSwitch, "power-switch");
    const clockScreen = decal(loggerBox, 0.2, 0.06, 0, 0.08, 0.081, signFace("--:--", { bg: "#0d1c24", accent: "#7fb8e0", fg: "#bfeaf7", scale: 0.55 }), { glow: true, ei: 0.7 });
    reg(hits, clockScreen, "datalogger-clock");
    const clockReset = box(loggerBox, 0.04, 0.02, 0.01, 0.1, 0.02, 0.081, 0xf2ae14, { rough: 0.5 });
    reg(hits, clockReset, "clock-reset");

    // ------------------------------------------------------ compass plate
    const compassPlate = group(g, -0.8, 0.15, 0.4);
    cyl(compassPlate, 0.28, 0.28, 0.006, 0, 0, 0, 0x1c2a30, { rough: 0.6, seg: 32 });
    decal(compassPlate, 0.24, 0.24, 0, 0.004, 0, signFace("N", { bg: "#1c2a30", accent: "#7fb8e0", scale: 0.7 })).rotation.x = -Math.PI / 2;
    const declinationMark = box(compassPlate, 0.02, 0.005, 0.24, 0.02, 0.006, 0, 0xf2ae14, { rough: 0.5 });
    void declinationMark;
    reg(hits, compassPlate, "compass-align");
    const magneticShortcut = box(compassPlate, 0.1, 0.02, 0.03, -0.2, 0.006, -0.2, 0xd2312b, { rough: 0.5 });
    decal(magneticShortcut, 0.09, 0.018, 0, 0.011, 0, signFace("MAG. NORTH", { bg: "#2a0c0c", accent: "#ffffff", scale: 0.4 }));
    reg(hits, magneticShortcut, "ignore-declination");

    // ----------------------------------------------------------- rain gauge
    const rainGauge = group(g, -0.3, 0.14, 0.9);
    for (const a of [0, (Math.PI * 2) / 3, (Math.PI * 4) / 3]) { const leg = group(rainGauge, 0, 0, 0, a); cyl(leg, 0.012, 0.014, 0.4, 0.1, 0.2, 0, CITY.steel, { rough: 0.5, metal: 0.5, seg: 8 }).rotation.z = 0.4; }
    cyl(rainGauge, 0.06, 0.05, 0.28, 0, 0.5, 0, 0xe8eef2, { rough: 0.5, metal: 0.2, seg: 16 });
    holoTag(rainGauge, "rain gauge", 0, 0.72, 0, { css: "#7fb8e0", w: 0.3 });
    reg(hits, rainGauge, "rain-gauge-level");

    // -------------------------------------------------------- co-location
    const colocatePost = group(g, -0.55, 0.14, 1.2, -0.4);
    cyl(colocatePost, 0.014, 0.014, 0.6, 0, 0.3, 0, CITY.steel, { rough: 0.45, metal: 0.6, seg: 8 });
    const refCups = group(colocatePost, 0, 0.62, 0);
    for (let i = 0; i < 3; i++) { const c = group(refCups, 0, 0, 0, (i * Math.PI * 2) / 3); box(c, 0.08, 0.006, 0.006, 0.04, 0, 0, CITY.steel, { rough: 0.5, metal: 0.6 }); ball(c, 0.015, 0.08, 0, 0, 0x22262b, { rough: 0.6 }); }
    const refScreen = decal(colocatePost, 0.1, 0.05, 0, 0.28, 0.011, signFace("-- m/s", { bg: "#0d1c24", accent: "#7fb8e0", fg: "#bfeaf7", scale: 0.55 }), { glow: true, ei: 0.7 });
    holoTag(colocatePost, "reference anemometer", 0, 0.75, 0, { css: "#7fb8e0", w: 0.4 });
    reg(hits, colocatePost, "colocate-instrument");

    // ----------------------------------------------------------- airport board
    const airportPost = group(g, 2.0, 0, -1.7, -0.4);
    const airportBoard = holoPanel(airportPost, 0.85, 0.55, 0, 1.25, 0, (ctx, w, h) => {
      ctx.fillStyle = "#0a2436"; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#7fb8e0"; ctx.fillRect(0, 0, w, 6);
      ctx.font = `600 ${Math.round(h * 0.1)}px 'Barlow Condensed', Arial, sans-serif`;
      ctx.textAlign = "left"; ctx.textBaseline = "middle";
      ctx.fillStyle = "#e4f2fb"; ctx.fillText("AIRPORT HOURLY RECORD", w * 0.06, h * 0.14);
      ctx.font = `${Math.round(h * 0.08)}px Arial, sans-serif`; ctx.fillStyle = "#e4f2fb";
      ["Wind: 270° at 4 m/s", "Temp: 16°C", "This station: pending"].forEach((line, i) => {
        ctx.fillText(line, w * 0.06, h * (0.34 + i * 0.15));
      });
    }, { accent: MSS_ACCENT });
    reg(hits, airportBoard, "airport-data-board");

    // ------------------------------------------------------------- siting log
    const logBoard = group(g, 2.2, 0.14, -0.3, -0.3);
    box(logBoard, 0.14, 0.005, 0.2, 0, 0.75, 0, 0xf3efe4, { rough: 0.9 });
    decal(logBoard, 0.12, 0.18, 0, 0.753, 0, signFace("SITING LOG", { bg: "#f3efe4", accent: "#1b1e22", scale: 0.4 })).rotation.x = -Math.PI / 2;
    holoTag(logBoard, "siting log", 0, 0.86, 0, { css: "#7fb8e0", w: 0.34 });
    reg(hits, logBoard, "siting-log");

    // -------------------------------------------------------------- crew
    const chest = toolChest(g, 2.5, 1.9, { ry: -0.6, color: 0x2f6f7a });
    void chest;
    standingFigure(g, -2.0, -0.7, { atStation: true, ry: 0.8, cloth: 0x37505f, vest: MSS_ACCENT, helmet: 0xf2f2f2 });
    cone(g, 2.4, 2.4, { color: MSS_ACCENT }); cone(g, -2.4, 1.9, { color: MSS_ACCENT });
    const dustGround = particles(g, 20, 0xc9b99a, { size: 0.02, life: 0.8, additive: false, opacity: 0.14 });

    // -------------------------------------------------------------- live state
    let raised = false, steadying = false, drifting = false;

    return {
      hits,
      spawnLook: new THREE.Vector3(0, 1.1, -0.5),
      footprint: 2.5,
      onStep() {},
      onStepComplete(step) {
        if (step.id === "site-mast") {
          mast.parent.remove(mast);
          mastSocket.add(mast);
          mast.position.set(0, 0, 0);
          mast.rotation.set(0, 0, 0.85);
        }
        if (step.id === "raise-mast") { raised = true; }
        if (step.id === "guy-mast") guyLines.forEach((l) => { l.visible = true; });
        if (step.id === "wire-sensors") { liveLight.material.emissiveIntensity = 0.15; }
        if (step.id === "power-on") { liveLight.material.emissiveIntensity = 0.7; }
        if (step.id === "sync-clock") repaint(clockScreen, signFace("08:00", { bg: "#0f1b14", accent: "#59c97b", fg: "#bff7d4", scale: 0.55 }));
        if (step.id === "colocate-check") repaint(refScreen, signFace("4.1 m/s", { bg: "#0d1c24", accent: "#59c97b", fg: "#bfeaf7", scale: 0.55 }));
        if (step.id === "compare-airport") {
          repaint(airportBoard.userData.face, signFace("MATCHED", { bg: "#0f1b14", accent: "#59c97b", scale: 0.4 }));
        }
      },
      onInterrupt(it) {
        if (it.id === "gust-off-plumb") { steadying = true; mast.rotation.z = 0.35; }
        if (it.id === "clock-drift") {
          drifting = true;
          clockScreen.material.emissiveIntensity = 1.6;
          repaint(clockScreen, signFace("07:00 !", { bg: "#2a0c0c", accent: "#d2312b", fg: "#ffd0d0", scale: 0.5 }));
        }
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "gust-off-plumb") { steadying = false; mast.rotation.z = 0; }
        if (it.id === "clock-drift") {
          drifting = false;
          clockScreen.material.emissiveIntensity = 0.7;
          repaint(clockScreen, signFace("08:00", { bg: "#0f1b14", accent: "#59c97b", fg: "#bff7d4", scale: 0.55 }));
        }
      },
      onHazard() {},
      animate(t, dt, session) {
        const step = session?.step;
        if (raised) cups.rotation.y += dt * 2.2;
        dustGround.visible = true; dustGround.userData.step(dt, new THREE.Vector3(0, 0.2, 0.5), 0.6, 0.2, 0.08);
        if (steadying) mast.rotation.z = 0.35 - Math.sin(t * 3) * 0.06;
        if (drifting) clockScreen.material.emissiveIntensity = 1.0 + Math.sin(t * 6) * 0.5;
        const gg = session?.gauge;
        if (gg && !gg.committed && step?.id === "level-rain-gauge") {
          repaint(refScreen, signFace(`${(Math.abs(gg.t - 0.5) * 9).toFixed(1)}° tilt`, {
            bg: "#0d1c24", accent: gg.t >= 0.46 && gg.t <= 0.54 ? "#59c97b" : "#f2ae14", fg: "#bfeaf7", scale: 0.55,
          }));
        }
        if (session?.turn && step?.id === "align-compass") {
          mast.rotation.y = 0.3 + session.turn.amount * Math.PI * 2;
        }
      },
    };
  },
};
