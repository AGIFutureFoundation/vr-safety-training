import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import { box, cyl, ball, torus, hose, group, decal, repaint, signFace, paperFace, mat } from "../../../shared/kit.js";
import { CITY, holoPanel, holoTag, reg, surfaceTexture, texturedMat, paintedSteelFace } from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Underwater Welding & Cutting VR — Maritime & Ports, the marine
// and water pack of the Bay Area Union Edition, on the bay-underwater
// district.
//
// A steel pipe pile under a wharf with a corroded hole to be cut back and
// patched: the cut line marked on the pile, the ground clamp and its lead,
// the oxy-arc cutting torch on the stage, the patch plate slung from a lift
// bag, the electrode quiver, and the umbilical back to the district's dive
// stage at (−4.3, 2.8). The switch that makes the circuit live is at the
// surface, worked by the tender on the diver's call — "make it hot" and
// "make it cold" — so the diver's side of it is the comms. The learner is a
// Pile Drivers commercial diver-welder. No depth, gas, current, amperage or
// decompression figure is invented; every limit reads against the dive plan,
// the qualified welding procedure or the tables the supervisor holds.

const MWUW_ACCENT = 0xf0a04b;

export const SIM_MW_UNDERWATER_WELDING_AND_CUTTING = {
  id: "mw-underwater-welding-and-cutting",
  index: "236",
  domain: "Maritime & Ports",
  trade: "Pile Drivers of the Carpenters commercial diver-welder cutting and wet-welding a steel pile, with the tender on the surface switch and the dive supervisor on the comms",
  category: "Maritime & Ports",
  district: "bay-underwater",
  weather: "clear",
  underwater: {
    depthLabel: "Per dive plan",
    bottomTimeSeconds: 720,
  },
  certification: "Pile Drivers of the Carpenters commercial diver apprenticeship and the UBC International Training Fund; AWS D3.6 underwater welding code for the qualified procedure and the welder's qualification; OSHA 29 CFR 1910 Subpart T commercial diving operations, including electrical safety for underwater welding and cutting; ADCI consensus standards for underwater burning and welding; USCG 46 CFR 197 Subpart B where the dive is worked from a vessel; depth, gas and decompression per the dive plan and the tables the supervisor holds",
  name: "Underwater Welding & Cutting",
  title: simTitle("Underwater Welding & Cutting"),
  tagline: "A steel pile cut back and patched: the job and the switch plan agreed on comms, the umbilical checked, the torch taken off the stage, the sealed void and the painted ground spot found, the ground on clean steel before 'make it hot', the pneumo read, the cut run at a steady oxygen flow while the comms drop, 'make it cold' before the rod change, the oxygen closed, the patch seated, the pass run through a current shift, the weld inspected and the dive logged",
  accent: MWUW_ACCENT,
  accentCss: "#f0a04b",
  parSeconds: 300,
  footprint: 2.6,
  badge: { id: "ground-then-hot", name: "Ground Then Hot", note: "The ground on clean steel before every 'make it hot', never a rod changed hot, never between the ground and the work, never a lift bag run away" },

  supportLine: "your union hall's member assistance programme — the Pile Drivers of the Carpenters — with the employer's employee assistance line behind it",

  game: system({
    name: "Wet Weld",
    currency: "ROD",
    ranks: ["Burner's Helper", "Burner", "Diver-Welder", "Lead Diver-Welder", "Wet Weld Certified"],
    badges: [
      { id: "switch-discipline", name: "Switch Discipline", note: "Ground on, then 'make it hot' — in that order, first time", test: AWARD.stepClean("ground-and-switch") },
      { id: "read-true-weld", name: "Read True", note: "Pneumo committed inside the band first time", test: AWARD.precise(0.7) },
      { id: "never-in-the-circuit", name: "Never In The Circuit", note: "Never struck without the ground, never a hot rod change, never between ground and work, never a runaway bag", test: AWARD.safe },
    ],
    challenges: [
      { id: "clean-burn", name: "Clean Burn", note: "No corrections from the switch plan to the log", test: AWARD.clean },
      { id: "steady-oxygen", name: "Steady Oxygen", note: "Oxygen flow held in band the whole cut", test: AWARD.unbroken },
      { id: "in-the-slack", name: "In The Slack", note: "Dive logged inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "torch-no-ground": "You went to strike the torch on the pile with the ground clamp still lying on the silt. Without the ground on the work close to the cut, the current finds its own way back — through the water, the pile, the umbilical's fittings and the diver — and the arc, when it comes, is somewhere nobody chose. The ground goes on clean steel close to the work first, then the diver calls for the switch.",
    "rod-change-hot": "You reached into the quiver to change the rod with the circuit still live. A spent rod comes out and a new one goes in only after the diver has called 'make it cold' and heard 'cold' back from the tender at the switch; a rod changed hot puts the diver's glove, hand and body into the circuit in water that conducts.",
    "lift-bag-over": "You kept adding air to the lift bag holding the patch plate with the plate already lifting. A lift bag's air expands as it rises and the bag gets more buoyant the higher it goes, so a bag that starts lifting runs away to the surface with the plate — and anyone caught in its rigging — unless air is dumped. You fill it in small amounts, stay clear of the rigging and keep a hand on the dump.",
    "between-ground-and-work": "You put yourself between the ground clamp and the cut. With the circuit live, the path the current takes runs between the clamp and the arc, and a diver in that path is part of it. The ground goes on so the diver works facing it, with the arc between the diver and the clamp, never the diver between the two.",
  },

  lateNotes: {
    "cut-line": "The cut starts once the ground is on clean steel and the switch has been called hot — not with the circuit still cold and unproven.",
    "torch-oxygen-valve": "The torch's oxygen is closed once the switch is cold — the rod change comes after 'cold' is heard back from the surface.",
    "uw-slate": "The dive is logged once the weld has been inspected — the log records the work that was done.",
  },

  steps: [
    {
      id: "switch-plan", kind: "select", target: "uw-comms",
      title: "Agree the job and the switch plan on the comms",
      cue: "With the supervisor and the tender at the switch: the cut and the patch, the procedure qualified to AWS D3.6, and the switch stays cold until you call 'make it hot' — and goes cold on 'make it cold' or on silence.",
      why: "Underwater burning and welding put an electrical circuit in the water with the diver, and the only thing that makes it live is the switch at the surface. The plan agreed on the comms is who works the switch, what the calls are, and what happens on silence — the switch goes cold — so that nobody at either end of the umbilical is ever guessing whether the rod in the diver's hand is live.",
    },
    {
      id: "umbilical-check", kind: "hold", target: "uw-umbilical-harness", seconds: 4,
      title: "Check the umbilical and leads to the harness",
      cue: "Run your hand from the helmet down the umbilical to the harness ring, and along the welding lead and ground lead where they run with it: clipped, no turns round the stage, nothing crossing the work.",
      why: "A diver-welder carries two more lines than an inspection diver — the welding lead and the ground lead — and all three have to run clean from the stage to the work. A lead crossing the umbilical where the arc will be is a lead that can burn through the umbilical's jacket, and a turn round the stage bridle is a foul the tender cannot clear from the surface.",
      holdBreakNote: "Released before the check reached the harness — the lead you did not follow is the one crossing the work. Start again from the helmet.",
    },
    {
      id: "torch-down", kind: "drag", target: "cutting-torch",
      title: "Take the cutting torch off the stage to the work",
      cue: "Unclip the oxy-arc torch from the stage rail, keep its tip pointed away from you, and hang it on the work hook beside the cut line.",
      why: "The torch comes down on the stage and off it on its lead, never carried with its oxygen hose trailing round the umbilical, and it is hung at the work so both hands are free for the ground and the checks that come before any arc. Its tip is kept pointed away from the diver's body from the moment it leaves the stage, because the habit is what protects the diver on the day the switch is made hot by mistake.",
      drag: { to: "work-hook", radius: 0.5, missNote: "Not on the work hook — hang the torch beside the cut line, tip away from you, before anything else." },
    },
    {
      id: "pre-burn-check", kind: "find", noHint: true,
      targets: ["void-gas-pocket", "coating-at-ground-spot"],
      itemNames: { "void-gas-pocket": "sealed void behind the cut line", "coating-at-ground-spot": "coating on the spot planned for the ground" },
      itemNotes: {
        "void-gas-pocket": "The pile is capped above the waterline and closed below the corroded hole: the space behind the cut line is a sealed void, where the oxygen and hydrogen that cutting releases collect until the next spark sets them off.",
        "coating-at-ground-spot": "The spot marked for the ground clamp is still coated; a clamp on paint or growth makes a poor contact that heats, arcs at the clamp and leaves the current looking for a better path.",
      },
      title: "Check the work for a sealed void and the ground spot",
      cue: "Before any arc: is there a closed space behind the cut where gas can collect, and is the ground spot bare, clean steel close to the work?",
      why: "The two things that kill underwater burners are the circuit and the gas. Cutting releases oxygen and hydrogen, and in a sealed void behind the cut they collect into a mixture that detonates on the next spark — the void is vented or the cut is planned so gas cannot gather. The ground spot has to be clean steel, because a clamp on paint is a poor contact and a poor contact leaves the current choosing its own way home.",
    },
    {
      id: "ground-and-switch", kind: "sequence",
      targets: ["ground-clamp", "switch-call"],
      itemNames: { "ground-clamp": "ground clamp on clean steel close to the work", "switch-call": "'make it hot' called and heard back" },
      title: "Ground on clean steel first, then call for the switch",
      cue: "Put the ground clamp on the cleaned spot close to the cut, facing you across the work, then call 'make it hot' and wait to hear 'hot' back from the tender.",
      why: "The order is the whole of the electrical safety: the ground goes on first, on clean steel close to the work and placed so the diver faces it across the arc, and only then is the switch called hot. A switch made hot with no ground on puts current into the water looking for a path, and the diver holding the torch is the nearest one. 'Hot' is heard back before the torch touches steel, because a call nobody acknowledged is a switch in an unknown state.",
      outOfOrderNote: "Out of order — the ground goes on clean steel before any call for the switch. A switch called hot with no ground is current looking for a way home through you.",
    },
    {
      id: "burn-depth", kind: "gauge", target: "uw-pneumo",
      title: "Hold the pneumo at the cut for the supervisor",
      cue: "Hold the pneumo end at the cut line while the supervisor bleeds and reads it, and commit the reading against the depth range the dive plan and the qualified procedure give.",
      why: "A wet-weld procedure qualified to AWS D3.6 is qualified for a depth range, and a weld made outside it is a weld the procedure does not cover — the depth at the cut is read on the pneumo, not assumed from the stage. The same reading tells the supervisor which line of the tables they hold the dive is on, and cutting is long, heavy work that tends to take a diver deeper than they meant to go.",
      gauge: { label: "PNEUMO AT CUT", speed: 0.7, green: [0.4, 0.58], readout: (t) => (t < 0.4 ? "shallower than the procedure" : t <= 0.58 ? "per the dive plan and procedure" : "deeper than planned — stop, tell topside"), missNote: "Outside the band — hold the pneumo end still at the cut while it is bled, and read it against the plan and the procedure's range." },
    },
    {
      id: "run-cut", kind: "track", target: "cut-line", seconds: 6,
      title: "Run the cut at a steady oxygen flow",
      cue: "Hold the torch on the cut line and keep the oxygen flow steady on the trigger as you travel — enough to blow the cut through, never gulping or starving it.",
      why: "An oxy-arc cut is the arc heating the steel and the oxygen burning it away, and the oxygen is the part the diver controls: starved, the cut stalls and the rod burns without cutting; gulped, excess gas balloons off the work and collects under anything above it. A steady flow on the trigger and a steady travel make a clean cut and the least gas in the water, which is gas as the thing to watch.",
      track: { start: 0.14, green: [0.42, 0.6], rise: 0.56, fall: 0.46, drift: 0.13, label: "OXYGEN FLOW", readout: (v) => (v < 0.42 ? "starved — cut stalling" : v > 0.6 ? "gulping — gas pooling" : "steady — cutting through") },
      holdBreakNote: "The oxygen flow went out of band — the cut stalled or the gas started to pool. Settle the trigger and travel steadily again.",
    },
    {
      id: "make-it-cold", kind: "select", target: "cold-call",
      title: "Call 'make it cold' before the rod change",
      cue: "Take the torch off the work, call 'make it cold', and wait to hear 'cold' back from the tender before touching the rod.",
      why: "Every rod change, every repositioning of the ground and every pause starts with the switch cold, called by the diver and acknowledged by the tender. The diver is the only one who knows the rod is about to be handled, and the tender is the only one who can open the circuit, so the call and the answer are both said out loud, every time — including the hundredth time on a long job.",
    },
    {
      id: "oxygen-off", kind: "turn", target: "torch-oxygen-valve",
      title: "Close the torch's oxygen valve",
      cue: "With the switch cold, close the oxygen valve on the torch fully before the rod comes out and the torch goes back on its hook.",
      why: "An oxygen valve left open on a torch that is not cutting feeds oxygen into the water round the work, and oxygen-rich water and gas pockets are what turn a stray spark into a fire or a blast at the next strike. The valve is closed fully by hand at every rod change and every stop, so the torch hanging on its hook is dead in both senses — no current and no oxygen.",
      turn: { turns: 0.75, label: "TORCH OXYGEN", readout: (t) => (t < 0.3 ? "open — flowing" : t < 0.9 ? "closing" : "closed — torch dead") },
    },
    {
      id: "seat-patch", kind: "drag", target: "patch-plate",
      title: "Seat the patch plate over the cut",
      cue: "Guide the patch plate down off its lift bag onto the cut-back opening, square to the marks, dumping the bag's air as the plate takes its seat.",
      why: "The patch plate is heavy and is brought to the work on a lift bag so the diver guides it rather than carries it, and the bag's air is dumped as the plate seats so it does not float off once it is let go. It goes on square to the marks with even gaps all round, because the qualified procedure assumes a fit-up and a wet weld across an uneven gap is a weld the procedure does not cover.",
      drag: { to: "patch-seat", radius: 0.5, missNote: "Not seated — the plate has to sit square to the marks over the opening, bag dumped, before any weld is run." },
    },
    {
      id: "weld-pass", kind: "hold", target: "weld-pass", seconds: 5,
      title: "Run the weld pass on the patch",
      cue: "Ground checked, rod on the work, call 'make it hot', hear 'hot', and run the pass along the patch's edge at a steady drag — then 'make it cold'.",
      why: "A wet weld is made in water that quenches it as fast as it is laid, which is why the procedure fixes the rod, the technique and the travel, and why the pass is run steadily from start to stop rather than in bursts. The same switch discipline wraps every pass — ground checked, 'make it hot' called and answered, 'make it cold' at the end — so the circuit is only ever live while the rod is on the work.",
      holdBreakNote: "The pass broke off before the end of the run — a stop in the middle of a wet-weld pass leaves a crater and a cold lap. Take it up again from the stop.",
    },
    {
      id: "weld-inspect", kind: "find", noHint: true,
      targets: ["undercut", "porosity"],
      itemNames: { "undercut": "undercut along the weld toe", "porosity": "surface porosity in the pass" },
      itemNotes: {
        "undercut": "Along one edge the arc has cut a groove into the pile beside the weld toe and left it unfilled — a notch that concentrates stress exactly where the weld meets the base metal.",
        "porosity": "A run of pinholes in the pass where gas was trapped as the water quenched it; porosity is what a wet weld is most prone to and what the procedure's acceptance limits are written about.",
      },
      title: "Inspect the weld against the procedure",
      cue: "Look along the pass with the switch cold: undercut at the toes, porosity, cracks, and the profile against what the procedure accepts.",
      why: "A wet weld is inspected by the diver who made it before anyone else sees it, and AWS D3.6 sets what each class of weld may and may not show. Undercut and porosity are the defects wet welds are prone to, because the water quenches the pool and traps its gas; they are found now, with the diver and the rods still at the work, rather than on the camera footage after the dive.",
    },
    {
      id: "dive-log-weld", kind: "select", target: "uw-slate",
      title: "Read the job up for the dive log",
      cue: "Read your slate to the supervisor: the cut and the patch, the depth, the rods used, the sealed void and how it was vented, the lost comms and the current, and the defects to be ground out.",
      why: "The dive log and the weld record are both written from what the diver-welder reads up: the procedure, the depth and the rods tie the weld to its qualification, and the defects found go to the repair list before the job is signed off. The sealed void goes in too, because the next burner on this pile needs to know the pile is closed above them.",
    },
    {
      id: "crew-checkin", kind: "select", target: "uw-comms",
      title: "Check in with the supervisor and the tender",
      cue: "Switch confirmed cold, torch and stinger on the stage, and on the comms: how you are after the dead comms mid-cut and the current on the pass, and ready for the supervisor's call up.",
      why: "The tender at the switch and the supervisor at the panel spent that dive trusting calls they could not see, and they deserve to hear the job end cleanly from the diver. It is also the diver's own check-in: a comms drop with a torch in hand is a frightening minute, and saying so on the comms, and later at the debrief, is how the team stays honest — the member assistance line is there for what is left.",
    },
  ],

  interrupts: [
    {
      id: "comms-lost-mid-cut",
      kind: "Comms lost mid-cut",
      after: "run-cut", delay: 2, seconds: 14,
      alert: "The comms have gone dead in the middle of the cut — no voice from the surface and no answer to your call.",
      cue: "Stop cutting and put the torch in its holster, tip away, hands off — the switch goes cold on silence.",
      target: "torch-holster",
      why: "With the comms gone, nobody at the surface knows whether the diver is cutting, changing a rod or in trouble, and the agreed plan is that the switch goes cold on silence. The diver's half of that plan is to take the torch off the work and holster it, tip away, so that whatever state the switch is actually in, the rod is not touching steel or the diver.",
      missNote: "You kept the torch on the cut in silence; topside, hearing nothing, opened the switch as planned — but not before the tender had asked twice, and the rod stayed in the cut, live, the whole time.",
      wrongNote: "The torch holster — torch off the work, tip away, hands clear, until the comms are back.",
    },
    {
      id: "current-shift-weld",
      kind: "Current shift during the pass",
      after: "weld-pass", delay: 2, seconds: 14,
      alert: "The current has picked up across the pile and is pushing you off the work — the welding lead is swinging toward your body.",
      cue: "Call 'make it cold' now and get the rod off the work before you are pushed round.",
      target: "cold-call",
      why: "A current that pushes the diver off the work pushes the diver's body toward the circuit: the rod swings, the lead drapes across the umbilical and the diver's position between the ground and the work stops being the diver's choice. The switch goes cold first, by the diver's call, and only then does the diver deal with the current — nothing about the current matters more than the circuit.",
      missNote: "You kept the rod on the pass while the current pushed you round the pile, and the welding lead draped across your chest before the tender, hearing nothing, asked if you were still hot.",
      wrongNote: "'Make it cold' — the circuit goes dead before anything else is dealt with.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);

    // ------------------------------------------------------- the pile
    const steelTex = surfaceTexture((cx, w, h) => paintedSteelFace(cx, w, h, { base: "#4a3a2e", base2: "#3a2e24", cols: 1, rows: 3 }), { px: 512 });
    steelTex.repeat?.set?.(2, 2);
    const steelMat = texturedMat(steelTex, { rough: 0.8, metal: 0.4, color: 0xd0c8c0 });
    const pile = group(g, 0.2, 0, -0.9);
    const shaft = cyl(pile, 0.5, 0.52, 6.4, 0, 3.2, 0, 0xffffff, { seg: 22 });
    shaft.material = steelMat;
    for (const [y, h] of [[0.3, 0.4], [3.1, 0.3], [4.4, 0.26]]) cyl(pile, 0.56, 0.58, h, 0, y, 0, 0x56613f, { rough: 1, seg: 18 });
    // Corroded hole and the marked cut line around it.
    const hole = box(pile, 0.34, 0.3, 0.1, 0, 1.25, 0.47, 0x1b120c, { rough: 0.95 });
    for (const [w, h, x, y] of [[0.5, 0.025, 0, 1.47], [0.5, 0.025, 0, 1.03], [0.025, 0.46, -0.24, 1.25], [0.025, 0.46, 0.24, 1.25]]) box(pile, w, h, 0.02, x, y, 0.52, 0xf1f3f4, { rough: 0.6 });
    const cutLine = group(pile, 0, 1.25, 0.53);
    const cutGlow = box(cutLine, 0.5, 0.46, 0.01, 0, 0, 0, 0xf0a04b, { rough: 0.5, emissive: 0x3a2206, ei: 0.3, opacity: 0.25, transparent: true, cast: false });
    holoTag(cutLine, "cut line", 0.4, 0.2, 0, { css: "#f0a04b", w: 0.22 });
    reg(hits, cutLine, "cut-line");
    const voidMark = group(pile, 0, 2.4, 0.5);
    box(voidMark, 0.18, 0.18, 0.02, 0, 0, 0, 0x6a2a2a, { rough: 0.7, emissive: 0x3a0a0a, ei: 0.4 });
    holoTag(voidMark, "capped above — sealed?", 0.3, 0.16, 0, { css: "#f0a04b", w: 0.42 });
    reg(hits, voidMark, "void-gas-pocket");
    const cap = cyl(pile, 0.52, 0.52, 0.08, 0, 6.4, 0, 0x3a3f45, { rough: 0.6, metal: 0.5, seg: 22 });
    void cap;
    const groundSpot = box(pile, 0.14, 0.14, 0.02, -0.38, 0.9, 0.34, 0x2f6f4a, { rough: 0.7 });
    groundSpot.rotation.y = -0.8;
    reg(hits, groundSpot, "coating-at-ground-spot");
    const patchSeat = group(pile, 0, 1.25, 0.56);
    const seatRing = torus(patchSeat, 0.3, 0.01, 0, 0, 0, MWUW_ACCENT, { emissive: MWUW_ACCENT, ei: 1.6, rough: 0.4, cast: false, seg: 6, seg2: 24 });
    void seatRing;
    holoTag(patchSeat, "patch seat", -0.42, 0.2, 0, { css: "#f0a04b", w: 0.24 });
    reg(hits, patchSeat, "patch-seat");
    const bead = group(pile, 0, 1.25, 0.6);
    for (const [w, h, x, y] of [[0.56, 0.03, 0, 0.27], [0.56, 0.03, 0, -0.27], [0.03, 0.56, -0.27, 0], [0.03, 0.56, 0.27, 0]]) box(bead, w, h, 0.03, x, y, 0, 0x8a8e90, { rough: 0.6, metal: 0.6 });
    bead.visible = false;
    const weldHit = box(pile, 0.6, 0.6, 0.1, 0, 1.25, 0.62, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(pile, "weld pass — patch edge", 0.5, 1.62, 0.5, { css: "#f0a04b", w: 0.42 });
    reg(hits, weldHit, "weld-pass");
    const undercut = box(bead, 0.2, 0.012, 0.02, 0.1, 0.3, 0.02, 0x3a2a1a, { rough: 0.9, emissive: 0x2a1206, ei: 0.4 });
    reg(hits, undercut, "undercut");
    const pores = group(bead, -0.28, -0.05, 0.02);
    for (let i = 0; i < 4; i++) ball(pores, 0.008, 0, i * 0.04, 0.01, 0x15181c, { rough: 0.9, seg: 6, seg2: 4 });
    reg(hits, pores, "porosity");

    // --------------------------------------------- ground clamp and leads
    const clamp = group(g, -0.9, 0.08, -0.1);
    box(clamp, 0.12, 0.06, 0.16, 0, 0, 0, 0x2b3138, { rough: 0.5, metal: 0.6 });
    box(clamp, 0.03, 0.12, 0.03, 0.04, 0.06, 0, 0xc0c6cc, { rough: 0.3, metal: 0.9 });
    holoTag(clamp, "ground clamp", 0, 0.2, 0, { css: "#f0a04b", w: 0.26 });
    reg(hits, clamp, "ground-clamp");
    const groundLead = hose(g, [[-3.6, 1.3, 2.5], [-2.4, 0.15, 1.2], [-1.3, 0.1, 0.2], [-0.9, 0.1, -0.1]], 0.02, 0x1b1e22, { steps: 12, rough: 0.7 });
    void groundLead;
    const between = box(g, 0.5, 0.9, 0.5, -0.45, 0.9, -0.2, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "between the ground and the work?", -0.6, 1.45, -0.15, { css: "#d2312b", w: 0.58 });
    reg(hits, between, "between-ground-and-work");

    const strikeHit = box(g, 0.45, 0.5, 0.35, 0.05, 1.25, -0.2, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "strike now — ground still on the silt?", -0.05, 0.85, -0.15, { css: "#d2312b", w: 0.64 });
    reg(hits, strikeHit, "torch-no-ground");

    // ------------------------------------------ the cutting torch and quiver
    const torch = group(g, -3.45, 1.1, 2.45);
    box(torch, 0.05, 0.3, 0.05, 0, 0, 0, 0x2b3138, { rough: 0.5 });
    box(torch, 0.08, 0.06, 0.08, 0, 0.14, 0, 0xd2312b, { rough: 0.5 });
    const rod = cyl(torch, 0.008, 0.008, 0.36, 0, 0.34, 0, 0xc0a060, { rough: 0.4, metal: 0.7, seg: 6 });
    void rod;
    const oxValve = group(torch, 0.05, 0.05, 0);
    cyl(oxValve, 0.025, 0.025, 0.03, 0, 0, 0, 0x2f8f5a, { rough: 0.5, seg: 10 }).rotation.z = Math.PI / 2;
    box(oxValve, 0.012, 0.05, 0.012, 0.02, 0, 0, 0x2f8f5a, { rough: 0.5 });
    holoTag(torch, "oxy-arc torch", 0, 0.62, 0, { css: "#f0a04b", w: 0.3 });
    reg(hits, torch, "cutting-torch");
    const oxHit = box(g, 0.18, 0.18, 0.18, 0.66, 1.35, -0.2, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "torch oxygen valve", 0.66, 1.55, -0.2, { css: "#f0a04b", w: 0.34 });
    reg(hits, oxHit, "torch-oxygen-valve");
    hose(g, [[-3.5, 2.4, 2.7], [-3.0, 1.4, 2.4], [-3.45, 1.0, 2.45]], 0.015, 0x2f8f5a, { steps: 8, rough: 0.7 });
    const hook = group(pile, 0.5, 1.35, 0.4);
    const hookRing = torus(hook, 0.12, 0.01, 0, 0, 0, MWUW_ACCENT, { emissive: MWUW_ACCENT, ei: 1.6, rough: 0.4, cast: false, seg: 6, seg2: 20 });
    void hookRing;
    holoTag(hook, "work hook", 0.12, 0.18, 0, { css: "#f0a04b", w: 0.22 });
    reg(hits, hook, "work-hook");
    const holster = group(g, 1.1, 0.9, 0.1, -0.4);
    box(holster, 0.1, 0.34, 0.1, 0, 0, 0, 0x3a2e24, { rough: 0.8 });
    box(holster, 0.14, 0.04, 0.14, 0, 0.18, 0, 0x2b3138, { rough: 0.6 });
    holoTag(holster, "torch holster", 0, 0.32, 0, { css: "#f0a04b", w: 0.28 });
    reg(hits, holster, "torch-holster");
    const quiver = group(g, 1.3, 0.1, 0.6);
    cyl(quiver, 0.07, 0.07, 0.4, 0, 0.2, 0, 0x2f4f6f, { rough: 0.7, seg: 12 });
    for (let i = 0; i < 5; i++) cyl(quiver, 0.006, 0.006, 0.3, -0.03 + (i % 3) * 0.03, 0.5, (i % 2) * 0.02, 0xc0a060, { rough: 0.4, metal: 0.7, seg: 5 });
    const quiverHit = box(quiver, 0.3, 0.6, 0.3, 0, 0.3, 0, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(quiver, "change the rod — still hot?", 0, 0.85, 0, { css: "#d2312b", w: 0.5 });
    reg(hits, quiverHit, "rod-change-hot");

    // -------------------------------------------- patch plate on a lift bag
    const patch = group(g, 1.5, 1.2, -0.3);
    box(patch, 0.56, 0.52, 0.03, 0, 0, 0, 0x6b6f72, { rough: 0.6, metal: 0.6 });
    for (const sx of [-0.2, 0.2]) cyl(patch, 0.005, 0.005, 0.7, sx, 0.6, 0, 0x8a949d, { rough: 0.5, metal: 0.6, seg: 4 });
    const bag = group(patch, 0, 1.2, 0);
    const bagBody = ball(bag, 0.22, 0, 0, 0, 0xf2c14b, { rough: 0.6, seg: 12, seg2: 10 });
    bagBody.scale.set(0.9, 1.3, 0.9);
    holoTag(patch, "patch plate", 0, -0.36, 0.05, { css: "#f0a04b", w: 0.24 });
    reg(hits, patch, "patch-plate");
    const bagHit = box(g, 0.4, 0.5, 0.4, 1.5, 2.4, -0.3, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "more air in the bag?", 1.5, 2.8, -0.3, { css: "#d2312b", w: 0.4 });
    reg(hits, bagHit, "lift-bag-over");

    // ------------------------------------------- umbilical and pneumo
    hose(g, [[-3.6, 1.2, 2.5], [-2.6, 0.25, 1.9], [-1.0, 0.2, 1.4], [0.3, 0.3, 0.9], [0.55, 0.95, 0.65]], 0.03, 0xf2c14b, { steps: 16, rough: 0.8 });
    const harness = group(g, 0.55, 1.0, 0.62);
    torus(harness, 0.06, 0.014, 0, 0, 0, 0xc0c6cc, { rough: 0.3, metal: 0.9, seg: 6, seg2: 14 });
    box(harness, 0.05, 0.12, 0.03, 0, -0.1, 0, 0x2b3138, { rough: 0.6 });
    const clip = box(harness, 0.04, 0.05, 0.03, 0.05, 0.05, 0, 0xf2c14b, { rough: 0.5 });
    holoTag(harness, "umbilical and leads", 0, 0.2, 0, { css: "#f0a04b", w: 0.36 });
    reg(hits, harness, "uw-umbilical-harness");
    const pneumo = group(g, -0.3, 1.3, -0.1);
    cyl(pneumo, 0.012, 0.012, 0.3, 0, 0, 0, 0x2b5aa8, { rough: 0.6, seg: 6 }).rotation.z = 1.2;
    cyl(pneumo, 0.02, 0.02, 0.05, 0.14, 0.05, 0, 0xc0c6cc, { rough: 0.3, metal: 0.9, seg: 8 });
    hose(g, [[0.55, 0.95, 0.65], [0.1, 1.2, 0.3], [-0.3, 1.3, -0.1]], 0.01, 0x2b5aa8, { steps: 8, rough: 0.6 });
    holoTag(pneumo, "pneumo end", 0, 0.16, 0, { css: "#f0a04b", w: 0.24 });
    reg(hits, pneumo, "uw-pneumo");

    // --------------------------------------------- comms, switch calls, slate
    const comms = holoPanel(g, 0.5, 0.3, -1.3, 1.65, 1.5, (cx, w, h) => {
      cx.fillStyle = "rgba(24,14,6,0.9)"; cx.fillRect(0, 0, w, h); cx.fillStyle = "#f0a04b"; cx.fillRect(0, 0, w, 6);
      cx.font = `600 ${Math.round(h * 0.16)}px 'Barlow Condensed', Arial, sans-serif`; cx.textAlign = "left"; cx.textBaseline = "middle";
      cx.fillStyle = "#fbe6cc"; cx.fillText("HELMET COMMS", w * 0.06, h * 0.24);
      cx.font = `${Math.round(h * 0.12)}px Arial, sans-serif`; cx.fillStyle = "#fdf2e2";
      ["Supervisor · tender on the switch", "Press to talk"].forEach((l, i) => cx.fillText(l, w * 0.06, h * (0.55 + i * 0.22)));
    }, { ry: 0.5, accent: MWUW_ACCENT });
    reg(hits, comms, "uw-comms");
    const switchLamp = ball(g, 0.05, -0.55, 1.95, 1.2, 0x59c97b, { emissive: 0x59c97b, ei: 1.2, seg: 10, seg2: 8 });
    const hotCall = group(g, -0.55, 1.62, 1.25, 0.3);
    box(hotCall, 0.3, 0.12, 0.02, 0, 0, 0, 0x3a1a0a, { rough: 0.5, emissive: 0x3a1206, ei: 0.5 });
    holoTag(hotCall, "call 'make it hot'", 0, 0.14, 0.01, { css: "#f0a04b", w: 0.34 });
    reg(hits, hotCall, "switch-call");
    const coldCall = group(g, -0.2, 1.4, 1.35, 0.2);
    box(coldCall, 0.3, 0.12, 0.02, 0, 0, 0, 0x0a2a3a, { rough: 0.5, emissive: 0x06283a, ei: 0.5 });
    holoTag(coldCall, "call 'make it cold'", 0, -0.12, 0.01, { css: "#4fb3e8", w: 0.34 });
    reg(hits, coldCall, "cold-call");
    const noComms = holoTag(g, "no comms — switch cold on silence", -1.3, 1.88, 1.5, { css: "#d2312b", w: 0.56 });
    noComms.visible = false;
    const slate = decal(g, 0.26, 0.2, 1.0, 1.05, 1.2, paperFace("SLATE", ["Cut and patch", "Rods, depth", "Void, defects"], { bg: "#f2ece0", band: "#f0a04b" }), { px: 192 });
    slate.rotation.y = -0.5;
    holoTag(g, "your slate", 1.0, 1.24, 1.2, { css: "#f0a04b", w: 0.22 });
    reg(hits, slate, "uw-slate");

    // ------------------------------------------------ scenery and effects
    for (let i = 0; i < 8; i++) {
      const a = i * 0.8;
      ball(pile, 0.08 + (i % 3) * 0.03, Math.cos(a) * 0.55, 0.15 + (i % 3) * 0.1, Math.sin(a) * 0.55, 0x1c1f2a, { rough: 0.8, metal: 0.1, seg: 8, seg2: 6 }).scale.set(1, 0.7, 1);
    }
    for (let i = 0; i < 4; i++) { const f = box(pile, 0.03, 0.6, 0.12, Math.cos(i * 1.6) * 0.6, 3.4 + i * 0.25, Math.sin(i * 1.6) * 0.6, 0x5a7a3a, { rough: 0.9, cast: false }); f.rotation.z = 0.2 * (i - 1.5); }
    const neighbour = group(g, -2.3, 0, -2.2);
    const nShaft = cyl(neighbour, 0.5, 0.52, 6.4, 0, 3.2, 0, 0xffffff, { seg: 20 });
    nShaft.material = steelMat;
    for (const [y, h] of [[0.3, 0.4], [2.6, 0.3]]) cyl(neighbour, 0.56, 0.58, h, 0, y, 0, 0x4a5a32, { rough: 1, seg: 16 });
    const walers = cyl(g, 0.14, 0.14, 3.4, -1.05, 3.4, -1.55, 0x3e3a30, { rough: 0.9, seg: 10 });
    walers.rotation.z = Math.PI / 2; walers.rotation.y = -0.5;
    for (const [x, z, r] of [[-2.4, 0.2, 0.2], [2.4, 1.6, 0.15], [-0.4, 2.4, 0.18], [2.6, -1.8, 0.2]]) ball(g, r, x, r * 0.4, z, 0x4a5048, { rough: 1, seg: 8, seg2: 6 }).scale.set(1, 0.5, 0.8);
    // A school of fish, a lost tyre, a run of chain, kelp and a crab trap.
    const school = group(g, 1.6, 2.7, -1.6);
    for (let i = 0; i < 8; i++) {
      const f = group(school, (i % 4) * 0.34 - 0.5, Math.floor(i / 4) * 0.24, (i % 3) * 0.2);
      ball(f, 0.06, 0, 0, 0, 0x94a8b0, { rough: 0.4, metal: 0.4, seg: 8, seg2: 6 }).scale.set(2.2, 0.8, 0.6);
      box(f, 0.05, 0.06, 0.01, -0.14, 0, 0, 0x74888e, { rough: 0.5 });
    }
    const tyre = torus(g, 0.3, 0.1, 2.2, 0.08, 1.3, 0x15181c, { rough: 0.9, seg: 8, seg2: 18 });
    tyre.rotation.x = Math.PI / 2 - 0.25;
    for (let i = 0; i < 8; i++) {
      const link = torus(g, 0.06, 0.018, -2.0 + i * 0.13, 0.03, 1.6 - i * 0.06, 0x5a4a3a, { rough: 0.85, metal: 0.4, seg: 6, seg2: 10 });
      link.rotation.y = i % 2 ? 0 : Math.PI / 2; link.rotation.x = Math.PI / 2;
    }
    for (let i = 0; i < 7; i++) {
      const frond = box(g, 0.03, 0.7 + (i % 3) * 0.25, 0.12, 2.4 - i * 0.12, 0.4, -0.6 - (i % 2) * 0.35, 0x5a7a3a, { rough: 0.9, cast: false });
      frond.rotation.z = 0.2 * ((i % 3) - 1);
    }
    for (let i = 0; i < 10; i++) {
      const a = i * 0.63;
      ball(g, 0.06 + (i % 3) * 0.02, 0.2 + Math.cos(a) * 1.3, 0.06, -0.9 + Math.sin(a) * 1.3, 0x1c1f2a, { rough: 0.8, metal: 0.1, seg: 8, seg2: 6 }).scale.set(1.4, 0.6, 1);
    }
    for (let i = 0; i < 5; i++) {
      const a = i * 1.3 + 0.4;
      cyl(g, 0.05, 0.03, 0.08, -2.3 + Math.cos(a) * 0.7, 0.04, -2.2 + Math.sin(a) * 0.7, [0xe86a8a, 0xf2a03d, 0xe8e2d0][i % 3], { rough: 0.7, seg: 8 });
    }
    const slag = group(g, 0.3, 0.02, -0.25);
    for (let i = 0; i < 6; i++) ball(slag, 0.02 + (i % 2) * 0.01, (i % 3) * 0.08 - 0.08, 0, Math.floor(i / 3) * 0.08, 0x2a2622, { rough: 0.9, seg: 6, seg2: 4 });
    slag.visible = false;
    const arc = ball(g, 0.06, 0.2, 1.25, -0.3, 0xdff0ff, { emissive: 0xdff0ff, ei: 3.0, seg: 10, seg2: 8, cast: false });
    arc.visible = false;
    const bubbles = group(g, 0.2, 1.4, -0.35);
    for (let i = 0; i < 8; i++) ball(bubbles, 0.025 + (i % 3) * 0.01, (i % 3) * 0.05 - 0.05, i * 0.18, (i % 2) * 0.04, 0xdff4f0, { rough: 0.2, emissive: 0x9fd0c8, ei: 0.4, seg: 6, seg2: 4, cast: false });
    bubbles.visible = false;
    const streamers = group(g, 0, 0.6, 0);
    for (let i = 0; i < 7; i++) { const s = box(streamers, 1.2, 0.01, 0.04, -2.4 + (i % 4) * 1.4, (i % 3) * 0.5, -1.6 + i * 0.5, 0xb8e0d8, { rough: 0.4, emissive: 0x6aa8a0, ei: 0.5, cast: false }); s.rotation.y = 0.2; }
    streamers.visible = false;
    const weldLead = hose(g, [[-3.5, 2.3, 2.6], [-1.5, 0.3, 0.8], [0.4, 0.8, 0.0], [0.6, 1.3, -0.35]], 0.018, 0xb8402f, { steps: 12, rough: 0.7 });
    const weldLeadSwing = hose(g, [[-3.5, 2.3, 2.6], [-1.5, 0.3, 0.8], [0.2, 1.1, 0.8], [0.5, 1.2, 0.9]], 0.018, 0xb8402f, { steps: 12, rough: 0.7 });
    weldLeadSwing.visible = false;

    return {
      hits,
      spawnLook: new THREE.Vector3(0.2, 1.3, -0.8),
      onStep() {},
      onStepComplete(step) {
        if (step.id === "umbilical-check") clip.material = mat(0x59c97b, { rough: 0.5 });
        if (step.id === "torch-down") { torch.position.set(0.72, 1.3, -0.4); torch.rotation.z = -0.4; }
        if (step.id === "pre-burn-check") { groundSpot.material = mat(0xb8bcc0, { rough: 0.5, metal: 0.7 }); voidMark.visible = false; }
        if (step.id === "ground-and-switch") { clamp.position.set(-0.3, 0.9, -0.62); switchLamp.material = mat(0xf0645b, { emissive: 0xf0645b, ei: 1.6 }); }
        if (step.id === "run-cut") { hole.scale.set(1.4, 1.5, 1); cutGlow.visible = false; slag.visible = true; arc.visible = false; bubbles.visible = false; }
        if (step.id === "make-it-cold") switchLamp.material = mat(0x59c97b, { emissive: 0x59c97b, ei: 1.2 });
        if (step.id === "seat-patch") { patch.position.set(0.2, 1.25, -0.28); bag.visible = false; }
        if (step.id === "weld-pass") { bead.visible = true; switchLamp.material = mat(0x59c97b, { emissive: 0x59c97b, ei: 1.2 }); }
        if (step.id === "weld-inspect") { undercut.material = mat(0x8a8e90, { rough: 0.6, metal: 0.6 }); pores.visible = false; }
        if (step.id === "dive-log-weld") repaint(slate, paperFace("SLATE — READ UP", ["Cut, patched, depth per plan", "Void vented · comms lost, cold", "Undercut, porosity to grind"], { bg: "#e6f6ea", band: "#59c97b" }));
      },
      onHazard() {},
      onInterrupt(it) {
        if (it.id === "comms-lost-mid-cut") { noComms.visible = true; arc.visible = false; }
        if (it.id === "current-shift-weld") { streamers.visible = true; weldLead.visible = false; weldLeadSwing.visible = true; }
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "comms-lost-mid-cut") { noComms.visible = false; torch.position.set(1.1, 1.25, 0.1); torch.rotation.z = 0; switchLamp.material = mat(0x59c97b, { emissive: 0x59c97b, ei: 1.2 }); }
        if (it.id === "current-shift-weld") { switchLamp.material = mat(0x59c97b, { emissive: 0x59c97b, ei: 1.2 }); weldLeadSwing.visible = false; weldLead.visible = true; streamers.rotation.y = 0.15; }
      },
      animate(t, dt, session) {
        const step = session?.step;
        if (session?.turn && step?.id === "oxygen-off") oxValve.rotation.x = session.turn.amount * Math.PI * 2;
        const cutting = step?.id === "run-cut" && session.holding && !session.activeInterrupt;
        arc.visible = cutting && Math.sin(t * 40) > -0.3;
        bubbles.visible = cutting;
        if (bubbles.visible) bubbles.children.forEach((b, i) => { b.position.y = (t * 0.8 + i * 0.18) % 1.6; });
        if (streamers.visible) streamers.position.x = ((t * 0.5) % 1.4) - 0.7;
        void dt; void CITY; void signFace;
        school.position.x = 1.6 + Math.sin(t * 0.3) * 0.4;
      },
    };
  },
};
