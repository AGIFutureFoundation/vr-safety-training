import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import { box, cyl, ball, torus, hose, group, decal, repaint, paperFace, mat } from "../../../shared/kit.js";
import {
  CITY, stationPad, holoTag, standingFigure, valveWheel, lockTag, reg,
  surfaceTexture, texturedMat, deckPlateFace, waterFace, paintedSteelFace,
} from "../citykit.js";
import { blockFace, safetyStripeFace } from "../../../shared/textures.js";
import { divingStage } from "../../../shared/props.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Hydraulic Tools & Suction Hazards Underwater — the surface
// side. Commercial diving and scientific scuba pack, DIVE1.
//
// A pier apron beside a plant's water intake: the block pump house with its
// disconnect and the dive team's lock box, the intake pipe and its grate in
// the water off the apron, a second unmarked pipe and a bypass valve, the
// hydraulic power unit with its hoses and manifold, the hydraulic grinder on
// the tool line, the diving stage at the edge with the diver, the flow
// streamer at the grate, the supervisor, the standby and the plant operator.
// The learner is the diver-tender who locks the intake out, tends the tool
// and the hoses and holds the lock against a plant that wants its pump back.
// No pressure, flow, depth or time figure is stated; the tool's manual, the
// permit and the dive plan hold them.

const CDHT_ACCENT = 0xe0844a;
const CDHT_CSS = "#e0844a";

