import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, ball, group, decal, repaint, signFace,
} from "../../../shared/kit.js";
import {
  stationPad, holoTag, instrument, standingFigure, reg,
  surfaceTexture, texturedMat, pavingFace,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ K-12 — Digital Citizenship and Online Safety. Upper-primary and lower-secondary life skills in a community college's computer lab: strong passphrases, what not to share, spotting a scam message, checking a claim before sharing it and being kind online, with every message and account in the scene invented for practice.
//
// Every person, place and document in this station is invented. No statistic,
// date, figure or quotation is asserted as fact; any number the learner works
// with is one the scene itself shows. Frameworks are named only as frameworks
// the lesson is aligned to, never as bodies that certify it.

export const SIM_K12_DIGITAL_CITIZENSHIP_AND_ONLINE_SAFETY = {
  id: "k12-digital-citizenship-and-online-safety",
  index: "827",
  domain: "Education",
  trade: "Life-skills class in the community college's computer lab — learner and digital skills tutor",
  category: "Community Environmental Justice",
  weather: "clear",
  certification: "Aligned to UN Sustainable Development Goal 4 (Quality Education) as a framework, to UNESCO education guidance on learning through real contexts, to the INEE Minimum Standards for learning that continues in low-resource and emergency settings, and to the national curriculum framework the school itself follows; AFT and the National Education Association as the teachers' own training bodies. None of these certifies the lesson; the teacher decides what it evidences",
  name: "Digital Citizenship and Online Safety",
  title: simTitle("Digital Citizenship and Online Safety"),
  tagline: "Pause before you click, share or post — and tell a trusted adult when something feels wrong",
  accent: 0x9a6ad0,
  accentCss: "#9a6ad0",
  parSeconds: 330,
  footprint: 2.6,
  badge: {"id":"pause-and-check","name":"Pause and Check","note":"A strong passphrase set, a scam spotted, a claim checked before sharing and a trusted adult told"},

  supportLine: "your teacher, a school counsellor or a trusted adult at home — if anything in this lesson was hard, talk it through afterwards",

  game: system({
    name: "Safety Board",
    currency: "CHECKS",
    ranks: ["Newcomer","Checker","Guardian","Mentor","Digital Citizen"],
    badges: [
      { id: "clean-read", name: "First Look", note: "Everything in the opening scan found first time", test: AWARD.stepClean("find-the-warning-signs-in-a") },
      { id: "no-shortcut", name: "No Shortcuts", note: "No misconception or unsafe shortcut anywhere in the run", test: AWARD.safe },
      { id: "in-the-band", name: "In the Band", note: "Every gauge and meter held inside its band", test: AWARD.precise(0.7) },
    ],
    challenges: [
      { id: "clean-run", name: "Clean Run", note: "No corrections anywhere in the run", test: AWARD.clean },
      { id: "steady-hands", name: "Steady Hands", note: "Every hold and track carried its full count", test: AWARD.unbroken },
      { id: "quick-and-right", name: "Quick and Right", note: "Finished inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "click-the-prize-link": "You clicked the link in a message saying you had won a prize. Messages that rush you with prizes or threats are a common trick to steal accounts; pause, do not click, and show a trusted adult or delete it.",
    "share-your-home-address": "You shared where you live with someone you only know online. Personal details like your address, school or phone number stay private; people online are not always who they say they are, and a trusted adult can help if someone keeps asking.",
    "same-password-everywhere": "You used the same password for every account. If one site leaks it, every account is open; a different strong passphrase for each, kept in a safe place or a password manager a trusted adult helps you set up, keeps one leak from becoming many.",
    "share-before-checking": "You shared a shocking post before checking it. Posts built to shock spread fast whether they are true or not; check who made it and whether trusted sources agree, and if you cannot tell, do not pass it on."
  },

  lateNotes: {
    "kdc-safety-log": "The checklist is written once the checks are done — nothing to record yet.",
    "kdc-checkin": "The check-in comes at the very end of the lesson."
  },

  steps: [
    {
      id: "find-the-warning-signs-in-a",
      kind: "find",
      noHint: true,
      targets: [
        "kdc-rush",
        "kdc-odd-sender",
        "kdc-asks-password"
      ],
      itemNames: {
        "kdc-rush": "a demand to act right now",
        "kdc-odd-sender": "a sender address that does not match",
        "kdc-asks-password": "a request for your password"
      },
      itemNotes: {
        "kdc-rush": "Rushing you is a classic pressure trick.",
        "kdc-odd-sender": "Check who really sent it.",
        "kdc-asks-password": "No real service asks for it by message."
      },
      decoyNotes: {
        "kdc-logo": "Logos are easy to copy, so a logo alone proves nothing either way."
      },
      title: "Find the warning signs in a message",
      cue: "Mark the three warning signs in the practice message on screen.",
      why: "Scam messages often share the same signs: they rush you to act now, they come from an address that does not quite match who they claim to be, and they ask for a password or personal detail. Spotting those three signs lets you stop before you click, which is the single most useful online safety habit."
    },
    {
      id: "know-who-your-trusted-adults-are",
      kind: "select",
      target: "kdc-trusted-card",
      title: "Know who your trusted adults are",
      cue: "Read the card: if something online worries you, tell a trusted adult.",
      why: "Online problems are much easier to sort out with help, and nobody should face them alone. Knowing before anything happens who your trusted adults are, a parent, carer, teacher or tutor, means you know exactly where to go if something feels wrong."
    },
    {
      id: "put-the-pause-and-check-routine",
      kind: "sequence",
      targets: [
        "kdc-ord-pause",
        "kdc-ord-sender",
        "kdc-ord-asks",
        "kdc-ord-decide"
      ],
      itemNames: {
        "kdc-ord-pause": "1 · pause before clicking",
        "kdc-ord-sender": "2 · check who sent it",
        "kdc-ord-asks": "3 · check what it asks for",
        "kdc-ord-decide": "4 · decide, or ask a trusted adult"
      },
      title: "Put the pause-and-check routine in order",
      cue: "Pause, check who sent it, check what it asks, then decide or ask for help.",
      why: "Pausing first stops the rush that scams depend on. Checking the sender and what the message asks for reveals most tricks, and then you can decide calmly, or ask a trusted adult if you are unsure. The same routine works for messages, links and posts.",
      outOfOrderNote: "Out of order. Pause first, before anything else."
    },
    {
      id: "hold-off-clicking-while-you-check",
      kind: "hold",
      target: "kdc-hold-off",
      seconds: 6,
      title: "Hold off clicking while you check",
      cue: "Keep your hand off the link while you check the message.",
      why: "A scam works when you click before thinking. Deliberately holding off while you check the sender and the request gives your judgement time to catch up with the message's pressure, and it costs nothing if the message turns out to be real.",
      holdBreakNote: "Your cursor drifted onto the link. Move it away and keep checking."
    },
    {
      id: "say-how-to-check-a-claim",
      kind: "select",
      target: "kdc-compare-card",
      title: "Say how to check a claim before sharing",
      cue: "Say two ways to check whether a surprising post is true before sharing it.",
      why: "Checking who made a post and whether trusted sources report the same thing catches most false claims. Saying how you would check, not just that you would, is the skill that stops you passing on something untrue to people who trust you."
    },
    {
      id: "spot-the-problems-in-a-practice",
      kind: "find",
      noHint: true,
      targets: [
        "kdc-pf-school",
        "kdc-pf-street",
        "kdc-pf-public"
      ],
      itemNames: {
        "kdc-pf-school": "the school name in the bio",
        "kdc-pf-street": "a street sign in a photo",
        "kdc-pf-public": "the profile set to public"
      },
      itemNotes: {
        "kdc-pf-school": "Keep school and location private.",
        "kdc-pf-street": "Photos can give away where you live.",
        "kdc-pf-public": "Set it to people you know."
      },
      decoyNotes: {
        "kdc-pf-hobby": "Sharing a hobby with friends is fine. Keep it."
      },
      title: "Spot the problems in a practice profile",
      cue: "Look at the invented practice profile and mark each problem.",
      why: "Profiles give away more than people realise: a school name, a home street in a photo, a public setting. Spotting them on a practice profile teaches you to check your own before strangers can."
    },
    {
      id: "turn-the-privacy-setting-to-friends",
      kind: "turn",
      target: "kdc-privacy-dial",
      turn: {
        turns: 0.5,
        axis: "y",
        label: "PRIVACY"
      },
      title: "Turn the privacy setting to friends only",
      cue: "Turn the practice profile's privacy dial from public to friends only.",
      why: "A public profile can be seen by anyone, including strangers. Setting it to people you actually know limits who can see your posts and details, and checking that setting on every new account is a habit worth having for life."
    },
    {
      id: "make-the-passphrase-strong-enough",
      kind: "gauge",
      target: "kdc-strength-meter",
      gauge: {
        label: "STRENGTH",
        speed: 0.6,
        green: [
          0.4,
          0.58
        ],
        missNote: "Not strong enough yet. Add another unrelated word.",
        readout: (v) => (v < 0.4 ? "below the band" : v > 0.58 ? "above the band" : "in the band"),
      },
      title: "Make the passphrase strong enough",
      cue: "Commit when the strength meter shows a strong passphrase.",
      why: "A passphrase made of several unrelated words is long and hard to guess, yet easy for you to remember. Watching the strength meter rise as you add words shows why length matters more than a single odd symbol."
    },
    {
      id: "move-the-scam-message-to-report",
      kind: "drag",
      target: "kdc-scam-token",
      drag: {
        to: "kdc-report-spot",
        radius: 0.45,
        missNote: "Not reported yet. Put it in the report folder, not the reply box."
      },
      title: "Move the scam message to report",
      cue: "Drag the scam message to the report folder instead of replying.",
      why: "Reporting a scam helps the service block it for others, while replying tells the sender your account is active. Moving it to report and then deleting it is the safe way to deal with it, and showing a trusted adult is always fine too."
    },
    {
      id: "keep-a-group-chat-kind",
      kind: "track",
      target: "kdc-track-meter",
      seconds: 8,
      track: {
        start: 0.3,
        green: [
          0.4,
          0.62
        ],
        rise: 0.46,
        fall: 0.38,
        drift: 0.14,
        label: "KINDNESS",
        readout: (v) => (v < 0.4 ? "below the band" : v > 0.62 ? "above the band" : "in the band"),
      },
      title: "Keep a group chat kind",
      cue: "Keep the chat's tone in the kind band as messages come in, stepping in gently when it slips.",
      why: "Group chats can turn unkind quickly, and people often go along with it. Keeping your own messages kind, and gently stepping in or telling an adult when others are unkind, is what being a good digital citizen looks like day to day.",
      holdBreakNote: "The chat turned unkind. Step in gently or tell a trusted adult."
    },
    {
      id: "record-your-safety-checklist",
      kind: "select",
      target: "kdc-safety-log",
      doneLine: "Checklist recorded",
      title: "Record your safety checklist",
      cue: "Write the checks you will use: pause, sender, request, privacy, passphrase.",
      why: "A short personal checklist makes good habits automatic. Writing it in your own words helps you remember it when a real message arrives and you have only a moment to decide."
    },
    {
      id: "share-one-tip-with-a-younger",
      kind: "select",
      target: "kdc-share-board",
      doneLine: "Tip ready to share",
      title: "Share one tip with a younger learner",
      cue: "Pick one tip you would teach a younger learner and practise saying it.",
      why: "Teaching someone else is one of the best ways to remember something yourself. Choosing one clear tip and saying it simply prepares you to help a younger brother, sister or friend stay safe too."
    },
    {
      id: "crew-check-in",
      kind: "select",
      target: "kdc-checkin",
      doneLine: "Checked in",
      title: "Check in at the end of the lesson",
      cue: "Is there anything online that worries you? Who would you tell?",
      why: "The session ends with each learner describing one choice they made online today and what they would do if a message worried them. Saying who they would go to, at school or at home, is the point; the college's IT staff listen for the learners who can name a person and not just a button."
    }
  ],

  interrupts: [
    {
      id: "a-stranger-asks-for-a-photo",
      kind: "Unsafe request",
      after: "hold-off-clicking-while-you-check",
      delay: 3,
      seconds: 12,
      target: "kdc-tell-adult",
      alert: "On the practice chat, a new contact nobody knows asks for a photo and says to keep it secret.",
      cue: "Stop replying and tell the tutor straight away.",
      why: "Anyone who asks you to keep a secret from adults is a warning sign. Stopping and telling a trusted adult at once is always the right move, and you will never be in trouble for asking for help.",
      missNote: "The chat carried on, and the request got more pushy before anyone told an adult.",
      wrongNote: "That keeps the chat going. Stop and tell the tutor. Choose the response that deals with it now."
    },
    {
      id: "the-tutor-asks-about-the-link",
      kind: "Tutor question",
      after: "keep-a-group-chat-kind",
      delay: 3,
      seconds: 12,
      target: "kdc-say-check",
      alert: "The digital skills tutor asks how you would check whether a link in a message is safe.",
      cue: "Say you would pause, check the sender and what it asks, and ask an adult if unsure.",
      why: "The tutor is checking you have a routine, not just a feeling. Naming the steps shows you can deal with a new message you have never seen before.",
      missNote: "You said you would just click and see, and the tutor showed you where that link really went.",
      wrongNote: "That clicks without checking. Choose the response that deals with it now."
    }
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    const ACC = 0x9a6ad0;
    const CSS = "#9a6ad0";
    stationPad(g, 2.7, ACC);

    const stand = (x, z, ry = 0, h = 1.0) => {
      const s = group(g, x, 0, z, ry);
      cyl(s, 0.17, 0.19, 0.03, 0, 0.015, 0, 0x2b2f35, { rough: 0.6, metal: 0.3, seg: 14 });
      cyl(s, 0.024, 0.024, h, 0, h / 2, 0, 0x3a3f46, { rough: 0.5, metal: 0.5, seg: 10 });
      return s;
    };
    const bead = (x, y, z, id, label, o = {}) => {
      const m = group(g, x, 0, z);
      cyl(m, 0.012, 0.012, y - 0.05, 0, (y - 0.05) / 2, 0, 0x3a3f46, { rough: 0.5, metal: 0.5, seg: 6 });
      const b = ball(m, o.r ?? 0.035, 0, y, 0, o.color ?? ACC, { emissive: o.color ?? ACC, ei: 1.4, rough: 0.4, seg: 12 });
      holoTag(m, label, 0, y + 0.13, 0, { css: o.css ?? CSS, w: o.w ?? 0.46 });
      reg(hits, b, id);
      return m;
    };
    const card = (x, y, z, id, label, face, o = {}) => {
      const c = group(g, x, 0, z, o.ry ?? 0);
      cyl(c, 0.014, 0.014, y - 0.1, 0, (y - 0.1) / 2, -0.02, 0x3a3f46, { rough: 0.5, metal: 0.5, seg: 6 });
      const plate = decal(c, o.cw ?? 0.4, o.ch ?? 0.22, 0, y, 0,
        signFace(face, { bg: o.bg ?? "#1c1a24", accent: o.accent ?? CSS, scale: 0.36 }), { px: 192, glow: true, ei: 0.8, transparent: true });
      holoTag(c, label, 0, y + 0.18, 0.002, { css: o.css ?? CSS, w: o.w ?? 0.5 });
      reg(hits, plate, id);
      return plate;
    };
    const hazardCard = (x, y, z, id, label, face, ry = 0) =>
      card(x, y, z, id, label, face, { ry, bg: "#2a1416", accent: "#f0645b", css: "#f0645b", w: 0.52 });
    const text = (cx, w, h, title, rows, accent = CSS) => {
      cx.fillStyle = "rgba(20,18,26,0.94)"; cx.fillRect(0, 0, w, h);
      cx.fillStyle = accent; cx.fillRect(0, 0, w, 5);
      cx.fillStyle = "#fff4e2"; cx.textAlign = "center"; cx.textBaseline = "middle";
      cx.font = `600 ${Math.round(h * 0.13)}px 'Barlow Condensed', Arial, sans-serif`;
      cx.fillText(title, w / 2, h * 0.2);
      cx.font = `${Math.round(h * 0.075)}px Arial, sans-serif`;
      rows.forEach((r, i) => cx.fillText(r, w / 2, h * (0.42 + i * 0.14)));
    };
    const board = (x, z, ry, id, label) => {
      const b = group(g, x, 1.55, z, ry);
      box(b, 0.64, 0.4, 0.02, 0, 0, -0.012, ACC, { rough: 0.5, emissive: ACC, ei: 0.25 });
      cyl(b, 0.02, 0.02, 1.35, 0, -0.85, -0.03, 0x3a3f46, { rough: 0.5, metal: 0.5, seg: 8 });
      b.userData.face = decal(b, 0.6, 0.36, 0, 0, 0, (cx, w, h) => text(cx, w, h, label.toUpperCase(), ["Open"]), { px: 384, glow: true, ei: 0.9 });
      reg(hits, b.userData.face, id);
      return b;
    };
    const meter = (x, z, ry, id, label) => {
      const s = stand(x, z, ry);
      const m = instrument(s, 0, 1.02, 0, { idle: "READY", color: ACC, w: 0.2, d: 0.26 });
      holoTag(s, label, 0, 1.24, 0, { css: CSS, w: 0.46 });
      reg(hits, m, id);
      return m;
    };
    const dial = (x, z, ry, id, label) => {
      const s = stand(x, z, ry, 0.9);
      const dd = cyl(s, 0.09, 0.09, 0.06, 0, 0.95, 0, 0xd8a54a, { rough: 0.5, metal: 0.3, seg: 18 });
      box(s, 0.02, 0.02, 0.1, 0, 0.99, 0.05, 0x1a1a1a, { rough: 0.6 });
      holoTag(s, label, 0, 1.15, 0, { css: CSS, w: 0.42 });
      reg(hits, dd, id);
      return dd;
    };
    const token = (x, z, ry, id, label) => {
      const s = stand(x, z, ry, 0.95);
      const tk = cyl(s, 0.06, 0.06, 0.025, 0, 0.98, 0, 0xd8a54a, { rough: 0.5, seg: 16 });
      holoTag(s, label, 0, 1.16, 0, { css: CSS, w: 0.4 });
      reg(hits, tk, id);
      return tk;
    };
    const spot = (x, z, ry, id, label) => {
      const s = stand(x, z, ry, 0.95);
      const p = box(s, 0.2, 0.012, 0.2, 0, 0.965, 0, ACC, { emissive: ACC, ei: 0.5, rough: 0.6 });
      holoTag(s, label, 0, 1.16, 0, { css: CSS, w: 0.42 });
      reg(hits, p, id);
      return s;
    };

    // ------------------------------------------------------------ the place
    const floorTex = surfaceTexture((cx, w, h) => pavingFace(cx, w, h, { tiles: 5, base: "#6c6e76", base2: "#60626a", seam: "rgba(20,20,20,0.45)" }), { repeat: 3, px: 384 });
    const floor = box(g, 7.4, 0.02, 7.4, 0, 0.004, -0.6, 0x9a7a52, { rough: 0.85, cast: false });
    floor.material = texturedMat(floorTex, { rough: 0.8, metal: 0.02, color: 0xf0e4d0 });
    const wallTex = surfaceTexture((cx, w, h) => pavingFace(cx, w, h, { tiles: 6, base: "#e2e2ec", base2: "#d2d2de", seam: "rgba(40,40,40,0.3)" }), { repeat: 2, px: 256 });
    const wallMat = texturedMat(wallTex, { rough: 0.7, metal: 0.05 });
    // a lab bench behind the station, a fume cabinet, a reagent rack and an eyewash post
    const back = group(g, 0, 0, -4.7);
    box(back, 6.4, 2.6, 0.12, 0, 1.3, 0, 0xe0dccf, { rough: 0.7 }).material = wallMat;
    const bench = group(g, 0, 0, -4.1);
    box(bench, 4.6, 0.9, 0.7, 0, 0.45, 0, 0x2b2f35, { rough: 0.6 });
    box(bench, 4.7, 0.05, 0.75, 0, 0.92, 0, 0x1a2a30, { rough: 0.3 });
    box(bench, 0.5, 0.02, 0.4, -1.4, 0.94, 0, 0x8aa0a8, { rough: 0.3, metal: 0.5 });
    cyl(bench, 0.02, 0.02, 0.3, -1.4, 1.1, -0.15, 0x8aa0a8, { rough: 0.3, metal: 0.7, seg: 8 });
    for (let i = 0; i < 6; i++) cyl(bench, 0.05, 0.05, 0.22 + (i % 3) * 0.06, -0.4 + i * 0.28, 1.06, -0.15, [0x7fc4d8, 0xf2c14b, 0xa0e0a0][i % 3], { rough: 0.2, seg: 10 });
    const hood = group(g, 2.9, 0, -4.2);
    box(hood, 1.2, 0.9, 0.8, 0, 0.45, 0, 0xd8d4cc, { rough: 0.6 });
    box(hood, 1.2, 1.3, 0.8, 0, 1.55, 0, 0xc8d8dc, { rough: 0.2, metal: 0.1 });
    box(hood, 1.1, 0.04, 0.7, 0, 0.92, 0, 0x1a2a30, { rough: 0.3 });
    const rack = group(g, -2.9, 0, -4.3);
    box(rack, 1.0, 1.8, 0.34, 0, 0.9, 0, 0x8a8f96, { rough: 0.5, metal: 0.4 });
    for (let r = 0; r < 3; r++) for (let c = 0; c < 4; c++) cyl(rack, 0.06, 0.06, 0.24, -0.33 + c * 0.22, 0.32 + r * 0.55, 0.06, [0xd86a4a, 0x4a8ad8, 0xd8c04a, 0x5ab87a][(r + c) % 4], { rough: 0.3, seg: 10 });
    const wash = group(g, 3.6, 0, -2.8);
    cyl(wash, 0.03, 0.03, 1.1, 0, 0.55, 0, 0x3a3f46, { rough: 0.5, metal: 0.6, seg: 8 });
    box(wash, 0.3, 0.1, 0.3, 0, 1.12, 0, 0x59c97b, { rough: 0.5 });
    for (const bx of [-0.08, 0.08]) cyl(wash, 0.03, 0.03, 0.08, bx, 1.2, 0, 0x8aa0a8, { rough: 0.3, metal: 0.7, seg: 8 });

    // ------------------------------------------------------------ controls
    const meters = {}, dials = {}, tokens = {}, spots = {}, boards = {};
    bead(-1.22, 0.9, -0.27, "kdc-rush", "a demand to act right now", {});
    bead(-1.42, 1.18, -0.62, "kdc-odd-sender", "a sender address that does not match", {});
    bead(-1.03, 1.46, -0.71, "kdc-asks-password", "a request for your password", {});
    bead(-1.08, 0.9, -1.11, "kdc-logo", "a colourful logo", { color: 0x7fc4d8, css: "#7fc4d8", r: 0.03 });
    bead(-0.68, 1.18, -1.05, "kdc-ord-pause", "1 · pause before clicking", {});
    bead(-0.58, 1.46, -1.44, "kdc-ord-sender", "2 · check who sent it", {});
    bead(-0.24, 0.9, -1.23, "kdc-ord-asks", "3 · check what it asks for", {});
    bead(0, 1.18, -1.55, "kdc-ord-decide", "4 · decide, or ask a trusted adult", {});
    bead(0.24, 1.46, -1.23, "kdc-hold-off", "Hand off the link", {});
    bead(0.58, 0.9, -1.44, "kdc-pf-school", "the school name in the bio", {});
    bead(0.68, 1.18, -1.05, "kdc-pf-street", "a street sign in a photo", {});
    bead(1.08, 1.46, -1.11, "kdc-pf-public", "the profile set to public", {});
    bead(1.03, 0.9, -0.71, "kdc-pf-hobby", "a post about a favourite hobby", { color: 0x7fc4d8, css: "#7fc4d8", r: 0.03 });
    bead(1.42, 1.18, -0.62, "kdc-tell-adult", "Stop replying and tell the tutor", { color: 0x59c97b, css: "#59c97b", r: 0.03 });
    bead(1.22, 1.46, -0.27, "kdc-say-check", "Say how you would check the link", { color: 0x59c97b, css: "#59c97b", r: 0.03 });
    card(-2.19, 1.35, -0.85, "kdc-trusted-card", "Tell a trusted adult", "TELL AN\nADULT", { ry: 1.2 });
    dials["kdc-privacy-dial"] = dial(-1.89, -1.4, 0.93, "kdc-privacy-dial", "Profile privacy");
    meters["kdc-strength-meter"] = meter(-1.45, -1.85, 0.67, "kdc-strength-meter", "Passphrase strength");
    tokens["kdc-scam-token"] = token(-0.92, -2.16, 0.4, "kdc-scam-token", "Scam message");
    spots["kdc-report-spot"] = spot(-0.31, -2.33, 0.13, "kdc-report-spot", "Report folder");
    card(0.31, 1.35, -2.33, "kdc-compare-card", "Check before sharing", "TRUE? HOW\nDO YOU KNOW?", { ry: -0.13 });
    meters["kdc-track-meter"] = meter(0.92, -2.16, -0.4, "kdc-track-meter", "Chat kept kind");
    boards["kdc-safety-log"] = board(1.45, -1.85, -0.67, "kdc-safety-log", "Safety checklist");
    boards["kdc-share-board"] = board(1.89, -1.4, -0.93, "kdc-share-board", "One tip to share");
    boards["kdc-checkin"] = board(2.19, -0.85, -1.2, "kdc-checkin", "End-of-lesson check-in");
    hazardCard(-1.53, 0.72, -1.21, "click-the-prize-link", "Click the link in the prize message?", "YOU\nWON!", 0.9);
    hazardCard(-0.58, 0.72, -1.86, "share-your-home-address", "Post where you live to a new online friend?", "HOME\nADDRESS", 0.3);
    hazardCard(0.58, 0.72, -1.86, "same-password-everywhere", "Use one password for every account?", "ONE FOR\nALL", -0.3);
    hazardCard(1.53, 0.72, -1.21, "share-before-checking", "Share a shocking post before checking it?", "SHARE\nNOW", -0.9);

    // ------------------------------------------------------------ the guide
    const guide = group(g, 0, 2.15, -3.2);
    box(guide, 0.94, 0.44, 0.02, 0, 0, -0.012, 0x7fc4d8, { rough: 0.5, emissive: 0x7fc4d8, ei: 0.25 });
    const guideFace = decal(guide, 0.9, 0.4, 0, 0, 0, (cx, w, h) => text(cx, w, h, "THE GUIDE", ["Pause, check, then decide."], "#7fc4d8"), { px: 512, glow: true, ei: 0.9 });
    const paintGuide = (msg) => repaint(guideFace, (cx, w, h) => {
      cx.fillStyle = "rgba(10,20,28,0.94)"; cx.fillRect(0, 0, w, h);
      cx.fillStyle = "#7fc4d8"; cx.fillRect(0, 0, w, 5);
      cx.fillStyle = "#eaf6fb"; cx.font = `${Math.round(h * 0.1)}px Arial, sans-serif`;
      cx.textAlign = "left"; cx.textBaseline = "top";
      let line = "", yy = h * 0.1; const x0 = w * 0.05, maxW = w * 0.9, lh = h * 0.13;
      for (const word of String(msg).split(" ")) {
        const tt = line ? `${line} ${word}` : word;
        if ((cx.measureText?.(tt)?.width ?? tt.length * lh * 0.45) > maxW && line) { cx.fillText(line, x0, yy); line = word; yy += lh; }
        else line = tt;
      }
      if (line) cx.fillText(line, x0, yy);
    });

    // ------------------------------------------------------------ the people (clear of every control)
    const crew = {};
    crew["a"] = standingFigure(g, 3, 0.7, { ry: -1.9, cloth: 0x3a6a4a, trousers: 0x2b2f35 });
    holoTag(g, "Class teacher", 3, 2.1, 0.7, { css: "#7fc4d8", w: 0.34 });
    crew["b"] = standingFigure(g, -3, 0.7, { ry: 1.9, cloth: 0x2a5a8a, trousers: 0x2b2f35 });
    holoTag(g, "Classmate", -3, 2.1, 0.7, { css: "#7fc4d8", w: 0.34 });
    crew["c"] = standingFigure(g, -3, 1.8, { ry: 2.2, cloth: 0x6a8a4a, trousers: 0x2b2f35 });
    holoTag(g, "Digital skills tutor", -3, 2.1, 1.8, { css: "#7fc4d8", w: 0.34 });
    crew["d"] = standingFigure(g, 3, 1.8, { ry: -2.2, cloth: 0x6a7a4a, trousers: 0x2b2f35 });
    holoTag(g, "Lab assistant", 3, 2.1, 1.8, { css: "#7fc4d8", w: 0.34 });
    // the person each interruption brings into the scene, hidden until it fires
    const arrivals = {};
    arrivals["a-stranger-asks-for-a-photo"] = standingFigure(g, 1.5, -3, { ry: 3, cloth: 0x5a7a3a, atStation: true });
    arrivals["a-stranger-asks-for-a-photo"].visible = false;
    arrivals["the-tutor-asks-about-the-link"] = standingFigure(g, -1.5, -3, { ry: 0.3, cloth: 0x2a5a8a, atStation: true });
    arrivals["the-tutor-asks-about-the-link"].visible = false;
    const alarmLamp = ball(g, 0.08, 0, 2.55, -3.2, 0x3a3f46, { rough: 0.4, seg: 12 });
    const lampOn = alarmLamp.material, lampLit = alarmLamp.material.clone();
    lampLit.color = new THREE.Color(0xf0a040); lampLit.emissive = new THREE.Color(0xf0a040); lampLit.emissiveIntensity = 1.6;

    return {
      hits,
      footprint: 2.6,
      spawnLook: new THREE.Vector3(0, 1.2, -1.4),

      onStepComplete(step) {
        if (step.id === "move-the-scam-message-to-report") { const s = spots["kdc-report-spot"]; tokens["kdc-scam-token"].parent.position.set(s.position.x, 0, s.position.z); }
        if (step.id === "record-your-safety-checklist") repaint(boards["kdc-safety-log"].userData.face, (cx, w, h) => text(cx, w, h, "DONE", ["Checklist recorded"], "#59c97b"));
        if (step.id === "share-one-tip-with-a-younger") repaint(boards["kdc-share-board"].userData.face, (cx, w, h) => text(cx, w, h, "DONE", ["Tip ready to share"], "#59c97b"));
        if (step.id === "crew-check-in") repaint(boards["kdc-checkin"].userData.face, (cx, w, h) => text(cx, w, h, "DONE", ["Checked in"], "#59c97b"));
        if (step.id === "say-how-to-check-a-claim") paintGuide("Check who made it before you share.");
      },

      onHazard() {
        paintGuide("Stop. Is it rushing you? Would you tell a trusted adult?");
      },

      onInterrupt(it) {
        const who = arrivals[it.id];
        if (who) { who.visible = true; who.position.z += 0.4; }
        alarmLamp.material = lampLit;
      },
      onInterruptEnd(it) {
        alarmLamp.material = lampOn;
        const who = arrivals[it.id];
        if (it.resolved !== "answered") { if (who) who.rotation.y += 0.6; paintGuide("That one went unanswered. Next time, stop and deal with it first."); return; }
        if (it.id === "a-stranger-asks-for-a-photo") { crew["c"].position.set(-2.2, 0, -2.7); if (who) who.position.set(2.4, 0, -3.8); paintGuide("Tutor told, contact blocked and reported. The lesson carries on."); }
        if (it.id === "the-tutor-asks-about-the-link") { crew["d"].position.set(2.2, 0, -2.7); if (who) who.position.set(-1.2, 0, -3.6); paintGuide("Routine named. The tutor agrees."); }
      },

      animate(tm, dt, session) {
        void tm; void dt;
        const gg = session?.gauge;
        if (gg && !gg.committed && meters[session.step?.target]) {
          const [lo, hi] = session.step.gauge.green;
          const ok = gg.t >= lo && gg.t <= hi;
          repaint(meters[session.step.target].userData.screen, signFace(ok ? "IN BAND" : gg.t < lo ? "LOW" : "HIGH", { bg: "#1c1a24", accent: ok ? "#59c97b" : "#f0645b", fg: "#fff4e2", scale: 0.46 }));
        }
        const tr = session?.track;
        if (tr && meters[session.step?.target]) {
          const [lo, hi] = session.step.track.green;
          const ok = tr.v >= lo && tr.v <= hi;
          repaint(meters[session.step.target].userData.screen, signFace(ok ? "STEADY" : tr.v < lo ? "LOW" : "HIGH", { bg: "#1c1a24", accent: ok ? "#59c97b" : "#f0645b", fg: "#fff4e2", scale: 0.46 }));
        }
      },
    };
  },
};
