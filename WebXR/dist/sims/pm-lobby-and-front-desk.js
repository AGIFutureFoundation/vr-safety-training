import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, ball, torus, slab, group, decal, repaint, signFace, paperFace, mat,
} from "../../../shared/kit.js";
import {
  CITY, stationPad, holoPanel, holoTag, standingFigure, reg,
  surfaceTexture, texturedMat, pavingFace,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Lobby and Front Desk VR — Building Systems & Facilities,
// property management programme, zone one of twenty.
//
// The front desk of a working residential and mixed-use building, opened the
// way an SEIU desk attendant and porter crew actually open it: the pass-down
// read before anything else, the cameras, the callbox and the fire alarm
// annunciator proven live, the entrance door's closer read rather than
// assumed, the egress path walked, the entry mopped under a sign, a package
// logged, a building-wide notice read over the PA, a locked-out resident let
// back in only against the lease roster, the doors put on night mode and the
// shift closed in the building log. A generic building — no real property,
// resident or employer is named; the codes are named by body and number only
// where the registry carries them.

const PMLB_ACCENT = 0x6fa8dc;

export const SIM_PM_LOBBY_AND_FRONT_DESK = {
  id: "pm-lobby-and-front-desk",
  index: "301",
  domain: "Property Management",
  trade: "Front desk attendant and porter — SEIU building service members, with IUOE Local 39 stationary engineers on call and a CAM-credentialed property manager",
  category: "Building Systems & Facilities",
  indoor: "hotel",
  certification: "NFPA 101 (Life Safety Code) for the exit access, the self-closing stair door and the illuminated exit signs; NFPA 72 for the fire alarm annunciator the desk watches and the records an inspector asks for; OSHA 29 CFR 1910.22 for a lobby floor kept clean, dry and free of trip edges, 29 CFR 1910.36 for exit routes kept unobstructed, 29 CFR 1910.38 for the building's emergency action plan and its announcements, and 29 CFR 1910.1200 for the floor cleaner on the porter's cart; SEIU contract language for building service staff; the state landlord-tenant statute's written notice before a unit is entered and the Fair Housing Act's rule that every resident is served the same way; the apartment association's CAM credential for the manager the desk reports to.",
  supportLine: "the SEIU member assistance line or your employer's EAP — a desk that takes every complaint in the building carries some of it home",
  name: "Lobby and Front Desk",
  title: simTitle("Lobby and Front Desk"),
  tagline: "The desk opened in order: pass-down read, cameras, callbox and annunciator proven, the door closer read, the egress path walked, the entry mopped under a sign, a notice read over the PA, a lockout handled against the roster, and the shift closed in the building log",
  accent: PMLB_ACCENT,
  accentCss: "#6fa8dc",
  parSeconds: 270,
  footprint: 2.4,
  badge: { id: "desk-opened", name: "Desk Opened", note: "A lobby opened, watched and handed over with every exit clear and every resident served the same way" },

  game: system({
    name: "Front of House",
    currency: "SHIFTS",
    ranks: ["Relief Porter", "Desk Attendant", "Lead Attendant", "Lobby Supervisor", "Front of House Certified"],
    badges: [
      { id: "exits-clear", name: "Exits Clear", note: "No unsafe action anywhere in the shift", test: AWARD.safe },
      { id: "roster-first", name: "Roster First", note: "The lockout handled in order on the first try", test: AWARD.stepClean("lockout-key") },
      { id: "steady-mop", name: "Steady Mop", note: "Every timed task carried through without a break", test: AWARD.unbroken },
    ],
    challenges: [
      { id: "clean-desk", name: "Clean Desk", note: "No corrections anywhere in the shift", test: AWARD.clean },
      { id: "quick-open", name: "Quick Open", note: "Desk opened inside 80% of par", test: AWARD.fast(0.8) },
      { id: "eight-straight-desk", name: "Eight Straight", note: "Eight correct actions in a row", test: AWARD.streak(8) },
    ],
  }),

  hazards: {
    "stair-door-wedge": "You are wedging the stair door open so the movers can run boxes through. That door is a rated smoke barrier and NFPA 101 wants it self-closing and latched for exactly the minute when nobody is thinking about it: a fire on any floor fills a wedged stair with smoke, and the stair is the only way down for the residents above it.",
    "master-key-hook": "That is the master key, not the unit key. A master opens every door on the property, and handing it across the desk — to a resident, a mover or a contractor who asked nicely — is how a building ends up with a copy nobody can account for. The key log exists so that one door opens for one person with a name beside it.",
    "annunciator-silence": "You are pressing silence on the fire alarm annunciator without finding out what it is telling you. A trouble or supervisory signal is the system reporting that part of it cannot do its job; silencing it at the desk and carrying on turns a fault the monitoring company could act on into one nobody knows about until the night it matters.",
    "directory-screen": "You are reading a resident's unit number off the directory to a caller who asked for them by name. The desk never confirms who lives where — not to a delivery driver, a friend or an ex. For a resident who has moved to get away from someone, that one courtesy is the whole safety plan, and every resident is owed the same answer: we will call up and let them know you are here.",
  },

  lateNotes: {
    "entry-mode-key": "Night mode is the last thing the desk does. Switched now, residents coming home through the day would be held at a card reader they were not told about.",
    "building-log": "The building log closes the shift. It gets written once the shift's events have actually happened, not filled in ahead of them.",
    "crew-checkin-board": "The check-in is the very end — once the log is written and the desk is handed over.",
  },

  steps: [
    {
      id: "passdown", kind: "select", target: "passdown-log",
      title: "Read the overnight pass-down",
      cue: "Read what the overnight attendant left for you before you touch anything else at the desk.",
      why: "The pass-down is how the night's loose ends — a resident expecting a locksmith, a trouble light the engineer already knows about, a mover booked for ten — survive a shift change. A desk opened without it starts the day answering questions the last shift already answered, and misses the one thing they flagged because they could not fix it before they left.",
    },
    {
      id: "open-desk", kind: "sequence", anyOrder: false,
      targets: ["cctv-monitor", "callbox", "annunciator"],
      itemNames: { "cctv-monitor": "cameras live on every channel", "callbox": "entry callbox rings through", "annunciator": "fire alarm annunciator reads normal" },
      title: "Prove the desk's systems live",
      cue: "Check the camera channels, ring the entry callbox through to the desk, then read the fire alarm annunciator.",
      why: "Each of these fails quietly: a camera channel that froze at 3 a.m. still shows a lobby, a callbox with a dead line just rings for the visitor, and an annunciator with a lamp out reads normal. Proving each one at the start of the shift is the only way to know the desk can see, hear and report, rather than finding out during the one call that needed it.",
      outOfOrderNote: "Cameras, then callbox, then the annunciator. The annunciator is read last so that anything the first two checks set off is on it when you look.",
    },
    {
      id: "door-closer", kind: "gauge", target: "entry-door",
      title: "Read the entrance door's closing time",
      cue: "Open the entrance door fully, let it go, and commit when the closing time sits inside the band on the hardware schedule.",
      why: "A closer set too fast slams a heavy glass door on a resident with a walker or a stroller; set too slow, it never latches against the stack-effect draft that a tall building pulls through its lobby, and the door that is meant to be secure stands an inch open all night. The closing time is the number that decides both.",
      gauge: {
        label: "ENTRANCE DOOR — CLOSING TIME", speed: 0.55, green: [0.42, 0.6],
        readout: (t) => `${(1.5 + t * 8).toFixed(1)} s to latch`,
        missNote: "Outside the band. Too quick and it slams on someone slow; too slow and it hangs open against the draft. Read it again and commit inside the hardware schedule's range.",
      },
    },
    {
      id: "egress-walk", kind: "find", noHint: true,
      targets: ["exit-sign", "curled-mat", "package-pile"],
      itemNames: { "exit-sign": "the stair exit sign, dark", "curled-mat": "the entry mat, corner curled", "package-pile": "packages stacked in the exit path" },
      itemNotes: {
        "exit-sign": "The exit sign over the stair door has a lamp out. NFPA 101 wants the way out marked and lit, and in smoke a dark sign is a door nobody finds.",
        "curled-mat": "The entry mat's corner has curled up. It is the single most walked square metre in the building and a raised edge there is a trip for every resident with a bag in each hand.",
        "package-pile": "Last night's delivery is stacked between the lobby and the stair door. 29 CFR 1910.36 and NFPA 101 both want the exit access kept clear — a pile that is fine in daylight is a wall in the dark.",
      },
      title: "Walk the lobby's way out",
      cue: "Three things between the lobby and the way out are wrong this morning. Find them.",
      why: "The lobby is the exit discharge for every stair in the building, so its faults are everybody's faults. None of these three shows up on a panel or a camera — they are found only by walking the route a resident would take in the dark, with smoke overhead, and seeing it as they would.",
    },
    {
      id: "wet-floor-sign", kind: "drag", target: "wet-floor-sign",
      title: "Set the wet-floor sign at the entry",
      cue: "Carry the wet-floor sign from beside the desk and stand it at the entrance before any water touches the floor.",
      why: "Polished stone goes from grippy to glass with a film of water on it, and the entry is where residents walk in looking at their phones. OSHA's walking-working surfaces rule, 29 CFR 1910.22, asks for floors kept clean and dry; where a floor has to be wet for a few minutes, the sign going up first is what turns a hidden hazard into one people can see.",
      drag: { to: "entry-sign-socket", radius: 0.55, missNote: "Not at the entry yet — the sign has to stand where people walk in, not beside the desk where only you can see it." },
    },
    {
      id: "mop-entry", kind: "track", target: "mop-bucket", seconds: 6,
      title: "Mop the entry with a damp, not wet, mop",
      cue: "Wring the mop and work the entry in steady passes — damp enough to lift the grit, never dripping.",
      why: "A dripping mop leaves a film that stays slick long after the sign has gone back behind the desk, and a dry one just moves the grit around. The floor cleaner on the cart has its own SDS under 29 CFR 1910.1200 and a dilution the label sets; a damp pass at that dilution is what actually leaves a floor that dries in the minutes the sign is up.",
      track: {
        start: 0.2, green: [0.4, 0.62], rise: 0.45, fall: 0.4, drift: 0.1,
        label: "MOP — WETNESS",
        readout: (v) => (v < 0.4 ? "too dry — grit stays" : v > 0.62 ? "dripping — slick film" : "damp pass"),
      },
      holdBreakNote: "The mop drifted out of the damp band. Wring it back and finish the entry in even passes — a wet streak is the patch somebody slips on after the sign is gone.",
    },
    {
      id: "package-intake", kind: "select", target: "package-scanner",
      title: "Log the delivery into the package room",
      cue: "Scan the cleared packages into the package room so each resident gets their notice.",
      why: "A package that is scanned has an owner, a time and a shelf; one that is not is a box on the lobby floor that somebody will eventually carry off or trip over. Logging it the moment it is moved is also what lets the desk answer every resident the same way, instead of by who happens to ask loudest.",
    },
    {
      id: "pa-announce", kind: "hold", target: "pa-mic", seconds: 5,
      title: "Read the water shut-off notice over the PA",
      cue: "Key the PA and hold it through the whole notice: riser, floors affected, start and end time.",
      why: "The engineer is shutting the domestic water to one riser this afternoon, and the residents on it need to hear which floors and for how long. A notice that cuts out halfway is worse than none — half a building fills bathtubs it did not need to. The building's emergency action plan under 29 CFR 1910.38 runs over the same PA, which is why the desk keeps it honest.",
      holdBreakNote: "You let the key go mid-notice. Half an announcement tells some floors the water is going off and not when it comes back — key it again and read it through.",
    },
    {
      id: "lockout-key", kind: "sequence", anyOrder: false,
      targets: ["resident-id", "lease-roster", "key-cabinet"],
      itemNames: { "resident-id": "photo ID checked", "lease-roster": "name matched on the lease roster", "key-cabinet": "unit key issued and signed out" },
      title: "Let a locked-out resident back in",
      cue: "Check the resident's ID, match it to the lease roster, then issue the unit key and sign it out.",
      why: "A person who says they live in 7C and a person on the lease for 7C are not the same claim. Checking the roster first protects the resident whose door it is — an estranged partner is also a person who knows the unit number — and running the same three checks for everyone is what keeps the desk on the right side of the Fair Housing Act.",
      outOfOrderNote: "ID, roster, then key. A key that comes off the hook before the name is on the roster is a door already opened on somebody's word.",
    },
    {
      id: "night-mode", kind: "turn", target: "entry-mode-key",
      title: "Switch the entrance to night mode",
      cue: "Turn the entrance key switch to night: card and callbox only.",
      why: "After hours the lobby door stops being a door anyone can push and becomes one the desk or a resident's card has to open. Doing it at the scheduled time, with the key rather than a propped latch, is what keeps the building's security the same whichever attendant is on — and the key switch leaves the door free to open outward for anyone leaving.",
      turn: { turns: 0.5, axis: "z", label: "ENTRANCE MODE", readout: (t) => (t < 0.9 ? "DAY — FREE ENTRY" : "NIGHT — CARD ONLY") },
    },
    {
      id: "building-log", kind: "select", target: "building-log",
      title: "Close the shift in the building log",
      cue: "Write the shift into the building log: the exit sign and mat, the notice, the lockout, the complaint and the inspector's visit.",
      why: "The building log is the one record that follows the building rather than the attendant. The exit sign ticket, the resident let in and by whom, the complaint and the inspector's request all need to be findable by the next shift, the manager and — if anything goes wrong — anyone who later asks what the desk knew and when.",
    },
    {
      id: "crew-checkin", kind: "select", target: "crew-checkin-board",
      title: "Check in with the porter before handover",
      cue: "Ask the porter how the shift sat with them, and name the member assistance line before you hand over.",
      why: "A front desk absorbs every resident's worst day — the flood, the lockout, the neighbour dispute — and most of it is said to the person behind the counter. Two minutes between the attendant and the porter, with the SEIU member assistance line named out loud, is what keeps a hard shift from being carried home unspoken and turning up on the next one.",
    },
  ],

  interrupts: [
    {
      id: "tenant-complaint",
      kind: "Resident at the desk with a complaint",
      after: "mop-entry", delay: 3, seconds: 12,
      alert: "A resident from 4B comes to the desk, upset: water has been dripping through her bathroom ceiling since last night and nobody has called her back.",
      cue: "Stop mopping and take it properly — open a work order while she is standing there.",
      target: "work-order-terminal",
      why: "A leak through a ceiling is a habitability repair under the local housing code and very often the first sign of a failed pipe in the unit above. Logging it in front of the resident gives her a number, gives the engineer a location, and starts the clock that the building is actually measured against — which a promise to pass it on does not.",
      missNote: "The resident stood at the desk while you kept mopping, and left without a work order. The leak above 4B is still running into her ceiling, and there is now no record the building was ever told.",
      wrongNote: "That does not help her. Open a work order at the terminal — the leak needs a ticket and a number, not a nod.",
    },
    {
      id: "inspector-arrives",
      kind: "Inspector arrives",
      after: "pa-announce", delay: 2, seconds: 12,
      alert: "A fire prevention inspector walks in unannounced for the annual inspection and asks for the building's fire alarm and sprinkler test records.",
      cue: "Finish the notice, then hand over the life-safety binder — do not send them hunting.",
      target: "life-safety-binder",
      why: "NFPA 72 and NFPA 25 both expect inspection and testing records to be kept on site and produced on request. The binder behind the desk is the building's proof that its systems were tested when they were due; a desk that can put it in the inspector's hands in a minute tells them the rest of the building is run the same way.",
      missNote: "The inspector waited at the desk and nobody produced the records. An inspection that starts with the building unable to show its test history is written up for the records before anyone has looked at a single device.",
      wrongNote: "Not that. The inspector wants the fire alarm and sprinkler test records — the red life-safety binder on the wall behind the desk.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.4, PMLB_ACCENT);

    // ------------------------------------------------------------ lobby floor
    const stoneTex = surfaceTexture((cx, w, h) => pavingFace(cx, w, h, { tiles: 6, base: "#d9d1c3", base2: "#cbc2b2", seam: "rgba(70,58,44,0.28)" }), { repeat: 3, px: 384 });
    const stone = box(g, 6.4, 0.01, 6.0, 0, 0.005, -0.2, 0xd9d1c3, { rough: 0.4, cast: false });
    stone.material = texturedMat(stoneTex, { rough: 0.3, metal: 0.05, color: 0xefe8dc });
    stone.receiveShadow = true;
    // The room's own label names the wrong room; this building has its own.
    decal(g, 2.8, 0.52, 0, 2.62, -5.36, signFace("RESIDENTIAL LOBBY", { bg: "#101a24", accent: "#6fa8dc", fg: "#eaf2fa", scale: 0.46 }), { px: 512 });

    // ------------------------------------------------------------ front desk
    const desk = group(g, -1.0, 0, -1.3);
    box(desk, 2.3, 1.05, 0.62, 0, 0.525, 0, 0x6b4a32, { rough: 0.55 });
    box(desk, 2.42, 0.05, 0.74, 0, 1.075, 0, 0xe9e4da, { rough: 0.3, metal: 0.05 });
    box(desk, 2.3, 0.08, 0.02, 0, 0.05, 0.32, 0x2b2622, { rough: 0.6 });
    for (const x of [-0.8, 0, 0.8]) box(desk, 0.02, 0.9, 0.01, x, 0.52, 0.315, 0x8b6a4a, { rough: 0.5 });
    const chair = group(desk, 0.2, 0, -0.75);
    cyl(chair, 0.04, 0.04, 0.45, 0, 0.23, 0, 0x2b3138, { rough: 0.5, metal: 0.5, seg: 8 });
    box(chair, 0.46, 0.08, 0.46, 0, 0.5, 0, 0x22272d, { rough: 0.7 });
    box(chair, 0.46, 0.5, 0.06, 0, 0.8, -0.22, 0x22272d, { rough: 0.7 });

    // Camera monitor.
    const cctv = group(desk, -0.7, 1.1, -0.18);
    cyl(cctv, 0.02, 0.02, 0.16, 0, 0.08, 0, 0x2b3138, { rough: 0.5, seg: 8 });
    box(cctv, 0.56, 0.34, 0.04, 0, 0.32, 0, 0x14171b, { rough: 0.4 });
    const cctvFace = decal(cctv, 0.52, 0.3, 0, 0.32, 0.021, signFace("CAM 1  CAM 2\nCAM 3  CAM 4", { bg: "#0d1820", accent: "#6fa8dc", fg: "#9fc4e4", scale: 0.26 }), { glow: true, ei: 0.8, px: 320 });
    reg(hits, cctvFace, "cctv-monitor");

    // Work-order terminal.
    const wot = group(desk, 0.05, 1.1, -0.22);
    cyl(wot, 0.02, 0.02, 0.14, 0, 0.07, 0, 0x2b3138, { rough: 0.5, seg: 8 });
    box(wot, 0.44, 0.28, 0.04, 0, 0.28, 0, 0x14171b, { rough: 0.4 });
    const wotFace = decal(wot, 0.4, 0.24, 0, 0.28, 0.021, signFace("WORK ORDERS\n3 OPEN", { bg: "#101a24", accent: "#f2c14b", fg: "#e8f0f8", scale: 0.28 }), { glow: true, ei: 0.8, px: 320 });
    reg(hits, wotFace, "work-order-terminal");

    // Entry callbox handset.
    const callbox = group(desk, -0.3, 1.1, 0.05);
    box(callbox, 0.2, 0.05, 0.14, 0, 0.025, 0, 0x2b3138, { rough: 0.5 });
    const handset = cyl(callbox, 0.018, 0.018, 0.2, 0, 0.07, 0, 0x1b1e22, { rough: 0.5, seg: 8 });
    handset.rotation.z = Math.PI / 2;
    holoTag(callbox, "Entry callbox", 0, 0.18, 0, { css: "#6fa8dc", w: 0.3 });
    reg(hits, callbox, "callbox");

    // PA microphone on a gooseneck.
    const pa = group(desk, 0.5, 1.1, -0.05);
    cyl(pa, 0.06, 0.07, 0.03, 0, 0.015, 0, 0x2b3138, { rough: 0.5, seg: 12 });
    const neck = cyl(pa, 0.01, 0.01, 0.3, 0, 0.17, 0.03, 0x3c444c, { rough: 0.4, metal: 0.6, seg: 8 });
    neck.rotation.x = 0.35;
    ball(pa, 0.03, 0, 0.32, 0.09, 0x1b1e22, { rough: 0.6, seg: 10 });
    const paLamp = ball(pa, 0.012, 0.04, 0.035, 0.04, 0x3a1a18, { rough: 0.5, seg: 8 });
    holoTag(pa, "PA", 0, 0.45, 0.08, { css: "#6fa8dc", w: 0.16 });
    reg(hits, pa, "pa-mic");

    // Package scanner.
    const scanner = group(desk, 0.9, 1.1, 0.05);
    box(scanner, 0.12, 0.04, 0.18, 0, 0.02, 0, 0x2b3138, { rough: 0.5 });
    box(scanner, 0.05, 0.12, 0.04, 0, 0.09, -0.05, 0xf2c14b, { rough: 0.5 });
    holoTag(scanner, "Package scan", 0, 0.24, 0, { css: "#6fa8dc", w: 0.3 });
    reg(hits, scanner, "package-scanner");

    // Paper on the desk top: the pass-down and the lease roster.
    const passdown = decal(desk, 0.24, 0.3, -0.05, 1.103, 0.18,
      paperFace("PASS-DOWN", ["Mover 10:00 — freight car", "Exit sign lamp — ticket?", "4B called re: ceiling", "Riser B water off 14:00"], { band: "#2a4a6a" }), { px: 256 });
    passdown.rotation.x = -Math.PI / 2;
    reg(hits, passdown, "passdown-log");
    const roster = group(desk, -1.0, 1.1, 0.12);
    box(roster, 0.26, 0.05, 0.32, 0, 0.025, 0, 0x1f3a5a, { rough: 0.6 });
    holoTag(roster, "Lease roster", 0, 0.14, 0, { css: "#6fa8dc", w: 0.28 });
    reg(hits, roster, "lease-roster");
    const idCard = box(desk, 0.085, 0.004, 0.055, 0.55, 1.103, 0.28, 0xe7eef4, { rough: 0.4 });
    holoTag(desk, "Resident's ID", 0.55, 1.2, 0.28, { css: "#6fa8dc", w: 0.3 });
    reg(hits, idCard, "resident-id");

    // Directory tablet facing the counter — the trap.
    const directory = group(desk, -0.55, 1.1, 0.28);
    const tablet = box(directory, 0.22, 0.15, 0.015, 0, 0.1, 0, 0x14171b, { rough: 0.4 });
    tablet.rotation.x = -0.4;
    holoTag(directory, "Resident directory", 0, 0.25, 0, { css: "#f0645b", w: 0.36 });
    reg(hits, directory, "directory-screen");

    // ------------------------------------------------------------ feature wall, keys, binder
    const wall = group(g, -1.0, 0, -2.45);
    box(wall, 2.8, 2.15, 0.12, 0, 1.075, 0, 0x5a4535, { rough: 0.6 });
    for (let i = -6; i <= 6; i++) box(wall, 0.03, 2.05, 0.02, i * 0.2, 1.075, 0.07, 0x7a5a42, { rough: 0.5, cast: false });
    const keyCab = group(wall, -0.7, 1.35, 0.08);
    box(keyCab, 0.6, 0.62, 0.1, 0, 0, 0, 0x8b929a, { rough: 0.4, metal: 0.6 });
    const keyFace = decal(keyCab, 0.54, 0.56, 0, 0, 0.052,
      paperFace("KEY LOG", ["Unit keys by floor", "Sign out · sign in", "Master: manager only"], { band: "#3a4148" }), { px: 256 });
    reg(hits, keyFace, "key-cabinet");
    const masterHook = group(keyCab, 0.38, -0.1, 0.04);
    cyl(masterHook, 0.006, 0.006, 0.06, 0, 0, 0, CITY.steel, { rough: 0.3, metal: 0.9, seg: 6 }).rotation.x = Math.PI / 2;
    box(masterHook, 0.05, 0.07, 0.01, 0, -0.06, 0.03, 0xd8232a, { rough: 0.5 });
    holoTag(masterHook, "Master key", 0, 0.08, 0.03, { css: "#f0645b", w: 0.24 });
    reg(hits, masterHook, "master-key-hook");
    const binder = box(wall, 0.09, 0.32, 0.26, 0.55, 1.2, 0.2, 0xb8261e, { rough: 0.6 });
    box(wall, 0.5, 0.03, 0.3, 0.6, 1.03, 0.18, 0x3a2a20, { rough: 0.6 });
    holoTag(wall, "Life-safety binder", 0.55, 1.46, 0.2, { css: "#f0645b", w: 0.38 });
    reg(hits, binder, "life-safety-binder");
    decal(wall, 1.1, 0.26, 0, 1.92, 0.07, signFace("CONCIERGE", { bg: "#2a1f18", accent: "#6fa8dc", fg: "#f1e6d6", scale: 0.55 }), { px: 384 });

    // ------------------------------------------------------------ entrance
    const entry = group(g, 2.55, 0, 0.6, -Math.PI / 2);
    for (const sx of [-0.62, 0.62]) box(entry, 0.08, 2.3, 0.14, sx, 1.15, 0, 0x2b3138, { rough: 0.4, metal: 0.6 });
    box(entry, 1.32, 0.12, 0.14, 0, 2.34, 0, 0x2b3138, { rough: 0.4, metal: 0.6 });
    const leaf = group(entry, 0, 0, 0);
    box(leaf, 1.14, 2.2, 0.03, 0, 1.12, 0, 0xcfe3f0, { rough: 0.1, metal: 0.1, opacity: 0.4, transparent: true, cast: false });
    box(leaf, 0.9, 0.04, 0.05, 0, 1.02, -0.04, CITY.steel, { rough: 0.3, metal: 0.85 });
    box(leaf, 0.3, 0.06, 0.08, -0.3, 2.22, -0.06, 0x3c444c, { rough: 0.4, metal: 0.6 });
    decal(leaf, 0.3, 0.1, 0.25, 1.4, -0.02, signFace("PUSH", { bg: "#0d1820", accent: "#6fa8dc", scale: 0.6 }), { px: 128 });
    holoTag(entry, "Entrance door", 0, 2.55, 0, { css: "#6fa8dc", w: 0.34 });
    reg(hits, leaf, "entry-door");
    // Night-mode key switch beside the door.
    const keySw = group(g, 2.5, 1.25, 1.55, -Math.PI / 2);
    box(keySw, 0.14, 0.2, 0.03, 0, 0, 0, 0xc9d0d6, { rough: 0.4, metal: 0.6 });
    const keyTurn = group(keySw, 0, 0, 0.02);
    cyl(keyTurn, 0.025, 0.025, 0.02, 0, 0, 0, 0xd8b23a, { rough: 0.3, metal: 0.8, seg: 12 }).rotation.x = Math.PI / 2;
    box(keyTurn, 0.008, 0.05, 0.01, 0, 0.02, 0.012, 0x2b3138, { rough: 0.4 });
    keySw.userData.wheel = keyTurn;
    holoTag(keySw, "Entrance mode key", 0, 0.18, 0, { css: "#6fa8dc", w: 0.36 });
    reg(hits, keySw, "entry-mode-key");
    // Entry mat with a curled corner.
    box(g, 1.1, 0.012, 1.5, 1.75, 0.012, 0.6, 0x2e3338, { rough: 0.95, cast: false });
    const curl = box(g, 0.28, 0.012, 0.22, 1.28, 0.05, 1.22, 0x2e3338, { rough: 0.95 });
    curl.rotation.x = -0.45;
    reg(hits, curl, "curled-mat");
    const socket = box(g, 0.3, 0.1, 0.3, 1.55, 0.3, 1.45, 0xffffff, { opacity: 0.001, transparent: true, cast: false });
    hits["entry-sign-socket"] = socket;

    // Wet-floor sign, parked by the desk.
    const sign = group(g, 0.35, 0, -0.35);
    for (const s of [-1, 1]) {
      const p = box(sign, 0.3, 0.62, 0.012, 0, 0.3, s * 0.08, 0xf2c14b, { rough: 0.5 });
      p.rotation.x = s * 0.25;
    }
    decal(sign, 0.22, 0.2, 0, 0.36, 0.165, signFace("WET\nFLOOR", { bg: "#f2c14b", accent: "#1b1e22", fg: "#1b1e22", scale: 0.34 }), { px: 128 });
    reg(hits, sign, "wet-floor-sign");

    // Porter's mop bucket.
    const bucket = group(g, 1.0, 0, 1.55);
    box(bucket, 0.42, 0.32, 0.32, 0, 0.2, 0, 0xf2c14b, { rough: 0.5 });
    box(bucket, 0.18, 0.22, 0.3, 0.16, 0.44, 0, 0x3a4148, { rough: 0.5, metal: 0.3 });
    const mopHandle = cyl(bucket, 0.014, 0.014, 1.3, 0.05, 0.9, 0, 0x8b6a48, { rough: 0.6, seg: 8 });
    mopHandle.rotation.z = 0.12;
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) ball(bucket, 0.025, sx * 0.17, 0.03, sz * 0.13, 0x22262b, { rough: 0.7, seg: 8 });
    holoTag(bucket, "Mop and bucket", 0, 0.75, 0, { css: "#6fa8dc", w: 0.32 });
    reg(hits, bucket, "mop-bucket");
    const wetSheen = box(g, 1.2, 0.004, 1.2, 1.7, 0.024, 0.6, 0xbcd8ea, { rough: 0.05, metal: 0.2, opacity: 0.35, transparent: true, cast: false });
    wetSheen.visible = false;

    // ------------------------------------------------------------ stair door, exit sign, packages
    const stair = group(g, 1.9, 0, -2.55);
    for (const sx of [-0.52, 0.52]) box(stair, 0.08, 2.2, 0.16, sx, 1.1, 0, 0x5a626a, { rough: 0.5, metal: 0.4 });
    box(stair, 1.12, 0.1, 0.16, 0, 2.2, 0, 0x5a626a, { rough: 0.5, metal: 0.4 });
    box(stair, 0.96, 2.12, 0.05, 0, 1.06, 0.02, 0x8a3a30, { rough: 0.5, metal: 0.3 });
    box(stair, 0.3, 0.05, 0.06, 0.25, 2.05, 0.08, 0x3c444c, { rough: 0.4, metal: 0.6 });
    box(stair, 0.06, 0.14, 0.05, -0.38, 1.02, 0.06, CITY.steel, { rough: 0.3, metal: 0.85 });
    decal(stair, 0.34, 0.2, 0, 1.55, 0.05, signFace("STAIR 1\nFIRE DOOR", { bg: "#f4efe4", accent: "#b81410", fg: "#1b1e22", scale: 0.3 }), { px: 192 });
    const exitBox = box(stair, 0.4, 0.2, 0.08, 0, 2.45, 0.06, 0xdfe4e8, { rough: 0.4 });
    const exitFace = decal(stair, 0.36, 0.16, 0, 2.45, 0.105, signFace("EXIT", { bg: "#3a2a2a", accent: "#3a2a2a", fg: "#6a4040", scale: 0.7 }), { px: 192 });
    void exitBox;
    reg(hits, exitFace, "exit-sign");
    const wedge = box(stair, 0.12, 0.04, 0.16, 0.36, 0.02, 0.2, 0x8b6a48, { rough: 0.7 });
    wedge.rotation.x = 0.2;
    holoTag(stair, "Door wedge", 0.36, 0.18, 0.28, { css: "#f0645b", w: 0.24 });
    reg(hits, wedge, "stair-door-wedge");
    const pile = group(g, 1.35, 0, -1.75);
    box(pile, 0.5, 0.36, 0.4, 0, 0.18, 0, 0xb08a5a, { rough: 0.85 });
    box(pile, 0.4, 0.3, 0.34, 0.05, 0.51, 0.02, 0xa27c4e, { rough: 0.85 });
    box(pile, 0.34, 0.22, 0.3, -0.35, 0.11, 0.18, 0xc09a6a, { rough: 0.85 });
    box(pile, 0.3, 0.2, 0.24, 0.02, 0.76, -0.02, 0xb8925e, { rough: 0.85 });
    reg(hits, pile, "package-pile");

    // ------------------------------------------------------------ fire alarm annunciator on a column
    const column = group(g, 2.55, 0, -1.2);
    box(column, 0.42, 3.0, 0.42, 0, 1.5, 0, 0xe9e2d6, { rough: 0.8 });
    const ann = group(column, -0.23, 1.45, 0, -Math.PI / 2);
    box(ann, 0.36, 0.46, 0.05, 0, 0, 0, 0xb8261e, { rough: 0.5, metal: 0.2 });
    const annFace = decal(ann, 0.3, 0.2, 0, 0.08, 0.027, signFace("FIRE ALARM\nNORMAL", { bg: "#0d1c14", accent: "#59c97b", fg: "#c9f5d8", scale: 0.3 }), { glow: true, ei: 0.8, px: 256 });
    reg(hits, annFace, "annunciator");
    const annLeds = [];
    for (let i = 0; i < 3; i++) {
      annLeds.push(ball(ann, 0.014, -0.08 + i * 0.08, -0.08, 0.028, [0x59c97b, 0x3a3020, 0x3a2020][i], { rough: 0.4, seg: 8, emissive: i === 0 ? 0x59c97b : 0x000000, ei: 1.4 }));
    }
    const silence = box(ann, 0.08, 0.04, 0.02, 0, -0.17, 0.03, 0xf2c14b, { rough: 0.5 });
    holoTag(ann, "Silence", 0, -0.26, 0.03, { css: "#f0645b", w: 0.2 });
    reg(hits, silence, "annunciator-silence");

    // ------------------------------------------------------------ mailboxes, lounge, lights
    const mail = group(g, -2.75, 0, 0.5, Math.PI / 2);
    box(mail, 1.5, 1.6, 0.36, 0, 0.9, 0, 0x8b929a, { rough: 0.4, metal: 0.6 });
    decal(mail, 1.4, 1.5, 0, 0.9, 0.185, (cx, w, h) => {
      cx.fillStyle = "#9aa2aa"; cx.fillRect(0, 0, w, h);
      cx.strokeStyle = "#5a626a"; cx.lineWidth = 3;
      for (let r = 0; r < 8; r++) for (let c = 0; c < 6; c++) cx.strokeRect(c * w / 6 + 4, r * h / 8 + 4, w / 6 - 8, h / 8 - 8);
    }, { px: 256 });
    holoTag(mail, "Mailroom", 0, 1.85, 0.2, { css: "#6fa8dc", w: 0.3 });
    const sofa = group(g, -2.55, 0, 2.3, Math.PI / 2);
    box(sofa, 1.6, 0.42, 0.7, 0, 0.21, 0, 0x3d4a5a, { rough: 0.8 });
    box(sofa, 1.6, 0.5, 0.16, 0, 0.62, -0.28, 0x3d4a5a, { rough: 0.8 });
    for (const sx of [-0.78, 0.78]) box(sofa, 0.12, 0.3, 0.7, sx, 0.55, 0, 0x34404e, { rough: 0.8 });
    const table = group(g, -2.55, 0, 3.35);
    cyl(table, 0.35, 0.35, 0.03, 0, 0.42, 0, 0x2b2622, { rough: 0.3, metal: 0.2, seg: 20 });
    cyl(table, 0.04, 0.06, 0.4, 0, 0.2, 0, 0x2b2622, { rough: 0.3, metal: 0.4, seg: 10 });
    const plant = group(g, -2.6, 0, -1.9);
    cyl(plant, 0.2, 0.16, 0.45, 0, 0.23, 0, 0xd7d0c4, { rough: 0.6, seg: 14 });
    ball(plant, 0.35, 0, 0.8, 0, 0x3f6e3a, { rough: 0.85, seg: 10 });
    ball(plant, 0.22, 0.12, 1.1, 0.05, 0x4a7d44, { rough: 0.85, seg: 10 });
    const pendant = group(g, -0.3, 0, 0.6);
    cyl(pendant, 0.01, 0.01, 0.5, 0, 2.72, 0, 0x2b2622, { rough: 0.5, seg: 6, cast: false });
    torus(pendant, 0.45, 0.025, 0, 2.45, 0, 0xd8b23a, { rough: 0.3, metal: 0.8, seg: 8, seg2: 28, emissive: 0xffe6c0, ei: 0.4 }).rotation.x = Math.PI / 2;
    slab(g, 1.4, 0.01, 2.2, -2.3, 0.013, 2.6, 0x7a5a48, { radius: 0.05, rough: 0.95, cast: false });

    // ------------------------------------------------------------ boards
    const logBoard = holoPanel(g, 0.56, 0.38, -2.35, 1.6, -1.1, (cx, w, h) => {
      cx.fillStyle = "rgba(8,16,26,0.9)"; cx.fillRect(0, 0, w, h);
      cx.fillStyle = "#6fa8dc"; cx.fillRect(0, 0, w, 5);
      cx.fillStyle = "#eaf2fa";
      cx.font = `600 ${Math.round(h * 0.14)}px 'Barlow Condensed', Arial, sans-serif`;
      cx.textAlign = "center"; cx.textBaseline = "middle";
      cx.fillText("BUILDING LOG", w / 2, h * 0.26);
      cx.font = `${Math.round(h * 0.085)}px Arial, sans-serif`; cx.fillStyle = "#b8cfe4";
      ["Tickets · residents let in", "Complaints · visitors · inspectors", "Desk handover"].forEach((l, i) => cx.fillText(l, w / 2, h * (0.5 + i * 0.15)));
    }, { ry: 1.0, accent: PMLB_ACCENT });
    reg(hits, logBoard, "building-log");
    const crewBoard = holoPanel(g, 0.5, 0.34, -2.2, 1.6, 0.95, (cx, w, h) => {
      cx.fillStyle = "rgba(8,20,18,0.9)"; cx.fillRect(0, 0, w, h);
      cx.fillStyle = "#7fd1c9"; cx.fillRect(0, 0, w, 5);
      cx.fillStyle = "#e3f7ee";
      cx.font = `600 ${Math.round(h * 0.14)}px 'Barlow Condensed', Arial, sans-serif`;
      cx.textAlign = "center"; cx.textBaseline = "middle";
      cx.fillText("CREW CHECK-IN", w / 2, h * 0.3);
      cx.font = `${Math.round(h * 0.085)}px Arial, sans-serif`; cx.fillStyle = "#bfe8d6";
      cx.fillText("Attendant · porter", w / 2, h * 0.56);
      cx.fillText("SEIU member assistance line", w / 2, h * 0.74);
    }, { ry: 1.4, accent: 0x7fd1c9 });
    reg(hits, crewBoard, "crew-checkin-board");

    // ------------------------------------------------------------ people
    // The porter, working the mailroom end; the resident locked out, waiting
    // at the counter. The complaining resident and the inspector arrive with
    // their interruptions.
    const porter = standingFigure(g, -1.6, 0.35, { ry: 0.6, cloth: 0x2f4a6a, trousers: 0x22272d });
    const lockedOut = standingFigure(g, 0.1, 0.55, { ry: Math.PI + 0.3, cloth: 0x8a5a3a, trousers: 0x3a4148 });
    const tenant = standingFigure(g, -0.55, 0.9, { ry: Math.PI, cloth: 0x6a3a5a, trousers: 0x2b3138 });
    tenant.visible = false;
    const inspector = standingFigure(g, 1.95, 1.9, { ry: -2.4, cloth: 0x1f2f4a, trousers: 0x1b2230 });
    inspector.visible = false;

    let mopping = false;

    return {
      hits,
      footprint: 2.4,
      spawnLook: new THREE.Vector3(0.2, 1.1, -1.2),

      onStep(step) {
        if (step.id === "mop-entry") { mopping = true; wetSheen.visible = true; }
        if (step.id === "pa-announce") paLamp.material = mat(0xf0645b, { emissive: 0xf0645b, ei: 1.8 });
      },

      onStepComplete(step) {
        if (step.id === "egress-walk") {
          repaint(exitFace, signFace("EXIT", { bg: "#3a0c0c", accent: "#b81410", fg: "#ff4a3a", scale: 0.7 }));
          exitFace.material.emissive = new THREE.Color(0xff4a3a); exitFace.material.emissiveIntensity = 0.9;
          curl.rotation.x = 0; curl.position.y = 0.019;
          pile.position.set(-2.3, 0, -1.2);
        }
        if (step.id === "wet-floor-sign") sign.position.set(1.55, 0, 1.45);
        if (step.id === "mop-entry") { mopping = false; }
        if (step.id === "pa-announce") paLamp.material = mat(0x3a1a18, { rough: 0.5 });
        if (step.id === "lockout-key") lockedOut.visible = false;
        if (step.id === "night-mode") repaint(annFace, signFace("FIRE ALARM\nNORMAL · NIGHT", { bg: "#0d1c14", accent: "#59c97b", fg: "#c9f5d8", scale: 0.26 }));
        if (step.id === "building-log") { wetSheen.visible = false; sign.position.set(0.35, 0, -0.35); }
      },

      onInterrupt(it) {
        if (it.id === "tenant-complaint") tenant.visible = true;
        if (it.id === "inspector-arrives") inspector.visible = true;
      },
      onInterruptEnd(it) {
        if (it.id === "tenant-complaint") {
          tenant.visible = false;
          if (it.resolved === "answered") repaint(wotFace, signFace("WORK ORDERS\n4B LEAK — NEW", { bg: "#101a24", accent: "#59c97b", fg: "#e8f0f8", scale: 0.26 }));
        }
        if (it.id === "inspector-arrives" && it.resolved === "answered") {
          binder.visible = false;
        }
      },

      onHazard(hitId) {
        if (hitId === "annunciator-silence") annLeds[1].material = mat(0x3a3020, { rough: 0.4 });
      },

      animate(t) {
        if (mopping) mopHandle.rotation.z = 0.12 + Math.sin(t * 3) * 0.18;
        porter.userData.head.rotation.y = Math.sin(t * 0.35) * 0.3;
      },
    };
  },
};
