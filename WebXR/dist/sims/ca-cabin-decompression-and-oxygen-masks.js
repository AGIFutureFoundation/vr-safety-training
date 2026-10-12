import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, ball, decal, repaint, signFace, paperFace, mat, standingFigure, seatedFigure,
} from "../../../shared/kit.js";
import {
  stationPad, holoPanel, holoTag, instrument, reg,
} from "../citykit.js";
import { cabinInterior } from "../../../shared/equipment.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Cabin Decompression and Oxygen Mask Drill VR — Airline Cabin
// and Flight Crew, station five. The one sequence every safety briefing
// says out loud and this drill actually runs: this crew member's own mask
// goes on first, every single time, because a flight attendant who passes
// out trying to help somebody else's row helps nobody at all. From there
// it's the sweep down the aisle — the mask that never dropped, the child
// who needs a hand once the crew's own mask is already secure, the loose
// item that becomes a projectile the instant the aircraft pitches — no
// altitude, no descent rate and no oxygen duration this platform is not
// certain of: all of it runs "per the checklist."

const CADX_ACCENT = 0x4fb0d8;

export const SIM_CA_CABIN_DECOMPRESSION_AND_OXYGEN_MASKS = {
  id: "ca-cabin-decompression-and-oxygen-masks",
  index: "ca-5",
  domain: "Aviation",
  trade: "Flight attendant — AFA-CWA cabin crew",
  category: "Mobility & Transit",
  certification: "AFA-CWA cabin-safety training; the airline's own rapid decompression and emergency descent checklist under 14 CFR 121; OSHA 29 CFR 1910.151 medical services and first aid for the oxygen equipment this drill covers",
  name: "Cabin Decompression and Oxygen Mask Drill",
  title: simTitle("Cabin Decompression and Oxygen Mask Drill"),
  tagline: "This crew member's own mask on first, every time, then the sweep down the aisle for the mask that never dropped, the child who needs a hand, and the loose item that turns into a projectile — no altitude or descent number this platform is not certain of",
  accent: CADX_ACCENT,
  accentCss: "#4fb0d8",
  parSeconds: 340,
  footprint: 2.7,
  badge: { id: "cabin-repressurized", name: "Cabin Repressurized", note: "Own mask on first, every mask in the row confirmed, the loose items caught, and the cabin swept and logged once it was safe to move again" },

  supportLine: "your AFA-CWA local's member assistance resources, or the airline's own employee assistance line — a real decompression drill can bring back what an actual event felt like, and that's worth talking through",

  game: system({
    name: "Cabin Repressurized",
    currency: "O2",
    ranks: ["New Flight Attendant", "Line Qualified", "Lead Flight Attendant", "Purser", "Cabin Repressurized Certified"],
    badges: [
      { id: "own-mask-first", name: "Own Mask First", note: "Secured your own mask before touching anyone else's row", test: AWARD.stepClean("don-own-mask") },
      { id: "row-swept", name: "Row Swept", note: "Every mask in the cabin confirmed before moving on", test: AWARD.stepClean("scan-masks") },
      { id: "backup-o2-delivered", name: "Backup O2 Delivered", note: "The portable bottle reached the row with the failed compartment", test: AWARD.stepClean("assist-failed-mask") },
    ],
    challenges: [
      { id: "clean-drill", name: "Clean Drill", note: "No corrections anywhere in the drill", test: AWARD.clean },
      { id: "steady-watch", name: "Steady Watch", note: "Held the cabin-altitude watch the full count, first try", test: AWARD.unbroken },
      { id: "fast-drill", name: "Fast Drill", note: "Complete inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "own-mask-skipped-hazard": "That's a crew member reaching to help a passenger with their own mask still hanging unused. Every briefing says it for a reason: a crew member who passes out from hypoxia while helping someone else's row is one more person who now needs help, not one less problem in this cabin.",
    "mask-not-deployed-hazard": "That overhead compartment never dropped its mask. A compartment that stays shut is not a row that's fine — it's a row that needs the manual release pulled and, if that fails, a portable bottle brought to it directly.",
    "loose-laptop-hazard": "That laptop is still sitting open on the tray table. Anything not stowed becomes exactly what physics makes it the instant this aircraft pitches hard, and a heavy object flying loose in a cabin full of people reaching for their own masks is its own injury waiting to happen.",
    "child-unassisted-hazard": "That child's mask is hanging by their seat, not on their face. A child this age cannot always manage the mask alone even after the adult beside them has theirs on — this is exactly the row this crew's sweep exists to catch once their own mask is already secure.",
  },

  lateNotes: {
    "portable-o2-bottle": "Not yet — your own mask goes on first, before this crew moves to help anyone else's row.",
  },

  steps: [
    {
      id: "pull-checklist", kind: "select", target: "decompression-checklist-board",
      title: "Pull the decompression checklist",
      cue: "Open the rapid decompression and emergency descent checklist immediately.",
      why: "This is the one checklist a crew member has the least time to think through from memory — pulling it and running it in order is what keeps every step in the sequence the airline actually trained for, not whatever comes to mind first under pressure.",
    },
    {
      id: "don-own-mask", kind: "select", target: "crew-oxygen-mask",
      title: "Secure your own mask first",
      cue: "Put on your own oxygen mask and confirm flow before doing anything else.",
      why: "A crew member who cannot think clearly is a crew member who cannot help anyone, and the only way to stay useful to this whole cabin is securing your own oxygen before turning to help with a single other row.",
    },
    {
      id: "descent-command", kind: "sequence", anyOrder: false,
      targets: ["emergency-descent-pa", "seatbelt-sign-on"],
      itemNames: { "emergency-descent-pa": "make the emergency descent announcement", "seatbelt-sign-on": "confirm the seatbelt sign is on" },
      title: "Announce the descent, then confirm the sign",
      cue: "Make the emergency descent PA per the checklist, then confirm the seatbelt sign is illuminated.",
      why: "Passengers need to hear what's happening from this crew's own voice before anything else, and confirming the sign right after is what makes sure the instruction to stay seated is actually backed up by the cabin's own visible signal.",
      outOfOrderNote: "Announcement first, then the sign — the sign confirms an instruction that has to already have been given.",
    },
    {
      id: "scan-masks", kind: "find", noHint: true,
      targets: ["mask-not-deployed", "loose-laptop"],
      itemNames: { "mask-not-deployed": "an overhead compartment that never dropped its mask", "loose-laptop": "a laptop still open on a tray table" },
      itemNotes: {
        "mask-not-deployed": "This row gets the manual release pulled immediately — a mask that never dropped is not a row this crew can leave for later.",
        "loose-laptop": "This gets stowed or held down now — anything loose becomes a projectile the instant the aircraft pitches, and a tray table is not a secure place for it during a descent.",
      },
      title: "Sweep the cabin for what's wrong",
      cue: "Two things in this cabin aren't right for the descent. Find them once your own mask is already on.",
      why: "This sweep only starts once this crew member's own mask is secure — everything it catches, from a compartment that never dropped to an object still loose on a tray table, is a real hazard to whoever is sitting near it for the rest of the descent.",
    },
    {
      id: "assist-failed-mask", kind: "drag", target: "portable-o2-bottle",
      title: "Bring the portable bottle to the failed row",
      cue: "Carry the portable oxygen bottle to the row whose compartment never dropped.",
      why: "A row with no working mask has no oxygen at all until this crew physically brings a portable bottle to it — this happens the moment the failed compartment is found, not after the rest of the sweep is finished.",
      drag: { to: "failed-row-spot", radius: 0.45, missNote: "Not at the row — a bottle that never arrives is oxygen this row still doesn't have." },
    },
    {
      id: "hold-mask-on-passenger", kind: "hold", target: "portable-mask", seconds: 5,
      title: "Hold the mask in place and confirm flow",
      cue: "Hold the portable mask to the passenger's face and confirm oxygen is actually flowing.",
      why: "A mask held loosely against someone's face who cannot secure it themselves right now delivers nothing — holding it firmly in place long enough to actually confirm flow is the only way to know this row is getting oxygen at all.",
      holdBreakNote: "Let go before flow was actually confirmed. A mask that wasn't held long enough to check is a row this crew still doesn't know is getting oxygen.",
    },
    {
      id: "open-backup-cylinder", kind: "turn", target: "backup-o2-cylinder-valve",
      title: "Open the backup oxygen cylinder",
      cue: "Turn the backup cylinder's valve open per its own placard.",
      turn: { turns: 0.3, axis: "y", label: "BACKUP O2" },
      why: "The backup cylinder is what this crew reaches for once the fixed system alone isn't covering every row that needs it, and opening it correctly is a mechanical step the placard spells out, not a judgment call about how much any one passenger needs.",
    },
    {
      id: "check-o2-pressure", kind: "gauge", target: "o2-pressure-gauge-dx",
      title: "Read the backup cylinder's pressure",
      cue: "Check the pressure gauge before relying on the backup cylinder for the rest of the descent.",
      gauge: { label: "O2 PRESSURE", speed: 0.55, green: [0.5, 1.0], readout: (t) => (t < 0.5 ? "low — flag it" : "adequate"), missNote: "Moved on without confirming the backup cylinder actually had pressure. A crew relying on an unchecked cylinder is relying on a guess." },
      why: "A backup cylinder this crew is about to depend on for the rest of the descent needs its pressure actually confirmed, not assumed from how full it looked in the bracket.",
    },
    {
      id: "watch-cabin-altitude", kind: "track", target: "cabin-altitude-gauge", seconds: 7,
      title: "Watch the cabin altitude come back down",
      cue: "Keep an eye on the cabin altitude readout until it settles back into the normal band.",
      track: { start: 0.2, green: [0.45, 0.65], rise: 0.35, fall: 0.3, drift: 0.12, label: "CABIN ALT", readout: (v) => (v < 0.45 ? "still high" : v > 0.65 ? "overcorrected" : "normal") },
      holdBreakNote: "Lost track of the cabin altitude before it actually settled. This crew calls the all-clear off this reading, not off a feeling that things seem calmer.",
      why: "The decision to stand up and move through this cabin again rests on the cabin altitude actually reading normal, not on how the descent felt — watching it settle is what turns a guess into a confirmed fact.",
    },
    {
      id: "check-on-child", kind: "select", target: "child-mask",
      title: "Help the unassisted child",
      cue: "Now that your own mask is secure, help the child whose mask isn't on.",
      why: "This is exactly the help this crew's own mask being secured first was for — a child who needs a hand gets one now, from a crew member who can actually think clearly enough to give it safely.",
    },
    {
      id: "confirm-cabin-repressurized", kind: "gauge", target: "cabin-repressurize-panel",
      title: "Confirm the cabin is repressurized",
      cue: "Read the pressure gauge and confirm the cabin has actually returned to a safe reading before standing passengers down from oxygen.",
      gauge: { label: "CABIN PSI", speed: 0.6, green: [0.5, 0.9], readout: (t) => (t < 0.5 ? "still low" : "normal"), missNote: "Stood passengers down before the gauge actually confirmed a normal reading. That's a guess dressed up as a confirmation." },
      why: "Passengers come off their masks only once this crew has an actual confirmed reading that the cabin is safe again — not once the descent feels like it's over, which is a guess this checklist has no use for.",
    },
    {
      id: "sweep-and-check", kind: "select", target: "cabin-sweep-log",
      title: "Sweep the cabin and check on passengers",
      cue: "Walk the aisle, check on every row, and note anything that still needs attention.",
      why: "A cabin that just went through a rapid decompression has people who are shaken, some who may be hurt, and equipment that needs resetting — this walk-through is what actually finds out which of those apply, row by row, instead of assuming everyone is fine because the drill is technically over.",
    },
    {
      id: "log-decompression-event", kind: "select", target: "decompression-log",
      title: "Log the event",
      cue: "Record the sequence, the times, and anything found during the sweep.",
      why: "This log is what the airline reviews afterward to confirm the equipment performed and the checklist was followed — a decompression handled perfectly but never logged leaves nothing behind to prove either one.",
    },
  ],

  interrupts: [
    {
      id: "second-mask-fails",
      kind: "A second compartment fails to drop",
      after: "hold-mask-on-passenger", delay: 3, seconds: 12,
      alert: "A second overhead compartment across the aisle also never dropped its mask.",
      cue: "That row needs the manual release pulled right now.",
      target: "mask-not-deployed",
      why: "A second failed compartment doesn't wait its turn behind the first — it gets the same manual release the instant it's spotted, because every second that row goes without oxygen is a second this crew already knows exactly how to fix.",
      missNote: "The second failed compartment sat undiscovered while attention stayed on the first row. That's a whole row still without oxygen.",
      wrongNote: "Pull the manual release on the second compartment — it doesn't wait behind the first one.",
    },
    {
      id: "passenger-tries-to-unbuckle",
      kind: "A passenger tries to unbuckle to help someone else",
      after: "watch-cabin-altitude", delay: 3, seconds: 12,
      alert: "A passenger starts unbuckling to go help a family member two rows away during the descent.",
      cue: "That gets a firm stay-seated instruction, not a debate.",
      target: "stay-seated-command",
      why: "Anyone moving through this cabin during an active descent is a fall risk this crew does not need on top of everything already happening — a firm, immediate instruction to stay seated with the mask on is what keeps one more person from becoming a second problem.",
      missNote: "The passenger unbuckled and started moving through the cabin mid-descent. That's exactly the fall risk this instruction exists to prevent.",
      wrongNote: "A firm stay-seated instruction, right now — this isn't a conversation to have while the aircraft is still descending.",
    },
  ],

  build(root) {
    const hits = {};
    const g = root;
    stationPad(g, 2.7, CADX_ACCENT);

    const cabin = cabinInterior(g, 0, 0, 0, { livery: { colour: 0x2f6f86 } });
    const { oxygenPanel, galley, door } = cabin.userData.parts;
    void door;
    holoTag(cabin, "cabin section", 0, 2.5, 0.5, { css: "#4fb0d8", w: 0.4 });

    const checklistBoard = decal(g, 0.3, 0.4, -1.3, 1.3, -1.2,
      paperFace("DECOMPRESSION DRILL", ["Own mask first", "Sweep · Confirm · Log"], { bg: "#fbf3df", band: "#1c5a72" }), { px: 220 });
    reg(hits, checklistBoard, "decompression-checklist-board");

    const attendant = standingFigure(g, -0.9, 1.35, { ry: 1.6, cloth: 0x1c3a5c, skin: 0xb98a63 });
    const crewMask = box(attendant, 0.1, 0.08, 0.06, 0, 1.4, 0.14, 0xdfe6ea, { rough: 0.4, opacity: 0.85, transparent: true });
    holoTag(crewMask, "own oxygen mask", 0, 0.12, 0, { css: "#4fb0d8", w: 0.36 });
    reg(hits, crewMask, "crew-oxygen-mask");
    const skippedMaskFlag = box(attendant, 0.06, 0.02, 0.02, 0, 1.55, 0.12, 0xf0645b, { rough: 0.6 });
    reg(hits, skippedMaskFlag, "own-mask-skipped-hazard");

    reg(hits, oxygenPanel, "mask-not-deployed");
    reg(hits, oxygenPanel, "mask-not-deployed-hazard");

    const laptop = box(g, 0.28, 0.02, 0.2, -0.46, 0.62, 0.71, 0x2b2f34, { rough: 0.4, metal: 0.2 });
    laptop.rotation.x = -0.5;
    holoTag(laptop, "laptop left open", 0, 0.1, 0, { css: "#f0645b", w: 0.4 });
    reg(hits, laptop, "loose-laptop");
    reg(hits, laptop, "loose-laptop-hazard");

    const paHandset = box(galley, 0.08, 0.16, 0.06, 0, 1.1, -0.1, 0x2b2f34, { rough: 0.5, metal: 0.3 });
    holoTag(paHandset, "PA handset", 0, 0.14, 0, { css: "#4fb0d8", w: 0.32 });
    reg(hits, paHandset, "emergency-descent-pa");
    const seatbeltSign = instrument(g, 1.4, 1.7, 0.6, { idle: "SIGN OFF", color: CADX_ACCENT, w: 0.16, d: 0.2, ry: -1.2 });
    reg(hits, seatbeltSign, "seatbelt-sign-on");

    const portableBottle = box(g, 0.14, 0.4, 0.14, 0.6, 0.5, -1.6, 0x59c9a0, { rough: 0.4, metal: 0.3 });
    holoTag(portableBottle, "portable O2 bottle", 0, 0.24, 0, { css: "#4fb0d8", w: 0.4 });
    reg(hits, portableBottle, "portable-o2-bottle");
    const failedRowSpot = box(g, 0.5, 0.02, 0.5, 0.46, 0.001, 0.71, 0xffffff, { opacity: 0.001, transparent: true, cast: false });
    hits["failed-row-spot"] = failedRowSpot;
    const portableMask = box(g, 0.1, 0.08, 0.06, 0.46, 0.9, 0.71, 0xdfe6ea, { rough: 0.4, opacity: 0.85, transparent: true });
    holoTag(portableMask, "portable mask", 0, 0.1, 0, { css: "#4fb0d8", w: 0.34 });
    reg(hits, portableMask, "portable-mask");

    const backupCylinder = cyl(g, 0.09, 0.09, 0.5, -1.35, 0.3, -1.6, 0x59c9a0, { rough: 0.4, metal: 0.3, seg: 14 });
    const backupValve = ball(backupCylinder, 0.03, 0, 0.28, 0, 0x8b98a5, { rough: 0.4, metal: 0.5, seg: 10 });
    holoTag(backupCylinder, "backup O2 cylinder", 0, 0.3, 0, { css: "#4fb0d8", w: 0.42 });
    reg(hits, backupValve, "backup-o2-cylinder-valve");
    const o2Gauge = instrument(g, -1.35, 0.57, -1.6, { idle: "-- %", color: CADX_ACCENT, w: 0.1, d: 0.14, ry: 1.2 });
    reg(hits, o2Gauge, "o2-pressure-gauge-dx");

    const altGauge = instrument(g, 1.4, 1.3, 0.6, { idle: "-- ft", color: CADX_ACCENT, w: 0.13, d: 0.18, ry: -1.2 });
    holoTag(altGauge, "cabin altitude", 0, 0.16, 0, { css: "#4fb0d8", w: 0.4 });
    reg(hits, altGauge, "cabin-altitude-gauge");

    const child = seatedFigure(g, 0.455, 0.46, 0.71, { ry: 0, cloth: 0x6a8f6a, skin: 0xd9a985, scale: 0.85 });
    void child;
    const childMask = box(g, 0.06, 0.05, 0.04, 0.455, 0.85, 0.71, 0xdfe6ea, { rough: 0.4, opacity: 0.85, transparent: true });
    holoTag(childMask, "child's mask", 0, 0.08, 0, { css: "#f0645b", w: 0.34 });
    reg(hits, childMask, "child-mask");
    reg(hits, childMask, "child-unassisted-hazard");

    const repressurizePanel = instrument(g, 1.35, 0.9, -1.3, { idle: "-- PSI", color: CADX_ACCENT, w: 0.14, d: 0.18, ry: -1.2 });
    holoTag(repressurizePanel, "cabin pressure", 0, 0.16, 0, { css: "#4fb0d8", w: 0.4 });
    reg(hits, repressurizePanel, "cabin-repressurize-panel");

    const sweepLog = holoPanel(g, 0.5, 0.34, -1.4, 1.6, 0.3, (ctx, w, h) => {
      ctx.fillStyle = "rgba(6,20,28,0.9)"; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#4fb0d8"; ctx.fillRect(0, 0, w, 5);
      ctx.fillStyle = "#e2f4fb";
      ctx.font = `600 ${Math.round(h * 0.12)}px 'Barlow Condensed', Arial, sans-serif`;
      ctx.textAlign = "left"; ctx.textBaseline = "middle";
      ctx.fillText("CABIN SWEEP", w * 0.06, h * 0.25);
      ctx.font = `${Math.round(h * 0.09)}px Arial, sans-serif`;
      ctx.fillText("Status: in progress", w * 0.06, h * 0.6);
    }, { accent: CADX_ACCENT, ry: 0.7 });
    reg(hits, sweepLog, "cabin-sweep-log");

    const decompressionLog = holoPanel(g, 0.5, 0.34, 1.4, 1.6, 1.4, (ctx, w, h) => {
      ctx.fillStyle = "rgba(6,20,28,0.9)"; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#4fb0d8"; ctx.fillRect(0, 0, w, 5);
      ctx.fillStyle = "#e2f4fb";
      ctx.font = `600 ${Math.round(h * 0.12)}px 'Barlow Condensed', Arial, sans-serif`;
      ctx.textAlign = "left"; ctx.textBaseline = "middle";
      ctx.fillText("EVENT LOG", w * 0.06, h * 0.25);
      ctx.font = `${Math.round(h * 0.09)}px Arial, sans-serif`;
      ctx.fillText("Status: open", w * 0.06, h * 0.6);
    }, { accent: CADX_ACCENT, ry: -0.7 });
    reg(hits, decompressionLog, "decompression-log");

    const brace = box(g, 0.5, 0.02, 0.5, -0.9, 0.001, 1.3, 0xffffff, { opacity: 0.001, transparent: true, cast: false });
    hits["brace-command"] = brace;
    const stayCommand = instrument(g, 0.9, 1.1, 0.9, { idle: "STAY SEATED", color: CADX_ACCENT, w: 0.2, d: 0.2, ry: 0 });
    holoTag(stayCommand, "stay seated", 0, 0.18, 0, { css: "#4fb0d8", w: 0.4 });
    reg(hits, stayCommand, "stay-seated-command");
    const stayLamp = ball(g, 0.02, 0.9, 1.24, 0.9, 0x59c97b, { emissive: 0x59c97b, ei: 0.5, seg: 8, seg2: 6 });

    return {
      hits,
      footprint: 2.7,
      spawnLook: new THREE.Vector3(-0.4, 1.2, -0.6),

      onStepComplete(step) {
        if (step.id === "don-own-mask") { crewMask.material = mat(0x59c97b, { rough: 0.4, opacity: 0.9, transparent: true }); skippedMaskFlag.visible = false; }
        if (step.id === "descent-command") repaint(seatbeltSign.userData.screen, signFace("SIGN ON", { bg: "#0d1c24", accent: "#f2c14b", fg: "#e2f4fb", scale: 0.45 }));
        if (step.id === "scan-masks") laptop.material = mat(0x59c97b, { rough: 0.4, metal: 0.2 });
        if (step.id === "hold-mask-on-passenger") portableMask.material = mat(0x59c97b, { rough: 0.4, opacity: 0.9, transparent: true });
        if (step.id === "check-on-child") childMask.material = mat(0x59c97b, { rough: 0.4, opacity: 0.9, transparent: true });
        if (step.id === "confirm-cabin-repressurized") repaint(repressurizePanel.userData.screen, signFace("NORMAL", { bg: "#0d1c24", accent: "#59c97b", fg: "#e2f4fb", scale: 0.42 }));
        if (step.id === "sweep-and-check") {
          repaint(sweepLog.userData.face, (ctx, w, h) => {
            ctx.fillStyle = "rgba(6,20,28,0.9)"; ctx.fillRect(0, 0, w, h);
            ctx.fillStyle = "#4fb0d8"; ctx.fillRect(0, 0, w, 5);
            ctx.fillStyle = "#e2f4fb";
            ctx.font = `600 ${Math.round(h * 0.12)}px 'Barlow Condensed', Arial, sans-serif`;
            ctx.textAlign = "left"; ctx.textBaseline = "middle";
            ctx.fillText("CABIN SWEEP", w * 0.06, h * 0.25);
            ctx.font = `${Math.round(h * 0.09)}px Arial, sans-serif`;
            ctx.fillText("Status: complete", w * 0.06, h * 0.6);
          });
        }
        if (step.id === "log-decompression-event") {
          repaint(decompressionLog.userData.face, (ctx, w, h) => {
            ctx.fillStyle = "rgba(6,20,28,0.9)"; ctx.fillRect(0, 0, w, h);
            ctx.fillStyle = "#4fb0d8"; ctx.fillRect(0, 0, w, 5);
            ctx.fillStyle = "#e2f4fb";
            ctx.font = `600 ${Math.round(h * 0.12)}px 'Barlow Condensed', Arial, sans-serif`;
            ctx.textAlign = "left"; ctx.textBaseline = "middle";
            ctx.fillText("EVENT LOG", w * 0.06, h * 0.25);
            ctx.font = `${Math.round(h * 0.09)}px Arial, sans-serif`;
            ctx.fillText("Status: logged", w * 0.06, h * 0.6);
          });
        }
      },

      onInterrupt(it) {
        if (it.id === "second-mask-fails") oxygenPanel.traverse?.((o) => { if (o.isMesh) o.material = mat(0xf0645b, { rough: 0.4 }); });
        if (it.id === "passenger-tries-to-unbuckle") {
          stayLamp.material = mat(0xf0645b, { emissive: 0xf0645b, ei: 1.8, seg: 8, seg2: 6 });
          repaint(stayCommand.userData.screen, signFace("STAY SEATED!", { bg: "#2a1610", accent: "#f0645b", fg: "#ffd9d0", scale: 0.4 }));
        }
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "passenger-tries-to-unbuckle") {
          stayLamp.material = mat(0x59c97b, { emissive: 0x59c97b, ei: 0.5, seg: 8, seg2: 6 });
          repaint(stayCommand.userData.screen, signFace("STAY SEATED", { bg: "#0d1c24", accent: "#4fb0d8", fg: "#e2f4fb", scale: 0.4 }));
        }
      },

      onHazard() {},

      animate(t, dt, session) {
        void dt;
        const gg = session?.gauge, tk = session?.track;
        if (gg && !gg.committed && session.step?.id === "check-o2-pressure") {
          repaint(o2Gauge.userData.screen, signFace(`${Math.round(gg.t * 100)}%`, {
            bg: "#0d1c24", accent: gg.t >= 0.5 ? "#59c97b" : "#f0645b", fg: "#e2f4fb", scale: 0.55,
          }));
        }
        if (gg && !gg.committed && session.step?.id === "confirm-cabin-repressurized") {
          repaint(repressurizePanel.userData.screen, signFace(`${Math.round(gg.t * 100)} PSI`, {
            bg: "#0d1c24", accent: gg.t >= 0.5 ? "#59c97b" : "#f0645b", fg: "#e2f4fb", scale: 0.5,
          }));
        }
        if (tk && session.step?.id === "watch-cabin-altitude") {
          repaint(altGauge.userData.screen, signFace(tk.readout ?? "--", {
            bg: "#0d1c24", accent: tk.inBand ? "#59c97b" : "#f0645b", fg: "#e2f4fb", scale: 0.5,
          }));
        }
        void t;
      },
    };
  },
};
