import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import { box, cyl, ball, torus, hose, group, decal, repaint, signFace, paperFace, mat } from "../../../shared/kit.js";
import {
  CITY, stationPad, holoPanel, holoTag, toolChest, instrument, cone, barrierPanel,
  standingFigure, reg, surfaceTexture, texturedMat, pavingFace, waterFace,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Dock Fender & Bollard Inspection VR — Maritime & Ports, the
// port maintenance pack.
//
// The wharf edge between vessel calls: a fender panel hanging on its chains
// over the water, a bollard on the cope with its anchor bolts, and a crane
// truck on the apron with the replacement pad slung. The learner is the ILWU
// maintenance and repair worker on the wharf structures crew; the IUOE
// operator runs the truck. Everything here is done over water with a berth
// window closing, which is why the vest goes on before the edge and why the
// storm call empties the cope before it empties the sky.

const PTF_ACCENT = 0x2f8f9d;

export const SIM_PT_DOCK_FENDER_AND_BOLLARD_INSPECTION = {
  id: "pt-dock-fender-and-bollard-inspection",
  index: "221",
  domain: "Maritime & Ports",
  trade: "ILWU maintenance and repair — wharf structures crew, PMA training programme, with the IUOE operator on the crane truck",
  category: "Maritime & Ports",
  district: "Maritime & Ports",
  weather: "wind",
  certification: "ILWU maintenance and repair with the PMA training programme; IUOE crane truck operation; OSHA 29 CFR 1917 marine terminals, including work over water and the fender and bollard provisions; ASME B30.5 for the crane truck; ASME B30.9 for the slings on the pad; 29 CFR 1910.132 for the flotation vest and the edge lanyard",
  name: "Dock Fender & Bollard Inspection",
  title: simTitle("Dock Fender & Bollard Inspection"),
  tagline: "The wharf edge in a berth window: vest and lanyard on before the cope, the fender frame walked for cracks, the chains checked while a ship's jib swings over the apron, the pad measured and a new one slung in and bolted, the bollard's base checked and its anchors tensioned by the number while a storm cell comes over the water, the load plate read, the edge and the ladder proven, and the wharf logged",
  accent: PTF_ACCENT,
  accentCss: "#2f8f9d",
  parSeconds: 270,
  footprint: 2.6,
  badge: { id: "edge-worked-clean", name: "Edge Worked Clean", note: "Never at the cope without the vest, never under the slung pad, the jib and the storm both answered, and every anchor tensioned by the number" },

  supportLine: "your ILWU local's member assistance programme, with the PMA-ILWU benefit plan's counselling line behind it",

  game: system({
    name: "Wharf Structures",
    currency: "TONNE",
    ranks: ["Wharf Hand", "Structures Mechanic", "Fender Tech", "Lead Mechanic", "Wharf Structures Certified"],
    badges: [
      { id: "vest-before-edge", name: "Vest Before Edge", note: "The flotation vest and the lanyard on before the first step to the cope", test: AWARD.stepClean("edge-ppe") },
      { id: "tensioned-by-number", name: "Tensioned By Number", note: "Every anchor bolt tensioned inside the band, none by feel", test: AWARD.unbroken },
      { id: "cope-discipline", name: "Cope Discipline", note: "Never on the fender, never under the boom, never an unchocked truck worked beside", test: AWARD.safe },
    ],
    challenges: [
      { id: "clean-inspection", name: "Clean Inspection", note: "No corrections anywhere in the inspection", test: AWARD.clean },
      { id: "pad-to-the-mark", name: "Pad To The Mark", note: "Pad thickness committed inside the band first time", test: AWARD.precise(0.7) },
      { id: "berth-window", name: "Berth Window", note: "Wharf logged back inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "edge-no-pfd": "You leaned out over the cope to look at the fender with no flotation vest on. 29 CFR 1917 requires a personal flotation device wherever a fall into the water is the hazard, and the wharf edge is the definition of that hazard — a fall from the cope is a fall into cold water between a fender and a quay wall, in work clothes and boots, and the vest is the difference between a rescue and a recovery.",
    "stand-on-fender": "You stepped onto the fender panel to reach the lower chain bracket. The panel hangs on its chains over the water and is built to be hit by a ship, not stood on by a person — it swings the moment it takes an off-centre load, and the gap between it and the quay wall is exactly where a body goes. The lower bracket is reached from the cope with the pole, or from the boat.",
    "under-truck-boom": "You walked under the crane truck's boom with the fender pad slung from it. A pad on a sling is a suspended load like any other, and ASME B30.5 and 29 CFR 1917 both put the same rule on it — nobody under it, for any reason, for any length of time. A sling hitch that has been fine all morning does not announce that it is about to roll.",
    "truck-unchocked": "You started work beside the crane truck with its outriggers down but no wheel chocks set. An outrigger on a wharf apron can settle, and a truck whose outriggers lose contact is a truck sitting on its brakes alone with a boom out over the water — the chocks are what hold it if the brakes and the pads both let go at once, and they go in before anybody works beside it.",
  },

  lateNotes: {
    "pad-bolt": "The pad bolts are torqued once the new pad is seated on the frame — there is nothing to bolt yet.",
    "bolt-tensioner": "The anchor bolts are tensioned once the bollard's base has been inspected, not before a crack has been looked for.",
    "structures-log": "The wharf is logged once the edge and the ladder have been proven — the log is the last thing, not the first.",
  },

  steps: [
    {
      id: "berth-window", kind: "select", target: "berth-schedule-board",
      title: "Confirm the berth window and the vessel schedule",
      cue: "Check the berth schedule: no vessel due at this berth inside the window, the container crane parked and pinned, the apron released to structures.",
      why: "Fender and bollard work is done between calls because a ship coming alongside lands on the fenders and heaves on the bollards, and a crew at the cope when a vessel is closing the berth is a crew standing where several thousand tonnes are about to arrive. The berth schedule is the terminal's own statement of the window, and the crane pinned is what says the apron above the work is not going to move — both are read before the first step toward the edge, because the water does not give a second chance to read them later.",
    },
    {
      id: "edge-ppe", kind: "sequence", anyOrder: true,
      targets: ["pfd-vest", "edge-lanyard"],
      itemNames: { "pfd-vest": "flotation vest", "edge-lanyard": "edge lanyard to the cope anchor" },
      title: "Put on the flotation vest and clip to the cope anchor",
      cue: "Flotation vest on and zipped, and your lanyard clipped to the cope anchor, before a boot goes near the edge.",
      why: "29 CFR 1917 puts a personal flotation device on anyone working where they could fall into the water, and the wharf edge is that place all day; the lanyard to the cope anchor is what stops the fall being into the water in the first place, on a cope that is wet, sloped for drainage and edged with a fender gap. Both go on before the edge rather than at it, because the moment someone is leaning over the cope to look at a chain is the moment they are already past the point where a vest gets put on.",
    },
    {
      id: "frame-walk", kind: "find", noHint: true,
      targets: ["cracked-weld"],
      itemNames: { "cracked-weld": "cracked weld at the upper chain bracket" },
      itemNotes: { "cracked-weld": "The upper chain bracket's weld to the frame has a hairline crack running from the toe, with rust bleeding out of it — the bracket has been working under every berthing since the last inspection and is one hard landing from letting the chain go." },
      title: "Walk the fender frame and its brackets for cracks",
      cue: "Inspect the fender frame, the chain brackets and their welds from the cope: cracks at weld toes, rust bleeding, bent brackets.",
      why: "A fender frame takes a ship's berthing energy through its chains and brackets, and a bracket weld that has cracked lets the panel drop or swing on the next landing — into the hull, or onto whatever is below it. The crack shows as a hairline with rust bleeding from it long before it shows as a dropped panel, and it is found by looking at the weld toes from the cope with the vest on, not by waiting for the panel to hang crooked.",
    },
    {
      id: "chain-check", kind: "hold", target: "fender-chain", seconds: 4,
      title: "Check the fender's weight and shear chains",
      cue: "Hold the chain check: each chain taking its share, the shackles moused, the pins retained, the links free of wear at the bearing points.",
      why: "The fender panel hangs on its weight chains and is held against the quay by its shear chains, and each chain is inspected as a load-bearing part in its own right: a shackle pin without a mousing backs out under the working of a ship alongside, and a link worn thin at a bearing point fails on the berthing that puts the panel's whole weight through it. The check is held long enough to look at every chain and every shackle, because the one that fails is the one that was skipped.",
      holdBreakNote: "Released before every chain and shackle had been looked at — a fender is held by all of its chains or by none of them. Start the check again.",
    },
    {
      id: "pad-thickness", kind: "gauge", target: "pad-gauge",
      title: "Measure the fender pad's remaining thickness",
      cue: "Set the depth gauge on the pad's wear face and commit the reading against the minimum on the fender's data plate.",
      why: "The facing pads on a fender are what a ship's hull actually touches, and they wear with every berthing until the frame's bolt heads are the first thing a hull meets — which is a hull plate scored by a bolt rather than protected by a pad. The minimum thickness is the fender manufacturer's number, and the gauge is how the crew gets to that number rather than to an impression from the cope that the pad looks fine.",
      gauge: { label: "PAD THICKNESS", speed: 0.7, green: [0.42, 0.6], readout: (t) => `${Math.round(t * 60)} mm`, missNote: "Outside the band — set the gauge on the wear face itself, not on the pad's chamfered edge or a bolt head." },
    },
    {
      id: "fit-pad", kind: "drag", target: "new-pad",
      title: "Sling the replacement pad in and seat it on the frame",
      cue: "With the crane truck operator, bring the new pad in on its sling and seat it on the frame's bolt pattern — from the cope, never from the panel.",
      why: "The pad comes in on the crane truck's sling because it is too heavy for hands at an edge, and it is guided onto the frame's bolt pattern from the cope with a tag line rather than by someone on the panel: the panel swings under the pad's weight arriving, and a person on it goes into the gap. The pad seats on its pattern square, and it stays on the sling until the first bolts are in, because a pad resting on a frame by gravity alone is a pad that goes into the water on the first gust.",
      drag: { to: "pad-seat", radius: 0.5, missNote: "Not on the pattern — the pad has to seat square on the frame's bolt holes before a bolt is started, guided from the cope." },
    },
    {
      id: "pad-bolts", kind: "turn", target: "pad-bolt",
      title: "Torque the pad bolts to the fender maker's figure",
      cue: "Run the pad bolts up in sequence to the figure on the data plate, each one to the click, and then release the sling.",
      why: "The pad bolts are what hold the pad to a frame that gets hit by ships, and a bolt torqued by feel is either working loose under the vibration of every berthing or over-tensioned and yielded before the first one. The figure comes from the fender maker's plate, the sequence keeps the pad from cocking on the frame as it pulls down, and the sling comes off only after the bolts are in — the crane truck operator is holding the pad until you say otherwise.",
      turn: { turns: 1.0, label: "PAD BOLTS", readout: (t) => (t < 0.35 ? "started" : t < 0.9 ? "pulling up" : "at figure") },
    },
    {
      id: "bollard-base", kind: "find", noHint: true,
      targets: ["bollard-crack"],
      itemNames: { "bollard-crack": "crack in the cope concrete at the bollard's base plate" },
      itemNotes: { "bollard-crack": "The cope concrete has cracked from under the bollard's base plate toward the edge, and the seaward anchor bolt has a rust ring where it has been moving in the crack — the bollard has been heaving on that bolt under every spring line." },
      title: "Inspect the bollard casting and its base",
      cue: "Look at the bollard casting for cracks, the base plate for movement, and the cope concrete around the anchors for cracking and rust rings.",
      why: "A bollard takes a ship's mooring loads into the wharf through its base plate and anchor bolts, and the failure that matters is not usually the casting — it is the concrete around the anchors cracking, the plate lifting a fraction under every line, and the bolts working in their holes until the bollard comes out under a surge with a ship on it. That failure shows first as a crack in the cope with rust bleeding from a bolt, and it is found by looking at the base, not the top.",
    },
    {
      id: "anchor-tension", kind: "track", target: "bolt-tensioner", seconds: 6,
      title: "Tension the bollard's anchor bolts with the hydraulic tensioner",
      cue: "Run the tensioner up to the specified pressure on each anchor bolt and hold it there while the nut is run down — steady at the figure, no overshoot.",
      why: "A bollard's anchor bolts are tensioned to a figure the wharf's engineer specified, because the bollard's rated load assumes the bolts are pre-loaded to it: a bolt below tension lets the plate lift and work under every line, and a bolt taken over tension is a bolt yielded before a ship ever pulls on it. The tensioner's pressure is held steady at the figure while the nut is run down, and it is a held figure rather than a peak because the bolt's pre-load is whatever the pressure was when the nut touched.",
      track: { start: 0.1, green: [0.4, 0.6], rise: 0.6, fall: 0.48, drift: 0.12, label: "TENSIONER", readout: (v) => (v < 0.4 ? "under tension" : v > 0.6 ? "over — bolt yielding" : "at figure — run the nut") },
      holdBreakNote: "The pressure broke out of band while the nut was being run down — that bolt's pre-load is now whatever it was at that moment. Back it off and tension it again.",
    },
    {
      id: "load-plate", kind: "select", target: "rated-load-plate",
      title: "Verify the bollard's rated load plate against the berth plan",
      cue: "Read the bollard's rated load plate: legible, matching the berth plan's figure, and the bollard's number matching the plan's.",
      why: "The ship's officer planning a mooring reads the bollard's rated load off the berth plan and the pilot reads it off the plate, and the two have to agree: a plate that has corroded illegible, or a bollard renumbered when the wharf was rebuilt, is a mooring plan made against the wrong bollard. 29 CFR 1917 has the terminal keep the wharf's load ratings posted and current, and the plate on the bollard is where that posting meets the person tying the ship up.",
    },
    {
      id: "edge-and-ladder", kind: "sequence", anyOrder: true,
      targets: ["cope-edge-line", "escape-ladder"],
      itemNames: { "cope-edge-line": "cope edge line and kerb", "escape-ladder": "emergency ladder to the water" },
      title: "Prove the cope edge marking and the emergency ladder",
      cue: "Check the edge line and kerb are visible along the cope, and the emergency ladder to the water is secured, clear and reaches the tide.",
      why: "The edge line is what a hustler driver and a lasher see at night on a wet apron, and a kerb that has been knocked away or a line worn to nothing is an edge nobody sees until a wheel is over it. The emergency ladder is the other half of the flotation vest: 29 CFR 1917 has ladders to the water at intervals along every wharf precisely so that someone who does go in has somewhere to climb out before the cold takes their hands, and a ladder that ends above the tide is a ladder that does not.",
    },
    {
      id: "structures-log", kind: "select", target: "structures-log",
      title: "Log the fender and bollard inspection",
      cue: "Record the cracked bracket, the pad thickness and replacement, the base crack found, the anchor tension, and clear the wharf back to the terminal.",
      why: "The wharf structures log is the record the terminal's engineer inspects the wharf against and the record an incident investigation would read first: the cracked bracket weld is a repair order, the base crack at the bollard is an engineering call on whether the bollard keeps its rating, and the anchor tension is the number the next inspection is measured against. Written now, on the apron, it is what the crew found; written later it is what the crew remembers.",
    },
    {
      id: "crew-checkin", kind: "select", target: "apron-radio",
      title: "Check in with the crane truck operator and the terminal",
      cue: "Call the terminal and the operator: the wharf is clear, what was found, and how the crew is after a shift on the cope with a storm through it.",
      why: "The terminal takes the apron back on the strength of this call, and the operator who held the pad on the sling for the bolting deserves to hear the wharf is logged clear rather than to infer it from the crew walking away. It is also the crew's own check-in: a shift at the edge with a ship's jib over the apron and a lightning call on the radio leaves things unsaid, and the ILWU's practice is to say them before the truck leaves — the member assistance line exists for that, and naming it costs nothing.",
    },
  ],

  interrupts: [
    {
      id: "ship-jib-over-apron",
      kind: "Ship's crane jib swinging over the apron",
      after: "chain-check", delay: 2, seconds: 14,
      alert: "The vessel at the next berth has started her own crane and the jib is swinging out over this apron — its hook is coming across above the cope.",
      cue: "Call the vessel on the apron radio and have the crane hold clear of the apron before anything continues at the edge.",
      target: "apron-radio",
      why: "A ship's crane working at the next berth can reach across an apron the ship's officer thinks is empty, and 29 CFR 1917 puts the clearance from workers on the crane's operator — who cannot see a crew at the cope below the quay's own crane rails. The call is made the instant the jib comes over, by the person who can see it, because a ship's hook over the apron is a suspended load over the crew, and the crew's only reach to the operator is the radio.",
      missNote: "The jib finished its swing above the cope with the hook passing over the crew at the fender, and the chain check went on underneath it as if the sky over the apron belonged to the terminal.",
      wrongNote: "The apron radio — the jib is the ship's to move, and the only thing on this apron that reaches the ship's crane operator is the radio.",
    },
    {
      id: "storm-cell-cope",
      kind: "Storm cell called on the terminal radio",
      after: "anchor-tension", delay: 2, seconds: 14,
      alert: "The terminal radio calls a storm cell with lightning crossing the bay toward the wharf — the gust front is already showing on the water.",
      cue: "Latch the gear box and get the loose gear off the cope now — nothing light stays at the edge in a gust front.",
      target: "gear-box-lid",
      why: "A gust front across a wharf edge takes whatever is loose on the cope into the water first and the crew's footing second, and a lightning cell over an apron with a crane truck's boom raised is the terminal's storm procedure firing for exactly this. The gear box is latched and the loose gear cleared before the cell arrives rather than as it does, because the crew has to be off the cope and clear of the boom when the first strike comes — and the front on the water is the only warning there is.",
      missNote: "The gust front hit the cope with the gear box open and the loose tools still at the edge; the lid went over, a tensioner hose went into the water, and the crew were still at the bollard when the first strike landed on the far crane.",
      wrongNote: "The gear box lid — the call is about clearing the cope before the front arrives, and the loose gear at the edge is the first thing the gust takes.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.6, PTF_ACCENT);

    // --------------------------------------------------------- apron and water
    const apron = box(g, 6.4, 0.1, 3.4, 0, 0.05, 0.6, 0xffffff, { rough: 0.92 });
    apron.material = texturedMat(
      surfaceTexture((cx, w, h) => pavingFace(cx, w, h, { tiles: 5, base: "#252c33", base2: "#1d242b", seam: "rgba(0,0,0,0.42)" }), { repeat: 6, px: 512 }),
      { rough: 0.9, metal: 0.03, color: 0xb9c2ca },
    );
    const water = box(g, 6.4, 0.02, 2.6, 0, 0.01, -2.4, 0xffffff, { rough: 0.15, metal: 0.4, cast: false });
    water.material = texturedMat(surfaceTexture((cx, w, h) => waterFace(cx, w, h), { repeat: 3, px: 512 }), { rough: 0.15, metal: 0.4, color: 0x7fa8b8 });
    // The cope: a kerb along the edge with the edge line painted on the apron.
    const kerb = box(g, 6.4, 0.22, 0.24, 0, 0.21, -1.08, 0x8b98a5, { rough: 0.85 });
    void kerb;
    const edgeLine = box(g, 6.4, 0.012, 0.12, 0, 0.111, -0.86, 0xf2c14b, { rough: 0.7, cast: false });
    holoTag(g, "edge line + kerb", -2.4, 0.5, -0.9, { css: "#2f8f9d", w: 0.34 });
    reg(hits, edgeLine, "cope-edge-line");
    const edgeHit = box(g, 1.6, 0.4, 0.3, 0.2, 0.5, -1.05, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "lean out without the vest?", 0.2, 0.85, -1.0, { css: "#d2312b", w: 0.5 });
    reg(hits, edgeHit, "edge-no-pfd");
    // Quay wall face below the cope.
    box(g, 6.4, 0.32, 0.1, 0, 0.16, -1.24, 0x6b7680, { rough: 0.9, cast: false });

    // --------------------------------------------------------------- fender
    const fender = group(g, -1.4, 0.1, -1.3);
    // Frame panel hanging off the wall, pads on its face, rubber element behind.
    const frame = box(fender, 1.5, 0.9, 0.08, 0, 0.1, -0.1, 0x3a4148, { rough: 0.55, metal: 0.5 });
    void frame;
    const pads = [];
    for (let i = 0; i < 3; i++) for (let j = 0; j < 2; j++) pads.push(box(fender, 0.42, 0.38, 0.06, -0.5 + i * 0.5, -0.1 + j * 0.42, -0.17, i === 1 && j === 1 ? 0xbfc3c4 : 0xe6e8e9, { rough: 0.6 }));
    const wornPad = pads[3];
    wornPad.scale.z = 0.4;
    for (let i = 0; i < 3; i++) cyl(fender, 0.18, 0.2, 0.3, -0.5 + i * 0.5, 0.05, 0.1, 0x14171a, { rough: 0.85, seg: 14 }).rotation.x = Math.PI / 2;
    const padSeat = torus(fender, 0.14, 0.008, 0.0, 0.32, -0.21, PTF_ACCENT, { emissive: PTF_ACCENT, ei: 1.6, rough: 0.4, cast: false, seg: 6, seg2: 24 });
    reg(hits, padSeat, "pad-seat");
    const padBolts = group(fender, 0.0, 0.32, -0.22);
    for (const [bx, by] of [[-0.15, -0.12], [0.15, -0.12], [-0.15, 0.12], [0.15, 0.12]]) cyl(padBolts, 0.018, 0.018, 0.03, bx, by, 0, 0xc0c6cc, { rough: 0.3, metal: 0.9, seg: 6 }).rotation.x = Math.PI / 2;
    padBolts.visible = false;
    holoTag(fender, "pad bolts — torque", 0.0, 0.74, -0.2, { css: "#2f8f9d", w: 0.38 });
    reg(hits, padBolts, "pad-bolt");
    // Chains up to brackets on the cope; the upper bracket weld is cracked.
    const chains = group(fender, 0, 0, 0);
    for (const cx of [-0.65, 0.65]) {
      hose(chains, [[cx, 0.5, -0.1], [cx * 0.9, 0.7, 0.05], [cx * 0.8, 0.85, 0.2]], 0.018, 0x5b6771, { steps: 8, rough: 0.6, metal: 0.5 });
      box(chains, 0.12, 0.08, 0.1, cx * 0.8, 0.88, 0.22, 0x3a4148, { rough: 0.55, metal: 0.5 });
    }
    hose(chains, [[-0.3, 0.3, -0.1], [0, 0.45, 0.1], [0.3, 0.3, -0.1]], 0.014, 0x5b6771, { steps: 8, rough: 0.6, metal: 0.5 });
    holoTag(fender, "chains — hold", 0, 1.12, 0.2, { css: "#2f8f9d", w: 0.3 });
    reg(hits, chains, "fender-chain");
    const crack = box(chains, 0.14, 0.015, 0.02, 0.52, 0.85, 0.28, 0x8a3a1a, { rough: 0.8, emissive: 0x4a1a08, ei: 0.4 });
    reg(hits, crack, "cracked-weld");
    const standHit = box(fender, 1.2, 0.05, 0.3, 0, 0.56, -0.05, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(fender, "step onto the panel?", -0.4, 0.66, -0.3, { css: "#d2312b", w: 0.44 });
    reg(hits, standHit, "stand-on-fender");

    // ---------------------------------------------------------------- bollard
    const bol = group(g, 1.5, 0.1, -0.55);
    const basePlate = box(bol, 0.7, 0.05, 0.7, 0, 0.025, 0, 0x3a4148, { rough: 0.6, metal: 0.5 });
    void basePlate;
    cyl(bol, 0.18, 0.22, 0.5, 0, 0.3, 0, 0x2b3138, { rough: 0.6, metal: 0.4, seg: 18 });
    cyl(bol, 0.24, 0.2, 0.12, 0, 0.6, 0, 0x2b3138, { rough: 0.6, metal: 0.4, seg: 18 });
    const anchors = [];
    for (const [ax, az] of [[-0.26, -0.26], [0.26, -0.26], [-0.26, 0.26], [0.26, 0.26]]) anchors.push(cyl(bol, 0.03, 0.03, 0.08, ax, 0.08, az, 0xc0c6cc, { rough: 0.3, metal: 0.9, seg: 8 }));
    const baseCrack = box(bol, 0.4, 0.012, 0.03, -0.1, 0.112, -0.45, 0x6b4a2a, { rough: 0.9 });
    baseCrack.rotation.y = -0.4;
    reg(hits, baseCrack, "bollard-crack");
    const plate = decal(bol, 0.22, 0.12, 0, 0.36, 0.23, paperFace("BOLLARD 14", ["RATED", "PER BERTH PLAN"], { bg: "#e8e0c8", band: "#2f8f9d" }), { px: 192 });
    holoTag(bol, "rated load plate", 0, 0.84, 0, { css: "#2f8f9d", w: 0.34 });
    reg(hits, plate, "rated-load-plate");
    const tensioner = group(bol, 0.26, 0.2, -0.26);
    cyl(tensioner, 0.07, 0.07, 0.16, 0, 0, 0, 0xe07a3f, { rough: 0.5, metal: 0.4, seg: 12 });
    cyl(tensioner, 0.02, 0.02, 0.1, 0, 0.12, 0, 0xc0c6cc, { rough: 0.3, metal: 0.9, seg: 8 });
    hose(bol, [[0.26, 0.24, -0.26], [0.6, 0.3, -0.5], [1.0, 0.2, -0.3]], 0.015, 0x1b1e23, { steps: 10, rough: 0.75 });
    holoTag(bol, "tensioner — hold", 0.26, 0.5, -0.26, { css: "#2f8f9d", w: 0.34 });
    reg(hits, tensioner, "bolt-tensioner");
    const pump = instrument(g, 2.6, 0.32, -0.9, { ry: -0.4, idle: "-- bar", color: 0x2f8f9d, w: 0.12, d: 0.14 });
    box(g, 0.34, 0.2, 0.3, 2.6, 0.2, -0.9, 0x2b3138, { rough: 0.6, metal: 0.4 });
    void anchors;

    // ------------------------------------------------------ crane truck
    const truck = group(g, 1.4, 0.1, 1.7, 0.1);
    box(truck, 1.0, 0.3, 2.6, 0, 0.55, 0, 0x2b3138, { rough: 0.6, metal: 0.4 });
    box(truck, 0.96, 0.7, 0.8, 0, 1.05, -1.0, 0xe07a3f, { rough: 0.5, metal: 0.3 });
    box(truck, 0.8, 0.3, 0.02, 0, 1.15, -1.41, 0x274a5f, { rough: 0.3, metal: 0.2, cast: false });
    for (const [wx, wz] of [[-0.5, -0.8], [0.5, -0.8], [-0.5, 0.7], [0.5, 0.7]]) cyl(truck, 0.26, 0.26, 0.22, wx, 0.26, wz, 0x14171a, { rough: 0.85, seg: 14 }).rotation.z = Math.PI / 2;
    for (const sx of [-1, 1]) {
      box(truck, 0.5, 0.08, 0.1, sx * 0.7, 0.5, 0.3, 0x8a949d, { rough: 0.45, metal: 0.7 });
      cyl(truck, 0.04, 0.04, 0.45, sx * 0.92, 0.25, 0.3, 0x8a949d, { rough: 0.45, metal: 0.7, seg: 8 });
      box(truck, 0.26, 0.04, 0.26, sx * 0.92, 0.02, 0.3, 0x3a4148, { rough: 0.7, metal: 0.4 });
    }
    const noChock = box(truck, 0.3, 0.2, 0.3, 0.5, 0.15, 0.95, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(truck, "outriggers down, no chocks?", 0.6, 0.62, 1.1, { css: "#d2312b", w: 0.56 });
    reg(hits, noChock, "truck-unchocked");
    const turret = group(truck, 0, 0.75, 0.4);
    cyl(turret, 0.3, 0.3, 0.2, 0, 0, 0, 0xe07a3f, { rough: 0.5, metal: 0.3, seg: 16 });
    const boom = group(turret, 0, 0.15, 0);
    boom.rotation.y = -1.1; boom.rotation.z = 0.55;
    box(boom, 2.4, 0.16, 0.16, 1.2, 0, 0, 0xe07a3f, { rough: 0.5, metal: 0.3 });
    box(boom, 1.4, 0.12, 0.12, 2.9, 0, 0, 0xd8dde2, { rough: 0.5, metal: 0.3 });
    cyl(boom, 0.012, 0.012, 1.2, 3.55, -0.6, 0, 0x8a949d, { rough: 0.4, metal: 0.8, seg: 6 });
    // The pad on the sling under the boom tip, and the hazard of being under it.
    const newPad = group(g, -0.1, 0.1, 0.9);
    box(newPad, 0.42, 0.38, 0.08, 0, 0.9, 0, 0xffffff, { rough: 0.6 });
    box(newPad, 0.02, 0.5, 0.02, -0.18, 1.35, 0, 0x5b6771, { rough: 0.6, metal: 0.5 });
    box(newPad, 0.02, 0.5, 0.02, 0.18, 1.35, 0, 0x5b6771, { rough: 0.6, metal: 0.5 });
    holoTag(newPad, "new pad — on the sling", 0, 1.7, 0, { css: "#2f8f9d", w: 0.44 });
    reg(hits, newPad, "new-pad");
    const underBoom = box(g, 0.8, 0.05, 0.8, -0.1, 0.14, 0.9, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "under the slung pad?", -0.1, 0.5, 0.9, { css: "#d2312b", w: 0.44 });
    reg(hits, underBoom, "under-truck-boom");

    // ------------------------------------------------ ship's jib next berth
    const jib = group(g, -7.0, 4.2, -3.0);
    box(jib, 6.0, 0.35, 0.35, 0, 0, 0, 0xe8b02e, { rough: 0.6, metal: 0.4, cast: false });
    box(jib, 0.6, 0.6, 0.6, 3.0, -0.5, 0, 0x3a4148, { rough: 0.55, metal: 0.5, cast: false });
    cyl(jib, 0.012, 0.012, 1.6, 3.0, -1.4, 0, 0x8a949d, { rough: 0.4, metal: 0.8, seg: 6 });
    jib.rotation.y = 1.1;
    jib.visible = false;
    // Storm on the horizon over the water.
    const cloud = box(g, 14, 3.0, 2.0, 0, 6.5, -14, 0x1c232b, { rough: 1.0, cast: false, receive: false });
    cloud.visible = false;
    const lightning = box(g, 0.08, 4.0, 0.08, 3.0, 4.0, -13, 0xe6f4ff, { emissive: 0xe6f4ff, ei: 3.0, rough: 0.3, cast: false });
    lightning.visible = false;

    // ------------------------------------------- gear box, ladder, anchors, PPE
    const gearBox = group(g, -2.4, 0.1, 0.2);
    box(gearBox, 0.7, 0.4, 0.45, 0, 0.2, 0, 0x2f4f6f, { rough: 0.55, metal: 0.3 });
    const lid = box(gearBox, 0.72, 0.04, 0.47, 0, 0.42, 0, 0x3f6f8f, { rough: 0.5, metal: 0.3 });
    lid.rotation.x = -1.2; lid.position.set(0, 0.6, -0.22);
    holoTag(gearBox, "gear box lid", 0, 0.9, 0, { css: "#2f8f9d", w: 0.28 });
    reg(hits, lid, "gear-box-lid");
    box(gearBox, 0.2, 0.1, 0.1, 0.1, 0.44, 0.05, 0xe07a3f, { rough: 0.6 });
    box(gearBox, 0.16, 0.06, 0.16, -0.2, 0.42, 0.0, 0x8a949d, { rough: 0.4, metal: 0.7 });
    const ladder = group(g, 2.6, 0.1, -1.1);
    for (const lx of [-0.15, 0.15]) cyl(ladder, 0.02, 0.02, 0.6, lx, 0.1, 0, 0xe8b02e, { rough: 0.5, metal: 0.5, seg: 8 });
    for (let i = 0; i < 3; i++) box(ladder, 0.3, 0.02, 0.03, 0, -0.1 + i * 0.18, 0, 0xe8b02e, { rough: 0.5, metal: 0.5 });
    box(ladder, 0.4, 0.04, 0.2, 0, 0.4, 0.12, 0x3a4148, { rough: 0.6, metal: 0.5 });
    holoTag(ladder, "emergency ladder", 0, 0.7, 0.2, { css: "#2f8f9d", w: 0.36 });
    reg(hits, ladder, "escape-ladder");
    const anchor = group(g, -0.6, 0.1, -0.6);
    box(anchor, 0.16, 0.06, 0.16, 0, 0.03, 0, 0x3a4148, { rough: 0.6, metal: 0.5 });
    torus(anchor, 0.05, 0.012, 0, 0.1, 0, 0xc0c6cc, { rough: 0.3, metal: 0.9, seg: 6, seg2: 16 });
    const lanyard = hose(anchor, [[0, 0.1, 0], [0.3, 0.5, 0.5], [0.6, 1.0, 0.9]], 0.012, 0xe07a3f, { steps: 10, rough: 0.7 });
    lanyard.visible = false;
    holoTag(anchor, "cope anchor — clip", 0, 0.34, 0, { css: "#2f8f9d", w: 0.38 });
    reg(hits, anchor, "edge-lanyard");
    const rack = group(g, -2.6, 0.1, 1.6, 0.4);
    cyl(rack, 0.02, 0.02, 1.4, 0, 0.7, 0, 0x8a949d, { rough: 0.45, metal: 0.7, seg: 8 });
    box(rack, 0.5, 0.03, 0.03, 0, 1.3, 0, 0x8a949d, { rough: 0.45, metal: 0.7 });
    const vest = group(rack, 0.14, 1.05, 0);
    box(vest, 0.26, 0.4, 0.1, 0, 0, 0, 0xe07a3f, { rough: 0.8 });
    box(vest, 0.26, 0.05, 0.11, 0, 0.05, 0, 0xdfe8ee, { rough: 0.6, emissive: 0xdfe8ee, ei: 0.3 });
    holoTag(rack, "flotation vest", 0.14, 1.5, 0, { css: "#2f8f9d", w: 0.32 });
    reg(hits, vest, "pfd-vest");

    // ------------------------------------------------------- chest and tools
    const chest = toolChest(g, 0.9, 2.3, { ry: 3.2, color: 0x2f4f6f });
    const gauge = instrument(chest, -0.1, 0.79, 0.02, { ry: 0.2, idle: "-- mm", color: 0x2f8f9d, w: 0.1, d: 0.16 });
    holoTag(gauge, "pad depth gauge", 0, 0.15, 0, { css: "#2f8f9d", w: 0.34 });
    reg(hits, gauge, "pad-gauge");
    const radio = instrument(chest, 0.16, 0.79, 0.04, { ry: 0.1, idle: "CH 9 · APRON", color: 0x2f8f9d, w: 0.1, d: 0.16 });
    holoTag(radio, "apron radio", 0, 0.15, 0, { css: "#2f8f9d", w: 0.28 });
    reg(hits, radio, "apron-radio");

    // ------------------------------------------------------------ paperwork
    const board = holoPanel(g, 0.95, 0.62, -2.1, 1.25, 2.3, (cx, w, h) => {
      cx.fillStyle = "#08161e"; cx.fillRect(0, 0, w, h); cx.fillStyle = "#2f8f9d"; cx.fillRect(0, 0, w, 6);
      cx.font = `600 ${Math.round(h * 0.1)}px 'Barlow Condensed', Arial, sans-serif`; cx.textAlign = "left"; cx.textBaseline = "middle";
      cx.fillStyle = "#cfeef2"; cx.fillText("BERTH 3 — WINDOW & SCHEDULE", w * 0.06, h * 0.13);
      cx.font = `${Math.round(h * 0.072)}px Arial, sans-serif`; cx.fillStyle = "#eaf6fb";
      ["No vessel due inside the window · crane 3 pinned", "Apron released to wharf structures crew", "Vest + lanyard before the cope, every person",
       "Fender 14: pad thickness against the plate minimum", "Bollard 14: base inspected before anchors tensioned", "Storm procedure: cope cleared on the call"]
        .forEach((l, i) => cx.fillText(l, w * 0.06, h * (0.28 + i * 0.11)));
    }, { ry: 2.6, accent: PTF_ACCENT });
    reg(hits, board, "berth-schedule-board");
    const logBoard = holoPanel(g, 0.6, 0.42, 2.6, 1.25, 0.4, (cx, w, h) => {
      cx.fillStyle = "#08161e"; cx.fillRect(0, 0, w, h); cx.fillStyle = "#2f8f9d"; cx.fillRect(0, 0, w, 6);
      cx.font = `600 ${Math.round(h * 0.12)}px 'Barlow Condensed', Arial, sans-serif`; cx.textAlign = "left"; cx.textBaseline = "middle";
      cx.fillStyle = "#cfeef2"; cx.fillText("WHARF STRUCTURES LOG", w * 0.06, h * 0.16);
      cx.font = `${Math.round(h * 0.09)}px Arial, sans-serif`; cx.fillStyle = "#eaf6fb";
      ["Fender 14: —", "Bollard 14: —", "Apron: RELEASED TO CREW"].forEach((l, i) => cx.fillText(l, w * 0.06, h * (0.4 + i * 0.18)));
    }, { ry: -1.1, accent: PTF_ACCENT });
    reg(hits, logBoard, "structures-log");

    // ---------------------------------------------------------------- crew
    const structures = standingFigure(g, -1.4, 0.7, { ry: 2.8, cloth: 0x1f3a52, vest: 0xe07a3f, helmet: 0xe8b02e, gloves: true });
    holoTag(structures, "structures crew", 0, 1.9, 0, { css: "#2f8f9d", w: 0.32 });
    const operator = standingFigure(g, 2.8, 2.5, { ry: -2.4, cloth: 0x2b3138, vest: 0xfcee21, helmet: 0x1b1e22 });
    holoTag(operator, "crane truck operator", 0, 1.9, 0, { css: "#2f8f9d", w: 0.4 });
    cone(g, -0.6, 2.5); cone(g, 2.2, -0.2);
    barrierPanel(g, -1.6, 2.5, { color: 0xf2c14b, ry: 0 });

    const jibHome = jib.position.clone();
    const waterTex = water.material.map;
    let stormOn = false;

    return {
      hits,
      spawnLook: new THREE.Vector3(-0.2, 0.7, -1.2),
      onStep() {},
      onStepComplete(step) {
        if (step.id === "edge-ppe") lanyard.visible = true;
        if (step.id === "frame-walk") crack.visible = false;
        if (step.id === "fit-pad") { newPad.visible = false; wornPad.scale.z = 1; wornPad.material = mat(0xffffff, { rough: 0.6 }); padBolts.visible = true; }
        if (step.id === "pad-bolts") boom.rotation.z = 0.9;
        if (step.id === "bollard-base") baseCrack.material = mat(0x3a4148, { rough: 0.9 });
        if (step.id === "anchor-tension") repaint(pump.userData.screen, signFace("TENSIONED", { bg: "#0d1c24", accent: "#59c97b", fg: "#bfeaf7", scale: 0.5 }));
        if (step.id === "structures-log") {
          repaint(logBoard.userData.face, (cx, w, h) => {
            cx.fillStyle = "#08161e"; cx.fillRect(0, 0, w, h); cx.fillStyle = "#59c97b"; cx.fillRect(0, 0, w, 6);
            cx.font = `600 ${Math.round(h * 0.12)}px 'Barlow Condensed', Arial, sans-serif`; cx.textAlign = "left"; cx.textBaseline = "middle";
            cx.fillStyle = "#cfeef2"; cx.fillText("WHARF STRUCTURES LOG", w * 0.06, h * 0.16);
            cx.font = `${Math.round(h * 0.09)}px Arial, sans-serif`; cx.fillStyle = "#bfeaf7";
            ["Fender 14: bracket weld cracked — repair order · pad replaced", "Bollard 14: base crack — engineer's call · anchors tensioned", "Apron: CLEARED TO TERMINAL"].forEach((l, i) => cx.fillText(l, w * 0.06, h * (0.4 + i * 0.18)));
          });
        }
        if (step.id === "crew-checkin") repaint(radio.userData.screen, signFace("APRON CLEAR", { bg: "#0d1c24", accent: "#59c97b", fg: "#bfeaf7", scale: 0.5 }));
      },
      onHazard() {},
      onInterrupt(it) {
        if (it.id === "ship-jib-over-apron") { jib.visible = true; jib.position.set(-2.0, 4.2, -0.6); jib.rotation.y = 0.15; }
        if (it.id === "storm-cell-cope") { stormOn = true; cloud.visible = true; lightning.visible = true; }
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "ship-jib-over-apron") { jib.visible = false; jib.position.copy(jibHome); jib.rotation.y = 1.1; }
        if (it.id === "storm-cell-cope") { lid.rotation.x = 0; lid.position.set(0, 0.42, 0); lightning.visible = false; }
      },
      animate(t, dt, session) {
        const step = session?.step;
        if (waterTex?.offset) { waterTex.offset.x = t * 0.006; waterTex.offset.y = t * 0.004; }
        if (session?.turn && step?.id === "pad-bolts") padBolts.rotation.z = session.turn.amount * Math.PI * 2;
        const gg = session?.gauge;
        if (gg && !gg.committed && step?.id === "pad-thickness") repaint(gauge.userData.screen, signFace(`${Math.round(gg.t * 60)} mm`, { bg: "#0d1c24", accent: gg.t >= 0.42 && gg.t <= 0.6 ? "#59c97b" : "#f2ae14", fg: "#bfeaf7", scale: 0.6 }));
        if (step?.id === "anchor-tension" && session.holding) {
          const v = session.track.v;
          repaint(pump.userData.screen, signFace(`${Math.round(v * 700)} bar`, { bg: "#0d1c24", accent: v >= 0.4 && v <= 0.6 ? "#59c97b" : "#f2ae14", fg: "#bfeaf7", scale: 0.6 }));
        }
        if (stormOn && lightning.visible) lightning.visible = Math.sin(t * 9) > 0.6;
        if (stormOn && !lightning.visible && Math.sin(t * 9) > 0.6 && cloud.visible && session?.activeInterrupt) lightning.visible = true;
        void dt; void CITY; void ball;
      },
    };
  },
};
