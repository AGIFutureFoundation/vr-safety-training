import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import { box, cyl, ball, group, decal, repaint, signFace, paperFace, particles, hose, mat } from "../../../shared/kit.js";
import {
  CITY, stationPad, holoPanel, holoTag, instrument, cone, pipeRun,
  standingFigure, surfaceTexture, texturedMat, deckPlateFace, reg,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Kitchen Exhaust and Fire Wrap VR — Manufacturing &
// Automation, SMART sheet metal pack. A commercial kitchen's grease duct
// going in above the hood line: sections hung, the joint welded liquid-tight
// the way NFPA 96 wants it, light-tested for pinholes, a listed access door
// with listed sealant, the clearance to the joists measured, and the listed
// fire-wrap enclosure put on layer by layer. A grease duct is a chimney for
// a fryer fire. Every joint that is not liquid-tight is a place burning
// grease drips out of, every combustible inside the clearance is fuel, and
// the wrap is the only thing between that chimney and the floor above.

const SMKE_ACCENT = 0xd66a4a;

export const SIM_SM_KITCHEN_EXHAUST_AND_FIRE_WRAP = {
  id: "sm-kitchen-exhaust-and-fire-wrap",
  index: "224",
  domain: "Manufacturing & Automation",
  trade: "Sheet metal worker, kitchen ventilation — SMART, International Training Institute commercial kitchen exhaust curriculum",
  category: "Manufacturing & Automation",
  indoor: "kitchen",
  certification: "SMART and its International Training Institute commercial kitchen exhaust curriculum; NFPA 96 ventilation control and fire protection of commercial cooking operations for liquid-tight grease duct construction, access, clearance to combustibles and listed enclosure; AWS D9.1 Sheet Metal Welding Code for the continuous liquid-tight joint weld; OSHA 29 CFR 1910.252 welding, cutting and brazing and NFPA 51B fire watch for hot work above a cooking line; 29 CFR 1910.134 respiratory protection for the wrap fibre; the wrap and access door listings",
  name: "Kitchen Exhaust and Fire Wrap",
  title: simTitle("Kitchen Exhaust and Fire Wrap"),
  tagline: "The listing read against NFPA 96, the section hung, the joint welded liquid-tight and light-tested, a listed door with listed sealant, clearance measured, the wrap put on layer by layer, the cleanout labelled and the run logged",
  accent: SMKE_ACCENT,
  accentCss: "#d66a4a",
  parSeconds: 290,
  footprint: 2.2,
  badge: { id: "liquid-tight", name: "Liquid Tight", note: "A grease duct joint welded continuous, light-tested and wrapped to its listing, with the fire watch on post through the arc" },

  // Named for the guide's end-of-run check-in card (shared/ei-guide.js).
  supportLine: "your SMART local's training coordinator or the job steward, or your employer's employee assistance program if the fan starting with you at the duct is what stayed with you",

  game: system({
    name: "Hood Line",
    currency: "JOINT",
    ranks: ["Pre-apprentice", "Hood Hand", "Grease Duct Installer", "Kitchen Vent Lead", "Hood Line Certified"],
    badges: [
      { id: "listing-read", name: "Listing Read", note: "The duct and wrap listing read before the first section went up", test: AWARD.stepClean("listing-read") },
      { id: "nothing-unlisted", name: "Nothing Unlisted", note: "No unsafe action: listed sealant, no screws, nothing combustible in the clearance", test: AWARD.safe },
      { id: "clearance-held", name: "Clearance Held", note: "Clearance to combustibles measured inside the band", test: AWARD.precise(0.7) },
    ],
    challenges: [
      { id: "clean-joint", name: "Clean Joint", note: "One joint, no corrections", test: AWARD.clean },
      { id: "continuous-weld", name: "Continuous Weld", note: "The joint weld never dropped out of band", test: AWARD.unbroken },
      { id: "run-in-time", name: "Run In Time", note: "Welded, wrapped and logged inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "unlisted-sealant": "You reached for the general-purpose silicone to seal the access door. NFPA 96 has the door and its gasket or sealant listed for grease duct service, at the temperature a duct fire reaches; a hardware-store tube softens, drips and burns, and the door it was sealing becomes an opening in a chimney full of burning grease. The listed tube is the one on the cart with the door's listing on it.",
    "joist-contact": "You let the duct rest against the timber joist above it. NFPA 96 puts a clearance between a grease duct and anything combustible for exactly the day the duct is a fire, and a joist in contact with the duct is fuel with no distance at all; the clearance is measured and held by the hangers, or the listed enclosure is what makes a reduced clearance legal. Neither is a duct leaning on wood.",
    "screw-joint": "You went to fix the joint with sheet metal screws. A screw through a grease duct is a hole through a grease duct, and grease finds every one of them; NFPA 96 wants the joints welded or brazed liquid-tight, or made with a listed joint system, for the reason that a duct fire follows the grease that leaked out of the seams. Screws stay on the cart for the wrap banding, not the duct.",
    "solvent-can": "You left the open can of degreaser on the hood top under the joint you are about to weld. The hood, the fryers under it and the grease in the old duct are already enough fuel above a cooking line for a fire watch to be posted; an open solvent can within reach of spatter is a fire that starts before the arc has finished. Closed, off the hood, out of the room.",
  },

  lateNotes: {
    "duct-welder": "The joint is welded after the section is hung and the fit-up is tight all round — a bead run on a section still swinging on the jack is a weld with a gap under it.",
    "wrap-layer-one": "The wrap goes on after the light test says the joint is tight. A wrapped pinhole is a pinhole nobody will find until the fire does.",
  },

  steps: [
    {
      id: "check-in", kind: "select", target: "kitchen-board",
      title: "Check in with the kitchen crew",
      cue: "Sign onto the board, confirm the cooking line is shut down and cold, and who your fire watch is for the weld.",
      why: "A grease duct goes in above a kitchen that other people are trying to open, and the board is how the sheet metal crew, the kitchen's manager and the fire watch agree on the same afternoon: the line cold and off, the fryers covered, the exhaust fan locked out, the watch named. SMART kitchen crews sign it before a ladder is opened, because hot work above a hood with a live fryer under it is a fire with a start time.",
    },
    {
      id: "listing-read", kind: "select", target: "grease-duct-spec",
      title: "Read the duct and wrap listing against NFPA 96",
      cue: "Duct gauge and weld, the wrap system's listing and its layers, the reduced clearance the listing allows, the access door listing and its sealant.",
      why: "NFPA 96 sets the grease duct's construction — liquid-tight welded or brazed joints in the gauge it gives — and its clearance to combustibles, and the wrap's listing is what allows that clearance to be reduced to what the ceiling actually has. A duct installed from habit rather than the listing has the wrong number of wrap layers, the wrong clearance or a door sealed with the wrong thing, and every one of those passes a glance and fails a fire.",
    },
    {
      id: "ppe", kind: "sequence", anyOrder: true,
      targets: ["wrap-respirator", "wrap-gloves", "wrap-glasses"],
      itemNames: { "wrap-respirator": "respirator for the wrap fibre", "wrap-gloves": "gloves", "wrap-glasses": "safety glasses" },
      title: "Dress for the weld and the wrap",
      cue: "Respirator for the wrap's fibre, gloves for the duct edges and the hot joint, glasses for both.",
      why: "The wrap is a mineral-fibre blanket that sheds when it is cut, and the respirator under 29 CFR 1910.134 is for that fibre in a ceiling space with no air movement; the gloves are for a grease duct's welded edges and a joint that is hot for an hour after the arc. The glasses cover the arc's spatter and the fibre both, and all three go on before the first section, because the ceiling space is not a place to come back down from for a mask.",
    },
    {
      id: "section-hang", kind: "drag", target: "grease-duct-section",
      title: "Hang the section on its hangers",
      cue: "Bring the section up on the jack and set it into the hangers so the flanges meet the last section square and tight all round.",
      why: "The joint is only weldable liquid-tight if the two sections meet square with no gap, and the section is set into its hangers so the hangers carry it while the joint is fitted — not the jack, not a hand. NFPA 96 wants the duct supported so the joints never carry the duct's weight, because a welded joint under load cracks along the bead with the first thermal cycle and the crack is where the grease goes.",
      drag: { to: "duct-hanger-set", radius: 0.45, missNote: "The section is not in its hangers — a joint fitted with the section on the jack is a joint that moves when the jack does." },
    },
    {
      id: "weld-joint", kind: "track", target: "duct-welder", seconds: 6,
      title: "Weld the joint liquid-tight",
      cue: "Fire watch on post, then a continuous bead all the way round the joint at a steady travel — no stops, no skips, no restarts left open.",
      why: "NFPA 96 asks for a liquid-tight joint because grease runs, and a bead with a skip in it is a joint that leaks at exactly the point where the fire starts; the weld is continuous round the whole flange under AWS D9.1 at a travel that fuses both sections without burning through the gauge. The fire watch is on post before the arc because the hood and the old duct below are lined with the fuel the joint is being welded to contain.",
      track: { label: "TRAVEL", green: [0.42, 0.62], rise: 0.56, fall: 0.44, drift: 0.12, readout: (v) => `${Math.round(v * 400)} mm/min` },
      holdBreakNote: "The travel dropped out of band — a cold stretch that did not fuse or a burn-through in the gauge. Grind it and run that length again.",
    },
    {
      id: "light-test", kind: "hold", target: "inspection-lamp", seconds: 4,
      title: "Light-test the joint for pinholes",
      cue: "Lamp inside the duct at the joint, room lights down, and hold it while you look round the whole seam from outside for light coming through.",
      why: "A pinhole in a grease duct weld is a hole grease finds within a week and fire finds within a year, and it is invisible from outside in a lit room; the light test puts the lamp inside and darkens the room so any gap shows as a point of light. The lamp is held through the whole seam because the pinhole is at the one place you stopped looking, and it is done before the wrap goes on, because a wrapped pinhole is found by the fire.",
      holdBreakNote: "You pulled the lamp before the whole seam had been looked at — the pinhole is in the part you did not see. Hold it and go round again.",
    },
    {
      id: "sealant-pick", kind: "select", target: "listed-sealant",
      title: "Pick the listed sealant for the access door",
      cue: "The tube with the door's listing on it, from the cart — not the general-purpose silicone beside it.",
      why: "The access door is a hole in a grease duct that has to seal as tight as the weld and open for cleaning, and NFPA 96 wants it and whatever seals it listed for grease duct service; the listed sealant holds at the temperature of a duct fire and the general-purpose tube does not. The tube is read, not recognised by colour, because the two look the same on a cart and only one of them is legal on this duct.",
    },
    {
      id: "door-latch", kind: "turn", target: "access-door-latch",
      title: "Fit the access door and torque the latches",
      cue: "Door on its gasket, then each latch turned down to the listing's torque so the gasket seats evenly all round.",
      why: "The access door seals on its gasket only if the latches draw it down evenly, and the listing gives the torque because a latch overdriven distorts the frame and one underdriven leaves a corner lifted; both leak grease in service and both fail the fire. The latches are turned in sequence round the door rather than one side at a time, so the gasket compresses flat instead of pinching along one edge.",
      turn: { turns: 1, axis: "z", label: "LATCH" },
    },
    {
      id: "clearance", kind: "gauge", target: "clearance-tape",
      title: "Measure the clearance to the joists",
      cue: "Tape from the duct's outer skin to the nearest combustible, commit inside the clearance the wrap's listing allows.",
      why: "NFPA 96 gives the clearance a bare grease duct needs from anything combustible, and the wrap's listing gives the smaller clearance it earns once wrapped; the tape is what proves the duct hangs inside that number at the closest joist, not at the joist that happens to be in front of you. A clearance short by a hand's width is a joist that chars every time the fryers run and lights the day the duct fire comes.",
      gauge: { label: "CLEARANCE", speed: 0.72, green: [0.46, 0.62], readout: (t) => `${Math.round(t * 120)} mm`, missNote: "Outside the listing's clearance — under it is fuel in reach of the fire, over it is a hanger that does not match the drawing. Reset the hangers." },
    },
    {
      id: "wrap", kind: "sequence",
      targets: ["wrap-layer-one", "wrap-layer-two", "wrap-banding"],
      itemNames: { "wrap-layer-one": "first layer, foil out, seams overlapped", "wrap-layer-two": "second layer, seams offset", "wrap-banding": "banding and pins" },
      title: "Wrap the joint to the listing",
      cue: "First layer with its seams overlapped as the listing says, second layer with its seams offset from the first, then banding and pins at the listed spacing.",
      why: "The wrap's listing is a construction, not a blanket: the first layer's overlaps, the second layer's seams offset so no gap lines up through both, and the banding and pins at a spacing that keeps the layers in place when the duct expands in a fire. A wrap put on in one layer, or with the seams stacked, is a wrap that opens along the seam at the temperature it was listed to survive, and the listing is void the moment the layers are wrong.",
      outOfOrderNote: "First layer, second layer, then banding — the banding holds a two-layer enclosure, and a band over one layer leaves the second with nothing to hold it.",
    },
    {
      id: "wrap-walk", kind: "find", noHint: true,
      targets: ["wrap-gap", "pin-missing"],
      itemNames: { "wrap-gap": "a gap in the wrap at the hanger", "pin-missing": "a missing pin at the seam" },
      itemNotes: {
        "wrap-gap": "The wrap has been cut round the hanger rod and left open — that is bare duct inside the enclosure, with the joist a hand's width away.",
        "pin-missing": "The seam over the top has no pin for half a metre. It will open when the duct moves, which it will the first time the fryers come on.",
      },
      title: "Walk the enclosure before the ceiling closes",
      cue: "Look along the wrapped run from both sides and click the two places the enclosure is not an enclosure.",
      why: "The wrap is inspected by the crew that put it on, from a ladder, before the ceiling closes over it — because the ceiling is the last time anyone sees it. A gap at a hanger and a seam with no pins are the two faults that turn a listed enclosure into a blanket with holes, and they are fixed now in minutes or found by the fire investigator in a year.",
    },
    {
      id: "cleanout-label", kind: "select", target: "cleanout-label",
      title: "Label the cleanout",
      cue: "Mark the access door's location on the enclosure and the ceiling below it, so the hood cleaner can find it without opening the wrap.",
      why: "A grease duct is cleaned through its access doors on a schedule NFPA 96 sets by how much the kitchen cooks, and a door the cleaning crew cannot find is a door that is never opened; the grease builds up behind it until the duct is the fire. The label on the enclosure and the ceiling tile is what makes the door part of the building's maintenance rather than a secret the installer took with them.",
    },
    {
      id: "hood-walk", kind: "find", noHint: true,
      targets: ["hood-filter-gap", "fan-drain-missing"],
      itemNames: { "hood-filter-gap": "a gap in the hood's filter bank", "fan-drain-missing": "the fan's grease drain not connected" },
      itemNotes: {
        "hood-filter-gap": "One grease filter is missing from the hood — there is a straight path for flame from the fryer into the duct with nothing to stop it.",
        "fan-drain-missing": "The up-blast fan's grease drain has no cup under it; the grease it throws off runs onto the roof and back down the duct's outside.",
      },
      title: "Walk the hood and the fan before hand-over",
      cue: "The duct is one part of the system NFPA 96 describes — look at the hood below and the fan above and click the two faults that make the new duct pointless.",
      why: "A liquid-tight duct between a hood with a missing filter and a fan with no grease drain is a good pipe in a bad system, and NFPA 96 describes the whole of it: filters that stop flame, a duct that holds grease, a fan that drains it. The sheet metal crew looks at the ends because the crew that hung the duct is the one standing under the hood with a ladder and the drawing.",
    },
    {
      id: "exhaust-log", kind: "select", target: "exhaust-log",
      title: "Log the run for the inspector",
      cue: "Sections and joints welded, the light test, the door and sealant listing, the clearance measured, the wrap layers, the faults found, and sign it.",
      why: "The grease duct is inspected against NFPA 96 before the ceiling closes and again when the kitchen opens, and the log is how the inspector sees what the ceiling now hides: the weld and the light test on each joint, the listing on the door and its sealant, the clearance measured at the closest joist, the wrap layers. It is also where the missing filter and the fan drain go, so the hood cleaner and the kitchen inherit the faults as a list rather than a fire.",
    },
  ],

  interrupts: [
    {
      id: "fire-watch-gone",
      kind: "Fire watch off post",
      after: "weld-joint", delay: 3, seconds: 12,
      alert: "The fire watch has walked off to the loading dock. The hood a foot below your weld is lined with grease and there is nobody watching it.",
      cue: "You are welding above a fryer hood with no watch under you.",
      target: "watch-radio",
      why: "The fire watch under NFPA 51B and 29 CFR 1910.252 stands where the spatter lands, and above a hood line that is the greasiest surface in the building. A welder in a hood cannot see the grease trough smoulder; the watch can, and a watch on the loading dock can see nothing. The radio brings them back before the arc goes on again, and the bead waits — grease in a hood trough does not.",
      missNote: "You finished the joint with nobody under the hood. The trough did not catch that time. Hood fires start in the grease trough from a single spark and run up the duct faster than a person can climb down a ladder, which is the whole reason NFPA 96 puts a fire watch there for hot work.",
      wrongNote: "It is the radio. Call the watch back under the hood — nothing else on the ladder sees the trough.",
    },
    {
      id: "fan-starts",
      kind: "Fan started with you in the run",
      after: "light-test", delay: 3, seconds: 12,
      alert: "The exhaust fan has started upstream. Somebody at the hood has switched it on while your arm and the lamp are in the open duct.",
      cue: "The duct you are inside has just become a live exhaust system.",
      target: "fan-disconnect",
      why: "A grease duct with a section open and a person inside it is a duct that has to be locked out at the fan's disconnect, not switched off at the hood; the hood switch is what somebody just used to start it. The disconnect is thrown, the lock goes on, and the light test starts again. The fan pulling on an open duct is the fan pulling grease, fibre and whatever is loose in the run past your face and the lamp.",
      missNote: "You held the lamp and finished the test with the fan running on the open duct. It pulled the wrap offcuts and the old grease up the run past you. The fan was supposed to be locked out at its disconnect before anybody's arm went into the duct, and a switch at the hood is not a lockout.",
      wrongNote: "It is the fan disconnect on the roof curb. Kill the fan and lock it — the hood switch is what started it.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.2, SMKE_ACCENT);

    const floor = box(g, 6.4, 0.06, 6.2, 0, 0.03, -0.3, 0x7a3a2a, { rough: 0.9, cast: false });
    floor.material = texturedMat(
      surfaceTexture((cx, w, h) => deckPlateFace(cx, w, h, { base: "#6a3b2c", base2: "#5a3022", step: 32 }), { repeat: 5, px: 512 }),
      { rough: 0.95, metal: 0.05 });

    // ------------------------------------------------------ the hood line
    // The cooking line under the hood: fryers, range, the hood with its
    // filter bank (one missing), the grease trough, the solvent can.
    const line = group(g, 0, 0.06, -2.2);
    for (let i = 0; i < 3; i++) box(line, 0.8, 0.9, 0.8, -1.2 + i * 1.0, 0.45, 0, 0xc8ced3, { rough: 0.35, metal: 0.8 });
    for (let i = 0; i < 2; i++) { box(line, 0.5, 0.3, 0.5, -1.35 + i * 0.35, 0.95, 0, 0x2b2f34, { rough: 0.6, metal: 0.5 }); }
    for (let i = 0; i < 4; i++) cyl(line, 0.12, 0.12, 0.02, 0.6 + (i % 2) * 0.3, 0.91, -0.2 + Math.floor(i / 2) * 0.35, 0x1b1e22, { rough: 0.8, seg: 16 });
    holoTag(line, "cooking line — cold and off", -0.2, 1.2, 0.5, { css: "#d66a4a", w: 0.44 });
    const hood = group(line, -0.2, 2.0, 0);
    box(hood, 3.4, 0.5, 1.2, 0, 0, 0, 0xb9bec4, { rough: 0.35, metal: 0.8 });
    box(hood, 3.4, 0.06, 0.2, 0, -0.28, 0.5, 0x8a949d, { rough: 0.4, metal: 0.7 });
    const filters = [];
    for (let i = 0; i < 6; i++) {
      if (i === 3) continue;
      const f = box(hood, 0.5, 0.36, 0.03, -1.35 + i * 0.54, -0.05, 0.3, 0xdfe3e6, { rough: 0.5, metal: 0.5 });
      f.rotation.x = 0.5; filters.push(f);
    }
    const filterGap = box(hood, 0.5, 0.36, 0.03, -1.35 + 3 * 0.54, -0.05, 0.3, 0xd2312b, { rough: 0.5, opacity: 0.3, transparent: true, cast: false });
    filterGap.rotation.x = 0.5;
    reg(hits, filterGap, "hood-filter-gap");
    const trough = box(hood, 3.2, 0.06, 0.12, 0, -0.26, 0.42, 0x4a3a2a, { rough: 0.6, metal: 0.4 });
    holoTag(hood, "grease trough", 0, -0.45, 0.6, { css: "#d66a4a", w: 0.28 });
    const solvent = group(hood, 1.4, 0.3, 0.3);
    cyl(solvent, 0.08, 0.08, 0.2, 0, 0, 0, 0xe8b02e, { rough: 0.5, metal: 0.3, seg: 14 });
    decal(solvent, 0.12, 0.08, 0.081, 0, 0, signFace("DEGREASER", { bg: "#e8b02e", accent: "#22262b", fg: "#22262b", scale: 0.4 }));
    reg(hits, solvent, "solvent-can");
    holoTag(hood, "open solvent — off the hood", 1.4, 0.55, 0.3, { css: "#d2312b", w: 0.44 });
    const smoulder = particles(hood, 20, 0x8a8a8a, { size: 0.04, spread: 0.4 });
    smoulder.position.set(-0.4, -0.2, 0.42); smoulder.visible = false;

    // ------------------------------------------------- the duct and joists
    // Timber joists over the kitchen with the grease duct run rising off the
    // hood collar and going horizontal below them; the new section on the
    // jack, the hanger set waiting, the joint, the door, the wrap.
    const ceiling = group(g, 0, 0.06, -0.6);
    for (let i = 0; i < 7; i++) box(ceiling, 0.08, 0.3, 6.0, -2.7 + i * 0.9, 3.05, -0.4, 0x8b6a42, { rough: 0.9, cast: false });
    box(ceiling, 6.4, 0.04, 6.0, 0, 3.22, -0.4, 0xa88a5a, { rough: 0.95, cast: false });
    holoTag(ceiling, "timber joists — combustible", 1.5, 2.8, 1.2, { css: "#d2312b", w: 0.44 });
    const riser = box(ceiling, 0.5, 0.9, 0.5, -0.2, 2.25, -1.6, 0x9aa3a8, { rough: 0.35, metal: 0.8 });
    const existing = box(ceiling, 2.45, 0.5, 0.5, -0.975, 2.45, -0.6, 0x9aa3a8, { rough: 0.35, metal: 0.8 });
    box(ceiling, 0.06, 0.6, 0.6, 0.22, 2.45, -0.6, 0x7c868f, { rough: 0.4, metal: 0.7 });            // existing flange
    for (const sx of [-1.9, -0.6]) for (const sz of [-0.86, -0.34]) cyl(ceiling, 0.008, 0.008, 0.6, sx, 2.9, sz, 0x8a8f94, { rough: 0.4, metal: 0.7, seg: 6 });
    for (const sx of [-1.9, -0.6]) box(ceiling, 0.06, 0.04, 0.7, sx, 2.2, -0.6, 0x7c868f, { rough: 0.5, metal: 0.6 });
    const joistContact = box(ceiling, 0.5, 0.1, 0.5, -0.9, 2.82, -0.6, 0xd2312b, { rough: 0.5, opacity: 0.3, transparent: true, cast: false });
    reg(hits, joistContact, "joist-contact");
    holoTag(ceiling, "duct on the joist — no", -0.9, 2.72, -0.1, { css: "#d2312b", w: 0.4 });
    // The hanger set for the new section, and the socket.
    const hangerSet = group(ceiling, 0.78, 0, -0.6);
    for (const sx of [-0.4, 0.4]) for (const sz of [-0.26, 0.26]) cyl(hangerSet, 0.008, 0.008, 0.6, sx, 2.9, sz, 0x8a8f94, { rough: 0.4, metal: 0.7, seg: 6 });
    for (const sx of [-0.4, 0.4]) box(hangerSet, 0.06, 0.04, 0.7, sx, 2.2, 0, 0x7c868f, { rough: 0.5, metal: 0.6 });
    const socket = box(hangerSet, 1.0, 0.5, 0.5, 0, 2.45, 0, 0xffffff, { rough: 0.5 });
    socket.visible = false; hits["duct-hanger-set"] = socket;
    holoTag(hangerSet, "hanger set — new section", 0, 2.7, 0.4, { css: "#d66a4a", w: 0.4 });
    // The joint between existing and new, its bead, and the pinhole.
    const joint = group(ceiling, 0.25, 2.45, -0.6);
    const flangeNew = box(joint, 0.06, 0.6, 0.6, 0.06, 0, 0, 0x7c868f, { rough: 0.4, metal: 0.7 });
    flangeNew.visible = false;
    const bead = box(joint, 0.02, 0.62, 0.62, 0.03, 0, 0, 0xc8b070, { rough: 0.4, metal: 0.7 });
    bead.visible = false;
    const pinhole = ball(joint, 0.012, 0.03, 0.2, 0.31, 0xfff3d6, { emissive: 0xfff3d6, ei: 2.5 });
    pinhole.visible = false;
    const screwBox = group(g, 1.9, 0.06, 1.0, -0.3);
    box(screwBox, 0.24, 0.1, 0.16, 0, 0.75, 0, 0xe8b02e, { rough: 0.7 });
    for (let i = 0; i < 5; i++) cyl(screwBox, 0.004, 0.004, 0.04, -0.08 + i * 0.04, 0.82, 0, 0x8a8f94, { rough: 0.4, metal: 0.7, seg: 6 });
    reg(hits, screwBox, "screw-joint");
    // The access door on the new section, its latches, the label.
    const door = group(ceiling, 0.9, 2.45, -0.34);
    const doorPlate = box(door, 0.34, 0.26, 0.02, 0, 0, 0.02, 0xaeb5bb, { rough: 0.35, metal: 0.7 });
    doorPlate.visible = false;
    const latches = [];
    for (const [sx, sy] of [[-0.12, 0.09], [0.12, 0.09], [-0.12, -0.09], [0.12, -0.09]]) latches.push(box(door, 0.03, 0.03, 0.02, sx, sy, 0.04, 0xb8402f, { rough: 0.5, metal: 0.4 }));
    const latchHit = box(door, 0.34, 0.26, 0.06, 0, 0, 0.04, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, latchHit, "access-door-latch");
    holoTag(ceiling, "listed access door", 0.9, 2.15, -0.2, { css: "#d66a4a", w: 0.34 });
    const label = decal(door, 0.2, 0.06, 0, -0.18, 0.03, signFace("GREASE DUCT CLEANOUT", { bg: "#f2c14b", accent: "#22262b", fg: "#22262b", scale: 0.4 }));
    label.visible = false;
    const labelHit = box(door, 0.22, 0.08, 0.04, 0, -0.18, 0.03, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, labelHit, "cleanout-label");
    // The wrap layers and banding, hidden until put on; the gap and missing pin.
    const wrap1 = box(ceiling, 1.1, 0.62, 0.62, 0.9, 2.45, -0.6, 0xc9c2b0, { rough: 0.95 });
    const wrap2 = box(ceiling, 1.1, 0.7, 0.7, 0.9, 2.45, -0.6, 0xd9d2c0, { rough: 0.95 });
    wrap1.visible = false; wrap2.visible = false;
    const bands = group(ceiling, 0.9, 2.45, -0.6);
    for (const sx of [-0.4, 0, 0.4]) box(bands, 0.02, 0.74, 0.74, sx, 0, 0, 0x8a8f94, { rough: 0.4, metal: 0.7 });
    bands.visible = false;
    const wrapGap = box(ceiling, 0.12, 0.72, 0.1, 0.5, 2.45, -0.26, 0xd2312b, { rough: 0.5, opacity: 0.35, transparent: true, cast: false });
    wrapGap.visible = false;
    reg(hits, wrapGap, "wrap-gap");
    const pinMissing = box(ceiling, 0.5, 0.03, 0.06, 1.15, 2.81, -0.6, 0xd2312b, { rough: 0.5, opacity: 0.4, transparent: true, cast: false });
    pinMissing.visible = false;
    reg(hits, pinMissing, "pin-missing");
    // Clearance tape between duct top and joist.
    const tape = instrument(ceiling, 1.4, 2.6, -0.2, { ry: 0.3, idle: "-- mm", color: 0xd66a4a, w: 0.1, d: 0.14 });
    reg(hits, tape, "clearance-tape");
    holoTag(ceiling, "clearance tape", 1.4, 2.4, 0.0, { css: "#d66a4a", w: 0.28 });
    // The up-blast fan on its curb above the joists, with the disconnect and the drain.
    const fanCurb = group(g, -0.2, 0.06, -2.8);
    box(fanCurb, 0.9, 0.3, 0.9, 0, 3.4, 0, 0x50606c, { rough: 0.6, metal: 0.4, cast: false });
    cyl(fanCurb, 0.4, 0.45, 0.5, 0, 3.8, 0, 0x3a4048, { rough: 0.5, metal: 0.5, seg: 20, cast: false });
    const fanLamp = ball(fanCurb, 0.03, 0.4, 3.9, 0.3, 0x3a4048, { rough: 0.5 });
    const fanDisc = group(fanCurb, 0.55, 3.45, 0.2, -0.3);
    box(fanDisc, 0.14, 0.2, 0.08, 0, 0, 0, 0x22262b, { rough: 0.6 });
    const discHandle = box(fanDisc, 0.02, 0.1, 0.02, 0.04, 0.02, 0.05, 0xd2312b, { rough: 0.5 });
    decal(fanDisc, 0.14, 0.04, 0, 0.13, 0.041, signFace("EF-1 DISC", { bg: "#22262b", accent: "#d66a4a", scale: 0.5 }));
    reg(hits, fanDisc, "fan-disconnect");
    holoTag(fanCurb, "exhaust fan disconnect", 0.55, 3.75, 0.2, { css: "#d66a4a", w: 0.4 });
    const drainStub = cyl(fanCurb, 0.02, 0.02, 0.12, -0.45, 3.35, 0.3, 0x8a8f94, { rough: 0.4, metal: 0.7, seg: 8 });
    drainStub.rotation.z = Math.PI / 2;
    const drainMissing = box(fanCurb, 0.16, 0.12, 0.16, -0.6, 3.25, 0.3, 0xd2312b, { rough: 0.5, opacity: 0.35, transparent: true, cast: false });
    reg(hits, drainMissing, "fan-drain-missing");
    holoTag(fanCurb, "grease drain — no cup", -0.6, 3.55, 0.4, { css: "#d2312b", w: 0.34 });

    // ---------------------------------------------- the jack and the cart
    const jack = group(g, 1.4, 0.06, 0.6, 0.2);
    box(jack, 0.8, 0.1, 0.8, 0, 0.05, 0, 0x2f6f8c, { rough: 0.6, metal: 0.4 });
    for (const [sx, sz] of [[-0.35, -0.35], [0.35, -0.35], [-0.35, 0.35], [0.35, 0.35]]) cyl(jack, 0.05, 0.05, 0.03, sx, 0.03, sz, 0x1b1e22, { rough: 0.7, seg: 12 }).rotation.z = Math.PI / 2;
    cyl(jack, 0.04, 0.04, 1.5, 0, 0.85, 0, 0x8a8f94, { rough: 0.5, metal: 0.6, seg: 12 });
    const cradle = box(jack, 1.0, 0.04, 0.6, 0, 1.3, 0, 0x3a4048, { rough: 0.6, metal: 0.4 });
    const section = box(jack, 1.0, 0.5, 0.5, 0, 1.57, 0, 0x9aa3a8, { rough: 0.35, metal: 0.8 });
    reg(hits, section, "grease-duct-section");
    holoTag(jack, "16 ga grease duct section", 0, 1.95, 0, { css: "#d66a4a", w: 0.42 });
    const cart = group(g, -1.9, 0.06, 1.3, 0.4);
    box(cart, 1.0, 0.05, 0.6, 0, 0.7, 0, 0x2f6f8c, { rough: 0.6, metal: 0.4 });
    for (const [sx, sz] of [[-0.45, -0.25], [0.45, -0.25], [-0.45, 0.25], [0.45, 0.25]]) { box(cart, 0.04, 0.65, 0.04, sx, 0.35, sz, 0x3a4048, { rough: 0.6, metal: 0.5 }); cyl(cart, 0.05, 0.05, 0.03, sx, 0.05, sz, 0x1b1e22, { rough: 0.7, seg: 12 }).rotation.z = Math.PI / 2; }
    const listedTube = cyl(cart, 0.022, 0.022, 0.2, -0.3, 0.83, 0.1, 0xd66a4a, { rough: 0.6, seg: 12 });
    decal(cart, 0.08, 0.05, -0.3, 0.83, 0.123, signFace("LISTED", { bg: "#d66a4a", accent: "#fff", fg: "#fff", scale: 0.5 }));
    reg(hits, listedTube, "listed-sealant");
    holoTag(cart, "listed grease duct sealant", -0.3, 1.05, 0.1, { css: "#d66a4a", w: 0.44 });
    const gpTube = cyl(cart, 0.022, 0.022, 0.2, -0.05, 0.83, 0.1, 0xe8e2d0, { rough: 0.6, seg: 12 });
    reg(hits, gpTube, "unlisted-sealant");
    holoTag(cart, "general-purpose silicone", -0.05, 1.18, 0.1, { css: "#d2312b", w: 0.4 });
    const wrapRoll = cyl(cart, 0.14, 0.14, 0.5, 0.3, 0.86, 0, 0xc9c2b0, { rough: 0.95, seg: 16 });
    wrapRoll.rotation.x = Math.PI / 2;
    holoTag(cart, "listed wrap — 2 layers", 0.3, 1.12, 0, { css: "#d66a4a", w: 0.36 });
    const rollHit = box(cart, 0.5, 0.3, 0.3, 0.3, 0.86, 0, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, rollHit, "wrap-layer-one");
    const roll2 = cyl(cart, 0.12, 0.12, 0.5, 0.3, 0.86, -0.32, 0xd9d2c0, { rough: 0.95, seg: 16 });
    roll2.rotation.x = Math.PI / 2;
    reg(hits, roll2, "wrap-layer-two");
    const bandCoil = cyl(cart, 0.1, 0.1, 0.03, -0.4, 0.75, -0.2, 0x8a8f94, { rough: 0.4, metal: 0.7, seg: 16 });
    reg(hits, bandCoil, "wrap-banding");
    // The welder on the floor, its torch on the jack, the lamp, the radio.
    const welder = group(g, 2.4, 0.06, -0.6, -0.9);
    box(welder, 0.5, 0.6, 0.4, 0, 0.35, 0, 0x2f4a6a, { rough: 0.6, metal: 0.3 });
    decal(welder, 0.4, 0.12, 0, 0.55, 0.21, signFace("GTAW · 200 A", { bg: "#0d1c24", accent: "#d66a4a", scale: 0.5 }));
    const torch = group(jack, 0.4, 1.36, 0.35);
    cyl(torch, 0.018, 0.018, 0.18, 0, 0.09, 0, 0x22262b, { rough: 0.5, seg: 10 });
    cyl(torch, 0.012, 0.012, 0.05, 0, 0.2, 0, 0xf2c6a0, { rough: 0.4, seg: 10 });
    reg(hits, torch, "duct-welder");
    holoTag(jack, "TIG torch", 0.4, 1.7, 0.35, { css: "#d66a4a", w: 0.22 });
    hose(g, [[1.8, 1.4, 0.95], [2.2, 0.9, 0.3], [2.4, 0.6, -0.4]], 0.012, 0x2b2f34, { steps: 12 });
    const arc = ball(joint, 0.025, 0.05, 0.25, 0.32, 0xbfeaff, { emissive: 0xbfeaff, ei: 3.0 });
    arc.visible = false;
    const lamp = group(g, -0.6, 0.06, 0.9, 0.3);
    cyl(lamp, 0.03, 0.03, 0.3, 0, 0.9, 0, 0xf2c14b, { rough: 0.6, seg: 10 });
    ball(lamp, 0.045, 0, 1.08, 0, 0xfff3d6, { emissive: 0xfff3d6, ei: 1.2, rough: 0.5 });
    cyl(lamp, 0.02, 0.02, 0.75, 0.2, 0.4, 0, CITY.darkSteel, { rough: 0.5, metal: 0.6, seg: 8 });
    box(lamp, 0.4, 0.04, 0.4, 0.2, 0.04, 0, 0x2b2f34, { rough: 0.6 });
    reg(hits, lamp, "inspection-lamp");
    holoTag(lamp, "inspection lamp", 0, 1.3, 0, { css: "#d66a4a", w: 0.3 });
    const radio = group(g, 2.2, 1.3, 1.6, -0.9);
    cyl(g, 0.02, 0.02, 1.3, 2.2, 0.65, 1.6, CITY.darkSteel, { rough: 0.5, metal: 0.6, seg: 8 });
    box(radio, 0.06, 0.12, 0.04, 0, 0, 0, 0x22262b, { rough: 0.6 });
    cyl(radio, 0.006, 0.006, 0.1, 0.015, 0.1, 0, 0x1b1e22, { rough: 0.5, seg: 6 });
    ball(radio, 0.008, -0.015, 0.03, 0.022, 0x59c97b, { emissive: 0x59c97b, ei: 1.5 });
    reg(hits, radio, "watch-radio");
    holoTag(g, "fire watch radio", 2.2, 1.5, 1.6, { css: "#d66a4a", w: 0.3 });

    // -------------------------------------------------- board, spec, PPE, log
    const board = group(g, -2.8, 0.06, -0.4, 1.3);
    box(board, 0.9, 0.7, 0.04, 0, 1.45, 0, 0x1b2026, { rough: 0.6 });
    const boardFace = decal(board, 0.84, 0.64, 0, 1.45, 0.025, paperFace("KITCHEN — TODAY", ["Sheet metal: apprentice (you) + lead", "Fire watch: helper — hood line", "Cooking line: OFF, cold, covered", "EF-1: lock out at disconnect", "Hood cleaner: Friday"], { bg: "#eef1f3", band: "#d66a4a" }), { px: 384 });
    reg(hits, boardFace, "kitchen-board");
    for (const sx of [-0.4, 0.4]) cyl(board, 0.02, 0.02, 1.8, sx, 0.9, -0.02, CITY.darkSteel, { rough: 0.5, metal: 0.6, seg: 10 });
    holoPanel(g, 0.72, 0.5, -1.2, 1.7, 2.4, (ctx, w, h) => {
      ctx.fillStyle = "#170c08"; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#d66a4a"; ctx.fillRect(0, 0, w, 6);
      ctx.font = `600 ${Math.round(h * 0.13)}px 'Barlow Condensed', Arial, sans-serif`; ctx.textAlign = "left"; ctx.textBaseline = "middle"; ctx.fillStyle = "#fbe4da";
      ctx.fillText("GREASE DUCT — NFPA 96 · LISTING", w * 0.06, h * 0.16);
      ctx.font = `${Math.round(h * 0.09)}px Arial, sans-serif`;
      ["Duct: 16 ga steel, welded liquid-tight", "Wrap: listed, 2 layers, seams offset", "Clearance: 18 in. bare · per listing wrapped", "Door: listed, gasket + listed sealant", "Fire watch through hot work"].forEach((l, i) => ctx.fillText(l, w * 0.06, h * (0.34 + i * 0.13)));
    }, { accent: SMKE_ACCENT, ry: -0.3 });
    const specHit = box(g, 0.72, 0.5, 0.04, -1.2, 1.7, 2.4, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    specHit.rotation.y = -0.3;
    reg(hits, specHit, "grease-duct-spec");
    const ppe = group(g, 2.8, 0.06, 0.4, -1.4);
    box(ppe, 0.6, 0.8, 0.16, 0, 1.25, 0, 0x2b2f34, { rough: 0.6 });
    decal(ppe, 0.54, 0.1, 0, 1.6, 0.085, signFace("PPE — WRAP · WELD", { bg: "#0d1c24", accent: "#d66a4a", scale: 0.5 }));
    const resp = group(ppe, -0.18, 1.35, 0.1);
    box(resp, 0.12, 0.1, 0.06, 0, 0, 0, 0x8a8f94, { rough: 0.6 });
    for (const sx of [-0.04, 0.04]) cyl(resp, 0.03, 0.03, 0.03, sx, -0.02, 0.04, 0xd66a4a, { rough: 0.6, seg: 10 }).rotation.x = Math.PI / 2;
    reg(hits, resp, "wrap-respirator");
    const gloves = group(ppe, 0.02, 1.35, 0.1);
    for (const sx of [-0.03, 0.03]) box(gloves, 0.05, 0.13, 0.02, sx, 0, 0, 0xb8863a, { rough: 0.8 });
    reg(hits, gloves, "wrap-gloves");
    const glasses = group(ppe, 0.2, 1.35, 0.1);
    box(glasses, 0.14, 0.04, 0.02, 0, 0, 0, 0xdfe9ee, { rough: 0.2, opacity: 0.6, transparent: true });
    reg(hits, glasses, "wrap-glasses");
    const logBoard = group(g, 2.85, 0.06, -1.6, -1.0);
    box(logBoard, 0.06, 1.0, 0.06, 0, 0.5, 0, CITY.darkSteel, { rough: 0.5, metal: 0.6 });
    const logFace = decal(logBoard, 0.34, 0.44, 0, 1.2, 0.02, paperFace("GREASE DUCT LOG", ["Joints welded: ____", "Light test: ____", "Door/sealant: ____", "Clearance / wrap: ____", "Signed: ____"], { bg: "#f4efe4", band: "#d66a4a" }), { px: 256 });
    reg(hits, logFace, "exhaust-log");
    holoTag(logBoard, "grease duct log", 0, 1.5, 0, { css: "#d66a4a", w: 0.3 });

    // ------------------------------------------------------------ the crew
    const watch = standingFigure(g, -2.0, -2.4, { ry: 1.0, cloth: 0x7a5a3a, trousers: 0x22262b, helmet: 0xf2c14b });
    const lead = standingFigure(g, 0.6, 2.5, { ry: 3.0, cloth: 0x3a5a7a, trousers: 0x2b2f34, helmet: 0xd66a4a, gloves: true });

    // -------------------------------------------------------- dressing
    for (const sx of [-1.8, 0.4, 2.2]) box(g, 0.6, 0.06, 0.2, sx, 2.85, 1.0, 0xfff7e0, { emissive: 0xfff7e0, ei: 1.0, rough: 0.5, cast: false });
    pipeRun(g, [[-3.2, 2.7, 2.4], [3.2, 2.7, 2.4]], 0.04, 0xb8402f, { seg: 8 });
    pipeRun(g, [[-3.2, 2.6, 2.6], [3.2, 2.6, 2.6]], 0.03, 0x2f6f8c, { seg: 8 });
    for (const [x, z] of [[-2.6, 2.4], [2.6, 2.6]]) cone(g, x, z);
    const ext = group(g, 2.9, 0.06, -2.6, -0.8);
    cyl(ext, 0.06, 0.07, 0.42, 0, 0.35, 0, 0xd2312b, { rough: 0.4, metal: 0.3, seg: 14 });
    cyl(ext, 0.025, 0.025, 0.08, 0, 0.6, 0, 0x22262b, { rough: 0.4, seg: 10 });
    holoTag(ext, "class K extinguisher", 0, 0.72, 0, { css: "#d2312b", w: 0.36 });
    const prepTable = group(g, -2.6, 0.06, 1.0, 0.9);
    box(prepTable, 1.4, 0.05, 0.7, 0, 0.9, 0, 0xc8ced3, { rough: 0.35, metal: 0.8 });
    for (const [sx, sz] of [[-0.6, -0.3], [0.6, -0.3], [-0.6, 0.3], [0.6, 0.3]]) cyl(prepTable, 0.02, 0.02, 0.9, sx, 0.45, sz, 0x8a8f94, { rough: 0.4, metal: 0.7, seg: 8 });
    box(prepTable, 1.2, 0.02, 0.5, 0, 0.93, 0, 0xdfe3e6, { rough: 0.9 });
    holoTag(prepTable, "prep table — covered", 0, 1.15, 0, { css: "#d66a4a", w: 0.34 });
    const ladder = group(g, 0.7, 0.06, 1.3, 0.2);
    for (const sx of [-0.22, 0.22]) { box(ladder, 0.04, 1.8, 0.04, sx, 0.9, 0.1, 0xf2c14b, { rough: 0.6 }).rotation.x = -0.18; box(ladder, 0.04, 1.8, 0.04, sx, 0.9, -0.3, 0x8a8f94, { rough: 0.5, metal: 0.6 }).rotation.x = 0.18; }
    for (let i = 0; i < 5; i++) box(ladder, 0.44, 0.03, 0.08, 0, 0.3 + i * 0.32, 0.13 - i * 0.055, 0xf2c14b, { rough: 0.6 });
    box(ladder, 0.5, 0.04, 0.2, 0, 1.82, -0.1, 0xf2c14b, { rough: 0.6 });
    const signBoard = group(g, 1.6, 0.06, 2.8, 3.1);
    box(signBoard, 0.5, 0.4, 0.03, 0, 1.4, 0, 0x1b2026, { rough: 0.6 });
    decal(signBoard, 0.44, 0.34, 0, 1.4, 0.018, signFace("LIQUID\nTIGHT OR\nNOT AT ALL", { bg: "#170c08", accent: "#d66a4a", fg: "#fbe4da", scale: 0.28 }));
    cyl(signBoard, 0.02, 0.02, 1.2, 0, 0.6, 0, CITY.darkSteel, { rough: 0.5, metal: 0.6, seg: 10 });

    let welding = false, fanOn = false;
    return {
      hits,
      spawnLook: new THREE.Vector3(0.3, 2.3, -1.2),
      onStep() {},
      onStepComplete(step) {
        if (step.id === "check-in") { solvent.visible = true; }
        if (step.id === "section-hang") { section.parent.remove(section); hangerSet.add(section); section.position.set(0, 2.45, 0); section.rotation.set(0, 0, 0); flangeNew.visible = true; }
        if (step.id === "weld-joint") { bead.visible = true; arc.visible = false; pinhole.visible = true; }
        if (step.id === "light-test") { pinhole.material = mat(0xc8b070, { rough: 0.4, metal: 0.7 }); }
        if (step.id === "sealant-pick") { listedTube.position.y = 0.95; }
        if (step.id === "door-latch") { doorPlate.visible = true; for (const l of latches) l.rotation.z = Math.PI / 2; }
        if (step.id === "wrap") { wrap1.visible = true; wrap2.visible = true; bands.visible = true; wrapGap.visible = true; pinMissing.visible = true; }
        if (step.id === "wrap-walk") { wrapGap.visible = false; pinMissing.visible = false; }
        if (step.id === "cleanout-label") { label.visible = true; wrap2.position.z = -0.6; }
        if (step.id === "hood-walk") { filterGap.material = mat(0xdfe3e6, { rough: 0.5, metal: 0.5 }); drainMissing.visible = false; }
        if (step.id === "exhaust-log") repaint(logFace, paperFace("GREASE DUCT LOG", ["Joints welded: 1, continuous", "Light test: 1 pinhole, repaired, retested", "Door/sealant: listed, torqued", "Clearance 62 mm wrapped / 2 layers", "Signed: apprentice / lead"], { bg: "#f4efe4", band: "#d66a4a" }));
      },
      onHazard() {},
      // The watch really leaves the hood; the fan really starts.
      onInterrupt(it) {
        if (it.id === "fire-watch-gone") { watch.position.set(-2.9, 0, 2.4); watch.rotation.y = 2.2; smoulder.visible = true; }
        if (it.id === "fan-starts") { fanOn = true; fanLamp.material = mat(0x59c97b, { emissive: 0x59c97b, ei: 1.8 }); }
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "fire-watch-gone") { watch.position.set(-2.0, 0, -2.4); watch.rotation.y = 1.0; smoulder.visible = false; }
        if (it.id === "fan-starts") { fanOn = false; fanLamp.material = mat(0x3a4048, { rough: 0.5 }); discHandle.rotation.z = Math.PI / 2; }
      },

      animate(t, dt, session) {
        const step = session?.step;
        welding = !!(step?.id === "weld-joint" && session.holding);
        arc.visible = welding;
        if (welding) arc.position.y = 0.3 * Math.cos(t * 2);
        if (fanOn) fanLamp.position.y = 3.9 + Math.sin(t * 20) * 0.005;
        const gg = session?.gauge;
        if (gg && !gg.committed && step?.id === "clearance") {
          repaint(tape.userData.screen, signFace(`${Math.round(gg.t * 120)} mm`, { bg: "#0d1c24", accent: gg.t >= 0.46 && gg.t <= 0.62 ? "#59c97b" : "#f2ae14", fg: "#fbe4da", scale: 0.6 }));
        }
        const tn = session?.turn;
        if (tn && step?.id === "door-latch") for (const l of latches) l.rotation.z = tn.amount * Math.PI / 2;
        if (step?.id === "light-test" && session.holding) pinhole.visible = true;
      },
    };
  },
};
