import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import { box, cyl, ball, torus, group, decal, repaint, signFace, paperFace, mat } from "../../../shared/kit.js";
import { stationPad, holoPanel, holoTag, reg, surfaceTexture, texturedMat, waterFace, instrument, valveWheel, standingFigure } from "../citykit.js";
import { woodGrainFace } from "../../../shared/textures.js";
import { radio } from "../../../shared/toolkit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Invasive Species Identification & Reporting VR — Marine
// Ecology & Restoration, station eight of the ECO1 pack.
//
// A marina float on a generic harbour: a monitoring technician finds
// something on the float's underside that does not match the reference
// card, and the station teaches what happens next — the reporting METHOD.
// Nothing is named, nothing is scraped off, nothing is carried away wet to
// another dock; the specimen is photographed to the protocol with a scale
// card, its position fixed to the protocol's accuracy, a sample bagged only
// as the protocol allows, the report form completed and the coordinator
// called before anyone posts a picture. No species, count or place is
// asserted; the learner is taught how a sighting becomes a record.

const MEIS_ACCENT = 0xb96fc8;
const MEIS_CSS = "#b96fc8";
const MEIS_WARN = "#e8622a";

function meisForm(lines, band = MEIS_CSS) {
  return (cx, w, h) => {
    cx.fillStyle = "#170f1c"; cx.fillRect(0, 0, w, h); cx.fillStyle = band; cx.fillRect(0, 0, w, 6);
    cx.font = `600 ${Math.round(h * 0.14)}px 'Barlow Condensed', Arial, sans-serif`; cx.textAlign = "left"; cx.textBaseline = "middle";
    cx.fillStyle = "#f3e8f7"; cx.fillText("SIGHTING REPORT FORM", w * 0.06, h * 0.2);
    cx.font = `${Math.round(h * 0.1)}px Arial, sans-serif`; cx.fillStyle = "#f8f0fb";
    lines.forEach((l, i) => cx.fillText(l, w * 0.06, h * (0.45 + i * 0.17)));
  };
}

