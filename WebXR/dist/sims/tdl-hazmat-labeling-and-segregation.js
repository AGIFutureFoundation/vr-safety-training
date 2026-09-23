import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import { box, cyl, slab, group, decal, repaint, signFace, paperFace, mat } from "../../../shared/kit.js";
import {
  stationPad, holoPanel, holoTag, instrument, standingFigure,
  surfaceTexture, texturedMat, pavingFace, reg,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Hazmat Labeling and Segregation VR — Mobility & Transit, the
// fourth of five warehouse stations in the Job Readiness Edition's TDL
// pre-apprenticeship block. A hazmat staging cage at an outbound door: the
// shipping paper read for what the regulations actually key on, the PPE and
// the eyewash checked before a drum is touched, packages audited for the
// label, the marking and the orientation arrows, a drum weighed against its
// paper and its bung checked, moved on a drum truck and staged away from what
// it must never meet, the emergency response information attached, a pallet
// wrapped, the trailer's placards walked on every side, and the paper signed
// and handed to the driver.
//
// Sited generically: no real shipper, no real product, no segregation-table
// cell or clause number the registry is not sure of — the rules are named by
// their part and the chemistry by the safety data sheet.

const HZL_ACCENT = 0xe0663a;
const HZL_DRUM = 0x2f5fa8;
const HZL_WOOD = 0x9a7a55;

export const SIM_TDL_HAZMAT_LABELING_AND_SEGREGATION = {
  id: "tdl-hazmat-labeling-and-segregation",
  index: "220",
  domain: "Warehouse & Distribution",
  trade: "Hazmat shipping associate, TDL pre-apprenticeship — Teamsters warehouse and freight work: hazmat labelling and segregation, ahead of the entry-level driver training rule (FMCSA 49 CFR 380 Subpart F) for those going on to Class A",
  category: "Mobility & Transit",
  indoor: "garage",
  certification: "PHMSA 49 CFR 172 — the hazardous materials table, shipping papers and the shipper's certification, package marking and labels, placarding, emergency response information, and the hazmat employee training every person who handles or prepares a shipment must have, refreshed at least every three years; 49 CFR 177 for loading and segregation on the vehicle; OSHA 29 CFR 1910.1200 hazard communication and the safety data sheet; 29 CFR 1910.132 personal protective equipment; ANSI Z358.1 for the eyewash; 29 CFR 1910.178 for the truck that loads the trailer; Teamsters freight and warehouse locals' hazmat training",
  name: "Hazmat Labeling and Segregation",
  title: simTitle("Hazmat Labeling and Segregation"),
  tagline: "A hazmat staging cage at an outbound door: the paper read, PPE and eyewash, labels, marks and arrows audited, a drum weighed and its bung checked, staged away from what it must never meet, emergency information attached, placards walked on every side, and the paper signed to the driver",
  accent: HZL_ACCENT,
  accentCss: "#e0663a",
  parSeconds: 280,
  footprint: 2.4,
  badge: { id: "segregated", name: "Segregated", note: "A hazmat shipment staged away from its incompatibles, with every label, mark and placard right and the paper signed — first time" },

  game: system({
    name: "Hazmat Shipping",
    currency: "PAPER",
    ranks: ["Hazmat Trainee", "Hazmat Employee", "Hazmat Shipper", "Hazmat Lead", "Hazmat Shipping Certified"],
    badges: [
      { id: "label-reader", name: "Label Reader", note: "Every package fault found without a hint", test: AWARD.stepClean("label-audit") },
      { id: "kept-apart", name: "Kept Apart", note: "Never staged with an incompatible, stacked a drum on freight or shipped a damaged package", test: AWARD.safe },
      { id: "four-sides", name: "Four Sides", note: "The placard walk and the handoff both done clean", test: AWARD.all(AWARD.stepClean("placard-walk"), AWARD.stepClean("handoff")) },
    ],
    challenges: [
      { id: "clean-shipment", name: "Clean Shipment", note: "No corrections anywhere in the cage", test: AWARD.clean },
      { id: "on-the-paper", name: "On the Paper", note: "The drum weight read near the centre of the band", test: AWARD.precise(0.7) },
      { id: "cutoff", name: "Before the Cutoff", note: "Finished inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "hzl-bay-oxidizer": "You went to stage the acid drum in the bay beside the pool-chlorine pails. The acid's safety data sheet lists oxidizers such as hypochlorites among its incompatible materials: if either leaks into the other, the mixture gives off chlorine gas in an enclosed trailer. Incompatibles are staged apart in the building and loaded apart on the vehicle.",
    "hzl-dented-drum": "You went to ship the drum with the crease across its chime and the stain down its side. A damaged or leaking package is not offered for transport: it is overpacked or repackaged by someone trained to do it, because the dent is where it splits when the driver brakes.",
    "hzl-drum-on-cartons": "You went to stand the drum on top of the carton pallet. A 450 lb drum crushes the cartons under it, and if those are hazmat inner packagings the drum is now standing in whatever leaked from them. Drums go on the floor or on their own pallet, never on top of other freight.",
    "hzl-bare-hand-wipe": "You reached for a rag to wipe the residue off the drum lid with bare hands. Residue on a corrosive drum is corrosive; it goes through skin before it hurts. Gloves on, and the residue is treated as a leak until the safety data sheet says otherwise.",
  },

  lateNotes: {
    "hzl-corrosive-drum": "The drum is moved once it has been weighed and its bung checked — a drum is never staged on a guess about what it weighs or whether it is closed.",
    "hzl-wrap-roll": "The pallet is wrapped once every package on it has passed the label audit — wrapping first hides the labels you still need to read.",
    "hzl-driver-handoff": "The paper goes to the driver last, once it is signed and the placards have been walked.",
  },

  steps: [
    {
      id: "papers", kind: "select", target: "hzl-shipping-papers",
      title: "Read the shipping paper",
      cue: "Read the UN number, the proper shipping name, the hazard class, the packing group, the quantity and the emergency response phone number.",
      why: "The shipping paper is what every person after you acts on: the driver, the dock at the other end, and the firefighter who pulls it from the cab door pocket after a crash. The UN number, proper shipping name, class and packing group drive every label, placard and segregation decision in this cage, and an emergency number that nobody answers is a paper that fails the one time it is needed.",
    },
    {
      id: "ppe", kind: "sequence", anyOrder: true,
      targets: ["hzl-glasses", "hzl-gloves", "hzl-eyewash-tag"],
      itemNames: { "hzl-glasses": "splash goggles", "hzl-gloves": "chemical-resistant gloves", "hzl-eyewash-tag": "eyewash activation tag" },
      title: "PPE on and the eyewash checked",
      cue: "Goggles and chemical gloves on, and check the eyewash tag shows it was run this week.",
      why: "The safety data sheet for a corrosive names the protection it needs, and 29 CFR 1910.132 puts the duty on the employer to provide it and on the worker to wear it. The eyewash is the one piece of equipment you need within seconds and cannot go looking for; ANSI Z358.1 expects it to be activated weekly so the water in it is flowing and clean, and the tag is the proof.",
    },
    {
      id: "label-audit", kind: "find", noHint: true,
      targets: ["hzl-missing-label", "hzl-un-mismatch", "hzl-arrows-down"],
      itemNames: { "hzl-missing-label": "the corrosive carton with no label", "hzl-un-mismatch": "the drum whose UN number does not match the paper", "hzl-arrows-down": "the carton with its orientation arrows upside down" },
      itemNotes: {
        "hzl-missing-label": "This carton of corrosive inner bottles has no Class 8 label. A package without its label is a package nobody downstream knows to keep away from food, from oxidizers or from their own hands.",
        "hzl-un-mismatch": "The UN number stencilled on this drum is not the one on the paper. Either the drum or the paper is wrong, and responders act on both — it does not move until they agree.",
        "hzl-arrows-down": "The orientation arrows on this carton point down. Liquids in inner bottles have to travel upright, and the arrows are how every handler knows which way up that is.",
      },
      title: "Audit the packages against the paper",
      cue: "Walk the staged packages. Find what does not match the paper or the marking rules.",
      why: "49 CFR 172 requires the marks and labels on every package to match what it is: the proper shipping name and UN number, the hazard label for its class, and orientation arrows on packages of liquids in inner containers. Each check is quick, and each fault is invisible once the package is wrapped on a pallet in a dark trailer. The audit is the last time anybody reads these packages closely before an emergency does it for them.",
    },
    {
      id: "weigh", kind: "gauge", target: "hzl-scale",
      title: "Weigh the drum against the paper",
      cue: "Set the drum on the floor scale and commit when the gross weight matches the quantity on the paper.",
      why: "The quantity on the paper decides whether the trailer is placarded, what the driver must carry and what responders plan for. A drum that weighs more or less than its paper says is overfilled, underfilled or not what the paper claims. The aggregate weight of this class on the trailer is what the placarding rules key on, so a wrong weight here can mean a trailer that should be placarded and is not.",
      gauge: { label: "GROSS vs PAPER", speed: 0.7, green: [0.44, 0.62], readout: (t) => `${Math.round(300 + t * 300)} lb`, missNote: "The weight does not match the paper — find out which is wrong before the drum moves." },
    },
    {
      id: "bung", kind: "turn", target: "hzl-bung",
      title: "Check the bung and vent are tight",
      cue: "Turn the drum's bung with the bung wrench until it seats, and check the vent cap.",
      why: "A drum that is closed hand-tight at the filler loosens with vibration and temperature, and a corrosive that weeps from a bung on a moving trailer eats through pallets, straps and the next package. The closure is checked with the proper wrench before the drum is moved or staged, because a drum is only as closed as its loosest fitting.",
      turn: { turns: 0.75, axis: "y", label: "BUNG WRENCH" },
    },
    {
      id: "drum-truck", kind: "hold", target: "hzl-drum-truck", seconds: 8,
      title: "Balance the drum on the drum truck",
      cue: "Clamp the drum, tip it back to the balance point, and hold it there across the threshold into the cage.",
      why: "A full drum weighs several hundred pounds and has a balance point just past vertical on a drum truck: short of it, the drum tips forward onto your feet; past it, the weight comes onto your arms. Holding it on the balance point over the threshold, where the floor changes, is the part of the move where drums get dropped and split.",
      holdBreakNote: "The drum came off its balance point. Bring it back and hold it steady.",
    },
    {
      id: "stage", kind: "drag", target: "hzl-corrosive-drum",
      title: "Stage the drum in the corrosives bay",
      cue: "Set the acid drum in the corrosives bay, on the floor, clear of the oxidizer and flammable bays.",
      why: "Staging by class is what makes segregation automatic on the dock: when the loader pulls from the corrosives bay, nothing incompatible is standing next to it. 49 CFR 177 sets out which classes may not be loaded together or must be separated on the vehicle, and the safety data sheet says why in chemical terms. A drum staged in the wrong bay is a drum that gets loaded next to the wrong freight.",
      drag: { to: "hzl-bay-socket", radius: 0.45, missNote: "Not in the corrosives bay — the drum goes in its own class's bay, on the floor." },
    },
    {
      id: "emergency-info", kind: "select", target: "hzl-emergency-info",
      title: "Attach the emergency response information",
      cue: "Attach the emergency response information for this material to the shipping paper.",
      why: "49 CFR 172 requires emergency response information to travel with the shipment and to be immediately available: what the material does, the first aid, the fire and spill response, the isolation distance. It is written for a responder who arrives at a crash with no idea what is in the trailer, and it only helps if it is with the paper and not in a binder back at this cage.",
    },
    {
      id: "wrap", kind: "track", target: "hzl-wrap-roll", seconds: 8,
      title: "Wrap the carton pallet",
      cue: "Walk the roll around the pallet at a steady tension so the wrap binds the cartons to the pallet, labels facing out.",
      why: "Stretch wrap is what turns a stack of cartons into one unit that cannot shed a package on a turn. Too loose and the cartons shift inside it; too tight and it crushes corners and pulls cartons off square. The labels face out and the wrap stays clear enough to read them, because a label wrapped over with printed film is a label nobody can see.",
      track: { start: 0.1, green: [0.4, 0.62], rise: 0.55, fall: 0.46, drift: 0.12, label: "WRAP TENSION", readout: (v) => (v < 0.4 ? "slack" : v > 0.62 ? "crushing" : "binding") },
      holdBreakNote: "Tension out of band — slack wrap lets cartons move, crushing wrap tears them. Settle it.",
    },
    {
      id: "placard-walk", kind: "find", noHint: true,
      targets: ["hzl-side-missing", "hzl-leftover-placard"],
      itemNames: { "hzl-side-missing": "the empty placard holder on the side", "hzl-leftover-placard": "the flammable placard left from the last load" },
      itemNotes: {
        "hzl-side-missing": "The holder on this side is empty. A placarded trailer shows the placard on each side and each end, because a responder may only ever see one of them.",
        "hzl-leftover-placard": "This flammable placard belongs to yesterday's load. A placard for a material that is not on board is prohibited — it sends responders to fight the wrong fire.",
      },
      title: "Walk the trailer's placards",
      cue: "Walk around the trailer. Find what is wrong with the placards for what is actually on it.",
      why: "Placards are for the people who arrive when something has gone wrong: they read the trailer from a distance, from whichever side they come in on, before anyone walks up to it. 49 CFR 172 asks for a placard on each side and each end, and forbids a placard for a material that is not there. A missing placard and a wrong placard both put a responder in the wrong place.",
    },
    {
      id: "handoff", kind: "sequence",
      targets: ["hzl-cert-sign", "hzl-driver-handoff"],
      itemNames: { "hzl-cert-sign": "shipper's certification signed", "hzl-driver-handoff": "paper handed to the driver" },
      title: "Sign the certification and hand the paper to the driver",
      cue: "Sign the shipper's certification, then hand the paper and the emergency information to the driver and say what is on board.",
      why: "The shipper's certification is a signed statement that the materials are properly classified, described, packaged, marked, labelled and in proper condition for transport — every check you just did, in one sentence with your name under it. The driver keeps the paper within reach in the cab so that it is the first thing a responder finds; saying out loud what is on board is how the driver knows before reading it.",
      outOfOrderNote: "Sign first, then hand it over — an unsigned paper is not a shipping paper the driver can accept.",
    },
    {
      id: "crew-checkin", kind: "select", target: "hzl-crew-checkin",
      title: "Check in with the shipping lead",
      cue: "Report the held drum, the label faults, the spill and the leftover placard, and say how the shift is going.",
      why: "The drum with the wrong UN number and the carton with no label have to go back to whoever packed them, and the lead is the person who can make that happen before the next shipment goes out the same way. A spill cleaned up and never mentioned leaves a leaking container somewhere in the returns flow; the check-in is also where the lead hears whether the work felt rushed.",
    },
    {
      id: "hazmat-log", kind: "select", target: "hzl-hazmat-log",
      title: "Write the warehouse hazmat log",
      cue: "Log the shipment, the placards applied, the held packages and the spill response, then sign it.",
      why: "The hazmat log is the warehouse's record of what left the building, how it was placarded and what was held back, and it is what an inspector or an incident investigation reads first. A held drum with no log entry is a drum that ships tomorrow by mistake; a spill with no entry is a question nobody can answer when someone reports a burn a day later.",
    },
  ],

  interrupts: [
    {
      id: "jug-weeping",
      kind: "Leak in the cage",
      after: "drum-truck", delay: 3, seconds: 12,
      alert: "A jug in the returns cart beside you has started weeping onto the floor, and the puddle is spreading toward the drain.",
      cue: "Contain the leak before it spreads.",
      target: "hzl-spill-kit",
      why: "A small leak is contained with the spill kit before it reaches a drain, a pallet or a shoe: absorbent socks around it, pads on it, the leaking container into an overpack. The safety data sheet tells you what it is; the kit is what stops it becoming a bigger problem while you look it up.",
      missNote: "You left a leak spreading while you worked. A weeping container that reaches a floor drain becomes an environmental release, and one that reaches the foot traffic becomes a chemical burn through a boot sole.",
      wrongNote: "It is the spill kit. Something is leaking onto the floor right beside you, and containing it comes before anything else in this cage.",
    },
    {
      id: "placard-falls",
      kind: "Placard off",
      after: "wrap", delay: 3, seconds: 12,
      alert: "The corrosive placard on the trailer's rear door has slipped out of its holder and is lying face-down on the dock.",
      cue: "Get the placard back on the trailer.",
      target: "hzl-placard-spare",
      why: "A trailer that should be placarded and is not looks like ordinary freight to everyone who sees it. Putting the placard back — a clean one, secured — before the trailer leaves the door is the only fix; nobody downstream will know it fell off.",
      missNote: "The trailer went unplacarded on one end. A responder coming up behind it after a crash sees a plain van, not a load of corrosive, and walks up to it without protection.",
      wrongNote: "It is the spare placard. The trailer has just lost the one sign that tells a responder what is inside it.",
    },
  ],

  supportLine: "your employer's employee assistance programme, or your Teamsters steward if you are not sure how to reach it",

  build(root) {
    const hits = {};
    const g = group(root);
    const reg2 = (obj, id) => reg(hits, obj, id);
    stationPad(g, 2.4, HZL_ACCENT);

    // ------------------------------------------------------------ floor and the cage
    const floor = box(g, 6.8, 0.1, 6.2, 0, 0.05, -0.1, 0xffffff, { rough: 0.9 });
    floor.material = texturedMat(surfaceTexture((cx, w, h) => pavingFace(cx, w, h, {
      tiles: 4, base: "#6e6a66", base2: "#615d59", seam: "rgba(0,0,0,0.35)",
    }), { repeat: 4, px: 512 }), { rough: 0.9, metal: 0.03, color: 0xc8c4c0 });
    // Cage mesh panels along the back, and bay dividers painted on the floor.
    for (const x of [-2.7, -1.5, -0.3]) {
      box(g, 0.05, 2.2, 0.05, x, 1.2, -1.2, 0x59636d, { rough: 0.5, metal: 0.5 });
      box(g, 1.15, 2.1, 0.02, x + 0.6, 1.15, -2.6, 0x8b959c, { rough: 0.6, metal: 0.4, opacity: 0.45 });
    }
    for (const [x, label, css] of [[-2.1, "CLASS 3 · FLAMMABLE", "#d2312b"], [-0.9, "CLASS 5.1 · OXIDIZER", "#f2c14b"], [0.3, "CLASS 8 · CORROSIVE", "#e8eef2"]]) {
      box(g, 1.1, 0.006, 1.2, x, 0.103, -1.95, 0xf2c14b, { rough: 0.7, opacity: 0.25, cast: false });
      holoTag(g, label, x, 2.45, -2.55, { css, w: 0.5 });
    }
    // The flammable cabinet in bay one.
    const cab = group(g, -2.1, 0.1, -2.2);
    box(cab, 0.9, 1.6, 0.5, 0, 0.8, 0, 0xf2c14b, { rough: 0.5, metal: 0.3 });
    decal(cab, 0.5, 0.18, 0, 1.2, 0.26, signFace("FLAMMABLE — KEEP FIRE AWAY", { bg: "#f2c14b", fg: "#d2312b", accent: "#d2312b", scale: 0.35 }), { px: 192 });
    // The oxidizer bay: pool-chlorine pails.
    const ox = group(g, -0.9, 0.1, -2.0);
    for (const [dx, dz] of [[-0.25, -0.2], [0.2, -0.2], [-0.25, 0.25], [0.2, 0.25]]) {
      cyl(ox, 0.16, 0.15, 0.4, dx, 0.2, dz, 0xeef2f4, { rough: 0.6, seg: 14 });
      cyl(ox, 0.165, 0.165, 0.04, dx, 0.42, dz, 0x2f7fbf, { rough: 0.5, seg: 14 });
    }
    decal(ox, 0.2, 0.2, 0.2, 0.25, 0.41, signFace("5.1", { bg: "#f2c14b", fg: "#1b1e23", accent: "#1b1e23", scale: 0.6 }), { px: 96 });
    const oxBay = slab(g, 1.0, 0.02, 0.5, -0.9, 0.12, -1.45, 0xd2312b, { radius: 0.02, rough: 0.6, opacity: 0.35, cast: false });
    holoTag(g, "stage the acid here?", -0.9, 0.34, -1.45, { css: "#d2312b", w: 0.36 });
    reg2(oxBay, "hzl-bay-oxidizer");
    // The corrosives bay socket, and the other acid drums already there.
    const baySocket = box(g, 0.6, 0.05, 0.6, 0.55, 0.13, -1.75, 0xffffff, { rough: 0.5 });
    baySocket.visible = false; hits["hzl-bay-socket"] = baySocket;
    const drum = (parent, x, z, c = HZL_DRUM) => {
      const d = group(parent, x, 0.1, z);
      cyl(d, 0.28, 0.28, 0.88, 0, 0.44, 0, c, { rough: 0.5, seg: 18 });
      cyl(d, 0.29, 0.29, 0.03, 0, 0.3, 0, 0x244a82, { rough: 0.5, seg: 18 });
      cyl(d, 0.29, 0.29, 0.03, 0, 0.62, 0, 0x244a82, { rough: 0.5, seg: 18 });
      return d;
    };
    const d1 = drum(g, 0.05, -2.25);
    decal(d1, 0.2, 0.2, 0, 0.5, 0.285, signFace("8", { bg: "#ffffff", fg: "#1b1e23", accent: "#1b1e23", scale: 0.6 }), { px: 96 });
    const mismatched = drum(g, 0.65, -2.3);
    const unMark = decal(mismatched, 0.26, 0.1, 0, 0.72, 0.285, signFace("UN 1830", { bg: "#2f5fa8", accent: "#ffffff", scale: 0.5 }), { px: 128 });
    reg2(unMark, "hzl-un-mismatch");
    const dented = drum(g, 1.35, -1.25, 0x2a5596);
    const crease = box(dented, 0.3, 0.05, 0.06, 0, 0.8, 0.26, 0x1b2a44, { rough: 0.8 });
    crease.rotation.z = 0.3;
    box(dented, 0.08, 0.5, 0.01, 0.1, 0.4, 0.285, 0x5a4a2a, { rough: 0.9 });
    holoTag(dented, "dented, stained — ship it?", 0, 1.15, 0, { css: "#d2312b", w: 0.44 });
    reg2(dented, "hzl-dented-drum");

    // ------------------------------------------------------------ the drum to ship, the scale, the truck
    const acid = drum(g, 1.6, 0.35);
    decal(acid, 0.2, 0.2, 0, 0.5, 0.285, signFace("8", { bg: "#ffffff", fg: "#1b1e23", accent: "#1b1e23", scale: 0.6 }), { px: 96 });
    decal(acid, 0.3, 0.1, 0, 0.72, 0.285, signFace("UN 2796", { bg: "#2f5fa8", accent: "#ffffff", scale: 0.5 }), { px: 128 });
    reg2(acid, "hzl-corrosive-drum");
    const bung = cyl(acid, 0.05, 0.05, 0.03, 0.12, 0.9, 0.08, 0xd9dde2, { rough: 0.3, metal: 0.8, seg: 10 });
    reg2(bung, "hzl-bung");
    const residue = box(acid, 0.14, 0.005, 0.1, -0.1, 0.885, -0.08, 0xd8d0a0, { rough: 0.4 });
    void residue;
    const rag = group(g, 2.3, 0.1, -0.2);
    box(rag, 0.3, 0.7, 0.3, 0, 0.35, 0, 0x59636d, { rough: 0.6 });
    box(rag, 0.22, 0.03, 0.18, 0, 0.72, 0, 0xd9dde2, { rough: 0.95 });
    holoTag(rag, "wipe it — no gloves?", 0, 0.95, 0, { css: "#d2312b", w: 0.34 });
    reg2(rag, "hzl-bare-hand-wipe");
    const scalePlate = box(g, 0.9, 0.05, 0.9, 1.6, 0.125, 0.35, 0x8b959c, { rough: 0.5, metal: 0.5 });
    void scalePlate;
    const scaleHead = instrument(g, 2.25, 1.1, 0.75, { idle: "0 lb", color: HZL_ACCENT, w: 0.16, d: 0.18, ry: -0.8 });
    reg2(scaleHead, "hzl-scale");
    holoTag(g, "floor scale", 2.25, 1.32, 0.75, { css: "#e0663a", w: 0.2 });
    const dtruck = group(g, 0.9, 0.1, 0.55, -0.3);
    for (const sx of [-1, 1]) box(dtruck, 0.04, 1.3, 0.04, sx * 0.2, 0.65, 0, 0x2f7fbf, { rough: 0.5, metal: 0.4 });
    box(dtruck, 0.46, 0.04, 0.04, 0, 1.28, 0, 0x2f7fbf, { rough: 0.5, metal: 0.4 });
    for (const sx of [-1, 1]) cyl(dtruck, 0.12, 0.12, 0.06, sx * 0.24, 0.12, 0.08, 0x1c1f23, { rough: 0.8, seg: 14 }).rotation.z = Math.PI / 2;
    const clamp = box(dtruck, 0.34, 0.05, 0.1, 0, 0.75, -0.08, 0x59636d, { rough: 0.5, metal: 0.5 });
    holoTag(dtruck, "drum truck", 0, 1.5, 0, { css: "#e0663a", w: 0.2 });
    reg2(dtruck, "hzl-drum-truck");
    void clamp;

    // ------------------------------------------------------------ the carton pallet
    const cartons = group(g, -1.4, 0.1, 0.35);
    box(cartons, 1.0, 0.13, 1.1, 0, 0.065, 0, HZL_WOOD, { rough: 0.9 });
    for (const [dx, dz] of [[-0.25, -0.27], [0.25, -0.27], [-0.25, 0.27], [0.25, 0.27]]) box(cartons, 0.46, 0.4, 0.5, dx, 0.33, dz, 0xc9a978, { rough: 0.85 });
    for (const dx of [-0.25, 0.25]) decal(cartons, 0.14, 0.14, dx, 0.35, 0.521, signFace("8", { bg: "#ffffff", fg: "#1b1e23", accent: "#1b1e23", scale: 0.55 }), { px: 96 });
    const noLabel = box(cartons, 0.46, 0.4, 0.5, 0.25, 0.73, 0.27, 0xc9a978, { rough: 0.85 });
    reg2(noLabel, "hzl-missing-label");
    const arrows = decal(cartons, 0.12, 0.12, -0.25, 0.33, -0.521, signFace("↓↓", { bg: "#c9a978", fg: "#d2312b", accent: "#d2312b", scale: 0.6 }), { px: 96 });
    arrows.rotation.y = Math.PI;
    reg2(arrows, "hzl-arrows-down");
    const onTop = slab(cartons, 0.9, 0.02, 0.9, 0, 0.98, 0, 0xd2312b, { radius: 0.02, rough: 0.6, opacity: 0.3, cast: false });
    holoTag(cartons, "stand the drum up here?", 0, 1.2, 0, { css: "#d2312b", w: 0.42 });
    reg2(onTop, "hzl-drum-on-cartons");
    const wrapFilm = box(cartons, 1.0, 0.82, 1.1, 0, 0.53, 0, 0xdfe8ee, { rough: 0.2, opacity: 0.28, cast: false });
    wrapFilm.visible = false;
    const wrapRoll = group(g, -0.6, 0.1, 0.95);
    cyl(wrapRoll, 0.06, 0.06, 0.5, 0, 0.9, 0, 0xdfe8ee, { rough: 0.3, seg: 12 });
    cyl(wrapRoll, 0.02, 0.02, 0.7, 0, 0.9, 0, 0x2b2f34, { rough: 0.5, seg: 8 });
    holoTag(wrapRoll, "stretch wrap", 0, 1.3, 0, { css: "#e0663a", w: 0.22 });
    reg2(wrapRoll, "hzl-wrap-roll");

    // ------------------------------------------------------------ PPE station, eyewash, spill kit
    const ppe = group(g, -2.55, 0.1, 0.9, Math.PI / 2);
    box(ppe, 0.6, 1.2, 0.1, 0, 1.1, 0, 0x53585e, { rough: 0.5, metal: 0.3 });
    const goggles = box(ppe, 0.18, 0.07, 0.06, -0.15, 1.35, 0.08, 0x2f7fbf, { rough: 0.3 });
    reg2(goggles, "hzl-glasses");
    const gloves = box(ppe, 0.16, 0.12, 0.06, 0.15, 1.35, 0.08, 0x3a8a4a, { rough: 0.6 });
    reg2(gloves, "hzl-gloves");
    const eyewash = group(g, -2.55, 0.1, 2.0, Math.PI / 2);
    box(eyewash, 0.06, 1.0, 0.06, 0, 0.5, 0, 0x3a8a4a, { rough: 0.5 });
    cyl(eyewash, 0.14, 0.12, 0.06, 0, 1.05, 0.12, 0x59c97b, { rough: 0.4, seg: 14 });
    decal(eyewash, 0.24, 0.12, 0, 1.4, 0.04, signFace("EYEWASH", { bg: "#3a8a4a", accent: "#ffffff", scale: 0.45 }), { px: 128 });
    const tag = box(eyewash, 0.08, 0.12, 0.01, 0.1, 0.8, 0.04, 0xf2ede0, { rough: 0.7 });
    reg2(tag, "hzl-eyewash-tag");
    const spill = group(g, 2.3, 0.1, 1.9);
    box(spill, 0.6, 0.55, 0.45, 0, 0.28, 0, 0xf2c14b, { rough: 0.6 });
    decal(spill, 0.46, 0.14, 0, 0.35, 0.226, signFace("SPILL KIT", { bg: "#f2c14b", fg: "#1b1e23", accent: "#1b1e23", scale: 0.45 }), { px: 128 });
    reg2(spill, "hzl-spill-kit");
    const returns = group(g, 0.1, 0.1, 1.9);
    box(returns, 0.7, 0.5, 0.5, 0, 0.45, 0, 0x59636d, { rough: 0.5, metal: 0.4 });
    for (const dx of [-0.2, 0.05, 0.25]) cyl(returns, 0.07, 0.07, 0.24, dx, 0.82, 0, 0xeef2f4, { rough: 0.5, seg: 10 });
    const puddle = cyl(g, 0.4, 0.4, 0.004, 0.2, 0.104, 1.4, 0xb8b060, { rough: 0.1, opacity: 0.8, seg: 20, cast: false });
    puddle.visible = false;
    const pads = box(g, 0.7, 0.01, 0.6, 0.2, 0.108, 1.4, 0xeef2f4, { rough: 0.95, cast: false });
    pads.visible = false;

    // ------------------------------------------------------------ the trailer at the door, rear to the dock
    const trl = group(g, 1.9, 0.1, -3.9, 0.35);
    for (const sx of [-1, 1]) box(trl, 0.05, 2.5, 3.2, sx * 1.25, 1.35, 0, 0xe8eef2, { rough: 0.7 });
    box(trl, 2.55, 0.05, 3.2, 0, 2.62, 0, 0xe8eef2, { rough: 0.7 });
    box(trl, 2.5, 0.12, 3.2, 0, 0.12, 0, 0x7d8288, { rough: 0.85 });
    for (const sx of [-1, 1]) box(trl, 1.2, 2.4, 0.05, sx * 0.62, 1.35, 1.62, 0xd9dde2, { rough: 0.7 });
    const rearHolder = box(trl, 0.34, 0.34, 0.02, 0.62, 1.35, 1.66, 0x59636d, { rough: 0.5, metal: 0.4 });
    void rearHolder;
    const rearPlacard = decal(trl, 0.3, 0.3, 0.62, 1.35, 1.675, signFace("8", { bg: "#ffffff", fg: "#1b1e23", accent: "#1b1e23", scale: 0.7 }), { px: 128 });
    rearPlacard.rotation.z = Math.PI / 4;
    const sideHolder = box(trl, 0.02, 0.34, 0.34, -1.28, 1.35, 0.6, 0x59636d, { rough: 0.5, metal: 0.4 });
    reg2(sideHolder, "hzl-side-missing");
    const leftover = decal(trl, 0.3, 0.3, -0.62, 1.35, 1.675, signFace("3", { bg: "#d2312b", fg: "#ffffff", accent: "#ffffff", scale: 0.7 }), { px: 128 });
    leftover.rotation.z = Math.PI / 4;
    reg2(leftover, "hzl-leftover-placard");
    const spare = group(g, 1.0, 0.1, -1.3);
    box(spare, 0.4, 0.6, 0.06, 0, 0.3, 0, 0x2b2f34, { rough: 0.6 });
    const spareFace = decal(spare, 0.26, 0.26, 0, 0.36, 0.035, signFace("8", { bg: "#ffffff", fg: "#1b1e23", accent: "#1b1e23", scale: 0.7 }), { px: 128 });
    spareFace.rotation.z = Math.PI / 4;
    holoTag(spare, "spare placards", 0, 0.8, 0, { css: "#e0663a", w: 0.28 });
    reg2(spare, "hzl-placard-spare");

    // ------------------------------------------------------------ the paperwork
    const paper = holoPanel(g, 0.82, 0.56, -2.35, 1.5, -0.35, (ctx, w, h) => {
      ctx.fillStyle = "#1a0e08"; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#e0663a"; ctx.fillRect(0, 0, w, 6);
      ctx.font = `600 ${Math.round(h * 0.1)}px 'Barlow Condensed', Arial, sans-serif`; ctx.textAlign = "left"; ctx.textBaseline = "middle";
      ctx.fillStyle = "#ffe0d0"; ctx.fillText("SHIPPING PAPER — BOL 88213", w * 0.06, h * 0.13);
      ctx.font = `${Math.round(h * 0.075)}px Arial, sans-serif`; ctx.fillStyle = "#fff4ec";
      ["UN2796, Sulfuric acid, 8, PG II", "4 drums · 1,760 lb gross", "Corrosive cartons, 8, PG II · 1 pallet", "Emergency: 24-h number on file", "Placard: CORROSIVE, 4 sides", "Keep away from oxidizers"]
        .forEach((l, i) => ctx.fillText(l, w * 0.06, h * (0.28 + i * 0.11)));
    }, { ry: 1.1, accent: HZL_ACCENT });
    reg2(paper, "hzl-shipping-papers");
    const erInfo = group(g, -1.9, 0.1, -0.95, 0.9);
    box(erInfo, 0.3, 0.9, 0.3, 0, 0.45, 0, 0x59636d, { rough: 0.6 });
    const erSheet = decal(erInfo, 0.24, 0.3, 0, 1.05, 0.16, paperFace("EMERGENCY", ["Response info", "UN2796", "Isolate · first aid"], { bg: "#f6f1e4" }), { px: 160 });
    reg2(erSheet, "hzl-emergency-info");
    const cert = decal(g, 0.22, 0.28, -2.62, 1.15, -0.95, paperFace("CERTIFY", ["Properly classified,", "packaged, marked,", "labelled — sign"], { bg: "#f6f1e4" }), { px: 160 });
    cert.rotation.y = Math.PI / 2;
    reg2(cert, "hzl-cert-sign");
    const driver = standingFigure(g, 2.45, -1.0, { ry: -2.2, cloth: 0x2b3138, vest: 0xf2a23b });
    holoTag(driver, "driver", 0, 1.95, 0, { css: "#e0663a", w: 0.14 });
    const handHit = box(driver, 0.3, 0.3, 0.3, 0, 1.1, 0.25, 0xffffff, { opacity: 0.001, cast: false });
    reg2(handHit, "hzl-driver-handoff");
    const checkin = holoPanel(g, 0.46, 0.3, 2.45, 1.75, 1.0, (ctx, w, h) => {
      ctx.fillStyle = "rgba(6,18,22,0.9)"; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#4fd1ff"; ctx.fillRect(0, 0, w, 5);
      ctx.fillStyle = "#dceff7"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
      ctx.font = `600 ${Math.round(h * 0.15)}px 'Barlow Condensed', Arial, sans-serif`;
      ctx.fillText("CREW CHECK-IN", w / 2, h * 0.32);
      ctx.font = `${Math.round(h * 0.1)}px Arial, sans-serif`;
      ctx.fillText("Held drum · spill · placards", w / 2, h * 0.66);
    }, { ry: -1.3, accent: 0x4fd1ff });
    reg2(checkin, "hzl-crew-checkin");
    const log = holoPanel(g, 0.5, 0.34, -1.0, 1.6, 2.4, (ctx, w, h) => {
      ctx.fillStyle = "rgba(20,10,6,0.92)"; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#e0663a"; ctx.fillRect(0, 0, w, 5);
      ctx.fillStyle = "#ffe0d0"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
      ctx.font = `600 ${Math.round(h * 0.14)}px 'Barlow Condensed', Arial, sans-serif`;
      ctx.fillText("HAZMAT LOG", w / 2, h * 0.28);
      ctx.font = `${Math.round(h * 0.09)}px Arial, sans-serif`;
      ctx.fillText("Shipment · placards · holds", w / 2, h * 0.6);
    }, { ry: 0.6, accent: HZL_ACCENT });
    reg2(log, "hzl-hazmat-log");
    standingFigure(g, -0.3, -0.7, { ry: 2.8, cloth: 0x37505f, vest: 0xd8e24a });

    return {
      hits,
      footprint: 2.4,
      spawnLook: new THREE.Vector3(-0.2, 0.9, -0.9),
      onStepComplete(step) {
        if (step.id === "ppe") repaint(scaleHead.userData.screen, signFace("ZERO", { bg: "#1a0e08", accent: "#59c97b", fg: "#fff4ec", scale: 0.5 }));
        if (step.id === "drum-truck") { acid.position.set(1.0, 0.1, -0.2); acid.rotation.x = -0.1; }
        if (step.id === "stage") { acid.position.set(0.55, 0.1, -1.75); acid.rotation.x = 0; }
        if (step.id === "wrap") wrapFilm.visible = true;
        if (step.id === "placard-walk") { leftover.visible = false; sideHolder.material = mat(0xffffff, { rough: 0.5 }); }
        if (step.id === "hazmat-log") {
          repaint(log.userData.face, (ctx, w, h) => {
            ctx.fillStyle = "rgba(8,26,14,0.94)"; ctx.fillRect(0, 0, w, h);
            ctx.fillStyle = "#59c97b"; ctx.fillRect(0, 0, w, 5);
            ctx.fillStyle = "#d8f6e4"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
            ctx.font = `600 ${Math.round(h * 0.14)}px 'Barlow Condensed', Arial, sans-serif`;
            ctx.fillText("LOG SIGNED", w / 2, h * 0.36);
            ctx.font = `${Math.round(h * 0.09)}px Arial, sans-serif`;
            ctx.fillText("1 drum held · spill contained", w / 2, h * 0.66);
          });
        }
      },
      // The puddle really spreads on the floor, and the placard really comes
      // out of its holder and lands face-down on the dock.
      onInterrupt(it) {
        if (it.id === "jug-weeping") { puddle.visible = true; returns.rotation.z = 0.04; }
        if (it.id === "placard-falls") { rearPlacard.position.set(0.62, -0.08, 1.95); rearPlacard.rotation.set(-Math.PI / 2, 0, 0.3); }
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "jug-weeping") { pads.visible = true; puddle.material = mat(0x8b959c, { rough: 0.8, opacity: 0.5 }); returns.rotation.z = 0; }
        if (it.id === "placard-falls") { rearPlacard.position.set(0.62, 1.35, 1.675); rearPlacard.rotation.set(0, 0, Math.PI / 4); spareFace.visible = false; }
      },
      animate(t, dt, session) {
        const step = session?.step;
        const gg = session?.gauge;
        if (gg && !gg.committed && step?.id === "weigh") {
          const ok = gg.t >= 0.44 && gg.t <= 0.62;
          repaint(scaleHead.userData.screen, signFace(`${Math.round(300 + gg.t * 300)} lb`, { bg: "#1a0e08", accent: ok ? "#59c97b" : "#f2ae14", fg: "#fff4ec", scale: 0.5 }));
        }
        if (session?.turn && step?.id === "bung") bung.rotation.y = session.turn.amount * Math.PI * 2;
        if (step?.id === "drum-truck" && session.holding) dtruck.rotation.x = -0.25; else dtruck.rotation.x = 0;
        if (step?.id === "wrap" && session.holding) wrapRoll.position.x = -1.4 + Math.cos(t * 1.5) * 0.8;
        void dt;
      },
    };
  },
};
