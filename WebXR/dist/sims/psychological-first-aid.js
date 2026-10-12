import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, ball, torus, group, decal, repaint, signFace, paperFace,
  seatedFigure, standingPerson, mat, counter, cabinet,
} from "../../../shared/kit.js";
import {
  CITY, stationPad, holoPanel, holoTag, instrument, standingFigure,
  surfaceTexture, texturedMat, pavingFace, reg,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Psychological First Aid VR — Emergency Services, disaster
// relief. A family assistance centre set up after a regional disaster, run
// the way WHO and the National Child Traumatic Stress Network publish
// Psychological First Aid: approach and introduce yourself before anything
// else, look, listen and link rather than diagnose, meet practical needs —
// water, a phone, a chair — before anything emotional, reflect a person's
// own words back to them instead of anyone else's script, give only the
// information that is actually confirmed, keep a child with their parent,
// refer to mental-health services when the signs actually call for it, hold
// the line between support and therapy, and let the worker who just did all
// of this check in and rotate off rather than run the next family on empty.
// Sited generically at a family assistance centre after a regional disaster;
// no real incident, family or reporter is named.

const PFA_ACCENT = 0x9fb8d8;
const PFA_ALERT = 0xf0645b;

export const SIM_PSYCHOLOGICAL_FIRST_AID = {
  id: "psychological-first-aid",
  index: "211",
  domain: "Emergency Services",
  trade: "Disaster relief worker — AFSCME / LIUNA with the Red Cross volunteer workforce",
  category: "Emergency Services",
  indoor: "service",
  weather: "overcast",
  certification: "Psychological First Aid as WHO and the National Child Traumatic Stress Network (NCTSN) publish it — look, listen, link — run here at a family assistance centre inside a NIMS/ICS structure (FEMA IS-100/IS-700); the NASW Code of Ethics and SAMHSA's trauma-informed care principles for the boundary between peer support and therapy; Title II of the ADA for the centre's own accessibility; the HIPAA baseline for any health information shared at the desk; the American Red Cross's Disaster Mental Health program and the AFSCME, LIUNA and SEIU-represented crews who staff a centre like this alongside it",
  name: "Psychological First Aid",
  title: simTitle("Psychological First Aid"),
  tagline: "A family assistance centre run on look, listen, link: practical needs met first, a person's own words reflected, honest information, a child kept with their parent, a real referral, and the worker's own check-in after",
  accent: PFA_ACCENT,
  accentCss: "#9fb8d8",
  parSeconds: 300,
  footprint: 2.2,
  badge: { id: "held-with-care", name: "Held With Care", note: "Look, listen and link run clean, practical needs met first, and the boundary between support and therapy never crossed" },

  game: system({
    name: "Family Assistance",
    currency: "SUPPORT",
    ranks: ["Centre Volunteer", "PFA Trained", "Family Support Lead", "Centre Coordinator", "Psychological First Aid Certified"],
    badges: [
      { id: "needs-first", name: "Needs First", note: "Water, phone and a chair offered before anything emotional was asked", test: AWARD.stepClean("practical-needs") },
      { id: "no-diagnosis", name: "No Diagnosis", note: "No unsafe or out-of-scope action anywhere in the run", test: AWARD.safe },
      { id: "read-it-right", name: "Read It Right", note: "Assessed the signs correctly on the first sweep of the dial", test: AWARD.precise(0.7) },
    ],
    challenges: [
      { id: "clean-session", name: "Clean Session", note: "No corrections anywhere in the run", test: AWARD.clean },
      { id: "steady-presence", name: "Steady Presence", note: "Held both timed moments the full duration", test: AWARD.unbroken },
      { id: "six-straight", name: "Six Straight", note: "Six correct actions in a row", test: AWARD.streak(6) },
    ],
  }),

  hazards: {
    "speculate-outcome": "You told her the missing relative is probably fine. Psychological First Aid is built on giving only what is actually confirmed — a hopeful guess said out loud becomes a fact in a person's memory of the worst day of their life, and if it turns out to be wrong, the person who said it is the one who lied to them, not the one who was trying to comfort them.",
    "separate-child-decoy": "You walked the child off to 'keep them busy' while the parent talks. A frightened child's sense of safety comes from staying near a trusted adult, not from being managed out of the room — separating them because the conversation is easier without a child underfoot serves the conversation, not the child.",
    "diagnose-attempt": "You told him he has PTSD. Naming a clinical diagnosis is not what Psychological First Aid is for and it is not what this role is licensed to do — it can also be flatly wrong this early, and a label handed out by someone who is not his clinician can follow him into every conversation he has about this day from now on.",
    "rush-away-mid-conversation": "You stood up and moved toward the next family while she was still mid-sentence. A worker's job here is not to process the line faster — leaving a person while they are still talking teaches them, in the moment they are most vulnerable, that finishing their sentence was not actually worth anyone's time.",
  },

  lateNotes: {
    "reflect-card": "There is nothing to reflect yet — listen first, or there are no words of theirs left to reflect back.",
    "referral-packet": "Hold off on the referral — the severity has to actually be assessed first, or there is nothing to base the referral on.",
  },

  steps: [
    {
      id: "approach-introduce", kind: "sequence",
      targets: ["approach-calm", "introduce-role"],
      itemNames: { "approach-calm": "approach calmly, from an angle they can see", "introduce-role": "introduce yourself and your role" },
      title: "Approach calmly and introduce yourself",
      cue: "Approach from where she can see you coming, then introduce yourself and say what you're here to do.",
      why: "Coming into someone's field of view slowly, rather than appearing suddenly at their side, is the first thing Psychological First Aid asks for because a person who has just lived through a disaster is primed to read anything sudden as another threat. The introduction that follows — your name, your role, that you are here to help — is what turns 'a stranger is near me' into 'someone has actually arrived to help.'",
      outOfOrderNote: "Approach first, so she can see you coming, then introduce yourself — announcing your role before she has even registered someone is there undoes the calm the approach was supposed to establish.",
    },
    {
      id: "look-signs", kind: "find", noHint: true,
      targets: ["sign-shaking", "sign-avoiding-eyes", "sign-clutching-phone"],
      itemNames: { "sign-shaking": "visible shaking", "sign-avoiding-eyes": "avoiding eye contact", "sign-clutching-phone": "clutching a phone with no signal" },
      itemNotes: {
        "sign-shaking": "Hands and shoulders both — an autonomic response to acute stress, not something she is doing on purpose.",
        "sign-avoiding-eyes": "Looking at the floor rather than at anyone approaching — a common, protective response, not rudeness.",
        "sign-clutching-phone": "Holding a phone that has not had a signal in an hour, still checking it every few seconds for a call that has not come.",
      },
      title: "Look, before you say anything else",
      cue: "Take a moment to actually see the person in front of you before you start talking.",
      why: "The first third of look-listen-link is exactly what it says — reading the visible signs of distress and immediate safety before a single question gets asked, because the shape of what somebody needs in the next sixty seconds is written on them before they say a word of it out loud.",
    },
    {
      id: "listen", kind: "hold", target: "family-adult", seconds: 6,
      title: "Listen without filling the silence",
      cue: "Hold your attention on her and let her talk without interrupting or rushing to fix anything.",
      why: "The second third of look-listen-link is listening in a way that does not steer — no interrupting to reassure, no jumping ahead to solutions, just enough presence that she can say what she needs to say once, in her own order. Held for the length of what she needs to say, not cut short the moment there is a pause to fill.",
      holdBreakNote: "You spoke before she had actually finished. A silence that gets filled the instant it appears teaches a person to stop talking before they have said the thing that mattered.",
    },
    {
      id: "practical-needs", kind: "sequence", anyOrder: true,
      targets: ["offer-water", "offer-phone", "offer-chair"],
      itemNames: { "offer-water": "offer water", "offer-phone": "offer the charging phone", "offer-chair": "offer a chair" },
      title: "Meet practical needs before anything emotional",
      cue: "Water, a working phone, and somewhere to sit — offered before any harder conversation continues.",
      why: "Psychological First Aid puts practical needs ahead of emotional processing on purpose: a person who is thirsty, cannot charge the one phone that might ring with news, and has been standing for an hour cannot actually take in anything said to them until those three things are handled. Meeting them first is not a delay before the real support starts — it is the real support, in its most concrete form.",
    },
    {
      id: "reflect-words", kind: "select", target: "reflect-card",
      title: "Reflect her own words back to her",
      cue: "Repeat back what she actually said, in her own words, before offering anything of your own.",
      why: "Reflecting a person's own phrase back to them — not a script, not a professional's paraphrase, their actual words — is what tells them they were heard exactly, rather than sorted into a category a form was already going to ask about anyway.",
    },
    {
      id: "honest-information", kind: "select", target: "info-board",
      title: "Give only the information that is actually confirmed",
      cue: "Tell her what the centre actually knows right now — no more, no less.",
      why: "The honest answer, including 'we don't know yet,' respects a person more than a comforting guess does, and it is the only answer that will still be true the next time she asks somebody else the same question. Psychological First Aid treats honesty as part of the care, not a separate obligation that sits next to it.",
    },
    {
      id: "assess-severity", kind: "gauge", target: "assessment-dial",
      title: "Assess whether the signs call for a referral",
      cue: "Sweep the dial through her presenting signs and commit once it reads where she actually is.",
      why: "Not everyone at this centre needs a referral to mental-health services, and treating every visitor as a clinical case would overload the referral pathway for the people who genuinely need it right now — reading the actual signs, not a blanket assumption either way, is what keeps the referral meaningful when it is made.",
      gauge: { label: "SIGNS", speed: 0.6, green: [0.58, 0.8], readout: (t) => (t < 0.3 ? "coping" : t < 0.58 ? "distressed" : t < 0.8 ? "refer" : "urgent"), missNote: "That reading does not match what she is actually presenting. Sweep the dial again and commit only once it reads where she really is." },
    },
    {
      id: "child-with-parent", kind: "select", target: "child-figure",
      title: "Keep the child with the parent",
      cue: "Bring the child back beside the parent rather than managing them separately.",
      why: "A child's own sense that the day is survivable comes largely from staying near a parent who is still present and still in charge, even a parent who is visibly struggling — Psychological First Aid keeps them together for that reason, and works around the child being in the room rather than working around the child's absence.",
    },
    {
      id: "link-referral", kind: "drag", target: "referral-packet",
      title: "Link her to mental-health services",
      cue: "Carry the referral packet across the room and hand it to the centre's mental-health counsellor.",
      why: "A referral spoken about but never actually walked across the room and handed to a real person is a referral that depends entirely on a stranger following up on her own, on the worst week of her life — physically making the link, counsellor to visitor, is what turns 'you should talk to someone' into an appointment that actually exists.",
      drag: { to: "mh-counselor-desk", radius: 0.5, missNote: "Not at the counsellor's desk. A referral packet that never reaches the person who can act on it is not a link yet." },
    },
    {
      id: "boundary-explain", kind: "select", target: "boundary-card",
      title: "Explain the line between this and therapy",
      cue: "Tell her plainly what this conversation is, and that ongoing care is the counsellor's job, not yours.",
      why: "Being clear about the boundary protects her as much as it protects the volunteer role itself — she should not walk away from this conversation believing it was therapy, and should walk away knowing exactly where the actual ongoing care is available if she wants it.",
    },
    {
      id: "self-regulate", kind: "track", target: "self-check-dial", seconds: 7,
      title: "Stay regulated while you support her",
      cue: "Keep your own composure in the steady band while the conversation continues around you.",
      why: "A worker who has quietly gone past their own limit stops actually being present for the person in front of them, however calm they still sound — checking your own state while the conversation is still running, not only afterward, is what keeps you able to give the rest of this conversation the same care as the first minute of it.",
      track: { start: 0.5, green: [0.3, 0.7], rise: 0.42, fall: 0.4, drift: 0.13, label: "SELF CHECK", readout: (v) => (v > 0.7 ? "past your limit" : v < 0.3 ? "checked out" : "steady") },
      holdBreakNote: "Your own state drifted out of the steady band while the conversation kept going. Supporting someone else does not work from a state you are not actually managing yourself.",
    },
    {
      id: "worker-log", kind: "select", target: "session-log",
      title: "Log the session's real outcome",
      cue: "Record what was offered, what was referred, and what is still open in the session log.",
      why: "The next volunteer to see this family, or the counsellor she was just linked to, was not in this conversation — the log is the only way they inherit an accurate account instead of asking her to explain her worst day over again to a second stranger.",
    },
    {
      id: "crew-checkin", kind: "select", target: "crew-checkin-board",
      title: "Check in and rotate off before the next family",
      cue: "Tell your own team lead how that conversation actually was, and rotate off before taking the next one.",
      why: "A volunteer who runs family after family without checking in is carrying every one of those conversations forward into the next one, and the Red Cross's own Disaster Mental Health program builds rotation and peer check-ins in for exactly that reason — the AFSCME, LIUNA and SEIU peer-support lines are posted here for the same crews who staff this centre, not as an afterthought to it.",
    },
  ],

  interrupts: [
    {
      id: "bad-news-call",
      kind: "Phone call with bad news, mid-conversation",
      after: "listen", delay: 3, seconds: 13,
      alert: "Her phone rings mid-sentence — you can see from her face that whatever she is being told is bad.",
      cue: "Stay with her. Do not step away to give her privacy she has not asked for.",
      target: "stay-present",
      why: "Stepping back to be polite in the exact moment someone receives terrible news reads to them as abandonment, not courtesy — Psychological First Aid calls for staying physically present, saying nothing that fills the silence, and letting her decide whether she wants space, rather than deciding it for her by leaving.",
      missNote: "You stepped away while she was still absorbing the call. Whatever she just heard, she absorbed it without anyone there — 'giving her space' and 'leaving her alone with bad news' looked identical from where she was sitting.",
      wrongNote: "That does not answer this. Stay present with her through the call — she did not ask to be left alone with it.",
    },
    {
      id: "reporter-approaches",
      kind: "Reporter approaches the family",
      after: "self-regulate", delay: 3, seconds: 12,
      alert: "A reporter has walked up to the family with a phone held out, asking for a comment on the record.",
      cue: "Redirect the reporter to the public information officer — do not let this family be interviewed here.",
      target: "pio-redirect",
      why: "A family in the middle of receiving Psychological First Aid is not in a position to consent to being quoted, and the centre's own public information officer, not a volunteer and not the family itself, is who fields press questions — redirecting immediately protects the family's privacy and keeps the centre's actual information consistent with whatever the PIO has been authorized to say.",
      missNote: "The reporter stayed at the family's side with a phone still recording. A grieving family answering a reporter's question in the middle of a support conversation is exactly the moment the public information officer exists to intercept.",
      wrongNote: "That does not redirect the reporter. Point them to the public information officer — this family does not answer press questions here.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root, 0, 0, -1.9);
    stationPad(g, 2.2, PFA_ACCENT);

    // -------------------------------------------------------------- shell
    const floor = box(g, 5.6, 0.08, 4.8, 0, 0.04, -0.2, 0xffffff, { rough: 0.7 });
    floor.material = texturedMat(
      surfaceTexture((cx, w, h) => pavingFace(cx, w, h, { tiles: 6, base: "#c7ced3", base2: "#bac2c8", seam: "rgba(0,0,0,0.16)" }), { repeat: 4, px: 512 }),
      { rough: 0.6, metal: 0.03, color: 0xdfe4e8 },
    );
    box(g, 5.6, 2.9, 0.14, 0, 1.55, -2.2, 0xd7dbd8, { rough: 0.85 });
    box(g, 5.6, 0.16, 0.32, 0, 3.0, -2.2, 0xbdc2bf, { rough: 0.75 });

    // A single low room divider behind the nook, softening it away from the
    // main reception area without blocking the learner's sightline into it.
    const dividerA = box(g, 0.05, 1.1, 1.2, -1.3, 0.55, 0.5, 0x8a99a8, { rough: 0.6, opacity: 0.85, transparent: true });
    void dividerA;

    // -------------------------------------------------------------- private nook
    box(g, 0.34, 0.03, 0.34, -0.35, 0.42, 0.4, 0x5c6672, { rough: 0.6 });
    box(g, 0.34, 0.4, 0.03, -0.35, 0.62, 0.24, 0x5c6672, { rough: 0.6 });
    const familyAdult = seatedFigure(g, -0.35, 0.4, 0.4, { cloth: 0x6b5a6b, ry: 2.6, skin: 0xc99878 });
    holoTag(familyAdult.torso, "Resident", 0, 0.7, 0, { css: "#9fb8d8", w: 0.28 });
    reg(hits, familyAdult.torso, "family-adult");

    const shakeTag = group(familyAdult.torso, 0.2, 1.1, 0.05);
    const shakeBall = ball(shakeTag, 0.014, 0, 0, 0, PFA_ALERT, { emissive: PFA_ALERT, ei: 1.2, rough: 0.5 });
    holoTag(shakeTag, "Visible shaking", 0, 0.12, 0, { css: "#9fb8d8", w: 0.4 });
    reg(hits, shakeTag, "sign-shaking");
    const eyesTag = holoTag(familyAdult.head, "Avoiding eye contact", 0, 0.2, 0.06, { css: "#9fb8d8", w: 0.46 });
    reg(hits, eyesTag, "sign-avoiding-eyes");
    const phoneClutch = group(familyAdult.torso, -0.18, 0.95, 0.1);
    box(phoneClutch, 0.05, 0.09, 0.01, 0, 0, 0, 0x22262b, { rough: 0.4 });
    holoTag(phoneClutch, "Clutching phone, no signal", 0, 0.12, 0, { css: "#9fb8d8", w: 0.5 });
    reg(hits, phoneClutch, "sign-clutching-phone");

    const approachSpot = group(g, 0.6, 0, 1.1);
    ball(approachSpot, 0.018, 0, 0.3, 0, PFA_ACCENT, { emissive: PFA_ACCENT, ei: 1.1, rough: 0.5 });
    holoTag(approachSpot, "Approach from here", 0, 0.44, 0, { css: "#9fb8d8", w: 0.4 });
    reg(hits, approachSpot, "approach-calm");
    const introduceCard = group(g, 0.35, 0, 0.85);
    ball(introduceCard, 0.015, 0, 1.15, 0, PFA_ACCENT, { emissive: PFA_ACCENT, ei: 1.1, rough: 0.5 });
    holoTag(introduceCard, "Introduce yourself", 0, 1.28, 0, { css: "#9fb8d8", w: 0.38 });
    reg(hits, introduceCard, "introduce-role");

    // Practical needs table beside the nook.
    const needsTable = counter(g, 0.7, 0.4, -0.7, 0.9, 0xdfe4e8, { ry: 0.3 });
    const waterCups = group(needsTable, -0.2, 0.4, 0);
    cyl(waterCups, 0.03, 0.025, 0.08, 0, 0, 0, 0xbfe0ea, { rough: 0.3, transparent: true, opacity: 0.7, seg: 12 });
    holoTag(waterCups, "Water", 0, 0.1, 0, { css: "#9fb8d8", w: 0.26 });
    reg(hits, waterCups, "offer-water");
    const chargingPhone = group(needsTable, 0, 0.4, 0);
    box(chargingPhone, 0.05, 0.09, 0.01, 0, 0, 0, 0x22262b, { rough: 0.4 });
    holoTag(chargingPhone, "Charging phone", 0, 0.11, 0, { css: "#9fb8d8", w: 0.32 });
    reg(hits, chargingPhone, "offer-phone");
    const spareChair = group(g, 0.3, 0, 0.15);
    box(spareChair, 0.34, 0.03, 0.34, 0, 0.42, 0, 0x5c6672, { rough: 0.6 });
    box(spareChair, 0.34, 0.4, 0.03, 0, 0.62, -0.16, 0x5c6672, { rough: 0.6 });
    holoTag(spareChair, "Offer a chair", 0, 0.7, -0.16, { css: "#9fb8d8", w: 0.34 });
    reg(hits, spareChair, "offer-chair");

    // Reflection card, information board, boundary card.
    const reflectCard = decal(g, 0.24, 0.14, -0.55, 0.6, 0.65, signFace("REFLECT", { bg: "#101820", accent: "#9fb8d8", scale: 0.44 }), { px: 128 });
    reg(hits, reflectCard, "reflect-card");
    const infoBoard = holoPanel(g, 0.56, 0.4, -2.0, 1.55, -1.3, (cx, w, h) => {
      cx.fillStyle = "rgba(10,16,22,0.9)"; cx.fillRect(0, 0, w, h);
      cx.fillStyle = "#9fb8d8"; cx.fillRect(0, 0, w, 5);
      cx.fillStyle = "#e3ecf7";
      cx.font = `600 ${Math.round(h * 0.12)}px 'Barlow Condensed', Arial, sans-serif`;
      cx.textAlign = "left"; cx.textBaseline = "middle";
      cx.fillText("CONFIRMED INFORMATION", w * 0.06, h * 0.16);
      cx.font = `${Math.round(h * 0.08)}px Arial, sans-serif`; cx.fillStyle = "#c3d3e8";
      ["Search status: ongoing", "Next briefing: posted at the desk", "No confirmed casualty list yet"].forEach((line, i) => cx.fillText(line, w * 0.06, h * (0.4 + i * 0.15)));
    }, { ry: 0.5, accent: PFA_ACCENT });
    reg(hits, infoBoard, "info-board");
    const speculateSign = decal(g, 0.22, 0.13, -1.55, 1.15, -0.95, signFace("SHE'S PROBABLY FINE", { bg: "#2a1416", accent: "#f0645b", scale: 0.32 }), { px: 160 });
    reg(hits, speculateSign, "speculate-outcome");

    const assessDial = instrument(g, -1.6, 1.05, 0.9, { idle: "READ SIGNS", color: PFA_ACCENT, w: 0.2, d: 0.22, ry: -0.3 });
    reg(hits, assessDial, "assessment-dial");

    // Boundary card and diagnosis-shortcut decoy.
    const boundaryCard = decal(g, 0.24, 0.14, -0.9, 1.0, 1.2, signFace("MY ROLE, NOT THERAPY", { bg: "#101820", accent: "#9fb8d8", scale: 0.3 }), { px: 160 });
    reg(hits, boundaryCard, "boundary-card");
    const diagnoseChip = group(g, -0.55, 0, 1.05);
    ball(diagnoseChip, 0.02, 0, 1.1, 0, PFA_ALERT, { emissive: PFA_ALERT, ei: 1.1, rough: 0.5 });
    holoTag(diagnoseChip, "Name a diagnosis?", 0, 1.24, 0, { css: "#f0645b", w: 0.4 });
    reg(hits, diagnoseChip, "diagnose-attempt");
    const rushSpot = group(g, 1.6, 0, 0.2);
    ball(rushSpot, 0.02, 0, 0.2, 0, PFA_ALERT, { emissive: PFA_ALERT, ei: 1.0, rough: 0.5 });
    holoTag(rushSpot, "Move to the next family?", 0, 0.34, 0, { css: "#f0645b", w: 0.5 });
    reg(hits, rushSpot, "rush-away-mid-conversation");
    const stayPresentChip = group(g, 0.05, 0, 0.55);
    ball(stayPresentChip, 0.018, 0, 1.15, 0, PFA_ACCENT, { emissive: PFA_ACCENT, ei: 1.2, rough: 0.5 });
    holoTag(stayPresentChip, "Stay with her", 0, 1.3, 0, { css: "#9fb8d8", w: 0.32 });
    reg(hits, stayPresentChip, "stay-present");

    // -------------------------------------------------------------- child
    const child = seatedFigure(g, 1.2, 0.42, 1.2, { cloth: 0x6b8f6a, skin: 0xd9a985, ry: -0.4 });
    child.torso.scale.set(0.72, 0.72, 0.72);
    holoTag(child.torso, "Child, apart from parent", 0, 0.7, 0, { css: "#9fb8d8", w: 0.5 });
    reg(hits, child.torso, "child-figure");
    const separateChildDecoy = group(g, 1.9, 0, 1.6);
    ball(separateChildDecoy, 0.018, 0, 0.3, 0, PFA_ALERT, { emissive: PFA_ALERT, ei: 1.0, rough: 0.5 });
    holoTag(separateChildDecoy, "Keep the child busy over here?", 0, 0.44, 0, { css: "#f0645b", w: 0.6 });
    reg(hits, separateChildDecoy, "separate-child-decoy");

    // -------------------------------------------------------------- counsellor + referral
    const counselorDesk = counter(g, 0.9, 0.5, 2.2, -1.6, 0xdfe4e8, { ry: -0.3 });
    const counselor = standingFigure(g, 2.4, -2.1, { ry: 1.2, cloth: 0x3c5a66, vest: PFA_ACCENT, atStation: true });
    holoTag(counselor, "Mental-health counsellor", 0, 1.9, 0, { css: "#9fb8d8", w: 0.5 });
    reg(hits, counselor, "mh-counselor-desk");
    const referralPacket = group(g, -0.3, 0, 0.6);
    box(referralPacket, 0.1, 0.02, 0.14, 0, 0.75, 0, 0xece3d0, { rough: 0.7 });
    decal(referralPacket, 0.09, 0.13, 0, 0.761, 0, signFace("REFERRAL", { bg: "#101820", accent: "#9fb8d8", scale: 0.4 }), { px: 128 }).rotation.x = -Math.PI / 2;
    holoTag(referralPacket, "Referral packet", 0, 0.85, 0, { css: "#9fb8d8", w: 0.36 });
    reg(hits, referralPacket, "referral-packet");

    // -------------------------------------------------------------- self-check, log, crew
    const selfCheck = instrument(g, 1.6, 1.1, -1.4, { idle: "CHECK IN", color: PFA_ACCENT, w: 0.2, d: 0.24, ry: 0.4 });
    reg(hits, selfCheck, "self-check-dial");

    const sessionLog = holoPanel(g, 0.5, 0.36, -2.4, 1.5, -0.3, (cx, w, h) => {
      cx.fillStyle = "rgba(10,16,22,0.9)"; cx.fillRect(0, 0, w, h);
      cx.fillStyle = "#9fb8d8"; cx.fillRect(0, 0, w, 5);
      cx.fillStyle = "#e3ecf7";
      cx.font = `600 ${Math.round(h * 0.14)}px 'Barlow Condensed', Arial, sans-serif`;
      cx.textAlign = "center"; cx.textBaseline = "middle";
      cx.fillText("SESSION LOG", w / 2, h * 0.34);
      cx.font = `${Math.round(h * 0.09)}px Arial, sans-serif`; cx.fillStyle = "#c3d3e8";
      cx.fillText("Offered · referred · still open", w / 2, h * 0.64);
    }, { ry: 0.6, accent: PFA_ACCENT });
    reg(hits, sessionLog, "session-log");

    const crewBoard = holoPanel(g, 0.5, 0.36, -2.4, 1.5, 1.5, (cx, w, h) => {
      cx.fillStyle = "rgba(10,16,22,0.9)"; cx.fillRect(0, 0, w, h);
      cx.fillStyle = "#7fd1c9"; cx.fillRect(0, 0, w, 5);
      cx.fillStyle = "#e3f7ee";
      cx.font = `600 ${Math.round(h * 0.13)}px 'Barlow Condensed', Arial, sans-serif`;
      cx.textAlign = "center"; cx.textBaseline = "middle";
      cx.fillText("CREW CHECK-IN", w / 2, h * 0.32);
      cx.font = `${Math.round(h * 0.08)}px Arial, sans-serif`; cx.fillStyle = "#bfe8d6";
      cx.fillText("Red Cross Disaster Mental Health line", w / 2, h * 0.6);
      cx.fillText("AFSCME / LIUNA / SEIU peer support posted", w / 2, h * 0.78);
    }, { ry: 0.7, accent: 0x7fd1c9 });
    reg(hits, crewBoard, "crew-checkin-board");

    // -------------------------------------------------------------- reporter + PIO
    const reporter = standingPerson(g, 2.6, 1.9, { ry: -2.0, cloth: 0x3a3a3a, hiVis: false, skin: 0xc99878 });
    reporter.root.visible = false;
    const pioDesk = decal(g, 0.3, 0.18, -2.0, 1.7, -1.9, signFace("PUBLIC INFORMATION OFFICER", { bg: "#101820", accent: "#9fb8d8", scale: 0.3 }), { px: 200 });
    reg(hits, pioDesk, "pio-redirect");

    // Ambient dressing.
    standingFigure(g, -2.4, 2.1, { ry: -0.6, cloth: 0x37505f, vest: PFA_ACCENT });
    cabinet(g, 0.7, 0.9, 0.3, 2.4, 0.45, -2.0, 0x2f2a24, { doorColor: 0x241f1a });

    let phoneRinging = false;

    return {
      hits,
      footprint: 2.2,
      spawnLook: new THREE.Vector3(-0.1, 1.2, 0.2),

      onStepComplete(step) {
        if (step.id === "reflect-words") { repaint(reflectCard, signFace("HEARD", { bg: "#101820", accent: "#59c97b", scale: 0.5 })); }
        if (step.id === "honest-information") {
          repaint(infoBoard.userData.face, (cx, w, h) => {
            cx.fillStyle = "rgba(10,16,22,0.9)"; cx.fillRect(0, 0, w, h); cx.fillStyle = "#59c97b"; cx.fillRect(0, 0, w, 5);
            cx.fillStyle = "#eafcf1"; cx.font = `600 ${Math.round(h * 0.14)}px 'Barlow Condensed', Arial, sans-serif`;
            cx.textAlign = "center"; cx.textBaseline = "middle";
            cx.fillText("TOLD HONESTLY", w / 2, h * 0.5);
          });
        }
        if (step.id === "child-with-parent") { child.torso.position.set(-0.25, 0.42, 0.35); }
        if (step.id === "link-referral") { referralPacket.visible = false; }
        if (step.id === "worker-log") {
          repaint(sessionLog.userData.face, (cx, w, h) => {
            cx.fillStyle = "rgba(10,16,22,0.9)"; cx.fillRect(0, 0, w, h); cx.fillStyle = "#59c97b"; cx.fillRect(0, 0, w, 5);
            cx.fillStyle = "#eafcf1"; cx.font = `600 ${Math.round(h * 0.14)}px 'Barlow Condensed', Arial, sans-serif`;
            cx.textAlign = "center"; cx.textBaseline = "middle";
            cx.fillText("LOGGED", w / 2, h * 0.5);
          });
        }
      },

      onInterrupt(it) {
        if (it.id === "bad-news-call") { phoneRinging = true; phoneClutch.material = mat(0xf0645b, { emissive: 0xf0645b, ei: 1.6, rough: 0.4 }); }
        if (it.id === "reporter-approaches") { reporter.root.visible = true; }
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "bad-news-call") { phoneRinging = false; phoneClutch.material = mat(0x22262b, { rough: 0.4 }); }
        if (it.id === "reporter-approaches") { reporter.root.visible = false; }
      },

      onHazard() {},

      animate(t, dt, session) {
        void dt;
        if (phoneRinging) shakeBall.material.emissiveIntensity = 1.0 + Math.sin(t * 8) * 0.8;
        const gg = session?.gauge;
        if (gg && !gg.committed && session.step?.id === "assess-severity") {
          const label = gg.t < 0.3 ? "COPING" : gg.t < 0.58 ? "DISTRESSED" : gg.t < 0.8 ? "REFER" : "URGENT";
          repaint(assessDial.userData.screen, signFace(label, { bg: "#0d1c24", accent: gg.t >= 0.58 && gg.t <= 0.8 ? "#59c97b" : "#f2c14b", fg: "#bfeaf7", scale: 0.45 }));
        }
        const tr = session?.track;
        if (tr && session.step?.id === "self-regulate") {
          repaint(selfCheck.userData.screen, signFace(tr.v > 0.7 ? "PAST LIMIT" : tr.v < 0.3 ? "CHECKED OUT" : "STEADY", { bg: "#0d1c24", accent: tr.v >= 0.3 && tr.v <= 0.7 ? "#59c97b" : "#f0645b", fg: "#bfeaf7", scale: 0.42 }));
        }
      },
    };
  },
};
