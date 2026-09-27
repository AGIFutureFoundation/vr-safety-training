import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import { box, cyl, ball, torus, hose, group, decal, repaint, paperFace, mat } from "../../../shared/kit.js";
import {
  CITY, stationPad, holoTag, standingFigure, valveWheel, reg,
  surfaceTexture, texturedMat, deckPlateFace, waterFace, paintedSteelFace,
} from "../citykit.js";
import { gratingFace } from "../../../shared/textures.js";
import { rov, workboat } from "../../../shared/fleet.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ ROV Launch, Recovery & Tether Management — commercial diving
// and scientific scuba pack, DIVE1.
//
// A pier apron with an observation-class ROV (the fleet kit's rov) on its
// grated launch pad under a small davit, the tether reel with its brake, the
// flake tray, the pilot's console with its monitor, the tether marks at the
// rail's roller, the water off the apron with a pile the tether can snag on,
// and a dive workboat alongside with a diver in the water on its far side.
// The learner is the ROV tender: checks, launch, the tether for the whole
// flight, the snag drill and the recovery, working to the pilot and the dive
// supervisor. No depth, tether length, current or time is a number; the ROV
// plan and the dive plan hold them.

const CDRV_ACCENT = 0xf2c14b;
const CDRV_CSS = "#f2c14b";

