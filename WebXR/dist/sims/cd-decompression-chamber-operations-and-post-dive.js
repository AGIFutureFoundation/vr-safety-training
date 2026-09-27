import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import { box, cyl, ball, torus, hose, group, decal, repaint, paperFace, mat } from "../../../shared/kit.js";
import {
  CITY, stationPad, holoTag, standingFigure, valveWheel, cylinderTank, reg,
  surfaceTexture, texturedMat, deckPlateFace, waterFace, paintedSteelFace,
} from "../citykit.js";
import { safetyStripeFace } from "../../../shared/textures.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Decompression Chamber Operations & Post-Dive — the attendant's
// side. Commercial diving and scientific scuba pack, DIVE1.
//
// A deck chamber on a pier apron: the double-lock chamber on its skid, the
// main door and the medical lock, the operator's panel with its gauges (no
// figure on any of them), the BIBS supply, the oxygen bank, the comms box,
// the observation bench where the surfaced diver sits, the attendant's kit
// bin, the log table and the team board. The learner is the chamber
// attendant: the pre-dive checks with the operator, the medical lock, the
// comms, the post-dive observation of the surfaced diver, a symptom reported
// rather than shrugged off, the attendant's own entry, the watch inside as
// the operator presses down, and the record. Pressure, depth, time and gas
// are never numbers; they are per the tables the supervisor holds.

const CDDC_ACCENT = 0x6fb3e0;
const CDDC_CSS = "#6fb3e0";

