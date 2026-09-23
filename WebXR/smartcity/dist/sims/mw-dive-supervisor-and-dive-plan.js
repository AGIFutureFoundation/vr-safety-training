import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import { box, cyl, ball, torus, hose, group, decal, repaint, signFace, paperFace, mat } from "../../../shared/kit.js";
import {
  CITY, stationPad, holoPanel, holoTag, instrument, standingFigure, valveWheel, reg,
  surfaceTexture, texturedMat, deckPlateFace, waterFace,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Dive Supervisor & Dive Plan VR — Maritime & Ports, the marine
// and water pack of the Bay Area Union Edition.
//
// The surface end of a surface-supplied air dive, worked from a dive barge
// at a pier: the air control panel with its supply gauge, pneumofathometer
// and valves, the comms box, the umbilical flaked down in figure-eights, the
// dive stage on its davit and winch with the diver seated on it, the tender
// beside the diver, the standby diver dressed on the bench, the dive flag,
// and the dive boat's engine controls locked out. The learner is the dive
// supervisor, a Pile Drivers commercial diver; the Inlandboatmen's Union
// deckhand runs the dive boat. Depth, gas and decompression limits are never
// written as numbers here: every reading is "per the dive plan and the
// tables the supervisor holds".

const MWDS_ACCENT = 0xf2b33d;

export const SIM_MW_DIVE_SUPERVISOR_AND_DIVE_PLAN = {
  id: "mw-dive-supervisor-and-dive-plan",
  index: "233",
  domain: "Maritime & Ports",
  trade: "Pile Drivers of the Carpenters commercial diver as dive supervisor on a surface-supplied air dive, with the tender, the standby diver and an Inlandboatmen's Union of the ILWU deckhand on the dive boat",
  category: "Maritime & Ports",
  district: "Maritime & Ports",
  weather: "overcast",
  certification: "Pile Drivers of the Carpenters commercial diver apprenticeship and the UBC International Training Fund; OSHA 29 CFR 1910 Subpart T commercial diving operations — the safe practices manual, the dive team, pre-dive, during-dive and post-dive procedures and the dive record; ADCI consensus standards for commercial diving; USCG 46 CFR 197 Subpart B where the dive is worked from a vessel under Coast Guard jurisdiction; Inlandboatmen's Union of the ILWU deck practice on the dive boat",
  name: "Dive Supervisor & Dive Plan",
  title: simTitle("Dive Supervisor & Dive Plan"),
  tagline: "The dive station at the surface: the plan briefed, the screw locked out and the flag up, the umbilical walked, the air lined up and the supply read against the plan, the station checked, the tools on the stage, the comms check held through a dead line, the stage lowered while a launch comes in with its screw turning, the pneumo read, the decompression obligation read from the tables the supervisor holds, and the dive logged",
  accent: MWDS_ACCENT,
  accentCss: "#f2b33d",
  parSeconds: 290,
  footprint: 2.6,
  badge: { id: "by-the-tables", name: "By The Tables", note: "The standby dressed, the panel never left, the umbilical never paid out foul, and the obligation read from the tables the supervisor holds" },

  supportLine: "your union hall's member assistance programme — the Pile Drivers or the Inlandboatmen's Union — with the employer's employee assistance line behind it",

  game: system({
    name: "Dive Station",
    currency: "FATHOM",
    ranks: ["Tender", "Diver", "Lead Diver", "Dive Supervisor", "Dive Station Certified"],
    badges: [
      { id: "plan-briefed", name: "Plan Briefed", note: "The whole team briefed on the dive plan before anything was dressed or lined up", test: AWARD.stepClean("dive-plan") },
      { id: "read-true", name: "Read True", note: "Supply and pneumo both committed inside the band", test: AWARD.precise(0.7) },
      { id: "panel-held", name: "Panel Held", note: "Never without a dressed standby, never off the panel, never a foul umbilical, never a table off a phone", test: AWARD.safe },
    ],
    challenges: [
      { id: "clean-dive", name: "Clean Dive", note: "No corrections from the plan to the log", test: AWARD.clean },
      { id: "stage-steady", name: "Stage Steady", note: "The stage lowered in band the whole descent", test: AWARD.unbroken },
      { id: "in-the-window", name: "In The Window", note: "Dive logged inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "no-standby": "You called the diver off the surface with the standby diver still undressed on the bench. The standby is the dive team's only answer to a diver who is fouled, unconscious or cut off below, and 29 CFR 1910 Subpart T and the ADCI consensus standards put a standby diver at the station ready to go in for exactly that reason — ready means dressed, checked and on comms, not sitting beside the gear.",
    "deco-from-phone": "You went to read the decompression obligation off an app on a phone. The obligation is read from the tables the supervisor holds for this dive — the tables named in the dive plan and the safe practices manual, the same ones the dive record is written against. An app of unknown provenance, on a screen in the sun, is not the table the team agreed to dive on.",
    "umbilical-foul-cleat": "You went to pay out the umbilical while a bight of it was caught under a deck cleat. A foul on the surface becomes a snatch on the diver below: the tender pays out, the foul holds, and the diver is pulled up short or off the stage with the supervisor still watching the panel. The umbilical is flaked clear and walked free before any of it goes over the side.",
    "leave-panel": "You left the air panel to help at the stage. The supervisor at the panel is the diver's gas supply, pneumo and comms all at once, and a panel nobody is watching is a diver breathing on nothing anyone can see. The tender and the deckhand work the stage; the supervisor stays at the panel for the whole time the diver is in the water.",
  },

  lateNotes: {
    "stage-winch": "The stage goes down once the comms check has been held and the tools are on it — not with the diver's voice still unproven.",
    "pneumo-gauge": "The pneumo is read once the diver is at the work — there is nothing to read while the stage is still on deck.",
    "dive-log": "The dive is logged once the decompression obligation has been read and the stop clock set — it records the dive, it does not plan it.",
  },

  steps: [
    {
      id: "dive-plan", kind: "select", target: "dive-plan-board",
      title: "Brief the dive plan with the whole team",
      cue: "At the plan board with the diver, the tender, the standby and the deckhand: the task, the depth and bottom time per the plan, the gas, the tables, the hazards, the emergency procedures, and who does what.",
      why: "The dive plan is the dive: 29 CFR 1910 Subpart T has the employer's safe practices manual and the plan for each dive set out the task, the limits and the emergency procedures, and the brief is where every member of the team hears the same version of it. A tender who does not know the planned bottom time, or a standby who does not know where the diver will be working, is part of a team that will improvise when something goes wrong.",
    },
    {
      id: "lockout-and-flag", kind: "sequence", anyOrder: true,
      targets: ["screw-lockout", "alpha-flag"],
      itemNames: { "screw-lockout": "dive boat's engine controls locked and tagged", "alpha-flag": "diver-down flag hoisted" },
      title: "Lock out the dive boat's screw and hoist the dive flag",
      cue: "Lock and tag the dive boat's engine controls with the deckhand, and hoist the diver-down flag where approaching traffic can see it.",
      why: "A turning propeller near a diver's umbilical is one of the ways commercial divers die, and the dive boat's own screw is the one the team controls completely: its controls are locked and tagged before anyone is in the water. The diver-down flag is how the rest of the harbour is told there is a person under the water here; together they close the two directions a propeller can come from.",
    },
    {
      id: "umbilical-walk", kind: "find", noHint: true,
      targets: ["umbilical-kink", "fitting-no-wire"],
      itemNames: { "umbilical-kink": "kinked section of the umbilical's gas hose", "fitting-no-wire": "umbilical fitting at the helmet without its safety wire" },
      itemNotes: {
        "umbilical-kink": "A section of the umbilical's gas hose has taken a hard kink where it was coiled tight — under supply pressure a kink restricts the diver's gas and weakens the hose wall at the fold.",
        "fitting-no-wire": "The gas fitting at the helmet end has been made up but not safety-wired; a fitting working loose on the bottom is a diver's gas supply coming apart at the helmet.",
      },
      title: "Walk the umbilical from the panel to the helmet",
      cue: "Walk the whole umbilical: the gas hose, the pneumo hose, the comms cable and the strength member, the fittings made up and safety-wired, the flake in clean figure-eights.",
      why: "The umbilical is the diver's gas, voice, depth reading and lifting line in one bundle, and every metre of it goes into the water. It is walked end to end before the dive because a kink, an unwired fitting or a chafed comms cable is found on deck in a minute and found on the bottom only when it fails — and the flake is laid in figure-eights so it pays out without twisting or snagging.",
    },
    {
      id: "line-up-air", kind: "turn", target: "panel-primary-valve",
      title: "Line up the primary air supply at the panel",
      cue: "Open the primary supply valve on the air control panel steadily, with the secondary supply lined up and ready on its own valve.",
      why: "The panel is where the diver's gas comes from, and it is lined up deliberately: primary open, secondary ready and able to be switched to in seconds. A surface-supplied diver has a bailout on their back for the moment the surface fails, but the plan is that the surface does not fail — and that starts with the supervisor opening the primary by hand and seeing the pressure come up, not assuming last dive's line-up still stands.",
      turn: { turns: 1.0, label: "PRIMARY SUPPLY", readout: (t) => (t < 0.3 ? "closed" : t < 0.9 ? "opening" : "primary open · secondary ready") },
    },
    {
      id: "supply-read", kind: "gauge", target: "panel-supply-gauge",
      title: "Read the supply against the dive plan",
      cue: "Read the panel's supply gauge and commit it against the over-bottom supply the dive plan and the tables require for the planned depth.",
      why: "A demand helmet delivers gas only while the supply is far enough above the pressure at the diver's depth, and the dive plan, built on the tables the supervisor holds, sets what that supply must be for this dive. The supervisor reads it at the panel before the diver leaves the surface, because a supply that is fine on deck and marginal at the work is found out by the diver working hard and not getting a breath.",
      gauge: { label: "SUPPLY vs PLAN", speed: 0.68, green: [0.42, 0.6], readout: (t) => (t < 0.42 ? "below the plan's supply" : t <= 0.6 ? "per the dive plan" : "above the panel's setting"), missNote: "Outside the band — let the needle settle and read it against the supply the dive plan sets for this depth." },
    },
    {
      id: "station-check", kind: "find", noHint: true,
      targets: ["o2-kit-seal", "standby-harness"],
      itemNames: { "o2-kit-seal": "oxygen kit with its seal broken and the cylinder low", "standby-harness": "standby diver's harness unclipped from their umbilical" },
      itemNotes: {
        "o2-kit-seal": "The first-aid oxygen kit's seal is broken and its cylinder gauge reads low — the kit is on station for a diver who surfaces with symptoms, and a low cylinder runs out before the diver reaches help.",
        "standby-harness": "The standby diver's umbilical is not clipped to their harness; a standby who goes in like that has a gas supply and no strength member if they need to be pulled back.",
      },
      title: "Check the station is ready for the dive going wrong",
      cue: "Walk the station for the emergency: the oxygen kit sealed and full, the standby's harness and umbilical made up, the first-aid kit and the recovery gear at hand.",
      why: "Every item on a dive station exists for the dive that goes wrong, and the check is done now because none of it can be fixed with a diver in trouble below. The oxygen kit is what treats a diver who surfaces with symptoms until they reach a chamber, and the standby's rig is what reaches a diver who cannot surface at all — both are walked by the supervisor, not taken on trust from the last dive.",
    },
    {
      id: "tools-on-stage", kind: "drag", target: "tool-bag",
      title: "Pass the tool bag onto the stage",
      cue: "Hand the diver's tool bag onto the stage and clip it to the stage rail, so the tools go down with the diver and not on a line afterwards.",
      why: "Tools go down on the stage with the diver, clipped to the rail, because a bag lowered separately on a line is a second thing hanging in the water beside the umbilical, and a tool dropped from the surface is a weight falling on a diver who cannot see it. Clipped on the stage, the bag arrives where the diver is and comes back up the same way, with nothing loose in the water column.",
      drag: { to: "stage-basket", radius: 0.5, missNote: "Not on the stage — the bag clips to the stage rail so it travels with the diver, never lowered on its own line." },
    },
    {
      id: "comms-check", kind: "hold", target: "comms-box", seconds: 5,
      title: "Hold the comms check with the diver on the stage",
      cue: "Keep the comms button and talk the diver through the check: voice both ways, the pneumo reading at the surface, the free-flow and the bailout checked, and the diver ready to leave the surface.",
      why: "The diver's voice is how the supervisor knows the diver is breathing, thinking clearly and where they say they are, and it is proven both ways at the surface before the stage moves. The check also runs the diver's own last checks aloud — bailout on, free-flow working, pneumo reading — so both ends of the umbilical hear them done rather than assuming them.",
      holdBreakNote: "The check was dropped before the diver had confirmed everything — a comms check is only complete when both ends have heard it through. Take it from the top.",
    },
    {
      id: "lower-stage", kind: "track", target: "stage-winch", seconds: 6,
      title: "Lower the stage at a steady rate",
      cue: "Work the stage winch to lower the diver at the steady rate the dive plan gives, with the tender paying out the umbilical in step — no stops, no snatches.",
      why: "The stage takes the diver down at a controlled rate so the diver can equalise, the tender can pay out the umbilical without a bight forming, and the supervisor can watch the pneumo follow the descent. A snatch on the winch throws the diver against the stage rails, and a stall leaves them hanging mid-water; the rate is held in band so everything at both ends of the umbilical moves together.",
      track: { start: 0.14, green: [0.42, 0.6], rise: 0.56, fall: 0.46, drift: 0.12, label: "STAGE WINCH", readout: (v) => (v < 0.42 ? "stalled — diver hanging" : v > 0.6 ? "too fast — ease off" : "steady descent per plan") },
      holdBreakNote: "The stage went out of band on the way down — a stall or a snatch the diver felt. Bring the winch back to a steady rate and hold it.",
    },
    {
      id: "pneumo-read", kind: "gauge", target: "pneumo-gauge",
      title: "Read the diver's depth on the pneumofathometer",
      cue: "With the diver at the work, bleed the pneumo and read the diver's depth, and commit it against the depth the dive plan gives for this task.",
      why: "The pneumofathometer is the supervisor's measurement of the diver's actual depth, and it is the number the decompression obligation is read against — not the depth on the chart or the depth the diver thinks they are at. It is read with the pneumo bled and settled, and committed against the plan, because a diver working deeper than planned is on a different line of the tables than the one the dive was briefed on.",
      gauge: { label: "PNEUMO", speed: 0.7, green: [0.4, 0.58], readout: (t) => (t < 0.4 ? "shallower than the plan" : t <= 0.58 ? "at the depth per plan" : "deeper than planned — tell the diver"), missNote: "Outside the band — bleed the pneumo, let it settle, and read the diver's depth against the dive plan's figure." },
    },
    {
      id: "deco-obligation", kind: "sequence",
      targets: ["deco-tables", "deco-clock"],
      itemNames: { "deco-tables": "obligation read from the tables the supervisor holds", "deco-clock": "stop clock set for the ascent" },
      title: "Read the decompression obligation and set the clock",
      cue: "Read the decompression obligation for the pneumo depth and the bottom time from the tables the supervisor holds, then set the stop clock for the ascent.",
      why: "Decompression obligations come from the tables the supervisor holds for this dive — the tables the plan names — read at the depth the pneumo actually showed and the bottom time the clock actually ran. The obligation is read before the ascent begins and the clock set from it, because a stop worked out in a hurry at the end of a dive is how a diver gets bent; the tables decide, not memory and not an estimate.",
      outOfOrderNote: "Out of order — the obligation is read from the tables first; the clock is set from what the tables say, never the other way round.",
    },
    {
      id: "dive-log", kind: "select", target: "dive-log",
      title: "Record the dive in the dive log",
      cue: "Record the diver, the task, the depth from the pneumo, the bottom time, the table and schedule used, the lost comms and the launch, and the diver's condition on surfacing.",
      why: "The dive record is required under 29 CFR 1910 Subpart T and it is what a diver's future dives are planned against: repetitive dives, the next day's work and any symptoms that appear hours later are all read against it. The lost comms and the launch go in as well, because an incident that ended well is still information the next supervisor on this pier should have.",
    },
    {
      id: "crew-checkin", kind: "select", target: "team-board",
      title: "Debrief and check in with the dive team",
      cue: "Team debrief at the board: how the dive went, the comms drop and the launch, how the diver feels and who watches them for symptoms, and how everyone is.",
      why: "A diver who has surfaced is watched for decompression symptoms for some time afterwards, and the team is told who is watching and what to look for. The debrief is also where the tender, the standby and the deckhand say what they saw — a launch with its screw turning toward a diver is a frightening minute for everyone at the station, and the Pile Drivers' and the Inlandboatmen's member assistance lines are there for what the debrief does not settle.",
    },
  ],

  interrupts: [
    {
      id: "comms-dead-on-stage",
      kind: "Comms lost with the diver",
      after: "comms-check", delay: 2, seconds: 14,
      alert: "The diver's voice has cut out mid-check — nothing on the speaker and no answer to the supervisor's call.",
      cue: "Have the tender take up the umbilical and give line-pull signals to the diver.",
      target: "tender-line",
      why: "When voice comms fail, the umbilical itself is the backup: the tender takes up the slack and gives the agreed line-pull signals, and the diver answers the same way. It is done immediately rather than after fiddling with the comms box, because until the diver answers the team does not know whether the comms have failed or the diver has.",
      missNote: "The supervisor kept pressing the comms button with no answer while the tender stood holding a slack umbilical; the diver, hearing nothing either, had no idea whether to stay or come up.",
      wrongNote: "The tender's line — with voice gone, line-pull signals on the umbilical are how the diver is reached.",
    },
    {
      id: "launch-screw-turning",
      kind: "Vessel with its screw turning near the dive",
      after: "lower-stage", delay: 2, seconds: 14,
      alert: "A launch is coming in toward the pier with its screw turning, heading for the water right over the stage — it has not seen the flag.",
      cue: "Hail the launch on the VHF handset: diver in the water, keep clear, stop your engine.",
      target: "vhf-handset",
      why: "A propeller over an umbilical is the most direct way a diver is killed, and a launch that has not seen the flag has to be told, immediately and in words, that there is a diver under the water ahead of it. The VHF call is the fastest way to reach the helmsman; the stage and the diver cannot get out of the way of a screw, so the screw has to be kept away from them.",
      missNote: "The launch kept coming with its screw turning, crossed the water over the stage, and the supervisor was still watching the winch when its wash hit the umbilical.",
      wrongNote: "The VHF — the launch has to hear that there is a diver in the water before its screw reaches the umbilical.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.6, MWDS_ACCENT);

    // ------------------------------------------------------ water and barge
    const water = box(g, 7.8, 0.02, 7.6, 0, 0.012, -1.0, 0xffffff, { rough: 0.15, metal: 0.4, cast: false });
    water.material = texturedMat(surfaceTexture((cx, w, h) => waterFace(cx, w, h, { base: "#0b2831", mid: "#10323c" }), { repeat: 3, px: 512 }), { rough: 0.15, metal: 0.4, color: 0x7ea8b6 });
    const deck = box(g, 6.4, 0.14, 3.8, 0, 0.4, 0.2, 0xffffff, { rough: 0.8 });
    deck.material = texturedMat(surfaceTexture((cx, w, h) => deckPlateFace(cx, w, h, { base: "#3c434a", base2: "#33393f", step: 22 }), { repeat: 4, px: 512 }), { rough: 0.8, metal: 0.35, color: 0xc2c8ce });
    box(g, 6.4, 0.4, 3.8, 0, 0.16, 0.2, 0x2a2f35, { rough: 0.7, cast: false });
    box(g, 6.4, 0.12, 0.1, 0, 0.53, -1.7, CITY.hiVis, { rough: 0.6 });
    for (const x of [-3.0, 3.0]) cyl(g, 0.12, 0.12, 2.6, x, 1.0, -1.9, 0x5b6771, { rough: 0.5, metal: 0.6, seg: 10 });

    // ------------------------------------------------------ the air panel
    const panelG = group(g, 1.3, 0.47, -0.4);
    box(panelG, 1.1, 0.8, 0.5, 0, 0.4, 0, 0x2b3138, { rough: 0.6, metal: 0.4 });
    const face = box(panelG, 1.0, 0.6, 0.06, 0, 1.1, -0.15, 0x3a4148, { rough: 0.5, metal: 0.5 });
    face.rotation.x = -0.35;
    void face;
    const gaugeAt = (x, y) => {
      const gg = group(panelG, x, y, -0.1);
      gg.rotation.x = -0.35;
      const dial = cyl(gg, 0.08, 0.08, 0.03, 0, 0, 0, 0xf1f3f4, { rough: 0.4, seg: 20 });
      dial.rotation.x = Math.PI / 2;
      const needle = box(gg, 0.008, 0.06, 0.006, 0, 0.02, 0.02, 0xd2312b, { rough: 0.4 });
      return { gg, needle };
    };
    const supply = gaugeAt(-0.3, 1.18);
    holoTag(supply.gg, "supply", 0, 0.14, 0, { css: "#f2b33d", w: 0.18 });
    reg(hits, supply.gg, "panel-supply-gauge");
    const pneumo = gaugeAt(0.05, 1.18);
    holoTag(pneumo.gg, "pneumo", 0, 0.14, 0, { css: "#f2b33d", w: 0.18 });
    reg(hits, pneumo.gg, "pneumo-gauge");
    const secondary = gaugeAt(0.35, 1.18);
    void secondary;
    const prim = valveWheel(panelG, -0.3, 0.86, -0.28, { r: 0.07, color: 0xf2b33d, body: 0x2f4f6f });
    prim.scale.set(0.6, 0.6, 0.6);
    holoTag(prim, "primary supply", 0, 0.62, 0, { css: "#f2b33d", w: 0.3 });
    reg(hits, prim, "panel-primary-valve");
    const secValve = valveWheel(panelG, 0.3, 0.86, -0.28, { r: 0.07, color: 0x8b98a5, body: 0x2f4f6f });
    secValve.scale.set(0.6, 0.6, 0.6);
    const comms = group(panelG, 0.7, 0.8, 0.0);
    box(comms, 0.3, 0.22, 0.26, 0, 0.11, 0, 0x1b1e22, { rough: 0.55 });
    const commsLamp = ball(comms, 0.022, 0.1, 0.2, -0.1, 0x59c97b, { emissive: 0x59c97b, ei: 1.2, seg: 8, seg2: 6 });
    cyl(comms, 0.035, 0.035, 0.02, -0.05, 0.225, -0.05, 0xd2312b, { rough: 0.4, seg: 12 });
    holoTag(comms, "comms box", 0, 0.38, 0, { css: "#f2b33d", w: 0.24 });
    reg(hits, comms, "comms-box");
    // Leaving the panel is a hazard of its own.
    const leaveHit = box(g, 0.6, 0.4, 0.6, 0.35, 0.7, -0.9, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "leave the panel to help?", 0.35, 1.05, -0.9, { css: "#d2312b", w: 0.46 });
    reg(hits, leaveHit, "leave-panel");
    // Volume tank and compressor behind the panel.
    const vt = cyl(g, 0.25, 0.25, 1.1, 2.6, 1.02, 0.2, 0xe8e2d0, { rough: 0.5, metal: 0.3, seg: 16 });
    void vt;
    box(g, 0.8, 0.6, 0.6, 2.6, 0.77, 1.2, 0x2f6f4a, { rough: 0.6, metal: 0.3 });
    hose(g, [[2.6, 0.9, 0.5], [2.1, 0.6, 0.0], [1.6, 0.9, -0.3]], 0.03, 0x15181c, { steps: 10, rough: 0.8 });

    // -------------------------------------------------- stage and davit
    const stage = group(g, -1.3, 0.47, -2.05);
    const davit = group(stage, 0, 0, 0.35);
    box(davit, 0.16, 2.2, 0.16, -0.7, 1.1, 0, CITY.hiVis, { rough: 0.55, metal: 0.3 });
    box(davit, 0.16, 2.2, 0.16, 0.7, 1.1, 0, CITY.hiVis, { rough: 0.55, metal: 0.3 });
    box(davit, 1.56, 0.16, 0.16, 0, 2.2, 0, CITY.hiVis, { rough: 0.55, metal: 0.3 });
    const stageCage = group(stage, 0, 0, -0.1);
    box(stageCage, 1.0, 0.05, 0.8, 0, 0.0, 0, 0x3a4148, { rough: 0.6, metal: 0.5 });
    for (const sx of [-0.48, 0.48]) for (const sz of [-0.38, 0.38]) box(stageCage, 0.04, 1.1, 0.04, sx, 0.55, sz, 0xe8b02e, { rough: 0.55, metal: 0.3 });
    box(stageCage, 1.0, 0.04, 0.04, 0, 1.1, -0.38, 0xe8b02e, { rough: 0.55, metal: 0.3 });
    box(stageCage, 1.0, 0.04, 0.04, 0, 0.6, -0.38, 0xe8b02e, { rough: 0.55, metal: 0.3 });
    const liftWire = cyl(stage, 0.008, 0.008, 1.1, 0, 1.65, -0.1, 0x8a949d, { rough: 0.4, metal: 0.8, seg: 6 });
    const basket = group(stageCage, 0.3, 0.3, 0.3);
    const basketRing = torus(basket, 0.18, 0.01, 0, 0.1, 0, MWDS_ACCENT, { emissive: MWDS_ACCENT, ei: 1.6, rough: 0.4, cast: false, seg: 6, seg2: 24 });
    basketRing.rotation.x = Math.PI / 2;
    holoTag(basket, "stage rail clip", 0, 0.4, 0, { css: "#f2b33d", w: 0.3 });
    reg(hits, basket, "stage-basket");
    // The diver seated on the stage: dry suit, helmet, bailout.
    const diver = group(stageCage, -0.15, 0.05, 0);
    const diverFig = standingFigure(diver, 0, 0, { atStation: true, ry: 3.1, cloth: 0x1b1e22, trousers: 0x1b1e22, gloves: 0x2b2b2b });
    void diverFig;
    const helmet = ball(diver, 0.2, 0, 1.63, 0, 0xf2c14b, { rough: 0.35, metal: 0.4, seg: 16, seg2: 12 });
    void helmet;
    const port = cyl(diver, 0.09, 0.09, 0.04, 0, 1.63, 0.17, 0x274a5f, { rough: 0.1, metal: 0.5, seg: 16 });
    port.rotation.x = Math.PI / 2;
    cyl(diver, 0.08, 0.08, 0.45, 0, 1.15, -0.2, 0xc8ccd0, { rough: 0.4, metal: 0.6, seg: 12 });
    // The diver's tool bag on deck by the stage, waiting to be clipped on.
    const toolBag = group(g, -2.2, 0.47, -0.3);
    box(toolBag, 0.34, 0.24, 0.2, 0, 0.12, 0, 0x2f4f6f, { rough: 0.85 });
    box(toolBag, 0.3, 0.03, 0.03, 0, 0.3, 0, 0x15181c, { rough: 0.7 });
    cyl(toolBag, 0.015, 0.015, 0.3, 0.08, 0.3, 0.02, 0xc0c6cc, { rough: 0.3, metal: 0.9, seg: 6 }).rotation.z = 0.9;
    holoTag(toolBag, "tool bag", 0, 0.45, 0, { css: "#f2b33d", w: 0.22 });
    reg(hits, toolBag, "tool-bag");
    // Stage winch and its lever.
    const winch = group(g, -2.5, 0.47, -1.2);
    box(winch, 0.6, 0.5, 0.5, 0, 0.25, 0, 0x2f4f6f, { rough: 0.55, metal: 0.4 });
    const wDrum = cyl(winch, 0.16, 0.16, 0.5, 0, 0.55, 0, 0x5b6771, { rough: 0.5, metal: 0.6, seg: 14 });
    wDrum.rotation.z = Math.PI / 2;
    const wLever = group(winch, 0.32, 0.45, 0.2);
    cyl(wLever, 0.016, 0.016, 0.34, 0, 0.17, 0, CITY.steel, { rough: 0.4, metal: 0.8, seg: 8 });
    ball(wLever, 0.035, 0, 0.35, 0, 0xd2312b, { rough: 0.5, seg: 10, seg2: 8 });
    holoTag(winch, "stage winch", 0, 1.0, 0, { css: "#f2b33d", w: 0.26 });
    reg(hits, winch, "stage-winch");

    // ------------------------------------------------- umbilical and tender
    const flake = group(g, -0.2, 0.48, -0.5);
    for (let i = 0; i < 3; i++) for (const sx of [-0.2, 0.2]) {
      const loop = torus(flake, 0.2, 0.025, sx, 0.02 + i * 0.05, 0, 0xf2c14b, { rough: 0.8, seg: 6, seg2: 20 });
      loop.rotation.x = Math.PI / 2;
    }
    const umbKink = box(flake, 0.12, 0.06, 0.06, 0.38, 0.1, 0.1, 0x6a4a0a, { rough: 0.9, emissive: 0x3a2206, ei: 0.4 });
    reg(hits, umbKink, "umbilical-kink");
    const umbRun = hose(g, [[-0.2, 0.62, -0.5], [-0.6, 0.7, -1.2], [-1.2, 1.2, -1.85], [-1.45, 1.9, -2.12]], 0.025, 0xf2c14b, { steps: 12, rough: 0.8 });
    void umbRun;
    const wireSpot = ball(g, 0.035, -1.45, 1.95, -2.1, 0xc0c6cc, { rough: 0.3, metal: 0.9, emissive: 0x4a0808, ei: 0.4, seg: 8, seg2: 6 });
    reg(hits, wireSpot, "fitting-no-wire");
    const cleat = group(g, -1.1, 0.47, -0.95);
    box(cleat, 0.3, 0.05, 0.08, 0, 0.06, 0, 0x2b3138, { rough: 0.6, metal: 0.5 });
    hose(cleat, [[-0.2, 0.05, 0.1], [0, 0.1, 0], [0.2, 0.05, 0.1]], 0.02, 0xf2c14b, { steps: 6, rough: 0.8 });
    const cleatHit = box(cleat, 0.45, 0.3, 0.35, 0, 0.12, 0, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(cleat, "pay out — foul on the cleat?", 0, 0.42, 0, { css: "#d2312b", w: 0.5 });
    reg(hits, cleatHit, "umbilical-foul-cleat");
    const tender = standingFigure(g, 0.62, -1.48, { ry: -1.9, cloth: 0x1f3a52, vest: 0xf06a2b, helmet: 0xf1f3f4, gloves: true });
    tender.position.y = 0.47;
    holoTag(tender, "tender", 0, 1.9, 0, { css: "#f2b33d", w: 0.2 });
    const tenderLine = group(g, -0.05, 1.25, -1.75);
    const tlSlack = hose(tenderLine, [[0, 0, 0], [-0.25, -0.3, -0.1], [-0.55, -0.15, -0.25]], 0.02, 0xf2c14b, { steps: 8, rough: 0.8 });
    const tlTaut = hose(tenderLine, [[0, 0, 0], [-0.4, 0.05, -0.15], [-0.8, 0.3, -0.35]], 0.02, 0xf2c14b, { steps: 8, rough: 0.8 });
    tlTaut.visible = false;
    holoTag(tenderLine, "tender's line signals", 0.1, 0.25, 0, { css: "#f2b33d", w: 0.4 });
    reg(hits, tenderLine, "tender-line");

    // ------------------------------------------------ standby, O2 and flag
    const bench = group(g, 2.5, 0.47, 1.55, -0.5);
    box(bench, 1.0, 0.4, 0.4, 0, 0.2, 0, 0x5b4a3a, { rough: 0.8 });
    const standby = standingFigure(g, 1.6, 1.65, { ry: -2.6, cloth: 0x1b1e22, trousers: 0x1b1e22, gloves: 0x2b2b2b });
    standby.position.y = 0.47;
    holoTag(standby, "standby diver", 0, 1.9, 0, { css: "#f2b33d", w: 0.3 });
    const sbHelmet = ball(bench, 0.18, -0.25, 0.58, 0, 0xf2c14b, { rough: 0.35, metal: 0.4, seg: 14, seg2: 10 });
    void sbHelmet;
    const sbClip = box(bench, 0.1, 0.05, 0.08, 0.25, 0.44, 0.1, 0xd2312b, { rough: 0.5, emissive: 0x4a0808, ei: 0.4 });
    reg(hits, sbClip, "standby-harness");
    const noStandby = box(bench, 0.8, 0.3, 0.5, 0, 0.45, 0, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(bench, "standby can dress later?", 0, 0.95, 0, { css: "#d2312b", w: 0.46 });
    reg(hits, noStandby, "no-standby");
    const o2 = group(g, 0.8, 0.47, 1.9);
    box(o2, 0.5, 0.3, 0.3, 0, 0.15, 0, 0xf1f3f4, { rough: 0.5 });
    box(o2, 0.5, 0.06, 0.31, 0, 0.2, 0, 0x2f8f5a, { rough: 0.5 });
    const o2Seal = box(o2, 0.05, 0.03, 0.02, 0.2, 0.2, 0.16, 0xd2312b, { rough: 0.5, emissive: 0x4a0808, ei: 0.4 });
    void o2Seal;
    holoTag(o2, "oxygen kit", 0, 0.45, 0, { css: "#f2b33d", w: 0.24 });
    reg(hits, o2, "o2-kit-seal");
    const mast = group(g, -2.8, 0.47, 0.9);
    cyl(mast, 0.025, 0.03, 2.2, 0, 1.1, 0, 0x8a949d, { rough: 0.45, metal: 0.7, seg: 8 });
    const flagDown = decal(mast, 0.4, 0.3, 0.2, 0.9, 0, signFace("A", { bg: "#f1f3f4", accent: "#2b5aa8", fg: "#2b5aa8", scale: 0.8 }), { px: 128 });
    const flagUp = decal(mast, 0.5, 0.36, 0.26, 2.0, 0, signFace("A", { bg: "#f1f3f4", accent: "#2b5aa8", fg: "#2b5aa8", scale: 0.8 }), { px: 128 });
    flagUp.visible = false;
    holoTag(mast, "diver-down flag", 0, 2.35, 0, { css: "#f2b33d", w: 0.3 });
    reg(hits, mast, "alpha-flag");

    // ------------------------------------------------ dive boat controls
    const helm = group(g, -2.55, 0.47, 1.9, 0.6);
    box(helm, 0.7, 0.9, 0.5, 0, 0.45, 0, 0xf1f3f4, { rough: 0.55 });
    box(helm, 0.6, 0.06, 0.4, 0, 0.93, 0, 0x2b3138, { rough: 0.5 });
    const throttle = box(helm, 0.04, 0.2, 0.04, 0.1, 1.05, 0, 0xd2312b, { rough: 0.5 });
    void throttle;
    const lockTagG = group(helm, 0.1, 1.0, 0.12);
    const lockBody = box(lockTagG, 0.06, 0.06, 0.03, 0, 0, 0, 0xd2312b, { rough: 0.4 });
    const tagCard = box(lockTagG, 0.08, 0.12, 0.005, 0.06, -0.08, 0, 0xf2c14b, { rough: 0.7 });
    lockTagG.visible = false;
    void lockBody; void tagCard;
    holoTag(helm, "dive boat controls — lock out", 0, 1.35, 0, { css: "#f2b33d", w: 0.54 });
    reg(hits, helm, "screw-lockout");
    const vhf = instrument(g, 0.3, 0.97, 1.3, { ry: 0.2, idle: "VHF · CH 16", color: 0xf2b33d, w: 0.1, d: 0.16 });
    box(g, 0.36, 0.5, 0.3, 0.3, 0.72, 1.3, 0x2b3138, { rough: 0.6, metal: 0.4 });
    holoTag(vhf, "VHF handset", 0, 0.16, 0, { css: "#f2b33d", w: 0.26 });
    reg(hits, vhf, "vhf-handset");

    // --------------------------------------------------------- paperwork
    const plan = holoPanel(g, 0.8, 0.56, 2.9, 1.35, -0.4, (cx, w, h) => {
      cx.fillStyle = "#1a1406"; cx.fillRect(0, 0, w, h); cx.fillStyle = "#f2b33d"; cx.fillRect(0, 0, w, 6);
      cx.font = `600 ${Math.round(h * 0.1)}px 'Barlow Condensed', Arial, sans-serif`; cx.textAlign = "left"; cx.textBaseline = "middle";
      cx.fillStyle = "#fbecc8"; cx.fillText("DIVE PLAN", w * 0.06, h * 0.13);
      cx.font = `${Math.round(h * 0.07)}px Arial, sans-serif`; cx.fillStyle = "#fdf5e2";
      ["Task: pier pile inspection, bents as listed", "Depth and bottom time: per dive plan", "Gas: surface-supplied air, bailout worn",
       "Decompression: per the tables the supervisor holds", "Standby: dressed at the station, on comms", "Emergency: lost comms, fouling, recovery"]
        .forEach((l, i) => cx.fillText(l, w * 0.06, h * (0.28 + i * 0.115)));
    }, { ry: -1.4, accent: MWDS_ACCENT });
    reg(hits, plan, "dive-plan-board");
    const table = group(g, 1.35, 0.47, 0.75);
    box(table, 0.9, 0.06, 0.55, 0, 0.8, 0, 0x5b4a3a, { rough: 0.8 });
    for (const [lx, lz] of [[-0.4, -0.22], [0.4, -0.22], [-0.4, 0.22], [0.4, 0.22]]) cyl(table, 0.025, 0.025, 0.8, lx, 0.4, lz, 0x3a4148, { rough: 0.6, metal: 0.4, seg: 6 });
    const tables = group(table, -0.22, 0.85, 0);
    box(tables, 0.26, 0.04, 0.34, 0, 0, 0, 0x2b5aa8, { rough: 0.7 });
    decal(tables, 0.2, 0.26, 0, 0.022, 0, paperFace("TABLES", ["Held by the supervisor", "Per the dive plan"], { bg: "#e8eef6", band: "#2b5aa8" }), { px: 160 }).rotation.x = -Math.PI / 2;
    holoTag(tables, "the supervisor's tables", 0, 0.2, 0, { css: "#f2b33d", w: 0.42 });
    reg(hits, tables, "deco-tables");
    const clock = instrument(table, 0.1, 0.85, 0.02, { ry: 0, idle: "STOP CLOCK", color: 0xf2b33d, w: 0.1, d: 0.14 });
    holoTag(clock, "stop clock", 0, 0.14, 0, { css: "#f2b33d", w: 0.22 });
    reg(hits, clock, "deco-clock");
    const phone = group(table, 0.34, 0.85, 0.12);
    box(phone, 0.07, 0.01, 0.14, 0, 0, 0, 0x15181c, { rough: 0.3 });
    box(phone, 0.06, 0.005, 0.12, 0, 0.007, 0, 0x4fb3e8, { rough: 0.2, emissive: 0x2a6a8a, ei: 0.6 });
    const phoneHit = box(phone, 0.25, 0.2, 0.25, 0, 0.05, 0, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(phone, "table off an app?", 0, 0.18, 0, { css: "#d2312b", w: 0.34 });
    reg(hits, phoneHit, "deco-from-phone");
    const log = holoPanel(g, 0.6, 0.42, 2.2, 1.3, 2.35, (cx, w, h) => {
      cx.fillStyle = "#1a1406"; cx.fillRect(0, 0, w, h); cx.fillStyle = "#f2b33d"; cx.fillRect(0, 0, w, 6);
      cx.font = `600 ${Math.round(h * 0.12)}px 'Barlow Condensed', Arial, sans-serif`; cx.textAlign = "left"; cx.textBaseline = "middle";
      cx.fillStyle = "#fbecc8"; cx.fillText("DIVE LOG", w * 0.06, h * 0.16);
      cx.font = `${Math.round(h * 0.09)}px Arial, sans-serif`; cx.fillStyle = "#fdf5e2";
      ["Diver: —", "Depth / time: —", "Table / schedule: —"].forEach((l, i) => cx.fillText(l, w * 0.06, h * (0.4 + i * 0.18)));
    }, { ry: -0.5, accent: MWDS_ACCENT });
    reg(hits, log, "dive-log");
    const team = holoPanel(g, 0.5, 0.34, -1.2, 1.3, 2.45, (cx, w, h) => {
      cx.fillStyle = "#1a1406"; cx.fillRect(0, 0, w, h); cx.fillStyle = "#59c97b"; cx.fillRect(0, 0, w, 6);
      cx.font = `600 ${Math.round(h * 0.13)}px 'Barlow Condensed', Arial, sans-serif`; cx.textAlign = "left"; cx.textBaseline = "middle";
      cx.fillStyle = "#fbecc8"; cx.fillText("DIVE TEAM", w * 0.06, h * 0.2);
      cx.font = `${Math.round(h * 0.1)}px Arial, sans-serif`; cx.fillStyle = "#fdf5e2";
      ["Supervisor · Diver · Tender", "Standby · Deckhand"].forEach((l, i) => cx.fillText(l, w * 0.06, h * (0.5 + i * 0.22)));
    }, { ry: 0.3, accent: 0x59c97b });
    reg(hits, team, "team-board");

    // ------------------------------------------ the launch for the interruption
    const launch = group(g, -5.5, 0, -4.2, 0.9);
    box(launch, 0.9, 0.35, 2.2, 0, 0.15, 0, 0xf1f3f4, { rough: 0.55 });
    box(launch, 0.7, 0.45, 0.7, 0, 0.55, 0.2, 0x2b5aa8, { rough: 0.5 });
    const wake = box(launch, 1.2, 0.01, 1.6, 0, 0.03, -1.8, 0xeaf6fb, { rough: 0.3, emissive: 0xcfe8ee, ei: 0.4, cast: false });
    void wake;
    launch.visible = false;

    const waterTex = water.material.map;
    const stageHome = stageCage.position.y;

    return {
      hits,
      spawnLook: new THREE.Vector3(0.2, 0.9, -0.8),
      onStep() {},
      onStepComplete(step) {
        if (step.id === "lockout-and-flag") { lockTagG.visible = true; flagDown.visible = false; flagUp.visible = true; }
        if (step.id === "umbilical-walk") { umbKink.visible = false; wireSpot.material = mat(0xc0c6cc, { rough: 0.3, metal: 0.9 }); }
        if (step.id === "station-check") { o2Seal.material = mat(0x59c97b, { rough: 0.5 }); sbClip.material = mat(0x59c97b, { rough: 0.5 }); }
        if (step.id === "tools-on-stage") basketRing.material = mat(0x59c97b, { emissive: 0x59c97b, ei: 1.2 });
        if (step.id === "lower-stage") { stageCage.position.y = stageHome - 1.2; liftWire.scale.y = 2.0; liftWire.position.y = 1.1; }
        if (step.id === "deco-obligation") repaint(clock.userData.screen, signFace("STOPS SET", { bg: "#0d1c24", accent: "#59c97b", fg: "#bfeaf7", scale: 0.55 }));
        if (step.id === "dive-log") {
          repaint(log.userData.face, (cx, w, h) => {
            cx.fillStyle = "#1a1406"; cx.fillRect(0, 0, w, h); cx.fillStyle = "#59c97b"; cx.fillRect(0, 0, w, 6);
            cx.font = `600 ${Math.round(h * 0.12)}px 'Barlow Condensed', Arial, sans-serif`; cx.textAlign = "left"; cx.textBaseline = "middle";
            cx.fillStyle = "#fbecc8"; cx.fillText("DIVE LOG", w * 0.06, h * 0.16);
            cx.font = `${Math.round(h * 0.085)}px Arial, sans-serif`; cx.fillStyle = "#e6f6ea";
            ["Depth: per pneumo · time: per clock", "Table: the supervisor's, per plan", "Comms lost · launch hailed clear"].forEach((l, i) => cx.fillText(l, w * 0.06, h * (0.4 + i * 0.18)));
          });
        }
      },
      onHazard() {},
      onInterrupt(it) {
        if (it.id === "comms-dead-on-stage") commsLamp.material = mat(0xf0645b, { emissive: 0xf0645b, ei: 1.4 });
        if (it.id === "launch-screw-turning") { launch.visible = true; launch.position.set(-3.6, 0, -3.6); }
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "comms-dead-on-stage") { tlSlack.visible = false; tlTaut.visible = true; commsLamp.material = mat(0xf2b33d, { emissive: 0xf2b33d, ei: 1.2 }); }
        if (it.id === "launch-screw-turning") { launch.rotation.y = 2.6; launch.position.set(-5.0, 0, -4.6); }
      },
      animate(t, dt, session) {
        const step = session?.step;
        if (waterTex?.offset) { waterTex.offset.x = t * 0.004; waterTex.offset.y = t * 0.005; }
        if (session?.turn && step?.id === "line-up-air") prim.userData.wheel.rotation.y = session.turn.amount * Math.PI * 2;
        const gg = session?.gauge;
        if (gg && !gg.committed && step?.id === "supply-read") supply.needle.rotation.z = 1.2 - gg.t * 2.4;
        if (gg && !gg.committed && step?.id === "pneumo-read") pneumo.needle.rotation.z = 1.2 - gg.t * 2.4;
        if (step?.id === "lower-stage" && session.holding) { wDrum.rotation.x += (dt ?? 0.016) * 2 * (session.track?.v ?? 0); stageCage.position.y = stageHome - Math.min(1.2, (session.track?.inBand ?? 0) * 0.2); }
        if (launch.visible && session?.activeInterrupt?.id === "launch-screw-turning") launch.position.z = -3.6 + Math.sin(t) * 0.05;
        void CITY; void wLever;
      },
    };
  },
};
