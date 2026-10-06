import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import { box, cyl, ball, torus, hose, group, decal, repaint, paperFace, mat } from "../../../shared/kit.js";
import {
  CITY, stationPad, holoTag, standingFigure, valveWheel, reg,
  surfaceTexture, texturedMat, deckPlateFace, waterFace,
} from "../citykit.js";
import { workboat } from "../../../shared/fleet.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Dive Tender & Umbilical Management VR — SF Bay Restoration &
// Cleanup, maritime and underwater, pack A (underwater work and dive safety).
//
// The side deck of a dive support workboat on the Bay, where the tender works:
// the diver dressing at the ladder with the harness, the helmet and its neck
// clamp, the umbilical flaked on deck and led over the chafe roller at the
// tending point, its paid-out marks, the dive ladder, the supervisor at the
// panel, the standby diver on the bench with their helmet, the wash-down hose
// for the decon, the flake box, and the crew boat (the fleet kit's workboat)
// lying off the stern with its outboards. The learner is the tender, a Pile
// Drivers Local 34 diver-tender, keeping the diver's umbilical for the whole
// dive. Every figure on deck wears a PFD. Depth, gas, bottom time and the
// working radius are never written as numbers: they are per the dive plan.

const BRTU_ACCENT = 0x5fc8e8;
const BRTU_CSS = "#5fc8e8";

