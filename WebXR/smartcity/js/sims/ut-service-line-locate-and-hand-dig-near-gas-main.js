import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, ball, torus, group, decal, repaint, signFace, paperFace, particles, mat,
} from "../../../shared/kit.js";
import {
  CITY, stationPad, holoPanel, holoTag, toolChest, instrument, cone,
  standingFigure, lockTag, reg,
  surfaceTexture, texturedMat, gravelFace, asphaltFace, gratingFace, palette,
} from "../citykit.js";
import { skidSteer } from "../../../shared/equipment.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Service-Line Locate & Hand-Dig Near a Marked Gas Main VR —
// Energy & Power, UWUA / IBEW gas-utility damage-prevention crew.
//
// A locate ticket does not put a pipe in the ground; it tells this crew
// where the operator believes one already is, within a tolerance zone that
// is a promise with a margin built into it, not a guarantee down to the
// inch. Everything inside that zone is worked by hand or by vacuum, because
// a power tool cannot tell the difference between soil and a pipe wall
// until it has already found out the hard way. The main is proven — not
// assumed — by exposing it, and once it is open to the air it stays
// supported and the actual depth found is the depth that goes back to the
// people who will dig here next, because a locate that is never corrected
// stays wrong for every crew after this one.
// Sited generically: no real street, main size or depth is invented.

const UT3_ACCENT = 0xf2ae14;
const UT3_CSS = "#f2ae14";
const UT3_PAL = palette("utility");

