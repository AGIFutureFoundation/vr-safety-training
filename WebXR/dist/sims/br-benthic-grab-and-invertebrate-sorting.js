import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import { box, cyl, ball, group, repaint, mat, particles, signFace } from "../../../shared/kit.js";
import {
  stationPad, holoPanel, holoTag, standingFigure, instrument, reg,
  surfaceTexture, texturedMat, waterFace, deckPlateFace,
} from "../citykit.js";
import { workboat } from "../../../shared/fleet.js";
import { radio } from "../../../shared/toolkit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Benthic Grab & Invertebrate Sorting VR — SF Bay Restoration &
// Cleanup, Pack E (ecology, monitoring and community science).
//
// The afterdeck of a workboat — the fleet.js builder — on station over
// today's benthic monitoring point, and the learner is the technician who
// takes the grab sample, sieves it, sorts what comes up and gets it into
// custody before it degrades. Invertebrates are named only at the generic
// level this pack's rules require: a polychaete worm, an amphipod, a
// bivalve, never a specific listed species. Every sample this station
// handles moves under the same chain-of-custody discipline the sediment
// labs elsewhere in this programme use, built on EPA QA/G-5.

const BRBG_ACCENT = 0x7a8ac0;
const BRBG_CSS = "#7a8ac0";
const BRBG_GREEN = 0x59c97b;
const BRBG_AMBER = 0xe8b02e;
const BRBG_RED = 0xd2312b;

