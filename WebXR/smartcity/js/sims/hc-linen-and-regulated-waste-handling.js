import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, ball, torus, slab, group, decal, repaint, signFace, paperFace, particles, mat,
} from "../../../shared/kit.js";
import {
  CITY, stationPad, holoPanel, holoTag, instrument, standingFigure,
  surfaceTexture, texturedMat, deckPlateFace, reg,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Linen and Regulated Waste Handling VR — Healthcare Support,
// station five. The soiled-linen and waste staging room a hospital's whole
// building empties into: bags checked for a leak the moment they arrive,
// three separate streams — general, regulated and sharps — kept apart by
// more than a guess at the colour of the bag, a container weighed and
// sealed to its own limit before it's ever manifested for the hauler, a
// spill met with the kit built for it, a washed cart never mixed back with
// a soiled one, and the whole shift's count logged before the truck leaves.

const LWH_ACCENT = 0x5f8fd6;

export const SIM_HC_LINEN_AND_REGULATED_WASTE_HANDLING = {
  id: "hc-linen-and-regulated-waste-handling",
  index: "356",
  domain: "Healthcare Support",
  trade: "Linen and regulated waste handler",
  category: "Healthcare Support",
  indoor: "service",
  certification: "OSHA 29 CFR 1910.1030 bloodborne pathogens for regulated waste and soiled linen; OSHA 29 CFR 1910.1200 hazard communication for the labelling every stream carries; the CDC's general infection-prevention guidance for handling contaminated laundry and waste; SEIU-UHW and NUHW as the training bodies for linen and waste handling staff",
  name: "Linen & Regulated Waste Handling",
  title: simTitle("Linen & Regulated Waste Handling"),
  tagline: "Bags checked for a leak on arrival, three waste streams kept apart, a container weighed and sealed to its own limit, a spill met with its kit, and a washed cart never mixed back with a soiled one",
  accent: LWH_ACCENT,
  accentCss: "#5f8fd6",
  parSeconds: 300,
  footprint: 2.5,
  badge: { id: "streams-clean", name: "Streams Clean", note: "A shift's linen and waste handled without a single stream crossing another" },

  // Named for the guide's end-of-run check-in card (shared/ei-guide.js):
  // the profession's own support resource, not an invented hotline.
  supportLine: "your employer's employee assistance program, or SEIU-UHW's member resources if a bag or a spill today has you more shaken than usual",

  game: system({
    name: "Waste Room Standard",
    currency: "STREAM",
    ranks: ["New Handler", "Waste Room Certified", "Lead Handler", "Waste Room Supervisor", "Streams Certified"],
    badges: [
      { id: "leak-caught", name: "Leak Caught", note: "Every leaking bag double-bagged before it moved any further", test: AWARD.stepClean("double-bag-leak") },
      { id: "streams-sorted", name: "Streams Sorted", note: "General, regulated and sharps never mixed", test: AWARD.stepClean("waste-segregation") },
      { id: "cart-integrity", name: "Cart Integrity", note: "A washed cart never released back into service wet or mixed with a soiled one", test: AWARD.stepClean("clean-cart-release") },
    ],
    challenges: [
      { id: "clean-shift", name: "Clean Shift", note: "No corrections anywhere in the shift", test: AWARD.clean },
      { id: "steady-spill", name: "Steady Spill Response", note: "Held the spill kit application the whole time, first try", test: AWARD.unbroken },
      { id: "fast-room", name: "Fast Room", note: "Complete inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "unprotected-sharps-handling-decoy": "There's a sharp visibly poking through that bag, and a bare-handed squeeze is exactly what's about to happen to it. A bag that shows a sharp through the plastic gets set down and handled with the tool built for it, never compressed or squeezed by hand to make it fit.",
    "mixed-waste-stream-decoy": "That yellow hazardous-drug container has ordinary food wrapper and general trash sitting in it. Mixing anything into a dedicated stream doesn't just contaminate that bin — it turns everything else in it into the same problem the label was written to contain.",
    "dirty-cart-return-decoy": "That cart came straight off a soiled run and it's parked in the clean bay. A soiled cart in the clean bay contaminates every clean linen load that touches that space next, which defeats the entire reason the two bays are kept apart.",
    "blocked-spill-kit-decoy": "Those boxes are stacked right across the spill kit station. The one time this kit actually matters is the one time nobody can afford to dig it out from behind a pallet — it stays clear, always.",
  },

  lateNotes: {
    "seal-manifest-container": "Not yet — the container has to be weighed first, or the manifest is recording a number nobody actually checked.",
    "sealed-container": "Nothing sealed and manifested yet — there's nothing ready to move to the dock.",
    "log-pickup": "Hold that. The hauler hasn't actually taken the load yet.",
  },

  steps: [
    {
      id: "ppe-donning-lw", kind: "select", target: "ppe-donning-lw",
      title: "Don PPE for the waste room",
      cue: "Gown, gloves and eye protection before the first bag comes off the chute.",
      why: "Everything that reaches this room is contaminated until proven otherwise — OSHA's bloodborne pathogens standard treats this job the same as any other exposure risk, because a soiled bag doesn't announce what's actually inside it.",
    },
    {
      id: "receive-linen", kind: "select", target: "linen-chute-receiving",
      title: "Receive bags from the chute",
      cue: "Pull each bag off the chute landing and stage it for inspection before it moves any further.",
      why: "The chute is where every floor's laundry lands in one place, from a routine room change to whatever a code or a fall left behind — staging it here rather than carrying it straight through to the sorters is what gives this room its one real chance to catch a problem bag before it ever reaches the line.",
    },
    {
      id: "bag-inspect", kind: "find", noHint: true,
      targets: ["leaking-bag", "overweight-bag"],
      itemNames: { "leaking-bag": "a bag leaking through the plastic", "overweight-bag": "a bag packed past its weight limit" },
      itemNotes: {
        "leaking-bag": "Fluid working through the plastic here means it's already on whatever this bag has touched since it left the floor — it gets contained now, not carried the rest of the way to the sorter first.",
        "overweight-bag": "A bag packed well past its weight limit is a strain injury waiting for whoever lifts it next — it gets split into two bags at the correct weight, not muscled onto the scale as one.",
      },
      title: "Inspect every bag before it moves on",
      cue: "Two bags on this landing have a problem that gets worse the further they travel. Find them.",
      why: "A bag looks the same whether it's fine or failing until somebody actually checks it — this inspection is what catches a leak or an overweight bag while it's still sitting still on the landing, rather than partway down the sorting line where a leak has already spread and an overweight bag has already been lifted.",
    },
    {
      id: "double-bag-leak", kind: "select", target: "double-bag-leak",
      title: "Double-bag the leaking bag",
      cue: "Contain the leaking bag inside a second bag before it goes anywhere else.",
      why: "A second bag around a leaking one is what stops the contamination at this landing instead of on the cart, the floor, or the next person's gloves — it is the whole reason double-bagging exists as a step rather than a suggestion.",
    },
    {
      id: "waste-segregation", kind: "sequence", anyOrder: true,
      targets: ["sort-regulated", "sort-general", "sort-sharps-container"],
      itemNames: { "sort-regulated": "regulated waste bin", "sort-general": "general waste bin", "sort-sharps-container": "sharps container" },
      title: "Sort into the three separate streams",
      cue: "Place today's waste into the regulated, general and sharps containers, each in its own bin.",
      why: "General, regulated and sharps waste are hauled, treated and disposed of under completely different rules — a stream that gets mixed at the sorting stage stays mixed all the way to disposal, which turns a bin of ordinary trash into a bin of regulated medical waste that now has to be treated as one.",
    },
    {
      id: "weigh-container", kind: "gauge", target: "waste-scale",
      title: "Weigh the regulated container before sealing",
      cue: "Read the scale and confirm the container is within its rated weight before you seal it.",
      why: "Every regulated waste container has a weight rating set by its own manufacturer — a container sealed over that limit is a container that can split, buckle or fail exactly where a hauler has to lift and stack it, and a failure at that point spreads whatever the container was holding across a dock full of other people's loads.",
      gauge: { label: "CONTAINER WEIGHT", speed: 0.6, green: [0.3, 0.7], readout: (t) => (t > 0.7 ? "over rated weight" : "within rated weight"), missNote: "Sealed a container you never actually confirmed was within its rated weight. Reopen it and check before it goes any further." },
    },
    {
      id: "seal-manifest", kind: "select", target: "seal-manifest-container",
      title: "Seal the container and complete the manifest",
      cue: "Seal the lid and fill in the manifest tag before the container leaves this room.",
      why: "The manifest is what makes this container's contents, weight and origin something the hauler and the facility can both be held to later — a container that leaves without one is untraceable the moment it's out the door, and untraceable is exactly the state regulated waste is never supposed to reach.",
    },
    {
      id: "dock-scan", kind: "find", noHint: true,
      targets: ["mislabeled-container", "overfilled-bin"],
      itemNames: { "mislabeled-container": "a container with no biohazard label", "overfilled-bin": "a bin packed past its fill line" },
      itemNotes: {
        "mislabeled-container": "A regulated waste container with no biohazard label on it reads as ordinary trash to everyone downstream who never opens it to check — the label goes on before it ever reaches the dock, not after someone asks where it went.",
        "overfilled-bin": "A bin forced shut past its fill line is one more item away from splitting the next time someone tries to close it — it gets emptied into a fresh container, not pressed down to make room.",
      },
      title: "Scan the staging area before loading",
      cue: "Two containers on this dock aren't ready to go out. Find them.",
      why: "The dock is the last place anything gets caught before it becomes the hauler's problem instead of this room's — a scan here, right before loading, is what keeps a labelling gap or an overfilled bin from riding out the door unnoticed and turning into someone else's discovery later.",
    },
    {
      id: "spill-response", kind: "hold", target: "spill-kit-station", seconds: 6,
      title: "Respond to the spill with its kit",
      cue: "Apply the spill kit's absorbent and hold the containment steady through the full cleanup.",
      why: "A body-fluid spill kit is built to be used start to finish in one motion — absorbent down, contained, disposed of as regulated waste — and stopping partway through leaves exactly the kind of half-contained spill the kit exists to prevent.",
      holdBreakNote: "The cleanup broke off before the spill was fully contained. A spill treated halfway is still a spill anyone can walk through.",
    },
    {
      id: "dock-move", kind: "drag", target: "sealed-container",
      title: "Move the sealed container to the dock",
      cue: "Roll the sealed, manifested container to its marked slot on the loading dock.",
      why: "The dock slot is where the hauler expects to find exactly what the manifest describes, in the order the pickup route runs — a container parked anywhere else, even a few feet away, is a container the pickup can miss entirely and this room has to explain going nowhere on the manifest that says it left.",
      drag: { to: "loading-dock-slot", radius: 0.4, missNote: "Not in the marked slot — a container left off to the side is easy for the hauler to miss on pickup." },
    },
    {
      id: "cart-wash", kind: "turn", target: "cart-wash-valve",
      title: "Run the cart washer",
      cue: "Turn the wash valve and run the empty linen cart through its full cycle.",
      turn: { turns: 0.5, axis: "y", label: "CART WASH" },
      why: "An empty cart still carries whatever it was hauling right up until it's actually washed, not just emptied out — running it through the washer before it goes anywhere near the clean bay is what keeps yesterday's soiled load off today's clean linen instead of just out of sight.",
    },
    {
      id: "clean-cart-release", kind: "select", target: "clean-cart-release",
      title: "Release the cart once it's dry",
      cue: "Confirm the washed cart is fully dry before releasing it to the clean bay.",
      why: "A cart released wet carries moisture into a clean linen load the same way a soiled one carries contamination — dry and actually confirmed is the real bar for clean here, not just recently run through the washer and pushed straight back into service.",
    },
    {
      id: "restock-linen", kind: "sequence", anyOrder: true,
      targets: ["unload-delivery", "shelve-stock"],
      itemNames: { "unload-delivery": "unload today's delivery", "shelve-stock": "shelve it on the clean rack" },
      title: "Restock the clean linen supply",
      cue: "Unload today's delivery and shelve it on the clean linen rack.",
      why: "A floor that runs out of clean linen mid-shift reaches for whatever's closest, which is exactly how corners get cut elsewhere in the building — keeping this shelf actually stocked, unloaded and shelved rather than left sitting on a pallet by the door, is what keeps that pressure from building up in the first place.",
    },
    {
      id: "log-pickup", kind: "select", target: "log-pickup",
      title: "Log the pickup and the shift's count",
      cue: "Record the hauler's pickup and today's container count in the log.",
      why: "The log is what lets this facility answer, months later, exactly how much regulated waste left the building on a given day and who signed it out — a shift that isn't logged is a shift regulators and auditors alike have no record of.",
    },
  ],

  interrupts: [
    {
      id: "unlabeled-bag-found",
      kind: "Unidentified waste stream",
      after: "bag-inspect", delay: 3, seconds: 12,
      alert: "A bag turns up on the sorting line with no colour coding and no label at all — it could be general or it could be regulated.",
      cue: "That doesn't get guessed at.",
      target: "notify-supervisor-lw",
      why: "An unlabeled bag is treated as the more hazardous stream until someone with the authority to say otherwise actually looks at it — guessing it into general waste because it's probably fine is exactly the shortcut that turns this room's whole segregation system into a coin flip.",
      missNote: "The unlabeled bag went into general waste on a guess. If it was actually regulated, every bag it touched on the way there now has the same question hanging over it.",
      wrongNote: "It's the call to the supervisor — an unlabeled bag doesn't get sorted on a guess.",
    },
    {
      id: "second-spill",
      kind: "Second spill spotted",
      after: "spill-response", delay: 3, seconds: 11,
      alert: "While you're still finishing the first cleanup, a second spill is spotted a few feet away.",
      cue: "One kit, one spill at a time — this one needs another set of hands.",
      target: "call-for-backup",
      why: "Splitting attention between two active spills is how both end up half-contained instead of one being handled properly — the second spill gets cordoned and backup called, not started solo while the first one is still open.",
      missNote: "Both spills got worked at once, alone. Neither one actually got the kit's full, uninterrupted process, which is the only way either one counts as contained.",
      wrongNote: "Call for backup — a second spill doesn't get folded into whatever you're already doing.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.5, LWH_ACCENT);

    const steelTex = surfaceTexture((cx, w, h) => deckPlateFace(cx, w, h), { repeat: 6, px: 256 });
    const steelMat = () => texturedMat(steelTex, { rough: 0.5, metal: 0.5, color: 0xb9c4c9 });
    const floorPatch = slab(g, 3.6, 0.006, 3.4, 0, 0.001, 0, 0x8b929a, { radius: 0.05, cast: false });
    floorPatch.material = steelMat();

    // ------------------------------------------------------------------ PPE + chute
    const ppeStand = group(g, -3.0, 0, -2.6);
    slab(ppeStand, 0.5, 1.4, 0.1, 0, 0.7, 0, 0x53585e, { radius: 0.02, rough: 0.5, metal: 0.4 });
    const ppeStub = box(ppeStand, 0.2, 0.14, 0.08, 0, 0.85, 0.07, 0x8fb9d6, { rough: 0.75 });
    holoTag(ppeStand, "PPE", 0, 0.98, 0.07, { css: LWH_ACCENT, w: 0.3 });
    reg(hits, ppeStub, "ppe-donning-lw");

    const chute = group(g, -2.2, 0, -2.8);
    cyl(chute, 0.3, 0.3, 1.8, 0, 0.9, 0, 0x8b929a, { rough: 0.4, metal: 0.5, seg: 16 });
    const chuteFlap = box(chute, 0.32, 0.03, 0.1, 0, 1.5, 0.3, 0x53585e, { rough: 0.5, metal: 0.4 });
    void chuteFlap;
    holoTag(chute, "Chute landing", 0, 1.9, 0, { css: LWH_ACCENT, w: 0.4 });

    // Bags on the landing: normal, leaking, overweight.
    const landing = group(g, -1.4, 0, -2.6);
    const bagOK = ball(landing, 0.18, -0.4, 0.2, 0, 0xe4e9ea, { rough: 0.75, seg: 10, seg2: 10 });
    reg(hits, bagOK, "linen-chute-receiving");
    const leakBag = ball(landing, 0.16, 0, 0.18, 0, 0xdfe4e5, { rough: 0.75, seg: 10, seg2: 10 });
    const leakDrip = ball(landing, 0.02, 0, 0.02, 0.16, 0x8e1c1c, { rough: 0.6, seg: 8 });
    void leakDrip;
    holoTag(leakBag, "Leaking bag", 0, 0.24, 0, { css: "#f0645b", w: 0.4 });
    reg(hits, leakBag, "leaking-bag");
    const heavyBag = ball(landing, 0.22, 0.4, 0.24, 0, 0xdfe4e5, { rough: 0.8, seg: 10, seg2: 10 });
    heavyBag.scale.set(1.2, 0.9, 1.2);
    holoTag(heavyBag, "Overweight bag", 0, 0.3, 0, { css: "#f0645b", w: 0.44 });
    reg(hits, heavyBag, "overweight-bag");

    // Double-bag station.
    const doubleBagStand = group(g, -0.4, 0, -2.9);
    box(doubleBagStand, 0.4, 0.03, 0.3, 0, 0.5, 0, 0x53585e, { rough: 0.5, metal: 0.4 });
    const spareBagRoll = cyl(doubleBagStand, 0.06, 0.06, 0.3, 0, 0.66, 0, 0xf4f8fa, { rough: 0.6, opacity: 0.7, transparent: true, seg: 12 });
    spareBagRoll.rotation.z = Math.PI / 2;
    holoTag(doubleBagStand, "Double-bag here", 0, 0.75, 0, { css: LWH_ACCENT, w: 0.44 });
    reg(hits, spareBagRoll, "double-bag-leak");

    // ------------------------------------------------------------------ waste sort
    const sortRow = group(g, 1.2, 0, -2.6);
    const regulatedBin = cyl(sortRow, 0.2, 0.18, 0.5, -0.5, 0.25, 0, 0xd8342a, { rough: 0.55, seg: 14 });
    decal(sortRow, 0.28, 0.1, -0.5, 0.42, 0.181, signFace("REGULATED", { bg: "#7d1512", accent: "#f2ae14", scale: 0.4 }));
    reg(hits, regulatedBin, "sort-regulated");
    const generalBin = cyl(sortRow, 0.2, 0.18, 0.5, 0, 0.25, 0, 0x8b929a, { rough: 0.55, seg: 14 });
    holoTag(generalBin, "General", 0, 0.52, 0, { css: LWH_ACCENT, w: 0.3 });
    reg(hits, generalBin, "sort-general");
    const sharpsBin = group(sortRow, 0.5, 0, 0);
    box(sharpsBin, 0.24, 0.34, 0.2, 0, 1.0, 0, 0xd8342a, { rough: 0.6 });
    box(sharpsBin, 0.26, 0.04, 0.22, 0, 1.18, 0, 0xf2e9c9, { rough: 0.55 });
    reg(hits, sharpsBin, "sort-sharps-container");

    // Cross-stream decoy: hazardous-drug yellow container with general trash in it.
    const hazDrugBin = group(g, 1.9, 0, -2.6);
    cyl(hazDrugBin, 0.2, 0.18, 0.5, 0, 0.25, 0, 0xf2c14b, { rough: 0.55, seg: 14 });
    box(hazDrugBin, 0.14, 0.1, 0.1, 0, 0.55, 0, 0xdfe4e5, { rough: 0.7 });
    holoTag(hazDrugBin, "Trash in hazdrug bin", 0, 0.66, 0, { css: "#f0645b", w: 0.5 });
    reg(hits, hazDrugBin, "mixed-waste-stream-decoy");

    // ------------------------------------------------------------------ scale + manifest
    const scaleStand = group(g, 0.3, 0, -1.2);
    box(scaleStand, 0.4, 0.06, 0.4, 0, 0.03, 0, 0x53585e, { rough: 0.5, metal: 0.4 });
    const scalePanel = instrument(scaleStand, 0.24, 0.12, 0, { idle: "-- lb", color: LWH_ACCENT, w: 0.16, d: 0.2, ry: 0 });
    reg(hits, scalePanel, "waste-scale");

    const manifestPanel = holoPanel(g, 0.5, 0.34, 0.9, 1.5, -1.2, (ctx, w, h) => {
      ctx.fillStyle = "rgba(6,14,26,0.9)"; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#5f8fd6"; ctx.fillRect(0, 0, w, 5);
      ctx.fillStyle = "#dcecff";
      ctx.font = `600 ${Math.round(h * 0.12)}px 'Barlow Condensed', Arial, sans-serif`;
      ctx.textAlign = "left"; ctx.textBaseline = "middle";
      ctx.fillText("MANIFEST", w * 0.06, h * 0.25);
      ctx.font = `${Math.round(h * 0.09)}px Arial, sans-serif`;
      ctx.fillText("Weight: — · Sealed: —", w * 0.06, h * 0.6);
    }, { accent: LWH_ACCENT, ry: -0.4 });
    reg(hits, manifestPanel, "seal-manifest-container");

    // ------------------------------------------------------------------ dock
    const dock = group(g, 2.4, 0, 0.6);
    box(dock, 0.5, 0.02, 0.5, 0, 0.001, 0, 0xffffff, { opacity: 0.001, transparent: true, cast: false });
    hits["loading-dock-slot"] = dock.children[0];

    const mislabeledContainer = group(g, 2.0, 0, 1.2);
    box(mislabeledContainer, 0.4, 0.6, 0.4, 0, 0.3, 0, 0xd8342a, { rough: 0.6 });
    holoTag(mislabeledContainer, "No label", 0, 0.66, 0, { css: "#f0645b", w: 0.36 });
    reg(hits, mislabeledContainer, "mislabeled-container");
    const overfilledBin = group(g, 2.7, 0, 1.4);
    cyl(overfilledBin, 0.22, 0.2, 0.55, 0, 0.28, 0, 0x8b929a, { rough: 0.55, seg: 14 });
    box(overfilledBin, 0.3, 0.06, 0.3, 0, 0.58, 0, 0xdfe4e5, { rough: 0.7 });
    holoTag(overfilledBin, "Past fill line", 0, 0.68, 0, { css: "#f0645b", w: 0.4 });
    reg(hits, overfilledBin, "overfilled-bin");

    const sealedContainer = group(g, 0.3, 0, -0.4);
    box(sealedContainer, 0.4, 0.6, 0.4, 0, 0.3, 0, 0xd8342a, { rough: 0.55 });
    box(sealedContainer, 0.42, 0.04, 0.42, 0, 0.61, 0, 0xf2e9c9, { rough: 0.5 });
    reg(hits, sealedContainer, "sealed-container");

    // ------------------------------------------------------------------ spill kit
    const spillStand = group(g, -2.9, 0, 0.4);
    box(spillStand, 0.32, 0.4, 0.14, 0, 1.1, 0, 0xd8342a, { rough: 0.55 });
    box(spillStand, 0.28, 0.36, 0.02, 0, 1.1, 0.071, 0xf2e9c9, { rough: 0.5 });
    decal(spillStand, 0.2, 0.14, 0, 1.14, 0.081, signFace("SPILL KIT", { bg: "#7d1512", accent: "#f2ae14", scale: 0.4 }), { px: 96 });
    reg(hits, spillStand, "spill-kit-station");
    const spillPuddle = box(g, 0.3, 0.005, 0.3, -2.5, 0.003, 0.8, 0x6b2a2a, { rough: 0.3, opacity: 0.6, transparent: true, cast: false });
    const spillBubbles = particles(g, 10, 0x8e1c1c, { size: 0.008, life: 0.5, additive: false, opacity: 0.4 });
    const secondSpillPuddle = box(g, 0.24, 0.005, 0.24, -1.9, 0.003, 1.1, 0x6b2a2a, { rough: 0.3, opacity: 0.6, transparent: true, cast: false });
    secondSpillPuddle.visible = false;

    // Blocked spill kit decoy — a second kit behind stacked boxes.
    const blockedKit = group(g, -2.2, 0, 1.6);
    box(blockedKit, 0.28, 0.36, 0.12, 0, 1.05, 0, 0xd8342a, { rough: 0.55 });
    const stackBoxes = group(blockedKit, 0, 0, 0.2);
    box(stackBoxes, 0.3, 0.24, 0.24, 0, 0.12, 0, 0xc9a34a, { rough: 0.7 });
    box(stackBoxes, 0.3, 0.24, 0.24, 0, 0.38, 0, 0xc9a34a, { rough: 0.7 });
    holoTag(blockedKit, "Kit blocked", 0, 1.3, 0, { css: "#f0645b", w: 0.4 });
    reg(hits, blockedKit, "blocked-spill-kit-decoy");

    // Sharp poking through a bag — the bare-hand squeeze temptation.
    const sharpBag = group(g, -0.9, 0, -1.6);
    ball(sharpBag, 0.16, 0, 0.2, 0, 0xdfe4e5, { rough: 0.75, seg: 10, seg2: 10 });
    const poke = cyl(sharpBag, 0.004, 0.004, 0.08, 0.08, 0.24, 0, CITY.steel, { rough: 0.3, metal: 0.8, seg: 6 });
    holoTag(poke, "Sharp poking through", 0, 0.06, 0, { css: "#f0645b", w: 0.5 });
    reg(hits, poke, "unprotected-sharps-handling-decoy");

    // ------------------------------------------------------------------ cart wash
    const washer = group(g, -2.2, 0, 2.3);
    box(washer, 0.8, 1.0, 0.7, 0, 0.5, 0, 0x8b929a, { rough: 0.45, metal: 0.5 });
    const washerValve = cyl(washer, 0.03, 0.03, 0.1, 0, 0.9, 0.36, CITY.steel, { rough: 0.4, metal: 0.7, seg: 12 });
    washerValve.rotation.x = Math.PI / 2;
    holoTag(washer, "Cart washer", 0, 1.1, 0, { css: LWH_ACCENT, w: 0.4 });
    reg(hits, washerValve, "cart-wash-valve");

    const cleanBay = group(g, -1.0, 0, 3.0);
    box(cleanBay, 1.4, 0.02, 1.0, 0, 0.001, 0, 0x9fd6c0, { rough: 0.6, opacity: 0.3, transparent: true, cast: false });
    holoTag(cleanBay, "Clean bay", 0, 0.1, 0, { css: LWH_ACCENT, w: 0.4 });
    const cleanCart = group(cleanBay, 0.3, 0, 0);
    box(cleanCart, 0.6, 0.7, 0.5, 0, 0.35, 0, 0xdfe4e5, { rough: 0.5, metal: 0.2 });
    reg(hits, cleanCart, "clean-cart-release");

    // Dirty cart parked in the clean bay — the decoy.
    const dirtyCart = group(cleanBay, -0.4, 0, 0.2);
    box(dirtyCart, 0.6, 0.7, 0.5, 0, 0.35, 0, 0x8b7a6a, { rough: 0.7 });
    holoTag(dirtyCart, "Soiled cart here?", 0, 0.78, 0, { css: "#f0645b", w: 0.46 });
    reg(hits, dirtyCart, "dirty-cart-return-decoy");

    // ------------------------------------------------------------------ linen supply
    const supplyShelf = group(g, 3.2, 0, -0.8);
    box(supplyShelf, 0.06, 1.4, 0.6, -0.38, 0.7, 0, 0x8b929a, { rough: 0.5, metal: 0.4 });
    box(supplyShelf, 0.06, 1.4, 0.6, 0.38, 0.7, 0, 0x8b929a, { rough: 0.5, metal: 0.4 });
    const SHELF_STOCK = [
      [0.3, "SHEETS", 0xf4f8fa], [0.7, "TOWELS", 0xdfe4e5], [1.1, "GOWNS", 0xf2c14b],
    ];
    for (const [y, label, c] of SHELF_STOCK) {
      box(supplyShelf, 0.74, 0.02, 0.58, 0, y, 0, 0x6f7a83, { rough: 0.55, metal: 0.3 });
      for (let i = -1; i <= 1; i++) {
        box(supplyShelf, 0.2, 0.14, 0.18, i * 0.24, y + 0.08, 0, c, { rough: 0.7 });
        decal(supplyShelf, 0.16, 0.05, i * 0.24, y + 0.08, 0.091, (cx, w, h) => {
          cx.fillStyle = "#22272c"; cx.fillRect(0, 0, w, h);
          cx.fillStyle = "#dcecff"; cx.font = `600 ${Math.round(h * 0.5)}px Arial, sans-serif`;
          cx.textAlign = "center"; cx.textBaseline = "middle"; cx.fillText(label, w / 2, h / 2);
        }, { px: 96 });
      }
    }
    holoTag(supplyShelf, "Clean linen", 0, 1.45, 0, { css: LWH_ACCENT, w: 0.4 });
    reg(hits, supplyShelf, "shelve-stock");

    const deliveryPallet = group(g, 3.2, 0, -1.8);
    box(deliveryPallet, 0.5, 0.08, 0.5, 0, 0.04, 0, 0xc9a34a, { rough: 0.75 });
    box(deliveryPallet, 0.44, 0.3, 0.44, 0, 0.24, 0, 0xf4f8fa, { rough: 0.6, opacity: 0.9, transparent: true });
    box(deliveryPallet, 0.44, 0.3, 0.44, 0, 0.55, 0, 0xdfe4e5, { rough: 0.6, opacity: 0.9, transparent: true });
    holoTag(deliveryPallet, "Today's delivery", 0, 0.76, 0, { css: LWH_ACCENT, w: 0.44 });
    reg(hits, deliveryPallet, "unload-delivery");

    const logPanel = holoPanel(g, 0.5, 0.34, 3.2, 1.3, 0.5, (ctx, w, h) => {
      ctx.fillStyle = "rgba(6,14,26,0.9)"; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#5f8fd6"; ctx.fillRect(0, 0, w, 5);
      ctx.fillStyle = "#dcecff";
      ctx.font = `600 ${Math.round(h * 0.12)}px 'Barlow Condensed', Arial, sans-serif`;
      ctx.textAlign = "left"; ctx.textBaseline = "middle";
      ctx.fillText("PICKUP LOG", w * 0.06, h * 0.25);
      ctx.font = `${Math.round(h * 0.09)}px Arial, sans-serif`;
      ctx.fillText("Status: awaiting hauler", w * 0.06, h * 0.6);
    }, { accent: LWH_ACCENT, ry: -0.6 });
    reg(hits, logPanel, "log-pickup");

    // Supervisor + backup call panels for the interrupts.
    const supervisorPanel = group(g, -3.0, 0, -0.6);
    box(supervisorPanel, 0.1, 0.02, 0.16, 0, 1.0, 0, 0x2b3138, { rough: 0.4, metal: 0.3 });
    holoTag(supervisorPanel, "Notify supervisor", 0, 1.1, 0, { css: LWH_ACCENT, w: 0.4 });
    reg(hits, supervisorPanel, "notify-supervisor-lw");
    const supervisorLamp = ball(supervisorPanel, 0.012, 0, 1.05, 0.01, 0x59c97b, { emissive: 0x59c97b, ei: 0.4, cast: false, seg: 8, seg2: 6 });
    const backupPanel = group(g, -1.6, 0, 1.6);
    box(backupPanel, 0.1, 0.02, 0.16, 0, 1.0, 0, 0x2b3138, { rough: 0.4, metal: 0.3 });
    holoTag(backupPanel, "Call for backup", 0, 1.1, 0, { css: LWH_ACCENT, w: 0.4 });
    reg(hits, backupPanel, "call-for-backup");

    const handler = standingFigure(g, 0.1, -1.05, { ry: 0.6, cloth: 0x3f6fa0, skin: 0xb98a63 });

    // A second handler at the dock, and a pallet jack for depth.
    const secondHandler = standingFigure(g, 2.35, -1.5, { ry: -1.2, cloth: 0x8a5aa0, skin: 0xd9a985 });
    void secondHandler;
    const palletJack = group(g, 1.6, 0, 1.4);
    box(palletJack, 0.5, 0.08, 0.9, 0, 0.06, 0, 0xf2c14b, { rough: 0.55 });
    box(palletJack, 0.12, 0.5, 0.06, 0, 0.3, -0.5, 0x2b3138, { rough: 0.5, metal: 0.3 });
    for (const sx of [-1, 1]) cyl(palletJack, 0.06, 0.06, 0.04, sx * 0.18, 0.03, 0.3, 0x14171a, { rough: 0.7, seg: 12 });
    holoTag(palletJack, "Pallet jack", 0, 0.6, -0.5, { css: LWH_ACCENT, w: 0.4 });
    void handler;

    return {
      hits,
      footprint: 2.5,
      spawnLook: new THREE.Vector3(0, 1.1, -1.6),

      onStepComplete(step) {
        if (step.id === "bag-inspect") { /* leave visible until double-bag/segregation handles them */ }
        if (step.id === "double-bag-leak") { leakBag.visible = false; }
        if (step.id === "waste-segregation") { heavyBag.visible = false; }
        if (step.id === "weigh-container") {
          repaint(scalePanel.userData.screen, signFace("OK", { bg: "#0d1c24", accent: "#59c97b", fg: "#dcecff", scale: 0.6 }));
        }
        if (step.id === "seal-manifest") {
          repaint(manifestPanel.userData.face, (ctx, w, h) => {
            ctx.fillStyle = "rgba(6,14,26,0.9)"; ctx.fillRect(0, 0, w, h);
            ctx.fillStyle = "#5f8fd6"; ctx.fillRect(0, 0, w, 5);
            ctx.fillStyle = "#dcecff";
            ctx.font = `600 ${Math.round(h * 0.12)}px 'Barlow Condensed', Arial, sans-serif`;
            ctx.textAlign = "left"; ctx.textBaseline = "middle";
            ctx.fillText("MANIFEST", w * 0.06, h * 0.25);
            ctx.font = `${Math.round(h * 0.09)}px Arial, sans-serif`;
            ctx.fillText("Weight: logged · Sealed: yes", w * 0.06, h * 0.6);
          });
        }
        if (step.id === "dock-scan") { mislabeledContainer.visible = false; overfilledBin.visible = false; }
        if (step.id === "spill-response") { spillPuddle.visible = false; }
        if (step.id === "dock-move") {
          sealedContainer.parent.remove(sealedContainer);
          dock.add(sealedContainer);
          sealedContainer.position.set(0, 0.3, 0);
        }
        if (step.id === "log-pickup") {
          repaint(logPanel.userData.face, (ctx, w, h) => {
            ctx.fillStyle = "rgba(6,14,26,0.9)"; ctx.fillRect(0, 0, w, h);
            ctx.fillStyle = "#5f8fd6"; ctx.fillRect(0, 0, w, 5);
            ctx.fillStyle = "#dcecff";
            ctx.font = `600 ${Math.round(h * 0.12)}px 'Barlow Condensed', Arial, sans-serif`;
            ctx.textAlign = "left"; ctx.textBaseline = "middle";
            ctx.fillText("PICKUP LOG", w * 0.06, h * 0.25);
            ctx.font = `${Math.round(h * 0.09)}px Arial, sans-serif`;
            ctx.fillText("Status: picked up · logged", w * 0.06, h * 0.6);
          });
        }
      },

      onInterrupt(it) {
        if (it.id === "second-spill") secondSpillPuddle.visible = true;
        if (it.id === "unlabeled-bag-found") supervisorLamp.material = mat(0xf0645b, { emissive: 0xf0645b, ei: 1.8 });
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "second-spill") secondSpillPuddle.visible = false;
        if (it.id === "unlabeled-bag-found") supervisorLamp.material = mat(0x59c97b, { emissive: 0x59c97b, ei: 0.4 });
      },

      onHazard() {},

      animate(t, dt, session) {
        spillBubbles.visible = session?.step?.id === "spill-response" && !!session.holding;
        if (spillBubbles.visible) spillBubbles.userData.step(dt, new THREE.Vector3(-2.5, 0.05, 0.8), 0.1, 0.15, 0.2);
        const gg = session?.gauge;
        if (gg && !gg.committed && session.step?.id === "weigh-container") {
          repaint(scalePanel.userData.screen, signFace(gg.t > 0.7 ? "OVER" : "OK", {
            bg: "#0d1c24", accent: gg.t > 0.7 ? "#f0645b" : "#59c97b", fg: "#dcecff", scale: 0.6,
          }));
        }
        void t;
      },
    };
  },
};
