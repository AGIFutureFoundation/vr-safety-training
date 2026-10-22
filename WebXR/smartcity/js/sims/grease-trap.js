import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, ball, torus, slab, hose, group, decal, repaint, signFace, paperFace, particles, mat,
} from "../../../shared/kit.js";
import {
  CITY, stationPad, holoPanel, holoTag, toolChest, instrument, standingFigure, valveWheel, reg,
  surfaceTexture, texturedMat, pavingFace,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Grease Trap VR — Culinary & Hospitality, station 111.
//
// Servicing the under-sink grease interceptor in a working commercial
// kitchen, generic rather than any one restaurant. The procedure answers the
// question every kitchen crew gets wrong at least once: this small
// under-counter unit, opened and worked entirely from the top with nobody's
// body ever inside it, is not the same thing as the outdoor in-ground
// interceptor a hauler's crew actually climbs down into for a major service
// — and treating the two the same either buries a routine task in a permit
// it does not need, or sends somebody into a real confined space with none
// of the protection OSHA 1910.146 requires for it.

const GTR_ACCENT = 0xd8a23f;
const GTR_GREASE = 0xc9a24a;

export const SIM_GREASE_TRAP = {
  id: "grease-trap",
  index: "111",
  domain: "Culinary & Hospitality",
  trade: "UNITE HERE Local 2 kitchen steward / facilities laborer",
  category: "Culinary & Hospitality",
  indoor: "kitchen",
  certification: "SFPUC fats-oils-and-grease (FOG) programme and grease interceptor maintenance requirements; OSHA 29 CFR 1910.146 permit-required confined spaces, for telling the under-sink unit and the outdoor in-ground interceptor apart; Cal/OSHA general industry safety orders; OSHA 29 CFR 1910.1200 hazard communication for the SDS on the degreaser; UNITE HERE Local 2, with AFSCME and SEIU members maintaining the same equipment in public kitchens",
  name: "Grease Trap",
  title: simTitle("Grease Trap"),
  tagline: "Servicing the under-sink grease interceptor: confined-space question answered, lid lifted with the tool, grease and solids measured against the 25 percent rule, contents pumped to a sealed container, baffles checked, unit rinsed and resealed, manifest and log filed",
  accent: GTR_ACCENT,
  accentCss: "#d8a23f",
  parSeconds: 270,
  footprint: 2.3,
  badge: { id: "sealed-and-logged", name: "Sealed and Logged", note: "A service with the confined-space call made correctly, nothing to the drain, and the manifest and log both filed" },

  game: system({
    name: "FOG Programme",
    currency: "GAL",
    ranks: ["Porter", "Trap Tech", "Lead Steward", "Facilities Rep", "FOG Certified"],
    badges: [
      { id: "space-called-right", name: "Space Called Right", note: "The confined-space question answered before the lid ever moves, first time", test: AWARD.stepClean("space-call") },
      { id: "never-to-drain", name: "Never To The Drain", note: "Never a drop of grease to a floor drain, never the lid forced without the tool", test: AWARD.safe },
      { id: "true-25", name: "True 25", note: "The grease-and-solids reading held inside the working band", test: AWARD.precise(0.7) },
    ],
    challenges: [
      { id: "clean-service", name: "Clean Service", note: "No corrections across the whole service", test: AWARD.clean },
      { id: "steady-pump", name: "Steady Pump", note: "Held the pump-out steady without a break", test: AWARD.unbroken },
      { id: "trap-fast", name: "Trap Serviced Fast", note: "Manifest and log filed inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "bare-hand-lid": "You went at that lid with your bare hands instead of the hook tool. A grease-sealed lid lets go all at once when it finally breaks free, and a hand caught under a cast-iron lid coming down is a crushed finger before anyone has even started the actual service.",
    "dump-to-drain": "That overflow line runs straight to the kitchen's floor drain instead of the sealed haul container. Grease down a drain is exactly what this interceptor exists to stop — and it is also a direct violation of the FOG programme this unit is permitted under.",
    "ignition-source": "That's an open flame next to an interceptor that has been sitting closed and building gas off decomposing grease. Trapped organic waste generates methane, and an open lid with an ignition source next to it turns a smelly service into the wrong kind of headline.",
    "unlabeled-container": "That haul container has no label and the lid isn't seated. An unlabeled container of grease waste sitting in a kitchen is a spill nobody can identify and a paperwork gap the hauler's manifest is supposed to close before it ever gets to this point.",
  },

  lateNotes: {
    "dip-stick": "The grease-and-solids reading is taken after the lid is off and the headspace has been checked — there is nothing safe to dip a stick into before that.",
    "vac-hose": "Pumping starts only after the reading has actually called for it — this unit gets serviced on the 25 percent rule, not on a schedule nobody checked against the trap itself.",
    "lid-bolts": "The lid goes back on and gets torqued down after the rinse, not before — a rinse into a half-sealed unit just puts water back where the grease was.",
  },

  interrupts: [
    {
      id: "h2s-smell",
      kind: "Sulphur smell at the open lid",
      after: "headspace-check", delay: 3, seconds: 12,
      alert: "A rotten-egg smell rolls up out of the open interceptor the moment the lid comes off — stronger than the usual grease odour.",
      cue: "That smell is hydrogen sulphide. Back off the opening and get air moving before anyone goes near it again.",
      target: "back-away",
      why: "Hydrogen sulphide builds up in trapped organic waste and is exactly the atmosphere OSHA 1910.146 worries about in a confined space — it deadens your sense of smell at higher concentrations, so the moment you can smell it is the moment to move away from the opening, not lean in for a second sniff.",
      missNote: "Somebody stayed leaning over the open lid breathing whatever that smell was instead of stepping back and letting the fan clear it — the smell not getting stronger is not the same thing as the gas not being there.",
      wrongNote: "Not that. Backing away from the opening is the only response that gets you out of the gas before you find out how much of it there is.",
    },
    {
      id: "cook-pours-oil",
      kind: "Fryer oil going down the prep sink",
      after: "pump-out", delay: 4, seconds: 12,
      alert: "Across the kitchen, a line cook is tipping a pan of spent fryer oil straight down the prep sink instead of into the grease jug by the fryer.",
      cue: "Stop her before that oil hits the drain — that's exactly what this interceptor is trying to keep up with.",
      target: "stop-cook",
      why: "Every ounce of fryer oil that goes down a drain instead of into the grease jug is load this interceptor has to catch that it was never sized to catch on top of, and it is happening in real time on the other side of the kitchen from the service you are already in the middle of — noticing it is the whole point of the drill.",
      missNote: "The oil went down the drain while the trap you were servicing sat open on the floor a few feet away — the FOG programme's own numbers assume that oil goes in a jug, not down a sink, and this shift just broke that assumption.",
      wrongNote: "Not that. Stopping her before the oil hits the drain is the only response that keeps this from becoming exactly the load the interceptor downstream cannot handle.",
    },
  ],

  steps: [
    {
      id: "plan", kind: "select", target: "service-plan",
      title: "Read the interceptor's service card",
      cue: "Check the unit's size, its last service date and the FOG programme's service interval before opening anything.",
      why: "The service card is what ties this specific unit to the FOG programme's permit conditions — the interval, the manifest requirement and the 25 percent rule all apply because this card says this interceptor is on that programme, not because the lid happens to look due.",
    },
    {
      id: "space-call", kind: "select", target: "space-flowchart",
      title: "Answer the confined-space question",
      cue: "Read the decision flowchart and confirm this under-sink interceptor is not a permit-required confined space.",
      why: "OSHA 1910.146 asks whether a space is entered bodily and whether it can develop a hazardous atmosphere or trap someone — this small under-counter unit is serviced entirely from the top opening with nobody's body ever going inside it, which is a different call from the outdoor in-ground interceptor a hauler's crew actually climbs down into. Answering it here, not assuming it, is what keeps a routine task routine.",
    },
    {
      id: "ppe", kind: "sequence", anyOrder: true,
      targets: ["gt-gloves", "gt-apron", "gt-goggles"],
      itemNames: { "gt-gloves": "chemical-resistant gloves", "gt-apron": "rubber apron", "gt-goggles": "splash goggles" },
      title: "Glove, apron and goggle up",
      cue: "Gloves, apron and splash goggles before the lid comes off.",
      why: "What's under that lid is decomposing food waste and grease that has been sitting for days — the gloves keep it off your hands, the apron keeps it off your clothes, and the goggles are what stand between your eyes and whatever comes up when the lid finally breaks its seal.",
    },
    {
      id: "ventilate", kind: "select", target: "vent-fan",
      title: "Set up ventilation before opening the lid",
      cue: "Position the portable fan to move air across the opening before you break the seal.",
      why: "A closed interceptor traps whatever gas the waste inside it has been producing, and moving air across the opening before the lid comes off is what keeps that gas from simply pooling around whoever is kneeling over it a minute later.",
    },
    {
      id: "open-lid", kind: "select", target: "lid-tool",
      title: "Lift the lid with the hook tool",
      cue: "Hook the tool into the lid's lift eye and break the seal — never with your fingers.",
      why: "A grease-sealed cast-iron lid does not lift smoothly; it holds and then releases all at once. The hook tool keeps every one of your fingers away from the gap that is about to open, which your bare hand cannot promise you.",
    },
    {
      id: "headspace-check", kind: "hold", target: "lid-opening", seconds: 5,
      title: "Pause over the open lid before reaching in",
      cue: "Hold back from the opening, look and smell for anything wrong before your hands go anywhere near it.",
      why: "The open lid is the one moment in this whole service where an atmosphere problem would actually show itself — a held pause here is a five-second check against exactly the kind of surprise the confined-space call assumed would not need a permit to manage.",
      holdBreakNote: "You reached in before the pause was over. Hold back and let the check finish before anything goes near that opening.",
    },
    {
      id: "measure", kind: "gauge", target: "dip-stick",
      title: "Measure the grease and solids against the 25 percent rule",
      cue: "Dip the measuring stick to the bottom and commit the combined grease-and-solids reading as a share of the total liquid depth.",
      why: "The interceptor is due for pumping once the combined grease cap and settled solids reach about a quarter of the unit's total liquid depth — past that point the trap is losing the working volume it needs to actually separate anything, and it starts passing grease straight through to the line it is supposed to protect.",
      gauge: { label: "GREASE + SOLIDS", speed: 0.65, green: [0.5, 0.78], readout: (t) => `${Math.round(t * 45)}%`, missNote: "Not yet past the 25 percent trigger, or already well past it — read the stick again before deciding whether this unit gets pumped today." },
    },
    {
      id: "baffle-check", kind: "find", noHint: true,
      targets: ["broken-baffle", "blocked-flow-control"],
      itemNames: { "broken-baffle": "cracked internal baffle", "blocked-flow-control": "flow-control fitting packed with debris" },
      itemNotes: {
        "broken-baffle": "The baffle wall that is supposed to hold grease back from the outlet side has a crack straight through it — grease is moving past it into the compartment the trap treats as already clean.",
        "blocked-flow-control": "The inlet flow-control fitting is packed solid with food debris. A blocked flow control lets water surge through the unit faster than the design flow rate, which stirs up everything the baffles just settled.",
      },
      title: "Check the baffles and flow control",
      cue: "Look at the internal baffle wall and the flow-control fitting before pumping anything out.",
      why: "The baffles and the flow control are what actually make this a grease interceptor instead of a plain tank — a cracked baffle or a blocked fitting means the unit has been passing grease through even while every reading on the outside looked normal.",
    },
    {
      id: "pump-out", kind: "track", target: "vac-hose", seconds: 7,
      title: "Pump the contents to the sealed container",
      cue: "Hold the vacuum hose steady into the sealed haul container, never toward the floor drain.",
      why: "The whole point of a sealed container is that grease waste leaves this kitchen as a manifested load a hauler is responsible for, not as whatever ran down the nearest drain — a hose that wanders off the container for even a few seconds puts waste exactly where the FOG programme exists to keep it from going.",
      track: { start: 0.1, green: [0.4, 0.6], rise: 0.55, fall: 0.45, drift: 0.12, label: "PUMP HOSE", readout: (v) => (v < 0.4 ? "off target" : v > 0.6 ? "spilling past the rim" : "into the container") },
      holdBreakNote: "The hose drifted off the container. Bring it back over the opening before any more comes out.",
    },
    {
      id: "container-seal", kind: "select", target: "haul-container-lid",
      title: "Seal the haul container",
      cue: "Close and latch the container's lid once the pump-out is finished.",
      why: "A sealed container is what keeps this load a controlled shipment instead of an open tub of grease sitting in a kitchen until the hauler shows up — sealed now, it stays that way through however long it waits by the back door.",
    },
    {
      id: "rinse", kind: "hold", target: "rinse-wand", seconds: 5,
      title: "Rinse the interior",
      cue: "Hold the rinse wand over the baffles and walls until the residue is gone.",
      why: "Grease left clinging to the baffles and walls after a pump-out is grease that is already back at work re-coating the unit before it is even resealed — the rinse is what actually resets the trap to empty rather than just lower.",
      holdBreakNote: "Stopped before the residue cleared. Keep the rinse on the walls and baffles until they're actually clean.",
    },
    {
      id: "reseal-lid", kind: "turn", target: "lid-bolts",
      title: "Reseat and torque the lid",
      cue: "Turn the locking ring until the lid seats flush and the bolts are snug.",
      why: "A lid that is set back on but not actually torqued down is a lid that can be lifted by the next pressure surge in the line, or by a foot that catches its edge — the bolts are what turn a resting cover back into a sealed access point.",
      turn: { turns: 0.75, axis: "y", label: "LID BOLTS" },
    },
    {
      id: "manifest", kind: "select", target: "hauler-manifest",
      title: "Complete the hauler's manifest",
      cue: "Fill in the volume, the date and your signature on the manifest before the hauler takes the container.",
      why: "The manifest is what makes this load traceable from your kitchen to wherever the hauler actually takes it — under the FOG programme, a grease shipment with no manifest is treated the same as one that never left through the proper route at all.",
    },
    {
      id: "log", kind: "select", target: "maintenance-log",
      title: "Log the service for inspection",
      cue: "Record the date, the reading and the volume pumped in the maintenance log.",
      why: "The utility's FOG inspectors check this log against the interceptor's permitted service interval — a trap that is actually maintained on schedule but has no log to prove it gets treated exactly like one that was never serviced at all.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.3, GTR_ACCENT);

    // ------------------------------------------------------------- floor patch
    const floorTex = surfaceTexture((cx, w, h) => pavingFace(cx, w, h, { tiles: 5, base: "#7a5a48", base2: "#6b4e3e", seam: "rgba(240,230,215,0.5)" }), { repeat: 5, px: 384 });
    const floor = box(g, 5.2, 0.1, 4.4, 0, 0.05, 0, 0x7a5a48, { rough: 0.9 });
    floor.material = texturedMat(floorTex, { rough: 0.88, metal: 0.05, color: 0x7a5a48 });

    // ------------------------------------------------------------------- under-sink cabinet
    const cabinet = group(g, -1.5, 0.1, -1.4);
    box(cabinet, 1.4, 0.85, 1.0, 0, 0.42, 0, 0xb8c1c9, { rough: 0.55, metal: 0.3 }); // cabinet under a prep sink
    box(cabinet, 1.5, 0.08, 1.05, 0, 0.86, 0, 0x9aa2a8, { rough: 0.5, metal: 0.4 }); // sink counter overhang
    for (const dx of [-0.55, 0.55]) cyl(cabinet, 0.03, 0.03, 0.4, dx, 1.05, -0.3, 0x8a939b, { rough: 0.4, metal: 0.7, seg: 10 }); // faucet stubs
    holoTag(cabinet, "prep sink cabinet", 0, 1.2, 0, { css: "#d8a23f", w: 0.4 });

    // The interceptor itself, sunk into a small raised apron in front of the
    // cabinet so the open lid sits above y=0 the way trench-box cuts its
    // excavation into an apron rather than into the shared plaza deck.
    const APRON = 0.14;
    const pad = group(g, -0.2, 0, 0.3);
    box(pad, 1.6, APRON, 1.3, 0, APRON / 2, 0, 0x9aa2a8, { rough: 0.6, metal: 0.3 });
    const trapGrp = group(pad, 0, APRON, 0);
    box(trapGrp, 1.35, 0.02, 1.05, 0, 0.01, 0, 0x6d757b, { rough: 0.6, metal: 0.4, cast: false }); // recessed frame
    const lidGrp = group(trapGrp, 0, 0.02, 0, 0.15);
    const lid = box(lidGrp, 1.15, 0.05, 0.85, 0, 0.025, 0, 0x3a4048, { rough: 0.6, metal: 0.5 });
    const lidRing = torus(lidGrp, 0.08, 0.015, 0, 0.05, -0.3, CITY.steel, { rough: 0.4, metal: 0.7, seg: 8, seg2: 16 });
    lidRing.rotation.x = Math.PI / 2;
    reg(hits, lid, "lid-tool");
    holoTag(lidGrp, "interceptor lid", 0, 0.3, 0, { css: "#d8a23f", w: 0.36 });

    // The interior, revealed once the lid step completes — a shallow open
    // basin with a grease cap, baffle wall and outlet flow control.
    const interior = group(trapGrp, 0, 0.02, 0, 0.15);
    interior.visible = false;
    box(interior, 1.1, 0.35, 0.8, 0, -0.17, 0, 0x2a2f24, { rough: 0.9, cast: false }); // dark cavity
    const greaseCap = slab(interior, 1.0, 0.05, 0.7, 0, -0.02, 0, GTR_GREASE, { rough: 0.7, opacity: 0.92, transparent: true, cast: false });
    const baffle = box(interior, 0.03, 0.28, 0.7, 0.1, -0.16, 0, 0x5a5f52, { rough: 0.7, cast: false });
    reg(hits, baffle, "broken-baffle");
    holoTag(baffle, "baffle wall", 0, 0.18, 0, { css: "#e8622a", w: 0.28 });
    const flowControl = cyl(interior, 0.06, 0.06, 0.16, -0.45, -0.14, -0.28, 0x7b8a86, { rough: 0.6, metal: 0.4, seg: 12, open: true });
    flowControl.rotation.z = Math.PI / 2;
    reg(hits, flowControl, "blocked-flow-control");
    holoTag(flowControl, "flow control", 0, 0.14, 0, { css: "#e8622a", w: 0.28 });
    const gasPuff = particles(interior, 24, 0x8fae5a, { size: 0.022, life: 0.6, additive: false, opacity: 0.6 });
    gasPuff.position.set(0, 0.02, 0);
    gasPuff.visible = false;
    const dipStickGrp = group(trapGrp, -0.4, 0.03, 0.2, -0.2);
    cyl(dipStickGrp, 0.012, 0.012, 0.7, 0, 0.35, 0, 0xdfe6a8, { rough: 0.5, seg: 8 });
    const dipInstrument = instrument(dipStickGrp, 0.14, 0.55, 0, { idle: "--%", color: GTR_ACCENT, w: 0.13, d: 0.18 });
    holoTag(dipStickGrp, "measuring stick", 0, 0.76, 0, { css: "#d8a23f", w: 0.36 });
    reg(hits, dipInstrument, "dip-stick");
    const lidOpening = box(trapGrp, 1.1, 0.1, 0.8, 0, 0.05, 0, 0xffffff, { opacity: 0.001, transparent: true, cast: false });
    hits["lid-opening"] = lidOpening;
    const backAway = box(trapGrp, 0.5, 0.5, 0.5, 0.9, 0.4, -0.6, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(trapGrp, "back away", 0.9, 0.7, -0.6, { css: "#d8a23f", w: 0.28 });
    reg(hits, backAway, "back-away");
    const ignitionHazard = group(trapGrp, 0.5, 0.06, 0.5);
    cyl(ignitionHazard, 0.006, 0.006, 0.05, 0, 0.025, 0, 0xe8622a, { rough: 0.5, emissive: 0xe8622a, ei: 1.4, seg: 6 });
    holoTag(ignitionHazard, "lighter left burning", 0, 0.14, 0, { css: "#e8622a", w: 0.4 });
    reg(hits, ignitionHazard, "ignition-source");
    const bareHandHazard = box(trapGrp, 0.5, 0.3, 0.5, -0.3, 0.15, 0.5, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, bareHandHazard, "bare-hand-lid");

    // ------------------------------------------------------------------- ventilation fan
    const fanGrp = group(g, 0.6, 0.1, -1.8, -0.4);
    box(fanGrp, 0.4, 0.4, 0.14, 0, 0.35, 0, 0x2b2f34, { rough: 0.5, metal: 0.4 });
    const fanBlades = group(fanGrp, 0, 0.35, 0.08);
    for (let i = 0; i < 4; i++) { const b = box(fanBlades, 0.16, 0.03, 0.006, 0, 0, 0, 0xaab1b7, { rough: 0.5, metal: 0.5, cast: false }); b.rotation.z = (i * Math.PI) / 2; }
    for (const [sx, sz] of [[-0.16, -0.16], [0.16, -0.16], [-0.16, 0.16], [0.16, 0.16]]) cyl(fanGrp, 0.02, 0.02, 0.35, sx, 0.175, sz, 0x1b1e22, { rough: 0.6, metal: 0.3, seg: 8 });
    holoTag(fanGrp, "ventilation fan", 0, 0.6, 0, { css: "#d8a23f", w: 0.34 });
    reg(hits, fanGrp, "vent-fan");

    // ------------------------------------------------------------------- pump / vacuum tank
    const vacGrp = group(g, 1.9, 0.1, -1.2, 0.3);
    cyl(vacGrp, 0.35, 0.35, 0.9, 0, 0.55, 0, 0x8a939b, { rough: 0.5, metal: 0.5, seg: 18 });
    for (const [sx, sz] of [[-0.28, -0.28], [0.28, -0.28], [-0.28, 0.28], [0.28, 0.28]]) cyl(vacGrp, 0.05, 0.05, 0.06, sx, 0.06, sz, 0x1b1e22, { rough: 0.6, metal: 0.3, seg: 10 });
    const vacGaugeGrp = group(vacGrp, 0.3, 0.85, 0.2);
    cyl(vacGaugeGrp, 0.06, 0.06, 0.02, 0, 0, 0.02, 0xdfe4e8, { rough: 0.3, metal: 0.4, seg: 14 });
    holoTag(vacGaugeGrp, "vac gauge", 0, 0.16, 0.02, { css: "#d8a23f", w: 0.24 });
    for (let i = 0; i < 3; i++) box(vacGrp, 0.36, 0.02, 0.36, 0, 0.2 + i * 0.28, 0, 0x6d757b, { rough: 0.5, metal: 0.6, cast: false });
    const wandGrp = group(vacGrp, -0.5, 0.5, 0.3, 0.4);
    cyl(wandGrp, 0.02, 0.02, 0.7, 0, 0, 0, 0x2b2f34, { rough: 0.5, metal: 0.5, seg: 10 }).rotation.x = Math.PI / 2.2;
    holoTag(wandGrp, "vacuum hose", 0, 0.18, 0, { css: "#d8a23f", w: 0.32 });
    reg(hits, wandGrp, "vac-hose");
    hose(vacGrp, [[-0.3, 0.85, 0], [-0.7, 1.0, 0.2], [-1.0, 0.6, 0.5]], 0.04, 0x2b2f34, { steps: 16, rough: 0.6 });

    // Sealed haul container the vacuum discharges into.
    const haulGrp = group(g, 2.0, 0.1, 0.4, -0.3);
    box(haulGrp, 0.6, 0.7, 0.6, 0, 0.35, 0, 0x2f4a3a, { rough: 0.6, metal: 0.3 });
    const haulLid = box(haulGrp, 0.62, 0.05, 0.62, 0, 0.71, 0, 0x1e2e24, { rough: 0.6, metal: 0.3 });
    decal(haulGrp, 0.4, 0.14, 0, 0.4, 0.301, signFace("GREASE WASTE — SEALED", { bg: "#0f1a12", accent: "#f2c14b", scale: 0.4 }));
    holoTag(haulGrp, "haul container", 0, 0.85, 0, { css: "#d8a23f", w: 0.36 });
    reg(hits, haulLid, "haul-container-lid");
    const unlabeledContainer = box(g, 0.5, 0.5, 0.5, 1.5, 0.25, 0.5, 0x555a52, { rough: 0.7 });
    reg(hits, unlabeledContainer, "unlabeled-container");

    // Rinse wand hanging near the trap.
    const rinseWandGrp = group(g, -0.9, 0.1, 0.9, 0.3);
    cyl(rinseWandGrp, 0.018, 0.018, 0.6, 0, 0.3, 0, CITY.steel, { rough: 0.4, metal: 0.7, seg: 10 });
    holoTag(rinseWandGrp, "rinse wand", 0, 0.62, 0, { css: "#d8a23f", w: 0.3 });
    reg(hits, rinseWandGrp, "rinse-wand");
    const rinseSpray = particles(rinseWandGrp, 20, 0xbfe4ff, { size: 0.016, life: 0.35, additive: false, opacity: 0.55 });
    rinseSpray.position.set(0, 0.55, 0);

    // Lid bolts — a ring of small bolt heads that get torqued by the turn step.
    const boltRing = group(lidGrp, 0, 0.05, 0);
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      cyl(boltRing, 0.015, 0.015, 0.03, Math.sin(a) * 0.5, 0.015, Math.cos(a) * 0.35, 0x8a939b, { rough: 0.4, metal: 0.7, seg: 8 });
    }
    reg(hits, boltRing, "lid-bolts");

    // ------------------------------------------------------------------- PPE + paperwork
    const ppeStand = group(g, -2.0, 0.1, 1.3, -0.3);
    slab(ppeStand, 0.1, 1.2, 0.4, 0, 0.6, 0, 0x53606b, { radius: 0.02, rough: 0.5, metal: 0.4 });
    const apronMesh = box(ppeStand, 0.35, 0.5, 0.03, 0.15, 0.85, 0, 0xf2c14b, { rough: 0.7 });
    reg(hits, apronMesh, "gt-apron");
    const glovesMesh = group(ppeStand, 0.15, 0.55, 0);
    box(glovesMesh, 0.16, 0.05, 0.09, -0.06, 0, 0, 0xd8232a, { rough: 0.6 });
    box(glovesMesh, 0.16, 0.05, 0.09, 0.06, 0, 0, 0xd8232a, { rough: 0.6 });
    reg(hits, glovesMesh, "gt-gloves");
    const goggles = torus(ppeStand, 0.05, 0.014, 0.15, 0.95, 0, 0xdfe4e8, { rough: 0.4, metal: 0.3, seg: 8, seg2: 16 });
    reg(hits, goggles, "gt-goggles");
    holoTag(ppeStand, "PPE", 0.15, 1.15, 0, { css: "#d8a23f", w: 0.24 });

    const chest = toolChest(g, 1.4, 1.7, { ry: -0.6, color: 0x2b3138 });
    void chest;

    // Cleaning-supply shelving beside the sink cabinet — a bit more of the
    // kitchen this interceptor actually lives in.
    const suppliesGrp = group(g, -2.1, 0.1, -0.5, 0.3);
    box(suppliesGrp, 0.12, 1.3, 0.55, 0, 0.65, 0, 0x53606b, { rough: 0.55, metal: 0.4 });
    for (const y of [0.35, 0.75, 1.15]) box(suppliesGrp, 0.1, 0.02, 0.5, 0, y, 0, 0x6d757b, { rough: 0.55, metal: 0.4 });
    for (const [dy, color] of [[0.42, 0x2f7d4a], [0.82, 0xd8a23f], [1.22, 0x2b6fd8]]) cyl(suppliesGrp, 0.05, 0.055, 0.16, 0.1, dy, 0, color, { rough: 0.5, seg: 12 });
    holoTag(suppliesGrp, "kitchen cleaning supplies", 0, 1.45, 0, { css: "#d8a23f", w: 0.5 });

    // Floor drain the interceptor protects, dressed with a grate.
    const floorDrainGrp = group(g, 0.9, 0.1, 1.5);
    box(floorDrainGrp, 0.34, 0.015, 0.34, 0, 0.008, 0, 0x2b2f34, { rough: 0.6, metal: 0.5, cast: false });
    for (let i = -2; i <= 2; i++) box(floorDrainGrp, 0.3, 0.008, 0.02, 0, 0.016, i * 0.06, 0x1b1e22, { rough: 0.6, cast: false });
    holoTag(floorDrainGrp, "kitchen floor drain", 0, 0.2, 0, { css: "#d8a23f", w: 0.4 });
    const planBoard = holoPanel(g, 0.6, 0.42, -2.0, 1.5, -0.8, (cx, w, h) => {
      cx.fillStyle = "#1c1408"; cx.fillRect(0, 0, w, h); cx.fillStyle = "#d8a23f"; cx.fillRect(0, 0, w, 5);
      cx.font = `600 ${Math.round(h * 0.12)}px 'Barlow Condensed', Arial, sans-serif`; cx.textAlign = "left"; cx.textBaseline = "middle";
      cx.fillStyle = "#f4ecd8"; cx.fillText("UNDER-SINK INTERCEPTOR", w * 0.06, h * 0.16);
      cx.font = `${Math.round(h * 0.09)}px Arial, sans-serif`; cx.fillStyle = "#f4ecd8";
      ["Last service: 87 days ago", "Not a permit space — top service only", "Pump at 25% grease + solids"].forEach((l, i) => cx.fillText(l, w * 0.06, h * (0.36 + i * 0.16)));
    }, { ry: 0.5, accent: GTR_ACCENT });
    reg(hits, planBoard, "service-plan");
    const flowchart = decal(g, 0.7, 0.5, -2.0, 1.0, -0.55, paperFace("CONFINED SPACE?", ["Bodily entry required? NO", "Hazardous atmosphere risk? LOW", "Under-sink unit = NOT a permit space", "Outdoor in-ground tank MAY BE"], { scale: 0.7 }), { ry: 0.5 });
    reg(hits, flowchart, "space-flowchart");

    const logDesk = group(g, -0.6, 0.1, 1.8, -0.2);
    box(logDesk, 0.6, 0.72, 0.4, 0, 0.36, 0, 0x53606b, { rough: 0.65, metal: 0.3 });
    const manifestSheet = decal(logDesk, 0.32, 0.4, -0.16, 0.735, 0, paperFace("HAULER MANIFEST", ["Volume ___ gal", "Date ___", "Signature ___"], { scale: 0.8 }));
    manifestSheet.rotation.x = -Math.PI / 2;
    reg(hits, manifestSheet, "hauler-manifest");
    const logSheet = decal(logDesk, 0.32, 0.4, 0.16, 0.735, 0, paperFace("MAINTENANCE LOG", ["Date ___  Reading ___", "Volume ___ gal"], { scale: 0.8 }));
    logSheet.rotation.x = -Math.PI / 2;
    reg(hits, logSheet, "maintenance-log");
    holoTag(logDesk, "manifest + log", 0, 1.0, 0, { css: "#d8a23f", w: 0.4 });

    const cookHazard = box(g, 0.4, 0.3, 0.4, 2.1, 0.9, 1.7, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, cookHazard, "dump-to-drain");
    holoTag(g, "pouring down the drain?", 2.1, 1.2, 1.7, { css: "#e8622a", w: 0.5 });
    const stopCookHit = box(g, 0.4, 0.4, 0.4, 2.3, 0.9, 1.9, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, stopCookHit, "stop-cook");

    const steward = standingFigure(g, -0.6, -0.7, { ry: 0.5, cloth: 0x2b7a5a });
    holoTag(steward, "steward", 0, 1.9, 0, { css: "#d8a23f", w: 0.3 });
    const cookHome = new THREE.Vector3(2.45, 0, 1.15);
    const cook = standingFigure(g, cookHome.x, cookHome.z, { ry: -2.2, cloth: 0x37505f });

    return {
      hits,
      spawnLook: new THREE.Vector3(-0.4, 1.0, -0.2),
      onStep() {},
      onStepComplete(step) {
        if (step.id === "open-lid") { lidGrp.rotation.z = -1.3; interior.visible = true; }
        if (step.id === "measure") repaint(dipInstrument.userData.screen, signFace("READ", { bg: "#1c1408", accent: "#59c97b", fg: "#f4ecd8", scale: 0.55 }));
        if (step.id === "baffle-check") { baffle.material = mat(0x59c97b, { rough: 0.6, cast: false }); flowControl.material = mat(0x8fa9c4, { rough: 0.5, metal: 0.4 }); }
        if (step.id === "pump-out") greaseCap.visible = false;
        if (step.id === "container-seal") haulLid.position.y = 0.71;
        if (step.id === "reseal-lid") { lidGrp.rotation.z = 0.15; interior.visible = false; }
      },
      onInterrupt(it) {
        if (it.id === "cook-pours-oil") cook.position.set(2.2, 0, 1.6);
        if (it.id === "h2s-smell") { gasPuff.visible = true; lidRing.material = mat(0xe8622a, { rough: 0.4, metal: 0.5, emissive: 0xe8622a, ei: 0.7 }); }
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "cook-pours-oil") cook.position.set(cookHome.x, 0, cookHome.z);
        if (it.id === "h2s-smell") { gasPuff.visible = false; lidRing.material = mat(CITY.steel, { rough: 0.4, metal: 0.7 }); }
      },
      onHazard() {},
      animate(t, dt, session) {
        if (fanBlades) fanBlades.rotation.z += dt * 10;
        if (gasPuff.visible) gasPuff.userData.step(dt, new THREE.Vector3(0, 0.02, 0), 0.4, 0.35, 0.5);
        const step = session?.step;
        if (step?.id === "rinse" && session.holding) rinseSpray.userData.step(dt, new THREE.Vector3(0, 0.55, 0), 0.05, 0.8, -1.2);
        else rinseSpray.visible = false;
        const gg = session?.gauge;
        if (gg && !gg.committed && step?.id === "measure") {
          repaint(dipInstrument.userData.screen, signFace(`${Math.round(gg.t * 45)}%`, { bg: "#1c1408", accent: gg.t >= 0.5 && gg.t <= 0.78 ? "#59c97b" : "#f2ae14", fg: "#f4ecd8", scale: 0.55 }));
        }
      },
    };
  },
};
