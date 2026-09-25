import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import { box, cyl, ball, torus, hose, group, repaint, mat } from "../../../shared/kit.js";
import {
  stationPad, holoPanel, holoTag, standingFigure, reg,
  surfaceTexture, texturedMat, waterFace,
} from "../citykit.js";
import { skimmerVessel, skiff } from "../../../shared/fleet.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Debris Skimmer Vessel Operations VR — SF Bay Restoration &
// Cleanup, Pack B (vessel and marine operations).
//
// After a winter storm the Bay's outfalls and creeks have flushed a line of
// floating trash along the waterfront, and a catamaran debris skimmer is
// working it with her sweep arms out and her bow conveyor down. The learner
// is the Inlandboatmen's Union deckhand running the conveyor and sorting the
// basket; the master is at the helm aft, the MEBA engineer is on watch, and
// a skiff herds the debris line toward the bow. What is found in the basket
// is the job's real hazard — sharps, batteries, an unknown drum — and each is
// handled the way the work plan says, not the way that is quickest. The
// skimmer and the skiff are fleet.js builders.

const BRSK_ACCENT = 0x2fbf9f;
const BRSK_CSS = "#2fbf9f";

export const SIM_BR_DEBRIS_SKIMMER_VESSEL_OPERATIONS = {
  id: "br-debris-skimmer-vessel-operations",
  index: "327",
  domain: "Maritime & Ports",
  trade: "Inlandboatmen's Union (IBU) deckhand running the conveyor and sorting the basket on a debris skimmer, with the master at the helm, a MEBA engineer on watch and an IBU skiff herding the debris line",
  category: "Maritime & Ports",
  district: "Maritime & Ports",
  weather: "overcast",
  certification: "Inlandboatmen's Union (IBU) deck practice; MEBA engineering watch; OSHA 29 CFR 1910.147 lockout of the conveyor's hydraulics and 29 CFR 1910.212 guarding; OSHA 29 CFR 1910.1030 sharps and 29 CFR 1910.120 HAZWOPER awareness for unknown containers; OSHA 29 CFR 1910.138 hand protection; USCG 46 CFR 25 lifesaving equipment aboard; NOAA marine forecast and NOAA Fisheries marine mammal guidance; trash recovery reported under the Regional Water Quality Control Board's trash provisions",
  name: "Debris Skimmer Vessel Operations",
  title: simTitle("Debris Skimmer Vessel Operations"),
  tagline: "Working a storm's trash line on the Bay: PFD and cut gloves on at the boarding gate, the work plan read, the conveyor walked, sweeps swung out and the conveyor set to depth, the belt matched to the boat through an unknown drum riding up it, the basket sorted for sharps and a battery, a jam cleared under lockout, the conveyor raised as a harbor seal surfaces between the sweeps, decon, sweeps stowed and the haul tallied",
  accent: BRSK_ACCENT,
  accentCss: BRSK_CSS,
  parSeconds: 300,
  footprint: 3.0,
  badge: { id: "nothing-sorted-by-hand", name: "Nothing Sorted By Hand", note: "No hand in the belt, no sharp touched, no drum opened, no step onto the conveyor, and both the drum and the seal answered" },

  supportLine: "your union hall's member assistance programme — the Inlandboatmen's Union or MEBA — with the employer's employee assistance line behind it",

  game: system({
    name: "Skimmer Deck",
    currency: "HAUL",
    ranks: ["Ordinary", "Deckhand", "Conveyor Hand", "Lead Deckhand", "Skimmer Deck Certified"],
    badges: [
      { id: "guard-first", name: "Guard First", note: "The conveyor walked before it ran", test: AWARD.stepClean("conveyor-walk") },
      { id: "depth-true", name: "Depth True", note: "Conveyor depth set inside the band first time", test: AWARD.precise(0.7) },
      { id: "tongs-not-hands", name: "Tongs Not Hands", note: "Never a hand in the belt or the pile, never a drum opened, never out on the conveyor", test: AWARD.safe },
    ],
    challenges: [
      { id: "clean-haul", name: "Clean Haul", note: "No corrections from the plan to the tally", test: AWARD.clean },
      { id: "matched-belt", name: "Matched Belt", note: "Belt held in band all the way through the debris line", test: AWARD.unbroken },
      { id: "before-the-ebb", name: "Before The Ebb", note: "Haul tallied inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "reach-into-conveyor": "You reached into the running conveyor to pull a snag off the belt. A conveyor's belt and head pulley take a glove, a sleeve and the arm inside it faster than anyone can pull back, and the guard and the pull-cord stop are there because people reach — a snag is cleared with the belt stopped and locked out, and with the hook, not a hand.",
    "hand-sort-sharps": "You reached into the basket pile with your gloved hand to sort it. Storm debris hides syringes, broken glass and fishhooks under every bottle, and a cut-resistant glove slows a blade but not a needle — the pile is turned with the tongs and the rake, and nothing in it is picked up by hand until it has been seen.",
    "stand-on-conveyor-frame": "You stepped out onto the lowered conveyor frame to reach a piece of debris. The conveyor is a wet, moving ramp that ends under the water between two hulls, forward of the boat's own wash; a slip there puts a person in the water in front of a vessel that is still making way — nothing is worth stepping off the deck for, and anything the conveyor misses is left for the next pass or the skiff.",
    "open-unknown-drum": "You started to open the bung on the unknown drum in the isolation area. A drum pulled from the Bay can hold solvent, acid or fuel under pressure, and opening it on a small deck releases whatever it holds onto the crew — HAZWOPER awareness is to isolate it, label it unknown and leave it closed for the people trained and equipped to open it.",
  },

  lateNotes: {
    "belt-control": "The belt runs once the sweeps are out and the conveyor is set to depth — not with the lip still out of the water.",
    "conveyor-depth": "The depth is set once the sweep arms are out and the conveyor has been walked — not before the guard is back on.",
    "debris-tally": "The haul is tallied once the conveyor is up, the deck washed down and the sweeps stowed — last, not first.",
  },

  steps: [
    {
      id: "pfd-and-gloves", kind: "sequence", anyOrder: true,
      targets: ["skimmer-vest", "cut-gloves"],
      itemNames: { "skimmer-vest": "work vest (PFD) on and fastened", "cut-gloves": "cut- and puncture-resistant gloves" },
      title: "PFD and cut gloves on at the boarding gate",
      cue: "At the boarding gate amidships, before stepping forward onto the working deck: work vest on and fastened, cut- and puncture-resistant gloves on.",
      why: "The skimmer's working deck is forward of the wheelhouse, low, wet and open to the water between the hulls, and the person working it spends the job looking down at a belt and a basket rather than at the edge. The work vest goes on at the gate so it is on for all of it, and the gloves are rated for cuts and punctures because what comes up the belt after a storm is not only plastic.",
    },
    {
      id: "work-plan", kind: "select", target: "work-plan",
      title: "Read the day's work plan with the master",
      cue: "Read the plan: the debris line to work and the tide and wind for it, the sort rules for sharps, batteries and unknown containers, the offload point, the conveyor lockout, and the skiff's job.",
      why: "A skimmer is only as safe as the sort rules the deck works to: the plan says what goes into the basket, what is isolated and what is left alone and reported, so nobody decides on the spot whether a drum is worth opening. It also carries the NOAA forecast for the tide and wind, which decides how the master works the line and how steep the conveyor will be running.",
    },
    {
      id: "conveyor-walk", kind: "find", noHint: true,
      targets: ["tail-guard-off", "pullcord-slack"],
      itemNames: { "tail-guard-off": "head pulley guard left off after the last clean-out", "pullcord-slack": "emergency pull-cord hanging slack off its switch" },
      itemNotes: {
        "tail-guard-off": "The guard over the conveyor's head pulley is lying on the deck beside it — the nip point where the belt wraps the pulley is open at knee height, right where the deckhand kneels to clear the basket chute.",
        "pullcord-slack": "The pull-cord that stops the belt from anywhere along the rail has come off its hook and hangs slack — pull it and nothing would happen, and nobody would know until they needed it.",
      },
      title: "Walk the conveyor before it runs",
      cue: "Walk the conveyor from the head pulley above the basket to the lip: every guard in place, the pull-cord taut on its switch, the belt tracking, nothing wrapped round the pulleys.",
      why: "A debris conveyor is a belt and pulleys running in salt water with rope, net and plastic bag trying to wrap it all day, so the nip points are where the injuries are. Guarding and a working emergency stop are what OSHA's machine guarding rule asks of any conveyor; walking it before the belt runs is the only time those guards and that cord are checked by someone who is not already reaching for a snag.",
    },
    {
      id: "sweeps-out", kind: "turn", target: "sweep-valve",
      title: "Swing the sweep arms out",
      cue: "Turn the sweep valve to swing both sweep arms out from the hulls, watching the skiff and the water either side as they open.",
      why: "The sweep arms funnel a debris line into the conveyor from a width far greater than the boat's own, and they swing out hard and fast on hydraulics. The deckhand watches the water beside each hull as they open, because the skiff working the debris line is often right there, and an arm swung into a skiff is a crushed hull or a crushed hand on its gunwale.",
      turn: { turns: 1.25, label: "SWEEP ARMS", readout: (t) => (t < 0.35 ? "arms stowed" : t < 0.9 ? "arms swinging out" : "arms out · locked") },
    },
    {
      id: "set-depth", kind: "gauge", target: "conveyor-depth",
      title: "Set the conveyor lip to depth",
      cue: "Lower the conveyor and commit its depth with the lip just under the surface, where floating debris rides onto the belt instead of piling against it.",
      why: "Set too shallow, the conveyor's lip rides over the debris line and pushes it away; set too deep, it scoops water and mud, loads the belt and drags the boat's speed down. The right depth is just under the surface for the tide and chop in the plan, and it is set before the belt runs so the first debris that reaches the lip is carried rather than bulldozed.",
      gauge: { label: "CONVEYOR DEPTH", speed: 0.72, green: [0.42, 0.58], readout: (t) => (t < 0.42 ? "lip riding high — pushing debris" : t <= 0.58 ? "lip just under the surface" : "too deep — scooping mud"), missNote: "Outside the band — set the lip just under the surface for this chop, not buried and not riding over the line." },
    },
    {
      id: "work-line", kind: "track", target: "belt-control", seconds: 6,
      title: "Match the belt to the boat through the debris line",
      cue: "Hold the belt speed in band against the boat's speed through the water as the debris line comes onto the lip.",
      why: "The belt has to carry debris up faster than the boat pushes it onto the lip, or it piles at the bottom and spills back into the water; run it too fast and light debris is thrown off the top onto the deck. Holding the belt matched to the boat keeps the flow steady and the basket filling evenly, and it keeps the deckhand's eyes on the belt — which is where an object that should not be there shows up first.",
      track: { start: 0.14, green: [0.42, 0.6], rise: 0.58, fall: 0.44, drift: 0.12, label: "BELT SPEED", readout: (v) => (v < 0.42 ? "slow — debris piling at the lip" : v > 0.6 ? "fast — throwing debris" : "matched — carrying clean") },
      holdBreakNote: "The belt fell out of step with the boat — debris piled at the lip or was thrown off the top. Bring it back to a matched speed and hold it.",
    },
    {
      id: "sort-basket", kind: "find", noHint: true,
      targets: ["sharps-in-debris", "battery-in-debris"],
      itemNames: { "sharps-in-debris": "syringes caught in a plastic bag", "battery-in-debris": "swollen lithium battery pack" },
      itemNotes: {
        "sharps-in-debris": "A plastic bag in the pile holds a cluster of syringes, needles out — the reason the pile is turned with tongs and never by hand.",
        "battery-in-debris": "A lithium battery pack from an e-scooter, swollen and cracked — seawater and a damaged cell can heat and vent; it goes to the isolation bin, away from the basket.",
      },
      title: "Sort the basket for what should not be in it",
      cue: "Turn the pile in the basket with the rake and look for what the plan says is isolated: sharps, batteries, containers, anything that is not plain trash.",
      why: "Most of a storm's debris line is bottles, foam and bags, but it also carries needles from outfalls, batteries from scooters and phones, and containers of whatever someone poured out. The sort is done by eye and with the rake before anything is lifted, because the hazard in a basket is the object nobody has seen yet.",
    },
    {
      id: "sharps-away", kind: "drag", target: "sharps-tongs",
      title: "Take the sharps to the sharps container with the tongs",
      cue: "Pick the bag of syringes up with the long tongs and carry it to the rigid sharps container, never passing it over anyone's hands.",
      why: "A needle in storm debris is an unknown exposure, and the sharps container is the only place on deck it is safe. It is carried with the tongs, at arm's length, and dropped straight in, because the moment of greatest risk is the hand-off — which is why there is none. The bloodborne pathogens rule and the plan's sort rules both say the same thing: no hand touches a sharp.",
      drag: { to: "sharps-bin", radius: 0.55, missNote: "Not in the container — the syringes go all the way into the rigid sharps container, not beside it on the deck." },
    },
    {
      id: "clear-jam", kind: "sequence",
      targets: ["belt-lockout", "jam-hook"],
      itemNames: { "belt-lockout": "conveyor hydraulics isolated, locked and tagged", "jam-hook": "wrapped line cut free with the jam hook" },
      outOfOrderNote: "The conveyor is locked out first — nobody puts a hook into a pulley that can still turn, even with the belt stopped.",
      title: "Clear the wrapped line at the head pulley under lockout",
      cue: "A length of line has wrapped the head pulley and stalled the belt: isolate the conveyor's hydraulics and put your lock and tag on, then cut the line free with the jam hook.",
      why: "A stalled conveyor is still a loaded one: the hydraulic motor is pushing against the wrap, and the moment the line is cut the belt jumps. The lockout rule exists for exactly this job — the energy is isolated and locked before anyone reaches in, and the person clearing the jam holds the only key, so the belt cannot be restarted from the console while a hook is in the pulley.",
    },
    {
      id: "raise-conveyor", kind: "hold", target: "conveyor-raise", seconds: 5,
      title: "Raise the conveyor clear of the water",
      cue: "Hold the raise lever and watch the lip come up clear of the water before the master picks up speed for the offload.",
      why: "A conveyor left down while the boat speeds up is a scoop at the bow that loads the hull, throws water onto the deck and can tear its own frame; it comes up before the throttle does. The deckhand holds the lever and watches the lip clear rather than walking away, because whatever is in the water ahead of the boat is right under the lip at that moment.",
      holdBreakNote: "Let go of the raise lever with the lip still in the water. Take it up again and hold it until the lip is clear.",
    },
    {
      id: "decon", kind: "select", target: "decon-station",
      title: "Wash down the deck and your gloves",
      cue: "Wash the deck, the rake and the tongs down at the decon station, and rinse your gloves before you go aft to the wheelhouse.",
      why: "Storm debris carries sewage, fuel and whatever else washed out of the outfalls, and it ends up on the deck, the tools and the gloves that sorted it. Washing down before going aft keeps it out of the wheelhouse and off the hands that will next touch a radio, a coffee cup or a face.",
    },
    {
      id: "sweeps-in", kind: "turn", target: "sweep-valve",
      title: "Stow the sweep arms for the run to the offload",
      cue: "Turn the sweep valve back to swing both arms in and pin them fore-and-aft along the hulls.",
      why: "Sweep arms left out are a width the master cannot see from the helm and a lever the chop works against at speed, so they are stowed and pinned before the run to the offload. Stowing them is the same hydraulic swing as deploying them, and the deckhand watches the water beside each hull again as they come in.",
      turn: { turns: 1.25, label: "SWEEP ARMS", readout: (t) => (t < 0.35 ? "arms out" : t < 0.9 ? "arms swinging in" : "arms stowed · pinned") },
    },
    {
      id: "haul-tally", kind: "select", target: "debris-tally",
      title: "Tally the haul and the hazardous finds",
      cue: "Tally the haul: the basket volume, the sharps and the battery isolated, the unknown drum left closed and reported, the guard and pull-cord found, and the seal inside the sweeps.",
      why: "The tally is what the trash recovery is reported against to the Regional Water Quality Control Board and the agency funding the work, and it is where an unknown drum becomes a pickup by a hazmat contractor rather than something left on deck. The guard and the pull-cord go in so the next crew does not find them the same way, and the seal goes in because marine mammal encounters are recorded, not remembered.",
    },
    {
      id: "crew-checkin", kind: "select", target: "crew-radio",
      title: "Check in with the master, the skiff and the engineer",
      cue: "On the radio: the conveyor is up and locked out, the sweeps stowed, the finds isolated, and how everyone is after a drum on the belt and a seal between the arms.",
      why: "The master worked the line without seeing the belt, the skiff crew were herding debris beside a boat that had to stop for a seal, and the engineer has a guard to refit — each needs the deck's report. It is also the crew's own check-in: sorting needles out of a basket all morning takes something out of people, and the union's member assistance line is there for what does not get said on the radio.",
    },
  ],

  interrupts: [
    {
      id: "drum-on-belt",
      kind: "Unknown drum on the belt",
      after: "work-line", delay: 2, seconds: 14,
      alert: "A small sealed drum with a faded label is riding up the belt toward the basket, sloshing as it tips on the slats.",
      cue: "Hit the conveyor's emergency stop on the rail so the drum stops on the belt, short of the basket.",
      target: "conveyor-estop",
      why: "An unknown drum dropped into the basket lands on everything else with its bung facing wherever it falls, and if it splits, whatever it holds is in the basket with the sharps and the deckhand's hands. Stopping the belt holds it where it can be seen and isolated with the right gear, per the plan, instead of letting the conveyor decide where it lands.",
      missNote: "The drum rode over the top of the belt and dropped into the basket, splitting a seam; something sharp-smelling ran into the pile the deckhand was about to sort.",
      wrongNote: "The conveyor emergency stop — halt the belt before the drum reaches the basket, then isolate it.",
    },
    {
      id: "seal-in-sweeps",
      kind: "Harbor seal between the sweeps",
      after: "raise-conveyor", delay: 2, seconds: 14,
      alert: "A harbor seal has surfaced inside the sweep arms, just ahead of the conveyor lip, with the boat still making way.",
      cue: "Call the master on the wheelhouse intercom to take the way off the boat and let the seal clear before anything else moves.",
      target: "wheelhouse-intercom",
      why: "A seal inside the sweeps is inside the one space the boat is driving debris into, and only the master can take the way off. NOAA Fisheries' guidance and the work plan both say the same thing: stop, give the animal room and let it leave on its own, and record the encounter — the conveyor and the sweeps wait.",
      missNote: "The boat kept making way with the conveyor still coming up; the seal was pushed against the lip by the sweeps before it dived clear, and the encounter went unreported.",
      wrongNote: "The wheelhouse intercom — only the master can take the way off the boat so the seal can leave.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 3.0, BRSK_ACCENT);

    // ------------------------------------------------------------ the water
    const water = box(g, 22, 0.02, 22, 0, 0.04, 0, 0xffffff, { rough: 0.15, metal: 0.4, cast: false });
    water.material = texturedMat(surfaceTexture((cx, w, h) => waterFace(cx, w, h, { base: "#0f2a2e", mid: "#17393e" }), { repeat: 5, px: 512 }), { rough: 0.15, metal: 0.4, color: 0x7fa6a8 });
    // The debris line the skimmer is working: bottles, foam, a board, a bag.
    const debris = group(g, 0, 0.07, 5.6);
    const bits = [[-0.8, 0.0, 0xd8e2e6], [0.3, 0.4, 0x3f7fb8], [0.9, -0.3, 0xf2f2ee], [-0.2, 0.8, 0x8a6a42], [1.4, 0.6, 0xe0592a], [-1.3, 0.5, 0x2f8f5a]];
    for (const [dx, dz, c] of bits) box(debris, 0.26, 0.08, 0.14, dx, 0, dz, c, { rough: 0.6 }).rotation.y = dx * 1.7;

    // ------------------ the skimmer, bow to the learner, working deck at 0.41
    const DECK = 0.41;
    const sv = skimmerVessel(g, 0, DECK - 1.29, 0, { livery: { fleetName: "BAY CLEANUP", unitNumber: "SV-2" } });
    const { conveyor, sweepArms, basket, tankHatch } = sv.userData.parts;
    void tankHatch;
    const basketPile = group(basket, 0, 0.62, 0);
    for (const [dx, dz, c] of [[-0.5, -0.2, 0xd8e2e6], [0.3, 0.2, 0x3f7fb8], [0.6, -0.25, 0xf2f2ee]]) box(basketPile, 0.5, 0.2, 0.4, dx, 0, dz, c, { rough: 0.7 });
    const sharps = group(basket, -0.45, 0.8, 0.25);
    box(sharps, 0.2, 0.08, 0.16, 0, 0, 0, 0xe6ecef, { rough: 0.4, opacity: 0.85 });
    for (let i = 0; i < 3; i++) cyl(sharps, 0.008, 0.008, 0.16, -0.05 + i * 0.05, 0.02, 0, 0xf2c14b, { rough: 0.4, seg: 6 }).rotation.z = Math.PI / 2;
    reg(hits, sharps, "sharps-in-debris");
    const battery = box(basket, 0.26, 0.1, 0.16, 0.5, 0.82, 0.2, 0x2b3138, { rough: 0.5, emissive: 0x3a1a08, ei: 0.3 });
    reg(hits, battery, "battery-in-debris");
    holoTag(g, "basket", 0, DECK + 1.25, 1.9, { css: BRSK_CSS, w: 0.18 });
    const drumOnBelt = cyl(conveyor, 0.12, 0.12, 0.3, 0, 0.2, 1.4, 0x4a6a3a, { rough: 0.6, metal: 0.3, seg: 12 });
    drumOnBelt.visible = false;
    const sweepHome = sweepArms.map((a) => a.rotation.y);

    // ------------------------- the conveyor walk: tail guard and pull-cord
    const guard = group(g, -1.35, DECK, 2.9);
    const guardPlate = box(guard, 0.5, 0.04, 0.36, 0, 0.02, 0, 0xf2c14b, { rough: 0.5, metal: 0.3 });
    const nip = cyl(g, 0.09, 0.09, 1.9, 0, DECK + 0.12, 3.4, 0x2b3138, { rough: 0.5, metal: 0.5, seg: 12 });
    nip.rotation.z = Math.PI / 2;
    holoTag(guard, "head pulley guard", 0, 0.28, 0, { css: BRSK_CSS, w: 0.3 });
    reg(hits, guard, "tail-guard-off");
    const cord = hose(g, [[1.95, DECK + 0.9, 0.9], [1.9, DECK + 0.55, 2.0], [1.95, DECK + 0.9, 3.2]], 0.008, 0xf2c14b, { steps: 10, rough: 0.6 });
    const cordSwitch = box(g, 0.1, 0.12, 0.08, 1.95, DECK + 0.95, 0.85, 0xd2312b, { rough: 0.5, emissive: 0x3a0808, ei: 0.3 });
    reg(hits, cordSwitch, "pullcord-slack");
    void cord;

    // ------------------------------------------------ operator's console
    const con = group(g, 1.45, DECK, 1.25, -0.3);
    box(con, 0.5, 0.95, 0.34, 0, 0.47, 0, 0x2b3138, { rough: 0.55, metal: 0.4 });
    const beltCtl = group(con, -0.14, 0.98, 0.05);
    cyl(beltCtl, 0.05, 0.05, 0.04, 0, 0, 0, 0x2fbf9f, { rough: 0.45, seg: 14 });
    const beltKnob = box(beltCtl, 0.015, 0.03, 0.08, 0, 0.03, 0, 0xf1f3f4, { rough: 0.4 });
    holoTag(con, "belt speed", -0.14, 1.2, 0.05, { css: BRSK_CSS, w: 0.2 });
    reg(hits, beltCtl, "belt-control");
    const raise = group(con, 0.12, 0.96, 0.05);
    const raiseArm = group(raise, 0, 0, 0);
    cyl(raiseArm, 0.012, 0.012, 0.22, 0, 0.11, 0, 0x8a949d, { rough: 0.4, metal: 0.8, seg: 8 });
    ball(raiseArm, 0.03, 0, 0.23, 0, 0x2fbf9f, { rough: 0.5, seg: 10, seg2: 8 });
    holoTag(con, "conveyor raise", 0.14, 1.34, 0.05, { css: BRSK_CSS, w: 0.26 });
    reg(hits, raise, "conveyor-raise");
    const depth = group(g, 0.95, DECK, 0.95, -0.3);
    cyl(depth, 0.03, 0.04, 0.95, 0, 0.47, 0, 0x8a949d, { rough: 0.45, metal: 0.7, seg: 8 });
    const dial = box(depth, 0.28, 0.2, 0.05, 0, 1.02, 0, 0x101820, { rough: 0.4, emissive: 0x0d1c24, ei: 0.4 });
    dial.rotation.x = -0.35;
    const needle = box(depth, 0.01, 0.08, 0.012, 0, 1.02, 0.035, 0xd2312b, { rough: 0.4 });
    holoTag(depth, "conveyor depth", 0, 1.3, 0, { css: BRSK_CSS, w: 0.28 });
    reg(hits, depth, "conveyor-depth");
    const estop = group(g, 1.95, DECK + 0.95, 2.5);
    box(estop, 0.1, 0.14, 0.1, 0, 0, 0, 0xf2c14b, { rough: 0.5 });
    cyl(estop, 0.04, 0.04, 0.04, 0, 0.08, 0, 0xd2312b, { rough: 0.5, seg: 12 });
    const beltLamp = box(estop, 0.04, 0.03, 0.02, 0, -0.03, 0.055, 0x2a4a2a, { rough: 0.4, emissive: 0x2fbf6f, ei: 0.6 });
    holoTag(estop, "conveyor e-stop", 0, 0.25, 0, { css: BRSK_CSS, w: 0.28 });
    reg(hits, estop, "conveyor-estop");
    const sweep = group(g, 1.75, DECK, 0.3);
    box(sweep, 0.3, 0.6, 0.22, 0, 0.3, 0, 0x2f4f6f, { rough: 0.55, metal: 0.4 });
    const sweepHandle = group(sweep, 0, 0.66, 0.12);
    box(sweepHandle, 0.2, 0.02, 0.02, 0, 0, 0, 0xd2312b, { rough: 0.5 });
    holoTag(sweep, "sweep arm valve", 0, 0.9, 0, { css: BRSK_CSS, w: 0.3 });
    reg(hits, sweep, "sweep-valve");

    // --------------------------------- lockout, jam hook, the wrapped line
    const lock = group(g, -1.75, DECK, 0.95);
    box(lock, 0.3, 0.5, 0.2, 0, 0.25, 0, 0x2f4f6f, { rough: 0.55, metal: 0.4 });
    const hasp = box(lock, 0.08, 0.1, 0.03, 0, 0.42, 0.11, 0x8a949d, { rough: 0.4, metal: 0.7 });
    const padlock = box(lock, 0.06, 0.08, 0.03, 0, 0.36, 0.13, 0xd2312b, { rough: 0.5 });
    padlock.visible = false;
    holoTag(lock, "conveyor hydraulic isolation", 0, 0.72, 0, { css: BRSK_CSS, w: 0.46 });
    reg(hits, lock, "belt-lockout");
    void hasp;
    const hook = group(g, -1.95, DECK + 0.85, 2.3);
    cyl(hook, 0.012, 0.012, 1.1, 0, 0, 0, 0x8a949d, { rough: 0.4, metal: 0.8, seg: 8 }).rotation.x = 0.3;
    torus(hook, 0.05, 0.01, 0, 0.55, 0.16, 0xd2312b, { rough: 0.5, seg: 6, seg2: 12 });
    holoTag(hook, "jam hook", 0, 0.8, 0, { css: BRSK_CSS, w: 0.2 });
    reg(hits, hook, "jam-hook");
    const wrap = torus(g, 0.11, 0.025, 0.6, DECK + 0.42, 3.5, 0x2f8f5a, { rough: 0.85, seg: 6, seg2: 14 });
    wrap.rotation.y = Math.PI / 2;

    // ------------------------------------ isolation area, sharps, decon
    const iso = group(g, -1.45, DECK, 1.5);
    box(iso, 0.6, 0.03, 0.6, 0, 0.015, 0, 0xf2c14b, { rough: 0.7 });
    const drum = cyl(iso, 0.14, 0.14, 0.34, 0.08, 0.2, 0, 0x5a6a4a, { rough: 0.6, metal: 0.3, seg: 12 });
    holoTag(iso, "open the drum's bung?", 0, 0.62, 0, { css: "#d2312b", w: 0.42 });
    reg(hits, drum, "open-unknown-drum");
    const bin = group(g, -0.95, DECK, 0.95);
    box(bin, 0.26, 0.4, 0.22, 0, 0.2, 0, 0xd2312b, { rough: 0.5 });
    box(bin, 0.27, 0.04, 0.23, 0, 0.42, 0, 0xf2c14b, { rough: 0.5 });
    holoTag(bin, "sharps container", 0, 0.62, 0, { css: BRSK_CSS, w: 0.3 });
    reg(hits, bin, "sharps-bin");
    const tongs = group(g, -0.95, DECK + 0.9, 2.6);
    for (const dx of [-0.015, 0.015]) box(tongs, 0.01, 0.01, 0.8, dx, 0, 0, 0xc8ced4, { rough: 0.3, metal: 0.7 });
    holoTag(tongs, "long tongs", 0, 0.15, 0, { css: BRSK_CSS, w: 0.22 });
    reg(hits, tongs, "sharps-tongs");
    const decon = group(g, -1.7, DECK, -1.3);
    box(decon, 0.5, 0.6, 0.4, 0, 0.3, 0, 0x2f5f8f, { rough: 0.5, metal: 0.3, finish: "painted" });
    const nozzle = group(decon, 0.1, 0.9, 0);
    hose(nozzle, [[0, -0.3, 0.2], [0.1, 0, 0.25], [0.2, 0.05, 0.3]], 0.02, 0xe8722a, { steps: 6, rough: 0.6 });
    holoTag(decon, "decon station", 0, 1.1, 0, { css: BRSK_CSS, w: 0.26 });
    reg(hits, decon, "decon-station");

    // --------------------------------------- the rack, boards and radios
    const rack = group(g, 1.7, DECK, -1.1);
    cyl(rack, 0.022, 0.022, 1.3, 0, 0.65, 0, 0x8a949d, { rough: 0.45, metal: 0.7, seg: 8 });
    const vest = group(rack, 0, 1.0, 0.07);
    box(vest, 0.26, 0.4, 0.1, 0, 0, 0, 0xf06a2b, { rough: 0.8 });
    box(vest, 0.26, 0.05, 0.11, 0, 0.08, 0, 0xdfe8ee, { rough: 0.6, emissive: 0xdfe8ee, ei: 0.3 });
    holoTag(rack, "work vest — PFD", 0, 1.45, 0, { css: BRSK_CSS, w: 0.3 });
    reg(hits, vest, "skimmer-vest");
    const gloves = box(g, 0.18, 0.05, 0.12, 1.3, DECK + 0.02, -0.9, 0x3a6a8a, { rough: 0.9 });
    holoTag(g, "cut gloves", 1.3, DECK + 0.25, -0.9, { css: BRSK_CSS, w: 0.2 });
    reg(hits, gloves, "cut-gloves");
    const drawPlan = (cx, w, h, done) => {
      cx.fillStyle = "#07161a"; cx.fillRect(0, 0, w, h); cx.fillStyle = done ? "#59c97b" : BRSK_CSS; cx.fillRect(0, 0, w, 6);
      cx.font = `600 ${Math.round(h * 0.1)}px 'Barlow Condensed', Arial, sans-serif`; cx.textAlign = "left"; cx.textBaseline = "middle";
      cx.fillStyle = "#d4f2ea"; cx.fillText("WORK PLAN — DEBRIS LINE", w * 0.05, h * 0.12);
      cx.font = `${Math.round(h * 0.066)}px Arial, sans-serif`; cx.fillStyle = "#e8faf5";
      ["Area: storm debris line, per the chart", "Tide and wind: NOAA forecast on the plan", "Sharps: tongs, rigid container only",
        "Batteries: isolation bin, never the basket", "Unknown containers: isolate, leave closed", "Conveyor jams: lock out, then the hook",
        "Marine mammals: stop, give room, record"].forEach((l, i) => cx.fillText(l, w * 0.05, h * (0.26 + i * 0.105)));
    };
    const plan = holoPanel(g, 0.8, 0.54, -0.55, DECK + 1.35, 0.95, (cx, w, h) => drawPlan(cx, w, h, false), { ry: 0.1, accent: BRSK_ACCENT });
    reg(hits, plan, "work-plan");
    const drawTally = (cx, w, h, rows, done) => {
      cx.fillStyle = "#07161a"; cx.fillRect(0, 0, w, h); cx.fillStyle = done ? "#59c97b" : BRSK_CSS; cx.fillRect(0, 0, w, 6);
      cx.font = `600 ${Math.round(h * 0.12)}px 'Barlow Condensed', Arial, sans-serif`; cx.textAlign = "left"; cx.textBaseline = "middle";
      cx.fillStyle = "#d4f2ea"; cx.fillText("HAUL TALLY", w * 0.06, h * 0.15);
      cx.font = `${Math.round(h * 0.082)}px Arial, sans-serif`; cx.fillStyle = done ? "#e6f6ea" : "#e8faf5";
      rows.forEach((l, i) => cx.fillText(l, w * 0.06, h * (0.36 + i * 0.16)));
    };
    const tally = holoPanel(g, 0.66, 0.46, 0.6, DECK + 1.35, 0.95, (cx, w, h) => drawTally(cx, w, h, ["Haul: —", "Isolated: —", "Defects: —", "Wildlife: —"], false), { ry: -0.1, accent: BRSK_ACCENT });
    reg(hits, tally, "debris-tally");
    const icom = group(g, 0.35, DECK + 0.9, -1.62);
    box(icom, 0.16, 0.22, 0.06, 0, 0, 0, 0x2b3138, { rough: 0.5, metal: 0.4 });
    const whLamp = box(icom, 0.04, 0.04, 0.02, 0, 0.06, 0.04, 0x59c97b, { emissive: 0x59c97b, ei: 1.0 });
    holoTag(icom, "wheelhouse intercom", 0, 0.22, 0.04, { css: BRSK_CSS, w: 0.36 });
    reg(hits, icom, "wheelhouse-intercom");
    const radio = group(g, -0.35, DECK + 0.9, -1.62);
    box(radio, 0.08, 0.2, 0.05, 0, 0, 0, 0x2b3138, { rough: 0.5 });
    const radioLamp = box(radio, 0.05, 0.03, 0.005, 0, 0.05, 0.028, 0x0d1c24, { rough: 0.3, emissive: 0x2a6f8f, ei: 0.6 });
    holoTag(radio, "crew radio", 0, 0.2, 0.03, { css: BRSK_CSS, w: 0.22 });
    reg(hits, radio, "crew-radio");

    // -------------------------------------------------- hazard targets
    const beltHit = box(g, 0.6, 0.4, 0.6, 0, DECK + 0.4, 3.0, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "pull the snag off the running belt?", 0.2, DECK + 0.85, 3.1, { css: "#d2312b", w: 0.58 });
    reg(hits, beltHit, "reach-into-conveyor");
    const pileHit = box(g, 0.5, 0.3, 0.4, 0.55, DECK + 1.05, 1.6, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "sort the pile by hand?", 0.75, DECK + 1.45, 1.6, { css: "#d2312b", w: 0.4 });
    reg(hits, pileHit, "hand-sort-sharps");
    const frameHit = box(g, 1.2, 0.5, 1.0, 0, DECK + 0.2, 4.6, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "step out on the conveyor?", 0, DECK + 0.75, 4.7, { css: "#d2312b", w: 0.46 });
    reg(hits, frameHit, "stand-on-conveyor-frame");

    // --------------------------------------------- the skiff and the seal
    const sk = skiff(g, -4.4, -0.3, 4.6, { ry: 0.5, livery: { fleetName: "BAY CLEANUP", unitNumber: "SK-3" } });
    const skHand = standingFigure(sk, 0, -0.9, { ry: 0.3, vest: 0xf06a2b, helmet: 0xf1f3f4, gloves: true, atStation: true });
    skHand.position.y = 0.8;
    holoTag(sk, "IBU skiff — herding the line", 0, 2.7, -0.9, { css: BRSK_CSS, w: 0.46 });
    const skHome = sk.position.clone();
    const seal = group(g, 0.5, 0.06, 5.4);
    ball(seal, 0.16, 0, 0.08, 0, 0x5a5f63, { rough: 0.6, seg: 12, seg2: 10 });
    seal.visible = false;

    // ------------------------------------------------------------- crew
    const sorter = standingFigure(g, -1.4, 2.25, { ry: 1.2, vest: 0xf06a2b, helmet: 0xf1f3f4, gloves: true, atStation: true });
    sorter.position.y = DECK;
    holoTag(sorter, "IBU deckhand", 0, 1.95, 0, { css: BRSK_CSS, w: 0.26 });

    const waterTex = water.material.map;
    return {
      hits,
      spawnLook: new THREE.Vector3(0, 0.9, 2.2),
      onStep() {},
      onStepComplete(step) {
        if (step.id === "conveyor-walk") { guardPlate.position.set(0.5, 0.25, 1.9); guardPlate.rotation.x = -0.3; cordSwitch.material = mat(0x59c97b, { emissive: 0x2a7a3a, ei: 0.5 }); }
        if (step.id === "sweeps-out") sweepArms.forEach((a) => { a.rotation.y = a.userData.deploy; });
        if (step.id === "set-depth") conveyor.rotation.x = 0.55;
        if (step.id === "work-line") { debris.position.z = 7.2; debris.visible = false; }
        if (step.id === "sort-basket") battery.position.set(-1.2, 0.08, -0.5);
        if (step.id === "sharps-away") sharps.visible = false;
        if (step.id === "clear-jam") { padlock.visible = true; wrap.visible = false; }
        if (step.id === "raise-conveyor") conveyor.rotation.x = 0.05;
        if (step.id === "decon") nozzle.rotation.z = -0.4;
        if (step.id === "sweeps-in") sweepArms.forEach((a, i) => { a.rotation.y = sweepHome[i]; });
        if (step.id === "haul-tally") {
          repaint(tally.userData.face, (cx, w, h) => drawTally(cx, w, h, ["Haul: basket full · debris line cleared", "Isolated: sharps, battery, two drums", "Defects: tail guard, pull-cord", "Wildlife: harbor seal, way taken off"], true));
          repaint(plan.userData.face, (cx, w, h) => drawPlan(cx, w, h, true));
        }
        if (step.id === "crew-checkin") radioLamp.material = mat(0x4fd1ff, { emissive: 0x4fd1ff, ei: 1.2 });
      },
      onHazard() {},
      onInterrupt(it) {
        if (it.id === "drum-on-belt") drumOnBelt.visible = true;
        if (it.id === "seal-in-sweeps") { seal.visible = true; whLamp.material = mat(0xf2c14b, { emissive: 0xf2c14b, ei: 1.3 }); }
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "drum-on-belt") { beltLamp.material = mat(0x5a1410, { emissive: 0xd2312b, ei: 1.2 }); drumOnBelt.visible = false; drum.position.x = -0.12; iso.scale.set(1.15, 1, 1.15); }
        if (it.id === "seal-in-sweeps") { seal.position.set(2.6, 0.06, 7.0); whLamp.material = mat(0x59c97b, { emissive: 0x59c97b, ei: 1.0 }); sk.position.set(skHome.x - 0.6, skHome.y, skHome.z + 0.4); }
      },
      animate(t, dt, session) {
        const step = session?.step;
        if (waterTex?.offset) { waterTex.offset.x = t * 0.004; waterTex.offset.y = t * 0.007; }
        if (session?.turn && (step?.id === "sweeps-out" || step?.id === "sweeps-in")) sweepHandle.rotation.z = session.turn.amount * 1.4;
        const gg = session?.gauge;
        if (gg && !gg.committed && step?.id === "set-depth") { needle.rotation.z = -1.2 + gg.t * 2.4; conveyor.rotation.x = 0.05 + gg.t * 0.8; }
        if (step?.id === "work-line" && session.holding) { beltKnob.rotation.y = (session.track?.v ?? 0) * 3; debris.position.z = 5.6 - ((t * 0.4) % 1.2); }
        if (step?.id === "raise-conveyor" && session.holding) raiseArm.rotation.x = -0.5;
        if (seal.visible) seal.position.y = 0.06 + Math.sin(t * 1.6) * 0.03;
      },
    };
  },
};