export const SIM_BR_DIVE_TENDER_AND_UMBILICAL_MANAGEMENT = {
  id: "br-dive-tender-and-umbilical-management",
  index: "324",
  domain: "Maritime & Ports",
  trade: "Pile Drivers Local 34 diver-tender keeping a surface-supplied diver's umbilical on a Bay restoration dive, with the dive supervisor, the diver and the standby diver",
  category: "Maritime & Ports",
  district: "Maritime & Ports",
  weather: "overcast",
  certification: "Pile Drivers Local 34 commercial diver training under the UBC International Training Fund; OSHA 29 CFR 1910 Subpart T commercial diving operations — 29 CFR 1910.425 surface-supplied air diving (each diver continuously tended, the standby diver), 29 CFR 1910.422 procedures during the dive and 29 CFR 1910.423 post-dive procedures (the diver's condition); ADCI International Consensus Standards for Commercial Diving and Underwater Operations; USCG 46 CFR 197 Subpart B where the dive is worked from a vessel; the employer's safe practices manual for line-pull signals; depth, gas, bottom time and working radius per the dive plan",
  name: "Dive Tender & Umbilical Management",
  title: simTitle("Dive Tender & Umbilical Management"),
  tagline: "The diver's line for the whole dive: the tender brief taken, the harness strap and the strain relief found, the neck clamp latched and pinned, the umbilical led over the roller, paid out steady while a bight drifts toward the crew boat's outboards, the times called, the diver felt working while the standby is ordered dressed, the marks read against the plan, the wash-down opened, the chafe and the kink found, the diver helped out and watched, the umbilical flaked and the log written — every step in a PFD",
  accent: BRTU_ACCENT,
  accentCss: BRTU_CSS,
  parSeconds: 300,
  footprint: 2.6,
  badge: { id: "never-untended", name: "Never Untended", note: "The diver's umbilical in the tender's hands from the ladder to the flake box, never wrapped, tied off or stood in, and never a slack bight near a propeller" },

  supportLine: "your union hall's member assistance programme — Pile Drivers Local 34 — with the employer's employee assistance line behind it",

  game: system({
    name: "Tending",
    currency: "FATHOM LINE",
    ranks: ["Deckhand", "Tender", "Diver-Tender", "Lead Tender", "Tending Certified"],
    badges: [
      { id: "dressed-right", name: "Dressed Right", note: "The harness and the strain relief found before the helmet went on", test: AWARD.stepClean("dress-check") },
      { id: "marks-read", name: "Marks Read", note: "The paid-out marks committed inside the band first time", test: AWARD.precise(0.7) },
      { id: "line-in-hand", name: "Line In Hand", note: "Never wrapped round a hand, never stood in a bight, never tied off, never on the rail", test: AWARD.safe },
    ],
    challenges: [
      { id: "clean-tend", name: "Clean Tend", note: "No corrections from the brief to the check-in", test: AWARD.clean },
      { id: "steady-payout", name: "Steady Pay-out", note: "The umbilical paid out in band the whole descent", test: AWARD.unbroken },
      { id: "tended-in-time", name: "Tended In Time", note: "Log written inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "wrap-hand": "You went to take a wrap of the umbilical round your hand for a better grip. If the diver slips off the ladder, the current snatches the umbilical or the boat surges, a wrap cinches tight and takes the hand — and the tender — over the rail after it. The umbilical is held in open hands, hand over hand, so it can always be let run or taken in without it taking you.",
    "stand-in-bight": "You stepped into the middle of the umbilical's coil on deck. A bight that pays out under your feet takes your ankle with it, and a tender dragged across the deck toward the rail is a tender who has let go of the diver. You stand outside the flake, feed it from the side, and keep your feet out of every loop.",
    "tie-off-umbilical": "You went to tie the umbilical off to the rail to rest your hands. A tied-off umbilical cannot be paid out when the diver needs slack or taken in when they need hauling, and it turns a surge of the boat into a snatch on the diver's helmet. 29 CFR 1910.425 wants a surface-supplied diver continuously tended, and a line on a cleat is not tended by anyone.",
    "sit-on-rail": "You went to sit on the rail to tend the umbilical over the side. A tender sitting on the rail is one surge, one snatch or one lean away from going over, into cold, moving water with a current running — and the diver below loses their tender at the same moment. You tend standing on the deck, PFD on, braced behind the chafe roller.",
  },

  lateNotes: {
    "payout-hands": "The umbilical is paid out once it is led over the roller and the diver is on the ladder.",
    "paid-out-marks": "The marks are read once the diver is working on the bottom.",
    "tender-log": "The log is written once the diver is out and the umbilical is flaked.",
  },

  steps: [
    {
      id: "tender-brief", kind: "select", target: "tender-brief",
      title: "Take the tender brief from the supervisor",
      cue: "At the panel, in your PFD: the diver's task and working area per the dive plan, the umbilical's path from the ladder, the line-pull signals from the employer's safe practices manual, and what you do if the comms go.",
      why: "The tender is the diver's other end of the umbilical: their slack, their haul, their line-pull signals and the person who feels what the diver is doing. To do that the tender has to know where the diver will be working and how far away, what path the umbilical will take past the ladder and the piles, and the signals the employer's safe practices manual sets, because when the comms fail those signals are the only language left.",
    },
    {
      id: "dress-check", kind: "find", noHint: true,
      targets: ["crotch-strap", "strain-relief"],
      itemNames: { "crotch-strap": "diver's harness crotch strap left unbuckled", "strain-relief": "umbilical's strain relief not clipped to the harness ring" },
      itemNotes: {
        "crotch-strap": "The harness's crotch strap is hanging loose. Without it, a haul on the harness rides the whole harness up round the diver's chest and arms instead of lifting them by the hips.",
        "strain-relief": "The umbilical's strain relief snap is hanging free instead of clipped to the harness's ring, so any pull on the umbilical would go straight to the helmet's fittings.",
      },
      title: "Check the diver's harness and strain relief before the helmet",
      cue: "Walk round the diver on the ladder platform: every harness strap buckled, the bailout secured, the umbilical's strain relief clipped to the harness ring.",
      why: "When a diver has to be hauled — up the ladder, out of a foul, unconscious — it is the harness that takes their weight and the strain relief that makes a pull on the umbilical a pull on the harness rather than on the helmet's gas fitting. Both are checked by the tender before the helmet goes on, because once it is on the diver cannot see their own harness and nobody else will look again.",
    },
    {
      id: "helmet-on", kind: "sequence",
      targets: ["neck-clamp", "clamp-pin"],
      itemNames: { "neck-clamp": "helmet's neck clamp closed on the neck dam", "clamp-pin": "neck clamp's locking pin in and checked" },
      title: "Latch the helmet's neck clamp, then pin it",
      cue: "With the diver's helmet seated on the neck dam, close the neck clamp, then push its locking pin home and tug it to check.",
      why: "The neck clamp is what holds the helmet onto the diver, and the locking pin is what stops the clamp opening if it is knocked against the ladder or a pile. The clamp is closed first and then pinned, and the pin is tugged, because a clamp that looks closed with no pin in it is a helmet that can come off at depth — the one piece of equipment failure a diver cannot bail out of.",
      outOfOrderNote: "Out of order — close the neck clamp first; the pin goes in to lock a clamp that is already shut.",
    },
    {
      id: "lead-umbilical", kind: "drag", target: "umbilical-lead",
      title: "Lead the umbilical over the chafe roller at the tending point",
      cue: "Take the umbilical from the flake and lead it over the chafe roller at the tending point, clear of the ladder's edges and the rail's corners.",
      why: "Every time the diver moves, the umbilical saws back and forth over whatever it crosses at the side, and a sharp rail corner or ladder edge cuts through its jacket in a morning. The chafe roller is where it is meant to cross, turning as the line moves, and leading it there before the diver leaves the ladder keeps the tender's hands and the umbilical in one place for the whole dive.",
      drag: { to: "chafe-roller", radius: 0.5, missNote: "Not on the roller — lead the umbilical over the chafe roller at the tending point, clear of the edges." },
    },
    {
      id: "pay-out", kind: "track", target: "payout-hands", seconds: 6,
      title: "Pay the umbilical out steadily as the diver descends",
      cue: "Feed the umbilical out hand over hand as the diver goes down the downline, matching their descent — no slack loops in the water, no strain on the diver.",
      why: "Too little slack holds the diver back against their own descent; too much drops loops into the water that the current carries off toward the boat's stern, the piles and the other vessel's propeller. The tender feeds it at the diver's pace, feeling for them through the line, so the umbilical goes down in a clean run beside the downline and the diver never has to fight it.",
      track: { start: 0.14, green: [0.42, 0.6], rise: 0.56, fall: 0.46, drift: 0.12, label: "PAY-OUT", readout: (v) => (v < 0.42 ? "holding the diver back" : v > 0.6 ? "slack piling in the water" : "in step with the diver") },
      holdBreakNote: "The pay-out went out of band — holding the diver back, or piling slack in the water. Get back in step with the diver's descent.",
    },
    {
      id: "call-times", kind: "select", target: "time-slate",
      title: "Call out and write the diver's times",
      cue: "Call 'left surface' and 'on the bottom' to the supervisor as they happen and write both times on the tender's slate.",
      why: "The dive is timed from the moment the diver leaves the surface, and the tables the supervisor holds are read against that time, so the tender calls it out as it happens and writes it down. Two people noting the same times is the check that catches a missed stopwatch, and the tender's slate is still there if the panel's clock is the thing that fails.",
    },
    {
      id: "feel-diver", kind: "hold", target: "feel-line", seconds: 5,
      title: "Keep a hand on the umbilical and feel the diver working",
      cue: "Hold the umbilical lightly at the roller and feel the diver moving and working through it — steady tugs as they work, slack as they move toward you.",
      why: "The tender's hand on the umbilical is how the surface feels what the comms cannot tell it: a diver moving away, a diver stopped, a snag, a steady rhythm of work. A tender who keeps that contact knows before anyone else when something changes, and is already holding the line when the diver calls for slack or a haul — a tender who puts it down finds out last.",
      holdBreakNote: "You let go of the umbilical — the diver's end went unfelt. Put your hand back on the line at the roller.",
    },
    {
      id: "read-marks", kind: "gauge", target: "paid-out-marks",
      title: "Read the paid-out marks against the dive plan",
      cue: "Read the umbilical's marks at the roller and commit when what is paid out matches the diver's working area in the dive plan, with just enough slack.",
      why: "The umbilical is marked along its length so the tender knows how much is out, and the dive plan says how far from the downline the diver will work. Too little out and the diver is held short of the job; far too much and a belly of slack is lying on the bottom where the diver can foul it round the debris. Reading the marks against the plan is how the tender keeps the slack honest.",
      gauge: { label: "PAID OUT vs PLAN", speed: 0.68, green: [0.42, 0.6], readout: (t) => (t < 0.42 ? "short — diver held back" : t <= 0.6 ? "matches the working area" : "too much out — slack on the bottom"), missNote: "Outside the band — read the mark at the roller and match it to the working area the dive plan gives." },
    },
    {
      id: "open-washdown", kind: "turn", target: "washdown-valve",
      title: "Open the wash-down as the diver comes up",
      cue: "As the supervisor calls the diver up, open the fresh-water wash-down valve for the decon at the ladder.",
      why: "The water at a restoration site carries whatever the site is being restored from, and it comes aboard on the diver's suit, helmet and umbilical. The wash-down is running before the diver reaches the ladder so the decon starts on the top rung, before the helmet comes off and before anyone's bare hands touch the suit — and the umbilical is rinsed as it is taken in.",
      turn: { turns: 1.0, label: "WASH-DOWN", readout: (t) => (t < 0.3 ? "shut" : t < 0.9 ? "opening" : "running at the ladder") },
    },
    {
      id: "inspect-inbound", kind: "find", noHint: true,
      targets: ["chafe-mark", "hockle"],
      itemNames: { "chafe-mark": "chafed jacket on the umbilical where it crossed a pile edge", "hockle": "a twist forming a hockle in the coil as it comes in" },
      itemNotes: {
        "chafe-mark": "A section of the umbilical's outer jacket is scuffed through to the braid where it lay across a pile edge on the bottom. A jacket worn through lets the gas hose and the comms cable underneath take the wear next.",
        "hockle": "A twist in the umbilical is closing into a hockle as it comes in. Pulled tight, a hockle kinks the gas hose inside it.",
      },
      title: "Look at the umbilical as it comes in",
      cue: "Take the umbilical in hand over hand as the diver ascends, looking and feeling along it for chafe, cuts, twists and anything that has picked up on the bottom.",
      why: "The tender is the only person who handles every metre of the umbilical after every dive, so the tender is the one who finds the damage: a jacket chafed through on a pile edge, a twist that is turning into a hockle, a fitting that has taken a knock. It is found as it comes in because that is when it is passing through the tender's hands anyway, and marked so it is fixed before the next diver breathes through it.",
    },
    {
      id: "diver-out", kind: "select", target: "diver-assist",
      title: "Help the diver out and watch their condition",
      cue: "Help the diver up the ladder and through the wash-down, take the helmet off when the supervisor says, and watch them — how they move, how they talk, what they say about how they feel.",
      why: "29 CFR 1910.423 has the diver's physical condition checked after the dive, and the tender is the first person to see it: a diver who is slow on the ladder, confused, or rubbing a joint may be showing the start of something the supervisor needs to know about at once. The tender also reminds the diver to report anything that appears later, because symptoms do not always show on the deck.",
    },
    {
      id: "flake-umbilical", kind: "drag", target: "umbilical-coil",
      title: "Flake the umbilical into the flake box",
      cue: "Flake the rinsed umbilical down into the flake box in figure-eights, the chafed section tagged and on top.",
      why: "An umbilical flaked in figure-eights pays out cleanly on the next dive without twisting; one coiled round and round builds a twist that becomes the next hockle. The chafed section is tagged and left on top of the flake so it is the first thing the supervisor and the next tender see, and nobody puts that umbilical on a diver before it is repaired or retired.",
      drag: { to: "flake-box", radius: 0.5, missNote: "Not in the flake box — flake the umbilical down in figure-eights into the box." },
    },
    {
      id: "tender-log", kind: "select", target: "tender-log",
      title: "Log the umbilical's condition and the dive's events",
      cue: "Write the equipment log: the umbilical's chafe and the hockle, the diver's times, the bight near the crew boat and the standby dressed for the foul.",
      why: "The umbilical's history lives in the equipment log: where it has chafed, when it was repaired and how many dives it has done, and the tender who found the damage is the one who writes it down. The events of the dive go beside it — the bight near the outboards, the foul below — because the supervisor's dive record and the next job's plan are both built from what the tender saw at the rail.",
    },
    {
      id: "crew-checkin", kind: "select", target: "team-board",
      title: "Check in with the team",
      cue: "At the team board: the diver's condition and who is watching them, the umbilical tagged out, the foul and the outboards, and how everyone is.",
      why: "The check-in closes the dive for the whole team: who is watching the diver for symptoms, which umbilical is out of service, what happened at the stern and on the bottom. A foul that brought the standby to dress and a bight drifting toward a propeller are moments a tender carries home; the Pile Drivers Local 34 member assistance line is there for what the deck conversation does not settle.",
    },
  ],

  interrupts: [
    {
      id: "bight-to-outboards",
      kind: "Umbilical bight drifting toward a propeller",
      after: "pay-out", delay: 2, seconds: 14,
      alert: "A slack bight of the umbilical has drifted aft on the current — and the crew boat off the stern has just started its outboards to come alongside.",
      cue: "Hail the crew boat's skipper on the handheld to shut the outboards down, then take the bight in.",
      target: "crew-boat-radio",
      why: "A turning propeller and a diver's umbilical must never meet: the propeller cuts the gas and comms and can drag the diver up into it. The engines have to stop before the bight can be taken in, because pulling a bight away from a propeller that is already turning can pull it into the blades — so the skipper is told first, on the radio, and the slack is recovered once the outboards are silent.",
      missNote: "The crew boat came in with its outboards turning while the bight hung in the water off the stern; the umbilical was pulled clear at the last moment by the deckhand, with a gouge in its jacket from the skeg.",
      wrongNote: "The handheld to the crew boat — stop the outboards before you do anything else with that bight.",
    },
    {
      id: "standby-ordered",
      kind: "Diver fouled — standby ordered dressed",
      after: "feel-diver", delay: 2, seconds: 14,
      alert: "The diver reports their umbilical fouled round debris on the bottom and cannot clear it — the supervisor orders the standby dressed and ready.",
      cue: "Hand the standby diver their helmet and latch and pin it for them, keeping your own diver's line in your other hand.",
      target: "standby-helmet",
      why: "29 CFR 1910.425 keeps a standby diver at the station for exactly this, and the standby goes in only as fast as they can be dressed. The tender helps: helmet on, clamp latched and pinned, while keeping a hand on their own diver's umbilical so the fouled diver is never untended. The standby then follows the fouled diver's umbilical down to them.",
      missNote: "The standby dressed alone, fumbling the neck clamp while the supervisor waited on the comms with a fouled diver; the tender's attention had gone to the panel and the diver's line lay slack.",
      wrongNote: "The standby's helmet — help them dress while your other hand stays on your diver's line.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.6, BRTU_ACCENT);

    // ------------------------------------------------------- water, deck, rail
    const water = box(g, 8.4, 0.02, 8.0, 0, 0.012, -1.0, 0xffffff, { rough: 0.15, metal: 0.4, cast: false });
    water.material = texturedMat(surfaceTexture((cx, w, h) => waterFace(cx, w, h, { base: "#0c2a31", mid: "#11343c" }), { repeat: 3, px: 512 }), { rough: 0.15, metal: 0.4, color: 0x86acb6 });
    const deck = box(g, 6.2, 0.14, 3.8, 0, 0.4, 0.2, 0xffffff, { rough: 0.8 });
    deck.material = texturedMat(surfaceTexture((cx, w, h) => deckPlateFace(cx, w, h, { base: "#3d444a", base2: "#33393f", step: 23 }), { repeat: 4, px: 512 }), { rough: 0.8, metal: 0.35, color: 0xc6ccd2 });
    box(g, 6.2, 0.4, 3.8, 0, 0.16, 0.2, 0xe5e8eb, { rough: 0.5, metal: 0.3, cast: false });
    box(g, 6.2, 0.1, 0.08, 0, 0.52, -1.66, CITY.hiVis, { rough: 0.6 });
    box(g, 6.0, 0.04, 0.04, 0, 1.45, -1.62, 0xc8ced4, { rough: 0.35, metal: 0.5 });
    for (const x of [-2.9, -1.6, 1.6, 2.9]) cyl(g, 0.022, 0.022, 1.0, x, 0.97, -1.62, 0xc8ced4, { rough: 0.35, metal: 0.5, seg: 8 });
    const sitHit = box(g, 0.5, 0.3, 0.3, 1.9, 1.45, -1.5, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "sit on the rail to tend?", 1.9, 1.75, -1.45, { css: "#d2312b", w: 0.44 });
    reg(hits, sitHit, "sit-on-rail");

    // ------------------------------------------------------- ladder, roller, diver
    const ladder = group(g, -0.6, 0.47, -1.7);
    for (const x of [-0.22, 0.22]) box(ladder, 0.04, 1.8, 0.04, x, -0.1, 0, 0xc8ced4, { rough: 0.35, metal: 0.55 });
    for (let i = 0; i < 6; i++) box(ladder, 0.44, 0.03, 0.04, 0, -0.8 + i * 0.3, 0, 0xc8ced4, { rough: 0.35, metal: 0.55 });
    holoTag(ladder, "dive ladder", 0, 0.95, 0.05, { css: BRTU_CSS, w: 0.22 });
    const roller = group(g, 0.3, 1.47, -1.6);
    const rollerBody = cyl(roller, 0.07, 0.07, 0.4, 0, 0, 0, 0x2b3138, { rough: 0.5, metal: 0.4, seg: 14 });
    rollerBody.rotation.z = Math.PI / 2;
    for (const x of [-0.22, 0.22]) box(roller, 0.03, 0.2, 0.1, x, 0, 0, 0x5b6771, { rough: 0.5, metal: 0.6 });
    const rollerRing = torus(roller, 0.18, 0.01, 0, 0.02, 0.1, BRTU_ACCENT, { emissive: BRTU_ACCENT, ei: 1.6, rough: 0.4, cast: false, seg: 6, seg2: 22 });
    rollerRing.rotation.x = Math.PI / 2;
    holoTag(roller, "chafe roller — tending point", 0, 0.26, 0, { css: BRTU_CSS, w: 0.5 });
    reg(hits, roller, "chafe-roller");
    const feel = group(g, 0.3, 1.25, -1.25);
    const feelRing = torus(feel, 0.1, 0.008, 0, 0, 0, BRTU_ACCENT, { emissive: BRTU_ACCENT, ei: 1.4, rough: 0.4, cast: false, seg: 6, seg2: 18 });
    void feelRing;
    holoTag(feel, "hand on the line — feel", 0, 0.14, 0, { css: BRTU_CSS, w: 0.42 });
    reg(hits, feel, "feel-line");
    const payout = group(g, -0.1, 1.05, -1.2);
    for (let i = 0; i < 3; i++) { const chev = box(payout, 0.1, 0.012, 0.03, 0, -i * 0.06, -i * 0.1, BRTU_ACCENT, { emissive: BRTU_ACCENT, ei: 1.4, rough: 0.4, cast: false }); chev.rotation.x = 0.4; }
    holoTag(payout, "pay out hand over hand", 0, 0.14, 0, { css: BRTU_CSS, w: 0.42 });
    reg(hits, payout, "payout-hands");
    const marks = group(g, 0.75, 1.47, -1.55);
    for (let i = 0; i < 5; i++) box(marks, 0.05, 0.02, 0.05, -0.2 + i * 0.1, 0, 0, i % 2 ? 0x1b1e22 : 0xf2c14b, { rough: 0.6 });
    const markPointer = box(marks, 0.012, 0.06, 0.012, 0, 0.05, 0, 0xd2312b, { rough: 0.4 });
    holoTag(marks, "paid-out marks", 0, 0.16, 0, { css: BRTU_CSS, w: 0.3 });
    reg(hits, marks, "paid-out-marks");
    // The diver on the ladder platform: harness, helmet, neck clamp.
    const diver = group(g, -0.6, 0.47, -1.25);
    const diverFig = standingFigure(diver, 0, 0, { atStation: true, ry: Math.PI, cloth: 0x1b1e22, trousers: 0x1b1e22, gloves: 0x2b2b2b });
    void diverFig;
    const helmet = ball(diver, 0.2, 0, 1.63, 0, 0xf2c14b, { rough: 0.35, metal: 0.4, seg: 16, seg2: 12 });
    void helmet;
    cyl(diver, 0.08, 0.08, 0.45, 0, 1.15, 0.2, 0xc8ccd0, { rough: 0.4, metal: 0.6, seg: 12 });
    const clamp = group(diver, 0, 1.42, 0);
    const clampRing = torus(clamp, 0.17, 0.02, 0, 0, 0, 0x8a949d, { rough: 0.3, metal: 0.8, seg: 6, seg2: 20 });
    clampRing.rotation.x = Math.PI / 2;
    holoTag(clamp, "neck clamp", -0.3, 0.1, 0, { css: BRTU_CSS, w: 0.22 });
    reg(hits, clamp, "neck-clamp");
    const pin = group(diver, 0.19, 1.42, 0.05);
    const pinBody = box(pin, 0.06, 0.012, 0.012, 0, 0, 0, 0xd2312b, { rough: 0.5 });
    holoTag(pin, "clamp pin", 0.15, 0.08, 0, { css: BRTU_CSS, w: 0.2 });
    reg(hits, pin, "clamp-pin");
    const strap = box(diver, 0.06, 0.3, 0.02, 0.05, 0.75, -0.14, 0xe8b02e, { rough: 0.7 });
    strap.rotation.z = 0.5;
    reg(hits, strap, "crotch-strap");
    const relief = box(diver, 0.04, 0.06, 0.03, -0.18, 1.05, -0.16, 0xc0c6cc, { rough: 0.3, metal: 0.8, emissive: 0x3a0808, ei: 0.3 });
    reg(hits, relief, "strain-relief");
    holoTag(diver, "diver — dressing", 0, 2.0, 0, { css: BRTU_CSS, w: 0.3 });
    const diverHome = diver.position.y;

    // ------------------------------------------------------- umbilical: flake, lead, coil
    const flake = group(g, 0.55, 0.48, -0.45);
    for (let i = 0; i < 3; i++) for (const sx of [-0.2, 0.2]) torus(flake, 0.2, 0.025, sx, 0.02 + i * 0.05, 0, 0xf2c14b, { rough: 0.8, seg: 6, seg2: 20 }).rotation.x = Math.PI / 2;
    const bightHit = box(flake, 0.8, 0.4, 0.5, 0, 0.2, 0, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(flake, "stand in the coil?", 0, 0.5, 0.2, { css: "#d2312b", w: 0.36 });
    reg(hits, bightHit, "stand-in-bight");
    const lead = group(g, 0.2, 0.6, -0.9);
    hose(lead, [[0.35, -0.08, 0.45], [0.2, 0.1, 0.2], [0, 0.2, 0]], 0.025, 0xf2c14b, { steps: 8, rough: 0.8 });
    holoTag(lead, "umbilical from the flake", 0, 0.32, 0, { css: BRTU_CSS, w: 0.42 });
    reg(hits, lead, "umbilical-lead");
    const overSide = hose(g, [[0.3, 1.5, -1.6], [0.1, 1.0, -1.9], [-0.3, 0.2, -2.2], [-0.6, -0.1, -2.4]], 0.025, 0xf2c14b, { steps: 12, rough: 0.8 });
    overSide.visible = false;
    const bight = hose(g, [[-0.6, 0.02, -2.4], [0.4, 0.02, -2.9], [1.4, 0.02, -3.3], [2.2, 0.02, -3.2]], 0.025, 0xf2c14b, { steps: 12, rough: 0.8 });
    bight.visible = false;
    const coil = group(g, 0.3, 1.2, -1.2);
    box(coil, 0.16, 0.16, 0.16, 0, 0, 0, 0xf2c14b, { rough: 0.8, opacity: 0.5, transparent: true, cast: false });
    holoTag(coil, "rinsed umbilical — flake it", 0, 0.16, 0, { css: BRTU_CSS, w: 0.46 });
    reg(hits, coil, "umbilical-coil");
    coil.visible = false;
    const chafe = box(g, 0.14, 0.06, 0.06, 0.62, 1.47, -1.35, 0x8a6a2a, { rough: 1, emissive: 0x3a2a0a, ei: 0.4 });
    reg(hits, chafe, "chafe-mark");
    chafe.visible = false;
    const hockle = torus(g, 0.05, 0.02, 0.9, 1.3, -1.2, 0xe8b02e, { rough: 0.8, emissive: 0x3a2a0a, ei: 0.3, seg: 6, seg2: 12 });
    reg(hits, hockle, "hockle");
    hockle.visible = false;
    const flakeBox = group(g, 1.6, 0.47, 0.2);
    box(flakeBox, 0.9, 0.06, 0.7, 0, 0.03, 0, 0x5b4a3a, { rough: 0.85 });
    for (const [x, z, w, d] of [[0, -0.33, 0.9, 0.04], [0, 0.33, 0.9, 0.04], [-0.43, 0, 0.04, 0.7], [0.43, 0, 0.04, 0.7]]) box(flakeBox, w, 0.28, d, x, 0.14, z, 0x5b4a3a, { rough: 0.85 });
    const boxRing = torus(flakeBox, 0.25, 0.01, 0, 0.3, 0, BRTU_ACCENT, { emissive: BRTU_ACCENT, ei: 1.6, rough: 0.4, cast: false, seg: 6, seg2: 22 });
    boxRing.rotation.x = Math.PI / 2;
    holoTag(flakeBox, "flake box", 0, 0.6, 0, { css: BRTU_CSS, w: 0.2 });
    reg(hits, flakeBox, "flake-box");
    const flaked = group(flakeBox, 0, 0.1, 0);
    for (let i = 0; i < 2; i++) for (const sx of [-0.18, 0.18]) torus(flaked, 0.16, 0.022, sx, i * 0.05, 0, 0xf2c14b, { rough: 0.8, seg: 6, seg2: 18 }).rotation.x = Math.PI / 2;
    flaked.visible = false;
    const wrapHit = box(g, 0.3, 0.3, 0.3, -0.3, 1.15, -0.95, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "wrap it round your hand?", -0.3, 1.4, -0.95, { css: "#d2312b", w: 0.44 });
    reg(hits, wrapHit, "wrap-hand");
    const cleat = group(g, -1.5, 0.47, -1.45);
    box(cleat, 0.3, 0.05, 0.08, 0, 0.06, 0, 0x2b3138, { rough: 0.6, metal: 0.5 });
    const cleatHit = box(cleat, 0.45, 0.3, 0.35, 0, 0.14, 0, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(cleat, "tie it off to rest?", 0, 0.4, 0, { css: "#d2312b", w: 0.36 });
    reg(hits, cleatHit, "tie-off-umbilical");

    // ------------------------------------------------------- panel, slate, washdown, radios
    const panel = group(g, -2.1, 0.47, -0.8);
    box(panel, 0.9, 0.8, 0.45, 0, 0.4, 0, 0x2b3138, { rough: 0.6, metal: 0.4 });
    const pFace = box(panel, 0.8, 0.5, 0.05, 0, 1.05, -0.1, 0x3a4148, { rough: 0.5, metal: 0.5 });
    pFace.rotation.x = -0.3;
    for (const x of [-0.2, 0.15]) { const d = cyl(panel, 0.07, 0.07, 0.03, x, 1.1, 0, 0xf1f3f4, { rough: 0.4, seg: 18 }); d.rotation.x = Math.PI / 2; }
    const briefSheet = decal(panel, 0.34, 0.24, 0, 0.83, 0.23, paperFace("TENDER BRIEF", ["Task and area: per the plan", "Signals: the manual's", "Lost comms: line pulls"], { bg: "#eef6f8", band: "#2b7a98" }), { px: 160 });
    holoTag(panel, "dive panel · tender brief", 0, 1.45, 0, { css: BRTU_CSS, w: 0.44 });
    reg(hits, briefSheet, "tender-brief");
    const slate = decal(g, 0.24, 0.18, -1.05, 1.05, -0.95, paperFace("TIMES", ["Left surface ____", "On bottom ____", "Left bottom ____"], { bg: "#f3efe4", band: BRTU_CSS }), { px: 128 });
    slate.rotation.y = 0.4;
    holoTag(g, "tender's slate", -1.05, 1.22, -0.95, { css: BRTU_CSS, w: 0.26 });
    reg(hits, slate, "time-slate");
    const wash = group(g, -1.2, 0.47, -1.35);
    const washWheel = valveWheel(wash, 0, 0.1, 0, { r: 0.06, color: 0x2f8f5a, body: 0x2f4f6f });
    washWheel.scale.set(0.7, 0.7, 0.7);
    hose(wash, [[0, 0.2, 0], [0.2, 0.5, -0.1], [0.5, 0.9, -0.2]], 0.018, 0x2f8f5a, { steps: 8, rough: 0.7 });
    const spray = group(g, -0.6, 1.3, -1.6);
    for (let i = 0; i < 4; i++) ball(spray, 0.04, 0, -i * 0.12, 0.02 * i, 0xdff4f6, { rough: 0.1, opacity: 0.6, transparent: true, cast: false, seg: 8, seg2: 6 });
    spray.visible = false;
    holoTag(wash, "wash-down valve", 0, 0.45, 0, { css: BRTU_CSS, w: 0.3 });
    reg(hits, wash, "washdown-valve");
    const handheld = group(g, 2.3, 0.93, -1.0);
    box(handheld, 0.26, 0.08, 0.18, 0, -0.04, 0, 0x2f4f6f, { rough: 0.7 });
    box(handheld, 0.06, 0.16, 0.04, 0, 0.08, 0, 0x1b1d20, { rough: 0.7 });
    cyl(g, 0.03, 0.03, 0.46, 2.3, 0.69, -1.0, 0x5b6771, { rough: 0.5, metal: 0.6, seg: 8 });
    holoTag(handheld, "handheld to the crew boat", 0, 0.3, 0, { css: BRTU_CSS, w: 0.46 });
    reg(hits, handheld, "crew-boat-radio");
    const assist = holoTag(g, "help the diver out — watch them", -0.6, 1.95, -1.55, { css: BRTU_CSS, w: 0.56 });
    reg(hits, assist, "diver-assist");

    // ------------------------------------------------------- standby, supervisor, log, team board
    const bench = group(g, 2.4, 0.47, 1.2, -0.4);
    box(bench, 1.0, 0.4, 0.4, 0, 0.2, 0, 0x5b4a3a, { rough: 0.8 });
    const standby = standingFigure(g, 1.6, 1.55, { ry: -2.8, cloth: 0x1b1e22, trousers: 0x1b1e22, vest: 0xf06a2b, gloves: 0x2b2b2b });
    standby.position.y = 0.47;
    holoTag(standby, "standby diver", 0, 2.05, 0, { css: BRTU_CSS, w: 0.28 });
    const sbHelmet = group(g, 2.15, 0.9, 1.25);
    ball(sbHelmet, 0.18, 0, 0, 0, 0xd8dde2, { rough: 0.35, metal: 0.4, seg: 14, seg2: 10 });
    holoTag(sbHelmet, "standby's helmet", 0, 0.3, 0, { css: BRTU_CSS, w: 0.3 });
    reg(hits, sbHelmet, "standby-helmet");
    const supervisor = standingFigure(g, -2.1, 0.05, { ry: 3.0, cloth: 0x2b3138, vest: 0xf06a2b, cap: 0x1f3a52 });
    supervisor.position.y = 0.47;
    holoTag(supervisor, "supervisor", 0, 1.95, 0, { css: BRTU_CSS, w: 0.22 });
    const table = group(g, -0.9, 0.47, 1.8);
    box(table, 0.8, 0.06, 0.5, 0, 0.8, 0, 0x5b4a3a, { rough: 0.8 });
    for (const [lx, lz] of [[-0.35, -0.2], [0.35, -0.2], [-0.35, 0.2], [0.35, 0.2]]) cyl(table, 0.022, 0.022, 0.8, lx, 0.4, lz, 0x3a4148, { rough: 0.6, metal: 0.4, seg: 6 });
    const log = decal(table, 0.34, 0.24, 0, 0.84, 0, paperFace("EQUIPMENT LOG", ["Umbilical: ____", "Times: ____", "Events: ____"], { bg: "#f3efe4", band: BRTU_CSS }), { px: 160 });
    log.rotation.x = -Math.PI / 2;
    holoTag(table, "equipment log", 0, 1.1, 0, { css: BRTU_CSS, w: 0.26 });
    reg(hits, log, "tender-log");
    const team = decal(g, 0.6, 0.4, 0.6, 1.35, 2.05, (cx, w, h) => {
      cx.fillStyle = "#101c27"; cx.fillRect(0, 0, w, h); cx.fillStyle = "#59c97b"; cx.fillRect(0, 0, w, 6);
      cx.font = `600 ${Math.round(h * 0.15)}px 'Barlow Condensed', Arial, sans-serif`; cx.textAlign = "left"; cx.textBaseline = "middle";
      cx.fillStyle = "#e6f6ea"; cx.fillText("DIVE TEAM", w * 0.06, h * 0.22);
      cx.font = `${Math.round(h * 0.11)}px Arial, sans-serif`; cx.fillStyle = "#f4f8fb";
      ["Supervisor · Diver", "Tender · Standby", "PFDs on deck: all"].forEach((l, i) => cx.fillText(l, w * 0.06, h * (0.46 + i * 0.18)));
    }, { px: 256, glow: true, ei: 0.6 });
    team.rotation.y = Math.PI;
    box(g, 0.66, 0.46, 0.04, 0.6, 1.35, 2.08, 0x2b3138, { rough: 0.6 });
    reg(hits, team, "team-board");

    // ------------------------------------------------------- the crew boat off the stern
    const crewBoat = workboat(g, 2.6, -0.45, -4.2, { ry: Math.PI / 2 + 0.3, livery: { colour: 0xd9dde0, fleetName: "BAY WORKS", unitNumber: "WB-4" } });
    const outboards = crewBoat.userData.parts?.outboards;
    const prop = group(g, 1.6, 0.02, -3.6);
    for (let i = 0; i < 3; i++) torus(prop, 0.2 + i * 0.18, 0.01, 0, 0, 0, 0xdfeef2, { rough: 0.3, emissive: 0x9ac0c8, ei: 0.5, cast: false, seg: 6, seg2: 22 }).rotation.x = Math.PI / 2;
    prop.visible = false;

    const waterTex = water.material.map;

    return {
      hits,
      spawnLook: new THREE.Vector3(-0.2, 1.0, -1.0),
      onStep() {},
      onStepComplete(step) {
        if (step.id === "dress-check") { strap.rotation.z = 0; relief.material = mat(0x59c97b, { rough: 0.4 }); }
        if (step.id === "helmet-on") { clampRing.material = mat(0x59c97b, { rough: 0.3, metal: 0.6 }); pinBody.position.x = -0.03; }
        if (step.id === "lead-umbilical") { overSide.visible = true; rollerRing.material = mat(0x59c97b, { emissive: 0x59c97b, ei: 1.2 }); }
        if (step.id === "pay-out") diver.visible = false;
        if (step.id === "call-times") repaint(slate, paperFace("TIMES", ["Left surface — called", "On bottom — called", "Left bottom ____"], { bg: "#e6f6ea", band: "#59c97b" }));
        if (step.id === "read-marks") markPointer.material = mat(0x59c97b, { rough: 0.4 });
        if (step.id === "open-washdown") { spray.visible = true; chafe.visible = true; hockle.visible = true; }
        if (step.id === "inspect-inbound") { hockle.visible = false; }
        if (step.id === "diver-out") { diver.visible = true; diver.position.y = diverHome; helmet.visible = false; coil.visible = true; }
        if (step.id === "flake-umbilical") { flaked.visible = true; coil.visible = false; overSide.visible = false; }
        if (step.id === "tender-log") repaint(log, paperFace("EQUIPMENT LOG", ["Umbilical: chafe tagged out", "Times: called and written", "Bight · foul · standby"], { bg: "#e6f6ea", band: "#59c97b" }));
      },
      onHazard() {},
      onInterrupt(it) {
        if (it.id === "bight-to-outboards") { bight.visible = true; prop.visible = true; }
        if (it.id === "standby-ordered") sbHelmet.position.set(2.15, 1.1, 1.25);
      },
      onInterruptEnd(it) {
        if (it.id === "bight-to-outboards") { prop.visible = false; if (it.resolved === "answered") { bight.visible = false; if (outboards) outboards.rotation.x = -0.6; } }
        if (it.id === "standby-ordered" && it.resolved === "answered") sbHelmet.position.set(1.6, 2.1, 1.55);
      },
      animate(t, dt, session) {
        const step = session?.step;
        if (waterTex?.offset) { waterTex.offset.x = t * 0.004; waterTex.offset.y = t * 0.005; }
        if (session?.turn && step?.id === "open-washdown") washWheel.userData.wheel.rotation.y = session.turn.amount * Math.PI * 2;
        const gg = session?.gauge;
        if (gg && !gg.committed && step?.id === "read-marks") markPointer.position.x = -0.2 + gg.t * 0.4;
        if (step?.id === "pay-out" && session.holding) { rollerBody.rotation.x += (dt ?? 0.016) * 3 * (session.track?.v ?? 0); diver.position.y = diverHome - Math.min(1.6, (session.track?.inBand ?? 0) * 0.3); }
        if (prop.visible) prop.scale.setScalar(1 + (t * 2) % 1);
        if (spray.visible) spray.position.y = 1.3 - ((t * 0.8) % 0.2);
      },
    };
  },
};
