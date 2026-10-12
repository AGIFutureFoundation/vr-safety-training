import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, ball, torus, slab, group, decal, repaint, signFace, particles, mat,
} from "../../../shared/kit.js";
import {
  CITY, stationPad, holoPanel, holoTag, instrument, standingFigure,
  surfaceTexture, texturedMat, tileFace, safetyStripeFace, reg,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Pharmacy & Floral Chemical Handling and SDS VR — Culinary &
// Hospitality, grocery pack (gr-), station eight. Two of a grocery store's
// smaller departments sharing one real hazard: chemicals handled by the
// case, not the truckload, checked against a safety data sheet before
// they're stored, mixed or cleaned up — a returned pharmacy chemical shelved
// wrong, a floral preservative concentrate mixed off the label, a spill
// nobody consulted the SDS on first. No concentration, contact time or
// clause number is stated as fact beyond what the label or SDS itself
// would say; the union is named only as a training body.

const GR8_ACCENT = 0x4fd6a5;

export const SIM_GR_PHARMACY_FLORAL_CHEMICAL_HANDLING_AND_SDS = {
  id: "gr-pharmacy-floral-chemical-handling-and-sds",
  index: "gr-8",
  domain: "Grocery pharmacy and floral departments",
  trade: "Pharmacy technician / floral clerk",
  category: "Culinary & Hospitality",
  indoor: "clinic",
  certification: "UFCW member training for retail food, clinic and dental support work; OSHA 29 CFR 1910.1200 hazard communication; ANSI/ISEA Z358.1 emergency eyewash and shower equipment; OSHA 29 CFR 1910.132 personal protective equipment; OSHA 29 CFR 1910.133 eye and face protection; OSHA 29 CFR 1910.138 hand protection",
  name: "Pharmacy & Floral Chemical Handling and SDS",
  title: simTitle("Pharmacy & Floral Chemical Handling and SDS"),
  tagline: "A chemical checked against its own SDS before it's stored, mixed to the label or cleaned up, with the eyewash proven clear and the incident logged",
  accent: GR8_ACCENT,
  accentCss: "#4fd6a5",
  parSeconds: 280,
  footprint: 2.6,
  badge: { id: "sheet-checked", name: "Sheet Checked", note: "Every chemical handled today was checked against its own SDS before it was stored, mixed or cleaned up" },

  game: system({
    name: "Chemical Handling Authority",
    currency: "SDS",
    ranks: ["Clerk", "Pharmacy/Floral Clerk", "Lead Clerk", "Department Supervisor", "Chemical Handling Authority Certified"],
    badges: [
      { id: "sheet-first", name: "Sheet First", note: "Checked the SDS before the container was ever opened", test: AWARD.stepClean("sds-lookup") },
      { id: "no-mix", name: "No Mix", note: "Never combined two chemicals without checking compatibility first", test: AWARD.safe },
      { id: "steady-dilute", name: "Steady Dilute", note: "Mixed to the label's own ratio inside the band every time", test: AWARD.precise(0.72) },
    ],
    challenges: [
      { id: "clean-shift", name: "Clean Shift", note: "No corrections through the whole chemical handling check", test: AWARD.clean },
      { id: "held-the-hold", name: "Held The Hold", note: "Never broke a timed step early", test: AWARD.unbroken },
      { id: "shift-fast", name: "Handled Fast", note: "Complete inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "mix-incompatible-chemicals": "You're about to pour that returned cleaner straight into the floral preservative bucket to save a trip to the shelf. Two chemicals with no checked compatibility do not get combined on a guess — the SDS for each one is what tells you whether that's a reaction waiting to happen, not how full the bucket looks.",
    "unlabeled-bottle": "That spray bottle has no label on it at all. A decanted chemical with nothing written on the bottle is a chemical nobody after you can identify — OSHA's hazard communication rule exists because the one thing worse than a hazardous chemical is one nobody can name in an emergency.",
    "skip-ppe-goggles": "You're reaching for the concentrate with no eye protection on. The splash risk on a concentrate is exactly what OSHA 29 CFR 1910.133 rates eye protection for — the goggles go on before the cap comes off, not after something already went wrong.",
    "block-eyewash-path": "Those cases are stacked directly in front of the eyewash station. An eyewash that takes ten seconds to reach because of a delivery nobody moved yet is an eyewash that misses the one window that actually matters after a splash.",
  },

  lateNotes: {
    "goggles": "Not yet — these go on before the concentrate's cap does, not after.",
    "preservative-meter": "Not until the SDS and the compatibility chart are both checked. This gets mixed to the label, not from memory.",
  },

  steps: [
    {
      id: "chem-inventory", kind: "select", target: "chem-inventory-board",
      title: "Check the chemical inventory board",
      cue: "Compare what's on the shelf against today's inventory list for both departments.",
      why: "The inventory board is the only record of what's actually supposed to be on these shelves — a chemical that shows up without a line on the board is one nobody has checked against an SDS yet, and that gets caught here, not after it's already stored.",
    },
    {
      id: "sds-lookup", kind: "select", target: "sds-binder",
      title: "Look up the SDS before handling anything",
      cue: "Pull the safety data sheet for the chemical you're about to store or mix.",
      why: "OSHA 29 CFR 1910.1200 puts the SDS at the centre of hazard communication for exactly this reason — it's the one document that tells you the storage, handling and first-aid facts for this specific chemical, checked before the container is opened, not guessed at from the label's front panel.",
    },
    {
      id: "don-ppe-chem", kind: "sequence",
      targets: ["chem-gloves", "goggles"],
      itemNames: { "chem-gloves": "chemical-resistant gloves", goggles: "splash goggles" },
      title: "Glove and goggle up",
      cue: "Pull on the chemical-resistant gloves, then the splash goggles — in that order.",
      why: "OSHA 29 CFR 1910.138 and 1910.133 rate each piece for a different part of the same splash — gloves first so your hands are already covered by the time you reach for the goggles, not the other way around.",
      outOfOrderNote: "Wrong order — gloves go on first, then the goggles, so your hands are already protected before they touch anything else.",
    },
    {
      id: "check-compatibility", kind: "select", target: "compat-chart",
      title: "Check the storage compatibility chart",
      cue: "Check the chart before shelving this chemical anywhere near what's already stored.",
      why: "A compatibility chart is what turns \"there's room on this shelf\" into an actual answer about whether two chemicals belong near each other — an acid and a base sharing a shelf because there was space is exactly the gap this chart exists to close.",
    },
    {
      id: "segregate-incompatible", kind: "drag", target: "incompatible-container",
      title: "Move the incompatible container",
      cue: "Move the container that failed the compatibility check to its own segregated shelf.",
      why: "A container that fails the compatibility chart doesn't get left where it is because moving it is inconvenient — it goes to the shelf built for exactly this, right away, not on the next slow afternoon.",
      drag: { to: "segregated-shelf", radius: 0.3, missNote: "Not on the segregated shelf — an incompatible container anywhere else is one more thing somebody has to remember not to shelve beside it." },
    },
    {
      id: "walk-chem-storage", kind: "find", noHint: true,
      targets: ["leaking-container", "faded-label"],
      itemNames: { "leaking-container": "a container leaking at the cap", "faded-label": "a container with a faded, unreadable label" },
      itemNotes: {
        "leaking-container": "This container is leaking at the cap seal. A slow leak on a shelf is a chemical exposure with nobody's name on it yet — it gets contained and reported, not left for the next person to find by touching it.",
        "faded-label": "This label has faded past the point of actually being readable. A container nobody can positively identify anymore is treated as unknown, not assumed to still be whatever it was originally labelled.",
      },
      decoyNotes: { "clean-container": "This container is sealed, labelled and dry. Leave it." },
      title: "Walk the chemical storage before it's touched",
      cue: "Two things in this storage area are wrong. Find them by looking.",
      why: "A chemical storage check isn't finished when the shelf looks organised — it's finished when every container on it is actually sound and actually identifiable. Two things left wrong here become the next clerk's exposure.",
    },
    {
      id: "dilute-preservative", kind: "gauge", target: "preservative-meter",
      title: "Mix the floral preservative to the label",
      cue: "Meter the concentrate into the water and commit once the mix is at the label's own ratio.",
      why: "The label's ratio is the only number this mix is measured against — too weak and the preservative does nothing for the flowers it's meant to protect, too strong and it's an unnecessary chemical exposure for whoever handles the buckets next.",
      gauge: { label: "PRESERVATIVE MIX", speed: 0.6, green: [0.35, 0.6], readout: (t) => (t < 0.35 ? "under the label's ratio" : t > 0.6 ? "over the label's ratio" : "at the label's ratio"), missNote: "Off the label's own ratio — remix rather than eyeball it closer next time." },
    },
    {
      id: "spill-kit-response", kind: "hold", target: "spill-kit", seconds: 6,
      title: "Apply the spill kit per the SDS",
      cue: "Open the spill kit and apply the absorbent, holding it down for the SDS's own dwell guidance.",
      why: "The spill kit's absorbent only does its job over the dwell time the SDS actually calls for — lifting it early leaves exactly the residue underneath that the kit was supposed to take care of.",
      holdBreakNote: "Lifted the absorbent early. Hold it down for the SDS's own guidance — a fast lift leaves the spill underneath it, not gone.",
    },
    {
      id: "sweep-controlled", kind: "track", target: "spill-broom", seconds: 6,
      title: "Sweep the residue at a controlled pace",
      cue: "Sweep the absorbed residue toward the containment bag at a slow, controlled pace.",
      why: "A fast sweep flings residue outward past the containment area you just set up — a slow, controlled pass keeps everything the spill kit already absorbed inside the area meant to hold it.",
      track: {
        start: 0.15, green: [0.3, 0.55], rise: 0.5, fall: 0.4, drift: 0.1, label: "SWEEP RATE",
        readout: (v) => (v < 0.3 ? "too slow — leaving residue behind" : v > 0.55 ? "too fast — flinging it past containment" : "controlled sweep"),
      },
      holdBreakNote: "Out of the controlled band — slow the sweep before residue goes past the containment area.",
    },
    {
      id: "eyewash-confirm", kind: "select", target: "eyewash-station",
      title: "Confirm the eyewash is clear and functional",
      cue: "Check that the path to the eyewash is clear and the unit activates.",
      why: "An eyewash confirmed clear before a chemical is even opened is what makes the ten seconds after a real splash a routine flush instead of a search for a station nobody checked was working.",
    },
    {
      id: "ventilation-fan", kind: "turn", target: "vent-fan-switch",
      title: "Turn on the back-room ventilation",
      cue: "Turn the ventilation fan switch on before working with the concentrate, per the SDS's guidance.",
      why: "The SDS's own ventilation guidance exists because a concentrate's fumes build up fastest in exactly the small back room this work happens in — the fan runs before the container opens, not after somebody notices the air feels wrong.",
      turn: { turns: 0.5, axis: "y", label: "VENT FAN" },
    },
    {
      id: "dispose-spill-waste", kind: "drag", target: "spill-waste-bag",
      title: "Dispose of the spill materials properly",
      cue: "Move the used spill kit materials to the hazardous waste container, not the regular trash.",
      why: "Absorbent that just took up a chemical is not regular trash anymore — the SDS's own disposal guidance is what tells you it goes to a hazardous waste container, and skipping that step just relocates the exposure instead of ending it.",
      drag: { to: "hazmat-bin", radius: 0.3, missNote: "Not in the hazmat bin — spill waste doesn't go in with the regular trash." },
    },
    {
      id: "log-incident", kind: "select", target: "incident-form",
      title: "Log the spill",
      cue: "Fill out the incident form for the spill before the shift moves on.",
      why: "A spill that isn't logged is a spill the next shift has no way of knowing happened — the form is what turns a cleaned-up mess into a record somebody can actually act on if it happens again.",
    },
    {
      id: "sign-chem-log", kind: "select", target: "chem-log",
      title: "Sign the chemical handling log",
      cue: "Sign the log to close out today's chemical handling check.",
      why: "The signature is the clerk taking responsibility for the whole check — every chemical inventoried, checked against its SDS, stored compatibly and any spill logged — and it's the record read if either department's chemical handling is ever questioned.",
    },
  ],

  interrupts: [
    {
      id: "coworker-combines-concentrates",
      kind: "About to mix without checking",
      after: "dilute-preservative", delay: 4, seconds: 12,
      alert: "A coworker is about to pour a different floral chemical straight into your mixed preservative bucket to save a second trip to the shelf.",
      cue: "That's two chemicals about to combine with nobody having checked compatibility.",
      target: "compat-chart",
      why: "Pointing them at the compatibility chart before that pour happens is the entire lesson this station teaches, handed to somebody else in real time — a shortcut that skips the chart is a shortcut that skips the one thing standing between a convenience and a reaction.",
      missNote: "The pour happened before anyone checked the chart. Whatever that combination does, nobody standing there actually knew it was safe before it happened — which is exactly what the chart was there to answer.",
      wrongNote: "It's the compatibility chart — check it before that second chemical goes into the bucket.",
    },
    {
      id: "bystander-near-spill",
      kind: "Walking toward an active spill",
      after: "spill-kit-response", delay: 3, seconds: 12,
      alert: "Someone from another department is walking straight toward the spill area, unaware it's an active chemical cleanup.",
      cue: "Get them behind the barrier before they walk through it.",
      target: "spill-barrier",
      why: "A spill area with no barrier around it looks, to anyone who wasn't there when it happened, like an ordinary wet spot to step around — pointing them behind the barrier is what keeps a contained cleanup from becoming a second person's exposure.",
      missNote: "They walked through the spill area before anyone redirected them. Whatever was in that spill, it's now on a second person's shoes, tracked toward wherever they were headed.",
      wrongNote: "It's the spill barrier — get them behind it before they walk through the area.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.6, GR8_ACCENT);

    const floorTex = surfaceTexture((cx, w, h) => tileFace(cx, w, h, { tiles: 6, tile: 0xe4e9ec, grout: "#aeb6ba" }), { repeat: 5, px: 512 });
    const floor = box(g, 6.2, 0.1, 5.4, 0, 0.05, 0, 0xe4e9ec, { rough: 0.5, metal: 0.06 });
    floor.material = texturedMat(floorTex, { rough: 0.5, metal: 0.06, color: 0xe4e9ec });

    const stripeTex = surfaceTexture((cx, w, h) => safetyStripeFace(cx, w, h, {}), { repeat: 2, px: 256 });
    const stripe = slab(g, 1.0, 0.005, 0.6, -1.6, 0.006, 0.2, 0xf2c14b, { rough: 0.7, cast: false });
    stripe.material = texturedMat(stripeTex, { rough: 0.75, color: 0xf2c14b });

    // Chemical storage shelving: pharmacy side and floral side.
    const shelfA = group(g, -1.8, 0, -1.6);
    for (let s = 0; s < 3; s++) box(shelfA, 1.2, 0.03, 0.4, 0, 0.4 + s * 0.42, 0, 0x9aa1a8, { rough: 0.4, metal: 0.6 });
    for (const sx of [-0.55, 0.55]) cyl(shelfA, 0.02, 0.02, 1.3, sx, 0.7, 0.16, 0x8b929a, { rough: 0.4, metal: 0.5, seg: 8 });
    holoTag(shelfA, "pharmacy chemicals", 0, 1.4, 0, { css: "#4fd6a5", w: 0.4 });

    const cleanerA = box(shelfA, 0.14, 0.2, 0.12, -0.4, 0.52, 0, 0xdfe4e8, { rough: 0.4, opacity: 0.85 });
    void cleanerA;
    const incompatible = box(shelfA, 0.14, 0.2, 0.12, 0.2, 0.52, 0, 0xf2c14b, { rough: 0.4 });
    decal(incompatible, 0.1, 0.06, 0, 0.11, 0.061, signFace("OXIDIZER", { bg: "#4a1a08", accent: "#f2ae14", scale: 0.4 }));
    holoTag(incompatible, "check compatibility", 0, 0.24, 0, { css: "#f0645b", w: 0.44 });
    reg(hits, incompatible, "incompatible-container");

    const leaking = box(shelfA, 0.14, 0.18, 0.12, -0.4, 0.94, 0, 0xdfe4e8, { rough: 0.4 });
    box(leaking, 0.1, 0.02, 0.02, 0, -0.09, 0.06, 0x9acd32, { rough: 0.3, opacity: 0.6, transparent: true });
    reg(hits, leaking, "leaking-container");
    const faded = box(shelfA, 0.14, 0.18, 0.12, 0.2, 0.94, 0, 0xdfe4e8, { rough: 0.4 });
    reg(hits, faded, "faded-label");
    const cleanContainer = box(shelfA, 0.14, 0.18, 0.12, 0, 0.94, 0, 0xdfe4e8, { rough: 0.4 });
    reg(hits, cleanContainer, "clean-container");
    const unlabeled = box(shelfA, 0.08, 0.14, 0.06, -0.15, 1.36, 0, 0xf2f2f2, { rough: 0.4, opacity: 0.9 });
    holoTag(unlabeled, "no label — use it anyway?", 0, 0.22, 0, { css: "#f0645b", w: 0.5 });
    reg(hits, unlabeled, "unlabeled-bottle");

    const segShelf = group(g, -2.4, 0, -0.6);
    box(segShelf, 0.6, 0.03, 0.4, 0, 0.9, 0, 0x59c97b, { rough: 0.4, metal: 0.5, opacity: 0.4, transparent: true });
    holoTag(segShelf, "segregated shelf", 0, 1.0, 0, { css: "#59c97b", w: 0.34 });
    reg(hits, segShelf, "segregated-shelf");

    // Floral side: preservative mixing station and bucket.
    const shelfB = group(g, 1.9, 0, -1.6);
    box(shelfB, 0.5, 0.7, 0.5, 0, 0.35, 0, 0xdfe4e8, { rough: 0.4, metal: 0.4 });
    const preservativeMeter = instrument(shelfB, 0, 0.75, 0.2, { idle: "--", color: GR8_ACCENT, w: 0.15, d: 0.12 });
    holoTag(preservativeMeter, "preservative meter", 0, 0.16, 0, { css: "#4fd6a5", w: 0.4 });
    reg(hits, preservativeMeter, "preservative-meter");
    const bucket = cyl(shelfB, 0.16, 0.14, 0.3, 0, 0.15, 0.3, 0x2b3138, { rough: 0.5, metal: 0.3, seg: 16 });
    const mixZone = box(shelfB, 0.24, 0.1, 0.24, 0, 0.32, 0.3, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, mixZone, "mix-incompatible-chemicals");
    holoTag(shelfB, "floral chemicals", 0, 0.9, 0, { css: "#4fd6a5", w: 0.36 });

    // SDS binder and compatibility chart at the workbench.
    const bench = group(g, -0.3, 0, -0.6);
    box(bench, 1.2, 0.06, 0.6, 0, 0.9, 0, 0xc9d0d6, { rough: 0.35, metal: 0.6 });
    for (const lx of [-0.5, 0.5]) box(bench, 0.05, 0.86, 0.55, lx, 0.47, 0, 0x8b929a, { rough: 0.5, metal: 0.5 });
    const sdsBinder = group(bench, -0.3, 0.94, 0);
    box(sdsBinder, 0.2, 0.04, 0.26, 0, 0, 0, 0xd8232a, { rough: 0.6 });
    decal(sdsBinder, 0.16, 0.2, 0, 0.021, 0, signFace("SDS", { bg: "#f4ecda", fg: "#241a08", accent: "#d8232a", scale: 0.5 })).rotation.x = -Math.PI / 2;
    holoTag(sdsBinder, "SDS binder", 0, 0.2, 0, { css: "#4fd6a5", w: 0.3 });
    reg(hits, sdsBinder, "sds-binder");
    const compatChart = holoPanel(bench, 0.5, 0.36, 0.3, 0.5, 0, (ctx, w, h) => {
      ctx.fillStyle = "#0a2420"; ctx.fillRect(0, 0, w, h); ctx.fillStyle = "#4fd6a5"; ctx.fillRect(0, 0, w, 5);
      ctx.font = `600 ${Math.round(h * 0.12)}px 'Barlow Condensed', Arial, sans-serif`; ctx.textAlign = "left"; ctx.textBaseline = "middle";
      ctx.fillStyle = "#d8f7ee"; ctx.fillText("COMPATIBILITY CHART", w * 0.06, h * 0.18);
      ctx.font = `${Math.round(h * 0.09)}px Arial, sans-serif`; ctx.fillStyle = "#e8fbf4";
      ["Segregate oxidizers", "Segregate acids/bases", "Check SDS before storing"].forEach((l, i) => ctx.fillText(l, w * 0.06, h * (0.38 + i * 0.15)));
    }, { accent: GR8_ACCENT });
    reg(hits, compatChart, "compat-chart");

    // Inventory board.
    const invBoard = holoPanel(g, 0.5, 0.36, -2.3, 1.5, 0.6, (ctx, w, h) => {
      ctx.fillStyle = "#0a2420"; ctx.fillRect(0, 0, w, h); ctx.fillStyle = "#4fd6a5"; ctx.fillRect(0, 0, w, 5);
      ctx.font = `600 ${Math.round(h * 0.13)}px 'Barlow Condensed', Arial, sans-serif`; ctx.textAlign = "left"; ctx.textBaseline = "middle";
      ctx.fillStyle = "#d8f7ee"; ctx.fillText("CHEMICAL INVENTORY", w * 0.08, h * 0.2);
      ctx.font = `${Math.round(h * 0.09)}px Arial, sans-serif`; ctx.fillStyle = "#e8fbf4";
      ["Pharmacy: 6 items", "Floral: 4 items", "All logged this week"].forEach((l, i) => ctx.fillText(l, w * 0.08, h * (0.4 + i * 0.15)));
    }, { accent: GR8_ACCENT });
    reg(hits, invBoard, "chem-inventory-board");

    // PPE: chemical gloves and goggles.
    const ppeHooks = group(g, 0.9, 0, -0.6);
    box(ppeHooks, 0.02, 0.7, 0.02, 0, 0.9, 0, 0x8b929a, { rough: 0.5, metal: 0.5, cast: false });
    const chemGloves = ball(ppeHooks, 0.055, -0.12, 0.72, 0, 0xf2c14b, { rough: 0.4, seg: 12 });
    holoTag(ppeHooks, "chemical gloves", -0.12, 0.82, 0, { css: "#4fd6a5", w: 0.36 });
    reg(hits, chemGloves, "chem-gloves");
    const goggles = torus(ppeHooks, 0.055, 0.016, 0.12, 0.6, 0, 0xdfe4e8, { rough: 0.3, opacity: 0.7, transparent: true, seg: 8, seg2: 20 });
    holoTag(ppeHooks, "splash goggles", 0.12, 0.7, 0, { css: "#4fd6a5", w: 0.34 });
    reg(hits, goggles, "goggles");
    const skipGogglesZone = box(ppeHooks, 0.2, 0.2, 0.1, 0, 0.5, 0.1, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, skipGogglesZone, "skip-ppe-goggles");

    // Spill kit, broom, waste bag, hazmat bin.
    const spillArea = group(g, 0.6, 0, 0.7);
    const spillKit = box(spillArea, 0.3, 0.15, 0.22, -0.3, 0.1, 0, 0xd8232a, { rough: 0.5 });
    decal(spillKit, 0.24, 0.1, 0, 0.076, 0.111, signFace("SPILL KIT", { bg: "#5a1a12", accent: "#ffffff", scale: 0.4 }));
    reg(hits, spillKit, "spill-kit");
    const spillPuddle = slab(spillArea, 0.5, 0.005, 0.4, 0.1, 0.006, 0.15, 0x9acd32, { rough: 0.2, opacity: 0.5, transparent: true, cast: false });
    void spillPuddle;
    const spillBroom = group(spillArea, 0.4, 0, 0.3);
    cyl(spillBroom, 0.012, 0.012, 0.8, 0, 0.4, 0, 0x8a6f5a, { rough: 0.7, seg: 8 });
    box(spillBroom, 0.2, 0.06, 0.04, 0, 0.03, 0, 0x2b2f34, { rough: 0.7 });
    reg(hits, spillBroom, "spill-broom");
    const spillWasteBag = group(spillArea, -0.1, 0, 0.4);
    box(spillWasteBag, 0.2, 0.2, 0.15, 0, 0.1, 0, 0xf2c14b, { rough: 0.6, opacity: 0.85 });
    reg(hits, spillWasteBag, "spill-waste-bag");
    const hazmatBin = group(g, -0.5, 0, 1.3);
    cyl(hazmatBin, 0.18, 0.16, 0.5, 0, 0.25, 0, 0xd8232a, { rough: 0.5, metal: 0.3, seg: 16 });
    decal(hazmatBin, 0.14, 0.08, 0, 0.4, 0.17, signFace("HAZMAT", { bg: "#3a0d0d", accent: "#ffffff", scale: 0.4 }));
    holoTag(hazmatBin, "hazmat bin", 0, 0.55, 0, { css: "#4fd6a5", w: 0.3 });
    reg(hits, hazmatBin, "hazmat-bin");

    // Spill barrier used for the second interrupt.
    const spillBarrier = group(g, 1.1, 0, 1.1);
    for (const bx of [-0.3, 0.3]) cyl(spillBarrier, 0.06, 0.06, 0.5, bx, 0.25, 0, 0xf2c14b, { rough: 0.6, seg: 10 });
    box(spillBarrier, 0.6, 0.04, 0.04, 0, 0.4, 0, 0xf2c14b, { rough: 0.6 });
    holoTag(spillBarrier, "spill barrier", 0, 0.6, 0, { css: "#f2c14b", w: 0.3 });
    reg(hits, spillBarrier, "spill-barrier");

    // Boxes blocking the eyewash — the hazard hotspot — and the eyewash itself.
    const eyewash = group(g, 2.3, 0, 0.6);
    box(eyewash, 0.3, 0.9, 0.15, 0, 0.45, 0, 0x9aa1a8, { rough: 0.4, metal: 0.6 });
    cyl(eyewash, 0.06, 0.06, 0.04, 0.1, 0.85, 0.08, 0xdfe4e8, { rough: 0.3, metal: 0.6, seg: 14 });
    holoTag(eyewash, "eyewash station", 0, 1.05, 0, { css: "#4fd6a5", w: 0.36 });
    reg(hits, eyewash, "eyewash-station");
    const blockingBoxes = group(g, 2.0, 0, 0.55);
    for (let i = 0; i < 3; i++) box(blockingBoxes, 0.3, 0.24, 0.3, 0, 0.13 + i * 0.25, 0, 0xc9a86a, { rough: 0.7 });
    reg(hits, blockingBoxes, "block-eyewash-path");

    // Ventilation fan switch.
    const ventSwitch = group(g, -1.2, 0, 1.0);
    box(ventSwitch, 0.1, 0.14, 0.04, 0, 1.1, 0, 0x2b2f34, { rough: 0.5, metal: 0.4 });
    const fanKnob = cyl(ventSwitch, 0.03, 0.03, 0.03, 0, 1.1, 0.03, GR8_ACCENT, { rough: 0.4, metal: 0.5, seg: 10 });
    reg(hits, fanKnob, "vent-fan-switch");
    holoTag(ventSwitch, "vent fan", 0, 1.3, 0, { css: "#4fd6a5", w: 0.28 });

    // Incident form and chemical handling log.
    const incidentForm = group(g, 2.6, 0, -0.6);
    slab(incidentForm, 0.24, 0.02, 0.32, 0, 0.92, 0, 0x2b2f34, { radius: 0.01, rough: 0.6 });
    decal(incidentForm, 0.2, 0.26, 0, 0.93, 0.161, signFace("INCIDENT FORM", { bg: "#f4ecda", fg: "#241a08", accent: "#b8402f", scale: 0.4 })).rotation.x = -Math.PI / 2;
    holoTag(incidentForm, "incident form", 0, 1.1, 0, { css: "#4fd6a5", w: 0.34 });
    reg(hits, incidentForm, "incident-form");
    const chemLog = group(g, 2.8, 0, -1.3);
    slab(chemLog, 0.24, 0.02, 0.32, 0, 0.92, 0, 0x2b2f34, { radius: 0.01, rough: 0.6 });
    decal(chemLog, 0.2, 0.26, 0, 0.93, 0.161, signFace("CHEM LOG", { bg: "#f4ecda", fg: "#241a08", accent: "#2f6f8c", scale: 0.44 })).rotation.x = -Math.PI / 2;
    holoTag(chemLog, "chem log", 0, 1.1, 0, { css: "#4fd6a5", w: 0.28 });
    reg(hits, chemLog, "chem-log");

    const clerk = standingFigure(g, 0, 1.1, { ry: Math.PI, outfit: "clinical" });
    void clerk;
    const coworker = group(g, 1.5, 0, -0.5);
    standingFigure(coworker, 0, 0, { ry: 2.2, outfit: "clinical" });
    coworker.visible = false;
    const bystander = group(g, 2.0, 0, 1.7);
    standingFigure(bystander, 0, 0, { ry: -1.5, outfit: "kitchen" });
    bystander.visible = false;

    const arcSpark = particles(g, 12, 0xbfe9ff, { size: 0.012, life: 0.25 });
    void arcSpark;

    return {
      hits,
      spawnLook: new THREE.Vector3(-0.1, 1.1, -0.6),
      onStepComplete(step) {
        if (step.id === "segregate-incompatible") { incompatible.parent.remove(incompatible); segShelf.add(incompatible); incompatible.position.set(0, 0, 0); }
        if (step.id === "walk-chem-storage") { leaking.material = mat(GR8_ACCENT, { rough: 0.5 }); faded.material = mat(GR8_ACCENT, { rough: 0.5 }); }
        if (step.id === "dispose-spill-waste") { spillWasteBag.parent.remove(spillWasteBag); hazmatBin.add(spillWasteBag); spillWasteBag.position.set(0, 0.3, 0); }
        if (step.id === "sweep-controlled") spillPuddle.visible = false;
      },
      onInterrupt(it) {
        if (it.id === "coworker-combines-concentrates") coworker.visible = true;
        if (it.id === "bystander-near-spill") bystander.visible = true;
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "coworker-combines-concentrates") coworker.visible = false;
        if (it.id === "bystander-near-spill") bystander.visible = false;
      },
      onHazard() {},
      animate(t, dt, session) {
        const step = session?.step;
        const gg = session?.gauge;
        if (gg && !gg.committed && step?.id === "dilute-preservative") {
          const ok = gg.t >= 0.35 && gg.t <= 0.6;
          repaint(preservativeMeter.userData.screen, signFace(ok ? "ON LABEL" : gg.t < 0.35 ? "WEAK" : "STRONG", { bg: "#0a2420", accent: ok ? "#59c97b" : "#f2ae14", fg: "#e8fbf4", scale: 0.4 }));
        }
        if (session?.turn && step?.id === "ventilation-fan") fanKnob.rotation.y = session.turn.amount * Math.PI;
        void t; void dt;
      },
    };
  },
};
