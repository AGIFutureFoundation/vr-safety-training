import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import { box, cyl, ball, slab, group, decal, repaint, signFace, particles, mat } from "../../../shared/kit.js";
import { CITY, stationPad, holoPanel, holoTag, toolChest, instrument, lockTag, barrierPanel, standingFigure, reg } from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Substation Switching VR — Energy & Power, station four.
// Taking a distribution feeder breaker out of service for maintenance on a
// written switching order: every step is read back to the control centre
// before it is done, the breaker is opened before the disconnects, the
// disconnects are opened before anything is grounded, and the grounds go on
// before a hand goes near the bus. A step out of order on a 12 kV feeder is
// an arc flash in a steel room.

const SS_ACCENT = 0xffb84d;

export const SIM_SUBSTATION_SWITCHING = {
  id: "substation-switching",
  index: "33",
  domain: "Energy",
  trade: "Substation electrician / switching operator",
  category: "Energy & Power",
  weather: "overcast",
  certification: "IBEW — utility switching and tagging authorisation; OSHA 29 CFR 1910.269 (electric power generation, transmission and distribution); NFPA 70E arc-flash PPE for the verification",
  name: "Substation Switching",
  title: simTitle("Substation Switching"),
  tagline: "Feeder outage on a written switching order: read-back, breaker open, disconnects open, test dead, grounds on, tag, hand-off",
  accent: SS_ACCENT,
  accentCss: "#ffb84d",
  parSeconds: 245,
  footprint: 2.4,
  badge: { id: "order-held", name: "Order Held", note: "Every step of the switching order read back, done in sequence, tested dead and grounded before the hand-off" },

  game: system({
    name: "Switching Authority",
    currency: "STEP",
    ranks: ["Sub Tech", "Switching Operator", "Senior Operator", "System Operator", "Switching Authority Certified"],
    badges: [
      { id: "read-back", name: "Read-Back", note: "Every step confirmed with the control centre before it was done", test: AWARD.stepClean("readback") },
      { id: "breaker-first", name: "Breaker First", note: "Never opened a disconnect under load, never grounded untested bus", test: AWARD.safe },
      { id: "proven-dead", name: "Proven Dead", note: "Phase-to-ground readings inside the dead band on every phase", test: AWARD.precise(0.7) },
    ],
    challenges: [
      { id: "clean-order", name: "Clean Order", note: "No corrections through the whole switching order", test: AWARD.clean },
      { id: "grounds-held", name: "Grounds Held", note: "Held the ground clamps to the click every time", test: AWARD.unbroken },
      { id: "outage-window", name: "Outage Window", note: "Feeder cleared inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "disconnect-under-load": "You went to open the line disconnect with the breaker still closed. A disconnect is not rated to break load — opening it under 12 kV of feeder current draws an arc across the blades that does not stop until something melts.",
    "ground-untested": "You reached for the ground clamps before the bus was tested dead. Grounds on an energised bus are a bolted fault with your hands on the lead; the test comes first, every phase, every time.",
    "skip-readback": "You did the step without reading it back to the control centre. The order exists so two people agree on every switch before it moves — a step done alone is a step the system operator does not know happened.",
    "no-arc-ppe": "You approached the cubicle for the test without arc-rated PPE. The verification is the one step where the bus might still be live; the label on the cubicle says what to wear, and it is worn.",
  },

  lateNotes: {
    "line-disconnect": "The breaker opens first — a disconnect is opened only with no current through it.",
    "ground-a": "Grounds go on after the bus is proven dead on every phase, never before.",
  },


  // Interruptions: see shared/game.js. On a switching job the danger is not
  // usually the switching — it is somebody arriving in the middle of it.
  interrupts: [
    {
      id: "unescorted-visitor",
      kind: "Yard breach",
      after: "test", delay: 5, seconds: 12,
      alert: "Somebody has walked into the yard behind you in a hard hat and a hi-vis and nothing else. They want a word.",
      cue: "Stop. Go to the person and walk them back out of the boundary.",
      target: "yard-visitor",
      why: "The boundary is not a courtesy. Anyone inside it while a bus is being proved is inside the arc-flash boundary, and a hi-vis vest is fuel. You do not shout a warning across a yard and carry on — you stop the job and escort them out, because they are the only person here who does not know what they have walked into.",
      missNote: "You carried on testing with an unprotected person standing inside the boundary. If that bus had been live behind the disconnect, the person who did not know what they had walked into would have taken the incident energy with you.",
      wrongNote: "The person in the yard is the hazard right now. Deal with them before anything else on this order.",
    },
    {
      id: "order-changed",
      kind: "Control call",
      after: "grounds", delay: 5, seconds: 14,
      alert: "Control is calling. They are asking you to leave one set of grounds off because another crew wants the line back early.",
      cue: "Take the call and read it back before you do anything with it.",
      target: "radio",
      why: "A verbal change to a switching order is not a switching order. It gets read back, logged and re-issued, or it did not happen — and the person holding the grounds is the one who wears the consequence of a change nobody wrote down.",
      missNote: "You ignored control mid-operation. Either the change was real and you are now out of step with the people operating the other end of that line, or it was not and nobody knows which.",
      wrongNote: "That is not the radio. A call from control during a switching operation is answered and read back, every time.",
    },
  ],

  steps: [
    {
      id: "order", kind: "select", target: "switching-order",
      title: "Read the switching order",
      cue: "Read the order end to end: feeder, breaker, disconnects, test points, grounds, tag.",
      why: "A switching order is drafted by one operator and independently checked by another before it is ever issued, precisely because a single step done out of sequence against a live 12 kV bus is an arc flash, not a paperwork error. The operator reads the whole order before touching the first line, since a step that looks harmless in isolation — opening a disconnect before the breaker, grounding before the test — is only safe in the sequence the order puts it in.",
    },
    {
      id: "readback", kind: "select", target: "radio",
      title: "Read back step 1 to the control centre",
      cue: "Call the system operator, identify yourself, read back the step, get the go-ahead.",
      why: "Two people agree on every switch before it moves, because the operator at the cubicle cannot see the rest of the system and the control centre cannot see the cubicle. The read-back is the only check that the order in your hand is the exact order the control centre thinks it is issuing — a misheard step number here can leave a breaker elsewhere opening on a line a different crew still has hands on.",
    },
    {
      id: "ppe", kind: "sequence", anyOrder: true,
      targets: ["arc-suit", "arc-hood"],
      itemNames: { "arc-suit": "arc-rated suit", "arc-hood": "arc-rated hood and gloves" },
      title: "Arc-rated PPE for the cubicle",
      cue: "Suit, hood and gloves to the cubicle's arc-flash label before the door opens.",
      why: "The cubicle's own arc-flash label states the incident energy that door can release if the bus behind it turns out to still be live. The suit, hood and gloves are rated to that specific number, not to a general sense of caution, and none of it is optional to put on after the door is already open — by then the exposure it exists to prevent has already started.",
    },
    {
      id: "breaker", kind: "turn", target: "feeder-breaker",
      title: "Open the feeder breaker",
      cue: "Trip the feeder breaker and confirm it shows OPEN on the mimic.",
      why: "The breaker is the one device in this line-up built to interrupt load current without destroying itself doing it. It opens first so everything downstream of it — the disconnects, the bus, the grounds — is de-energised before any of it is touched, since none of that other equipment is rated to break the current the breaker was designed for.",
      turn: { turns: 0.5, axis: "y", label: "BREAKER" },
    },
    {
      id: "disconnects", kind: "sequence",
      targets: ["line-disconnect", "bus-disconnect"],
      itemNames: { "line-disconnect": "line-side disconnect", "bus-disconnect": "bus-side disconnect" },
      title: "Open the disconnects",
      cue: "Line-side disconnect open, then bus-side — visible breaks each side of the breaker.",
      why: "With the breaker already open there is no load current left for a disconnect to interrupt, which is the only reason it is safe to move by hand. Opening both the line side and the bus side leaves two visible breaks in the circuit, isolating the breaker from either direction it could otherwise be back-fed from — one disconnect left closed is a path the grounds you hang next do not account for.",
      outOfOrderNote: "Line side first, then bus side — the order says so, and the order is what was read back.",
    },
    {
      id: "test", kind: "gauge", target: "test-probe",
      title: "Test the bus dead — every phase",
      cue: "Prove the tester on a live source, test A, B and C phase to ground, prove the tester again; commit on a dead reading.",
      why: "Open disconnects are a claim about the state of the bus, not a measurement of it — the tester is the only proof there is. Every phase gets tested on its own, and the tester is proved against a known live source both before and after, because a bus that reads dead on a broken tester looks exactly like a bus that actually is dead, right up until somebody grounds it and finds out which one it was.",
      gauge: { label: "PHASE-GND", speed: 0.75, green: [0.0, 0.14], readout: (t) => `${(t * 12).toFixed(1)} kV`, missNote: "That phase is not dead — stop. Recheck the disconnects and the source before anything else." },
    },
    {
      id: "grounds", kind: "sequence",
      targets: ["ground-a", "ground-b", "ground-c"],
      itemNames: { "ground-a": "A-phase ground", "ground-b": "B-phase ground", "ground-c": "C-phase ground" },
      title: "Apply the grounds",
      cue: "Ground end to the ground bus first, then the clamp to each phase, A, B, C, with the hot stick.",
      why: "Grounds are what actually make an isolated bus safe to work on: if anything back-feeds past the open disconnects, the fault current has a path to ground instead of a path through whoever is standing at the bus. The ground end goes onto the ground bus first and the clamp goes onto the phase second, so the clamp end in your hand is never the live end of an unterminated ground lead.",
      outOfOrderNote: "A, B, C in the order on the switching order — the read-back was for that sequence.",
    },
    {
      id: "clamp", kind: "hold", target: "ground-clamp", seconds: 4,
      title: "Torque the ground clamps",
      cue: "Hold each clamp to the click of the hot-stick torque head.",
      why: "A ground clamp that is only hand-tight can lift clear of the phase under the mechanical force of real fault current, at the exact moment the ground exists to carry that current instead of the crew. The hot-stick torque head clicks at the manufacturer's rated torque, and holding to that click — not to a guess at how tight feels right — is what keeps the clamp seated when a fault actually arrives.",
      holdBreakNote: "Came off before the click — the clamp is not seated. Set it again.",
    },
    {
      id: "tag", kind: "select", target: "hold-tag",
      title: "Tag and lock the isolation",
      cue: "Hang the hold tag with the order number on the breaker and each disconnect, and lock them.",
      why: "The hold tag names the switching order number, the operator who hung it, and the crew that now holds exclusive control of this feeder. Locked onto the breaker and both disconnects, it is a physical statement that nothing on this equipment moves again until the crew named on it calls the control centre and releases it — not once the outage merely looks finished.",
    },
    {
      id: "walk", kind: "find", noHint: true,
      targets: ["cracked-insulator"],
      itemNames: { "cracked-insulator": "cracked bus insulator" },
      itemNotes: { "cracked-insulator": "The C-phase bus support insulator is cracked through the skirts — a tracking path to the frame. It goes on the outage work list now, while the feeder is dead." },
      title: "Walk the cubicle before the hand-off",
      cue: "Inspect the bus, supports and connections while it is dead, and click what the maintenance crew needs to know.",
      why: "The feeder is only dead for the length of this outage window, and whatever the walk-down finds now is what gets fixed inside it. A cracked insulator or a loose connection missed during this window is live again the moment the feeder is restored, left waiting either for the next planned outage to catch it or to fail on its own and cause one.",
    },
    {
      id: "handoff", kind: "select", target: "radio-handoff",
      title: "Report the feeder clear",
      cue: "Call the control centre: order complete, feeder isolated, grounded and tagged, handed to the maintenance crew.",
      why: "The hand-off is what formally closes the switching order: the control centre logs the feeder out of service against your name and this order number, and the maintenance crew now holds clearance on it until they call control back to release it. Nobody re-energises a feeder that is still logged to another crew's open order.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.4, SS_ACCENT);
    box(g, 5.6, 0.1, 5.0, 0, 0.05, 0, 0x4a4e52, { rough: 0.9 });
    // Switchgear line-up: three cubicles, the feeder cubicle in the middle with its door open.
    for (const [x, label] of [[-1.7, "FEEDER 21"], [0, "FEEDER 22"], [1.7, "BUS TIE"]]) {
      const c = group(g, x, 0.1, -1.6);
      box(c, 1.5, 2.3, 1.2, 0, 1.15, 0, 0x6f7a83, { rough: 0.5, metal: 0.5 });
      decal(c, 1.0, 0.16, 0, 2.15, 0.61, signFace(label, { bg: "#1b1e22", accent: "#ffb84d", scale: 0.55 }));
      decal(c, 0.8, 0.12, 0, 1.95, 0.61, signFace("12 kV · ARC FLASH CAT 4", { bg: "#f2c14b", accent: "#1b1e22", scale: 0.5 }));
    }
    const cub = group(g, 0, 0.1, -1.6);
    const door = box(cub, 0.7, 1.4, 0.04, -0.75, 1.0, 0.7, 0x6f7a83, { rough: 0.5, metal: 0.5 });
    door.rotation.y = 1.4;
    // Mimic: breaker handle, two disconnect handles, live indicators.
    const mimic = group(cub, 0, 1.6, 0.62);
    box(mimic, 1.3, 0.5, 0.02, 0, 0, 0, 0x11181f, { rough: 0.6 });
    const brk = group(mimic, -0.4, 0, 0.03);
    cyl(brk, 0.06, 0.06, 0.03, 0, 0, 0, 0x22262b, { rough: 0.5, seg: 14 }).rotation.x = Math.PI / 2;
    const brkHandle = box(brk, 0.03, 0.12, 0.02, 0, 0, 0.02, 0xd2312b, { rough: 0.5 });
    const brkFace = decal(brk, 0.16, 0.05, 0, 0.12, 0.01, signFace("CLOSED", { bg: "#2a0c0c", accent: "#d2312b", scale: 0.55 }));
    reg(hits, brk, "feeder-breaker");
    const discFaces = {};
    for (const [id, dx, label] of [["line-disconnect", 0.1, "LINE DISC"], ["bus-disconnect", 0.45, "BUS DISC"]]) {
      const d = group(mimic, dx, 0, 0.03);
      box(d, 0.08, 0.16, 0.03, 0, 0, 0, 0x22262b, { rough: 0.5 });
      const h = box(d, 0.02, 0.1, 0.02, 0, 0.02, 0.025, 0xd2312b, { rough: 0.5 });
      discFaces[id] = { h, face: decal(d, 0.16, 0.04, 0, 0.13, 0.01, signFace(label, { bg: "#22262b", accent: "#ffb84d", scale: 0.5 })) };
      reg(hits, d, id);
    }
    const underLoad = box(mimic, 0.2, 0.2, 0.1, 0.1, -0.25, 0.05, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(mimic, "disc first?", 0.1, -0.32, 0.08, { css: "#d2312b", w: 0.22 });
    reg(hits, underLoad, "disconnect-under-load");
    // Bus compartment with three phases, ground bus, test point, insulators.
    const bus = group(cub, 0, 0.7, 0.3);
    const phases = {};
    for (const [key, x] of [["a", -0.4], ["b", 0], ["c", 0.4]]) {
      const p = cyl(bus, 0.03, 0.03, 0.9, x, 0, 0, 0xc98b3c, { rough: 0.35, metal: 0.8, seg: 12 });
      const ins = cyl(bus, 0.05, 0.06, 0.12, x, -0.5, 0, 0xdfe6ea, { rough: 0.6, seg: 12 });
      phases[key] = { p, ins };
      const gnd = group(bus, x, 0.2, 0.15);
      const gndBox = box(gnd, 0.08, 0.06, 0.06, 0, 0, 0, 0xffd54a, { rough: 0.5, metal: 0.4, opacity: 0.3, transparent: true });
      phases[key] = { ...phases[key], gndBox };
      phases[key].gnd = gnd; phases[key].gndBox = gndBox;
      reg(hits, gnd, `ground-${key}`);
    }
    const crack = box(bus, 0.02, 0.1, 0.02, 0.4, -0.5, 0.06, 0x1b1e22, { rough: 0.9 });
    reg(hits, crack, "cracked-insulator");
    const groundBus = box(bus, 1.2, 0.03, 0.03, 0, -0.62, 0.2, 0x59c97b, { rough: 0.5, metal: 0.6 });
    const groundUntested = box(bus, 1.2, 0.3, 0.2, 0, 0.35, 0.2, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(bus, "grounds now?", 0, 0.6, 0.3, { css: "#d2312b", w: 0.24 });
    reg(hits, groundUntested, "ground-untested");
    const clampZone = box(bus, 1.2, 0.15, 0.15, 0, 0.2, 0.2, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, clampZone, "ground-clamp");
    // Test probe (hot stick with tester), radio, order, PPE, tags.
    const chest = toolChest(g, 2.3, 0.2, { ry: -0.7, color: 0x6a4a1a });
    const probe = instrument(chest, -0.06, 0.79, 0, { ry: 0.3, idle: "-- kV", color: 0xffb84d, w: 0.12, d: 0.19 });
    holoTag(probe, "hot-stick tester", 0, 0.16, 0, { css: "#ffb84d", w: 0.3 });
    reg(hits, probe, "test-probe");
    const radio = instrument(chest, 0.16, 0.79, 0.1, { ry: 0, idle: "CTRL CTR", color: 0xffb84d, w: 0.1, d: 0.16 });
    holoTag(radio, "read back", 0, 0.15, 0, { css: "#ffb84d", w: 0.2 });
    reg(hits, radio, "radio");
    const radioClear = instrument(chest, 0.16, 0.79, -0.12, { ry: 0, idle: "HAND-OFF", color: 0x59c97b, w: 0.1, d: 0.16 });
    holoTag(radioClear, "report clear", 0, 0.15, 0, { css: "#59c97b", w: 0.24 });
    reg(hits, radioClear, "radio-handoff");
    const tag = group(chest, -0.3, 0.9, -0.15);
    box(tag, 0.1, 0.14, 0.01, 0, 0, 0, 0xd2312b, { rough: 0.6 });
    decal(tag, 0.09, 0.06, 0, 0, 0.006, signFace("HOLD", { bg: "#d2312b", accent: "#ffffff", scale: 0.6 }));
    reg(hits, tag, "hold-tag");
    const hung = lockTag(brk, 0.08, -0.1, 0.03, { color: 0xffb84d });
    hung.visible = false;
    const ppeRack = group(g, -2.3, 0.1, 0.4, 0.6);
    box(ppeRack, 0.6, 1.6, 0.3, 0, 0.8, 0, 0x2b2f34, { rough: 0.6 });
    const suit = box(ppeRack, 0.4, 0.9, 0.1, 0, 0.9, 0.2, 0x2f4f8c, { rough: 0.8 });
    holoTag(suit, "arc suit — 40 cal", 0, 0.55, 0, { css: "#ffb84d", w: 0.3 });
    reg(hits, suit, "arc-suit");
    const hood = ball(ppeRack, 0.14, 0, 1.5, 0.2, 0x2f4f8c, { rough: 0.8 });
    holoTag(hood, "hood + gloves", 0, 0.24, 0, { css: "#ffb84d", w: 0.26 });
    reg(hits, hood, "arc-hood");
    // The unescorted visitor. They stand outside the barrier for the whole
    // job and walk in during the test step — see the interruption above. The
    // hard hat and hi-vis are the point: it is the PPE of somebody who
    // believes they are dressed for this yard.
    const visitor = standingFigure(g, 2.9, 2.85, { ry: -2.5, cloth: 0x37505f, helmet: 0xf2c14b, vest: 0xe4dc3a });
    holoTag(visitor, "visitor — hard hat and hi-vis only", 0, 1.95, 0, { css: "#d2312b", w: 0.62 });
    reg(hits, visitor, "yard-visitor");
    const visitorHome = visitor.position.clone();
    const noPpe = box(g, 0.4, 0.3, 0.4, 0.9, 0.7, -0.5, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "approach in street clothes?", 0.9, 1.0, -0.5, { css: "#d2312b", w: 0.44 });
    reg(hits, noPpe, "no-arc-ppe");
    const skipRb = box(g, 0.4, 0.3, 0.4, -1.0, 0.7, -0.4, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "just do the step?", -1.0, 1.0, -0.4, { css: "#d2312b", w: 0.32 });
    reg(hits, skipRb, "skip-readback");
    const board = group(g, 2.2, 0, 1.6, -0.9);
    holoPanel(board, 0.9, 0.62, 0, 1.25, 0, (ctx, w, h) => {
      ctx.fillStyle = "#1f1608"; ctx.fillRect(0, 0, w, h); ctx.fillStyle = "#ffb84d"; ctx.fillRect(0, 0, w, 6);
      ctx.font = `600 ${Math.round(h * 0.11)}px 'Barlow Condensed', Arial, sans-serif`; ctx.textAlign = "left"; ctx.textBaseline = "middle";
      ctx.fillText("SWITCHING ORDER 2026-0917-04 — FEEDER 22", w * 0.06, h * 0.13);
      ctx.font = `${Math.round(h * 0.075)}px Arial, sans-serif`; ctx.fillStyle = "#fff0d6";
      ["1 Read back each step to control centre", "2 Arc PPE per cubicle label", "3 Open breaker 22 — confirm OPEN", "4 Open line disc 22L, then bus disc 22B",
       "5 Test dead A, B, C — prove tester", "6 Ground A, B, C — ground end first", "7 Torque clamps, tag and lock, hand off"].forEach((l, i) => ctx.fillText(l, w * 0.06, h * (0.27 + i * 0.1)));
    }, { accent: SS_ACCENT });
    reg(hits, board, "switching-order");
    barrierPanel(g, -1.2, 1.6, { color: 0xe4622a }); barrierPanel(g, 1.0, 1.6, { color: 0xe4622a });
    const arcGlow = particles(cub, 30, 0xffe08a, { size: 0.02, life: 0.3, opacity: 0.6 });

    // Yard dressing: perimeter fence along the back of the yard, a spare
    // ground-rod rack, extra insulator stand-offs on the switchgear, a
    // strobe over the PPE rack and trench cover plates running from the
    // cubicles toward the test position — none of it interactive, all of it
    // clear of the crew figure and every control.
    const fenceZ = 2.55;
    for (let i = 0; i < 6; i++) {
      const px = -2.4 + i * 0.9;
      cyl(g, 0.025, 0.025, 1.8, px, 0.9, fenceZ, 0x4a5158, { rough: 0.6, metal: 0.5, seg: 8 });
      if (i > 0) {
        box(g, 0.9, 1.6, 0.015, px - 0.45, 0.9, fenceZ, 0x6f7a83, { rough: 0.8, metal: 0.2, opacity: 0.35, transparent: true, cast: false });
      }
    }
    const rodRack = group(g, -2.6, 0.1, -0.35);
    box(rodRack, 0.5, 0.08, 0.22, 0, 0.04, 0, 0x3a2f22, { rough: 0.85 });
    for (let i = 0; i < 4; i++) {
      cyl(rodRack, 0.014, 0.014, 0.9, -0.18 + i * 0.12, 0.5, 0, 0x8a6a3a, { rough: 0.55, metal: 0.6, seg: 10 }).rotation.z = 0.08;
    }
    for (const sx of [-0.62, 0.62]) {
      cyl(bus, 0.045, 0.05, 0.1, sx, -0.5, 0, 0xdfe6ea, { rough: 0.6, seg: 10 });
    }
    const strobeMast = group(ppeRack, 0, 1.65, 0);
    cyl(strobeMast, 0.02, 0.02, 0.14, 0, 0, 0, 0x2b2f34, { rough: 0.6, metal: 0.5, seg: 8 });
    ball(strobeMast, 0.035, 0, 0.09, 0, 0xd2312b, { emissive: 0xd2312b, ei: 1.1 });
    for (let i = 0; i < 3; i++) {
      slab(g, 0.5, 0.02, 0.35, -0.6 + i * 0.55, 0.011, -0.55, 0x3b3f43, { radius: 0.01, rough: 0.85 });
    }

    let energised = true;
    return {
      hits,
      spawnLook: new THREE.Vector3(0, 1.3, -1.6),
      onStep() {},
      // The visitor arrives in the yard and the radio lights up. Both are
      // visible from the switching position. See shared/game.js.
      onInterrupt(it) {
        if (it.id === "unescorted-visitor") { visitor.position.set(1.15, visitorHome.y, 1.35); visitor.rotation.y = -0.4; }
        if (it.id === "order-changed") { radio.material = mat(0xf2c14b, { emissive: 0xf2c14b, ei: 1.8, rough: 0.5 }); }
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "unescorted-visitor") { visitor.position.copy(visitorHome); visitor.rotation.y = -2.5; }
        if (it.id === "order-changed") { radio.material = mat(0x2b3138, { rough: 0.6, metal: 0.3 }); }
      },
      onStepComplete(step) {
        if (step.id === "breaker") { energised = false; brkHandle.rotation.z = Math.PI / 2; repaint(brkFace, signFace("OPEN", { bg: "#0d2b22", accent: "#59c97b", scale: 0.55 })); }
        if (step.id === "disconnects") for (const d of Object.values(discFaces)) d.h.rotation.z = Math.PI / 2;
        if (step.id === "grounds") for (const p of Object.values(phases)) p.gndBox.material.opacity = 1;
        if (step.id === "tag") hung.visible = true;
        if (step.id === "walk") crack.visible = false;
      },
      onHazard() {},
      animate(t, dt, session) {
        const step = session?.step;
        for (const p of Object.values(phases)) p.p.material.emissiveIntensity = energised ? 0.3 + Math.sin(t * 8) * 0.2 : 0;
        if (session?.turn && step?.id === "breaker") brkHandle.rotation.z = session.turn.amount / session.turn.required * Math.PI / 2;
        const gg = session?.gauge;
        if (gg && !gg.committed && step?.id === "test") repaint(probe.userData.screen, signFace(`${(gg.t * 12).toFixed(1)} kV`, { bg: "#0d1c24", accent: gg.t <= 0.14 ? "#59c97b" : "#d2312b", fg: "#fff0d6", scale: 0.62 }));
      },
    };
  },
};
