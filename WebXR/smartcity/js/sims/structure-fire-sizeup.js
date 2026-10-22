import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, ball, torus, slab, hose, group, decal, repaint, signFace, particles, mat,
  standingPerson,
} from "../../../shared/kit.js";
import {
  CITY, stationPad, holoPanel, holoTag, toolChest, instrument, cone, barrierPanel,
  standingFigure, valveWheel, pavingFace, reg, surfaceTexture, texturedMat,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Structure Fire Size-Up VR — Emergency Services, station 197.
// The first-arriving engine at a two-storey residential fire: the walk-around
// nobody skips, the on-scene report that puts a picture in every radio on the
// channel, water before anybody enters, the mode called out loud with the
// reason behind it, the two-in two-out rule that exists because entry is the
// one thing on this job you do not do short-handed, the line stretched and
// charged before the door, and the ten-minute PAR that proves everyone who
// went in is still accounted for. Nothing on the sizeup board is a real
// department's real address — the procedure is the point, not the place.

const SFS_ACCENT = 0xd2532b;

export const SIM_STRUCTURE_FIRE_SIZEUP = {
  id: "structure-fire-sizeup",
  index: "197",
  domain: "Emergency Services",
  trade: "Firefighter — IAFF",
  category: "Emergency Services",
  weather: "smoke",
  certification: "IAFF — NFPA 1500 fire department occupational safety and health, NFPA 1710 organization and deployment of career fire suppression, NFPA 1001 firefighter professional qualifications for the 360 and the initial line; OSHA 29 CFR 1910.134 respiratory protection, the source of the two-in two-out rule; NIMS/ICS through FEMA IS-100 and IS-700 for the incident command structure the on-scene report is given into",
  name: "Structure Fire Size-Up",
  title: simTitle("Structure Fire Size-Up"),
  tagline: "First-in engine at a two-storey residential fire: the 360, the on-scene report, water before entry, the mode called with the reason, two-in two-out, the initial line, and the ten-minute PAR",
  accent: SFS_ACCENT,
  accentCss: "#d2532b",
  parSeconds: 300,
  footprint: 2.6,
  badge: { id: "first-in-clean", name: "First-In Clean", note: "A residential structure fire sized up, reported, attacked and accounted for without an unsafe action anywhere in the job" },

  game: system({
    name: "First-In Company",
    currency: "COMMAND",
    ranks: ["Firefighter I", "Firefighter II", "Company Officer", "Incident Commander", "First-In Certified"],
    badges: [
      { id: "clean-report", name: "Clean Report", note: "On-scene report given in the order command needs it, first time", test: AWARD.stepClean("radio-report") },
      { id: "no-hazard", name: "No Hazard", note: "No unsafe action anywhere in the run", test: AWARD.safe },
      { id: "par-clean", name: "PAR Clean", note: "The ten-minute personnel accountability report held and answered without a break", test: AWARD.stepClean("par-check") },
    ],
    challenges: [
      { id: "clean-run", name: "Clean Run", note: "No corrections anywhere in the run", test: AWARD.clean },
      { id: "steady-advance", name: "Steady Advance", note: "Held the interior advance rate in band the whole way down the hall", test: AWARD.unbroken },
      { id: "first-in-fast", name: "First-In Fast", note: "Complete inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "no-scba-entry": "You started toward the door with your face piece off the seat of your mask. A residential structure fire is an IDLH atmosphere before you can see a flame from the street, and going in without your air on is not caught by a working line or a good crew — it is caught by putting the mask on before your hand touches the door.",
    "uncharged-advance": "You moved the attack line toward the door before it was charged. A flat hose at the threshold is nothing when the room lights up in front of you — no reach, no pattern, no cooling water between the crew and the fire — and the two seconds it takes to confirm water at the nozzle before advancing is the two seconds that keeps a flashover from becoming a burn.",
    "porch-overhang": "You staged the crew under the porch roof that is already sagging over the A-side window. Fire that has been showing long enough to sag a structural member has already told you what it is about to do next, and standing a crew under it is asking the building to make the decision about who gets hurt.",
    "freelance-solo": "One of the crew broke for the side door alone, outside the assignment given at the on-scene report. Freelancing means command has a person inside this building whose location nobody can account for at the ten-minute mark, and the accountability system this whole procedure runs on only works if every assignment is a crew, never a name.",
  },

  steps: [
    {
      id: "walk-360", kind: "find", noHint: true,
      targets: ["side-a-fire-showing", "side-b-egress-blocked", "side-c-utility-sagging", "side-d-clear"],
      itemNames: {
        "side-a-fire-showing": "fire showing, A side", "side-b-egress-blocked": "blocked egress, B side",
        "side-c-utility-sagging": "sagging service line, C side", "side-d-clear": "D side, clear",
      },
      itemNotes: {
        "side-a-fire-showing": "The A side is what the street sees, and it is showing fire from a first-floor window — the loudest side is never the whole story.",
        "side-b-egress-blocked": "The B-side window a resident would use to get out is blocked by a window-mount air conditioner bolted through the sill — the second way out, on this side, does not exist.",
        "side-c-utility-sagging": "The service drop on the C side is sagging low enough to reach across the yard you would ladder from — a hazard that has nothing to do with the fire and everything to do with where the aerial and the ladders can go.",
        "side-d-clear": "The D side is clear: no fire, no blocked egress, no overhead hazard. Clear is still a finding — command needs to hear the side with nothing on it as much as the one with everything on it.",
      },
      decoyNotes: { "front-lawn-flag": "A lawn ornament is not part of the 360 — the walk-around is for the building, not the yard." },
      title: "Walk the 360 before anything moves",
      cue: "Walk all four sides of the house — A, B, C, D — before the first line comes off the rig.",
      why: "Everything the crew commits to next is aimed at what the street sees on the A side, and a two-storey residential fire regularly has more going on around the back than out front. The 360 is what tells you fire is also venting a side window nobody staged for, that the only other way out is blocked, and that there is a hazard overhead the ladder crew has to route around — all of it invisible from the seat of the rig, and all of it wrong to guess at.",
    },
    {
      id: "radio-report", kind: "sequence",
      targets: ["report-building", "report-conditions", "report-resources", "report-actions"],
      itemNames: {
        "report-building": "building description", "report-conditions": "conditions",
        "report-resources": "resources needed", "report-actions": "actions taken / mode",
      },
      itemNotes: {
        "report-building": "Two-storey, wood-frame, single-family, occupied — the picture every unit still en route builds their own plan around.",
        "report-conditions": "Fire showing from a first-floor window, A side, moderate smoke from the eaves — what has already happened to the structure.",
        "report-resources": "Requesting a full first-alarm assignment — what this crew cannot do alone.",
      },
      title: "Give the on-scene report",
      cue: "Building, then conditions, then resources, then the mode and actions you are taking — in that order, over the radio.",
      why: "Command and every unit still rolling build their whole approach off the first transmission from the first rig on scene, and they build it in the order it comes in — building first so they know what they are driving toward, conditions second so they know what it is doing, resources third so mutual aid starts moving before it is needed, and the mode last because it only means something once the first three are already understood. Said out of order, the units behind you are staging a plan around information they have not heard yet.",
      outOfOrderNote: "Building, conditions, resources, then actions — reversing that order hands the units behind you a mode and a resource count with no building or conditions underneath either one.",
    },
    {
      id: "water-supply", kind: "drag", target: "supply-hose",
      title: "Lay the supply line to the hydrant",
      cue: "Carry the supply hose off the bed and drop it at the hydrant on the corner.",
      why: "A pumper's own tank runs out in a few minutes at a working fire's flow rate, and everything after this step — the attack line, the second line if the fire has spread by the time it is stretched — depends on a supply that does not run out. Laying it to the hydrant before anything else leaves the rig means the tank water already on the truck is a bridge to that supply, not the whole of it.",
      drag: { to: "hydrant", radius: 0.55, missNote: "Not at the hydrant — a supply line lying short of the steamer connection is not a supply line yet." },
    },
    {
      id: "charge-supply", kind: "turn", target: "hydrant-valve",
      title: "Charge the supply line",
      cue: "Open the hydrant fully and confirm water moving through the line.",
      why: "A hydrant opened only part way throttles the exact flow this fire is about to ask for, and it does that quietly — the gauge at the pump panel is the only thing that tells you, and by then the attack line is already stretched and waiting on water that is not coming fast enough. Wound fully open, the supply is doing everything it can do before anyone downstream needs more than it is giving.",
      turn: { turns: 1.25, axis: "y", label: "HYDRANT" },
    },
    {
      id: "mode-call", kind: "select", target: "mode-offensive",
      title: "Call the mode, and the reason",
      cue: "One room showing fire, structure intact, a report of someone still inside — call it offensive, over the radio, with the reason.",
      why: "Offensive and defensive are not a feeling, they are a conclusion drawn from what the 360 and the on-scene report just established: one room burning in a structurally sound building with an unconfirmed occupant is a fire an interior attack can still beat, and every crew on the fireground needs to hear both the call and the reason in the same transmission so a later change in conditions is judged against what was actually known when the mode was set.",
    },
    {
      id: "two-in-two-out", kind: "sequence",
      targets: ["backup-team-staged", "entry-pair-formed"],
      itemNames: { "backup-team-staged": "backup team staged at the door", "entry-pair-formed": "entry pair formed and ready" },
      itemNotes: { "backup-team-staged": "Two firefighters, geared and staged at the point of entry, ready to go in for the entry team if something goes wrong." },
      title: "Two in, two out",
      cue: "Confirm the backup pair is staged at the door before the entry pair goes in.",
      why: "OSHA's two-in two-out rule under 29 CFR 1910.134 exists because an interior attack in an IDLH atmosphere is the one task on this job nobody is allowed to do short-handed: two firefighters go in together, and two more stand ready outside the door for no other reason than to go get them if the two inside stop transmitting. Staging the backup pair before the entry pair moves is what makes the rule an actual rescue capability rather than a headcount taken after the fact.",
      outOfOrderNote: "Backup staged first, then the entry pair goes in — sending the entry pair before the backup team is standing by is the exact gap the rule was written to close.",
    },
    {
      id: "attack-line-stretch", kind: "drag", target: "attack-line-coil",
      title: "Stretch the initial attack line",
      cue: "Pull the 1¾-inch crosslay off the bed and stretch it to the front door.",
      why: "The stretch is measured to the door with enough hose to work the whole first floor once it is charged, not to the porch step with the coupling still short — a line that runs out three feet inside the room means backing the whole crew out to pull more hose while the fire keeps doing what fire does with the time it is given.",
      drag: { to: "front-door-position", radius: 0.55, missNote: "Short of the door — a line that stops at the porch has to be re-stretched before anybody can flow water on the fire." },
    },
    {
      id: "charge-attack-line", kind: "turn", target: "engine-discharge-valve",
      title: "Charge the attack line",
      cue: "Open the discharge at the pump panel and confirm water at the nozzle before the door.",
      why: "A charged line at the threshold is a tool; an uncharged one is a length of rubber the crew is about to walk into a room on fire while holding. Confirming water at the nozzle before the door is what separates the two, and it is done here, at the pump panel, rather than discovered by a firefighter cracking the bail on the other end and getting nothing.",
      turn: { turns: 1.0, axis: "z", label: "1¾ DISCHARGE" },
    },
    {
      id: "conditions-read", kind: "gauge", target: "conditions-gauge",
      title: "Read the interior conditions before committing search",
      cue: "Run the thermal imager across the doorway and commit on what it reads for heat.",
      why: "The thermal imager is not a formality at the threshold — it is the difference between a hot but survivable interior and a room close enough to flashover that a primary search inside it becomes a second rescue. What the camera reads here is what the next step's decision is actually built on, not a number for its own sake.",
      gauge: { label: "DOORWAY HEAT", speed: 0.72, green: [0.15, 0.42], readout: (t) => `${Math.round(150 + t * 500)} °F`, missNote: "That reading is outside the band a primary search can be run against — call it up to command before anybody commits to going further in." },
    },
    {
      id: "commit-search", kind: "select", target: "commit-primary-search",
      title: "Weigh the bystander's report against what you just read",
      cue: "A bystander says her father is still inside, upstairs. The conditions are inside the band. Commit the primary search.",
      why: "An unconfirmed report of someone inside is never nothing, and it is never enough on its own either — it is weighed against what the 360 and the thermal reading already told you about this specific room and this specific fire, right now. Conditions inside the band with a specific, plausible report of a specific person's location is what a primary search assignment is actually built on; the same report against conditions that are not survivable is a search that gets planned differently, not skipped.",
    },
    {
      id: "interior-advance", kind: "track", target: "hallway-advance-point", seconds: 7,
      title: "Advance the line down the hall",
      cue: "Move the entry pair down the hallway at a steady, low crouch — not a crawl, not a run.",
      track: { label: "ADVANCE", green: [0.35, 0.62], rise: 0.55, fall: 0.45, drift: 0.13, readout: (v) => (v < 0.35 ? "stalled" : v > 0.62 ? "too fast" : "steady") },
      why: "Too slow and the fire gets more time with the building than the line is buying back; too fast and the crew outruns their own hose, their own visibility and the backup pair's ability to follow the line to them if something goes wrong. A steady, low advance is the pace that keeps the whole crew — inside and at the door — able to account for where everybody actually is.",
      holdBreakNote: "The advance stalled or ran ahead of the line. A hallway advance holds one pace because everyone behind you is following that same pace to find you.",
    },
    {
      id: "par-check", kind: "hold", target: "par-radio", seconds: 8,
      title: "Call the ten-minute PAR",
      cue: "Key the radio and hold it while every crew on scene calls in accounted-for.",
      why: "NFPA 1500 sets a personnel accountability report at defined intervals — ten minutes into an interior operation is the department's own trigger — because a working fire with multiple crews inside is exactly the situation where losing track of one person happens quietly. Holding the channel until every assignment has answered is what turns 'probably fine' into a number command can actually stand behind.",
      holdBreakNote: "The PAR was cut short before every crew answered. A partial roll call is not a roll call — key up again and hold until the last assignment reports in.",
    },
    {
      id: "op-log", kind: "select", target: "incident-log-board",
      title: "Log the operation",
      cue: "Write the time of the on-scene report, the mode called, the PAR result and the outcome into the incident log.",
      why: "The verbal report on the radio is heard once and then it is gone; the written log is what the after-action review, the next shift and, if it ever comes to it, an investigation actually reads. Logging the mode, the timing and the PAR result while the run is still fresh is what makes tonight's decisions defensible on paper, not just correct in the moment.",
    },
    {
      id: "crew-checkin", kind: "select", target: "crew-checkin-board",
      title: "Check in with the crew",
      cue: "Ask the crew how they're doing — not just whether the job is done — and note it.",
      why: "A crew that just pulled a report of a trapped occupant, worked a mayday call and held a line through an interior advance has been through more than the incident log captures, and the department's own peer-support and critical-incident stress management line exists precisely for the run that looked routine on paper and was not routine to be inside of. Asking the question, and writing down the answer, is what makes checking on the crew part of the job instead of an afterthought left to whoever remembers.",
    },
  ],

  interrupts: [
    {
      id: "bystander-rush",
      kind: "Bystander breaking the line",
      after: "attack-line-stretch", delay: 3, seconds: 13,
      alert: "A woman has ducked past the tape and is pushing toward the front door, shouting that her father is still inside.",
      cue: "She goes to the accountability officer, calmly — not through the door.",
      target: "accountability-officer",
      why: "A bystander who reaches the door before the crew does becomes a second person to account for inside a building that is already on fire, and the fastest way to lose the exact information she has — where he is, what he can and cannot do — is to physically block her and say nothing. Walking her to the accountability officer gets that information into the report calmly, on the record, without anyone laying a hand on her or losing sight of the door.",
      missNote: "She reached the door frame before anybody moved to stop her. Whatever she knows about where her father is has not reached command, and the crew now has a civilian at the point of entry on top of everything else they are managing.",
      wrongNote: "It is the bystander, not the door and not the line in your hands — she needs a person to talk to, calmly, and that person is the accountability officer.",
    },
    {
      id: "mayday-called",
      kind: "Mayday — another crew",
      after: "par-check", delay: 3, seconds: 14,
      alert: "Truck 2's radio just transmitted: \"Mayday, Mayday, Mayday — firefighter down, second floor, B side.\"",
      cue: "Every other transmission stops. Clear the channel for Mayday traffic.",
      target: "mayday-radio",
      why: "A Mayday call takes priority over every other transmission on the fireground the instant it goes out, because the crew member who called it may only get to say it once — routine traffic stepped on top of it, even for a few seconds, can cost the rapid intervention team the location and the detail that gets them there in time.",
      missNote: "Routine traffic kept going over the Mayday. Somewhere on the B side, second floor, a firefighter is transmitting into a channel that is not actually clear for them, and every second that call gets stepped on is a second the rapid intervention team is not moving on real information.",
      wrongNote: "It is the radio, not the PAR count or anything else in front of you — a Mayday call outranks every other transmission the instant it goes out.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.6, SFS_ACCENT);

    // --------------------------------------------------------------- street
    const street = box(g, 6.0, 0.02, 3.2, 0, 0.005, 1.6, 0x33383e, { rough: 0.95, cast: false });
    street.material = texturedMat(
      surfaceTexture((cx, w, h) => pavingFace(cx, w, h, { tiles: 6, base: "#2c3138", base2: "#23282e", seam: "rgba(0,0,0,0.5)" }), { repeat: 5, px: 384 }),
      { rough: 0.92, metal: 0.05, color: 0x33383e },
    );
    const sidewalk = box(g, 6.0, 0.05, 0.9, 0, 0.03, -0.1, 0x9aa2a8, { rough: 0.85, cast: false });
    sidewalk.material = texturedMat(
      surfaceTexture((cx, w, h) => pavingFace(cx, w, h, { tiles: 4, base: "#9aa2a8", base2: "#8b939a", seam: "rgba(0,0,0,0.3)" }), { repeat: 4, px: 320 }),
      { rough: 0.85, color: 0x9aa2a8 },
    );
    for (let i = 0; i < 8; i++) { // curb-side grass tufts, front yard
      const gx = -2.6 + i * 0.7, gz = -0.7 + (i % 2) * 0.15;
      cyl(g, 0.02, 0.03, 0.1 + Math.random() * 0.06, gx, 0.05, gz, 0x3b5a34, { rough: 0.95, seg: 5 });
    }

    // ------------------------------------------------------------- the house
    const house = group(g, 0, 0, -2.3);
    // Foundation, first and second floor walls, gable roof.
    box(house, 3.4, 0.3, 3.2, 0, 0.15, 0, 0x6d6a63, { rough: 0.92, finish: "concrete", tile: [3, 1] });
    const siding = 0x8f7458;
    box(house, 3.3, 1.5, 3.0, 0, 1.05, 0, siding, { rough: 0.85, finish: "painted", tile: [3, 2] });
    box(house, 3.3, 1.4, 3.0, 0, 2.5, 0, 0x7c6249, { rough: 0.85, finish: "painted", tile: [3, 2] });
    for (let i = 0; i < 10; i++) { // clapboard seams, first and second floor
      box(house, 3.28, 0.012, 3.02, 0, 0.4 + i * 0.22, 0, 0x5c4a38, { rough: 0.9, cast: false });
    }
    const roofL = box(house, 2.4, 0.1, 1.9, -0.85, 3.55, 0.4, 0x3c3630, { rough: 0.85 });
    roofL.rotation.z = 0.42;
    const roofR = box(house, 2.4, 0.1, 1.9, 0.85, 3.55, 0.4, 0x3c3630, { rough: 0.85 });
    roofR.rotation.z = -0.42;
    for (let i = 0; i < 12; i++) { // shingle courses, painted stripes on each roof slope
      box(roofL, 2.35, 0.012, 0.16, 0, -0.85 + i * 0.16, 0, 0x2f2a24, { rough: 0.9, cast: false });
      box(roofR, 2.35, 0.012, 0.16, 0, -0.85 + i * 0.16, 0, 0x2f2a24, { rough: 0.9, cast: false });
    }
    box(house, 3.34, 0.1, 0.12, 0, 3.98, 1.55, 0x2b2723, { rough: 0.8 }); // ridge cap / gutter run
    box(house, 3.34, 0.1, 0.12, 0, 1.78, 1.51, 0x2b2723, { rough: 0.6, metal: 0.3, cast: false }); // gutter, first floor

    // A-side front door, porch and the sagging overhang.
    const porch = group(house, 0, 0, 1.45);
    box(porch, 1.9, 0.08, 0.85, 0, 0.34, 0.4, 0x5c4a38, { rough: 0.85 });
    for (const px of [-0.85, 0.85]) cyl(porch, 0.04, 0.04, 1.5, px, 1.1, 0.7, 0xdedad0, { rough: 0.6, seg: 10 });
    const overhang = box(porch, 1.9, 0.08, 0.9, 0, 1.85, 0.4, 0x5c4a38, { rough: 0.85 });
    overhang.rotation.z = 0.09; // sagged
    holoTag(porch, "Overhang — sagging", 0, 2.05, 0.55, { css: "#f0645b", w: 0.42 });
    reg(hits, overhang, "porch-overhang");
    const door = box(porch, 0.78, 1.55, 0.06, 0, 0.78, 0.72, 0x4a3a2c, { rough: 0.75 });
    void door;
    const frontDoorPos = box(porch, 0.5, 0.5, 0.3, 0, 0.9, 1.0, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    hits["front-door-position"] = frontDoorPos;

    // A-side fire showing: first-floor window with an orange emissive glow and smoke.
    const winA = box(house, 0.55, 0.7, 0.05, 1.05, 1.15, 1.51, 0xf2a23b, { emissive: 0xf2a23b, ei: 1.6, rough: 0.4, cast: false });
    holoTag(house, "A side — fire showing", 1.05, 1.95, 1.6, { css: "#f0645b", w: 0.46 });
    reg(hits, winA, "side-a-fire-showing");
    const smokeA = particles(house, 40, 0x4a4a4e, { size: 0.05, life: 1.4, additive: false, opacity: 0.4 });
    smokeA.position.set(1.05, 2.1, 1.55);

    // Front-lawn decoy — no procedural content, just a thing that isn't the building.
    const lawnFlag = group(house, -1.6, 0, 2.2);
    cyl(lawnFlag, 0.015, 0.015, 0.5, 0, 0.25, 0, 0x8b6a42, { rough: 0.8, seg: 6 });
    box(lawnFlag, 0.14, 0.1, 0.01, 0.08, 0.44, 0, 0xd2532b, { rough: 0.7 });
    reg(hits, lawnFlag, "front-lawn-flag");

    // B side (right, +x): the egress window blocked by an AC unit, and a ladder.
    const sideB = group(house, 1.72, 0, 0.2, -Math.PI / 2);
    const winB = box(sideB, 0.5, 0.6, 0.05, 0, 1.15, 0, 0x232a30, { rough: 0.4, metal: 0.2, opacity: 0.55, transparent: true, cast: false });
    const acUnit = box(sideB, 0.55, 0.4, 0.35, 0, 1.0, 0.18, 0xc9d0d6, { rough: 0.5, metal: 0.4 });
    for (let i = 0; i < 3; i++) box(acUnit, 0.5, 0.03, 0.02, 0, -0.12 + i * 0.09, 0.19, 0x8a949d, { rough: 0.5, metal: 0.6, cast: false });
    holoTag(sideB, "B side — egress blocked", 0, 1.7, 0.2, { css: "#f0645b", w: 0.48 });
    reg(hits, winB, "side-b-egress-blocked");
    const ladder = group(house, 1.5, 0, -0.6, -0.15);
    for (const lx of [-0.14, 0.14]) cyl(ladder, 0.02, 0.02, 2.8, lx, 1.4, 0, 0xd8b23a, { rough: 0.6, metal: 0.3, seg: 8 });
    for (let i = 0; i < 9; i++) box(ladder, 0.32, 0.02, 0.02, 0, 0.2 + i * 0.3, 0, 0xd8b23a, { rough: 0.6, metal: 0.3 });

    // C side (rear, -z from house centre): sagging service line on a pole.
    const sideC = group(house, -1.0, 0, -1.65);
    const pole = cyl(sideC, 0.05, 0.06, 3.4, -0.6, 1.7, 0, 0x5a4634, { rough: 0.9, seg: 10 });
    void pole;
    const wire = hose(sideC, [[-0.6, 3.2, 0], [0.1, 2.6, 0.35], [0.7, 3.1, 0.65]], 0.014, 0x1b1e22, { steps: 10, seg: 6, rough: 0.6 });
    holoTag(sideC, "C side — service line sagging", 0.1, 3.5, 0.35, { css: "#f0645b", w: 0.5 });
    reg(hits, wire, "side-c-utility-sagging");

    // D side (left, -x): clear.
    const sideD = group(house, -1.72, 0, 0.2, Math.PI / 2);
    const clearPlate = box(sideD, 0.4, 0.4, 0.05, 0, 1.2, 0, 0x2a2f34, { rough: 0.6, cast: false });
    holoTag(sideD, "D side — clear", 0, 1.55, 0, { css: "#59c97b", w: 0.34 });
    reg(hits, clearPlate, "side-d-clear");
    const hoseReel = group(sideD, 0.5, 0, -0.4);
    torus(hoseReel, 0.16, 0.05, 0, 0.2, 0, 0x3d4b55, { rough: 0.6, seg: 8, seg2: 16 }).rotation.y = Math.PI / 2;

    // Hallway just inside the front door: a short interior throat for the advance.
    const hall = group(house, 0, 0, 1.0);
    box(hall, 1.1, 2.0, 0.04, 0, 1.0, 0.35, 0x2b2620, { rough: 0.9, cast: false });
    box(hall, 0.04, 2.0, 1.3, -0.55, 1.0, -0.3, 0x2b2620, { rough: 0.9, cast: false });
    box(hall, 0.04, 2.0, 1.3, 0.55, 1.0, -0.3, 0x2b2620, { rough: 0.9, cast: false });
    const hallwayAdvance = box(hall, 0.5, 0.5, 0.5, 0, 1.0, -0.75, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, hallwayAdvance, "hallway-advance-point");
    const conditionsGaugeObj = instrument(hall, 0.35, 0.9, 0.3, { ry: -0.5, idle: "-- °F", color: SFS_ACCENT, w: 0.13 });
    reg(hits, conditionsGaugeObj, "conditions-gauge");
    const searchBoard = decal(hall, 0.24, 0.15, -0.35, 0.85, 0.32, signFace("SEARCH", { bg: "#1b1211", accent: "#f2c14b", fg: "#ffe9c8", scale: 0.55 }), { px: 128 });
    holoTag(hall, "Commit primary search", -0.35, 1.05, 0.32, { css: "#f2c14b", w: 0.4 });
    reg(hits, searchBoard, "commit-primary-search");
    const smokeHall = particles(hall, 30, 0x3a3a3e, { size: 0.045, life: 1.2, additive: false, opacity: 0.35 });
    smokeHall.position.set(0, 1.6, -0.5);

    // No-SCBA trap: a spare mask sitting on the ground by the door, tempting to skip.
    const spareMask = group(porch, 0.7, 0, 0.2);
    ball(spareMask, 0.09, 0, 0.09, 0, 0x2b3138, { rough: 0.6 });
    box(spareMask, 0.14, 0.03, 0.05, 0, 0.02, 0.1, 0xdfe4e8, { rough: 0.5 });
    holoTag(spareMask, "Mask off — go in now?", 0, 0.24, 0, { css: "#f0645b", w: 0.5 });
    reg(hits, spareMask, "no-scba-entry");

    // Uncharged-advance trap: a ghost marker pushing the line toward the door before it is charged.
    const unchargedAdvance = group(g, 0.55, 0, -0.15);
    box(unchargedAdvance, 0.4, 0.02, 0.4, 0, 0.011, 0, 0xf0645b, { rough: 0.7, emissive: 0xf0645b, ei: 0.3 });
    holoTag(unchargedAdvance, "Advance the line uncharged?", 0, 0.16, 0, { css: "#f0645b", w: 0.56 });
    reg(hits, unchargedAdvance, "uncharged-advance");

    // Freelance-solo trap: a side path away from the assigned door.
    const soloPath = group(house, -1.1, 0, 0.9);
    box(soloPath, 0.5, 0.02, 0.5, 0, 0.011, 0, 0xf0645b, { rough: 0.7, emissive: 0xf0645b, ei: 0.3 });
    holoTag(soloPath, "Side door — go it alone?", 0, 0.16, 0, { css: "#f0645b", w: 0.52 });
    reg(hits, soloPath, "freelance-solo");

    // ------------------------------------------------------------ apparatus
    const engine = group(g, 2.15, 0, 1.75, -Math.PI / 2 - 0.1);
    box(engine, 3.6, 0.9, 1.1, 0, 0.75, 0, 0xb3261e, { rough: 0.45, metal: 0.3 });
    box(engine, 0.9, 0.9, 1.1, 2.1, 0.75, 0, 0xb3261e, { rough: 0.45, metal: 0.3 });
    box(engine, 0.86, 0.45, 1.12, 2.1, 1.05, 0, 0x1a2129, { rough: 0.3, metal: 0.5 });
    for (const wx of [-1.3, 0.2, 1.9]) for (const wz of [-0.55, 0.55]) {
      const wheel = cyl(engine, 0.26, 0.26, 0.24, wx, 0.26, wz, 0x1a1e23, { rough: 0.9, seg: 14 });
      wheel.rotation.x = Math.PI / 2;
    }
    box(engine, 0.5, 0.08, 0.9, 2.1, 1.32, 0, 0xff3b3b, { emissive: 0xff3b3b, ei: 1.4, rough: 0.3, cast: false });
    // Hose bed: supply hose (pickup) and attack line crosslay (pickup).
    const bed = group(engine, -0.9, 1.2, 0);
    const supplyHose = torus(bed, 0.16, 0.05, 0, 0, -0.2, 0xd2532b, { rough: 0.65, seg: 8, seg2: 16 });
    supplyHose.rotation.x = Math.PI / 2;
    holoTag(bed, "Supply hose", 0, 0.24, -0.2, { css: "#d2532b", w: 0.3 });
    reg(hits, supplyHose, "supply-hose");
    const attackCoil = torus(bed, 0.14, 0.045, 0, 0, 0.2, 0xe8e2d6, { rough: 0.65, seg: 8, seg2: 16 });
    attackCoil.rotation.x = Math.PI / 2;
    holoTag(bed, "Attack line — 1¾", 0, 0.22, 0.2, { css: "#d2532b", w: 0.34 });
    reg(hits, attackCoil, "attack-line-coil");
    // Pump panel: discharge valve and gauges, on the near side.
    const panel = group(engine, 0.6, 0.9, 0.58);
    box(panel, 0.7, 0.55, 0.06, 0, 0, 0, 0x2b2f34, { rough: 0.5, metal: 0.4 });
    const dischargeValve = valveWheel(panel, -0.2, 0.05, 0.06, { color: 0xd2532b, body: 0x8a1f1f, r: 0.09 });
    holoTag(panel, "1¾ discharge", -0.2, 0.28, 0.06, { css: "#d2532b", w: 0.32 });
    reg(hits, dischargeValve, "engine-discharge-valve");
    const pumpGauge = decal(panel, 0.16, 0.16, 0.18, 0.06, 0.06, signFace("-- psi", { bg: "#12191f", accent: "#d2532b", fg: "#ffd9d9", scale: 0.55 }), { glow: true, ei: 0.6 });
    void pumpGauge;
    // Cab radios: the on-scene report / mode board, PAR radio and Mayday radio, each its own control.
    const cab = group(engine, 2.0, 1.15, 0.58);
    const reportBoard = holoPanel(cab, 0.62, 0.42, 0, 0.42, 0, (ctx, w, h) => {
      ctx.fillStyle = "rgba(24,10,6,0.9)"; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#d2532b"; ctx.fillRect(0, 0, w, 5);
      ctx.font = `600 ${Math.round(h * 0.12)}px 'Barlow Condensed', Arial, sans-serif`;
      ctx.textAlign = "left"; ctx.textBaseline = "middle"; ctx.fillStyle = "#ffe4d9";
      ctx.fillText("ON-SCENE REPORT", w * 0.06, h * 0.15);
      ctx.font = `${Math.round(h * 0.09)}px Arial, sans-serif`; ctx.fillStyle = "#ffd6c4";
      ["1. Building", "2. Conditions", "3. Resources", "4. Actions / mode"].forEach((l, i) => ctx.fillText(l, w * 0.06, h * (0.32 + i * 0.17)));
    }, { accent: SFS_ACCENT });
    const rbSpec = [["report-building", -0.22, 0.16], ["report-conditions", -0.07, 0.16], ["report-resources", 0.07, 0.16], ["report-actions", 0.22, 0.16]];
    for (const [id, bx, by] of rbSpec) {
      const btn = box(cab, 0.1, 0.06, 0.02, bx, by, 0.02, 0xf2c14b, { emissive: 0xf2c14b, ei: 0.5, rough: 0.5 });
      reg(hits, btn, id);
    }
    void reportBoard;
    const modePanel = group(cab, 0.0, -0.15, 0.06);
    const modeOff = box(modePanel, 0.16, 0.06, 0.02, -0.1, 0, 0, 0xf2c14b, { emissive: 0xf2c14b, ei: 0.5, rough: 0.5 });
    decal(modePanel, 0.14, 0.04, -0.1, 0.05, 0.02, signFace("OFFENSIVE", { bg: "#1b1e22", accent: "#59c97b", scale: 0.5 }), { px: 96 });
    reg(hits, modeOff, "mode-offensive");
    const modeDef = box(modePanel, 0.16, 0.06, 0.02, 0.1, 0, 0, 0x2b2f34, { rough: 0.5 });
    decal(modePanel, 0.14, 0.04, 0.1, 0.05, 0.02, signFace("DEFENSIVE", { bg: "#1b1e22", accent: "#8a949d", scale: 0.5 }), { px: 96 });
    reg(hits, modeDef, "mode-defensive");
    const parRadio = group(cab, -0.28, -0.05, 0.1);
    box(parRadio, 0.08, 0.15, 0.05, 0, 0, 0, 0x2b3138, { rough: 0.5 });
    holoTag(parRadio, "PAR radio", 0, 0.14, 0, { css: "#d2532b", w: 0.26 });
    reg(hits, parRadio, "par-radio");
    const maydayRadio = group(cab, 0.32, -0.02, 0.1);
    box(maydayRadio, 0.08, 0.15, 0.05, 0, 0, 0, 0x2b3138, { rough: 0.5 });
    holoTag(maydayRadio, "Command channel", 0, 0.14, 0, { css: "#f0645b", w: 0.32 });
    reg(hits, maydayRadio, "mayday-radio");

    // Hydrant on the far corner.
    const hydrant = group(g, -2.15, 0, 1.3);
    cyl(hydrant, 0.1, 0.12, 0.55, 0, 0.28, 0, 0xd2532b, { rough: 0.55, metal: 0.3, seg: 14 });
    ball(hydrant, 0.12, 0, 0.58, 0, 0xd2532b, { rough: 0.55, seg: 12 });
    for (const hx of [-1, 1]) cyl(hydrant, 0.045, 0.045, 0.14, hx * 0.13, 0.4, 0, 0xd2532b, { rough: 0.55, metal: 0.3, seg: 10 }).rotation.z = Math.PI / 2;
    holoTag(hydrant, "Hydrant", 0, 0.75, 0, { css: "#d2532b", w: 0.26 });
    hits["hydrant"] = hydrant;
    const hydrantValve = cyl(hydrant, 0.05, 0.05, 0.06, 0, 0.68, 0, 0xc9ced4, { rough: 0.4, metal: 0.7, seg: 10 });
    reg(hits, hydrantValve, "hydrant-valve");

    // Accountability post, incident log board, crew check-in board.
    const acctPost = group(g, -0.4, 0, 1.9);
    box(acctPost, 0.5, 0.9, 0.05, 0, 0.45, 0, 0x2b3138, { rough: 0.6 });
    holoTag(acctPost, "Accountability", 0, 1.0, 0, { css: "#d2532b", w: 0.38 });
    const accountOfficer = reg(hits, standingFigure(g, -0.4, 2.55, { ry: Math.PI, cloth: 0x2b3138, helmet: 0x1b1e22, vest: 0xf2c14b }), "accountability-officer");
    void accountOfficer;
    const backupPair = group(g, 0.5, 0, -0.55);
    ball(backupPair, 0.03, -0.15, 0.9, 0, SFS_ACCENT, { emissive: SFS_ACCENT, ei: 1.2 });
    ball(backupPair, 0.03, 0.15, 0.9, 0, SFS_ACCENT, { emissive: SFS_ACCENT, ei: 1.2 });
    holoTag(backupPair, "Backup team", 0, 1.1, 0, { css: "#d2532b", w: 0.3 });
    reg(hits, backupPair, "backup-team-staged");
    const entryPair = group(g, -0.15, 0, -0.55);
    ball(entryPair, 0.03, -0.15, 0.9, 0, 0x59c97b, { emissive: 0x59c97b, ei: 1.2 });
    ball(entryPair, 0.03, 0.15, 0.9, 0, 0x59c97b, { emissive: 0x59c97b, ei: 1.2 });
    holoTag(entryPair, "Entry pair", 0, 1.1, 0, { css: "#59c97b", w: 0.28 });
    reg(hits, entryPair, "entry-pair-formed");

    const logBoard = holoPanel(g, 0.55, 0.38, 1.4, 1.35, 1.85, (ctx, w, h) => {
      ctx.fillStyle = "rgba(20,14,10,0.9)"; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#d2532b"; ctx.fillRect(0, 0, w, 5);
      ctx.font = `600 ${Math.round(h * 0.13)}px 'Barlow Condensed', Arial, sans-serif`;
      ctx.textAlign = "left"; ctx.textBaseline = "middle"; ctx.fillStyle = "#ffe4d9";
      ctx.fillText("INCIDENT LOG", w * 0.06, h * 0.16);
      ctx.font = `${Math.round(h * 0.09)}px Arial, sans-serif`; ctx.fillStyle = "#ffd6c4";
      ["On-scene time / mode", "PAR result — accounted", "Outcome, next shift note"].forEach((l, i) => ctx.fillText(l, w * 0.06, h * (0.36 + i * 0.19)));
    }, { ry: -0.6, accent: SFS_ACCENT });
    reg(hits, logBoard, "incident-log-board");

    const checkinBoard = holoPanel(g, 0.55, 0.38, -1.5, 1.35, 1.85, (ctx, w, h) => {
      ctx.fillStyle = "rgba(10,18,20,0.9)"; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#59c97b"; ctx.fillRect(0, 0, w, 5);
      ctx.font = `600 ${Math.round(h * 0.13)}px 'Barlow Condensed', Arial, sans-serif`;
      ctx.textAlign = "left"; ctx.textBaseline = "middle"; ctx.fillStyle = "#e2fbe9";
      ctx.fillText("CREW CHECK-IN", w * 0.06, h * 0.16);
      ctx.font = `${Math.round(h * 0.085)}px Arial, sans-serif`; ctx.fillStyle = "#cdeed9";
      ["\"How are you doing?\" — ask it", "Peer-support / CISM line posted", "Answer logged, not assumed"].forEach((l, i) => ctx.fillText(l, w * 0.06, h * (0.36 + i * 0.19)));
    }, { ry: 0.6, accent: 0x59c97b });
    reg(hits, checkinBoard, "crew-checkin-board");

    // Tape line and a cone between the street and the porch.
    barrierPanel(g, 0.3, 0.9, { w: 1.4, ry: 0.2 });
    cone(g, -1.0, 1.0);
    cone(g, 1.2, 1.0);

    // The bystander, staged near the tape until her interruption fires.
    const bystander = standingFigure(g, 0.55, 1.15, { ry: -2.4, cloth: 0x5a3d5c, atStation: true });
    holoTag(bystander, "Bystander", 0, 1.9, 0, { css: "#f0645b", w: 0.3 });

    // Two real crew figures, kept clear of the apparatus and the house.
    standingFigure(g, 1.4, 0.25, { ry: 2.7, cloth: 0x2b3138, helmet: 0x1b1e22, vest: 0xf2c14b });
    standingFigure(g, -1.35, -1.4, { ry: 1.0, cloth: 0x2b3138, helmet: 0x1b1e22, vest: 0xf2c14b });
    void standingPerson;

    let modeChosen = null;
    return {
      hits,
      footprint: 2.6,
      spawnLook: new THREE.Vector3(0, 1.2, -1.0),

      onStepComplete(step) {
        if (step.id === "water-supply") { supplyHose.visible = false; }
        if (step.id === "charge-supply") { hydrantValve.rotation.y = Math.PI; }
        if (step.id === "mode-call") modeChosen = "offensive";
        if (step.id === "attack-line-stretch") { attackCoil.visible = false; }
        if (step.id === "commit-search") repaint(searchBoard, signFace("SEARCH — GO", { bg: "#1b1211", accent: "#59c97b", fg: "#eafbf1", scale: 0.5 }));
        if (step.id === "par-check") repaint(reportBoard.userData.face, (ctx, w, h) => {
          ctx.fillStyle = "rgba(10,18,20,0.9)"; ctx.fillRect(0, 0, w, h); ctx.fillStyle = "#59c97b"; ctx.fillRect(0, 0, w, 5);
          ctx.font = `600 ${Math.round(h * 0.18)}px 'Barlow Condensed', Arial, sans-serif`; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillStyle = "#eafbf1";
          ctx.fillText("PAR — ALL ACCOUNTED", w / 2, h * 0.5);
        });
      },

      onInterrupt(it) {
        if (it.id === "bystander-rush") { bystander.position.set(0.15, 0, 0.55); bystander.rotation.y = -1.0; }
        if (it.id === "mayday-called") { maydayRadio.children[0].material = mat(0xf0645b, { emissive: 0xf0645b, ei: 2.2, rough: 0.4 }); }
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "bystander-rush") { bystander.position.set(0.55, 0, 1.15); bystander.rotation.y = -2.4; }
        if (it.id === "mayday-called") { maydayRadio.children[0].material = mat(0x2b3138, { rough: 0.5 }); }
      },

      animate(t, dt) {
        smokeA.visible = true; smokeA.userData.step(dt, new THREE.Vector3(0, 0, 0), 0.1, 0.35, 0.55);
        smokeHall.visible = true; smokeHall.userData.step(dt, new THREE.Vector3(0, 0, 0), 0.12, 0.25, 0.3);
        winA.material.emissiveIntensity = 1.3 + Math.max(0, Math.sin(t * 5)) * 0.5;
        if (modeChosen) { /* mode locked in, no further animation needed */ void modeChosen; }
      },
    };
  },
};
