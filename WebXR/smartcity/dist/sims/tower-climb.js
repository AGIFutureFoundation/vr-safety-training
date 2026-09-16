import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, ball, torus, hose, group, decal, repaint, signFace, particles, mat,
} from "../../../shared/kit.js";
import {
  CITY, stationPad, holoPanel, holoTag, toolChest, equipmentCabinet, instrument,
  lockTag, standingFigure, reg,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Tower Climb VR — its own gamified system: Summit Authority.
// Guyed broadcast tower work. Two hazards stack here that do not exist together
// anywhere else in the suite: a fall that starts the instant a lanyard is not
// engaged, and RF energy on the antennas that gives no warning before it burns.

export const SIM_TOWER_CLIMB = {
  id: "tower-climb",
  index: "11",
  domain: "Telecom",
  trade: "Telecom / broadcast tower technician",
  category: "Connectivity & Telecom",
  certification: "CWA — NATE Tower Climber Level II certified",
  name: "Tower Climb",
  title: simTitle("Tower Climb"),
  tagline: "Guyed tower climb: 100% tie-off, RF lockout and a controlled descent",
  accent: 0xff7a1a,
  accentCss: "#ff7a1a",
  parSeconds: 240,
  badge: { id: "summit-authority", name: "Summit Authority", note: "Every clip made, every tool tethered, no unprotected air" },

  game: system({
    name: "Summit Authority",
    currency: "SUMMIT",
    ranks: ["Ground Hand", "Tower Climber", "Rigger", "Climb Lead", "Summit Certified"],
    badges: [
      { id: "always-clipped", name: "100% Tied Off", note: "Never move without an active connection", test: AWARD.safe },
      { id: "rf-cleared", name: "RF Cleared", note: "Survey and lock out the RF before every ascent", test: AWARD.all(AWARD.stepClean("rf-survey"), AWARD.stepClean("rf-lockout")) },
      { id: "steady-hand", name: "Steady Hand", note: "Hold every reading near band centre", test: AWARD.precise(0.72) },
    ],
    challenges: [
      { id: "clear-summit", name: "Clear Summit", note: "Complete inside 80% of par", test: AWARD.fast(0.8) },
      { id: "first-ascent", name: "First Ascent", note: "Clean run, no corrections", test: AWARD.clean },
      { id: "summit-streak", name: "Summit Streak", note: "Nine correct actions in a row", test: AWARD.streak(9) },
    ],
  }),

  hazards: {
    "unclipped-move": "That beam is past your last clipped point. Moving to it before the second lanyard is already engaged leaves you connected to nothing during the transfer, and a transfer is exactly when climbers slip.",
    "live-antenna-panel": "That antenna panel is still transmitting. Working this close without RF lockout exposes you to RF heating and lets stray current arc into an ungrounded tool the instant it touches the feed line.",
    "loose-tool": "That wrench is sitting untethered on the platform grating. A dropped tool from this height hits the ground crew below with the force of a weight dropped from a moving vehicle, not a hand tool.",
    "frayed-lanyard-hazard": "That lanyard's webbing is frayed clean through the outer sheath. A shock-absorbing lanyard is only rated for one fall event, and damaged webbing can part well before it ever reaches that rating.",
  },

  lateNotes: {
    "rescue-plan": "The rescue plan is reviewed with the whole climb team before anyone clips in, not looked up after someone is already stuck at height.",
    "descent-device": "The descent device only gets used once the work above is finished and every tool is already accounted for and stowed.",
  },

  steps: [
    {
      id: "permit", kind: "select", target: "climb-permit",
      title: "Read the climb permit",
      cue: "Confirm the structure, the work height and which antennas nearby are live.",
      why: "The permit names every transmitter that can reach this structure. You plan the RF survey and the climb route from it before a single boot touches the first rung.",
    },
    {
      id: "rf-survey", kind: "gauge", target: "rf-meter",
      title: "Survey the RF field at the work height",
      cue: "Read the RF survey meter and commit only inside the safe exposure band.",
      why: "RF exposure is invisible and cumulative. A survey at the actual work height, not the ground, is what tells you whether the antennas nearby need to come off air before you go up.",
      gauge: {
        label: "RF FIELD SURVEY — WORK HEIGHT", speed: 0.6, green: [0.0, 0.22],
        readout: (t) => `${(t * 12).toFixed(1)} mW/cm²`,
        missNote: "Above the safe exposure limit at this height. That antenna needs power reduced or locked out before you climb any further.",
      },
    },
    {
      id: "rf-lockout", kind: "select", target: "transmitter-lockout",
      title: "Lock out the transmitters",
      cue: "Confirm with the station engineer and lock the transmitter feed for antennas at your work height.",
      why: "A verbal 'it's off' is not lockout. The physical lock is what stops someone downstairs re-energising the feed while you are standing next to the radiating element.",
    },
    {
      id: "rescue-briefing", kind: "select", target: "rescue-plan",
      title: "Brief the rescue plan",
      cue: "Review the self-rescue kit, the descent route and who calls it if something goes wrong.",
      why: "A suspension trauma rescue has to start inside minutes. The plan is worthless if the first time the climb team hears it is after someone is already hanging in a harness.",
    },
    {
      id: "harness-donning", kind: "sequence",
      targets: ["harness", "lanyard-a", "lanyard-b"],
      itemNames: { harness: "full-body harness", "lanyard-a": "lanyard 1", "lanyard-b": "lanyard 2" },
      title: "Don the fall-arrest gear",
      cue: "Fit the harness, then clip lanyard 1, then clip lanyard 2.",
      why: "The harness goes on before either lanyard has anything to clip to. Two lanyards is what makes 100% tie-off possible — one stays anchored while the other moves to the next point.",
      outOfOrderNote: "Wrong order — the harness is fitted and checked before either lanyard is clipped to it.",
    },
    {
      id: "tether-tools", kind: "select", target: "tool-lanyards",
      title: "Tether every tool",
      cue: "Clip a tool lanyard to each hand tool before you leave the ground.",
      why: "Anything not tethered is a dropped-object hazard the moment your hand opens for any reason. Tethering happens at the ground, not once you notice a tool is loose at height.",
    },
    {
      id: "structure-inspect", kind: "find", noHint: true,
      targets: ["worn-cable", "cracked-stepbolt", "corroded-anchor"],
      itemNames: {
        "worn-cable": "frayed guy wire strand",
        "cracked-stepbolt": "cracked step bolt",
        "corroded-anchor": "corroded guy anchor",
      },
      itemNotes: {
        "worn-cable": "Broken strands on a guy wire mean it is carrying less rated tension than the structure needs — tag it and report it before anyone climbs past it.",
        "cracked-stepbolt": "A cracked step bolt can shear under a boot's full weight with no warning. It gets flagged and avoided, not tested by standing on it.",
        "corroded-anchor": "A corroded guy anchor at grade is losing holding capacity below the surface where you cannot see it. That is a structural finding, not cosmetic rust.",
      },
      decoyNotes: {
        "healthy-cable": "That guy wire is sound — full strand count, proper tension. Nothing to flag.",
        "healthy-stepbolt": "That step bolt is solid and properly torqued. Move on.",
      },
      title: "Walk the structure inspection",
      cue: "Check the guy wires, step bolts and anchors. Three things are wrong — find them by looking.",
      why: "A structural inspection is a search before every climb, not an assumption that yesterday's tower is today's tower. Weather and corrosion do not wait for the annual inspection.",
    },
    {
      id: "climb-ascent", kind: "sequence",
      targets: ["anchor-1", "anchor-2", "anchor-3"],
      itemNames: { "anchor-1": "lower climb anchor", "anchor-2": "mid climb anchor", "anchor-3": "upper climb anchor" },
      title: "Climb, maintaining 100% tie-off",
      cue: "Transfer your lanyards from anchor to anchor, low to high, never both unclipped at once.",
      why: "One lanyard stays connected while the other reaches for the next anchor. That overlap is the entire concept of 100% tie-off — it only works taken in order, low to high.",
      outOfOrderNote: "Wrong order — the anchors are taken low to high. Skipping one means a stretch of climb with no verified connection.",
    },
    {
      id: "work-task", kind: "select", target: "antenna-work",
      title: "Replace the antenna mounting bracket",
      cue: "Complete the bracket swap now that the antenna is locked out and the structure is confirmed sound.",
      why: "The actual repair only happens once every control ahead of it is already in place — locked-out RF, inspected structure, tied-off climber.",
    },
    {
      id: "tool-retrieve", kind: "select", target: "tool-bag",
      title: "Recover and stow tools",
      cue: "Account for every tethered tool and stow them before descent.",
      why: "A tool count at height matches the ground crew's tool count before you climbed. Anything unaccounted for stays a dropped-object risk until it is found.",
    },
    {
      id: "descent", kind: "hold", target: "descent-device", seconds: 8,
      title: "Make a controlled descent",
      cue: "Engage the descent device and hold a steady brake the whole way down.",
      why: "A controlled descent is a held skill, not a release. Letting go partway to 'save time' is how a controlled descent becomes an uncontrolled one.",
      holdBreakNote: "Brake released early. Re-engage the descent device and hold it steady for the full descent.",
    },
    {
      id: "rf-restore", kind: "select", target: "transmitter-lockout",
      title: "Clear the RF lockout",
      cue: "Confirm the whole crew is off the structure, then release the transmitter lock with the station engineer.",
      why: "The lock does not come off until every climber has confirmed clear. Restoring power to an antenna with someone still on the tower is exactly what the lockout existed to prevent.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.1, 0xff7a1a);

    // ---------------------------------------------------------------- ground pad
    box(g, 4.6, 0.14, 4.6, 0, 0.07, 0, 0x555c63, { rough: 0.92 });
    for (let i = -3; i <= 3; i++) box(g, 4.6, 0.004, 0.02, 0, 0.145, i * 0.7, 0x454c53, { cast: false, receive: false });

    // ---------------------------------------------------------------- the mast
    const mastHeight = 2.7;
    const mast = group(g, 0, 0, -0.5);
    cyl(mast, 0.09, 0.11, mastHeight, 0, mastHeight / 2, 0, CITY.darkSteel, { rough: 0.5, metal: 0.6, seg: 10 });
    for (const sx of [-1, 1]) {
      cyl(mast, 0.012, 0.012, mastHeight - 0.3, sx * 0.14, mastHeight / 2, 0.08, CITY.steel,
        { rough: 0.4, metal: 0.75, seg: 8 });
    }
    for (let i = 0; i < 13; i++) {
      box(mast, 0.26, 0.018, 0.02, 0, 0.2 + i * 0.2, 0.1, CITY.steel, { rough: 0.45, metal: 0.7 });
    }

    // Guy wires to ground anchors at three heights, each with its own condition.
    const guySpecs = [
      { y: 0.85, a: 0.4, len: 1.9 }, { y: 1.65, a: 2.5, len: 1.55 }, { y: 2.4, a: -2.2, len: 1.2 },
    ];
    const guyLines = [];
    for (const s of guySpecs) {
      const gx = Math.sin(s.a) * s.len, gz = -0.5 + Math.cos(s.a) * s.len;
      guyLines.push(hose(g, [[0, s.y, -0.5], [gx * 0.5, s.y * 0.55, (gz - 0.5) * 0.5 - 0.5], [gx, 0.02, gz]],
        0.012, CITY.steel, { steps: 14, rough: 0.5, metal: 0.6 }));
    }

    // Climb anchors on the mast face — clip points for the ascent sequence.
    const anchorSpecs = [{ id: "anchor-1", y: 0.9 }, { id: "anchor-2", y: 1.7 }, { id: "anchor-3", y: 2.45 }];
    const anchorRings = {};
    for (const a of anchorSpecs) {
      const ring = torus(mast, 0.045, 0.009, 0, a.y, 0.12, 0xd8b23a, { rough: 0.45, metal: 0.6, seg: 8, seg2: 18 });
      ring.rotation.x = Math.PI / 2;
      anchorRings[a.id] = ring;
      reg(hits, ring, a.id);
    }

    // Frayed guy wire, cracked step bolt, corroded anchor — the inspection finds.
    const wornCable = group(mast, 0, guySpecs[1].y - 0.1, 0.08);
    box(wornCable, 0.07, 0.02, 0.02, 0, 0, 0, 0xc9c2b4, { rough: 0.9 });
    holoTag(wornCable, "Guy wire section", 0, 0.12, 0, { css: "#ff7a1a", w: 0.3 });
    reg(hits, wornCable, "worn-cable");
    const healthyCable = group(mast, 0, guySpecs[2].y - 0.1, 0.08);
    box(healthyCable, 0.07, 0.02, 0.02, 0, 0, 0, 0x8b929a, { rough: 0.5, metal: 0.5 });
    reg(hits, healthyCable, "healthy-cable");

    const crackedBolt = group(mast, -0.13, 1.2, 0.1);
    box(crackedBolt, 0.05, 0.03, 0.03, 0, 0, 0, 0xb8402f, { rough: 0.6 });
    reg(hits, crackedBolt, "cracked-stepbolt");
    const healthyBolt = group(mast, 0.13, 0.6, 0.1);
    box(healthyBolt, 0.05, 0.03, 0.03, 0, 0, 0, CITY.steel, { rough: 0.4, metal: 0.7 });
    reg(hits, healthyBolt, "healthy-stepbolt");

    const guyAnchor = group(g, Math.sin(guySpecs[0].a) * guySpecs[0].len, 0, -0.5 + Math.cos(guySpecs[0].a) * guySpecs[0].len);
    cyl(guyAnchor, 0.05, 0.06, 0.1, 0, 0.05, 0, 0x8a6a3a, { rough: 0.85, seg: 12 });
    reg(hits, guyAnchor, "corroded-anchor");

    // ---------------------------------------------------------------- top platform
    const platform = group(mast, 0, mastHeight - 0.02, 0.02);
    box(platform, 0.6, 0.03, 0.55, 0, 0, 0.28, 0x3c444c, { rough: 0.7, metal: 0.4 });
    const antenna = group(platform, 0, 0.3, 0.5);
    box(antenna, 0.32, 0.5, 0.06, 0, 0, 0, 0x2b3138, { rough: 0.5, metal: 0.5 });
    const antennaGlow = ball(antenna, 0.03, 0, 0.24, 0.035, 0xf0645b, { emissive: 0xf0645b, ei: 2.2 });
    holoTag(antenna, "Antenna panel", 0, 0.42, 0, { css: "#ff7a1a", w: 0.3 });
    reg(hits, antenna, "live-antenna-panel");

    const bracket = group(platform, -0.2, 0.1, 0.35);
    box(bracket, 0.08, 0.04, 0.08, 0, 0, 0, 0x8b929a, { rough: 0.5, metal: 0.5 });
    holoTag(bracket, "Mounting bracket", 0, 0.1, 0, { css: "#ff7a1a", w: 0.3 });
    reg(hits, bracket, "antenna-work");

    const looseWrench = group(platform, 0.2, 0.03, 0.1);
    box(looseWrench, 0.14, 0.015, 0.03, 0, 0, 0, 0xdfe4e8, { rough: 0.35, metal: 0.7 });
    reg(hits, looseWrench, "loose-tool");

    const edgeBeam = box(platform, 0.4, 0.03, 0.06, 0.32, 0, -0.15, 0x545c63, { rough: 0.6, metal: 0.4 });
    holoTag(platform, "Unclipped reach", 0.32, 0.14, -0.15, { css: "#f0645b", w: 0.32 });
    reg(hits, edgeBeam, "unclipped-move");

    // ---------------------------------------------------------------- ground crew + hazards
    const groundCrew = standingFigure(g, 0.9, 1.4, { ry: -1.9, cloth: 0x2b3138, vest: 0xf2c14b, helmet: 0xf2f2f2 });
    holoTag(groundCrew, "Ground crew", 0, 1.95, 0.15, { css: "#ff7a1a", w: 0.28 });

    // ---------------------------------------------------------------- paperwork + RF gear
    const permit = holoPanel(g, 0.58, 0.4, -1.9, 1.5, 1.1, (ctx, w, h) => {
      ctx.fillStyle = "rgba(6,16,22,0.9)"; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#ff7a1a"; ctx.fillRect(0, 0, w, 5);
      ctx.fillStyle = "#8fb3c4";
      ctx.font = `600 ${Math.round(h * 0.09)}px 'Barlow Condensed', Arial, sans-serif`;
      ctx.textAlign = "left"; ctx.textBaseline = "middle";
      ctx.fillText("CLIMB PERMIT · TOWER T-118", w * 0.06, h * 0.14);
      ctx.fillStyle = "#eaf6fb";
      ctx.font = `600 ${Math.round(h * 0.14)}px 'Barlow Condensed', Arial, sans-serif`;
      ctx.fillText("ANTENNA BRACKET REPLACEMENT", w * 0.06, h * 0.33);
      ctx.font = `${Math.round(h * 0.085)}px Arial, sans-serif`;
      ctx.fillStyle = "#a9c6d6";
      ["Work height: 82 ft", "RF survey limit: 2.5 mW/cm² MPE",
       "Rescue kit: base of mast, west side", "Anchors: lower, mid, upper — climb in order",
       "Ground exclusion zone: 6 m radius"].forEach((line, i) => ctx.fillText(line, w * 0.06, h * (0.5 + i * 0.11)));
    }, { ry: 0.7, accent: 0xff7a1a });
    reg(hits, permit, "climb-permit");

    const rescuePanel = holoPanel(g, 0.44, 0.3, 1.9, 1.5, -0.6, (ctx, w, h) => {
      ctx.fillStyle = "rgba(6,16,22,0.9)"; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#ff7a1a"; ctx.fillRect(0, 0, w, 5);
      ctx.fillStyle = "#eaf6fb";
      ctx.font = `600 ${Math.round(h * 0.16)}px 'Barlow Condensed', Arial, sans-serif`;
      ctx.textAlign = "center"; ctx.textBaseline = "middle";
      ctx.fillText("RESCUE PLAN", w / 2, h * 0.3);
      ctx.font = `${Math.round(h * 0.1)}px Arial, sans-serif`;
      ctx.fillStyle = "#a9c6d6";
      ctx.fillText("Suspension trauma: retrieve inside 10 min", w / 2, h * 0.58);
      ctx.fillText("Ground lead calls the rescue, not the climber", w / 2, h * 0.76);
    }, { ry: -0.7, accent: 0xff7a1a });
    reg(hits, rescuePanel, "rescue-plan");

    const rfCab = equipmentCabinet(g, 0.5, 0.9, 0.32, -1.85, -1.3, { color: 0x545e67, ry: 0.5 });
    decal(rfCab, 0.3, 0.08, 0.16, 1.05, 0.17, signFace("TX LOCKOUT", { accent: "#ff7a1a", scale: 0.48 }));
    const rfLock = lockTag(rfCab, 0.16, 0.75, 0.19, { color: 0xd8232a });
    rfLock.visible = false;
    reg(hits, rfCab, "transmitter-lockout");

    const chest = toolChest(g, 1.6, 1.3, { ry: -0.5, color: 0xff7a1a });
    const meter = instrument(chest, -0.08, 0.79, 0.05, { ry: 0.3, idle: "-- mW", color: 0xff7a1a });
    holoTag(meter, "RF survey meter", 0, 0.16, 0, { css: "#ff7a1a", w: 0.3 });
    reg(hits, meter, "rf-meter");

    const harness = group(chest, 0.14, 0.79, 0.02, 0.4);
    for (const sx of [-1, 1]) {
      const strap = box(harness, 0.03, 0.02, 0.2, sx * 0.05, 0, 0, 0xf2c14b, { rough: 0.85 });
      strap.rotation.x = 0.2;
    }
    box(harness, 0.14, 0.02, 0.04, 0, 0.012, 0.02, 0xf2c14b, { rough: 0.85 });
    torus(harness, 0.02, 0.005, 0, 0.03, -0.06, CITY.steel, { rough: 0.3, metal: 0.9 });
    holoTag(harness, "Harness", 0, 0.18, 0, { css: "#ff7a1a", w: 0.26 });
    reg(hits, harness, "harness");

    const lanyardA = group(chest, 0.02, 0.8, 0.14, -0.2);
    hose(lanyardA, [[-0.06, 0, 0], [0, 0.03, 0.02], [0.06, 0, 0]], 0.008, 0xf2c14b, { steps: 8, rough: 0.7 });
    holoTag(lanyardA, "Lanyard 1", 0, 0.1, 0, { css: "#ff7a1a", w: 0.24 });
    reg(hits, lanyardA, "lanyard-a");

    const lanyardB = group(chest, -0.02, 0.8, -0.12, 0.2);
    hose(lanyardB, [[-0.06, 0, 0], [0, 0.03, 0.02], [0.06, 0, 0]], 0.008, 0xf2c14b, { steps: 8, rough: 0.7 });
    holoTag(lanyardB, "Lanyard 2", 0, 0.1, 0, { css: "#ff7a1a", w: 0.24 });
    reg(hits, lanyardB, "lanyard-b");

    const frayedLanyard = group(chest, 0.22, 0.55, 0.15, -0.3);
    hose(frayedLanyard, [[-0.06, 0, 0], [0, 0.02, 0.02], [0.06, 0, 0]], 0.008, 0xb8402f, { steps: 8, rough: 0.9 });
    holoTag(frayedLanyard, "Frayed lanyard", 0, 0.09, 0, { css: "#f0645b", w: 0.3 });
    reg(hits, frayedLanyard, "frayed-lanyard-hazard");

    const toolLanyards = group(chest, -0.24, 0.6, 0.15, 0.3);
    box(toolLanyards, 0.1, 0.03, 0.03, 0, 0, 0, 0x2b3138, { rough: 0.7 });
    holoTag(toolLanyards, "Tool lanyards", 0, 0.09, 0, { css: "#ff7a1a", w: 0.28 });
    reg(hits, toolLanyards, "tool-lanyards");

    const toolBag = group(g, 1.4, 0, 1.55, -0.3);
    box(toolBag, 0.3, 0.22, 0.2, 0, 0.11, 0, 0x3c4147, { rough: 0.85 });
    holoTag(toolBag, "Tool bag", 0, 0.28, 0, { css: "#ff7a1a", w: 0.26 });
    reg(hits, toolBag, "tool-bag");

    const descentDevice = group(g, -1.5, 0, 1.2, 0.4);
    box(descentDevice, 0.14, 0.1, 0.08, 0, 0.55, 0, 0xd8b23a, { rough: 0.5, metal: 0.5 });
    holoTag(descentDevice, "Descent device", 0, 0.68, 0, { css: "#ff7a1a", w: 0.3 });
    reg(hits, descentDevice, "descent-device");

    let rfLive = true;
    let arcTimer = 0;
    const arc = particles(antenna, 40, 0xffcf8a, { size: 0.014, life: 0.26 });
    const dropSpark = particles(looseWrench, 24, 0xffd28a, { size: 0.02, life: 0.3, additive: false, opacity: 0.4 });

    return {
      hits,
      footprint: 2.1,

      onStepComplete(step) {
        if (step.id === "rf-lockout") {
          rfLive = false; rfLock.visible = true;
          antennaGlow.material = mat(0x3c444c, { rough: 0.6, metal: 0.3 });
        }
        if (step.id === "structure-inspect") {
          wornCable.children[0].material = mat(0x59c97b, { rough: 0.5 });
          crackedBolt.children[0].material = mat(0x59c97b, { rough: 0.5 });
        }
        if (step.id === "climb-ascent") {
          for (const id of ["anchor-1", "anchor-2", "anchor-3"]) {
            anchorRings[id].material = mat(0x59c97b, { emissive: 0x59c97b, ei: 1.6, rough: 0.4, metal: 0.5 });
          }
        }
        if (step.id === "work-task") bracket.children[0].material = mat(0x59c97b, { rough: 0.4, metal: 0.6 });
        if (step.id === "tool-retrieve") toolBag.visible = false;
        if (step.id === "rf-restore") {
          rfLive = true; rfLock.visible = false;
          antennaGlow.material = mat(0xf0645b, { emissive: 0xf0645b, ei: 2.2 });
        }
      },

      onHazard(hitId) {
        if (hitId === "live-antenna-panel" && rfLive) arcTimer = 0.4;
        if (hitId === "loose-tool") { dropSpark.visible = true; }
      },

      animate(t, dt, session) {
        if (rfLive) antennaGlow.material.emissiveIntensity = 1.8 + Math.sin(t * 4) * 0.5;
        groundCrew.userData.head.rotation.y = Math.sin(t * 0.6) * 0.4;
        if (arcTimer > 0) {
          arcTimer -= dt;
          arc.visible = true;
          arc.userData.step(dt, new THREE.Vector3(0, 0, 0), 0.05, 1.4, -2.8);
        } else if (arc.visible) arc.visible = false;
        if (dropSpark.visible) dropSpark.userData.step(dt, new THREE.Vector3(0, 0, 0), 0.04, 0.3, -1.2);

        const gg = session?.gauge;
        if (gg && !gg.committed && session.step?.id === "rf-survey") {
          const v = (gg.t * 12).toFixed(1);
          repaint(meter.userData.screen, signFace(`${v} mW`, {
            bg: "#0d1c24", accent: gg.t < 0.22 ? "#59c97b" : "#f0645b", fg: "#bfeaf7", scale: 0.55,
          }));
        }
      },
    };
  },
};
