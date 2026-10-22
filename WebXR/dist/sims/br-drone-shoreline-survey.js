import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import { box, cyl, ball, group, repaint, mat, particles, signFace } from "../../../shared/kit.js";
import {
  stationPad, holoPanel, holoTag, standingFigure, instrument, reg, cone,
  surfaceTexture, texturedMat, mudflatFace, waterFace,
} from "../citykit.js";
import { skiff } from "../../../shared/fleet.js";
import { radio } from "../../../shared/toolkit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Drone Shoreline Survey VR — SF Bay Restoration & Cleanup,
// Pack E (ecology, monitoring and community science).
//
// A restoration bench where the mudflat is exposed at low tide, and the
// learner is the FAA Part 107 remote pilot in command flying a shoreline
// survey line to document the bench for the restoration record, with a
// visual observer at their shoulder and a beached skiff — the fleet.js
// builder — that brought the crew out to this stretch of shore. The
// airspace check is answered only "per the authorisation" the pilot holds
// for today's flight, the way the dive stations read the dive plan rather
// than stating a number, and the buffer the survey line has to keep from
// the nesting birds working the pickleweed at the bench's edge is likewise
// never a distance stated here — it is "per the permit", read off the same
// buffer board the compliance biologist elsewhere in this pack reads.

const BRDN_ACCENT = 0x4fb8e0;
const BRDN_CSS = "#4fb8e0";
const BRDN_GREEN = 0x59c97b;
const BRDN_AMBER = 0xe8b02e;
const BRDN_RED = 0xd2312b;

