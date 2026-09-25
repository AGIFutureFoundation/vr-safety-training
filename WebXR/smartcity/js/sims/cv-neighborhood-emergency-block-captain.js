import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, ball, group, decal, repaint, signFace, paperFace, mat, seatedFigure, standingPerson,
} from "../../../shared/kit.js";
import {
  stationPad, holoTag, instrument, standingFigure, reg,
  surfaceTexture, texturedMat, pavingFace,
} from "../citykit.js";
import { eiLine } from "../../../shared/ei-guide.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Neighborhood Emergency Block Captain VR — Civic Leadership and
// Emotional Intelligence, deepening the programme.
//
// The morning after a strong earthquake, on one residential block. The
// learner is the block captain of a neighbourhood team trained in the way
// FEMA's Community Emergency Response Team (CERT) programme describes: check
// in, size up, rescuer safety first, utilities, light search and marking,
// simple triage and bleeding control, a light lift with cribbing, disaster
// psychology, and a report up the chain. The role is named as a body and
// described generically; no local programme is named because none is
// sourced in this repository.
//
// It is a civic station, not a firefighting one: the leadership in it is the
// block captain's — knowing the limits of a volunteer's role, keeping a
// roster of who needs help without broadcasting it, calming a frightened
// neighbour, refusing a mob's accusation, and handing off before exhaustion
// makes the captain the next casualty. The street and every person are
// invented; the leadership principles are those commonly taught in civic-
// leadership programmes, and the foundation whose principles the programme
// draws on is not sourced in this repository.

const EBC_ACCENT = 0xe0a040;
const EBC_CSS = "#e0a040";

