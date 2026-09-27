import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, slab, group, decal, repaint, signFace, paperFace, seatedFigure, ownMaterial,
} from "../../../shared/kit.js";
import {
  CITY, stationPad, holoPanel, holoTag, instrument, standingFigure,
  surfaceTexture, texturedMat, pavingFace, reg,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Graduation and Alumni-Mentor Day VR — Pathway Edition,
// wojrc.org. The last walkable station of the edition's own eight-station
// block.
//
// A graduation hall on the day a cohort finishes the pathway they started at
// intake: check-in, the ceremony prep done in order, the coordinator's
// remarks held through, the alumni mentors found on the floor among the
// crowd, a last honest self-check across the whole pathway, composure held
// while a name is about to be called, the certificate received, a real
// conversation held with a mentor, a photo pinned to the alumni wall, a
// mentor check-in booked for the months after, and a mentorship commitment
// signed. Sited generically: no real programme, coordinator or clause number
// the registry is not sure of.

const GAD_ACCENT = 0xf2c14b;
const GAD_CSS = "#f2c14b";

export const SIM_WP_GRADUATION_AND_ALUMNI_MENTORS = {
  id: "wp-graduation-and-alumni-mentors",
  index: "715",
  domain: "Workforce readiness",
  trade: "Pathway Edition — a graduation and alumni-mentor day",
  category: "Community Environmental Justice",
  indoor: "service",
  weather: "clear",
  certification: "Registered apprenticeship standards as a category — the credential this graduation actually marks progress toward; the OSHA Outreach Training Program's OSHA 10 card, named on the certificate table as one of the credentials this cohort is graduating with; Teamsters (IBT) apprenticeship and training programmes, whose local sponsors the alumni-mentor table on the floor; 29 CFR 1910.22 for the walking-working surfaces a crowded hall shares with every other floor; 29 CFR 1910.151 for the first-aid response a warm, packed room can turn into a real need; SAMHSA's guidance on help-seeking, for the coach's own closing check-in",
  name: "Graduation and Alumni-Mentor Day",
  title: simTitle("Graduation and Alumni-Mentor Day"),
  tagline: "Check in, prep for the ceremony in order, hold through the remarks, find the alumni mentors on the floor, hold your composure, receive the certificate, have a real mentor conversation, and book the check-ins that keep the pathway going after today",
  accent: GAD_ACCENT,
  accentCss: GAD_CSS,
  parSeconds: 340,
  footprint: 2.8,
  supportLine: "the programme's own coaching staff, and 988 or SAMHSA's National Helpline (1-800-662-4357, free and confidential) if a day this big brings up more than the room can hold",
  badge: { id: "graduated", name: "Graduated", note: "Checked in, the ceremony prepped in order, the remarks held through, the mentors found, composure held for your name, the certificate received, a real mentor conversation had, and the check-ins booked" },

  game: system({
    name: "Graduation Hall",
    currency: "COHORT",
    ranks: ["Checked In", "Ceremony Ready", "Certificate Earned", "Mentor Matched", "Pathway Certified"],
    badges: [
      { id: "found-the-mentors", name: "Found The Mentors", note: "The ceremony prep held in order and the mentors found clean", test: AWARD.all(AWARD.stepClean("ceremony-prep"), AWARD.stepClean("find-mentors")) },
      { id: "steady-crowd", name: "Steady Crowd", note: "No unsafe action anywhere on the floor", test: AWARD.safe },
      { id: "held-composure", name: "Held Composure", note: "The composure track carried without a break", test: AWARD.unbroken },
    ],
    challenges: [
      { id: "clean-graduation", name: "Clean Graduation", note: "No corrections anywhere", test: AWARD.clean },
      { id: "honest-readiness", name: "Honest Readiness", note: "The readiness gauge committed near the middle of the band", test: AWARD.precise(0.7) },
      { id: "on-schedule-day", name: "On-Schedule Day", note: "Finished inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "wp-gr-av-cable-trip": "You were about to cross the stage's microphone cable where it runs loose across the aisle instead of taped flat. A cable across an aisle this crowded is a trip for someone carrying a cake or walking a grandparent to a seat, not just for you — it gets taped down before doors open, not discovered mid-ceremony.",
    "wp-gr-stuffy-hall": "The hall's air conditioning is struggling to keep up with a room this full, and it has gone warm in the back rows. A hot, crowded hall on a day people are dressed up and standing for photos is exactly where someone quietly overheats — prop a door for a cross breeze and keep water moving through the room rather than waiting for someone to ask.",
    "wp-gr-gatecrasher": "Someone without a ticket is arguing loudly with the check-in table, trying to push past into the seating area. Space and a level tone come first — step back, let the check-in staff and the venue handle it, and do not let the argument spill into the row of families trying to find their seats.",
    "wp-gr-grandparent-faint": "An older family member in the third row has gone pale and unsteady on their feet in the heat. A hot, standing-room ceremony is hard on an older body in a way it is not on a younger one — get them seated, get water and the venue's first-aid contact, and stay with them rather than stepping around them to get back to your own seat.",
  },

  lateNotes: {
    "wp-gr-your-photo": "Not yet. The photo goes on the wall once the certificate is actually in hand — the wall is for graduates, not for the cohort still waiting to walk.",
    "wp-gr-graduation-log": "The log closes out the day last, with the mentor's name and the check-in dates actually booked.",
  },

  steps: [
    {
      id: "check-in", kind: "select", target: "wp-gr-checkin-table",
      title: "Check in at the graduation table",
      cue: "Sign in at the check-in table and collect your seat assignment.",
      why: "A graduation with a full cohort and their families runs on a seating plan the venue built ahead of time, and checking in is what confirms you are seated and accounted for before the ceremony starts — the same habit as every appointment this pathway has run on since the first day at intake.",
    },
    {
      id: "ceremony-prep", kind: "sequence",
      targets: ["wp-gr-prep-folder", "wp-gr-prep-seat", "wp-gr-prep-phone"],
      itemNames: { "wp-gr-prep-folder": "pick up your certificate folder", "wp-gr-prep-seat": "find your assigned seat", "wp-gr-prep-phone": "silence your phone" },
      outOfOrderNote: "Folder first, since it is handed out at the table before the floor fills up; your seat next, while the aisles are still easy to move through; and the phone last, right before the remarks start, so it is not silenced too early and then checked out of habit anyway.",
      title: "Prepare for the ceremony in order",
      cue: "Pick up your certificate folder, find your assigned seat, then silence your phone — in that order.",
      why: "Doing these in this order keeps the floor moving: the folder is collected while the table still has a short line, the seat is found while the aisles are clear, and the phone is silenced last, closest to when the remarks actually start, so the habit holds through the ceremony instead of wearing off in the twenty minutes beforehand.",
    },
    {
      id: "hold-remarks", kind: "hold", target: "wp-gr-podium", seconds: 6,
      title: "Hold through the coordinator's remarks",
      cue: "Hold your attention on the podium through the coordinator's opening remarks.",
      why: "The coordinator's remarks name the specific things this cohort did — which tracks, which milestones, who is walking today — and holding your attention through them, rather than checking out because you already know your own story, is part of what makes the ceremony feel like it belongs to the whole cohort and not just to whoever is speaking.",
      holdBreakNote: "Your attention drifted before the remarks named the cohort's own milestones. Come back to the podium and hear the rest.",
    },
    {
      id: "find-mentors", kind: "find", noHint: true,
      targets: ["wp-gr-mentor-one", "wp-gr-mentor-two", "wp-gr-mentor-three"],
      itemNames: { "wp-gr-mentor-one": "an alumni mentor wearing a ribbon, warehouse track", "wp-gr-mentor-two": "an alumni mentor wearing a ribbon, Class A track", "wp-gr-mentor-three": "an alumni mentor wearing a ribbon, apprenticeship track" },
      itemNotes: {
        "wp-gr-mentor-one": "A ribbon on a jacket marks a graduate who came back specifically to talk to this year's cohort about the warehouse track.",
        "wp-gr-mentor-two": "This mentor's ribbon marks the Class A track — worth finding if that is where you are headed next.",
        "wp-gr-mentor-three": "This mentor's ribbon marks the apprenticeship track, and they are here because somebody found them at their own graduation the same way.",
      },
      decoyNotes: {
        "wp-gr-other-graduate": "Another graduate, in the same robe as everyone else — no ribbon, so not a mentor today.",
        "wp-gr-venue-staff": "Venue staff in a plain uniform. Helpful for directions, not one of the mentor table's alumni.",
      },
      title: "Find the alumni mentors on the floor",
      cue: "Three people in the crowd are wearing alumni-mentor ribbons. Find all three among the graduates and the venue staff.",
      why: "The alumni-mentor table only works if graduates can actually find the mentors in a crowded hall, and the ribbon is the one signal that separates a mentor from another graduate in the same robe or a staff member in uniform. Finding all three is the first step toward the conversation the rest of today's mentoring is built on.",
    },
    {
      id: "readiness-gauge", kind: "gauge", target: "wp-gr-readiness-dial",
      title: "Rate your own readiness for what comes next, honestly",
      cue: "The dial runs one to ten. Commit it where you actually are today, not where graduation day makes you want to say.",
      gauge: {
        label: "READINESS", speed: 0.6, green: [0.4, 0.7],
        readout: (t) => `${Math.round(1 + t * 9)} / 10`,
        missNote: "That number sounds like graduation-day adrenaline talking, not the honest answer. Rate it honestly — the mentor conversation is worth more if it starts from where you actually are.",
      },
      why: "This is the same honest self-check the pathway has asked for since the intake gauge on day one, and it matters just as much here: a mentor can only help with a readiness level you actually name, and an inflated ten on graduation day gets a conversation that skips exactly the support an honest six would have asked for.",
    },
    {
      id: "composure-track", kind: "track", target: "wp-gr-name-card", seconds: 7,
      title: "Hold your composure while your name is about to be called",
      cue: "Hold the composure track in the band: breathing steady, neither frozen nor bouncing off the walls.",
      track: {
        start: 0.5, green: [0.36, 0.66], rise: 0.5, fall: 0.44, drift: 0.14, label: "COMPOSURE",
        readout: (v) => (v < 0.36 ? "frozen" : v > 0.66 ? "overwhelmed" : "steady"),
      },
      holdBreakNote: "Your composure slipped — into freezing up or into being overwhelmed. Breathe and settle back to steady before your name is called.",
      why: "The seconds before your own name is called in a full hall are nerve-wracking in a way nothing else in the pathway quite prepares you for, and holding steady — not frozen, not overwhelmed — is its own small skill, one that walking across a stage in front of people who came to see you is exactly the place to practise it.",
    },
    {
      id: "receive-certificate", kind: "select", target: "wp-gr-stage-certificate",
      title: "Walk across and receive your certificate",
      cue: "Walk to the stage and take your certificate from the coordinator.",
      why: "The certificate in your hand is the actual, physical record of everything the pathway's stations have been building toward since intake — receiving it in front of the cohort and the families who came is the moment the whole programme exists to make happen.",
    },
    {
      id: "mentor-talk", kind: "sequence",
      targets: ["wp-gr-mentor-intro", "wp-gr-mentor-ask", "wp-gr-mentor-contact"],
      itemNames: { "wp-gr-mentor-intro": "introduce yourself", "wp-gr-mentor-ask": "ask about their path", "wp-gr-mentor-contact": "exchange contact information" },
      outOfOrderNote: "Introduce yourself first, ask about their path second so the conversation has something to actually talk about, and exchange contact information last, once there is a real reason for either of you to want to stay in touch.",
      title: "Have a real conversation with a mentor",
      cue: "Introduce yourself, ask about their path since graduation, then exchange contact information — in that order.",
      why: "A mentor relationship that starts with a business card and nothing else rarely goes anywhere; one that starts with an actual question about their path — what the first year on the job was like, what they would do differently — gives both people a reason to follow up. The contact information matters more once there is something worth following up on.",
    },
    {
      id: "pin-photo", kind: "drag", target: "wp-gr-your-photo",
      title: "Pin your photo to the alumni wall",
      cue: "Carry your photo card to the alumni wall and pin it up.",
      why: "The alumni wall is what next year's cohort sees on their own graduation day — every photo on it is proof that somebody who once sat in their seat made it across the stage. Pinning your own up is a small thing that matters more to the next group than it feels like it does to you today.",
      drag: { to: "wp-gr-alumni-wall", radius: 0.45, missNote: "Not on the wall. A photo left in your hand does not do what it is meant to for next year's cohort." },
    },
    {
      id: "book-checkin", kind: "turn", target: "wp-gr-checkin-dial",
      title: "Book your mentor check-ins",
      cue: "Turn the dial to schedule your 30, 60 and 90-day check-ins with your mentor.",
      turn: { turns: 0.6, axis: "y", label: "30 · 60 · 90 DAY CHECK-IN" },
      why: "A mentor relationship started today and left with no next date usually fades within a month, the way most good intentions do once the first hard week on the job arrives. Booking the 30, 60 and 90-day check-ins now, while the mentor is standing right here, is what keeps the relationship alive past the first week it would actually help most.",
    },
    {
      id: "sign-commitment", kind: "select", target: "wp-gr-commitment-card",
      title: "Sign the mentorship commitment",
      cue: "Read the commitment card with your mentor, then both sign it.",
      why: "A signed commitment, however informal, is what turns 'let's stay in touch' into an actual expectation both people can be held to — it is the same principle as every other agreement this pathway has run on, applied to the one relationship meant to outlast the programme itself.",
    },
    {
      id: "coach-final-checkin", kind: "select", target: "wp-gr-coach",
      title: "Have a final check-in with your coach",
      cue: "Tell the coach how the whole pathway actually went, and what you are walking into next.",
      why: "This is the last conversation with the coach who has been in every station since intake, and it is worth having honestly rather than rushing past on the way to the reception — the coach's notes here are what the alumni-mentor programme reads if you ever come back through this same door for help.",
    },
    {
      id: "close-log", kind: "select", target: "wp-gr-graduation-log",
      title: "Close out the graduation log",
      cue: "Log your mentor's name, the check-in dates and what comes next, then sign it.",
      why: "The graduation log is the last entry in the file this pathway has kept since day one, and a mentor's name with real dates attached is what makes the alumni-mentor programme something that actually follows up rather than a ribbon worn for one afternoon.",
    },
  ],

  interrupts: [
    {
      id: "wp-gr-mic-feedback",
      kind: "Microphone feedback squeals through the hall",
      after: "composure-track", delay: 3, seconds: 12,
      alert: "The podium microphone lets out a loud burst of feedback right as the names are about to start being called.",
      cue: "Do not freeze up. Signal the AV tech at the side table.",
      target: "wp-gr-av-tech",
      why: "A startling noise seconds before your own moment is exactly what composure is being practised for, and the fix is not to power through it in silence — the AV tech at the side table can mute and reset the feed in seconds once someone signals them, which is faster than the sound stopping on its own.",
      missNote: "Nobody signalled the booth, and in the version where the feedback kept cutting in and out, it happened again right as your own name was called instead of being fixed beforehand.",
      wrongNote: "Not the name card. The AV tech is who actually fixes the feed — signal them, then settle back into composure.",
    },
    {
      id: "wp-gr-photo-interrupt",
      kind: "A photographer interrupts the mentor conversation",
      after: "mentor-talk", delay: 3, seconds: 10,
      alert: "A photographer taps your shoulder mid-conversation, asking for a solo photo right now, camera already raised.",
      cue: "Ask them to wait — point to the photo queue sign rather than stopping the conversation cold.",
      target: "wp-gr-photo-queue",
      why: "A mentor who gets cut off mid-sentence for a photo reads it as the conversation mattering less than the picture, which is the opposite of what today is actually about — pointing to the queue sign says the photo will happen without making the mentor feel like an interruption in their own conversation.",
      missNote: "You stopped the conversation cold for the photo, and in the version where you did, the mentor's story was left half-told and the contact exchange that was about to happen never quite got back on track.",
      wrongNote: "Not the alumni wall, and not the mentor themselves. The photo queue sign is what tells the photographer to wait — point to that and keep talking.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    const reg2 = (obj, id) => reg(hits, obj, id);
    stationPad(g, 2.8, GAD_ACCENT);

    const floorTex = surfaceTexture((cx, w, h) => pavingFace(cx, w, h, {
      tiles: 8, base: "#6f6a5e", base2: "#665f52", seam: "rgba(0,0,0,0.16)",
    }), { repeat: 6, px: 320 });
    const floor = box(g, 6.8, 0.02, 6.0, 0, 0.01, -0.3, 0xffffff, { rough: 0.92, cast: false });
    floor.material = texturedMat(floorTex, { rough: 0.92, metal: 0.02, color: 0x948d7c });

    box(g, 6.8, 3.1, 0.12, 0, 1.55, -3.0, 0xdcd4c0, { rough: 0.9 });
    decal(g, 2.6, 0.2, 0, 2.9, -2.93, signFace("PATHWAY EDITION — GRADUATION", { bg: "#1f2a36", accent: GAD_CSS, scale: 0.4 }), { px: 512 });

    // Check-in table at the entrance.
    const checkin = group(g, -3.0, 0, 2.2);
    slab(checkin, 1.2, 0.05, 0.5, 0, 0.74, 0, 0x6b5a48, { radius: 0.02, rough: 0.6 });
    decal(checkin, 0.5, 0.2, 0, 0.77, 0.1, paperFace("GRADUATION CHECK-IN", ["Name · seat", "1. ______"], { bg: "#f6f3ea", band: "#8a6a2a" }), { px: 224 }).rotation.x = -Math.PI / 2;
    holoTag(checkin, "check-in", 0, 0.94, 0.1, { css: GAD_CSS, w: 0.3 });
    reg2(checkin, "wp-gr-checkin-table");

    // Ceremony prep table: folder, seat card, phone.
    const prep = group(g, -1.8, 0, 1.6);
    slab(prep, 1.0, 0.05, 0.5, 0, 0.72, 0, 0x6b5a48, { radius: 0.02, rough: 0.6 });
    const folder = box(prep, 0.24, 0.02, 0.32, -0.28, 0.75, 0, 0xf2c14b, { rough: 0.6 });
    reg2(folder, "wp-gr-prep-folder");
    const seatCard = decal(prep, 0.22, 0.14, 0, 0.755, 0.08, paperFace("SEAT 14", [""], { bg: "#f6f3ea", band: "#8a6a2a" }), { px: 128 });
    seatCard.rotation.x = -Math.PI / 2;
    reg2(seatCard, "wp-gr-prep-seat");
    const phone = box(prep, 0.08, 0.015, 0.15, 0.28, 0.755, 0.05, 0x1b1e23, { rough: 0.3 });
    reg2(phone, "wp-gr-prep-phone");

    // The stage, podium, certificate table.
    const stage = group(g, 0, 0.15, -2.2);
    box(stage, 3.4, 0.3, 1.4, 0, 0, 0, 0x8a7862, { rough: 0.7 });
    const podium = group(stage, -0.9, 0.15, 0.2);
    box(podium, 0.5, 0.9, 0.4, 0, 0.6, 0, 0x5a4a3a, { rough: 0.6 });
    holoTag(podium, "podium", 0, 1.1, 0, { css: GAD_CSS, w: 0.24 });
    reg2(podium, "wp-gr-podium");
    const certTable = group(stage, 0.7, 0.15, 0.1);
    box(certTable, 0.8, 0.7, 0.4, 0, 0.35, 0, 0x6b5a48, { rough: 0.6 });
    const certificate = decal(certTable, 0.4, 0.24, 0, 0.72, 0.1, paperFace("CERTIFICATE", ["of Completion"], { bg: "#fbf3d8", band: "#8a6a2a" }), { px: 224 });
    certificate.rotation.x = -Math.PI / 2;
    holoTag(certTable, "certificate", 0, 0.9, 0.1, { css: GAD_CSS, w: 0.3 });
    reg2(certificate, "wp-gr-stage-certificate");

    // AV cable trip and AV tech booth.
    const avCable = cyl(g, 0.015, 0.015, 2.4, -0.9, 0.01, -1.2, 0x1c1f23, { rough: 0.6, seg: 8 });
    avCable.rotation.z = Math.PI / 2;
    holoTag(g, "cable across the aisle?", -0.9, 0.15, -1.2, { css: "#f0645b", w: 0.36 });
    reg2(avCable, "wp-gr-av-cable-trip");
    const avBooth = group(g, 3.0, 0, -1.4);
    box(avBooth, 0.6, 0.9, 0.4, 0, 0.45, 0, 0x3a4048, { rough: 0.6 });
    const avLamp = ownMaterial(box(avBooth, 0.06, 0.06, 0.04, 0.2, 0.75, 0.18, 0xd2312b, { rough: 0.5, emissive: 0xd2312b, ei: 0.2 }));
    holoTag(avBooth, "AV tech", 0, 1.0, 0, { css: GAD_CSS, w: 0.24 });
    reg2(avLamp, "wp-gr-av-tech");

    // Seating rows with mentors and decoys in the crowd.
    function person(x, z, ry, opts, id) {
      const p = standingFigure(g, x, z, { ...opts, atStation: true, ry });
      if (id) reg2(box(p, 0.5, 1.3, 0.5, 0, 0.9, 0, 0xffffff, { opacity: 0.001, transparent: true, cast: false }), id);
      return p;
    }
    const m1 = person(-1.6, -0.6, 1.2, { cloth: 0x59c97b, vest: GAD_ACCENT, skin: 0x6b4a33 }, "wp-gr-mentor-one");
    holoTag(m1, "mentor — warehouse", 0, 1.95, 0, { css: GAD_CSS, w: 0.34 });
    const m2 = person(1.6, -0.4, -1.2, { cloth: 0x5fb8f0, vest: GAD_ACCENT, skin: 0x8a5a3a }, "wp-gr-mentor-two");
    holoTag(m2, "mentor — Class A", 0, 1.95, 0, { css: GAD_CSS, w: 0.32 });
    const m3 = person(0.2, 0.8, 3.0, { cloth: 0x8a6fd8, vest: GAD_ACCENT, skin: 0xc9936a }, "wp-gr-mentor-three");
    holoTag(m3, "mentor — apprenticeship", 0, 1.95, 0, { css: GAD_CSS, w: 0.38 });
    const other1 = person(-0.6, 0.6, 0.6, { cloth: 0x4a4a5a, skin: 0x8a6a4a });
    reg2(box(other1, 0.5, 1.3, 0.5, 0, 0.9, 0, 0xffffff, { opacity: 0.001, transparent: true, cast: false }), "wp-gr-other-graduate");
    const staff1 = person(2.4, 1.4, -2.0, { cloth: 0x3a4048, skin: 0x6b4a33 });
    reg2(box(staff1, 0.5, 1.3, 0.5, 0, 0.9, 0, 0xffffff, { opacity: 0.001, transparent: true, cast: false }), "wp-gr-venue-staff");

    // Readiness dial, composure track (name card), gatecrasher, grandparent.
    const readinessDial = instrument(g, -0.5, 0.9, 1.0, { idle: "-/10", color: GAD_ACCENT, ry: -0.3 });
    holoTag(readinessDial, "readiness", 0, 0.2, 0, { css: GAD_CSS, w: 0.28 });
    reg2(readinessDial, "wp-gr-readiness-dial");
    const nameCard = instrument(g, 0.5, 0.9, -0.7, { idle: "COMPOSURE", color: GAD_ACCENT, w: 0.2, d: 0.24, ry: 0.3 });
    holoTag(nameCard, "your name — next", 0, 0.2, 0, { css: GAD_CSS, w: 0.32 });
    reg2(nameCard, "wp-gr-name-card");
    const gatecrasher = standingFigure(g, -2.6, 1.9, { ry: -1.0, cloth: 0x7a3a3a, skin: 0x8a5a3a, atStation: true });
    holoTag(gatecrasher, "no ticket — pushing past?", 0, 1.9, 0, { css: "#f0645b", w: 0.4 });
    reg2(box(gatecrasher, 0.6, 1.4, 0.6, 0, 1.0, 0, 0xffffff, { opacity: 0.001, transparent: true, cast: false }), "wp-gr-gatecrasher");
    const grandparent = seatedFigure(g, 2.4, 0.46, 1.4, { ry: -0.6, cloth: 0x5a6a3a });
    holoTag(grandparent.torso, "unsteady in the heat?", 0, 1.0, 0.12, { css: "#f0645b", w: 0.36 });
    reg2(box(g, 0.5, 1.1, 0.5, 2.4, 0.9, 1.4, 0xffffff, { opacity: 0.001, transparent: true, cast: false }), "wp-gr-grandparent-faint");
    const vent = box(g, 0.4, 0.25, 0.15, 0, 2.7, -2.9, 0xc9ced2, { rough: 0.6, metal: 0.3 });
    holoTag(g, "hall warm — prop the door?", 0, 2.95, -2.9, { css: "#f0645b", w: 0.4 });
    reg2(vent, "wp-gr-stuffy-hall");

    // Mentor conversation sequence, photo pin, alumni wall, check-in dial, commitment.
    const talkStand = group(g, 1.3, 0, 0.6);
    cyl(talkStand, 0.02, 0.02, 1.2, 0, 0.6, 0, 0x3a4149, { rough: 0.5, metal: 0.5, seg: 10 });
    const TALK = [["wp-gr-mentor-intro", "1 — introduce yourself", 0.4], ["wp-gr-mentor-ask", "2 — ask about their path", 0.68], ["wp-gr-mentor-contact", "3 — exchange contact info", 0.96]];
    for (const [id, label, y] of TALK) {
      const bead = box(talkStand, 0.05, 0.05, 0.05, 0, y, 0, GAD_ACCENT, { emissive: GAD_ACCENT, ei: 1.2, rough: 0.4 });
      holoTag(talkStand, label, 0.22, y, 0, { css: GAD_CSS, w: 0.4 });
      reg2(bead, id);
    }
    const photoQueue = group(g, 1.9, 0, 0.9);
    cyl(photoQueue, 0.1, 0.12, 0.03, 0, 0.015, 0, 0x2b2f34, { rough: 0.7, seg: 12 });
    cyl(photoQueue, 0.02, 0.02, 0.8, 0, 0.42, 0, GAD_ACCENT, { rough: 0.5, seg: 10 });
    decal(photoQueue, 0.2, 0.14, 0, 0.85, 0, signFace("PHOTOS AFTER", { bg: "#1f2a36", accent: GAD_CSS, scale: 0.4 }), { px: 160 });
    holoTag(photoQueue, "photo queue sign", 0, 1.0, 0, { css: GAD_CSS, w: 0.3 });
    reg2(photoQueue, "wp-gr-photo-queue");

    const yourPhoto = group(g, 2.2, 0.8, 2.0, 0.3);
    slab(yourPhoto, 0.16, 0.006, 0.12, 0, 0, 0, 0xf6f4ee, { radius: 0.006, rough: 0.6 });
    decal(yourPhoto, 0.14, 0.1, 0, 0.005, 0, signFace("YOU", { bg: "#f6f4ee", accent: "#2a3036", fg: "#2a3036", scale: 0.5 }), { px: 128 }).rotation.x = -Math.PI / 2;
    reg2(yourPhoto, "wp-gr-your-photo");
    const alumniWall = group(g, 2.9, 1.5, 2.4, -0.6);
    slab(alumniWall, 1.2, 1.0, 0.03, 0, -0.5, 0, 0x2a3036, { radius: 0.02, rough: 0.6 });
    holoTag(alumniWall, "alumni wall", 0, 0.6, 0.02, { css: GAD_CSS, w: 0.28 });
    reg2(box(alumniWall, 1.0, 0.8, 0.1, 0, -0.4, 0.04, 0xffffff, { opacity: 0.001, transparent: true, cast: false }), "wp-gr-alumni-wall");

    const checkinDial = group(g, -2.2, 0.9, -0.4, 0.5);
    cyl(checkinDial, 0.06, 0.06, 0.03, 0, 0, 0, 0xc0c6cc, { rough: 0.3, metal: 0.8, seg: 14 }).rotation.x = Math.PI / 2;
    holoTag(checkinDial, "30 · 60 · 90 dial", 0, 0.14, 0, { css: GAD_CSS, w: 0.32 });
    reg2(checkinDial, "wp-gr-checkin-dial");
    const commitment = decal(g, 0.4, 0.24, -1.4, 0.78, 0.9, paperFace("MENTORSHIP COMMITMENT", [""], { bg: "#f6f3ea", band: "#8a6a2a" }), { px: 224 });
    commitment.rotation.x = -Math.PI / 2;
    holoTag(g, "commitment card", -1.4, 0.92, 0.9, { css: GAD_CSS, w: 0.4 });
    reg2(commitment, "wp-gr-commitment-card");

    const coach = seatedFigure(g, -1.2, 0.46, 0.2, { ry: 0.8, cloth: 0x3f6b7a, skin: 0x6b4a33 });
    holoTag(coach.torso, "coach", 0, 1.3, 0.12, { css: GAD_CSS, w: 0.2 });
    reg2(box(g, 0.5, 1.2, 0.5, -1.2, 1.0, 0.2, 0xffffff, { opacity: 0.001, transparent: true, cast: false }), "wp-gr-coach");
    const logBoard = decal(g, 0.4, 0.2, -1.8, 0.78, 0.5, paperFace("GRADUATION LOG", ["Mentor: ____", "Check-ins: ____"], { bg: "#f6f3ea", band: "#8a6a2a" }), { px: 224 });
    logBoard.rotation.x = -Math.PI / 2;
    holoTag(g, "graduation log", -1.8, 0.92, 0.5, { css: GAD_CSS, w: 0.3 });
    reg2(logBoard, "wp-gr-graduation-log");

    return {
      hits,
      footprint: 2.8,
      spawnLook: new THREE.Vector3(0, 1.3, 0.5),

      onStepComplete(step) {
        if (step.id === "receive-certificate") repaint(certificate, paperFace("CERTIFICATE", ["AWARDED"], { bg: "#fbf3d8", band: "#59c97b" }));
        if (step.id === "pin-photo") yourPhoto.position.set(2.9, 1.1, 2.4);
        if (step.id === "book-checkin") checkinDial.rotation.y += Math.PI;
        if (step.id === "close-log") repaint(logBoard, paperFace("GRADUATION LOG", ["Mentor: matched", "Check-ins: booked"], { bg: "#f6f3ea", band: "#59c97b" }));
      },

      onInterrupt(it) {
        if (it.id === "wp-gr-mic-feedback") avLamp.material.emissiveIntensity = 1.4;
        if (it.id === "wp-gr-photo-interrupt") photoQueue.position.set(1.5, 0, 0.75);
      },
      onInterruptEnd(it) {
        if (it.id === "wp-gr-mic-feedback") avLamp.material.emissiveIntensity = 0.2;
        if (it.id === "wp-gr-photo-interrupt") photoQueue.position.set(1.9, 0, 0.9);
      },

      onHazard() {},

      animate(t, dt, session) {
        const gg = session?.gauge;
        if (gg && !gg.committed && session.step?.id === "readiness-gauge") {
          const ok = gg.t >= 0.4 && gg.t <= 0.7;
          repaint(readinessDial.userData.screen, signFace(`${Math.round(1 + gg.t * 9)}/10`, { bg: "#0d1c24", accent: ok ? "#59c97b" : "#f0645b", fg: "#cfeaf7", scale: 0.55 }));
        }
        const tr = session?.track;
        if (tr && session.step?.id === "composure-track") {
          const ok = tr.v >= 0.36 && tr.v <= 0.66;
          repaint(nameCard.userData.screen, signFace(ok ? "STEADY" : tr.v < 0.36 ? "FROZEN" : "OVERWHELMED", { bg: "#0d1c24", accent: ok ? "#59c97b" : "#f0645b", fg: "#cfeaf7", scale: 0.3 }));
        }
        void t; void dt;
      },
    };
  },
};
