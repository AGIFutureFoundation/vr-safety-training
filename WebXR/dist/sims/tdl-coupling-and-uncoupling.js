import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import { box, cyl, slab, group, decal, repaint, signFace, mat, hose } from "../../../shared/kit.js";
import { semiTractor, trailer } from "../../../shared/fleet.js";
import {
  stationPad, holoPanel, holoTag, standingFigure, cone, instrument,
  surfaceTexture, texturedMat, pavingFace, deckPlateFace, reg,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Coupling and Uncoupling VR — Mobility & Transit, the third of
// five Commercial Class A stations in the Job Readiness Edition's TDL
// pre-apprenticeship block. Hooking a tractor to a dropped trailer the way a
// commercial driver manual lays it out, and dropping it again: the yard card
// read so it is the right trailer, the fifth wheel inspected with its jaws
// open, the trailer chocked, the trailer height checked against the fifth
// wheel, the air lines connected and the trailer's brakes set, the tractor
// backed under slowly, the tug test, the get-out-and-look, the electrical,
// landing gear and chocks, and then the drop: legs down, lines off, the
// release handle pulled, and the report.
//
// The tractor and trailer are drawn shorter than real ones so they fit the
// station. Sited generically: no real carrier, no invented clause number.

const CPL_ACCENT = 0x6fd0b4;
const CPL_CAB = 0x3a3f45;
const CPL_TIRE = 0x1a1d21;

export const SIM_TDL_COUPLING_AND_UNCOUPLING = {
  id: "tdl-coupling-and-uncoupling",
  index: "224",
  domain: "Commercial Driving",
  trade: "Class A driver trainee, TDL pre-apprenticeship — Teamsters freight driving: coupling and uncoupling under the entry-level driver training rule (FMCSA 49 CFR 380 Subpart F)",
  category: "Mobility & Transit",
  district: "Mobility & Transit",
  weather: "overcast",
  certification: "FMCSA 49 CFR 380 Subpart F entry-level driver training, whose Class A theory and range curriculum covers coupling and uncoupling, delivered by a provider on the Training Provider Registry; 49 CFR 393 parts and accessories, including coupling devices and the air and electrical connections between tractor and trailer; 49 CFR 396 inspection and the driver vehicle inspection report; the CVSA North American Standard Out-of-Service Criteria for fifth wheels and coupling devices; ANSI/ISEA 107 high-visibility apparel for anyone on foot in the yard; Teamsters (IBT) freight locals' driver training",
  name: "Coupling and Uncoupling",
  title: simTitle("Coupling and Uncoupling"),
  tagline: "Hook and drop a trailer the manual's way: right trailer, fifth wheel open and greased, chocked, height checked, lines on and trailer brakes set, backed under slowly, tugged, looked at, legs up, chocks out — and then legs down, lines off, release pulled and written up",
  accent: CPL_ACCENT,
  accentCss: "#6fd0b4",
  parSeconds: 300,
  footprint: 2.6,
  badge: { id: "tugged-and-looked", name: "Tugged and Looked", note: "A coupling tugged, looked at and written up, and a drop with the legs down before the jaws opened — first time" },

  game: system({
    name: "Coupling",
    currency: "PIN",
    ranks: ["Permit Holder", "Driver Trainee", "Class A Driver", "Yard Lead", "Coupling Certified"],
    badges: [
      { id: "open-jaws", name: "Open Jaws", note: "Every fifth-wheel fault found before backing under", test: AWARD.stepClean("fifth-wheel-check") },
      { id: "never-high-hooked", name: "Never High-Hooked", note: "Never drove off untugged, crawled under a live rig, backed in too high or crossed the lines", test: AWARD.safe },
      { id: "dead-slow", name: "Dead Slow", note: "The back-under held in band the whole way", test: AWARD.unbroken },
    ],
    challenges: [
      { id: "clean-hook", name: "Clean Hook and Drop", note: "No corrections anywhere", test: AWARD.clean },
      { id: "right-height", name: "Right Height", note: "Trailer height read near the centre of the band", test: AWARD.precise(0.7) },
      { id: "yard-pace", name: "Yard Pace", note: "Finished inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "cpl-drive-no-tug": "You went to pull away without tugging against the trailer. A fifth wheel that has not locked, or a kingpin that went over the jaws instead of into them, looks exactly like a good coupling until the trailer comes off the tractor — at the first bump, the first turn or the first stop. The tug test takes five seconds.",
    "cpl-under-trailer": "You went to crawl under the trailer to look at the jaws with the tractor running and the brakes off. If the rig moves, you are under the fifth wheel. The look is done with the parking brakes set, the engine off and the key in your pocket, and with a flashlight rather than your whole body.",
    "cpl-high-hook": "You went to back under with the trailer set too high. The kingpin rides over the top of the jaws instead of into them — a high hook — and the rig can look coupled and even pull, until the trailer drops off the back of the tractor onto the frame and the landing gear.",
    "cpl-crossed-lines": "You went to connect the service line to the emergency glad-hand. Crossed lines on a trailer with spring brakes can leave it without brakes, or with brakes that only release when they should apply. Red goes to red, blue to blue, and the colours are checked every time.",
  },

  lateNotes: {
    "cpl-back-under": "The tractor backs under only after the air lines are on and the trailer's brakes are set, so the trailer cannot be pushed away.",
    "cpl-release-handle": "The release handle is pulled only after the landing gear is down and carrying the trailer, and the lines are off.",
    "cpl-dvir": "The report is written once the drop is done, so the fifth-wheel faults and the coupling check are both on it.",
  },

  steps: [
    {
      id: "yard-card", kind: "select", target: "cpl-yard-card",
      title: "Read the yard card and match the trailer",
      cue: "Read the trailer number, the weight and where it goes, and match the number on the trailer nose before you move.",
      why: "Hooking the wrong trailer is one of the commonest and most expensive yard mistakes: a load in the wrong city, a hazmat trailer pulled by a driver who was not expecting it, or a trailer taken off a dock while it was still being loaded. The yard card's number is matched against the nose of the trailer itself, not the slot it is parked in.",
    },
    {
      id: "fifth-wheel-check", kind: "find", noHint: true,
      targets: ["cpl-dry-plate", "cpl-jaws-closed", "cpl-mount-bolt"],
      itemNames: { "cpl-dry-plate": "the dry, ungreased fifth-wheel plate", "cpl-jaws-closed": "the jaws already closed", "cpl-mount-bolt": "the missing mounting bolt" },
      itemNotes: {
        "cpl-dry-plate": "The plate is dry and scored. Without grease the trailer's apron grinds on the plate and the rig steers stiffly and unpredictably in turns.",
        "cpl-jaws-closed": "The locking jaws are already closed. Backed into like this, the kingpin cannot enter; the release handle goes to the open position before coupling.",
        "cpl-mount-bolt": "A bolt is missing from the fifth-wheel mounting bracket. Everything the trailer does goes through these bolts to the tractor frame; this one is a mechanic's job before the tractor hooks anything.",
      },
      title: "Inspect the fifth wheel",
      cue: "Look at the plate, the jaws and the mounting before you back up to anything. Find the three faults.",
      why: "The fifth wheel is the only thing joining forty tons of trailer to the tractor. Driver manuals ask for it to be greased, tilted down toward the rear, with its jaws open and the release handle in the open position, securely mounted with nothing loose or missing. A fault found here is a delay; found after coupling it is a trailer coming loose.",
    },
    {
      id: "trailer-chock", kind: "drag", target: "cpl-trailer-chock",
      title: "Chock the trailer wheels",
      cue: "Carry the chock to the trailer's rear tandem and set it snug against the tire.",
      why: "A dropped trailer is held only by its spring brakes, and a driver backing a tractor into it pushes against those brakes. The chock is what stops the trailer being pushed back as the fifth wheel meets the apron — especially on a trailer whose brakes have leaked off, or on a yard that slopes toward a dock.",
      drag: { to: "cpl-chock-socket", radius: 0.45, missNote: "Not against the tire — set the chock snug to the trailer's rear tandem." },
    },
    {
      id: "trailer-height", kind: "gauge", target: "cpl-trailer-height",
      title: "Check the trailer height against the fifth wheel",
      cue: "Crank the landing gear until the trailer's apron sits just below the top of the fifth wheel, then commit.",
      why: "The trailer should be low enough that it is lifted slightly as the tractor backs under — that is how the kingpin is guided into the jaws. Too high and the kingpin goes over the top of the jaws; too low and the tractor hits the trailer's nose. The manual's check is simple: look along the fifth wheel at the apron, and adjust with the landing gear crank before backing.",
      gauge: { label: "APRON vs FIFTH WHEEL", speed: 0.7, green: [0.38, 0.58], readout: (t) => (t < 0.38 ? "too low — you will hit the nose" : t > 0.58 ? "too high — high hook" : "just below the plate"), missNote: "That height will not couple — too high rides over the jaws, too low hits the nose. Crank again." },
    },
    {
      id: "air-lines", kind: "sequence",
      targets: ["cpl-emergency-gladhand", "cpl-service-gladhand", "cpl-supply-knob"],
      itemNames: { "cpl-emergency-gladhand": "red emergency line to red", "cpl-service-gladhand": "blue service line to blue", "cpl-supply-knob": "charge the trailer, then set its brakes" },
      title: "Connect the air lines and set the trailer brakes",
      cue: "Red emergency line to the red glad-hand, blue service line to the blue, then push the red valve to charge the trailer and pull it to set the trailer's brakes.",
      why: "The emergency line carries the air that holds the trailer's spring brakes off; the service line carries the brake applications. Connecting them before backing under lets the driver charge the trailer and then set its brakes on purpose, so the trailer cannot be pushed away as the tractor comes under it. The order is the manual's: lines, air, then trailer brakes.",
      outOfOrderNote: "Emergency, service, then the valve — the lines go on before any air is sent back to the trailer.",
    },
    {
      id: "back-under", kind: "track", target: "cpl-back-under", seconds: 8,
      title: "Back under slowly",
      cue: "Back straight under the trailer at a crawl in the lowest reverse gear until the fifth wheel locks.",
      why: "Backing under slowly is what lets the kingpin find the jaws: the tractor lifts the apron, the pin slides into the throat, and the jaws close with a sound you can hear. Speed turns that into a collision — a bent kingpin, a trailer shunted into the chock or the dock, and a lock that may not have closed. Straight matters too; an angle can let the pin miss the throat.",
      track: { start: 0.1, green: [0.34, 0.54], rise: 0.52, fall: 0.46, drift: 0.12, label: "REVERSE", readout: (v) => (v < 0.34 ? "stalled" : v > 0.54 ? "too fast" : "dead slow") },
      holdBreakNote: "Speed out of band — back under at a crawl or you will shunt the trailer instead of coupling it.",
    },
    {
      id: "tug-test", kind: "hold", target: "cpl-tug-test", seconds: 7,
      title: "Tug test",
      cue: "Trailer brakes set: in the lowest gear, pull gently forward against the trailer and hold it.",
      why: "The tug test is the only proof, from the cab, that the jaws have closed around the kingpin. With the trailer's brakes set, a gentle pull forward in the lowest gear should be met by the trailer holding firm. If the tractor moves forward alone, the coupling is not made — which is exactly what a high hook looks like until it lets go on the road.",
      holdBreakNote: "You eased off before the tug was proven. Pull gently and hold against the trailer.",
    },
    {
      id: "visual-check", kind: "find", noHint: true,
      targets: ["cpl-no-gap", "cpl-jaws-shank", "cpl-release-locked"],
      itemNames: { "cpl-no-gap": "no space between the apron and the fifth wheel", "cpl-jaws-shank": "jaws closed around the kingpin's shank", "cpl-release-locked": "release arm locked with the safety latch in place" },
      itemNotes: {
        "cpl-no-gap": "The apron sits flat on the plate with no daylight between them. A gap means the trailer is riding on something other than the plate — often a high hook.",
        "cpl-jaws-shank": "The jaws are closed around the shank of the kingpin, not its head. Jaws closed on the head, or closed with no pin in them, will not hold.",
        "cpl-release-locked": "The release arm is in the locked position and the safety latch is over it. An arm left out, or a latch left off, can let the jaws open on the road.",
      },
      title: "Get out and look at the coupling",
      cue: "Brakes set, engine off, key in your pocket: look at the coupling with a flashlight and find the three things that prove it is made.",
      why: "The tug test proves the trailer is attached; the look proves how. Driver manuals ask for exactly these three: no space between the upper and lower fifth wheel, the locking jaws closed around the shank of the kingpin, and the release arm in the locked position with its safety catch in place. They take thirty seconds, done safely from beside the tractor, never from under a live rig.",
    },
    {
      id: "finish-hook", kind: "sequence",
      targets: ["cpl-pigtail", "cpl-landing-crank", "cpl-chock-pull"],
      itemNames: { "cpl-pigtail": "electrical cord connected", "cpl-landing-crank": "landing gear raised and handle stowed", "cpl-chock-pull": "chock removed" },
      title: "Electrical, landing gear, chocks",
      cue: "Connect the electrical cord, raise the landing gear fully and stow the handle, then take the chock away.",
      why: "The electrical cord powers every trailer light and its anti-lock brake system; a cord left hanging is a trailer nobody can see at night. The landing gear goes all the way up and the handle is stowed, because legs left partway down catch on railway crossings and driveways. The chock comes out last, when nothing else needs the trailer held still.",
      outOfOrderNote: "Cord, legs, then chock — the trailer stays chocked until the tractor is ready to move it.",
    },
    {
      id: "lower-legs", kind: "select", target: "cpl-lower-legs",
      title: "Start the drop: legs down, lines off",
      cue: "At the drop spot, set the brakes, chock the trailer, crank the landing gear down until it takes the weight, then disconnect the lines and cord.",
      why: "Uncoupling reverses the hook with one rule above the rest: the trailer's own legs carry its weight before the jaws open. Legs that have not reached the ground let the trailer's nose fall onto the tractor frame or into the yard the moment the tractor pulls out. Lowering them until the load just comes off the fifth wheel, on firm ground, is what makes the rest of the drop safe.",
    },
    {
      id: "release-handle", kind: "turn", target: "cpl-release-handle",
      title: "Pull the fifth-wheel release",
      cue: "Swing the release handle out to open the jaws, then pull ahead slowly until the frame is just clear of the apron, stop, and check the legs hold.",
      why: "The release handle opens the jaws, and it is pulled standing beside the tractor with the brakes set, not reached for from underneath. Pulling ahead only partway first, with the tractor frame still under the trailer, means that if the legs sink or were not quite down, the trailer drops a few inches onto the frame instead of all the way to the ground.",
      turn: { turns: 0.25, axis: "y", label: "RELEASE HANDLE" },
    },
    {
      id: "crew-checkin", kind: "select", target: "cpl-crew-checkin",
      title: "Check in with the yard lead",
      cue: "Report the fifth-wheel faults, the trailer dropped and where, and the worker who stepped in, and say how the yard felt today.",
      why: "The yard lead tracks which trailers are where and which tractors are fit to pull; the missing mounting bolt takes this tractor off the board until the shop fixes it. The worker who stepped between the units is a near miss the whole yard should hear about, and the check-in is where a new driver can say the yard felt rushed or crowded without that being a complaint.",
    },
    {
      id: "dvir", kind: "select", target: "cpl-dvir",
      title: "Write the inspection report",
      cue: "Write up the fifth-wheel faults and the coupling check, note the trailer number and drop location, and sign.",
      why: "The dry plate, the closed jaws and the missing bolt are defects under 49 CFR 396 and belong on the report so a mechanic fixes them before the next hook. The trailer number and where it was dropped let the next driver find it. A report that says only 'no defects' after a coupling like this one is not a record of the truck; it is a guess.",
    },
  ],

  interrupts: [
    {
      id: "worker-between",
      kind: "Person between the units",
      after: "back-under", delay: 3, seconds: 10,
      alert: "A yard worker has walked into the gap between your tractor and the trailer nose to hand you a paper, while you are backing.",
      cue: "Warn them and stop.",
      target: "cpl-horn",
      why: "The gap between a reversing tractor and a trailer nose closes to nothing in a couple of seconds, and a person in it cannot be seen in either mirror. The horn warns them, and the tractor does not move another inch until they are clear and you can see them.",
      missNote: "You kept backing with someone in the gap. People are crushed between tractors and trailers during coupling; the driver almost never sees them, which is why the horn and a full stop are the only safe answer.",
      wrongNote: "It is the horn. Someone is in the gap between your tractor and the trailer while you are reversing.",
    },
    {
      id: "coworker-on-catwalk",
      kind: "Person on the rig",
      after: "tug-test", delay: 3, seconds: 12,
      alert: "A coworker has climbed onto your catwalk behind the cab to re-seat a glad-hand, while you are pulling against the trailer.",
      cue: "Stop pulling and set the brakes.",
      target: "cpl-parking-valve",
      why: "A tug test is a deliberate strain on the coupling, and if it fails the tractor lurches forward — with a person standing on the catwalk between the cab and the trailer. Setting the parking brakes stops the pull and holds the rig still until they are down and you know where they are.",
      missNote: "You kept pulling with someone on the catwalk. If the coupling had let go, the tractor would have jumped forward and thrown them into the gap between cab and trailer.",
      wrongNote: "It is the yellow parking brake valve. Someone is standing on the rig while you are straining the coupling.",
    },
  ],

  supportLine: "your carrier's employee assistance programme, or your Teamsters steward if you are not sure how to reach it",

  build(root) {
    const hits = {};
    const g = group(root);
    const reg2 = (obj, id) => reg(hits, obj, id);
    stationPad(g, 2.6, CPL_ACCENT);

    // ------------------------------------------------------------ yard surface
    const yardTex = surfaceTexture((cx, w, h) => pavingFace(cx, w, h, { tiles: 3, base: "#3d4044", base2: "#34373b", seam: "rgba(0,0,0,0.45)" }), { repeat: 5, px: 512 });
    const yard = box(g, 12, 0.12, 8, 0.5, 0.06, -0.6, 0xffffff, { rough: 0.95 });
    yard.material = texturedMat(yardTex, { rough: 0.95, metal: 0.02, color: 0xabafb4 });
    for (const z of [-2.3, 1.1]) box(g, 12, 0.006, 0.1, 0.5, 0.123, z, 0xf2f5f7, { rough: 0.6, cast: false });
    // The rig is longer than the yard: the slab runs on under the tractor's
    // nose and the pup's tail.
    for (const [w, x] of [[1.3, -6.1], [1.9, 7.4]]) box(g, w, 0.12, 3.4, x, 0.06, -0.6, 0xffffff, { rough: 0.95 }).material = yard.material;

    // ------------------------------------------------------------ tractor, front to the left, fifth wheel toward the trailer
    // The kit's day cab (shared/fleet.js) at real size, in `tr`, the frame
    // that backs under: x runs front (-) to back (+), z is the driver's side.
    // It starts 1.25 m short of the kingpin and backs the rest.
    const TR_X = -2.87;
    const tr = group(g, TR_X, 0.12, -0.6);
    const tractor = semiTractor(tr, 0, 0, 0, { ry: -Math.PI / 2, livery: { colour: CPL_CAB, fleetName: "CITY FREIGHT", unitNumber: "3106" } });
    const TP = tractor.userData.parts;
    // The fifth wheel is the kit's; the jaws, the lock mark and the mounting
    // bolts the procedure checks sit on it.
    reg2(TP.fifthWheel, "cpl-dry-plate");
    const fw = group(tr, 2.025, 1.1, 0);
    const jaws = box(fw, 0.3, 0.08, 0.3, 0.35, 0.12, 0, 0xd98a3a, { rough: 0.5, metal: 0.6 });
    reg2(jaws, "cpl-jaws-closed");
    const handleArm = TP.fifthWheelRelease;
    reg2(handleArm, "cpl-release-handle");
    const lockedMark = box(fw, 0.12, 0.12, 0.08, 0.1, 0.02, 0.64, 0x6fd0b4, { emissive: 0x6fd0b4, ei: 0.4, rough: 0.5 });
    reg2(lockedMark, "cpl-release-locked");
    box(fw, 0.9, 0.26, 0.06, 0, -0.14, 0.52, 0x3a3f45, { rough: 0.6, metal: 0.5 });
    const missingBolt = cyl(fw, 0.04, 0.04, 0.1, -0.3, -0.14, 0.57, 0x1b1e23, { rough: 0.9, seg: 10 });
    missingBolt.rotation.x = Math.PI / 2;
    reg2(missingBolt, "cpl-mount-bolt");
    for (const dx of [-0.1, 0.1, 0.3]) { const b = cyl(fw, 0.035, 0.035, 0.08, dx, -0.14, 0.57, 0xd9dde2, { rough: 0.3, metal: 0.8, seg: 8 }); b.rotation.x = Math.PI / 2; }
    holoTag(tr, "fifth wheel", 2.0, 1.7, 0.8, { css: "#6fd0b4", w: 0.24 });

    // ------------------------------------------------------------ the dropped trailer, nose toward the tractor
    // The kit's 28 ft pup, nose at x -0.5. `van` is its own frame: x runs
    // back from the nose, z is the driver's side.
    const VAN_X = -0.5;
    const pup = trailer(g, VAN_X + 4.265, 0.12, -0.6, { kind: "pup", ry: -Math.PI / 2, livery: { colour: 0xe8eef2, fleetName: "CITY FREIGHT", unitNumber: "53-221" } });
    const VP = pup.userData.parts;
    const van = group(g, VAN_X, 0.12, -0.6);
    decal(van, 0.6, 0.3, -0.01, 3.2, 0, signFace("53-221", { bg: "#e8eef2", fg: "#1b2a34", accent: "#6fd0b4", scale: 0.55 }), { px: 160 }).rotation.y = -Math.PI / 2;
    const gapHit = box(van, 0.6, 0.12, 0.6, 0.91, 1.16, 0.9, 0x6fd0b4, { opacity: 0.25, cast: false });
    reg2(gapHit, "cpl-no-gap");
    const shankHit = box(van, 0.2, 0.2, 0.2, 0.91, 1.1, 0.95, 0x6fd0b4, { opacity: 0.2, cast: false });
    reg2(shankHit, "cpl-jaws-shank");
    // Landing gear: the kit's legs, lowered for the drop at the start; the
    // crank handle and the height gauge are the station's.
    const gear = group(van, 2.4, 0, 0);
    const crank = group(gear, 0, 0.75, 1.12);
    box(crank, 0.04, 0.04, 0.3, 0, 0, 0.15, 0xc9ced2, { rough: 0.4, metal: 0.7 });
    box(crank, 0.04, 0.2, 0.04, 0, -0.1, 0.3, 0xc9ced2, { rough: 0.4, metal: 0.7 });
    reg2(crank, "cpl-landing-crank");
    const legsDown = box(gear, 0.4, 0.3, 0.3, 0, 0.3, 1.1, 0x6fd0b4, { opacity: 0.25, cast: false });
    holoTag(gear, "landing gear", 0, 1.45, 1.2, { css: "#6fd0b4", w: 0.26 });
    reg2(legsDown, "cpl-lower-legs");
    const heightGauge = instrument(gear, 0, 1.25, 1.35, { idle: "HEIGHT", color: CPL_ACCENT, w: 0.14, d: 0.16 });
    reg2(heightGauge, "cpl-trailer-height");
    const setLegs = (down) => { VP.landingGear.position.y = down ? 0 : 0.45; crank.position.y = down ? 0.75 : 1.0; };
    // Glad-hands and the electrical socket on the trailer nose: the kit's.
    reg2(VP.gladHandEmergency, "cpl-emergency-gladhand");
    reg2(VP.gladHandService, "cpl-service-gladhand");
    const socket = cyl(van, 0.07, 0.07, 0.08, -0.05, 1.45, 0.1, 0x2b2f34, { rough: 0.5, seg: 12 });
    socket.rotation.z = Math.PI / 2;
    reg2(socket, "cpl-pigtail");
    holoTag(van, "red · blue · cord", -0.05, 1.9, 0.35, { css: "#6fd0b4", w: 0.28 });
    const crossed = box(van, 0.3, 0.2, 0.2, -0.12, 1.45, 0.72, 0xd2312b, { opacity: 0.3, cast: false });
    holoTag(van, "blue line to the red glad-hand?", -0.12, 1.2, 1.0, { css: "#d2312b", w: 0.5 });
    reg2(crossed, "cpl-crossed-lines");
    // The chock socket, ahead of the pup's axle.
    const chockSocket = box(van, 0.3, 0.2, 0.3, 6.85, 0.1, 1.0, 0xffffff, { rough: 0.5 });
    chockSocket.visible = false; hits["cpl-chock-socket"] = chockSocket;
    const underMark = box(van, 1.2, 0.5, 1.2, 1.0, 0.35, 0, 0xd2312b, { opacity: 0.25, cast: false });
    holoTag(van, "crawl under — rig live?", 1.0, 0.75, 1.2, { css: "#d2312b", w: 0.4 });
    reg2(underMark, "cpl-under-trailer");
    const highMark = box(van, 0.5, 0.2, 2.2, 0.2, 1.3, 0, 0xd2312b, { opacity: 0.2, cast: false });
    holoTag(van, "back under at this height?", 0.2, 1.5, -1.2, { css: "#d2312b", w: 0.44 });
    reg2(highMark, "cpl-high-hook");

    // ------------------------------------------------------------ the cab controls, at the open door
    const dash = group(g, -2.9, 0.12, 1.55, 0.25);
    box(dash, 0.9, 0.9, 0.35, 0, 0.45, 0, 0x2b2f34, { rough: 0.7 });
    slab(dash, 0.86, 0.35, 0.05, 0, 1.05, 0.05, 0x1b1e23, { radius: 0.02, rough: 0.6 });
    const rim = cyl(dash, 0.2, 0.2, 0.03, -0.1, 1.25, 0.28, 0x1b1e23, { rough: 0.5, seg: 18 });
    rim.rotation.x = 1.1;
    const hornPad = cyl(dash, 0.05, 0.05, 0.02, -0.1, 1.26, 0.29, 0x2b2f34, { rough: 0.6, seg: 12 });
    hornPad.rotation.x = 1.1;
    reg2(hornPad, "cpl-horn");
    const yellow = box(dash, 0.08, 0.08, 0.08, 0.22, 0.98, 0.12, 0xf2c14b, { rough: 0.5 });
    yellow.rotation.z = Math.PI / 4;
    reg2(yellow, "cpl-parking-valve");
    const red = cyl(dash, 0.045, 0.045, 0.06, 0.34, 0.98, 0.12, 0xd2312b, { rough: 0.5, seg: 8 });
    red.rotation.x = Math.PI / 2;
    reg2(red, "cpl-supply-knob");
    const reverse = box(dash, 0.08, 0.03, 0.18, 0.2, 0.2, 0.3, 0x3a3f45, { rough: 0.5 });
    reg2(reverse, "cpl-back-under");
    const tug = box(dash, 0.1, 0.12, 0.06, -0.3, 1.0, 0.12, 0x6fd0b4, { emissive: 0x6fd0b4, ei: 0.3, rough: 0.5 });
    reg2(tug, "cpl-tug-test");
    holoTag(dash, "cab: horn · valves · reverse · tug", 0, 1.5, 0.1, { css: "#6fd0b4", w: 0.56 });
    const noTug = slab(g, 0.9, 0.02, 0.5, -4.2, 0.13, 1.4, 0xd2312b, { radius: 0.02, rough: 0.6, opacity: 0.35, cast: false });
    holoTag(g, "drive off — no tug?", -4.2, 0.34, 1.4, { css: "#d2312b", w: 0.34 });
    reg2(noTug, "cpl-drive-no-tug");

    // ------------------------------------------------------------ chock and boards
    const chock = box(g, 0.28, 0.2, 0.26, 3.2, 0.22, 1.9, 0xf2c14b, { rough: 0.8 });
    holoTag(g, "wheel chock", 3.2, 0.55, 1.9, { css: "#6fd0b4", w: 0.22 });
    reg2(chock, "cpl-trailer-chock");
    const chockPull = box(van, 0.4, 0.3, 0.4, 6.85, 0.15, 1.3, 0xffffff, { opacity: 0.001, cast: false });
    reg2(chockPull, "cpl-chock-pull");
    const card = holoPanel(g, 0.8, 0.52, -1.3, 1.55, 2.3, (ctx, w, h) => {
      ctx.fillStyle = "#061612"; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#6fd0b4"; ctx.fillRect(0, 0, w, 6);
      ctx.font = `600 ${Math.round(h * 0.11)}px 'Barlow Condensed', Arial, sans-serif`; ctx.textAlign = "left"; ctx.textBaseline = "middle";
      ctx.fillStyle = "#d8f5ec"; ctx.fillText("YARD CARD — HOOK 53-221", w * 0.06, h * 0.14);
      ctx.font = `${Math.round(h * 0.08)}px Arial, sans-serif`; ctx.fillStyle = "#eefbf6";
      ["Slot 14 · loaded · 38,200 lb", "Match the number on the nose", "Fifth wheel open, greased, tilted", "Lines, air, trailer brakes, then under", "Tug, then get out and look", "Drop at slot 22 — legs down first"]
        .forEach((l, i) => ctx.fillText(l, w * 0.06, h * (0.3 + i * 0.11)));
    }, { ry: 0.25, accent: CPL_ACCENT });
    reg2(card, "cpl-yard-card");
    const checkin = holoPanel(g, 0.46, 0.3, 1.2, 1.75, 2.4, (ctx, w, h) => {
      ctx.fillStyle = "rgba(6,18,22,0.9)"; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#4fd1ff"; ctx.fillRect(0, 0, w, 5);
      ctx.fillStyle = "#dceff7"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
      ctx.font = `600 ${Math.round(h * 0.15)}px 'Barlow Condensed', Arial, sans-serif`;
      ctx.fillText("YARD CHECK-IN", w / 2, h * 0.32);
      ctx.font = `${Math.round(h * 0.1)}px Arial, sans-serif`;
      ctx.fillText("Faults · drop spot · near miss", w / 2, h * 0.66);
    }, { ry: -0.1, accent: 0x4fd1ff });
    reg2(checkin, "cpl-crew-checkin");
    const dvir = holoPanel(g, 0.5, 0.36, 3.6, 1.55, 2.2, (ctx, w, h) => {
      ctx.fillStyle = "rgba(6,20,16,0.92)"; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#6fd0b4"; ctx.fillRect(0, 0, w, 5);
      ctx.fillStyle = "#d8f5ec"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
      ctx.font = `600 ${Math.round(h * 0.13)}px 'Barlow Condensed', Arial, sans-serif`;
      ctx.fillText("DRIVER VEHICLE", w / 2, h * 0.22);
      ctx.fillText("INSPECTION REPORT", w / 2, h * 0.4);
      ctx.font = `${Math.round(h * 0.09)}px Arial, sans-serif`;
      ctx.fillText("Fifth wheel · coupling · drop", w / 2, h * 0.7);
    }, { ry: -0.4, accent: CPL_ACCENT });
    reg2(dvir, "cpl-dvir");
    cone(g, -4.6, -2.8);
    cone(g, 5.8, 1.5);

    // ------------------------------------------------------------ people
    const worker = standingFigure(g, -0.3, 2.3, { ry: 2.8, cloth: 0x2b3138, vest: 0xf2a23b });
    holoTag(worker, "yard worker", 0, 1.95, 0, { css: "#6fd0b4", w: 0.22 });
    const helper = standingFigure(g, 4.8, 2.0, { ry: -2.6, cloth: 0x37505f, vest: 0xd8e24a });

    let backed = 0;
    return {
      hits,
      footprint: 2.6,
      spawnLook: new THREE.Vector3(-0.4, 1.2, -0.4),
      onStepComplete(step) {
        if (step.id === "fifth-wheel-check") { jaws.position.x = 0.5; handleArm.rotation.y = -0.5; }
        if (step.id === "trailer-chock") { chock.parent.remove(chock); van.add(chock); chock.position.set(6.85, 0.1, 1.0); }
        if (step.id === "trailer-height") repaint(heightGauge.userData.screen, signFace("SET", { bg: "#061612", accent: "#59c97b", fg: "#eefbf6", scale: 0.55 }));
        if (step.id === "back-under") { tr.position.x = TR_X + 1.25; jaws.position.x = 0.35; handleArm.rotation.y = 0; }
        if (step.id === "finish-hook") { setLegs(false); chock.visible = false; }
        if (step.id === "lower-legs") setLegs(true);
        if (step.id === "release-handle") { tr.position.x = TR_X + 0.6; handleArm.rotation.y = -0.5; }
        if (step.id === "dvir") {
          repaint(dvir.userData.face, (ctx, w, h) => {
            ctx.fillStyle = "rgba(8,26,14,0.94)"; ctx.fillRect(0, 0, w, h);
            ctx.fillStyle = "#59c97b"; ctx.fillRect(0, 0, w, 5);
            ctx.fillStyle = "#d8f6e4"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
            ctx.font = `600 ${Math.round(h * 0.14)}px 'Barlow Condensed', Arial, sans-serif`;
            ctx.fillText("REPORT SIGNED", w / 2, h * 0.34);
            ctx.font = `${Math.round(h * 0.085)}px Arial, sans-serif`;
            ctx.fillText("Plate · bolt · 53-221 at slot 22", w / 2, h * 0.64);
          });
        }
      },
      // The worker really walks into the gap; the coworker really climbs up
      // onto the catwalk behind the cab.
      onInterrupt(it) {
        if (it.id === "worker-between") { worker.position.set(-0.75, 0, 0.78); worker.rotation.y = Math.PI; }
        if (it.id === "coworker-on-catwalk") { helper.position.set(tr.position.x + 0.95, 1.34, -0.6); helper.rotation.y = Math.PI; }
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "worker-between") { worker.position.set(-0.3, 0, 2.3); worker.rotation.y = 2.8; }
        if (it.id === "coworker-on-catwalk") { helper.position.set(4.8, 0, 2.0); helper.rotation.y = -2.6; yellow.position.z = 0.16; }
      },
      animate(t, dt, session) {
        const step = session?.step;
        const gg = session?.gauge;
        if (gg && !gg.committed && step?.id === "trailer-height") {
          const ok = gg.t >= 0.38 && gg.t <= 0.58;
          repaint(heightGauge.userData.screen, signFace(ok ? "JUST BELOW" : gg.t < 0.38 ? "LOW" : "HIGH", { bg: "#061612", accent: ok ? "#59c97b" : "#f2ae14", fg: "#eefbf6", scale: 0.45 }));
        }
        if (step?.id === "back-under" && session.holding) { backed = Math.min(1, backed + dt / 8); tr.position.x = TR_X + backed * 1.25; }
        if (session?.turn && step?.id === "release-handle") handleArm.rotation.y = -session.turn.amount * 2;
        void t;
      },
    };
  },
};
