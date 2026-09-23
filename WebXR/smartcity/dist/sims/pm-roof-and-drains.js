import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, ball, torus, slab, group, decal, repaint, signFace, paperFace, mat, particles,
} from "../../../shared/kit.js";
import {
  CITY, stationPad, holoPanel, holoTag, standingFigure, lockTag, reg,
  surfaceTexture, texturedMat, pavingFace, waterFace,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Roof and Drains VR — Building Systems & Facilities, property
// management programme, zone nine of twenty.
//
// The low-slope roof of a mid-rise residential building, walked before a
// storm the way an IUOE Local 39 building engineer walks it: the roof access
// log signed, the hatch climbed hands-free and guarded behind, the wind read,
// the route walked in travel restraint inside the warning line, the drains
// and scuppers walked, debris bagged, a slow drain augered, an exhaust fan
// locked out for a belt check and restored, and the roof written into the
// building log. A generic building and a generic storm; no real contractor
// or address is named.

const PMRD_ACCENT = 0x4fb0c6;

export const SIM_PM_ROOF_AND_DRAINS = {
  id: "pm-roof-and-drains",
  index: "309",
  domain: "Property Management",
  trade: "Building engineer — IUOE Local 39 stationary engineers, with SEIU porters on the ground and the roofing contractor under permit",
  category: "Building Systems & Facilities",
  district: "Building Systems & Facilities",
  weather: "wind",
  certification: "OSHA 29 CFR 1910.28 for fall protection on a low-slope roof — guardrail, travel restraint or personal fall arrest near the edge, a designated area behind a warning line further back, and covers or screens over skylights and hatches; 29 CFR 1910.23 for a fixed ladder climbed with hands free; ANSI Z359 for the anchor, harness and lanyard used in restraint; 29 CFR 1910.147 for locking out a rooftop fan before its housing is opened; NFPA 51B and 29 CFR 1910.252 for torch work on a roof under a hot work permit with a fire watch; the local building code's roof drainage and overflow requirements; IUOE Local 39 building engineers and SEIU porters.",
  supportLine: "IUOE Local 39's member services or your employer's EAP",
  name: "Roof and Drains",
  title: simTitle("Roof and Drains"),
  tagline: "The roof walked before a storm: access logged, the hatch climbed and guarded, wind read, the route walked in restraint, drains and scuppers cleared, a slow drain augered, a fan locked out for a belt check and restored",
  accent: PMRD_ACCENT,
  accentCss: "#4fb0c6",
  parSeconds: 290,
  footprint: 2.6,
  badge: { id: "drains-clear", name: "Drains Clear", note: "A roof walked, drained and checked with nobody past the warning line and nothing opened live" },

  game: system({
    name: "Roof Round",
    currency: "DRAINS",
    ranks: ["Engineer Trainee", "Building Engineer", "Senior Engineer", "Chief Engineer", "Roof Round Certified"],
    badges: [
      { id: "inside-the-line", name: "Inside the Line", note: "No unsafe action anywhere on the roof", test: AWARD.safe },
      { id: "hatch-guarded", name: "Hatch Guarded", note: "Climbed and guarded the hatch in order on the first try", test: AWARD.stepClean("hatch-climb") },
      { id: "steady-restraint", name: "Steady Restraint", note: "Every timed task carried through without a break", test: AWARD.unbroken },
    ],
    challenges: [
      { id: "clean-roof", name: "Clean Roof", note: "No corrections anywhere", test: AWARD.clean },
      { id: "before-the-rain", name: "Before the Rain", note: "Inside 80% of par", test: AWARD.fast(0.8) },
      { id: "nine-clear", name: "Nine Clear", note: "Nine correct actions in a row", test: AWARD.streak(9) },
    ],
  }),

  hazards: {
    "unprotected-edge": "You are stepping past the warning line towards the open edge to look down at the gutter. There is no parapet on this stretch and nothing between you and the street. 29 CFR 1910.28 wants a guardrail, travel restraint or fall arrest within six feet of that edge for exactly this glance — most roof falls happen to someone who only meant to take a quick look.",
    "skylight-step": "You are stepping onto the skylight to get round the fan. A skylight dome is plastic on a curb, rated for rain and not for a person, and 29 CFR 1910.28 wants skylights screened or guarded because from above a dirty dome looks like part of the roof. People go through them every year onto the floor below.",
    "tool-bag-carry": "You are about to climb the hatch ladder with the auger and the tool bag in your hands. 29 CFR 1910.23 does not allow carrying anything on a ladder that could make you lose your balance — both hands belong on the rails. Tools go up on a line or in a bag hauled up after you are through the hatch.",
    "fan-housing-live": "You are unscrewing the exhaust fan's housing with the disconnect still on. The fan can start on its thermostat or its schedule at any moment and the belt and pulley will take fingers. 29 CFR 1910.147 wants it off at the disconnect with your own lock on it before the housing comes open.",
  },

  lateNotes: {
    "fan-lock": "Your lock goes on once the disconnect is off — not before, and not on a live handle.",
    "belt-gauge": "The belt is checked only with the fan locked out and the housing open.",
    "building-log": "The roof goes into the log when you are back down the hatch with it closed behind you.",
  },

  steps: [
    {
      id: "roof-access-log", kind: "select", target: "roof-access-log",
      title: "Sign the roof access log",
      cue: "Sign out the hatch key in the roof access log: who, when, why, and when you expect to be back down.",
      why: "The roof is where a worker can be alone, out of sight and out of radio range, with an edge a few paces away. The access log is how the building knows someone is up there and when to start asking why they are not back; it is also how the engineer knows who else has been up since the last walk — the contractor who left a hatch unlatched, for one.",
    },
    {
      id: "hatch-climb", kind: "sequence", anyOrder: false,
      targets: ["hatch-ladder", "hatch-hold-open", "hatch-rail-gate"],
      itemNames: { "hatch-ladder": "ladder climbed, hands on the rails", "hatch-hold-open": "hatch lid latched open", "hatch-rail-gate": "hatch guardrail gate closed behind you" },
      title: "Climb the hatch and guard it behind you",
      cue: "Climb the fixed ladder with both hands free, latch the lid open, and close the hatch guardrail gate behind you.",
      why: "A roof hatch is two hazards at once: the ladder you climb and the hole you leave. 29 CFR 1910.23 wants hands on the rails while climbing, and 29 CFR 1910.28 treats the open hatch as a hole to be guarded. Latching the lid stops it dropping on your head; closing the rail gate stops you — or the next person — stepping back into it.",
      outOfOrderNote: "Ladder, lid, then the gate. A lid that is not latched open can drop onto the next person climbing, and an open hatch with its gate unlatched is a hole in the roof.",
    },
    {
      id: "wind-check", kind: "gauge", target: "anemometer",
      title: "Read the wind before going further",
      cue: "Read the anemometer at the hatch and commit only if the gusts are under the building's roof-work limit.",
      why: "Wind is what turns a routine roof walk into a fall: a gust catches a panel, a tarp or a person bending over a drain. The building's roof-work limit is set well below the speed that knocks a standing person over, because on a roof the gust arrives while you are off balance, not while you are braced.",
      gauge: {
        label: "WIND AT THE HATCH — GUSTS", speed: 0.55, green: [0.08, 0.4],
        readout: (t) => `${Math.round(t * 60)} mph gusts`,
        missNote: "Gusting over the roof-work limit. Wait at the hatch and read it again — the drains can wait for the wind to drop, and so can you.",
      },
    },
    {
      id: "restraint-walk", kind: "track", target: "restraint-lanyard", seconds: 6,
      title: "Walk the drain route in travel restraint",
      cue: "Clip your harness to the roof anchor and walk the drain route with the lanyard kept taut enough that you cannot reach the open edge.",
      why: "Travel restraint stops you before the edge rather than catching you after it — the gentlest fall protection there is, if the lanyard is the right length and kept that way. ANSI Z359 sets how the anchor, harness and lanyard work together; slack piling underfoot is a trip, and a lanyard let out to its end walks you right up to the edge it was chosen to keep you from.",
      track: {
        start: 0.2, green: [0.38, 0.6], rise: 0.45, fall: 0.4, drift: 0.1,
        label: "RESTRAINT LANYARD — PAY-OUT",
        readout: (v) => (v < 0.38 ? "slack piling underfoot" : v > 0.6 ? "paid out — edge within reach" : "taut, restrained"),
      },
      holdBreakNote: "The lanyard went out of the restrained band. Take up the slack or shorten it until the edge is out of reach again.",
    },
    {
      id: "roof-walk", kind: "find", noHint: true,
      targets: ["missing-strainer", "ponding", "blocked-scupper"],
      itemNames: { "missing-strainer": "drain 1 strainer dome missing", "ponding": "ponding water around drain 2", "blocked-scupper": "overflow scupper choked with leaves" },
      itemNotes: {
        "missing-strainer": "Drain 1 has lost its strainer dome. Without it, leaves go straight down the leader and block it inside the building, where nobody can reach it in a storm.",
        "ponding": "Water is standing in a wide pond around drain 2 hours after the last rain. The drain is slow, and ponded water is weight on a roof designed to shed it.",
        "blocked-scupper": "The overflow scupper through the parapet is packed with leaves. It is the roof's second way to shed water when a drain blocks; choked, the roof has none.",
      },
      title: "Walk the drains and scuppers",
      cue: "Three drainage problems on this roof will matter in tonight's storm. Find them.",
      why: "A low-slope roof is designed around its drains and its overflows, and the local building code requires both because water that cannot leave a roof loads the structure and finds its way into the units below. A storm is when every one of them is needed at once, and the walk beforehand is the only time they can be fixed dry.",
    },
    {
      id: "bag-debris", kind: "drag", target: "leaf-debris",
      title: "Bag the debris off the scupper and drain",
      cue: "Carry the pile of leaves and grit from the scupper into the debris bag.",
      why: "Debris left on a roof ends up in the next drain downstream. Bagging it and taking it down the hatch — hauled, not carried on the ladder — actually removes it, instead of relocating tonight's blockage six metres along the parapet.",
      drag: { to: "debris-bag-socket", radius: 0.55, missNote: "Not in the bag. Carry the debris all the way into the debris bag by the hatch." },
    },
    {
      id: "auger-drain", kind: "hold", target: "drain-auger", seconds: 5,
      title: "Auger the slow drain",
      cue: "Feed the drain auger into drain 2 and hold it turning until the pond starts to drain.",
      why: "A drain that ponds is blocked somewhere in the leader below the roof, usually by leaves that came through a missing strainer weeks ago. Holding the auger turning until the pond visibly moves is the only proof the blockage has broken through, and doing it before the storm keeps the water off the ceilings of the top floor.",
      holdBreakNote: "You stopped the auger before the pond started to move. Feed it again and keep it turning until the water drains.",
    },
    {
      id: "fan-disconnect-off", kind: "turn", target: "fan-disconnect",
      title: "Switch off the exhaust fan at its disconnect",
      cue: "The corridor exhaust fan is squealing. Turn its rooftop disconnect to OFF before touching the housing.",
      why: "A rooftop fan runs on a thermostat or a schedule, which means it can start without anyone touching it. The disconnect beside it is the energy-isolating device 29 CFR 1910.147 means, and it is on the roof precisely so the person working on the fan can isolate it where they stand.",
      turn: { turns: 0.25, axis: "z", label: "FAN DISCONNECT", readout: (t) => (t < 0.95 ? "ON" : "OFF") },
    },
    {
      id: "fan-lock", kind: "select", target: "fan-lock",
      title: "Lock and tag the disconnect",
      cue: "Hang your own lock and tag on the fan disconnect.",
      why: "A disconnect switched off on a roof is a disconnect somebody in the building's control room can switch back on remotely, or a contractor can flip on the way past. Your lock is what makes it yours until you take it off, which is the whole point of 29 CFR 1910.147.",
    },
    {
      id: "belt-tension", kind: "gauge", target: "belt-gauge",
      title: "Check the fan belt's tension",
      cue: "With the housing open, press the belt gauge on the span and commit when the deflection sits in the manufacturer's band.",
      why: "A squealing fan is usually a belt slipping: too loose and it glazes and fails, too tight and it wrecks the motor and fan bearings. The deflection band is what the manufacturer rates the drive for, and reading it rather than guessing is what makes the adjustment last longer than until the next hot afternoon.",
      gauge: {
        label: "BELT DEFLECTION AT MID-SPAN", speed: 0.5, green: [0.4, 0.58],
        readout: (t) => `${(t * 1.2).toFixed(2)} in deflection`,
        missNote: "Outside the manufacturer's band. Adjust and read it again — a slipping belt or a strained bearing both come back as a squeal and a work order.",
      },
    },
    {
      id: "fan-restore", kind: "turn", target: "fan-disconnect",
      title: "Close up, remove your lock and restore the fan",
      cue: "Refit the housing, take your lock off and turn the disconnect back ON.",
      why: "A fan left locked out is a corridor with no exhaust, which is a smoke-control and air-quality problem inside the building; a fan restored with the housing off is a belt and pulley in the open. Housing on, your lock off, then power — in that order, by the person whose lock it was.",
      turn: { turns: 0.25, axis: "z", label: "FAN DISCONNECT", reverse: true, readout: (t) => (t < 0.95 ? "OFF" : "ON") },
    },
    {
      id: "building-log", kind: "select", target: "building-log",
      title: "Write the roof into the building log",
      cue: "Log the wind, the strainer and scupper, the drain augered, the fan belt, the leak above 12C and the contractor stopped.",
      why: "Roof problems show up as ceiling problems weeks later, and the building log is where the link is made: the missing strainer, the drain augered, the leak reported in 12C and where it was traced on the roof plan. It is also the record that a torch was stopped on a roof with no permit, which matters to the insurer as much as to the engineer.",
    },
    {
      id: "crew-checkin", kind: "select", target: "crew-checkin-board",
      title: "Check in with the porter on the ground",
      cue: "Radio the porter who held the ground end, ask how the day went, and name the member services line.",
      why: "Roof work is solitary, exposed and often rushed ahead of weather, and the person on the ground is the one who knows you went up. A short check-in when you come down — with the support line named — closes the loop the access log opened and gives both of you a moment before the storm arrives.",
    },
  ],

  interrupts: [
    {
      id: "hotwork-contractor",
      kind: "Contractor without a permit",
      after: "restraint-walk", delay: 3, seconds: 12,
      alert: "A roofing contractor has lit a torch to patch a seam near drain 2. There is no hot work permit posted, no fire watch and no extinguisher beside him.",
      cue: "Stop the torch and check the hot work permit board.",
      target: "hot-work-permit",
      why: "Torch-applied roofing is one of the classic causes of building fires: the flame finds insulation or a wood nailer under the membrane and smoulders for hours after the crew has gone. NFPA 51B and 29 CFR 1910.252 require a permit, a fire watch during and after, and an extinguisher at hand. No permit means the torch goes out until there is one.",
      missNote: "The contractor kept torching without a permit, a fire watch or an extinguisher. Whatever smoulders under that seam tonight will do so after everyone has left the roof.",
      wrongNote: "That does not stop him. Check the hot work permit board — no permit, no flame.",
    },
    {
      id: "tenant-leak",
      kind: "Resident with a complaint",
      after: "auger-drain", delay: 2, seconds: 12,
      alert: "The desk radios: the resident in 12C reports water dripping from her ceiling by the window since the last rain, and wants to know when someone is coming.",
      cue: "Mark 12C's position on the roof plan so you can look for the source directly above it.",
      target: "leak-map",
      why: "Roof leaks travel along the deck before they drip, but they start close to where they show. Marking the unit on the roof plan while you are standing on the roof lets you look at the flashing, penetrations and seams right above her ceiling today, instead of sending someone back up after the storm has made it worse.",
      missNote: "The call went unanswered and nobody marked where 12C sits under the roof. The leak source above her window stays unlooked-for with a storm on the way.",
      wrongNote: "Not that. Mark 12C on the roof plan so you can check the roof directly above her.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(group(g, 0, 0.2, 0), 2.6, PMRD_ACCENT);

    // ------------------------------------------------------------ roof deck: membrane, parapets, open edge
    const memTex = surfaceTexture((cx, w, h) => pavingFace(cx, w, h, { tiles: 5, base: "#8a9096", base2: "#80868c", seam: "rgba(40,44,48,0.35)" }), { repeat: 3, px: 384 });
    const deck = box(g, 7.0, 0.2, 7.0, 0, 0.1, 0, 0x8a9096, { rough: 0.95 });
    deck.material = texturedMat(memTex, { rough: 0.9, metal: 0.02, color: 0xcfd4d8 });
    deck.receiveShadow = true;
    for (const [px, pz, pw, pd] of [[0, -3.5, 7.0, 0.18], [-3.5, 0, 0.18, 7.0], [3.5, -1.75, 0.18, 3.5]]) {
      box(g, pw, 0.7, pd, px, 0.55, pz, 0x9a8a7a, { rough: 0.9, finish: "concrete" });
      box(g, pw + 0.06, 0.06, pd + 0.06, px, 0.93, pz, 0xb8c0c6, { rough: 0.5, metal: 0.5 });
    }
    // Stair bulkhead in the back corner, the other way onto this roof.
    const bulk = group(g, 2.7, 0.2, -3.0);
    box(bulk, 1.2, 2.4, 1.0, 0, 1.2, 0, 0xa8a090, { rough: 0.9, finish: "concrete" });
    box(bulk, 1.3, 0.08, 1.1, 0, 2.44, 0, 0x6d7379, { rough: 0.6, metal: 0.4 });
    box(bulk, 0.02, 2.0, 0.8, -0.61, 1.0, 0.0, 0x5a626a, { rough: 0.5, metal: 0.4 });
    for (const [x, z] of [[-2.9, -2.9], [-2.9, 2.6]]) cyl(g, 0.06, 0.06, 0.9, x, 0.65, z, 0x6d7379, { rough: 0.5, metal: 0.5, seg: 8 });
    // The open edge: right-front, no parapet, painted hatch marks.
    const edge = box(g, 0.5, 0.02, 3.4, 3.25, 0.21, 1.7, 0x2b3138, { rough: 0.95, cast: false });
    for (let i = 0; i < 6; i++) box(g, 0.1, 0.006, 0.28, 3.25, 0.225, 0.3 + i * 0.56, 0xf0645b, { rough: 0.8, cast: false });
    holoTag(g, "Unprotected edge", 3.25, 0.6, 1.7, { css: "#f0645b", w: 0.36 });
    reg(hits, edge, "unprotected-edge");
    // Warning line on stanchions, about six feet back from the open edge.
    for (let i = 0; i < 5; i++) {
      cyl(g, 0.015, 0.015, 0.9, 1.45, 0.65, 0.1 + i * 0.8, 0x2b3138, { rough: 0.5, seg: 6 });
      box(g, 0.2, 0.03, 0.2, 1.45, 0.215, 0.1 + i * 0.8, 0x3a4148, { rough: 0.5 });
      if (i < 4) {
        cyl(g, 0.006, 0.006, 0.8, 1.45, 1.02, 0.5 + i * 0.8, 0xf2c14b, { rough: 0.6, seg: 4 }).rotation.x = Math.PI / 2;
        box(g, 0.01, 0.1, 0.1, 1.45, 0.96, 0.5 + i * 0.8, 0xf0645b, { rough: 0.6, cast: false });
      }
    }

    // ------------------------------------------------------------ hatch, ladder, rail
    const hatch = group(g, -1.9, 0.2, 1.8);
    box(hatch, 0.9, 0.3, 0.9, 0, 0.15, 0, 0x6d7379, { rough: 0.6, metal: 0.4 });
    box(hatch, 0.7, 0.02, 0.7, 0, 0.31, 0, 0x0a0b0d, { rough: 1.0 });
    const lid = box(hatch, 0.9, 0.05, 0.9, 0, 0.75, -0.45, 0x8b949d, { rough: 0.5, metal: 0.5 });
    lid.rotation.x = -1.4;
    lid.position.set(0, 0.75, -0.48);
    const lidLatch = box(hatch, 0.06, 0.2, 0.06, 0.4, 0.5, -0.46, 0xf2c14b, { rough: 0.5 });
    holoTag(hatch, "Lid hold-open", 0.4, 0.72, -0.4, { css: "#4fb0c6", w: 0.26 });
    reg(hits, lidLatch, "hatch-hold-open");
    const ladderTop = group(hatch, 0, 0.3, 0.2);
    for (const sx of [-0.2, 0.2]) cyl(ladderTop, 0.02, 0.02, 1.0, sx, 0.5, 0, 0xf2c14b, { rough: 0.5, metal: 0.4, seg: 6 });
    box(ladderTop, 0.4, 0.03, 0.03, 0, 0.3, 0, 0xd9a441, { rough: 0.5 });
    holoTag(ladderTop, "Hatch ladder", 0, 1.1, 0, { css: "#4fb0c6", w: 0.24 });
    reg(hits, ladderTop, "hatch-ladder");
    const rail = group(hatch, 0, 0, 0);
    for (const [x, z, w, d] of [[-0.55, 0, 0.04, 1.1], [0, 0.55, 1.1, 0.04]]) box(rail, w, 0.04, d, x, 1.1, z, 0xf2c14b, { rough: 0.5 });
    for (const [x, z] of [[-0.55, -0.55], [-0.55, 0.55], [0.55, 0.55]]) cyl(rail, 0.02, 0.02, 1.1, x, 0.55, z, 0xf2c14b, { rough: 0.5, seg: 6 });
    const gate = group(hatch, 0.55, 0, 0);
    const gateBar = box(gate, 0.04, 0.04, 1.1, 0, 1.1, 0, 0xf2c14b, { rough: 0.5 });
    void gateBar;
    box(gate, 0.04, 0.04, 1.1, 0, 0.6, 0, 0xf2c14b, { rough: 0.5 });
    gate.rotation.y = 1.1;
    holoTag(gate, "Rail gate", 0.1, 1.3, 0.3, { css: "#4fb0c6", w: 0.2 });
    reg(hits, gate, "hatch-rail-gate");
    const toolBag = group(g, -1.3, 0.2, 2.35);
    box(toolBag, 0.4, 0.22, 0.22, 0, 0.11, 0, 0x2b3a4a, { rough: 0.7 });
    torus(toolBag, 0.1, 0.012, 0, 0.26, 0, 0x1b1e22, { rough: 0.6, seg: 6, seg2: 12 });
    holoTag(toolBag, "Carry it up the ladder?", 0, 0.45, 0, { css: "#f0645b", w: 0.4 });
    reg(hits, toolBag, "tool-bag-carry");

    // Anemometer mast by the hatch.
    const mast = group(g, -2.4, 0.2, 0.9);
    cyl(mast, 0.02, 0.02, 1.8, 0, 0.9, 0, 0x8b949d, { rough: 0.4, metal: 0.6, seg: 6 });
    const cups = group(mast, 0, 1.85, 0);
    for (let i = 0; i < 3; i++) {
      const a = (i / 3) * Math.PI * 2;
      box(cups, 0.2, 0.01, 0.01, Math.cos(a) * 0.1, 0, Math.sin(a) * 0.1, 0x3a4148, { rough: 0.5 }).rotation.y = -a;
      ball(cups, 0.03, Math.cos(a) * 0.2, 0, Math.sin(a) * 0.2, 0x2b3138, { rough: 0.5, seg: 8 });
    }
    const windBox = group(mast, 0.12, 1.1, 0);
    box(windBox, 0.14, 0.1, 0.05, 0, 0, 0, 0x2b3138, { rough: 0.5 });
    const windFace = decal(windBox, 0.12, 0.07, 0, 0, 0.027, signFace("-- mph", { bg: "#0d1c24", accent: "#4fb0c6", fg: "#bfeaf7", scale: 0.5 }), { glow: true, ei: 0.85, px: 128 });
    holoTag(windBox, "Anemometer", 0, 0.12, 0.02, { css: "#4fb0c6", w: 0.24 });
    reg(hits, windFace, "anemometer");

    // Anchor post and lanyard.
    const anchor = group(g, -0.6, 0.2, 0.9);
    cyl(anchor, 0.05, 0.07, 0.5, 0, 0.25, 0, 0xf2c14b, { rough: 0.5, metal: 0.4, seg: 10 });
    torus(anchor, 0.05, 0.012, 0, 0.55, 0, CITY.steel, { rough: 0.3, metal: 0.9, seg: 6, seg2: 12 });
    decal(anchor, 0.1, 0.1, 0, 0.3, 0.061, signFace("ANCHOR", { bg: "#f2c14b", accent: "#1b1e22", fg: "#1b1e22", scale: 0.35 }), { px: 64 });
    const lanyard = group(anchor, 0, 0.55, 0);
    const lanLine = cyl(lanyard, 0.01, 0.01, 1.2, 0.55, 0.0, 0, 0x1f7ae0, { rough: 0.6, seg: 6 });
    lanLine.rotation.z = Math.PI / 2;
    holoTag(anchor, "Restraint lanyard", 0.3, 0.8, 0, { css: "#4fb0c6", w: 0.32 });
    reg(hits, anchor, "restraint-lanyard");

    // ------------------------------------------------------------ drains, pond, scupper, debris
    const drain1 = group(g, 1.5, 0.2, -1.9);
    cyl(drain1, 0.2, 0.2, 0.02, 0, 0.01, 0, 0x3a4148, { rough: 0.6, metal: 0.4, seg: 16 });
    const hole = cyl(drain1, 0.1, 0.1, 0.022, 0, 0.012, 0, 0x0a0b0d, { rough: 1.0, seg: 14 });
    holoTag(drain1, "Drain 1", 0, 0.25, 0, { css: "#4fb0c6", w: 0.18 });
    reg(hits, hole, "missing-strainer");
    const newDome = ball(drain1, 0.12, 0, 0.02, 0, 0x2b3138, { rough: 0.6, metal: 0.3, seg: 10 });
    newDome.scale.set(1, 0.7, 1);
    newDome.visible = false;
    const pondTex = surfaceTexture((cx, w, h) => waterFace(cx, w, h, { base: "#3a5a6a", mid: "#4a6a7a", base2: "#344e5c" }), { repeat: 1, px: 256 });
    const pond = slab(g, 1.4, 0.01, 1.1, -0.5, 0.206, -1.3, 0x4a6a7a, { radius: 0.4, rough: 0.1, metal: 0.2, cast: false });
    pond.material = texturedMat(pondTex, { rough: 0.08, metal: 0.25, color: 0xb8d0dc });
    const drain2 = group(g, -0.5, 0.2, -1.3);
    const dome2 = ball(drain2, 0.12, 0, 0.03, 0, 0x2b3138, { rough: 0.6, metal: 0.3, seg: 10 });
    dome2.scale.set(1, 0.7, 1);
    holoTag(drain2, "Drain 2", 0, 0.3, 0, { css: "#4fb0c6", w: 0.18 });
    const pondMark = box(drain2, 0.8, 0.05, 0.6, 0.3, 0.04, 0.2, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, pondMark, "ponding");
    const scupper = group(g, -2.75, 0.2, -0.8);
    box(scupper, 0.2, 0.2, 0.3, 0, 0.12, 0, 0x2b3138, { rough: 0.6, metal: 0.4 });
    const leaves = group(g, -2.45, 0.2, -0.8);
    for (let i = 0; i < 6; i++) ball(leaves, 0.07, (i % 3) * 0.08, 0.04, Math.floor(i / 3) * 0.1 - 0.05, [0x6a5a2a, 0x7a6a3a, 0x5a4a22][i % 3], { rough: 0.95, seg: 6 });
    holoTag(scupper, "Overflow scupper", 0.3, 0.45, 0, { css: "#4fb0c6", w: 0.32 });
    const scupperMark = box(scupper, 0.3, 0.2, 0.3, 0.1, 0.12, 0, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, scupperMark, "blocked-scupper");
    reg(hits, leaves, "leaf-debris");
    const debrisBag = group(g, -1.2, 0.2, 1.4);
    cyl(debrisBag, 0.16, 0.14, 0.4, 0, 0.2, 0, 0x2b2b2b, { rough: 0.4, seg: 12 });
    holoTag(debrisBag, "Debris bag", 0, 0.55, 0, { css: "#4fb0c6", w: 0.22 });
    const bagSocket = box(debrisBag, 0.3, 0.05, 0.3, 0, 0.45, 0, 0xffffff, { opacity: 0.001, transparent: true, cast: false });
    hits["debris-bag-socket"] = bagSocket;
    const auger = group(g, 0.1, 0.2, -0.7);
    cyl(auger, 0.16, 0.16, 0.3, 0, 0.3, 0, 0xc8201a, { rough: 0.5, metal: 0.3, seg: 14 }).rotation.x = Math.PI / 2;
    box(auger, 0.3, 0.04, 0.04, 0, 0.3, 0.2, 0x2b3138, { rough: 0.5 });
    const cable = cyl(auger, 0.008, 0.008, 0.7, -0.35, 0.2, -0.3, 0x8b949d, { rough: 0.4, metal: 0.7, seg: 4 });
    cable.rotation.z = 1.1; cable.rotation.y = 0.6;
    holoTag(auger, "Drain auger", 0, 0.62, 0, { css: "#4fb0c6", w: 0.24 });
    reg(hits, auger, "drain-auger");

    // ------------------------------------------------------------ skylight, RTU, exhaust fan and disconnect
    const sky = group(g, 1.2, 0.2, 0.4);
    box(sky, 0.9, 0.18, 0.9, 0, 0.09, 0, 0x6d747b, { rough: 0.8 });
    const skyDome = ball(sky, 0.4, 0, 0.18, 0, 0xcfe4ef, { rough: 0.25, opacity: 0.45, transparent: true, seg: 12 });
    skyDome.scale.set(1, 0.45, 1);
    holoTag(sky, "Step on the skylight?", 0, 0.55, 0, { css: "#f0645b", w: 0.38 });
    reg(hits, skyDome, "skylight-step");
    const rtu = group(g, -1.6, 0.2, -2.1);
    box(rtu, 1.6, 1.0, 1.0, 0, 0.5, 0, 0xc9ced3, { rough: 0.5, metal: 0.5 });
    for (let i = 0; i < 6; i++) box(rtu, 0.02, 0.8, 0.02, -0.6 + i * 0.24, 0.5, 0.51, 0x8b949d, { rough: 0.5, cast: false });
    const rtuFan = cyl(rtu, 0.35, 0.35, 0.05, 0.3, 1.03, 0, 0x3a4148, { rough: 0.5, metal: 0.5, seg: 18 });
    void rtuFan;
    const fan = group(g, 1.9, 0.2, -1.0);
    box(fan, 0.7, 0.3, 0.7, 0, 0.15, 0, 0x6d7379, { rough: 0.6, metal: 0.4 });
    const housing = cyl(fan, 0.36, 0.3, 0.5, 0, 0.55, 0, 0xb8c0c6, { rough: 0.45, metal: 0.6, seg: 16 });
    const cap = cyl(fan, 0.45, 0.45, 0.06, 0, 0.84, 0, 0xb8c0c6, { rough: 0.45, metal: 0.6, seg: 16 });
    void housing;
    const screwZone = box(fan, 0.2, 0.2, 0.05, 0.0, 0.55, 0.33, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(fan, "Open the housing?", 0, 1.05, 0.2, { css: "#f0645b", w: 0.32 });
    reg(hits, screwZone, "fan-housing-live");
    const beltWin = group(fan, 0, 0.45, 0.32);
    box(beltWin, 0.18, 0.12, 0.02, 0, 0, 0, 0x14171b, { rough: 0.9 });
    const belt = box(beltWin, 0.14, 0.02, 0.01, 0, 0, 0.012, 0x1b1e22, { rough: 0.7 });
    void belt;
    const beltGauge = group(g, 1.25, 0.95, -0.25);
    cyl(beltGauge, 0.012, 0.012, 0.16, 0, 0, 0, 0x2f7d4a, { rough: 0.5, seg: 8 });
    const bgFace = decal(beltGauge, 0.08, 0.04, 0, 0.1, 0, signFace("-- in", { bg: "#0d1c24", accent: "#4fb0c6", fg: "#bfeaf7", scale: 0.5 }), { glow: true, ei: 0.8, px: 96 });
    box(g, 0.4, 0.75, 0.3, 1.25, 0.55, -0.25, 0x5a626a, { rough: 0.5, metal: 0.4 });
    holoTag(beltGauge, "Belt tension gauge", 0, 0.2, 0, { css: "#4fb0c6", w: 0.32 });
    reg(hits, beltGauge, "belt-gauge");
    const disc = group(g, 2.6, 0.2, -1.5, -Math.PI / 2);
    box(disc, 0.1, 0.9, 0.1, 0, 0.45, -0.1, 0x6d7379, { rough: 0.5, metal: 0.5 });
    box(disc, 0.3, 0.4, 0.14, 0, 1.0, 0, 0x8b949d, { rough: 0.45, metal: 0.55 });
    const handle = group(disc, 0.18, 1.0, 0.02);
    box(handle, 0.04, 0.14, 0.04, 0, 0.05, 0, 0xc8201a, { rough: 0.5 });
    disc.userData.wheel = handle;
    holoTag(disc, "Fan disconnect", 0, 1.32, 0.05, { css: "#4fb0c6", w: 0.3 });
    reg(hits, disc, "fan-disconnect");
    const hasp = torus(disc, 0.02, 0.005, 0.18, 0.84, 0.06, CITY.steel, { rough: 0.3, metal: 0.9 });
    reg(hits, hasp, "fan-lock");
    const myLock = lockTag(disc, 0.18, 0.84, 0.1, { color: 0x1f7ae0, lines: ["DO NOT", "OPERATE", "— ENGINEER"] });
    myLock.visible = false;

    // ------------------------------------------------------------ hot work contractor, radio
    const contractor = standingFigure(g, 0.4, -2.2, { ry: 0.4, cloth: 0x3a3a3a, trousers: 0x2b2b2b, cap: 0xc8201a, atStation: true });
    contractor.visible = false;
    const torch = group(g, 0.1, 0.2, -1.8);
    cyl(torch, 0.12, 0.12, 0.5, 0.5, 0.25, -0.2, 0xdfe4e8, { rough: 0.4, metal: 0.5, seg: 12 });
    const flame = ball(torch, 0.06, 0, 0.06, 0, 0x4fa8ff, { emissive: 0x4fa8ff, ei: 2.4, seg: 8 });
    void flame;
    torch.visible = false;
    const radio = group(g, -0.9, 0.95, 1.95);
    box(radio, 0.05, 0.14, 0.03, 0, 0, 0, 0x1b1e22, { rough: 0.5 });
    const radioLamp = ball(radio, 0.01, 0, 0.08, 0.016, 0x2a3a2a, { rough: 0.4, seg: 6 });
    box(g, 0.4, 0.7, 0.3, -0.9, 0.55, 1.95, 0x5a626a, { rough: 0.5, metal: 0.4 });
    const leakFlag = group(g, 0.45, 0.2, -0.2);
    cyl(leakFlag, 0.008, 0.008, 0.6, 0, 0.3, 0, 0x2b3138, { rough: 0.5, seg: 4 });
    box(leakFlag, 0.16, 0.1, 0.005, 0.08, 0.55, 0, 0xf0645b, { rough: 0.6 });
    leakFlag.visible = false;

    // ------------------------------------------------------------ boards
    const access = holoPanel(g, 0.5, 0.36, -2.2, 1.75, 2.35, (cx, w, h) => {
      cx.fillStyle = "rgba(6,18,22,0.9)"; cx.fillRect(0, 0, w, h);
      cx.fillStyle = "#4fb0c6"; cx.fillRect(0, 0, w, 5);
      cx.fillStyle = "#e6f6fa"; cx.font = `600 ${Math.round(h * 0.12)}px 'Barlow Condensed', Arial, sans-serif`;
      cx.textAlign = "left"; cx.textBaseline = "middle";
      cx.fillText("ROOF ACCESS LOG", w * 0.06, h * 0.16);
      cx.font = `${Math.round(h * 0.085)}px Arial, sans-serif`; cx.fillStyle = "#b8dde6";
      ["Roofer — seams, 08:10", "Engineer — drains, now", "Back down by: 11:30"].forEach((l, i) => cx.fillText(l, w * 0.06, h * (0.4 + i * 0.17)));
    }, { ry: 0.7, accent: PMRD_ACCENT });
    reg(hits, access, "roof-access-log");
    const hotPermit = holoPanel(g, 0.44, 0.3, 0.9, 1.75, -2.7, (cx, w, h) => {
      cx.fillStyle = "rgba(6,18,22,0.9)"; cx.fillRect(0, 0, w, h);
      cx.fillStyle = "#f0645b"; cx.fillRect(0, 0, w, 5);
      cx.fillStyle = "#e6f6fa"; cx.font = `600 ${Math.round(h * 0.13)}px 'Barlow Condensed', Arial, sans-serif`;
      cx.textAlign = "center"; cx.textBaseline = "middle";
      cx.fillText("HOT WORK PERMITS", w / 2, h * 0.28);
      cx.font = `${Math.round(h * 0.09)}px Arial, sans-serif`; cx.fillStyle = "#b8dde6";
      cx.fillText("Today: none issued", w / 2, h * 0.56);
      cx.fillText("Fire watch · extinguisher", w / 2, h * 0.74);
    }, { ry: -0.2, accent: 0xf0645b });
    reg(hits, hotPermit, "hot-work-permit");
    const plan = holoPanel(g, 0.5, 0.36, 1.1, 1.75, 2.6, (cx, w, h) => {
      cx.fillStyle = "rgba(6,18,22,0.9)"; cx.fillRect(0, 0, w, h);
      cx.fillStyle = "#4fb0c6"; cx.fillRect(0, 0, w, 5);
      cx.fillStyle = "#e6f6fa"; cx.font = `600 ${Math.round(h * 0.12)}px 'Barlow Condensed', Arial, sans-serif`;
      cx.textAlign = "center"; cx.fillText("ROOF PLAN — UNITS BELOW", w / 2, h * 0.16);
      cx.strokeStyle = "#8fc8d6"; cx.lineWidth = 3; cx.strokeRect(w * 0.1, h * 0.26, w * 0.8, h * 0.62);
      for (let i = 1; i < 4; i++) { cx.beginPath(); cx.moveTo(w * (0.1 + i * 0.2), h * 0.26); cx.lineTo(w * (0.1 + i * 0.2), h * 0.88); cx.stroke(); }
      cx.fillStyle = "#8fc8d6"; cx.font = `${Math.round(h * 0.08)}px Arial`;
      ["12A", "12B", "12C", "12D"].forEach((u, i) => cx.fillText(u, w * (0.2 + i * 0.2), h * 0.6));
    }, { ry: -0.3, accent: PMRD_ACCENT });
    reg(hits, plan, "leak-map");
    const logBoard = holoPanel(g, 0.52, 0.36, -2.45, 1.75, 0.0, (cx, w, h) => {
      cx.fillStyle = "rgba(6,18,22,0.9)"; cx.fillRect(0, 0, w, h);
      cx.fillStyle = "#4fb0c6"; cx.fillRect(0, 0, w, 5);
      cx.fillStyle = "#e6f6fa"; cx.font = `600 ${Math.round(h * 0.14)}px 'Barlow Condensed', Arial, sans-serif`;
      cx.textAlign = "center"; cx.textBaseline = "middle";
      cx.fillText("BUILDING LOG", w / 2, h * 0.28);
      cx.font = `${Math.round(h * 0.085)}px Arial, sans-serif`; cx.fillStyle = "#b8dde6";
      ["Wind · drains · scupper", "Fan belt · 12C leak", "Torch stopped"].forEach((l, i) => cx.fillText(l, w / 2, h * (0.5 + i * 0.15)));
    }, { ry: 1.3, accent: PMRD_ACCENT });
    reg(hits, logBoard, "building-log");
    const crewBoard = holoPanel(g, 0.5, 0.34, 0.2, 1.75, 2.45, (cx, w, h) => {
      cx.fillStyle = "rgba(8,20,18,0.9)"; cx.fillRect(0, 0, w, h);
      cx.fillStyle = "#7fd1c9"; cx.fillRect(0, 0, w, 5);
      cx.fillStyle = "#e3f7ee"; cx.font = `600 ${Math.round(h * 0.14)}px 'Barlow Condensed', Arial, sans-serif`;
      cx.textAlign = "center"; cx.textBaseline = "middle";
      cx.fillText("CREW CHECK-IN", w / 2, h * 0.3);
      cx.font = `${Math.round(h * 0.085)}px Arial, sans-serif`; cx.fillStyle = "#bfe8d6";
      cx.fillText("Engineer · ground porter", w / 2, h * 0.56);
      cx.fillText("IUOE Local 39 member services", w / 2, h * 0.74);
    }, { ry: 0, accent: 0x7fd1c9 });
    reg(hits, crewBoard, "crew-checkin-board");

    // ------------------------------------------------------------ people
    const helper = standingFigure(g, -0.3, 1.9, { ry: 2.8, cloth: 0x2f4a6a, trousers: 0x22272d, harness: true, helmet: 0xf4f6f8 });

    let augering = false;

    return {
      hits,
      footprint: 2.6,
      spawnLook: new THREE.Vector3(0, 0.9, -0.8),

      onStep(step) {
        if (step.id === "auger-drain") augering = true;
      },

      onStepComplete(step) {
        if (step.id === "hatch-climb") { gate.rotation.y = 0; lidLatch.material = mat(0x59c97b, { rough: 0.5 }); }
        if (step.id === "wind-check") repaint(windFace, signFace("18 mph", { bg: "#0d1c14", accent: "#59c97b", fg: "#c9f5d8", scale: 0.5 }));
        if (step.id === "roof-walk") newDome.visible = true;
        if (step.id === "bag-debris") leaves.visible = false;
        if (step.id === "auger-drain") { augering = false; pond.scale.set(0.35, 1, 0.35); }
        if (step.id === "fan-lock") myLock.visible = true;
        if (step.id === "belt-tension") repaint(bgFace, signFace("0.58 in", { bg: "#0d1c14", accent: "#59c97b", fg: "#c9f5d8", scale: 0.45 }));
        if (step.id === "fan-restore") myLock.visible = false;
      },

      onInterrupt(it) {
        if (it.id === "hotwork-contractor") { contractor.visible = true; torch.visible = true; }
        if (it.id === "tenant-leak") radioLamp.material = mat(0xf2c14b, { emissive: 0xf2c14b, ei: 2.0 });
      },
      onInterruptEnd(it) {
        if (it.id === "hotwork-contractor" && it.resolved === "answered") { torch.visible = false; contractor.visible = false; }
        if (it.id === "tenant-leak") {
          radioLamp.material = mat(0x2a3a2a, { rough: 0.4 });
          if (it.resolved === "answered") leakFlag.visible = true;
        }
      },

      onHazard(hitId) {
        if (hitId === "fan-housing-live") cap.rotation.y += 0.4;
      },

      animate(t, dt, session) {
        cups.rotation.y = t * 4;
        helper.userData.head.rotation.y = Math.sin(t * 0.4) * 0.3;
        if (augering) cable.rotation.y = 0.6 + Math.sin(t * 8) * 0.1;
        if (session?.step?.id === "restraint-walk" && session.track) lanLine.scale.y = 0.6 + session.track.v * 0.8;
        const gg = session?.gauge;
        if (gg && !gg.committed && session.step?.id === "wind-check") {
          repaint(windFace, signFace(`${Math.round(gg.t * 60)} mph`, { bg: "#0d1c24", accent: gg.t > 0.08 && gg.t < 0.4 ? "#59c97b" : "#f0645b", fg: "#bfeaf7", scale: 0.5 }));
        }
        if (gg && !gg.committed && session.step?.id === "belt-tension") {
          repaint(bgFace, signFace(`${(gg.t * 1.2).toFixed(2)} in`, { bg: "#0d1c24", accent: gg.t > 0.4 && gg.t < 0.58 ? "#59c97b" : "#f0645b", fg: "#bfeaf7", scale: 0.45 }));
        }
      },
    };
  },
};
