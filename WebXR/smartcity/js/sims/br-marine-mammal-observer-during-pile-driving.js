import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import { box, cyl, ball, group, repaint, mat, particles, signFace } from "../../../shared/kit.js";
import {
  stationPad, holoPanel, holoTag, standingFigure, instrument, reg,
  surfaceTexture, texturedMat, waterFace,
} from "../citykit.js";
import { workboat, skiff, salvageCraneBarge } from "../../../shared/fleet.js";
import { radio } from "../../../shared/toolkit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Marine Mammal Observer During Pile Driving VR — SF Bay
// Restoration & Cleanup, Pack E (ecology, monitoring and community science).
//
// A restoration pile-driving crew working a derrick barge on the Bay, and
// the learner is the NOAA-Fisheries-authorized protected species observer
// posted at the rail of the support workboat with binoculars, a rangefinder
// and the day's monitoring plan. Two species named only generically — the
// harbor seal and the harbor porpoise — are what the observer is watching
// for, because the take prohibition under the Marine Mammal Protection Act
// and the Endangered Species Act consultation NOAA Fisheries has already
// completed for this work sit behind every ramp-up call the observer makes.
// The buffer and shutdown-zone distances are never stated as numbers here:
// they are "per the permit", read off the monitoring plan the way the dive
// stations read the dive plan. The barge, the support workboat and the
// bystander skiff are all fleet.js builders.

const BRMM_ACCENT = 0xe0a23c;
const BRMM_CSS = "#e0a23c";
const BRMM_GREEN = 0x59c97b;
const BRMM_AMBER = 0xe8b02e;
const BRMM_RED = 0xd2312b;

