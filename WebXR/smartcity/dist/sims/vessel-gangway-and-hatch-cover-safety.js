import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import { box, cyl, ball, torus, hose, group, decal, repaint, signFace, mat } from "../../../shared/kit.js";
import {
  CITY, stationPad, holoPanel, holoTag, toolChest, instrument,
  standingFigure, reg, surfaceTexture, texturedMat, pavingFace, waterFace, deckPlateFace, hullFace,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Vessel Gangway & Hatch Cover Safety VR — Maritime & Ports,
// the port operations block.
//
// A general cargo ship alongside with her gangway down to the quay and a
// folding hatch cover still closed over number two hold. The learner is the
// ILWU longshore worker going aboard first with the gang to open the hatch
// for discharge; the ship's deck officer runs the ship's side of it and the
// hydraulics belong to the ship. Everything here is the part of a shift that
// happens before any cargo moves: getting aboard, getting the cover open
// without anyone in its way, and getting down into a hold whose air nobody
// has read yet. The ship and the berth are generic.

const VGH_ACCENT = 0x2f9fd0;
const VGH_CSS = "#2f9fd0";
const VGH_DECK = 0.45;

export const SIM_VESSEL_GANGWAY_AND_HATCH_COVER_SAFETY = {
  id: "vessel-gangway-and-hatch-cover-safety",
  index: "312",
  domain: "Maritime & Ports",
  trade: "ILWU longshore — hatch gang going aboard to open the hold, PMA training programme, with the ship's deck officer on the hydraulics",
  category: "Maritime & Ports",
  weather: "wind",
  certification: "ILWU longshore with the PMA training programme; OSHA 29 CFR 1918 longshoring for the means of access, the hatch covers and the hold, and 29 CFR 1917 marine terminals for the quay; IMO SOLAS for the ship's gangway and IMO STCW for the watch that tends it; NIOSH guidance on oxygen-depleted cargo holds; ANSI/ISEA 107 high-visibility garments on deck",
  name: "Vessel Gangway & Hatch Cover Safety",
  title: simTitle("Vessel Gangway & Hatch Cover Safety"),
  tagline: "Aboard before the cargo moves: the gangway looked over, the net under it and the ring buoy at its head, its angle read against the tide, the climb with both hands while the ship ranges on her lines, the hatch plan agreed with the mate, the cover's path chained off and its cleats knocked back, a weeping hydraulic hose found, the cover opened on the lever while a lasher wanders into its fold, the panels pinned, the hold ladder and lights proven, the hold's air read, and the hatch logged",
  accent: VGH_ACCENT,
  accentCss: VGH_CSS,
  parSeconds: 290,
  footprint: 2.6,
  badge: { id: "aboard-and-open-clean", name: "Aboard and Open Clean", note: "Both hands on the gangway, nobody in the fold, the ranging ship and the lasher both answered, and the hold's air read before a foot went down the ladder" },

  supportLine: "your ILWU local's member assistance programme, with the PMA-ILWU benefit plan's counselling line behind it",

  game: system({
    name: "Hatch Gang",
    currency: "LIFT",
    ranks: ["Casual", "Hatch Hand", "Gangway Checker", "Hatch Boss", "Hatch Gang Certified"],
    badges: [
      { id: "both-hands-aboard", name: "Both Hands Aboard", note: "The gangway climbed on both rails, start to finish", test: AWARD.stepClean("board") },
      { id: "fold-kept-clear", name: "Fold Kept Clear", note: "The cover opened steadily with its path chained and empty", test: AWARD.unbroken },
      { id: "never-on-the-cover", name: "Never On The Cover", note: "Nobody on a moving cover, in its fold, or at an open coaming edge", test: AWARD.safe },
    ],
    challenges: [
      { id: "clean-opening", name: "Clean Opening", note: "No corrections anywhere in the opening", test: AWARD.clean },
      { id: "angle-on-the-mark", name: "Angle On The Mark", note: "Gangway angle committed inside the band first time", test: AWARD.precise(0.7) },
      { id: "hatch-open-fast", name: "Hatch Open Fast", note: "Hatch logged open inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "bag-on-gangway": "You started up the gangway with the gear bag in both arms. A gangway moves with the ship — she ranges, rolls a little and rises with the tide — and the rails are the only thing between a slip on a wet tread and a fall between the hull and the quay wall. The bag goes up on a line or with a second person, and both hands stay on the rails for the whole climb.",
    "stand-on-cover": "You stepped up onto the hatch cover while its cleats were being knocked back. A folding cover is a hinged steel panel driven by hydraulic cylinders; once the cleats are off, it is held only by its own weight and whatever the mate is doing at the controls, and the first thing it does when the lever moves is lift and fold — taking anyone standing on it up with it, and then down into the hold.",
    "fold-path": "You stood in the fold path at the hinged end of the cover. A folding cover's panels rise and jack-knife toward that end, and the space between the rising panels and the coaming is exactly the shape of a person; the hydraulics do not feel a body and do not stop for one. Nobody stands in the fold, in the swing or under a raised panel for any reason.",
    "coaming-edge": "You walked along the top of the coaming beside the open hatch. The drop into a hold is the height of the ship's side, onto steel or cargo, and the coaming is a narrow, often greasy ledge with nothing on the hold side of it. The hold is entered by its ladder, and the open coaming is kept to with the hatch guards or not at all.",
  },

  lateNotes: {
    "hydraulic-lever": "The cover opens once its path is chained off and every cleat is knocked back — a cover opened against a cleat tears the cleat off.",
    "stow-pin": "The stowage pins go in once the panels are fully up and folded — there is nothing to pin yet.",
    "hatch-log": "The hatch is logged once the hold's air has been read and the access proven — the log is last, not first.",
  },

  steps: [
    {
      id: "gangway-check", kind: "find", noHint: true,
      targets: ["slack-rail-rope"],
      itemNames: { "slack-rail-rope": "slack rail rope on the gangway's outboard side" },
      itemNotes: { "slack-rail-rope": "The outboard rail rope has pulled out of its top stanchion eye and hangs slack across three stanchions — a hand reaching for it on a slip would find nothing. The watch re-reeves it before anyone climbs." },
      title: "Look the gangway over from the quay before anyone climbs",
      cue: "From the quay, check the gangway: the treads, the stanchions, the rail ropes taut on both sides, the foot's roller on the quay, and the head's landing on the ship.",
      why: "The gangway is the ship's, rigged by her crew, and it is the only way aboard for everyone who works her — a rail rope that has pulled out of an eye, a stanchion that is not pinned, or a foot that has lifted off its roller all show from the quay before anyone trusts their weight to it. 29 CFR 1918 puts the means of access on the list of things checked before a longshore gang goes aboard, and the check is made from the quay because the gangway is where the fall happens.",
    },
    {
      id: "net-and-buoy", kind: "sequence", anyOrder: true,
      targets: ["safety-net", "ring-buoy"],
      itemNames: { "safety-net": "safety net rigged under the gangway", "ring-buoy": "ring buoy with its line at the gangway head" },
      title: "Confirm the net under the gangway and the ring buoy at its head",
      cue: "Check the safety net is rigged under the gangway across the gap to the quay wall, and the ring buoy with its line is at the gangway head, free to throw.",
      why: "The gap between a ship's hull and a quay wall is the worst water in the port: cold, dark, pinched between steel and concrete, and closing every time the ship moves in on her fenders. The net under the gangway is what catches a slip before it reaches that gap, and the ring buoy with its line at the head is what reaches a person who went past the net. SOLAS puts the gangway's arrangements on the ship, and a gang confirms both are there before it depends on them.",
    },
    {
      id: "gangway-angle", kind: "gauge", target: "angle-indicator",
      title: "Read the gangway's angle against its limit",
      cue: "Read the angle indicator at the gangway head and commit it against the working range on the gangway's data plate — the tide and the ship's draught have both moved since it was rigged.",
      why: "A gangway is designed to be walked within a range of angles, and the ship's freeboard changes with every hour of tide and every tonne loaded or discharged — a gangway that was flat at breakfast can be too steep for its treads by the afternoon, or have its foot lifted off the quay. The indicator at the head reads the angle now, and a gangway outside its range is re-rigged by the ship's crew before anyone uses it, not walked carefully.",
      gauge: { label: "GANGWAY ANGLE", speed: 0.65, green: [0.3, 0.52], readout: (t) => `${Math.round(t * 60)}°`, missNote: "Outside the working range — read the indicator when the ship has settled, not mid-roll, and compare it against the plate." },
    },
    {
      id: "board", kind: "hold", target: "gangway-rail", seconds: 4,
      title: "Climb the gangway with both hands on the rails",
      cue: "Hold both rails and climb at a steady pace, one person on the gangway at a time, eyes on the treads.",
      why: "The climb is a few seconds on a moving, often wet, sloping walkway with a gap underneath it that kills, and the only thing that makes it safe is two hands on two rails the whole way up. One at a time keeps the load inside what the gangway was rigged for and keeps two people from colliding at the head, where the landing onto the ship's deck is the awkward step. The gear follows on a heaving line.",
      holdBreakNote: "Let go of the rails partway up — the rails are what stop a slip on a wet tread. Start the climb again and keep both hands on them.",
    },
    {
      id: "hatch-plan", kind: "select", target: "deck-officer",
      title: "Agree the hatch opening with the ship's deck officer",
      cue: "Meet the mate at the hatch: which cover, which way it folds, who is on the controls, the signals, and that the hold has been ventilated.",
      why: "The hatch cover is the ship's machinery run by the ship's officer, and the gang works around it — so the opening is agreed face to face before anyone touches a cleat: which way the panels fold, where the fold ends, who is on the lever, what the stop signal is, and what the ship knows about the hold's cargo and its ventilation. 29 CFR 1918 expects hatch coverings to be handled by people who know how, and the mate's briefing is where the gang learns what this ship's covers do.",
    },
    {
      id: "cover-zone", kind: "drag", target: "deck-chain",
      title: "Chain off the cover's fold path",
      cue: "Run the deck chain across to the post at the fold end so nobody can walk into the path the panels will take.",
      why: "The space a folding cover sweeps is invisible while the cover is shut — it is just deck — which is why people walk into it. The chain across the fold end turns the path into a place with an edge a lasher coming round the coaming will see, before the panels start to rise. It goes up before the cleats come off, because once they are off the cover can move whenever the lever does.",
      drag: { to: "chain-post", radius: 0.5, missNote: "Not across the fold path — the chain has to close off the hinged end where the panels will rise, hooked to the post." },
    },
    {
      id: "cleats", kind: "turn", target: "cleat-wrench",
      title: "Knock back the securing cleats",
      cue: "Work round the coaming with the cleat wrench, backing each securing cleat off its wedge and swinging it clear, never standing on the cover.",
      why: "The cleats are what hold a cover down on its seal at sea, and a cover opened against even one of them either tears the cleat off or lifts the panel crooked on its hinges — both of which put a loose steel panel above an open hold. Each cleat is backed off and swung clear from the deck side of the coaming, counted round, and nobody stands on the cover to reach one.",
      turn: { turns: 1.0, label: "CLEATS", readout: (t) => (t < 0.35 ? "first cleats off" : t < 0.9 ? "working round" : "all cleats clear") },
    },
    {
      id: "hose-check", kind: "find", noHint: true,
      targets: ["weeping-hose"],
      itemNames: { "weeping-hose": "weeping hydraulic hose at the fold cylinder" },
      itemNotes: { "weeping-hose": "The hydraulic hose at the fold end's cylinder is weeping oil from its crimped fitting, and there is a slick on the deck under it — a hose that weeps can let go under the load of lifting a panel, and a panel whose cylinder loses pressure comes down." },
      title: "Look at the cylinders and hoses before the lever moves",
      cue: "Check the fold cylinders, the hoses and their fittings at the hinged end for leaks, chafe and oil on the deck.",
      why: "A folding cover's panels are held up by the pressure in their cylinders, and a hose that weeps at its fitting is the one that bursts when the panel's full weight comes on it — dropping the panel it was lifting, and putting a slick on the deck where the gang walks. The hoses and cylinders are looked at before the cover moves, and a weeping hose is the ship's to fix before the cover is opened.",
    },
    {
      id: "cover-open", kind: "track", target: "hydraulic-lever", seconds: 6,
      title: "Open the cover steadily on the hydraulic lever",
      cue: "On the mate's signal, run the cover open on the lever at a steady rate — panels rising together, no jerks, eyes on the fold path.",
      why: "A folding cover is heavy steel on hydraulic cylinders, and it opens safely when it opens steadily: jerked, the panels bounce on their hinges and load the hoses in pulses; rushed, they reach the end of their fold at speed. The lever is held so the panels rise together at the rate the mate called, and the operator's eyes stay on the fold path the whole time, because that is where a person will walk in if one does.",
      track: { start: 0.1, green: [0.4, 0.6], rise: 0.6, fall: 0.46, drift: 0.12, label: "LEVER", readout: (v) => (v < 0.4 ? "stalling" : v > 0.6 ? "too fast — panels bouncing" : "steady") },
      holdBreakNote: "The panels jerked or stalled — ease the lever back to a steady rate before they go any further.",
    },
    {
      id: "stow-pins", kind: "select", target: "stow-pin",
      title: "Pin the folded panels in their stowed position",
      cue: "With the panels fully up, drop the stowage pins and hooks in so they cannot fall back if the hydraulics lose pressure.",
      why: "A cover standing folded at the end of the hatch is held there by hydraulic pressure until it is pinned, and the gang is about to work underneath and beside it for hours. The stowage pins and hooks are what make it a fixed structure rather than a load held up by a hose — the same hose that was found weeping — and they go in before anyone works in the hold below.",
    },
    {
      id: "hold-access", kind: "sequence", anyOrder: true,
      targets: ["hold-ladder", "hold-lights"],
      itemNames: { "hold-ladder": "hold ladder — rungs and cage", "hold-lights": "hold lighting on" },
      title: "Prove the hold ladder and the hold lighting",
      cue: "Check the hold ladder's rungs, cage and handholds at the coaming, and that the hold lighting is on down to the tank top.",
      why: "The hold ladder is the only way into and out of the hold, and it is a long vertical climb that cargo and grabs have been knocking against since the ship was built — a bent rung or a missing handhold at the coaming is found before the climb, not on it. The lighting goes on before anyone goes down, because a hold is dark past the first few metres and a gang cannot see the cargo, the tank top or each other without it.",
    },
    {
      id: "hold-air", kind: "gauge", target: "hold-monitor",
      title: "Read the hold's oxygen before anyone climbs down",
      cue: "Lower the monitor's sampling line into the hold and commit the oxygen reading once it settles.",
      why: "A closed hold can lose its oxygen to the cargo itself — timber, scrap steel, coal and grain all consume it, and a fumigated cargo adds its own poison — and NIOSH records longshore and seafarer deaths at the foot of hold ladders where the air was simply not there. The hold is read before the climb, from the coaming, because the person who goes down to check is the person who is found at the bottom.",
      gauge: { label: "HOLD O₂", speed: 0.6, green: [0.5, 0.62], readout: (t) => `${(t * 40).toFixed(1)} % O₂`, missNote: "Not a settled reading — give the sampling line time to draw from the bottom of the hold before committing." },
    },
    {
      id: "hatch-log", kind: "select", target: "hatch-log",
      title: "Log the hatch open and what was found",
      cue: "Record the gangway rope re-reeved, the weeping hose reported, the cover opened and pinned, the hold's oxygen reading and the access proven.",
      why: "The hatch log is how the next gang and the next shift know what this hatch was like: the hose on the fold cylinder is a defect report to the ship that has to be closed out before the cover is run again, the gangway rope is a note to the watch, and the hold reading is the number the gang went down on. Written at the coaming it is fact; written in the gear locker at the end of the shift it is memory.",
    },
    {
      id: "crew-checkin", kind: "select", target: "deck-radio",
      title: "Check in with the walking boss and the gang",
      cue: "Call the walking boss that the hatch is open and the hold is safe to work, and check in with the gang after the ship's move and the lasher in the fold.",
      why: "The walking boss starts the cargo on this call, so it has to be true: open, pinned, lit, and the air read. It is also the gang's own check-in — a lasher walking into a moving cover's fold is the kind of near miss that stays with the person on the lever and the person who was nearly in it — and the ILWU's practice is to talk about it before the first lift, with the member assistance line named for anyone who needs more than that.",
    },
  ],

  interrupts: [
    {
      id: "vessel-ranging",
      kind: "Ship ranging on her lines",
      after: "board", delay: 2, seconds: 14,
      alert: "The ship is ranging along the berth on her lines — the gangway's foot is rolling along the quay and the head is twisting at the landing.",
      cue: "Get off the gangway and call the ship's gangway watch on the deck radio to tend the gangway and the lines.",
      target: "deck-radio",
      why: "A ship ranging on slack lines drags her gangway with her, and its foot can roll off the quay edge or jam, twisting the whole thing under whoever is on it. The ship's watch, keeping it to STCW, tends the gangway and the moorings, and the gang's job is to get off the gangway and tell them — on the radio, now — because the watch on the far side of the deck may not see the foot moving.",
      missNote: "The gangway's foot rolled to the end of the quay's roller track and dropped off it with a longshore worker halfway up; the gangway twisted on its head and the net took them, a metre from the gap.",
      wrongNote: "The deck radio — the gangway and the lines are the ship's watch's to tend, and the radio is the only thing that reaches them from here.",
    },
    {
      id: "lasher-in-fold",
      kind: "Lasher walking into the fold path",
      after: "cover-open", delay: 2, seconds: 12,
      alert: "A lasher coming round the coaming has ducked under the deck chain and is walking into the fold path as the panels rise.",
      cue: "Hit the cover's emergency stop now — the panels stop before anything else is said.",
      target: "cover-estop",
      why: "A person in the fold path of a rising cover has seconds, and the hydraulics will not stop for them — so the cover stops first, on the emergency stop, and the conversation about the chain comes after. The stop is a separate control from the lever on purpose: a lever let go of can drift or be pushed the wrong way by a startled hand, and the mushroom kills the pump.",
      missNote: "The panels kept rising with the lasher in the fold; the fold closed to a gap no wider than a boot before they saw it and threw themselves clear over the coaming.",
      wrongNote: "The emergency stop — letting go of the lever is not a stop, and the lasher is in the fold now.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.6, VGH_ACCENT);

    // ------------------------------------------------------ quay and water
    const quay = box(g, 6.4, 0.1, 2.4, 0, 0.05, 1.1, 0xffffff, { rough: 0.9 });
    quay.material = texturedMat(surfaceTexture((cx, w, h) => pavingFace(cx, w, h, { tiles: 5, base: "#2a3036", base2: "#22282e", seam: "rgba(0,0,0,0.42)" }), { repeat: 6, px: 512 }), { rough: 0.9, metal: 0.03, color: 0xb9c2ca });
    box(g, 6.4, 0.16, 0.2, 0, 0.13, -0.05, 0x8b98a5, { rough: 0.85 });
    box(g, 6.4, 0.012, 0.1, 0, 0.106, 0.2, 0xf2c14b, { rough: 0.7, cast: false });
    const water = box(g, 6.4, 0.02, 0.6, 0, 0.0, -0.45, 0xffffff, { rough: 0.15, metal: 0.4, cast: false });
    water.material = texturedMat(surfaceTexture((cx, w, h) => waterFace(cx, w, h), { repeat: 3, px: 256 }), { rough: 0.15, metal: 0.4, color: 0x5f8898 });
    for (const x of [-1.2, 1.4]) { const f = cyl(g, 0.16, 0.16, 0.5, x, 0.12, -0.25, 0x14171a, { rough: 0.85, seg: 14 }); f.rotation.z = Math.PI / 2; }
    // Bollard with the ship's line.
    const bollard = group(g, 2.7, 0.1, 0.4);
    cyl(bollard, 0.14, 0.17, 0.36, 0, 0.18, 0, 0x2b3138, { rough: 0.6, metal: 0.4, seg: 16 });
    cyl(bollard, 0.2, 0.18, 0.08, 0, 0.4, 0, 0x2b3138, { rough: 0.6, metal: 0.4, seg: 16 });
    hose(g, [[2.7, 0.45, 0.4], [2.6, 0.5, -0.3], [2.4, 0.6, -0.9]], 0.03, 0xd8c79a, { steps: 10, rough: 0.9 });

    // ---------------------------------------------------------- the ship
    const hull = box(g, 6.6, 0.9, 0.1, 0, 0.0, -0.78, 0xffffff, { rough: 0.7, metal: 0.3 });
    hull.material = texturedMat(surfaceTexture((cx, w, h) => hullFace(cx, w, h), { repeat: 2, px: 256 }), { rough: 0.7, metal: 0.3, color: 0xffffff });
    const deck = box(g, 6.6, 0.06, 2.4, 0, VGH_DECK - 0.03, -2.0, 0xffffff, { rough: 0.8, metal: 0.4 });
    deck.material = texturedMat(surfaceTexture((cx, w, h) => deckPlateFace(cx, w, h, { base: "#3b4a44", base2: "#34423c" }), { repeat: 5, px: 512 }), { rough: 0.8, metal: 0.4, color: 0xc8d2cc });
    box(g, 6.6, 0.4, 2.4, 0, VGH_DECK - 0.26, -2.0, 0x3a2a24, { rough: 0.8, cast: false });
    // Bulwark rail along the ship's side, with a gap at the gangway landing.
    for (const [x0, x1] of [[-3.3, -2.65], [-1.95, 3.3]]) {
      const w = x1 - x0, cx = (x0 + x1) / 2;
      box(g, w, 0.04, 0.04, cx, VGH_DECK + 0.9, -0.84, 0xd8dde2, { rough: 0.5, metal: 0.5 });
      box(g, w, 0.03, 0.03, cx, VGH_DECK + 0.5, -0.84, 0xd8dde2, { rough: 0.5, metal: 0.5 });
      for (let x = x0 + 0.1; x < x1; x += 0.8) cyl(g, 0.018, 0.018, 0.9, x, VGH_DECK + 0.45, -0.84, 0xd8dde2, { rough: 0.5, metal: 0.5, seg: 8 });
    }
    // Deckhouse at the far end and the ship's crane post behind the hatch.
    box(g, 1.2, 1.6, 1.4, -2.7, VGH_DECK + 0.8, -2.4, 0xe8e6e0, { rough: 0.6, metal: 0.2 });
    for (let i = 0; i < 3; i++) box(g, 0.02, 0.22, 0.3, -2.09, VGH_DECK + 1.1, -2.9 + i * 0.45, 0x1d2c38, { rough: 0.2, metal: 0.3 });
    cyl(g, 0.22, 0.26, 2.6, 2.6, VGH_DECK + 1.3, -2.9, 0xe8b02e, { rough: 0.55, metal: 0.4, seg: 16 });
    box(g, 0.3, 0.3, 2.4, 2.6, VGH_DECK + 2.7, -2.0, 0xe8b02e, { rough: 0.55, metal: 0.4 }).rotation.x = 0.35;

    // ------------------------------------------------------------ gangway
    const gw = group(g, -2.3, 0.1, 0.55);
    const gwBody = group(gw, 0, 0, 0);
    gwBody.rotation.x = 0.2;
    for (const sx of [-1, 1]) box(gwBody, 0.05, 0.08, 1.55, sx * 0.28, 0.04, -0.72, 0xc0c6cc, { rough: 0.45, metal: 0.7 });
    for (let i = 0; i < 7; i++) box(gwBody, 0.52, 0.02, 0.1, 0, 0.06, -0.08 - i * 0.22, 0x8a949d, { rough: 0.7, metal: 0.5 });
    const stanchions = [];
    for (const sx of [-1, 1]) for (let i = 0; i < 4; i++) stanchions.push(cyl(gwBody, 0.012, 0.012, 0.8, sx * 0.28, 0.44, -0.1 - i * 0.44, 0xc0c6cc, { rough: 0.45, metal: 0.7, seg: 8 }));
    const railIn = hose(gwBody, [[0.28, 0.84, -0.1], [0.28, 0.82, -0.75], [0.28, 0.84, -1.42]], 0.012, 0xe8dcc0, { steps: 8, rough: 0.9 });
    void railIn;
    const slackRope = hose(gwBody, [[-0.28, 0.84, -0.1], [-0.28, 0.55, -0.6], [-0.28, 0.5, -0.95], [-0.28, 0.84, -1.42]], 0.012, 0xe8dcc0, { steps: 12, rough: 0.9 });
    reg(hits, slackRope, "slack-rail-rope");
    const tautRope = hose(gwBody, [[-0.28, 0.84, -0.1], [-0.28, 0.82, -0.75], [-0.28, 0.84, -1.42]], 0.012, 0xe8dcc0, { steps: 8, rough: 0.9 });
    tautRope.visible = false;
    cyl(gw, 0.07, 0.07, 0.56, 0, 0.05, 0.08, 0x2b3138, { rough: 0.6, metal: 0.5, seg: 12 }).rotation.z = Math.PI / 2;
    const railHit = box(gwBody, 0.66, 0.2, 1.3, 0, 0.84, -0.75, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(gw, "gangway rails — climb", 0.55, 1.4, -0.5, { css: VGH_CSS, w: 0.42 });
    reg(hits, railHit, "gangway-rail");
    const angleInd = instrument(g, -1.85, VGH_DECK + 0.95, -0.95, { ry: 0.4, idle: "--°", color: VGH_ACCENT, w: 0.1, d: 0.14 });
    holoTag(angleInd, "angle indicator", 0, 0.16, 0, { css: VGH_CSS, w: 0.32 });
    reg(hits, angleInd, "angle-indicator");
    // Net under the gangway over the gap.
    const net = decal(g, 0.9, 0.9, -2.3, 0.04, -0.35, (cx, w, h) => {
      cx.clearRect(0, 0, w, h); cx.strokeStyle = "rgba(230,230,210,0.85)"; cx.lineWidth = 3;
      for (let i = 0; i <= 10; i++) { cx.beginPath(); cx.moveTo(i * w / 10, 0); cx.lineTo(i * w / 10, h); cx.stroke(); cx.beginPath(); cx.moveTo(0, i * h / 10); cx.lineTo(w, i * h / 10); cx.stroke(); }
    }, { px: 256, transparent: true });
    net.rotation.x = -Math.PI / 2;
    holoTag(g, "safety net", -3.0, 0.5, -0.35, { css: VGH_CSS, w: 0.24 });
    reg(hits, net, "safety-net");
    const buoy = group(g, -1.75, VGH_DECK + 0.7, -0.88);
    torus(buoy, 0.16, 0.05, 0, 0, 0, 0xe8632a, { rough: 0.7, seg: 10, seg2: 22 });
    for (let i = 0; i < 4; i++) box(buoy, 0.03, 0.11, 0.11, Math.cos(i * Math.PI / 2) * 0.16, Math.sin(i * Math.PI / 2) * 0.16, 0, 0xf2f2f2, { rough: 0.7 });
    hose(buoy, [[0.1, -0.1, 0.05], [0.25, -0.35, 0.12], [0.2, -0.55, 0.1]], 0.008, 0xe8dcc0, { steps: 8, rough: 0.9 });
    holoTag(buoy, "ring buoy + line", 0, 0.3, 0.1, { css: VGH_CSS, w: 0.32 });
    reg(hits, buoy, "ring-buoy");
    const bag = group(g, -2.9, 0.1, 1.05, 0.3);
    box(bag, 0.45, 0.28, 0.25, 0, 0.14, 0, 0x2b3a2e, { rough: 0.9 });
    box(bag, 0.3, 0.04, 0.04, 0, 0.3, 0, 0x14171a, { rough: 0.8 });
    holoTag(bag, "climb with the bag in your arms?", 0, 0.55, 0, { css: "#d2312b", w: 0.6 });
    reg(hits, bag, "bag-on-gangway");

    // ---------------------------------------------------------- the hatch
    const hatch = group(g, 0.4, VGH_DECK, -2.0);
    const CW = 2.6, CD = 1.3, CH = 0.34;
    for (const sz of [-1, 1]) box(hatch, CW, CH, 0.06, 0, CH / 2, sz * CD / 2, 0x3d5a4e, { rough: 0.6, metal: 0.5 });
    for (const sx of [-1, 1]) box(hatch, 0.06, CH, CD, sx * CW / 2, CH / 2, 0, 0x3d5a4e, { rough: 0.6, metal: 0.5 });
    const holdDark = box(hatch, CW - 0.08, 0.02, CD - 0.08, 0, 0.02, 0, 0x06080a, { rough: 1.0, cast: false });
    void holdDark;
    for (let i = 0; i < 3; i++) box(hatch, 0.5, 0.18, 0.4, -0.8 + i * 0.7, 0.14, 0.1 - (i % 2) * 0.3, 0x6b5a3a, { rough: 0.95, cast: false });
    // Two folding panels, hinged toward +x.
    const fold = group(hatch, CW / 2, CH, 0);
    const panelB = group(fold, 0, 0, 0);
    box(panelB, CW / 2, 0.08, CD + 0.04, -CW / 4, 0.04, 0, 0x4f7a5e, { rough: 0.55, metal: 0.5 });
    const panelA = group(panelB, -CW / 2, 0, 0);
    box(panelA, CW / 2, 0.08, CD + 0.04, -CW / 4, 0.04, 0, 0x4f7a5e, { rough: 0.55, metal: 0.5 });
    for (const p of [panelA, panelB]) for (let i = 0; i < 3; i++) box(p, 0.03, 0.02, CD, -0.12 - i * 0.4, 0.09, 0, 0x3d5a4e, { rough: 0.6, metal: 0.5 });
    const standHit = box(panelA, 0.8, 0.1, 0.8, -CW / 4, 0.13, 0, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(hatch, "step onto the cover?", -0.8, 0.75, 0, { css: "#d2312b", w: 0.44 });
    reg(hits, standHit, "stand-on-cover");
    // Cleats round the coaming.
    const cleats = [];
    for (let i = 0; i < 4; i++) for (const sz of [-1, 1]) cleats.push(box(hatch, 0.07, 0.1, 0.06, -1.0 + i * 0.66, CH - 0.02, sz * (CD / 2 + 0.05), 0xc0a040, { rough: 0.5, metal: 0.6 }));
    const wrench = group(hatch, -0.35, 0.02, CD / 2 + 0.3, 0.3);
    box(wrench, 0.5, 0.03, 0.04, 0, 0.02, 0, 0xc0392b, { rough: 0.5, metal: 0.5 });
    box(wrench, 0.06, 0.03, 0.1, 0.25, 0.02, 0, 0x8a949d, { rough: 0.4, metal: 0.8 });
    holoTag(wrench, "cleat wrench", 0, 0.3, 0, { css: VGH_CSS, w: 0.26 });
    reg(hits, wrench, "cleat-wrench");
    // Fold cylinders at the hinged end, one hose weeping.
    for (const sz of [-1, 1]) {
      const cy = cyl(hatch, 0.04, 0.04, 0.45, CW / 2 + 0.12, 0.3, sz * 0.45, 0x8a949d, { rough: 0.3, metal: 0.8, seg: 10 });
      cy.rotation.z = 0.6;
    }
    const weep = group(hatch, CW / 2 + 0.22, 0.1, 0.45);
    hose(weep, [[0, 0.12, 0], [0.12, 0.05, 0.05], [0.25, 0.0, 0.2]], 0.014, 0x14171a, { steps: 8, rough: 0.7 });
    const slick = box(weep, 0.3, 0.004, 0.22, 0.08, -0.08, 0.1, 0x1a1408, { rough: 0.1, metal: 0.3, cast: false });
    reg(hits, weep, "weeping-hose");
    const foldPath = box(g, 0.7, 0.1, 1.2, 2.1, VGH_DECK + 0.05, -2.0, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "stand in the fold?", 2.2, VGH_DECK + 0.6, -1.5, { css: "#d2312b", w: 0.4 });
    reg(hits, foldPath, "fold-path");
    const edgeHit = box(hatch, 1.4, 0.1, 0.12, -0.6, CH + 0.05, -CD / 2, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(hatch, "walk the coaming top?", -0.6, 0.8, -CD / 2 - 0.1, { css: "#d2312b", w: 0.46 });
    reg(hits, edgeHit, "coaming-edge");
    // Hold ladder and lights at the non-hinged end.
    const ladder = group(hatch, -CW / 2 + 0.12, 0, 0.3);
    for (const sz of [-0.14, 0.14]) cyl(ladder, 0.015, 0.015, 0.7, 0, 0.35, sz, 0xe8b02e, { rough: 0.5, metal: 0.5, seg: 8 });
    for (let i = 0; i < 3; i++) box(ladder, 0.03, 0.02, 0.28, 0, 0.15 + i * 0.2, 0, 0xe8b02e, { rough: 0.5, metal: 0.5 });
    holoTag(ladder, "hold ladder", 0, 0.9, 0, { css: VGH_CSS, w: 0.24 });
    reg(hits, ladder, "hold-ladder");
    const lights = group(hatch, -CW / 2 + 0.1, CH, -0.4);
    cyl(lights, 0.015, 0.015, 0.5, 0, 0.25, 0, 0x8a949d, { rough: 0.5, metal: 0.6, seg: 8 });
    const lamp = box(lights, 0.14, 0.1, 0.1, 0.06, 0.5, 0, 0x444a50, { rough: 0.4, metal: 0.4 });
    holoTag(lights, "hold lights", 0, 0.8, 0, { css: VGH_CSS, w: 0.22 });
    reg(hits, lights, "hold-lights");

    // ------------------------------------------- controls, chain and stop
    const ctrl = group(g, 2.35, VGH_DECK, -0.95, -0.5);
    box(ctrl, 0.3, 0.9, 0.24, 0, 0.45, 0, 0x2f4f6f, { rough: 0.55, metal: 0.3 });
    const lever = group(ctrl, 0, 0.95, 0);
    cyl(lever, 0.012, 0.012, 0.22, 0, 0.1, 0, 0x8a949d, { rough: 0.4, metal: 0.8, seg: 8 });
    ball(lever, 0.03, 0, 0.22, 0, 0x14171a, { rough: 0.6 });
    holoTag(ctrl, "cover lever — hold", 0, 1.35, 0, { css: VGH_CSS, w: 0.36 });
    reg(hits, lever, "hydraulic-lever");
    const estop = group(g, 2.95, VGH_DECK, -1.45);
    cyl(estop, 0.03, 0.03, 0.9, 0, 0.45, 0, 0xe8b02e, { rough: 0.5, metal: 0.5, seg: 8 });
    box(estop, 0.14, 0.14, 0.1, 0, 0.95, 0, 0xe8b02e, { rough: 0.5 });
    const mush = cyl(estop, 0.05, 0.05, 0.04, 0, 0.95, 0.07, 0xd2312b, { rough: 0.4, seg: 16 });
    mush.rotation.x = Math.PI / 2;
    holoTag(estop, "cover E-stop", 0, 1.25, 0, { css: VGH_CSS, w: 0.26 });
    reg(hits, estop, "cover-estop");
    const chain = group(g, -0.95, VGH_DECK, -1.0);
    cyl(chain, 0.03, 0.03, 0.8, 0, 0.4, 0, 0xe8b02e, { rough: 0.5, metal: 0.5, seg: 8 });
    hose(chain, [[0, 0.75, 0], [0.3, 0.55, 0.05], [0.55, 0.3, 0.1], [0.7, 0.05, 0.1]], 0.012, 0xe8b02e, { steps: 10, rough: 0.5, metal: 0.5 });
    holoTag(chain, "deck chain", 0, 1.0, 0, { css: VGH_CSS, w: 0.24 });
    reg(hits, chain, "deck-chain");
    const post = torus(g, 0.12, 0.012, 1.95, VGH_DECK + 0.02, -1.0, VGH_ACCENT, { emissive: VGH_ACCENT, ei: 1.6, rough: 0.4, cast: false, seg: 6, seg2: 24 });
    post.rotation.x = Math.PI / 2;
    holoTag(g, "chain post — fold end", 1.95, VGH_DECK + 0.4, -1.0, { css: VGH_CSS, w: 0.4 });
    reg(hits, post, "chain-post");
    const stowPin = group(g, 1.85, VGH_DECK, -2.85);
    cyl(stowPin, 0.03, 0.03, 0.5, 0, 0.25, 0, 0xc0c6cc, { rough: 0.4, metal: 0.8, seg: 10 });
    ball(stowPin, 0.04, 0, 0.52, 0, 0xd2312b, { rough: 0.5 });
    holoTag(stowPin, "stowage pin", 0, 0.8, 0, { css: VGH_CSS, w: 0.26 });
    reg(hits, stowPin, "stow-pin");

    // ------------------------------------------------------- tools, paper
    const chest = toolChest(g, 1.4, 1.5, { ry: 3.0, color: 0x2f4f6f });
    const radio = instrument(chest, 0.14, 0.79, 0.04, { ry: 0.1, idle: "CH 12 · SHIP", color: VGH_ACCENT, w: 0.1, d: 0.16 });
    holoTag(radio, "deck radio", 0, 0.16, 0, { css: VGH_CSS, w: 0.24 });
    reg(hits, radio, "deck-radio");
    const holdMon = instrument(chest, -0.12, 0.79, 0.02, { ry: 0.2, idle: "O₂ --", color: 0xf2c14b, w: 0.12, d: 0.18 });
    holoTag(holdMon, "hold monitor", 0, 0.16, 0, { css: VGH_CSS, w: 0.26 });
    reg(hits, holdMon, "hold-monitor");
    const log = holoPanel(g, 0.65, 0.44, -1.3, 1.25, 1.9, (cx, w, h) => {
      cx.fillStyle = "#08161e"; cx.fillRect(0, 0, w, h); cx.fillStyle = VGH_CSS; cx.fillRect(0, 0, w, 6);
      cx.font = `600 ${Math.round(h * 0.12)}px 'Barlow Condensed', Arial, sans-serif`; cx.textAlign = "left"; cx.textBaseline = "middle";
      cx.fillStyle = "#cfeef8"; cx.fillText("HATCH 2 — GANG LOG", w * 0.06, h * 0.16);
      cx.font = `${Math.round(h * 0.09)}px Arial, sans-serif`; cx.fillStyle = "#eaf6fb";
      ["Gangway: —", "Cover: CLOSED", "Hold air: —"].forEach((l, i) => cx.fillText(l, w * 0.06, h * (0.4 + i * 0.18)));
    }, { ry: 0.5, accent: VGH_ACCENT });
    reg(hits, log, "hatch-log");

    // ------------------------------------------------------------- crew
    const officer = standingFigure(g, -1.55, -1.45, { ry: 0.6, cloth: 0x1b2a3a, vest: 0xe8632a, helmet: 0xf2f2f2 });
    holoTag(officer, "ship's deck officer", 0, 1.95, 0, { css: VGH_CSS, w: 0.4 });
    reg(hits, officer, "deck-officer");
    const walker = standingFigure(g, 2.6, 2.3, { ry: -2.6, cloth: 0x2b3138, vest: 0xd8f23a, helmet: 0x2f9fd0 });
    holoTag(walker, "walking boss", 0, 1.95, 0, { css: VGH_CSS, w: 0.28 });
    const lasher = standingFigure(g, 2.2, -2.45, { ry: -1.4, cloth: 0x2b3138, vest: 0xd8f23a, helmet: 0xe8b02e, atStation: true });
    lasher.position.y = VGH_DECK;
    lasher.visible = false;

    const gwHome = gw.rotation.y;
    const waterTex = water.material.map;
    let opening = 0;

    return {
      hits,
      spawnLook: new THREE.Vector3(-0.2, 0.8, -1.4),
      onStep() {},
      onStepComplete(step) {
        if (step.id === "gangway-check") { slackRope.visible = false; tautRope.visible = true; }
        if (step.id === "gangway-angle") repaint(angleInd.userData.screen, signFace("IN RANGE", { bg: "#0d1c24", accent: "#59c97b", fg: "#bfeaf7", scale: 0.5 }));
        if (step.id === "cleats") for (const c of cleats) c.rotation.y = 1.2;
        if (step.id === "hose-check") slick.material = mat(0x6b5a2a, { rough: 0.9 });
        if (step.id === "cover-open") { opening = 1; panelB.rotation.z = -Math.PI / 2; panelA.rotation.z = Math.PI; }
        if (step.id === "hold-access") lamp.material = mat(0xfff2c0, { emissive: 0xfff2c0, ei: 2.2, rough: 0.3 });
        if (step.id === "hold-air") repaint(holdMon.userData.screen, signFace("O₂ 20.8 %", { bg: "#0d1c24", accent: "#59c97b", fg: "#bfeaf7", scale: 0.55 }));
        if (step.id === "hatch-log") {
          repaint(log.userData.face, (cx, w, h) => {
            cx.fillStyle = "#08161e"; cx.fillRect(0, 0, w, h); cx.fillStyle = "#59c97b"; cx.fillRect(0, 0, w, 6);
            cx.font = `600 ${Math.round(h * 0.12)}px 'Barlow Condensed', Arial, sans-serif`; cx.textAlign = "left"; cx.textBaseline = "middle";
            cx.fillStyle = "#cfeef8"; cx.fillText("HATCH 2 — GANG LOG", w * 0.06, h * 0.16);
            cx.font = `${Math.round(h * 0.085)}px Arial, sans-serif`; cx.fillStyle = "#bfeaf7";
            ["Gangway: rope re-reeved · in range", "Cover: OPEN + PINNED · hose reported", "Hold air: 20.8% O₂ · ladder + lights OK"].forEach((l, i) => cx.fillText(l, w * 0.06, h * (0.4 + i * 0.18)));
          });
        }
        if (step.id === "crew-checkin") repaint(radio.userData.screen, signFace("HATCH OPEN", { bg: "#0d1c24", accent: "#59c97b", fg: "#bfeaf7", scale: 0.5 }));
      },
      onHazard() {},
      onInterrupt(it) {
        if (it.id === "vessel-ranging") gw.rotation.y = gwHome + 0.35;
        if (it.id === "lasher-in-fold") { lasher.visible = true; lasher.position.set(2.05, VGH_DECK, -2.1); }
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "vessel-ranging") gw.rotation.y = gwHome;
        if (it.id === "lasher-in-fold") { lasher.position.set(2.9, VGH_DECK, -0.95); mush.material = mat(0x7a1a14, { rough: 0.4 }); }
      },
      animate(t, dt, session) {
        const step = session?.step;
        if (waterTex?.offset) { waterTex.offset.x = t * 0.008; waterTex.offset.y = t * 0.005; }
        if (session?.turn && step?.id === "cleats") wrench.rotation.y = 0.3 + session.turn.amount * 1.2;
        const gg = session?.gauge;
        if (gg && !gg.committed && step?.id === "gangway-angle") repaint(angleInd.userData.screen, signFace(`${Math.round(gg.t * 60)}°`, { bg: "#0d1c24", accent: gg.t >= 0.3 && gg.t <= 0.52 ? "#59c97b" : "#f2ae14", fg: "#bfeaf7", scale: 0.6 }));
        if (gg && !gg.committed && step?.id === "hold-air") repaint(holdMon.userData.screen, signFace(`O₂ ${(gg.t * 40).toFixed(1)}`, { bg: "#0d1c24", accent: gg.t >= 0.5 && gg.t <= 0.62 ? "#59c97b" : "#f2ae14", fg: "#bfeaf7", scale: 0.55 }));
        if (step?.id === "cover-open" && session.holding && !opening) {
          const v = session.track.v;
          panelB.rotation.z = -v * 1.1; panelA.rotation.z = v * 2.2;
          lever.rotation.z = -0.4 * v;
        }
        void dt; void CITY;
      },
    };
  },
};
