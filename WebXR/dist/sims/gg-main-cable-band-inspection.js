import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import { box, cyl, ball, torus, hose, group, decal, repaint, signFace, paperFace, mat } from "../../../shared/kit.js";
import {
  CITY, stationPad, holoPanel, holoTag, toolChest, instrument, cone,
  standingFigure, reg, surfaceTexture, texturedMat, deckPlateFace, paintedSteelFace,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Main Cable Band Inspection VR — Construction & Structural
// Trades, the Bay Area bridge pack, on the golden-gate-deck district.
//
// A cable band is the clamp the suspender ropes hang from: two cast halves
// bolted round the main cable, holding by friction alone. The band stays put
// only while its bolts keep their tension, so the inspection is the band's
// position against its witness mark, the seam and caulking that keep water
// out of the cable, and the bolts brought back to tension in the charted
// sequence — never one slackened out of turn, which lets the band walk. The
// section here is the station's own mock-up on trestles in the closure; the
// district's cables hang overhead in International Orange.

const GGC_ACCENT = 0xd9572a;

export const SIM_GG_MAIN_CABLE_BAND_INSPECTION = {
  id: "gg-main-cable-band-inspection",
  index: "226",
  domain: "Construction",
  trade: "Ironworkers — main cable crew, trained through the Ironworkers' IMPACT programme, working with the owner's bridge engineer",
  category: "Construction & Structural Trades",
  district: "golden-gate-deck",
  certification: "Ironworkers and IMPACT bridge crew training; the National Bridge Inspection Standards (23 CFR 650) and the AASHTO Manual for Bridge Element Inspection for the band and cable condition; the owner's band-bolt tension procedure and sequence chart; OSHA 29 CFR 1926.502 and ANSI/ASSP Z359 for the hand-rope tie-off; 29 CFR 1926.106 for work over water",
  name: "Main Cable Band Inspection",
  title: simTitle("Main Cable Band Inspection"),
  tagline: "A cable band checked from the traveller: tied to the hand rope and the brake set, the seam and caulking walked, the band read against its witness mark, the tensioner seated while a gust hits, the band bolts brought to tension in the charted sequence and held there while a boat passes under, the end joint recaulked, the pump bled before a hose is touched, and the band logged",
  accent: GGC_ACCENT,
  accentCss: "#d9572a",
  parSeconds: 320,
  footprint: 2.8,
  badge: { id: "band-held", name: "Band Held", note: "Every band bolt brought to tension in the charted order, none slackened out of turn, and the pump bled to zero before a coupling was opened" },

  supportLine: "the Ironworkers' member assistance programme through your local, and the crew's peer-support contact",

  game: system({
    name: "Cable Crew",
    currency: "BAND",
    ranks: ["Catwalk Hand", "Band Checker", "Tensioner Tech", "Cable Lead", "Cable Crew Certified"],
    badges: [
      { id: "charted-order", name: "Charted Order", note: "Bolts tensioned in the chart's sequence without a correction", test: AWARD.stepClean("band-bolts") },
      { id: "steady-pressure", name: "Steady Pressure", note: "Tensioner pressure held inside the band the whole check", test: AWARD.precise(0.72) },
      { id: "dry-hands", name: "Dry Hands", note: "No unsafe action with the hydraulics or on the cable", test: AWARD.safe },
    ],
    challenges: [
      { id: "clean-band", name: "Clean Band", note: "No corrections from the work order to the log", test: AWARD.clean },
      { id: "no-dropout", name: "No Dropout", note: "The tension check never dropped out of band", test: AWARD.unbroken },
      { id: "band-inside-par", name: "Band Inside Par", note: "Logged inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "bolt-out-of-sequence": "You put the wrench on the band's far bolt and started backing it off, out of the charted order. A cable band holds on the cable by friction, and the friction comes from every bolt pulling the two halves together evenly; slacken one out of turn and the load it carried goes to its neighbours unevenly, the band can rock on the cable, and a band that has moved even a little has moved the suspender ropes with it. The sequence chart is the engineer's, and it is followed bolt by bolt.",
    "untethered-socket": "The socket and ratchet are sitting untethered on the traveller grating, over the edge of the deck with the strait beyond it. The traveller moves and flexes on the cable, grating has gaps, and a socket that drops from a cable band falls onto whatever is under the span — a lane of traffic or a boat. Every tool on the traveller rides on a lanyard or goes back in the tethered bag.",
    "cable-walk-unclipped": "You went to step up onto the main cable itself with your lanyard still on the traveller's rail and no hand-rope connection. The top of a main cable is curved, wet with the marine layer and slick with paint, and the hand ropes run alongside it precisely so a person on the cable is always connected to them. Off the traveller without that connection is a walk with nothing to stop a slip.",
    "pressurised-coupler": "You reached for the tensioner's hose coupling with the pump still showing pressure. A hydraulic bolt tensioner runs at pressures that can cut skin and inject fluid under it if a coupling is cracked live, and the injury looks like a pinprick until it is a surgical emergency. The pump is bled to zero and the gauge read before any coupling is touched.",
  },

  lateNotes: {
    "band-bolt-nut": "The bolts are brought to tension once the tensioner is seated on the first bolt of the chart — not with a wrench by feel.",
    "caulk-cartridge": "The end joint is recaulked once the bolts are at tension; caulking a band that is still being pulled up only cracks the new bead.",
    "band-log": "The band is logged once the pump is bled and stowed — the log records a finished inspection.",
  },

  steps: [
    {
      id: "work-order", kind: "select", target: "band-work-order",
      title: "Read the band work order and the sequence chart",
      cue: "Read which band is due, what the last inspection recorded, the tension figure, and the bolt sequence chart for this band.",
      why: "Every band on a main cable is numbered, and the work order says which one is due and why: a cycle under the National Bridge Inspection Standards, or a finding from the last walk. The sequence chart is the engineer's order for bringing the bolts to tension so the band closes evenly round the cable, and the tension figure is the number the whole job is measured against. Neither is something a crew improvises on the traveller.",
    },
    {
      id: "tie-off", kind: "sequence",
      targets: ["handrope-anchor", "traveller-brake"],
      itemNames: { "handrope-anchor": "lanyard on the hand rope", "traveller-brake": "traveller brake set and pinned" },
      title: "Clip to the hand rope and set the traveller brake",
      cue: "Clip your lanyard to the hand rope running beside the cable, then set and pin the traveller's brake before anything else is touched.",
      why: "The hand rope is the fall-protection line for anyone working at the cable, and the connection goes on before the work because a traveller parked on a sloping cable is a platform that can creep. The brake is set and pinned second, and checked by hand, because a band inspection puts the crew's weight and a heavy tensioner on one side of a platform held on the cable by its own brake alone.",
      outOfOrderNote: "Hand rope first — the brake is set by a person, and that person is connected before they lean over it.",
    },
    {
      id: "band-walk", kind: "find", noHint: true,
      targets: ["band-gap-rust", "caulk-split", "wrapping-wire-break"],
      itemNames: {
        "band-gap-rust": "rust bleeding from the band's split seam",
        "caulk-split": "caulking split at the band's end",
        "wrapping-wire-break": "a break in the cable's wrapping wire beside the band",
      },
      itemNotes: {
        "band-gap-rust": "Rust is bleeding out of the seam between the two band halves. Water is getting into the seam, and the steel of the band and the bolts inside it are corroding where no one can see them.",
        "caulk-split": "The caulking at the band's lower end has split along its length. The end joint is the path water takes down into the cable under the band, and the cable wires under a band are the ones hardest to inspect.",
        "wrapping-wire-break": "The wrapping wire round the cable beside the band has parted, and its paint has cracked with it. The wrapping and its paint are the cable's weather skin; a break in it lets water reach the main wires.",
      },
      title: "Walk the band: seam, end joints, wrapping",
      cue: "Look over the band and the cable either side of it and find where water is getting in: the seam, the end joints, the wrapping wire.",
      why: "A main cable fails from the inside, where water gets into the wires and stays there, and a cable band is the place water most wants to enter: a seam down the side, a joint at each end, and wrapping wire that has to be cut and closed round it. AASHTO element inspection rates the band and the cable next to it on exactly these defects, because each one is a path for water to the parallel wires the whole span hangs from.",
    },
    {
      id: "witness-mark", kind: "gauge", target: "witness-mark-gauge",
      title: "Read the band's slip against its witness mark",
      cue: "Set the slip gauge across the painted witness mark at the band's upper end and commit the reading inside the band.",
      why: "A band that has slipped down the cable has taken its suspender ropes with it, and the only way to know is the witness mark painted across the band's end and the cable when the band was last set. The slip gauge turns that mark into a number the engineer can compare with the last inspection; a reading outside the band is a finding that goes to the engineer before any bolt is touched.",
      gauge: {
        label: "BAND SLIP · % OF ALLOWANCE", speed: 0.62, green: [0.08, 0.4],
        readout: (t) => `${Math.round(t * 100)}% of allowance`,
        missNote: "That reading is past the slip allowance — or the gauge was not square to the mark. Set it across the mark itself and read again; a real slip is the engineer's call.",
      },
    },
    {
      id: "seat-tensioner", kind: "hold", target: "tensioner-seat", seconds: 5,
      title: "Seat the tensioner on the chart's first bolt",
      cue: "Thread the hydraulic tensioner's puller onto bolt one of the chart and hold it square on the band's bolt ear while it seats.",
      why: "A hydraulic tensioner stretches the bolt rather than twisting the nut, which is why its reading means something: it pulls the bolt to a set load and the nut is run down to hold it. That only works if the tensioner sits square on the ear; seated crooked it loads the bolt on one side, reads high, and can slip off under pressure with a hand beside it.",
      holdBreakNote: "The tensioner came off square before it seated. Hold it on the ear until the puller threads fully home.",
    },
    {
      id: "band-bolts", kind: "turn", target: "band-bolt-nut",
      title: "Run the band bolts to tension in the charted sequence",
      cue: "Work round the chart: pressure up, run the nut down on each bolt in turn, one to eight, crossing the band as the chart shows.",
      why: "The chart crosses the band — top then bottom, one end then the other — so the halves close evenly round the cable and the clamping force is spread over the whole band. Brought up in the wrong order, the first bolts pull the halves together at one end and the last ones cannot close the other, and a band clamped unevenly can slip on the cable under the next change in load.",
      turn: { turns: 1.2, label: "BAND BOLTS · CHART ORDER", readout: (t) => `bolt ${Math.min(8, 1 + Math.floor(t * 7))} of 8` },
    },
    {
      id: "tension-check", kind: "track", target: "tensioner-pump", seconds: 7,
      title: "Hold the check pressure while each nut is tried",
      cue: "Bring the pump to the check pressure and hold it steady while your partner tries each nut — no overshoot, no sag.",
      why: "The check is how the crew knows the bolts are holding what the engineer asked for: at the check pressure, a nut that turns has lost tension and one that does not is holding at least that much. The pressure is held steady rather than pumped past the figure, because overshooting stretches the bolt past its set and proves nothing, and sagging below it passes a bolt that is not actually at tension.",
      track: {
        start: 0.1, green: [0.42, 0.62], rise: 0.58, fall: 0.46, drift: 0.12, label: "TENSIONER · CHECK PRESSURE",
        readout: (v) => (v < 0.42 ? "below the check pressure" : v > 0.62 ? "past the figure — stretching the bolt" : "at the check pressure"),
      },
      holdBreakNote: "The pressure left the band while a nut was being tried — that bolt's check means nothing. Bring it back to the figure and try it again.",
    },
    {
      id: "recaulk", kind: "drag", target: "caulk-cartridge",
      title: "Recaulk the band's split end joint",
      cue: "Take the caulk gun to the band's lower end and run a bead into the split joint all the way round.",
      why: "The end joint is where the band meets the wrapped cable, and it is sealed so water running down the cable sheds over the band instead of into it. A split bead is a funnel: the next rain runs straight into the cable under the band, where the wires are hardest to reach. Recaulked after the bolts are at tension, the bead is not cracked again by the band closing.",
      drag: { to: "band-end-joint", radius: 0.4, missNote: "Not at the joint — the bead goes into the split at the band's lower end, not on the band face or the wrapping." },
    },
    {
      id: "re-mark", kind: "select", target: "witness-paint",
      title: "Renew the witness mark across the band and the cable",
      cue: "Paint a fresh witness line across the band's upper end and the cable, dated, so the next inspection has a clean line to read.",
      why: "The witness mark is only useful if the next crew can read it: the old line is weathered, and the band has just been brought to tension. A fresh line across the band and the cable, dated, is the starting point for the next slip reading, and without it the next inspection is measuring against a mark nobody can trust.",
    },
    {
      id: "bleed-pump", kind: "sequence",
      targets: ["pump-release", "hose-coupler"],
      itemNames: { "pump-release": "pump released to zero and the gauge read", "hose-coupler": "hose uncoupled from the tensioner" },
      title: "Bleed the pump to zero, then uncouple the hose",
      cue: "Open the pump's release and watch the gauge drop to zero; only then uncouple the hose from the tensioner.",
      why: "Stored hydraulic pressure stays in a hose and a tensioner long after the pump stops, and a coupling cracked under pressure can inject fluid through skin or whip the hose end. The release is opened and the gauge read at zero first, every time, because the only way to know a hydraulic line is dead is to see it on the gauge.",
      outOfOrderNote: "Release first, coupler second — a hose uncoupled with pressure on it is the injury this sequence exists to prevent.",
    },
    {
      id: "crank-back", kind: "turn", target: "traveller-crank",
      title: "Crank the traveller back off the band",
      cue: "Take the brake pin out and crank the traveller back to its parking position, hand over hand on the crank.",
      why: "The traveller rides the cable on a hand crank so the person riding it can stop it at once. It goes back to its parking position under control, never allowed to run, because on a sloping cable a free traveller picks up speed with only its parking brake to stop it — and a parking brake is not an arrester.",
      turn: { turns: 1.0, label: "TRAVELLER CRANK", readout: (t) => `${Math.round(t * 100)}% to the parking position` },
    },
    {
      id: "band-log", kind: "select", target: "band-log",
      title: "Log the band: slip, bolts, seam, joint, wrapping",
      cue: "Record the slip reading, the bolt check, the rust at the seam, the recaulked joint and the wrapping break for the engineer.",
      why: "The band log is how the owner's engineer follows each band over years: its slip reading against the last one, its bolts' check, and the defects that let water in. The rust at the seam and the wrapping break are repair items for the next crew and rating items under the National Bridge Inspection Standards, and a finding logged now is one the next inspection can compare against.",
    },
    {
      id: "crew-checkin", kind: "select", target: "cable-radio",
      title: "Check in with the engineer and your partner",
      cue: "Call the engineer and your partner on the cable channel: band logged, traveller parked, and how everyone is after a shift on the cable.",
      why: "The engineer needs to hear the band is finished and what was found, and the partner who held the tensioner deserves to hear the job is closed rather than work it out from the crew walking away. A shift over the water with a gust through it is also the kind that stays with people, so the crew checks in with each other before the next job; the Ironworkers' member assistance line is there for anything that does not clear with the shift.",
    },
  ],

  interrupts: [
    {
      id: "gust-on-the-cable",
      kind: "Gust past the work-stop limit",
      after: "seat-tensioner", delay: 2, seconds: 12,
      alert: "A gust comes up the span and the traveller's pennant stands out red — the wind reading on the traveller mast is past the work-stop limit.",
      cue: "Let go of the tensioner, get both hands on the traveller handrail and ride the gust out low.",
      target: "handrail-grab",
      why: "A person holding a heavy tensioner at the edge of a traveller in a gust has neither hand for themselves. The work-stop limit exists because past it the wind can move a body on a platform that is itself moving on the cable, and the answer is the same every time: let the tool hang on its lanyard, both hands on the handrail, get low and wait. The tensioner can be re-seated; a person cannot be re-seated.",
      missNote: "The seating went on through the gust with both hands on the tensioner and none on the traveller. A gust past the limit on a moving platform is exactly when a person goes over the rail.",
      wrongNote: "The handrail — both hands on the traveller. The tensioner hangs on its lanyard until the gust passes.",
    },
    {
      id: "boat-under-the-band",
      kind: "Boat under the work zone",
      after: "tension-check", delay: 3, seconds: 13,
      alert: "A work boat has come in under the span, right below the traveller — inside the exclusion the crew set on the water.",
      cue: "Stop the check and call the boat and the safety skiff on the cable radio: overhead work, clear the zone below.",
      target: "cable-radio",
      why: "Anything that leaves the traveller — a socket, a nut, a drop of hydraulic fluid — falls onto whatever is below, and from this height nobody on a boat hears it coming. The exclusion on the water only works if the crew above holds it, so the check stops and the call goes out the moment a boat is under the zone: overhead work stops until the boat is clear, and the safety skiff moves it on.",
      missNote: "The check carried on with a boat directly under the traveller. Had a nut or a tool gone over, it would have landed on a crew below who had no way to know they were under live overhead work.",
      wrongNote: "The cable radio — the boat is out of reach, and the only thing on this traveller that reaches it is the radio.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.8, GGC_ACCENT);

    const matTex = surfaceTexture((cx, w, h) => deckPlateFace(cx, w, h, { base: "#383e45", base2: "#2e343a" }), { repeat: 4, px: 256 });
    const workMat = box(g, 5.8, 0.02, 4.4, 0, 0.01, 0.1, 0x383e45, { rough: 0.8, metal: 0.3, cast: false });
    workMat.material = texturedMat(matTex, { rough: 0.8, metal: 0.3, color: 0x9aa2aa });

    // ------------------------------------------------ the cable section on trestles
    const cableTex = surfaceTexture((cx, w, h) => paintedSteelFace(cx, w, h, { cols: 1, rows: 16, pitch: 30 }), { repeat: 2, px: 256 });
    const cab = group(g, 0, 1.15, -1.25);
    cab.rotation.z = 0.06;
    const cable = cyl(cab, 0.42, 0.42, 5.8, 0, 0, 0, 0xc8461d, { rough: 0.62, metal: 0.3, seg: 24 });
    cable.rotation.z = Math.PI / 2;
    cable.material = texturedMat(cableTex, { rough: 0.62, metal: 0.3 });
    for (const tx of [-2.4, 2.4]) {
      const tr = group(g, tx, 0, -1.25);
      for (const sz of [-1, 1]) {
        const l = box(tr, 0.08, 1.2, 0.08, 0, 0.55, sz * 0.32, 0x5a636c, { rough: 0.5, metal: 0.6 });
        l.rotation.x = sz * 0.28;
      }
      box(tr, 0.12, 0.1, 0.9, 0, 0.72, 0, 0x5a636c, { rough: 0.5, metal: 0.6 });
      box(tr, 0.5, 0.04, 1.0, 0, 0.02, 0, 0x3a4148, { rough: 0.6, metal: 0.5 });
    }
    // The band: two halves, the seam ears top and bottom, eight bolts.
    const band = group(cab, 0.3, 0, 0);
    const shell = cyl(band, 0.5, 0.5, 0.7, 0, 0, 0, 0xb63f19, { rough: 0.6, metal: 0.35, seg: 24 });
    shell.rotation.z = Math.PI / 2;
    for (const sx of [-0.36, 0.36]) {
      const lip = cyl(band, 0.47, 0.47, 0.04, sx, 0, 0, 0xa83a17, { rough: 0.6, metal: 0.35, seg: 24 });
      lip.rotation.z = Math.PI / 2;
    }
    const bolts = [];
    for (const side of [1, -1]) {
      box(band, 0.7, 0.12, 0.18, 0, side * 0.52, 0, 0xb63f19, { rough: 0.6, metal: 0.35 });
      for (let i = 0; i < 4; i++) {
        const bx = -0.25 + i * 0.167;
        const b = cyl(band, 0.024, 0.024, 0.32, bx, side * 0.52, 0, 0x8a949d, { rough: 0.35, metal: 0.85, seg: 8 });
        b.rotation.x = Math.PI / 2;
        const n = cyl(band, 0.04, 0.04, 0.05, bx, side * 0.52, 0.185, 0x5a636c, { rough: 0.4, metal: 0.8, seg: 6 });
        n.rotation.x = Math.PI / 2;
        bolts.push(n);
      }
    }
    // Suspender ropes from the band's lower ear to deck sockets.
    for (const dz of [-0.14, 0.14]) {
      cyl(g, 0.03, 0.03, 0.62, 0.28, 0.31, -1.25 + dz, 0x9a3a16, { rough: 0.7, metal: 0.3, seg: 8 });
      box(g, 0.14, 0.1, 0.14, 0.28, 0.05, -1.25 + dz, 0x5a636c, { rough: 0.5, metal: 0.6 });
    }
    holoTag(band, "Cable band — this cycle", 0, 0.78, 0, { css: "#d9572a", w: 0.46 });
    const nutOne = group(band, -0.25, 0.52, 0.22);
    ball(nutOne, 0.03, 0, 0, 0, 0xf2c14b, { emissive: 0xf2c14b, ei: 0.6, rough: 0.4, seg: 8, seg2: 6 });
    holoTag(nutOne, "bolt 1 — turn", 0, 0.1, 0, { css: "#d9572a", w: 0.26 });
    reg(hits, nutOne, "band-bolt-nut");
    const farBolt = box(band, 0.08, 0.08, 0.08, 0.25, -0.52, 0.22, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(band, "back this one off first?", 0.3, -0.72, 0.24, { css: "#d2312b", w: 0.48 });
    reg(hits, farBolt, "bolt-out-of-sequence");
    const seamRust = box(band, 0.5, 0.03, 0.012, 0, 0.44, 0.1, 0x7a3514, { rough: 0.9 });
    reg(hits, seamRust, "band-gap-rust");
    const caulk = torus(band, 0.435, 0.012, -0.37, 0, 0, 0x6b6558, { rough: 0.9, seg: 6, seg2: 24 });
    caulk.rotation.y = Math.PI / 2;
    reg(hits, caulk, "caulk-split");
    const endJoint = box(band, 0.06, 0.2, 0.2, -0.4, -0.3, 0.3, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, endJoint, "band-end-joint");
    const wrapBreak = group(cab, -0.55, 0.38, 0.16);
    for (let i = 0; i < 3; i++) box(wrapBreak, 0.012, 0.06, 0.012, i * 0.02, 0.02 * i, 0, 0xcfc8b8, { rough: 0.7, metal: 0.4 }).rotation.z = 0.6 + i * 0.2;
    reg(hits, wrapBreak, "wrapping-wire-break");
    const witness = group(band, 0.36, 0.3, 0.36);
    box(witness, 0.12, 0.012, 0.02, 0.04, 0, 0, 0xf2f2f2, { rough: 0.6 });
    reg(hits, witness, "witness-paint");
    holoTag(band, "witness mark", 0.46, 0.44, 0.38, { css: "#d9572a", w: 0.26 });
    const slipGauge = instrument(g, 0.95, 1.05, -0.62, { ry: -0.2, idle: "-- %", color: GGC_ACCENT, w: 0.1, d: 0.16 });
    holoTag(slipGauge, "slip gauge", 0, 0.14, 0, { css: "#d9572a", w: 0.24 });
    reg(hits, slipGauge, "witness-mark-gauge");
    box(g, 0.24, 0.9, 0.24, 0.95, 0.47, -0.62, 0x3a4148, { rough: 0.6, metal: 0.4 });

    // Hand ropes above the cable, on stanchions.
    for (const sx of [-2.0, 0, 2.0]) cyl(g, 0.02, 0.02, 0.9, sx, 1.95 + sx * 0.03, -1.25, 0x9aa1a8, { rough: 0.45, metal: 0.7, seg: 8 });
    const handRope = hose(g, [[-2.8, 2.3, -1.25], [0, 2.38, -1.25], [2.8, 2.55, -1.25]], 0.014, 0xd9d2c0, { steps: 16, rough: 0.8 });
    void handRope;
    const hrAnchor = group(g, -0.9, 2.34, -1.25);
    torus(hrAnchor, 0.04, 0.009, 0, -0.05, 0, 0xd8b23a, { rough: 0.4, metal: 0.7, seg: 6, seg2: 14 });
    holoTag(hrAnchor, "hand rope — clip", 0, 0.12, 0, { css: "#d9572a", w: 0.32 });
    reg(hits, hrAnchor, "handrope-anchor");
    const cableWalk = box(cab, 0.6, 0.12, 0.3, -1.6, 0.48, 0, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(cab, "step onto the cable unclipped?", -1.6, 0.72, 0, { css: "#d2312b", w: 0.56 });
    reg(hits, cableWalk, "cable-walk-unclipped");

    // ------------------------------------------------ the traveller alongside
    const trav = group(g, 0.1, 0, -0.3);
    const tgrate = box(trav, 2.4, 0.06, 0.8, 0, 0.18, 0, 0x5a636c, { rough: 0.6, metal: 0.5 });
    void tgrate;
    for (let i = 0; i < 8; i++) box(trav, 0.02, 0.065, 0.8, -1.05 + i * 0.3, 0.185, 0, 0x454c54, { rough: 0.6, metal: 0.5 });
    for (const sx of [-1.15, 1.15]) {
      box(trav, 0.06, 1.2, 0.06, sx, 0.8, 0.38, CITY.hiVis, { rough: 0.55 });
      box(trav, 0.06, 1.9, 0.06, sx, 1.1, -0.38, CITY.hiVis, { rough: 0.55 });
    }
    const handrail = box(trav, 2.36, 0.05, 0.05, 0, 1.38, 0.38, CITY.hiVis, { rough: 0.55 });
    box(trav, 2.36, 0.05, 0.05, 0, 0.8, 0.38, CITY.hiVis, { rough: 0.55 });
    box(trav, 2.36, 0.12, 0.12, 0, 2.02, -0.38, 0x2a2f35, { rough: 0.6, metal: 0.5 });
    holoTag(trav, "handrail", -0.6, 1.5, 0.4, { css: "#d9572a", w: 0.22 });
    reg(hits, handrail, "handrail-grab");
    const brake = group(trav, -1.0, 1.05, 0.44);
    torus(brake, 0.07, 0.014, 0, 0, 0, 0xb8402f, { rough: 0.55, seg: 6, seg2: 16 });
    for (let i = 0; i < 3; i++) box(brake, 0.14, 0.012, 0.012, 0, 0, 0, 0xb8402f, { rough: 0.55 }).rotation.z = (i * Math.PI) / 3;
    holoTag(brake, "traveller brake", 0, 0.14, 0, { css: "#d9572a", w: 0.3 });
    reg(hits, brake, "traveller-brake");
    const crank = group(trav, 1.0, 1.05, 0.44);
    cyl(crank, 0.05, 0.05, 0.03, 0, 0, 0, CITY.darkSteel, { rough: 0.5, metal: 0.5, seg: 12 }).rotation.x = Math.PI / 2;
    const crankArm = box(crank, 0.16, 0.02, 0.02, 0.08, 0, 0.03, 0xd8b23a, { rough: 0.5, metal: 0.4 });
    holoTag(crank, "traveller crank", 0, 0.14, 0, { css: "#d9572a", w: 0.3 });
    reg(hits, crank, "traveller-crank");
    const socket = group(trav, 0.9, 0.23, 0.3, 0.4);
    box(socket, 0.18, 0.02, 0.03, 0, 0, 0, 0xdfe4e8, { rough: 0.35, metal: 0.8 });
    cyl(socket, 0.025, 0.025, 0.05, 0.1, 0.01, 0, 0xdfe4e8, { rough: 0.35, metal: 0.8, seg: 8 });
    reg(hits, socket, "untethered-socket");
    const pennant = box(trav, 0.24, 0.1, 0.006, -1.03, 2.2, -0.38, 0x59c97b, { rough: 0.6, cast: false });
    const strobe = ball(trav, 0.05, 1.15, 2.14, -0.38, 0xff3b30, { emissive: 0xff3b30, ei: 2.6, seg: 8, seg2: 6 });
    strobe.visible = false;

    // ------------------------------------------------ tensioner and pump
    const seat = group(band, -0.25, 0.52, 0.34);
    cyl(seat, 0.07, 0.07, 0.16, 0, 0, 0, 0xe07a3f, { rough: 0.5, metal: 0.4, seg: 12 }).rotation.x = Math.PI / 2;
    holoTag(seat, "tensioner — hold", 0, 0.14, 0.04, { css: "#d9572a", w: 0.34 });
    reg(hits, seat, "tensioner-seat");
    const pump = group(g, 1.75, 0, 0.55, -0.5);
    box(pump, 0.44, 0.34, 0.3, 0, 0.17, 0, 0x2f4f6f, { rough: 0.5, metal: 0.4 });
    box(pump, 0.3, 0.05, 0.05, 0, 0.4, -0.12, 0x9aa1a8, { rough: 0.45, metal: 0.7 });
    const pumpScreen = instrument(pump, 0, 0.36, 0.05, { idle: "0 BAR", color: 0x2f4f6f, w: 0.12, d: 0.14 });
    holoTag(pump, "tensioner pump", 0, 0.62, 0, { css: "#d9572a", w: 0.32 });
    reg(hits, pump, "tensioner-pump");
    const relief = group(pump, -0.18, 0.3, 0.16);
    cyl(relief, 0.03, 0.03, 0.04, 0, 0, 0, 0xd8232a, { rough: 0.5, seg: 10 }).rotation.x = Math.PI / 2;
    holoTag(relief, "release valve", 0, 0.09, 0, { css: "#d9572a", w: 0.28 });
    reg(hits, relief, "pump-release");
    hose(g, [[1.6, 0.25, 0.6], [1.2, 0.3, 0.1], [0.6, 1.2, -0.5], [0.05, 1.67, -0.91]], 0.014, 0x1b1e23, { steps: 20, rough: 0.75 });
    const coupler = group(g, 1.2, 0.34, 0.12);
    cyl(coupler, 0.024, 0.024, 0.07, 0, 0, 0, 0xc0c6cc, { rough: 0.3, metal: 0.9, seg: 8 }).rotation.z = Math.PI / 2;
    holoTag(coupler, "hose coupler", 0, 0.1, 0, { css: "#d9572a", w: 0.26 });
    reg(hits, coupler, "hose-coupler");
    const liveCoupler = box(g, 0.2, 0.16, 0.2, 1.45, 0.3, 0.42, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "crack it with pressure on?", 1.45, 0.52, 0.42, { css: "#d2312b", w: 0.48 });
    reg(hits, liveCoupler, "pressurised-coupler");

    // ------------------------------------------------ chest, caulk, paperwork, radio
    const chest = toolChest(g, -1.7, 1.7, { ry: 0.4, color: 0x6a3420 });
    const gun = group(chest, -0.1, 0.8, 0.02, 0.3);
    cyl(gun, 0.03, 0.03, 0.24, 0, 0, 0, 0xdfe4e8, { rough: 0.5, seg: 10 }).rotation.z = Math.PI / 2;
    box(gun, 0.04, 0.08, 0.02, -0.08, -0.05, 0, 0x2b3138, { rough: 0.6 });
    holoTag(gun, "caulk gun — carry", 0, 0.12, 0, { css: "#d9572a", w: 0.34 });
    reg(hits, gun, "caulk-cartridge");
    const radio = instrument(chest, 0.16, 0.79, 0.04, { ry: 0.1, idle: "CABLE CH", color: GGC_ACCENT, w: 0.1, d: 0.16 });
    holoTag(radio, "cable radio", 0, 0.15, 0, { css: "#d9572a", w: 0.26 });
    reg(hits, radio, "cable-radio");
    const order = holoPanel(g, 0.9, 0.6, -2.35, 1.3, 0.35, (cx, w, h) => {
      cx.fillStyle = "rgba(20,10,6,0.92)"; cx.fillRect(0, 0, w, h); cx.fillStyle = "#d9572a"; cx.fillRect(0, 0, w, 6);
      cx.font = `600 ${Math.round(h * 0.1)}px 'Barlow Condensed', Arial, sans-serif`; cx.textAlign = "left"; cx.textBaseline = "middle";
      cx.fillStyle = "#ffe2d2"; cx.fillText("BAND WORK ORDER", w * 0.06, h * 0.13);
      cx.font = `${Math.round(h * 0.066)}px Arial, sans-serif`; cx.fillStyle = "#f5eae4";
      ["Band: as numbered on the cable", "Cycle: per the inspection programme", "Tension: engineer's figure, hydraulic",
       "Sequence: 1–8 across the band, per chart", "Slip: read at the witness mark", "Seams and end joints: sealed or logged"]
        .forEach((l, i) => cx.fillText(l, w * 0.06, h * (0.29 + i * 0.11)));
      cx.strokeStyle = "#d9572a"; cx.lineWidth = 2;
      for (let i = 0; i < 4; i++) { cx.strokeRect(w * (0.62 + (i % 2) * 0.14), h * (0.3 + Math.floor(i / 2) * 0.2), w * 0.1, h * 0.14); }
    }, { ry: 1.0, accent: GGC_ACCENT });
    reg(hits, order, "band-work-order");
    const log = holoPanel(g, 0.72, 0.5, 2.3, 1.35, 1.15, (cx, w, h) => {
      cx.fillStyle = "rgba(20,10,6,0.92)"; cx.fillRect(0, 0, w, h); cx.fillStyle = "#d9572a"; cx.fillRect(0, 0, w, 6);
      cx.font = `600 ${Math.round(h * 0.12)}px 'Barlow Condensed', Arial, sans-serif`; cx.textAlign = "left"; cx.textBaseline = "middle";
      cx.fillStyle = "#ffe2d2"; cx.fillText("BAND LOG", w * 0.06, h * 0.15);
      cx.font = `${Math.round(h * 0.085)}px Arial, sans-serif`; cx.fillStyle = "#f5eae4";
      ["Slip: —", "Bolts: —", "Seam / joint: —", "Wrapping: —"].forEach((l, i) => cx.fillText(l, w * 0.06, h * (0.36 + i * 0.16)));
    }, { ry: -0.9, accent: GGC_ACCENT });
    reg(hits, log, "band-log");

    // ------------------------------------------------ crew and closure edge
    const partner = standingFigure(g, 2.55, -0.3, { ry: -1.8, cloth: 0x2b3138, vest: 0xe4dc3a, helmet: 0xf2c14b, harness: true });
    holoTag(partner, "cable crew partner", 0, 1.95, 0, { css: "#59c97b", w: 0.38 });
    const engineer = standingFigure(g, -2.72, -0.33, { ry: 1.6, cloth: 0x1f3a52, vest: 0xf2f2f2, helmet: 0xf2f2f2 });
    holoTag(engineer, "owner's engineer", 0, 1.95, 0, { css: "#59c97b", w: 0.34 });
    cone(g, 0.3, 2.45, { color: GGC_ACCENT }); cone(g, 2.4, 2.3, { color: GGC_ACCENT }); cone(g, -0.9, 2.5, { color: GGC_ACCENT });

    // ------------------------------------------------ the boat below, off the strait side
    const boat = group(g, -54, -45.6, 24);
    box(boat, 2.4, 0.7, 7.0, 0, 0.35, 0, 0xe6e9ec, { rough: 0.5 });
    box(boat, 1.8, 1.1, 2.2, 0, 1.2, 0.8, 0x2f4f6f, { rough: 0.5 });
    box(boat, 2.5, 0.12, 7.1, 0, 0.72, 0, 0xd2312b, { rough: 0.6 });
    boat.visible = false;
    const boatHome = boat.position.clone();

    let gusting = false, boatIn = false;
    const paintLog = () => repaint(log.userData.face, (cx, w, h) => {
      cx.fillStyle = "rgba(20,10,6,0.92)"; cx.fillRect(0, 0, w, h); cx.fillStyle = "#59c97b"; cx.fillRect(0, 0, w, 6);
      cx.font = `600 ${Math.round(h * 0.12)}px 'Barlow Condensed', Arial, sans-serif`; cx.textAlign = "left"; cx.textBaseline = "middle";
      cx.fillStyle = "#ffe2d2"; cx.fillText("BAND LOG", w * 0.06, h * 0.15);
      cx.font = `${Math.round(h * 0.072)}px Arial, sans-serif`; cx.fillStyle = "#f5eae4";
      ["Slip: inside the allowance · mark renewed", "Bolts: 1–8 checked at pressure, chart order", "Seam rust · end joint recaulked", "Wrapping break beside band: repair order"]
        .forEach((l, i) => cx.fillText(l, w * 0.06, h * (0.36 + i * 0.16)));
    });

    return {
      hits,
      spawnLook: new THREE.Vector3(0.2, 1.2, -1.2),
      onStepComplete(step) {
        if (step.id === "tie-off") hose(g, [[-0.9, 2.28, -1.25], [-0.7, 1.6, -0.6], [-0.4, 1.1, -0.2]], 0.01, 0xe0662e, { steps: 8, rough: 0.7 });
        if (step.id === "band-walk") seamRust.material = mat(0xb8402f, { rough: 0.8, emissive: 0x4a1a08, ei: 0.4 });
        if (step.id === "band-bolts") for (const n of bolts) n.material = mat(0x59c97b, { rough: 0.4, metal: 0.6 });
        if (step.id === "recaulk") caulk.material = mat(0xd8d2c4, { rough: 0.7 });
        if (step.id === "re-mark") witness.position.x = 0.3;
        if (step.id === "bleed-pump") repaint(pumpScreen.userData.screen, signFace("0 BAR", { bg: "#0d1c24", accent: "#59c97b", fg: "#bfeaf7", scale: 0.6 }));
        if (step.id === "band-log") paintLog();
        if (step.id === "crew-checkin") repaint(radio.userData.screen, signFace("BAND CLOSED", { bg: "#0d1c24", accent: "#59c97b", fg: "#bfeaf7", scale: 0.5 }));
      },
      onInterrupt(it) {
        if (it.id === "gust-on-the-cable") {
          gusting = true; strobe.visible = true;
          pennant.material = mat(0xd2312b, { rough: 0.6, emissive: 0x6a1010, ei: 0.8, cast: false });
          trav.rotation.z = 0.03;
        }
        if (it.id === "boat-under-the-band") {
          boatIn = true; boat.visible = true; boat.position.set(-40, -45.6, -2);
          repaint(radio.userData.screen, signFace("BOAT BELOW", { bg: "#0d1c24", accent: "#f0645b", fg: "#bfeaf7", scale: 0.5 }));
        }
      },
      onInterruptEnd(it) {
        if (it.id === "gust-on-the-cable") {
          gusting = false;
          if (it.resolved !== "answered") return;
          strobe.visible = false; trav.rotation.z = 0;
          pennant.material = mat(0x59c97b, { rough: 0.6, cast: false });
        }
        if (it.id === "boat-under-the-band") {
          boatIn = false;
          if (it.resolved !== "answered") return;
          boat.position.set(-54, -45.6, -32);
          repaint(radio.userData.screen, signFace("ZONE CLEAR", { bg: "#0d1c24", accent: "#59c97b", fg: "#bfeaf7", scale: 0.5 }));
        }
      },
      onHazard(hitId) {
        if (hitId === "untethered-socket") socket.position.z = 0.36;
      },
      animate(t, dt, session) {
        pennant.rotation.y = Math.sin(t * (gusting ? 7 : 2)) * (gusting ? 0.6 : 0.15);
        if (strobe.visible) strobe.material.emissiveIntensity = Math.sin(t * 12) > 0 ? 3 : 0.4;
        if (boatIn) boat.position.z += (dt ?? 0.016) * 0.6;
        if (!boat.visible) boat.position.copy(boatHome);
        const step = session?.step;
        const gg = session?.gauge;
        if (gg && !gg.committed && step?.id === "witness-mark") {
          repaint(slipGauge.userData.screen, signFace(`${Math.round(gg.t * 100)}%`, { bg: "#0d1c24", accent: gg.t >= 0.08 && gg.t <= 0.4 ? "#59c97b" : "#f0645b", fg: "#bfeaf7", scale: 0.6 }));
        }
        if (step?.id === "tension-check" && session.holding && session.track) {
          const v = session.track.v;
          repaint(pumpScreen.userData.screen, signFace(`${Math.round(v * 100)}%`, { bg: "#0d1c24", accent: v >= 0.42 && v <= 0.62 ? "#59c97b" : "#f2ae14", fg: "#bfeaf7", scale: 0.6 }));
        }
        if (session?.turn && step?.id === "crank-back") crankArm.rotation.z = session.turn.amount * Math.PI * 2;
        if (session?.turn && step?.id === "band-bolts") nutOne.rotation.z = session.turn.amount * Math.PI * 2;
        void CITY; void decal; void paperFace;
      },
    };
  },
};
