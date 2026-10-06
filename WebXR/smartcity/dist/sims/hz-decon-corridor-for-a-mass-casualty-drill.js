import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import { box, cyl, ball, torus, group, decal, repaint, signFace, mat } from "../../../shared/kit.js";
import {
  CITY, stationPad, holoPanel, holoTag, toolChest, instrument, valveWheel, cone, barrierPanel,
  standingFigure, reg, surfaceTexture, texturedMat, pavingFace,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";
import { ambulance } from "../../../shared/fleet.js";
import { hoseReel } from "../../../shared/toolkit.js";

// SmartCiti.X~ Decon Corridor for a Mass-Casualty Drill VR — Emergency
// Services, the hazmat and environmental response block.
//
// A gross-decon corridor run for people instead of equipment: a triage tag
// board at the dirty-side entry, two inflatable pools in wash order, a
// privacy screen and a clothing-bag bin, a wash hose fed off a valve, and an
// ambulance staged at the clean side for secondary triage. The learner is an
// IAFF hazmat/technical-rescue firefighter running the corridor, with LIUNA
// hazmat laborers staffing the line and a second firefighter running the
// triage board. The drill and the site are generic.

const HZC_ACCENT = 0xf0645b;
const HZC_CSS = "#f0645b";

export const SIM_HZ_DECON_CORRIDOR_FOR_A_MASS_CASUALTY_DRILL = {
  id: "hz-decon-corridor-for-a-mass-casualty-drill",
  index: "343",
  domain: "Emergency Services",
  trade: "IAFF hazmat and technical-rescue firefighter running the decon corridor, with LIUNA hazmat laborers staffing the line and a firefighter running the triage board",
  category: "Emergency Services",
  weather: "wind",
  certification: "OSHA 29 CFR 1910.120 HAZWOPER for the corridor's own zones and PPE level, 29 CFR 1910.134 for the air-purifying respirator worn by the wash team, 29 CFR 1910.1030 bloodborne pathogens for direct patient contact once clothing comes off, NFPA 470 hazardous materials response qualifications for the corridor's own set-up order, and IAFF technical-rescue and hazmat response training",
  name: "Decon Corridor for a Mass-Casualty Drill",
  title: simTitle("Decon Corridor for a Mass-Casualty Drill VR"),
  tagline: "The corridor before the first patient: the drill plan read for its zones and PPE level, the splash suit and respirator on, the gross pool built before the rinse pool, the berm checked sealed under both, the wash valve opened, the first patient tagged, a non-ambulatory patient found in the queue before anyone tries to walk them, the screen up and the contaminated clothing bagged in order, the wash held in a steady pattern the full time, the runoff gauged against the berm's capacity, the patient wrapped and moved clean-side, a second wave met without losing the line, a torn glove answered at its own station, the crew checked in, and the drill logged",
  accent: HZC_ACCENT,
  accentCss: HZC_CSS,
  parSeconds: 340,
  footprint: 3.0,
  badge: { id: "corridor-held-clean", name: "Corridor Held Clean", note: "Every patient washed through in order, the berm never breached, and the second wave met without a single patient walking around the line" },

  supportLine: "your IAFF local's peer support line, with the LIUNA member assistance programme for the hazmat laborers on the line",

  game: system({
    name: "Decon Line",
    currency: "TAG",
    ranks: ["Line Hand", "Wash Team", "Corridor Lead", "Triage Certified", "MCI Decon Certified"],
    badges: [
      { id: "pools-in-order", name: "Pools In Order", note: "The gross pool built and checked before the rinse pool went down", test: AWARD.stepClean("build-corridor") },
      { id: "wash-held-steady", name: "Wash Held Steady", note: "The wash pattern held in its band the whole time", test: AWARD.unbroken },
      { id: "never-a-shortcut", name: "Never a Shortcut", note: "Never a patient walked around the line, never a mask broken early, never the berm skipped", test: AWARD.safe },
    ],
    challenges: [
      { id: "clean-setup", name: "Clean Setup", note: "No corrections building or running the corridor", test: AWARD.clean },
      { id: "runoff-on-the-gauge", name: "Runoff On The Gauge", note: "Runoff gauge committed inside the band first time", test: AWARD.precise(0.7) },
      { id: "corridor-cleared-fast", name: "Corridor Cleared Fast", note: "Drill logged inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "cut-around-corridor": "You waved a patient around the end of the corridor toward the clean side instead of through both pools. The corridor only works as a barrier between contaminated and clean if every patient crosses it the same way — the moment one patient walks around the end, the clean side is no longer the clean side, and everyone standing there is now exposed to whatever that patient was carrying.",
    "skip-berm-containment": "You set the pool down before checking that the berm underneath it was sealed. A gross-decon pool holds runoff only as long as the berm under it actually holds water, and a pool set on an unsealed berm is a pool whose first patient's wash water goes straight into the ground instead of into the containment the drill plan assumed was there.",
    "break-mask-to-reassure": "You pulled your respirator down to talk to a frightened patient instead of keeping it sealed and raising your voice. The moment the seal breaks, the air-purifying respirator is doing nothing for you, and it is doing it at the exact point in the corridor — right over a patient mid-wash — where whatever is coming off them is most concentrated in the air you just chose to breathe unfiltered.",
    "force-patient-to-walk": "You had the non-ambulatory patient walk through the corridor instead of moving them on a litter. A patient who cannot stand on their own does not become able to just because the corridor is faster that way — walking them anyway risks a fall in a wet corridor on top of whatever injury already put them on the ground, and the litter exists specifically so that decision is never made under pressure.",
  },

  lateNotes: {
    "rinse-pool": "The gross pool goes down first — there is nothing to rinse in yet.",
    "clothing-bag": "The privacy screen goes up before any clothing comes off — not the other way round.",
    "washed-patient": "Nothing to move yet — the patient is washed and wrapped before the move to secondary triage.",
  },

  steps: [
    {
      id: "read-mci-plan", kind: "select", target: "mci-plan",
      title: "Read the drill plan: zones, PPE level and the wash order",
      cue: "Read the plan: the dirty-side entry, the PPE level for the wash team, the pool order, and where secondary triage sits on the clean side.",
      why: "A decon corridor only protects the people running it if it matches the plan it was built against — the PPE level the atmosphere calls for, which pool goes down first, and exactly where the line between contaminated and clean actually sits. It is read before the first pool is unrolled, because the corridor cannot be redesigned once patients are already moving through it.",
    },
    {
      id: "don-ppe", kind: "sequence", anyOrder: true,
      targets: ["splash-suit", "apr-mask"],
      itemNames: { "splash-suit": "chemical-splash suit", "apr-mask": "air-purifying respirator" },
      title: "Splash suit and respirator on before the corridor goes up",
      cue: "Chemical-splash suit on, then the air-purifying respirator seated and checked, before touching either pool.",
      why: "The wash team stands directly over the wash water for the whole drill, and the splash suit and a sealed respirator are what keep whatever came off the first patient from becoming the wash team's own exposure. They go on before the corridor is even built, because the pools themselves are the first thing in this drill capable of splashing.",
    },
    {
      id: "build-corridor", kind: "sequence",
      targets: ["gross-pool", "rinse-pool"],
      itemNames: { "gross-pool": "gross-decon pool", "rinse-pool": "rinse pool" },
      outOfOrderNote: "The gross pool goes down first, closest to the dirty-side entry — the rinse pool only goes down once the gross pool is in place and checked.",
      title: "Build the corridor: gross pool, then rinse pool",
      cue: "Unroll and inflate the gross-decon pool first, at the dirty-side entry, then the rinse pool behind it.",
      why: "The corridor's whole logic runs in one direction — heaviest contamination washed off first, in the gross pool, before a patient ever reaches the rinse pool — and building them in that order is what keeps the rinse water from being contaminated by a patient who has not been through the gross wash yet.",
    },
    {
      id: "berm-check", kind: "select", target: "berm-seal",
      title: "Check the berm is sealed under both pools",
      cue: "Walk the berm line under both pools and confirm the seal is unbroken before the water goes on.",
      why: "The berm is the only thing standing between this drill's wash water and the ground underneath it, and a gap in the seal does not announce itself until water is already running through it. Checking it now, with both pools still empty, is the only point where a bad seal costs nothing to fix.",
    },
    {
      id: "open-water-supply", kind: "turn", target: "supply-valve",
      title: "Open the wash valve",
      cue: "Turn the supply valve open slowly, watching the hose pressure build rather than counting turns.",
      why: "A valve opened too fast can hammer the hose line hard enough to pop a fitting the corridor needs for the rest of the drill, and opening it slowly, watching the line firm up under your hand, is what gets water to the wash team without turning the first patient's decon into an equipment failure.",
      turn: { turns: 1.0, label: "VALVE", readout: (t) => (t < 0.3 ? "cracked" : t < 0.85 ? "opening" : "full flow") },
    },
    {
      id: "triage-first-patient", kind: "select", target: "triage-board",
      title: "Tag the first patient at the dirty-side entry",
      cue: "Tag the first patient at the entry before they take a step toward either pool.",
      why: "A patient entering the corridor untagged is a patient the triage board cannot account for once they come out the clean side looking like everyone else in a wrapped blanket — the tag is what lets the drill's own record match a person to the wash they actually went through.",
    },
    {
      id: "spot-non-ambulatory", kind: "find", noHint: true,
      targets: ["down-patient"],
      itemNames: { "down-patient": "non-ambulatory patient in the queue" },
      itemNotes: { "down-patient": "One patient further back in the queue is down and not moving on their own — they go through the corridor on a litter, never on their own feet." },
      title: "Look down the queue for a patient who cannot walk the corridor",
      cue: "Look down the line of waiting patients for anyone who is down, slumped or not standing on their own before the queue starts moving.",
      why: "A queue moving toward a corridor reads as a line of people who can all walk it the same way, and the one patient who cannot is easy to miss until they are already at the front and the decision has to be made on the spot. Spotting them now, from the length of the queue, is what gets the litter into position before it is needed rather than after.",
    },
    {
      id: "patient-undress", kind: "sequence",
      targets: ["privacy-screen", "clothing-bag"],
      itemNames: { "privacy-screen": "privacy screen up", "clothing-bag": "contaminated clothing bagged" },
      outOfOrderNote: "The privacy screen goes up before any clothing comes off, not after.",
      title: "Screen the patient, then bag the contaminated clothing",
      cue: "Raise the privacy screen at the gross pool, then help remove and bag the patient's contaminated clothing before the wash starts.",
      why: "A mass-casualty decon line runs in public, often in view of the same road the incident closed, and the privacy screen is what keeps a frightened patient's worst day from also being a public one. It goes up first because clothing removal is the one part of this corridor that cannot happen without it.",
    },
    {
      id: "wash-patient", kind: "track", target: "wash-hose", seconds: 6,
      title: "Hold the wash pattern over the patient",
      cue: "Sweep the hose in a steady head-to-toe pattern over the patient, keeping the coverage reading inside the band the whole time.",
      why: "A wash that skips across the body unevenly leaves patches of whatever contaminated the patient still on their skin, and holding a steady, repeatable pattern — checked against the coverage reading rather than by feel — is what turns a wash into an actual decon instead of a splash that looks like one.",
      track: { start: 0.3, green: [0.35, 0.6], rise: 0.42, fall: 0.32, drift: 0.14, label: "COVERAGE", readout: (v) => (v < 0.35 ? "missed patches" : v > 0.6 ? "too fast" : "even coverage") },
      holdBreakNote: "The pattern broke before the wash finished — a sweep that stops partway is a wash that leaves exactly the patches it skipped.",
    },
    {
      id: "runoff-gauge", kind: "gauge", target: "runoff-meter",
      title: "Gauge the runoff against the berm's capacity",
      cue: "Read the runoff level in the berm and commit the reading once it settles inside the safe band.",
      why: "A berm holds a finite amount of runoff, and the level climbing toward its rim during a multi-patient drill is the kind of thing nobody notices while they are focused on the patient in front of them. Reading it now, between patients, is what catches a berm approaching capacity before it does what an unsealed one already would have done sooner.",
      gauge: { label: "RUNOFF", speed: 0.65, green: [0.2, 0.45], readout: (t) => `${Math.round(t * 100)}%`, missNote: "Not settled inside the safe band — hold the reading until it stops climbing before you commit it." },
    },
    {
      id: "wrap-patient", kind: "select", target: "wrap-blanket",
      title: "Wrap the patient for warmth and privacy",
      cue: "Wrap the washed patient in a blanket before they move toward secondary triage.",
      why: "A patient who has just been washed outdoors in wet clothing has lost body heat the corridor did nothing to give back, and the wrap is what answers that before hypothermia becomes the second problem this drill created on top of the first one.",
    },
    {
      id: "move-to-secondary", kind: "drag", target: "washed-patient",
      title: "Move the patient to secondary triage",
      cue: "Move the wrapped patient across the clean-side line to the secondary triage marker beside the ambulance.",
      why: "Secondary triage is where a patient's actual condition gets a real assessment, away from the noise and wet ground of the wash line, and moving them across the clean-side marker — not partway, not left waiting at the pool's edge — is what actually gets them into that assessment instead of leaving them staged at the corridor's own exit.",
      drag: { to: "clean-side-marker", radius: 0.55, missNote: "Not across the clean-side line — the patient has to be moved fully to the secondary triage marker, not left staged at the corridor's own exit." },
    },
    {
      id: "crew-checkin", kind: "select", target: "corridor-radio",
      title: "Check in with the triage board",
      cue: "Call the firefighter running the triage board: patient count, berm status, and the wash team's own air time remaining.",
      why: "The triage board's count is only as good as what the corridor actually radios in, and calling it out loud after every patient — rather than trusting the board to already know — is what keeps the drill's own record matching what actually happened at the pools.",
    },
    {
      id: "close-log", kind: "select", target: "drill-log",
      title: "Close the drill log",
      cue: "Record every patient washed, the berm's final runoff level, and the second wave's outcome before standing the corridor down.",
      why: "The drill log is what the next crew reads before the next drill, and a second wave that stretched the corridor without a documented answer is exactly the finding an after-action review exists to catch — writing it down now is what turns today's drill into tomorrow's better plan.",
    },
  ],

  interrupts: [
    {
      id: "second-wave-arrival",
      kind: "A second wave of patients arrives mid-wash",
      after: "wash-patient", delay: 2, seconds: 14,
      alert: "A second wave of patients has just arrived at the dirty-side entry while the first patient is still mid-wash.",
      cue: "Call for the second corridor to open — the reserve pools staged beside the line, not the hose you're already holding.",
      target: "second-corridor-marker",
      why: "One corridor can only wash one patient at a time, and a second wave arriving while the first is still in the pool is exactly why a reserve set of pools is staged beside the line before the drill starts — opening the second corridor now is what keeps the queue from backing up past the point anyone can still triage it safely.",
      missNote: "The second wave queued behind the first corridor with nobody opening the reserve pools; the queue backed up past the triage board before anyone called for the second line.",
      wrongNote: "The second corridor marker — a second wave is answered by opening the reserve line, not by rushing the wash already underway.",
    },
    {
      id: "ppe-breach-glove-tear",
      kind: "A wash-team glove tears mid-wash",
      after: "runoff-gauge", delay: 2, seconds: 12,
      alert: "Your outer glove has just torn at the seam — bare skin is exposed to the wash water you're standing in.",
      cue: "Break off and go straight to the self-decon station — the patient's wash waits for the relief hand.",
      target: "self-decon-station",
      why: "A torn glove mid-wash is a breach in the one thing standing between you and the same contamination the patient is being washed for, and the self-decon station exists so that breach gets answered in minutes, not at the end of the shift once the whole corridor is stood down.",
      missNote: "The wash continued on a torn glove until the patient was finished; the exposure lasted the rest of the wash instead of the seconds it would have taken to break off immediately.",
      wrongNote: "The self-decon station — a PPE breach on the wash team is answered by decon for the firefighter, not by finishing the patient first.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 3.0, HZC_ACCENT);

    // --------------------------------------------------------------- ground
    const pad = box(g, 7.4, 0.06, 6.0, 0, 0.03, 0, 0xffffff, { rough: 0.92 });
    pad.material = texturedMat(surfaceTexture((cx, w, h) => pavingFace(cx, w, h, { tiles: 4, base: "#2a2c2f", base2: "#232528", seam: "rgba(0,0,0,0.3)" }), { repeat: 5, px: 512 }), { rough: 0.92, metal: 0.02, color: 0x9aa0a6 });

    // -------------------------------------------------------------- pools
    const poolShell = (parent, x, z, color) => {
      const p = group(parent, x, 0, z);
      box(p, 1.6, 0.28, 1.2, 0, 0.14, 0, 0x2b3138, { rough: 0.7 });
      box(p, 1.4, 0.05, 1.0, 0, 0.29, 0, color, { rough: 0.35, opacity: 0.8, transparent: true });
      return p;
    };
    const grossPool = poolShell(g, -0.6, -1.3, 0x5a7a3a);
    holoTag(grossPool, "gross-decon pool", 0, 0.55, 0, { css: HZC_CSS, w: 0.4 });
    reg(hits, grossPool, "gross-pool");
    const rinsePool = poolShell(g, 0.9, -1.3, 0x3a6a8a);
    holoTag(rinsePool, "rinse pool", 0, 0.55, 0, { css: HZC_CSS, w: 0.32 });
    reg(hits, rinsePool, "rinse-pool");
    rinsePool.visible = false;

    // The berm running under both pools.
    const berm = box(g, 3.2, 0.05, 1.5, 0.15, 0.02, -1.3, 0x4a4030, { rough: 0.85 });
    reg(hits, berm, "berm-seal");
    const bermGapHit = box(g, 0.3, 0.05, 0.3, -1.7, 0.02, -1.3, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "skip the seal?", -1.7, 0.4, -1.3, { css: "#d2312b", w: 0.4 });
    reg(hits, bermGapHit, "skip-berm-containment");

    // ------------------------------------------------------------- hose & valve
    const reel = hoseReel(g, 2.4, 0, -0.6, { ry: -1.6, livery: { colour: 0x2b3138, fleetName: "SMARTCITI FLEET", unitNumber: "H-9" } });
    const valve = valveWheel(g, 2.0, 0.5, -0.1, { color: 0x3a6a8a });
    holoTag(valve, "wash supply valve", 0, 0.4, 0, { css: HZC_CSS, w: 0.4 });
    reg(hits, valve.userData.wheel, "supply-valve");
    const nozzle = group(g, -0.6, 0.9, -1.0);
    ball(nozzle, 0.05, 0, 0, 0, 0x8a949d, { rough: 0.4, metal: 0.6 });
    holoTag(nozzle, "wash hose", 0, 0.2, 0, { css: HZC_CSS, w: 0.28 });
    reg(hits, nozzle, "wash-hose");
    void reel;

    // ------------------------------------------------------- corridor entry
    const board = holoPanel(g, 0.6, 0.42, -2.6, 1.3, -1.0, (cx, w, h) => {
      cx.fillStyle = "#1c0c0c"; cx.fillRect(0, 0, w, h); cx.fillStyle = HZC_CSS; cx.fillRect(0, 0, w, 6);
      cx.font = `600 ${Math.round(h * 0.12)}px 'Barlow Condensed', Arial, sans-serif`; cx.textAlign = "left"; cx.textBaseline = "middle";
      cx.fillStyle = "#ffe0da"; cx.fillText("TRIAGE BOARD", w * 0.06, h * 0.16);
      cx.font = `${Math.round(h * 0.09)}px Arial, sans-serif`; cx.fillStyle = "#ffece7";
      ["Patient: —", "Tag: —", "Status: —"].forEach((l, i) => cx.fillText(l, w * 0.06, h * (0.4 + i * 0.18)));
    }, { ry: 0.5, accent: HZC_ACCENT });
    reg(hits, board, "triage-board");

    const cutAroundHit = box(g, 0.7, 0.3, 0.4, 2.8, 0.15, -1.9, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "walk them around?", 2.8, 0.5, -1.9, { css: "#d2312b", w: 0.42 });
    reg(hits, cutAroundHit, "cut-around-corridor");

    // --------------------------------------------------------- patient queue
    const firstPatient = standingFigure(g, -3.2, 1.2, { ry: 1.0, cloth: 0x8a6a4a, trousers: 0x4a4a4a, atStation: true });
    holoTag(firstPatient, "first patient", 0, 1.9, 0, { css: HZC_CSS, w: 0.3 });
    const downPatient = standingFigure(g, -3.6, 2.4, { ry: 0.3, cloth: 0x6a5a4a, trousers: 0x3a3a3a, lying: true });
    holoTag(downPatient, "check the queue", 0, 0.5, 0, { css: "#d2312b", w: 0.36 });
    reg(hits, downPatient, "down-patient");
    const forceWalkHit = box(g, 0.6, 0.3, 0.6, -3.6, 0.3, 2.4, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "make them walk it?", -3.6, 0.75, 2.4, { css: "#d2312b", w: 0.44 });
    reg(hits, forceWalkHit, "force-patient-to-walk");

    // --------------------------------------------------------- screen & bags
    const screen = group(g, -1.4, 0, -0.9, 0.4);
    for (const sx of [-1, 1]) box(screen, 0.04, 1.4, 0.04, sx * 0.6, 0.7, 0, 0x8a949d, { rough: 0.5, metal: 0.6 });
    box(screen, 1.2, 1.2, 0.02, 0, 0.9, 0, 0x2b3138, { rough: 0.6, opacity: 0.85, transparent: true });
    holoTag(screen, "privacy screen", 0, 1.65, 0, { css: HZC_CSS, w: 0.32 });
    reg(hits, screen, "privacy-screen");
    const bagBin = box(g, 0.4, 0.35, 0.4, -1.9, 0.17, -0.3, 0xd2312b, { rough: 0.7 });
    holoTag(bagBin, "clothing bag bin", 0, 0.4, 0, { css: HZC_CSS, w: 0.34 });
    reg(hits, bagBin, "clothing-bag");
    const breakMaskHit = box(g, 0.5, 0.3, 0.5, -1.4, 1.3, -0.9, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "pull the mask down?", -1.4, 1.6, -0.9, { css: "#d2312b", w: 0.4 });
    reg(hits, breakMaskHit, "break-mask-to-reassure");

    // ------------------------------------------------------------- runoff meter
    const runoff = instrument(g, 1.6, 0.5, -1.9, { ry: -0.3, idle: "-- %", color: HZC_ACCENT, w: 0.1, d: 0.16 });
    holoTag(runoff, "runoff meter", 0, 0.16, 0, { css: HZC_CSS, w: 0.3 });
    reg(hits, runoff, "runoff-meter");

    // ---------------------------------------------------------------- wrap
    const wrapCart = group(g, 1.1, 0, -2.3);
    box(wrapCart, 0.5, 0.08, 0.6, 0, 0.5, 0, 0x2b3138, { rough: 0.6 });
    const blanket = box(wrapCart, 0.44, 0.05, 0.54, 0, 0.56, 0, 0xe8b02e, { rough: 0.7 });
    holoTag(wrapCart, "wrap blanket", 0, 0.7, 0, { css: HZC_CSS, w: 0.3 });
    reg(hits, blanket, "wrap-blanket");

    // -------------------------------------------------------- clean side / EMS
    const cleanLine = torus(g, 0.32, 0.012, 2.2, 0.02, -1.0, HZC_ACCENT, { emissive: HZC_ACCENT, ei: 1.4, rough: 0.4, cast: false, seg: 6, seg2: 24 });
    cleanLine.rotation.x = Math.PI / 2;
    holoTag(g, "secondary triage", 2.2, 0.4, -1.0, { css: HZC_CSS, w: 0.4 });
    reg(hits, cleanLine, "clean-side-marker");
    const washedPatient = standingFigure(g, 0.9, -1.3, { ry: 0.2, cloth: 0x8a6a4a, atStation: true });
    reg(hits, washedPatient, "washed-patient");
    const medic = ambulance(g, 3.4, 0, -1.6, { ry: -1.6, livery: { colour: 0xdfe4e8, fleetName: "CITY EMS", unitNumber: "E-31" } });
    void medic;

    // ------------------------------------------------------------ reserve line
    const secondCorridor = group(g, 3.4, 0, 1.3);
    box(secondCorridor, 1.3, 0.24, 1.0, 0, 0.12, 0, 0x2b3138, { rough: 0.7 });
    holoTag(secondCorridor, "second corridor", 0, 0.5, 0, { css: HZC_CSS, w: 0.38 });
    reg(hits, secondCorridor, "second-corridor-marker");

    // ------------------------------------------------------------ self-decon
    const selfDecon = group(g, -3.0, 0, -2.4);
    cyl(selfDecon, 0.3, 0.32, 0.06, 0, 0.03, 0, 0x3a6a8a, { rough: 0.6, seg: 16 });
    const eyewash = ball(selfDecon, 0.06, 0, 0.5, 0, 0xdfe4e8, { rough: 0.3 });
    holoTag(selfDecon, "self-decon station", 0, 0.7, 0, { css: HZC_CSS, w: 0.4 });
    reg(hits, eyewash, "self-decon-station");

    // ------------------------------------------------------------- radio & log
    const chest = toolChest(g, -3.4, 0.4, { ry: 0.6, color: 0x2b2b30 });
    const radio = instrument(chest, -0.12, 0.79, 0.02, { ry: 0.2, idle: "CH 5 · TRIAGE", color: HZC_ACCENT, w: 0.1, d: 0.16 });
    holoTag(radio, "corridor radio", 0, 0.16, 0, { css: HZC_CSS, w: 0.34 });
    reg(hits, radio, "corridor-radio");

    const plan = holoPanel(g, 0.95, 0.66, -3.3, 1.35, 0.4, (cx, w, h) => {
      cx.fillStyle = "#1c0c0c"; cx.fillRect(0, 0, w, h); cx.fillStyle = HZC_CSS; cx.fillRect(0, 0, w, 6);
      cx.font = `600 ${Math.round(h * 0.1)}px 'Barlow Condensed', Arial, sans-serif`; cx.textAlign = "left"; cx.textBaseline = "middle";
      cx.fillStyle = "#ffe0da"; cx.fillText("MCI DECON PLAN", w * 0.05, h * 0.12);
      cx.font = `${Math.round(h * 0.066)}px Arial, sans-serif`; cx.fillStyle = "#ffece7";
      ["Dirty side → gross pool → rinse pool", "PPE: splash suit + APR, wash team",
        "Berm sealed before water goes on", "Litter for any non-ambulatory patient",
        "Second corridor staged as reserve", "Log every patient at hand-off"].forEach((l, i) => cx.fillText(l, w * 0.05, h * (0.27 + i * 0.12)));
    }, { ry: 0.55, accent: HZC_ACCENT });
    reg(hits, plan, "mci-plan");

    const log = holoPanel(g, 0.6, 0.42, -2.1, 1.3, 1.9, (cx, w, h) => {
      cx.fillStyle = "#1c0c0c"; cx.fillRect(0, 0, w, h); cx.fillStyle = HZC_CSS; cx.fillRect(0, 0, w, 6);
      cx.font = `600 ${Math.round(h * 0.12)}px 'Barlow Condensed', Arial, sans-serif`; cx.textAlign = "left"; cx.textBaseline = "middle";
      cx.fillStyle = "#ffe0da"; cx.fillText("DRILL LOG", w * 0.06, h * 0.16);
      cx.font = `${Math.round(h * 0.09)}px Arial, sans-serif`; cx.fillStyle = "#ffece7";
      ["Patients washed: —", "Runoff: —", "Second wave: —"].forEach((l, i) => cx.fillText(l, w * 0.06, h * (0.4 + i * 0.18)));
    }, { ry: -0.9, accent: HZC_ACCENT });
    reg(hits, log, "drill-log");

    // ---------------------------------------------------------- perimeter & PPE
    cone(g, -3.8, -2.8); cone(g, 3.8, -2.8);
    barrierPanel(g, 0, -2.9, { color: 0xf2c14b, w: 5.0 });
    const rack = group(g, -3.9, 0, -0.6, 0.4);
    cyl(rack, 0.02, 0.02, 1.3, 0, 0.65, 0, 0x8a949d, { rough: 0.45, metal: 0.7, seg: 8 });
    box(rack, 0.4, 0.03, 0.03, 0, 1.25, 0, 0x8a949d, { rough: 0.45, metal: 0.7 });
    const suitProp = group(rack, -0.1, 0.9, 0);
    box(suitProp, 0.24, 0.5, 0.06, 0, 0, 0, 0xe8d23a, { rough: 0.7 });
    holoTag(rack, "splash suit", -0.1, 1.15, 0, { css: HZC_CSS, w: 0.28 });
    reg(hits, suitProp, "splash-suit");
    const maskProp = group(rack, 0.14, 0.9, 0);
    ball(maskProp, 0.08, 0, 0, 0, 0x14171a, { rough: 0.5 });
    holoTag(rack, "APR mask", 0.14, 1.15, 0, { css: HZC_CSS, w: 0.26 });
    reg(hits, maskProp, "apr-mask");

    // ------------------------------------------------------------------ crew
    const wash1 = standingFigure(g, -0.65, -2.1, { ry: 2.6, cloth: 0x2b3138, vest: HZC_ACCENT, helmet: 0xf2f2f2 });
    holoTag(wash1, "wash team — IAFF", 0, 1.95, 0, { css: HZC_CSS, w: 0.4 });
    const triageTech = standingFigure(g, -2.4, 1.0, { ry: -2.5, cloth: 0x2b3138, vest: 0xf2c14b, helmet: 0xe8b02e });
    holoTag(triageTech, "triage board — IAFF", 0, 1.95, 0, { css: HZC_CSS, w: 0.4 });

    return {
      hits,
      spawnLook: new THREE.Vector3(0.4, 0.9, -1.1),
      onStep() {},
      onStepComplete(step) {
        if (step.id === "build-corridor") rinsePool.visible = true;
        if (step.id === "open-water-supply") repaint(runoff.userData.screen, signFace("0 %", { bg: "#0d1c24", accent: "#59c97b", fg: "#bfeaf7", scale: 0.55 }));
        if (step.id === "triage-first-patient") {
          repaint(board.userData.face, (cx, w, h) => {
            cx.fillStyle = "#1c0c0c"; cx.fillRect(0, 0, w, h); cx.fillStyle = "#59c97b"; cx.fillRect(0, 0, w, 6);
            cx.font = `600 ${Math.round(h * 0.12)}px 'Barlow Condensed', Arial, sans-serif`; cx.textAlign = "left"; cx.textBaseline = "middle";
            cx.fillStyle = "#ffe0da"; cx.fillText("TRIAGE BOARD", w * 0.06, h * 0.16);
            cx.font = `${Math.round(h * 0.085)}px Arial, sans-serif`; cx.fillStyle = "#e0ffe8";
            ["Patient: 001", "Tag: logged", "Status: in wash"].forEach((l, i) => cx.fillText(l, w * 0.06, h * (0.4 + i * 0.18)));
          });
        }
        if (step.id === "patient-undress") screen.children[2].material = mat(0x2b3138, { rough: 0.6, opacity: 0.5, transparent: true });
        if (step.id === "wrap-patient") blanket.material = mat(0x59c97b, { rough: 0.6 });
        if (step.id === "move-to-secondary") washedPatient.position.set(2.2, 0, -1.0);
        if (step.id === "crew-checkin") repaint(radio.userData.screen, signFace("LINE HOLDING", { bg: "#0d1c24", accent: "#59c97b", fg: "#bfeaf7", scale: 0.45 }));
        if (step.id === "close-log") {
          repaint(log.userData.face, (cx, w, h) => {
            cx.fillStyle = "#1c0c0c"; cx.fillRect(0, 0, w, h); cx.fillStyle = "#59c97b"; cx.fillRect(0, 0, w, 6);
            cx.font = `600 ${Math.round(h * 0.12)}px 'Barlow Condensed', Arial, sans-serif`; cx.textAlign = "left"; cx.textBaseline = "middle";
            cx.fillStyle = "#ffe0da"; cx.fillText("DRILL LOG", w * 0.06, h * 0.16);
            cx.font = `${Math.round(h * 0.085)}px Arial, sans-serif`; cx.fillStyle = "#e0ffe8";
            ["Patients washed: 1", "Runoff: in band", "Second wave: opened"].forEach((l, i) => cx.fillText(l, w * 0.06, h * (0.4 + i * 0.18)));
          });
        }
      },
      onHazard() {},
      onInterrupt(it) {
        if (it.id === "second-wave-arrival") secondCorridor.children[0].material = mat(0xf0645b, { emissive: 0x6a1a08, ei: 0.6, rough: 0.6 });
        if (it.id === "ppe-breach-glove-tear") eyewash.material = mat(0xf0645b, { emissive: 0x6a1a08, ei: 1.2, rough: 0.3 });
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "second-wave-arrival") secondCorridor.children[0].material = mat(0x59c97b, { rough: 0.6 });
        if (it.id === "ppe-breach-glove-tear") eyewash.material = mat(0xdfe4e8, { rough: 0.3 });
      },
      animate(t, dt, session) {
        const step = session?.step;
        if (session?.turn && step?.id === "open-water-supply") valve.userData.wheel.rotation.z = session.turn.amount * Math.PI * 2;
        const gg = session?.gauge;
        if (gg && !gg.committed && step?.id === "runoff-gauge") repaint(runoff.userData.screen, signFace(`${Math.round(gg.t * 100)}%`, { bg: "#0d1c24", accent: gg.t >= 0.2 && gg.t <= 0.45 ? "#59c97b" : "#f2ae14", fg: "#bfeaf7", scale: 0.55 }));
        if (step?.id === "wash-patient" && session.holding) repaint(runoff.userData.screen, signFace(`${Math.round(session.track.v * 100)}`, { bg: "#0d1c24", accent: session.track.v >= 0.35 && session.track.v <= 0.6 ? "#59c97b" : "#f2ae14", fg: "#bfeaf7", scale: 0.55 }));
        void dt; void t; void CITY;
      },
    };
  },
};
