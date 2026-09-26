import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, ball, torus, slab, hose, group, decal, repaint, signFace, particles, mat,
  gradientFill, noiseTexture, grimeOverlay,
} from "../../../shared/kit.js";
import {
  CITY, stationPad, holoPanel, holoTag, toolChest, instrument, lockTag, barrierPanel,
  standingFigure, surfaceTexture, texturedMat, deckPlateFace, reg,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Hoistway False Car and Rail Setting VR — IUEC elevator
// constructors, new-installation rigging. Before a single guide rail goes up
// in a new hoistway, the crew works from a false car — a temporary steel
// platform bolted to the rail brackets already set — because there is no
// finished car yet to stand on and no floor at the bottom to catch anyone.
// Everything above the false car is an open shaft; everything below it is a
// straight drop to the pit. The whole procedure is built around never
// forgetting which of those two facts is true at any given moment.

const EWFCS_ACCENT = 0xff9f43;

/** Cast-concrete floor slab: cool grey with a light control-joint grid. */
function ewfcsConcreteFace(g, w, h, o = {}) {
  gradientFill(g, w, h, [[0, o.base ?? "#3d4650"], [1, o.base2 ?? "#333b44"]]);
  noiseTexture(g, w, h, { density: 2400, alpha: 0.08, tone: "0,0,0" });
  noiseTexture(g, w, h, { density: 900, alpha: 0.05, tone: "205,212,220" });
  const tiles = o.tiles ?? 3, t = w / tiles;
  g.fillStyle = "rgba(0,0,0,0.4)";
  for (let i = 1; i < tiles; i++) { g.fillRect(i * t - 1.5, 0, 3, h); g.fillRect(0, i * t - 1.5, w, 3); }
}

/** CMU block hoistway wall: warm grey block coursing with mortar joints. */
function ewfcsBlockFace(g, w, h, o = {}) {
  gradientFill(g, w, h, [[0, o.base ?? "#8a7a63"], [1, o.base2 ?? "#786a55"]]);
  noiseTexture(g, w, h, { density: 2000, alpha: 0.09, tone: "40,30,15" });
  const rows = o.rows ?? 6, cols = o.cols ?? 4, rh = h / rows, cw = w / cols;
  g.fillStyle = "rgba(20,16,10,0.5)";
  for (let r = 0; r <= rows; r++) g.fillRect(0, r * rh - 1, w, 2);
  for (let r = 0; r < rows; r++) {
    const off = (r % 2) ? cw / 2 : 0;
    for (let c = -1; c <= cols; c++) g.fillRect(off + c * cw - 1, r * rh, 2, rh);
  }
  grimeOverlay(g, w, h, { blotches: 3, streaks: 3, tone: "20,16,10", alpha: 0.15 });
}

/** Plywood material staging deck: horizontal wood grain, dark plank seams. */
function ewfcsWoodFace(g, w, h, o = {}) {
  gradientFill(g, w, h, [[0, o.base ?? "#8a5a34"], [1, o.base2 ?? "#734827"]], { horizontal: true });
  noiseTexture(g, w, h, { density: 1800, alpha: 0.08, tone: "40,20,8" });
  for (let i = 0; i < 12; i++) {
    const y = Math.random() * h;
    g.fillStyle = "rgba(40,20,8,0.18)";
    g.fillRect(0, y, w, 1.4);
  }
  g.fillStyle = "rgba(0,0,0,0.32)";
  for (let i = 1; i < 4; i++) g.fillRect(0, i * h / 4 - 1, w, 2);
}

export const SIM_EW_HOISTWAY_FALSE_CAR_AND_RAIL_SETTING = {
  id: "ew-hoistway-false-car-and-rail-setting",
  index: "352",
  domain: "Facilities",
  trade: "Elevator constructor — new installation, IUEC",
  category: "Building Systems & Facilities",
  indoor: "service",
  certification: "IUEC elevator constructors; NEIEP apprenticeship curriculum for new-installation rigging; ASME A17.1 the safety code for elevators and escalators; OSHA 29 CFR 1910.147 control of hazardous energy for the hoist's own disconnect; OSHA 29 CFR 1926.501 duty to have fall protection at the open landing edge above a working false car; ANSI Z359 fall-protection equipment for anyone tied off at that edge",
  name: "Hoistway False Car and Rail Setting",
  title: simTitle("Hoistway False Car and Rail Setting"),
  tagline: "Rigging a new hoistway from a false car: secure the platform, rig the monorail hoist, plumb and set the guide rail, gauge it, and log the as-built",
  accent: EWFCS_ACCENT,
  accentCss: "#ff9f43",
  parSeconds: 260,
  footprint: 2.3,
  badge: { id: "rail-set-certified", name: "Rail Set Certified", note: "A guide rail plumbed, set, gauged and logged from a secured false car, with the tag line never out of a hand" },

  game: system({
    name: "Rail Setting Authority",
    currency: "PLUMB",
    ranks: ["Helper", "Rail Setter", "Lead Mechanic", "Adjuster", "Rail Setting Certified"],
    badges: [
      { id: "false-car-first", name: "False Car First", note: "Never worked the shaft before the platform and its own stop switch were confirmed", test: AWARD.stepClean("false-car-stop") },
      { id: "true-rail", name: "True Rail", note: "Held both plumb and gauge readings near band centre", test: AWARD.precise(0.7) },
      { id: "clean-set", name: "Clean Set", note: "Restore in the correct order, no correction", test: AWARD.stepClean("restore") },
    ],
    challenges: [
      { id: "no-callback", name: "No Callback", note: "Clean run, no corrections", test: AWARD.clean },
      { id: "hoist-held", name: "Hoist Held", note: "Never let the hoist control slip mid-lift", test: AWARD.unbroken },
      { id: "floor-fast", name: "Floor Fast", note: "One floor set inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "open-hoistway-edge": "You leaned out over the landing opening above the false car with nothing clipped to the fall-protection anchor. There is no car, no door and no floor on the other side of that opening yet — only the shaft, and the platform you are standing on is the only thing between you and the bottom of it.",
    "swinging-rail-load": "You stood under the rail section while it was still swinging on the hoist. A ten-foot steel rail on the end of a chain fall does not stop the instant the hoist does; it swings until something absorbs that energy, and the wrong something is a person underneath it.",
    "frayed-hoist-rope": "That hoist rope has visible broken wires along its length that were never reported. A wire rope failing under a suspended rail section does not creak first — the rail simply arrives at the bottom of the shaft, and everyone who was under or near it arrives with it.",
    "rail-clamp-pinch": "You reached bare-handed into the fishplate clamp while it was still under tension from the come-along. A clamp holding two rail sections aligned for bolting closes on whatever is between the plates the instant that tension shifts, and a gloved hand in there loses fingers exactly as fast as an ungloved one.",
  },

  lateNotes: {
    "false-car-stop-switch": "The false car's own stop switch is confirmed before anyone steps onto the platform, not after.",
    "rail-gauge-tool": "The gauge reading is taken once the rail is bolted at the bracket, not while it is still hanging on the hoist.",
  },

  supportLine: "your IUEC local's member assistance programme, or the NEIEP training coordinator for anything about the apprenticeship record",

  steps: [
    {
      id: "toolbox-talk", kind: "select", target: "toolbox-talk-panel",
      title: "Attend the toolbox talk",
      cue: "Read today's hoistway work plan and confirm who is riding the false car and who is running the hoist from below.",
      why: "A new-installation crew moves material and people through the same open shaft all day, and the one thing that keeps that safe is everybody knowing, before the first lock comes off anything, exactly who is above, who is below, and who is answering the hoist controls. A toolbox talk skipped because everyone already knows the drill is the day the drill turns out to have changed since yesterday.",
    },
    {
      id: "permit", kind: "select", target: "hoistway-permit",
      title: "Open the hoistway work permit",
      cue: "Read the permit and confirm landing barricades are posted at every floor above and below the working level.",
      why: "Every landing opening on a new installation is a hole in the building with nothing behind it yet — no car, no door interlock, nothing. The permit names which floors are barricaded before the false car goes anywhere, because a barricade taken down early is a fall hazard for the next tradesperson through the building who has no reason to expect an open shaft behind that door.",
    },
    {
      id: "rig-hoist", kind: "sequence", anyOrder: false,
      targets: ["monorail-trolley", "chain-hoist", "tag-line"],
      itemNames: { "monorail-trolley": "monorail trolley", "chain-hoist": "chain hoist", "tag-line": "tag line" },
      title: "Rig the material hoist in order",
      cue: "Seat the trolley on the monorail beam, hang the chain hoist from it, then clip on the tag line before anything is lifted.",
      why: "The trolley has to be riding the beam correctly before anything hangs from it, the hoist has to be on the trolley before a load goes on the hook, and the tag line goes on last because it is the one thing that keeps the load from turning into a pendulum the moment it clears the deck. Rigged out of order, a rail section can be swinging before anyone has a hand on the line meant to control it.",
      outOfOrderNote: "Wrong order — trolley on the beam first, then the chain hoist on the trolley, and the tag line clipped on last of all.",
    },
    {
      id: "false-car-secure", kind: "select", target: "false-car",
      title: "Confirm the false car is secured to the rail brackets",
      cue: "Check the false car's hanger bolts against the guide rail brackets before anyone steps onto the platform.",
      why: "The false car is only as safe as the brackets it hangs from, and those brackets were set for exactly this purpose — nothing else in the shaft is rated to carry a crew and a load of material. A platform that looks level and solid from the landing can still have one hanger bolt short of full engagement, which is not something anyone wants to discover with their weight already on it.",
    },
    {
      id: "false-car-stop", kind: "select", target: "false-car-stop-switch",
      title: "Engage the false car's own stop switch",
      cue: "Confirm the false car's stop switch is ON before the hoist takes any load.",
      why: "This switch is independent of anything in the machine room because there usually is no finished machine room yet — the false car is its own small, self-contained work platform, and its stop switch is the only thing on it a crew member standing there can see and trust with their own eyes.",
    },
    {
      id: "plumb-check", kind: "gauge", target: "plumb-instrument",
      title: "Read the rail bracket plumb line",
      cue: "Sight the plumb line against the bracket and commit the reading inside the band the layout print calls for.",
      why: "Every rail section that goes up afterward follows the line the first bracket sets, so an error here does not stay small — it multiplies floor by floor for the rest of the hoistway. The plumb line is read against the print's own tolerance, not against how straight the bracket looks from across the shaft.",
      gauge: {
        label: "BRACKET PLUMB", speed: 0.6, green: [0.42, 0.58],
        readout: (t) => `${((t - 0.5) * 24).toFixed(1)} mm`,
        missNote: "Outside the print's tolerance. Loosen the bracket, re-sight the line and take the reading again before anything is bolted to it.",
      },
    },
    {
      id: "set-rail", kind: "drag", target: "rail-section",
      title: "Carry the rail section to the bracket",
      cue: "Guide the hoisted rail section over to the bracket slot and land it on the marks.",
      why: "The rail comes up the shaft on the hoist and the tag line, but landing it is a hand job — walked onto the bracket seat rather than lowered blind and hoped into place. A rail section set even slightly off the bracket's marks throws the plumb line the next section above it has to match.",
      drag: { to: "rail-bracket-slot", radius: 0.4, missNote: "Not seated on the bracket marks. A rail resting against the bracket instead of seated in it is not caught by the fishplate bolts the way it needs to be." },
    },
    {
      id: "bolt-torque", kind: "turn", target: "fishplate-bolts",
      title: "Torque the fishplate bolts",
      cue: "Turn the wrench on the fishplate bolts to the rail manufacturer's spec.",
      why: "The fishplate is what carries the joint's load from one rail section into the next, and it only does that if every bolt is torqued evenly to the manufacturer's own spec rather than snugged by feel. A joint left loose on one side and tight on the other develops a step at exactly the height a car's guide shoe will ride over it later.",
      turn: { turns: 0.3, axis: "z", label: "FISHPLATE BOLTS" },
    },
    {
      id: "gauge-check", kind: "gauge", target: "rail-gauge-tool",
      title: "Check the rail-to-rail gauge",
      cue: "Set the gauge tool across both rails and commit the reading inside the band.",
      why: "Plumb tells you one rail is straight; gauge tells you the two rails are the right distance apart for the car that is eventually going to run between them. A rail that is perfectly plumb but gauged wrong still throws the guide shoes the day the car goes in, and that is a much harder fault to find once the hoistway is closed up.",
      gauge: {
        label: "RAIL GAUGE", speed: 0.55, green: [0.46, 0.56],
        readout: (t) => `${(1200 + (t - 0.5) * 10).toFixed(1)} mm`,
        missNote: "Outside gauge tolerance. Loosen the bracket clips, re-set the tool square across both rails and read it again.",
      },
    },
    {
      id: "hoistway-inspect", kind: "find", noHint: true,
      targets: ["loose-bracket", "missing-cotter-pin", "debris-on-beam"],
      itemNames: {
        "loose-bracket": "a bracket clip left finger-tight", "missing-cotter-pin": "a fishplate bolt with no cotter pin", "debris-on-beam": "material left sitting on the monorail beam",
      },
      itemNotes: {
        "loose-bracket": "A bracket clip left finger-tight will not hold its rail through the first thermal cycle the shaft goes through — it gets torqued now, while the crew is already standing at it.",
        "missing-cotter-pin": "A fishplate bolt with no cotter pin can back off a fraction of a turn at a time under vibration until nothing is holding the joint at all. It gets pinned before the crew moves up to the next bracket.",
        "debris-on-beam": "Anything left sitting on the monorail beam is something that can be knocked off it the next time the trolley runs past — straight down the open shaft onto whoever is below.",
      },
      title: "Walk the false car and check the rigging",
      cue: "Look over the platform, the brackets and the beam. Three things need fixing before the hoist runs again.",
      why: "A false car gets walked before every lift the same way a pit gets walked before every entry: not because something is expected to be wrong, but because the one time something is wrong is the time nobody looked.",
    },
    {
      id: "hoist-material", kind: "hold", target: "hoist-control", seconds: 6,
      title: "Run the hoist on constant pressure",
      cue: "Hold the hoist control lever down and bring the next rail section up to the false car.",
      why: "The hoist control is constant pressure for the same reason a car's inspection button is: let go and the load stops where it is instead of running on unattended. A load that keeps climbing after the operator's hand has come off the lever, for any reason, is a load nobody is actually controlling any more.",
      holdBreakNote: "You let go and the hoist stopped, which is exactly what constant pressure is for. Take the lever again and hold it for the whole lift.",
    },
    {
      id: "landing-lock", kind: "select", target: "landing-door-lock",
      title: "Relock the landing opening",
      cue: "Confirm the landing door lock is engaged now that the rail section has cleared the opening.",
      why: "The landing opening only comes unlocked long enough to pass material through it, and it goes straight back to locked the moment that material has cleared — because an unlocked landing opening on a floor with no finished car yet looks, to anyone else in the building, exactly like a door that opens onto a room.",
    },
    {
      id: "restore", kind: "sequence",
      targets: ["tag-line", "chain-hoist", "false-car-stop-switch"],
      itemNames: { "tag-line": "tag line", "chain-hoist": "chain hoist", "false-car-stop-switch": "false car stop switch" },
      title: "Park the rigging in the correct order",
      cue: "Unclip the tag line, park the chain hoist on the trolley, then release the false car stop switch.",
      why: "Park from the load inward: the tag line comes off a load that is already landed and secure, the hoist gets parked once nothing is hanging from it, and the false car's own stop switch is the last thing released because it is what has been protecting the platform this whole time.",
      outOfOrderNote: "Wrong order — tag line first, then park the hoist, and the false car stop switch last of all.",
    },
    {
      id: "as-built-log", kind: "select", target: "layout-log",
      title: "Log the rail as-built",
      cue: "Write the bracket spacing, the plumb and gauge readings, and the floor level on the layout log.",
      why: "The next crew up the shaft is setting their brackets off the line this rail just established, and the only record of whether that line is actually true is what gets written here — not what everyone remembers about how the day went.",
    },
  ],

  interrupts: [
    {
      id: "landing-reopened",
      kind: "Landing door forced",
      after: "hoistway-inspect", delay: 4, seconds: 12,
      alert: "Somebody on the floor above has forced the landing door open to look down the shaft, with the false car and its load right below.",
      cue: "That opening has nothing behind it. Get it locked again.",
      target: "landing-door-lock",
      why: "A locked landing opening is the only thing standing between the rest of the building and an open shaft with a crew and a suspended load in it. Whoever just forced that door has no way of knowing what they nearly stepped into, and the only correction available is getting it locked again before anyone tests that door a second time.",
      missNote: "The landing door stayed forced open above a loaded hoist. The next person who leans on that door the way the first one did is stepping into an open shaft, not a hallway.",
      wrongNote: "It is the landing door lock. Whatever else is happening in the shaft, that open door above you is the emergency.",
    },
    {
      id: "tagline-snag",
      kind: "Load starts to spin",
      after: "set-rail", delay: 4, seconds: 11,
      alert: "The tag line has snagged on a bracket, and the rail section on the hoist has started to spin as it comes up past the false car.",
      cue: "Get a hand back on that line before the rail swings into the platform.",
      target: "tag-line",
      why: "A tag line's whole job is to keep a suspended load from doing exactly this — turning a controlled lift into a load with its own momentum. A spinning rail section near an open platform edge is a crush hazard for anyone standing on that platform, and the only fix is the line, not the hoist.",
      missNote: "The rail kept spinning past the false car with nobody on the tag line. A ten-foot steel section swinging free at that height is exactly the load a tag line exists to prevent.",
      wrongNote: "It is the tag line. Get it back in hand and bring the spin under control before the rail reaches the platform.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.3, EWFCS_ACCENT);

    // ------------------------------------------------------------- the floor
    const floorTex = surfaceTexture((cx, w, h) => ewfcsConcreteFace(cx, w, h, {}), { repeat: 3, px: 320 });
    const floor = box(g, 5.0, 0.1, 4.4, 0, 0.05, 0, 0x3d4650, { rough: 0.85, metal: 0.1 });
    floor.material = texturedMat(floorTex, { rough: 0.8, metal: 0.1, color: 0x3d4650 });

    // ---------------------------------------------------------- hoistway shell
    // A U-shaped block wall open toward the learner, so the shaft's interior —
    // brackets, rails, false car — reads clearly from the pad.
    const wallTex = surfaceTexture((cx, w, h) => ewfcsBlockFace(cx, w, h, {}), { repeat: 2, px: 320 });
    const wallMat = () => texturedMat(wallTex, { rough: 0.9, metal: 0.02, color: 0x8a7a63 });
    const shaft = group(g, 0, 0, -1.5);
    const back = box(shaft, 2.6, 3.4, 0.2, 0, 1.7, -0.9, 0x8a7a63, { rough: 0.9 });
    back.material = wallMat();
    const sideL = box(shaft, 0.2, 3.4, 1.8, -1.3, 1.7, 0, 0x8a7a63, { rough: 0.9 });
    sideL.material = wallMat();
    const sideR = box(shaft, 0.2, 3.4, 1.8, 1.3, 1.7, 0, 0x8a7a63, { rough: 0.9 });
    sideR.material = wallMat();

    // Monorail beam across the top of the shaft, with the trolley and chain hoist.
    const beam = box(shaft, 2.4, 0.12, 0.14, 0, 3.35, -0.3, CITY.darkSteel, { rough: 0.5, metal: 0.6 });
    void beam;
    const debris = box(shaft, 0.14, 0.06, 0.1, 0.7, 3.42, -0.3, 0x8a6a3a, { rough: 0.7 });
    reg(hits, debris, "debris-on-beam");

    const trolley = group(shaft, -0.15, 3.29, -0.3);
    box(trolley, 0.18, 0.08, 0.16, 0, 0, 0, 0x53585e, { rough: 0.5, metal: 0.6 });
    holoTag(trolley, "Monorail trolley", 0, 0.16, 0, { css: "#ff9f43", w: 0.32 });
    reg(hits, trolley, "monorail-trolley");

    const hoistBody = group(shaft, -0.15, 3.0, -0.3);
    box(hoistBody, 0.14, 0.24, 0.12, 0, 0, 0, 0x2b3138, { rough: 0.5, metal: 0.4 });
    holoTag(hoistBody, "Chain hoist", 0, 0.18, 0, { css: "#ff9f43", w: 0.28 });
    reg(hits, hoistBody, "chain-hoist");

    // Tag line: a hand line clipped near the hoist, run down to the load, kept
    // in a crew member's hand rather than left to hang free.
    const tagLine = group(shaft, 0.25, 2.6, -0.3);
    hose(tagLine, [[0, 0, 0], [0.15, -0.7, 0.1]], 0.006, 0xe4622a, { steps: 8, rough: 0.6 });
    const tagHandle = ball(tagLine, 0.03, 0.15, -0.7, 0.1, 0xe4622a, { rough: 0.5 });
    void tagHandle;
    holoTag(tagLine, "Tag line", 0, 0.14, 0, { css: "#ff9f43", w: 0.26 });
    reg(hits, tagLine, "tag-line");

    // Frayed hoist rope — a few broken strands along the load line, easy to miss
    // against the shaft's shadow if nobody actually looks.
    const fray = group(shaft, -0.05, 2.2, -0.32, 0.2);
    for (let i = 0; i < 5; i++) {
      hose(fray, [[0, -0.05 + i * 0.025, 0], [(Math.random() - 0.5) * 0.07, 0.05 + i * 0.025, (Math.random() - 0.5) * 0.05]],
        0.0025, 0xc0c6cc, { steps: 4, rough: 0.6 });
    }
    holoTag(fray, "Broken wires", 0, 0.12, 0, { css: "#f0645b", w: 0.28 });
    reg(hits, fray, "frayed-hoist-rope");

    // Two guide rails run the shaft height with brackets at intervals.
    const rails = group(shaft, 0.55, 0, -0.85);
    for (const rx of [-0.45, 0.45]) {
      box(rails, 0.05, 3.0, 0.06, rx, 1.55, 0, CITY.steel, { rough: 0.35, metal: 0.85 });
    }
    let looseBracket = null;
    for (let i = 0; i < 5; i++) {
      const y = 0.4 + i * 0.6;
      for (const rx of [-0.45, 0.45]) {
        const br = box(rails, 0.13, 0.05, 0.1, rx, y, 0.05, 0x53585e, { rough: 0.55, metal: 0.4 });
        if (i === 3 && rx === 0.45) looseBracket = br;
      }
    }
    reg(hits, looseBracket, "loose-bracket");

    // Plumb line and instrument, sighted against the top bracket.
    const plumbLine = hose(rails, [[-0.45, 2.9, 0.08], [-0.45, 0.15, 0.08]], 0.004, 0xdfe4e8, { steps: 8, rough: 0.5 });
    void plumbLine;
    const plumbInstrument = instrument(rails, -0.75, 1.6, 0.1, { ry: 0.4, idle: "-- mm", color: 0xff9f43 });
    holoTag(plumbInstrument, "Plumb instrument", 0, 0.16, 0, { css: "#ff9f43", w: 0.3 });
    reg(hits, plumbInstrument, "plumb-instrument");

    // Fishplate joint the crew is bolting, with a bolt lever and a pinch marker.
    const fishplate = group(rails, 0.45, 1.0, 0.08, -0.3);
    box(fishplate, 0.16, 0.22, 0.04, 0, 0, 0, 0x3c444c, { rough: 0.5, metal: 0.5 });
    const boltLever = box(fishplate, 0.02, 0.09, 0.02, 0.06, 0.02, 0.03, 0xd8b23a, { rough: 0.5 });
    holoTag(fishplate, "Fishplate bolts", 0, 0.2, 0, { css: "#ff9f43", w: 0.3 });
    reg(hits, fishplate, "fishplate-bolts");
    const pinchMarker = box(rails, 0.1, 0.1, 0.08, 0.6, 1.0, 0.1, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(pinchMarker, "pinch point — tool only", 0, 0.12, 0, { css: "#f0645b", w: 0.4 });
    reg(hits, pinchMarker, "rail-clamp-pinch");

    const looseCotter = cyl(rails, 0.008, 0.008, 0.05, -0.45, 0.4, 0.08, 0xd8b23a, { rough: 0.5, metal: 0.6, seg: 8 });
    reg(hits, looseCotter, "missing-cotter-pin");

    // Rail gauge tool spanning the two rails.
    const gaugeTool = instrument(rails, 0, 0.7, 0.16, { ry: 0, idle: "-- mm", color: 0xff9f43, w: 0.4 });
    holoTag(gaugeTool, "Rail gauge", 0, -0.14, 0, { css: "#ff9f43", w: 0.28 });
    reg(hits, gaugeTool, "rail-gauge-tool");

    // Rail section staged for the hoist, and the bracket slot it lands on.
    const railSection = box(shaft, 0.06, 1.4, 0.08, 0.9, 0.7, 0.15, CITY.steel, { rough: 0.4, metal: 0.75 });
    holoTag(railSection, "Rail section", 0, 0.75, 0, { css: "#ff9f43", w: 0.3 });
    reg(hits, railSection, "rail-section");
    const railSlot = box(rails, 0.1, 0.1, 0.1, 0.45, 1.9, 0.05, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, railSlot, "rail-bracket-slot");
    const swingMarker = box(shaft, 0.14, 0.14, 0.14, -0.15, 2.6, -0.15, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(swingMarker, "load path — stand clear", 0, 0.14, 0, { css: "#f0645b", w: 0.4 });
    reg(hits, swingMarker, "swinging-rail-load");

    // ---------------------------------------------------------------- false car
    const falseCar = group(shaft, 0, 0.05, -0.15);
    const deckTex = surfaceTexture((cx, w, h) => deckPlateFace(cx, w, h, { base: "#3a4048", base2: "#31363d", step: 22 }), { repeat: 1, px: 256 });
    const deck = box(falseCar, 1.7, 0.06, 1.4, 0, 0, 0, 0x3a4048, { rough: 0.8, metal: 0.2 });
    deck.material = texturedMat(deckTex, { rough: 0.75, metal: 0.25, color: 0x3a4048 });
    for (const [hx, hz] of [[-0.8, -0.6], [0.8, -0.6], [-0.8, 0.6], [0.8, 0.6]]) {
      cyl(falseCar, 0.02, 0.02, 3.0, hx, 1.5, hz, CITY.darkSteel, { rough: 0.5, metal: 0.6, seg: 8 });
    }
    holoTag(falseCar, "False car", -0.7, 0.2, 0, { css: "#ff9f43", w: 0.3 });
    reg(hits, falseCar, "false-car");

    const openEdge = box(falseCar, 1.7, 0.3, 0.06, 0, 0.15, 0.72, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(openEdge, "Open edge — no fall protection", 0, 0.2, 0, { css: "#f0645b", w: 0.5 });
    reg(hits, openEdge, "open-hoistway-edge");

    const falseCarStop = group(falseCar, 0.7, 0.1, -0.5, -0.3);
    box(falseCarStop, 0.12, 0.16, 0.07, 0, 0.08, 0, 0x22272c, { rough: 0.5, metal: 0.4 });
    const fcLever = box(falseCarStop, 0.03, 0.08, 0.03, 0, 0.15, 0.03, 0xd8232a, { rough: 0.5 });
    const fcLamp = ball(falseCarStop, 0.014, 0, 0.2, 0.035, 0xd8232a, { emissive: 0xd8232a, ei: 1.6 });
    holoTag(falseCarStop, "False car stop", 0, 0.26, 0, { css: "#ff9f43", w: 0.32 });
    reg(hits, falseCarStop, "false-car-stop-switch");

    const hoistControl = group(falseCar, -0.6, 0.1, -0.4, 0.3);
    box(hoistControl, 0.1, 0.14, 0.06, 0, 0.07, 0, 0x2b3138, { rough: 0.5, metal: 0.4 });
    const controlLever = box(hoistControl, 0.022, 0.06, 0.022, 0, 0.13, 0.02, 0xff9f43, { rough: 0.45, emissive: 0xff9f43, ei: 0.7 });
    holoTag(hoistControl, "Hoist control", 0, 0.2, 0, { css: "#ff9f43", w: 0.3 });
    reg(hits, hoistControl, "hoist-control");

    // ------------------------------------------------------------- landing door
    const landing = group(g, 1.9, 0, -0.6, -1.1);
    box(landing, 0.9, 2.1, 0.1, 0, 1.05, 0, 0x6f7a83, { rough: 0.5, metal: 0.4 });
    const landingDoor = group(landing, -0.42, 1.0, 0.06);
    const doorLeaf = box(landingDoor, 0.8, 1.95, 0.03, 0.4, 0, 0, 0x53585e, { rough: 0.5, metal: 0.4 });
    void doorLeaf;
    const lockPlate = box(landing, 0.05, 0.14, 0.03, 0.02, 1.0, 0.08, 0x22272c, { rough: 0.5, metal: 0.5 });
    const lockLamp = ball(landing, 0.014, 0.02, 1.1, 0.09, 0xd8232a, { emissive: 0xd8232a, ei: 1.4 });
    holoTag(landing, "Landing door lock", 0, 1.9, 0, { css: "#ff9f43", w: 0.34 });
    reg(hits, lockPlate, "landing-door-lock");

    // ---------------------------------------------------- material staging deck
    const woodTex = surfaceTexture((cx, w, h) => ewfcsWoodFace(cx, w, h, {}), { repeat: 1, px: 256 });
    const stage = box(g, 1.1, 0.08, 0.7, 1.9, 0.04, 1.3, 0x8a5a34, { rough: 0.75 });
    stage.material = texturedMat(woodTex, { rough: 0.7, metal: 0.02, color: 0x8a5a34 });
    barrierPanel(g, 2.6, 1.0, { color: 0xe4622a, ry: -0.5 });

    // ---------------------------------------------------------------- toolkit + docs
    const chest = toolChest(g, -2.1, 1.3, { ry: 0.6, color: 0xff9f43 });
    void chest;

    const talkPanel = holoPanel(g, 0.5, 0.36, -1.95, 1.4, 1.4, (ctx, w, h) => {
      ctx.fillStyle = "rgba(6,16,22,0.9)"; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#ff9f43"; ctx.fillRect(0, 0, w, 5);
      ctx.fillStyle = "#ffd9ac"; ctx.font = `600 ${Math.round(h * 0.1)}px 'Barlow Condensed', Arial, sans-serif`;
      ctx.textAlign = "left"; ctx.textBaseline = "middle";
      ctx.fillText("TOOLBOX TALK — RAIL SETTING", w * 0.06, h * 0.16);
      ctx.font = `${Math.round(h * 0.085)}px Arial, sans-serif`; ctx.fillStyle = "#f5e6d3";
      ["Rider: false car crew", "Hoist operator: ground level", "Barricades: floors above and below", "Tag line always in hand"].forEach((line, i) =>
        ctx.fillText(line, w * 0.06, h * (0.36 + i * 0.15)));
    }, { ry: 0.5, accent: 0xff9f43 });
    reg(hits, talkPanel, "toolbox-talk-panel");

    const permitPanel = holoPanel(g, 0.56, 0.4, -0.5, 1.5, 1.85, (ctx, w, h) => {
      ctx.fillStyle = "rgba(6,16,22,0.9)"; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#ff9f43"; ctx.fillRect(0, 0, w, 5);
      ctx.fillStyle = "#ffd9ac"; ctx.font = `600 ${Math.round(h * 0.09)}px 'Barlow Condensed', Arial, sans-serif`;
      ctx.textAlign = "left"; ctx.textBaseline = "middle";
      ctx.fillText("HOISTWAY PERMIT EW-12", w * 0.06, h * 0.14);
      ctx.fillStyle = "#f5e6d3"; ctx.font = `600 ${Math.round(h * 0.14)}px 'Barlow Condensed', Arial, sans-serif`;
      ctx.fillText("SHAFT 1 — FALSE CAR RIG", w * 0.06, h * 0.33);
      ctx.font = `${Math.round(h * 0.08)}px Arial, sans-serif`; ctx.fillStyle = "#f0dcc0";
      ["Barricades: all landings above/below", "False car: brackets confirmed", "Fall protection: tied off at open edge", "Log the as-built before sign-off"].forEach((line, i) =>
        ctx.fillText(line, w * 0.06, h * (0.5 + i * 0.11)));
    }, { ry: -0.3, accent: 0xff9f43 });
    reg(hits, permitPanel, "hoistway-permit");

    const logPanel = holoPanel(g, 0.5, 0.34, 0.9, 1.4, 1.9, (cx, w, h) => {
      cx.fillStyle = "rgba(6,16,22,0.9)"; cx.fillRect(0, 0, w, h);
      cx.fillStyle = "#ff9f43"; cx.fillRect(0, 0, w, 5);
      cx.fillStyle = "#ffe9d0"; cx.textAlign = "left"; cx.textBaseline = "middle";
      cx.font = `600 ${Math.round(h * 0.12)}px 'Barlow Condensed', Arial, sans-serif`;
      cx.fillText("LAYOUT LOG — SHAFT 1", w * 0.06, h * 0.2);
      cx.font = `${Math.round(h * 0.09)}px Arial, sans-serif`; cx.fillStyle = "#e9d5b8";
      cx.fillText("Bracket spacing, plumb, gauge", w * 0.06, h * 0.48);
      cx.fillText("as-built for the next floor up", w * 0.06, h * 0.68);
    }, { ry: -0.6, accent: 0xff9f43 });
    reg(hits, logPanel, "layout-log");

    // Second constructor tending the hoist from ground level.
    const groundHand = standingFigure(g, 1.7, 1.35, { ry: -2.4, cloth: 0x37505f, helmet: 0xff9f43, vest: 0xe4dc3a });
    holoTag(groundHand, "hoist operator", 0, 1.95, 0, { css: "#ff9f43", w: 0.36 });

    let falseCarSecured = false, stopped = false;
    const dustAtLift = particles(shaft, 16, 0xd8c6a8, { size: 0.012, life: 0.4 });

    return {
      hits,
      footprint: 2.3,

      onStepComplete(step) {
        if (step.id === "toolbox-talk") repaint(talkPanel.userData.face, (ctx, w, h) => {
          ctx.fillStyle = "rgba(6,16,22,0.9)"; ctx.fillRect(0, 0, w, h);
          ctx.fillStyle = "#59c97b"; ctx.fillRect(0, 0, w, 5);
          ctx.fillStyle = "#bff7d4"; ctx.font = `700 ${Math.round(h * 0.16)}px 'Barlow Condensed', Arial, sans-serif`;
          ctx.textAlign = "center"; ctx.textBaseline = "middle";
          ctx.fillText("BRIEFED", w / 2, h / 2);
        });
        if (step.id === "false-car-secure") falseCarSecured = true;
        if (step.id === "false-car-stop") { stopped = true; fcLever.rotation.x = -1.0; fcLamp.material = mat(0x59c97b, { emissive: 0x59c97b, ei: 1.8 }); }
        if (step.id === "set-rail") railSection.material = mat(0x8b929a, { rough: 0.4, metal: 0.8 });
        if (step.id === "bolt-torque") boltLever.rotation.z = 1.2;
        if (step.id === "landing-lock") { lockLamp.material = mat(0x59c97b, { emissive: 0x59c97b, ei: 1.6 }); }
        if (step.id === "restore") { stopped = false; fcLever.rotation.x = 0; fcLamp.material = mat(0xd8232a, { emissive: 0xd8232a, ei: 1.6 }); }
      },

      onInterrupt(it) {
        if (it.id === "landing-reopened") { landingDoor.rotation.y = -1.1; lockLamp.material = mat(0xd8232a, { emissive: 0xd8232a, ei: 2.0 }); }
        if (it.id === "tagline-snag") { railSection.userData.spin = true; railSection.rotation.y = 0.6; }
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "landing-reopened") { landingDoor.rotation.y = 0; lockLamp.material = mat(0x59c97b, { emissive: 0x59c97b, ei: 1.6 }); }
        if (it.id === "tagline-snag") { railSection.userData.spin = false; railSection.rotation.y = 0; }
      },

      animate(t, dt, session) {
        void falseCarSecured;
        if (railSection.userData.spin) railSection.rotation.y += dt * 4;
        if (stopped && session?.step?.id === "hoist-material") {
          railSection.position.y = 0.7 + Math.min(1.1, (session.holdFor ?? 0) * 0.18);
          dustAtLift.visible = true;
          dustAtLift.userData.step(dt, new THREE.Vector3(0.9, 0.2, -1.35), 0.1, 0.3, -0.4);
        } else if (dustAtLift.visible) dustAtLift.visible = false;

        const gg = session?.gauge;
        if (gg && !gg.committed) {
          if (session.step?.id === "plumb-check") {
            const mm = ((gg.t - 0.5) * 24).toFixed(1);
            repaint(plumbInstrument.userData.screen, signFace(`${mm} mm`, {
              bg: "#0d1c24", accent: gg.t > 0.42 && gg.t < 0.58 ? "#59c97b" : "#f0645b", fg: "#bfeaf7", scale: 0.55,
            }));
          }
          if (session.step?.id === "gauge-check") {
            const mm = (1200 + (gg.t - 0.5) * 10).toFixed(1);
            repaint(gaugeTool.userData.screen, signFace(`${mm} mm`, {
              bg: "#0d1c24", accent: gg.t > 0.46 && gg.t < 0.56 ? "#59c97b" : "#f0645b", fg: "#bfeaf7", scale: 0.5,
            }));
          }
        }
        if (session?.turn && session.step?.id === "bolt-torque") {
          boltLever.rotation.z = (session.turn.amount / session.turn.required) * 1.2;
        }
      },
    };
  },
};
