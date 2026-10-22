import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, slab, group, decal, repaint, signFace, paperFace, seatedFigure,
} from "../../../shared/kit.js";
import {
  CITY, stationPad, holoPanel, holoTag, instrument, standingFigure,
  surfaceTexture, texturedMat, pavingFace, reg,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Employer Meet-and-Greet VR — Pathway Edition, wojrc.org.
//
// A job-fair hall on the day before an apprenticeship application closes:
// the fair map read before the floor is worked, the three tables that
// actually matter found among the ones that do not, a thirty-second pitch
// rehearsed in order, a warehouse employer greeted at a steady volume, a
// longer conversation with an apprenticeship coordinator held with real
// engagement, a resume handed to the right table, contact information
// swapped and a follow-up question asked before the floor closes. Sited
// generically: no real employer, fair or clause number the registry is not
// sure of.

const EMG_ACCENT = 0xe0834a;
const EMG_CSS = "#e0834a";

export const SIM_WP_EMPLOYER_MEET_AND_GREET = {
  id: "wp-employer-meet-and-greet",
  index: "710",
  domain: "Workforce readiness",
  trade: "Pathway Edition — an employer meet-and-greet and a job-fair walk",
  category: "Community Environmental Justice",
  indoor: "service",
  weather: "clear",
  certification: "Registered apprenticeship standards as a category — what the coordinator's table on this floor is actually recruiting toward; the OSHA Outreach Training Program's OSHA 10 card, one of the first questions an employer table asks about; Teamsters (IBT) apprenticeship and driver training programmes, named on the union table's own sign; 29 CFR 1910.22 for the walking-working surfaces a crowded hall shares with every other floor; 29 CFR 1910.151 for the first-aid response a warm, packed room can turn into a real need; SAMHSA's guidance on help-seeking, for the coach's own debrief at the end of the floor",
  name: "Employer Meet-and-Greet",
  title: simTitle("Employer Meet-and-Greet"),
  tagline: "Read the fair map, find the three tables that matter, rehearse the pitch, greet an employer at a steady volume, hold a real conversation with the coordinator, hand off the resume and swap contact information before the floor closes",
  accent: EMG_ACCENT,
  accentCss: EMG_CSS,
  parSeconds: 320,
  footprint: 2.6,
  supportLine: "the programme's own coaching staff, and 988 or SAMHSA's National Helpline (1-800-662-4357, free and confidential) if a crowded room and a deadline both at once are more than the day can hold",
  badge: { id: "floor-worked", name: "Floor Worked", note: "The map read, the right three tables found, the pitch rehearsed in order, both conversations held steady, the resume handed off and contact information swapped before the close" },

  game: system({
    name: "Job Fair Floor",
    currency: "TABLE",
    ranks: ["Walking In", "Floor Mapped", "Pitch Given", "Contact Made", "Job Fair Certified"],
    badges: [
      { id: "three-tables", name: "Three Tables", note: "The map held through and the right three tables found clean", test: AWARD.all(AWARD.stepClean("read-map"), AWARD.stepClean("find-tables")) },
      { id: "worked-the-floor", name: "Worked The Floor", note: "No unsafe action anywhere on the floor", test: AWARD.safe },
      { id: "held-the-room", name: "Held The Room", note: "The coordinator conversation carried without a break", test: AWARD.unbroken },
    ],
    challenges: [
      { id: "clean-floor", name: "Clean Floor", note: "No corrections anywhere", test: AWARD.clean },
      { id: "steady-volume", name: "Steady Volume", note: "The volume gauge committed near the middle of the band", test: AWARD.precise(0.7) },
      { id: "worked-fast", name: "Worked Fast", note: "Finished inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "wp-eg-cord-tangle": "You were about to cross the tangle of extension cords running between the booth displays and the main aisle. A hall this crowded turns a loose cord into a trip for the person behind you as much as for you — the cords get taped flat along the floor, not left loose across the walkway between tables.",
    "wp-eg-heat-skip-water": "You were about to skip the water table to save time before the coordinator's line got longer. A packed hall with the air conditioning struggling is exactly where people quietly overheat while telling themselves they will grab water after the next table — take the cup now, on the way, rather than after the headache starts.",
    "wp-eg-line-cutter": "Someone behind you in the coordinator's line has pushed past to cut in ahead, getting in the face of the person he shoved past. Space and a level voice come first — step back, let the floor staff handle the line, and do not let it turn into a shoving match over a spot that will still be there in a minute.",
    "wp-eg-fainting-visitor": "Someone in the queue near the union table has gone pale and is swaying on their feet. A hot, crowded room is exactly where heat exhaustion shows up first as unsteadiness — get them seated, get water and floor staff over, and stay with them rather than stepping around them to keep your place in line.",
  },

  lateNotes: {
    "wp-eg-resume-packet": "Not yet. The resume goes in the bin once you have actually introduced yourself at that table — a resume dropped with no conversation behind it gets read last, if at all.",
    "wp-eg-fair-log": "The log closes out the floor last, with which tables you actually worked and what the follow-up is.",
  },

  steps: [
    {
      id: "sign-in", kind: "select", target: "wp-eg-signin-table",
      title: "Sign in at the registration table",
      cue: "Sign the registration sheet with your name and which track you are on.",
      why: "The registration table is how the fair's organisers know who walked the floor and which tables to expect you at, and naming your track — warehouse or Class A — is what lets the volunteers point you toward the right side of the room before you have spent ten minutes finding it yourself.",
    },
    {
      id: "read-map", kind: "hold", target: "wp-eg-map-board", seconds: 6,
      title: "Read the fair map before you walk the floor",
      cue: "Hold at the map board and read where the warehouse employer, the apprenticeship coordinator and the benefits table actually are.",
      why: "A job fair floor is not walked table by table in order; it is worked toward the three tables that actually matter for your track, and the map is the only thing that tells you where those three sit among thirty others. Reading it first is what keeps the limited time on the floor aimed at the right conversations instead of the nearest ones.",
      holdBreakNote: "You left the board before finding the benefits table. All three matter — read the map through.",
    },
    {
      id: "find-tables", kind: "find", noHint: true,
      targets: ["wp-eg-warehouse-table", "wp-eg-coordinator-table", "wp-eg-benefits-table"],
      itemNames: { "wp-eg-warehouse-table": "the warehouse employer's table", "wp-eg-coordinator-table": "the apprenticeship coordinator's table", "wp-eg-benefits-table": "the benefits and financial coaching table" },
      itemNotes: {
        "wp-eg-warehouse-table": "The warehouse employer's table is where an actual opening gets discussed, not just a programme description.",
        "wp-eg-coordinator-table": "The apprenticeship coordinator's table is where the application you built the resume for actually starts.",
        "wp-eg-benefits-table": "The benefits table answers what health coverage and a retirement plan look like at each employer — worth asking about before an offer, not after.",
      },
      decoyNotes: {
        "wp-eg-raffle-booth": "A raffle for a gift card. Fun, and not why you are here with a limited hour on the floor.",
        "wp-eg-vendor-booth": "A vendor selling branded water bottles. Also not one of the three tables that matters today.",
      },
      title: "Find the three tables that actually matter",
      cue: "Among all the booths on the floor, find the warehouse employer, the apprenticeship coordinator and the benefits table.",
      why: "A fair floor is built to be walked in an hour by someone who does not yet know which tables matter, which is exactly why decoy booths — raffles, branded giveaways — sit right next to the ones that do. Finding the three that actually move your pathway forward is the whole skill of working a floor instead of wandering it.",
    },
    {
      id: "prep-pitch", kind: "sequence",
      targets: ["wp-eg-pitch-name", "wp-eg-pitch-strength", "wp-eg-pitch-ask"],
      itemNames: { "wp-eg-pitch-name": "your name and your track", "wp-eg-pitch-strength": "one real strength", "wp-eg-pitch-ask": "what you are looking for" },
      outOfOrderNote: "Out of order. Name and track first so the person across the table knows who they are talking to, one strength next so it lands while they are still listening, and what you are looking for last, since that is the question the whole thirty seconds is building toward.",
      title: "Rehearse the thirty-second pitch in order",
      cue: "Say it in your head in order: your name and track, one real strength, then what you are looking for.",
      why: "Thirty seconds at a table is not enough time to figure out what to say while you are saying it, and a pitch rehearsed in this order — who you are, one true strength, what you want — is short enough that a busy employer actually hears all of it. Rehearsing it once here is what keeps it from coming out as three unconnected sentences at the table.",
    },
    {
      id: "greet-employer", kind: "select", target: "wp-eg-warehouse-greeting",
      title: "Introduce yourself at the warehouse table",
      cue: "Walk up, offer your hand and give the pitch you just rehearsed.",
      why: "An employer at a fair table has ninety seconds for each of forty people, and the first three of those seconds — a hand offered, a name given clearly — decide whether the rest of your pitch gets their full attention or half of it while they watch the line behind you.",
    },
    {
      id: "volume-gauge", kind: "gauge", target: "wp-eg-volume-dial",
      title: "Find a steady speaking volume in a loud room",
      cue: "The dial runs quiet to loud. Commit it where a hall this noisy actually needs you, not where a quiet room would.",
      gauge: {
        label: "VOLUME", speed: 0.6, green: [0.4, 0.68],
        readout: (t) => (t < 0.4 ? "too quiet to hear" : t > 0.68 ? "shouting over the room" : "clearly heard"),
        missNote: "That volume does not carry over a fair floor this loud, or it carries too far and reads as shouting. Find the level that is clearly heard at the table without turning heads at the next one.",
      },
      why: "A job fair hall is loud enough that a normal speaking voice disappears into it, and an employer who has to lean in and ask you to repeat yourself is an employer who is already thinking about the next table. Projecting enough to be heard clearly, without shouting over the person one table down, is a skill this room specifically demands and a quiet office never does.",
    },
    {
      id: "coordinator-talk", kind: "track", target: "wp-eg-coordinator-track", seconds: 7,
      title: "Hold a real conversation with the coordinator",
      cue: "Hold the engagement track in the band: asking questions and listening, not going silent and not talking over them.",
      track: {
        start: 0.5, green: [0.36, 0.66], rise: 0.5, fall: 0.44, drift: 0.14, label: "ENGAGEMENT",
        readout: (v) => (v < 0.36 ? "gone quiet" : v > 0.66 ? "talking over them" : "real conversation"),
      },
      holdBreakNote: "The conversation slipped — into silence or into talking over the coordinator. Ask a question, then actually listen to the answer.",
      why: "A coordinator remembers the applicant who asked a real question about the apprenticeship far more than the one who stood silently or the one who talked without pausing to hear the answer. This is the conversation that puts a face to the application you submit next week, and holding it as an actual back-and-forth is what makes that face memorable for the right reason.",
    },
    {
      id: "hand-resume", kind: "drag", target: "wp-eg-resume-packet",
      title: "Hand the resume to the coordinator's table",
      cue: "Carry your resume packet to the coordinator's collection bin.",
      why: "A resume handed over in person, after an actual conversation, is read differently than one dropped anonymously into a stack — the coordinator now has a face and a question you asked to attach to the page. It goes into this bin, at this table, once the conversation has actually happened.",
      drag: { to: "wp-eg-resume-bin", radius: 0.45, missNote: "Not in the coordinator's bin. A resume left on the table edge is one that walks away with the next gust of foot traffic." },
    },
    {
      id: "swap-contact", kind: "turn", target: "wp-eg-card-wheel",
      title: "Swap contact information",
      cue: "Turn the card wheel to log the coordinator's card and leave one of your own.",
      turn: { turns: 0.5, axis: "y", label: "CONTACT" },
      why: "A conversation with no contact information exchanged is a conversation neither side can follow up on — the coordinator's card is how you know who to call, and leaving your own is what puts your name back in front of them after the fair, when the memory of one afternoon among forty starts to fade.",
    },
    {
      id: "follow-up-question", kind: "select", target: "wp-eg-followup-question",
      title: "Ask one real follow-up question",
      cue: "Ask the coordinator something specific — the next intake date, not something the flyer already answers.",
      why: "A question that is already answered on the table's own flyer tells the coordinator you did not read it; a specific one — when the next intake actually opens, what the first week looks like — tells them you are already picturing yourself in the programme. It is a small thing that separates one applicant from the next thirty.",
    },
    {
      id: "coach-debrief", kind: "select", target: "wp-eg-coach",
      title: "Debrief with your coach before you leave the floor",
      cue: "Tell the coach which tables you worked, what the coordinator said, and how the room actually felt.",
      why: "The coach can only help you follow up on a conversation they know happened, and a crowded fair floor is exhausting in a way that is worth naming honestly rather than shrugging off on the way to the car. The debrief is where a good lead gets written down before the details blur into the rest of the day.",
    },
    {
      id: "close-log", kind: "select", target: "wp-eg-fair-log",
      title: "Close out the job-fair log",
      cue: "Log which three tables you worked, the coordinator's follow-up date, and what to do next.",
      why: "A fair floor generates leads fast and loses them just as fast once the badge comes off — the log is what turns today's conversations into next week's phone calls instead of a business card lost at the bottom of a bag.",
    },
  ],

  interrupts: [
    {
      id: "wp-eg-power-spark",
      kind: "Sparking power strip behind the table",
      after: "hand-resume", delay: 3, seconds: 12,
      alert: "The power strip feeding the coordinator's table lights and laptop has started sparking behind the tablecloth.",
      cue: "Step back and alert the floor staff — do not touch it yourself.",
      target: "wp-eg-staff-alert",
      why: "A sparking strip under a table skirted in cloth is a fire starting exactly where nobody would see the flame until it is through the fabric, and it is live — pulling at it yourself risks a shock for no gain over stepping back and getting the floor staff, who have a breaker and an extinguisher, to it in seconds.",
      missNote: "You kept standing near the table while it sparked, and in the version where nobody alerted staff, the cloth skirting caught before anyone with an extinguisher even knew there was a problem.",
      wrongNote: "Not the resume bin, and not the strip itself. The staff alert button on the aisle post is what brings someone qualified — press that and step back.",
    },
    {
      id: "wp-eg-line-jumper",
      kind: "Another job seeker cuts into the conversation",
      after: "coordinator-talk", delay: 3, seconds: 10,
      alert: "Someone from the line behind you steps up beside the table and starts talking over you to the coordinator.",
      cue: "Hold your spot calmly — point to the queue sign rather than arguing it out loud.",
      target: "wp-eg-queue-sign",
      why: "Arguing with a line jumper in front of the coordinator you are trying to impress does more damage to your own conversation than losing thirty seconds to it, and the queue sign exists exactly so nobody has to settle it by raising their voice — a calm gesture toward it says more about you than winning the argument would.",
      missNote: "You argued it out loud instead, and in the version where you did, the coordinator's last impression of you was the shouting match, not the conversation you had been having a minute before.",
      wrongNote: "Not the resume bin or the card wheel. The queue sign is what settles it without a scene — point to that.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    const reg2 = (obj, id) => reg(hits, obj, id);
    stationPad(g, 2.6, EMG_ACCENT);

    const floorTex = surfaceTexture((cx, w, h) => pavingFace(cx, w, h, {
      tiles: 8, base: "#6f7278", base2: "#666970", seam: "rgba(0,0,0,0.16)",
    }), { repeat: 6, px: 320 });
    const floor = box(g, 6.4, 0.02, 5.6, 0, 0.01, -0.3, 0xffffff, { rough: 0.92, cast: false });
    floor.material = texturedMat(floorTex, { rough: 0.92, metal: 0.02, color: 0x9298a0 });

    box(g, 6.4, 3.0, 0.12, 0, 1.5, -2.8, 0xd8d2c4, { rough: 0.9 });
    decal(g, 2.4, 0.2, 0, 2.7, -2.73, signFace("PATHWAY EDITION — JOB FAIR", { bg: "#1f2a36", accent: EMG_CSS, scale: 0.42 }), { px: 512 });

    // Registration table at the entrance.
    const reception = group(g, -2.6, 0, 2.0);
    slab(reception, 1.2, 0.05, 0.5, 0, 0.74, 0, 0x6b5a48, { radius: 0.02, rough: 0.6 });
    decal(reception, 0.5, 0.2, 0, 0.77, 0.1, paperFace("REGISTRATION", ["Name · track", "1. ______"], { bg: "#f6f3ea", band: "#7a5030" }), { px: 224 }).rotation.x = -Math.PI / 2;
    holoTag(reception, "sign in here", 0, 0.94, 0.1, { css: EMG_CSS, w: 0.32 });
    reg2(reception, "wp-eg-signin-table");

    // Fair map board.
    const map = holoPanel(g, 1.3, 0.9, -1.9, 1.6, -2.7, (cx, w, h) => {
      cx.fillStyle = "rgba(10,18,28,0.93)"; cx.fillRect(0, 0, w, h);
      cx.fillStyle = EMG_CSS; cx.fillRect(0, 0, w, 5);
      cx.fillStyle = "#fbe9d8"; cx.font = `600 ${Math.round(h * 0.09)}px 'Barlow Condensed', Arial, sans-serif`;
      cx.textAlign = "left"; cx.textBaseline = "middle";
      cx.fillText("FAIR MAP", w * 0.05, h * 0.1);
      cx.font = `${Math.round(h * 0.06)}px Arial, sans-serif`; cx.fillStyle = "#f3e3d0";
      ["Warehouse employer — east row", "Apprenticeship coordinator — centre", "Benefits table — north wall", "Raffle + vendor — do not need today"].forEach((l, i) => cx.fillText(l, w * 0.05, h * (0.28 + i * 0.15)));
    }, { accent: EMG_ACCENT });
    reg2(map, "wp-eg-map-board");

    // Booth tables: warehouse, coordinator, benefits, and two decoys.
    function booth(x, z, label, band, id, ry = 0) {
      const b = group(g, x, 0, z, ry);
      slab(b, 1.1, 0.04, 0.6, 0, 0.72, 0, 0x5a6a78, { radius: 0.02, rough: 0.6 });
      for (const sx of [-1, 1]) box(b, 0.04, 0.7, 0.5, sx * 0.5, 0.36, 0, 0x3a4048, { rough: 0.7 });
      decal(b, 0.9, 0.22, 0, 0.78, 0.15, paperFace(label, [""], { bg: "#f6f3ea", band }), { px: 256 }).rotation.x = -Math.PI / 2;
      const banner = box(b, 1.0, 0.7, 0.02, 0, 1.35, -0.28, EMG_ACCENT, { rough: 0.6 });
      decal(banner, 0.9, 0.5, 0, 0, 0.011, signFace(label, { bg: "#1f2a36", accent: EMG_CSS, scale: 0.3 }), { px: 256 });
      if (id) reg2(b, id);
      return b;
    }
    booth(1.8, -1.6, "WAREHOUSE EMPLOYER", "#59c97b", "wp-eg-warehouse-table");
    booth(0.0, -2.0, "APPRENTICESHIP COORDINATOR", "#5fb8f0", "wp-eg-coordinator-table");
    booth(-1.8, -1.6, "BENEFITS + FINANCIAL COACHING", "#f2c14b", "wp-eg-benefits-table");
    booth(2.6, 0.7, "RAFFLE — WIN A GIFT CARD", "#d98a3a", "wp-eg-raffle-booth", -0.4);
    booth(-2.6, 0.7, "BRANDED WATER BOTTLES", "#8a929a", "wp-eg-vendor-booth", 0.4);

    // Pitch prep stand.
    const pitchStand = group(g, 0.0, 0, 1.5);
    cyl(pitchStand, 0.35, 0.35, 0.03, 0, 0.75, 0, 0x3a4048, { rough: 0.5, seg: 20 });
    const PITCH = [["wp-eg-pitch-name", "1 — name + track", -0.3], ["wp-eg-pitch-strength", "2 — one strength", 0], ["wp-eg-pitch-ask", "3 — what I'm looking for", 0.3]];
    for (const [id, label, x] of PITCH) {
      const bead = box(pitchStand, 0.06, 0.06, 0.06, x, 0.82, 0, EMG_ACCENT, { emissive: EMG_ACCENT, ei: 1.2, rough: 0.4 });
      holoTag(pitchStand, label, x, 0.98, 0, { css: EMG_CSS, w: 0.4 });
      reg2(bead, id);
    }

    // Warehouse greeting marker at that table, and the volume dial nearby.
    const greetSpot = box(g, 0.3, 0.3, 0.3, 1.5, 1.0, -1.3, 0xffffff, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "shake hands + pitch", 1.5, 1.3, -1.3, { css: EMG_CSS, w: 0.34 });
    reg2(greetSpot, "wp-eg-warehouse-greeting");
    const volumeDial = instrument(g, 2.2, 0.9, -1.3, { idle: "VOL", color: EMG_ACCENT, w: 0.2, d: 0.24, ry: -0.4 });
    holoTag(volumeDial, "volume", 0, 0.2, 0, { css: EMG_CSS, w: 0.24 });
    reg2(volumeDial, "wp-eg-volume-dial");

    // Coordinator conversation track, resume bin, card wheel, follow-up card.
    const coordTrack = instrument(g, -0.6, 0.9, -1.6, { idle: "TALK", color: EMG_ACCENT, w: 0.2, d: 0.24, ry: 0.3 });
    holoTag(coordTrack, "engagement", 0, 0.2, 0, { css: EMG_CSS, w: 0.32 });
    reg2(coordTrack, "wp-eg-coordinator-track");
    const resumePacket = group(g, -0.4, 0.75, -1.2, 0.2);
    slab(resumePacket, 0.2, 0.01, 0.26, 0, 0, 0, 0xf6f3ea, { radius: 0.006, rough: 0.6 });
    holoTag(resumePacket, "your resume", 0, 0.1, 0, { css: EMG_CSS, w: 0.28 });
    reg2(resumePacket, "wp-eg-resume-packet");
    const resumeBin = box(g, 0.3, 0.2, 0.22, 0.2, 0.85, -1.85, 0x3a4048, { rough: 0.6 });
    holoTag(g, "coordinator's bin", 0.2, 1.0, -1.85, { css: EMG_CSS, w: 0.3 });
    reg2(box(g, 0.3, 0.2, 0.22, 0.2, 0.85, -1.85, 0xffffff, { opacity: 0.001, transparent: true, cast: false }), "wp-eg-resume-bin");
    const cardWheel = group(g, 0.35, 0.85, -1.85, 0.3);
    cyl(cardWheel, 0.08, 0.08, 0.04, 0, 0, 0, 0xc0c6cc, { rough: 0.3, metal: 0.7, seg: 16 }).rotation.x = Math.PI / 2;
    holoTag(cardWheel, "card wheel", 0, 0.14, 0, { css: EMG_CSS, w: 0.24 });
    reg2(cardWheel, "wp-eg-card-wheel");
    const followUp = decal(g, 0.3, 0.16, -0.1, 0.85, -1.85, paperFace("ASK: NEXT INTAKE DATE?", [""], { bg: "#f6f3ea", band: "#7a5030" }), { px: 192 });
    followUp.rotation.x = -Math.PI / 2;
    holoTag(g, "follow-up question", -0.1, 1.0, -1.85, { css: EMG_CSS, w: 0.36 });
    reg2(followUp, "wp-eg-followup-question");

    // Aisle: trip cords, water table, queue sign, staff alert.
    const cord = cyl(g, 0.015, 0.015, 2.2, 0.0, 0.01, -0.6, 0x1c1f23, { rough: 0.6, seg: 8 });
    cord.rotation.z = Math.PI / 2;
    holoTag(g, "cords across the aisle?", 0.0, 0.15, -0.6, { css: "#f0645b", w: 0.4 });
    reg2(cord, "wp-eg-cord-tangle");
    const waterTable = group(g, 2.8, 0, 1.8);
    box(waterTable, 0.5, 0.75, 0.4, 0, 0.375, 0, 0x5a6a78, { rough: 0.6 });
    cyl(waterTable, 0.12, 0.12, 0.4, 0, 0.95, 0, 0xbfe3f0, { rough: 0.3, opacity: 0.7, transparent: true, seg: 16 });
    holoTag(waterTable, "water — skip it?", 0, 1.2, 0, { css: "#f0645b", w: 0.3 });
    reg2(waterTable, "wp-eg-heat-skip-water");
    const queueSign = group(g, -0.6, 0, -1.3);
    cyl(queueSign, 0.12, 0.14, 0.04, 0, 0.02, 0, 0x2b2f34, { rough: 0.7, seg: 14 });
    cyl(queueSign, 0.025, 0.025, 0.9, 0, 0.47, 0, 0xf2c14b, { rough: 0.5, seg: 10 });
    decal(queueSign, 0.24, 0.16, 0, 0.95, 0, signFace("QUEUE HERE", { bg: "#1f2a36", accent: EMG_CSS, scale: 0.4 }), { px: 160 });
    holoTag(queueSign, "queue sign", 0, 1.1, 0, { css: EMG_CSS, w: 0.26 });
    reg2(queueSign, "wp-eg-queue-sign");
    const staffAlert = box(g, 0.1, 0.14, 0.05, -0.9, 1.1, -1.9, 0xd2312b, { rough: 0.5, emissive: 0xd2312b, ei: 0.3 });
    holoTag(g, "staff alert", -0.9, 1.3, -1.9, { css: "#f0645b", w: 0.24 });
    reg2(staffAlert, "wp-eg-staff-alert");

    // The lit-up power strip that sparks, under the coordinator table.
    const strip = box(g, 0.24, 0.03, 0.06, 0.0, 0.05, -2.05, 0x2b2f34, { rough: 0.5 });
    const sparkLight = box(g, 0.03, 0.03, 0.03, 0.06, 0.06, -2.05, 0xf2c14b, { emissive: 0xf2c14b, ei: 0, rough: 0.4 });

    // Coach debrief table and job-fair log.
    const debrief = group(g, 2.4, 0, 2.0);
    slab(debrief, 0.9, 0.05, 0.5, 0, 0.72, 0, 0x6b5a48, { radius: 0.02, rough: 0.6 });
    const fairLog = decal(debrief, 0.5, 0.24, 0, 0.75, 0.05, paperFace("JOB FAIR LOG", ["Tables: ____", "Follow-up: ____"], { bg: "#f6f3ea", band: "#7a5030" }), { px: 224 });
    fairLog.rotation.x = -Math.PI / 2;
    holoTag(debrief, "job fair log", 0, 0.94, 0.05, { css: EMG_CSS, w: 0.34 });
    reg2(fairLog, "wp-eg-fair-log");
    const coach = seatedFigure(g, 2.7, 0.46, 2.2, { ry: -0.6, cloth: 0x3f6b5a, skin: 0x6b4a33 });
    holoTag(coach.torso, "coach", 0, 1.3, 0.12, { css: EMG_CSS, w: 0.2 });
    reg2(box(g, 0.5, 1.2, 0.5, 2.7, 1.0, 2.2, 0xffffff, { opacity: 0.001, transparent: true, cast: false }), "wp-eg-coach");

    // Crew: employer at their table, coordinator, and the two hazard figures.
    standingFigure(g, 1.8, -1.9, { ry: 0, cloth: 0x2f5f8a, vest: 0xf2c14b, skin: 0x6b4a33, atStation: true });
    standingFigure(g, 0.0, -2.3, { ry: 0, cloth: 0x3f6b7a, skin: 0x8a6a4a, atStation: true });
    const cutter = standingFigure(g, -0.9, -1.15, { ry: 1.6, cloth: 0x7a3a3a, skin: 0x8a5a3a, atStation: true });
    holoTag(cutter, "cutting the line?", 0, 1.9, 0, { css: "#f0645b", w: 0.36 });
    reg2(box(cutter, 0.5, 1.2, 0.5, 0, 1.0, 0, 0xffffff, { opacity: 0.001, transparent: true, cast: false }), "wp-eg-line-cutter");
    const fainting = seatedFigure(g, 1.9, 0.46, 1.7, { ry: 1.0, cloth: 0x5a6a3a });
    holoTag(fainting.torso, "unsteady — heat?", 0, 1.0, 0, { css: "#f0645b", w: 0.3 });
    reg2(box(g, 0.5, 1.1, 0.5, 1.9, 0.9, 1.7, 0xffffff, { opacity: 0.001, transparent: true, cast: false }), "wp-eg-fainting-visitor");

    let sparkOn = false;

    return {
      hits,
      footprint: 2.6,
      spawnLook: new THREE.Vector3(0, 1.3, 1.0),

      onStepComplete(step) {
        if (step.id === "hand-resume") resumePacket.position.set(0.2, 0.9, -1.85);
        if (step.id === "swap-contact") cardWheel.rotation.y += Math.PI;
        if (step.id === "close-log") repaint(fairLog, paperFace("JOB FAIR LOG", ["Tables: 3 worked", "Follow-up: booked"], { bg: "#f6f3ea", band: "#59c97b" }));
      },

      onInterrupt(it) {
        if (it.id === "wp-eg-power-spark") { sparkOn = true; sparkLight.material.emissiveIntensity = 1.2; strip.position.y = 0.08; }
        if (it.id === "wp-eg-line-jumper") { cutter.position.set(-0.3, 0, -1.75); }
      },
      onInterruptEnd(it) {
        if (it.id === "wp-eg-power-spark") { sparkOn = false; sparkLight.material.emissiveIntensity = 0; strip.position.y = 0.05; }
        if (it.id === "wp-eg-line-jumper") { cutter.position.set(-0.9, 0, -1.15); }
      },

      onHazard() {},

      animate(t, dt, session) {
        if (sparkOn) sparkLight.material.emissiveIntensity = 0.6 + Math.sin(t * 14) * 0.5;
        const gg = session?.gauge;
        if (gg && !gg.committed && session.step?.id === "volume-gauge") {
          const ok = gg.t >= 0.4 && gg.t <= 0.68;
          repaint(volumeDial.userData.screen, signFace(ok ? "HEARD" : gg.t < 0.4 ? "TOO QUIET" : "TOO LOUD", { bg: "#0d1c24", accent: ok ? "#59c97b" : "#f0645b", fg: "#cfeaf7", scale: 0.4 }));
        }
        const tr = session?.track;
        if (tr && session.step?.id === "coordinator-talk") {
          const ok = tr.v >= 0.36 && tr.v <= 0.66;
          repaint(coordTrack.userData.screen, signFace(ok ? "TALKING" : tr.v < 0.36 ? "QUIET" : "OVER THEM", { bg: "#0d1c24", accent: ok ? "#59c97b" : "#f0645b", fg: "#cfeaf7", scale: 0.36 }));
        }
        void t; void dt;
      },
    };
  },
};
