import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import { box, cyl, ball, torus, group, decal, repaint, signFace, mat } from "../../../shared/kit.js";
import {
  CITY, stationPad, holoPanel, holoTag, toolChest, instrument, cone, barrierPanel,
  standingFigure, reg, surfaceTexture, texturedMat, pavingFace,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";
import { yardHustler, trailer } from "../../../shared/fleet.js";
import { gladHandGauge } from "../../../shared/toolkit.js";

// SmartCiti.X~ Yard Hostler & Pedestrian Separation VR — Maritime & Ports,
// the port and terminal operations block.
//
// A container yard lane: a marked pedestrian walkway crossing the hostler's
// own backing lane at a blind corner, a chassis staged for coupling, and a
// drop zone across the intersection. The learner is the IBT yard hostler
// driver, with a ground guide keeping the pedestrian separation the yard's
// own traffic plan requires. The terminal is generic.

const POY_ACCENT = 0x3fa9d8;
const POY_CSS = "#3fa9d8";

export const SIM_PO_YARD_HOSTLER_AND_PEDESTRIAN_SEPARATION = {
  id: "po-yard-hostler-and-pedestrian-separation",
  index: "347",
  domain: "Maritime",
  trade: "IBT yard hostler driver moving a chassis through the container yard, with a ground guide keeping pedestrian separation",
  category: "Maritime & Ports",
  weather: "overcast",
  certification: "OSHA 29 CFR 1917 marine terminals for the yard's own traffic rules, 29 CFR 1918 longshoring for the drivers and ground crew sharing the apron, 29 CFR 1910.178 powered industrial truck practice for the hostler itself, the MUTCD for the yard's marked walkways and lane striping, and Teamsters apprenticeship and yard-driver training",
  name: "Yard Hostler & Pedestrian Separation",
  title: simTitle("Yard Hostler & Pedestrian Separation VR"),
  tagline: "The lane before the next move: the yard traffic plan read for its marked walkways and blind corners, a worker spotted crossing at the blind corner before the hustler ever backs, the horn sounded, the chassis coupled and its fifth wheel locked, the air lines connected and the pressure gauged, the backing lane held clean the whole reverse, a stop held for a pedestrian at the marked crossing, the chassis spotted in the drop zone, the tally logged, the crew checked in, and the shift closed",
  accent: POY_ACCENT,
  accentCss: POY_CSS,
  parSeconds: 320,
  footprint: 3.0,
  badge: { id: "lane-held-clean", name: "Lane Held Clean", note: "Every back sounded first, the fifth wheel locked before the pull, and never a wheel moved with a pedestrian in the marked crossing" },

  supportLine: "your Teamsters local's member assistance programme",

  game: system({
    name: "Yard Lane",
    currency: "TAG",
    ranks: ["Yard Hand", "Hostler Crew", "Lane Lead", "Terminal Certified", "Yard Driver Certified"],
    badges: [
      { id: "coupled-clean", name: "Coupled Clean", note: "The fifth wheel locked and the air lines connected before the first pull", test: AWARD.stepClean("lock-fifth-wheel") },
      { id: "lane-held-steady", name: "Lane Held Steady", note: "The backing watch stayed inside the lane markers the whole reverse", test: AWARD.unbroken },
      { id: "never-a-shortcut", name: "Never a Shortcut", note: "Never backed without the horn, never the marked crossing driven through occupied, never the fifth wheel trusted unlocked", test: AWARD.safe },
    ],
    challenges: [
      { id: "clean-move", name: "Clean Move", note: "No corrections anywhere in the run", test: AWARD.clean },
      { id: "air-on-the-band", name: "Air On The Band", note: "Air pressure gauge committed inside the band first time", test: AWARD.precise(0.7) },
      { id: "move-logged-fast", name: "Move Logged Fast", note: "Tally logged inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "back-without-horn": "You started backing the hostler without sounding the horn first. The horn is the only warning anyone behind a terminal tractor gets before it moves, and backing without it is trusting that everyone in the lane already happens to be watching the wheels instead of their own work.",
    "drive-with-unlocked-fifth-wheel": "You pulled away from the chassis before confirming the fifth wheel had actually locked. A fifth wheel that only looks engaged can separate under the first hard brake or turn, and the chassis it was supposed to be carrying becomes a trailer running loose in a yard full of people on foot.",
    "cross-marked-walkway-blind": "You drove through the marked pedestrian crossing without slowing to check it first. The yard's own traffic plan put that stripe there because it is the one place drivers and people on foot are both expected to cross paths, and treating it as just more pavement is how a hostler and a longshoreman end up in the same six feet of ground.",
    "stand-in-hustler-blind-spot": "You had the ground guide stand directly behind the cab while the hostler backed instead of staying where the mirrors could see them. A terminal tractor's blind spot directly behind the cab is exactly where a ground guide standing there disappears from every mirror the driver has, which defeats the entire reason a ground guide is there.",
  },

  lateNotes: {
    "kingpin-coupling": "Nothing to couple yet — sound the horn and confirm the lane is clear before backing under the chassis.",
    "fifth-wheel-lock": "The hostler has to actually be backed under the chassis before the fifth wheel can lock onto anything.",
    "air-gauge": "Nothing to gauge yet — connect the glad hands before checking air pressure.",
  },

  steps: [
    {
      id: "read-yard-plan", kind: "select", target: "yard-plan",
      title: "Read the yard traffic plan",
      cue: "Read the plan: the marked walkways, the blind corner ahead, and the drop zone this chassis is headed for.",
      why: "The yard's own traffic plan is what turns a lane full of moving equipment and people on foot into something predictable — where the marked crossings sit, which corners are blind from the cab, and where today's chassis actually needs to end up. It is read before the engine starts, not worked out lane by lane as the shift goes.",
    },
    {
      id: "pre-trip-hustler", kind: "sequence", anyOrder: true,
      targets: ["hustler-lights", "hustler-mirrors"],
      itemNames: { "hustler-lights": "lights checked", "hustler-mirrors": "mirrors adjusted" },
      title: "Pre-trip the hostler: lights and mirrors",
      cue: "Check the hostler's lights and adjust both mirrors before pulling out of the stall.",
      why: "A hostler spends its whole shift backing in a yard full of people on foot, and mirrors that are not actually adjusted for this driver are mirrors that are quietly not covering the blind spot they are there for — checked now, in the stall, rather than discovered mid-back.",
    },
    {
      id: "spot-pedestrian-blindspot", kind: "find", noHint: true,
      targets: ["worker-at-corner"],
      itemNames: { "worker-at-corner": "worker crossing at the blind corner ahead" },
      itemNotes: { "worker-at-corner": "A longshoreman is walking toward the blind corner ahead of the lane — easy to miss from the cab until the hostler is already committed to the back, and watched until they are clear." },
      title: "Look down the lane before committing to the back",
      cue: "Look down the lane toward the blind corner for anyone on foot before backing anywhere near it.",
      why: "A blind corner is blind from the cab in exactly the direction a pedestrian is most likely to appear from, and looking for them now, with the hostler still stopped, is the only point in this move where spotting them costs nothing.",
    },
    {
      id: "sound-horn", kind: "select", target: "horn",
      title: "Sound the horn before backing",
      cue: "Sound the horn before putting the hostler in reverse.",
      why: "The horn is what tells everyone in the lane, not just the person you already spotted, that this hostler is about to move backward — sounding it before the truck is already rolling is what makes it a warning instead of a formality.",
    },
    {
      id: "couple-chassis", kind: "drag", target: "hostler-fifth-wheel",
      title: "Back the fifth wheel under the chassis kingpin",
      cue: "Back the hostler smoothly under the chassis until the fifth wheel is aligned on the kingpin.",
      why: "The fifth wheel only has one position that actually lines up with the kingpin, and backing under it slowly, watching the alignment rather than the mirrors alone, is what keeps this coupling from needing a second and third attempt with the chassis rocking further out of position each time.",
      drag: { to: "kingpin-coupling", radius: 0.5, missNote: "Not aligned on the kingpin — the fifth wheel has to back in directly under the chassis's own coupling point, not alongside it." },
    },
    {
      id: "lock-fifth-wheel", kind: "turn", target: "fifth-wheel-lock",
      title: "Confirm the fifth wheel locked",
      cue: "Turn the fifth wheel's release handle to check it is locked, not released, before pulling forward.",
      why: "A fifth wheel that has not actually latched can look coupled from the cab and separate the moment the hostler pulls forward, and checking the release handle's own position — locked, not released — is the one physical confirmation that does not depend on how the coupling looked from the mirror.",
      turn: { turns: 0.4, label: "5TH WHEEL", readout: (t) => (t < 0.4 ? "checking" : t < 0.85 ? "confirming" : "locked") },
    },
    {
      id: "verify-glad-hands", kind: "select", target: "glad-hands",
      title: "Connect the air lines",
      cue: "Connect both glad hands to the chassis before checking air pressure.",
      why: "The chassis's own brakes and lights run off the air and electrical lines this connection carries, and a chassis pulled without them connected is a chassis with no brakes of its own — running entirely on the hostler's, on wheels that are not the hostler's to stop.",
    },
    {
      id: "check-air-pressure", kind: "gauge", target: "air-gauge",
      title: "Gauge the air pressure before pulling out",
      cue: "Read the glad-hand gauge and commit the reading once it settles inside the band before moving.",
      why: "A chassis running on air pressure below the band the yard's own pre-trip calls for is a chassis whose brakes cannot be trusted at the drop zone, and reading the gauge now, before the first pull, is what catches a slow leak while the chassis is still stationary and easy to swap.",
      gauge: { label: "AIR PSI", speed: 0.65, green: [0.55, 0.78], readout: (t) => `${Math.round(t * 100)}%`, missNote: "Not settled inside the band — hold the gauge until the reading stops moving before you commit it." },
    },
    {
      id: "backing-watch", kind: "track", target: "backing-lane", seconds: 6,
      title: "Hold the lane through the backing move",
      cue: "Back the coupled chassis down the lane, keeping the reading inside the marked lane's band the whole way.",
      why: "A hostler that drifts out of its own marked lane while backing is a hostler sharing pavement with pedestrian walkways it was never supposed to enter, and holding the lane reading steady — rather than correcting only once it is already outside the markers — is what keeps this pull inside the space the yard actually planned for it.",
      track: { start: 0.5, green: [0.4, 0.62], rise: 0.3, fall: 0.28, drift: 0.14, label: "LANE", readout: (v) => (v < 0.4 ? "drifting left" : v > 0.62 ? "drifting right" : "in lane") },
      holdBreakNote: "The lane reading ran outside the markers mid-back — a hostler that drifts out of lane while reversing is exactly the situation the marked walkway beside it exists to be kept clear of.",
    },
    {
      id: "pedestrian-clearance-hold", kind: "hold", target: "marked-crossing", seconds: 5,
      title: "Hold at the marked crossing for a pedestrian",
      cue: "Stop at the marked crossing and hold until the pedestrian has fully cleared it.",
      why: "The marked crossing is the one place in this lane where the yard's own plan assumes a driver will stop for a person on foot, and holding until they are fully clear — not just past the front bumper — is what the stripe on the pavement is actually asking for.",
      holdBreakNote: "The hold broke before the pedestrian was fully clear of the marked crossing — a stop that releases early is a stop that was never really held for the person it was for.",
    },
    {
      id: "spot-chassis", kind: "drag", target: "kingpin-coupling",
      title: "Spot the chassis in the drop zone",
      cue: "Position the chassis inside the drop zone's markers before uncoupling.",
      why: "The drop zone's own markers are where the next handler expects to find this chassis, and spotting it inside them — not just somewhere close — is what keeps the next move from starting with someone hunting the yard for a trailer left slightly off its mark.",
      drag: { to: "drop-zone", radius: 0.6, missNote: "Not inside the drop zone's markers — the chassis has to be spotted fully inside the zone, not left somewhere close to it." },
    },
    {
      id: "tally-log", kind: "select", target: "yard-tally",
      title: "Log the move on the yard tally",
      cue: "Record the chassis number, the drop zone, and the air pressure reading on the yard tally.",
      why: "The yard tally is the terminal's own record of which chassis is where, and a chassis dropped but never logged is a chassis the next shift's dispatcher has to physically go find instead of reading off the board.",
    },
    {
      id: "crew-checkin", kind: "select", target: "yard-radio",
      title: "Check in with the ground guide",
      cue: "Call the ground guide: chassis dropped, tally logged, lane clear for the next move.",
      why: "The ground guide's own job depends on knowing exactly when this move is finished, and calling it in — rather than just driving off toward the next pull — is what keeps the ground guide from still watching a lane that no longer has anything moving through it.",
    },
    {
      id: "close-shift-log", kind: "select", target: "shift-log",
      title: "Close the shift log",
      cue: "Record every chassis moved today, the pedestrian hold at the crossing, and the final tally before signing off.",
      why: "The shift log is what the next driver reads before their own first move, and a blind-corner pedestrian sighting that never makes the log is a hazard the next shift finds out about only when it happens to them too.",
    },
  ],

  interrupts: [
    {
      id: "pedestrian-enters-backing-lane",
      kind: "A pedestrian steps into the backing lane mid-reverse",
      after: "backing-watch", delay: 2, seconds: 12,
      alert: "A worker has just stepped into the backing lane behind the chassis while you are still reversing.",
      cue: "Stop on the emergency horn now — the lane reading waits.",
      target: "emergency-horn",
      why: "A pedestrian in the lane behind a reversing chassis has no warning except the noise you make right now, and sounding the emergency horn and stopping is the only thing that happens fast enough to matter — the lane reading can wait the second it takes to reach for it.",
      missNote: "The backing move continued while the lane reading was corrected; the worker had to jump clear of the chassis themselves before the hostler ever stopped.",
      wrongNote: "The emergency horn — a pedestrian in the backing lane is answered by stopping immediately, not by finishing the correction already underway.",
    },
    {
      id: "cross-traffic-conflict",
      kind: "A second hostler crosses the intersection ahead",
      after: "spot-chassis", delay: 2, seconds: 12,
      alert: "A second hostler has entered the intersection ahead on a crossing path, with right of way you do not have.",
      cue: "Stop and yield at the marker — the tally log waits.",
      target: "yield-marker",
      why: "Two loaded hostlers claiming the same intersection at once is exactly what the yard's right-of-way rule exists to prevent, and yielding now, before either chassis commits further, is what keeps a blind assumption about who goes first from becoming a collision between two vehicles that both outweigh anything else in the yard.",
      missNote: "The tally was logged first while the second hostler kept closing on the intersection; both trucks ended up stopped nose to nose with neither one having yielded first.",
      wrongNote: "The yield marker — a crossing conflict is answered by stopping and yielding, not by finishing paperwork already in hand.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 3.0, POY_ACCENT);

    // -------------------------------------------------------------- yard lane
    const pad = box(g, 7.2, 0.06, 5.8, 0, 0.03, 0, 0xffffff, { rough: 0.88 });
    pad.material = texturedMat(surfaceTexture((cx, w, h) => pavingFace(cx, w, h, { tiles: 4, base: "#2f3134", base2: "#26282b", seam: "rgba(0,0,0,0.3)" }), { repeat: 5, px: 512 }), { rough: 0.88, metal: 0.02, color: 0x9aa0a6 });
    // Lane stripes.
    for (const x of [-1.2, 1.2]) box(g, 0.08, 0.01, 5.4, x, 0.061, 0, 0xe8eef2, { rough: 0.6 });
    // Marked pedestrian crossing.
    for (let i = 0; i < 4; i++) box(g, 0.9, 0.01, 0.3, -1.3 + i * 0.9, 0.062, 1.8, 0xe8eef2, { rough: 0.6 });
    holoTag(g, "marked crossing", 0, 0.3, 1.8, { css: POY_CSS, w: 0.36 });
    const crossingMarker = box(g, 2.6, 0.02, 0.4, 0, 0.07, 1.8, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, crossingMarker, "marked-crossing");
    const crossBlindHit = box(g, 2.6, 0.2, 0.4, 0, 0.15, 1.8, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "drive through blind?", 0, 0.45, 1.8, { css: "#d2312b", w: 0.44 });
    reg(hits, crossBlindHit, "cross-marked-walkway-blind");

    // ------------------------------------------------------------------ hustler
    const hustler = yardHustler(g, 0, 0, -2.0, { ry: 0, livery: { colour: 0xe8b02e, fleetName: "SMARTCITI FLEET", unitNumber: "Y-12" } });
    const parts = hustler.userData.parts ?? {};
    holoTag(hustler, "hostler cab", 0, 2.1, 0, { css: POY_CSS, w: 0.3 });
    const horn = ball(hustler, 0.03, 0.5, 1.9, 0.9, 0x8a949d, { rough: 0.4, metal: 0.6 });
    holoTag(horn, "horn", 0, 0.14, 0, { css: POY_CSS, w: 0.2 });
    reg(hits, horn, "horn");
    const emergencyHorn = ball(hustler, 0.03, -0.5, 1.9, 0.9, 0xd2312b, { rough: 0.4 });
    holoTag(emergencyHorn, "emergency horn", 0, 0.14, 0, { css: POY_CSS, w: 0.3 });
    reg(hits, emergencyHorn, "emergency-horn");
    const lockLever = box(hustler, 0.04, 0.06, 0.02, 0, 0.5, 1.2, 0x2b2b30, { rough: 0.5 });
    reg(hits, lockLever, "fifth-wheel-lock");
    const driveUnlockedHit = box(g, 0.3, 0.2, 0.3, 0.4, 0.6, -1.0, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "drive off unlocked?", 0.4, 0.9, -1.0, { css: "#d2312b", w: 0.44 });
    reg(hits, driveUnlockedHit, "drive-with-unlocked-fifth-wheel");
    reg(hits, parts.lights ?? hustler, "hustler-lights");
    reg(hits, parts.mirrorL ?? hustler, "hustler-mirrors");
    reg(hits, parts.fifthWheel ?? hustler, "hostler-fifth-wheel");

    // -------------------------------------------------------------------- chassis
    const chassis = trailer(g, 0, 0, 0.6, { kind: "flatbed", ry: 0 });
    holoTag(chassis, "chassis", 0, 1.7, 0, { css: POY_CSS, w: 0.24 });
    reg(hits, chassis, "kingpin-coupling");
    const gladHands = chassis.userData.parts?.gladHands;
    reg(hits, gladHands?.[0] ?? chassis, "glad-hands");
    const airGauge = gladHandGauge(g, 0.7, 0.9, 0.6, { ry: -0.4 });
    holoTag(airGauge, "air gauge", 0, 0.14, 0, { css: POY_CSS, w: 0.24 });
    reg(hits, airGauge, "air-gauge");

    // -------------------------------------------------------------------- corner
    const worker = standingFigure(g, 2.6, 2.6, { ry: -2.3, cloth: 0x3a5a7a, vest: 0xd8f23a });
    holoTag(worker, "blind corner", 0, 1.95, 0, { css: "#d2312b", w: 0.32 });
    reg(hits, worker, "worker-at-corner");
    const blindSpotHit = box(g, 0.5, 0.4, 0.4, 0, 0.4, -1.3, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "stand in the blind spot?", 0, 0.85, -1.3, { css: "#d2312b", w: 0.5 });
    reg(hits, blindSpotHit, "stand-in-hustler-blind-spot");

    // -------------------------------------------------------------------- lane
    const laneGauge = instrument(g, 1.8, 0.9, -0.6, { ry: -0.4, idle: "-- %", color: POY_ACCENT, w: 0.1, d: 0.14 });
    holoTag(laneGauge, "lane watch", 0, 0.18, 0, { css: POY_CSS, w: 0.26 });
    reg(hits, laneGauge, "backing-lane");

    // -------------------------------------------------------------------- yield
    const yieldMarker = torus(g, 0.32, 0.012, 3.0, 0.02, 2.4, POY_ACCENT, { emissive: POY_ACCENT, ei: 1.4, rough: 0.4, cast: false, seg: 6, seg2: 24 });
    yieldMarker.rotation.x = Math.PI / 2;
    holoTag(g, "yield point", 3.0, 0.4, 2.4, { css: POY_CSS, w: 0.28 });
    reg(hits, yieldMarker, "yield-marker");

    // -------------------------------------------------------------------- drop zone
    const dropZone = group(g, 3.4, 0, -0.6);
    box(dropZone, 1.6, 0.02, 1.6, 0, 0.01, 0, POY_ACCENT, { rough: 0.75, opacity: 0.4, transparent: true });
    holoTag(dropZone, "drop zone", 0, 0.4, 0, { css: POY_CSS, w: 0.28 });
    reg(hits, dropZone, "drop-zone");

    // -------------------------------------------------------------------- boards
    const plan = holoPanel(g, 0.95, 0.66, -3.2, 1.35, -1.6, (cx, w, h) => {
      cx.fillStyle = "#08131c"; cx.fillRect(0, 0, w, h); cx.fillStyle = POY_CSS; cx.fillRect(0, 0, w, 6);
      cx.font = `600 ${Math.round(h * 0.1)}px 'Barlow Condensed', Arial, sans-serif`; cx.textAlign = "left"; cx.textBaseline = "middle";
      cx.fillStyle = "#dff0fa"; cx.fillText("YARD TRAFFIC PLAN", w * 0.05, h * 0.12);
      cx.font = `${Math.round(h * 0.066)}px Arial, sans-serif`; cx.fillStyle = "#eef7ff";
      ["Marked crossing at the blind corner", "Horn before every back",
        "Fifth wheel confirmed before pulling", "Air pressure band before moving",
        "Yield at the marked intersection", "Log every chassis moved"].forEach((l, i) => cx.fillText(l, w * 0.05, h * (0.27 + i * 0.12)));
    }, { ry: 0.4, accent: POY_ACCENT });
    reg(hits, plan, "yard-plan");

    const tally = holoPanel(g, 0.6, 0.42, -2.4, 1.3, 2.4, (cx, w, h) => {
      cx.fillStyle = "#08131c"; cx.fillRect(0, 0, w, h); cx.fillStyle = POY_CSS; cx.fillRect(0, 0, w, 6);
      cx.font = `600 ${Math.round(h * 0.12)}px 'Barlow Condensed', Arial, sans-serif`; cx.textAlign = "left"; cx.textBaseline = "middle";
      cx.fillStyle = "#dff0fa"; cx.fillText("YARD TALLY", w * 0.06, h * 0.16);
      cx.font = `${Math.round(h * 0.09)}px Arial, sans-serif`; cx.fillStyle = "#eef7ff";
      ["Chassis: —", "Drop zone: —", "Air: —"].forEach((l, i) => cx.fillText(l, w * 0.06, h * (0.4 + i * 0.18)));
    }, { ry: -0.9, accent: POY_ACCENT });
    reg(hits, tally, "yard-tally");

    const log = holoPanel(g, 0.6, 0.42, -3.0, 1.3, 0.4, (cx, w, h) => {
      cx.fillStyle = "#08131c"; cx.fillRect(0, 0, w, h); cx.fillStyle = POY_CSS; cx.fillRect(0, 0, w, 6);
      cx.font = `600 ${Math.round(h * 0.12)}px 'Barlow Condensed', Arial, sans-serif`; cx.textAlign = "left"; cx.textBaseline = "middle";
      cx.fillStyle = "#dff0fa"; cx.fillText("SHIFT LOG", w * 0.06, h * 0.16);
      cx.font = `${Math.round(h * 0.09)}px Arial, sans-serif`; cx.fillStyle = "#eef7ff";
      ["Moves: —", "Pedestrian hold: —", "Tally: —"].forEach((l, i) => cx.fillText(l, w * 0.06, h * (0.4 + i * 0.18)));
    }, { ry: 0.4, accent: POY_ACCENT });
    reg(hits, log, "shift-log");

    // -------------------------------------------------------------------- radio
    const chest = toolChest(g, -3.3, -1.6, { ry: 0.5, color: 0x2b3138 });
    const radio = instrument(chest, -0.12, 0.79, 0.02, { ry: 0.2, idle: "CH 9 · GUIDE", color: POY_ACCENT, w: 0.1, d: 0.16 });
    holoTag(radio, "yard radio", 0, 0.16, 0, { css: POY_CSS, w: 0.28 });
    reg(hits, radio, "yard-radio");

    // -------------------------------------------------------------------- perimeter
    cone(g, -3.6, -2.6); cone(g, 3.6, -2.6);
    barrierPanel(g, 0, -2.7, { color: 0xf2c14b, w: 5.0 });

    // -------------------------------------------------------------------- crew
    const groundGuide = standingFigure(g, -1.8, -1.0, { ry: 1.6, cloth: 0x2b3138, vest: POY_ACCENT, helmet: 0xf2f2f2 });
    holoTag(groundGuide, "ground guide", 0, 1.95, 0, { css: POY_CSS, w: 0.3 });

    return {
      hits,
      spawnLook: new THREE.Vector3(0.2, 1.0, -1.2),
      onStep() {},
      onStepComplete(step) {
        if (step.id === "check-air-pressure" && airGauge.userData.show) airGauge.userData.show(72);
        if (step.id === "spot-chassis") {
          repaint(tally.userData.face, (cx, w, h) => {
            cx.fillStyle = "#08131c"; cx.fillRect(0, 0, w, h); cx.fillStyle = "#59c97b"; cx.fillRect(0, 0, w, 6);
            cx.font = `600 ${Math.round(h * 0.12)}px 'Barlow Condensed', Arial, sans-serif`; cx.textAlign = "left"; cx.textBaseline = "middle";
            cx.fillStyle = "#dff0fa"; cx.fillText("YARD TALLY", w * 0.06, h * 0.16);
            cx.font = `${Math.round(h * 0.085)}px Arial, sans-serif`; cx.fillStyle = "#e0ffe8";
            ["Chassis: C-204", "Drop zone: spotted", "Air: in band"].forEach((l, i) => cx.fillText(l, w * 0.06, h * (0.4 + i * 0.18)));
          });
        }
        if (step.id === "crew-checkin") repaint(radio.userData.screen, signFace("LANE CLEAR", { bg: "#0d1c24", accent: "#59c97b", fg: "#bfeaf7", scale: 0.42 }));
        if (step.id === "close-shift-log") {
          repaint(log.userData.face, (cx, w, h) => {
            cx.fillStyle = "#08131c"; cx.fillRect(0, 0, w, h); cx.fillStyle = "#59c97b"; cx.fillRect(0, 0, w, 6);
            cx.font = `600 ${Math.round(h * 0.12)}px 'Barlow Condensed', Arial, sans-serif`; cx.textAlign = "left"; cx.textBaseline = "middle";
            cx.fillStyle = "#dff0fa"; cx.fillText("SHIFT LOG", w * 0.06, h * 0.16);
            cx.font = `${Math.round(h * 0.085)}px Arial, sans-serif`; cx.fillStyle = "#e0ffe8";
            ["Moves: logged", "Pedestrian hold: held clean", "Tally: closed"].forEach((l, i) => cx.fillText(l, w * 0.06, h * (0.4 + i * 0.18)));
          });
        }
      },
      onHazard() {},
      onInterrupt(it) {
        if (it.id === "pedestrian-enters-backing-lane") emergencyHorn.material = mat(0xf0645b, { emissive: 0xf0645b, ei: 2.4, rough: 0.4 });
        if (it.id === "cross-traffic-conflict") yieldMarker.material = mat(0xf0645b, { emissive: 0xf0645b, ei: 2.0, rough: 0.4 });
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "pedestrian-enters-backing-lane") emergencyHorn.material = mat(0xd2312b, { rough: 0.4 });
        if (it.id === "cross-traffic-conflict") yieldMarker.material = mat(POY_ACCENT, { emissive: POY_ACCENT, ei: 1.4, rough: 0.4 });
      },
      animate(t, dt, session) {
        const step = session?.step;
        if (session?.turn && step?.id === "lock-fifth-wheel") lockLever.rotation.x = session.turn.amount * Math.PI * 0.5;
        const gg = session?.gauge;
        if (gg && !gg.committed && step?.id === "check-air-pressure" && airGauge.userData.show) airGauge.userData.show(`${Math.round(gg.t * 100)}`);
        if (step?.id === "backing-watch" && session.holding) repaint(laneGauge.userData.screen, signFace(`${Math.round(session.track.v * 100)}`, { bg: "#0d1c24", accent: session.track.v >= 0.4 && session.track.v <= 0.62 ? "#59c97b" : "#f2ae14", fg: "#bfeaf7", scale: 0.55 }));
        void dt; void t; void CITY;
      },
    };
  },
};