export const SIM_BR_DRONE_SHORELINE_SURVEY = {
  id: "br-drone-shoreline-survey",
  index: "345",
  domain: "Environmental Monitoring",
  trade: "FAA Part 107 remote pilot in command, flying a restoration bench's shoreline survey line with a visual observer beside them",
  category: "Environmental Monitoring",
  district: "Environmental Monitoring",
  weather: "wind",
  certification: "FAA 14 CFR Part 107 small unmanned aircraft systems rule and today's LAANC airspace authorization; U.S. Fish and Wildlife Service (USFWS) Endangered Species Act buffer conditions for the nesting birds at the bench's edge; San Francisco Bay Conservation and Development Commission (BCDC) Bay Plan permit conditions for the survey; NOAA tide predictions the flight window is timed against; Regional Water Quality Control Board (RWQCB) monitoring conditions requiring a photographic record of the restoration bench",
  name: "Drone Shoreline Survey",
  title: simTitle("Drone Shoreline Survey"),
  tagline: "The survey a restoration record is built from: the airspace authorization read before anything is unpacked, the gear checked for a cracked prop or a swollen cell, the compass calibrated, the bird buffer confirmed and marked, the survey line flown clean end to end, a wind gust answered with an immediate return home, the battery landed inside its reserve band and every pass logged the way the permit requires",
  accent: BRDN_ACCENT,
  accentCss: BRDN_CSS,
  parSeconds: 300,
  footprint: 3.0,
  badge: { id: "clean-line-clean-log", name: "Clean Line, Clean Log", note: "The airspace was checked before launch, the buffer was held the whole line, the gust got an immediate return home, and the battery landed inside its reserve band" },

  supportLine: "your agency's employee assistance programme, with the FAA's own drone safety team behind it",

  game: system({
    name: "Shoreline Survey Watch",
    currency: "PASSES",
    ranks: ["Ground Crew", "Observer Pilot", "Line Pilot", "Senior Pilot", "Shoreline Survey Certified"],
    badges: [
      { id: "true-compass", name: "True Compass", note: "The compass calibrated and the checklist run clean before the first launch", test: AWARD.stepClean("compass-dial") },
      { id: "clean-flight", name: "Clean Flight", note: "Never skipped the airspace check, never crossed the buffer, never flew past reserve", test: AWARD.safe },
      { id: "held-the-reserve", name: "Held The Reserve", note: "Landed the battery inside the correct reserve band, first time", test: AWARD.precise(0.7) },
    ],
    challenges: [
      { id: "clean-line", name: "Clean Line", note: "No corrections across the whole survey", test: AWARD.clean },
      { id: "steady-line", name: "Steady Line", note: "Held the survey line in band the whole pass", test: AWARD.unbroken },
      { id: "logged-fast", name: "Logged Fast", note: "Survey closed out inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "skip-airspace-check": "You spun the props up without ever reading today's airspace authorization board. A LAANC authorization is good for the airspace, the altitude ceiling and the time window it was actually issued for, and a flight launched on yesterday's assumption instead of today's authorization is a flight with no authorization behind it at all, whatever the aircraft itself is capable of.",
    "fly-over-buffer": "You flew the survey line straight over the flagged buffer for a closer shot of the bench. The buffer exists so the nesting birds at the bench's edge are never disturbed by a low-flying aircraft, and a drone passing directly overhead reads to a nesting bird as a predator, not a survey tool — the closer shot is never worth the flush it can cause.",
    "handheld-launch-over-crowd": "You launched by hand-catching the aircraft up over the heads of the people on the beach instead of clearing the pad first. A prop strike close to a bystander's face is the single most common way a drone actually hurts someone, and the pad exists so nobody has to be under the aircraft while the props are live — clear it before spin-up, every time, not just when someone happens to be looking.",
    "chase-battery-critical": "You kept flying past the reserve to finish one more pass instead of landing. A battery that reads critical is a battery close to a voltage the aircraft cannot fly on at all, and the difference between landing on the reserve and losing the aircraft over open water is entirely in whether the pilot lands on the gauge's word or on their own wish to finish the line.",
  },

  lateNotes: {
    "battery-gauge": "Nothing to read yet — the aircraft has to actually be airborne and burning the battery before there is a reserve to watch.",
    "survey-log": "Nothing to log yet — the line hasn't been flown and nothing has happened worth an entry.",
  },

  interrupts: [
    {
      id: "dog-walker-on-pad",
      kind: "Dog walker wanders onto the launch pad",
      after: "preflight-checklist", delay: 2, seconds: 14,
      alert: "A dog walker has wandered straight onto the launch pad while the props are about to go live.",
      cue: "Hail them off the pad with the loudhailer before spin-up — do not launch with anyone standing on it.",
      target: "hailer",
      why: "A pad with someone standing on it is a pad the props cannot spin up over, and a bystander with headphones in and a dog on a long leash is not going to notice a small aircraft on their own — the loudhailer is what actually reaches them before anyone reaches for the throttle.",
      missNote: "Nobody hailed the dog walker off, and they stayed standing on the pad while the aircraft was about to launch.",
      wrongNote: "The loudhailer — that's the one thing on this bench that reaches a bystander who isn't watching the pad.",
    },
    {
      id: "wind-gust-exceeds-limit",
      kind: "A gust pushes windspeed over today's limit mid-line",
      after: "survey-flyline", delay: 2, seconds: 14,
      alert: "A gust has pushed windspeed over the limit set in today's authorization while the aircraft is mid-line.",
      cue: "Abort the line and bring the aircraft home immediately on the return-to-home control — do not try to finish the pass first.",
      target: "rth-control",
      why: "The wind limit in the authorization is set to what the aircraft can actually be flown safely in, not to what it can technically stay airborne in, and a gust over that limit mid-line is the exact moment the aircraft becomes hardest to control — the return-to-home control is what gets it back over solid, known ground instead of drifting further out over open water while the pilot tries to finish one more frame.",
      missNote: "The aircraft kept flying the line through the gust instead of coming home — exactly the moment the wind limit exists to catch.",
      wrongNote: "The return-to-home control — that's the one input that brings it back over the pad on its own, gust or no gust.",
    },
  ],

  steps: [
    {
      id: "ppe-brief", kind: "sequence", anyOrder: true,
      targets: ["hi-vis-vest", "boots-on", "vo-radio-power"],
      itemNames: { "hi-vis-vest": "hi-vis vest on", "boots-on": "boots on for the mud", "vo-radio-power": "visual observer's radio powered on" },
      title: "Gear up before walking onto the flat",
      cue: "Before stepping onto the exposed mudflat: hi-vis vest on, boots on, the visual observer's radio powered on.",
      why: "The mudflat reads solid until a boot is already in a soft patch, and the hi-vis vest is what keeps a beach walker glancing over from mistaking the pilot's own silhouette for just another person on the sand rather than someone running a flight — the observer's radio has to be live before either of them is any use to the other.",
    },
    {
      id: "ops-board", kind: "select", target: "ops-board",
      title: "Read today's airspace authorization and weather board",
      cue: "Read the ops board: today's airspace authorization, the wind limit it was issued against, and any NOTAM for this stretch of shoreline.",
      why: "A LAANC authorization is good for today's airspace, today's altitude ceiling and today's wind limit, not for whatever the pilot remembers from the last flight here, and reading the board before a single case is opened is what keeps the flight that follows actually inside the authorization it claims to be flying under.",
    },
    {
      id: "check-gear", kind: "find", noHint: true,
      targets: ["cracked-prop", "swollen-battery"],
      itemNames: { "cracked-prop": "a propeller, hairline-cracked at the hub", "swollen-battery": "a battery, swollen in its case" },
      itemNotes: {
        "cracked-prop": "A hairline crack at the hub won't show until the prop is spinning at speed — found now, on the bench, it costs a swap; found mid-flight it costs the aircraft.",
        "swollen-battery": "A swollen cell is a battery already failing, and one that goes into the aircraft is one the flight is now betting on — pull it before it goes anywhere near the case.",
      },
      title: "Check the gear case before anything is loaded",
      cue: "Go through the gear case and find anything wrong with it before loading a battery or a prop onto the aircraft.",
      why: "A cracked prop or a swelling cell is exactly the kind of fault a rushed pilot never actually looks for until the aircraft is already assembled, and finding both now, on the bench with nothing spinning yet, costs nothing — finding either one in the air costs the aircraft and whatever it comes down on.",
    },
    {
      id: "compass-dial", kind: "turn", target: "compass-dial",
      title: "Calibrate the compass before the first launch",
      cue: "Turn the aircraft through the compass calibration sequence on the controller before today's first launch.",
      turn: { turns: 0.6, label: "COMPASS CAL" },
      why: "An aircraft flying on an uncalibrated compass drifts against its own heading the moment it's away from the controller's line of sight, and a compass calibrated once at home and never again out here is a compass that has already picked up whatever metal is on this bench — calibrating fresh, on site, is what keeps the survey line actually straight.",
    },
    {
      id: "preflight-checklist", kind: "sequence",
      targets: ["battery-seated", "controller-paired", "home-point-set"],
      itemNames: { "battery-seated": "battery seated and latched", "controller-paired": "controller paired to the aircraft", "home-point-set": "home point set to the pad" },
      outOfOrderNote: "Seat the battery before pairing the controller — there's nothing for the controller to pair with until the aircraft is actually powered.",
      title: "Run the preflight checklist in order",
      cue: "Seat and latch the battery, pair the controller to the aircraft, then set the home point to the pad — in that order.",
      why: "A home point set before the battery is even seated is a home point set to nothing, and an aircraft that loses its link mid-flight with no home point saved is an aircraft with no return-to-home to fall back on — the order here isn't a formality, it's what makes every later step actually mean something.",
    },
    {
      id: "buffer-board", kind: "select", target: "buffer-board",
      title: "Read the bird buffer plan for this bench",
      cue: "Read the buffer plan: the buffer distance the survey line has to hold from the nest per the permit, and where today's flagged line actually runs.",
      why: "The buffer distance is set in the same Endangered Species Act consultation the compliance biologist's own buffer line is measured against, not decided by the pilot from the cockpit view, and reading the plan before the marker goes down is what keeps the flight path that gets flown next matched to the same line the ground crew already flagged.",
    },
    {
      id: "set-buffer-marker", kind: "drag", target: "marker-cone",
      title: "Set the ground marker at the confirmed buffer point",
      cue: "Drag the marker cone out to the point the buffer plan confirmed — not short of it, and not past it either.",
      why: "The ground marker is what lets the pilot hold the survey line by eye against a fixed point on the bench instead of guessing at a line that only exists on a board, and a marker set short of the confirmed point pulls the whole flown line closer to the nest than the permit allows before the aircraft has even left the pad.",
      drag: { to: "buffer-marker-socket", radius: 0.4, missNote: "Not at the confirmed point — the marker has to land where the buffer plan actually put it, not somewhere that looks close enough." },
    },
    {
      id: "launch-authorization", kind: "select", target: "vo-radio",
      title: "Get the visual observer's clearance to launch",
      cue: "Call the visual observer: pad clear, buffer marked, cleared to launch — and wait to hear it back.",
      why: "The visual observer is the second set of eyes on the pad and the sky the whole flight depends on, and a launch that happens before that clearance actually comes back is a launch the observer was never really watching for, which defeats the entire reason a Part 107 crew flies with one.",
    },
    {
      id: "survey-flyline", kind: "track", target: "drone-body", seconds: 6,
      title: "Fly the survey line down the bench",
      cue: "Hold the aircraft on the survey line down the length of the bench, on the near side of the buffer marker the whole way.",
      track: { start: 0.14, green: [0.4, 0.6], rise: 0.5, fall: 0.42, drift: 0.13, label: "SURVEY LINE", readout: (v) => (v < 0.4 ? "too far — line drifting toward the water" : v > 0.6 ? "too close — line drifting toward the buffer" : "line held clean") },
      why: "The survey line is what turns today's flight into a record the restoration project can actually compare bench to bench and year to year, and a line that drifts toward the buffer on one pass and away from it on the next is a set of photos nobody downstream can line up against last season's — the line is flown once, and it is flown straight.",
      holdBreakNote: "The line drifted off band before the pass finished — steady the aircraft and pick the line back up.",
    },
    {
      id: "hold-hover-photo", kind: "hold", target: "drone-body", seconds: 5,
      title: "Hold the hover for the erosion-mark photo",
      cue: "Hold the aircraft steady in the hover over the erosion mark while the frame is captured — the photo is only useful sharp.",
      why: "A hover that drifts during the exposure is a blurred frame the restoration record can't actually use to compare this year's erosion line against last year's, and the whole point of flying this pass rather than shooting from the ground is a vantage the ground crew doesn't have — wasting it on a shaky frame throws that vantage away.",
      holdBreakNote: "The hover broke before the frame was captured — steady the aircraft and hold it through the shot.",
    },
    {
      id: "battery-gauge", kind: "gauge", target: "battery-gauge",
      title: "Watch the reserve and land inside the band",
      cue: "Watch the battery gauge and bring the aircraft in to land once it reads inside the reserve band — not before it, and not past it either.",
      gauge: { label: "BATTERY RESERVE", speed: 0.55, green: [0.46, 0.64], readout: (t) => (t < 0.46 ? "too early — reserve still healthy, more line to fly" : t <= 0.64 ? "inside the reserve band — land now" : "past the reserve — land immediately"), missNote: "Off the band. The reserve the checklist sets has to actually be read and landed on, not guessed at." },
      why: "Landing well before the reserve wastes flight time the survey doesn't have to spare, and landing past it is exactly how an aircraft ends up in the water short of the pad — the reserve band is the one number on this flight that isn't a judgement call, it's what the battery itself is telling the pilot to do.",
    },
    {
      id: "survey-log", kind: "select", target: "survey-log",
      title: "Log the pass",
      cue: "Log the pass: the line flown, the frames captured, the buffer held, and the battery landed inside reserve.",
      why: "The restoration project's own photographic record is built entirely out of entries like this one, and a pass logged right after landing — while the exact line and the exact frame count are still what actually happened, not what gets remembered back at the truck — is the version of today's flight that can actually stand behind next season's comparison.",
    },
    {
      id: "postflight-shutdown", kind: "sequence",
      targets: ["props-confirmed-stopped", "battery-removed"],
      itemNames: { "props-confirmed-stopped": "props confirmed fully stopped", "battery-removed": "battery removed and stowed" },
      outOfOrderNote: "Confirm the props are fully stopped before reaching for the battery — a hand near a prop that's still spinning down is a hand near a prop that's still spinning.",
      title: "Shut the aircraft down in order",
      cue: "Confirm the props are fully stopped, then remove the battery and stow it.",
      why: "A prop that looks stopped can still be coasting for another second or two, and the battery is the one thing on this aircraft that keeps every system live until it's actually out — pulling it only after the props are confirmed still is what keeps the shutdown as uneventful as the rest of the flight.",
    },
    {
      id: "crew-checkin", kind: "select", target: "vo-radio",
      title: "Check in with the visual observer",
      cue: "On the working channel: the survey is complete, the gust and the dog walker are both handled, and how the observer is doing after a flight with two interruptions in it.",
      why: "A flight with a gust and a bystander both in it is a flight the observer spent watching two things at once, and the check-in is where that gets acknowledged directly rather than assumed — it's also where the pilot's own read on a tense flight gets a place to go besides staying with them at the controller.",
    },
    {
      id: "closing-log", kind: "select", target: "survey-log",
      title: "Close out the flight log",
      cue: "Close the log: total flight time, the interruptions and how they were handled, the buffer held, and the aircraft secured.",
      why: "The closing entry is what turns today's individual frames and holds into the record the airspace authorization and the buffer plan are both actually reviewed against — a log closed out completely, in order, is the difference between a survey programme that renews on the strength of its own record and one that raises a question nobody on this bench can answer months later.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 3.0, BRDN_ACCENT);

    // -------------------------------------------------------- the mud bench
    const marshTex = surfaceTexture((cx, w, h) => mudflatFace(cx, w, h, { base: "#4a5636", base2: "#3a4529" }), { repeat: 3, px: 256 });
    const bench = box(g, 20, 0.06, 16, 0, 0.03, -2, 0x4a5636, { rough: 0.95 });
    bench.material = texturedMat(marshTex, { rough: 0.95, color: 0x8a9a68 });

    // ------------------------------------------------------------ the water
    const water = box(g, 22, 0.02, 8, 0, 0.05, -13, 0xffffff, { rough: 0.14, metal: 0.22, cast: false });
    water.material = texturedMat(surfaceTexture((cx, w, h) => waterFace(cx, w, h, { base: "#12303e", mid: "#1a4050", crest: 260 }), { repeat: 4, px: 512 }), { rough: 0.14, metal: 0.22, color: 0xa2c4d8 });
    const wave = particles(g, 14, 0xbfe6f2, { size: 0.03, life: 0.9, additive: false, opacity: 0.28 });
    wave.position.set(0, 0.06, -13);

    // ------------------------------------------------------ grass clumps
    function grassClump(parent, x, z, o = {}) {
      const c = group(parent, x, o.y ?? 0.03, z, Math.random() * Math.PI);
      const n = o.n ?? 7, tone = o.tone ?? 0x5d7a3a;
      for (let i = 0; i < n; i++) {
        const a = (i / n) * Math.PI * 2, r = 0.05 + Math.random() * (o.spread ?? 0.14), hh = (o.h ?? 0.2) + Math.random() * 0.1;
        box(c, 0.02, hh, 0.008, Math.cos(a) * r, hh / 2, Math.sin(a) * r, tone, { rough: 0.9, cast: false }).rotation.z = (Math.random() - 0.5) * 0.35;
      }
      return c;
    }
    for (let i = 0; i < 8; i++) grassClump(g, (Math.random() - 0.5) * 8, -5 + Math.random() * 4, { n: 6, h: 0.18, tone: 0x5d7a3a });

    // -------------------------------------------------------- the skiff, beached
    const sk = skiff(g, -6.2, 0, 4.0, { ry: 1.7, livery: { fleetName: "BAY MONITOR", unitNumber: "MM-2" } });
    holoTag(sk, "monitor's skiff — beached", 0, 1.3, 0, { css: BRDN_CSS, w: 0.42 });

    // ---------------------------------------------------- crew: the observer
    const observer = standingFigure(g, 1.1, 1.6, { ry: -2.4, cloth: 0x3f4a55, vest: 0xe8b02e, helmet: false, cap: 0x2b3138, gloves: true, atStation: true });
    holoTag(observer, "visual observer", 0, 1.95, 0, { css: BRDN_CSS, w: 0.32 });

    // ------------------------------------------------------------ launch pad
    const padCenter = new THREE.Vector3(0, 0, 1.1);
    for (let i = 0; i < 4; i++) {
      const a = (i / 4) * Math.PI * 2 + Math.PI / 4;
      cone(g, padCenter.x + Math.cos(a) * 0.9, padCenter.z + Math.sin(a) * 0.9, { color: BRDN_AMBER });
    }
    const padDisc = cyl(g, 0.75, 0.75, 0.015, padCenter.x, 0.02, padCenter.z, 0x2b3138, { rough: 0.7, seg: 24 });
    void padDisc;

    // ---------------------------------------------------------------- the drone
    const droneGrp = group(g, padCenter.x, 0.32, padCenter.z);
    const droneBody = box(droneGrp, 0.22, 0.07, 0.22, 0, 0, 0, 0x22262b, { rough: 0.4, metal: 0.4 });
    const gimbal = ball(droneGrp, 0.05, 0, -0.05, 0.13, 0x1b1e23, { rough: 0.35, metal: 0.3, seg: 12 });
    void gimbal;
    const beacon = ball(droneGrp, 0.02, 0, 0.05, 0, BRDN_GREEN, { emissive: BRDN_GREEN, ei: 2.2, seg: 10 });
    const arms = [];
    for (const [ax, az] of [[0.28, 0.28], [-0.28, 0.28], [0.28, -0.28], [-0.28, -0.28]]) {
      const arm = group(droneGrp, ax * 0.55, 0.01, az * 0.55);
      cyl(arm, 0.012, 0.012, 0.32, 0, 0, 0, 0x3a4048, { rough: 0.5, metal: 0.5, seg: 8 }).rotation.z = Math.atan2(ax, az);
      const motor = cyl(arm, 0.025, 0.03, 0.03, ax * 0.28, 0.02, az * 0.28, 0x1b1e23, { rough: 0.4, metal: 0.5, seg: 10 });
      void motor;
      const prop = box(arm, 0.22, 0.006, 0.02, ax * 0.28, 0.045, az * 0.28, 0x8a949d, { rough: 0.4, metal: 0.3, cast: false });
      arms.push(prop);
    }
    for (const [lx, lz] of [[0.1, 0.1], [-0.1, 0.1]]) {
      const skid = box(droneGrp, 0.014, 0.05, 0.014, lx, -0.05, lz, 0x2b3138, { rough: 0.6 });
      void skid;
    }
    holoTag(droneGrp, "survey aircraft", 0, 0.32, 0, { css: BRDN_CSS, w: 0.32 });
    reg(hits, droneBody, "drone-body");
    const droneHome = droneGrp.position.clone();

    // ---------------------------------------------------------------- gear case
    const caseGrp = group(g, 1.6, 0.05, 1.9, 0.4);
    box(caseGrp, 0.5, 0.16, 0.36, 0, 0.08, 0, 0x2b3138, { rough: 0.55, metal: 0.3 });
    box(caseGrp, 0.46, 0.02, 0.32, 0, 0.17, 0, 0x8a949d, { rough: 0.4, metal: 0.4 });
    holoTag(caseGrp, "gear case", 0, 0.3, 0, { css: BRDN_CSS, w: 0.28 });
    const crackedProp = box(caseGrp, 0.2, 0.006, 0.02, -0.12, 0.19, 0, 0xc8ced4, { rough: 0.4, cast: false });
    reg(hits, crackedProp, "cracked-prop");
    const swollenBattery = box(caseGrp, 0.1, 0.05, 0.16, 0.12, 0.2, 0, 0x3a4048, { rough: 0.5, metal: 0.4 });
    swollenBattery.scale.set(1.12, 1.18, 1.1);
    reg(hits, swollenBattery, "swollen-battery");

    // ----------------------------------------------------------- controller
    const controller = instrument(g, -1.2, 0.86, 1.9, { color: 0x2b3138, idle: "READY", w: 0.16, d: 0.22 });
    const compassDial = cyl(controller, 0.022, 0.022, 0.025, -0.03, 0.03, 0.06, 0xc8ced4, { rough: 0.4, seg: 10 });
    compassDial.rotation.x = Math.PI / 2;
    holoTag(controller, "controller — compass cal", 0, 0.2, 0.06, { css: BRDN_CSS, w: 0.4 });
    reg(hits, controller, "compass-dial");

    const homePointStake = group(g, -1.0, 0.05, 2.15);
    box(homePointStake, 0.1, 0.01, 0.1, 0, 0, 0, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, homePointStake, "home-point-set");
    const batterySeatMarker = group(g, -1.4, 0.86, 2.05);
    box(batterySeatMarker, 0.1, 0.02, 0.1, 0, 0, 0, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, batterySeatMarker, "battery-seated");
    const pairMarker = group(g, -1.4, 0.86, 1.75);
    box(pairMarker, 0.1, 0.02, 0.1, 0, 0, 0, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, pairMarker, "controller-paired");

    // ---------------------------------------------------------------- boards
    const opsBoard = holoPanel(g, 0.94, 0.62, -1.9, 1.65, -0.85, (cx, w, h) => {
      cx.fillStyle = "#0d1c24"; cx.fillRect(0, 0, w, h); cx.fillStyle = BRDN_CSS; cx.fillRect(0, 0, w, 6);
      cx.font = `600 ${Math.round(h * 0.095)}px 'Barlow Condensed', Arial, sans-serif`; cx.textAlign = "left"; cx.textBaseline = "middle";
      cx.fillStyle = "#eaf6fb"; cx.fillText("AIRSPACE & WEATHER — TODAY", w * 0.05, h * 0.12);
      cx.font = `${Math.round(h * 0.07)}px Arial, sans-serif`; cx.fillStyle = "#dcecf2";
      ["Airspace authorization: per today's LAANC", "Altitude ceiling: per the authorisation", "Wind limit: per the authorisation",
        "NOTAM: none active for this stretch", "Confirm before unpacking"].forEach((l, i) => cx.fillText(l, w * 0.05, h * (0.26 + i * 0.13)));
    }, { ry: 0.5, accent: BRDN_ACCENT });
    reg(hits, opsBoard, "ops-board");

    const bufferBoard = holoPanel(g, 0.94, 0.62, 1.9, 1.65, -0.85, (cx, w, h) => {
      cx.fillStyle = "#0d1c24"; cx.fillRect(0, 0, w, h); cx.fillStyle = BRDN_CSS; cx.fillRect(0, 0, w, 6);
      cx.font = `600 ${Math.round(h * 0.095)}px 'Barlow Condensed', Arial, sans-serif`; cx.textAlign = "left"; cx.textBaseline = "middle";
      cx.fillStyle = "#eaf6fb"; cx.fillText("BIRD BUFFER PLAN", w * 0.05, h * 0.12);
      cx.font = `${Math.round(h * 0.07)}px Arial, sans-serif`; cx.fillStyle = "#dcecf2";
      ["Buffer distance: per the permit", "Nest: pickleweed edge, bench west side",
        "Never fly the line over the flagged buffer", "USFWS consultation governs this bench"].forEach((l, i) => cx.fillText(l, w * 0.05, h * (0.28 + i * 0.15)));
    }, { ry: -0.5, accent: BRDN_ACCENT });
    reg(hits, bufferBoard, "buffer-board");

    // ------------------------------------------------------- buffer marker
    const markerCone = cone(g, 2.0, 2.6, { color: BRDN_RED });
    reg(hits, markerCone, "marker-cone");
    const markerHome = markerCone.position.clone();
    const markerSocketGrp = group(g, -2.2, 0, -3.6);
    hits["buffer-marker-socket"] = markerSocketGrp;

    const flyOverHazard = box(g, 0.4, 0.4, 0.3, -2.2, 0.5, -3.9, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "fly the line over the buffer?", -2.2, 0.9, -3.9, { css: "#e8622a", w: 0.48 });
    reg(hits, flyOverHazard, "fly-over-buffer");

    // ------------------------------------------------------------ nest, hidden marker
    const nestGrp = group(g, -2.4, 0.05, -4.0);
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2, r = 0.1 + Math.random() * 0.1;
      box(nestGrp, 0.02, 0.2, 0.008, Math.cos(a) * r, 0.1, Math.sin(a) * r, 0x6f5a3a, { rough: 0.9, cast: false }).rotation.z = (Math.random() - 0.5) * 0.3;
    }

    // ------------------------------------------------------------ radios & controls
    const voRadio = radio(g, 0.9, 0.85, 1.85, { ry: -0.4 });
    holoTag(g, "visual observer radio", 0.9, 1.1, 1.87, { css: BRDN_CSS, w: 0.38 });
    reg(hits, voRadio, "vo-radio");

    const rthControl = group(g, -0.9, 0.9, 1.95);
    cyl(rthControl, 0.035, 0.035, 0.02, 0, 0, 0, BRDN_RED, { rough: 0.5, metal: 0.3, seg: 16 });
    holoTag(rthControl, "return-to-home", 0, 0.1, 0, { css: BRDN_CSS, w: 0.36 });
    reg(hits, rthControl, "rth-control");

    const chaseHazard = box(g, 0.4, 0.4, 0.3, -0.9, 0.4, 2.3, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "fly one more pass past reserve?", -0.9, 0.75, 2.3, { css: "#e8622a", w: 0.5 });
    reg(hits, chaseHazard, "chase-battery-critical");

    const skipAirspaceHazard = box(g, 0.4, 0.4, 0.3, -1.9, 1.9, -1.1, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "launch without checking the board?", -1.9, 2.25, -1.1, { css: "#e8622a", w: 0.5 });
    reg(hits, skipAirspaceHazard, "skip-airspace-check");

    const handheldHazard = box(g, 0.4, 0.4, 0.3, 0.9, 0.5, 0.3, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "hand-catch it over the crowd?", 0.9, 0.9, 0.3, { css: "#e8622a", w: 0.5 });
    reg(hits, handheldHazard, "handheld-launch-over-crowd");

    const batteryGauge = instrument(g, 1.3, 0.86, 1.95, { color: 0x2b3138, idle: "100%", w: 0.1, d: 0.14 });
    holoTag(batteryGauge, "battery reserve", 0, 0.16, 0.05, { css: BRDN_CSS, w: 0.32 });
    reg(hits, batteryGauge, "battery-gauge");

    const surveyLog = holoPanel(g, 0.68, 0.5, -1.1, 1.15, 0.85, (cx, w, h) => drawLog(cx, w, h, ["Airspace: —", "Buffer: —", "Line: —", "Battery: —"], false), { ry: 0.5, accent: BRDN_ACCENT });
    function drawLog(cx, w, h, rows, done) {
      cx.fillStyle = "#0d1c24"; cx.fillRect(0, 0, w, h); cx.fillStyle = done ? BRDN_GREEN : BRDN_CSS; cx.fillRect(0, 0, w, 6);
      cx.font = `600 ${Math.round(h * 0.12)}px 'Barlow Condensed', Arial, sans-serif`; cx.textAlign = "left"; cx.textBaseline = "middle";
      cx.fillStyle = "#eaf6fb"; cx.fillText("SURVEY LOG", w * 0.06, h * 0.15);
      cx.font = `${Math.round(h * 0.082)}px Arial, sans-serif`; cx.fillStyle = done ? "#e6f6ea" : "#dcecf2";
      rows.forEach((l, i) => cx.fillText(l, w * 0.06, h * (0.36 + i * 0.16)));
    }
    reg(hits, surveyLog, "survey-log");

    // ---------------------------------------------------------- PPE rack
    const gearRack = group(g, 2.3, 0.1, 0.5);
    cyl(gearRack, 0.02, 0.02, 1.0, 0, 0.5, 0, 0x8a949d, { rough: 0.45, metal: 0.7, seg: 8 });
    const vest = box(gearRack, 0.28, 0.32, 0.08, 0, 0.9, 0.05, 0xe8b02e, { rough: 0.7 });
    holoTag(gearRack, "hi-vis vest", 0, 1.1, 0, { css: BRDN_CSS, w: 0.26 });
    reg(hits, vest, "hi-vis-vest");
    const boots = box(g, 0.16, 0.14, 0.28, 2.45, 0.07, 0.3, 0x2b3138, { rough: 0.7 });
    reg(hits, boots, "boots-on");
    const fieldRadio = radio(g, 2.1, 0.1, 0.6, { ry: 0.6 });
    reg(hits, fieldRadio, "vo-radio-power");

    const propsStoppedMarker = group(g, 0.35, 0.35, 1.4);
    box(propsStoppedMarker, 0.1, 0.02, 0.1, 0, 0, 0, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, propsStoppedMarker, "props-confirmed-stopped");
    const batteryRemovedMarker = group(g, -0.35, 0.32, 1.4);
    box(batteryRemovedMarker, 0.1, 0.02, 0.1, 0, 0, 0, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, batteryRemovedMarker, "battery-removed");

    // ---------------------------------------------------------- dog walker
    const bystanderGrp = group(g, 2.4, 0, 3.0, -1.9);
    const bystander = standingFigure(bystanderGrp, 0, 0, { cloth: 0x8a6a4a, vest: false, atStation: true });
    void bystander;
    const dogGrp = group(bystanderGrp, 0.3, 0, 0.2);
    box(dogGrp, 0.14, 0.12, 0.32, 0, 0.16, 0, 0x6a4a2a, { rough: 0.8 });
    ball(dogGrp, 0.08, 0, 0.24, 0.16, 0x6a4a2a, { rough: 0.8, seg: 10 });
    for (const [lx, lz] of [[0.05, 0.12], [-0.05, 0.12], [0.05, -0.12], [-0.05, -0.12]]) {
      box(dogGrp, 0.03, 0.14, 0.03, lx, 0.07, lz, 0x5a3a1a, { rough: 0.8 });
    }
    cyl(dogGrp, 0.015, 0.02, 0.14, 0, 0.2, -0.18, 0x6a4a2a, { rough: 0.8, seg: 8 }).rotation.x = -0.6;
    bystanderGrp.visible = false;
    const bystanderHome = bystanderGrp.position.clone();
    const bystanderPad = padCenter.clone(); bystanderPad.x -= 0.3; bystanderPad.z += 0.2;

    const hailer = group(g, 0.55, 0.9, 1.6);
    cyl(hailer, 0.05, 0.09, 0.18, 0, 0, 0, 0xc8ced4, { rough: 0.4, metal: 0.5, seg: 12 }).rotation.x = Math.PI / 2;
    holoTag(hailer, "loudhailer", 0, 0.16, 0, { css: BRDN_CSS, w: 0.24 });
    reg(hits, hailer, "hailer");

    const waterTex = water.material.map;
    let flying = false;
    return {
      hits,
      spawnLook: new THREE.Vector3(0, 1.0, 0.4),
      onStep(step) {
        if (step?.id === "survey-flyline") { beacon.material = mat(BRDN_AMBER, { emissive: BRDN_AMBER, ei: 2.0 }); flying = true; }
      },
      onStepComplete(step) {
        if (step.id === "check-gear") { crackedProp.visible = false; swollenBattery.visible = false; }
        if (step.id === "set-buffer-marker") { markerCone.position.copy(markerSocketGrp.position); }
        if (step.id === "launch-authorization") { voRadio.userData.show?.("CLEAR\nTO LAUNCH"); }
        if (step.id === "battery-gauge") { beacon.material = mat(BRDN_GREEN, { emissive: BRDN_GREEN, ei: 1.4 }); flying = false; droneGrp.position.copy(droneHome); }
        if (step.id === "survey-log") {
          repaint(surveyLog.userData.face, (cx, w, h) => drawLog(cx, w, h, ["Airspace: checked, in authorization", "Buffer: held clean", "Line: flown, frames captured", "Battery: landed in reserve"], false));
        }
        if (step.id === "crew-checkin") { voRadio.userData.show?.("WATCH OK\nBUFFER HELD"); }
        if (step.id === "closing-log") {
          repaint(surveyLog.userData.face, (cx, w, h) => drawLog(cx, w, h, ["Airspace: in authorization all flight", "Buffer: held, never crossed", "Interruptions: 2, resolved", "Aircraft: secured"], true));
        }
      },
      onHazard() {},
      onInterrupt(it) {
        if (it.id === "dog-walker-on-pad") { bystanderGrp.visible = true; bystanderGrp.position.copy(bystanderPad); }
        if (it.id === "wind-gust-exceeds-limit") { beacon.material = mat(BRDN_RED, { emissive: BRDN_RED, ei: 2.4 }); }
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "dog-walker-on-pad") { bystanderGrp.position.copy(bystanderHome); bystanderGrp.visible = false; }
        if (it.id === "wind-gust-exceeds-limit") { beacon.material = mat(BRDN_AMBER, { emissive: BRDN_AMBER, ei: 2.0 }); droneGrp.position.copy(droneHome); }
      },
      animate(t, dt, session) {
        wave.visible = true;
        wave.userData.step(dt, new THREE.Vector3(0, 0.06, -13), 1.1, 0.28, -0.1);
        if (waterTex?.offset) { waterTex.offset.x = t * 0.004; waterTex.offset.y = t * 0.006; }
        for (const prop of arms) prop.rotation.y = flying ? t * 26 : t * 2;
        if (flying) droneGrp.position.y = 0.32 + Math.sin(t * 1.4) * 0.05 + 1.1;
        else droneGrp.position.y = 0.32;
        const step = session?.step;
        if (session?.turn && step?.id === "compass-dial") compassDial.rotation.z = session.turn.amount * 4;
        if (session?.gauge && !session.gauge.committed && step?.id === "battery-gauge") {
          const gt = session.gauge.t ?? 0;
          repaint(batteryGauge.userData.screen, signFace(`${Math.round((1 - gt) * 100)}%`, { bg: "#0d1c24", accent: gt >= 0.46 && gt <= 0.64 ? "#59c97b" : "#f2ae14", fg: "#eaf0dc", scale: 0.6 }));
        }
      },
    };
  },
};
