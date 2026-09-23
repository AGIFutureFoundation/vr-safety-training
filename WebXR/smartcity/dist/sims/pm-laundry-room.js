import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, ball, torus, hose, group, decal, repaint, signFace, paperFace, particles, mat,
  standingPerson,
} from "../../../shared/kit.js";
import {
  CITY, stationPad, holoPanel, holoTag, instrument, standingFigure, reg,
  surfaceTexture, texturedMat, pavingFace, lockTag,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Laundry Room VR — Building Systems & Facilities, property
// management zone twelve.
//
// The residents' laundry room on the ground floor: four coin-op washers, a
// stacked gas dryer bank, a folding table and the mop sink. A work order says
// washer three will not drain and there is water on the floor. The machine
// locked out before a hand goes near the drum, drained into a bucket rather
// than onto the tiles, the trap cleared, the dryer exhaust checked for the
// back pressure that turns lint into a fire, and the room walked for what
// residents leave behind. Generic building — only the codes, standards and
// unions are named.

const PMLR_ACCENT = 0x6fb8a8;
const PMLR_CSS = "#6fb8a8";
const PMLR_WARN = "#f0645b";

export const SIM_PM_LAUNDRY_ROOM = {
  id: "pm-laundry-room",
  index: "228",
  domain: "Building Systems & Facilities",
  trade: "Building porter and maintenance technician — SEIU building staff with a CAMT-credentialed technician, and IUOE Local 39 engineers for the gas dryers' venting",
  category: "Building Systems & Facilities",
  indoor: "service",
  certification: "OSHA 29 CFR 1910.147 lockout on a coin-op washer before any hand reaches the drum or the drain pump; 29 CFR 1910.212 guarding on the belt side; 29 CFR 1910.1200 hazard communication for the chemicals residents leave behind; 29 CFR 1910.36 exit routes kept clear of carts and baskets; NFPA 54 for gas dryer venting and makeup air and NFPA 72 for the room's smoke detection; SEIU building-staff training, IUOE stationary engineer practice and the apartment association's CAMT credential; the local housing code for the laundry the lease promises",
  name: "Laundry Room",
  title: simTitle("Laundry Room"),
  tagline: "The residents' laundry: washer three locked out and drained into a bucket, the trap cleared, the dryer exhaust read for back pressure, and the room walked for what residents leave behind",
  accent: PMLR_ACCENT,
  accentCss: PMLR_CSS,
  parSeconds: 280,
  footprint: 2.4,
  badge: { id: "dry-floor", name: "Dry Floor", note: "Machine locked out, drained into a bucket, exhaust read, and nothing left on the floor for a resident to slip on" },

  supportLine: "your SEIU steward or member-assistance contact, or your employer's employee assistance program",

  game: system({
    name: "Laundry Room",
    currency: "QUARTERS",
    ranks: ["Porter", "Maintenance Tech", "Lead Tech", "Building Super", "Laundry Room Certified"],
    badges: [
      { id: "locked-first", name: "Locked First", note: "Washer locked out before the drum was touched", test: AWARD.stepClean("lockout-washer") },
      { id: "no-slips", name: "No Slips", note: "No unsafe act anywhere in the room", test: AWARD.safe },
      { id: "breathing-dryer", name: "Breathing Dryer", note: "Exhaust back pressure read inside the band first time", test: AWARD.stepClean("read-exhaust") },
    ],
    challenges: [
      { id: "clean-order", name: "Clean Work Order", note: "No corrections across the whole job", test: AWARD.clean },
      { id: "steady-fill", name: "Steady Fill", note: "Held the test fill without breaking the band", test: AWARD.unbroken },
      { id: "back-in-service", name: "Back In Service", note: "Finished inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "chem-bottle-combine": "You started pouring the abandoned bottles into one jug to clear the shelf. One is chlorine bleach and one is an ammonia glass cleaner — combined they release chloramine gas in a small room with one door, and whoever is folding at the table breathes it before you smell it.",
    "reach-in-drum": "You reached into washer three's drum before it was locked out. The control board still has power, the door lock can release mid-cycle on a fault, and a drum that starts to spin with an arm in it breaks the arm — the lock goes on first, every time.",
    "taped-door-switch": "You pressed the dryer's door switch that somebody has taped down. Taped in, the dryer runs with the door open — a hot, turning drum at hand height in a room residents' children walk through — and the tape comes off and the dryer comes out of service until the switch is replaced.",
    "cord-in-puddle": "You grabbed the resident's extension cord lying in the puddle with a wet hand while standing in the water. The outlet it runs to is not on a ground-fault breaker — the water around your boots is the path — and the cord gets de-energised at the panel before anyone touches it.",
  },

  lateNotes: {
    "pump-trap": "Not yet — the trap is opened only after the drum is drained into the bucket, or the drum empties across the floor through it.",
    "dryer-manometer": "Read the exhaust once the dryer is actually running a heat cycle — a cold dryer has no back pressure to read.",
  },

  steps: [
    {
      id: "read-work-order", kind: "select", target: "work-order-card",
      title: "Read the resident's work order",
      cue: "Read what the resident reported about washer three before you touch it.",
      why: "The resident's own words carry the clues a technician needs: that washer three stopped mid-cycle with water still in the drum, that it made a grinding noise first, that there was a sock missing. A work order read properly turns a guess about the pump into a diagnosis, and it tells you the drum is full before you open the door on it.",
    },
    {
      id: "walk-room", kind: "find", noHint: true,
      targets: ["crushed-transition-duct", "unlabeled-bottle"],
      itemNames: { "crushed-transition-duct": "crushed foil duct behind dryer 2", "unlabeled-bottle": "unlabeled spray bottle on the folding table" },
      itemNotes: {
        "crushed-transition-duct": "The flexible foil transition behind dryer two has been pushed flat against the wall. A crushed duct chokes the exhaust, lint piles up in the kink, and the dryer runs hotter every cycle until the lint is the fuel.",
        "unlabeled-bottle": "A spray bottle with no label and a faint chlorine smell. Nobody can tell what it is, what it reacts with or what to do if it gets in an eye — it goes to the chemical shelf's disposal bin, labelled as unknown.",
      },
      title: "Walk the room before you start",
      cue: "Find what residents or the last shift left that makes this room dangerous.",
      why: "A laundry room is a shared space with gas appliances, electrical machines and water on the floor, and it is used by everyone in the building from toddlers to people in their nineties. The walk before the repair is where the technician finds the thing that will hurt somebody this afternoon, which is rarely the machine on the work order.",
    },
    {
      id: "lockout-washer", kind: "sequence",
      targets: ["washer-breaker", "washer-lock-hasp", "washer-start-tryout"],
      itemNames: { "washer-breaker": "washer three's breaker off", "washer-lock-hasp": "your lock and tag on the breaker", "washer-start-tryout": "start pressed to prove it dead" },
      title: "Lock out washer three",
      cue: "Breaker off, your lock and tag on it, then press start to prove the machine is dead.",
      why: "The lockout standard exists because a machine that is merely switched off can be switched back on — by a resident feeding coins into it, by a coworker who sees it off, by a control board that resets. Your lock on the breaker is what makes the machine yours alone, and pressing start afterwards is the test that proves you locked the right breaker.",
      outOfOrderNote: "Breaker, lock, then try it — pressing start before the lock is on proves nothing, and a lock on the wrong breaker is only found by the tryout.",
    },
    {
      id: "close-supply", kind: "turn", target: "supply-valve",
      title: "Close the washer's hot and cold supply",
      cue: "Turn the supply valve behind washer three closed.",
      why: "A washer's inlet valves are solenoids, and a solenoid that sticks open with the pump out keeps filling the drum until it overflows across the floor. Closing the supply at the wall takes the building's water pressure out of the machine completely, so the only water left to deal with is what is already in the drum.",
      turn: { turns: 0.75, axis: "z", label: "SUPPLY VALVE" },
    },
    {
      id: "drain-drum", kind: "hold", target: "drain-hose", seconds: 5,
      title: "Drain the drum through the emergency hose",
      cue: "Hold the emergency drain hose low in the bucket until the drum stops running.",
      why: "The drum still holds most of a wash of soapy water, and opening the door or the pump trap first puts all of it on the floor at once — a slip for the next resident and water under the dryers' gas connections. Draining it slowly into a bucket, hose held low, is what keeps the floor dry and lets you see whether anything came out with the water.",
      holdBreakNote: "You lifted the hose before the drum was empty. Water stops running into the bucket and starts running back across the floor — hold it low until it stops.",
    },
    {
      id: "empty-bucket", kind: "drag", target: "drain-bucket",
      title: "Carry the bucket to the mop sink",
      cue: "Carry the full drain bucket to the mop sink and empty it there.",
      why: "Wash water holds detergent, bleach and whatever residents have laundered, and it belongs down the sanitary drain in the mop sink, not the floor drain that may run to a storm line or the courtyard. A full bucket carried at your side with a clear path to the sink is also the bucket that does not get kicked over by the next person through the door.",
      drag: { to: "mop-sink-slot", radius: 0.5, missNote: "Not at the mop sink — a bucket of wash water left on the floor is the next spill waiting for a resident's foot." },
    },
    {
      id: "clear-trap", kind: "select", target: "pump-trap",
      title: "Clear the drain pump trap",
      cue: "Open the pump trap and pull out what stopped the drain.",
      why: "A washer that will not drain almost always has something in the pump trap — a sock, a hair tie, coins — and the pump grinding against it was the noise in the work order. Clearing the trap fixes the drain; leaving it and replacing the pump puts a new pump against the same sock next week.",
    },
    {
      id: "read-exhaust", kind: "gauge", target: "dryer-manometer",
      title: "Read the dryer bank's exhaust back pressure",
      cue: "With a dryer running on heat, read the manometer on the exhaust and commit inside the band.",
      why: "Every gas dryer is rated for a maximum back pressure in its exhaust, and above it the dryer cannot move enough air: lint settles in the duct, the burner runs hotter and the high-limit trips until one day it doesn't. NFPA 54 is why the duct runs where it does and how long it may be; the manometer is how you know it still works.",
      gauge: { label: "EXHAUST BACK PRESSURE", speed: 0.6, green: [0.12, 0.34], readout: (t) => `${t.toFixed(2)} in. w.c.`, missNote: "Outside the dryer's rated band — too high is a choked duct, zero means the manometer is not on the exhaust. Read it again." },
    },
    {
      id: "test-fill", kind: "track", target: "fill-level", seconds: 7,
      title: "Run a test fill and watch the level",
      cue: "Restore water and run a test fill, keeping the level below the overflow as it drains.",
      why: "A repaired washer is not repaired until it has filled and drained on its own while somebody watched. The level has to climb to the fill line and then fall away through the cleared trap — if it hangs, the blockage is further down the drain line; if it overshoots, the inlet valve is sticking, and both show up in the first cycle, not after the resident has loaded it.",
      track: { start: 0.2, green: [0.38, 0.62], rise: 0.42, fall: 0.36, drift: 0.1, label: "FILL LEVEL", readout: (v) => (v < 0.38 ? "not filling" : v > 0.62 ? "near overflow" : "filling · draining") },
      holdBreakNote: "The level left the band. Near overflow is the inlet valve sticking; not filling is the supply still closed — bring it back into the band.",
    },
    {
      id: "walk-dryers", kind: "find", noHint: true,
      targets: ["lint-screen-full", "makeup-louver-blocked"],
      itemNames: { "lint-screen-full": "lint screen packed on dryer 4", "makeup-louver-blocked": "makeup-air louver blocked by boxes" },
      itemNotes: {
        "lint-screen-full": "Dryer four's lint screen is a solid felt mat. Residents rarely clear it, and a full screen is the first choke point in the whole exhaust path.",
        "makeup-louver-blocked": "Somebody stacked flattened boxes against the louvre in the door. Gas dryers pull their combustion and exhaust air from the room, and with the louvre blocked they pull it back down the flues instead.",
      },
      title: "Walk the dryer bank",
      cue: "Find what is starving the dryers of air.",
      why: "Six dryers running together pull a surprising volume of air out of a small room, and it has to come back in somewhere. A blocked makeup-air louvre and a packed lint screen are the two everyday findings that turn a dryer bank into a fire or a carbon monoxide problem, and neither shows on the machine's own display.",
    },
    {
      id: "return-washer", kind: "sequence",
      targets: ["washer-clear-walk", "washer-unlock"],
      itemNames: { "washer-clear-walk": "walk the machine: panels on, tools out", "washer-unlock": "your lock off, breaker on" },
      title: "Return washer three to service",
      cue: "Walk the machine for panels and tools, then take your own lock off and restore the breaker.",
      why: "The last minute of a lockout is where a panel left off the belt side or a screwdriver in the drum becomes a resident's injury, because the next person to use the machine assumes it is exactly as the manufacturer built it. Your lock comes off only after you have walked it, and only you take it off.",
      outOfOrderNote: "Walk the machine first, then your lock — restoring power to a washer with a guard off is exactly what the walk-round exists to catch.",
    },
    {
      id: "crew-checkin", kind: "select", target: "coworker-checkin",
      title: "Check in with the porter on the next shift",
      cue: "Hand over the crushed duct and the blocked louvre, and ask how the week has gone.",
      why: "The porter who cleans this room every morning is the one who will notice the louvre blocked again or the duct pushed back, and a finding handed over in person gets acted on in a way a note on a clipboard does not. The same minute is the moment to ask a coworker how they are actually doing — building staff spend long stretches working alone.",
    },
    {
      id: "building-log", kind: "select", target: "building-log",
      title: "Close the work order in the building log",
      cue: "Log the cause, the trap cleared, the exhaust reading and the findings passed to the porter.",
      why: "The building log is where a pattern becomes visible: the third sock in washer three this month, the exhaust reading creeping up since spring, the louvre blocked every Monday. It is also the record the resident's work order is closed against, so the resident who reported it can see it was fixed and why.",
    },
  ],

  interrupts: [
    {
      id: "resident-reaches",
      kind: "Resident reaching for the locked-out washer",
      after: "drain-drum", delay: 3, seconds: 12,
      alert: "While you hold the drain hose, a resident comes in, sees her clothes in washer three and reaches to pull the door open.",
      cue: "Hang the out-of-order placard on the washer door and tell her you'll hand her clothes out once it's drained. Keep the hose low.",
      target: "out-of-order-sign",
      why: "The drum is half full and the door lock is the only thing holding a wash of soapy water inside; pulled open now, it lands across her feet and the floor. A placard on the door answers the question every resident who walks in next will ask, and handing her clothes out yourself is what keeps her away from the machine you have locked.",
      missNote: "She kept pulling at the door while you held the hose. Nobody told her the machine was locked out, and the next resident through the door will try the same thing.",
      wrongNote: "That doesn't answer her. The out-of-order placard on the washer door is what tells her — and everyone after her — that this machine is off-limits.",
    },
    {
      id: "dryer-smoulder",
      kind: "Dryer four scorching",
      after: "test-fill", delay: 3, seconds: 12,
      alert: "A scorched smell and a thread of smoke from dryer four's lint door — its high-limit has not tripped and the drum is still turning.",
      cue: "Close dryer four's gas shutoff and stop the machine. Don't open the drum door on a smouldering load.",
      target: "dryer-gas-shutoff",
      why: "Lint smoulders slowly until it gets air, and opening the drum door feeds a smouldering load exactly the oxygen it needs to flame. Closing the gas shutoff takes the burner out of the equation, and a stopped, closed dryer starves the smoulder while the fire department is called if it keeps going.",
      missNote: "The dryer kept heating a smouldering load the whole window. That is how a laundry-room fire starts — not with a flame but with a burner that nobody shut off.",
      wrongNote: "That doesn't take the heat away. The gas shutoff behind dryer four is what stops the burner feeding the smoulder.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root, 0, 0, -0.4);
    stationPad(g, 2.4, PMLR_ACCENT);

    // ------------------------------------------------------------ tile floor
    const floorTex = surfaceTexture((cx, w, h) => pavingFace(cx, w, h, { tiles: 8, base: "#c9ccc4", base2: "#bfc2b9", seam: "rgba(60,70,70,0.3)" }), { repeat: 5, px: 384 });
    const floor = box(g, 6.0, 0.02, 4.6, 0, 0.011, -0.3, 0xc9ccc4, { rough: 0.7 });
    floor.material = texturedMat(floorTex, { rough: 0.6, metal: 0.05, color: 0xd4d6ce });
    const puddle = cyl(g, 0.7, 0.7, 0.004, -0.3, 0.024, -0.6, 0x7fa6b8, { rough: 0.05, metal: 0.2, opacity: 0.55, transparent: true, seg: 22 });
    puddle.scale.set(1.3, 1, 0.7);

    // ------------------------------------------------------------ washer row
    const washers = [];
    for (let i = 0; i < 4; i++) {
      const w = group(g, -2.3 + i * 0.78, 0, -1.9);
      box(w, 0.7, 0.95, 0.7, 0, 0.475, 0, 0xe8ebee, { rough: 0.35, metal: 0.3 });
      torus(w, 0.22, 0.035, 0, 0.52, 0.36, 0x9aa2a8, { rough: 0.4, metal: 0.6, seg: 8, seg2: 22 });
      cyl(w, 0.19, 0.19, 0.02, 0, 0.52, 0.36, 0x2b3138, { rough: 0.15, opacity: 0.6, transparent: true, seg: 20 }).rotation.x = Math.PI / 2;
      box(w, 0.7, 0.14, 0.12, 0, 0.88, -0.28, 0xcfd4d8, { rough: 0.4 });
      box(w, 0.1, 0.04, 0.02, 0.2, 0.9, -0.21, 0x22262b, { rough: 0.4 });
      decal(w, 0.1, 0.06, -0.2, 0.9, -0.215, signFace(`${i + 1}`, { bg: "#1b1e22", accent: PMLR_CSS, scale: 0.6 }), { px: 64 });
      washers.push(w);
    }
    const w3 = washers[2];
    const w3Door = cyl(w3, 0.2, 0.2, 0.03, 0, 0.52, 0.38, 0x3a4450, { rough: 0.2, opacity: 0.75, transparent: true, seg: 20 });
    w3Door.rotation.x = Math.PI / 2;
    const soapWater = cyl(w3, 0.18, 0.18, 0.02, 0, 0.47, 0.37, 0xcfe6f2, { rough: 0.1, opacity: 0.8, transparent: true, seg: 18 });
    soapWater.rotation.x = Math.PI / 2;
    holoTag(w3, "washer 3 · won't drain", 0, 1.1, 0.2, { css: PMLR_CSS, w: 0.4 });
    const startBtn = cyl(w3, 0.025, 0.025, 0.02, 0.2, 0.84, -0.22, 0x59c97b, { rough: 0.4, seg: 12 });
    startBtn.rotation.x = Math.PI / 2;
    reg(hits, startBtn, "washer-start-tryout");
    const drumReach = box(w3, 0.36, 0.36, 0.04, 0, 0.52, 0.42, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(w3, "reach in now?", 0, 0.28, 0.42, { css: PMLR_WARN, w: 0.28 });
    reg(hits, drumReach, "reach-in-drum");
    const oooSign = decal(w3, 0.22, 0.16, 0, 0.78, 0.37, paperFace("OUT OF ORDER", ["Locked out", "Staff only"], { bg: "#fff7d6", band: "#b8402f" }), { px: 192 });
    oooSign.visible = false;
    // The placard itself, hanging on a hook on the washer row's end panel
    // until it is needed.
    const placardHook = group(g, -2.72, 1.05, -1.52);
    box(placardHook, 0.03, 0.03, 0.06, 0, 0.12, 0, 0x8b929a, { rough: 0.4, metal: 0.7 });
    const placard = decal(placardHook, 0.2, 0.14, 0, 0, 0.04, paperFace("OUT OF ORDER", ["Staff only"], { bg: "#fff7d6", band: "#b8402f" }), { px: 160 });
    reg(hits, placardHook, "out-of-order-sign");
    holoTag(placardHook, "out-of-order placard", 0, 0.2, 0.04, { css: PMLR_CSS, w: 0.34 });
    // Pump trap panel at the bottom front, and the emergency drain hose.
    const trap = group(w3, 0.22, 0.12, 0.36);
    box(trap, 0.14, 0.12, 0.02, 0, 0, 0, 0xcfd4d8, { rough: 0.4 });
    cyl(trap, 0.035, 0.035, 0.03, 0, 0, 0.02, 0x3a4450, { rough: 0.5, seg: 12 }).rotation.x = Math.PI / 2;
    reg(hits, trap, "pump-trap");
    const sock = box(w3, 0.1, 0.03, 0.05, 0.35, 0.05, 0.5, 0x3f5b8e, { rough: 0.9 });
    sock.visible = false;
    const drainHose = hose(g, [[-0.58, 0.14, -1.53], [-0.45, 0.1, -1.2], [-0.3, 0.3, -1.05]], 0.018, 0x2b3138, { steps: 12 });
    reg(hits, drainHose, "drain-hose");
    const bucket = group(g, -0.3, 0, -1.0);
    cyl(bucket, 0.15, 0.13, 0.3, 0, 0.15, 0, 0xf2c14b, { rough: 0.5, seg: 14 });
    const bucketWater = cyl(bucket, 0.13, 0.13, 0.02, 0, 0.26, 0, 0xbad8e6, { rough: 0.1, opacity: 0.8, transparent: true, seg: 14 });
    reg(hits, bucket, "drain-bucket");
    // Supply valves on the wall behind washer three.
    const supply = group(g, -0.74, 1.12, -2.28);
    box(supply, 0.3, 0.2, 0.06, 0, 0, 0, 0xdfe4e8, { rough: 0.5 });
    const supplyHandle = group(supply, 0.06, 0, 0.05);
    box(supplyHandle, 0.12, 0.025, 0.02, 0, 0, 0, 0xd8232a, { rough: 0.5 });
    box(supply, 0.025, 0.025, 0.1, -0.08, 0, 0.05, 0x2f6fb0, { rough: 0.5 });
    reg(hits, supplyHandle, "supply-valve");
    holoTag(supply, "washer 3 supply", 0, 0.18, 0.04, { css: PMLR_CSS, w: 0.3 });
    hose(g, [[-0.8, 1.05, -2.25], [-0.75, 0.95, -2.2], [-0.72, 0.92, -2.08]], 0.012, 0x9aa2a8, { steps: 8 });

    // Electrical panel with washer three's breaker.
    const epanel = group(g, 0.9, 0, -2.25);
    box(epanel, 0.5, 0.7, 0.12, 0, 1.35, 0, 0x7a838c, { rough: 0.5, metal: 0.4 });
    for (let r = 0; r < 4; r++) box(epanel, 0.08, 0.04, 0.02, -0.1, 1.55 - r * 0.12, 0.07, 0x22262b, { rough: 0.5 });
    const breaker = box(epanel, 0.08, 0.04, 0.03, 0.1, 1.43, 0.07, 0x2b3138, { rough: 0.5 });
    reg(hits, breaker, "washer-breaker");
    const hasp = torus(epanel, 0.02, 0.006, 0.1, 1.33, 0.08, CITY.steel, { rough: 0.3, metal: 0.9 });
    reg(hits, hasp, "washer-lock-hasp");
    const appliedLock = lockTag(epanel, 0.1, 1.33, 0.1);
    appliedLock.visible = false;
    holoTag(epanel, "laundry panel · W3", 0, 1.8, 0.07, { css: PMLR_CSS, w: 0.32 });
    const unlockMark = box(epanel, 0.12, 0.1, 0.02, 0.1, 1.2, 0.08, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, unlockMark, "washer-unlock");
    const walkMark = box(w3, 0.7, 0.2, 0.02, 0, 0.95, 0.37, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, walkMark, "washer-clear-walk");

    // Fill-level window on the washer's panel for the track.
    const fillScreen = decal(w3, 0.16, 0.07, -0.05, 0.88, -0.21, signFace("LEVEL --", { bg: "#0d1c24", accent: PMLR_CSS, fg: "#bfeaf7", scale: 0.45 }), { glow: true, ei: 0.8, px: 160 });
    reg(hits, fillScreen, "fill-level");

    // ------------------------------------------------------------ dryer bank (stacked)
    const dryers = group(g, 2.3, 0, -1.6, -0.6);
    for (let c = 0; c < 2; c++) for (let r = 0; r < 2; r++) {
      const x = -0.4 + c * 0.8, y = 0.5 + r * 0.9;
      box(dryers, 0.76, 0.86, 0.8, x, y, 0, 0xdfe2e5, { rough: 0.35, metal: 0.3 });
      torus(dryers, 0.24, 0.03, x, y, 0.41, 0x9aa2a8, { rough: 0.4, metal: 0.6, seg: 8, seg2: 20 });
    }
    decal(dryers, 0.1, 0.06, -0.4, 0.98, 0.41, signFace("2", { bg: "#1b1e22", accent: PMLR_CSS, scale: 0.6 }), { px: 64 });
    decal(dryers, 0.1, 0.06, 0.4, 1.88, 0.41, signFace("4", { bg: "#1b1e22", accent: PMLR_CSS, scale: 0.6 }), { px: 64 });
    const lintScreen = box(dryers, 0.4, 0.05, 0.03, 0.4, 1.58, 0.41, 0x9a8a6a, { rough: 0.9 });
    reg(hits, lintScreen, "lint-screen-full");
    const d4Light = ball(dryers, 0.025, 0.25, 1.82, 0.41, 0x59c97b, { emissive: 0x59c97b, ei: 1.0, rough: 0.4, seg: 10 });
    const d4Hot = mat(0xf0645b, { emissive: 0xf0645b, ei: 1.8, rough: 0.4 });
    const d4Ok = d4Light.material;
    const d4Smoke = particles(dryers, 18, 0x9aa0a6, { size: 0.05, life: 0.9, additive: false, opacity: 0.45 });
    // Gas shutoff behind the bank, reachable at the side.
    const gasCock = group(dryers, 0.9, 1.1, -0.2);
    cyl(gasCock, 0.02, 0.02, 0.3, 0, 0, 0, 0xf2c14b, { rough: 0.4, metal: 0.6, seg: 8 });
    const gasHandle = box(gasCock, 0.1, 0.022, 0.022, 0.04, 0.02, 0, 0xd8232a, { rough: 0.5 });
    reg(hits, gasCock, "dryer-gas-shutoff");
    holoTag(gasCock, "dryer 4 gas", 0.05, 0.22, 0.02, { css: PMLR_CSS, w: 0.24 });
    const tapedSwitch = box(dryers, 0.06, 0.03, 0.02, -0.72, 1.3, 0.41, 0xc9b27a, { rough: 0.8 });
    holoTag(dryers, "door switch taped?", -0.55, 1.18, 0.42, { css: PMLR_WARN, w: 0.34 });
    reg(hits, tapedSwitch, "taped-door-switch");
    // Exhaust ducts up to the ceiling, the crushed foil transition and the manometer.
    for (const x of [-0.4, 0.4]) cyl(dryers, 0.1, 0.1, 1.0, x, 2.4, -0.3, 0xb9c0c6, { rough: 0.4, metal: 0.6, seg: 14 });
    const crushedDuct = cyl(dryers, 0.1, 0.1, 0.3, -0.4, 0.55, -0.5, 0xd7d0c0, { rough: 0.5, metal: 0.5, seg: 12 });
    crushedDuct.scale.set(1, 1, 0.35);
    crushedDuct.rotation.x = Math.PI / 2;
    reg(hits, crushedDuct, "crushed-transition-duct");
    const mano = instrument(dryers, -0.4, 2.1, 0.0, { idle: "-.-- in", color: 0xf2c14b, w: 0.14, d: 0.2, ry: 0 });
    mano.rotation.x = Math.PI / 2.4;
    reg(hits, mano, "dryer-manometer");
    hose(dryers, [[-0.4, 2.12, -0.05], [-0.4, 2.3, -0.2]], 0.006, 0x2f6fb0, { steps: 6 });

    // Makeup-air louvre in the door, blocked by boxes.
    const door = group(g, 2.8, 0, 0.5, -Math.PI / 2);
    box(door, 0.95, 2.1, 0.05, 0, 1.05, 0, 0x8b6d4a, { rough: 0.7 });
    for (let i = 0; i < 5; i++) box(door, 0.5, 0.02, 0.04, 0, 0.3 + i * 0.06, 0.03, 0x5a4a3a, { rough: 0.7 });
    const boxes = group(door, 0, 0, 0.2);
    box(boxes, 0.6, 0.5, 0.06, 0, 0.3, 0, 0xb8905a, { rough: 0.9 });
    box(boxes, 0.55, 0.45, 0.05, 0.05, 0.28, 0.07, 0xa9804e, { rough: 0.9 });
    reg(hits, boxes, "makeup-louver-blocked");
    decal(door, 0.3, 0.12, 0, 1.8, 0.03, signFace("EXIT", { bg: "#0d1c14", accent: "#59c97b", scale: 0.55 }), { glow: true, ei: 0.7, px: 128 });

    // ------------------------------------------------------------ folding table, chemical shelf, mop sink
    const table = group(g, 0.6, 0, 0.7);
    box(table, 1.4, 0.05, 0.7, 0, 0.86, 0, 0xe6dccb, { rough: 0.6 });
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) box(table, 0.04, 0.86, 0.04, sx * 0.65, 0.43, sz * 0.3, 0x8b929a, { rough: 0.4, metal: 0.6 });
    const bottle = group(table, -0.4, 0.89, 0.1);
    cyl(bottle, 0.04, 0.04, 0.2, 0, 0.1, 0, 0xeef3f6, { rough: 0.3, opacity: 0.8, transparent: true, seg: 10 });
    box(bottle, 0.03, 0.05, 0.08, 0, 0.23, 0.02, 0x3a4450, { rough: 0.5 });
    reg(hits, bottle, "unlabeled-bottle");
    for (let i = 0; i < 3; i++) box(table, 0.3, 0.05, 0.25, 0.1 + i * 0.05, 0.91 + i * 0.05, -0.05, [0xf4f0e6, 0x9ab0c8, 0xe8b8b0][i], { rough: 0.85 });
    const basket = group(table, 0.45, 0.89, 0.05);
    box(basket, 0.4, 0.22, 0.3, 0, 0.11, 0, 0x6fa8dc, { rough: 0.6, opacity: 0.9, transparent: true });

    const shelf = group(g, -2.6, 0, 0.3, Math.PI / 2);
    box(shelf, 0.9, 0.04, 0.3, 0, 1.2, 0, 0x8b929a, { rough: 0.5, metal: 0.4 });
    for (const sx of [-1, 1]) box(shelf, 0.03, 0.5, 0.3, sx * 0.44, 1.0, 0, 0x8b929a, { rough: 0.5, metal: 0.4 });
    const bleach = cyl(shelf, 0.07, 0.07, 0.26, -0.2, 1.35, 0, 0xf4f6f8, { rough: 0.4, seg: 12 });
    decal(bleach, 0.1, 0.06, 0, 0.02, 0.072, signFace("BLEACH", { bg: "#1b1e22", accent: "#7fb3c9", scale: 0.45 }), { px: 96 });
    const ammonia = cyl(shelf, 0.05, 0.05, 0.28, 0.05, 1.36, 0, 0x6fb8e8, { rough: 0.3, opacity: 0.85, transparent: true, seg: 12 });
    decal(ammonia, 0.08, 0.05, 0, 0.02, 0.052, signFace("AMMONIA", { bg: "#1b1e22", accent: "#6fb8e8", scale: 0.4 }), { px: 96 });
    const combineJug = box(shelf, 0.18, 0.24, 0.14, 0.3, 1.34, 0, 0xdfe4e8, { rough: 0.5 });
    holoTag(shelf, "pour into one jug?", 0.1, 1.62, 0.02, { css: PMLR_WARN, w: 0.34 });
    reg(hits, combineJug, "chem-bottle-combine");

    const sink = group(g, -2.55, 0, -0.85, Math.PI / 2);
    box(sink, 0.7, 0.35, 0.6, 0, 0.175, 0, 0xdfe4e8, { rough: 0.4 });
    cyl(sink, 0.02, 0.02, 0.5, 0, 0.85, -0.25, 0xb87333, { rough: 0.4, metal: 0.8, seg: 8 });
    const sinkSlot = box(sink, 0.5, 0.05, 0.4, 0, 0.38, 0, 0xffffff, { opacity: 0.001, transparent: true, cast: false });
    hits["mop-sink-slot"] = sinkSlot;
    holoTag(sink, "mop sink · sanitary", 0, 0.62, 0.1, { css: PMLR_CSS, w: 0.34 });

    // The resident's extension cord in the puddle, running to a wall outlet.
    const cord = hose(g, [[-0.9, 0.03, -0.55], [-0.4, 0.03, -0.75], [0.1, 0.03, -0.5], [0.4, 0.3, -2.2]], 0.01, 0xf2f2ea, { steps: 16 });
    const cordGrab = box(g, 0.2, 0.08, 0.2, -0.4, 0.06, -0.72, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "unplug it by hand?", -0.4, 0.28, -0.6, { css: PMLR_WARN, w: 0.34 });
    reg(hits, cordGrab, "cord-in-puddle");
    void cord;

    // ------------------------------------------------------------ work order, log
    const workOrder = decal(g, 0.24, 0.3, -1.3, 1.5, -2.26, paperFace("WORK ORDER", ["Unit 4C · Washer 3", "Won't drain, water", "Grinding noise first", "Missing a sock"], { bg: "#f4efe0", band: "#2f5a7a" }), { px: 256 });
    reg(hits, workOrder, "work-order-card");
    const logBoard = holoPanel(g, 0.56, 0.38, -2.2, 1.6, 1.2, (ctx, w, h) => {
      ctx.fillStyle = "rgba(6,18,16,0.9)"; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = PMLR_CSS; ctx.fillRect(0, 0, w, 5);
      ctx.fillStyle = "#e6f6f1";
      ctx.font = `600 ${Math.round(h * 0.14)}px 'Barlow Condensed', Arial, sans-serif`;
      ctx.textAlign = "center"; ctx.textBaseline = "middle";
      ctx.fillText("BUILDING LOG · LAUNDRY", w / 2, h * 0.22);
      ctx.font = `${Math.round(h * 0.085)}px Arial, sans-serif`; ctx.fillStyle = "#c4e6dc";
      ["W3 · cause · trap cleared", "exhaust back pressure", "duct · louvre findings", "handed to porter"].forEach((l, i) => ctx.fillText(l, w / 2, h * (0.42 + i * 0.14)));
    }, { ry: 0.7, accent: PMLR_ACCENT });
    reg(hits, logBoard, "building-log");
    decal(g, 0.4, 0.3, 1.8, 1.55, -2.27, paperFace("LAUNDRY RULES", ["7 am – 10 pm", "Clear the lint screen", "No dyes · no solvents", "Report leaks: office"], { bg: "#eef4f8", band: "#2f5a7a" }), { px: 256 });
    // Ceiling smoke detector over the dryers.
    cyl(g, 0.07, 0.07, 0.03, 2.0, 2.9, -1.2, 0xf0f2f4, { rough: 0.5, seg: 16 });

    // ------------------------------------------------------------ crew
    const coworker = standingFigure(g, 1.55, 0.05, { ry: -2.4, cloth: 0x3f5b6e, trousers: 0x2b3138, cap: 0x2f5a7a });
    reg(hits, coworker, "coworker-checkin");
    // The resident who filed the order, waiting by the table.
    const residentFigure = standingFigure(g, -1.9, 1.75, { ry: 2.4, cloth: 0x8a5a7a, trousers: 0x3a3a48 });
    void residentFigure;
    // The resident who reaches for washer three during the interruption.
    const reacher = standingPerson(g, -0.55, -1.45, { ry: Math.PI, cloth: 0xb87a4a, hiVis: false });
    reacher.root.visible = false;

    let smouldering = false;

    return {
      hits,
      footprint: 2.4,
      spawnLook: new THREE.Vector3(0, 1.0, -1.4),

      onStepComplete(step) {
        if (step.id === "walk-room") { bottle.visible = false; crushedDuct.scale.set(1, 1, 1); }
        if (step.id === "lockout-washer") appliedLock.visible = true;
        if (step.id === "close-supply") supplyHandle.rotation.z = Math.PI / 2;
        if (step.id === "drain-drum") soapWater.visible = false;
        if (step.id === "empty-bucket") bucketWater.visible = false;
        if (step.id === "clear-trap") sock.visible = true;
        if (step.id === "read-exhaust") repaint(mano.userData.screen, signFace("OK", { bg: "#0d1c14", accent: "#59c97b", fg: "#e9ffe9", scale: 0.6 }));
        if (step.id === "test-fill") repaint(fillScreen, signFace("DRAINED", { bg: "#0d1c14", accent: "#59c97b", fg: "#e9ffe9", scale: 0.45 }));
        if (step.id === "walk-dryers") { lintScreen.material = mat(0xdfe4e8, { rough: 0.4, metal: 0.3 }); boxes.visible = false; }
        if (step.id === "return-washer") { appliedLock.visible = false; oooSign.visible = false; puddle.visible = false; }
      },

      onInterrupt(it) {
        if (it.id === "resident-reaches") { reacher.root.visible = true; reacher.arms[1].shoulder.rotation.x = -1.1; }
        if (it.id === "dryer-smoulder") { smouldering = true; d4Smoke.visible = true; d4Light.material = d4Hot; }
      },
      onInterruptEnd(it) {
        if (it.id === "resident-reaches") {
          reacher.arms[1].shoulder.rotation.x = 0;
          if (it.resolved === "answered") { oooSign.visible = true; placard.visible = false; reacher.root.position.set(-0.9, 0, -0.2); }
        }
        if (it.id === "dryer-smoulder") {
          smouldering = false; d4Smoke.visible = false;
          if (it.resolved === "answered") { gasHandle.rotation.y = Math.PI / 2; d4Light.material = mat(0x3a4450, { rough: 0.4 }); }
          else d4Light.material = d4Ok;
        }
      },

      animate(t, dt, session) {
        if (smouldering) d4Smoke.userData?.step?.(dt, new THREE.Vector3(0.4, 1.62, 0.45), 0.12, 0.25, 0.3);
        coworker.userData.head.rotation.y = Math.sin(t * 0.45) * 0.3;
        const gg = session?.gauge;
        if (gg && !gg.committed && session.step?.id === "read-exhaust") {
          repaint(mano.userData.screen, signFace(`${gg.t.toFixed(2)} in`, { bg: "#0d1c24", accent: gg.t >= 0.12 && gg.t <= 0.34 ? "#59c97b" : "#f2ae14", fg: "#bfeaf7", scale: 0.55 }));
        }
        if (session?.track && session.step?.id === "test-fill" && Math.floor(t * 4) !== Math.floor((t - dt) * 4)) {
          const v = session.track.v;
          repaint(fillScreen, signFace(`LEVEL ${Math.round(v * 100)}%`, { bg: "#0d1c24", accent: v >= 0.38 && v <= 0.62 ? "#59c97b" : "#f0645b", fg: "#bfeaf7", scale: 0.42 }));
        }
      },
    };
  },
};
