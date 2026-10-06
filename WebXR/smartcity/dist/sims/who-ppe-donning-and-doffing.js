import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, ball, torus, group, decal, repaint, signFace, paperFace, mat, counter, cabinet,
} from "../../../shared/kit.js";
import {
  CITY, stationPad, holoPanel, holoTag, instrument, standingFigure,
  surfaceTexture, texturedMat, deckPlateFace, reg,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ PPE Donning and Doffing VR — Emergency Services, outbreak
// response. The anteroom outside an isolation area: the kit inspected before
// it is worn, the waste bin staged where doffing will happen, hand hygiene
// done in full, the donning order the guidance sets, a respirator seal check
// every time, a buddy check before the door, and the doffing order that takes
// the most contaminated items off first and the respirator off last. The
// isolation area behind the door is for "a suspected case" of "the outbreak
// pathogen" — nothing here depends on which one.

const WPD_ACCENT = 0x5fb8c9;
const WPD_ALERT = 0xf0645b;

function wpdBoard(parent, w, h, x, y, z, title, lines, o = {}) {
  return holoPanel(parent, w, h, x, y, z, (cx, cw, ch) => {
    cx.fillStyle = "rgba(6,18,24,0.92)"; cx.fillRect(0, 0, cw, ch);
    cx.fillStyle = o.css ?? "#5fb8c9"; cx.fillRect(0, 0, cw, 6);
    cx.fillStyle = "#e4f5f8"; cx.textAlign = "left"; cx.textBaseline = "middle";
    cx.font = `600 ${Math.round(ch * 0.1)}px 'Barlow Condensed', Arial, sans-serif`;
    cx.fillText(title, cw * 0.05, ch * 0.13);
    cx.font = `${Math.round(ch * 0.07)}px Arial, sans-serif`; cx.fillStyle = "#c2e2ea";
    lines.forEach((l, i) => cx.fillText(l, cw * 0.05, ch * (0.3 + i * 0.1)));
  }, { ry: o.ry ?? 0, accent: o.accent ?? WPD_ACCENT });
}

export const SIM_WHO_PPE_DONNING_AND_DOFFING = {
  id: "who-ppe-donning-and-doffing",
  index: "218",
  domain: "Emergency Services",
  trade: "Isolation-area nurse and IPC focal person — NNU/CNA nurses, SEIU and AFSCME public-health staff, and the humanitarian workforce deployed under IASC clusters",
  category: "Emergency Services",
  indoor: "clinic",
  weather: "clear",
  certification: "WHO infection prevention and control guidance on personal protective equipment, hand hygiene and the trained observer; CDC isolation precautions and the CDC donning and doffing sequence for gown, respirator, eye protection and gloves; OSHA 29 CFR 1910.134 for the respirator programme, its fit test and the user seal check every time it goes on; OSHA 29 CFR 1910.1030 for the gloves, the gown and the waste stream; WHO outbreak communication guidance for what staff say at the door; the Sphere Handbook's health standards and IASC cluster coordination for the Health Cluster partners who staff an isolation area together; worked by NNU/CNA nurses alongside SEIU and AFSCME public-health staff",
  name: "PPE Donning and Doffing",
  title: simTitle("PPE Donning and Doffing"),
  tagline: "The isolation anteroom: kit inspected, the bin staged, hand hygiene in full, the donning order, a seal check every time, a buddy at the door, and the doffing order that keeps the respirator on until last",
  accent: WPD_ACCENT,
  accentCss: "#5fb8c9",
  parSeconds: 300,
  footprint: 2.4,
  badge: { id: "off-in-order", name: "Off in Order", note: "On in the right order, sealed, buddy-checked, and off again with the respirator last and clean hands at the end" },

  supportLine: "your agency's staff welfare or staff counsellor service, or the peer-support contact named at your deployment briefing",

  game: system({
    name: "Barrier Discipline",
    currency: "BARRIER",
    ranks: ["Trainee", "PPE Trained", "Buddy Observer", "IPC Focal Person", "Barrier Discipline Certified"],
    badges: [
      { id: "last-off", name: "Last Off", note: "The doffing order held clean, respirator last", test: AWARD.stepClean("doff-sequence") },
      { id: "untouched", name: "Untouched", note: "No gloved hand near the face, no reused glove, no shaken gown", test: AWARD.safe },
      { id: "timer-true", name: "Timer True", note: "The rotation timer set inside the band", test: AWARD.precise(0.7) },
    ],
    challenges: [
      { id: "clean-anteroom", name: "Clean Anteroom", note: "No corrections anywhere in the run", test: AWARD.clean },
      { id: "full-rub", name: "Full Rub", note: "Hand hygiene held without a dropout", test: AWARD.unbroken },
      { id: "eight-straight", name: "Eight Straight", note: "Eight correct actions in a row", test: AWARD.streak(8) },
    ],
  }),

  hazards: {
    "wpd-respirator-first": "You pulled the respirator off first, with the gown and gloves still on. Doffing out of order puts your bare face and the air you breathe next to the most contaminated things you are wearing — the respirator comes off last, outside the patient area, after everything that touched the patient is already in the bin.",
    "wpd-glove-face": "You pushed your eye protection back up with a gloved hand. A glove that has been in the isolation area is the most contaminated surface on your body, and the eyes, nose and mouth are exactly the membranes the whole ensemble exists to protect — if it slips, you leave and re-don, you do not adjust it with that hand.",
    "wpd-reuse-gloves": "You rubbed your gloved hands and went to pull the same gloves back on. Gloves are single-use: once removed they go in the bin, and hand hygiene is done on bare hands, because alcohol rub on a glove does not make it clean again and damages the glove it is meant to protect.",
    "wpd-gown-shake": "You shook the gown out as it came off. A gown is rolled inside-out and away from the body so the contaminated front folds in on itself; shaking it throws whatever is on the outside into the air of the doffing area and onto the person helping you.",
  },

  lateNotes: {
    "wpd-shield-ratchet": "Size the headband before you gown, while your hands are clean; adjusting it later means touching your face with a glove.",
    "wpd-rotation-timer": "Set the rotation timer before you enter — once you are inside, nobody should be reaching for a clock with a gloved hand.",
  },

  steps: [
    {
      id: "inspect-kit", kind: "find", noHint: true,
      targets: ["wpd-torn-gown", "wpd-cracked-shield"],
      itemNames: { "wpd-torn-gown": "gown with a torn seam", "wpd-cracked-shield": "face shield with a crack" },
      itemNotes: {
        "wpd-torn-gown": "A split along the sleeve seam — it would open at the elbow the first time you reach across a bed.",
        "wpd-cracked-shield": "A hairline crack across the visor; splash goes through a crack as easily as through an open face.",
      },
      title: "Inspect the kit before any of it goes on",
      cue: "Look over every item on the donning rack and pick out the ones that are damaged.",
      why: "A defect found in the anteroom costs a replacement from the shelf; the same defect found in the isolation area costs a breach, an exit, a doff and an exposure report. Every item is checked before it is put on because once it is on you cannot see your own back seam or the edge of your own visor.",
    },
    {
      id: "stage-bin", kind: "drag", target: "wpd-waste-bin",
      title: "Stage the waste bin at the doffing point",
      cue: "Carry the lidded infectious-waste bin to the marked doffing point before you gown.",
      why: "Doffing is the moment most self-contamination happens, and it goes wrong fastest when the person doffing has to walk, reach or turn to find where contaminated items go. Placing the bin at the doffing mark first means every item leaves your body straight into it, and nothing is carried or set down on the way.",
      drag: { to: "wpd-doff-socket", radius: 0.45, missNote: "Not on the doffing mark. The bin belongs exactly where the items will come off, so nothing is carried to it." },
    },
    {
      id: "size-headband", kind: "turn", target: "wpd-shield-ratchet",
      title: "Size the face-shield headband",
      cue: "Turn the ratchet on the face shield to your head size while your hands are still clean.",
      why: "Eye protection that is loose slides down the moment you lean over a bed, and the instinct is to push it back up — with a glove. Sizing the headband now, before anything else is on, is what removes the reason to ever touch your face once you are inside.",
      turn: { turns: 0.75, axis: "z", label: "HEADBAND" },
    },
    {
      id: "hand-rub", kind: "track", target: "wpd-handrub", seconds: 6,
      title: "Hand hygiene before you don",
      cue: "Rub every surface of both hands — palms, backs, between fingers, thumbs, fingertips — until they are dry, and keep the rub steady.",
      why: "The WHO hand-hygiene technique is a sequence of surfaces for a reason: people who rub quickly miss the same places — thumbs, fingertips, backs of the hands — every time. Gloves go on over whatever is on the hands underneath, so the rub before donning is what decides what the gloves are sealing in.",
      track: { start: 0.2, green: [0.4, 0.62], rise: 0.6, fall: 0.5, drift: 0.13, label: "HAND RUB", readout: (v) => (v < 0.4 ? "missing surfaces" : v > 0.62 ? "rushing" : "full technique") },
      holdBreakNote: "The rub fell out of technique. Surfaces are being missed — bring it back to the full sequence and keep going until the hands are dry.",
    },
    {
      id: "don-sequence", kind: "sequence",
      targets: ["wpd-don-gown", "wpd-don-respirator", "wpd-don-shield", "wpd-don-gloves"],
      itemNames: { "wpd-don-gown": "gown", "wpd-don-respirator": "respirator", "wpd-don-shield": "face shield", "wpd-don-gloves": "gloves" },
      title: "Don in order",
      cue: "Gown, then respirator, then face shield, then gloves over the gown cuffs.",
      why: "The CDC donning sequence builds the ensemble so each layer sits correctly on the one before: the gown ties first, the respirator seals to bare skin, eye protection goes over the respirator straps, and gloves go on last so they pull over the gown cuffs and cover the wrist. Out of order, there is a gap at the wrist or a strap under a visor.",
      outOfOrderNote: "Gown, respirator, face shield, gloves — gloves last so they cover the gown cuffs.",
    },
    {
      id: "seal-check", kind: "hold", target: "wpd-seal-check", seconds: 5,
      title: "Seal-check the respirator",
      cue: "Cover the respirator and breathe in and out — hold until there is no leak at the edges.",
      why: "OSHA 29 CFR 1910.134 requires a user seal check every time a tight-fitting respirator is put on, separate from the annual fit test. The fit test says this model fits your face; the seal check says it is sitting on your face properly right now, and it is the only check that catches a strap twisted today.",
      holdBreakNote: "You stopped before the check was done. A seal is either confirmed or it is not — cover the respirator and check again.",
    },
    {
      id: "buddy-check", kind: "select", target: "wpd-buddy",
      title: "Buddy check before the door",
      cue: "Turn to your buddy and let them check you head to toe against the checklist before you enter.",
      why: "Nobody can see their own back ties or the gap between a glove and a sleeve. WHO infection prevention and control guidance builds a second person — a trained observer — into entering and leaving an isolation area, and the check happens every time because the one time it is skipped is the time the tie came loose.",
    },
    {
      id: "rotation-timer", kind: "gauge", target: "wpd-rotation-timer",
      title: "Set the rotation timer",
      cue: "Sweep the timer and commit to the rotation on today's IPC board: 45 minutes.",
      why: "Heat and fatigue build fast inside a full ensemble, and a tired worker is the one who touches their face or rushes a doff. The rotation on today's board is set by the IPC lead for this ward, this heat and this ensemble; the timer is set to it before entering so the decision to leave is made by a clock, not by how you feel at minute fifty.",
      gauge: { label: "ROTATION", speed: 0.6, green: [0.47, 0.53], readout: (t) => `${Math.round(t * 90)} min`, missNote: "That is not today's rotation. Commit the time on the IPC board — 45 minutes — and let the timer make the call." },
    },
    {
      id: "doff-sequence", kind: "sequence",
      targets: ["wpd-doff-gloves", "wpd-doff-shield", "wpd-doff-gown", "wpd-doff-respirator"],
      itemNames: { "wpd-doff-gloves": "gloves", "wpd-doff-shield": "face shield", "wpd-doff-gown": "gown", "wpd-doff-respirator": "respirator" },
      title: "Doff in order",
      cue: "Gloves first, then face shield, then gown rolled away from you, and the respirator last — outside the patient area.",
      why: "The doffing order takes the most contaminated items off first and keeps the respirator on until last, because the hands and the front of the gown have been closest to the patient and the airway is the one thing that must stay protected until nothing contaminated is left on you. The CDC sequence is written so each removal touches only what is still clean.",
      outOfOrderNote: "Gloves, face shield, gown, respirator last. The respirator stays on until everything that touched the patient is off.",
    },
    {
      id: "doff-hand-hygiene", kind: "hold", target: "wpd-doff-dispenser", seconds: 4,
      title: "Hand hygiene after the last item",
      cue: "Rub your bare hands at the doffing dispenser until dry — immediately after the respirator comes off.",
      why: "Every doffing step is a chance to touch a contaminated surface without noticing, and the last item off is the respirator, handled by its straps at the back of the head. Hand hygiene straight afterwards is what removes whatever the careful doffing still left behind, before you touch a door handle, a phone or your own face.",
      holdBreakNote: "You stopped before your hands were dry. Keep rubbing until they are — the door handle is next.",
    },
    {
      id: "close-waste", kind: "select", target: "wpd-bin-lid",
      title: "Close and tag the waste bin",
      cue: "Close the bin lid without pressing the contents down and tag it for collection.",
      why: "A bin left open in a doffing area is contaminated PPE in the room's air and within reach of the next person, and pushing the contents down to fit more drives air and droplets back up out of it. Closed at the fill line and tagged, it leaves the anteroom as waste handled under OSHA 29 CFR 1910.1030 rather than as a hazard for whoever cleans up.",
    },
    {
      id: "crew-checkin", kind: "select", target: "wpd-crew-board",
      title: "Check in with your buddy and the team",
      cue: "Before you leave, check in with your buddy on how the shift went and point anyone who needs it to staff care.",
      why: "Working inside an ensemble next to very sick people is physically draining and it stays with people, and the buddy who watched you doff is the person most likely to notice that you are not all right. Checking in before leaving, and saying the staff welfare contact out loud, is part of keeping the rota staffed next week.",
    },
    {
      id: "closing-log", kind: "hold", target: "wpd-entry-log", seconds: 4,
      title: "Close out the entry log",
      cue: "Hold the log open and record your time in, time out, buddy and any breach before you sign.",
      why: "The entry log is how the IPC team finds out who was in the isolation area and when if a breach or an exposure is reported later. A time out and a buddy's name written honestly — including a slip that nobody else saw — is what lets an exposure be followed up in hours instead of guessed at in days.",
      holdBreakNote: "You signed without recording the times and your buddy. Open it again and fill it in before signing.",
    },
  ],

  interrupts: [
    {
      id: "empty-doffing-dispenser",
      kind: "Empty dispenser",
      after: "hand-rub", delay: 2, seconds: 14,
      alert: "While you rub, the doffing dispenser across the room flashes empty — the cartridge the doffing point will need later is out.",
      cue: "Swap in the spare cartridge now, while your hands are clean and before anyone doffs to an empty dispenser.",
      target: "wpd-spare-cartridge",
      why: "Hand hygiene after doffing is only possible if the dispenser at the doffing point works. Finding it empty with contaminated hands is the moment people walk to the next room touching handles on the way. A clean-handed worker replacing it now is the whole reason spare cartridges are stocked in the anteroom.",
      missNote: "Nobody replaced the cartridge. The next worker out of the isolation area doffed to an empty dispenser and walked across the anteroom to the sink with contaminated hands, touching the door plate on the way.",
      wrongNote: "That will not refill it. The spare cartridge is on the shelf by the doffing point.",
    },
    {
      id: "no-buddy-at-door",
      kind: "Unchecked entry",
      after: "seal-check", delay: 2, seconds: 13,
      alert: "A colleague in a half-tied gown is already at the isolation door with a hand on the plate — no buddy check.",
      cue: "Stop them at the door — nobody goes in unchecked.",
      target: "wpd-zone-door",
      why: "A gown tie that is loose at the door is a gown that falls open at a bedside, and the buddy check is the only control that sees it. Stopping a colleague at the door costs them a minute and some embarrassment; letting them in costs a breach inside the one room where there is nothing clean to fix it with.",
      missNote: "The colleague went through unchecked. The gown opened at the back while they turned a patient, and they spent the rest of the shift on the exposure follow-up list instead of the rota.",
      wrongNote: "Not that. Your colleague is at the isolation door — stop them there before it opens.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root, 0, 0, -1.9);
    stationPad(g, 2.4, WPD_ACCENT);

    // ---------------------------------------------------------- anteroom floor and walls
    const floor = box(g, 5.8, 0.04, 4.6, 0, 0.02, 0, 0xffffff, { rough: 0.7 });
    floor.material = texturedMat(
      surfaceTexture((cx, w, h) => deckPlateFace(cx, w, h, { base: "#9fb4b8", base2: "#93a8ac" }), { repeat: 5, px: 512 }),
      { rough: 0.6, metal: 0.05, color: 0xdfe8ea },
    );
    box(g, 5.8, 2.6, 0.12, 0, 1.3, -2.3, 0xe6ecec, { rough: 0.85 });
    // Clean / dirty line painted across the floor.
    box(g, 0.08, 0.005, 4.4, 0.55, 0.045, 0, 0xf2c14b, { emissive: 0xf2c14b, ei: 0.3, rough: 0.5, cast: false });
    decal(g, 0.6, 0.14, -0.3, 0.046, 1.9, signFace("CLEAN SIDE", { bg: "#0d2418", accent: "#59c97b", scale: 0.5 }), { px: 160 }).rotation.x = -Math.PI / 2;
    decal(g, 0.6, 0.14, 1.4, 0.046, 1.9, signFace("DOFFING SIDE", { bg: "#2a1416", accent: "#f0645b", scale: 0.5 }), { px: 160 }).rotation.x = -Math.PI / 2;

    // Isolation door with its red frame.
    const door = group(g, 1.2, 0, -2.22);
    box(door, 1.1, 2.2, 0.06, 0, 1.1, 0, 0xb8c4c8, { rough: 0.5, metal: 0.2 });
    for (const [w, h, x, y] of [[0.08, 2.3, -0.59, 1.15], [0.08, 2.3, 0.59, 1.15], [1.26, 0.08, 0, 2.3]]) box(door, w, h, 0.08, x, y, 0.01, 0xc0392b, { rough: 0.5 });
    box(door, 0.5, 0.35, 0.02, 0, 1.4, 0.04, 0x9fc6d6, { rough: 0.1, opacity: 0.5, transparent: true, cast: false });
    decal(door, 0.5, 0.18, 0, 1.85, 0.04, signFace("ISOLATION — PPE ONLY", { bg: "#2a1416", accent: "#f0645b", scale: 0.36 }), { px: 256 });
    const doorPlate = box(door, 0.12, 0.25, 0.02, 0.4, 1.05, 0.05, CITY.steel, { rough: 0.3, metal: 0.8 });
    reg(hits, doorPlate, "wpd-zone-door");
    const doorLamp = ball(door, 0.05, 0, 2.45, 0.06, WPD_ALERT, { emissive: WPD_ALERT, ei: 2.4, rough: 0.4 });
    doorLamp.visible = false;

    // IPC board.
    const ipcBoard = wpdBoard(g, 0.9, 0.6, -0.4, 1.6, -2.2, "IPC BOARD — TODAY", [
      "Rotation today: 45 min in the red zone", "Don: gown · respirator · shield · gloves", "Doff: gloves · shield · gown · respirator",
      "Buddy check every entry, every exit", "Seal check every time it goes on",
    ]);
    void ipcBoard;

    // ---------------------------------------------------------- donning rack (clean side, left)
    const rack = counter(g, 1.5, 0.5, -1.55, -1.3, 0xdfe4e8, { ry: 0 });
    void rack;
    const donItems = [
      ["wpd-don-gown", -2.1, 0x7fb8d8, "Gown"], ["wpd-don-respirator", -1.75, 0xf2f2ee, "Respirator"],
      ["wpd-don-shield", -1.4, 0xcfe8f0, "Face shield"], ["wpd-don-gloves", -1.05, 0x6f8fd8, "Gloves"],
    ];
    for (const [id, x, color, label] of donItems) {
      const it = group(g, x, 0.78, -1.3);
      if (id === "wpd-don-respirator") ball(it, 0.06, 0, 0.05, 0, color, { rough: 0.7 });
      else if (id === "wpd-don-shield") box(it, 0.2, 0.18, 0.01, 0, 0.1, 0, color, { rough: 0.1, opacity: 0.6, transparent: true });
      else box(it, 0.22, 0.06, 0.16, 0, 0.03, 0, color, { rough: 0.8 });
      holoTag(it, label, 0, 0.26, 0, { css: "#5fb8c9", w: 0.22 });
      reg(hits, it, id);
    }
    // Damaged items on the rack's upper shelf.
    const shelf = group(g, -1.55, 0, -1.5);
    box(shelf, 1.5, 0.03, 0.3, 0, 1.25, 0, 0xc9d0d4, { rough: 0.6 });
    const tornGown = box(shelf, 0.26, 0.08, 0.2, -0.45, 1.31, 0, 0x7fb8d8, { rough: 0.8 });
    box(shelf, 0.02, 0.085, 0.12, -0.38, 1.31, 0.02, 0x2a3a44, { rough: 0.8 });
    reg(hits, tornGown, "wpd-torn-gown");
    const crackedShield = box(shelf, 0.2, 0.16, 0.01, 0.1, 1.36, 0.05, 0xcfe8f0, { rough: 0.1, opacity: 0.6, transparent: true });
    box(shelf, 0.16, 0.004, 0.012, 0.1, 1.38, 0.056, 0x333333, { rough: 0.5 }).rotation.z = 0.5;
    reg(hits, crackedShield, "wpd-cracked-shield");
    box(shelf, 0.24, 0.08, 0.2, 0.5, 1.31, 0, 0x7fb8d8, { rough: 0.8 });
    // Face-shield headband ratchet on the bench.
    const ratchet = group(g, -0.7, 0.78, -1.25);
    torus(ratchet, 0.07, 0.012, 0, 0.06, 0, 0x3a4148, { rough: 0.5, seg: 8, seg2: 24 }).rotation.x = Math.PI / 2;
    const knob = cyl(ratchet, 0.025, 0.025, 0.03, 0.08, 0.06, 0, 0x5fb8c9, { rough: 0.4, seg: 12 });
    knob.rotation.z = Math.PI / 2;
    holoTag(ratchet, "Headband ratchet", 0, 0.2, 0, { css: "#5fb8c9", w: 0.3 });
    reg(hits, knob, "wpd-shield-ratchet");
    // Hand rub station and seal-check mirror.
    const rubPost = group(g, -2.3, 0, -0.3);
    cyl(rubPost, 0.03, 0.03, 1.0, 0, 0.5, 0, CITY.darkSteel, { rough: 0.5, seg: 8 });
    const rub = box(rubPost, 0.12, 0.2, 0.1, 0, 1.1, 0, 0xe8eef2, { rough: 0.4 });
    holoTag(rubPost, "Hand rub", 0, 1.35, 0, { css: "#5fb8c9", w: 0.2 });
    reg(hits, rub, "wpd-handrub");
    const mirror = group(g, -2.7, 0, 0.6, Math.PI / 2);
    box(mirror, 0.6, 1.2, 0.03, 0, 1.3, 0, 0xcfd8dc, { rough: 0.05, metal: 0.9 });
    holoTag(mirror, "Seal check", 0, 2.0, 0.03, { css: "#5fb8c9", w: 0.22 });
    reg(hits, box(mirror, 0.3, 0.3, 0.1, 0, 1.55, 0.05, 0xffffff, { opacity: 0.001, transparent: true, cast: false }), "wpd-seal-check");
    // Rotation timer.
    const timer = instrument(g, -0.15, 1.1, -2.18, { idle: "-- min", color: WPD_ACCENT, w: 0.18, d: 0.24 });
    timer.rotation.x = Math.PI / 2;
    holoTag(timer, "Rotation timer", 0, 0.02, -0.18, { css: "#5fb8c9", w: 0.28 });
    reg(hits, timer, "wpd-rotation-timer");

    // ---------------------------------------------------------- doffing side (right)
    const doffMarks = [["wpd-doff-gloves", 1.0, -0.9, "1 GLOVES"], ["wpd-doff-shield", 1.5, -0.9, "2 SHIELD"], ["wpd-doff-gown", 2.0, -0.9, "3 GOWN"], ["wpd-doff-respirator", 2.0, -0.2, "4 RESPIRATOR"]];
    for (const [id, x, z, label] of doffMarks) {
      const m = group(g, x, 0.04, z);
      box(m, 0.38, 0.01, 0.38, 0, 0.005, 0, id === "wpd-doff-respirator" ? 0x59c97b : 0xf0645b, { rough: 0.6, opacity: 0.55, transparent: true, cast: false });
      holoTag(m, label, 0, 0.34, 0, { css: id === "wpd-doff-respirator" ? "#59c97b" : "#f0645b", w: 0.3 });
      reg(hits, m, id);
    }
    const doffSocket = box(g, 0.4, 0.02, 0.4, 1.5, 0.05, -0.2, 0xffffff, { opacity: 0.001, transparent: true, cast: false });
    hits["wpd-doff-socket"] = doffSocket;
    decal(g, 0.36, 0.1, 1.5, 0.047, 0.05, signFace("BIN HERE", { bg: "#1a1a1a", accent: "#f2c14b", scale: 0.45 }), { px: 128 }).rotation.x = -Math.PI / 2;
    const bin = group(g, -0.4, 0, 1.2);
    cyl(bin, 0.18, 0.16, 0.5, 0, 0.25, 0, 0xd8232a, { rough: 0.5, seg: 16 });
    const binLid = cyl(bin, 0.19, 0.19, 0.04, 0, 0.52, 0, 0xb81d23, { rough: 0.5, seg: 16 });
    decal(bin, 0.2, 0.1, 0, 0.3, 0.17, signFace("BIOHAZARD", { bg: "#d8232a", accent: "#fff", fg: "#fff", scale: 0.4 }), { px: 128 });
    reg(hits, bin, "wpd-waste-bin");
    reg(hits, binLid, "wpd-bin-lid");
    const dispPost = group(g, 2.45, 0, -0.6);
    cyl(dispPost, 0.03, 0.03, 1.0, 0, 0.5, 0, CITY.darkSteel, { rough: 0.5, seg: 8 });
    const disp = box(dispPost, 0.12, 0.2, 0.1, 0, 1.1, 0, 0xe8eef2, { rough: 0.4 });
    const dispLamp = ball(dispPost, 0.02, 0, 1.25, 0.06, WPD_ALERT, { emissive: WPD_ALERT, ei: 2.4, rough: 0.4 });
    dispLamp.visible = false;
    holoTag(dispPost, "Doffing hand rub", 0, 1.4, 0, { css: "#5fb8c9", w: 0.3 });
    reg(hits, disp, "wpd-doff-dispenser");
    const spareShelf = group(g, 2.6, 0, 0.5);
    box(spareShelf, 0.4, 0.9, 0.3, 0, 0.45, 0, 0xc9d0d4, { rough: 0.6 });
    const cartridge = box(spareShelf, 0.1, 0.18, 0.08, 0, 1.0, 0, 0xe8eef2, { rough: 0.4 });
    holoTag(spareShelf, "Spare cartridges", 0, 1.25, 0, { css: "#5fb8c9", w: 0.3 });
    reg(hits, cartridge, "wpd-spare-cartridge");

    // Hazard props.
    const respFirst = group(g, 2.45, 0, -1.5);
    box(respFirst, 0.2, 0.2, 0.2, 0, 1.6, 0, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(respFirst, "Respirator off first?", 0, 1.8, 0, { css: "#f0645b", w: 0.36 });
    reg(hits, respFirst, "wpd-respirator-first");
    const faceTouch = group(g, 0.9, 0, 0.8);
    box(faceTouch, 0.2, 0.2, 0.2, 0, 1.55, 0, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(faceTouch, "Push shield up?", 0, 1.75, 0, { css: "#f0645b", w: 0.3 });
    reg(hits, faceTouch, "wpd-glove-face");
    const usedGloves = group(g, 1.0, 0.6, 0.35);
    box(usedGloves, 0.3, 0.02, 0.2, 0, 0, 0, 0xc9d0d4, { rough: 0.6 });
    box(usedGloves, 0.12, 0.03, 0.08, -0.05, 0.02, 0, 0x6f8fd8, { rough: 0.8 });
    cyl(usedGloves, 0.02, 0.02, 0.6, 0, -0.3, 0, CITY.steel, { rough: 0.4, metal: 0.7, seg: 6 });
    holoTag(usedGloves, "Gloves back on?", 0, 0.16, 0, { css: "#f0645b", w: 0.3 });
    reg(hits, usedGloves, "wpd-reuse-gloves");
    const shakeGown = group(g, 2.3, 0, 1.3);
    box(shakeGown, 0.3, 0.02, 0.3, 0, 0.9, 0, 0x7fb8d8, { rough: 0.8 });
    cyl(shakeGown, 0.015, 0.015, 0.9, 0, 0.45, 0, CITY.steel, { rough: 0.4, metal: 0.7, seg: 6 });
    holoTag(shakeGown, "Shake it off?", 0, 1.08, 0, { css: "#f0645b", w: 0.26 });
    reg(hits, shakeGown, "wpd-gown-shake");

    // ---------------------------------------------------------- people and boards
    const buddy = standingFigure(g, -1.0, 0.6, { ry: -0.6, cloth: 0x7fb8d8, vest: 0x7fb8d8, atStation: true });
    holoTag(buddy, "Buddy / observer", 0, 1.95, 0, { css: "#5fb8c9", w: 0.32 });
    reg(hits, buddy, "wpd-buddy");
    const colleague = standingFigure(g, 0.1, 0.9, { ry: 0.4, cloth: 0x7fb8d8, atStation: true });
    const crewBoard = wpdBoard(g, 0.6, 0.4, -2.3, 1.5, 1.4, "TEAM CHECK-IN", ["How did the shift sit?", "Staff welfare contact posted", "Peer support on the rota"], { ry: Math.PI / 2.4, accent: 0x7fd1c9, css: "#7fd1c9" });
    reg(hits, crewBoard, "wpd-crew-board");
    const entryLog = wpdBoard(g, 0.55, 0.4, -1.4, 1.5, -2.2, "ENTRY LOG", ["Time in · time out", "Buddy", "Breach: yes / no"]);
    reg(hits, entryLog, "wpd-entry-log");

    // ---------------------------------------------------------- dressing
    cabinet(g, 0.6, 1.8, 0.4, 2.55, 0.9, -1.9, 0xd7dce1, { doorColor: 0xc9d0d4 });
    const sink = group(g, -2.4, 0, -1.9);
    box(sink, 0.6, 0.85, 0.45, 0, 0.425, 0, 0xe8eef2, { rough: 0.4 });
    box(sink, 0.4, 0.06, 0.3, 0, 0.84, 0, 0xcfd8dc, { rough: 0.1, metal: 0.4 });
    cyl(sink, 0.015, 0.015, 0.2, 0, 1.0, -0.15, CITY.steel, { rough: 0.3, metal: 0.8, seg: 8 });
    for (let i = 0; i < 4; i++) box(g, 0.3, 0.2, 0.25, -2.6, 0.1 + i * 0.21, 1.0, [0x7fb8d8, 0x6f8fd8, 0xe8eef2, 0x7fb8d8][i], { rough: 0.8 });
    for (let i = 0; i < 3; i++) cyl(g, 0.09, 0.09, 0.02, 0.3 + i * 0.25, 2.55, -0.5, 0xf4f6f5, { emissive: 0xf4f6f5, ei: 0.5, rough: 0.4, seg: 12 });

    return {
      hits,
      footprint: 2.4,
      spawnLook: new THREE.Vector3(0, 1.2, -2.6),

      onStepComplete(step) {
        if (step.id === "inspect-kit") { tornGown.visible = false; crackedShield.visible = false; }
        if (step.id === "stage-bin") { bin.position.set(1.5, 0.04, -0.2); }
        if (step.id === "don-sequence") for (const [id] of donItems) hits[id].visible = false;
        if (step.id === "rotation-timer") repaint(timer.userData.screen, signFace("45:00", { bg: "#0d1c24", accent: "#59c97b", fg: "#eafcf9", scale: 0.6 }));
        if (step.id === "close-waste") binLid.material = mat(0x59c97b, { rough: 0.5 });
        if (step.id === "closing-log") repaint(entryLog.userData.face, (cx, w, h) => {
          cx.fillStyle = "rgba(6,18,24,0.92)"; cx.fillRect(0, 0, w, h); cx.fillStyle = "#59c97b"; cx.fillRect(0, 0, w, 6);
          cx.fillStyle = "#eafcf1"; cx.font = `600 ${Math.round(h * 0.16)}px 'Barlow Condensed', Arial, sans-serif`;
          cx.textAlign = "center"; cx.textBaseline = "middle"; cx.fillText("SIGNED OUT", w / 2, h / 2);
        });
      },

      onInterrupt(it) {
        if (it.id === "empty-doffing-dispenser") { dispLamp.visible = true; disp.material = mat(0x9aa4ad, { rough: 0.6 }); }
        if (it.id === "no-buddy-at-door") { doorLamp.visible = true; colleague.position.set(1.0, 0, -1.7); }
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "empty-doffing-dispenser") { dispLamp.visible = false; disp.material = mat(0xe8eef2, { rough: 0.4 }); cartridge.visible = false; }
        if (it.id === "no-buddy-at-door") { doorLamp.visible = false; colleague.position.set(0.1, 0, 0.9); }
      },

      onHazard() {},

      animate(t, dt, session) {
        void dt;
        const step = session?.step;
        if (doorLamp.visible && doorLamp.material) doorLamp.material.emissiveIntensity = 1.6 + Math.sin(t * 10) * 1.2;
        if (dispLamp.visible && dispLamp.material) dispLamp.material.emissiveIntensity = 1.6 + Math.sin(t * 9) * 1.2;
        if (session?.turn && step?.id === "size-headband") knob.rotation.x = session.turn.amount * Math.PI * 2;
        const gg = session?.gauge;
        if (gg && !gg.committed && step?.id === "rotation-timer") {
          repaint(timer.userData.screen, signFace(`${Math.round(gg.t * 90)} min`, { bg: "#0d1c24", accent: gg.t >= 0.47 && gg.t <= 0.53 ? "#59c97b" : "#f2c14b", fg: "#eafcf9", scale: 0.55 }));
        }
      },
    };
  },
};
