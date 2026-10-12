import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, ball, group, decal, repaint, signFace, mat, particles,
} from "../../../shared/kit.js";
import { deliveryVan } from "../../../shared/fleet.js";
import {
  stationPad, holoPanel, holoTag, standingFigure,
  surfaceTexture, texturedMat, pavingFace, reg,
} from "../citykit.js";
import { palette } from "../../../shared/textures.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Dog & Hazard Awareness on Route VR — Mobility & Transit,
// NALC letter carrier route work. A residential block on foot between two
// mailboxes: the day's dog warning list read before the block is walked, a
// loose dog and a propped gate read on the approach rather than discovered
// at the fence line, the recommended non-threatening response worked in its
// own order — stop, turn side-on, back away — with the mail satchel used as
// a barrier rather than a hand raised toward the dog, a heaved sidewalk slab
// and an overgrown sightline read further down the block, a mail slot
// delivered properly, the address flagged on the route's own dog warning
// list for the next carrier, and a short optional pull-out to the next
// block with the same mirror and signal habit a commercial vehicle uses
// anywhere else on the route.
//
// No bite statistic, breed claim or clause number this platform is not
// certain of is stated: the response sequence is described generically, as
// "the recommended non-threatening response" per the route's own guidance
// and NALC's own safety training, never as a rate or a rule with a number
// attached to it.

const ML2_PAL = palette("postal");
const ML2_ACCENT = ML2_PAL.accent;

