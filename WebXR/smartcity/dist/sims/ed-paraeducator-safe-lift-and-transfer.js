import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, ball, torus, group, decal, repaint, signFace, paperFace, mat,
} from "../../../shared/kit.js";
import {
  CITY, stationPad, holoPanel, holoTag, instrument, standingFigure, reg,
  surfaceTexture, texturedMat, tileFace,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Paraeducator Safe Lift & Transfer VR — Building Systems &
// Facilities, the education-support-staff programme.
//
// A school's resource room set up for exactly this task: a student who uses
// a wheelchair moved to a classroom chair by the district's own two-person
// transfer plan, read before anyone touches anything, the wheelchair's
// brakes locked and proven, a gait belt applied and checked, the lift made
// with a partner rather than alone, a steady brace held through the pivot
// instead of a twist, and the student settled and strapped in before the
// paraeducator signs off. No student is named or shown as an identifiable
// person; the transfer technique, any weight and every timing figure are
// read from the student's own plan, never invented here. The learner is the
// AFT- or CSEA-represented paraeducator; a second paraeducator assists.

const PE_ACCENT = 0x5b8fae;
const PE_CSS = "#5b8fae";

export const SIM_ED_PARAEDUCATOR_SAFE_LIFT_AND_TRANSFER = {
  id: "ed-paraeducator-safe-lift-and-transfer",
  index: "624",
  domain: "Building Systems & Facilities",
  trade: "AFT- or CSEA-represented paraeducator transferring a student who uses a wheelchair, with a second paraeducator assisting",
  category: "Building Systems & Facilities",
  indoor: "clinic",
  weather: "overcast",
  certification: "AFT and CSEA paraeducator training; Cal/OSHA's musculoskeletal injury prevention approach (8 CCR 3345) and repetitive-motion standard (8 CCR 5110) for a lift and transfer done this often in a working day; OSHA's bloodborne pathogens standard (29 CFR 1910.1030) and PPE standard (29 CFR 1910.132) for gloves during personal care; the student's own individualized transfer plan for the technique, the equipment and the number of assisting staff, read fresh every time rather than assumed from memory",
  name: "Paraeducator Safe Lift & Transfer",
  title: simTitle("Paraeducator Safe Lift & Transfer"),
  tagline: "The transfer plan read first, the wheelchair's brakes locked and proven, the path cleared, a pre-lift check for what's not right, the gait belt fitted, a braced pivot held steady with a partner rather than a twist alone, the wheelchair parked, the seatbelt fastened, and the transfer logged",
  accent: PE_ACCENT,
  accentCss: PE_CSS,
  parSeconds: 300,
  footprint: 2.6,
  badge: { id: "plan-read-partner-braced", name: "Plan Read, Partner Braced", note: "The plan read before anything else, the brakes proven, never a solo lift or a twisted back, and the student settled and strapped before sign-off" },

  supportLine: "your AFT or CSEA chapter's member assistance line, or the district's employee assistance programme",

  game: system({
    name: "Safe Transfer",
    currency: "LIFT",
    ranks: ["Aide Trainee", "Paraeducator", "Lead Paraeducator", "Transfer Trainer", "Safe Handling Certified"],
    badges: [
      { id: "never-solo", name: "Never Solo", note: "Never attempted the lift alone or skipped the gait belt", test: AWARD.safe },
      { id: "clean-transfer", name: "Clean Transfer", note: "No corrections across the whole transfer", test: AWARD.clean },
      { id: "steady-brace", name: "Steady Brace", note: "The braced pivot held in band without a break", test: AWARD.unbroken },
    ],
    challenges: [
      { id: "transfer-on-time", name: "Transfer on Time", note: "Whole transfer finished inside 80% of par", test: AWARD.fast(0.8) },
      { id: "one-pass-pre-lift", name: "One-Pass Pre-Lift Check", note: "Pre-lift check clean on the first pass", test: AWARD.stepClean("pre-lift-check") },
      { id: "eight-in-a-row", name: "Eight in a Row", note: "Eight correct actions in a row", test: AWARD.streak(8) },
    ],
  }),

  hazards: {
    "lift-alone-without-second-person": "That's starting the lift without the second paraeducator in position. The plan calls for two people because a transfer that goes wrong partway through needs a second set of hands already there, not one being called for after the student is already off balance.",
    "twist-while-lifting": "That's a twist through the back instead of a pivot on the feet. A spine loaded and twisted at the same time is exactly the motion behind the injuries a lift-and-transfer job sees most — the feet turn to face the new seat; the back stays square to whatever it's carrying the whole way round.",
    "skip-gait-belt": "That's reaching for an underarm hold instead of the gait belt. A grip under the arms has nothing to hold onto if the student's legs give way mid-transfer and can injure the shoulder it's pulling on — the gait belt is the one hold built to carry weight safely by design.",
    "unlocked-brake-attempt": "The wheelchair's brakes were never actually locked, and the transfer is starting anyway. A chair that rolls even a few inches mid-transfer takes the base out from under a lift that was counting on it staying put.",
  },

  lateNotes: {
    "gait-belt": "Not yet — the belt goes on once the pre-lift check has actually cleared the space, not before.",
    "brace-effort": "The pivot happens once the count of three has actually been called — that's the next step.",
  },

  steps: [
    {
      id: "read-transfer-plan", kind: "select", target: "transfer-plan-card",
      title: "Read today's transfer plan",
      cue: "Read the student's individualized transfer plan before touching anything.",
      why: "The plan names the technique, the equipment and the number of staff this specific transfer calls for, and it can change as a student's needs change — reading it fresh, every time, is what keeps a paraeducator from running yesterday's transfer on a plan that's since been updated.",
    },
    {
      id: "prep-space", kind: "sequence", anyOrder: false,
      targets: ["brakes-locked", "transfer-board-ready", "path-cleared"],
      itemNames: { "brakes-locked": "wheelchair brakes locked", "transfer-board-ready": "transfer board in position", "path-cleared": "path to the chair cleared" },
      title: "Lock the brakes, ready the board, clear the path",
      cue: "Lock the wheelchair's brakes, set the transfer board in position, then clear the path to the classroom chair, in that order.",
      why: "The brakes are locked before anything else because every step after this one assumes the chair isn't moving; the path gets cleared last so nothing that was in the way during setup is still there once the actual lift starts.",
      outOfOrderNote: "Brakes, then the board, then the path — the chair has to be locked down before either the board or the path matters.",
    },
    {
      id: "confirm-brakes", kind: "hold", target: "brake-lever", seconds: 5,
      title: "Confirm the brakes are actually locked",
      cue: "Hold the brake lever fully engaged and confirm it clicks locked on both sides.",
      why: "A brake lever that looks engaged and one that's actually clicked into its locked position are not always the same thing — holding it to the click on both sides is what turns 'probably locked' into a chair that's certain not to roll.",
      holdBreakNote: "You let go before both sides clicked locked. A brake that isn't confirmed locked is a chair that might still roll under a lift.",
    },
    {
      id: "pre-lift-check", kind: "find", noHint: true,
      targets: ["loose-gait-belt-buckle", "obstruction-in-path", "unlocked-brake-lever"],
      itemNames: { "loose-gait-belt-buckle": "the gait belt's loose buckle", "obstruction-in-path": "the chair left in the transfer path", "unlocked-brake-lever": "the second wheelchair's unlocked brake" },
      itemNotes: {
        "loose-gait-belt-buckle": "This gait belt's buckle isn't fully seated. A belt that isn't seated can let go under load at the exact moment it's needed to hold weight.",
        "obstruction-in-path": "A stray chair is sitting in the transfer path between the wheelchair and the classroom seat. Anything in that path is something a paraeducator mid-pivot, watching the student rather than the floor, can catch a foot on.",
        "unlocked-brake-lever": "A second wheelchair nearby has its brake lever sitting unlocked. It isn't the chair being transferred from today, but an unlocked chair anywhere in a room used for transfers is one more thing that can roll into the space at the wrong moment.",
      },
      title: "Walk the room before the lift",
      cue: "Three things about this room are not right. Find them before the count of three.",
      why: "The room gets checked the same way the wheelchair's own brakes do — assumed right is not the same as confirmed right, and every one of these three problems is easiest to catch standing still, before two people are mid-lift and looking at each other instead of the floor.",
    },
    {
      id: "gait-belt-fit", kind: "select", target: "gait-belt",
      title: "Fit the gait belt",
      cue: "Fit the gait belt snugly at the waist and check it seats fully.",
      why: "The gait belt is the one hold in this whole transfer built to carry weight safely — fitted snugly and fully seated, it gives both paraeducators a grip that won't slip or pull on a joint the way an arm or an underarm hold can.",
    },
    {
      id: "second-person-ready", kind: "select", target: "second-paraeducator",
      title: "Confirm the second paraeducator is in position",
      cue: "Confirm your partner is braced and ready on the other side before the count.",
      why: "The plan calls for two people specifically because a transfer that starts to go wrong needs a second set of hands already in place — checking your partner is set, out loud, before the count is what makes this a two-person lift in practice and not just on paper.",
    },
    {
      id: "braced-pivot", kind: "track", target: "brace-effort", seconds: 6,
      title: "Hold a braced, steady pivot",
      cue: "Keep your own effort steady through the pivot — braced through the legs, not the back.",
      why: "A pivot done right loads the legs at a steady, sustained effort and turns on the feet; one done wrong spikes as the back takes over mid-lift, exactly the moment a twisted spine is loaded hardest — holding a steady band the whole way through is what keeps the legs doing the work the back cannot do safely.",
      track: {
        start: 0.2, green: [0.4, 0.64], rise: 0.4, fall: 0.38, drift: 0.1, label: "LIFT EFFORT",
        readout: (v) => (v < 0.4 ? "not enough brace — losing control" : v > 0.64 ? "spiking — back is taking the load" : "steady, legs braced"),
      },
      holdBreakNote: "Effort out of band — too little risks losing control of the pivot, too much means the back just took over from the legs. Bring it back to steady.",
    },
    {
      id: "seat-and-align", kind: "drag", target: "student-marker",
      title: "Settle the student into the classroom chair",
      cue: "Guide the student down into the classroom chair, aligned and settled.",
      why: "The pivot only finishes once the student is actually seated and aligned in the new chair — set down off-centre or at an angle, and the transfer isn't complete no matter how well the lift itself went.",
      drag: { to: "classroom-chair-spot", radius: 0.5, missNote: "Not aligned in the chair yet. Settle the student fully into the seat before letting go of the belt." },
    },
    {
      id: "park-wheelchair", kind: "turn", target: "wheelchair-park-brake",
      title: "Park and re-lock the empty wheelchair",
      cue: "Wheel the chair clear and turn the brake lever to lock it in its parking spot.",
      why: "An empty wheelchair left unlocked in a busy classroom is its own rolling hazard — parking it clear of the walkway and locking it again is what keeps it exactly where it was left until it's needed for the next transfer.",
      turn: { turns: 0.4, label: "PARK BRAKE", readout: (t) => (t < 0.85 ? "engaging" : "locked") },
    },
    {
      id: "fasten-seatbelt", kind: "hold", target: "seatbelt-buckle", seconds: 4,
      title: "Fasten the seatbelt in the new seat",
      cue: "Hold the buckle closed until it clicks fully seated.",
      why: "A transfer that ends with the student unsecured in the new seat has only moved the risk from the lift itself to the first time that chair shifts or tips — the seatbelt closes out the transfer, not the pivot.",
      holdBreakNote: "The buckle didn't click fully seated before you let go. A belt that isn't seated does nothing the moment it's actually needed.",
    },
    {
      id: "log-transfer", kind: "select", target: "transfer-log",
      title: "Log the transfer",
      cue: "Record the time, the technique used and how the student tolerated it.",
      why: "The log is what tells the next paraeducator, the case manager or the family whether this transfer went the way the plan expects — a change in how a student tolerates the lift is exactly the kind of thing that has to show up here before it shows up as a bigger problem.",
    },
  ],

  interrupts: [
    {
      id: "student-discomfort",
      kind: "Student signals discomfort mid-pivot",
      after: "braced-pivot", delay: 2, seconds: 10,
      alert: "Partway through the pivot, the student signals discomfort — this isn't going the way the plan expects.",
      cue: "Pause the pivot and check in before continuing.",
      target: "second-paraeducator",
      why: "A transfer plan describes what should happen, not a guarantee that it always will — signalled discomfort mid-pivot gets a pause and a check-in with the partner holding the other side, not a push through to finish the motion faster.",
      missNote: "The pivot continued through a clear discomfort signal — a plan followed past the point where it stops matching what's actually happening is no longer the safe transfer it was written to be.",
      wrongNote: "Check in with your partner — that's what a discomfort signal mid-pivot calls for, not finishing the motion.",
    },
    {
      id: "aide-calls-for-help",
      kind: "Classroom aide needs help across the room",
      after: "confirm-brakes", delay: 2, seconds: 10,
      alert: "A classroom aide across the room is calling for help with an unrelated incident right as the transfer is about to start.",
      cue: "Stay with the transfer — it doesn't stop partway through for something else.",
      target: "gait-belt",
      why: "A transfer already underway does not pause for an unrelated call across the room — the safest response is finishing the step in front of you with your full attention, then responding, because a lift or pivot left half-finished to answer something else is exactly when a student who trusted the hold gets dropped.",
      missNote: "Attention went across the room mid-setup, and the transfer sat half-ready with a student still expecting it to continue.",
      wrongNote: "Stay on the gait belt — the transfer in front of you finishes before anything else gets your attention.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.6, PE_ACCENT);

    // ------------------------------------------------------------- resource room floor
    const floor = box(g, 6.4, 0.06, 5.2, 0, 0.03, 0, 0xffffff, { rough: 0.8 });
    floor.material = texturedMat(surfaceTexture((cx, w, h) => tileFace(cx, w, h, { tiles: 6, tile: 0xe4ece8, grout: "#aab4ae" }), { repeat: 5, px: 448 }), { rough: 0.7, color: 0xe0e8e4 });

    // ------------------------------------------------------------- wheelchair
    const chair = group(g, -1.6, 0, -0.6, 0.5);
    box(chair, 0.46, 0.06, 0.46, 0, 0.5, 0, 0x2b3138, { rough: 0.6 });
    box(chair, 0.46, 0.5, 0.06, 0, 0.75, -0.2, 0x2b3138, { rough: 0.6 });
    for (const sx of [-1, 1]) {
      cyl(chair, 0.27, 0.27, 0.03, sx * 0.26, 0.28, 0, 0x1a1d20, { rough: 0.7, seg: 20 }).rotation.z = Math.PI / 2;
      cyl(chair, 0.06, 0.06, 0.03, sx * 0.26, 0.08, 0.24, 0x8a929a, { rough: 0.5, metal: 0.5, seg: 12 }).rotation.z = Math.PI / 2;
      box(chair, 0.03, 0.28, 0.03, sx * 0.26, 0.7, 0, CITY.steel, { rough: 0.4, metal: 0.7 });
    }
    const brakeLever = group(chair, 0.3, 0.35, 0.1, -0.3);
    box(brakeLever, 0.02, 0.12, 0.02, 0, 0.06, 0, 0xd8532a, { rough: 0.5 });
    holoTag(brakeLever, "brake lever", 0, 0.2, 0, { css: PE_CSS, w: 0.24 });
    reg(hits, brakeLever, "brake-lever");
    holoTag(chair, "wheelchair brakes", 0, 1.1, 0, { css: PE_CSS, w: 0.3 });
    reg(hits, chair, "brakes-locked");
    const parkBrakeLeverObj = group(chair, -0.3, 0.35, 0.1, 0.3);
    box(parkBrakeLeverObj, 0.02, 0.12, 0.02, 0, 0.06, 0, 0xc0c6cc, { rough: 0.4, metal: 0.6 });
    holoTag(parkBrakeLeverObj, "park brake", 0, 0.2, 0, { css: PE_CSS, w: 0.26 });
    reg(hits, parkBrakeLeverObj, "wheelchair-park-brake");
    const unlockedBrakeSecond = group(g, -2.6, 0, 1.3);
    box(unlockedBrakeSecond, 0.46, 0.06, 0.46, 0, 0.5, 0, 0x2b3138, { rough: 0.6, opacity: 0.55, transparent: true });
    holoTag(unlockedBrakeSecond, "second chair — brake unlocked", 0, 0.9, 0, { css: "#f0645b", w: 0.5 });
    reg(hits, unlockedBrakeSecond, "unlocked-brake-lever");

    // Transfer plan card and log.
    const planCard = holoPanel(g, 0.5, 0.32, -2.9, 1.3, -1.0, (cx, w, h) => {
      cx.fillStyle = "rgba(3,16,20,0.9)"; cx.fillRect(0, 0, w, h);
      cx.fillStyle = PE_CSS; cx.fillRect(0, 0, w, 5);
      cx.fillStyle = "#e8f2fa"; cx.font = `600 ${Math.round(h * 0.16)}px 'Barlow Condensed', Arial, sans-serif`;
      cx.textAlign = "center"; cx.textBaseline = "middle"; cx.fillText("TRANSFER PLAN", w / 2, h * 0.32);
      cx.font = `${Math.round(h * 0.1)}px Arial, sans-serif`; cx.fillStyle = "#c8daea";
      cx.fillText("Two-person · gait belt · pivot", w / 2, h * 0.68);
    }, { ry: 0.6, accent: PE_ACCENT });
    reg(hits, planCard, "transfer-plan-card");
    const transferLog = holoPanel(g, 0.44, 0.3, 2.7, 1.25, -2.2, (cx, w, h) => {
      cx.fillStyle = "rgba(3,16,20,0.9)"; cx.fillRect(0, 0, w, h);
      cx.fillStyle = PE_CSS; cx.fillRect(0, 0, w, 5);
      cx.fillStyle = "#e8f2fa"; cx.font = `600 ${Math.round(h * 0.18)}px 'Barlow Condensed', Arial, sans-serif`;
      cx.textAlign = "center"; cx.textBaseline = "middle"; cx.fillText("TRANSFER LOG", w / 2, h * 0.4);
    }, { ry: -0.6, accent: PE_ACCENT });
    reg(hits, transferLog, "transfer-log");

    // Transfer board, path obstruction, classroom chair.
    const boardSpot = box(g, 0.5, 0.03, 0.18, -0.8, 0.44, -0.6, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "transfer board", -0.8, 0.6, -0.6, { css: PE_CSS, w: 0.3 });
    reg(hits, boardSpot, "transfer-board-ready");
    const obstruction = box(g, 0.4, 0.5, 0.4, -0.3, 0.25, 0.4, 0x8a6a3c, { rough: 0.7 });
    holoTag(g, "chair in the path", -0.3, 0.6, 0.4, { css: "#f0645b", w: 0.36 });
    reg(hits, obstruction, "obstruction-in-path");
    const pathSpot = box(g, 1.4, 0.05, 0.6, -0.3, 0.03, 0.2, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, pathSpot, "path-cleared");
    const classroomChair = group(g, 0.6, 0, 0.6);
    box(classroomChair, 0.4, 0.05, 0.4, 0, 0.42, 0, 0x8a6a3c, { rough: 0.6 });
    box(classroomChair, 0.4, 0.4, 0.05, 0, 0.62, -0.18, 0x8a6a3c, { rough: 0.6 });
    for (const [lx, lz] of [[-0.16, -0.16], [0.16, -0.16], [-0.16, 0.16], [0.16, 0.16]]) box(classroomChair, 0.03, 0.4, 0.03, lx, 0.2, lz, 0x5c4a34, { rough: 0.7 });
    const classroomChairSpot = torus(g, 0.2, 0.012, 0.6, 0.44, 0.6, PE_ACCENT, { emissive: PE_ACCENT, ei: 1.3, rough: 0.4, cast: false, seg: 6, seg2: 16 });
    classroomChairSpot.rotation.x = Math.PI / 2;
    reg(hits, classroomChairSpot, "classroom-chair-spot");
    const seatbeltBuckle = box(classroomChair, 0.06, 0.03, 0.02, 0, 0.5, 0.05, 0xd8532a, { rough: 0.5 });
    holoTag(classroomChair, "seatbelt buckle", 0, 0.66, 0.05, { css: PE_CSS, w: 0.3 });
    reg(hits, seatbeltBuckle, "seatbelt-buckle");

    // Gait belt on a hook near the wheelchair.
    const beltHook = group(g, -1.9, 0, 0.1);
    torus(beltHook, 0.14, 0.02, 0, 0.9, 0, 0x1a4a5a, { rough: 0.6, seg: 8, seg2: 20 });
    const beltBuckle = box(beltHook, 0.06, 0.04, 0.02, 0, 0.76, 0, 0xc0c6cc, { rough: 0.4, metal: 0.6 });
    holoTag(beltHook, "gait belt", 0, 1.1, 0, { css: PE_CSS, w: 0.26 });
    reg(hits, beltHook, "gait-belt");
    const looseBuckle = box(g, 0.06, 0.04, 0.02, -2.0, 0.75, 1.2, 0xc0c6cc, { rough: 0.4, metal: 0.6 });
    looseBuckle.rotation.z = 0.6;
    holoTag(g, "buckle not seated", -2.0, 0.95, 1.2, { css: "#f0645b", w: 0.4 });
    reg(hits, looseBuckle, "loose-gait-belt-buckle");

    // Braced-pivot and lift-related markers.
    const braceMarker = ball(g, 0.06, -0.6, 0.9, -0.2, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, braceMarker, "brace-effort");
    const studentMarker = box(g, 0.3, 0.5, 0.3, -0.6, 0.25, -0.2, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, studentMarker, "student-marker");
    const soloLiftSpot = box(g, 0.3, 0.5, 0.3, -1.0, 0.25, -0.9, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "lift alone?", -1.0, 0.6, -0.9, { css: "#f0645b", w: 0.32 });
    reg(hits, soloLiftSpot, "lift-alone-without-second-person");
    const twistSpot = box(g, 0.3, 0.5, 0.3, -1.3, 0.25, -0.3, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "twist through the back?", -1.3, 0.6, -0.3, { css: "#f0645b", w: 0.4 });
    reg(hits, twistSpot, "twist-while-lifting");
    const underarmSpot = box(g, 0.3, 0.5, 0.3, -1.9, 0.55, -0.4, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "underarm hold instead?", -1.9, 0.85, -0.4, { css: "#f0645b", w: 0.44 });
    reg(hits, underarmSpot, "skip-gait-belt");
    const unlockedAttemptSpot = box(g, 0.3, 0.5, 0.3, -1.6, 0.4, -0.9, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "brake never locked?", -1.6, 0.75, -0.9, { css: "#f0645b", w: 0.5 });
    reg(hits, unlockedAttemptSpot, "unlocked-brake-attempt");

    // Crew: the second paraeducator (positioned against the lift itself, so
    // it is exempt from the open-floor rule the same way a coworker riding
    // the forks is), the student in the wheelchair, and a classroom aide.
    const secondPara = standingFigure(g, -1.9, -0.9, { ry: 1.4, cloth: 0xd8dde2, vest: false, gloves: true, atStation: true });
    holoTag(secondPara, "second paraeducator", 0, 1.95, 0, { css: PE_CSS, w: 0.4 });
    reg(hits, secondPara, "second-paraeducator");
    const student = standingFigure(g, -1.6, -0.5, { ry: 0.5, cloth: 0x3f7a9e, trousers: 0x2b3138, atStation: true });
    student.scale.set(0.9, 0.9, 0.9);
    const aide = standingFigure(g, 2.6, 2.2, { ry: -2.2, cloth: 0xd8dde2 });
    holoTag(aide, "classroom aide", 0, 1.9, 0, { css: PE_CSS, w: 0.3 });
    const pauseLamp = ball(g, 0.05, -0.9, 1.3, -0.2, 0x2a2a2a, { rough: 0.5 });
    pauseLamp.visible = false;
    const aideCallLamp = ball(aide, 0.05, 0, 2.1, 0, 0x2a2a2a, { rough: 0.5 });
    aideCallLamp.visible = false;

    return {
      hits,
      footprint: 2.6,

      onStepComplete(step) {
        if (step.id === "confirm-brakes") brakeLever.rotation.x = -0.6;
        if (step.id === "pre-lift-check") { looseBuckle.rotation.z = 0; obstruction.visible = false; unlockedBrakeSecond.material = mat(0x2b3138, { rough: 0.6 }); }
        if (step.id === "gait-belt-fit") beltBuckle.material = mat(0x59c97b, { emissive: 0x59c97b, ei: 0.8 });
        if (step.id === "seat-and-align") { student.position.set(0.6, 0, 0.6); studentMarker.visible = false; }
        if (step.id === "park-wheelchair") parkBrakeLeverObj.rotation.x = -0.6;
        if (step.id === "fasten-seatbelt") seatbeltBuckle.material = mat(0x59c97b, { emissive: 0x59c97b, ei: 0.8 });
      },

      onInterrupt(it) {
        if (it.id === "student-discomfort") { pauseLamp.visible = true; pauseLamp.material = mat(0xf0645b, { emissive: 0xf0645b, ei: 1.6 }); }
        if (it.id === "aide-calls-for-help") { aideCallLamp.visible = true; aideCallLamp.material = mat(0xf0645b, { emissive: 0xf0645b, ei: 1.6 }); }
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "student-discomfort") pauseLamp.visible = false;
        if (it.id === "aide-calls-for-help") aideCallLamp.visible = false;
      },

      animate(t, dt, session) {
        const tr = session?.track;
        if (tr && session.step?.id === "braced-pivot") studentMarker.position.z = -0.2 + (tr.v - 0.5) * 0.1;
        if (session?.step?.id === "confirm-brakes" && session.holding) brakeLever.rotation.x = -0.6 * Math.min(1, (session.holdFor ?? 0) / 5);
        secondPara.userData.head.rotation.y = Math.sin(t * 0.4) * 0.3;
        void dt; void CITY; void aide;
      },
    };
  },
};