export const SIM_CD_ROV_LAUNCH_RECOVERY_AND_TETHER_MANAGEMENT = {
  id: "cd-rov-launch-recovery-and-tether-management",
  index: "718",
  domain: "Maritime & Ports",
  trade: "Pile Drivers of the Carpenters diver-tender working as ROV tender on a pier survey, with the ROV pilot at the console, the dive supervisor and a diver in the water off the workboat",
  category: "Maritime & Ports",
  district: "Maritime & Ports",
  weather: "clear",
  certification: "Pile Drivers apprenticeship under the Carpenters (UBC) International Training Fund; OSHA 29 CFR 1910 Subpart T where an ROV works alongside divers — 29 CFR 1910.421 pre-dive planning of hazardous activities nearby, 29 CFR 1910.422 procedures during the dive (communications and the termination of the dive) and 29 CFR 1910.430 equipment; ADCI consensus standards for ROV operations on a dive site; USCG 46 CFR 197 Subpart B where the vessel is under Coast Guard jurisdiction and 33 CFR 83 for the workboat's lights and signals; the ROV manufacturer's manual and the dive plan hold every limit",
  name: "ROV Launch, Recovery & Tether Management",
  title: simTitle("ROV Launch, Recovery & Tether Management"),
  tagline: "The vehicle's line in the tender's hands: the ROV plan read against the dive plan, the cracked float and the loose termination found, thrusters and lights function-tested, the tether flaked, the vehicle lowered on the davit, held at the surface through a skiff's wake, the tether paid out in step until it snags on a pile, the snag drill worked back along the path, the marks read to the plan, the hook landed on the bail, the vehicle hoisted, rinsed, tagged and logged",
  accent: CDRV_ACCENT,
  accentCss: CDRV_CSS,
  parSeconds: 320,
  footprint: 2.6,
  badge: { id: "tether-in-hand", name: "Tether In Hand", note: "The ROV's tether tended from the pad to the reel, never a bight on deck, never a hand near a live thruster" },

  supportLine: "your union hall's member assistance programme — the Pile Drivers of the Carpenters — with the employer's employee assistance line behind it",

  game: system({
    name: "Flight Deck",
    currency: "TETHER MARKS",
    ranks: ["Deckhand", "ROV Tender", "Launch Tender", "Lead Tender", "ROV Deck Certified"],
    badges: [
      { id: "found-on-the-pad", name: "Found On The Pad", note: "The cracked float and the loose termination found before the water", test: AWARD.stepClean("pre-dive-checks") },
      { id: "marks-to-plan", name: "Marks To Plan", note: "The tether marks committed inside the plan's band first time", test: AWARD.precise(0.7) },
      { id: "clear-of-thrusters", name: "Clear Of Thrusters", note: "No hand near a live thruster, no bight, no wrap", test: AWARD.safe },
    ],
    challenges: [
      { id: "clean-flight", name: "Clean Flight", note: "No corrections from the brief to the check-in", test: AWARD.clean },
      { id: "steady-payout", name: "Steady Pay-out", note: "Tether in band for the whole flight", test: AWARD.unbroken },
      { id: "logged-fast", name: "Logged Fast", note: "ROV log written inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "hand-in-thruster": "You reached into a thruster's guard to pull out a strand of weed with the vehicle still powered. A thruster spins up on a pilot's thumb without a sound from the deck, and the guard is sized to keep out a rope, not a finger. Fouling is cleared with the vehicle powered down at the console and the pilot's hands off the sticks, said out loud, and with a tool rather than a hand.",
    "stand-in-tether": "You stepped into a loop of tether on the deck while it was paying out. A tether that runs out under your feet takes an ankle with it toward the rail, and the pilot flying the vehicle feels only that the tether has gone tight. The tender stands beside the flake, feeds it from the side, and never lets a loop lie where a foot can go.",
    "wrap-tether-hand": "You took a wrap of the tether round your hand to hold it against the pull at the rail. A vehicle that gets caught in a current or driven hard by the pilot puts its whole thrust on that wrap, and a hand cinched in a tether goes over the rail with it. The tether is held in open hands and led over the roller; if it pulls too hard to hold, the pilot is told and the reel's brake takes it.",
    "fly-to-diver": "You told the pilot to swing the vehicle round to look at the diver's bubbles on the far side of the workboat. An ROV near a diver without the supervisor's word is a tether across a diver's umbilical and thrusters beside a diver's hands; the dive plan keeps the vehicle on its own side of the boat until the supervisor says otherwise, and the tender does not redirect it.",
  },

  lateNotes: {
    "tether-payout": "The tether is paid out once the vehicle is in the water and trimmed.",
    "lift-hook": "The hook goes on once the pilot has brought the vehicle to the surface.",
    "rov-log": "The log is written once the vehicle is on the pad, rinsed and inspected.",
  },

  steps: [
    {
      id: "rov-brief", kind: "select", target: "rov-plan",
      title: "Read the ROV plan against the dive plan",
      cue: "At the console: the vehicle's task and its working side of the boat, the diver's side, who calls a hold, the hand signals with the pilot when the intercom fails, and what ends the flight.",
      why: "An ROV on a dive site is one of the hazardous activities nearby that 29 CFR 1910.421 has the dive team plan for, and the plan is what keeps a vehicle with spinning thrusters and a long tether on its own side of the boat from the diver. The tender reads it against the dive plan so the two agree about the sides, the holds and who has the word, before either vehicle or diver is in the water.",
    },
    {
      id: "pre-dive-checks", kind: "find", noHint: true,
      targets: ["cracked-float", "loose-termination"],
      itemNames: { "cracked-float": "crack in the vehicle's flotation block", "loose-termination": "tether termination loose on the vehicle" },
      itemNotes: {
        "cracked-float": "A crack runs through the yellow flotation block along one edge. Syntactic foam that takes on water loses its buoyancy through the flight, and a vehicle that goes heavy fights the pilot on every ascent.",
        "loose-termination": "The tether's termination is not seated home on the vehicle's connector — a finger moves it. A termination that pulls in the water floods the connector and the flight is over with the vehicle on the bottom.",
      },
      title: "Walk round the vehicle on the pad",
      cue: "Go round the ROV on its pad: the frame, the flotation, each thruster's guard and prop, the camera dome, the lights, the manipulator and the tether termination — hands on each.",
      why: "The vehicle goes into the water only as good as the pad check, and the two faults that end a flight — a flooding termination and a float that goes heavy — are both found by a hand on the pad and neither from the console. 29 CFR 1910.430 has the dive team's equipment inspected before each use, and on a site where the vehicle works beside a diver, the ROV is that equipment.",
    },
    {
      id: "function-test", kind: "sequence",
      targets: ["thruster-test", "lights-camera"],
      itemNames: { "thruster-test": "thrusters bumped on the pilot's call, tender clear", "lights-camera": "lights and camera checked on the monitor" },
      title: "Call the thruster bump clear, then check lights and camera",
      cue: "Step back, call 'clear' to the pilot, let them bump each thruster once, then have the lights and camera brought up and confirm the picture on the monitor.",
      why: "Thrusters are tested with everyone clear and on a call, because a bump test with a hand on the frame is a hand in a prop; the tender says 'clear', the pilot says 'bumping', and only then does anything spin. Lights and camera are checked after, on the monitor, because a vehicle that goes down without a picture cannot be flown back and the tender is the one who will haul it in blind on the tether.",
      outOfOrderNote: "Out of order — the thrusters are bumped first, with you clear and on a call; the picture is checked after.",
    },
    {
      id: "tether-flake", kind: "drag", target: "tether-end",
      title: "Flake the tether from the reel into the tray",
      cue: "Take the tether from the reel and flake it into the tray in figure-eights, enough for the flight per the plan, the vehicle end on top.",
      why: "A tether flaked in figure-eights pays out without a twist; one coiled round and round throws a kink into the water every few metres, and a kink in a tether is a bent fibre and a lost picture. The flake is sized to the plan so the tender knows when the vehicle has all it should have, and the vehicle end lies on top so the pay-out starts clean without dragging the flake across the deck.",
      drag: { to: "flake-tray", radius: 0.55, missNote: "Not in the tray — flake the tether down in figure-eights into the tray with the vehicle end on top." },
    },
    {
      id: "launch-lower", kind: "turn", target: "davit-winch",
      title: "Lower the vehicle on the davit to the water",
      cue: "With the pilot ready and the tether in your other hand, lower the ROV on the davit winch — steady, over the side, until it floats and the hook is slack.",
      why: "The vehicle goes over the side on the davit and not by hand, because an ROV is heavier than it looks and a rail is not a place to be holding one when the boat rolls. The winch runs steady so the vehicle does not swing into the hull, and the tender keeps the tether in the other hand so the vehicle is never off the hook without its tether tended; the hook is slack before it is released, never released to drop.",
      turn: { turns: 1.2, label: "WINCH — LOWER", readout: (t) => (t < 0.35 ? "vehicle on the pad" : t < 0.85 ? "over the side — lowering" : "afloat — hook slack") },
    },
    {
      id: "surface-hold", kind: "hold", target: "surface-ring", seconds: 5,
      title: "Hold the vehicle at the surface for the pilot's trim and comms check",
      cue: "Keep the tether snug with the vehicle floating at the surface off the apron while the pilot checks trim, the picture and the intercom, and confirms 'ready to dive'.",
      why: "The surface check is the last one before the vehicle is out of reach: trim wrong is a vehicle that fights the pilot all flight, and an intercom that drops is a tender and a pilot who cannot talk about the tether. The tender holds it snug at the surface where it can still be hauled in by hand, and lets it go down only on the pilot's word, because after that the tether is the only thing the tender can do anything with.",
      holdBreakNote: "The tether went slack or the vehicle drifted off — hold it snug at the surface until the pilot calls 'ready to dive'.",
    },
    {
      id: "tether-payout", kind: "track", target: "tether-payout", seconds: 6,
      title: "Pay the tether out in step with the vehicle",
      cue: "Feed the tether over the roller as the pilot flies out — enough that the vehicle is never held back, never so much that a belly of slack drifts toward the pile.",
      why: "A tether held tight pulls the vehicle off its heading and drags on every thruster; a tether paid out loose lays a belly on the bottom that wraps the pile the pilot cannot see behind them. The tender feels the vehicle through the tether the way a dive tender feels a diver, matching the pay-out to the picture on the monitor and to the pilot's calls, so the tether runs clean from the roller to the vehicle.",
      track: { start: 0.14, green: [0.42, 0.62], rise: 0.56, fall: 0.46, drift: 0.12, label: "TETHER", readout: (v) => (v < 0.42 ? "holding the vehicle back" : v > 0.62 ? "slack bellying toward the pile" : "in step with the pilot") },
      holdBreakNote: "The tether went out of band — holding the vehicle back or bellying slack. Get back in step with the pilot.",
    },
    {
      id: "snag-drill", kind: "sequence",
      targets: ["reverse-path", "feel-slack"],
      itemNames: { "reverse-path": "pilot flies back along the tether's own path", "feel-slack": "tender feels the tether come free and takes in the slack" },
      title: "Work the snag drill: back along the path, then take in the slack",
      cue: "Tell the pilot 'snag — fly back along your track', watch the tether at the roller, and when it comes free take in the slack hand over hand before the pilot moves again.",
      why: "A snagged tether is never pulled from the deck: pulling drags the vehicle backward into whatever it is caught on and can part the tether at the termination. The pilot flies back along the path the tether took, because that is the only route that unwinds the snag, and the tender takes in the slack the moment it comes free so the same belly cannot catch twice. Then the pilot goes on, and the tender says how much came back.",
      outOfOrderNote: "Out of order — the pilot flies back along the tether's path first; the slack is taken in once it comes free.",
    },
    {
      id: "read-marks", kind: "gauge", target: "tether-marks",
      title: "Read the tether marks against the ROV plan",
      cue: "Read the tether's marks at the roller and commit when what is out matches the vehicle's working run in the plan, with the slack you have just recovered accounted for.",
      why: "The tether is marked along its length so the tender knows what is out without seeing the vehicle, and the plan says how far the vehicle should be from the apron on this run. Too little out and the pilot is held short; too much and there is tether on the bottom where the pile is. Reading the marks against the plan is how the tender knows the snag drill recovered what it should and the vehicle is where the picture says.",
      gauge: { label: "TETHER OUT vs PLAN", speed: 0.68, green: [0.42, 0.6], readout: (t) => (t < 0.42 ? "short — vehicle held back" : t <= 0.6 ? "matches the working run" : "too much out — tether on the bottom"), missNote: "Outside the band — read the mark at the roller and match it to the run the ROV plan gives." },
    },
    {
      id: "recovery-call", kind: "select", target: "console-intercom",
      title: "Agree the recovery with the pilot and the supervisor",
      cue: "On the intercom: the pilot ends the run and brings the vehicle to the surface at the apron with lights on; you confirm the diver is clear on the other side with the supervisor before the hoist starts.",
      why: "Recovery is the second time the vehicle and the tender's hands are close together and the first time the tether has to come in fast, so it is agreed on the intercom rather than begun on a feeling. The supervisor confirms the diver is on their own side and away from the tether's path per the dive plan, because a vehicle coming up under a hoist and a diver on an umbilical must never be in the same water.",
    },
    {
      id: "hook-on", kind: "drag", target: "lift-hook",
      title: "Land the davit hook on the vehicle's bail",
      cue: "With the vehicle at the surface against the apron's fender and the pilot's hands off the sticks, reach the davit hook to the bail and close its latch.",
      why: "The hook goes on with the pilot's hands off the sticks and said so, because a thruster bumped while a tender leans over the rail to a floating vehicle is a hand in a prop. The bail is the one lifting point the manufacturer built for the hoist; a hook on the frame or the flotation pulls the vehicle apart on the way up. The latch closes and is checked before the winch turns.",
      drag: { to: "rov-bail", radius: 0.55, missNote: "Not on the bail — the hook goes on the vehicle's lifting bail with its latch closed, pilot's hands off the sticks." },
    },
    {
      id: "recover-hoist", kind: "turn", target: "davit-winch",
      title: "Hoist the vehicle to the pad",
      cue: "Take the tether in as the winch lifts, steady, clear of the hull, and land the vehicle on its pad without a swing.",
      why: "The vehicle comes up on the winch with the tether taken in beside it so no bight is left in the water for a propeller, and it is landed on its pad rather than the deck so the frame sits on the mounts and the thrusters are off the plate. A swinging vehicle at a rail is a struck-by for the tender and a cracked dome for the vehicle; the hoist is slow and the tender's free hand steadies it, never under it.",
      turn: { turns: 1.2, label: "WINCH — HOIST", readout: (t) => (t < 0.35 ? "vehicle in the water" : t < 0.85 ? "lifting — clear of the hull" : "landed on the pad") },
    },
    {
      id: "post-dive-inspect", kind: "select", target: "rinse-hose",
      title: "Rinse the vehicle and inspect it, tag the cracked float",
      cue: "Rinse the vehicle and the tether with fresh water, look over every part you checked on the way out, and tag the cracked float and the termination for the technician.",
      why: "Bay water left on a vehicle eats its connectors and its bearings between flights, and the rinse is when the tender sees what the flight did: a new nick in the tether, weed in a thruster, a dome scratched on the pile. The float and the termination found on the pad are tagged rather than talked about, so the technician finds them and no one launches the vehicle tomorrow on the tender's memory.",
    },
    {
      id: "rov-log", kind: "select", target: "rov-log",
      title: "Write the ROV log and the dive record entry",
      cue: "At the log: the checks, the faults tagged, the launch and recovery times, the snag and where the vehicle was, the wake at the surface, the tether marks and the diver's side confirmed.",
      why: "The vehicle's history is what the technician reads before the next flight and what the supervisor cites when the dive record asks what else was in the water; 29 CFR 1910.440 keeps the dive's record and the ROV log sits beside it. The snag and the wake go in because the next tender at this pier plans the tether's path around the pile, and the tagged faults go in so the log and the tags agree.",
    },
    {
      id: "crew-checkin", kind: "select", target: "team-board",
      title: "Check in with the pilot and the dive team",
      cue: "At the team board: the vehicle tagged out for the technician, the snag and the wake, the diver's side held clear throughout, and how everyone is.",
      why: "The check-in is where the two crews — the ROV's and the diver's — agree what happened in the same water: the wake that pushed the vehicle toward the pile, the snag, and the fact that the vehicle never crossed to the diver's side. It is said out loud so tomorrow's plan carries it, and the Pile Drivers member assistance line is there for what the deck conversation does not settle.",
    },
  ],

  interrupts: [
    {
      id: "skiff-wake",
      kind: "Skiff's wake setting the vehicle onto the pile",
      after: "surface-hold", delay: 2, seconds: 14,
      alert: "A skiff has run past the apron and its wake is pushing the floating vehicle toward the pile — the pilot is fighting it on the thrusters with your tether tight.",
      cue: "Hit the deck kill switch to stop the thrusters, then haul the vehicle in by the tether to the fender before it strikes the pile.",
      target: "kill-switch",
      why: "A vehicle at the surface in a wake is a vehicle whose thrusters are half out of the water and doing nothing useful, and a pilot fighting a wake drives it into the pile as often as away. The deck kill switch stops the thrusters so the tender can haul it in by hand without a prop turning near the tether or the fender, and the vehicle rides the wake against the fender instead of the pile.",
      missNote: "The wake carried the vehicle onto the pile with its thrusters still turning; the dome took the strike and the tether wrapped the pile's growth before the tender hauled it clear.",
      wrongNote: "The kill switch — stop the thrusters before you haul on a tether with a prop turning at the end of it.",
    },
    {
      id: "tether-snag",
      kind: "Tether snagged on the pile",
      after: "tether-payout", delay: 2, seconds: 14,
      alert: "The tether has stopped paying out and is coming up tight at the roller — the vehicle's picture shows it still trying to fly forward.",
      cue: "Set the reel's brake and call 'snag — stop' to the pilot on the intercom before another metre goes out or comes in.",
      target: "reel-brake",
      why: "A tether that stops paying out while the vehicle flies on is caught on something between the roller and the vehicle, and every metre the pilot flies pulls harder on the snag and the termination. The brake stops the reel, the call stops the pilot, and only then is the snag drill worked; pulling from the deck or flying on are the two ways to part a tether at its weakest point.",
      missNote: "The pilot flew on against the snag until the termination pulled and the picture went dark; the vehicle was recovered by the tether alone, hand over hand, with the pile's growth wrapped round it.",
      wrongNote: "The reel's brake — stop the tether and call the snag to the pilot before anything else.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.6, CDRV_ACCENT);

    // ------------------------------------------------------- water, apron, pile
    const water = box(g, 9.0, 0.02, 7.0, 0, 0.012, -3.4, 0xffffff, { rough: 0.15, metal: 0.4, cast: false });
    water.material = texturedMat(surfaceTexture((cx, w, h) => waterFace(cx, w, h, { base: "#0e2f36", mid: "#143f44" }), { repeat: 3, px: 512 }), { rough: 0.15, metal: 0.4, color: 0x86acb6 });
    const apron = box(g, 7.0, 0.14, 4.4, 0, 0.4, 0.6, 0xffffff, { rough: 0.8 });
    apron.material = texturedMat(surfaceTexture((cx, w, h) => deckPlateFace(cx, w, h, { base: "#4a5055", base2: "#3d4348", step: 21 }), { repeat: 4, px: 512 }), { rough: 0.8, metal: 0.35, color: 0xc6ccd2 });
    box(g, 7.0, 0.4, 4.4, 0, 0.16, 0.6, 0x8a8f93, { rough: 0.7, cast: false });
    for (const x of [-3.2, -1.6, 0, 1.6, 3.2]) cyl(g, 0.022, 0.022, 1.0, x, 0.97, -1.55, 0xc8ced4, { rough: 0.35, metal: 0.5, seg: 8 });
    box(g, 6.8, 0.04, 0.04, 0, 1.45, -1.55, 0xc8ced4, { rough: 0.35, metal: 0.5 });
    for (const x of [-3.0, 0.0, 3.0]) cyl(g, 0.12, 0.12, 0.5, x, 0.7, -1.72, 0x1f5fb8, { seg: 10, rough: 0.6 });
    const pile = group(g, -2.4, 0, -3.4);
    const pShaft = cyl(pile, 0.34, 0.36, 3.0, 0, 1.0, 0, 0xffffff, { seg: 18 });
    pShaft.material = texturedMat(surfaceTexture((cx, w, h) => paintedSteelFace(cx, w, h, { base: "#5a6a4a", base2: "#465538" }), { px: 256 }), { rough: 0.9 });
    torus(pile, 0.4, 0.05, 0, 0.5, 0, 0x4a5a32, { rough: 1, seg: 6, seg2: 18 }).rotation.x = Math.PI / 2;
    holoTag(pile, "pile — the tether's snag", 0, 2.7, 0, { css: CDRV_CSS, w: 0.44 });

    // ------------------------------------------------------- the vehicle, pad, davit
    const pad = group(g, 0.6, 0.47, 0.2);
    const padTop = box(pad, 1.4, 0.06, 1.4, 0, 0.03, 0, 0xffffff, { rough: 0.8 });
    padTop.material = texturedMat(surfaceTexture((cx, w, h) => gratingFace(cx, w, h), { repeat: 2, px: 256 }), { rough: 0.8, metal: 0.5, color: 0x9aa2aa });
    for (const [sx, sz] of [[-0.4, -0.3], [0.4, -0.3], [-0.4, 0.3], [0.4, 0.3]]) box(pad, 0.1, 0.1, 0.1, sx, 0.11, sz, 0x1b1e22, { rough: 0.8 });
    const vehicle = rov(g, 0.6, 0.62, 0.2, { ry: Math.PI });
    const vehicleHome = vehicle.position.clone();
    const parts = vehicle.userData.parts ?? {};
    holoTag(g, "observation ROV on its pad", 0.6, 1.5, 0.2, { css: CDRV_CSS, w: 0.5 });
    const crack = box(g, 0.02, 0.04, 0.5, 0.92, 1.04, 0.2, 0x1b1e22, { rough: 0.9, emissive: 0x3a1a0a, ei: 0.4 });
    reg(hits, crack, "cracked-float");
    const term = group(g, 0.6, 1.14, 0.4);
    cyl(term, 0.035, 0.035, 0.08, 0, 0, 0, 0x8a949d, { rough: 0.35, metal: 0.8, seg: 10 }).rotation.x = 0.4;
    reg(hits, term, "loose-termination");
    const thrHit = box(g, 0.3, 0.3, 0.3, 0.3, 0.8, -0.3, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "pull the weed out — powered?", 0.3, 1.2, -0.3, { css: "#d2312b", w: 0.5 });
    reg(hits, thrHit, "hand-in-thruster");
    const thrTest = group(g, 1.2, 1.0, 0.2);
    torus(thrTest, 0.1, 0.008, 0, 0, 0, CDRV_ACCENT, { emissive: CDRV_ACCENT, ei: 1.2, rough: 0.4, cast: false, seg: 6, seg2: 16 });
    holoTag(thrTest, "call clear — bump thrusters", 0, 0.18, 0, { css: CDRV_CSS, w: 0.5 });
    reg(hits, thrTest, "thruster-test");
    const bail = group(g, 0.6, 1.2, 0.0);
    torus(bail, 0.08, 0.012, 0, 0, 0, 0x8a949d, { rough: 0.35, metal: 0.8, seg: 6, seg2: 16 });
    holoTag(bail, "lifting bail", 0, 0.2, 0, { css: CDRV_CSS, w: 0.24 });
    reg(hits, bail, "rov-bail");
    // Davit with winch.
    cyl(g, 0.06, 0.06, 3.0, 2.0, 1.95, -1.3, 0x5b6771, { rough: 0.5, metal: 0.6, seg: 10 });
    const arm = box(g, 2.0, 0.08, 0.08, 1.3, 3.4, -0.7, 0x5b6771, { rough: 0.5, metal: 0.6 });
    arm.rotation.y = 0.7;
    const wire = hose(g, [[0.6, 3.3, 0.0], [0.6, 1.3, 0.0]], 0.008, 0xb0b4b8, { steps: 2, rough: 0.5 });
    const hook = group(g, 0.6, 1.4, 0.0);
    torus(hook, 0.06, 0.012, 0, 0, 0, 0xc0c6cc, { rough: 0.3, metal: 0.8, seg: 6, seg2: 14 });
    box(hook, 0.03, 0.08, 0.03, 0, -0.08, 0, 0xc0c6cc, { rough: 0.3, metal: 0.8 });
    holoTag(hook, "davit hook", 0.2, 0.1, 0, { css: CDRV_CSS, w: 0.22 });
    reg(hits, hook, "lift-hook");
    const winch = group(g, 2.0, 1.1, -1.0);
    box(winch, 0.3, 0.3, 0.3, 0, 0, 0, 0x2b3138, { rough: 0.6, metal: 0.4 });
    const winchWheel = valveWheel(winch, 0.2, 0, 0, { r: 0.08, color: 0xd2312b, body: 0x3a4148 });
    winchWheel.rotation.z = Math.PI / 2;
    winchWheel.scale.set(0.8, 0.8, 0.8);
    holoTag(winch, "davit winch", 0, 0.4, 0, { css: CDRV_CSS, w: 0.24 });
    reg(hits, winch, "davit-winch");
    const killSwitch = group(g, 2.0, 1.45, -1.0);
    cyl(killSwitch, 0.05, 0.05, 0.04, 0, 0, 0, 0xd2312b, { rough: 0.4, seg: 14 });
    box(killSwitch, 0.14, 0.14, 0.02, 0, 0, -0.03, 0xf2c14b, { rough: 0.5 });
    holoTag(killSwitch, "deck kill switch", 0, 0.16, 0, { css: CDRV_CSS, w: 0.3 });
    reg(hits, killSwitch, "kill-switch");

    // ------------------------------------------------------- reel, tray, roller, tether
    const reel = group(g, -1.8, 0.47, 1.4);
    for (const x of [-0.35, 0.35]) { const d = cyl(reel, 0.5, 0.5, 0.04, x, 0.55, 0, 0x2f4f6f, { rough: 0.5, metal: 0.4, seg: 20 }); d.rotation.z = Math.PI / 2; }
    const drum = cyl(reel, 0.3, 0.3, 0.7, 0, 0.55, 0, 0xf2c14b, { rough: 0.8, seg: 20 });
    drum.rotation.z = Math.PI / 2;
    for (const x of [-0.45, 0.45]) box(reel, 0.06, 0.6, 0.4, x, 0.3, 0, 0x2b3138, { rough: 0.6, metal: 0.5 });
    holoTag(reel, "tether reel", 0, 1.25, 0, { css: CDRV_CSS, w: 0.24 });
    const brake = group(reel, 0.5, 0.75, 0.2);
    const brakeLever = box(brake, 0.03, 0.3, 0.03, 0, 0.15, 0, 0xd2312b, { rough: 0.5 });
    brakeLever.rotation.x = 0.6;
    holoTag(brake, "reel brake", 0.2, 0.35, 0, { css: CDRV_CSS, w: 0.22 });
    reg(hits, brake, "reel-brake");
    const tetherEnd = group(g, -1.1, 0.75, 1.0);
    cyl(tetherEnd, 0.03, 0.03, 0.14, 0, 0, 0, 0x8a949d, { rough: 0.35, metal: 0.8, seg: 10 }).rotation.x = Math.PI / 2;
    hose(tetherEnd, [[0, 0, -0.07], [-0.3, -0.1, 0.1], [-0.7, -0.2, 0.4]], 0.014, 0xf2c14b, { steps: 6, rough: 0.8 });
    holoTag(tetherEnd, "tether from the reel", 0, 0.24, 0, { css: CDRV_CSS, w: 0.4 });
    reg(hits, tetherEnd, "tether-end");
    const tray = group(g, -0.4, 0.47, 1.5);
    box(tray, 1.0, 0.04, 0.7, 0, 0.02, 0, 0x3a4148, { rough: 0.7, metal: 0.4 });
    for (const [x, z, w, d] of [[0, -0.34, 1.0, 0.03], [0, 0.34, 1.0, 0.03], [-0.49, 0, 0.03, 0.7], [0.49, 0, 0.03, 0.7]]) box(tray, w, 0.2, d, x, 0.1, z, 0x3a4148, { rough: 0.7, metal: 0.4 });
    torus(tray, 0.3, 0.01, 0, 0.22, 0, CDRV_ACCENT, { emissive: CDRV_ACCENT, ei: 1.4, rough: 0.4, cast: false, seg: 6, seg2: 24 }).rotation.x = Math.PI / 2;
    holoTag(tray, "flake tray", 0, 0.5, 0, { css: CDRV_CSS, w: 0.22 });
    reg(hits, tray, "flake-tray");
    const flaked = group(tray, 0, 0.06, 0);
    for (let i = 0; i < 3; i++) for (const sx of [-0.22, 0.22]) torus(flaked, 0.2, 0.014, sx, i * 0.03, 0, 0xf2c14b, { rough: 0.8, seg: 6, seg2: 18 }).rotation.x = Math.PI / 2;
    flaked.visible = false;
    const bightHit = box(tray, 0.9, 0.4, 0.6, 0, 0.3, 0, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(tray, "step into the flake?", 0.4, 0.7, 0, { css: "#d2312b", w: 0.4 });
    reg(hits, bightHit, "stand-in-tether");
    const roller = group(g, -0.6, 1.47, -1.55);
    const rollerBody = cyl(roller, 0.07, 0.07, 0.4, 0, 0, 0, 0x2b3138, { rough: 0.5, metal: 0.4, seg: 14 });
    rollerBody.rotation.z = Math.PI / 2;
    for (const x of [-0.22, 0.22]) box(roller, 0.03, 0.2, 0.1, x, 0, 0, 0x5b6771, { rough: 0.5, metal: 0.6 });
    holoTag(roller, "roller — pay out", 0, 0.28, 0, { css: CDRV_CSS, w: 0.34 });
    reg(hits, roller, "tether-payout");
    const marks = group(g, -0.1, 1.47, -1.5);
    for (let i = 0; i < 5; i++) box(marks, 0.05, 0.02, 0.05, -0.2 + i * 0.1, 0, 0, i % 2 ? 0x1b1e22 : 0xf2c14b, { rough: 0.6 });
    const markPointer = box(marks, 0.012, 0.06, 0.012, 0, 0.05, 0, 0xd2312b, { rough: 0.4 });
    holoTag(marks, "tether marks", 0, 0.16, 0, { css: CDRV_CSS, w: 0.28 });
    reg(hits, marks, "tether-marks");
    const wrapHit = box(g, 0.3, 0.3, 0.3, -1.2, 1.3, -1.3, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "wrap it round your hand?", -1.2, 1.6, -1.3, { css: "#d2312b", w: 0.44 });
    reg(hits, wrapHit, "wrap-tether-hand");
    const feelSlack = group(g, -0.6, 1.2, -1.2);
    torus(feelSlack, 0.1, 0.008, 0, 0, 0, CDRV_ACCENT, { emissive: CDRV_ACCENT, ei: 1.2, rough: 0.4, cast: false, seg: 6, seg2: 16 });
    holoTag(feelSlack, "feel it come free — take in", 0, 0.16, 0, { css: CDRV_CSS, w: 0.5 });
    reg(hits, feelSlack, "feel-slack");
    const tetherOut = hose(g, [[-0.6, 1.47, -1.6], [-0.9, 0.9, -2.2], [-1.4, 0.1, -2.8], [-1.9, 0.05, -3.2]], 0.014, 0xf2c14b, { steps: 12, rough: 0.8 });
    tetherOut.visible = false;
    const tetherSnag = hose(g, [[-1.9, 0.05, -3.2], [-2.3, 0.3, -3.0], [-2.6, 0.5, -3.4]], 0.014, 0xf2c14b, { steps: 6, rough: 0.8 });
    tetherSnag.visible = false;
    const surfaceRing = group(g, -0.2, 0.05, -2.6);
    torus(surfaceRing, 0.45, 0.012, 0, 0, 0, CDRV_ACCENT, { emissive: CDRV_ACCENT, ei: 1.4, rough: 0.4, cast: false, seg: 6, seg2: 26 }).rotation.x = Math.PI / 2;
    holoTag(surfaceRing, "vehicle at the surface — hold snug", 0, 0.6, 0, { css: CDRV_CSS, w: 0.56 });
    reg(hits, surfaceRing, "surface-ring");
    const wake = group(g, 1.6, 0.03, -4.2);
    for (let i = 0; i < 4; i++) torus(wake, 0.3 + i * 0.25, 0.012, 0, 0, 0, 0xdfeef2, { rough: 0.3, emissive: 0x9ac0c8, ei: 0.5, cast: false, seg: 6, seg2: 22 }).rotation.x = Math.PI / 2;
    wake.visible = false;

    // ------------------------------------------------------- console, log, board, rinse
    const console_ = group(g, 2.4, 0.47, 1.6);
    box(console_, 1.0, 0.8, 0.5, 0, 0.4, 0, 0x2b3138, { rough: 0.6, metal: 0.4 });
    const monitor = box(console_, 0.7, 0.45, 0.06, 0, 1.05, -0.1, 0x1b1e22, { rough: 0.5 });
    monitor.rotation.x = -0.2;
    const screen = decal(console_, 0.62, 0.38, 0, 1.05, -0.06, (cx, w, h) => {
      cx.fillStyle = "#0b2a30"; cx.fillRect(0, 0, w, h);
      cx.fillStyle = "#e6f6ea"; cx.font = `${Math.round(h * 0.14)}px Arial, sans-serif`; cx.fillText("ROV CAM — no picture", w * 0.06, h * 0.2);
    }, { px: 192, glow: true, ei: 0.6 });
    screen.rotation.x = -0.2;
    holoTag(console_, "pilot's console · lights · camera", 0, 1.5, 0, { css: CDRV_CSS, w: 0.56 });
    reg(hits, screen, "lights-camera");
    for (const x of [-0.25, 0.25]) box(console_, 0.06, 0.12, 0.06, x, 0.86, 0.15, 0x1b1e22, { rough: 0.6 });
    const plan = decal(console_, 0.3, 0.22, -0.3, 0.83, 0.26, paperFace("ROV PLAN", ["Working side: per plan", "Diver side: held clear", "Hold: supervisor's word"], { bg: "#fdf3e6", band: "#c9401a" }), { px: 160 });
    reg(hits, plan, "rov-plan");
    const intercom = group(console_, 0.4, 0.86, 0.2);
    box(intercom, 0.1, 0.06, 0.08, 0, 0, 0, 0x3a4148, { rough: 0.6 });
    torus(intercom, 0.09, 0.008, 0, 0.05, 0, CDRV_ACCENT, { emissive: CDRV_ACCENT, ei: 1.2, rough: 0.4, cast: false, seg: 6, seg2: 16 }).rotation.x = Math.PI / 2;
    holoTag(intercom, "intercom — pilot · supervisor", 0, 0.3, 0, { css: CDRV_CSS, w: 0.52 });
    reg(hits, intercom, "console-intercom");
    const reversePath = group(console_, 0, 0.86, 0.15);
    holoTag(reversePath, "pilot: back along the track", 0, 0.12, 0.3, { css: CDRV_CSS, w: 0.5 });
    reg(hits, reversePath, "reverse-path");
    const rinse = group(g, 1.6, 0.47, 2.3);
    const rinseWheel = valveWheel(rinse, 0, 0.1, 0, { r: 0.06, color: 0x2f8f5a, body: 0x2f4f6f });
    rinseWheel.scale.set(0.7, 0.7, 0.7);
    hose(rinse, [[0, 0.2, 0], [-0.3, 0.3, -0.5], [-0.8, 0.5, -1.2]], 0.018, 0x2f8f5a, { steps: 8, rough: 0.7 });
    holoTag(rinse, "rinse hose · inspect · tag", 0, 0.45, 0, { css: CDRV_CSS, w: 0.5 });
    reg(hits, rinse, "rinse-hose");
    const table = group(g, -2.6, 0.47, 2.3);
    box(table, 0.8, 0.06, 0.5, 0, 0.8, 0, 0x5b4a3a, { rough: 0.8 });
    for (const [lx, lz] of [[-0.35, -0.2], [0.35, -0.2], [-0.35, 0.2], [0.35, 0.2]]) cyl(table, 0.022, 0.022, 0.8, lx, 0.4, lz, 0x3a4148, { rough: 0.6, metal: 0.4, seg: 6 });
    const log = decal(table, 0.34, 0.24, 0, 0.84, 0, paperFace("ROV LOG", ["Checks · faults ____", "Launch · recovery ____", "Snag · wake ____"], { bg: "#f3efe4", band: CDRV_CSS }), { px: 160 });
    log.rotation.x = -Math.PI / 2;
    holoTag(table, "ROV log · dive record", 0, 1.1, 0, { css: CDRV_CSS, w: 0.42 });
    reg(hits, log, "rov-log");
    const team = decal(g, 0.6, 0.4, 0.4, 1.35, 2.75, (cx, w, h) => {
      cx.fillStyle = "#101c27"; cx.fillRect(0, 0, w, h); cx.fillStyle = "#59c97b"; cx.fillRect(0, 0, w, 6);
      cx.font = `600 ${Math.round(h * 0.15)}px 'Barlow Condensed', Arial, sans-serif`; cx.textAlign = "left"; cx.textBaseline = "middle";
      cx.fillStyle = "#e6f6ea"; cx.fillText("ROV · DIVE TEAM", w * 0.06, h * 0.22);
      cx.font = `${Math.round(h * 0.11)}px Arial, sans-serif`; cx.fillStyle = "#f4f8fb";
      ["Pilot · ROV tender", "Supervisor · Diver · Tender", "Sides: per the plan"].forEach((l, i) => cx.fillText(l, w * 0.06, h * (0.46 + i * 0.18)));
    }, { px: 256, glow: true, ei: 0.6 });
    team.rotation.y = Math.PI;
    box(g, 0.66, 0.46, 0.04, 0.4, 1.35, 2.78, 0x2b3138, { rough: 0.6 });
    reg(hits, team, "team-board");

    // ------------------------------------------------------- crew, workboat, diver's side
    const pilot = standingFigure(g, 2.4, 0.7, { ry: Math.PI, cloth: 0x2b3138, vest: 0xf06a2b, cap: 0x1f3a52 });
    pilot.position.y = 0.47;
    holoTag(pilot, "ROV pilot", 0, 1.95, 0, { css: CDRV_CSS, w: 0.22 });
    const supervisor = standingFigure(g, -3.0, 0.2, { ry: 2.6, cloth: 0x2b3138, vest: 0xf06a2b, cap: 0x1f3a52 });
    supervisor.position.y = 0.47;
    holoTag(supervisor, "dive supervisor", 0, 1.95, 0, { css: CDRV_CSS, w: 0.3 });
    const boat = workboat(g, 3.4, -0.45, -4.6, { ry: Math.PI / 2 + 0.2, livery: { colour: 0xd9dde0, fleetName: "BAY WORKS", unitNumber: "WB-6" } });
    void boat;
    const bubbles = group(g, 5.2, 0.06, -5.0);
    for (let i = 0; i < 5; i++) ball(bubbles, 0.04 + i * 0.01, (i % 2) * 0.1, 0.02 * i, i * 0.08, 0xdff4f6, { rough: 0.1, opacity: 0.6, transparent: true, cast: false, seg: 6, seg2: 4 });
    holoTag(g, "diver's side — hold clear", 5.2, 0.9, -5.0, { css: CDRV_CSS, w: 0.46 });
    const flyHit = box(g, 0.4, 0.4, 0.4, 3.0, 1.0, -1.2, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "swing round to look at the diver?", 3.0, 1.35, -1.2, { css: "#d2312b", w: 0.58 });
    reg(hits, flyHit, "fly-to-diver");
    for (let i = 0; i < 5; i++) box(g, 0.5, 0.08, 0.14, -1.3 + i * 0.16, 0.5, 0.4, 0xe8b02e, { rough: 0.7 });
    for (const x of [-2.2, 2.9]) { cyl(g, 0.1, 0.12, 0.45, x, 0.7, 2.6, 0x2b3138, { rough: 0.5, metal: 0.5, seg: 12 }); ball(g, 0.12, x, 0.95, 2.6, 0x2b3138, { rough: 0.5, metal: 0.5, seg: 10, seg2: 8 }); }
    const tag = decal(g, 0.12, 0.08, 0.9, 1.1, 0.5, paperFace("OUT OF SERVICE", ["float · termination"], { bg: "#f2c14b", band: "#d2312b" }), { px: 96 });
    tag.visible = false;

    const waterTex = water.material.map;
    let inWater = false;

    return {
      hits,
      spawnLook: new THREE.Vector3(0.2, 1.0, -0.6),
      onStep() {},
      onStepComplete(step) {
        if (step.id === "pre-dive-checks") { crack.material = mat(0x59c97b, { rough: 0.6 }); term.children[0].rotation.x = 0; }
        if (step.id === "function-test") { repaint(screen, (cx, w, h) => { cx.fillStyle = "#0b3a40"; cx.fillRect(0, 0, w, h); cx.fillStyle = "#59c97b"; cx.fillRect(w * 0.1, h * 0.5, w * 0.8, h * 0.1); cx.fillStyle = "#e6f6ea"; cx.font = `${Math.round(h * 0.14)}px Arial, sans-serif`; cx.fillText("ROV CAM — picture good", w * 0.06, h * 0.2); }); if (parts.lights) parts.lights.children?.forEach?.((l) => l.children?.forEach?.((m) => { if (m.material) m.material = mat(0xfff1c0, { emissive: 0xfff1c0, ei: 1.6 }); })); }
        if (step.id === "tether-flake") { flaked.visible = true; tetherEnd.position.set(-0.4, 0.62, 1.5); }
        if (step.id === "launch-lower") { vehicle.position.set(-0.2, 0.0, -2.6); hook.position.set(-0.2, 0.9, -2.6); wire.visible = false; inWater = true; }
        if (step.id === "tether-payout") { tetherOut.visible = true; vehicle.position.set(-1.9, -0.6, -3.2); }
        if (step.id === "snag-drill") { tetherSnag.visible = false; brakeLever.rotation.x = 0.6; }
        if (step.id === "read-marks") markPointer.material = mat(0x59c97b, { rough: 0.4 });
        if (step.id === "recovery-call") { vehicle.position.set(-0.2, 0.0, -2.6); tetherOut.visible = false; }
        if (step.id === "hook-on") hook.position.set(-0.2, 1.2, -2.6);
        if (step.id === "recover-hoist") { vehicle.position.copy(vehicleHome); hook.position.set(0.6, 1.4, 0.0); wire.visible = true; inWater = false; }
        if (step.id === "post-dive-inspect") tag.visible = true;
        if (step.id === "rov-log") repaint(log, paperFace("ROV LOG", ["Float · termination tagged", "Launch · recovery: timed", "Snag at pile · wake noted"], { bg: "#e6f6ea", band: "#59c97b" }));
      },
      onHazard() {},
      onInterrupt(it) {
        if (it.id === "skiff-wake") { wake.visible = true; vehicle.position.set(-1.4, 0.0, -3.0); }
        if (it.id === "tether-snag") { tetherSnag.visible = true; brakeLever.rotation.x = 0.6; }
      },
      onInterruptEnd(it) {
        if (it.id === "skiff-wake") { wake.visible = false; if (it.resolved === "answered") vehicle.position.set(-0.2, 0.0, -2.4); }
        if (it.id === "tether-snag" && it.resolved === "answered") brakeLever.rotation.x = -0.4;
      },
      animate(t, dt, session) {
        const step = session?.step;
        if (waterTex?.offset) { waterTex.offset.x = t * 0.004; waterTex.offset.y = t * 0.005; }
        if (session?.turn && (step?.id === "launch-lower" || step?.id === "recover-hoist")) winchWheel.userData.wheel.rotation.y = session.turn.amount * Math.PI * 2;
        const gg = session?.gauge;
        if (gg && !gg.committed && step?.id === "read-marks") markPointer.position.x = -0.2 + gg.t * 0.4;
        if (step?.id === "tether-payout" && session.holding) { rollerBody.rotation.x += (dt ?? 0.016) * 3 * (session.track?.v ?? 0); drum.rotation.x += (dt ?? 0.016) * (session.track?.v ?? 0); }
        if (inWater && !wake.visible) vehicle.position.y = (vehicle.position.y < -0.3 ? vehicle.position.y : 0.0 + Math.sin(t * 1.5) * 0.04);
        if (wake.visible) wake.scale.setScalar(1 + (t * 1.5) % 1);
        bubbles.position.y = 0.06 + ((t * 0.5) % 0.3);
      },
    };
  },
};
