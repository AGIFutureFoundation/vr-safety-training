import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import { box, cyl, ball, torus, hose, group, decal, repaint, signFace, paperFace, mat } from "../../../shared/kit.js";
import { CITY, holoPanel, holoTag, reg, surfaceTexture, texturedMat, siltFace } from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Underwater Debris Survey & Mapping VR — SF Bay Restoration &
// Cleanup, maritime and underwater, pack A, on the bay-underwater district.
//
// On the bottom off a restoration site, before anything is lifted: a
// baseline tape staked out across the silt from the downline, a second tape
// run out as an offset, and the debris the survey is there to map — a
// corroded drum of unknown contents, a car battery, a block of concrete with
// rebar sticking out of it, an overturned skiff, a tyre and a shopping cart,
// and a tangle of lost fishing line on a rock. The learner is the diver, a
// Pile Drivers Local 34 commercial diver, surveying for the restoration's
// removal plan; the supervisor is on the comms, the tender has the umbilical
// and the standby is dressed at the ladder. Depth, gas, bottom time and
// decompression are never written as numbers: they are per the dive plan and
// the tables the supervisor holds. What happens to anything hazardous is
// decided per the work plan, not on the bottom.

const BRDS_ACCENT = 0x7fd6a8;
const BRDS_CSS = "#7fd6a8";

/** The HUD's comms face, repainted when the supervisor reads back. */
function brdsCommsFace(lines, band = "#7fd6a8") {
  return (cx, w, h) => {
    cx.fillStyle = "rgba(6,20,22,0.9)"; cx.fillRect(0, 0, w, h); cx.fillStyle = band; cx.fillRect(0, 0, w, 6);
    cx.font = `600 ${Math.round(h * 0.15)}px 'Barlow Condensed', Arial, sans-serif`; cx.textAlign = "left"; cx.textBaseline = "middle";
    cx.fillStyle = "#d8f6ea"; cx.fillText("HELMET COMMS", w * 0.06, h * 0.22);
    cx.font = `${Math.round(h * 0.11)}px Arial, sans-serif`; cx.fillStyle = "#eaf8f2";
    lines.forEach((l, i) => cx.fillText(l, w * 0.06, h * (0.5 + i * 0.2)));
  };
}

