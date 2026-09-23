import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, ball, torus, group, decal, repaint, signFace,
  seatedFigure, mat, counter, cabinet,
} from "../../../shared/kit.js";
import {
  CITY, stationPad, holoPanel, holoTag, instrument, standingFigure,
  surfaceTexture, texturedMat, pavingFace, reg,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Shelter Intake Operations VR — Emergency Services, disaster
// relief. Opening an emergency shelter in a school gym the way the American
// Red Cross's own shelter operations standard and a NIMS/ICS structure both
// expect: check in with the incident commander before anything else, a
// registration desk that actually protects a resident's privacy, the intake
// questions asked once and gently rather than repeated for anyone's
// convenience, medical and access needs flagged straight to the health
// station instead of sitting in a file, cots set at the spacing the standard
// calls for, a family kept together instead of split by whichever line moved
// faster, a pet area so nobody has to choose between shelter and their
// animal, a quiet room, an information board residents can actually read,
// and a shift handover that hands the next crew a real count rather than a
// guess. Sited generically at a school gym pressed into service for a
// regional disaster; no real shelter, address or event is named.

const SIO_ACCENT = 0x5ec9a0;
const SIO_ALERT = 0xf0645b;

export const SIM_SHELTER_INTAKE_OPERATIONS = {
  id: "shelter-intake-operations",
  index: "209",
  domain: "Emergency Services",
  trade: "Disaster relief worker — AFSCME / LIUNA with the Red Cross volunteer workforce",
  category: "Emergency Services",
  indoor: "service",
  weather: "overcast",
  certification: "NIMS/ICS through FEMA IS-100 and IS-700, worked here as the shelter's own check-in structure; the American Red Cross's shelter operations standards for registration, cot spacing and pet co-location; Title II of the ADA for the access and functional needs of residents with disabilities; OSHA 29 CFR 1910.1030 bloodborne pathogens for any first aid contact at intake; the AFSCME and LIUNA safety language covering the disaster-relief crews who staff these shelters alongside Red Cross volunteers",
  name: "Shelter Intake Operations",
  title: simTitle("Shelter Intake Operations"),
  tagline: "Opening a school-gym shelter: ICS check-in, private registration, intake asked once and gently, needs flagged to health, cots at spacing, family kept together, a pet area and a quiet room, and a real handover",
  accent: SIO_ACCENT,
  accentCss: "#5ec9a0",
  parSeconds: 320,
  footprint: 2.4,
  badge: { id: "shelter-open", name: "Shelter Open", note: "Every resident registered with dignity, every need flagged, the floor run clean, and a real count handed to the next shift" },

  game: system({
    name: "Shelter Ops",
    currency: "REGISTER",
    ranks: ["Shelter Volunteer", "Registration Trained", "Floor Lead", "Shelter Manager", "Shelter Ops Certified"],
    badges: [
      { id: "asked-once", name: "Asked Once", note: "Every intake question asked once, in order, never repeated", test: AWARD.stepClean("intake-questions") },
      { id: "nobody-exposed", name: "Nobody Exposed", note: "No unsafe or undignified action anywhere in the run", test: AWARD.safe },
      { id: "spacing-held", name: "Spacing Held", note: "Cot spacing set inside the standard's band on the first try", test: AWARD.precise(0.7) },
    ],
    challenges: [
      { id: "clean-open", name: "Clean Open", note: "No corrections anywhere in the run", test: AWARD.clean },
      { id: "steady-floor", name: "Steady Floor", note: "Held the floor watch without losing the count", test: AWARD.unbroken },
      { id: "seven-straight", name: "Seven Straight", note: "Seven correct actions in a row", test: AWARD.streak(7) },
    ],
  }),

  hazards: {
    "improvised-registration": "You started registering a resident at the folding table by the door instead of behind the privacy screen. Everything a resident says at intake — who they lost, what they need, where they are sleeping tonight — is said out loud in a gym that will hold hundreds of strangers by tonight, and the screen is the only thing standing between that conversation and everyone in line behind it.",
    "reask-trauma-question": "You asked the household question a second time 'just to make sure.' The whole reason intake asks each question once, gently, is that a resident who just evacuated a disaster is being asked to say hard things one time — asking again because a form looked incomplete tells them their story did not land the first time, and the answer will not come easier the second time either.",
    "overpack-cots": "You shoved this row a foot tighter to fit one more cot in. The spacing a shelter standard sets is not about comfort — it is an aisle wide enough to walk between cots without stepping over someone, and a row squeezed to make room for one more person is a row that makes it harder to reach every person already in it.",
    "pet-loose-in-sleeping-row": "That leash is tied to a cot in the general sleeping area, not in the pet area. A pet loose or tethered among strangers' cots is a bite risk, an allergy risk and a tripping hazard for residents walking the row in the dark — the pet area exists so nobody in that decision is put at risk by it.",
  },

  lateNotes: {
    "needs-flag": "There is no need to flag yet — the intake questions have to be asked first, or there is nothing for the health station to act on.",
    "family-cot-a": "Hold off — the family has to actually be found and counted together before any cot gets marked as theirs.",
  },

  steps: [
    {
      id: "ics-checkin", kind: "select", target: "ics-checkin-board",
      title: "Check in with the incident commander",
      cue: "Sign into the shelter's own ICS organization chart before touching anything else.",
      why: "A shelter this size runs inside a NIMS/ICS structure the moment it opens — a registration desk, a health station and a floor crew that do not know who is actually in command of the building are five separate operations sharing one gym by accident. Checking in first is what puts you on the org chart the incident commander is already running the rest of the shelter from.",
    },
    {
      id: "privacy-screen", kind: "turn", target: "privacy-screen-crank",
      title: "Unfold the registration privacy screen",
      cue: "Turn the crank until the folding screen stands fully open around the registration desk.",
      why: "A resident who has just lost a home is going to say so at this desk, in a gym that will be full of strangers by nightfall. The screen is the only physical thing in the room that makes that conversation private rather than overheard by whoever is next in line — it goes up before the first resident does, not after somebody notices.",
      turn: { turns: 0.75, axis: "y", label: "PRIVACY SCREEN" },
    },
    {
      id: "intake-questions", kind: "sequence",
      targets: ["ask-name", "ask-household", "ask-needs"],
      itemNames: { "ask-name": "ask their name", "ask-household": "ask who is with them", "ask-needs": "ask about medical and access needs" },
      title: "Ask the intake questions once, gently, in order",
      cue: "Name first, then who they are sheltering with, then medical and access needs — asked once each.",
      why: "Starting with a name builds the smallest possible rapport before anything harder is asked; who they are sheltering with comes next because it decides whether cots get assigned as a group; medical and access needs come last because a resident who has just answered two easier questions is in a steadier place to answer the hardest one. Asked in that order, once each, intake reads as care rather than an interrogation.",
      outOfOrderNote: "Name, then household, then medical and access needs — leading with the hardest question before any rapport is built is what turns intake into an interrogation instead of a welcome.",
    },
    {
      id: "flag-needs", kind: "drag", target: "needs-flag",
      title: "Flag medical and access needs to the health station",
      cue: "Carry the resident's needs flag across the floor and drop it in the health station's own inbox.",
      why: "A need written on an intake form and left in a binder at the registration desk is a need the health station will not learn about until someone happens to ask again. Physically carrying the flag to their inbox is what turns 'we asked' into 'they know' — the two are not the same thing, and only one of them helps the resident tonight.",
      drag: { to: "health-station-inbox", radius: 0.5, missNote: "Not in the health station's inbox. A flag left anywhere else is a need the health station still does not know about." },
    },
    {
      id: "cot-spacing", kind: "gauge", target: "spacing-wand",
      title: "Set the cot rows to the standard's spacing",
      cue: "Sweep the spacing wand across the row and commit once it reads inside the shelter standard's band.",
      why: "The Red Cross's own shelter standard sets a minimum distance between cots for a reason that has nothing to do with comfort: a real aisle wide enough to walk, kneel and pull a cot clear without touching a stranger's bedding to do it. A row eyeballed tighter to fit more people in is a row that looks fine until someone actually needs to move through it in the dark.",
      gauge: { label: "COT GAP", speed: 0.65, green: [0.42, 0.62], readout: (t) => `${(t * 8).toFixed(1)} ft`, missNote: "Outside the standard's band. Sweep the wand again and commit only once the row's gap reads inside it." },
    },
    {
      id: "family-locate", kind: "find", noHint: true,
      targets: ["family-parent", "family-child-a", "family-child-b"],
      itemNames: { "family-parent": "the parent", "family-child-a": "the older child", "family-child-b": "the younger child" },
      itemNotes: {
        "family-parent": "Standing near the registration line, watching for both kids at once.",
        "family-child-a": "Sitting on a duffel bag a few feet from the parent, tracked but not yet counted with them.",
        "family-child-b": "Holding onto the parent's sleeve, easy to count twice or not at all if the family is not found as a unit.",
      },
      title: "Find every member of this family before assigning cots",
      cue: "Locate the parent and both children — a family gets counted and housed as a unit, not one at a time.",
      why: "Registration lines rarely move a family through together — a parent signs in while a child is still finding a bathroom, and if cots get assigned to whoever is standing at the desk at that moment, a family that arrived together spends its first night in a shelter split across the floor. Finding all three before assigning anything is what keeps that from happening by accident.",
    },
    {
      id: "family-cots", kind: "sequence", anyOrder: true,
      targets: ["family-cot-a", "family-cot-b", "family-cot-c"],
      itemNames: { "family-cot-a": "parent's cot", "family-cot-b": "older child's cot", "family-cot-c": "younger child's cot" },
      title: "Assign the family three adjoining cots",
      cue: "Mark the three cots next to each other as this family's — any order.",
      why: "Three cots anywhere in the gym technically houses three people; three adjoining cots is what actually keeps this family together through the night, close enough that a child waking up scared can see a parent without getting up and walking a strange room full of strangers to find them.",
    },
    {
      id: "confirm-headcount", kind: "hold", target: "command-radio", seconds: 5,
      title: "Confirm the running count with the command post",
      cue: "Hold the radio until the command post reads your count back correctly.",
      why: "The incident commander is building a shelter-wide picture out of every desk's count, and a number given once and never confirmed is a number that might have been misheard, mistyped or already out of date by the time it is used to order more cots or more meals. Holding until it is read back is what turns your count into a number the command post can actually act on.",
      holdBreakNote: "You let go before the count was read back. An unconfirmed number is not part of the shelter-wide picture yet — hold the radio until the command post repeats it correctly.",
    },
    {
      id: "pet-area", kind: "select", target: "pet-checkin",
      title: "Check the resident's pet into the pet area",
      cue: "Walk the pet to its own crate in the pet area and check it in on the log.",
      why: "A resident who cannot bring a pet into a shelter is a resident who may choose to stay in an unsafe home instead — the Red Cross's own standard sets up a co-located pet area precisely so that choice never has to be made. Checking the pet in on its own log, in its own space, is what keeps that promise real rather than theoretical.",
    },
    {
      id: "quiet-room", kind: "select", target: "quiet-room-sign",
      title: "Post and open the quiet room",
      cue: "Confirm the curtained room off the gym floor is open and marked as the quiet room.",
      why: "A shelter floor with hundreds of cots is loud, lit and constant, and some residents — an overwhelmed child, someone in genuine crisis, a person who is neurodivergent and cannot regulate in that much stimulation — need somewhere that is none of those things for ten minutes. A quiet room that exists but is not posted is a room nobody in a strange gym knows to ask for.",
    },
    {
      id: "monitor-floor", kind: "track", target: "capacity-board", seconds: 7,
      title: "Watch the shelter floor against its rated capacity",
      cue: "Hold attention on the capacity board and keep the count inside the gym's safe occupancy band.",
      why: "A shelter's rated capacity is a real number set by the building's exits and floor area, not a soft target — a gym that is quietly let run over it is a life-safety problem the moment anything else goes wrong in the building. Watching the board through the intake rush, not just checking it once, is what catches the count before it climbs past that line rather than after.",
      track: { start: 0.4, green: [0.3, 0.7], rise: 0.45, fall: 0.4, drift: 0.13, label: "FLOOR COUNT", readout: (v) => (v > 0.7 ? "over capacity" : v < 0.3 ? "under-reporting" : "within capacity") },
      holdBreakNote: "The count drifted out of the safe band while your attention was elsewhere. A shelter running over its rated capacity is a problem for every resident in the building, not just the next one through the door.",
    },
    {
      id: "info-board", kind: "select", target: "information-board",
      title: "Post the shelter information board",
      cue: "Post meal times, curfew, and the shelter's own hotline number where residents can actually read it.",
      why: "A resident who does not know when meals are served or who to call with a question is a resident who has to find and interrupt a staff member for information that could have been posted once, in plain sight, for everyone. The board is what turns a hundred individual questions into one thing residents can check for themselves.",
    },
    {
      id: "shift-log", kind: "hold", target: "handover-log", seconds: 4,
      title: "Hold the handover log open and read the counts back",
      cue: "Hold the log open long enough to actually read the registration total, the pet count and any open needs back to yourself before you sign it.",
      why: "The crew coming on next shift was not here for any of this — a log filled in and closed without being read back is exactly how a wrong headcount or a missed open need rides straight through to the next shift unnoticed. Holding it open long enough to actually check it is what makes the handover trustworthy instead of just completed.",
      holdBreakNote: "You closed the log before reading the counts back. A handover nobody checked is a guess with a signature on it, not a real account of the shift.",
    },
    {
      id: "crew-checkin", kind: "select", target: "crew-checkin-board",
      title: "Check in with your own crew before you go off shift",
      cue: "Confirm with the rest of the crew how the shift actually was, and point anyone who needs it to the disaster-relief peer-support line.",
      why: "A registration desk that spends a whole shift absorbing other people's worst day is not a neutral place to stand, and the Red Cross's own critical-incident support line and the AFSCME/LIUNA peer-support contacts exist because the crew that just opened this shelter is carrying something too. Checking in with each other before anyone drives home is the same care this whole shift just gave every resident who walked through the door.",
    },
  ],

  interrupts: [
    {
      id: "resident-no-id",
      kind: "Resident arrives in distress, no ID",
      after: "confirm-headcount", delay: 3, seconds: 13,
      alert: "A resident has reached the registration line shaking and in tears — everything she owned, including her ID, is gone.",
      cue: "Register her anyway. Nobody is turned away for a document a disaster just took from them.",
      target: "no-id-waiver",
      why: "Nobody arrives at an emergency shelter with a complete wallet, and a shelter that treats a missing ID as a reason to make a resident wait outside while she is standing there in distress has confused a paperwork convenience with a safety requirement — the waiver exists precisely so registering her with care, right now, is the correct procedure and not an exception to it.",
      missNote: "She stood at the desk, still shaking, while the registration line moved around her and nobody used the waiver. A resident who has just lost everything does not get steadier by being made to wait for a document the disaster already took.",
      wrongNote: "That does not register her. Use the no-ID waiver at the desk — she gets checked in with care, not turned away for a document she no longer has.",
    },
    {
      id: "fire-alarm-test",
      kind: "Fire alarm test",
      after: "monitor-floor", delay: 4, seconds: 14,
      alert: "The gym's fire alarm cuts through the floor, unannounced, mid-shift — a scheduled system test nobody warned intake about.",
      cue: "Treat it as real. Direct the floor to the evacuation muster point now.",
      target: "muster-sign",
      why: "A shelter's own fire-alarm test is indistinguishable from a real alarm to the hundreds of residents standing on the floor when it goes off, and hesitating to check whether it counts costs the exact seconds the evacuation plan is built to use — the muster point gets called immediately, and it gets stood down once command confirms it was only a test, not the other way around.",
      missNote: "The alarm kept sounding while intake carried on as if nothing had happened. A floor full of residents who see staff not react to an alarm learns, from that, not to react to the next one either — including the one that is not a test.",
      wrongNote: "That does not answer the alarm. Direct the floor to the evacuation muster point — sort out afterward whether it was only a test.",
    },
  ],

  build(root) {
    const hits = {};
    // The indoor "service" interior spawns the learner near its own front
    // wall looking in — set the room back from that spawn point the same
    // way the shelter-in-place drill does.
    const g = group(root, 0, 0, -1.9);
    stationPad(g, 2.4, SIO_ACCENT);

    // -------------------------------------------------------------- gym shell
    const floor = box(g, 6.2, 0.1, 5.4, 0, 0.05, -0.2, 0xffffff, { rough: 0.55 });
    floor.material = texturedMat(
      surfaceTexture((cx, w, h) => pavingFace(cx, w, h, { tiles: 6, base: "#b8874f", base2: "#a87942", seam: "rgba(60,38,18,0.4)" }), { repeat: 4, px: 512 }),
      { rough: 0.5, metal: 0.05, color: 0xe8d3a8 },
    );
    // Court lines painted over the wood.
    box(g, 4.6, 0.001, 0.03, 0, 0.101, -0.2, 0xe94f37, { rough: 0.5, cast: false });
    torus(g, 0.7, 0.012, 0, 0.101, -0.2, 0xe94f37, { emissive: 0xe94f37, ei: 0.1, rough: 0.5, cast: false, seg: 6, seg2: 40 }).rotation.x = Math.PI / 2;
    box(g, 6.4, 3.1, 0.16, 0, 1.6, -2.9, 0xd7dbd8, { rough: 0.85 });
    box(g, 6.4, 0.18, 0.34, 0, 3.2, -2.9, 0xbdc2bf, { rough: 0.75 });

    // Basketball hoop on the back wall — a school gym, at a glance.
    const hoop = group(g, 0, 0, -2.75);
    box(hoop, 1.0, 0.7, 0.04, 0, 2.6, 0, 0xeef1f0, { rough: 0.4, opacity: 0.85, transparent: true });
    box(hoop, 0.5, 0.35, 0.02, 0, 2.55, 0.02, 0xd8232a, { rough: 0.5, cast: false });
    torus(hoop, 0.14, 0.012, 0, 2.32, 0.22, 0xe8722a, { emissive: 0xe8722a, ei: 0.2, rough: 0.4, seg: 8, seg2: 20 }).rotation.x = Math.PI / 2;

    // Folded bleachers along one side wall.
    const bleachers = group(g, -2.95, 0, 0.5, Math.PI / 2);
    for (let i = 0; i < 5; i++) box(bleachers, 3.6, 0.1, 0.24, 0, 0.14 + i * 0.24, -i * 0.02, 0x8a7a5c, { rough: 0.8 });
    box(bleachers, 3.7, 1.3, 0.1, 0, 0.65, -1.1, 0x6f6350, { rough: 0.8 });

    // -------------------------------------------------------------- ICS check-in
    const icsPost = group(g, -2.4, 0, -2.4);
    const icsBoard = holoPanel(icsPost, 0.72, 0.5, 0, 1.55, 0, (cx, w, h) => {
      cx.fillStyle = "rgba(6,22,16,0.9)"; cx.fillRect(0, 0, w, h);
      cx.fillStyle = "#5ec9a0"; cx.fillRect(0, 0, w, 5);
      cx.fillStyle = "#e3f7ee";
      cx.font = `600 ${Math.round(h * 0.1)}px 'Barlow Condensed', Arial, sans-serif`;
      cx.textAlign = "left"; cx.textBaseline = "middle";
      cx.fillText("ICS ORGANIZATION CHART", w * 0.06, h * 0.14);
      cx.font = `${Math.round(h * 0.08)}px Arial, sans-serif`; cx.fillStyle = "#bfe8d6";
      ["Incident Commander", "Registration · Health · Floor · Logistics", "Sign in before entering any position"].forEach((line, i) => cx.fillText(line, w * 0.06, h * (0.36 + i * 0.16)));
    }, { ry: 0.5, accent: SIO_ACCENT });
    reg(hits, icsBoard, "ics-checkin-board");
    const commandTable = counter(icsPost, 0.9, 0.4, 0, 0.5, 0x5a4a36, { ry: 0.5 });
    void commandTable;
    const radioBase = group(icsPost, 0.3, 0.76, 0.3, 0.5);
    box(radioBase, 0.1, 0.16, 0.05, 0, 0, 0, 0x2b3138, { rough: 0.5 });
    holoTag(radioBase, "Command radio", 0, 0.14, 0, { css: "#5ec9a0", w: 0.36 });
    reg(hits, radioBase, "command-radio");
    const icsOfficer = standingFigure(icsPost, -0.35, 0.5, { ry: -0.8, cloth: 0x37505f, vest: SIO_ACCENT, atStation: true });
    void icsOfficer;

    // -------------------------------------------------------------- registration
    const regDesk = counter(g, 1.3, 0.5, -0.6, -2.5, 0xdfe4e8, { ry: 0 });
    box(regDesk, 0.4, 0.02, 0.3, -0.35, 0.79, -0.1, 0xece3d0, { rough: 0.7 });
    decal(regDesk, 0.34, 0.24, -0.35, 0.792, -0.1, signFace("SIGN-IN", { bg: "#0d1c14", accent: "#5ec9a0", scale: 0.4 }), { px: 128 }).rotation.x = -Math.PI / 2;
    const screenHinge = group(g, -1.55, 0, -2.9);
    const screenLeaf1 = box(screenHinge, 0.02, 1.6, 1.0, 0, 0.8, 0.5, 0x3a4148, { rough: 0.7 });
    const screenLeaf2 = box(screenHinge, 0.02, 1.6, 1.0, 0, 0.8, 1.5, 0x3a4148, { rough: 0.7 });
    holoTag(screenHinge, "Privacy screen", 0, 1.7, 0.5, { css: "#5ec9a0", w: 0.36 });
    const crank = cyl(screenHinge, 0.03, 0.03, 0.14, 0, 0.9, 0, CITY.steel, { rough: 0.35, metal: 0.8, seg: 12 });
    crank.rotation.z = Math.PI / 2;
    reg(hits, crank, "privacy-screen-crank");
    const noIdBadge = group(g, 0.5, 0, -2.9);
    box(noIdBadge, 0.16, 0.1, 0.02, 0, 0.7, 0, 0xf2c14b, { rough: 0.6 });
    holoTag(noIdBadge, "No-ID waiver", 0, 0.78, 0, { css: "#5ec9a0", w: 0.34 });
    reg(hits, noIdBadge, "no-id-waiver");
    const openTableTrap = group(g, 2.4, 0, -2.9);
    box(openTableTrap, 0.7, 0.75, 0.4, 0, 0.375, 0, 0x8a7a5c, { rough: 0.7 });
    holoTag(openTableTrap, "Register here instead?", 0, 0.85, 0, { css: "#f0645b", w: 0.5 });
    reg(hits, openTableTrap, "improvised-registration");

    // Intake questions, three cards on the registration desk.
    const intakeSpec = [
      ["ask-name", "NAME", -0.9, 0.79, -1.0], ["ask-household", "HOUSEHOLD", -0.6, 0.79, -1.0], ["ask-needs", "NEEDS", -0.3, 0.79, -1.0],
    ];
    for (const [id, label, x, y, z] of intakeSpec) {
      const card = decal(g, 0.24, 0.14, x, y, z, signFace(label, { bg: "#0d1c14", accent: "#5ec9a0", scale: 0.5 }), { px: 128 });
      card.rotation.x = -Math.PI / 2;
      reg(hits, card, id);
    }
    const reaskCard = decal(g, 0.22, 0.12, 0.0, 0.79, -1.0, signFace("ASK AGAIN?", { bg: "#2a1416", accent: "#f0645b", scale: 0.42 }), { px: 128 });
    reaskCard.rotation.x = -Math.PI / 2;
    reg(hits, reaskCard, "reask-trauma-question");

    const resident = seatedFigure(g, -0.6, 0.66, -0.9, { cloth: 0x6b4a5a, ry: 0.3, skin: 0xc99878 });
    void resident;
    const registrar = standingFigure(g, -0.6, -1.6, { ry: 2.9, cloth: 0x2f5a45, vest: SIO_ACCENT, atStation: true });
    void registrar;

    // Needs flag, dragged across the floor to the health station's inbox.
    const flagPost = group(g, -0.9, 0, -1.15);
    cyl(flagPost, 0.008, 0.01, 0.3, 0, 0.15, 0, CITY.darkSteel, { rough: 0.5, seg: 8 });
    const flag = box(flagPost, 0.12, 0.08, 0.01, 0.07, 0.28, 0, 0xf2c14b, { rough: 0.6 });
    holoTag(flagPost, "Needs flag", 0, 0.4, 0, { css: "#5ec9a0", w: 0.3 });
    reg(hits, flag, "needs-flag");

    const healthStation = group(g, 2.6, 0, -0.6, -0.4);
    box(healthStation, 0.6, 0.85, 0.4, 0, 0.425, 0, 0xf2f4f5, { rough: 0.5 });
    decal(healthStation, 0.4, 0.16, 0, 0.9, 0, signFace("HEALTH STATION", { bg: "#0d1c24", accent: "#f0645b", scale: 0.42 }), { px: 160 });
    const healthInbox = box(healthStation, 0.34, 0.1, 0.24, 0, 0.9, 0.22, 0xe8edf0, { rough: 0.6 });
    holoTag(healthStation, "Flag inbox", 0, 1.02, 0.22, { css: "#5ec9a0", w: 0.32 });
    reg(hits, healthInbox, "health-station-inbox");

    // -------------------------------------------------------------- cot rows
    const cotHits = {};
    const cotRows = [];
    for (let row = 0; row < 3; row++) {
      const cots = [];
      for (let c = 0; c < 4; c++) {
        const cx = -1.6 + c * 0.62, cz = 0.5 + row * 0.85;
        const cot = group(g, cx, 0, cz);
        box(cot, 0.55, 0.24, 0.2, 0, 0.12, 0, CITY.steel, { rough: 0.5, metal: 0.6 });
        box(cot, 0.5, 0.06, 0.16, 0, 0.27, 0, [0x8a9fae, 0xae8f6a, 0x6a9f8a, 0xa87f9f][c % 4], { rough: 0.8 });
        cots.push(cot);
      }
      cotRows.push(cots);
    }
    // Family cots: the three adjoining cots in the middle row.
    reg(cotHits, cotRows[1][1], "family-cot-a"); reg(hits, cotRows[1][1], "family-cot-a");
    reg(cotHits, cotRows[1][2], "family-cot-b"); reg(hits, cotRows[1][2], "family-cot-b");
    reg(cotHits, cotRows[1][3], "family-cot-c"); reg(hits, cotRows[1][3], "family-cot-c");
    void cotHits;

    // Spacing wand, swept across the front cot row.
    const wandPost = group(g, -1.6, 0, 0.5);
    const wand = instrument(wandPost, 0, 0.5, -0.35, { idle: "-- ft", color: SIO_ACCENT, w: 0.16, d: 0.22, ry: 0.3 });
    reg(hits, wand, "spacing-wand");
    // The over-packed shortcut row, pushed noticeably tight, off to one side.
    const tightRow = group(g, 2.2, 0, 1.6);
    for (let c = 0; c < 3; c++) {
      const cot = box(tightRow, 0.5, 0.24, 0.18, c * 0.34, 0.12, 0, CITY.steel, { rough: 0.5, metal: 0.6 });
      if (c === 2) reg(hits, cot, "overpack-cots");
    }
    holoTag(tightRow, "Squeeze one more in?", 0.34, 0.3, 0, { css: "#f0645b", w: 0.5 });

    // -------------------------------------------------------------- family
    const familyParent = standingFigure(g, -2.4, -0.9, { ry: 1.6, cloth: 0x4a5f6b, skin: 0xc99878, atStation: true });
    holoTag(familyParent, "Parent", 0, 1.85, 0, { css: "#5ec9a0", w: 0.26 });
    reg(hits, familyParent, "family-parent");
    const familyChildA = seatedFigure(g, -2.7, 0.45, -0.5, { cloth: 0x6b8f6a, skin: 0xd9a985, ry: 1.2 });
    holoTag(familyChildA.torso, "Older child", 0, 0.7, 0, { css: "#5ec9a0", w: 0.32 });
    reg(hits, familyChildA.torso, "family-child-a");
    const familyChildB = standingFigure(g, -2.15, -0.6, { ry: 1.9, cloth: 0x8f6a8a, skin: 0xd9a985, atStation: true });
    familyChildB.scale.set(0.72, 0.72, 0.72);
    holoTag(familyChildB, "Younger child", 0, 1.5, 0, { css: "#5ec9a0", w: 0.36 });
    reg(hits, familyChildB, "family-child-b");

    // -------------------------------------------------------------- pet area
    const petPen = group(g, 2.4, 0, 2.2);
    box(petPen, 1.4, 0.03, 1.1, 0, 0.02, 0, 0xdfe4e8, { rough: 0.6 });
    for (const fx of [-0.7, 0.7]) box(petPen, 0.03, 0.4, 1.1, fx, 0.2, 0, 0xb8c0c6, { rough: 0.5, metal: 0.4, opacity: 0.5, transparent: true });
    for (const [px, pz] of [[-0.35, -0.2], [0.35, 0.15]]) {
      const crate = box(petPen, 0.4, 0.32, 0.32, px, 0.16, pz, 0xece3d0, { rough: 0.6 });
      void crate;
    }
    const petA = ball(petPen, 0.14, -0.35, 0.16, -0.2, 0x8a7048, { rough: 0.85 });
    box(petPen, 0.28, 0.1, 0.1, -0.35, 0.13, 0.02, 0x8a7048, { rough: 0.85 });
    void petA;
    const petCheckin = decal(petPen, 0.3, 0.16, 0, 0.5, 0.56, signFace("PET CHECK-IN", { bg: "#0d1c14", accent: "#5ec9a0", scale: 0.42 }), { px: 160 });
    reg(hits, petCheckin, "pet-checkin");
    // The wrong spot: a leash tied to a cot back in the main sleeping area.
    const strayLeash = group(g, -0.98, 0, 1.75);
    cyl(strayLeash, 0.006, 0.006, 0.3, 0, 0.15, 0, 0x3a2e22, { rough: 0.7, seg: 6 });
    ball(strayLeash, 0.1, 0, 0.05, 0.1, 0x5a4a38, { rough: 0.85 });
    holoTag(strayLeash, "Tie up here instead?", 0, 0.3, 0, { css: "#f0645b", w: 0.5 });
    reg(hits, strayLeash, "pet-loose-in-sleeping-row");

    // -------------------------------------------------------------- quiet room
    const quietRoom = group(g, 2.9, 0, -1.9);
    box(quietRoom, 1.2, 2.1, 0.05, 0, 1.05, -0.6, 0x6b5a7a, { rough: 0.7, opacity: 0.9, transparent: true });
    box(quietRoom, 0.05, 2.1, 1.2, -0.6, 1.05, 0, 0x6b5a7a, { rough: 0.7, opacity: 0.9, transparent: true });
    const quietSign = decal(quietRoom, 0.3, 0.14, 0, 1.9, -0.3, signFace("QUIET ROOM", { bg: "#241a2e", accent: "#c9a4e0", scale: 0.42 }), { px: 160 });
    reg(hits, quietSign, "quiet-room-sign");

    // -------------------------------------------------------------- capacity + info + logs
    const capacityBoard = instrument(g, 0.3, 1.1, -2.6, { idle: "-- / 240", color: SIO_ACCENT, w: 0.2, d: 0.26, ry: 0.2 });
    reg(hits, capacityBoard, "capacity-board");

    const infoBoard = holoPanel(g, 0.62, 0.42, -3.0, 1.5, 0.2, (cx, w, h) => {
      cx.fillStyle = "rgba(6,22,16,0.9)"; cx.fillRect(0, 0, w, h);
      cx.fillStyle = "#5ec9a0"; cx.fillRect(0, 0, w, 5);
      cx.fillStyle = "#e3f7ee";
      cx.font = `600 ${Math.round(h * 0.13)}px 'Barlow Condensed', Arial, sans-serif`;
      cx.textAlign = "left"; cx.textBaseline = "middle";
      cx.fillText("SHELTER INFORMATION", w * 0.06, h * 0.16);
      cx.font = `${Math.round(h * 0.085)}px Arial, sans-serif`; cx.fillStyle = "#bfe8d6";
      ["Meals: 7 · 12 · 6", "Curfew: 10pm lights", "Shelter hotline posted at each exit"].forEach((line, i) => cx.fillText(line, w * 0.06, h * (0.4 + i * 0.15)));
    }, { ry: 0.6, accent: SIO_ACCENT });
    reg(hits, infoBoard, "information-board");

    const handoverLog = holoPanel(g, 0.5, 0.36, 1.9, 1.45, -2.75, (cx, w, h) => {
      cx.fillStyle = "rgba(6,22,16,0.9)"; cx.fillRect(0, 0, w, h);
      cx.fillStyle = "#5ec9a0"; cx.fillRect(0, 0, w, 5);
      cx.fillStyle = "#e3f7ee";
      cx.font = `600 ${Math.round(h * 0.14)}px 'Barlow Condensed', Arial, sans-serif`;
      cx.textAlign = "center"; cx.textBaseline = "middle";
      cx.fillText("SHIFT HANDOVER", w / 2, h * 0.34);
      cx.font = `${Math.round(h * 0.09)}px Arial, sans-serif`; cx.fillStyle = "#bfe8d6";
      cx.fillText("Registration · pets · open needs", w / 2, h * 0.66);
    }, { ry: -0.5, accent: SIO_ACCENT });
    reg(hits, handoverLog, "handover-log");

    const crewBoard = holoPanel(g, 0.5, 0.36, -0.4, 1.45, -2.75, (cx, w, h) => {
      cx.fillStyle = "rgba(6,22,16,0.9)"; cx.fillRect(0, 0, w, h);
      cx.fillStyle = "#7fd1c9"; cx.fillRect(0, 0, w, 5);
      cx.fillStyle = "#e3f7ee";
      cx.font = `600 ${Math.round(h * 0.13)}px 'Barlow Condensed', Arial, sans-serif`;
      cx.textAlign = "center"; cx.textBaseline = "middle";
      cx.fillText("CREW CHECK-IN", w / 2, h * 0.32);
      cx.font = `${Math.round(h * 0.08)}px Arial, sans-serif`; cx.fillStyle = "#bfe8d6";
      cx.fillText("Red Cross critical-incident line", w / 2, h * 0.6);
      cx.fillText("AFSCME / LIUNA peer support posted", w / 2, h * 0.78);
    }, { ry: 0.4, accent: 0x7fd1c9 });
    reg(hits, crewBoard, "crew-checkin-board");

    // -------------------------------------------------------------- exits + alarm + muster
    const exitDoor = group(g, 3.05, 0, 0.4, -0.3);
    box(exitDoor, 0.06, 2.1, 1.0, 0, 1.05, 0, 0x59636d, { rough: 0.6, metal: 0.3 });
    decal(exitDoor, 0.3, 0.12, 0.04, 2.0, 0, signFace("EXIT", { bg: "#0d1c14", accent: "#59c97b", scale: 0.55 }), { px: 128, glow: true, ei: 0.8 });
    const alarmStrobe = ball(g, 0.05, -2.9, 2.9, -2.0, 0xf0645b, { emissive: 0xf0645b, ei: 0.3, rough: 0.4 });
    const musterSign = decal(g, 0.3, 0.16, 3.05, 1.7, 0.4, signFace("MUSTER POINT", { bg: "#0d1c14", accent: "#f0645b", scale: 0.4 }), { px: 160 });
    reg(hits, musterSign, "muster-sign");

    // Ambient dressing: a couple of volunteers and a supply table, well clear
    // of the interactive props.
    standingFigure(g, -0.4, 2.6, { ry: -0.5, cloth: 0x37505f, vest: SIO_ACCENT });
    standingFigure(g, 1.2, 2.5, { ry: 1.1, cloth: 0x445566 });
    const supplyTable = counter(g, 1.0, 0.4, -2.7, 2.4, 0xdfe4e8, { ry: 0 });
    void supplyTable;
    cabinet(g, 0.7, 0.9, 0.3, -2.9, 0.45, 1.4, 0x2f2a24, { doorColor: 0x241f1a });

    let alarmOn = false, musterCalled = false;

    return {
      hits,
      footprint: 2.4,
      spawnLook: new THREE.Vector3(-0.2, 1.3, -0.9),

      onStepComplete(step) {
        if (step.id === "privacy-screen") { screenLeaf1.rotation.y = 0.9; screenLeaf2.rotation.y = -0.4; }
        if (step.id === "flag-needs") { flag.visible = false; }
        if (step.id === "cot-spacing") { repaint(wand.userData.screen, signFace("SET", { bg: "#0d1c24", accent: "#59c97b", fg: "#eafcf9", scale: 0.55 })); }
        if (step.id === "pet-area") { repaint(petCheckin, signFace("CHECKED IN", { bg: "#0d1c14", accent: "#59c97b", scale: 0.4 })); }
        if (step.id === "info-board") {
          repaint(infoBoard.userData.face, (cx, w, h) => {
            cx.fillStyle = "rgba(6,22,16,0.9)"; cx.fillRect(0, 0, w, h); cx.fillStyle = "#59c97b"; cx.fillRect(0, 0, w, 5);
            cx.fillStyle = "#eafcf1"; cx.font = `600 ${Math.round(h * 0.14)}px 'Barlow Condensed', Arial, sans-serif`;
            cx.textAlign = "center"; cx.textBaseline = "middle";
            cx.fillText("POSTED", w / 2, h * 0.5);
          });
        }
        if (step.id === "shift-log") {
          repaint(handoverLog.userData.face, (cx, w, h) => {
            cx.fillStyle = "rgba(6,22,16,0.9)"; cx.fillRect(0, 0, w, h); cx.fillStyle = "#59c97b"; cx.fillRect(0, 0, w, 5);
            cx.fillStyle = "#eafcf1"; cx.font = `600 ${Math.round(h * 0.14)}px 'Barlow Condensed', Arial, sans-serif`;
            cx.textAlign = "center"; cx.textBaseline = "middle";
            cx.fillText("HANDED OFF", w / 2, h * 0.5);
          });
        }
      },

      onInterrupt(it) {
        if (it.id === "resident-no-id") { noIdBadge.material = mat(0xf2c14b, { emissive: 0xf2c14b, ei: 1.4, rough: 0.5 }); }
        if (it.id === "fire-alarm-test") { alarmOn = true; alarmStrobe.scale.set(2.4, 2.4, 2.4); alarmStrobe.material = mat(0xf0645b, { emissive: 0xf0645b, ei: 1.8, rough: 0.4 }); }
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "resident-no-id") { noIdBadge.material = mat(0xf2c14b, { rough: 0.6 }); }
        if (it.id === "fire-alarm-test") { alarmOn = false; musterCalled = true; alarmStrobe.scale.set(1, 1, 1); alarmStrobe.material = mat(0xf0645b, { emissive: 0xf0645b, ei: 0.3, rough: 0.4 }); }
      },

      onHazard() {},

      animate(t, dt, session) {
        void dt;
        if (alarmOn) alarmStrobe.material.emissiveIntensity = 1.2 + Math.sin(t * 10) * 1.0;
        else alarmStrobe.material.emissiveIntensity = 0.3;
        void musterCalled;
        const tr = session?.track;
        if (tr && session.step?.id === "monitor-floor") {
          repaint(capacityBoard.userData.screen, signFace(`${Math.round(60 + tr.v * 240)} / 240`, { bg: "#0d1c24", accent: tr.v >= 0.3 && tr.v <= 0.7 ? "#59c97b" : "#f0645b", fg: "#eafcf9", scale: 0.5 }));
        }
        const gg = session?.gauge;
        if (gg && !gg.committed && session.step?.id === "cot-spacing") {
          repaint(wand.userData.screen, signFace(`${(gg.t * 8).toFixed(1)} ft`, { bg: "#0d1c24", accent: gg.t >= 0.42 && gg.t <= 0.62 ? "#59c97b" : "#f2c14b", fg: "#eafcf9", scale: 0.55 }));
        }
      },
    };
  },
};
