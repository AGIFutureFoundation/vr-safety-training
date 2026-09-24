import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import { box, cyl, torus, group, decal, repaint, signFace, paperFace, mat, hose } from "../../../shared/kit.js";
import {
  stationPad, holoPanel, holoTag, standingFigure, barrierPanel, cone, reg, surfaceTexture, texturedMat, pavingFace,
} from "../citykit.js";
import { fourGasMeter, radio, flashlight } from "../../../shared/toolkit.js";
import { pickup } from "../../../shared/fleet.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Permit Entry & Attendant Duties VR — Water & Environmental,
// the confined-space block.
//
// A drained equalisation tank at a generic treatment plant, entered through
// its side manway by a UA pipefitter to replace a mixer seal, with a LIUNA
// laborer as the attendant and an IUOE plant operator as the entry
// supervisor. The learner is the attendant. The station is about the two
// things the other confined-space stations take for granted: the permit as a
// document — its fields, what a blank one means — and the attendant's job,
// which is to stay at the opening, know who is inside, keep talking to them,
// keep everyone else out, and get them out without going in. The testing
// order, ventilation and retrieval rigging are their own stations. No real
// plant, tank or person is named, and no exposure limit is written here that
// the permit does not carry.

const CPE_ACCENT = 0x4fb3d9;
const CPE_CSS = "#4fb3d9";
const CPE_WARN = "#e0664f";

/** The posted danger sign a permit space carries, in the Z535 DANGER layout. */
function cpeDanger(parent, x, y, z, ry) {
  const p = decal(parent, 0.5, 0.34, x, y, z, (c, w, h) => {
    c.fillStyle = "#000"; c.fillRect(0, 0, w, h);
    c.fillStyle = "#fff"; c.fillRect(4, 4, w - 8, h - 8);
    c.fillStyle = "#c8102e"; c.fillRect(4, 4, w - 8, h * 0.28);
    c.fillStyle = "#fff"; c.font = `800 ${Math.round(h * 0.19)}px Arial, sans-serif`; c.textAlign = "center"; c.textBaseline = "middle";
    c.fillText("⚠ DANGER", w / 2, h * 0.18);
    c.fillStyle = "#000"; c.font = `800 ${Math.round(h * 0.11)}px Arial, sans-serif`;
    ["PERMIT-REQUIRED", "CONFINED SPACE", "DO NOT ENTER"].forEach((l, i) => c.fillText(l, w / 2, h * (0.46 + i * 0.16)));
  }, { px: 320 });
  p.rotation.y = ry;
  return p;
}

