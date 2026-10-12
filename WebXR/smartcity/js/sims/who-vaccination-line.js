import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, ball, group, decal, repaint, signFace, paperFace, mat, counter, seatedFigure,
} from "../../../shared/kit.js";
import {
  CITY, stationPad, holoPanel, holoTag, instrument, standingFigure,
  surfaceTexture, texturedMat, pavingFace, reg,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Vaccination Line VR — Emergency Services, outbreak response.
// An outbreak vaccination session in a school hall: the session plan read
// first, the cold chain proven on the carrier thermometer, vials checked for
// their monitor and expiry, the carrier closed between doses, each person
// screened and consenting, the dose drawn with an auto-disable syringe, the
// syringe straight into the safety box with no recapping, the card and the
// tally kept, the observation area watched, and the box closed at its fill
// line. The vaccine is "the outbreak vaccine"; the only storage range stated
// is the one printed on its own label.

const WVL_ACCENT = 0x8a9fe0;
const WVL_ALERT = 0xf0645b;

function wvlBoard(parent, w, h, x, y, z, title, lines, o = {}) {
  return holoPanel(parent, w, h, x, y, z, (cx, cw, ch) => {
    cx.fillStyle = "rgba(10,12,26,0.92)"; cx.fillRect(0, 0, cw, ch);
    cx.fillStyle = o.css ?? "#8a9fe0"; cx.fillRect(0, 0, cw, 6);
    cx.fillStyle = "#e8ecfa"; cx.textAlign = "left"; cx.textBaseline = "middle";
    cx.font = `600 ${Math.round(ch * 0.1)}px 'Barlow Condensed', Arial, sans-serif`;
    cx.fillText(title, cw * 0.05, ch * 0.13);
    cx.font = `${Math.round(ch * 0.07)}px Arial, sans-serif`; cx.fillStyle = "#c8d0ee";
    lines.forEach((l, i) => cx.fillText(l, cw * 0.05, ch * (0.3 + i * 0.1)));
  }, { ry: o.ry ?? 0, accent: o.accent ?? WVL_ACCENT });
}

export const SIM_WHO_VACCINATION_LINE = {
  id: "who-vaccination-line",
  index: "223",
  domain: "Emergency Services",
  trade: "Vaccinator — NNU/CNA nurses, SEIU and AFSCME public-health staff, and the humanitarian workforce deployed under IASC clusters",
  category: "Emergency Services",
  indoor: "clinic",
  weather: "clear",
  certification: "WHO immunization practice as the national programme adopts it for an outbreak response — the cold chain, the vaccine vial monitor, auto-disable syringes, safety boxes, screening and consent, and observation for adverse events following immunization; WHO infection prevention and control guidance for injection safety and hand hygiene; OSHA 29 CFR 1910.1030 for sharps, the prohibition on recapping a used needle by hand and the post-exposure pathway, and 29 CFR 1910.134 where the session's risk assessment calls for respirators; CDC isolation precautions for anyone who arrives unwell; WHO outbreak communication guidance for answering hesitant questions at the table; the Sphere Handbook's health standards and IASC cluster coordination for the Health Cluster partners who run a campaign together; worked by NNU/CNA nurses with SEIU and AFSCME public-health staff",
  name: "Vaccination Line",
  title: simTitle("Vaccination Line"),
  tagline: "An outbreak vaccination session: the plan read, the cold chain proven, vials checked, each person screened and consenting, an auto-disable syringe straight into the safety box, the card kept and the observation area watched",
  accent: WVL_ACCENT,
  accentCss: "#8a9fe0",
  parSeconds: 300,
  footprint: 2.4,
  badge: { id: "cold-and-capped", name: "Cold and Uncapped", note: "The cold chain proven, every vial checked, every syringe straight into the box uncapped, and every person watched before they went home" },

  supportLine: "your agency's staff welfare or staff counsellor service, or the peer-support contact named at your deployment briefing",

  game: system({
    name: "Vaccine Table",
    currency: "DOSE",
    ranks: ["Recorder", "Vaccinator", "Team Lead", "Session Supervisor", "Vaccine Table Certified"],
    badges: [
      { id: "chain-held", name: "Chain Held", note: "The carrier temperature committed inside the label's range", test: AWARD.precise(0.7) },
      { id: "no-recap", name: "No Recap", note: "No recapped needle, no stale vial, nobody sent home early, no overfilled box", test: AWARD.safe },
      { id: "vials-read", name: "Vials Read", note: "Both bad vials found first time", test: AWARD.stepClean("vvm-check") },
    ],
    challenges: [
      { id: "clean-session", name: "Clean Session", note: "No corrections anywhere in the run", test: AWARD.clean },
      { id: "eyes-on", name: "Eyes On", note: "Observation area watched without a dropout", test: AWARD.unbroken },
      { id: "session-fast", name: "Session Fast", note: "Finished inside 85% of par", test: AWARD.fast(0.85) },
    ],
  }),

  hazards: {
    "wvl-recap": "You started to push the cap back onto the used needle with two hands. A needle recapped by hand is the classic needlestick: the cap misses, the point goes into the hand holding it. OSHA 29 CFR 1910.1030 bars recapping used needles by hand, and an auto-disable syringe goes straight into the safety box at the point of use, uncapped.",
    "wvl-stale-vial": "You reached for the opened vial left on the table from yesterday's session with no time written on it. An opened multi-dose vial is kept or discarded strictly by the programme's multi-dose vial rules, and one with no opening time on it cannot be shown to meet them; it goes in the discard, not in an arm.",
    "wvl-skip-observation": "You waved the vaccinated person straight out of the door. Everyone vaccinated waits in the observation area for the period the programme sets, because the rare serious reaction happens soon after the injection — in a hall with the anaphylaxis kit, not on a bus home.",
    "wvl-overfull-box": "You tried to force another syringe into a safety box already past its fill line. An overfilled box is where needles poke back out through the opening and through the cardboard, into the hand pushing them in or the worker who carries it away; it is closed at the line and replaced.",
  },

  lateNotes: {
    "wvl-carrier-latch": "Close the carrier after the vials have been checked and the good one taken out — not before you have looked at them.",
    "wvl-used-syringe": "The syringe goes to the box once the dose has been drawn and given; there is nothing to dispose of before that.",
  },

  steps: [
    {
      id: "session-plan", kind: "select", target: "wvl-session-board",
      title: "Read the session plan",
      cue: "Read today's plan: who is eligible, the vaccine and dose, the screening questions and the observation period.",
      why: "An outbreak vaccination session is run to a plan set by the national programme — who is eligible today, what the dose is, what counts as a reason to defer, how long people wait afterwards. Reading it before the first person sits down is what makes every vaccinator on the line give the same answer to the same question.",
    },
    {
      id: "cold-chain", kind: "gauge", target: "wvl-carrier-thermo",
      title: "Prove the cold chain",
      cue: "Read the carrier thermometer and commit when it sits inside the range printed on the vaccine's label — 2 to 8 °C for this one.",
      why: "Vaccine that has been too warm or frozen can look exactly like vaccine that works. The only proof is the temperature record, read and committed before any vial comes out; a carrier outside the label's range is reported and quarantined, because a dose that has lost its potency protects nobody while everyone believes it did.",
      gauge: { label: "CARRIER", speed: 0.55, green: [0.16, 0.61], readout: (t) => `${(t * 13).toFixed(1)} °C`, missNote: "Outside the label's range. The carrier is not proven — read it again, and if it is really out, report it and quarantine the vaccine." },
    },
    {
      id: "vvm-check", kind: "find", noHint: true,
      targets: ["wvl-vial-vvm", "wvl-vial-expired"],
      itemNames: { "wvl-vial-vvm": "vial past its monitor's discard point", "wvl-vial-expired": "expired vial" },
      itemNotes: {
        "wvl-vial-vvm": "Its vaccine vial monitor has darkened to the discard point — it has had more heat than it can take.",
        "wvl-vial-expired": "The expiry date on the label passed last month.",
      },
      title: "Check every vial before use",
      cue: "Look at each vial in the carrier and pick out any past its monitor's discard point or its expiry date.",
      why: "The vaccine vial monitor records the heat each vial has actually had, even when the carrier looks fine, and the expiry date is on every label for a reason. Checking both before a vial is opened means the only vials that reach the table are the ones that can still do their job.",
    },
    {
      id: "carrier-latch", kind: "turn", target: "wvl-carrier-latch",
      title: "Close the carrier",
      cue: "With a good vial out, turn the carrier latch until the lid seals.",
      why: "Every minute a carrier stands open in a warm hall is heat the vaccine inside it accumulates, and the vial monitors keep count. Closing the lid after each vial is taken — rather than leaving it open for convenience — is what keeps the vials at the bottom of the carrier usable at the end of the day.",
      turn: { turns: 0.5, axis: "z", label: "LATCH" },
    },
    {
      id: "screen", kind: "sequence",
      targets: ["wvl-scr-identity", "wvl-scr-contra", "wvl-scr-consent"],
      itemNames: { "wvl-scr-identity": "identity and eligibility", "wvl-scr-contra": "reasons to defer", "wvl-scr-consent": "consent" },
      title: "Screen and ask consent",
      cue: "Confirm who they are and that they are eligible, ask the plan's questions about reasons to defer, then ask for consent.",
      why: "The order keeps the conversation honest: eligibility first so nobody is vaccinated outside the plan, the deferral questions next so a reason not to vaccinate today is heard before anything else, and consent last — asked of a person who now knows what they are agreeing to and has had a chance to ask.",
      outOfOrderNote: "Identity and eligibility, then reasons to defer, then consent — consent is asked last, once they know what they are agreeing to.",
    },
    {
      id: "hand-hygiene", kind: "select", target: "wvl-handrub",
      title: "Hand hygiene before the injection",
      cue: "Rub your hands before you prepare the dose for this person.",
      why: "Hand hygiene before a clean procedure is one of WHO's five moments, and an injection is exactly that: a break in someone's skin. Doing it for each person, not once per session, is what keeps the vaccinator's hands from carrying anything from the last arm to the next syringe.",
    },
    {
      id: "draw-dose", kind: "hold", target: "wvl-syringe", seconds: 4,
      title: "Draw the dose with an auto-disable syringe",
      cue: "Hold steady while the auto-disable syringe draws exactly the dose on the plan.",
      why: "An auto-disable syringe locks after one use, which is what makes it impossible to reuse by mistake at the end of a long day. Drawing the dose steadily and exactly means each person gets what the plan says, and the vial yields the number of doses the programme counted on.",
      holdBreakNote: "You stopped before the dose was drawn. Hold steady until the syringe reaches the dose on the plan.",
    },
    {
      id: "dispose", kind: "drag", target: "wvl-used-syringe",
      title: "Straight into the safety box",
      cue: "Carry the used syringe straight to the safety box at your elbow — uncapped — and drop it in.",
      why: "The safety point in injection work is the few seconds between the needle leaving the arm and it being inside a puncture-resistant box. A box at the vaccinator's elbow and a syringe dropped in uncapped, one-handed, is how that window stays closed; it is the whole design of the station.",
      drag: { to: "wvl-safety-box", radius: 0.4, missNote: "Not into the box. A used needle goes straight into the safety box, uncapped — nowhere in between." },
    },
    {
      id: "record", kind: "select", target: "wvl-card",
      title: "Record the dose",
      cue: "Fill in the person's vaccination card and mark the tally sheet.",
      why: "The card is the person's proof of what they received and when their next dose is due, if there is one. The tally sheet is what tells the response how many people were reached today and how many doses were used — a coverage figure that decides where the teams go tomorrow.",
    },
    {
      id: "observation", kind: "track", target: "wvl-observation-area", seconds: 7,
      title: "Watch the observation area",
      cue: "Keep your eyes on the people waiting in the observation area, and stay in the band.",
      why: "People wait after vaccination so that a rare serious reaction happens where staff can see it and treat it at once. That only works if somebody is actually watching the chairs, not just sitting near them — reactions start quietly, with a person going pale or getting up unsteadily.",
      track: { start: 0.2, green: [0.4, 0.62], rise: 0.55, fall: 0.45, drift: 0.12, label: "WATCH", readout: (v) => (v < 0.4 ? "distracted" : v > 0.62 ? "tunnel vision" : "watching the room") },
      holdBreakNote: "Your attention left the observation area. Bring it back — the reaction you are watching for starts quietly.",
    },
    {
      id: "box-seal", kind: "select", target: "wvl-box-seal",
      title: "Close the safety box at the fill line",
      cue: "When the box reaches its printed fill line, close and seal it and start a new one.",
      why: "The fill line is set so the box can be closed without anyone pushing needles down to make room. Closing it at the line, sealing it and starting a fresh box keeps sharps inside something no hand has to press on, all the way to the incinerator or pit.",
    },
    {
      id: "crew-checkin", kind: "select", target: "wvl-crew-board",
      title: "Check in with the vaccination team",
      cue: "At the break, check in with the team — hands, backs and heads — and point anyone who needs it to staff care.",
      why: "A vaccination line is hundreds of the same careful movement, hours of hesitant questions and sometimes open hostility at the door. Checking in at the break — and naming staff care out loud — is how the team notices the vaccinator whose attention is slipping before a needle does.",
    },
    {
      id: "closing-log", kind: "hold", target: "wvl-session-log", seconds: 4,
      title: "Close the session log",
      cue: "Hold the session log open and read back doses given, vials opened and discarded, the cold-chain readings and any adverse event before you sign.",
      why: "The session log ties the doses given to the vials opened and the temperatures read, which is how a wasted vial, a cold-chain break or an adverse event gets followed up. Read back before signing, the numbers either reconcile or they tell you exactly where to look.",
      holdBreakNote: "You signed without reading it back. Open the log and read the doses, vials and events out before signing.",
    },
  ],

  interrupts: [
    {
      id: "carrier-left-open",
      kind: "Open carrier",
      after: "draw-dose", delay: 2, seconds: 13,
      alert: "The recorder's spare carrier at the next table has been left standing open in the sun from the window, its thermometer creeping up.",
      cue: "Close the spare carrier now — the vials inside are taking heat.",
      target: "wvl-spare-carrier",
      why: "The cold chain is broken by small things: a lid left open for ten minutes, a carrier set in a patch of sun. Closing it the moment it is seen costs a step away from the table; leaving it costs every vial inside it the heat their monitors will show tomorrow.",
      missNote: "The spare carrier stood open through the session. By the afternoon its vial monitors had darkened toward the discard point, and a box of doses meant for the next village went into the discard instead.",
      wrongNote: "Not that. The spare carrier on the next table is the one standing open — close it.",
    },
    {
      id: "person-collapses",
      kind: "Adverse event",
      after: "observation", delay: 3, seconds: 13,
      alert: "A young man in the observation area has gone grey and sweaty and slid sideways off his chair.",
      cue: "Get the anaphylaxis kit to him and call the team lead — now.",
      target: "wvl-aefi-kit",
      why: "Most people who feel faint after an injection have simply fainted, but a serious reaction starts the same way and it is treated fast or not at all. The kit is on the wall of the observation area so the first person who sees it can reach it without leaving him — and the event is recorded and reported afterwards.",
      missNote: "The kit stayed on the wall while people wondered whether he had just fainted. He had not; the minutes lost before treatment started were the ones that mattered most, and the event had to be investigated as a delay.",
      wrongNote: "Not that. The anaphylaxis kit is on the observation-area wall — bring it to him.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root, 0, 0, -1.9);
    stationPad(g, 2.4, WVL_ACCENT);

    // ---------------------------------------------------------- hall floor and walls
    const floor = box(g, 5.8, 0.04, 4.8, 0, 0.02, 0, 0xffffff, { rough: 0.6 });
    floor.material = texturedMat(
      surfaceTexture((cx, w, h) => pavingFace(cx, w, h, { tiles: 7, base: "#b8a07a", base2: "#aa936e", seam: "rgba(60,44,24,0.35)" }), { repeat: 4, px: 512 }),
      { rough: 0.55, metal: 0.02, color: 0xe8dcc4 },
    );
    box(g, 5.8, 2.6, 0.12, 0, 1.3, -2.4, 0xdfe3ea, { rough: 0.85 });
    for (let i = 0; i < 3; i++) box(g, 0.9, 0.8, 0.02, -1.8 + i * 1.8, 1.9, -2.33, 0xbfd6e6, { rough: 0.1, metal: 0.3, opacity: 0.55, transparent: true, cast: false });

    const plan = wvlBoard(g, 0.9, 0.6, -1.6, 1.55, -2.3, "SESSION PLAN — TODAY", [
      "Eligible: as posted by the programme", "Vaccine: the outbreak vaccine · dose on vial", "Screen: identity · defer? · consent",
      "Observe everyone for the posted period", "Box closes at the fill line",
    ]);
    reg(hits, plan, "wvl-session-board");

    // ---------------------------------------------------------- vaccinator's table
    const table = counter(g, 1.6, 0.7, -0.3, -1.2, 0xe8eef2, { ry: 0 });
    void table;
    const carrier = group(g, -0.85, 0.78, -1.3);
    box(carrier, 0.34, 0.26, 0.26, 0, 0.13, 0, 0x2a6ab8, { rough: 0.5 });
    const carrierLid = box(carrier, 0.36, 0.05, 0.28, 0, 0.29, 0, 0x2a5a9a, { rough: 0.5 });
    const latch = cyl(carrier, 0.025, 0.025, 0.03, 0, 0.18, 0.14, CITY.steel, { rough: 0.3, metal: 0.8, seg: 10 });
    latch.rotation.x = Math.PI / 2;
    holoTag(carrier, "Vaccine carrier", 0, 0.44, 0, { css: "#8a9fe0", w: 0.28 });
    reg(hits, latch, "wvl-carrier-latch");
    const thermo = instrument(g, -0.45, 0.8, -1.4, { idle: "-- °C", color: WVL_ACCENT, w: 0.12, d: 0.18 });
    holoTag(thermo, "Carrier thermometer", 0, 0.14, 0, { css: "#8a9fe0", w: 0.32 });
    reg(hits, thermo, "wvl-carrier-thermo");
    // Vials on a tray in front of the carrier.
    const tray = group(g, -0.6, 0.78, -1.0);
    box(tray, 0.34, 0.015, 0.14, 0, 0, 0, 0xdadfe2, { rough: 0.5 });
    const vials = [];
    for (let i = 0; i < 5; i++) vials.push(cyl(tray, 0.014, 0.014, 0.05, -0.12 + i * 0.06, 0.03, 0, 0xe8eef2, { rough: 0.2, opacity: 0.8, transparent: true, seg: 8 }));
    const vvmDot = box(tray, 0.012, 0.012, 0.004, -0.06, 0.04, 0.016, 0x2a2a3a, { rough: 0.5 });
    reg(hits, vials[1], "wvl-vial-vvm");
    void vvmDot;
    reg(hits, vials[3], "wvl-vial-expired");
    const staleVial = group(g, 0.35, 0.78, -1.45);
    cyl(staleVial, 0.016, 0.016, 0.05, 0, 0.025, 0, 0xe8eef2, { rough: 0.2, opacity: 0.8, transparent: true, seg: 8 });
    holoTag(staleVial, "Yesterday's open vial?", 0, 0.16, 0, { css: "#f0645b", w: 0.36 });
    reg(hits, staleVial, "wvl-stale-vial");
    // Screening cards.
    for (const [id, label, x] of [["wvl-scr-identity", "1 WHO / ELIGIBLE", -0.2], ["wvl-scr-contra", "2 DEFER?", 0.05], ["wvl-scr-consent", "3 CONSENT", 0.3]]) {
      const c = decal(g, 0.22, 0.12, x, 0.791, -0.95, signFace(label, { bg: "#0d1024", accent: "#8a9fe0", scale: 0.36 }), { px: 128 });
      c.rotation.x = -Math.PI / 2;
      reg(hits, c, id);
    }
    const rub = group(g, 0.55, 0.78, -1.0);
    box(rub, 0.06, 0.14, 0.06, 0, 0.07, 0, 0xe8eef2, { rough: 0.4 });
    holoTag(rub, "Hand rub", 0, 0.24, 0, { css: "#8a9fe0", w: 0.18 });
    reg(hits, rub, "wvl-handrub");
    const syringe = group(g, -0.15, 0.8, -1.3);
    cyl(syringe, 0.008, 0.008, 0.12, 0, 0, 0, 0xf2f2ee, { rough: 0.3, seg: 8 }).rotation.z = Math.PI / 2;
    cyl(syringe, 0.002, 0.002, 0.04, 0.08, 0, 0, CITY.steel, { rough: 0.3, metal: 0.9, seg: 6 }).rotation.z = Math.PI / 2;
    holoTag(syringe, "Auto-disable syringe", 0, 0.12, 0, { css: "#8a9fe0", w: 0.32 });
    reg(hits, syringe, "wvl-syringe");
    const used = group(g, 0.05, 0.8, -1.25);
    cyl(used, 0.008, 0.008, 0.12, 0, 0, 0, 0xd8d8d0, { rough: 0.3, seg: 8 }).rotation.z = Math.PI / 2;
    holoTag(used, "Used syringe", 0, 0.12, 0, { css: "#8a9fe0", w: 0.22 });
    used.visible = false;
    reg(hits, used, "wvl-used-syringe");
    const recap = group(g, 0.2, 0.8, -1.15);
    cyl(recap, 0.01, 0.01, 0.05, 0, 0, 0, 0xf2c14b, { rough: 0.5, seg: 8 }).rotation.z = Math.PI / 2;
    holoTag(recap, "Cap it back on?", 0, 0.12, 0, { css: "#f0645b", w: 0.28 });
    reg(hits, recap, "wvl-recap");
    const sbox = group(g, 0.55, 0.78, -1.4);
    box(sbox, 0.2, 0.22, 0.16, 0, 0.11, 0, 0xf2c14b, { rough: 0.7 });
    decal(sbox, 0.16, 0.06, 0, 0.14, 0.081, signFace("SAFETY BOX", { bg: "#f2c14b", accent: "#1a1a1a", fg: "#1a1a1a", scale: 0.4 }), { px: 128 });
    const fillLine = box(sbox, 0.2, 0.006, 0.162, 0, 0.17, 0, 0xd8232a, { rough: 0.5 });
    void fillLine;
    reg(hits, sbox, "wvl-safety-box");
    const seal = box(sbox, 0.1, 0.03, 0.1, 0, 0.235, 0, 0x2a2a2a, { rough: 0.5 });
    reg(hits, seal, "wvl-box-seal");
    const overfull = group(g, 1.0, 0.78, -1.3);
    box(overfull, 0.2, 0.22, 0.16, 0, 0.11, 0, 0xf2c14b, { rough: 0.7 });
    for (let i = 0; i < 4; i++) cyl(overfull, 0.006, 0.006, 0.1, -0.05 + i * 0.03, 0.26, 0, 0xd8d8d0, { rough: 0.3, seg: 6 });
    holoTag(overfull, "Push one more in?", 0, 0.42, 0, { css: "#f0645b", w: 0.3 });
    reg(hits, overfull, "wvl-overfull-box");
    const card = decal(g, 0.16, 0.1, -0.45, 0.791, -0.9, paperFace("VACCINATION CARD", ["Name", "Dose · date", "Next due"], { band: "#3a4a9a" }), { px: 128 });
    card.rotation.x = -Math.PI / 2;
    reg(hits, card, "wvl-card");
    // Vaccinator and the person being vaccinated.
    standingFigure(g, -0.3, -1.95, { ry: 0, cloth: 0x7fb8d8, vest: WVL_ACCENT, atStation: true });
    const client = seatedFigure(g, -0.2, 0.46, -0.45, { cloth: 0x6a5a3a, ry: Math.PI });
    void client;

    // ---------------------------------------------------------- observation area (right)
    const obs = group(g, 1.7, 0, 0.3);
    box(obs, 1.6, 0.01, 1.3, 0, 0.045, 0, 0x8a9fe0, { rough: 0.6, opacity: 0.3, transparent: true, cast: false });
    decal(obs, 0.6, 0.14, 0, 0.05, 0.6, signFace("OBSERVATION", { bg: "#0d1024", accent: "#8a9fe0", scale: 0.45 }), { px: 160 }).rotation.x = -Math.PI / 2;
    const chairs = [];
    for (const [cx, cz] of [[-0.5, -0.3], [0.1, -0.3], [0.6, -0.3], [-0.5, 0.35], [0.1, 0.35]]) {
      const ch = group(obs, cx, 0, cz);
      box(ch, 0.4, 0.04, 0.4, 0, 0.44, 0, 0x2b3236, { rough: 0.6 });
      box(ch, 0.4, 0.4, 0.04, 0, 0.66, -0.18, 0x2b3236, { rough: 0.6 });
      chairs.push(ch);
    }
    seatedFigure(obs, -0.5, 0.46, -0.3, { cloth: 0x8a4a6a });
    const sitting = seatedFigure(obs, 0.1, 0.46, -0.3, { cloth: 0x3a6a4a });
    const lying = standingFigure(obs, 0.3, 0.3, { lying: true, ry: 1.2, cloth: 0x3a6a4a });
    lying.visible = false;
    seatedFigure(obs, -0.5, 0.46, 0.35, { cloth: 0x6a6a8a });
    const obsTarget = box(obs, 1.4, 0.4, 1.1, 0, 0.9, 0, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(obs, "Observation area", 0, 1.6, -0.6, { css: "#8a9fe0", w: 0.3 });
    reg(hits, obsTarget, "wvl-observation-area");
    const aefi = group(g, 2.7, 0, -0.9, -Math.PI / 2);
    box(aefi, 0.4, 0.4, 0.16, 0, 1.2, 0, 0xd8232a, { rough: 0.5 });
    decal(aefi, 0.32, 0.1, 0, 1.25, 0.085, signFace("ANAPHYLAXIS KIT", { bg: "#d8232a", accent: "#fff", fg: "#fff", scale: 0.34 }), { px: 128 });
    reg(hits, aefi, "wvl-aefi-kit");
    const exitDoor = group(g, 2.85, 0, 1.3, -Math.PI / 2);
    box(exitDoor, 1.0, 2.1, 0.06, 0, 1.05, 0, 0x6a7a8a, { rough: 0.5 });
    decal(exitDoor, 0.4, 0.14, 0, 2.0, 0.04, signFace("EXIT", { bg: "#0d2418", accent: "#59c97b", scale: 0.5 }), { px: 128 });
    const skip = box(exitDoor, 0.6, 0.6, 0.1, 0, 1.2, 0.1, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(exitDoor, "Straight out the door?", 0, 1.55, 0.1, { css: "#f0645b", w: 0.36 });
    reg(hits, skip, "wvl-skip-observation");

    // ---------------------------------------------------------- recorder's table and the spare carrier
    const rec = counter(g, 1.0, 0.6, -2.0, 0.2, 0xe8eef2, { ry: Math.PI / 2 });
    void rec;
    const spare = group(g, -2.0, 0.78, -0.1);
    box(spare, 0.34, 0.26, 0.26, 0, 0.13, 0, 0x2a6ab8, { rough: 0.5 });
    const spareLid = box(spare, 0.36, 0.05, 0.28, 0, 0.29, 0, 0x2a5a9a, { rough: 0.5 });
    const spareLamp = ball(spare, 0.02, 0.15, 0.36, 0, WVL_ALERT, { emissive: WVL_ALERT, ei: 2.4, rough: 0.4 });
    spareLamp.visible = false;
    holoTag(spare, "Spare carrier", 0, 0.46, 0, { css: "#8a9fe0", w: 0.24 });
    reg(hits, spare, "wvl-spare-carrier");
    const sun = box(g, 0.8, 0.005, 0.7, -2.0, 0.045, -0.4, 0xfff2b0, { emissive: 0xfff2b0, ei: 0.5, opacity: 0.4, transparent: true, cast: false });
    sun.visible = false;
    standingFigure(g, -1.3, 1.0, { ry: 2.6, cloth: 0x4a5a6a });
    // Queue at the door.
    for (let i = 0; i < 3; i++) standingFigure(g, -2.5, 1.0 + i * 0.55, { ry: Math.PI * 0.9, cloth: [0x8a5a3a, 0x3a5a8a, 0x6a3a6a][i], atStation: true });

    const crewBoard = wvlBoard(g, 0.6, 0.4, -2.6, 1.5, -1.2, "TEAM CHECK-IN", ["Hands, backs, heads", "Staff care is there to use", "Swap roles at the break"], { ry: Math.PI / 2.4, accent: 0x7fd1c9, css: "#7fd1c9" });
    reg(hits, crewBoard, "wvl-crew-board");
    const sessionLog = wvlBoard(g, 0.55, 0.4, 0.8, 1.55, -2.3, "SESSION LOG", ["Doses · vials opened", "Cold-chain readings", "Adverse events"]);
    reg(hits, sessionLog, "wvl-session-log");

    return {
      hits,
      footprint: 2.4,
      spawnLook: new THREE.Vector3(0, 1.0, -2.4),

      onStepComplete(step) {
        if (step.id === "vvm-check") { vials[1].visible = false; vials[3].visible = false; }
        if (step.id === "carrier-latch") { latch.rotation.z = Math.PI / 2; }
        if (step.id === "draw-dose") { syringe.visible = false; used.visible = true; }
        if (step.id === "dispose") { used.visible = false; }
        if (step.id === "record") repaint(card, paperFace("VACCINATION CARD", ["Name: recorded", "Dose 1 · today", "Next due: as posted"], { band: "#2f7d4a" }));
        if (step.id === "box-seal") seal.material = mat(0x59c97b, { rough: 0.5 });
        if (step.id === "closing-log") repaint(sessionLog.userData.face, (cx, w, h) => {
          cx.fillStyle = "rgba(10,12,26,0.92)"; cx.fillRect(0, 0, w, h); cx.fillStyle = "#59c97b"; cx.fillRect(0, 0, w, 6);
          cx.fillStyle = "#eafcf1"; cx.font = `600 ${Math.round(h * 0.16)}px 'Barlow Condensed', Arial, sans-serif`;
          cx.textAlign = "center"; cx.textBaseline = "middle"; cx.fillText("SESSION CLOSED", w / 2, h / 2);
        });
      },

      onInterrupt(it) {
        if (it.id === "carrier-left-open") { spareLid.position.set(0, 0.3, -0.22); spareLid.rotation.x = -1.2; spareLamp.visible = true; sun.visible = true; }
        if (it.id === "person-collapses") { sitting.visible = false; lying.visible = true; }
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "carrier-left-open") { spareLid.position.set(0, 0.29, 0); spareLid.rotation.x = 0; spareLamp.visible = false; }
        if (it.id === "person-collapses") { aefi.position.set(1.9, 0, 0.5); }
      },

      onHazard() {},

      animate(t, dt, session) {
        void dt;
        const step = session?.step;
        if (spareLamp.visible && spareLamp.material) spareLamp.material.emissiveIntensity = 1.6 + Math.sin(t * 9) * 1.2;
        if (session?.turn && step?.id === "carrier-latch") latch.rotation.z = session.turn.amount * Math.PI * 2 * 0.5;
        void carrierLid;
        const gg = session?.gauge;
        if (gg && !gg.committed && step?.id === "cold-chain") {
          const ok = gg.t >= 0.16 && gg.t <= 0.61;
          repaint(thermo.userData.screen, signFace(`${(gg.t * 13).toFixed(1)} °C`, { bg: "#0d1c24", accent: ok ? "#59c97b" : "#f0645b", fg: "#eafcf9", scale: 0.55 }));
        }
      },
    };
  },
};
