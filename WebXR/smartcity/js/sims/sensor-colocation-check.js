import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, ball, torus, slab, group, decal, repaint, signFace, paperFace,
  particles, mat,
} from "../../../shared/kit.js";
import {
  CITY, stationPad, holoPanel, holoTag, toolChest, cone, barrierPanel,
  standingFigure, instrument, equipmentCabinet, surfaceTexture, texturedMat, pavingFace, reg,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Sensor Co-Location VR — Community Environmental Justice,
// Hunters Point Edition.
//
// A community environmental monitor co-locates two network sensors beside
// the Air District's own regulatory reference monitor for a week: the
// collocation log, an hourly comparison against the reference, a correction
// factor derived from the week's data, a sensor that drifts and has to be
// flagged rather than trusted, humidity's known bias on optical particle
// counters, and the calibration record the network relies on to call its
// own readings honest.
//
// Sited generically at the regional Air District's own monitoring
// compound; no real site, monitor make or agency office is named or
// implied — see the note against writing a model name anywhere in this
// edition.

const COL_ACCENT = 0x4fb3d9;

export const SIM_SENSOR_COLOCATION_CHECK = {
  id: "sensor-colocation-check",
  index: "148",
  domain: "Environmental",
  trade: "Community environmental monitor",
  category: "Community Environmental Justice",
  district: "Environmental Monitoring",
  weather: "fog",
  certification: "AFSCME air-district technicians who run the reference monitor this co-location is checked against; EPA 40 CFR Part 58 Appendix A quality assurance and its co-location siting criteria; the Bay Area Air Quality Management District's community sensor verification practice; NIOSH guidance on humidity artifacts in optical particle counters",
  name: "Sensor Co-Location Check",
  title: simTitle("Sensor Co-Location Check"),
  tagline: "A week beside the Air District's reference monitor: hourly comparisons, a correction factor earned honestly, a drifting sensor caught and flagged, and humidity's own bias on an optical counter told apart from a real event",
  accent: COL_ACCENT,
  accentCss: "#4fb3d9",
  parSeconds: 270,
  footprint: 2.4,
  badge: { id: "correction-earned", name: "Correction Earned", note: "A correction factor derived from a full week against a proven reference, with the drifting sensor caught before it shipped back to the network" },

  game: system({
    name: "Reference Bench",
    currency: "MICROGRAM",
    ranks: ["Bench Trainee", "Co-Location Technician", "QA Lead", "Reference Steward", "Reference Bench Certified"],
    badges: [
      { id: "reference-proven-first", name: "Reference Proven First", note: "Checked the reference monitor's own calibration before trusting a single comparison against it", test: AWARD.stepClean("reference-cal-check") },
      { id: "never-published-drift", name: "Never Published Drift", note: "Never let a drifted sensor's data out without a flag", test: AWARD.safe },
      { id: "hourly-true", name: "Hourly True", note: "Held every hourly comparison inside its band", test: AWARD.precise(0.72) },
    ],
    challenges: [
      { id: "clean-week", name: "Clean Week", note: "No corrections anywhere across the run", test: AWARD.clean },
      { id: "watch-unbroken", name: "Watch Unbroken", note: "Never broke off the drift watch once it started", test: AWARD.unbroken },
      { id: "bench-fast", name: "Bench Fast", note: "Sited, logged and corrected inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "trust-reference-blind": "You compared the network sensors against the reference monitor without ever checking that the reference's own calibration was current. A comparison is only as good as the instrument it is judged against, and a reference monitor running on a lapsed calibration is not ground truth — it is a second unproven number standing in for one, which means the correction factor this whole week is meant to produce would be corrected against nothing.",
    "sensors-too-close": "You sited the two network sensors pressed against each other and against the reference shelter's own warm exhaust. Air drawn in that close to another instrument's housing, or to a box that runs its own internal heater, is not the ambient air the co-location is supposed to be testing against — it is one sensor reading the other, and neither number that comes out of it describes anything a resident actually breathes.",
    "publish-drifted": "You let the drifted sensor's readings back into the network without a flag on them. A sensor that has quietly separated from the reference by more than the tolerance band is not sending numbers that mean what a resident thinks they mean, and putting it back to work unflagged turns the one instrument this whole co-location caught into the one instrument nobody downstream knows to distrust.",
    "skip-rh-correction": "You derived the correction factor from the raw counts without accounting for the week's known humidity bias. Optical counters read high in damp air for a reason that has nothing to do with particulate, and folding that bias into a 'correction' factor does not cancel it out — it bakes a humidity error into every reading this sensor reports for as long as the factor stays in use.",
  },

  lateNotes: {
    "colo-log": "There is nothing to log until both sensors are actually sited and mounted beside the reference inlet.",
    "hourly-compare": "The log has to be open before a hipster comparison against the reference means anything on the record.",
    "correction-factor": "A correction factor derived before the drifted sensor is flagged and set aside would be built on bad data — settle which sensor is good first.",
  },

  interrupts: [
    {
      id: "fog-bank",
      kind: "Humidity spike",
      after: "hourly-compare", delay: 4, seconds: 14,
      alert: "A fog bank has rolled in off the bay and both network sensors' optical counts are climbing while the reference monitor's own reading holds flat.",
      cue: "The two sensors are reading higher and higher while the reference stays where it was.",
      target: "flag-humidity",
      why: "An optical particle counter cannot fully tell fog droplets from particulate, and a rise that shows up on both network units while a reference method built to reject that bias stays flat is the signature of humidity, not a pollution event. Flagging the hours the fog sat over the site is what keeps this stretch of data from being read later as a real spike the reference somehow missed, or worse, folded into the very correction factor this week is supposed to produce.",
      missNote: "The climbing readings went into the log with no flag while the fog sat over the site. Whoever reviews this week later has no way to tell a humidity artifact from an actual event, and the correction factor that comes out the other end of an unflagged fog bank is corrected against noise instead of against the reference.",
      wrongNote: "That does not address the fog. The reference monitor did not move — flag the affected hours on the network sensors' own record, not the comparison you were already holding.",
    },
    {
      id: "sensor-offline",
      kind: "Instrument dropout",
      after: "drift-watch", delay: 5, seconds: 15,
      alert: "One of the network sensors has dropped off the logger entirely — no data at all, not even a bad reading.",
      cue: "One line on the drift chart has just gone flat and stopped updating.",
      target: "restart-sensor",
      why: "A gap in the record is a different failure than a bad reading, and it needs a different response: the sensor is power-cycled at its own switch and brought back onto the logger before the gap grows any wider, not waited out on the assumption it will reconnect itself. Every hour this unit stays dark is an hour of the week's comparison this sensor cannot contribute to at all.",
      missNote: "The dropout was left alone and the sensor never came back online for the rest of the watch. A week-long co-location with a day of dead air in the middle of it is a week that cannot honestly claim to have watched this sensor drift, because for part of it, nobody was watching anything.",
      wrongNote: "That is not where the sensor comes back online. Power-cycle it at its own switch, not at the chart you were already reading.",
    },
  ],

  steps: [
    {
      id: "colo-protocol", kind: "select", target: "colo-protocol",
      title: "Read the co-location protocol",
      cue: "Check the siting distance, the log format and the week's schedule before touching a sensor.",
      why: "EPA's co-location criteria set how far the network sensors sit from the reference inlet, how often the comparison is read, and how long the run has to last before a correction factor means anything. A technician who skips the protocol and just parks two sensors near the shelter is deciding, alone, whether this week's data will hold up to anyone else's review.",
    },
    {
      id: "reference-cal-check", kind: "select", target: "reference-cal-panel",
      title: "Check the reference monitor's own calibration",
      cue: "Read the reference instrument's last calibration date before you trust a single number off it.",
      why: "Every comparison this week produces is judged against this one instrument, which makes its own calibration record the foundation the whole co-location stands on. A reference monitor running past its own calibration interval is not a fixed point to correct against — it is a second guess wearing the reference's authority, and building a network's trust on it would be building on sand.",
    },
    {
      id: "site-sensors", kind: "sequence", anyOrder: true,
      targets: ["sensor-a-site", "sensor-b-site"],
      itemNames: { "sensor-a-site": "site sensor A", "sensor-b-site": "site sensor B" },
      itemNotes: {
        "sensor-a-site": "Set at the protocol's distance from the reference inlet, in open air, not against the shelter wall.",
        "sensor-b-site": "Set the same distance and height as sensor A, far enough from it that neither draws the other's exhaust.",
      },
      title: "Site both network sensors beside the reference inlet",
      cue: "Mount sensor A and sensor B at the protocol's distance from the reference monitor's own inlet — any order.",
      why: "Both sensors have to sample the same parcel of air the reference monitor does, at the same distance and height, or the comparison this week produces is measuring a siting difference instead of an instrument difference. Getting this placement right, once, at the start of the week, is what makes every hourly reading that follows worth logging at all.",
    },
    {
      id: "mount-collar", kind: "turn", target: "mount-collar",
      title: "Lock the shared mounting collar",
      cue: "Turn the collar down until both sensor stands are locked to the shared mast.",
      why: "A sensor stand that can drift in the wind over a week-long run will not sit at the exact height and distance it was sited at on day one, which quietly invalidates the very comparison the collar's own job is to hold steady. Locking it down now is what keeps Monday's siting still true on Friday.",
      turn: { turns: 0.55, axis: "y", label: "MOUNT COLLAR" },
    },
    {
      id: "humidity-check", kind: "select", target: "humidity-probe",
      title: "Read today's ambient humidity",
      cue: "Check the humidity probe and note today's relative humidity before logging begins.",
      why: "Optical particle counters are known to read high as relative humidity climbs, well before any fog is visible, so a humidity reading logged at the start of the week is what lets anyone reviewing the data later separate a real particulate event from the instrument's own known weather bias.",
    },
    {
      id: "colo-log-start", kind: "select", target: "colo-log",
      title: "Open the co-location log",
      cue: "Record both sensors' serial numbers, the site and the start time before the first hour begins.",
      why: "A week of hourly readings with no record of which two physical sensors produced them, sited where, starting when, is a week of numbers nobody can later trace back to the units they came from — and a correction factor is only useful for the sensors it was actually derived on.",
    },
    {
      id: "hourly-compare", kind: "gauge", target: "hourly-compare",
      title: "Read the hourly comparison against the reference",
      cue: "Bring the network sensors' reading into the reference's tolerance band and commit the hour.",
      why: "An hourly comparison inside the tolerance band is what the whole week is built from — the correction factor at the end is nothing more than the pattern across every one of these hours, so a comparison logged loosely, or committed outside the band without comment, is a bad brick in a wall that is only as sound as its worst hour.",
      gauge: {
        label: "AGREEMENT", speed: 0.7, green: [0.4, 0.62],
        readout: (t) => `${(t * 100).toFixed(0)}%`,
        missNote: "That is outside the tolerance band. Bring the reading closer to the reference before the hour is logged as agreeing.",
      },
    },
    {
      id: "drift-watch", kind: "track", target: "drift-watch", seconds: 9,
      title: "Watch the week for drift",
      cue: "Track both sensors' running comparison against the reference and keep the watch centred on the tolerance band.",
      why: "A single hour inside the band proves almost nothing about a sensor's health over a week; a drift watch is what shows one unit sliding slowly outside the band while the other holds steady, which is the pattern a co-location exists to catch and a single spot-check never would.",
      holdBreakNote: "You looked away from the drift watch before the week's pattern showed itself. A sensor that drifts slowly needs the whole watch, not a glance at the middle of it, to be caught before it ships back to the network.",
      track: {
        label: "DRIFT", green: [0.38, 0.6], rise: 0.4, fall: 0.36, drift: 0.16,
        readout: (v) => `${((v - 0.5) * 40).toFixed(1)}%`,
      },
    },
    {
      id: "spot-drift", kind: "find", noHint: true,
      targets: ["sensor-b-panel"],
      itemNames: { "sensor-b-panel": "sensor B's comparison chart" },
      itemNotes: { "sensor-b-panel": "Sensor B's line has walked steadily outside the tolerance band across the week while sensor A tracked the reference the whole time — that is drift, not a single bad hour." },
      title: "Find the sensor that drifted",
      cue: "Compare both sensors' charts against the reference and click the one that has drifted outside the band.",
      why: "The drift watch shows a pattern over the whole week; picking out which physical sensor produced it means reading both charts against each other, not just against the reference, because the fix that follows — flagging one unit and trusting the other — only works if the right sensor gets flagged.",
    },
    {
      id: "flag-sensor", kind: "select", target: "flag-sensor",
      title: "Flag the drifted sensor",
      cue: "Tag sensor B for service and pull it from the network's trusted list.",
      why: "A flagged sensor stops contributing readings the public map presents as trustworthy the moment it is tagged, which is the whole point of running a co-location in the first place — catching the one unit in ten that has quietly gone wrong before its numbers do any harm on the map.",
    },
    {
      id: "correction-factor", kind: "gauge", target: "correction-factor",
      title: "Derive the correction factor",
      cue: "Calculate the correction factor from sensor A's week against the reference, accounting for the humidity bias, and commit it.",
      why: "The correction factor this week produces is what every future reading from this sensor model gets adjusted by before it reaches the public map, so it has to come from the sensor that actually tracked the reference, over the whole week, with the known humidity bias already accounted for — not from the drifted unit, and not from raw counts that still carry the fog bank inside them.",
      gauge: {
        label: "FACTOR", speed: 0.65, green: [0.42, 0.6],
        readout: (t) => `×${(0.8 + t * 0.5).toFixed(2)}`,
        missNote: "That factor does not sit inside the range the week's data actually supports. Recalculate from sensor A's record against the reference before committing it.",
      },
    },
    {
      id: "cal-record", kind: "select", target: "cal-record",
      title: "Log the calibration record",
      cue: "Record the correction factor, the flagged sensor and the week's dates on the calibration record.",
      why: "The calibration record is what lets the network apply this week's correction factor to every reading this sensor model reports afterward, and what tells the next technician which physical unit came back flagged rather than corrected — without it, this week's work lives only in one person's memory.",
    },
    {
      id: "sign-off", kind: "select", target: "sign-pad",
      title: "Sign the co-location report",
      cue: "Sign and date the completed co-location report before the sensors leave the site.",
      why: "A signed report is what lets the Air District, the network and the next reviewer all agree this co-location actually happened the way the log says it did — a week of good data with nobody's name on the record at the end of it is a week nobody downstream can vouch for.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.4, COL_ACCENT);

    // ------------------------------------------------------------- ground
    const groundMesh = box(g, 5.8, 0.14, 5.4, 0, 0.07, 0, 0xffffff, { rough: 0.95 });
    groundMesh.material = texturedMat(
      surfaceTexture((cx, w, h) => pavingFace(cx, w, h, { tiles: 5, base: "#232a2f", base2: "#1b2126", seam: "rgba(0,0,0,0.4)" }), { repeat: 6, px: 512 }),
      { rough: 0.95, metal: 0.03, color: 0xb9c9d1 },
    );

    // ------------------------------------------------------------- fenced compound
    for (const z of [-2.4, 2.4]) barrierPanel(g, -0.2, z, { ry: Math.PI / 2, w: 4.4, color: 0x8b929a });
    for (const x of [-2.6]) barrierPanel(g, x, -0.6, { color: 0x8b929a });
    holoTag(g, "Air District monitoring compound", 0, 2.4, -2.35, { css: "#4fb3d9", w: 0.7 });

    // ------------------------------------------------------------ reference shelter
    const shelter = group(g, -1.4, 0, -1.3);
    box(shelter, 1.1, 1.5, 0.9, 0, 0.75, 0, 0xdfe4e8, { rough: 0.55, metal: 0.15, finish: "painted" });
    box(shelter, 1.16, 0.08, 0.96, 0, 1.54, 0, 0xb9c0c4, { rough: 0.5, metal: 0.2 });
    const inletStack = cyl(shelter, 0.03, 0.03, 0.5, 0, 1.8, 0, CITY.steel, { rough: 0.4, metal: 0.7, seg: 12 });
    void inletStack;
    const refScreen = decal(shelter, 0.5, 0.24, 0, 1.0, 0.451, signFace("REF: -- µg/m³", { bg: "#0d1c24", accent: "#4fb3d9", fg: "#bfeaf7", scale: 0.55 }), { glow: true, ei: 0.85, px: 320 });
    holoTag(shelter, "Reference monitor shelter", 0, 1.75, 0.5, { css: "#4fb3d9", w: 0.6 });
    const refCalPanel = holoPanel(shelter, 0.44, 0.3, 0, 0.6, 0.46, (cx, w, h) => {
      cx.fillStyle = "#0d1c24"; cx.fillRect(0, 0, w, h);
      cx.fillStyle = "#4fb3d9"; cx.fillRect(0, 0, w, 4);
      cx.font = `${Math.round(h * 0.12)}px Arial, sans-serif`; cx.fillStyle = "#bfeaf7";
      cx.textAlign = "left"; cx.textBaseline = "middle";
      cx.fillText("CAL DUE: current", w * 0.08, h * 0.35);
      cx.fillText("Last check: this week", w * 0.08, h * 0.62);
    }, { accent: COL_ACCENT });
    reg(hits, refCalPanel, "reference-cal-panel");
    const trustBlind = box(shelter, 0.4, 0.4, 0.02, 0, 1.0, -0.46, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, trustBlind, "trust-reference-blind");

    // ------------------------------------------------------------ network sensors
    function sensorStand(x, z, id, label, color) {
      const s = group(g, x, 0, z);
      cyl(s, 0.02, 0.024, 1.1, 0, 0.55, 0, CITY.steel, { rough: 0.5, metal: 0.6, seg: 10 });
      const box1 = box(s, 0.16, 0.22, 0.14, 0, 1.15, 0, 0xf2f4f5, { rough: 0.5, metal: 0.15 });
      const scr = decal(s, 0.13, 0.06, 0, 1.1, 0.071, signFace("-- µg/m³", { bg: "#0d1c24", accent: color, fg: "#bfeaf7", scale: 0.58 }), { glow: true, ei: 0.85, px: 256 });
      holoTag(s, label, 0, 1.32, 0, { css: color === "#4fb3d9" ? "#4fb3d9" : "#f2c14b", w: 0.32 });
      return { s, box1, scr };
    }
    const senA = sensorStand(-0.5, -0.3, "sensor-a", "SENSOR A", "#59c97b");
    reg(hits, senA.s, "sensor-a-site");
    const senB = sensorStand(-0.15, -0.55, "sensor-b", "SENSOR B", "#f2c14b");
    reg(hits, senB.s, "sensor-b-site");
    const tooCloseTrap = box(g, 0.3, 0.4, 0.3, -0.3, 0.5, -0.42, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, tooCloseTrap, "sensors-too-close");
    const restartBtn = box(senB.s, 0.03, 0.02, 0.01, 0.06, 1.02, 0.071, 0x22262b, { rough: 0.6 });
    reg(hits, restartBtn, "restart-sensor");

    // Shared mounting collar between the two stands.
    const collarPost = group(g, -0.32, 0.9, -0.42);
    const collar = torus(collarPost, 0.05, 0.014, 0, 0, 0, 0xb8402f, { rough: 0.5, metal: 0.4, seg: 6, seg2: 18 });
    collar.rotation.x = Math.PI / 2;
    holoTag(collarPost, "Mounting collar", 0, 0.14, 0, { css: "#4fb3d9", w: 0.4 });
    reg(hits, collarPost, "mount-collar");

    // ------------------------------------------------------------- humidity probe
    const humPost = group(g, 1.2, 0, -1.2, -0.3);
    cyl(humPost, 0.018, 0.02, 1.0, 0, 0.5, 0, CITY.steel, { rough: 0.5, metal: 0.6, seg: 10 });
    const humProbe = instrument(humPost, 0, 1.0, 0, { ry: 0.2, idle: "-- %RH", color: 0x4fb3d9, w: 0.13, d: 0.18 });
    holoTag(humPost, "Humidity probe", 0, 1.18, 0, { css: "#4fb3d9", w: 0.4 });
    reg(hits, humProbe, "humidity-probe");
    const fogBank = particles(g, 60, 0xdfe6e8, { size: 0.16, life: 2.0, additive: false, opacity: 0.24 });
    fogBank.position.set(-0.3, 1.0, -0.8);
    fogBank.visible = false;
    const flagPost = group(g, 1.2, 0, -0.7, -0.3);
    cyl(flagPost, 0.012, 0.012, 0.5, 0, 0.25, 0, CITY.steel, { rough: 0.5, metal: 0.6, seg: 8 });
    const humFlag = box(flagPost, 0.1, 0.07, 0.008, 0.05, 0.5, 0, 0xf0645b, { rough: 0.6, cast: false });
    humFlag.visible = false;
    holoTag(flagPost, "Flag humidity hours", 0.05, 0.62, 0, { css: "#f0645b", w: 0.5 });
    reg(hits, flagPost, "flag-humidity");

    // ------------------------------------------------------------- boards
    const protocolPost = group(g, 1.9, 0, 1.5, 0.3);
    cyl(protocolPost, 0.02, 0.022, 1.0, 0, 0.5, 0, CITY.steel, { rough: 0.5, metal: 0.6, seg: 10 });
    const protocolPanel = holoPanel(protocolPost, 0.56, 0.42, 0, 1.2, 0, (cx, w, h) => {
      cx.fillStyle = "#0c1b22"; cx.fillRect(0, 0, w, h);
      cx.fillStyle = "#4fb3d9"; cx.fillRect(0, 0, w, 5);
      cx.font = `600 ${Math.round(h * 0.1)}px 'Barlow Condensed', Arial, sans-serif`;
      cx.textAlign = "left"; cx.textBaseline = "middle"; cx.fillStyle = "#d8f0f6";
      cx.fillText("CO-LOCATION PROTOCOL", w * 0.06, h * 0.15);
      cx.font = `${Math.round(h * 0.076)}px Arial, sans-serif`; cx.fillStyle = "#eef9fb";
      ["40 CFR Pt. 58 App. A siting", "Hourly comparison, 7-day run", "Correction factor on close"].forEach((line, i) => cx.fillText(line, w * 0.06, h * (0.35 + i * 0.16)));
    }, { accent: COL_ACCENT });
    reg(hits, protocolPanel, "colo-protocol");

    // ------------------------------------------------------------- log bench
    const bench = group(g, 1.7, 0, 0.6, -0.5);
    slab(bench, 0.7, 0.05, 0.5, 0, 0.75, 0, 0xd7dde0, { radius: 0.015, rough: 0.4, metal: 0.2 });
    for (const [sx, sz] of [[-0.28, -0.18], [0.28, -0.18], [-0.28, 0.18], [0.28, 0.18]]) cyl(bench, 0.018, 0.018, 0.75, sx, 0.37, sz, 0x8b929a, { rough: 0.5, metal: 0.6, seg: 8 });
    const logBox = instrument(bench, -0.16, 0.79, 0, { ry: 0.2, idle: "LOG: --", color: 0x4fb3d9, w: 0.16, d: 0.2 });
    holoTag(bench, "Co-location log", -0.16, 0.98, 0, { css: "#4fb3d9", w: 0.42 });
    reg(hits, logBox, "colo-log");
    const compareBox = instrument(bench, 0.18, 0.79, 0.02, { idle: "-- %", color: 0x59c97b, w: 0.16, d: 0.2 });
    holoTag(bench, "Hourly agreement", 0.18, 1.0, 0.02, { css: "#59c97b", w: 0.42 });
    reg(hits, compareBox, "hourly-compare");
    const driftBox = instrument(bench, -0.16, 0.79, 0.2, { idle: "DRIFT --", color: 0xf2c14b, w: 0.16, d: 0.2 });
    holoTag(bench, "Drift watch", -0.16, 1.0, 0.2, { css: "#f2c14b", w: 0.42 });
    reg(hits, driftBox, "drift-watch");
    const sensorBPanel = decal(bench, 0.16, 0.09, 0.18, 0.83, 0.2, signFace("SENSOR B: OFF-BAND", { bg: "#2a0c0c", accent: "#f0645b", fg: "#ffd0d0", scale: 0.42 }), { px: 256 });
    reg(hits, sensorBPanel, "sensor-b-panel");
    const flagSensorBtn = box(bench, 0.06, 0.03, 0.06, 0.32, 0.79, -0.15, 0x22262b, { rough: 0.6 });
    decal(flagSensorBtn, 0.055, 0.055, 0, 0.016, 0, signFace("FLAG", { bg: "#22262b", accent: "#f0645b", scale: 0.55 }));
    reg(hits, flagSensorBtn, "flag-sensor");
    const publishBtn = box(bench, 0.06, 0.03, 0.06, -0.32, 0.79, -0.15, 0x22262b, { rough: 0.6 });
    decal(publishBtn, 0.055, 0.055, 0, 0.016, 0, signFace("PUBLISH", { bg: "#22262b", accent: "#f0645b", scale: 0.5 }));
    reg(hits, publishBtn, "publish-drifted");

    // -------------------------------------------------- correction + cal record
    const calCabinet = equipmentCabinet(g, 0.6, 0.9, 0.4, 1.9, -0.3, { ry: -0.2, color: 0x6f7a83 });
    const correctionBox = instrument(calCabinet, 0, 1.06, 0.05, { idle: "×--", color: 0x4fb3d9, w: 0.16, d: 0.2 });
    holoTag(calCabinet, "Correction factor", 0, 1.26, 0.05, { css: "#4fb3d9", w: 0.44 });
    reg(hits, correctionBox, "correction-factor");
    const skipRhBtn = box(calCabinet, 0.05, 0.03, 0.05, -0.2, 1.06, 0.05, 0x22262b, { rough: 0.6 });
    decal(skipRhBtn, 0.045, 0.045, 0, 0.016, 0, signFace("RAW", { bg: "#22262b", accent: "#f0645b", scale: 0.55 }));
    reg(hits, skipRhBtn, "skip-rh-correction");
    const calRecordBox = instrument(calCabinet, 0.22, 1.06, -0.05, { idle: "REC: --", color: 0x59c97b, w: 0.14, d: 0.18 });
    holoTag(calCabinet, "Calibration record", 0.22, 1.26, -0.05, { css: "#59c97b", w: 0.5 });
    reg(hits, calRecordBox, "cal-record");

    const signClip = group(g, 1.9, 0, 1.9, -0.4);
    box(signClip, 0.24, 0.02, 0.32, 0, 0.86, 0, 0x6d5a43, { rough: 0.8 });
    const signFacePanel = decal(signClip, 0.22, 0.29, 0, 0.871, 0,
      paperFace("CO-LOCATION REPORT", ["Reference cal checked ___", "7-day watch complete ___",
        "Correction factor ___", "Signed ___ Date ___"], { worn: true }), { px: 256 });
    signFacePanel.rotation.x = -Math.PI / 2;
    holoTag(signClip, "Sign here", 0, 1.05, 0, { css: "#4fb3d9", w: 0.3 });
    reg(hits, signFacePanel.parent, "sign-pad");

    const tech = standingFigure(g, 0.9, 1.7, { ry: -1.3, cloth: 0x37505f, vest: 0x4fb3d9, helmet: 0xf2f2f2 });
    void tech;
    toolChest(g, -2.0, 1.4, { color: 0x2f6f5a });
    cone(g, 0.2, 1.9, { color: COL_ACCENT });

    // ------------------------------------------------------------ live state
    let foggy = false, offline = false;

    return {
      hits,
      spawnLook: new THREE.Vector3(0.2, 1.4, -0.3),
      onStepComplete(step) {
        if (step.id === "humidity-check") repaint(humProbe.userData.screen, signFace("68 %RH", { bg: "#0d1c24", accent: "#4fb3d9", fg: "#bfeaf7", scale: 0.62 }));
        if (step.id === "colo-log-start") repaint(logBox.userData.screen, signFace("LOG: OPEN", { bg: "#0d1c24", accent: "#59c97b", fg: "#bfeaf7", scale: 0.55 }));
        if (step.id === "flag-sensor") { senB.scr.material.emissiveIntensity = 0.3; repaint(sensorBPanel, signFace("SENSOR B: FLAGGED", { bg: "#2a1c0c", accent: "#f2c14b", fg: "#ffe3b0", scale: 0.4 })); }
        if (step.id === "cal-record") repaint(calRecordBox.userData.screen, signFace("REC: FILED", { bg: "#0d1c24", accent: "#59c97b", fg: "#bfeaf7", scale: 0.5 }));
      },
      onHazard() {},
      onInterrupt(it) {
        if (it.id === "fog-bank") { foggy = true; fogBank.visible = true; refScreen.material.emissiveIntensity = 0.4; }
        if (it.id === "sensor-offline") { offline = true; senB.scr.material.emissiveIntensity = 0.05; }
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "fog-bank") { foggy = false; fogBank.visible = false; humFlag.visible = true; }
        if (it.id === "sensor-offline") { offline = false; senB.scr.material.emissiveIntensity = 0.85; }
      },
      animate(t, dt, session) {
        if (foggy) fogBank.userData.step(dt, new THREE.Vector3(-0.3, 1.0, -0.8), 0.5, 0.4, 0.1);
        senA.scr.material.emissiveIntensity = 0.85 + Math.sin(t * 2) * 0.1;
        if (!offline) senB.scr.material.emissiveIntensity = 0.85 + Math.sin(t * 2.4) * 0.1;
        const gg = session?.gauge;
        if (gg && !gg.committed && session.step?.id === "hourly-compare") {
          repaint(compareBox.userData.screen, signFace(`${(gg.t * 100).toFixed(0)}%`, { bg: "#0d1c24", accent: gg.t > 0.4 && gg.t < 0.62 ? "#59c97b" : "#f0645b", fg: "#bfeaf7", scale: 0.6 }));
        }
        if (gg && !gg.committed && session.step?.id === "correction-factor") {
          repaint(correctionBox.userData.screen, signFace(`×${(0.8 + gg.t * 0.5).toFixed(2)}`, { bg: "#0d1c24", accent: gg.t > 0.42 && gg.t < 0.6 ? "#59c97b" : "#f0645b", fg: "#bfeaf7", scale: 0.55 }));
        }
        if (session?.track && session.step?.id === "drift-watch") {
          repaint(driftBox.userData.screen, signFace(`${((session.track.v - 0.5) * 40).toFixed(1)}%`, { bg: "#0d1c24", accent: session.track.v > 0.38 && session.track.v < 0.6 ? "#59c97b" : "#f0645b", fg: "#bfeaf7", scale: 0.55 }));
        }
      },
    };
  },
};
