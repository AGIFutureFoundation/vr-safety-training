import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, ball, torus, slab, group, decal, repaint, signFace, paperFace, particles, mat,
} from "../../../shared/kit.js";
import {
  CITY, stationPad, holoPanel, holoTag, toolChest, standingFigure,
  surfaceTexture, texturedMat, pavingFace, reg,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Environmental Services Isolation Room Turnover VR — Healthcare
// Support, station one. The room an EVS tech inherits the moment a patient on
// contact or droplet precautions is discharged: the posted precautions read
// before the cart is even unpacked, PPE donned in the order the barrier
// actually needs it, the things this job is not the one to touch left for
// nursing, linen bagged rather than shaken, regulated waste kept out of the
// general trash, every high-touch surface given the wet-contact time its own
// label calls for, the bathroom worked cleanest surface first, PPE doffed in
// the order that keeps a contaminated glove off a bare hand, and the room
// finally logged clean and released back to bed management.

const EVS_ACCENT = 0x5fb87e;

export const SIM_HC_ENVIRONMENTAL_SERVICES_ISOLATION_ROOM_TURNOVER = {
  id: "hc-environmental-services-isolation-room-turnover",
  index: "352",
  domain: "Healthcare Support",
  trade: "Environmental services technician",
  category: "Healthcare Support",
  indoor: "clinic",
  certification: "OSHA 29 CFR 1910.1030 bloodborne pathogens and the facility's exposure control plan; the CDC's guidance on cleaning and disinfection of environmental surfaces in healthcare settings and its transmission-based precautions; OSHA 29 CFR 1910.1200 hazard communication for the disinfectant's own label; SEIU-UHW and NUHW as the training bodies for hospital environmental services staff",
  name: "Isolation Room Turnover",
  title: simTitle("Isolation Room Turnover"),
  tagline: "PPE donned to the posted precautions, linen bagged not shaken, regulated waste kept separate, every high-touch surface held to its label's wet-contact time, and the room logged clean and released",
  accent: EVS_ACCENT,
  accentCss: "#5fb87e",
  parSeconds: 300,
  footprint: 2.4,
  badge: { id: "room-released", name: "Room Released", note: "An isolation room turned over start to finish with the precautions barrier never broken" },

  // Named for the guide's end-of-run check-in card (shared/ei-guide.js):
  // the profession's own support resource, not an invented hotline.
  supportLine: "your employer's employee assistance program, or SEIU-UHW's member resources if a room like this one has you rattled",

  game: system({
    name: "Turnover Standard",
    currency: "ROOM",
    ranks: ["New Tech", "Isolation Certified", "Lead Tech", "EVS Supervisor", "Turnover Certified"],
    badges: [
      { id: "barrier-held", name: "Barrier Held", note: "PPE donned before a single surface was touched", test: AWARD.stepClean("ppe-cart") },
      { id: "linen-not-shaken", name: "Linen Not Shaken", note: "Soiled linen bagged without ever being shaken out", test: AWARD.stepClean("linen-hamper") },
      { id: "logged-clean", name: "Logged Clean", note: "The room closed out on the log the moment it was actually ready", test: AWARD.stepClean("clean-log") },
    ],
    challenges: [
      { id: "clean-turnover", name: "Clean Turnover", note: "No corrections anywhere in the turnover", test: AWARD.clean },
      { id: "steady-mop", name: "Steady Mop", note: "Held the floor mop the whole pass, first try", test: AWARD.unbroken },
      { id: "fast-turnover", name: "Fast Turnover", note: "Complete inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "gloves-only-box": "That box is exam gloves, and nothing else is on over your uniform yet. Contact precautions are a barrier, not a glove — gloves go on last, over a gown's cuffs, not as the whole outfit.",
    "regular-trash-bin": "That bin is unlined general trash, and the wipe in your hand came off a visibly soiled surface. Regulated waste goes in the red bag by the door, not into a bin that ends up in the same truck as the break-room trash.",
    "shaken-linen": "That sheet is mid-shake. Snapping soiled linen out before it goes in the bag is exactly how whatever is on it gets airborne and lands on a surface you already disinfected — bag it where it lies, don't shake it first.",
    "cross-wipe-cloth": "That's the cloth you just used on the toilet, sitting on the sink edge like it's clean. Working dirty to clean instead of clean to dirty puts what came off the toilet onto the next surface a hand actually touches.",
  },

  lateNotes: {
    "wet-floor-sign": "Not yet — the sign goes down before the mop does, not the other way around.",
    "clean-log": "Hold that. PPE comes off and the floor has to be dry before this room logs as ready.",
  },

  steps: [
    {
      id: "precautions-card", kind: "select", target: "precautions-card",
      title: "Read the posted precautions before entering",
      cue: "Check the card on the door for what kind of precautions this room is under.",
      why: "The card on the door is what tells you which PPE this room actually needs — contact, droplet or both — before a single glove goes on. Guessing at it from the last room you cleaned is how the wrong barrier goes up on the wrong room.",
    },
    {
      id: "ppe-cart", kind: "select", target: "ppe-cart",
      title: "Don PPE to the posted precautions",
      cue: "Gown first, then gloves pulled up over the gown's cuffs, then eye protection.",
      why: "The CDC's transmission-based precautions guidance orders PPE donning for a reason: a gown put on after gloves leaves a gap at the wrist that a glove alone was never meant to cover, and eye protection last means it's the one thing you're not tempted to touch again once your hands are already dirty.",
    },
    {
      id: "hazard-scan", kind: "find", noHint: true,
      targets: ["stray-sharp", "overfull-sharps"],
      itemNames: { "stray-sharp": "an uncapped needle on the bedside tray", "overfull-sharps": "a sharps container packed past its line" },
      itemNotes: {
        "stray-sharp": "A loose needle on a bedside tray is not an EVS job — it goes untouched and nursing gets called, the same as the syringe cap you'll find in the linen in a minute.",
        "overfull-sharps": "An overfilled sharps container is a clinical device past a fill line, not a housekeeping item to empty or force closed. Flag it for nursing and keep moving.",
      },
      title: "Scan the room for what isn't yours to handle",
      cue: "Two things in this room are for nursing to deal with, not you. Find them before you touch anything else.",
      why: "An EVS tech's scope stops at the room, not at every object in it — a sharp or a device left behind by clinical staff gets flagged, not picked up, because handling it wrong is a needlestick this job was never trained for in the first place.",
    },
    {
      id: "linen-hamper", kind: "select", target: "linen-hamper",
      title: "Bag the soiled linen without shaking it",
      cue: "Roll the linen inward on itself and place it straight into the hamper bag.",
      why: "Soiled linen carries whatever the patient did, and CDC guidance is explicit that it gets handled with minimum agitation — rolled and bagged, never shaken, snapped or held against the body, because shaking it is how it gets into the air of a room you're trying to clean.",
    },
    {
      id: "waste-sort", kind: "select", target: "red-bag-bin",
      title: "Sort regulated waste into the red bag",
      cue: "Put visibly soiled disposables in the red biohazard bag, not the general trash.",
      why: "OSHA's bloodborne pathogens standard treats anything soaked or caked with blood or other potentially infectious material as regulated waste with its own bag, its own hauler and its own disposal rule — mixing it into general trash turns every bag handler downstream into someone exposed without knowing it.",
    },
    {
      id: "wipe-down", kind: "gauge", target: "disinfectant-panel",
      title: "Hold every high-touch surface to its wet-contact time",
      cue: "Wipe the high-touch surfaces and watch the panel — commit once the surface has stayed visibly wet long enough, per the label.",
      why: "A disinfectant only kills what its label says it kills for as long as the surface actually stays wet — that contact time is set by the product's own registered label, not by how fast the wipe feels done, and wiping it dry early means the surface was never actually disinfected at all.",
      gauge: { label: "SURFACE WET TIME", speed: 0.6, green: [0.45, 0.75], readout: (t) => (t < 0.45 ? "still drying — keep wiping" : t > 0.75 ? "past label time" : "wet per the label"), missNote: "Committed before the label's wet-contact time was met, or well after the surface had already dried — neither one is a disinfected surface." },
    },
    {
      id: "bathroom-order", kind: "sequence", anyOrder: false,
      targets: ["sink-fixture", "toilet-fixture"],
      itemNames: { "sink-fixture": "sink and counter", "toilet-fixture": "toilet" },
      title: "Clean the bathroom cleanest surface first",
      cue: "Wipe the sink and counter, then the toilet — never the other way around.",
      why: "Cleaning cleanest-to-dirtiest keeps whatever came off the toilet from ever reaching the counter a patient's hand or toothbrush touches next — reverse the order and the cloth becomes the thing that cross-contaminates the surface you already finished.",
      outOfOrderNote: "Sink and counter before the toilet, every time — the order is what keeps the dirtiest surface from touching the cleanest one.",
    },
    {
      id: "reline-bins", kind: "select", target: "reline-bin",
      title: "Reline the emptied bins",
      cue: "Fit a fresh liner in the trash and the red bag holder before moving on.",
      why: "A bin left unlined is a bin the next person in this room reaches for and finds nothing — relining it now is what makes the room actually ready, not just emptied.",
    },
    {
      id: "curtain-swap", kind: "select", target: "soiled-curtain",
      title: "Take down the soiled privacy curtain",
      cue: "Unhook the curtain and bag it for laundry rather than leaving it up.",
      why: "A privacy curtain gets touched by every hand that passes the bed, and CDC surface guidance treats it the same as any other high-touch item in a precautions room — left up, it carries the last patient's risk straight into the next one's stay.",
    },
    {
      id: "wet-floor-sign", kind: "drag", target: "wet-floor-sign",
      title: "Set the wet floor sign before mopping",
      cue: "Place the sign at the doorway before the mop touches the floor.",
      why: "A wet floor with no sign at the door is a fall waiting on whoever walks in next — the sign goes up before the mop, not after someone has already slipped on a floor they had no way to know was wet.",
      drag: { to: "doorway-spot", radius: 0.4, missNote: "Not at the doorway — the one place someone actually walks in from is the one place the sign has to stand." },
    },
    {
      id: "mop-floor", kind: "hold", target: "mop-bucket", seconds: 6,
      title: "Mop the floor working back to the door",
      cue: "Work in overlapping strokes from the far corner back toward the door and hold the pass steady.",
      why: "Mopping toward the door instead of away from it means you're never standing on floor you haven't cleaned yet, and never re-tracking dirty water back over a section you already finished.",
      holdBreakNote: "The pass broke before it reached the door. A mop stroke that stops partway leaves a patch that never got cleaned, not a floor that's merely still drying.",
    },
    {
      id: "doff-ppe", kind: "sequence",
      targets: ["gloves-off", "hand-hygiene", "gown-off", "mask-off"],
      itemNames: { "gloves-off": "remove gloves", "hand-hygiene": "hand hygiene", "gown-off": "remove gown", "mask-off": "remove mask/eye protection" },
      title: "Doff PPE in the order that keeps you clean",
      cue: "Gloves off first, then hand hygiene, then the gown, then the mask or eye protection last.",
      why: "The CDC's doffing sequence exists because the most contaminated items come off first and the ones nearest your airway come off last, with a hand-hygiene step between them — skip the order and a hand that just peeled off a soiled glove is the hand about to touch your own face.",
      outOfOrderNote: "Gloves, then hands washed, then the gown, then the mask last — that order is what keeps a contaminated glove away from your bare skin.",
    },
    {
      id: "clean-log", kind: "select", target: "clean-log",
      title: "Log the room and release it",
      cue: "Mark the room terminally cleaned and release it to bed management.",
      why: "Bed management assigns this room to its next patient off this log, not off a guess that the door being open means it's ready — an unlogged room is a room that either sits empty longer than it needs to or gets assigned before it's actually done.",
    },
  ],

  interrupts: [
    {
      id: "sharp-in-linen",
      kind: "Unexpected sharp",
      after: "linen-hamper", delay: 3, seconds: 12,
      alert: "While rolling the linen, something hard and small drops out of the folds onto the floor — it looks like a used syringe cap.",
      cue: "That is not yours to pick up or dispose of.",
      target: "call-nursing-phone",
      why: "A sharp that turns up somewhere it shouldn't be is a nursing call every time, not a judgment call for whoever happens to be holding the linen — the room stays as it is around that spot until someone qualified to handle it does.",
      missNote: "The linen bag went to laundry with an unresolved sharp on the floor beside it. Whoever mops that spot next has no idea it's there.",
      wrongNote: "It's the phone to nursing — a sharp in the wrong place gets reported before the turnover continues around it.",
    },
    {
      id: "sign-knocked",
      kind: "Wet floor sign down",
      after: "mop-floor", delay: 3, seconds: 11,
      alert: "A supply cart passing in the hallway clips the wet floor sign and knocks it flat, right as you're finishing the pass.",
      cue: "The floor is still wet and the doorway now has no sign standing at it.",
      target: "wet-floor-sign",
      why: "A sign flat on the floor warns nobody — the doorway needs it standing again immediately, because the wet floor it's supposed to be warning people about hasn't gone anywhere just because the sign fell over.",
      missNote: "The sign stayed down through the rest of the pass. Anyone who walked through that doorway had no warning the floor inside was wet.",
      wrongNote: "It's the sign — stand it back up at the doorway before anything else continues.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.4, EVS_ACCENT);

    // Tile floor texture under the working area, distinct from the generic
    // clinic room shell's own floor.
    const floorTex = surfaceTexture((cx, w, h) => pavingFace(cx, w, h, {
      tiles: 3, base: "#c7d0d2", base2: "#bcc6c8", seam: "rgba(0,0,0,0.14)",
    }), { repeat: 4, px: 256 });
    const floorMat = () => texturedMat(floorTex, { rough: 0.55, metal: 0.04, color: 0xd7dfe0 });
    const floorPatch = slab(g, 3.6, 0.006, 3.2, 0, 0.001, 0, 0xd7dfe0, { radius: 0.05, cast: false });
    floorPatch.material = floorMat();

    // ------------------------------------------------------------------ the bed
    const bed = group(g, 0, 0, -1.7);
    const bedFrame = box(bed, 1.0, 0.5, 2.0, 0, 0.25, 0, 0x8b929a, { rough: 0.45, metal: 0.5 });
    const bedFrameTex = surfaceTexture((cx, w, h) => pavingFace(cx, w, h, { tiles: 2, base: "#9aa4a9", base2: "#8b959a", seam: "rgba(0,0,0,0.1)" }), { repeat: 2, px: 192 });
    bedFrame.material = texturedMat(bedFrameTex, { rough: 0.5, metal: 0.4, color: 0x9aa4a9 });
    box(bed, 0.94, 0.16, 1.9, 0, 0.58, 0, 0xeef2f2, { rough: 0.6 });
    box(bed, 0.94, 0.5, 0.06, 0, 0.66, -0.97, 0xd7dce1, { rough: 0.45, metal: 0.3 });
    box(bed, 0.94, 0.3, 0.06, 0, 0.55, 0.97, 0xd7dce1, { rough: 0.45, metal: 0.3 });

    // Soiled linen heaped on the bed, and the hamper it goes into.
    const linenPile = group(bed, 0.1, 0.7, 0.1);
    box(linenPile, 0.5, 0.1, 0.7, 0, 0, 0, 0xe4e9ea, { rough: 0.85 });
    box(linenPile, 0.36, 0.08, 0.5, 0.05, 0.09, -0.05, 0xdfe4e5, { rough: 0.85 });
    holoTag(linenPile, "Soiled linen", 0, 0.16, 0, { css: EVS_ACCENT, w: 0.36 });
    reg(hits, linenPile, "linen-hamper");

    // Shaken-linen decoy, mid-air over the floor beside the bed.
    const shaken = group(bed, -0.9, 0.9, 0.3);
    box(shaken, 0.42, 0.03, 0.6, 0, 0, 0, 0xe9edee, { rough: 0.8 });
    shaken.rotation.set(0.2, 0.3, -0.1);
    holoTag(shaken, "Shaking it out", 0, 0.1, 0, { css: "#f0645b", w: 0.4 });
    reg(hits, shaken, "shaken-linen");

    const hamper = group(g, 1.4, 0, -2.5);
    cyl(hamper, 0.22, 0.2, 0.55, 0, 0.28, 0, 0xe8eef2, { rough: 0.6, seg: 16 });
    torus(hamper, 0.23, 0.02, 0, 0.56, 0, 0xb9c4c9, { rough: 0.5, seg: 6, seg2: 20 });
    void hamper;

    // The stray sharp and syringe cap on the bedside tray.
    const traytop = group(bed, -0.7, 0.62, -0.5);
    box(traytop, 0.3, 0.02, 0.22, 0, 0, 0, 0xdfe4e5, { rough: 0.4, metal: 0.2 });
    const strayNeedle = group(traytop, 0, 0.02, 0);
    cyl(strayNeedle, 0.005, 0.005, 0.07, 0, 0, 0, 0xdfe8ee, { rough: 0.3, seg: 8 }).rotation.z = Math.PI / 2;
    holoTag(strayNeedle, "Uncapped needle", 0, 0.05, 0, { css: "#f0645b", w: 0.4 });
    reg(hits, strayNeedle, "stray-sharp");

    // Overfilled sharps container mounted on the wall by the bed.
    const sharpsUnit = group(g, 1.5, 0, -1.9, -Math.PI / 2);
    box(sharpsUnit, 0.24, 0.3, 0.2, 0, 1.05, 0, 0xd8342a, { rough: 0.6 });
    box(sharpsUnit, 0.26, 0.04, 0.22, 0, 1.24, 0, 0xf2e9c9, { rough: 0.55 });
    for (let i = 0; i < 5; i++) {
      const s = cyl(sharpsUnit, 0.007, 0.007, 0.06, -0.07 + i * 0.032, 1.27, 0.02, 0xdfe8ee, { rough: 0.3, seg: 8 });
      s.rotation.set(0.3 * Math.random(), 0, 0.5 * (Math.random() - 0.5));
    }
    decal(sharpsUnit, 0.22, 0.05, 0, 1.17, 0.101, signFace("PAST FILL LINE", { bg: "#7d1512", accent: "#f2ae14", scale: 0.4 }));
    const overfillMarker = box(sharpsUnit, 0.28, 0.32, 0.22, 0, 1.05, 0, 0x8d959d, { rough: 0.5, opacity: 0.001, transparent: true, cast: false });
    reg(hits, overfillMarker, "overfull-sharps");

    // -------------------------------------------------------------- PPE cart
    const ppeCart = group(g, -2.5, 0, -2.4);
    box(ppeCart, 0.5, 0.06, 0.4, 0, 0.86, 0, 0x53585e, { rough: 0.55, metal: 0.35 });
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) box(ppeCart, 0.03, 0.86, 0.03, sx * 0.22, 0.43, sz * 0.17, CITY.darkSteel, { rough: 0.5, metal: 0.5 });
    const gownStack = box(ppeCart, 0.2, 0.1, 0.3, -0.1, 0.92, 0, 0x9fd6c0, { rough: 0.75 });
    holoTag(ppeCart, "Gowns → Gloves → Eye Pro", 0, 1.06, 0, { css: EVS_ACCENT, w: 0.5 });
    reg(hits, gownStack, "ppe-cart");
    const glovesOnly = box(ppeCart, 0.14, 0.08, 0.14, 0.16, 0.9, 0.08, 0xf2e08a, { rough: 0.7 });
    holoTag(glovesOnly, "Gloves only?", 0, 0.06, 0, { css: "#f0645b", w: 0.32 });
    reg(hits, glovesOnly, "gloves-only-box");

    // ---------------------------------------------------------------- red bag / trash
    const binRow = group(g, -2.5, 0, -0.6);
    const redBag = group(binRow, -0.3, 0, 0);
    cyl(redBag, 0.16, 0.14, 0.42, 0, 0.21, 0, 0xd8342a, { rough: 0.55, seg: 14 });
    decal(redBag, 0.24, 0.1, 0, 0.32, 0.141, signFace("REGULATED WASTE", { bg: "#7d1512", accent: "#f2ae14", scale: 0.34 }));
    reg(hits, redBag, "red-bag-bin");
    const trashBin = group(binRow, 0.3, 0, 0);
    cyl(trashBin, 0.16, 0.14, 0.42, 0, 0.21, 0, 0x9aa4a9, { rough: 0.55, seg: 14 });
    holoTag(trashBin, "General trash", 0, 0.46, 0, { css: "#f0645b", w: 0.34 });
    reg(hits, trashBin, "regular-trash-bin");
    const relineTarget = box(binRow, 0.2, 0.02, 0.2, 0, 0.001, 0.4, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, relineTarget, "reline-bin");

    // ------------------------------------------------------------ high-touch wipe-down
    const rail = group(g, -1.1, 0, -3.0);
    box(rail, 0.9, 0.05, 0.05, 0, 1.0, 0, 0x6f7a83, { rough: 0.5, metal: 0.4 });
    const railTouch = box(rail, 0.9, 0.05, 0.05, 0, 1.0, 0.001, 0xd8b23b, { rough: 0.5, emissive: 0xd8b23b, ei: 0.2 });
    void railTouch;
    const wipePanel = holoPanel(g, 0.5, 0.34, -1.1, 1.6, -3.2, (ctx, w, h) => {
      ctx.fillStyle = "rgba(6,20,12,0.9)"; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#5fb87e"; ctx.fillRect(0, 0, w, 5);
      ctx.fillStyle = "#dff7e6";
      ctx.font = `600 ${Math.round(h * 0.14)}px 'Barlow Condensed', Arial, sans-serif`;
      ctx.textAlign = "left"; ctx.textBaseline = "middle";
      ctx.fillText("-- sec wet", w * 0.08, h * 0.4);
      ctx.font = `${Math.round(h * 0.1)}px Arial, sans-serif`;
      ctx.fillText("per the label", w * 0.08, h * 0.72);
    }, { accent: EVS_ACCENT });
    reg(hits, wipePanel, "disinfectant-panel");

    // ------------------------------------------------------------------- bathroom
    const bath = group(g, 1.7, 0, 1.3);
    box(bath, 0.55, 0.85, 0.45, 0, 0.425, 0, 0xeef2f2, { rough: 0.6 });
    const sink = ball(bath, 0.16, 0, 0.86, 0, 0xffffff, { rough: 0.3, seg: 12, seg2: 12 });
    sink.scale.set(1, 0.4, 0.7);
    reg(hits, sink, "sink-fixture");
    const toilet = group(g, 1.7, 0, 2.0);
    cyl(toilet, 0.18, 0.2, 0.4, 0, 0.2, 0, 0xf4f6f6, { rough: 0.5, seg: 14 });
    box(toilet, 0.3, 0.28, 0.2, 0, 0.5, -0.12, 0xf4f6f6, { rough: 0.5 });
    reg(hits, toilet, "toilet-fixture");
    // Cross-contamination cloth decoy on the sink edge.
    const crossCloth = box(bath, 0.1, 0.01, 0.08, 0.14, 0.87, 0.1, 0xdfa23b, { rough: 0.8 });
    holoTag(crossCloth, "Toilet cloth on sink", 0, 0.05, 0, { css: "#f0645b", w: 0.4 });
    reg(hits, crossCloth, "cross-wipe-cloth");

    // -------------------------------------------------------------- privacy curtain
    const curtainTrack = box(g, 2.6, 0.03, 0.03, 0, 2.1, -1.7, CITY.darkSteel, { rough: 0.4, metal: 0.6 });
    void curtainTrack;
    const curtain = group(g, 1.2, 0, -1.7);
    box(curtain, 0.02, 1.8, 1.2, 0, 1.05, 0, 0xc9a34a, { rough: 0.7, opacity: 0.85, transparent: true });
    holoTag(curtain, "Soiled curtain", 0, 2.0, 0, { css: "#f0645b", w: 0.36 });
    reg(hits, curtain, "soiled-curtain");

    // ---------------------------------------------------------------- mop + sign
    const mopCart = group(g, -2.3, 0, 1.6);
    cyl(mopCart, 0.22, 0.2, 0.5, 0, 0.25, 0, 0xdfe4e5, { rough: 0.55, seg: 14 });
    const mopHandle = cyl(mopCart, 0.014, 0.014, 1.1, 0.1, 1.0, 0, 0xc79a55, { rough: 0.6, seg: 8 });
    mopHandle.rotation.z = 0.15;
    reg(hits, mopCart, "mop-bucket");
    const mopBubbles = particles(mopCart, 12, 0xbfe4f2, { size: 0.01, life: 0.4, additive: false, opacity: 0.4 });

    const signStand = group(g, 0, 0, 2.7);
    cyl(signStand, 0.16, 0.16, 0.02, 0, 0.01, 0, 0xf2c14b, { rough: 0.6, seg: 10 });
    box(signStand, 0.28, 0.42, 0.02, 0, 0.22, 0, 0xf2c14b, { rough: 0.6 });
    decal(signStand, 0.24, 0.24, 0, 0.24, 0.011, signFace("WET FLOOR", { bg: "#f2c14b", accent: "#22262b", scale: 0.5 }));
    reg(hits, signStand, "wet-floor-sign");
    const doorSpot = box(g, 0.3, 0.02, 0.3, 0, 0.001, 3.6, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    hits["doorway-spot"] = doorSpot;

    // ---------------------------------------------------------------- doffing zone
    const doffZone = group(g, 2.6, 0, -0.2, 0.4);
    box(doffZone, 0.4, 0.02, 0.4, 0, 0.001, 0, 0x2b3138, { rough: 0.6, opacity: 0.4, transparent: true, cast: false });
    const gloveOff = box(doffZone, 0.1, 0.02, 0.1, -0.12, 0.02, 0, 0x9fd6c0, { rough: 0.7 });
    reg(hits, gloveOff, "gloves-off");
    const handRub = cyl(doffZone, 0.05, 0.05, 0.08, 0.12, 0.05, 0, 0xdfe8ee, { rough: 0.4, seg: 10 });
    reg(hits, handRub, "hand-hygiene");
    const gownOff = box(doffZone, 0.16, 0.02, 0.1, -0.12, 0.02, 0.16, 0x9fd6c0, { rough: 0.7 });
    reg(hits, gownOff, "gown-off");
    const maskOff = box(doffZone, 0.1, 0.02, 0.08, 0.12, 0.02, 0.16, 0xdfe4e5, { rough: 0.7 });
    reg(hits, maskOff, "mask-off");
    holoTag(doffZone, "Doffing station", 0, 0.3, 0, { css: EVS_ACCENT, w: 0.4 });

    // ----------------------------------------------------------- phone + log board
    const phone = group(g, -2.7, 0, 0.6);
    box(phone, 0.1, 0.02, 0.16, 0, 0.9, 0, 0x2b3138, { rough: 0.4, metal: 0.3 });
    box(phone, 0.08, 0.03, 0.02, 0, 0.92, -0.06, 0x2b3138, { rough: 0.4, metal: 0.3 });
    holoTag(phone, "Call nursing", 0, 1.0, 0, { css: EVS_ACCENT, w: 0.36 });
    reg(hits, phone, "call-nursing-phone");

    const logPanel = holoPanel(g, 0.5, 0.36, -2.7, 1.4, 1.3, (ctx, w, h) => {
      ctx.fillStyle = "rgba(6,20,12,0.9)"; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#5fb87e"; ctx.fillRect(0, 0, w, 5);
      ctx.fillStyle = "#dff7e6";
      ctx.font = `600 ${Math.round(h * 0.12)}px 'Barlow Condensed', Arial, sans-serif`;
      ctx.textAlign = "left"; ctx.textBaseline = "middle";
      ctx.fillText("TURNOVER LOG", w * 0.06, h * 0.2);
      ctx.font = `${Math.round(h * 0.09)}px Arial, sans-serif`;
      ctx.fillText("Room: — · Status: in progress", w * 0.06, h * 0.55);
    }, { accent: EVS_ACCENT, ry: 0.5 });
    reg(hits, logPanel, "clean-log");

    // -------------------------------------------------------------- door precautions
    const doorCard = decal(g, 0.34, 0.44, -1.9, 1.4, 3.55,
      paperFace("CONTACT PRECAUTIONS", ["Gown + gloves required", "Dedicated equipment"], { bg: "#fbf3df", band: "#c99a2b" }), { px: 220 });
    reg(hits, doorCard, "precautions-card");

    const tech = standingFigure(g, -1.8, 0.4, { ry: 1.2, cloth: 0x3f8f66, skin: 0xb98a63 });
    void tech;

    // Supply shelving along the back wall for depth.
    const shelf = group(g, -3.7, 0, -3.0);
    box(shelf, 0.06, 1.5, 0.7, -0.42, 0.75, 0, 0x8b929a, { rough: 0.5, metal: 0.4 });
    box(shelf, 0.06, 1.5, 0.7, 0.42, 0.75, 0, 0x8b929a, { rough: 0.5, metal: 0.4 });
    const SHELF_STOCK = [
      [0.3, "LINERS", 0xdfe4e5], [0.75, "WIPES", 0x9fd6c0], [1.2, "GOWNS", 0xf2c14b],
      [1.65, "MASKS", 0xf4f8fa], [2.1, "GLOVES", 0x9fd6c0],
    ];
    for (const [y, label, c] of SHELF_STOCK) {
      box(shelf, 0.82, 0.02, 0.68, 0, y, 0, 0x6f7a83, { rough: 0.55, metal: 0.3 });
      for (let i = -1; i <= 1; i++) {
        box(shelf, 0.24, 0.16, 0.2, i * 0.28, y + 0.09, 0, c, { rough: 0.7 });
        decal(shelf, 0.18, 0.06, i * 0.28, y + 0.09, 0.101, (cx, w, h) => {
          cx.fillStyle = "#22272c"; cx.fillRect(0, 0, w, h);
          cx.fillStyle = "#dff7e6"; cx.font = `600 ${Math.round(h * 0.5)}px Arial, sans-serif`;
          cx.textAlign = "center"; cx.textBaseline = "middle"; cx.fillText(label, w / 2, h / 2);
        }, { px: 96 });
      }
    }
    holoTag(shelf, "Supplies", 0, 2.35, 0, { css: EVS_ACCENT, w: 0.4 });

    // A second shelving unit along the side wall, for the disinfectant and
    // spare mop heads this line runs through every turnover.
    const shelfB = group(g, 3.7, 0, -1.3);
    box(shelfB, 0.06, 1.4, 0.7, -0.42, 0.7, 0, 0x8b929a, { rough: 0.5, metal: 0.4 });
    box(shelfB, 0.06, 1.4, 0.7, 0.42, 0.7, 0, 0x8b929a, { rough: 0.5, metal: 0.4 });
    const SHELF_STOCK_B = [
      [0.3, "DISINFECTANT", 0x59c97b], [0.75, "MOP HEADS", 0xdfe4e5], [1.2, "BAGS", 0xf2c14b],
    ];
    for (const [y, label, c] of SHELF_STOCK_B) {
      box(shelfB, 0.82, 0.02, 0.68, 0, y, 0, 0x6f7a83, { rough: 0.55, metal: 0.3 });
      for (let i = -1; i <= 1; i++) {
        box(shelfB, 0.24, 0.16, 0.2, i * 0.28, y + 0.09, 0, c, { rough: 0.7 });
        decal(shelfB, 0.18, 0.06, i * 0.28, y + 0.09, 0.101, (cx, w, h) => {
          cx.fillStyle = "#22272c"; cx.fillRect(0, 0, w, h);
          cx.fillStyle = "#dff7e6"; cx.font = `600 ${Math.round(h * 0.5)}px Arial, sans-serif`;
          cx.textAlign = "center"; cx.textBaseline = "middle"; cx.fillText(label, w / 2, h / 2);
        }, { px: 96 });
      }
    }
    holoTag(shelfB, "Housekeeping stock", 0, 1.55, 0, { css: EVS_ACCENT, w: 0.5 });

    // Wall-mounted hand-hygiene dispenser by the doorway.
    const handRubStation = group(g, -1.6, 0, 3.4);
    box(handRubStation, 0.12, 0.26, 0.09, 0, 1.1, 0, 0xf4f8fa, { rough: 0.4 });
    box(handRubStation, 0.08, 0.03, 0.06, 0, 0.94, 0.03, 0x2b3138, { rough: 0.5 });
    decal(handRubStation, 0.1, 0.08, 0, 1.2, 0.046, signFace("HAND RUB", { bg: "#f4f8fa", accent: "#5fb87e", scale: 0.5 }), { px: 96 });
    holoTag(handRubStation, "Hand hygiene", 0, 1.3, 0, { css: EVS_ACCENT, w: 0.4 });

    // A rolling supply cart parked beside the PPE cart, stocked for the
    // whole floor's turnovers rather than just this room's.
    const supplyCart = group(g, -3.1, 0, -1.0);
    box(supplyCart, 0.5, 0.03, 0.32, 0, 0.5, 0, 0x53585e, { rough: 0.5, metal: 0.4 });
    box(supplyCart, 0.5, 0.03, 0.32, 0, 0.78, 0, 0x53585e, { rough: 0.5, metal: 0.4 });
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) cyl(supplyCart, 0.03, 0.03, 0.03, sx * 0.22, 0.03, sz * 0.14, 0x14171a, { rough: 0.7, seg: 10 });
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) cyl(supplyCart, 0.008, 0.008, 0.44, sx * 0.22, 0.28, sz * 0.14, CITY.darkSteel, { rough: 0.5, metal: 0.6, seg: 6 });
    box(supplyCart, 0.2, 0.14, 0.24, -0.1, 0.59, 0, 0xf2c14b, { rough: 0.7 });
    box(supplyCart, 0.2, 0.14, 0.24, 0.12, 0.87, 0, 0x9fd6c0, { rough: 0.7 });
    holoTag(supplyCart, "Floor stock", 0, 1.0, 0, { css: EVS_ACCENT, w: 0.36 });

    return {
      hits,
      footprint: 2.4,
      spawnLook: new THREE.Vector3(0, 1.1, -1.7),

      onStepComplete(step) {
        if (step.id === "linen-hamper") { linenPile.visible = false; shaken.visible = false; }
        if (step.id === "hazard-scan") { strayNeedle.visible = false; overfillMarker.material = mat(0x59c97b, { opacity: 0.18, transparent: true }); }
        if (step.id === "waste-sort") { crossCloth.visible = true; }
        if (step.id === "curtain-swap") curtain.visible = false;
        if (step.id === "doff-ppe") { gownStack.material = mat(0x59c97b, { rough: 0.75 }); }
        if (step.id === "clean-log") {
          repaint(logPanel.userData.face, (ctx, w, h) => {
            ctx.fillStyle = "rgba(6,20,12,0.9)"; ctx.fillRect(0, 0, w, h);
            ctx.fillStyle = "#5fb87e"; ctx.fillRect(0, 0, w, 5);
            ctx.fillStyle = "#dff7e6";
            ctx.font = `600 ${Math.round(h * 0.12)}px 'Barlow Condensed', Arial, sans-serif`;
            ctx.textAlign = "left"; ctx.textBaseline = "middle";
            ctx.fillText("TURNOVER LOG", w * 0.06, h * 0.2);
            ctx.font = `${Math.round(h * 0.09)}px Arial, sans-serif`;
            ctx.fillText("Room: cleaned · Released", w * 0.06, h * 0.55);
          });
        }
      },

      onInterrupt(it) {
        if (it.id === "sharp-in-linen") { strayNeedle.visible = true; strayNeedle.position.set(-0.7, 0.05, 0.9); }
        if (it.id === "sign-knocked") { signStand.rotation.z = Math.PI / 2.1; signStand.position.y = 0.02; }
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "sharp-in-linen") strayNeedle.visible = false;
        if (it.id === "sign-knocked") { signStand.rotation.z = 0; signStand.position.y = 0; }
      },

      onHazard() {},

      animate(t, dt, session) {
        mopBubbles.visible = session?.step?.id === "mop-floor" && !!session.holding;
        if (mopBubbles.visible) mopBubbles.userData.step(dt, new THREE.Vector3(-2.3, 0.5, 1.6), 0.14, 0.2, 0.3);
        const gg = session?.gauge;
        if (gg && !gg.committed && session.step?.id === "wipe-down") {
          repaint(wipePanel.userData.face, (ctx, w, h) => {
            ctx.fillStyle = "rgba(6,20,12,0.9)"; ctx.fillRect(0, 0, w, h);
            ctx.fillStyle = gg.t >= 0.45 && gg.t <= 0.75 ? "#59c97b" : "#f2ae14"; ctx.fillRect(0, 0, w, 5);
            ctx.fillStyle = "#dff7e6";
            ctx.font = `600 ${Math.round(h * 0.14)}px 'Barlow Condensed', Arial, sans-serif`;
            ctx.textAlign = "left"; ctx.textBaseline = "middle";
            ctx.fillText(`${(gg.t * 40).toFixed(0)} sec wet`, w * 0.08, h * 0.4);
            ctx.font = `${Math.round(h * 0.1)}px Arial, sans-serif`;
            ctx.fillText("per the label", w * 0.08, h * 0.72);
          });
        }
        void t;
      },
    };
  },
};
