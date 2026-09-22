import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, ball, torus, group, decal, repaint, signFace, paperFace, mat,
} from "../../../shared/kit.js";
import {
  stationPad, holoPanel, holoTag, instrument, standingFigure, reg,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Shelter-in-Place Drill VR — Community Environmental Justice,
// Hunters Point Edition. A community centre's own drill for a dust or fire
// event at a fenced parcel nearby: the alert received and taken seriously,
// every door and window actually closed, the HVAC switched to recirculate
// so the building stops pulling outside air in, the portable air cleaner run
// on high, a real headcount across every room, the hotline and the regional
// air regulator both called, residents with respiratory needs checked by
// name, and the all-clear recorded rather than assumed. Sited generically: a
// community centre, a fenced parcel somewhere nearby, no borrowed facts
// about any one site or any one event.

const SIP_ACCENT = 0x7fd1c9;
const SIP_ALERT = 0xf0645b;

export const SIM_SHELTER_IN_PLACE_DRILL = {
  id: "shelter-in-place-drill",
  index: "171",
  domain: "Environmental",
  trade: "Community pollution patrol lead",
  category: "Community Environmental Justice",
  indoor: "service",
  weather: "overcast",
  certification: "The community centre's own shelter-in-place plan, run under the patrol lead's direction; BAAQMD's complaint and public-alert line for reporting the event that triggered the drill; EPA guidance on using a portable air cleaner's clean-air delivery rate (CADR) to actually reduce indoor particulate during a dust or smoke event; the same shade-and-smoke thresholds Cal/OSHA's wildfire-smoke rule sets for outdoor exposure, adopted here as the trigger for sheltering indoors; accommodation practice consistent with the ADA for residents with respiratory needs during an emergency",
  name: "Shelter-in-Place Drill",
  title: simTitle("Shelter-in-Place Drill"),
  tagline: "A community centre's shelter-in-place drill for a dust or fire event at a fenced parcel: the alert taken seriously, doors and windows closed, HVAC to recirculate, the air cleaner on high, a real headcount, the hotline and the Air District called, residents with respiratory needs checked by name, and the all-clear recorded",
  accent: SIP_ACCENT,
  accentCss: "#7fd1c9",
  parSeconds: 300,
  footprint: 2.3,
  badge: { id: "building-held", name: "Building Held", note: "Every opening closed, the air handled correctly, every room counted, both calls made, every resident checked, and the all-clear recorded rather than assumed" },

  game: system({
    name: "Shelter Watch",
    currency: "COUNT",
    ranks: ["Drill Trainee", "Floor Monitor", "Shelter Lead", "Building Steward", "Shelter Certified"],
    badges: [
      { id: "sealed-clean", name: "Sealed Clean", note: "Every door and window closed before the HVAC step began", test: AWARD.stepClean("close-openings") },
      { id: "nobody-missed", name: "Nobody Missed", note: "Never a hazard, never a shortcut on the headcount or the residents", test: AWARD.safe },
      { id: "air-true", name: "Air True", note: "The air cleaner and the indoor monitor both read inside the working band", test: AWARD.precise(0.7) },
    ],
    challenges: [
      { id: "clean-drill", name: "Clean Drill", note: "No corrections anywhere in the drill", test: AWARD.clean },
      { id: "steady-watch", name: "Steady Watch", note: "Held the indoor air reading in band without a dropout", test: AWARD.unbroken },
      { id: "all-clear-fast", name: "All Clear Fast", note: "Drill logged inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "prop-door-open": "You wedged a door open for air. The entire point of a shelter-in-place drill is that the building's own envelope is what is keeping outside dust or smoke from getting to the people inside it — a door propped open for comfort is a door that just undid every other step of the drill for whoever is standing near it.",
    "hvac-fresh-air": "You switched the HVAC to bring in outside air instead of recirculate. Fresh air feels better, but during a dust or smoke event outside, 'fresh' air is exactly the air the drill exists to keep out — recirculate is the setting that keeps conditioning the room's own air instead of pulling in more of what triggered the drill.",
    "skip-headcount-room": "You marked the headcount complete without actually counting one of the rooms. A drill that assumes a room is empty because nobody has reported otherwise is a drill that would leave someone actually unaccounted for during a real event — every room gets counted, not assumed.",
    "ignore-oxygen-resident": "You moved on down the checklist past a resident who was clearly trying to get your attention. The whole reason this station checks residents with respiratory needs by name is that a shelter-in-place event is exactly the moment their condition is most likely to get worse — a checklist finished on schedule while someone needed help is a checklist that missed the point of running it.",
  },

  lateNotes: {
    "hotline-phone": "The calls come after the building is actually sealed and the air handled — there is nothing useful to report yet.",
    "air-district-line": "The Air District call comes right after the hotline, once the event itself has been reported.",
    "all-clear-panel": "The all-clear only gets posted once every room has been counted and every resident with respiratory needs has actually been checked.",
    "drill-log": "The log gets the final time and headcount once the all-clear has actually been posted, not before.",
  },

  interrupts: [
    {
      id: "loading-door-opened",
      kind: "Door opened mid-drill",
      after: "monitor-indoor-air", delay: 4, seconds: 12,
      alert: "Someone at the back has cracked the loading door open to see what is happening outside.",
      cue: "Close it now — that door is pulling outside air straight past the monitor you are watching.",
      target: "loading-door",
      why: "The loading door is the largest single opening in the building, and every second it sits open during a dust or smoke event undoes the recirculate setting, the closed windows and the air cleaner all at once for whoever is standing anywhere near that end of the room.",
      missNote: "The loading door stayed open for the rest of the watch. Whatever the indoor monitor read for that stretch was reading a room with a hole in its own seal, which makes the reading — and the drill — worth nothing for that period.",
      wrongNote: "That does not close the door. Go shut the loading door itself — nothing else in this room does what closing it does.",
    },
    {
      id: "oxygen-running-low",
      kind: "Resident needs support",
      after: "verify-communication", delay: 4, seconds: 12,
      alert: "The resident on supplemental oxygen signals that the tank is running low.",
      cue: "Get the backup cylinder to them now — this cannot wait for the checklist to reach that step.",
      target: "backup-oxygen-cylinder",
      why: "A shelter-in-place drill exists precisely because leaving is not the safe option right now — which means anyone whose own medical equipment is running low has to be supported inside the building, immediately, rather than told to wait for the point in the checklist where residents get checked.",
      missNote: "The tank ran out before anyone brought the backup cylinder over. Sheltering in place protects people from what is outside; it does not pause what a resident's own body needs while they wait for it.",
      wrongNote: "That does not help them breathe. The backup oxygen cylinder is what this resident needs right now.",
    },
  ],

  steps: [
    {
      id: "alert-received", kind: "select", target: "alert-radio",
      title: "Take the shelter-in-place alert seriously",
      cue: "Answer the alert radio and confirm the event before doing anything else.",
      why: "Everything in this drill starts from the alert actually being received and believed — a drill run because someone thought they smelled something, versus a drill run because the alert radio said so, is the same set of actions, but only one of them is what real crews are trained to trust.",
    },
    {
      id: "close-openings", kind: "sequence", anyOrder: true,
      targets: ["door-front", "door-side", "window-1", "window-2"],
      itemNames: { "door-front": "the front door", "door-side": "the side door", "window-1": "window one", "window-2": "window two" },
      title: "Close every door and window",
      cue: "Close the front door, the side door, and both windows before touching the HVAC.",
      why: "The building's envelope is the first and simplest control this drill has — a single door or window left open gives outside dust or smoke a direct path in that no amount of recirculating air or filtering afterward can fully make up for.",
    },
    {
      id: "hvac-recirculate", kind: "turn", target: "hvac-control",
      title: "Switch the HVAC to recirculate",
      cue: "Turn the HVAC control to the recirculate setting.",
      why: "A building's HVAC is normally drawing in some amount of outside air on purpose, for ordinary ventilation — during a dust or smoke event, that same intake becomes the building's biggest uncontrolled opening. Recirculate keeps the system conditioning the air already inside instead of adding more of what the alert is warning about.",
      turn: { turns: 0.5, axis: "y", label: "HVAC MODE" },
    },
    {
      id: "hvac-fresh-check", kind: "select", target: "hvac-control-check",
      title: "Confirm the fresh-air damper did not stay open",
      cue: "Check the damper indicator reads closed before moving on.",
      why: "A recirculate setting on the control panel and a damper that is actually closed are two different facts — this building's own HVAC has stuck open before, and confirming the indicator rather than trusting the switch position is what this drill actually checks.",
    },
    {
      id: "air-cleaner-level", kind: "gauge", target: "air-cleaner-dial",
      title: "Set the portable air cleaner to high",
      cue: "Dial the air cleaner up and commit once its clean-air delivery rate lands in the high band.",
      why: "A portable air cleaner run on a low or medium setting to keep the noise down is a unit doing a fraction of the filtering the room actually needs during an event — set to the top of its rated clean-air delivery rate, it is the one control in this room actually pulling particulate back out of the air the building has already sealed in. This is the same clean-air-space approach the CDC publishes for sheltering from wildfire smoke: seal the room, then filter the air already inside it.",
      gauge: { label: "CADR", speed: 0.7, green: [0.72, 0.92], readout: (t) => `${Math.round(t * 300)} CFM`, missNote: "Short of the high setting this room's size actually calls for. Dial it further and commit again." },
    },
    {
      id: "headcount", kind: "sequence", anyOrder: true,
      targets: ["count-room-a", "count-room-b", "count-hallway"],
      itemNames: { "count-room-a": "room A count", "count-room-b": "room B count", "count-hallway": "hallway count" },
      decoyNotes: { "skip-headcount-room": "Marking the count complete without actually walking a room and counting the people in it is not a headcount — it is a guess with the same form as one." },
      options: [
        { id: "count-room-a", label: "Room A" }, { id: "count-room-b", label: "Room B" },
        { id: "count-hallway", label: "Hallway" }, { id: "skip-headcount-room", label: "Assume the rest are accounted for" },
      ],
      title: "Take a real headcount, room by room",
      cue: "Walk and confirm the count for room A, room B, and the hallway — every room, not just the ones with people obviously in them.",
      why: "A shelter-in-place drill that cannot say with certainty how many people are actually in the building has not actually sheltered anyone in particular — it has just closed some doors. The count is what turns 'the building is sealed' into 'everyone in the building is accounted for.'",
    },
    {
      id: "verify-communication", kind: "hold", target: "radio-handset", seconds: 5,
      title: "Confirm two-way contact with the front desk",
      cue: "Hold the radio handset until the front desk confirms they can hear you clearly.",
      why: "A shelter-in-place drill run by one person with no confirmed way to reach anyone else in the building is a single point of failure — holding the radio until the front desk actually answers back is what proves the communication channel is live before it gets relied on for the rest of the drill.",
      holdBreakNote: "You let go before the front desk confirmed contact. An unconfirmed radio channel is not a communication line — hold it until they actually answer.",
    },
    {
      id: "call-hotline", kind: "select", target: "hotline-phone",
      title: "Call the pollution hotline",
      cue: "Report the event and this building's response on the patrol network's hotline.",
      why: "The hotline is how the wider patrol network knows this event is happening at all — a shelter-in-place drill that stays entirely inside one building's own walls never reaches the record that connects it to whatever else the network is seeing that day.",
    },
    {
      id: "call-air-district", kind: "select", target: "air-district-line",
      title: "Call the regional air regulator",
      cue: "File the event with the Air District's own complaint line.",
      why: "The hotline is the network's own record; the Air District's complaint line is the regulator's. A community centre that shelters in place and never files with the regulator has protected the people inside its own walls but left the event itself invisible to the body with the authority to act on it.",
    },
    {
      id: "check-respiratory-residents", kind: "find", noHint: true,
      targets: ["resident-oxygen", "resident-inhaler"],
      itemNames: { "resident-oxygen": "the resident on supplemental oxygen", "resident-inhaler": "the resident with a rescue inhaler" },
      itemNotes: {
        "resident-oxygen": "Checked and steady for now — noted so the oxygen supply gets watched for the rest of the drill, not just at this one moment.",
        "resident-inhaler": "Checked and breathing normally — noted so anyone else in the building knows this resident has already been seen.",
      },
      title: "Check every resident with a respiratory condition, by name",
      cue: "Find and check on the resident using supplemental oxygen and the resident carrying a rescue inhaler.",
      why: "A shelter-in-place event is exactly the condition that makes a respiratory condition worse, and 'the building is sealed' does nothing for someone whose own equipment or medication is what they actually depend on. Checking them by name, not just counting them in the headcount, is what this station scores separately from the count.",
    },
    {
      id: "monitor-indoor-air", kind: "track", target: "indoor-monitor-panel", seconds: 7,
      title: "Watch the indoor air monitor through the shelter period",
      cue: "Hold attention on the panel and keep the indoor particulate reading inside the safe band.",
      why: "Sealing the building is not a one-time action that stays true on its own — the indoor reading is what tells you, in real time, whether the seal is actually holding or whether something (a door, a damper, a gap nobody noticed) is letting outside air back in while the drill is still running.",
      track: { start: 0.15, green: [0.1, 0.35], rise: 0.5, fall: 0.42, drift: 0.12, label: "INDOOR PM", readout: (v) => (v > 0.35 ? "rising — check the seal" : "holding clean") },
      holdBreakNote: "The indoor reading climbed out of band. Something is letting outside air back in — bring it back down before calling the watch complete.",
    },
    {
      id: "all-clear-received", kind: "select", target: "all-clear-panel",
      title: "Post the all-clear",
      cue: "Confirm the all-clear from the alert source and post it for the building.",
      why: "The all-clear ends the drill's active controls the same way the alert started them — on an actual confirmed message, not on how long it has felt quiet or how the air outside looks through a window.",
    },
    {
      id: "reopen-openings", kind: "sequence", anyOrder: true,
      targets: ["door-front", "door-side", "window-1", "window-2"],
      itemNames: { "door-front": "the front door", "door-side": "the side door", "window-1": "window one", "window-2": "window two" },
      title: "Reopen the building once the all-clear is posted",
      cue: "Reopen the front door, the side door, and both windows now that the all-clear has been posted.",
      why: "Reopening before the all-clear undoes the whole drill for the sake of a few minutes of comfort; reopening only after it is posted is what makes the earlier closing steps mean something instead of being undone the moment the room starts feeling stuffy.",
    },
    {
      id: "record-all-clear", kind: "select", target: "drill-log",
      title: "Log the drill's finishing facts",
      cue: "Record the all-clear time, the final headcount, and the two calls made in the drill log.",
      why: "The log is what turns this drill from something the people in the room today remember into something the next shift, the next drill, and anyone reviewing the plan afterward can actually check against.",
    },
  ],

  build(root) {
    const hits = {};
    // The indoor "service" interior spawns the learner near its own front
    // wall looking in (see interiors.js/stage.js) — set the whole room back
    // from that spawn point so the approach is clean instead of starting
    // nose-to-nose with the nearest fixture.
    const g = group(root, 0, 0, -1.8);
    stationPad(g, 2.3, SIP_ACCENT);

    // -------------------------------------------------------------- shell
    box(g, 5.4, 0.08, 4.6, 0, 0.04, -0.2, 0x8c8f8e, { rough: 0.86, finish: "concrete", tile: [5, 4] });
    box(g, 5.4, 2.9, 0.14, 0, 1.55, -2.1, 0xd7dbd8, { rough: 0.82 });
    box(g, 5.4, 0.16, 0.32, 0, 3.0, -2.1, 0xbdc2bf, { rough: 0.75 });

    // -------------------------------------------------------------- alert radio
    const alertPost = group(g, -1.9, 0, -1.95);
    box(alertPost, 0.3, 0.4, 0.14, 0, 1.3, 0, 0x2b3138, { rough: 0.55, metal: 0.3 });
    const alertLamp = ball(alertPost, 0.03, 0, 1.46, 0.08, SIP_ALERT, { emissive: SIP_ALERT, ei: 1.8, rough: 0.4 });
    holoTag(alertPost, "alert radio", 0, 1.56, 0, { css: "#7fd1c9", w: 0.3 });
    reg(hits, alertPost, "alert-radio");

    // -------------------------------------------------------------- doors
    function makeDoor(x, z, ry) {
      const grp = group(g, x, 0, z, ry);
      box(grp, 0.06, 2.0, 1.0, -0.5, 1.0, 0, 0x59636d, { rough: 0.6, metal: 0.3 });
      const leaf = box(grp, 0.05, 1.9, 0.9, 0, 0.95, 0.46, 0x6f7a83, { rough: 0.5, metal: 0.4 });
      return { grp, leaf };
    }
    const frontDoor = makeDoor(-2.6, -0.6, 0);
    holoTag(frontDoor.grp, "front door", 0, 2.1, 0.3, { css: "#7fd1c9", w: 0.3 });
    reg(hits, frontDoor.leaf, "door-front");
    const sideDoor = makeDoor(2.6, 0.6, Math.PI);
    holoTag(sideDoor.grp, "side door", 0, 2.1, 0.3, { css: "#7fd1c9", w: 0.28 });
    reg(hits, sideDoor.leaf, "door-side");
    const propWedge = group(g, -2.35, 0, -0.9);
    box(propWedge, 0.1, 0.06, 0.06, 0, 0.03, 0, 0xd8b23a, { rough: 0.7 });
    holoTag(propWedge, "prop it open?", 0, 0.16, 0, { css: "#e8622a", w: 0.36 });
    reg(hits, propWedge, "prop-door-open");

    // -------------------------------------------------------------- windows
    function makeWindow(x, z) {
      const grp = group(g, x, 0, z);
      box(grp, 0.05, 0.9, 1.1, 0, 1.5, 0, 0x8b929a, { rough: 0.4, metal: 0.5 });
      const pane = box(grp, 0.02, 0.7, 0.9, 0.02, 1.5, 0, 0x9fd8f2, { rough: 0.2, metal: 0.1, opacity: 0.55, transparent: true });
      return pane;
    }
    reg(hits, makeWindow(-2.68, 1.4), "window-1");
    reg(hits, makeWindow(2.68, -1.3), "window-2");

    // -------------------------------------------------------------- HVAC panel
    const hvacPanel = group(g, -1.0, 0, -1.95);
    box(hvacPanel, 0.5, 0.6, 0.16, 0, 1.15, 0, 0x4a545e, { rough: 0.55, metal: 0.35 });
    const hvacDial = cyl(hvacPanel, 0.07, 0.07, 0.03, 0, 1.25, 0.09, 0xdfe4e8, { rough: 0.4, metal: 0.4, seg: 16 });
    const hvacPointer = box(hvacPanel, 0.05, 0.006, 0.006, 0, 1.25, 0.11, SIP_ALERT, { rough: 0.5 });
    holoTag(hvacPanel, "HVAC control", 0, 1.5, 0, { css: "#7fd1c9", w: 0.34 });
    reg(hits, hvacDial, "hvac-control");
    const damperCheck = decal(hvacPanel, 0.14, 0.06, 0, 1.0, 0.09, signFace("DAMPER", { bg: "#0d1c24", accent: "#f2c14b", scale: 0.5 }), { glow: true, ei: 0.7 });
    reg(hits, damperCheck, "hvac-control-check");
    const freshAirSwitch = box(hvacPanel, 0.05, 0.03, 0.02, 0.16, 1.05, 0.09, 0xdfe4e8, { rough: 0.5 });
    holoTag(hvacPanel, "bring in fresh air?", 0.16, 0.95, 0.09, { css: "#e8622a", w: 0.42 });
    reg(hits, freshAirSwitch, "hvac-fresh-air");

    // -------------------------------------------------------------- air cleaner
    const cleaner = group(g, -0.3, 0, -1.0);
    box(cleaner, 0.34, 0.7, 0.3, 0, 0.35, 0, 0xece3d0, { rough: 0.5 });
    const cleanerDial = cyl(cleaner, 0.05, 0.05, 0.03, 0, 0.62, 0.16, 0x2b3138, { rough: 0.4, metal: 0.4, seg: 16 });
    holoTag(cleaner, "air cleaner", 0, 0.82, 0, { css: "#7fd1c9", w: 0.3 });
    reg(hits, cleanerDial, "air-cleaner-dial");

    // -------------------------------------------------------------- headcount tallies
    const tallySpots = [["count-room-a", "ROOM A", -1.6, 0.9], ["count-room-b", "ROOM B", -1.6, 1.6], ["count-hallway", "HALLWAY", -1.6, 2.2]];
    for (const [id, label, x, z] of tallySpots) {
      const post = group(g, x, 0, z);
      cyl(post, 0.02, 0.025, 0.9, 0, 0.45, 0, 0x53606b, { rough: 0.6, metal: 0.3, seg: 8 });
      const tile = decal(post, 0.2, 0.12, 0, 0.92, 0, signFace(label, { bg: "#0d1c1a", accent: "#7fd1c9", scale: 0.42 }), { px: 128 });
      reg(hits, tile, id);
    }
    const skipCountSign = decal(g, 0.24, 0.14, -1.1, 0.7, 1.6, paperFace("SHORTCUT", ["assume the rest", "are accounted for"], { bg: "#f4e9d8", band: "#b81410" }), { px: 160 });
    holoTag(g, "skip a room?", -1.1, 0.86, 1.6, { css: "#e8622a", w: 0.4 });
    reg(hits, skipCountSign, "skip-headcount-room");

    // -------------------------------------------------------------- radio + phones
    const deskA = group(g, 0.7, 0, -1.9);
    box(deskA, 0.8, 0.7, 0.45, 0, 0.35, 0, 0x5a4a36, { rough: 0.6 });
    const handset = group(deskA, -0.2, 0.71, 0);
    box(handset, 0.12, 0.05, 0.06, 0, 0, 0, 0x2b3138, { rough: 0.5, metal: 0.4 });
    holoTag(deskA, "radio handset", -0.2, 0.86, 0, { css: "#7fd1c9", w: 0.3 });
    reg(hits, handset, "radio-handset");
    const hotline = group(deskA, 0.1, 0.71, 0);
    box(hotline, 0.1, 0.14, 0.06, 0, 0.07, 0, 0xf2c14b, { rough: 0.6 });
    holoTag(deskA, "hotline phone", 0.1, 0.9, 0, { css: "#7fd1c9", w: 0.3 });
    reg(hits, hotline, "hotline-phone");
    const airDistrict = group(deskA, 0.32, 0.71, 0);
    box(airDistrict, 0.1, 0.14, 0.06, 0, 0.07, 0, 0x3a8fd0, { rough: 0.6 });
    holoTag(deskA, "Air District line", 0.32, 0.9, 0, { css: "#7fd1c9", w: 0.4 });
    reg(hits, airDistrict, "air-district-line");

    // -------------------------------------------------------------- residents
    const residentOxygen = standingFigure(g, 1.6, 1.4, { ry: -1.9, cloth: 0x4a5566, atStation: true });
    const oxyTank = cyl(residentOxygen, 0.05, 0.05, 0.4, 0.25, 0.35, 0.1, 0xdfe4e8, { rough: 0.4, metal: 0.4, seg: 12 });
    holoTag(residentOxygen, "on supplemental oxygen", 0, 1.9, 0, { css: "#7fd1c9", w: 0.42 });
    reg(hits, residentOxygen, "resident-oxygen");
    const residentInhaler = standingFigure(g, 1.9, 0.6, { ry: -1.5, cloth: 0x8a6a4a, atStation: true });
    holoTag(residentInhaler, "carries a rescue inhaler", 0, 1.9, 0, { css: "#7fd1c9", w: 0.44 });
    reg(hits, residentInhaler, "resident-inhaler");
    const ignoreSign = group(g, 1.8, 0, 1.0);
    ball(ignoreSign, 0.03, 0, 1.0, 0, 0xe8622a, { rough: 0.5 });
    holoTag(ignoreSign, "check them after the log?", 0, 1.2, 0, { css: "#e8622a", w: 0.5 });
    reg(hits, ignoreSign, "ignore-oxygen-resident");
    const backupOxygen = group(g, 2.2, 0, 1.2);
    cyl(backupOxygen, 0.05, 0.05, 0.5, 0, 0.25, 0, 0xdfe4e8, { rough: 0.4, metal: 0.4, seg: 12 });
    holoTag(backupOxygen, "backup oxygen cylinder", 0, 0.55, 0, { css: "#7fd1c9", w: 0.44 });
    reg(hits, backupOxygen, "backup-oxygen-cylinder");

    // -------------------------------------------------------------- indoor monitor
    const monitorPost = group(g, 0.6, 0, -0.2);
    cyl(monitorPost, 0.025, 0.03, 1.3, 0, 0.65, 0, 0x53606b, { rough: 0.6, metal: 0.3, seg: 10 });
    const indoorMonitor = instrument(monitorPost, 0, 1.32, 0, { idle: "-- PM", color: SIP_ACCENT, w: 0.14, d: 0.2 });
    holoTag(monitorPost, "indoor air monitor", 0, 1.52, 0, { css: "#7fd1c9", w: 0.4 });
    reg(hits, indoorMonitor, "indoor-monitor-panel");

    // -------------------------------------------------------------- loading door
    const loadingDoor = group(g, 0, 0, 2.15);
    box(loadingDoor, 1.6, 0.06, 0.1, 0, 0.03, 0, 0x6f7a83, { rough: 0.6, metal: 0.4, cast: false });
    const loadingLeaf = box(loadingDoor, 1.5, 1.8, 0.07, 0, 0.9, 0, 0x59636d, { rough: 0.55, metal: 0.4 });
    holoTag(loadingDoor, "loading door", 0, 2.0, 0, { css: "#7fd1c9", w: 0.32 });
    reg(hits, loadingLeaf, "loading-door");

    // -------------------------------------------------------------- all-clear + log
    const allClearPanel = holoPanel(g, 0.85, 0.5, -1.9, 1.5, 1.2, (cx, w, h) => {
      cx.fillStyle = "rgba(8,20,20,0.9)"; cx.fillRect(0, 0, w, h);
      cx.fillStyle = "#7fd1c9"; cx.fillRect(0, 0, w, 5);
      cx.fillStyle = "#e2f7f4";
      cx.font = `600 ${Math.round(h * 0.12)}px 'Barlow Condensed', Arial, sans-serif`;
      cx.textAlign = "left"; cx.textBaseline = "middle";
      cx.fillText("ALL-CLEAR STATUS", w * 0.06, h * 0.16);
      cx.font = `${Math.round(h * 0.09)}px Arial, sans-serif`; cx.fillStyle = "#c3ede6";
      cx.fillText("Awaiting confirmed message", w * 0.06, h * 0.5);
    }, { ry: 0.4, accent: SIP_ACCENT });
    reg(hits, allClearPanel, "all-clear-panel");

    const logDesk = group(g, -1.9, 0, 1.6);
    box(logDesk, 0.7, 0.65, 0.4, 0, 0.325, 0, 0x5a4a36, { rough: 0.65 });
    const drillLog = box(logDesk, 0.24, 0.02, 0.3, 0, 0.68, 0, 0xece3d0, { rough: 0.75 });
    decal(logDesk, 0.22, 0.28, 0, 0.692, 0, signFace("DRILL LOG", { bg: "#0d1c1a", accent: "#7fd1c9", scale: 0.4 })).rotation.x = -Math.PI / 2;
    holoTag(logDesk, "drill log", 0, 0.9, 0, { css: "#7fd1c9", w: 0.3 });
    reg(hits, drillLog, "drill-log");

    // -------------------------------------------------------------- dressing
    for (const [x, z] of [[-0.7, 0.4], [-0.2, 0.9], [0.3, 1.3]]) {
      const chair = group(g, x, 0, z, Math.random() * Math.PI * 2);
      box(chair, 0.34, 0.03, 0.34, 0, 0.42, 0, 0x2b3138, { rough: 0.6 });
      box(chair, 0.34, 0.4, 0.03, 0, 0.62, -0.16, 0x2b3138, { rough: 0.6 });
      for (const [lx, lz] of [[-0.14, -0.14], [0.14, -0.14], [-0.14, 0.14], [0.14, 0.14]]) {
        cyl(chair, 0.011, 0.011, 0.4, lx, 0.2, lz, 0x1a1e23, { rough: 0.6, metal: 0.4, seg: 8 });
      }
    }
    const shelfUnit = group(g, 2.6, 0, -1.6);
    for (let s = 0; s < 3; s++) {
      box(shelfUnit, 0.5, 0.02, 0.24, 0, 0.5 + s * 0.34, 0, 0x4a3c28, { rough: 0.7 });
      for (let b = 0; b < 4; b++) box(shelfUnit, 0.03, 0.2, 0.16, -0.18 + b * 0.12, 0.6 + s * 0.34, 0, [0x8b402f, 0x2f6f4a, 0x2f4d8a, 0x8a7a2f][b], { rough: 0.7 });
    }
    const wallClock = torus(g, 0.16, 0.012, 2.0, 1.5, -2.0, 0x8a939b, { rough: 0.4, metal: 0.5, seg: 10, seg2: 20 });
    void wallClock;

    standingFigure(g, -0.4, 1.65, { ry: 0.5, cloth: 0x37505f, vest: SIP_ACCENT });
    standingFigure(g, 1.0, -1.3, { ry: -0.6, cloth: 0x445566 });

    let doorAjar = false, oxygenLow = false;

    return {
      hits,
      spawnLook: new THREE.Vector3(-0.2, 1.3, -0.6),
      onStep() {},

      onStepComplete(step) {
        if (step.id === "close-openings") {
          frontDoor.leaf.rotation.y = 0.9; sideDoor.leaf.rotation.y = -0.9;
        }
        if (step.id === "hvac-recirculate") { hvacPointer.rotation.z = Math.PI / 2; }
        if (step.id === "air-cleaner-level") { repaint(indoorMonitor.userData.screen, signFace("FILTERING", { bg: "#0d1c1a", accent: "#59c97b", fg: "#eafcf9", scale: 0.45 })); }
        if (step.id === "all-clear-received") {
          repaint(allClearPanel.userData.face, (cx, w, h) => {
            cx.fillStyle = "rgba(8,20,20,0.9)"; cx.fillRect(0, 0, w, h); cx.fillStyle = "#59c97b"; cx.fillRect(0, 0, w, 5);
            cx.fillStyle = "#eafcf1"; cx.font = `600 ${Math.round(h * 0.14)}px 'Barlow Condensed', Arial, sans-serif`;
            cx.textAlign = "left"; cx.textBaseline = "middle";
            cx.fillText("ALL CLEAR CONFIRMED", w * 0.06, h * 0.4);
          });
        }
        if (step.id === "reopen-openings") { frontDoor.leaf.rotation.y = 0; sideDoor.leaf.rotation.y = 0; }
      },

      onInterrupt(it) {
        if (it.id === "loading-door-opened") { doorAjar = true; loadingLeaf.rotation.y = 0.7; }
        if (it.id === "oxygen-running-low") { oxygenLow = true; oxyTank.material = mat(0xf0645b, { emissive: 0xf0645b, ei: 1.4, rough: 0.4, metal: 0.4 }); }
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "loading-door-opened") { doorAjar = false; loadingLeaf.rotation.y = 0; }
        if (it.id === "oxygen-running-low") { oxygenLow = false; oxyTank.material = mat(0xdfe4e8, { rough: 0.4, metal: 0.4 }); }
      },

      onHazard() {},

      animate(t, dt, session) {
        void t; void dt;
        alertLamp.material.emissiveIntensity = 1.4 + Math.sin(t * 3) * 0.6;
        if (doorAjar) loadingLeaf.rotation.y = 0.7 + Math.sin(t * 2) * 0.03;
        void oxygenLow;
        const tr = session?.track;
        if (tr && session.step?.id === "monitor-indoor-air") {
          repaint(indoorMonitor.userData.screen, signFace(`${Math.round(tr.v * 100)} PM`, { bg: "#0d1c1a", accent: tr.v <= 0.35 ? "#59c97b" : "#f0645b", fg: "#eafcf9", scale: 0.55 }));
        }
        const gg = session?.gauge;
        if (gg && !gg.committed && session.step?.id === "air-cleaner-level") {
          repaint(indoorMonitor.userData.screen, signFace(`${Math.round(gg.t * 300)} CFM`, { bg: "#0d1c1a", accent: gg.t >= 0.72 && gg.t <= 0.92 ? "#59c97b" : "#f2c14b", fg: "#eafcf9", scale: 0.5 }));
        }
      },
    };
  },
};
