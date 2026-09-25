import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import { box, cyl, ball, torus, hose, group, decal, repaint, paperFace, mat } from "../../../shared/kit.js";
import { CITY, holoPanel, holoTag, reg, surfaceTexture, texturedMat, siltFace, growthFace } from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Derelict Gear Recovery Dive VR — SF Bay Restoration & Cleanup,
// maritime and underwater, pack A, on the bay-underwater district.
//
// On the bottom beside an old pile, where lost fishing gear has been killing
// what lives there: a ghost net draped over the pile and billowing in the
// current, a derelict crab pot with live crabs still in it and its groundline
// running off taut into the murk, a recovery bag, a net cutter on a lanyard,
// a lift bag with its dump valve rigged to the pot, the downline and its
// travelling clip. The learner is the diver, a Pile Drivers Local 34
// commercial diver on a restoration recovery dive; the supervisor is on the
// comms, the tender has the umbilical and the standby is dressed at the
// ladder. Depth, gas, bottom time and decompression are never written as
// numbers: they are per the dive plan and the tables the supervisor holds.

const BRGR_ACCENT = 0xe07a5f;
const BRGR_CSS = "#e07a5f";

function brgrCommsFace(lines, band = BRGR_CSS) {
  return (cx, w, h) => {
    cx.fillStyle = "rgba(22,12,10,0.9)"; cx.fillRect(0, 0, w, h); cx.fillStyle = band; cx.fillRect(0, 0, w, 6);
    cx.font = `600 ${Math.round(h * 0.15)}px 'Barlow Condensed', Arial, sans-serif`; cx.textAlign = "left"; cx.textBaseline = "middle";
    cx.fillStyle = "#f8e6e0"; cx.fillText("HELMET COMMS", w * 0.06, h * 0.22);
    cx.font = `${Math.round(h * 0.11)}px Arial, sans-serif`; cx.fillStyle = "#fbf0ec";
    lines.forEach((l, i) => cx.fillText(l, w * 0.06, h * (0.5 + i * 0.2)));
  };
}

/** A panel of netting: a grid of thin strands on a frame, for the ghost net. */
function brgrNet(parent, x, y, z, w, h, ry = 0) {
  const n = group(parent, x, y, z, ry);
  for (let i = 0; i <= 5; i++) box(n, 0.006, h, 0.006, -w / 2 + (i * w) / 5, 0, 0, 0x6a7a6a, { rough: 0.8, cast: false });
  for (let i = 0; i <= 5; i++) box(n, w, 0.006, 0.006, 0, -h / 2 + (i * h) / 5, 0, 0x6a7a6a, { rough: 0.8, cast: false });
  box(n, w, h, 0.004, 0, 0, 0, 0x4a5a4a, { rough: 0.9, opacity: 0.25, transparent: true, cast: false });
  return n;
}

