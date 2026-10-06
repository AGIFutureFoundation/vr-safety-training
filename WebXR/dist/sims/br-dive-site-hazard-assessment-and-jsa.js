import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import { box, cyl, ball, torus, hose, group, decal, repaint, signFace, paperFace, mat } from "../../../shared/kit.js";
import {
  CITY, stationPad, holoTag, instrument, standingFigure, reg,
  surfaceTexture, texturedMat, deckPlateFace, waterFace,
} from "../citykit.js";
import { workboat } from "../../../shared/fleet.js";
import { radio } from "../../../shared/toolkit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Dive Site Hazard Assessment & JSA VR — SF Bay Restoration &
// Cleanup, maritime and underwater, pack A (underwater work and dive safety).
//
// The aft working deck of a dive support workboat moored off a restoration
// site on the Bay, before anyone dresses: the JSA board, a stormwater outfall
// with a pump-station intake on the seawall, a pile-driving barge working the
// next berth, an oily sheen drifting off the outfall with a discharge notice
// on the headwall, the current meter on the rail, the decon wash, the helm
// and its key, the dive flag, the oxygen kit, the downline winch and its
// clump weight, and the crew boat (the fleet kit's workboat) lying alongside
// with its outboards down. The learner is the dive supervisor, a Pile Drivers
// Local 34 commercial diver, running the job safety analysis with the tender,
// the standby diver and the Inlandboatmen's Union deckhand. Every figure on
// deck wears a PFD. Depth, gas, bottom time and decompression are never
// written as numbers: they are per the dive plan and the tables the
// supervisor holds.

const BRDH_ACCENT = 0xe8a33d;
const BRDH_CSS = "#e8a33d";

/** A JSA-style paper face with a signature block. */
function brdhSheet(title, rows, band, bg = "#f3efe4") {
  return paperFace(title, rows, { bg, band, worn: true });
}

