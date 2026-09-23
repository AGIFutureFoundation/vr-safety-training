import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, ball, torus, hose, group, decal, repaint, signFace, paperFace, particles, mat,
  standingPerson,
} from "../../../shared/kit.js";
import {
  CITY, stationPad, holoPanel, holoTag, instrument, standingFigure, reg,
  surfaceTexture, texturedMat, pavingFace, lockTag, cylinderTank,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Storage & Bike Room VR — Building Systems & Facilities,
// property management zone twenty.
//
// The basement of an older building: residents' storage cages under a
// sprinkler main, a bike room full of e-bikes on chargers, a stair exit at
// the end, and pipe lagging from a boiler era nobody remembers. The annual
// storage audit worked to the lease's notice, fuel pulled out of the cages,
// boxes brought down below the sprinklers, the inspector's test run with the
// monitoring company told first, the chargers audited, the old lagging left
// strictly alone for the licensed contractor, and a neighbour's bolt cutters
// put down. Generic building — only the codes, standards and unions are
// named.

const PMSB_ACCENT = 0x5ab8c8;
const PMSB_CSS = "#5ab8c8";
const PMSB_WARN = "#f0645b";

export const SIM_PM_STORAGE_AND_BIKE_ROOM = {
  id: "pm-storage-and-bike-room",
  index: "236",
  domain: "Building Systems & Facilities",
  trade: "Building porter and maintenance technician — SEIU building staff, IUOE Local 39 engineers for the sprinkler and the pipe lagging, and the apartment association's CAMT credential",
  category: "Building Systems & Facilities",
  indoor: "garage",
  certification: "NFPA 25 for sprinkler obstructions and the inspector's test, and NFPA 72 for the waterflow alarm and its monitoring; EPA's asbestos rules at 40 CFR 61 and OSHA 29 CFR 1926.1101 for the old pipe lagging; 29 CFR 1910.157 portable extinguishers, 29 CFR 1910.36 exit routes and 29 CFR 1910.23 ladders for the upper bike rack; the local fire and housing codes on basement storage, battery charging and abandoned property; SEIU building staff, IUOE Local 39 engineers for the sprinkler and the lagging, and the apartment association's CAMT credential",
  name: "Storage & Bike Room",
  title: simTitle("Storage & Bike Room"),
  tagline: "The basement audit: fuel out of the cages, boxes below the sprinklers, the inspector's test run with the monitoring company told, the e-bike chargers audited, and the old lagging left for the licensed crew",
  accent: PMSB_ACCENT,
  accentCss: PMSB_CSS,
  parSeconds: 300,
  footprint: 2.5,
  badge: { id: "clear-heads", name: "Clear Heads", note: "Every sprinkler head clear, no fuel in a cage, the flow alarm proven, and the lagging left untouched" },

  supportLine: "your union steward or member-assistance contact, or your employer's employee assistance program",

  game: system({
    name: "Basement Audit",
    currency: "CAGES",
    ranks: ["Porter", "Maintenance Tech", "Lead Tech", "Building Engineer", "Storage Audit Certified"],
    badges: [
      { id: "eighteen-clear", name: "Eighteen Clear", note: "Sprinkler clearance read inside the band first time", test: AWARD.stepClean("measure-clearance") },
      { id: "hands-off-lagging", name: "Hands Off", note: "No unsafe act anywhere in the basement", test: AWARD.safe },
      { id: "riser-back", name: "Riser Back", note: "Brought the riser back without breaking the band", test: AWARD.stepClean("close-test-valve") },
    ],
    challenges: [
      { id: "clean-audit", name: "Clean Audit", note: "No corrections across the whole audit", test: AWARD.clean },
      { id: "steady-riser", name: "Steady Riser", note: "Held the riser without breaking the band", test: AWARD.unbroken },
      { id: "audit-done", name: "Audit Done by Noon", note: "Finished inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "disturb-lagging": "You started pulling the loose, torn lagging off the old pipe by hand. Pipe insulation from that era is presumed to contain asbestos until a sample says otherwise, and torn by hand it sheds fibres into a basement residents walk through — it is sealed off, left alone and removed by a licensed abatement crew.",
    "ladder-on-bike-rack": "You climbed the two-tier bike rack to reach a bike on the top row. The rack is built for bikes, not a person's weight on its rail, and a fall from it lands you on the handlebars and pedals below — the step ladder, footed and held, is for the top tier.",
    "charge-swollen-battery": "You plugged in the e-bike battery with the swollen case. A lithium pack that has swollen has already failed inside, and charging it is how basement fires start — it goes in the sand bin, away from the building, and the resident is told why.",
    "gas-can-to-compactor": "You went to tip the gas can from the storage cage into the trash compactor chute. Fuel in a compactor is fuel next to a hydraulic ram and a spark, in a room connected to every floor — it goes back to the resident or to a hazardous waste pickup, never in the trash.",
  },

  lateNotes: {
    "test-valve-hold": "Not yet — the flow alarm test comes after the inspector's test valve has been opened, with the monitoring company told.",
    "extinguisher-gauge": "The extinguisher is read on the way out, once the room is safe to leave.",
  },

  steps: [
    {
      id: "read-audit-notice", kind: "select", target: "audit-notice",
      title: "Read the storage audit notice",
      cue: "Check the notice posted to residents: the date, the rules and what happens to prohibited items.",
      why: "Residents' storage cages hold residents' property, and the lease and local housing code decide what staff may do with it — usually only after written notice. The notice posted two weeks ago is what lets the audit open a cage's contents to a flashlight and remove fuel from it, and working without it turns a safety audit into a dispute about somebody's belongings.",
    },
    {
      id: "walk-cages", kind: "find", noHint: true,
      targets: ["propane-in-cage", "gas-can-in-cage"],
      itemNames: { "propane-in-cage": "barbecue propane cylinder in cage 12", "gas-can-in-cage": "petrol can in cage 7" },
      itemNotes: {
        "propane-in-cage": "A barbecue propane cylinder is stored in cage 12. Propane is heavier than air, and a slow leak in a basement pools at floor level until it finds a pilot light.",
        "gas-can-in-cage": "A petrol can for a lawn mower that no longer exists, sitting in cage 7. Fuel vapour in a basement storage room is the fire the building's sprinklers were never meant to have to fight.",
      },
      title: "Walk the cages for prohibited fuel",
      cue: "Find the fuel stored where the fire code says it never goes.",
      why: "Basement storage sits below every apartment in the building, and local fire codes keep flammable gases and liquids out of it for that reason. The two classic finds in any storage audit are a propane cylinder and a petrol can, both stored with good intentions and both able to turn a small fire into a building fire.",
    },
    {
      id: "lower-boxes", kind: "drag", target: "top-box",
      title: "Bring the top box down below the sprinkler line",
      cue: "Lift the top box off the stack and set it on the empty lower shelf.",
      why: "The fix for an obstructed head is the plain one: take the top layer down until the stack is back below the line painted on the cage. Moved to a lower shelf rather than the floor, the box stays in the resident's cage and out of the aisle, and the head above it is clear again.",
      drag: { to: "lower-shelf-slot", radius: 0.5, missNote: "Not on the lower shelf — a box set in the aisle trades an obstructed sprinkler for a blocked exit route." },
    },
    {
      id: "measure-clearance", kind: "gauge", target: "sprinkler-clearance",
      title: "Prove the clearance below the sprinkler heads",
      cue: "Run the tape from the top of the lowered stack to the deflector and commit when it reads in the band.",
      why: "A sprinkler head needs clear space below its deflector to throw water in its designed pattern, and boxes stacked into that space turn the spray into a trickle down the side of the pile. NFPA 25 inspections check for exactly this obstruction, and the 18-inch figure they check against is the clearance a basement fire actually needs.",
      gauge: { label: "HEAD CLEARANCE", speed: 0.55, green: [0.5, 0.8], readout: (t) => `${Math.round(t * 36)} in`, missNote: "Outside the band — too close and the spray is blocked. Measure again from the top of the stack to the deflector." },
    },
    {
      id: "open-test-valve", kind: "turn", target: "inspector-test-valve",
      title: "Open the inspector's test valve",
      cue: "With the monitoring company told the system is on test, open the inspector's test valve.",
      why: "The inspector's test valve flows the same water one open sprinkler would, which is how the waterflow alarm is proven without setting off a head. The monitoring company is told first, because a waterflow signal from this building with nobody warning them sends the fire department out on a test.",
      turn: { turns: 0.6, axis: "z", label: "INSPECTOR'S TEST" },
    },
    {
      id: "wait-flow-alarm", kind: "hold", target: "test-valve-hold", seconds: 5,
      title: "Hold the test flowing until the waterflow alarm sounds",
      cue: "Keep the test valve flowing and hold until the bell and the panel both show the alarm.",
      why: "NFPA 72 sets how quickly a waterflow switch must report once water moves, and the only way to prove it does is to let the test flow and time it. Shut too early, the test proves nothing about the switch, its delay or the path to the monitoring company — hold until both the bell and the panel say it arrived.",
      holdBreakNote: "You shut it off before the alarm came in. The flow switch is still unproven — hold the test flowing until the bell sounds.",
    },
    {
      id: "audit-chargers", kind: "sequence",
      targets: ["charger-unplug", "charger-tag"],
      itemNames: { "charger-unplug": "unattended charger unplugged from the power strip", "charger-tag": "charger tagged with the building's charging rule" },
      title: "Audit the e-bike chargers",
      cue: "Unplug the charger left running on the power strip, then tag it with the building's charging rule.",
      why: "Lithium e-bike batteries fail most often while charging, and a room of them charging unattended on power strips is a room where one failure lights the rest. Unplugging first takes the energy out of the situation; the tag tells the resident why, and points them to the rule about where and how the building allows charging.",
      outOfOrderNote: "Unplug first, then tag — tagging a charger that is still charging leaves the risk running while the paperwork gets done.",
    },
    {
      id: "close-test-valve", kind: "track", target: "riser-pressure", seconds: 7,
      title: "Close the test valve and watch the riser recover",
      cue: "Close the inspector's test valve slowly, keeping the riser pressure in the band as it recovers.",
      why: "Slammed shut, a flowing test valve sends a pressure spike back through the sprinkler main that can trip the alarm again or stress old fittings; closed slowly, the riser pressure climbs back to static and the alarm resets cleanly. The gauge on the riser is how you know the system is back to the pressure it was at before you touched it.",
      track: { start: 0.25, green: [0.4, 0.64], rise: 0.44, fall: 0.38, drift: 0.12, label: "RISER PRESSURE", readout: (v) => (v < 0.4 ? "still flowing" : v > 0.64 ? "pressure spike" : "recovering") },
      holdBreakNote: "The riser left the band. A spike means the valve was shut too fast; still flowing means it isn't shut — bring it back into the band.",
    },
    {
      id: "walk-overhead", kind: "find", noHint: true,
      targets: ["torn-pipe-lagging", "bike-on-exit-rail"],
      itemNames: { "torn-pipe-lagging": "torn lagging on the old steam pipe", "bike-on-exit-rail": "bike locked to the exit stair handrail" },
      itemNotes: {
        "torn-pipe-lagging": "The old steam pipe's lagging has been torn open where a bike handlebar caught it. That material has to be presumed to contain asbestos, and it is now loose and shedding over the bike room.",
        "bike-on-exit-rail": "Somebody has locked a bike to the handrail of the exit stair. In smoke, the stair is found by touch, and a bike across it is the first thing a resident falls over.",
      },
      title: "Walk the overhead and the exit",
      cue: "Find what is shedding overhead and what is blocking the way out.",
      why: "A basement's overhead carries the building's history — steam pipes insulated in an era of asbestos — and its exit stair carries everyone's way out. The asbestos rules exist because damaged lagging releases fibres at the moment it is disturbed, and the exit-route rule exists because a stair is useless the moment anything is tied across it.",
    },
    {
      id: "call-abatement", kind: "select", target: "abatement-call",
      title: "Seal off the lagging and call the licensed abatement contractor",
      cue: "Post the do-not-disturb sign, tape off the area and call the licensed abatement contractor.",
      why: "Damaged suspect lagging is not a maintenance job: the asbestos rules require it to be assessed and removed by trained, licensed abatement workers, and 1926.1101 treats the disturbance itself as the hazard. The building's part is to stop anyone touching it, keep residents away from it and get the right crew in.",
    },
    {
      id: "read-extinguisher", kind: "gauge", target: "extinguisher-gauge",
      title: "Read the extinguisher's pressure gauge",
      cue: "Check the extinguisher by the exit and commit when its needle sits in the green.",
      why: "The portable extinguisher by the bike room exit is the one somebody will grab when a battery starts to smoke, and an extinguisher that has lost pressure empties in a cough. The monthly check that 1910.157 asks for is mostly this: a needle in the green, a pin in place and a tag that shows somebody looked.",
      gauge: { label: "EXTINGUISHER", speed: 0.55, green: [0.38, 0.62], readout: (t) => (t < 0.38 ? "RECHARGE" : t > 0.62 ? "OVERCHARGED" : "IN GREEN"), missNote: "Needle out of the green — recharge or overcharge. Read it again, and tag it out if it holds there." },
    },
    {
      id: "crew-checkin", kind: "select", target: "coworker-checkin",
      title: "Check in with the maintenance tech",
      cue: "Hand over the lagging closure, the battery and the cage issues, and ask how the tech is doing.",
      why: "The maintenance tech will meet the abatement contractor, field the resident whose battery went in the sand bin and the one whose cage lock was nearly cut, so they need all of it handed over in person. A basement shift that included a smoking battery is also worth an honest question about how a coworker is doing.",
    },
    {
      id: "building-log", kind: "select", target: "building-log",
      title: "Enter the audit in the building log",
      cue: "Log the fuel removed, the clearances fixed, the flow alarm time, the lagging closure and the battery incident.",
      why: "The building log is where the flow alarm's response time is kept for the sprinkler inspector, where the lagging closure and the abatement call are dated for the asbestos records, and where the fuel removed from each cage is noted for the residents' notices. A basement audit that is not written down has to be done again from scratch next year.",
    },
  ],

  interrupts: [
    {
      id: "bolt-cutter-neighbour",
      kind: "Resident cutting a neighbour's cage lock",
      after: "wait-flow-alarm", delay: 3, seconds: 13,
      alert: "While you hold the test flowing, a resident arrives with bolt cutters and starts on the lock of cage 9 — he says it's been abandoned for a year and he wants the space.",
      cue: "Stop him and log the cage on the abandoned-property sheet for the office's notice process. Keep the test flowing.",
      target: "abandoned-property-log",
      why: "A storage cage belongs to whoever rents it until the building's notice process under the lease and local law says otherwise, and cutting a lock — even on a cage that looks abandoned — is taking somebody's property. Logging it for the office starts the lawful process, and the neighbour gets an answer rather than a confrontation.",
      missNote: "He kept cutting at the lock the whole window. The cage's owner comes back to a cut lock and missing belongings, and the building let it happen.",
      wrongNote: "That doesn't stop him. The abandoned-property sheet starts the office's notice process — log cage 9 and ask him to put the cutters down.",
    },
    {
      id: "battery-venting",
      kind: "E-bike battery venting smoke",
      after: "close-test-valve", delay: 3, seconds: 12,
      alert: "A charging e-bike battery on the far rack starts hissing and pouring white smoke — the monitoring account is still on test.",
      cue: "Pull the fire alarm station by the exit and get out and call 911. The monitoring company won't dispatch while the system is on test.",
      target: "fire-alarm-pull",
      why: "A lithium battery in thermal runaway can go from smoke to fire in seconds and reignite after it seems out, and the building's alarm is what gets every resident above this room moving. With the monitoring account on test, pulling the station sounds the building and the 911 call is yours — nobody else is going to make it.",
      missNote: "The battery smoked the whole window and nobody pulled the alarm. With the monitoring on test, the building had no warning and the fire department had no call.",
      wrongNote: "That doesn't warn the building. The pull station by the exit sounds the alarm — pull it, get out and call 911.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root, 0, 0, -0.3);
    stationPad(g, 2.5, PMSB_ACCENT);

    // ------------------------------------------------------------ basement slab
    const floorTex = surfaceTexture((cx, w, h) => pavingFace(cx, w, h, { tiles: 5, base: "#707478", base2: "#666a6e", seam: "rgba(20,20,20,0.3)" }), { repeat: 5, px: 384 });
    const floor = box(g, 6.4, 0.02, 5.0, 0, 0.011, -0.3, 0x707478, { rough: 0.9 });
    floor.material = texturedMat(floorTex, { rough: 0.9, metal: 0.02, color: 0x80848a });
    box(g, 6.2, 0.005, 0.08, 0, 0.022, 0.2, 0xf2c14b, { rough: 0.6, cast: false });

    // ------------------------------------------------------------ storage cages
    const cages = group(g, -1.4, 0, -2.0);
    const mesh = 0x9aa2a8;
    for (let c = 0; c < 3; c++) {
      const cx = -1.0 + c * 1.0;
      for (const sx of [-0.48, 0.48]) box(cages, 0.03, 2.2, 0.9, cx + sx, 1.1, 0, mesh, { rough: 0.4, metal: 0.6, opacity: 0.55, transparent: true });
      box(cages, 0.96, 2.2, 0.02, cx, 1.1, 0.45, mesh, { rough: 0.4, metal: 0.6, opacity: 0.35, transparent: true });
      decal(cages, 0.14, 0.08, cx, 1.9, 0.47, signFace(`${[7, 9, 12][c]}`, { bg: "#1b1e22", accent: PMSB_CSS, scale: 0.6 }), { px: 64 });
      box(cages, 0.9, 0.03, 0.8, cx, 0.5, -0.02, 0x8b929a, { rough: 0.5, metal: 0.4 });
      // Painted sprinkler clearance line on the back of each cage.
      box(cages, 0.9, 0.02, 0.01, cx, 1.95, -0.44, 0xd8232a, { rough: 0.6 });
    }
    // Cage 7: petrol can.
    const gasCan = group(cages, -1.0, 0.52, 0.1);
    box(gasCan, 0.22, 0.26, 0.14, 0, 0.13, 0, 0xd8232a, { rough: 0.5 });
    reg(hits, gasCan, "gas-can-in-cage");
    // Cage 9: lock for the interruption.
    const cage9Lock = lockTag(cages, 0.3, 1.1, 0.47, { lines: ["CAGE 9", "RENTED"] });
    void cage9Lock;
    // Cage 12: propane and the box stack up into the sprinkler zone.
    const propane = cylinderTank(cages, 1.2, 0.2, 0xf4f4f0, { plateLabel: "PROPANE", plateLines: ["20 LB · BBQ"] });
    propane.scale.set(0.8, 0.45, 0.8);
    propane.position.y = 0.52;
    reg(hits, propane, "propane-in-cage");
    const stack = group(cages, 0.85, 0.52, -0.05);
    for (let i = 0; i < 4; i++) box(stack, 0.5, 0.34, 0.5, 0, 0.17 + i * 0.35, 0, 0xb8905a - i * 0x040404, { rough: 0.9 });
    const topBox = group(stack, 0, 1.4, 0);
    box(topBox, 0.5, 0.34, 0.5, 0, 0.17, 0, 0xa9804e, { rough: 0.9 });
    reg(hits, topBox, "top-box");
    const lowShelf = box(cages, 0.5, 0.3, 0.5, 1.2, 0.2, 0.15, 0xffffff, { opacity: 0.001, transparent: true, cast: false });
    hits["lower-shelf-slot"] = lowShelf;
    holoTag(cages, "lower shelf · cage 12", 1.2, 0.42, 0.47, { css: PMSB_CSS, w: 0.34 });

    // ------------------------------------------------------------ sprinkler main, heads, inspector's test, riser
    const mainPipe = cyl(g, 0.05, 0.05, 6.0, 0, 2.7, -1.6, 0xd8232a, { rough: 0.4, metal: 0.5, seg: 12 });
    mainPipe.rotation.z = Math.PI / 2;
    const heads = [];
    for (let i = 0; i < 4; i++) {
      const hd = group(g, -2.4 + i * 1.3, 2.55, -1.6);
      cyl(hd, 0.015, 0.015, 0.1, 0, 0.05, 0, 0xb8862b, { rough: 0.3, metal: 0.8, seg: 8 });
      cyl(hd, 0.04, 0.04, 0.01, 0, -0.01, 0, 0xb8862b, { rough: 0.3, metal: 0.8, seg: 10 });
      heads.push(hd);
    }
    const tape = instrument(g, -0.55, 2.2, -1.6, { idle: "-- in", color: 0xf2c14b, w: 0.12, d: 0.16 });
    tape.rotation.x = Math.PI / 2;
    reg(hits, tape, "sprinkler-clearance");
    holoTag(g, "clearance tape", -0.55, 2.02, -1.5, { css: PMSB_CSS, w: 0.26 });
    const riser = group(g, 2.7, 0, -2.2);
    cyl(riser, 0.08, 0.08, 2.7, 0, 1.35, 0, 0xd8232a, { rough: 0.4, metal: 0.5, seg: 14 });
    const riserGauge = group(riser, 0, 1.5, 0.1);
    cyl(riserGauge, 0.07, 0.07, 0.03, 0, 0, 0, 0xdfe4e8, { rough: 0.3, seg: 16 }).rotation.x = Math.PI / 2;
    const rNeedle = box(riserGauge, 0.005, 0.05, 0.004, 0, 0.015, 0.018, 0xd8232a, { rough: 0.4 });
    reg(hits, riserGauge, "riser-pressure");
    holoTag(riser, "sprinkler riser gauge", 0, 1.72, 0.1, { css: PMSB_CSS, w: 0.36 });
    const flowSwitch = box(riser, 0.12, 0.14, 0.1, 0, 1.0, 0.1, 0x3a4450, { rough: 0.5 });
    void flowSwitch;
    const bell = group(riser, 0.4, 2.2, 0.05);
    const bellDome = cyl(bell, 0.12, 0.14, 0.06, 0, 0, 0, 0xd8232a, { rough: 0.4, metal: 0.4, seg: 16 });
    bellDome.rotation.x = Math.PI / 2;
    const itv = group(g, 2.1, 1.3, -2.25);
    cyl(itv, 0.03, 0.03, 0.4, 0, 0, 0, 0xd8232a, { rough: 0.4, metal: 0.5, seg: 10 }).rotation.z = Math.PI / 2;
    const itvHandle = box(itv, 0.12, 0.025, 0.025, 0, 0.05, 0.03, 0xf2c14b, { rough: 0.5 });
    reg(hits, itv, "inspector-test-valve");
    holoTag(itv, "inspector's test", 0, 0.2, 0.03, { css: PMSB_CSS, w: 0.28 });
    const sight = group(g, 1.75, 1.3, -2.25);
    cyl(sight, 0.05, 0.05, 0.1, 0, 0, 0, 0xcfe6f2, { rough: 0.1, opacity: 0.6, transparent: true, seg: 12 }).rotation.z = Math.PI / 2;
    reg(hits, sight, "test-valve-hold");
    holoTag(sight, "sight glass", 0, 0.14, 0.03, { css: PMSB_CSS, w: 0.22 });
    const testFlow = particles(sight, 14, 0x9fd4ff, { size: 0.02, life: 0.4, additive: false, opacity: 0.7 });
    hose(g, [[1.7, 1.3, -2.25], [1.5, 0.8, -2.3], [1.4, 0.05, -2.3]], 0.02, 0xd8232a, { steps: 10 });

    // ------------------------------------------------------------ old steam pipe with lagging
    const steam = group(g, 0, 2.3, -0.4);
    const lag = cyl(steam, 0.1, 0.1, 5.6, 0, 0, 0, 0xe6e0cc, { rough: 0.95, seg: 12 });
    lag.rotation.z = Math.PI / 2;
    const torn = group(steam, 1.2, -0.05, 0.05);
    box(torn, 0.3, 0.06, 0.14, 0, -0.06, 0, 0xd8d0b8, { rough: 0.95 }).rotation.z = 0.5;
    cyl(torn, 0.04, 0.04, 0.3, 0, 0, 0, 0x6a4a2a, { rough: 0.7, metal: 0.4, seg: 10 }).rotation.z = Math.PI / 2;
    reg(hits, torn, "torn-pipe-lagging");
    const pullLag = box(steam, 0.3, 0.2, 0.2, 1.2, -0.18, 0.08, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(steam, "pull it off by hand?", 1.2, -0.36, 0.1, { css: PMSB_WARN, w: 0.36 });
    reg(hits, pullLag, "disturb-lagging");
    const noTouch = decal(steam, 0.4, 0.2, 1.2, -0.5, 0.12, paperFace("DANGER", ["ASBESTOS SUSPECT", "DO NOT DISTURB"], { bg: "#fff2d6", band: "#b8402f" }), { px: 192 });
    noTouch.visible = false;
    const tapeLine = group(g, 1.2, 0, -0.1);
    for (const y of [0.9, 1.1]) box(tapeLine, 1.6, 0.05, 0.005, 0, y, 0, 0xf2c14b, { rough: 0.6 });
    tapeLine.visible = false;
    const phone = group(g, 2.9, 1.4, -0.9, -Math.PI / 2);
    box(phone, 0.2, 0.28, 0.06, 0, 0, 0, 0x3a4450, { rough: 0.5 });
    box(phone, 0.05, 0.2, 0.05, -0.06, 0, 0.05, 0x22262b, { rough: 0.5 });
    reg(hits, phone, "abatement-call");
    holoTag(phone, "building phone · abatement", 0, 0.22, 0.04, { css: PMSB_CSS, w: 0.4 });

    // ------------------------------------------------------------ bike room: racks, chargers, sand bin
    const rack = group(g, 1.3, 0, 0.9);
    box(rack, 2.4, 0.06, 0.1, 0, 1.3, -0.3, 0x5a6878, { rough: 0.5, metal: 0.5 });
    box(rack, 2.4, 0.06, 0.1, 0, 0.3, -0.3, 0x5a6878, { rough: 0.5, metal: 0.5 });
    for (const sx of [-1.15, 1.15]) box(rack, 0.06, 1.8, 0.1, sx, 0.9, -0.3, 0x5a6878, { rough: 0.5, metal: 0.5 });
    for (let i = 0; i < 3; i++) {
      const bike = group(rack, -0.8 + i * 0.8, 0, 0);
      for (const bz of [-0.35, 0.35]) torus(bike, 0.28, 0.02, 0, 0.3, bz, 0x1b1e22, { rough: 0.8, seg: 6, seg2: 18 }).rotation.y = Math.PI / 2;
      box(bike, 0.04, 0.04, 0.7, 0, 0.55, 0, [0x2f8a5a, 0xd8232a, 0x2f6fb0][i], { rough: 0.5, metal: 0.4 });
      box(bike, 0.12, 0.2, 0.3, 0.02, 0.55, 0.05, 0x22262b, { rough: 0.5 });
    }
    const climbRack = box(rack, 0.3, 0.1, 0.12, 0.4, 1.3, -0.25, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(rack, "climb the rack?", 0.4, 1.5, -0.2, { css: PMSB_WARN, w: 0.28 });
    reg(hits, climbRack, "ladder-on-bike-rack");
    const strip = group(g, 2.8, 0.4, 0.4, -Math.PI / 2);
    box(strip, 0.3, 0.05, 0.06, 0, 0, 0, 0x22262b, { rough: 0.5 });
    const charger = group(g, 2.45, 0.05, 0.6);
    box(charger, 0.18, 0.08, 0.1, 0, 0.04, 0, 0x2b3138, { rough: 0.5 });
    hose(g, [[2.45, 0.1, 0.6], [2.65, 0.2, 0.5], [2.8, 0.4, 0.4]], 0.006, 0x22262b, { steps: 8 });
    reg(hits, charger, "charger-unplug");
    const chargerTagSpot = group(g, 2.3, 0.05, 0.75);
    box(chargerTagSpot, 0.08, 0.02, 0.12, 0, 0.01, 0, 0xfff2d6, { rough: 0.8 });
    reg(hits, chargerTagSpot, "charger-tag");
    holoTag(g, "charger on the strip", 2.45, 0.32, 0.7, { css: PMSB_CSS, w: 0.32 });
    const venting = group(rack, 0.8, 0.55, 0.05);
    const ventBat = box(venting, 0.12, 0.2, 0.3, 0.02, 0, 0, 0x22262b, { rough: 0.5 });
    const smoke = particles(venting, 24, 0xdfe4e8, { size: 0.07, life: 0.9, additive: false, opacity: 0.5 });
    const swollen = group(g, 0.1, 0, 1.3);
    box(swollen, 0.5, 0.05, 0.35, 0, 0.7, 0, 0x7a6048, { rough: 0.7 });
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) box(swollen, 0.03, 0.7, 0.03, sx * 0.22, 0.35, sz * 0.15, 0x53606b, { rough: 0.5 });
    const swBat = box(swollen, 0.3, 0.12, 0.14, 0, 0.8, 0, 0x22262b, { rough: 0.5 });
    swBat.scale.set(1, 1.3, 1.2);
    holoTag(swollen, "charge the swollen pack?", 0, 1.05, 0, { css: PMSB_WARN, w: 0.42 });
    reg(hits, swollen, "charge-swollen-battery");
    const sandBin = group(g, -0.6, 0, 1.5);
    cyl(sandBin, 0.25, 0.25, 0.5, 0, 0.25, 0, 0x8b929a, { rough: 0.5, metal: 0.5, seg: 14 });
    cyl(sandBin, 0.23, 0.23, 0.02, 0, 0.49, 0, 0xe0cc9a, { rough: 0.95, seg: 14 });
    holoTag(sandBin, "battery sand bin", 0, 0.72, 0, { css: PMSB_CSS, w: 0.3 });

    // ------------------------------------------------------------ exit stair, pull station, extinguisher, compactor chute
    const stair = group(g, -2.7, 0, 0.9, Math.PI / 2);
    for (let i = 0; i < 5; i++) box(stair, 1.0, 0.18, 0.3, 0, 0.09 + i * 0.18, -i * 0.28, 0x8b929a, { rough: 0.6 });
    cyl(stair, 0.025, 0.025, 1.8, 0.5, 1.2, -0.6, 0xf2c14b, { rough: 0.4, seg: 8 }).rotation.x = 0.55;
    decal(stair, 0.34, 0.14, 0, 2.3, 0.3, signFace("EXIT", { bg: "#0d1c14", accent: "#59c97b", scale: 0.55 }), { glow: true, ei: 0.7, px: 128 });
    const railBike = group(stair, 0.5, 0, 0.35);
    for (const bz of [-0.35, 0.35]) torus(railBike, 0.28, 0.02, 0, 0.3, bz, 0x1b1e22, { rough: 0.8, seg: 6, seg2: 18 }).rotation.y = Math.PI / 2;
    box(railBike, 0.04, 0.04, 0.7, 0, 0.55, 0, 0xe8a04a, { rough: 0.5, metal: 0.4 });
    reg(hits, railBike, "bike-on-exit-rail");
    const pull = group(g, -2.9, 1.25, 1.9, Math.PI / 2);
    box(pull, 0.14, 0.2, 0.06, 0, 0, 0, 0xd8232a, { rough: 0.5 });
    const pullLever = box(pull, 0.1, 0.04, 0.04, 0, 0.02, 0.04, 0xf4f4f0, { rough: 0.5 });
    reg(hits, pull, "fire-alarm-pull");
    holoTag(pull, "fire alarm pull", 0, 0.2, 0.04, { css: PMSB_CSS, w: 0.26 });
    const strobe = ball(g, 0.05, -2.9, 2.2, 1.9, 0x3a4450, { rough: 0.4, seg: 10 });
    const strobeOn = mat(0xffffff, { emissive: 0xffffff, ei: 2.0, rough: 0.3 });
    const ext = group(g, -2.9, 0, 1.45);
    cylinderTank(ext, 0, 0, 0xd8232a, { plateLabel: "ABC", plateLines: ["10 LB"], gauge: false }).scale.set(0.8, 0.55, 0.8);
    const extGauge = decal(ext, 0.08, 0.08, 0.02, 0.62, 0.09, signFace("◔", { bg: "#f4f4f0", accent: "#59c97b", fg: "#1b1e22", scale: 0.7 }), { px: 64 });
    reg(hits, extGauge, "extinguisher-gauge");
    holoTag(ext, "extinguisher gauge", 0, 0.82, 0.1, { css: PMSB_CSS, w: 0.3 });
    const chute = group(g, -2.2, 0, -0.6);
    box(chute, 0.6, 0.9, 0.4, 0, 0.45, 0, 0x8b929a, { rough: 0.4, metal: 0.6 });
    const chuteDoor = box(chute, 0.4, 0.3, 0.02, 0, 0.7, 0.21, 0x5a6878, { rough: 0.4, metal: 0.6 });
    holoTag(chute, "tip the fuel down it?", 0, 1.06, 0.22, { css: PMSB_WARN, w: 0.36 });
    reg(hits, chuteDoor, "gas-can-to-compactor");
    decal(chute, 0.3, 0.1, 0, 0.35, 0.21, signFace("COMPACTOR CHUTE", { bg: "#1b1e22", accent: PMSB_CSS, scale: 0.4 }), { px: 192 });

    // ------------------------------------------------------------ notices and log
    const notice = decal(g, 0.28, 0.36, -1.4, 1.5, -1.52, paperFace("STORAGE AUDIT", ["Posted 14 days ahead", "No fuel · no propane", "18 in below heads", "Abandoned: office notice"], { bg: "#f4efe0", band: "#2f5a7a" }), { px: 256 });
    reg(hits, notice, "audit-notice");
    const abandonLog = group(g, 0.5, 0, -1.0);
    box(abandonLog, 0.4, 0.05, 0.3, 0, 0.95, 0, 0x7a6048, { rough: 0.7 });
    cyl(abandonLog, 0.03, 0.03, 0.95, 0, 0.475, 0, 0x53606b, { rough: 0.5, seg: 8 });
    const abFace = decal(abandonLog, 0.22, 0.28, 0, 0.98, 0, paperFace("ABANDONED?", ["Cage · date", "Notice sent by office", "Do not cut locks"], { bg: "#f4efe0", band: "#7a2f2f" }), { px: 160 });
    abFace.rotation.x = -Math.PI / 2;
    reg(hits, abandonLog, "abandoned-property-log");
    holoTag(abandonLog, "abandoned-property sheet", 0, 1.2, 0, { css: PMSB_CSS, w: 0.4 });
    const logBoard = holoPanel(g, 0.56, 0.38, 2.4, 1.8, 1.8, (ctx, w, h) => {
      ctx.fillStyle = "rgba(6,18,22,0.9)"; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = PMSB_CSS; ctx.fillRect(0, 0, w, 5);
      ctx.fillStyle = "#e6f7fb";
      ctx.font = `600 ${Math.round(h * 0.14)}px 'Barlow Condensed', Arial, sans-serif`;
      ctx.textAlign = "center"; ctx.textBaseline = "middle";
      ctx.fillText("BUILDING LOG · BASEMENT", w / 2, h * 0.22);
      ctx.font = `${Math.round(h * 0.085)}px Arial, sans-serif`; ctx.fillStyle = "#c4e6ee";
      ["fuel removed · cages", "clearance · flow alarm time", "lagging sealed · call made", "battery incident"].forEach((l, i) => ctx.fillText(l, w / 2, h * (0.42 + i * 0.14)));
    }, { ry: -0.6, accent: PMSB_ACCENT });
    reg(hits, logBoard, "building-log");

    // ------------------------------------------------------------ crew
    const coworker = standingFigure(g, -0.4, 0.35, { ry: 2.8, cloth: 0x3f5b6e, trousers: 0x2b3138, cap: 0x2f5a7a });
    reg(hits, coworker, "coworker-checkin");
    const neighbour = standingPerson(g, 0.3, -1.25, { ry: Math.PI, cloth: 0x7a6a5a, hiVis: false });
    const cutters = group(neighbour.root, 0.25, 1.0, 0.25);
    box(cutters, 0.04, 0.5, 0.04, 0, 0, 0, 0xd8232a, { rough: 0.5 });
    neighbour.root.visible = false;
    const putDownCutters = group(abandonLog, 0.1, 0.99, 0.05);
    box(putDownCutters, 0.5, 0.03, 0.04, 0, 0, 0, 0xd8232a, { rough: 0.5 });
    putDownCutters.visible = false;

    let testing = false;
    let venting_ = false;

    return {
      hits,
      footprint: 2.5,
      spawnLook: new THREE.Vector3(-0.2, 1.1, -1.2),

      onStepComplete(step) {
        if (step.id === "walk-cages") { gasCan.visible = false; propane.visible = false; }
                if (step.id === "lower-boxes") topBox.position.set(0.35, -0.52, 0.2);
        if (step.id === "measure-clearance") repaint(tape.userData.screen, signFace("OK", { bg: "#0d1c14", accent: "#59c97b", fg: "#e9ffe9", scale: 0.6 }));
        if (step.id === "open-test-valve") { itvHandle.rotation.y = Math.PI / 2; testing = true; testFlow.visible = true; }
        if (step.id === "wait-flow-alarm") bellDome.material = mat(0xff8a7a, { emissive: 0xd8232a, ei: 1.2, rough: 0.4 });
        if (step.id === "audit-chargers") charger.position.set(2.3, 0.05, 0.9);
        if (step.id === "close-test-valve") { itvHandle.rotation.y = 0; testing = false; testFlow.visible = false; }
        if (step.id === "call-abatement") { noTouch.visible = true; tapeLine.visible = true; }
        if (step.id === "read-extinguisher") repaint(extGauge, signFace("✓", { bg: "#f4f4f0", accent: "#59c97b", fg: "#2f8a3c", scale: 0.7 }));
        if (step.id === "walk-overhead") railBike.position.set(0.5, 0, 1.6);
      },

      onInterrupt(it) {
        if (it.id === "bolt-cutter-neighbour") neighbour.root.visible = true;
        if (it.id === "battery-venting") { venting_ = true; smoke.visible = true; ventBat.material = mat(0x8a3a1a, { emissive: 0xf0645b, ei: 0.8, rough: 0.5 }); }
      },
      onInterruptEnd(it) {
        if (it.id === "bolt-cutter-neighbour") {
          if (it.resolved === "answered") { cutters.visible = false; putDownCutters.visible = true; neighbour.root.position.set(0.9, 0, -0.6); }
          else neighbour.root.visible = false;
        }
        if (it.id === "battery-venting") {
          venting_ = false; smoke.visible = false;
          if (it.resolved === "answered") { pullLever.position.y = -0.04; strobe.material = strobeOn; }
        }
      },

      animate(t, dt, session) {
        if (testing) testFlow.userData?.step?.(dt, new THREE.Vector3(0, 0, 0), 0.04, 0.2, -2);
        if (venting_) smoke.userData?.step?.(dt, new THREE.Vector3(0, 0.1, 0), 0.1, 0.4, 0.4);
        coworker.userData.head.rotation.y = Math.sin(t * 0.4) * 0.3;
        const gg = session?.gauge;
        if (gg && !gg.committed) {
          if (session.step?.id === "measure-clearance") repaint(tape.userData.screen, signFace(`${Math.round(gg.t * 36)} in`, { bg: "#0d1c24", accent: gg.t >= 0.5 && gg.t <= 0.8 ? "#59c97b" : "#f2ae14", fg: "#bfeaf7", scale: 0.55 }));
        }
        if (session?.track && session.step?.id === "close-test-valve") rNeedle.rotation.z = 0.9 - session.track.v * 1.8;
      },
    };
  },
};