export const SIM_CD_DECOMPRESSION_CHAMBER_OPERATIONS_AND_POST_DIVE = {
  id: "cd-decompression-chamber-operations-and-post-dive",
  index: "719",
  domain: "Maritime & Ports",
  trade: "Pile Drivers of the Carpenters diver-tender as chamber attendant on a decompression dive, with the chamber operator, the dive supervisor holding the tables, and the surfaced diver under observation",
  category: "Maritime & Ports",
  district: "Maritime & Ports",
  weather: "overcast",
  certification: "Pile Drivers apprenticeship under the Carpenters (UBC) International Training Fund; OSHA 29 CFR 1910 Subpart T — 29 CFR 1910.423 post-dive procedures (the diver's condition, instructions to report symptoms, the recompression chamber and the post-dive observation), 29 CFR 1910.430 decompression chambers and their equipment, 29 CFR 1910.410 dive team qualifications including first aid and CPR and 29 CFR 1910.440 the record of the dive and its decompression procedure assessment; ADCI consensus standards for chamber operations and the inside attendant; USCG 46 CFR 197 Subpart B where the chamber is aboard a vessel; the tables the supervisor holds carry every pressure, depth and time",
  name: "Decompression Chamber Operations & Post-Dive",
  title: simTitle("Decompression Chamber Operations & Post-Dive"),
  tagline: "The attendant's chamber: the plan read with the operator, grit on the door seat and an oily rag in the lock found, the medical lock worked one door at a time, the comms proven both ways, the BIBS supply opened, the lighter and the phone left in the bin, the surfaced diver watched through the observation period, a sore shoulder reported instead of shrugged off, the attendant in with the diver, the watch kept as the operator presses down with comms dropping to knock signals, the analyser read to the operator's band, water passed through the lock and the log written",
  accent: CDDC_ACCENT,
  accentCss: CDDC_CSS,
  parSeconds: 320,
  footprint: 2.6,
  badge: { id: "reported-not-shrugged", name: "Reported, Not Shrugged", note: "Every symptom the surfaced diver showed said to the supervisor at once, the chamber ready before it was needed" },

  supportLine: "your union hall's member assistance programme — the Pile Drivers of the Carpenters — with the employer's employee assistance line behind it",

  game: system({
    name: "Inside Attendant",
    currency: "LOCK CYCLES",
    ranks: ["Tender", "Chamber Tender", "Attendant", "Lead Attendant", "Chamber Crew Certified"],
    badges: [
      { id: "lock-clean", name: "Lock Clean", note: "The grit and the rag found before the chamber was needed", test: AWARD.stepClean("chamber-checks") },
      { id: "in-the-band", name: "In The Band", note: "The analyser committed inside the operator's band first time", test: AWARD.precise(0.7) },
      { id: "nothing-in-pockets", name: "Nothing In Pockets", note: "No hazard reached for from the brief to the log", test: AWARD.safe },
    ],
    challenges: [
      { id: "clean-watch", name: "Clean Watch", note: "No corrections from the brief to the check-in", test: AWARD.clean },
      { id: "steady-watch", name: "Steady Watch", note: "The attendant's watch kept in band the whole press", test: AWARD.unbroken },
      { id: "logged-quick", name: "Logged Quick", note: "Chamber log written inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "lighter-in-pocket": "You went into the chamber with your lighter and your phone still in your pocket. A chamber under pressure with oxygen in it is a fire that needs only a spark, and a lighter's fuel, a phone's battery and a static crackle from the wrong fabric are all sparks; nothing goes in that the operator has not approved, and pockets are emptied into the bin at the door every time, not just the first time.",
    "outer-door-open": "You went to open the medical lock's outer door while its inner door was still open to the chamber. The medical lock is a small chamber of its own and its two doors are never open together: with both open, the chamber's pressure is on the outer door and whoever is opening it. One door closed and checked before the other is touched, every pass, in both directions.",
    "petroleum-grease": "You reached for the general-purpose grease tin to dress the door's seal. Petroleum grease in an oxygen-rich chamber is a fuel, and it sits on the one seal every pressurisation squeezes; only the oxygen-compatible lubricant the manufacturer names goes on any seal or fitting in the chamber, and it lives in its own marked tin at the panel.",
    "let-diver-leave": "You waved the surfaced diver off toward the car park because he said he felt fine and wanted to get home. 29 CFR 1910.423 keeps the diver within reach of the chamber for the observation period the tables call for and has them told to report symptoms, and a diver who drives away is a diver whose first symptom arrives in traffic with no chamber near; he stays on the bench until the supervisor releases him.",
  },

  lateNotes: {
    "observation-bench": "The observation begins once the chamber is checked and ready.",
    "attendant-watch": "The watch inside is kept once the attendant is in with the diver on the supervisor's order.",
    "chamber-log": "The log is written once the diver is on the tables and the lock has passed water.",
  },

  steps: [
    {
      id: "chamber-brief", kind: "select", target: "chamber-plan",
      title: "Read the chamber's part of the dive plan with the operator",
      cue: "At the operator's panel: the chamber ready before the first diver leaves surface, who operates and who attends, the tables the supervisor holds, the comms and knock signals, and the observation period after every dive.",
      why: "29 CFR 1910.423 has a decompression chamber ready at the dive location for the dives that need one, and ready means checked, staffed and understood before anybody is in the water, not found wanting with a symptomatic diver on the bench. The attendant reads the plan with the operator so both know who does what when the supervisor says 'chamber' — the attendant's job is inside, the operator's is at the panel, and the tables stay in the supervisor's hands.",
    },
    {
      id: "chamber-checks", kind: "find", noHint: true,
      targets: ["door-grit", "oily-rag"],
      itemNames: { "door-grit": "grit on the main door's seal seat", "oily-rag": "oily rag left on the inner lock's bench" },
      itemNotes: {
        "door-grit": "Sand and a flake of paint sit on the seal seat of the main door where the last crew closed it in a hurry. Grit under a door seal is a leak the operator chases through the whole treatment.",
        "oily-rag": "A rag dark with oil is folded on the inner lock's bench. In an oxygen-rich chamber that rag is fuel waiting for a spark, and it should never have crossed the door.",
      },
      title: "Check the chamber inside and out with the operator",
      cue: "Walk the chamber: door seals and seats, the inner and outer locks for anything left inside, the viewports, the BIBS masks and hoses, the fire suppression, the bench and the blankets — hands and eyes on each.",
      why: "The chamber is checked before the dive because when it is needed there is no time to clean a seal seat or hunt for what a previous crew left inside. 29 CFR 1910.430 has the chamber and its equipment kept in a condition to be used; the attendant checks the inside because the attendant is the one who will live in it for the treatment, and anything that burns or leaks in there is the attendant's problem first.",
    },
    {
      id: "medical-lock", kind: "sequence",
      targets: ["inner-lock-door", "outer-lock-door"],
      itemNames: { "inner-lock-door": "medical lock's inner door closed and dogged", "outer-lock-door": "medical lock's outer door opened for the pass" },
      title: "Work the medical lock: inner door closed, then outer door opened",
      cue: "Close and dog the medical lock's inner door, check it, then open the outer door to load the lock — never both doors open together.",
      why: "The medical lock passes water, food and medicine to the people inside without changing the chamber's pressure, and it does that only if its two doors are never open at once. The inner door is closed and checked first because it is the one that holds the chamber's pressure; then the outer door opens to the deck. The attendant rehearses the cycle on the checks because during a treatment it is worked from inside, by feel, on the operator's call.",
      outOfOrderNote: "Out of order — close and dog the inner door first; the outer door opens only against a closed inner one.",
    },
    {
      id: "comms-check", kind: "select", target: "comms-box",
      title: "Prove the chamber comms both ways",
      cue: "Speak from the panel to the inside and from the inside to the panel, then agree the knock signals on the hull for when the comms fail.",
      why: "Inside the chamber the attendant is the operator's eyes and the diver's first aid, and the comms are the only way either reaches the other through steel; a comms box that works one way is a treatment run blind. Both directions are proven and the knock signals are agreed out loud, because 29 CFR 1910.422 has communications maintained and the knock code is what maintains them when the electronics do not.",
    },
    {
      id: "bibs-supply", kind: "turn", target: "bibs-valve",
      title: "Open the BIBS supply at the panel",
      cue: "Open the built-in breathing system's supply valve at the operator's panel as the plan calls for and confirm a mask breathes inside.",
      why: "The masks inside the chamber breathe from their own supply, set at the panel by the operator's plan, so the person on treatment breathes what the tables call for while the chamber's own atmosphere stays where the analyser wants it. The valve is opened before anyone needs a mask and a mask is proven at the bench, because a mask that does not breathe is discovered by a diver who needs it, at the worst possible moment.",
      turn: { turns: 1.0, label: "BIBS SUPPLY", readout: (t) => (t < 0.3 ? "shut" : t < 0.9 ? "opening" : "supplied — mask breathes") },
    },
    {
      id: "attendant-kit", kind: "drag", target: "pocket-items",
      title: "Empty your pockets into the bin at the door",
      cue: "Take the lighter, the phone and the pen out of your pockets and put them in the attendant's bin at the door; only the operator's approved kit goes inside.",
      why: "The attendant's pockets are the last thing between the deck and a chamber where a spark is a fire: a lighter, a phone's battery, a pen with a spring, anything that can arc or fuel. They go into the bin at the door every time the attendant might enter, not just before a treatment, because the call to enter comes fast and nobody checks pockets on the way through the door.",
      drag: { to: "attendant-bin", radius: 0.5, missNote: "Not in the bin — the lighter, the phone and the pen go in the attendant's bin at the door, every time." },
    },
    {
      id: "observation-hold", kind: "hold", target: "observation-bench", seconds: 5,
      title: "Watch the surfaced diver through the observation period",
      cue: "Sit the surfaced diver on the bench near the chamber and watch them: how they move, how they speak, whether they favour a joint or rub a spot, and remind them to say anything they feel.",
      why: "29 CFR 1910.423 has the diver's condition checked after the dive and the diver told to report symptoms, and it keeps them near the chamber for the period the tables call for; the attendant is the person doing the watching. Symptoms of decompression illness start small — a joint ache, an itch, a diver who is quieter than usual — and the attendant who is looking sees them, while a diver who is asked 'you all right?' says yes.",
      holdBreakNote: "You looked away from the diver — the observation is the watching. Eyes back on the bench.",
    },
    {
      id: "symptom-card", kind: "select", target: "symptom-card",
      title: "Record what the diver showed on the symptom card",
      cue: "Write on the card exactly what you saw and heard: the shoulder rubbed, the words the diver used, the time, and that the supervisor was told.",
      why: "What the attendant saw is evidence the supervisor and, if it comes to it, the physician act on, and it is written the way it was seen — 'rubbed right shoulder, said it was just sore, at this time' — rather than as a diagnosis the attendant is not qualified to make. The card goes with the diver into the chamber and into the record, so the treatment is decided on what happened and not on what someone remembers.",
    },
    {
      id: "attendant-enter", kind: "select", target: "main-door",
      title: "Enter the chamber with the diver on the supervisor's order",
      cue: "The supervisor calls the diver into the chamber for treatment per the tables. Go in with them as attendant, sit them on the bench, seat the door and tell the operator 'door seated, ready'.",
      why: "A diver on treatment is never alone in the chamber: the attendant goes in to fit the mask, watch the diver, work the medical lock from inside and give first aid, and stays for the whole treatment. The attendant enters on the supervisor's order and not on their own judgement, because the supervisor holds the tables and decides the treatment; the door is seated from inside and the operator told, so the press begins on a closed chamber.",
    },
    {
      id: "attendant-watch", kind: "track", target: "attendant-watch", seconds: 6,
      title: "Keep the attendant's watch as the operator presses down",
      cue: "As the operator pressurises, keep clearing your own ears, keep your eyes on the diver's face and breathing, and answer the operator's calls — steady, neither behind the press nor ahead of the diver.",
      why: "The attendant is pressurised with the diver and has to look after themselves to look after the diver: ears cleared with the press, a hand on the mask, eyes on the diver's colour and breathing. The operator drives the press to the tables and calls it; the attendant answers so the operator knows both people inside are all right, and stops the press with a word if either is not. A quiet attendant is an operator pressing blind.",
      track: { start: 0.14, green: [0.42, 0.62], rise: 0.56, fall: 0.46, drift: 0.12, label: "WATCH", readout: (v) => (v < 0.42 ? "behind the press — ears" : v > 0.62 ? "ahead of the diver" : "with the operator and the diver") },
      holdBreakNote: "The watch slipped — behind the press or ahead of the diver. Clear your ears, eyes on the diver, answer the operator.",
    },
    {
      id: "read-analyser", kind: "gauge", target: "o2-analyser",
      title: "Read the chamber analyser to the operator's band",
      cue: "Watch the chamber atmosphere analyser at the panel through the viewport and commit when it settles in the band the operator has called for this stage.",
      why: "The chamber's own atmosphere is kept in the band the operator calls from the tables — enough ventilation that the masks' exhaust does not build up, never so much that the fire risk climbs — and the analyser is the only thing that knows. The attendant reads it back through the viewport as a second pair of eyes, because an operator working the panel alone can watch the press or the analyser and the attendant watches the other.",
      gauge: { label: "ANALYSER vs OPERATOR'S BAND", speed: 0.66, green: [0.44, 0.62], readout: (t) => (t < 0.44 ? "below the band — ventilate" : t <= 0.62 ? "in the operator's band" : "above the band — fire risk"), missNote: "Outside the band — read the analyser as it settles and commit in the band the operator called." },
    },
    {
      id: "pass-water", kind: "drag", target: "water-bottle",
      title: "Pass water in through the medical lock",
      cue: "The operator loads water into the medical lock, closes the outer door and calls it; you open the inner door, take the water for the diver and close the inner door again.",
      why: "A diver on treatment needs to drink, and what they need comes through the medical lock one door at a time: the operator loads and closes the outer door, calls it, and only then does the attendant open the inner one. The attendant closes the inner door again straight away and tells the operator, because a lock left open to the chamber cannot be loaded from outside and the next pass — a medicine — may be urgent.",
      drag: { to: "inner-lock-tray", radius: 0.5, missNote: "Not through the lock — the water comes in through the medical lock's inner door once the operator has closed the outer one." },
    },
    {
      id: "chamber-log", kind: "select", target: "chamber-log",
      title: "Write the chamber log and the dive record",
      cue: "At the log through the viewport with the operator: the checks and what was found, the observation and the symptom, the time the supervisor was told, the entry, the press and the analyser readings, the knock signals used and the water passed.",
      why: "29 CFR 1910.440 keeps the record of the dive and the assessment of its decompression, and the chamber log is where the treatment's every step is written by the people who did it — the operator at the panel, the attendant from inside. The symptom, the time it was reported and what was done about it are what the physician and the next dive plan read, and they are written now, not from memory after the treatment.",
    },
    {
      id: "crew-checkin", kind: "select", target: "team-board",
      title: "Check in with the dive team",
      cue: "At the team board: the diver on the tables and who is watching them, the rag and the grit for whoever closed up last, the comms drop and the knocks, and how everyone is.",
      why: "A diver into the chamber is a hard hour for a small crew, and the check-in is where it is said out loud: what the chamber was found like, why the comms dropped, that the knock code worked, and how the people who watched a colleague go on treatment are doing. The Pile Drivers member assistance line is there for what the deck does not settle, and the supervisor hears it before the record closes.",
    },
  ],

  interrupts: [
    {
      id: "shoulder-shrug",
      kind: "Surfaced diver rubbing a shoulder and shrugging it off",
      after: "observation-hold", delay: 2, seconds: 14,
      alert: "The surfaced diver on the bench is rubbing his right shoulder and says it's just sore from the ladder — 'don't make a thing of it.'",
      cue: "Tell the supervisor at once, exactly what you saw and what he said, and keep the diver on the bench.",
      target: "supervisor-call",
      why: "A joint ache after a decompression dive is a symptom until the supervisor and the tables say otherwise, and it is the supervisor's call, not the diver's and not the attendant's. 29 CFR 1910.423 has the diver told to report symptoms because divers do not; the attendant reports it for them, word for word, and the diver stays where the chamber is. Making a thing of it is the job.",
      missNote: "The diver rubbed the shoulder for ten minutes on the bench while the attendant took his word for it; by the time the supervisor noticed, the ache had moved to the elbow and the treatment started late.",
      wrongNote: "The supervisor — tell them now, exactly what you saw and what he said, and keep him on the bench.",
    },
    {
      id: "comms-drop",
      kind: "Chamber comms dropped during the press",
      after: "attendant-watch", delay: 2, seconds: 14,
      alert: "The comms box has gone dead mid-press — the operator's voice is gone and the panel cannot hear you.",
      cue: "Use the agreed knock signal on the hull to tell the operator 'both all right, continue', and keep knocking the check every stage until the comms come back.",
      target: "hull-knock",
      why: "When the comms fail the operator has two people under pressure and no word from either, and the only safe assumption is to stop the press until there is one. The knock code agreed at the comms check is that word: a signal on the hull the operator hears at the panel, answered back, so the treatment continues on the tables instead of stalling — and the attendant keeps the checks going until the voice returns.",
      missNote: "The operator held the press with the comms dead and no knock from inside; the attendant waited for the voice to come back while the operator prepared to abort the treatment.",
      wrongNote: "The hull — the knock code is the comms now. Signal 'both all right, continue' and keep the checks going.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.6, CDDC_ACCENT);

    // ------------------------------------------------------- apron and water
    const water = box(g, 9.0, 0.02, 5.0, 0, 0.012, -4.4, 0xffffff, { rough: 0.15, metal: 0.4, cast: false });
    water.material = texturedMat(surfaceTexture((cx, w, h) => waterFace(cx, w, h, { base: "#0d2a31", mid: "#12383e" }), { repeat: 3, px: 512 }), { rough: 0.15, metal: 0.4, color: 0x86acb6 });
    const apron = box(g, 7.4, 0.14, 5.6, 0, 0.4, 0.4, 0xffffff, { rough: 0.8 });
    apron.material = texturedMat(surfaceTexture((cx, w, h) => deckPlateFace(cx, w, h, { base: "#474d52", base2: "#3a4046", step: 21 }), { repeat: 4, px: 512 }), { rough: 0.8, metal: 0.35, color: 0xc6ccd2 });
    box(g, 7.4, 0.4, 5.6, 0, 0.16, 0.4, 0x8a8f93, { rough: 0.7, cast: false });
    for (const x of [-3.4, -1.7, 0, 1.7, 3.4]) cyl(g, 0.022, 0.022, 1.0, x, 0.97, -2.35, 0xc8ced4, { rough: 0.35, metal: 0.5, seg: 8 });
    box(g, 7.2, 0.04, 0.04, 0, 1.45, -2.35, 0xc8ced4, { rough: 0.35, metal: 0.5 });
    const stripe = box(g, 4.2, 0.012, 0.25, -0.6, 0.48, 1.5, 0xffffff, { rough: 0.7 });
    stripe.material = texturedMat(surfaceTexture((cx, w, h) => safetyStripeFace(cx, w, h), { repeat: 5, px: 256 }), { rough: 0.7 });

    // ------------------------------------------------------- the chamber
    const ch = group(g, -0.6, 0.47, -0.4);
    const skid = box(ch, 3.6, 0.2, 1.6, 0, 0.1, 0, 0x2b3138, { rough: 0.6, metal: 0.5 });
    void skid;
    const shell = cyl(ch, 0.85, 0.85, 3.4, 0, 1.15, 0, 0xffffff, { seg: 24 });
    shell.rotation.z = Math.PI / 2;
    shell.material = texturedMat(surfaceTexture((cx, w, h) => paintedSteelFace(cx, w, h, { base: "#e9ecef", base2: "#d4d9de" }), { px: 256 }), { rough: 0.45, metal: 0.4 });
    for (const x of [-1.72, 1.72]) { const cap = ball(ch, 0.85, x, 1.15, 0, 0xdfe3e7, { rough: 0.45, metal: 0.4, seg: 20, seg2: 14 }); void cap; }
    for (const x of [-1.1, 0, 1.1]) torus(ch, 0.87, 0.04, x, 1.15, 0, 0x2f4f6f, { rough: 0.5, metal: 0.5, seg: 8, seg2: 28 }).rotation.y = Math.PI / 2;
    for (const [x, sx] of [[-0.6, 1], [0.6, 1]]) { const vp = cyl(ch, 0.14, 0.14, 0.06, x, 1.35, sx * 0.84, 0x6ab8d8, { rough: 0.05, metal: 0.3, opacity: 0.7, transparent: true, seg: 18 }); vp.rotation.x = Math.PI / 2; }
    holoTag(ch, "deck decompression chamber", 0, 2.35, 0, { css: CDDC_CSS, w: 0.5 });
    // Main door at the +Z front, right lock.
    const door = group(ch, 1.0, 1.0, 0.86);
    const doorPlate = cyl(door, 0.45, 0.45, 0.08, 0, 0, 0, 0xd4d9de, { rough: 0.4, metal: 0.5, seg: 20 });
    doorPlate.rotation.x = Math.PI / 2;
    torus(door, 0.46, 0.03, 0, 0, 0.02, 0x2f4f6f, { rough: 0.5, metal: 0.5, seg: 6, seg2: 24 });
    for (let i = 0; i < 6; i++) box(door, 0.08, 0.04, 0.06, Math.cos(i * 1.05) * 0.4, Math.sin(i * 1.05) * 0.4, 0.05, 0x8a949d, { rough: 0.4, metal: 0.7 });
    holoTag(door, "main door — seat it from inside", 0, 0.62, 0.1, { css: CDDC_CSS, w: 0.56 });
    reg(hits, door, "main-door");
    const grit = box(door, 0.1, 0.03, 0.03, 0.3, -0.35, 0.06, 0xb8a06a, { rough: 1, emissive: 0x3a2a0a, ei: 0.4 });
    reg(hits, grit, "door-grit");
    // Medical lock on the -X end, with two doors.
    const medLock = group(ch, -1.9, 1.0, 0.45);
    const mlBody = cyl(medLock, 0.22, 0.22, 0.7, 0, 0, 0, 0xd4d9de, { rough: 0.4, metal: 0.5, seg: 16 });
    mlBody.rotation.z = Math.PI / 2;
    holoTag(medLock, "medical lock", 0, 0.4, 0, { css: CDDC_CSS, w: 0.26 });
    const outerDoor = group(medLock, -0.36, 0, 0);
    const outerPlate = cyl(outerDoor, 0.24, 0.24, 0.04, 0, 0, 0, 0x2f4f6f, { rough: 0.5, metal: 0.5, seg: 16 });
    outerPlate.rotation.z = Math.PI / 2;
    box(outerDoor, 0.04, 0.16, 0.04, -0.04, 0, 0, 0xd2312b, { rough: 0.5 });
    holoTag(outerDoor, "outer door", -0.2, 0.3, 0, { css: CDDC_CSS, w: 0.22 });
    reg(hits, outerDoor, "outer-lock-door");
    const innerDoor = group(medLock, 0.36, 0, 0);
    const innerPlate = cyl(innerDoor, 0.24, 0.24, 0.04, 0, 0, 0, 0x2f4f6f, { rough: 0.5, metal: 0.5, seg: 16 });
    innerPlate.rotation.z = Math.PI / 2;
    innerDoor.rotation.y = 0.9;
    holoTag(innerDoor, "inner door", 0.2, 0.3, 0, { css: CDDC_CSS, w: 0.22 });
    reg(hits, innerDoor, "inner-lock-door");
    const outerHit = box(medLock, 0.3, 0.3, 0.3, -0.5, -0.3, 0.2, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(medLock, "open outer with inner open?", -0.5, -0.5, 0.3, { css: "#d2312b", w: 0.5 });
    reg(hits, outerHit, "outer-door-open");
    const lockTray = group(medLock, 0.5, -0.05, 0.3);
    torus(lockTray, 0.1, 0.008, 0, 0, 0, CDDC_ACCENT, { emissive: CDDC_ACCENT, ei: 1.2, rough: 0.4, cast: false, seg: 6, seg2: 16 }).rotation.x = Math.PI / 2;
    holoTag(lockTray, "inner lock tray", 0, 0.16, 0, { css: CDDC_CSS, w: 0.28 });
    reg(hits, lockTray, "inner-lock-tray");
    const rag = box(ch, 0.18, 0.04, 0.14, -1.2, 0.72, 0.5, 0x4a3a28, { rough: 1, emissive: 0x2a1a0a, ei: 0.4 });
    reg(hits, rag, "oily-rag");
    const hullKnock = group(ch, 0.2, 1.4, 0.9);
    torus(hullKnock, 0.1, 0.008, 0, 0, 0, CDDC_ACCENT, { emissive: CDDC_ACCENT, ei: 1.2, rough: 0.4, cast: false, seg: 6, seg2: 16 });
    holoTag(hullKnock, "hull — knock signal", 0, 0.18, 0, { css: CDDC_CSS, w: 0.4 });
    reg(hits, hullKnock, "hull-knock");
    const watchRing = group(ch, 0.6, 1.35, 0.95);
    torus(watchRing, 0.12, 0.008, 0, 0, 0, CDDC_ACCENT, { emissive: CDDC_ACCENT, ei: 1.2, rough: 0.4, cast: false, seg: 6, seg2: 16 });
    holoTag(watchRing, "viewport — the attendant's watch", 0, 0.24, 0, { css: CDDC_CSS, w: 0.56 });
    reg(hits, watchRing, "attendant-watch");
    // Attendant's bin at the door, pocket items.
    const bin = group(g, 1.4, 0.47, 0.7);
    box(bin, 0.3, 0.3, 0.3, 0, 0.15, 0, 0x2f4f6f, { rough: 0.6, metal: 0.3 });
    torus(bin, 0.2, 0.01, 0, 0.32, 0, CDDC_ACCENT, { emissive: CDDC_ACCENT, ei: 1.4, rough: 0.4, cast: false, seg: 6, seg2: 20 }).rotation.x = Math.PI / 2;
    holoTag(bin, "attendant's bin", 0, 0.55, 0, { css: CDDC_CSS, w: 0.3 });
    reg(hits, bin, "attendant-bin");
    const pocket = group(g, 2.0, 0.95, 1.3);
    box(pocket, 0.03, 0.08, 0.02, -0.06, 0, 0, 0xd2312b, { rough: 0.4 });
    box(pocket, 0.07, 0.14, 0.01, 0.04, 0, 0, 0x1b1e22, { rough: 0.4 });
    cyl(pocket, 0.006, 0.006, 0.14, 0.12, 0, 0, 0x2f4f6f, { rough: 0.5, seg: 6 });
    holoTag(pocket, "lighter · phone · pen", 0, 0.2, 0, { css: CDDC_CSS, w: 0.4 });
    reg(hits, pocket, "pocket-items");
    const pocketHit = box(g, 0.3, 0.3, 0.3, 1.6, 1.3, 0.2, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "go in with them in your pocket?", 1.6, 1.6, 0.2, { css: "#d2312b", w: 0.56 });
    reg(hits, pocketHit, "lighter-in-pocket");

    // ------------------------------------------------------- operator's panel, gas bank, comms
    const panel = group(g, 2.6, 0.47, -1.2);
    box(panel, 1.2, 0.9, 0.5, 0, 0.45, 0, 0x2b3138, { rough: 0.6, metal: 0.4 });
    const pFace = box(panel, 1.1, 0.6, 0.05, 0, 1.15, -0.1, 0x3a4148, { rough: 0.5, metal: 0.5 });
    pFace.rotation.x = -0.3;
    for (const x of [-0.35, -0.1, 0.15, 0.4]) { const d = cyl(panel, 0.08, 0.08, 0.03, x, 1.2, 0.02, 0xf1f3f4, { rough: 0.4, seg: 18 }); d.rotation.x = Math.PI / 2 - 0.3; }
    holoTag(panel, "operator's panel", 0, 1.65, 0, { css: CDDC_CSS, w: 0.32 });
    const plan = decal(panel, 0.34, 0.24, -0.35, 0.83, 0.26, paperFace("CHAMBER PLAN", ["Ready before first dive", "Operator · Attendant", "Tables: supervisor holds"], { bg: "#eef6f8", band: "#2b7a98" }), { px: 160 });
    reg(hits, plan, "chamber-plan");
    const bibs = valveWheel(panel, 0.35, 0.95, 0.28, { r: 0.06, color: 0x2f8f5a, body: 0x2f4f6f });
    bibs.scale.set(0.7, 0.7, 0.7);
    holoTag(panel, "BIBS supply", 0.35, 1.2, 0.4, { css: CDDC_CSS, w: 0.26 });
    reg(hits, bibs, "bibs-valve");
    const analyser = group(panel, 0.1, 1.5, -0.05);
    box(analyser, 0.28, 0.16, 0.06, 0, 0, 0, 0x1b1e22, { rough: 0.5 });
    const needle = box(analyser, 0.008, 0.08, 0.01, -0.08, 0.0, 0.035, 0xd2312b, { rough: 0.4 });
    for (let i = 0; i < 5; i++) box(analyser, 0.004, 0.02, 0.01, -0.1 + i * 0.05, 0.06, 0.035, 0xf1f3f4, { rough: 0.5 });
    holoTag(analyser, "chamber analyser", 0, 0.2, 0, { css: CDDC_CSS, w: 0.32 });
    reg(hits, analyser, "o2-analyser");
    const comms = group(g, 1.5, 1.4, -1.0);
    box(comms, 0.22, 0.16, 0.1, 0, 0, 0, 0x3a4148, { rough: 0.6 });
    const commsLamp = ball(comms, 0.02, 0.07, 0.05, 0.05, 0x59c97b, { emissive: 0x59c97b, ei: 0.8, rough: 0.3, seg: 6, seg2: 4 });
    hose(comms, [[0, -0.08, 0], [0.1, -0.3, 0.1], [0.1, -0.5, 0.3]], 0.01, 0x1b1e22, { steps: 6, rough: 0.7 });
    holoTag(comms, "chamber comms — both ways", 0, 0.24, 0, { css: CDDC_CSS, w: 0.5 });
    reg(hits, comms, "comms-box");
    for (let i = 0; i < 4; i++) cylinderTank(g, 3.2, -2.2 + i * 0.45, i % 2 ? 0x2f8f5a : 0xf1f3f4, { r: 0.12, h: 1.4 });
    box(g, 0.4, 0.06, 1.9, 3.2, 1.2, -1.5, 0x5b6771, { rough: 0.5, metal: 0.6 });
    holoTag(g, "gas bank — per the plan", 3.2, 1.95, -1.5, { css: CDDC_CSS, w: 0.44 });
    hose(g, [[3.0, 1.1, -1.2], [2.8, 1.0, -1.2], [2.65, 0.95, -1.05]], 0.015, 0x2f8f5a, { steps: 4, rough: 0.7 });
    const greaseHit = group(panel, -0.5, 0.95, 0.3);
    cyl(greaseHit, 0.05, 0.05, 0.06, 0, 0, 0, 0x8a6a2a, { rough: 0.7, seg: 12 });
    holoTag(greaseHit, "general grease on the seal?", 0, 0.25, 0, { css: "#d2312b", w: 0.5 });
    reg(hits, greaseHit, "petroleum-grease");
    const o2Lube = cyl(panel, 0.04, 0.04, 0.05, -0.5, 0.95, 0.05, 0x1f5fb8, { rough: 0.5, seg: 12 });
    void o2Lube;

    // ------------------------------------------------------- observation bench, surfaced diver, cards
    const bench = group(g, 1.0, 0.47, 2.0);
    box(bench, 1.4, 0.08, 0.45, 0, 0.42, 0, 0x5b4a3a, { rough: 0.85 });
    for (const x of [-0.6, 0.6]) box(bench, 0.08, 0.4, 0.4, x, 0.2, 0, 0x3a4148, { rough: 0.6, metal: 0.4 });
    box(bench, 1.4, 0.4, 0.06, 0, 0.66, -0.2, 0x5b4a3a, { rough: 0.85 });
    torus(bench, 0.5, 0.012, 0, 0.5, 0, CDDC_ACCENT, { emissive: CDDC_ACCENT, ei: 1.2, rough: 0.4, cast: false, seg: 6, seg2: 26 }).rotation.x = Math.PI / 2;
    holoTag(bench, "observation bench — watch the diver", 0, 1.2, 0, { css: CDDC_CSS, w: 0.6 });
    reg(hits, bench, "observation-bench");
    const diver = standingFigure(g, 1.0, 2.6, { ry: Math.PI, atStation: true, cloth: 0x1b1e22, trousers: 0x1b1e22, gloves: 0x2b2b2b });
    diver.position.y = 0.47;
    holoTag(diver, "surfaced diver", 0, 2.0, 0, { css: CDDC_CSS, w: 0.28 });
    const shoulder = ball(diver, 0.06, 0.24, 1.4, 0.1, 0xd2312b, { emissive: 0xd2312b, ei: 0.8, rough: 0.4, seg: 8, seg2: 6 });
    shoulder.visible = false;
    const leaveHit = box(g, 0.4, 0.4, 0.4, 3.0, 1.0, 2.4, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "let him drive home?", 3.0, 1.35, 2.4, { css: "#d2312b", w: 0.4 });
    reg(hits, leaveHit, "let-diver-leave");
    const card = decal(g, 0.24, 0.18, 0.1, 1.05, 2.0, paperFace("SYMPTOMS", ["Seen: ____", "Said: ____", "Told supervisor: ____"], { bg: "#f3efe4", band: CDDC_CSS }), { px: 128 });
    card.rotation.y = 0.5;
    holoTag(g, "symptom card", 0.1, 1.25, 2.0, { css: CDDC_CSS, w: 0.26 });
    reg(hits, card, "symptom-card");
    const supervisor = standingFigure(g, -2.6, 2.2, { ry: -0.6, cloth: 0x2b3138, vest: 0xf06a2b, cap: 0x1f3a52 });
    supervisor.position.y = 0.47;
    holoTag(supervisor, "supervisor — holds the tables", 0, 1.95, 0, { css: CDDC_CSS, w: 0.5 });
    const supCall = group(g, -2.2, 1.5, 1.8);
    torus(supCall, 0.1, 0.008, 0, 0, 0, 0xd2312b, { emissive: 0xd2312b, ei: 1.2, rough: 0.4, cast: false, seg: 6, seg2: 16 });
    holoTag(supCall, "tell the supervisor now", 0, 0.18, 0, { css: CDDC_CSS, w: 0.44 });
    reg(hits, supCall, "supervisor-call");
    const operator = standingFigure(g, 2.6, -0.3, { ry: Math.PI, cloth: 0x2b3138, vest: 0xf06a2b, cap: 0x1f3a52 });
    operator.position.y = 0.47;
    holoTag(operator, "chamber operator", 0, 1.95, 0, { css: CDDC_CSS, w: 0.32 });
    const bottle = group(g, 3.0, 1.0, 0.6);
    cyl(bottle, 0.04, 0.04, 0.22, 0, 0, 0, 0x6ab8d8, { rough: 0.2, opacity: 0.8, transparent: true, seg: 12 });
    cyl(bottle, 0.02, 0.02, 0.04, 0, 0.13, 0, 0x1f5fb8, { rough: 0.5, seg: 10 });
    holoTag(bottle, "water for the diver", 0, 0.3, 0, { css: CDDC_CSS, w: 0.36 });
    reg(hits, bottle, "water-bottle");
    box(g, 0.3, 0.5, 0.3, 3.0, 0.72, 0.6, 0x3a4148, { rough: 0.6, metal: 0.4 });
    const table = group(g, -2.8, 0.47, 0.6);
    box(table, 0.8, 0.06, 0.5, 0, 0.8, 0, 0x5b4a3a, { rough: 0.8 });
    for (const [lx, lz] of [[-0.35, -0.2], [0.35, -0.2], [-0.35, 0.2], [0.35, 0.2]]) cyl(table, 0.022, 0.022, 0.8, lx, 0.4, lz, 0x3a4148, { rough: 0.6, metal: 0.4, seg: 6 });
    const log = decal(table, 0.34, 0.24, 0, 0.84, 0, paperFace("CHAMBER LOG", ["Checks · found ____", "Symptom · told ____", "Press · analyser ____"], { bg: "#f3efe4", band: CDDC_CSS }), { px: 160 });
    log.rotation.x = -Math.PI / 2;
    holoTag(table, "chamber log · dive record", 0, 1.1, 0, { css: CDDC_CSS, w: 0.46 });
    reg(hits, log, "chamber-log");
    const team = decal(g, 0.6, 0.4, -1.4, 1.35, 3.1, (cx, w, h) => {
      cx.fillStyle = "#101c27"; cx.fillRect(0, 0, w, h); cx.fillStyle = "#59c97b"; cx.fillRect(0, 0, w, 6);
      cx.font = `600 ${Math.round(h * 0.15)}px 'Barlow Condensed', Arial, sans-serif`; cx.textAlign = "left"; cx.textBaseline = "middle";
      cx.fillStyle = "#e6f6ea"; cx.fillText("CHAMBER TEAM", w * 0.06, h * 0.22);
      cx.font = `${Math.round(h * 0.11)}px Arial, sans-serif`; cx.fillStyle = "#f4f8fb";
      ["Supervisor · Operator", "Attendant · Diver", "Observation: on the bench"].forEach((l, i) => cx.fillText(l, w * 0.06, h * (0.46 + i * 0.18)));
    }, { px: 256, glow: true, ei: 0.6 });
    team.rotation.y = Math.PI;
    box(g, 0.66, 0.46, 0.04, -1.4, 1.35, 3.13, 0x2b3138, { rough: 0.6 });
    reg(hits, team, "team-board");
    for (const x of [-3.2, 3.2]) { cyl(g, 0.1, 0.12, 0.45, x, 0.7, 3.0, 0x2b3138, { rough: 0.5, metal: 0.5, seg: 12 }); ball(g, 0.12, x, 0.95, 3.0, 0x2b3138, { rough: 0.5, metal: 0.5, seg: 10, seg2: 8 }); }
    const ext = cyl(g, 0.08, 0.08, 0.5, -2.6, 0.75, -1.4, 0xd2312b, { rough: 0.4, seg: 12 });
    void ext;
    for (let i = 0; i < 4; i++) box(g, 0.34, 0.06, 0.5, -2.0 + i * 0.14, 0.5, -1.9, 0x8a6a2a, { rough: 0.9 });

    const waterTex = water.material.map;

    return {
      hits,
      spawnLook: new THREE.Vector3(0.2, 1.1, -0.2),
      onStep() {},
      onStepComplete(step) {
        if (step.id === "chamber-checks") { grit.visible = false; rag.visible = false; }
        if (step.id === "medical-lock") { innerDoor.rotation.y = 0; outerDoor.rotation.y = -0.9; }
        if (step.id === "comms-check") commsLamp.material = mat(0x59c97b, { emissive: 0x59c97b, ei: 1.4 });
        if (step.id === "attendant-kit") pocket.position.set(1.4, 0.65, 0.7);
        if (step.id === "observation-hold") shoulder.visible = true;
        if (step.id === "symptom-card") repaint(card, paperFace("SYMPTOMS", ["Seen: rubbed R shoulder", "Said: 'just sore'", "Told supervisor: yes"], { bg: "#e6f6ea", band: "#59c97b" }));
        if (step.id === "attendant-enter") { diver.visible = false; shoulder.visible = false; door.position.z = 0.7; }
        if (step.id === "read-analyser") needle.material = mat(0x59c97b, { rough: 0.4 });
        if (step.id === "pass-water") { bottle.position.set(-1.4, 1.0, 0.35); outerDoor.rotation.y = 0; innerDoor.rotation.y = 0; }
        if (step.id === "chamber-log") repaint(log, paperFace("CHAMBER LOG", ["Grit · rag: found, cleared", "Shoulder · told: timed", "Press · analyser · knocks"], { bg: "#e6f6ea", band: "#59c97b" }));
      },
      onHazard() {},
      onInterrupt(it) {
        if (it.id === "shoulder-shrug") { shoulder.visible = true; shoulder.material = mat(0xd2312b, { emissive: 0xd2312b, ei: 1.4 }); }
        if (it.id === "comms-drop") commsLamp.material = mat(0xd2312b, { emissive: 0xd2312b, ei: 1.0 });
      },
      onInterruptEnd(it) {
        if (it.id === "shoulder-shrug" && it.resolved === "answered") supervisor.position.set(-0.4, 0.47, 2.6);
        if (it.id === "comms-drop" && it.resolved === "answered") commsLamp.material = mat(0xf2c14b, { emissive: 0xf2c14b, ei: 1.0 });
      },
      animate(t, dt, session) {
        const step = session?.step;
        if (waterTex?.offset) { waterTex.offset.x = t * 0.004; waterTex.offset.y = t * 0.005; }
        if (session?.turn && step?.id === "bibs-supply") bibs.userData.wheel.rotation.y = session.turn.amount * Math.PI * 2;
        const gg = session?.gauge;
        if (gg && !gg.committed && step?.id === "read-analyser") needle.position.x = -0.1 + gg.t * 0.2;
        if (shoulder.visible) shoulder.scale.setScalar(1 + Math.sin(t * 4) * 0.2);
        void dt; void stripe;
      },
    };
  },
};