export const SIM_BR_DIVE_SITE_HAZARD_ASSESSMENT_AND_JSA = {
  id: "br-dive-site-hazard-assessment-and-jsa",
  index: "318",
  domain: "Maritime & Ports",
  trade: "Pile Drivers Local 34 commercial diver as dive supervisor, running the site hazard assessment and job safety analysis for a Bay restoration dive with the tender, the standby diver and an Inlandboatmen's Union deckhand",
  category: "Maritime & Ports",
  district: "Maritime & Ports",
  weather: "overcast",
  certification: "Pile Drivers Local 34 commercial diver training under the UBC International Training Fund; OSHA 29 CFR 1910 Subpart T commercial diving operations — 29 CFR 1910.421 pre-dive procedures (planning and assessment, hazardous activities nearby, the emergency aid list, the team briefing and the warning signal), 29 CFR 1910.420 the employer's safe practices manual and 29 CFR 1910.410 the qualified dive team; ADCI International Consensus Standards for Commercial Diving and Underwater Operations; USCG 46 CFR 197 Subpart B where the dive is worked from a vessel; depth, gas, bottom time and decompression per the dive plan and the tables the supervisor holds",
  name: "Dive Site Hazard Assessment & JSA",
  title: simTitle("Dive Site Hazard Assessment & JSA"),
  tagline: "Before anyone dresses: the JSA opened with the whole team, the outfall intake and the pile hammer found, the current read against the plan, the sheen and the discharge notice seen, the pump station locked out on the radio while the hammer starts up next door, the decon set, the boat's key pulled, the flag up, the oxygen at the ladder, the downline lowered while a kayak paddles into the site, the emergency list confirmed, the read-backs heard and the JSA signed and logged — every step in a PFD",
  accent: BRDH_ACCENT,
  accentCss: BRDH_CSS,
  parSeconds: 300,
  footprint: 2.6,
  badge: { id: "site-read-first", name: "Site Read First", note: "Every hazard on the site named, controlled and signed for before a diver was dressed, and never a PFD off on deck" },

  supportLine: "your union hall's member assistance programme — Pile Drivers Local 34 or the Inlandboatmen's Union — with the employer's employee assistance line behind it",

  game: system({
    name: "Site Assessment",
    currency: "SOUNDING",
    ranks: ["Tender", "Diver", "Lead Diver", "Dive Supervisor", "Site Assessment Certified"],
    badges: [
      { id: "jsa-opened", name: "JSA Opened", note: "The analysis opened with the whole team before anything else", test: AWARD.stepClean("open-jsa") },
      { id: "current-read-true", name: "Current Read True", note: "The current committed inside the plan's band first time", test: AWARD.precise(0.7) },
      { id: "nothing-assumed", name: "Nothing Assumed", note: "No copied JSA, no diver before the lockout, no bare hand in the sheen, no PFD off", test: AWARD.safe },
    ],
    challenges: [
      { id: "clean-assessment", name: "Clean Assessment", note: "No corrections from the JSA board to the check-in", test: AWARD.clean },
      { id: "downline-steady", name: "Downline Steady", note: "The clump weight lowered in band the whole way down", test: AWARD.unbroken },
      { id: "signed-in-time", name: "Signed In Time", note: "JSA logged inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "old-jsa-copy": "You reached for last week's JSA from the job on the other pier to save writing a new one. A job safety analysis is only worth the site it was written for: last week had no outfall, no pile hammer next door and a different current, and a copied analysis tells the team the hazards are handled when nobody has looked at these ones. The employer's safe practices manual and 29 CFR 1910.421 want this dive planned for these conditions.",
    "intake-before-lockout": "You went to call the diver down beside the seawall before the pump station had confirmed its lockout. An intake drawing water makes a pressure difference across its opening that can pin a diver or pull an arm or an umbilical into the grate with a force no diver can swim against, and the pumps start on a float switch or a remote call with nobody on the seawall knowing a diver is there. Nobody goes near an intake until it is isolated, locked and tagged, and confirmed back to the supervisor.",
    "bare-hand-sheen": "You leaned out to scoop the floating debris out of the sheen bare-handed. The sheen is petroleum and whatever the outfall carried after the rain, and the water beside a stormwater outfall on the Bay carries bacteria and old contamination as well; skin contact is exposure, and a cut from the debris inside it is an infection. It goes into the JSA as a hazard with a control — gloves, a boat hook and the decon wash — not into your hand.",
    "pfd-off": "You unclipped your PFD to lean further over the rail and see the outfall. The deck of a workboat is a fall into cold, moving water with a current running, in boots and work clothes, and the PFD is what keeps you on the surface long enough for the vessel's man-overboard drill to reach you. It is worn on deck for every minute of the job, and nobody leans past the rail to look at anything.",
  },

  lateNotes: {
    "pump-radio": "The pump-station lockout is called in once the site walk has found the intake and the water has been read — confirm what you are isolating first.",
    "downline-winch": "The downline goes down once the oxygen is at the ladder and the flag is up — mark the site after the station is ready for it.",
    "jsa-log": "The JSA is signed and logged once the tender and the standby have read back their controls.",
  },

  steps: [
    {
      id: "open-jsa", kind: "select", target: "jsa-board",
      title: "Open the JSA at the board with the whole team",
      cue: "At the JSA board, in your PFD, with the tender, the standby diver and the deckhand: today's task, the job steps in order, and a blank hazard column for this site — nothing carried over from last week.",
      why: "A job safety analysis breaks the dive into its steps and asks, for each one, what can hurt someone here and what control stops it. It is opened with the whole team because the deckhand knows the boat, the tender knows the umbilical path and the standby knows what they would have to reach; 29 CFR 1910.421 has the dive planned against the surface and underwater conditions of this site, and the JSA is where those conditions are written down before anyone dresses.",
    },
    {
      id: "site-walk", kind: "find", noHint: true,
      targets: ["outfall-intake", "pile-hammer"],
      itemNames: { "outfall-intake": "pump-station intake grate on the seawall beside the outfall", "pile-hammer": "pile-driving barge with its hammer rigged on the next berth" },
      itemNotes: {
        "outfall-intake": "Beside the stormwater outfall the seawall carries a pump-station intake behind a steel grate. When the pumps run, the water rushing into it makes a pressure difference across the grate that can hold a diver against it — the single most lethal thing on this site if it is not isolated.",
        "pile-hammer": "The contractor on the next berth has a hammer hung in the leads over a pile. Pile driving sends a pressure pulse through the water that a diver in a helmet feels as a blow, and it shakes loose whatever is lodged on the bottom nearby.",
      },
      title: "Walk the site for what could hurt a diver here",
      cue: "From the rail — PFD on, not leaning over — look along the seawall and across the berths: intakes, outfalls, other work in the water, anything overhead.",
      why: "The underwater hazards a diver dies of are mostly invisible from the bottom and obvious from the deck: the intake that runs on a float switch, the other contractor's hammer, the crane swinging over the water. 29 CFR 1910.421 has the supervisor assess the hazardous activities in the vicinity before the dive, because the only time they can be coordinated or isolated is before a diver is in the water beside them.",
    },
    {
      id: "read-current", kind: "gauge", target: "current-meter",
      title: "Read the current against the dive plan's limit",
      cue: "Watch the current meter on the rail settle and commit the reading against the limit the dive plan sets for surface-supplied work at this site.",
      why: "Current decides whether a surface-supplied dive can be worked at all: it bellies the umbilical, drags the diver off the work and turns every task into a fight the supply was not set for. The dive plan sets the limit for this site and this mode, and it is read on an instrument at the site rather than from the tide book, because the Bay's current round a seawall and an outfall is not the current in the channel.",
      gauge: { label: "CURRENT vs PLAN", speed: 0.66, green: [0.38, 0.56], readout: (t) => (t < 0.38 ? "slack — reading unsettled" : t <= 0.56 ? "inside the dive plan's limit" : "past the plan's limit — no dive"), missNote: "Outside the band — let the meter settle and commit the reading against the limit the dive plan gives for this site." },
    },
    {
      id: "water-hazards", kind: "find", noHint: true,
      targets: ["sheen", "discharge-notice"],
      itemNames: { "sheen": "oily sheen drifting off the outfall", "discharge-notice": "notice on the headwall that the outfall discharges after rain" },
      itemNotes: {
        "sheen": "A rainbow sheen is spreading off the outfall's mouth on the ebb — petroleum washed off the streets by last night's rain, and a sign the outfall is running now, not just after storms.",
        "discharge-notice": "The notice on the headwall says the outfall discharges untreated stormwater during and after rain. Whatever it carries is in the water the diver works in and on every piece of gear that comes back aboard.",
      },
      title: "Read the water for contamination",
      cue: "Look at the water round the outfall and the notices on the headwall: sheen, discoloration, anything the outfall is carrying today.",
      why: "Contaminated water changes the dive: it decides whether the diver needs a helmet sealed to a vulcanised drysuit instead of a mask and wetsuit, whether there is a decon wash at the ladder, and how the tender handles the umbilical when it comes up. Restoration sites on the Bay sit beside outfalls and old industrial shorelines, so the water is read on the day, because after rain it is not the water the plan was written for.",
    },
    {
      id: "pump-lockout", kind: "hold", target: "pump-radio", seconds: 5,
      title: "Hold the lockout call with the pump station until it is confirmed",
      cue: "Keep the radio keyed with the pump-station operator: the intake pumps isolated, locked and tagged, the float switch overridden, and the operator reading the lockout back to you before you let go.",
      why: "The intake is isolated at the pump station, by the people who run it, and the supervisor does not take a yes over the radio as a lockout: the operator names what was isolated, where the locks and tags are and who holds the key, and reads it back. The call is held until that is complete, because a half-finished conversation is how a diver ends up beside an intake that someone else still thinks is live.",
      holdBreakNote: "You let go before the operator had read the lockout back — an unconfirmed isolation is not an isolation. Key the radio and take the call from the top.",
    },
    {
      id: "contamination-controls", kind: "select", target: "decon-station",
      title: "Set the controls for contaminated water",
      cue: "Write the controls into the JSA and set them on deck: helmet mated to a vulcanised drysuit, gloves for the tender, the decon wash rigged at the ladder with its brushes and bins.",
      why: "The controls follow from what the water carries. A sealed helmet and drysuit keep it off the diver's skin and out of their mouth; the decon wash at the ladder takes it off the suit, the helmet and the umbilical before anyone unzips; and the tender's gloves keep it off the hands that will handle food and faces later. Written into the JSA, the controls become part of the dive rather than something the team hopes to remember.",
    },
    {
      id: "boat-key", kind: "turn", target: "helm-key",
      title: "Turn the workboat's engine off and pull the key",
      cue: "At the helm with the deckhand, turn the ignition key to OFF, pull it, tag the helm and put the key in your pocket for the duration of the dive.",
      why: "A turning propeller beside an umbilical is one of the ways commercial divers are killed, and the dive boat's own is the one the team controls completely. Turning the engine off and pulling the key puts that control in the supervisor's pocket: nobody starts the engine to reposition, warm up or charge a battery while a diver is down, because nobody can.",
      turn: { turns: 0.35, label: "IGNITION", readout: (t) => (t < 0.3 ? "running" : t < 0.9 ? "turning to off" : "off — key pulled and tagged") },
    },
    {
      id: "flag-up", kind: "select", target: "dive-flag",
      title: "Hoist the rigid dive flag where traffic can see it",
      cue: "Hoist the rigid code flag A at the masthead so a boat approaching from any side sees it, clear of the wheelhouse and the davit.",
      why: "The flag is the warning signal 29 CFR 1910.421 asks for where vessel traffic may pass: it tells every helmsman on the Bay that a vessel here has a diver down and cannot manoeuvre. It is rigid so it reads in no wind and hoisted high so it clears the wheelhouse from every bearing — a flag that droops, or hides behind the davit, warns nobody.",
    },
    {
      id: "o2-at-ladder", kind: "drag", target: "o2-kit",
      title: "Stage the oxygen kit at the dive ladder",
      cue: "Carry the first-aid oxygen kit from the wheelhouse to the dive ladder, where the diver comes out of the water.",
      why: "The oxygen kit is for a diver who surfaces with symptoms, and in that minute the kit has to be where the diver is, not in a locker behind the helm. Staged at the ladder, sealed and checked, it goes on the diver's face as they are helped out, while the supervisor works the emergency list; the JSA puts it there so nobody has to think of it when the dive has gone wrong.",
      drag: { to: "dive-ladder", radius: 0.5, missNote: "Not at the ladder — the oxygen goes where the diver comes out of the water." },
    },
    {
      id: "lower-downline", kind: "track", target: "downline-winch", seconds: 6,
      title: "Lower the downline to mark the work",
      cue: "Work the downline winch to lower the clump weight steadily to the bottom at the work site, clear of the intake and the hammer's berth — no free-fall, no snatch.",
      why: "The downline is the diver's road to the work and back, and the clump weight marks exactly where the dive plan put the job. Lowered steadily, the weight lands where it was aimed and does not bounce into the soft bottom and cloud it; dropped, it lands where the current carries it — sometimes beside the intake the team has just locked out, or under the pile barge's leads.",
      track: { start: 0.14, green: [0.42, 0.6], rise: 0.56, fall: 0.46, drift: 0.12, label: "DOWNLINE WINCH", readout: (v) => (v < 0.42 ? "stalled — weight swinging" : v > 0.6 ? "running away — ease the brake" : "steady — weight going down true") },
      holdBreakNote: "The weight went out of band — a stall or a run. Bring the winch back to a steady rate and hold it until the weight is on the bottom.",
    },
    {
      id: "emergency-list", kind: "select", target: "emergency-list",
      title: "Confirm the emergency aid list",
      cue: "Read the emergency aid list with the team: the nearest available recompression chamber, the hospital, the diving physician, the Coast Guard, and how a diver gets from this deck to each of them.",
      why: "29 CFR 1910.421 wants a list at the dive location of the nearest chamber, hospital, physician and the means of transport, and ADCI practice has the supervisor confirm it on the day rather than trust last month's phone numbers. A diver with symptoms needs a chamber, not the nearest emergency room, and the minutes spent finding out where one is and whether it is manned come straight out of that diver's recovery.",
    },
    {
      id: "read-backs", kind: "sequence",
      targets: ["standby-readback", "tender-readback"],
      itemNames: { "standby-readback": "standby diver reads back the rescue plan", "tender-readback": "tender reads back the umbilical controls" },
      title: "Hear the read-backs: the standby first, then the tender",
      cue: "Have the standby diver read back how they would reach the diver at the intake or the downline, then the tender read back the umbilical path, the signals and the decon.",
      why: "A briefing that nobody reads back is a speech. The standby reads back first because theirs is the plan for the worst case — where they would go in, what they would follow and what they would carry — and the tender second because their controls are the ones in use every minute of the dive. Hearing each person say it in their own words is how the supervisor finds the gap before the diver does.",
      outOfOrderNote: "Out of order — the standby reads back the rescue first; the tender's read-back follows once the worst case has been heard.",
    },
    {
      id: "sign-jsa", kind: "select", target: "jsa-log",
      title: "Sign the JSA and log it with the dive record",
      cue: "Sign the JSA with the team — every hazard with its control, the lockout confirmed and by whom, the hammer stood down, the kayak moved on — and file it with the dive record.",
      why: "The signed JSA is the evidence that this site was assessed for this dive, and it goes with the dive record 29 CFR 1910.440 has the employer keep. The events of the morning go on it too — the hammer that started and the kayak that paddled in — because the next supervisor on this site should know the neighbours and the traffic before they are surprised by them.",
    },
    {
      id: "crew-checkin", kind: "select", target: "team-board",
      title: "Check in with the team before anyone dresses",
      cue: "At the team board: everyone clear on the plan, everyone still in a PFD, anybody unhappy with anything on this site — and how everyone is today.",
      why: "The check-in is where anyone on the team can still stop the dive, and the supervisor asks for it openly: a tender who slept badly or a standby who is unhappy about the intake is information, not weakness. It is also the last moment before the work starts to ask how people are; Pile Drivers Local 34 and the Inlandboatmen's Union member assistance lines are there for what a deck conversation does not settle.",
    },
  ],

  interrupts: [
    {
      id: "pile-hammer-starts",
      kind: "Adjacent work starts up",
      after: "pump-lockout", delay: 2, seconds: 14,
      alert: "The pile hammer on the next berth has started driving — every blow thumps through the deck and rings through the water where the diver will be working.",
      cue: "Call the pile-driving foreman on the adjacent-work radio: diver going in, stop the hammer until the dive is coordinated.",
      target: "pile-crew-radio",
      why: "A pile hammer sends a pressure pulse through the water that a diver feels as a blow to the chest and ears, and it can shake loose what is lodged on the bottom. Other work in the water is coordinated before a dive, not discovered during one, and the foreman is told directly, on their own channel, so the hammer stops before the diver is anywhere near it.",
      missNote: "The hammer kept driving through the lockout call; the team carried on planning a dive into water that was taking a pressure pulse every few seconds, and nobody on the pile barge knew a diver was about to go in.",
      wrongNote: "The adjacent-work radio — the pile crew have to hear about the dive from you, on their channel.",
    },
    {
      id: "kayak-in-site",
      kind: "Recreational craft entering the dive site",
      after: "lower-downline", delay: 2, seconds: 14,
      alert: "A kayaker has paddled round the end of the seawall and is heading straight across the dive site toward the downline.",
      cue: "Hail the kayaker on the loud hailer: diver operations, keep clear of the flag, pass astern of the workboat.",
      target: "loud-hailer",
      why: "Small craft on the Bay often do not know what a dive flag means, and a kayak paddle or a fin over the downline is a snag on the diver's road down. The hailer reaches them in words while there is still room for them to turn, and it does it without anyone leaving the winch or leaning over the rail.",
      missNote: "The kayak paddled across the site and fouled its paddle on the downline just as the clump weight was going down; it capsized beside the workboat and the deckhand had to go to its rescue instead of standing by the dive.",
      wrongNote: "The loud hailer — tell the kayaker to keep clear before they reach the downline.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.6, BRDH_ACCENT);

    // ------------------------------------------------------- water and deck
    const water = box(g, 8.4, 0.02, 8.0, 0, 0.012, -1.0, 0xffffff, { rough: 0.15, metal: 0.4, cast: false });
    water.material = texturedMat(surfaceTexture((cx, w, h) => waterFace(cx, w, h, { base: "#0d2a30", mid: "#12343c" }), { repeat: 3, px: 512 }), { rough: 0.15, metal: 0.4, color: 0x86aeb8 });
    const deck = box(g, 6.2, 0.14, 3.6, 0, 0.4, 0.3, 0xffffff, { rough: 0.8 });
    deck.material = texturedMat(surfaceTexture((cx, w, h) => deckPlateFace(cx, w, h, { base: "#3e454b", base2: "#343a40", step: 22 }), { repeat: 4, px: 512 }), { rough: 0.8, metal: 0.35, color: 0xc6ccd2 });
    box(g, 6.2, 0.4, 3.6, 0, 0.16, 0.3, 0xe6e9ec, { rough: 0.5, metal: 0.3, cast: false });
    box(g, 6.2, 0.1, 0.08, 0, 0.52, -1.46, CITY.hiVis, { rough: 0.6 });
    // Rail along the water side, with stanchions.
    box(g, 6.0, 0.04, 0.04, 0, 1.45, -1.42, 0xc8ced4, { rough: 0.35, metal: 0.5 });
    for (const x of [-2.9, -1.45, 1.45, 2.9]) cyl(g, 0.022, 0.022, 1.0, x, 0.97, -1.42, 0xc8ced4, { rough: 0.35, metal: 0.5, seg: 8 });

    // ------------------------------------------------------- the seawall, outfall and intake
    const wall = group(g, -2.2, 0, -3.6);
    box(wall, 3.6, 2.2, 0.6, 0, 1.0, 0, 0x8d8a80, { rough: 0.95, finish: "concrete", tile: 2 });
    const outfall = cyl(wall, 0.42, 0.42, 0.5, 0.9, 0.55, 0.45, 0x5a5a52, { rough: 0.9, seg: 16 });
    outfall.rotation.x = Math.PI / 2;
    cyl(wall, 0.34, 0.34, 0.52, 0.9, 0.55, 0.46, 0x15181a, { rough: 1, seg: 16 }).rotation.x = Math.PI / 2;
    const intake = group(wall, -0.8, 0.5, 0.32);
    box(intake, 0.9, 0.7, 0.05, 0, 0, 0, 0x1c2024, { rough: 0.9 });
    for (let i = 0; i < 6; i++) box(intake, 0.03, 0.7, 0.06, -0.38 + i * 0.15, 0, 0.02, 0x6a727a, { rough: 0.5, metal: 0.6 });
    holoTag(intake, "pump-station intake", 0, 0.5, 0.05, { css: BRDH_CSS, w: 0.4 });
    reg(hits, intake, "outfall-intake");
    const notice = decal(wall, 0.7, 0.5, 0.9, 1.4, 0.31, paperFace("NOTICE", ["Stormwater outfall", "Discharges during", "and after rain", "Avoid contact"], { bg: "#e9eef4", band: "#0072ce" }), { px: 192 });
    reg(hits, notice, "discharge-notice");
    const sheen = decal(g, 1.6, 1.1, -1.3, 0.03, -2.6, (cx, w, h) => {
      cx.clearRect(0, 0, w, h);
      const bands = ["rgba(230,190,80,0.22)", "rgba(90,200,160,0.3)", "rgba(180,120,220,0.38)", "rgba(120,170,230,0.3)"];
      bands.forEach((c, i) => { const k = 0.1 + i * 0.1; cx.fillStyle = c; cx.fillRect(w * k, h * k, w * (1 - 2 * k), h * (1 - 2 * k)); });
    }, { px: 256, transparent: true, rough: 0.1, metal: 0.5 });
    sheen.rotation.x = -Math.PI / 2;
    reg(hits, sheen, "sheen");

    // ------------------------------------------------------- the pile barge next door
    const pileBarge = group(g, 3.4, 0, -3.8, -0.3);
    box(pileBarge, 2.6, 0.5, 1.8, 0, 0.2, 0, 0x4a4f55, { rough: 0.7, metal: 0.4 });
    const leads = group(pileBarge, -0.4, 0.45, -0.3);
    box(leads, 0.24, 3.4, 0.24, 0, 1.7, 0, 0xe0592a, { rough: 0.55, metal: 0.3 });
    const ram = group(leads, 0, 2.6, 0.2);
    box(ram, 0.3, 0.7, 0.3, 0, 0, 0, 0x2b3138, { rough: 0.5, metal: 0.6 });
    cyl(pileBarge, 0.2, 0.2, 2.0, -0.4, 0.8, -0.1, 0x6a5a48, { rough: 0.9, seg: 12 });
    holoTag(pileBarge, "pile barge — hammer rigged", -0.4, 3.8, 0.2, { css: BRDH_CSS, w: 0.5 });
    reg(hits, leads, "pile-hammer");
    const holdFlag = decal(pileBarge, 0.5, 0.34, 0.6, 1.4, 0.2, signFace("HOLD", { bg: "#c8102e", accent: "#ffffff", fg: "#ffffff", scale: 0.55 }), { px: 128 });
    holdFlag.visible = false;
    const splash = group(g, 3.0, 0.04, -3.4);
    for (let i = 0; i < 3; i++) torus(splash, 0.3 + i * 0.25, 0.012, 0, 0, 0, 0xdfeef2, { rough: 0.3, emissive: 0x9ac0c8, ei: 0.5, cast: false, seg: 6, seg2: 24 }).rotation.x = Math.PI / 2;
    splash.visible = false;

    // ------------------------------------------------------- current meter, radios, hailer
    const meter = group(g, 0.6, 1.0, -1.35);
    box(meter, 0.3, 0.26, 0.1, 0, 0.1, 0, 0x2b3138, { rough: 0.55, metal: 0.3 });
    const dial = cyl(meter, 0.1, 0.1, 0.02, 0, 0.12, 0.06, 0xf1f3f4, { rough: 0.4, seg: 20 });
    dial.rotation.x = Math.PI / 2;
    const needle = box(meter, 0.008, 0.08, 0.006, 0, 0.14, 0.075, 0xd2312b, { rough: 0.4 });
    hose(g, [[0.6, 1.0, -1.4], [0.7, 0.5, -1.6], [0.8, -0.2, -1.7]], 0.008, 0x1b1e22, { steps: 6, rough: 0.7 });
    holoTag(meter, "current meter", 0, 0.34, 0, { css: BRDH_CSS, w: 0.3 });
    reg(hits, meter, "current-meter");
    const pumpRadioG = group(g, -0.9, 0.93, -0.9);
    box(pumpRadioG, 0.3, 0.08, 0.2, 0, -0.04, 0, 0x2f4f6f, { rough: 0.7 });
    const pumpRadio = radio(pumpRadioG, 0, 0, 0, { ry: 0.3 });
    pumpRadio.userData.show?.("PUMP STN\nCH 06");
    holoTag(pumpRadioG, "pump-station radio", 0, 0.34, 0, { css: BRDH_CSS, w: 0.36 });
    reg(hits, pumpRadioG, "pump-radio");
    cyl(g, 0.03, 0.03, 0.46, -0.9, 0.69, -0.9, 0x5b6771, { rough: 0.5, metal: 0.6, seg: 8 });
    const pileRadioG = group(g, 2.3, 0.93, -0.95);
    box(pileRadioG, 0.3, 0.08, 0.2, 0, -0.04, 0, 0x6f2f2f, { rough: 0.7 });
    const pileRadio = radio(pileRadioG, 0, 0, 0, { ry: -0.3, colour: 0x2b2020 });
    void pileRadio;
    holoTag(pileRadioG, "adjacent-work radio", 0, 0.34, 0, { css: BRDH_CSS, w: 0.38 });
    reg(hits, pileRadioG, "pile-crew-radio");
    cyl(g, 0.03, 0.03, 0.46, 2.3, 0.69, -0.95, 0x5b6771, { rough: 0.5, metal: 0.6, seg: 8 });
    const hailer = group(g, -2.6, 0.95, 0.4, 0.8);
    cyl(hailer, 0.12, 0.05, 0.3, 0, 0.15, 0, 0xf1f3f4, { rough: 0.5, seg: 14 }).rotation.x = Math.PI / 2;
    box(hailer, 0.05, 0.12, 0.05, 0, 0.06, -0.08, 0x1b1e22, { rough: 0.6 });
    box(g, 0.4, 0.5, 0.4, -2.6, 0.72, 0.4, 0x3a4148, { rough: 0.6, metal: 0.3 });
    holoTag(hailer, "loud hailer", 0, 0.38, 0, { css: BRDH_CSS, w: 0.24 });
    reg(hits, hailer, "loud-hailer");

    // ------------------------------------------------------- JSA board, old JSA, emergency list
    const board = group(g, -2.0, 0.47, -1.0, 0.55);
    box(board, 1.1, 0.8, 0.04, 0, 1.15, 0, 0x2b3138, { rough: 0.6 });
    for (const x of [-0.5, 0.5]) cyl(board, 0.02, 0.02, 1.1, x, 0.55, 0, 0x5b6771, { rough: 0.5, metal: 0.6, seg: 8 });
    const jsaFace = decal(board, 1.0, 0.7, 0, 1.15, 0.025, brdhSheet("JOB SAFETY ANALYSIS", ["Task: debris clearance at the seawall", "Step / hazard / control / who", "Depth, time, gas: per the dive plan", "Hazards on this site: ______"], "#b8702a"), { px: 384 });
    holoTag(board, "JSA board", 0, 1.62, 0.03, { css: BRDH_CSS, w: 0.24 });
    reg(hits, board, "jsa-board");
    const oldJsa = group(g, -1.3, 0.47, -1.1, 0.3);
    box(oldJsa, 0.4, 0.5, 0.4, 0, 0.25, 0, 0x5b4a3a, { rough: 0.85 });
    decal(oldJsa, 0.24, 0.3, 0, 0.52, 0, brdhSheet("JSA — PIER 3", ["last week", "no outfall"], "#777777", "#e0dccf"), { px: 128 }).rotation.x = -Math.PI / 2;
    const oldHit = box(oldJsa, 0.4, 0.3, 0.4, 0, 0.6, 0, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(oldJsa, "copy last week's JSA?", 0, 0.8, 0, { css: "#d2312b", w: 0.44 });
    reg(hits, oldHit, "old-jsa-copy");
    const emList = decal(g, 0.5, 0.64, 1.9, 1.35, 1.75, brdhSheet("EMERGENCY AID", ["Chamber: nearest available", "Hospital · Physician", "Coast Guard · Transport", "Confirmed today: ____"], "#c8102e"), { px: 192 });
    emList.rotation.y = Math.PI + 0.35;
    box(g, 0.56, 0.7, 0.04, 1.9, 1.35, 1.78, 0x2b3138, { rough: 0.6 }).rotation.y = 0.35;
    reg(hits, emList, "emergency-list");

    // ------------------------------------------------------- decon, helm, flag, O2, ladder
    const decon = group(g, -2.55, 0.47, -0.55);
    cyl(decon, 0.3, 0.26, 0.3, 0, 0.15, 0, 0x2f6f9f, { rough: 0.6, seg: 16 });
    cyl(decon, 0.02, 0.02, 0.5, 0.2, 0.45, 0.1, 0x1b1e22, { rough: 0.7, seg: 6 });
    box(decon, 0.06, 0.3, 0.04, -0.2, 0.4, 0.1, 0xe8b02e, { rough: 0.7 });
    holoTag(decon, "decon wash", 0, 0.8, 0, { css: BRDH_CSS, w: 0.24 });
    reg(hits, decon, "decon-station");
    const helm = group(g, 2.5, 0.47, 0.9, -0.6);
    box(helm, 0.7, 0.9, 0.5, 0, 0.45, 0, 0xf0f1ee, { rough: 0.55 });
    box(helm, 0.6, 0.06, 0.4, 0, 0.93, 0, 0x2b3138, { rough: 0.5 });
    const keyG = group(helm, -0.15, 0.98, 0.15);
    box(keyG, 0.02, 0.05, 0.01, 0, 0.02, 0, 0xc0c6cc, { rough: 0.3, metal: 0.8 });
    const keyTag = box(keyG, 0.05, 0.07, 0.004, 0.04, -0.04, 0, 0xf2c14b, { rough: 0.7 });
    keyTag.visible = false;
    holoTag(helm, "helm — ignition key", 0, 1.3, 0, { css: BRDH_CSS, w: 0.38 });
    reg(hits, keyG, "helm-key");
    const mast = group(g, 2.8, 0.47, -0.4);
    cyl(mast, 0.025, 0.03, 2.4, 0, 1.2, 0, 0x8a949d, { rough: 0.45, metal: 0.7, seg: 8 });
    const flagDown = decal(mast, 0.36, 0.26, 0.2, 0.9, 0, signFace("A", { bg: "#f1f3f4", accent: "#2b5aa8", fg: "#2b5aa8", scale: 0.8 }), { px: 128 });
    const flagUp = decal(mast, 0.5, 0.36, 0.26, 2.2, 0, signFace("A", { bg: "#f1f3f4", accent: "#2b5aa8", fg: "#2b5aa8", scale: 0.8 }), { px: 128 });
    flagUp.visible = false;
    holoTag(mast, "dive flag", 0, 2.55, 0, { css: BRDH_CSS, w: 0.22 });
    reg(hits, mast, "dive-flag");
    const o2 = group(g, 1.7, 0.47, 0.35);
    box(o2, 0.44, 0.28, 0.28, 0, 0.14, 0, 0xf1f3f4, { rough: 0.5 });
    box(o2, 0.44, 0.05, 0.29, 0, 0.19, 0, 0x2f8f5a, { rough: 0.5 });
    holoTag(o2, "oxygen kit", 0, 0.44, 0, { css: BRDH_CSS, w: 0.24 });
    reg(hits, o2, "o2-kit");
    const ladder = group(g, -0.3, 0.47, -1.45);
    for (const x of [-0.22, 0.22]) box(ladder, 0.04, 1.6, 0.04, x, 0.0, 0, 0xc8ced4, { rough: 0.35, metal: 0.55 });
    for (let i = 0; i < 5; i++) box(ladder, 0.44, 0.03, 0.04, 0, -0.6 + i * 0.3, 0, 0xc8ced4, { rough: 0.35, metal: 0.55 });
    const ladderRing = torus(ladder, 0.3, 0.01, 0, 0.02, 0.2, BRDH_ACCENT, { emissive: BRDH_ACCENT, ei: 1.6, rough: 0.4, cast: false, seg: 6, seg2: 24 });
    ladderRing.rotation.x = Math.PI / 2;
    holoTag(ladder, "dive ladder", 0, 0.9, 0.05, { css: BRDH_CSS, w: 0.24 });
    reg(hits, ladder, "dive-ladder");
    const sendHit = box(g, 0.5, 0.5, 0.4, 0.3, 0.8, -1.2, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "call the diver down now?", 0.3, 1.15, -1.2, { css: "#d2312b", w: 0.46 });
    reg(hits, sendHit, "intake-before-lockout");
    const scoopHit = box(g, 0.5, 0.4, 0.4, -1.6, 0.9, -1.5, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "scoop it out by hand?", -1.6, 1.62, -1.45, { css: "#d2312b", w: 0.42 });
    reg(hits, scoopHit, "bare-hand-sheen");
    const pfdHook = group(g, 1.2, 1.2, -1.4);
    box(pfdHook, 0.36, 0.44, 0.1, 0, 0, 0, 0xf06a2b, { rough: 0.7 });
    box(pfdHook, 0.36, 0.04, 0.11, 0, 0.1, 0, 0xdfe8ee, { rough: 0.4, emissive: 0x8a9aa0, ei: 0.3 });
    holoTag(pfdHook, "PFD off to lean out?", 0, 0.34, 0.06, { css: "#d2312b", w: 0.4 });
    reg(hits, pfdHook, "pfd-off");

    // ------------------------------------------------------- downline winch and clump
    const winch = group(g, -1.4, 0.47, 0.35);
    box(winch, 0.5, 0.44, 0.44, 0, 0.22, 0, 0x2f4f6f, { rough: 0.55, metal: 0.4 });
    const drum = cyl(winch, 0.14, 0.14, 0.44, 0, 0.5, 0, 0x5b6771, { rough: 0.5, metal: 0.6, seg: 14 });
    drum.rotation.z = Math.PI / 2;
    holoTag(winch, "downline winch", 0, 0.9, 0, { css: BRDH_CSS, w: 0.3 });
    reg(hits, winch, "downline-winch");
    const davitArm = group(g, -1.0, 0.47, -1.35);
    box(davitArm, 0.08, 1.5, 0.08, 0, 0.75, 0, CITY.hiVis, { rough: 0.55, metal: 0.3 });
    box(davitArm, 0.08, 0.08, 0.7, 0, 1.5, -0.3, CITY.hiVis, { rough: 0.55, metal: 0.3 });
    const line = cyl(g, 0.008, 0.008, 1.0, -1.0, 1.4, -2.0, 0xe8dcb8, { rough: 0.8, seg: 6 });
    const clump = box(g, 0.3, 0.2, 0.3, -1.0, 0.8, -2.0, 0x3a3f45, { rough: 0.8, metal: 0.3 });
    const clumpHome = clump.position.y;

    // ------------------------------------------------------- crew in PFDs
    const standby = standingFigure(g, 0.45, 1.12, { ry: 2.8, cloth: 0x1b1e22, trousers: 0x1b1e22, vest: 0xf06a2b, gloves: 0x2b2b2b });
    standby.position.y = 0.47;
    const sbTag = holoTag(standby, "standby diver — read back", 0, 1.95, 0, { css: BRDH_CSS, w: 0.46 });
    reg(hits, sbTag, "standby-readback");
    const tender = standingFigure(g, -0.7, 1.45, { ry: 2.6, cloth: 0x1f3a52, vest: 0xf06a2b, helmet: 0xf1f3f4, gloves: true });
    tender.position.y = 0.47;
    const tdTag = holoTag(tender, "tender — read back", 0, 1.95, 0, { css: BRDH_CSS, w: 0.36 });
    reg(hits, tdTag, "tender-readback");
    const deckhand = standingFigure(g, 1.85, -0.75, { ry: -2.4, cloth: 0x2b3138, vest: 0xf06a2b, cap: 0x1f3a52, gloves: true });
    deckhand.position.y = 0.47;
    holoTag(deckhand, "deckhand (IBU)", 0, 1.95, 0, { css: BRDH_CSS, w: 0.3 });

    // ------------------------------------------------------- log and team board
    const logTable = group(g, 0.4, 0.47, 1.9);
    box(logTable, 0.8, 0.06, 0.5, 0, 0.8, 0, 0x5b4a3a, { rough: 0.8 });
    for (const [lx, lz] of [[-0.35, -0.2], [0.35, -0.2], [-0.35, 0.2], [0.35, 0.2]]) cyl(logTable, 0.022, 0.022, 0.8, lx, 0.4, lz, 0x3a4148, { rough: 0.6, metal: 0.4, seg: 6 });
    const logSheet = decal(logTable, 0.34, 0.26, 0, 0.84, 0, brdhSheet("JSA SIGN-OFF", ["Supervisor ____", "Tender ____ Standby ____", "Deckhand ____"], "#b8702a"), { px: 192 });
    logSheet.rotation.x = -Math.PI / 2;
    holoTag(logTable, "JSA sign-off and dive record", 0, 1.1, 0, { css: BRDH_CSS, w: 0.52 });
    reg(hits, logSheet, "jsa-log");
    const teamBoard = decal(g, 0.6, 0.4, -1.9, 1.35, 1.8, (cx, w, h) => {
      cx.fillStyle = "#101c27"; cx.fillRect(0, 0, w, h); cx.fillStyle = "#59c97b"; cx.fillRect(0, 0, w, 6);
      cx.font = `600 ${Math.round(h * 0.15)}px 'Barlow Condensed', Arial, sans-serif`; cx.textAlign = "left"; cx.textBaseline = "middle";
      cx.fillStyle = "#e6f6ea"; cx.fillText("DIVE TEAM", w * 0.06, h * 0.22);
      cx.font = `${Math.round(h * 0.11)}px Arial, sans-serif`; cx.fillStyle = "#f4f8fb";
      ["Supervisor · Diver · Tender", "Standby · Deckhand", "PFDs on deck: all"].forEach((l, i) => cx.fillText(l, w * 0.06, h * (0.46 + i * 0.18)));
    }, { px: 256, glow: true, ei: 0.6 });
    teamBoard.rotation.y = Math.PI - 0.3;
    box(g, 0.66, 0.46, 0.04, -1.9, 1.35, 1.83, 0x2b3138, { rough: 0.6 }).rotation.y = -0.3;
    reg(hits, teamBoard, "team-board");

    // ------------------------------------------------------- the crew boat alongside, and the kayak
    const crewBoat = workboat(g, 0.6, -0.45, -4.4, { ry: Math.PI / 2, livery: { colour: 0xd9dde0, fleetName: "BAY WORKS", unitNumber: "WB-7" } });
    void crewBoat;
    const kayak = group(g, -4.6, 0.02, -3.0, 0.4);
    const hull = ball(kayak, 0.3, 0, 0.08, 0, 0xf2a03d, { rough: 0.5, seg: 12, seg2: 8 });
    hull.scale.set(1, 0.35, 5.5);
    const paddler = ball(kayak, 0.14, 0, 0.36, 0, 0x2b5aa8, { rough: 0.6, seg: 10, seg2: 8 });
    void paddler;
    const paddle = box(kayak, 1.3, 0.02, 0.06, 0, 0.36, 0, 0xe8e2d0, { rough: 0.6 });
    kayak.visible = false;

    const waterTex = water.material.map;
    let hammerOn = false;

    return {
      hits,
      spawnLook: new THREE.Vector3(-0.2, 0.9, -1.2),
      onStep() {},
      onStepComplete(step) {
        if (step.id === "open-jsa") repaint(jsaFace, brdhSheet("JOB SAFETY ANALYSIS", ["Task: debris clearance at the seawall", "Step / hazard / control / who", "Depth, time, gas: per the dive plan", "Team present: all four"], "#b8702a"));
        if (step.id === "site-walk") repaint(jsaFace, brdhSheet("JOB SAFETY ANALYSIS", ["Intake — isolate at the pump station", "Pile hammer — coordinate, stand down", "Depth, time, gas: per the dive plan", "Current and water: to read"], "#b8702a"));
        if (step.id === "pump-lockout") pumpRadio.userData.show?.("LOCKOUT\nCONFIRMED");
        if (step.id === "contamination-controls") decon.scale.set(1.15, 1.15, 1.15);
        if (step.id === "boat-key") { keyG.rotation.z = -0.9; keyTag.visible = true; }
        if (step.id === "flag-up") { flagDown.visible = false; flagUp.visible = true; }
        if (step.id === "o2-at-ladder") { o2.position.set(-0.3, 0.47, -1.0); ladderRing.material = mat(0x59c97b, { emissive: 0x59c97b, ei: 1.2 }); }
        if (step.id === "lower-downline") { clump.position.y = 0.05; line.scale.y = 1.8; line.position.y = 0.95; }
        if (step.id === "sign-jsa") repaint(logSheet, brdhSheet("JSA — SIGNED", ["Lockout confirmed · hammer held", "Kayak cleared · flag up", "All four signed"], "#59c97b"));
      },
      onHazard() {},
      onInterrupt(it) {
        if (it.id === "pile-hammer-starts") { hammerOn = true; splash.visible = true; }
        if (it.id === "kayak-in-site") { kayak.visible = true; kayak.position.set(-3.4, 0.02, -2.6); }
      },
      onInterruptEnd(it) {
        if (it.id === "pile-hammer-starts") { hammerOn = false; splash.visible = false; if (it.resolved === "answered") { ram.position.y = 2.9; holdFlag.visible = true; } }
        if (it.id === "kayak-in-site" && it.resolved === "answered") { kayak.rotation.y = 2.4; kayak.position.set(-4.4, 0.02, 0.6); paddle.rotation.y = 0.6; }
      },
      animate(t, dt, session) {
        const step = session?.step;
        if (waterTex?.offset) { waterTex.offset.x = t * 0.004; waterTex.offset.y = t * 0.005; }
        const gg = session?.gauge;
        if (gg && !gg.committed && step?.id === "read-current") needle.rotation.z = 1.2 - gg.t * 2.4;
        if (session?.turn && step?.id === "boat-key") keyG.rotation.z = -session.turn.amount * 0.9;
        if (hammerOn) { ram.position.y = 2.6 - Math.abs(Math.sin(t * 5)) * 0.5; splash.scale.setScalar(1 + (t * 2) % 1); }
        if (step?.id === "lower-downline" && session.holding) { drum.rotation.x += (dt ?? 0.016) * 2 * (session.track?.v ?? 0); clump.position.y = Math.max(0.05, clumpHome - (session.track?.inBand ?? 0) * 0.15); }
        if (kayak.visible) kayak.position.y = 0.02 + Math.sin(t * 1.3) * 0.02;
      },
    };
  },
};
