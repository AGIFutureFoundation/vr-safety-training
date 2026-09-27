import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import { box, cyl, ball, torus, hose, group, decal, repaint, paperFace, mat } from "../../../shared/kit.js";
import { holoTag, standingFigure, valveWheel, reg, surfaceTexture, texturedMat, growthFace, siltFace } from "../citykit.js";
import { woodGrainFace } from "../../../shared/textures.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Low-Visibility & Night Dive Line Work — commercial diving and
// scientific scuba pack, DIVE1, on the bay-underwater district.
//
// Night on a silty bottom beside the ribs of a sunken timber barge: the
// downline from the district's dive stage at (−4.3, 2.8) ending at its anchor
// block, the guideline reel, the line arrows, the search object (a lost
// instrument frame), the buddy diver with their light, the learner's primary
// and backup lights, and the slate with the pattern and the signals. The
// learner is a diver on a tended or buddy night search: tie-offs, a taut
// guideline, a circular tactile sweep, a silt-out, a light failure, the OK by
// light, the abort, the arrows read home and the reel taken in. No depth,
// time, gas, visibility or distance is a number; the dive plan holds them.

const CDLV_ACCENT = 0xc9d84a;
const CDLV_CSS = "#c9d84a";

export const SIM_CD_LOW_VISIBILITY_AND_NIGHT_DIVE_LINE_WORK = {
  id: "cd-low-visibility-and-night-dive-line-work",
  index: "721",
  domain: "Maritime & Ports",
  trade: "Pile Drivers of the Carpenters commercial diver on a night search in low visibility with a buddy diver, the dive supervisor and the tender at the stage above",
  category: "Maritime & Ports",
  district: "bay-underwater",
  weather: "clear",
  underwater: {
    depthLabel: "Per dive plan",
    bottomTimeSeconds: 600,
  },
  certification: "Pile Drivers apprenticeship under the Carpenters (UBC) International Training Fund; OSHA 29 CFR 1910 Subpart T — 29 CFR 1910.421 pre-dive planning for the conditions and the briefing, 29 CFR 1910.422 procedures during the dive (communications, the tended diver, the termination of the dive), 29 CFR 1910.424 SCUBA diving where the search is on scuba with a buddy and 29 CFR 1910.425 the tended surface-supplied diver; ADCI consensus standards for night and low-visibility diving; USCG 46 CFR 197 Subpart B where the dive is from a vessel; visibility, distance, depth and time per the dive plan",
  name: "Low-Visibility & Night Dive Line Work",
  title: simTitle("Low-Visibility & Night Dive Line Work"),
  tagline: "A search you cannot see: the pattern and the signals read on the slate, the dim primary and the unclipped backup found at the stage, the primary and secondary tie-offs made in order, the guideline laid taut through a silt-out with a hand on the line, the circular sweep held by feel while the primary light dies and the backup comes on, the found frame marked, the OK given by light, the abort called, the arrows read home, the reel taken in on the way back to the downline, the log written",
  accent: CDLV_ACCENT,
  accentCss: CDLV_CSS,
  parSeconds: 320,
  footprint: 2.6,
  badge: { id: "hand-on-the-line", name: "Hand On The Line", note: "The guideline never let go of in the dark, the arrows read home, the abort called the moment the plan said" },

  supportLine: "your union hall's member assistance programme — the Pile Drivers of the Carpenters — with the employer's employee assistance line behind it",

  game: system({
    name: "Black Water",
    currency: "LINE ARROWS",
    ranks: ["Tender", "Diver", "Night Diver", "Search Diver", "Line Work Certified"],
    badges: [
      { id: "lights-checked", name: "Lights Checked", note: "The dim primary and the unclipped backup found at the stage", test: AWARD.stepClean("light-check") },
      { id: "arrows-home", name: "Arrows Home", note: "The line arrow read home inside the band first time", test: AWARD.precise(0.7) },
      { id: "never-let-go", name: "Never Let Go", note: "No hazard reached for from the slate to the log", test: AWARD.safe },
    ],
    challenges: [
      { id: "clean-search", name: "Clean Search", note: "No corrections from the slate to the check-in", test: AWARD.clean },
      { id: "taut-line", name: "Taut Line", note: "The guideline laid in band the whole way out", test: AWARD.unbroken },
      { id: "logged-quick", name: "Logged Quick", note: "Log written inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "let-go-line": "You let go of the guideline to swim toward a light you saw off to the side. In black water a light is the only thing you can see and it is not necessarily your buddy's; a diver who leaves the line for it has no way back to the line if the light moves or goes out. The line is the way home and a hand stays on it, or in the OK-loop round it, until you are back at the anchor block.",
    "cross-the-line": "You swam across the guideline to reach the other side of the wreck's ribs. Crossing a line in the dark wraps it round your cylinder, your fins or your umbilical without your feeling it, and the next pull on the line is a pull on you. You follow the line back to where you can go round the end of it, or you stop and signal; you do not cross it.",
    "light-in-eyes": "You turned your primary light onto your buddy's face to see if they were all right. A light in the eyes at night takes a diver's night vision for minutes and their view of everything else with it; you read a buddy by the light on their hands and the signals they make with it, and you shine yours at their chest or the bottom, never their mask.",
    "cut-the-line": "You reached for your cutter to free the guideline where it had caught on the wreck's rib. Cutting the guideline cuts the way home for you and for your buddy, who may be following it back to the reel; a snag is freed by following the line to it and lifting it off, or by signalling the buddy and going round. The cutter is for what is holding you, never for the line that leads you out.",
  },

  lateNotes: {
    "guideline-reel-lay": "The line is laid once both tie-offs are made.",
    "marker-tag": "The object is marked once the sweep has found it.",
    "dive-log": "The log is written once both divers are back at the stage.",
  },

  steps: [
    {
      id: "night-brief", kind: "select", target: "search-slate",
      title: "Read the search pattern and the signals on the slate",
      cue: "At the stage before the descent, read the slate with your buddy: the circular sweep from the anchor block, the light signals — the circle for OK, the slow sweep for attention, the fast sweep for a problem — and the abort word and line pulls.",
      why: "A night search in silt is worked by feel and by a handful of agreed signals, and the slate is where those are fixed before either diver is in a place where they cannot ask. 29 CFR 1910.421 has the dive planned for its conditions and the team briefed on them; here the conditions are darkness and no visibility, and the plan is what a diver does when they cannot see the buddy, the line or the way up.",
    },
    {
      id: "light-check", kind: "find", noHint: true,
      targets: ["dim-primary", "unclipped-backup"],
      itemNames: { "dim-primary": "primary light dim and flickering", "unclipped-backup": "backup light not clipped to the harness" },
      itemNotes: {
        "dim-primary": "Your primary light is yellow and flickers when you knock it — a battery on its last charge or a wet contact. It will fail in the dark, not on the stage.",
        "unclipped-backup": "The backup light is in your pocket and not clipped to the harness D-ring. In black water with gloves on, a light that is not where your hand goes without looking is a light you do not have.",
      },
      title: "Check both lights at the stage",
      cue: "Switch each light on and off, look at the colour and the steadiness of the beam, and check the backup is clipped where your hand finds it blind.",
      why: "A night dive has two lights because one will fail, and the check finds the one that is already failing while a battery can still be changed on the stage. The backup is checked for where it is as much as whether it works: in the dark with gloves on, the hand has to find it on the harness by habit, because the moment the primary dies there is nothing to look for it by.",
    },
    {
      id: "tie-offs", kind: "sequence",
      targets: ["primary-tie", "secondary-tie"],
      itemNames: { "primary-tie": "primary tie-off on the anchor block's shackle", "secondary-tie": "secondary tie-off on the wreck's rib" },
      title: "Make the primary tie-off, then the secondary",
      cue: "Tie the guideline to the anchor block's shackle at the foot of the downline first, then swim a body-length and make the secondary tie-off on the wreck's rib before the line leaves the block.",
      why: "The primary tie-off on the downline's anchor is the line's connection to the way up, and the secondary a short way along is what keeps the whole line from going slack and drifting if the primary fails or the block shifts. They are made in that order because a line tied to the wreck and not to the anchor leads a diver back to the wreck in the dark, not to the downline they need.",
      outOfOrderNote: "Out of order — the primary tie-off goes on the anchor block at the downline first; the secondary follows on the wreck.",
    },
    {
      id: "lay-guideline", kind: "track", target: "guideline-reel-lay", seconds: 6,
      title: "Lay the guideline taut as you swim the search",
      cue: "Swim out from the secondary tie-off with the reel, keeping the line taut behind you — not slack enough to loop, not so tight it saws on the rib.",
      why: "A slack guideline lies in loops on the bottom that a fin or an umbilical goes through, and a diver following loops home in the dark is a diver going in circles; a line pulled bar-tight cuts on every edge it crosses and parts on the way back. The reel is fed out with a little tension, placed round the wreck's edges rather than over them, so that the hand that follows it home feels a straight, clean line.",
      track: { start: 0.14, green: [0.42, 0.62], rise: 0.56, fall: 0.46, drift: 0.12, label: "LINE TENSION", readout: (v) => (v < 0.42 ? "slack — loops on the bottom" : v > 0.62 ? "too tight — sawing on the rib" : "taut and clean") },
      holdBreakNote: "The line went out of band — slack loops or sawing tight. Feed it with a little tension, round the edges.",
    },
    {
      id: "tactile-search", kind: "hold", target: "sweep-arm", seconds: 5,
      title: "Hold the circular sweep by feel",
      cue: "With the search line at arm's length from the tie-off, sweep an arc across the bottom with your free hand flat on the silt, feeling for the frame, keeping the line's tension the same the whole arc.",
      why: "In no visibility the search is a hand on the bottom and a line at a fixed length from a fixed point: the arc is swept by feel and the line's tension tells the diver they are still on the arc. A diver who lets the line go slack has shortened the arc and left a gap in the search; one who pulls has moved the tie-off. Holding the arc steady is the whole method, and it is slow on purpose.",
      holdBreakNote: "The arc broke — the line went slack or tight. Hold the tension steady and sweep with the flat of your hand.",
    },
    {
      id: "mark-object", kind: "drag", target: "marker-tag",
      title: "Mark the frame you have found",
      cue: "Your hand meets the instrument frame's edge. Clip the marker tag and its small float to it so it can be found again, and tell the surface on comms or by line pulls.",
      why: "A thing found by hand in the dark is lost again the moment the hand leaves it unless it is marked; the tag and its float give the recovery dive a target the next diver can find by line and by light. The surface is told at once, with the line's distance from the tie-off, because that is the position: 29 CFR 1910.422 keeps the diver in communication, and a found object is exactly what the surface needs to hear.",
      drag: { to: "found-object", radius: 0.55, missNote: "Not on the frame — the marker tag clips to the instrument frame's edge where your hand found it." },
    },
    {
      id: "light-ok", kind: "select", target: "light-circle",
      title: "Signal your buddy OK with the light",
      cue: "Point your light at the bottom in front of your buddy and draw a slow circle — the OK — and wait for their circle back.",
      why: "In the dark the light is the voice: a slow circle on the bottom says OK, a slow side-to-side says look at me, a fast one says trouble, and the signal is drawn on the bottom or their chest, never at their eyes. Both divers signal and both answer, because a signal unanswered is the first sign that the other diver is not where you think; the plan's signals are what the buddy pair has instead of sight.",
    },
    {
      id: "abort-call", kind: "select", target: "comms-abort",
      title: "Call the abort as the plan says",
      cue: "A primary light gone is the plan's abort. Call 'abort — coming up' on comms or give the abort line pulls, get the buddy's OK, and turn for the line home together.",
      why: "The plan sets what ends a night dive before it starts, and a failed primary light is on that list: the diver still has the backup, but one light between two divers in black water is the margin the plan refuses to spend. The abort is called as the plan words it, on comms and by line pulls so the surface and the buddy both have it, and the search ends there — the frame is marked and the recovery dive will find it.",
    },
    {
      id: "read-arrows", kind: "gauge", target: "line-arrow",
      title: "Read the line arrow for the way home",
      cue: "Find the line arrow on the guideline by feel, read which way its point runs, and commit when you are sure it points toward the anchor block and the downline.",
      why: "A guideline in the dark runs both ways and both feel the same; the arrows clipped along it point home, and a diver who reads one wrong swims away from the downline with the reel paying out behind them. The arrow is read by feel — the point is a shape the glove finds — and confirmed against the reel's direction, because being sure is what the abort has bought time for.",
      gauge: { label: "ARROW — HOME", speed: 0.66, green: [0.44, 0.62], readout: (t) => (t < 0.44 ? "not sure yet" : t <= 0.62 ? "points home — to the block" : "read too fast — check again"), missNote: "Outside the band — feel the arrow's point and be sure before you commit to a direction." },
    },
    {
      id: "reel-in", kind: "turn", target: "guideline-reel",
      title: "Take the guideline in on the reel as you follow it home",
      cue: "Follow the line hand over hand toward the arrows, reeling it in behind you with a little tension so the reel does not bird's-nest, buddy in touch on the line.",
      why: "The line comes in as the divers go home so that it is not left on the wreck for the recovery dive to tangle in, and it comes in on the reel with tension because a reel wound loose jams on the next dive when it is needed in a hurry. Both divers stay on the line — one reeling, one in touch — so the pair that went out together comes back together to the tie-offs.",
      turn: { turns: 1.2, label: "REEL", readout: (t) => (t < 0.35 ? "line still out" : t < 0.85 ? "reeling — taut" : "at the tie-offs") },
    },
    {
      id: "ascend-downline", kind: "select", target: "anchor-block",
      title: "Untie at the anchor block and ascend the downline together",
      cue: "At the block, untie the primary tie-off, put a hand on the downline, get the buddy's OK by light and ascend the line together to the stage at the plan's rate.",
      why: "The tie-offs come off last, when both divers are at the block with hands on the downline, because until then the line is the way home for whichever diver has not arrived. The ascent is on the downline at the plan's rate with the buddy in touch, up to the stage where the tender is waiting; a night dive ends when both divers are on the stage, not when the first one is.",
    },
    {
      id: "dive-log", kind: "select", target: "dive-log",
      title: "Write the dive record at the stage",
      cue: "At the stage with the supervisor: the lights and what was found at the check, the tie-offs, the silt-out, the frame marked and its distance on the line, the primary's failure, the abort called and both divers up together.",
      why: "The record of the dive carries what the recovery dive needs — where the frame is on a line from the block — and what the equipment log needs — the primary light that failed and the backup that was in a pocket. It is written at the stage with the supervisor while the diver still has the line's distance in their hand, because a night dive's details fade faster than a day's.",
    },
    {
      id: "crew-checkin", kind: "select", target: "team-board",
      title: "Check in with the dive team",
      cue: "At the team board: the light for the equipment locker, the silt-out and the failure said from each side, the frame marked for the recovery, and how everyone is.",
      why: "A silt-out and a light failure in the same dive are the kind of night a diver carries home, and the check-in is where the pair and the supervisor say how each of them handled it and what the plan got right. The failed light goes to the locker tagged, the frame's position to the next plan, and the Pile Drivers member assistance line is there for what the stage conversation does not settle.",
    },
  ],

  interrupts: [
    {
      id: "silt-out",
      kind: "Silt-out — zero visibility",
      after: "lay-guideline", delay: 2, seconds: 14,
      alert: "A fin has kicked the bottom and the silt has come up round you — the light shows nothing but brown, and you cannot see the line or your buddy.",
      cue: "Get a hand on the guideline in the OK-loop grip, stop moving, and wait for the silt to settle — do not swim.",
      target: "line-hand",
      why: "In a silt-out the only thing a diver knows is the line, and the first thing to do is make sure of it: a hand round the line in the loop that cannot slip off, and then nothing — no swimming, no reaching, because every kick lifts more silt and every metre swum without the line is a metre lost. The silt settles; the diver who held still and held the line is where they were.",
      missNote: "The learner swam on through the silt without the line; when it cleared the guideline was nowhere in reach and the buddy's light was behind them.",
      wrongNote: "A hand on the line, in the loop — stop moving and let the silt settle.",
    },
    {
      id: "primary-fail",
      kind: "Primary light failed",
      after: "tactile-search", delay: 2, seconds: 14,
      alert: "Your primary light has gone out mid-sweep — total dark, your hand still on the search line.",
      cue: "Find the backup light on your harness by feel, switch it on, and give your buddy a slow sweep with it so they know you have it.",
      target: "backup-light",
      why: "The backup is where the check put it and the hand finds it without looking, because looking is not available; it comes on and the first thing it does is tell the buddy, with the attention signal, that the dark diver has a light again. Then the plan takes over — a failed primary is an abort — but the order is light first, signal second, abort third, because a buddy who sees a light go out and nothing after it starts a search of their own.",
      missNote: "The learner sat in the dark with a hand on the line while the buddy's light swept the silt looking for them; the backup was in a pocket, unclipped, and took a long minute to find.",
      wrongNote: "The backup on your harness — by feel, on, and a slow sweep to your buddy.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);

    // ------------------------------------------------------- bottom, wreck, anchor block
    const bottom = box(g, 12, 0.04, 12, 0, -0.02, 0, 0xffffff, { rough: 1, cast: false });
    bottom.material = texturedMat(surfaceTexture((cx, w, h) => siltFace(cx, w, h), { repeat: 3, px: 512 }), { rough: 1, color: 0x6a6552 });
    const growthTex = surfaceTexture((cx, w, h) => growthFace(cx, w, h), { px: 512 });
    const ribMat = texturedMat(surfaceTexture((cx, w, h) => woodGrainFace(cx, w, h), { px: 256 }), { rough: 0.95, color: 0x4a3a28 });
    const wreck = group(g, 1.8, 0, -2.4, 0.4);
    for (let i = 0; i < 6; i++) {
      const rib = box(wreck, 0.16, 1.4 + (i % 3) * 0.3, 0.22, -1.5 + i * 0.6, 0.7 + (i % 3) * 0.15, 0, 0xffffff, { rough: 0.95 });
      rib.material = ribMat;
      rib.rotation.z = (i % 2 ? 1 : -1) * 0.15;
    }
    const keel = box(wreck, 3.8, 0.3, 0.4, 0, 0.15, 0.1, 0xffffff, { rough: 0.95 });
    keel.material = ribMat;
    for (let i = 0; i < 4; i++) { const pl = box(wreck, 0.9, 0.06, 0.3, -1.2 + i * 0.8, 0.4 + i * 0.1, -0.3, 0xffffff, { rough: 0.95 }); pl.material = ribMat; pl.rotation.x = 0.3; }
    for (let i = 0; i < 5; i++) ball(wreck, 0.1, -1.4 + i * 0.7, 0.9, 0.12, 0x4a5a32, { rough: 1, seg: 8, seg2: 6 });
    holoTag(wreck, "sunken barge — ribs", 0, 2.0, 0, { css: CDLV_CSS, w: 0.4 });
    const block = group(g, -2.4, 0, 1.6);
    const blk = box(block, 0.8, 0.5, 0.8, 0, 0.25, 0, 0xffffff, { rough: 0.9 });
    blk.material = texturedMat(growthTex, { rough: 0.95, color: 0xb0b8a8 });
    const shackle = torus(block, 0.1, 0.02, 0, 0.6, 0, 0x8a949d, { rough: 0.35, metal: 0.8, seg: 8, seg2: 16 });
    void shackle;
    cyl(block, 0.015, 0.015, 6.0, 0, 3.5, 0, 0xf2c14b, { rough: 0.8, seg: 8 });
    holoTag(block, "anchor block — downline to the stage", 0, 1.3, 0, { css: CDLV_CSS, w: 0.6 });
    reg(hits, block, "anchor-block");
    const primaryTie = group(block, 0.2, 0.62, 0.2);
    torus(primaryTie, 0.1, 0.008, 0, 0, 0, CDLV_ACCENT, { emissive: CDLV_ACCENT, ei: 1.2, rough: 0.4, cast: false, seg: 6, seg2: 16 });
    holoTag(primaryTie, "primary tie-off", 0.3, 0.16, 0, { css: CDLV_CSS, w: 0.3 });
    reg(hits, primaryTie, "primary-tie");
    const secondaryTie = group(g, -0.2, 0.9, -0.8);
    torus(secondaryTie, 0.1, 0.008, 0, 0, 0, CDLV_ACCENT, { emissive: CDLV_ACCENT, ei: 1.2, rough: 0.4, cast: false, seg: 6, seg2: 16 });
    const ribPost = box(g, 0.14, 1.2, 0.2, -0.2, 0.6, -1.0, 0xffffff, { rough: 0.95 });
    ribPost.material = ribMat;
    holoTag(secondaryTie, "secondary tie-off — rib", 0, 0.24, 0, { css: CDLV_CSS, w: 0.44 });
    reg(hits, secondaryTie, "secondary-tie");
    const guideline = hose(g, [[-2.2, 0.62, 1.4], [-1.2, 0.5, 0.2], [-0.2, 0.9, -0.8], [0.8, 0.3, -1.4], [1.6, 0.2, -1.0]], 0.008, 0xf4f8fb, { steps: 16, rough: 0.7 });
    guideline.visible = false;
    for (let i = 0; i < 8; i++) ball(g, 0.1 + (i % 3) * 0.04, -3.5 + i * 0.9, 0.05, 3.2 + Math.sin(i * 1.3) * 0.7, 0x3f4a36, { rough: 1, seg: 8, seg2: 6 });
    for (let i = 0; i < 5; i++) { const w = cyl(g, 0.02, 0.03, 0.7 + (i % 2) * 0.3, 3.0 + i * 0.4, 0.4, 1.4 - i * 0.5, 0x2f4a3a, { rough: 1, seg: 6 }); w.rotation.z = 0.2 * (i % 3 - 1); }

    // ------------------------------------------------------- lights, slate, reel, search
    const slate = decal(g, 0.26, 0.2, -1.6, 1.15, 0.6, paperFace("NIGHT SEARCH", ["Sweep: circular from block", "Light: circle OK · fast trouble", "Abort: primary out"], { bg: "#f3efe4", band: CDLV_CSS }), { px: 128 });
    slate.rotation.y = 0.6;
    holoTag(g, "search slate", -1.6, 1.35, 0.6, { css: CDLV_CSS, w: 0.26 });
    reg(hits, slate, "search-slate");
    const primary = group(g, -1.2, 1.3, 0.2);
    cyl(primary, 0.04, 0.05, 0.18, 0, 0, 0, 0x1b1e22, { rough: 0.5, seg: 12 }).rotation.x = Math.PI / 2;
    const beam = cyl(primary, 0.05, 0.3, 1.2, 0, 0, 0.7, 0xfff1c0, { emissive: 0xfff1c0, ei: 0.7, rough: 0.2, opacity: 0.35, transparent: true, cast: false, seg: 14, open: true });
    beam.rotation.x = -Math.PI / 2;
    const lens = cyl(primary, 0.045, 0.045, 0.02, 0, 0, 0.1, 0xfff1c0, { emissive: 0xe8c860, ei: 0.6, rough: 0.2, seg: 12 });
    lens.rotation.x = Math.PI / 2;
    holoTag(primary, "primary light", 0, 0.2, 0, { css: CDLV_CSS, w: 0.26 });
    reg(hits, primary, "dim-primary");
    const backup = group(g, -1.0, 0.85, 0.35);
    cyl(backup, 0.025, 0.03, 0.12, 0, 0, 0, 0x1b1e22, { rough: 0.5, seg: 10 });
    const backupLens = cyl(backup, 0.028, 0.028, 0.02, 0, 0.07, 0, 0x5b6771, { rough: 0.3, seg: 10 });
    holoTag(backup, "backup — clip it to the harness", 0.2, 0.2, 0, { css: CDLV_CSS, w: 0.56 });
    reg(hits, backup, "unclipped-backup");
    const backupOn = group(g, -1.0, 1.05, 0.35);
    torus(backupOn, 0.1, 0.008, 0, 0, 0, CDLV_ACCENT, { emissive: CDLV_ACCENT, ei: 1.2, rough: 0.4, cast: false, seg: 6, seg2: 16 });
    holoTag(backupOn, "backup on — by feel", 0.3, 0.14, 0, { css: CDLV_CSS, w: 0.4 });
    reg(hits, backupOn, "backup-light");
    const reel = group(g, -0.6, 0.7, -0.2);
    const reelWheel = valveWheel(reel, 0, 0, 0, { r: 0.07, color: 0xf4f8fb, body: 0x2f4f6f });
    reelWheel.rotation.x = Math.PI / 2;
    reelWheel.scale.set(0.8, 0.8, 0.8);
    box(reel, 0.04, 0.04, 0.2, 0, -0.05, 0.14, 0x3a4148, { rough: 0.6, metal: 0.5 });
    holoTag(reel, "guideline reel", 0, 0.3, 0, { css: CDLV_CSS, w: 0.3 });
    reg(hits, reel, "guideline-reel");
    const reelLay = group(g, 0.4, 0.8, -1.2);
    for (let i = 0; i < 3; i++) { const chev = box(reelLay, 0.1, 0.012, 0.03, 0, 0, i * 0.1, CDLV_ACCENT, { emissive: CDLV_ACCENT, ei: 1.4, rough: 0.4, cast: false }); chev.rotation.x = 0.4; }
    holoTag(reelLay, "lay the line — taut", 0, 0.2, 0, { css: CDLV_CSS, w: 0.4 });
    reg(hits, reelLay, "guideline-reel-lay");
    const lineHand = group(g, -0.8, 0.7, -0.5);
    torus(lineHand, 0.1, 0.008, 0, 0, 0, 0xd2312b, { emissive: 0xd2312b, ei: 1.2, rough: 0.4, cast: false, seg: 6, seg2: 16 });
    holoTag(lineHand, "hand on the line — OK loop", 0, 0.18, 0, { css: CDLV_CSS, w: 0.5 });
    reg(hits, lineHand, "line-hand");
    const sweep = group(g, 1.2, 0.3, -0.2);
    const sweepArm = box(sweep, 0.9, 0.02, 0.04, 0.45, 0, 0, CDLV_ACCENT, { emissive: CDLV_ACCENT, ei: 1.0, rough: 0.4, cast: false });
    void sweepArm;
    torus(sweep, 0.9, 0.01, 0, 0.02, 0, CDLV_ACCENT, { emissive: CDLV_ACCENT, ei: 1.0, rough: 0.4, cast: false, seg: 6, seg2: 36 }).rotation.x = Math.PI / 2;
    holoTag(sweep, "circular sweep — by feel", 0, 0.6, 0, { css: CDLV_CSS, w: 0.5 });
    reg(hits, sweep, "sweep-arm");
    const frame = group(g, 2.0, 0.12, 0.4);
    for (const [x, z] of [[-0.3, -0.3], [0.3, -0.3], [-0.3, 0.3], [0.3, 0.3]]) cyl(frame, 0.02, 0.02, 0.5, x, 0.25, z, 0x8a949d, { rough: 0.5, metal: 0.6, seg: 8 });
    for (const [x, z, w, d] of [[0, -0.3, 0.6, 0.03], [0, 0.3, 0.6, 0.03], [-0.3, 0, 0.03, 0.6], [0.3, 0, 0.03, 0.6]]) box(frame, w, 0.03, d, x, 0.5, z, 0x8a949d, { rough: 0.5, metal: 0.6 });
    box(frame, 0.24, 0.16, 0.24, 0, 0.14, 0, 0x2f4f6f, { rough: 0.6 });
    torus(frame, 0.5, 0.01, 0, 0.55, 0, CDLV_ACCENT, { emissive: CDLV_ACCENT, ei: 1.2, rough: 0.4, cast: false, seg: 6, seg2: 26 }).rotation.x = Math.PI / 2;
    holoTag(frame, "instrument frame — found by hand", 0, 1.0, 0, { css: CDLV_CSS, w: 0.56 });
    reg(hits, frame, "found-object");
    frame.visible = false;
    const tag = group(g, 0.4, 0.6, 0.6);
    box(tag, 0.1, 0.06, 0.01, 0, 0, 0, 0xf06a2b, { rough: 0.6 });
    ball(tag, 0.06, 0, 0.2, 0, 0xf06a2b, { rough: 0.5, seg: 10, seg2: 8 });
    holoTag(tag, "marker tag · float", 0, 0.4, 0, { css: CDLV_CSS, w: 0.32 });
    reg(hits, tag, "marker-tag");
    const arrow = group(g, -1.0, 0.55, 0.0);
    box(arrow, 0.08, 0.02, 0.03, 0, 0, 0, 0xf4f8fb, { rough: 0.6 });
    const arrowHead = box(arrow, 0.04, 0.02, 0.05, -0.06, 0, 0, 0xf4f8fb, { rough: 0.6 });
    arrowHead.rotation.y = 0.78;
    holoTag(arrow, "line arrow — home", 0, 0.16, 0, { css: CDLV_CSS, w: 0.34 });
    reg(hits, arrow, "line-arrow");
    const lightCircle = group(g, 0.9, 0.2, 0.9);
    const circ = torus(lightCircle, 0.25, 0.01, 0, 0, 0, 0xfff1c0, { emissive: 0xfff1c0, ei: 1.0, rough: 0.4, cast: false, seg: 6, seg2: 24 });
    circ.rotation.x = Math.PI / 2;
    holoTag(lightCircle, "light circle — OK", 0, 0.4, 0, { css: CDLV_CSS, w: 0.34 });
    reg(hits, lightCircle, "light-circle");
    const abort = group(g, -0.4, 1.5, 0.4);
    ball(abort, 0.05, 0, 0, 0, 0x2b3138, { rough: 0.5, seg: 10, seg2: 8 });
    torus(abort, 0.09, 0.008, 0, 0, 0, 0xd2312b, { emissive: 0xd2312b, ei: 1.2, rough: 0.4, cast: false, seg: 6, seg2: 16 });
    holoTag(abort, "comms · line pulls — abort", 0, 0.18, 0, { css: CDLV_CSS, w: 0.5 });
    reg(hits, abort, "comms-abort");
    // Hazard markers.
    const letGoHit = box(g, 0.4, 0.4, 0.4, 2.6, 1.0, 1.6, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "let go — swim to that light?", 2.6, 1.35, 1.6, { css: "#d2312b", w: 0.5 });
    reg(hits, letGoHit, "let-go-line");
    const farLight = ball(g, 0.06, 3.4, 0.8, 2.6, 0xfff1c0, { emissive: 0xfff1c0, ei: 1.4, rough: 0.2, cast: false, seg: 8, seg2: 6 });
    void farLight;
    const crossHit = box(g, 0.4, 0.4, 0.4, 0.6, 0.6, -2.0, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "cut across the line?", 0.6, 1.0, -2.0, { css: "#d2312b", w: 0.4 });
    reg(hits, crossHit, "cross-the-line");
    const cutHit = box(g, 0.3, 0.3, 0.3, 0.9, 0.5, -1.5, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "cut the line off the rib?", 0.9, 0.85, -1.5, { css: "#d2312b", w: 0.46 });
    reg(hits, cutHit, "cut-the-line");

    // ------------------------------------------------------- the buddy, the silt, the log
    const buddy = standingFigure(g, 2.6, -0.4, { ry: -2.2, atStation: true, cloth: 0x1b1e22, trousers: 0x1b1e22, gloves: 0x2b2b2b });
    ball(buddy, 0.18, 0, 1.63, 0, 0x1b1e22, { rough: 0.5, seg: 12, seg2: 10 });
    const buddyLight = ball(buddy, 0.05, 0.3, 1.1, 0.3, 0xfff1c0, { emissive: 0xfff1c0, ei: 1.6, rough: 0.2, cast: false, seg: 8, seg2: 6 });
    holoTag(buddy, "your buddy", 0, 2.0, 0, { css: CDLV_CSS, w: 0.24 });
    const eyesHit = box(buddy, 0.3, 0.3, 0.3, 0, 1.65, 0.35, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(buddy, "light in their face to check?", 0, 2.25, 0.3, { css: "#d2312b", w: 0.54 });
    reg(hits, eyesHit, "light-in-eyes");
    const silt = group(g, 0.2, 0.5, -0.9);
    for (let i = 0; i < 10; i++) ball(silt, 0.25 + (i % 3) * 0.1, Math.cos(i * 1.2) * 0.9, (i % 4) * 0.25, Math.sin(i * 1.2) * 0.9, 0x6a6552, { rough: 1, opacity: 0.55, transparent: true, cast: false, seg: 8, seg2: 6 });
    silt.visible = false;
    const logBoard = decal(g, 0.5, 0.34, -3.2, 1.6, 2.4, paperFace("DIVE RECORD", ["Lights · check ____", "Frame: on the line at ____", "Abort · both up ____"], { bg: "#eef6f8", band: "#2b7a98" }), { px: 192 });
    logBoard.rotation.y = 0.8;
    holoTag(g, "dive record — at the stage", -3.2, 1.9, 2.4, { css: CDLV_CSS, w: 0.5 });
    reg(hits, logBoard, "dive-log");
    const team = decal(g, 0.6, 0.4, -3.8, 1.9, 3.2, (cx, w, h) => {
      cx.fillStyle = "#101c27"; cx.fillRect(0, 0, w, h); cx.fillStyle = "#59c97b"; cx.fillRect(0, 0, w, 6);
      cx.font = `600 ${Math.round(h * 0.15)}px 'Barlow Condensed', Arial, sans-serif`; cx.textAlign = "left"; cx.textBaseline = "middle";
      cx.fillStyle = "#e6f6ea"; cx.fillText("NIGHT DIVE TEAM", w * 0.06, h * 0.22);
      cx.font = `${Math.round(h * 0.11)}px Arial, sans-serif`; cx.fillStyle = "#f4f8fb";
      ["Supervisor · Tender", "Diver · Buddy", "Abort: primary out"].forEach((l, i) => cx.fillText(l, w * 0.06, h * (0.46 + i * 0.18)));
    }, { px: 256, glow: true, ei: 0.6 });
    team.rotation.y = 0.5;
    reg(hits, team, "team-board");
    const umbilical = hose(g, [[-4.3, 1.4, 2.8], [-3.0, 0.6, 1.8], [-1.8, 0.5, 0.8], [-1.0, 1.0, 0.3]], 0.025, 0xf2c14b, { steps: 12, rough: 0.8 });
    void umbilical;

    return {
      hits,
      spawnLook: new THREE.Vector3(0.0, 0.8, -0.6),
      onStep() {},
      onStepComplete(step) {
        if (step.id === "light-check") { lens.material = mat(0xfff1c0, { emissive: 0xfff1c0, ei: 1.4 }); backup.position.set(-1.0, 1.05, 0.35); backupLens.material = mat(0x59c97b, { rough: 0.3 }); }
        if (step.id === "tie-offs") { guideline.visible = true; primaryTie.children[0].material = mat(0x59c97b, { emissive: 0x59c97b, ei: 1.0 }); }
        if (step.id === "lay-guideline") reel.position.set(1.2, 0.5, -0.4);
        if (step.id === "tactile-search") frame.visible = true;
        if (step.id === "mark-object") tag.position.set(2.0, 0.7, 0.4);
        if (step.id === "light-ok") { buddyLight.material = mat(0x59c97b, { emissive: 0x59c97b, ei: 1.6 }); circ.material = mat(0x59c97b, { emissive: 0x59c97b, ei: 1.2 }); }
        if (step.id === "abort-call") abort.children[1].material = mat(0x59c97b, { emissive: 0x59c97b, ei: 1.0 });
        if (step.id === "read-arrows") arrowHead.material = mat(0x59c97b, { rough: 0.6 });
        if (step.id === "reel-in") { guideline.visible = false; reel.position.set(-2.0, 0.7, 1.2); buddy.position.set(-1.8, 0, 2.0); }
        if (step.id === "ascend-downline") { buddy.visible = false; }
        if (step.id === "dive-log") repaint(logBoard, paperFace("DIVE RECORD", ["Primary dim · backup unclipped", "Frame: marked on the line", "Abort called · both up"], { bg: "#e6f6ea", band: "#59c97b" }));
      },
      onHazard() {},
      onInterrupt(it) {
        if (it.id === "silt-out") silt.visible = true;
        if (it.id === "primary-fail") { beam.visible = false; lens.material = mat(0x1b1e22, { rough: 0.5 }); }
      },
      onInterruptEnd(it) {
        if (it.id === "silt-out") silt.visible = false;
        if (it.id === "primary-fail" && it.resolved === "answered") { backupLens.material = mat(0xfff1c0, { emissive: 0xfff1c0, ei: 1.6 }); backupOn.children[0].material = mat(0x59c97b, { emissive: 0x59c97b, ei: 1.0 }); }
      },
      animate(t, dt, session) {
        const step = session?.step;
        if (session?.turn && step?.id === "reel-in") reelWheel.userData.wheel.rotation.y = session.turn.amount * Math.PI * 2;
        const gg = session?.gauge;
        if (gg && !gg.committed && step?.id === "read-arrows") arrow.rotation.y = Math.sin(gg.t * Math.PI * 2) * 0.6;
        if (step?.id === "tactile-search" && session.holding) sweep.rotation.y = Math.sin(t * 0.8) * 1.2;
        if (silt.visible) silt.children.forEach((s, i) => { s.position.y = (i % 4) * 0.25 + Math.sin(t * 1.5 + i) * 0.1; });
        if (beam.visible && step?.id !== "light-check" && lens.material.emissiveIntensity !== undefined && step?.id === "night-brief") lens.material.emissiveIntensity = 0.4 + Math.sin(t * 20) * 0.3;
        void dt;
      },
    };
  },
};
