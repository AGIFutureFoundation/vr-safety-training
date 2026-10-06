import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, ball, torus, group, decal, repaint, signFace, paperFace,
  particles, mat,
} from "../../../shared/kit.js";
import {
  CITY, stationPad, holoPanel, holoTag, instrument, cone, barrierPanel,
  standingFigure, lockTag, reg,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Grain Bin VR — Manufacturing & Automation, station seven.
//
// Going into a storage bin at a terminal elevator to break up grain that has
// stopped flowing. Everything else on this platform that looks like a confined
// space is about the air. This one is not. Grain that is moving behaves like a
// liquid nobody can swim in: it takes a worker past the knees in seconds and
// covers them shortly after, and the pull needed to recover a buried body is
// far more than a harness, a rope or a coworker can safely apply. So the whole
// procedure is arranged around never being on moving grain at all — everything
// that moves grain locked out before the hatch comes off, the bridge broken
// from above with a bar instead of walked on, a lifeline with the slack already
// wound out, and an observer who stays outside and can raise the plant without
// leaving the opening.
//
// A bin is also a dust explosion environment, which is why housekeeping,
// bonding and a rated light belong to this entry rather than to a separate job.

const GB_ACCENT = 0xe0a458;
const GRAIN_LIGHT = 0xc9a962;
const GRAIN_DARK = 0x8d7434;
const CAKED = 0xa8873f;

export const SIM_GRAIN_BIN = {
  id: "grain-bin",
  index: "59",
  domain: "Manufacturing",
  trade: "Grain elevator operator / bin entry crew",
  category: "Manufacturing & Automation",
  weather: "clear",
  certification: "BCTGM — grain miller and terminal elevator operator, with the grain-handling locals; OSHA 29 CFR 1910.272 grain handling facilities, whose entry provisions at 1910.272(g) cover bins, silos and tanks: equipment that presents a danger de-energised, disconnected, locked out and tagged; a body harness with lifeline; an observer stationed outside with communications maintained; rescue equipment suited to the structure; and no entry underneath a bridging condition or where built-up grain on the sides could fall and bury. Walking down grain is prohibited by the same standard. OSHA 1910.147 energy control; 1910.146 permit-required confined spaces where it applies",
  name: "Grain Bin",
  title: simTitle("Grain Bin"),
  tagline: "Breaking a bridge in a terminal bin: everything that moves grain locked out first, dust down and bonded, atmosphere proved, the crust worked from above on a tight line with an observer who never leaves the hatch",
  accent: GB_ACCENT,
  accentCss: "#e0a458",
  parSeconds: 300,
  footprint: 2.2,
  badge: { id: "never-on-the-grain", name: "Never On The Grain", note: "A bridge broken from above with the bin locked out, the line tight and the observer still at the hatch" },

  game: system({
    name: "Bin Entry Authority",
    currency: "BUSHEL",
    ranks: ["Elevator Hand", "Grain Miller", "Bin Entry Lead", "Elevator Superintendent", "Bin Entry Authority Certified"],
    badges: [
      { id: "locked-first", name: "Locked First", note: "Every motor that moves grain dead and locked before the hatch came off, first time", test: AWARD.stepClean("lockout") },
      { id: "feet-off-it", name: "Feet Off It", note: "Never stood on the grain, never worked under the wall, never gave the bin an ignition source", test: AWARD.safe },
      { id: "proved-the-air", name: "Proved The Air", note: "Oxygen read inside limits both before the entry and after the bridge went", test: AWARD.precise(0.72) },
    ],
    challenges: [
      { id: "clean-entry", name: "Clean Entry", note: "Clean run, no corrections", test: AWARD.clean },
      { id: "worked-it-through", name: "Worked It Through", note: "Every timed hold carried the full count", test: AWARD.unbroken },
      { id: "out-before-the-shift", name: "Out Before The Shift", note: "Bin cleared and the crew out inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "walk-down-grain": "You stepped out onto the crust. A bridge is a shell over a hole, and the moment it gives there is nothing under your feet but the drop and the grain that comes down after you. Walking on grain to make it flow is prohibited outright by the grain handling standard, and it is the practice behind entrapment after entrapment.",
    "sweep-running": "You started the sweep auger to help the grain move while somebody was in the bin. Flowing grain takes a person under in seconds — faster than the observer can shout and far faster than anyone can pull them back — and an unguarded sweep will take a leg off on its own account. Nothing that moves grain runs while the bin is occupied.",
    "under-the-wall": "You put yourself under the vertical face of crusted grain on the wall. That face is tonnes of caked material standing on nothing but its bond to the sheet, and it comes away in slabs with no warning at all. The rule for a wall is the opposite of the rule for a bridge: you work it from above and from the side, never from beneath it.",
    "air-blowdown": "You reached for the air hose to blow the dust off the ledges. Compressed air takes a settled layer that was merely dirty and puts it into the air as a suspended cloud, which is the one condition a grain dust deflagration needs and cannot get from dust lying still. Dust comes down by vacuum or by hand, never on an air jet.",
    "unrated-light": "You took an ordinary shop light into the bin. In a space with grain dust in it the lamp, the switch and the trailing cord are all ignition sources, and the only fitting that belongs in there is one built and rated for a dust atmosphere. Anything else stays out on the deck.",
    "observer-enters": "You sent the observer in. Now nobody is at the hatch, nobody is tending the line and nobody is left to call the plant — and the observer exists in the standard precisely so that the second person does not become the second casualty. More than one bin fatality has been a would-be rescuer who went in after the first.",
  },

  lateNotes: {
    "bridge-bar": "The bar goes into the bridge after the bin is locked out, the air is proved, the line is on and the observer is at the hatch.",
    "descent-line": "Nobody goes on the line until the lockout, the atmosphere, the rig and the observer are all done and standing.",
    "body-harness": "The harness goes on after the space has been proved — dressing out early is how a crew talks itself into an entry it has not earned.",
  },

  steps: [
    {
      id: "permit", kind: "sequence", anyOrder: true,
      targets: ["entry-permit", "fumigation-board"],
      itemNames: { "entry-permit": "bin entry permit", "fumigation-board": "fumigation record" },
      title: "Take the bin entry permit and the fumigation record",
      cue: "Read what is in the bin, how it is bridged, what was last put on it and when.",
      why: "The permit certifies that the entry conditions have been met before anybody goes in. The fumigation record is the half of it that gets forgotten: a treated bin has a re-entry interval on it, and phosphine gives no useful warning at the concentrations that matter.",
    },
    {
      id: "lockout", kind: "sequence",
      targets: ["auger-disconnect", "conveyor-lock", "try-start"],
      itemNames: { "auger-disconnect": "sweep and reclaim disconnects opened", "conveyor-lock": "lock and tag on each", "try-start": "try to start at the panel" },
      title: "Lock out everything that moves grain",
      cue: "Open the disconnects for the sweep and the reclaim, lock and tag each one, then try to start them.",
      why: "This is the control that matters most in a grain bin, and it is first for a reason: grain only engulfs somebody when it is moving, and what moves it is a motor. Opening the disconnect stops the motor, the lock stops the hand, and the try-to-start is the only part of it that proves you locked the right one.",
      outOfOrderNote: "Disconnect, then lock, then try to start — each step is what makes the one before it true.",
    },
    {
      id: "dust-down", kind: "track", target: "dust-vac", seconds: 6,
      title: "Vacuum the dust off the deck and the ledges",
      cue: "Hold the wand and keep the suction in the band, working the ledges before the hatch comes off.",
      why: "A grain elevator is a dust explosion environment and the grain handling standard requires a housekeeping programme for exactly this reason. Dust lying on a ledge is a nuisance; the same dust airborne is a fuel. It comes down at a rate that lifts it into the hose rather than off the ledge, and it comes down before the bin is opened rather than after.",
      track: { start: 0.12, green: [0.4, 0.62], rise: 0.55, fall: 0.45, drift: 0.13, label: "SUCTION", readout: (v) => (v < 0.4 ? "not lifting it" : v > 0.62 ? "scattering it" : "drawing clean") },
      holdBreakNote: "Suction out of band — either the dust is staying where it is or you are throwing it into the air. Steady it.",
    },
    {
      id: "bond", kind: "select", target: "bond-clamp",
      title: "Bond the vacuum and the drop light to the bin steel",
      cue: "Clamp the bonding lead onto bare metal on the bin before anything electrical goes near the opening.",
      why: "Moving grain and moving dust both build static, and a vacuum hose is a machine for generating it. Bonding ties everything to one potential so the charge has somewhere to go that is not a spark across a gap with dust in it.",
    },
    {
      id: "hatch", kind: "turn", target: "hatch-dogs",
      title: "Undog the roof hatch",
      cue: "Back the dogs off a turn and a half each and lift the cover clear of the coaming.",
      why: "The hatch is opened after the isolation and the housekeeping, not before. From the moment it is off, the bin is an open hole in a walking surface and everything that follows happens beside it.",
      turn: { turns: 1.5, axis: "y", label: "HATCH DOGS" },
    },
    {
      id: "atmosphere", kind: "gauge", target: "gas-meter",
      title: "Test the air in the headspace and down the manway",
      cue: "Lower the meter through the opening and commit when the reading is inside the entry band.",
      why: "Spoiling grain consumes oxygen and gives off carbon dioxide, so the air over a crusted surface can be well short of breathable while the bin looks entirely ordinary, and fumigant residue sits in the same space. This is not what kills most of the people who die in bins, but it is what kills the ones who never reach the grain.",
      gauge: { label: "O₂ HEADSPACE", speed: 0.72, green: [0.46, 0.64], readout: (t) => `${(17.5 + t * 6).toFixed(1)}% O₂`, missNote: "Outside the entry band — ventilate the bin and read it again before anyone leans in, let alone goes in." },
    },
    {
      id: "probe", kind: "hold", target: "probe-pole", seconds: 5,
      title: "Sound the surface from the opening",
      cue: "Reach the pole in from the coaming and hold it on the crust while you feel for what is underneath.",
      why: "A bridge looks like a floor. The pole is how you find out whether it is one: a crust that gives, drums hollow, or lets the pole straight through has a void under it, and the depth of that void is how far a person would fall before the grain came in on top of them. It is done from the opening, on your knees, with no weight on the grain.",
      holdBreakNote: "You lifted the pole before you had felt the reach. Half a sounding tells you about half the surface.",
    },
    {
      id: "wall-crust", kind: "select", target: "crusted-wall",
      title: "Read the crusted wall and set the work position clear of it",
      cue: "Mark the vertical face of caked grain on the sheet and plan to work above it and to one side.",
      why: "A wall of crusted grain is a different hazard from a bridge and carries the opposite rule. A bridge fails under you; a wall fails onto you, in slabs, with a person's weight of grain in every square metre of face. You break it down from above and from the side, and you are never standing under it when it lets go.",
    },
    {
      id: "rig", kind: "sequence",
      targets: ["body-harness", "lifeline-anchor", "retrieval-winch"],
      itemNames: { "body-harness": "body harness on and checked", "lifeline-anchor": "lifeline to the davit head", "retrieval-winch": "slack wound out at the winch" },
      title: "Rig the harness, the lifeline and the retrieval",
      cue: "Harness on, lifeline onto the anchor over the hatch, then wind the slack out at the winch.",
      why: "The harness and lifeline are what the standard asks for; the slack is the part crews leave out. A line with two metres of slack in it lets an entrant go two metres into the grain before it does anything at all, and two metres is already past saving. Wound tight, the line is a limit on how far you can sink rather than a way of pulling you out afterwards — because nothing pulls you out afterwards.",
      outOfOrderNote: "Harness, then the anchor, then the slack — you are attached to the bin before the bin is asked to hold you.",
    },
    {
      id: "observer", kind: "sequence", anyOrder: true,
      targets: ["observer-post", "comms-radio", "summon-alarm"],
      itemNames: { "observer-post": "observer stationed at the hatch", "comms-radio": "radio checked both ways", "summon-alarm": "alarm pull inside their reach" },
      title: "Post the observer and give them a way to call for help",
      cue: "Observer outside the opening, radio tested in both directions, alarm pull where they can hit it without walking away.",
      why: "The observer is required to stay outside the bin and to keep communications going, and the one thing that must never happen is that they leave the hatch to fetch help. So the means of summoning it is at the hatch: a pull station, a radio to the control room, a phone on the platform — anything that raises the plant without costing the entrant the only person watching them.",
    },
    {
      id: "rescue-stage", kind: "drag", target: "rescue-tube",
      title: "Stage the bin rescue tube at the opening",
      cue: "Carry the rescue tube across from the platform to the marked spot beside the hatch.",
      why: "Rescue equipment suited to the structure is part of the entry, not part of the response. A bin rescue tube is a coffer dam the observer can drop around a partly buried entrant to hold the grain off them while it is augered clear — and it is only any use if it is already beside the hatch, because there is no time to go and look for one.",
      drag: { to: "tube-stage", radius: 0.5, missNote: "Not on the staging mark — a rescue tube in the store room is a rescue tube nobody has." },
    },
    {
      id: "descend", kind: "track", target: "descent-line", seconds: 6,
      title: "Come down the line to the working position",
      cue: "Take your weight on the line and come down at a controlled rate, staying off the surface.",
      why: "You come down on the line rather than the ladder because the line is the thing holding you, and at a rate the winch can follow. The working position is above the crust and clear of the wall face, with your feet on nothing that could start flowing.",
      track: { start: 0.1, green: [0.38, 0.58], rise: 0.6, fall: 0.5, drift: 0.12, label: "DESCENT", readout: (v) => (v < 0.38 ? "stopped" : v > 0.58 ? "running away" : "controlled") },
      holdBreakNote: "Descent rate out of band — the winch cannot pay out to that. Bring it back and hold it.",
    },
    {
      id: "break-bridge", kind: "hold", target: "bridge-bar", seconds: 6,
      title: "Break the bridge from above with the bar",
      cue: "Work the bar down through the crust from where you are hanging, and hold the work until it gives.",
      why: "The bridge is broken with a tool, at arm's length, from above it — the entrant's weight never goes on the grain and never gets below it. When the crust goes it goes all at once and the surface drops several feet in a second, and that exact moment is why the line is tight and why the observer is at the hatch.",
      holdBreakNote: "You stopped part way through. A crust worked half through is a crust that fails later, under somebody who thought it was sound.",
    },
    {
      id: "retest", kind: "gauge", target: "gas-meter",
      title: "Read the air again now the void is open",
      cue: "Second reading, same meter, now that what was under the bridge is in the bin with you.",
      why: "The void under a bridge has been sealed beneath spoiling grain for weeks. Breaking the crust vents all of it into the space at once, so the reading that justified the entry describes a bin that no longer exists. You are inside it when this happens, which is why the meter stays on you.",
      gauge: { label: "O₂ AFTER", speed: 0.74, green: [0.44, 0.62], readout: (t) => `${(17.5 + t * 6).toFixed(1)}% O₂`, missNote: "The void has put the bin out of limits — up the line, out through the hatch, and ventilate before anybody goes back." },
    },
    {
      id: "walk", kind: "find", noHint: true,
      targets: ["torn-sweep-guard", "dust-ledge"],
      itemNames: { "torn-sweep-guard": "torn guard on the sweep auger", "dust-ledge": "dust build-up on the gallery beam" },
      itemNotes: {
        "torn-sweep-guard": "The back shield on the sweep auger has been folded up out of the way and never put back. That auger runs unattended every time the bin is drawn down, and what it is guarding is the part that takes a leg off.",
        "dust-ledge": "There is a settled layer along the top of the gallery beam that nobody can reach from the walkway. That is exactly what a housekeeping programme is for, and exactly where the secondary explosion comes from when a primary one shakes the building.",
      },
      title: "Walk the bin and the gallery before you sign it off",
      cue: "Before the locks come off, look over the sweep, the guards and the ledges; click what needs a work order.",
      why: "The bin is the only part of this job with a permit on it, and it is not the part that will hurt the next person. What gets the next crew is the guard nobody refitted and the dust nobody can reach, and both of those are found by somebody walking the plant with their eyes open.",
    },
  ],

  interrupts: [
    {
      id: "spout-swings",
      kind: "Bin taking grain",
      after: "rig", delay: 3, seconds: 12,
      alert: "The distributor has swung the fill spout over this bin and the gate lamp above the hatch has gone green. The house is loading out.",
      cue: "Something upstairs is about to start putting grain in on top of you.",
      target: "spout-gate",
      why: "The isolation you did covers what moves grain out from under the bin. What buries somebody from above is the fill, and that is a different set of motors in a different room, run by a person looking at a route on a screen rather than at your hatch. The gate over the bin belongs in the same isolation, and a green lamp says it is not in it.",
      missNote: "The spout stayed lined up on this bin. The route ran, and the first the crew knew of it was grain coming through the hatch onto the line — which puts a load on an entrant that no harness is rated for, from a direction the observer can do nothing about. The bin was filling while somebody was hanging in it.",
      wrongNote: "It is the fill spout gate. Nothing else stops grain coming in from above, and it has to be shut before anything else happens.",
    },
    {
      id: "reclaim-runs",
      kind: "Grain moving",
      after: "break-bridge", delay: 4, seconds: 13,
      alert: "The surface under you has started to move. The reclaim is running — somebody has put a lock back in the box and called the bin from the control room.",
      cue: "The grain is flowing and you are hanging above it.",
      target: "bin-estop",
      why: "Flowing grain is the whole hazard: it takes a person past the knees in a couple of seconds and covers them well inside a minute, and the pull needed to free a buried body is several times what a harness or a coworker can apply. There is no version of this where you finish the job first. The bin gets stopped, and it gets stopped from where you are.",
      missNote: "The reclaim kept running. The crust you had just broken went down the draw cone and took the working position with it, and the line — tight, which is the only reason any of this is survivable — was carrying a load it was never meant to hold against flowing grain. Everyone who has ever been pulled out of this was pulled out because the machinery stopped first.",
      wrongNote: "It is the emergency stop on the bin. Stop the grain moving; everything else can wait until it has.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.2, GB_ACCENT);

    // ------------------------------------------------------------- the roof deck
    // The learner is standing on the roof of a terminal bin, at the manhole.
    // Everything the job needs is within a few paces of the opening, which is
    // how a bin entry is actually laid out: the hatch, the davit over it, the
    // observer beside it, and the gallery with the motor panel just off the deck.
    box(g, 5.8, 0.12, 5.2, 0, 0.06, 0, 0x717a82, { rough: 0.9, metal: 0.4, finish: "galvanised", tile: [6, 6] });
    for (const sx of [-1, 1]) {
      box(g, 0.08, 0.28, 5.2, sx * 2.86, 0.26, 0, 0x8b929a, { rough: 0.7, metal: 0.5, finish: "galvanised", tile: [4, 1] });
    }
    box(g, 5.8, 0.28, 0.08, 0, 0.26, -2.56, 0x8b929a, { rough: 0.7, metal: 0.5, finish: "galvanised", tile: [6, 1] });
    for (let i = -2; i <= 2; i++) {
      box(g, 0.05, 0.05, 5.0, i * 1.05, 0.14, 0, 0x5d666e, { rough: 0.8, metal: 0.45, cast: false });
    }

    // ---------------------------------------------------------------- the manhole
    const hatch = group(g, -0.55, 0.12, -0.95);
    for (const [dx, dz, w, d] of [[-0.62, 0, 0.16, 1.4], [0.62, 0, 0.16, 1.4], [0, -0.62, 1.4, 0.16], [0, 0.62, 1.4, 0.16]]) {
      box(hatch, w, 0.18, d, dx, 0.09, dz, 0x8b929a, { rough: 0.6, metal: 0.55, finish: "galvanised", tile: [2, 1] });
    }
    holoTag(hatch, "Bin 14 — roof manhole", 0, 0.52, 0.78, { css: "#e0a458", w: 0.46 });
    // The shaft below: headspace, the bridged crust, and the void under it.
    box(hatch, 1.08, 2.4, 1.08, 0, -1.25, 0, 0x101309, { rough: 0.98, cast: false });
    const crust = box(hatch, 1.0, 0.09, 1.0, 0, -1.02, 0, GRAIN_LIGHT,
      { rough: 0.95, finish: "concrete", tile: [2, 2], cast: false });
    holoTag(hatch, "Bridged surface — hollow under it", 0.04, -0.72, 0.56, { css: "#f2c14b", w: 0.52 });
    const walkTrap = box(hatch, 0.9, 0.3, 0.9, 0, -0.84, 0, 0x000000,
      { opacity: 0.001, transparent: true, cast: false });
    holoTag(hatch, "Step out onto it?", 0.3, -0.5, 0.5, { css: "#f0645b", w: 0.36 });
    reg(hits, walkTrap, "walk-down-grain");
    // Caked grain standing on the bin sheet — a slab, not a slope.
    const wallCrust = box(hatch, 0.1, 1.1, 0.82, -0.5, -0.8, 0.04, CAKED,
      { rough: 0.98, finish: "concrete", tile: [1, 2], cast: false });
    holoTag(hatch, "Crusted wall — vertical face", -0.5, -0.14, 0.56, { css: "#f0645b", w: 0.5 });
    reg(hits, wallCrust, "crusted-wall");
    const underWall = box(hatch, 0.3, 0.5, 0.7, -0.36, -1.66, 0.04, 0x000000,
      { opacity: 0.001, transparent: true, cast: false });
    holoTag(hatch, "Work from under it?", -0.34, -1.3, 0.5, { css: "#f0645b", w: 0.42 });
    reg(hits, underWall, "under-the-wall");
    // The settled grain far below, so the void reads as a drop.
    cyl(hatch, 0.46, 0.06, 0.45, 0, -2.18, 0, GRAIN_DARK, { rough: 0.98, seg: 16, cast: false });
    const voidDust = particles(hatch, 26, 0xd8c79a, { size: 0.03, life: 0.9, additive: false, opacity: 0.3 });
    voidDust.position.set(0, -1.1, 0);

    const hatchLid = box(g, 1.2, 0.06, 1.2, -0.55, 0.33, -0.95, 0x9aa3ab,
      { rough: 0.55, metal: 0.6, finish: "galvanised", tile: [2, 2] });
    const dogs = group(g, -0.55, 0.38, -0.26);
    for (const dx of [-0.34, 0, 0.34]) {
      box(dogs, 0.07, 0.05, 0.16, dx, 0, 0, GB_ACCENT, { rough: 0.5, metal: 0.5 });
    }
    holoTag(g, "Hatch dogs", -0.55, 0.66, -0.26, { css: "#e0a458", w: 0.28 });
    reg(hits, dogs, "hatch-dogs");

    // ------------------------------------------------------- davit, line, winch
    const davit = group(g, -1.9, 0.12, -0.6);
    box(davit, 0.52, 0.06, 0.52, 0, 0.03, 0, 0x59636d, { rough: 0.7, metal: 0.5 });
    cyl(davit, 0.06, 0.07, 2.1, 0, 1.08, 0, 0x8b929a, { rough: 0.5, metal: 0.6, seg: 14, finish: "galvanised" });
    const boom = cyl(davit, 0.05, 0.05, 1.45, 0.66, 2.08, -0.16, 0x8b929a,
      { rough: 0.5, metal: 0.6, seg: 12, finish: "galvanised" });
    boom.rotation.z = Math.PI / 2;
    boom.rotation.y = 0.22;
    const anchor = box(davit, 0.14, 0.12, 0.14, 1.28, 1.98, -0.33, GB_ACCENT, { rough: 0.5, metal: 0.5 });
    holoTag(davit, "Lifeline anchor", 1.28, 2.32, -0.33, { css: "#e0a458", w: 0.34 });
    reg(hits, anchor, "lifeline-anchor");
    const winch = group(davit, 0, 0.83, 0.22);
    cyl(winch, 0.11, 0.11, 0.16, 0, 0, 0, 0x2f6f8c, { rough: 0.5, metal: 0.5, seg: 16 }).rotation.x = Math.PI / 2;
    cyl(winch, 0.015, 0.015, 0.24, 0.16, 0, 0.06, 0xb9bec4, { rough: 0.4, metal: 0.8, seg: 8 });
    holoTag(davit, "Retrieval winch", 0, 1.18, 0.22, { css: "#4fd1ff", w: 0.34 });
    reg(hits, winch, "retrieval-winch");
    const line = cyl(g, 0.012, 0.012, 2.0, -0.62, 1.0, -0.93, 0xeef2f6, { rough: 0.7, seg: 6, cast: false });
    holoTag(g, "Lifeline — slack out", -0.62, 1.62, -0.93, { css: "#eef2f6", w: 0.36 });
    reg(hits, line, "descent-line");

    // ------------------------------------------------------------ the fill spout
    const spout = group(g, 0.95, 0, -1.95);
    cyl(spout, 0.17, 0.17, 0.5, 0, 2.55, 0, 0x6f7a83, { rough: 0.6, metal: 0.5, seg: 16, finish: "galvanised" });
    const spoutArm = group(spout, 0, 2.3, 0);
    const spoutDuct = cyl(spoutArm, 0.15, 0.13, 0.7, 0, -0.2, 0.22, 0x6f7a83,
      { rough: 0.6, metal: 0.5, seg: 16, finish: "galvanised" });
    spoutDuct.rotation.x = 0.35;
    const spoutGate = box(spoutArm, 0.26, 0.1, 0.06, 0, -0.42, 0.42, 0xd8232a, { rough: 0.5, metal: 0.4 });
    holoTag(spout, "Fill spout gate", 0, 1.62, 0.42, { css: "#f0645b", w: 0.34 });
    reg(hits, spoutGate, "spout-gate");
    const gateLamp = ball(spout, 0.055, 0, 2.2, 0.42, 0x4a5b46, { emissive: 0x2a3a26, ei: 0.4, rough: 0.4 });
    const spoutDust = particles(spout, 22, 0xd8c79a, { size: 0.03, life: 0.7, additive: false, opacity: 0.32 });
    spoutDust.position.set(0, 1.7, 0.42);

    // --------------------------------------------------------- the motor panel
    const panel = group(g, 2.35, 0.12, 0.45, -1.15);
    box(panel, 0.14, 0.06, 0.6, 0, 0.03, 0, 0x2d3339, { rough: 0.85 });
    box(panel, 0.82, 1.32, 0.3, 0, 0.72, 0, 0x6f7a83, { rough: 0.5, metal: 0.5, finish: "painted", tile: [2, 2] });
    box(panel, 0.86, 0.04, 0.34, 0, 1.4, 0, 0x6f7a83, { rough: 0.5, metal: 0.5 });
    holoTag(panel, "Gallery MCC — bin 14", 0, 1.56, 0, { css: "#e0a458", w: 0.44 });
    const disconnect = group(panel, -0.22, 1.02, 0.17);
    box(disconnect, 0.16, 0.2, 0.05, 0, 0, 0, 0x2b3138, { rough: 0.6, metal: 0.4 });
    const dHandle = box(disconnect, 0.05, 0.17, 0.05, 0, 0.02, 0.05, 0xd8232a, { rough: 0.5 });
    holoTag(panel, "Sweep / reclaim disconnects", -0.22, 1.26, 0.18, { css: "#f0645b", w: 0.52 });
    reg(hits, disconnect, "auger-disconnect");
    const locks = group(panel, -0.22, 0.66, 0.18);
    const lockA = lockTag(locks, 0, 0, 0, { color: 0xd8232a, lines: ["DO NOT", "OPERATE"] });
    lockA.visible = false;
    holoTag(panel, "Lock and tag", -0.22, 0.86, 0.19, { css: "#f0645b", w: 0.3 });
    reg(hits, locks, "conveyor-lock");
    const tryStart = group(panel, 0.24, 1.0, 0.17);
    cyl(tryStart, 0.045, 0.045, 0.05, 0, 0, 0, 0x2f7d4a, { rough: 0.5, seg: 14 }).rotation.x = Math.PI / 2;
    const startLamp = ball(tryStart, 0.03, 0, 0.14, 0.02, 0x59c97b, { emissive: 0x59c97b, ei: 1.4, rough: 0.4 });
    holoTag(panel, "Try to start", 0.24, 1.26, 0.18, { css: "#59c97b", w: 0.3 });
    reg(hits, tryStart, "try-start");

    // The hand switch at the bin that runs the sweep — the wrong hand on this
    // is the whole hazard, so it is out here where it is easy to reach.
    const sweepSwitch = group(g, 1.55, 0.12, -1.9);
    cyl(sweepSwitch, 0.04, 0.045, 0.72, 0, 0.36, 0, 0x59636d, { rough: 0.6, metal: 0.5, seg: 10 });
    box(sweepSwitch, 0.18, 0.2, 0.12, 0, 0.82, 0, 0x2b3138, { rough: 0.6, metal: 0.3 });
    cyl(sweepSwitch, 0.035, 0.035, 0.04, 0, 0.86, 0.07, 0x2f7d4a, { rough: 0.5, seg: 12 }).rotation.x = Math.PI / 2;
    holoTag(sweepSwitch, "Run the sweep to make it flow?", 0, 1.08, 0, { css: "#f0645b", w: 0.56 });
    reg(hits, sweepSwitch, "sweep-running");

    // Emergency stop at the bin — the answer when the grain starts moving.
    const estop = group(g, 0.5, 0.12, 0.2);
    cyl(estop, 0.04, 0.045, 0.9, 0, 0.45, 0, 0x59636d, { rough: 0.6, metal: 0.5, seg: 10 });
    box(estop, 0.2, 0.22, 0.12, 0, 0.98, 0, 0xf2c14b, { rough: 0.6, finish: "painted", tile: [1, 1] });
    const estopHead = cyl(estop, 0.07, 0.07, 0.05, 0, 1.0, 0.08, 0xd8232a, { rough: 0.45, seg: 16 });
    estopHead.rotation.x = Math.PI / 2;
    holoTag(estop, "Bin emergency stop", 0, 1.26, 0, { css: "#f0645b", w: 0.4 });
    reg(hits, estop, "bin-estop");

    // ---------------------------------------------------- housekeeping and dust
    const vac = group(g, 0.35, 0.12, 2.05);
    cyl(vac, 0.22, 0.24, 0.6, 0, 0.3, 0, 0x2f6f8c, { rough: 0.55, metal: 0.3, seg: 18, finish: "painted" });
    cyl(vac, 0.18, 0.2, 0.14, 0, 0.66, 0, 0x2b3138, { rough: 0.6, seg: 18 });
    const wand = group(g, 0.68, 0.12, 1.92);
    cyl(wand, 0.022, 0.022, 0.8, 0, 0.6, 0, 0xb9bec4, { rough: 0.45, metal: 0.6, seg: 10 });
    box(wand, 0.09, 0.05, 0.14, 0, 0.22, 0.03, 0x2b3138, { rough: 0.7 });
    holoTag(g, "Dust vacuum — rated", 0.35, 1.02, 2.05, { css: "#4fd1ff", w: 0.42 });
    reg(hits, vac, "dust-vac");
    const vacDust = particles(wand, 20, 0xd8c79a, { size: 0.02, life: 0.4, additive: false, opacity: 0.35 });
    vacDust.position.set(0, 0.22, 0.05);
    // The settled film the vacuum is there to take off.
    const dustFilm = decal(g, 1.6, 0.5, 0.35, 0.19, 1.35, (cx, w, h) => {
      cx.fillStyle = "rgba(196,168,106,0.55)"; cx.fillRect(0, 0, w, h);
      cx.fillStyle = "rgba(150,124,66,0.5)";
      for (let i = 0; i < 90; i++) cx.fillRect(Math.random() * w, Math.random() * h, 3, 2);
    }, { px: 192, transparent: true, rough: 0.98 });
    dustFilm.rotation.x = -Math.PI / 2;

    const bond = group(g, 0.2, 0.12, 1.3);
    cyl(bond, 0.01, 0.01, 0.42, 0, 0.21, 0, 0x2f7d4f, { rough: 0.7, seg: 6, cast: false });
    const bondClamp = box(bond, 0.07, 0.06, 0.05, 0, 0.42, 0, 0x2f7d4f, { rough: 0.6, metal: 0.4 });
    holoTag(g, "Bonding lead to bin steel", 0.2, 0.7, 1.3, { css: "#59c97b", w: 0.48 });
    reg(hits, bondClamp, "bond-clamp");

    const airReel = group(g, 2.55, 0.12, 1.85);
    torus(airReel, 0.19, 0.045, 0, 0.78, 0, 0x2b3138, { rough: 0.7, seg: 8, seg2: 20 });
    cyl(airReel, 0.035, 0.035, 0.78, 0, 0.39, 0, 0x59636d, { rough: 0.6, metal: 0.5, seg: 10 });
    holoTag(airReel, "Blow the dust down?", 0, 1.12, 0, { css: "#f0645b", w: 0.42 });
    reg(hits, airReel, "air-blowdown");

    const shopLight = group(g, -0.2, 0.12, 1.78);
    box(shopLight, 0.24, 0.1, 0.12, 0, 0.06, 0, 0xf2c14b, { rough: 0.6, finish: "painted", tile: [1, 1] });
    cyl(shopLight, 0.008, 0.008, 0.5, 0.2, 0.02, 0.06, 0x1b1e22, { rough: 0.8, seg: 6, cast: false }).rotation.z = Math.PI / 2;
    holoTag(g, "Unrated shop light", -0.2, 0.48, 1.78, { css: "#f0645b", w: 0.4 });
    reg(hits, shopLight, "unrated-light");

    // ------------------------------------------------------------- tools and gear
    const probe = cyl(g, 0.02, 0.02, 1.9, 0.12, 0.82, -1.5, 0xb08b4a,
      { rough: 0.8, seg: 10 });
    probe.rotation.x = 0.85;
    probe.rotation.z = 0.18;
    holoTag(g, "Sounding pole", 0.12, 1.3, -1.5, { css: "#e0a458", w: 0.32 });
    reg(hits, probe, "probe-pole");

    const barRack = group(g, -2.35, 0.12, 1.15);
    box(barRack, 0.4, 0.08, 0.3, 0, 0.04, 0, 0x59636d, { rough: 0.7, metal: 0.5 });
    const bar = cyl(barRack, 0.022, 0.022, 1.7, 0, 0.72, 0, 0x9aa3ab,
      { rough: 0.5, metal: 0.7, seg: 10, finish: "brushed" });
    bar.rotation.x = 0.28;
    holoTag(barRack, "Bridge bar", 0, 1.32, 0, { css: "#e0a458", w: 0.28 });
    reg(hits, bar, "bridge-bar");

    const gearRack = group(g, 2.3, 0.12, -1.5);
    cyl(gearRack, 0.05, 0.05, 1.7, 0, 0.85, 0, 0x8b929a, { rough: 0.5, metal: 0.5, seg: 10 });
    box(gearRack, 0.44, 0.06, 0.3, 0, 1.7, 0, 0x8b929a, { rough: 0.5, metal: 0.5 });
    const harness = box(gearRack, 0.28, 0.5, 0.1, -0.16, 1.32, 0, 0xf2c14b, { rough: 0.85 });
    for (const sx of [-1, 1]) box(gearRack, 0.05, 0.42, 0.06, -0.16 + sx * 0.1, 1.3, 0.06, 0xf2c14b, { rough: 0.85 });
    holoTag(gearRack, "Body harness and lifeline", -0.16, 1.68, 0.1, { css: "#f2c14b", w: 0.5 });
    reg(hits, harness, "body-harness");

    const meterStand = group(g, 0.32, 0.12, -0.42);
    cyl(meterStand, 0.035, 0.04, 0.58, 0, 0.29, 0, 0x59636d, { rough: 0.6, metal: 0.5, seg: 10 });
    const meter = instrument(meterStand, 0, 0.62, 0, { ry: -0.5, idle: "--.-% O₂", color: 0xe0a458 });
    holoTag(meterStand, "Multi-gas meter on a line", 0, 0.82, 0, { css: "#e0a458", w: 0.48 });
    reg(hits, meter, "gas-meter");

    // Bin rescue tube, and the mark it belongs on beside the hatch.
    const tube = group(g, 1.95, 0.12, 2.15);
    for (let i = 0; i < 3; i++) {
      const a = (i / 3) * Math.PI * 2;
      cyl(tube, 0.055, 0.055, 0.62, Math.sin(a) * 0.09, 0.32, Math.cos(a) * 0.09, 0xf2a23b,
        { rough: 0.6, metal: 0.2, seg: 12, finish: "painted" });
    }
    holoTag(tube, "Bin rescue tube", 0, 0.82, 0, { css: "#f2a23b", w: 0.36 });
    reg(hits, tube, "rescue-tube");
    const stage = box(g, 0.44, 0.02, 0.44, 0.35, 0.13, -1.28, 0xf2a23b,
      { emissive: 0xf2a23b, ei: 0.7, rough: 0.5, cast: false });
    holoTag(g, "Stage it here", 0.35, 0.42, -1.28, { css: "#f2a23b", w: 0.3 });
    hits["tube-stage"] = stage;

    // ------------------------------------------------------------ the paperwork
    const permit = holoPanel(g, 0.56, 0.42, -2.3, 1.45, 1.85, (cx, w, h) => {
      cx.fillStyle = "rgba(10,14,8,0.9)"; cx.fillRect(0, 0, w, h);
      cx.fillStyle = "#e0a458"; cx.fillRect(0, 0, w, 5);
      cx.fillStyle = "#c7b489";
      cx.font = `600 ${Math.round(h * 0.09)}px 'Barlow Condensed', Arial, sans-serif`;
      cx.textAlign = "left"; cx.textBaseline = "middle";
      cx.fillText("BIN ENTRY PERMIT · BIN 14", w * 0.06, h * 0.14);
      cx.fillStyle = "#f6eeda";
      cx.font = `600 ${Math.round(h * 0.125)}px 'Barlow Condensed', Arial, sans-serif`;
      cx.fillText("BRIDGED — BREAK FROM ABOVE", w * 0.06, h * 0.32);
      cx.fillStyle = "#d9cca9";
      cx.font = `${Math.round(h * 0.083)}px Arial, sans-serif`;
      ["Product: hard red winter, in since March", "Sweep + reclaim: de-energised, locked, tried",
       "Harness and lifeline, slack wound out", "Observer outside, comms both ways",
       "Rescue tube staged at the manhole", "No walking down grain. No entry under the bridge"]
        .forEach((line, i) => cx.fillText(line, w * 0.06, h * 0.46 + i * h * 0.085));
    }, { ry: 0.55, accent: GB_ACCENT });
    reg(hits, permit, "entry-permit");

    const fumBoard = group(g, -2.6, 0.12, 0.25, 0.7);
    cyl(fumBoard, 0.035, 0.04, 1.0, 0, 0.5, 0, 0x59636d, { rough: 0.6, metal: 0.5, seg: 10 });
    const fumFace = decal(fumBoard, 0.38, 0.46, 0, 1.0, 0.02,
      paperFace("FUMIGATION RECORD", ["Bin 14 — phosphine", "Applied: 11 days ago", "Aerated: 6 days ago", "Re-entry: cleared, test on entry"],
        { bg: "#f2e6cd", band: "#b8791a", worn: true }), { px: 256 });
    holoTag(fumBoard, "Fumigation record", 0, 1.32, 0.03, { css: "#f2c14b", w: 0.4 });
    reg(hits, fumFace, "fumigation-board");

    // ------------------------------------------------------------------ the crew
    const entrant = standingFigure(g, -1.45, 0.75, { ry: 2.6, cloth: 0x4a5b6b, vest: 0xf2c14b, helmet: 0xf2f2f2 });
    holoTag(g, "You — entrant", -1.45, 2.05, 0.75, { css: "#e0a458", w: 0.3 });
    const observer = standingFigure(g, 1.45, 1.35, { ry: -2.5, cloth: 0x2f4a5b, vest: 0xf2a23b, helmet: 0xf2f2f2 });
    holoTag(g, "Observer — stays outside", 1.45, 2.05, 1.35, { css: "#f2a23b", w: 0.48 });
    reg(hits, observer, "observer-post");
    const observerHome = observer.position.clone();

    const post = group(g, 2.15, 0.12, 1.95, -0.8);
    box(post, 0.3, 0.86, 0.26, 0, 0.43, 0, 0x53606b, { rough: 0.7, metal: 0.3 });
    const radio = box(post, 0.08, 0.16, 0.05, -0.08, 0.96, 0, 0x1b1e22, { rough: 0.6 });
    holoTag(post, "Radio to the control room", -0.08, 1.2, 0.04, { css: "#4fd1ff", w: 0.5 });
    reg(hits, radio, "comms-radio");
    const alarm = box(post, 0.12, 0.16, 0.06, 0.09, 0.96, 0, 0xd8232a, { rough: 0.5 });
    decal(post, 0.09, 0.05, 0.09, 0.96, 0.035, signFace("PULL", { bg: "#8c1410", accent: "#ffd8d0", fg: "#ffffff", scale: 0.6 }), { px: 128 });
    holoTag(post, "Alarm pull at the hatch", 0.09, 1.38, 0.04, { css: "#f0645b", w: 0.46 });
    reg(hits, alarm, "summon-alarm");

    const sendIn = box(g, 0.5, 0.9, 0.5, 0.82, 0.58, 1.58, 0x000000,
      { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "Send them in to help?", 0.82, 1.16, 1.58, { css: "#f0645b", w: 0.44 });
    reg(hits, sendIn, "observer-enters");

    // ------------------------------------------------- the walk-round finds
    const sweepUnit = group(g, 1.95, 0.12, -2.25);
    box(sweepUnit, 1.1, 0.26, 0.3, 0, 0.32, 0, 0x6f7a83, { rough: 0.6, metal: 0.5, finish: "painted", tile: [2, 1] });
    cyl(sweepUnit, 0.09, 0.09, 0.26, -0.62, 0.32, 0, 0x2b3138, { rough: 0.6, seg: 14 }).rotation.z = Math.PI / 2;
    const guard = box(sweepUnit, 0.34, 0.2, 0.05, 0.3, 0.52, 0.1, 0xf2c14b, { rough: 0.7 });
    guard.rotation.x = -0.9;
    holoTag(sweepUnit, "Sweep auger drive", 0, 0.78, 0, { css: "#e0a458", w: 0.38 });
    reg(hits, guard, "torn-sweep-guard");
    const beam = group(g, -1.6, 0.12, -2.3);
    box(beam, 1.5, 0.16, 0.12, 0, 0.92, 0, 0x5d666e, { rough: 0.75, metal: 0.45, finish: "painted", tile: [2, 1] });
    for (const dx of [-0.6, 0.6]) cyl(beam, 0.035, 0.035, 0.84, dx, 0.42, 0, 0x5d666e, { rough: 0.75, metal: 0.45, seg: 8 });
    const ledgeDust = box(beam, 1.46, 0.03, 0.1, 0, 1.01, 0, CAKED, { rough: 0.98, cast: false });
    holoTag(beam, "Gallery beam", 0, 1.24, 0, { css: "#8fb3c4", w: 0.28 });
    reg(hits, ledgeDust, "dust-ledge");

    barrierPanel(g, -2.55, -1.6, { ry: 1.57, color: 0xf2a23b });
    barrierPanel(g, 2.62, -0.7, { ry: 1.57, color: 0xf2a23b });
    for (const [x, z] of [[-2.75, 2.3], [2.75, 2.3]]) cone(g, x, z, { color: 0xe4622a });

    let flowing = false, spoutOver = false, descended = 0, bridgeGone = false, hatchOpen = false;

    return {
      hits,
      footprint: 2.2,
      spawnLook: new THREE.Vector3(-0.55, 0.3, -0.95),

      onStepComplete(step) {
        if (step.id === "lockout") {
          dHandle.rotation.z = 1.5;
          lockA.visible = true;
          startLamp.material = mat(0x3a4a3e, { emissive: 0x16241a, ei: 0.3, rough: 0.4 });
        }
        if (step.id === "dust-down") dustFilm.visible = false;
        if (step.id === "bond") bondClamp.material = mat(0x59c97b, { emissive: 0x59c97b, ei: 1.3, rough: 0.5 });
        if (step.id === "hatch") {
          hatchOpen = true;
          hatchLid.position.set(0.92, 0.33, -2.05);
          hatchLid.rotation.z = 0.12;
        }
        if (step.id === "rig") {
          harness.visible = false;
          line.scale.y = 1.04;
        }
        if (step.id === "rescue-stage") {
          tube.position.set(0.35, 0.12, -1.28);
          stage.material = mat(0x59c97b, { emissive: 0x59c97b, ei: 0.9, rough: 0.5 });
        }
        if (step.id === "descend") {
          descended = 1;
          entrant.position.set(-0.42, -0.5, -0.92);
          entrant.rotation.y = 1.2;
        }
        if (step.id === "break-bridge") {
          bridgeGone = true;
          crust.position.set(0, -1.78, 0);
          crust.scale.set(0.82, 0.55, 0.82);
        }
        if (step.id === "walk") {
          guard.rotation.x = 0;
          ledgeDust.material = mat(0x59c97b, { emissive: 0x59c97b, ei: 0.6, rough: 0.6 });
        }
      },

      // The spout really swings over the bin, and the grain really starts to
      // move. Both are the thing the alarm is about — see shared/game.js.
      onInterrupt(it) {
        if (it.id === "spout-swings") {
          spoutOver = true;
          spoutArm.rotation.y = -0.6;
          spoutArm.position.set(-0.35, 2.3, 0.45);
          gateLamp.material = mat(0x59c97b, { emissive: 0x59c97b, ei: 2.4, rough: 0.4 });
        }
        if (it.id === "reclaim-runs") {
          flowing = true;
          crust.position.set(0.06, -1.14, 0.04);
          crust.rotation.z = 0.06;
          estopHead.material = mat(0xff4d4d, { emissive: 0xff4d4d, ei: 2.6, rough: 0.4 });
        }
      },

      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "spout-swings") {
          spoutOver = false;
          spoutArm.rotation.y = 0;
          spoutArm.position.set(0, 2.3, 0);
          gateLamp.material = mat(0x4a5b46, { emissive: 0x2a3a26, ei: 0.4, rough: 0.4 });
        }
        if (it.id === "reclaim-runs") {
          flowing = false;
          crust.position.set(0, -1.02, 0);
          crust.rotation.z = 0;
          estopHead.material = mat(0xd8232a, { rough: 0.45 });
        }
      },

      onHazard(hitId) {
        // Touching the sweep switch, or stepping onto the crust, does what it
        // does: the surface starts to go.
        if (hitId === "sweep-running" || hitId === "walk-down-grain") {
          crust.position.set(0, -1.12, 0);
          crust.rotation.z = 0.05;
        }
        if (hitId === "observer-enters") observer.position.set(0.25, 0, -0.1);
      },

      animate(t, dt, session) {
        // An open bin breathes dust whether or not anybody is watching it.
        if (hatchOpen || bridgeGone) {
          voidDust.visible = true;
          voidDust.userData.step(dt, new THREE.Vector3(0, -1.0 + (bridgeGone ? -0.4 : 0), 0), 0.5,
            flowing ? 0.5 : 0.12, flowing ? -0.9 : 0.25);
        } else if (voidDust.visible) voidDust.visible = false;
        if (spoutOver) {
          spoutDust.visible = true;
          spoutDust.userData.step(dt, new THREE.Vector3(-0.35, 1.9, 0.45), 0.16, 0.3, -1.6);
          gateLamp.material.emissiveIntensity = 2.0 + Math.sin(t * 8) * 0.9;
        } else if (spoutDust.visible) spoutDust.visible = false;
        if (flowing) {
          crust.position.y = -1.14 - (Math.sin(t * 3) * 0.5 + 0.5) * 0.06;
          estopHead.material.emissiveIntensity = 2.0 + Math.sin(t * 9) * 1.0;
        }
        const step = session?.step;
        if (step?.id === "dust-down" && session.holding) {
          vacDust.visible = true;
          vacDust.userData.step(dt, new THREE.Vector3(0, 0.22, 0.05), 0.08, 0.35, 0.4);
        } else if (vacDust.visible) vacDust.visible = false;
        const gg = session?.gauge;
        if (gg && !gg.committed && (step?.id === "atmosphere" || step?.id === "retest")) {
          const [lo, hi] = gg.green;
          repaint(meter.userData.screen, signFace(`${(17.5 + gg.t * 6).toFixed(1)}%`, {
            bg: "#1a1508", accent: gg.t >= lo && gg.t <= hi ? "#59c97b" : "#f0645b", fg: "#f6e5c0", scale: 0.55,
          }));
        }
        void descended; void observerHome; void CITY;
      },
    };
  },
};