export const SIM_ME_INVASIVE_SPECIES_IDENTIFICATION_AND_REPORTING = {
  id: "me-invasive-species-identification-and-reporting",
  index: "608",
  domain: "Environmental",
  trade: "Monitoring technician on a harbour survey crew, documenting and reporting a sighting that does not match the reference card, with a coordinator on the radio",
  category: "Water & Environmental",
  district: "Environmental Monitoring",
  weather: "overcast",
  certification: "AFSCME and LIUNA monitoring crews as training bodies; OSHA 29 CFR 1910.132 personal protective equipment for work at a float's edge; CDFW as the body a marine sighting is reported to and whose permit governs any sample taken; the U.S. Fish and Wildlife Service and NOAA Fisheries consultation measures where a sighting touches protected habitat; BCDC permit conditions for the marina; Regional Water Quality Control Board Section 401 conditions the harbour record informs",
  name: "Invasive Species Identification & Reporting",
  title: simTitle("Invasive Species Identification & Reporting"),
  tagline: "The reporting protocol read, the kit checked, the float edge walked at survey pace while a second patch turns up, the position fixed to the protocol's accuracy, the scale card set beside the specimen, the camera held for the diagnostic set while a boater offers to scrape it off, the shots taken in order, the earlier tag and the second patch found, the sample bagged as the permit allows, the form completed, the coordinator called and the sighting logged",
  accent: MEIS_ACCENT,
  accentCss: MEIS_CSS,
  parSeconds: 300,
  footprint: 2.6,
  badge: { id: "reported-not-removed", name: "Reported, Not Removed", note: "A sighting turned into a record — photographed to protocol, positioned, sampled only as permitted, reported before it was touched" },

  supportLine: "your union hall's member assistance programme — AFSCME or LIUNA, whichever your crew works under — with the employer's employee assistance line behind it",

  game: system({
    name: "Sighting Crew",
    currency: "REPORT",
    ranks: ["Dock Hand", "Observer", "Survey Tech", "Reporting Lead", "Sighting Certified"],
    badges: [
      { id: "shots-in-order", name: "Shots In Order", note: "Overall, close-up with scale, habitat — first time", test: AWARD.stepClean("photo-set") },
      { id: "hands-off", name: "Hands Off", note: "Never a hazard, never a scrape, never a wet transfer", test: AWARD.safe },
      { id: "fixed-position", name: "Fixed Position", note: "The position committed inside the protocol's accuracy", test: AWARD.precise(0.72) },
    ],
    challenges: [
      { id: "clean-report", name: "Clean Report", note: "No corrections from the protocol to the log", test: AWARD.clean },
      { id: "steady-camera", name: "Steady Camera", note: "The edge walked and the camera held without a break", test: AWARD.unbroken },
      { id: "reported-early", name: "Reported Early", note: "Sighting reported and logged inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "scrape-it-off": "You took the scraper to the patch to get it off the float before it spread. Whatever it is, scraping breaks it into fragments that drift to every float in the marina, and the record of what was here — the photographs, the position, the sample the permit allows — is gone with it. Nothing is removed until the body the report goes to says how; the protocol is document, report, wait.",
    "carry-it-wet-to-the-boat": "You put a wet piece of the patch in an open bucket to show the boat crew at the next dock. Live material carried wet from one site to another is how a sighting becomes two sightings; a sample travels only as the permit allows — sealed, labelled, to the laboratory the coordinator names — and never to another float, boat or harbour.",
    "post-it-first": "You photographed the patch and posted it to the crew's public feed with a name before the report was in. A sighting is a record only when it reaches the body the protocol names, and a name guessed on a float is a claim the programme has to walk back; the form goes in first, the coordinator confirms, and what is said publicly is said by the programme.",
    "lean-off-the-float-edge": "You lay flat on the float's edge and reached under it with both hands to lift the patch into the light. A float's edge is wet, the water under it is cold and deep, and a technician with both arms under a float and their weight over the edge has nothing holding them on it; the underside is photographed with the pole camera and the mirror, from a knee, inboard.",
  },

  lateNotes: {
    "scale-card": "The scale card is set once the position is fixed — a photograph without a position is a picture of something somewhere.",
    "sample-bag": "The sample is bagged once the photo set is complete — the specimen is recorded as it was before anything is taken from it.",
    "coordinator-radio": "The coordinator is called once the form is complete — the call reads the form, and a form half-filled is a call that has to be made twice.",
  },

  steps: [
    {
      id: "reporting-protocol", kind: "select", target: "protocol-board",
      title: "Read the reporting protocol for a sighting",
      cue: "Check the reference card this survey works from, what a mismatch triggers, the photo set the protocol wants, the position accuracy, what sampling the permit allows, who is called, and what is not done.",
      why: "A sighting is worth exactly what its record is worth, and the protocol is what turns a technician's 'that does not look right' into a record a body can act on: a photo set taken the same way every time, a position to a stated accuracy, a sample only where the permit allows, and a report to the named body before anything else. Reading it first is how a surprised technician does the same thing an unsurprised one would.",
    },
    {
      id: "sighting-kit", kind: "sequence", anyOrder: true,
      targets: ["camera-check", "scale-card-check", "position-unit"],
      itemNames: { "camera-check": "camera with the pole and mirror", "scale-card-check": "scale and colour card", "position-unit": "position unit switched on and settling" },
      title: "Check the camera, the scale card and the position unit",
      cue: "Camera charged with the pole and the mirror attached, the scale and colour card in the kit, and the position unit on and settling before the first photograph.",
      why: "The three things a sighting report cannot be made without are a photograph, a scale in it and a position under it, and a technician who finds the card missing or the unit dead at the float's edge has a sighting nobody can verify. The unit is switched on first because it takes time to settle to the protocol's accuracy, and a position read before it has is a position that will be argued with.",
    },
    {
      id: "walk-the-float", kind: "track", target: "float-edge", seconds: 6,
      title: "Walk the float's edge at survey pace, checking the underside",
      cue: "Walk the float's edge on a knee's width inboard at the protocol's pace, checking the underside with the mirror at each cleat — steady, both hands free of the water.",
      why: "The survey looks at the same floats the same way every visit, and the pace is what makes it a survey rather than a stroll: fast misses what is under the edge; slow becomes a technician on their knees over the water for an hour. The mirror on the pole does the reaching so the technician's weight stays inboard, and the walk is where a mismatch is first seen — the rest of the station is what happens after that.",
      track: { start: 0.14, green: [0.4, 0.6], rise: 0.55, fall: 0.45, drift: 0.12, label: "SURVEY PACE ON THE FLOAT", readout: (v) => (v < 0.4 ? "stopped — leaning over the edge" : v > 0.6 ? "hurrying — missing the underside" : "steady, mirror at each cleat") },
      holdBreakNote: "The pace broke — hurrying past the cleats or stopped over the edge. Get back a knee inboard and take up the pace.",
    },
    {
      id: "fix-position", kind: "gauge", target: "position-readout",
      title: "Fix the position to the protocol's accuracy",
      cue: "Hold the position unit over the cleat nearest the patch and commit the fix when its accuracy reading is inside the protocol's band.",
      why: "The report's position is what lets the body that receives it send someone to the same cleat on the same float, and a fix committed while the unit is still settling is a fix that lands on the wrong float or in the water. The accuracy band is the protocol's; the technician waits for it, over the cleat, and commits — the marina's name and the float's number go on the form beside it, because a number alone finds nothing.",
      gauge: { label: "POSITION ACCURACY", speed: 0.7, green: [0.42, 0.62], readout: (t) => (t < 0.42 ? "settling — outside the band" : t <= 0.62 ? "inside the protocol's band" : "drifted — hold over the cleat"), missNote: "Outside the protocol's accuracy — hold the unit over the cleat and commit when the reading settles into the band." },
    },
    {
      id: "set-scale", kind: "drag", target: "scale-card",
      title: "Set the scale card beside the specimen",
      cue: "Set the scale and colour card flat on the float beside the patch, in the same plane as it, without touching the patch.",
      why: "A photograph without a scale is a photograph of something of unknown size, and size is often what separates one identification from another; the card in the same plane as the specimen is what lets someone at a desk measure from the picture. It is set beside the patch, not on it, because the specimen is recorded as found — the card is the ruler, not a tool for moving anything.",
      drag: { to: "card-socket", radius: 0.5, missNote: "Not beside the patch — the card goes flat on the float next to the specimen, in its plane, touching nothing." },
    },
    {
      id: "camera-hold", kind: "hold", target: "camera-hold", seconds: 5,
      title: "Hold the camera steady for the diagnostic close-up",
      cue: "Hold the camera square over the patch and the card at the protocol's distance for the full count — no tilt, no shadow, no hurry.",
      why: "The close-up is the photograph the identification will be made from, and it has to show the features the reference card names sharply and at a known scale; a shot taken tilted or moving shows a blur beside a card whose scale no longer applies. Holding for the full count is the float-side proof the shot is one a specialist can work from — a rushed one cannot be told from a careful one until the identification stalls.",
      holdBreakNote: "The camera drifted off square before the count was done — the close-up would not carry the scale. Settle over the card and hold again.",
    },
    {
      id: "photo-set", kind: "sequence",
      targets: ["shot-overall", "shot-closeup", "shot-habitat"],
      itemNames: { "shot-overall": "overall shot of the patch on the float", "shot-closeup": "close-up with the scale and colour card", "shot-habitat": "habitat shot of the float, the cleat and the water" },
      title: "Take the protocol's photo set in order",
      cue: "Overall shot of the patch where it sits, then the close-up with the card, then the habitat shot showing the float, the cleat number and the water — in that order, every time.",
      why: "The photo set is taken in the same order every time so the frames on the camera match the form's boxes without anyone sorting them later: the overall shot says what and how much, the close-up says what exactly, the habitat shot says where and on what. A set taken in whatever order the light suggested is a set someone else has to reconstruct, and the report waits while they do.",
      outOfOrderNote: "Out of order — overall, then close-up with the card, then habitat. The camera's frame order is the form's box order.",
    },
    {
      id: "find-more", kind: "find", noHint: true,
      targets: ["earlier-tag", "second-patch"],
      itemNames: { "earlier-tag": "the numbered report tag from an earlier sighting on this float", "second-patch": "the second patch on the far side of the cleat" },
      itemNotes: {
        "earlier-tag": "A numbered tag zip-tied to the cleat by an earlier crew. Its number goes on the form so today's sighting is linked to the record already open — a second report on the same patch with no link is two records of one thing.",
        "second-patch": "A smaller patch on the far side of the cleat, easy to miss with the eye on the first. It gets its own photo set and its own line on the form; one report that says 'several' is a report somebody has to come back and count.",
      },
      title: "Find the earlier tag and the second patch",
      cue: "Before the sample, look for a report tag from an earlier crew and for any other patch on this float's edge; both change what goes on the form.",
      why: "A sighting seldom stands alone: an earlier crew may have tagged the same float, and the patch that caught the eye is often not the only one. Finding both before the sample is taken is what makes the form a record of the float rather than of the first thing seen — the tag links the reports, and the second patch gets the same set, so nobody has to come back to ask how many.",
    },
    {
      id: "bag-sample", kind: "turn", target: "sample-jar-lid",
      title: "Take the permitted sample and seal the jar",
      cue: "Take only what the permit's line on the protocol allows, with the forceps, into the labelled jar of site water, and turn the lid down until the seal indicator lines up.",
      why: "The permit says whether a sample may be taken at all and how much, and the answer is taken with forceps into a labelled jar of the site's own water so it reaches the laboratory alive and traceable; the lid is turned to its indicator because a jar that leaks in the kit bag is a sample that has been transferred to every other jar in it. The sample is for the laboratory the coordinator names, and it goes nowhere else.",
      turn: { turns: 0.75, label: "SAMPLE JAR LID", readout: (t) => (t < 0.3 ? "lid loose" : t < 0.9 ? "turning down" : "sealed — indicator lined up") },
    },
    {
      id: "report-form", kind: "sequence", anyOrder: true,
      targets: ["form-position", "form-photos", "form-contact"],
      itemNames: { "form-position": "marina, float and cleat with the committed fix", "form-photos": "photo frame numbers per shot and the earlier tag's number", "form-contact": "observer, crew, time and the coordinator called" },
      title: "Complete the sighting report form",
      cue: "Fill the position box with the marina, float, cleat and the committed fix; the photo box with the frame numbers per shot and the earlier tag; and the contact box with observer, crew, time and who was called.",
      why: "The form is the sighting: it is what the body receives, what a specialist works from and what the programme will be asked about later. Every box has a reason — the position so someone can return, the frames so the pictures can be matched to the words, the contact so a question has someone to go to — and a form with a box empty is a report that comes back for the answer after the crew has left the float.",
    },
    {
      id: "coordinator-call", kind: "select", target: "coordinator-radio",
      title: "Call the coordinator and read the form",
      cue: "On the radio: read the form to the coordinator — position, what was seen, the photo set, the tag, the sample taken as permitted — and take their instruction on the float before leaving it.",
      why: "The coordinator is the link between a technician on a float and the body the report goes to, and the call is where the sighting stops being the technician's alone: the coordinator confirms the form, says where the sample goes and whether anyone else is coming, and hears how the technician is after a boater's argument at the float's edge. It is the crew's check-in too — the AFSCME or LIUNA member assistance line stands behind it for whatever the call does not settle.",
    },
    {
      id: "sighting-log", kind: "select", target: "sighting-log",
      title: "Log the sighting in the survey record",
      cue: "Log the float and cleat, the fix, the photo frames, the tag, the second patch, the sample and its destination, the coordinator's instruction, and the boater's request and the answer given.",
      why: "The survey record is where this float's history lives — the earlier tag came from it, and the next crew's briefing will too. It is written on the float with the form and the camera in hand so the frames, the fix and the boxes agree, and it records what was refused as well as what was done, because a boater who was told no today will ask someone else tomorrow.",
    },
  ],

  interrupts: [
    {
      id: "second-sighting-called",
      kind: "Second surveyor calls a sighting",
      after: "walk-the-float", delay: 2, seconds: 14,
      alert: "The second surveyor on the next float is on the radio — they have a patch under their edge too and want to know what to do with it.",
      cue: "Drop a flag marker at your own patch so you can find it again, then tell them: photograph, do not touch, wait for you.",
      target: "flag-marker",
      why: "Two sightings at once is when a protocol earns its keep: the technician marks their own so the pace of the walk is not lost to memory, and gives the second surveyor the same three words the protocol gives everyone — photograph, do not touch, wait. A technician who abandons an unmarked patch to go and look at the other has two sightings and one position.",
      missNote: "You left your patch unmarked to walk to the next float, and when you came back the light had changed and the cleat looked like every other cleat; the fix and the photo set were made on the wrong one.",
      wrongNote: "Not that. The flag marker — drop it at your own patch first, then answer the radio with the protocol's three words.",
    },
    {
      id: "boater-offers-to-scrape",
      kind: "Boater offers to scrape it off",
      after: "camera-hold", delay: 2, seconds: 14,
      alert: "The owner of the boat on the float has come down with a scraper — they want the patch off their float now and are reaching for it.",
      cue: "Hold up the stop card and say the protocol's line: it is being reported, nothing comes off until the body says how — and offer them the coordinator's number.",
      target: "stop-card",
      why: "The boater's instinct is the wrong one for the same reason it is the natural one: scraping spreads what the report is about and destroys the record of it. The stop card is the protocol's answer held up so it is the programme saying no, not the technician arguing; the coordinator's number turns a confrontation on a float into a call the boater can make themselves.",
      missNote: "The boater scraped the patch into the water while you finished the close-up; the fragments drifted under the next three floats, and the report went in with a photograph of a scrape mark.",
      wrongNote: "Not that. The stop card — up, with the protocol's line and the coordinator's number.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.6, MEIS_ACCENT);

    // ------------------------------------------------------- the float, the water, the boat
    const waterTex = surfaceTexture((cx, w, h) => waterFace(cx, w, h, { base: "#16323a", mid: "#1e4650", base2: "#122a32" }), { repeat: 4, px: 256 });
    const water = box(g, 7.0, 0.03, 6.4, 0, -0.35, -0.6, 0x1e4650, { cast: false });
    water.material = texturedMat(waterTex, { rough: 0.2, metal: 0.25, color: 0x3a7a88 });
    water.material.transparent = true; water.material.opacity = 0.88;
    const woodTex = surfaceTexture((cx, w, h) => woodGrainFace(cx, w, h, {}), { repeat: 3, px: 256 });
    const float = box(g, 2.2, 0.3, 5.4, -0.4, -0.16, -0.4, 0xffffff, { cast: false });
    float.material = texturedMat(woodTex, { rough: 0.9, metal: 0, color: 0x9a8a6a });
    for (let i = 0; i < 12; i++) box(g, 2.2, 0.01, 0.02, -0.4, 0.0, -2.9 + i * 0.46, 0x5a4a34, { rough: 0.9, cast: false });
    const cleats = [];
    for (let i = 0; i < 4; i++) {
      const c = group(g, 0.6, 0, -2.0 + i * 1.3);
      box(c, 0.3, 0.06, 0.08, 0, 0.06, 0, 0x8a939b, { rough: 0.4, metal: 0.7 });
      for (const sx of [-0.08, 0.08]) cyl(c, 0.025, 0.03, 0.06, sx, 0.03, 0, 0x8a939b, { rough: 0.4, metal: 0.7, seg: 8 });
      decal(c, 0.06, 0.04, 0, 0.092, 0, signFace(`C-${i + 1}`, { bg: "#f2c14b", accent: "#1b1e22", fg: "#1b1e22", scale: 0.5 })).rotation.x = -Math.PI / 2;
      cleats.push(c);
    }
    for (let i = 0; i < 6; i++) cyl(g, 0.12, 0.12, 1.4, 0.75, -0.9 + (i % 2) * 0.1, -2.6 + i * 1.0, 0x3a4a5a, { rough: 0.7, seg: 12 }); // fenders / piles
    for (let i = 0; i < 3; i++) cyl(g, 0.18, 0.18, 2.4, -1.6, 0.2, -2.4 + i * 2.2, 0x4a3a2a, { rough: 0.95, finish: "brushed", seg: 12 }); // pilings
    const boat = group(g, 2.0, -0.3, -0.6);
    const hull = ball(boat, 0.9, 0, 0.1, 0, 0xf0f1ee, { rough: 0.5, metal: 0.2, seg: 14, seg2: 8, cast: false });
    hull.scale.set(0.9, 0.5, 2.6);
    box(boat, 1.4, 0.06, 4.2, 0, 0.5, 0, 0x9a8a6a, { rough: 0.8, finish: "brushed", cast: false });
    box(boat, 0.9, 0.7, 1.2, 0, 0.9, -0.3, 0xe8edf1, { rough: 0.5, cast: false });
    for (const sz of [-1.9, 1.9]) box(boat, 0.24, 0.06, 0.06, 0, 0.56, sz, 0x8a939b, { rough: 0.4, metal: 0.7 });
    const boater = standingFigure(g, 2.0, 1.4, { ry: -1.6, cloth: 0x2b3a4a, vest: 0xd8dde0, atStation: true });
    boater.position.y = 0.2;
    const boaterHome = boater.position.clone();
    const scraper = group(g, 1.4, 0.9, 0.9);
    box(scraper, 0.03, 0.3, 0.03, 0, 0, 0, 0x1b1e22, { rough: 0.6 });
    box(scraper, 0.12, 0.04, 0.008, 0, -0.17, 0, 0x8a949d, { rough: 0.4, metal: 0.7 });
    scraper.visible = false;

    // ------------------------------------------------------- the patches, the tag, the card, the hazards
    const patch = group(g, 0.5, 0, -0.55);
    for (let i = 0; i < 9; i++) ball(patch, 0.03 + (i % 3) * 0.01, (i % 3) * 0.06 - 0.06, 0.015, Math.floor(i / 3) * 0.05 - 0.05, [0xc8743a, 0xd2884a, 0xb8642a][i % 3], { rough: 0.8, seg: 6, seg2: 5 }).scale.set(1.2, 0.5, 1);
    holoTag(patch, "patch — does not match the card", 0, 0.35, 0, { css: MEIS_CSS, w: 0.56 });
    const cardSocket = torus(g, 0.14, 0.008, 0.2, 0.02, -0.55, MEIS_ACCENT, { emissive: MEIS_ACCENT, ei: 1.4, rough: 0.4, cast: false, seg: 6, seg2: 20 });
    cardSocket.rotation.x = Math.PI / 2;
    holoTag(g, "card here — same plane", 0.2, 0.2, -0.55, { css: MEIS_CSS, w: 0.4 });
    reg(hits, cardSocket, "card-socket");
    const camHold = torus(g, 0.22, 0.01, 0.4, 0.6, -0.55, MEIS_ACCENT, { emissive: MEIS_ACCENT, ei: 1.4, rough: 0.4, cast: false, seg: 6, seg2: 20 });
    camHold.rotation.x = Math.PI / 2;
    holoTag(g, "hold square — close-up", 0.4, 0.8, -0.55, { css: MEIS_CSS, w: 0.42 });
    reg(hits, camHold, "camera-hold");
    const scrapeHit = box(g, 0.4, 0.3, 0.4, 0.9, 0.2, -0.55, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "scrape it off?", 0.9, 0.5, -0.55, { css: MEIS_WARN, w: 0.3 });
    reg(hits, scrapeHit, "scrape-it-off");
    const leanHit = box(g, 0.5, 0.3, 0.5, 0.9, 0.15, -1.3, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "lie flat and reach under?", 0.9, 0.45, -1.3, { css: MEIS_WARN, w: 0.46 });
    reg(hits, leanHit, "lean-off-the-float-edge");
    const patch2 = group(g, 0.55, 0, 0.9);
    for (let i = 0; i < 5; i++) ball(patch2, 0.025, (i % 3) * 0.04 - 0.04, 0.012, Math.floor(i / 3) * 0.04, 0xc8743a, { rough: 0.8, seg: 6, seg2: 5 }).scale.set(1.2, 0.5, 1);
    holoTag(patch2, "second patch", 0, 0.3, 0, { css: MEIS_CSS, w: 0.26 });
    reg(hits, patch2, "second-patch");
    const tag = group(cleats[1], 0.18, 0.08, 0);
    box(tag, 0.05, 0.03, 0.004, 0, 0, 0, 0xf2c14b, { rough: 0.6 });
    decal(tag, 0.04, 0.02, 0, 0, 0.003, signFace("R-07", { bg: "#f2c14b", accent: "#1b1e22", fg: "#1b1e22", scale: 0.5 }));
    holoTag(cleats[1], "earlier report tag", 0.18, 0.3, 0, { css: MEIS_CSS, w: 0.34 });
    reg(hits, tag, "earlier-tag");
    const bucketHit = box(g, 0.4, 0.4, 0.4, 1.6, 0.3, 0.2, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "wet bucket to the next dock?", 1.6, 0.65, 0.2, { css: MEIS_WARN, w: 0.5 });
    reg(hits, bucketHit, "carry-it-wet-to-the-boat");
    const walkHit = box(g, 0.5, 0.2, 4.6, 0.3, 0.1, -0.4, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "walk the edge — mirror at each cleat", 0.3, 0.4, 0.4, { css: MEIS_CSS, w: 0.6 });
    reg(hits, walkHit, "float-edge");
    const flag = group(g, -0.2, 0, -1.6);
    cyl(flag, 0.006, 0.006, 0.3, 0, 0.15, 0, 0x8a949d, { rough: 0.5, seg: 5 });
    box(flag, 0.08, 0.06, 0.006, 0.04, 0.28, 0, 0xb96fc8, { rough: 0.6 });
    box(flag, 0.06, 0.02, 0.06, 0, 0.01, 0, 0x2b3138, { rough: 0.6 });
    holoTag(flag, "flag marker", 0, 0.45, 0, { css: MEIS_CSS, w: 0.24 });
    reg(hits, flag, "flag-marker");

    // ------------------------------------------------------- the kit bag and the bench
    const bench = group(g, -1.1, 0, 0.6);
    box(bench, 1.0, 0.45, 0.5, 0, 0.22, 0, 0x2b3138, { rough: 0.6 });
    const camera = group(bench, -0.3, 0.55, 0, 0.3);
    box(camera, 0.2, 0.12, 0.1, 0, 0, 0, 0x1b1e22, { rough: 0.4, metal: 0.3 });
    cyl(camera, 0.04, 0.04, 0.05, 0, 0, 0.07, 0x2b3138, { rough: 0.3, metal: 0.5, seg: 12 }).rotation.x = Math.PI / 2;
    cyl(camera, 0.012, 0.012, 1.2, -0.15, 0.3, 0, 0x8a949d, { rough: 0.4, metal: 0.7, seg: 6 });
    box(camera, 0.12, 0.08, 0.01, -0.15, 0.92, 0, 0xdfe8ee, { rough: 0.1, metal: 0.8 });
    holoTag(camera, "camera · pole · mirror", 0, 0.24, 0, { css: MEIS_CSS, w: 0.4 });
    reg(hits, camera, "camera-check");
    const shots = [];
    for (let i = 0; i < 3; i++) { const s = box(camera, 0.04, 0.03, 0.006, -0.06 + i * 0.06, 0.09, 0.02, [0xb96fc8, 0x59c97b, 0x6fb0d6][i], { rough: 0.5, emissive: [0xb96fc8, 0x59c97b, 0x6fb0d6][i], ei: 0.6, cast: false }); shots.push(s); }
    reg(hits, shots[0], "shot-overall"); reg(hits, shots[1], "shot-closeup"); reg(hits, shots[2], "shot-habitat");
    const card = decal(bench, 0.16, 0.1, 0.05, 0.455, 0.1, (cx, w, h) => {
      cx.fillStyle = "#f4f6f6"; cx.fillRect(0, 0, w, h);
      ["#d2312b", "#f2c14b", "#59c97b", "#2b5aa8", "#1b1e22", "#ffffff"].forEach((c, i) => { cx.fillStyle = c; cx.fillRect(w * 0.05 + i * w * 0.15, h * 0.15, w * 0.12, h * 0.4); });
      cx.fillStyle = "#1b1e22"; for (let i = 0; i < 10; i++) cx.fillRect(w * 0.05 + i * w * 0.09, h * 0.7, 2, h * (i % 5 === 0 ? 0.25 : 0.15));
    }, { px: 160 });
    card.rotation.x = -Math.PI / 2;
    holoTag(bench, "scale and colour card", 0.05, 0.75, 0.1, { css: MEIS_CSS, w: 0.4 });
    reg(hits, card, "scale-card");
    const cardCheck = torus(bench, 0.1, 0.006, 0.05, 0.47, 0.1, 0xf2c14b, { emissive: 0xf2c14b, ei: 0.6, rough: 0.4, cast: false, seg: 6, seg2: 16 });
    cardCheck.rotation.x = Math.PI / 2;
    reg(hits, cardCheck, "scale-card-check");
    const unit = group(bench, 0.35, 0.5, -0.1);
    box(unit, 0.08, 0.16, 0.03, 0, 0.08, 0, 0xf2c14b, { rough: 0.6 });
    const unitScreen = instrument(unit, 0, 0.17, 0, { idle: "-- fix", color: MEIS_ACCENT, w: 0.08, d: 0.12 });
    holoTag(unit, "position unit", 0, 0.34, 0, { css: MEIS_CSS, w: 0.28 });
    reg(hits, unit, "position-unit");
    reg(hits, unitScreen, "position-readout");
    const jar = group(bench, 0.35, 0.45, 0.15);
    cyl(jar, 0.05, 0.05, 0.12, 0, 0.06, 0, 0xdfe6ea, { rough: 0.15, opacity: 0.6, transparent: true, seg: 14 });
    cyl(jar, 0.045, 0.045, 0.08, 0, 0.04, 0, 0x3a7a88, { rough: 0.2, opacity: 0.6, transparent: true, seg: 14, cast: false });
    const lid = valveWheel(jar, 0, 0.13, 0, { r: 0.05, color: 0x1b1e22, body: 0x1b1e22 });
    box(jar, 0.05, 0.04, 0.004, 0, 0.06, 0.052, 0xf2c14b, { rough: 0.6 });
    holoTag(jar, "sample jar — site water", 0, 0.32, 0, { css: MEIS_CSS, w: 0.42 });
    reg(hits, lid.userData.wheel, "sample-jar-lid");
    const forceps = group(bench, 0.15, 0.47, -0.15, 0.5);
    for (const dx of [-0.006, 0.006]) box(forceps, 0.005, 0.14, 0.005, dx, 0, 0, 0xc0c6cc, { rough: 0.3, metal: 0.8 });
    void forceps;
    const stopCard = decal(g, 0.22, 0.16, -0.4, 1.0, 1.5, signFace("STOP · REPORTED", { bg: "#d2312b", accent: "#ffffff", fg: "#ffffff", scale: 0.45 }), { px: 192 });
    stopCard.rotation.y = 0.3;
    holoTag(g, "stop card", -0.4, 1.14, 1.5, { css: "#d2312b", w: 0.2 });
    reg(hits, stopCard, "stop-card");
    const form = holoPanel(g, 0.6, 0.4, -1.8, 1.25, -0.8, meisForm(["Position · photos · contact", "Pending"]), { ry: 0.6, accent: MEIS_ACCENT });
    reg(hits, form, "sighting-log");
    const formBoxes = [];
    for (let i = 0; i < 3; i++) { const b = box(g, 0.14, 0.06, 0.006, -1.95 + i * 0.16, 1.05, -0.95 + i * 0.1, [0xb96fc8, 0x59c97b, 0x6fb0d6][i], { rough: 0.5, emissive: [0xb96fc8, 0x59c97b, 0x6fb0d6][i], ei: 0.6, opacity: 0.5, transparent: true, cast: false }); b.rotation.y = 0.6; formBoxes.push(b); }
    reg(hits, formBoxes[0], "form-position"); reg(hits, formBoxes[1], "form-photos"); reg(hits, formBoxes[2], "form-contact");
    const postHit = box(g, 0.3, 0.3, 0.3, -1.3, 0.9, 1.4, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "post it with a name first?", -1.3, 1.2, 1.4, { css: MEIS_WARN, w: 0.5 });
    reg(hits, postHit, "post-it-first");
    const radioGrp = group(g, -0.6, 0.5, 1.9);
    const rad = radio(radioGrp, 0, 0, 0, {});
    holoTag(radioGrp, "coordinator radio", 0, 0.28, 0, { css: MEIS_CSS, w: 0.34 });
    reg(hits, rad, "coordinator-radio");
    const protocolBoard = holoPanel(g, 0.9, 0.6, -2.4, 1.5, -2.2, (cx, w, h) => {
      cx.fillStyle = "#170f1c"; cx.fillRect(0, 0, w, h); cx.fillStyle = MEIS_CSS; cx.fillRect(0, 0, w, 6);
      cx.font = `600 ${Math.round(h * 0.1)}px 'Barlow Condensed', Arial, sans-serif`; cx.textAlign = "left"; cx.textBaseline = "middle";
      cx.fillStyle = "#f3e8f7"; cx.fillText("SIGHTING PROTOCOL — MISMATCH TO CARD", w * 0.06, h * 0.13);
      cx.font = `${Math.round(h * 0.072)}px Arial, sans-serif`; cx.fillStyle = "#f8f0fb";
      ["Photograph · do not touch · report · wait", "Photo set: overall, close-up with card, habitat", "Position to the protocol's accuracy",
       "Sample only as the CDFW permit allows", "Report to the named body before anything public"].forEach((l, i) => cx.fillText(l, w * 0.06, h * (0.3 + i * 0.11)));
    }, { ry: 0.5, accent: MEIS_ACCENT });
    reg(hits, protocolBoard, "protocol-board");
    const second = standingFigure(g, -2.4, 1.6, { ry: 1.2, cloth: 0x4a4a3a, vest: 0xf2c14b, atStation: true });
    void second;
    for (let i = 0; i < 5; i++) { const b = ball(g, 0.05, -2.4 + i * 0.9, 2.4 + Math.sin(i) * 0.3, -2.9, 0xdfe6ea, { rough: 0.6, seg: 6, seg2: 5 }); b.scale.set(1.6, 0.6, 0.8); }

    const wmap = water.material.map;
    let walking = false;
    return {
      hits,
      spawnLook: new THREE.Vector3(0.4, 0.5, -0.5),
      onStep(step) { if (step?.id === "walk-the-float") walking = true; },
      onStepComplete(step) {
        if (step.id === "walk-the-float") walking = false;
        if (step.id === "set-scale") { card.position.set(0.2, 0.012, -0.55); card.rotation.set(-Math.PI / 2, 0, 0); g.add(card); }
        if (step.id === "photo-set") for (const s of shots) s.material = mat(0x59c97b, { emissive: 0x59c97b, ei: 0.8, rough: 0.5 });
        if (step.id === "find-more") patch2.children.forEach((c) => { c.material = mat(0xd2884a, { rough: 0.8, emissive: 0x5a2a0a, ei: 0.4 }); });
        if (step.id === "bag-sample") { patch.children[0].visible = false; }
        if (step.id === "report-form") repaint(form.userData.face, meisForm(["Float 2 · C-2 · fix in band · tag R-07", "Frames 12–17 · second patch · sample sealed"]));
        if (step.id === "coordinator-call") rad.userData.show?.("FORM READ\nLAB NAMED");
        if (step.id === "sighting-log") repaint(form.userData.face, meisForm(["Logged · coordinator instruction taken", "Boater's request refused · number given"], "#59c97b"));
      },
      onHazard() {},
      onInterrupt(it) {
        if (it.id === "second-sighting-called") rad.userData.show?.("FLOAT 3\nPATCH TOO?");
        if (it.id === "boater-offers-to-scrape") { boater.position.set(1.2, 0.0, -0.2); boater.rotation.y = -2.2; scraper.visible = true; scraper.position.set(1.0, 0.7, -0.4); }
      },
      onInterruptEnd(it) {
        if (it.id === "second-sighting-called" && it.resolved === "answered") flag.position.set(0.35, 0, -0.85);
        if (it.id === "boater-offers-to-scrape") { boater.position.copy(boaterHome); boater.rotation.y = -1.6; scraper.visible = false; }
      },
      animate(t, dt, session) {
        if (wmap?.offset) { wmap.offset.x = t * 0.004; wmap.offset.y = t * 0.006; }
        boat.position.y = -0.3 + Math.sin(t * 0.9) * 0.02;
        if (walking) flag.rotation.y += dt;
        const step = session?.step;
        if (session?.turn && step?.id === "bag-sample") lid.userData.wheel.rotation.y = session.turn.amount * 4.7;
        if (session?.gauge && !session.gauge.committed && step?.id === "fix-position") {
          const gt = session.gauge.t ?? 0;
          repaint(unitScreen.userData.screen, signFace(gt < 0.42 ? "settling" : gt <= 0.62 ? "in band" : "drift", { bg: "#0d1c24", accent: gt >= 0.42 && gt <= 0.62 ? "#59c97b" : "#f2ae14", fg: "#eaf0dc", scale: 0.6 }));
        }
      },
    };
  },
};
