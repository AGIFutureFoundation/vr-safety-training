import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import { box, cyl, ball, torus, group, decal, repaint, signFace, paperFace, mat } from "../../../shared/kit.js";
import {
  CITY, stationPad, holoTag, standingFigure, reg,
  surfaceTexture, texturedMat, pavingFace,
} from "../citykit.js";
import { dumpTruck } from "../../../shared/equipment.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Street Drain Trash Capture Cleanout VR — Bay Program projects
// (console BAYKEEPER, docs/consoles/BAYKEEPER.md).
//
// A large trash capture device in a storm drain vault under a street — the
// kind that holds back the trash a whole catchment's gutters carry, so it
// never reaches a creek or the Bay. It is serviced from the surface: the
// vault is a permit-required confined space and nobody enters it on this
// job. The learner is the LIUNA laborer crew lead of a stormwater maintenance
// crew; the vacuum truck's operator runs the boom. The job: the work order
// read, the lane closed with an advance sign and a taper, the cover lifted
// while a car noses into the taper, the air read at the opening, the vault
// looked over from above, the boom guided down while the meter alarms, the
// truck locked out to clear a clog, the clamp freed, the screen rinsed, the
// catch estimated, logged and the crew checked in. Nothing here is a real
// street or device, and no permit or gas threshold is stated as a number.

const BKTD_ACCENT = 0x3fa0c8;

/** A heavy cast-iron cover with a raised grid. */
function bktdCoverFace(g, w, h) {
  g.fillStyle = "#3a3c3e"; g.fillRect(0, 0, w, h);
  g.strokeStyle = "#585b5e"; g.lineWidth = 5;
  for (let i = 8; i < w; i += 22) { g.beginPath(); g.moveTo(i, 0); g.lineTo(i, h); g.stroke(); g.beginPath(); g.moveTo(0, i); g.lineTo(w, i); g.stroke(); }
  g.fillStyle = "#c8ccd0"; g.font = "bold 22px sans-serif"; g.textAlign = "center"; g.fillText("STORM", w / 2, h / 2 - 4); g.fillText("DRAIN", w / 2, h / 2 + 22);
}