export const SIM_ML_DOG_AND_HAZARD_AWARENESS_ON_ROUTE = {
  id: "ml-dog-and-hazard-awareness-on-route",
  index: "ml-2",
  domain: "Postal & Mail Processing",
  trade: "City letter carrier — dog and hazard awareness on the walking route, NALC",
  category: "Mobility & Transit",
  weather: "clear",
  certification: "NIOSH guidance on animal-related and slip, trip and fall hazards for workers who deliver on foot; OSHA 29 CFR 1910.132 personal protective equipment, general requirements; OSHA 29 CFR 1910.1030 bloodborne pathogens, for any bite or scratch exposure a carrier reports; FMCSA 49 CFR 392 driving of commercial motor vehicles, for the short pull-out between blocks; NALC training for city letter carrier route safety",
  name: "Dog & Hazard Awareness on Route",
  title: simTitle("Dog & Hazard Awareness on Route"),
  tagline: "A residential block on foot: the dog warning list read first, a loose dog and a propped gate read on the approach, the non-threatening response worked stop-turn-retreat with the satchel as a barrier, a heaved slab and a blind corner read further down the block, the address flagged for the next carrier, and an optional short pull-out to the next block",
  accent: ML2_ACCENT,
  accentCss: `#${ML2_ACCENT.toString(16).padStart(6, "0")}`,
  parSeconds: 300,
  footprint: 2.8,
  badge: { id: "route-aware", name: "Route Aware", note: "A loose dog and every walkway hazard read and answered without a single unsafe move, and the address flagged for the next carrier" },

  game: system({
    name: "Route Awareness",
    currency: "AWARE",
    ranks: ["Casual Carrier", "Route Trainee", "Letter Carrier", "Lead Carrier", "Route Aware Certified"],
    badges: [
      { id: "read-the-approach", name: "Read the Approach", note: "The dog and the propped gate both found before either was a problem", test: AWARD.stepClean("approach-hazard-read") },
      { id: "never-reached", name: "Never Reached", note: "No unsafe action anywhere in the run — the dog was never reached for", test: AWARD.safe },
      { id: "steady-crossing", name: "Steady Crossing", note: "The heaved-slab crossing held its balance band the whole way", test: AWARD.precise(0.72) },
    ],
    challenges: [
      { id: "clean-shift", name: "Clean Shift", note: "No corrections anywhere in the run", test: AWARD.clean },
      { id: "on-time", name: "On Time", note: "Complete inside 80% of par", test: AWARD.fast(0.8) },
      { id: "calm-hands", name: "Calm Hands", note: "The retreat sequence run in order, first try", test: AWARD.stepClean("retreat-sequence") },
    ],
  }),

  supportLine: "your NALC branch's member assistance representative, or the station's own employee assistance line",

  hazards: {
    "unleashed-dog-hazard": "A dog loose in the yard, not tied and not behind a closed door. It is not a hazard because it is aggressive — nobody has told it who a stranger walking up the path is, and a carrier's own approach is the first thing it reacts to. It gets read from the sidewalk, never approached.",
    "propped-gate-hazard": "The side gate is propped open with a brick instead of latched. An open gate is a second way for a yard dog to reach the sidewalk behind a carrier's back, and it is also the reason a dog that looks contained from the front is not actually contained at all.",
    "broken-walkway-hazard": "A heaved sidewalk slab, lifted a good two inches proud of the one behind it by a root underneath. A satchel-loaded carrier looking down at the next address rather than at their own feet is exactly who catches a toe on a lip like this one.",
    "obstructed-sightline-hazard": "An overgrown shrub crowds the walk right at a blind corner by the porch steps. A carrier who cannot see around a corner cannot read whatever is coming around it either — a dog off its own property, a bicycle, a kid on a scooter — until it is already too close to do much about.",
  },

  lateNotes: {
    "unleashed-dog-hazard": "The dog is read and answered with distance and the satchel, never approached and never reached for.",
    "heaved-slab-crossing": "The slab is crossed carefully once it has actually been read as a hazard, not walked over without a glance down.",
  },

  interrupts: [
    {
      id: "second-dog",
      kind: "A second dog joins",
      after: "hold-ground", delay: 3, seconds: 12,
      alert: "A second, larger dog has come around the side of the house to join the first, both now standing at the edge of the yard.",
      cue: "Radio the loose-dog encounter in immediately rather than trying to read two dogs alone.",
      target: "backup-radio",
      why: "One dog read calmly from a safe distance is a manageable situation; two is a different one, and the route's own guidance is to call it in rather than to keep improvising alone once the picture changes for the worse. The radio call is what gets a decision made by someone who can see the whole route, not just this one yard.",
      missNote: "The second dog was never called in. Two dogs read as one manageable situation for too long is exactly how a carrier ends up managing neither of them well.",
      wrongNote: "Not that — call the second dog in before doing anything else.",
    },
    {
      id: "sprinklers-on",
      kind: "Sprinklers activate on the walkway",
      after: "balance-crossing", delay: 3, seconds: 11,
      alert: "The property's sprinklers have kicked on right across the heaved section of walkway, throwing spray over the slab you are still crossing.",
      cue: "Step onto the grass verge rather than push straight on across the now-wet, already-uneven slab.",
      target: "step-to-verge",
      why: "A slab that was already lifted and uneven is worse wet — the same lip that catches a toe dry now has a slick film over it too, and the grass verge sidesteps both problems for the few seconds the sprinklers run rather than betting the crossing on dry footing that is no longer there.",
      missNote: "The wet, heaved slab was crossed anyway. A dry uneven lip and a wet uneven lip are not the same fall risk, and this is the moment that difference actually mattered.",
      wrongNote: "Not that — the verge is the way around the sprinkler spray, not through it.",
    },
  ],

  steps: [
    {
      id: "ppe", kind: "sequence", anyOrder: true,
      targets: ["hi-vis-vest", "dog-deterrent"],
      itemNames: { "hi-vis-vest": "hi-vis vest", "dog-deterrent": "dog deterrent spray" },
      title: "Suit up for the walking loop",
      cue: "Hi-vis vest and the dog deterrent spray before starting the block on foot.",
      why: "A carrier on foot among driveways and blind corners is seen first because of the vest, and the deterrent spray is carried clipped and ready rather than buried in the satchel — reaching for it after a dog is already close is reaching too late to matter.",
    },
    {
      id: "dog-warning-card", kind: "select", target: "dog-warning-board",
      title: "Read the route's dog warning list",
      cue: "Read today's dog warning list for this block before walking it.",
      why: "The warning list is the route's own memory of every address where a previous carrier flagged a dog, and reading it before the block is walked is what turns a surprise at the gate into something already expected and already planned for.",
    },
    {
      id: "approach-hazard-read", kind: "find", noHint: true,
      targets: ["unleashed-dog-hazard", "propped-gate-hazard"],
      itemNames: { "unleashed-dog-hazard": "the loose dog", "propped-gate-hazard": "the propped-open gate" },
      itemNotes: {
        "unleashed-dog-hazard": "Loose in the yard, not tied and not behind a door. Read from the sidewalk — never approached.",
        "propped-gate-hazard": "Propped with a brick instead of latched. A second way for the dog to reach the sidewalk.",
      },
      decoyNotes: { "fenced-dog-decoy": "That dog is calm, behind an intact fence with the gate latched. Nothing to flag there." },
      title: "Read the approach before the front walk",
      cue: "Read the yard from the sidewalk before starting up the walk. Two things are already wrong with it — find them.",
      why: "A yard read from the sidewalk costs nothing and changes everything about what happens next; the same yard discovered at the gate line, already inside the dog's own space, has already used up the distance that made every other option available.",
    },
    {
      id: "hold-ground", kind: "hold", target: "unleashed-dog-hazard", seconds: 8,
      title: "Hold a calm, non-threatening stance",
      cue: "Hold still, side-on, without raised arms or eye contact, and read what the dog does next.",
      why: "A carrier who freezes calmly gives a loose dog nothing to react to; one who bolts, waves an arm or stares it down gives it exactly the kind of signal that turns an uncertain dog into a chasing one. The hold is the whole point — nothing happens here except watching.",
      holdBreakNote: "The stance broke early. The calm hold is what buys the time to see whether the dog is actually coming closer or just curious.",
    },
    {
      id: "retreat-sequence", kind: "sequence", anyOrder: false,
      targets: ["stop-cue-marker", "turn-sideon-marker", "retreat-path-marker"],
      itemNames: { "stop-cue-marker": "stop moving", "turn-sideon-marker": "turn side-on", "retreat-path-marker": "back away slowly" },
      title: "Work the retreat in order",
      cue: "Stop, turn side-on to the dog, then back away slowly — in that order, never turning your back.",
      why: "Each part of this sequence removes one thing a dog can react to: stopping removes the chase trigger of a moving target, turning side-on removes the confrontation of a direct face-on stance, and backing away slowly — without ever turning a back to the dog — removes distance without ever removing sight of it.",
      outOfOrderNote: "Stop, then turn side-on, then back away — reversing this gives the dog either a runner or a turned back, and either one changes what it does next.",
    },
    {
      id: "barrier-drag", kind: "drag", target: "mail-satchel",
      title: "Put the satchel between you and the dog",
      cue: "Carry the satchel in front of you as a barrier while you continue backing clear.",
      why: "A satchel held between a carrier and a dog is something to put weight against that is not an arm or a leg, and it costs nothing to carry that way while backing off — it is the cheapest barrier a carrier has on the whole route, and it is already in their hands.",
      drag: { to: "barrier-position", radius: 0.45, missNote: "Not into position — the satchel goes between you and the dog, not left hanging at your side." },
    },
    {
      id: "safe-mailbox", kind: "select", target: "safe-mailbox",
      title: "Continue to the next mailbox",
      cue: "Once clear of the yard, deliver to the next address's mailbox as normal.",
      why: "The block does not stop because one address had a dog in it — the route continues once the carrier is actually clear, which is the entire reason the retreat happened in the first place rather than a standoff that used up the rest of the loop's time.",
    },
    {
      id: "sidewalk-hazard-read", kind: "find", noHint: true,
      targets: ["broken-walkway-hazard", "obstructed-sightline-hazard"],
      itemNames: { "broken-walkway-hazard": "the heaved sidewalk slab", "obstructed-sightline-hazard": "the shrub blocking the blind corner" },
      itemNotes: {
        "broken-walkway-hazard": "Lifted a good two inches by a root underneath. It gets a wide, careful step, not a distracted stride.",
        "obstructed-sightline-hazard": "Crowds the walk right at a blind corner. It gets reported for trimming — a carrier cannot see what it hides.",
      },
      decoyNotes: { "clear-walk-decoy": "That stretch of slab is flat and unobstructed. Nothing to flag there." },
      title: "Read the walk further down the block",
      cue: "Look over the next stretch of sidewalk before crossing it. Two things are already wrong with it — find them.",
      why: "A sidewalk read for what is actually on it rather than assumed flat is how a lifted slab or a blind corner gets crossed carefully instead of caught by surprise while looking down at the next address on the satchel.",
    },
    {
      id: "balance-crossing", kind: "track", target: "heaved-slab-crossing", seconds: 8,
      title: "Cross the heaved slab",
      cue: "Cross the lifted section keeping your footing indicator inside the steady band.",
      why: "A lip this size is a stumble waiting on a distracted stride, and watching the footing indicator through the crossing is what keeps a carrier's attention on the one uneven step that actually needs it rather than on the mail already being sorted for the next address.",
      track: {
        start: 0.5, green: [0.36, 0.64], rise: 0.4, fall: 0.4, drift: 0.12,
        label: "FOOTING",
        readout: (v) => (v < 0.36 ? "rushing the step" : v > 0.64 ? "overcorrecting" : "steady footing"),
      },
      holdBreakNote: "Footing drifted out of the steady band. Slow down and place the step deliberately rather than push through the lift.",
    },
    {
      id: "mail-slot-deliver", kind: "turn", target: "mail-slot-flap",
      title: "Deliver through the mail slot",
      cue: "Turn the mail slot flap open, feed the mail through, and let it close gently.",
      why: "A mail slot flap let go carelessly snaps back on whatever is still in the opening — a hand, a finger, or the next piece of mail bent in the hinge. Turning it open and letting it ease shut is a two-second habit that keeps the slot from ever becoming its own small hazard.",
      turn: { turns: 0.3, axis: "x", label: "SLOT FLAP" },
    },
    {
      id: "dog-warning-log", kind: "select", target: "dog-warning-board",
      title: "Flag the address for the next carrier",
      cue: "Flag today's address on the route's dog warning list before moving on.",
      why: "A dog encounter that ends safely but never gets logged is a surprise the next carrier — or the same carrier on a different day — walks into cold. The warning list only works if every carrier who reads it also writes to it.",
    },
    {
      id: "block-to-block-drive", kind: "drive", target: "van-rig",
      title: "Pull out to the next block",
      cue: "Signal, check the mirror, and roll the van forward a short block at a walking-pace crawl.",
      why: "Per 49 CFR 392 a commercial vehicle's driver checks mirrors and signals before every move, even a fifty-metre crawl to the next block — a route that treats the short moves as too small to matter is a route that eventually treats all of them that way.",
      holdBreakNote: "Out of the marked lane, or moving faster than a residential crawl allows.",
      drive: {
        path: [[0, 0], [0, -4.5]],
        speedBand: [2, 6], laneWidth: 1.6, graceSeconds: 1.6, checkWindow: 2.0, sceneRate: 0.15,
        bandLabel: "residential crawl, per the posted limit",
        checks: [
          { at: 0, kind: "signal-right", note: "Signal before rolling — a carrier's own van pulling out is exactly the kind of move a distracted driver behind it will not expect." },
          { at: 1, kind: "mirror-right", note: "Mirror check before the roll: the curb side is where the last stop's foot traffic still is." },
        ],
        controls: {},
      },
    },
    {
      id: "route-checkin", kind: "select", target: "route-checkin-radio",
      title: "Check in at the end of the loop",
      cue: "Radio the loose-dog encounter and the sidewalk hazard in to dispatch before starting the next loop.",
      why: "Dispatch and the route book both depend on what actually happened on the ground reaching them — a hazard read, answered and then never reported is a hazard the route's own record has no way of learning from.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    const reg2 = (obj, id) => reg(hits, obj, id);
    stationPad(g, 2.8, ML2_ACCENT);

    // ------------------------------------------------------------ sidewalk + lawns
    const walkTex = surfaceTexture((cx, w, h) => pavingFace(cx, w, h, { tiles: 6, base: "#9aa1a6", base2: "#8c9297", seam: "rgba(0,0,0,0.3)" }), { repeat: 8, px: 512 });
    const sidewalk = box(g, 1.6, 0.1, 9.0, -1.2, 0.05, -1.0, 0xffffff, { rough: 0.9 });
    sidewalk.material = texturedMat(walkTex, { rough: 0.9, metal: 0.02, color: 0xa9adb2 });
    const lawnL = box(g, 3.2, 0.06, 9.0, -3.4, 0.02, -1.0, 0x4a7d3f, { rough: 0.95 });
    const lawnR = box(g, 3.6, 0.06, 9.0, 1.4, 0.02, -1.0, 0x4a7d3f, { rough: 0.95 });
    void lawnL; void lawnR;
    const curbLine = box(g, 0.12, 0.14, 9.0, -0.35, 0.07, -1.0, ML2_PAL.trim, { rough: 0.6, cast: false });
    void curbLine;

    // ------------------------------------------------------------ the yard with the loose dog
    const houseL = group(g, -4.3, 0, -2.2, 0.5);
    box(houseL, 2.6, 2.4, 2.2, 0, 1.2, 0, 0xd8c9a8, { rough: 0.8, finish: "painted" });
    box(houseL, 2.8, 0.1, 2.4, 0, 2.45, 0, 0x5c4b39, { rough: 0.8 });
    const porch = box(houseL, 1.4, 0.1, 0.8, 0.4, 0.35, 1.4, 0xb9beba, { rough: 0.7, finish: "concrete" });
    void porch;
    const fence = group(g, -3.0, 0, -1.2, 0.3);
    for (let i = 0; i < 6; i++) box(fence, 0.05, 0.7, 0.05, -1.4 + i * 0.55, 0.35, 0, 0x8a7550, { rough: 0.8 });
    box(fence, 3.1, 0.06, 0.05, 0, 0.6, 0, 0x8a7550, { rough: 0.8 });
    const gate = group(fence, 1.5, 0, 0, -0.7);
    box(gate, 0.65, 0.65, 0.04, 0, 0.35, 0, 0x8a7550, { rough: 0.8 });
    reg2(gate, "propped-gate-hazard");
    const gateBrick = box(fence, 0.16, 0.1, 0.1, 1.85, 0.05, 0.3, 0xa0522d, { rough: 0.9 });
    const beware = decal(fence, 0.24, 0.16, -1.35, 0.55, 0.03, signFace("DOG ON PREMISES", { bg: "#2b3138", accent: "#f2c14b", scale: 0.4 }), { px: 200 });
    void beware;

    const dog = group(g, -3.0, 0, -0.9, 0.7);
    box(dog, 0.52, 0.26, 0.22, 0, 0.44, 0, 0x6d5a45, { radius: 0.06, rough: 0.9 });
    ball(dog, 0.12, 0.3, 0.52, 0, 0x6d5a45, { rough: 0.9, seg: 12 });
    box(dog, 0.14, 0.09, 0.09, 0.4, 0.5, 0, 0x5c4b39, { rough: 0.9 });
    for (const [dx, dz] of [[0.16, 0.08], [0.16, -0.08], [-0.16, 0.08], [-0.16, -0.08]]) cyl(dog, 0.035, 0.03, 0.32, dx, 0.16, dz, 0x5c4b39, { rough: 0.9, seg: 8 });
    cyl(dog, 0.025, 0.015, 0.22, -0.3, 0.52, 0, 0x5c4b39, { rough: 0.9, seg: 8 }).rotation.z = -0.9;
    reg2(dog, "unleashed-dog-hazard");
    holoTag(dog, "loose dog", 0, 0.82, 0, { css: "#d8232a", w: 0.3 });

    const fencedDogDecoy = group(g, -4.2, 0, -0.4, -0.3);
    box(fencedDogDecoy, 0.4, 0.22, 0.18, 0, 0.36, 0, 0x8a7550, { rough: 0.9 });
    ball(fencedDogDecoy, 0.1, 0.24, 0.42, 0, 0x8a7550, { rough: 0.9, seg: 10 });
    reg2(fencedDogDecoy, "fenced-dog-decoy");

    const secondDog = group(g, -4.6, 0, -1.6, 0.9);
    box(secondDog, 0.6, 0.3, 0.26, 0, 0.5, 0, 0x3a3226, { rough: 0.9 });
    ball(secondDog, 0.14, 0.34, 0.58, 0, 0x3a3226, { rough: 0.9, seg: 12 });
    secondDog.visible = false;
    const backupRadio = group(g, -1.3, 0, -0.5, 0.4);
    box(backupRadio, 0.1, 0.16, 0.05, 0, 1.1, 0, 0x2b2f34, { rough: 0.5, metal: 0.3 });
    holoTag(backupRadio, "call for backup", 0, 1.35, 0, { css: "#2f6fb0", w: 0.3 });
    reg2(backupRadio, "backup-radio");

    // ------------------------------------------------------------ retreat path + satchel barrier
    const stopMark = group(g, -1.5, 0, -0.9, 0.3);
    holoTag(stopMark, "1 · stop", 0, 0.7, 0, { css: "#2f6fb0", w: 0.28 });
    reg2(stopMark, "stop-cue-marker");
    const turnMark = group(g, -1.3, 0, -0.4, 0.3);
    holoTag(turnMark, "2 · turn side-on", 0, 0.7, 0, { css: "#2f6fb0", w: 0.34 });
    reg2(turnMark, "turn-sideon-marker");
    const backMark = group(g, -1.1, 0, 0.3, 0.3);
    holoTag(backMark, "3 · back away", 0, 0.7, 0, { css: "#2f6fb0", w: 0.3 });
    reg2(backMark, "retreat-path-marker");

    const satchel = box(g, 0.36, 0.28, 0.14, -1.4, 0.5, -1.2, 0x3f6f9a, { rough: 0.8, finish: "brushed" });
    holoTag(satchel, "mail satchel", 0, 0.3, 0, { css: "#2f6fb0", w: 0.28 });
    reg2(satchel, "mail-satchel");
    const barrierSocket = group(g, -1.2, 0.5, -0.3);
    hits["barrier-position"] = barrierSocket;

    // ------------------------------------------------------------ the safe mailbox further down
    const mailboxSafe = group(g, -0.6, 0, 1.6, -0.4);
    cyl(mailboxSafe, 0.02, 0.02, 0.9, 0, 0.45, 0, 0x2b2f34, { rough: 0.6, metal: 0.3, seg: 8 });
    box(mailboxSafe, 0.3, 0.24, 0.4, 0, 0.95, 0, 0xd8232a, { rough: 0.6, radius: 0.08 });
    holoTag(mailboxSafe, "next mailbox", 0, 1.3, 0, { css: "#2f6fb0", w: 0.3 });
    reg2(mailboxSafe, "safe-mailbox");

    // ------------------------------------------------------------ the heaved slab + blind corner
    const heavedSlab = box(g, 0.9, 0.14, 0.7, -1.2, 0.1, 3.1, 0xa3a8ab, { rough: 0.85, finish: "concrete" });
    heavedSlab.rotation.x = -0.06;
    reg2(heavedSlab, "broken-walkway-hazard");
    const clearSlabDecoy = box(g, 0.9, 0.1, 0.7, -1.2, 0.06, 2.2, 0xa9adb2, { rough: 0.85, finish: "concrete" });
    reg2(clearSlabDecoy, "clear-walk-decoy");
    const crossingMark = group(g, -1.2, 0.1, 3.1);
    hits["heaved-slab-crossing"] = crossingMark;

    const houseR = group(g, 1.6, 0, 3.4, -0.4);
    box(houseR, 2.4, 2.2, 2.0, 0, 1.1, 0, 0xc9c3b0, { rough: 0.8, finish: "painted" });
    const shrub = group(g, 0.0, 0, 2.6, 0.3);
    ball(shrub, 0.5, 0, 0.45, 0, 0x3c6b2f, { rough: 0.95, seg: 12, seg2: 10 });
    ball(shrub, 0.4, 0.3, 0.35, 0.2, 0x3c6b2f, { rough: 0.95, seg: 10, seg2: 8 });
    reg2(shrub, "obstructed-sightline-hazard");

    const sprinklerSpray = particles(g, 24, 0xdff2f7, { size: 0.05, life: 0.7, additive: false, opacity: 0.5 });
    sprinklerSpray.position.set(-1.2, 0.15, 3.1);
    sprinklerSpray.visible = false;
    const verge = group(g, -0.4, 0, 3.1);
    hits["step-to-verge"] = verge;

    // ------------------------------------------------------------ mail slot at the next porch
    const doorFrame = group(g, 1.6, 0, 4.2, 0.5);
    box(doorFrame, 0.9, 2.0, 0.06, 0, 1.0, 0, 0x5c4b39, { rough: 0.7 });
    const slotFlap = group(doorFrame, 0, 1.0, 0.04);
    box(slotFlap, 0.3, 0.08, 0.02, 0, 0, 0, 0x8a8f95, { rough: 0.4, metal: 0.6 });
    reg2(slotFlap, "mail-slot-flap");
    holoTag(doorFrame, "mail slot", 0, 1.5, 0, { css: "#2f6fb0", w: 0.24 });

    // ------------------------------------------------------------ PPE, boards, radios
    const ppeRack = group(g, -3.6, 0, 1.6, 0.3);
    box(ppeRack, 0.3, 0.02, 0.2, 0, 0.4, 0, 0x2b3138, { rough: 0.7 });
    const vestProp = box(ppeRack, 0.22, 0.26, 0.02, 0, 0.55, 0, ML2_ACCENT, { rough: 0.85 });
    holoTag(vestProp, "hi-vis vest", 0, 0.2, 0, { css: "#2f6fb0", w: 0.28 });
    reg2(vestProp, "hi-vis-vest");
    const deterrentProp = group(ppeRack, 0.2, 0.6, 0);
    cyl(deterrentProp, 0.03, 0.03, 0.14, 0, 0, 0, 0xd8232a, { rough: 0.6, seg: 10 });
    holoTag(deterrentProp, "dog deterrent", 0, 0.15, 0, { css: "#2f6fb0", w: 0.3 });
    reg2(deterrentProp, "dog-deterrent");

    const warningBoard = holoPanel(g, 0.56, 0.4, -2.4, 1.5, 2.6, (ctx, w, h) => {
      ctx.fillStyle = "#0c141c"; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#2f6fb0"; ctx.fillRect(0, 0, w, 6);
      ctx.font = `600 ${Math.round(h * 0.11)}px 'Barlow Condensed', Arial, sans-serif`; ctx.textAlign = "left"; ctx.textBaseline = "middle";
      ctx.fillStyle = "#dcecfa"; ctx.fillText("DOG WARNING LIST", w * 0.06, h * 0.14);
      ctx.font = `${Math.round(h * 0.08)}px Arial, sans-serif`; ctx.fillStyle = "#f0f7fd";
      ["4310 Alder — loose in yard", "Flag today's address below"].forEach((l, i) => ctx.fillText(l, w * 0.06, h * (0.34 + i * 0.16)));
    }, { ry: 0.4, accent: ML2_ACCENT });
    const warningFace = warningBoard.userData.face;
    reg2(warningBoard, "dog-warning-board");

    const van = deliveryVan(g, -0.4, 0.12, -4.6, { ry: Math.PI, livery: { colour: 0xe4e0d4, fleetName: "CITY MAIL", unitNumber: "118", accent: ML2_PAL.trim } });
    reg2(van, "van-rig");

    const checkinRadio = group(g, 0.6, 0, -4.9, 0.4);
    box(checkinRadio, 0.1, 0.16, 0.05, 0, 1.1, 0, 0x2b2f34, { rough: 0.5, metal: 0.3 });
    holoTag(checkinRadio, "route check-in", 0, 1.35, 0, { css: "#2f6fb0", w: 0.3 });
    reg2(checkinRadio, "route-checkin-radio");

    const neighbor = standingFigure(g, 3.0, 3.8, { ry: -1.6, cloth: 0x37505f, vest: 0x8a8f95 });
    void neighbor;

    return {
      hits,
      footprint: 2.8,
      spawnLook: new THREE.Vector3(-2.0, 1.2, -1.5),

      onStepComplete(step) {
        if (step.id === "approach-hazard-read") { gate.rotation.y = 0; gateBrick.visible = false; }
        if (step.id === "safe-mailbox") { dog.rotation.y = 2.4; }
        if (step.id === "dog-warning-log") {
          repaint(warningFace, signFace("ADDRESS FLAGGED", { bg: "#0f1b14", accent: "#59c97b", fg: "#bff7d4", scale: 0.4 }));
        }
      },

      onInterrupt(it) {
        if (it.id === "second-dog") { secondDog.visible = true; }
        if (it.id === "sprinklers-on") { sprinklerSpray.visible = true; }
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "second-dog") { secondDog.visible = false; }
        if (it.id === "sprinklers-on") { sprinklerSpray.visible = false; }
      },

      animate(t, dt, session) {
        dog.position.y = Math.max(0, Math.sin(t * 3) * 0.01);
        if (sprinklerSpray.visible) sprinklerSpray.userData.step?.(dt, new THREE.Vector3(-1.2, 0.5, 3.1), 0.2, 0.4, 0.6);
        void session;
      },
    };
  },
};
