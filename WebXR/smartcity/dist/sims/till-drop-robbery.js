import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, ball, slab, group, decal, repaint, signFace, paperFace,
  seatedFigure, mat, counter, cabinet,
} from "../../../shared/kit.js";
import {
  CITY, stationPad, holoPanel, holoTag, toolChest, instrument, standingFigure, lockTag, reg,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Till Drop & Robbery Response VR — Culinary & Hospitality, the
// bartending series.
//
// Two procedures that share one truth: the night's cash is only ever exposed
// for as long as it takes to move it, and the plan for both an ordinary drop
// and an armed demand is built to keep it that way. The first half is the
// close-out every shift ends with — a witnessed count, a card-batch
// reconciliation, a sealed bag walked to the safe with a second person. The
// second half is what happens if someone skips the queue and demands the
// drawer instead: comply, do not chase, and let the plan — not adrenaline —
// decide what happens for the next five minutes.

const TDR_ACCENT = 0xd6455a;

export const SIM_TILL_DROP_ROBBERY = {
  id: "till-drop-robbery",
  index: "140",
  domain: "Culinary & Hospitality",
  trade: "Bartender — UNITE HERE Local 2",
  category: "Culinary & Hospitality",
  indoor: "bar",
  weather: "clear",
  certification: "Cal/OSHA's workplace violence prevention plan (8 CCR §3342, enacted by SB 553) and Injury and Illness Prevention Program (8 CCR §3203); federal OSHA's recordkeeping rule (29 CFR 1904) for any work-related injury the incident causes; UNITE HERE Local 2's cash-handling and safety-committee language; California Labor Code §351 on tips; local police non-emergency reporting and the 911 protocol for an in-progress or just-occurred robbery",
  name: "Till Drop & Robbery Response",
  title: simTitle("Till Drop & Robbery Response"),
  tagline: "Count the till with a witness, drop it with an escort, and if someone demands the drawer instead: comply, don't chase, alarm after they're gone, lock up, call 911, and log it",
  accent: TDR_ACCENT,
  accentCss: "#d6455a",
  parSeconds: 300,
  footprint: 2.5,
  badge: { id: "clean-drop", name: "Clean Drop", note: "Till counted and dropped clean, and a robbery demand answered without a single unsafe move" },

  game: system({
    name: "Cash Control",
    currency: "DROP",
    ranks: ["Barback", "Closer", "Shift Lead", "Manager on Duty", "Cash Control Certified"],
    badges: [
      { id: "witnessed", name: "Witnessed", note: "The count was called and reconciled clean, first time", test: AWARD.all(AWARD.stepClean("witness"), AWARD.stepClean("card-recon")) },
      { id: "never-alone", name: "Never Alone", note: "No unsafe action anywhere in the run — the drop and the robbery both answered by the book", test: AWARD.safe },
      { id: "steady-hand", name: "Steady Hand", note: "Every timed hold and the escort walk carried clean the whole way", test: AWARD.unbroken },
    ],
    challenges: [
      { id: "clean-shift", name: "Clean Shift", note: "No corrections anywhere in the run", test: AWARD.clean },
      { id: "reconciled", name: "Reconciled", note: "Mean gauge accuracy in the top band", test: AWARD.precise(0.7) },
      { id: "closed-out", name: "Closed Out", note: "Complete inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "reach-weapon": "You reached for the bat kept under the register. Nothing behind this bar is worth a physical confrontation, and a weapon raised at a robber is what turns a compliant hand-over into a shooting — the whole policy exists to take that choice off the table before it is ever offered.",
    "chase-door": "You went out the door after them. Once the till is in their hands the robbery is over; a bartender chasing an armed stranger into a parking lot alone is a second, voluntary crime scene, and the description you can give standing still is worth more than one given from a hospital bed.",
    "torn-bag": "You sealed the deposit in the torn bag sitting by the register instead of a fresh one. A bag that has already been opened proves nothing if the count is ever questioned — the tamper strip is the only evidence that nobody touched it between the drawer and the safe.",
    "solo-carry": "You took the deposit out through the back hallway alone instead of waiting for your escort. The whole reason two people walk a drop is that one bartender carrying a bank bag across an empty room is the easiest target in the building — the escort is the control, not the paperwork after it.",
  },

  lateNotes: {
    "panic-button": "The alarm gets pressed after they've left, not while they're still at the counter — trip it now and a compliant hand-over can turn into a hostage situation.",
    "front-deadbolt": "The door gets locked once the robber is clear of it, not before — a locked door mid-robbery traps everyone inside with them.",
    "violence-log-sheet": "The log gets written after the drawer, the alarm and the call — not instead of any of them.",
  },

  steps: [
    {
      id: "witness", kind: "select", target: "second-counter",
      title: "Call a witness before you open the drawer",
      cue: "Page a second staff member — the count does not start alone.",
      why: "A till count with only one set of eyes on it is one person's word against a shortage that shows up later. UNITE HERE Local 2's cash-handling language and ordinary loss-prevention practice both start the same way: a second person present, so the number on the sheet is a fact two people watched happen.",
    },
    {
      id: "count-down", kind: "hold", target: "till-drawer", seconds: 6,
      title: "Count the drawer down",
      cue: "Hold the count steady — the drawer stays open only as long as counting takes.",
      why: "The drawer is at its most exposed the moment it is open and being counted, so the count itself is done fast and covered — hands moving the whole time, nobody outside the till involved, and the drawer shut the instant the total is confirmed.",
      holdBreakNote: "You broke off mid-count with the drawer still open. Start the count again — an interrupted count with an open drawer is the exact window this procedure exists to close.",
    },
    {
      id: "card-recon", kind: "gauge", target: "settlement-dial",
      title: "Reconcile the card batch to the settlement total",
      cue: "Run the terminal's batch close and commit when it lands on the settlement total.",
      why: "The batch total on the terminal and the printed receipts have to land on the same number tonight, not at month's end — a card run twice, declined, or refunded wrong is a two-minute fix at close and a chargeback dispute with the processor a month later.",
      gauge: { label: "BATCH $", speed: 0.7, green: [0.44, 0.6], readout: (t) => `$${Math.round(400 + t * 900)}`, missNote: "Off the settlement total — the terminal and the paper tape do not agree yet. Run the batch again before it's filed." },
    },
    {
      id: "tip-out", kind: "sequence",
      targets: ["tip-record", "tip-seal"],
      itemNames: { "tip-record": "record the tip total", "tip-seal": "seal the tip-out envelope" },
      title: "Record and seal the tip-out",
      cue: "Write the total first, then seal the envelope.",
      why: "California Labor Code §351 makes a tip the employee's property the moment it is earned, which is exactly why it is counted and written down before it is ever divided or sealed — the record is what makes a split provable instead of just assumed.",
      outOfOrderNote: "The total gets written down before the envelope is sealed — a sealed envelope with no record behind it is a number nobody can check later.",
    },
    {
      id: "seal-bag", kind: "select", target: "deposit-bag",
      title: "Seal the deposit in a fresh tamper-evident bag",
      cue: "Fresh bag, logged serial number, sealed in front of your witness.",
      why: "A tamper-evident bag with a logged serial number is the only thing that can prove later that nobody opened the deposit between the drawer and the bank. A bag that is not sealed, or is not fresh, proves nothing either way.",
    },
    {
      id: "walk-escort", kind: "track", target: "escort-walk", seconds: 5,
      title: "Walk the drop with your escort",
      cue: "Steady, unhurried pace to the safe — not a stroll, not a sprint.",
      why: "Two people walking a cash drop is the whole control, not a courtesy. A single bartender crossing an empty bar with the night's deposit is the easiest robbery in the building to plan around, and the escort beside you is what removes that opportunity entirely.",
      track: { start: 0.1, green: [0.4, 0.6], rise: 0.55, fall: 0.45, drift: 0.1, label: "DROP PACE", readout: (v) => (v < 0.4 ? "dawdling — cash exposed longer" : v > 0.6 ? "rushing — you'll drop it" : "steady") },
      holdBreakNote: "Pace drifted out of band. Dawdling leaves the cash exposed longer than it needs to be; rushing is how a sealed bag ends up dropped on the floor.",
    },
    {
      id: "carry-drop", kind: "drag", target: "deposit-bag",
      title: "Put the bag straight into the safe",
      cue: "Carry it to the drop slot and set it in — nowhere else along the way.",
      why: "The bag goes straight into the safe's slot, not set down on a counter or a shelf along the way. Every second it spends anywhere else is a second it is not secured, in a room with someone who has no reason to be walking behind you.",
      drag: { to: "drop-safe-slot", radius: 0.4, missNote: "Not lined up with the drop slot. A bag set down beside the safe is a bag that is not in the safe." },
    },
    {
      id: "drop-log", kind: "select", target: "drop-log-sheet",
      title: "Log the drop",
      cue: "Time, amount, and both sets of initials.",
      why: "Time, amount, and both sets of initials in the drop log turn 'we made a drop' into a record the manager, the bank reconciliation, and — if it is ever needed — an investigator can all check against each other.",
    },
    {
      id: "comply", kind: "hold", target: "hands-up", seconds: 4,
      title: "A demand for the till — comply",
      cue: "Hands visible, open the drawer, hand it over. Hold steady.",
      why: "Nothing behind this counter is worth a life, and the till is insured — every dollar in it replaceable in a way a bartender's or a customer's safety is not. Compliance is fast, it is quiet, and it ends the encounter sooner than anything else that has ever been tried instead.",
      holdBreakNote: "You pulled back mid-hand-over. A hesitation here reads as resistance to someone who is already keyed up — keep it slow, visible and steady until the till is in their hands.",
    },
    {
      id: "no-chase", kind: "select", target: "watch-exit",
      title: "Watch them leave — do not follow",
      cue: "Note the direction, the build, the clothing. Stay behind the bar.",
      why: "Once the till leaves the counter the robbery is over, and a foot chase is a separate, voluntary decision to follow an armed stranger into a place with no witnesses and no backup. A description given standing still is worth more to police than one given from an ambulance.",
    },
    {
      id: "silent-alarm", kind: "select", target: "panic-button",
      title: "Silent alarm — once they're gone",
      cue: "Press it after the door closes behind them, not before.",
      why: "The alarm is pressed once they are gone, not while they are still in the room — a silent alarm that stops being silent because it is tripped mid-robbery can turn a compliant hand-over into an armed standoff nobody chose to have.",
    },
    {
      id: "lock-doors", kind: "turn", target: "front-deadbolt",
      title: "Lock the door behind them",
      cue: "Bolt the front door the moment they're clear of it.",
      why: "Locking the door the moment the robber is clear keeps the scene the way it was left — no new customer wandering in across a shoeprint or a dropped shell casing before police have had a chance to see either one.",
      turn: { turns: 1, axis: "y", label: "FRONT DOOR" },
    },
    {
      id: "call-911", kind: "select", target: "phone-911",
      title: "Call 911",
      cue: "Direction of travel, description, weapon if any — while it's fresh.",
      why: "Police need the description, the direction they left in, and the weapon if any while all three are still fresh in your head, not after the doors are swept and the register is quietly reopened for the next round of customers.",
    },
    {
      id: "preserve-scene", kind: "find", noHint: true,
      targets: ["no-touch-zone", "cctv-save"],
      itemNames: { "no-touch-zone": "keep the counter untouched", "cctv-save": "save the camera footage" },
      itemNotes: {
        "no-touch-zone": "Fingerprints and the counter surface are evidence, and every hand that touches it after the fact is a print police now have to rule out.",
        "cctv-save": "The DVR's own loop will overwrite tonight's footage in days unless it's pulled and saved before that happens.",
      },
      title: "Preserve the scene and the footage",
      cue: "Nobody touches the counter. Pull and save the camera footage before the loop overwrites it.",
      why: "Fingerprints, the counter surface, and the camera footage are the case, and every one of them degrades the longer people move through the space. The counter stays untouched and the footage is pulled and saved before the system's own loop erases it for good.",
    },
    {
      id: "violence-log", kind: "select", target: "violence-log-sheet",
      title: "File the Cal/OSHA workplace-violence log entry",
      cue: "Write it up while it's fresh — this is the record the plan gets reviewed against.",
      why: "Cal/OSHA's workplace violence prevention plan (8 CCR §3342, from SB 553) requires every incident like this one logged — not as paperwork after the fact, but as the record the next safety-committee review and the next OSHA inspection both draw on to change what happens before the next one.",
    },
  ],

  interrupts: [
    {
      id: "customer-watching",
      kind: "Exposed count",
      after: "count-down", delay: 3, seconds: 12,
      alert: "A regular has leaned right over the service rail and is watching you count the drawer, bill by bill.",
      cue: "Close it up, or finish the count where they can't see it.",
      target: "close-drawer",
      why: "A customer who has watched a full till count now knows roughly how much cash is in the building and about when it moves — closing the drawer, or finishing the count out of sight in the office, removes that information before it becomes anybody's plan.",
      missNote: "You kept counting in full view of the rail. The count itself came out fine; what left the building tonight was a stranger's read on how much cash was in your hands and roughly when it would be moving.",
      wrongNote: "It's the drawer. Close it, or take the count where the rail can't see it — that is the whole response here.",
    },
    {
      id: "back-door-propped",
      kind: "Unsecured door",
      after: "walk-escort", delay: 2, seconds: 11,
      alert: "Your colleague has wedged the back door open for a smoke break while you're mid-walk with the deposit still in your hands.",
      cue: "Shut and secure it before you take another step.",
      target: "back-door-shut",
      why: "A propped door during a cash move is an open entry point timed to the one moment the building's cash is actually exposed and moving. It gets shut immediately, the walk finishes, and the smoke break waits five more minutes.",
      missNote: "The back door stayed open for the rest of the walk. An unsecured entry point during a drop is exactly the kind of gap a robbery gets planned around, propped by accident or not.",
      wrongNote: "It's the back door. Shut and secure it — the walk to the safe can wait the three seconds that takes.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.5, TDR_ACCENT);

    // -------------------------------------------------------------- bar top
    // The bar's own back-bar, top and rail come from the shared "bar" interior
    // (see interiors.js); this station adds the till, the card terminal, the
    // tip-out, the deposit bag and the seating in front of them.
    const topY = 1.1;
    const barZ = -2.15;

    // Register and drawer, on the staff side of the top.
    const register = group(g, -2.2, 0, barZ);
    box(register, 0.34, 0.28, 0.26, 0, topY + 0.14, 0, 0x2b2f34, { rough: 0.5, metal: 0.3, finish: "painted", tile: 2 });
    const drawerFace = box(register, 0.3, 0.1, 0.05, 0, topY + 0.03, 0.14, 0x1b1e22, { rough: 0.55, metal: 0.4 });
    holoTag(register, "Drawer — counting", 0, topY + 0.42, 0, { css: "#d6455a", w: 0.4 });
    reg(hits, drawerFace, "till-drawer");
    const closePush = box(register, 0.28, 0.02, 0.2, 0, topY + 0.09, 0.16, 0x59636d, { rough: 0.5, metal: 0.4, cast: false });
    reg(hits, closePush, "close-drawer");
    const handsUp = box(register, 0.34, 0.02, 0.3, 0, topY + 0.16, 0, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, handsUp, "hands-up");
    const bat = cyl(register, 0.018, 0.014, 0.42, -0.22, topY - 0.16, 0, 0x6b4a2c, { rough: 0.7, seg: 8 });
    bat.rotation.z = 0.3;
    holoTag(register, "under the counter", -0.22, topY - 0.02, 0, { css: "#f0645b", w: 0.4 });
    reg(hits, bat, "reach-weapon");
    const panicBtn = ball(register, 0.02, 0.16, topY - 0.2, 0.02, 0xd8232a, { emissive: 0xd8232a, ei: 1.0, seg: 10 });
    reg(hits, panicBtn, "panic-button");

    // Witness call bell, along the top.
    const bell = group(g, 1.9, topY, barZ);
    cyl(bell, 0.05, 0.06, 0.05, 0, 0, 0, 0xdfc36a, { rough: 0.4, metal: 0.6, seg: 14 });
    ball(bell, 0.035, 0, 0.045, 0, 0xf2e2a0, { rough: 0.3, metal: 0.5, seg: 12 });
    holoTag(bell, "Page a witness", 0, 0.16, 0, { css: "#d6455a", w: 0.4 });
    reg(hits, bell, "second-counter");

    // Card terminal and the settlement dial.
    const cardTerm = instrument(g, -0.6, topY + 0.02, barZ, { ry: 0.2, idle: "READY", color: TDR_ACCENT });
    holoTag(cardTerm, "Card terminal", 0, 0.15, 0, { css: "#d6455a", w: 0.34 });
    reg(hits, cardTerm, "card-terminal");
    const settleDial = instrument(g, -0.9, topY + 0.02, barZ + 0.15, { ry: 0.2, idle: "-- $", color: TDR_ACCENT });
    holoTag(settleDial, "Batch settlement", 0, 0.15, 0, { css: "#d6455a", w: 0.38 });
    reg(hits, settleDial, "settlement-dial");

    // Tip-out envelope and sheet.
    const tipSpot = group(g, -0.05, topY, barZ);
    box(tipSpot, 0.16, 0.02, 0.1, 0, 0, 0, 0xe8ecef, { rough: 0.6 });
    holoTag(tipSpot, "Tip total", 0, 0.15, 0, { css: "#d6455a", w: 0.3 });
    reg(hits, tipSpot, "tip-record");
    const tipEnv = box(g, 0.16, 0.01, 0.11, 0.35, topY + 0.011, barZ, 0xefe6cf, { rough: 0.75 });
    holoTag(g, "Seal envelope", 0.35, topY + 0.16, barZ, { css: "#d6455a", w: 0.32 });
    reg(hits, tipEnv, "tip-seal");

    // Deposit bag and the torn decoy beside it.
    const depositBag = box(g, 0.24, 0.14, 0.16, 0.75, topY + 0.09, barZ, 0xdfe4e8, { rough: 0.6, finish: "painted", tile: 1 });
    holoTag(g, "Deposit bag", 0.75, topY + 0.26, barZ, { css: "#d6455a", w: 0.34 });
    reg(hits, depositBag, "deposit-bag");
    const tornBag = box(g, 0.2, 0.02, 0.15, 1.1, topY + 0.02, barZ + 0.2, 0xb9bfa9, { rough: 0.9 });
    tornBag.rotation.y = 0.4;
    holoTag(g, "torn — already open", 1.1, topY + 0.15, barZ + 0.2, { css: "#f0645b", w: 0.44 });
    reg(hits, tornBag, "torn-bag");

    // ------------------------------------------------------- back office nook
    const officeX = -3.3, officeZ = -3.1;
    const officeDesk = counter(g, 0.9, 0.55, officeX, officeZ, 0x4a4038, { height: 0.82, undershelf: false, ry: 0.5 });
    holoTag(officeDesk, "Back office", 0, 0.7, 0, { css: "#d6455a", w: 0.36 });

    const safeGroup = group(g, officeX - 0.75, 0, officeZ - 0.15, 0.5);
    box(safeGroup, 0.5, 0.6, 0.44, 0, 0.3, 0, 0x2b3138, { rough: 0.5, metal: 0.4, finish: "brushed", tile: 2 });
    const slot = box(safeGroup, 0.26, 0.03, 0.05, 0, 0.5, 0.22, 0x0e1114, { rough: 0.7, cast: false });
    holoTag(safeGroup, "Drop safe slot", 0, 0.68, 0.22, { css: "#d6455a", w: 0.36 });
    reg(hits, slot, "drop-safe-slot");
    lockTag(safeGroup, -0.16, 0.16, 0.22, { color: TDR_ACCENT });

    const dropLog = holoPanel(g, 0.4, 0.3, officeX + 0.25, 1.15, officeZ - 0.35, (cx, w, h) => {
      cx.fillStyle = "rgba(24,10,12,0.9)"; cx.fillRect(0, 0, w, h);
      cx.fillStyle = "#d6455a"; cx.fillRect(0, 0, w, 4);
      cx.fillStyle = "#fbe1e5";
      cx.font = `600 ${Math.round(h * 0.16)}px 'Barlow Condensed', Arial, sans-serif`;
      cx.textAlign = "center"; cx.textBaseline = "middle";
      cx.fillText("DROP LOG", w / 2, h * 0.28);
      cx.font = `${Math.round(h * 0.11)}px Arial, sans-serif`;
      cx.fillText("Time · amount · initials ×2", w / 2, h * 0.62);
    }, { ry: 0.5, accent: TDR_ACCENT });
    reg(hits, dropLog, "drop-log-sheet");

    const violenceLog = holoPanel(g, 0.4, 0.3, officeX - 0.25, 1.15, officeZ - 0.35, (cx, w, h) => {
      cx.fillStyle = "rgba(24,10,12,0.9)"; cx.fillRect(0, 0, w, h);
      cx.fillStyle = "#d6455a"; cx.fillRect(0, 0, w, 4);
      cx.fillStyle = "#fbe1e5";
      cx.font = `600 ${Math.round(h * 0.14)}px 'Barlow Condensed', Arial, sans-serif`;
      cx.textAlign = "center"; cx.textBaseline = "middle";
      cx.fillText("VIOLENCE LOG", w / 2, h * 0.28);
      cx.font = `${Math.round(h * 0.1)}px Arial, sans-serif`;
      cx.fillText("8 CCR §3342 incident entry", w / 2, h * 0.62);
    }, { ry: 0.5, accent: TDR_ACCENT });
    reg(hits, violenceLog, "violence-log-sheet");

    const phone = box(g, 0.09, 0.15, 0.04, officeX + 0.5, 0.95, officeZ - 0.4, 0x2b3138, { rough: 0.5 });
    holoTag(g, "Call 911", officeX + 0.5, 1.08, officeZ - 0.4, { css: "#d6455a", w: 0.3 });
    reg(hits, phone, "phone-911");

    const escortWalk = box(g, 0.4, 0.01, 1.1, officeX + 1.1, 0.011, officeZ + 0.4, TDR_ACCENT,
      { emissive: TDR_ACCENT, ei: 0.5, opacity: 0.4, transparent: true, cast: false, receive: false });
    holoTag(g, "Escort together", officeX + 1.1, 0.2, officeZ + 0.4, { css: "#d6455a", w: 0.4 });
    reg(hits, escortWalk, "escort-walk");

    // Back door — the interrupt's control — and the solo hallway shortcut.
    const backDoor = group(g, officeX - 0.5, 0, officeZ - 1.2, 0.5);
    box(backDoor, 0.08, 1.9, 0.9, 0, 0.95, 0, 0x59433a, { rough: 0.6 });
    const doorSlab = box(backDoor, 0.06, 1.8, 0.82, 0.02, 0.95, 0, 0x6b5445, { rough: 0.55 });
    holoTag(backDoor, "Back door", 0, 1.85, 0, { css: "#d6455a", w: 0.3 });
    reg(hits, doorSlab, "back-door-shut");
    const hallway = box(g, 0.5, 0.02, 0.9, officeX - 1.4, 0.011, officeZ - 0.4, 0x2a3138, { rough: 0.8, cast: false });
    holoTag(g, "back hallway — alone?", officeX - 1.4, 0.2, officeZ - 0.4, { css: "#f0645b", w: 0.5 });
    reg(hits, hallway, "solo-carry");

    // ------------------------------------------------------------ front door
    const frontX = 2.6, frontZ = 1.8;
    const frontDoor = group(g, frontX, 0, frontZ, -0.6);
    const doorPanel = box(frontDoor, 0.08, 2.0, 0.95, 0, 1.0, 0, 0x2b3138, { rough: 0.5, metal: 0.2 });
    holoTag(frontDoor, "Front door", 0, 2.05, 0, { css: "#d6455a", w: 0.32 });
    reg(hits, doorPanel, "chase-door");
    const deadbolt = group(frontDoor, 0.05, 1.05, 0.3);
    cyl(deadbolt, 0.03, 0.03, 0.03, 0, 0, 0, 0xdfe4e8, { rough: 0.3, metal: 0.8, seg: 12 });
    box(deadbolt, 0.09, 0.02, 0.02, 0, 0.02, 0.02, 0x8b929a, { rough: 0.4, metal: 0.7 });
    holoTag(frontDoor, "Deadbolt", 0.05, 1.24, 0.3, { css: "#d6455a", w: 0.28 });
    reg(hits, deadbolt, "front-deadbolt");
    const peep = ball(frontDoor, 0.02, 0, 1.5, 0.02, 0xdfe4e8, { rough: 0.3, metal: 0.6, seg: 10 });
    holoTag(frontDoor, "Watch them leave", 0, 1.66, 0.02, { css: "#d6455a", w: 0.44 });
    reg(hits, peep, "watch-exit");

    // Chalk-line marker and the camera, for the scene-preservation walk.
    const chalkline = decal(g, 0.5, 0.3, -1.6, topY + 0.011, -1.85,
      signFace("DO NOT TOUCH", { bg: "#1a0e10", accent: "#d6455a", scale: 0.5 }), { px: 256 });
    chalkline.rotation.x = -Math.PI / 2;
    reg(hits, chalkline, "no-touch-zone");
    const camera = group(g, 0, 2.3, -1.9, 0.4);
    box(camera, 0.14, 0.1, 0.2, 0, 0, 0, 0x1b1e22, { rough: 0.5, metal: 0.3 });
    cyl(camera, 0.03, 0.035, 0.05, 0, 0, 0.12, 0x0e1114, { rough: 0.4, seg: 12 }).rotation.x = Math.PI / 2;
    const camLamp = ball(camera, 0.012, 0.05, 0.05, 0.13, 0x59c97b, { emissive: 0x59c97b, ei: 1.4 });
    holoTag(camera, "Save footage", 0, 0.16, 0, { css: "#d6455a", w: 0.34 });
    reg(hits, camLamp, "cctv-save");

    // ------------------------------------------------------------ bar dressing
    // Taps, ice well, glass rack — the ordinary furniture every station in
    // this series shares, even where the procedure itself never touches it.
    for (let i = 0; i < 4; i++) {
      const tap = group(g, -3.4 + i * 0.35, topY, barZ - 0.3);
      cyl(tap, 0.012, 0.012, 0.26, 0, 0.13, 0, 0xb8b0a0, { rough: 0.3, metal: 0.8, seg: 10 });
      ball(tap, 0.03, 0, 0.27, 0, [0x2f6f4a, 0xb8862b, 0x6b3a2c, 0x8b929a][i], { rough: 0.4, metal: 0.3, seg: 10 });
    }
    const iceWell = box(g, 0.5, 0.32, 0.4, 3.0, topY - 0.05, barZ - 0.25, 0xdfe4e8, { rough: 0.35, metal: 0.4, finish: "brushed", tile: 2 });
    holoTag(g, "Ice well", 3.0, topY + 0.16, barZ - 0.25, { css: "#8fd1e6", w: 0.26 });
    void iceWell;
    const glassRack = group(g, 2.4, 1.9, barZ - 0.4);
    box(glassRack, 0.7, 0.02, 0.25, 0, 0, 0, 0x2b211c, { rough: 0.6, cast: false });
    for (let i = 0; i < 5; i++) {
      cyl(glassRack, 0.03, 0.02, 0.09, -0.28 + i * 0.14, -0.06, 0, 0xdfe9ec, { rough: 0.2, metal: 0.05, opacity: 0.5, transparent: true, seg: 10 });
    }

    // ------------------------------------------------------------------ crew
    const customers = [];
    customers.push(standingFigure(g, 1.4, -0.6, { ry: -2.6, cloth: 0x5a4a7a }));
    customers.push(standingFigure(g, 0.4, -0.35, { ry: -2.9, cloth: 0x2c5a3a }));
    customers.push(standingFigure(g, -0.6, -0.55, { ry: -2.4, cloth: 0x9a8a5a }));
    const barback = standingFigure(g, 0.3, -3.3, { ry: 0.3, cloth: 0x3c5a66, vest: TDR_ACCENT });
    const robber = standingFigure(g, -1.95, -1.25, { ry: 2.9, cloth: 0x1a1a1a, helmet: 0x1a1a1a });
    robber.visible = false;

    return {
      hits,
      footprint: 2.5,
      spawnLook: new THREE.Vector3(-0.7, 1.2, -2.1),

      onStepComplete(step) {
        if (step.id === "count-down") { drawerFace.position.z = 0.02; }
        if (step.id === "seal-bag") { tornBag.visible = false; }
        if (step.id === "carry-drop") {
          depositBag.position.set(officeX - 0.75, 0.5, officeZ - 0.15 + 0.22);
          depositBag.visible = false;
        }
        if (step.id === "drop-log") { robber.visible = true; }
        if (step.id === "silent-alarm") { robber.visible = false; }
        if (step.id === "lock-doors") { deadbolt.children[1].rotation.y = Math.PI / 2; }
      },

      onInterrupt(it) {
        if (it.id === "customer-watching") { customers[0].position.z += 0.35; }
        if (it.id === "back-door-propped") { doorSlab.rotation.y = -0.9; }
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "customer-watching") { customers[0].position.z -= 0.35; }
        if (it.id === "back-door-propped") { doorSlab.rotation.y = 0; }
      },

      onHazard() {},

      animate(t, dt, session) {
        camLamp.material.emissiveIntensity = 1.0 + Math.sin(t * 3) * 0.4;
        const gg = session?.gauge;
        if (gg && !gg.committed && session.step?.id === "card-recon") {
          repaint(cardTerm.userData.screen, signFace(`$${Math.round(400 + gg.t * 900)}`, {
            bg: "#1a0e10", accent: gg.t >= 0.44 && gg.t <= 0.6 ? "#59c97b" : "#f2c14b", fg: "#fbe1e5", scale: 0.55,
          }));
        }
        void dt;
      },
    };
  },
};