export const SIM_BR_MARINE_MAMMAL_OBSERVER_DURING_PILE_DRIVING = {
  id: "br-marine-mammal-observer-during-pile-driving",
  index: "343",
  domain: "Maritime & Ports",
  trade: "NOAA-Fisheries-authorized protected species observer, posted on the support workboat for a restoration pile-driving crew — Pile Drivers Local 34 on the derrick, IUOE Local 3 on the crane",
  category: "Maritime & Ports",
  district: "Maritime & Ports",
  weather: "overcast",
  certification: "Marine Mammal Protection Act take prohibition and Incidental Harassment Authorization conditions; NOAA Fisheries authorization and monitoring protocol for in-water pile driving; Endangered Species Act consultation behind the same authorization; OSHA 29 CFR 1910.95 occupational noise exposure at the rail near an operating derrick; Pile Drivers Local 34 (UBC) and IUOE Local 3 training standards for the crew the observer works beside; San Francisco Bay Conservation and Development Commission (BCDC) Bay Plan permit conditions for the work window",
  name: "Marine Mammal Observer During Pile Driving",
  title: simTitle("Marine Mammal Observer During Pile Driving"),
  tagline: "The watch that lets a pile-driving crew work at all: the shutdown zone scanned clean before the first soft-start strike, the rangefinder used instead of a guess, the soft-start and full-power calls made in order, a harbor seal or harbor porpoise in the zone answered with an immediate shutdown call, a stray boat waved off the safety zone, the wait held out before ramp-up resumes, and every sighting logged the way the authorization requires",
  accent: BRMM_ACCENT,
  accentCss: BRMM_CSS,
  parSeconds: 310,
  footprint: 3.0,
  badge: { id: "clean-watch-clean-zone", name: "Clean Watch, Clean Zone", note: "The zone was scanned clear before every ramp-up, the rangefinder was used instead of an eyeball guess, the seal sighting got an immediate shutdown, and every entry made it into the log" },

  supportLine: "your agency's employee assistance programme, with NOAA Fisheries' own observer support line behind it",

  game: system({
    name: "Protected Species Watch",
    currency: "SIGHTINGS",
    ranks: ["Trainee Observer", "Observer", "Lead Observer", "Senior Observer", "Pile-Driving Watch Certified"],
    badges: [
      { id: "true-range", name: "True Range", note: "The rangefinder read and calibrated before the first scan, never eyeballed", test: AWARD.stepClean("rangefinder-dial") },
      { id: "clean-shutdown", name: "Clean Shutdown", note: "Never skipped the soft start, never left the post, never logged late", test: AWARD.safe },
      { id: "held-the-wait", name: "Held The Wait", note: "The post-shutdown clearance wait held inside the correct band, first time", test: AWARD.precise(0.7) },
    ],
    challenges: [
      { id: "clean-scan", name: "Clean Scan", note: "No corrections across the whole watch", test: AWARD.clean },
      { id: "steady-eyes", name: "Steady Eyes", note: "Held the zone scan in band through both ramp-up and full power", test: AWARD.unbroken },
      { id: "logged-fast", name: "Logged Fast", note: "Watch closed out inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "eyeball-the-range": "You judged whether the animal was inside the shutdown zone by eye instead of reading the rangefinder. A shutdown zone is a fixed distance under the authorization, and a harbor seal's head breaking the surface looks closer or farther depending on the light and the chop — the rangefinder is what turns a guess into the number NOAA Fisheries actually issued the permit against.",
    "skip-soft-start": "You told the crew to go straight to full power and skip the soft-start warning strikes. The soft start is what gives any animal still in the zone the chance to leave under noise it can move away from, before the hammer reaches the power that can actually injure it — skipping it turns the ramp-up from a warning into the same shutdown-zone violation the whole watch exists to prevent.",
    "log-it-later": "You decided to remember the sighting and log it once the watch was over instead of logging it right away. A sighting logged from memory after a full shift of driving noise and other sightings is a sighting that has already lost its exact time, its exact bearing and half of what NOAA Fisheries' own monitoring report will ask this crew for — the log is filled in at the sighting, not reconstructed afterward.",
    "leave-post-for-photo": "You left the rail to get a closer photo of the animal for the record. The observer's whole value is a continuous scan of the shutdown zone from one fixed post, and a zone nobody is watching while the observer chases a photo is a zone the crew is now driving into blind — the sighting is logged from where you were standing, not from as close as you can get.",
  },

  lateNotes: {
    "resume-clock": "Nothing to read yet — the shutdown has to actually be called and the zone re-cleared before the clearance wait starts.",
    "sighting-log": "Nothing to log yet — the zone hasn't been scanned and nothing has happened worth an entry.",
  },

  interrupts: [
    {
      id: "seal-in-zone",
      kind: "Harbor seal surfaces inside the shutdown zone",
      after: "fullpower-scan", delay: 3, seconds: 14,
      alert: "A harbor seal has surfaced right inside the shutdown zone while the hammer is at full power.",
      cue: "Call the shutdown immediately on the dedicated shutdown channel — do not wait for the current strike count to finish.",
      target: "radio-shutdown",
      why: "The Incidental Harassment Authorization exists precisely for this moment: an animal inside the shutdown zone during driving is a take the authorization does not cover, and the only thing that stops it from becoming one is calling the shutdown the instant the animal is confirmed, not at the end of the strike the crew is already mid-way through.",
      missNote: "The hammer kept driving at full power while the seal sat inside the shutdown zone — exactly the exposure the authorization's shutdown-zone rule exists to prevent.",
      wrongNote: "The shutdown channel — that radio calls the hammer off, and nothing else on this deck does.",
    },
    {
      id: "boat-in-safety-zone",
      kind: "Unaware boat enters the safety zone",
      after: "rampup-watch", delay: 2, seconds: 14,
      alert: "A small boat with no idea the crew is working has turned straight toward the derrick's safety zone.",
      cue: "Hail the boat on the loudhailer and wave it off before it gets under the boom or the falling-object zone around the derrick.",
      target: "hailer",
      why: "The safety zone around a working derrick is about falling loads and swinging rigging, not about marine mammals, and a boat with no radio and no idea anyone is working here is not going to turn away on its own — the loudhailer is the one thing on this deck that reaches a boat with no VHF, and it has to reach it before the boat is under the boom, not after.",
      missNote: "Nobody hailed the boat, and it held its course straight in under the derrick's swinging boom and its falling-object zone.",
      wrongNote: "The loudhailer — that boat has no radio, and the wave-off has to reach it before it gets under the boom.",
    },
  ],

  steps: [
    {
      id: "ppe-brief", kind: "sequence", anyOrder: true,
      targets: ["hearing-protection", "pfd-on", "hard-hat"],
      itemNames: { "hearing-protection": "hearing protection in", "pfd-on": "PFD on and buckled", "hard-hat": "hard hat on" },
      title: "Gear up at the rail before the watch starts",
      cue: "Before stepping to the rail: hearing protection in, PFD on and buckled, hard hat on.",
      why: "The rail puts the observer close enough to the derrick to hear every strike once the hammer is at full power, which is the noise exposure OSHA's occupational noise standard exists for, and the same rail is a place to go over the side from a moving deck — the hearing protection and the PFD are not optional because the job is watching, not driving.",
    },
    {
      id: "monitoring-plan-board", kind: "select", target: "monitoring-plan-board",
      title: "Read the day's monitoring plan",
      cue: "Read today's monitoring plan: the shutdown zone and the safety zone per the permit, the soft-start sequence, and who gets called for what.",
      why: "The shutdown-zone distance, the safety-zone distance and the soft-start sequence are all set in the authorization NOAA Fisheries issued for this specific work window, not decided on the deck, and the plan board is where the observer confirms today's numbers against the permit before a single strike goes in — the same plan the report at the end of the job will be checked against.",
    },
    {
      id: "species-id-board", kind: "select", target: "species-id-board",
      title: "Review the species reference before the watch",
      cue: "Review the species reference card: the harbor seal, the harbor porpoise, and what a false alarm from a diving bird or a floating log tends to look like.",
      why: "A shutdown call on a bird or a log costs the crew a strike sequence for nothing, and a missed harbor porpoise's low, fast roll because nobody had looked at the reference that morning is a take that never gets called — five minutes with the card is what keeps today's calls both fast and correct.",
    },
    {
      id: "check-gear", kind: "find", noHint: true,
      targets: ["fogged-lens", "log-wrong-page"],
      itemNames: { "fogged-lens": "the spare binoculars, lens fogged", "log-wrong-page": "the log left open on yesterday's page" },
      itemNotes: {
        "fogged-lens": "The spare set of binoculars has fogged over — reach for these mid-watch and the zone goes unscanned for as long as it takes to notice.",
        "log-wrong-page": "The log is still open to yesterday's entries — a sighting written on the wrong day's page is a sighting the monitoring report can't find.",
      },
      title: "Check the gear before the scan starts",
      cue: "Walk the deck and find anything wrong with the gear before the watch starts logging anything.",
      why: "The spare binoculars and the open log are the two things a rushed observer never checks until they're needed mid-scan, and finding the fogged lens and the wrong page now, at the rail with nothing yet happening, costs nothing — finding them during a shutdown call costs the seconds the call cannot spare.",
    },
    {
      id: "rangefinder-dial", kind: "turn", target: "rangefinder-dial",
      title: "Calibrate the rangefinder to today's zone",
      cue: "Turn the rangefinder's ring to the shutdown-zone distance the monitoring plan gave you, before the first scan.",
      turn: { turns: 0.6, label: "RANGEFINDER" },
      why: "The rangefinder only tells the observer whether an animal is inside or outside the zone if it is set to the actual distance the authorization defines for today, and a rangefinder still set to another site's number, or to no number at all, turns every reading back into the eyeball guess it exists to replace.",
    },
    {
      id: "prerampup-scan", kind: "track", target: "binoculars-mount", seconds: 6,
      title: "Scan the shutdown zone before the soft start",
      cue: "Hold a steady scan across the shutdown zone with the binoculars — the crew cannot start the soft start until you call it clear.",
      track: { start: 0.12, green: [0.4, 0.62], rise: 0.5, fall: 0.42, drift: 0.12, label: "ZONE SCAN", readout: (v) => (v < 0.4 ? "scan too fast — near edge missed" : v > 0.62 ? "scan too slow — far edge missed" : "zone scanned clean") },
      why: "The soft start exists to warn anything still in the zone before the hammer reaches full power, and it can only do that job if the zone was actually empty when the soft start begins — a scan rushed across the near edge or dragged past the far edge is a zone that was never really checked at all, whatever the observer tells the crew.",
      holdBreakNote: "The scan broke before the zone was covered end to end — steady the binoculars and finish the pass before calling it clear.",
    },
    {
      id: "zone-clear-call", kind: "sequence",
      targets: ["radio-clear-call", "log-start-time"],
      itemNames: { "radio-clear-call": "'zone clear, soft start authorized' called to the crew", "log-start-time": "the soft-start time logged" },
      outOfOrderNote: "Call the zone clear to the crew first — the time only means anything logged against a soft start the crew has actually been told to begin.",
      title: "Call the zone clear and authorize the soft start",
      cue: "Call the crew: 'zone clear, soft start authorized' — then log the time the soft start began.",
      why: "The crew cannot legally begin the soft start until the observer says the zone is clear, and the call has to happen before the first strike, not be inferred from the observer's silence — logging the exact time afterward is what lets the monitoring report show the soft start actually preceded full power, in order, the way the authorization requires.",
    },
    {
      id: "rampup-watch", kind: "hold", target: "binoculars-mount", seconds: 5,
      title: "Hold the watch through the soft start",
      cue: "Hold the binoculars steady on the zone through the whole soft-start sequence — anything that surfaces now still has time to leave before full power.",
      why: "The soft start is the one part of the sequence built to give an animal a way out, and that only works if someone is actually watching for it to take that way out — a watch that wanders during the soft start is a watch that finds out an animal was there only once the crew is already at full power.",
      holdBreakNote: "The watch broke partway through the soft start — get back on the binoculars and hold it through to the end of the sequence.",
    },
    {
      id: "fullpower-scan", kind: "track", target: "binoculars-mount", seconds: 7,
      title: "Scan the zone through full-power driving",
      cue: "Hold the scan on the shutdown zone through full-power driving — this is the reading the whole watch exists for.",
      track: { start: 0.15, green: [0.4, 0.6], rise: 0.55, fall: 0.45, drift: 0.14, label: "ZONE SCAN", readout: (v) => (v < 0.4 ? "too fast — near edge missed" : v > 0.6 ? "too slow — far edge missed" : "zone held clean") },
      why: "Full power is where an animal inside the shutdown zone is actually at risk, which makes this the one scan in the whole sequence that cannot be allowed to drift — a scan that loses the near or far edge of the zone during full-power driving is the exact gap a harbor seal or harbor porpoise needs to be missed in.",
      holdBreakNote: "The scan lost the zone during full-power driving — the one time in the whole sequence that cannot happen. Steady it and pick the pass back up.",
    },
    {
      id: "log-shutdown-entry", kind: "select", target: "sighting-log",
      title: "Log the shutdown and the sighting",
      cue: "Log the sighting: species, time, bearing, the shutdown called and the time driving stopped.",
      why: "NOAA Fisheries' monitoring report is built entirely out of entries like this one, and an entry made right after the shutdown — while the bearing and the time are still what the observer actually saw, not what they remember an hour later — is the only version of this sighting that can stand behind the authorization's own record of how the work was actually monitored.",
    },
    {
      id: "resume-wait", kind: "gauge", target: "resume-clock",
      title: "Hold the clearance wait before ramp-up resumes",
      cue: "Watch the clearance clock and call ramp-up authorized only once the zone has read clear for the wait the monitoring plan sets — not before it, and not long past it either.",
      gauge: { label: "CLEARANCE WAIT", speed: 0.55, green: [0.46, 0.64], readout: (t) => (t < 0.46 ? "too soon — zone not cleared long enough" : t <= 0.64 ? "cleared the full wait — resume" : "held past the wait — resume now"), missNote: "Off the band. The wait the monitoring plan sets has to actually run its course before ramp-up starts again." },
      why: "The clearance wait exists so a shutdown means the zone is actually re-confirmed empty, not just that the hammer paused for a moment — calling ramp-up back too early treats the shutdown as a formality, and holding well past the wait for no reason is time the crew and the tide do not have either.",
    },
    {
      id: "resume-authorization", kind: "select", target: "radio-clear-call",
      title: "Authorize the resume",
      cue: "Call the crew again: zone re-confirmed clear, soft start authorized to resume from the top of the sequence.",
      why: "A resume after a shutdown goes back through the soft start from the beginning, not straight to full power, because the animal that caused the shutdown may not actually be gone — the same call that started the day's work is the one that restarts it after every shutdown, in the same order, for the same reason.",
    },
    {
      id: "crew-checkin", kind: "select", target: "crew-radio",
      title: "Check in with the derrick crew",
      cue: "On the working channel: the watch is current, the shutdown and the boat are both handled, and how the crew is doing after a stop mid-drive.",
      why: "A shutdown mid-drive costs the crew time and can cost a foundation schedule, and the crew that just stopped and restarted a pile on the observer's word deserves to hear directly that the call was made for something real — the check-in is also where the observer's own read on a tense watch gets a place to go besides staying with them at the rail.",
    },
    {
      id: "closing-log", kind: "select", target: "sighting-log",
      title: "Close out the watch log",
      cue: "Close the log: total driving time, every sighting and shutdown, the boat waved off, and the watch secured.",
      why: "The closing entry is what turns today's individual sightings and shutdowns into the record NOAA Fisheries actually reviews against the authorization — a log closed out completely, in order, is the difference between an authorization that gets renewed on the strength of its own monitoring and one that raises questions nobody on this deck can answer months later.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 3.0, BRMM_ACCENT);

    // ------------------------------------------------------------ the water
    const water = box(g, 30, 0.02, 26, 0, 0.04, -3, 0xffffff, { rough: 0.14, metal: 0.22, cast: false });
    water.material = texturedMat(surfaceTexture((cx, w, h) => waterFace(cx, w, h, { base: "#12303e", mid: "#1a4050", crest: 300 }), { repeat: 5, px: 512 }), { rough: 0.14, metal: 0.22, color: 0xa2c4d8 });
    const wave = particles(g, 18, 0xbfe6f2, { size: 0.03, life: 0.9, additive: false, opacity: 0.3 });
    wave.position.set(0, 0.05, -3);

    // ---------------------------------- the support workboat, stern to the learner
    const DECK = 0.41;
    const wb = workboat(g, 0, -0.79, -1.2, { ry: Math.PI, livery: { fleetName: "BAY MONITOR", unitNumber: "MM-2" } });
    void wb;

    // ------------------------------------------ the derrick barge, out on the zone
    const rig = salvageCraneBarge(g, -10, -0.6, -8.5, { ry: 0.25, livery: { fleetName: "BAY WORKS", unitNumber: "PD-7" }, boomAngle: 0.7 });
    holoTag(rig, "pile-driving derrick", 0, 9.5, 0, { css: BRMM_CSS, w: 0.5 });
    const { hook, house } = rig.userData.parts;
    const beacon = ball(house, 0.09, 0, 2.5, -0.4, BRMM_GREEN, { emissive: BRMM_GREEN, ei: 2.0, seg: 12 });
    const pileGrp = group(g);
    pileGrp.position.copy(hook.getWorldPosition(new THREE.Vector3()));
    const pile = cyl(pileGrp, 0.18, 0.18, 3.2, 0, -1.6, 0, 0x6a6f74, { rough: 0.55, metal: 0.5, seg: 14 });
    void pile;
    const hammer = box(pileGrp, 0.7, 0.9, 0.7, 0, -0.4, 0, 0x2b3138, { rough: 0.5, metal: 0.5 });

    // ------------------------------------------------------ shutdown-zone buoys
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      const bx = -10 + Math.cos(a) * 4.6, bz = -8.5 + Math.sin(a) * 4.6;
      const buoy = group(g, bx, -0.15, bz);
      cyl(buoy, 0.06, 0.09, 0.3, 0, 0.15, 0, BRMM_AMBER, { rough: 0.6, seg: 8 });
      ball(buoy, 0.07, 0, 0.32, 0, BRMM_AMBER, { rough: 0.55, seg: 8 });
    }

    // --------------------------------------------------------- crew figures
    const crewObserver2 = standingFigure(g, -0.75, -1.0, { ry: 1.9, cloth: 0x3f4a55, vest: 0xf06a2b, helmet: 0xf1f3f4, gloves: true, atStation: true });
    crewObserver2.position.y = DECK;
    holoTag(crewObserver2, "assistant observer — logging", 0, 1.95, 0, { css: BRMM_CSS, w: 0.44 });
    const derrickCrew = standingFigure(rig, 1.1, -1.2, { ry: -1.6, cloth: 0x2b3138, vest: 0xe8b02e, helmet: 0xf1f3f4, gloves: true, atStation: true });
    derrickCrew.position.y = 1.9;

    // -------------------------------------------------- bystander skiff, offstage
    const sk = skiff(g, 16, -0.3, -3, { ry: -1.3, livery: { fleetName: "PRIVATE", unitNumber: "" } });
    holoTag(sk, "unaware boat", 0, 1.1, 0, { css: "#e8622a", w: 0.32 });
    sk.visible = false;
    const skZoneSpot = new THREE.Vector3(2.4, -0.3, 1.2);
    const skHome = sk.position.clone();

    // --------------------------------------------------- harbor seal, hidden
    const sealGrp = group(g, -6.5, -0.05, -6.2);
    ball(sealGrp, 0.16, 0, 0, 0, 0x5a4a3a, { rough: 0.7, seg: 12 });
    ball(sealGrp, 0.09, 0.22, 0.02, 0.08, 0x5a4a3a, { rough: 0.7, seg: 10 });
    holoTag(sealGrp, "harbor seal — in the zone", 0, 0.5, 0, { css: "#e8622a", w: 0.5 });
    sealGrp.visible = false;

    // -------------------------------------------- rail equipment, DECK level
    const hearingRack = group(g, -1.05, DECK, 0.55);
    box(hearingRack, 0.1, 0.02, 0.14, 0, 0.5, 0, 0x2b3138, { rough: 0.7 });
    box(hearingRack, 0.14, 0.08, 0.03, -0.03, 0.56, 0.05, 0xf1c14b, { rough: 0.6 });
    box(hearingRack, 0.14, 0.08, 0.03, 0.05, 0.56, -0.02, 0xf1c14b, { rough: 0.6 });
    holoTag(hearingRack, "hearing protection", 0, 0.66, 0, { css: BRMM_CSS, w: 0.36 });
    reg(hits, hearingRack, "hearing-protection");

    const pfdRack = group(g, -1.3, DECK, 0.4);
    cyl(pfdRack, 0.02, 0.02, 1.1, 0, 0.55, 0, 0x8a949d, { rough: 0.45, metal: 0.7, seg: 8 });
    const pfd = box(pfdRack, 0.28, 0.34, 0.1, 0, 0.95, 0.06, 0xd2312b, { rough: 0.7 });
    holoTag(pfdRack, "inflatable PFD", 0, 1.16, 0, { css: BRMM_CSS, w: 0.28 });
    reg(hits, pfd, "pfd-on");

    const hatRack = group(g, -0.8, DECK, 0.4);
    cyl(hatRack, 0.018, 0.018, 0.7, 0, 0.35, 0, 0x8a949d, { rough: 0.45, metal: 0.7, seg: 8 });
    const hardHat = ball(hatRack, 0.13, 0, 0.7, 0, 0xf1c14b, { rough: 0.55, seg: 12 });
    hardHat.scale.y = 0.62;
    holoTag(hatRack, "hard hat", 0, 0.86, 0, { css: BRMM_CSS, w: 0.24 });
    reg(hits, hardHat, "hard-hat");

    const monitoringBoard = holoPanel(g, 0.94, 0.62, -1.9, 1.65, -0.85, (cx, w, h) => {
      cx.fillStyle = "#1a140a"; cx.fillRect(0, 0, w, h); cx.fillStyle = BRMM_CSS; cx.fillRect(0, 0, w, 6);
      cx.font = `600 ${Math.round(h * 0.095)}px 'Barlow Condensed', Arial, sans-serif`; cx.textAlign = "left"; cx.textBaseline = "middle";
      cx.fillStyle = "#f6ecd8"; cx.fillText("MONITORING PLAN — TODAY", w * 0.05, h * 0.12);
      cx.font = `${Math.round(h * 0.07)}px Arial, sans-serif`; cx.fillStyle = "#f0e6d0";
      ["Shutdown zone: per the permit", "Safety zone: per the permit", "Soft start before every full-power sequence",
        "Shutdown clearance wait: per the plan", "Report every sighting, near miss or not"].forEach((l, i) => cx.fillText(l, w * 0.05, h * (0.26 + i * 0.13)));
    }, { ry: 0.5, accent: BRMM_ACCENT });
    reg(hits, monitoringBoard, "monitoring-plan-board");

    const speciesBoard = holoPanel(g, 0.94, 0.62, 1.9, 1.65, -0.85, (cx, w, h) => {
      cx.fillStyle = "#1a140a"; cx.fillRect(0, 0, w, h); cx.fillStyle = BRMM_CSS; cx.fillRect(0, 0, w, 6);
      cx.font = `600 ${Math.round(h * 0.095)}px 'Barlow Condensed', Arial, sans-serif`; cx.textAlign = "left"; cx.textBaseline = "middle";
      cx.fillStyle = "#f6ecd8"; cx.fillText("SPECIES REFERENCE", w * 0.05, h * 0.12);
      cx.font = `${Math.round(h * 0.07)}px Arial, sans-serif`; cx.fillStyle = "#f0e6d0";
      ["Harbor seal — round head, low in the water", "Harbor porpoise — small, fast, low roll",
        "A diving bird surfaces and dives again", "A floating log doesn't move on its own"].forEach((l, i) => cx.fillText(l, w * 0.05, h * (0.28 + i * 0.15)));
    }, { ry: -0.5, accent: BRMM_ACCENT });
    reg(hits, speciesBoard, "species-id-board");

    const fogged = group(g, -1.55, DECK + 0.05, 0.9);
    box(fogged, 0.14, 0.07, 0.09, 0, 0, 0, 0x2b3138, { rough: 0.6, metal: 0.5, opacity: 0.55, transparent: true });
    reg(hits, fogged, "fogged-lens");
    const wrongPageMarker = group(g, 1.35, DECK + 0.05, 0.85, 0);
    box(wrongPageMarker, 0.1, 0.01, 0.14, 0, 0, 0, 0xd2312b, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, wrongPageMarker, "log-wrong-page");

    const rangefinder = instrument(g, -0.5, DECK + 0.5, 0.85, { color: 0x2b3138, idle: "-- m", w: 0.1, d: 0.14 });
    const rfDial = cyl(rangefinder, 0.025, 0.025, 0.03, 0, 0.03, 0.06, 0xc8ced4, { rough: 0.4, seg: 10 });
    rfDial.rotation.x = Math.PI / 2;
    holoTag(rangefinder, "rangefinder", 0, 0.16, 0.05, { css: BRMM_CSS, w: 0.3 });
    reg(hits, rangefinder, "rangefinder-dial");

    const binoMount = group(g, 0, DECK + 1.05, 0.95);
    cyl(binoMount, 0.02, 0.025, 0.7, 0, -0.1, 0, 0x2b3138, { rough: 0.5, metal: 0.6, seg: 10 });
    const binoHead = group(binoMount, 0, 0.28, 0);
    cyl(binoHead, 0.06, 0.06, 0.2, -0.07, 0, 0, 0x1b1e23, { rough: 0.45, metal: 0.5, seg: 12 }).rotation.z = Math.PI / 2;
    cyl(binoHead, 0.06, 0.06, 0.2, 0.07, 0, 0, 0x1b1e23, { rough: 0.45, metal: 0.5, seg: 12 }).rotation.z = Math.PI / 2;
    holoTag(binoMount, "binoculars — the zone scan", 0, 0.62, 0, { css: BRMM_CSS, w: 0.46 });
    reg(hits, binoMount, "binoculars-mount");

    const eyeballHazard = box(g, 0.4, 0.4, 0.3, -0.5, DECK + 0.9, 0.7, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "call it by eye — skip the rangefinder?", -0.5, DECK + 1.25, 0.7, { css: "#e8622a", w: 0.56 });
    reg(hits, eyeballHazard, "eyeball-the-range");

    const clearRadio = radio(g, 0.55, DECK + 0.85, 0.6, { ry: -0.4 });
    holoTag(g, "shutdown-adjacent channel radio", 0.55, DECK + 1.1, 0.62, { css: BRMM_CSS, w: 0.4 });
    reg(hits, clearRadio, "radio-clear-call");

    const skipHazard = box(g, 0.4, 0.4, 0.3, 0.55, DECK + 0.9, 0.9, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "skip straight to full power?", 0.55, DECK + 1.3, 0.9, { css: "#e8622a", w: 0.48 });
    reg(hits, skipHazard, "skip-soft-start");

    const timeStamp = group(g, 0.85, DECK, 0.75);
    box(timeStamp, 0.12, 0.02, 0.08, 0, 0.02, 0, 0x2b3138, { rough: 0.6, metal: 0.4 });
    holoTag(timeStamp, "time stamp", 0, 0.14, 0, { css: BRMM_CSS, w: 0.24 });
    reg(hits, timeStamp, "log-start-time");

    const shutdownRadio = radio(g, -0.55, DECK + 0.85, 0.6, { ry: 0.4 });
    holoTag(g, "dedicated shutdown channel", -0.55, DECK + 1.1, 0.62, { css: "#d2312b", w: 0.4 });
    reg(hits, shutdownRadio, "radio-shutdown");

    const hailer = group(g, -0.95, DECK + 1.05, 0.6);
    cyl(hailer, 0.05, 0.09, 0.18, 0, 0, 0.1, 0xc8ced4, { rough: 0.4, metal: 0.5, seg: 12 }).rotation.x = Math.PI / 2;
    holoTag(hailer, "loudhailer", 0, 0.18, 0.06, { css: BRMM_CSS, w: 0.22 });
    reg(hits, hailer, "hailer");

    const logLog = holoPanel(g, 0.68, 0.5, 1.1, 1.15, -0.8, (cx, w, h) => drawLog(cx, w, h, ["Zone: not yet scanned", "Soft start: —", "Full power: —", "Shutdowns: —"], false), { ry: -0.5, accent: BRMM_ACCENT });
    function drawLog(cx, w, h, rows, done) {
      cx.fillStyle = "#1a140a"; cx.fillRect(0, 0, w, h); cx.fillStyle = done ? BRMM_GREEN : BRMM_CSS; cx.fillRect(0, 0, w, 6);
      cx.font = `600 ${Math.round(h * 0.12)}px 'Barlow Condensed', Arial, sans-serif`; cx.textAlign = "left"; cx.textBaseline = "middle";
      cx.fillStyle = "#f6ecd8"; cx.fillText("SIGHTING LOG", w * 0.06, h * 0.15);
      cx.font = `${Math.round(h * 0.082)}px Arial, sans-serif`; cx.fillStyle = done ? "#e6f6ea" : "#f0e6d0";
      rows.forEach((l, i) => cx.fillText(l, w * 0.06, h * (0.36 + i * 0.16)));
    }
    reg(hits, logLog, "sighting-log");

    const logHazard = box(g, 0.5, 0.4, 0.3, 1.1, DECK + 0.6, -0.6, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "log it later, back at the office?", 1.1, DECK + 1.0, -0.6, { css: "#e8622a", w: 0.52 });
    reg(hits, logHazard, "log-it-later");

    const resumeClock = instrument(g, 0.3, DECK + 0.5, 1.05, { color: 0x2b3138, idle: "0 min", w: 0.1, d: 0.14 });
    holoTag(resumeClock, "clearance wait", 0, 0.16, 0.05, { css: BRMM_CSS, w: 0.32 });
    reg(hits, resumeClock, "resume-clock");

    const crewRadio = radio(g, 0.95, DECK + 0.9, -0.55, { ry: -0.4 });
    holoTag(g, "crew radio", 0.95, DECK + 1.25, -0.53, { css: BRMM_CSS, w: 0.22 });
    reg(hits, crewRadio, "crew-radio");

    const railHazard = box(g, 0.4, 0.5, 0.4, -1.5, DECK + 0.6, -0.9, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "lean out over the rail for a photo?", -1.5, DECK + 1.1, -0.9, { css: "#e8622a", w: 0.56 });
    reg(hits, railHazard, "leave-post-for-photo");

    const waterTex = water.material.map;
    let driving = false;
    return {
      hits,
      spawnLook: new THREE.Vector3(-0.3, 1.2, -0.5),
      onStep(step) {
        if (step?.id === "fullpower-scan") { beacon.material = mat(BRMM_RED, { emissive: BRMM_RED, ei: 2.0 }); driving = true; }
      },
      onStepComplete(step) {
        if (step.id === "check-gear") { fogged.visible = false; wrongPageMarker.visible = false; }
        if (step.id === "zone-clear-call") { beacon.material = mat(BRMM_AMBER, { emissive: BRMM_AMBER, ei: 2.0 }); }
        if (step.id === "log-shutdown-entry") {
          repaint(logLog.userData.face, (cx, w, h) => drawLog(cx, w, h, ["Zone: harbor seal at full power", "Shutdown: called and confirmed", "Full power: paused", "Clearance wait: pending"], false));
        }
        if (step.id === "resume-wait") { beacon.material = mat(BRMM_RED, { emissive: BRMM_RED, ei: 2.0 }); driving = true; }
        if (step.id === "resume-authorization") { clearRadio.userData.show?.("RESUME\nAUTHORIZED"); }
        if (step.id === "crew-checkin") { crewRadio.userData.show?.("WATCH OK\nZONE CLEAR"); }
        if (step.id === "closing-log") {
          beacon.material = mat(BRMM_GREEN, { emissive: BRMM_GREEN, ei: 1.4 });
          driving = false;
          repaint(logLog.userData.face, (cx, w, h) => drawLog(cx, w, h, ["Zone: scanned clean all watch", "Shutdowns: 1, seal, resolved", "Boat: waved off the safety zone", "Watch: secured"], true));
        }
      },
      onHazard() {},
      onInterrupt(it) {
        if (it.id === "seal-in-zone") sealGrp.visible = true;
        if (it.id === "boat-in-safety-zone") { sk.visible = true; sk.position.copy(skZoneSpot); }
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "seal-in-zone") { sealGrp.visible = false; beacon.material = mat(BRMM_AMBER, { emissive: BRMM_AMBER, ei: 2.0 }); driving = false; }
        if (it.id === "boat-in-safety-zone") sk.position.copy(skHome);
      },
      animate(t, dt, session) {
        wave.visible = true;
        wave.userData.step(dt, new THREE.Vector3(0, 0.06, -3), 1.1, 0.28, -0.1);
        if (waterTex?.offset) { waterTex.offset.x = t * 0.004; waterTex.offset.y = t * 0.006; }
        if (driving) hammer.position.y = -0.4 - Math.abs(Math.sin(t * 7)) * 0.14;
        else hammer.position.y = -0.4;
        if (sealGrp.visible) sealGrp.position.y = -0.05 + Math.sin(t * 2.2) * 0.02;
        if (sk.visible && sk.position.distanceTo(skHome) > 0.5 && sk.position.distanceTo(skZoneSpot) < 0.5) {
          sk.position.x += Math.sin(t * 1.4) * 0.002;
        }
        const step = session?.step;
        if (session?.turn && step?.id === "rangefinder-dial") rfDial.rotation.z = session.turn.amount * 4;
        if (session?.gauge && !session.gauge.committed && step?.id === "resume-wait") {
          const gt = session.gauge.t ?? 0;
          repaint(resumeClock.userData.screen, signFace(`${Math.round(gt * 6)} min`, { bg: "#0d1c24", accent: gt >= 0.46 && gt <= 0.64 ? "#59c97b" : "#f2ae14", fg: "#eaf0dc", scale: 0.6 }));
        }
      },
    };
  },
};
