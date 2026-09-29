import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import { box, cyl, ball, group, decal, repaint, signFace, mat } from "../../../shared/kit.js";
import {
  stationPad, holoPanel, holoTag, instrument, standingFigure, surfaceTexture, texturedMat,
  deckPlateFace, gratingFace, reg,
} from "../citykit.js";

import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Marine Vessel Electrical Safety — its own gamified system: Every Source.
//
// LA-PROGRAMME (docs/consoles/LA-PROGRAMME.md): a marine electrician on a new-build hull at an outfitting pier, isolating
// the vessel's switchboard with more than one possible source — temporary shore power, an on-board generator, a battery
// bank. The hull, its equipment and its single-line drawing are generic and procedural: no vessel type, rating, voltage or
// real yard is stated. Taught from NFPA 70E, OSHA lockout and electrical safe work practices, and OSHA's shipyard standard.
// ?fault=backfeed moves the live backfeed source so the right answer is read, not remembered.

const LPMV_ACCENT = 0x5fd0b8;

export const SIM_LP_MARINE_VESSEL_ELECTRICAL_SAFETY = {
  id: "lp-marine-vessel-electrical-safety",
  index: "lp-3",
  domain: "Maritime",
  trade: "Marine electrician, new-build vessel outfitting — IBEW",
  category: "Maritime & Ports",
  district: "aerospace-depot",
  weather: "overcast",
  certification: "IBEW inside wireman training as a body; NFPA 70E standard for electrical safety in the workplace; OSHA 29 CFR 1910.147 control of hazardous energy, 29 CFR 1910.333 selection and use of work practices and 29 CFR 1910.132 personal protective equipment; OSHA 29 CFR 1915 shipyard employment; the vessel's single-line drawing and the yard's electrical work permit",
  name: "Marine Vessel Electrical Safety",
  title: simTitle("Marine Vessel Electrical Safety"),
  tagline: "Isolating a new-build vessel's switchboard at the outfitting pier when power can arrive from more than one place: the single-line drawing read, every source found — shore pedestal, generator, battery bank — each one opened, locked and proven dead, temporary cables kept out of the water, and the tester proven before and after",
  accent: LPMV_ACCENT,
  accentCss: "#5fd0b8",
  parSeconds: 300,
  footprint: 2.9,
  badge: { id: "every-source", name: "Every Source", note: "Found every source on the drawing, locked each one, proved the tester and never worked a live board" },

  game: system({
    name: "Every Source",
    currency: "kA",
    ranks: ["Helper", "Board Inducted", "Marine Electrician", "Lead Electrician", "Every Source Certified"],
    badges: [
      { id: "drawing-first", name: "Drawing First", note: "Read the single-line drawing before opening a panel", test: AWARD.stepClean("single-line") },
      { id: "never-live", name: "Never Live", note: "Never touched a conductor before it was proven dead", test: AWARD.safe },
      { id: "steady-megger", name: "Steady Megger", note: "Held the insulation test near band centre", test: AWARD.precise(0.72) },
    ],
    challenges: [
      { id: "quick-board", name: "Inside Par", note: "Complete inside 80% of par", test: AWARD.fast(0.8) },
      { id: "clean-board", name: "Clean Shift", note: "Clean run, no corrections", test: AWARD.clean },
    ],
  }),

  supportLine: "your IBEW local's member assistance programme, or the yard's employee assistance line if a shock, an arc or a near miss is what stayed with you",

  faults: [{ id: "backfeed", label: "Backfeed source: CHECK", step: "find-backfeed", target: "isolated-genset", note: "Today it is the generator that can backfeed, not the battery bank. Find the source that is still connected.", from: "battery-backfeed", cue: "Find the source that can still feed the board." }],

  hazards: {
    "work-live-hazard": "That opens the switchboard to fit the new breaker while it is still energised because the job is quick. Working a live board exposes the electrician to shock and arc flash for the length of the job, and NFPA 70E expects the board de-energised unless live work is justified and permitted.",
    "skip-prove-hazard": "That trusts the tester without proving it on a known live source first. A meter with a flat battery or a broken lead reads zero on a live bus exactly as it does on a dead one.",
    "cable-in-water-hazard": "That runs the temporary power cable through the water pooled on deck. Water, steel decks and damaged insulation together make a path for current through anyone standing there.",
    "reclose-hazard": "That re-closes the shore breaker to check a light while someone else is still in the board. A breaker under another worker's isolation is operated only by the procedure, never to test something.",
  },

  lateNotes: {
    "single-line-drawing": "The single-line drawing is read before any panel is opened, because a vessel can be fed from shore, from its own generator and from its batteries at once.",
    "arc-shirt": "Arc-rated clothing is worn to the category on the board's label, sleeves down, with nothing flammable underneath.",
  },

  interrupts: [
    { id: "shore-reclosed", kind: "Source restored", after: "absence-hold", delay: 3, seconds: 11, alert: "The pier crew has re-closed the shore power pedestal breaker while your team is in the switchboard.", cue: "Call all-stop to the pier on the radio now.", target: "pier-radio", why: "A source restored while people are in the board breaks the isolation the whole job depends on, and the first answer is to stop everyone and reach the person at the pedestal, because no amount of care inside the board helps once energy is arriving from outside it.", missNote: "The work carried on after the shore breaker was re-closed. A restored source is answered by stopping all work first.", wrongNote: "Not that — the restored source is answered by calling all-stop to the pier." },
    { id: "deck-flooding", kind: "Water on deck", after: "megger-track", delay: 3, seconds: 11, alert: "Rain run-off is pooling across the deck where the temporary power cable lies.", cue: "Lift the cable onto its hangers, clear of the water.", target: "cable-hangers", why: "Temporary cables on a working deck get walked on, pinched and wet, and lifting them onto hangers keeps damaged insulation out of the water that would otherwise carry current across the steel deck to whoever is standing in it.", missNote: "The cable stayed in the water. Temporary power is kept off the deck and out of water, not watched.", wrongNote: "That isn't it — the pooling water is answered by lifting the cable onto its hangers." },
  ],

  steps: [
    { id: "single-line", kind: "select", target: "single-line-drawing", title: "Read the single-line drawing", cue: "Read the vessel's single-line drawing: every source that can feed the switchboard.", why: "A vessel under outfitting can be fed from the shore pedestal, from its own generator and from a battery bank, sometimes at once, and the single-line drawing is the only place that shows every one of them, so it is read before any panel is opened rather than after a surprise." },
    { id: "prove-tester", kind: "gauge", target: "test-meter", title: "Prove the tester", cue: "Prove the voltage tester on the known live proving unit and commit once it reads in the green.", why: "The absence-of-voltage test is only as trustworthy as the tester, and proving it on a known source before and after the test is what shows a zero reading means a dead conductor rather than a flat battery, a broken lead or the wrong range.", gauge: { label: "TESTER PROOF", speed: 0.6, green: [0.44, 0.62], readout: (t) => (t > 0.44 && t < 0.62 ? "tester proven" : "check tester"), missNote: "Not in the green — the tester is not proven; swap it before any test for absence of voltage." } },
    { id: "ppe-arc", kind: "sequence", anyOrder: true, targets: ["arc-shirt", "rated-gloves", "arc-hood"], itemNames: { "arc-shirt": "arc-rated clothing", "rated-gloves": "rated rubber gloves with protectors", "arc-hood": "arc-rated face shield" }, title: "Dress to the label", cue: "Arc-rated clothing, rated rubber gloves with leather protectors, arc-rated face shield.", why: "Until the board is proven dead it has to be treated as live, and the PPE is chosen from the label's category so that the clothing will not ignite, the gloves are rated for the voltage and the face shield stands between the electrician and the flash if the test finds something the drawing did not." },
    { id: "find-wet-cable", kind: "find", noHint: true, targets: ["wet-cable"], itemNames: { "wet-cable": "damaged temporary cable lying in water" }, itemNotes: { "wet-cable": "A damaged temporary cable is taken out of service and replaced; one lying in water is lifted onto hangers and reported." }, decoyNotes: { "dry-cable": "A temporary cable on its hangers with its jacket intact. Nothing to flag there." }, title: "Find the unsafe temporary cable", cue: "Walk the deck and find the temporary cable that is not safe.", why: "Temporary power on a new-build hull is dragged across steel decks, through hatches and past welding, and a cut jacket lying in water turns the whole deck into part of the circuit, so it is found and dealt with before anyone kneels by the board." },
    { id: "set-boundary", kind: "drag", target: "boundary-chain", drag: { to: "board-boundary", radius: 0.4, missNote: "Not placed — set the chain at the arc-flash boundary in front of the switchboard." }, title: "Set the arc-flash boundary", cue: "Carry the chain to the arc-flash boundary in front of the switchboard.", why: "The arc-flash boundary is the distance at which an arc could still cause a serious injury, and chaining it off keeps the fitters, painters and welders sharing the compartment outside it while the electricians are working the board." },
    { id: "absence-hold", kind: "hold", target: "absence-test-point", seconds: 5, title: "Test for absence of voltage", cue: "Hold the tester on each phase and phase-to-ground until every reading settles.", why: "Every conductor that will be touched is tested, phase to phase and phase to ground, because a single open breaker can leave one phase fed from somewhere else, and the reading is held until it is steady so a slow-decaying charge is not mistaken for zero.", holdBreakNote: "Moved off before the reading settled. Hold the probes until every phase reads steady." },
    { id: "megger-track", kind: "track", target: "megger-meter", seconds: 8, title: "Insulation-test the new run", cue: "Keep the insulation tester's test voltage inside the band across the new cable run.", why: "An insulation test proves the new cable was not nicked on its way through the bulkheads, and holding the test steady through the whole run is what makes a good reading mean the insulation is sound rather than that the test was stopped early.", track: { start: 0.5, green: [0.4, 0.62], rise: 0.4, fall: 0.45, drift: 0.13, label: "TEST", readout: (v) => (v < 0.4 ? "sagging" : v > 0.62 ? "overshoot" : "steady") }, holdBreakNote: "The test left the band. Bring it back and hold it through the run." },
    { id: "find-backfeed", kind: "find", noHint: true, targets: ["battery-backfeed"], itemNames: { "battery-backfeed": "battery bank still connected to the board" }, itemNotes: { "battery-backfeed": "A source that can still feed the board is opened, locked and proven dead like the others before anyone works on the bus." }, decoyNotes: { "isolated-genset": "The generator's breaker open, locked and tagged. Nothing to flag there today." }, title: "Find the backfeed source", cue: "Find the source that can still feed the board.", why: "Opening the shore breaker makes a vessel's switchboard look dead while its own generator or battery bank can still feed the bus from the other side, and finding the source that is still connected is the step that separates an isolation from a guess." },
    { id: "lock-board", kind: "sequence", anyOrder: false, targets: ["board-breaker", "mv-personal-lock", "mv-tag"], itemNames: { "board-breaker": "switchboard breaker opened", "mv-personal-lock": "personal lock applied", "mv-tag": "tag signed and hung" }, outOfOrderNote: "Out of order — open the breaker, apply your own lock, then sign and hang the tag.", title: "Open, lock and tag the board", cue: "Open the switchboard breaker, apply your own lock, then sign and hang the tag.", why: "The breaker is opened first so the lock holds it in the off position, the lock is the electrician's own so nobody else can undo it, and the signed tag tells everyone who comes by who is working and how to reach them." },
    { id: "gfci-test", kind: "select", target: "gfci-test-button", title: "Test the ground-fault protection", cue: "Press the test button on the temporary power's ground-fault protection and confirm it trips.", why: "Ground-fault protection on temporary power is what trips when current finds a path through a person to the steel hull, and pressing its test button each shift is the only way to know it will actually trip when that happens." },
    { id: "co2-locate", kind: "select", target: "co2-extinguisher", title: "Locate the CO2 extinguisher", cue: "Find the carbon dioxide extinguisher for electrical fires nearest the switchboard.", why: "Water on an energised switchboard carries current back to whoever is holding the hose, so the extinguisher suited to electrical equipment is found before the work starts, when there is time to walk to it." },
    { id: "mv-handover", kind: "select", target: "mv-log", title: "Log the isolation", cue: "Log every source, its lock, the tester proof and the insulation reading on the permit.", why: "The next shift, the commissioning crew and the yard's electrical supervisor all rely on the permit to know which sources are isolated and by whom, and an isolation that is not written down cannot be handed over safely." },
  ],

  build(root) {
    const ACC = LPMV_ACCENT;
    const hits = {};
    const g = group(root);
    stationPad(g, 2.9, ACC);
    const deckMesh = box(g, 9.2, 0.12, 9.2, 0, 0.06, 0, 0xffffff, { rough: 0.6 });
    deckMesh.material = texturedMat(surfaceTexture((cx, w, h) => deckPlateFace(cx, w, h, {}), { repeat: 5, px: 512 }), { rough: 0.6, metal: 0.4, color: 0xffffff });
    const walk = box(g, 2.2, 0.03, 0.9, -3.2, 0.13, 3.3, 0xffffff, { rough: 0.7, cast: false });
    walk.material = texturedMat(surfaceTexture((cx, w, h) => gratingFace(cx, w, h, {}), { repeat: 2, px: 256 }), { rough: 0.7, metal: 0.4, color: 0xffffff });
    holoTag(g, "new-build hull at the outfitting pier — procedural, not a real yard", -2.4, 3.8, -7.05, { css: "#5fd0b8", w: 0.8 });
    // the hull's side, frames and the switchboard line-up
    box(g, 9.2, 3.6, 0.2, 0, 1.8, -6.6, 0x6f7a84, { rough: 0.6, metal: 0.5 });
    for (let i = 0; i < 12; i++) box(g, 0.12, 3.4, 0.25, -4.2 + i * 0.76, 1.8, -6.4, 0x5b646d, { rough: 0.6, metal: 0.5 });
    const cubicles = [];
    for (let i = 0; i < 6; i++) {
      const x = -2.5 + i * 1.0;
      cubicles.push(box(g, 0.9, 2.1, 0.6, x, 1.05, -5.6, 0xd9dee2, { rough: 0.5, metal: 0.3 }));
      box(g, 0.3, 0.2, 0.02, x, 1.6, -5.29, 0x1d4f7a, { rough: 0.5 });
      ball(g, 0.04, x - 0.25, 1.85, -5.28, [0x59c97b, 0xd2312b][i % 2], { rough: 0.4, seg: 8 });
    }
    for (let i = 0; i < 8; i++) box(g, 8.0, 0.05, 0.08, 0, 3.0 + (i % 4) * 0.08, -5.9 + Math.floor(i / 4) * 0.15, i % 2 ? 0x2b2f34 : 0x3b4148, { rough: 0.6 });
    // the pier edge and the shore pedestal beyond the rail
    for (let i = 0; i < 14; i++) cyl(g, 0.03, 0.03, 1.1, -4.4 + i * 0.68, 0.55, -3.1, 0xc9ced2, { rough: 0.4, metal: 0.6, seg: 6 });
    for (const y of [0.55, 1.05]) box(g, 8.9, 0.03, 0.03, 0, y, -3.1, 0xc9ced2, { rough: 0.4, metal: 0.6 });
    const pedestal = box(g, 0.4, 1.2, 0.4, 3.9, 0.6, -4.2, 0x2f6fb0, { rough: 0.5 });
    const post = (x, z, h) => cyl(g, 0.035, 0.045, h, x, h / 2, z, 0x3b4148, { rough: 0.5, metal: 0.5, seg: 10 });
    const cap = {};
    const put = (id, label, x, z, shape, colour) => {
      post(x, z, 0.95);
      if (shape === "ball") cap[id] = ball(g, 0.075, x, 1.03, z, colour, { rough: 0.45, seg: 12 });
      else if (shape === "cyl") cap[id] = cyl(g, 0.07, 0.07, 0.12, x, 1.01, z, colour, { rough: 0.5, seg: 12 });
      else if (shape === "meter") cap[id] = instrument(g, x, 0.97, z, { ry: Math.atan2(-x, 3.6 - z), idle: "--", color: ACC });
      else cap[id] = box(g, 0.18, 0.14, 0.12, x, 1.02, z, colour, { rough: 0.5 });
      holoTag(g, label, x, 1.3, z, { css: "#5fd0b8", w: Math.min(0.6, 0.12 + label.length * 0.018) });
      reg(hits, cap[id], id);
    };
    put("test-meter", "voltage tester proof", -1.68, 1.47, "meter");
    put("arc-shirt", "arc-rated clothing", -2.09, 0.9, "box", 0x2a4f8f);
    put("rated-gloves", "rated rubber gloves", -2.25, 0.24, "ball", 0xd2312b);
    put("arc-hood", "arc-rated face shield", -2.13, -0.42, "cyl", 0x3a78c9);
    put("boundary-chain", "boundary chain", -1.74, -1.01, "cyl", 0xf0b323);
    cap["board-boundary"] = group(g, -1.14, 0.95, -1.45); post(-1.14, -1.45, 0.95);
    box(cap["board-boundary"], 0.3, 0.06, 0.3, 0, 0.03, 0, 0x2b2f34, { rough: 0.5, metal: 0.4 }); box(cap["board-boundary"], 0.22, 0.01, 0.22, 0, 0.065, 0, ACC, { emissive: ACC, ei: 0.4, rough: 0.5 });
    holoTag(g, "arc-flash boundary", -1.14, 1.3, -1.45, { css: "#5fd0b8", w: 0.44 }); reg(hits, cap["board-boundary"], "board-boundary");
    put("absence-test-point", "test each phase", -0.4, -1.68, "ball", 0x2b2f34);
    put("megger-meter", "insulation tester", 0.4, -1.68, "meter");
    put("board-breaker", "switchboard breaker", 1.14, -1.45, "box", 0x2b2f34);
    put("mv-personal-lock", "personal lock", 1.74, -1.01, "cyl", 0xd2312b);
    put("mv-tag", "signed tag", 2.13, -0.42, "box", 0xf0b323);
    put("pier-radio", "radio to the pier", 2.25, 0.24, "ball", 0x59637a);
    put("cable-hangers", "cable hangers", 2.09, 0.9, "cyl", 0x8a939b);
    put("gfci-test-button", "ground-fault test", 1.68, 1.47, "box", 0x3a78c9);
    put("co2-extinguisher", "CO2 extinguisher", 0.6, 2.3, "cyl", 0xd2312b);
    // the cables and sources to read (find steps)
    const item = (id, x, colour, kind) => { const o = kind === "cable" ? cyl(g, 0.04, 0.04, 1.0, x, 0.6, -2.7, colour, { rough: 0.8, seg: 8 }) : box(g, 0.3, 0.22, 0.2, x, 0.64, -2.7, colour, { rough: 0.6 }); if (kind === "cable") o.rotation.z = Math.PI / 2; cap[id] = o; reg(hits, o, id); return o; };
    item("wet-cable", -1.6, 0x1b1f24, "cable");
    item("dry-cable", -0.53, 0x1b1f24, "cable");
    item("battery-backfeed", 0.53, 0x3a78c9, "src");
    item("isolated-genset", 1.6, 0x59637a, "src");
    const puddle = box(g, 1.0, 0.01, 0.5, -1.6, 0.53, -2.7, 0x4c7fa6, { rough: 0.1, metal: 0.2, cast: false });
    box(g, 0.08, 0.1, 0.04, 1.6, 0.8, -2.6, 0xd2312b, { rough: 0.5 });
    box(g, 3.8, 0.05, 0.4, 0, 0.5, -2.7, 0x53585e, { rough: 0.6, metal: 0.4 });
    for (const sx of [-1.8, 1.8]) box(g, 0.05, 0.5, 0.36, sx, 0.25, -2.7, 0x53585e, { rough: 0.6, metal: 0.4 });
    const hazard = (id, text, x, z, ry) => { const hz = group(g, x, 0, z, ry); cyl(hz, 0.03, 0.03, 0.9, 0, 0.45, 0, 0x2b2f34, { rough: 0.5, seg: 8 });
      const pd = box(hz, 0.26, 0.18, 0.02, 0, 1.0, 0, 0xd2312b, { rough: 0.5 }); decal(pd, 0.22, 0.14, 0, 0, 0.012, signFace(text, { bg: "#5a0f0f", accent: "#ffffff", scale: 0.3 })); reg(hits, pd, id); };
    hazard("work-live-hazard", "WORK\nLIVE", -1.22, 2.96, 2.75);
    hazard("skip-prove-hazard", "SKIP\nPROVE", 1.22, 2.96, -2.75);
    hazard("cable-in-water-hazard", "CABLE\nIN WATER", -3.04, -1.01, 1.25);
    hazard("reclose-hazard", "RE-CLOSE\nBREAKER", 3.04, -1.01, -1.25);
    const board = holoPanel(g, 0.7, 0.46, -2.9, 1.55, 0.9, (ctx, w, h) => {
      ctx.fillStyle = "rgba(6,16,22,0.9)"; ctx.fillRect(0, 0, w, h); ctx.fillStyle = "#5fd0b8"; ctx.fillRect(0, 0, w, 5);
      ctx.fillStyle = "#eaf6fb"; ctx.font = `600 ${Math.round(h * 0.1)}px 'Barlow Condensed', Arial, sans-serif`; ctx.textAlign = "left"; ctx.textBaseline = "middle";
      ctx.fillText("SINGLE-LINE · MAIN SWITCHBOARD", w * 0.06, h * 0.14);
      ctx.font = `${Math.round(h * 0.07)}px Arial, sans-serif`; ctx.fillStyle = "#a9c6d6";
      ["Source 1: shore pedestal", "Source 2: on-board generator", "Source 3: battery bank", "Isolate and prove every source"].forEach((l, i) => ctx.fillText(l, w * 0.06, h * (0.32 + i * 0.12)));
    }, { ry: 0.9, accent: ACC });
    reg(hits, board, "single-line-drawing");
    const logSign = group(g, 2.9, 0, 1.0, -0.9);
    box(logSign, 0.44, 0.32, 0.03, 0, 1.2, 0, 0x1b232b, { rough: 0.6 });
    const logFace = decal(logSign, 0.4, 0.28, 0, 1.2, 0.02, signFace("PERMIT LOG\nOPEN", { bg: "#11181f", accent: "#5fd0b8", scale: 0.26 }), { px: 320 });
    holoTag(logSign, "permit log", 0, 1.46, 0, { css: "#5fd0b8", w: 0.3 });
    reg(hits, logSign, "mv-log");
    for (let i = 0; i < 24; i++) box(g, 0.5, 0.12, 0.3, (i % 2 ? 1 : -1) * 4.25, 0.18 + (Math.floor(i / 2) % 4) * 0.14, 1.2 + Math.floor(i / 8) * 0.5, [0x6d767e, 0xb08a4a, 0x2a4f8f][i % 3], { rough: 0.8 });
    const shoreLamp = ball(g, 0.07, 3.9, 1.35, -4.2, 0x59c97b, { emissive: 0x59c97b, ei: 1.2, seg: 10 });
    shoreLamp.visible = false;
    const faultLamp = ball(g, 0.07, 3.4, 2.0, -3.2, 0xd2312b, { emissive: 0xd2312b, ei: 1.6, seg: 12 });
    faultLamp.visible = false;
    const crew = standingFigure(g, -3.9, 0.8, { ry: 1.2, cloth: 0x2a4f8f, helmet: 0xf2f2f2 });
    holoTag(crew, "yard electrical supervisor", 0, 1.95, 0.15, { css: "#5fd0b8", w: 0.46 });
    const faultOn = /[?&]fault=backfeed(&|$)/.test(globalThis.location?.search ?? "");
    const fStep = SIM_LP_MARINE_VESSEL_ELECTRICAL_SAFETY.steps.find((s) => s.id === "find-backfeed");
    const fDecl = SIM_LP_MARINE_VESSEL_ELECTRICAL_SAFETY.faults[0];
    if (fStep) { fStep.targets = [faultOn ? fDecl.target : fDecl.from]; fStep.target = fStep.targets[0]; fStep.cue = faultOn ? fDecl.note : fDecl.cue; }
    if (faultOn) holoTag(g, "Backfeed source: CHECK", 3.4, 2.25, -3.2, { css: "#d2312b", w: 0.46 });
    faultLamp.visible = faultOn;
    return {
      hits,
      footprint: 2.9,
      spawnLook: new THREE.Vector3(0, 1.3, 3.6),
      onInterrupt(it) {
        if (it.id === "shore-reclosed") { shoreLamp.visible = true; pedestal.material = mat(0xf0645b, { rough: 0.5, emissive: 0xf0645b, ei: 0.5 }); }
        if (it.id === "deck-flooding") { puddle.scale.set(2.2, 1, 2.2); cap["cable-hangers"].material = mat(0xf0b323, { rough: 0.5, emissive: 0xf0b323, ei: 0.5 }); }
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "shore-reclosed") { shoreLamp.visible = false; pedestal.material = mat(0x2f6fb0, { rough: 0.5 }); cap["pier-radio"].material = mat(0x59c97b, { rough: 0.5 }); }
        if (it.id === "deck-flooding") { cap["wet-cable"].position.y = 1.4; cap["cable-hangers"].material = mat(0x59c97b, { rough: 0.5 }); }
      },
      onStepComplete(step) {
        if (step.id === "prove-tester") repaint(cap["test-meter"].userData.screen, signFace("OK", { bg: "#0d1c24", accent: "#59c97b", fg: "#bfeaf7", scale: 0.5 }));
        if (step.id === "mv-handover") repaint(logFace, signFace("PERMIT LOG\nCLOSED", { bg: "#0f1b14", accent: "#59c97b", fg: "#bff7d4", scale: 0.26 }));
        if (step.id === "lock-board" && cubicles[2]) cubicles[2].material = mat(0xf0b323, { rough: 0.5, metal: 0.3 });
      },
      onHazard() {},
      animate(t, dt, session) {
        crew.userData.head.rotation.y = Math.sin(t * 0.5) * 0.3;
        if (shoreLamp.visible) shoreLamp.scale.setScalar(0.9 + Math.abs(Math.sin(t * 4)) * 0.3);
        const gg = session?.gauge;
        if (gg && !gg.committed && session?.step?.id === "prove-tester") repaint(cap["test-meter"].userData.screen, signFace(gg.t > 0.44 && gg.t < 0.62 ? "OK" : "CHECK", { bg: "#0d1c24", accent: gg.t > 0.44 && gg.t < 0.62 ? "#59c97b" : "#f0645b", fg: "#bfeaf7", scale: 0.5 }));
      },
    };
  },
};