export const SIM_CS_PERMIT_ENTRY_AND_ATTENDANT_DUTIES = {
  id: "cs-permit-entry-and-attendant-duties",
  index: "321",
  domain: "Water & Environmental",
  trade: "Confined-space attendant — LIUNA laborer at the manway, with a UA pipefitter entrant and an IUOE operator as entry supervisor",
  category: "Water & Environmental",
  weather: "overcast",
  certification: "OSHA 29 CFR 1910.146 permit-required confined spaces — the entry permit's required fields, the duties of the entrant, attendant and entry supervisor, and rescue and emergency services; OSHA 29 CFR 1926 Subpart AA where the entry is construction work, with its coordination between employers on a shared site; ANSI Z117.1 confined-space entry practice; OSHA 29 CFR 1910.147 for the isolations the permit lists; NIOSH confined-space criteria; LIUNA, UA and IUOE confined-space training",
  name: "Permit Entry & Attendant Duties",
  title: simTitle("Permit Entry & Attendant Duties"),
  tagline: "The attendant's shift at a tank manway: the permit read field by field and its blanks caught, roles signed, the opening barricaded and posted, the comms checked from inside, the entrant tagged in, the retrieval line on, a continuous watch the foreman tries to pull you off, a comm check that goes unanswered, the perimeter kept, the entrant tagged out, and the permit cancelled and filed",
  accent: CPE_ACCENT,
  accentCss: CPE_CSS,
  parSeconds: 280,
  footprint: 2.6,
  badge: { id: "never-left-the-hole", name: "Never Left the Hole", note: "The permit complete before entry, the count always right, the attendant never off the opening and never inside it" },

  supportLine: "your LIUNA, UA or IUOE local's member assistance programme, or the employee assistance line printed on the back of the entry permit",

  game: system({
    name: "Permit Space",
    currency: "ENTRIES",
    ranks: ["Hole Watch Trainee", "Attendant", "Lead Attendant", "Entry Supervisor", "Permit Space Qualified"],
    badges: [
      { id: "stayed-outside", name: "Stayed Outside", note: "Never went in, never left the post, never let an unsigned entry or an untrained helper through", test: AWARD.safe },
      { id: "blank-means-stop", name: "Blank Means Stop", note: "Every blank on the permit caught before the entry", test: AWARD.stepClean("permit-blanks") },
      { id: "clean-watch", name: "Clean Watch", note: "No corrections from the permit to the file", test: AWARD.clean },
    ],
    challenges: [
      { id: "unbroken-watch", name: "Unbroken Watch", note: "The watch held in band the whole time", test: AWARD.unbroken },
      { id: "clear-comms", name: "Clear Comms", note: "The comm check committed inside the band first time", test: AWARD.precise(0.7) },
      { id: "tight-entry", name: "Tight Entry", note: "Permit to file inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "attendant-goes-in": "You started to climb into the manway to see why the entrant was quiet. The attendant never enters: they are the only person outside who knows how many people are in the space and the only one positioned to summon rescue. An attendant who goes in to help becomes a second casualty in whatever put the first one down, with nobody left at the opening.",
    "entry-before-signature": "You waved the entrant into the manway before the entry supervisor had signed the permit. The signature is the entry supervisor's statement that every condition on the permit is in place — isolations, testing, rescue — and without it the entry is not authorised. Nobody goes past the barrier until it is signed.",
    "untrained-helper": "You let the passing laborer duck in to 'hand the entrant a wrench'. Only the entrants named on the permit enter, because only they are trained for this space, wearing its equipment, and on the attendant's count. Anybody else is an unaccounted person in a hazardous atmosphere.",
    "leave-for-the-truck": "You walked off toward the truck for the spare seal. An attendant stays at the opening for the whole entry unless another trained attendant takes over. Walking away leaves nobody watching the entrant, the monitor or the perimeter, and nobody to call rescue if the entrant goes quiet.",
  },

  lateNotes: {
    "tag-socket": "The entrant tags in once the permit is signed, the opening is posted and comms are proven from inside.",
    "retrieval-anchor": "The retrieval line goes on the entrant's harness before the entrant goes in, not once they are inside.",
    "permit-file": "The permit is cancelled and filed once the count is zero and the space is closed.",
  },

  steps: [
    {
      id: "permit-read", kind: "select", target: "permit-board",
      title: "Read the entry permit field by field",
      cue: "Read the posted permit: the space and the purpose of entry, the date and duration, the entrants, attendant and entry supervisor by name, the hazards, isolations, acceptable conditions, test results, rescue service and communication method.",
      why: "29 CFR 1910.146 sets out what an entry permit has to identify, and every field is there because an entry went wrong without it: the purpose, so the job does not grow into something else inside the tank; the duration, so a permit does not outlive the conditions it was written for; the names, so the count means something; the rescue service, so help is arranged before it is needed. The attendant reads it because the attendant enforces it.",
    },
    {
      id: "permit-blanks", kind: "find", noHint: true,
      targets: ["rescue-blank", "duration-blank", "test-blank"],
      itemNames: { "rescue-blank": "rescue service left blank", "duration-blank": "permit duration left open-ended", "test-blank": "initial atmosphere test column empty" },
      itemNotes: {
        "rescue-blank": "Nobody is named for rescue. An entry with no rescue arranged is an entry where the plan for a collapse is the attendant going in — the entry stops until a rescue service is named and reachable.",
        "duration-blank": "The duration is blank. A permit is valid for the job and the conditions it describes; open-ended, it is still 'valid' tomorrow when nothing on it is true.",
        "test-blank": "The initial test results are empty. The acceptable conditions mean nothing until a reading is written against them, time and tester included.",
      },
      title: "Find the blanks on this permit",
      cue: "Three required fields on this permit are blank or open-ended. Find them before anyone signs.",
      why: "A blank field on a permit is not an oversight to be filled in later; it is a condition of entry that nobody has established. The attendant is often the last person to read the permit before the entrant goes in, and a permit with a blank rescue line, no duration or no test results is one the entry supervisor sends back rather than signs, under 1910.146 and under ANSI Z117.1 practice alike.",
    },
    {
      id: "roles-signed", kind: "sequence",
      targets: ["supervisor-signs", "attendant-named", "entrant-named"],
      itemNames: { "supervisor-signs": "entry supervisor signs the completed permit", "attendant-named": "you, named as attendant", "entrant-named": "the pipefitter, named as entrant" },
      title: "Roles signed: supervisor, attendant, entrant",
      cue: "The entry supervisor signs the completed permit, you initial as attendant, and the entrant initials against their name.",
      why: "Each role in a permit entry carries different duties under 1910.146, and the signatures are what make the division real: the entry supervisor authorises and can terminate the entry, the attendant watches and summons, the entrant works and gets out when told. On a construction job the rule in 29 CFR 1926 Subpart AA adds that the host and every contractor with people near the space know who holds each role.",
      outOfOrderNote: "The supervisor signs the completed permit first — the attendant and entrant are taking on an authorised entry, not an unsigned one.",
    },
    {
      id: "post-opening", kind: "select", target: "manway-barrier",
      title: "Barricade the opening and post it",
      cue: "Close the barrier round the manway platform and hang the danger sign where anyone approaching sees it.",
      why: "The open manway is a way into a hazardous atmosphere for anybody who walks past, and a plant has people walking past all day. A barrier and the posted danger sign mark the space as a permit space in use so that nobody wanders in, and they give the attendant a line to hold: anybody inside the barrier who is not on the permit is somebody the attendant turns away.",
    },
    {
      id: "comms-check", kind: "gauge", target: "comms-panel",
      title: "Prove comms with the entrant from inside the tank",
      cue: "With the entrant just inside the manway, key the hardwired set and commit when their reply reads clear, not broken.",
      why: "Steel tank walls eat radio signals, and a set that works on the platform can be dead two metres inside. The communication method on the permit has to be proven from where the entrant will work before they go there, because the attendant's whole job depends on hearing them. A hardwired set on the retrieval line, or a radio relay the permit names, is proven with a real reply.",
      gauge: { label: "COMMS", speed: 0.7, green: [0.48, 0.66], readout: (t) => (t < 0.48 ? "broken — words dropping" : t > 0.66 ? "feedback — reset gain" : "clear reply"), missNote: "Not a clear reply — reseat the headset lead and key it again before the entrant goes past the manway." },
    },
    {
      id: "tag-in", kind: "drag", target: "entrant-tag",
      title: "Tag the entrant in on the attendant board",
      cue: "Take the entrant's tag from OUT and hang it in the IN column as they go through the manway.",
      why: "The attendant's first duty under 1910.146 is to know how many people are in the space and who they are, continuously and accurately. A tag board at the opening turns that into something visible to everyone — the entry supervisor, a relief attendant, a rescue team arriving — and it is the only record that matters in the minute when somebody asks how many are inside.",
      drag: { to: "tag-socket", radius: 0.5, missNote: "Not in the IN column — hang the entrant's tag on the IN side of the board as they go through the manway." },
    },
    {
      id: "retrieval-on", kind: "select", target: "retrieval-anchor",
      title: "Retrieval line on the entrant's harness, anchored outside",
      cue: "Check the retrieval line runs from the entrant's harness to the anchor and winch at the manway, so you can bring them out without going in.",
      why: "Non-entry rescue is the attendant's rescue: a retrieval line on the entrant's harness, anchored outside, lets the attendant pull a person out of the space without entering it, which 1910.146 requires wherever it does not add a hazard of its own. It has to go on before entry, because once the entrant is down there is no reaching them to clip it on.",
    },
    {
      id: "watch", kind: "track", target: "watch-post", seconds: 7,
      title: "Keep a continuous watch at the manway",
      cue: "Stay at the opening with the entrant in sight or in voice contact, the monitor in view and the perimeter in the corner of your eye.",
      why: "The attendant watches three things at once: the entrant, for signs the atmosphere is getting to them; the monitor on the line, for a change in the space; and the barrier, for anybody coming in. None of that works from anywhere but the opening, and it does not pause — which is why 1910.146 keeps the attendant at the post until relieved and gives them nothing else to do.",
      track: { start: 0.12, green: [0.4, 0.62], rise: 0.55, fall: 0.45, drift: 0.12, label: "WATCH", readout: (v) => (v < 0.4 ? "attention drifting" : v > 0.62 ? "tunnelled on the entrant" : "entrant, monitor, perimeter") },
      holdBreakNote: "Your watch slipped out of band — drifting, or tunnelled on one thing. Bring it back: entrant, monitor, perimeter, round and round.",
    },
    {
      id: "comm-interval", kind: "hold", target: "comms-call", seconds: 6,
      title: "Run a comm check and wait for the answer",
      cue: "Call the entrant on the set and hold until they answer with their status.",
      why: "A comm check is a question the entrant has to answer, not a noise the attendant makes. The answer — clear words, the right status — is how the attendant hears the early signs of an atmosphere working on someone: slurring, confusion, no reply. That is why the check is held until it is answered, and why the answer is judged, not just received.",
      holdBreakNote: "You broke off before the entrant answered. An unanswered check is exactly what you are listening for — hold until you hear them.",
    },
    {
      id: "perimeter", kind: "find", noHint: true,
      targets: ["idling-truck", "visitor-in-barrier", "hose-in-manway"],
      itemNames: { "idling-truck": "a truck idling upwind of the manway", "visitor-in-barrier": "a visitor inside the barrier", "hose-in-manway": "a hose run through the manway" },
      itemNotes: {
        "idling-truck": "A delivery truck is idling upwind of the manway, its exhaust drifting toward the opening and the blower intake. It gets moved.",
        "visitor-in-barrier": "A plant visitor has stepped inside the barrier to look in. Only the people on the permit come inside it; the attendant turns them back.",
        "hose-in-manway": "A washdown hose has been run through the manway. It blocks the way out and the retrieval line, and it can carry water into the tank. It comes out.",
      },
      title: "Keep the perimeter",
      cue: "Three things round the manway have changed since the entry started. Find them.",
      why: "The attendant's duties under 1910.146 include keeping unauthorised people away and watching for conditions outside the space that could endanger the entrant. A plant does not stop around a permit entry: trucks deliver, visitors tour, somebody needs a hose. Each change is small and each one reaches the entrant — exhaust at the opening, a body in the barrier, the exit blocked.",
    },
    {
      id: "tag-out", kind: "sequence",
      targets: ["entrant-out", "tag-to-out", "count-zero"],
      itemNames: { "entrant-out": "entrant out through the manway", "tag-to-out": "tag moved back to OUT", "count-zero": "count reads zero, manway closed" },
      title: "Entrant out, tag out, count zero",
      cue: "See the entrant out of the manway, move their tag back to OUT, confirm the count is zero, then close the manway.",
      why: "An entry ends when the count is zero, not when the work is done. The attendant sees each entrant out with their own eyes and moves the tag themselves, so the board is never right by assumption, and only then is the manway closed. A manway closed on a count nobody checked is how a person has been sealed in a space.",
      outOfOrderNote: "Out, then the tag, then the count — the board follows the person, never the other way round.",
    },
    {
      id: "permit-file", kind: "select", target: "permit-file",
      title: "Cancel the permit and file it with the problems noted",
      cue: "The entry supervisor cancels the permit; note the blanks you caught, the unanswered check, the truck, the visitor and the hose, and file it.",
      why: "A cancelled permit is kept because the problems written on it are how the permit programme gets reviewed and fixed — 1910.146 has the employer review its programme using the cancelled permits. The blanks caught before entry, the unanswered check and the perimeter breaches are exactly the things that review is for; a clean-looking file is a programme that learns nothing.",
    },
    {
      id: "crew-checkin", kind: "select", target: "crew-radio",
      title: "Check in with the entry supervisor and the entrant",
      cue: "Radio the entry supervisor that the permit is closed, and check in with the entrant about the moment they went quiet.",
      why: "The entry supervisor needs to hear the permit is closed and the space secured before the plant brings the tank back. The entrant who went quiet, and the attendant who was deciding whether to haul, have both had a frightening few minutes, and the member assistance programme on the back of the permit exists for exactly that. Asking costs nothing on the platform.",
    },
  ],

  interrupts: [
    {
      id: "pulled-off-post",
      kind: "Attendant pulled off the post",
      after: "watch", delay: 2, seconds: 12,
      alert: "The job foreman walks up: 'Run and grab the spare seal off the truck, he'll be fine for two minutes.'",
      cue: "Do not leave. Radio the entry supervisor for a relief attendant — you stay at the manway until one is standing next to you.",
      target: "supervisor-radio",
      why: "The attendant does not leave the opening for any errand, for any length of time, unless another trained attendant takes over. The foreman is asking for a small thing; what they are actually asking is for nobody to be watching the entrant. The answer is a relief attendant called by radio, not an argument.",
      missNote: "You stayed put but nobody called for relief, and the foreman went off and came back with another hand who walked straight to the manway to 'help'. For two minutes nobody was watching the monitor or the count.",
      wrongNote: "That does not solve it. Radio the entry supervisor for a relief attendant — that is the only way anyone other than you watches this hole.",
    },
    {
      id: "no-answer",
      kind: "Entrant not answering",
      after: "comm-interval", delay: 2, seconds: 12,
      alert: "The entrant's reply comes back slurred, then stops. The monitor on the line has started to chirp.",
      cue: "Order the evacuation now: sound the air horn and call them out, and get ready to haul on the retrieval line — do not go in.",
      target: "evac-horn",
      why: "Slurred speech then silence is the textbook sign of an atmosphere affecting an entrant, and the attendant's duty under 1910.146 is to order them out, summon rescue and use the retrieval line — never to enter. The horn is the order everyone understands; the line is the rescue the attendant can do from outside.",
      missNote: "Nobody ordered the evacuation. The entrant stayed on the mixer with the monitor chirping until they slumped against the tank wall, and the retrieval line had to haul a person who could no longer help.",
      wrongNote: "The entrant has stopped answering. Sound the air horn and order them out — that is the attendant's job right now.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.6, CPE_ACCENT);

    // ------------------------------------------------------------ the pad
    const padTex = surfaceTexture((cx, w, h) => pavingFace(cx, w, h, { tiles: 6, base: "#9a9c98", base2: "#8e908c", seam: "rgba(0,0,0,0.18)" }), { repeat: 3, px: 384 });
    const pad = box(g, 6.2, 0.06, 5.4, 0, 0.03, -0.2, 0x9a9c98, { rough: 0.95, cast: false });
    pad.material = texturedMat(padTex, { rough: 0.95, color: 0xa3a5a1 });

    // --------------------------------------------------- the tank and manway
    const tank = group(g, -0.2, 0, -1.9);
    const shell = cyl(tank, 1.2, 1.2, 4.6, 0, 1.45, 0, 0x7f8c8a, { rough: 0.55, metal: 0.55, seg: 28 });
    shell.rotation.z = Math.PI / 2;
    for (const sx of [-1.6, 1.6]) box(tank, 0.3, 0.5, 1.6, sx, 0.25, 0, 0x5b6360, { rough: 0.7, metal: 0.4 });
    for (const sx of [-2.3, 2.3]) { const cap = cyl(tank, 1.22, 1.22, 0.06, sx, 1.45, 0, 0x6b7775, { rough: 0.5, metal: 0.6, seg: 28 }); cap.rotation.z = Math.PI / 2; }
    const manway = group(tank, 0, 1.2, 1.18);
    torus(manway, 0.32, 0.05, 0, 0, 0, 0x5b6360, { rough: 0.5, metal: 0.6, seg: 10, seg2: 28 });
    const hole = cyl(manway, 0.3, 0.3, 0.04, 0, 0, 0.0, 0x0c0e10, { rough: 0.95, seg: 24 });
    hole.rotation.x = Math.PI / 2;
    const cover = cyl(tank, 0.36, 0.36, 0.05, 0.9, 1.2, 1.2, 0x5b6360, { rough: 0.5, metal: 0.6, seg: 24 });
    cover.rotation.x = Math.PI / 2;
    holoTag(tank, "equalisation tank — side manway", 0, 2.85, 0.6, { css: CPE_CSS, w: 0.56 });
    const goIn = box(manway, 0.4, 0.4, 0.2, 0, 0, 0.1, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(manway, "climb in to check on him?", 0, 0.5, 0.1, { css: CPE_WARN, w: 0.46 });
    reg(hits, goIn, "attendant-goes-in");
    // The entrant, working just inside the manway.
    const entrant = standingFigure(tank, 0.25, 0.7, { ry: Math.PI, cloth: 0x2f6fa8, atStation: true, harness: true });
    entrant.position.y = 0.3;
    entrant.visible = false;
    // Platform and step at the manway, with the barrier on it.
    const platform = group(g, -0.2, 0, -0.35);
    box(platform, 1.4, 0.4, 0.7, 0, 0.2, 0, 0x6b737c, { rough: 0.6, metal: 0.5 });
    box(platform, 1.4, 0.02, 0.7, 0, 0.41, 0, 0x8a939b, { rough: 0.8, metal: 0.5 });
    const barrier = group(platform, 0, 0.42, 0.42);
    for (const sx of [-0.6, 0.6]) cyl(barrier, 0.02, 0.02, 0.9, sx, 0.45, 0, 0xf2c14b, { rough: 0.5, seg: 8 });
    const chain = box(barrier, 1.2, 0.03, 0.03, 0, 0.8, 0, 0xd8232a, { rough: 0.5 });
    chain.visible = false;
    const sign = cpeDanger(barrier, 0, 0.55, 0.03, 0);
    sign.visible = false;
    const barrierHit = box(barrier, 1.2, 0.5, 0.06, 0, 0.6, 0, 0xf2c14b, { opacity: 0.2, transparent: true, cast: false });
    holoTag(barrier, "barricade and post", 0, 1.05, 0, { css: CPE_CSS, w: 0.32 });
    reg(hits, barrierHit, "manway-barrier");
    // Retrieval davit and winch at the manway.
    const davit = group(g, 0.75, 0, -0.35);
    cyl(davit, 0.05, 0.06, 1.9, 0, 1.0, 0, 0xf2c14b, { rough: 0.5, metal: 0.5, seg: 10 });
    const arm = box(davit, 0.06, 0.06, 0.7, 0, 1.92, -0.3, 0xf2c14b, { rough: 0.5, metal: 0.5 });
    void arm;
    box(davit, 0.2, 0.22, 0.18, 0.1, 1.0, 0.05, 0x2b2f34, { rough: 0.5, metal: 0.5 });
    const line = hose(g, [[0.75, 1.9, -0.95], [0.3, 1.5, -0.8], [0.0, 1.25, -0.72], [-0.1, 1.0, -0.9]], 0.008, 0xf2f6fa, { steps: 12, rough: 0.7 });
    void line;
    holoTag(davit, "retrieval winch — anchored outside", 0, 2.15, 0, { css: CPE_CSS, w: 0.58 });
    reg(hits, davit, "retrieval-anchor");

    // ------------------------------------------------------ the permit board
    const permit = group(g, -2.2, 0, 0.3, 0.7);
    for (const sx of [-0.45, 0.45]) cyl(permit, 0.03, 0.03, 1.8, sx, 0.9, 0, 0x59636d, { rough: 0.5, metal: 0.6, seg: 8 });
    const board = holoPanel(permit, 0.95, 0.72, 0, 1.4, 0.02, (ctx, w, h) => {
      ctx.fillStyle = "#f2efe6"; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#22303c"; ctx.fillRect(0, 0, w, h * 0.12);
      ctx.fillStyle = "#ffffff"; ctx.font = `700 ${Math.round(h * 0.075)}px Arial, sans-serif`; ctx.textAlign = "left"; ctx.textBaseline = "middle";
      ctx.fillText("CONFINED SPACE ENTRY PERMIT", w * 0.04, h * 0.06);
      ctx.fillStyle = "#1d262e"; ctx.font = `${Math.round(h * 0.052)}px Arial, sans-serif`;
      ["Space: EQ tank 2, side manway", "Purpose: replace mixer seal", "Date: today   Duration: ________", "Entrant: pipefitter   Attendant: laborer", "Entry supervisor: plant operator", "Hazards: O2-deficient, H2S, engulfment", "Isolations: inlet valve locked, mixer LOTO", "Acceptable: per the permit's entry limits", "Initial test: time __ O2 __ LEL __ H2S __", "Rescue service: __________________", "Comms: hardwired set on the line"].forEach((l, i) => ctx.fillText(l, w * 0.04, h * (0.17 + i * 0.075)));
    }, { accent: CPE_ACCENT });
    reg(hits, board, "permit-board");
    const blankAt = (id, y, x = 0.1, w = 0.4) => { const m = box(permit, w, 0.05, 0.02, x, y, 0.04, 0xe0664f, { opacity: 0.18, transparent: true, cast: false }); reg(hits, m, id); return m; };
    const durBlank = blankAt("duration-blank", 1.4 + 0.36 - 0.17 * 0.72 - 2 * 0.075 * 0.72, 0.25, 0.35);
    const testBlank = blankAt("test-blank", 1.4 + 0.36 - 0.17 * 0.72 - 8 * 0.075 * 0.72, 0.05, 0.6);
    const rescueBlank = blankAt("rescue-blank", 1.4 + 0.36 - 0.17 * 0.72 - 9 * 0.075 * 0.72, 0.2, 0.45);
    const supSign = box(permit, 0.3, 0.06, 0.02, -0.28, 0.98, 0.04, 0x2f7d4a, { opacity: 0.35, transparent: true, cast: false });
    holoTag(permit, "supervisor signs", -0.28, 0.9, 0.05, { css: CPE_CSS, w: 0.28 });
    reg(hits, supSign, "supervisor-signs");
    const attInit = box(permit, 0.2, 0.06, 0.02, 0.05, 0.98, 0.04, 0x2f7d4a, { opacity: 0.35, transparent: true, cast: false });
    reg(hits, attInit, "attendant-named");
    const entInit = box(permit, 0.2, 0.06, 0.02, 0.32, 0.98, 0.04, 0x2f7d4a, { opacity: 0.35, transparent: true, cast: false });
    holoTag(permit, "attendant · entrant", 0.19, 0.9, 0.05, { css: CPE_CSS, w: 0.32 });
    reg(hits, entInit, "entrant-named");
    const unsigned = box(g, 0.4, 0.3, 0.3, -1.3, 0.75, 0.25, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "send him in before it's signed?", -1.3, 1.05, 0.25, { css: CPE_WARN, w: 0.54 });
    reg(hits, unsigned, "entry-before-signature");

    // ------------------------------------------- attendant station at the post
    const post = group(g, 0.6, 0, 0.75, -0.2);
    box(post, 0.7, 0.8, 0.45, 0, 0.4, 0, 0x53606b, { rough: 0.7, metal: 0.3 });
    const tagBoard = group(post, -0.1, 0.8, -0.1);
    box(tagBoard, 0.5, 0.36, 0.03, 0, 0.2, 0, 0xf2efe6, { rough: 0.7 });
    decal(tagBoard, 0.46, 0.08, 0, 0.34, 0.017, signFace("OUT   |   IN", { bg: "#22303c", accent: CPE_CSS, fg: "#fff", scale: 0.5 }));
    const tag = box(tagBoard, 0.08, 0.1, 0.02, -0.12, 0.18, 0.03, 0xf2c14b, { rough: 0.6 });
    holoTag(tagBoard, "entrant tag", -0.12, 0.05, 0.04, { css: CPE_CSS, w: 0.22 });
    reg(hits, tag, "entrant-tag");
    const tagSocket = box(tagBoard, 0.14, 0.16, 0.06, 0.12, 0.18, 0.03, 0xffffff, { opacity: 0.001, transparent: true, cast: false });
    hits["tag-socket"] = tagSocket;
    const tagOut = box(tagBoard, 0.14, 0.16, 0.06, -0.12, 0.3, 0.05, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, tagOut, "tag-to-out");
    const commsPanel = group(post, 0.22, 0.8, 0.05);
    box(commsPanel, 0.2, 0.12, 0.14, 0, 0.06, 0, 0x1b1e23, { rough: 0.5 });
    const commsLampOk = mat(0x59c97b, { emissive: 0x59c97b, ei: 1.2, rough: 0.4 });
    const commsLampBad = mat(0xe0664f, { emissive: 0xe0664f, ei: 1.8, rough: 0.4 });
    const lamp = box(commsPanel, 0.04, 0.03, 0.03, 0.06, 0.13, 0.05, 0x59c97b, { rough: 0.4 });
    lamp.material = commsLampOk;
    const commsFace = decal(commsPanel, 0.12, 0.07, -0.03, 0.07, 0.071, signFace("SET --", { bg: "#0d1a24", accent: CPE_CSS, fg: "#dff2fa", scale: 0.5 }), { glow: true, ei: 0.8 });
    holoTag(commsPanel, "hardwired comms", 0, 0.28, 0.06, { css: CPE_CSS, w: 0.3 });
    reg(hits, commsFace, "comms-panel");
    const callBtn = cyl(commsPanel, 0.025, 0.025, 0.02, 0.06, 0.07, 0.07, 0xf2c14b, { rough: 0.5, seg: 12 });
    callBtn.rotation.x = Math.PI / 2;
    reg(hits, callBtn, "comms-call");
    const watchPost = box(g, 0.5, 0.05, 0.5, 0.1, 0.07, 0.35, 0x4fb3d9, { opacity: 0.25, transparent: true, cast: false });
    holoTag(g, "attendant's post", 0.1, 0.3, 0.35, { css: CPE_CSS, w: 0.3 });
    reg(hits, watchPost, "watch-post");
    const meter = fourGasMeter(post, -0.25, 0.8, 0.12, { ry: 0.2 });
    holoTag(post, "monitor on the line", -0.25, 1.05, 0.14, { css: CPE_CSS, w: 0.34 });
    void meter;
    const horn = group(post, 0.3, 0.8, -0.14);
    cyl(horn, 0.04, 0.04, 0.12, 0, 0.06, 0, 0xd8232a, { rough: 0.5, seg: 12 });
    cyl(horn, 0.02, 0.05, 0.09, 0, 0.16, 0, 0xdfe4e8, { rough: 0.4, metal: 0.6, seg: 12 });
    holoTag(post, "air horn — evacuate", 0.3, 1.14, -0.14, { css: CPE_CSS, w: 0.34 });
    reg(hits, horn, "evac-horn");
    const supRadio = radio(post, 0.05, 0.8, 0.14, { ry: -0.2 });
    holoTag(post, "radio — entry supervisor", 0.05, 1.2, 0.16, { css: CPE_CSS, w: 0.42 });
    reg(hits, supRadio, "supervisor-radio");
    flashlight(post, -0.05, 0.8, -0.16, { ry: 1.3 });
    const exitMark = box(manway, 0.5, 0.2, 0.1, 0, -0.35, 0.18, 0x59c97b, { opacity: 0.2, transparent: true, cast: false });
    reg(hits, exitMark, "entrant-out");
    const countMark = box(post, 0.2, 0.08, 0.05, -0.1, 0.72, -0.16, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, countMark, "count-zero");

    // ------------------------------------------------------ perimeter changes
    const truck = pickup(g, 3.5, 0, 0.3, { ry: 0 });
    reg(hits, truck, "idling-truck");
    holoTag(g, "idling upwind", 3.5, 2.2, 0.3, { css: CPE_WARN, w: 0.3 });
    const visitor = standingFigure(g, -0.9, -0.2, { ry: 2.8, cloth: 0xdfe4e8, trousers: 0x3a4148, atStation: true });
    holoTag(visitor, "visitor — inside the barrier", 0, 1.95, 0, { css: CPE_WARN, w: 0.44 });
    reg(hits, visitor, "visitor-in-barrier");
    const washHose = hose(g, [[-2.2, 0.06, -0.9], [-1.3, 0.06, -0.6], [-0.5, 0.45, -0.55], [-0.2, 1.1, -0.72]], 0.02, 0x2f7d4a, { steps: 14, rough: 0.6 });
    const hoseHit = box(g, 0.4, 0.3, 0.3, -0.6, 0.55, -0.55, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, hoseHit, "hose-in-manway");
    const helper = standingFigure(g, -1.9, 1.5, { ry: 2.2, cloth: 0xf2a23b, trousers: 0x2b3138 });
    holoTag(helper, "'I'll just pop in'", 0, 1.95, 0, { css: CPE_WARN, w: 0.32 });
    reg(hits, helper, "untrained-helper");
    const toTruck = box(g, 0.4, 0.3, 0.3, 1.6, 0.75, 0.9, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "walk to the truck for the seal?", 1.6, 1.05, 0.9, { css: CPE_WARN, w: 0.52 });
    reg(hits, toTruck, "leave-for-the-truck");
    barrierPanel(g, -2.6, -1.4, { ry: 1.2 });
    for (const [x, z] of [[2.6, 1.6], [-2.8, 1.8]]) cone(g, x, z);

    // Filing box, crew radio, the foreman (hidden until the push) and relief.
    const fileBox = group(g, 1.9, 0, 1.8, -0.6);
    box(fileBox, 0.5, 0.7, 0.35, 0, 0.35, 0, 0x6b5a48, { rough: 0.7 });
    const fileSheet = decal(fileBox, 0.28, 0.2, 0, 0.705, 0, paperFace("CANCELLED PERMITS", ["Problems noted", "Kept for review"], { scale: 0.6 }));
    fileSheet.rotation.x = -Math.PI / 2;
    reg(hits, fileSheet, "permit-file");
    const crewRadio = radio(fileBox, 0.14, 0.7, 0.08, { ry: -0.3 });
    holoTag(fileBox, "radio — crew", 0.14, 1.0, 0.08, { css: CPE_CSS, w: 0.24 });
    reg(hits, crewRadio, "crew-radio");
    const foreman = standingFigure(g, 1.4, 1.7, { ry: -2.6, cloth: 0x5a4a3a, trousers: 0x23282f });
    foreman.visible = false;
    const relief = standingFigure(g, -0.35, 1.2, { ry: 3.0, cloth: 0xf2a23b, trousers: 0x2b3138, vest: 0xd8e84a });
    relief.visible = false;
    void washHose;

    let watchT = 0;
    return {
      hits,
      footprint: 2.6,
      spawnLook: new THREE.Vector3(-0.3, 1.1, -0.8),
      onStepComplete(step) {
        if (step.id === "permit-blanks") { for (const m of [durBlank, testBlank, rescueBlank]) m.material = mat(0x2f7d4a, { opacity: 0.3, transparent: true }); }
        if (step.id === "roles-signed") { for (const m of [supSign, attInit, entInit]) m.material = mat(0x2f7d4a, { opacity: 0.8, transparent: true }); }
        if (step.id === "post-opening") { chain.visible = true; sign.visible = true; barrierHit.visible = false; }
        if (step.id === "tag-in") { tag.position.x = 0.12; entrant.visible = true; }
        if (step.id === "perimeter") { truck.position.x = 4.6; visitor.visible = false; hoseHit.visible = false; washHose.visible = false; }
        if (step.id === "tag-out") { tag.position.x = -0.12; entrant.visible = false; cover.position.set(0, 1.2, 1.22); }
      },
      onInterrupt(it) {
        if (it.id === "pulled-off-post") foreman.visible = true;
        if (it.id === "no-answer") { lamp.material = commsLampBad; entrant.rotation.z = 0.5; }
      },
      onInterruptEnd(it) {
        if (it.id === "pulled-off-post" && it.resolved === "answered") { foreman.visible = false; relief.visible = true; }
        if (it.id === "no-answer" && it.resolved === "answered") { lamp.material = commsLampOk; entrant.rotation.z = 0; entrant.position.z = 1.0; }
      },
      animate(t, dt, session) {
        const step = session?.step;
        const gg = session?.gauge;
        if (gg && !gg.committed && step?.id === "comms-check") repaint(commsFace, signFace(gg.t < 0.48 ? "BROKEN" : gg.t > 0.66 ? "FEEDBACK" : "CLEAR", { bg: "#0d1a24", accent: gg.t >= 0.48 && gg.t <= 0.66 ? "#59c97b" : "#f2ae14", fg: "#dff2fa", scale: 0.5 }));
        if (step?.id === "watch" && session.holding) { watchT += dt; entrant.userData.head && (entrant.userData.head.rotation.y = Math.sin(watchT) * 0.3); }
      },
    };
  },
};