export const SIM_CD_HYDRAULIC_TOOLS_AND_SUCTION_HAZARDS_UNDERWATER = {
  id: "cd-hydraulic-tools-and-suction-hazards-underwater",
  index: "722",
  domain: "Maritime & Ports",
  trade: "Pile Drivers of the Carpenters diver-tender locking out a plant intake and tending a hydraulic tool to a diver, with the dive supervisor, the standby diver and the plant operator who wants the pump back",
  category: "Maritime & Ports",
  district: "Maritime & Ports",
  weather: "overcast",
  certification: "Pile Drivers apprenticeship under the Carpenters (UBC) International Training Fund; OSHA 29 CFR 1910 Subpart T — 29 CFR 1910.421 pre-dive planning and the assessment of hazardous activities nearby, 29 CFR 1910.422 procedures during the dive (power tools supplied from the surface and de-energised before they are placed in or retrieved from the water), 29 CFR 1910.430 equipment and 29 CFR 1910.425 the tended diver; OSHA 29 CFR 1910.147 lockout and tagout of the intake pump; ADCI consensus standards on differential-pressure hazards and diver-operated tools; USCG 46 CFR 197 Subpart B where the dive is from a vessel; every pressure, flow and depth per the tool's manual and the dive plan",
  name: "Hydraulic Tools & Suction Hazards Underwater",
  title: simTitle("Hydraulic Tools & Suction Hazards Underwater"),
  tagline: "Nothing near the grate until the pump cannot run: the differential-pressure brief taken, the unmarked pipe and the open bypass found, the disconnect opened, the dive team's lock and tag applied and the start tried, the streamer watched hang slack at the grate while the plant asks for its pump back, the power unit set to the tool's manual, the couplings checked, the tool handed down cold, the hoses tended clear of the umbilical while a coupling weeps, the return flow read, the tool recovered dead, the lock lifted only on the supervisor's count, the log written",
  accent: CDHT_ACCENT,
  accentCss: CDHT_CSS,
  parSeconds: 320,
  footprint: 2.6,
  badge: { id: "lock-held", name: "Lock Held", note: "The intake locked, tried and proven slack before the diver went near it, and the lock held against the plant until the count was in" },

  supportLine: "your union hall's member assistance programme — the Pile Drivers of the Carpenters — with the employer's employee assistance line behind it",

  game: system({
    name: "Cold Grate",
    currency: "LOCK COUNTS",
    ranks: ["Deckhand", "Tender", "Tool Tender", "Lead Tender", "Intake Work Certified"],
    badges: [
      { id: "found-the-bypass", name: "Found The Bypass", note: "The unmarked pipe and the open bypass found before the lock went on", test: AWARD.stepClean("identify-intakes") },
      { id: "to-the-manual", name: "To The Manual", note: "The return flow committed inside the manual's band first time", test: AWARD.precise(0.7) },
      { id: "cold-handover", name: "Cold Handover", note: "No hazard reached for from the brief to the log", test: AWARD.safe },
    ],
    challenges: [
      { id: "clean-lockout", name: "Clean Lockout", note: "No corrections from the brief to the check-in", test: AWARD.clean },
      { id: "hoses-clear", name: "Hoses Clear", note: "The hoses tended in band the whole job", test: AWARD.unbroken },
      { id: "logged-quick", name: "Logged Quick", note: "Log written inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "reach-into-grate": "You told the diver to clear the weed off the grate by hand before the lockout was proven. A grate with any flow behind it is a differential-pressure trap: the pull is invisible from the outside and does not let go once a hand or an arm is against the bars, and a diver held on a grate cannot be pulled off by the tender or the standby. Nothing goes near the grate until the pump is locked, tried and the streamer hangs slack.",
    "operators-word": "You accepted the plant operator's word that the pump was off and moved on without the lock. An operator's word is a moment; a lock is the whole dive. The pump that is off can be started from the control room, by a timer, by the next shift or by the operator who forgot, and 29 CFR 1910.147 has the energy isolated and locked by the people exposed to it, with their own lock. The dive team's lock goes on, and only the dive supervisor takes it off.",
    "hand-on-leak": "You ran your hand along the hydraulic hose to find the pinhole that was misting oil. Hydraulic fluid at a pinhole leak is a jet fine enough to go through a glove and the skin under it and leave oil in the tissue, an injection injury that looks like nothing and needs a surgeon. A leak is found with a piece of cardboard held at arm's length, with the power unit stopped, never with a hand.",
    "tool-live-handover": "You went to pass the grinder down the tool line with the power unit running and the tool's trigger free. 29 CFR 1910.422 has a surface-supplied power tool de-energised before it goes in or comes out of the water, because a live tool on a line is a tool that starts when the line snags the trigger, beside a diver's hands and umbilical. The power unit is stopped, the tool is passed, and the diver calls for power once it is in their hands.",
  },

  lateNotes: {
    "flow-streamer": "The streamer is watched once the lock is on and the start has been tried.",
    "hose-tend": "The hoses are tended once the tool is in the diver's hands and powered on their call.",
    "intake-log": "The log is written once the diver is out and the lock is lifted on the count.",
  },

  steps: [
    {
      id: "dp-brief", kind: "select", target: "jsa-board",
      title: "Take the differential-pressure brief at the JSA board",
      cue: "At the board with the supervisor and the plant operator: the intake and every pipe that draws from this water, what locks each one out, who holds the key, and the rule — nothing near the grate until the streamer hangs slack.",
      why: "The intake is the hazard nobody sees: water moving through a grate looks like still water from a metre away and holds a diver against the bars with a force no tender can match. 29 CFR 1910.421 has the dive planned around the hazardous activities nearby, and this brief is where the plant's drawings meet the dive team's plan — every pipe, every pump, every way one could start — before anyone dresses.",
    },
    {
      id: "identify-intakes", kind: "find", noHint: true,
      targets: ["unmarked-pipe", "bypass-open"],
      itemNames: { "unmarked-pipe": "second intake pipe not on the plant's drawing", "bypass-open": "bypass valve to the intake left open" },
      itemNotes: {
        "unmarked-pipe": "A second pipe enters the water beside the main intake and it is not on the drawing the operator brought. Whatever it feeds can draw on the same grate the diver will work at.",
        "bypass-open": "The bypass valve on the intake line is standing open. With the main pump locked, a bypass can still let another pump or a gravity line draw through the grate.",
      },
      title: "Walk the intake and find every way water can move through the grate",
      cue: "Walk the apron and the pump house with the drawing: every pipe entering the water, every valve on the intake line, every pump that can draw from it — and everything the drawing does not show.",
      why: "A lockout only isolates what the team knows about, and the drawing is what the plant remembers, not what is there. The pipe that is not on it and the valve someone left open are the two ways a grate stays live after the pump is locked, and they are found by walking the line with eyes on the pipes rather than by trusting the paper. Every source found is a source the lockout can include.",
    },
    {
      id: "lockout", kind: "sequence",
      targets: ["pump-disconnect", "team-lock", "try-start"],
      itemNames: { "pump-disconnect": "intake pump's disconnect opened", "team-lock": "dive team's lock and tag on the disconnect", "try-start": "start tried at the pump's control with the lock on — nothing" },
      title: "Open the disconnect, lock and tag it, then try the start",
      cue: "With the operator: open the pump's disconnect, hang the dive team's lock and tag on it with the supervisor's key, then try the start at the pump's control and watch nothing happen.",
      why: "29 CFR 1910.147 has the energy isolated, locked by the people exposed to it and proven by trying to start it, in that order, and the dive team's lock goes on beside the plant's because the plant's lock protects the plant. The try-start is the proof: a disconnect that looks open, a control that still spins the pump, a bypass that feeds another pump — the try finds them while the diver is still on deck.",
      outOfOrderNote: "Out of order — open the disconnect, hang the team's lock and tag, then try the start; the try proves the lock, so it comes last.",
    },
    {
      id: "verify-no-flow", kind: "hold", target: "flow-streamer", seconds: 5,
      title: "Watch the streamer hang slack at the grate",
      cue: "The diver lowers the streamer on its pole to the grate from the stage. Watch it on the video: it hangs straight down and does not pull toward the bars for the whole watch.",
      why: "The lock and the try-start prove the pump; the streamer proves the water. A ribbon at the grate that pulls toward the bars means something is still drawing — a bypass, a gravity line, the pipe nobody drew — and it is watched long enough to be sure because flow through a big intake can start slowly. Only a streamer that hangs slack for the whole watch lets the supervisor clear the diver toward the grate.",
      holdBreakNote: "You looked away from the streamer — the watch is the proof. Eyes on the video until it has hung slack for the whole watch.",
    },
    {
      id: "hpu-set", kind: "turn", target: "hpu-flow",
      title: "Set the power unit to the tool's manual",
      cue: "At the hydraulic power unit, set the flow and the relief to the values on the grinder's manual card, engine idling, tool circuit not yet live.",
      why: "A diver-operated hydraulic tool is built for one flow and one pressure, and the power unit is set to them from the tool's own manual rather than left where the last job put it; too much flow overspeeds the grinder and bursts the wheel in the diver's hands, too little stalls it against the work. The setting is made and read back to the supervisor with the tool circuit still dead, because the tool goes live on the diver's call and not before.",
      turn: { turns: 1.2, label: "HPU — FLOW", readout: (t) => (t < 0.35 ? "below the manual" : t < 0.85 ? "at the tool's manual" : "above the manual — overspeed") },
    },
    {
      id: "hose-check", kind: "select", target: "hose-couplings",
      title: "Check the hoses and couplings before the tool goes down",
      cue: "Walk both hydraulic hoses from the manifold to the tool: jackets whole, couplings seated and pinned, the return hose clear of kinks, and the whip check on the coupling pair.",
      why: "Hydraulic hoses carry their pressure at the coupling and the jacket, and a coupling that is not pinned comes apart under the first load with the diver holding the tool; the whip check is what stops a parted hose flailing. The check is made on deck with the circuit dead, because a leak found underwater is a diver in oil and a tool that has to come up, and a pinhole is found by cardboard, never by hand.",
    },
    {
      id: "tool-handover", kind: "drag", target: "hydraulic-grinder",
      title: "Hand the grinder down the tool line — cold",
      cue: "With the power unit stopped and the tool circuit dead, clip the grinder to the tool line and lower it to the diver at the stage, then wait for their call before the circuit goes live.",
      why: "29 CFR 1910.422 has a power tool supplied from the surface de-energised before it goes into the water and before it comes out, because a live tool on a line is a tool that can start on a snagged trigger beside the diver. The grinder goes down cold on its own line, not on the umbilical, and the tender waits for the diver's 'tool in hand — power on' before the circuit is opened at the manifold.",
      drag: { to: "tool-line-hook", radius: 0.5, missNote: "Not on the tool line — the grinder goes down clipped to the tool line, cold, never on the umbilical." },
    },
    {
      id: "hose-tend", kind: "track", target: "hose-tend", seconds: 6,
      title: "Tend the hydraulic hoses clear of the umbilical",
      cue: "Pay the hose pair out over the roller beside the umbilical tender as the diver works, keeping the hoses on their own side — not fouling the umbilical, not pulling on the tool.",
      why: "The hoses are a second set of lines to the diver and they are tended like the first: enough slack that the tool moves with the diver, never enough that a bight of hose lies across the umbilical on the bottom. Hydraulic hoses under pressure are stiff and heavy, and a twist in them pulls the tool in the diver's hands; the tool tender feels the diver's work through the hoses the way the umbilical tender feels it through the line.",
      track: { start: 0.14, green: [0.42, 0.62], rise: 0.56, fall: 0.46, drift: 0.12, label: "HOSES", readout: (v) => (v < 0.42 ? "pulling on the tool" : v > 0.62 ? "hose across the umbilical" : "clear and in step") },
      holdBreakNote: "The hoses went out of band — pulling on the tool or across the umbilical. Back in step, on their own side.",
    },
    {
      id: "read-return", kind: "gauge", target: "return-flow",
      title: "Read the return flow against the tool's manual",
      cue: "Watch the return-line indicator at the manifold as the diver works and commit when it sits in the band the manual gives for the grinder under load.",
      why: "The return flow is the surface's window on the tool: in the manual's band the grinder is turning as designed; low, the tool is stalled against the work or a hose is kinked; high, a coupling has parted underwater and the circuit is pumping oil into the Bay beside the diver. The tender reads it against the manual and not against a feeling, and calls anything outside the band to the supervisor before the diver notices.",
      gauge: { label: "RETURN vs MANUAL", speed: 0.66, green: [0.44, 0.62], readout: (t) => (t < 0.44 ? "low — stalled or kinked" : t <= 0.62 ? "in the manual's band" : "high — coupling parted?"), missNote: "Outside the band — read the return indicator against the manual's band for the tool under load." },
    },
    {
      id: "tool-recovery", kind: "select", target: "recover-call",
      title: "Recover the tool dead on the line",
      cue: "The diver calls the job done. Close the tool circuit at the manifold, hear the diver confirm 'tool dead', then haul the grinder up the tool line with the hoses taken in beside it.",
      why: "The tool comes out of the water the way it went in: de-energised first, confirmed by the diver, then hauled — because a grinder coming up a line with its circuit live is a wheel that can spin at the rail beside the tender's hands. The hoses come in with it so nothing is left in the water for the diver's ascent to foul, and the tool is laid on the deck with the circuit still closed.",
    },
    {
      id: "lift-lock", kind: "select", target: "lock-box",
      title: "Lift the lock on the supervisor's count only",
      cue: "The diver is out and on the stage, the standby is dressed down, the supervisor counts every person clear of the water and says so — then, and only then, the supervisor's key takes the team's lock off the disconnect and the operator is told.",
      why: "The lock comes off last and on a count, because the plant wants its pump the moment the tool is up and a diver at the ladder is still in the water. 29 CFR 1910.147 has the lock removed by the person who applied it after the area is checked; here that is the dive supervisor, on a count of every diver and every line out of the water, and the operator hears 'you have your pump' only from them.",
    },
    {
      id: "intake-log", kind: "select", target: "intake-log",
      title: "Write the lockout record and the dive log",
      cue: "At the log: the sources found — the unmarked pipe and the bypass — the disconnect, the lock and the try, the streamer watch, the power unit setting, the weeping coupling and the plant's request for the pump, and the count before the lock was lifted.",
      why: "The record is what the next dive at this intake starts from: the pipe the drawing did not show is on it now, the bypass is on it, and so is the moment the plant asked for the pump back with a diver in the water. 29 CFR 1910.440 keeps the dive's record; the lockout record sits with it, and the coupling that wept goes on the equipment log for the technician.",
    },
    {
      id: "crew-checkin", kind: "select", target: "team-board",
      title: "Check in with the dive team and the operator",
      cue: "At the team board with the operator: the drawing to be corrected, the bypass, the coupling for the shop, the pump request and how it was handled, and how everyone is.",
      why: "A plant that asked for its pump with a diver near the grate is the most important thing that happened today, and it is said out loud with the operator there so the next request goes to the supervisor before it goes to anyone else. The drawing gets its missing pipe, the shop gets the coupling, and the Pile Drivers member assistance line is there for what the deck conversation does not settle.",
    },
  ],

  interrupts: [
    {
      id: "pump-request",
      kind: "Plant operator asking for the pump back",
      after: "verify-no-flow", delay: 2, seconds: 14,
      alert: "The plant operator is at the pump house on the radio to their control room — the plant needs the intake pump running now and they are asking you to lift the lock.",
      cue: "Call the dive supervisor on the radio and put the operator to them — the lock stays on until the supervisor's count.",
      target: "supervisor-radio",
      why: "A tender does not negotiate a lock: the lock is the diver's life and it comes off on the dive supervisor's count of every person clear of the water, whatever the plant needs. The operator is not refused and not argued with; they are put to the supervisor, who holds the key and the plan, and who decides whether the diver comes up so the plant can have its pump. The tender's hand does not go near the lock box.",
      missNote: "The operator's request went unanswered while the tender kept their eyes on the streamer; the operator called the control room to override the disconnect, and the supervisor found out from the plant rather than from their own tender.",
      wrongNote: "The radio to the supervisor — the operator's request goes to the person who holds the key, not to you.",
    },
    {
      id: "coupling-weep",
      kind: "Hydraulic coupling weeping at the manifold",
      after: "hose-tend", delay: 2, seconds: 14,
      alert: "The pressure coupling at the deck manifold has started weeping oil — a sheen spreading on the deck plate beside your boots.",
      cue: "Stop the power unit, tell the diver 'tool dead — hold', and keep your hands off the coupling until the pressure is gone.",
      target: "hpu-stop",
      why: "A weeping coupling under pressure is a pinhole about to become a jet, and a jet of hydraulic fluid goes through a glove; the power unit is stopped first so the pressure goes out of the line, the diver is told the tool is dead so they are not surprised by a stalled grinder, and only then is the coupling looked at — with cardboard, at arm's length. Oil on the deck goes to the spill kit; oil on the Bay goes to the supervisor.",
      missNote: "The coupling parted with the power unit running; the pressure hose whipped against the rail and oil went into the water beside the diver's umbilical before the tender reached the stop.",
      wrongNote: "The power unit's stop — take the pressure out of the line before anything else.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.6, CDHT_ACCENT);

    // ------------------------------------------------------- apron, water, intake
    const water = box(g, 9.0, 0.02, 6.0, 0, 0.012, -3.8, 0xffffff, { rough: 0.15, metal: 0.4, cast: false });
    water.material = texturedMat(surfaceTexture((cx, w, h) => waterFace(cx, w, h, { base: "#0c2b30", mid: "#11393c" }), { repeat: 3, px: 512 }), { rough: 0.15, metal: 0.4, color: 0x86acb6 });
    const apron = box(g, 7.4, 0.14, 4.6, 0, 0.4, 0.5, 0xffffff, { rough: 0.8 });
    apron.material = texturedMat(surfaceTexture((cx, w, h) => deckPlateFace(cx, w, h, { base: "#484e53", base2: "#3b4147", step: 21 }), { repeat: 4, px: 512 }), { rough: 0.8, metal: 0.35, color: 0xc6ccd2 });
    box(g, 7.4, 0.4, 4.6, 0, 0.16, 0.5, 0x8a8f93, { rough: 0.7, cast: false });
    for (const x of [-3.4, -1.7, 0, 1.7, 3.4]) cyl(g, 0.022, 0.022, 1.0, x, 0.97, -1.75, 0xc8ced4, { rough: 0.35, metal: 0.5, seg: 8 });
    box(g, 7.2, 0.04, 0.04, 0, 1.45, -1.75, 0xc8ced4, { rough: 0.35, metal: 0.5 });
    const stripe = box(g, 2.6, 0.012, 0.25, -1.4, 0.48, -1.3, 0xffffff, { rough: 0.7 });
    stripe.material = texturedMat(surfaceTexture((cx, w, h) => safetyStripeFace(cx, w, h), { repeat: 4, px: 256 }), { rough: 0.7 });
    // Intake pipe, grate, second pipe, bypass.
    const pipeMat = texturedMat(surfaceTexture((cx, w, h) => paintedSteelFace(cx, w, h, { base: "#3a6a8a", base2: "#2c5670" }), { px: 256 }), { rough: 0.6, metal: 0.5 });
    const intake = cyl(g, 0.3, 0.3, 3.0, -1.4, 0.0, -2.6, 0xffffff, { seg: 18 });
    intake.rotation.x = Math.PI / 2;
    intake.material = pipeMat;
    const grate = group(g, -1.4, 0.0, -4.1);
    for (let i = 0; i < 5; i++) box(grate, 0.04, 0.6, 0.04, -0.24 + i * 0.12, 0, 0, 0x5b6771, { rough: 0.5, metal: 0.6 });
    torus(grate, 0.32, 0.03, 0, 0, 0, 0x5b6771, { rough: 0.5, metal: 0.6, seg: 8, seg2: 20 });
    holoTag(grate, "intake grate", 0, 0.6, 0, { css: CDHT_CSS, w: 0.26 });
    const grateHit = box(g, 0.6, 0.6, 0.4, -1.4, 0.1, -3.7, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "clear the weed by hand now?", -1.4, 0.9, -3.4, { css: "#d2312b", w: 0.5 });
    reg(hits, grateHit, "reach-into-grate");
    const pipe2 = cyl(g, 0.18, 0.18, 2.6, -2.6, 0.05, -2.8, 0xffffff, { seg: 14 });
    pipe2.rotation.x = Math.PI / 2;
    pipe2.material = texturedMat(surfaceTexture((cx, w, h) => paintedSteelFace(cx, w, h, { base: "#6a6f73", base2: "#55595d" }), { px: 256 }), { rough: 0.7, metal: 0.5 });
    const pipe2Hit = box(g, 0.5, 0.5, 0.8, -2.6, 0.1, -2.2, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, pipe2Hit, "unmarked-pipe");
    const streamer = group(g, -1.4, 0.7, -3.5);
    cyl(streamer, 0.012, 0.012, 1.4, 0, 0.7, 0, 0xc8ced4, { rough: 0.4, metal: 0.5, seg: 6 });
    const ribbon = box(streamer, 0.04, 0.4, 0.01, 0, -0.2, 0, 0xf06a2b, { rough: 0.7 });
    ribbon.rotation.x = 0.9;
    holoTag(streamer, "flow streamer — watch it hang", 0, 1.6, 0, { css: CDHT_CSS, w: 0.56 });
    reg(hits, streamer, "flow-streamer");

    // ------------------------------------------------------- pump house, disconnect, lock, bypass
    const house = group(g, -2.6, 0.47, 1.6);
    const wall = box(house, 1.8, 2.0, 1.6, 0, 1.0, 0, 0xffffff, { rough: 0.9 });
    wall.material = texturedMat(surfaceTexture((cx, w, h) => blockFace(cx, w, h), { repeat: 2, px: 512 }), { rough: 0.9, color: 0xc9c2b0 });
    box(house, 1.9, 0.1, 1.7, 0, 2.05, 0, 0x5b6771, { rough: 0.6, metal: 0.4 });
    const disconnect = group(house, 0.95, 1.2, -0.3);
    box(disconnect, 0.06, 0.5, 0.35, 0, 0, 0, 0x8a8f93, { rough: 0.5, metal: 0.5 });
    const handle = box(disconnect, 0.04, 0.22, 0.04, 0.05, 0.1, 0, 0xd2312b, { rough: 0.5 });
    handle.rotation.x = 0;
    holoTag(disconnect, "pump disconnect", 0.3, 0.4, 0, { css: CDHT_CSS, w: 0.32 });
    reg(hits, disconnect, "pump-disconnect");
    const lockPoint = group(house, 0.98, 0.95, -0.3);
    const lt = lockTag(lockPoint, 0, 0, 0, {});
    lt.visible = false;
    torus(lockPoint, 0.06, 0.006, 0, 0, 0.02, CDHT_ACCENT, { emissive: CDHT_ACCENT, ei: 1.2, rough: 0.4, cast: false, seg: 6, seg2: 14 });
    holoTag(lockPoint, "team lock · tag", 0.3, 0.1, 0, { css: CDHT_CSS, w: 0.3 });
    reg(hits, lockPoint, "team-lock");
    const control = group(house, 0.95, 1.6, 0.35);
    box(control, 0.06, 0.24, 0.2, 0, 0, 0, 0x2b3138, { rough: 0.5 });
    const startBtn = cyl(control, 0.03, 0.03, 0.02, 0.04, 0.04, 0, 0x2f8f5a, { rough: 0.4, seg: 12 });
    startBtn.rotation.z = Math.PI / 2;
    holoTag(control, "try the start", 0.3, 0.3, 0, { css: CDHT_CSS, w: 0.26 });
    reg(hits, control, "try-start");
    const wordHit = box(g, 0.4, 0.4, 0.4, -1.4, 1.0, 1.2, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "operator says it's off — enough?", -1.4, 1.4, 1.2, { css: "#d2312b", w: 0.56 });
    reg(hits, wordHit, "operators-word");
    const bypass = group(g, -1.4, 0.47, -0.6);
    const bpPipe = cyl(bypass, 0.1, 0.1, 1.2, 0, 0.5, 0, 0xffffff, { seg: 12 });
    bpPipe.rotation.x = Math.PI / 2;
    bpPipe.material = pipeMat;
    const bpWheel = valveWheel(bypass, 0, 0.72, 0, { r: 0.09, color: 0xd2312b, body: 0x2f4f6f });
    bpWheel.rotation.y = 0.8;
    holoTag(bypass, "bypass valve", 0, 1.1, 0, { css: CDHT_CSS, w: 0.26 });
    reg(hits, bypass, "bypass-open");
    const lockBox = group(g, -3.0, 0.47, -0.2);
    box(lockBox, 0.4, 0.3, 0.2, 0, 0.9, 0, 0xd2312b, { rough: 0.5, metal: 0.3 });
    for (let i = 0; i < 4; i++) torus(lockBox, 0.03, 0.006, -0.12 + i * 0.08, 1.08, 0.08, 0xf2c14b, { rough: 0.4, metal: 0.6, seg: 6, seg2: 10 });
    cyl(lockBox, 0.03, 0.03, 0.8, 0, 0.4, 0, 0x5b6771, { rough: 0.5, metal: 0.6, seg: 8 });
    holoTag(lockBox, "lock box — supervisor's key", 0, 1.35, 0, { css: CDHT_CSS, w: 0.5 });
    reg(hits, lockBox, "lock-box");
    const jsa = decal(g, 0.6, 0.4, -2.6, 1.6, 2.5, paperFace("JSA — INTAKE", ["Sources: pump · bypass · ?", "Lock: team's, supervisor's key", "Grate: streamer slack first"], { bg: "#fdf3e6", band: "#c9401a" }), { px: 192 });
    jsa.rotation.y = Math.PI;
    box(g, 0.66, 0.46, 0.04, -2.6, 1.6, 2.53, 0x2b3138, { rough: 0.6 });
    holoTag(g, "JSA board", -2.6, 1.95, 2.4, { css: CDHT_CSS, w: 0.22 });
    reg(hits, jsa, "jsa-board");

    // ------------------------------------------------------- HPU, manifold, hoses, tool, stage
    const hpu = group(g, 2.2, 0.47, 1.6);
    const hpuBody = box(hpu, 1.2, 0.9, 0.8, 0, 0.45, 0, 0xffffff, { rough: 0.5 });
    hpuBody.material = texturedMat(surfaceTexture((cx, w, h) => paintedSteelFace(cx, w, h, { base: "#c9a01a", base2: "#a88414" }), { px: 256 }), { rough: 0.5, metal: 0.4 });
    box(hpu, 1.1, 0.1, 0.7, 0, 0.95, 0, 0x2b3138, { rough: 0.6, metal: 0.5 });
    cyl(hpu, 0.05, 0.05, 0.4, 0.4, 1.2, -0.2, 0x1b1e22, { rough: 0.5, metal: 0.6, seg: 10 });
    const hpuFlow = valveWheel(hpu, -0.35, 0.7, 0.42, { r: 0.06, color: 0x1b1e22, body: 0x3a4148 });
    hpuFlow.rotation.x = Math.PI / 2;
    hpuFlow.scale.set(0.8, 0.8, 0.8);
    holoTag(hpu, "HPU — flow · relief", -0.35, 1.3, 0.4, { css: CDHT_CSS, w: 0.4 });
    reg(hits, hpuFlow, "hpu-flow");
    const hpuStop = group(hpu, 0.3, 0.75, 0.42);
    cyl(hpuStop, 0.05, 0.05, 0.04, 0, 0, 0, 0xd2312b, { rough: 0.4, seg: 14 }).rotation.x = Math.PI / 2;
    box(hpuStop, 0.14, 0.14, 0.02, 0, 0, -0.02, 0xf2c14b, { rough: 0.5 });
    holoTag(hpuStop, "HPU stop", 0, 0.2, 0.05, { css: CDHT_CSS, w: 0.2 });
    reg(hits, hpuStop, "hpu-stop");
    const hpuLamp = ball(hpu, 0.03, 0.5, 1.02, 0.3, 0x59c97b, { emissive: 0x59c97b, ei: 0.8, rough: 0.3, seg: 6, seg2: 4 });
    const manifold = group(g, 0.9, 0.47, 0.6);
    box(manifold, 0.5, 0.3, 0.3, 0, 0.5, 0, 0x2b3138, { rough: 0.6, metal: 0.5 });
    for (const x of [-0.15, 0.15]) { const c = cyl(manifold, 0.04, 0.04, 0.1, x, 0.5, 0.2, 0x8a949d, { rough: 0.35, metal: 0.8, seg: 10 }); c.rotation.x = Math.PI / 2; }
    holoTag(manifold, "manifold · couplings · whip check", 0, 0.95, 0, { css: CDHT_CSS, w: 0.56 });
    reg(hits, manifold, "hose-couplings");
    const returnInd = group(manifold, 0.35, 0.6, 0.1);
    box(returnInd, 0.12, 0.2, 0.04, 0, 0, 0, 0x1b1e22, { rough: 0.5 });
    const retNeedle = box(returnInd, 0.03, 0.01, 0.01, 0, -0.06, 0.025, 0xd2312b, { rough: 0.4 });
    holoTag(returnInd, "return flow", 0.2, 0.2, 0, { css: CDHT_CSS, w: 0.22 });
    reg(hits, returnInd, "return-flow");
    const weep = ball(manifold, 0.08, -0.15, 0.32, 0.3, 0x2b2a1a, { rough: 0.1, metal: 0.3, opacity: 0.7, transparent: true, cast: false, seg: 8, seg2: 6 });
    weep.scale.set(1.6, 0.15, 1.6);
    weep.visible = false;
    const leakHit = box(g, 0.3, 0.3, 0.3, 0.3, 0.95, 0.8, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "feel for the pinhole?", 0.3, 1.25, 0.8, { css: "#d2312b", w: 0.4 });
    reg(hits, leakHit, "hand-on-leak");
    hose(g, [[1.65, 0.95, 1.6], [1.2, 0.7, 1.0], [1.05, 0.97, 0.8]], 0.02, 0x1b1e22, { steps: 8, rough: 0.8 });
    hose(g, [[1.65, 0.9, 1.7], [1.25, 0.65, 1.1], [1.15, 0.97, 0.8]], 0.02, 0x2f4f6f, { steps: 8, rough: 0.8 });
    const hosePair = hose(g, [[0.9, 0.97, 0.45], [0.8, 0.7, -0.4], [0.9, 0.7, -1.2], [1.2, 1.42, -1.75]], 0.02, 0x1b1e22, { steps: 12, rough: 0.8 });
    void hosePair;
    const hoseTend = group(g, 1.2, 1.47, -1.75);
    const rollerBody = cyl(hoseTend, 0.07, 0.07, 0.4, 0, 0, 0, 0x2b3138, { rough: 0.5, metal: 0.4, seg: 14 });
    rollerBody.rotation.z = Math.PI / 2;
    for (const x of [-0.22, 0.22]) box(hoseTend, 0.03, 0.2, 0.1, x, 0, 0, 0x5b6771, { rough: 0.5, metal: 0.6 });
    holoTag(hoseTend, "hose roller — tend clear", 0, 0.28, 0, { css: CDHT_CSS, w: 0.46 });
    reg(hits, hoseTend, "hose-tend");
    const grinder = group(g, 0.2, 0.62, 1.2);
    box(grinder, 0.14, 0.12, 0.34, 0, 0, 0, 0xc9a01a, { rough: 0.5, metal: 0.3 });
    const wheel = cyl(grinder, 0.11, 0.11, 0.02, 0, -0.02, 0.22, 0x5b6771, { rough: 0.5, metal: 0.6, seg: 18 });
    wheel.rotation.x = Math.PI / 2;
    box(grinder, 0.04, 0.04, 0.16, 0.12, 0.02, -0.05, 0x1b1e22, { rough: 0.6 });
    holoTag(grinder, "hydraulic grinder", 0, 0.28, 0, { css: CDHT_CSS, w: 0.34 });
    reg(hits, grinder, "hydraulic-grinder");
    const liveHit = box(g, 0.3, 0.3, 0.3, 0.7, 0.95, 1.2, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "pass it down with the HPU running?", 0.7, 1.25, 1.2, { css: "#d2312b", w: 0.6 });
    reg(hits, liveHit, "tool-live-handover");
    const toolLine = group(g, 2.0, 1.4, -1.6);
    cyl(toolLine, 0.008, 0.008, 1.6, 0, 0.6, 0, 0xf2c14b, { rough: 0.8, seg: 6 });
    torus(toolLine, 0.05, 0.01, 0, -0.2, 0, 0xc0c6cc, { rough: 0.3, metal: 0.8, seg: 6, seg2: 14 });
    torus(toolLine, 0.14, 0.008, 0, -0.2, 0, CDHT_ACCENT, { emissive: CDHT_ACCENT, ei: 1.4, rough: 0.4, cast: false, seg: 6, seg2: 20 });
    holoTag(toolLine, "tool line — hook", 0.3, 0.1, 0, { css: CDHT_CSS, w: 0.3 });
    reg(hits, toolLine, "tool-line-hook");
    const stage = divingStage(g, 2.6, 0.5, -2.7, { colour: 0xe8b02e });
    const diver = group(stage, 0, 0.09, 0);
    standingFigure(diver, 0, 0, { atStation: true, ry: Math.PI, cloth: 0x1b1e22, trousers: 0x1b1e22, gloves: 0x2b2b2b });
    ball(diver, 0.2, 0, 1.63, 0, 0xf2c14b, { rough: 0.35, metal: 0.4, seg: 16, seg2: 12 });
    holoTag(stage, "stage — diver", 0, 2.85, 0, { css: CDHT_CSS, w: 0.3 });
    cyl(g, 0.06, 0.06, 3.2, 3.4, 2.05, -1.6, 0x5b6771, { rough: 0.5, metal: 0.6, seg: 10 });
    const arm = box(g, 1.2, 0.08, 0.08, 3.0, 3.6, -2.2, 0x5b6771, { rough: 0.5, metal: 0.6 });
    arm.rotation.y = 0.9;
    const recover = group(g, 1.6, 1.2, -1.3);
    torus(recover, 0.1, 0.008, 0, 0, 0, CDHT_ACCENT, { emissive: CDHT_ACCENT, ei: 1.2, rough: 0.4, cast: false, seg: 6, seg2: 16 });
    holoTag(recover, "circuit closed — 'tool dead' — haul", 0, 0.18, 0, { css: CDHT_CSS, w: 0.6 });
    reg(hits, recover, "recover-call");
    const umbilical = hose(g, [[-0.4, 0.9, 2.0], [0.3, 0.7, 0.2], [1.6, 0.7, -1.0], [2.4, 1.5, -1.8], [2.6, 1.2, -2.6]], 0.025, 0xf2c14b, { steps: 16, rough: 0.8 });
    void umbilical;

    // ------------------------------------------------------- crew, radio, log, board
    const supervisor = standingFigure(g, -0.6, 2.6, { ry: Math.PI, cloth: 0x2b3138, vest: 0xf06a2b, cap: 0x1f3a52 });
    supervisor.position.y = 0.47;
    holoTag(supervisor, "supervisor — holds the key", 0, 1.95, 0, { css: CDHT_CSS, w: 0.46 });
    const standby = standingFigure(g, 3.2, 0.4, { ry: -2.4, cloth: 0x1b1e22, trousers: 0x1b1e22, vest: 0xf06a2b, gloves: 0x2b2b2b });
    standby.position.y = 0.47;
    holoTag(standby, "standby diver", 0, 2.05, 0, { css: CDHT_CSS, w: 0.28 });
    const operator = standingFigure(g, -1.8, 2.7, { ry: 0.2, cloth: 0x3a4148, vest: 0xf2c14b, cap: 0xf4f8fb });
    operator.position.y = 0.47;
    holoTag(operator, "plant operator", 0, 1.95, 0, { css: CDHT_CSS, w: 0.3 });
    const operatorHome = operator.position.clone();
    const radio = group(g, 0.4, 1.15, 2.4);
    box(radio, 0.06, 0.16, 0.04, 0, 0, 0, 0x1b1d20, { rough: 0.7 });
    cyl(radio, 0.006, 0.006, 0.1, 0.02, 0.12, 0, 0x1b1d20, { rough: 0.7, seg: 6 });
    cyl(g, 0.03, 0.03, 0.6, 0.4, 0.77, 2.4, 0x5b6771, { rough: 0.5, metal: 0.6, seg: 8 });
    holoTag(radio, "radio — supervisor", 0, 0.28, 0, { css: CDHT_CSS, w: 0.36 });
    reg(hits, radio, "supervisor-radio");
    const table = group(g, 1.6, 0.47, 2.5);
    box(table, 0.8, 0.06, 0.5, 0, 0.8, 0, 0x5b4a3a, { rough: 0.8 });
    for (const [lx, lz] of [[-0.35, -0.2], [0.35, -0.2], [-0.35, 0.2], [0.35, 0.2]]) cyl(table, 0.022, 0.022, 0.8, lx, 0.4, lz, 0x3a4148, { rough: 0.6, metal: 0.4, seg: 6 });
    const log = decal(table, 0.34, 0.24, 0, 0.84, 0, paperFace("LOCKOUT · DIVE LOG", ["Sources ____", "Lock · try · streamer ____", "HPU · coupling · count ____"], { bg: "#f3efe4", band: CDHT_CSS }), { px: 160 });
    log.rotation.x = -Math.PI / 2;
    holoTag(table, "lockout record · dive log", 0, 1.1, 0, { css: CDHT_CSS, w: 0.46 });
    reg(hits, log, "intake-log");
    const team = decal(g, 0.6, 0.4, 3.0, 1.35, 2.75, (cx, w, h) => {
      cx.fillStyle = "#101c27"; cx.fillRect(0, 0, w, h); cx.fillStyle = "#59c97b"; cx.fillRect(0, 0, w, 6);
      cx.font = `600 ${Math.round(h * 0.15)}px 'Barlow Condensed', Arial, sans-serif`; cx.textAlign = "left"; cx.textBaseline = "middle";
      cx.fillStyle = "#e6f6ea"; cx.fillText("INTAKE DIVE TEAM", w * 0.06, h * 0.22);
      cx.font = `${Math.round(h * 0.11)}px Arial, sans-serif`; cx.fillStyle = "#f4f8fb";
      ["Supervisor · Diver · Standby", "Tool tender · Operator", "Lock: off on the count"].forEach((l, i) => cx.fillText(l, w * 0.06, h * (0.46 + i * 0.18)));
    }, { px: 256, glow: true, ei: 0.6 });
    team.rotation.y = Math.PI;
    box(g, 0.66, 0.46, 0.04, 3.0, 1.35, 2.78, 0x2b3138, { rough: 0.6 });
    reg(hits, team, "team-board");
    for (const x of [-3.4, 3.4]) { cyl(g, 0.1, 0.12, 0.45, x, 0.7, 2.8, 0x2b3138, { rough: 0.5, metal: 0.5, seg: 12 }); ball(g, 0.12, x, 0.95, 2.8, 0x2b3138, { rough: 0.5, metal: 0.5, seg: 10, seg2: 8 }); }
    for (let i = 0; i < 5; i++) box(g, 0.5, 0.08, 0.14, -0.6 + i * 0.16, 0.5, 0.4, 0xe8b02e, { rough: 0.7 });
    for (const x of [-3.0, 0.0, 3.0]) cyl(g, 0.12, 0.12, 0.5, x, 0.7, -1.92, 0x1f5fb8, { seg: 10, rough: 0.6 });
    box(g, 0.5, 0.4, 0.4, 0.2, 0.67, 2.7, 0xf2c14b, { rough: 0.6 });
    box(g, 0.44, 0.06, 0.34, 0.2, 0.9, 2.7, 0x1b1e22, { rough: 0.6 });

    const waterTex = water.material.map;

    return {
      hits,
      spawnLook: new THREE.Vector3(-0.4, 1.0, -0.4),
      onStep() {},
      onStepComplete(step) {
        if (step.id === "identify-intakes") { bpWheel.rotation.y = 0; pipe2.material = mat(0xe0844a, { rough: 0.6 }); }
        if (step.id === "lockout") { handle.rotation.x = 1.4; lt.visible = true; startBtn.material = mat(0x5b6771, { rough: 0.4 }); }
        if (step.id === "verify-no-flow") ribbon.rotation.x = 0;
        if (step.id === "hose-check") manifold.children[1].material = mat(0x59c97b, { rough: 0.35, metal: 0.6 });
        if (step.id === "tool-handover") { grinder.position.set(2.0, 0.9, -1.6); hpuLamp.material = mat(0xd2312b, { emissive: 0xd2312b, ei: 0.9 }); }
        if (step.id === "read-return") retNeedle.material = mat(0x59c97b, { rough: 0.4 });
        if (step.id === "tool-recovery") { grinder.position.set(1.4, 0.62, -1.2); hpuLamp.material = mat(0x59c97b, { emissive: 0x59c97b, ei: 0.8 }); }
        if (step.id === "lift-lock") { lt.visible = false; handle.rotation.x = 0; operator.position.set(-2.0, 0.47, 0.9); }
        if (step.id === "intake-log") repaint(log, paperFace("LOCKOUT · DIVE LOG", ["Pipe not on drawing · bypass", "Lock · try · streamer slack", "Coupling wept · pump asked"], { bg: "#e6f6ea", band: "#59c97b" }));
      },
      onHazard() {},
      onInterrupt(it) {
        if (it.id === "pump-request") operator.position.set(-1.6, 0.47, 1.4);
        if (it.id === "coupling-weep") { weep.visible = true; hpuLamp.material = mat(0xf2c14b, { emissive: 0xf2c14b, ei: 1.0 }); }
      },
      onInterruptEnd(it) {
        if (it.id === "pump-request" && it.resolved === "answered") operator.position.copy(operatorHome);
        if (it.id === "coupling-weep" && it.resolved === "answered") { hpuLamp.material = mat(0x1b1e22, { rough: 0.4 }); weep.scale.set(1.6, 0.1, 1.6); }
      },
      animate(t, dt, session) {
        const step = session?.step;
        if (waterTex?.offset) { waterTex.offset.x = t * 0.004; waterTex.offset.y = t * 0.005; }
        if (session?.turn && step?.id === "hpu-set") hpuFlow.userData.wheel.rotation.y = session.turn.amount * Math.PI * 2;
        const gg = session?.gauge;
        if (gg && !gg.committed && step?.id === "read-return") retNeedle.position.y = -0.08 + gg.t * 0.16;
        if (step?.id === "hose-tend" && session.holding) rollerBody.rotation.x += (dt ?? 0.016) * 2 * (session.track?.v ?? 0);
        if (step?.id === "verify-no-flow" && session.holding) ribbon.rotation.x = Math.sin(t * 2) * 0.08;
        if (weep.visible) weep.scale.x = weep.scale.z = Math.min(2.6, weep.scale.x + (dt ?? 0.016) * 0.3);
        void stripe;
      },
    };
  },
};
