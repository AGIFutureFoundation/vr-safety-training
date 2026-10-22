import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import { box, cyl, slab, group, decal, repaint, signFace, paperFace, mat, hose } from "../../../shared/kit.js";
import {
  CITY, stationPad, holoPanel, holoTag, standingFigure, reg, lockTag, surfaceTexture, texturedMat, pavingFace,
} from "../citykit.js";
import { radio, flashlight } from "../../../shared/toolkit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Flatwork Ironer & Folder Guarding VR — Culinary &
// Hospitality, hotel laundry series.
//
// The machine at the end of every hotel laundry: a steam-heated flatwork
// ironer that pulls damp sheets through a nip between padded rolls and a hot
// chest, with a folder behind it that cross-folds and stacks them. It is the
// machine in a laundry that takes hands, and it burns the ones it does not
// take. This station is the operator's shift on it: the guards walked, the
// operator dressed for a nip point, the chest temperature read against the
// machine card, sheets fed flat and steady, and then a wrapped sheet cleared
// the only safe way — the ironer locked out at the disconnect and the steam
// valve, the stop proven dead, the heat that no lock can isolate waited out,
// the wrap pulled with a hook, and the guards back before the lock comes off.
// laundry-plant-chemicals tests the finger guard on its own; this is the
// jam, the lockout and the burns. Generic plant, no maker's machine or
// temperature named: the machine card holds the numbers.

const HFI_ACCENT = 0x8fa3c7;
const HFI_CSS = "#8fa3c7";
const HFI_WARN = "#e0664f";

/** A machine-side placard in the ANSI Z535 DANGER layout. */
function hfiDanger(parent, x, y, z, ry, lines) {
  const p = decal(parent, 0.46, 0.34, x, y, z, (c, w, h) => {
    c.fillStyle = "#000"; c.fillRect(0, 0, w, h);
    c.fillStyle = "#fff"; c.fillRect(4, 4, w - 8, h - 8);
    c.fillStyle = "#c8102e"; c.fillRect(4, 4, w - 8, h * 0.26);
    c.fillStyle = "#fff"; c.font = `800 ${Math.round(h * 0.18)}px Arial, sans-serif`; c.textAlign = "center"; c.textBaseline = "middle";
    c.fillText("⚠ DANGER", w / 2, h * 0.17);
    c.fillStyle = "#000"; c.font = `700 ${Math.round(h * 0.1)}px Arial, sans-serif`;
    lines.forEach((l, i) => c.fillText(l, w / 2, h * (0.44 + i * 0.15)));
  }, { px: 320 });
  p.rotation.y = ry;
  return p;
}

