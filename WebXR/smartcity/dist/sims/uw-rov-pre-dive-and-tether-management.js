import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import { box, cyl, ball, torus, hose, group, decal, repaint, signFace, paperFace, mat } from "../../../shared/kit.js";
import { CITY, holoPanel, holoTag, reg, surfaceTexture, texturedMat, siltFace } from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ ROV Pre-Dive & Tether Management VR — Bay Area Union Edition,
// marine and water pack, on the bay-underwater district.
//
// A small inspection-class ROV on its own tether at a Bay worksite: the
// thruster shroud checked and bolted on before any power is called, the
// tether's strain relief and drag set, the trim gauge read for neutral
// buoyancy, the camera's white balance checked, a guideline flown out over an
// exposed rebar cage and a snagged ghost net, and the vehicle recalled and
// docked. The learner is a Pile Drivers Local 34 commercial diver
// cross-trained to fly the ROV from the stage; the supervisor is on the
// comms, the tender minds both the ROV's tether and the diver's umbilical,
// and a standby diver is dressed to recover the vehicle by hand if it fouls.
// Depth, gas, bottom time and decompression are never written as numbers:
// they are per the dive plan and the tables the supervisor holds.

const UROV_ACCENT = 0x4fc3e8;
const UROV_CSS = "#4fc3e8";

/** The HUD's comms face, repainted when the supervisor reads back. */
function urovCommsFace(lines, band = UROV_CSS) {
  return (cx, w, h) => {
    cx.fillStyle = "rgba(6,18,24,0.9)"; cx.fillRect(0, 0, w, h); cx.fillStyle = band; cx.fillRect(0, 0, w, 6);
    cx.font = `600 ${Math.round(h * 0.15)}px 'Barlow Condensed', Arial, sans-serif`; cx.textAlign = "left"; cx.textBaseline = "middle";
    cx.fillStyle = "#d8f0f8"; cx.fillText("HELMET COMMS", w * 0.06, h * 0.22);
    cx.font = `${Math.round(h * 0.11)}px Arial, sans-serif`; cx.fillStyle = "#eaf6fb";
    lines.forEach((l, i) => cx.fillText(l, w * 0.06, h * (0.5 + i * 0.2)));
  };
}

/** The topside video monitor's face: a live picture, or dead air on a freeze. */
function urovMonitorFace(lines, live = true) {
  return (cx, w, h) => {
    cx.fillStyle = live ? "rgba(8,26,20,0.92)" : "rgba(4,4,4,0.96)"; cx.fillRect(0, 0, w, h);
    cx.fillStyle = live ? "#3ac97b" : "#8a2a2a"; cx.fillRect(0, 0, w, 6);
    if (!live) {
      cx.fillStyle = "#2a2a2a";
      for (let i = 0; i < 40; i++) cx.fillRect(Math.random() * w, Math.random() * h, 3, 3);
    }
    cx.font = `600 ${Math.round(h * 0.15)}px 'Barlow Condensed', Arial, sans-serif`; cx.textAlign = "left"; cx.textBaseline = "middle";
    cx.fillStyle = live ? "#e6faf0" : "#f8d8d8"; cx.fillText(live ? "ROV VIDEO" : "NO SIGNAL", w * 0.06, h * 0.22);
    cx.font = `${Math.round(h * 0.11)}px Arial, sans-serif`; cx.fillStyle = "#f4f8fb";
    lines.forEach((l, i) => cx.fillText(l, w * 0.06, h * (0.5 + i * 0.2)));
  };
}

