import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, ball, decal, repaint, signFace, paperFace, mat, standingFigure,
} from "../../../shared/kit.js";
import {
  stationPad, holoPanel, holoTag, instrument, reg,
} from "../citykit.js";
import { cabinInterior } from "../../../shared/equipment.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Cabin Pre-Flight Safety Check VR — Airline Cabin and Flight
// Crew, station one. The walk every flight attendant runs before the first
// passenger ever boards: the emergency equipment counted against its own
// placard, the door and its slide armed and cross-checked with the crew
// member across the aisle, the exits and the aisle proven clear, and the
// cabin declared secure to the flight deck only once every one of those is
// actually true — never assumed because yesterday's flight looked the same.
// Nothing here is a clinical or a regulatory number this platform is not
// certain of: quantities, positions and sequence all read "per the
// checklist" and "per the airline's procedure."

const CACPS_ACCENT = 0x2f8fdb;

export const SIM_CA_CABIN_PREFLIGHT_SAFETY_CHECK = {
  id: "ca-cabin-preflight-safety-check",
  index: "ca-1",
  domain: "Aviation",
  trade: "Flight attendant — AFA-CWA cabin crew",
  category: "Mobility & Transit",
  certification: "AFA-CWA cabin-safety training; the airline's own cabin-safety checklist and door-arming procedure under 14 CFR 121; OSHA 29 CFR 1910.151 medical services and first aid for the equipment this check counts",
  name: "Cabin Pre-Flight Safety Check",
  title: simTitle("Cabin Pre-Flight Safety Check"),
  tagline: "Emergency equipment counted against its own placard, the door armed and cross-checked with the crew member across the aisle, the exits and aisle proven clear, and the cabin declared secure only once every one of those is actually true",
  accent: CACPS_ACCENT,
  accentCss: "#2f8fdb",
  parSeconds: 330,
  footprint: 2.6,
  badge: { id: "cabin-secure", name: "Cabin Secure", note: "Every emergency item counted, the door armed and cross-checked, the exits proven clear, and the flight deck told the cabin is ready — nothing assumed" },

  supportLine: "your AFA-CWA local's member assistance resources, or the airline's own employee assistance line — a rushed turn that still has to come out right on every check is its own kind of pressure",

  game: system({
    name: "Cabin Secure",
    currency: "CHECK",
    ranks: ["New Flight Attendant", "Line Qualified", "Lead Flight Attendant", "Purser", "Cabin Secure Certified"],
    badges: [
      { id: "kit-counted", name: "Kit Counted", note: "Every emergency item verified against its own placard", test: AWARD.stepClean("equipment-check") },
      { id: "door-crosschecked", name: "Door Cross-Checked", note: "The door armed and the cross-check actually confirmed", test: AWARD.stepClean("crosscheck-confirm") },
      { id: "aisle-clear", name: "Aisle Clear Certified", note: "The exits and the aisle proven clear before the door was ever armed", test: AWARD.stepClean("scan-cabin") },
    ],
    challenges: [
      { id: "clean-shift", name: "Clean Turn", note: "No corrections anywhere in the check", test: AWARD.clean },
      { id: "steady-watch", name: "Steady Watch", note: "Held the cabin-temperature check the full count, first try", test: AWARD.unbroken },
      { id: "fast-check", name: "Fast Turn", note: "Complete inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "bag-in-exit-row-hazard": "That carry-on is sitting in the exit-row floor space. An exit row with anything in its own floor space is an exit that does not actually open the way it is supposed to the one time it is ever needed, and this check exists specifically to catch that before the door is ever armed.",
    "unlatched-bin-hazard": "That overhead bin over the exit row is not latched. A bin that lets go in turbulence or a hard landing drops its contents straight into the same aisle an evacuation would need, and a bin over an exit gets checked here for exactly that reason.",
    "expired-extinguisher-tag-hazard": "That fire extinguisher's inspection tag is past its date. An extinguisher nobody has confirmed still holds pressure is an extinguisher this crew is trusting on faith, and faith is not what the daily equipment check exists to replace.",
    "missing-flashlight-hazard": "That flashlight bracket is empty. A flashlight missing from its own bracket is the one item every evacuation checklist calls for by name in a cabin that has just lost its lights, and it gets replaced now, not discovered empty during an actual emergency.",
  },

  lateNotes: {
    "door-arm-lever": "Not yet — the cabin scan and the equipment count come first. A door armed before the aisle is actually confirmed clear is a step taken out of order.",
    "interphone": "Hold that call. The cross-check has to actually be confirmed before the flight deck hears the cabin is secure.",
  },

  steps: [
    {
      id: "pull-checklist", kind: "select", target: "cabin-checklist-board",
      title: "Pull the cabin safety checklist",
      cue: "Open today's cabin safety checklist before touching anything else.",
      why: "The checklist is what turns a walk down the aisle into a check somebody can actually be held to afterward — starting from memory instead of the card is exactly how a step quietly gets skipped without anyone noticing until it matters.",
    },
    {
      id: "scan-cabin", kind: "find", noHint: true,
      targets: ["bag-in-exit-row", "unlatched-bin"],
      itemNames: { "bag-in-exit-row": "a bag left in the exit-row floor space", "unlatched-bin": "an unlatched overhead bin over an exit" },
      itemNotes: {
        "bag-in-exit-row": "Nothing sits in an exit row's own floor space, whatever it is or whoever it belongs to — it gets moved before this check goes any further, not noted for later.",
        "unlatched-bin": "A bin that isn't fully latched over an exit gets closed and confirmed now, while it costs nothing, instead of being found open the moment turbulence or a hard landing tests it.",
      },
      title: "Scan the cabin before boarding",
      cue: "Two things about this cabin aren't right yet. Find them before the first passenger boards.",
      why: "This scan happens before boarding for a reason: everything it catches is free to fix right now and expensive to discover once the cabin is full of people and the door is already being armed.",
    },
    {
      id: "equipment-check", kind: "sequence", anyOrder: true,
      targets: ["fire-extinguisher-check", "flashlight-check", "megaphone-check", "first-aid-kit-check"],
      itemNames: {
        "fire-extinguisher-check": "fire extinguisher, tag current",
        "flashlight-check": "flashlight, in its bracket and working",
        "megaphone-check": "megaphone, present",
        "first-aid-kit-check": "first aid kit, seal intact",
      },
      title: "Count the emergency equipment",
      cue: "Verify each item on the placard against what's actually mounted in the cabin.",
      why: "The placard names exactly what has to be in this cabin and where, and counting each item against it is the only way to know all of it is actually there rather than assumed present because it usually is.",
    },
    {
      id: "flashlight-test", kind: "hold", target: "flashlight-test-button", seconds: 5,
      title: "Test the flashlight",
      cue: "Hold the test button and confirm the flashlight actually lights.",
      why: "A flashlight that looks fine in its bracket and a flashlight that actually lights are two different facts, and the only way to know the second one is true is to press the button and watch it happen, not take the first one on faith.",
      holdBreakNote: "Let go before the test actually confirmed the light. A flashlight test that stops early proves nothing either way.",
    },
    {
      id: "o2-bottle-check", kind: "turn", target: "o2-bottle-valve",
      title: "Confirm the portable oxygen bottle",
      cue: "Turn the valve indicator to read the bottle's pressure against the placard's full mark.",
      turn: { turns: 0.3, axis: "y", label: "O2 PRESSURE" },
      why: "A portable oxygen bottle reads full or it doesn't, and there is no partial credit for a bottle that looks stowed correctly but was never actually checked against its own gauge before the cabin was declared ready.",
    },
    {
      id: "cabin-temp-watch", kind: "track", target: "cabin-temp-gauge", seconds: 6,
      title: "Watch the cabin temperature settle",
      cue: "Keep an eye on the cabin temperature readout until it settles in the comfort band before boarding.",
      track: { start: 0.3, green: [0.42, 0.62], rise: 0.3, fall: 0.28, drift: 0.1, label: "CABIN TEMP", readout: (v) => (v < 0.42 ? "too cold" : v > 0.62 ? "too warm" : "in band") },
      why: "A cabin that boards too hot or too cold turns into a stream of individual requests the moment people are seated with nowhere else to go — catching it on the ground, before a single passenger is aboard, is the only point it is still a two-minute fix.",
      holdBreakNote: "Out of the comfort band when boarding started. That becomes forty individual complaints instead of one adjustment made early.",
    },
    {
      id: "stage-demo-kit", kind: "drag", target: "demo-kit",
      title: "Stage the safety demonstration kit",
      cue: "Bring the demonstration life vest and seatbelt to the briefing seat.",
      why: "The demonstration kit staged at the briefing seat now is the kit that is actually ready when the safety briefing starts, rather than something still being dug out of a bin while passengers are already watching.",
      drag: { to: "briefing-seat-spot", radius: 0.45, missNote: "Not at the briefing seat — the demo kit has to actually be in position before the briefing can start on time." },
    },
    {
      id: "exit-row-briefing", kind: "select", target: "exit-row-briefing-card",
      title: "Brief the exit row",
      cue: "Confirm the exit-row passengers meet the criteria on the briefing card and are willing and able to assist.",
      why: "An exit row is only worth what the people sitting in it are actually able and willing to do, and that gets confirmed by asking, out loud, before departure — never assumed from how capable someone happens to look.",
    },
    {
      id: "arm-door", kind: "select", target: "door-arm-lever",
      title: "Arm the door",
      cue: "Move the door's arming lever to the armed position per the checklist.",
      why: "An armed door is what turns the slide into an evacuation slide the instant that door opens — a door left in the disarmed position at the gate is exactly correct for boarding and exactly wrong for the sequence this checklist is about to move into.",
    },
    {
      id: "crosscheck-confirm", kind: "hold", target: "crosscheck-panel", seconds: 4,
      title: "Cross-check with the door across the aisle",
      cue: "Hold the cross-check confirmation while the crew member at the opposite door verifies both doors together.",
      why: "One person confirming their own work is one person who can miss their own mistake — holding the confirmation open long enough for the crew member across the aisle to actually check the same door from outside your own blind spot is what a cross-check catches that a solo, instant tap never would.",
      holdBreakNote: "Released the confirmation before the crew member across the aisle actually finished verifying. A cross-check cut short is a cross-check that never really happened.",
    },
    {
      id: "reseat-exit-row", kind: "select", target: "exit-row-briefing-card",
      title: "Confirm the reseated passenger",
      cue: "Re-brief whoever is now sitting in the exit row before the door sequence continues.",
      why: "An exit-row seat that changes hands resets the briefing to zero — the new passenger's own willingness and ability get confirmed the same way the first one's did, not carried over from a conversation they were never part of.",
    },
    {
      id: "log-cabin-secure", kind: "hold", target: "log-cabin-secure", seconds: 4,
      title: "Log the cabin secure",
      cue: "Hold to confirm and save the log entry — the checklist, the door status and the equipment count together.",
      why: "The log is the only record that this specific check happened on this specific flight — a cabin that was actually checked perfectly but never logged leaves nothing behind for anyone downstream to point to.",
      holdBreakNote: "Let go before the entry actually saved. A log that never finished writing is no different from one that was never opened.",
    },
    {
      id: "notify-flight-deck", kind: "select", target: "interphone",
      title: "Notify the flight deck",
      cue: "Call the flight deck on the interphone and report the cabin secure for departure.",
      why: "The flight deck's own decision to push back rests in part on hearing this call — a cabin that is actually ready but never reported ready is, from the flight deck's own seat, indistinguishable from a cabin that isn't.",
    },
  ],

  interrupts: [
    {
      id: "late-bag-through-door",
      kind: "Last-minute bag at the door",
      after: "crosscheck-confirm", delay: 3, seconds: 12,
      alert: "A gate agent hands a last-minute bag through the door right after the cross-check is confirmed.",
      cue: "That gets stowed before anything else continues.",
      target: "stage-demo-kit-stow",
      why: "Anything that comes aboard after the cross-check is confirmed has not passed the scan that already cleared this cabin — it gets stowed properly and accounted for before the sequence is allowed to keep moving, not tossed into whatever space is closest.",
      missNote: "The bag sat unstowed while the check moved on around it. An unstowed item at departure is exactly the loose object this whole scan exists to catch.",
      wrongNote: "Stow the bag first — a late item doesn't get to skip the same standard everything else on this cabin already met.",
    },
    {
      id: "exit-row-swap-request",
      kind: "Exit-row seat swap at the door",
      after: "arm-door", delay: 3, seconds: 12,
      alert: "A passenger asks to swap into the exit row right as the door sequence is underway.",
      cue: "That swap has to be re-briefed before it's approved.",
      target: "exit-row-briefing-card",
      why: "An exit-row swap approved without a fresh briefing hands that seat to someone whose willingness and ability were never actually confirmed — the door sequence being underway is not a reason to skip the one question that seat depends on.",
      missNote: "The swap went ahead unbriefed. Whoever is sitting in that exit row now has never once been asked if they can actually do what it needs.",
      wrongNote: "Re-brief the exit row — a swap doesn't inherit the first passenger's own confirmation.",
    },
  ],

  build(root) {
    const hits = {};
    const g = root;
    stationPad(g, 2.6, CACPS_ACCENT);

    const cabin = cabinInterior(g, 0, 0, 0, { livery: { colour: 0x2a5a86 } });
    const { overheadBinL, overheadBinR, galley, galleyCart, door } = cabin.userData.parts;
    holoTag(cabin, "cabin section", 0, 2.5, 1.6, { css: "#2f8fdb", w: 0.4 });

    // ------------------------------------------------------------- door + arming
    reg(hits, door, "arm-door");
    const armLever = box(door, 0.05, 0.14, 0.03, -0.06, 0.9, 0.1, 0xf2c14b, { rough: 0.5, metal: 0.2 });
    reg(hits, armLever, "door-arm-lever");
    const crosscheckPanel = instrument(g, 1.3, 1.4, 1.5, { idle: "CHECK?", color: CACPS_ACCENT, w: 0.16, d: 0.2, ry: -0.6 });
    holoTag(crosscheckPanel, "cross-check panel", 0, 0.2, 0, { css: "#2f8fdb", w: 0.4 });
    reg(hits, crosscheckPanel, "crosscheck-panel");

    const checklistBoard = decal(g, 0.3, 0.4, -1.2, 1.3, -1.7,
      paperFace("CABIN SAFETY CHECK", ["Equipment · Doors", "Exits · Cross-check"], { bg: "#fbf3df", band: "#1c5a86" }), { px: 220 });
    reg(hits, checklistBoard, "cabin-checklist-board");

    // ------------------------------------------------------------- exit row / bag / bin
    const bagInExitRow = box(g, 0.28, 0.2, 0.18, -0.7, 0.11, -1.55, 0x5a4a2a, { rough: 0.7 });
    holoTag(bagInExitRow, "bag in exit row", 0, 0.22, 0, { css: "#f0645b", w: 0.5 });
    reg(hits, bagInExitRow, "bag-in-exit-row");
    reg(hits, bagInExitRow, "bag-in-exit-row-hazard");

    const unlatchedBinMark = box(overheadBinR, 0.06, 0.06, 0.06, 0, -0.25, 0.4, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(unlatchedBinMark, "bin not latched", 0, 0.08, 0, { css: "#f0645b", w: 0.44 });
    reg(hits, unlatchedBinMark, "unlatched-bin");
    reg(hits, unlatchedBinMark, "unlatched-bin-hazard");
    void overheadBinL;

    const exitRowCard = decal(g, 0.26, 0.18, 1.5, 1.0, -1.2,
      paperFace("EXIT ROW", ["Willing? Able?"], { bg: "#eaf1f5", band: "#1c5a86" }), { px: 180 });
    reg(hits, exitRowCard, "exit-row-briefing-card");

    // ------------------------------------------------------------- emergency equipment
    const extinguisher = cyl(g, 0.08, 0.08, 0.4, -1.35, 0.2, -0.8, 0xd8342a, { rough: 0.5, metal: 0.2, seg: 14 });
    holoTag(extinguisher, "fire extinguisher", 0, 0.24, 0, { css: "#2f8fdb", w: 0.4 });
    reg(hits, extinguisher, "fire-extinguisher-check");
    const extinguisherTag = decal(g, 0.08, 0.06, -1.3, 0.42, -0.8,
      paperFace("", ["INSP: EXPIRED"], { bg: "#fbe0df", band: "#c9302b" }), { px: 120 });
    reg(hits, extinguisherTag, "expired-extinguisher-tag-hazard");

    const flashlightBracket = box(g, 0.08, 0.03, 0.03, 1.35, 0.5, -0.9, 0x2b2f34, { rough: 0.5, metal: 0.3 });
    holoTag(flashlightBracket, "flashlight bracket", 0, 0.08, 0, { css: "#2f8fdb", w: 0.4 });
    reg(hits, flashlightBracket, "flashlight-check");
    reg(hits, flashlightBracket, "missing-flashlight-hazard");
    const flashlightTestBtn = ball(g, 0.02, 1.35, 0.56, -0.9, 0xf2c14b, { rough: 0.4, emissive: 0xf2c14b, ei: 0.5, seg: 10 });
    reg(hits, flashlightTestBtn, "flashlight-test-button");

    const megaphone = box(g, 0.16, 0.18, 0.24, -1.35, 0.55, -1.2, 0xf2c14b, { rough: 0.6 });
    holoTag(megaphone, "megaphone", 0, 0.2, 0, { css: "#2f8fdb", w: 0.32 });
    reg(hits, megaphone, "megaphone-check");

    const firstAidKit = box(galley, 0.3, 0.15, 0.2, 0, 1.2, 0.1, 0xeaf1f5, { rough: 0.5 });
    decal(galley, 0.26, 0.1, 0, 1.2, 0.21, signFace("SEALED", { bg: "#123a1e", accent: "#59c97b", scale: 0.42 }), { px: 96 });
    reg(hits, firstAidKit, "first-aid-kit-check");
    void galleyCart;

    // ------------------------------------------------------------- O2 bottle, temp, demo, cross-check
    const o2Bottle = cyl(g, 0.08, 0.08, 0.5, 1.35, 0.3, -1.55, 0x59c9a0, { rough: 0.4, metal: 0.3, seg: 14 });
    const o2Gauge = instrument(g, 1.35, 0.57, -1.55, { idle: "-- %", color: CACPS_ACCENT, w: 0.1, d: 0.14, ry: -1.2 });
    holoTag(o2Bottle, "portable O2 bottle", 0, 0.3, 0, { css: "#2f8fdb", w: 0.4 });
    reg(hits, o2Gauge, "o2-bottle-valve");

    const tempGauge = instrument(g, 1.35, 1.7, 0.4, { idle: "-- °", color: CACPS_ACCENT, w: 0.13, d: 0.18, ry: -1.2 });
    holoTag(tempGauge, "cabin temperature", 0, 0.16, 0, { css: "#2f8fdb", w: 0.42 });
    reg(hits, tempGauge, "cabin-temp-gauge");

    const demoKit = box(g, 0.3, 0.1, 0.22, -1.3, 0.5, 0.9, 0xf2c14b, { rough: 0.6 });
    holoTag(demoKit, "demo kit", 0, 0.14, 0, { css: "#2f8fdb", w: 0.3 });
    reg(hits, demoKit, "demo-kit");
    const briefingSeatSpot = box(g, 0.4, 0.02, 0.4, 0.1, 0.001, 1.0, 0xffffff, { opacity: 0.001, transparent: true, cast: false });
    hits["briefing-seat-spot"] = briefingSeatSpot;
    const stowSpot = box(galley, 0.4, 0.15, 0.2, 0, 1.2, -0.15, 0xffffff, { opacity: 0.001, transparent: true, cast: false });
    hits["stage-demo-kit-stow"] = stowSpot;

    const logPanel = holoPanel(g, 0.5, 0.34, -1.3, 1.6, 0.3, (ctx, w, h) => {
      ctx.fillStyle = "rgba(6,20,30,0.9)"; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#2f8fdb"; ctx.fillRect(0, 0, w, 5);
      ctx.fillStyle = "#eaf6fb";
      ctx.font = `600 ${Math.round(h * 0.12)}px 'Barlow Condensed', Arial, sans-serif`;
      ctx.textAlign = "left"; ctx.textBaseline = "middle";
      ctx.fillText("CABIN CHECK LOG", w * 0.06, h * 0.25);
      ctx.font = `${Math.round(h * 0.09)}px Arial, sans-serif`;
      ctx.fillText("Status: in progress", w * 0.06, h * 0.6);
    }, { accent: CACPS_ACCENT, ry: 0.6 });
    reg(hits, logPanel, "log-cabin-secure");

    const interphone = box(g, 0.1, 0.16, 0.06, 1.4, 1.1, 1.7, 0x2b2f34, { rough: 0.5, metal: 0.3 });
    holoTag(interphone, "interphone", 0, 0.14, 0, { css: "#2f8fdb", w: 0.36 });
    reg(hits, interphone, "interphone");

    const attendant = standingFigure(g, -0.4, 1.35, { ry: 1.6, cloth: 0x1c3a5c, skin: 0xb98a63 });
    const partner = standingFigure(g, 0.65, 1.3, { ry: -1.6, cloth: 0x1c3a5c, skin: 0xd9a985 });
    void partner;

    return {
      hits,
      footprint: 2.6,
      spawnLook: new THREE.Vector3(0, 1.3, 0.4),

      onStepComplete(step) {
        if (step.id === "scan-cabin") { bagInExitRow.material = mat(0x59c97b, { rough: 0.7 }); unlatchedBinMark.visible = false; }
        if (step.id === "flashlight-test") flashlightTestBtn.material = mat(0x59c97b, { emissive: 0x59c97b, ei: 1.2 });
        if (step.id === "arm-door") armLever.material = mat(0xd2312b, { rough: 0.5, metal: 0.2 });
        if (step.id === "crosscheck-confirm") repaint(crosscheckPanel.userData.screen, signFace("CHECKED", { bg: "#0d1c24", accent: "#59c97b", fg: "#bfeaf7", scale: 0.5 }));
        if (step.id === "log-cabin-secure") {
          repaint(logPanel.userData.face, (ctx, w, h) => {
            ctx.fillStyle = "rgba(6,20,30,0.9)"; ctx.fillRect(0, 0, w, h);
            ctx.fillStyle = "#2f8fdb"; ctx.fillRect(0, 0, w, 5);
            ctx.fillStyle = "#eaf6fb";
            ctx.font = `600 ${Math.round(h * 0.12)}px 'Barlow Condensed', Arial, sans-serif`;
            ctx.textAlign = "left"; ctx.textBaseline = "middle";
            ctx.fillText("CABIN CHECK LOG", w * 0.06, h * 0.25);
            ctx.font = `${Math.round(h * 0.09)}px Arial, sans-serif`;
            ctx.fillText("Status: complete · secure", w * 0.06, h * 0.6);
          });
        }
        if (step.id === "notify-flight-deck") interphone.material = mat(0x59c97b, { rough: 0.5, metal: 0.3, emissive: 0x59c97b, ei: 0.4 });
      },

      onInterrupt(it) {
        if (it.id === "late-bag-through-door") stowSpot.material = mat(0xf0645b, { opacity: 0.4, transparent: true });
        if (it.id === "exit-row-swap-request") exitRowCard.material.emissiveIntensity = 1.4;
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "late-bag-through-door") stowSpot.material = mat(0xffffff, { opacity: 0.001, transparent: true });
        if (it.id === "exit-row-swap-request") exitRowCard.material.emissiveIntensity = 1;
      },

      onHazard() {},

      animate(t, dt, session) {
        void dt;
        const gg = session?.gauge, tk = session?.track;
        if (gg && !gg.committed && session.step?.id === "o2-bottle-check") {
          repaint(o2Gauge.userData.screen, signFace(`${Math.round(gg.t * 100)}%`, {
            bg: "#0d1c24", accent: gg.t > 0.8 ? "#59c97b" : "#f0645b", fg: "#bfeaf7", scale: 0.55,
          }));
        }
        if (tk && session.step?.id === "cabin-temp-watch") {
          repaint(tempGauge.userData.screen, signFace(tk.readout ?? "--", {
            bg: "#0d1c24", accent: tk.inBand ? "#59c97b" : "#f0645b", fg: "#bfeaf7", scale: 0.5,
          }));
        }
        void t;
      },
    };
  },
};