export const SIM_UT_SERVICE_LINE_LOCATE_AND_HAND_DIG_NEAR_GAS_MAIN = {
  id: "ut-service-line-locate-and-hand-dig-near-gas-main",
  index: "ut-03",
  domain: "Energy",
  trade: "UWUA / IBEW gas-utility locate and damage-prevention crew",
  category: "Energy & Power",
  weather: "overcast",
  certification: "UWUA / IBEW gas-utility locate and damage-prevention training; 49 CFR Part 192 (PHMSA) for the operator's damage-prevention and tolerance-zone requirements around a marked facility; OSHA 29 CFR 1926 Subpart P excavations for the hand-dig itself; the one-call locate ticket and the operator's own positive-response and paint-and-flag standard",
  name: "Service-Line Locate & Hand-Dig Near a Marked Gas Main",
  title: simTitle("Service-Line Locate & Hand-Dig"),
  tagline: "Everything inside the tolerance zone worked by hand or by vacuum, the main proven by exposing it rather than assumed from the paint, and the depth actually found written back for the next crew that digs here",
  accent: UT3_ACCENT,
  accentCss: UT3_CSS,
  parSeconds: 300,
  footprint: 2.5,
  badge: { id: "main-proven-by-hand", name: "Main Proven By Hand", note: "A marked gas main exposed inside its tolerance zone with hand tools and vacuum only, supported once open, and its actual depth logged for the record" },

  game: system({
    name: "Damage Prevention Authority",
    currency: "SCFH",
    ranks: ["Apprentice", "Locate Crew", "Damage Prevention Tech", "Crew Lead", "Damage Prevention Authority Certified"],
    badges: [
      { id: "ticket-before-tools", name: "Ticket Before Tools", note: "The locate ticket was read and the marks verified before any tool touched the ground", test: AWARD.stepClean("verify-marks") },
      { id: "hand-tools-held", name: "Hand Tools Held", note: "Nothing but hand tools and vacuum ever entered the tolerance zone", test: AWARD.safe },
      { id: "depth-read-not-guessed", name: "Depth Read, Not Guessed", note: "Held the depth reading steady before it went in the log", test: AWARD.precise(0.7) },
    ],
    challenges: [
      { id: "clean-expose", name: "Clean Expose", note: "No corrections from the ticket to the log", test: AWARD.clean },
      { id: "unbroken-watch", name: "Unbroken Watch", note: "The clearance watch ran to completion without a break", test: AWARD.unbroken },
      { id: "zone-clear-fast", name: "Zone Clear Fast", note: "Backfilled and logged inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "skip-locate-check": "You went to start potholing before verifying the paint marks against the locate ticket. A mark that has faded or a mark that conflicts with the ticket's own drawing is exactly the situation this check exists to catch — digging on the strength of paint alone, without reading what it is supposed to mean, digs on a guess.",
    "power-tool-in-tolerance-zone": "You went to bring a power tool inside the staked tolerance zone. Nothing inside that zone is worked by anything but hand tools and vacuum excavation, because a bucket or a blade cannot feel the difference between soil and a pipe wall until the instant it has already gone through one.",
    "ignition-source-near-main": "You went to bring an open flame or a non-rated spark source right up to the exposed gas main. An exposed main is still a main, and whatever gas is inside it is one bad seam or one loose fitting away from being outside it too — nothing that can throw a spark belongs anywhere near it once it is open to the air.",
    "backfill-without-support": "You went to backfill over the exposed main without supporting it first. A main left to sag under its own weight in an open trench, then buried in that sagging position, is a main with a bend in it that was never part of the design — supported first, it goes back into the ground the same shape it came out in.",
  },

  lateNotes: {
    "vac-wand": "The vac wand goes to work only after the tolerance zone is staked and the hand-tools-only sign is up — not before either is in place.",
    "support-sling": "The sling goes under the main once it is fully exposed and the depth has been read, not while it is still half-buried.",
  },

  // Two things that happen to a crew whose hands are on a vac wand or
  // watching a clearance gauge. See shared/game.js.
  interrupts: [
    {
      id: "adjacent-crew-approaching",
      kind: "Another crew's skid steer stages at the zone edge",
      after: "vac-pothole", delay: 3, seconds: 12,
      alert: "A skid steer from another crew has pulled up right at the edge of the staked tolerance zone and is about to swing its bucket in — the operator has no idea what this crew has found under here.",
      cue: "Get on the radio and stop them before that bucket moves.",
      target: "adjacent-crew-radio",
      why: "The tolerance zone this crew staked means nothing to an operator who was never told it is there, and a bucket swung into ground this crew has not finished potholing finds out what is underneath it the same way any unmarked strike does — the radio is what makes the zone real to the one person who cannot see it.",
      missNote: "The skid steer kept closing on the zone with nobody telling the operator what was staked there. A tolerance zone that only this crew knows about is not a tolerance zone to anyone else on this block.",
      wrongNote: "It is the radio, to the crew that does not know this zone exists. The vac wand has nothing to do with a machine about to swing in from outside it.",
    },
    {
      id: "locator-callback",
      kind: "The gas utility's own locator calls back",
      after: "clearance-watch", delay: 3, seconds: 13,
      alert: "The gas utility's own locator is calling back to confirm the positive response on this ticket before this crew backfills over what was found.",
      cue: "Answer the call and confirm the as-found depth before anything goes back in the ground.",
      target: "locate-phone",
      why: "A positive response that is never confirmed against what was actually found leaves the ticket saying one thing and the ground saying another for the next crew that pulls this same locate — answering the call is what keeps the record honest before this trench closes over the only chance to check it.",
      missNote: "The call went unanswered while the crew moved toward backfill. The ticket's positive response was never reconciled against what this crew actually found in the ground.",
      wrongNote: "It is the locator's call. Nothing about the clearance watch itself has changed — this is about the ticket's own record.",
    },
  ],

  supportLine: "your utility's employee assistance programme, or your UWUA or IBEW steward if you are not sure how to reach it",

  steps: [
    {
      id: "ppe-and-ignition-check", kind: "select", target: "ppe-board",
      title: "Confirm PPE and clear ignition sources",
      cue: "Check the crew's PPE and confirm nothing that can spark or throw an open flame is staged near where this main is marked.",
      why: "This crew is about to open ground around a gas main that is marked, not yet proven, and the time to clear ignition sources is before anything is exposed — not after the main is already open to the air and the margin for a mistake has gone from wide to none.",
    },
    {
      id: "locate-ticket", kind: "select", target: "locate-ticket",
      title: "Read the locate ticket",
      cue: "Check the ticket: what is marked, the tolerance zone width, and the mark-colour legend.",
      why: "The ticket is what turns paint on the ground into information — the tolerance zone width and what each colour actually means are not things a crew can safely guess from the marks alone, and a locate worked from memory instead of the ticket is a locate worked from habit.",
    },
    {
      id: "verify-marks", kind: "find", noHint: true,
      targets: ["confirmed-mark", "faded-mark"],
      itemNames: { "confirmed-mark": "the mark that matches the ticket", "faded-mark": "a mark too faded to trust" },
      itemNotes: {
        "confirmed-mark": "This mark's colour and position match the ticket exactly — it is the one this dig is actually staked from.",
        "faded-mark": "This mark has weathered to the point it could be read as either colour in this light — a re-locate call goes out before anything is staked from it, not a best guess.",
      },
      title: "Verify the paint marks against the ticket",
      cue: "Walk the marks on the ground and find which ones actually match the ticket — and which one does not.",
      why: "Paint on the ground is only as good as the read on it, and a faded or ambiguous mark trusted at face value can stake an entire tolerance zone off the wrong line — caught here, a re-locate call costs an hour; missed here, it costs whatever is under the wrong mark.",
    },
    {
      id: "stake-tolerance-zone", kind: "sequence",
      targets: ["stake-a", "stake-b"],
      itemNames: { "stake-a": "near stake set", "stake-b": "far stake set" },
      title: "Stake the tolerance zone",
      cue: "Set both stakes marking the tolerance zone width around the confirmed mark.",
      why: "The tolerance zone is not the paint line itself — it is a margin either side of it, and staking it out loud, in a shape every crew member can see, is what turns a number on the ticket into a boundary nobody on this job has to remember by heart.",
      outOfOrderNote: "Near stake, then the far stake — either alone leaves the zone's width a guess rather than a marked boundary.",
    },
    {
      id: "hand-tools-only-sign", kind: "select", target: "hand-tools-sign",
      title: "Post the hand-tools-only sign",
      cue: "Set the sign declaring hand tools and vacuum excavation only inside the staked zone.",
      why: "A sign at the edge of the zone is what stops a second person on this crew, or a passing operator, from assuming a shovel or a bucket is fine here just because nobody told them otherwise — the boundary is only as good as how visibly it is marked.",
    },
    {
      id: "vac-pothole", kind: "hold", target: "vac-wand", seconds: 5,
      title: "Pothole the zone with the vac wand",
      cue: "Hold the vacuum wand steady over the zone until the soil above the main is cleared.",
      why: "Vacuum excavation removes soil without the mass or the edge that a power tool brings to the same job — held steady and worked in from above, it clears ground down to the main without the one failure mode this whole zone was staked to prevent.",
      holdBreakNote: "The wand came off before the soil above the main was cleared — hold it again, a partly cleared pothole still hides exactly what this zone exists to protect.",
    },
    {
      id: "hand-expose", kind: "find",
      targets: ["exposed-main", "unmarked-utility"],
      itemNames: { "exposed-main": "the gas main, now exposed", "unmarked-utility": "a second line the ticket never marked" },
      itemNotes: {
        "exposed-main": "The main is exposed and running exactly where the confirmed mark said it would — the pothole is what proves that, not the paint on its own.",
        "unmarked-utility": "There is a second line in this pothole that the ticket never marked at all — found only because this was hand-exposed rather than assumed clear once the marked main was located.",
      },
      title: "Hand-expose what is actually in the ground",
      cue: "Finish exposing the pothole by hand and find both the main the ticket marked and anything it did not.",
      why: "A ticket marks what the records say should be there, and a hand-exposed pothole is the only way to find what the records missed — a second, unmarked line found now is found by a gloved hand, not by whatever comes after this crew with less reason to expect it.",
    },
    {
      id: "depth-check", kind: "gauge", target: "depth-gauge",
      title: "Measure the actual depth of cover",
      cue: "Bring the depth reading to where the exposed main actually sits, then commit.",
      why: "The ticket's stated depth is what the operator's last record says, and this measurement is what the ground says right now — the two are compared here because a locate record that drifted from reality over the years only gets corrected when somebody actually measures it again.",
      gauge: { label: "DEPTH OF COVER", speed: 0.65, green: [0.4, 0.58], readout: (t) => `${(t * 5).toFixed(1)} ft`, missNote: "That does not match what the pothole actually shows — reseat the tape on the main's crown and read it again." },
    },
    {
      id: "probe-rod", kind: "turn", target: "probe-rod",
      title: "Hand-probe the unmarked line",
      cue: "Turn the probe rod down by hand alongside the unmarked line to find its depth before anything else touches it.",
      why: "The unmarked line has no ticket and no tolerance zone of its own, so a hand probe — turned down carefully rather than driven — is the only way to learn anything about it without becoming the reason it needed a ticket in the first place.",
      turn: { turns: 0.6, axis: "y", label: "PROBE ROD" },
    },
    {
      id: "support-sling", kind: "drag", target: "support-sling",
      title: "Sling the exposed main",
      cue: "Bring the support sling under the exposed main so it is carried, not sagging on its own.",
      why: "An exposed main with nothing under it is held up only by whatever backfill is still touching its ends, and that support disappears a little more with every hour the trench stays open — slung now, the main's own weight goes onto webbing built for it instead of onto a pipe wall that was never designed to span open ground.",
      drag: { to: "sling-cradle", radius: 0.45, missNote: "Not under the main — a sling that missed the pipe carries nothing." },
    },
    {
      id: "clearance-watch", kind: "track", target: "clearance-gauge", seconds: 7,
      title: "Watch the clearance from the staged equipment",
      cue: "Watch the clearance reading stay in band while the other crew's equipment is staged at the zone edge.",
      why: "Staged is not the same as stopped — equipment idling at the edge of a tolerance zone can creep, settle or simply be nudged closer without anyone meaning it to, and the only way to know it has not encroached on an open pothole is to watch the clearance rather than assume the last look still holds.",
      track: { start: 0.6, green: [0.45, 0.75], rise: 0.1, fall: 0.4, drift: 0.14, label: "ZONE CLEARANCE", readout: (v) => (v < 0.45 ? "encroaching on the zone" : "clear") },
      holdBreakNote: "That clearance dropped out of band during the watch — the staged equipment has encroached on the zone, and it has to be waved back before anything else happens here.",
    },
    {
      id: "call-in-as-found", kind: "select", target: "locate-phone",
      title: "Call in the as-found location",
      cue: "Call the locate company or the engineer of record with the actual depth and offset this pothole found.",
      why: "A locate ticket that is never corrected against what was actually found stays exactly as wrong as it started for every crew that pulls it after this one — the call is what turns one crew's careful pothole into a record the next crew can actually trust.",
    },
    {
      id: "backfill", kind: "sequence",
      targets: ["bedding-sand", "warning-tape", "compact-lift"],
      itemNames: { "bedding-sand": "bedding sand placed", "warning-tape": "warning tape laid", "compact-lift": "compacted in lifts" },
      title: "Backfill in order",
      cue: "Place bedding sand around the main, lay warning tape above it, then compact the backfill in lifts.",
      why: "The bedding protects the main from whatever is backfilled on top of it, the tape is what the next shovel or bucket sees before it reaches pipe depth, and compacting in lifts rather than all at once is what keeps this trench from settling into a dip the first hard rain finds.",
      outOfOrderNote: "Bedding, then tape, then compact in lifts — tape buried under uncompacted fill settles to the wrong depth to warn anybody of anything.",
    },
    {
      id: "as-built-log", kind: "select", target: "as-built-log",
      title: "Complete the as-built log",
      cue: "Fill in the as-built log: the actual depth and offset found, and the unmarked line reported.",
      why: "This log is the one honest record of what was actually under this street on this day — the next locate technician who works this block reads it before they read anything else, and a log that only repeats the ticket's own numbers back tells them nothing they did not already know.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.5, UT3_ACCENT);

    // ---------------------------------------------------------------- ground
    const groundTex = surfaceTexture((ctx, w, h) => gravelFace(ctx, w, h, { base: "#5e5a4e", base2: "#524e43" }), { repeat: 4, px: 320 });
    const groundPlane = box(g, 5.4, 0.06, 4.6, 0, 0.03, 0, 0xffffff, { rough: 0.95 });
    groundPlane.material = texturedMat(groundTex, { rough: 0.95, metal: 0.02, color: UT3_PAL.ground });
    const walkTex = surfaceTexture((ctx, w, h) => asphaltFace(ctx, w, h, { base: "#2c2e30", base2: "#26282a" }), { repeat: 3, px: 320 });
    const walk = box(g, 5.4, 0.07, 1.2, 0, 0.035, -2.3, 0xffffff, { rough: 0.92 });
    walk.material = texturedMat(walkTex, { rough: 0.92, metal: 0.02 });

    // The staked tolerance zone: a translucent painted rectangle on the ground.
    const zoneTex = surfaceTexture((ctx, w, h) => {
      ctx.fillStyle = "rgba(242,174,20,0.14)"; ctx.fillRect(0, 0, w, h);
      ctx.strokeStyle = "rgba(242,174,20,0.6)"; ctx.lineWidth = 8; ctx.strokeRect(6, 6, w - 12, h - 12);
    }, { repeat: 1, px: 256 });
    const zone = box(g, 2.4, 0.005, 1.6, 0.1, 0.065, 0.2, 0xffffff, { rough: 0.6, transparent: true, opacity: 0.9, cast: false });
    zone.material = texturedMat(zoneTex, { rough: 0.6, transparent: true, opacity: 0.9 });

    const stakeAt = (x, z, id) => {
      const s = group(g, x, 0, z);
      cyl(s, 0.02, 0.02, 0.5, 0, 0.25, 0, 0xf2ae14, { rough: 0.7, seg: 8 });
      const flag = box(s, 0.1, 0.08, 0.005, 0.05, 0.46, 0, UT3_ACCENT, { rough: 0.6, cast: false });
      reg(hits, s, id);
      void flag;
      return s;
    };
    stakeAt(-1.05, -0.5, "stake-a");
    stakeAt(1.15, 0.9, "stake-b");

    // Paint marks: the confirmed one, and one too faded to trust.
    const markLine = (x, z, ry, id, faded) => {
      const m = group(g, x, 0.065, z, ry);
      for (let i = 0; i < 5; i++) box(m, 0.16, 0.006, 0.07, -0.32 + i * 0.16, 0, 0, faded ? 0x9a8f6a : 0xf2c14b, { rough: 0.8, cast: false, opacity: faded ? 0.4 : 1, transparent: faded });
      reg(hits, m, id);
      return m;
    };
    markLine(-0.1, 0.15, 0, "confirmed-mark", false);
    const fadedMarkGroup = markLine(-1.9, 1.3, 0.3, "faded-mark", true);

    // Hand-tools-only sign, board, and PPE board.
    const htSign = group(g, 1.9, 0, -0.3, -0.4);
    box(htSign, 0.5, 0.4, 0.03, 0, 0.9, 0, 0xffffff, { rough: 0.5 });
    decal(htSign, 0.44, 0.34, 0, 0.9, 0.02, signFace("HAND TOOLS / VAC ONLY", { bg: "#2a2005", accent: UT3_CSS, fg: "#fdf3d4", scale: 0.36 }));
    cyl(htSign, 0.03, 0.03, 0.9, 0, 0.45, 0, CITY.darkSteel, { rough: 0.6, metal: 0.4 });
    reg(hits, htSign, "hand-tools-sign");

    const ppeBoard = group(g, -2.2, 0, -1.8, 0.5);
    box(ppeBoard, 0.5, 0.7, 0.04, 0, 0.35, 0, UT3_PAL.structure, { rough: 0.7 });
    const ppePanel = decal(ppeBoard, 0.44, 0.32, 0, 0.68, 0.03, paperFace("CREW PPE / IGNITION CHECK", ["FR clothing, gloves, eye pro", "No open flame near the zone", "Non-sparking tools only"], { scale: 0.72 }));
    holoTag(ppeBoard, "PPE & ignition check", 0, 0.9, 0, { css: UT3_CSS, w: 0.5 });
    reg(hits, ppePanel, "ppe-board");
    const ignitionRisk = box(g, 0.2, 0.2, 0.2, -1.2, 0.5, -1.1, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "light it up right here?", -1.2, 0.75, -1.1, { css: "#d2312b", w: 0.42 });
    reg(hits, ignitionRisk, "ignition-source-near-main");

    // Locate ticket board and phone.
    const ticketBoard = group(g, -2.3, 0, 0.3, 0.5);
    box(ticketBoard, 0.5, 0.7, 0.04, 0, 0.35, 0, UT3_PAL.structure, { rough: 0.7 });
    const ticketPanel = decal(ticketBoard, 0.44, 0.32, 0, 0.68, 0.03, paperFace("LOCATE TICKET", ["Gas main marked — yellow", "Tolerance zone: per ticket", "Colour legend on file"], { scale: 0.76 }));
    holoTag(ticketBoard, "locate ticket", 0, 0.9, 0, { css: UT3_CSS, w: 0.36 });
    reg(hits, ticketPanel, "locate-ticket");
    const phone = box(g, 0.08, 0.15, 0.04, -2.5, 0.9, -0.8, 0x1b1e23, { rough: 0.5 });
    holoTag(g, "locate phone", -2.5, 1.14, -0.8, { css: UT3_CSS, w: 0.3 });
    reg(hits, phone, "locate-phone");

    // The vac wand, the pothole, exposed main and the unmarked line.
    const vacRig = group(g, 2.3, 0, 1.1, -0.6);
    cyl(vacRig, 0.2, 0.22, 0.6, 0, 0.3, 0, 0xd8b23a, { rough: 0.55, metal: 0.3, seg: 16 });
    const vacHose = cyl(vacRig, 0.03, 0.03, 1.0, -0.4, 0.2, 0.3, 0x2b2f33, { rough: 0.7, seg: 10 });
    vacHose.rotation.z = 0.6;
    const vacWand = group(vacRig, -1.1, 0.1, 0.7, 0.4);
    cyl(vacWand, 0.028, 0.028, 0.5, 0, 0, 0, 0x8a939b, { rough: 0.45, metal: 0.6, seg: 10 });
    holoTag(vacRig, "vac wand", -1.1, 0.4, 0.7, { css: "#f2c14b", w: 0.28 });
    reg(hits, vacWand, "vac-wand");

    const pothole = box(g, 1.6, 0.02, 1.0, 0.1, 0.058, 0.3, 0x33291b, { rough: 0.98, cast: false });
    void pothole;
    const main = group(g, 0.1, 0.02, 0.3);
    const mainPipe = cyl(main, 0.11, 0.11, 1.8, 0, 0, 0, 0xf2c14b, { rough: 0.5, metal: 0.3, seg: 16 });
    mainPipe.rotation.z = Math.PI / 2;
    holoTag(main, "gas main", 0, 0.25, 0, { css: UT3_CSS, w: 0.28 });
    reg(hits, mainPipe, "exposed-main");
    const otherLine = cyl(g, 0.045, 0.045, 1.1, -0.3, 0.0, 0.75, 0xd85c9e, { rough: 0.5, seg: 12 });
    otherLine.rotation.z = 0.3;
    holoTag(g, "unmarked line", -0.3, 0.2, 0.75, { css: "#d85c9e", w: 0.36 });
    reg(hits, otherLine, "unmarked-utility");

    const depthPost = group(g, 0.6, 0, -0.4, -0.3);
    box(depthPost, 0.03, 0.6, 0.03, 0, 0.3, 0, CITY.darkSteel, { rough: 0.6, metal: 0.4 });
    const depthGauge = instrument(depthPost, 0, 0.64, 0, { idle: "-- ft", color: 0x2b2f34, w: 0.14, d: 0.12 });
    holoTag(depthPost, "depth gauge", 0, 0.84, 0, { css: UT3_CSS, w: 0.28 });
    reg(hits, depthGauge, "depth-gauge");

    const probeRod = group(g, -0.6, 0, 0.9, 0.4);
    cyl(probeRod, 0.012, 0.012, 0.7, 0, 0.35, 0, CITY.steel, { rough: 0.4, metal: 0.7, seg: 8 });
    box(probeRod, 0.06, 0.06, 0.06, 0, 0.72, 0, 0x2b2f34, { rough: 0.6 });
    holoTag(probeRod, "probe rod", 0, 0.92, 0, { css: UT3_CSS, w: 0.3 });
    reg(hits, probeRod, "probe-rod");

    const sling = group(g, 1.0, 0, 0.5, 0.6);
    const slingTex = surfaceTexture((ctx, w, h) => {
      ctx.fillStyle = "#f2c14b"; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#1a1a1a"; for (let i = 0; i < 6; i++) ctx.fillRect((i / 6) * w, 0, w * 0.04, h);
    }, { repeat: 1, px: 96 });
    const slingBand = box(sling, 0.5, 0.03, 0.08, 0, 0.3, 0, 0xffffff, { rough: 0.6 });
    slingBand.material = texturedMat(slingTex, { rough: 0.6 });
    holoTag(sling, "support sling", 0, 0.5, 0, { css: "#f2c14b", w: 0.32 });
    reg(hits, sling, "support-sling");
    const cradle = group(main, 0.2, -0.05, 0);
    hits["sling-cradle"] = cradle;

    // Adjacent crew: a skid steer staged at the zone edge.
    const adjacentSkid = skidSteer(g, -2.4, 0, 2.3, { ry: 0.9, livery: { colour: 0xd8b23a, fleetName: "SITE CREW", unitNumber: "SS-4" } });
    const radioProp = box(g, 0.09, 0.16, 0.05, -1.7, 0.9, 1.9, 0x1b1e23, { rough: 0.5 });
    holoTag(g, "adjacent-crew radio", -1.7, 1.14, 1.9, { css: UT3_CSS, w: 0.4 });
    reg(hits, radioProp, "adjacent-crew-radio");

    const clearancePost = group(g, -2.1, 0, 1.2, -0.5);
    box(clearancePost, 0.04, 0.7, 0.04, 0, 0.35, 0, CITY.darkSteel, { rough: 0.6, metal: 0.4 });
    const clearanceGauge = instrument(clearancePost, 0, 0.74, 0, { idle: "-- m", color: 0x2b2f34, w: 0.15, d: 0.13 });
    holoTag(clearancePost, "zone clearance", 0, 0.96, 0, { css: UT3_CSS, w: 0.36 });
    reg(hits, clearanceGauge, "clearance-gauge");

    const powerToolHazard = box(g, 0.2, 0.2, 0.2, 0.9, 0.5, -0.9, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "just bring the bucket in?", 0.95, 0.75, -0.9, { css: "#d2312b", w: 0.5 });
    reg(hits, powerToolHazard, "power-tool-in-tolerance-zone");
    const skipLocate = box(g, 0.2, 0.2, 0.2, -1.7, 0.5, 0.3, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "just start the pothole?", -1.75, 0.75, 0.3, { css: "#d2312b", w: 0.46 });
    reg(hits, skipLocate, "skip-locate-check");
    const backfillHazard = box(g, 0.2, 0.2, 0.2, 0.9, 0.4, 0.9, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "backfill it now?", 0.95, 0.65, 0.9, { css: "#d2312b", w: 0.36 });
    reg(hits, backfillHazard, "backfill-without-support");

    // Backfill items and as-built log.
    const beddingSand = box(g, 1.2, 0.05, 0.5, 0.1, 0.03, 0.9, 0xc9b686, { rough: 0.85, cast: false });
    reg(hits, beddingSand, "bedding-sand");
    const tapeRoll = cyl(g, 0.06, 0.06, 0.1, 0.8, 0.06, 1.1, 0xf2c14b, { rough: 0.6, seg: 14 });
    reg(hits, tapeRoll, "warning-tape");
    const compactor = box(g, 0.22, 0.3, 0.22, -0.5, 0.15, 1.3, 0x2b3138, { rough: 0.6, metal: 0.4 });
    reg(hits, compactor, "compact-lift");

    const logBench = group(g, 2.3, 0, -1.8);
    box(logBench, 0.9, 0.72, 0.5, 0, 0.36, 0, UT3_PAL.structure, { rough: 0.7, metal: 0.2 });
    const logPanel = decal(logBench, 0.3, 0.36, 0, 0.73, 0, paperFace("AS-BUILT LOG", ["Depth found ___ ft", "Offset found ___", "Unmarked line reported"], { scale: 0.78 }));
    logPanel.rotation.x = -Math.PI / 2;
    holoTag(logBench, "as-built log", 0, 0.94, 0, { css: UT3_CSS, w: 0.32 });
    reg(hits, logPanel, "as-built-log");

    toolChest(g, -2.6, -2.3);
    const spoilTex = surfaceTexture((ctx, w, h) => gravelFace(ctx, w, h, { base: "#4a3a24", base2: "#3f3120" }), { repeat: 2, px: 200 });
    for (let i = 0; i < 5; i++) {
      const s = ball(g, 0.16 + (i % 2) * 0.05, 1.9 - i * 0.12, 0.16, -2.1 + i * 0.1, 0xffffff, { rough: 1.0, seg: 10 });
      s.material = texturedMat(spoilTex, { rough: 1.0 });
    }
    for (const [dx, dz] of [[-1.3, -2.5], [1.1, -1.2], [2.0, -0.6]]) cone(g, dx, dz, { color: 0xe4622a });
    lockTag(g, 0.4, 0.5, -0.6, { color: 0xf2c14b, lines: ["ZONE", "HAND ONLY"] });
    const locator = standingFigure(g, -0.2, -2.0, { ry: 3.1, cloth: 0x8a7a3a });
    void locator;

    holoPanel(g, 0.95, 0.6, 2.35, 0, 0.4, (ctx, w, h) => {
      ctx.fillStyle = "#241a03"; ctx.fillRect(0, 0, w, h); ctx.fillStyle = UT3_CSS; ctx.fillRect(0, 0, w, 6);
      ctx.font = `600 ${Math.round(h * 0.11)}px 'Barlow Condensed', Arial, sans-serif`; ctx.textAlign = "left"; ctx.textBaseline = "middle";
      ctx.fillStyle = "#fdf3d4"; ctx.fillText("MARKED MAIN — HAND-DIG", w * 0.06, h * 0.14);
      ctx.font = `${Math.round(h * 0.08)}px Arial, sans-serif`; ctx.fillStyle = "#fffbe6";
      ["Hand tools & vacuum inside the zone", "Prove the main by exposing it", "Support it once it is open", "Log the depth actually found"].forEach((l, i) => ctx.fillText(l, w * 0.06, h * (0.3 + i * 0.15)));
    }, { ry: -0.5, accent: UT3_ACCENT });

    let vacuuming = false, skidClosing = false, phoneAlert = false;
    const dust = particles(g, 16, 0xc9b686, { size: 0.025, life: 0.5, additive: false, opacity: 0.4 });
    dust.position.set(-1.1, 0.15, 0.9);
    dust.visible = false;

    return {
      hits,
      spawnLook: new THREE.Vector3(0.1, 1.0, 1.0),
      onStep() {},
      onStepComplete(step) {
        if (step.id === "verify-marks") { holoTag(fadedMarkGroup, "re-locate called", 0, 0.18, 0, { css: "#59c97b", w: 0.36 }); }
        if (step.id === "vac-pothole") { vacuuming = false; dust.visible = false; }
        if (step.id === "depth-check") repaint(depthGauge.userData.screen, signFace("2.6", { bg: "#0d1c14", accent: "#59c97b", fg: "#e9ffe9", scale: 0.55 }));
        if (step.id === "support-sling") { sling.position.set(0.3, 0.1, 0.3); sling.rotation.y = 0; }
        if (step.id === "clearance-watch") repaint(clearanceGauge.userData.screen, signFace("CLEAR", { bg: "#0d1c14", accent: "#59c97b", fg: "#e9ffe9", scale: 0.45 }));
      },
      onInterrupt(it) {
        if (it.id === "adjacent-crew-approaching") { skidClosing = true; adjacentSkid.position.set(-1.9, 0, 2.0); }
        if (it.id === "locator-callback") { phoneAlert = true; phone.material = mat(0xd2312b, { emissive: 0xd2312b, ei: 1.8, rough: 0.4 }); }
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "adjacent-crew-approaching") { skidClosing = false; adjacentSkid.position.set(-2.4, 0, 2.3); }
        if (it.id === "locator-callback") { phoneAlert = false; phone.material = mat(0x1b1e23, { rough: 0.5 }); }
      },
      onHazard() {},
      animate(t, dt, session) {
        if (session?.step?.id === "vac-pothole") { vacuuming = true; dust.visible = true; }
        if (vacuuming) dust.userData.step(dt, new THREE.Vector3(0.1, 0.3, 0), 0.03, 0.4, -0.3);
        const gg = session?.gauge;
        if (gg && !gg.committed && session?.step?.id === "depth-check") repaint(depthGauge.userData.screen, signFace(`${(gg.t * 5).toFixed(1)}`, { bg: "#0d1c24", accent: gg.t > 0.4 && gg.t < 0.58 ? "#59c97b" : "#f0645b", fg: "#bfeaf7", scale: 0.55 }));
        if (session?.turn && session.step?.id === "probe-rod") probeRod.rotation.y = session.turn.amount * Math.PI * 2;
        if (skidClosing) adjacentSkid.position.x = Math.min(-1.3, adjacentSkid.position.x + dt * 0.25);
        void t; void phoneAlert;
      },
    };
  },
};
