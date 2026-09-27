import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import { box, cyl, ball, torus, hose, group, decal, repaint, paperFace, mat } from "../../../shared/kit.js";
import { holoTag, standingFigure, valveWheel, reg, surfaceTexture, texturedMat, growthFace, mudflatFace } from "../citykit.js";
import { concreteFace } from "../../../shared/textures.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Pier Piling Inspection & Wrap Repair — commercial diving and
// scientific scuba pack, DIVE1, on the bay-underwater district.
//
// The diver's side of a pier inspection: a row of concrete and timber piles on
// a silty bottom, growth to the mud line, a floating fender between two of
// them, the inspection band marked on the working pile, the scraper and the
// water jet, the helmet camera the surface records from, the pit gauge, the
// slate, the fibreglass jacket halves and their banding, the grout hose, and
// the umbilical running back to the district's dive stage at (−4.3, 2.8). The
// learner is a Pile Drivers commercial diver; the supervisor keeps the surface
// log from the diver's words. No depth, gas, time or measurement is a number;
// the inspection form and the dive plan hold them.

const CDPP_ACCENT = 0x7fbf9e;
const CDPP_CSS = "#7fbf9e";

export const SIM_CD_PIER_PILING_INSPECTION_AND_WRAP_REPAIR = {
  id: "cd-pier-piling-inspection-and-wrap-repair",
  index: "717",
  domain: "Maritime & Ports",
  trade: "Pile Drivers of the Carpenters commercial diver inspecting a pier pile by hand and camera and fitting a wrap repair, with the dive supervisor keeping the surface log, the tender and the standby diver",
  category: "Maritime & Ports",
  district: "bay-underwater",
  weather: "clear",
  underwater: {
    depthLabel: "Per dive plan",
    bottomTimeSeconds: 600,
  },
  certification: "Pile Drivers apprenticeship under the Carpenters (UBC) International Training Fund; OSHA 29 CFR 1910 Subpart T — 29 CFR 1910.421 pre-dive planning and the briefing, 29 CFR 1910.422 procedures during the dive (communications, hand and power tools), 29 CFR 1910.425 the tended surface-supplied diver and 29 CFR 1910.440 the record of the dive; ADCI consensus standards for underwater inspection and pier work; USCG 46 CFR 197 Subpart B where the dive is worked from a vessel; the owner's inspection form and the dive plan hold every measurement and limit",
  name: "Pier Piling Inspection & Wrap Repair",
  title: simTitle("Pier Piling Inspection & Wrap Repair"),
  tagline: "One pile, by hand and by camera: the inspection plan read on the slate, the growth cleared in a band without gouging, the necked section and the split found by touch, the camera held while the surface records, the pit gauge read to the form, the findings dictated to the surface log, the wrap zone brushed and flushed, the jacket halves fitted and banded, the seam checked, the grout hose landed, the plate photographed and the log closed — with a surging fender and a recall along the way",
  accent: CDPP_ACCENT,
  accentCss: CDPP_CSS,
  parSeconds: 320,
  footprint: 2.6,
  badge: { id: "read-by-hand", name: "Read By Hand", note: "The pile inspected by touch and camera in a marked band, the findings said to the surface as they were found, the wrap fitted to the form" },

  supportLine: "your union hall's member assistance programme — the Pile Drivers of the Carpenters — with the employer's employee assistance line behind it",

  game: system({
    name: "Pile Watch",
    currency: "PILE MARKS",
    ranks: ["Tender", "Diver", "Inspection Diver", "Repair Diver", "Pier Inspection Certified"],
    badges: [
      { id: "found-by-touch", name: "Found By Touch", note: "The necked section and the split found before the camera pass", test: AWARD.stepClean("tactile-inspect") },
      { id: "to-the-form", name: "To The Form", note: "The pit gauge committed inside the form's band first time", test: AWARD.precise(0.7) },
      { id: "line-clear", name: "Line Clear", note: "The umbilical never round the pile, never under the fender", test: AWARD.safe },
    ],
    challenges: [
      { id: "clean-pile", name: "Clean Pile", note: "No corrections from the slate to the check-in", test: AWARD.clean },
      { id: "steady-scrape", name: "Steady Scrape", note: "The growth cleared in band the whole pass", test: AWARD.unbroken },
      { id: "logged-quick", name: "Logged Quick", note: "Log closed inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "bare-hand-growth": "You went to tear a clump of growth off the pile with your glove off for a better feel. Barnacle shell cuts like glass and the water on a working pier carries whatever the pier carries; a cut hand in that water is an infection before the dive is over and a diver who cannot grip a tool for the rest of the job. Growth comes off with the scraper, and the hand that reads the pile afterward stays gloved.",
    "umbilical-round-pile": "You started to walk round the pile to reach its far face, taking your umbilical with you. One turn round a pile is a foul the tender cannot pull out and a diver who cannot be hauled if anything goes wrong; two turns and the diver is anchored to the pile. The far face is reached by coming back the way you came and going round the other way, or by asking the surface to reposition the stage — never by circling.",
    "under-the-fender": "You went to work the pile under the floating fender log where it is pinned between the two piles. A fender rises and drops with every wake and every swell, and a diver under it when it comes down is crushed against the pile with no room to move. The fender is worked from below only after it has been lashed off from the surface, or the pile beside it is left for a calmer day.",
    "jet-at-suit": "You turned the water jet toward your own leg to knock silt off your suit. A cleaning jet at working pressure cuts a drysuit and the skin under it faster than you can move your hand away, and a jet turned toward another diver does the same to them. The jet points at the pile and only at the pile, and it is off, not just pointed away, whenever it is not cleaning.",
  },

  lateNotes: {
    "comms-mic": "The findings are dictated once the pile has been read by hand, camera and gauge.",
    "jacket-half": "The jacket goes on once the wrap zone is brushed and flushed.",
    "surface-log": "The log is closed once the wrap is photographed with its plate.",
  },

  steps: [
    {
      id: "pile-brief", kind: "select", target: "inspection-slate",
      title: "Read the inspection plan on the slate",
      cue: "At the pile, read your slate: which pile this is, where the inspection band is marked, what the form wants recorded and what the surface will say when the band is done.",
      why: "An inspection that is not planned pile by pile produces a stack of findings nobody can put back on a drawing. The slate carries the pile's identity from the owner's form and the band the plan marks, so that what the diver finds by hand is written against the right pile, and the surface knows exactly where the diver is when the next pile is called. 29 CFR 1910.421 has the dive planned and briefed before the water; the slate is that plan in the diver's hand.",
    },
    {
      id: "clear-growth", kind: "track", target: "scraper", seconds: 6,
      title: "Clear the growth from the inspection band with the scraper",
      cue: "Scrape the growth off the marked band round the pile in steady strokes — firm enough to take the growth, never so hard the scraper gouges the pile's face.",
      why: "The pile cannot be read through its growth, and the growth comes off with a scraper, not with a hand or a hammer. Too soft and the shell stays and the inspection sees nothing; too hard and the scraper cuts into the concrete or timber and makes a defect where there was none, which the next inspection will record as deterioration. The band is cleared in a steady pass so what the hand reads next is the pile itself.",
      track: { start: 0.12, green: [0.4, 0.62], rise: 0.56, fall: 0.46, drift: 0.12, label: "SCRAPE", readout: (v) => (v < 0.4 ? "growth staying on" : v > 0.62 ? "gouging the face" : "taking the growth clean") },
      holdBreakNote: "The scraping went out of band — growth staying on or the face being gouged. Steady strokes, firm and no more.",
    },
    {
      id: "tactile-inspect", kind: "find", noHint: true,
      targets: ["necked-section", "split-shell"],
      itemNames: { "necked-section": "necked section where the pile has lost material", "split-shell": "vertical split in the pile's face" },
      itemNotes: {
        "necked-section": "The pile is narrower under your hands than above and below — a band of section loss where the concrete or timber has been eaten away at the level the water works hardest.",
        "split-shell": "A vertical split runs up the face under the growth, wide enough to take a fingertip. It was not in the last inspection's record.",
      },
      title: "Read the cleared band by hand",
      cue: "With both gloved hands, feel round the whole band: the pile's diameter against the one above, any softness, splits, exposed steel or hollow sound when tapped.",
      why: "In the water the diver's hands find what the camera misses: a loss of section reads as a narrowing under the palms long before it shows on video, and a split under a skin of growth is a fingertip's width. The tactile pass goes first because it tells the diver where to point the camera and the gauge, and because a defect found by hand and confirmed by camera is a record with two witnesses.",
    },
    {
      id: "video-pass", kind: "hold", target: "helmet-camera", seconds: 5,
      title: "Hold the camera on the band while the surface records",
      cue: "Bring the helmet camera onto the cleared band and hold it steady, working slowly round the pile, while the supervisor confirms the picture and records.",
      why: "The surface sees what the camera sees and nothing else, and a camera that sweeps past a defect gives the record a blur. The diver holds it on the band and turns slowly while the supervisor calls 'recording' and 'clear', because the video is what the engineer reads later and what the owner's form cites; a defect the diver felt but the camera never settled on is a finding without a picture.",
      holdBreakNote: "The camera came off the band — the surface lost the picture. Bring it back and hold it steady.",
    },
    {
      id: "measure-band", kind: "gauge", target: "pit-gauge",
      title: "Gauge the section loss against the inspection form",
      cue: "Set the pit gauge across the necked section and commit when the reading sits in the class the form describes for this pile — not more, not less.",
      why: "The owner's form sorts what a diver finds into classes, and the class decides whether the pile is wrapped today, scheduled or left; that decision is made from the gauge, not from a diver's impression of how bad it looks in green water. The gauge is read against the form's own description so that the same pile inspected by two divers a year apart gets the same class, and a change in class means a change in the pile.",
      gauge: { label: "SECTION LOSS vs FORM", speed: 0.66, green: [0.44, 0.62], readout: (t) => (t < 0.44 ? "reading below the class" : t <= 0.62 ? "in the form's class" : "reading above the class"), missNote: "Outside the band — set the gauge square across the necked section and read it to the form's class." },
    },
    {
      id: "dictate-findings", kind: "select", target: "comms-mic",
      title: "Dictate the findings to the surface log",
      cue: "On comms, pile by pile as the form wants it: the pile number, the band cleared, the necked section and its class, the split and where it runs, and that the video is taken.",
      why: "The surface log is written from the diver's words as they are said, because a diver's memory of six piles at the end of a dive is not a record. 29 CFR 1910.422 has the diver in continuous communication with the surface, and the inspection uses that channel for the findings so the supervisor writes them against the pile number while the diver's hand is still on the defect; a finding said late is a finding on the wrong pile.",
    },
    {
      id: "prep-wrap-zone", kind: "sequence",
      targets: ["prep-brush", "water-jet"],
      itemNames: { "prep-brush": "wrap zone brushed to bare surface", "water-jet": "wrap zone flushed with the jet" },
      title: "Brush the wrap zone to bare surface, then flush it",
      cue: "Wire-brush the whole wrap zone above and below the defect to a clean surface, then flush it with the water jet, pointed at the pile only.",
      why: "A jacket bonds to the pile only where the pile is clean, and a wrap over silt or the film that growth leaves is a wrap with a void behind it that fills with water and does nothing. Brushing goes first because the jet alone leaves the film; the flush comes after because the brushing leaves debris. The jet is aimed at the pile and turned off between uses — it is a cleaning tool that cuts suits and skin as readily as silt.",
      outOfOrderNote: "Out of order — brush the zone to bare surface first; the jet flushes what the brush has loosened.",
    },
    {
      id: "fit-jacket", kind: "drag", target: "jacket-half",
      title: "Fit the jacket halves round the wrap zone",
      cue: "Bring the first jacket half to the pile with its seam on the marked line, hold it while the surface passes the second, and close them round the pile.",
      why: "The jacket halves are heavy in the hand and near-neutral in the water, and they go on where the plan marks the seams so the standoff and the grout space are even round the pile. A jacket fitted crooked leaves one side thin and the other thick, and the grout finds the thin side. The diver fits it with the umbilical kept clear of the seam, because the seam closes hard and a hose caught in it is a hose cut.",
      drag: { to: "wrap-zone", radius: 0.55, missNote: "Not on the zone — the jacket half goes on the pile with its seam on the marked line." },
    },
    {
      id: "fasten-bands", kind: "turn", target: "banding-tool",
      title: "Tighten the bands round the jacket",
      cue: "Tension the banding round the jacket top and bottom with the tool until the jacket sits firm on its standoffs and the bands do not slip.",
      why: "The bands hold the jacket while the grout cures and the pile carries the pier's live load through every tide; a slack band lets the jacket walk down the pile and a band over-tensioned crushes the jacket's edge and opens the seam. The tool is run until the jacket is firm on its standoffs and the band holds, checked by hand, and the diver tells the surface each band is on so the log has them.",
      turn: { turns: 1.2, label: "BAND TENSION", readout: (t) => (t < 0.35 ? "slack — jacket will walk" : t < 0.85 ? "firm on the standoffs" : "over — crushing the edge") },
    },
    {
      id: "seal-seam", kind: "select", target: "jacket-seam",
      title: "Check the jacket seam and the bottom seal by hand",
      cue: "Run a gloved hand down both seams and round the bottom seal: closed, no gap, no hose or growth caught in them.",
      why: "The grout goes in at the top and stays in only if the seams and the bottom seal are closed; a gap the width of a finger drains the annulus as fast as the surface pumps it, and a hose caught in a seam is both a gap and a cut hose. The seams are checked by hand because they are on the far side from the camera and because a seam looks closed from a metre away while a fingertip finds the gap.",
    },
    {
      id: "land-grout-hose", kind: "drag", target: "grout-hose",
      title: "Land the grout hose in the top port",
      cue: "Bring the grout hose to the jacket's top port, seat it and tell the surface 'hose landed — ready for grout' before anyone starts the pump.",
      why: "Grout is pumped from the surface on the diver's word, and a hose that is not seated when the pump starts fills the water with grout instead of the annulus, fogs the site and leaves the jacket empty. The diver lands it, checks it by hand and calls it, and keeps their hands away from the port once the pump runs, because a grout hose under pump pressure whips if it comes free.",
      drag: { to: "grout-port", radius: 0.5, missNote: "Not in the port — the grout hose seats in the jacket's top port before the surface starts the pump." },
    },
    {
      id: "photo-plate", kind: "select", target: "id-plate",
      title: "Photograph the finished wrap with its identity plate",
      cue: "Hold the pile's identity plate against the jacket and let the surface take the still from the helmet camera: pile number, jacket, date plate and the grout port capped.",
      why: "The owner's record needs a picture of the finished repair that says which pile it is, and a jacket in green water looks like every other jacket. The plate in the frame ties the picture to the pile number on the form, and the capped port shows the grout is in; the next inspection diver will start from this picture, and the engineer signing the pier off will look at it before anything else.",
    },
    {
      id: "surface-log", kind: "select", target: "surface-log",
      title: "Close the surface log for this pile",
      cue: "Before you leave the pile, read the log back with the supervisor: the findings, the class, the wrap fitted, the bands, the grout and the photograph, and the fender and the recall.",
      why: "29 CFR 1910.440 has the dive recorded and the owner's form has the pile recorded, and the read-back at the pile is the last chance to fix a wrong pile number or a missing class while the diver can still put a hand on the thing. The two events of the dive — the fender surging and the recall for the approaching craft — go in beside the findings because the next dive at this pier plans around them.",
    },
    {
      id: "crew-checkin", kind: "select", target: "team-board",
      title: "Check in with the dive team at the stage",
      cue: "Back at the stage: the pile's findings said once more for the team, the fender to be lashed before the next pile, the craft that came in, and how everyone is doing.",
      why: "The check-in at the stage is where the dive stops being one diver's job and becomes the team's: the fender that surged is a hazard for whoever dives the next pile, the craft that came in unannounced is a call to the pier operator, and the diver's own condition is watched from here on per 29 CFR 1910.423. The Pile Drivers member assistance line is there for what the stage conversation does not settle.",
    },
  ],

  interrupts: [
    {
      id: "fender-surge",
      kind: "Floating fender surging between the piles",
      after: "clear-growth", delay: 2, seconds: 14,
      alert: "A wake has set the floating fender log between the piles surging — it is rising and dropping against the pile beside you, and your umbilical runs under it.",
      cue: "Call the surface to hold, move out from between the piles to the downline side, and have the tender take your umbilical in clear of the fender.",
      target: "surface-hold",
      why: "A fender that surges is a hammer between two anvils, and a diver or an umbilical between it and a pile is what it hits. The diver does not try to hold it or work under it; the surface is told, the diver moves to the open side where the downline is, and the tender takes the umbilical up out of the fender's reach. Then the surface decides whether the fender is lashed off before the pile is finished.",
      missNote: "The fender came down on the umbilical where it lay across the pile's foot; the tender felt the snatch and the supervisor stopped the dive until the fender was lashed from the surface.",
      wrongNote: "Call the surface to hold and move out from between the piles — the fender is not yours to fight.",
    },
    {
      id: "craft-recall",
      kind: "Surface recall — small craft approaching the pier",
      after: "video-pass", delay: 2, seconds: 14,
      alert: "The supervisor calls: a small craft is coming in along the pier face and has not answered the radio — 'leave the pile, go to the downline and hold at the stage.'",
      cue: "Acknowledge the recall, move to the downline and hold at the stage until the surface clears you back to the pile.",
      target: "downline",
      why: "The dive flag and the pier's notices mean nothing to a boat that has not seen them, and a propeller over a diver's pile is a hazard the diver cannot see coming. The recall is answered at once: the diver acknowledges, goes to the downline where the tender knows exactly where they are, and holds at the stage where they can be brought up if the craft comes closer. The pile waits; the surface clears the diver back when the craft is gone.",
      missNote: "The diver stayed on the pile through the recall; the craft crossed over the site and the supervisor brought the diver up on the umbilical from the wrong pile with the camera still recording.",
      wrongNote: "The downline — acknowledge the recall and go to the stage until the surface clears you.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);

    // ------------------------------------------------------- bottom and piles
    const bottom = box(g, 12, 0.04, 12, 0, -0.02, 0, 0xffffff, { rough: 1, cast: false });
    bottom.material = texturedMat(surfaceTexture((cx, w, h) => mudflatFace(cx, w, h), { repeat: 3, px: 512 }), { rough: 1, color: 0x8f8a74 });
    const growthTex = surfaceTexture((cx, w, h) => growthFace(cx, w, h), { px: 512 });
    growthTex.repeat?.set?.(2, 3);
    const pileMat = texturedMat(growthTex, { rough: 0.95, metal: 0.02, color: 0xe2e8dc });
    const concMat = texturedMat(surfaceTexture((cx, w, h) => concreteFace(cx, w, h, { finish: "rough" }), { px: 256 }), { rough: 0.9, color: 0xc9c5b8 });
    const pileAt = (x, z, h = 6.4) => {
      const p = group(g, x, 0, z);
      const shaft = cyl(p, 0.34, 0.36, h, 0, h / 2, 0, 0xffffff, { seg: 18 });
      shaft.material = pileMat;
      for (const y of [0.3, 1.8]) cyl(p, 0.42, 0.44, 0.3, 0, y, 0, 0x4a5a32, { rough: 1, seg: 16 });
      return p;
    };
    for (const [x, z] of [[-2.8, -2.4], [2.9, -2.6], [-3.0, 1.4], [3.2, 1.6], [0.2, -4.0]]) pileAt(x, z);
    // The working pile: cleared band, defects, the wrap zone.
    const pile = group(g, 0.4, 0, -1.6);
    const lower = cyl(pile, 0.34, 0.36, 1.2, 0, 0.6, 0, 0xffffff, { seg: 18 });
    lower.material = pileMat;
    const band = cyl(pile, 0.33, 0.33, 1.0, 0, 1.7, 0, 0xffffff, { seg: 18 });
    band.material = pileMat;
    const upper = cyl(pile, 0.34, 0.36, 4.2, 0, 4.3, 0, 0xffffff, { seg: 18 });
    upper.material = pileMat;
    for (const y of [0.3, 2.8, 4.4]) cyl(pile, 0.42, 0.44, 0.3, 0, y, 0, 0x56613f, { rough: 1, seg: 16 });
    const bandRing = torus(pile, 0.4, 0.012, 0, 1.2, 0, CDPP_ACCENT, { emissive: CDPP_ACCENT, ei: 1.4, rough: 0.4, cast: false, seg: 6, seg2: 28 });
    bandRing.rotation.x = Math.PI / 2;
    const bandRing2 = torus(pile, 0.4, 0.012, 0, 2.2, 0, CDPP_ACCENT, { emissive: CDPP_ACCENT, ei: 1.4, rough: 0.4, cast: false, seg: 6, seg2: 28 });
    bandRing2.rotation.x = Math.PI / 2;
    holoTag(pile, "working pile — inspection band", 0, 2.6, 0.5, { css: CDPP_CSS, w: 0.56 });
    const necked = cyl(pile, 0.3, 0.3, 0.3, 0, 1.6, 0, 0xffffff, { seg: 18 });
    necked.material = concMat;
    necked.visible = false;
    const neckedHit = box(pile, 0.3, 0.3, 0.3, 0.3, 1.6, 0.2, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, neckedHit, "necked-section");
    const split = box(pile, 0.03, 0.6, 0.05, -0.2, 1.75, 0.28, 0x1b1e22, { rough: 1, emissive: 0x2a1a0a, ei: 0.3 });
    split.rotation.y = 0.6;
    reg(hits, split, "split-shell");
    const wrapZone = group(pile, 0, 1.7, 0);
    torus(wrapZone, 0.5, 0.01, 0, 0, 0, CDPP_ACCENT, { emissive: CDPP_ACCENT, ei: 1.2, rough: 0.4, cast: false, seg: 6, seg2: 28 }).rotation.x = Math.PI / 2;
    holoTag(wrapZone, "wrap zone — seam line", 0.55, 0.2, 0, { css: CDPP_CSS, w: 0.42 });
    reg(hits, wrapZone, "wrap-zone");
    const jacketOn = group(pile, 0, 1.7, 0);
    const jShell = cyl(jacketOn, 0.46, 0.46, 1.3, 0, 0, 0, 0xd8d3c4, { rough: 0.6, seg: 20 });
    void jShell;
    for (const y of [-0.55, 0.55]) torus(jacketOn, 0.47, 0.02, 0, y, 0, 0x8a949d, { rough: 0.35, metal: 0.8, seg: 6, seg2: 24 }).rotation.x = Math.PI / 2;
    box(jacketOn, 0.02, 1.3, 0.06, 0, 0, 0.46, 0xb8b3a4, { rough: 0.6 });
    jacketOn.visible = false;
    const seam = group(pile, 0.1, 1.7, 0.48);
    torus(seam, 0.08, 0.008, 0, 0, 0, CDPP_ACCENT, { emissive: CDPP_ACCENT, ei: 1.2, rough: 0.4, cast: false, seg: 6, seg2: 16 });
    holoTag(seam, "seam · bottom seal", 0.3, 0.1, 0, { css: CDPP_CSS, w: 0.34 });
    reg(hits, seam, "jacket-seam");
    const groutPort = group(pile, 0, 2.4, 0.42);
    cyl(groutPort, 0.05, 0.05, 0.1, 0, 0, 0, 0x2b3138, { rough: 0.5, metal: 0.5, seg: 12 }).rotation.x = Math.PI / 2;
    torus(groutPort, 0.1, 0.008, 0, 0, 0.06, CDPP_ACCENT, { emissive: CDPP_ACCENT, ei: 1.4, rough: 0.4, cast: false, seg: 6, seg2: 18 });
    holoTag(groutPort, "top grout port", 0, 0.2, 0.1, { css: CDPP_CSS, w: 0.3 });
    reg(hits, groutPort, "grout-port");
    const walkHit = box(g, 0.6, 1.2, 0.6, 0.4, 0.8, -2.5, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "walk round the pile with the line?", 0.4, 1.7, -2.5, { css: "#d2312b", w: 0.6 });
    reg(hits, walkHit, "umbilical-round-pile");
    // Floating fender log pinned between two piles, off to the right.
    const fender = group(g, 3.05, 3.4, -0.5);
    const fLog = cyl(fender, 0.3, 0.3, 4.0, 0, 0, 0, 0x4a3a28, { rough: 0.95, seg: 14 });
    fLog.rotation.x = Math.PI / 2;
    for (const z of [-1.6, 1.6]) torus(fender, 0.34, 0.03, 0, 0, z, 0x8a949d, { rough: 0.4, metal: 0.7, seg: 6, seg2: 16 });
    holoTag(fender, "floating fender", 0, 0.5, 0, { css: CDPP_CSS, w: 0.3 });
    const fenderHome = fender.position.y;
    const underHit = box(g, 0.8, 0.8, 1.2, 3.05, 2.4, -0.5, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "work under the fender?", 3.05, 2.0, -0.5, { css: "#d2312b", w: 0.44 });
    reg(hits, underHit, "under-the-fender");
    // Bottom debris and growth.
    for (let i = 0; i < 9; i++) ball(g, 0.12 + (i % 3) * 0.05, -4 + i * 0.9, 0.06, 2.6 + Math.sin(i) * 0.8, 0x4a5a32, { rough: 1, seg: 8, seg2: 6 });
    for (let i = 0; i < 6; i++) { const w = cyl(g, 0.02, 0.03, 0.8 + (i % 2) * 0.3, -3.6 + i * 1.3, 0.45, 3.6, 0x2f5a3a, { rough: 1, seg: 6 }); w.rotation.z = 0.15 * (i % 3 - 1); }
    box(g, 1.4, 0.2, 0.3, -1.6, 0.1, 2.2, 0x3a2e20, { rough: 0.95 });
    const tyre = torus(g, 0.32, 0.1, 2.0, 0.12, 2.8, 0x1b1e22, { rough: 0.95, seg: 8, seg2: 18 });
    tyre.rotation.x = Math.PI / 2;

    // ------------------------------------------------------- the diver's tools
    const slate = decal(g, 0.26, 0.2, -0.5, 1.15, -0.4, paperFace("INSPECTION PLAN", ["Pile: per the form", "Band: marked", "Record: class · video"], { bg: "#f3efe4", band: CDPP_CSS }), { px: 128 });
    slate.rotation.y = 0.5;
    holoTag(g, "diver's slate", -0.5, 1.35, -0.4, { css: CDPP_CSS, w: 0.26 });
    reg(hits, slate, "inspection-slate");
    const scraper = group(g, 0.95, 1.4, -1.1);
    box(scraper, 0.04, 0.03, 0.3, 0, 0, 0, 0x3a4148, { rough: 0.6, metal: 0.5 });
    box(scraper, 0.12, 0.01, 0.08, 0, 0, 0.18, 0xc0c6cc, { rough: 0.3, metal: 0.8 });
    holoTag(scraper, "scraper — clear the band", 0, 0.2, 0, { css: CDPP_CSS, w: 0.44 });
    reg(hits, scraper, "scraper");
    const bareHit = box(g, 0.3, 0.3, 0.3, 1.1, 2.0, -1.2, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "glove off — tear it by hand?", 1.1, 2.3, -1.2, { css: "#d2312b", w: 0.5 });
    reg(hits, bareHit, "bare-hand-growth");
    const camera = group(g, -0.3, 1.9, -0.9);
    box(camera, 0.1, 0.08, 0.14, 0, 0, 0, 0x1b1e22, { rough: 0.5 });
    const lens = cyl(camera, 0.03, 0.03, 0.04, 0, 0, 0.08, 0x6ab8d8, { rough: 0.1, metal: 0.3, seg: 12 });
    lens.rotation.x = Math.PI / 2;
    const recLamp = ball(camera, 0.015, 0.04, 0.05, 0.02, 0x59c97b, { emissive: 0x59c97b, ei: 0.8, rough: 0.3, seg: 6, seg2: 4 });
    holoTag(camera, "helmet camera — hold on the band", 0, 0.2, 0, { css: CDPP_CSS, w: 0.56 });
    reg(hits, camera, "helmet-camera");
    const gauge = group(g, 0.1, 1.05, -0.7);
    box(gauge, 0.22, 0.03, 0.03, 0, 0, 0, 0xc0c6cc, { rough: 0.3, metal: 0.8 });
    const gNeedle = box(gauge, 0.01, 0.06, 0.01, -0.08, 0.04, 0, 0xd2312b, { rough: 0.4 });
    for (let i = 0; i < 5; i++) box(gauge, 0.006, 0.02, 0.01, -0.08 + i * 0.04, 0.025, 0.012, 0x1b1e22, { rough: 0.5 });
    holoTag(gauge, "pit gauge", 0, 0.16, 0, { css: CDPP_CSS, w: 0.22 });
    reg(hits, gauge, "pit-gauge");
    const mic = group(g, -0.7, 1.7, -0.6);
    ball(mic, 0.05, 0, 0, 0, 0x2b3138, { rough: 0.5, seg: 10, seg2: 8 });
    torus(mic, 0.09, 0.008, 0, 0, 0, CDPP_ACCENT, { emissive: CDPP_ACCENT, ei: 1.2, rough: 0.4, cast: false, seg: 6, seg2: 16 });
    holoTag(mic, "comms — dictate to the log", 0, 0.18, 0, { css: CDPP_CSS, w: 0.48 });
    reg(hits, mic, "comms-mic");
    const brush = group(g, 1.3, 0.9, -0.6);
    box(brush, 0.05, 0.04, 0.24, 0, 0, 0, 0x5b4a3a, { rough: 0.9 });
    box(brush, 0.06, 0.03, 0.1, 0, -0.03, 0.14, 0x8a949d, { rough: 0.6, metal: 0.6 });
    holoTag(brush, "wire brush", 0, 0.16, 0, { css: CDPP_CSS, w: 0.22 });
    reg(hits, brush, "prep-brush");
    const jet = group(g, 1.7, 0.7, -0.3);
    cyl(jet, 0.03, 0.03, 0.5, 0, 0, 0, 0x3a4148, { rough: 0.5, metal: 0.5, seg: 10 }).rotation.x = Math.PI / 2;
    box(jet, 0.08, 0.12, 0.1, 0, -0.06, -0.15, 0x2b3138, { rough: 0.6 });
    hose(jet, [[0, -0.1, -0.25], [0.3, -0.3, -0.4], [0.8, -0.5, -0.2]], 0.02, 0x2f8f5a, { steps: 8, rough: 0.7 });
    holoTag(jet, "water jet — at the pile only", 0, 0.2, 0, { css: CDPP_CSS, w: 0.5 });
    reg(hits, jet, "water-jet");
    const jetSelfHit = box(g, 0.3, 0.3, 0.3, 2.1, 0.5, -0.3, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "jet the silt off your own leg?", 2.1, 0.85, -0.3, { css: "#d2312b", w: 0.54 });
    reg(hits, jetSelfHit, "jet-at-suit");
    const spray = group(g, 0.9, 1.7, -1.3);
    for (let i = 0; i < 5; i++) ball(spray, 0.03, -i * 0.08, 0, 0, 0xdff4f6, { rough: 0.1, opacity: 0.55, transparent: true, cast: false, seg: 6, seg2: 4 });
    spray.visible = false;
    const jacketHalf = group(g, -1.5, 0.75, -0.9);
    const jh = cyl(jacketHalf, 0.46, 0.46, 1.3, 0, 0, 0, 0xd8d3c4, { rough: 0.6, seg: 20, open: true });
    jh.rotation.z = Math.PI / 2;
    box(jacketHalf, 0.06, 0.3, 0.06, 0, 0.5, 0, 0xb8b3a4, { rough: 0.6 });
    holoTag(jacketHalf, "jacket half", 0, 0.7, 0, { css: CDPP_CSS, w: 0.24 });
    reg(hits, jacketHalf, "jacket-half");
    const bandTool = group(g, -1.0, 0.6, -1.6);
    const btWheel = valveWheel(bandTool, 0, 0.1, 0, { r: 0.06, color: 0x2b3138, body: 0x5b6771 });
    btWheel.scale.set(0.7, 0.7, 0.7);
    box(bandTool, 0.06, 0.06, 0.3, 0, 0.05, 0.2, 0x3a4148, { rough: 0.6, metal: 0.5 });
    holoTag(bandTool, "banding tool", 0, 0.4, 0, { css: CDPP_CSS, w: 0.26 });
    reg(hits, bandTool, "banding-tool");
    const groutHose = group(g, 1.6, 1.4, -2.2);
    hose(groutHose, [[0, 0, 0], [0.4, 0.6, 0.4], [1.0, 1.6, 1.2], [1.6, 3.4, 2.2]], 0.035, 0x8a8f93, { steps: 10, rough: 0.8 });
    cyl(groutHose, 0.05, 0.05, 0.12, 0, 0, 0, 0x2b3138, { rough: 0.5, metal: 0.5, seg: 12 });
    holoTag(groutHose, "grout hose from the surface", 0, 0.24, 0, { css: CDPP_CSS, w: 0.5 });
    reg(hits, groutHose, "grout-hose");
    const plate = decal(g, 0.18, 0.12, -0.9, 1.0, -1.15, paperFace("PILE ID", ["Per the form"], { bg: "#f2c14b", band: "#1b1e22" }), { px: 96 });
    plate.rotation.y = 0.3;
    holoTag(g, "identity plate", -0.9, 1.15, -1.15, { css: CDPP_CSS, w: 0.28 });
    reg(hits, plate, "id-plate");

    // ------------------------------------------------------- downline, stage, umbilical, surface calls
    const downline = group(g, -3.4, 0, 2.0);
    cyl(downline, 0.015, 0.015, 6.0, 0, 3.0, 0, 0xf2c14b, { rough: 0.8, seg: 8 });
    box(downline, 0.5, 0.2, 0.5, 0, 0.1, 0, 0x5b6771, { rough: 0.7, metal: 0.4 });
    torus(downline, 0.3, 0.012, 0, 0.4, 0, CDPP_ACCENT, { emissive: CDPP_ACCENT, ei: 1.4, rough: 0.4, cast: false, seg: 6, seg2: 24 }).rotation.x = Math.PI / 2;
    holoTag(downline, "downline — to the stage", 0, 1.2, 0, { css: CDPP_CSS, w: 0.44 });
    reg(hits, downline, "downline");
    const umbilical = hose(g, [[-4.3, 1.4, 2.8], [-2.6, 0.5, 1.2], [-1.0, 0.4, -0.2], [0.0, 1.2, -0.9]], 0.025, 0xf2c14b, { steps: 14, rough: 0.8 });
    void umbilical;
    const holdCall = group(g, -1.2, 2.2, 0.4);
    torus(holdCall, 0.1, 0.008, 0, 0, 0, 0xd2312b, { emissive: 0xd2312b, ei: 1.2, rough: 0.4, cast: false, seg: 6, seg2: 16 });
    box(holdCall, 0.06, 0.06, 0.06, 0, 0, 0, 0x2b3138, { rough: 0.5 });
    holoTag(holdCall, "call the surface — hold", 0, 0.18, 0, { css: CDPP_CSS, w: 0.44 });
    reg(hits, holdCall, "surface-hold");
    const logBoard = decal(g, 0.5, 0.34, -2.2, 1.6, 1.3, paperFace("SURFACE LOG", ["Pile ____ · class ____", "Wrap · bands · grout ____", "Photo ____"], { bg: "#eef6f8", band: "#2b7a98" }), { px: 192 });
    logBoard.rotation.y = 0.8;
    holoTag(g, "surface log — read back", -2.2, 1.9, 1.3, { css: CDPP_CSS, w: 0.46 });
    reg(hits, logBoard, "surface-log");
    const team = decal(g, 0.6, 0.4, -3.4, 1.9, 2.6, (cx, w, h) => {
      cx.fillStyle = "#101c27"; cx.fillRect(0, 0, w, h); cx.fillStyle = "#59c97b"; cx.fillRect(0, 0, w, 6);
      cx.font = `600 ${Math.round(h * 0.15)}px 'Barlow Condensed', Arial, sans-serif`; cx.textAlign = "left"; cx.textBaseline = "middle";
      cx.fillStyle = "#e6f6ea"; cx.fillText("DIVE TEAM — STAGE", w * 0.06, h * 0.22);
      cx.font = `${Math.round(h * 0.11)}px Arial, sans-serif`; cx.fillStyle = "#f4f8fb";
      ["Supervisor · Diver", "Tender · Standby", "Fender: lash before next pile"].forEach((l, i) => cx.fillText(l, w * 0.06, h * (0.46 + i * 0.18)));
    }, { px: 256, glow: true, ei: 0.6 });
    team.rotation.y = 0.5;
    reg(hits, team, "team-board");
    // The standby diver's shadow at the stage, and a craft's hull that appears overhead on the recall.
    const standby = standingFigure(g, -4.0, 3.2, { ry: 1.0, cloth: 0x1b1e22, trousers: 0x1b1e22, gloves: 0x2b2b2b });
    ball(standby, 0.18, 0, 1.63, 0, 0xd8dde2, { rough: 0.35, metal: 0.4, seg: 12, seg2: 10 });
    holoTag(standby, "standby at the stage", 0, 2.05, 0, { css: CDPP_CSS, w: 0.4 });
    const hull = group(g, 1.0, 5.2, -0.5);
    const hullBody = box(hull, 1.6, 0.5, 4.6, 0, 0, 0, 0x1b1e22, { rough: 0.6 });
    void hullBody;
    for (let i = 0; i < 4; i++) ball(hull, 0.06 + i * 0.02, 0.2 * i, -0.3, -2.4 - i * 0.3, 0xdff4f6, { rough: 0.1, opacity: 0.5, transparent: true, cast: false, seg: 6, seg2: 4 });
    hull.visible = false;
    const silt = group(g, 0.4, 0.3, -1.6);
    for (let i = 0; i < 6; i++) ball(silt, 0.08, Math.cos(i) * 0.5, 0.05 * i, Math.sin(i) * 0.5, 0x8f8a74, { rough: 1, opacity: 0.4, transparent: true, cast: false, seg: 6, seg2: 4 });
    silt.visible = false;

    return {
      hits,
      spawnLook: new THREE.Vector3(0.4, 1.4, -1.6),
      onStep() {},
      onStepComplete(step) {
        if (step.id === "clear-growth") { band.material = concMat; silt.visible = true; }
        if (step.id === "tactile-inspect") { necked.visible = true; split.material = mat(0x59c97b, { rough: 0.8 }); }
        if (step.id === "video-pass") recLamp.material = mat(0xd2312b, { emissive: 0xd2312b, ei: 0.9 });
        if (step.id === "measure-band") gNeedle.material = mat(0x59c97b, { rough: 0.4 });
        if (step.id === "prep-wrap-zone") { spray.visible = false; silt.visible = false; }
        if (step.id === "fit-jacket") { jacketHalf.visible = false; jacketOn.visible = true; }
        if (step.id === "seal-seam") seam.children[0].material = mat(0x59c97b, { emissive: 0x59c97b, ei: 1.0 });
        if (step.id === "land-grout-hose") groutHose.position.set(0.4, 2.4, -1.1);
        if (step.id === "photo-plate") plate.position.set(0.9, 1.7, -1.2);
        if (step.id === "surface-log") repaint(logBoard, paperFace("SURFACE LOG", ["Pile · class: written", "Wrap · bands · grout: in", "Photo · fender · recall"], { bg: "#e6f6ea", band: "#59c97b" }));
      },
      onHazard() {},
      onInterrupt(it) {
        if (it.id === "fender-surge") fender.position.y = fenderHome - 0.6;
        if (it.id === "craft-recall") hull.visible = true;
      },
      onInterruptEnd(it) {
        if (it.id === "fender-surge") { fender.position.y = fenderHome; if (it.resolved === "answered") fender.position.x = 3.4; }
        if (it.id === "craft-recall") hull.visible = false;
      },
      animate(t, dt, session) {
        const step = session?.step;
        if (session?.turn && step?.id === "fasten-bands") btWheel.userData.wheel.rotation.y = session.turn.amount * Math.PI * 2;
        const gg = session?.gauge;
        if (gg && !gg.committed && step?.id === "measure-band") gNeedle.position.x = -0.08 + gg.t * 0.16;
        if (step?.id === "clear-growth" && session.holding) { scraper.position.y = 1.4 + Math.sin(t * 6) * 0.1; spray.visible = false; }
        if (step?.id === "prep-wrap-zone") spray.visible = true;
        if (fender.position.y < fenderHome - 0.1) fender.position.y = fenderHome - 0.6 + Math.sin(t * 4) * 0.25;
        if (hull.visible) hull.position.z = -0.5 + Math.sin(t * 0.8) * 1.5;
        void dt;
      },
    };
  },
};
