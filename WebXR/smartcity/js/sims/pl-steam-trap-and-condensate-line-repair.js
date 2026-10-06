import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, ball, torus, group, decal, repaint, signFace, paperFace, mat, particles,
} from "../../../shared/kit.js";
import {
  CITY, stationPad, holoPanel, holoTag, toolChest, instrument, cone,
  standingFigure, valveWheel, pipeRun, lockTag, deckPlateFace, paintedSteelFace,
  surfaceTexture, texturedMat, reg,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Steam Trap & Condensate Line Repair VR — Building Systems &
// Facilities, UA plumbers and pipefitters.
//
// A failed steam trap almost never announces itself as an emergency — it
// just quietly starts blowing live steam straight into the condensate
// return, or plugs solid and backs condensate up into the steam main behind
// it, and either failure keeps running for weeks before anyone traces the
// wasted energy or the water-hammer back to this one fitting. The repair
// itself is where the real danger sits: this line still has line pressure
// and line temperature in it long after the valve reads closed, and the
// only way to know it is actually safe to open is a vented, zeroed gauge,
// not a valve handle that stopped turning. And the new trap only proves
// itself once steam is let back into a cold line slowly enough that the
// condensate already sitting in the pipe boils off gently instead of being
// picked up as a slug of water travelling at steam velocity — a hammer that
// can crack a fitting seams away from where the trap was ever the problem.

const SCR_ACCENT = 0xd88a3a;

export const SIM_PL_STEAM_TRAP_AND_CONDENSATE_LINE_REPAIR = {
  id: "pl-steam-trap-and-condensate-line-repair",
  index: "pl-06",
  domain: "Building Systems & Facilities",
  trade: "UA pipefitter / steam and condensate systems",
  category: "Building Systems & Facilities",
  indoor: "plant",
  certification: "UA plumbers and pipefitters apprenticeship; ASME B31.9 building services piping; 29 CFR 1910.147 the control of hazardous energy; 29 CFR 1910.132 personal protective equipment; 8 CCR 3203 injury and illness prevention",
  name: "Steam Trap & Condensate Line Repair",
  title: simTitle("Steam Trap & Condensate Line Repair"),
  tagline: "A failed trap isolated, vented and proven at zero before the body ever opens, the correct trap type fitted for this application, and the line warmed back up slowly enough that condensate boils off instead of hammering through the pipe",
  accent: SCR_ACCENT,
  accentCss: "#d88a3a",
  parSeconds: 265,
  footprint: 2.2,
  badge: { id: "trap-proven", name: "Trap Proven", note: "A failed steam trap replaced on a vented, zeroed line and brought back into service without a hammer" },

  game: system({
    name: "Steam and Condensate",
    currency: "PSIG",
    ranks: ["Apprentice", "Pipefitter", "Journeyman", "Lead Fitter", "Steam Systems Certified"],
    badges: [
      { id: "zeroed-before-open", name: "Zeroed Before Open", note: "The line was proven at zero pressure before the trap body was opened", test: AWARD.stepClean("confirm-zero") },
      { id: "never-blind", name: "Never Blind", note: "Never opened a fitting on a line that had not been vented and tagged", test: AWARD.safe },
      { id: "steady-warmup", name: "Steady Warmup", note: "Held the warm-up rate inside the band the whole watch", test: AWARD.precise(0.7) },
    ],
    challenges: [
      { id: "clean-repair", name: "Clean Repair", note: "No corrections anywhere in the repair", test: AWARD.clean },
      { id: "unbroken-vent", name: "Unbroken Vent", note: "The vent held open until the gauge actually read zero", test: AWARD.unbroken },
      { id: "station-back-fast", name: "Station Back Fast", note: "Signed off inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "open-before-vented": "You opened the trap body before the line was vented and proven at zero. A valve reading closed only means the handle stopped turning — the pipe behind it can still be full of steam at full line pressure, and a fitting cracked open on that is a faceful of live steam with no warning before it happens.",
    "wrong-trap-type": "You fitted a trap type this application was never designed around. A trap chosen for the wrong condensate load or the wrong back-pressure either fails again within weeks or sits there quietly passing live steam the whole time, which is exactly the failure this repair was supposed to fix, not repeat with a new part.",
    "skip-tag-station": "You isolated the valves without tagging the station. A valve someone reopens because it looked idle, while this trap is sitting open on the bench, puts full steam pressure behind a fitter who has no way of knowing the line came back live.",
    "fast-warmup": "You opened the steam valve wide instead of cracking it slowly. Condensate already sitting in a cold line does not compress the way steam does, and a slug of it picked up at steam velocity hits the first elbow or fitting in its path like a hammer — on a system that was just repaired specifically to stop losing energy, not to crack a joint somewhere else along the run.",
  },

  lateNotes: {
    "steam-valve": "The steam valve stays closed and tagged until the new trap is bolted up and proven ready, not reopened the moment the old trap comes off.",
    "new-trap": "The new trap goes on only after the line reads zero on the gauge, not while there is still any doubt about what is behind the flange.",
    "warmup-gauge": "The warm-up happens slowly, after the trap is bolted up and torqued, never as the first move once the valve is cracked.",
  },

  // Two things that happen to a fitter whose hands are on a wrench at an
  // isolated trap station and whose eyes are on a warm-up gauge. See
  // shared/game.js.
  interrupts: [
    {
      id: "neighbour-trap-blows",
      kind: "The next trap station starts blowing through",
      // Armed on entering the vent hold step, so the window lands while
      // attention is on this station's own vent — answered at the
      // neighbouring station's valve, not this one's vent.
      after: "vent", delay: 3, seconds: 12,
      alert: "The trap station two bays down just started roaring — it sounds like it's blowing straight through to atmosphere.",
      cue: "That is a second failure, on a different station, happening right now — go isolate it before it wastes any more steam.",
      target: "neighbour-valve",
      why: "A trap blowing through live is losing steam and money for every second it runs, and a system pressure change from this station being worked on can be exactly what pushed a second, already-marginal trap over the edge — leaving it roaring while attention stays on this bench is how one repair visit turns into two, with the second one costing far more energy in the meantime.",
      missNote: "The neighbouring trap kept blowing through while the repair on this bench continued. Whatever steam that station wasted, it wasted for the whole rest of this job.",
      wrongNote: "It is the neighbouring station's own valve. This bench's vent was never what was roaring.",
    },
    {
      id: "condensate-backup-call",
      kind: "A floor reports the condensate return backing up",
      // Armed after the isolate step, answered at the temporary bypass
      // rather than at the trap being worked on.
      after: "isolate", delay: 3, seconds: 12,
      alert: "Facilities just called — a floor fed by this condensate main is reporting the return backing up since this station went down.",
      cue: "Open the temporary bypass so that floor's condensate has somewhere to go while this trap is out of service.",
      target: "bypass-valve",
      why: "Isolating this station for the repair also isolates every condensate load that was routing through it, and a floor with nowhere for its condensate to go backs up fast enough to matter well before this repair is finished — the bypass exists specifically to give that flow somewhere to go without waiting on the trap itself.",
      missNote: "The backup kept building on that floor while the repair carried on unaware of it. Whatever depended on that condensate return spent the whole repair with nowhere for it to drain.",
      wrongNote: "It is the bypass valve. The trap on this bench was never going to fix a floor with no path for its condensate right now.",
    },
  ],

  steps: [
    {
      id: "ticket", kind: "select", target: "repair-ticket",
      title: "Read the trap survey and repair ticket",
      cue: "Check the ultrasonic survey ticket: which trap failed, and whether it is blowing through or plugged.",
      why: "Blowing through and plugged are opposite failures with opposite symptoms, and the survey ticket is what tells a fitter which one they are walking up to before they isolate anything — a trap suspected of blowing through gets checked differently than one suspected of backing condensate up behind it.",
    },
    {
      id: "isolate", kind: "sequence",
      targets: ["steam-valve", "condensate-valve", "tag-station"],
      itemNames: { "steam-valve": "steam valve closed", "condensate-valve": "condensate valve closed", "tag-station": "station tagged" },
      title: "Isolate and tag the trap station",
      cue: "Close the steam valve, close the condensate valve, then tag the station with your name.",
      why: "Both valves have to close before this trap is isolated, because closing only the steam side still leaves the trap connected to whatever pressure is on the condensate return, and the tag is what stops either valve from being reopened by someone who has no way of knowing a fitter still has the trap apart.",
      outOfOrderNote: "Steam, then condensate, then the tag — the tag is what makes both closed valves mean something to the next person through this room.",
    },
    {
      id: "vent", kind: "hold", target: "vent-valve", seconds: 5,
      title: "Vent the trapped pressure",
      cue: "Hold the vent valve open until the line pressure bleeds down to nothing.",
      why: "A closed valve traps whatever pressure and temperature were in the line at the moment it closed, and that pressure has to be bled off deliberately through a vent before anyone treats the line as safe — assuming it is already at atmosphere because the valve is shut is exactly the assumption that gets a fitter burned.",
      holdBreakNote: "The vent closed before the pressure was fully bled — hold it open again until there is genuinely nothing left in this section.",
    },
    {
      id: "confirm-zero", kind: "gauge", target: "isolation-gauge",
      title: "Confirm the line reads zero",
      cue: "Read the isolation gauge and commit once it actually shows zero.",
      why: "This is the one reading that turns 'the valve is closed' into 'this line is safe to open,' and it is read on a gauge rather than assumed, because a valve that looks fully closed can still be passing a trickle that keeps a trapped section at some pressure well above zero.",
      gauge: { label: "LINE PRESSURE", speed: 0.6, green: [0.0, 0.08], readout: (t) => `${Math.round(t * 150)} psig`, missNote: "That is not zero — go back to the vent, this line is not proven safe to open yet." },
    },
    {
      id: "inspect-trap", kind: "find", noHint: true,
      targets: ["scale-strainer", "corroded-body"],
      itemNames: { "scale-strainer": "scale-clogged strainer", "corroded-body": "corroded trap body" },
      itemNotes: {
        "scale-strainer": "The strainer ahead of the trap is packed with scale — a trap starved by a clogged strainer can look like it failed on its own when the strainer was the actual problem.",
        "corroded-body": "The trap body itself has corroded through on one side, which is consistent with years of live steam passing through a mechanism that stopped closing properly long before anyone noticed.",
      },
      title: "Inspect the failed trap before removal",
      cue: "Look over the strainer and the trap body before anything comes off the line.",
      why: "A trap that failed because its strainer choked and one that failed because its own body wore through get fixed differently — one needs the strainer cleaned as part of the repair, the other just needs the new trap, and telling them apart happens now, with both pieces still in hand, not after the new trap goes in on top of an ignored problem.",
    },
    {
      id: "swap-trap", kind: "drag", target: "new-trap",
      title: "Bring the new trap into position",
      cue: "Drag the new trap onto the flange now the old one is off and the line is proven at zero.",
      why: "The new trap only goes on once the line has already been proven safe — putting a replacement part into position is the easy half of this repair, and it only happens after the harder half, proving the line is actually dead, is already done.",
      drag: { to: "trap-socket", radius: 0.4, missNote: "Not seated on the flange — a trap set down off the bolt pattern will not line up once the bolts go in." },
    },
    {
      id: "bolt-up", kind: "sequence",
      targets: ["bolt-snug", "bolt-torque"],
      itemNames: { "bolt-snug": "bolts snugged", "bolt-torque": "bolts torqued in pattern" },
      title: "Bolt the new trap up in pattern",
      cue: "Snug the flange bolts all round, then torque them in a cross pattern.",
      why: "A flange gasket pulled down unevenly on one side first is squeezed out of true on the other, and the cross pattern is what keeps the load even across the whole gasket face — the same reason any flanged joint on a pressure system goes together this way rather than bolt by bolt around the circle.",
      outOfOrderNote: "Snug all round first, then torque in the cross pattern — pulling one bolt fully home first is how the gasket rolls.",
    },
    {
      id: "trap-type", kind: "select", target: "trap-type-board",
      title: "Confirm the trap type against the application",
      cue: "Check the trap type board against this application before calling the swap complete.",
      why: "A thermodynamic trap, a float-and-thermostatic trap and an inverted bucket trap all handle condensate load and back pressure differently, and the board is what confirms the part actually in hand matches what this specific application needs — not just that a trap of roughly the right size and connection got installed.",
    },
    {
      id: "warm-up-open", kind: "turn", target: "steam-valve",
      title: "Crack the steam valve to start the warm-up",
      cue: "Open the steam valve slowly — a crack, not a swing to full open.",
      why: "The line is still cold and still has condensate sitting in the low points from being out of service, and cracking the valve is what lets steam begin warming the pipe and boiling that condensate off gently instead of shoving it ahead of a full-pressure slug the moment the valve swings wide.",
      turn: { turns: 0.2, axis: "y", label: "STEAM VALVE" },
    },
    {
      id: "warm-up-watch", kind: "track", target: "warmup-gauge", seconds: 8,
      title: "Hold a steady warm-up rate",
      cue: "Keep the warm-up rate in the band while the line comes up to temperature.",
      why: "A rate too fast still risks picking up condensate as a hammer even with the valve only part open, and a rate left too slow leaves the line half-warmed and half-cold for far longer than it needs to be — the band exists because both failure directions cost something, just not the same something.",
      track: { start: 0.2, green: [0.35, 0.55], rise: 0.1, fall: 0.15, drift: 0.12, label: "WARM-UP RATE", readout: (v) => (v < 0.35 ? "too slow — line still cold" : v > 0.55 ? "too fast — risk of a hammer" : "warming steadily") },
      holdBreakNote: "That warm-up ran outside the band — ease the valve back and bring the rate under control before it goes any further.",
    },
    {
      id: "check-diff", kind: "gauge", target: "differential-gauge",
      title: "Check the temperature differential across the new trap",
      cue: "Read the differential between the upstream and downstream sides and commit once it is in range.",
      why: "A trap holding back steam properly shows a real temperature drop across it — condensate leaving cooler than the steam feeding it — and a differential that reads too small says the new trap is passing live steam straight through exactly like the one it just replaced.",
      gauge: { label: "ΔT ACROSS TRAP", speed: 0.65, green: [0.4, 0.65], readout: (t) => `${Math.round(t * 40)} degF drop`, missNote: "That differential is too small — this trap may be passing steam through, check it again before calling the repair finished." },
    },
    {
      id: "open-condensate", kind: "turn", target: "condensate-valve",
      title: "Open the condensate return valve",
      cue: "Open the condensate valve now the trap is proven and the line is up to temperature.",
      why: "The condensate return only goes live again once there is a working trap actually holding steam back from it — opening it earlier, while the trap is still unproven, risks pushing live steam into a return main that was never rated to see it.",
      turn: { turns: 0.75, axis: "y", label: "CONDENSATE VALVE" },
    },
    {
      id: "close-out", kind: "sequence",
      targets: ["tag-station", "confirm-normal"],
      itemNames: { "tag-station": "tag removed", "confirm-normal": "station confirmed normal" },
      title: "Close the station out",
      cue: "Remove the isolation tag, then confirm the station reads normal.",
      why: "Removing the tag before confirming the station is actually reading normal tells the next person this station is clear to touch before that is actually true — the confirmation comes first in spirit even though the tag physically comes off in this order, because the tag is what protects anyone reading it in between.",
      outOfOrderNote: "Tag off, then confirm normal — the confirmation is what the removed tag is vouching for.",
    },
    {
      id: "log", kind: "select", target: "repair-log",
      title: "Complete the repair log",
      cue: "Fill in the repair log with the failure mode, the trap type installed, and the differential reading.",
      why: "The next survey of this system checks this trap against what got written down today — a repair with no record of the failure mode or the differential reading leaves nothing for that next survey to compare against, which is exactly the blind spot that let the original trap fail unnoticed for as long as it did.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.2, SCR_ACCENT);

    const floorTex = surfaceTexture((ctx, w, h) => deckPlateFace(ctx, w, h, { base: "#454042", base2: "#3a3638" }), { repeat: 5 });
    box(g, 5.2, 0.1, 4.4, 0, 0.05, 0, 0xffffff, { rough: 0.6 }).material = texturedMat(floorTex, { color: 0xcfc9ca, rough: 0.6, metal: 0.15 });

    const blockTex = surfaceTexture((ctx, w, h) => {
      ctx.fillStyle = "#8a8580"; ctx.fillRect(0, 0, w, h);
      const rows = 5, cols = 9;
      for (let r = 0; r <= rows; r++) { ctx.strokeStyle = "rgba(0,0,0,0.25)"; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(0, (r / rows) * h); ctx.lineTo(w, (r / rows) * h); ctx.stroke(); }
      for (let r = 0; r < rows; r++) { const off = r % 2 ? (w / cols) / 2 : 0; for (let c = 0; c <= cols; c++) { const x = off + (c / cols) * w; ctx.beginPath(); ctx.moveTo(x, (r / rows) * h); ctx.lineTo(x, ((r + 1) / rows) * h); ctx.stroke(); } }
    }, { repeat: 2 });
    box(g, 5.2, 2.6, 0.12, 0, 1.4, -2.0, 0xffffff, { rough: 0.9 }).material = texturedMat(blockTex, { color: 0x8a8580, rough: 0.9 });
    box(g, 5.2, 0.14, 0.3, 0, 2.75, -2.0, 0x99a2a8, { rough: 0.8 });

    // The steam main overhead, insulated, with the trap station branching
    // down to bench height.
    const insulTex = surfaceTexture((ctx, w, h) => {
      ctx.fillStyle = "#cfc7b0"; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "rgba(0,0,0,0.08)";
      for (let i = 0; i < 10; i++) ctx.fillRect(0, (i / 10) * h, w, 1.5);
    }, { repeat: 3 });
    const main = group(g, 0, 2.3, -1.7);
    const mainPipe = cyl(main, 0.1, 0.1, 3.2, 0, 0, 0, 0xffffff, { rough: 0.6, seg: 18 });
    mainPipe.rotation.z = Math.PI / 2;
    mainPipe.material = texturedMat(insulTex, { color: 0xcfc7b0, rough: 0.7 });
    holoTag(main, "steam main", -1.4, 0.2, 0, { css: "#d88a3a", w: 0.32 });

    const station = group(g, 0.5, 0.0, -1.55);
    const steamRiser = cyl(station, 0.05, 0.05, 1.15, 0, 1.75, 0, 0x8a939b, { rough: 0.5, metal: 0.6, seg: 14 });
    void steamRiser;
    const steamValve = valveWheel(station, 0, 1.55, 0, { color: 0xd8232a, body: 0x2b2f34, r: 0.09 });
    holoTag(station, "steam valve", 0, 1.82, 0, { css: "#d88a3a", w: 0.32 });
    reg(hits, steamValve, "steam-valve");
    const lock = lockTag(station, 0.16, 1.4, 0, { color: 0xd8232a, lines: ["STEAM", "STATION TAG"] });
    reg(hits, lock, "tag-station");
    const skipTagTarget = box(g, 0.22, 0.22, 0.22, -0.4, 1.4, -1.55, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "isolate without a tag?", -0.4, 1.62, -1.55, { css: "#d2312b", w: 0.5 });
    reg(hits, skipTagTarget, "skip-tag-station");

    const trapBody = group(station, 0, 1.15, 0, 0.3);
    const strainer = cyl(trapBody, 0.06, 0.06, 0.14, -0.2, 0, 0, 0xb8834a, { rough: 0.5, metal: 0.5, seg: 14 });
    strainer.rotation.z = Math.PI / 2;
    reg(hits, strainer, "scale-strainer");
    const oldTrap = cyl(trapBody, 0.07, 0.07, 0.2, 0.1, 0, 0, 0x8a5a3a, { rough: 0.55, metal: 0.4, seg: 14 });
    reg(hits, oldTrap, "corroded-body");
    hits["trap-socket"] = trapBody;

    const ventValve = box(station, 0.08, 0.06, 0.06, 0.3, 1.0, 0.1, 0xd2312b, { rough: 0.5 });
    holoTag(station, "vent valve", 0.3, 1.2, 0.1, { css: "#d88a3a", w: 0.3 });
    reg(hits, ventValve, "vent-valve");
    const isoGauge = instrument(station, -0.25, 1.0, 0.1, { idle: "-- psig", color: 0x2b2f34, w: 0.15, d: 0.18 });
    holoTag(station, "isolation gauge", -0.25, 1.2, 0.1, { css: "#d88a3a", w: 0.36 });
    reg(hits, isoGauge, "isolation-gauge");
    const openEarlyTarget = box(g, 0.22, 0.22, 0.22, 0.6, 1.1, -1.3, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "open the trap body now?", 0.6, 1.32, -1.3, { css: "#d2312b", w: 0.5 });
    reg(hits, openEarlyTarget, "open-before-vented");

    const condensateValve = valveWheel(station, 0, 0.65, 0, { color: 0x4fd1ff, body: 0x2b2f34, r: 0.08 });
    holoTag(station, "condensate valve", 0, 0.9, 0, { css: "#d88a3a", w: 0.42 });
    reg(hits, condensateValve, "condensate-valve");
    const normalLight = ball(station, 0.02, -0.2, 0.65, 0.1, 0x3a3f44, { emissive: 0x000000, ei: 0 });
    holoTag(station, "station normal", -0.2, 0.86, 0.1, { css: "#d88a3a", w: 0.36 });
    reg(hits, normalLight, "confirm-normal");

    // New trap, staged, plus bolt stations and the trap-type board.
    const newTrap = group(g, 1.6, 0.9, -0.9, -0.4);
    cyl(newTrap, 0.07, 0.07, 0.2, 0, 0, 0, 0xd8a35a, { rough: 0.45, metal: 0.4, seg: 16 });
    torus(newTrap, 0.07, 0.012, 0.11, 0, 0, 0x8a939b, { rough: 0.4, metal: 0.6, seg: 8, seg2: 16 });
    holoTag(newTrap, "new trap", 0, 0.16, 0, { css: "#d88a3a", w: 0.28 });
    reg(hits, newTrap, "new-trap");
    const boltA = torus(g, 0.02, 0.008, 1.35, 0.98, -1.4, 0xd2312b, { rough: 0.5, seg: 8, seg2: 14 });
    reg(hits, boltA, "bolt-snug");
    const boltB = torus(g, 0.02, 0.008, 1.55, 0.98, -1.4, 0xd2312b, { rough: 0.5, seg: 8, seg2: 14 });
    reg(hits, boltB, "bolt-torque");

    const typeBoard = decal(g, 0.34, 0.42, 1.9, 1.3, -1.9, paperFace("TRAP TYPE BOARD", ["This station: thermodynamic", "Cv per manufacturer's manual", "Back pressure per drawing"], { scale: 0.8 }));
    holoTag(g, "trap type board", 1.9, 1.6, -1.9, { css: "#d88a3a", w: 0.36 });
    reg(hits, typeBoard, "trap-type-board");
    const wrongTrapTarget = box(g, 0.22, 0.22, 0.22, 2.3, 0.9, -0.9, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "grab whatever's on the shelf?", 2.3, 1.12, -0.9, { css: "#d2312b", w: 0.56 });
    reg(hits, wrongTrapTarget, "wrong-trap-type");

    const warmupGaugeInst = instrument(station, 0.3, 1.55, 0.14, { idle: "-- degF", color: 0x2b2f34, w: 0.15, d: 0.17 });
    holoTag(station, "warm-up gauge", 0.3, 1.75, 0.14, { css: "#d88a3a", w: 0.32 });
    reg(hits, warmupGaugeInst, "warmup-gauge");
    const fastWarmupTarget = box(g, 0.22, 0.22, 0.22, -0.9, 1.9, -1.4, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "just swing it wide open?", -0.9, 2.12, -1.4, { css: "#d2312b", w: 0.5 });
    reg(hits, fastWarmupTarget, "fast-warmup");

    const diffGauge = instrument(g, 1.1, 1.4, -1.2, { idle: "-- degF", color: 0x2b2f34, w: 0.15, d: 0.17 });
    holoTag(g, "differential gauge", 1.1, 1.6, -1.2, { css: "#d88a3a", w: 0.36 });
    reg(hits, diffGauge, "differential-gauge");

    // Neighbouring trap station, and the bypass.
    const neighbour = group(g, -1.9, 0, -1.5, 0.2);
    cyl(neighbour, 0.05, 0.05, 0.9, 0, 1.3, 0, 0x8a939b, { rough: 0.5, metal: 0.6, seg: 12 });
    const neighbourValve = valveWheel(neighbour, 0, 1.1, 0, { color: 0xd8232a, body: 0x2b2f34, r: 0.08 });
    holoTag(neighbour, "neighbouring trap station", 0, 1.35, 0, { css: "#d88a3a", w: 0.5 });
    reg(hits, neighbourValve, "neighbour-valve");
    const steamPuff = particles(neighbour, 16, 0xe8eef2, { size: 0.05, life: 0.8, additive: false, opacity: 0.5 });
    steamPuff.position.set(0, 1.1, 0);
    steamPuff.visible = false;

    const bypass = group(g, -1.4, 0.3, -0.6, -0.3);
    pipeRun(bypass, [[-0.5, 0, 0], [0.5, 0, 0]], 0.04, 0x9aa3ab, {});
    const bypassValve = valveWheel(bypass, 0, 0, 0.12, { color: 0x59c97b, body: 0x2b2f34, r: 0.07 });
    holoTag(bypass, "temporary bypass", 0, 0.24, 0.12, { css: "#d88a3a", w: 0.4 });
    reg(hits, bypassValve, "bypass-valve");

    // Bench: repair ticket, log.
    const bench = group(g, -1.9, 0.1, 1.0);
    box(bench, 1.2, 0.76, 0.55, 0, 0.38, 0, 0x53606b, { rough: 0.7, metal: 0.3 });
    const ticket = decal(bench, 0.34, 0.42, -0.35, 0.78, 0, paperFace("TRAP SURVEY", ["Station: TR-14", "Ultrasonic: intermittent", "Suspect: plugged / cold", "Last serviced 3 yrs ago"], { scale: 0.82 }));
    ticket.rotation.x = -Math.PI / 2;
    holoTag(bench, "repair ticket", -0.35, 0.98, 0, { css: "#d88a3a", w: 0.32 });
    reg(hits, ticket, "repair-ticket");
    const logPaper = decal(bench, 0.32, 0.4, 0.35, 0.78, 0.02, paperFace("REPAIR LOG", ["Failure mode ______", "Trap type installed ______", "ΔT reading ______"], { scale: 0.85 }));
    logPaper.rotation.x = -Math.PI / 2;
    holoTag(bench, "repair log", 0.35, 0.98, 0.05, { css: "#d88a3a", w: 0.3 });
    reg(hits, logPaper, "repair-log");

    const boardPanel = group(g, 2.0, 0, 1.8, -0.5);
    holoPanel(boardPanel, 0.95, 0.6, 0, 1.25, 0, (ctx, w, h) => {
      ctx.fillStyle = "#2a1608"; ctx.fillRect(0, 0, w, h); ctx.fillStyle = "#d88a3a"; ctx.fillRect(0, 0, w, 6);
      ctx.font = `600 ${Math.round(h * 0.11)}px 'Barlow Condensed', Arial, sans-serif`; ctx.textAlign = "left"; ctx.textBaseline = "middle";
      ctx.fillStyle = "#fbe9d4"; ctx.fillText("TRAP STATION TR-14", w * 0.06, h * 0.14);
      ctx.font = `${Math.round(h * 0.08)}px Arial, sans-serif`; ctx.fillStyle = "#fff3e2";
      ["Isolate both valves and tag before opening anything", "Vent and prove zero before the body comes off", "Match the trap type to this application", "Crack the steam valve — never swing it wide", "Check the differential before signing off"].forEach((l, i) => ctx.fillText(l, w * 0.06, h * (0.28 + i * 0.12)));
    }, { accent: SCR_ACCENT });

    const fitter = standingFigure(g, -1.2, 1.4, { ry: -2.2, cloth: 0x8a5a2f });
    holoTag(fitter, "pipefitter", 0, 1.9, 0, { css: "#d88a3a", w: 0.3 });
    toolChest(g, 2.3, 1.6);
    for (const [x, z] of [[2.3, -2.0], [-2.4, -2.0]]) cone(g, x, z);

    let blowing = false;
    return {
      hits,
      spawnLook: new THREE.Vector3(0.2, 1.3, -1.2),
      onStep() {},
      onStepComplete(step) {
        if (step.id === "confirm-zero") repaint(isoGauge.userData.screen, signFace("0 PSIG", { bg: "#0d1c14", accent: "#59c97b", fg: "#e9ffe9", scale: 0.55 }));
        if (step.id === "inspect-trap") { strainer.visible = false; oldTrap.visible = false; }
        if (step.id === "swap-trap") { newTrap.position.set(0.5, 1.15, -1.55); newTrap.rotation.y = 0; }
        if (step.id === "warm-up-watch") repaint(warmupGaugeInst.userData.screen, signFace("WARM", { bg: "#0d1c14", accent: "#f2a13a", fg: "#fff3e2", scale: 0.5 }));
        if (step.id === "check-diff") repaint(diffGauge.userData.screen, signFace("HOLDING", { bg: "#0d1c14", accent: "#59c97b", fg: "#e9ffe9", scale: 0.5 }));
        if (step.id === "close-out") normalLight.material = mat(0x59c97b, { emissive: 0x59c97b, ei: 2.0 });
      },
      onHazard() {},
      onInterrupt(it) {
        if (it.id === "neighbour-trap-blows") { blowing = true; steamPuff.visible = true; neighbourValve.userData.wheel.material = mat(0xd2312b, { emissive: 0xd2312b, ei: 1.6 }); }
        if (it.id === "condensate-backup-call") bypassValve.userData.wheel.material = mat(0xf2c14b, { emissive: 0xf2c14b, ei: 1.6 });
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "neighbour-trap-blows") { blowing = false; steamPuff.visible = false; neighbourValve.userData.wheel.material = mat(0xd8232a, { rough: 0.6 }); }
        if (it.id === "condensate-backup-call") bypassValve.userData.wheel.material = mat(0x59c97b, { rough: 0.6 });
      },
      animate(t, dt, session) {
        if (blowing) steamPuff.userData.step(dt, new THREE.Vector3(0, 0.6, 0), 0.05, 0.4, -0.3);
        if (session?.turn && session.step?.id === "warm-up-open") steamValve.userData.wheel.rotation.y = session.turn.amount * Math.PI * 2;
        if (session?.turn && session.step?.id === "open-condensate") condensateValve.userData.wheel.rotation.y = session.turn.amount * Math.PI * 2;
      },
    };
  },
};
