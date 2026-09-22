import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, ball, torus, hose, group, decal, repaint, signFace, paperFace,
  standingPerson, mat,
} from "../../../shared/kit.js";
import {
  CITY, stationPad, holoPanel, holoTag, toolChest, instrument, standingFigure,
  surfaceTexture, texturedMat, pavingFace, waterFace, reg,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Damage Assessment Team VR — Emergency Services, disaster
// relief, Environmental Monitoring district. A rapid windshield-and-driveway
// damage-assessment sweep after a storm, the way FEMA's own Preliminary
// Damage Assessment classification and a NIMS/ICS block assignment expect
// it to run: paired with a buddy under a real assignment, PPE on and the
// downed-line and gas-smell rules treated as absolute, a structure classified
// from the street — affected, minor, major or destroyed — with a photo and a
// GPS point rather than a memory, the resident met at the driveway and told
// plainly what this team is and is not, a referral card handed over, the
// visibly unsafe structure never entered, and the finished record uploaded
// rather than carried home on a clipboard. Sited generically on a residential
// block after a regional storm; no real address, storm or resident is named.

const DAT_ACCENT = 0xd98f4f;
const DAT_ALERT = 0xf0645b;

export const SIM_DAMAGE_ASSESSMENT_TEAM = {
  id: "damage-assessment-team",
  index: "210",
  domain: "Emergency Services",
  trade: "Disaster relief worker — AFSCME / LIUNA with the Red Cross volunteer workforce",
  category: "Emergency Services",
  district: "Environmental Monitoring",
  weather: "overcast",
  certification: "FEMA's Preliminary Damage Assessment classification for Individual Assistance — affected, minor, major and destroyed — run here under a NIMS/ICS block assignment (FEMA IS-100/IS-700); the National Electrical Safety Code (NESC) rule, matched by OSHA 29 CFR 1926.416, that any downed conductor is treated as energized until the utility itself says otherwise; the American Red Cross's disaster-assessment team protocol pairing every assessor with a buddy and routing every visibly unsafe structure to a qualified inspector instead of a walk-through; the AFSCME and LIUNA safety language covering the disaster-relief crews who run these sweeps",
  name: "Damage Assessment Team",
  title: simTitle("Damage Assessment Team"),
  tagline: "A post-storm block sweep: buddied and briefed, hazards found from the street, a structure classified and photographed with a GPS point, the resident met and told the truth, an unsafe structure never entered, and the record uploaded",
  accent: DAT_ACCENT,
  accentCss: "#d98f4f",
  parSeconds: 320,
  footprint: 2.6,
  badge: { id: "sweep-complete", name: "Sweep Complete", note: "One structure classified, photographed and logged without a hazard being touched or an unsafe building entered" },

  game: system({
    name: "Block Sweep",
    currency: "ASSESS",
    ranks: ["Assessment Trainee", "Field Assessor", "Team Lead", "Sector Coordinator", "Damage Assessment Certified"],
    badges: [
      { id: "clearance-held", name: "Clearance Held", note: "Never closed the gap on the downed line before it was called in", test: AWARD.stepClean("maintain-clearance") },
      { id: "never-inside", name: "Never Inside", note: "No unsafe action anywhere in the run", test: AWARD.safe },
      { id: "classification-true", name: "Classification True", note: "Called the structure's category on the first sweep of the dial", test: AWARD.precise(0.7) },
    ],
    challenges: [
      { id: "clean-sweep", name: "Clean Sweep", note: "No corrections anywhere in the run", test: AWARD.clean },
      { id: "steady-buddy", name: "Steady Buddy", note: "Held both timed watches the full duration", test: AWARD.unbroken },
      { id: "one-pass", name: "One Pass", note: "Classified, documented and logged inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "close-to-downed-line": "You stepped past the clearance marker to get a closer look at the wire. Every downed conductor is treated as energized until the utility that owns it says otherwise, whether or not it is sparking, moving or looks dead lying in the grass — the clearance distance is what stands between a good story about a close call and a fatality on this block.",
    "flame-near-gas-smell": "You struck a lighter to see better near where the gas smell is strongest. An assessment team's only tool for a suspected gas leak is its nose and its distance from the source — any spark, flame or even a phone call made standing over the smell can be the ignition source for a leak nobody has confirmed the size of yet.",
    "enter-unsafe-structure": "You went in through the door instead of assessing this house from outside. A structure with visible major damage gets classified, photographed and referred to a qualified inspector precisely because an assessment team cannot know from the street whether the floor, the stairs or the roof itself will hold a person's weight — going inside to confirm the damage is how an assessor becomes the next casualty the sweep is trying to prevent.",
    "split-from-buddy": "You walked around to the back of the property alone, out of your buddy's sight. The buddy system exists because a damaged structure with hidden hazards — a collapsed step, a live wire under debris, an unstable overhang — is exactly the kind of place where the person who needs help is the one nobody else knew had gone missing.",
  },

  lateNotes: {
    "gps-lock": "There is no reading to lock yet — classify the structure first, or the GPS point has nothing to attach to.",
  },

  steps: [
    {
      id: "ics-assignment", kind: "select", target: "assignment-board",
      title: "Check in and take today's block assignment",
      cue: "Sign into the sector board and read which block this team is assessing.",
      why: "A damage-assessment team that shows up and picks its own block is a team the incident commander cannot account for — the assignment board is what puts this sweep on the same map as every other team's, so the same structure never gets swept twice while another one goes unseen all day.",
    },
    {
      id: "buddy-check", kind: "select", target: "buddy-partner",
      title: "Confirm your buddy before you leave the truck",
      cue: "Pair up with your buddy and confirm you are working this block together.",
      why: "The Red Cross's own assessment protocol pairs every assessor with a buddy for the same reason a confined-space entry never sends one person down alone — a damaged block hides hazards that are not obvious from a distance, and the buddy is who notices when something has gone wrong with you before you can call it in yourself.",
    },
    {
      id: "ppe-donning", kind: "sequence", anyOrder: true,
      targets: ["ppe-helmet", "ppe-vest", "ppe-gloves"],
      itemNames: { "ppe-helmet": "hard hat", "ppe-vest": "hi-vis vest", "ppe-gloves": "cut-resistant gloves" },
      title: "Put on the team's PPE",
      cue: "Hard hat, hi-vis vest, cut-resistant gloves — any order, all three before you leave the truck.",
      why: "A post-storm block is a field of debris nobody has cleared yet — nails through boards, glass in the grass, overhead limbs still hanging by a thread — and the helmet, the vest that keeps you visible to the utility trucks and other crews working the same street, and the gloves are what let this team touch anything on that block at all.",
    },
    {
      id: "hazard-scan", kind: "find", noHint: true,
      targets: ["downed-line", "gas-odor-source", "unstable-porch"],
      itemNames: { "downed-line": "a downed power line", "gas-odor-source": "the source of a gas smell", "unstable-porch": "a porch roof hanging loose" },
      itemNotes: {
        "downed-line": "Lying across the front yard, half-buried in storm debris — it does not have to be sparking to be live.",
        "gas-odor-source": "A cracked meter connection at the side of the house, the smell strongest right at the fitting.",
        "unstable-porch": "The porch roof has pulled away from the house on one side and is holding on the other — exactly the kind of hazard the street view has to catch before anyone walks under it.",
      },
      title: "Scan the block from the street before approaching anything",
      cue: "Look over the property from the sidewalk. Three hazards have to be found before the team gets any closer.",
      why: "Every hazard this scan is built to catch — a downed line, a gas smell, a hanging structure — is meant to be found from a safe distance, on purpose, because the whole value of scanning first is deciding where not to walk before anybody is standing under or beside the thing that could hurt them.",
    },
    {
      id: "maintain-clearance", kind: "hold", target: "clearance-marker", seconds: 5,
      title: "Hold the marked clearance from the downed line",
      cue: "Stand at the clearance marker and hold position while your buddy calls the line in.",
      why: "The clearance distance only protects anybody if it is actually held, not just noted — standing at the marker while the call goes out is what keeps a team member from drifting closer out of curiosity in the minute it takes the utility's own dispatcher to answer.",
      holdBreakNote: "You stepped off the marker before the line was actually called in. A clearance distance that gets closed the moment nobody is watching was never really being held.",
    },
    {
      id: "classify-structure", kind: "gauge", target: "classification-dial",
      title: "Classify the structure's damage from the street",
      cue: "Sweep the dial through the categories and commit once it reads this structure's actual damage.",
      why: "FEMA's own Preliminary Damage Assessment scale — affected, minor, major, destroyed — exists so that every team on every block classifies damage the same way, and the number that reaches the county's request for federal disaster assistance means the same thing no matter which assessor wrote it down. Calling it from a genuine read of the structure, not from a guess, is what keeps that number honest.",
      gauge: {
        label: "PDA CATEGORY", speed: 0.55, green: [0.52, 0.74],
        readout: (t) => (t < 0.25 ? "AFFECTED" : t < 0.5 ? "MINOR" : t < 0.75 ? "MAJOR" : "DESTROYED"),
        missNote: "That does not match what is actually standing in front of you. Sweep the dial again and commit only once it reads this structure's real category.",
      },
    },
    {
      id: "document-structure", kind: "sequence",
      targets: ["camera-photo", "gps-lock"],
      itemNames: { "camera-photo": "photograph the structure", "gps-lock": "lock the GPS point" },
      title: "Photograph the structure, then lock its GPS point",
      cue: "Take the photo first, then lock the GPS coordinate to the same spot.",
      why: "The photo is what lets anyone reviewing this record later see the same damage the classification was based on, and the GPS point is what puts that photo at the right address on the county's map instead of an approximate one — taken in that order, the two together are what turn a category on a dial into a record somebody else can actually act on.",
      outOfOrderNote: "Photo first, then the GPS lock — a coordinate with no photo behind it proves a location was visited, not what was actually found there.",
    },
    {
      id: "meet-resident", kind: "select", target: "resident-driveway",
      title: "Meet the resident at the driveway",
      cue: "Approach the driveway, not the damaged structure, and introduce the team.",
      why: "Meeting a resident at the driveway rather than walking straight up to their damaged home is a small choice that says a great deal — it puts the conversation on ground the resident is still standing on by choice, rather than starting the encounter by walking toward the thing that just wrecked their week.",
    },
    {
      id: "resident-conversation", kind: "hold", target: "resident-driveway", seconds: 5,
      title: "Hold space for what the resident wants to say first",
      cue: "Hold your attention on the resident and let them say what they need to before you explain anything.",
      why: "A resident standing in their own driveway after a storm usually has something they need to say before they can hear anything a stranger with a clipboard has to tell them — holding that space for a few seconds instead of moving straight into the script is what makes the explanation that follows actually land.",
      holdBreakNote: "You moved into the explanation before the resident had finished. Whatever gets said next lands better once they have actually been heard first.",
    },
    {
      id: "explain-role", kind: "sequence",
      targets: ["explain-purpose", "explain-limits", "hand-referral"],
      itemNames: { "explain-purpose": "explain what this team does", "explain-limits": "explain what this team does not do", "hand-referral": "hand over the referral card" },
      title: "Tell the resident plainly what this team is and is not",
      cue: "Say what the assessment is for, then say plainly what it is not, then hand over the referral card.",
      why: "A resident who thinks this visit is an insurance adjuster's or a repair crew's is a resident who will be angry at the wrong thing later — saying plainly that this is a count for disaster assistance, not a repair estimate and not a guarantee of aid, before handing over the card with the actual resources on it, is what keeps today's honesty from turning into tomorrow's broken promise.",
      outOfOrderNote: "Purpose, then limits, then the referral card — handing over the card before the resident understands what this visit does and does not mean turns a piece of paper into a promise nobody made.",
    },
    {
      id: "placard-post", kind: "select", target: "placard",
      title: "Placard the structure from outside",
      cue: "Post the damage placard on the exterior — do not go in to confirm anything first.",
      why: "The placard is what tells the next person on this block — another team, a utility crew, the resident's own family — what this structure was found to be without anyone having to repeat the assessment or, worse, repeat the mistake of going inside to check. It goes up from the outside, because that is the only vantage point this assessment was ever supposed to use.",
    },
    {
      id: "upload-sync", kind: "track", target: "upload-panel", seconds: 6,
      title: "Hold a signal and upload the finished record",
      cue: "Keep the tablet's signal steady until the record finishes uploading.",
      why: "A record still sitting on a tablet in the truck is a record the county's damage map does not have yet, and a post-storm block is exactly where cell signal is least reliable — holding position long enough for a clean upload, rather than driving off the moment the bar appears to move, is what actually gets this structure onto the map instead of losing it to a dropped connection.",
      track: { start: 0.2, green: [0.7, 1.0], rise: 0.4, fall: 0.5, drift: 0.1, label: "UPLOAD", readout: (v) => (v >= 0.98 ? "complete" : v >= 0.7 ? "syncing" : "signal weak") },
      holdBreakNote: "The signal dropped before the upload finished. A structure this team already classified, photographed and referred correctly still is not on the map until the record actually finishes uploading.",
    },
    {
      id: "handover-log", kind: "select", target: "sector-log",
      title: "Log the structure to the sector's running tally",
      cue: "Record the classification, the address point and the referral given in the sector log.",
      why: "The sector coordinator is building a running tally out of every team's log, and a structure this team correctly classified in the field is worth nothing to that tally until it is actually written into it — the log is what turns one team's afternoon into the county's real picture of the block.",
    },
    {
      id: "crew-checkin", kind: "select", target: "crew-checkin-board",
      title: "Check in with your buddy before the next address",
      cue: "Ask your buddy how that one actually was, and name the peer-support line before you move on.",
      why: "Standing in a stranger's driveway and telling them plainly that their home is a total loss is not a neutral thing to do over and over down a block, and the Red Cross's own critical-incident support line and the AFSCME/LIUNA peer-support contacts exist because the team doing the telling is carrying something too. Checking in with your buddy between addresses is what keeps that weight from just accumulating unspoken all day.",
    },
  ],

  interrupts: [
    {
      id: "downed-line-energized",
      kind: "Downed line confirmed energized",
      after: "maintain-clearance", delay: 2, seconds: 12,
      alert: "The downed line just arced against the wet grass — whatever doubt there was about it being live is gone.",
      cue: "Do not touch anything near it. Get the utility called in now.",
      target: "report-radio",
      why: "An arc is the line answering the only question the clearance distance was ever hedging against, and the only correct response to it is the same one the rule already called for — call the utility in immediately and hold the clearance, because nothing this team carries can make a live conductor safe to approach.",
      missNote: "The line kept arcing in the wet grass with nobody calling it in. A confirmed energized conductor a storm crew has not been told about is a hazard sitting on this block for every team, resident and utility worker who walks past it after you leave.",
      wrongNote: "That does not answer the line. Get on the radio and report it to the utility — nothing else on this block does anything for a live conductor.",
    },
    {
      id: "resident-wants-entry",
      kind: "Resident asks the team to go inside",
      after: "resident-conversation", delay: 3, seconds: 13,
      alert: "The resident asks you to just run in and grab her medication from the kitchen counter — \"it'll take you two seconds.\"",
      cue: "Say no gently, and offer what you can actually do instead.",
      target: "decline-and-refer",
      why: "Two seconds inside a structure this team has not classified as safe is exactly how an assessor becomes a second emergency at an address that already has one — declining kindly and pointing to what the referral card and a qualified inspector can actually do for her is the honest answer, not the compassionate-sounding one that risks a second casualty at this house.",
      missNote: "Somebody went in for the medication anyway. A resident's genuine, reasonable-sounding request does not change what a street assessment can safely confirm about the floor two steps past that door.",
      wrongNote: "That does not answer her, and it does not send anyone inside either. Decline gently and point her to what the referral card can actually get her.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.6, DAT_ACCENT);

    // ------------------------------------------------------------- ground
    const street = box(g, 3.2, 0.08, 6.6, -2.6, 0.04, 0, 0xffffff, { rough: 0.85 });
    street.material = texturedMat(
      surfaceTexture((cx, w, h) => pavingFace(cx, w, h, { tiles: 5, base: "#3a3d3f", base2: "#33363a", seam: "rgba(0,0,0,0.4)" }), { repeat: 4, px: 512 }),
      { rough: 0.85, metal: 0.02, color: 0xc9ccd0 },
    );
    const driveway = box(g, 2.6, 0.09, 2.2, 0.1, 0.045, 1.3, 0xffffff, { rough: 0.82 });
    driveway.material = texturedMat(
      surfaceTexture((cx, w, h) => pavingFace(cx, w, h, { tiles: 4, base: "#8a8578", base2: "#7d786c", seam: "rgba(0,0,0,0.3)" }), { repeat: 3, px: 384 }),
      { rough: 0.85, metal: 0.02, color: 0xd6d2c4 },
    );
    const lawn = box(g, 2.6, 0.02, 4.4, 1.9, 0.14, -0.5, 0xffffff, { rough: 0.95, cast: false });
    lawn.material = texturedMat(
      surfaceTexture((cx, w, h) => { cx.fillStyle = "#3a3324"; cx.fillRect(0, 0, w, h);
        cx.fillStyle = "rgba(100,90,60,0.4)"; for (let i = 0; i < 500; i++) { const x = Math.random() * w, y = Math.random() * h; cx.fillRect(x, y, 2, 5); } },
        { repeat: 3, px: 256 }),
      { rough: 0.98, metal: 0, color: 0xa89a76 },
    );
    // A flooded gutter along the street from the storm.
    const gutterPool = box(g, 0.5, 0.02, 5.6, -1.05, 0.11, 0, 0xffffff, { rough: 0.1, metal: 0, cast: false });
    gutterPool.material = texturedMat(
      surfaceTexture((cx, w, h) => waterFace(cx, w, h, { swell: 12, crest: 60 }), { repeat: 2, px: 384 }),
      { rough: 0.15, metal: 0.1, color: 0x3a5a66 },
    );

    // ------------------------------------------------------------- the storm-damaged house
    const house = group(g, 1.7, 0, -0.9, 0.1);
    box(house, 3.0, 2.4, 2.6, 0, 1.2, 0, 0xc9b896, { rough: 0.9 });
    box(house, 3.1, 0.5, 2.7, 0, 2.65, 0, 0x6f5a42, { rough: 0.85 });
    // A collapsed section of roof, dressing the "major" damage this station
    // wants classified — half the ridge is down into the attic space.
    box(house, 1.4, 0.4, 1.3, -0.75, 2.35, -0.3, 0x5a4a38, { rough: 0.9 }).rotation.z = 0.3;
    for (let i = 0; i < 6; i++) box(house, 0.5, 0.04, 0.3, -0.6 + Math.random() * 1.4, 2.2 + Math.random() * 0.3, -0.6 + Math.random() * 1.0, 0x8a7a5c, { rough: 0.9 });
    // Front door — the temptation to go inside for a closer look.
    const doorGrp = group(house, 0.4, 0, 1.31);
    const doorLeaf = box(doorGrp, 0.9, 2.0, 0.05, 0, 1.0, 0, 0x4a3c2c, { rough: 0.6 });
    holoTag(doorGrp, "Enter for a closer look?", 0, 2.15, 0, { css: "#f0645b", w: 0.5 });
    reg(hits, doorLeaf, "enter-unsafe-structure");
    // The loose porch roof over the front step.
    const porch = group(house, -0.6, 0, 1.5);
    box(porch, 1.6, 0.08, 0.9, 0, 2.1, 0, 0x8a7a5c, { rough: 0.85 }).rotation.z = 0.18;
    for (const px of [-0.6, 0.6]) cyl(porch, 0.03, 0.03, 2.0, px, 1.0, 0.35, 0x6f6350, { rough: 0.8, seg: 10 });
    const porchTrap = box(porch, 1.6, 0.08, 0.9, 0, 2.1, 0, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    porchTrap.rotation.z = 0.18;
    reg(hits, porchTrap, "unstable-porch");
    holoTag(porch, "Loose porch roof", 0.6, 2.35, 0.3, { css: "#f0645b", w: 0.36 });

    // Gas meter with a cracked fitting on the side of the house.
    const meter = group(house, -1.51, 0, -0.7, -Math.PI / 2);
    box(meter, 0.2, 0.3, 0.12, 0, 1.0, 0, 0x8a8f94, { rough: 0.5, metal: 0.5 });
    cyl(meter, 0.03, 0.03, 0.14, 0, 1.0, 0.09, CITY.steel, { rough: 0.4, metal: 0.7, seg: 10 }).rotation.x = Math.PI / 2;
    const meterCrack = decal(meter, 0.1, 0.06, 0, 0.9, 0.061, (cx, w, h) => {
      cx.clearRect(0, 0, w, h);
      cx.strokeStyle = "rgba(240,100,90,0.85)"; cx.lineWidth = Math.max(1.5, w * 0.02);
      cx.beginPath(); cx.moveTo(w * 0.2, h * 0.2); cx.lineTo(w * 0.55, h * 0.5); cx.lineTo(w * 0.35, h * 0.8); cx.stroke();
    }, { px: 96, transparent: true, cast: false });
    reg(hits, meterCrack, "gas-odor-source");
    const gasCloud = decal(meter, 0.3, 0.3, 0, 1.2, 0.1, (cx, w, h) => {
      cx.clearRect(0, 0, w, h);
      cx.fillStyle = "rgba(200,220,180,0.12)";
      for (let i = 0; i < 6; i++) { const r = 10 + i * 6; cx.beginPath(); cx.arc(w / 2, h / 2, r, 0, Math.PI * 2); cx.fill(); }
    }, { px: 96, transparent: true, cast: false });
    void gasCloud;
    // The temptation prop: a lighter sitting near the meter to "see better."
    const lighter = group(house, -1.3, 0, -0.55);
    box(lighter, 0.03, 0.06, 0.02, 0, 0.75, 0, 0xd8232a, { rough: 0.5 });
    holoTag(lighter, "Light it to look closer?", 0, 0.84, 0, { css: "#f0645b", w: 0.44 });
    reg(hits, lighter, "flame-near-gas-smell");

    // ------------------------------------------------------------- downed line
    const pole = group(g, -0.4, 0, -2.3, 0.15);
    cyl(pole, 0.07, 0.09, 3.4, 0, 1.7, 0, 0x5a4a38, { rough: 0.85, seg: 10 }).rotation.z = 0.25;
    const lineStart = [0.5, 2.9, -2.3];
    const lineEnd = [0.6, 0.1, 0.4];
    const lineMid = [(lineStart[0] + lineEnd[0]) / 2 + 0.3, (lineStart[1] + lineEnd[1]) / 2 - 0.3, (lineStart[2] + lineEnd[2]) / 2];
    hose(g, [lineStart, lineMid, lineEnd], 0.012, 0x22262b, { steps: 16, rough: 0.7 });
    const lineTip = ball(g, 0.03, lineEnd[0], lineEnd[1], lineEnd[2], 0x22262b, { rough: 0.6 });
    holoTag(g, "Downed line", lineEnd[0], lineEnd[1] + 0.2, lineEnd[2], { css: "#f0645b", w: 0.32 });
    reg(hits, lineTip, "downed-line");
    const sparkBurst = decal(g, 0.2, 0.2, lineEnd[0], lineEnd[1] + 0.02, lineEnd[2], (cx, w, h) => {
      cx.clearRect(0, 0, w, h);
      cx.strokeStyle = "rgba(255,220,140,0.9)"; cx.lineWidth = Math.max(1, w * 0.02);
      for (let i = 0; i < 5; i++) { const a2 = (i / 5) * Math.PI * 2; cx.beginPath(); cx.moveTo(w / 2, h / 2); cx.lineTo(w / 2 + Math.cos(a2) * w * 0.4, h / 2 + Math.sin(a2) * h * 0.4); cx.stroke(); }
    }, { px: 96, transparent: true, cast: false });
    sparkBurst.visible = false;
    // Clearance marker cones a safe distance from the line.
    const clearMarker = group(g, 1.4, 0, 0.9);
    cyl(clearMarker, 0.09, 0.02, 0.28, 0, 0.14, 0, DAT_ALERT, { rough: 0.6, seg: 12 });
    torus(clearMarker, 0.35, 0.01, 0, 0.01, 0, 0xf2c14b, { emissive: 0xf2c14b, ei: 1.2, rough: 0.5, cast: false, seg: 6, seg2: 32 });
    holoTag(clearMarker, "Clearance line", 0, 0.4, 0, { css: "#f0645b", w: 0.36 });
    reg(hits, clearMarker, "clearance-marker");
    // The tempting closer-look spot, well inside the clearance ring.
    const closeSpot = group(g, 0.9, 0, 0.6);
    ball(closeSpot, 0.02, 0, 0.15, 0, DAT_ALERT, { emissive: DAT_ALERT, ei: 1.1, rough: 0.5 });
    holoTag(closeSpot, "Closer look?", 0, 0.3, 0, { css: "#f0645b", w: 0.34 });
    reg(hits, closeSpot, "close-to-downed-line");
    const reportRadio = group(g, 1.9, 0, 1.4);
    box(reportRadio, 0.1, 0.16, 0.05, 0, 1.0, 0, 0x2b3138, { rough: 0.5 });
    holoTag(reportRadio, "Report to utility", 0, 1.12, 0, { css: "#d98f4f", w: 0.4 });
    reg(hits, reportRadio, "report-radio");

    // ------------------------------------------------------------- assignment + PPE
    const truck = group(g, -2.6, 0, 2.2, 0.3);
    box(truck, 1.6, 1.0, 2.4, 0, 0.5, 0, 0xd98f4f, { rough: 0.5, metal: 0.3 });
    box(truck, 1.5, 0.7, 1.0, 0, 1.15, 0.7, 0xdfe4e8, { rough: 0.4, metal: 0.2, opacity: 0.7, transparent: true });
    for (const [wx, wz] of [[-0.7, 0.9], [0.7, 0.9], [-0.7, -0.9], [0.7, -0.9]]) cyl(truck, 0.22, 0.22, 0.18, wx, 0.22, wz, 0x1b1e22, { rough: 0.7, seg: 16 });

    const assignBoard = holoPanel(g, 0.6, 0.4, -2.0, 1.6, 1.7, (cx, w, h) => {
      cx.fillStyle = "rgba(20,12,4,0.9)"; cx.fillRect(0, 0, w, h);
      cx.fillStyle = "#d98f4f"; cx.fillRect(0, 0, w, 5);
      cx.fillStyle = "#fde3c9";
      cx.font = `600 ${Math.round(h * 0.11)}px 'Barlow Condensed', Arial, sans-serif`;
      cx.textAlign = "left"; cx.textBaseline = "middle";
      cx.fillText("SECTOR ASSIGNMENT", w * 0.06, h * 0.16);
      cx.font = `${Math.round(h * 0.085)}px Arial, sans-serif`; cx.fillStyle = "#e0c19a";
      ["Block 400 — residential", "Report structures by PDA category", "Buddy pairs only"].forEach((line, i) => cx.fillText(line, w * 0.06, h * (0.42 + i * 0.15)));
    }, { ry: 0.7, accent: DAT_ACCENT });
    reg(hits, assignBoard, "assignment-board");

    const buddy = standingFigure(g, -1.9, 2.0, { ry: -0.6, cloth: 0x37505f, vest: DAT_ACCENT, atStation: true });
    holoTag(buddy, "Buddy", 0, 1.9, 0, { css: "#d98f4f", w: 0.24 });
    reg(hits, buddy, "buddy-partner");

    const ppeChest = toolChest(g, -2.2, 1.3, { ry: -0.6, color: DAT_ACCENT });
    const ppeSpec = [["ppe-helmet", "HAT", -0.16, 0.8], ["ppe-vest", "VEST", 0, 0.8], ["ppe-gloves", "GLOVE", 0.16, 0.8]];
    for (const [id, label, x, y] of ppeSpec) {
      const item = group(ppeChest, x, y, 0.22);
      box(item, 0.1, 0.06, 0.03, 0, 0, 0, 0xf2c14b, { rough: 0.6 });
      decal(item, 0.08, 0.04, 0, 0, 0.016, signFace(label, { bg: "#1b1e22", accent: "#f2c14b", scale: 0.5 }), { px: 96 });
      reg(hits, item, id);
    }

    // ------------------------------------------------------------- classification, camera, gps
    const classifyPost = group(g, -0.2, 0, 1.6);
    const classDial = instrument(classifyPost, 0, 1.05, 0, { idle: "READ SITE", color: DAT_ACCENT, w: 0.2, d: 0.22, ry: 0.3 });
    reg(hits, classDial, "classification-dial");
    const camera = group(g, -0.4, 0, 1.9);
    box(camera, 0.1, 0.08, 0.07, 0, 0.95, 0, 0x2b3138, { rough: 0.5 });
    holoTag(camera, "Camera", 0, 1.02, 0, { css: "#d98f4f", w: 0.28 });
    reg(hits, camera, "camera-photo");
    const gpsUnit = group(g, -0.05, 0, 2.0);
    cyl(gpsUnit, 0.05, 0.05, 0.08, 0, 0.9, 0, 0xdfe4e8, { rough: 0.4, metal: 0.3, seg: 12 });
    holoTag(gpsUnit, "GPS unit", 0, 0.98, 0, { css: "#d98f4f", w: 0.28 });
    reg(hits, gpsUnit, "gps-lock");

    // ------------------------------------------------------------- resident + placard + referral
    const resident = standingPerson(g, 0.7, 2.0, { ry: 2.6, cloth: 0x6b4a5a, hiVis: false, skin: 0xc99878 });
    holoTag(resident.torso, "Resident", 0, 1.7, 0, { css: "#d98f4f", w: 0.3 });
    reg(hits, resident.torso, "resident-driveway");
    const declineChip = group(g, 1.05, 0, 1.85);
    ball(declineChip, 0.02, 0, 1.2, 0, DAT_ACCENT, { emissive: DAT_ACCENT, ei: 1.2, rough: 0.5 });
    holoTag(declineChip, "Decline — offer the referral", 0, 1.34, 0, { css: "#d98f4f", w: 0.5 });
    reg(hits, declineChip, "decline-and-refer");
    const referralCard = decal(g, 0.24, 0.16, 1.25, 0.9, 1.7, paperFace("REFERRAL", ["FEMA registration line", "Red Cross casework"], { bg: "#f4e9d8", band: "#d98f4f" }), { px: 160 });
    referralCard.rotation.x = -Math.PI / 2;
    reg(hits, referralCard, "hand-referral");
    const purposeTag = group(g, 0.55, 0, 1.9);
    ball(purposeTag, 0.015, 0, 1.1, 0, DAT_ACCENT, { emissive: DAT_ACCENT, ei: 1.1, rough: 0.5 });
    holoTag(purposeTag, "What we do", 0, 1.22, 0, { css: "#d98f4f", w: 0.34 });
    reg(hits, purposeTag, "explain-purpose");
    const limitsTag = group(g, 0.85, 0, 1.95);
    ball(limitsTag, 0.015, 0, 1.1, 0, DAT_ACCENT, { emissive: DAT_ACCENT, ei: 1.1, rough: 0.5 });
    holoTag(limitsTag, "What we don't do", 0, 1.22, 0, { css: "#d98f4f", w: 0.4 });
    reg(hits, limitsTag, "explain-limits");

    const placard = decal(house, 0.2, 0.24, 1.4, 1.4, 1.35, signFace("MAJOR", { bg: "#2a1a08", accent: "#f0645b", scale: 0.5 }), { px: 128 });
    reg(hits, placard, "placard");

    // Solo-sweep decoy around the back of the property.
    const backCorner = group(house, -1.4, 0, -1.4);
    ball(backCorner, 0.02, 0, 0.2, 0, DAT_ALERT, { emissive: DAT_ALERT, ei: 1.0, rough: 0.5 });
    holoTag(backCorner, "Check the back alone?", 0, 0.34, 0, { css: "#f0645b", w: 0.5 });
    reg(hits, backCorner, "split-from-buddy");

    // ------------------------------------------------------------- upload + logs
    const uploadPanel = instrument(g, -2.4, 1.1, 1.9, { idle: "-- %", color: DAT_ACCENT, w: 0.2, d: 0.24, ry: 0.6 });
    reg(hits, uploadPanel, "upload-panel");

    const sectorLog = holoPanel(g, 0.52, 0.36, -2.3, 1.5, 2.6, (cx, w, h) => {
      cx.fillStyle = "rgba(20,12,4,0.9)"; cx.fillRect(0, 0, w, h);
      cx.fillStyle = "#d98f4f"; cx.fillRect(0, 0, w, 5);
      cx.fillStyle = "#fde3c9";
      cx.font = `600 ${Math.round(h * 0.14)}px 'Barlow Condensed', Arial, sans-serif`;
      cx.textAlign = "center"; cx.textBaseline = "middle";
      cx.fillText("SECTOR TALLY", w / 2, h * 0.34);
      cx.font = `${Math.round(h * 0.09)}px Arial, sans-serif`; cx.fillStyle = "#e0c19a";
      cx.fillText("Category · address · referral", w / 2, h * 0.64);
    }, { ry: 0.5, accent: DAT_ACCENT });
    reg(hits, sectorLog, "sector-log");

    const crewBoard = holoPanel(g, 0.5, 0.34, -1.7, 1.5, 2.75, (cx, w, h) => {
      cx.fillStyle = "rgba(20,12,4,0.9)"; cx.fillRect(0, 0, w, h);
      cx.fillStyle = "#7fd1c9"; cx.fillRect(0, 0, w, 5);
      cx.fillStyle = "#e3f7ee";
      cx.font = `600 ${Math.round(h * 0.13)}px 'Barlow Condensed', Arial, sans-serif`;
      cx.textAlign = "center"; cx.textBaseline = "middle";
      cx.fillText("BUDDY CHECK-IN", w / 2, h * 0.32);
      cx.font = `${Math.round(h * 0.08)}px Arial, sans-serif`; cx.fillStyle = "#bfe8d6";
      cx.fillText("Red Cross critical-incident line", w / 2, h * 0.6);
      cx.fillText("AFSCME / LIUNA peer support posted", w / 2, h * 0.78);
    }, { ry: 0.4, accent: 0x7fd1c9 });
    reg(hits, crewBoard, "crew-checkin-board");

    // Ambient dressing.
    standingFigure(g, -2.2, -1.1, { ry: 1.2, cloth: 0x445566 });
    for (let i = 0; i < 5; i++) {
      const debris = box(g, 0.18 + Math.random() * 0.2, 0.06 + Math.random() * 0.1, 0.16 + Math.random() * 0.18,
        1.0 + Math.random() * 1.2, 0.05, -1.6 + Math.random() * 1.2, 0x8a7a5c, { rough: 0.9 });
      debris.rotation.y = Math.random() * 3;
    }

    let lineArcing = false, alarmed = false;

    return {
      hits,
      footprint: 2.6,
      spawnLook: new THREE.Vector3(0.4, 1.3, 0.6),

      onStepComplete(step) {
        if (step.id === "classify-structure") { repaint(classDial.userData.screen, signFace("MAJOR", { bg: "#0d1c24", accent: "#f2c14b", fg: "#ffe6c9", scale: 0.5 })); }
        if (step.id === "document-structure") { repaint(uploadPanel.userData.screen, signFace("READY", { bg: "#0d1c24", accent: "#59c97b", fg: "#ffe6c9", scale: 0.55 })); }
        if (step.id === "placard-post") { repaint(placard, signFace("PLACARDED", { bg: "#2a1a08", accent: "#59c97b", scale: 0.42 })); }
        if (step.id === "upload-sync") { repaint(uploadPanel.userData.screen, signFace("SYNCED", { bg: "#0d1c24", accent: "#59c97b", fg: "#eafcf9", scale: 0.5 })); }
      },

      onInterrupt(it) {
        if (it.id === "downed-line-energized") { lineArcing = true; sparkBurst.visible = true; lineTip.material = mat(0xf2c14b, { emissive: 0xf2c14b, ei: 2.0, rough: 0.4 }); }
        if (it.id === "resident-wants-entry") { alarmed = true; resident.arms[0].shoulder.rotation.x = -0.6; }
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "downed-line-energized") { lineArcing = false; sparkBurst.visible = false; lineTip.material = mat(0x22262b, { rough: 0.6 }); }
        if (it.id === "resident-wants-entry") { alarmed = false; resident.arms[0].shoulder.rotation.x = 0; }
      },

      onHazard() {},

      animate(t, dt, session) {
        void dt; void alarmed;
        if (lineArcing) sparkBurst.material.opacity = 0.5 + Math.sin(t * 20) * 0.5;
        const gg = session?.gauge;
        if (gg && !gg.committed && session.step?.id === "classify-structure") {
          const label = gg.t < 0.25 ? "AFFECTED" : gg.t < 0.5 ? "MINOR" : gg.t < 0.75 ? "MAJOR" : "DESTROYED";
          repaint(classDial.userData.screen, signFace(label, { bg: "#0d1c24", accent: gg.t >= 0.52 && gg.t <= 0.74 ? "#59c97b" : "#f2c14b", fg: "#ffe6c9", scale: 0.45 }));
        }
        const tr = session?.track;
        if (tr && session.step?.id === "upload-sync") {
          repaint(uploadPanel.userData.screen, signFace(`${Math.round(tr.v * 100)}%`, { bg: "#0d1c24", accent: tr.v >= 0.7 ? "#59c97b" : "#f0645b", fg: "#eafcf9", scale: 0.55 }));
        }
      },
    };
  },
};
