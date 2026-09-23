import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, ball, slab, torus, group, decal, repaint, signFace, particles, mat } from "../../../shared/kit.js";
import {
  stationPad, holoPanel, holoTag, toolChest, cone, barrierPanel, instrument,
  standingFigure, reg,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Trench Box VR — its own gamified system: Ground Authority.
// Excavation and shoring. A trench that looks stable is not the same thing as a
// trench that has been tested and protected — the wall does not announce which
// second it is going to let go.

export const SIM_TRENCH_BOX = {
  id: "trench-box",
  index: "14",
  domain: "Construction",
  trade: "Laborer / excavation and shoring",
  category: "Construction & Structural Trades",
  weather: "rain",
  certification: "LIUNA — OSHA 29 CFR 1926 Subpart P Competent Person",
  name: "Trench Box",
  title: simTitle("Trench Box"),
  tagline: "Excavation shoring: competent-person inspection, atmosphere testing and protective systems",
  accent: 0x7ed321,
  accentCss: "#7ed321",
  parSeconds: 220,
  badge: { id: "ground-authority", name: "Ground Authority", note: "Trench inspected, tested and protected before anyone steps below grade" },

  game: system({
    name: "Ground Authority",
    currency: "TRENCH",
    ranks: ["Laborer", "Excavation Hand", "Competent Person", "Shoring Lead", "Ground Authority Certified"],
    badges: [
      { id: "never-unshored", name: "Never Unshored", note: "No one enters before the protective system is placed", test: AWARD.safe },
      { id: "atmosphere-first", name: "Atmosphere First", note: "Test the air before every entry, no exceptions", test: AWARD.stepClean("atmosphere-test") },
      { id: "reading-true", name: "Reading True", note: "Hold the gas meter steady near band centre", test: AWARD.precise(0.7) },
      { id: "grade-programmed", name: "Grade Programmed Clean", note: "Teach every grade-control waypoint in order, first try", test: AWARD.stepClean("gps-teach") },
    ],
    challenges: [
      { id: "quick-dig", name: "Quick Dig", note: "Complete inside 80% of par", test: AWARD.fast(0.8) },
      { id: "clean-cut", name: "Clean Cut", note: "Clean run, no corrections", test: AWARD.clean },
      { id: "trench-streak", name: "Trench Streak", note: "Nine correct actions in a row", test: AWARD.streak(9) },
    ],
  }),

  hazards: {
    "unshored-entry": "You stepped into the trench before the protective system was placed. A cubic metre of soil weighs more than a small car, and an unprotected wall can let go with no warning at all before it happens.",
    "spoil-too-close": "That spoil pile is sitting right on the edge. The extra surcharge load from a pile that close is exactly what pushes a marginal trench wall past the point it can hold itself up.",
    "no-ladder-access": "There is no ladder within reach of this section. If the wall lets go or the atmosphere turns, everyone below grade needs an exit inside seconds, not a walk to find one.",
    "untested-entry": "You are entering before the atmosphere has been tested. A trench can fill with oxygen-deficient or toxic air from a nicked utility line with no smell and no colour to warn you first.",
  },

  lateNotes: {
    "trench-box": "The box goes in before anyone works below grade, not after the first assessment — it is the physical protection, not a formality that follows it.",
    "ladder": "The ladder is placed before anyone climbs down, because egress needs to already exist for the worst five seconds of the shift, not just the calm ones.",
  },


  // Interruptions: see the interrupt layer in shared/game.js. Excavation is the
  // classic case — the trench that was safe when you inspected it is a
  // different trench twenty minutes later, and nobody is looking up.
  interrupts: [
    {
      id: "spoil-creeping",
      kind: "Edge movement",
      after: "pipe-work", delay: 5, seconds: 13,
      alert: "The excavator has swung again and spoil is sliding back toward the edge above the entrant.",
      cue: "Get the spoil back off the lip before it goes in.",
      target: "spoil-pile",
      why: "Spoil belongs two feet back from the edge and it does not stay there by itself. Loose material at the lip is both a surcharge on the wall and the thing that falls on whoever is down there.",
      missNote: "The spoil went over the edge onto the entrant. A person buried to the chest cannot self-rescue and cannot breathe against the weight, and the crew above will spend the next hour digging by hand because a machine cannot be used near a buried worker.",
      wrongNote: "It is the spoil at the edge. Nothing else in this excavation matters while material is sliding toward a person.",
    },
    {
      id: "spotter-gone",
      kind: "Spotter gone",
      after: "gps-teach", delay: 4, seconds: 12,
      alert: "Your spotter has walked off to take a call. There is nobody between the excavator and the trench.",
      cue: "You are teaching a machine a path with nobody watching the hole.",
      target: "spotter",
      why: "The spotter is the only person whose job is the space between the plant and the people. Programming a machine's path is exactly when you need them most, because the machine is about to move somewhere nobody expects.",
      missNote: "You taught and ran a machine path with no spotter and a person in the excavation. Struck-by is the leading cause of death in excavation work after collapse, and every one of them happened while somebody was looking at something else.",
      wrongNote: "The missing spotter is the problem. Get somebody back on the edge before the machine moves again.",
    },
  ],

  steps: [
    {
      id: "guard-site", kind: "sequence", anyOrder: true,
      targets: ["cone-a", "cone-b", "trench-guard"],
      itemNames: { "cone-a": "cone at the approach", "cone-b": "cone at the far end", "trench-guard": "trench guard rail" },
      title: "Guard the excavation",
      cue: "Cone both approaches and set the guard rail around the open trench.",
      why: "MUTCD-compliant cones and the trench guard rail go up before the competent-person inspection even starts, because an open excavation next to foot traffic or a work-zone travel lane is a hazard to everyone who is not on this crew — the public does not know where the edge is until something marks it.",
    },
    {
      id: "permit", kind: "select", target: "excavation-permit",
      title: "Read the excavation permit",
      cue: "Confirm the depth, soil classification and the protective system required.",
      why: "The excavation permit sets the protective system for this trench from its actual soil classification and depth under OSHA 29 CFR 1926 Subpart P — not from what looked adequate on the last job, because two trenches at the same depth in different soil do not carry the same risk of collapse.",
    },
    {
      id: "competent-inspect", kind: "find", noHint: true,
      targets: ["wall-tension-crack", "wall-seep", "sloughing-face"],
      itemNames: {
        "wall-tension-crack": "tension crack at the edge",
        "wall-seep": "water seeping from the wall",
        "sloughing-face": "sloughing soil face",
      },
      itemNotes: {
        "wall-tension-crack": "A tension crack running parallel to the edge is soil pulling apart before it fails — it is often the last visible warning a wall gives before it lets go.",
        "wall-seep": "Water coming through the wall means the soil behind it is saturated and has lost most of the shear strength holding it up, whatever the soil classification on the permit says.",
        "sloughing-face": "A face that is already sloughing material on its own, with nobody touching it, is a wall actively failing, not a wall that might fail later.",
      },
      decoyNotes: {
        "stable-wall": "That section of wall is intact, dry and holding its face. Nothing to flag.",
      },
      title: "Complete the competent-person inspection",
      cue: "Walk the trench walls. Three signs of instability are hiding among the excavation — find them by looking.",
      why: "OSHA 29 CFR 1926 Subpart P requires a competent person to inspect the trench daily and after any event that could affect stability — rain, a freeze-thaw cycle, nearby vibration — because a wall that read as stable at the start of the shift is not guaranteed to still be the one you are standing next to now. NIOSH's trenching fatality data shows collapse gives almost no warning once a tension crack or a wet, sloughing face has already appeared.",
    },
    {
      id: "relocate-spoil", kind: "select", target: "spoil-pile",
      title: "Set the spoil pile back from the edge",
      cue: "Relocate the excavated soil to at least two feet from the trench edge.",
      why: "Spoil piled at the edge adds surcharge load exactly where the wall is already carrying the most stress, and OSHA's excavation standard sets the two-foot setback for that reason, not as a tidiness rule. Setting the pile back removes that extra weight from the equation entirely, before the wall has to hold both the soil it already had and the pile stacked on top of it.",
    },
    {
      id: "atmosphere-test", kind: "gauge", target: "gas-meter",
      title: "Test the trench atmosphere",
      cue: "Lower the meter into the trench and commit only inside the safe oxygen range.",
      why: "A trench can fill with oxygen-deficient or toxic air from a nicked utility line with no smell and no colour to warn anyone first, which is exactly why OSHA 29 CFR 1926 Subpart P requires testing before every entry, not just the first one of the day — a nicked line or a change in groundwater can turn a trench's atmosphere hours after it was last checked clean.",
      gauge: {
        label: "TRENCH ATMOSPHERE — OXYGEN", speed: 0.6, green: [0.46, 0.6],
        readout: (t) => `${(15 + t * 12).toFixed(1)} % O₂`,
        missNote: "Outside the safe range. Ventilate and re-test before anyone goes below grade on this reading.",
      },
    },
    {
      id: "install-box", kind: "drag", target: "trench-box",
      title: "Place the trench box",
      cue: "Pick up the protective box and lower it into the marked footprint.",
      why: "The trench box is rated for this depth and soil class from the permit, and OSHA's excavation standard treats it as protection that has to already be in place before anyone works below grade — not a precaution added afterward, once someone is already standing in an unshored trench hoping the wall holds through the shift.",
      drag: { to: "trench-socket", radius: 0.4, missNote: "Not lined up with the excavation — line it up with the marked footprint and lower it in." },
    },
    {
      id: "place-ladder", kind: "drag", target: "ladder",
      title: "Place the access ladder",
      cue: "Carry the ladder off the spoil side and set it inside the box, within 25 feet of anyone working.",
      why: "A ladder within 25 feet means an exit is never more than a few steps away, in the trench or on the surface, in an emergency that gives no time to walk further. OSHA's excavation rule sets that 25-foot distance because a means of egress that exists somewhere on the job site is not the same protection as one that exists where the entrant actually is when the wall or the atmosphere turns on them.",
      drag: { to: "ladder-socket", radius: 0.5, missNote: "Not in the box — a ladder lying on the spoil pile is not egress for anybody below grade." },
    },
    {
      id: "spotter-comm", kind: "hold", target: "spotter", seconds: 8,
      title: "Maintain contact with the spotter",
      cue: "Hold continuous contact with the surface spotter while work is underway below grade.",
      why: "The spotter watches the walls, the spoil pile and the surrounding area the whole time an entrant below grade cannot, because attention down there is on the pipe, not the edge. NIOSH lists struck-by equipment and cave-in among the leading causes of excavation deaths, and a spotter in constant contact is what catches the first one before it turns into the second.",
      holdBreakNote: "Contact with the spotter dropped. Re-establish it and hold it for the whole task — nobody works below grade unwatched.",
    },
    {
      id: "pipe-work", kind: "select", target: "utility-line",
      title: "Complete the utility line repair",
      cue: "Make the repair to the utility line now that the trench is shored and tested.",
      why: "The actual repair only starts once guarding, inspection, atmosphere testing and shoring are all already in place — never run in parallel with them to save time, because every one of those steps exists to make the trench safe to be inside of, and none of them protects the minutes before it was actually finished.",
    },
    {
      id: "gps-teach", kind: "sequence", targets: ["grade-wp-start", "grade-wp-mid", "grade-wp-end"],
      itemNames: { "grade-wp-start": "Start waypoint", "grade-wp-mid": "Mid waypoint", "grade-wp-end": "End waypoint" },
      title: "Teach the GPS grade-control waypoints",
      cue: "Record the start, mid and end grade points along the pipe run, in that order.",
      why: "The automated grader follows these waypoints in the order they are recorded, not the order that seems obvious, so teaching start, then mid, then end has to match the pipe's actual slope. A profile taught out of order does not fail loudly — it just cuts the wrong grade the first time the machine runs it unattended over ground the crew has already left.",
      itemNotes: {
        "grade-wp-start": "Recorded at the pipe's upstream invert.",
        "grade-wp-mid": "Recorded at the midpoint, matching the design slope.",
        "grade-wp-end": "Recorded at the downstream invert.",
      },
      outOfOrderNote: "That point comes later in the run. Teach start, then mid, then end — the grader reads the profile in recording order.",
    },
    {
      id: "gps-save", kind: "select", target: "grade-console-save",
      title: "Save the grade-control profile",
      cue: "Commit the three waypoints to the machine control system as one profile.",
      why: "An untaught point list is just three recorded positions sitting in memory, not a plan the machine can act on. Saving it is what turns them into a profile the grade-control system can actually run against, and skipping the save leaves the grader with nothing to follow the next time it powers up over this trench.",
    },
    {
      id: "gps-run", kind: "hold", target: "grade-console-run", seconds: 2.5,
      title: "Dry-run the grade-control profile",
      cue: "Hold RUN/VERIFY and watch the automated profile track clear of the box and the crew.",
      why: "A brand-new profile is verified at a walk-through pace with a hand on the console, watching the whole run, before the grader ever moves unattended over a trench a crew just worked in. Releasing the hold early is exactly how a bad waypoint gets discovered by the machine cutting the wrong grade instead of by the person watching for it.",
      holdBreakNote: "Released before the dry-run finished. Hold it through the whole profile — that's how you catch a bad waypoint before the machine runs it for real.",
    },
    {
      id: "exit-count", kind: "select", target: "headcount-board",
      title: "Take a headcount before backfill",
      cue: "Confirm everyone is out of the trench and account for tools before anything closes up.",
      why: "A headcount against the crew list is what actually confirms the trench is empty — not an assumption made because the ladder looked clear from the surface. OSHA's excavation standard treats backfilling over someone still below grade as a foreseeable failure, not a freak accident, which is exactly why the count happens before the first bucket of fill goes back in.",
    },
    {
      id: "remove-box", kind: "drag", target: "trench-box",
      title: "Remove the protective box",
      cue: "Lift the box clear of the excavation and set it down on the lay-down mat.",
      why: "The box comes out only after everyone is confirmed clear of the trench — removing protection with anyone still below grade defeats the entire point of having placed it. It comes out the way it went in, lifted clear and set down where it is not in anybody's road.",
      drag: { to: "box-laydown", radius: 0.45, missNote: "Not on the mat — a box left half out of the excavation is a hazard to whoever backfills around it." },
    },
    {
      id: "backfill", kind: "select", target: "backfill-panel",
      title: "Backfill and compact",
      cue: "Backfill the trench in lifts and compact each one before signing off.",
      why: "Backfilling in compacted lifts, rather than dumping it back in all at once, is what keeps the surface from settling later and undoing the repair just made underneath it — a trench that reads as finished at grade today can still slump over the utility line if the fill under it was never actually compacted.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.1, 0x7ed321);

    // ------------------------------------------------------------------ ground
    box(g, 4.6, 0.14, 4.6, 0, 0.07, 0, 0x6b5a3f, { rough: 0.95 });

    // ------------------------------------------------------------------ the trench
    const trench = group(g, -0.2, 0, -0.1);
    const trenchW = 0.9, trenchL = 2.6, trenchD = 1.1;
    box(trench, trenchW, 0.02, trenchL, 0, -trenchD / 2, 0, 0x2b2118, { rough: 0.98, cast: false });
    for (const sx of [-1, 1]) {
      box(trench, 0.06, trenchD, trenchL, sx * trenchW / 2, -trenchD / 2, 0, 0x453522, { rough: 0.96, cast: false });
    }
    const wallCrack = box(trench, 0.3, 0.4, 0.02, trenchW / 2 - 0.02, -0.5, 0.6, 0x2b2118, { rough: 0.98, cast: false });

    // Competent-person inspection targets: real, distinct signs of an
    // unstable wall, spread along both faces so the scan reads as a walk
    // down the trench rather than four clicks in one spot.
    const tensionCrack = group(trench, -trenchW / 2 - 0.01, -0.06, -0.75, 0.05);
    box(tensionCrack, 0.5, 0.015, 0.03, 0, 0, 0, 0x1c1712, { rough: 0.95, cast: false });
    reg(hits, tensionCrack, "wall-tension-crack");

    const wallSeep = group(trench, trenchW / 2 + 0.005, -0.7, -0.15);
    box(wallSeep, 0.02, 0.5, 0.22, 0, 0, 0, 0x1b2a26, { rough: 0.5, opacity: 0.55, transparent: true, cast: false });
    reg(hits, wallSeep, "wall-seep");

    const sloughingFace = group(trench, -trenchW / 2 - 0.03, -0.85, 0.95);
    box(sloughingFace, 0.08, 0.3, 0.4, 0, 0, 0, 0x59422a, { rough: 0.98, cast: false });
    reg(hits, sloughingFace, "sloughing-face");

    const stableWall = group(trench, trenchW / 2 + 0.005, -0.35, 0.95);
    box(stableWall, 0.015, 0.35, 0.4, 0, 0, 0, 0x453522, { rough: 0.96, cast: false });
    reg(hits, stableWall, "stable-wall");

    // Protective box, staged beside the excavation until it is carried into place.
    const boxStageX = trenchW / 2 + 0.85;
    const trenchBox = group(trench, boxStageX, 0.06, 0);
    for (const sx of [-1, 1]) {
      box(trenchBox, 0.05, trenchD - 0.1, trenchL - 0.2, sx * (trenchW / 2 - 0.05), 0, 0, 0xd8b23a, { rough: 0.5, metal: 0.5 });
    }
    for (let i = 0; i < 3; i++) {
      box(trenchBox, trenchW - 0.1, 0.06, 0.06, 0, -trenchD / 2 + 0.15 + i * 0.35, -trenchL / 2 + 0.25 + i * 0.9,
        0xd8b23a, { rough: 0.5, metal: 0.5 });
    }
    holoTag(trenchBox, "Trench box — carry it in", 0, trenchD * 0.55, 0, { css: "#7ed321", w: 0.4 });
    reg(hits, trenchBox, "trench-box");

    // A plain, non-interactive marker for where the box actually belongs — the
    // drag step measures against this, never against the box's own footprint.
    const trenchSocket = group(trench, 0, -trenchD / 2 + 0.06, 0);
    hits["trench-socket"] = trenchSocket;

    // Where the box goes when it comes back out. A marked mat rather than the
    // staging spot it started on: by then the ground it was staged on is part
    // of the backfill route, which is the reason a lay-down area is marked on
    // a job in the first place.
    const layMat = group(trench, -(trenchW / 2 + 0.95), 0.012, 0.35);
    box(layMat, 1.05, 0.02, 1.9, 0, 0, 0, 0x33404a, { rough: 0.95, cast: false });
    decal(layMat, 0.95, 0.24, 0, 0.014, -0.55, signFace("LAY-DOWN", { bg: "#1b2a33", accent: "#7ed321", scale: 0.5 }));
    hits["box-laydown"] = layMat;

    // The ladder starts lying on the spoil side where it was dropped off the
    // truck, and gets carried into the box. It used to appear in place when
    // the step was clicked, which taught the rule and skipped the act.
    const ladder = group(trench, 1.35, 0.06, trenchL / 2 - 0.3, 0.1);
    for (const sx of [-1, 1]) cyl(ladder, 0.012, 0.012, trenchD + 0.4, sx * 0.14, (trenchD + 0.4) / 2, 0, 0xa8b0b8, { rough: 0.5, metal: 0.7, seg: 8 });
    for (let i = 0; i < 6; i++) {
      cyl(ladder, 0.01, 0.01, 0.3, 0, 0.15 + i * 0.22, 0, 0xa8b0b8, { rough: 0.5, metal: 0.7, seg: 8 }).rotation.z = Math.PI / 2;
    }
    ladder.rotation.x = Math.PI / 2;                       // lying flat on the spoil side
    reg(hits, ladder, "ladder");
    // Where it has to end up: inside the box, at the end the crew works from.
    const ladderSocket = box(trench, 0.4, 0.1, 0.4, 0.2, -trenchD + 0.05, trenchL / 2 - 0.3,
      0x000000, { opacity: 0.001, transparent: true, cast: false });
    hits["ladder-socket"] = ladderSocket;

    const utilityLine = group(trench, 0, -trenchD + 0.15, 0);
    cyl(utilityLine, 0.06, 0.06, trenchL - 0.4, 0, 0, 0, 0x2f6f8c, { rough: 0.5, metal: 0.4, seg: 14 }).rotation.x = Math.PI / 2;
    holoTag(utilityLine, "Utility line", 0, 0.18, 0, { css: "#7ed321", w: 0.3 });
    reg(hits, utilityLine, "utility-line");

    // Unprotected entry point and untested-entry hazard clickable on the trench itself.
    reg(hits, wallCrack, "unshored-entry");
    const trenchFloor = box(trench, trenchW - 0.1, 0.01, trenchL - 0.1, 0, -trenchD + 0.02, 0, 0x1c1712,
      { rough: 0.98, cast: false, opacity: 0.01, transparent: true });
    reg(hits, trenchFloor, "untested-entry");

    // Spoil pile — too close to the edge until relocated.
    const spoil = group(g, 0.65, 0, -0.1);
    cyl(spoil, 0.4, 0.55, 0.4, 0, 0.2, 0, 0x6b5a3f, { rough: 0.98, seg: 16 });
    holoTag(spoil, "Spoil pile", 0, 0.5, 0, { css: "#7ed321", w: 0.3 });
    reg(hits, spoil, "spoil-pile");

    // Surcharge warning at the edge under the pile — the hazard, separate from the pile itself.
    const surchargeMark = group(g, 0.55, 0, -0.35);
    box(surchargeMark, 0.3, 0.02, 0.3, 0, 0.16, 0, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(surchargeMark, "Surcharge risk", 0, 0.2, 0, { css: "#f0645b", w: 0.32 });
    reg(hits, surchargeMark, "spoil-too-close");

    // No ladder access marker on the far end of the trench, until the ladder step runs.
    const farEnd = group(g, -0.2, 0, -1.3);
    box(farEnd, 0.3, 0.03, 0.3, 0, 0.16, 0, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, farEnd, "no-ladder-access");

    // ------------------------------------------------------------------ guarding
    reg(hits, cone(g, -1.9, -1.2, { color: 0x7ed321 }), "cone-a");
    reg(hits, cone(g, 1.6, 1.3, { color: 0x7ed321 }), "cone-b");
    const railPanels = [];
    for (const [rx, rz, ry] of [[-0.7, 1.4, 0], [0.3, 1.4, 0], [-1.3, 0.4, Math.PI / 2], [0.9, 0.4, Math.PI / 2]]) {
      const panel = barrierPanel(g, rx, rz, { ry, w: 1.1, color: 0x7ed321 });
      panel.visible = false;
      railPanels.push(panel);
    }
    const railKit = group(g, 1.6, 0, -1.0, 0.3);
    slab(railKit, 1.0, 0.14, 0.18, 0, 0.08, 0, 0x7ed321, { radius: 0.02, rough: 0.6 });
    holoTag(railKit, "Trench guard", 0, 0.3, 0, { css: "#7ed321", w: 0.3 });
    reg(hits, railKit, "trench-guard");

    // ------------------------------------------------------------------ crew
    const spotter = standingFigure(g, 1.3, -0.9, { ry: -2.0, cloth: 0x2b3138, vest: 0xf2c14b, helmet: 0xf2f2f2 });
    holoTag(spotter, "Spotter", 0, 1.95, 0.15, { css: "#7ed321", w: 0.24 });
    reg(hits, spotter, "spotter");

    // ------------------------------------------------------------------ paperwork + gear
    const permit = holoPanel(g, 0.58, 0.4, -1.9, 1.5, 1.1, (ctx, w, h) => {
      ctx.fillStyle = "rgba(6,16,22,0.9)"; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#7ed321"; ctx.fillRect(0, 0, w, 5);
      ctx.fillStyle = "#8fb3c4";
      ctx.font = `600 ${Math.round(h * 0.09)}px 'Barlow Condensed', Arial, sans-serif`;
      ctx.textAlign = "left"; ctx.textBaseline = "middle";
      ctx.fillText("EXCAVATION PERMIT · TR-19", w * 0.06, h * 0.14);
      ctx.fillStyle = "#eaf6fb";
      ctx.font = `600 ${Math.round(h * 0.14)}px 'Barlow Condensed', Arial, sans-serif`;
      ctx.fillText("WATER LINE REPAIR, 6 FT DEPTH", w * 0.06, h * 0.33);
      ctx.font = `${Math.round(h * 0.085)}px Arial, sans-serif`;
      ctx.fillStyle = "#a9c6d6";
      ["Soil classification: Type B", "Protective system: trench box, rated 6 ft",
       "Spoil setback: 2 ft minimum", "O₂ safe range: 19.5–23.5%",
       "Ladder: within 25 ft of all workers"].forEach((line, i) => ctx.fillText(line, w * 0.06, h * (0.5 + i * 0.11)));
    }, { ry: 0.7, accent: 0x7ed321 });
    reg(hits, permit, "excavation-permit");

    const inspectBoard = group(g, -1.6, 0, 0.6, 0.5);
    slab(inspectBoard, 0.42, 0.32, 0.03, 0, 1.1, 0, 0x1b232b, { radius: 0.01, rough: 0.6 });
    const inspectFace = decal(inspectBoard, 0.38, 0.28, 0, 1.1, 0.02,
      signFace("SOIL CLASS\nPENDING", { bg: "#11181f", accent: "#7ed321", scale: 0.3 }), { px: 320 });
    holoTag(inspectBoard, "Competent-person log", 0, 1.34, 0, { css: "#7ed321", w: 0.34 });
    reg(hits, inspectBoard, "soil-inspect");

    const chest = toolChest(g, 1.7, 0.6, { ry: -0.4, color: 0x7ed321 });
    const meter = instrument(chest, -0.08, 0.79, 0.05, { ry: 0.3, idle: "-- %", color: 0x7ed321 });
    holoTag(meter, "4-gas meter", 0, 0.16, 0, { css: "#7ed321", w: 0.26 });
    reg(hits, meter, "gas-meter");

    // ------------------------------------------------- GPS grade-control automation
    // Waypoints run along the trench's own length so the taught profile
    // visibly follows the pipe grade, not an arbitrary spot in the yard.
    const gradeWpSpecs = [
      { id: "grade-wp-start", label: "1 · Start", z: -1.0, color: 0x59c97b },
      { id: "grade-wp-mid", label: "2 · Mid", z: 0, color: 0x4fd1ff },
      { id: "grade-wp-end", label: "3 · End", z: 1.0, color: 0xffcc00 },
    ];
    const gradeWps = gradeWpSpecs.map((s) => {
      const marker = torus(trench, 0.09, 0.012, 0.55, 0.02, s.z, s.color,
        { emissive: s.color, ei: 1.2, rough: 0.4, cast: false, seg: 6, seg2: 24 });
      marker.rotation.x = Math.PI / 2;
      holoTag(trench, s.label, 0.55, 0.24, s.z, { css: "#7ed321", w: 0.3 });
      reg(hits, marker, s.id);
      return marker;
    });

    const gradeRover = group(g, 0.55, 0, 0.9, 0.4);
    cyl(gradeRover, 0.012, 0.012, 0.9, 0, 0.45, 0, 0xa8b0b8, { rough: 0.5, metal: 0.6, seg: 8 });
    ball(gradeRover, 0.05, 0, 0.92, 0, 0xd8b23a, { rough: 0.4, metal: 0.3 });
    holoTag(gradeRover, "GPS rover", 0, 1.06, 0, { css: "#7ed321", w: 0.26 });

    const gradeConsole = group(g, 0.85, 0, 0.55, -0.4);
    slab(gradeConsole, 0.34, 0.28, 0.03, 0, 0.9, 0, 0xf2c14b, { radius: 0.02, rough: 0.55 });
    const gradeConsoleScreen = decal(gradeConsole, 0.28, 0.12, 0, 0.94, 0.017,
      signFace("GRADE CTRL", { bg: "#2a1a0d", accent: "#f2c14b", fg: "#ffe3ac", scale: 0.45 }), { glow: true, ei: 0.85, px: 220 });
    holoTag(gradeConsole, "Grade-control console", 0, 1.06, 0, { css: "#7ed321", w: 0.34 });
    const gradeSaveBtn = cyl(gradeConsole, 0.018, 0.018, 0.012, -0.07, 0.75, 0.017, 0x59c97b, { rough: 0.4, seg: 14 });
    gradeSaveBtn.rotation.x = Math.PI / 2;
    reg(hits, gradeSaveBtn, "grade-console-save");
    const gradeRunBtn = cyl(gradeConsole, 0.018, 0.018, 0.012, 0.07, 0.75, 0.017, 0x4fd1ff, { rough: 0.4, seg: 14 });
    gradeRunBtn.rotation.x = Math.PI / 2;
    reg(hits, gradeRunBtn, "grade-console-run");
    holoTag(gradeConsole, "Save · Run", 0, 0.7, 0, { css: "#7ed321", w: 0.26 });

    const headcount = group(g, 1.9, 0, 0.0, 0.6);
    slab(headcount, 0.4, 0.3, 0.03, 0, 1.05, 0, 0x1b232b, { radius: 0.01, rough: 0.6 });
    const headcountFace = decal(headcount, 0.36, 0.26, 0, 1.05, 0.02,
      signFace("CREW\nBELOW GRADE", { bg: "#11181f", accent: "#7ed321", scale: 0.3 }), { px: 320 });
    holoTag(headcount, "Headcount board", 0, 1.28, 0, { css: "#7ed321", w: 0.32 });
    reg(hits, headcount, "headcount-board");

    const backfill = group(g, 0.9, 0, -1.5, 0.4);
    slab(backfill, 0.5, 0.16, 0.2, 0, 0.09, 0, 0x6b5a3f, { radius: 0.02, rough: 0.85 });
    holoTag(backfill, "Backfill and compact", 0, 0.32, 0, { css: "#7ed321", w: 0.36 });
    reg(hits, backfill, "backfill-panel");

    const dust = particles(spoil, 24, 0x9a8a6a, { size: 0.02, life: 0.6, additive: false, opacity: 0.2 });

    let shored = false;

    return {
      hits,
      footprint: 2.1,

      // Spoil actually creeps toward the lip, and the spotter walks off. The
      // learner sees the change if they look up. See shared/game.js.
      onInterrupt(it) {
        if (it.id === "spoil-creeping") { spoil.position.z += 0.42; spoil.position.y += 0.05; }
        if (it.id === "spotter-gone") { spotter.position.x += 2.4; spotter.rotation.y += 1.4; }
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "spoil-creeping") { spoil.position.z -= 0.42; spoil.position.y -= 0.05; }
        if (it.id === "spotter-gone") { spotter.position.x -= 2.4; spotter.rotation.y -= 1.4; }
      },
      onStepComplete(step) {
        if (step.id === "competent-inspect") {
          tensionCrack.children[0].material = mat(0x59c97b, { rough: 0.6 });
          wallSeep.children[0].material = mat(0x59c97b, { rough: 0.5, opacity: 0.4, transparent: true });
          sloughingFace.children[0].material = mat(0x59c97b, { rough: 0.6 });
        }
        if (step.id === "guard-site") railPanels.forEach((p) => { p.visible = true; });
        if (step.id === "relocate-spoil") { spoil.position.set(1.6, 0, -1.4); }
        // The box's own position is already set by the drag-and-drop gesture
        // itself (app.js snaps it onto the socket on a successful drop) — this
        // just flips the bookkeeping flag.
        if (step.id === "install-box") shored = true;
        if (step.id === "place-ladder") {
          ladder.position.set(0.2, -trenchD, trenchL / 2 - 0.3);
          ladder.rotation.x = 0;
        }
        if (step.id === "pipe-work") {
          repaint(inspectFace, signFace("SOIL CLASS B\nCONFIRMED", { bg: "#0f1b14", accent: "#59c97b", fg: "#bff7d4", scale: 0.24 }));
        }
        if (step.id === "gps-save") {
          repaint(gradeConsoleScreen, signFace("SAVED", { bg: "#0d1c14", accent: "#59c97b", fg: "#bff7d4", scale: 0.45 }));
        }
        if (step.id === "gps-run") {
          repaint(gradeConsoleScreen, signFace("VERIFIED", { bg: "#0d1c14", accent: "#59c97b", fg: "#bff7d4", scale: 0.36 }));
        }
        if (step.id === "exit-count") {
          repaint(headcountFace, signFace("CREW\nCLEAR", { bg: "#0f1b14", accent: "#59c97b", fg: "#bff7d4", scale: 0.32 }));
        }
        if (step.id === "remove-box") { trenchBox.visible = false; shored = false; ladder.visible = false; }
      },

      onHazard(hitId) { if (hitId === "spoil-too-close") { dust.visible = true; } },

      animate(t, dt, session) {
        spotter.userData.head.rotation.y = Math.sin(t * 0.6) * 0.4;
        if (dust.visible) dust.userData.step(dt, new THREE.Vector3(0, 0.4, 0), 0.15, 0.15, -0.1);

        // Dry-run playback: the rover rides the taught grade profile —
        // start to mid to end — in step with how far the RUN/VERIFY hold
        // has gotten, so a correctly taught profile has a visible payoff.
        if (session?.step?.id === "gps-run" && session.holding) {
          const p = Math.min(1, session.holdFor / session.step.seconds);
          const from = p < 0.5 ? gradeWps[0] : gradeWps[1];
          const to = p < 0.5 ? gradeWps[1] : gradeWps[2];
          const localP = p < 0.5 ? p * 2 : (p - 0.5) * 2;
          gradeRover.position.lerpVectors(
            new THREE.Vector3(trench.position.x + from.position.x, 0, trench.position.z + from.position.z),
            new THREE.Vector3(trench.position.x + to.position.x, 0, trench.position.z + to.position.z),
            localP);
        }

        const gg = session?.gauge;
        if (gg && !gg.committed && session.step?.id === "atmosphere-test") {
          const o2 = (15 + gg.t * 12).toFixed(1);
          repaint(meter.userData.screen, signFace(`${o2}%`, {
            bg: "#0d1c24", accent: gg.t > 0.46 && gg.t < 0.6 ? "#59c97b" : "#f0645b", fg: "#bfeaf7", scale: 0.6,
          }));
        }
      },
    };
  },
};
