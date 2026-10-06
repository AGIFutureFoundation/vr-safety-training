import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, ball, torus, slab, hose, group, decal, repaint, signFace, paperFace, mat,
  counter, cabinet,
} from "../../../shared/kit.js";
import {
  CITY, stationPad, holoPanel, holoTag, instrument, standingFigure, reg,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Amalgam Waste Handling VR — Dental & Oral Health.
// The mercury side of a restorative clinic: an amalgam separator certified to
// the EPA's 95 percent removal standard, a canister changed on schedule, and
// every piece of scrap — chairside traps, vacuum filters, capsules — routed
// to the labelled amalgam waste container and out through a licensed
// recycler's manifest. Nothing here is incinerated, bleached or vacuumed
// loose, because every one of those turns bound mercury into vapour or a
// waste stream nobody is tracking.

const AWH_ACCENT = 0xc9a24a;

export const SIM_AMALGAM_WASTE_HANDLING = {
  id: "amalgam-waste-handling",
  index: "127",
  domain: "Dental & Oral Health",
  trade: "Dental hygienist",
  category: "Dental & Oral Health",
  indoor: "clinic",
  certification: "The EPA's amalgam separator rule (40 CFR 441) and its 95 percent removal standard for dental offices that place or remove amalgam; the state's mercury and hazardous dental waste rules; OSHA 29 CFR 1910.1000 air contaminants for mercury vapour and 1910.1200 hazard communication; the ADA's best management practices for amalgam waste",
  name: "Amalgam Waste Handling",
  title: simTitle("Amalgam Waste Handling"),
  tagline: "Separator certification and canister change, scrap routed to the amalgam waste stream, the recycler's manifest and a mercury spill kit",
  accent: AWH_ACCENT,
  accentCss: "#c9a24a",
  parSeconds: 255,
  footprint: 2.2,
  badge: { id: "closed-loop", name: "Closed Loop", note: "Every gram of scrap into the amalgam stream — nothing to the trash, the sharps or the drain" },

  // Named for the guide's end-of-run check-in card (shared/ei-guide.js):
  // the profession's own support resource, not an invented hotline.
  supportLine: "your employer's employee assistance program, or the ADHA's member resources if a mercury question about your own exposure is what stayed with you",

  game: system({
    name: "Mercury Handling",
    currency: "HG",
    ranks: ["Waste Handler", "Separator Trained", "Compliance Lead", "Environmental Officer", "Mercury Certified"],
    badges: [
      { id: "never-mixed", name: "Never Mixed", note: "No unsafe action anywhere in the run", test: AWARD.safe },
      { id: "logged-clean", name: "Logged Clean", note: "The separator log touched without a single correction", test: AWARD.stepClean("log-change") },
      { id: "steady-flush", name: "Steady Flush", note: "Line flush held in band the whole way", test: AWARD.unbroken },
    ],
    challenges: [
      { id: "shift-time", name: "Shift Time", note: "Complete inside 80% of par", test: AWARD.fast(0.8) },
      { id: "clean-handling", name: "Clean Handling", note: "No corrections anywhere in the run", test: AWARD.clean },
      { id: "seven-straight", name: "Seven Straight", note: "Seven correct actions in a row", test: AWARD.streak(7) },
    ],
  }),

  hazards: {
    "trash-bin": "That is the general trash. Amalgam scrap in the regular waste stream is exactly what the separator rule and the state's mercury waste rules exist to prevent — it goes to the labelled amalgam container, every time, with nothing traded off for convenience.",
    "sharps-bin": "That is the sharps container, and amalgam scrap does not belong in it either. Sharps waste and amalgam waste are two separate regulated streams with two separate destinations — mixing them contaminates a load a recycler cannot then certify as either one.",
    "bleach-cleaner": "That line cleaner is chlorine-based. An oxidizer run through lines feeding a mercury separator can react with the collected amalgam and drive mercury into vapour — only a cleaner rated compatible with the separator ever goes through those lines.",
    "autoclave-heat": "Amalgam scrap does not go anywhere near the autoclave or any other heat source. Mercury vaporises well below sterilizer temperatures, and heating amalgam waste is one of the few actions in this office that turns a solid, containable hazard into an airborne one.",
  },

  lateNotes: {
    "amalgam-scrap": "The traps and filters have not been emptied yet — there is nothing to carry to the container until that scrap exists.",
    "waste-lid": "The container is not full of anything to seal yet. The lid closes once the scrap from this session is actually inside it.",
    "recycler-manifest": "The container is not sealed yet. A manifest is written against a sealed load, not one that could still change.",
  },

  steps: [
    {
      id: "isolate", kind: "turn", target: "vacuum-isolation-valve",
      title: "Isolate the central vacuum line",
      cue: "Close the isolation valve before opening anything downstream of it.",
      why: "Isolating the line stops suction reaching the separator while it is open for service, which is what keeps a canister change from turning into an operator pulling room air — and whatever is sitting in the line — through an open trap.",
      turn: { turns: 1, axis: "y", label: "VACUUM ISOLATION" },
    },
    {
      id: "flush-lines", kind: "track", target: "flush-valve", seconds: 7,
      title: "Flush the vacuum lines before opening the trap",
      cue: "Hold a steady flush rate — too little leaves debris in the line, too much just floods the trap.",
      why: "A steady water flush ahead of opening any trap clears loose debris out of the line under control, rather than having it arrive in a rush the moment the fitting comes apart. Too weak a flush leaves the line still loaded when you open it; too strong floods the trap you are about to lift out.",
      track: {
        start: 0.1, green: [0.35, 0.58], rise: 0.5, fall: 0.4, drift: 0.1, label: "FLUSH RATE",
        readout: (v) => (v < 0.35 ? "too weak" : v > 0.58 ? "flooding" : "clearing the line"),
      },
      holdBreakNote: "Flush rate dropped out of band. An uneven flush leaves debris exactly where the trap is about to be opened.",
    },
    {
      id: "cert-log", kind: "select", target: "separator-log",
      title: "Confirm the separator's certification and log",
      cue: "Check the separator's EPA-compliant certification and the maintenance log before servicing it.",
      why: "The separator's own certification is what proves this model meets the 95 percent removal standard the EPA's amalgam rule sets, and the log is the paper trail that shows this specific unit has actually been serviced on schedule rather than only certified once at installation.",
    },
    {
      id: "efficiency-check", kind: "gauge", target: "separator-monitor",
      title: "Confirm removal efficiency is holding",
      cue: "Read the separator's monitor and commit once it holds at or above the certified removal rate.",
      why: "A separator can be the right certified model and still be failing on the day — a cracked seal or a spent canister both drop its actual removal rate well under the 95 percent standard it was certified against. The monitor is what tells you which situation you are in before you open anything.",
      gauge: {
        label: "REMOVAL EFFICIENCY", speed: 0.6, green: [0.67, 1.0],
        readout: (t) => `${Math.round(85 + t * 15)}%`,
        missNote: "Reading under the certified removal rate — do not proceed on a separator that is not holding its rated efficiency.",
      },
    },
    {
      id: "ppe", kind: "sequence", anyOrder: true,
      targets: ["nitrile-gloves", "eye-protection"],
      itemNames: { "nitrile-gloves": "nitrile gloves", "eye-protection": "eye protection" },
      title: "Glove and protect eyes before opening the canister",
      cue: "Nitrile gloves and eye protection before the canister comes off.",
      why: "Amalgam scrap and whatever is left in an open canister are handled the same way any other clinical waste is under OSHA's hazard communication rule — barrier PPE on before contact, not reached for after something has already splashed.",
    },
    {
      id: "canister-check", kind: "select", target: "canister-sight-glass",
      title: "Check the canister against the full line",
      cue: "Look at the sight glass and compare the level to the fill line.",
      why: "The fill line is what turns 'looks pretty full' into a decision — a canister changed early wastes capacity that was still good, and one run past the line starts losing removal efficiency exactly when the separator needs it most.",
    },
    {
      id: "swap-canister", kind: "drag", target: "full-canister",
      title: "Change the canister",
      cue: "Lift the full canister out and seat a new one in the dock.",
      why: "The canister is changed on the manufacturer's schedule, not run until it visibly fails — a separator quietly losing efficiency past its rated capacity still looks like it is working right up until a compliance sample says otherwise.",
      drag: { to: "canister-dock", radius: 0.4, missNote: "Not seated in the dock. A canister not fully seated leaks around the fitting instead of collecting anything." },
    },
    {
      id: "log-change", kind: "select", target: "separator-log",
      title: "Log the canister change",
      cue: "Record the date, weight and canister serial number in the log.",
      why: "This entry is what makes the certification real for this specific canister rather than a claim about the model in general — an inspector, a recycler and the next hygienist on shift all read this log rather than taking anyone's word for when it was last changed.",
    },
    {
      id: "empty-traps", kind: "sequence", anyOrder: true,
      targets: ["chairside-trap", "vacuum-filter"],
      itemNames: { "chairside-trap": "chairside trap", "vacuum-filter": "vacuum filter" },
      title: "Empty the chairside traps and vacuum filters",
      cue: "Empty both into the amalgam waste container — never the trash, never the sharps.",
      why: "Chairside traps and vacuum filters catch amalgam particulate before it can reach the separator at all, and both are dental amalgam waste under the state's rules the moment they come out — not general clinical waste that happens to look similar.",
    },
    {
      id: "scrap-to-container", kind: "drag", target: "amalgam-scrap",
      title: "Deposit capsules and scrap in the labelled container",
      cue: "Carry the collected capsules and scrap to the amalgam waste container.",
      why: "Capsules, carving scrap and the trap contents all go into the same labelled, mercury-tight container, because a mixed load a recycler cannot verify as amalgam-only is a load they cannot legally accept as amalgam waste at all.",
      drag: { to: "amalgam-waste-container", radius: 0.45, missNote: "Not in the container. Scrap set down anywhere else in the room is scrap somebody else has to identify and move later." },
    },
    {
      id: "seal-lid", kind: "select", target: "waste-lid",
      title: "Seal the container lid",
      cue: "Close and seal the amalgam waste container.",
      why: "A sealed lid is what keeps mercury vapour out of the room air between now and pickup — an open or loosely set lid on a container that has been accumulating scrap for weeks is a slow, continuous source nobody is measuring.",
    },
    {
      id: "sweep-the-bay", kind: "find", noHint: true,
      targets: ["extracted-tooth-amalgam", "spent-capsule", "bagged-trap-screen"],
      itemNames: {
        "extracted-tooth-amalgam": "the extracted tooth with an amalgam restoration",
        "spent-capsule": "the spent amalgam capsule",
        "bagged-trap-screen": "the bagged trap screen from operatory two",
      },
      itemNotes: {
        "extracted-tooth-amalgam": "An extracted tooth still carrying an amalgam restoration is amalgam waste, not a specimen and not biohazard — it is one of the streams the recycler expects and the one most often thrown out with the tooth.",
        "spent-capsule": "A triturated capsule still holds a measurable residue of amalgam in both halves. Spent capsules are a named amalgam waste stream precisely because they look empty.",
        "bagged-trap-screen": "Somebody pulled this trap screen in the next room and left it bagged on the counter instead of walking it here. A bagged screen on a counter is amalgam waste in the wrong room, and it is what the next person mistakes for rubbish.",
      },
      title: "Sweep the bay for amalgam that never got routed",
      cue: "Three things in this bay still carry amalgam and are not in the container. Find them before you sign anything.",
      why: "The separator only catches what reaches the vacuum line, so 40 CFR 441 and the state's mercury waste rules are only satisfied if the solid streams are collected by hand as well — spent capsules, extracted teeth with restorations in them, and trap screens pulled in other operatories. Every one of those looks like ordinary rubbish, and each one that ends up in the trash or the sharps bin is mercury the office has sent somewhere it cannot account for.",
    },
    {
      id: "cleaner-check", kind: "select", target: "compatible-cleaner",
      title: "Use an amalgam-compatible line cleaner",
      cue: "Take the cleaner rated compatible with the separator — not the chlorine-based one on the shelf.",
      why: "The separator's manufacturer rates specific line cleaners as compatible for exactly this reason — an oxidizing cleaner run through the same lines can attack the collected amalgam chemically, which a visual inspection of the canister would never catch until the next compliance sample came back wrong.",
    },
    {
      id: "manifest", kind: "select", target: "recycler-manifest",
      title: "Complete the recycler's manifest",
      cue: "Fill out the manifest before the sealed container leaves for the licensed recycler.",
      why: "A licensed recycler's manifest is the paper trail the state's mercury waste rules require from this office's door to the recycler's — without it, a sealed container leaving the building is indistinguishable from waste that was simply thrown away somewhere else.",
    },
    {
      id: "spill-kit-check", kind: "hold", target: "spill-kit", seconds: 5,
      title: "Verify the mercury spill kit",
      cue: "Hold on the kit and confirm the absorbent, the sealable bag and the instructions are all present.",
      why: "A mercury spill kit checked cold, after a capsule has already broken open, costs the exact minutes that let mercury vapour build up in the room — checked now, staged and complete, it turns a spill into a five-minute cleanup instead of an evacuation.",
      holdBreakNote: "You stopped checking before confirming every item. A kit missing its absorbent or its sealable bag is a kit that fails at the one moment it is actually needed.",
    },
  ],

  interrupts: [
    {
      id: "mercury-spill",
      kind: "Spill",
      after: "flush-lines", delay: 3, seconds: 11,
      alert: "A capsule someone else was using across the room has been dropped and broken open — there is mercury-containing amalgam on the counter.",
      cue: "Reach for the spill kit. Not the vacuum.",
      target: "spill-kit",
      why: "A dropped amalgam capsule is a mercury spill, and the spill kit — absorbent powder and a sealable container — is the only correct response. A household or shop vacuum aerosolises mercury directly into the air instead of containing it, which is the one thing a spill response is not allowed to do.",
      missNote: "The spill sat on the counter while the canister work continued. Left alone, a mercury spill keeps releasing vapour into the room air the whole time nobody responds to it.",
      wrongNote: "It is the spill kit. Whatever is running at the manifold waits — a mercury spill in the open room does not.",
    },
    {
      id: "assistant-sharps-trap",
      kind: "Unsafe shortcut",
      after: "spill-kit-check", delay: 3, seconds: 11,
      alert: "A new assistant is about to tip a chairside trap's contents into the sharps container to save a trip across the room.",
      cue: "Stop them — that trap goes in the amalgam waste container.",
      target: "amalgam-waste-container",
      why: "A trap emptied into sharps contaminates a regulated sharps load with mercury-containing waste it was never certified to carry, and it is exactly the kind of shortcut somebody new to the office takes once, without knowing the two streams are never supposed to touch.",
      missNote: "The trap went into the sharps container. That load can no longer be certified as sharps waste alone, and the amalgam in it is now on its way to an incinerator built for sharps, not for mercury.",
      wrongNote: "It is the amalgam waste container. Redirect the trap contents there before anything gets tipped into the sharps bin.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.2, AWH_ACCENT);

    // ------------------------------------------------------------- separator under-sink unit
    const sink = group(g, -1.0, 0, -1.2, 0.3);
    box(sink, 0.7, 0.05, 0.5, 0, 0.85, 0, 0xdfe4e8, { rough: 0.3, metal: 0.1 });
    box(sink, 0.7, 0.75, 0.5, 0, 0.42, 0, 0xe8ecef, { rough: 0.5 });
    const cabinetDoor = box(sink, 0.32, 0.6, 0.02, -0.17, 0.42, 0.25, 0xdfe4e8, { rough: 0.45 });
    void cabinetDoor;

    const separator = group(sink, 0, 0.2, 0.3);
    box(separator, 0.28, 0.34, 0.22, 0, 0, 0, 0x8b929a, { rough: 0.5, metal: 0.4 });
    const canister = group(separator, 0, -0.16, 0.14);
    cyl(canister, 0.07, 0.075, 0.22, 0, 0, 0, 0xdfe4e8, { rough: 0.3, opacity: 0.6, seg: 16 });
    const canisterFill = cyl(canister, 0.06, 0.06, 0.12, 0, -0.03, 0, 0x6b5a3a, { rough: 0.6, seg: 16 });
    void canisterFill;
    const sightGlass = box(canister, 0.03, 0.16, 0.01, 0.075, 0, 0.03, 0xcfe4ee, { rough: 0.2, opacity: 0.8 });
    holoTag(canister, "Fill line", 0.09, 0.05, 0.03, { css: "#c9a24a", w: 0.22 });
    reg(hits, sightGlass, "canister-sight-glass");
    reg(hits, canister, "full-canister");
    const canisterDock = group(separator, 0, -0.16, -0.14);
    box(canisterDock, 0.16, 0.02, 0.16, 0, -0.1, 0, 0x3a4148, { rough: 0.5, metal: 0.5 });
    reg(hits, canisterDock, "canister-dock");
    holoTag(separator, "Amalgam separator", 0, 0.24, 0, { css: "#c9a24a", w: 0.4 });

    const isoValve = group(sink, -0.28, 0.55, 0.24, 0.4);
    cyl(isoValve, 0.02, 0.02, 0.1, 0, 0, 0, CITY.steel, { rough: 0.3, metal: 0.8, seg: 10 });
    ball(isoValve, 0.03, 0, 0.07, 0, 0xd8342a, { rough: 0.5 });
    reg(hits, isoValve, "vacuum-isolation-valve");
    holoTag(isoValve, "Vacuum isolation", 0, 0.18, 0, { css: "#c9a24a", w: 0.32 });

    const flushValve = group(sink, 0.28, 0.55, 0.24, -0.4);
    cyl(flushValve, 0.02, 0.02, 0.1, 0, 0, 0, CITY.steel, { rough: 0.3, metal: 0.8, seg: 10 });
    ball(flushValve, 0.03, 0, 0.07, 0, 0x4fd1ff, { rough: 0.5 });
    reg(hits, flushValve, "flush-valve");
    holoTag(flushValve, "Line flush", 0, 0.18, 0, { css: "#c9a24a", w: 0.28 });
    const flushHose = hose(sink, [[0.28, 0.6, 0.24], [0.4, 0.5, 0.4], [0.4, 0.3, 0.4]], 0.012, 0x7c8590, { steps: 12, rough: 0.6 });
    void flushHose;

    const monitor = instrument(sink, 0, 0.72, -0.24, { idle: "-- %", color: AWH_ACCENT, w: 0.15, d: 0.22, ry: 0 });
    reg(hits, monitor, "separator-monitor");

    // Separator log clipboard on the cabinet front.
    const logBoard = holoPanel(g, 0.5, 0.36, -1.9, 1.5, -0.4, (ctx, w, h) => {
      ctx.fillStyle = "rgba(24,18,4,0.9)"; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#c9a24a"; ctx.fillRect(0, 0, w, 5);
      ctx.fillStyle = "#f6ecd2";
      ctx.font = `600 ${Math.round(h * 0.12)}px 'Barlow Condensed', Arial, sans-serif`;
      ctx.textAlign = "left"; ctx.textBaseline = "middle";
      ctx.fillText("SEPARATOR LOG", w * 0.06, h * 0.16);
      ctx.font = `${Math.round(h * 0.08)}px Arial, sans-serif`;
      ["EPA 40 CFR 441 — 95% removal", "Model certified: yes", "Last canister change: —", "Next due: —"]
        .forEach((line, i) => ctx.fillText(line, w * 0.06, h * (0.36 + i * 0.14)));
    }, { ry: 0.4, accent: AWH_ACCENT });
    reg(hits, logBoard, "separator-log");

    // ------------------------------------------------------------- PPE station
    const ppeStand = group(g, 1.5, 0, -1.2, -0.5);
    box(ppeStand, 0.4, 1.4, 0.1, 0, 0.7, 0, 0x53585e, { radius: 0.02, rough: 0.5, metal: 0.4 });
    const gloves = group(ppeStand, -0.1, 0.9, 0.08);
    box(gloves, 0.1, 0.05, 0.1, 0, 0, 0, 0x8fd6c9, { rough: 0.6 });
    reg(hits, gloves, "nitrile-gloves");
    holoTag(gloves, "Nitrile gloves", 0, 0.1, 0, { css: "#c9a24a", w: 0.3 });
    const goggles = group(ppeStand, 0.1, 1.1, 0.08);
    torus(goggles, 0.045, 0.014, 0, 0, 0, 0xdfe4e8, { rough: 0.5, seg: 8, seg2: 14 });
    reg(hits, goggles, "eye-protection");
    holoTag(goggles, "Eye protection", 0, 0.1, 0, { css: "#c9a24a", w: 0.32 });

    // ------------------------------------------------------------- traps and filters at the chair
    const trapBench = group(g, 1.5, 0, 0.4, -0.3);
    box(trapBench, 0.5, 0.85, 0.34, 0, 0.42, 0, 0x3a4148, { rough: 0.5, metal: 0.3 });
    const chairTrap = group(trapBench, -0.17, 0.9, 0.05);
    cyl(chairTrap, 0.05, 0.06, 0.08, 0, 0, 0, 0x6b6f75, { rough: 0.6, seg: 14 });
    reg(hits, chairTrap, "chairside-trap");
    holoTag(chairTrap, "Chairside trap", 0, 0.1, 0, { css: "#c9a24a", w: 0.3 });
    const vacFilter = group(trapBench, 0.18, 0.9, 0.05);
    cyl(vacFilter, 0.04, 0.045, 0.1, 0, 0, 0, 0x8b929a, { rough: 0.55, seg: 14 });
    reg(hits, vacFilter, "vacuum-filter");
    holoTag(vacFilter, "Vacuum filter", 0, 0.14, 0, { css: "#c9a24a", w: 0.3 });

    // Loose scrap and used capsules, carried to the waste container.
    const scrapTray = group(trapBench, 0, 0.9, -0.14);
    for (let i = 0; i < 4; i++) {
      ball(scrapTray, 0.012, -0.06 + i * 0.04, 0, 0, 0x9a9188, { rough: 0.7 });
    }
    const capsule = cyl(scrapTray, 0.012, 0.012, 0.03, 0.02, 0.02, 0, 0xdfe4e8, { rough: 0.4, seg: 10 });
    void capsule;
    reg(hits, scrapTray, "amalgam-scrap");
    holoTag(scrapTray, "Capsules + scrap", 0, 0.09, 0, { css: "#c9a24a", w: 0.36 });

    // ------------------------------------------------------------- amalgam waste container and manifest
    const wasteStation = group(g, -1.6, 0, 1.1, 0.6);
    box(wasteStation, 0.34, 0.02, 0.3, 0, 0.02, 0, 0x2b3138, { rough: 0.7 });
    const wasteContainer = box(wasteStation, 0.26, 0.3, 0.22, 0, 0.17, 0, 0xf2c14b, { rough: 0.5 });
    decal(wasteStation, 0.2, 0.06, 0, 0.28, 0.111, signFace("AMALGAM WASTE — Hg", { bg: "#3a2a08", accent: "#f2c14b", scale: 0.4 }), { px: 160 });
    reg(hits, wasteContainer, "amalgam-waste-container");
    const wasteLid = box(wasteStation, 0.3, 0.03, 0.26, 0, 0.335, 0, 0xd8b23a, { rough: 0.45 });
    reg(hits, wasteLid, "waste-lid");
    holoTag(wasteStation, "Sealed container", 0, 0.5, 0, { css: "#c9a24a", w: 0.38 });

    const manifest = decal(wasteStation, 0.24, 0.32, 0.22, 0.2, 0,
      paperFace("RECYCLER MANIFEST", ["Licensed hauler: —", "Weight: —", "Date: —", "Signed: —"]));
    manifest.rotation.y = Math.PI / 2;
    reg(hits, manifest, "recycler-manifest");

    // Compatible cleaner vs the bleach-based decoy on the same shelf.
    const cleanerShelf = group(g, -1.8, 0, -0.3, 0.3);
    box(cleanerShelf, 0.5, 0.03, 0.16, 0, 0.9, 0, 0x8b929a, { rough: 0.6, metal: 0.3 });
    const goodCleaner = cyl(cleanerShelf, 0.035, 0.035, 0.16, -0.12, 1.0, 0, 0x59c97b, { rough: 0.4, seg: 12 });
    decal(cleanerShelf, 0.05, 0.07, -0.12, 1.02, 0.036, signFace("Hg-SAFE", { bg: "#0f2418", accent: "#59c97b", scale: 0.5 }), { px: 96 });
    reg(hits, goodCleaner, "compatible-cleaner");
    const bleach = cyl(cleanerShelf, 0.035, 0.035, 0.16, 0.12, 1.0, 0, 0xdfe4e8, { rough: 0.4, seg: 12 });
    decal(cleanerShelf, 0.05, 0.07, 0.12, 1.02, 0.036, signFace("BLEACH", { bg: "#241a10", accent: "#f0645b", scale: 0.5 }), { px: 96 });
    reg(hits, bleach, "bleach-cleaner");

    // Trash and sharps bins — the two wrong destinations.
    const trash = cyl(g, 0.14, 0.16, 0.32, 2.0, 0.16, 1.0, 0x4a545a, { rough: 0.7, seg: 14 });
    holoTag(g, "General trash", 2.0, 0.36, 1.0, { css: "#f0645b", w: 0.32 });
    reg(hits, trash, "trash-bin");
    const sharps = box(g, 0.24, 0.3, 0.2, 1.9, 0.15, -1.6, 0xd8342a, { rough: 0.6 });
    decal(g, 0.2, 0.06, 1.9, 0.28, -1.5, signFace("SHARPS", { bg: "#5a1210", accent: "#f2ae14", scale: 0.5 }));
    reg(hits, sharps, "sharps-bin");

    // Autoclave — the heat-source trap.
    const autoclave = group(g, -2.0, 0, -1.5, 0.4);
    box(autoclave, 0.4, 0.4, 0.36, 0, 0.5, 0, 0xdfe4e8, { rough: 0.35, metal: 0.3 });
    const autoclaveDoor = cyl(autoclave, 0.15, 0.15, 0.02, 0, 0.5, 0.19, 0x8b929a, { rough: 0.4, metal: 0.5, seg: 20 });
    holoTag(autoclave, "Autoclave", 0, 0.74, 0, { css: "#f0645b", w: 0.3 });
    reg(hits, autoclaveDoor, "autoclave-heat");

    // Amalgam-bearing waste that never got routed: an extracted tooth with a
    // restoration still in it, a spent capsule, and a trap screen somebody
    // bagged in the next operatory and left on this counter.
    const strayWaste = group(g, 0.85, 0, -1.72, 0.2);
    const extractedTooth = group(strayWaste, -0.26, 0.97, 0);
    cyl(extractedTooth, 0.035, 0.035, 0.05, 0, 0, 0, 0xdfe8ee, { rough: 0.2, opacity: 0.45, transparent: true, seg: 14 });
    box(extractedTooth, 0.022, 0.024, 0.02, 0, 0.012, 0, 0xf4f0e2, { rough: 0.6 });
    box(extractedTooth, 0.012, 0.006, 0.012, 0, 0.026, 0, 0x8b929a, { rough: 0.3, metal: 0.8 });
    holoTag(extractedTooth, "Extracted tooth", 0, 0.1, 0, { css: "#f2c14b", w: 0.36 });
    reg(hits, extractedTooth, "extracted-tooth-amalgam");

    const spentCapsule = group(strayWaste, 0, 0.965, 0.04);
    cyl(spentCapsule, 0.011, 0.011, 0.034, 0, 0, 0, 0xc9ccd1, { rough: 0.4, metal: 0.4, seg: 10 }).rotation.z = Math.PI / 2;
    cyl(spentCapsule, 0.012, 0.012, 0.008, -0.02, 0, 0, 0xf0645b, { rough: 0.5, seg: 10 }).rotation.z = Math.PI / 2;
    holoTag(spentCapsule, "Spent capsule", 0, 0.09, 0, { css: "#f2c14b", w: 0.34 });
    reg(hits, spentCapsule, "spent-capsule");

    const bagged = group(strayWaste, 0.26, 0.96, 0);
    slab(bagged, 0.11, 0.035, 0.09, 0, 0, 0, 0xdfe8ee, { radius: 0.02, rough: 0.35, opacity: 0.5, transparent: true });
    cyl(bagged, 0.025, 0.025, 0.012, 0, 0.012, 0, 0x8b929a, { rough: 0.45, metal: 0.5, seg: 12 });
    holoTag(bagged, "Bagged trap screen", 0, 0.09, 0, { css: "#f2c14b", w: 0.42 });
    reg(hits, bagged, "bagged-trap-screen");

    // Mercury spill kit on the wall, and a new assistant near the traps.
    const spillKit = group(g, 0.6, 0, 1.5, -0.4);
    box(spillKit, 0.3, 0.22, 0.14, 0, 0.9, 0, 0xf2c14b, { rough: 0.5 });
    decal(spillKit, 0.22, 0.08, 0, 0.95, 0.071, signFace("Hg SPILL KIT", { bg: "#2a1a08", accent: "#f2c14b", scale: 0.42 }));
    reg(hits, spillKit, "spill-kit");

    // A second supply counter and cabinet elsewhere in the room, dressed
    // with the ordinary clutter of a restorative bay rather than left bare.
    const supplyCounter = counter(g, 1.0, 0.45, 0.6, -1.9, 0xdfe4e8, { ry: 0 });
    for (let i = 0; i < 3; i++) {
      cyl(supplyCounter, 0.03, 0.03, 0.1 + i * 0.02, -0.3 + i * 0.28, 0.97, 0.05, 0x8b929a, { rough: 0.5, seg: 10 });
    }
    cabinet(g, 0.9, 0.45, 0.28, 0.6, 1.55, -1.9, 0xdfe4e8, { doorColor: 0xcfd8de });
    const floorDrain = cyl(g, 0.1, 0.1, 0.01, 0, 0.006, 2.0, 0x3a4148, { rough: 0.6, metal: 0.4, seg: 16 });
    void floorDrain;

    // A small wall shelf of chairside consumables, dressing the room with
    // the ordinary clutter of a restorative bay rather than an empty set.
    const suppliesShelf = group(g, -1.2, 0, 1.6, 0.5);
    box(suppliesShelf, 0.5, 0.03, 0.16, 0, 1.2, 0, 0x8b929a, { rough: 0.5, metal: 0.4 });
    box(suppliesShelf, 0.5, 0.03, 0.16, 0, 0.9, 0, 0x8b929a, { rough: 0.5, metal: 0.4 });
    const BOTTLE_TONES = [0xdfe4e8, 0x59c97b, 0xf2c14b, 0xa079ff, 0x4fd1ff];
    BOTTLE_TONES.forEach((tone, i) => {
      cyl(suppliesShelf, 0.025, 0.03, 0.11, -0.2 + i * 0.1, 1.26, 0, tone, { rough: 0.4, seg: 12 });
      cyl(suppliesShelf, 0.025, 0.03, 0.09, -0.2 + i * 0.1, 0.95, 0, tone, { rough: 0.4, seg: 12 });
    });

    // A small utility cart beside the sink, carrying a second set of tools.
    const utilityCart = group(g, 1.9, 0, 1.4, -0.4);
    box(utilityCart, 0.4, 0.03, 0.3, 0, 0.7, 0, 0x3a4148, { rough: 0.5, metal: 0.4 });
    box(utilityCart, 0.4, 0.03, 0.3, 0, 0.4, 0, 0x3a4148, { rough: 0.5, metal: 0.4 });
    for (const [sx, sz] of [[-1, -1], [-1, 1], [1, -1], [1, 1]]) {
      cyl(utilityCart, 0.012, 0.012, 0.68, sx * 0.17, 0.35, sz * 0.12, CITY.steel, { rough: 0.3, metal: 0.85, seg: 8 });
      const caster = cyl(utilityCart, 0.03, 0.03, 0.02, sx * 0.17, 0.02, sz * 0.12, 0x16191d, { rough: 0.8, seg: 10 });
      caster.rotation.z = Math.PI / 2;
    }
    for (let i = 0; i < 3; i++) {
      box(utilityCart, 0.04, 0.14, 0.01, -0.14 + i * 0.14, 0.78, 0.1, 0xdfe4e8, { rough: 0.4 });
    }

    // A stack of pickup crates for the recycler and a wall clock, dressing
    // the corner where the sealed container waits for collection.
    const crateStack = group(g, -1.6, 0, 1.7, 0.2);
    for (let i = 0; i < 2; i++) {
      const crate = box(crateStack, 0.34, 0.22, 0.3, 0, 0.11 + i * 0.24, 0, 0xdfe4e8, { rough: 0.6, metal: 0.1 });
      void crate;
      for (const [sx, sz] of [[-1, -1], [-1, 1], [1, -1], [1, 1]]) {
        box(crateStack, 0.02, 0.2, 0.02, sx * 0.16, 0.11 + i * 0.24, sz * 0.14, 0xb9bec4, { rough: 0.5, metal: 0.3 });
      }
    }
    const wallClock = group(g, -3.0, 0, 0.5, 0.5);
    cyl(wallClock, 0.09, 0.09, 0.015, 0, 1.6, 0, 0xe8ecef, { rough: 0.4, seg: 20 });
    box(wallClock, 0.008, 0.06, 0.006, 0, 1.6, 0.01, 0x1b1e22, { rough: 0.5 });

    // A local exhaust vent over the separator cabinet.
    const ventHood = group(g, -1.0, 0, -1.2, 0.3);
    box(ventHood, 0.4, 0.06, 0.3, 0, 2.1, 0, 0x8b929a, { rough: 0.5, metal: 0.4 });
    for (let i = 0; i < 4; i++) box(ventHood, 0.34, 0.012, 0.02, 0, 2.07, -0.1 + i * 0.06, 0x5a6068, { rough: 0.5, metal: 0.5 });
    cyl(ventHood, 0.06, 0.06, 0.9, 0, 1.85, 0, 0x8b929a, { rough: 0.5, metal: 0.4, seg: 12 });

    const assistant = standingFigure(g, 2.6, 0.8, { ry: -2.6, cloth: 0x4aa6a0 });
    void assistant;

    return {
      hits,
      footprint: 2.2,
      spawnLook: new THREE.Vector3(-0.6, 1.0, -0.6),

      onStepComplete(step) {
        if (step.id === "log-change") repaint(logBoard.userData.face, (ctx, w, h) => {
          ctx.fillStyle = "rgba(24,18,4,0.9)"; ctx.fillRect(0, 0, w, h);
          ctx.fillStyle = "#59c97b"; ctx.fillRect(0, 0, w, 5);
          ctx.fillStyle = "#eafbf1";
          ctx.font = `600 ${Math.round(h * 0.12)}px 'Barlow Condensed', Arial, sans-serif`;
          ctx.textAlign = "left"; ctx.textBaseline = "middle";
          ctx.fillText("LOGGED", w * 0.06, h * 0.5);
        });
        if (step.id === "swap-canister") { canister.position.set(0, -0.16, -0.14); canisterDock.visible = false; }
        if (step.id === "empty-traps") { chairTrap.visible = false; vacFilter.visible = false; }
        if (step.id === "scrap-to-container") scrapTray.visible = false;
        if (step.id === "seal-lid") wasteLid.position.y = 0.335;
      },

      onInterrupt(it) {
        if (it.id === "mercury-spill") { scrapTray.children[0].material = mat(0xf0645b, { emissive: 0xf0645b, ei: 1.2 }); }
        if (it.id === "assistant-sharps-trap") { chairTrap.position.x -= 0.3; }
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "mercury-spill") { scrapTray.children[0].material = mat(0x9a9188, { rough: 0.7 }); }
        if (it.id === "assistant-sharps-trap") { chairTrap.position.x += 0.3; }
      },

      animate(t, dt, session) {
        if (session?.turn && session.step?.id === "isolate") isoValve.rotation.y = session.turn.amount * Math.PI * 2;
        const tr = session?.track;
        if (session?.step?.id === "flush-lines" && tr) {
          flushValve.children[1].material = mat(tr.v >= 0.35 && tr.v <= 0.58 ? 0x59c97b : 0xf2ae14, {
            emissive: tr.v >= 0.35 && tr.v <= 0.58 ? 0x59c97b : 0xf2ae14, ei: 1.2,
          });
        }
        const gg = session?.gauge;
        if (gg && !gg.committed && session.step?.id === "efficiency-check") {
          const pct = Math.round(85 + gg.t * 15);
          repaint(monitor.userData.screen, signFace(`${pct}%`, {
            bg: "#0d1c14", accent: pct >= 95 ? "#59c97b" : "#f2ae14", fg: "#eafbf1", scale: 0.6,
          }));
        }
      },
    };
  },
};