export const SIM_UW_ROV_PRE_DIVE_AND_TETHER_MANAGEMENT = {
  id: "uw-rov-pre-dive-and-tether-management",
  index: "352",
  domain: "Maritime & Ports",
  trade: "ROV technician, a Pile Drivers Local 34 commercial diver cross-trained to fly a small inspection-class ROV on its own tether at a Bay worksite, with a tender minding the ROV's tether and the diver's umbilical, a supervisor on the comms and a standby diver dressed to recover the vehicle by hand",
  category: "Maritime & Ports",
  district: "bay-underwater",
  weather: "clear",
  underwater: {
    depthLabel: "Per dive plan",
    bottomTimeSeconds: 600,
  },
  certification: "Pile Drivers Local 34 commercial diver training under the UBC International Training Fund, cross-trained to field a tethered inspection ROV; OSHA 29 CFR 1910 Subpart T commercial diving operations — 29 CFR 1910.421 pre-dive procedures (equipment inspection and the team briefing) and 29 CFR 1910.422 procedures during the dive (communications) as they govern the dive team fielding the vehicle; ADCI International Consensus Standards for Commercial Diving and Underwater Operations; USCG 46 CFR 197 Subpart B where the work is worked from a vessel; depth, gas, bottom time and decompression per the dive plan and the tables the supervisor holds",
  name: "ROV Pre-Dive & Tether Management",
  title: simTitle("ROV Pre-Dive & Tether Management"),
  tagline: "Before the vehicle ever swims: splash reported, the loose shroud bolt and the chafed tether found, the loose line coiled and the tool bag clipped off before the shroud goes on, the drag set on the reel, the trim gauge read neutral, the white card held for the camera, power called only once the shroud is on, the guideline flown out past a rebar cage and a ghost net while the tether snags and the picture freezes, position held for the tender's payout, and the vehicle recalled, docked and logged",
  accent: UROV_ACCENT,
  accentCss: UROV_CSS,
  parSeconds: 300,
  footprint: 2.6,
  badge: { id: "shroud-on-tether-clean", name: "Shroud On, Tether Clean", note: "The shroud bolted on before any call for power, the tether never flown over a snag, nothing carried by hand, and never flown on a frozen picture" },

  supportLine: "your union hall's member assistance programme — Pile Drivers Local 34 — with the employer's employee assistance line behind it",

  game: system({
    name: "ROV Pre-Dive",
    currency: "SPOOL",
    ranks: ["ROV Tender", "ROV Technician", "ROV Pilot", "Lead ROV Pilot", "ROV Pre-Dive Certified"],
    badges: [
      { id: "shroud-first", name: "Shroud First", note: "Thruster shroud bolted on and checked before any call for power", test: AWARD.stepClean("secure-shroud") },
      { id: "trim-true", name: "Trim True", note: "The ballast trim gauge read in the neutral band first time", test: AWARD.precise(0.7) },
      { id: "clean-transect", name: "Clean Transect", note: "Never a shroud left off, never the tether flown over a snag, never a tool carried by hand, never flown on a frozen picture", test: AWARD.safe },
    ],
    challenges: [
      { id: "clean-launch", name: "Clean Launch", note: "No corrections from the splash report to the recall", test: AWARD.clean },
      { id: "steady-transect", name: "Steady Transect", note: "The guideline flown in band the whole way", test: AWARD.unbroken },
      { id: "recalled-in-time", name: "Recalled In Time", note: "The vehicle docked and logged inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "power-no-shroud": "You called for power with the thruster shroud still sitting unbolted on the stage. The shroud is what keeps fingers, drifting line and the tether's own loops out of a spinning prop, and a vehicle powered up with it off turns the first loose loop near the stern into a jam or a cut line. The shroud goes on and is checked before anyone calls for power, not after.",
    "tether-over-rebar": "You flew the vehicle straight across the exposed rebar cage instead of round it. The tether trails behind the ROV as it swims, and a straight line over a snag drapes the tether across the rebar on the way out; the next turn draws it tight and the tender feels a tether that will not pay out cleanly, or worse, one that has to be cut. Fly wide of anything that can catch the tether — going round costs seconds, going through costs the dive.",
    "carry-tool-by-hand": "You picked up the spare prop tool to carry it up to the stage instead of clipping it to the downline. A tool carried loose in a fouled or startled hand becomes a falling object nobody below can see coming, and on a transect that is exactly where the camera is pointed and the tender's hands are busy. Everything that is not clipped to the downline stays on the stage until it is.",
    "fly-blind-signal-loss": "You kept flying the vehicle forward when the video feed broke up into blocks and froze. A pilot who keeps flying on a broken picture is steering blind into whatever is ahead of the vehicle — a pile, a crossing line, another diver — while the tether keeps paying out the whole time on a course nobody can see. When the picture goes, you stop and hold position until it clears or the dive is ended.",
  },

  lateNotes: {
    "camera-panel": "The white balance is checked once the vehicle has power and its lights are lit — not on a dark lens.",
    "guide-line": "The guideline is flown once the trim gauge reads neutral — not before the vehicle is proven to hover level.",
    "hold-for-payout": "Position is held for the tender's payout once the route hazards have been found and marked.",
  },

  steps: [
    {
      id: "report-splash", kind: "select", target: "rov-comms",
      title: "Report the splash and start the function check",
      cue: "Call the supervisor: vehicle designator, splashed and on the stage, starting the pre-dive function check before anything is powered.",
      why: "The supervisor at the panel can see the tether's spool count but not the vehicle itself, and the splash report is how the surface learns the check is starting and the vehicle is still on the stage, not yet in the water column. It is also the comms check that proves the voice circuit works before the ROV goes anywhere on its own tether, so a lost signal later is a real fault, not an unproven line.",
    },
    {
      id: "visual-precheck", kind: "find", noHint: true,
      targets: ["shroud-bolt-loose", "tether-chafe-mark"],
      itemNames: { "shroud-bolt-loose": "thruster shroud bolt sitting loose in its hole", "tether-chafe-mark": "chafed patch on the tether near the strain relief" },
      itemNotes: {
        "shroud-bolt-loose": "One of the four bolts holding the thruster shroud is barely started, the shroud rocking free on that corner.",
        "tether-chafe-mark": "A worn bright patch on the tether's jacket a hand's width from the strain-relief cone, where it has been riding against a stage rail.",
      },
      title: "Find what needs fixing before anything is powered",
      cue: "Walk the vehicle and the tether by eye before touching a switch: the shroud bolts, the strain relief, the thruster ports, the camera dome.",
      why: "A function check exists to find the fault on the stage, in the light, with both hands free — not on the transect with the vehicle in the water and the tender feeling something wrong on the spool. A loose shroud bolt and a chafed tether are exactly the two faults that turn into an entanglement or a parted tether once the vehicle is swimming, and both are fixed in a minute here.",
    },
    {
      id: "stow-tools-then-clip", kind: "sequence",
      targets: ["coil-line", "clip-toolbag"],
      itemNames: { "coil-line": "loose line on the stage coiled and stowed", "clip-toolbag": "spare-parts bag clipped to the downline" },
      title: "Coil the loose line, then clip the tool bag to the downline",
      cue: "Coil the stray line lying on the stage deck first, then clip the spare-parts bag onto the downline's travelling clip.",
      why: "A stage with loose line and an unclipped bag on it is a stage the vehicle has to lift off of, and either one can catch a skid or a thruster on the way up. The line is coiled first because a bag clipped over a loose line just traps the line under it; only once the deck is clear does the bag go on the downline, where it goes up and down with the stage instead of by hand.",
      outOfOrderNote: "Out of order — coil the loose line off the deck first, then clip the bag to the downline; clipping the bag over loose line just traps it.",
    },
    {
      id: "secure-shroud", kind: "drag", target: "shroud-panel",
      title: "Bolt the thruster shroud onto its mount",
      cue: "Take the shroud panel off the rack and seat it onto the thruster mount, square to the ring, before it is bolted up.",
      why: "The shroud is the one part of the vehicle that stands between a spinning prop and whatever drifts, floats or trails near the stern — line, a diver's glove, the tether's own bight. It is seated square to the mount and bolted up before the vehicle is powered, because a shroud fitted after the call for power is a shroud fitted next to a live thruster.",
      drag: { to: "shroud-mount", radius: 0.5, missNote: "Not seated on the mount — the shroud has to sit square on the thruster ring before it is bolted." },
    },
    {
      id: "set-tether-drag", kind: "turn", target: "tether-drag-knob",
      title: "Set the tether reel's drag",
      cue: "Turn the reel's drag knob until the tether pays out under a steady hand tension — not so loose it free-spools, not so tight it drags the vehicle back.",
      why: "The drag is what keeps the tether from piling up in loose loops that catch on everything, or from going so stiff it hauls the vehicle off its line the moment it turns. Set once on the stage before the transect, it is the difference between a tether the tender can feel and manage and one that either buries itself in slack or fights the pilot the whole way out.",
      turn: { turns: 0.6, label: "TETHER DRAG", readout: (t) => (t < 0.3 ? "too loose — free-spooling" : t < 0.8 ? "coming onto steady drag" : "steady drag, set") },
    },
    {
      id: "trim-check", kind: "gauge", target: "trim-gauge",
      title: "Read the trim gauge for neutral buoyancy",
      cue: "Watch the trim gauge as the ballast settles and commit the reading once the needle holds in the neutral band.",
      why: "A vehicle trimmed heavy fights its own thrusters to hold depth and burns power it needs for the transect; trimmed light, it noses up and drags the tether across whatever is over it. Neutral trim, read and confirmed on the stage before flight, is what lets the pilot hold a level track over the guideline instead of fighting pitch the whole way out.",
      gauge: { label: "TRIM", speed: 0.7, green: [0.42, 0.6], readout: (t) => (t < 0.42 ? "heavy — nose down" : t <= 0.6 ? "neutral — holding level" : "light — nose up") },
    },
    {
      id: "camera-check", kind: "hold", target: "camera-panel", seconds: 4,
      title: "Hold the white card for the camera's white balance",
      cue: "Hold the calibration card square in front of the camera dome and keep it steady while the supervisor sets the white balance from topside.",
      why: "Bay water shifts everything the camera sees toward green, and a picture set up on the wrong white balance reads a sound weld as corroded or a clean patch as stained; the card gives the camera one true white to set against before anything on the transect is judged by its colour. Holding it steady matters because a card that drifts out of frame partway through leaves the calibration only half done.",
      holdBreakNote: "The card moved out of frame before the calibration finished — hold it square to the lens until the supervisor confirms.",
    },
    {
      id: "call-for-power", kind: "select", target: "power-switch-call",
      title: "Call topside for power once the shroud is on",
      cue: "With the shroud bolted and the check complete, call 'power on' and wait to hear it back from the tender at the panel.",
      why: "The vehicle's thrusters only turn once topside answers this call, and the call is made deliberately, after the shroud and the pre-check, not as a reflex once the stage looks ready. Waiting to hear the answer back matters as much as the call itself — a power call nobody acknowledged is a thruster state nobody actually knows.",
    },
    {
      id: "fly-guideline", kind: "track", target: "guide-line", seconds: 6,
      title: "Fly the guideline at a level altitude",
      cue: "Fly the vehicle out along the guideline holding a steady altitude off the bottom — not so low the skids drag silt, not so high the camera loses the line.",
      why: "The transect is only useful if the vehicle holds a level, steady altitude the whole way, because a track that porpoises up and down misses whatever sits just above or below its camera's line of sight. Too low and the thrusters stir the silt into the same cloud a diver's fins would raise; too high and the guideline itself drops out of frame, and the pilot is flying on the tether's feel instead of the picture.",
      track: { start: 0.14, green: [0.42, 0.6], rise: 0.56, fall: 0.46, drift: 0.12, label: "ALTITUDE OFF BOTTOM", readout: (v) => (v < 0.42 ? "too low — skids in the silt" : v > 0.6 ? "too high — losing the line" : "level and on the line") },
      holdBreakNote: "The altitude broke out of band — too low into the silt or too high off the line. Settle back onto the guideline and hold it level.",
    },
    {
      id: "route-hazards", kind: "find", noHint: true,
      targets: ["rebar-cage", "ghost-net-snag"],
      itemNames: { "rebar-cage": "exposed rebar cage crossing the route", "ghost-net-snag": "derelict net snagged on an old pile stub" },
      itemNotes: {
        "rebar-cage": "A cage of bent reinforcing bar standing proud of the silt right across the guideline's path — a tether snag and a hull scrape both.",
        "ghost-net-snag": "A tangle of derelict netting caught on a pile stub just off the line, billowing in the current and reaching for anything that swims close.",
      },
      title: "Find the snags along the route before flying past them",
      cue: "Watch ahead of the vehicle for anything that could catch the tether or the shroud: rebar, netting, cable, anything standing up off the bottom.",
      why: "The whole point of flying wide of a snag is knowing it is there before the tether is already past it, and a route hazard spotted early is one the pilot can fly around with room to spare. Both of these are logged for the next transect too, because the same rebar and the same net will be exactly where they are the next time a vehicle or a diver comes down this line.",
    },
    {
      id: "hold-for-payout", kind: "hold", target: "hold-for-payout", seconds: 5,
      title: "Hold position while the tender pays out slack",
      cue: "Hold the vehicle steady at the far end of the guideline while the tender pays out fresh tether for the return leg — do not drift off the line.",
      why: "The tender manages the tether by feel, and that only works if the vehicle holds still while slack is paid out; a pilot who keeps flying during the payout gives the tender a moving target and a tether that comes out uneven, bunched in one place and taut in another. Holding here is the same discipline as a diver holding for a read-back — the surface crew's half of the job only works if your half stays still.",
      holdBreakNote: "You drifted off the line during the payout — the tender lost the feel of the tether. Come back onto the guideline and hold still again.",
    },
    {
      id: "recall-rov", kind: "drag", target: "rov-body",
      title: "Recall the vehicle and dock it on the stage",
      cue: "Fly the vehicle back along the guideline and set it down onto the stage dock, skids square to the marks.",
      why: "The vehicle is flown back the way it came so the tether pays back in over ground it has already crossed clean, rather than cutting a new path that could find a snag the outbound leg missed. Docked square on the marks, it sits stable for the shutdown and the next team's launch, instead of teetering on one skid at the stage edge.",
      drag: { to: "stage-dock", radius: 0.5, missNote: "Not docked — bring the vehicle back along the guideline and set it square on the stage marks." },
    },
    {
      id: "report-findings", kind: "select", target: "rov-comms",
      title: "Report the transect findings to the supervisor",
      cue: "Tell the supervisor: the shroud bolt and the chafed tether found and fixed, the rebar cage and the net logged, and the picture that froze mid-transect.",
      why: "The dive log and the next crew's brief are both written from what gets reported now, while the pilot can still describe exactly where the rebar sits and how long the picture was out. A fault found and fixed on the stage still belongs in the report, because the next tech checking this vehicle needs to know that shroud bolt has worked loose before.",
    },
    {
      id: "check-in-secure", kind: "select", target: "stage-checkin",
      title: "Check in and secure the vehicle",
      cue: "With the vehicle shut down and clipped to the stage, tell the supervisor how the transect went — the snag on the tether and the frozen picture — and wait for the call to strike the gear.",
      why: "Powering the vehicle down and clipping it off is only half of securing it; the other half is the pilot saying out loud how the dive actually went. A tether that snagged and had to be worked free, and a picture that froze while you kept flying blind for a moment before you caught it, are both worth a real answer here, with the Pile Drivers Local 34 member assistance line behind whatever the debrief does not settle.",
    },
  ],

  interrupts: [
    {
      id: "tether-snag-guideline",
      kind: "Tether snags on debris mid-transect",
      after: "fly-guideline", delay: 2, seconds: 14,
      alert: "The tether has caught on something behind the vehicle — you can feel the drag through the reel and the vehicle is being pulled off its line.",
      cue: "Stop the vehicle, ease back to unload the tether, then clear it at the tether-clear point before flying on.",
      target: "tether-clear-point",
      why: "A tether under load from a snag only gets tighter if the vehicle keeps flying forward, and a tether pulled hard enough can part or drag the snag itself into the thrusters. Easing back unloads the line so it can be worked free at the clear point, which is the tender's job as much as the pilot's — the pilot's half is to stop pulling against it the moment the drag is felt.",
      missNote: "You kept flying forward against the snag; the tether came up bar-taut and the tender felt it part at the reel before you ever saw what had caught it.",
      wrongNote: "The tether-clear point — ease back to unload the line and clear it there before flying on.",
    },
    {
      id: "video-freeze",
      kind: "ROV video feed freezes",
      after: "hold-for-payout", delay: 2, seconds: 14,
      alert: "The monitor has frozen on a single frame — no new picture and no answer on the video line.",
      cue: "Call it dead picture on the comms and press the signal reset at the topside panel before flying anywhere.",
      target: "signal-reset",
      why: "A frozen picture looks like a working one until the vehicle moves and the frame does not, and a pilot who trusts a frozen frame is flying on a picture of somewhere the vehicle already left. The signal reset is topside's fix, not the pilot's, so the pilot's job is to say so on the comms and hold still until the reset brings a live picture back.",
      missNote: "You kept the vehicle moving on the frozen frame; by the time the picture caught up, the vehicle had drifted well off the guideline with nobody able to see where.",
      wrongNote: "The signal reset at the topside panel — call it dead picture and wait for a live frame before flying on.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);

    // ------------------------------------------------------- the bottom
    const siltTex = surfaceTexture((cx, w, h) => siltFace(cx, w, h), { px: 256, repeat: 3 });
    const mound = cyl(g, 2.9, 3.3, 0.1, 0, 0.03, -0.4, 0xffffff, { seg: 28, cast: false });
    mound.material = texturedMat(siltTex, { rough: 1, metal: 0, color: 0xb4beac });
    for (const [x, z, r] of [[-2.3, -1.8, 0.2], [2.2, 1.3, 0.15], [0.8, 2.0, 0.12], [-1.3, 2.2, 0.17], [2.6, -2.0, 0.19]]) ball(g, r, x, r * 0.4, z, 0x4a5048, { rough: 1, seg: 8, seg2: 6 }).scale.set(1, 0.5, 0.8);

    // ------------------------------------------------------- the stage
    const stage = group(g, -1.8, 0, -1.0, 0.3);
    box(stage, 1.3, 0.05, 1.3, 0, 0.22, 0, 0x3a4048, { rough: 0.7, metal: 0.5, cast: false });
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) box(stage, 0.06, 1.6, 0.06, sx * 0.6, 0.8, sz * 0.6, 0x8b949d, { rough: 0.5, metal: 0.6, cast: false });
    box(stage, 0.28, 0.24, 0.2, 0.4, 0.35, -0.5, 0x2a3b33, { rough: 0.9, cast: false });

    // ------------------------------------------------------- the ROV itself
    const rov = group(g, -1.8, 0.32, -1.0);
    const hull = box(rov, 0.5, 0.16, 0.32, 0, 0, 0, 0xe8b02e, { rough: 0.6, metal: 0.3 });
    void hull;
    const dome = ball(rov, 0.08, 0.28, 0.02, 0, 0xdff4f2, { rough: 0.1, metal: 0.1, opacity: 0.7, transparent: true, seg: 12, seg2: 10 });
    void dome;
    for (const [x, z] of [[-0.16, 0.18], [0.16, 0.18], [-0.16, -0.18], [0.16, -0.18]]) ball(rov, 0.02, x, 0.09, z, 0xf2f6f8, { emissive: 0xf2f6f8, ei: 1.4, seg: 8, seg2: 6 });
    const thrusterShroudPanel = group(rov, 0, -0.02, -0.24);
    reg(hits, thrusterShroudPanel, "power-no-shroud");
    const noShroudTag = holoTag(rov, "call power — shroud off?", 0, 0.3, -0.24, { css: "#d2312b", w: 0.5 });
    for (let i = 0; i < 4; i++) { const a = i * 1.6; cyl(thrusterShroudPanel, 0.055, 0.055, 0.1, Math.cos(a) * 0.16, 0, Math.sin(a) * 0.16, 0x2b3138, { rough: 0.5, metal: 0.6, seg: 12 }); }
    const shroudBolt = cyl(rov, 0.012, 0.012, 0.02, -0.18, -0.02, -0.35, 0xc0c6cc, { rough: 0.3, metal: 0.8, seg: 8 });
    shroudBolt.rotation.z = 0.5;
    reg(hits, shroudBolt, "shroud-bolt-loose");
    const skids = group(rov, 0, -0.1, 0);
    for (const sx of [-1, 1]) box(skids, 0.03, 0.04, 0.4, sx * 0.22, 0, 0, 0x2b3138, { rough: 0.6, cast: false });
    holoTag(rov, "ROV", 0, 0.42, 0, { css: UROV_CSS, w: 0.16 });
    reg(hits, hull, "rov-body");

    // ------------------------------------------------------- shroud panel (drag) and mount
    const shroudRack = group(g, -0.9, 0.14, -1.4);
    box(shroudRack, 0.22, 0.05, 0.22, 0, 0, 0, 0x2b3138, { rough: 0.5, metal: 0.6 });
    holoTag(shroudRack, "shroud panel", 0, 0.16, 0, { css: UROV_CSS, w: 0.24 });
    reg(hits, shroudRack, "shroud-panel");
    const shroudMountRing = torus(rov, 0.19, 0.012, 0, -0.02, -0.24, UROV_ACCENT, { emissive: UROV_ACCENT, ei: 1.5, rough: 0.4, cast: false, seg: 6, seg2: 20 });
    void shroudMountRing;
    holoTag(rov, "shroud mount", -0.26, 0.05, -0.24, { css: UROV_CSS, w: 0.24 });
    const shroudMountHit = box(rov, 0.24, 0.16, 0.12, 0, -0.02, -0.24, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, shroudMountHit, "shroud-mount");

    // ------------------------------------------------------- tether, reel, chafe, drag knob
    const reel = group(g, -0.5, 0.55, -1.5);
    cyl(reel, 0.11, 0.11, 0.06, 0, 0, 0, 0xe8b02e, { rough: 0.55, seg: 16 }).rotation.x = Math.PI / 2;
    box(reel, 0.03, 0.16, 0.02, 0, -0.12, 0, 0x2b3138, { rough: 0.6 });
    const knob = group(reel, 0.09, 0.02, 0.02);
    cyl(knob, 0.04, 0.04, 0.03, 0, 0, 0, 0x8a949d, { rough: 0.4, metal: 0.6, seg: 12 });
    const knobPin = box(knob, 0.008, 0.05, 0.006, 0, 0.02, 0.02, UROV_ACCENT, { rough: 0.5 });
    holoTag(reel, "tether drag knob", 0, 0.2, 0, { css: UROV_CSS, w: 0.3 });
    reg(hits, knob, "tether-drag-knob");
    const tether = hose(g, [[-0.5, 0.55, -1.5], [-1.0, 0.35, -1.3], [-1.5, 0.28, -1.1], [-1.8, 0.32, -1.0]], 0.02, 0xf2c14b, { steps: 12, rough: 0.7 });
    const chafeMark = box(g, 0.05, 0.02, 0.05, -1.55, 0.28, -1.15, 0xb8862b, { rough: 0.5, emissive: 0x3a2206, ei: 0.3 });
    reg(hits, chafeMark, "tether-chafe-mark");

    // ------------------------------------------------------- loose line, tool bag, downline
    const lineCoil = group(g, -1.1, 0.02, -0.6);
    for (let i = 0; i < 3; i++) torus(lineCoil, 0.1 + i * 0.02, 0.012, 0, i * 0.015, 0, 0xc8b078, { rough: 0.9, seg: 6, seg2: 16 }).rotation.x = Math.PI / 2;
    holoTag(lineCoil, "loose line", 0, 0.18, 0, { css: UROV_CSS, w: 0.22 });
    reg(hits, lineCoil, "coil-line");
    const toolBag = group(g, -0.7, 0.1, -0.5);
    box(toolBag, 0.22, 0.16, 0.14, 0, 0, 0, 0x2f6f4f, { rough: 0.85 });
    holoTag(toolBag, "tool bag", 0, 0.22, 0, { css: UROV_CSS, w: 0.2 });
    reg(hits, toolBag, "clip-toolbag");
    const carryHit = box(g, 0.32, 0.3, 0.28, -0.7, 0.28, -0.5, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "carry it up by hand?", -0.7, 0.5, -0.5, { css: "#d2312b", w: 0.42 });
    reg(hits, carryHit, "carry-tool-by-hand");
    const downline = group(g, -0.4, 0, -1.9);
    box(downline, 0.3, 0.16, 0.3, 0, 0.08, 0, 0x3a3f45, { rough: 0.8, metal: 0.3 });
    cyl(downline, 0.01, 0.01, 6, 0, 3.1, 0, 0xe8dcb8, { rough: 0.8, seg: 6 });
    const dclip = group(downline, 0, 0.9, 0);
    const dclipRing = torus(dclip, 0.1, 0.008, 0, 0, 0, UROV_ACCENT, { emissive: UROV_ACCENT, ei: 1.5, rough: 0.4, cast: false, seg: 6, seg2: 18 });
    void dclipRing;

    // ------------------------------------------------------- trim gauge, camera panel
    const gaugePanel = holoPanel(g, 0.4, 0.28, 0.6, 1.0, -1.4, (cx, w, h) => {
      cx.fillStyle = "rgba(6,18,24,0.9)"; cx.fillRect(0, 0, w, h); cx.fillStyle = UROV_CSS; cx.fillRect(0, 0, w, 6);
      cx.font = `600 ${Math.round(h * 0.16)}px 'Barlow Condensed', Arial, sans-serif`; cx.textAlign = "left"; cx.textBaseline = "middle";
      cx.fillStyle = "#d8f0f8"; cx.fillText("TRIM GAUGE", w * 0.06, h * 0.24);
    }, { ry: -0.4, accent: UROV_ACCENT });
    reg(hits, gaugePanel, "trim-gauge");
    const camPanel = group(g, 0.3, 0.5, -1.1);
    box(camPanel, 0.14, 0.1, 0.02, 0, 0, 0, 0xe8e2d0, { rough: 0.5 });
    holoTag(camPanel, "white card — camera check", 0, 0.16, 0, { css: UROV_CSS, w: 0.4 });
    reg(hits, camPanel, "camera-panel");
    const powerCall = group(g, 0.5, 0.6, -1.5, 0.2);
    box(powerCall, 0.28, 0.11, 0.02, 0, 0, 0, 0x1a3a2a, { rough: 0.5, emissive: 0x1a3a2a, ei: 0.5 });
    holoTag(powerCall, "call 'power on'", 0, 0.14, 0.01, { css: UROV_CSS, w: 0.32 });
    reg(hits, powerCall, "power-switch-call");

    // ------------------------------------------------------- guideline, rebar, net
    const zeroA = group(g, -0.4, 0.5, -0.5);
    const zeroB = group(g, 2.6, 0.5, -0.2);
    const glLen = Math.hypot(3.0, 0.3);
    const guideline = box(g, glLen, 0.006, 0.02, 1.1, 0.5, -0.35, 0xf2e6b8, { rough: 0.6 });
    guideline.rotation.y = Math.atan2(0.3, 3.0);
    void zeroA; void zeroB;
    holoTag(g, "guideline", 1.1, 0.62, -0.35, { css: UROV_CSS, w: 0.22 });
    reg(hits, guideline, "guide-line");
    const rebar = group(g, 0.9, 0, -0.4, 0.3);
    for (const [x, rz] of [[-0.12, 0.3], [0.05, -0.2], [0.2, 0.5]]) { const b = cyl(rebar, 0.014, 0.014, 0.55, x, 0.27, 0, 0x8a4a2a, { rough: 0.8, metal: 0.4, seg: 6 }); b.rotation.z = rz; }
    reg(hits, rebar, "rebar-cage");
    const overRebarHit = box(g, 0.5, 0.6, 0.4, 0.9, 0.5, -0.4, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "fly straight over it?", 0.9, 0.85, -0.4, { css: "#d2312b", w: 0.4 });
    reg(hits, overRebarHit, "tether-over-rebar");
    const stub = group(g, 1.9, 0, -0.15);
    cyl(stub, 0.14, 0.15, 0.5, 0, 0.25, 0, 0x4a4234, { rough: 0.95, seg: 12 });
    const net = group(stub, 0, 0.35, 0.14);
    for (let i = 0; i <= 3; i++) box(net, 0.006, 0.32, 0.006, -0.14 + i * 0.09, 0, 0, 0x6a7a6a, { rough: 0.8, cast: false });
    for (let i = 0; i <= 3; i++) box(net, 0.28, 0.006, 0.006, 0, -0.14 + i * 0.09, 0, 0x6a7a6a, { rough: 0.8, cast: false });
    reg(hits, net, "ghost-net-snag");

    // ------------------------------------------------------- hold marker, comms, monitor
    const holdMark = group(g, 2.5, 0.5, -0.15);
    const holdRing = torus(holdMark, 0.16, 0.01, 0, 0, 0, UROV_ACCENT, { emissive: UROV_ACCENT, ei: 1.4, rough: 0.4, cast: false, seg: 6, seg2: 20 });
    holdRing.rotation.x = Math.PI / 2;
    holoTag(holdMark, "hold here — payout", 0, 0.2, 0, { css: UROV_CSS, w: 0.4 });
    reg(hits, holdMark, "hold-for-payout");
    const clearPoint = group(g, 1.6, 0.4, -0.55);
    box(clearPoint, 0.1, 0.1, 0.02, 0, 0, 0, UROV_ACCENT, { rough: 0.5 });
    holoTag(clearPoint, "tether-clear point", 0, 0.16, 0, { css: UROV_CSS, w: 0.34 });
    reg(hits, clearPoint, "tether-clear-point");
    const snagTether = hose(g, [[-0.5, 0.55, -1.5], [0.6, 0.42, -0.7], [1.5, 0.4, -0.55], [1.6, 0.4, -0.55]], 0.022, 0xd2312b, { steps: 12, rough: 0.7 });
    snagTether.visible = false;
    const comms = holoPanel(g, 0.5, 0.3, 1.9, 1.1, -1.4, urovCommsFace(["Supervisor · topside", "Press to talk"]), { ry: -0.5, accent: UROV_ACCENT });
    reg(hits, comms, "rov-comms");
    const monitor = holoPanel(g, 0.5, 0.32, 1.9, 1.55, -1.4, urovMonitorFace(["Level, on the guideline"], true), { ry: -0.5, accent: UROV_ACCENT });
    const signalLamp = ball(g, 0.05, 1.66, 1.75, -1.4, 0x59c97b, { emissive: 0x59c97b, ei: 1.2, seg: 10, seg2: 8 });
    const resetBtn = group(g, 2.15, 1.05, -1.42);
    box(resetBtn, 0.08, 0.06, 0.02, 0, 0, 0, 0x2b3138, { rough: 0.5 });
    holoTag(resetBtn, "signal reset", 0, 0.12, 0, { css: UROV_CSS, w: 0.26 });
    reg(hits, resetBtn, "signal-reset");
    const blindHit = box(g, 0.5, 0.5, 0.3, 1.9, 1.6, -1.3, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "keep flying — no picture?", 1.9, 1.9, -1.3, { css: "#d2312b", w: 0.5 });
    reg(hits, blindHit, "fly-blind-signal-loss");

    // ------------------------------------------------------- stage dock and check-in
    const dockRing = torus(stage, 0.32, 0.012, 0, 0, 0, UROV_ACCENT, { emissive: UROV_ACCENT, ei: 1.4, rough: 0.4, cast: false, seg: 6, seg2: 24 });
    void dockRing;
    reg(hits, stage, "stage-dock");
    const stageCheck = group(g, -2.4, 0.5, -1.6);
    const stageRing = torus(stageCheck, 0.18, 0.01, 0, 0, 0, UROV_ACCENT, { emissive: UROV_ACCENT, ei: 1.5, rough: 0.4, cast: false, seg: 6, seg2: 22 });
    void stageRing;
    holoTag(stageCheck, "check in — secure", 0, 0.26, 0, { css: UROV_CSS, w: 0.32 });
    reg(hits, stageCheck, "stage-checkin");
    const slate = decal(g, 0.26, 0.2, -1.7, 0.62, -1.55, paperFace("SLATE", ["Shroud + chafe fixed", "Rebar + net logged", "Signal froze — noted"], { bg: "#e8eef0", band: UROV_CSS }), { px: 192 });
    void slate;

    // ------------------------------------------------------- scenery
    const school = group(g, 0.6, 1.6, -2.4);
    for (let i = 0; i < 8; i++) {
      const f = group(school, (i % 4) * 0.3 - 0.45, Math.floor(i / 4) * 0.22, (i % 3) * 0.18);
      ball(f, 0.06, 0, 0, 0, 0x8aa0a8, { rough: 0.4, metal: 0.4, seg: 8, seg2: 6 }).scale.set(2.2, 0.8, 0.6);
    }
    for (let i = 0; i < 8; i++) {
      const a = i * 0.8;
      ball(g, 0.06 + (i % 3) * 0.02, Math.cos(a) * 2.5, 0.06, -0.8 + Math.sin(a) * 2.5, 0x1c1f2a, { rough: 0.8, metal: 0.1, seg: 8, seg2: 6 }).scale.set(1.4, 0.6, 1);
    }
    const tyre = torus(g, 0.28, 0.09, -2.4, 0.07, 1.0, 0x15181c, { rough: 0.9, seg: 8, seg2: 18 });
    tyre.rotation.x = Math.PI / 2 - 0.2;
    for (let i = 0; i < 6; i++) {
      const link = torus(g, 0.05, 0.016, -2.0 + i * 0.12, 0.03, 1.6 - i * 0.05, 0x5a4a3a, { rough: 0.85, metal: 0.4, seg: 6, seg2: 10 });
      link.rotation.y = i % 2 ? 0 : Math.PI / 2; link.rotation.x = Math.PI / 2;
    }
    for (let i = 0; i < 6; i++) cyl(g, 0.045, 0.03, 0.08, 2.3 + Math.cos(i * 1.1) * 0.4, 0.04, -0.6 + Math.sin(i * 1.1) * 0.4, [0xe86a8a, 0xf2a03d, 0xe8e2d0][i % 3], { rough: 0.7, seg: 8 });
    const bubbles = group(g, -1.8, 0.5, -1.0);
    for (let i = 0; i < 8; i++) ball(bubbles, 0.02 + (i % 3) * 0.008, (i % 3) * 0.04 - 0.04, i * 0.14, (i % 2) * 0.03, 0xdff4f0, { rough: 0.2, emissive: 0x9fd0c8, ei: 0.4, seg: 6, seg2: 4, cast: false });
    for (let i = 0; i < 9; i++) {
      const a = i * 0.71 + 0.2, r = 1.6 + (i % 4) * 0.4;
      const bottle = cyl(g, 0.03, 0.03, 0.18, Math.cos(a) * r, 0.03, -1.6 + Math.sin(a) * r, [0x2f6f4a, 0x6a4a2a, 0xa8c8c0][i % 3], { rough: 0.15, metal: 0.1, opacity: 0.8, transparent: true, seg: 8 });
      bottle.rotation.z = Math.PI / 2; bottle.rotation.y = a;
    }
    for (const [x, z] of [[1.4, -2.1], [-2.0, 0.4], [0.4, 1.4]]) {
      const stub = group(g, x, 0, z);
      cyl(stub, 0.16, 0.18, 0.4, 0, 0.2, 0, 0x4a4234, { rough: 0.95, seg: 12 });
      for (let i = 0; i < 3; i++) { const a = i * 1.9 + x; ball(stub, 0.06, Math.cos(a) * 0.18, 0.12 + (i % 2) * 0.12, Math.sin(a) * 0.18, 0x1c1f2a, { rough: 0.8, metal: 0.1, seg: 8, seg2: 6 }).scale.set(1, 0.7, 1); }
    }

    return {
      hits,
      spawnLook: new THREE.Vector3(0.4, 0.6, -0.9),
      onStep() {},
      onStepComplete(step) {
        if (step.id === "report-splash") repaint(comms.userData.face, urovCommsFace(["On the stage — reported", "Starting function check"]));
        if (step.id === "visual-precheck") { shroudBolt.material = mat(0x2f8f5a, { rough: 0.4, metal: 0.7 }); chafeMark.material = mat(0x2f8f5a, { rough: 0.5 }); }
        if (step.id === "stow-tools-then-clip") { lineCoil.position.set(-1.1, 0.02, -1.7); toolBag.position.set(-0.4, 0.85, -1.9); }
        if (step.id === "secure-shroud") { shroudRack.visible = false; noShroudTag.visible = false; }
        if (step.id === "call-for-power") repaint(comms.userData.face, urovCommsFace(["Power on — confirmed", "Vehicle armed"]));
        if (step.id === "fly-guideline") rov.position.set(1.1, 0.55, -0.35);
        if (step.id === "recall-rov") rov.position.set(-1.8, 0.32, -1.0);
        if (step.id === "report-findings") repaint(comms.userData.face, urovCommsFace(["Shroud + chafe fixed", "Rebar + net logged"]));
        if (step.id === "check-in-secure") repaint(slate, paperFace("SLATE — LOGGED", ["Shroud + chafe fixed", "Rebar + net logged", "Tether snag — cleared"], { bg: "#e6f6ea", band: "#59c97b" }));
      },
      onHazard() {},
      onInterrupt(it) {
        if (it.id === "tether-snag-guideline") { snagTether.visible = true; tether.visible = false; }
        if (it.id === "video-freeze") { repaint(monitor.userData.face, urovMonitorFace(["Frame frozen"], false)); signalLamp.material = mat(0xd2312b, { emissive: 0xd2312b, ei: 1.6 }); }
      },
      onInterruptEnd(it) {
        if (it.id === "tether-snag-guideline") { snagTether.visible = false; tether.visible = true; }
        if (it.id === "video-freeze" && it.resolved === "answered") { repaint(monitor.userData.face, urovMonitorFace(["Live picture restored"], true)); signalLamp.material = mat(0x59c97b, { emissive: 0x59c97b, ei: 1.2 }); }
      },
      animate(t, dt, session) {
        const step = session?.step;
        if (session?.turn && step?.id === "set-tether-drag") knobPin.rotation.z = session.turn.amount * Math.PI * 2 - 0.5;
        const gg = session?.gauge;
        if (gg && !gg.committed && step?.id === "trim-check") gaugePanel.scale.y = 0.7 + gg.t * 0.6;
        if (step?.id === "fly-guideline" && session.holding) rov.position.x = -0.4 + (session.track?.inBand ?? 0) * 3.0;
        if (snagTether.visible) snagTether.position.x = Math.sin(t * 3) * 0.02;
        school.position.x = 0.6 + Math.sin(t * 0.3) * 0.3;
        void dt; void CITY; void signFace;
      },
    };
  },
};
