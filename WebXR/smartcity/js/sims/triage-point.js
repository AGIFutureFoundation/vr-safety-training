import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, ball, torus, slab, hose, group, decal, repaint, signFace, particles, mat,
} from "../../../shared/kit.js";
import {
  CITY, stationPad, holoPanel, holoTag, toolChest, instrument, standingFigure, reg,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Triage Point VR — its own gamified system: Golden Hour.
// Mass-casualty triage. START triage is deliberately fast and deliberately
// incomplete for any one casualty — full assessment on the first patient means
// the ones who could have been saved down the line never get seen in time.

export const SIM_TRIAGE_POINT = {
  id: "triage-point",
  index: "08",
  domain: "Emergency Services",
  trade: "EMT / paramedic",
  category: "Emergency Services",
  weather: "overcast",
  certification: "IAFF and IAEP fire-based EMS crews; state paramedic licence at the NREMT level; START triage as the regional mass-casualty protocol adopts it, worked inside a NIMS incident command structure; the NFPA 1006 job performance requirements for technical rescue personnel on the collapse; OSHA 29 CFR 1910.1030 bloodborne pathogens for every patient contact",
  name: "Triage Point",
  title: simTitle("Triage Point"),
  tagline: "START mass-casualty triage: rapid assessment, tagging and the golden hour",
  accent: 0xf0645b,
  accentCss: "#f0645b",
  parSeconds: 210,
  badge: { id: "golden-hour", name: "Golden Hour", note: "Every casualty triaged and tagged inside protocol time" },

  game: system({
    name: "Golden Hour",
    currency: "TRIAGE",
    ranks: ["First Responder", "Triage Trained", "Scene Lead", "Mass Casualty Officer", "Golden Hour Certified"],
    badges: [
      { id: "sixty-second", name: "Sixty Second", note: "Triage every casualty inside protocol time", test: AWARD.fast(0.85) },
      { id: "correct-tags", name: "Correct Tags", note: "No casualty mistagged", test: AWARD.clean },
      { id: "scene-safe", name: "Scene Safe", note: "Never enter the hazard zone unprotected", test: AWARD.safe },
    ],
    challenges: [
      { id: "no-second-look", name: "No Second Look", note: "Tag every casualty in a single pass", test: AWARD.stepClean("sweep") },
      { id: "steady-hands", name: "Steady Hands", note: "Hold the airway check the full duration", test: AWARD.unbroken },
      { id: "seven-straight", name: "Seven Straight", note: "Seven correct actions in a row", test: AWARD.streak(7) },
    ],
  }),

  hazards: {
    "unstable-debris": "That beam is still shifting. Treating a casualty under unstable debris without shoring it first means the next collapse takes the rescuer too — scene safety comes before patient contact.",
    "walk-past-green": "You walked past a casualty who can walk without tagging them. Green casualties still need a tag — an untagged 'walking wounded' is a casualty who disappears from the count and shows up later as a surprise.",
    "cpr-on-black": "You are starting CPR on a black-tagged casualty. In a mass-casualty START protocol, resources go to the casualties who can be saved with the time you have — sustained resuscitation on the deceased-expectant category costs the salvageable ones their golden hour.",
    "no-gloves": "You made patient contact with no gloves. Every casualty at a mass-casualty scene is an unknown bloodborne exposure risk until proven otherwise.",
  },

  lateNotes: {
    "casualty-red": "Not yet — this casualty is assessed and airway-checked as part of the sweep before anything else happens to them.",
  },

  steps: [
    {
      id: "sizeup", kind: "select", target: "scene-board",
      title: "Scene size-up",
      cue: "Read the incident board: casualty count, hazards, resources inbound.",
      why: "You triage four casualties differently from forty. The size-up fixes your pace, tells you how long you are on your own before the next unit arrives, and — because this is a structure collapse — tells you which part of the scene is still moving. It is also the first report into the incident command structure everyone arriving after you will be working inside.",
    },
    {
      id: "ppe", kind: "select", target: "ppe-station",
      title: "Glove and mask before contact",
      cue: "Take gloves and a mask from the station before approaching any casualty.",
      why: "Universal precautions apply to every casualty at every scene, and at a collapse you are going to have both hands on people whose injuries you cannot see yet, in dust, with no sink for the next hour. Gloves go on before the clock on triage starts, because the one moment nobody ever goes back for them is the moment they first see a patient.",
    },
    {
      id: "sweep", kind: "find", noHint: true,
      targets: ["casualty-red", "casualty-yellow", "casualty-green", "casualty-black"],
      itemNames: {
        "casualty-red": "immediate casualty",
        "casualty-yellow": "delayed casualty",
        "casualty-green": "walking wounded",
        "casualty-black": "deceased / expectant casualty",
      },
      itemNotes: {
        "casualty-red": "Not breathing until repositioned, then breathing fast — respiratory distress, immediate category.",
        "casualty-yellow": "Breathing, has a radial pulse, follows commands but cannot walk — delayed category.",
        "casualty-green": "Walking on their own, minor injuries — still gets tagged, still gets tracked.",
        "casualty-black": "No breathing after the airway is opened — in a mass-casualty START sweep, this casualty is not where your time goes.",
      },
      decoyNotes: {
        "debris-pile": "That is debris, not a casualty. Do not spend triage time on the scene itself.",
      },
      title: "Sweep and assess every casualty",
      cue: "Move through the scene once. Assess breathing, pulse, mental status for each casualty you find.",
      why: "START is a single fast pass over everybody before you commit to treating anybody, and the discipline is in not stopping. Breathing, perfusion, mental status, move on — thirty seconds a patient. Every minute you spend doing a proper assessment on the first casualty is a minute the fourth one spends bleeding out behind a wall you have not reached yet.",
    },
    {
      id: "airway-check", kind: "hold", target: "casualty-red", seconds: 8,
      title: "Open the airway and reassess",
      cue: "Hold the head-tilt chin-lift and check for breathing.",
      why: "Opening the airway is the only treatment START allows you during the sweep, and it is allowed because it is the one that decides a category. A casualty who is not breathing until the airway is opened, and then breathes, is an immediate; one who still does not breathe is expectant. Held for a moment, that distinction is a guess; held for the full window, it is an assessment.",
      holdBreakNote: "You released before confirming the reassessment — hold the airway open for the full check.",
    },
    {
      id: "tag-red", kind: "drag", target: "red-tag",
      title: "Tag immediate",
      cue: "Take a red tag from the pack and attach it to the immediate casualty.",
      why: "The tag goes on the patient, not in your pocket and not in your head, because within ten minutes there will be four crews on this scene and none of them were here when you made the decision. Red means treat now and transport first, and it is the tag that carries that decision forward when you have moved on and cannot be asked.",
      drag: { to: "casualty-red", radius: 0.5, missNote: "Not on the patient. A tag that is not physically attached to a casualty is a decision that only exists inside your own head." },
    },
    {
      id: "tag-yellow", kind: "select", target: "casualty-yellow",
      title: "Tag delayed",
      cue: "Apply the yellow tag to the delayed casualty.",
      why: "Stable enough to wait, not stable enough to walk. Yellow is the category that moves: a delayed patient with an internal bleed becomes an immediate somewhere between now and transport, and the only thing that catches that is somebody going back round the yellows while the reds are being loaded.",
    },
    {
      id: "tag-green", kind: "select", target: "casualty-green",
      title: "Tag minor",
      cue: "Apply the green tag to the walking wounded.",
      why: "Green is a tag and a count, not a discharge. Walking wounded who are never tagged walk off the scene, turn up at three different hospitals under their own steam, and leave the incident commander with a casualty count that will not reconcile — which means hours spent searching a collapsed building for somebody who is already at home.",
    },
    {
      id: "tag-black", kind: "select", target: "casualty-black",
      title: "Tag deceased / expectant",
      cue: "Apply the black tag once the airway has been opened and there is still no breathing.",
      why: "This tag is applied after the airway manoeuvre and never on first sight, because the manoeuvre is what separates an obstructed airway from an arrest. It is also the hardest thing this method asks of anybody: the resources that would go into one resuscitation here are the resources that keep three salvageable casualties alive, and that arithmetic is made now, by protocol, so that nobody has to make it alone.",
    },
    {
      id: "shore", kind: "turn", target: "shore-strut",
      title: "Shore the unstable debris",
      cue: "Wind the strut up under the beam until it takes load, before anybody works underneath it.",
      why: "The strut is wound up until it is snug and carrying, not hammered in and not left finger-tight — a shore that is not in contact does nothing, and one driven too hard lifts the very thing you are trying to stop moving. Until it takes load, everyone under that beam is relying on the collapse having finished, and the second collapse is the one that takes the rescuers.",
      turn: { turns: 1.25, axis: "y", label: "SHORE STRUT" },
    },
    {
      id: "handoff", kind: "sequence",
      targets: ["count-immediate", "count-delayed", "count-minor", "count-deceased"],
      itemNames: {
        "count-immediate": "immediate count", "count-delayed": "delayed count",
        "count-minor": "minor count", "count-deceased": "deceased / expectant count",
      },
      title: "Hand off the counts in priority order",
      cue: "Call the counts to the transport officer: immediate first, then delayed, then minor, then deceased.",
      why: "The counts go over in the order they will be moved, because the transport officer is writing them down and allocating ambulances as you speak, and the first number they hear is the one they build the plan around. Reverse the order and the first thing the receiving hospital hears about is your dead. Triage only works if the count reaches whoever is deciding transport, in a shape they can act on.",
      outOfOrderNote: "Priority order — immediate, delayed, minor, then deceased. The transport officer is allocating units as you talk, so the order you say them in is the order they get planned for.",
    },
  ],

  // Two things that happen on a triage line while the medic's attention is on
  // the patient in front of them. See shared/game.js.
  interrupts: [
    {
      id: "green-deteriorating",
      kind: "Patient deteriorating",
      after: "tag-yellow", delay: 4, seconds: 11,
      alert: "The walking wounded you tagged green has sat down against the wall and stopped talking.",
      cue: "Green is a tag, not a diagnosis.",
      target: "casualty-green",
      why: "START triage is a snapshot, and people move between categories — a green who sits down and goes quiet has usually just become a red. Re-triage is not a courtesy, it is the part of the method that makes the first pass safe to act on.",
      missNote: "They were still against the wall at handoff, by then unresponsive. The tag said green, so the transport officer worked down the line to them last — the tag did exactly what tags do, which is why somebody has to keep looking.",
      wrongNote: "It is the casualty you tagged green. A patient who has changed outranks the one you were about to tag.",
    },
    {
      id: "debris-shifting",
      kind: "Scene deteriorating",
      after: "tag-black", delay: 3, seconds: 11,
      alert: "The beam over the collapsed section has moved. Dust is coming off the debris pile where your next patient is lying.",
      cue: "The scene has stopped being stable.",
      target: "unstable-debris",
      why: "Triage happens inside a scene that is still failing. A medic who keeps working a deteriorating collapse becomes a second casualty in the same pile, and the arriving crew now has two problems and one fewer responder.",
      missNote: "You kept working under the shifting beam. It held. Scene safety is the first item in every size-up because it is the one that decides whether there is anybody left to do the other items.",
      wrongNote: "It is the debris. Nothing on this line matters while the thing above your patients is moving.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.1, 0xf0645b);

    // Scene rubble field.
    for (let i = 0; i < 10; i++) {
      const a = Math.random() * Math.PI * 2, r = 0.6 + Math.random() * 1.6;
      const rock = box(g, 0.15 + Math.random() * 0.2, 0.08 + Math.random() * 0.12, 0.15 + Math.random() * 0.2,
        Math.cos(a) * r, 0.05, Math.sin(a) * r, 0x5d5850, { rough: 0.95 });
      rock.rotation.y = Math.random() * 3;
    }

    // Unstable debris beam over one casualty.
    const debris = group(g, -0.9, 0, -0.5, 0.3);
    const beam = box(debris, 1.3, 0.16, 0.16, 0, 0.45, 0, 0x6d5a42, { rough: 0.85 });
    beam.rotation.z = 0.12;
    holoTag(debris, "Unstable beam", 0, 0.7, 0.1, { css: "#f0645b", w: 0.28 });
    // A screw-jack shore stood under the beam, wound up until it takes load.
    const strut = group(g, -0.42, 0, -0.34);
    box(strut, 0.18, 0.03, 0.18, 0, 0.015, 0, 0x545e67, { rough: 0.6, metal: 0.4 });
    const strutLeg = cyl(strut, 0.03, 0.03, 0.34, 0, 0.2, 0, CITY.hiVis, { rough: 0.5, metal: 0.4, seg: 14 });
    const strutCollar = cyl(strut, 0.055, 0.055, 0.045, 0, 0.16, 0, 0xd8b23a, { rough: 0.4, metal: 0.7, seg: 16 });
    box(strut, 0.14, 0.02, 0.14, 0, 0.37, 0, 0x545e67, { rough: 0.6, metal: 0.4 });
    holoTag(strut, "Shore strut", 0, 0.5, 0, { css: "#f0645b", w: 0.28 });
    reg(hits, strut, "shore-strut");
    reg(hits, beam, "unstable-debris");
    reg(hits, beam, "debris-beam");
    reg(hits, box(g, 0.3, 0.1, 0.3, -1.4, 0.05, 0.8, 0x5d5850, { rough: 0.95 }), "debris-pile");

    // Casualties.
    function casualty(x, z, ry, opts) {
      const fig = standingFigure(g, x, z, { ry, lying: true, cloth: opts.cloth ?? 0x445566, skin: opts.skin });
      fig.userData.tagged = false;
      return fig;
    }
    const red = casualty(-0.8, -0.55, 0.2, { cloth: 0x54423a });
    holoTag(red, "Casualty A", 0, 0.42, 0, { css: "#f0645b", w: 0.26 });
    reg(hits, red, "casualty-red");

    const yellow = casualty(0.5, -0.7, -0.4, { cloth: 0x3d4b55 });
    holoTag(yellow, "Casualty B", 0, 0.42, 0, { css: "#f2c14b", w: 0.26 });
    reg(hits, yellow, "casualty-yellow");

    const green = standingFigure(g, 1.4, 0.4, { ry: 2.2, cloth: 0x2f5a45 });
    holoTag(green, "Casualty C", 0, 1.9, 0.1, { css: "#59c97b", w: 0.26 });
    reg(hits, green, "casualty-green");

    // Exit lane beside the walking wounded — leaving before they are tagged is the trap.
    const exitLane = group(g, 1.9, 0, 0.9, 0.3);
    box(exitLane, 0.5, 0.006, 0.9, 0, 0.003, 0, 0x8b929a, { cast: false, receive: false });
    holoTag(exitLane, "Scene exit — untagged", 0, 0.1, 0, { css: "#f0645b", w: 0.4 });
    reg(hits, exitLane, "walk-past-green");

    const black = casualty(0.1, 0.9, 1.3, { cloth: 0x2b2b2e, skin: 0xb0968a });
    holoTag(black, "Casualty D", 0, 0.42, 0, { css: "#6b7280", w: 0.26 });
    reg(hits, black, "casualty-black");

    // A CPR action point over the deceased-expectant casualty — the resource trap.
    const cprPoint = group(black, 0, 0.16, 0.06);
    ball(cprPoint, 0.03, 0, 0, 0, 0xf0645b, { emissive: 0xf0645b, ei: 1.4, rough: 0.4 });
    holoTag(cprPoint, "Begin CPR", 0, 0.12, 0, { css: "#f0645b", w: 0.28 });
    reg(hits, cprPoint, "cpr-on-black");

    // Tags as small holographic flags planted beside each casualty once applied.
    function tagFlag(fig, colour, label) {
      const flag = group(fig, 0.3, 0, 0.1);
      cyl(flag, 0.01, 0.012, 0.3, 0, 0.15, 0, CITY.darkSteel, { rough: 0.5, seg: 8 });
      const face = decal(flag, 0.14, 0.09, 0, 0.28, 0.001, signFace(label, { bg: colour, fg: "#1b1e22", scale: 0.55 }), { px: 192 });
      flag.visible = false;
      return flag;
    }
    const redFlag = tagFlag(red, "#f0645b", "IMMEDIATE");
    const yellowFlag = tagFlag(yellow, "#f2c14b", "DELAYED");
    const greenFlag = tagFlag(green, "#59c97b", "MINOR");
    const blackFlag = tagFlag(black, "#8a8f94", "DECEASED");

    // Scene board, PPE station, transport board.
    const sceneBoard = holoPanel(g, 0.58, 0.4, -1.9, 1.5, 1.0, (ctx, w, h) => {
      ctx.fillStyle = "rgba(20,6,8,0.9)"; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#f0645b"; ctx.fillRect(0, 0, w, 5);
      ctx.fillStyle = "#e6a5a0";
      ctx.font = `600 ${Math.round(h * 0.09)}px 'Barlow Condensed', Arial, sans-serif`;
      ctx.textAlign = "left"; ctx.textBaseline = "middle";
      ctx.fillText("INCIDENT · STRUCTURE COLLAPSE", w * 0.06, h * 0.14);
      ctx.fillStyle = "#fbeceb";
      ctx.font = `600 ${Math.round(h * 0.14)}px 'Barlow Condensed', Arial, sans-serif`;
      ctx.fillText("4 CASUALTIES · SCENE UNSTABLE", w * 0.06, h * 0.33);
      ctx.font = `${Math.round(h * 0.085)}px Arial, sans-serif`;
      ctx.fillStyle = "#d6a8a4";
      ["Method: START triage", "Transport ETA: 6 minutes",
       "Priority: red first, yellow reassessed", "Hazard: unstable debris, west side",
       "Report to: transport officer"].forEach((line, i) => ctx.fillText(line, w * 0.06, h * (0.5 + i * 0.11)));
    }, { ry: 0.7, accent: 0xf0645b });
    reg(hits, sceneBoard, "scene-board");

    const ppe = toolChest(g, 1.7, 1.4, { ry: -0.7, color: 0xf0645b });
    // The tag pack. A triage tag is a physical thing that gets attached to a
    // physical person, which is the whole reason the method works.
    const redTag = group(ppe, -0.3, 0.8, 0.06, 0.2);
    box(redTag, 0.09, 0.004, 0.14, 0, 0, 0, 0xf0645b, { rough: 0.7 });
    decal(redTag, 0.08, 0.12, 0, 0.004, 0, signFace("IMMEDIATE", { bg: "#f0645b", fg: "#2a0c0a", scale: 0.4 }), { px: 128 })
      .rotation.x = -Math.PI / 2;
    holoTag(redTag, "Triage tags", 0, 0.18, 0, { css: "#f0645b", w: 0.3 });
    reg(hits, redTag, "red-tag");
    const gloveBox = group(ppe, -0.1, 0.79, 0, 0.3);
    box(gloveBox, 0.14, 0.07, 0.1, 0, 0, 0, 0xf0f4f6, { rough: 0.5 });
    holoTag(gloveBox, "Gloves + mask", 0, 0.14, 0, { css: "#f0645b", w: 0.3 });
    reg(hits, gloveBox, "ppe-station");

    // Bare-hand shortcut sitting right next to the PPE — the temptation to skip it.
    const bareContact = group(ppe, 0.14, 0.79, 0.08, -0.3);
    ball(bareContact, 0.025, 0, 0, 0, 0xd9a985, { rough: 0.75 });
    holoTag(bareContact, "Direct contact — no PPE", 0, 0.1, 0, { css: "#f0645b", w: 0.42 });
    reg(hits, bareContact, "no-gloves");

    const transport = holoPanel(g, 0.44, 0.28, 1.9, 1.4, -0.5, (ctx, w, h) => {
      ctx.fillStyle = "rgba(20,6,8,0.9)"; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#f0645b"; ctx.fillRect(0, 0, w, 5);
      ctx.fillStyle = "#fbeceb";
      ctx.font = `600 ${Math.round(h * 0.2)}px 'Barlow Condensed', Arial, sans-serif`;
      ctx.textAlign = "center"; ctx.textBaseline = "middle";
      ctx.fillText("TRANSPORT HANDOFF", w / 2, h * 0.34);
      ctx.font = `${Math.round(h * 0.12)}px Arial, sans-serif`;
      ctx.fillStyle = "#d6a8a4";
      ctx.fillText("Call tag counts and priority", w / 2, h * 0.64);
      ctx.fillText("order to the transport officer", w / 2, h * 0.8);
    }, { ry: -0.6, accent: 0xf0645b });
    reg(hits, transport, "transport-board");

    // The four counts, called across in priority order.
    const tally = group(g, 1.86, 0, -0.42, -0.6);
    const tallySpec = [
      ["count-immediate", "IMM", "#f0645b", -0.21], ["count-delayed", "DEL", "#f2c14b", -0.07],
      ["count-minor", "MIN", "#59c97b", 0.07], ["count-deceased", "DEC", "#8a8f94", 0.21],
    ];
    for (const [tid, label, css, tx] of tallySpec) {
      const tile = group(tally, tx, 1.1, 0);
      box(tile, 0.12, 0.12, 0.02, 0, 0, 0, 0x1a0c0d, { rough: 0.6 });
      decal(tile, 0.1, 0.1, 0, 0, 0.012, signFace(label, { bg: "#1a0c0d", accent: css, scale: 0.5 }), { px: 96 });
      reg(hits, tile, tid);
    }
    holoTag(tally, "Tag counts", 0, 1.28, 0, { css: "#f0645b", w: 0.28 });

    let sceneSize01 = 0;

    return {
      hits,
      footprint: 2.1,

      onStepComplete(step) {
        if (step.id === "tag-red") redFlag.visible = true;
        if (step.id === "tag-yellow") yellowFlag.visible = true;
        if (step.id === "tag-green") greenFlag.visible = true;
        if (step.id === "tag-black") blackFlag.visible = true;
        if (step.id === "tag-red") redTag.visible = false;
        if (step.id === "shore") {
          beam.rotation.z = 0;
          beam.position.y = 0.16;
          strutLeg.scale.y = 1.18;
          strutCollar.position.y = 0.24;
        }
        if (step.id === "handoff") {
          repaint(transport.userData.face, (ctx, w, h) => {
            ctx.fillStyle = "rgba(20,6,8,0.9)"; ctx.fillRect(0, 0, w, h);
            ctx.fillStyle = "#59c97b"; ctx.fillRect(0, 0, w, 5);
            ctx.fillStyle = "#eafbf1";
            ctx.font = `600 ${Math.round(h * 0.18)}px 'Barlow Condensed', Arial, sans-serif`;
            ctx.textAlign = "center"; ctx.textBaseline = "middle";
            ctx.fillText("HANDOFF COMPLETE", w / 2, h * 0.4);
            ctx.font = `${Math.round(h * 0.1)}px Arial, sans-serif`;
            ctx.fillStyle = "#b7e6c8";
            ctx.fillText("1 red · 1 yellow · 1 green · 1 black", w / 2, h * 0.68);
          });
        }
      },

      // The green casualty really goes down, and the beam really shifts.
      onInterrupt(it) {
        if (it.id === "green-deteriorating") { green.rotation.x = 1.2; green.position.y = -0.35; }
        if (it.id === "debris-shifting") { beam.rotation.z += 0.12; beam.position.y -= 0.06; }
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "green-deteriorating") { green.rotation.x = 0; green.position.y = 0; }
        if (it.id === "debris-shifting") { beam.rotation.z -= 0.12; beam.position.y += 0.06; }
      },

      animate(t, dt, session) {
        yellow.rotation.y = Math.sin(t * 0.3) * 0.02;
        green.userData.head.rotation.y = Math.sin(t * 0.8) * 0.5;
        [redFlag, yellowFlag, greenFlag].forEach((f) => {
          if (f.visible) f.children[1].position.y = 0.28 + Math.sin(t * 2) * 0.01;
        });
      },
    };
  },
};
