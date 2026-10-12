import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, ball, group, decal, repaint, signFace, paperFace, mat, cabinet,
} from "../../../shared/kit.js";
import {
  CITY, stationPad, holoPanel, holoTag, instrument, standingFigure, valveWheel, cone, pipeRun,
  surfaceTexture, texturedMat, pavingFace, reg,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Isolation Ward Setup VR — Emergency Services, outbreak
// response. Turning an ordinary ward into an isolation area before the first
// suspected case arrives: a one-way flow from clean to contaminated, suspected
// and confirmed patients kept in separate bays, beds at the plan's spacing, a
// single room held at negative pressure for aerosol-generating procedures,
// hand hygiene at the point of care, three waste streams, signage at the door,
// equipment dedicated per patient, and a door that stays shut. Generic: the
// ward is for "the outbreak pathogen" and no transmission detail is assumed
// beyond what the posted precautions say.

const WIW_ACCENT = 0x6fc3a8;
const WIW_ALERT = 0xf0645b;

function wiwBoard(parent, w, h, x, y, z, title, lines, o = {}) {
  return holoPanel(parent, w, h, x, y, z, (cx, cw, ch) => {
    cx.fillStyle = "rgba(6,20,18,0.92)"; cx.fillRect(0, 0, cw, ch);
    cx.fillStyle = o.css ?? "#6fc3a8"; cx.fillRect(0, 0, cw, 6);
    cx.fillStyle = "#e3f6ef"; cx.textAlign = "left"; cx.textBaseline = "middle";
    cx.font = `600 ${Math.round(ch * 0.1)}px 'Barlow Condensed', Arial, sans-serif`;
    cx.fillText(title, cw * 0.05, ch * 0.13);
    cx.font = `${Math.round(ch * 0.07)}px Arial, sans-serif`; cx.fillStyle = "#c0e6d8";
    lines.forEach((l, i) => cx.fillText(l, cw * 0.05, ch * (0.3 + i * 0.1)));
  }, { ry: o.ry ?? 0, accent: o.accent ?? WIW_ACCENT });
}

function wiwBed(parent, x, z, ry = 0, sheet = 0xe8eef2) {
  const b = group(parent, x, 0, z, ry);
  box(b, 0.9, 0.08, 1.9, 0, 0.55, 0, CITY.steel, { rough: 0.4, metal: 0.6 });
  box(b, 0.84, 0.12, 1.84, 0, 0.65, 0, sheet, { rough: 0.8 });
  box(b, 0.9, 0.45, 0.05, 0, 0.8, -0.95, CITY.steel, { rough: 0.4, metal: 0.6 });
  for (const [lx, lz] of [[-0.4, -0.88], [0.4, -0.88], [-0.4, 0.88], [0.4, 0.88]]) cyl(b, 0.02, 0.02, 0.5, lx, 0.27, lz, CITY.darkSteel, { rough: 0.5, seg: 6 });
  return b;
}

export const SIM_WHO_ISOLATION_WARD_SETUP = {
  id: "who-isolation-ward-setup",
  index: "219",
  domain: "Emergency Services",
  trade: "Ward nurse and IPC lead — NNU/CNA nurses, SEIU and AFSCME public-health staff, and the humanitarian workforce deployed under IASC clusters",
  category: "Emergency Services",
  indoor: "clinic",
  weather: "clear",
  certification: "WHO infection prevention and control guidance for isolation areas — one-way flow, separation of suspected and confirmed patients, hand hygiene at the point of care; CDC isolation precautions for standard and transmission-based precautions, door signage, dedicated patient equipment and the negative-pressure room; OSHA 29 CFR 1910.1030 for sharps and infectious waste and 29 CFR 1910.134 for the respirators worn in the single room; WHO outbreak communication guidance for the families at the ward door; the Sphere Handbook's health standards and IASC cluster coordination for the partners who share the ward; worked by NNU/CNA nurses with SEIU and AFSCME public-health staff",
  name: "Isolation Ward Setup",
  title: simTitle("Isolation Ward Setup"),
  tagline: "An ordinary ward turned into an isolation area: one-way flow, suspected and confirmed kept apart, beds at spacing, a negative-pressure room, hand hygiene at every bed, three waste streams and a door that stays shut",
  accent: WIW_ACCENT,
  accentCss: "#6fc3a8",
  parSeconds: 320,
  footprint: 2.4,
  badge: { id: "ward-ready", name: "Ward Ready", note: "A ward that keeps suspected and confirmed apart, runs one way, holds its pressure and puts hand hygiene within reach of every bed" },

  supportLine: "your agency's staff welfare or staff counsellor service, or the peer-support contact named at your deployment briefing",

  game: system({
    name: "Ward Command",
    currency: "BARRIER",
    ranks: ["Ward Aide", "Ward Nurse", "Isolation Nurse", "IPC Lead", "Ward Command Certified"],
    badges: [
      { id: "one-way", name: "One Way", note: "The staff route walked in order, first time", test: AWARD.stepClean("flow-sequence") },
      { id: "apart", name: "Kept Apart", note: "No mixed cohort, no propped door, no shared thermometer, no guessed dilution", test: AWARD.safe },
      { id: "spaced", name: "Spaced", note: "Bed spacing set on the plan mark", test: AWARD.precise(0.7) },
    ],
    challenges: [
      { id: "clean-ward", name: "Clean Ward", note: "No corrections anywhere in the run", test: AWARD.clean },
      { id: "held-negative", name: "Held Negative", note: "Pressure watch held without a dropout", test: AWARD.unbroken },
      { id: "ward-fast", name: "Ward Fast", note: "Ward set inside 85% of par", test: AWARD.fast(0.85) },
    ],
  }),

  hazards: {
    "wiw-mixed-cohort": "You parked a confirmed patient's bed in the suspected bay to save a trip. Suspected patients are kept apart from confirmed ones because some of them do not have the disease at all, and a night beside a confirmed case is how a person who came in for the wrong reason leaves with the right one.",
    "wiw-chlorine-by-eye": "You topped up the chlorine bucket by eye. Chlorine solution is mixed from the dilution chart, measured, every time: too weak and it disinfects nothing while everyone believes it does, too strong and it burns skin and eyes and corrodes the equipment it is wiped on.",
    "wiw-propped-door": "You wedged the single-room door open to make the rounds easier. A negative-pressure room only works with its door shut; propped open, the air the room is designed to pull in and exhaust drifts out into the corridor instead.",
    "wiw-shared-thermometer": "You walked one thermometer bed to bed. Equipment that touches one patient is dedicated to that patient, or cleaned and disinfected between patients, because a shared instrument carries whatever the last bed left on it to the next one.",
  },

  lateNotes: {
    "wiw-exhaust-damper": "Open the exhaust once the room is prepared; there is nothing to watch on the monitor until the damper is set.",
    "wiw-spacing-tape": "Set bed spacing once the cohorts are separated — spacing a bed that is about to move is wasted effort.",
  },

  steps: [
    {
      id: "floor-plan", kind: "select", target: "wiw-floor-plan",
      title: "Read the isolation floor plan",
      cue: "Read the plan: where the clean area, donning, patient bays, doffing and exit sit, and which way people move through them.",
      why: "An isolation area is designed around one rule — people and materials move from clean to contaminated and never back the same way. Reading the plan before touching a bed is what makes every later choice fit that flow, rather than building a tidy-looking ward in which the only way out of the patient bay is back through the clean store.",
    },
    {
      id: "flow-sequence", kind: "sequence",
      targets: ["wiw-zone-clean", "wiw-zone-donning", "wiw-zone-patient", "wiw-zone-doffing"],
      itemNames: { "wiw-zone-clean": "clean area", "wiw-zone-donning": "donning", "wiw-zone-patient": "patient bays", "wiw-zone-doffing": "doffing and exit" },
      title: "Walk the staff route one way",
      cue: "Mark the route in the order staff will walk it: clean area, donning, patient bays, doffing and out.",
      why: "The route is marked on the floor so nobody has to remember it on a night shift. WHO infection prevention and control guidance for isolation areas relies on a one-way flow because contamination follows people; a route that doubles back puts a worker straight out of a patient bay beside colleagues who are still gowning up.",
      outOfOrderNote: "Clean, donning, patient bays, doffing — the route runs one way, from clean to contaminated and out.",
    },
    {
      id: "cohort", kind: "drag", target: "wiw-suspected-bed",
      title: "Separate suspected from confirmed",
      cue: "Move the bed tagged SUSPECTED out of the confirmed bay and into the suspected bay.",
      why: "A suspected case is a person who meets the clinical definition but has no laboratory result, and some of them will turn out not to have the disease. Keeping them apart from confirmed patients until the result is back is the only way to avoid exposing someone in the ward itself, which is the one place they came to be kept safe.",
      drag: { to: "wiw-suspected-bay", radius: 0.6, missNote: "Not in the suspected bay. A suspected patient stays out of the confirmed bay until the lab says otherwise." },
    },
    {
      id: "bed-spacing", kind: "gauge", target: "wiw-spacing-tape",
      title: "Set bed spacing to the plan",
      cue: "Run the tape between beds and commit when the gap sits on the plan's mark.",
      why: "Space between beds is what lets staff work at one bedside without brushing the next patient, and what keeps droplets from one bed landing on another. The plan's mark is set for this ward by the IPC lead; a bed pushed closer to fit one more in takes that margin away from every patient in the row, not just the new one.",
      gauge: { label: "BED GAP", speed: 0.6, green: [0.46, 0.58], readout: (t) => (t < 0.46 ? "short of the mark" : t > 0.58 ? "past it — into the aisle" : "on the plan mark"), missNote: "Not on the plan's mark. Run the tape again and commit where the gap matches the plan." },
    },
    {
      id: "damper", kind: "turn", target: "wiw-exhaust-damper",
      title: "Open the single room's exhaust",
      cue: "Turn the exhaust damper wheel until the single room's extract is fully open.",
      why: "The single room is set aside for aerosol-generating procedures, and CDC isolation precautions describe that room as held at negative pressure so air flows in from the corridor and out through the exhaust, not the other way. The damper sets that extract; with it closed, the room is just a room with a sign on the door.",
      turn: { turns: 1, axis: "z", label: "EXHAUST" },
    },
    {
      id: "pressure-watch", kind: "track", target: "wiw-pressure-monitor", seconds: 7,
      title: "Watch the room hold negative",
      cue: "Keep your eyes on the pressure monitor as the room settles, and stay in the band.",
      why: "A negative-pressure room is proved by its monitor, not by the damper position. Watching it settle — without doors opening, without a drift back toward neutral — is what tells you the room is ready before the first patient needing it arrives, instead of discovering the fault with a procedure already under way.",
      track: { start: 0.2, green: [0.4, 0.64], rise: 0.55, fall: 0.45, drift: 0.12, label: "PRESSURE", readout: (v) => (v < 0.4 ? "drifting neutral" : v > 0.64 ? "hunting" : "holding negative") },
      holdBreakNote: "The reading drifted out of the band. The room is not proven yet — bring it back and hold until it settles.",
    },
    {
      id: "hand-points", kind: "find", noHint: true,
      targets: ["wiw-empty-dispenser", "wiw-bed-no-rub"],
      itemNames: { "wiw-empty-dispenser": "empty dispenser", "wiw-bed-no-rub": "bed with no hand rub" },
      itemNotes: {
        "wiw-empty-dispenser": "The dispenser at the bay entrance is empty — the first thing every entering worker reaches for.",
        "wiw-bed-no-rub": "Bed three has no hand rub at the bedside at all; the nearest is two beds away.",
      },
      title: "Find the missing hand-hygiene points",
      cue: "Walk the bays and pick out every place where hand hygiene is not within reach.",
      why: "Hand hygiene happens when it is within reach at the moment it is needed — before touching a patient, after touching one and after touching their surroundings, as the WHO guidance sets out. A dispenser that is empty or two beds away is a moment that gets skipped on a busy shift, however well trained the staff.",
    },
    {
      id: "waste-points", kind: "sequence", anyOrder: true,
      targets: ["wiw-sharps-point", "wiw-infectious-bin", "wiw-general-bin"],
      itemNames: { "wiw-sharps-point": "sharps container", "wiw-infectious-bin": "infectious waste", "wiw-general-bin": "general waste" },
      title: "Place the three waste streams",
      cue: "Set a sharps container, an infectious-waste bin and a general bin at their marked points — any order.",
      why: "Waste sorted at the point of use stays sorted; waste sorted later is handled twice. A sharps container within reach of the bed is what stops a needle travelling across a room in a gloved hand, and a separate general stream keeps the infectious stream from overflowing with packaging — both are what OSHA 29 CFR 1910.1030 expects of a sharps and waste plan.",
    },
    {
      id: "signage", kind: "select", target: "wiw-door-sign",
      title: "Post the precautions at the door",
      cue: "Post the transmission-based precautions sign at the ward entrance: what to wear, and who may enter.",
      why: "CDC isolation precautions put the sign at the door because the door is the last place a person decides whether to walk in. A porter, a cleaner or a relative who does not know the ward has changed will read a sign they cannot miss, and will not read a memo pinned in the office.",
    },
    {
      id: "dedicate-kit", kind: "select", target: "wiw-dedicated-kit",
      title: "Dedicate equipment to each bed",
      cue: "Set a thermometer and blood-pressure cuff at each bed and label them to that bed.",
      why: "Every instrument walked from bed to bed is a route between patients. Dedicating the non-critical equipment each patient needs — or cleaning and disinfecting it every time it moves — takes that route away, and costs a few thermometers against the risk of carrying the pathogen along the row.",
    },
    {
      id: "anteroom-hold", kind: "hold", target: "wiw-anteroom-door", seconds: 4,
      title: "Hold the anteroom door until it latches",
      cue: "Hold the single room's anteroom door closed until it latches and the monitor settles.",
      why: "The anteroom is the buffer between the negative-pressure room and the corridor, and it only works if one door is shut before the other opens. Holding it until it latches, rather than letting it swing, is the difference between a room that holds its pressure through a shift and one that leaks every time somebody goes in.",
      holdBreakNote: "You let go before it latched. A door that has not latched is an open door as far as the air is concerned — hold it closed.",
    },
    {
      id: "crew-checkin", kind: "select", target: "wiw-crew-board",
      title: "Check in with the ward team",
      cue: "Before the first patient arrives, check in with the team on how everyone is doing and point them to staff care.",
      why: "The team about to staff an isolation ward is walking into long shifts in PPE, sick patients and worried families, often while worrying about their own. Checking in before the ward opens — and naming the staff welfare contact and the rota out loud — is how the team is still there in week three.",
    },
    {
      id: "closing-log", kind: "hold", target: "wiw-ward-log", seconds: 4,
      title: "Sign the ward readiness log",
      cue: "Hold the readiness log open and read back each item — flow, cohorts, pressure, hand hygiene, waste, signage — before you sign.",
      why: "The readiness log is what the incoming shift and the IPC lead rely on to know the ward was actually checked, not assumed. Reading it back item by item before signing is what catches the one line that was ticked because everything else was, and it is what an audit asks for when something goes wrong.",
      holdBreakNote: "You signed without reading the items back. Open it again and go through each one before signing.",
    },
  ],

  interrupts: [
    {
      id: "visitor-walks-in",
      kind: "Visitor at the bay",
      after: "pressure-watch", delay: 3, seconds: 13,
      alert: "A relative carrying a food parcel has come through the clean door and is heading for the patient bays, no PPE, looking for her brother.",
      cue: "Stop her at the visitor barrier — kindly, and before the bay.",
      target: "wiw-visitor-barrier",
      why: "Families bring food, news and comfort, and in many places they do real nursing care — which is why the barrier and the visitor point exist, so contact can happen without an unprotected person walking into the patient bays. Stopping her gently at the barrier, and taking the parcel there, keeps her safe and keeps her coming back.",
      missNote: "Nobody stopped her. She reached her brother's bed without PPE, sat on the edge of it and held his hand, and spent the next weeks on the contact list — frightened, and less willing to tell the tracing team who else she had seen.",
      wrongNote: "That will not stop her. Meet her at the visitor barrier before she reaches the bay.",
    },
    {
      id: "spill-by-bed",
      kind: "Spill",
      after: "anteroom-hold", delay: 2, seconds: 14,
      alert: "A body-fluid spill has spread across the floor beside bed two while you hold the door, and a cleaner is about to mop it with the general mop.",
      cue: "Get the spill kit to it — contain and disinfect, not mop.",
      target: "wiw-spill-kit",
      why: "A body-fluid spill is contained with absorbent, disinfected with solution mixed to strength, and picked up by someone in PPE — not pushed around the floor with a mop that will then be used in the corridor. The spill kit is kept at the bay for exactly this minute.",
      missNote: "The spill was mopped with the general mop, which went back to the corridor bucket. By the end of the shift it had been across the clean store and the staff room floor.",
      wrongNote: "Not that. The spill kit is on the wall by the bay — bring it to the spill.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root, 0, 0, -1.9);
    stationPad(g, 2.4, WIW_ACCENT);

    // ---------------------------------------------------------- floor and walls
    const floor = box(g, 6.0, 0.04, 4.8, 0, 0.02, 0, 0xffffff, { rough: 0.7 });
    floor.material = texturedMat(
      surfaceTexture((cx, w, h) => pavingFace(cx, w, h, { tiles: 10, base: "#c9d2cf", base2: "#bcc6c3", seam: "rgba(60,70,68,0.35)" }), { repeat: 4, px: 512 }),
      { rough: 0.6, metal: 0.02, color: 0xe6ecea },
    );
    box(g, 6.0, 2.6, 0.12, 0, 1.3, -2.4, 0xe3ebe8, { rough: 0.85 });
    // Partition between the bays.
    box(g, 0.08, 1.8, 2.2, 0, 0.9, -1.2, 0xc9d8d2, { rough: 0.6, opacity: 0.85, transparent: true });

    // Zone floor markings for the one-way route.
    const zones = [["wiw-zone-clean", -2.2, 1.6, 0x59c97b, "1 CLEAN"], ["wiw-zone-donning", -2.2, 0.4, 0xf2c14b, "2 DONNING"], ["wiw-zone-patient", -0.6, 0.4, 0xf0645b, "3 PATIENT BAYS"], ["wiw-zone-doffing", 1.6, 0.9, 0xe8903a, "4 DOFFING + EXIT"]];
    for (const [id, x, z, color, label] of zones) {
      const zn = group(g, x, 0.045, z);
      box(zn, 0.8, 0.008, 0.6, 0, 0, 0, color, { rough: 0.6, opacity: 0.5, transparent: true, cast: false });
      holoTag(zn, label, 0, 0.3, 0, { css: "#" + color.toString(16).padStart(6, "0"), w: 0.34 });
      reg(hits, zn, id);
    }
    for (const [x, z, ry] of [[-2.2, 1.0, 0], [-1.4, 0.4, -Math.PI / 2], [0.5, 0.65, -Math.PI / 2]]) {
      const ar = group(g, x, 0.046, z, ry);
      box(ar, 0.06, 0.004, 0.3, 0, 0, 0, 0xf4f6f5, { rough: 0.5, cast: false });
      box(ar, 0.14, 0.004, 0.06, 0, 0, -0.16, 0xf4f6f5, { rough: 0.5, cast: false });
    }

    // Floor plan board.
    const plan = wiwBoard(g, 0.9, 0.6, -1.5, 1.6, -2.3, "ISOLATION FLOOR PLAN", [
      "1 Clean  →  2 Donning  →  3 Patient bays", "3 Patient bays  →  4 Doffing  →  exit", "Suspected bay LEFT · Confirmed bay RIGHT",
      "Single room: negative pressure, door shut", "Bed gap: on the plan mark",
    ]);
    reg(hits, plan, "wiw-floor-plan");

    // ---------------------------------------------------------- bays
    const bayTagS = holoTag(g, "SUSPECTED BAY", -1.2, 1.95, -2.2, { css: "#f2c14b", w: 0.4 });
    void bayTagS;
    holoTag(g, "CONFIRMED BAY", 1.2, 1.95, -2.2, { css: "#f0645b", w: 0.4 });
    const bedS1 = wiwBed(g, -1.9, -1.35);
    void bedS1;
    const suspectedBay = box(g, 0.9, 0.02, 1.9, -0.8, 0.05, -1.35, 0xf2c14b, { rough: 0.6, opacity: 0.3, transparent: true, cast: false });
    reg(hits, suspectedBay, "wiw-suspected-bay");
    const bedC1 = wiwBed(g, 0.7, -1.35);
    void bedC1;
    const movable = wiwBed(g, 1.8, -1.35, 0, 0xf2e6b0);
    holoTag(movable, "SUSPECTED — no lab yet", 0, 1.15, 0, { css: "#f2c14b", w: 0.4 });
    reg(hits, movable, "wiw-suspected-bed");
    // The confirmed bed tempting a shortcut into the suspected bay.
    const confirmedTrolley = group(g, -0.3, 0, 0.55);
    box(confirmedTrolley, 0.5, 0.08, 0.9, 0, 0.6, 0, 0xf0c0b8, { rough: 0.8 });
    box(confirmedTrolley, 0.5, 0.06, 0.9, 0, 0.5, 0, CITY.steel, { rough: 0.4, metal: 0.6 });
    for (const [lx, lz] of [[-0.2, -0.4], [0.2, -0.4], [-0.2, 0.4], [0.2, 0.4]]) cyl(confirmedTrolley, 0.02, 0.02, 0.5, lx, 0.25, lz, CITY.darkSteel, { rough: 0.5, seg: 6 });
    holoTag(confirmedTrolley, "Confirmed — park in suspected bay?", 0, 0.95, 0, { css: "#f0645b", w: 0.5 });
    reg(hits, confirmedTrolley, "wiw-mixed-cohort");
    // Spacing tape between the two suspected-bay beds.
    const tape = instrument(g, -1.35, 0.72, -0.3, { idle: "gap", color: WIW_ACCENT, w: 0.14, d: 0.2 });
    holoTag(tape, "Spacing tape", 0, 0.14, 0, { css: "#6fc3a8", w: 0.24 });
    reg(hits, tape, "wiw-spacing-tape");

    // Bedside hand rub and dedicated kit.
    const rubS = box(g, 0.08, 0.16, 0.08, -1.4, 0.95, -2.25, 0xe8eef2, { rough: 0.4 });
    void rubS;
    const emptyDisp = group(g, -0.25, 0, -0.25);
    cyl(emptyDisp, 0.02, 0.02, 1.0, 0, 0.5, 0, CITY.darkSteel, { rough: 0.5, seg: 6 });
    box(emptyDisp, 0.1, 0.18, 0.08, 0, 1.08, 0, 0x9aa4ad, { rough: 0.6 });
    reg(hits, emptyDisp, "wiw-empty-dispenser");
    const noRub = box(g, 0.2, 0.2, 0.2, 1.3, 0.95, -0.3, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "Bed 3", 1.3, 1.15, -0.3, { css: "#6fc3a8", w: 0.16 });
    reg(hits, noRub, "wiw-bed-no-rub");
    const kit = group(g, 0.25, 0.78, -0.55);
    box(kit, 0.3, 0.02, 0.2, 0, 0, 0, 0xc9d0d4, { rough: 0.6 });
    cyl(kit, 0.01, 0.01, 0.12, -0.08, 0.02, 0, 0xe8eef2, { rough: 0.3, seg: 6 }).rotation.z = Math.PI / 2;
    box(kit, 0.1, 0.03, 0.08, 0.07, 0.02, 0, 0x3a5a8a, { rough: 0.8 });
    cyl(kit, 0.015, 0.015, 0.78, 0, -0.39, 0, CITY.steel, { rough: 0.4, metal: 0.7, seg: 6 });
    holoTag(kit, "Per-bed kit", 0, 0.14, 0, { css: "#6fc3a8", w: 0.22 });
    reg(hits, kit, "wiw-dedicated-kit");
    const sharedThermo = group(g, 2.35, 0.78, 0.1);
    box(sharedThermo, 0.26, 0.02, 0.18, 0, 0, 0, 0xc9d0d4, { rough: 0.6 });
    cyl(sharedThermo, 0.012, 0.012, 0.14, 0, 0.02, 0, 0xe8eef2, { rough: 0.3, seg: 6 }).rotation.z = Math.PI / 2;
    cyl(sharedThermo, 0.015, 0.015, 0.78, 0, -0.39, 0, CITY.steel, { rough: 0.4, metal: 0.7, seg: 6 });
    holoTag(sharedThermo, "One thermometer for all?", 0, 0.14, 0, { css: "#f0645b", w: 0.4 });
    reg(hits, sharedThermo, "wiw-shared-thermometer");

    // ---------------------------------------------------------- single room, anteroom, exhaust
    const room = group(g, 2.4, 0, -0.2);
    box(room, 0.06, 2.2, 1.2, -0.3, 1.1, 0, 0xd4e0dc, { rough: 0.6 });
    const anteDoor = box(room, 0.05, 2.0, 0.8, -0.34, 1.0, 0.0, 0xb8c4c8, { rough: 0.5, metal: 0.2 });
    decal(room, 0.02, 0.3, -0.37, 1.7, 0, signFace("NEG. PRESSURE", { bg: "#1a2a2a", accent: "#6fc3a8", scale: 0.4 }), { px: 128 }).rotation.y = -Math.PI / 2;
    holoTag(room, "Single room anteroom", -0.4, 2.15, 0, { css: "#6fc3a8", w: 0.36 });
    reg(hits, anteDoor, "wiw-anteroom-door");
    const wedge = box(room, 0.12, 0.05, 0.08, -0.45, 0.07, 0.5, 0xe8b02e, { rough: 0.7 });
    holoTag(room, "Wedge it open?", -0.5, 0.25, 0.5, { css: "#f0645b", w: 0.28 });
    reg(hits, wedge, "wiw-propped-door");
    pipeRun(g, [[2.0, 2.4, -2.3], [2.0, 2.4, -0.8], [2.5, 2.4, -0.8]], 0.08, 0xb9bec4);
    const damper = valveWheel(g, 2.0, 1.4, -2.2, { color: 0x6fc3a8, body: 0x3a5a52, r: 0.12 });
    cyl(g, 0.03, 0.03, 1.0, 2.0, 1.9, -2.25, 0xb9bec4, { rough: 0.4, metal: 0.6, seg: 8 });
    holoTag(g, "Exhaust damper", 2.0, 1.65, -2.15, { css: "#6fc3a8", w: 0.28 });
    reg(hits, damper, "wiw-exhaust-damper");
    const monitor = instrument(g, 1.3, 1.35, -2.3, { idle: "-- Pa", color: WIW_ACCENT, w: 0.18, d: 0.24 });
    monitor.rotation.x = Math.PI / 2;
    holoTag(monitor, "Pressure monitor", 0, 0.02, -0.18, { css: "#6fc3a8", w: 0.3 });
    reg(hits, monitor, "wiw-pressure-monitor");

    // ---------------------------------------------------------- waste points, door sign, visitor barrier
    const waste = [["wiw-sharps-point", -2.6, 0.9, 0xf2c14b, "SHARPS"], ["wiw-infectious-bin", 0.9, 1.5, 0xd8232a, "INFECTIOUS"], ["wiw-general-bin", -1.4, 1.9, 0x2b3236, "GENERAL"]];
    for (const [id, x, z, color, label] of waste) {
      const w = group(g, x, 0, z);
      box(w, 0.28, 0.45, 0.28, 0, 0.225, 0, color, { rough: 0.5 });
      decal(w, 0.22, 0.08, 0, 0.35, 0.145, signFace(label, { bg: "#141414", accent: "#fff", scale: 0.42 }), { px: 128 });
      reg(hits, w, id);
    }
    const doorSign = decal(g, 0.46, 0.34, -2.9, 1.5, 1.0, paperFace("PRECAUTIONS IN FORCE", ["PPE as posted before entry", "Hand hygiene in and out", "Staff and escorted visitors only"], { band: "#8a2a2a" }), { px: 256 });
    doorSign.rotation.y = Math.PI / 2;
    reg(hits, doorSign, "wiw-door-sign");
    const barrier = group(g, -1.2, 0, 2.2);
    for (const bx of [-0.6, 0.6]) cyl(barrier, 0.03, 0.04, 0.9, bx, 0.45, 0, 0x2b3236, { rough: 0.5, seg: 8 });
    const barrierTape = box(barrier, 1.2, 0.06, 0.02, 0, 0.85, 0, 0xf2c14b, { emissive: 0xf2c14b, ei: 0.4, rough: 0.5 });
    const barrierTapeRed = box(barrier, 1.2, 0.06, 0.02, 0, 0.7, 0, WIW_ALERT, { emissive: WIW_ALERT, ei: 1.4, rough: 0.5 });
    barrierTapeRed.visible = false;
    holoTag(barrier, "Visitor point", 0, 1.1, 0, { css: "#6fc3a8", w: 0.26 });
    reg(hits, barrierTape, "wiw-visitor-barrier");
    const visitor = standingFigure(g, -2.4, 2.5, { ry: Math.PI * 0.8, cloth: 0x8a5a7a, atStation: true });

    // Spill kit and the chlorine bucket.
    const spillKit = group(g, -2.85, 0, -0.6, Math.PI / 2);
    box(spillKit, 0.4, 0.5, 0.2, 0, 1.1, 0, 0xf2c14b, { rough: 0.5 });
    decal(spillKit, 0.32, 0.1, 0, 1.2, 0.105, signFace("SPILL KIT", { bg: "#1a1a1a", accent: "#f2c14b", scale: 0.45 }), { px: 128 });
    reg(hits, spillKit, "wiw-spill-kit");
    const spill = box(g, 0.6, 0.006, 0.4, -1.0, 0.045, -0.2, 0x8a6a3a, { rough: 0.1, opacity: 0.7, transparent: true, cast: false });
    spill.visible = false;
    const spillCone = cone(g, -0.6, -0.1, { color: 0xf2c14b });
    spillCone.visible = false;
    const bucket = group(g, 1.7, 0, 1.9);
    cyl(bucket, 0.16, 0.13, 0.32, 0, 0.16, 0, 0x3a7ab8, { rough: 0.5, seg: 14 });
    cyl(bucket, 0.14, 0.14, 0.01, 0, 0.3, 0, 0xd8e8a0, { rough: 0.1, opacity: 0.8, transparent: true, seg: 14 });
    box(bucket, 0.08, 0.2, 0.08, 0.3, 0.1, 0, 0xf2f2ee, { rough: 0.5 });
    holoTag(bucket, "Top up by eye?", 0, 0.5, 0, { css: "#f0645b", w: 0.28 });
    reg(hits, bucket, "wiw-chlorine-by-eye");

    // Boards.
    const crewBoard = wiwBoard(g, 0.6, 0.4, 2.8, 1.5, 1.3, "TEAM CHECK-IN", ["How is everyone doing?", "Staff welfare contact posted", "Rota and peer support"], { ry: -Math.PI / 2.4, accent: 0x7fd1c9, css: "#7fd1c9" });
    reg(hits, crewBoard, "wiw-crew-board");
    const wardLog = wiwBoard(g, 0.55, 0.4, 0.2, 1.6, -2.3, "READINESS LOG", ["Flow · cohorts · pressure", "Hand hygiene · waste", "Signage · kit · door"]);
    reg(hits, wardLog, "wiw-ward-log");

    // Staff.
    standingFigure(g, -2.3, -0.3, { ry: 0.8, cloth: 0x7fb8d8, vest: 0x7fb8d8, atStation: true });
    cabinet(g, 0.6, 1.8, 0.4, -2.65, 0.9, -1.9, 0xd7dce1, { doorColor: 0xc9d0d4 });
    for (let i = 0; i < 4; i++) cyl(g, 0.12, 0.12, 0.02, -1.5 + i * 1.0, 2.55, -0.8, 0xf4f6f5, { emissive: 0xf4f6f5, ei: 0.5, rough: 0.4, seg: 12 });

    let pressureOk = false;
    return {
      hits,
      footprint: 2.4,
      spawnLook: new THREE.Vector3(0, 1.1, -2.2),

      onStepComplete(step) {
        if (step.id === "cohort") { movable.position.set(-0.8, 0, -1.35); }
        if (step.id === "pressure-watch") { pressureOk = true; repaint(monitor.userData.screen, signFace("NEGATIVE", { bg: "#0d1c24", accent: "#59c97b", fg: "#eafcf9", scale: 0.5 })); }
        if (step.id === "hand-points") { emptyDisp.children[1].material = mat(0xe8eef2, { rough: 0.4 }); }
        if (step.id === "signage") repaint(doorSign, paperFace("PRECAUTIONS IN FORCE — POSTED", ["PPE as posted before entry", "Hand hygiene in and out", "Staff and escorted visitors only"], { band: "#2f7d4a" }));
        if (step.id === "closing-log") repaint(wardLog.userData.face, (cx, w, h) => {
          cx.fillStyle = "rgba(6,20,18,0.92)"; cx.fillRect(0, 0, w, h); cx.fillStyle = "#59c97b"; cx.fillRect(0, 0, w, 6);
          cx.fillStyle = "#eafcf1"; cx.font = `600 ${Math.round(h * 0.16)}px 'Barlow Condensed', Arial, sans-serif`;
          cx.textAlign = "center"; cx.textBaseline = "middle"; cx.fillText("WARD READY", w / 2, h / 2);
        });
      },

      onInterrupt(it) {
        if (it.id === "visitor-walks-in") { visitor.position.set(-0.9, 0, 1.5); barrierTapeRed.visible = true; }
        if (it.id === "spill-by-bed") { spill.visible = true; spillCone.visible = true; }
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "visitor-walks-in") { visitor.position.set(-2.4, 0, 2.5); barrierTapeRed.visible = false; }
        if (it.id === "spill-by-bed") { spill.visible = false; spillCone.position.set(-2.4, 0, -0.6); }
      },

      onHazard() {},

      animate(t, dt, session) {
        void dt; void t;
        const step = session?.step;
        if (session?.turn && step?.id === "damper") damper.rotation.z = session.turn.amount * Math.PI * 2;
        const gg = session?.gauge;
        if (gg && !gg.committed && step?.id === "bed-spacing") {
          const ok = gg.t >= 0.46 && gg.t <= 0.58;
          repaint(tape.userData.screen, signFace(ok ? "ON MARK" : gg.t < 0.46 ? "SHORT" : "WIDE", { bg: "#0d1c24", accent: ok ? "#59c97b" : "#f2c14b", fg: "#eafcf9", scale: 0.55 }));
        }
        const tr = session?.track;
        if (tr && step?.id === "pressure-watch" && !pressureOk) {
          const ok = tr.v >= 0.4 && tr.v <= 0.64;
          repaint(monitor.userData.screen, signFace(ok ? "HOLDING" : tr.v < 0.4 ? "NEUTRAL" : "HUNTING", { bg: "#0d1c24", accent: ok ? "#59c97b" : "#f0645b", fg: "#eafcf9", scale: 0.5 }));
        }
      },
    };
  },
};
