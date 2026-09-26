import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, ball, torus, slab, group, decal, repaint, signFace, mat,
} from "../../../shared/kit.js";
import {
  stationPad, holoPanel, holoTag, toolChest, cone, instrument, standingFigure,
  surfaceTexture, texturedMat, pavingFace, reg,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Roadway Worker Protection & Job Briefing VR — Mobility & Transit.
//
// The on-track safety plan that has to exist before any tool touches a
// crosstie: the briefing everyone signs onto, the working limits the
// dispatcher grants and can take back, the watchman posted with a sighting
// distance worked back from the timetable's authorized speed, and the same
// limits handed back the moment the work is done. Generic freight territory,
// no real railroad, milepost or timetable named.

const RA_RWP_ACCENT = 0xe0862c;
const RA_RWP_CSS = "#e0862c";

export const SIM_RA_ROADWAY_WORKER_PROTECTION_AND_JOB_BRIEFING = {
  id: "ra-roadway-worker-protection-and-job-briefing",
  index: "422",
  domain: "Track",
  trade: "Roadway worker / track inspector",
  category: "Mobility & Transit",
  weather: "overcast",
  certification: "BMWED roadway worker qualification under FRA 49 CFR Part 214 on-track safety, read against the territory's own FRA 49 CFR Part 213 track safety standards; working limits are requested from and released back to the train dispatcher, whose authority is the only thing that keeps a BLET engineer or a SMART-TD conductor on an approaching train from running through this worksite",
  name: "Roadway Worker Protection & Job Briefing",
  title: simTitle("Roadway Worker Protection & Job Briefing"),
  tagline: "The briefing signed, the limits requested and read back, the watchman posted at a sighting distance worked from the timetable speed, the work done inside the limits, and every piece of it handed back before anyone walks away",
  accent: RA_RWP_ACCENT,
  accentCss: RA_RWP_CSS,
  parSeconds: 300,
  footprint: 2.3,
  supportLine: "your roadmaster or your BMWED local if a close call on the gang is still sitting with you after shift",
  badge: { id: "limits-closed-clean", name: "Limits Closed Clean", note: "Working limits requested, worked inside and handed back with nothing skipped and nobody left out of the count" },

  game: system({
    name: "On-Track Authority",
    currency: "LIMIT",
    ranks: ["Trackman", "Qualified Roadway Worker", "Watchman", "Person In Charge", "On-Track Safety Certified"],
    badges: [
      { id: "never-fouled", name: "Never Fouled", note: "Never once inside the fouling zone or past the limits unprotected", test: AWARD.safe },
      { id: "sighting-true", name: "Sighting True", note: "Sighting distance, gauge reading and every measurement near band centre", test: AWARD.precise(0.72) },
      { id: "briefing-clean", name: "Clean Briefing", note: "Briefing, limits and handback all worked with no correction", test: AWARD.all(AWARD.stepClean("briefing"), AWARD.stepClean("release-limits")) },
    ],
    challenges: [
      { id: "gang-time", name: "Gang Time", note: "Complete inside 80% of par", test: AWARD.fast(0.8) },
      { id: "first-limits", name: "First Limits", note: "Clean run, no corrections", test: AWARD.clean },
      { id: "ten-clear", name: "Ten Clear", note: "Ten correct actions in a row", test: AWARD.streak(10) },
    ],
  }),

  hazards: {
    "fouling-point": "You are standing inside the clearance point of the adjacent track. Your working limits protect the track you are assigned to and nothing else — a movement on that other track is running under its own authority, with no reason to expect anybody standing this close to it.",
    "shortcut-crossing": "You cut across the rails at a spot with no crossing and no sighting either way. A hurried step across ballast and two rails takes longer than it feels like it does, and it is exactly the moment a person is looking at their feet instead of down the track.",
    "beyond-limits": "You kept working past the far limit board. Everything on the other side of that board is track the dispatcher has not given you — it is still open to a movement running on its own authority, and nobody out there has any reason to expect you.",
    "out-of-sight-worker": "One of the gang has drifted around the curve, past where the watchman's sighting distance actually reaches. A watchman can only warn what they can see, and past that curve this worker is, for every practical purpose, working with no protection at all.",
  },

  lateNotes: {
    "defect-gauge": "The defect gets measured and logged before anything is done about it — a repair without a reading is a repair nobody can check.",
    "warning-flag": "The flag goes up once the defect is actually found and confirmed, not before.",
    "left-wrench": "Nothing gets tallied against the closing count until the walk is actually done.",
  },

  // Interruptions: see shared/game.js. Both are armed on a continuous task —
  // the horn test and the visual sweep — because that is exactly when a real
  // crew's attention is genuinely split between the job in their hands and
  // the track around them.
  interrupts: [
    {
      id: "unauthorized-entry",
      kind: "Unreported vehicle on the right-of-way",
      after: "horn-test", delay: 4, seconds: 12,
      alert: "A pickup has turned off the access road and is driving down the ballast shoulder toward your limits. Nobody called it in.",
      cue: "Something is inside your worksite that never asked the dispatcher for anything.",
      target: "radio-handset",
      why: "Working limits are authority against train movements; they say nothing to a vehicle that never checked in with anyone, and the dispatcher is the only person in this picture who can reach that driver and every train crew at once. The radio goes up first because it is the fastest way to get that vehicle stopped and everyone else warned — walking toward it on foot leaves the gang exactly as exposed for exactly as long as the walk takes.",
      missNote: "You went to wave the truck off yourself. It kept coming — a driver on a haul road is watching the road, not a hand signal from someone standing in ballast — and the only thing that would have stopped it in time was already in your hand.",
      wrongNote: "That will not stop a vehicle that never called in. The radio is what reaches the dispatcher, and the dispatcher is what reaches that driver.",
    },
    {
      id: "watchman-distracted",
      kind: "Protection lapsed",
      after: "vigilance", delay: 4, seconds: 11,
      alert: "Your watchman has put the radio to their ear and turned away from the line to take a call.",
      cue: "The one person watching the track for you has stopped watching it.",
      target: "post-watchman",
      why: "A watchman is not a formality standing near the job — the sighting distance you measured earlier is worked back from the timetable's authorized speed for exactly one purpose: enough warning time for the gang to clear before a movement arrives, and every second of that warning assumes somebody is actually looking. The moment the watching stops, the work stops with it, because you have no other way to know a movement is coming.",
      missNote: "You kept working with the watchman turned away and the radio to their ear. For as long as that lasted, the gang's whole protection was a sighting distance nobody was using — the horn tells you a train is coming only if somebody is watching for it to sound.",
      wrongNote: "That does not get your watchman back on the line. Go get their attention back on the track.",
    },
  ],

  steps: [
    {
      id: "briefing", kind: "select", target: "briefing-board",
      title: "Attend the job briefing",
      cue: "Read the work order: what track, what limits will be requested, and who is watchman.",
      why: "Under FRA roadway worker protection rules every person on the gang works from the same plan, and a worker who missed the briefing has no way of knowing where the protection actually starts and ends — nor does the rest of the gang have any way of knowing that they do not know.",
    },
    {
      id: "roster", kind: "select", target: "roster-clipboard",
      title: "Sign the briefing roster",
      cue: "Sign in your own name to show you heard the plan.",
      why: "The roster is the only record that this exact plan — this track, these limits, this watchman — was actually read out to this exact gang on this exact day. A verbal briefing nobody signed onto is a briefing that cannot be checked afterward by anyone, including the person in charge.",
    },
    {
      id: "protection-plan", kind: "sequence",
      targets: ["radio-handset", "post-watchman"],
      itemNames: { "radio-handset": "request working limits from the dispatcher", "post-watchman": "post the watchman" },
      title: "Set the on-track safety plan",
      cue: "Request the working limits first, then post the watchman inside them.",
      why: "The limits have to exist before the watchman is posted inside them — a watchman standing guard over track the dispatcher has not actually granted is protecting a worksite that, as far as the signal and train dispatching system is concerned, is still open to ordinary traffic.",
      outOfOrderNote: "Wrong order — the limits have to exist first. A watchman posted before the dispatcher grants anything is guarding track that is, as far as the signal system knows, still open.",
    },
    {
      id: "sighting", kind: "gauge", target: "sighting-scope",
      title: "Calculate the sighting distance",
      cue: "Sight the scope down the approach and commit once it reads the distance this territory's timetable speed requires.",
      why: "Sighting distance is worked back from how far a train at this territory's authorized speed travels while the gang hears the horn, stands up, and clears the track — it is not a fixed number and not a guess made by eye. Too short a sighting distance is protection that only looks like protection.",
      gauge: {
        label: "SIGHTING DISTANCE", speed: 0.66, green: [0.58, 0.78],
        readout: (t) => `${Math.round(400 + t * 900)} m`,
        missNote: "Short of what the timetable speed on this territory needs. Move the watchman back until the scope reads far enough.",
      },
    },
    {
      id: "limits-sign", kind: "turn", target: "limits-sign",
      title: "Swing the limit board into place",
      cue: "Turn the near limit board face-on to the approach so an oncoming crew can actually read it.",
      why: "A limit board edge-on to the track is a board nobody moving toward it can read in time. It has to be square to the approach, because the whole point of it is being seen from a moving train long before anyone reaches it on foot.",
      turn: { turns: 0.25, axis: "y", label: "LIMIT BOARD" },
    },
    {
      id: "horn-test", kind: "hold", target: "horn-test-button", seconds: 5,
      title: "Test the watchman's warning horn",
      cue: "Sound the horn and hold until every member of the gang has raised a hand to confirm they heard it.",
      why: "A horn nobody has actually heard tested is a horn the gang is trusting on faith, and the one time that matters is the one time it fails. Testing it now, with everybody still able to answer, is the only way to know the warning will actually reach them once tools are in their hands and ears are under hearing protection.",
      holdBreakNote: "You let go before every hand went up. A horn you have not confirmed everyone can hear is not a warning system, it is a noise you assume works.",
    },
    {
      id: "repair-carry", kind: "drag", target: "track-tool",
      title: "Carry the tool to the defect",
      cue: "Carry the rail gauge tool from the cart to the low joint marked on the work order.",
      why: "The defect was flagged on a prior inspection and the tool has to reach it before anything can be measured or fixed — carried across and set down at the joint itself, not left at the cart where it does nobody any good.",
      drag: { to: "defect-site", radius: 0.32, missNote: "Not set down at the joint — carry it the rest of the way to the low rail." },
    },
    {
      id: "defect-check", kind: "gauge", target: "defect-gauge",
      title: "Measure the defect",
      cue: "Set the gauge across the low joint and commit the reading.",
      why: "A joint that has dropped gets measured, logged and compared against the tolerance this class of track is held to before any decision is made about it — a repair without a reading behind it is a guess nobody can check against what the joint actually did next.",
      gauge: {
        label: "JOINT DIP", speed: 0.7, green: [0.0, 0.22],
        readout: (t) => `${Math.round(t * 30)} mm`,
        missNote: "Outside tolerance for this class of track. Log the defect and flag it before moving on.",
      },
    },
    {
      id: "vigilance", kind: "track", target: "scan-dial", seconds: 6,
      title: "Keep the visual sweep going while you work",
      cue: "Hold your own sweep of both directions in the green band while you finish logging the defect.",
      why: "A watchman's protection does not excuse the rest of the gang from their own awareness — hands on a clipboard and eyes on the page is exactly the posture that misses the one thing a lookout might already be shouting about. The sweep is a habit worked at the same time as the paperwork, not instead of it.",
      track: { label: "SWEEP", green: [0.34, 0.62], rise: 0.5, fall: 0.42, drift: 0.14, readout: (v) => `${Math.round(v * 100)}%` },
      holdBreakNote: "The sweep dropped out of band. Eyes down on the clipboard for too long is exactly the posture a lookout's warning is meant to interrupt, not replace.",
    },
    {
      id: "flag-defect", kind: "select", target: "warning-flag",
      title: "Flag the joint for follow-up",
      cue: "Set the warning flag at the joint now that it is measured and logged.",
      why: "A defect this gang does not have the parts or the time to finish today still has to be visible to the next train and the next gang — a flag at the joint is the only thing standing between a defect on a clipboard and a defect somebody driving past can actually see.",
    },
    {
      id: "walk", kind: "find", noHint: true,
      targets: ["left-wrench", "open-toolbox"],
      itemNames: { "left-wrench": "wrench left on the ballast", "open-toolbox": "toolbox left open on the shoulder" },
      itemNotes: {
        "left-wrench": "Caught before the tally closed — a wrench in the four foot is exactly the foreign object the walk exists to catch.",
        "open-toolbox": "An open lid catches wind and rain both; closed and latched before it is left for the next gang.",
      },
      title: "Walk the worksite before you leave it",
      cue: "Scan the worksite and clear anything that didn't make it back into the cart.",
      why: "Nobody else is walking this stretch tonight. A tool or an open case left on the shoulder is a foreign object under the next train or a piece of kit that walks off in the weather, and the only thing that catches it is somebody actually looking before the limits are given up.",
    },
    {
      id: "muster", kind: "select", target: "muster-tally",
      title: "Take the headcount",
      cue: "Count the gang against the roster before the limits come back.",
      why: "The limits do not go back to the dispatcher until every name on the roster is accounted for standing clear of the track — a headcount is the one check that catches a gang member still working, still crossing, or simply not where anyone thought they were.",
    },
    {
      id: "release-limits", kind: "hold", target: "radio-handset", seconds: 4,
      title: "Release the working limits",
      cue: "Call the dispatcher and hold the radio for the read-back giving the limits up.",
      why: "The track stays under your protection until the dispatcher has heard you give it up and read it back — walking away without that call is how a set of limits never actually closes, and the next crew that needs that track has no way to know it is clear.",
      holdBreakNote: "You let go before the read-back came back. Limits are not released until the dispatcher has said so in your own hearing.",
    },
    {
      id: "close-log", kind: "select", target: "closing-log",
      title: "Close the job briefing",
      cue: "Log the defect, the flag left standing and the time the limits closed.",
      why: "The next gang, and the roadmaster after them, only know what this closing entry tells them — the flagged joint, what was and was not fixed, and the exact minute the track went back to normal authority. An unclosed log is a job that, on paper, never actually finished.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.3, RA_RWP_ACCENT);

    // ------------------------------------------------------------- textures
    const ballastTex = surfaceTexture((cx, w, h) => {
      const grad = cx.createLinearGradient(0, 0, 0, h);
      grad.addColorStop(0, "#59544c"); grad.addColorStop(1, "#3d3a34");
      cx.fillStyle = grad; cx.fillRect(0, 0, w, h);
      for (let i = 0; i < 900; i++) {
        const x = (i * 53.7) % w, y = (i * 91.3) % h, r = 1.4 + ((i * 17) % 5) * 0.5;
        cx.fillStyle = i % 4 === 0 ? "rgba(150,140,122,0.55)" : "rgba(30,26,20,0.45)";
        cx.beginPath(); cx.ellipse(x, y, r, r * 0.7, (i % 6) * 0.5, 0, 7); cx.fill();
      }
    }, { repeat: 6 });
    const ballastMat = texturedMat(ballastTex, { rough: 0.96, color: 0x8f887c });

    const tieTex = surfaceTexture((cx, w, h) => {
      const grad = cx.createLinearGradient(0, 0, w, 0);
      grad.addColorStop(0, "#3a2c20"); grad.addColorStop(0.5, "#2c2117"); grad.addColorStop(1, "#382a1e");
      cx.fillStyle = grad; cx.fillRect(0, 0, w, h);
      cx.strokeStyle = "rgba(0,0,0,0.35)"; cx.lineWidth = 2;
      for (let i = 0; i < 10; i++) { cx.beginPath(); cx.moveTo(0, (i / 10) * h + 4); cx.bezierCurveTo(w * 0.3, (i / 10) * h - 3, w * 0.7, (i / 10) * h + 6, w, (i / 10) * h); cx.stroke(); }
    }, { repeat: 1 });
    const tieMat = texturedMat(tieTex, { rough: 0.9, color: 0x8a7a68 });

    const railTex = surfaceTexture((cx, w, h) => {
      const grad = cx.createLinearGradient(0, 0, 0, h);
      grad.addColorStop(0, "#c7ccd1"); grad.addColorStop(0.5, "#8a9096"); grad.addColorStop(1, "#5b6167");
      cx.fillStyle = grad; cx.fillRect(0, 0, w, h);
      cx.fillStyle = "rgba(120,70,40,0.18)";
      for (let i = 0; i < 30; i++) cx.fillRect((i * 37) % w, 0, 2, h);
    }, { repeat: 3 });
    const railMat = texturedMat(railTex, { rough: 0.32, metal: 0.75, color: 0xaab0b6 });

    const platformTex = surfaceTexture((cx, w, h) => pavingFace(cx, w, h, {
      tiles: 3, base: "#565a4c", base2: "#484c3e", seam: "rgba(0,0,0,0.5)",
    }), { repeat: 3 });
    const platformMat = texturedMat(platformTex, { rough: 0.9, color: 0xb9c4a4 });

    const shedTex = surfaceTexture((cx, w, h) => {
      cx.fillStyle = "#5b4322"; cx.fillRect(0, 0, w, h);
      for (let i = 0; i < 16; i++) {
        cx.fillStyle = i % 2 ? "rgba(0,0,0,0.22)" : "rgba(255,255,255,0.1)";
        cx.fillRect((i / 16) * w, 0, w / 32, h);
      }
    }, { repeat: 2 });
    const shedMat = texturedMat(shedTex, { rough: 0.75, metal: 0.35, color: 0xc98b3a });

    // ------------------------------------------------------------- the track
    const ballast = box(g, 5.2, 0.16, 1.6, 0, 0.08, 0, 0x8f887c, { rough: 0.98 });
    ballast.material = ballastMat;
    for (const sx of [-1, 1]) {
      const rail = box(g, 5.2, 0.1, 0.06, 0, 0.21, sx * 0.36, 0xaab0b6, { rough: 0.32, metal: 0.75 });
      rail.material = railMat;
    }
    for (let i = -9; i <= 9; i++) {
      const tie = box(g, 0.16, 0.06, 0.9, i * 0.28, 0.11, 0, 0x8a7a68, { rough: 0.9 });
      tie.material = tieMat;
    }

    // Crew standing platform beside the track.
    const platform = box(g, 1.6, 0.1, 1.0, -2.1, 0.05, 1.3, 0xb9c4a4, { rough: 0.9 });
    platform.material = platformMat;
    for (let i = -3; i <= 3; i++) box(g, 0.06, 0.006, 1.0, -2.1 + i * 0.24, 0.101, 1.3, 0xf2c14b, { emissive: 0xf2c14b, ei: 0.3, cast: false });

    // Fouling point / clearance zone against the far side of the track.
    reg(hits, box(g, 1.0, 1.6, 1.6, -3.6, 0.8, 0, 0x000000, { opacity: 0.001, transparent: true, cast: false }), "beyond-limits");
    reg(hits, box(g, 0.9, 1.8, 0.9, 1.0, 0.9, -1.3, 0x000000, { opacity: 0.001, transparent: true, cast: false }), "fouling-point");
    reg(hits, box(g, 1.0, 1.6, 0.9, -3.3, 0.8, -0.3, 0x000000, { opacity: 0.001, transparent: true, cast: false }), "shortcut-crossing");

    // ------------------------------------------------------------- MOW shed
    const shed = group(g, 2.9, 0, 1.6, -0.4);
    const shedWall = box(shed, 1.1, 1.5, 0.9, 0, 0.75, 0, 0xc98b3a, { rough: 0.75, metal: 0.35 });
    shedWall.material = shedMat;
    box(shed, 1.2, 0.14, 1.0, 0, 1.57, 0, 0x3a3a3a, { rough: 0.6 });
    decal(shed, 0.7, 0.16, 0, 1.2, 0.46, signFace("MOW STORAGE", { bg: "#1b1e22", accent: RA_RWP_CSS, fg: "#ffe2b8", scale: 0.4 }), { px: 192 });

    // ------------------------------------------------------------- briefing
    const briefingBoard = holoPanel(g, 0.62, 0.44, -2.6, 1.55, 1.5, (cx, w, h) => {
      cx.fillStyle = "rgba(6,16,22,0.9)"; cx.fillRect(0, 0, w, h);
      cx.fillStyle = RA_RWP_CSS; cx.fillRect(0, 0, w, 5);
      cx.fillStyle = "#c4b39a";
      cx.font = `600 ${Math.round(h * 0.085)}px 'Barlow Condensed', Arial, sans-serif`;
      cx.textAlign = "left"; cx.textBaseline = "middle";
      cx.fillText("JOB BRIEFING · GANG 4", w * 0.06, h * 0.14);
      cx.fillStyle = "#f2e9d8";
      cx.font = `600 ${Math.round(h * 0.13)}px 'Barlow Condensed', Arial, sans-serif`;
      cx.fillText("LOW JOINT — TRACK 1", w * 0.06, h * 0.32);
      cx.font = `${Math.round(h * 0.08)}px Arial, sans-serif`;
      cx.fillStyle = "#d8cdb8";
      ["On-track safety: working limits, watchman", "Sighting distance: per the timetable",
       "Track class tolerance: per the standard", "Watchman: assigned at briefing"]
        .forEach((line, i) => cx.fillText(line, w * 0.06, h * (0.5 + i * 0.11)));
    }, { ry: 0.6, accent: RA_RWP_ACCENT });
    reg(hits, briefingBoard, "briefing-board");

    const clipboard = group(g, -1.9, 0, 1.7, -0.3);
    slab(clipboard, 0.32, 0.42, 0.03, 0, 0.9, 0, 0xd9d3c4, { rough: 0.6 });
    box(clipboard, 0.06, 0.04, 0.02, 0, 1.12, 0.02, 0x50575e, { rough: 0.5, metal: 0.5 });
    holoTag(clipboard, "Briefing roster", 0, 1.2, 0, { css: RA_RWP_CSS, w: 0.3 });
    reg(hits, clipboard, "roster-clipboard");

    // ------------------------------------------------------------- radio & dispatcher
    const radio = group(g, -1.5, 0, 2.2, -0.3);
    slab(radio, 0.5, 0.16, 0.16, 0, 0.85, 0, 0x2b3138, { radius: 0.02, rough: 0.5 });
    const radioScreen = decal(radio, 0.4, 0.1, 0, 0.87, 0.09,
      signFace("STANDBY", { bg: "#0d1c24", accent: RA_RWP_CSS, fg: "#ffd9b0", scale: 0.5 }), { glow: true, ei: 0.85, px: 256 });
    holoTag(radio, "Dispatcher line", 0, 1.05, 0.08, { css: RA_RWP_CSS, w: 0.32 });
    reg(hits, radio, "radio-handset");

    // ------------------------------------------------------------- limit board
    const limitBoard = group(g, 3.6, 0, -0.6);
    cyl(limitBoard, 0.025, 0.03, 1.0, 0, 0.5, 0, 0xf2c14b, { rough: 0.5, seg: 10 });
    const limitFace = decal(limitBoard, 0.32, 0.24, 0, 1.05, 0.01, signFace("LIMIT OF\nAUTHORITY", { bg: "#f2c14b", fg: "#1b1e22", scale: 0.3 }), { px: 256 });
    reg(hits, limitBoard, "limits-sign");

    const farBoard = group(g, -3.6, 0, -0.6, 3.14);
    cyl(farBoard, 0.025, 0.03, 1.0, 0, 0.5, 0, 0xf2c14b, { rough: 0.5, seg: 10 });
    decal(farBoard, 0.32, 0.24, 0, 1.05, 0.01, signFace("LIMIT OF\nAUTHORITY", { bg: "#f2c14b", fg: "#1b1e22", scale: 0.3 }), { px: 256 });

    // ------------------------------------------------------------- watchman & horn
    const watchman = standingFigure(g, 3.3, -2.2, { ry: -2.0, cloth: 0x2b3138, vest: 0xf2c14b, helmet: 0xf2f2f2 });
    holoTag(watchman, "Watchman", 0, 1.95, 0.15, { css: RA_RWP_CSS, w: 0.24 });
    reg(hits, watchman, "post-watchman");

    const horn = group(g, 2.3, 0, -1.4, -0.5);
    cyl(horn, 0.04, 0.05, 0.4, 0, 0.4, 0, 0xd8dce0, { rough: 0.5, metal: 0.6, seg: 10 });
    const hornBell = cyl(horn, 0.09, 0.03, 0.14, 0, 0.62, 0, 0xf2c14b, { rough: 0.55, metal: 0.5, seg: 12 });
    holoTag(horn, "Warning horn", 0, 0.78, 0, { css: RA_RWP_CSS, w: 0.28 });
    reg(hits, hornBell, "horn-test-button");

    // Out of sight worker, round the curve, past the sighting line — trap.
    const strayWorker = standingFigure(g, -4.5, -0.35, { ry: 1.4, cloth: 0x2b3138, vest: 0xf2c14b, helmet: 0xf2f2f2 });
    reg(hits, strayWorker, "out-of-sight-worker");

    // ------------------------------------------------------------- sighting scope
    const scope = group(g, 2.4, 0, 1.9, -0.5);
    cyl(scope, 0.03, 0.04, 0.8, 0, 0.4, 0, 0x50575e, { rough: 0.5, metal: 0.5, seg: 10 });
    const scopeBody = cyl(scope, 0.05, 0.05, 0.26, 0, 0.85, 0, 0x2b3138, { rough: 0.5, metal: 0.4, seg: 12 });
    scopeBody.rotation.z = Math.PI / 2;
    const scopeReadout = decal(scope, 0.2, 0.08, 0, 0.85, 0.14, signFace("--- m", { bg: "#0d1c24", accent: RA_RWP_CSS, scale: 0.5 }), { px: 192, glow: true, ei: 0.7 });
    holoTag(scope, "Sighting scope", 0, 1.02, 0, { css: RA_RWP_CSS, w: 0.3 });
    reg(hits, scope, "sighting-scope");

    // ------------------------------------------------------------- tool cart & defect
    const chest = toolChest(g, -0.6, 1.9, { ry: -2.4, color: RA_RWP_ACCENT });
    const trackTool = group(chest, 0.05, 0.79, 0, 0.3);
    box(trackTool, 0.22, 0.03, 0.03, 0, 0, 0, 0xdfe4e8, { rough: 0.4, metal: 0.5 });
    holoTag(trackTool, "Rail gauge", 0, 0.1, 0, { css: RA_RWP_CSS, w: 0.28 });
    reg(hits, trackTool, "track-tool");

    const defect = group(g, 0.6, 0.13, 0.32);
    box(defect, 0.06, 0.02, 0.03, 0, 0, 0, 0x8a5a3a, { rough: 0.7 });
    const defectSeat = box(defect, 0.3, 0.3, 0.3, 0, 0.15, 0, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    hits["defect-site"] = defectSeat;
    const defectReadout = decal(defect, 0.14, 0.06, 0, 0.14, 0, signFace("-- mm", { bg: "#0d1c24", accent: RA_RWP_CSS, scale: 0.5 }), { px: 160, glow: true, ei: 0.6 });
    holoTag(defect, "Low joint", 0, 0.24, 0, { css: "#f0645b", w: 0.28 });
    reg(hits, defect, "defect-gauge");

    const flag = group(g, 0.6, 0, 0.5, 0.4);
    cyl(flag, 0.012, 0.014, 0.5, 0, 0.25, 0, 0xb0b7bd, { rough: 0.5, metal: 0.6, seg: 8 });
    const flagCloth = box(flag, 0.16, 0.1, 0.01, 0.09, 0.46, 0, 0xf0645b, { rough: 0.8 });
    flagCloth.visible = false;
    holoTag(flag, "Warning flag", 0, 0.58, 0, { css: "#f0645b", w: 0.28 });
    reg(hits, flag, "warning-flag");

    // Vigilance / awareness dial the learner tracks while logging the defect.
    const scanDial = instrument(g, 0.15, 0.86, 0.6, { ry: -0.4, idle: "SWEEP", color: RA_RWP_ACCENT });
    holoTag(scanDial, "Awareness sweep", 0, 0.15, 0, { css: RA_RWP_CSS, w: 0.3 });
    reg(hits, scanDial, "scan-dial");

    // Walk-round finds.
    const leftWrench = group(g, 1.5, 0.13, -0.2, 0.4);
    box(leftWrench, 0.16, 0.018, 0.03, 0, 0, 0, 0x53585e, { rough: 0.45, metal: 0.6 });
    cyl(leftWrench, 0.024, 0.024, 0.018, -0.075, 0, 0, 0xdfe4e8, { rough: 0.4, metal: 0.5, seg: 10 }).rotation.z = Math.PI / 2;
    reg(hits, leftWrench, "left-wrench");

    const openBox = group(g, -0.9, 0, 2.1);
    box(openBox, 0.3, 0.16, 0.2, 0, 0.08, 0, 0x3a4048, { rough: 0.8, metal: 0.3 });
    const boxLid = box(openBox, 0.3, 0.02, 0.2, 0, 0.2, -0.1, 0x3a4048, { rough: 0.8, metal: 0.3 });
    boxLid.rotation.x = -0.9;
    reg(hits, openBox, "open-toolbox");

    // ------------------------------------------------------------- muster & close
    const tally = holoPanel(g, 0.4, 0.26, -1.6, 1.35, 2.3, (cx, w, h) => {
      cx.fillStyle = "rgba(6,16,22,0.9)"; cx.fillRect(0, 0, w, h);
      cx.fillStyle = RA_RWP_CSS; cx.fillRect(0, 0, w, 5);
      cx.fillStyle = "#f2e9d8";
      cx.font = `600 ${Math.round(h * 0.2)}px 'Barlow Condensed', Arial, sans-serif`;
      cx.textAlign = "center"; cx.textBaseline = "middle";
      cx.fillText("GANG TALLY", w / 2, h * 0.34);
      cx.font = `${Math.round(h * 0.12)}px Arial, sans-serif`;
      cx.fillStyle = "#d8cdb8";
      cx.fillText("Count every name against the roster", w / 2, h * 0.66);
    }, { ry: 0.6, accent: RA_RWP_ACCENT });
    reg(hits, tally, "muster-tally");

    const closeLog = group(g, -2.4, 0, 2.4, -0.4);
    slab(closeLog, 0.4, 0.05, 0.3, 0, 0.86, 0, 0x2b3138, { radius: 0.02, rough: 0.5 });
    const closeScreen = decal(closeLog, 0.32, 0.16, 0, 0.89, 0.0, signFace("OPEN", { bg: "#0d1c24", accent: RA_RWP_CSS, fg: "#ffd9b0", scale: 0.4 }), { glow: true, ei: 0.8, px: 220 });
    closeScreen.rotation.x = -Math.PI / 2;
    holoTag(closeLog, "Closing log", 0, 1.0, 0, { css: RA_RWP_CSS, w: 0.3 });
    reg(hits, closeLog, "closing-log");

    cone(g, -2.5, 1.0, { color: RA_RWP_ACCENT });
    cone(g, 2.5, 1.0, { color: RA_RWP_ACCENT });

    // The unreported pickup, hidden until the interrupt drives it into view.
    const intruderTruck = group(g, 4.6, 0, 1.4, -2.0);
    box(intruderTruck, 0.42, 0.24, 0.9, 0, 0.24, 0, 0xb0453f, { rough: 0.6, metal: 0.3 });
    box(intruderTruck, 0.34, 0.2, 0.4, 0, 0.42, -0.15, 0x8b2f28, { rough: 0.6, metal: 0.3 });
    intruderTruck.visible = false;

    return {
      hits,
      footprint: 2.3,

      onInterrupt(it) {
        if (it.id === "unauthorized-entry") {
          intruderTruck.visible = true;
          repaint(radioScreen, signFace("VEHICLE\nON ROW", { bg: "#2a1416", accent: "#f0645b", fg: "#ffd2ce", scale: 0.3 }));
        }
        if (it.id === "watchman-distracted") { watchman.rotation.y = 1.1; watchman.position.x = 3.65; }
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "unauthorized-entry") {
          intruderTruck.visible = false;
          repaint(radioScreen, signFace("VEHICLE\nSTOPPED", { bg: "#0d1c14", accent: "#59c97b", fg: "#bff7d4", scale: 0.3 }));
        }
        if (it.id === "watchman-distracted") { watchman.rotation.y = -2.0; watchman.position.x = 3.3; }
      },

      onStepComplete(step) {
        if (step.id === "protection-plan") repaint(radioScreen, signFace("LIMITS\nGRANTED", { bg: "#0d1c14", accent: "#59c97b", fg: "#bff7d4", scale: 0.3 }));
        if (step.id === "sighting") repaint(scopeReadout, signFace("820 m", { bg: "#0d1c24", accent: "#59c97b", scale: 0.5 }));
        if (step.id === "limits-sign") limitBoard.rotation.y = Math.PI / 2;
        if (step.id === "horn-test") hornBell.material = mat(0x59c97b, { rough: 0.5, metal: 0.5 });
        if (step.id === "repair-carry") { trackTool.position.set(0, 0.15, 0); trackTool.rotation.set(0, 0, 0); defect.add(trackTool); }
        if (step.id === "defect-check") repaint(defectReadout, signFace("22 mm", { bg: "#0d1c24", accent: "#f0645b", scale: 0.5 }));
        if (step.id === "flag-defect") flagCloth.visible = true;
        if (step.id === "walk") { leftWrench.visible = false; boxLid.rotation.x = -1.57; }
        if (step.id === "muster") repaint(tally.userData.face, (cx, w, h) => {
          cx.fillStyle = "rgba(6,16,22,0.9)"; cx.fillRect(0, 0, w, h);
          cx.fillStyle = "#59c97b"; cx.fillRect(0, 0, w, 5);
          cx.fillStyle = "#f2e9d8";
          cx.font = `600 ${Math.round(h * 0.2)}px 'Barlow Condensed', Arial, sans-serif`;
          cx.textAlign = "center"; cx.textBaseline = "middle";
          cx.fillText("GANG COUNT — ALL CLEAR", w / 2, h * 0.5);
        });
        if (step.id === "release-limits") repaint(radioScreen, signFace("LIMITS\nRELEASED", { bg: "#0d1c14", accent: RA_RWP_CSS, fg: "#ffd9b0", scale: 0.3 }));
        if (step.id === "close-log") repaint(closeScreen, signFace("CLOSED", { bg: "#0d1c14", accent: "#59c97b", fg: "#bff7d4", scale: 0.4 }));
      },

      animate(t, dt, session) {
        watchman.userData.head.rotation.y = Math.sin(t * 0.7) * 0.7;
        strayWorker.userData.head.rotation.y = Math.sin(t * 0.4) * 0.3;
        if (ballastTex.offset) { ballastTex.offset.x = 0; }

        const gg = session?.gauge;
        if (gg && !gg.committed) {
          if (session.step?.id === "sighting") {
            repaint(scopeReadout, signFace(`${Math.round(400 + gg.t * 900)} m`, {
              bg: "#0d1c24", accent: gg.t > 0.58 && gg.t < 0.78 ? "#59c97b" : "#f2c14b", scale: 0.5,
            }));
          }
          if (session.step?.id === "defect-check") {
            repaint(defectReadout, signFace(`${Math.round(gg.t * 30)} mm`, {
              bg: "#0d1c24", accent: gg.t < 0.22 ? "#59c97b" : "#f0645b", scale: 0.5,
            }));
          }
        }
        const tr = session?.track;
        if (tr && session.step?.id === "vigilance") {
          scanDial.userData.show?.(`${Math.round(tr.v * 100)}%`);
        }
      },
    };
  },
};