export const SIM_BR_DERELICT_GEAR_RECOVERY_DIVE = {
  id: "br-derelict-gear-recovery-dive",
  index: "322",
  domain: "Maritime & Ports",
  trade: "Pile Drivers Local 34 commercial diver recovering derelict fishing gear for a Bay restoration, with the supervisor on the comms, the tender on the umbilical and the standby diver at the ladder",
  category: "Maritime & Ports",
  district: "bay-underwater",
  weather: "clear",
  underwater: {
    depthLabel: "Per dive plan",
    bottomTimeSeconds: 600,
  },
  certification: "Pile Drivers Local 34 commercial diver training under the UBC International Training Fund; OSHA 29 CFR 1910 Subpart T commercial diving operations — 29 CFR 1910.422 procedures during the dive (communications, the tended diver) and 29 CFR 1910.420 the employer's safe practices manual for lift bag and cutting work; ADCI International Consensus Standards for Commercial Diving and Underwater Operations; USCG 46 CFR 197 Subpart B where the dive is worked from a vessel; depth, gas, bottom time and decompression per the dive plan and the tables the supervisor holds",
  name: "Derelict Gear Recovery Dive",
  title: simTitle("Derelict Gear Recovery Dive"),
  tagline: "On the bottom beside the ghost net: on-bottom report, the billowing net and the taut groundline found, station held up-current while a panel of net wraps the umbilical, the live crabs let out of the pot, the net cut free from the pile, bagged and cinched, the lift bag filled to just neutral, the shackle and the lift line checked, the pot walked to the downline while the bag tries to run, the pot's tag read, the net sent up and the recovery read up for the dive log",
  accent: BRGR_ACCENT,
  accentCss: BRGR_CSS,
  parSeconds: 300,
  footprint: 2.6,
  badge: { id: "gear-out-diver-clear", name: "Gear Out, Diver Clear", note: "The net and the pot recovered, the live catch released, and the umbilical, the lift bag and the blade never where they could take the diver" },

  supportLine: "your union hall's member assistance programme — Pile Drivers Local 34 — with the employer's employee assistance line behind it",

  game: system({
    name: "Gear Recovery",
    currency: "MESH",
    ranks: ["Diver Trainee", "Diver", "Recovery Diver", "Lead Recovery Diver", "Gear Recovery Certified"],
    badges: [
      { id: "sized-up", name: "Sized Up", note: "The net and the groundline found before anything was touched", test: AWARD.stepClean("size-up") },
      { id: "neutral-first", name: "Neutral First", note: "The lift bag filled inside the band first time", test: AWARD.precise(0.7) },
      { id: "nothing-on-the-diver", name: "Nothing On The Diver", note: "No bag clipped to the harness, no haul on the groundline, never down-current of the net, never cutting toward the umbilical", test: AWARD.safe },
    ],
    challenges: [
      { id: "clean-recovery", name: "Clean Recovery", note: "No corrections from the on-bottom report to the read-up", test: AWARD.clean },
      { id: "controlled-lift", name: "Controlled Lift", note: "The pot walked in band the whole way to the downline", test: AWARD.unbroken },
      { id: "recovered-in-time", name: "Recovered In Time", note: "Recovery read up inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "bag-to-harness": "You went to clip the lift bag's line to your harness to keep it handy. A lift bag that breaks away or is overfilled rises faster the higher it goes as its air expands, and whatever it is clipped to goes with it: a diver taken up on a lift bag has an uncontrolled ascent with no stops — how divers are bent and embolised. The bag is only ever rigged to the load, never to the diver.",
    "haul-groundline": "You took hold of the pot's taut groundline to haul it free. A groundline running off into the murk is tied to something you cannot see — another pot, an anchor, a snag — and hauling on it can pull the diver off the bottom, drag a second piece of gear down onto you, or part and whip. It is followed, looked at and cut where it can be controlled, not hauled blind.",
    "downcurrent-of-net": "You moved round to the down-current side of the net. The current lays a net over whatever is down-current of it, and a diver there has the netting draped over the helmet, the harness and the umbilical at once. Nets are worked from up-current, where the current holds them away from you.",
    "cut-toward-umbilical": "You started the cut with the blade drawn toward the umbilical where it crossed the net. A net cutter drawn toward yourself is drawn toward the gas, comms and lifting line you are breathing through, and a slip in low visibility is a cut hose. Every cut is made away from the diver and away from the umbilical.",
  },

  lateNotes: {
    "lift-bag": "The lift bag is filled once the net is bagged and cinched — clear the net before you put any lift on the pot.",
    "load-walk": "The pot is walked to the downline once the rigging has been checked.",
    "diver-slate": "The recovery is read up once the net has gone up the downline.",
  },

  steps: [
    {
      id: "on-bottom", kind: "select", target: "diver-comms",
      title: "Report on the bottom beside the gear",
      cue: "Call the supervisor: on the bottom at the pile, feeling good, visibility and current as you find them, and the gear in sight — a net on the pile and a pot beside it.",
      why: "A recovery dive is planned from a survey, but the bottom is never quite what the survey said: the net may have moved, the current may be setting across it, the pot may have company. The on-bottom report tells the supervisor what is really there before the diver goes near it, starts the clock the dive is run against, and proves the voice circuit on the bottom — it is the comms check that matters most on a dive among netting.",
    },
    {
      id: "size-up", kind: "find", noHint: true,
      targets: ["net-billow", "taut-groundline"],
      itemNames: { "net-billow": "ghost net billowing off the pile in the current", "taut-groundline": "pot's groundline running off taut into the murk" },
      itemNotes: {
        "net-billow": "A panel of lost net is hung on the pile and billowing out down-current, its lower edge lifting and settling with each surge — a curtain that will lay itself over anything that moves into it.",
        "taut-groundline": "The crab pot's groundline runs off the pot and into the murk under tension. It is tied to something out of sight, and whatever that is will move if the line is hauled.",
      },
      title: "Size up the gear before touching it",
      cue: "From where you are, look at how the net is hanging and moving, and follow the pot's lines with your eyes — what is tight, what is loose, what goes where.",
      why: "Derelict gear is dangerous because it was designed to catch things and it still does: nets entangle divers, lines snag umbilicals and pots pin hands. The size-up is done before contact so the plan is built on how the gear is actually lying — which way the net will move in the current and which lines are under load — rather than discovered by getting caught in it.",
    },
    {
      id: "hold-upcurrent", kind: "hold", target: "upcurrent-station", seconds: 5,
      title: "Hold station up-current of the net while you plan the cut",
      cue: "Hold on the pile up-current of the net, clear of the netting, while you tell the supervisor where you will cut and in what order.",
      why: "Up-current of a net, the water carries the netting away from you; down-current, it carries it onto you. Holding station on the up-current side while you plan the cut keeps the diver out of the net and gives the supervisor time to agree the order — which edge first, where the umbilical will be and when the tender will need to take up slack.",
      holdBreakNote: "You let go of the pile before the plan was agreed and drifted toward the net — take hold up-current again and finish the plan with the supervisor.",
    },
    {
      id: "free-catch", kind: "turn", target: "pot-door",
      title: "Open the pot's door and let the live crabs out",
      cue: "Turn the latch on the pot's door and open it wide, so the live crabs trapped inside can walk out onto the bottom.",
      why: "A derelict pot keeps fishing long after its owner lost it: animals go in after the bait, cannot get out, die and become the bait for the next. Opening the door on the bottom lets the live catch walk out where it belongs before the pot is lifted, and a pot with its door open stops fishing even if the lift has to wait for another dive.",
      turn: { turns: 0.5, label: "POT DOOR LATCH", readout: (t) => (t < 0.3 ? "latched — catch trapped" : t < 0.9 ? "opening" : "door open — crabs walking out") },
    },
    {
      id: "cut-net", kind: "drag", target: "net-cutter",
      title: "Cut the net free from the pile, away from yourself",
      cue: "Take the net cutter off its lanyard clip and draw it through the lashings at the marked cut point on the up-current edge, blade away from you and the umbilical.",
      why: "The net is cut free from the pile at its lashings, on the up-current edge first, so the rest of it streams away from you as it comes loose rather than folding back over you. The cutter stays on its lanyard so it cannot be dropped into the net, and every stroke goes away from the diver's body and umbilical, because a slip in bad visibility goes wherever the blade was pointed.",
      drag: { to: "net-cut-point", radius: 0.5, missNote: "Not at the cut point — cut at the marked lashing on the up-current edge, blade away from you." },
    },
    {
      id: "bag-net", kind: "sequence",
      targets: ["recovery-bag", "bag-cinch"],
      itemNames: { "recovery-bag": "net fed into the mesh recovery bag", "bag-cinch": "recovery bag's drawstring cinched and clipped" },
      title: "Bag the net, then cinch the bag",
      cue: "Feed the freed net into the recovery bag a bight at a time, keeping it off your harness, then pull the drawstring tight and clip it.",
      why: "A loose net in the water is still a net: it drifts, it snags the umbilical and it catches the next diver. Fed into the bag a little at a time from up-current it goes in without wrapping the diver, and it is only cinched once it is all inside, so the drawstring closes on the net and not on a bight still hanging out of the bag toward your fins.",
      outOfOrderNote: "Out of order — the net goes into the bag first; cinch it only when all of it is inside.",
    },
    {
      id: "fill-lift-bag", kind: "gauge", target: "lift-bag",
      title: "Fill the lift bag until the pot is just neutral",
      cue: "Crack air into the lift bag rigged to the pot a little at a time and commit when the pot just lifts off the silt and hangs — neutral, not rising.",
      why: "A lift bag is filled to make the load just neutral, never buoyant: a neutral load can be walked across the bottom by hand, while a buoyant one is on its way to the surface and gaining speed as its air expands. Filling in small bursts and stopping as the pot just lightens keeps the lift under the diver's control, and the dump valve is there to take air out if it goes past neutral.",
      gauge: { label: "LIFT BAG", speed: 0.62, green: [0.46, 0.62], readout: (t) => (t < 0.46 ? "still heavy on the bottom" : t <= 0.62 ? "just neutral — hanging" : "overfilled — starting to run"), missNote: "Outside the band — fill in small bursts and stop the moment the pot just hangs off the silt." },
    },
    {
      id: "rigging-check", kind: "find", noHint: true,
      targets: ["shackle-pin", "line-over-umbilical"],
      itemNames: { "shackle-pin": "lift bag shackle pin not moused", "line-over-umbilical": "lift line crossing over your umbilical" },
      itemNotes: {
        "shackle-pin": "The shackle joining the lift bag's line to the pot has its pin screwed in but not moused with wire; a pin that backs out under a swinging load lets the bag go on its own.",
        "line-over-umbilical": "The lift line runs from the bag down to the pot across your umbilical where it lies over the pot — if the bag rose, it would take the umbilical with it.",
      },
      title: "Check the lift rigging before the load moves",
      cue: "Look along the rigging from the bag to the pot: the shackle pin, the line's path, and where your umbilical is in relation to it.",
      why: "Lift bag rigging fails in the two places a hurried diver does not look: the shackle pin that backs out as the load swings, and the line that has crossed over the diver's own umbilical. A load that breaks away sends the bag to the surface uncontrolled; a lift line over the umbilical turns the lift into a pull on the diver. Both are seen and fixed while the load is still resting on the bottom.",
    },
    {
      id: "walk-load", kind: "track", target: "load-walk", seconds: 6,
      title: "Walk the pot to the downline, venting to keep it neutral",
      cue: "Guide the neutral pot across the bottom to the downline by hand, venting a little air from the dump valve whenever it starts to rise — never letting it get light.",
      why: "As the pot is moved it may shed silt and water and get lighter, and a bag that was neutral on the bottom starts to rise on its own. Walking it steadily and venting as soon as it lifts keeps the load hanging beside you, under control, until it is at the downline where the tender can take it. A diver who lets it get light is holding onto something that wants to go to the surface faster than they are allowed to.",
      track: { start: 0.14, green: [0.42, 0.6], rise: 0.56, fall: 0.46, drift: 0.12, label: "LOAD BUOYANCY", readout: (v) => (v < 0.42 ? "dragging on the bottom" : v > 0.6 ? "getting light — vent" : "neutral and under control") },
      holdBreakNote: "The load went out of band — dragging in the silt or getting light. Vent or add a touch of air and bring it back to neutral.",
    },
    {
      id: "read-tag", kind: "select", target: "pot-tag",
      title: "Read the pot's buoy tag for the record",
      cue: "Wipe the tag on the pot's bridle with your glove and read the number up to the supervisor.",
      why: "Derelict gear programmes record every recovered pot's tag, because the tags show where gear is being lost and help fisheries and restoration managers work with fishers to stop it. The tag is read on the bottom, where the pot is still under control, so the record ties the tag to this site and this dive rather than to whichever pot is on deck when someone thinks to look.",
    },
    {
      id: "net-up", kind: "drag", target: "net-bag-up",
      title: "Send the bagged net up on the downline clip",
      cue: "Clip the cinched recovery bag onto the downline's travelling clip and signal the tender to take it up.",
      why: "The bagged net goes up the downline because the tender can control it there and it cannot drift back onto the site. Carried by hand it would ride with the diver on the ascent, snagging the umbilical at every stop; left on the bottom it is the next diver's entanglement. On the clip, it arrives at the ladder where the deck crew is waiting for it.",
      drag: { to: "downline-clip", radius: 0.5, missNote: "Not on the downline clip — send the bagged net up the downline, not in your hand." },
    },
    {
      id: "read-up", kind: "select", target: "diver-slate",
      title: "Read the recovery up for the dive log",
      cue: "Read your slate to the supervisor: the net and how much of it, the pot and its tag, the catch released, the groundline left for the next dive, the fouled umbilical and the bag that tried to run.",
      why: "The supervisor writes the dive log and the recovery tally from what you read up, and it is read while you are still on the bottom, where anything unclear can be looked at again. The groundline going off into the murk goes in as unfinished work, and the umbilical fouling and the runaway bag go in as well, because the next diver on this pile needs to know how this gear behaves.",
    },
    {
      id: "stage-checkin", kind: "select", target: "stage-checkin",
      title: "Check in at the stage and leave on the supervisor's call",
      cue: "At the stage, clipped on: tell the supervisor how you feel after the net and the lift, and wait for the call to leave the bottom.",
      why: "The ascent is the supervisor's call, and the check-in tells them you are on the stage, clipped on and well after a heavy, awkward piece of work. A net across the umbilical and a lift bag trying to run are the kind of moments a diver replays afterwards; saying so at the stage is part of the dive, and the Pile Drivers Local 34 member assistance line is there for what the debrief does not settle.",
    },
  ],

  interrupts: [
    {
      id: "net-on-umbilical",
      kind: "Net fouling the umbilical",
      after: "hold-upcurrent", delay: 2, seconds: 14,
      alert: "The current has swung — a panel of the net has lifted off the pile and draped across your umbilical just behind your helmet.",
      cue: "Give the tender the line-pull signal to hold the umbilical steady, then work the net off it from up-current.",
      target: "tender-signal",
      why: "A net on the umbilical tightens if either end moves: the tender paying out or taking in, or the diver backing away, pulls the netting deeper into the bundle. The first thing is the signal that tells the tender to hold everything steady, so the diver can lift the netting off the umbilical from up-current. If it cannot be cleared, the supervisor sends the standby, who is dressed for exactly that.",
      missNote: "You backed away from the net with it still across your umbilical; the tender, feeling the pull, took in slack and dragged the netting tight round the hose behind your helmet.",
      wrongNote: "The tender signal — have the tender hold the umbilical steady before you work the net off it.",
    },
    {
      id: "bag-runaway",
      kind: "Lift bag starting to run",
      after: "walk-load", delay: 2, seconds: 12,
      alert: "The pot has shed its silt and the lift bag is rising — it is pulling up off the bottom and gathering speed.",
      cue: "Pull the lift bag's dump valve to spill air and bring the pot back down, then tell the supervisor.",
      target: "dump-valve",
      why: "A lift bag that starts to rise will keep accelerating as its air expands, and it will take whatever it is attached to — or snagged on — to the surface with it. The dump valve spills air in a moment and brings the load back down while it is still close; holding on and hoping is how a diver ends up riding a load to the surface or letting it go into the dive boat's hull.",
      missNote: "You hung on to the rising pot; the bag took it up off the bottom with you holding the bridle, and the supervisor had to call you to let go as your pneumo showed you rising.",
      wrongNote: "The dump valve — spill air from the bag before it runs, do not hang on to the load.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);

    // ------------------------------------------------------- the bottom and the old pile
    const siltTex = surfaceTexture((cx, w, h) => siltFace(cx, w, h), { px: 256, repeat: 3 });
    const mound = cyl(g, 2.9, 3.3, 0.1, 0, 0.03, -0.6, 0xffffff, { seg: 28, cast: false });
    mound.material = texturedMat(siltTex, { rough: 1, metal: 0, color: 0xb2bcaa });
    const growthTex = surfaceTexture((cx, w, h) => growthFace(cx, w, h), { px: 256 });
    growthTex.repeat?.set?.(2, 3);
    const pile = group(g, -0.6, 0, -1.4);
    const shaft = cyl(pile, 0.32, 0.34, 5.6, 0, 2.8, 0, 0xffffff, { seg: 18 });
    shaft.material = texturedMat(growthTex, { rough: 0.95, metal: 0.02, color: 0xe2e8dc });
    for (const [y, h] of [[0.3, 0.4], [2.4, 0.3], [3.6, 0.24]]) cyl(pile, 0.4, 0.42, h, 0, y, 0, 0x56613f, { rough: 1, seg: 16 });
    for (let i = 0; i < 6; i++) { const a = i * 1.05; ball(pile, 0.1 + (i % 2) * 0.04, Math.cos(a) * 0.38, 0.12 + (i % 3) * 0.14, Math.sin(a) * 0.38, 0x1c1f2a, { rough: 0.8, metal: 0.1, seg: 8, seg2: 6 }).scale.set(1, 0.7, 1); }
    const upStation = group(pile, -0.45, 1.0, 0.25);
    const upRing = torus(upStation, 0.16, 0.01, 0, 0, 0, BRGR_ACCENT, { emissive: BRGR_ACCENT, ei: 1.6, rough: 0.4, cast: false, seg: 6, seg2: 20 });
    void upRing;
    holoTag(upStation, "hold here — up-current", 0, 0.24, 0, { css: BRGR_CSS, w: 0.42 });
    reg(hits, upStation, "upcurrent-station");

    // ------------------------------------------------------- the ghost net
    const net = group(g, -0.1, 0, -1.2);
    const netMain = brgrNet(net, 0.5, 1.3, 0.1, 1.2, 1.3, -0.4);
    reg(hits, netMain, "net-billow");
    const netLow = brgrNet(net, 0.9, 0.45, 0.35, 0.9, 0.5, -0.7);
    netLow.rotation.x = -0.6;
    const netPanel = brgrNet(g, 0.9, 1.0, -0.6, 0.6, 0.5, -0.2);
    const netPanelHome = netPanel.position.clone ? netPanel.position.clone() : { x: 0.9, y: 1.0, z: -0.6 };
    const cutPoint = group(g, -0.2, 1.7, -1.1);
    const cutRing = torus(cutPoint, 0.1, 0.008, 0, 0, 0, BRGR_ACCENT, { emissive: BRGR_ACCENT, ei: 1.6, rough: 0.4, cast: false, seg: 6, seg2: 18 });
    void cutRing;
    holoTag(cutPoint, "cut point — lashing", 0, 0.16, 0, { css: BRGR_CSS, w: 0.34 });
    reg(hits, cutPoint, "net-cut-point");
    const downHit = box(g, 0.6, 0.8, 0.5, 1.5, 0.8, -0.3, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "round to the down-current side?", 1.5, 1.35, -0.3, { css: "#d2312b", w: 0.56 });
    reg(hits, downHit, "downcurrent-of-net");

    // ------------------------------------------------------- the pot, its door, groundline, tag
    const pot = group(g, 0.9, 0, 0.5, -0.3);
    for (const [w, h, d, x, y, z] of [[0.8, 0.02, 0.02, 0, 0.02, -0.3], [0.8, 0.02, 0.02, 0, 0.02, 0.3], [0.8, 0.02, 0.02, 0, 0.36, -0.3], [0.8, 0.02, 0.02, 0, 0.36, 0.3],
      [0.02, 0.36, 0.02, -0.4, 0.19, -0.3], [0.02, 0.36, 0.02, 0.4, 0.19, -0.3], [0.02, 0.36, 0.02, -0.4, 0.19, 0.3], [0.02, 0.36, 0.02, 0.4, 0.19, 0.3]]) box(pot, w, h, d, x, y, z, 0x7a8a6a, { rough: 0.8, metal: 0.3 });
    box(pot, 0.78, 0.34, 0.58, 0, 0.19, 0, 0x3a4a32, { rough: 0.9, opacity: 0.35, transparent: true, cast: false });
    const door = group(pot, 0.4, 0.19, 0);
    const doorPanel = box(door, 0.02, 0.3, 0.3, 0, 0, 0, 0x9aa28a, { rough: 0.7, metal: 0.3 });
    holoTag(door, "pot door latch", 0.05, 0.28, 0, { css: BRGR_CSS, w: 0.28 });
    reg(hits, door, "pot-door");
    const crabs = group(pot, 0, 0.06, 0);
    for (let i = 0; i < 3; i++) ball(crabs, 0.06, -0.2 + i * 0.18, 0, (i % 2) * 0.1, 0xb8502a, { rough: 0.7, seg: 8, seg2: 6 }).scale.set(1.4, 0.5, 1);
    const tagG = group(pot, -0.2, 0.42, 0.31);
    const tag = decal(tagG, 0.1, 0.06, 0, 0, 0, paperFace("TAG", ["— — —"], { bg: "#f2a03d", band: "#1b1e22" }), { px: 96 });
    holoTag(tagG, "buoy tag", 0, 0.08, 0, { css: BRGR_CSS, w: 0.18 });
    reg(hits, tag, "pot-tag");
    const groundline = group(g, 1.3, 0.1, 0.8);
    hose(groundline, [[0, 0, 0], [0.6, 0.02, 0.4], [1.3, 0.05, 0.9], [2.0, 0.1, 1.3]], 0.01, 0xe8dcb8, { steps: 10, rough: 0.8 });
    const glHit = box(groundline, 1.2, 0.3, 0.3, 0.9, 0.1, 0.6, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    glHit.rotation.y = -0.6;
    reg(hits, glHit, "taut-groundline");
    const haulHit = box(g, 0.4, 0.4, 0.4, 2.6, 0.35, 1.9, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "haul it free on the line?", 2.6, 0.7, 1.9, { css: "#d2312b", w: 0.44 });
    reg(hits, haulHit, "haul-groundline");

    // ------------------------------------------------------- lift bag, dump valve, rigging
    const liftBag = group(g, 0.9, 0.9, 0.5);
    const bagBody = ball(liftBag, 0.24, 0, 0.3, 0, 0xf2a03d, { rough: 0.6, seg: 14, seg2: 10 });
    bagBody.scale.set(1, 0.5, 1);
    cyl(liftBag, 0.006, 0.006, 0.5, 0, -0.05, 0, 0x2b3138, { rough: 0.7, seg: 4 });
    holoTag(liftBag, "lift bag", 0, 0.62, 0, { css: BRGR_CSS, w: 0.2 });
    reg(hits, liftBag, "lift-bag");
    const dump = group(liftBag, 0.22, 0.25, 0);
    cyl(dump, 0.03, 0.03, 0.04, 0, 0, 0, 0xd2312b, { rough: 0.5, seg: 10 });
    cyl(dump, 0.003, 0.003, 0.3, 0.03, -0.15, 0, 0xd2312b, { rough: 0.6, seg: 4 });
    holoTag(dump, "dump valve", 0.06, 0.1, 0, { css: BRGR_CSS, w: 0.22 });
    reg(hits, dump, "dump-valve");
    const shackle = group(g, 0.9, 0.42, 0.5);
    torus(shackle, 0.03, 0.008, 0, 0, 0, 0xc0c6cc, { rough: 0.3, metal: 0.8, seg: 6, seg2: 12 });
    const pin = box(shackle, 0.07, 0.012, 0.012, 0, -0.03, 0, 0xc05a2a, { rough: 0.5, emissive: 0x5a1a06, ei: 0.3 });
    reg(hits, pin, "shackle-pin");
    const umbCross = group(g, 0.55, 0.45, 0.8);
    const crossMark = box(umbCross, 0.2, 0.02, 0.02, 0, 0, 0, 0xf2c14b, { rough: 0.8, emissive: 0x4a3a0a, ei: 0.3 });
    crossMark.rotation.y = 0.8;
    reg(hits, crossMark, "line-over-umbilical");
    const clipHit = box(g, 0.3, 0.3, 0.3, 0.4, 1.0, 1.35, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "clip the bag line to your harness?", 0.4, 1.25, 1.35, { css: "#d2312b", w: 0.58 });
    reg(hits, clipHit, "bag-to-harness");
    const walk = group(g, 0.0, 0.6, 1.1);
    for (let i = 0; i < 3; i++) { const chev = box(walk, 0.12, 0.012, 0.03, -i * 0.22, 0, i * 0.12, BRGR_ACCENT, { emissive: BRGR_ACCENT, ei: 1.4, rough: 0.4, cast: false }); chev.rotation.y = -0.5; }
    holoTag(walk, "walk it to the downline", -0.2, 0.16, 0.1, { css: BRGR_CSS, w: 0.42 });
    reg(hits, walk, "load-walk");

    // ------------------------------------------------------- the diver's kit: cutter, bag, signal
    const cutter = group(g, 0.15, 1.0, 1.45, 0.3);
    box(cutter, 0.05, 0.12, 0.02, 0, 0, 0, 0xf06a2b, { rough: 0.6 });
    box(cutter, 0.03, 0.06, 0.01, 0, 0.09, 0, 0xc0c6cc, { rough: 0.3, metal: 0.8 });
    cyl(cutter, 0.003, 0.003, 0.3, 0, -0.2, 0, 0xe8b02e, { rough: 0.7, seg: 4 });
    holoTag(cutter, "net cutter on lanyard", 0, 0.16, 0, { css: BRGR_CSS, w: 0.38 });
    reg(hits, cutter, "net-cutter");
    const towardHit = box(g, 0.3, 0.3, 0.3, -0.5, 1.3, -0.5, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "cut toward the umbilical?", -0.5, 1.55, -0.5, { css: "#d2312b", w: 0.46 });
    reg(hits, towardHit, "cut-toward-umbilical");
    const recBag = group(g, -1.3, 0.1, 0.4);
    const recBody = box(recBag, 0.4, 0.26, 0.3, 0, 0.13, 0, 0x2f5f4f, { rough: 0.85, opacity: 0.85, transparent: true });
    holoTag(recBag, "recovery bag", 0, 0.42, 0, { css: BRGR_CSS, w: 0.24 });
    reg(hits, recBag, "recovery-bag");
    const cinch = group(recBag, 0.15, 0.3, 0.1);
    box(cinch, 0.03, 0.05, 0.03, 0, 0, 0, 0xe8b02e, { rough: 0.6 });
    holoTag(cinch, "drawstring", 0, 0.1, 0, { css: BRGR_CSS, w: 0.2 });
    reg(hits, cinch, "bag-cinch");
    const bagUp = group(g, -1.75, 0.1, 0.9);
    box(bagUp, 0.36, 0.3, 0.3, 0, 0.15, 0, 0x2f5f4f, { rough: 0.85 });
    holoTag(bagUp, "bagged net — send up", 0, 0.45, 0, { css: BRGR_CSS, w: 0.38 });
    reg(hits, bagUp, "net-bag-up");
    bagUp.visible = false;
    const umb = group(g, 0, 0, 0);
    const umbSlack = hose(umb, [[-3.6, 1.2, 2.5], [-2.8, 0.25, 2.0], [-1.2, 0.3, 1.4], [0.0, 0.5, 1.0], [0.4, 1.0, 1.3]], 0.03, 0xf2c14b, { steps: 16, rough: 0.8 });
    const umbTaut = hose(umb, [[-3.6, 1.2, 2.5], [-2.6, 0.7, 2.0], [-1.2, 0.8, 1.6], [0.0, 0.95, 1.35], [0.4, 1.0, 1.3]], 0.03, 0xe8b02e, { steps: 16, rough: 0.8 });
    umbTaut.visible = false;
    const signal = group(g, -1.1, 0.45, 1.55);
    box(signal, 0.12, 0.12, 0.12, 0, 0, 0, 0xf2c14b, { rough: 0.8, opacity: 0.4, transparent: true, cast: false });
    holoTag(signal, "line-pull signal to tender", 0, 0.16, 0, { css: BRGR_CSS, w: 0.46 });
    reg(hits, signal, "tender-signal");

    // ------------------------------------------------------- HUD: comms, team, slate
    const comms = holoPanel(g, 0.5, 0.3, 1.65, 1.6, 1.0, brgrCommsFace(["Supervisor · topside", "Press to talk"]), { ry: -0.6, accent: BRGR_ACCENT });
    reg(hits, comms, "diver-comms");
    holoPanel(g, 0.44, 0.26, -1.8, 1.6, 0.2, (cx, w, h) => {
      cx.fillStyle = "rgba(22,12,10,0.9)"; cx.fillRect(0, 0, w, h); cx.fillStyle = "#59c97b"; cx.fillRect(0, 0, w, 6);
      cx.font = `600 ${Math.round(h * 0.16)}px 'Barlow Condensed', Arial, sans-serif`; cx.textAlign = "left"; cx.textBaseline = "middle";
      cx.fillStyle = "#e6f6ea"; cx.fillText("DIVE TEAM", w * 0.06, h * 0.22);
      cx.font = `${Math.round(h * 0.11)}px Arial, sans-serif`; cx.fillStyle = "#f4f8fb";
      ["Supervisor on comms", "Tender on umbilical", "Standby dressed at ladder"].forEach((l, i) => cx.fillText(l, w * 0.06, h * (0.46 + i * 0.18)));
    }, { ry: 0.6, accent: 0x59c97b });
    const slate = decal(g, 0.28, 0.22, 1.25, 1.0, 1.55, paperFace("SLATE", ["Net: pile, up-current edge", "Pot: tag ____ · catch out", "Groundline: left"], { bg: "#f6ece8", band: BRGR_CSS }), { px: 192 });
    slate.rotation.y = -0.35;
    holoTag(g, "slate — read up", 1.25, 1.2, 1.55, { css: BRGR_CSS, w: 0.28 });
    reg(hits, slate, "diver-slate");

    // ------------------------------------------------------- downline and stage
    const downline = group(g, -2.1, 0, 1.9);
    box(downline, 0.4, 0.2, 0.4, 0, 0.1, 0, 0x3a3f45, { rough: 0.8, metal: 0.3 });
    cyl(downline, 0.012, 0.012, 8, 0, 4.1, 0, 0xe8dcb8, { rough: 0.8, seg: 6 });
    const clip = group(downline, 0, 1.1, 0);
    const clipRing = torus(clip, 0.14, 0.01, 0, 0, 0, BRGR_ACCENT, { emissive: BRGR_ACCENT, ei: 1.6, rough: 0.4, cast: false, seg: 6, seg2: 20 });
    clipRing.rotation.x = Math.PI / 2;
    holoTag(clip, "downline clip", 0, 0.2, 0, { css: BRGR_CSS, w: 0.26 });
    reg(hits, clip, "downline-clip");
    const stageCheck = group(g, -3.4, 1.4, 2.1);
    torus(stageCheck, 0.2, 0.01, 0, 0, 0, BRGR_ACCENT, { emissive: BRGR_ACCENT, ei: 1.6, rough: 0.4, cast: false, seg: 6, seg2: 24 });
    holoTag(stageCheck, "stage — check in", 0, 0.3, 0, { css: BRGR_CSS, w: 0.3 });
    reg(hits, stageCheck, "stage-checkin");

    // ------------------------------------------------------- what the gear has already killed, and what still lives here
    for (let i = 0; i < 5; i++) ball(g, 0.05, -0.3 + i * 0.25, 0.05, -0.55 + (i % 2) * 0.15, 0xd8cfc0, { rough: 0.8, seg: 6, seg2: 4 }).scale.set(1.4, 0.4, 1);
    for (let i = 0; i < 10; i++) { const a = i * 0.63; ball(g, 0.07 + (i % 3) * 0.02, -0.6 + Math.cos(a) * 1.9, 0.07, -1.4 + Math.sin(a) * 1.3, 0x1c1f2a, { rough: 0.8, metal: 0.1, seg: 8, seg2: 6 }).scale.set(1.4, 0.6, 1); }
    for (let i = 0; i < 5; i++) cyl(g, 0.05, 0.03, 0.08, -0.6 + Math.cos(i * 1.3) * 0.55, 0.04, -1.4 + Math.sin(i * 1.3) * 0.55, [0xe86a8a, 0xf2a03d, 0xe8e2d0][i % 3], { rough: 0.7, seg: 8 });
    for (let i = 0; i < 8; i++) { const frond = box(g, 0.03, 0.5 + (i % 3) * 0.15, 0.1, 2.2 + (i % 4) * 0.2, 0.3, -1.8 + Math.floor(i / 4) * 0.3, 0x5a7a3a, { rough: 0.9, cast: false }); frond.rotation.z = 0.2 * ((i % 3) - 1); }
    const school = group(g, 0.4, 2.2, -2.4);
    for (let i = 0; i < 6; i++) ball(school, 0.05, (i % 3) * 0.3 - 0.3, Math.floor(i / 3) * 0.22, (i % 2) * 0.2, 0x8aa0a8, { rough: 0.4, metal: 0.4, seg: 8, seg2: 6 }).scale.set(2.2, 0.8, 0.6);
    const tyre = torus(g, 0.3, 0.1, -2.5, 0.08, -0.8, 0x15181c, { rough: 0.9, seg: 8, seg2: 18 });
    tyre.rotation.x = Math.PI / 2 - 0.2;
    const secondPot = group(g, 2.7, 0, 1.6, 0.5);
    for (const [w, h, d, x, y, z] of [[0.6, 0.02, 0.02, 0, 0.02, -0.2], [0.6, 0.02, 0.02, 0, 0.02, 0.2], [0.02, 0.3, 0.02, -0.3, 0.16, 0], [0.02, 0.3, 0.02, 0.3, 0.16, 0]]) box(secondPot, w, h, d, x, y, z, 0x6a7a5a, { rough: 0.8, metal: 0.3 });

    // Where the groundline goes: a lost anchor and a run of chain half-buried
    // off in the murk, and rocks the net has already dragged across.
    const anchorG = group(g, 3.3, 0, 2.2, 0.6);
    box(anchorG, 0.05, 0.05, 0.6, 0, 0.05, 0, 0x4a4a4a, { rough: 0.8, metal: 0.4 });
    box(anchorG, 0.4, 0.05, 0.05, 0, 0.05, -0.28, 0x4a4a4a, { rough: 0.8, metal: 0.4 });
    torus(anchorG, 0.05, 0.012, 0, 0.06, 0.32, 0x4a4a4a, { rough: 0.8, metal: 0.4, seg: 6, seg2: 10 });
    for (let i = 0; i < 9; i++) {
      const link = torus(g, 0.05, 0.015, 3.2 - i * 0.11, 0.03, 2.0 - i * 0.03, 0x5a4a3a, { rough: 0.85, metal: 0.4, seg: 6, seg2: 10 });
      link.rotation.y = i % 2 ? 0 : Math.PI / 2; link.rotation.x = Math.PI / 2;
    }
    for (let i = 0; i < 5; i++) ball(g, 0.16 + (i % 3) * 0.05, -2.9 + i * 0.4, 0.07, -2.2 + (i % 2) * 0.3, 0x4a5048, { rough: 1, seg: 8, seg2: 6 }).scale.set(1.2, 0.55, 1);

    return {
      hits,
      spawnLook: new THREE.Vector3(0.2, 0.8, -0.6),
      onStep() {},
      onStepComplete(step) {
        if (step.id === "on-bottom") repaint(comms.userData.face, brgrCommsFace(["On the bottom at the pile", "Net and pot in sight"]));
        if (step.id === "free-catch") { door.rotation.y = -1.3; crabs.position.set(0.8, -0.05, 0.2); }
        if (step.id === "cut-net") { cutter.position.set(-0.2, 1.6, -1.0); netMain.rotation.z = 0.5; netMain.position.y = 0.8; }
        if (step.id === "bag-net") { netMain.visible = false; netLow.visible = false; recBody.scale.set(1.2, 1.4, 1.2); }
        if (step.id === "fill-lift-bag") { bagBody.scale.set(1, 0.9, 1); pot.position.y = 0.08; }
        if (step.id === "rigging-check") { pin.material = mat(0xc0c6cc, { rough: 0.3, metal: 0.8 }); crossMark.visible = false; }
        if (step.id === "walk-load") { pot.position.set(-1.6, 0.08, 1.5); liftBag.position.set(-1.6, 0.9, 1.5); shackle.position.set(-1.6, 0.42, 1.5); }
        if (step.id === "read-tag") repaint(tag, paperFace("TAG", ["read up ✓"], { bg: "#e6f6ea", band: "#59c97b" }));
        if (step.id === "bag-net") { recBag.visible = false; bagUp.visible = true; }
        if (step.id === "net-up") bagUp.position.set(-2.1, 1.0, 1.9);
        if (step.id === "read-up") repaint(slate, paperFace("SLATE — READ UP", ["Net recovered · bagged", "Pot and tag · catch released", "Groundline left for next dive"], { bg: "#e6f6ea", band: "#59c97b" }));
      },
      onHazard() {},
      onInterrupt(it) {
        if (it.id === "net-on-umbilical") netPanel.position.set(0.2, 0.9, 1.0);
        if (it.id === "bag-runaway") { liftBag.position.y += 0.6; pot.position.y += 0.35; }
      },
      onInterruptEnd(it) {
        if (it.id === "net-on-umbilical" && it.resolved === "answered") { netPanel.position.set(netPanelHome.x, netPanelHome.y, netPanelHome.z); umbSlack.visible = false; umbTaut.visible = true; }
        if (it.id === "bag-runaway" && it.resolved === "answered") { liftBag.position.y -= 0.6; pot.position.y -= 0.35; bagBody.scale.set(1, 0.6, 1); }
      },
      animate(t, dt, session) {
        const step = session?.step;
        if (session?.turn && step?.id === "free-catch") door.rotation.y = -session.turn.amount * 1.3;
        const gg = session?.gauge;
        if (gg && !gg.committed && step?.id === "fill-lift-bag") bagBody.scale.set(1, 0.4 + gg.t * 0.7, 1);
        if (netMain.visible) netMain.rotation.x = Math.sin(t * 0.8) * 0.12;
        netPanel.rotation.x = Math.sin(t * 1.1) * 0.15;
        if (step?.id === "walk-load" && session.holding) walk.position.x = -(session.track?.inBand ?? 0) * 0.1;
        school.position.x = 0.4 + Math.sin(t * 0.3) * 0.3;
        void CITY; void doorPanel; void dt;
      },
    };
  },
};