export const SIM_BK_STREET_DRAIN_TRASH_CAPTURE_CLEANOUT = {
  id: "bk-street-drain-trash-capture-cleanout",
  index: "BK-2",
  domain: "Environmental",
  trade: "LIUNA laborer crew lead on a stormwater maintenance crew, servicing a street trash capture vault from the surface with the vacuum truck's operator",
  category: "Environmental Monitoring",
  district: "Environmental Monitoring",
  weather: "overcast",
  certification: "LIUNA Training and Education Fund construction craft laborer and confined space awareness training for the crew; OSHA 29 CFR 1910.146 permit-required confined spaces (this service is non-entry, worked from the surface); 29 CFR 1910.147 control of hazardous energy for the vacuum truck's power take-off before any hand clears the boom; the MUTCD Part 6 for the lane closure; ANSI/ISEA 107 high-visibility garments; 29 CFR 1910.1030 bloodborne pathogens practice for sharps in the catch; the NPDES stormwater rules, 40 CFR 122.26, and the Regional Water Quality Control Board's municipal stormwater permit trash provisions; NIOSH findings on confined-space fatalities among would-be rescuers",
  name: "Street Drain Trash Capture Cleanout",
  title: simTitle("Street Drain Trash Capture Cleanout"),
  tagline: "A trash capture vault under the street, emptied from the surface: the order read, the lane closed with a sign and a taper, the cover lifted, the air read at the opening, the vault looked over from above, the vacuum boom guided down, the truck locked out to clear a clog, the clamp freed, the screen rinsed, the catch estimated, logged and the crew checked in",
  accent: BKTD_ACCENT,
  accentCss: "#3fa0c8",
  parSeconds: 300,
  footprint: 2.5,
  badge: { id: "from-the-surface", name: "From The Surface", note: "The vault emptied and rinsed without anyone going in, leaning in or reaching into a live boom" },

  supportLine: "your union hall's member assistance programme — LIUNA — with the employer's employee assistance line behind it",

  game: system({
    name: "Vault Service",
    currency: "SCREEN",
    ranks: ["Cone Hand", "Boom Guide", "Vault Lead", "Stormwater Foreman", "Vault Service Certified"],
    badges: [
      { id: "order-read", name: "Order Read", note: "The order read and the vault looked over from above before the boom went down", test: AWARD.all(AWARD.stepClean("work-order"), AWARD.stepClean("surface-inspect")) },
      { id: "nobody-in", name: "Nobody In", note: "Never leaned over the opening, never climbed in, never stood in the live lane, never a hand in a running boom", test: AWARD.safe },
      { id: "honest-reads", name: "Honest Reads", note: "Air and catch reads both committed inside their bands", test: AWARD.precise(0.7) },
    ],
    challenges: [
      { id: "clean-vault", name: "Clean Vault", note: "No corrections from the order to the check-in", test: AWARD.clean },
      { id: "steady-boom", name: "Steady Boom", note: "Held the boom in band the whole descent", test: AWARD.unbroken },
      { id: "before-the-storm-drain", name: "Before The Rain", note: "Vault logged inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "lean-over": "You leaned your head and shoulders over the open vault to see the screen. A storm drain vault can hold air short of oxygen or heavy with hydrogen sulfide from rotting debris, and the gas sits right at the opening; leaning in puts your face in it before the meter has spoken. The vault is looked into from beside the opening with a light, never from over it.",
    "climb-in": "You started down the vault's rungs to pull a snag off the screen. The vault is a permit-required confined space under 29 CFR 1910.146, and this crew has no entry permit, no attendant, no retrieval line and no rescue plan today. NIOSH investigations keep finding the same pattern — one person goes in, a second follows to help — which is why this service is done entirely from the surface.",
    "live-lane": "You stepped out past the cones into the live lane to wave the truck back. The taper exists so traffic passes the crew on the far side of a line of cones, and a worker outside it is a pedestrian in a traffic lane. The truck is backed with the spotter inside the closed lane, in the driver's mirror.",
    "hand-in-boom": "You reached into the boom tube's mouth to pull a bottle out while the vacuum was running. A vacuum truck's suction will pull a hand and arm into the tube, and the boom can move on the operator's controls at any moment. The boom is only touched once the power take-off is off and locked out and a start has been tried.",
  },

  lateNotes: {
    "cover-lifter": "Lift the cover only once the lane is closed and the taper is set — the crew works bent over the opening with its back to the street.",
    "boom-clamp": "Free the clamp only after the truck is locked out — the clamp holds a tube the vacuum is still pulling on.",
    "catch-gauge": "Estimate the catch once the vault is rinsed and the boom is stowed — until then the tank is still filling.",
    "service-log": "The log is written after the rinse and the estimate — it records the whole service, not just the vacuum.",
  },

  steps: [
    {
      id: "work-order", kind: "select", target: "work-order",
      title: "Read the work order and the vault's classification",
      cue: "At the board: which vault, that it is a permit-required confined space and this is a non-entry service, the traffic control plan, the air monitoring and the lockout for the truck.",
      why: "The single most important line on this order is the classification: the vault is a permit-required confined space and the service is non-entry, so every task that follows is planned to be done from the surface. The traffic control plan and the truck's lockout are on it too, because the two things most likely to hurt this crew are a car in the work zone and a machine that moves while a hand is on it.",
    },
    {
      id: "gear", kind: "sequence", anyOrder: true,
      targets: ["ppe-vest", "ppe-hardhat", "ppe-gloves", "ppe-glasses"],
      itemNames: { "ppe-vest": "ANSI/ISEA 107 vest", "ppe-hardhat": "hard hat", "ppe-gloves": "cut- and puncture-resistant gloves", "ppe-glasses": "safety glasses" },
      title: "Gear up for the street and the catch",
      cue: "The vest for a crew in a traffic lane, a hard hat under the boom, puncture-resistant gloves for the catch, and glasses against the rinse spray.",
      why: "The crew works inside a closed lane with traffic passing a few metres away, so being seen is the first control. What comes up out of a street drain is broken glass, metal and sometimes needles, which ordinary gloves do not stop, and the jet rinse throws a fine spray of that same water back toward faces.",
    },
    {
      id: "advance-sign", kind: "drag", target: "advance-sign",
      title: "Set the advance warning sign upstream",
      cue: "Carry the ROAD WORK AHEAD sign to its mark upstream of the taper, where drivers see it in time to move over.",
      why: "Under the MUTCD a lane closure starts with warning in advance, placed far enough upstream that a driver has time to read it, slow and merge before reaching the cones. A sign set right beside the work is a sign read at the moment it is too late to act on it, which is how work zones get entered by cars that never meant to.",
      drag: { to: "sign-mark", radius: 0.5, missNote: "Not on the mark — the advance sign goes upstream, where drivers read it before the taper." },
    },
    {
      id: "taper", kind: "sequence",
      targets: ["cone-1", "cone-2", "cone-3"],
      itemNames: { "cone-1": "first cone at the start of the taper", "cone-2": "second cone angling in", "cone-3": "third cone at the lane line" },
      title: "Set the taper from upstream in",
      cue: "Place the cones from the start of the taper toward the work: first, second, third.",
      why: "Cones are set from upstream, walking with the traffic behind the ones already placed, so the worker setting them is always protected by the cones they have just put down. Setting them from the work zone outward means walking backward into oncoming traffic with nothing between you and it.",
      outOfOrderNote: "Out of order — the taper is set from the upstream end first, so each cone protects you placing the next.",
    },
    {
      id: "lift-cover", kind: "hold", target: "cover-lifter",
      seconds: 5,
      title: "Lift the cover with the magnetic lifter",
      cue: "Hold the lifter's handle steady until the cover is up and walked clear of the opening.",
      why: "A cast-iron vault cover is heavy enough to crush a foot or strain a back if it is prised up with a pick and dropped. The lifter lets one person raise it with a straight back and walk it off to the side, and holding steady until it is clear keeps it from swinging back over the opening on the way.",
      holdBreakNote: "The lifter let go before the cover was clear. Hold it steady until the cover is walked off to the side.",
    },
    {
      id: "air-check", kind: "gauge", target: "gas-meter",
      title: "Read the air at the opening before anyone works over it",
      cue: "Lower the meter's sample line into the opening and read oxygen, flammables, hydrogen sulfide and carbon monoxide against the meter's alarm band.",
      why: "Even a non-entry service puts faces near the opening for most of the job, and rotting debris can fill a vault with hydrogen sulfide or push oxygen down. The meter reads what nobody can smell reliably — hydrogen sulfide deadens the nose at the concentrations that matter — so the air is read before the work and kept reading beside the opening throughout.",
      gauge: { label: "4-GAS AT OPENING", speed: 0.7, green: [0.42, 0.6], readout: (t) => (t < 0.42 ? "sample line still coming up to depth" : t <= 0.6 ? "all four channels clear" : "reading drifting — let it settle"), missNote: "Outside the band — let the sample line settle and read all four channels again." },
    },
    {
      id: "surface-inspect", kind: "find", noHint: true,
      targets: ["bypass-clogged", "rungs-corroded"],
      itemNames: { "bypass-clogged": "the overflow bypass blocked with a mat of leaves and bags", "rungs-corroded": "the vault's rungs eaten by corrosion" },
      itemNotes: {
        "bypass-clogged": "A mat of leaves and plastic bags has blocked the bypass. In a storm the water would back up into the street instead of passing the screen; it is vacuumed first and noted.",
        "rungs-corroded": "The rungs are corroded thin. They are tagged as unfit on the log and reported: another reason nobody climbs in, and a repair for any future entry crew to know about.",
      },
      title: "Look the vault over from beside the opening",
      cue: "With a light, from beside the opening: the screen, the bypass, the sump and the rungs down the wall.",
      why: "Looking before vacuuming tells the crew what the job actually is — a blocked bypass means the device has been flooding the street in storms, and corroded rungs are a hazard the next crew must hear about before anyone ever plans an entry. It is done from beside the opening with a light, which is what the lean-over hazard is about.",
    },
    {
      id: "vac-boom", kind: "track", target: "boom-guide", seconds: 7,
      title: "Guide the vacuum boom down into the sump",
      cue: "From beside the opening, keep the guide signal steady so the operator lowers the boom tube to the sump without striking the screen.",
      why: "The boom tube is heavy and the operator cannot see down the vault, so the ground crew guides it with steady hand signals from a position the operator can see. Lowered too fast it strikes the screen and bends it, leaving a gap trash will pass through for months; too slow and hesitant, the operator starts guessing.",
      track: { start: 0.16, green: [0.4, 0.6], rise: 0.55, fall: 0.45, drift: 0.14, label: "BOOM GUIDE", readout: (v) => (v < 0.4 ? "hesitant — operator guessing" : v > 0.6 ? "fast — heading for the screen" : "steady — down to the sump") },
      holdBreakNote: "The guide signal went ragged and the boom swung toward the screen. Bring it back to steady.",
    },
    {
      id: "lockout", kind: "sequence",
      targets: ["pto-off", "lock-applied", "try-start"],
      itemNames: { "pto-off": "power take-off disengaged, engine off", "lock-applied": "personal lock and tag on the truck's control", "try-start": "start tried — nothing moves" },
      title: "Lock out the truck before clearing the clog",
      cue: "A bottle has jammed the boom tube: power take-off off, your own lock and tag on, then try the start before any hand goes near the tube.",
      why: "Clearing a jammed boom tube puts hands at exactly the point where suction and boom movement do their damage, so 29 CFR 1910.147 applies: the energy is isolated, locked with the worker's own lock, and then proven dead by trying to start it. A switch someone else turned off is not a lockout; a lock only you can remove, and a start that does nothing, is.",
      outOfOrderNote: "Out of order — power take-off off first, then your own lock on, and only then try the start to prove it dead.",
    },
    {
      id: "free-clamp", kind: "turn", target: "boom-clamp",
      title: "Free the boom tube's clamp to reach the jam",
      cue: "With the truck locked out, turn the clamp's wing nut until the tube section comes free.",
      why: "The jam is cleared by opening the tube at a clamp and pulling the bottle out with tongs, not by reaching up the mouth. The clamp is freed steadily because a tube section still under a little residual weight can drop when the last thread lets go, and a foot or hand under it is the only thing it can land on.",
      turn: { turns: 1.25, label: "BOOM CLAMP", readout: (t) => (t < 0.3 ? "clamped tight" : t < 0.9 ? "loosening" : "free — section down") },
    },
    {
      id: "rinse-screen", kind: "hold", target: "jet-wand",
      seconds: 5,
      title: "Rinse the screen from the surface",
      cue: "Back in service, hold the jet wand steady down the opening until the screen runs clear.",
      why: "The screen only captures trash if its openings are clear, and a mat of fine debris left on it turns a full-capture device into a blocked one that sends the next storm into the bypass. The rinse is done from the surface with the wand aimed down through the opening, so no one needs to go in to finish the job.",
      holdBreakNote: "The wand came off the screen before it ran clear. Hold it steady until the screen is clean.",
    },
    {
      id: "catch-estimate", kind: "gauge", target: "catch-gauge",
      title: "Estimate the catch on the truck's tank gauge",
      cue: "Read the debris level on the tank's sight gauge against the level before this vault, and commit the estimate for the trash report.",
      why: "The municipal stormwater permit's trash accounting is built from these estimates, and they show which devices fill fastest and need servicing more often. Reading the difference on the tank's gauge gives a real number for this vault rather than a guess from the kerb.",
      gauge: { label: "TANK LEVEL", speed: 0.72, green: [0.4, 0.58], readout: (t) => (t < 0.4 ? "reading the last vault's level" : t <= 0.58 ? "this vault's catch" : "slosh on the gauge — wait"), missNote: "Outside the band — let the tank settle and read this vault's catch again." },
    },
    {
      id: "service-log", kind: "select", target: "service-log",
      title: "Write the service log",
      cue: "Log the bypass blockage and the flooding it would have caused, the corroded rungs tagged, the air reads and the alarm, the lockout and the jam, the rinse, the catch estimate and the car in the taper.",
      why: "The log is the device's maintenance record and the permit's evidence that it was serviced rather than visited. The corroded rungs go in because a future entry crew plans from this record, and the gas alarm goes in because a vault that alarms once is a vault the next crew should approach expecting it.",
    },
    {
      id: "crew-checkin", kind: "select", target: "crew-radio",
      title: "Check in with the operator and the crew",
      cue: "On the radio: the vault logged and closed, the cones coming in from the downstream end, and how everyone is after a gas alarm and a car in the taper.",
      why: "A gas alarm at an opening and a car nosing into the cones are both close calls, and the check-in says them out loud before the crew moves to the next vault. It also plans the pickup: cones come in from the downstream end, reversing the order they went out. The member assistance line is there for anything still with someone afterward.",
    },
  ],

  interrupts: [
    {
      id: "car-in-taper",
      kind: "Car entering the taper",
      after: "lift-cover", delay: 2, seconds: 12,
      alert: "A car has swung into the taper behind a delivery van and is rolling toward the open vault.",
      cue: "Turn the flagger's paddle to STOP toward the car and step back behind the truck.",
      target: "flag-paddle",
      why: "A driver who has entered a closed lane has missed the sign and the cones, so the next control is a person with a STOP paddle the driver can see, standing where the truck protects them. The MUTCD's flagging procedures are exactly this: a clear, standard signal, given from a safe position, not a wave from in front of the bumper.",
      missNote: "The car rolled on through the taper and stopped with its front wheel at the lip of the open vault, the crew scattering out of its path.",
      wrongNote: "The flagger's paddle — STOP toward the car, from behind the truck.",
    },
    {
      id: "gas-alarm",
      kind: "Gas meter alarm",
      after: "vac-boom", delay: 3, seconds: 12,
      alert: "The meter at the opening has gone into alarm on hydrogen sulfide as the boom stirs the sump.",
      cue: "Stop the work and move everyone upwind to the muster cone until the reading clears.",
      target: "upwind-muster",
      why: "Stirring the sump releases gas trapped in the debris, and the alarm is the meter saying the air at the opening is no longer safe to stand in. Everyone moves upwind and away, and the work waits for the reading to fall back into the band — no one leans in to finish the last bit, and no one goes in after a tool.",
      missNote: "The crew kept working over the alarm; the second laborer, bent over the opening, got a lungful of the gas and had to sit down on the kerb, dizzy, before anyone moved.",
      wrongNote: "The upwind muster cone — stop, and move everyone upwind until the meter clears.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.5, BKTD_ACCENT);

    // ------------------------------------------------------ street and kerb
    const street = box(g, 18, 0.04, 8, 0, 0.02, -2.6, 0xffffff, { rough: 0.9 });
    street.material = texturedMat(surfaceTexture((cx, w, h) => pavingFace(cx, w, h, { tiles: 3, base: "#34363a", base2: "#2e3034", seam: "rgba(0,0,0,0.2)" }), { repeat: 4, px: 512 }), { rough: 0.9, color: 0xb8bcc2 });
    const walk = box(g, 18, 0.05, 2.6, 0, 0.1, 2.7, 0xffffff, { rough: 0.9 });
    walk.material = texturedMat(surfaceTexture((cx, w, h) => pavingFace(cx, w, h, { tiles: 6, base: "#a9a59c", base2: "#9d998f", seam: "rgba(0,0,0,0.3)" }), { repeat: 5, px: 512 }), { rough: 0.9, color: 0xe4e0d6 });
    box(g, 18, 0.18, 0.2, 0, 0.09, 1.35, 0xb8b4aa, { rough: 0.9 });
    for (let i = -8; i <= 8; i += 2) box(g, 1.2, 0.01, 0.12, i, 0.045, -2.6, 0xf2f2ee, { rough: 0.6 });
    box(g, 0.9, 0.12, 0.3, 2.4, 0.1, 1.3, 0x5a5c5e, { rough: 0.8 });
    holoTag(g, "kerb inlet", 2.4, 0.5, 1.3, { css: "#3fa0c8", w: 0.22 });

    // --------------------------------------------------- vault and cover
    const vault = group(g, 0, 0.04, -0.2);
    const rim = torus(vault, 0.5, 0.06, 0, 0.02, 0, 0x4a4c4e, { rough: 0.7, metal: 0.4, seg: 8, seg2: 28 });
    rim.rotation.x = Math.PI / 2;
    const hole = cyl(vault, 0.46, 0.46, 0.02, 0, 0.005, 0, 0x0a0c0e, { rough: 1, seg: 24, cast: false });
    void hole;
    const screen = group(vault, 0, -0.01, 0);
    for (let i = -3; i <= 3; i++) box(screen, 0.8, 0.004, 0.01, 0, 0.012, i * 0.1, 0x6f767d, { rough: 0.5, metal: 0.6 });
    const bypass = box(vault, 0.24, 0.02, 0.12, 0.28, 0.02, 0.18, 0x6a5a3a, { rough: 0.95 });
    reg(hits, bypass, "bypass-clogged");
    const rungs = group(vault, -0.36, 0.02, 0);
    for (let i = 0; i < 3; i++) box(rungs, 0.02, 0.01, 0.2, 0, 0.004, -0.12 + i * 0.12, 0x8a5a3a, { rough: 0.9, emissive: 0x3a1a06, ei: 0.3 });
    reg(hits, rungs, "rungs-corroded");
    const cover = group(g, 0, 0.06, -0.2);
    const coverDisc = cyl(cover, 0.5, 0.5, 0.05, 0, 0, 0, 0xffffff, { rough: 0.7, metal: 0.5, seg: 24 });
    coverDisc.material = texturedMat(surfaceTexture(bktdCoverFace, { repeat: 1, px: 128 }), { rough: 0.7, metal: 0.5 });
    const lifter = group(g, 0.9, 0.04, 0.3);
    cyl(lifter, 0.02, 0.02, 1.0, 0, 0.5, 0, 0x2f4d5f, { rough: 0.5, metal: 0.6, seg: 8 });
    box(lifter, 0.4, 0.04, 0.04, 0, 1.0, 0, 0xe0a040, { rough: 0.5 });
    cyl(lifter, 0.12, 0.12, 0.05, 0, 0.03, 0, 0xd2312b, { rough: 0.5, seg: 12 });
    holoTag(lifter, "magnetic cover lifter", 0, 1.3, 0, { css: "#3fa0c8", w: 0.38 });
    reg(hits, lifter, "cover-lifter");
    const leanHit = box(g, 0.5, 0.4, 0.5, -0.1, 0.9, -0.3, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "lean over the opening to look?", -0.1, 1.3, -0.3, { css: "#e8622a", w: 0.54 });
    reg(hits, leanHit, "lean-over");
    const climbHit = box(g, 0.4, 0.4, 0.4, -0.7, 0.4, -0.4, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "climb down the rungs?", -0.7, 0.8, -0.6, { css: "#e8622a", w: 0.4 });
    reg(hits, climbHit, "climb-in");

    // Gas meter on its tripod, the upwind muster cone.
    const meter = group(g, -0.9, 0.04, 0.4);
    for (const a of [0, 2.1, 4.2]) { const leg = cyl(meter, 0.012, 0.012, 0.9, Math.cos(a) * 0.15, 0.42, Math.sin(a) * 0.15, 0x8a949d, { rough: 0.5, metal: 0.6, seg: 6 }); leg.rotation.z = Math.cos(a) * 0.3; leg.rotation.x = Math.sin(a) * 0.3; }
    const meterBody = box(meter, 0.12, 0.18, 0.06, 0, 0.92, 0, 0x2a2e33, { rough: 0.5 });
    const meterLed = box(meter, 0.08, 0.03, 0.01, 0, 0.97, 0.035, 0x59c97b, { emissive: 0x59c97b, ei: 1.2, rough: 0.4 });
    holoTag(meter, "4-gas meter", 0, 1.2, 0, { css: "#3fa0c8", w: 0.24 });
    reg(hits, meterBody, "gas-meter");
    const muster = group(g, -5.6, 0.04, 2.6);
    cyl(muster, 0.03, 0.18, 0.6, 0, 0.3, 0, 0x2f9a4a, { rough: 0.7, seg: 10 });
    holoTag(muster, "upwind muster point", 0, 0.95, 0, { css: "#3fa0c8", w: 0.36 });
    reg(hits, muster, "upwind-muster");
    const windsock = group(g, -6.4, 0.04, 2.6);
    cyl(windsock, 0.02, 0.02, 1.6, 0, 0.8, 0, 0x8a949d, { rough: 0.5, metal: 0.6, seg: 6 });
    const sock = cyl(windsock, 0.06, 0.03, 0.4, 0.2, 1.55, 0, 0xf06a2b, { rough: 0.7, seg: 8 });
    sock.rotation.z = Math.PI / 2;

    // ----------------------------------------- the vacuum truck and boom
    const truck = dumpTruck(g, 4.6, 0, -1.6, { ry: -Math.PI / 2, livery: { colour: 0x3fa0c8, fleetName: "STORMWATER", unitNumber: "VC-7" } });
    void truck;
    holoTag(g, "combination vacuum truck", 4.6, 3.6, -1.6, { css: "#3fa0c8", w: 0.48 });
    const boom = group(g, 2.6, 2.4, -0.9);
    const boomArm = cyl(boom, 0.09, 0.09, 2.4, -1.1, 0, 0, 0x2a2e33, { rough: 0.6, seg: 10 });
    boomArm.rotation.z = Math.PI / 2;
    const drop = cyl(boom, 0.08, 0.08, 1.8, -2.3, -1.0, 0, 0x1b1e22, { rough: 0.7, seg: 10 });
    const clamp = group(boom, -2.3, -0.3, 0);
    torus(clamp, 0.1, 0.02, 0, 0, 0, 0x6f767d, { rough: 0.5, metal: 0.6, seg: 6, seg2: 16 }).rotation.x = Math.PI / 2;
    const wing = box(clamp, 0.12, 0.03, 0.03, 0.12, 0, 0, 0xe0a040, { rough: 0.5 });
    holoTag(clamp, "boom clamp", 0.2, 0.2, 0, { css: "#3fa0c8", w: 0.22 });
    reg(hits, clamp, "boom-clamp");
    const boomHome = boom.position.clone();
    const handBoomHit = box(g, 0.4, 0.4, 0.4, 0.3, 0.9, -0.9, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "reach into the running boom?", 0.3, 1.25, -1.1, { css: "#e8622a", w: 0.5 });
    reg(hits, handBoomHit, "hand-in-boom");
    const guide = group(g, 1.2, 0.04, 0.6);
    box(guide, 0.5, 0.04, 0.5, 0, 0.02, 0, BKTD_ACCENT, { rough: 0.6, emissive: 0x0a2a3a, ei: 0.4 });
    holoTag(guide, "boom guide's spot", 0, 0.4, 0, { css: "#3fa0c8", w: 0.3 });
    reg(hits, guide, "boom-guide");
    const jet = group(g, -0.6, 0.04, 0.9);
    cyl(jet, 0.02, 0.02, 1.1, 0, 0.55, 0, 0x2a2e33, { rough: 0.5, metal: 0.4, seg: 8 }).rotation.z = 0.4;
    box(jet, 0.1, 0.12, 0.06, 0.2, 1.0, 0, 0xe0a040, { rough: 0.5 });
    holoTag(jet, "jet wand", 0, 1.3, 0, { css: "#3fa0c8", w: 0.2 });
    reg(hits, jet, "jet-wand");
    const spray = cyl(g, 0.02, 0.12, 0.6, -0.1, 0.35, -0.2, 0xbfe0f0, { rough: 0.1, opacity: 0.5, transparent: true, cast: false, seg: 10 });
    spray.visible = false;

    // Truck control panel: lockout and the tank gauge.
    const panel = group(g, 3.2, 0.04, 0.2);
    box(panel, 0.6, 1.0, 0.1, 0, 0.9, 0, 0x2a2e33, { rough: 0.5, metal: 0.3 });
    const ptoLever = box(panel, 0.06, 0.2, 0.06, -0.18, 1.1, 0.07, 0xd2312b, { rough: 0.5 });
    const pto = group(panel, -0.18, 1.1, 0.08); box(pto, 0.1, 0.24, 0.02, 0, 0, 0, 0x000000, { opacity: 0.001, transparent: true, cast: false }); reg(hits, pto, "pto-off");
    holoTag(panel, "PTO", -0.18, 1.35, 0.08, { css: "#3fa0c8", w: 0.1 });
    const lockTag = group(panel, 0.02, 1.1, 0.08);
    const lockBody = box(lockTag, 0.06, 0.08, 0.03, 0, 0, 0, 0xd2312b, { rough: 0.5 });
    lockBody.visible = false;
    const lockHit = box(lockTag, 0.12, 0.14, 0.02, 0, 0, 0, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    void lockHit;
    holoTag(panel, "your lock + tag", 0.02, 1.35, 0.08, { css: "#3fa0c8", w: 0.26 });
    reg(hits, lockTag, "lock-applied");
    const startBtn = cyl(panel, 0.04, 0.04, 0.03, 0.2, 1.1, 0.07, 0x59c97b, { rough: 0.5, seg: 10 });
    startBtn.rotation.x = Math.PI / 2;
    holoTag(panel, "try start", 0.2, 1.35, 0.08, { css: "#3fa0c8", w: 0.16 });
    reg(hits, startBtn, "try-start");
    const tankGauge = decal(panel, 0.1, 0.36, 0, 0.62, 0.06, (cx, w, h) => { cx.fillStyle = "#f2f2ee"; cx.fillRect(0, 0, w, h); for (let i = 0; i < 6; i++) { cx.fillStyle = "#1b1e22"; cx.fillRect(0, (i * h) / 6, w, 3); } }, { px: 64 });
    holoTag(panel, "tank sight gauge", 0, 0.35, 0.08, { css: "#3fa0c8", w: 0.3 });
    reg(hits, tankGauge, "catch-gauge");

    // ------------------------------------------ traffic control
    const sign = group(g, -3.4, 0.04, 2.2, 0.2);
    for (const s of [-1, 1]) cyl(sign, 0.02, 0.02, 1.0, s * 0.2, 0.45, 0, 0x8a949d, { rough: 0.5, metal: 0.6, seg: 6 }).rotation.z = s * 0.2;
    const signFaceMesh = decal(sign, 0.6, 0.6, 0, 1.05, 0.03, signFace("ROAD\nWORK\nAHEAD", { bg: "#f06a2b", accent: "#1b1e22", fg: "#1b1e22", scale: 0.26 }), { px: 128 });
    signFaceMesh.rotation.z = Math.PI / 4;
    holoTag(sign, "advance warning sign", 0, 1.6, 0, { css: "#3fa0c8", w: 0.38 });
    reg(hits, sign, "advance-sign");
    const signMark = group(g, -7.2, 0.05, -1.4);
    const signRing = torus(signMark, 0.45, 0.012, 0, 0.01, 0, BKTD_ACCENT, { emissive: BKTD_ACCENT, ei: 1.6, rough: 0.4, cast: false, seg: 6, seg2: 28 });
    signRing.rotation.x = Math.PI / 2;
    hits["sign-mark"] = signMark;
    holoTag(signMark, "advance sign mark", 0, 0.3, 0, { css: "#3fa0c8", w: 0.32 });
    const cones = [];
    [[-5.6, -4.2], [-4.2, -3.2], [-2.8, -2.2]].forEach(([x, z], i) => {
      const c = group(g, x, 0.04, z);
      cyl(c, 0.02, 0.14, 0.5, 0, 0.25, 0, 0xf06a2b, { rough: 0.7, seg: 8 });
      cyl(c, 0.141, 0.141, 0.06, 0, 0.28, 0, 0xf2f2ee, { rough: 0.6, seg: 8 });
      box(c, 0.32, 0.03, 0.32, 0, 0.015, 0, 0x1b1e22, { rough: 0.8 });
      holoTag(c, `cone ${i + 1}`, 0, 0.7, 0, { css: "#3fa0c8", w: 0.16 });
      reg(hits, c, `cone-${i + 1}`);
      c.visible = true; cones.push(c);
    });
    for (const [x, z] of [[-1.4, -1.4], [0, -1.4], [1.4, -1.4]]) { cyl(g, 0.02, 0.14, 0.5, x, 0.29, z, 0xf06a2b, { rough: 0.7, seg: 8 }); cyl(g, 0.141, 0.141, 0.06, x, 0.32, z, 0xf2f2ee, { rough: 0.6, seg: 8 }); }
    const liveHit = box(g, 0.5, 0.5, 0.5, -1.0, 0.6, -3.4, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "step into the live lane to wave?", -1.0, 1.05, -3.4, { css: "#e8622a", w: 0.56 });
    reg(hits, liveHit, "live-lane");
    const paddle = group(g, 2.2, 0.04, 1.8);
    cyl(paddle, 0.02, 0.02, 1.5, 0, 0.75, 0, 0x8a949d, { rough: 0.5, metal: 0.6, seg: 6 });
    const paddleFace = decal(paddle, 0.4, 0.4, 0, 1.6, 0.02, signFace("SLOW", { bg: "#f06a2b", accent: "#1b1e22", fg: "#1b1e22", scale: 0.34 }), { px: 128 });
    holoTag(paddle, "flagger's STOP/SLOW paddle", 0, 1.95, 0, { css: "#3fa0c8", w: 0.46 });
    reg(hits, paddle, "flag-paddle");
    const car = group(g, -6.0, 0.04, -2.2);
    box(car, 1.8, 0.5, 0.9, 0, 0.45, 0, 0x6b4a8a, { rough: 0.5, metal: 0.4 });
    box(car, 1.0, 0.4, 0.85, -0.1, 0.9, 0, 0x2a2e33, { rough: 0.2, metal: 0.4 });
    for (const [x, z] of [[-0.6, 0.45], [0.6, 0.45], [-0.6, -0.45], [0.6, -0.45]]) cyl(car, 0.2, 0.2, 0.1, x, 0.2, z, 0x1b1e22, { rough: 0.8, seg: 12 }).rotation.x = Math.PI / 2;
    car.visible = false;
    const carHome = car.position.clone();

    // ------------------------------------------- boards, gear, radio
    const gear = group(g, -4.4, 0.1, 3.2, 0.2);
    box(gear, 1.1, 0.05, 0.4, 0, 0.72, 0, 0x5a4a38, { rough: 0.8 });
    box(gear, 1.0, 0.7, 0.04, 0, 0.35, 0, 0x3a3f45, { rough: 0.7, metal: 0.3 });
    for (const [id, dx, colour, label] of [["ppe-vest", -0.39, 0xe8e21e, "VEST"], ["ppe-hardhat", -0.13, 0xf2f2ee, "HARD HAT"], ["ppe-gloves", 0.13, 0x3a4a2a, "CUT GLOVES"], ["ppe-glasses", 0.39, 0x2a2e33, "GLASSES"]]) {
      const it = group(gear, dx, 0.8, 0);
      box(it, 0.2, 0.08, 0.16, 0, 0, 0, colour, { rough: 0.8 });
      decal(it, 0.18, 0.05, 0, 0.041, 0, signFace(label, { bg: "#1b1e22", accent: "#3fa0c8", scale: 0.45 })).rotation.x = -Math.PI / 2;
      reg(hits, it, id);
    }
    const order = decal(g, 0.56, 0.4, -1.6, 1.25, 3.4, paperFace("WORK ORDER — TRASH CAPTURE VAULT 12", ["Vault: permit-required confined space", "Service: NON-ENTRY, from the surface", "Traffic: advance sign + taper, flagger", "Air: 4-gas at the opening, continuous", "Truck: PTO lockout before any hand"], { bg: "#f4ecdc", band: "#3fa0c8" }), { px: 320 });
    cyl(g, 0.03, 0.035, 1.0, -1.6, 0.6, 3.38, 0x8a949d, { rough: 0.45, metal: 0.7, seg: 8 });
    reg(hits, order, "work-order");
    const logBoard = decal(g, 0.46, 0.34, 0.2, 1.2, 3.3, paperFace("SERVICE LOG", ["Vault: —", "Air: —", "Catch: —", "Remarks: —"], { bg: "#f4ecdc", band: "#6b7178" }), { px: 256 });
    cyl(g, 0.03, 0.035, 1.0, 0.2, 0.6, 3.28, 0x8a949d, { rough: 0.45, metal: 0.7, seg: 8 });
    reg(hits, logBoard, "service-log");
    const radioPost = group(g, 1.4, 0.1, 3.2);
    box(radioPost, 0.08, 0.95, 0.08, 0, 0.47, 0, 0x3a3f45, { rough: 0.6, metal: 0.4 });
    const radioBody = box(radioPost, 0.07, 0.2, 0.05, 0, 1.05, 0.03, 0x1b1e22, { rough: 0.5 });
    holoTag(radioPost, "crew radio", 0, 1.3, 0, { css: "#3fa0c8", w: 0.24 });
    reg(hits, radioBody, "crew-radio");
    const hand = standingFigure(g, -1.6, 1.0, { ry: 0.6, cloth: 0x3f4a55, vest: 0xf2c14b, helmet: 0xf2f2ee, gloves: true });
    holoTag(hand, "second laborer", 0, 1.95, 0, { css: "#3fa0c8", w: 0.28 });
    const handHome = hand.position.clone();
    const operator = standingFigure(g, 3.9, 0.9, { ry: -2.4, cloth: 0x3f4a55, vest: 0xf2c14b, helmet: 0xf2f2ee });
    holoTag(operator, "truck operator", 0, 1.95, 0, { css: "#3fa0c8", w: 0.28 });
    for (let i = 0; i < 4; i++) ball(g, 0.08, 5.8 + i * 0.25, 0.12, 2.4, 0x3a5a2a, { rough: 0.9, seg: 6, seg2: 4 });
    void CITY; void screen;

    return {
      hits,
      spawnLook: new THREE.Vector3(0, 0.5, -0.4),
      onStep() {},
      onStepComplete(step) {
        if (step.id === "advance-sign") { sign.position.set(-7.2, 0.04, -1.4); signRing.material = mat(0x59c97b, { emissive: 0x59c97b, ei: 1.2 }); }
        if (step.id === "lift-cover") cover.position.set(1.0, 0.06, -0.9);
        if (step.id === "air-check") meterLed.material = mat(0x59c97b, { emissive: 0x59c97b, ei: 1.6 });
        if (step.id === "surface-inspect") rungs.children.forEach((r) => { r.material = mat(0xd2312b, { rough: 0.6 }); });
        if (step.id === "vac-boom") bypass.visible = false;
        if (step.id === "lockout") { lockBody.visible = true; ptoLever.rotation.z = Math.PI / 3; }
        if (step.id === "free-clamp") { drop.position.y = -1.1; lockBody.visible = false; }
        if (step.id === "rinse-screen") spray.visible = false;
        if (step.id === "catch-estimate") repaint(tankGauge, (cx, w, h) => { cx.fillStyle = "#f2f2ee"; cx.fillRect(0, 0, w, h); cx.fillStyle = "#59c97b"; cx.fillRect(0, h * 0.5, w, h * 0.5); });
        if (step.id === "service-log") repaint(logBoard, paperFace("SERVICE LOG", ["Vault: bypass cleared · rungs tagged", "Air: alarm on H2S · cleared · resumed", "Lockout: jam cleared · catch estimated", "Car in taper · flagged to a stop"], { bg: "#f4ecdc", band: "#59c97b" }));
      },
      onHazard() {},
      onInterrupt(it) {
        if (it.id === "car-in-taper") { car.visible = true; car.position.set(carHome.x + 2.4, carHome.y, carHome.z + 0.6); }
        if (it.id === "gas-alarm") meterLed.material = mat(0xd2312b, { emissive: 0xd2312b, ei: 2.0 });
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "car-in-taper") { car.position.set(carHome.x + 1.2, carHome.y, carHome.z); repaint(paddleFace, signFace("STOP", { bg: "#d2312b", accent: "#f2f2ee", fg: "#ffffff", scale: 0.34 })); }
        if (it.id === "gas-alarm") { hand.position.set(-5.2, 0, 2.2); meterLed.material = mat(0xf2c14b, { emissive: 0xf2c14b, ei: 1.4 }); boom.position.y = boomHome.y + 0.4; }
      },
      animate(t, dt, session) {
        const step = session?.step;
        if (session?.turn && step?.id === "free-clamp") wing.rotation.x = session.turn.amount * Math.PI * 2;
        if (step?.id === "vac-boom") boom.position.y = boomHome.y - (session.track?.v ?? 0.5) * 0.5;
        if (step?.id === "rinse-screen") spray.visible = true;
        sock.rotation.y = Math.sin(t * 0.7) * 0.2;
        void dt; void handHome;
      },
    };
  },
};
