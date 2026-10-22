import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, ball, slab, group, decal, repaint, signFace, particles, mat } from "../../../shared/kit.js";
import {
  stationPad, holoPanel, holoTag, toolChest, cone, barrierPanel, instrument,
  standingFigure, surfaceTexture, pavingFace, texturedMat, reg,
} from "../citykit.js";
import { wheelLoader, dumpTruck } from "../../../shared/equipment.js";
import { chock } from "../../../shared/toolkit.js";
import { dumpster } from "../../../shared/props.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Loader Truck Loading & Blind Spots VR — its own gamified
// system: Load Watch.
//
// The IUOE wheel loader operator's own procedure for loading a haul truck:
// the loader's own blind quadrants mapped before anyone works near them, the
// spotter standing where the operator can actually see them, the truck
// driver confirmed clear of the swing path before the bucket ever comes over
// the cab, the truck chocked before the first pass, and every pass counted
// against the scale instead of guessed at. No payload weight or scale
// reading here is one this platform is certain of — those live on the
// job's own ticket.

const OPLD_ACCENT = 0x2f8f5f;

export const SIM_OP_LOADER_TRUCK_LOADING_AND_BLIND_SPOTS = {
  id: "op-loader-truck-loading-and-blind-spots",
  index: "op-3",
  domain: "Construction",
  trade: "Wheel loader operator — IUOE Local 3 operating engineer",
  category: "Construction & Structural Trades",
  weather: "clear",
  certification: "IUOE Local 3 operating engineer training; OSHA 29 CFR 1926.602 Material handling equipment and 29 CFR 1926 Subpart O Motor vehicles, mechanized equipment, and marine operations; 29 CFR 1926.21 safety training and education; NIOSH fatality-investigation findings on struck-by incidents around loading equipment",
  name: "Loader Truck Loading & Blind Spots",
  title: simTitle("Loader Truck Loading & Blind Spots"),
  tagline: "Wheel loader loading a haul truck: blind zones mapped, the spotter positioned where the cab can see them, the driver clear before the bucket swings, the truck chocked, and every pass counted against the scale",
  accent: OPLD_ACCENT,
  accentCss: "#2f8f5f",
  parSeconds: 265,
  footprint: 2.7,
  badge: { id: "load-watch", name: "Load Watch", note: "Blind zones mapped, the driver clear of the swing path every pass, the truck chocked, and the load weighed against the ticket" },

  game: system({
    name: "Load Watch",
    currency: "LOAD",
    ranks: ["Ground Hand", "Loader Hand", "Blind-Spot Certified", "Load Authority", "Load Watch Certified"],
    badges: [
      { id: "never-over-cab", name: "Never Over the Cab", note: "Never swung a loaded bucket over the occupied cab", test: AWARD.safe },
      { id: "chocked-first", name: "Chocked First", note: "Never loaded a truck that was not chocked", test: AWARD.stepClean("chock-truck") },
      { id: "steady-pass", name: "Steady Pass", note: "Held the gauge readings near band centre all shift", test: AWARD.precise(0.72) },
      { id: "blind-mapped", name: "Blind Zones Mapped Clean", note: "Map every blind zone, first try", test: AWARD.stepClean("blind-spot-map") },
    ],
    challenges: [
      { id: "quick-load", name: "Quick Load", note: "Complete inside 80% of par", test: AWARD.fast(0.8) },
      { id: "clean-shift", name: "Clean Shift", note: "Clean run, no corrections", test: AWARD.clean },
      { id: "load-streak", name: "Load Streak", note: "Nine correct actions in a row", test: AWARD.streak(9) },
    ],
  }),

  supportLine: "your IUOE local's member assistance programme, or the site's employee assistance line if a close call in the loading zone is what stayed with you",

  hazards: {
    "bucket-over-cab": "That swings a loaded bucket directly over the truck's occupied cab. A bucket that lets go of even a little spill from that height comes down on the roof a driver is sitting under, which is exactly why the swing path is planned to clear the cab, not to pass over it and hope nothing falls.",
    "blind-zone-stand": "You are standing in the loader's rear blind quadrant while the machine is running. A wheel loader's mirrors do not cover the ground directly behind and to the side of the counterweight, and NIOSH's struck-by fatality investigations around loading equipment keep finding the same pattern: someone in the one place the operator's own seat cannot see.",
    "unchocked-truck": "That truck has no chocks under its wheels yet. A loaded bucket coming down on one side of an unchocked truck can rock it enough to start it rolling on anything but dead-flat ground, and the chocks are what take that possibility off the table before the first pass.",
    "overload-hazard": "That is one more pass logged past the scale's rated payload for this truck. A truck loaded over its rated capacity carries a load its own suspension, brakes and tyres were never rated for, and the scale reading is the only thing standing between a legal load and a guess.",
  },

  lateNotes: {
    "chock-roll": "The chocks go under the wheels before the first bucket pass, not after the truck has already been rocked by one.",
    "payload-scale": "The scale gets read after each pass adds to the load, not once at the end when the only correction left is unloading it again.",
  },

  interrupts: [
    {
      id: "driver-returns-to-cab",
      kind: "Driver returns",
      after: "fill-pass", delay: 4, seconds: 12,
      alert: "The truck driver has started walking back toward the cab door while the bucket is still swinging toward the bed.",
      cue: "Hold the load until the driver is confirmed clear of the swing path.",
      target: "loader-stop-flag",
      why: "The whole plan for where the bucket swings assumes the driver is where the plan expects them to be — the moment that stops being true, the plan is void until somebody actually confirms where the driver is now, not assumed from where they were a minute ago.",
      missNote: "The bucket kept swinging while the driver closed on the cab door underneath its path. A load that lets go from that height does not wait for someone to finish walking to safety.",
      wrongNote: "Not that — the driver's position is what has to be confirmed before this swing continues.",
    },
    {
      id: "spotter-blind-drift",
      kind: "Path drift",
      after: "bucket-path", delay: 4, seconds: 11,
      alert: "The bucket's swing has drifted toward the blind quadrant behind the counterweight while attention was on the truck bed.",
      cue: "Signal the correction now, before the swing closes on the blind side.",
      target: "path-correct-flag",
      why: "A swing that drifts toward the one quadrant the operator cannot see is drifting toward the one place a person could be standing without anyone noticing until the machine is already there — the correction has to come from outside the cab, because the cab is exactly where that drift is invisible from.",
      missNote: "The swing kept drifting toward the blind quadrant unremarked. Struck-by incidents around loading equipment happen in exactly that quadrant, for exactly that reason.",
      wrongNote: "Not that — the drift toward the blind quadrant is what has to be corrected before this swing continues.",
    },
  ],

  steps: [
    {
      id: "ppe", kind: "sequence", anyOrder: true,
      targets: ["hi-vis-vest", "hard-hat"],
      itemNames: { "hi-vis-vest": "hi-vis vest", "hard-hat": "hard hat" },
      title: "Suit up before the loading zone",
      cue: "Hi-vis vest and hard hat before anyone is near the machine.",
      why: "A loader's blind zones already cost the operator part of the picture — a spotter who does not stand out from the dirt and steel around them is giving away the one advantage a vest and a hard hat are there to provide, on the one machine where that advantage is already stretched thin by design.",
    },
    {
      id: "blind-spot-map", kind: "find", noHint: true,
      targets: ["blind-rear", "blind-left", "blind-over-hood"],
      itemNames: {
        "blind-rear": "blind zone behind the counterweight",
        "blind-left": "blind zone on the left quarter",
        "blind-over-hood": "blind zone over the raised hood",
      },
      itemNotes: {
        "blind-rear": "The mirrors do not reach directly behind the counterweight — anyone standing here is invisible to the cab.",
        "blind-left": "The left quarter panel behind the articulation joint sits outside every mirror's field at once.",
        "blind-over-hood": "With the boom raised, the hood itself blocks the forward-down view — someone at the front wheel disappears from the cab's sightline.",
      },
      decoyNotes: {
        "clear-zone-front": "The area straight ahead of the bucket is inside the operator's direct sightline the whole time. Nothing to flag there.",
      },
      title: "Map the loader's blind zones",
      cue: "Walk around the machine. Three zones the cab cannot see are hiding around it — find them by looking.",
      why: "A wheel loader's mirrors were designed around the machine's shape, not around where a person might actually be standing, and the gaps between them are fixed facts about this machine, not something the operator can compensate for by paying closer attention — the only fix is knowing exactly where those gaps are before anyone works near them.",
    },
    {
      id: "spotter-position", kind: "select", target: "spotter",
      title: "Position the spotter in view of the cab",
      cue: "Place the spotter where the operator has a clear, direct line of sight — never inside a mapped blind zone.",
      why: "A spotter is only doing their job if the operator can actually see them the whole time — a spotter standing in one of the loader's own blind zones is providing signals from a position that defeats the entire reason a spotter exists in the first place.",
    },
    {
      id: "driver-safe-position", kind: "select", target: "truck-driver",
      title: "Confirm the driver's position",
      cue: "Confirm the truck driver is in the position the site's traffic control plan calls for before the first pass.",
      why: "Every following step assumes the driver is exactly where the plan expects — confirming it now, out loud, with the driver themselves, is what turns an assumption into a fact the operator can actually load against, instead of a guess that only gets tested the moment the bucket is already swinging.",
    },
    {
      id: "chock-truck", kind: "drag", target: "chock-roll",
      title: "Chock the truck",
      cue: "Carry the wheel chocks to the truck and set them before the first bucket pass.",
      why: "A loaded bucket coming down unevenly on one side of the bed can rock a truck enough to start it moving on anything short of dead-flat, dry ground, and the chocks are the one control that removes that possibility before it is ever tested.",
      drag: { to: "chock-socket", radius: 0.4, missNote: "Not against the wheel — set the chock so it actually blocks the tyre, not beside it." },
    },
    {
      id: "barricade-zone", kind: "sequence", anyOrder: true,
      targets: ["cone-a", "cone-b", "zone-barrier"],
      itemNames: { "cone-a": "cone at the approach", "cone-b": "cone at the far side", "zone-barrier": "loading zone barrier" },
      title: "Barricade the loading zone",
      cue: "Cone both approaches and set the barrier around the full loading area.",
      why: "A barrier around the loading zone is what keeps anyone not part of this pick — a delivery, a visitor, a coworker cutting a corner — out of a space where a machine with known blind zones is actively swinging a loaded bucket.",
    },
    {
      id: "backup-alarm", kind: "gauge", target: "backup-alarm",
      title: "Test the travel alarm",
      cue: "Trigger the alarm and commit only once it reads in the audible range over yard noise.",
      why: "A travel alarm nobody can hear over the yard's own noise has already failed the one job it has — testing it against today's actual conditions is what confirms it will actually carry to somebody stepping into the loader's path.",
      gauge: {
        label: "TRAVEL ALARM — SOUND LEVEL", speed: 0.6, green: [0.5, 0.72],
        readout: (t) => `${Math.round(78 + t * 30)} dB`,
        missNote: "Too quiet to carry over the yard. Get it serviced before this machine moves again.",
      },
    },
    {
      id: "tally-reset", kind: "turn", target: "tally-dial",
      title: "Reset the pass counter",
      cue: "Turn the tally dial back to zero before the first pass on this truck.",
      why: "A pass count that was never reset is counting this truck's load against whatever the last truck left on the dial — resetting it is what makes the count that follows actually mean something against this truck's own payload target, instead of a number that was already wrong before the first bucket went in.",
      turn: { turns: 0.5, axis: "z", label: "TALLY RESET" },
    },
    {
      id: "spot-truck", kind: "select", target: "truck-spot-marker",
      title: "Confirm the truck is spotted correctly",
      cue: "Confirm the bed sits inside the bucket's planned swing arc before the first pass.",
      why: "A truck spotted too close or too far changes the swing arc the whole plan was built around — confirming the spot before the first pass is what keeps every pass after it landing where the plan actually put the bed, not wherever the truck happened to stop.",
    },
    {
      id: "fill-pass", kind: "hold", target: "loader-controls", seconds: 6,
      title: "Make a controlled fill pass",
      cue: "Hold the controls steady through one slow, controlled pass into the bucket.",
      why: "A controlled pass is slow on purpose — a fast, confident scoop is exactly the pass that catches an edge of the pile wrong and swings an unbalanced load right when the bucket is coming up over the bed, with the least margin to correct it before the swing is already underway.",
      holdBreakNote: "Released the controls mid-pass. Hold it through the whole scoop — that is what keeps the load balanced going into the swing.",
    },
    {
      id: "bucket-path", kind: "track", target: "spotter", seconds: 8,
      title: "Swing the load clear of the cab",
      cue: "Keep the spotter's signal steady, holding the swing clear of both the cab and the blind quadrant.",
      why: "The swing has two things it has to clear at once — the occupied cab on one side and the blind quadrant on the other — and continuous signals from a spotter who can see both are what keep the operator from narrowing down to whichever one happens to be in view.",
      track: {
        start: 0.12, green: [0.4, 0.62], rise: 0.5, fall: 0.45, drift: 0.12,
        label: "SWING PATH",
        readout: (v) => (v < 0.4 ? "drifting toward the blind side" : v > 0.62 ? "drifting over the cab" : "on the safe path"),
      },
      holdBreakNote: "The swing drifted out of the safe path. Bring it back on the spotter's signal before the bucket swings again.",
    },
    {
      id: "load-count", kind: "select", target: "tally-dial",
      title: "Confirm the pass count",
      cue: "Confirm the tally against the truck's payload target before the next pass.",
      why: "The tally is what tells you how many more passes this truck can actually take — loading by eye past the point the tally says is full is exactly how a truck ends up over its rated payload without anyone deciding that on purpose.",
    },
    {
      id: "payload-scale", kind: "gauge", target: "payload-scale",
      title: "Weigh the load",
      cue: "Read the scale and commit only inside the truck's legal payload band.",
      why: "The tally counts passes, and the scale is what actually confirms the weight those passes added up to — a truck loaded to the right pass count on the wrong material density can still be over its rated payload, and the scale is the only reading that catches that.",
      gauge: {
        label: "PAYLOAD SCALE", speed: 0.55, green: [0.45, 0.72],
        readout: (t) => `${Math.round(28 + t * 14)} t`,
        missNote: "Over the rated payload for this truck. Pull material back off the bed before it leaves the yard.",
      },
    },
    {
      id: "shutdown-log", kind: "select", target: "closing-log",
      title: "Close out the load ticket",
      cue: "Log the pass count and the scale reading before waving the truck through.",
      why: "The load ticket is the record the scale house and the next inspection both read — a truck that left clean but was never logged against its own scale reading leaves nothing behind to prove the payload was actually checked.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.7, OPLD_ACCENT);

    // ------------------------------------------------------------------ ground
    const groundMesh = box(g, 6.6, 0.14, 6.2, 0, 0.07, 0, 0xffffff, { rough: 0.9 });
    groundMesh.material = texturedMat(
      surfaceTexture((cx, w, h) => pavingFace(cx, w, h, { tiles: 6, base: "#3b3f43", base2: "#33373b", seam: "rgba(0,0,0,0.45)" }), { repeat: 7, px: 512 }),
      { rough: 0.9, metal: 0.05, color: 0xa9b0b6 },
    );

    // ------------------------------------------------------------------ the loader
    const ld = wheelLoader(g, -1.6, 0.14, -1.3, { ry: 0.7, livery: { colour: OPLD_ACCENT, fleetName: "SITE LOAD", unitNumber: "WL-4" } });
    const { arms, bucket, door } = ld.userData.parts;
    holoTag(ld, "loader WL-4", 0, 3.5, 0, { css: "#2f8f5f", w: 0.34 });
    reg(hits, door, "loader-controls");

    // ------------------------------------------------------------------ the haul truck
    const truck = dumpTruck(g, 1.6, 0.14, 0.3, { ry: -1.6, livery: { colour: 0xe0e4e6, fleetName: "SITE HAULING", unitNumber: "D-4" } });
    const { doorL } = truck.userData.parts;
    holoTag(truck, "haul truck D-4", 0, 3.6, 0, { css: "#2f8f5f", w: 0.36 });
    reg(hits, doorL, "truck-driver");
    const truckSpotMarker = group(g, 1.6, 0.16, 0.3);
    hits["truck-spot-marker"] = truckSpotMarker;

    // Overhead-swing hazard: the cab roof zone the bucket must never cross while loaded.
    const cabOverhead = box(g, 1.0, 0.02, 1.0, 1.9, 2.9, 1.9, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "never swing over the cab", 1.9, 3.1, 1.9, { css: "#f0645b", w: 0.5 });
    reg(hits, cabOverhead, "bucket-over-cab");

    // Blind zones, mapped around the loader.
    const blindRear = box(g, 0.8, 0.02, 0.8, -1.6, 0.16, -2.4, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, blindRear, "blind-rear");
    const blindLeft = box(g, 0.8, 0.02, 0.8, -3.0, 0.16, -0.9, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, blindLeft, "blind-left");
    const blindHood = box(g, 0.8, 0.02, 0.8, -0.4, 0.16, -0.4, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, blindHood, "blind-over-hood");
    const clearZone = box(g, 0.8, 0.02, 0.8, -1.6, 0.16, 0.6, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, clearZone, "clear-zone-front");
    const blindZoneHazard = box(g, 0.8, 0.02, 0.8, -1.6, 0.155, -2.4, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "blind quadrant", -1.6, 0.3, -2.4, { css: "#f0645b", w: 0.4 });
    reg(hits, blindZoneHazard, "blind-zone-stand");

    // ------------------------------------------------------------------ guarding
    reg(hits, cone(g, -2.9, 2.4, { color: OPLD_ACCENT }), "cone-a");
    reg(hits, cone(g, 2.9, -2.2, { color: OPLD_ACCENT }), "cone-b");
    const barrierPanels = [];
    for (const [bx, bz, ry] of [[-0.2, 2.6, 0], [0.9, 2.6, 0], [2.9, 1.5, Math.PI / 2], [2.9, 0.5, Math.PI / 2]]) {
      const p = barrierPanel(g, bx, bz, { ry, w: 1.1, color: OPLD_ACCENT });
      p.visible = false;
      barrierPanels.push(p);
    }
    const barrierKit = group(g, -2.6, 0, 0.6, -0.4);
    slab(barrierKit, 1.0, 0.14, 0.18, 0, 0.08, 0, OPLD_ACCENT, { radius: 0.02, rough: 0.6 });
    holoTag(barrierKit, "loading zone barrier", 0, 0.3, 0, { css: "#2f8f5f", w: 0.38 });
    reg(hits, barrierKit, "zone-barrier");

    // Chocks, staged until carried to the truck's wheel.
    const chockRoll = chock(g, 0.4, 0.14, 1.9, { ry: 0.4 });
    holoTag(chockRoll, "wheel chocks", 0, 0.4, 0, { css: "#2f8f5f", w: 0.3 });
    reg(hits, chockRoll, "chock-roll");
    const chockSocket = group(g, 0.9, 0.14, 1.1);
    hits["chock-socket"] = chockSocket;
    const unchockedHazard = group(g, 0.9, 0.14, 1.1);
    reg(hits, unchockedHazard, "unchocked-truck");

    // Overload decoy lever and tally dial.
    const tallyPost = group(g, -0.2, 0.14, 1.6, 0.3);
    box(tallyPost, 0.1, 0.5, 0.1, 0, 0.25, 0, 0x2b2f34, { rough: 0.55 });
    const tallyDial = cyl(tallyPost, 0.09, 0.09, 0.03, 0, 0.55, 0, 0x4fd1ff, { emissive: 0x2f8fdb, ei: 0.5, rough: 0.4, seg: 16 });
    tallyDial.rotation.x = Math.PI / 2;
    holoTag(tallyPost, "pass tally", 0, 0.7, 0, { css: "#2f8f5f", w: 0.28 });
    reg(hits, tallyDial, "tally-dial");
    const overloadLever = box(tallyPost, 0.08, 0.06, 0.02, 0.14, 0.42, 0.05, 0xd2312b, { rough: 0.5 });
    decal(overloadLever, 0.07, 0.05, 0, 0, 0.011, signFace("+1", { bg: "#5a0f0f", accent: "#ffffff", scale: 0.6 }));
    reg(hits, overloadLever, "overload-hazard");

    // Stop and path-correct flags the interrupts are answered with.
    const stopFlag = group(g, -0.6, 0.14, -0.6, 0.3);
    cyl(stopFlag, 0.012, 0.012, 0.7, 0, 0.35, 0, 0xa8b0b8, { rough: 0.5, metal: 0.6, seg: 8 });
    box(stopFlag, 0.16, 0.11, 0.01, 0, 0.62, 0.02, 0xd2312b, { rough: 0.55 });
    decal(stopFlag, 0.14, 0.09, 0, 0.62, 0.026, signFace("STOP", { bg: "#5a0f0f", accent: "#ffffff", scale: 0.55 }));
    holoTag(stopFlag, "hold the load", 0, 0.78, 0, { css: "#2f8f5f", w: 0.32 });
    reg(hits, stopFlag, "loader-stop-flag");
    const correctFlag = group(g, -2.4, 0.14, -1.9, 0.3);
    cyl(correctFlag, 0.012, 0.012, 0.7, 0, 0.35, 0, 0xa8b0b8, { rough: 0.5, metal: 0.6, seg: 8 });
    box(correctFlag, 0.16, 0.11, 0.01, 0, 0.62, 0.02, 0x59c97b, { rough: 0.55 });
    holoTag(correctFlag, "path correct", 0, 0.78, 0, { css: "#2f8f5f", w: 0.3 });
    reg(hits, correctFlag, "path-correct-flag");

    // ------------------------------------------------------------------ crew
    const spotter = standingFigure(g, 0.2, -1.5, { ry: 0.6, cloth: 0x2b3138, vest: 0xf2c14b, helmet: 0xf2f2f2 });
    holoTag(spotter, "spotter", 0, 1.95, 0.15, { css: "#2f8f5f", w: 0.24 });
    reg(hits, spotter, "spotter");
    const spotterSafe = { x: 0.2, z: -1.5 };

    // ------------------------------------------------------------------ paperwork + gear
    const ticket = holoPanel(g, 0.58, 0.4, -2.6, 1.5, 1.2, (ctx, w, h) => {
      ctx.fillStyle = "rgba(6,16,22,0.9)"; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#2f8f5f"; ctx.fillRect(0, 0, w, 5);
      ctx.fillStyle = "#8fb3c4";
      ctx.font = `600 ${Math.round(h * 0.09)}px 'Barlow Condensed', Arial, sans-serif`;
      ctx.textAlign = "left"; ctx.textBaseline = "middle";
      ctx.fillText("LOAD TICKET · TRUCK D-4", w * 0.06, h * 0.14);
      ctx.fillStyle = "#eaf6fb";
      ctx.font = `600 ${Math.round(h * 0.14)}px 'Barlow Condensed', Arial, sans-serif`;
      ctx.fillText("PAYLOAD PER THE TICKET", w * 0.06, h * 0.33);
      ctx.font = `${Math.round(h * 0.085)}px Arial, sans-serif`;
      ctx.fillStyle = "#a9c6d6";
      ["Swing path: never over the cab", "Driver position: per the traffic plan",
       "Chocks: set before the first pass", "Payload: per the truck's rated capacity"].forEach((line, i) => ctx.fillText(line, w * 0.06, h * (0.5 + i * 0.11)));
    }, { ry: 0.5, accent: OPLD_ACCENT });
    reg(hits, ticket, "load-ticket-board");

    const chest = toolChest(g, -2.4, -1.5, { ry: -0.5, color: OPLD_ACCENT });
    const alarmMeter = instrument(chest, -0.08, 0.79, 0.05, { ry: 0.3, idle: "-- dB", color: OPLD_ACCENT });
    holoTag(alarmMeter, "travel alarm", 0, 0.16, 0, { css: "#2f8f5f", w: 0.3 });
    reg(hits, alarmMeter, "backup-alarm");
    const scaleMeter = instrument(chest, 0.16, 0.79, 0.06, { ry: -0.4, idle: "-- t", color: OPLD_ACCENT });
    holoTag(scaleMeter, "payload scale", 0, 0.16, 0, { css: "#2f8f5f", w: 0.32 });
    reg(hits, scaleMeter, "payload-scale");

    const ppeRack = group(g, -2.9, 0, 1.5, 0.3);
    box(ppeRack, 0.3, 0.02, 0.2, 0, 0.4, 0, 0x2b3138, { rough: 0.7 });
    const vestProp = box(ppeRack, 0.22, 0.26, 0.02, 0, 0.55, 0, OPLD_ACCENT, { rough: 0.85 });
    holoTag(vestProp, "hi-vis vest", 0, 0.2, 0, { css: "#2f8f5f", w: 0.3 });
    reg(hits, vestProp, "hi-vis-vest");
    const hatProp = group(ppeRack, 0.2, 0.62, 0);
    ball(hatProp, 0.09, 0, 0, 0, 0xf2f2f2, { rough: 0.5, seg: 12 });
    holoTag(hatProp, "hard hat", 0, 0.18, 0, { css: "#2f8f5f", w: 0.28 });
    reg(hits, hatProp, "hard-hat");

    const closingLog = group(g, -1.9, 0, 2.4, 0.4);
    slab(closingLog, 0.42, 0.32, 0.03, 0, 1.1, 0, 0x1b232b, { radius: 0.01, rough: 0.6 });
    const closingLogFace = decal(closingLog, 0.38, 0.28, 0, 1.1, 0.02,
      signFace("LOAD TICKET\nOPEN", { bg: "#11181f", accent: "#2f8f5f", scale: 0.28 }), { px: 320 });
    holoTag(closingLog, "load ticket", 0, 1.34, 0, { css: "#2f8f5f", w: 0.28 });
    reg(hits, closingLog, "closing-log");

    // Site dressing from the shared props kit.
    dumpster(g, 2.9, 0, 2.6, { ry: -0.4 });

    const dust = particles(bucket, 18, 0x9a8a6a, { size: 0.02, life: 0.6, additive: false, opacity: 0.2 });

    return {
      hits,
      footprint: 2.7,

      onInterrupt(it) {
        if (it.id === "driver-returns-to-cab") { truck.position.x -= 0.4; }
        if (it.id === "spotter-blind-drift") { spotter.position.x = -1.5; spotter.position.z = -2.1; }
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "driver-returns-to-cab") { truck.position.x += 0.4; }
        if (it.id === "spotter-blind-drift") { spotter.position.x = spotterSafe.x; spotter.position.z = spotterSafe.z; }
      },
      onStepComplete(step) {
        if (step.id === "blind-spot-map") {
          // The mapped zones read out on the tag as confirmed.
        }
        if (step.id === "barricade-zone") barrierPanels.forEach((p) => { p.visible = true; });
        if (step.id === "chock-truck") { dust.visible = false; }
        if (step.id === "shutdown-log") {
          repaint(closingLogFace, signFace("LOAD TICKET\nCLOSED", { bg: "#0f1b14", accent: "#59c97b", fg: "#bff7d4", scale: 0.28 }));
        }
      },
      onHazard(hitId) { if (hitId === "unchocked-truck") { dust.visible = true; } },

      animate(t, dt, session) {
        spotter.userData.head.rotation.y = Math.sin(t * 0.6) * 0.4;
        if (dust.visible) dust.userData.step(dt, new THREE.Vector3(0, 0.4, 0), 0.15, 0.15, -0.1);
        if (!session?.finished && (!session?.step || session.step.id !== "fill-pass")) {
          arms.rotation.x = Math.sin(t * 0.3) * 0.01;
        }

        const gg = session?.gauge;
        if (gg && !gg.committed) {
          if (session.step?.id === "backup-alarm") {
            const db = Math.round(78 + gg.t * 30);
            repaint(alarmMeter.userData.screen, signFace(`${db} dB`, {
              bg: "#0d1c24", accent: gg.t > 0.5 && gg.t < 0.72 ? "#59c97b" : "#f0645b", fg: "#bfeaf7", scale: 0.55,
            }));
          }
          if (session.step?.id === "payload-scale") {
            const tons = Math.round(28 + gg.t * 14);
            repaint(scaleMeter.userData.screen, signFace(`${tons} t`, {
              bg: "#0d1c24", accent: gg.t > 0.45 && gg.t < 0.72 ? "#59c97b" : "#f0645b", fg: "#bfeaf7", scale: 0.55,
            }));
          }
        }
      },
    };
  },
};
