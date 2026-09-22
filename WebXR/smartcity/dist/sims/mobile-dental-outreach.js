import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, ball, torus, slab, group, decal, repaint, signFace, paperFace, particles, mat,
} from "../../../shared/kit.js";
import {
  CITY, stationPad, holoPanel, holoTag, toolChest, instrument, cone, barrierPanel,
  standingFigure, surfaceTexture, pavingFace, texturedMat, reg,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Mobile Dental Outreach VR — its own gamified system: Outreach Command.
// A school sealant-and-screening day run out of a mobile dental van. Nothing
// here happens in a fixed operatory: the generator, the water, the sterile
// stock and the sharps all have to be managed on a site nobody built for
// dentistry, which is exactly what the state's RDHAP rules for community
// settings and the CDC's guidance for portable and mobile dental units exist
// to govern. Nothing is reprocessed in the field — every pouch on this van
// came sealed from the base clinic, and every used instrument leaves the way
// it came, in a closed transport case, not through a field autoclave.

const MDO_ACCENT = 0x5fd4c1;

export const SIM_MOBILE_DENTAL_OUTREACH = {
  id: "mobile-dental-outreach",
  index: "128",
  domain: "Public health",
  trade: "Registered dental hygienist in alternative practice (RDHAP)",
  category: "Dental & Oral Health",
  weather: "wind",
  certification: "The Dental Hygiene Board of California's registered dental hygienist in alternative practice (RDHAP) rules for practice in community and portable settings; the CDC's Guidelines for Infection Control in Dental Health-Care Settings and its guidance for portable and mobile dental units; OSHA 29 CFR 1910.1030 bloodborne pathogens; HIPAA for records handled in the field; SEIU and UFCW dental and clinic staff, and AFSCME public-health hygienists, as the workforce's unions; the ADHA as the profession's body",
  name: "Mobile Dental Outreach",
  title: simTitle("Mobile Dental Outreach"),
  tagline: "A school screening and sealant day run off the van: site, water and sterile stock proven before the first child sits down",
  accent: MDO_ACCENT,
  accentCss: "#5fd4c1",
  parSeconds: 300,
  footprint: 2.7,
  badge: { id: "outreach-clean-day", name: "Clean Day", note: "A full outreach day run with nothing reprocessed in the field and every child's paperwork matched before the chair" },

  game: system({
    name: "Outreach Command",
    currency: "SMILE",
    ranks: ["Van Assistant", "Outreach Hygienist", "Site Lead", "Programme Coordinator", "RDHAP Certified"],
    badges: [
      { id: "nothing-reprocessed", name: "Nothing Reprocessed", note: "Never touched the field-reprocessing trap", test: AWARD.safe },
      { id: "water-true", name: "Water True", note: "Held the water test reading near band centre", test: AWARD.precise(0.72) },
      { id: "consent-clean", name: "Consent Clean", note: "Matched the roster, form and card with no correction", test: AWARD.stepClean("consent-match") },
    ],
    challenges: [
      { id: "pack-down-fast", name: "Pack-Down Fast", note: "Complete inside 80% of par", test: AWARD.fast(0.8) },
      { id: "no-shortcuts", name: "No Shortcuts", note: "Clean run, no corrections", test: AWARD.clean },
      { id: "outreach-streak", name: "Outreach Streak", note: "Nine correct actions in a row", test: AWARD.streak(9) },
    ],
  }),

  hazards: {
    "co-exhaust-trap": "That is the generator running with its exhaust aimed straight at the van's open side door. Carbon monoxide has no smell and no colour, and a generator sited that close to an opening feeds it directly into the space people are working in — the CDC's mobile-unit guidance treats generator placement as a site-setup item for exactly this reason, not an afterthought once it is running.",
    "field-reprocess-pot": "That hot plate is set up to boil the used instruments right here on the table. A mobile clinic is not a sterilisation centre — the CDC's guidance for portable and mobile dental settings is explicit that nothing gets reprocessed in the field. Every instrument that leaves this van dirty goes back to the base clinic's autoclave in the transport case, and every one that arrives clean already came from it, sealed.",
    "loose-sharps-bin": "That sharps container is standing free on the grass, not clamped to the cart. A gust or a curious child can tip it in a way a mounted container cannot, and a used needle or a scaler blade on a schoolyard is not a hazard that waits for the end of the day to matter.",
    "stray-biohaz-bag": "That is a filled biohazard bag sitting on the ground with no label and no manifest line against it. Every bag that leaves this site has to be accounted for on the waste manifest going back to the clinic — an unlabelled bag is untracked medical waste the moment it is out of your hands.",
  },

  lateNotes: {
    "tablet": "There is no child in the chair yet — nothing to record.",
    "curing-light": "There is no sealant placed to cure yet.",
    "referral-pad": "Finish the screening before deciding whether this child needs a referral.",
    "van-lockbox": "The waste and the gear are still out on the table — that goes in before the box is locked.",
  },

  steps: [
    {
      id: "site-survey", kind: "select", target: "site-plan",
      title: "Confirm the site plan",
      cue: "Read the site plan: power, water access, and where the van can actually park.",
      why: "A school lot was never designed to host a dental clinic, and the RDHAP rules for practising in a community setting start with the site itself — where the van sits, what surface it sits on, and where the nearest water and power actually are, confirmed before anything comes off the van rather than discovered halfway through the morning.",
    },
    {
      id: "generator-placement", kind: "drag", target: "generator",
      title: "Place the generator away from the doors",
      cue: "Move the generator downwind of the canopy and clear of the van's side door.",
      why: "The CDC's guidance for portable and mobile dental units treats generator siting as part of setting up the site, not something you fix once it is already running and somebody has already been breathing the exhaust. Downwind and away from every opening is the whole rule, and it costs nothing to get right before the first extension cord goes out.",
      drag: { to: "generator-safe-spot", radius: 0.55, missNote: "Not clear of the doors yet — walk it further from the van and the canopy before it goes anywhere near a fuel line." },
    },
    {
      id: "waterline-treatment", kind: "gauge", target: "waterline-doser",
      title: "Shock-treat the portable unit's waterline",
      cue: "Run the shock treatment through the waterline and commit once it holds the correct dose.",
      why: "A self-contained water system that sat in a van since the last outreach day is exactly the still, warm, low-flow line dental unit waterline biofilm needs, and it does not clear itself. The line gets shock-treated before the first patient of the day, at the concentration the manufacturer's protocol sets — under-dose it and the biofilm survives; over-dose it and the next patient is rinsing with residual disinfectant.",
      gauge: { label: "WATERLINE TREATMENT — DOSE", speed: 0.68, green: [0.42, 0.6], readout: (t) => `${Math.round(t * 250)} ppm`, missNote: "Off the dose the protocol calls for. Flush and redose before it goes anywhere near a handpiece." },
    },
    {
      id: "water-test", kind: "select", target: "water-test-strip",
      title: "Test the treated water",
      cue: "Dip the strip and confirm the line reads within the potable-quality band.",
      why: "Treating the line is a step in a protocol; testing it is the proof the protocol worked on this van, on this morning. Water used for nonsurgical dental treatment is expected to meet a potable-quality standard, and the only honest way to know this line meets it today is to test it today, not to trust that yesterday's treatment is still holding.",
    },
    {
      id: "consent-match", kind: "sequence",
      targets: ["class-roster", "consent-form", "student-id-card"],
      itemNames: { "class-roster": "class roster", "consent-form": "signed consent form", "student-id-card": "child's ID card" },
      title: "Match the child to the class roster and the signed consent",
      cue: "Roster, then the signed consent form, then the child's own ID card — all three have to agree.",
      why: "A school outreach day runs on paperwork a hygienist did not write and a child cannot be expected to vouch for themselves. The roster says who is supposed to be in this class, the signed form says a parent actually agreed to treatment, and the card on the child in the chair is what ties the two together — skip any one of them and a child could be seen, or missed, on somebody else's say-so.",
      outOfOrderNote: "Check the roster first, then the signed form, then the child's own card — that is the only order that catches a mismatch before the chair, not after it.",
    },
    {
      id: "sterile-pouch-check", kind: "select", target: "sterile-pouch-box",
      title: "Confirm the sterile pouch stock",
      cue: "Check the pouches are sealed, dated and came from the base clinic's own autoclave load.",
      why: "Every pouch on this van was sterilised at the base clinic before the van left, never on site — a mobile unit has nowhere to validate a sterilisation cycle the way a fixed sterilisation centre can. A sealed, dated pouch is the only proof that survives the drive; a torn one, however clean it looks, is a pouch you cannot vouch for.",
    },
    {
      id: "instrument-transport", kind: "select", target: "instrument-transport-case",
      title: "Set up the used-instrument transport case",
      cue: "Open the rigid, leak-proof case that used instruments will ride back to the clinic in.",
      why: "The CDC's guidance for portable and mobile settings is specific that contaminated instruments are transported to a central facility for reprocessing, never reprocessed on site. That only works if the case for them is open and ready before the first child sits down — not improvised out of whatever is on the table once the tray is already full of used instruments.",
    },
    {
      id: "barrier-placement", kind: "find", noHint: true,
      forceClass: "light",
      robotNote: "The headrest barrier goes exactly where the child's head will be.",
      targets: ["light-handle-bare", "headrest-bare", "tray-bare"],
      itemNames: { "light-handle-bare": "the bare light handle", "headrest-bare": "the bare headrest", "tray-bare": "the bare instrument tray" },
      itemNotes: {
        "light-handle-bare": "The light handle has no barrier on it. Bare handles are what turn a between-child wipe-down into a guess about what got missed.",
        "headrest-bare": "The headrest sleeve is missing. Skin contact surfaces are barriered precisely so the surface itself does not need a full disinfectant cycle between every single child.",
        "tray-bare": "The tray liner is missing. An unbarriered tray means every surface under the instruments has to be treated as contaminated the moment the tray is used.",
      },
      title: "Find what still needs a surface barrier",
      cue: "Three surfaces on this chair are not barriered yet. Find them before the first child sits down.",
      why: "A single portable chair sees every child in the class in one morning, which is exactly the setting where surface barriers earn their keep — cover what hands and faces touch once, and swap the barrier between children rather than fully disinfecting bare equipment on a schedule the day cannot afford.",
    },
    {
      id: "surface-disinfect", kind: "hold", target: "disinfectant-wipe", seconds: 8,
      title: "Hold the surface disinfectant for its wet-contact time",
      cue: "Wipe the chair and tray, then hold the surface wet for the full contact time before it dries.",
      why: "An EPA-registered surface disinfectant only kills what its label says it kills if the surface stays visibly wet for the full contact time printed on that label — wiping it on and immediately wiping it off again is application, not disinfection, and between every child on a school day is exactly when that shortcut is tempting.",
      holdBreakNote: "Wiped dry before the contact time was up. That surface is disinfected on the label's terms or it is not disinfected at all — hold it wet the full count.",
    },
    {
      id: "sharps-secure", kind: "select", target: "sharps-mount",
      title: "Mount the sharps container to the cart",
      cue: "Clamp the sharps container to the cart so it cannot tip on uneven ground.",
      why: "A sharps container standing free on a schoolyard is one gust or one bumped table leg away from going over, and a used needle or scaler on grass a five-year-old is standing on is not a risk this programme can absorb. Clamped to the cart, it stays upright through a windy morning the same way a fixed clinic's wall-mounted unit does.",
    },
    {
      id: "screening-record", kind: "select", target: "tablet",
      title: "Record the screening on the encrypted tablet",
      cue: "Enter this child's findings on the encrypted tablet before they leave the chair.",
      why: "A paper note on a clipboard in a schoolyard is a HIPAA-covered record with no lock on it. The encrypted tablet is what lets this programme carry a child's oral health information off a fixed site at all, and it is entered while the child is still in the chair, not reconstructed from memory back at the van at the end of the day.",
    },
    {
      id: "sealant-cure", kind: "hold", target: "curing-light", seconds: 4,
      noRobot: true, forceClass: "light",
      robotNote: "The curing light is in a child's mouth, in a van, off-site.",
      title: "Cure the sealant with the LED light",
      cue: "Hold the curing light steady on the sealant for the full cure time.",
      why: "A sealant that has not fully polymerised is soft enough to shear off the first time this molar meets a cracker, which defeats the entire point of a sealant day — the light has to sit still on the tooth for its full rated time, not waved across it while the next child is already climbing into the chair.",
      holdBreakNote: "Pulled the light away before the cure finished. An undercured sealant fails within the week — hold it the full time.",
    },
    {
      id: "referral-letter", kind: "select", target: "referral-pad",
      title: "Write the referral letter",
      cue: "Complete a referral letter home for any urgent finding on this child.",
      why: "A school screening finds things a screening chair cannot treat — visible decay, an abscess, a fractured tooth — and an RDHAP's scope in a community setting is to identify and refer, not to restore on a folding table. The letter is what turns a finding into something a parent can actually act on with a dentist.",
    },
    {
      id: "pack-waste", kind: "sequence",
      targets: ["biohazard-bag", "waste-manifest", "van-lockbox"],
      itemNames: { "biohazard-bag": "sealed biohazard bag", "waste-manifest": "waste manifest", "van-lockbox": "van's lockbox" },
      title: "Pack down and manifest the biohazard waste",
      cue: "Seal the bag, log it on the manifest, then it goes in the van's lockbox for the ride back.",
      why: "The bag gets sealed and logged on the manifest before it goes anywhere near the van, because a bag that rode home unlogged is waste nobody downstream can account for. The clinic that receives it at the other end reads the manifest, not your memory of what happened at the school.",
      outOfOrderNote: "Seal it, log it on the manifest, then lock it away — a bag in the lockbox with no manifest line is exactly the untracked waste the manifest exists to prevent.",
    },
    {
      id: "door-latch", kind: "turn", target: "van-door-latch",
      title: "Lock the van's side door for transport",
      cue: "Throw the latch on the side door before the van moves.",
      why: "Everything on this van — the sharps, the sterile stock, the transport case of used instruments, every child's record on the tablet — is only secured for the drive back once that door is actually latched, not just pushed to.",
      turn: { turns: 0.2, axis: "z", label: "SIDE DOOR" },
    },
  ],

  interrupts: [
    {
      id: "wind-shift-fumes",
      kind: "Generator exhaust",
      after: "sealant-cure", delay: 3, seconds: 13,
      alert: "The wind has swung round. The generator's exhaust is drifting straight under the canopy where you are curing this sealant.",
      cue: "Your hands are full with the light. The exhaust is not staying downwind any more.",
      target: "generator",
      why: "Wind on an open schoolyard changes direction all morning, and a generator sited correctly at eight o'clock can be feeding exhaust under the canopy by nine. The CDC's mobile-unit guidance treats generator placement as something checked through the day, not set once and forgotten, because the wind does not read the site plan.",
      missNote: "The exhaust kept drifting under the canopy for the rest of that child's visit. Carbon monoxide is odourless — nobody in that canopy would have known anything was wrong until somebody started feeling it, and a sealant appointment is not where you want to discover a generator was ever sited wrong.",
      wrongNote: "It is the generator. Reposition it before anything else — the sealant can wait four seconds, the air under that canopy cannot.",
    },
    {
      id: "child-without-form",
      kind: "Missing consent",
      after: "surface-disinfect", delay: 3, seconds: 14,
      alert: "The next child from the class line has no signed consent form with them, and their name is not checked off on your roster copy either.",
      cue: "A child is standing at the chair with no paperwork behind them.",
      target: "office-radio",
      why: "A five-year-old cannot consent for their own dental treatment, and a hygienist working alone on a school lot has no way to independently verify a parent agreed to anything — the whole reason the roster and the signed form exist is to put that decision on record before the chair, not to trust a child's own say-so about what their parent wants.",
      missNote: "That child was screened with no signed consent on file anywhere. If a parent never actually agreed to it, this programme just treated a minor without consent on a public school site — exactly the failure the roster-and-consent match exists to catch before it happens, not after.",
      wrongNote: "Call the school office over the radio and hold that child out of the chair until the form turns up. Nothing about this child's paperwork gets solved from here.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.65, MDO_ACCENT);

    // -------------------------------------------------------------- ground
    const groundMesh = box(g, 6.2, 0.14, 5.6, 0, 0.07, 0, 0xffffff, { rough: 0.96 });
    groundMesh.material = texturedMat(
      surfaceTexture((cx, w, h) => pavingFace(cx, w, h, { tiles: 6, base: "#8a8a7c", base2: "#7c7c6e", seam: "rgba(0,0,0,0.3)" }), { repeat: 8, px: 512 }),
      { rough: 0.94, metal: 0.02, color: 0xc7c7ba },
    );
    // A painted playground line across one corner, so the lot reads as a
    // schoolyard rather than a generic pad.
    for (let i = 0; i < 2; i++) {
      box(g, 3.4, 0.006, 0.09, -1.0 + i * 0.4, 0.145, 2.5, 0xdfe0d0, { rough: 0.75, cast: false });
    }

    // ----------------------------------------------------------------- van
    const van = group(g, -1.7, 0.14, -0.2, 0.35);
    slab(van, 2.7, 1.1, 1.15, 0, 0.72, 0, 0xe9ecec, { radius: 0.06, rough: 0.4, metal: 0.35 });
    slab(van, 0.9, 0.7, 1.1, 1.0, 1.02, 0, 0xdfe4e4, { radius: 0.08, rough: 0.35, metal: 0.3 });
    for (const [wx, wz] of [[0.75, -0.58], [0.75, 0.58]]) {
      box(van, 0.55, 0.32, 0.02, wx, 1.12, wz, 0x1a2226, { rough: 0.2, metal: 0.1, opacity: 0.75, transparent: true });
    }
    for (const [wx, wz] of [[-1.15, -0.6], [1.15, -0.6], [-1.15, 0.6], [1.15, 0.6]]) {
      cyl(van, 0.24, 0.24, 0.2, wx, 0.24, wz, 0x1b1e22, { rough: 0.8, seg: 16 }).rotation.x = Math.PI / 2;
      cyl(van, 0.13, 0.13, 0.22, wx, 0.24, wz, 0x8b929a, { rough: 0.35, metal: 0.7, seg: 10 }).rotation.x = Math.PI / 2;
    }
    decal(van, 1.4, 0.34, 0, 0.72, 0.576, signFace("DENTAL OUTREACH", { bg: "#1f6f63", accent: "#bff2e8", scale: 0.44 }), { px: 384 });
    holoTag(van, "outreach van", 0, 1.42, 0.58, { css: MDO_ACCENT.toString(16), w: 0.4 });

    // Open sliding side door, and the shelving visible through the opening.
    const doorFrame = group(van, 0.15, 0.72, 0.578);
    box(doorFrame, 1.15, 1.02, 0.03, 0, 0, 0, 0x9aa19f, { rough: 0.5, metal: 0.3, opacity: 0.001, transparent: true, cast: false });
    const slidingDoor = group(van, 1.3, 0.72, 0.6);
    slab(slidingDoor, 1.1, 1.0, 0.05, 0, 0, 0, 0xe9ecec, { radius: 0.03, rough: 0.4, metal: 0.35 });
    const latchGroup = group(slidingDoor, -0.5, -0.15, 0.03);
    const doorLatch = box(latchGroup, 0.05, 0.08, 0.03, 0, 0, 0, CITY.steel, { rough: 0.3, metal: 0.8 });
    latchGroup.userData.wheel = doorLatch;
    reg(hits, latchGroup, "van-door-latch");
    holoTag(slidingDoor, "side door", 0, 0.58, 0, { css: "#5fd4c1", w: 0.3 });

    // A haze of exhaust risk right at the open door — the hazard object for
    // a generator that has not yet been placed downwind of it.
    const doorExhaustZone = torus(van, 0.26, 0.05, 1.3, 0.16, 0.9, 0xf0645b,
      { emissive: 0xf0645b, ei: 0.9, rough: 0.5, cast: false, seg: 6, seg2: 20, opacity: 0.5, transparent: true });
    doorExhaustZone.rotation.x = Math.PI / 2;
    holoTag(van, "exhaust risk — open door", 1.3, 0.5, 0.9, { css: "#f0645b", w: 0.5 });
    reg(hits, doorExhaustZone, "co-exhaust-trap");

    const shelfInterior = group(van, 0.15, 0.72, 0.2);
    for (let r = 0; r < 3; r++) {
      box(shelfInterior, 1.0, 0.02, 0.5, 0, -0.3 + r * 0.34, 0.05, 0xd8dcd8, { rough: 0.6, cast: false });
      for (let c = 0; c < 3; c++) {
        box(shelfInterior, 0.16, 0.12, 0.16, -0.36 + c * 0.36, -0.22 + r * 0.34, 0.08, [0xdfe6a8, 0xa8c8d8, 0xe8d0a8][c], { rough: 0.6, cast: false });
      }
    }

    // Sterile pouch stock reached at the door, and the transport case beside it.
    const pouchBox = group(van, 0.15, 1.14, 0.35);
    box(pouchBox, 0.32, 0.16, 0.26, 0, 0, 0, 0xdfe4e4, { rough: 0.45, metal: 0.15 });
    for (let i = 0; i < 5; i++) {
      decal(pouchBox, 0.1, 0.07, -0.11 + i * 0.055, 0.081, 0, paperFace("", ["STERILE"], { bg: "#f4f8f0", band: "#2f8f6a" }), { px: 96 }).rotation.x = -Math.PI / 2;
    }
    holoTag(pouchBox, "sterile pouch stock", 0, 0.16, 0, { css: "#5fd4c1", w: 0.4 });
    reg(hits, pouchBox, "sterile-pouch-box");

    const transportCase = group(g, -0.5, 0.14, -0.85, 0.2);
    slab(transportCase, 0.42, 0.24, 0.3, 0, 0.12, 0, 0xd2312b, { radius: 0.03, rough: 0.6 });
    box(transportCase, 0.44, 0.03, 0.32, 0, 0.245, 0, 0xa8241f, { rough: 0.6 });
    decal(transportCase, 0.3, 0.08, 0, 0.15, 0.151, signFace("USED — RETURN", { bg: "#7d1512", accent: "#f2ae14", scale: 0.4 }), { px: 160 });
    holoTag(transportCase, "instrument transport case", 0, 0.32, 0, { css: "#5fd4c1", w: 0.46 });
    reg(hits, transportCase, "instrument-transport-case");

    // ------------------------------------------------------- generator + spot
    const genSpotMarker = torus(g, 0.32, 0.012, -2.5, 0.145, 1.6, MDO_ACCENT,
      { emissive: MDO_ACCENT, ei: 1.6, rough: 0.4, cast: false, seg: 6, seg2: 30 });
    genSpotMarker.rotation.x = Math.PI / 2;
    holoTag(g, "downwind — generator spot", -2.5, 0.4, 1.6, { css: "#5fd4c1", w: 0.5 });
    reg(hits, genSpotMarker, "generator-safe-spot");

    const genGroup = group(g, -0.6, 0.14, 0.85, -0.2);
    box(genGroup, 0.5, 0.36, 0.34, 0, 0.18, 0, 0x2b2f34, { rough: 0.6, metal: 0.4 });
    const exhaustPipe = cyl(genGroup, 0.022, 0.022, 0.18, 0.2, 0.44, 0, 0x4a4e52, { rough: 0.5, metal: 0.6, seg: 10 });
    const fuelCap = cyl(genGroup, 0.03, 0.03, 0.02, -0.18, 0.37, 0.1, 0xd2312b, { rough: 0.5, seg: 10 });
    const smoke = particles(genGroup, 26, 0x84898d, { size: 0.028, life: 0.9, additive: false, opacity: 0.35 });
    holoTag(genGroup, "generator", 0, 0.5, 0, { css: "#5fd4c1", w: 0.28 });
    reg(hits, genGroup, "generator");
    void exhaustPipe; void fuelCap;

    // ---------------------------------------------------------- canopy + table
    const canopy = group(g, 0.9, 0.14, 0.4);
    for (const [lx, lz] of [[-1.2, -1.0], [1.2, -1.0], [-1.2, 1.0], [1.2, 1.0]]) {
      cyl(canopy, 0.02, 0.02, 2.1, lx, 1.05, lz, 0xb8bcc0, { rough: 0.45, metal: 0.6, seg: 8 });
    }
    slab(canopy, 2.6, 0.03, 2.2, 0, 2.12, 0, 0xd8ecea, { radius: 0.04, rough: 0.75, opacity: 0.92, transparent: true });
    box(canopy, 2.6, 0.03, 0.06, 0, 2.13, -1.0, 0x5fd4c1, { rough: 0.6, cast: false });

    const table = group(canopy, 0, 0, -0.1);
    slab(table, 1.7, 0.05, 0.75, 0, 0.78, 0, 0xdfe4de, { radius: 0.02, rough: 0.5 });
    for (const [lx, lz] of [[-0.78, -0.32], [0.78, -0.32], [-0.78, 0.32], [0.78, 0.32]]) {
      cyl(table, 0.02, 0.02, 0.76, lx, 0.39, lz, 0x9aa1a0, { rough: 0.4, metal: 0.6, seg: 10 });
    }

    // Waterline doser and the treated-unit reservoir on the table.
    const doser = instrument(table, -0.6, 0.83, -0.1, { ry: 0.3, idle: "-- ppm", color: MDO_ACCENT });
    holoTag(doser, "waterline doser", 0, 0.16, 0, { css: "#5fd4c1", w: 0.34 });
    reg(hits, doser, "waterline-doser");
    const reservoir = cyl(table, 0.09, 0.1, 0.28, -0.4, 0.94, -0.22, 0xdfeeea, { rough: 0.25, opacity: 0.55, seg: 16 });
    void reservoir;
    const testStrip = group(table, -0.22, 0.83, -0.15);
    box(testStrip, 0.02, 0.09, 0.012, 0, 0.045, 0, 0xf2f2ec, { rough: 0.6 });
    decal(testStrip, 0.03, 0.03, 0, 0.075, 0.007, signFace("H2O", { bg: "#f2f2ec", accent: "#2f8f6a", scale: 0.5 }), { px: 64 });
    holoTag(testStrip, "water test strip", 0, 0.14, 0, { css: "#5fd4c1", w: 0.32 });
    reg(hits, testStrip, "water-test-strip");

    // Consent table: roster, signed form, ID card and the office radio.
    const consentTable = group(canopy, 1.0, 0, 0.55, 0.15);
    slab(consentTable, 0.6, 0.04, 0.42, 0, 0.78, 0, 0xdfe4de, { radius: 0.02, rough: 0.5 });
    for (const lx of [-0.24, 0.24]) cyl(consentTable, 0.018, 0.018, 0.76, lx, 0.39, 0, 0x9aa1a0, { rough: 0.4, metal: 0.6, seg: 8 });
    const roster = decal(consentTable, 0.24, 0.32, -0.15, 0.803, 0, paperFace("CLASS ROSTER", ["Rm 12 — Mrs Alvarez", "24 students", "3 flagged: no form on file"]));
    roster.rotation.x = -Math.PI / 2;
    reg(hits, roster, "class-roster");
    const consentForm = decal(consentTable, 0.2, 0.28, 0.05, 0.804, 0, paperFace("CONSENT", ["Parent signature on file", "Screening + sealants", "RDHAP community programme"], { band: "#2f8f6a" }));
    consentForm.rotation.x = -Math.PI / 2;
    reg(hits, consentForm, "consent-form");
    const idCard = group(consentTable, 0.2, 0.81, 0.13);
    box(idCard, 0.1, 0.005, 0.065, 0, 0, 0, 0xf2f0e4, { rough: 0.5 });
    decal(idCard, 0.09, 0.055, 0, 0.004, 0, signFace("STUDENT ID", { bg: "#f2f0e4", accent: "#2b3138", scale: 0.4 }), { px: 96 }).rotation.x = -Math.PI / 2;
    reg(hits, idCard, "student-id-card");
    const radio = group(consentTable, -0.22, 0.83, 0.12, 0.4);
    box(radio, 0.06, 0.14, 0.04, 0, 0.07, 0, 0x2b3138, { rough: 0.5, metal: 0.3 });
    cyl(radio, 0.006, 0.006, 0.1, 0, 0.19, 0, CITY.steel, { rough: 0.3, metal: 0.8, seg: 8 });
    holoTag(radio, "office radio", 0, 0.24, 0, { css: "#5fd4c1", w: 0.3 });
    reg(hits, radio, "office-radio");
    const referralPad = decal(consentTable, 0.18, 0.24, -0.2, 0.805, 0.16, paperFace("REFERRAL", ["Dentist follow-up", "Urgent finding — see chart"], { band: "#c0392b" }));
    referralPad.rotation.x = -Math.PI / 2;
    reg(hits, referralPad, "referral-pad");

    // ------------------------------------------------------------ screening chair
    const chairCart = group(canopy, -0.2, 0, 0.75, -0.1);
    // Robot training: nobody is in this chair right now and somebody will be
    // in a minute, so the headrest carries a default head keep-out volume an
    // embodied trainee treats as occupied. See shared/robot-embodiment.js.
    chairCart.userData.patientChair = { offset: [0, 1.16, -0.38], radius: 0.2 };
    slab(chairCart, 0.6, 0.5, 0.42, 0, 0.35, 0, 0x3f6f86, { radius: 0.05, rough: 0.6 });
    const chairSeat = slab(chairCart, 0.55, 0.1, 0.5, 0, 0.62, 0, 0x2f5768, { radius: 0.04, rough: 0.7 });
    void chairSeat;
    const chairBack = slab(chairCart, 0.5, 0.6, 0.1, 0, 0.9, -0.22, 0x2f5768, { radius: 0.04, rough: 0.7 });
    chairBack.rotation.x = -0.25;
    const headrestGroup = group(chairCart, 0, 1.16, -0.38);
    slab(headrestGroup, 0.24, 0.16, 0.08, 0, 0, 0, 0xe8ece4, { radius: 0.03, rough: 0.7 });
    holoTag(headrestGroup, "headrest", 0, 0.14, 0, { css: "#5fd4c1", w: 0.26 });
    reg(hits, headrestGroup, "headrest-bare");
    const trayArm = group(chairCart, 0.42, 0.66, 0.05, 0.4);
    slab(trayArm, 0.32, 0.02, 0.22, 0, 0, 0, 0x8b929a, { radius: 0.02, rough: 0.5, metal: 0.3 });
    holoTag(trayArm, "instrument tray", 0, 0.1, 0, { css: "#5fd4c1", w: 0.3 });
    reg(hits, trayArm, "tray-bare");

    const lightPost = group(chairCart, -0.4, 0, -0.3);
    cyl(lightPost, 0.03, 0.04, 1.5, 0, 0.75, 0, CITY.steel, { rough: 0.35, metal: 0.7, seg: 10 });
    const lightArm = group(lightPost, 0, 1.5, 0, 0.4);
    box(lightArm, 0.5, 0.03, 0.03, 0.25, 0, 0, CITY.steel, { rough: 0.35, metal: 0.7 });
    const lightHead = ball(lightArm, 0.12, 0.5, -0.05, 0, 0xf4f8ff, { emissive: 0xf4f8ff, ei: 1.4, rough: 0.4 });
    void lightHead;
    holoTag(lightArm, "exam light handle", 0.5, 0.1, 0, { css: "#5fd4c1", w: 0.36 });
    reg(hits, lightArm, "light-handle-bare");

    const wipeDispenser = group(chairCart, 0.35, 0.66, -0.3);
    cyl(wipeDispenser, 0.06, 0.06, 0.16, 0, 0, 0, 0xdfeeea, { rough: 0.4, seg: 14 });
    decal(wipeDispenser, 0.08, 0.03, 0, 0.081, 0, signFace("WIPES", { bg: "#dfeeea", accent: "#1f6f63", scale: 0.55 }), { px: 96 }).rotation.x = -Math.PI / 2;
    holoTag(wipeDispenser, "disinfectant wipe", 0, 0.14, 0, { css: "#5fd4c1", w: 0.34 });
    reg(hits, wipeDispenser, "disinfectant-wipe");

    const tabletStand = group(chairCart, 0.5, 0.66, -0.32, -0.3);
    box(tabletStand, 0.02, 0.24, 0.02, 0, 0.12, 0, CITY.steel, { rough: 0.35, metal: 0.7 });
    const tabletScreen = decal(tabletStand, 0.16, 0.22, 0, 0.25, 0.011, signFace("READY", { bg: "#0d1c1a", accent: "#5fd4c1", fg: "#bff2ea", scale: 0.5 }), { glow: true, ei: 0.7, px: 160 });
    holoTag(tabletStand, "encrypted tablet", 0, 0.42, 0, { css: "#5fd4c1", w: 0.32 });
    reg(hits, tabletStand, "tablet");

    const curingLight = group(chairCart, -0.15, 0.66, 0.15, -0.5);
    cyl(curingLight, 0.02, 0.025, 0.16, 0, 0, 0, 0x2b3138, { rough: 0.5, metal: 0.4, seg: 10 });
    ball(curingLight, 0.025, 0, 0.09, 0.02, 0x8fd6ff, { emissive: 0x8fd6ff, ei: 1.5, rough: 0.3 });
    holoTag(curingLight, "curing light", 0, 0.2, 0, { css: "#5fd4c1", w: 0.28 });
    reg(hits, curingLight, "curing-light");

    // Sharps mount clamped to the cart, and the loose decoy on the grass.
    const sharpsMount = group(chairCart, -0.4, 0.66, 0.15, 0.3);
    box(sharpsMount, 0.16, 0.22, 0.13, 0, 0.11, 0, 0xd8342a, { rough: 0.6 });
    box(sharpsMount, 0.03, 0.06, 0.13, -0.1, 0.02, 0, CITY.steel, { rough: 0.3, metal: 0.85 });
    decal(sharpsMount, 0.13, 0.06, 0, 0.16, 0.066, signFace("SHARPS", { bg: "#a5261e", accent: "#f2ae14", fg: "#ffffff", scale: 0.4 }), { px: 96 });
    holoTag(sharpsMount, "sharps — mount", 0, 0.28, 0, { css: "#5fd4c1", w: 0.32 });
    reg(hits, sharpsMount, "sharps-mount");

    const looseSharps = group(g, 1.0, 0.14, 1.9, -0.4);
    box(looseSharps, 0.14, 0.2, 0.11, 0, 0.1, 0, 0xd8342a, { rough: 0.6 });
    for (let i = 0; i < 3; i++) {
      cyl(looseSharps, 0.006, 0.006, 0.06, -0.03 + i * 0.03, 0.21, 0.02, 0xdfe8ee, { rough: 0.3, seg: 8 }).rotation.set(0.4, 0, 0.3);
    }
    holoTag(looseSharps, "unmounted sharps bin", 0, 0.3, 0, { css: "#f0645b", w: 0.42 });
    reg(hits, looseSharps, "loose-sharps-bin");

    // Field-reprocessing trap and a stray unlabelled bag, off to one side.
    const hotplate = group(g, 1.7, 0.14, 0.7, 0.2);
    cyl(hotplate, 0.14, 0.14, 0.05, 0, 0.5, 0, 0x2b2f34, { rough: 0.5, metal: 0.5, seg: 16 });
    cyl(hotplate, 0.12, 0.12, 0.01, 0, 0.526, 0, 0xb8402f, { emissive: 0xb8402f, ei: 0.6, rough: 0.4, seg: 16 });
    slab(hotplate, 0.4, 0.02, 0.4, 0, 0.44, 0, 0xdfe4de, { radius: 0.02, rough: 0.5 });
    for (const sx of [-1, 1]) box(hotplate, 0.03, 0.44, 0.03, sx * 0.18, 0.22, 0, CITY.steel, { rough: 0.4, metal: 0.7 });
    holoTag(hotplate, "hot plate — field reprocessing", 0, 0.58, 0, { css: "#f0645b", w: 0.56 });
    reg(hits, hotplate, "field-reprocess-pot");

    const strayBag = group(g, 1.9, 0.14, 1.5);
    box(strayBag, 0.28, 0.24, 0.22, 0, 0.12, 0, 0x8a2f2a, { rough: 0.6, finish: "concrete", tile: [1, 1] });
    holoTag(strayBag, "unlabelled bag", 0, 0.3, 0, { css: "#f0645b", w: 0.36 });
    reg(hits, strayBag, "stray-biohaz-bag");

    // The bag, manifest and lockbox this run actually packs down.
    const bagStation = group(g, -0.2, 0.14, 1.7, 0.3);
    const biohazBag = group(bagStation, 0, 0, 0);
    box(biohazBag, 0.26, 0.22, 0.2, 0, 0.11, 0, 0xd8232a, { rough: 0.55 });
    decal(biohazBag, 0.2, 0.06, 0, 0.16, 0.101, signFace("BIOHAZARD", { bg: "#7d1512", accent: "#f2ae14", scale: 0.42 }), { px: 128 });
    holoTag(biohazBag, "biohazard bag", 0, 0.3, 0, { css: "#5fd4c1", w: 0.36 });
    reg(hits, biohazBag, "biohazard-bag");
    const manifest = decal(bagStation, 0.2, 0.28, 0.32, 0.14, 0, paperFace("WASTE MANIFEST", ["Outreach — Rm 12", "1 sharps · 1 biohazard bag"]));
    manifest.rotation.y = -Math.PI / 2;
    reg(hits, manifest, "waste-manifest");

    const lockbox = group(van, -1.0, 0.4, 0.5, 0.2);
    box(lockbox, 0.34, 0.24, 0.24, 0, 0, 0, 0x2b3138, { rough: 0.5, metal: 0.4 });
    box(lockbox, 0.03, 0.08, 0.03, 0.14, 0, 0.12, CITY.steel, { rough: 0.3, metal: 0.85 });
    holoTag(lockbox, "van lockbox", 0, 0.2, 0, { css: "#5fd4c1", w: 0.3 });
    reg(hits, lockbox, "van-lockbox");

    // Site plan on a holographic panel near the van's front.
    const sitePlan = holoPanel(g, 0.56, 0.4, -2.6, 1.4, -1.3, (ctx, w, h) => {
      ctx.fillStyle = "rgba(8,18,16,0.9)"; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#5fd4c1"; ctx.fillRect(0, 0, w, 5);
      ctx.fillStyle = "#bfe8de";
      ctx.font = `600 ${Math.round(h * 0.09)}px 'Barlow Condensed', Arial, sans-serif`;
      ctx.textAlign = "left"; ctx.textBaseline = "middle";
      ctx.fillText("SITE PLAN — LINCOLN ELEMENTARY", w * 0.06, h * 0.14);
      ctx.fillStyle = "#eafcf6";
      ctx.font = `600 ${Math.round(h * 0.13)}px 'Barlow Condensed', Arial, sans-serif`;
      ctx.fillText("SCREENING + SEALANT DAY", w * 0.06, h * 0.32);
      ctx.fillStyle = "#bfe8de";
      ctx.font = `${Math.round(h * 0.08)}px Arial, sans-serif`;
      ["Power: exterior outlet, west wall", "Water: cafeteria spigot, 40 ft hose",
       "Generator: downwind, clear of doors", "RDHAP community-practice site log"]
        .forEach((line, i) => ctx.fillText(line, w * 0.06, h * 0.5 + i * h * 0.1));
    }, { ry: 0.4 });
    reg(hits, sitePlan, "site-plan");

    // The hygienist, standing clear of the chair and the table.
    const hygienist = standingFigure(g, -0.3, -1.5, { ry: 2.5, cloth: 0x1f6f63, vest: 0x5fd4c1, skin: 0xc79a72 });
    holoTag(hygienist, "RDHAP hygienist", 0, 1.9, 0, { css: "#5fd4c1", w: 0.36 });

    // A couple of cones marking the informal work zone off the schoolyard path.
    cone(g, -2.6, -2.2, {});
    cone(g, 2.6, -2.0, {});
    barrierPanel(g, 2.4, -0.4, { ry: 0.5, w: 1.1, color: MDO_ACCENT });

    const key = new THREE.DirectionalLight(0xfaf6ea, 0.95);
    key.position.set(3, 6, 3);
    key.castShadow = true;
    key.shadow.mapSize.set(1024, 1024);
    key.shadow.camera.left = -6; key.shadow.camera.right = 6;
    key.shadow.camera.top = 6; key.shadow.camera.bottom = -6;
    g.add(key);
    g.add(new THREE.HemisphereLight(0xdfeaf0, 0x6d6a5a, 0.9));

    let smokeDrift = 0;
    const genHomePos = genGroup.position.clone();

    return {
      hits,
      footprint: 2.7,
      spawnLook: new THREE.Vector3(0.6, 1.1, 0.6),

      onStepComplete(step) {
        if (step.id === "generator-placement") {
          genGroup.position.set(-2.5, 0.14, 1.6);
          genHomePos.copy(genGroup.position);
        }
        if (step.id === "water-test") repaint(doser.userData.screen, signFace("PASS", { bg: "#0d1c1a", accent: "#59c97b", fg: "#bff2ea", scale: 0.5 }));
        if (step.id === "barrier-placement") {
          headrestGroup.children[0].material = mat(0x5fd4c1, { rough: 0.6 });
          trayArm.children[0].material = mat(0x5fd4c1, { rough: 0.6 });
          lightArm.children[0].material = mat(0x5fd4c1, { rough: 0.6 });
        }
        if (step.id === "screening-record") repaint(tabletScreen, signFace("SAVED", { bg: "#0d1c1a", accent: "#59c97b", fg: "#bff2ea", scale: 0.45 }));
        if (step.id === "pack-waste") lockbox.userData.loaded = true;
      },

      onInterrupt(it) {
        if (it.id === "wind-shift-fumes") {
          smokeDrift = 1;
          genGroup.rotation.y += 0.5;
        }
        if (it.id === "child-without-form") {
          radio.rotation.y += 0.6;
          radio.position.y += 0.03;
        }
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "wind-shift-fumes") {
          smokeDrift = 0;
          genGroup.position.set(genHomePos.x - 0.5, genHomePos.y, genHomePos.z + 0.4);
        }
        if (it.id === "child-without-form") {
          radio.rotation.y -= 0.6;
          radio.position.y -= 0.03;
        }
      },

      animate(t, dt, session) {
        smoke.visible = true;
        const drift = smokeDrift > 0 ? 1.4 : 0.4;
        smoke.userData.step(dt, new THREE.Vector3(0.2, 0.5, 0), 0.1, drift, 1.1);

        const gg = session?.gauge;
        if (gg && !gg.committed && session.step?.id === "waterline-treatment") {
          repaint(doser.userData.screen, signFace(`${Math.round(gg.t * 250)} ppm`, {
            bg: "#0d1c1a", accent: gg.t > 0.42 && gg.t < 0.6 ? "#59c97b" : "#f0645b", fg: "#bff2ea", scale: 0.5,
          }));
        }
      },
    };
  },
};
