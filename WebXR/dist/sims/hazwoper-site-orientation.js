import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, ball, torus, slab, group, decal, repaint, signFace, mat,
} from "../../../shared/kit.js";
import {
  CITY, stationPad, holoPanel, holoTag, instrument, valveWheel, standingFigure, reg,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ HAZWOPER Site Orientation VR — Hunters Point Edition,
// Community Environmental Justice, the trained-worker pathway.
//
// A new HAZWOPER-trained laborer's first day on a parcel under a federal
// cleanup order, before a single tool is picked up: the site health and
// safety plan read and signed, the zones on the map, the PPE level this
// parcel actually calls for, the air-monitoring action levels, the buddy
// system, the emergency muster and the site-specific card that says all of
// it happened. No real site, crew or plan is depicted — the trailer, the map
// and the plan are generic, the way every station in this edition is.
// Station hazmat-entry covers the zones and decon corridor of an emergency
// response; this is the routine orientation every laborer on a cleanup
// parcel sits through before their first shift on it.

const HSO_ACCENT = 0x5cc8e0;

export const SIM_HAZWOPER_SITE_ORIENTATION = {
  id: "hazwoper-site-orientation",
  index: "167",
  domain: "Environmental",
  trade: "Hazmat and environmental laborer — LIUNA",
  category: "Community Environmental Justice",
  indoor: "service",
  certification: "LIUNA HAZWOPER-trained hazmat and environmental laborer; OSHA 29 CFR 1910.120(e) HAZWOPER 40-hour training and the site-specific orientation it requires before work begins; 29 CFR 1910.134 respiratory protection and the user seal check; NIOSH exposure guidance behind the site's action levels; Cal/OSHA's injury and illness prevention program (8 CCR 3203) for the site health and safety plan",
  name: "HAZWOPER Site Orientation",
  title: simTitle("HAZWOPER Site Orientation"),
  tagline: "A HAZWOPER-trained laborer's first-day orientation: the site plan signed, the zones on the map, today's PPE level, the action levels, the buddy system, the muster point and the card that says you're cleared",
  accent: HSO_ACCENT,
  accentCss: "#5cc8e0",
  parSeconds: 255,
  footprint: 2.2,
  badge: { id: "orientation-complete", name: "Orientation Complete", note: "Every part of the orientation finished in order, with nothing skipped for the sake of starting sooner" },

  game: system({
    name: "Site Clearance",
    currency: "CLEAR",
    ranks: ["Trainee", "Site Hand", "Crew Laborer", "Site Orientation Lead", "Site Clearance Certified"],
    badges: [
      { id: "read-it-all", name: "Read It All", note: "The plan and the map both answered clean", test: AWARD.all(AWARD.stepClean("hasp-sign"), AWARD.stepClean("walk-map")) },
      { id: "never-skipped", name: "Never Skipped a Step", note: "Never went for the wrong PPE, the wrong door or the wrong crowd", test: AWARD.safe },
      { id: "steady-read", name: "Steady Read", note: "Held the demo readings close to band centre", test: AWARD.precise(0.7) },
    ],
    challenges: [
      { id: "quick-orientation", name: "Quick Orientation", note: "Complete inside 80% of par", test: AWARD.fast(0.8) },
      { id: "clean-day-one", name: "Clean Day One", note: "No corrections anywhere", test: AWARD.clean },
      { id: "nine-straight", name: "Nine Straight", note: "Nine correct actions in a row", test: AWARD.streak(9) },
    ],
  }),

  hazards: {
    "bypass-hasp": "You went for the door to the work floor before the Health and Safety Plan was actually signed. The HASP is what tells you which zone you're allowed in, what PPE this parcel requires today and who the site's emergency contacts are — walking past it to get started means walking onto an active parcel with none of that in your hands yet.",
    "wrong-ppe-kit": "You grabbed the Level D kit off the shelf when today's board calls for Level C. The PPE level posted for this parcel is set by what the air monitoring has actually found here, not by what's fastest to put on — showing up in the wrong ensemble means showing up under-protected for exactly the exposure the plan already knows to expect.",
    "solo-exit": "You headed for the gate without checking who your buddy is. HAZWOPER's buddy system exists because a parcel under a federal cleanup order is not a place to be the only person who knows where you are — going out solo removes the one person whose whole job is noticing if you don't come back.",
    "silence-alarm": "You reached over and silenced the alarm mid-demonstration instead of following the muster route. An alarm silenced before everyone is accounted for doesn't mean the emergency is over — it means the one signal that gets a headcount started just went quiet.",
  },

  lateNotes: {
    "ppe-kit": "Nothing to issue yet — confirm today's PPE level on the board first, or you don't know what you're issuing.",
    "apr-demo": "Wait for the safety officer's demonstration before holding the seal check yourself.",
  },

  interrupts: [
    {
      id: "start-before-orientation",
      kind: "Pulled off orientation early",
      after: "muster-pace", delay: 3, seconds: 12,
      alert: "A crew lead sticks their head in and tells you to grab your gear and come out now — they're short-handed on the parcel and don't want to wait for you to finish the paperwork.",
      cue: "Somebody just asked you to skip the rest of this.",
      target: "checklist-board",
      why: "The orientation checklist exists precisely because 'we're short-handed, come now' is the moment it is most tempting to skip — and the parts still unchecked are the map, the action levels, the buddy assignment and the muster point, every one of which you would otherwise be learning for the first time in the middle of an actual incident. Pointing at the checklist and finishing it is not slowing the crew down; it is the one thing standing between a new hire and being genuinely lost on an active parcel.",
      missNote: "You went with the crew lead. You spent your first hour on an active cleanup parcel not knowing which zone you were in, what PPE it called for, who your buddy was, or where to go if the alarm sounded — all because somebody in a hurry asked first.",
      wrongNote: "Not by grabbing your gear and going — the checklist is what says whether you're actually ready, and right now it says you're not.",
    },
    {
      id: "pump-alarms-demo",
      kind: "Air monitor alarms",
      after: "apr-fit-demo", delay: 3, seconds: 12,
      alert: "The safety officer's demo air monitor on the table suddenly alarms — a sharp, sustained tone nobody triggered on purpose — and everyone in the room looks at you to see what you do.",
      cue: "That alarm just went off in the middle of your orientation. Show the response.",
      target: "muster-point",
      why: "The correct answer to an alarm you don't yet have context for is the same answer every time: stop what you're doing and move to the muster point, because that is the one response that is right whether the alarm is a real reading, a false trip or a drill nobody warned you about — sorting out which one it was happens after the headcount, never before it.",
      missNote: "You stood there waiting for someone to tell you it was a drill. On an actual parcel, the seconds spent waiting to be told what an alarm means are seconds a real exposure keeps building — the muster point is where you go first and ask questions second.",
      wrongNote: "Not by staying at the table to watch the meter — an alarm means move to the muster point, and you find out what it was after everyone is accounted for.",
    },
  ],

  steps: [
    {
      id: "sign-in", kind: "select", target: "sign-in-sheet",
      title: "Check in and show your HAZWOPER card",
      cue: "Sign the trailer's sign-in sheet and present your 40-hour HAZWOPER card.",
      why: "This orientation is the site-specific layer on top of the 40-hour HAZWOPER training you already hold under 29 CFR 1910.120(e) — it is not a substitute for it, so the first thing it confirms is that the training underneath it is actually current before anything site-specific gets added on top of a gap that shouldn't be there.",
    },
    {
      id: "hasp-sign", kind: "select", target: "hasp-binder",
      title: "Read and sign the site Health and Safety Plan",
      cue: "Read the HASP for this parcel and sign the acknowledgment page.",
      why: "The HASP is the one document that ties this specific parcel's hazards, PPE requirements, monitoring plan and emergency procedures together, and signing it is not a formality — it is your record that you were actually told what this site expects before you set foot on it, which is exactly the record a site book is missing when somebody gets hurt not knowing something the plan already said.",
    },
    {
      id: "walk-map", kind: "find", noHint: true,
      targets: ["exclusion-zone", "decon-corridor", "support-zone", "muster-point"],
      itemNames: { "exclusion-zone": "the exclusion zone", "decon-corridor": "the decontamination corridor", "support-zone": "the support zone", "muster-point": "the muster point" },
      itemNotes: {
        "exclusion-zone": "The exclusion zone: where the actual contaminated work happens, and the one area on this map you do not enter without the training and PPE it specifically requires.",
        "decon-corridor": "The decontamination corridor, running between the exclusion zone and the support zone — the only doorway anyone or anything is supposed to use to leave the contaminated ground.",
        "support-zone": "The support zone: the clean side, where the trailer, the tool crib and this orientation itself are actually standing.",
        "muster-point": "The muster point, marked well outside all three zones — where every single person on this parcel goes the instant an alarm sounds, no exceptions.",
      },
      title: "Find the zones and the muster point on the site map",
      cue: "Read the wall map and locate the exclusion zone, the decon corridor, the support zone and the muster point.",
      why: "Every one of today's rules is a rule about which of these areas you're standing in, so the map is the thing everything else in this orientation hangs off of — you cannot follow a PPE level, an action level or an evacuation route correctly if you don't already know, without having to think about it, which zone is which the moment it matters.",
    },
    {
      id: "ppe-level", kind: "select", target: "ppe-level-board",
      title: "Confirm today's PPE level for this parcel",
      cue: "Read the board and confirm the PPE level posted for today's work on this parcel.",
      why: "The PPE level posted here is not a default — it comes out of what the air monitoring on this parcel has actually shown, updated as conditions change, and it can be a different level tomorrow than it is today. Confirming it before you touch a single piece of gear is what keeps the ensemble you put on matched to the exposure this specific shift is actually expected to see.",
    },
    {
      id: "ppe-issue", kind: "drag", target: "ppe-kit",
      title: "Draw your assigned PPE kit",
      cue: "Carry the kit matching today's posted level from the issue shelf to your locker.",
      why: "Issuing PPE at orientation, before the parcel rather than at the fence line under time pressure, is what lets somebody actually check the ensemble against the board while there is still time to swap out the wrong kit — a mismatch caught here costs a minute; the same mismatch caught at the gate costs the whole crew's schedule.",
      drag: { to: "locker-slot", radius: 0.45, missNote: "Not in your locker — a kit left on the bench is a kit somebody else has to sort out before the shift starts." },
    },
    {
      id: "eyewash-check", kind: "turn", target: "eyewash-valve",
      title: "Test the emergency eyewash station",
      cue: "Turn the eyewash valve and confirm it actually flows before you rely on knowing where it is.",
      why: "Knowing where the eyewash station is only helps if it actually works when somebody needs it, and the only way to know that is to have run it — an eyewash that has sat unused for months can have a fouled line or a valve that won't turn, and the orientation walk-through is the moment to find that out, not the moment after something is already in somebody's eyes.",
      turn: { turns: 0.5, axis: "y", label: "EYEWASH" },
    },
    {
      id: "action-levels", kind: "gauge", target: "pid-demo",
      title: "Read the PID against today's action level",
      cue: "Read the demonstration monitor and commit once the reading holds below the action level posted for Level C.",
      why: "An action level is the number written into the plan at which the PPE ensemble has to change, and it is set below the level that would actually hurt you specifically so there is room to react before anyone is exposed to something worse — reading this meter honestly during orientation, rather than treating the number as background noise, is what makes that number mean anything the first time it actually matters in the field.",
      gauge: {
        label: "BREATHING ZONE PID", speed: 0.68, green: [0.1, 0.42],
        readout: (t) => `${(t * 25).toFixed(1)} ppm`,
        missNote: "That reading is above the action level posted for Level C — the plan calls for stopping and upgrading protection, not finishing the reading and moving on.",
      },
    },
    {
      id: "apr-fit-demo", kind: "hold", target: "apr-demo", seconds: 5,
      title: "Hold the demonstration seal check",
      cue: "Block the cartridges on the demo respirator and hold the facepiece collapsed for the full count.",
      why: "OSHA's respiratory protection standard requires a user seal check every time a respirator goes on, not once at the annual fit test, and orientation is where a new laborer does that check for the first time with someone actually watching — a facepiece that creeps back out before the count is done is exactly what a rushed, unwatched check would let through unnoticed on the parcel.",
      holdBreakNote: "You released before the check was over. A facepiece that leaks slowly passes a quick squeeze and fails a shift — hold it the full count.",
    },
    {
      id: "buddy-assign", kind: "select", target: "buddy-board",
      title: "Confirm your assigned buddy",
      cue: "Read the buddy board and confirm who you're paired with for today's shift.",
      why: "The buddy system is not a courtesy on a cleanup parcel — it is the only mechanism that actually notices if someone doesn't come back from the exclusion zone on schedule, and it only works if the pairing is confirmed before anyone walks out, not sorted out after somebody is already overdue.",
    },
    {
      id: "muster-pace", kind: "track", target: "muster-route", seconds: 5,
      title: "Walk the muster route at a steady pace",
      cue: "Hold a brisk walking pace along the route — not a run, not a dawdle.",
      why: "Running to the muster point is how a new hire trips over their own feet or someone else's on a parcel with uneven ground and equipment underfoot, and dawdling defeats the point of a headcount that is supposed to happen fast — the pace that actually works is the same brisk walk every time, practiced now so it is not being improvised for the first time during a real alarm.",
      track: {
        start: 0.15, green: [0.4, 0.62], rise: 0.5, fall: 0.42, drift: 0.12, label: "PACE",
        readout: (v) => (v < 0.4 ? "too slow — dawdling" : v > 0.62 ? "running — that's how people fall" : "brisk and steady"),
      },
      holdBreakNote: "Pace dropped out of band — hold a steady brisk walk the whole length of the route, not a run and not a stroll.",
    },
    {
      id: "emergency-brief", kind: "sequence",
      targets: ["alarm-signal", "headcount"],
      itemNames: { "alarm-signal": "the alarm signal", "headcount": "the headcount procedure" },
      title: "Learn the emergency response in order",
      cue: "Learn the alarm signal first, then how the headcount at the muster point is taken.",
      why: "Recognizing the alarm has to come first because none of the rest matters if you don't know an emergency has started, and the headcount comes second because it is what tells the site whether the response actually worked — teaching them out of order leaves a new hire able to recite a headcount procedure while still not sure what the alarm even sounds like.",
      outOfOrderNote: "The alarm signal first, then the headcount — you have to recognize the alarm before knowing how the headcount runs matters at all.",
    },
    {
      id: "card-issued", kind: "select", target: "card-desk",
      title: "Receive your site-specific card",
      cue: "Confirm your details and take the site-specific orientation card from the desk.",
      why: "The card is what a gate guard, a crew lead or an inspector checks before assuming any of today's orientation actually happened — without it, every step you just completed exists only as your word, and a site under a federal cleanup order runs on records that outlast a conversation.",
    },
    {
      id: "close-out", kind: "sequence",
      targets: ["file-hasp-copy", "log-badge-number", "confirm-complete"],
      itemNames: { "file-hasp-copy": "file the signed HASP copy", "log-badge-number": "log your badge number", "confirm-complete": "confirm orientation complete" },
      title: "Close out the orientation record in order",
      cue: "File the signed HASP copy, log your badge number, then mark the orientation complete.",
      why: "Filing the signed plan before logging the badge number means the record that gets tied to your number is one that actually exists on paper, and marking the orientation complete last means that mark is true when it's made rather than a promise made in advance of the filing that is supposed to back it up.",
      outOfOrderNote: "File the HASP copy, then log the badge number, then mark it complete — marking it complete before the paperwork is actually filed writes down a record that doesn't exist yet.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.2, HSO_ACCENT);
    box(g, 5.4, 0.1, 4.6, 0, 0.05, 0, 0x6b7278, { rough: 0.85, finish: "painted", tile: [3, 3] });
    box(g, 5.4, 2.6, 0.12, 0, 1.4, -2.1, 0xc7ced2, { rough: 0.85 });
    box(g, 5.4, 0.14, 0.3, 0, 2.75, -2.1, 0xa9b1b6, { rough: 0.8 });

    // ------------------------------------------------------------ sign-in desk
    const desk = group(g, -1.9, 0, 1.2, 0.5);
    slab(desk, 0.9, 0.05, 0.5, 0, 0.72, 0, 0x6b5a44, { radius: 0.02, rough: 0.6 });
    for (const dx of [-0.4, 0.4]) box(desk, 0.05, 0.7, 0.05, dx, 0.35, -0.18, 0x4a3d2e, { rough: 0.7 });
    const signSheet = box(desk, 0.3, 0.01, 0.22, -0.15, 0.75, 0.1, 0xf3efe4, { rough: 0.9 });
    holoTag(desk, "sign-in sheet", -0.15, 0.9, 0.1, { css: "#5cc8e0", w: 0.32 });
    reg(hits, signSheet, "sign-in-sheet");
    const haspBinder = box(desk, 0.24, 0.05, 0.3, 0.2, 0.78, 0.05, 0xd8232a, { rough: 0.6 });
    decal(haspBinder, 0.2, 0.24, 0, 0.026, 0, signFace("HASP", { bg: "#7d1512", accent: "#f2c14b", scale: 0.5 })).rotation.x = -Math.PI / 2;
    holoTag(desk, "health and safety plan", 0.2, 0.95, 0.05, { css: "#5cc8e0", w: 0.44 });
    reg(hits, haspBinder, "hasp-binder");

    // The shortcut door — the bypass trap.
    const shortcutDoor = group(g, -2.4, 0, -1.9);
    box(shortcutDoor, 0.9, 2.0, 0.08, 0, 1.0, 0, 0x8a939b, { rough: 0.6, metal: 0.3 });
    holoTag(shortcutDoor, "straight to the floor?", 0, 2.2, 0, { css: "#f0645b", w: 0.5 });
    reg(hits, shortcutDoor, "bypass-hasp");

    // ------------------------------------------------------------ site map
    const mapPanel = holoPanel(g, 1.3, 0.9, 0, 1.7, -1.98, (cx, w, h) => {
      cx.fillStyle = "#0f1c22"; cx.fillRect(0, 0, w, h);
      cx.fillStyle = "#5cc8e0"; cx.fillRect(0, 0, w, 6);
      cx.fillStyle = "#d2312b"; cx.fillRect(w * 0.06, h * 0.18, w * 0.32, h * 0.55);
      cx.fillStyle = "#f2c14b"; cx.fillRect(w * 0.4, h * 0.3, w * 0.14, h * 0.35);
      cx.fillStyle = "#59c97b"; cx.fillRect(w * 0.58, h * 0.15, w * 0.36, h * 0.68);
      cx.fillStyle = "#eaf6fb"; cx.font = `600 ${Math.round(h * 0.06)}px 'Barlow Condensed', Arial, sans-serif`;
      cx.textAlign = "center"; cx.textBaseline = "middle";
      cx.fillText("EXCLUSION", w * 0.22, h * 0.1); cx.fillText("CRZ", w * 0.47, h * 0.1); cx.fillText("SUPPORT", w * 0.76, h * 0.1);
    }, { accent: HSO_ACCENT });
    void mapPanel;
    const exclusionMarker = box(g, 0.5, 0.3, 0.06, -0.5, 1.7, -2.0, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, exclusionMarker, "exclusion-zone");
    const deconMarker = box(g, 0.24, 0.3, 0.06, -0.08, 1.7, -2.0, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, deconMarker, "decon-corridor");
    const supportMarker = box(g, 0.5, 0.3, 0.06, 0.45, 1.7, -2.0, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, supportMarker, "support-zone");
    const musterMarker = group(g, 1.7, 0, 1.6, -0.5);
    cyl(musterMarker, 0.03, 0.03, 1.3, 0, 0.65, 0, CITY.steel, { rough: 0.5, metal: 0.6, seg: 8 });
    torus(musterMarker, 0.14, 0.02, 0, 1.35, 0, 0x59c97b, { emissive: 0x59c97b, ei: 1.4, rough: 0.5, seg: 8, seg2: 20 });
    holoTag(musterMarker, "muster point", 0, 1.6, 0, { css: "#59c97b", w: 0.34 });
    reg(hits, musterMarker, "muster-point");

    // -------------------------------------------------------------- PPE level board
    const levelBoard = holoPanel(g, 0.6, 0.42, -0.6, 1.55, -1.5, (cx, w, h) => {
      cx.fillStyle = "rgba(8,18,22,0.92)"; cx.fillRect(0, 0, w, h);
      cx.fillStyle = "#5cc8e0"; cx.fillRect(0, 0, w, 5);
      cx.fillStyle = "#bfe8f0"; cx.font = `600 ${Math.round(h * 0.1)}px 'Barlow Condensed', Arial, sans-serif`;
      cx.textAlign = "left"; cx.textBaseline = "middle";
      cx.fillText("TODAY'S PPE LEVEL", w * 0.06, h * 0.16);
      cx.fillStyle = "#eaf6fb"; cx.font = `700 ${Math.round(h * 0.28)}px 'Barlow Condensed', Arial, sans-serif`;
      cx.fillText("LEVEL C", w * 0.06, h * 0.55);
      cx.fillStyle = "#9fd8e0"; cx.font = `${Math.round(h * 0.09)}px Arial, sans-serif`;
      cx.fillText("APR, chemical suit, boots + gloves", w * 0.06, h * 0.82);
    }, { accent: HSO_ACCENT });
    reg(hits, levelBoard, "ppe-level-board");

    // -------------------------------------------------------------- PPE issue
    const shelf = group(g, 1.7, 0, -1.1, -0.3);
    box(shelf, 0.9, 0.05, 0.4, 0, 1.1, 0, 0x53585e, { rough: 0.6, metal: 0.4 });
    box(shelf, 0.9, 0.05, 0.4, 0, 0.6, 0, 0x53585e, { rough: 0.6, metal: 0.4 });
    for (const sx of [-0.42, 0.42]) box(shelf, 0.05, 1.2, 0.05, sx, 0.6, 0, 0x3a3c3e, { rough: 0.6 });
    const kitC = group(shelf, -0.15, 1.15, 0);
    box(kitC, 0.28, 0.22, 0.14, 0, 0.11, 0, HSO_ACCENT, { rough: 0.7 });
    decal(kitC, 0.2, 0.06, 0, 0.221, 0, signFace("LEVEL C", { bg: "#0f2c33", accent: "#5cc8e0", scale: 0.5 }), { px: 100 });
    holoTag(kitC, "PPE kit — Level C", 0, 0.32, 0, { css: "#5cc8e0", w: 0.42 });
    reg(hits, kitC, "ppe-kit");
    const kitD = group(shelf, 0.22, 0.65, 0);
    box(kitD, 0.28, 0.2, 0.14, 0, 0.1, 0, 0x9a917c, { rough: 0.75 });
    decal(kitD, 0.2, 0.06, 0, 0.201, 0, signFace("LEVEL D", { bg: "#3a3428", accent: "#e8dcc0", scale: 0.5 }), { px: 100 });
    holoTag(kitD, "PPE kit — Level D", 0, 0.3, 0, { css: "#f0645b", w: 0.42 });
    reg(hits, kitD, "wrong-ppe-kit");

    const locker = group(g, 1.85, 0, -0.3, -0.3);
    box(locker, 0.5, 1.6, 0.5, 0, 0.8, 0, 0x3a4048, { rough: 0.6, metal: 0.4 });
    const lockerSlot = box(locker, 0.4, 0.3, 0.05, 0, 1.0, 0.26, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(locker, "your locker", 0, 1.7, 0, { css: "#5cc8e0", w: 0.3 });
    hits["locker-slot"] = lockerSlot;

    // ----------------------------------------------------------- eyewash station
    const eyewash = group(g, -1.9, 0, -1.2, 0.4);
    cyl(eyewash, 0.035, 0.035, 0.9, 0, 0.45, 0, CITY.steel, { rough: 0.5, metal: 0.6, seg: 10 });
    ball(eyewash, 0.08, -0.1, 0.9, 0, 0xeaf6fb, { rough: 0.4, seg: 14 });
    ball(eyewash, 0.08, 0.1, 0.9, 0, 0xeaf6fb, { rough: 0.4, seg: 14 });
    const eyewashHandle = valveWheel(eyewash, 0, 0.55, 0.1, { color: 0xf2c14b, body: 0x2b2f34, r: 0.07 });
    holoTag(eyewash, "eyewash station", 0, 1.05, 0, { css: "#5cc8e0", w: 0.4 });
    reg(hits, eyewashHandle, "eyewash-valve");

    // -------------------------------------------------------------- PID demo
    const demoTable = group(g, -0.6, 0, 0.9, 0.2);
    slab(demoTable, 0.8, 0.05, 0.5, 0, 0.72, 0, 0x53585e, { radius: 0.02, rough: 0.5, metal: 0.3 });
    for (const dx of [-0.32, 0.32]) box(demoTable, 0.05, 0.7, 0.05, dx, 0.35, 0, 0x3a3c3e, { rough: 0.6 });
    const pidDemo = instrument(demoTable, -0.1, 0.85, 0, { ry: 0.2, idle: "-- ppm", color: HSO_ACCENT });
    holoTag(pidDemo, "PID monitor", 0, 0.18, 0, { css: "#5cc8e0", w: 0.32 });
    reg(hits, pidDemo, "pid-demo");
    const alarmLamp = ball(pidDemo, 0.02, 0.06, 0.05, 0.11, 0xd2312b, { emissive: 0xd2312b, ei: 2.2, rough: 0.4 });
    alarmLamp.visible = false;

    const aprDemo = group(demoTable, 0.28, 0.75, 0);
    box(aprDemo, 0.12, 0.09, 0.07, 0, 0, 0, 0x2b3138, { rough: 0.5, metal: 0.2 });
    torus(aprDemo, 0.045, 0.014, 0, 0, 0.035, 0x3c4650, { rough: 0.4 });
    holoTag(aprDemo, "demo respirator", 0, 0.16, 0, { css: "#5cc8e0", w: 0.38 });
    reg(hits, aprDemo, "apr-demo");

    // -------------------------------------------------------------- buddy board
    const buddyBoard = holoPanel(g, 0.55, 0.4, 1.0, 1.5, -1.98, (cx, w, h) => {
      cx.fillStyle = "rgba(8,18,22,0.9)"; cx.fillRect(0, 0, w, h);
      cx.fillStyle = "#5cc8e0"; cx.fillRect(0, 0, w, 5);
      cx.fillStyle = "#bfe8f0"; cx.font = `600 ${Math.round(h * 0.11)}px 'Barlow Condensed', Arial, sans-serif`;
      cx.textAlign = "left"; cx.textBaseline = "middle";
      cx.fillText("TODAY'S PAIRS", w * 0.06, h * 0.16);
      cx.fillStyle = "#eaf6fb"; cx.font = `${Math.round(h * 0.1)}px Arial, sans-serif`;
      cx.fillText("You  —  Crew Laborer 2", w * 0.06, h * 0.48);
      cx.fillText("Buddy confirmed at check-in", w * 0.06, h * 0.7);
    }, { accent: HSO_ACCENT });
    reg(hits, buddyBoard, "buddy-board");

    // Solo exit — a side door away from the desk, the buddy-skip trap.
    const soloDoor = group(g, 2.4, 0, 1.4, -0.6);
    box(soloDoor, 0.8, 1.9, 0.08, 0, 0.95, 0, 0x8a939b, { rough: 0.6, metal: 0.3 });
    holoTag(soloDoor, "just head out?", 0, 2.1, 0, { css: "#f0645b", w: 0.34 });
    reg(hits, soloDoor, "solo-exit");

    // -------------------------------------------------------------- emergency brief
    const alarmUnit = group(g, 0, 0, -1.98);
    box(alarmUnit, 0.14, 0.14, 0.06, -1.4, 2.1, 0, 0xd2312b, { rough: 0.5, metal: 0.3 });
    const alarmLight = ball(alarmUnit, 0.03, -1.4, 2.22, 0.04, 0xd2312b, { emissive: 0xd2312b, ei: 1.6, rough: 0.4 });
    holoTag(alarmUnit, "alarm signal", -1.4, 2.35, 0, { css: "#d2312b", w: 0.34 });
    reg(hits, alarmLight, "alarm-signal");
    const silenceButton = box(alarmUnit, 0.08, 0.05, 0.04, -1.4, 2.0, 0.05, 0x2b3138, { rough: 0.5 });
    holoTag(alarmUnit, "silence it?", -1.4, 1.9, 0.05, { css: "#f0645b", w: 0.3 });
    reg(hits, silenceButton, "silence-alarm");
    const routeMarker = box(g, 1.4, 0.02, 0.3, 0.8, 0.011, 1.0, 0x59c97b, { opacity: 0.55, transparent: true, rough: 0.5, cast: false });
    holoTag(g, "muster route", 0.8, 0.25, 1.0, { css: "#59c97b", w: 0.32 });
    reg(hits, routeMarker, "muster-route");
    const headcountBoard = box(g, 0.3, 0.4, 0.03, 1.7, 1.3, 1.55, 0xf3efe4, { rough: 0.7 });
    holoTag(g, "headcount board", 1.7, 1.55, 1.55, { css: "#59c97b", w: 0.32 });
    reg(hits, headcountBoard, "headcount");

    // -------------------------------------------------------------- checklist / card desk
    const checklist = holoPanel(g, 0.6, 0.5, -2.1, 1.5, -0.4, (cx, w, h) => {
      cx.fillStyle = "rgba(8,18,22,0.92)"; cx.fillRect(0, 0, w, h);
      cx.fillStyle = "#5cc8e0"; cx.fillRect(0, 0, w, 5);
      cx.fillStyle = "#bfe8f0"; cx.font = `600 ${Math.round(h * 0.1)}px 'Barlow Condensed', Arial, sans-serif`;
      cx.textAlign = "left"; cx.textBaseline = "middle";
      cx.fillText("ORIENTATION CHECKLIST", w * 0.06, h * 0.14);
      cx.fillStyle = "#eaf6fb"; cx.font = `${Math.round(h * 0.085)}px Arial, sans-serif`;
      ["Sign-in + HASP", "Zones + muster", "PPE level + kit", "Action levels", "Buddy assigned"].forEach((line, i) => cx.fillText(line, w * 0.06, h * (0.32 + i * 0.14)));
    }, { ry: 0.4, accent: HSO_ACCENT });
    reg(hits, checklist, "checklist-board");

    const cardDesk = group(g, 2.2, 0, 0.3, -0.5);
    slab(cardDesk, 0.6, 0.05, 0.4, 0, 0.72, 0, 0x6b5a44, { radius: 0.02, rough: 0.6 });
    for (const dx of [-0.25, 0.25]) box(cardDesk, 0.05, 0.7, 0.05, dx, 0.35, -0.15, 0x4a3d2e, { rough: 0.7 });
    const card = box(cardDesk, 0.16, 0.01, 0.1, 0, 0.75, 0.05, 0xeaf6fb, { rough: 0.4, metal: 0.1 });
    decal(card, 0.13, 0.07, 0, 0.756, 0.05, signFace("SITE CARD", { bg: "#0f2c33", accent: "#5cc8e0", scale: 0.5 }), { px: 100 }).rotation.x = -Math.PI / 2;
    holoTag(cardDesk, "site-specific card", 0, 0.9, 0.05, { css: "#5cc8e0", w: 0.4 });
    reg(hits, card, "card-desk");

    // -------------------------------------------------------------- close-out filing
    const filingCab = group(g, -2.3, 0, 0.4, 0.5);
    box(filingCab, 0.4, 1.1, 0.45, 0, 0.55, 0, 0x53585e, { rough: 0.55, metal: 0.4 });
    const fileSlot = box(filingCab, 0.32, 0.04, 0.03, 0, 0.75, 0.23, 0x2b3138, { rough: 0.6, cast: false });
    holoTag(filingCab, "file the HASP copy", 0, 1.15, 0, { css: "#5cc8e0", w: 0.4 });
    reg(hits, fileSlot, "file-hasp-copy");
    const badgeLog = box(desk, 0.14, 0.01, 0.1, -0.3, 0.755, -0.1, 0xdfe4e8, { rough: 0.6 });
    holoTag(desk, "log badge number", -0.3, 0.86, -0.1, { css: "#5cc8e0", w: 0.34 });
    reg(hits, badgeLog, "log-badge-number");
    const completeStamp = box(desk, 0.12, 0.06, 0.12, 0.35, 0.79, -0.1, 0xf2c14b, { rough: 0.5 });
    holoTag(desk, "confirm complete", 0.35, 0.9, -0.1, { css: "#5cc8e0", w: 0.38 });
    reg(hits, completeStamp, "confirm-complete");

    const safetyOfficer = standingFigure(g, -0.15, 1.35, { ry: 3.1, cloth: 0x37505f, vest: HSO_ACCENT, helmet: 0xf2f2f2, atStation: true });
    void safetyOfficer;
    const trainee2 = standingFigure(g, 0.9, -0.6, { ry: -1.1, cloth: 0x4a4030, atStation: true });
    void trainee2;
    // The crew lead who leans in during the interrupt — hidden until then.
    const crewLead = standingFigure(g, -2.1, -1.5, { ry: 1.4, cloth: 0xe8b64a, vest: 0xf2c14b, helmet: 0xf2f2f2, atStation: true });
    crewLead.visible = false;

    let checklistDemand = false, alarmDemo = false;

    return {
      hits,
      spawnLook: new THREE.Vector3(-0.3, 1.3, -0.5),
      footprint: 2.2,

      onStepComplete(step) {
        if (step.id === "ppe-issue") { kitC.visible = false; }
        if (step.id === "eyewash-check") { /* handle already visually spun in animate */ }
        if (step.id === "card-issued") { card.material = mat(0x59c97b, { rough: 0.4 }); }
        if (step.id === "close-out") { completeStamp.material = mat(0x59c97b, { rough: 0.5 }); }
      },

      onInterrupt(it) {
        if (it.id === "start-before-orientation") { checklistDemand = true; crewLead.visible = true; }
        if (it.id === "pump-alarms-demo") { alarmDemo = true; alarmLamp.visible = true; }
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "start-before-orientation") { checklistDemand = false; crewLead.visible = false; }
        if (it.id === "pump-alarms-demo") { alarmDemo = false; alarmLamp.visible = false; }
      },

      animate(t, dt, session) {
        alarmLight.material.emissiveIntensity = 1.2 + Math.sin(t * 4) * 0.5;
        if (alarmDemo) alarmLamp.material.emissiveIntensity = 1.6 + Math.sin(t * 10) * 1.4;
        if (session?.turn && session.step?.id === "eyewash-check") eyewashHandle.rotation.z = session.turn.amount * Math.PI * 2;
        const gg = session?.gauge;
        if (gg && !gg.committed && session.step?.id === "action-levels") {
          repaint(pidDemo.userData.screen, signFace(`${(gg.t * 25).toFixed(1)}`, {
            bg: "#0d1c24", accent: gg.t > 0.1 && gg.t < 0.42 ? "#59c97b" : "#f0645b", fg: "#bfeaf7", scale: 0.6,
          }));
        }
        void checklistDemand;
      },
    };
  },
};
