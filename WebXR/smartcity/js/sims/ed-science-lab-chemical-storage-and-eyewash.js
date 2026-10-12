import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, ball, torus, group, decal, repaint, signFace, paperFace, mat,
} from "../../../shared/kit.js";
import {
  CITY, stationPad, holoPanel, holoTag, instrument, standingFigure, reg,
  surfaceTexture, texturedMat, tileFace, blockFace,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Science Lab Chemical Storage & Eyewash Check VR — Building
// Systems & Facilities, the education-support-staff programme.
//
// A high-school science lab between periods: the storage cabinet checked for
// compatibility before the next class ever opens a bottle, an unlabelled
// container and an expired reagent both caught, the fume hood's sash and
// airflow proven, a corrosive decanted with a bottle carrier rather than a
// bare hand, the eyewash and drench shower proven together, and the SDS
// binder confirmed current — all of it done by the AFT- or CSEA-represented
// instructional lab aide who keeps the room ready between the classes that
// actually use it. The school, the chemical brands and every reading on a
// gauge are generic; the lab's own chemical hygiene plan and the
// manufacturer's compatibility chart are named as the governing documents,
// never a clause number nobody here is certain of.

const LB_ACCENT = 0x9a6fd8;
const LB_CSS = "#9a6fd8";

export const SIM_ED_SCIENCE_LAB_CHEMICAL_STORAGE_AND_EYEWASH = {
  id: "ed-science-lab-chemical-storage-and-eyewash",
  index: "625",
  domain: "Building Systems & Facilities",
  trade: "AFT- or CSEA-represented instructional lab aide maintaining a school science lab's chemical storage and safety equipment between classes",
  category: "Building Systems & Facilities",
  indoor: "shop",
  weather: "overcast",
  certification: "AFT and CSEA instructional support training; OSHA's Hazard Communication standard (29 CFR 1910.1200) for the GHS-labelled reagents and the SDS binder; ANSI/ISEA Z358.1 for the eyewash and drench shower; OSHA's eye and hand protection standards (29 CFR 1910.133, 29 CFR 1910.138) at the storage cabinet and the fume hood; the school's own chemical hygiene plan and the manufacturer's compatibility chart for how reagents are segregated on the shelf, named here as governing documents rather than by a clause number",
  name: "Science Lab Chemical Storage & Eyewash Check",
  title: simTitle("Science Lab Chemical Storage & Eyewash Check"),
  tagline: "Between periods: the storage cabinet checked for what's shelved wrong, the fume hood's sash and airflow proven, a corrosive decanted with the bottle carrier, incompatible reagents moved to their own cabinets, the eyewash and drench shower both proven, the inventory checked against its expiry dates, and the SDS binder confirmed current before the next class opens a single bottle",
  accent: LB_ACCENT,
  accentCss: LB_CSS,
  parSeconds: 320,
  footprint: 2.8,
  badge: { id: "segregated-and-proven", name: "Segregated and Proven", note: "Every incompatible pair separated, the hood and the eyewash both proven, and nothing decanted by a bare hand" },

  supportLine: "your AFT or CSEA chapter's member assistance line, or the district's employee assistance programme",

  game: system({
    name: "Between Periods",
    currency: "ML",
    ranks: ["Lab Aide Trainee", "Lab Aide", "Lead Lab Aide", "Lab Safety Trainer", "Chemical Storage Certified"],
    badges: [
      { id: "carrier-not-hand", name: "Carrier, Not Hand", note: "Every corrosive moved with the bottle carrier, never a bare hand", test: AWARD.safe },
      { id: "clean-check", name: "Clean Check", note: "No corrections across the whole check", test: AWARD.clean },
      { id: "steady-pour", name: "Steady Pour", note: "The decanting pour held in band without a break", test: AWARD.unbroken },
    ],
    challenges: [
      { id: "lab-ready-on-time", name: "Lab Ready on Time", note: "Whole check finished inside 80% of par", test: AWARD.fast(0.8) },
      { id: "one-pass-cabinet-check", name: "One-Pass Cabinet Check", note: "Storage cabinet check clean on the first pass", test: AWARD.stepClean("cabinet-check") },
      { id: "eight-in-a-row", name: "Eight in a Row", note: "Eight correct actions in a row", test: AWARD.streak(8) },
    ],
  }),

  hazards: {
    "mix-acid-with-bleach-storage": "That shelf has an acid and a chlorine-bleach-based reagent stored side by side. The two react to release chlorine gas if they ever mix, which is exactly why the compatibility chart keeps them in separate cabinets rather than trusting that neither bottle ever leaks or gets knocked over.",
    "unlabeled-bottle-in-hood": "That bottle in the hood has no label at all. Nobody after this moment — not the next class, not the aide covering tomorrow's shift — has any way to know what's actually in it without opening it and finding out the hard way.",
    "flammables-outside-cabinet": "That solvent is sitting out on the open bench instead of in the flammables cabinet. A flammable liquid outside its rated cabinet is one static spark or one nearby burner away from a fire the cabinet exists specifically to contain.",
    "expired-chemical-not-flagged": "That reagent is well past the date on its own label and it's still sitting in the active-use rack. A chemical that's degraded past its shelf life can react unpredictably compared to what the SDS describes for it fresh — it gets flagged and pulled, not left for the next class to reach for.",
  },

  lateNotes: {
    "hood-gauge": "Not yet — the hood's airflow gets checked once the cabinet itself has already been walked, not before.",
    "eyewash-drench-station": "The eyewash gets proven once the decanting is actually finished, not before.",
  },

  steps: [
    {
      id: "read-lab-checklist", kind: "select", target: "lab-checklist-board",
      title: "Read today's lab safety checklist",
      cue: "Read the checklist for which classes are using hazardous reagents today.",
      why: "Knowing which periods actually need the corrosives or the flammables out today is what tells the aide which cabinets get opened at all — a lab prepped for a class that never touches the acid cabinet is a cabinet that stayed shut and safe for one more day.",
    },
    {
      id: "cabinet-check", kind: "find", noHint: true,
      targets: ["unlabeled-bottle", "incompatible-storage", "expired-reagent"],
      itemNames: { "unlabeled-bottle": "the bottle with no label", "incompatible-storage": "the acid shelved next to the bleach-based reagent", "expired-reagent": "the reagent past its expiry date" },
      itemNotes: {
        "unlabeled-bottle": "This bottle carries no label at all. Whatever's inside it is a guess the moment it leaves this shelf, and Hazard Communication exists precisely so nobody in this room ever has to guess.",
        "incompatible-storage": "This acid and this chlorine-bleach-based reagent are shelved side by side. The compatibility chart keeps them apart because a leak or a knocked-over bottle is the only thing standing between adjacent storage and a chlorine gas release.",
        "expired-reagent": "This reagent is well past the date on its own label. A chemical that's degraded past its shelf life doesn't behave the way its SDS describes for it fresh, and it gets flagged before a class ever reaches for it.",
      },
      title: "Walk the storage cabinet before first period",
      cue: "Three things about this cabinet are not right. Find them before any class opens a bottle.",
      why: "The cabinet gets walked with the compatibility chart in mind, not just a glance for anything obviously spilled — a mislabelled bottle, two reagents shelved together that shouldn't be, or one past its date all look completely normal from across the room.",
    },
    {
      id: "ppe-and-hood-sash", kind: "sequence", anyOrder: false,
      targets: ["goggles-on", "gloves-on", "sash-lowered"],
      itemNames: { "goggles-on": "splash goggles on", "gloves-on": "chemical gloves on", "sash-lowered": "fume hood sash lowered to the line" },
      title: "Goggles, gloves, then the hood sash",
      cue: "Put on splash goggles, then chemical gloves, then lower the fume hood sash to its marked line.",
      why: "Goggles and gloves go on before anything in the hood is touched because the hood's own containment only protects what's inside it — the aide standing in front of the sash needs their own protection regardless of how well the hood is working.",
      outOfOrderNote: "Goggles, then gloves, then the sash — the sash is set last because it's adjusted from a position already wearing both.",
    },
    {
      id: "hood-airflow-gauge", kind: "gauge", target: "hood-gauge",
      title: "Check the fume hood's airflow",
      cue: "Read the hood's airflow gauge and commit once it settles in the working band.",
      why: "A sash lowered to the right line still does nothing if the fan behind it isn't actually pulling air — the gauge is what confirms the hood is containing fumes rather than just looking like it is from the front.",
      gauge: { label: "HOOD AIRFLOW", speed: 0.6, green: [0.42, 0.66], readout: (t) => (t < 0.42 ? "too low — check the fan" : t > 0.66 ? "past the sash's rated line" : "in the working band"), missNote: "Not in the working band. A hood reading outside it isn't reliably containing anything — flag it before using it." },
    },
    {
      id: "close-gas-valves", kind: "turn", target: "gas-valve",
      title: "Close the bench gas valves",
      cue: "Turn each unused bench gas valve fully closed before any chemical work begins.",
      why: "A bench gas valve left cracked open between classes is a leak nobody is watching for, in the same room a corrosive is about to be decanted — closing every valve that isn't actively feeding a burner right now is what keeps an open flame or a gas smell from ever becoming part of today's chemical work.",
      turn: { turns: 0.4, label: "BENCH GAS VALVE", readout: (t) => (t < 0.85 ? "closing" : "shut") },
    },
    {
      id: "decant-corrosive", kind: "track", target: "bottle-carrier", seconds: 6,
      title: "Decant the corrosive with the bottle carrier",
      cue: "Pour from the large bottle into the smaller one at a steady rate, using the carrier.",
      why: "A steady, controlled pour rate is what keeps a corrosive inside the two containers instead of splashing back over the lip of either one — the carrier holds the weight so both of an aide's hands can stay on the actual pour instead of one of them fighting to hold a heavy bottle steady.",
      track: {
        start: 0.15, green: [0.34, 0.58], rise: 0.4, fall: 0.36, drift: 0.1, label: "POUR RATE",
        readout: (v) => (v < 0.34 ? "too slow — dripping" : v > 0.58 ? "too fast — splashing back" : "steady pour"),
      },
      holdBreakNote: "Pour rate out of band — too slow drips down the outside of the bottle, too fast splashes back over the lip. Bring it back to steady.",
    },
    {
      id: "move-incompatible", kind: "drag", target: "incompatible-bottle",
      title: "Move the incompatible reagent to its own cabinet",
      cue: "Carry the reagent found on the walk to the cabinet its compatibility group actually belongs in.",
      why: "Finding the mis-shelved reagent on the walk only matters once it's actually moved — the compatibility chart's whole point is which cabinet a chemical lives in, not just knowing which one it shouldn't be next to.",
      drag: { to: "correct-cabinet-spot", radius: 0.5, missNote: "Not in the right cabinet yet. Carry it all the way to the group its own chart entry belongs to." },
    },
    {
      id: "eyewash-drench", kind: "hold", target: "eyewash-drench-station", seconds: 8,
      title: "Prove the eyewash and drench shower together",
      cue: "Hold the combination valve open until both the eyewash and the drench shower flow together.",
      why: "A lab handling corrosives needs both the eyewash and the drench shower proven, not just one of them — a splash can hit an eye, a sleeve or a whole side of someone's body, and the equipment for all three only counts as ready once it's actually been run.",
      holdBreakNote: "You let go before both the eyewash and the shower settled into a steady flow. A short flush proves nothing about whether the line behind it is actually clear.",
    },
    {
      id: "restock-ppe-station", kind: "drag", target: "ppe-restock-box",
      title: "Restock the PPE station",
      cue: "Carry the box of replacement goggles and gloves to the PPE shelf.",
      why: "A PPE hook that runs empty partway through the day is the reason a student or a teacher reaches for a reagent without the protection the label calls for — restocking it between periods, before the shelf actually runs out, is what keeps that choice from ever coming up.",
      drag: { to: "ppe-shelf-spot", radius: 0.5, missNote: "Not at the shelf yet. Carry the restock box all the way to the PPE hooks before the next class arrives." },
    },
    {
      id: "check-inventory", kind: "select", target: "inventory-log",
      title: "Check the inventory against expiry dates",
      cue: "Cross the shelf against the inventory log and flag anything past its date.",
      why: "The inventory log is the one place expiry dates actually get tracked across an entire cabinet at once — a reagent flagged here today is one a substitute aide or a new teacher won't have to discover expired mid-class next month.",
    },
    {
      id: "confirm-sds-binder", kind: "select", target: "sds-binder",
      title: "Confirm the SDS binder is current",
      cue: "Check that every reagent on the shelf has a matching, current safety data sheet in the binder.",
      why: "A safety data sheet that's missing or out of date is a reagent nobody in the room can actually look up in an emergency — the binder gets checked against the shelf itself, not assumed complete because it usually is.",
    },
    {
      id: "log-lab-check", kind: "select", target: "lab-log",
      title: "Sign the lab safety log",
      cue: "Record today's findings, the hood reading and the eyewash test on the lab safety log.",
      why: "The signed log is the school's own record that the room was actually checked today — it is also where the flagged expired reagent and the mis-shelved bottle get tracked until whoever orders replacements closes them out.",
    },
  ],

  interrupts: [
    {
      id: "student-knocks-bottle",
      kind: "A student in the hallway knocks a bottle off a cart",
      after: "decant-corrosive", delay: 2, seconds: 10,
      alert: "A student passing in the hallway has bumped a cart, knocking a small reagent bottle to the floor — it's cracked and starting to leak.",
      cue: "Get the spill kit on it now.",
      target: "spill-kit",
      why: "A cracked bottle leaking in a hallway outside a lab is a spill the moment it happens, not a mess to deal with after the pour in front of you is finished — the spill kit answers it immediately, because a small leak left even a minute becomes a bigger one and a wider area to clean.",
      missNote: "The leak spread across the hallway floor while the pour in the hood continued — a cracked bottle doesn't wait for a convenient stopping point.",
      wrongNote: "The spill kit — that's what answers a leaking bottle, right now.",
    },
    {
      id: "hood-sash-alarm",
      kind: "Fume hood sash alarm sounds",
      after: "eyewash-drench", delay: 2, seconds: 9,
      alert: "The fume hood's sash alarm starts sounding — someone has raised the sash well past its rated line.",
      cue: "Lower the sash back to the line.",
      target: "hood-sash",
      why: "A sash raised past its rated line lets the hood's containment fail exactly when something is still working inside it — the alarm is answered by lowering the sash immediately, not by finishing whatever else is in progress first.",
      missNote: "The sash stayed raised past its line with the alarm still sounding — a hood that isn't at its rated opening isn't reliably containing whatever fumes are still inside it.",
      wrongNote: "The sash — lower it back to the line, that's what the alarm is calling out.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.8, LB_ACCENT);

    // ------------------------------------------------------------- lab floor and back wall
    const floor = box(g, 6.2, 0.06, 5.2, 0, 0.03, 0, 0xffffff, { rough: 0.75 });
    floor.material = texturedMat(surfaceTexture((cx, w, h) => tileFace(cx, w, h, { tiles: 6, tile: 0xd4d8da, grout: "#8f9496" })), { repeat: 5, px: 448, rough: 0.65, color: 0xdfe2e2 });
    const backWallMat = texturedMat(surfaceTexture((cx, w, h) => blockFace(cx, w, h, { rows: 5, cols: 5, block: 0x8f948d })), { repeat: 2, px: 384, rough: 0.85, color: 0xffffff });
    const backWall = box(g, 5.6, 2.4, 0.12, 0, 1.2, -2.5, 0x8f948d, { rough: 0.85 });
    backWall.material = backWallMat;

    // ------------------------------------------------------------- storage cabinet
    const cabinet = group(g, -2.2, 0, -2.1);
    box(cabinet, 1.6, 1.7, 0.5, 0, 0.85, 0, 0xd8dde2, { rough: 0.4, metal: 0.3 });
    for (let s = 0; s < 3; s++) box(cabinet, 1.5, 0.02, 0.44, 0, 0.4 + s * 0.5, 0.02, 0xb8bcc0, { rough: 0.4, metal: 0.5 });
    const acidBottle = cyl(cabinet, 0.05, 0.05, 0.16, -0.5, 0.5, 0.15, 0xf2c14b, { rough: 0.4, seg: 12 });
    const bleachBottle = cyl(cabinet, 0.05, 0.05, 0.16, -0.3, 0.5, 0.15, 0xd8dde2, { rough: 0.4, seg: 12 });
    void acidBottle;
    holoTag(cabinet, "acid beside bleach-based reagent", -0.4, 0.72, 0.15, { css: "#f0645b", w: 0.56 });
    reg(hits, bleachBottle, "incompatible-storage");
    const unlabeled = cyl(cabinet, 0.05, 0.05, 0.16, 0.4, 0.5, 0.15, 0xbfe0f8, { rough: 0.4, seg: 12 });
    holoTag(cabinet, "no label at all", 0.4, 0.72, 0.15, { css: "#f0645b", w: 0.4 });
    reg(hits, unlabeled, "unlabeled-bottle");
    const expired = cyl(cabinet, 0.05, 0.05, 0.16, 0.1, 1.0, 0.15, 0x8ac47a, { rough: 0.4, seg: 12 });
    holoTag(cabinet, "past its expiry date", 0.1, 1.22, 0.15, { css: "#f0645b", w: 0.4 });
    reg(hits, expired, "expired-reagent");
    const shelveExpiredSpot = ball(cabinet, 0.03, 0.3, 1.05, 0.15, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(cabinet, "leave it on the shelf?", 0.3, 1.3, 0.15, { css: "#f0645b", w: 0.46 });
    reg(hits, shelveExpiredSpot, "expired-chemical-not-flagged");
    holoTag(cabinet, "storage cabinet", 0, 1.85, 0, { css: LB_CSS, w: 0.32 });

    // Unlabeled bottle in the hood — a separate, always-present hazard.
    const flammableOutside = cyl(g, 0.06, 0.06, 0.2, -1.0, 0.75, -0.3, 0xf2c14b, { rough: 0.4, seg: 12 });
    holoTag(g, "flammable — not in its cabinet", -1.0, 0.95, -0.3, { css: "#f0645b", w: 0.5 });
    reg(hits, flammableOutside, "flammables-outside-cabinet");
    const mixHazard = ball(cabinet, 0.09, -0.4, 0.6, 0.2, 0xc8d840, { emissive: 0xc8d840, ei: 0.4, opacity: 0.3, transparent: true, rough: 0.8 });
    reg(hits, mixHazard, "mix-acid-with-bleach-storage");

    // Flammables cabinet — the correct destination for the moved reagent.
    const correctCabinet = group(g, -0.6, 0, -2.3);
    box(correctCabinet, 0.8, 1.2, 0.4, 0, 0.6, 0, 0xd2312b, { rough: 0.5 });
    holoTag(correctCabinet, "flammables cabinet", 0, 1.35, 0, { css: LB_CSS, w: 0.34 });
    const correctCabinetSpot = torus(g, 0.2, 0.012, -0.6, 0.65, -2.0, LB_ACCENT, { emissive: LB_ACCENT, ei: 1.3, rough: 0.4, cast: false, seg: 6, seg2: 16 });
    reg(hits, correctCabinetSpot, "correct-cabinet-spot");
    const incompatibleBottle = cyl(g, 0.05, 0.05, 0.16, 0.4, 0.75, -2.05, 0xbfe0f8, { rough: 0.4, seg: 12 });
    holoTag(g, "incompatible reagent — move it", 0.4, 0.95, -2.05, { css: LB_CSS, w: 0.48 });
    reg(hits, incompatibleBottle, "incompatible-bottle");

    // ------------------------------------------------------------- fume hood
    const hood = group(g, 1.2, 0, -2.1);
    box(hood, 1.4, 1.5, 0.7, 0, 1.6, 0, 0xdfe4e8, { rough: 0.4, metal: 0.3 });
    box(hood, 1.3, 0.06, 0.6, 0, 0.9, 0, 0xb8bcc0, { rough: 0.5 });
    const sash = box(hood, 1.3, 0.9, 0.02, 0, 1.25, 0.34, 0x9fd8ff, { rough: 0.15, opacity: 0.4, transparent: true, metal: 0.2 });
    holoTag(hood, "fume hood sash", 0, 2.0, 0.34, { css: LB_CSS, w: 0.32 });
    reg(hits, sash, "hood-sash");
    const sashHandle = box(hood, 0.5, 0.02, 0.02, 0, 0.82, 0.34, 0xc0c6cc, { rough: 0.4, metal: 0.6 });
    reg(hits, sashHandle, "sash-lowered");
    const hoodGauge = instrument(hood, 0.5, 1.7, 0.36, { idle: "-- ft/min", color: LB_ACCENT, w: 0.11, d: 0.15 });
    holoTag(hoodGauge, "hood airflow gauge", 0, 0.18, 0, { css: LB_CSS, w: 0.36 });
    reg(hits, hoodGauge, "hood-gauge");
    const unlabeledHoodBottle = cyl(hood, 0.04, 0.04, 0.1, -0.4, 0.98, 0.1, 0xc0c6cc, { rough: 0.4, seg: 10 });
    holoTag(hood, "unlabelled bottle in the hood", -0.4, 1.14, 0.1, { css: "#f0645b", w: 0.5 });
    reg(hits, unlabeledHoodBottle, "unlabeled-bottle-in-hood");

    // Bench gas valve for the burner.
    const gasValve = group(g, 0.4, 0, -1.2);
    box(gasValve, 0.4, 0.7, 0.4, 0, 0.35, 0, 0xc4cbd1, { rough: 0.4, metal: 0.5 });
    const gasCock = cyl(gasValve, 0.03, 0.03, 0.02, 0, 0.72, 0, 0xd8dde2, { rough: 0.4, metal: 0.5, seg: 12 });
    holoTag(gasValve, "bench gas valve", 0, 0.9, 0, { css: LB_CSS, w: 0.32 });
    reg(hits, gasCock, "gas-valve");

    // Decanting setup: large bottle, carrier, small bottle.
    const largeBottle = cyl(hood, 0.06, 0.065, 0.24, -0.1, 1.02, 0, 0xf2c14b, { rough: 0.4, seg: 14 });
    void largeBottle;
    const carrier = group(hood, -0.1, 0.9, 0);
    box(carrier, 0.16, 0.02, 0.16, 0, 0, 0, 0x3a3f44, { rough: 0.5 });
    for (const sx of [-1, 1]) box(carrier, 0.02, 0.1, 0.02, sx * 0.07, 0.05, 0, 0x3a3f44, { rough: 0.5 });
    holoTag(carrier, "bottle carrier", 0, 0.2, 0, { css: LB_CSS, w: 0.3 });
    reg(hits, carrier, "bottle-carrier");
    const smallBottle = cyl(hood, 0.03, 0.032, 0.12, 0.25, 0.96, 0, 0xf2c14b, { rough: 0.4, opacity: 0.3, transparent: true, seg: 12 });
    void smallBottle;

    // Storage cabinet / eyewash / drench shower combination unit.
    const eyewash = group(g, 2.3, 0, 1.7);
    cyl(eyewash, 0.03, 0.035, 1.9, 0, 0.95, 0, 0xf2c14b, { rough: 0.5, metal: 0.4, seg: 12 });
    box(eyewash, 0.9, 0.1, 0.02, 0, 1.85, 0, 0xf2c14b, { rough: 0.5 });
    box(eyewash, 0.28, 0.1, 0.14, 0, 0.92, 0, 0xf2c14b, { rough: 0.5 });
    for (const sx of [-1, 1]) ball(eyewash, 0.035, sx * 0.08, 0.98, 0, 0xdfe4e8, { rough: 0.4, metal: 0.4 });
    const showerHead = cyl(eyewash, 0.06, 0.06, 0.03, 0, 1.85, 0, 0xdfe4e8, { rough: 0.4, metal: 0.5, seg: 16 });
    void showerHead;
    const combinedStream = ball(eyewash, 0.03, 0, 1.0, 0, 0xbfe0f8, { emissive: 0xbfe0f8, ei: 0.5, opacity: 0.5, transparent: true, rough: 0.5 });
    combinedStream.visible = false;
    holoTag(eyewash, "eyewash & drench shower", 0, 2.1, 0, { css: LB_CSS, w: 0.42 });
    reg(hits, eyewash, "eyewash-drench-station");

    // Boards: checklist, inventory, SDS binder, log.
    const checklistBoard = holoPanel(g, 0.6, 0.4, -2.85, 1.35, 0.9, (cx, w, h) => {
      cx.fillStyle = "rgba(3,16,20,0.9)"; cx.fillRect(0, 0, w, h);
      cx.fillStyle = LB_CSS; cx.fillRect(0, 0, w, 5);
      cx.fillStyle = "#efe6fa"; cx.font = `600 ${Math.round(h * 0.12)}px 'Barlow Condensed', Arial, sans-serif`;
      cx.textAlign = "center"; cx.textBaseline = "middle"; cx.fillText("LAB SAFETY CHECKLIST", w / 2, h * 0.28);
      cx.font = `${Math.round(h * 0.09)}px Arial, sans-serif`; cx.fillStyle = "#d6c8ea";
      cx.fillText("Period 3: acid titration", w / 2, h * 0.6);
    }, { ry: 0.6, accent: LB_ACCENT });
    reg(hits, checklistBoard, "lab-checklist-board");
    const inventoryLog = holoPanel(g, 0.44, 0.3, 2.7, 1.2, 0.2, (cx, w, h) => {
      cx.fillStyle = "rgba(3,16,20,0.9)"; cx.fillRect(0, 0, w, h);
      cx.fillStyle = LB_CSS; cx.fillRect(0, 0, w, 5);
      cx.fillStyle = "#efe6fa"; cx.font = `600 ${Math.round(h * 0.18)}px 'Barlow Condensed', Arial, sans-serif`;
      cx.textAlign = "center"; cx.textBaseline = "middle"; cx.fillText("INVENTORY", w / 2, h * 0.4);
    }, { ry: -0.6, accent: LB_ACCENT });
    reg(hits, inventoryLog, "inventory-log");
    const sdsBinder = group(g, 2.0, 0, -1.0);
    box(sdsBinder, 0.24, 0.3, 0.06, 0, 0.15, 0, 0x9a6fd8, { rough: 0.5 });
    decal(sdsBinder, 0.18, 0.1, 0, 0.2, 0.032, paperFace("SDS", ["BINDER"], { bg: "#f4e9d8" }));
    holoTag(sdsBinder, "SDS binder", 0, 0.36, 0, { css: LB_CSS, w: 0.3 });
    reg(hits, sdsBinder, "sds-binder");
    const labLog = holoPanel(g, 0.44, 0.3, 2.7, 1.6, -1.0, (cx, w, h) => {
      cx.fillStyle = "rgba(3,16,20,0.9)"; cx.fillRect(0, 0, w, h);
      cx.fillStyle = LB_CSS; cx.fillRect(0, 0, w, 5);
      cx.fillStyle = "#efe6fa"; cx.font = `600 ${Math.round(h * 0.18)}px 'Barlow Condensed', Arial, sans-serif`;
      cx.textAlign = "center"; cx.textBaseline = "middle"; cx.fillText("LAB LOG", w / 2, h * 0.4);
    }, { ry: -0.5, accent: LB_ACCENT });
    reg(hits, labLog, "lab-log");

    // PPE hooks.
    const gogglesHook = ball(g, 0.06, -2.9, 1.2, 0.9, 0xdfe4e8, { rough: 0.4, opacity: 0.5, transparent: true });
    holoTag(g, "goggles", -2.9, 1.4, 0.9, { css: LB_CSS, w: 0.24 });
    reg(hits, gogglesHook, "goggles-on");
    const glovesHook = box(g, 0.1, 0.14, 0.03, -2.6, 1.2, 0.9, 0xf2c14b, { rough: 0.6 });
    holoTag(g, "gloves", -2.6, 1.4, 0.9, { css: LB_CSS, w: 0.2 });
    reg(hits, glovesHook, "gloves-on");
    const ppeRestockBox = box(g, 0.3, 0.2, 0.24, -2.4, 0, 1.8, 0xd8dde2, { rough: 0.5 });
    ppeRestockBox.position.y = 0.1;
    holoTag(ppeRestockBox, "PPE restock box", 0, 0.3, 0, { css: LB_CSS, w: 0.36 });
    reg(hits, ppeRestockBox, "ppe-restock-box");
    const ppeShelfSpot = torus(g, 0.18, 0.012, -2.75, 0.9, 1.2, LB_ACCENT, { emissive: LB_ACCENT, ei: 1.3, rough: 0.4, cast: false, seg: 6, seg2: 16 });
    reg(hits, ppeShelfSpot, "ppe-shelf-spot");

    // Spill kit for the interrupt.
    const spillKit = group(g, -2.8, 0, 2.0);
    cyl(spillKit, 0.2, 0.2, 0.5, 0, 0.25, 0, 0xe8b02e, { rough: 0.6, seg: 14 });
    decal(spillKit, 0.24, 0.1, 0, 0.3, 0.205, paperFace("SPILL", ["KIT"], { bg: "#e8b02e" }));
    holoTag(spillKit, "spill kit", 0, 0.6, 0, { css: LB_CSS, w: 0.26 });
    reg(hits, spillKit, "spill-kit");
    const leakPuddle = box(g, 0.6, 0.005, 0.5, -4.0, 0.062, 3.2, 0x1a1408, { rough: 0.1, metal: 0.3, cast: false });
    leakPuddle.visible = false;

    // Crew: a science teacher checking in, clear of every control.
    const teacher = standingFigure(g, 2.7, 2.4, { ry: -2.4, cloth: 0x2b3138, gloves: false });
    holoTag(teacher, "science teacher", 0, 1.95, 0, { css: LB_CSS, w: 0.32 });

    return {
      hits,
      footprint: 2.8,

      onStepComplete(step) {
        if (step.id === "cabinet-check") { unlabeled.material = mat(0xc0c6cc, { rough: 0.4 }); mixHazard.visible = false; expired.visible = false; }
        if (step.id === "hood-airflow-gauge") repaint(hoodGauge.userData.screen, signFace("110 ft/min", { bg: "#1c3320", accent: "#59c97b", fg: "#eafbf1", scale: 0.5 }));
        if (step.id === "move-incompatible") { incompatibleBottle.visible = false; correctCabinetSpot.visible = false; }
        if (step.id === "close-gas-valves") gasCock.rotation.y = Math.PI / 2;
        if (step.id === "restock-ppe-station") { ppeRestockBox.visible = false; ppeShelfSpot.visible = false; }
        if (step.id === "check-inventory") expired.visible = false;
      },

      onInterrupt(it) {
        if (it.id === "student-knocks-bottle") leakPuddle.visible = true;
        if (it.id === "hood-sash-alarm") sash.position.z = 0.5;
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "student-knocks-bottle") leakPuddle.scale.set(0.4, 1, 0.4);
        if (it.id === "hood-sash-alarm") sash.position.z = 0.34;
      },

      animate(t, dt, session) {
        const gg = session?.gauge;
        if (gg && !gg.committed && session.step?.id === "hood-airflow-gauge") {
          repaint(hoodGauge.userData.screen, signFace(`${Math.round(60 + gg.t * 120)} ft/min`, {
            bg: "#0d1c24", accent: gg.t > 0.42 && gg.t < 0.66 ? "#59c97b" : "#f0645b", fg: "#eee6fa", scale: 0.5,
          }));
        }
        const holding = session?.step?.id === "eyewash-drench" && session.holding;
        combinedStream.visible = holding;
        teacher.userData.head.rotation.y = Math.sin(t * 0.35) * 0.3;
        void dt; void CITY;
      },
    };
  },
};
