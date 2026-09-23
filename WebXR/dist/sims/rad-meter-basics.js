import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, ball, torus, slab, group, decal, repaint, signFace, particles, noiseTexture,
} from "../../../shared/kit.js";
import {
  CITY, stationPad, holoPanel, holoTag, toolChest, cone, barrierPanel, instrument,
  standingFigure, valveWheel, surfaceTexture, pavingFace, texturedMat, reg,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Rad Meter Basics VR — Community Environmental Justice, station
// one hundred sixty-three, the first regular station of the Hunters Point
// Edition after the sourced opener.
//
// A community class in reading a hand-held radiation survey meter, run on a
// public parking lot beside a fenced parcel under a federal cleanup order —
// a generic sited scene, not any one parcel's own history. The class never
// crosses the fence: everything it teaches is done from the public side,
// with a low-activity training source the instructor stages inside the
// practice grid rather than anything from the parcel itself. The discipline
// is the same one a professional radiation control technician's survey uses,
// scaled to what a resident actually needs to read a meter honestly: prove
// the instrument against its own check source before trusting it, know what
// the two units on the readout are actually telling you, walk a grid at a
// pace and height that gives the meter time to see the ground, and log,
// photograph and report a real reading rather than call it in from memory.
// The class also teaches the meter's own limits — it cannot name an isotope
// or say how deep a source sits — because a resident who doesn't know that
// is a resident who trusts a hand-held reading for more than it can say.

const RMB_ACCENT = 0xd9a02c;

export const SIM_RAD_METER_BASICS = {
  id: "rad-meter-basics",
  index: "163",
  domain: "Environmental",
  trade: "Community environmental monitor",
  category: "Community Environmental Justice",
  district: "Environmental Monitoring",
  weather: "overcast",
  certification: "Community science training modelled on EPA's MARSSIM walkover methodology; NRC 10 CFR 20 terms for the units a survey meter reports; the kind of hands-on class the Marie Harrison Community Foundation's own community science programmes run; OSHA 29 CFR 1910.120 HAZWOPER as the separate, much longer gate for anyone who goes past the fence, which this class never does",
  name: "Rad Meter Basics",
  title: simTitle("Rad Meter Basics"),
  tagline: "A community class on the public lot beside a fenced parcel: background counted first, the meter proven against its own check source, counts per minute against microsieverts per hour, a grid walked at a set pace and height, and what a hand-held meter cannot tell you",
  accent: RMB_ACCENT,
  accentCss: "#d9a02c",
  parSeconds: 290,
  footprint: 2.2,
  badge: { id: "class-clean", name: "Class Clean", note: "Background counted before the source ever came out, every reading logged with its own photograph, and the check source never out of sight" },

  game: system({
    name: "Community Science",
    currency: "READING",
    ranks: ["Newcomer", "Meter Reader", "Grid Walker", "Class Lead", "Community Science Certified"],
    badges: [
      { id: "bracket-honest", name: "Bracket Honest", note: "Meter source-checked at the start of class and again at the end", test: AWARD.all(AWARD.stepClean("source-check-am"), AWARD.stepClean("source-check-pm")) },
      { id: "source-in-sight", name: "Source In Sight", note: "The check source never left the table for a pocket on your watch", test: AWARD.safe },
      { id: "grid-true", name: "Grid True", note: "Held pace and detector height inside the band the whole walk", test: AWARD.precise(0.7) },
    ],
    challenges: [
      { id: "clean-class", name: "Clean Class", note: "No corrections anywhere in the class", test: AWARD.clean },
      { id: "steady-walk", name: "Steady Walk", note: "Never broke the walkover pace", test: AWARD.unbroken },
      { id: "report-same-day", name: "Report Same Day", note: "Reading logged, photographed and reported inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "cross-fence": "You stepped through the gap in the fence to get a closer reading. The parcel on the other side is under a federal cleanup order with institutional controls that exist for a reason — a community monitor works this class from the public side of the fence, full stop, whatever the meter is reading from out here.",
    "skip-source-check": "You powered the meter on and started the walk without checking it against the class's own tagged source first. Every number this meter gives the class for the rest of the day is unverifiable — there is no way to tell a real elevated reading from a meter that was already reading high before it ever left the table.",
    "confuse-units": "You submitted the report with the counts-per-minute number written in as if it were the microsieverts-per-hour dose rate. Those are two different scales measuring two different things, and mislabelling one as the other can make an ordinary background reading look alarming to whoever reads the report, or make a real reading look like nothing worth a second look.",
    "log-from-memory": "You wrote the reading into the class log from memory instead of matching it to the photograph of the flagged point. A remembered number and a remembered location both drift the moment somebody copies the log out later — the whole reason to log a reading against its own photograph is that neither one has to be trusted from memory.",
  },

  lateNotes: {
    "check-source": "The check source doesn't come off the table until the class is actually ready to survey with it — checking a meter nobody is about to use yet just spends the source's certified count for nothing.",
    "hotspot": "Nothing to hold a count over yet — the walk has to actually reach this square of the grid and read it elevated before there is a location worth a static count.",
  },

  // Interruptions: see the interrupt layer in shared/game.js. Both are armed
  // on a track/hold step, on purpose — a gauge, turn or sequence step
  // resolves in one click, too fast for the fuse to ever find the class
  // mid-task.
  interrupts: [
    {
      id: "pocket-source",
      kind: "Source out of sight",
      after: "walkover", delay: 4, seconds: 13,
      alert: "Another class member picked the check source up off the table to look at it while you're mid-lane, and just slipped it into a jacket pocket.",
      cue: "Get the source back onto the table and into its case before it leaves the lot in someone's pocket.",
      target: "reclaim-source",
      why: "A tagged check source is a controlled item even at the low activity a community class uses, and the whole bracket the class relies on today only means something if the source's location is always known — a source riding around in someone's jacket is a source nobody can certify is even still on this lot by the time the class needs it again.",
      missNote: "The source stayed in that pocket for the rest of the walkover, and by the time anyone noticed, the class had no way to say for certain it had never left the lot — the closing check at the end of the day would have been checking a source with an unaccounted-for gap in its own custody.",
      wrongNote: "That's not it — the source is the thing that just went into a pocket. Get it back on the table before anyone forgets whose pocket it's in.",
    },
    {
      id: "kerb-spike",
      kind: "Reading not the parcel's",
      after: "static-count", delay: 3, seconds: 13,
      alert: "While you're mid-count on the flagged point, someone scanning the granite kerb along the sidewalk gets an elevated reading and starts drafting a report about it.",
      cue: "Check the reference chart before that reading goes in any report — a spike doesn't get called in on its own say-so.",
      target: "material-guide",
      why: "Granite curbstone carries natural thorium and uranium the same way a lot of ordinary building stone does, and it reads elevated on a sensitive meter for reasons that have nothing to do with the fenced parcel across the street — the class exists to teach that a reading gets checked against what is actually known to be a natural source before it becomes a report anyone acts on, not after.",
      missNote: "The kerb reading went into the draft report as an unexplained spike before anyone checked it against the reference chart, and now someone downstream has to spend time running down a lead that a minute at the chart would have closed on the spot.",
      wrongNote: "Not that — the reference chart is what tells you whether a granite kerb reading is the ordinary kind before it goes anywhere near a report.",
    },
  ],

  steps: [
    {
      id: "gear-up", kind: "sequence", anyOrder: true,
      targets: ["vest", "clipboard"],
      itemNames: { vest: "hi-vis vest", clipboard: "field clipboard" },
      title: "Vest and clipboard",
      cue: "Put on the hi-vis vest and pick up the clipboard before stepping out toward the fence line.",
      why: "The lot sits on a public street with traffic passing behind the class the whole session, and the vest is what keeps every member of the class visible to a driver who isn't watching for a group standing near a fence. The clipboard is where today's numbers live from the first minute — nothing gets remembered instead of written down.",
    },
    {
      id: "background", kind: "gauge", target: "background-post",
      title: "Count background first",
      cue: "Read the meter off to the side, away from the fence line and the practice grid, and commit once the reading settles.",
      why: "Every reading the class takes for the rest of the day gets compared against this number, not against zero — and it has to come from ground away from the fence and the grid, before the check source or the grid gives the meter anything else to react to. Skip it and there is no way to tell an elevated reading later from what this particular lot simply reads on an ordinary day.",
      gauge: {
        label: "BACKGROUND", speed: 0.6, green: [0.42, 0.58],
        readout: (t) => `${(8 + t * 8).toFixed(1)} cpm`,
        missNote: "That is not a settled background reading — read it again, away from the grid and the fence, and commit only once it holds steady.",
      },
    },
    {
      id: "source-check-am", kind: "hold", target: "check-source", seconds: 5,
      title: "Check the meter — start of class",
      cue: "Hold the meter's probe against the class's tagged check source until the reading settles inside its tolerance.",
      why: "This is the first end of the bracket: proof the meter itself reads true before the class trusts it with anything else today. A reading taken on a meter nobody checked is not evidence of anything, no matter how carefully the rest of the class walks the grid — it is a number nobody can stand behind.",
      holdBreakNote: "Lifted off the source before the reading settled — that's a glance, not a check. Hold it on until it settles and reads back inside tolerance.",
    },
    {
      id: "units", kind: "select", target: "units-placard",
      title: "Read the units placard",
      cue: "Read the placard on the meter's own housing, then pick the statement that matches what each unit is actually telling you.",
      why: "Counts per minute is a raw count rate — how many clicks the detector caught, nothing more — and microsieverts per hour is an estimate of dose rate to a person, built from that count rate and an assumption about what's making it click. A resident who cannot tell those apart cannot tell a busy meter from a dangerous one, which is the single most common way a community reading gets over- or under-read.",
    },
    {
      id: "range", kind: "turn", target: "range-dial",
      title: "Set the meter's range",
      cue: "Turn the range dial to the scale the class handout calls for before the meter goes anywhere near the grid.",
      why: "A meter left on the wrong range either pins at the top of its scale on an ordinary reading or buries a real change down in the noise floor where nobody would ever notice it — the range has to match what the class expects to find, set before the meter leaves the table, not adjusted on the fly once the walk is underway.",
      turn: { turns: 0.5, axis: "y", label: "RANGE" },
    },
    {
      id: "grid", kind: "sequence",
      targets: ["stake-1", "stake-2", "stake-3", "stake-4"],
      itemNames: { "stake-1": "corner stake 1", "stake-2": "corner stake 2", "stake-3": "corner stake 3", "stake-4": "corner stake 4" },
      title: "Lay out the practice grid",
      cue: "Set the four corner stakes in order — 1 through 4 — to mark the lot's practice grid.",
      why: "The stakes turn a stretch of open pavement into a grid the whole class can walk together and describe the same way afterward. Set them out of order and the lane numbers on the field sheet stop matching the patch of lot actually underfoot, which is exactly the kind of small error that turns into a real disagreement later about where a reading came from.",
      outOfOrderNote: "Not the next stake — the grid goes 1, 2, 3, 4 in order, or the lane numbers stop matching the ground the class is actually standing on.",
    },
    {
      id: "walkover", kind: "track", target: "meter", seconds: 9,
      title: "Walk the grid at class speed",
      cue: "Hold the meter at the set height and keep your pace inside the band the whole lane.",
      why: "A walkover only gives a meter time to actually see the ground at a set pace and a set height — faster, and a reading the size the class is looking for can pass under the detector between counts; slower, and the class never finishes the lot before the session's time runs out. The same rule holds whether the meter is walked by a technician on a survey or a resident learning to read one.",
      track: {
        start: 0.1, green: [0.4, 0.6], rise: 0.55, fall: 0.5, drift: 0.12, label: "WALK SPEED",
        readout: (v) => (v < 0.4 ? "too fast — under-scanned" : v > 0.6 ? "too slow — behind schedule" : "on pace"),
      },
      holdBreakNote: "Pace drifted out of the band — at that speed the meter is either skating over ground it never really read or falling behind the rest of the class. Bring it back and hold the lane.",
    },
    {
      id: "static-count", kind: "hold", target: "hotspot", seconds: 6,
      title: "Hold a static count over the elevated reading",
      cue: "Stop over the point the walkover flagged and hold the meter still for the full count.",
      why: "A walkover reading is a snapshot taken while moving; a static count held still over the same point is what actually confirms this reading is really twice background rather than a spike that would have settled back down on its own. Nothing gets flagged, photographed or reported off a walkover number alone.",
      holdBreakNote: "Lifted the meter before the count finished — an interrupted count doesn't confirm anything, it's just a reading that got cut short.",
    },
    {
      id: "flag", kind: "drag", target: "flag-marker",
      title: "Flag the point",
      cue: "Carry the numbered flag out and set it exactly on the point the static count confirmed.",
      why: "The flag is what turns a number on a meter into an actual place on the lot, not just a line in a logbook — the photograph and the report that follow are both going to trust exactly where this flag stands, not where someone remembers the reading being roughly near.",
      drag: { to: "hotspot-socket", radius: 0.35, missNote: "Not set on the point — a flag off by even a stake's width sends anyone who checks this later to look in the wrong place." },
    },
    {
      id: "record", kind: "sequence",
      targets: ["field-log", "camera", "report-radio"],
      itemNames: { "field-log": "field log", camera: "camera", "report-radio": "report to the class lead" },
      title: "Log, photograph and report the reading",
      cue: "Write the number and the location down first, then photograph the flag, then report it to the class lead — in that order.",
      why: "The number goes into the log first, while it's fresh and tied to the flag in front of you, then the photograph ties that same flag to a picture anyone can check later, and the report to the class lead is what turns a personal reading into something the class actually acts on together. Any other order lets one of those three drift away from what the meter actually showed.",
      outOfOrderNote: "Log the number first, then the photograph, then the report — reporting or photographing before the number is written down risks the number changing in the retelling.",
    },
    {
      id: "limits", kind: "select", target: "limits-board",
      title: "Read what the meter cannot tell you",
      cue: "Read the limits board and pick the statement that matches what a hand-held survey meter cannot answer on its own.",
      why: "A count rate tells a resident that something is making the detector click faster than background, and nothing more — it cannot say which isotope is doing it, and it cannot say how deep under the surface it sits. Those two questions take a laboratory and a different kind of survey, and a class that skips this step leaves residents thinking their meter can answer questions it was never built to answer.",
    },
    {
      id: "cal-check", kind: "find", noHint: true,
      targets: ["expired-meter"],
      itemNames: { "expired-meter": "meter with an expired calibration sticker" },
      itemNotes: { "expired-meter": "That meter's calibration sticker is past its date. A meter due for calibration is a meter whose own numbers nobody can vouch for, whatever the check source says about it today." },
      title: "Check the spare meters before class breaks",
      cue: "Look over every meter on the spare table and click the one whose calibration sticker is out of date.",
      why: "A class that hands out an out-of-calibration meter next session is a class teaching the discipline of checking a source while skipping the discipline of checking the tool itself — the sticker is the one piece of paper that says whether this particular meter is still one the manufacturer stands behind.",
    },
    {
      id: "source-check-pm", kind: "hold", target: "check-source", seconds: 5,
      title: "Check the meter — end of class",
      cue: "Hold the meter against the same check source again before it goes back in its case.",
      why: "This closes the bracket the morning check opened. A meter verified only at the start of class is one drifted battery away from unverifiable by the time anyone questions a reading it took — the closing check is what lets every number the class took today stand on its own.",
      holdBreakNote: "Lifted off the source again before it settled — the closing check has to actually finish, or the day's readings are only bracketed on one end.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.2, RMB_ACCENT);

    // ------------------------------------------------------------- ground
    // A public parking lot: asphalt, not concrete — a warmer, browner base
    // than the plaza deck's cool grey.
    const groundMesh = box(g, 5.6, 0.14, 5.2, 0, 0.07, 0, 0xffffff, { rough: 0.96 });
    groundMesh.material = texturedMat(
      surfaceTexture((cx, w, h) => pavingFace(cx, w, h, { tiles: 6, base: "#33302c", base2: "#262320", seam: "rgba(0,0,0,0.4)" }), { repeat: 6, px: 512 }),
      { rough: 0.94, metal: 0.02, color: 0xb0a894 },
    );

    // -------------------------------------------------------------- fence
    // The fenced parcel's own boundary, along the far edge of the lot. The
    // class works entirely on the near side of it.
    const fenceZ = -2.0;
    for (let i = -2; i <= 2; i++) {
      cyl(g, 0.03, 0.03, 1.3, i * 0.9, 0.65, fenceZ, CITY.darkSteel, { rough: 0.5, metal: 0.6, seg: 8 });
    }
    for (const [x1, x2] of [[-1.85, -0.05], [0.05, 1.85]]) {
      box(g, x2 - x1, 1.0, 0.05, (x1 + x2) / 2, 0.85, fenceZ, 0x545a52, { rough: 0.8, cast: false });
    }
    box(g, 3.8, 0.04, 0.06, 0, 1.3, fenceZ, CITY.steel, { rough: 0.5, metal: 0.6, cast: false });
    decal(g, 1.0, 0.3, 0, 1.0, fenceZ + 0.031, signFace("CAUTION — FEDERAL CLEANUP SITE — NO ENTRY", { bg: "#2a0c0c", accent: "#f0645b", scale: 0.32 }), { px: 260 });
    // The gap in the fence — where the "cross-fence" hazard lives.
    const gateGap = box(g, 0.9, 1.0, 0.2, -0.05 - (1.85 - 0.05) / 2 + (1.85 - 0.05) / 2, 0.85, fenceZ, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "keep out — public side only", 0, 1.55, fenceZ, { css: "#f0645b", w: 0.75 });
    reg(hits, gateGap, "cross-fence");

    // The granite kerb, along the sidewalk edge nearer the class — a decoy
    // for the "kerb-spike" interrupt, not the class's actual practice source.
    // The mineral speckle is a painted texture, not individual stones, so the
    // prop costs one mesh instead of a tray of tiny balls.
    const kerb = box(g, 1.6, 0.16, 0.28, 1.9, 0.08, 1.9, 0xffffff, { rough: 0.6 });
    kerb.material = texturedMat(
      surfaceTexture((cx, w, h) => {
        cx.fillStyle = "#b8ab9c"; cx.fillRect(0, 0, w, h);
        noiseTexture(cx, w, h, { density: 5200, alpha: 0.5, tone: "138,128,114" });
        noiseTexture(cx, w, h, { density: 2600, alpha: 0.4, tone: "202,192,174" });
      }, { repeat: 2, px: 256 }),
      { rough: 0.62, metal: 0.02, color: 0xffffff },
    );
    holoTag(kerb, "granite kerb", 0, 0.28, 0, { css: "#8a8072", w: 0.32 });
    void kerb;

    // -------------------------------------------------------- class table
    const table = group(g, -1.6, 0, 0.9, 0.4);
    box(table, 1.5, 0.05, 0.7, 0, 0.72, 0, 0xb8b0a0, { rough: 0.7 });
    for (const [sx, sz] of [[-0.65, -0.28], [0.65, -0.28], [-0.65, 0.28], [0.65, 0.28]]) box(table, 0.04, 0.72, 0.04, sx, 0.36, sz, 0x8a949d, { rough: 0.5, metal: 0.5 });

    const handout = holoPanel(table, 0.9, 0.6, -0.35, 1.15, 0, (ctx, w, h) => {
      ctx.fillStyle = "#241a08"; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#d9a02c"; ctx.fillRect(0, 0, w, 6);
      ctx.font = `600 ${Math.round(h * 0.1)}px 'Barlow Condensed', Arial, sans-serif`;
      ctx.textAlign = "left"; ctx.textBaseline = "middle";
      ctx.fillText("COMMUNITY METER CLASS", w * 0.06, h * 0.12);
      ctx.font = `${Math.round(h * 0.075)}px Arial, sans-serif`; ctx.fillStyle = "#f2e6cc";
      ["Background: read off-grid, off-fence", "Check source: Cs-137, tagged ±5%", "cpm = raw count rate", "µSv/h = estimated dose rate",
       "Grid: 4 corner stakes, in order", "Walk speed + height: hold the band"].forEach((line, i) => {
        ctx.fillText(line, w * 0.06, h * (0.28 + i * 0.115));
      });
    }, { accent: RMB_ACCENT });
    void handout;

    // Check source pig on the table.
    const sourcePig = group(table, 0.35, 0, -0.15, 0.4);
    cyl(sourcePig, 0.08, 0.09, 0.14, 0, 0.79, 0, 0xb8b0a0, { rough: 0.5, metal: 0.3, seg: 16 });
    cyl(sourcePig, 0.055, 0.055, 0.018, 0, 0.87, 0, 0x1b1e22, { rough: 0.6, seg: 14 });
    decal(sourcePig, 0.13, 0.055, 0, 0.79, 0.091, signFace("Cs-137 CHK", { bg: "#241a08", accent: "#d9a02c", scale: 0.5 }), { px: 160 });
    holoTag(sourcePig, "check source", 0, 0.98, 0, { css: "#d9a02c", w: 0.32 });
    reg(hits, sourcePig, "check-source");
    // Invisible marker for the "pocket-source" interrupt, at the class
    // member's own pocket rather than the source's usual spot.
    const reclaimMarker = box(table, 0.08, 0.1, 0.06, 0.5, 0.78, 0.45, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, reclaimMarker, "reclaim-source");

    // Units placard and range dial, mounted on the meter's own housing stand.
    const housing = group(table, -0.4, 0, 0.2, -0.2);
    box(housing, 0.24, 0.26, 0.2, 0, 0.85, 0, 0x2b2f34, { rough: 0.55, metal: 0.4 });
    const unitsFace = decal(housing, 0.2, 0.13, 0, 0.85, 0.101, signFace("cpm vs µSv/h", { bg: "#1c1204", accent: "#d9a02c", scale: 0.42 }), { px: 200 });
    void unitsFace;
    reg(hits, housing, "units-placard");
    const rangeKnob = valveWheel(housing, 0, 1.05, 0.1, { r: 0.05, color: RMB_ACCENT, body: 0x2b2f34 });
    holoTag(housing, "meter range", 0, 1.24, 0.1, { css: "#d9a02c", w: 0.3 });
    reg(hits, rangeKnob.userData.wheel, "range-dial");

    // Background instrument post, off to the side of the table.
    const bgPost = group(g, -2.1, 0.14, -0.4, 0.5);
    cyl(bgPost, 0.02, 0.02, 1.0, 0, 0.5, 0, CITY.steel, { rough: 0.45, metal: 0.6, seg: 10 });
    const bg = instrument(bgPost, 0, 1.02, 0, { ry: 0.4, idle: "-- cpm", color: RMB_ACCENT, w: 0.13, d: 0.2 });
    holoTag(bgPost, "background reading", 0, 1.2, 0, { css: "#d9a02c", w: 0.44 });
    reg(hits, bgPost, "background-post");

    // ---------------------------------------------------------- gear table
    const gearTable = group(g, -2.0, 0, 1.7, -0.3);
    box(gearTable, 1.0, 0.5, 0.4, 0, 0.25, 0, 0x53585e, { rough: 0.6, metal: 0.3 });
    const vest = group(gearTable, -0.3, 0.53, 0);
    box(vest, 0.22, 0.05, 0.18, 0, 0, 0, CITY.hiVis, { rough: 0.75 });
    holoTag(vest, "hi-vis vest", 0, 0.1, 0, { css: "#d9a02c", w: 0.32 });
    reg(hits, vest, "vest");
    const clipboard = group(gearTable, 0.05, 0.53, 0.05);
    box(clipboard, 0.18, 0.015, 0.24, 0, 0, 0, 0xe8e2d2, { rough: 0.85 });
    decal(clipboard, 0.15, 0.2, 0, 0.009, 0, signFace("FIELD LOG", { bg: "#f3efe4", accent: "#1b1e22", scale: 0.42 }), { px: 160 }).rotation.x = -Math.PI / 2;
    holoTag(clipboard, "field clipboard", 0, 0.1, 0, { css: "#d9a02c", w: 0.36 });
    reg(hits, clipboard, "clipboard");
    // The spare-meter tray for the calibration check, one sticker expired.
    const spareTray = group(gearTable, 0.35, 0.53, -0.05);
    const spareMeters = [];
    for (let i = 0; i < 4; i++) {
      const m = instrument(spareTray, -0.15 + i * 0.1, 0, 0, { ry: 0, idle: "OFF", color: 0x8a949d, w: 0.09, d: 0.14 });
      spareMeters.push(m);
    }
    decal(spareMeters[0], 0.07, 0.03, 0, 0.026, 0.03, signFace("CAL 2027", { bg: "#0d1c24", accent: "#59c97b", scale: 0.5 }), { px: 120 });
    decal(spareMeters[1], 0.07, 0.03, 0, 0.026, 0.03, signFace("CAL 2027", { bg: "#0d1c24", accent: "#59c97b", scale: 0.5 }), { px: 120 });
    decal(spareMeters[2], 0.07, 0.03, 0, 0.026, 0.03, signFace("CAL 2024 — DUE", { bg: "#2a0c0c", accent: "#f0645b", scale: 0.42 }), { px: 140 });
    decal(spareMeters[3], 0.07, 0.03, 0, 0.026, 0.03, signFace("CAL 2027", { bg: "#0d1c24", accent: "#59c97b", scale: 0.5 }), { px: 120 });
    holoTag(spareTray, "spare meters", 0, 0.14, 0, { css: "#d9a02c", w: 0.32 });
    reg(hits, spareMeters[2], "expired-meter");

    // ------------------------------------------------------------ material guide
    const guidePost = group(g, 1.7, 0, 1.6, -0.6);
    const guide = holoPanel(guidePost, 0.85, 0.55, 0, 1.2, 0, (ctx, w, h) => {
      ctx.fillStyle = "#241a08"; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#d9a02c"; ctx.fillRect(0, 0, w, 6);
      ctx.font = `600 ${Math.round(h * 0.1)}px 'Barlow Condensed', Arial, sans-serif`;
      ctx.textAlign = "left"; ctx.textBaseline = "middle";
      ctx.fillText("NATURAL BACKGROUND SOURCES", w * 0.06, h * 0.14);
      ctx.font = `${Math.round(h * 0.075)}px Arial, sans-serif`; ctx.fillStyle = "#f2e6cc";
      ["Granite, other igneous stone: natural U/Th", "Ceramic tile glaze, some ornamental rock",
       "These read elevated on their own", "— not evidence of the parcel"].forEach((line, i) => {
        ctx.fillText(line, w * 0.06, h * (0.3 + i * 0.14));
      });
    }, { accent: RMB_ACCENT });
    holoTag(guidePost, "reference chart", 0, 1.5, 0, { css: "#d9a02c", w: 0.34 });
    reg(hits, guide, "material-guide");

    // -------------------------------------------------------------- grid
    const stakeGrp = group(g, -0.2, 0, 0.4);
    const stakeSpecs = [["stake-1", -1.0], ["stake-2", -0.35], ["stake-3", 0.3], ["stake-4", 0.95]];
    for (const [id, x] of stakeSpecs) {
      const s = group(stakeGrp, x, 0.14, -0.7);
      cyl(s, 0.014, 0.014, 0.45, 0, 0.225, 0, CITY.hiVis, { rough: 0.55, seg: 8 });
      box(s, 0.09, 0.06, 0.006, 0.045, 0.41, 0, RMB_ACCENT, { rough: 0.6, emissive: RMB_ACCENT, ei: 0.5 });
      holoTag(s, id.slice(-1), 0, 0.52, 0, { css: "#d9a02c", w: 0.16 });
      reg(hits, s, id);
    }
    const gridOverlay = box(stakeGrp, 2.1, 0.005, 0.6, 0, 0.153, -0.7, 0xffffff, { rough: 0.9, opacity: 0.1, transparent: true, cast: false });
    void gridOverlay;

    // The class's own staged training source, buried shallow in the grid —
    // never the parcel's ground, always the instructor's own low-activity
    // source set out for the lesson.
    const hotspot = group(stakeGrp, 0.35, 0.153, -0.5);
    const hotspotDecal = decal(hotspot, 0.35, 0.35, 0, 0.001, 0, signFace("", { bg: "rgba(217,160,44,0.28)", accent: "#d9a02c", scale: 0.1 }), { transparent: true });
    hotspotDecal.rotation.x = -Math.PI / 2;
    holoTag(hotspot, "training source — staged", 0, 0.3, 0.14, { css: "#d9a02c", w: 0.55 });
    reg(hits, hotspot, "hotspot");
    hotspot.visible = false;
    const hotspotSocket = group(hotspot, 0, 0.02, 0);
    hits["hotspot-socket"] = hotspotSocket;

    // Meter carried across the grid during the walkover.
    const meterGrp = group(g, -0.2, 0.14, 0.9, -0.3);
    cyl(meterGrp, 0.012, 0.012, 0.55, 0, 0.27, 0, CITY.darkSteel, { rough: 0.5, metal: 0.5, seg: 8 });
    const meter = instrument(meterGrp, 0, 0.56, 0, { ry: 0.5, idle: "-- cpm", color: RMB_ACCENT, w: 0.13, d: 0.2 });
    holoTag(meterGrp, "survey meter", 0, 0.76, 0, { css: "#d9a02c", w: 0.32 });
    reg(hits, meterGrp, "meter");

    // --------------------------------------------------------- flag rack
    const flagRack = group(g, 1.5, 0.14, 0.6, -0.4);
    cyl(flagRack, 0.018, 0.018, 0.35, 0, 0.175, 0, CITY.steel, { rough: 0.5, metal: 0.6, seg: 8 });
    const flagMarker = group(flagRack, 0, 0.36, 0);
    box(flagMarker, 0.1, 0.06, 0.006, 0.05, 0, 0, RMB_ACCENT, { rough: 0.55, emissive: RMB_ACCENT, ei: 0.6 });
    holoTag(flagRack, "numbered flag", 0, 0.52, 0, { css: "#d9a02c", w: 0.3 });
    reg(hits, flagMarker, "flag-marker");
    for (const dz of [-0.07, 0.07]) {
      const spare = group(flagRack, 0, 0.28, dz);
      cyl(spare, 0.007, 0.007, 0.24, 0, 0.12, 0, CITY.steel, { rough: 0.5, metal: 0.6, seg: 6 });
    }

    // ------------------------------------------------------------ record bench
    const recordBench = group(g, 1.6, 0, 1.35, -0.3);
    box(recordBench, 1.0, 0.5, 0.4, 0, 0.25, 0, 0x53585e, { rough: 0.6, metal: 0.3 });
    const fieldLog = group(recordBench, -0.32, 0.53, 0);
    box(fieldLog, 0.18, 0.015, 0.24, 0, 0, 0, 0xe8e2d2, { rough: 0.85 });
    decal(fieldLog, 0.15, 0.2, 0, 0.009, 0, signFace("READING LOG", { bg: "#f3efe4", accent: "#1b1e22", scale: 0.38 }), { px: 160 }).rotation.x = -Math.PI / 2;
    holoTag(fieldLog, "field log", 0, 0.1, 0, { css: "#d9a02c", w: 0.28 });
    reg(hits, fieldLog, "field-log");
    const camera = group(recordBench, 0, 0.56, 0.05);
    box(camera, 0.11, 0.07, 0.08, 0, 0, 0, 0x1b1e22, { rough: 0.4, metal: 0.4 });
    cyl(camera, 0.026, 0.03, 0.05, 0, 0, 0.06, 0x2b2f34, { rough: 0.35, metal: 0.5, seg: 12 }).rotation.x = Math.PI / 2;
    holoTag(camera, "camera", 0, 0.13, 0, { css: "#d9a02c", w: 0.26 });
    reg(hits, camera, "camera");
    const radio = group(recordBench, 0.35, 0.53, -0.02);
    box(radio, 0.06, 0.14, 0.04, 0, 0, 0, 0x22262b, { rough: 0.5, metal: 0.3 });
    cyl(radio, 0.005, 0.005, 0.09, 0, 0.11, 0, CITY.steel, { rough: 0.4, metal: 0.7, seg: 6 });
    holoTag(radio, "report to class lead", 0, 0.22, 0, { css: "#d9a02c", w: 0.5 });
    reg(hits, radio, "report-radio");

    // The shortcut object for the "log-from-memory" hazard: a scrap of paper,
    // off to the side, that never touched the flagged point.
    const scrap = group(recordBench, -0.1, 0.53, -0.15);
    box(scrap, 0.1, 0.008, 0.13, 0, 0, 0, 0xe8e2d2, { rough: 0.85 });
    holoTag(scrap, "write it from memory?", 0, 0.08, 0, { css: "#d2312b", w: 0.5 });
    reg(hits, scrap, "log-from-memory");

    // The bypass button for the "skip-source-check" hazard, near the meter dock.
    const skipBtn = box(table, 0.09, 0.03, 0.05, 0.62, 0.75, 0.28, 0xd2312b, { rough: 0.5 });
    decal(skipBtn, 0.08, 0.025, 0, 0.016, 0, signFace("SKIP CHECK", { bg: "#2a0c0c", accent: "#ffffff", scale: 0.5 }), { px: 140 });
    holoTag(table, "skip the check?", 0.62, 0.86, 0.28, { css: "#d2312b", w: 0.42 });
    reg(hits, skipBtn, "skip-source-check");

    // The mislabelled report on the record bench, for the "confuse-units" hazard.
    const badReport = group(recordBench, 0.28, 0.53, 0.14);
    box(badReport, 0.16, 0.008, 0.11, 0, 0, 0, 0xf3efe4, { rough: 0.85 });
    decal(badReport, 0.14, 0.09, 0, 0.005, 0, signFace("12 cpm listed as 12 µSv/h", { bg: "#2a0c0c", accent: "#f0645b", scale: 0.32 }), { px: 160 }).rotation.x = -Math.PI / 2;
    holoTag(badReport, "submit as-is?", 0, 0.1, 0, { css: "#d2312b", w: 0.42 });
    reg(hits, badReport, "confuse-units");

    // -------------------------------------------------------- limits board
    const limitsPost = group(g, 2.0, 0, -0.7, 0.6);
    const limits = holoPanel(limitsPost, 0.85, 0.55, 0, 1.2, 0, (ctx, w, h) => {
      ctx.fillStyle = "#241a08"; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#d9a02c"; ctx.fillRect(0, 0, w, 6);
      ctx.font = `600 ${Math.round(h * 0.1)}px 'Barlow Condensed', Arial, sans-serif`;
      ctx.textAlign = "left"; ctx.textBaseline = "middle";
      ctx.fillText("WHAT THIS METER CANNOT TELL YOU", w * 0.06, h * 0.13, w * 0.88);
      ctx.font = `${Math.round(h * 0.075)}px Arial, sans-serif`; ctx.fillStyle = "#f2e6cc";
      ["Which isotope is making it click", "How deep a source sits below grade",
       "Both take a lab and a different survey", "A count rate alone answers neither"].forEach((line, i) => {
        ctx.fillText(line, w * 0.06, h * (0.3 + i * 0.14));
      });
    }, { accent: RMB_ACCENT });
    holoTag(limitsPost, "meter limits", 0, 1.5, 0, { css: "#d9a02c", w: 0.34 });
    reg(hits, limits, "limits-board");

    // ------------------------------------------------------------- dressing
    cone(g, -2.2, -1.7, { color: RMB_ACCENT }); cone(g, 2.1, -1.6, { color: RMB_ACCENT });
    toolChest(g, 2.0, 0.2, { ry: -0.7, color: 0x8a5f2f });
    barrierPanel(g, -1.0, -1.4, { ry: 0.4, w: 1.1, color: RMB_ACCENT });
    barrierPanel(g, 1.0, -1.4, { ry: -0.4, w: 1.1, color: RMB_ACCENT });
    const instructor = standingFigure(g, -0.45, -0.95, { ry: 2.2, cloth: 0x37505f, vest: RMB_ACCENT, helmet: 0xf2f2f2 });
    holoTag(instructor, "class lead", 0, 1.95, 0.15, { css: "#d9a02c", w: 0.34 });
    const classmate = standingFigure(g, 0.55, 0.75, { ry: -1.1, cloth: 0x5a3f6f, vest: 0xf2c14b, helmet: 0xe4dc3a });
    void classmate;
    const dust = particles(g, 24, 0xbfc6cc, { size: 0.045, life: 1.6, additive: false, opacity: 0.14 });

    return {
      hits,
      spawnLook: new THREE.Vector3(0, 1.1, -0.3),
      onStep() {},
      onStepComplete(step) {
        if (step.id === "source-check-am") repaint(bg.userData.screen, signFace("READY", { bg: "#1c1204", accent: "#59c97b", fg: "#f2e6cc", scale: 0.55 }));
        if (step.id === "walkover") { hotspot.visible = true; }
        if (step.id === "static-count") repaint(meter.userData.screen, signFace("2× BACKGROUND", { bg: "#241a08", accent: "#d2312b", fg: "#f2e6cc", scale: 0.36 }));
        if (step.id === "flag") { flagMarker.parent.remove(flagMarker); hotspotSocket.add(flagMarker); flagMarker.position.set(0, 0.02, 0); flagMarker.rotation.set(0, 0, 0); }
        if (step.id === "record") repaint(bg.userData.screen, signFace("LOGGED", { bg: "#1c1204", accent: "#59c97b", fg: "#f2e6cc", scale: 0.55 }));
      },
      onInterrupt(it) {
        if (it.id === "pocket-source") { sourcePig.visible = false; }
        if (it.id === "kerb-spike") { holoTag(kerb, "spike?", 0, 0.5, 0, { css: "#f0645b", w: 0.3 }); }
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "pocket-source") { sourcePig.visible = true; }
      },
      onHazard() {},
      animate(t, dt, session) {
        dust.visible = true; dust.userData.step(dt, new THREE.Vector3(0, 0.5, 0), 0.02, 1.2, 0.08);
        const gg = session?.gauge;
        if (gg && !gg.committed && session.step?.id === "background") {
          repaint(bg.userData.screen, signFace(`${(8 + gg.t * 8).toFixed(1)} cpm`, {
            bg: "#1c1204", accent: gg.t >= 0.42 && gg.t <= 0.58 ? "#59c97b" : "#f2ae14", fg: "#f2e6cc", scale: 0.55,
          }));
        }
        if (session?.track && session.step?.id === "walkover") {
          const v = session.track.v;
          repaint(meter.userData.screen, signFace(v < 0.4 ? "TOO FAST" : v > 0.6 ? "TOO SLOW" : "ON PACE", {
            bg: "#241a08", accent: v >= 0.4 && v <= 0.6 ? "#59c97b" : "#f2ae14", fg: "#f2e6cc", scale: 0.48,
          }));
        }
        if (session?.step?.id === "range" && session.turn) {
          rangeKnob.userData.wheel.rotation.z = session.turn.amount * Math.PI * 2;
        }
      },
    };
  },
};
