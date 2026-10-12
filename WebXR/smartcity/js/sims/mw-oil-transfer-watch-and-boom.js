import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import { box, cyl, ball, torus, hose, group, decal, repaint, signFace, paperFace, mat } from "../../../shared/kit.js";
import {
  CITY, stationPad, holoPanel, holoTag, instrument, standingFigure, valveWheel, reg,
  surfaceTexture, texturedMat, pavingFace, deckPlateFace, waterFace,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Oil Transfer Watch & Boom VR — Maritime & Ports, the marine
// and water pack of the Bay Area Union Edition.
//
// A tank barge discharging to a shore facility across a hose: the barge's
// manifold with its drip pan, valve and pressure gauge, the cargo pump
// control, the facility's hose rack on the dock, a containment boom streamed
// round the barge from a reel with a small boom boat working its end, and a
// current meter on the dock edge. The learner is the barge's person in charge
// (a MEBA licensed engineer); the Inlandboatmen's Union deckhand runs the boom
// boat. No current, pressure or rate figure is invented: each one reads
// against "the boom plan", "the hose's marking" or "the agreed rate".

const MWOB_ACCENT = 0x3fb58a;

export const SIM_MW_OIL_TRANSFER_WATCH_AND_BOOM = {
  id: "mw-oil-transfer-watch-and-boom",
  index: "232",
  domain: "Maritime & Ports",
  trade: "MEBA licensed engineer as the barge's person in charge of the oil transfer, with an Inlandboatmen's Union of the ILWU deckhand on the boom boat and an SIU-trained tankerman on the pump",
  category: "Maritime & Ports",
  district: "Maritime & Ports",
  weather: "overcast",
  certification: "MEBA Calhoon School engineering; SIU Paul Hall Center tankerman training; Inlandboatmen's Union of the ILWU deck practice on the boom boat; USCG 33 CFR 155.710 person in charge of an oil transfer; USCG 33 CFR 156.150 declaration of inspection; IMO MARPOL oil pollution prevention; the facility's and the vessel's own transfer procedures and boom plan",
  name: "Oil Transfer Watch & Boom",
  title: simTitle("Oil Transfer Watch & Boom"),
  tagline: "A barge discharging ashore: the transfer procedures read and the declaration of inspection signed, the current read against the boom plan, the boom streamed from upcurrent, the hose and flange walked, the manifold opened, a slow start watched at the flange while a sheen shows outside the boom, the pump held at the agreed rate through a current shift, the deck walked, the pressure read against the hose, the line stopped, drained and blanked, and the transfer logged",
  accent: MWOB_ACCENT,
  accentCss: "#3fb58a",
  parSeconds: 290,
  footprint: 2.6,
  badge: { id: "nothing-past-the-boom", name: "Nothing Past The Boom", note: "The boom streamed from upcurrent, the pump never ahead of the declaration, the sheen stopped at the source and never dispersed" },

  supportLine: "your union hall's member assistance programme — MEBA, SIU or the Inlandboatmen's Union — with the employer's employee assistance line behind it",

  game: system({
    name: "Transfer Watch",
    currency: "BARREL",
    ranks: ["Watchstander", "Tankerman", "Person In Charge", "Senior PIC", "Transfer Watch Certified"],
    badges: [
      { id: "signed-before-started", name: "Signed Before Started", note: "The declaration of inspection signed before anything moved", test: AWARD.stepClean("doi") },
      { id: "boom-read-true", name: "Boom Read True", note: "Current and pressure both committed inside the band", test: AWARD.precise(0.7) },
      { id: "no-dispersing", name: "No Dispersing", note: "Never a pump ahead of the paperwork, never soap on a sheen, never a boom from downcurrent", test: AWARD.safe },
    ],
    challenges: [
      { id: "clean-transfer-watch", name: "Clean Watch", note: "No corrections from the procedures to the log", test: AWARD.clean },
      { id: "rate-held", name: "Rate Held", note: "The agreed rate held in band the whole discharge", test: AWARD.unbroken },
      { id: "berth-turned", name: "Berth Turned", note: "Transfer logged inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "boom-downcurrent": "You started streaming the boom from its downcurrent anchor. The current carries a boom and the boat towing it away from the point it was made fast to, so a boom laid from downcurrent peels off the hull and leaves an open gap upstream — which is exactly where oil from the manifold goes. The first end is made fast upcurrent and the current streams the boom down along the hull.",
    "pump-before-doi": "You started the cargo pump with the declaration of inspection still unsigned. The DOI is the two persons in charge agreeing on the product, the quantity, the rate, the signals and the emergency stop; 33 CFR 156.150 makes it the condition of starting, because a transfer nobody has agreed is a transfer nobody can stop in the same language.",
    "soap-on-sheen": "You reached for the detergent to break up the sheen. Soap and dispersants do not remove oil — they sink and spread it where no boom or sorbent can recover it, and using them on a sheen is itself a violation. A sheen is stopped at its source, contained with boom and sorbent, and reported — never made to disappear.",
    "step-on-boom": "You stepped off the dock onto the boom to reach a section that had twisted. A containment boom is a float and a skirt, not a walkway: it rolls under a boot and goes under with a person on it, into water with oil on the surface and a hull alongside. A twisted section is fixed from the boom boat with a boat hook.",
  },

  lateNotes: {
    "manifold-valve": "The manifold is opened once the boom is streamed and the hose and flange are walked — not with the containment still on the reel.",
    "cargo-pump-control": "The pump comes up to the agreed rate once the slow start has been watched at the flange — not before a drop has been seen to hold.",
    "transfer-log": "The transfer is logged once the line is stopped, drained and blanked — the log is the last thing on the watch.",
  },

  steps: [
    {
      id: "procedures", kind: "select", target: "transfer-procedures",
      title: "Read the transfer procedures for this barge and this dock",
      cue: "Read the vessel's transfer procedures at the manifold: the product, the line-up, the rate limits, the watch, the emergency stop and the spill response.",
      why: "The person in charge of an oil transfer carries the whole of it — 33 CFR 155.710 sets who may be that person and what they must know — and the procedures are the vessel's written answer to how this barge moves this product. They are read at the manifold before the paperwork with the facility, because the declaration of inspection is only as good as the understanding each person in charge brings to it.",
    },
    {
      id: "doi", kind: "select", target: "doi-board",
      title: "Sign the declaration of inspection with the facility",
      cue: "Go through the DOI with the facility's person in charge: the hose and its connections, the containment, the communications and signals, the emergency stop, the rate — both sign before anything moves.",
      why: "The declaration of inspection is the two persons in charge standing at the same list and agreeing, item by item, that the transfer is ready — 33 CFR 156.150 makes it the condition of starting. It is signed rather than nodded through because the signals and the stop agreed on it are what each side will act on when something goes wrong, and a stop signal only one side knows is not a stop signal.",
    },
    {
      id: "read-current", kind: "gauge", target: "current-meter",
      title: "Read the current against the boom plan",
      cue: "Read the current meter at the dock edge and commit it against the boom plan's figure for this berth — the plan says when the boom holds and when it will not.",
      why: "A containment boom holds oil only while the water moving past it is slow enough, and past the plan's figure oil is carried under the skirt as if the boom were not there. The boom plan for the berth sets that figure and the angle the boom has to take, and the person in charge reads the current against the plan before streaming it, rather than finding out from a sheen on the far side.",
      gauge: { label: "CURRENT vs BOOM PLAN", speed: 0.68, green: [0.4, 0.58], readout: (t) => (t < 0.4 ? "reading settling" : t <= 0.58 ? "inside the boom plan" : "past the plan — angle or stop"), missNote: "Outside the band — let the meter settle and read it against the boom plan's figure for this berth, not the last transfer's." },
    },
    {
      id: "stream-boom", kind: "drag", target: "boom-end",
      title: "Stream the boom from its upcurrent anchor",
      cue: "Hand the boom's end to the boom boat and have it made fast at the upcurrent anchor, then let the current stream the boom down along the barge.",
      why: "A boom is laid so the current works for it: made fast upcurrent, the current carries the rest of the boom down along the hull and holds it there, closing the water round the barge. Laid the other way, the current peels it off and leaves the upstream end open. The boom goes in before the manifold opens, because containment set after a spill is containment chasing oil.",
      drag: { to: "boom-anchor-up", radius: 0.6, missNote: "Not at the upcurrent anchor — the boom's first end is made fast upcurrent so the current streams it down along the hull." },
    },
    {
      id: "hose-walk", kind: "find", noHint: true,
      targets: ["hose-kink", "flange-bolt-missing"],
      itemNames: { "hose-kink": "hose kinked over the dock edge with no saddle", "flange-bolt-missing": "manifold flange with a bolt hole empty" },
      itemNotes: {
        "hose-kink": "The transfer hose bends hard over the dock's edge with no saddle under it — a kink under pressure is where a hose bursts, and over the water is the worst place for it.",
        "flange-bolt-missing": "One bolt hole on the manifold flange is empty. A flange is made up with every bolt in and drawn down evenly; one missing lets the gasket blow out on that side at the first pressure surge.",
      },
      title: "Walk the hose and the manifold flange",
      cue: "Walk the hose from the facility's rack to the barge's manifold: supported, no kinks or chafe, the flange made up with every bolt and a gasket, the drip pan under it.",
      why: "A hose and its flange are the only thing between the product and the water for the whole transfer, and they fail at the places that are easy to miss: a bend over a dock edge with no saddle, a flange with one bolt left out because it was awkward to reach. Walking them before the valve opens is the last chance to find those with the line empty.",
    },
    {
      id: "open-manifold", kind: "turn", target: "manifold-valve",
      title: "Open the barge's manifold valve",
      cue: "With the facility's valve open and confirmed on the radio, open the manifold valve steadily all the way — the line is lined up from the tank to the shore.",
      why: "The valve is opened with the line-up confirmed at both ends, because a pump started against a closed valve anywhere in the line builds pressure until the weakest point — usually the hose — gives. It is opened fully and steadily rather than cracked and left, so the line is not throttled at the manifold where a partially open valve erodes and chatters under flow.",
      turn: { turns: 2, label: "MANIFOLD VALVE", readout: (t) => (t < 0.3 ? "closed" : t < 0.9 ? "opening" : "open — line lined up") },
    },
    {
      id: "slow-start", kind: "hold", target: "flange-watch",
      seconds: 5,
      title: "Watch the flange through the slow start",
      cue: "Pump at the slow start rate agreed on the DOI and stay at the flange: watch every bolt, the gasket and the hose ends for a weep.",
      why: "The first minutes of a transfer are when a flange that looked right shows that it is not: the gasket takes up, the hose stiffens and moves, and a weep starts where the bolts were drawn unevenly. The slow start exists to find that at a rate the drip pan can hold, with the person in charge standing at the flange rather than at the rate display.",
      holdBreakNote: "Walked away from the flange before the slow start was over — the weep that shows in the first minutes is only caught by someone watching it. Go back to the flange.",
    },
    {
      id: "agreed-rate", kind: "track", target: "cargo-pump-control", seconds: 6,
      title: "Bring the pump to the agreed rate and hold it",
      cue: "With the flange dry, bring the cargo pump up to the rate agreed on the DOI and hold it steady — no surges, no creeping past the agreement.",
      why: "The agreed rate is what the facility's tank, the hose and the vent can take, and the person in charge holds the pump to it rather than to what the pump will do: a surge past it raises pressure in the hose and fills the shore tank faster than its watch expects. Held steady, the rate is predictable at both ends, and a predictable transfer is one the other person in charge can stop cleanly.",
      track: { start: 0.14, green: [0.42, 0.6], rise: 0.58, fall: 0.46, drift: 0.13, label: "CARGO PUMP", readout: (v) => (v < 0.42 ? "under the agreed rate" : v > 0.6 ? "over — ease the pump" : "at the agreed rate") },
      holdBreakNote: "The pump went out of band — a surge or a sag the other end did not agree to. Bring it back to the agreed rate and hold it.",
    },
    {
      id: "deck-round", kind: "find", noHint: true,
      targets: ["scupper-open", "sorbent-soaked"],
      itemNames: { "scupper-open": "scupper plug missing on the barge's deck", "sorbent-soaked": "sorbent pad saturated in the drip pan" },
      itemNotes: {
        "scupper-open": "A scupper on the barge's deck has no plug in it — any oil on the deck would go straight through it into the water inside the boom and, if the boom lets go, past it.",
        "sorbent-soaked": "The sorbent pad in the drip pan is black and saturated: the flange is weeping slowly and the pan will overflow once the pad stops taking it up.",
      },
      title: "Walk the deck while the product moves",
      cue: "Walk the deck round the manifold: scuppers plugged, drip pan dry, sorbent clean, nothing weeping at the hose ends.",
      why: "A transfer that started dry can start to weep an hour in, as a gasket relaxes or a hose end works under the pressure, and the deck round is how that is found before it reaches the water. A saturated pad means a weep has been going on long enough to fill it, and an open scupper is the path any deck spill takes overboard — both are fixed now, with the product still moving, by stopping and plugging, not by hoping.",
    },
    {
      id: "hose-pressure", kind: "gauge", target: "manifold-gauge",
      title: "Read the manifold pressure against the hose's marking",
      cue: "Read the manifold pressure gauge and commit it against the working pressure marked on the hose — inside the marking, never at it.",
      why: "Every transfer hose carries its maximum working pressure on its own marking, and the manifold gauge is how the person in charge knows the line is inside it: a closed valve downstream or a surge from the pump shows here first. It is read against the hose's own marking rather than a remembered figure, because the hose on the dock today may not be the hose that was there last week.",
      gauge: { label: "MANIFOLD PRESSURE", speed: 0.72, green: [0.38, 0.56], readout: (t) => (t < 0.38 ? "low — check the line-up" : t <= 0.56 ? "inside the hose's marking" : "at the marking — slow the pump"), missNote: "Outside the band — read the gauge against the hose's own working-pressure marking, not a figure from memory." },
    },
    {
      id: "stop-drain-blank", kind: "sequence",
      targets: ["stop-signal", "drain-valve", "hose-blank"],
      itemNames: { "stop-signal": "stop signal to the facility, pump stopped", "drain-valve": "hose drained back to the tank", "hose-blank": "blank flange on the hose end" },
      title: "Stop, drain and blank the line",
      cue: "Signal stop and stop the pump, drain the hose back to the tank through the drain valve, then blank the hose end before it leaves the manifold.",
      why: "The end of a transfer is when a lot of spills happen: a hose disconnected full, a flange broken with the pump still turning, a hose end lifted over the water without a blank. The order is the protection — stop, drain, blank — so the hose that swings back to the dock is empty and closed, and the drip pan catches only the few drops a correct disconnection leaves.",
      outOfOrderNote: "Out of order — the pump stops first, the hose is drained second, and the blank goes on last before anything is disconnected.",
    },
    {
      id: "transfer-log", kind: "select", target: "transfer-log",
      title: "Log the transfer",
      cue: "Log the quantity, the start and stop times, the sheen and what was done about it, the current shift and the boom's new angle, the missing bolt and the open scupper.",
      why: "The transfer is recorded because the vessel's records under IMO MARPOL and its own procedures must account for every oil movement, and because a sheen is reportable — to the National Response Center and the facility — whether or not it came from this barge. The log is written at the manifold with the times still fresh; it is what an investigator reads first and what the next transfer at this berth learns from.",
    },
    {
      id: "crew-checkin", kind: "select", target: "boat-radio",
      title: "Check in with the boom boat and the facility",
      cue: "On the radio: the line is blanked and logged, the boom stays until the facility clears it, and how the deckhand on the boat and the tankerman are after the sheen and the set.",
      why: "The deckhand in the boom boat has been working alone in a current beside a barge, and the facility's person in charge needs to hear the transfer is closed before breaking their side. The check-in is also the crew's own: a sheen on the water and a boom fighting a current shift is stress for everyone on the watch, and the member assistance line is there for what the radio does not carry.",
    },
  ],

  interrupts: [
    {
      id: "sheen-outside-boom",
      kind: "Sheen on the water outside the boom",
      after: "slow-start", delay: 2, seconds: 14,
      alert: "A rainbow sheen is spreading on the water just outside the boom on the downstream side — it was not there a minute ago.",
      cue: "Hit the emergency stop at the manifold: stop the transfer first, then find the source.",
      target: "esd-button",
      why: "A sheen that appears during a transfer is treated as this transfer's until it is proven otherwise, and the first move is to stop the product moving — the emergency stop agreed on the DOI — before anyone goes looking. Searching for the source with the pump still running is how a weep becomes a spill; the stop is the one action that makes every other action smaller.",
      missNote: "The pump kept running at the slow start while the sheen spread along the boom; the weep feeding it was at the far hose end, and by the time it was found the sheen had gone past the boom's end.",
      wrongNote: "The emergency stop — stop the product moving first, then find where the sheen is coming from.",
    },
    {
      id: "current-shift-boom",
      kind: "Current shift at the boom",
      after: "agreed-rate", delay: 2, seconds: 14,
      alert: "The tide has turned and the current has picked up across the berth — the boom is bellying and the skirt is lifting at the upcurrent end.",
      cue: "Call the boom boat on the radio: re-angle the boom's upcurrent end to the new set.",
      target: "boat-radio",
      why: "A boom holds oil only at the right angle to the current, and a change in set that puts it square to the flow lets anything on the water pass under the skirt. The boom boat is the only thing on the water that can move it, and the person in charge has to tell the deckhand what the barge can see — the belly and the lifted skirt — so the end is re-angled before the current finds the gap.",
      missNote: "The boom bellied square to the new current with nobody moving it, the skirt lifted at the upcurrent end, and the sorbent that had been holding the drip-pan weep went under it.",
      wrongNote: "The boom boat's radio — only the boat can re-angle the boom, and the deckhand needs to hear what the barge sees.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.6, MWOB_ACCENT);

    // -------------------------------------------------- water, dock and barge
    const water = box(g, 7.8, 0.02, 7.6, 0, 0.012, -0.7, 0xffffff, { rough: 0.15, metal: 0.4, cast: false });
    water.material = texturedMat(surfaceTexture((cx, w, h) => waterFace(cx, w, h, { base: "#0b2630", mid: "#0f303a" }), { repeat: 3, px: 512 }), { rough: 0.15, metal: 0.4, color: 0x80aab8 });
    const dock = box(g, 6.6, 0.3, 1.8, 0, 0.15, 1.7, 0xffffff, { rough: 0.9 });
    dock.material = texturedMat(
      surfaceTexture((cx, w, h) => pavingFace(cx, w, h, { tiles: 5, base: "#30363b", base2: "#282e33", seam: "rgba(0,0,0,0.4)" }), { repeat: 5, px: 512 }),
      { rough: 0.9, metal: 0.03, color: 0xbfc6cc },
    );
    box(g, 6.6, 0.06, 0.12, 0, 0.33, 0.85, CITY.hiVis, { rough: 0.7 });
    for (let i = 0; i < 5; i++) cyl(g, 0.14, 0.14, 1.2, -2.8 + i * 1.4, -0.3, 0.9, 0x4a4238, { rough: 0.95, seg: 10 });
    const barge = group(g, 0, 0, 0);
    const bdeck = box(barge, 6.4, 0.12, 2.4, 0, 0.42, -1.25, 0xffffff, { rough: 0.8 });
    bdeck.material = texturedMat(surfaceTexture((cx, w, h) => deckPlateFace(cx, w, h, { base: "#46392c", base2: "#3c3126", step: 22 }), { repeat: 4, px: 512 }), { rough: 0.85, metal: 0.3, color: 0xc9bfb2 });
    box(barge, 6.4, 0.4, 2.4, 0, 0.18, -1.25, 0x2b2e33, { rough: 0.7, cast: false });
    box(barge, 6.4, 0.14, 0.1, 0, 0.55, -0.05, 0x8b98a5, { rough: 0.6, metal: 0.4 });
    // Tank domes and vents on the barge.
    for (const x of [-2.2, 2.2]) {
      cyl(barge, 0.35, 0.35, 0.14, x, 0.55, -1.6, 0x6b5a48, { rough: 0.7, metal: 0.3, seg: 16 });
      cyl(barge, 0.04, 0.04, 0.9, x + 0.5, 0.95, -2.1, 0x8b98a5, { rough: 0.5, metal: 0.5, seg: 8 });
      ball(barge, 0.08, x + 0.5, 1.42, -2.1, 0xd8512b, { rough: 0.6, seg: 10, seg2: 8 });
    }
    for (let i = 0; i < 3; i++) cyl(barge, 0.07, 0.07, 6.2, 0, 0.55, -0.9 - i * 0.35, 0x5b6771, { rough: 0.5, metal: 0.6, seg: 10 }).rotation.z = Math.PI / 2;

    // ------------------------------------------------------------- manifold
    const man = group(barge, 0.6, 0.48, -0.45);
    const pan = box(man, 1.1, 0.12, 0.7, 0, 0.06, 0, 0x3a4148, { rough: 0.6, metal: 0.5 });
    void pan;
    cyl(man, 0.09, 0.09, 0.7, -0.35, 0.3, -0.1, 0x5b6771, { rough: 0.5, metal: 0.6, seg: 12 }).rotation.z = Math.PI / 2;
    const flange = group(man, 0.05, 0.3, -0.1);
    const fl = cyl(flange, 0.16, 0.16, 0.05, 0, 0, 0, 0x8b98a5, { rough: 0.4, metal: 0.7, seg: 16 });
    fl.rotation.z = Math.PI / 2;
    for (let i = 0; i < 8; i++) {
      if (i === 5) continue;
      const a = (i / 8) * Math.PI * 2;
      cyl(flange, 0.015, 0.015, 0.1, 0, Math.cos(a) * 0.12, Math.sin(a) * 0.12, 0xc0c6cc, { rough: 0.3, metal: 0.9, seg: 6 }).rotation.z = Math.PI / 2;
    }
    const emptyHole = ball(flange, 0.02, 0.03, Math.cos((5 / 8) * Math.PI * 2) * 0.12, Math.sin((5 / 8) * Math.PI * 2) * 0.12, 0x1b1e22, { rough: 0.9, emissive: 0x3a1206, ei: 0.6, seg: 8, seg2: 6 });
    reg(hits, emptyHole, "flange-bolt-missing");
    const flangeWatch = box(man, 0.4, 0.4, 0.4, 0.05, 0.3, 0.2, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(man, "flange — watch it", 0.05, 0.72, 0.1, { css: "#3fb58a", w: 0.34 });
    reg(hits, flangeWatch, "flange-watch");
    const mv = valveWheel(man, -0.4, 0.42, -0.1, { r: 0.13, color: 0x3fb58a, body: 0x2f4f6f });
    holoTag(mv, "manifold valve", 0, 0.52, 0, { css: "#3fb58a", w: 0.3 });
    reg(hits, mv, "manifold-valve");
    const pg = group(man, -0.15, 0.55, -0.1);
    cyl(pg, 0.012, 0.012, 0.14, 0, -0.07, 0, CITY.steel, { rough: 0.4, metal: 0.8, seg: 8 });
    const pgDial = cyl(pg, 0.07, 0.07, 0.03, 0, 0.02, 0, 0xf1f3f4, { rough: 0.4, seg: 18 });
    pgDial.rotation.x = Math.PI / 2;
    const pgNeedle = box(pg, 0.008, 0.055, 0.006, 0, 0.03, 0.02, 0xd2312b, { rough: 0.4 });
    holoTag(pg, "manifold pressure", 0, 0.16, 0, { css: "#3fb58a", w: 0.34 });
    reg(hits, pg, "manifold-gauge");
    const sorbent = box(man, 0.3, 0.02, 0.24, 0.35, 0.13, 0.15, 0x1b1e22, { rough: 0.95 });
    reg(hits, sorbent, "sorbent-soaked");
    const drain = group(man, 0.35, 0.18, -0.25);
    cyl(drain, 0.03, 0.03, 0.14, 0, 0, 0, 0x5b6771, { rough: 0.5, metal: 0.6, seg: 8 });
    const drainLever = box(drain, 0.16, 0.02, 0.02, 0.07, 0.08, 0, 0xd8512b, { rough: 0.5 });
    holoTag(drain, "drain valve", 0, 0.24, 0, { css: "#3fb58a", w: 0.24 });
    reg(hits, drain, "drain-valve");
    const blank = group(man, -0.1, 0.13, 0.25);
    const blankPlate = cyl(blank, 0.15, 0.15, 0.03, 0, 0, 0, 0x2f4f6f, { rough: 0.5, metal: 0.6, seg: 16 });
    void blankPlate;
    holoTag(blank, "hose blank", 0, 0.14, 0, { css: "#3fb58a", w: 0.24 });
    reg(hits, blank, "hose-blank");
    const esd = group(barge, 1.55, 0.48, -0.4);
    cyl(esd, 0.03, 0.04, 0.9, 0, 0.45, 0, CITY.hiVis, { rough: 0.5, seg: 8 });
    box(esd, 0.18, 0.18, 0.1, 0, 0.95, 0, 0xf2c14b, { rough: 0.5 });
    const esdBtn = cyl(esd, 0.06, 0.06, 0.04, 0, 0.95, 0.06, 0xd2312b, { rough: 0.4, emissive: 0x5a0808, ei: 0.5, seg: 14 });
    esdBtn.rotation.x = Math.PI / 2;
    holoTag(esd, "emergency stop", 0, 1.2, 0, { css: "#3fb58a", w: 0.3 });
    reg(hits, esd, "esd-button");

    // --------------------------------------------------------------- the hose
    const hoseRack = group(g, 1.2, 0.3, 2.0);
    box(hoseRack, 0.6, 0.9, 0.4, 0, 0.45, 0, 0x2f4f6f, { rough: 0.55, metal: 0.4 });
    cyl(hoseRack, 0.2, 0.2, 0.5, 0, 0.7, 0, 0x1b1e22, { rough: 0.8, seg: 14 }).rotation.z = Math.PI / 2;
    hose(g, [[1.2, 1.0, 1.9], [1.0, 1.1, 1.2], [0.85, 0.55, 0.88], [0.72, 0.7, 0.2], [0.65, 0.78, -0.55]], 0.06, 0x15181c, { steps: 14, rough: 0.8 });
    const kink = box(g, 0.2, 0.12, 0.14, 0.85, 0.52, 0.86, 0x2b2b2b, { rough: 0.9, emissive: 0x3a1206, ei: 0.35 });
    reg(hits, kink, "hose-kink");
    const saddle = box(g, 0.3, 0.06, 0.3, 0.85, 0.36, 0.86, 0x3fb58a, { rough: 0.6 });
    saddle.visible = false;

    // --------------------------------------------------- pump and deck gear
    const pump = group(barge, -1.5, 0.48, -0.5);
    box(pump, 0.44, 0.9, 0.3, 0, 0.45, 0, 0x2b3138, { rough: 0.6, metal: 0.4 });
    const pumpLamp = ball(pump, 0.03, 0.12, 0.8, 0.16, 0x59c97b, { emissive: 0x59c97b, ei: 1.2, seg: 8, seg2: 6 });
    const pumpScreen = decal(pump, 0.3, 0.14, 0, 0.62, 0.155, signFace("RATE —", { bg: "#0d1c24", accent: "#3fb58a", fg: "#bfeaf7", scale: 0.5 }), { px: 192, glow: true, ei: 0.8 });
    const knob = group(pump, -0.1, 0.4, 0.16);
    cyl(knob, 0.05, 0.05, 0.05, 0, 0, 0, 0x8b98a5, { rough: 0.4, metal: 0.7, seg: 14 }).rotation.x = Math.PI / 2;
    holoTag(pump, "cargo pump control", 0, 1.12, 0, { css: "#3fb58a", w: 0.38 });
    reg(hits, pump, "cargo-pump-control");
    const start = group(barge, -2.1, 0.48, -0.5);
    box(start, 0.2, 0.3, 0.14, 0, 0.7, 0, 0x2b3138, { rough: 0.6 });
    cyl(start, 0.03, 0.03, 0.6, 0, 0.3, 0, 0x8a949d, { rough: 0.45, metal: 0.7, seg: 8 });
    cyl(start, 0.04, 0.04, 0.03, 0, 0.72, 0.08, 0x59c97b, { rough: 0.4, seg: 12 }).rotation.x = Math.PI / 2;
    const startHit = box(start, 0.3, 0.4, 0.3, 0, 0.7, 0.05, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(start, "start pump — DOI unsigned?", 0, 1.0, 0, { css: "#d2312b", w: 0.5 });
    reg(hits, startHit, "pump-before-doi");
    const scupper = group(barge, -0.6, 0.48, -0.12);
    cyl(scupper, 0.06, 0.06, 0.02, 0, 0.005, 0, 0x0b0d10, { rough: 0.9, seg: 12 });
    const plug = cyl(scupper, 0.05, 0.06, 0.06, 0.25, 0.03, 0.05, 0xd8512b, { rough: 0.7, seg: 10 });
    reg(hits, scupper, "scupper-open");
    const soap = group(barge, -1.0, 0.48, -1.9);
    cyl(soap, 0.06, 0.06, 0.24, 0, 0.12, 0, 0x4fb3e8, { rough: 0.4, seg: 12 });
    cyl(soap, 0.02, 0.02, 0.05, 0, 0.27, 0, 0xf1f3f4, { rough: 0.4, seg: 8 });
    const soapHit = box(soap, 0.3, 0.35, 0.3, 0, 0.15, 0, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(soap, "detergent on the sheen?", 0, 0.45, 0, { css: "#d2312b", w: 0.46 });
    reg(hits, soapHit, "soap-on-sheen");
    const sopep = group(barge, 2.6, 0.48, -1.9);
    box(sopep, 0.6, 0.5, 0.4, 0, 0.25, 0, 0xf06a2b, { rough: 0.6 });
    decal(sopep, 0.4, 0.12, 0, 0.35, 0.21, signFace("SPILL KIT", { bg: "#f1f3f4", accent: "#f06a2b", fg: "#1b1e22", scale: 0.5 }), { px: 192 });

    // ------------------------------------------------------------- the boom
    const reel = group(g, -2.4, 0.3, 1.5);
    box(reel, 0.1, 0.8, 0.8, -0.4, 0.4, 0, 0x2f4f6f, { rough: 0.55, metal: 0.4 });
    box(reel, 0.1, 0.8, 0.8, 0.4, 0.4, 0, 0x2f4f6f, { rough: 0.55, metal: 0.4 });
    const reelDrum = cyl(reel, 0.3, 0.3, 0.7, 0, 0.5, 0, 0xe8b02e, { rough: 0.6, seg: 16 });
    reelDrum.rotation.z = Math.PI / 2;
    const boom = group(g, 0, 0, 0);
    const boomSections = [];
    for (let i = 0; i < 9; i++) {
      const s = cyl(boom, 0.09, 0.09, 0.62, 3.2 - i * 0.7, 0.07, 0.35, 0xf2c14b, { rough: 0.6, seg: 10 });
      s.rotation.z = Math.PI / 2;
      boomSections.push(s);
      box(boom, 0.62, 0.18, 0.01, 3.2 - i * 0.7, -0.05, 0.35, 0xc79a28, { rough: 0.8, cast: false });
    }
    boom.visible = false;
    const boomEnd = group(g, -2.4, 0.45, 1.0);
    cyl(boomEnd, 0.1, 0.1, 0.5, 0, 0, 0, 0xf2c14b, { rough: 0.6, seg: 10 }).rotation.z = Math.PI / 2;
    box(boomEnd, 0.08, 0.12, 0.08, 0.28, 0, 0, 0x8b98a5, { rough: 0.4, metal: 0.8 });
    holoTag(boomEnd, "boom end", 0, 0.24, 0, { css: "#3fb58a", w: 0.24 });
    reg(hits, boomEnd, "boom-end");
    const upAnchor = group(g, 3.3, 0, -0.05);
    ball(upAnchor, 0.16, 0, 0.1, 0, 0xd8512b, { rough: 0.6, seg: 12, seg2: 10 });
    const upRing = torus(upAnchor, 0.3, 0.012, 0, 0.12, 0, MWOB_ACCENT, { emissive: MWOB_ACCENT, ei: 1.6, rough: 0.4, cast: false, seg: 6, seg2: 28 });
    upRing.rotation.x = Math.PI / 2;
    holoTag(upAnchor, "upcurrent anchor", 0, 0.45, 0, { css: "#3fb58a", w: 0.34 });
    reg(hits, upAnchor, "boom-anchor-up");
    const downAnchor = group(g, -3.3, 0, -0.05);
    ball(downAnchor, 0.16, 0, 0.1, 0, 0xd8512b, { rough: 0.6, seg: 12, seg2: 10 });
    const downHit = box(downAnchor, 0.5, 0.4, 0.5, 0, 0.15, 0, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(downAnchor, "start from downcurrent?", 0, 0.45, 0, { css: "#d2312b", w: 0.44 });
    reg(hits, downHit, "boom-downcurrent");
    const stepHit = box(g, 0.8, 0.3, 0.4, -1.2, 0.35, 0.62, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "step onto the boom?", -1.2, 0.7, 0.62, { css: "#d2312b", w: 0.4 });
    reg(hits, stepHit, "step-on-boom");
    // Current meter on the dock edge and a current arrow in the water.
    const meter = group(g, 2.4, 0.3, 1.0);
    cyl(meter, 0.03, 0.03, 0.9, 0, 0.45, 0, 0x8a949d, { rough: 0.45, metal: 0.7, seg: 8 });
    box(meter, 0.22, 0.16, 0.08, 0, 0.95, 0, 0x2b3138, { rough: 0.55 });
    const meterScreen = decal(meter, 0.16, 0.08, 0, 0.97, 0.045, signFace("SET —", { bg: "#0d1c24", accent: "#3fb58a", fg: "#bfeaf7", scale: 0.5 }), { px: 160, glow: true, ei: 0.8 });
    holoTag(meter, "current meter", 0, 1.2, 0, { css: "#3fb58a", w: 0.28 });
    reg(hits, meter, "current-meter");
    const arrow = group(g, 2.0, 0.04, -3.0);
    box(arrow, 1.0, 0.01, 0.06, 0, 0, 0, 0x9fd8e8, { rough: 0.3, emissive: 0x9fd8e8, ei: 0.5, cast: false });
    const head = box(arrow, 0.2, 0.01, 0.2, -0.5, 0, 0, 0x9fd8e8, { rough: 0.3, emissive: 0x9fd8e8, ei: 0.5, cast: false });
    head.rotation.y = Math.PI / 4;
    // The sheen and the current streamers for the interruptions.
    const sheen = box(g, 1.4, 0.012, 0.8, -3.3, 0.03, 0.4, 0xb8a4e8, { rough: 0.1, metal: 0.6, emissive: 0x6a5aa8, ei: 0.5, cast: false });
    sheen.visible = false;
    const streamers = group(g, 0, 0.03, -3.1);
    for (let i = 0; i < 5; i++) { const s = box(streamers, 1.0, 0.01, 0.05, -2.4 + i * 1.2, 0, (i % 2) * 0.25, 0xcfe8ee, { rough: 0.3, emissive: 0x9fd8e8, ei: 0.5, cast: false }); s.rotation.y = 0.2; }
    streamers.visible = false;

    // ---------------------------------------------------- the boom boat
    const boat = group(g, 3.3, 0, 0.9, 0.3);
    box(boat, 0.9, 0.3, 1.8, 0, 0.1, 0, 0xf1f3f4, { rough: 0.55 });
    box(boat, 0.92, 0.06, 1.82, 0, 0.26, 0, 0x3fb58a, { rough: 0.5 });
    box(boat, 0.5, 0.35, 0.3, 0, 0.45, -0.4, 0x2b3138, { rough: 0.5 });
    box(boat, 0.24, 0.3, 0.2, 0, 0.12, 0.95, 0x2b3138, { rough: 0.6, metal: 0.4 });
    const boatHand = standingFigure(boat, 0, 0.25, { atStation: true, cloth: 0x1f3a52, vest: 0xf06a2b, gloves: true });
    boatHand.position.y = 0.2;
    holoTag(boatHand, "boom boat deckhand", 0, 1.9, 0, { css: "#3fb58a", w: 0.4 });

    // ---------------------------------------------------- paperwork and radio
    const procs = holoPanel(barge, 0.74, 0.52, -0.45, 1.3, -0.2, (cx, w, h) => {
      cx.fillStyle = "#07170f"; cx.fillRect(0, 0, w, h); cx.fillStyle = "#3fb58a"; cx.fillRect(0, 0, w, 6);
      cx.font = `600 ${Math.round(h * 0.1)}px 'Barlow Condensed', Arial, sans-serif`; cx.textAlign = "left"; cx.textBaseline = "middle";
      cx.fillStyle = "#d2f2e2"; cx.fillText("TRANSFER PROCEDURES", w * 0.06, h * 0.13);
      cx.font = `${Math.round(h * 0.07)}px Arial, sans-serif`; cx.fillStyle = "#eaf8f0";
      ["Product and line-up: tank to manifold to shore", "Slow start, then the agreed rate", "Watch: person in charge at the manifold",
       "Emergency stop: at the manifold, both ends", "Boom: per the berth's boom plan", "Sheen: stop, contain, report"]
        .forEach((l, i) => cx.fillText(l, w * 0.06, h * (0.28 + i * 0.115)));
    }, { accent: MWOB_ACCENT });
    reg(hits, procs, "transfer-procedures");
    const doi = decal(g, 0.34, 0.44, -0.6, 1.1, 1.3, paperFace("DECLARATION OF INSPECTION", ["Hose and connections", "Containment and scuppers", "Signals and stop", "Rate: as agreed", "Vessel PIC — / Facility PIC —"], { bg: "#efe6cc", band: "#3fb58a" }), { px: 256 });
    cyl(g, 0.03, 0.04, 1.0, -0.6, 0.6, 1.33, 0x8a949d, { rough: 0.45, metal: 0.7, seg: 8 });
    holoTag(g, "DOI — both sign", -0.6, 1.42, 1.3, { css: "#3fb58a", w: 0.3 });
    reg(hits, doi, "doi-board");
    const radio = instrument(g, 0.2, 0.92, 2.2, { ry: 0.1, idle: "CH · TRANSFER", color: 0x3fb58a, w: 0.1, d: 0.16 });
    box(g, 0.36, 0.6, 0.3, 0.2, 0.6, 2.2, 0x2b3138, { rough: 0.6, metal: 0.4 });
    holoTag(radio, "boom boat radio", 0, 0.16, 0, { css: "#3fb58a", w: 0.32 });
    reg(hits, radio, "boat-radio");
    const stopSig = group(g, -0.2, 0.3, 1.3);
    box(stopSig, 0.24, 0.24, 0.04, 0, 0.8, 0, 0xd2312b, { rough: 0.5, emissive: 0x4a0808, ei: 0.3 });
    cyl(stopSig, 0.02, 0.02, 0.7, 0, 0.35, 0, 0x8a949d, { rough: 0.45, metal: 0.7, seg: 8 });
    holoTag(stopSig, "stop signal", 0, 1.05, 0, { css: "#3fb58a", w: 0.24 });
    reg(hits, stopSig, "stop-signal");
    const logBoard = holoPanel(g, 0.6, 0.42, -1.6, 1.25, 2.2, (cx, w, h) => {
      cx.fillStyle = "#07170f"; cx.fillRect(0, 0, w, h); cx.fillStyle = "#3fb58a"; cx.fillRect(0, 0, w, 6);
      cx.font = `600 ${Math.round(h * 0.12)}px 'Barlow Condensed', Arial, sans-serif`; cx.textAlign = "left"; cx.textBaseline = "middle";
      cx.fillStyle = "#d2f2e2"; cx.fillText("TRANSFER LOG", w * 0.06, h * 0.16);
      cx.font = `${Math.round(h * 0.09)}px Arial, sans-serif`; cx.fillStyle = "#eaf8f0";
      ["Quantity: —", "Times: —", "Remarks: —"].forEach((l, i) => cx.fillText(l, w * 0.06, h * (0.4 + i * 0.18)));
    }, { ry: 0.5, accent: MWOB_ACCENT });
    reg(hits, logBoard, "transfer-log");

    // ------------------------------------------------------------- crew
    const facility = standingFigure(g, 2.3, 2.05, { ry: -2.6, cloth: 0x2b3138, vest: 0xf2c14b, helmet: 0xf1f3f4 });
    holoTag(facility, "facility PIC", 0, 1.9, 0, { css: "#3fb58a", w: 0.28 });
    const tankerman = standingFigure(g, -2.6, -1.3, { ry: 0.4, cloth: 0x3f4a55, vest: 0xf06a2b, helmet: 0xe8b02e, gloves: true });
    tankerman.position.y = 0.48;
    holoTag(tankerman, "tankerman", 0, 1.9, 0, { css: "#3fb58a", w: 0.24 });

    const waterTex = water.material.map;

    return {
      hits,
      spawnLook: new THREE.Vector3(0.3, 0.7, -0.6),
      onStep() {},
      onStepComplete(step) {
        if (step.id === "read-current") repaint(meterScreen, signFace("IN PLAN", { bg: "#0d1c24", accent: "#59c97b", fg: "#bfeaf7", scale: 0.5 }));
        if (step.id === "stream-boom") { boom.visible = true; boomEnd.visible = false; }
        if (step.id === "hose-walk") { saddle.visible = true; kink.visible = false; emptyHole.material = mat(0xc0c6cc, { rough: 0.3, metal: 0.9 }); }
        if (step.id === "agreed-rate") repaint(pumpScreen, signFace("AGREED RATE", { bg: "#0d1c24", accent: "#59c97b", fg: "#bfeaf7", scale: 0.5 }));
        if (step.id === "deck-round") { plug.position.set(0, 0.03, 0); sorbent.material = mat(0xf1f3f4, { rough: 0.95 }); }
        if (step.id === "stop-drain-blank") { pumpLamp.material = mat(0xf0645b, { emissive: 0xf0645b, ei: 1.2 }); drainLever.rotation.y = Math.PI / 2; blank.position.set(0.05, 0.3, 0.02); blank.rotation.z = Math.PI / 2; }
        if (step.id === "transfer-log") {
          repaint(logBoard.userData.face, (cx, w, h) => {
            cx.fillStyle = "#07170f"; cx.fillRect(0, 0, w, h); cx.fillStyle = "#59c97b"; cx.fillRect(0, 0, w, 6);
            cx.font = `600 ${Math.round(h * 0.12)}px 'Barlow Condensed', Arial, sans-serif`; cx.textAlign = "left"; cx.textBaseline = "middle";
            cx.fillStyle = "#d2f2e2"; cx.fillText("TRANSFER LOG", w * 0.06, h * 0.16);
            cx.font = `${Math.round(h * 0.085)}px Arial, sans-serif`; cx.fillStyle = "#e6f6ea";
            ["Quantity: as delivered · line blanked", "Sheen: stopped, contained, reported", "Boom re-angled · bolt, scupper fixed"].forEach((l, i) => cx.fillText(l, w * 0.06, h * (0.4 + i * 0.18)));
          });
        }
      },
      onHazard() {},
      onInterrupt(it) {
        if (it.id === "sheen-outside-boom") sheen.visible = true;
        if (it.id === "current-shift-boom") { streamers.visible = true; boom.rotation.y = 0.18; boom.position.z = -0.4; }
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "sheen-outside-boom") { pumpLamp.material = mat(0xf0645b, { emissive: 0xf0645b, ei: 1.2 }); esdBtn.material = mat(0xf0645b, { emissive: 0xf0645b, ei: 1.0 }); sheen.scale.set(0.5, 1, 0.5); }
        if (it.id === "current-shift-boom") { boom.rotation.y = -0.08; boom.position.z = 0; boat.position.set(3.0, 0, 0.3); }
      },
      animate(t, dt, session) {
        const step = session?.step;
        if (waterTex?.offset) { waterTex.offset.x = -t * 0.008; waterTex.offset.y = t * 0.003; }
        if (session?.turn && step?.id === "open-manifold") mv.userData.wheel.rotation.y = session.turn.amount * Math.PI * 2;
        const gg = session?.gauge;
        if (gg && !gg.committed && step?.id === "hose-pressure") pgNeedle.rotation.z = 1.1 - gg.t * 2.2;
        if (gg && !gg.committed && step?.id === "read-current") repaint(meterScreen, signFace(gg.t <= 0.58 && gg.t >= 0.4 ? "IN PLAN" : gg.t < 0.4 ? "SETTLING" : "PAST PLAN", { bg: "#0d1c24", accent: gg.t >= 0.4 && gg.t <= 0.58 ? "#59c97b" : "#f2ae14", fg: "#bfeaf7", scale: 0.5 }));
        if (step?.id === "agreed-rate" && session.holding) knob.rotation.z = -(session.track?.v ?? 0) * 2.4;
        if (boom.visible) boomSections.forEach((s, i) => { s.position.y = 0.07 + Math.sin(t * 1.6 + i) * 0.015; });
        if (streamers.visible) streamers.position.x = -(((t * 0.3) % 1.2) - 0.6);
        void dt; void reelDrum; void torus;
      },
    };
  },
};