export const SIM_HW_FLATWORK_IRONER_AND_FOLDER_GUARDING = {
  id: "hw-flatwork-ironer-and-folder-guarding",
  index: "320",
  domain: "Culinary & Hospitality",
  trade: "Hotel laundry ironer operator — UNITE HERE laundry, flatwork line",
  category: "Culinary & Hospitality",
  indoor: "plant",
  certification: "OSHA 29 CFR 1910.212 machine guarding for the ironer's nip point and the folder's moving parts; OSHA 29 CFR 1910.147 control of hazardous energy for clearing a jam — electrical, steam and the heat no lock isolates; 29 CFR 1910.132 for dress and PPE at a nip point; ANSI Z8.1 commercial laundry equipment safety practice behind the finger guard and folder interlocks; Cal/OSHA's injury and illness prevention program, 8 CCR 3203; NIOSH guidance on heat in hot workplaces; UNITE HERE laundry training on the flatwork line",
  name: "Flatwork Ironer & Folder Guarding",
  title: simTitle("Flatwork Ironer & Folder Guarding"),
  tagline: "The hotel laundry's flatwork line: guards walked and a bypassed interlock found, dressed for a nip point, the chest read against the machine card, sheets fed flat and steady while a coworker reaches into the folder, a wrapped sheet cleared under lockout at the disconnect and the steam valve with the heat waited out, the guards back before the lock comes off, and the jam logged",
  accent: HFI_ACCENT,
  accentCss: HFI_CSS,
  parSeconds: 270,
  footprint: 2.6,
  badge: { id: "hands-whole", name: "Hands Whole", note: "Every jam cleared under your own lock, every guard back before the restart, and nobody reached into a running nip" },

  supportLine: "your UNITE HERE local's member assistance line, or the employee assistance number posted by the laundry time clock",

  game: system({
    name: "Flatwork Line",
    currency: "SHEETS",
    ranks: ["Feeder", "Ironer Operator", "Line Lead", "Laundry Supervisor", "Flatwork Line Certified"],
    badges: [
      { id: "never-in-the-nip", name: "Never in the Nip", note: "No reach past the finger guard, no gloves at the feed, no jam cleared on a stop button, no leaning on the chest", test: AWARD.safe },
      { id: "own-lock", name: "Own Lock", note: "The jam cleared under your own lock with the stop proven dead", test: AWARD.stepClean("jam-lockout") },
      { id: "clean-line", name: "Clean Line", note: "No corrections from the machine card to the log", test: AWARD.clean },
    ],
    challenges: [
      { id: "flat-feed", name: "Flat Feed", note: "The feed held in band all the way", test: AWARD.unbroken },
      { id: "read-the-chest", name: "Read the Chest", note: "The chest reading committed inside the band first time", test: AWARD.precise(0.7) },
      { id: "back-in-production", name: "Back in Production", note: "The jam cleared and the line restarted inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "reach-into-nip": "You reached past the finger guard to straighten a creased sheet going into the rolls. The nip between the feed roll and the heated chest pulls in whatever it touches faster than a hand can pull back, and it is hot enough to burn while it crushes. A creased sheet goes through creased, or the line is stopped; nothing is straightened past the guard.",
    "gloves-at-feed": "You pulled on loose cotton work gloves to feed the ironer. A loose glove is the thing the feed ribbons grab first, and it takes the hand inside it into the nip before the finger guard has anything to trip on. Feeding is done bare-handed or in the close-fitting gloves the line's hazard assessment names — never loose ones.",
    "clear-on-stop-button": "You went to pull the wrapped sheet out with the ironer only stopped at its button. A stop button is a control, not an energy isolation: a coworker at the folder, a timer, or a fault can start the rolls again with your arm between them. A jam is cleared under lockout at the disconnect and the steam valve, with your own lock on, and the start proven dead.",
    "lean-on-chest": "You braced your hip against the ironer's chest housing to reach across. The chest is steam-heated metal that holds its heat long after the rolls stop, and the housing, the end caps and the steam return line are all contact-burn surfaces. Reach from the feed side with the step, or go around.",
  },

  lateNotes: {
    "jam-hook": "The hook goes in once the ironer is locked out, the start is proven dead and the chest has been given its cool-down — not while the line is live.",
    "main-disconnect": "The disconnect goes back on at the end, once the guards are back, the crew is clear and your lock is off.",
    "machine-log": "The log is written once the line is back in production, with the jam and the guard findings on it.",
  },

  steps: [
    {
      id: "machine-card", kind: "select", target: "machine-card",
      title: "Read the ironer's machine card and lockout procedure",
      cue: "Read the card at the operator station: the chest temperature setting, the energy sources — electrical, steam, compressed air — and where each one is isolated.",
      why: "Under 29 CFR 1910.147 a machine with more than one energy source has a written energy control procedure that names each source and its isolation point, and a flatwork ironer has at least three: the drive, the steam to the chest, and the air to the clamps. The card is that procedure at the machine. Reading it at the start of the shift means that when the sheet wraps at speed, the operator already knows which valve and which disconnect.",
    },
    {
      id: "guard-walk", kind: "find", noHint: true,
      targets: ["folder-interlock-bypass", "crossfold-panel-off", "finger-bar-bent"],
      itemNames: { "folder-interlock-bypass": "the folder door interlock zip-tied shut", "crossfold-panel-off": "the cross-fold guard panel leaning on the wall", "finger-bar-bent": "the finger guard bar bent up at one end" },
      itemNotes: {
        "folder-interlock-bypass": "Somebody has zip-tied the folder door's interlock so the folder runs with the door open. That is a guard defeated, and it is how a hand ends up in the cross-fold. It is reported and the line does not run until it is fixed.",
        "crossfold-panel-off": "The panel over the cross-fold blade is off and leaning on the wall. The blade strikes the sheet into the rolls many times a minute; unguarded, it strikes whatever else is there.",
        "finger-bar-bent": "The finger guard bar across the feed is bent up at the left end, leaving a gap where a hand reaches the nip without tripping it. It is tagged out until maintenance straightens and tests it.",
      },
      title: "Walk the ironer and folder guarding",
      cue: "Three things about this line's guarding are wrong. Find them before it runs.",
      why: "Guards come off for maintenance and do not always go back on, and interlocks get defeated by whoever found them slowing the shift down. 29 CFR 1910.212 requires the nip points and moving parts to be guarded, and ANSI Z8.1 is where the laundry industry sets out the finger guard and interlock arrangement for this exact machine. The walk is the operator's check that what protects them is actually there today.",
    },
    {
      id: "dress-for-nip", kind: "sequence", anyOrder: true,
      targets: ["hair-tied", "jewellery-off", "sleeves-snug"],
      itemNames: { "hair-tied": "hair tied back and under a cap", "jewellery-off": "rings, watch and lanyard off", "sleeves-snug": "sleeves close at the wrist" },
      title: "Dress for a nip point",
      cue: "Hair tied back and under a cap, rings and watch and lanyard off, sleeves close at the wrist.",
      why: "A nip point takes the loose thing first — a hair tie's tail, a lanyard, a ring's edge, a cuff — and the person attached to it second. Dress at an ironer is the last line of defence behind the guard, and it is the one the operator controls entirely: 29 CFR 1910.132 has the employer assess the hazards of a job, and at a flatwork ironer nothing that can be grabbed goes near the feed.",
    },
    {
      id: "chest-temp", kind: "gauge", target: "chest-display",
      title: "Read the chest temperature against the machine card",
      cue: "Watch the chest display come up and commit when it sits at the setting the machine card gives for this linen.",
      why: "The chest runs at the temperature on the machine card because that is what dries this linen at this speed. Over it, sheets scorch and the operator stands at a hotter machine all shift; under it, damp sheets come out wet, wrap on the rolls and cause the jams this station is about. Reading the display against the card is how a hot machine stays the heat it was meant to be.",
      gauge: { label: "CHEST vs CARD", speed: 0.7, green: [0.46, 0.62], readout: (t) => (t < 0.46 ? "below the card" : t > 0.62 ? "over the card" : "at the card setting"), missNote: "Not at the machine card's setting — let the chest settle and read it again before the first sheet goes in." },
    },
    {
      id: "feed-sheets", kind: "track", target: "feed-ribbons", seconds: 7,
      title: "Feed the sheets flat and steady",
      cue: "Clip the corners into the spreader clamps and let the feed ribbons carry each sheet in — steady rhythm, hands at the clamps, never forward of the finger guard.",
      why: "A sheet that goes in flat and square comes out dry and folds clean; a sheet pushed in crooked creases, wraps, and becomes a jam somebody has to clear. The spreader clamps and ribbons exist so the operator's hands never go forward of the finger guard. A steady rhythm is also a hand position that does not change, which is how the guard stays between the operator and the nip.",
      track: { start: 0.12, green: [0.4, 0.62], rise: 0.55, fall: 0.45, drift: 0.12, label: "FEED", readout: (v) => (v < 0.4 ? "gaps — sheets bunching" : v > 0.62 ? "rushing — crooked feed" : "flat and steady") },
      holdBreakNote: "The feed fell out of rhythm. Bunched or crooked sheets are the ones that wrap on the rolls — bring it back to a flat, steady feed with your hands at the clamps.",
    },
    {
      id: "jam-lockout", kind: "sequence",
      targets: ["notify-line", "main-disconnect", "steam-valve-lock", "try-start"],
      itemNames: { "notify-line": "line notified: ironer going down", "main-disconnect": "main disconnect off, your lock on", "steam-valve-lock": "steam supply valve closed and locked", "try-start": "start button tried — nothing moves" },
      title: "A sheet has wrapped: lock the ironer out",
      cue: "Tell the line, open the main disconnect and put your lock on it, close and lock the steam valve, then try the start button to prove it is dead.",
      why: "The energy control procedure is the only thing that makes it safe to put an arm into an ironer: the line is told so nobody restarts it, each energy source is isolated at its own point with the operator's own lock, and the try-start proves the isolation actually took. A stop button, a coworker watching the controls or a promise are not isolation, and 29 CFR 1910.147 exists because each of them has failed with somebody's arm in a machine.",
      outOfOrderNote: "Notify, isolate the drive, isolate the steam, then prove it — the try-start comes last, when there is something to prove.",
    },
    {
      id: "heat-wait", kind: "hold", target: "cooldown-marker", seconds: 6,
      title: "Wait out the chest's heat before reaching in",
      cue: "Stay at the feed side and hold until the chest display reads the machine card's safe-to-reach value — the lock stops the steam, not the heat already in the metal.",
      why: "Lockout isolates the steam to the chest; it does not take the heat out of a steel cylinder that has been at working temperature all morning. That stored thermal energy is still a burn hazard, and the procedure deals with it the way it deals with any stored energy: by waiting for it to dissipate to the level the machine card sets before a hand goes near the rolls. The wait is part of the lockout, not a delay to it.",
      holdBreakNote: "You broke off before the chest came down to the card's safe-to-reach value. The metal is still hot enough to burn — go back and wait it out.",
    },
    {
      id: "jam-clear", kind: "drag", target: "jam-hook",
      title: "Pull the wrap off with the jam hook",
      cue: "Take the jam hook from its holder and draw the wrapped sheet off the roll from the feed side — the hook goes in, your hand does not.",
      why: "Even locked out and cooled, the space between the rolls and the chest is tight, hot and edged, and a sheet wrapped around a roll comes away suddenly. The jam hook reaches where a hand would have to follow a sheet into the nip, and it keeps the operator's arm outside the guard line while the cloth tears loose. The flashlight on the card holder is there so nobody leans in to look.",
      drag: { to: "wrap-socket", radius: 0.5, missNote: "Not on the wrap — bring the hook to the sheet where it winds onto the roll and draw it back toward you." },
    },
    {
      id: "burn-surfaces", kind: "find", noHint: true,
      targets: ["steam-return-line", "chest-endcap", "exhaust-hood"],
      itemNames: { "steam-return-line": "the unlagged steam return line at knee height", "chest-endcap": "the chest end cap by the feed step", "exhaust-hood": "the vapour exhaust hood over the delivery end" },
      itemNotes: {
        "steam-return-line": "The steam return line runs bare at knee height beside the feed step. Brushed while reaching, it burns through trousers. It gets lagging on the repair order.",
        "chest-endcap": "The chest's end cap is exposed beside the step — the surface a hip or hand finds when someone leans to reach across.",
        "exhaust-hood": "The exhaust hood over the delivery end gathers hot moist air and its metal runs hot. Nobody reaches up into it to free a sheet.",
      },
      title: "Find the burn surfaces around the machine",
      cue: "Three hot surfaces around the ironer are easy to touch while clearing. Find them before you go around.",
      why: "An ironer burns people more often than it catches them, and almost always on a surface they touched without thinking: a steam return line at knee height, an end cap beside the step, an exhaust hood reached into. Knowing where they are changes how an operator stands and reaches around the machine, and the unlagged line is a repair order that takes a burn off the shift permanently.",
    },
    {
      id: "restore-guards", kind: "sequence",
      targets: ["guards-back", "crew-clear", "lock-off"],
      itemNames: { "guards-back": "tools out, guards back on", "crew-clear": "crew clear of the machine, told it is restarting", "lock-off": "your own lock off the disconnect" },
      title: "Guards back, crew clear, then your lock off",
      cue: "Tools out and every guard back on, the crew told and clear of the rolls and folder, then take your own lock off.",
      why: "Coming out of lockout is where the same machine hurts people a second time: a guard left off after a jam, a hook left in the rolls, a coworker at the folder who did not hear it was restarting. The procedure runs backwards in the same discipline — machine whole, people clear, and only then the lock, removed by the person who put it on and nobody else.",
      outOfOrderNote: "Guards, then people, then the lock — the lock is the last thing standing between the restart and whoever is still near the rolls.",
    },
    {
      id: "restart", kind: "turn", target: "main-disconnect",
      title: "Turn the disconnect back on and restart at crawl",
      cue: "Turn the main disconnect handle back to ON and bring the line up at crawl speed before production.",
      why: "The first turns after a jam are when a missed tool, a sheet fragment or a guard fixing that did not seat shows itself. Restarting at crawl speed with the operator watching the feed and the folder turns a hidden problem into a visible one at a speed where the finger guard and the stop can still do their jobs, before the line goes back to production speed.",
      turn: { turns: 0.25, axis: "z", label: "DISCONNECT", readout: (t) => (t < 0.2 ? "OFF" : "ON — crawl") },
    },
    {
      id: "machine-log", kind: "select", target: "machine-log",
      title: "Log the jam, the lockout and the guard findings",
      cue: "Write the jam, the lock-on and lock-off times, the bypassed interlock, the missing panel, the bent finger bar and the unlagged steam line.",
      why: "A laundry's machine log is how a pattern becomes visible: jams at the same point mean damp linen or worn padding, a bypassed interlock means somebody found it slowing the shift, and a bent finger guard is the near miss before a hand. Written up with lock times, it also shows the lockout was done as the procedure says, which matters to the operator the day it is questioned.",
    },
    {
      id: "crew-checkin", kind: "select", target: "crew-radio",
      title: "Check in with the laundry supervisor and the folder crew",
      cue: "Radio the supervisor that the ironer is back up with the guard findings reported, and check in with your coworker at the folder.",
      why: "The supervisor owns the repair orders for the interlock, the panel and the finger bar, and the line should not run long on promises. The coworker who reached into the folder is also the person most shaken by it; a quick check-in and the member assistance line cost nothing, and a near miss talked about is one less likely to be repeated.",
    },
  ],

  interrupts: [
    {
      id: "folder-reach",
      kind: "Hand in the folder",
      after: "feed-sheets", delay: 2, seconds: 12,
      alert: "At the delivery end, your coworker has opened the folder door and is reaching in to free a sheet caught in the cross-fold while the folder is still running.",
      cue: "Hit the folder's emergency stop pull-cord now, then tell them to step back.",
      target: "folder-estop",
      why: "With the door interlock bypassed, the folder runs with a hand in it, and the cross-fold blade does not care whose it is. The emergency stop cord runs the length of the line so that anybody at the ironer can stop the folder in a second. Stopping it is the answer now; locking it out is the answer before anyone reaches in again.",
      missNote: "The folder kept running with your coworker's arm in it. The cross-fold blade struck on its next cycle and caught their sleeve, and they were only pulled clear because the sheet tore first.",
      wrongNote: "That does not stop the folder. The emergency stop pull-cord along the line is what stops it with a hand inside — pull it.",
    },
    {
      id: "lock-pressure",
      kind: "Pressure to pull your lock",
      after: "heat-wait", delay: 2, seconds: 12,
      alert: "While you wait out the chest, the shift lead walks to the disconnect and reaches for your lock with the master key: 'We're behind on sheets, it's cooled enough.'",
      cue: "Get to the disconnect and keep your lock on — only the person who put it on takes it off, and you are about to reach into that machine.",
      target: "lock-station",
      why: "A lock is personal because the person whose arm goes into the machine is the only one who knows it is safe to restart. 29 CFR 1910.147 allows someone else to remove a lock only under a specific procedure when the worker is not there, never while they are standing at the rolls. Keeping the lock on is not disobedience; it is the whole point of the lock.",
      missNote: "The shift lead took your lock off and restarted the drive to 'check it' while you were reaching for the jam hook. The rolls turned under the wrap with your hand a hand's width away.",
      wrongNote: "The disconnect is the problem — somebody is taking your lock off. Get there and keep it on.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.6, HFI_ACCENT);

    // ------------------------------------------------------------- the floor
    const floorTex = surfaceTexture((cx, w, h) => pavingFace(cx, w, h, { tiles: 8, base: "#8a8f8c", base2: "#7e8380", seam: "rgba(0,0,0,0.16)" }), { repeat: 3, px: 320 });
    const floor = box(g, 6.0, 0.02, 5.2, 0, 0.011, -0.2, 0x8a8f8c, { rough: 0.8, cast: false });
    floor.material = texturedMat(floorTex, { rough: 0.7, metal: 0.05, color: 0x9ca19e });
    box(g, 6.0, 0.012, 0.1, 0, 0.022, 0.25, 0xf2c14b, { rough: 0.6, cast: false });      // feed-side walk line
    box(g, 6.0, 2.8, 0.1, 0, 1.4, -2.75, 0xd8dcd9, { rough: 0.85 });

    // ------------------------------------------------------------ the ironer
    const ironer = group(g, -0.4, 0, -0.9);
    // Frame, chest housing and the big heated cylinder along X.
    for (const sx of [-1.6, 1.6]) box(ironer, 0.2, 1.3, 1.2, sx, 0.65, 0, 0x4a5a74, { rough: 0.5, metal: 0.4 });
    const chest = cyl(ironer, 0.42, 0.42, 3.0, 0, 0.95, -0.1, 0x9aa3ab, { rough: 0.3, metal: 0.8, seg: 24 });
    chest.rotation.z = Math.PI / 2;
    const housing = box(ironer, 3.0, 0.3, 0.9, 0, 1.52, -0.1, 0x4a5a74, { rough: 0.5, metal: 0.4 });
    void housing;
    const roll = cyl(ironer, 0.14, 0.14, 3.0, 0, 0.9, 0.36, 0xece6d6, { rough: 0.9, seg: 16 });
    roll.rotation.z = Math.PI / 2;
    // Feed table with ribbons and spreader clamps, finger guard bar across it.
    box(ironer, 3.0, 0.06, 0.6, 0, 0.86, 0.75, 0x6b7a92, { rough: 0.5, metal: 0.4 });
    const ribbons = group(ironer, 0, 0.9, 0.75);
    for (let i = 0; i < 7; i++) box(ribbons, 0.05, 0.01, 0.58, -1.35 + i * 0.45, 0, 0, 0xf2f2ee, { rough: 0.8 });
    holoTag(ironer, "feed ribbons and clamps", 0.4, 1.12, 0.9, { css: HFI_CSS, w: 0.42 });
    reg(hits, ribbons, "feed-ribbons");
    const fingerBar = box(ironer, 2.6, 0.05, 0.05, 0.2, 1.02, 0.5, 0xf2c14b, { rough: 0.5, metal: 0.3 });
    void fingerBar;
    const bentEnd = box(ironer, 0.4, 0.05, 0.05, -1.3, 1.1, 0.5, 0xf2c14b, { rough: 0.5, metal: 0.3 });
    bentEnd.rotation.z = 0.35;
    reg(hits, bentEnd, "finger-bar-bent");
    holoTag(ironer, "finger guard", 0.2, 1.2, 0.5, { css: HFI_CSS, w: 0.24 });
    const sheet = box(ironer, 1.6, 0.012, 0.5, 0.3, 0.9, 0.76, 0xf6f4ee, { rough: 0.9 });
    const nipHit = box(ironer, 0.5, 0.18, 0.2, -0.6, 1.0, 0.36, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(ironer, "straighten it past the guard?", -0.6, 1.3, 0.3, { css: HFI_WARN, w: 0.52 });
    reg(hits, nipHit, "reach-into-nip");
    // The wrap on the roll, hidden until the jam.
    const wrap = cyl(ironer, 0.17, 0.17, 0.9, 0.5, 0.9, 0.36, 0xf6f4ee, { rough: 0.9, seg: 16 });
    wrap.rotation.z = Math.PI / 2;
    wrap.visible = false;
    const wrapSocket = box(ironer, 0.6, 0.3, 0.3, 0.5, 0.95, 0.5, 0xffffff, { opacity: 0.001, transparent: true, cast: false });
    hits["wrap-socket"] = wrapSocket;
    // Chest display and the cool-down marker.
    const display = group(ironer, 1.45, 1.35, 0.62);
    box(display, 0.3, 0.2, 0.06, 0, 0, 0, 0x1b1e23, { rough: 0.5 });
    const displayFace = decal(display, 0.26, 0.15, 0, 0, 0.031, signFace("CHEST --", { bg: "#0d1624", accent: HFI_CSS, fg: "#dfe8f6", scale: 0.5 }), { glow: true, ei: 0.8 });
    holoTag(display, "chest vs card", 0, 0.18, 0.03, { css: HFI_CSS, w: 0.26 });
    reg(hits, displayFace, "chest-display");
    const cool = box(ironer, 0.34, 0.24, 0.1, 1.45, 1.35, 0.7, 0x59c97b, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, cool, "cooldown-marker");
    // Burn surfaces: steam return line, end cap and the exhaust hood.
    const steamReturn = cyl(ironer, 0.03, 0.03, 1.4, -1.0, 0.45, 0.62, 0xb07a4a, { rough: 0.4, metal: 0.7, seg: 10 });
    steamReturn.rotation.z = Math.PI / 2;
    reg(hits, steamReturn, "steam-return-line");
    const endcap = cyl(ironer, 0.44, 0.44, 0.06, -1.52, 0.95, -0.1, 0xb9bec4, { rough: 0.3, metal: 0.8, seg: 24 });
    endcap.rotation.z = Math.PI / 2;
    reg(hits, endcap, "chest-endcap");
    const hood = box(ironer, 1.6, 0.25, 0.8, 0.6, 2.3, -0.6, 0x9aa3ab, { rough: 0.4, metal: 0.7 });
    cyl(ironer, 0.14, 0.14, 0.6, 0.6, 2.7, -0.6, 0x9aa3ab, { rough: 0.4, metal: 0.7, seg: 12 });
    reg(hits, hood, "exhaust-hood");
    const leanHit = box(ironer, 0.4, 0.4, 0.3, -1.52, 0.95, 0.32, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(ironer, "brace on the chest to reach?", -1.4, 1.62, 0.5, { css: HFI_WARN, w: 0.5 });
    reg(hits, leanHit, "lean-on-chest");
    hfiDanger(ironer, 1.1, 1.3, 0.64, 0, ["Nip point — keep hands clear", "Lock out before clearing jams", "Hot surfaces"]);

    // ------------------------------------------------------------ the folder
    const folder = group(g, 2.1, 0, -1.2);
    box(folder, 1.0, 1.6, 1.3, 0, 0.8, 0, 0x5a6a84, { rough: 0.5, metal: 0.4 });
    const door = box(folder, 0.04, 0.9, 0.7, -0.52, 0.9, 0.2, 0x7a8aa4, { rough: 0.5, metal: 0.4 });
    const zipTie = box(folder, 0.05, 0.06, 0.06, -0.55, 1.2, 0.56, 0x1b1e23, { rough: 0.6 });
    holoTag(folder, "folder door interlock", -0.55, 1.45, 0.6, { css: HFI_CSS, w: 0.4 });
    reg(hits, zipTie, "folder-interlock-bypass");
    const panel = box(g, 0.7, 0.5, 0.04, 2.75, 0.3, -2.4, 0x5a6a84, { rough: 0.5, metal: 0.4 });
    panel.rotation.x = -0.25;
    holoTag(g, "cross-fold guard panel", 2.75, 0.7, -2.35, { css: HFI_CSS, w: 0.42 });
    reg(hits, panel, "crossfold-panel-off");
    const stack = group(folder, 0.1, 0, 0.9);
    box(stack, 0.7, 0.5, 0.5, 0, 0.25, 0, 0x5a6a84, { rough: 0.5, metal: 0.3 });
    for (let i = 0; i < 4; i++) box(stack, 0.5, 0.05, 0.36, 0, 0.53 + i * 0.055, 0, 0xf6f4ee, { rough: 0.9 });
    // E-stop pull cord running the length of the line.
    const cord = cyl(g, 0.008, 0.008, 4.4, 0.2, 1.62, -0.25, 0xe0664f, { rough: 0.6, seg: 6 });
    cord.rotation.z = Math.PI / 2;
    const estop = group(g, 2.3, 1.55, -0.25);
    box(estop, 0.14, 0.14, 0.1, 0, 0, 0, 0xf2c14b, { rough: 0.5 });
    const estopKnob = cyl(estop, 0.04, 0.04, 0.05, 0, 0, 0.07, 0xd8232a, { rough: 0.5, seg: 14 });
    estopKnob.rotation.x = Math.PI / 2;
    holoTag(estop, "folder e-stop cord", 0, 0.16, 0.05, { css: HFI_CSS, w: 0.32 });
    reg(hits, estop, "folder-estop");

    // ----------------------------------------------- machine card, disconnect
    const card = holoPanel(g, 0.7, 0.5, -2.35, 1.5, 0.25, (ctx, w, h) => {
      ctx.fillStyle = "#0f1522"; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = HFI_CSS; ctx.fillRect(0, 0, w, 6);
      ctx.font = `600 ${Math.round(h * 0.11)}px 'Barlow Condensed', Arial, sans-serif`;
      ctx.textAlign = "left"; ctx.textBaseline = "middle"; ctx.fillStyle = "#e6ecf6";
      ctx.fillText("IRONER 2 — MACHINE CARD", w * 0.05, h * 0.13);
      ctx.font = `${Math.round(h * 0.075)}px Arial, sans-serif`; ctx.fillStyle = "#cdd8ea";
      ["Chest: set per linen type (see chart)", "Energy: drive / steam / clamp air", "Drive: main disconnect, wall left", "Steam: supply valve, lock point", "Safe to reach: display per chart", "Jams: lockout, hook — never hands"].forEach((l, i) => ctx.fillText(l, w * 0.05, h * (0.3 + i * 0.11)));
    }, { accent: HFI_ACCENT, ry: 0.9 });
    reg(hits, card, "machine-card");
    const discBox = group(g, -2.85, 0, -1.2, Math.PI / 2);
    box(discBox, 0.4, 0.55, 0.2, 0, 1.3, 0, 0x6b737c, { rough: 0.5, metal: 0.5 });
    const discHandle = group(discBox, 0.22, 1.3, 0.05);
    box(discHandle, 0.05, 0.22, 0.05, 0, 0.06, 0, 0xd8232a, { rough: 0.5 });
    holoTag(discBox, "main disconnect", 0, 1.7, 0.1, { css: HFI_CSS, w: 0.3 });
    reg(hits, discHandle, "main-disconnect");
    const lockStation = box(discBox, 0.3, 0.2, 0.1, 0, 0.9, 0.12, 0xd8232a, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, lockStation, "lock-station");
    const myLock = lockTag(discBox, 0.22, 1.12, 0.12, { lines: ["DO NOT", "OPERATE", "— operator"] });
    myLock.visible = false;
    const lockOffHit = box(discBox, 0.12, 0.12, 0.12, 0.22, 1.05, 0.2, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(discBox, "your lock", 0.22, 0.85, 0.18, { css: HFI_CSS, w: 0.18 });
    reg(hits, lockOffHit, "lock-off");
    // Steam supply line with its lockable valve.
    const steamPipe = cyl(g, 0.045, 0.045, 2.4, -2.1, 2.2, -2.5, 0xb07a4a, { rough: 0.4, metal: 0.7, seg: 10 });
    steamPipe.rotation.z = Math.PI / 2;
    const steamDrop = cyl(g, 0.045, 0.045, 1.0, -1.9, 1.7, -2.5, 0xb07a4a, { rough: 0.4, metal: 0.7, seg: 10 });
    void steamDrop;
    const steamValve = group(g, -1.9, 1.3, -2.4);
    box(steamValve, 0.14, 0.14, 0.14, 0, 0, 0, 0x2f6f4a, { rough: 0.6, metal: 0.4 });
    const lever = box(steamValve, 0.3, 0.03, 0.04, 0.12, 0.09, 0, 0xd8232a, { rough: 0.5 });
    holoTag(steamValve, "steam supply valve", 0, 0.3, 0.08, { css: HFI_CSS, w: 0.34 });
    reg(hits, steamValve, "steam-valve-lock");
    const valveLock = lockTag(steamValve, 0.18, 0.02, 0.06, { lines: ["DO NOT", "OPEN"] });
    valveLock.visible = false;
    // Operator station: start button, the line horn, the log and the radio.
    const ops = group(g, 1.4, 0, 0.9, -0.3);
    box(ops, 0.5, 1.0, 0.35, 0, 0.5, 0, 0x4a5a74, { rough: 0.5, metal: 0.4 });
    const startBtn = cyl(ops, 0.04, 0.04, 0.03, -0.1, 1.02, 0, 0x2f7d4a, { rough: 0.5, seg: 14 });
    holoTag(ops, "start — try it", -0.1, 1.2, 0, { css: HFI_CSS, w: 0.26 });
    reg(hits, startBtn, "try-start");
    const horn = box(ops, 0.1, 0.08, 0.08, 0.14, 1.04, 0, 0xf2c14b, { rough: 0.5 });
    holoTag(ops, "line horn — notify", 0.18, 1.35, 0, { css: HFI_CSS, w: 0.32 });
    reg(hits, horn, "notify-line");
    const logSheet = decal(ops, 0.2, 0.26, 0.08, 1.005, 0.08, paperFace("MACHINE LOG", ["Jams", "Lock on / off", "Guards"], { scale: 0.6 }));
    logSheet.rotation.x = -Math.PI / 2;
    reg(hits, logSheet, "machine-log");
    const crewRadio = radio(ops, -0.16, 1.0, 0.1, { ry: 0.2 });
    holoTag(ops, "radio — supervisor", -0.2, 1.45, 0.12, { css: HFI_CSS, w: 0.34 });
    reg(hits, crewRadio, "crew-radio");
    const hookHolder = group(g, -2.3, 0, 0.9);
    box(hookHolder, 0.14, 1.1, 0.1, 0, 0.55, 0, 0x6b737c, { rough: 0.5, metal: 0.5 });
    const hook = group(hookHolder, 0, 1.0, 0.08);
    cyl(hook, 0.012, 0.012, 0.9, 0, -0.3, 0, 0xb9bec4, { rough: 0.3, metal: 0.8, seg: 8 });
    box(hook, 0.08, 0.02, 0.02, 0.03, 0.15, 0, 0xb9bec4, { rough: 0.3, metal: 0.8 });
    holoTag(hookHolder, "jam hook", 0, 1.35, 0.08, { css: HFI_CSS, w: 0.2 });
    reg(hits, hook, "jam-hook");
    flashlight(hookHolder, 0.18, 1.1, 0.02, { ry: 0.3 });
    // Dress: hair cap dispenser, jewellery box, sleeve clips on the locker.
    const locker = group(g, -2.6, 0, 1.9, Math.PI / 2);
    box(locker, 0.6, 1.8, 0.4, 0, 0.9, 0, 0x6f7f96, { rough: 0.5, metal: 0.4 });
    const capBox = box(locker, 0.2, 0.14, 0.12, -0.15, 1.3, 0.24, 0xf2f2ee, { rough: 0.6 });
    holoTag(locker, "hair cap", -0.15, 1.46, 0.26, { css: HFI_CSS, w: 0.18 });
    reg(hits, capBox, "hair-tied");
    const jewelTray = box(locker, 0.2, 0.05, 0.14, 0.15, 1.05, 0.24, 0x2b2f34, { rough: 0.5 });
    holoTag(locker, "rings, watch off", 0.15, 1.18, 0.26, { css: HFI_CSS, w: 0.3 });
    reg(hits, jewelTray, "jewellery-off");
    const sleeves = box(locker, 0.24, 0.1, 0.1, 0, 0.75, 0.24, 0x3a6fc9, { rough: 0.7 });
    holoTag(locker, "sleeves snug", 0, 0.88, 0.26, { css: HFI_CSS, w: 0.24 });
    reg(hits, sleeves, "sleeves-snug");
    const gloves = box(g, 0.2, 0.05, 0.12, -1.6, 0.92, 0.6, 0xd8c8a8, { rough: 0.9 });
    holoTag(g, "loose cotton gloves to feed?", -1.6, 1.08, 0.7, { css: HFI_WARN, w: 0.48 });
    reg(hits, gloves, "gloves-at-feed");
    const stopOnly = box(ops, 0.12, 0.08, 0.08, -0.1, 0.82, 0.18, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(ops, "clear it on the stop button?", -0.1, 0.72, 0.2, { css: HFI_WARN, w: 0.48 });
    reg(hits, stopOnly, "clear-on-stop-button");
    // Guards back and crew clear markers at the folder and feed.
    const guardsBack = box(g, 0.5, 0.3, 0.1, 1.2, 0.35, -0.15, 0x59c97b, { opacity: 0.2, transparent: true, cast: false });
    holoTag(g, "guards back on", 1.2, 0.6, -0.15, { css: HFI_CSS, w: 0.26 });
    reg(hits, guardsBack, "guards-back");
    const crewClear = box(g, 0.5, 0.05, 0.5, 0.0, 0.03, 1.4, 0x59c97b, { opacity: 0.25, transparent: true, cast: false });
    holoTag(g, "crew clear — restarting", 0.0, 0.25, 1.4, { css: HFI_CSS, w: 0.4 });
    reg(hits, crewClear, "crew-clear");

    // Laundry carts of damp sheets waiting at the feed end.
    const bin = group(g, -1.3, 0, 1.4);
    box(bin, 0.8, 0.6, 0.55, 0, 0.4, 0, 0x3a6fc9, { rough: 0.7 });
    slab(bin, 0.72, 0.18, 0.48, 0, 0.72, 0, 0xeae6dc, { radius: 0.05, rough: 0.95 });
    for (const sx of [-0.35, 0.35]) cyl(bin, 0.04, 0.04, 0.05, sx, 0.05, 0, 0x22262b, { rough: 0.7, seg: 10 });

    // A second bin of damp linen, the folded-sheet cart at the folder, a
    // steam gauge on the supply drop and the wall fan the heat asks for.
    const bin2 = group(g, -0.3, 0, 1.75, 0.2);
    box(bin2, 0.8, 0.6, 0.55, 0, 0.4, 0, 0x3a6fc9, { rough: 0.7 });
    slab(bin2, 0.72, 0.2, 0.48, 0, 0.74, 0, 0xe4e0d6, { radius: 0.05, rough: 0.95 });
    for (const sx of [-0.35, 0.35]) cyl(bin2, 0.04, 0.04, 0.05, sx, 0.05, 0, 0x22262b, { rough: 0.7, seg: 10 });
    const shelfCart = group(g, 2.7, 0, 1.3, -0.4);
    for (const y of [0.2, 0.6, 1.0]) box(shelfCart, 0.9, 0.03, 0.5, 0, y, 0, 0x9aa3ab, { rough: 0.4, metal: 0.6 });
    for (const sx of [-0.43, 0.43]) for (const sz of [-0.23, 0.23]) cyl(shelfCart, 0.012, 0.012, 1.0, sx, 0.5, sz, 0x6b737c, { rough: 0.4, metal: 0.6, seg: 6 });
    for (let i = 0; i < 3; i++) for (const y of [0.29, 0.69]) box(shelfCart, 0.26, 0.14, 0.4, -0.28 + i * 0.28, y, 0, 0xf6f4ee, { rough: 0.9 });
    const gaugeFace = cyl(g, 0.07, 0.07, 0.03, -1.75, 1.95, -2.44, 0xf4f4f0, { rough: 0.4, seg: 16 });
    gaugeFace.rotation.x = Math.PI / 2;
    cyl(g, 0.075, 0.075, 0.02, -1.75, 1.95, -2.46, 0x2b2f34, { rough: 0.4, metal: 0.6, seg: 16 }).rotation.x = Math.PI / 2;
    const fan = group(g, 2.6, 2.1, -2.62);
    cyl(fan, 0.32, 0.32, 0.1, 0, 0, 0, 0x4a5058, { rough: 0.5, metal: 0.5, seg: 20 }).rotation.x = Math.PI / 2;
    const blades = box(fan, 0.56, 0.06, 0.02, 0, 0, 0.06, 0x9aa3ab, { rough: 0.4, metal: 0.6 });
    box(fan, 0.06, 0.56, 0.02, 0, 0, 0.06, 0x9aa3ab, { rough: 0.4, metal: 0.6 });
    for (let i = 0; i < 3; i++) { const band = cyl(ironer, 0.145, 0.145, 0.04, -1.0 + i * 1.0, 0.9, 0.36, 0xd8d0bc, { rough: 0.9, seg: 16 }); band.rotation.z = Math.PI / 2; }

    // Crew: the folder operator and the shift lead (who walks to the lock).
    const folderHand = standingFigure(g, 2.9, -0.2, { ry: -1.9, cloth: 0x6b8a9a, trousers: 0x2b3138 });
    const lead = standingFigure(g, -2.7, -0.35, { ry: 1.2, cloth: 0x2f3a4a, trousers: 0x23282f });
    void hose; void CITY;

    let heat = 1;
    const leadHome = { x: -2.7, z: -0.35 };
    return {
      hits,
      footprint: 2.6,
      spawnLook: new THREE.Vector3(-0.2, 1.0, -0.8),
      onStepComplete(step) {
        if (step.id === "guard-walk") { zipTie.visible = false; panel.visible = false; bentEnd.rotation.z = 0; bentEnd.position.y = 1.02; }
        if (step.id === "feed-sheets") { wrap.visible = true; sheet.visible = false; }
        if (step.id === "jam-lockout") { myLock.visible = true; valveLock.visible = true; discHandle.rotation.z = -0.8; lever.rotation.y = 1.4; }
        if (step.id === "jam-clear") { wrap.visible = false; hook.position.set(0.4, 0.2, 0.5); }
        if (step.id === "restore-guards") myLock.visible = false;
        if (step.id === "restart") { discHandle.rotation.z = 0; valveLock.visible = false; lever.rotation.y = 0; }
      },
      onInterrupt(it) {
        if (it.id === "folder-reach") { door.rotation.y = -1.2; door.position.z = 0.55; folderHand.position.set(1.95, 0, 0.05); }
        if (it.id === "lock-pressure") lead.position.set(-2.45, 0, -1.3);
      },
      onInterruptEnd(it) {
        if (it.id === "folder-reach" && it.resolved === "answered") { estopKnob.material = mat(0x6b1010, { rough: 0.6 }); folderHand.position.set(2.9, 0, -0.2); door.rotation.y = 0; door.position.z = 0.2; }
        if (it.id === "lock-pressure" && it.resolved === "answered") lead.position.set(leadHome.x, 0, leadHome.z);
      },
      animate(t, dt, session) {
        const step = session?.step;
        const gg = session?.gauge;
        if (gg && !gg.committed && step?.id === "chest-temp") {
          repaint(displayFace, signFace(gg.t < 0.46 ? "CHEST LOW" : gg.t > 0.62 ? "CHEST HIGH" : "AT CARD", { bg: "#0d1624", accent: gg.t >= 0.46 && gg.t <= 0.62 ? "#59c97b" : "#f2ae14", fg: "#dfe8f6", scale: 0.45 }));
        }
        if (step?.id === "heat-wait" && session.holding) {
          heat = Math.max(0, heat - dt / 6);
          if (heat === 0) repaint(displayFace, signFace("SAFE TO REACH", { bg: "#0d1624", accent: "#59c97b", fg: "#dfe8f6", scale: 0.4 }));
        }
        blades.parent.rotation.z = t * 3;
        if (step?.id === "feed-sheets" && session.holding && sheet.visible) sheet.position.z = 0.76 - ((t * 0.3) % 0.4);
      },
    };
  },
};
