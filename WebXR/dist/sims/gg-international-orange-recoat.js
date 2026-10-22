import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import { box, cyl, ball, torus, hose, group, decal, repaint, signFace, paperFace, mat } from "../../../shared/kit.js";
import {
  CITY, stationPad, holoPanel, holoTag, toolChest, instrument, cone,
  standingFigure, reg, surfaceTexture, texturedMat, deckPlateFace, paintedSteelFace,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ International Orange Recoat VR — Construction & Structural
// Trades, the Bay Area bridge pack, on the golden-gate-deck district.
//
// The bridge opened in 1937 and is painted International Orange; keeping it
// that colour is coating work done to a specification, not a touch-up. A
// blasted patch of railing steel is recoated: the specification read, the
// weather taken against the dew point, the surface and its profile checked,
// a two-part coating mixed, edges and rivet heads striped by brush, the coat
// sprayed at a steady wet film, the airless pump relieved before anyone goes
// near its tip, and the batch, the film and the weather logged. The railing
// section here is the station's own mock-up in the closure.

const GGO_ACCENT = 0xe8541e;

export const SIM_GG_INTERNATIONAL_ORANGE_RECOAT = {
  id: "gg-international-orange-recoat",
  index: "230",
  domain: "Construction",
  trade: "IUPAT bridge painters — coating crew on the paint programme, trained through the Finishing Trades Institute (FTI)",
  category: "Construction & Structural Trades",
  district: "golden-gate-deck",
  certification: "IUPAT and the Finishing Trades Institute industrial and bridge painter training; the owner's coating specification, with the blasted surface prepared to SSPC-SP 10 and an SSPC-QP 1 qualified contractor for field application; 29 CFR 1910.134 respiratory protection for solvent-borne coatings; 29 CFR 1910.1200 hazard communication for the coating's safety data sheets; OSHA 29 CFR 1926.502 and ANSI/ASSP Z359 for tie-off at the railing; the coating maker's product data for mixing, pot life and recoat windows",
  name: "International Orange Recoat",
  title: simTitle("International Orange Recoat"),
  tagline: "A blasted patch of railing brought back to International Orange: the specification read, tied off with the right cartridges in, the steel's margin over the dew point taken, the prep checked and the profile read while the fog comes in, the coating mixed, edges and rivets striped, the coat sprayed at a steady film through a gust, the film combed, the pump relieved and locked, the wet paint signed and the batch logged",
  accent: GGO_ACCENT,
  accentCss: "#e8541e",
  parSeconds: 320,
  footprint: 2.8,
  badge: { id: "on-spec-orange", name: "On-Spec Orange", note: "A recoat applied inside the weather window, at the specified film, with the airless pump relieved before its tip was touched" },

  supportLine: "the IUPAT member assistance programme through your district council, and the crew's peer-support contact",

  game: system({
    name: "Paint Programme",
    currency: "COAT",
    ranks: ["Paint Hand", "Brush Painter", "Spray Painter", "Coating Lead", "Paint Programme Certified"],
    badges: [
      { id: "inside-the-window", name: "Inside The Window", note: "Dew point margin committed inside the band first time", test: AWARD.stepClean("dew-point") },
      { id: "even-film", name: "Even Film", note: "Spray held at a steady distance the whole pass", test: AWARD.precise(0.72) },
      { id: "respect-the-tip", name: "Respect The Tip", note: "Never a hand at the tip, never an open rag pile, never over the rail unclipped", test: AWARD.safe },
    ],
    challenges: [
      { id: "clean-coat", name: "Clean Coat", note: "No corrections from the specification to the log", test: AWARD.clean },
      { id: "no-runs", name: "No Runs", note: "The spray pass never dropped out of band", test: AWARD.unbroken },
      { id: "coat-inside-par", name: "Coat Inside Par", note: "Logged inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "airless-tip-hand": "You put a finger up to the airless gun's tip to clear a blockage with the pump still pressurised. An airless sprayer drives paint through that tip at a pressure that goes straight through skin, and an injection injury looks like a small cut while the coating spreads through the hand under it; it is a surgical emergency every time. The tip is cleared only after the pressure has been relieved and the trigger locked, and with the tip guard on.",
    "untethered-paint-pot": "You hung the paint pot on the outside of the railing with nothing holding it but its hook. A full pot hung over the railing is a weight over the strait on a hook that a gust or an elbow can lift, and paint dropped from a bridge goes into the water as surely as a tool does. Pots, brushes and rollers at the railing ride on tethers.",
    "solvent-rags-open": "You dropped the solvent-soaked rag onto the open pile beside the cart. Rags soaked with solvent and coating give off vapour that can find an ignition source, and rags soaked with some coatings heat themselves as they cure until they catch fire on their own. They go into the closed, labelled rag can, and the can leaves the deck at the end of the shift.",
    "lean-over-rail-unclipped": "You leaned out over the railing to reach its outside face with your lanyard still hanging from your harness. The outside face of a bridge railing is over the edge of the deck, and a painter concentrating on a brush stroke is a painter not holding on. The lanyard goes onto the rated anchor before any reach past the rail.",
  },

  lateNotes: {
    "spray-gun": "The coat is sprayed once the edges and rivet heads have been striped by brush — the brush coat goes first.",
    "trigger-lock": "The trigger lock goes on once the pump's pressure has been relieved through the gun — relieve first.",
    "paint-log": "The recoat is logged once the pump is relieved and the wet paint is signed.",
  },

  steps: [
    {
      id: "spec", kind: "select", target: "coating-spec",
      title: "Read the coating specification for the recoat",
      cue: "Read the specification: the surface preparation standard, the coating system and its colour, the film thickness for each coat, the weather limits and the recoat window.",
      why: "The colour is the part of the job everyone sees, but the specification is what keeps the steel under it: the surface preparation standard the coating was tested over, the film thickness each coat has to reach, and the weather it can be applied in. A coat that is the right orange over the wrong preparation or outside its weather window fails early, and the failure shows as rust bleeding through the colour.",
    },
    {
      id: "ready", kind: "sequence", anyOrder: true,
      targets: ["painter-anchor", "respirator-cartridge"],
      itemNames: { "painter-anchor": "lanyard on the railing-side anchor", "respirator-cartridge": "organic vapour cartridges in the respirator" },
      title: "Tie off at the railing and fit the right cartridges",
      cue: "Clip your lanyard to the rated anchor beside the railing, and fit organic vapour cartridges to your respirator for the solvent-borne coating.",
      why: "Painting a railing means reaching over it, so the lanyard is on a rated anchor before the first reach. The respirator needs cartridges matched to the coating's solvents under 29 CFR 1910.134, which is why the safety data sheet names the vapour: a particulate filter that was right for blasting does nothing against solvent vapour, and a painter wearing the wrong one is breathing the coating while believing they are protected.",
    },
    {
      id: "dew-point", kind: "gauge", target: "dewpoint-meter",
      title: "Take the steel's margin over the dew point",
      cue: "Read the surface temperature against the dew point on the meter and commit when the margin sits inside the specification's band.",
      why: "Steel colder than a few degrees above the dew point collects a film of moisture too thin to see, and a coating sprayed onto it is sprayed onto water: it loses adhesion from the first day. On a bridge in the marine layer the margin moves by the hour, so it is measured on the steel itself and recorded, not judged by whether the air feels damp.",
      gauge: {
        label: "STEEL OVER DEW POINT · MARGIN", speed: 0.64, green: [0.5, 0.78],
        readout: (t) => (t < 0.5 ? "margin too small — do not coat" : "margin inside the specification"),
        missNote: "That margin is too small — the steel is close enough to the dew point to be carrying moisture. Wait for the margin to open, or do not coat today.",
      },
    },
    {
      id: "prep-check", kind: "find", noHint: true,
      targets: ["rust-bloom", "dust-on-steel", "sharp-edge"],
      itemNames: {
        "rust-bloom": "flash rust blooming on the blasted steel",
        "dust-on-steel": "blast dust left on the surface",
        "sharp-edge": "a sharp flange edge that needs striping",
      },
      itemNotes: {
        "rust-bloom": "A faint orange bloom has come up on the blasted steel since it was cleaned — the steel has started to flash rust in the damp air. It is re-cleaned to the specified preparation before any coat goes on it.",
        "dust-on-steel": "A tape pressed onto the steel comes away grey with blast dust. Coating over dust is coating over a layer that is not stuck to anything; the surface is blown down and vacuumed first.",
        "sharp-edge": "The flange edge is sharp, and a spray coat pulls thin over a sharp edge as it dries. Edges and rivet heads get a brush stripe coat before the spray so the film there reaches its thickness.",
      },
      title: "Check the prepared surface before any coating",
      cue: "Look over the blasted patch and find what would make the coating fail: rust that has come back, dust left on the steel, edges that will pull thin.",
      why: "The surface preparation is judged against the standard the specification names — here SSPC-SP 10 near-white blast — and it has to still meet that standard at the moment the coating goes on, not only when the blasting finished. Flash rust, dust and sharp edges are the three things that undo a good blast between the blasting and the brush, and each is cheaper to fix now than as a blister later.",
    },
    {
      id: "profile", kind: "hold", target: "replica-tape", seconds: 4,
      title: "Burnish the replica tape to read the surface profile",
      cue: "Press the replica tape onto the blasted steel and hold the burnishing tool on it until the whole window is burnished.",
      why: "The profile is the depth of the anchor pattern the blast cut into the steel, and the specification sets it because a coating grips by keying into it: too shallow and the coat has nothing to hold, too deep and the peaks stick up through a thin film and rust. Replica tape takes an impression of the profile that a gauge reads, and it only reads true if it is burnished fully onto the steel.",
      holdBreakNote: "The burnishing stopped before the whole window was pressed onto the steel — the tape will read shallow. Burnish it again, fully.",
    },
    {
      id: "mix", kind: "turn", target: "mixer-paddle",
      title: "Mix the two-part coating",
      cue: "Add the hardener to the base in the specified ratio and run the mixer until the colour and the body are even, top to bottom.",
      why: "A two-part coating cures by the reaction between its parts, and the reaction only goes right if the ratio is the maker's and the mix is complete: streaks of unmixed base stay soft for weeks, and pockets of hardener cure brittle. The mixer runs until the International Orange is one colour from the bottom of the pail to the top, and the pot life starts counting from the moment the parts meet.",
      turn: { turns: 1.2, label: "MIXER · TWO-PART COATING", readout: (t) => (t < 0.4 ? "streaky" : t < 0.95 ? "blending" : "one colour, top to bottom") },
    },
    {
      id: "stripe", kind: "drag", target: "stripe-brush",
      title: "Stripe coat the edges and rivet heads by brush",
      cue: "Carry the loaded brush to the rivet row and the flange edge and work a stripe coat into them before the spray.",
      why: "Sprayed coating pulls away from edges, corners and the round heads of rivets as it flows and dries, so those are the first places a coating system thins and the first places rust starts. A brush stripe coat works the coating into them by hand before the spray coat goes over the whole surface, and it is the step coating inspectors look for on riveted steel.",
      drag: { to: "rivet-row", radius: 0.45, missNote: "Not on the rivet row — the stripe coat goes onto the rivet heads and the flange edge, where spray pulls thin." },
    },
    {
      id: "spray", kind: "track", target: "spray-gun", seconds: 7,
      title: "Spray the coat at a steady distance and speed",
      cue: "Spray the patch with the gun square to the steel, holding a steady distance and pace so the wet film builds evenly.",
      why: "The film thickness the specification asks for is built by the painter's distance and pace: too close or too slow and the coat sags and runs, too far or too fast and it goes on dry and thin with the solvent flashing off before it reaches the steel. Held square and steady, the pass lays an even wet film that dries to the thickness the coating was tested at.",
      track: {
        start: 0.1, green: [0.42, 0.62], rise: 0.56, fall: 0.46, drift: 0.12, label: "SPRAY · DISTANCE AND PACE",
        readout: (v) => (v < 0.42 ? "too far — dry, thin film" : v > 0.62 ? "too close — sagging" : "even wet film"),
      },
      holdBreakNote: "The pass left the band — that stretch is either sagging or dry. Go back over it at the right distance.",
    },
    {
      id: "wft", kind: "select", target: "wft-comb",
      title: "Check the wet film with the comb",
      cue: "Press the wet-film comb into the fresh coat, square, and read the last tooth wetted against the specification's wet film figure.",
      why: "The dry film thickness is what the specification is about, but it cannot be measured until the coat has cured, and by then it is too late to add more without a recoat. The wet-film comb read straight after the pass lets the painter correct the next pass while the coat is still open, and the reading goes on the log with the batch number.",
    },
    {
      id: "relieve", kind: "sequence",
      targets: ["pump-relief", "trigger-lock"],
      itemNames: { "pump-relief": "pump off and pressure relieved through the gun into the pail", "trigger-lock": "trigger lock on before the tip is handled" },
      title: "Relieve the airless pump, then lock the trigger",
      cue: "Follow the sprayer's pressure-relief procedure: pump off, pressure relieved through the gun into a grounded pail, then the trigger lock on before the tip is touched.",
      why: "An airless sprayer holds its pressure in the hose and the gun after the pump stops, and every injection injury in the trade starts with someone believing a stopped pump meant a safe gun. The maker's pressure-relief procedure bleeds that pressure off through the gun into a pail, and the trigger lock goes on after it so nothing can fire while the tip is being cleaned or changed.",
      outOfOrderNote: "Relieve the pressure first — a locked trigger on a pressurised gun is still a pressurised gun.",
    },
    {
      id: "sign", kind: "drag", target: "wet-paint-sign",
      title: "Sign the wet coating at the railing",
      cue: "Carry the wet paint sign to the stanchion beside the recoated patch and hang it facing the walkway.",
      why: "The recoat is soft for hours, and a hand on it or a bag dragged across it leaves a defect the next inspection has to find and the next crew has to repair. The sign also tells the next crew what was coated and when, so nobody sands or recoats the patch outside its recoat window.",
      drag: { to: "sign-post", radius: 0.45, missNote: "Not on the stanchion — the sign hangs beside the patch, facing the walkway, where people reaching for the railing will see it." },
    },
    {
      id: "paint-log", kind: "select", target: "paint-log",
      title: "Log the batch, the film and the weather",
      cue: "Record the coating batch numbers, the mix time, the dew point margin, the profile, the wet film readings and the time the coat went on.",
      why: "The paint log is how a coating failure is traced years later: which batch, mixed when, applied over what profile, in what weather, at what film. Without it, rust bleeding through a recoat is a mystery; with it, it is a cause. It is also the record the owner's coating inspector signs off against the specification.",
    },
    {
      id: "crew-checkin", kind: "select", target: "paint-radio",
      title: "Check in with the coating lead and the crew",
      cue: "Call the coating lead and the crew on the paint channel: patch coated and signed, pump relieved, log done — and how everyone is.",
      why: "The coating lead decides the next coat's time from the log and needs to hear the patch is finished and signed. A shift spraying at the railing in fog and gusts, in a respirator, is tiring in a way people underrate, and the crew checks in before breaking down the cart; the IUPAT member assistance line is there for anything that lasts past the shift.",
    },
  ],

  interrupts: [
    {
      id: "fog-on-the-steel",
      kind: "Fog bank rolling in",
      after: "profile", delay: 2, seconds: 12,
      alert: "A fog bank rolls in over the railing off the strait — the steel beads with moisture and the far light standards disappear.",
      cue: "Close the lid on the mixed coating and cover the pails — nothing gets coated or opened while the fog is on the steel.",
      target: "pail-lid",
      why: "Fog puts water straight onto the steel, and the dew point margin taken ten minutes ago no longer means anything. The coating work stops, and the first thing that happens is the lid goes on the mixed coating so the fog does not get into it either; the recoat waits until the steel is dry and the margin is back inside the specification, measured again rather than assumed.",
      missNote: "The work went on with the fog beading on the steel and the mixed pail standing open. Anything coated in that window was coated over water, and the pail took on moisture that will show as a defect wherever it is used.",
      wrongNote: "The pail lid — cover the mixed coating first. Nothing gets opened or coated while the fog is on the steel.",
    },
    {
      id: "gust-on-the-spray",
      kind: "Gust past the work-stop limit",
      after: "spray", delay: 3, seconds: 12,
      alert: "A gust comes over the railing and the overspray lifts off the steel in an orange cloud, drifting across the closure toward the open lanes.",
      cue: "Stop the airless pump — no spraying in a wind that carries the coating off the steel.",
      target: "airless-pump-stop",
      why: "In a gust past the limit, overspray does not settle on the steel; it drifts across the deck onto vehicles in the open lanes, onto the crew, and over the railing toward the water. The pump stops, not just the trigger, because a painter holding a live gun in a gust is holding a pressurised tool while trying to keep their footing, and spraying resumes only when the wind is back under the limit.",
      missNote: "Spraying went on through the gust, and the coating drifted off the steel across the open lanes and toward the water, with a live gun in the hand of a painter bracing against the wind.",
      wrongNote: "The pump stop — stop making overspray first, and take the pressure off the gun while the wind is up.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.8, GGO_ACCENT);

    const matTex = surfaceTexture((cx, w, h) => deckPlateFace(cx, w, h, { base: "#3a4047", base2: "#30363c" }), { repeat: 4, px: 256 });
    const workMat = box(g, 5.8, 0.02, 4.4, 0, 0.01, 0.1, 0x3a4047, { rough: 0.8, metal: 0.3, cast: false });
    workMat.material = texturedMat(matTex, { rough: 0.8, metal: 0.3, color: 0x9aa2aa });
    const dropCloth = box(g, 3.6, 0.012, 0.9, 0, 0.026, -0.95, 0xd8d2c4, { rough: 0.95, cast: false });
    void dropCloth;

    // ------------------------------------------------ the railing section in International Orange
    const steelTex = surfaceTexture((cx, w, h) => paintedSteelFace(cx, w, h, { cols: 6, rows: 1 }), { repeat: 1, px: 512 });
    const orange = texturedMat(steelTex, { rough: 0.6, metal: 0.3 });
    const rail = group(g, 0, 0, -1.35);
    const top = box(rail, 3.4, 0.14, 0.18, 0, 1.3, 0, 0xc8461d, { rough: 0.6, metal: 0.3 });
    top.material = orange;
    const mid = box(rail, 3.4, 0.1, 0.12, 0, 0.35, 0, 0xc8461d, { rough: 0.6, metal: 0.3 });
    mid.material = orange;
    const balusters = [];
    for (let i = 0; i < 11; i++) balusters.push(box(rail, 0.04, 0.9, 0.04, -1.6 + i * 0.32, 0.82, 0, 0xc8461d, { rough: 0.6, metal: 0.3 }));
    for (const px of [-1.7, 1.7]) box(rail, 0.16, 1.45, 0.16, px, 0.72, 0, 0xb63f19, { rough: 0.6, metal: 0.3 });
    // The blasted patch: grey near-white steel over part of the rail and a flange plate below it.
    const patch = box(rail, 1.1, 0.16, 0.2, 0.25, 1.3, 0.005, 0xa7adb3, { rough: 0.55, metal: 0.6 });
    const flange = box(rail, 1.2, 0.5, 0.04, 0.25, 0.8, 0.12, 0xa7adb3, { rough: 0.55, metal: 0.6 });
    const rivets = [];
    for (let i = 0; i < 6; i++) rivets.push(ball(rail, 0.024, -0.2 + i * 0.18, 0.64, 0.145, 0x9aa0a6, { rough: 0.5, metal: 0.6, seg: 8, seg2: 6 }));
    const rivetRow = box(rail, 1.1, 0.08, 0.04, 0.25, 0.64, 0.16, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(rail, "rivet row — stripe here", 0.25, 0.5, 0.2, { css: "#e8541e", w: 0.42 });
    reg(hits, rivetRow, "rivet-row");
    const bloom = box(rail, 0.24, 0.12, 0.006, 0.55, 0.9, 0.143, 0xb8743a, { rough: 0.9 });
    reg(hits, bloom, "rust-bloom");
    const dust = box(rail, 0.18, 0.1, 0.006, -0.05, 0.95, 0.143, 0x6b6e70, { rough: 0.95 });
    reg(hits, dust, "dust-on-steel");
    const edge = box(rail, 1.2, 0.02, 0.05, 0.25, 1.055, 0.12, 0xd8dde2, { rough: 0.3, metal: 0.8 });
    reg(hits, edge, "sharp-edge");
    const tape = group(rail, 0.2, 1.18, 0.14);
    box(tape, 0.08, 0.05, 0.006, 0, 0, 0, 0xf2f2f2, { rough: 0.6 });
    box(tape, 0.03, 0.08, 0.02, 0.06, 0.02, 0.01, 0x2b3138, { rough: 0.6 });
    holoTag(tape, "replica tape — hold", 0, 0.12, 0.02, { css: "#e8541e", w: 0.36 });
    reg(hits, tape, "replica-tape");
    const reach = box(rail, 0.6, 0.4, 0.3, -1.1, 1.45, -0.25, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(rail, "reach over the rail unclipped?", -1.1, 1.75, -0.15, { css: "#d2312b", w: 0.54 });
    reg(hits, reach, "lean-over-rail-unclipped");
    const pot = group(rail, -0.7, 1.2, -0.16);
    cyl(pot, 0.07, 0.06, 0.14, 0, -0.08, 0, 0xe8541e, { rough: 0.5, seg: 12 });
    torus(pot, 0.05, 0.006, 0, 0.03, 0, 0x9aa1a8, { rough: 0.4, metal: 0.8, seg: 6, seg2: 12 });
    reg(hits, pot, "untethered-paint-pot");
    const signPost = group(g, 1.95, 0, -0.85);
    cyl(signPost, 0.025, 0.03, 1.1, 0, 0.55, 0, 0x5a636c, { rough: 0.5, metal: 0.6, seg: 8 });
    box(signPost, 0.3, 0.03, 0.3, 0, 0.015, 0, 0x3a4148, { rough: 0.6 });
    torus(signPost, 0.04, 0.008, 0, 1.08, 0, GGO_ACCENT, { emissive: GGO_ACCENT, ei: 1.4, rough: 0.4, seg: 6, seg2: 14 });
    holoTag(signPost, "sign stanchion", 0, 1.25, 0, { css: "#e8541e", w: 0.3 });
    reg(hits, signPost, "sign-post");
    const anchor = group(g, -1.95, 0, -0.75);
    cyl(anchor, 0.05, 0.06, 1.2, 0, 0.6, 0, 0x5a636c, { rough: 0.5, metal: 0.6, seg: 10 });
    torus(anchor, 0.05, 0.01, 0, 1.22, 0, 0xd8b23a, { rough: 0.4, metal: 0.7, seg: 6, seg2: 14 });
    holoTag(anchor, "rated anchor", 0, 1.42, 0, { css: "#e8541e", w: 0.26 });
    reg(hits, anchor, "painter-anchor");

    // ------------------------------------------------ the paint cart
    const cart = group(g, -2.0, 0, 0.55, 0.5);
    box(cart, 0.9, 0.05, 0.55, 0, 0.62, 0, 0x5a636c, { rough: 0.5, metal: 0.6 });
    box(cart, 0.9, 0.05, 0.55, 0, 0.2, 0, 0x5a636c, { rough: 0.5, metal: 0.6 });
    for (const [px, pz] of [[-0.42, -0.25], [0.42, -0.25], [-0.42, 0.25], [0.42, 0.25]]) cyl(cart, 0.015, 0.015, 0.62, px, 0.33, pz, 0x8a949d, { rough: 0.45, metal: 0.7, seg: 6 });
    const pailA = cyl(cart, 0.13, 0.12, 0.3, -0.22, 0.8, 0, 0xe8541e, { rough: 0.5, seg: 14 });
    void pailA;
    cyl(cart, 0.08, 0.075, 0.18, 0.1, 0.74, 0.12, 0x9aa1a8, { rough: 0.5, seg: 12 });
    const pailLid = cyl(cart, 0.135, 0.135, 0.02, -0.22, 0.98, 0.14, 0x3a4148, { rough: 0.5, seg: 14 });
    pailLid.rotation.x = 1.0;
    holoTag(cart, "pail lid", -0.22, 1.22, 0, { css: "#e8541e", w: 0.2 });
    reg(hits, pailLid, "pail-lid");
    const mixer = group(cart, -0.22, 1.05, 0);
    box(mixer, 0.08, 0.14, 0.22, 0, 0.1, 0.06, 0x2f4f6f, { rough: 0.5 });
    const paddle = cyl(mixer, 0.008, 0.008, 0.4, 0, -0.15, 0, 0xc0c6cc, { rough: 0.35, metal: 0.8, seg: 6 });
    void paddle;
    holoTag(mixer, "mixer — turn", 0, 0.3, 0, { css: "#e8541e", w: 0.26 });
    reg(hits, mixer, "mixer-paddle");
    const brush = group(cart, 0.3, 0.68, -0.15, 0.3);
    box(brush, 0.18, 0.02, 0.03, 0, 0, 0, 0x8a6a3a, { rough: 0.8 });
    box(brush, 0.06, 0.03, 0.05, 0.11, 0, 0, 0xe8541e, { rough: 0.9 });
    holoTag(brush, "stripe brush — carry", 0, 0.1, 0, { css: "#e8541e", w: 0.36 });
    reg(hits, brush, "stripe-brush");
    const comb = group(cart, 0.3, 0.66, 0.15);
    box(comb, 0.08, 0.005, 0.05, 0, 0, 0, 0xc0c6cc, { rough: 0.3, metal: 0.9 });
    holoTag(comb, "wet-film comb", 0, 0.08, 0, { css: "#e8541e", w: 0.28 });
    reg(hits, comb, "wft-comb");
    const rags = group(g, -2.55, 0, -0.35);
    for (let i = 0; i < 4; i++) box(rags, 0.14, 0.03, 0.12, (i % 2) * 0.06, 0.02 + i * 0.03, (i % 3) * 0.03, 0xd8c8a8, { rough: 1 });
    reg(hits, rags, "solvent-rags-open");
    const ragCan = cyl(g, 0.14, 0.14, 0.4, -2.55, 0.2, 0.05, 0xd8232a, { rough: 0.5, metal: 0.4, seg: 14 });
    void ragCan;

    // ------------------------------------------------ the airless pump, hose and gun
    const pump = group(g, 1.95, 0, 0.45, -0.6);
    box(pump, 0.5, 0.45, 0.4, 0, 0.36, 0, 0xe8b830, { rough: 0.55, metal: 0.35 });
    cyl(pump, 0.1, 0.1, 0.4, 0.12, 0.8, 0, 0x5a636c, { rough: 0.5, metal: 0.6, seg: 12 });
    for (const sx of [-0.2, 0.2]) torus(pump, 0.1, 0.03, sx, 0.1, 0.22, 0x1a1e23, { rough: 0.8, seg: 6, seg2: 14 });
    const pumpStop = group(pump, -0.18, 0.62, 0.21);
    cyl(pumpStop, 0.04, 0.04, 0.03, 0, 0, 0, 0xd8232a, { rough: 0.5, seg: 12 }).rotation.x = Math.PI / 2;
    holoTag(pumpStop, "pump stop", 0, 0.1, 0, { css: "#e8541e", w: 0.22 });
    reg(hits, pumpStop, "airless-pump-stop");
    const relief = group(pump, 0.14, 0.62, 0.21);
    cyl(relief, 0.03, 0.03, 0.04, 0, 0, 0, 0xf2c14b, { rough: 0.5, seg: 10 }).rotation.x = Math.PI / 2;
    holoTag(relief, "prime / relief valve", 0, 0.1, 0, { css: "#e8541e", w: 0.34 });
    reg(hits, relief, "pump-relief");
    hose(g, [[1.8, 0.4, 0.55], [1.2, 0.1, 0.2], [0.8, 0.6, -0.5], [0.6, 1.0, -0.8]], 0.012, 0x1b1e23, { steps: 18, rough: 0.75 });
    const gun = group(g, 0.6, 1.05, -0.82, 0.3);
    box(gun, 0.05, 0.14, 0.05, 0, -0.06, 0, 0x2b3138, { rough: 0.6 });
    box(gun, 0.2, 0.04, 0.04, 0.06, 0.02, 0, 0x9aa1a8, { rough: 0.4, metal: 0.7 });
    const tip = cyl(gun, 0.018, 0.018, 0.03, 0.17, 0.02, 0, 0xd8b23a, { rough: 0.4, metal: 0.7, seg: 8 });
    tip.rotation.z = Math.PI / 2;
    const triggerLock = box(gun, 0.02, 0.02, 0.05, 0.02, -0.03, 0.03, 0x59c97b, { rough: 0.5 });
    holoTag(gun, "airless gun — track", 0, 0.14, 0, { css: "#e8541e", w: 0.36 });
    reg(hits, gun, "spray-gun");
    const lockHit = box(g, 0.08, 0.06, 0.08, 0.62, 0.98, -0.72, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "trigger lock", 0.62, 0.9, -0.65, { css: "#e8541e", w: 0.22 });
    reg(hits, lockHit, "trigger-lock");
    const tipHit = box(g, 0.1, 0.1, 0.1, 0.8, 1.08, -0.9, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "clear the tip by hand?", 0.95, 1.25, -0.9, { css: "#d2312b", w: 0.42 });
    reg(hits, tipHit, "airless-tip-hand");
    const overspray = box(g, 2.4, 1.2, 1.6, 1.6, 1.4, -0.4, 0xe8541e, { rough: 1, opacity: 0.25, transparent: true, cast: false, receive: false });
    overspray.visible = false;

    // ------------------------------------------------ instruments, paperwork, radio
    const dew = instrument(g, -0.95, 1.12, -0.55, { ry: 0.2, idle: "-- °", color: GGO_ACCENT, w: 0.12, d: 0.16 });
    box(g, 0.2, 1.08, 0.2, -0.95, 0.54, -0.55, 0x3a4148, { rough: 0.6, metal: 0.4 });
    holoTag(dew, "dew point meter", 0, 0.14, 0, { css: "#e8541e", w: 0.32 });
    reg(hits, dew, "dewpoint-meter");
    const cartridge = group(g, -1.3, 0, 1.75);
    box(cartridge, 0.34, 0.24, 0.24, 0, 0.12, 0, 0x2f4f6f, { rough: 0.6 });
    for (const sx of [-0.07, 0.07]) cyl(cartridge, 0.04, 0.04, 0.05, sx, 0.27, 0, 0x2b2b2b, { rough: 0.6, seg: 10 });
    holoTag(cartridge, "OV cartridges", 0, 0.46, 0, { css: "#e8541e", w: 0.28 });
    reg(hits, cartridge, "respirator-cartridge");
    const spec = holoPanel(g, 0.92, 0.62, 2.45, 1.4, 1.75, (cx, w, h) => {
      cx.fillStyle = "rgba(20,10,6,0.92)"; cx.fillRect(0, 0, w, h); cx.fillStyle = "#e8541e"; cx.fillRect(0, 0, w, 6);
      cx.font = `600 ${Math.round(h * 0.1)}px 'Barlow Condensed', Arial, sans-serif`; cx.textAlign = "left"; cx.textBaseline = "middle";
      cx.fillStyle = "#ffe2d2"; cx.fillText("COATING SPECIFICATION — RECOAT", w * 0.06, h * 0.13);
      cx.fillStyle = "#e8541e"; cx.fillRect(w * 0.78, h * 0.26, w * 0.14, h * 0.2);
      cx.font = `${Math.round(h * 0.066)}px Arial, sans-serif`; cx.fillStyle = "#f5eae4";
      ["Surface: near-white blast, profile per spec", "System: primer, intermediate, topcoat", "Colour: International Orange",
       "Film: per coat, wet and dry, per spec", "Weather: margin over dew point per spec", "Recoat window: per the maker's data"]
        .forEach((l, i) => cx.fillText(l, w * 0.06, h * (0.29 + i * 0.11)));
    }, { ry: -0.9, accent: GGO_ACCENT });
    reg(hits, spec, "coating-spec");
    const log = holoPanel(g, 0.72, 0.5, 0.25, 1.4, 2.5, (cx, w, h) => {
      cx.fillStyle = "rgba(20,10,6,0.92)"; cx.fillRect(0, 0, w, h); cx.fillStyle = "#e8541e"; cx.fillRect(0, 0, w, 6);
      cx.font = `600 ${Math.round(h * 0.12)}px 'Barlow Condensed', Arial, sans-serif`; cx.textAlign = "left"; cx.textBaseline = "middle";
      cx.fillStyle = "#ffe2d2"; cx.fillText("PAINT LOG", w * 0.06, h * 0.15);
      cx.font = `${Math.round(h * 0.085)}px Arial, sans-serif`; cx.fillStyle = "#f5eae4";
      ["Batch: —", "Weather: —", "Profile: —", "Wet film: —"].forEach((l, i) => cx.fillText(l, w * 0.06, h * (0.36 + i * 0.16)));
    }, { ry: 0, accent: GGO_ACCENT });
    reg(hits, log, "paint-log");
    const chest = toolChest(g, -0.6, 2.2, { ry: Math.PI, color: 0x7a3a22 });
    const radio = instrument(chest, 0.14, 0.79, 0.03, { ry: 0.1, idle: "PAINT CH", color: GGO_ACCENT, w: 0.1, d: 0.16 });
    holoTag(radio, "paint radio", 0, 0.15, 0, { css: "#e8541e", w: 0.24 });
    reg(hits, radio, "paint-radio");
    const sign = group(g, 2.55, 0, 0.9);
    box(sign, 0.36, 0.26, 0.02, 0, 0.9, 0, 0xf2d21e, { rough: 0.6 });
    decal(sign, 0.32, 0.2, 0, 0.9, 0.012, signFace("WET PAINT", { bg: "#f2d21e", accent: "#1a1e23", fg: "#1a1e23", scale: 0.55 }), { px: 128 });
    cyl(sign, 0.012, 0.012, 0.8, 0, 0.4, 0, 0x5a636c, { rough: 0.5, seg: 6 });
    holoTag(sign, "wet paint sign — carry", 0, 1.16, 0, { css: "#e8541e", w: 0.38 });
    reg(hits, sign, "wet-paint-sign");

    // ------------------------------------------------ crew, windsock, fog bank
    const lead = standingFigure(g, 2.7, -0.35, { ry: -1.6, cloth: 0x1f3a52, vest: 0xe4dc3a, helmet: 0xf2f2f2 });
    holoTag(lead, "coating lead", 0, 1.95, 0, { css: "#59c97b", w: 0.26 });
    const painter2 = standingFigure(g, -2.7, 1.6, { ry: 2.0, cloth: 0xf2f2f2, helmet: 0xf2f2f2, respirator: true });
    holoTag(painter2, "second painter", 0, 1.95, 0, { css: "#59c97b", w: 0.3 });
    cone(g, 1.4, 2.6, { color: GGO_ACCENT }); cone(g, -1.9, 2.7, { color: GGO_ACCENT });
    const mast = group(g, 1.55, 0, -1.9);
    cyl(mast, 0.02, 0.03, 2.2, 0, 1.1, 0, 0x9aa1a8, { rough: 0.45, metal: 0.7, seg: 8 });
    const sock = cyl(mast, 0.06, 0.03, 0.34, 0.2, 2.1, 0.1, 0x59c97b, { rough: 0.7, seg: 10 });
    sock.rotation.x = 1.1;

    const fog = group(g, -50, 0, -4);
    const fogMat = { rough: 1, opacity: 0.55, transparent: true, cast: false, receive: false };
    box(fog, 9, 8, 28, 0, 3, 0, 0xdfe5e9, fogMat);
    box(fog, 10, 6, 20, -4, 2, 9, 0xe8ecef, fogMat);
    box(fog, 7, 11, 16, 3, 4.5, -9, 0xd6dde2, fogMat);
    fog.visible = false;
    const fogHome = fog.position.clone();
    const beads = [];
    for (let i = 0; i < 6; i++) { const b = ball(rail, 0.012, -1.4 + i * 0.5, 1.37, 0.1, 0xdfe8ee, { rough: 0.1, metal: 0.2, seg: 6, seg2: 4 }); b.visible = false; beads.push(b); }

    let fogOn = false, gusting = false;

    return {
      hits,
      spawnLook: new THREE.Vector3(0.1, 1.1, -1.2),
      onStepComplete(step) {
        if (step.id === "ready") hose(g, [[-1.95, 1.22, -0.75], [-1.6, 1.0, -0.4], [-1.2, 0.95, -0.1]], 0.01, 0xe0662e, { steps: 8, rough: 0.7 });
        if (step.id === "prep-check") { bloom.visible = false; dust.visible = false; }
        if (step.id === "mix") pailA.material = mat(0xe8541e, { rough: 0.4 });
        if (step.id === "stripe") for (const r of rivets) r.material = mat(0xe8541e, { rough: 0.4, metal: 0.2 });
        if (step.id === "spray") { patch.material = mat(0xe8541e, { rough: 0.35, metal: 0.2 }); flange.material = mat(0xe8541e, { rough: 0.35, metal: 0.2 }); }
        if (step.id === "relieve") triggerLock.material = mat(0xd8232a, { rough: 0.5 });
        if (step.id === "sign") sign.position.set(1.95, 0.2, -0.75);
        if (step.id === "paint-log") repaint(log.userData.face, (cx, w, h) => {
          cx.fillStyle = "rgba(20,10,6,0.92)"; cx.fillRect(0, 0, w, h); cx.fillStyle = "#59c97b"; cx.fillRect(0, 0, w, 6);
          cx.font = `600 ${Math.round(h * 0.12)}px 'Barlow Condensed', Arial, sans-serif`; cx.textAlign = "left"; cx.textBaseline = "middle";
          cx.fillStyle = "#ffe2d2"; cx.fillText("PAINT LOG", w * 0.06, h * 0.15);
          cx.font = `${Math.round(h * 0.072)}px Arial, sans-serif`; cx.fillStyle = "#f5eae4";
          ["Batch: base + hardener numbers, mix time", "Weather: margin inside spec, fog stop noted", "Profile: replica tape read and kept", "Wet film: combed inside the figure"].forEach((l, i) => cx.fillText(l, w * 0.06, h * (0.36 + i * 0.16)));
        });
        if (step.id === "crew-checkin") repaint(radio.userData.screen, signFace("PATCH COATED", { bg: "#0d1c24", accent: "#59c97b", fg: "#bfeaf7", scale: 0.5 }));
      },
      onInterrupt(it) {
        if (it.id === "fog-on-the-steel") { fogOn = true; fog.visible = true; fog.position.set(-24, 0, -4); for (const b of beads) b.visible = true; }
        if (it.id === "gust-on-the-spray") {
          gusting = true; overspray.visible = true;
          sock.material = mat(0xd2312b, { rough: 0.7, emissive: 0x6a1010, ei: 0.6 });
          sock.rotation.x = Math.PI / 2;
        }
      },
      onInterruptEnd(it) {
        if (it.id === "fog-on-the-steel") {
          if (it.resolved === "answered") { pailLid.rotation.x = 0; pailLid.position.set(-0.22, 0.96, 0); }
        }
        if (it.id === "gust-on-the-spray") {
          gusting = false;
          if (it.resolved !== "answered") return;
          overspray.visible = false;
          sock.material = mat(0x59c97b, { rough: 0.7 }); sock.rotation.x = 1.1;
          repaint(radio.userData.screen, signFace("PUMP STOPPED", { bg: "#0d1c24", accent: "#f2ae14", fg: "#bfeaf7", scale: 0.5 }));
        }
      },
      onHazard(hitId) {
        if (hitId === "untethered-paint-pot") pot.position.y = 1.1;
      },
      animate(t, dt, session) {
        const d = dt ?? 0.016;
        if (fogOn && fog.position.x < -12) fog.position.x += d * 0.8;
        if (!fogOn && fog.position.x !== fogHome.x) fog.position.copy(fogHome);
        if (gusting) overspray.position.x = 1.6 + Math.sin(t * 2) * 0.3;
        sock.rotation.z = Math.sin(t * (gusting ? 7 : 2)) * (gusting ? 0.35 : 0.1);
        const step = session?.step;
        const gg = session?.gauge;
        if (gg && !gg.committed && step?.id === "dew-point") repaint(dew.userData.screen, signFace(gg.t >= 0.5 && gg.t <= 0.78 ? "MARGIN OK" : "TOO CLOSE", { bg: "#0d1c24", accent: gg.t >= 0.5 && gg.t <= 0.78 ? "#59c97b" : "#f0645b", fg: "#bfeaf7", scale: 0.5 }));
        if (session?.turn && step?.id === "mix") mixer.rotation.y = session.turn.amount * Math.PI * 4;
        void CITY; void paperFace; void balusters;
      },
    };
  },
};
