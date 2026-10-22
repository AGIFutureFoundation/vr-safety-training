import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import { box, cyl, torus, hose, group, repaint, mat } from "../../../shared/kit.js";
import {
  stationPad, holoPanel, holoTag, standingFigure, reg,
  surfaceTexture, texturedMat, waterFace,
} from "../citykit.js";
import { salvageCraneBarge, derelictBoat, skiff } from "../../../shared/fleet.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Derelict Vessel Salvage Rigging VR — SF Bay Restoration &
// Cleanup, Pack B (vessel and marine operations).
//
// A derelict sailboat has sunk to her cabin top on a mudflat edge of the Bay,
// and a spud barge with a revolving crane has come alongside to lift her out.
// The learner is the salvage rigger on the barge deck — the Pile Drivers do
// the rigging, the IUOE operator is in the crane cab, and an Inlandboatmen's
// Union deckhand runs the skiff that tends the boom and passes the slings.
// Nothing here is a real wreck or a real removal: the boat's weight is "the
// salvage engineer's estimate", the radius is "the load chart's", and the
// tide and the fall zone come from the plan on the board. The crane barge,
// the derelict and the skiff are fleet.js builders.

const BRDV_ACCENT = 0xd98a2b;
const BRDV_CSS = "#d98a2b";

export const SIM_BR_DERELICT_VESSEL_SALVAGE_RIGGING = {
  id: "br-derelict-vessel-salvage-rigging",
  index: "325",
  domain: "Maritime & Ports",
  trade: "Pile Drivers Local 34 (UBC) salvage rigger on a crane barge, with an IUOE Local 3 crane operator in the cab and an Inlandboatmen's Union (IBU) deckhand on the skiff",
  category: "Maritime & Ports",
  district: "Maritime & Ports",
  weather: "overcast",
  certification: "Pile Drivers Local 34 (UBC) rigging and marine construction training; IUOE Local 3 crane operator training and NCCCO certification; Inlandboatmen's Union (IBU) deck and skiff practice; OSHA 29 CFR 1926.1437 cranes on barges and 29 CFR 1926.106 work over water; ASME B30.8 floating cranes, ASME B30.9 slings and ASME B30.26 rigging hardware; USCG 33 CFR 153 discharge removal under the Area Contingency Plan; NOAA Office of Response and Restoration spill guidance; the removal authorised under the BCDC permit and the salvage plan",
  name: "Derelict Vessel Salvage Rigging",
  title: simTitle("Derelict Vessel Salvage Rigging"),
  tagline: "A sunken derelict lifted from the Bay: PFD on at the ladder head, the salvage plan read, the wreck surveyed from the barge, boom closed round her fuel, the slings inspected and the radius read off the chart, the slings passed at the marked points and shackled, tag lines on, the fall zone flagged, a strain taken through a hull still full of water, the tag line held as she breaks the surface through a tide that sets the skiff in, and the lift logged",
  accent: BRDV_ACCENT,
  accentCss: BRDV_CSS,
  parSeconds: 300,
  footprint: 3.0,
  badge: { id: "never-under-the-hook", name: "Never Under The Hook", note: "Nobody under the load, nobody aboard the wreck, no sling on a rotten cleat, and both the waterlogged hull and the drifting skiff answered" },

  supportLine: "your union hall's member assistance programme — the Pile Drivers, IUOE Local 3 or the Inlandboatmen's Union — with the employer's employee assistance line behind it",

  game: system({
    name: "Salvage Deck",
    currency: "SHACKLE",
    ranks: ["Deckhand", "Rigger", "Lead Rigger", "Salvage Foreman", "Salvage Rigging Certified"],
    badges: [
      { id: "survey-first", name: "Survey First", note: "The wreck walked from the barge before any sling went near her", test: AWARD.stepClean("hull-survey") },
      { id: "radius-true", name: "Radius True", note: "Load chart read inside the band first time", test: AWARD.precise(0.7) },
      { id: "clear-of-the-bight", name: "Clear Of The Bight", note: "Never under the hook, never a hand in a bight, never aboard the wreck", test: AWARD.safe },
    ],
    challenges: [
      { id: "clean-lift", name: "Clean Lift", note: "No corrections from the plan to the log", test: AWARD.clean },
      { id: "slow-strain", name: "Slow Strain", note: "Hoist load held in band the whole way through the strain", test: AWARD.unbroken },
      { id: "on-the-slack", name: "On The Slack", note: "Lift logged inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "under-suspended-load": "You stepped out under the boom tip while the hook was loaded. A derelict coming off the bottom can shed its keel, a rotten bulkhead or a tonne of mud without warning, and the fall zone under a suspended load is where nobody stands — ASME B30.8 and the crane rules on barges keep people out of it, and the tag lines exist so the rigger never has to be there.",
    "hand-in-sling-bight": "You reached in to straighten a sling against the hull with the crane taking a strain. A round sling closes on the hull as the load comes on, and a hand between sling and hull is pinned there with the whole weight of a waterlogged boat behind it — slings are adjusted slack, with the operator's hands off the controls, and never guided under strain.",
    "board-derelict": "You stepped down onto the derelict's cabin top to rig her from above. A sunken fibreglass boat is flooded, rotten and settling in the mud; her deck can break under a boot, she can roll as water shifts inside her, and anyone aboard goes down with her into cold water — she is rigged from the skiff and the barge, and nobody boards her.",
    "rig-to-cleat": "You shackled the lift to the derelict's bow cleat. A deck cleat is fastened to a deck that has been under water for months, and it is sized to hold a mooring line, not the weight of a flooded hull — it tears out with a chunk of rotten deck and the load drops. The slings go under the hull at the salvage engineer's marked points, nowhere else.",
  },

  lateNotes: {
    "signal-radio": "The strain is taken once the slings are shackled, the tag lines are on and the fall zone is flagged — not with the rigging still loose.",
    "load-chart": "The radius is read once the slings have been inspected and before they are passed — the chart decides whether this lift happens at all.",
    "salvage-log": "The lift is logged once the derelict is out of the water and the tag lines are made fast — last, not first.",
  },

  steps: [
    {
      id: "pfd-and-hat", kind: "sequence", anyOrder: true,
      targets: ["work-vest", "hard-hat"],
      itemNames: { "work-vest": "work vest (PFD) on and fastened", "hard-hat": "hard hat with chin strap" },
      title: "PFD and hard hat on at the ladder head",
      cue: "At the head of the gangway, before stepping onto the barge deck: work vest on and every buckle done, hard hat on with its chin strap.",
      why: "A crane barge alongside a wreck is work over water on a deck with no bulwark, and a person who goes over the edge in Bay water loses the use of their hands to the cold long before they tire — the work vest is what keeps their face out of the water until the skiff reaches them. The hard hat's chin strap matters for the same reason: a hat that comes off on the first look up at the boom is no protection when a shackle pin falls.",
    },
    {
      id: "salvage-plan", kind: "select", target: "salvage-plan",
      title: "Read the salvage plan with the foreman",
      cue: "Read the plan on the board: the derelict's condition and the salvage engineer's weight estimate, the marked lift points, the crane's radius, the tide window, the fall zone, and who is on the skiff.",
      why: "A derelict has no drawings and no known weight: she is whatever water, mud and rot she has taken on since she sank, and the plan is where the salvage engineer's estimate, the lift points and the crane's capacity at the planned radius are put side by side before anyone commits to a lift. Reading it with the foreman is how the rigger learns what the lift is allowed to weigh — and so what a reading above that figure means when the strain comes on.",
    },
    {
      id: "hull-survey", kind: "find", noHint: true,
      targets: ["vent-sheen", "deck-rot"],
      itemNames: { "vent-sheen": "fuel vent weeping a sheen on the water", "deck-rot": "soft, delaminated deck round the bow cleat" },
      itemNotes: {
        "vent-sheen": "The fuel tank's vent on the quarter is letting a rainbow sheen out onto the water — there is diesel aboard, and it will come out faster the moment she moves.",
        "deck-rot": "The deck round the bow cleat has gone soft and is lifting at the edges — that cleat will not hold a mooring line, let alone a lift, and the deck will not hold a person.",
      },
      title: "Survey the derelict from the barge edge",
      cue: "From the barge edge, walk your eyes over the wreck: fuel and oil on the water, the state of the deck and fittings, how she is lying, what she is holding.",
      why: "The derelict tells the rigger how the lift will go before any sling touches her: a sheen from a vent means fuel aboard and a spill the moment she moves, and a soft deck means no fitting on her can be trusted. The survey is done from the barge and the skiff, not from her deck, because the one thing certain about a sunken boat is that her structure is weaker than it looks.",
    },
    {
      id: "boom-derelict", kind: "drag", target: "boom-end",
      title: "Close the containment boom round the derelict",
      cue: "Pass the boom's end to the skiff and see it run round the wreck to the anchor buoy beyond her bow, so the boom closes against the barge's side before she is disturbed.",
      why: "Lifting a sunken boat squeezes out whatever is in her — diesel, lube oil, bilge — and the NOAA Office of Response and Restoration guidance and the Area Contingency Plan both put containment in the water before the source is disturbed, not after the sheen is spreading on the ebb. A boom closed round the wreck and made fast to the barge turns a spill into a small pool the skimmer and sorbents can recover.",
      drag: { to: "boom-anchor", radius: 0.6, missNote: "Not made fast — the boom's end has to reach the anchor buoy beyond her bow, or there is a gap in the ring the sheen will find." },
    },
    {
      id: "sling-inspection", kind: "find", noHint: true,
      targets: ["sling-cut", "shackle-unmarked"],
      itemNames: { "sling-cut": "round sling with its cover cut through", "shackle-unmarked": "shackle with no rated load or maker's marking" },
      itemNotes: {
        "sling-cut": "One round sling has a cut through its cover where it was dragged over a barnacled edge — the load-bearing core is exposed and it is out of service.",
        "shackle-unmarked": "One shackle carries no rated load or maker's stamp — an unmarked shackle's capacity is unknown, and unknown is not a number anyone can rig to.",
      },
      title: "Inspect the slings and shackles on the rack",
      cue: "Inspect every round sling's cover and tag, and every shackle's body, pin and markings, before any of it goes into the lift.",
      why: "The slings under a derelict carry a load nobody can weigh exactly, over a hull that is barnacled, sharp and lying in mud, so the gear starts the lift in the best condition it will be in all day. ASME B30.9 takes a sling with a cut cover or a missing tag out of service, and ASME B30.26 does the same for a shackle with no rated load marked on it — the rigger's inspection is where that happens, on the rack, rather than under the hook.",
    },
    {
      id: "read-radius", kind: "gauge", target: "load-chart",
      title: "Read the crane's capacity at the planned radius",
      cue: "Read the load chart's capacity for the boom angle and radius the operator has set over the wreck, and commit it against the salvage engineer's estimate plus the rigging.",
      why: "A crane on a barge loses capacity with every metre of radius and with every degree the barge lists as the load comes on, which is why the crane rules for barges and ASME B30.8 tie the chart to the barge as well as to the crane. The rigger reads the capacity at the actual radius and sets it against the estimate plus the slings and shackles, so the whole crew knows before the strain whether the margin is real or wishful.",
      gauge: { label: "CAPACITY AT RADIUS", speed: 0.7, green: [0.4, 0.57], readout: (t) => (t < 0.4 ? "under the estimate — no lift" : t <= 0.57 ? "inside the chart for this radius" : "past the chart — shorten the radius"), missNote: "Outside the band — read the capacity at the radius the boom is actually at, not the one it would be at with the barge level." },
    },
    {
      id: "pass-slings", kind: "drag", target: "bow-sling",
      title: "Pass the slings under the hull at the marked points",
      cue: "Hand the sling down to the skiff and see it passed under the hull at the salvage engineer's yellow marks, the eyes brought up either side to the hook.",
      why: "The marked points are where the salvage engineer expects the hull to carry its own weight: a sling passed forward of the keel or under a soft section cuts through fibreglass and drops the boat out of the slings in the air. The sling goes down to the skiff and under the hull by hand-line, never with anyone aboard the wreck, and the rigger watches it seat at the mark before the eyes come up to the master link.",
      drag: { to: "sling-point-bow", radius: 0.6, missNote: "Not at the mark — the sling has to seat at the yellow lift mark, not wherever it first touched the hull." },
    },
    {
      id: "shackle-up", kind: "turn", target: "hook-shackle",
      title: "Seat and mouse the shackle pin at the master link",
      cue: "Wind the shackle pin home through the sling eyes and the master link, then mouse it so nothing can back it out.",
      why: "The shackle at the master link joins every sling to the hook, and a pin that is not fully home carries the load on a few threads — which is how pins bend and let go. It is wound in until it seats and then moused with wire, because a lift that swings and twists as the hull breaks out of the mud will turn an unmoused pin loose a quarter turn at a time.",
      turn: { turns: 1.5, label: "SHACKLE PIN", readout: (t) => (t < 0.4 ? "pin started" : t < 0.95 ? "threads taking up" : "pin seated · moused") },
    },
    {
      id: "tag-lines", kind: "sequence", anyOrder: true,
      targets: ["tagline-bow", "tagline-stern"],
      itemNames: { "tagline-bow": "bow tag line made fast to the sling", "tagline-stern": "stern tag line made fast to the sling" },
      title: "Put a tag line on each end of the lift",
      cue: "Make a tag line fast to the bow and the stern slings and lead each back to the barge deck, clear of the fall zone.",
      why: "A hull coming out of the water turns and swings as the water drains out of her unevenly, and the only safe way to steady her is from a distance with a line. The tag lines are what let the rigger stand outside the fall zone and still control the load; without them, the instinct is to reach for the boat — which is how people end up under it.",
    },
    {
      id: "flag-zone", kind: "select", target: "fall-zone-flag",
      title: "Flag the fall zone and clear the skiff out from under",
      cue: "Raise the red flag on the rail to show a lift is live, and call the skiff crew out from under the boom tip.",
      why: "The fall zone is everywhere the load or the rigging could land if something parts, and on a lift over water it takes in the skiff that has just passed the slings. The flag is the visible signal to everyone on the barge and the skiff that the crane is about to take weight; the skiff backs off before the strain, not after the first creak.",
    },
    {
      id: "take-strain", kind: "track", target: "signal-radio", seconds: 6,
      title: "Signal the operator through a slow strain",
      cue: "On the crane radio, bring the hoist up slowly and hold the load reading steady in band while the slings seat and the hull begins to break out of the mud.",
      why: "A derelict held by mud suction and full of water weighs far more at the moment she breaks out than she will once she drains, so the strain is taken slowly and held, giving the water time to run out and the suction time to let go. The signal person keeps the load steady against the plan's figure and calls every change, because a snatch on the hoist is how slings are shock-loaded past what they are rated for.",
      track: { start: 0.14, green: [0.4, 0.58], rise: 0.58, fall: 0.44, drift: 0.12, label: "HOIST LOAD", readout: (v) => (v < 0.4 ? "slack — slings not seated" : v > 0.58 ? "snatching — ease the hoist" : "steady strain — draining") },
      holdBreakNote: "The load broke out of band — the hoist snatched or went slack. Bring it back to a slow steady strain and hold it there.",
    },
    {
      id: "tag-hold", kind: "hold", target: "tagline-stern", seconds: 5,
      title: "Hold the stern tag line as she breaks the surface",
      cue: "Keep a steady pull on the stern tag line from the barge deck as the hull clears the water, feeding it through your hands — never a turn round a hand or a cleat.",
      why: "As the hull breaks the surface, water pours out of her unevenly and she wants to swing; a steady pull on the tag line stops the swing before it starts. The line runs through open hands and is never wrapped, because if the load drops or swings hard the person holding a wrapped tag line goes with it over the side.",
      holdBreakNote: "Let go of the tag line as she broke the surface — the hull swung toward the barge. Take it up again and hold a steady pull.",
    },
    {
      id: "salvage-log", kind: "select", target: "salvage-log",
      title: "Log the lift and what she held",
      cue: "Log the lift: the load read against the estimate, the cut sling and the unmarked shackle taken out of service, the fuel sheen and the boom, the pump-out and the tide that set the skiff in.",
      why: "The salvage log is the record the removal is reported against: the load actually read versus the estimate tells the next job how far off an estimate can be, and the fuel recovered and the gear condemned are what the pollution report and the rigging loft need. A near miss with the skiff under the load goes in too — it is the kind of thing that happens again if the next crew does not know it happened here.",
    },
    {
      id: "crew-checkin", kind: "select", target: "crane-intercom",
      title: "Check in with the operator and the skiff crew",
      cue: "On the intercom and the skiff radio: the lift is landed, the gear condemned, and how everyone is after a hull that fought the hoist and a skiff that drifted in.",
      why: "The operator in the cab and the deckhand in the skiff each saw a different part of the lift, and the check-in is where those pictures come together while they are fresh. It is also where a crew that just had a skiff drift under a loaded hook says so out loud — a moment like that deserves more than a nod, and the union's member assistance line is there for what does not get said on the radio.",
    },
  ],

  interrupts: [
    {
      id: "hull-holding-water",
      kind: "Load above the estimate",
      after: "take-strain", delay: 2, seconds: 14,
      alert: "The load reading is climbing past the salvage engineer's estimate and the hull has not moved — she is still full of water and holding in the mud.",
      cue: "Hold the hoist where it is and start the salvage pump on deck to draw the water out of her into the barge's holding tank.",
      target: "salvage-pump",
      why: "A load above the estimate with the hull still on the bottom is the wreck telling the crew she is heavier than planned — full of water and held by suction. The answer is to stop adding load and take weight out of her by pumping, into the holding tank because that water is oily, rather than hoisting harder and finding the limit of the slings or the chart by breaking something.",
      missNote: "The hoist kept coming up on a hull full of water; the load passed the chart before she broke out, the barge heeled toward the wreck, and the operator had to set her back down with the slings shock-loaded.",
      wrongNote: "The salvage pump — take the water out of her before any more load goes on the hoist.",
    },
    {
      id: "skiff-set-under-load",
      kind: "Tide sets the skiff in",
      after: "tag-hold", delay: 2, seconds: 14,
      alert: "The flood tide has caught the skiff and is setting her in toward the hull — she is drifting under the boom tip with the load coming clear of the water.",
      cue: "Sound the danger signal on the air horn so the skiff crew power clear and the operator holds the load.",
      target: "air-horn",
      why: "A skiff under a suspended load is two people in the fall zone with nowhere to go, and the tide does it quietly while every eye is on the hull. The horn stops everything at once: the operator holds, the skiff crew look up and power clear, and nobody has to wait for a radio call to get through.",
      missNote: "The skiff drifted under the lift with her crew watching the hull; a slab of rotten deck let go from the derelict and landed in the skiff beside the operator.",
      wrongNote: "The air horn — one signal stops the operator and moves the skiff at the same time.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 3.0, BRDV_ACCENT);

    // ------------------------------------------------------------ the water
    const water = box(g, 26, 0.02, 22, 0, 0.012, -4, 0xffffff, { rough: 0.15, metal: 0.4, cast: false });
    water.material = texturedMat(surfaceTexture((cx, w, h) => waterFace(cx, w, h, { base: "#0f2c33", mid: "#163a44" }), { repeat: 6, px: 512 }), { rough: 0.15, metal: 0.4, color: 0x7fa2ae });

    // --------------------------------------- the crane barge, deck at the pad
    const barge = salvageCraneBarge(g, 1, -1.88, 0, { ry: Math.PI / 2, boomAngle: 1.3, slew: Math.PI / 2, hookDrop: 12.8 });
    const { hook, hoistLine } = barge.userData.parts;
    const hookHome = hook.position.clone();
    // Gangway from the float to the barge deck, where the learner comes aboard.
    const gangway = box(g, 1.1, 0.06, 1.4, 0.8, 0.06, 4.1, 0x8d949b, { rough: 0.5, metal: 0.6, finish: "galvanised" });
    gangway.rotation.x = 0.06;

    // ---------------------------------------------- the derelict, sunk and listing
    const wreck = group(g, -3.0, -1.7, -5.2);
    wreck.rotation.x = 0.15;
    const derelict = derelictBoat(wreck, 0, 0, 0, { ry: Math.PI / 2 });
    const { slingPoints, fuelVent, cleats, hatch } = derelict.userData.parts;
    const bowPoint = slingPoints[0];
    reg(hits, bowPoint, "sling-point-bow");
    holoTag(g, "lift mark", -0.9, 0.55, -4.6, { css: BRDV_CSS, w: 0.2 });
    reg(hits, fuelVent, "vent-sheen");
    const sheen = box(g, 1.6, 0.01, 1.0, -5.6, 0.03, -3.9, 0x6fa0b8, { rough: 0.1, metal: 0.9, emissive: 0x3a4a7a, ei: 0.3, cast: false });
    const rot = box(g, 0.5, 0.05, 0.5, 1.0, 0.6, -5.2, 0x7a6a52, { rough: 0.95, emissive: 0x2a1a08, ei: 0.3 });
    reg(hits, rot, "deck-rot");
    const cleatHit = box(g, 0.4, 0.3, 0.4, 1.0, 0.75, -5.2, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "rig to her bow cleat?", 1.0, 1.15, -5.0, { css: "#d2312b", w: 0.42 });
    reg(hits, cleatHit, "rig-to-cleat");
    const boardHit = box(wreck, 1.6, 0.4, 2.6, 0, 2.7, 0, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "step aboard the wreck?", -3.0, 1.5, -4.9, { css: "#d2312b", w: 0.44 });
    reg(hits, boardHit, "board-derelict");
    void cleats; void hatch;

    // --------------------------------------------------- the skiff and boom
    const skiffBoat = skiff(g, 5.0, -0.3, -5.5, { ry: -Math.PI / 2 + 0.15, livery: { fleetName: "HARBOR WORKS", unitNumber: "SK-7" } });
    const skiffHome = skiffBoat.position.clone();
    const skiffHand = standingFigure(skiffBoat, 0, -0.9, { ry: Math.PI, vest: 0xf06a2b, helmet: 0xf1f3f4, gloves: true, atStation: true });
    skiffHand.position.y = 0.8;
    holoTag(skiffBoat, "IBU skiff deckhand", 0, 2.7, -0.9, { css: BRDV_CSS, w: 0.36 });
    const ring = [];
    for (let i = 0; i <= 16; i++) { const a = (i / 16) * Math.PI * 2; ring.push([-3.0 + Math.cos(a) * 5.0, 0.08, -5.35 + Math.sin(a) * 1.85]); }
    const boomRing = hose(g, ring, 0.11, 0xf2c14b, { steps: 48, rough: 0.6 });
    boomRing.visible = false;
    const reel = group(g, 1.9, 0.03, -2.6);
    const drum = cyl(reel, 0.35, 0.35, 0.7, 0, 0.45, 0, 0xf2c14b, { rough: 0.6, seg: 14 });
    drum.rotation.z = Math.PI / 2;
    box(reel, 0.9, 0.1, 0.5, 0, 0.05, 0, 0x2b3138, { rough: 0.6, metal: 0.4 });
    const boomEnd = group(g, 2.3, 0.1, -3.2);
    box(boomEnd, 0.5, 0.22, 0.22, 0, 0.1, 0, 0xf2c14b, { rough: 0.6 });
    holoTag(boomEnd, "boom end", 0, 0.4, 0, { css: BRDV_CSS, w: 0.22 });
    reg(hits, boomEnd, "boom-end");
    const anchor = group(g, 2.3, 0.05, -5.7);
    const buoy = cyl(anchor, 0.22, 0.26, 0.4, 0, 0.18, 0, 0xe0592a, { rough: 0.5, seg: 12 });
    holoTag(anchor, "anchor buoy", 0, 0.6, 0, { css: BRDV_CSS, w: 0.26 });
    reg(hits, anchor, "boom-anchor");

    // ------------------------------------------------------- deck: PPE rack
    const rack = group(g, 1.9, 0.03, 2.9, -0.4);
    cyl(rack, 0.025, 0.025, 1.4, 0, 0.7, 0, 0x8a949d, { rough: 0.45, metal: 0.7, seg: 8 });
    box(rack, 0.5, 0.03, 0.03, 0, 1.3, 0, 0x8a949d, { rough: 0.45, metal: 0.7 });
    const vest = group(rack, 0.14, 1.02, 0);
    box(vest, 0.26, 0.4, 0.1, 0, 0, 0, 0xf06a2b, { rough: 0.8 });
    box(vest, 0.26, 0.05, 0.11, 0, 0.08, 0, 0xdfe8ee, { rough: 0.6, emissive: 0xdfe8ee, ei: 0.3 });
    holoTag(rack, "work vest — PFD", 0.14, 1.5, 0, { css: BRDV_CSS, w: 0.3 });
    reg(hits, vest, "work-vest");
    const hat = group(rack, -0.14, 1.2, 0.02);
    cyl(hat, 0.12, 0.14, 0.12, 0, 0, 0, 0xf1f3f4, { rough: 0.5, seg: 14 });
    holoTag(hat, "hard hat", 0, 0.2, 0, { css: BRDV_CSS, w: 0.2 });
    reg(hits, hat, "hard-hat");

    // ------------------------------------------------------ the plan board
    const drawPlan = (cx, w, h, done) => {
      cx.fillStyle = "#170f08"; cx.fillRect(0, 0, w, h); cx.fillStyle = done ? "#59c97b" : BRDV_CSS; cx.fillRect(0, 0, w, 6);
      cx.font = `600 ${Math.round(h * 0.1)}px 'Barlow Condensed', Arial, sans-serif`; cx.textAlign = "left"; cx.textBaseline = "middle";
      cx.fillStyle = "#f6e2cc"; cx.fillText("SALVAGE PLAN — DERELICT", w * 0.05, h * 0.12);
      cx.font = `${Math.round(h * 0.066)}px Arial, sans-serif`; cx.fillStyle = "#fbefe2";
      ["Vessel: sunk to cabin top, listing, on mud", "Weight: salvage engineer's estimate", "Lift points: yellow marks, fwd and aft",
        "Radius and capacity: crane load chart", "Tide window: per the tide table on the plan", "Fall zone: under the boom tip, flagged",
        "Skiff: IBU deckhand, boom and slings"].forEach((l, i) => cx.fillText(l, w * 0.05, h * (0.26 + i * 0.105)));
    };
    const plan = holoPanel(g, 0.84, 0.56, -1.3, 1.4, 2.4, (cx, w, h) => drawPlan(cx, w, h, false), { ry: 0.35, accent: BRDV_ACCENT });
    reg(hits, plan, "salvage-plan");

    // ----------------------------------------------------- the sling rack
    const slings = group(g, 1.3, 0.03, 0.6, -0.5);
    for (const sx of [-0.45, 0.45]) cyl(slings, 0.025, 0.025, 1.1, sx, 0.55, 0, 0x8a949d, { rough: 0.45, metal: 0.7, seg: 8 });
    box(slings, 1.0, 0.04, 0.04, 0, 1.08, 0, 0x8a949d, { rough: 0.45, metal: 0.7 });
    const bowSling = group(slings, -0.28, 0, 0);
    hose(bowSling, [[0, 1.06, 0], [-0.06, 0.7, 0.03], [0, 0.4, 0.04], [0.06, 0.7, 0.03], [0, 1.06, 0]], 0.03, 0x7b4fc8, { steps: 14, rough: 0.8 });
    holoTag(bowSling, "round sling", 0, 1.25, 0, { css: BRDV_CSS, w: 0.24 });
    reg(hits, bowSling, "bow-sling");
    const cutSling = group(slings, 0.02, 0, 0);
    hose(cutSling, [[0, 1.06, 0], [-0.06, 0.66, 0.03], [0, 0.34, 0.04], [0.06, 0.66, 0.03], [0, 1.06, 0]], 0.03, 0x7b4fc8, { steps: 14, rough: 0.8 });
    const cut = box(cutSling, 0.08, 0.06, 0.08, 0.05, 0.6, 0.04, 0xf2e6c8, { rough: 0.9, emissive: 0x3a2a10, ei: 0.3 });
    reg(hits, cut, "sling-cut");
    const shackle = group(slings, 0.3, 0.8, 0.03);
    torus(shackle, 0.06, 0.018, 0, 0, 0, 0xb9bfc5, { rough: 0.3, metal: 0.85, seg: 6, seg2: 14 });
    reg(hits, shackle, "shackle-unmarked");

    // ------------------------------------------------- load chart repeater
    const chart = group(g, -0.9, 0.03, 0.9);
    cyl(chart, 0.04, 0.05, 1.0, 0, 0.5, 0, 0x8a949d, { rough: 0.45, metal: 0.7, seg: 8 });
    const dial = box(chart, 0.36, 0.26, 0.05, 0, 1.12, 0, 0x101820, { rough: 0.4, emissive: 0x0d1c24, ei: 0.4 });
    dial.rotation.x = -0.35;
    const needle = box(chart, 0.012, 0.11, 0.012, 0, 1.12, 0.04, 0xd2312b, { rough: 0.4 });
    holoTag(chart, "load chart — capacity at radius", 0, 1.42, 0, { css: BRDV_CSS, w: 0.5 });
    reg(hits, chart, "load-chart");

    // ------------------------- master link and shackle at the hook, slings down
    const master = group(g, -3.8, 0.5, -4.58);
    torus(master, 0.1, 0.025, 0, 0, 0, 0xb9bfc5, { rough: 0.3, metal: 0.85, seg: 6, seg2: 16 });
    const pin = cyl(master, 0.014, 0.014, 0.16, 0, -0.12, 0, 0xd2312b, { rough: 0.4, seg: 8 });
    pin.rotation.z = Math.PI / 2;
    holoTag(master, "master link shackle", 0, 0.3, 0, { css: BRDV_CSS, w: 0.36 });
    reg(hits, master, "hook-shackle");
    const legBow = hose(g, [[-3.8, 0.42, -4.6], [-2.2, 0.3, -4.9], [-0.9, 0.1, -5.2]], 0.03, 0x7b4fc8, { steps: 10, rough: 0.8 });
    const legStern = hose(g, [[-3.8, 0.42, -4.6], [-4.5, 0.3, -4.9], [-5.1, 0.1, -5.2]], 0.03, 0x7b4fc8, { steps: 10, rough: 0.8 });
    legBow.visible = false; legStern.visible = false;

    // ------------------------------------------------------------ tag lines
    const tagBow = group(g, 0.9, 0.05, -3.0);
    for (let i = 0; i < 2; i++) torus(tagBow, 0.13 - i * 0.03, 0.014, 0, 0.02 + i * 0.03, 0, 0x2f8f5a, { rough: 0.85, seg: 6, seg2: 16 }).rotation.x = Math.PI / 2;
    holoTag(tagBow, "bow tag line", 0, 0.3, 0, { css: BRDV_CSS, w: 0.26 });
    reg(hits, tagBow, "tagline-bow");
    const tagStern = group(g, -4.0, 0.05, -3.0);
    for (let i = 0; i < 2; i++) torus(tagStern, 0.13 - i * 0.03, 0.014, 0, 0.02 + i * 0.03, 0, 0x2f8f5a, { rough: 0.85, seg: 6, seg2: 16 }).rotation.x = Math.PI / 2;
    holoTag(tagStern, "stern tag line", 0, 0.3, 0, { css: BRDV_CSS, w: 0.26 });
    reg(hits, tagStern, "tagline-stern");
    const lineBow = hose(g, [[0.9, 0.1, -3.0], [0.1, 0.3, -4.2], [-0.9, 0.2, -5.1]], 0.012, 0x2f8f5a, { steps: 8, rough: 0.85 });
    const lineStern = hose(g, [[-4.0, 0.1, -3.0], [-4.6, 0.3, -4.2], [-5.1, 0.2, -5.1]], 0.012, 0x2f8f5a, { steps: 8, rough: 0.85 });
    lineBow.visible = false; lineStern.visible = false;

    // ------------------------------------------------ fall-zone flag and horn
    const flag = group(g, -1.3, 0.03, -3.2);
    cyl(flag, 0.02, 0.02, 1.6, 0, 0.8, 0, 0x8a949d, { rough: 0.45, metal: 0.7, seg: 8 });
    const cloth = box(flag, 0.36, 0.24, 0.01, 0.19, 0.5, 0, 0xd2312b, { rough: 0.8, emissive: 0x5a0808, ei: 0.3 });
    holoTag(flag, "fall-zone flag", 0, 1.8, 0, { css: BRDV_CSS, w: 0.28 });
    reg(hits, flag, "fall-zone-flag");
    const underHit = box(g, 1.4, 1.2, 1.0, -3.4, 0.6, -3.1, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "stand under the boom tip?", -3.4, 1.45, -2.9, { css: "#d2312b", w: 0.46 });
    reg(hits, underHit, "under-suspended-load");
    const bightHit = box(g, 0.5, 0.5, 0.5, -0.2, 0.55, -3.45, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "guide the sling by hand?", 0.1, 0.95, -3.4, { css: "#d2312b", w: 0.44 });
    reg(hits, bightHit, "hand-in-sling-bight");
    const horn = group(g, 1.2, 0.03, -2.0);
    cyl(horn, 0.025, 0.025, 1.1, 0, 0.55, 0, 0x8a949d, { rough: 0.45, metal: 0.7, seg: 8 });
    cyl(horn, 0.03, 0.09, 0.22, 0, 1.18, 0.08, 0xd2312b, { rough: 0.5, seg: 12 }).rotation.x = Math.PI / 2;
    holoTag(horn, "air horn", 0, 1.45, 0, { css: BRDV_CSS, w: 0.2 });
    reg(hits, horn, "air-horn");

    // ---------------------------------------------- crane radio and pump
    const radioPost = group(g, 0.2, 0.03, -1.2);
    cyl(radioPost, 0.025, 0.025, 1.0, 0, 0.5, 0, 0x8a949d, { rough: 0.45, metal: 0.7, seg: 8 });
    box(radioPost, 0.08, 0.2, 0.05, 0, 1.1, 0, 0x2b3138, { rough: 0.5 });
    const radioScreen = box(radioPost, 0.06, 0.05, 0.005, 0, 1.15, 0.028, 0x0d1c24, { rough: 0.3, emissive: 0x2a6f8f, ei: 0.6 });
    holoTag(radioPost, "crane radio — signal", 0, 1.4, 0, { css: BRDV_CSS, w: 0.36 });
    reg(hits, radioPost, "signal-radio");
    const pump = group(g, -0.9, 0.03, -2.4);
    box(pump, 0.7, 0.45, 0.45, 0, 0.23, 0, 0x2f5f8f, { rough: 0.5, metal: 0.4, finish: "painted" });
    const pumpLamp = box(pump, 0.08, 0.08, 0.02, 0.2, 0.4, 0.23, 0x5a1a14, { rough: 0.4, emissive: 0x3a0a08, ei: 0.4 });
    holoTag(pump, "salvage pump", 0, 0.7, 0, { css: BRDV_CSS, w: 0.26 });
    reg(hits, pump, "salvage-pump");
    const suction = hose(g, [[-0.9, 0.3, -2.6], [-1.9, 0.4, -3.8], [-3.0, 0.9, -5.0]], 0.04, 0x1b1e22, { steps: 10, rough: 0.7 });
    suction.visible = false;

    // ------------------------------------------ intercom and the salvage log
    const icom = group(g, -1.1, 0.03, 1.6);
    cyl(icom, 0.025, 0.025, 1.1, 0, 0.55, 0, 0x8a949d, { rough: 0.45, metal: 0.7, seg: 8 });
    box(icom, 0.16, 0.22, 0.08, 0, 1.2, 0, 0x2b3138, { rough: 0.5, metal: 0.4 });
    const icomLamp = box(icom, 0.04, 0.04, 0.02, 0, 1.28, 0.05, 0x59c97b, { emissive: 0x59c97b, ei: 1.0 });
    holoTag(icom, "crane intercom", 0, 1.45, 0, { css: BRDV_CSS, w: 0.28 });
    reg(hits, icom, "crane-intercom");
    const drawLog = (cx, w, h, rows, done) => {
      cx.fillStyle = "#170f08"; cx.fillRect(0, 0, w, h); cx.fillStyle = done ? "#59c97b" : BRDV_CSS; cx.fillRect(0, 0, w, 6);
      cx.font = `600 ${Math.round(h * 0.12)}px 'Barlow Condensed', Arial, sans-serif`; cx.textAlign = "left"; cx.textBaseline = "middle";
      cx.fillStyle = "#f6e2cc"; cx.fillText("SALVAGE LOG", w * 0.06, h * 0.15);
      cx.font = `${Math.round(h * 0.082)}px Arial, sans-serif`; cx.fillStyle = done ? "#e6f6ea" : "#fbefe2";
      rows.forEach((l, i) => cx.fillText(l, w * 0.06, h * (0.36 + i * 0.16)));
    };
    const log = holoPanel(g, 0.66, 0.46, 2.5, 1.35, 1.4, (cx, w, h) => drawLog(cx, w, h, ["Lift: —", "Gear: —", "Pollution: —", "Remarks: —"], false), { ry: -0.7, accent: BRDV_ACCENT });
    reg(hits, log, "salvage-log");

    // ------------------------------------------------------------- crew
    const foreman = standingFigure(g, -1.6, 3.3, { ry: 0.6, vest: 0xf06a2b, helmet: 0xf1f3f4, gloves: true });
    holoTag(foreman, "salvage foreman", 0, 1.95, 0, { css: BRDV_CSS, w: 0.3 });
    const rigger = standingFigure(g, 3.1, -1.2, { ry: -2.4, vest: 0xf06a2b, helmet: 0xf2c14b, gloves: true });
    holoTag(rigger, "rigger", 0, 1.95, 0, { css: BRDV_CSS, w: 0.18 });

    const waterTex = water.material.map;
    return {
      hits,
      spawnLook: new THREE.Vector3(-1, 1.2, -4),
      onStep() {},
      onStepComplete(step) {
        if (step.id === "hull-survey") { rot.material = mat(0x5b4a3a, { rough: 0.95 }); }
        if (step.id === "boom-derelict") { boomRing.visible = true; boomEnd.visible = false; drum.material = mat(0x8a949d, { rough: 0.5, metal: 0.5 }); }
        if (step.id === "sling-inspection") { cut.material = mat(0x3a4046, { rough: 0.9 }); shackle.visible = false; }
        if (step.id === "pass-slings") { legBow.visible = true; legStern.visible = true; bowSling.visible = false; }
        if (step.id === "shackle-up") pin.material = mat(0xb9bfc5, { rough: 0.3, metal: 0.85 });
        if (step.id === "tag-lines") { lineBow.visible = true; lineStern.visible = true; }
        if (step.id === "flag-zone") cloth.position.y = 1.45;
        if (step.id === "take-strain") { wreck.position.y = -1.35; wreck.rotation.x = 0.08; }
        if (step.id === "tag-hold") { wreck.position.y = -0.7; wreck.rotation.x = 0; sheen.visible = false; }
        if (step.id === "salvage-log") {
          repaint(log.userData.face, (cx, w, h) => drawLog(cx, w, h, ["Lift: landed · load read vs estimate", "Gear: cut sling, unmarked shackle out", "Pollution: vent sheen boomed, pumped", "Remarks: hull held water · skiff set in"], true));
          repaint(plan.userData.face, (cx, w, h) => drawPlan(cx, w, h, true));
        }
        if (step.id === "crew-checkin") icomLamp.material = mat(0x4fd1ff, { emissive: 0x4fd1ff, ei: 1.2 });
      },
      onHazard() {},
      onInterrupt(it) {
        if (it.id === "hull-holding-water") { dial.material = mat(0x3a0c0a, { rough: 0.4, emissive: 0xf0645b, ei: 0.7 }); needle.rotation.z = 1.1; }
        if (it.id === "skiff-set-under-load") { skiffBoat.position.set(skiffHome.x - 2.2, skiffHome.y, skiffHome.z + 0.3); skiffBoat.rotation.y = -Math.PI / 2 + 0.5; }
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "hull-holding-water") { suction.visible = true; pumpLamp.material = mat(0x59c97b, { emissive: 0x59c97b, ei: 1.2 }); }
        if (it.id === "skiff-set-under-load") { skiffBoat.position.set(skiffHome.x + 1.2, skiffHome.y, skiffHome.z - 0.4); skiffBoat.rotation.y = -Math.PI / 2 + 0.15; }
      },
      animate(t, dt, session) {
        const step = session?.step;
        if (waterTex?.offset) { waterTex.offset.x = t * 0.004; waterTex.offset.y = t * 0.005; }
        const gg = session?.gauge;
        if (gg && !gg.committed && step?.id === "read-radius") needle.rotation.z = -1.2 + gg.t * 2.4;
        if (step?.id === "take-strain" && session.holding) {
          const v = session.track?.v ?? 0;
          hook.position.y = hookHome.y + v * 0.25; hoistLine.scale.y = 1 - v * 0.02;
          radioScreen.material = mat(v > 0.58 ? 0xf0645b : 0x59c97b, { emissive: v > 0.58 ? 0xf0645b : 0x59c97b, ei: 0.9 });
        }
        if (boomRing.visible) buoy.position.y = 0.18 + Math.sin(t * 1.3) * 0.03;
      },
    };
  },
};
