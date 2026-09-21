import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, ball, torus, slab, hose, group, decal, repaint, signFace, particles, mat,
} from "../../../shared/kit.js";
import {
  CITY, stationPad, holoPanel, holoTag, toolChest, cone, barrierPanel, instrument, lockTag,
  standingFigure, reg,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Track Access VR — its own gamified system: Right-of-Way.
// Rail track worker protection. The third rail does not announce itself and a
// train at line speed cannot stop for a lookout's shout.

export const SIM_TRACK_ACCESS = {
  id: "track-access",
  index: "07",
  domain: "Mobility",
  trade: "Rail track worker",
  category: "Mobility & Transit",
  weather: "fog",
  certification: "BMWED — FRA 49 CFR 214 Roadway Worker Protection qualified",
  name: "Track Access",
  title: simTitle("Track Access"),
  tagline: "Track possession, third-rail isolation and lookout protection",
  accent: 0xf2894b,
  accentCss: "#f2894b",
  parSeconds: 220,
  badge: { id: "possession-clear", name: "Possession Clear", note: "Full possession taken and handed back with nothing skipped" },

  game: system({
    name: "Right-of-Way",
    currency: "TRACK",
    ranks: ["Track Trainee", "Track Worker", "Possession Lead", "Protection Officer", "Right-of-Way Certified"],
    badges: [
      { id: "clear-of-rail", name: "Clear of Rail", note: "Never cross the fouling point unprotected", test: AWARD.safe },
      { id: "gauge-true", name: "Gauge True", note: "Every track measurement near band centre", test: AWARD.precise(0.72) },
      { id: "possession-clean", name: "Clean Possession", note: "Take and hand back possession with no correction", test: AWARD.all(AWARD.stepClean("possession"), AWARD.stepClean("handback")) },
    ],
    challenges: [
      { id: "engineering-hours", name: "Engineering Hours", note: "Complete inside 80% of par", test: AWARD.fast(0.8) },
      { id: "first-possession", name: "First Possession", note: "Clean run, no corrections", test: AWARD.clean },
      { id: "ten-clear", name: "Ten Clear", note: "Ten correct actions in a row", test: AWARD.streak(10) },
    ],
  }),

  hazards: {
    "third-rail": "That is the traction current rail. Isolation confirmed elsewhere does not matter here until you have proven this section dead — it carries enough current to kill on contact, no arc required.",
    "unprotected-crossing": "You crossed the running line without the lookout's clearance. A train at line speed covers that distance faster than you can react to a warning.",
    "solo-worksite": "You are working without a second person in sight. Track protection is never a one-person job — the lookout exists because you cannot watch the line and do the work at the same time, and an ANSI/ISEA-rated hi-vis vest does nothing for a worker that nobody is actually watching for.",
    "unmarked-boundary": "That limit of possession has no board. Without a marked boundary a train movement has no way to know where your protection actually ends.",
  },

  lateNotes: {
    "rail-clamp": "Nothing gets clamped to the rail before possession is confirmed and the current is proven off.",
    "track-gauge": "Track geometry is measured after possession is secured, never while trains could still be moving.",
  },

  // Interruptions: see shared/game.js. On the track, neither of the two things
  // keeping you alive is a thing you own — the current is off because somebody
  // else has not closed it, and the line is watched because somebody else is
  // still watching it.
  interrupts: [
    {
      id: "section-relit",
      kind: "Section re-energised",
      after: "clamp", delay: 4, seconds: 12,
      alert: "The isolator lamp has gone back to red. Traction current is in this section again and your hands are on the bonding clamp.",
      cue: "Your lever is still off. The current did not come from your lever.",
      target: "signaller-radio",
      why: "An isolation is a shared state, not a switch position. Your isolator is one end of a section that can be fed from the other, and the only thing holding the far end open is the signaller knowing there are people between your boards. So when the current comes back with your own lever still off, the answer is not the lever — it is the one voice that can reach whoever closed it. You call, you say where your people are, and nothing touches that rail again until the far end is confirmed open and your own tester says so.",
      missNote: "You carried on bonding a joint on a re-energised conductor rail. Seven hundred volts DC needs no arc and gives no warning: it is a contact injury, at the hand already on the clamp, and the lookout is the only person who would have seen it happen.",
      wrongNote: "That is not what gets the current off. Your own isolator is already open — this one has to go to the signaller.",
    },
    {
      id: "lookout-adrift",
      kind: "Protection lapsed",
      after: "gauge", delay: 4, seconds: 12,
      alert: "Your lookout has turned away and started walking up the cess. Nobody is watching the line and you are kneeling between the rails with a gauge in both hands.",
      cue: "Protection here is a person, and the person has stopped doing it.",
      target: "lookout-worker",
      why: "A lookout is not a formality standing near the job — they are the arrangement under which one person is permitted to face away from the line at all. The sighting distance on the briefing sheet is worked back from line speed so that a warning arrives with enough seconds in it to stand, turn and get clear, and every one of those seconds assumes somebody is looking. The moment the protection lapses the work stops. You do not finish the measurement first, because the measurement is exactly how long you would not have seen the train.",
      missNote: "You finished the gauge measurement with nobody watching the line. In fog, kneeling inside the four foot, every part of that job was resting on a warning that was not coming, and the first thing that would have told you is the one that arrives far too late to use.",
      wrongNote: "That is not what protects you out here. Stop, and get the lookout back on the line before another reading is taken.",
    },
  ],

  steps: [
    {
      id: "briefing", kind: "select", target: "briefing-board",
      title: "Attend the possession briefing",
      cue: "Read the possession plan: limits, isolation, lookout arrangement.",
      why: "Everyone on site works to the same plan under FRA roadway worker protection rules at 49 CFR Part 214. A worker who missed the briefing does not know where the protection actually starts and ends, and the crew has no way to know that they do not know.",
    },
    {
      id: "possession", kind: "select", target: "signaller-radio",
      title: "Take possession from the signaller",
      cue: "Confirm with the signaller that possession is granted for this section.",
      why: "Until the signaller says the words that grant it, the section is still open to traffic as far as the signalling system is concerned, regardless of what the engineering schedule says should be happening. Possession is a spoken confirmation you can quote back, not an assumption drawn from a timetable.",
    },
    {
      id: "isolate", kind: "turn", target: "isolation-switch",
      title: "Isolate the traction current",
      cue: "Swing the traction power isolator for this section fully over to OFF.",
      why: "The isolator is what removes the current, but the switch position alone is not proof of anything — that comes at the next step. It goes fully over, too: a lever left part way across its travel is a lever that has not actually broken the circuit, whatever the handle looks like from the cab.",
      turn: { turns: 0.25, axis: "z", reverse: true, label: "TRACTION ISOLATOR" },
    },
    {
      id: "verify", kind: "gauge", target: "rail-tester",
      title: "Prove the traction rail is dead",
      cue: "Test the rail with the approved tester and commit when it reads safe.",
      why: "The same rule as any other isolation: measured with an approved tester, never assumed from a switch position or a control-room readout. Seven hundred volts DC through a conductor rail gives no warning and needs no arc to kill, so a reading near zero is the only thing that makes the rail approachable at all.",
      gauge: {
        label: "TRACTION RAIL — VOLTAGE", speed: 0.62, green: [0.0, 0.1],
        readout: (t) => `${Math.round(t * 700)} V DC`,
        missNote: "Still live. Confirm the isolation point with the signaller before touching the rail.",
      },
    },
    {
      id: "boundary", kind: "sequence", anyOrder: true,
      targets: ["board-a", "board-b"],
      itemNames: { "board-a": "limit of possession board — up end", "board-b": "limit of possession board — down end" },
      title: "Mark the limits of possession",
      cue: "Place a boundary board at each end of the worksite.",
      why: "The boards are the only thing a train crew, a signaller or another gang can actually see from a moving vehicle that marks where your protection begins and ends — everything past a board is a section that still runs to normal rules.",
    },
    {
      id: "lookout", kind: "select", target: "lookout-worker",
      title: "Post the lookout",
      cue: "Position the lookout with a clear sighting distance both ways.",
      why: "The lookout's only job is watching the line in both directions and giving a warning early enough for the gang to clear it, coordinated the same way a SMART-represented train crew coordinates a move through a work zone. Sighting distance is calculated back from line speed, not chosen for convenience.",
    },
    {
      id: "clamp", kind: "select", target: "rail-clamp",
      title: "Fit the rail bonding clamp",
      cue: "Clamp the bond across the joint before working on it.",
      why: "The bond maintains the signalling circuit's continuity across the joint you are about to work on, so the interlocking upstream still sees an occupied or clear track correctly instead of losing the detection the moment the rail is broken.",
    },
    {
      id: "gauge", kind: "gauge", target: "track-gauge",
      title: "Measure track gauge",
      cue: "Set the gauge across the rails and commit inside tolerance.",
      why: "Standard gauge is held to a tight tolerance for a reason: outside it, a wheel flange stops following the rail head and starts climbing it under load, which is how a slow, boring maintenance defect turns into a derailment nobody saw building.",
      gauge: {
        label: "TRACK GAUGE", speed: 0.7, green: [0.44, 0.58],
        readout: (t) => `${(1420 + t * 30).toFixed(0)} mm`,
        missNote: "Outside tolerance for this class of track. Log the defect and adjust before handback.",
      },
    },
    {
      id: "repair", kind: "select", target: "fastener",
      title: "Replace the defective fastener",
      cue: "Swap the worn rail fastener for a new one.",
      why: "A loose fastener lets the rail move under load. Fixed now, it is a five-minute job; missed, it is a derailment risk.",
    },
    {
      id: "clear-tools", kind: "select", target: "tool-tally",
      title: "Complete the tool tally",
      cue: "Count every tool back against the list before anything is packed.",
      why: "A tool left on the track is a foreign object under the next train. The tally is counted out and counted back, every time.",
    },
    {
      id: "restore", kind: "select", target: "isolation-switch",
      title: "Restore traction current",
      cue: "Close the isolator once everyone is clear of the rail.",
      why: "Confirmed clear of the rail, then and only then re-energised. The sequence never reverses.",
    },
    {
      id: "handback", kind: "select", target: "signaller-radio",
      title: "Hand possession back",
      cue: "Confirm with the signaller that the line is clear and possession is given up.",
      why: "The section stays under your protection until you formally hand it back. Walking away without the call is how a possession never actually closes.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.1, 0xf2894b);

    // ------------------------------------------------------------- the track
    const ballast = box(g, 4.6, 0.16, 1.4, 0, 0.08, 0, 0x4a4640, { rough: 0.98 });
    for (const sx of [-1, 1]) {
      const rail = box(g, 4.6, 0.09, 0.06, 0, 0.2, sx * 0.36, 0x8b929a, { rough: 0.35, metal: 0.7 });
    }
    for (let i = -8; i <= 8; i++) {
      box(g, 0.16, 0.06, 0.9, i * 0.26, 0.11, 0, 0x2f2b26, { rough: 0.95 });
    }
    const thirdRail = box(g, 4.4, 0.08, 0.09, 0, 0.19, -0.65, 0x6d757d, { rough: 0.3, metal: 0.75 });
    const insulators = [];
    for (let i = -3; i <= 3; i++) {
      insulators.push(cyl(g, 0.03, 0.03, 0.1, i * 0.6, 0.14, -0.65, 0xd8a53a, { rough: 0.5, seg: 10 }));
    }
    reg(hits, thirdRail, "third-rail");

    // Fouling point across the running line.
    const foulLine = box(g, 4.6, 0.005, 0.06, 0, 0.24, 0, 0xf2c14b, { cast: false, receive: false });
    reg(hits, box(g, 4.6, 0.02, 1.4, 0, 0.26, 0, 0x000000, { opacity: 0.001, transparent: true, cast: false }),
      "unprotected-crossing");

    // ------------------------------------------------------------- isolator
    const isoCab = group(g, -1.85, 0, -1.3, 0.5);
    box(isoCab, 0.5, 1.1, 0.34, 0, 0.55, 0, 0x545e67, { rough: 0.5, metal: 0.5 });
    const isoLever = group(isoCab, 0.16, 0.85, 0.17);
    box(isoLever, 0.04, 0.16, 0.03, 0, 0.06, 0, 0xf0645b, { rough: 0.5 });
    reg(hits, isoLever, "isolation-switch");
    decal(isoCab, 0.3, 0.08, 0, 1.05, 0.17, signFace("TRACTION ISOLATOR", { accent: "#f2894b", scale: 0.5 }));
    const isoLamp = ball(isoCab, 0.018, -0.12, 0.85, 0.17, 0xf0645b, { emissive: 0xf0645b, ei: 2.4 });

    // Boards, lookout, work zone.
    const briefingBoard = holoPanel(g, 0.58, 0.4, -1.9, 1.5, 0.5, (ctx, w, h) => {
      ctx.fillStyle = "rgba(6,16,22,0.9)"; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#f2894b"; ctx.fillRect(0, 0, w, 5);
      ctx.fillStyle = "#8fb3c4";
      ctx.font = `600 ${Math.round(h * 0.09)}px 'Barlow Condensed', Arial, sans-serif`;
      ctx.textAlign = "left"; ctx.textBaseline = "middle";
      ctx.fillText("POSSESSION PLAN · UP MAIN", w * 0.06, h * 0.14);
      ctx.fillStyle = "#eaf6fb";
      ctx.font = `600 ${Math.round(h * 0.14)}px 'Barlow Condensed', Arial, sans-serif`;
      ctx.fillText("KM 41.2 — 41.6 · 02:00–05:00", w * 0.06, h * 0.33);
      ctx.font = `${Math.round(h * 0.085)}px Arial, sans-serif`;
      ctx.fillStyle = "#a9c6d6";
      ["Traction current: isolated 41.0–41.8", "Sighting distance: 400 m",
       "Gauge tolerance: 1435 mm ±5 mm", "Tool tally: 14 items",
       "Lookout: continuous, both directions"].forEach((line, i) => ctx.fillText(line, w * 0.06, h * (0.5 + i * 0.11)));
    }, { ry: 0.7, accent: 0xf2894b });
    reg(hits, briefingBoard, "briefing-board");

    const radio = group(g, -1.5, 0, 1.4, -0.5);
    slab(radio, 0.5, 0.16, 0.16, 0, 0.85, 0, 0x2b3138, { radius: 0.02, rough: 0.5 });
    const radioScreen = decal(radio, 0.4, 0.1, 0, 0.87, 0.09,
      signFace("STANDBY", { bg: "#0d1c24", accent: "#f2894b", fg: "#ffd9b0", scale: 0.5 }),
      { glow: true, ei: 0.85, px: 256 });
    holoTag(radio, "Signaller line", 0, 1.05, 0.08, { css: "#f2894b", w: 0.3 });
    reg(hits, radio, "signaller-radio");

    const tester = instrument(radio, 0.14, 0.85, 0.08, { ry: -0.6, idle: "-- V", color: 0xf2894b });
    holoTag(tester, "Rail tester", 0, 0.14, 0, { css: "#f2894b", w: 0.24 });
    reg(hits, tester, "rail-tester");

    // Boundary boards.
    function boardMarker(x, z) {
      const bm = group(g, x, 0, z);
      cyl(bm, 0.025, 0.03, 1.0, 0, 0.5, 0, 0xf2c14b, { rough: 0.5, seg: 10 });
      const face = decal(bm, 0.32, 0.24, 0, 1.05, 0.01, signFace("LIMIT OF\nPOSSESSION", { bg: "#f2c14b", fg: "#1b1e22", scale: 0.3 }), { px: 256 });
      bm.visible = false;
      return bm;
    }
    const boardA = boardMarker(-2.0, -0.65); reg(hits, boardA, "board-a");
    const boardB = boardMarker(2.0, -0.65); reg(hits, boardB, "board-b");
    const boardCase = group(g, -1.6, 0, 1.7, 0.3);
    box(boardCase, 0.5, 0.14, 0.2, 0, 0.07, 0, 0xf2c14b, { rough: 0.6 });
    holoTag(boardCase, "Boundary boards", 0, 0.28, 0, { css: "#f2894b", w: 0.34 });
    reg(hits, boardCase, "unmarked-boundary");

    // Lookout worker standing correctly, and a second worker alone up the line — trap.
    const lookout = standingFigure(g, 2.3, 1.5, { ry: -1.5, cloth: 0x2b3138, vest: 0xf2c14b, helmet: 0xf2f2f2 });
    holoTag(lookout, "Lookout", 0, 1.95, 0.15, { css: "#f2894b", w: 0.24 });
    reg(hits, lookout, "lookout-worker");
    const solo = standingFigure(g, -2.63, -0.31, { ry: 1.5, cloth: 0x2b3138, vest: 0xf2c14b, helmet: 0xf2f2f2 });
    reg(hits, solo, "solo-worksite");

    // Rail clamp, gauge, fastener, tool tray at the worksite.
    const chest = toolChest(g, 0.9, 1.3, { ry: -0.5, color: 0xf2894b });
    const clamp = group(chest, -0.1, 0.79, 0, 0.4);
    box(clamp, 0.1, 0.04, 0.03, 0, 0, 0, 0xf0645b, { rough: 0.5, metal: 0.4 });
    holoTag(clamp, "Bonding clamp", 0, 0.12, 0, { css: "#f2894b", w: 0.3 });
    reg(hits, clamp, "rail-clamp");

    const gaugeTool = group(chest, 0.14, 0.79, 0.02, -0.3);
    box(gaugeTool, 0.22, 0.03, 0.03, 0, 0, 0, 0xdfe4e8, { rough: 0.4, metal: 0.5 });
    const gaugeReadout = decal(gaugeTool, 0.06, 0.03, 0, 0.03, 0.02,
      signFace("----", { bg: "#0d1c24", accent: "#f2894b", scale: 0.6 }), { px: 128, glow: true, ei: 0.7 });
    holoTag(gaugeTool, "Track gauge", 0, 0.1, 0, { css: "#f2894b", w: 0.28 });
    reg(hits, gaugeTool, "track-gauge");

    const fastener = group(chest, 0, 0.8, -0.14);
    box(fastener, 0.06, 0.02, 0.03, 0, 0, 0, 0x8b929a, { rough: 0.4, metal: 0.6 });
    holoTag(fastener, "Rail fastener", 0, 0.1, 0, { css: "#f2894b", w: 0.26 });
    reg(hits, fastener, "fastener");

    const tally = holoPanel(g, 0.4, 0.26, 1.65, 1.35, 1.3, (ctx, w, h) => {
      ctx.fillStyle = "rgba(6,16,22,0.9)"; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#f2894b"; ctx.fillRect(0, 0, w, 5);
      ctx.fillStyle = "#eaf6fb";
      ctx.font = `600 ${Math.round(h * 0.2)}px 'Barlow Condensed', Arial, sans-serif`;
      ctx.textAlign = "center"; ctx.textBaseline = "middle";
      ctx.fillText("TOOL TALLY", w / 2, h * 0.34);
      ctx.font = `${Math.round(h * 0.12)}px Arial, sans-serif`;
      ctx.fillStyle = "#a9c6d6";
      ctx.fillText("14 out · count every one back", w / 2, h * 0.66);
    }, { ry: -0.6, accent: 0xf2894b });
    reg(hits, tally, "tool-tally");

    // Work zone perimeter.
    reg(hits, cone(g, -2.1, 1.0, { color: 0xf2894b }), "cone-a-track");

    let currentOn = true;

    return {
      hits,
      footprint: 2.1,

      // What the worker would actually see from the four foot: the isolator
      // lamp back on red, or their lookout walking away. See the interrupts
      // block above.
      onInterrupt(it) {
        if (it.id === "section-relit") {
          currentOn = true;
          isoLamp.material = mat(0xf0645b, { emissive: 0xf0645b, ei: 2.4 });
          repaint(radioScreen, signFace("SECTION\nLIVE", { bg: "#2a1416", accent: "#f0645b", fg: "#ffd2ce", scale: 0.3 }));
        }
        if (it.id === "lookout-adrift") { lookout.position.set(2.78, 0, 2.2); lookout.rotation.y = 1.15; }
      },

      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "section-relit") {
          currentOn = false;
          isoLamp.material = mat(0x59c97b, { emissive: 0x59c97b, ei: 2.4 });
          repaint(radioScreen, signFace("POSSESSION\nGRANTED", { bg: "#0d1c14", accent: "#59c97b", fg: "#bff7d4", scale: 0.3 }));
        }
        if (it.id === "lookout-adrift") { lookout.position.set(2.3, 0, 1.5); lookout.rotation.y = -1.5; }
      },

      onStepComplete(step) {
        if (step.id === "possession") repaint(radioScreen, signFace("POSSESSION\nGRANTED", { bg: "#0d1c14", accent: "#59c97b", fg: "#bff7d4", scale: 0.3 }));
        if (step.id === "isolate") { currentOn = false; isoLever.rotation.z = -Math.PI / 2; }
        if (step.id === "verify") isoLamp.material = mat(0x59c97b, { emissive: 0x59c97b, ei: 2.4 });
        if (step.id === "boundary") { boardA.visible = true; boardB.visible = true; boardCase.visible = false; }
        if (step.id === "gauge") repaint(gaugeReadout, signFace("1435", { bg: "#0d1c24", accent: "#59c97b", scale: 0.6 }), );
        if (step.id === "restore") { currentOn = true; isoLever.rotation.z = 0; isoLamp.material = mat(0xf0645b, { emissive: 0xf0645b, ei: 2.4 }); }
        if (step.id === "handback") repaint(radioScreen, signFace("POSSESSION\nCLOSED", { bg: "#0d1c14", accent: "#f2894b", fg: "#ffd9b0", scale: 0.3 }));
      },

      animate(t, dt, session) {
        if (currentOn) insulators.forEach((i, idx) => { i.material.emissiveIntensity = 0; });
        lookout.userData.head.rotation.y = Math.sin(t * 0.7) * 0.7;
        solo.userData.head.rotation.y = Math.sin(t * 0.4) * 0.3;

        const gg = session?.gauge;
        if (gg && !gg.committed) {
          if (session.step?.id === "verify") {
            const v = Math.round(gg.t * 700);
            repaint(tester.userData.screen, signFace(`${v} V`, {
              bg: "#0d1c24", accent: v < 70 ? "#59c97b" : "#f0645b", fg: "#bfeaf7", scale: 0.6,
            }));
          }
          if (session.step?.id === "gauge") {
            repaint(gaugeReadout, signFace(`${(1420 + gg.t * 30).toFixed(0)}`, {
              bg: "#0d1c24", accent: gg.t > 0.44 && gg.t < 0.58 ? "#59c97b" : "#f2c14b", scale: 0.55,
            }));
          }
        }
      },
    };
  },
};
