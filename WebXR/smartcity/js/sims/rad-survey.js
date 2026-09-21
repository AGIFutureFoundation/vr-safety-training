import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, ball, torus, slab, group, decal, repaint, signFace, particles, mat,
} from "../../../shared/kit.js";
import {
  CITY, stationPad, holoPanel, holoTag, toolChest, cone, barrierPanel, instrument,
  standingFigure, valveWheel, surfaceTexture, pavingFace, deckPlateFace, texturedMat, reg,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Rad Survey VR — Environmental Monitoring, station seventy-five.
//
// A radiation control technician's gamma walkover and static-count survey on
// a generic parcel: a former shipyard tract on a bay shoreline, under a
// federal cleanup order and a site-specific radiological work plan. No real
// site is named here and nothing on this pad claims to be any particular
// cleanup — the procedure is the whole point. What makes a survey's numbers
// worth trusting is not the walkover itself but the instrument bracketed by
// a known check source before the first grid square and again after the
// last one, a background reading taken off-parcel, a static count and a
// GPS-tagged log entry on anything over the investigation level, and a soil
// sample split under chain of custody so an independent lab can check the
// project's own result against it. Skip any one of those and a survey is a
// number with nothing standing behind it, which is the discipline this
// station exists to teach as procedure, not as a story about any one place.

const RS_ACCENT = 0xcf3fae;

export const SIM_RAD_SURVEY = {
  id: "rad-survey",
  index: "75",
  domain: "Environmental",
  trade: "Radiation control technician",
  category: "Environmental Monitoring",
  weather: "fog",
  certification: "LIUNA hazmat & environmental laborer — OSHA HAZWOPER 40-hour (29 CFR 1910.120); NRC 10 CFR 20 occupational dose limits; EPA MARSSIM (Multi-Agency Radiation Survey and Site Investigation Manual) walkover and static-count methodology; the site's radiological work plan and QAPP chain of custody",
  name: "Rad Survey",
  title: simTitle("Rad Survey"),
  tagline: "Gamma walkover and static count on a shoreline parcel: instrument bracketed by a check source, a gridded scan, GPS-tagged flags and a split sample under chain of custody",
  accent: RS_ACCENT,
  accentCss: "#cf3fae",
  parSeconds: 280,
  footprint: 2.3,
  badge: { id: "bracketed-day", name: "Bracketed Day", note: "Instrument proven against the check source before the grid and after it, every flagged reading GPS-logged, and the independent lab's split never touched" },

  game: system({
    name: "Survey Integrity",
    currency: "COUNT",
    ranks: ["Field Tech", "Grid Walker", "Static Counter", "QA Verifier", "Survey Integrity Certified"],
    badges: [
      { id: "both-brackets", name: "Both Brackets", note: "Source-checked the instrument clean at the start of the day and again at the end", test: AWARD.all(AWARD.stepClean("source-check-am"), AWARD.stepClean("source-check-pm")) },
      { id: "never-combined", name: "Never Combined", note: "The independent lab's split sample was never poured back into the primary", test: AWARD.safe },
      { id: "grid-true", name: "Grid True", note: "Held scan speed and detector height in the band the whole lane", test: AWARD.precise(0.7) },
    ],
    challenges: [
      { id: "clean-grid", name: "Clean Grid", note: "No corrections anywhere in the survey", test: AWARD.clean },
      { id: "steady-scan", name: "Steady Scan", note: "Never broke the walkover speed band", test: AWARD.unbroken },
      { id: "cooler-early", name: "Cooler Early", note: "Sample on ice inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "skip-source-check": "You powered up and started scanning without checking the instrument against the source first. Every reading this meter takes today is now unverifiable — there is no way to tell a real hot spot from an instrument that was already reading high before the cap ever came off the check source.",
    "cross-tape": "You stepped past the exclusion tape onto ground that has not been gridded or surveyed yet. Nobody knows what is under an unsurveyed square by definition — that is exactly the ground the tape exists to keep feet off until the grid actually reaches it.",
    "log-from-memory": "You wrote the flagged reading into the field notebook from memory instead of logging it with the GPS unit. A remembered number and a remembered location both drift the moment the notebook gets copied out — the whole point of a GPS-tagged entry is that it cannot be misremembered.",
    "combine-split": "You poured the split jar back into the primary to save a container. That split was the only way anyone outside this crew could ever check this result against an independent lab — combine the two and there is nothing left to check it against, only one number trusting itself.",
  },

  lateNotes: {
    "check-source": "The check source doesn't get touched until the range is set and the coveralls are on — checking a meter you aren't ready to survey with yet just spends the source's certified count for nothing.",
    "hotspot": "There is nothing to flag yet — the walkover has to actually cross this point and read it elevated before there is a location worth a static count.",
  },

  // Interruptions: see the interrupt layer in shared/game.js. Both are armed
  // on a hold or a track step, on purpose — a gauge or a turn step resolves
  // in one click, too fast for the fuse to ever find the learner mid-task.
  interrupts: [
    {
      id: "stake-down",
      kind: "Stake down",
      after: "walkover", delay: 4, seconds: 13,
      alert: "A gust off the water has knocked lane stake 2 flat and dragged it out of the transect line while you're mid-lane.",
      cue: "Reset the stake before the lane you're scanning stops matching the grid you laid out.",
      target: "stake-2",
      why: "Once a stake moves, the detector's track and the grid it is supposed to represent are two different things — MARSSIM's coverage claim is about ground inside marked lanes, and ground next to a fallen stake is not provably inside anything.",
      missNote: "The lane was scanned against a grid that no longer matched the stakes on the ground, and nobody caught it until the field sheet and the tape measure disagreed back at the truck — by then the only fix was re-walking the whole lane.",
      wrongNote: "That is not it — it is stake 2, down on the ground, out of the line. Reset it before the scan drifts any further off the grid you actually laid out.",
    },
    {
      id: "encroach",
      kind: "Encroachment",
      after: "static-count", delay: 3, seconds: 13,
      alert: "A grading crew working the next parcel over has walked past their own fence line and is heading straight for your flagged point while the static count is still running.",
      cue: "Key the radio and get them clear before anyone stands on ground that hasn't been surveyed yet.",
      target: "radio",
      why: "A static count measures a fixed point under fixed conditions — a boot on the point, or even standing close enough to scuff it, changes exactly the ground the count is trying to characterize, and an uncleared crew member has no idea this square hasn't been surveyed.",
      missNote: "The grading crew reached the flagged point mid-count, the static count had to be thrown out and re-run from zero, and for those minutes an unsurveyed hot spot had somebody standing directly on top of it who was never told it might be one.",
      wrongNote: "Not that — key the radio and reach the encroaching crew before they reach the point. Everything else waits until that ground is clear again.",
    },
  ],

  steps: [
    {
      id: "plan", kind: "select", target: "rwp-board",
      title: "Read the radiological work plan",
      cue: "Check the investigation level, the grid spacing and the check-source activity before the meter comes off the truck.",
      why: "The work plan sets the number every reading on this parcel gets judged against — the investigation level — along with how far apart the grid lines run and which check source certifies the instrument. Walking the grid without reading it first means the technician is choosing those numbers instead of the plan.",
    },
    {
      id: "dosimetry", kind: "sequence", anyOrder: true,
      targets: ["dosimeter", "tyvek"],
      itemNames: { "dosimeter": "dosimeter", "tyvek": "disposable coveralls" },
      title: "Put on dosimetry and coveralls",
      cue: "Clip on the dosimeter and step into disposable coveralls before touching anything on the parcel.",
      why: "The dosimeter is the record of this technician's own exposure for the day, and it only means something if it went on before the first grid square rather than clipped on somewhere mid-survey. Coveralls keep whatever the boots pick up out of the truck and off the crew at shift's end.",
    },
    {
      id: "range", kind: "turn", target: "range-dial",
      title: "Set the instrument's range",
      cue: "Turn the range selector to the scale the work plan calls for before powering up.",
      why: "A gamma survey meter left on the wrong range either pins at the top of its scale on a real hot spot or buries a real reading down in the noise floor — the range has to match what the plan expects to find, decided before the meter goes anywhere near the ground.",
      turn: { turns: 0.5, axis: "y", label: "RANGE" },
    },
    {
      id: "source-check-am", kind: "hold", target: "check-source", seconds: 5,
      title: "Check the instrument — morning",
      cue: "Hold the probe against the sealed check source until the reading settles, and confirm it falls inside the tagged tolerance.",
      why: "This is the first end of the bracket: proof the instrument itself reads true before it ever touches a square foot of the grid. A survey run on an unchecked meter is not evidence of anything, no matter how carefully the grid gets walked afterward — it is a number nobody can stand behind.",
      holdBreakNote: "Lifted off the source before the reading settled — that is not a check, it's a glance. Hold it on until it settles and reads back inside tolerance.",
    },
    {
      id: "background", kind: "gauge", target: "background-post",
      title: "Establish the off-parcel background",
      cue: "Walk the meter off the parcel, let the reading settle, and commit inside the range the plan expects.",
      why: "Every reading taken on the grid is judged against this number, not against zero. Skip the off-parcel background and there is no way to tell an elevated reading on the grid from ordinary local background — the whole survey loses the baseline it needs to mean anything.",
      gauge: {
        label: "BACKGROUND", speed: 0.65, green: [0.42, 0.58],
        readout: (t) => `${(6 + t * 10).toFixed(1)} µR/h`,
        missNote: "That is not a settled background reading — read it off-parcel again and commit only once it's inside the range the plan expects.",
      },
    },
    {
      id: "grid", kind: "sequence",
      targets: ["stake-1", "stake-2", "stake-3", "stake-4"],
      itemNames: { "stake-1": "lane stake 1", "stake-2": "lane stake 2", "stake-3": "lane stake 3", "stake-4": "lane stake 4" },
      title: "Lay out the survey grid",
      cue: "Set the four lane stakes in the order the plan's transect walks — 1 through 4.",
      why: "The stakes are what turn a stretch of open ground into a grid somebody else can re-walk later and land on the same squares. Set them out of order and the lane numbers on the field sheet stop matching the ground actually underfoot.",
      outOfOrderNote: "That is not the next stake in the transect — the plan's lane order is 1, 2, 3, 4, and setting them any other way puts the wrong number on the wrong patch of ground.",
    },
    {
      id: "walkover", kind: "track", target: "detector", seconds: 9,
      title: "Walk the grid at survey speed",
      cue: "Hold the detector at the set height and keep your pace inside the band the whole lane.",
      why: "MARSSIM's coverage assumption only holds at this speed and height — faster, and a hot spot the size the plan is looking for can pass under the detector between readings; slower, and the crew never finishes the parcel before the day's tide window closes.",
      track: {
        start: 0.1, green: [0.4, 0.6], rise: 0.55, fall: 0.5, drift: 0.12, label: "SCAN SPEED",
        readout: (v) => (v < 0.4 ? "too fast — under-scanned" : v > 0.6 ? "too slow — behind schedule" : "scanning at spec"),
      },
      holdBreakNote: "Speed drifted out of the band — at that pace the detector is either skating over ground it never really surveyed or falling behind the plan's schedule. Bring it back and hold the lane.",
    },
    {
      id: "static-count", kind: "hold", target: "hotspot", seconds: 6,
      title: "Take a static count over the elevated reading",
      cue: "Stop over the point the walkover flagged and hold the detector still for the full static count.",
      why: "A walkover reading is a snapshot taken while moving; a static count is what actually confirms a point is over the investigation level rather than a spike in the noise. Nothing gets flagged, logged or sampled off a walkover number alone.",
      holdBreakNote: "Lifted the detector before the count finished — an incomplete static count is not confirmation of anything, it's a reading that got interrupted.",
    },
    {
      id: "flag-place", kind: "drag", target: "flag-marker",
      title: "Flag the point",
      cue: "Carry a numbered flag out and set it exactly on the point the static count confirmed.",
      why: "The flag is what makes this an actual location and not just a number in a logbook — the sampling crew that follows days later is going to trust exactly where this flag is standing, not where the field notes say it was roughly near.",
      drag: { to: "hotspot-socket", radius: 0.35, missNote: "Not set on the point — a flag off by even a stake's width sends the sampling crew and the next survey team to look in the wrong place." },
    },
    {
      id: "gps-log", kind: "select", target: "gps-logger",
      title: "Log the GPS-tagged entry",
      cue: "Tie the coordinates and the static-count reading together in one logged entry before moving on.",
      why: "A reading and a location that are not logged together as one entry can drift apart the moment somebody re-types the field sheet — the GPS tag is what keeps this exact number pinned to this exact spot for anyone who has to find it again.",
    },
    {
      id: "sample", kind: "select", target: "scoop",
      title: "Collect the soil sample",
      cue: "Use the dedicated scoop for this point, not whatever tool is already in your hand, to pull the sample.",
      why: "A scoop that touched another point on the grid carries that point's soil into this one's result. The dedicated scoop is what keeps a hot reading from one square from showing up as a false positive three squares away from where it actually is.",
    },
    {
      id: "split", kind: "sequence",
      targets: ["jar-primary", "jar-split"],
      itemNames: { "jar-primary": "primary jar", "jar-split": "split jar" },
      title: "Fill the primary and split jars",
      cue: "Fill the project lab's jar first, off the top of the pull, then the independent lab's split jar from what's left.",
      why: "The split jar is the whole reason anybody outside this crew can trust the number that comes back — it goes to a lab this crew does not run, on the same soil from the same pull, so a result can be checked against a result instead of against itself.",
      outOfOrderNote: "Primary first, off the top of the pull, then the split from what's left — filling the split first shorts the primary's fill line, and the two jars stop being an honest split of the same material.",
    },
    {
      id: "custody", kind: "select", target: "coc-form",
      title: "Sign the chain of custody",
      cue: "Label both jars — point ID, date, time, sampler — and sign the custody form tying them together as a split.",
      why: "From here the two jars are evidence, and the form is what proves they came off the same scoop at the same point. A split sample with no custody record linking the pair is just two jars of soil that happen to look similar.",
    },
    {
      id: "source-check-pm", kind: "hold", target: "check-source", seconds: 5,
      title: "Check the instrument — end of day",
      cue: "Hold the probe against the same check source again before it goes back in the truck.",
      why: "This closes the bracket the morning check opened. A day's readings verified only at the start are one drifted battery or one bumped calibration away from unverifiable by the time anyone questions them — the closing check is what lets every reading in between stand on its own.",
      holdBreakNote: "Lifted off the source again before it settled — the closing check has to actually complete, or the day's readings are only bracketed on one end.",
    },
    {
      id: "final-walk", kind: "find", noHint: true,
      targets: ["unlabeled-jar"],
      itemNames: { "unlabeled-jar": "unlabeled jar" },
      itemNotes: { "unlabeled-jar": "That jar has no point ID, no date and no sampler's initials on it — it is not traceable to any square on the grid, and a lab cannot certify soil it cannot place." },
      title: "Walk the sample tray before the cooler closes",
      cue: "Check every jar on the tray against the custody log and click the one with no label.",
      why: "The lab trusts whatever the label says a jar is. One unlabeled jar in a cooler full of labeled ones is a sample that either gets thrown out or gets guessed at, and neither of those is what an independent split sample is supposed to survive to become.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.3, RS_ACCENT);

    // ------------------------------------------------------------- ground
    // A packed-earth/gravel parcel, not a flat colour: pavingFace's tonal
    // jitter and grain read as compacted fill under bay fog.
    const groundMesh = box(g, 5.6, 0.14, 5.2, 0, 0.07, 0, 0xffffff, { rough: 0.96 });
    groundMesh.material = texturedMat(
      surfaceTexture((cx, w, h) => pavingFace(cx, w, h, { tiles: 5, base: "#463a29", base2: "#3c3122", seam: "rgba(0,0,0,0.35)" }), { repeat: 6, px: 512 }),
      { rough: 0.96, metal: 0.02, color: 0xb7ab8e },
    );
    // A anti-slip deck-plate walk lane from the truck to the grid, the same
    // finish used for foot lanes on the shared stage.
    const laneMesh = box(g, 0.9, 0.02, 3.0, 1.2, 0.145, 0.1, 0xffffff, { rough: 0.6, metal: 0.3, cast: false });
    laneMesh.material = texturedMat(
      surfaceTexture((cx, w, h) => deckPlateFace(cx, w, h), { repeat: 10, px: 256 }),
      { rough: 0.55, metal: 0.4, color: 0xc7ccd1 },
    );

    // -------------------------------------------------------- exclusion tape
    // The gridded parcel is in front of the tape; the ungridded ground the
    // grading crew and the "cross-tape" hazard live on is behind it.
    for (const [x, z, ry] of [[-1.6, -1.6, 0.5], [0.2, -1.85, 0.15], [1.9, -1.5, -0.4]]) {
      barrierPanel(g, x, z, { ry, w: 1.15, color: RS_ACCENT });
    }
    const tapeGap = box(g, 0.5, 0.24, 0.3, 0.9, 0.24, -1.9, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "unsurveyed ground — stay behind the tape", 0.9, 0.55, -1.9, { css: "#f0645b", w: 0.7 });
    reg(hits, tapeGap, "cross-tape");

    // Ungridded ground beyond the tape, and the grading crew's silhouette
    // parked on their own side of it until the encroachment interrupt.
    box(g, 2.6, 0.02, 1.4, 0.6, 0.151, -2.6, 0x39301f, { rough: 0.98, cast: false });
    const grader = group(g, 2.1, 0.14, -2.6, 2.3);
    box(grader, 0.7, 0.4, 0.5, 0, 0.32, 0, 0xe8b02e, { rough: 0.6 });
    box(grader, 0.9, 0.12, 0.12, 0.55, 0.6, 0, 0xe8b02e, { rough: 0.6 }).rotation.z = 0.4;
    for (const sx of [-0.24, 0.24]) box(grader, 0.75, 0.18, 0.14, 0, 0.1, sx, 0x2b2f34, { rough: 0.8 });
    holoTag(grader, "next parcel — grading crew", 0, 0.85, 0, { css: "#f0645b", w: 0.5 });

    // ---------------------------------------------------------- background post
    const bgPost = group(g, -1.85, 0.14, -1.55, 0.5);
    cyl(bgPost, 0.02, 0.02, 1.0, 0, 0.5, 0, CITY.steel, { rough: 0.45, metal: 0.6, seg: 10 });
    const bg = instrument(bgPost, 0, 1.02, 0, { ry: 0.4, idle: "-- µR/h", color: RS_ACCENT, w: 0.13, d: 0.2 });
    holoTag(bgPost, "off-parcel background", 0, 1.2, 0, { css: "#cf3fae", w: 0.42 });
    reg(hits, bgPost, "background-post");

    // -------------------------------------------------------------- grid stakes
    const stakeGrp = group(g, -0.3, 0, 0.3);
    const stakeMeshes = {};
    const stakeSpecs = [["stake-1", -1.0], ["stake-2", -0.35], ["stake-3", 0.3], ["stake-4", 0.95]];
    for (const [id, x] of stakeSpecs) {
      const s = group(stakeGrp, x, 0.14, -0.9);
      cyl(s, 0.014, 0.014, 0.5, 0, 0.25, 0, CITY.hiVis, { rough: 0.55, seg: 8 });
      const flag = box(s, 0.1, 0.06, 0.006, 0.05, 0.46, 0, RS_ACCENT, { rough: 0.6, emissive: RS_ACCENT, ei: 0.5 });
      holoTag(s, id.slice(-1), 0, 0.58, 0, { css: "#cf3fae", w: 0.16 });
      reg(hits, s, id);
      stakeMeshes[id] = { grp: s, flag };
    }

    // Grid lane overlay so the walkover reads as a scanned strip once it runs.
    const gridOverlay = box(stakeGrp, 2.2, 0.005, 0.7, 0, 0.153, -0.9, 0xffffff,
      { rough: 0.9, opacity: 0.12, transparent: true, cast: false });
    void gridOverlay;

    // ------------------------------------------------------------- hotspot
    const hotspot = group(stakeGrp, 0.35, 0.153, -0.55);
    const hotspotDecal = decal(hotspot, 0.4, 0.4, 0, 0.001, 0,
      signFace("", { bg: "rgba(207,63,174,0.28)", accent: "#cf3fae", scale: 0.1 }), { transparent: true });
    hotspotDecal.rotation.x = -Math.PI / 2;
    holoTag(hotspot, "elevated reading", 0, 0.3, 0.16, { css: "#cf3fae", w: 0.4 });
    reg(hits, hotspot, "hotspot");
    hotspot.visible = false;
    const hotspotSocket = group(hotspot, 0, 0.02, 0);
    hits["hotspot-socket"] = hotspotSocket;

    // Detector, carried across the grid during the walkover.
    const detectorGrp = group(g, -0.3, 0.14, 0.55, -0.3);
    cyl(detectorGrp, 0.014, 0.014, 0.75, 0, 0.37, 0, CITY.darkSteel, { rough: 0.5, metal: 0.5, seg: 8 });
    const detector = instrument(detectorGrp, 0, 0.78, 0, { ry: 0.5, idle: "-- cpm", color: RS_ACCENT, w: 0.14, d: 0.22 });
    holoTag(detectorGrp, "gamma detector", 0, 0.98, 0, { css: "#cf3fae", w: 0.34 });
    reg(hits, detectorGrp, "detector");

    // -------------------------------------------------------------- flag rack
    const flagRack = group(g, 1.55, 0.14, 0.85, -0.4);
    cyl(flagRack, 0.02, 0.02, 0.4, 0, 0.2, 0, CITY.steel, { rough: 0.5, metal: 0.6, seg: 8 });
    const flagMarker = group(flagRack, 0, 0.42, 0);
    box(flagMarker, 0.11, 0.07, 0.006, 0.055, 0, 0, RS_ACCENT, { rough: 0.55, emissive: RS_ACCENT, ei: 0.6 });
    holoTag(flagRack, "numbered flag", 0, 0.6, 0, { css: "#cf3fae", w: 0.3 });
    reg(hits, flagMarker, "flag-marker");
    // Two spare flags on the rack, staged but not the interactive one.
    for (const dz of [-0.08, 0.08]) {
      const spare = group(flagRack, 0, 0.34, dz);
      cyl(spare, 0.008, 0.008, 0.28, 0, 0.14, 0, CITY.steel, { rough: 0.5, metal: 0.6, seg: 6 });
    }

    // ----------------------------------------------------------------- truck
    const truck = group(g, 1.85, 0.14, 1.35, -1.0);
    box(truck, 1.5, 0.75, 0.95, 0, 0.6, 0, 0xe8eef2, { rough: 0.5, metal: 0.3 });
    box(truck, 1.1, 0.06, 0.95, -0.15, 0.98, 0, 0x2b2f34, { rough: 0.7 });
    for (const sx of [-0.55, 0.55]) cyl(truck, 0.18, 0.18, 0.2, sx, 0.18, 0.42, 0x1b1e22, { rough: 0.8, seg: 16 }).rotation.x = Math.PI / 2;
    decal(truck, 0.5, 0.14, 0.15, 0.62, 0.478, signFace("RADIOLOGICAL SURVEY", { bg: "#2a0c30", accent: "#cf3fae", scale: 0.42 }));

    // Work plan board on the tailgate.
    const boardPost = group(truck, -0.9, 0, 0.2, 0.6);
    holoPanel(boardPost, 0.9, 0.6, 0, 1.25, 0, (ctx, w, h) => {
      ctx.fillStyle = "#1c0a1a"; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#cf3fae"; ctx.fillRect(0, 0, w, 6);
      ctx.font = `600 ${Math.round(h * 0.105)}px 'Barlow Condensed', Arial, sans-serif`;
      ctx.textAlign = "left"; ctx.textBaseline = "middle";
      ctx.fillText("RADIOLOGICAL WORK PLAN — PARCEL 4", w * 0.06, h * 0.13);
      ctx.font = `${Math.round(h * 0.078)}px Arial, sans-serif`; ctx.fillStyle = "#f2dcee";
      ["Investigation level: 15,000 cpm gamma", "Grid: 2 m stakes, lanes 1–4", "Check source: Cs-137, tagged tolerance ±5%",
       "Static count: 60 s minimum over IL", "Sample: split, primary + independent lab", "Log every flag with GPS + time"].forEach((line, i) => {
        ctx.fillText(line, w * 0.06, h * (0.28 + i * 0.115));
      });
    }, { accent: RS_ACCENT });
    reg(hits, boardPost, "rwp-board");

    // Range dial on the instrument dock.
    const rangeStack = group(truck, -0.15, 0, 0.55, -0.3);
    box(rangeStack, 0.22, 0.24, 0.2, 0, 1.1, 0, 0x2b2f34, { rough: 0.55, metal: 0.4 });
    const rangeKnob = valveWheel(rangeStack, 0, 1.28, 0.08, { r: 0.055, color: RS_ACCENT, body: 0x2b2f34 });
    holoTag(rangeStack, "instrument range", 0, 1.5, 0, { css: "#cf3fae", w: 0.36 });
    reg(hits, rangeKnob.userData.wheel, "range-dial");
    // The bypass button that skips the source check entirely.
    const skipBtn = box(rangeStack, 0.09, 0.03, 0.05, 0.13, 1.08, 0.11, 0xd2312b, { rough: 0.5 });
    decal(skipBtn, 0.08, 0.025, 0, 0.016, 0, signFace("SKIP CHECK", { bg: "#2a0c0c", accent: "#ffffff", scale: 0.5 }));
    holoTag(rangeStack, "skip the check?", 0.13, 1.26, 0.11, { css: "#d2312b", w: 0.4 });
    reg(hits, skipBtn, "skip-source-check");

    // Check source: a small shielded pig with its tolerance tag.
    const sourcePig = group(truck, 0.35, 0, 0.55, 0.5);
    cyl(sourcePig, 0.09, 0.1, 0.16, 0, 1.02, 0, 0xb8b0a0, { rough: 0.5, metal: 0.3, seg: 16 });
    cyl(sourcePig, 0.06, 0.06, 0.02, 0, 1.11, 0, 0x1b1e22, { rough: 0.6, seg: 14 });
    decal(sourcePig, 0.14, 0.06, 0, 1.02, 0.101, signFace("Cs-137 CHK", { bg: "#2a0c30", accent: "#cf3fae", scale: 0.5 }));
    holoTag(sourcePig, "check source", 0, 1.2, 0, { css: "#cf3fae", w: 0.32 });
    reg(hits, sourcePig, "check-source");

    // Dosimeter and coveralls, PPE on the tailgate.
    const dosim = group(truck, 0.55, 0, -0.15, 0.2);
    box(dosim, 0.05, 0.07, 0.015, 0, 1.02, 0, 0x22262b, { rough: 0.6 });
    decal(dosim, 0.045, 0.03, 0, 1.02, 0.009, signFace("DOSE", { bg: "#22262b", accent: "#cf3fae", scale: 0.5 }));
    holoTag(dosim, "dosimeter", 0, 1.1, 0, { css: "#cf3fae", w: 0.26 });
    reg(hits, dosim, "dosimeter");
    const coveralls = group(truck, 0.7, 0, -0.35, -0.3);
    box(coveralls, 0.22, 0.06, 0.16, 0, 1.0, 0, 0xe8e2d2, { rough: 0.85 });
    holoTag(coveralls, "coveralls", 0, 1.06, 0, { css: "#cf3fae", w: 0.28 });
    reg(hits, coveralls, "tyvek");

    // Radio, clipped to the tailgate rail.
    const radio = group(truck, -0.6, 0, -0.4, 0.4);
    box(radio, 0.06, 0.14, 0.04, 0, 1.03, 0, 0x22262b, { rough: 0.5, metal: 0.3 });
    cyl(radio, 0.006, 0.006, 0.1, 0, 1.15, 0, CITY.steel, { rough: 0.4, metal: 0.7, seg: 6 });
    holoTag(radio, "radio", 0, 1.24, 0, { css: "#cf3fae", w: 0.24 });
    reg(hits, radio, "radio");

    // Field notebook — the shortcut around the GPS logger.
    const notebook = group(truck, -0.35, 0, -0.42, 0.1);
    box(notebook, 0.16, 0.015, 0.2, 0, 1.0, 0, 0xe8e2d2, { rough: 0.85 });
    decal(notebook, 0.14, 0.16, 0, 1.009, 0, signFace("FIELD LOG", { bg: "#f3efe4", accent: "#1b1e22", scale: 0.42 })).rotation.x = -Math.PI / 2;
    holoTag(notebook, "log from memory?", 0, 1.16, 0, { css: "#d2312b", w: 0.42 });
    reg(hits, notebook, "log-from-memory");

    // GPS logger, mounted beside the notebook.
    const gpsLogger = instrument(truck, 0.05, 1.03, -0.42, { ry: 0.3, idle: "-- GPS", color: RS_ACCENT, w: 0.13, d: 0.19 });
    holoTag(gpsLogger, "GPS logger", 0, 0.16, 0, { css: "#cf3fae", w: 0.3 });
    reg(hits, gpsLogger, "gps-logger");

    // ---------------------------------------------------------------- bench
    const bench = group(g, 0.35, 0.14, 1.55, 0.35);
    box(bench, 1.1, 0.04, 0.5, 0, 0.7, 0, 0xb8b0a0, { rough: 0.7 });
    for (const sx of [-0.5, 0.5]) box(bench, 0.04, 0.7, 0.04, sx, 0.35, 0, 0x8a949d, { rough: 0.5, metal: 0.5 });
    const scoop = group(bench, -0.42, 0.72, 0.05);
    cyl(scoop, 0.03, 0.03, 0.02, 0, 0.02, 0, CITY.steel, { rough: 0.4, metal: 0.8, seg: 12 });
    box(scoop, 0.014, 0.22, 0.014, 0, 0.13, 0, 0x2f3740, { rough: 0.6 });
    holoTag(scoop, "sample scoop", 0, 0.28, 0, { css: "#cf3fae", w: 0.3 });
    reg(hits, scoop, "scoop");
    const jarSpecs = [["jar-primary", -0.1, 0x7fa7c9, "PRIMARY"], ["jar-split", 0.15, 0xe8eef2, "SPLIT"]];
    for (const [id, dx, color, label] of jarSpecs) {
      const j = group(bench, dx, 0.72, -0.05);
      cyl(j, 0.04, 0.04, 0.13, 0, 0.065, 0, color, { rough: 0.3, opacity: 0.85, transparent: true, seg: 14 });
      cyl(j, 0.022, 0.022, 0.03, 0, 0.145, 0, 0x1b1e22, { rough: 0.6, seg: 12 });
      decal(j, 0.07, 0.03, 0, 0.065, 0.041, signFace(label, { bg: "#ffffff", accent: "#1b1e22", scale: 0.55 }));
      reg(hits, j, id);
    }
    // The unlabeled jar, planted among the others for the final walk.
    const unlabeled = group(bench, 0.4, 0.72, 0.12);
    cyl(unlabeled, 0.036, 0.036, 0.12, 0, 0.06, 0, 0xd9cbb2, { rough: 0.3, opacity: 0.85, transparent: true, seg: 12 });
    cyl(unlabeled, 0.02, 0.02, 0.028, 0, 0.134, 0, 0x1b1e22, { rough: 0.6, seg: 10 });
    reg(hits, unlabeled, "unlabeled-jar");
    // The funnel that would let a hand pour the split back into the primary.
    const funnel = group(bench, 0.02, 0.85, -0.05, 0.4);
    cyl(funnel, 0.05, 0.015, 0.08, 0, 0, 0, CITY.steel, { rough: 0.35, metal: 0.7, seg: 14 });
    holoTag(funnel, "combine the split?", 0, 0.12, 0, { css: "#d2312b", w: 0.44 });
    reg(hits, funnel, "combine-split");
    const coc = group(bench, -0.15, 0.72, 0.15, -0.3);
    box(coc, 0.18, 0.005, 0.24, 0, 0, 0, 0xf3efe4, { rough: 0.9 });
    decal(coc, 0.16, 0.22, 0, 0.004, 0, signFace("CHAIN OF CUSTODY", { bg: "#f3efe4", accent: "#1b1e22", scale: 0.4 })).rotation.x = -Math.PI / 2;
    reg(hits, coc, "coc-form");

    // ------------------------------------------------------------- yard
    cone(g, -1.9, 1.7, { color: RS_ACCENT }); cone(g, 1.4, -0.6, { color: RS_ACCENT });
    toolChest(g, -1.7, 1.0, { ry: 0.5, color: 0x8a3f8f });
    const fog = particles(g, 40, 0xbfc6cc, { size: 0.06, life: 2.0, additive: false, opacity: 0.18 });
    standingFigure(g, 1.7, -0.05, { ry: 2.2, cloth: 0x5a3f6f, helmet: 0xe4dc3a, vest: 0xf2c14b });

    // -------------------------------------------------------------- live state
    let stakeDown = false, encroaching = false;

    return {
      hits,
      spawnLook: new THREE.Vector3(0, 1.1, -0.3),
      onStep() {},
      onStepComplete(step) {
        if (step.id === "source-check-am") repaint(bg.userData.screen, signFace("READY", { bg: "#1c0a1a", accent: "#59c97b", fg: "#f2dcee", scale: 0.55 }));
        if (step.id === "walkover") { hotspot.visible = true; }
        if (step.id === "static-count") repaint(detector.userData.screen, signFace("IL EXCEEDED", { bg: "#2a0c30", accent: "#d2312b", fg: "#f2dcee", scale: 0.42 }));
        if (step.id === "flag-place") { flagMarker.parent.remove(flagMarker); hotspotSocket.add(flagMarker); flagMarker.position.set(0, 0.02, 0); flagMarker.rotation.set(0, 0, 0); }
        if (step.id === "gps-log") repaint(gpsLogger.userData.screen, signFace("LOGGED", { bg: "#1c0a1a", accent: "#59c97b", fg: "#f2dcee", scale: 0.55 }));
        if (step.id === "split") { unlabeled.visible = true; }
        if (step.id === "final-walk") { unlabeled.visible = false; }
      },
      onInterrupt(it) {
        if (it.id === "stake-down") {
          stakeDown = true;
          const s = stakeMeshes["stake-2"];
          s.grp.rotation.x = Math.PI / 2.4;
          s.grp.position.y = 0.02;
        }
        if (it.id === "encroach") {
          encroaching = true;
          grader.position.set(0.6, 0.14, -1.1);
        }
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "stake-down") {
          stakeDown = false;
          const s = stakeMeshes["stake-2"];
          s.grp.rotation.x = 0;
          s.grp.position.y = 0.14;
        }
        if (it.id === "encroach") {
          encroaching = false;
          grader.position.set(2.1, 0.14, -2.6);
        }
      },
      onHazard() {},
      animate(t, dt, session) {
        void stakeDown; void encroaching;
        fog.visible = true; fog.userData.step(dt, new THREE.Vector3(0, 0.6, 0), 0.03, 1.4, 0.1);
        const gg = session?.gauge;
        if (gg && !gg.committed && session.step?.id === "background") {
          repaint(bg.userData.screen, signFace(`${(6 + gg.t * 10).toFixed(1)} µR/h`, {
            bg: "#1c0a1a", accent: gg.t >= 0.42 && gg.t <= 0.58 ? "#59c97b" : "#f2ae14", fg: "#f2dcee", scale: 0.55,
          }));
        }
        if (session?.track && session.step?.id === "walkover") {
          const v = session.track.v;
          repaint(detector.userData.screen, signFace(v < 0.4 ? "TOO FAST" : v > 0.6 ? "TOO SLOW" : "ON SPEED", {
            bg: "#1c0a1a", accent: v >= 0.4 && v <= 0.6 ? "#59c97b" : "#f2ae14", fg: "#f2dcee", scale: 0.48,
          }));
        }
        if (session?.step?.id === "range" && session.turn) {
          rangeKnob.userData.wheel.rotation.z = session.turn.amount * Math.PI * 2;
        }
      },
    };
  },
};