export const SIM_BR_UNDERWATER_DEBRIS_SURVEY_AND_MAPPING = {
  id: "br-underwater-debris-survey-and-mapping",
  index: "320",
  domain: "Maritime & Ports",
  trade: "Pile Drivers Local 34 commercial diver on a surface-supplied debris survey for a Bay restoration removal plan, with the supervisor on the comms, the tender on the umbilical and the standby diver at the ladder",
  category: "Maritime & Ports",
  district: "bay-underwater",
  weather: "clear",
  underwater: {
    depthLabel: "Per dive plan",
    bottomTimeSeconds: 600,
  },
  certification: "Pile Drivers Local 34 commercial diver training under the UBC International Training Fund; OSHA 29 CFR 1910 Subpart T commercial diving operations — 29 CFR 1910.422 procedures during the dive (communications, the tended diver, termination of the dive) and 29 CFR 1910.420 the employer's safe practices manual; ADCI International Consensus Standards for Commercial Diving and Underwater Operations; USCG 46 CFR 197 Subpart B where the dive is worked from a vessel; depth, gas, bottom time and decompression per the dive plan and the tables the supervisor holds; hazardous debris handled per the work plan",
  name: "Underwater Debris Survey & Mapping",
  title: simTitle("Underwater Debris Survey & Mapping"),
  tagline: "On the bottom before anything is lifted: on-bottom report, the baseline's bearing set, the tape run out to the far stake, the baseline swum steady while the silt blows out the visibility, the drum and the battery found and left alone, the offset read, the item floated and written up, the rebar and the skiff found, position held while fishing line wraps a fin, the hazards reported for the work plan, the survey bag sent up and the map read up for the dive log",
  accent: BRDS_ACCENT,
  accentCss: BRDS_CSS,
  parSeconds: 290,
  footprint: 2.6,
  badge: { id: "mapped-not-moved", name: "Mapped, Not Moved", note: "Every item placed on the baseline and written up, and nothing hazardous touched, lifted or opened on the bottom" },

  supportLine: "your union hall's member assistance programme — Pile Drivers Local 34 — with the employer's employee assistance line behind it",

  game: system({
    name: "Debris Survey",
    currency: "CHAINAGE",
    ranks: ["Diver Trainee", "Diver", "Survey Diver", "Lead Survey Diver", "Debris Survey Certified"],
    badges: [
      { id: "on-bearing", name: "On Bearing", note: "The baseline's bearing set first time", test: AWARD.stepClean("set-bearing") },
      { id: "offset-true", name: "Offset True", note: "The offset read inside the band first time", test: AWARD.precise(0.7) },
      { id: "hands-off", name: "Hands Off", note: "No drum opened, no battery lifted, never under the skiff, never kicking through the line", test: AWARD.safe },
    ],
    challenges: [
      { id: "clean-survey", name: "Clean Survey", note: "No corrections from the on-bottom report to the read-up", test: AWARD.clean },
      { id: "steady-baseline", name: "Steady Baseline", note: "The baseline swum in band the whole way", test: AWARD.unbroken },
      { id: "mapped-in-time", name: "Mapped In Time", note: "Map read up inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "open-drum": "You went to unscrew the drum's bung to see what was inside. A drum on the bottom of the Bay can hold solvent, oil, acid or nothing at all, and the diver who opens it finds out by breathing and wearing it, while the release spreads down-current onto the restoration site. A survey maps a drum and reports it; what happens to it next is decided per the work plan, by people who can test it at the surface.",
    "kick-monofilament": "You tried to swim straight through the tangle of fishing line on the rock. Monofilament is nearly invisible underwater, it wraps fins, the harness and the umbilical as a diver moves, and every kick pulls it tighter. It is gone round, not through, and marked on the map so the removal crew knows it is there.",
    "under-skiff": "You moved in under the overturned skiff to look at its underside. A hull lying on the bottom is resting on whatever silt holds it, it can settle or roll without warning, and a diver under it has an overhead with an umbilical trailing out behind them — an entrapment the standby would have to dig you out of. The skiff is surveyed from outside and its position mapped.",
    "lift-battery": "You picked up the car battery to take it up with you. A battery is heavy, its case may be cracked and leaking acid, and a diver carrying a weight up the downline has changed their own buoyancy and their ascent without the supervisor's say. Nothing is lifted during a survey; lifts are planned and rigged later, per the work plan.",
  },

  lateNotes: {
    "offset-tape": "The offset is read once the hazardous items have been found — the survey places what it has seen.",
    "hold-position": "Position is held for the read-back once the sharp and overhead debris has been found.",
    "diver-slate": "The map is read up once the survey bag has been sent up the downline.",
  },

  steps: [
    {
      id: "on-bottom", kind: "select", target: "diver-comms",
      title: "Report on the bottom at the downline",
      cue: "Call the supervisor: on the bottom at the clump weight, off the stage, feeling good, the visibility and the current as you find them, and starting the survey at the baseline's zero stake.",
      why: "The supervisor at the panel can see your gas and your depth but not the bottom, and the on-bottom report is how the surface learns what you have arrived in: how far you can see, which way the current is setting and whether the plan still fits. It also starts the clock the dive is timed against, and it is the comms check that proves the voice circuit works on the bottom before you move away from the downline.",
    },
    {
      id: "set-bearing", kind: "turn", target: "compass-bezel",
      title: "Set the baseline's bearing on your compass",
      cue: "Turn the compass bezel to the baseline bearing the survey plan gives, so the lubber line and the needle agree when you face down the line.",
      why: "A debris survey is only as good as its baseline, because every item's position is measured from it: chainage along the tape and offset square to it. The bearing comes from the survey plan so the map lines up with the site plan the removal crew will use, and it is set on the bezel before the tape goes out, because in low visibility the compass is the only thing that keeps the line straight.",
      turn: { turns: 0.75, label: "COMPASS BEZEL", readout: (t) => (t < 0.3 ? "off the bearing" : t < 0.9 ? "coming onto the bearing" : "on the survey plan's bearing") },
    },
    {
      id: "run-baseline", kind: "drag", target: "tape-reel",
      title: "Run the baseline tape out to the far stake",
      cue: "Pay the tape out from the zero stake along your bearing and hook the reel onto the far stake, tape taut and just off the silt.",
      why: "The tape is the survey's ruler, laid across the site so every item can be placed on it. Run out along the bearing and made fast at the far stake, it stays straight and taut when you swim it, and it gives the removal crew a line they can find again. A slack tape sags into the silt and reads long, and a tape that wanders off the bearing puts every item it measures in the wrong place on the map.",
      drag: { to: "far-stake", radius: 0.5, missNote: "Not at the far stake — hook the reel on the far stake so the tape is taut along the bearing." },
    },
    {
      id: "swim-baseline", kind: "track", target: "tape-swim", seconds: 6,
      title: "Swim the baseline steadily, looking both ways",
      cue: "Swim along the tape just above the silt at a pace your supply holds and your fins do not stir the bottom, scanning both sides of the line.",
      why: "The first pass along the baseline is what finds the debris, and it is swum slowly and level so the fins do not lift the silt into a cloud that hides everything behind you. Going faster costs gas the dive plan did not count on and misses what is lying just off the line; going slower burns bottom time. The pace is set by the breathing and the visibility, not by the length of the tape.",
      track: { start: 0.14, green: [0.42, 0.6], rise: 0.56, fall: 0.46, drift: 0.12, label: "PACE ALONG THE TAPE", readout: (v) => (v < 0.42 ? "stalled — the silt is catching up" : v > 0.6 ? "too fast — fins lifting silt" : "steady and level over the silt") },
      holdBreakNote: "The pace broke out of band — racing and stirring the bottom, or stalled. Settle on the tape and take it up again steadily.",
    },
    {
      id: "hazard-items", kind: "find", noHint: true,
      targets: ["drum-unknown", "battery"],
      itemNames: { "drum-unknown": "corroded drum of unknown contents", "battery": "car battery on its side in the silt" },
      itemNotes: {
        "drum-unknown": "A steel drum lying on its side, rusted through at one chime, its label long gone. It could hold anything or nothing, and a drum that has been corroding on the bottom can split when it is moved.",
        "battery": "A car battery on its side half in the silt. Its case may be cracked, and whatever acid and lead it still holds are exactly what the restoration is trying to take out of the Bay.",
      },
      title: "Find the hazardous debris and leave it where it is",
      cue: "Along the line, pick out anything that could hold a hazardous substance — drums, batteries, containers — and look at it without touching it.",
      why: "The point of a survey is to know what is on the bottom before anyone lifts anything, and hazardous items change the whole removal: they need a lift plan, containment and a place to go at the surface. The diver's job is to find them, see their condition and leave them alone, because a drum or a battery moved by hand on the bottom is a release nobody planned for.",
    },
    {
      id: "read-offset", kind: "gauge", target: "offset-tape",
      title: "Read the drum's offset from the baseline",
      cue: "Run the offset tape square from the baseline to the drum and commit the reading when the tape's end is at the drum's centre.",
      why: "Chainage along the baseline and offset square to it are what put the drum on the map within reach of the removal crew's grab. The offset is read to the item's centre with the tape square to the line, because a tape run at an angle reads long and puts the drum somewhere it is not — and the next diver goes looking for it in the dark.",
      gauge: { label: "OFFSET TAPE", speed: 0.7, green: [0.42, 0.6], readout: (t) => (t < 0.42 ? "short of the drum" : t <= 0.6 ? "at the drum's centre" : "past it — tape not square"), missNote: "Outside the band — hold the tape square to the baseline and read it at the drum's centre." },
    },
    {
      id: "tag-item", kind: "sequence",
      targets: ["marker-float", "slate-entry"],
      itemNames: { "marker-float": "numbered marker float tied off beside the drum", "slate-entry": "item written on the slate with its chainage and offset" },
      title: "Float the item, then write it up",
      cue: "Tie a numbered marker float to the rock beside the drum — not to the drum — then write the number, the chainage, the offset and what it is on your slate.",
      why: "The float gives the item a number the surface can see and the removal crew can find, and it is tied off beside the drum rather than to it so nobody's first contact with the drum is a pull on its lid. The slate entry follows so the number on the float and the line on the map are the same number; a slate written first ends up out of step with the floats as the survey goes on.",
      outOfOrderNote: "Out of order — float the item first so the slate records the number that is really on it.",
    },
    {
      id: "sharp-items", kind: "find", noHint: true,
      targets: ["rebar-snag", "skiff-hull"],
      itemNames: { "rebar-snag": "concrete block with rebar sticking up out of the silt", "skiff-hull": "overturned skiff lying on the bottom" },
      itemNotes: {
        "rebar-snag": "A slab of broken concrete with bent reinforcing bar standing up out of it at fin height — a snag for the umbilical and a cut for a suit.",
        "skiff-hull": "A small skiff lying upside down on the silt. It is an overhead to anyone who goes under it, and its lines and fittings are snags; it will need rigging to lift.",
      },
      title: "Find the sharp and overhead debris",
      cue: "Look for what could cut, snag or trap a diver: rebar, sheet metal, hulls, anything with an underside.",
      why: "The removal dives that follow the survey will be worked with rigging and lift bags among this debris, and the divers who do them need to know where the snags and overheads are before they arrive. Rebar that cuts a drysuit or catches an umbilical, and a hull that a diver could end up under, are mapped as hazards in their own right so the removal plan can work round them.",
    },
    {
      id: "hold-position", kind: "hold", target: "hold-position", seconds: 5,
      title: "Hold still on the tape while the supervisor plots you",
      cue: "Stay still at the skiff's chainage with a hand on the tape while the supervisor reads your position back and plots it — do not drift off the mark.",
      why: "The supervisor plots the map at the surface as you read items up, and a read-back is only worth taking if you are still at the point being plotted. Holding still with a hand on the tape keeps you on the mark while the numbers go up and come back, and it gives the tender a steady umbilical to read — a diver who drifts during the read-back puts the skiff on the map where the diver ended up.",
      holdBreakNote: "You drifted off the mark before the read-back was done — the position would be plotted wrong. Come back to the tape and hold still again.",
    },
    {
      id: "report-hazards", kind: "select", target: "hazard-report",
      title: "Report the hazardous items for the work plan",
      cue: "Tell the supervisor: the drum and the battery, their float numbers and condition, left untouched, and that their handling is for the work plan.",
      why: "Anything hazardous found on a restoration survey goes into the work plan before anyone touches it: the lift, the containment, the testing and where it goes at the surface are all decided there. Reporting it now, while you can still look again at anything the supervisor asks about, is how the surface gets a description good enough to plan with rather than a line on a slate read out later.",
    },
    {
      id: "bag-up", kind: "drag", target: "survey-bag",
      title: "Send the survey bag up on the downline clip",
      cue: "Clip the survey bag with the spare floats and the offset tape onto the downline's travelling clip so it goes up with the stage.",
      why: "Everything that came down for the survey goes back up the same way, clipped to the downline, so nothing is left loose on the bottom to foul the next diver and nothing is carried by hand on the ascent. The floats that stay on the bottom are the ones marking items; the spares go home, so the removal crew is never left guessing which float means something.",
      drag: { to: "downline-clip", radius: 0.5, missNote: "Not on the downline clip — the bag goes up on the downline, not in your hand." },
    },
    {
      id: "read-up-map", kind: "select", target: "diver-slate",
      title: "Read the map up for the dive log",
      cue: "Read your slate to the supervisor item by item: number, chainage, offset, what it is and its condition, the line on the rock, and the silt-out and the fouled fin.",
      why: "The supervisor turns what you read up into the survey map and the dive log, and both are what the removal plan is written from. It is read from the slate while you are still at the baseline so anything unclear can be looked at again, and the silt-out and the fishing line go in as well, because the next diver on this bottom will meet both.",
    },
    {
      id: "stage-checkin", kind: "select", target: "stage-checkin",
      title: "Check in at the stage and leave on the supervisor's call",
      cue: "Back at the stage, clipped on: tell the supervisor how you feel after the survey, the silt-out and the line, and wait for the call to leave the bottom.",
      why: "The ascent is the supervisor's call, run to the tables they hold, and the check-in tells them you are on the stage, clipped on and well. It is also the diver's own chance to say how the dive was: a silt-out and a fin wrapped in fishing line are frightening minutes, and saying so at the stage is part of the dive, with the Pile Drivers Local 34 member assistance line there for whatever the debrief does not settle.",
    },
  ],

  interrupts: [
    {
      id: "silt-out",
      kind: "Visibility lost in a silt-out",
      after: "swim-baseline", delay: 2, seconds: 14,
      alert: "The current has lifted the fine silt off the bottom — the visibility has gone to nothing and you cannot see the tape in front of your faceplate.",
      cue: "Stop, take hold of the baseline tape and stay on it, then tell the supervisor you are in a silt-out.",
      target: "baseline-tape",
      why: "In a silt-out the tape is the one thing that still tells you where you are and which way the downline lies. A diver who keeps swimming blind drifts off the line into the debris they came to map — the rebar, the skiff, the fishing line — so you stop, take hold of the tape, and let the supervisor and the tender know, while the silt settles or the dive is ended per the dive plan.",
      missNote: "You kept swimming into the cloud and came off the tape; with no line to follow you drifted into the rebar and the tender felt the umbilical snag before you did.",
      wrongNote: "The baseline tape — take hold of it so you cannot drift off the line in the cloud.",
    },
    {
      id: "fin-fouled",
      kind: "Fin fouled in fishing line",
      after: "hold-position", delay: 2, seconds: 14,
      alert: "Your left fin has picked up a loop of fishing line drifting off the rock — it is wrapped round your ankle and pulling tighter as you move.",
      cue: "Stop moving, take the line cutter off your harness and cut the loops free, then tell the supervisor.",
      target: "line-cutter",
      why: "Monofilament tightens with every kick, and a diver who thrashes to get free wraps it round the harness and the umbilical as well. The line cutter lives on the harness for exactly this: stop, cut, and report, so the supervisor knows before the tender feels it. If it cannot be cut free, the supervisor sends the standby, which is why the standby is dressed before you leave the surface.",
      missNote: "You kicked to get free; the loop pulled tight round your ankle and caught the umbilical, and the supervisor had to send the standby down the downline to cut you out.",
      wrongNote: "The line cutter on your harness — stop moving and cut the loops, do not kick.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);

    // ------------------------------------------------------- the bottom
    const siltTex = surfaceTexture((cx, w, h) => siltFace(cx, w, h), { px: 256, repeat: 3 });
    const mound = cyl(g, 2.9, 3.3, 0.1, 0, 0.03, -0.6, 0xffffff, { seg: 28, cast: false });
    mound.material = texturedMat(siltTex, { rough: 1, metal: 0, color: 0xb4beac });
    for (const [x, z, r] of [[-2.4, -2.0, 0.22], [2.3, 1.4, 0.16], [0.9, 2.1, 0.12], [-1.4, 2.3, 0.18], [2.7, -2.1, 0.2]]) ball(g, r, x, r * 0.4, z, 0x4a5048, { rough: 1, seg: 8, seg2: 6 }).scale.set(1, 0.5, 0.8);

    // ------------------------------------------------------- baseline: stakes, tape, reel
    const zeroStake = group(g, -2.2, 0, 0.9);
    cyl(zeroStake, 0.015, 0.015, 0.7, 0, 0.35, 0, 0x8a949d, { rough: 0.5, metal: 0.6, seg: 6 });
    box(zeroStake, 0.06, 0.1, 0.01, 0.03, 0.65, 0, 0xf06a2b, { rough: 0.6 });
    holoTag(zeroStake, "baseline zero", 0, 0.85, 0, { css: BRDS_CSS, w: 0.26 });
    const farStake = group(g, 2.1, 0, -1.3);
    cyl(farStake, 0.015, 0.015, 0.7, 0, 0.35, 0, 0x8a949d, { rough: 0.5, metal: 0.6, seg: 6 });
    const farRing = torus(farStake, 0.16, 0.01, 0, 0.5, 0, BRDS_ACCENT, { emissive: BRDS_ACCENT, ei: 1.6, rough: 0.4, cast: false, seg: 6, seg2: 20 });
    void farRing;
    holoTag(farStake, "far stake", 0, 0.85, 0, { css: BRDS_CSS, w: 0.2 });
    reg(hits, farStake, "far-stake");
    const reel = group(g, -1.9, 0.5, 0.75);
    cyl(reel, 0.1, 0.1, 0.05, 0, 0, 0, 0xe8b02e, { rough: 0.55, seg: 16 }).rotation.x = Math.PI / 2;
    box(reel, 0.03, 0.16, 0.02, 0, -0.12, 0, 0x2b3138, { rough: 0.6 });
    holoTag(reel, "tape reel", 0, 0.2, 0, { css: BRDS_CSS, w: 0.2 });
    reg(hits, reel, "tape-reel");
    const tapeLen = Math.hypot(4.3, 2.2);
    const tape = box(g, tapeLen, 0.004, 0.02, -0.05, 0.42, -0.2, 0xf2e6b8, { rough: 0.6 });
    tape.rotation.y = Math.atan2(2.2, 4.3);
    tape.scale.x = 0.15;
    tape.position.set(-2.2 + 4.3 * 0.075, 0.42, 0.9 - 2.2 * 0.075);
    const tapeHit = box(g, 1.0, 0.25, 0.3, 0.2, 0.42, -0.25, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    tapeHit.rotation.y = Math.atan2(2.2, 4.3);
    holoTag(g, "baseline tape", 0.2, 0.6, -0.2, { css: BRDS_CSS, w: 0.26 });
    reg(hits, tapeHit, "baseline-tape");
    const swim = group(g, -0.9, 0.7, 0.2);
    for (let i = 0; i < 3; i++) { const chev = box(swim, 0.12, 0.012, 0.03, i * 0.22, 0, -i * 0.11, BRDS_ACCENT, { emissive: BRDS_ACCENT, ei: 1.4, rough: 0.4, cast: false }); chev.rotation.y = 0.6; }
    holoTag(swim, "swim the baseline", 0.2, 0.18, -0.1, { css: BRDS_CSS, w: 0.32 });
    reg(hits, swim, "tape-swim");

    // ------------------------------------------------------- the debris
    const drum = group(g, 0.9, 0, -0.1);
    const drumBody = cyl(drum, 0.28, 0.28, 0.85, 0, 0.28, 0, 0x7a3a1c, { rough: 0.95, metal: 0.3, seg: 16 });
    drumBody.rotation.z = Math.PI / 2;
    for (const x of [-0.3, 0.3]) torus(drum, 0.285, 0.018, x, 0.28, 0, 0x5a2a12, { rough: 0.9, metal: 0.3, seg: 6, seg2: 20 }).rotation.y = Math.PI / 2;
    const bung = cyl(drum, 0.035, 0.035, 0.03, 0.2, 0.56, 0, 0x3a2a1a, { rough: 0.8, seg: 10 });
    reg(hits, drumBody, "drum-unknown");
    const bungHit = box(drum, 0.25, 0.2, 0.25, 0.2, 0.62, 0, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(drum, "unscrew the bung to look?", 0.2, 0.85, 0.1, { css: "#d2312b", w: 0.46 });
    reg(hits, bungHit, "open-drum");
    void bung;
    const battery = group(g, 1.7, 0, 0.55, 0.4);
    const batBody = box(battery, 0.3, 0.2, 0.18, 0, 0.1, 0, 0x1b1e22, { rough: 0.6 });
    box(battery, 0.04, 0.03, 0.04, -0.08, 0.215, 0, 0xd2312b, { rough: 0.5 });
    box(battery, 0.04, 0.03, 0.04, 0.08, 0.215, 0, 0x2b5aa8, { rough: 0.5 });
    reg(hits, batBody, "battery");
    const liftHit = box(battery, 0.4, 0.3, 0.3, 0, 0.35, 0, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(battery, "take it up with you?", 0, 0.5, 0, { css: "#d2312b", w: 0.4 });
    reg(hits, liftHit, "lift-battery");
    const block = group(g, -1.2, 0, -1.3, 0.3);
    box(block, 0.7, 0.25, 0.5, 0, 0.12, 0, 0x8d8a80, { rough: 0.95, finish: "concrete", tile: 1 });
    const rebar = group(block, 0.1, 0.25, 0);
    for (const [x, rz] of [[-0.1, 0.3], [0.05, -0.2], [0.18, 0.5]]) { const b = cyl(rebar, 0.012, 0.012, 0.5, x, 0.22, 0, 0x8a4a2a, { rough: 0.8, metal: 0.4, seg: 6 }); b.rotation.z = rz; }
    reg(hits, rebar, "rebar-snag");
    const skiff = group(g, -0.3, 0, -2.3, 0.25);
    const hull = ball(skiff, 0.5, 0, 0.22, 0, 0xd8dde0, { rough: 0.6, metal: 0.2, seg: 16, seg2: 8 });
    hull.scale.set(1.0, 0.45, 2.6);
    box(skiff, 0.06, 0.04, 2.2, 0, 0.04, 0, 0x5a4a34, { rough: 0.9 });
    reg(hits, hull, "skiff-hull");
    const underHit = box(skiff, 0.8, 0.3, 0.6, 0.6, 0.2, 0.6, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(skiff, "go under it to look?", 0.7, 0.62, 0.6, { css: "#d2312b", w: 0.4 });
    reg(hits, underHit, "under-skiff");
    // Fishing line on the rock — the hazard — and the loops for the fouled fin.
    const rock = group(g, 2.4, 0, -0.5);
    ball(rock, 0.35, 0, 0.15, 0, 0x4a5048, { rough: 1, seg: 10, seg2: 8 }).scale.set(1.2, 0.6, 1);
    for (let i = 0; i < 4; i++) torus(rock, 0.18 + i * 0.05, 0.004, 0.05 * i, 0.3 + i * 0.03, 0, 0xdfe8ee, { rough: 0.2, opacity: 0.6, transparent: true, cast: false, seg: 4, seg2: 20 }).rotation.set(0.4 * i, 0.7 * i, 0);
    const monoHit = box(rock, 0.7, 0.5, 0.6, 0, 0.3, 0, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(rock, "swim through the line?", 0, 0.7, 0, { css: "#d2312b", w: 0.42 });
    reg(hits, monoHit, "kick-monofilament");
    const finLoops = group(g, 0.6, 0.35, 1.2);
    for (let i = 0; i < 3; i++) torus(finLoops, 0.12 + i * 0.03, 0.004, 0, 0, 0, 0xdfe8ee, { rough: 0.2, emissive: 0x8aa0a8, ei: 0.4, cast: false, seg: 4, seg2: 18 }).rotation.set(0.5 * i, 0.3, 0);
    finLoops.visible = false;
    // The rest of the survey's finds: a tyre, a shopping cart, a pallet.
    const tyre = torus(g, 0.3, 0.1, -2.5, 0.08, -0.6, 0x15181c, { rough: 0.9, seg: 8, seg2: 18 });
    tyre.rotation.x = Math.PI / 2 - 0.2;
    const cart = group(g, 2.6, 0, 1.6, -0.6);
    for (const [w, h, d, x, y, z] of [[0.5, 0.02, 0.02, 0, 0.5, -0.4], [0.5, 0.02, 0.02, 0, 0.5, 0.4], [0.02, 0.02, 0.8, -0.25, 0.5, 0], [0.02, 0.02, 0.8, 0.25, 0.5, 0], [0.5, 0.02, 0.8, 0, 0.2, 0], [0.02, 0.3, 0.02, -0.25, 0.35, 0.4], [0.02, 0.3, 0.02, 0.25, 0.35, 0.4]]) box(cart, w, h, d, x, y, z, 0x9aa2a8, { rough: 0.5, metal: 0.6 });
    cart.rotation.z = 0.5;
    const pallet = group(g, -2.6, 0.05, 1.8, 0.4);
    for (let i = 0; i < 4; i++) box(pallet, 0.9, 0.03, 0.12, 0, 0.06, -0.3 + i * 0.2, 0x5a4a34, { rough: 0.95 });

    // ------------------------------------------------------- offset tape, float, slate
    const offset = group(g, 0.55, 0.4, 0.35);
    const offTape = box(offset, 0.02, 0.004, 0.6, 0, 0, -0.3, 0xf2e6b8, { rough: 0.6 });
    void offTape;
    const offReel = cyl(offset, 0.06, 0.06, 0.04, 0, 0.02, 0.04, 0x2b8a5a, { rough: 0.55, seg: 14 });
    offReel.rotation.x = Math.PI / 2;
    holoTag(offset, "offset tape", 0, 0.16, 0, { css: BRDS_CSS, w: 0.22 });
    reg(hits, offset, "offset-tape");
    const float = group(g, 1.15, 0, -0.75);
    cyl(float, 0.006, 0.006, 0.9, 0, 0.45, 0, 0xe8dcb8, { rough: 0.8, seg: 4 });
    const floatBall = ball(float, 0.09, 0, 0.95, 0, 0xf06a2b, { rough: 0.5, seg: 12, seg2: 8 });
    void floatBall;
    holoTag(float, "marker float 07", 0, 1.15, 0, { css: BRDS_CSS, w: 0.3 });
    reg(hits, float, "marker-float");
    const slate = decal(g, 0.26, 0.2, -0.35, 1.05, 1.3, paperFace("SLATE", ["07 drum — ch / off", "08 battery", "Rebar · skiff · line"], { bg: "#e8eef0", band: BRDS_CSS }), { px: 192 });
    slate.rotation.y = 0.3;
    holoTag(g, "slate — write it up", -0.35, 1.24, 1.3, { css: BRDS_CSS, w: 0.36 });
    reg(hits, slate, "slate-entry");
    const mapSlate = decal(g, 0.3, 0.22, 0.55, 1.1, 1.35, paperFace("SURVEY MAP", ["Baseline on bearing", "Items 07–12 placed", "Hazards: for the work plan"], { bg: "#e8f0ec", band: "#2b8a5a" }), { px: 192 });
    mapSlate.rotation.y = -0.3;
    holoTag(g, "map slate — read up", 0.55, 1.3, 1.35, { css: BRDS_CSS, w: 0.36 });
    reg(hits, mapSlate, "diver-slate");

    // ------------------------------------------------------- the diver's kit and HUD
    const compass = group(g, -1.0, 1.05, 1.4, 0.3);
    cyl(compass, 0.07, 0.07, 0.03, 0, 0, 0, 0x1b1e22, { rough: 0.5, seg: 16 }).rotation.x = Math.PI / 2;
    const bezel = group(compass, 0, 0, 0.02);
    torus(bezel, 0.065, 0.008, 0, 0, 0, 0xc0c6cc, { rough: 0.3, metal: 0.8, seg: 6, seg2: 20 });
    box(bezel, 0.008, 0.05, 0.004, 0, 0.03, 0.01, 0xf06a2b, { rough: 0.5 });
    holoTag(compass, "compass bezel", 0, 0.14, 0, { css: BRDS_CSS, w: 0.28 });
    reg(hits, compass, "compass-bezel");
    const cutter = group(g, 0.05, 0.95, 1.45);
    box(cutter, 0.05, 0.12, 0.02, 0, 0, 0, 0xf06a2b, { rough: 0.6 });
    const blade = box(cutter, 0.02, 0.05, 0.01, 0, 0.08, 0, 0xc0c6cc, { rough: 0.3, metal: 0.8 });
    holoTag(cutter, "line cutter on harness", 0, 0.16, 0, { css: BRDS_CSS, w: 0.42 });
    reg(hits, cutter, "line-cutter");
    const holdMark = group(g, -0.4, 0.55, -1.2);
    const holdRing = torus(holdMark, 0.18, 0.01, 0, 0, 0, BRDS_ACCENT, { emissive: BRDS_ACCENT, ei: 1.4, rough: 0.4, cast: false, seg: 6, seg2: 20 });
    holdRing.rotation.x = Math.PI / 2;
    holoTag(holdMark, "hold here — read-back", 0, 0.2, 0, { css: BRDS_CSS, w: 0.42 });
    reg(hits, holdMark, "hold-position");
    const reportTag = holoTag(g, "report drum + battery", 1.3, 1.0, 0.3, { css: BRDS_CSS, w: 0.42 });
    reg(hits, reportTag, "hazard-report");
    const comms = holoPanel(g, 0.5, 0.3, 1.6, 1.6, 1.1, brdsCommsFace(["Supervisor · topside", "Press to talk"]), { ry: -0.5, accent: BRDS_ACCENT });
    reg(hits, comms, "diver-comms");
    holoPanel(g, 0.44, 0.26, -1.7, 1.6, 1.1, (cx, w, h) => {
      cx.fillStyle = "rgba(6,20,22,0.9)"; cx.fillRect(0, 0, w, h); cx.fillStyle = "#59c97b"; cx.fillRect(0, 0, w, 6);
      cx.font = `600 ${Math.round(h * 0.16)}px 'Barlow Condensed', Arial, sans-serif`; cx.textAlign = "left"; cx.textBaseline = "middle";
      cx.fillStyle = "#e6f6ea"; cx.fillText("DIVE TEAM", w * 0.06, h * 0.22);
      cx.font = `${Math.round(h * 0.11)}px Arial, sans-serif`; cx.fillStyle = "#f4f8fb";
      ["Supervisor on comms", "Tender on umbilical", "Standby dressed at ladder"].forEach((l, i) => cx.fillText(l, w * 0.06, h * (0.46 + i * 0.18)));
    }, { ry: 0.5, accent: 0x59c97b });

    // ------------------------------------------------------- downline, stage, umbilical
    const downline = group(g, -1.9, 0, 1.9);
    box(downline, 0.4, 0.2, 0.4, 0, 0.1, 0, 0x3a3f45, { rough: 0.8, metal: 0.3 });
    cyl(downline, 0.012, 0.012, 8, 0, 4.1, 0, 0xe8dcb8, { rough: 0.8, seg: 6 });
    const clip = group(downline, 0, 1.1, 0);
    const clipRing = torus(clip, 0.14, 0.01, 0, 0, 0, BRDS_ACCENT, { emissive: BRDS_ACCENT, ei: 1.6, rough: 0.4, cast: false, seg: 6, seg2: 20 });
    clipRing.rotation.x = Math.PI / 2;
    holoTag(clip, "downline clip", 0, 0.2, 0, { css: BRDS_CSS, w: 0.26 });
    reg(hits, clip, "downline-clip");
    const bag = group(g, -1.4, 0.1, 1.0);
    box(bag, 0.3, 0.2, 0.18, 0, 0.1, 0, 0x2f6f4f, { rough: 0.85 });
    ball(bag, 0.06, 0.08, 0.25, 0, 0xf06a2b, { rough: 0.5, seg: 10, seg2: 8 });
    holoTag(bag, "survey bag", 0, 0.42, 0, { css: BRDS_CSS, w: 0.22 });
    reg(hits, bag, "survey-bag");
    hose(g, [[-3.6, 1.2, 2.5], [-2.8, 0.25, 2.0], [-1.2, 0.2, 1.6], [-0.2, 0.3, 1.4], [0.1, 0.9, 1.4]], 0.03, 0xf2c14b, { steps: 16, rough: 0.8 });
    const stageCheck = group(g, -3.4, 1.4, 2.1);
    const stageRing = torus(stageCheck, 0.2, 0.01, 0, 0, 0, BRDS_ACCENT, { emissive: BRDS_ACCENT, ei: 1.6, rough: 0.4, cast: false, seg: 6, seg2: 24 });
    void stageRing;
    holoTag(stageCheck, "stage — check in", 0, 0.3, 0, { css: BRDS_CSS, w: 0.3 });
    reg(hits, stageCheck, "stage-checkin");

    // ------------------------------------------------------- the silt-out cloud, fish
    const cloud = group(g, 0, 0.6, 0.3);
    for (let i = 0; i < 6; i++) ball(cloud, 0.7 + (i % 3) * 0.2, -1.6 + i * 0.6, (i % 2) * 0.3, (i % 3) * 0.4 - 0.4, 0x7a806a, { rough: 1, opacity: 0.55, transparent: true, cast: false, seg: 10, seg2: 8 });
    cloud.visible = false;
    const onTape = holoTag(g, "on the tape — holding", 0.2, 0.8, -0.2, { css: "#59c97b", w: 0.4 });
    onTape.visible = false;
    const school = group(g, 0.2, 2.1, -2.6);
    for (let i = 0; i < 6; i++) {
      const f = group(school, (i % 3) * 0.35 - 0.35, Math.floor(i / 3) * 0.25, (i % 2) * 0.2);
      ball(f, 0.06, 0, 0, 0, 0x8aa0a8, { rough: 0.4, metal: 0.4, seg: 8, seg2: 6 }).scale.set(2.2, 0.8, 0.6);
    }
    for (let i = 0; i < 8; i++) {
      const a = i * 0.8;
      ball(g, 0.07 + (i % 3) * 0.02, Math.cos(a) * 2.6, 0.06, -0.6 + Math.sin(a) * 2.6, 0x1c1f2a, { rough: 0.8, metal: 0.1, seg: 8, seg2: 6 }).scale.set(1.4, 0.6, 1);
    }

    // ------------------------------------------------------- the rest of the debris field
    // Bottles, cans, a traffic cone, a coil of lost rope and a length of
    // chain: the ordinary litter a survey still has to place, and old pile
    // stubs from a pier that was taken out, ringed with growth.
    for (let i = 0; i < 9; i++) {
      const a = i * 0.71 + 0.3, r = 1.2 + (i % 4) * 0.45;
      const bottle = cyl(g, 0.035, 0.035, 0.2, Math.cos(a) * r, 0.04, -0.6 + Math.sin(a) * r, [0x2f6f4a, 0x6a4a2a, 0xa8c8c0][i % 3], { rough: 0.15, metal: 0.1, opacity: 0.8, transparent: true, seg: 8 });
      bottle.rotation.z = Math.PI / 2; bottle.rotation.y = a;
    }
    for (let i = 0; i < 6; i++) {
      const can = cyl(g, 0.03, 0.03, 0.1, -2.0 + i * 0.5, 0.03, -2.4 + (i % 2) * 0.3, [0xb8402f, 0x9aa2a8, 0x2b5aa8][i % 3], { rough: 0.5, metal: 0.6, seg: 8 });
      can.rotation.z = Math.PI / 2;
    }
    const cone = group(g, 1.3, 0, 2.4, 0.3);
    cyl(cone, 0.03, 0.16, 0.45, 0, 0.1, 0, 0xf06a2b, { rough: 0.6, seg: 12 }).rotation.z = 1.3;
    const ropeCoil = group(g, -2.9, 0.03, 0.2);
    for (let i = 0; i < 4; i++) torus(ropeCoil, 0.18 + i * 0.02, 0.018, 0, i * 0.02, 0, 0xc8b078, { rough: 0.9, seg: 6, seg2: 18 }).rotation.x = Math.PI / 2;
    for (let i = 0; i < 8; i++) {
      const link = torus(g, 0.06, 0.018, 1.8 + i * 0.12, 0.03, -2.4 + i * 0.06, 0x5a4a3a, { rough: 0.85, metal: 0.4, seg: 6, seg2: 10 });
      link.rotation.y = i % 2 ? 0 : Math.PI / 2; link.rotation.x = Math.PI / 2;
    }
    for (const [x, z] of [[-3.2, -2.8], [-2.1, -3.3], [3.1, -2.9]]) {
      const stub = group(g, x, 0, z);
      cyl(stub, 0.28, 0.3, 0.9, 0, 0.45, 0, 0x4a4234, { rough: 0.95, seg: 14 });
      cyl(stub, 0.33, 0.35, 0.22, 0, 0.3, 0, 0x56613f, { rough: 1, seg: 14 });
      for (let i = 0; i < 4; i++) { const a = i * 1.6 + x; ball(stub, 0.08, Math.cos(a) * 0.3, 0.15 + (i % 2) * 0.2, Math.sin(a) * 0.3, 0x1c1f2a, { rough: 0.8, metal: 0.1, seg: 8, seg2: 6 }).scale.set(1, 0.7, 1); }
    }
    for (let i = 0; i < 6; i++) cyl(g, 0.05, 0.03, 0.08, 2.4 + Math.cos(i * 1.1) * 0.5, 0.04, -0.5 + Math.sin(i * 1.1) * 0.5, [0xe86a8a, 0xf2a03d, 0xe8e2d0][i % 3], { rough: 0.7, seg: 8 });

    return {
      hits,
      spawnLook: new THREE.Vector3(0.2, 0.7, -0.6),
      onStep() {},
      onStepComplete(step) {
        if (step.id === "on-bottom") repaint(comms.userData.face, brdsCommsFace(["On the bottom — reported", "Survey starting at zero"]));
        if (step.id === "run-baseline") { reel.position.set(2.0, 0.5, -1.25); tape.scale.x = 1; tape.position.set(-0.05, 0.42, -0.2); }
        if (step.id === "hazard-items") drumBody.material = mat(0x8a2a1a, { rough: 0.95, metal: 0.3, emissive: 0x3a1206, ei: 0.4 });
        if (step.id === "tag-item") repaint(slate, paperFace("SLATE", ["07 drum — ch / off written", "08 battery", "Rebar · skiff · line"], { bg: "#e6f6ea", band: "#59c97b" }));
        if (step.id === "report-hazards") repaint(comms.userData.face, brdsCommsFace(["Drum 07 · battery 08", "Left — per the work plan"]));
        if (step.id === "bag-up") bag.position.set(-1.9, 1.0, 1.9);
        if (step.id === "read-up-map") repaint(mapSlate, paperFace("SURVEY MAP — READ UP", ["Baseline on bearing", "Items placed and floated", "Silt-out and line logged"], { bg: "#e6f6ea", band: "#59c97b" }));
      },
      onHazard() {},
      onInterrupt(it) {
        if (it.id === "silt-out") cloud.visible = true;
        if (it.id === "fin-fouled") finLoops.visible = true;
      },
      onInterruptEnd(it) {
        if (it.id === "silt-out") { cloud.visible = false; if (it.resolved === "answered") onTape.visible = true; }
        if (it.id === "fin-fouled" && it.resolved === "answered") { finLoops.visible = false; blade.rotation.z = 0.8; cutter.position.set(0.5, 0.5, 1.2); }
      },
      animate(t, dt, session) {
        const step = session?.step;
        if (session?.turn && step?.id === "set-bearing") bezel.rotation.z = session.turn.amount * Math.PI * 2;
        const gg = session?.gauge;
        if (gg && !gg.committed && step?.id === "read-offset") offset.scale.z = 0.5 + gg.t;
        if (step?.id === "swim-baseline" && session.holding) swim.position.x = -0.9 + (session.track?.inBand ?? 0) * 0.15;
        if (cloud.visible) cloud.rotation.y = t * 0.1;
        if (finLoops.visible) finLoops.rotation.y = t * 0.6;
        school.position.x = 0.2 + Math.sin(t * 0.3) * 0.3;
        void CITY; void signFace;
      },
    };
  },
};