export const SIM_CV_NEIGHBORHOOD_EMERGENCY_BLOCK_CAPTAIN = {
  id: "cv-neighborhood-emergency-block-captain",
  index: "320",
  domain: "Civic",
  trade: "Neighbourhood emergency block captain — CERT-trained volunteer",
  category: "Community Environmental Justice",
  weather: "overcast",
  certification: "FEMA's Community Emergency Response Team (CERT) programme, named as a body, for the volunteer's role and its limits: rescuer safety first, size-up, utility control, light search and marking, simple triage, bleeding control, cribbing, disaster psychology and team organisation; NIMS and ICS for checking in, reporting up one chain and keeping an activity log, as taught in the FEMA IS-100 and IS-700 courses; Red Cross shelter and first-aid practice for the neighbours sent onward; Psychological First Aid (NCTSN and the National Center for PTSD) for the frightened and the grieving; SAMHSA's trauma-informed principles for a neighbourhood after a disaster. The gas utility's rule that only the utility or a qualified professional restores gas is stated generically. No local neighbourhood programme is named because none is sourced in this repository. The leadership principles practised here are those commonly taught in civic-leadership programmes; the foundation whose principles the programme draws on is not sourced in this repository",
  name: "Neighborhood Emergency Block Captain",
  title: simTitle("Neighborhood Emergency Block Captain"),
  tagline: "The morning after the quake, one block and one captain: checked in, sized up, gas shut where it hisses, the damaged house marked, bleeding stopped, a leg freed an inch at a time, a frightened neighbour steadied — and the roster of who needs help kept off the group chat",
  accent: EBC_ACCENT,
  accentCss: EBC_CSS,
  parSeconds: 340,
  footprint: 2.4,
  badge: { id: "block-held", name: "Block Held", note: "A whole block worked inside the volunteer's role: nobody hurt helping, nobody exposed, nobody left alone" },

  // Named for the guide's end-of-run check-in card (shared/ei-guide.js).
  supportLine: "your team leader, the disaster mental-health volunteers at the shelter, or the teammate you trained with who will pick up the phone",

  game: system({
    name: "Block by Block",
    currency: "READY",
    ranks: ["Team Member", "Buddy Lead", "Block Captain", "Area Coordinator", "Team Mentor"],
    badges: [
      { id: "kitted-up", name: "Kitted Up", note: "Every piece of personal safety kit found first time", test: AWARD.stepClean("kit-up-first") },
      { id: "nobody-hurt-helping", name: "Nobody Hurt Helping", note: "No unsafe action anywhere on the block", test: AWARD.safe },
      { id: "hazards-named", name: "Hazards Named", note: "Every hazard on the block found first time", test: AWARD.stepClean("walk-the-block") },
    ],
    challenges: [
      { id: "clean-shift", name: "Clean Shift", note: "No corrections anywhere on the block", test: AWARD.clean },
      { id: "inch-at-a-time", name: "An Inch at a Time", note: "The lift set inside the band", test: AWARD.precise(0.7) },
      { id: "steady-hands", name: "Steady Hands", note: "The pressure and the calm both carried their full count", test: AWARD.unbroken },
    ],
  }),

  hazards: {
    "relight-the-gas": "You turned the neighbour's gas back on so she could make coffee. Once a meter is shut after an earthquake, only the gas utility or a qualified professional turns it back on, after checking the lines and relighting the pilots; a volunteer who restores it risks filling a cracked house with gas, and takes on a job the programme explicitly says is not theirs.",
    "post-needs-list": "You posted the roster of who lives alone, who uses oxygen and who cannot climb stairs to the public neighbourhood feed. That list is a map of the block's most vulnerable people and when their doors are unlocked; it goes to your team leader and nobody else, and posting it publicly exposes the very people it was made to protect.",
    "confront-the-stranger": "You joined the neighbours shouting at the man they say is looting. A block captain is not law enforcement, you do not know who he is or whose house he was at, and a crowd egged on by the one person in a vest can hurt someone in minutes. Observe, keep people back and report it up the chain.",
    "skip-rotation": "You waved off your relief and kept working into a fourteenth hour. Exhaustion makes volunteers miss hazards and make bad lifts, and a captain who collapses becomes a casualty the team has to rescue. The programme's own rule is rescuer safety first — that includes rest, water and handing off.",
  },

  lateNotes: {
    "needs-roster": "The roster goes to the team leader once your radio report is done — not before, and never to anyone else.",
    "block-log-board": "The activity log closes once the roster is handed off. There is nothing to record yet.",
  },

  steps: [
    {
      id: "kit-up-first", kind: "find", noHint: true,
      targets: ["kit-helmet", "kit-gloves", "kit-goggles", "kit-whistle-radio"],
      itemNames: {
        "kit-helmet": "your helmet",
        "kit-gloves": "work gloves over nitrile",
        "kit-goggles": "goggles and a dust mask",
        "kit-whistle-radio": "whistle and the team radio",
      },
      itemNotes: {
        "kit-helmet": "Aftershocks bring down whatever the first shock loosened. A helmet is the difference between a bruise and a head injury on a street of cracked chimneys.",
        "kit-gloves": "Nitrile against blood, work gloves over them against glass and splintered wood — the two hazards you will touch first.",
        "kit-goggles": "Plaster and brick dust are everywhere after a quake. Eyes and lungs go first if they are not covered.",
        "kit-whistle-radio": "The radio is how you check in and report; the whistle is how you are found if something comes down on you.",
      },
      decoyNotes: {
        "kit-camp-stove": "The camp stove is for later, at home. It is not personal safety kit, and it has no place near a block that may have gas leaks.",
      },
      title: "Put on your own safety kit before you step outside",
      cue: "Find every piece of personal safety kit before you leave the house.",
      why: "The first rule the programme teaches is rescuer safety: a volunteer who is hurt helping becomes one more person for an overstretched response to reach. Helmet, gloves over nitrile, eye and breathing protection, a whistle and the team radio are what let a block captain walk a damaged street and stay a helper rather than a casualty. It takes two minutes, and it is the two minutes most people skip.",
    },
    {
      id: "check-in-at-staging", kind: "select", target: "staging-checkin-card",
      title: "Check in at the team's staging point",
      cue: "Report to the staging table: your name, your buddy, your block, your skills. Take your assignment.",
      why: "A volunteer who self-deploys is invisible to the people coordinating the response: nobody knows where they are, what they are doing or when to worry about them. Checking in at staging, as the incident command system asks, puts the captain on the board with a buddy and an assignment, so their work is counted, their block is not searched twice, and someone comes looking if they do not check back.",
    },
    {
      id: "size-up-the-block", kind: "sequence",
      targets: ["size-gather-facts", "size-assess-damage", "size-consider-hazards", "size-decide-plan"],
      itemNames: {
        "size-gather-facts": "gather the facts: time, weather, who lives here",
        "size-assess-damage": "assess and report the damage you can see",
        "size-consider-hazards": "consider what could still go wrong",
        "size-decide-plan": "decide what you can safely do, and plan it",
      },
      title: "Size up the block before you act",
      cue: "Facts, damage, what could still go wrong, then decide and plan — in that order.",
      why: "The programme's size-up is a discipline against the instinct to run to the first person calling out. Gathering facts, assessing the damage and considering what could still happen — an aftershock, a gas leak, a wall that has not fallen yet — before deciding what a two-person team can safely do is how volunteers avoid walking into the second collapse. A plan made in a minute saves hours of undoing a bad start.",
      outOfOrderNote: "Facts, damage, hazards, then the plan. Deciding what to do before you have looked at what could still go wrong is how volunteers walk under a loose chimney.",
    },
    {
      id: "shut-the-gas", kind: "turn", target: "gas-valve",
      title: "Shut the gas at the meter where you smell it",
      cue: "You smell gas and hear a hiss at the corner house. Turn the meter valve a quarter turn, crosswise to the pipe.",
      turn: { turns: 0.25, axis: "z", label: "GAS OFF" },
      why: "A hissing meter on a shaken house is a fire waiting for a spark. The programme teaches volunteers to shut the gas at the meter when they smell gas or hear a leak — a quarter turn so the valve sits across the pipe — and to leave it off. Shutting it only where there is a sign of a leak matters too: every meter turned off without cause is a house without heat until the utility can reach it.",
    },
    {
      id: "walk-the-block", kind: "find", noHint: true,
      targets: ["hz-downed-line", "hz-leaning-chimney", "hz-cracked-wall"],
      itemNames: {
        "hz-downed-line": "a power line down across the sidewalk",
        "hz-leaning-chimney": "a chimney leaning over the porch",
        "hz-cracked-wall": "a diagonal crack through the corner house's wall",
      },
      itemNotes: {
        "hz-downed-line": "Treat every downed line as live. Keep everyone well back, and report it for the utility — you do not move it.",
        "hz-leaning-chimney": "What the first shock loosened, the next one drops. Nobody stands on that porch.",
        "hz-cracked-wall": "A diagonal crack through a load-bearing wall is a sign of serious structural damage. Volunteers do not enter a house like that.",
      },
      decoyNotes: {
        "hz-toppled-bin": "A toppled recycling bin is mess, not a hazard. Walk past it.",
      },
      title: "Walk the block and name every hazard",
      cue: "Mark every hazard on the street that keeps people back or keeps your team out.",
      why: "The block captain's most useful product is often a list of what nobody should go near: a line that must be treated as live, a chimney that will come down in the next aftershock, a house too damaged for volunteers to enter. Naming them early keeps neighbours from wandering into them and tells the professionals where they are needed. A volunteer who cannot tell mess from danger wastes both.",
    },
    {
      id: "mark-the-search", kind: "drag", target: "slash-marker",
      title: "Mark the door before you search",
      cue: "Before entering the lightly damaged house next door, carry the single-slash marker to the door.",
      drag: {
        to: "door-mark-spot", radius: 0.55,
        missNote: "Not on the door. The single slash goes up beside the entrance before you go in, so anyone who comes after knows a team is inside.",
      },
      why: "Search marking is how many teams on one street avoid searching the same house twice and missing the next one. A single slash beside the door says a team is inside; completed into a cross with the time, team, hazards and people found, it tells every searcher after you what was done. It also tells your own team where you are if you do not come back out.",
    },
    {
      id: "control-the-bleeding", kind: "hold", target: "pressure-point", seconds: 8,
      title: "Hold direct pressure on the bleeding",
      cue: "The neighbour inside has a deep cut on his forearm. Hold firm, direct pressure and do not let go.",
      why: "Severe bleeding is one of the things the programme's triage says to treat immediately, because it kills faster than almost anything else a volunteer will see. Firm, direct pressure with a dressing, held without peeking, is what stops it; lifting to check restarts it. Holding it is also a moment of contact for a frightened man on his own floor — a steady hand and a calm voice are treatment too.",
      holdBreakNote: "You lifted the pressure to look. The bleeding started again. Press back down and hold it.",
    },
    {
      id: "tag-the-casualty", kind: "select", target: "tag-immediate",
      title: "Triage him and tag him Immediate",
      cue: "Breathing fast, slow capillary refill, but he can follow your instructions. Tag him Immediate and report it.",
      why: "The programme's triage is fast and simple on purpose: breathing, circulation and mental status, then a tag. A man breathing over thirty times a minute or with a slow refill needs care first, however calm he sounds. Tagging him Immediate and reporting it puts him at the top of the list for the first ambulance or treatment area, rather than leaving him to be found by whoever passes next.",
    },
    {
      id: "lift-and-crib", kind: "gauge", target: "lift-meter",
      title: "Lift the fallen shelf an inch at a time and crib it",
      cue: "A bookcase has pinned a neighbour's leg. Commit a lift inside the band — just enough to free her, cribbed as you go.",
      gauge: {
        label: "LIFT", speed: 0.6, green: [0.3, 0.52],
        readout: (t) => `${(t * 5).toFixed(1)} in`,
        missNote: "Outside the band. Too little and she stays trapped; too much, uncribbed, and the load can shift and fall back on her. Lift an inch, crib an inch, only as far as you need.",
      },
      why: "Leverage and cribbing are how a two-person team frees someone from under a heavy object without the object falling back. The rule is to lift an inch and crib an inch, and only as far as needed to slide the person free. A heroic heave with nothing underneath can drop the load on the person and the rescuer alike. It is the most physical thing a volunteer does, and it is done slowly.",
    },
    {
      id: "calm-the-neighbour", kind: "track", target: "calm-meter", seconds: 8,
      title: "Steady a frightened neighbour on the kerb",
      cue: "Hold her inside the band: calm and present, not rushed away and not smothered with questions.",
      track: {
        start: 0.5, green: [0.3, 0.7], rise: 0.48, fall: 0.4, drift: 0.16, label: "CALM",
        readout: (v) => (v < 0.3 ? "left alone" : v > 0.7 ? "overwhelmed" : "steadier"),
      },
      why: "Disaster psychology is part of the programme because shock is universal after a quake. Psychological First Aid asks for calm, simple presence: sit at her level, tell her what is happening and what comes next, help her reach her family, and do not force her to talk about it. Rushing off leaves her alone with it; a stream of questions overwhelms her. The skill is holding her steady while the block keeps moving.",
      holdBreakNote: "She slipped away from you — left alone, or swamped with questions. Come back to her level, calmly, with one thing at a time.",
    },
    {
      id: "report-up-the-chain", kind: "sequence", anyOrder: true,
      targets: ["rpt-location", "rpt-casualties", "rpt-hazards", "rpt-needs"],
      itemNames: {
        "rpt-location": "where you are",
        "rpt-casualties": "casualties by tag",
        "rpt-hazards": "hazards found",
        "rpt-needs": "what you need",
      },
      title: "Radio a short report to your team leader",
      cue: "Location, casualties by tag, hazards found, and what you need — short and plain.",
      why: "A report is what turns one block captain's morning into information the whole response can use: where the Immediate casualty is, which lines are down, which house is too damaged to enter, and what the team needs. Keeping it short and plain on one chain to one team leader, as the incident command system teaches, is how dozens of teams on dozens of blocks get heard without flooding the channel.",
    },
    {
      id: "hand-off-the-roster", kind: "drag", target: "needs-roster",
      title: "Hand the roster of who needs help to the team leader only",
      cue: "Carry the block's needs roster to the team leader's clipboard. It goes nowhere else.",
      drag: {
        to: "leader-clipboard", radius: 0.55,
        missNote: "Not on the team leader's clipboard. The list of who lives alone and who uses medical equipment goes to the team leader — never to a group chat, a board or a stranger.",
      },
      why: "The roster the block captain keeps — who lives alone, who uses oxygen or a wheelchair, who cannot hear an alarm — is the most useful and the most dangerous paper on the street. In the right hands it gets help to the people who need it first; in the wrong ones it is a list of vulnerable homes. It goes to the team leader, by hand, and is not copied, photographed or posted.",
    },
    {
      id: "close-the-block-log", kind: "select", target: "block-log-board",
      title: "Close the block's activity log",
      cue: "Times, what was done, who was found and where they went, hazards reported — no medical details beyond the tag.",
      why: "The activity log is how the response reconstructs what happened on every block, and how the next shift picks up without re-searching houses. Writing times, actions, where each person was sent and which hazards were reported — but no medical detail beyond the triage tag — makes it useful to the people who follow and safe to leave on the staging table. It is the last thing done before handing off, not the first thing forgotten.",
    },
    {
      id: "crew-check-in", kind: "select", target: "crew-checkin-board",
      title: "Hand off to your relief and check in with your buddy",
      cue: "Water, rest, a handover to the next captain — and two minutes with your buddy about how the morning landed.",
      why: "Volunteers after a disaster see things they will carry: a neighbour bleeding on his floor, a woman trapped under her own furniture. Handing off to the relief on time, drinking water and sitting with your buddy for two minutes — what went well, what is sticking — is the programme's rescuer-safety rule applied to the mind. Knowing who to call if it stays with you is part of the kit.",
    },
  ],

  interrupts: [
    {
      id: "aftershock-chimney",
      kind: "Aftershock",
      after: "control-the-bleeding", delay: 3, seconds: 12,
      alert: "An aftershock rolls through the street. Bricks are coming off the leaning chimney — and two neighbours are standing on the porch right underneath it.",
      cue: "Keep one hand on the pressure and shout them off the porch, away from the chimney.",
      target: "clear-the-porch",
      why: "Aftershocks are expected, and the damage the first shock loosened is what they bring down. The captain named that chimney as a hazard minutes ago; now two people are under it. A loud, simple instruction — off the porch, into the street, away from the chimney — takes a second and does not require letting go of the casualty. Letting the moment pass is how a light-damage morning becomes a fatality.",
      missNote: "Nobody told them to move. A section of chimney came down on the porch steps, and one of the neighbours is now the block's second Immediate casualty — under a hazard you had already named.",
      wrongNote: "Pressing harder on the wound does not move the people under the chimney. Keep one hand where it is and shout them off the porch.",
    },
    {
      id: "pet-reentry",
      kind: "Re-entry into a damaged house",
      after: "calm-the-neighbour", delay: 3, seconds: 12,
      alert: "Her husband has broken away and is heading back into the badly cracked corner house to find their dog.",
      cue: "Stop him at the door, calmly and firmly — the house is not safe to enter — and promise to report the dog.",
      target: "stop-reentry-card",
      why: "People go back into damaged buildings for pets, photographs and medicine, and it is one of the common ways they are hurt after the shaking stops. The corner house has a diagonal crack through a load-bearing wall; nobody enters it, including volunteers. Stopping him with calm authority, telling him why, and promising to report the dog to the team — and to animal services when they are running — gives him something to do other than walk in.",
      missNote: "He went in. Part of the ceiling came down in the hallway, and the team now has a rescue inside a house they had marked as too dangerous for anyone — including themselves — to enter.",
      wrongNote: "Calming her does not stop him. He is at the door of a house nobody should enter — step in, firmly, and tell him why.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.4, EBC_ACCENT);

    // ------------------------------------------------------------ small helpers
    const bead = (x, y, z, id, label, o = {}) => {
      const m = group(g, x, 0, z);
      const b = ball(m, o.r ?? 0.03, 0, y, 0, o.color ?? EBC_ACCENT, { emissive: o.color ?? EBC_ACCENT, ei: 1.4, rough: 0.4, seg: 12 });
      holoTag(m, label, 0, y + 0.13, 0, { css: o.css ?? EBC_CSS, w: o.w ?? 0.44 });
      if (id) reg(hits, b, id);
      return b;
    };
    const card = (x, y, z, id, label, face, o = {}) => {
      const c = group(g, x, 0, z, o.ry ?? 0);
      const plate = decal(c, o.cw ?? 0.32, o.ch ?? 0.2, 0, y, 0,
        signFace(face, { bg: o.bg ?? "#1e1608", accent: o.accent ?? EBC_CSS, scale: 0.4 }), { px: 192, glow: true, ei: 0.8, transparent: true });
      holoTag(c, label, 0, y + 0.17, 0.002, { css: o.css ?? EBC_CSS, w: o.w ?? 0.48 });
      if (id) reg(hits, plate, id);
      return plate;
    };
    const stand = (x, z, ry = 0) => {
      const s = group(g, x, 0, z, ry);
      cyl(s, 0.19, 0.21, 0.03, 0, 0.015, 0, 0x2b2f35, { rough: 0.6, metal: 0.3, seg: 14 });
      cyl(s, 0.026, 0.026, 1.0, 0, 0.5, 0, 0x3a3f46, { rough: 0.5, metal: 0.5, seg: 10 });
      return s;
    };
    const lines = (cx, w, h, title, rows, o = {}) => {
      cx.fillStyle = o.bg ?? "rgba(24,18,8,0.92)"; cx.fillRect(0, 0, w, h);
      cx.fillStyle = o.accent ?? EBC_CSS; cx.fillRect(0, 0, w, 5);
      cx.fillStyle = "#fbf2e0";
      cx.font = `600 ${Math.round(h * 0.13)}px 'Barlow Condensed', Arial, sans-serif`;
      cx.textAlign = "center"; cx.textBaseline = "middle";
      cx.fillText(title, w / 2, h * 0.2);
      cx.font = `${Math.round(h * 0.075)}px Arial, sans-serif`;
      cx.fillStyle = o.ink ?? "#e6d6b6";
      rows.forEach((r, i) => cx.fillText(r, w / 2, h * (0.4 + i * 0.13)));
    };
    const board = (w, h, x, y, z, draw, o = {}) => {
      const b = group(g, x, y, z, o.ry ?? 0);
      box(b, w + 0.04, h + 0.04, 0.02, 0, 0, -0.012, o.accent ?? EBC_ACCENT, { rough: 0.5, emissive: o.accent ?? EBC_ACCENT, ei: 0.25 });
      b.userData.face = decal(b, w, h, 0, 0, 0, draw, { px: 512, glow: true, ei: 0.9 });
      return b;
    };
    const wrap = (cx, text, x, y, maxW, lh) => {
      let line = "", yy = y;
      for (const word of String(text).split(" ")) {
        const test = line ? `${line} ${word}` : word;
        if ((cx.measureText?.(test)?.width ?? test.length * lh * 0.45) > maxW && line) { cx.fillText(line, x, yy); line = word; yy += lh; }
        else line = test;
      }
      if (line) cx.fillText(line, x, yy);
    };

    // ------------------------------------------------------------ the street
    const roadTex = surfaceTexture((cx, w, h) => pavingFace(cx, w, h, {
      tiles: 3, base: "#3a3c40", base2: "#34363a", seam: "rgba(10,10,12,0.25)",
    }), { repeat: 3, px: 320 });
    const road = box(g, 8.4, 0.02, 2.6, 0, 0.01, 0.9, 0x3a3c40, { rough: 0.95, cast: false });
    road.material = texturedMat(roadTex, { rough: 0.95, metal: 0.02, color: 0x46484c });
    const walkTex = surfaceTexture((cx, w, h) => pavingFace(cx, w, h, {
      tiles: 8, base: "#a8a49c", base2: "#9c988f", seam: "rgba(50,46,40,0.4)",
    }), { repeat: 3, px: 320 });
    const walk = box(g, 8.4, 0.12, 1.6, 0, 0.06, -1.0, 0xa8a49c, { rough: 0.9, cast: false });
    walk.material = texturedMat(walkTex, { rough: 0.9, metal: 0.02, color: 0xb0aca4 });
    for (let i = -3; i <= 3; i++) box(g, 0.5, 0.012, 0.08, i * 1.2, 0.025, 0.9, 0xe8e0a0, { rough: 0.8 });

    // Two houses at the back: the lightly damaged one on the left, the badly
    // cracked corner house on the right.
    const house = (x, color, id) => {
      const h = group(g, x, 0, -2.9);
      const wall = box(h, 2.8, 2.6, 0.2, 0, 1.3, 0, color, { rough: 0.85 });
      box(h, 3.0, 0.12, 1.0, 0, 2.66, 0.35, 0x4a3a32, { rough: 0.8 });
      for (const wx of [-0.85, 0.85]) decal(h, 0.6, 0.5, wx, 1.7, 0.11, signFace("", { bg: "#6a8aa0", accent: "#e8e0d0", scale: 0.3 }), { px: 64 });
      box(h, 0.8, 0.14, 0.8, 0, 0.07, 0.5, 0x8a8278, { rough: 0.8 });
      if (id) reg(hits, wall, id);
      return h;
    };
    const left = house(-2.0, 0xb89a7a, null);
    const right = house(1.8, 0xa8b0b8, null);
    const doorLeft = box(left, 0.8, 1.9, 0.04, 0, 0.95, 0.12, 0x6a4a32, { rough: 0.6 });
    void doorLeft;
    const markSpot = box(left, 0.3, 0.3, 0.02, 0.6, 1.4, 0.12, 0x5a4a3a, { rough: 0.7, emissive: 0xe0a040, ei: 0.15 });
    holoTag(left, "Beside the door", 0.6, 1.72, 0.15, { css: "#59c97b", w: 0.3 });
    reg(hits, markSpot, "door-mark-spot");
    const doorRight = box(right, 0.8, 1.9, 0.04, -0.2, 0.95, 0.12, 0x5a4a3a, { rough: 0.6 });
    void doorRight;
    // The diagonal crack and the tag on the corner house.
    const crack = decal(right, 1.4, 1.2, 0.8, 1.2, 0.115, (cx, w, h) => {
      cx.clearRect?.(0, 0, w, h);
      cx.strokeStyle = "#2a2420"; cx.lineWidth = w * 0.025;
      cx.beginPath?.(); cx.moveTo?.(w * 0.1, h * 0.05); cx.lineTo?.(w * 0.4, h * 0.4); cx.lineTo?.(w * 0.35, h * 0.55); cx.lineTo?.(w * 0.85, h * 0.95); cx.stroke?.();
    }, { px: 256, transparent: true });
    reg(hits, crack, "hz-cracked-wall");
    decal(right, 0.34, 0.22, -0.2, 2.0, 0.13, signFace("DO NOT\nENTER", { bg: "#a02020", accent: "#fff", scale: 0.4 }), { px: 128, glow: true, ei: 0.5 });
    // The chimney on the corner house, leaning over its porch.
    const chimney = group(right, -1.0, 2.7, 0.3);
    const chimneyTop = box(chimney, 0.4, 1.0, 0.4, 0, 0.5, 0, 0x8a4a3a, { rough: 0.9 });
    chimney.rotation.z = 0.18;
    reg(hits, chimneyTop, "hz-leaning-chimney");
    const bricks = group(g, 0.8, 2.9, -2.2);
    for (let i = 0; i < 3; i++) box(bricks, 0.2, 0.07, 0.1, i * 0.12 - 0.12, i * 0.08, 0, 0x8a4a3a, { rough: 0.9 });

    // The gas meter on the corner house's side, with its valve.
    const meter = group(g, 3.35, 0, -2.2, -Math.PI / 2);
    box(meter, 0.3, 0.3, 0.18, 0, 0.9, 0, 0xb8bcc0, { rough: 0.4, metal: 0.6 });
    cyl(meter, 0.03, 0.03, 0.8, 0.0, 0.4, 0, 0x8a8e92, { rough: 0.4, metal: 0.7, seg: 8 });
    const valve = box(meter, 0.14, 0.03, 0.03, 0, 0.62, 0.05, 0xd8c040, { rough: 0.4, metal: 0.6 });
    holoTag(meter, "Gas meter — hissing", 0, 1.3, 0, { css: "#f2c14b", w: 0.4 });
    reg(hits, valve, "gas-valve");
    const wrench = box(g, 0.28, 0.03, 0.05, 3.1, 0.6, -1.8, 0xc8c8c8, { rough: 0.4, metal: 0.7 });
    void wrench;

    // The utility pole and the downed line.
    const pole = cyl(g, 0.12, 0.14, 4.2, -3.7, 2.1, -1.7, 0x5a4432, { rough: 0.9, seg: 10 });
    void pole;
    const line = cyl(g, 0.015, 0.015, 2.4, -3.0, 0.14, -0.9, 0x1a1a1a, { rough: 0.6, seg: 6 });
    line.rotation.z = Math.PI / 2 - 0.05; line.rotation.y = 0.5;
    holoTag(g, "Line down — treat as live", -2.9, 0.5, -0.8, { css: "#f0645b", w: 0.48 });
    reg(hits, line, "hz-downed-line");
    const bin = cyl(g, 0.2, 0.17, 0.6, 0.2, 0.3, -0.6, 0x2f5aa0, { rough: 0.6, seg: 12 });
    bin.rotation.z = Math.PI / 2;
    reg(hits, bin, "hz-toppled-bin");

    // ------------------------------------------------------------ the captain's kit and staging
    const kitTable = group(g, -1.5, 0, 1.6);
    box(kitTable, 1.1, 0.05, 0.55, 0, 0.72, 0, 0x5a5f66, { rough: 0.6, metal: 0.3 });
    for (const sx of [-0.5, 0.5]) cyl(kitTable, 0.02, 0.02, 0.7, sx, 0.35, 0, 0x3a3f46, { rough: 0.5, metal: 0.5, seg: 8 });
    const helmet = ball(kitTable, 0.13, -0.38, 0.84, 0, 0x2f7a3a, { rough: 0.4, seg: 14 });
    reg(hits, helmet, "kit-helmet");
    const gloves = box(kitTable, 0.18, 0.05, 0.12, -0.12, 0.77, 0.08, 0xd8a63a, { rough: 0.8 });
    reg(hits, gloves, "kit-gloves");
    const goggles = box(kitTable, 0.16, 0.05, 0.06, 0.1, 0.78, -0.08, 0x9ad0e8, { rough: 0.2, metal: 0.2 });
    reg(hits, goggles, "kit-goggles");
    const radio = box(kitTable, 0.06, 0.16, 0.04, 0.3, 0.83, 0.05, 0x1b1f24, { rough: 0.5 });
    reg(hits, radio, "kit-whistle-radio");
    const stove = cyl(kitTable, 0.08, 0.08, 0.1, 0.45, 0.8, -0.12, 0x6a6a6a, { rough: 0.5, metal: 0.5, seg: 10 });
    reg(hits, stove, "kit-camp-stove");
    holoTag(kitTable, "Your kit — before you go out", 0, 1.15, 0, { css: EBC_CSS, w: 0.5 });

    card(-3.2, 1.35, 1.2, "staging-checkin-card", "Check in at staging", "STAGING\nCHECK IN", { w: 0.36, ry: 0.8 });
    const leaderBoard = group(g, -3.4, 0, 2.0, 0.9);
    box(leaderBoard, 0.5, 0.05, 0.4, 0, 0.74, 0, 0x5a5f66, { rough: 0.6 });
    cyl(leaderBoard, 0.03, 0.03, 0.72, 0, 0.36, 0, 0x3a3f46, { rough: 0.5, metal: 0.5, seg: 8 });
    const clipboard = box(leaderBoard, 0.24, 0.02, 0.32, 0, 0.78, 0, 0x8a6a3a, { rough: 0.7 });
    holoTag(leaderBoard, "Team leader's clipboard", 0, 1.0, 0, { css: "#59c97b", w: 0.42 });
    reg(hits, clipboard, "leader-clipboard");

    // The size-up ladder and the report ladder.
    const size = group(g, -0.6, 0, 1.9, 0.1);
    cyl(size, 0.024, 0.024, 1.9, 0, 0.95, 0, 0x3a3f46, { rough: 0.5, metal: 0.5, seg: 10 });
    for (const [sid, label, y] of [
      ["size-gather-facts", "1 · Gather facts", 0.75], ["size-assess-damage", "2 · Assess damage", 1.05],
      ["size-consider-hazards", "3 · What could still go wrong", 1.35], ["size-decide-plan", "4 · Decide and plan", 1.65],
    ]) {
      const b = ball(size, 0.026, 0, y, 0, EBC_ACCENT, { emissive: EBC_ACCENT, ei: 1.5, seg: 12 });
      holoTag(size, label, 0.2, y, 0, { css: EBC_CSS, w: 0.5 });
      reg(hits, b, sid);
    }
    const rpt = group(g, 3.3, 0, 1.6, -1.0);
    cyl(rpt, 0.022, 0.022, 1.7, 0, 0.85, 0, 0x3a3f46, { rough: 0.5, metal: 0.5, seg: 10 });
    for (const [rid, label, y] of [
      ["rpt-location", "Where you are", 0.8], ["rpt-casualties", "Casualties by tag", 1.05],
      ["rpt-hazards", "Hazards found", 1.3], ["rpt-needs", "What you need", 1.55],
    ]) {
      const b = ball(rpt, 0.026, 0, y, 0, 0x7fc4d8, { emissive: 0x7fc4d8, ei: 1.4, seg: 12 });
      holoTag(rpt, label, 0.2, y, 0, { css: "#7fc4d8", w: 0.36 });
      reg(hits, b, rid);
    }

    // The search marker, waiting on the kit table's end.
    const markGrp = group(g, -0.8, 0.78, 1.6);
    const marker = decal(markGrp, 0.22, 0.22, 0, 0, 0, (cx, w, h) => {
      cx.fillStyle = "#1e1608"; cx.fillRect(0, 0, w, h);
      cx.strokeStyle = "#f28c2a"; cx.lineWidth = w * 0.1;
      cx.beginPath?.(); cx.moveTo?.(w * 0.2, h * 0.85); cx.lineTo?.(w * 0.8, h * 0.15); cx.stroke?.();
    }, { px: 128, glow: true, ei: 0.6 });
    marker.rotation.x = -Math.PI / 2.4;
    holoTag(markGrp, "Search marker — single slash", 0, 0.2, 0, { css: EBC_CSS, w: 0.5 });
    reg(hits, marker, "slash-marker");

    // ------------------------------------------------------------ the casualties
    // The neighbour with the cut arm, on the porch step of the left house.
    const cutMan = seatedFigure(g, -2.0, 0.3, -2.25, { ry: 0, cloth: 0x4a5a7a });
    holoTag(cutMan.torso, "Neighbour — deep cut", 0, 1.3, 0.1, { css: EBC_CSS, w: 0.4 });
    bead(-1.55, 1.0, -1.9, "pressure-point", "Direct pressure — hold it", { w: 0.46 });
    card(-2.7, 1.2, -1.3, "tag-immediate", "Tag him Immediate", "IMMEDIATE", { w: 0.36, ry: 0.4, accent: "#f0645b", css: "#f0645b" });
    // The neighbour pinned under a bookcase, lying on the sidewalk outside.
    const pinned = standingFigure(g, -0.2, -1.3, { ry: Math.PI / 2, lying: true, cloth: 0x7a5a4a, trousers: 0x3a3f46 });
    void pinned;
    const shelf = box(g, 1.0, 0.08, 0.35, 0.15, 0.3, -1.25, 0x6a4a32, { rough: 0.7 });
    shelf.rotation.z = 0.08;
    const crib = box(g, 0.12, 0.08, 0.3, -0.25, 0.16, -1.25, 0x8a6a4a, { rough: 0.8 });
    void crib;
    const liftStand = stand(1.0, -0.4, -0.2);
    const liftGauge = instrument(liftStand, 0, 1.02, 0, { idle: "LIFT", color: EBC_ACCENT, w: 0.2, d: 0.26 });
    holoTag(liftStand, "Lever and crib", 0, 1.22, 0, { css: EBC_CSS, w: 0.32 });
    reg(hits, liftGauge, "lift-meter");

    // The frightened neighbour on the kerb, and her husband.
    const wife = seatedFigure(g, 1.6, 0.15, 0.1, { ry: Math.PI, cloth: 0x8a5a6a });
    holoTag(wife.torso, "Neighbour — in shock", 0, 1.3, 0.1, { css: EBC_CSS, w: 0.4 }).rotation.y = Math.PI;
    const husband = standingPerson(g, 2.3, 0.2, { ry: Math.PI, cloth: 0x3a4a3a, hiVis: false });
    const calmStand = stand(2.4, 0.9, -0.4);
    const calmGauge = instrument(calmStand, 0, 1.02, 0, { idle: "CALM", color: EBC_ACCENT, w: 0.2, d: 0.26 });
    holoTag(calmStand, "Her calm", 0, 1.22, 0, { css: EBC_CSS, w: 0.24 });
    reg(hits, calmGauge, "calm-meter");
    card(3.0, 1.35, -0.2, "stop-reentry-card", "Stop him at the door", "NOT SAFE\nTO ENTER", { w: 0.4, ry: -0.8, accent: "#f2c14b", css: "#f2c14b" });
    bead(0.4, 1.45, -1.9, "clear-the-porch", "Off the porch — away from the chimney", { color: 0xf2c14b, css: "#f2c14b", w: 0.64 });
    const porchPair = [standingPerson(g, 0.9, -2.2, { ry: 0.3, cloth: 0x6a6a4a, hiVis: false })];
    const needsRoster = group(g, -1.1, 0.78, 1.45);
    const roster = decal(needsRoster, 0.2, 0.26, 0, 0, 0, paperFace("NEEDS ROSTER", ["Lives alone · 3", "Oxygen · 1", "Stairs · 2"], { band: "#8a4a2a" }), { px: 192 });
    roster.rotation.x = -Math.PI / 2.3;
    holoTag(needsRoster, "Who needs help — confidential", 0, 0.24, 0, { css: EBC_CSS, w: 0.5 });
    reg(hits, roster, "needs-roster");

    // ------------------------------------------------------------ the wrong moves
    bead(3.3, 1.2, -1.5, "relight-the-gas", "Turn her gas back on?", { color: 0xf0645b, css: "#f0645b", w: 0.44 });
    card(-0.1, 1.2, 2.3, "post-needs-list", "Post the roster to the group feed?", "POST ROSTER\nTO FEED", {
      w: 0.6, ry: 0, bg: "#2a1416", accent: "#f0645b", css: "#f0645b",
    });
    const stranger = standingPerson(g, -3.3, -0.1, { ry: 1.2, cloth: 0x2a2a2a, hiVis: false });
    holoTag(stranger.torso, "Man neighbours say is looting", 0, 1.9, 0, { css: "#f2c14b", w: 0.52 }).rotation.y = -1.2;
    bead(-2.7, 1.25, 0.25, "confront-the-stranger", "Join them confronting him?", { color: 0xf0645b, css: "#f0645b", w: 0.5 });
    card(1.2, 1.2, 2.4, "skip-rotation", "Wave off your relief?", "I'LL KEEP\nGOING", {
      w: 0.44, ry: -0.2, bg: "#2a1416", accent: "#f0645b", css: "#f0645b",
    });

    // ------------------------------------------------------------ closing boards
    const log = board(0.56, 0.4, 2.2, 1.95, 2.3, (cx, w, h) => lines(cx, w, h, "ACTIVITY LOG", [
      "Times · actions · who went where", "Hazards reported · tags only",
    ]), { ry: -0.5 });
    reg(hits, log.userData.face, "block-log-board");
    const checkin = board(0.5, 0.36, -2.3, 1.95, 2.4, (cx, w, h) => lines(cx, w, h, "CREW CHECK-IN", [
      "Water · rest · handover", "How did the morning land?",
    ], { accent: "#7fc4d8" }), { ry: 0.5, accent: 0x7fc4d8 });
    reg(hits, checkin.userData.face, "crew-checkin-board");
    const guide = board(0.62, 0.32, -0.2, 3.1, -2.75, (cx, w, h) => lines(cx, w, h, "RESCUER SAFETY FIRST", [
      "A hurt helper is one more casualty.",
    ], { accent: "#7fc4d8" }), { accent: 0x7fc4d8 });
    const paintGuide = (text) => repaint(guide.userData.face, (cx, w, h) => {
      cx.fillStyle = "rgba(10,20,28,0.92)"; cx.fillRect(0, 0, w, h);
      cx.fillStyle = "#7fc4d8"; cx.fillRect(0, 0, w, 5);
      cx.fillStyle = "#eaf6fb"; cx.font = `${Math.round(h * 0.1)}px Arial, sans-serif`;
      cx.textAlign = "left"; cx.textBaseline = "top";
      wrap(cx, text, w * 0.05, h * 0.12, w * 0.9, h * 0.13);
    });

    // ------------------------------------------------------------ the buddy
    // Sited on a spot tools/briefs/clear_spot.mjs reports clear of every control.
    const buddy = standingFigure(g, 0.5, 1.2, { ry: 2.8, cloth: 0x2f5a3a, trousers: 0x262d36, vest: 0x39d353, helmet: 0x2f7a3a });
    holoTag(buddy, "Your buddy", 0, 2.0, 0.1, { css: "#7fc4d8", w: 0.26 }).rotation.y = -2.8;

    return {
      hits,
      footprint: 2.4,
      spawnLook: new THREE.Vector3(0, 1.1, -1.4),

      onStepComplete(step) {
        if (step.id === "kit-up-first") { helmet.visible = false; radio.visible = false; }
        if (step.id === "shut-the-gas") {
          valve.rotation.z = Math.PI / 2;
          valve.material = mat(0x59c97b, { rough: 0.4, metal: 0.5, emissive: 0x59c97b, ei: 0.4 });
        }
        if (step.id === "mark-the-search") {
          markGrp.position.set(-1.4, 1.4, -2.77);
          marker.rotation.x = 0;
        }
        if (step.id === "lift-and-crib") shelf.position.y = 0.4;
        if (step.id === "hand-off-the-roster") {
          needsRoster.position.set(-3.4, 0.8, 2.0);
          clipboard.material = mat(0x59c97b, { rough: 0.7, emissive: 0x59c97b, ei: 0.3 });
        }
        if (step.id === "close-the-block-log") {
          repaint(log.userData.face, (cx, w, h) => lines(cx, w, h, "BLOCK LOGGED", ["Handed off to relief", "Roster with the team leader"], { accent: "#59c97b", bg: "rgba(8,24,14,0.9)" }));
        }
      },

      onHazard(id, s) {
        if (id === "post-needs-list" || id === "confront-the-stranger" || id === "relight-the-gas") {
          wife.head.rotation.y = 0.6;
          paintGuide(typeof eiLine === "function"
            ? eiLine("hazard", { count: s?.hazardHits ?? 1, seed: s?.errors ?? 0 })
            : "Stop there. That is outside a volunteer's role.");
        }
      },

      onInterrupt(it) {
        if (it.id === "aftershock-chimney") {
          chimney.rotation.z = 0.32;
          bricks.position.set(0.8, 0.2, -2.0);
        }
        if (it.id === "pet-reentry") {
          husband.root.position.set(1.7, 0, -2.3);
          husband.root.rotation.y = 0;
        }
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "aftershock-chimney") porchPair[0].root.position.set(0.9, 0, -0.2);
        if (it.id === "pet-reentry") {
          husband.root.position.set(2.3, 0, 0.2);
          husband.root.rotation.y = Math.PI;
        }
      },

      animate(t, dt, session) {
        wife.head.rotation.x = 0.2 + Math.sin(t * 0.6) * 0.05;
        const gg = session?.gauge;
        if (gg && !gg.committed && session.step?.id === "lift-and-crib") {
          const ok = gg.t >= 0.3 && gg.t <= 0.52;
          repaint(liftGauge.userData.screen, signFace(`${(gg.t * 5).toFixed(1)} IN`, {
            bg: "#1e1608", accent: ok ? "#59c97b" : "#f0645b", fg: "#fbf2e0", scale: 0.52,
          }));
        }
        const tr = session?.track;
        if (session?.step?.id === "calm-the-neighbour" && tr) {
          const ok = tr.v >= 0.3 && tr.v <= 0.7;
          repaint(calmGauge.userData.screen, signFace(ok ? "STEADIER" : tr.v < 0.3 ? "ALONE" : "SWAMPED", {
            bg: "#1e1608", accent: ok ? "#59c97b" : "#f0645b", fg: "#fbf2e0", scale: 0.5,
          }));
        }
      },
    };
  },
};
