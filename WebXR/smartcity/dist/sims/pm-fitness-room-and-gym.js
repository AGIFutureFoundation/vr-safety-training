import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, ball, torus, hose, group, decal, repaint, signFace, paperFace, particles, mat,
  standingPerson, seatedFigure,
} from "../../../shared/kit.js";
import {
  CITY, stationPad, holoPanel, holoTag, instrument, standingFigure, reg,
  surfaceTexture, texturedMat, pavingFace, lockTag,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Fitness Room & Gym VR — Building Systems & Facilities,
// property management zone fourteen.
//
// The residents' gym off the lobby: two treadmills, a cable machine, a rack
// of dumbbells, a rower and a disinfectant station, open early to late with
// nobody on staff most of the day. The treadmill that slips and the cable
// that frays are repaired under lockout, the disinfectant is used to its
// label rather than a spray-and-wipe, and the two things that do happen in a
// residents' gym — a question about an assistance animal and a resident who
// goes down on the rower — are answered the way the law and first aid ask.
// Generic building — only the codes, standards and unions are named.

const PMFR_ACCENT = 0xe0915a;
const PMFR_CSS = "#e0915a";
const PMFR_WARN = "#f0645b";

export const SIM_PM_FITNESS_ROOM_AND_GYM = {
  id: "pm-fitness-room-and-gym",
  index: "230",
  domain: "Building Systems & Facilities",
  trade: "Amenity attendant and maintenance technician — UNITE HERE residential hospitality staff, SEIU building staff and the apartment association's CAMT credential",
  category: "Building Systems & Facilities",
  indoor: "service",
  certification: "OSHA 29 CFR 1910.147 lockout on the treadmill before its motor hood comes off; 29 CFR 1910.1030 bloodborne pathogens for blood on the equipment; 29 CFR 1910.151 first aid and the AED in the room; 29 CFR 1910.1200 hazard communication for the disinfectant's label and contact time; 29 CFR 1910.305 for the cords and outlets that feed the machines; the Fair Housing Act for a resident's assistance animal; UNITE HERE residential hospitality training, SEIU building-staff practice and the apartment association's CAMT credential",
  name: "Fitness Room & Gym",
  title: simTitle("Fitness Room & Gym"),
  tagline: "The residents' gym: a slipping treadmill and a frayed cable repaired under lockout, disinfectant held to its label, an assistance-animal question routed right, and the AED reached when a resident goes down",
  accent: PMFR_ACCENT,
  accentCss: PMFR_CSS,
  parSeconds: 290,
  footprint: 2.4,
  badge: { id: "safe-reps", name: "Safe Reps", note: "Both machines repaired under lockout, the disinfectant given its full contact time, and the AED on its way inside the window" },

  supportLine: "your union steward or member-assistance contact, or your employer's employee assistance program — after a resident collapses, that call is part of the job",

  game: system({
    name: "Residents' Gym",
    currency: "REPS",
    ranks: ["Attendant", "Amenity Tech", "Lead Tech", "Amenity Manager", "Fitness Room Certified"],
    badges: [
      { id: "unplugged-first", name: "Unplugged First", note: "Treadmill locked out before the hood came off", test: AWARD.stepClean("lockout-treadmill") },
      { id: "clean-hands", name: "Clean Hands", note: "No unsafe act anywhere in the gym", test: AWARD.safe },
      { id: "centred-belt", name: "Centred Belt", note: "Kept the belt tracking through the whole test run", test: AWARD.stepClean("test-run") },
    ],
    challenges: [
      { id: "clean-room", name: "Clean Room", note: "No corrections across the whole job", test: AWARD.clean },
      { id: "steady-run", name: "Steady Run", note: "Held the test run without breaking the band", test: AWARD.unbroken },
      { id: "quick-reopen", name: "Quick Reopen", note: "Finished inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "hood-off-live": "You reached under the treadmill's motor hood with the plug still in the wall. The drive motor and its controller carry line voltage and the belt can start from the console or a stuck key — a plug-connected machine is safe to work on only when you hold the unplugged cord yourself.",
    "hand-under-stack": "You slid a hand under the raised weight stack to straighten the cable. A stack held up by a fraying cable or a half-seated pin drops the moment either lets go, and a hundred and fifty pounds of plates lands on the hand that was under it.",
    "bleach-quat-mix": "You started topping up the quat disinfectant bottle with bleach from the janitor's jug. The two are never mixed — each label is written for its own product alone, mixing them can release irritating gases in a closed room, and what you end up with is a solution whose strength and contact time no label vouches for.",
    "barehand-blood": "You wiped the blood off the bench with a paper towel and a bare hand. The bloodborne pathogens standard treats blood on equipment as infectious until proven otherwise; gloves go on first, the spill kit's absorbent and disinfectant go down, and the towel goes in the bag, not the open bin.",
  },

  lateNotes: {
    "new-cable": "Not yet — the new cable goes on only after the stack is pinned and the old cable is off.",
    "contact-time": "The disinfectant dwell comes after the bottles are sorted — a wet surface from the wrong bottle is not disinfected however long it sits.",
  },

  steps: [
    {
      id: "read-work-order", kind: "select", target: "work-order-card",
      title: "Read the gym's work orders",
      cue: "Read the residents' reports on treadmill two and the cable machine before touching either.",
      why: "Residents report what they felt, not what failed: a treadmill that 'hesitates under my feet' is a belt slipping on its roller, and a cable machine that 'squeaks at the top' is often a cable wearing through at the pulley. Reading the reports first tells you which machine is merely annoying and which one could drop a weight stack on somebody today.",
    },
    {
      id: "walk-gym", kind: "find", noHint: true,
      targets: ["frayed-cable", "cord-under-mat"],
      itemNames: { "frayed-cable": "frayed strands at the top pulley", "cord-under-mat": "treadmill cord crushed under a floor mat" },
      itemNotes: {
        "frayed-cable": "Broken wires are fanning out of the cable where it wraps the top pulley. A steel cable fails a few strands at a time and then all at once — this machine is out of service until the cable is replaced.",
        "cord-under-mat": "Treadmill one's power cord runs under a rubber mat and is being walked on and rolled over. A cord crushed like that breaks its insulation where nobody can see it, on a machine drawing heavy current.",
      },
      title: "Walk the gym before you start",
      cue: "Find what is about to hurt a resident who walks in right now.",
      why: "A residents' gym is unstaffed most of the day, so nobody is there to stop a resident using a machine that is about to fail. The walk finds the failure that is not on any work order yet, and it lets you take a machine out of service before the next early-morning resident discovers the problem with their hands.",
    },
    {
      id: "lockout-treadmill", kind: "sequence",
      targets: ["treadmill-unplug", "plug-lockout-cap", "treadmill-tryout"],
      itemNames: { "treadmill-unplug": "treadmill unplugged", "plug-lockout-cap": "plug locked in its cap", "treadmill-tryout": "start pressed to prove it dead" },
      title: "Lock out treadmill two",
      cue: "Unplug it, lock the plug in its cap, then press start to prove it will not run.",
      why: "A plug-connected machine counts as locked out only when the plug is out and under your exclusive control — a plug left on the floor gets pushed back in by a resident who thinks the treadmill was knocked off. The lockout cap keeps the plug yours, and the start button proves you unplugged the right machine.",
      outOfOrderNote: "Unplug, cap, then try it — pressing start with the plug still in proves nothing, and an uncapped plug is anybody's to push back in.",
    },
    {
      id: "tension-belt", kind: "turn", target: "belt-tension-bolt",
      title: "Take up the belt tension",
      cue: "Turn the rear roller's tension bolt a quarter turn at a time, both sides even.",
      why: "A treadmill belt slips when it has stretched and lost its grip on the drive roller, and that hesitation under a running resident's foot is how ankles turn and people fall off the back. Tensioning both rear bolts evenly takes up the stretch without pulling the belt off-centre, which a bolt cranked on one side always does.",
      turn: { turns: 0.5, axis: "x", label: "TENSION BOLT" },
    },
    {
      id: "check-deflection", kind: "gauge", target: "belt-deflection",
      title: "Check the belt's lift at mid-deck",
      cue: "Lift the belt at mid-deck and commit when the gauge sits in the manufacturer's band.",
      why: "Too loose and the belt slips; too tight and it overloads the motor, wears the rollers and burns out the controller within weeks. The manufacturer's lift figure at mid-deck is the one number that says both are right, and reading it is quicker than guessing at the bolt and discovering the answer when the motor fails.",
      gauge: { label: "BELT LIFT", speed: 0.55, green: [0.36, 0.58], readout: (t) => `${(t * 5).toFixed(1)} in`, missNote: "Outside the manufacturer's band — loose slips under a runner, tight burns out the motor. Adjust and read it again." },
    },
    {
      id: "pin-stack", kind: "hold", target: "stack-pin", seconds: 5,
      title: "Hold the weight stack on its safety pin",
      cue: "Seat the pin through the stack's bottom plate and hold it while the old cable is taken off.",
      why: "While the frayed cable comes off, the only thing holding the weight stack is what you put under it. Seating the pin fully through the bottom plate into the frame lets the plates rest on steel rather than on a cable with broken strands, and holding it until the cable is clear keeps the stack from shifting on a half-seated pin.",
      holdBreakNote: "You let go before the cable was off. A pin that has not been held home can walk out, and the stack comes down onto whatever is beneath it — hold it through.",
    },
    {
      id: "fit-new-cable", kind: "drag", target: "new-cable",
      title: "Fit the new cable over the top pulley",
      cue: "Carry the manufacturer's replacement cable to the top pulley and seat it.",
      why: "A replacement cable has to be the manufacturer's length, diameter and end fittings, because a cable a little long lets the stack bottom out and a little thin fails early. Carrying the new one up to the pulley and seating it in the groove — not across the guard — is what makes the machine the machine it was designed to be.",
      drag: { to: "pulley-slot", radius: 0.5, missNote: "Not seated in the pulley — a cable riding the guard or the flange frays itself in a week." },
    },
    {
      id: "test-run", kind: "track", target: "belt-tracking", seconds: 7,
      title: "Test run the treadmill and watch the belt track",
      cue: "Restore power and run it at walking speed, keeping the belt centred on the deck.",
      why: "A belt tensioned unevenly walks towards one side under load and starts to fray on the frame, and the first sign of it is in the first few minutes of running. Watching the belt track at walking speed, with the rear bolts in reach, catches the drift while it is a quarter-turn adjustment rather than a new belt.",
      track: { start: 0.25, green: [0.38, 0.62], rise: 0.44, fall: 0.38, drift: 0.12, label: "BELT TRACKING", readout: (v) => (v < 0.38 ? "drifting left" : v > 0.62 ? "drifting right" : "centred") },
      holdBreakNote: "The belt drifted off centre. Left running, it frays against the frame — bring it back to centre with the bolt, a quarter at a time.",
    },
    {
      id: "walk-disinfectant", kind: "find", noHint: true,
      targets: ["decanted-bottle", "wipes-empty"],
      itemNames: { "decanted-bottle": "unlabelled spray bottle of mystery cleaner", "wipes-empty": "empty disinfectant wipe dispenser" },
      itemNotes: {
        "decanted-bottle": "Somebody decanted a cleaner into a bare spray bottle. With no label there is no contact time, no incompatibility warning and no first aid — it comes off the station.",
        "wipes-empty": "The wipe dispenser by the door is empty. Residents who cannot wipe down a bench on the way out do not, and the next resident lies on it.",
      },
      title: "Walk the disinfectant station",
      cue: "Find what stops residents disinfecting properly — or has them using the wrong thing.",
      why: "A gym is a shared surface for skin, sweat and occasionally blood, and the disinfectant station is the building's only control on it most of the day. The hazard communication standard's label rule is the whole point here: a disinfectant only works at its labelled concentration and contact time, and a bottle with no label has neither.",
    },
    {
      id: "contact-time", kind: "hold", target: "contact-time", seconds: 5,
      title: "Hold the disinfectant's contact time on the bench",
      cue: "Keep the bench visibly wet for the label's full contact time before wiping.",
      why: "A disinfectant's label claim — the germs it kills — only holds if the surface stays wet for the contact time printed on it. Sprayed and wiped dry straight away, the bench looks clean and has been disinfected of almost nothing, which is the difference between a cleaning habit and the label the manufacturer tested.",
      holdBreakNote: "You wiped before the contact time was up. The surface looks clean and has not been disinfected — keep it wet through the full time.",
    },
    {
      id: "return-treadmill", kind: "sequence",
      targets: ["plug-cap-off", "treadmill-plug-in"],
      itemNames: { "plug-cap-off": "lockout cap off the plug", "treadmill-plug-in": "treadmill plugged back in" },
      title: "Return treadmill two to service",
      cue: "Take your lockout cap off, then plug the treadmill back into its own outlet.",
      why: "The cap comes off only when you have finished, walked the machine and put the motor hood back on, because the moment the plug is back in a resident can start the belt. Plugging it into its own outlet — not a power strip — matters on a treadmill: the motor's starting current is exactly what overheats a strip and its cord.",
      outOfOrderNote: "Cap off first, then the plug — you cannot plug in a capped plug, and trying to is a sign the walk-round has been skipped.",
    },
    {
      id: "crew-checkin", kind: "select", target: "attendant-checkin",
      title: "Check in with the attendant on shift",
      cue: "Hand over the cable machine's history and the collapse, and ask how the attendant is doing.",
      why: "The attendant who opens the gym tomorrow needs to know which machine was repaired and which resident went down, so they are not caught out by either. And a colleague who has just helped with a collapse on the rower is carrying something — asking how they are, in person, is part of the same care the room just gave the resident.",
    },
    {
      id: "building-log", kind: "select", target: "building-log",
      title: "Enter the repairs and the incident in the building log",
      cue: "Log the lockouts, the cable replaced, the belt readings, the disinfectant findings and the AED use.",
      why: "The building log is where the cable's replacement date lives when the next one frays, and where the AED use is recorded so the unit can be restocked and the pads replaced. It is also the record that shows a resident's injury, if one is ever claimed, happened on a machine that had been inspected, repaired under lockout and tested.",
    },
  ],

  interrupts: [
    {
      id: "assistance-animal",
      kind: "Resident with an assistance-animal question",
      after: "pin-stack", delay: 3, seconds: 13,
      alert: "While you hold the stack pin, a resident comes to the door with a dog and asks whether it can come in — the sign on the door says no pets.",
      cue: "Call the office on the intercom so the manager handles it as an accommodation request. Don't ask about her disability or demand papers.",
      target: "office-intercom",
      why: "Under the Fair Housing Act an assistance animal is not a pet, and a no-pets sign does not settle whether this one may come in. Front-line staff do not ask what a resident's disability is or demand documents at the door — the office runs the accommodation process, and routing her there politely is both the law and the respect she is owed.",
      missNote: "She stood at the door with the dog the whole window and nobody answered her. Left unanswered, a resident reads the sign as the building's answer, and that is how a fair housing complaint starts.",
      wrongNote: "That doesn't answer her. The intercom to the office puts the question with the people who handle accommodation requests.",
    },
    {
      id: "rower-collapse",
      kind: "Resident collapses on the rower",
      after: "test-run", delay: 3, seconds: 12,
      alert: "The resident on the rower slumps sideways off the seat and does not respond when the machine's handle clatters to the floor.",
      cue: "Get the AED from its cabinet — its alarm calls the desk — and call 911 on the way. The treadmill test can wait.",
      target: "aed-cabinet",
      why: "In a sudden cardiac arrest every minute without a shock costs a large share of the chance of survival, and an AED in the room only helps if somebody brings it. Opening the cabinet sounds the alarm to the desk, the unit talks the rescuer through the pads, and 911 is called at the same moment — first aid is minutes, not a work order.",
      missNote: "The resident lay by the rower the whole window with the AED still in its cabinet. Those were the minutes that decide whether a cardiac arrest is survivable.",
      wrongNote: "That doesn't help the resident. The AED cabinet on the wall is what has to reach him — open it and call 911.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root, 0, 0, -0.3);
    stationPad(g, 2.4, PMFR_ACCENT);

    // ------------------------------------------------------------ rubber floor, mirror wall
    const floorTex = surfaceTexture((cx, w, h) => pavingFace(cx, w, h, { tiles: 4, base: "#2e3236", base2: "#282c30", seam: "rgba(120,130,140,0.25)" }), { repeat: 5, px: 384 });
    const floor = box(g, 6.2, 0.02, 4.8, 0, 0.011, -0.3, 0x2e3236, { rough: 0.95 });
    floor.material = texturedMat(floorTex, { rough: 0.95, metal: 0.0, color: 0x3a3f44 });
    for (let i = 0; i < 3; i++) box(g, 1.8, 1.8, 0.02, -1.9 + i * 1.9, 1.3, -2.55, 0xcfe0ea, { rough: 0.05, metal: 0.9 });
    box(g, 5.8, 0.06, 0.04, 0, 2.23, -2.54, 0x8b929a, { rough: 0.4, metal: 0.6 });

    // ------------------------------------------------------------ treadmill two (the job) and one (scenery)
    function treadmill(parent, x, z) {
      const t = group(parent, x, 0, z);
      box(t, 0.8, 0.18, 1.9, 0, 0.12, 0, 0x2b3138, { rough: 0.6, metal: 0.3 });
      const belt = box(t, 0.6, 0.02, 1.7, 0, 0.22, 0.05, 0x1b1e22, { rough: 0.9 });
      for (const sx of [-1, 1]) {
        box(t, 0.05, 1.1, 0.05, sx * 0.38, 0.72, -0.8, 0x8b929a, { rough: 0.4, metal: 0.7 });
        box(t, 0.05, 0.05, 0.6, sx * 0.38, 1.1, -0.55, 0x8b929a, { rough: 0.4, metal: 0.7 });
      }
      box(t, 0.8, 0.3, 0.2, 0, 1.28, -0.85, 0x3a4450, { rough: 0.5 });
      const hood = box(t, 0.8, 0.22, 0.34, 0, 0.26, -0.9, 0x5d6771, { rough: 0.5, metal: 0.3 });
      return { t, belt, hood };
    }
    const tm1 = treadmill(g, -2.4, -1.2);
    void tm1;
    const tm2 = treadmill(g, -1.35, -1.2);
    holoTag(tm2.t, "treadmill 2 · slipping", 0, 1.6, -0.85, { css: PMFR_CSS, w: 0.4 });
    const console2 = decal(tm2.t, 0.3, 0.12, 0, 1.3, -0.74, signFace("0.0 MPH", { bg: "#0d1c24", accent: PMFR_CSS, fg: "#ffe2c8", scale: 0.45 }), { glow: true, ei: 0.8, px: 192 });
    const startKey = cyl(tm2.t, 0.03, 0.03, 0.02, 0.25, 1.3, -0.74, 0x59c97b, { rough: 0.4, seg: 12 });
    startKey.rotation.x = Math.PI / 2;
    reg(hits, startKey, "treadmill-tryout");
    const hoodLive = box(tm2.t, 0.8, 0.22, 0.02, 0, 0.26, -0.72, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(tm2.t, "pull the hood now?", 0, 0.52, -0.7, { css: PMFR_WARN, w: 0.34 });
    reg(hits, hoodLive, "hood-off-live");
    const tBolt = group(tm2.t, 0.34, 0.14, 0.93);
    cyl(tBolt, 0.022, 0.022, 0.06, 0, 0, 0, 0xc7cdd2, { rough: 0.3, metal: 0.9, seg: 6 }).rotation.x = Math.PI / 2;
    box(tBolt, 0.05, 0.05, 0.02, 0, 0, 0.03, 0xc7cdd2, { rough: 0.3, metal: 0.9 });
    reg(hits, tBolt, "belt-tension-bolt");
    holoTag(tm2.t, "rear roller bolt", 0.34, 0.34, 0.95, { css: PMFR_CSS, w: 0.28 });
    const deflect = instrument(tm2.t, -0.1, 0.3, 0.2, { idle: "-.- in", color: 0xf2c14b, w: 0.12, d: 0.18 });
    reg(hits, deflect, "belt-deflection");
    const trackScreen = decal(tm2.t, 0.24, 0.07, 0, 1.46, -0.74, signFace("TRACK --", { bg: "#0d1c24", accent: PMFR_CSS, fg: "#ffe2c8", scale: 0.45 }), { glow: true, ei: 0.8, px: 160 });
    reg(hits, trackScreen, "belt-tracking");
    // Cords and wall outlets for both.
    const outlet = group(g, -1.35, 0.4, -2.52);
    box(outlet, 0.12, 0.16, 0.03, 0, 0, 0, 0xf0f2f4, { rough: 0.5 });
    const plug = group(g, -1.2, 0.05, -1.95);
    box(plug, 0.06, 0.04, 0.08, 0, 0, 0, 0x22262b, { rough: 0.5 });
    reg(hits, plug, "treadmill-unplug");
    hose(g, [[-1.35, 0.15, -2.1], [-1.25, 0.03, -2.0], [-1.2, 0.05, -1.95]], 0.008, 0x22262b, { steps: 8 });
    const plugCap = group(g, -1.0, 0.05, -1.85);
    box(plugCap, 0.1, 0.08, 0.12, 0, 0, 0, 0xd8232a, { rough: 0.5 });
    reg(hits, plugCap, "plug-lockout-cap");
    const capLock = lockTag(plugCap, 0, 0.08, 0.07);
    capLock.visible = false;
    const capOffMark = box(g, 0.14, 0.12, 0.14, -0.85, 0.07, -1.85, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, capOffMark, "plug-cap-off");
    const plugInMark = box(outlet, 0.14, 0.18, 0.04, 0, 0, 0.02, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, plugInMark, "treadmill-plug-in");
    const mat1 = box(g, 0.9, 0.02, 0.6, -2.4, 0.03, -0.05, 0x1b1e22, { rough: 0.95 });
    void mat1;
    const crushedCord = hose(g, [[-2.4, 0.15, -2.1], [-2.3, 0.03, -0.4], [-2.35, 0.04, 0.2], [-2.6, 0.04, 0.3]], 0.009, 0x22262b, { steps: 14 });
    reg(hits, crushedCord, "cord-under-mat");

    // ------------------------------------------------------------ cable machine
    const cm = group(g, 0.9, 0, -1.9);
    for (const sx of [-1, 1]) box(cm, 0.08, 2.1, 0.08, sx * 0.3, 1.05, 0, 0x2b3138, { rough: 0.5, metal: 0.5 });
    box(cm, 0.7, 0.08, 0.3, 0, 2.12, 0, 0x2b3138, { rough: 0.5, metal: 0.5 });
    box(cm, 0.7, 0.1, 0.5, 0, 0.05, 0.1, 0x2b3138, { rough: 0.5, metal: 0.5 });
    const stack = group(cm, 0, 0, 0);
    for (let i = 0; i < 10; i++) box(stack, 0.4, 0.06, 0.2, 0, 0.4 + i * 0.065, 0, 0x3a3f45, { rough: 0.5, metal: 0.6 });
    for (const sx of [-1, 1]) cyl(cm, 0.012, 0.012, 1.9, sx * 0.15, 1.05, 0, CITY.steel, { rough: 0.3, metal: 0.9, seg: 8 });
    const pin = group(cm, 0.26, 0.4, 0.05);
    cyl(pin, 0.012, 0.012, 0.22, 0, 0, 0, CITY.steel, { rough: 0.3, metal: 0.9, seg: 8 }).rotation.z = Math.PI / 2;
    ball(pin, 0.03, 0.12, 0, 0, 0xd8232a, { rough: 0.5, seg: 10 });
    reg(hits, pin, "stack-pin");
    holoTag(cm, "stack safety pin", 0.3, 0.6, 0.1, { css: PMFR_CSS, w: 0.3 });
    const pulley = group(cm, 0, 2.0, 0.14);
    torus(pulley, 0.07, 0.02, 0, 0, 0, 0x8b929a, { rough: 0.4, metal: 0.8, seg: 8, seg2: 18 });
    const pulleySlot = box(pulley, 0.2, 0.2, 0.08, 0, 0, 0, 0xffffff, { opacity: 0.001, transparent: true, cast: false });
    hits["pulley-slot"] = pulleySlot;
    const oldCable = cyl(cm, 0.006, 0.006, 1.3, 0, 1.4, 0.14, 0xaab2ba, { rough: 0.3, metal: 0.9, seg: 6 });
    const fray = group(cm, 0, 1.95, 0.16);
    for (let i = 0; i < 5; i++) box(fray, 0.003, 0.06, 0.003, -0.02 + i * 0.01, 0, 0, 0xc7cdd2, { rough: 0.3, metal: 0.9 }).rotation.z = -0.6 + i * 0.3;
    reg(hits, fray, "frayed-cable");
    holoTag(cm, "cable at top pulley", 0, 2.32, 0.14, { css: PMFR_CSS, w: 0.32 });
    const underStack = box(cm, 0.4, 0.1, 0.2, 0, 0.32, 0.12, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(cm, "reach under the stack?", -0.05, 0.22, 0.24, { css: PMFR_WARN, w: 0.38 });
    reg(hits, underStack, "hand-under-stack");
    const newCable = group(g, 1.75, 0.85, -0.8);
    torus(newCable, 0.12, 0.012, 0, 0, 0, 0xc7cdd2, { rough: 0.3, metal: 0.9, seg: 6, seg2: 24 }).rotation.x = Math.PI / 2;
    torus(newCable, 0.1, 0.012, 0, 0.02, 0, 0xc7cdd2, { rough: 0.3, metal: 0.9, seg: 6, seg2: 24 }).rotation.x = Math.PI / 2;
    reg(hits, newCable, "new-cable");
    holoTag(newCable, "replacement cable", 0, 0.2, 0, { css: PMFR_CSS, w: 0.3 });
    const partsCart = group(g, 1.75, 0, -0.8);
    box(partsCart, 0.5, 0.04, 0.4, 0, 0.8, 0, 0x8b929a, { rough: 0.4, metal: 0.6 });
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) box(partsCart, 0.03, 0.8, 0.03, sx * 0.22, 0.4, sz * 0.17, 0x8b929a, { rough: 0.4, metal: 0.6 });

    // ------------------------------------------------------------ dumbbell rack, bench, rower
    const rack = group(g, 2.6, 0, -1.3, -Math.PI / 2);
    box(rack, 1.4, 0.05, 0.4, 0, 0.6, 0, 0x2b3138, { rough: 0.5, metal: 0.5 });
    for (const sx of [-1, 1]) box(rack, 0.05, 0.6, 0.4, sx * 0.68, 0.3, 0, 0x2b3138, { rough: 0.5, metal: 0.5 });
    for (let i = 0; i < 5; i++) {
      for (const sz of [-0.1, 0.1]) cyl(rack, 0.05 + i * 0.006, 0.05 + i * 0.006, 0.05, -0.55 + i * 0.27, 0.68, sz, 0x1b1e22, { rough: 0.6, seg: 12 }).rotation.z = Math.PI / 2;
    }
    const bench = group(g, 1.0, 0, 0.55, 0.2);
    box(bench, 0.35, 0.08, 1.2, 0, 0.45, 0, 0x7a2f2f, { rough: 0.6 });
    for (const sz of [-0.45, 0.45]) box(bench, 0.3, 0.42, 0.05, 0, 0.21, sz, 0x2b3138, { rough: 0.5, metal: 0.5 });
    const bloodSpot = cyl(bench, 0.05, 0.05, 0.004, 0.05, 0.492, 0.2, 0x8a1010, { rough: 0.6, seg: 12 });
    const bloodTowel = group(bench, -0.25, 0.5, 0.35);
    box(bloodTowel, 0.14, 0.02, 0.1, 0, 0, 0, 0xf4f4f0, { rough: 0.9 });
    holoTag(bench, "wipe it bare-handed?", 0, 0.72, 0.3, { css: PMFR_WARN, w: 0.36 });
    reg(hits, bloodTowel, "barehand-blood");
    const contactZone = box(bench, 0.35, 0.03, 0.5, 0, 0.5, -0.3, 0x9fd4ff, { rough: 0.1, opacity: 0.35, transparent: true, cast: false });
    reg(hits, contactZone, "contact-time");
    holoTag(bench, "disinfect: keep wet", 0, 0.66, -0.35, { css: PMFR_CSS, w: 0.34 });
    const rower = group(g, 2.1, 0, 0.9, -0.3);
    box(rower, 0.14, 0.1, 2.0, 0, 0.3, 0, 0x2b3138, { rough: 0.5, metal: 0.5 });
    cyl(rower, 0.25, 0.25, 0.2, 0, 0.5, -0.95, 0x3a4450, { rough: 0.5, seg: 18 }).rotation.z = Math.PI / 2;
    box(rower, 0.3, 0.06, 0.3, 0, 0.4, 0.3, 0x1b1e22, { rough: 0.6 });
    const rowerRider = seatedFigure(rower, 0, 0.44, 0.3, { ry: Math.PI, cloth: 0x4a7a5a });

    // ------------------------------------------------------------ disinfectant station, AED, intercom, door
    const station = group(g, -2.7, 0, 1.0, Math.PI / 2);
    box(station, 0.6, 0.9, 0.3, 0, 0.45, 0, 0xdfe4e8, { rough: 0.5 });
    const wipes = cyl(station, 0.09, 0.09, 0.25, -0.15, 1.05, 0, 0xf4f4f0, { rough: 0.5, seg: 14 });
    reg(hits, wipes, "wipes-empty");
    const quat = cyl(station, 0.045, 0.045, 0.22, 0.05, 1.01, 0, 0x6fb8e8, { rough: 0.3, seg: 10 });
    decal(quat, 0.07, 0.05, 0, 0.02, 0.047, signFace("QUAT", { bg: "#1b1e22", accent: "#6fb8e8", scale: 0.45 }), { px: 96 });
    const bleachJug = group(station, 0.2, 0.9, 0.05);
    box(bleachJug, 0.12, 0.2, 0.08, 0, 0.1, 0, 0xf4f6f8, { rough: 0.4 });
    holoTag(station, "top it up with bleach?", 0.2, 1.3, 0.06, { css: PMFR_WARN, w: 0.38 });
    reg(hits, bleachJug, "bleach-quat-mix");
    const decanted = group(station, 0.05, 0.9, -0.1);
    cyl(decanted, 0.035, 0.035, 0.16, 0.3, 0.08, 0, 0xeef3f6, { rough: 0.3, opacity: 0.8, transparent: true, seg: 10 });
    reg(hits, decanted, "decanted-bottle");
    const aed = group(g, -2.95, 1.25, -0.4, Math.PI / 2);
    box(aed, 0.4, 0.45, 0.14, 0, 0, 0, 0xf4f4f0, { rough: 0.4 });
    const aedDoor = box(aed, 0.36, 0.4, 0.02, 0, 0, 0.08, 0xcfe6c8, { rough: 0.2, opacity: 0.7, transparent: true });
    const aedUnit = box(aed, 0.24, 0.24, 0.1, 0, -0.02, 0.02, 0x59c97b, { rough: 0.5 });
    decal(aed, 0.3, 0.08, 0, 0.18, 0.09, signFace("AED", { bg: "#2f8a3c", accent: "#f4f4f0", fg: "#ffffff", scale: 0.6 }), { px: 128 });
    reg(hits, aed, "aed-cabinet");
    const aedStrobe = ball(aed, 0.03, 0.18, 0.26, 0.05, 0x3a4450, { rough: 0.4, seg: 10 });
    const strobeOn = mat(0xf0645b, { emissive: 0xf0645b, ei: 1.8, rough: 0.3 });
    const strobeIdle = aedStrobe.material;
    const intercom = group(g, 2.95, 1.35, 0.2, -Math.PI / 2);
    box(intercom, 0.16, 0.26, 0.05, 0, 0, 0, 0x3a4450, { rough: 0.5 });
    const icLight = ball(intercom, 0.018, 0, 0.09, 0.03, 0x8b929a, { rough: 0.4, seg: 8 });
    reg(hits, intercom, "office-intercom");
    holoTag(intercom, "office intercom", 0, 0.2, 0.03, { css: PMFR_CSS, w: 0.28 });
    const door = group(g, 2.95, 0, 1.3, -Math.PI / 2);
    box(door, 0.95, 2.1, 0.05, 0, 1.05, 0, 0x8b6d4a, { rough: 0.7 });
    box(door, 0.35, 0.8, 0.02, 0, 1.4, 0.03, 0xcfe0ea, { rough: 0.1, opacity: 0.6, transparent: true });
    decal(door, 0.26, 0.18, 0, 0.9, 0.04, paperFace("NO PETS", ["Residents only", "Hours 5 am – 11 pm"], { bg: "#f4efe0", band: "#7a2f2f" }), { px: 160 });

    // ------------------------------------------------------------ work orders, log, fountain
    const workOrder = decal(g, 0.3, 0.36, 0.1, 1.5, -2.52, paperFace("WORK ORDERS", ["TM2 hesitates underfoot", "Cable machine squeaks", "at the top pulley", "— 5B, 8A"], { bg: "#f4efe0", band: "#7a4a2a" }), { px: 256 });
    reg(hits, workOrder, "work-order-card");
    const logBoard = holoPanel(g, 0.56, 0.38, -2.3, 1.7, 1.6, (ctx, w, h) => {
      ctx.fillStyle = "rgba(22,14,8,0.9)"; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = PMFR_CSS; ctx.fillRect(0, 0, w, 5);
      ctx.fillStyle = "#fbeee4";
      ctx.font = `600 ${Math.round(h * 0.14)}px 'Barlow Condensed', Arial, sans-serif`;
      ctx.textAlign = "center"; ctx.textBaseline = "middle";
      ctx.fillText("BUILDING LOG · GYM", w / 2, h * 0.22);
      ctx.font = `${Math.round(h * 0.085)}px Arial, sans-serif`; ctx.fillStyle = "#eed8c8";
      ["TM2 lockout · belt lift", "cable replaced · date", "disinfectant findings", "AED used · pads to restock"].forEach((l, i) => ctx.fillText(l, w / 2, h * (0.42 + i * 0.14)));
    }, { ry: 0.6, accent: PMFR_ACCENT });
    reg(hits, logBoard, "building-log");
    const fountain = group(g, 0.1, 0, -2.4);
    box(fountain, 0.4, 0.9, 0.3, 0, 0.45, 0, 0xc7cdd2, { rough: 0.4, metal: 0.6 });
    box(fountain, 0.3, 0.06, 0.24, 0, 0.93, 0.02, 0x9aa2a8, { rough: 0.3, metal: 0.7 });

    // ------------------------------------------------------------ crew
    const attendant = standingFigure(g, -0.3, 1.1, { ry: 2.9, cloth: 0x7a4a2a, trousers: 0x2b3138 });
    reg(hits, attendant, "attendant-checkin");
    const visitor = standingPerson(g, 2.2, 1.95, { ry: -2.2, cloth: 0x5a6a9a, hiVis: false });
    visitor.root.visible = false;
    const dog = group(visitor.root, 0.45, 0, 0.1);
    box(dog, 0.5, 0.22, 0.18, 0, 0.35, 0, 0x8a6a3a, { rough: 0.9 });
    ball(dog, 0.1, 0.28, 0.5, 0, 0x8a6a3a, { rough: 0.9, seg: 10 });
    for (const sx of [-0.18, 0.18]) for (const sz of [-0.06, 0.06]) box(dog, 0.04, 0.24, 0.04, sx, 0.12, sz, 0x6a4a2a, { rough: 0.9 });

    let strobe = false;

    return {
      hits,
      footprint: 2.4,
      spawnLook: new THREE.Vector3(-0.2, 1.0, -1.3),

      onStepComplete(step) {
        if (step.id === "walk-gym") { oldCable.material = mat(0xf0645b, { rough: 0.5 }); crushedCord.visible = false; }
        if (step.id === "lockout-treadmill") { capLock.visible = true; plug.position.set(-1.0, 0.12, -1.85); }
        if (step.id === "tension-belt") tBolt.rotation.z = 0.8;
        if (step.id === "check-deflection") repaint(deflect.userData.screen, signFace("OK", { bg: "#0d1c14", accent: "#59c97b", fg: "#e9ffe9", scale: 0.6 }));
        if (step.id === "pin-stack") oldCable.visible = false;
        if (step.id === "fit-new-cable") { newCable.visible = false; fray.visible = false; oldCable.visible = true; oldCable.material = mat(0xdfe4e8, { rough: 0.3, metal: 0.9 }); }
        if (step.id === "test-run") repaint(console2, signFace("2.5 MPH ✓", { bg: "#0d1c14", accent: "#59c97b", fg: "#e9ffe9", scale: 0.45 }));
        if (step.id === "walk-disinfectant") { decanted.visible = false; wipes.material = mat(0x59c97b, { rough: 0.5 }); }
        if (step.id === "contact-time") { contactZone.visible = false; bloodSpot.visible = false; }
        if (step.id === "return-treadmill") { capLock.visible = false; plug.position.set(-1.35, 0.4, -2.48); }
      },

      onInterrupt(it) {
        if (it.id === "assistance-animal") visitor.root.visible = true;
        if (it.id === "rower-collapse") { rowerRider.root.rotation.z = 1.1; rowerRider.root.position.set(0.35, 0.1, 0.3); strobe = true; aedStrobe.material = strobeOn; }
      },
      onInterruptEnd(it) {
        if (it.id === "assistance-animal") {
          if (it.resolved === "answered") { icLight.material = mat(0x59c97b, { emissive: 0x59c97b, ei: 1.2, rough: 0.4 }); visitor.root.position.set(1.7, 0, 1.6); }
          else visitor.root.visible = false;
        }
        if (it.id === "rower-collapse") {
          strobe = false; aedStrobe.material = strobeIdle;
          if (it.resolved === "answered") { aedDoor.visible = false; aedUnit.position.set(0, -1.1, 0.5); }
        }
      },

      animate(t, dt, session) {
        attendant.userData.head.rotation.y = Math.sin(t * 0.4) * 0.3;
        if (strobe) aedStrobe.visible = Math.sin(t * 12) > 0; else aedStrobe.visible = true;
        const gg = session?.gauge;
        if (gg && !gg.committed && session.step?.id === "check-deflection") {
          repaint(deflect.userData.screen, signFace(`${(gg.t * 5).toFixed(1)} in`, { bg: "#0d1c24", accent: gg.t >= 0.36 && gg.t <= 0.58 ? "#59c97b" : "#f2ae14", fg: "#bfeaf7", scale: 0.55 }));
        }
        if (session?.track && session.step?.id === "test-run") {
          const v = session.track.v;
          tm2.belt.position.x = (v - 0.5) * 0.12;
          if (Math.floor(t * 4) !== Math.floor((t - dt) * 4)) repaint(trackScreen, signFace(v < 0.38 ? "◄ LEFT" : v > 0.62 ? "RIGHT ►" : "CENTRED", { bg: "#0d1c24", accent: v >= 0.38 && v <= 0.62 ? "#59c97b" : "#f0645b", fg: "#ffe2c8", scale: 0.45 }));
        }
      },
    };
  },
};