export const SIM_BR_BENTHIC_GRAB_AND_INVERTEBRATE_SORTING = {
  id: "br-benthic-grab-and-invertebrate-sorting",
  index: "349",
  domain: "Maritime & Ports",
  trade: "Benthic monitoring technician, taking grab samples from a workboat and sorting invertebrates for a restoration monitoring programme",
  category: "Maritime & Ports",
  district: "Maritime & Ports",
  weather: "fog",
  certification: "EPA QA/G-5 guidance for quality assurance project plans and the chain-of-custody practice built on it; USCG 46 CFR Part 160 lifesaving equipment, including personal flotation devices; USCG 33 CFR Part 83 Inland Navigation Rules for station-keeping while sampling; Regional Water Quality Control Board (RWQCB) monitoring conditions for the benthic community data; OSHA 29 CFR 1910.132 personal protective equipment, general requirements",
  name: "Benthic Grab & Invertebrate Sorting",
  title: simTitle("Benthic Grab & Invertebrate Sorting"),
  tagline: "The deck routine a benthic monitoring record depends on: the grab checked for a bent jaw before it goes over the rail, hands clear while it's cocked, the sample sieved and sorted at the generic level the reference calls for, a snag eased off rather than forced, a deckhand cleared before the grab swings inboard, every organism preserved inside the sort window, and every jar logged into custody before it leaves the deck",
  accent: BRBG_ACCENT,
  accentCss: BRBG_CSS,
  parSeconds: 310,
  footprint: 3.0,
  badge: { id: "clean-grab-clean-sort", name: "Clean Grab, Clean Sort", note: "The grab was checked and cocked correctly, hands stayed clear of the jaws, the snag was eased off, the deckhand was cleared before the swing, and every jar was logged inside the sort window" },

  supportLine: "your agency's employee assistance programme, with the vessel operator's own deck-safety line behind it",

  game: system({
    name: "Benthic Sampling Watch",
    currency: "GRABS",
    ranks: ["Deckhand Aide", "Benthic Technician", "Lead Technician", "Senior Technician", "Benthic Grab Certified"],
    badges: [
      { id: "true-grab", name: "True Grab", note: "The jaw checked and the tension cocked correctly before the first cast", test: AWARD.stepClean("cock-grab-dial") },
      { id: "clean-deck", name: "Clean Deck", note: "Never put a hand near the live jaws, never dumped a sieve unsorted, never let the sort window lapse", test: AWARD.safe },
      { id: "held-the-window", name: "Held The Window", note: "The sort window landed inside the correct band, first time", test: AWARD.precise(0.7) },
    ],
    challenges: [
      { id: "clean-cast", name: "Clean Cast", note: "No corrections across the whole cast", test: AWARD.clean },
      { id: "steady-watch", name: "Steady Watch", note: "Held the winch scan in band through the whole retrieval", test: AWARD.unbroken },
      { id: "logged-fast", name: "Logged Fast", note: "Sample closed out inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "hands-near-jaws": "You reached toward the grab's jaws while it was still cocked and live. A cocked benthic grab closes the instant its trigger plate touches bottom, with enough force to take a hand off at the fingers, and there is no such thing as a quick, careful reach near a live jaw — hands stay clear of it from the moment it's cocked until it's confirmed closed and back on deck.",
    "skip-tension-check": "You sent the grab over the rail without checking the tension latch first. A grab that isn't cocked to the right tension either fires early, on the way down, and comes up empty, or doesn't fire hard enough to actually seal on the bottom — either way the cast is wasted, and the only way to know which one you'll get is to check the latch before it ever leaves the deck.",
    "toss-fines-overboard": "You dumped the sieve washings straight back overboard without checking them for organisms first. The fine material left in the sieve after the coarse sort is exactly where the smaller invertebrates end up, and tipping it over the rail because it looks like plain mud throws away the part of the sample the survey actually needs counted.",
    "skip-preservative-window": "You let the sorted organisms sit out past the sort window before getting them into preservative. Soft-bodied invertebrates start breaking down the moment they're out of cold seawater, and a specimen that degrades before it's preserved is a specimen the lab can no longer identify with confidence — the window on the clock is what the organisms can actually tolerate, not a suggestion to get to it when there's time.",
  },

  lateNotes: {
    "sort-clock": "Nothing to read yet — the sample has to actually be sorted before there's a preservation window to watch.",
    "custody-log": "Nothing to log yet — nothing has been sampled or handed off worth an entry.",
  },

  interrupts: [
    {
      id: "grab-snags-bottom-debris",
      kind: "The winch cable snags on submerged debris during retrieval",
      after: "winch-watch", delay: 2, seconds: 14,
      alert: "The winch cable has snagged on something on the bottom, and the tension gauge just jumped hard.",
      cue: "Signal the winch operator to stop hauling immediately — do not let it keep pulling against the snag.",
      target: "winch-stop-signal",
      why: "A winch that keeps hauling against a genuine snag either parts the cable under load or drags the grab sideways into whatever it's caught on, and from the winch controls alone there's no way to tell what's actually happened on the bottom — the stop signal is what gets the tension eased off before the cable itself becomes the next thing that fails.",
      missNote: "The winch kept hauling against the snag instead of stopping — exactly the load a parted cable or a dragged grab comes from.",
      wrongNote: "The winch stop signal — that's the one call that gets the tension eased off before the cable takes the strain.",
    },
    {
      id: "deckhand-in-swing-radius",
      kind: "A deckhand walks into the grab's swing radius as it comes inboard",
      after: "winch-watch", delay: 3, seconds: 14,
      alert: "A deckhand has walked into the swing radius just as the grab is coming inboard over the rail.",
      cue: "Call the swing stop immediately and hold the grab outboard until the deckhand is clear — do not let it swing over anyone.",
      target: "deck-hailer",
      why: "A benthic grab full of wet sediment swinging inboard on a winch cable is a load like any other overhead load, and a deckhand who doesn't see it coming has no way to know they need to move — the swing stop is what holds the load outboard until the deck is actually clear, the same rule that keeps anyone from walking under any other suspended load on this vessel.",
      missNote: "The grab kept swinging inboard while the deckhand was still in its path — exactly the moment an overhead load rule exists to prevent.",
      wrongNote: "The deck hailer — that's the one call that holds the load until the deckhand is actually clear.",
    },
  ],

  steps: [
    {
      id: "ppe-brief", kind: "sequence", anyOrder: true,
      targets: ["pfd-on", "gloves-on", "eye-protection-on"],
      itemNames: { "pfd-on": "PFD on and buckled", "gloves-on": "wet-work gloves on", "eye-protection-on": "eye protection on" },
      title: "Gear up before the deck work starts",
      cue: "Before working the afterdeck: PFD on and buckled, wet-work gloves on, eye protection on.",
      why: "The afterdeck is wet the whole shift between the wash-down hose and the sieve, and a PFD worn on deck the entire time is the same rule every vessel in this programme runs on — the gloves and eye protection are what keep the sediment and the wash-down spray out of a cut or an eye while the sample is actually being processed.",
    },
    {
      id: "station-position-board", kind: "select", target: "station-position-board",
      title: "Read today's station plan",
      cue: "Read the station board: today's grab point, the replicate count, and the sort reference for this stretch of the Bay.",
      why: "A benthic survey only means something if the grab actually lands where the monitoring plan says it should, and reading the station board before the vessel is even holding position is what keeps today's cast comparable to every other cast ever taken at this same point.",
    },
    {
      id: "gear-check", kind: "find", noHint: true,
      targets: ["bent-jaw", "torn-sieve-mesh"],
      itemNames: { "bent-jaw": "the grab's jaw, bent at one tooth", "torn-sieve-mesh": "the sieve, torn along one seam" },
      itemNotes: {
        "bent-jaw": "A bent tooth keeps the jaws from sealing flush on the bottom, and a grab that doesn't seal comes up with half its sample already washed out through the gap — found now, on deck, it's a swap; found after the cast it's a lost sample.",
        "torn-sieve-mesh": "A torn seam lets exactly the smallest organisms the sort is looking for wash straight through — found now it's a patch, found mid-sort it's data that never made it into the tray.",
      },
      title: "Check the gear before the first cast",
      cue: "Check the grab and the sieve on deck before either one goes anywhere near the water.",
      why: "The grab and the sieve are the two pieces of equipment this whole sample depends on, and finding a bent jaw or a torn seam now, before the first cast, costs nothing — finding either one after the sample is already in the water costs the cast entirely.",
    },
    {
      id: "cock-grab-dial", kind: "turn", target: "cock-grab-dial",
      title: "Cock the grab to today's tension setting",
      cue: "Turn the tension latch to today's setting before the grab goes over the rail — hands clear the moment it's cocked.",
      turn: { turns: 0.6, label: "TENSION LATCH" },
      why: "The tension setting is what makes the jaws close hard enough to seal on the bottom without firing early on the way down, and it has to be set correctly before the grab is live — the moment this dial is turned, the jaws are cocked and hands come off the mechanism for good until it's back on deck and confirmed closed.",
    },
    {
      id: "deploy-grab", kind: "drag", target: "grab-sampler",
      title: "Deploy the grab to the winch",
      cue: "Drag the grab sampler from the rail rack out to the winch hook and confirm it's latched on before it goes over the side.",
      why: "A grab that isn't actually latched to the winch hook is a grab that either doesn't go anywhere or drops free the moment it's lifted, and confirming the latch before it clears the rail is what turns 'attached' from an assumption into something checked.",
      drag: { to: "winch-hook-socket", radius: 0.4, missNote: "Not latched to the hook — the grab has to actually connect, not just sit near it." },
    },
    {
      id: "lower-retrieve-checklist", kind: "sequence",
      targets: ["winch-lowered", "jaws-closed-confirmed", "winch-hauled"],
      itemNames: { "winch-lowered": "winch lowered to the bottom", "jaws-closed-confirmed": "jaws confirmed closed on the readout", "winch-hauled": "winch hauling the grab back up" },
      outOfOrderNote: "Confirm the jaws are closed before hauling — a haul started on a grab that never actually closed comes up with nothing in it.",
      title: "Lower, confirm and haul in order",
      cue: "Lower the winch to the bottom, confirm the jaws closed on the readout, then haul the grab back up.",
      why: "The readout is the only way to know from the deck whether the jaws actually closed on the bottom or just skated across it, and hauling before that confirmation is how a crew spends the whole retrieval only to find an empty grab on deck — checking the readout first is what makes the haul worth doing at all.",
    },
    {
      id: "winch-watch", kind: "track", target: "winch-cable", seconds: 6,
      title: "Scan the winch as it comes up",
      cue: "Hold a steady scan on the winch cable and tension gauge as the grab is hauled in — a snag or a swing-radius problem has to be caught the moment it shows.",
      track: { start: 0.13, green: [0.4, 0.62], rise: 0.5, fall: 0.42, drift: 0.12, label: "WINCH SCAN", readout: (v) => (v < 0.4 ? "scanning too fast — early tension spike missed" : v > 0.62 ? "scanning too slow — inboard swing missed" : "retrieval scanned clean") },
      why: "A winch hauled without anyone actually watching the cable is a winch that only gets noticed once something's already wrong, and a scan that rushes past the early tension spike or drags past the point the grab swings inboard is exactly how a snag or a deckhand in the swing radius goes uncaught until it's too late to matter.",
      holdBreakNote: "The scan lost the winch before the retrieval finished — steady it and pick the pass back up.",
    },
    {
      id: "sieve-rinse-hold", kind: "hold", target: "sieve-station", seconds: 5,
      title: "Hold the sieve steady under the wash-down hose",
      cue: "Hold the sieve steady under the hose while the sample is rinsed clean of loose mud — a sieve that's moving loses material over its own edge.",
      why: "Rinsing separates the organisms and shell material from the loose sediment, and a sieve that tips or shifts mid-rinse loses exactly the material the sort depends on over its own edge — holding it steady is what keeps the rinse from undoing what the grab and the haul just spent the whole cast collecting.",
      holdBreakNote: "The sieve slipped before the rinse finished — steady it and hold it through to the end of the wash.",
    },
    {
      id: "sort-clock", kind: "gauge", target: "sort-clock",
      title: "Preserve the sort inside the window",
      cue: "Watch the sort clock and get the sorted organisms into preservative once it reads inside the window — not before sorting is finished, and not past the window either.",
      gauge: { label: "SORT WINDOW", speed: 0.55, green: [0.46, 0.64], readout: (t) => (t < 0.46 ? "too early — sorting not finished yet" : t <= 0.64 ? "inside the window — preserve now" : "past the window — preserve immediately"), missNote: "Off the band. The sort window has to actually be read and preserved on, not guessed at." },
      why: "Preserving too early loses organisms that haven't been sorted yet, and preserving too late is exactly how a soft-bodied specimen degrades past the point the lab can identify it — the window on the clock is what these organisms can actually tolerate, not a pace that just feels reasonable.",
    },
    {
      id: "sort-table", kind: "select", target: "sort-table",
      title: "Sort the sample at the sort table",
      cue: "Sort what came up: a polychaete worm, an amphipod, a bivalve — at the generic level the reference calls for.",
      why: "The benthic community record this survey builds is a count of broad groups, not a species list, and sorting at the level the reference actually specifies is what keeps this cast comparable to every other cast in the programme rather than a one-off identification exercise nobody downstream can use.",
    },
    {
      id: "label-jar", kind: "drag", target: "sample-jar",
      title: "Label the jar and place it in custody",
      cue: "Drag the labeled sample jar into the custody rack once it's sealed.",
      why: "A jar that isn't in the custody rack the moment it's sealed is a jar that can wander off the deck without anyone noticing, and moving it straight from the sort table into the rack is what keeps this sample's chain of custody unbroken from the moment it leaves the sieve.",
      drag: { to: "custody-rack-socket", radius: 0.4, missNote: "Not in the rack — the jar has to actually sit in custody, not just near it." },
    },
    {
      id: "custody-log", kind: "select", target: "custody-log",
      title: "Log the chain-of-custody entry",
      cue: "Log the entry: station, replicate number, jar ID, and the time it went into the rack.",
      why: "EPA QA/G-5's chain-of-custody practice only works if the log entry happens the moment the jar is racked, and a sample that sits in the rack for an hour before the log catches up is an hour this record can't actually account for if anyone downstream asks where the sample was.",
    },
    {
      id: "closing-stow", kind: "sequence",
      targets: ["gear-rinsed", "grab-stowed", "deck-secured"],
      itemNames: { "gear-rinsed": "grab and sieve rinsed clean", "grab-stowed": "grab stowed in its rack", "deck-secured": "deck secured for transit" },
      outOfOrderNote: "Rinse the gear before stowing it — stowing a grab still caked in sediment just moves the mess into the rack with it.",
      title: "Stow the gear in order",
      cue: "Rinse the grab and sieve, stow the grab in its rack, then secure the deck for transit to the next station.",
      why: "A deck that isn't secured before the vessel gets underway is a deck where loose gear becomes a hazard the moment the boat takes its first wake, and rinsing before stowing is what keeps tomorrow's first cast starting from clean equipment instead of yesterday's dried sediment.",
    },
    {
      id: "crew-checkin", kind: "select", target: "deck-radio",
      title: "Check in with the wheelhouse",
      cue: "On the working channel: the cast is complete, the snag and the swing-radius call are both handled, and how the crew is doing after a cast with two interruptions in it.",
      why: "A cast with a snag and a swing-radius call both in it is a cast the whole deck crew spent more alert than a routine grab, and the check-in is where that gets acknowledged directly — it's also where the technician's own read on a tense cast gets a place to go besides staying with them at the sort table.",
    },
    {
      id: "closing-log", kind: "select", target: "custody-log",
      title: "Close out the sampling log",
      cue: "Close the log: the station worked, the sort complete, custody unbroken, and the deck secured for the next station.",
      why: "The closing entry is what turns today's individual casts and holds into the record the monitoring programme's own review is actually built from — a log closed out completely, in order, is the difference between a benthic survey that can show exactly how a sample was handled and one that raises a question nobody on this deck can answer months later.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 3.0, BRBG_ACCENT);

    // ------------------------------------------------------------- the water
    const water = box(g, 26, 0.02, 22, 0, 0.05, -6, 0xffffff, { rough: 0.14, metal: 0.22, cast: false });
    water.material = texturedMat(surfaceTexture((cx, w, h) => waterFace(cx, w, h, { base: "#0e2733", mid: "#153847", crest: 220 }), { repeat: 5, px: 512 }), { rough: 0.14, metal: 0.22, color: 0x8fb4c8 });
    const wave = particles(g, 16, 0xbfe6f2, { size: 0.03, life: 0.9, additive: false, opacity: 0.26 });
    wave.position.set(0, 0.06, -6);

    // -------------------------------------------------------------- the workboat
    const DECK = 0.41;
    const wb = workboat(g, 0, -0.79, -1.2, { ry: Math.PI, livery: { fleetName: "BAY MONITOR", unitNumber: "MM-2" } });
    const { davit } = wb.userData.parts;

    // ---------------------------------------------------------------- the floor
    const deckTex = surfaceTexture((cx, w, h) => deckPlateFace(cx, w, h, { base: "#2a333b", base2: "#1e262d" }), { repeat: 3, px: 256 });
    const deckPatch = box(g, 2.2, 0.01, 2.6, 0, DECK + 0.001, 0.4, 0x2a333b, { rough: 0.6, metal: 0.4, cast: false });
    deckPatch.material = texturedMat(deckTex, { rough: 0.6, metal: 0.4, color: 0x9aa4ac });

    // ---------------------------------------------------------------- crew
    const deckTech = standingFigure(g, -0.9, 0.6, { ry: 1.3, cloth: 0x3f4a55, vest: 0xe8b02e, helmet: false, gloves: true, atStation: true });
    deckTech.position.y = DECK;
    holoTag(deckTech, "benthic technician", 0, 1.95, 0, { css: BRBG_CSS, w: 0.34 });

    // -------------------------------------------------------------- deckhand, hidden until interrupt
    const deckhandGrp = group(g, -2.4, 0, -1.6, 0.6);
    const deckhand = standingFigure(deckhandGrp, 0, 0, { cloth: 0x2b3138, vest: 0xe8b02e, helmet: true, atStation: true });
    void deckhand;
    deckhandGrp.position.y = DECK;
    deckhandGrp.visible = false;
    const deckhandHome = deckhandGrp.position.clone();
    const deckhandDangerSpot = new THREE.Vector3(0.4, DECK, 1.0);

    // -------------------------------------------------------------- the grab sampler
    const grabHomeGrp = group(g, 1.2, DECK, 0.4);
    box(grabHomeGrp, 0.4, 0.06, 0.4, 0, 0.03, 0, 0x3a4048, { rough: 0.6, metal: 0.3 });
    const grabGrp = group(grabHomeGrp, 0, 0.08, 0);
    for (const sx of [-1, 1]) box(grabGrp, 0.05, 0.35, 0.2, sx * 0.12, 0.18, 0, 0x2b3138, { rough: 0.5, metal: 0.5 });
    box(grabGrp, 0.3, 0.06, 0.22, 0, 0.02, 0, 0x8a949d, { rough: 0.5, metal: 0.5 });
    holoTag(grabHomeGrp, "grab sampler — rail rack", 0, 0.5, 0, { css: BRBG_CSS, w: 0.4 });
    reg(hits, grabGrp, "grab-sampler");
    const grabHome = grabGrp.getWorldPosition(new THREE.Vector3());
    const bentJaw = box(grabGrp, 0.06, 0.03, 0.03, -0.14, 0.36, 0.09, BRBG_RED, { rough: 0.6, cast: false });
    reg(hits, bentJaw, "bent-jaw");

    const winchHookSocket = group(g, 0, DECK + 1.9, 0.4);
    hits["winch-hook-socket"] = winchHookSocket;
    if (davit) holoTag(davit, "winch", 0, 0.3, 0, { css: BRBG_CSS, w: 0.2 });

    // -------------------------------------------------------------- winch cable / gauge
    const winchCable = cyl(g, 0.008, 0.008, 1.6, 0, DECK + 1.1, 0.4, 0xb0b4b8, { rough: 0.5, metal: 0.6, seg: 6 });
    reg(hits, winchCable, "winch-cable");
    const tensionGauge = instrument(g, 0.6, DECK + 0.5, 0.9, { color: 0x2b3138, idle: "0 kg", w: 0.1, d: 0.14 });
    holoTag(tensionGauge, "tension gauge", 0, 0.16, 0.05, { css: BRBG_CSS, w: 0.28 });

    const winchStopSignal = group(g, 0.9, DECK + 0.9, 1.0);
    cyl(winchStopSignal, 0.04, 0.08, 0.16, 0, 0, 0, 0xc8ced4, { rough: 0.4, metal: 0.5, seg: 12 }).rotation.x = Math.PI / 2;
    const winchStopBeacon = ball(winchStopSignal, 0.022, 0, 0.09, 0, BRBG_GREEN, { emissive: BRBG_GREEN, ei: 1.6, seg: 10 });
    holoTag(winchStopSignal, "winch stop signal", 0, 0.16, 0, { css: BRBG_CSS, w: 0.32 });
    reg(hits, winchStopSignal, "winch-stop-signal");

    // -------------------------------------------------------------- sieve station
    const sieveGrp = group(g, -0.6, DECK, 1.3);
    box(sieveGrp, 0.5, 0.5, 0.36, 0, 0.25, 0, 0x3a4048, { rough: 0.55, metal: 0.3 });
    const sieveMeshFace = cyl(sieveGrp, 0.24, 0.24, 0.03, 0, 0.52, 0, 0xc8ced4, { rough: 0.4, metal: 0.5, seg: 16, opacity: 0.7, transparent: true });
    holoTag(sieveGrp, "sieve station", 0, 0.62, 0, { css: BRBG_CSS, w: 0.3 });
    reg(hits, sieveGrp, "sieve-station");
    const tornMesh = box(sieveGrp, 0.08, 0.008, 0.02, 0.1, 0.52, 0.1, BRBG_RED, { rough: 0.6, cast: false });
    reg(hits, tornMesh, "torn-sieve-mesh");
    const hoseGrp = group(g, -0.9, DECK + 0.9, 1.1);
    cyl(hoseGrp, 0.02, 0.02, 0.5, 0, 0, 0, 0x1b1e23, { rough: 0.6, seg: 10 }).rotation.x = Math.PI / 2.4;

    // -------------------------------------------------------------- sort table
    const sortTableGrp = group(g, 0.8, DECK, 1.6);
    box(sortTableGrp, 0.7, 0.06, 0.5, 0, 0.5, 0, 0x6a5a45, { rough: 0.5 });
    for (const dx of [-0.28, 0.28]) box(sortTableGrp, 0.05, 0.5, 0.05, dx, 0.25, 0, 0x4a3f30, { rough: 0.6 });
    for (const [tx, tz, col] of [[-0.15, -0.1, 0x8a7a5a], [0.05, -0.1, 0xc8ced4], [0.2, 0.08, 0xdfe6ea]]) {
      ball(sortTableGrp, 0.03, tx, 0.54, tz, col, { rough: 0.6, seg: 10 });
    }
    holoTag(sortTableGrp, "sort table", 0, 0.66, 0, { css: BRBG_CSS, w: 0.26 });
    reg(hits, sortTableGrp, "sort-table");

    // -------------------------------------------------------------- sample jar & custody
    const jarGrp = group(g, 1.3, DECK, 1.85, 0.3);
    cyl(jarGrp, 0.05, 0.05, 0.12, 0, 0.06, 0, 0xdfe6ea, { rough: 0.3, metal: 0.1, opacity: 0.6, transparent: true });
    holoTag(jarGrp, "sample jar", 0, 0.18, 0, { css: BRBG_CSS, w: 0.24 });
    reg(hits, jarGrp, "sample-jar");
    const jarHome = jarGrp.position.clone();
    const custodyRack = group(g, 1.7, DECK, 0.7);
    box(custodyRack, 0.4, 0.3, 0.2, 0, 0.15, 0, 0x3a4048, { rough: 0.55, metal: 0.3 });
    for (let i = 0; i < 3; i++) cyl(custodyRack, 0.03, 0.03, 0.02, -0.12 + i * 0.12, 0.31, 0, 0x1b1e23, { rough: 0.6, seg: 10 });
    holoTag(custodyRack, "custody rack", 0, 0.4, 0, { css: BRBG_CSS, w: 0.28 });
    const custodySocket = group(g, 1.7, DECK + 0.31, 0.7);
    hits["custody-rack-socket"] = custodySocket;

    const custodyLog = holoPanel(g, 0.68, 0.5, 1.9, DECK + 1.15, 0.2, (cx, w, h) => drawLog(cx, w, h, ["Station: —", "Custody: —", "Sort: —", "Deck: —"], false), { ry: -0.4, accent: BRBG_ACCENT });
    function drawLog(cx, w, h, rows, done) {
      cx.fillStyle = "#0d1420"; cx.fillRect(0, 0, w, h); cx.fillStyle = done ? BRBG_GREEN : BRBG_CSS; cx.fillRect(0, 0, w, 6);
      cx.font = `600 ${Math.round(h * 0.12)}px 'Barlow Condensed', Arial, sans-serif`; cx.textAlign = "left"; cx.textBaseline = "middle";
      cx.fillStyle = "#e8ecf6"; cx.fillText("CUSTODY LOG", w * 0.06, h * 0.15);
      cx.font = `${Math.round(h * 0.082)}px Arial, sans-serif`; cx.fillStyle = done ? "#e6f6ea" : "#dce2f0";
      rows.forEach((l, i) => cx.fillText(l, w * 0.06, h * (0.36 + i * 0.16)));
    }
    reg(hits, custodyLog, "custody-log");

    // -------------------------------------------------------------- boards & controls
    const stationBoard = holoPanel(g, 0.94, 0.62, -1.9, DECK + 1.65, -0.9, (cx, w, h) => {
      cx.fillStyle = "#0d1420"; cx.fillRect(0, 0, w, h); cx.fillStyle = BRBG_CSS; cx.fillRect(0, 0, w, 6);
      cx.font = `600 ${Math.round(h * 0.095)}px 'Barlow Condensed', Arial, sans-serif`; cx.textAlign = "left"; cx.textBaseline = "middle";
      cx.fillStyle = "#e8ecf6"; cx.fillText("STATION PLAN — TODAY", w * 0.05, h * 0.12);
      cx.font = `${Math.round(h * 0.07)}px Arial, sans-serif`; cx.fillStyle = "#dce2f0";
      ["Grab point: per the monitoring plan", "Replicates: per the plan",
        "Sort reference: generic taxonomic groups", "Confirm before holding position"].forEach((l, i) => cx.fillText(l, w * 0.05, h * (0.28 + i * 0.15)));
    }, { ry: 0.4, accent: BRBG_ACCENT });
    reg(hits, stationBoard, "station-position-board");

    const cockDial = instrument(g, -1.4, DECK + 0.5, 0.2, { color: 0x2b3138, idle: "READY", w: 0.1, d: 0.14 });
    const cockKnob = cyl(cockDial, 0.022, 0.022, 0.025, 0, 0.03, 0.06, 0xc8ced4, { rough: 0.4, seg: 10 });
    cockKnob.rotation.x = Math.PI / 2;
    holoTag(cockDial, "tension latch", 0, 0.16, 0.05, { css: BRBG_CSS, w: 0.28 });
    reg(hits, cockDial, "cock-grab-dial");

    const handsNearJawsHazard = box(g, 0.4, 0.4, 0.3, 1.2, DECK + 0.4, 0.7, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "reach for the live jaws?", 1.2, DECK + 0.75, 0.7, { css: "#e8622a", w: 0.44 });
    reg(hits, handsNearJawsHazard, "hands-near-jaws");

    const skipTensionHazard = box(g, 0.4, 0.4, 0.3, -1.4, DECK + 0.9, 0.0, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "skip the latch check?", -1.4, DECK + 1.25, 0.0, { css: "#e8622a", w: 0.4 });
    reg(hits, skipTensionHazard, "skip-tension-check");

    const tossFinesHazard = box(g, 0.4, 0.4, 0.3, -0.9, DECK + 0.9, 2.0, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "tip the sieve over the rail?", -0.9, DECK + 1.25, 2.0, { css: "#e8622a", w: 0.48 });
    reg(hits, tossFinesHazard, "toss-fines-overboard");

    const sortClock = instrument(g, 0.4, DECK + 0.5, 2.0, { color: 0x2b3138, idle: "0 min", w: 0.1, d: 0.14 });
    holoTag(sortClock, "sort window", 0, 0.16, 0.05, { css: BRBG_CSS, w: 0.28 });
    reg(hits, sortClock, "sort-clock");
    const skipWindowHazard = box(g, 0.4, 0.4, 0.3, 0.4, DECK + 0.9, 2.3, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "let it sit past the window?", 0.4, DECK + 1.25, 2.3, { css: "#e8622a", w: 0.5 });
    reg(hits, skipWindowHazard, "skip-preservative-window");

    // -------------------------------------------------------------- radios & markers
    const deckRadio = radio(g, 1.6, DECK + 0.85, -0.4, { ry: 0.5 });
    holoTag(g, "deck channel", 1.6, DECK + 1.1, -0.38, { css: BRBG_CSS, w: 0.24 });
    reg(hits, deckRadio, "deck-radio");

    const deckHailer = group(g, -0.4, DECK + 1.0, -0.3);
    cyl(deckHailer, 0.05, 0.09, 0.18, 0, 0, 0, 0xc8ced4, { rough: 0.4, metal: 0.5, seg: 12 }).rotation.x = Math.PI / 2;
    holoTag(deckHailer, "deck hailer", 0, 0.18, 0, { css: BRBG_CSS, w: 0.24 });
    reg(hits, deckHailer, "deck-hailer");

    const winchLoweredMarker = group(g, 0.2, DECK + 0.4, 0.5);
    box(winchLoweredMarker, 0.1, 0.02, 0.1, 0, 0, 0, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, winchLoweredMarker, "winch-lowered");
    const jawsClosedMarker = group(g, 0.2, DECK + 0.6, 0.5);
    box(jawsClosedMarker, 0.1, 0.02, 0.1, 0, 0, 0, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, jawsClosedMarker, "jaws-closed-confirmed");
    const winchHauledMarker = group(g, 0.2, DECK + 0.8, 0.5);
    box(winchHauledMarker, 0.1, 0.02, 0.1, 0, 0, 0, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, winchHauledMarker, "winch-hauled");

    const gearRinsedMarker = group(g, -0.6, DECK + 0.7, 1.5);
    box(gearRinsedMarker, 0.1, 0.02, 0.1, 0, 0, 0, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, gearRinsedMarker, "gear-rinsed");
    const grabStowedMarker = group(g, 1.2, DECK + 0.3, 0.4);
    box(grabStowedMarker, 0.1, 0.02, 0.1, 0, 0, 0, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, grabStowedMarker, "grab-stowed");
    const deckSecuredMarker = group(g, 0, DECK + 0.3, 0.4);
    box(deckSecuredMarker, 0.1, 0.02, 0.1, 0, 0, 0, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, deckSecuredMarker, "deck-secured");

    // -------------------------------------------------------------- PPE rack
    const pfdRack = group(g, -1.9, 0.1, -1.4);
    cyl(pfdRack, 0.02, 0.02, 1.0, 0, 0.5, 0, 0x8a949d, { rough: 0.45, metal: 0.7, seg: 8 });
    const pfd = box(pfdRack, 0.28, 0.34, 0.1, 0, 0.9, 0.05, BRBG_RED, { rough: 0.7 });
    holoTag(pfdRack, "PFD", 0, 1.1, 0, { css: BRBG_CSS, w: 0.2 });
    reg(hits, pfd, "pfd-on");
    const glovesRack = group(g, -1.5, 0.7, -1.1);
    box(glovesRack, 0.1, 0.04, 0.16, 0, 0, 0, 0xd8a63a, { rough: 0.7 });
    holoTag(glovesRack, "gloves", 0, 0.1, 0, { css: BRBG_CSS, w: 0.2 });
    reg(hits, glovesRack, "gloves-on");
    const eyeRack = group(g, -1.3, 0.9, -1.3);
    box(eyeRack, 0.12, 0.04, 0.03, 0, 0, 0, 0xaebfcb, { rough: 0.3, metal: 0.2, opacity: 0.6, transparent: true });
    holoTag(eyeRack, "eye protection", 0, 0.1, 0, { css: BRBG_CSS, w: 0.26 });
    reg(hits, eyeRack, "eye-protection-on");

    const waterTex = water.material.map;
    let hauling = false;
    return {
      hits,
      spawnLook: new THREE.Vector3(0.4, DECK + 1.0, 0.9),
      onStep(step) {
        if (step?.id === "winch-watch") hauling = true;
      },
      onStepComplete(step) {
        if (step.id === "gear-check") { bentJaw.visible = false; tornMesh.visible = false; }
        if (step.id === "deploy-grab") { grabGrp.position.copy(new THREE.Vector3(0, 1.5, 0)); }
        if (step.id === "winch-watch") hauling = false;
        if (step.id === "label-jar") { jarGrp.position.copy(new THREE.Vector3(0.4, 0.31, 0)); }
        if (step.id === "custody-log") {
          repaint(custodyLog.userData.face, (cx, w, h) => drawLog(cx, w, h, ["Station: worked, plan confirmed", "Custody: jar racked and logged", "Sort: complete, preserved in window", "Deck: cast finishing"], false));
        }
        if (step.id === "crew-checkin") { deckRadio.userData.show?.("CAST OK\nBOTH HANDLED"); }
        if (step.id === "closing-log") {
          repaint(custodyLog.userData.face, (cx, w, h) => drawLog(cx, w, h, ["Station: complete", "Custody: unbroken end to end", "Sort: preserved inside window", "Deck: secured for transit"], true));
        }
      },
      onHazard() {},
      onInterrupt(it) {
        if (it.id === "grab-snags-bottom-debris") { winchStopBeacon.material = mat(BRBG_RED, { emissive: BRBG_RED, ei: 2.2 }); winchCable.material = mat(0xd2312b, { rough: 0.5, metal: 0.6 }); hauling = false; }
        if (it.id === "deckhand-in-swing-radius") { deckhandGrp.visible = true; deckhandGrp.position.copy(deckhandDangerSpot); }
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "grab-snags-bottom-debris") { winchStopBeacon.material = mat(BRBG_GREEN, { emissive: BRBG_GREEN, ei: 1.6 }); winchCable.material = mat(0xb0b4b8, { rough: 0.5, metal: 0.6 }); }
        if (it.id === "deckhand-in-swing-radius") { deckhandGrp.position.copy(deckhandHome); deckhandGrp.visible = false; }
      },
      animate(t, dt, session) {
        wave.visible = true;
        wave.userData.step(dt, new THREE.Vector3(0, 0.06, -6), 1.1, 0.28, -0.1);
        if (waterTex?.offset) { waterTex.offset.x = t * 0.004; waterTex.offset.y = t * 0.006; }
        if (hauling) grabGrp.position.y = Math.min(1.6, grabGrp.position.y + dt * 0.3);
        const step = session?.step;
        if (session?.turn && step?.id === "cock-grab-dial") cockKnob.rotation.z = session.turn.amount * 4;
        if (session?.gauge && !session.gauge.committed && step?.id === "sort-clock") {
          const gt = session.gauge.t ?? 0;
          repaint(sortClock.userData.screen, signFace(`${Math.round(gt * 6)} min`, { bg: "#0d1420", accent: gt >= 0.46 && gt <= 0.64 ? "#59c97b" : "#f2ae14", fg: "#eaf0dc", scale: 0.6 }));
        }
        void tensionGauge; void grabHome; void jarHome; void sieveMeshFace;
      },
    };
  },
};
