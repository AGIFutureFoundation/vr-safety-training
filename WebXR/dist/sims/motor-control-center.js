import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, ball, slab, group, decal, repaint, signFace, particles, mat,
} from "../../../shared/kit.js";
import {
  CITY, stationPad, holoPanel, holoTag, toolChest, instrument, lockTag, barrierPanel,
  standingFigure, surfaceTexture, texturedMat, deckPlateFace, reg,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Motor Control Center VR — Energy & Power, IBEW inside wireman.
// Racking a bucket out of a motor control centre for a contactor and overload
// inspection. The bucket's own disconnect is not the same thing as the bus it
// plugs into: the disconnect isolates that bucket, but the vertical bus
// behind it stays energised for every other bucket on the section, which is
// the whole reason the remote racking mechanism and the arc-flash label exist
// — the stab connectors separate a few inches from a hand that is not there.

const MCC_ACCENT = 0xf2a23b;

export const SIM_MOTOR_CONTROL_CENTER = {
  id: "motor-control-center",
  index: "188",
  domain: "Energy",
  trade: "Inside wireman — IBEW",
  category: "Energy & Power",
  indoor: "plant",
  weather: "overcast",
  certification: "IBEW inside wireman; NFPA 70E arc-flash risk assessment and PPE category; OSHA 29 CFR 1910.147 control of hazardous energy and 1910.333 electrical safe work practices",
  name: "Motor Control Center",
  title: simTitle("Motor Control Center"),
  tagline: "Racking a bucket out of a live motor control centre: label, PPE, disconnect, remote rack, proven dead, inspected, racked back in",
  accent: MCC_ACCENT,
  accentCss: "#f2a23b",
  parSeconds: 255,
  footprint: 2.3,
  badge: { id: "bucket-cleared", name: "Bucket Cleared", note: "A bucket racked out with the remote tool, proven dead, inspected and racked back in with nothing skipped" },

  game: system({
    name: "Panel Authority",
    currency: "AMP",
    ranks: ["Apprentice Wireman", "Journeyman Wireman", "Panel Technician", "Panel Lead", "Panel Authority Certified"],
    badges: [
      { id: "label-read", name: "Label Read", note: "PPE selected from the bucket's own arc-flash label, every time", test: AWARD.stepClean("ppe") },
      { id: "hands-clear", name: "Hands Clear", note: "Never reached into a bucket that was not proven dead", test: AWARD.safe },
      { id: "torque-steady", name: "Torque Steady", note: "Held the racking crank smooth through the full travel", test: AWARD.precise(0.7) },
    ],
    challenges: [
      { id: "no-callback", name: "No Callback", note: "Clean run, no corrections", test: AWARD.clean },
      { id: "crank-held", name: "Crank Held", note: "Never let the racking tool slip mid-travel", test: AWARD.unbroken },
      { id: "section-back", name: "Section Back", note: "Bucket restored inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "hot-bus": "That is the bucket's stab connection to the vertical bus. The bucket's own disconnect being open says nothing about it — the vertical bus behind the stabs feeds every other bucket in this section and stays live until the section itself is shut down, which this job never called for.",
    "hand-rack": "You reached for the racking mechanism by hand instead of fitting the remote tool. The whole reason a motor control centre has a geared racking crank is so the operator's hands stay outside the arc-flash boundary while the stabs separate — the moment of separation under any residual load is exactly when an arcing fault starts, and a hand on the mechanism is a hand at the boundary for it.",
    "no-boundary-ppe": "You went for the open bucket without the suit, hood and gloves on. The label on this bucket states an incident energy this door can release if something behind it is not what the isolation says it is, and the PPE is rated to that number — not to how confident anyone feels about the lockout.",
    "neighbour-bus": "You reached into the neighbouring bucket. Its door is open because somebody made a mistake, not because it was isolated — the bus behind that door is exactly as live as it was this morning, and nothing about the work you are doing on your own bucket makes it safe to touch.",
  },

  lateNotes: {
    "bucket-disconnect": "The bucket's disconnect opens and gets locked before the racking tool ever touches it.",
    "rack-tool": "The remote tool keeps your hands outside the boundary while the stabs separate — it is not optional at this label's category.",
    "test-probe": "Proven dead comes before the door opens, not after.",
  },

  interrupts: [
    {
      id: "neighbour-opens",
      kind: "Adjacent bucket opened",
      after: "rack-out", delay: 4, seconds: 12,
      alert: "Two buckets down, a second electrician has just swung the neighbouring bucket's door open with the section bus still live behind it — he is reaching for something on the shelf inside.",
      cue: "You are mid-crank on your own bucket. Stop him before his hand gets to that bus.",
      target: "neighbour-electrician",
      why: "A racked-out bucket only makes the one bucket safe; the vertical bus running behind every door in that section is still carrying full voltage, and an open door two buckets down is a door with that bus sitting exposed behind it. The crank in your hands is not the emergency — the open door is, and it gets dealt with before anything else on this section, including your own procedure.",
      missNote: "The neighbouring door stayed open with a hand inside it and the section bus live behind that hand. Your own bucket being correctly isolated would not have helped him at all — the bus he was reaching past has nothing to do with the work you were doing.",
      wrongNote: "It is the electrician at the open door. Whatever he is reaching for, it is a metre from a live bus and nobody told him to be there.",
    },
    {
      id: "tester-fails",
      kind: "Instrument fault",
      after: "test", delay: 4, seconds: 12,
      alert: "Your tester just failed to indicate against the known-live proving source — the display is reading the same dead as it read on the bucket a second ago.",
      cue: "That reading is worthless. Get the spare tester off the cart and prove it before you touch anything.",
      target: "backup-tester",
      why: "A dead reading from a tester that also reads dead on a source you know is live is not proof of anything — it is a failed instrument telling you a comfortable lie. The live-dead-live check exists precisely to catch this before the door opens, and the only correct response to catching it is a working meter, proved on its own known source, not a second attempt with the one that just failed.",
      missNote: "You carried on with a tester that had just failed its own proving check. The bucket behind that door might be exactly as live as the source the tester lied about a moment ago — the failed reading told you nothing, and nothing was done to fix that before hands went near the bus.",
      wrongNote: "It is the spare tester on the cart. The one in your hand just proved it cannot be trusted — set it aside and prove a working one instead.",
    },
  ],

  steps: [
    {
      id: "label", kind: "select", target: "arc-flash-label",
      title: "Read the bucket's arc-flash label",
      cue: "Read the incident energy, the boundary distances and the PPE category on the bucket's own label before touching anything.",
      why: "The label is calculated for this bucket, at this bus, from this section's actual fault current and clearing time — not a general rule of thumb for motor control centres. Everything that follows, the PPE chosen, the boundary set and whether the racking tool is mandatory rather than merely available, comes off the number printed on this door and nowhere else.",
    },
    {
      id: "ppe", kind: "sequence", anyOrder: true,
      targets: ["arc-suit", "arc-hood", "insulating-gloves"],
      itemNames: { "arc-suit": "arc-rated suit", "arc-hood": "arc-rated hood and face shield", "insulating-gloves": "insulating gloves with leather protectors" },
      title: "Arc-rated PPE to the label's category",
      cue: "Suit, hood and gloves rated to the category the label just gave you.",
      why: "The stabs behind this door separate from the live vertical bus during the very operation this job requires, and the label's incident energy is the number the suit, hood and gloves are rated against. Skipping a piece because the bucket looks like it is going to be a quick job is the same bet as skipping the label — it only loses once, and it loses badly.",
    },
    {
      id: "boundary", kind: "select", target: "boundary-markers",
      title: "Set the arc-flash boundary",
      cue: "Cone and tape the boundary distance the label gives, so nobody but you is inside it while the bucket moves.",
      why: "The racking operation is the one moment in this job where a fault, if one exists, actually happens — and it happens fast enough that a shout is not a warning system. The boundary is set before the disconnect is touched so that everyone who is not doing this specific job, including the crew working the next section over, is standing somewhere the arc-flash study says is survivable.",
    },
    {
      id: "disconnect", kind: "turn", target: "bucket-disconnect",
      title: "Open the bucket's disconnect",
      cue: "Trip the bucket disconnect handle to OFF and confirm the door interlock releases.",
      why: "The disconnect is the one thing between the motor and the bus that this job is actually allowed to touch by hand — it opens the load side, not the bus side, which is exactly why racking the bucket out afterward still has to be done with the remote tool rather than treated as a formality.",
      turn: { turns: 0.4, axis: "z", label: "BUCKET DISC" },
    },
    {
      id: "lock", kind: "select", target: "lock-station",
      title: "Lock and tag the bucket disconnect",
      cue: "Your padlock and tag on the disconnect handle before the racking tool goes anywhere near it.",
      why: "A disconnect held open by your hand is open until your hand moves; a disconnect held open by your lock is open until you personally remove that lock. The section this bucket lives in is fed from a source somebody else can operate, and the lock is what keeps this bucket yours for as long as you need it, not as long as nobody else wants it back.",
    },
    {
      id: "rack-out", kind: "hold", target: "rack-tool", seconds: 6,
      title: "Rack the bucket out with the remote tool",
      cue: "Fit the racking crank and turn it steady until the bucket clears the stabs and stops at the fully racked-out position.",
      why: "The label called for the remote tool at this incident-energy category specifically because the stabs separating from the vertical bus is the moment a marginal connection or trapped contamination can flash — and the crank's whole geometry exists to put that moment a shaft's length from your hand instead of at it. A crank that is rushed or forced can bind and jump, which is exactly the jolt that turns a clean separation into an arcing one.",
      holdBreakNote: "The crank slipped before the bucket reached the stop. A bucket parked partway out of its stabs is neither in nor isolated — fit the tool again and take it the rest of the way.",
    },
    {
      id: "test", kind: "gauge", target: "test-probe",
      title: "Prove the bucket dead",
      cue: "Prove the tester on a known live source, test the bucket's line and load terminals, prove the tester again.",
      why: "A racked-out bucket has cleared the vertical bus, but it has not been measured — the racking mechanism is a mechanical claim, and the tester is the only actual evidence. Proving the tester on a known source before and after the reading is what stops a failed meter from handing you a comfortable, false dead.",
      gauge: { label: "BUCKET V", speed: 0.75, green: [0.0, 0.12], readout: (t) => `${Math.round(t * 480)} V`, missNote: "That is not dead. Stop, recheck the disconnect and the racking position, and do not open the door on this reading." },
    },
    {
      id: "door", kind: "select", target: "bucket-door",
      title: "Open the bucket door",
      cue: "With the bucket proven dead, swing the door open on the contactor compartment.",
      why: "Everything before this step exists to make this the safe moment to do the one thing the job actually requires: put your hands inside an enclosure that, an hour ago, had a running motor's full load current behind it. The door only opens once every step ahead of it is actually done, not once it feels like enough of them are.",
    },
    {
      id: "inspect", kind: "find", noHint: true,
      targets: ["worn-contactor", "tripped-overload", "cracked-gasket"],
      itemNames: { "worn-contactor": "pitted contactor contacts", "tripped-overload": "tripped overload relay", "cracked-gasket": "cracked door gasket" },
      itemNotes: {
        "worn-contactor": "The contactor's main contacts are pitted and starting to weld at the corners. Left in service, a pitted contact runs hotter every cycle it closes on, and it is the kind of failure that looks fine right up until it welds shut under load.",
        "tripped-overload": "The overload relay is sitting tripped, not reset — this bucket did not come off simply because somebody opened a disconnect for an inspection. Whatever tripped it happened on its own, and it goes on the work order before this bucket goes back in service.",
        "cracked-gasket": "The door gasket is cracked through at the hinge corner. A compromised gasket lets dust and moisture into a compartment that is supposed to be sealed against exactly that, which is how a clean contactor becomes a tracked one.",
      },
      title: "Inspect the contactor and overloads",
      cue: "Look over the contactor, the overload relay and the door seal while the bucket is open and dead; click what needs a work order.",
      why: "This bucket is dead for the length of this job and not a minute longer. Whatever a close look finds now — pitting, a tripped relay, a failed seal — gets written up while somebody is standing here with the door open; missed now, it is a fault report the next time this motor is asked to start under load.",
    },
    {
      id: "close", kind: "select", target: "bucket-door",
      title: "Close the bucket door",
      cue: "Close and latch the door before the bucket goes anywhere near the bus again.",
      why: "The door is not a formality between inspection and re-energising — it is rated to contain exactly the kind of event the arc-flash label describes, and it does that only when it is actually latched. A bucket racked back in with the door swinging is a bucket with its one piece of containment left off.",
    },
    {
      id: "rack-in", kind: "hold", target: "rack-tool", seconds: 5,
      title: "Rack the bucket back in",
      cue: "Fit the crank and turn it steady until the stabs seat and the bucket reaches the fully racked-in position.",
      why: "Seating the stabs is the same event as separating them, run in reverse, and it gets the same tool and the same steady hand for the same reason — a rushed final turn can cock the bucket in its guides and land the stabs off-centre, which shows up later as the hot joint the contactor inspection was just trying to catch.",
      holdBreakNote: "The crank slipped before the bucket seated fully. A bucket short of its racked-in stop is not making a clean stab connection — fit the tool and finish the travel.",
    },
    {
      id: "unlock", kind: "select", target: "lock-station",
      title: "Remove your lock",
      cue: "Take your padlock and tag off the disconnect now that the door is closed and the bucket is seated.",
      why: "The lock comes off only once the work it was protecting is actually finished — door closed, bucket seated — because a lock removed early re-opens the possibility of somebody closing this disconnect while the door is still open on a live compartment.",
    },
    {
      id: "restore-power", kind: "turn", target: "bucket-disconnect",
      title: "Close the bucket disconnect",
      cue: "Close the bucket disconnect handle and confirm the door interlock re-engages.",
      why: "Re-energising is the last step, not an afterthought once the tools are packed — the motor comes back under control the same way it went off, on the disconnect this job has held the whole time, with everyone still clear of the boundary that was set for exactly this moment as much as for the racking.",
      turn: { turns: 0.4, axis: "z", reverse: true, label: "BUCKET DISC" },
    },
    {
      id: "log", kind: "select", target: "mcc-log",
      title: "Log the bucket back in service",
      cue: "Write the bucket number, what the inspection found, and the time it was returned to service on the section log.",
      why: "The section log is how the next electrician who opens this cabinet knows this bucket was worked today and what was found — a pitted contactor or a tripped overload that goes unwritten is a fault that gets rediscovered the hard way, on whatever shift the motor next tries to start under it.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.3, MCC_ACCENT);

    // ------------------------------------------------------------- the floor
    const floorTex = surfaceTexture((cx, w, h) => deckPlateFace(cx, w, h, { base: "#3a4048", base2: "#31363d", step: 26 }), { repeat: 4, px: 320 });
    const floor = box(g, 5.4, 0.1, 4.6, 0, 0.05, 0, 0x3a4048, { rough: 0.85, metal: 0.15 });
    floor.material = texturedMat(floorTex, { rough: 0.8, metal: 0.2, color: 0x3a4048 });

    // -------------------------------------------------------- the MCC lineup
    // Four bucket cubicles in a steel line-up: the working bucket in the
    // middle-left with its door open, the neighbouring bucket two along that
    // gets opened during the interruption, and two filler buckets either end.
    const lineup = group(g, 0, 0.1, -1.7);
    const bucketDefs = [
      { x: -1.5, label: "M-14", filler: true },
      { x: -0.5, label: "M-15", filler: false },
      { x: 0.5, label: "M-16", filler: "neighbour" },
      { x: 1.5, label: "M-17", filler: true },
    ];
    let workingCub, neighbourCub;
    for (const def of bucketDefs) {
      const c = group(lineup, def.x, 0, 0);
      box(c, 0.9, 2.2, 0.85, 0, 1.1, 0, 0x6f7a83, { rough: 0.5, metal: 0.5 });
      decal(c, 0.5, 0.1, 0, 2.02, 0.43, signFace(def.label, { bg: "#1b1e22", accent: "#f2a23b", scale: 0.55 }));
      for (let r = 0; r < 3; r++) box(c, 0.7, 0.02, 0.01, 0, 0.5 + r * 0.4, 0.43, 0x2b3138, { rough: 0.6, cast: false });
      if (def.filler === true) { for (let i = 0; i < 5; i++) box(c, 0.6, 0.02, 0.01, 0, 0.2 + i * 0.33, 0.43, 0x11151a, { cast: false, receive: false }); }
      if (def.filler === false) workingCub = c;
      if (def.filler === "neighbour") neighbourCub = c;
    }
    box(lineup, 4.2, 0.15, 0.9, 0, 2.28, 0, 0x596069, { rough: 0.55, metal: 0.4 }); // rain cap
    for (let i = 0; i < 5; i++) cyl(lineup, 0.035, 0.035, 0.7, -1.8 + i * 0.9, 2.55, 0, CITY.darkSteel, { rough: 0.55, metal: 0.6, seg: 10 }).rotation.x = Math.PI / 2; // overhead conduit

    // --------------------------------------------------------- working bucket
    const arcLabel = decal(workingCub, 0.44, 0.28, 0, 1.35, 0.44, (cx, w, h) => {
      cx.fillStyle = "#f2c14b"; cx.fillRect(0, 0, w, h);
      cx.strokeStyle = "#1b1e22"; cx.lineWidth = h * 0.03; cx.strokeRect(h * 0.05, h * 0.05, w - h * 0.1, h - h * 0.1);
      cx.fillStyle = "#1b1e22"; cx.textAlign = "center"; cx.textBaseline = "middle";
      cx.font = `700 ${Math.round(h * 0.13)}px 'Barlow Condensed', Arial, sans-serif`;
      cx.fillText("WARNING — ARC FLASH", w / 2, h * 0.16);
      cx.font = `600 ${Math.round(h * 0.1)}px Arial, sans-serif`;
      cx.fillText("6.8 cal/cm² AT 18 IN", w / 2, h * 0.36);
      cx.fillText("BOUNDARY 42 IN · CAT 2", w / 2, h * 0.5);
      cx.fillText("480 V · REMOTE RACK REQ'D", w / 2, h * 0.66);
      cx.font = `700 ${Math.round(h * 0.09)}px Arial, sans-serif`;
      cx.fillText("SUIT · HOOD · GLOVES", w / 2, h * 0.84);
    }, { px: 320 });
    reg(hits, arcLabel, "arc-flash-label");

    const door = group(workingCub, -0.44, 1.15, 0.43);
    box(door, 0.82, 1.6, 0.03, 0.41, 0, 0, 0x6f7a83, { rough: 0.5, metal: 0.5 });
    box(door, 0.03, 0.14, 0.03, 0.76, 0, 0.03, CITY.steel, { rough: 0.3, metal: 0.9 });
    reg(hits, door, "bucket-door");

    // Disconnect handle mimic on the door face.
    const discMimic = group(workingCub, 0.06, 1.55, 0.44);
    cyl(discMimic, 0.045, 0.045, 0.02, 0, 0, 0, 0x22262b, { rough: 0.5, metal: 0.5, seg: 12 }).rotation.x = Math.PI / 2;
    const discHandle = box(discMimic, 0.025, 0.11, 0.018, 0, 0.06, 0.015, 0xd2312b, { rough: 0.5 });
    const discFace = decal(discMimic, 0.15, 0.045, 0, -0.08, 0.014, signFace("CLOSED", { bg: "#2a0c0c", accent: "#d2312b", scale: 0.55 }));
    reg(hits, discMimic, "bucket-disconnect");

    // Inside the compartment: bus stabs, contactor, overload relay, gasket.
    const inner = group(workingCub, 0, 0.85, 0.2);
    const stabs = group(inner, 0, 0.55, 0);
    for (const sx of [-0.12, 0, 0.12]) box(stabs, 0.03, 0.09, 0.02, sx, 0, 0, 0xb87333, { rough: 0.3, metal: 0.9 });
    holoTag(stabs, "stabs — vertical bus", 0, 0.16, 0, { css: "#d2312b", w: 0.34 });
    reg(hits, stabs, "hot-bus");

    const contactor = box(inner, 0.32, 0.22, 0.18, -0.08, 0.1, 0, 0x2b3138, { rough: 0.5, metal: 0.4 });
    for (const cx of [-0.06, 0.06]) box(contactor, 0.02, 0.05, 0.02, cx, 0.14, 0.09, 0x8a3f33, { rough: 0.7, metal: 0.5 }); // pitted tips
    reg(hits, contactor, "worn-contactor");
    const overload = cyl(inner, 0.06, 0.06, 0.05, 0.16, 0.05, 0.05, 0xd8b23a, { rough: 0.55, metal: 0.4, seg: 14 });
    overload.rotation.x = Math.PI / 2;
    decal(overload, 0.09, 0.09, 0, 0.028, 0, signFace("TRIP", { bg: "#2a1416", accent: "#f0645b", scale: 0.6 }));
    reg(hits, overload, "tripped-overload");
    const gasket = box(workingCub, 0.02, 1.5, 0.02, 0.42, 0, 0.44, 0x1b1e22, { rough: 0.9 });
    reg(hits, gasket, "cracked-gasket");

    // Racking mechanism the crank fits onto.
    const rackShaft = cyl(workingCub, 0.03, 0.03, 0.1, 0, 1.35, 0.44, 0x22262b, { rough: 0.5, metal: 0.5, seg: 12 });
    rackShaft.rotation.z = Math.PI / 2;
    const rackNote = holoTag(workingCub, "rack with the tool — do not turn by hand", 0, 1.5, 0.44, { css: "#d2312b", w: 0.6 });
    void rackNote;
    reg(hits, rackShaft, "hand-rack");

    // ------------------------------------------------------- neighbour bucket
    const neighDoor = group(neighbourCub, -0.44, 1.15, 0.43);
    box(neighDoor, 0.82, 1.6, 0.03, 0.41, 0, 0, 0x6f7a83, { rough: 0.5, metal: 0.5 });
    const neighInner = group(neighbourCub, 0, 0.85, 0.2);
    for (const sx of [-0.12, 0, 0.12]) box(neighInner, 0.03, 0.09, 0.02, sx, 0.55, 0, 0xb87333, { rough: 0.3, metal: 0.9 });
    reg(hits, neighInner, "neighbour-bus");
    const neighHome = { rotY: neighDoor.rotation.y };

    // -------------------------------------------------------------- tool kit
    const chest = toolChest(g, 2.4, 0.4, { ry: -0.7, color: 0xb8402f });
    const rackTool = group(g, 1.75, 0, 0.9, -0.3);
    cyl(rackTool, 0.018, 0.018, 0.55, 0, 0.28, 0, 0xd8b23a, { rough: 0.45, seg: 10 });
    box(rackTool, 0.08, 0.1, 0.03, 0, 0.56, 0, 0x8a8f96, { rough: 0.4, metal: 0.6 });
    holoTag(rackTool, "remote racking crank", 0, 0.7, 0, { css: "#d8b23a", w: 0.34 });
    reg(hits, rackTool, "rack-tool");

    const tester = instrument(chest, -0.05, 0.79, 0.02, { ry: 0.3, idle: "-- V", color: 0xf2a23b });
    holoTag(tester, "primary tester", 0, 0.16, 0, { css: "#f2a23b", w: 0.28 });
    reg(hits, tester, "test-probe");
    const testerFault = ball(tester, 0.018, 0, 0.05, -0.09, 0xd2312b, { emissive: 0xd2312b, ei: 3 });
    testerFault.visible = false;
    const spare = instrument(g, 2.7, 0.5, 1.0, { ry: -0.6, idle: "-- V", color: 0x59c97b });
    holoTag(spare, "spare tester", 0, 0.16, 0, { css: "#59c97b", w: 0.26 });
    reg(hits, spare, "backup-tester");

    // -------------------------------------------------------------------- PPE
    const ppeRack = group(g, -2.4, 0.1, 0.9, 0.5);
    box(ppeRack, 0.6, 1.6, 0.3, 0, 0.8, 0, 0x2b2f34, { rough: 0.6 });
    const suit = box(ppeRack, 0.4, 0.9, 0.1, 0, 0.9, 0.2, 0x2f4f8c, { rough: 0.8 });
    holoTag(suit, "arc suit", 0, 0.55, 0, { css: "#f2a23b", w: 0.24 });
    reg(hits, suit, "arc-suit");
    const hood = ball(ppeRack, 0.14, 0, 1.5, 0.2, 0x2f4f8c, { rough: 0.8 });
    holoTag(hood, "hood + face shield", 0, 0.24, 0, { css: "#f2a23b", w: 0.3 });
    reg(hits, hood, "arc-hood");
    const gloves = box(ppeRack, 0.2, 0.14, 0.08, -0.2, 0.6, 0.2, 0xf2c14b, { rough: 0.8 });
    holoTag(gloves, "insulating gloves", 0, 0.15, 0, { css: "#f2a23b", w: 0.3 });
    reg(hits, gloves, "insulating-gloves");

    // --------------------------------------------------------- lock, log, boundary
    const lockBoard = group(g, -1.9, 0, -0.55, 0.9);
    box(lockBoard, 0.36, 0.3, 0.04, 0, 1.1, 0, 0xd8232a, { rough: 0.6 });
    decal(lockBoard, 0.32, 0.06, 0, 1.22, 0.025, signFace("LOCKOUT", { bg: "#7d1512", accent: "#f2ae14", scale: 0.55 }));
    cyl(lockBoard, 0.026, 0.03, 0.9, 0, 0.5, 0, CITY.darkSteel, { rough: 0.5, metal: 0.6, seg: 12 });
    reg(hits, lockBoard, "lock-station");
    const appliedLock = lockTag(discMimic, 0.06, -0.09, 0.03, { color: 0xf2a23b });
    appliedLock.visible = false;

    const logBoard = holoPanel(g, 0.5, 0.34, 2.35, 1.4, -1.1, (cx, w, h) => {
      cx.fillStyle = "rgba(6,16,22,0.9)"; cx.fillRect(0, 0, w, h);
      cx.fillStyle = "#f2a23b"; cx.fillRect(0, 0, w, 5);
      cx.fillStyle = "#eaf6fb"; cx.textAlign = "left"; cx.textBaseline = "middle";
      cx.font = `600 ${Math.round(h * 0.12)}px 'Barlow Condensed', Arial, sans-serif`;
      cx.fillText("SECTION LOG — M-15", w * 0.06, h * 0.2);
      cx.font = `${Math.round(h * 0.09)}px Arial, sans-serif`; cx.fillStyle = "#bcd6e2";
      cx.fillText("Bucket in / out, findings, time", w * 0.06, h * 0.48);
      cx.fillText("back in service", w * 0.06, h * 0.68);
    }, { ry: -0.6, accent: MCC_ACCENT });
    reg(hits, logBoard, "mcc-log");

    const boundary = group(g, 0, 0, 1.55);
    barrierPanel(boundary, -0.9, 0.2, { color: 0xe4622a });
    barrierPanel(boundary, 0.9, 0.2, { color: 0xe4622a });
    reg(hits, boundary, "boundary-markers");

    const noPpe = box(g, 0.5, 0.4, 0.5, -0.5, 1.0, -1.15, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "approach the open bucket bare?", -0.5, 1.35, -1.15, { css: "#d2312b", w: 0.5 });
    reg(hits, noPpe, "no-boundary-ppe");

    // The second electrician: off to the side until the interruption walks
    // them to the neighbouring bucket's door.
    const neighbour = standingFigure(g, 2.4, -0.35, { ry: -1.6, cloth: 0x37505f, helmet: 0xf2c14b, vest: 0xe4dc3a });
    holoTag(neighbour, "second electrician", 0, 1.95, 0, { css: "#d2312b", w: 0.4 });
    reg(hits, neighbour, "neighbour-electrician");
    const neighbourHome = neighbour.position.clone();

    // Overhead cable tray and conduit dressing, clear of the crew figure.
    const tray = group(g, 0, 2.5, 1.1);
    box(tray, 4.6, 0.06, 0.3, 0, 0, 0, 0x596069, { rough: 0.6, metal: 0.4, cast: false });
    for (let i = 0; i < 10; i++) box(tray, 0.02, 0.05, 0.3, -2.2 + i * 0.5, -0.03, 0, 0x3c444c, { cast: false, receive: false });
    for (let i = 0; i < 3; i++) {
      const cable = cyl(g, 0.014, 0.014, 0.55, -2.0 + i * 0.6, 2.2, 1.1, 0x1b1e22, { rough: 0.85, seg: 8, cast: false });
      cable.rotation.x = Math.PI / 2;
    }

    let energised = true, discOpen = false;
    const arc = particles(g, 26, 0xffe08a, { size: 0.018, life: 0.3 });
    let arcTimer = 0;

    return {
      hits,
      footprint: 2.3,

      onStepComplete(step) {
        if (step.id === "disconnect") { discOpen = true; energised = false; discHandle.rotation.z = Math.PI / 2; repaint(discFace, signFace("OPEN", { bg: "#0d2b22", accent: "#59c97b", scale: 0.55 })); }
        if (step.id === "lock") appliedLock.visible = true;
        if (step.id === "rack-out") { workingCub.position.z += 0; door.position.z += 0.14; inner.position.z += 0.14; arcTimer = 0.4; }
        if (step.id === "door") door.rotation.y = 1.3;
        if (step.id === "inspect") { contactor.visible = true; }
        if (step.id === "close") door.rotation.y = 0;
        if (step.id === "rack-in") { door.position.z -= 0.14; inner.position.z -= 0.14; }
        if (step.id === "unlock") appliedLock.visible = false;
        if (step.id === "restore-power") { discOpen = false; energised = true; discHandle.rotation.z = 0; repaint(discFace, signFace("CLOSED", { bg: "#2a0c0c", accent: "#d2312b", scale: 0.55 })); }
      },

      onHazard(hitId) {
        if (hitId === "hot-bus" && energised) arcTimer = 0.45;
        if (hitId === "neighbour-bus") arcTimer = 0.4;
      },

      onInterrupt(it) {
        if (it.id === "neighbour-opens") { neighbour.position.set(0.9, neighbourHome.y, -0.8); neighbour.rotation.y = -0.3; neighDoor.rotation.y = 1.2; }
        if (it.id === "tester-fails") { testerFault.visible = true; repaint(tester.userData.screen, signFace("-- V", { bg: "#2a0c0c", accent: "#d2312b", fg: "#ffd2ce", scale: 0.62 })); }
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "neighbour-opens") { neighbour.position.copy(neighbourHome); neighbour.rotation.y = -1.6; neighDoor.rotation.y = neighHome.rotY; }
        if (it.id === "tester-fails") { testerFault.visible = false; repaint(tester.userData.screen, signFace("-- V", { bg: "#0d1c24", accent: "#f2a23b", fg: "#bfeaf7", scale: 0.62 })); }
      },

      animate(t, dt, session) {
        void discOpen;
        if (arcTimer > 0) { arcTimer -= dt; arc.visible = true; arc.userData.step(dt, new THREE.Vector3(0, 0.85, -1.7), 0.1, 1.4, -2.6); }
        else if (arc.visible) arc.visible = false;
        const step = session?.step;
        if (session?.turn && (step?.id === "disconnect" || step?.id === "restore-power")) {
          const dir = step.id === "restore-power" ? -1 : 1;
          discHandle.rotation.z = dir * (session.turn.amount / session.turn.required) * Math.PI / 2;
        }
        const gg = session?.gauge;
        if (gg && !gg.committed && step?.id === "test") repaint(tester.userData.screen, signFace(`${Math.round(gg.t * 480)} V`, { bg: "#0d1c24", accent: gg.t <= 0.12 ? "#59c97b" : "#d2312b", fg: "#bfeaf7", scale: 0.62 }));
      },
    };
  },
};
