import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, ball, group, decal, repaint, signFace, paperFace, mat, hose, particles,
} from "../../../shared/kit.js";
import {
  CITY, stationPad, holoPanel, holoTag, instrument, standingFigure, valveWheel, cone,
  surfaceTexture, texturedMat, mudflatFace, reg,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Water, Sanitation and Hygiene VR — Emergency Services,
// outbreak response. A camp's water point and sanitation line during an
// outbreak, run the way the Sphere Handbook's WASH standards and the WASH
// cluster expect: water treated in order, chlorine dosed from the jar test
// and not by eye, the contact time kept before the taps open, a residual read
// at the tap, latrines sited downhill and away from the water, hand washing
// at every latrine, clean covered containers, and a hygiene promoter who
// talks with people rather than at them. No residual figure or distance is
// stated here: the numbers are the plan's and the Handbook's, read off the
// board, not invented.

const WSH_ACCENT = 0x4f9fd0;
const WSH_ALERT = 0xf0645b;

function wshBoard(parent, w, h, x, y, z, title, lines, o = {}) {
  return holoPanel(parent, w, h, x, y, z, (cx, cw, ch) => {
    cx.fillStyle = "rgba(6,14,24,0.92)"; cx.fillRect(0, 0, cw, ch);
    cx.fillStyle = o.css ?? "#4f9fd0"; cx.fillRect(0, 0, cw, 6);
    cx.fillStyle = "#e2eef8"; cx.textAlign = "left"; cx.textBaseline = "middle";
    cx.font = `600 ${Math.round(ch * 0.1)}px 'Barlow Condensed', Arial, sans-serif`;
    cx.fillText(title, cw * 0.05, ch * 0.13);
    cx.font = `${Math.round(ch * 0.07)}px Arial, sans-serif`; cx.fillStyle = "#bcd6ea";
    lines.forEach((l, i) => cx.fillText(l, cw * 0.05, ch * (0.3 + i * 0.1)));
  }, { ry: o.ry ?? 0, accent: o.accent ?? WSH_ACCENT });
}

export const SIM_WHO_WATER_SANITATION_AND_HYGIENE = {
  id: "who-water-sanitation-and-hygiene",
  index: "222",
  domain: "Emergency Services",
  trade: "WASH officer and hygiene promoter — SEIU and AFSCME public-health staff, NNU/CNA nurses, and the humanitarian workforce deployed under IASC clusters",
  category: "Emergency Services",
  weather: "clear",
  certification: "The Sphere Handbook's water supply, sanitation and hygiene promotion standards as the WASH cluster applies them under IASC cluster coordination — treated water with a chlorine residual at the point of delivery, latrines sited away from and downhill of water sources, hand washing at every latrine, clean covered household containers; WHO infection prevention and control guidance for chlorine solutions and hand hygiene in an outbreak; CDC isolation precautions for the health facility the water point also serves; OSHA 29 CFR 1910.134 for the respirator worn when handling chlorine concentrate and 29 CFR 1910.1030 for faecal and body-fluid spills; WHO outbreak communication guidance for the hygiene promoter's conversations; worked by SEIU and AFSCME public-health staff with NNU/CNA nurses",
  name: "Water, Sanitation and Hygiene",
  title: simTitle("Water, Sanitation and Hygiene"),
  tagline: "A camp water point in an outbreak: treated in order, dosed from the jar test, contact time kept, a residual read at the tap, latrines downhill with hand washing at every one, clean covered containers and a hygiene promoter who listens",
  accent: WSH_ACCENT,
  accentCss: "#4f9fd0",
  parSeconds: 320,
  footprint: 2.4,
  badge: { id: "safe-at-tap", name: "Safe at the Tap", note: "Water treated, dosed, held and proven at the tap, latrines sited right with a basin at every one, and nobody drinking from the bypass" },

  supportLine: "your agency's staff welfare or staff counsellor service, or the peer-support contact named at your deployment briefing",

  game: system({
    name: "Water Point",
    currency: "LITRE",
    ranks: ["WASH Volunteer", "Water Operator", "WASH Officer", "WASH Coordinator", "Water Point Certified"],
    badges: [
      { id: "jar-test", name: "Jar Test", note: "The dose committed on the jar-test mark", test: AWARD.precise(0.7) },
      { id: "no-shortcut", name: "No Shortcut", note: "No dose by eye, no latrine uphill, no open bucket, no tap before the contact time", test: AWARD.safe },
      { id: "in-order", name: "In Order", note: "Settle, filter, chlorinate — first time", test: AWARD.stepClean("treatment-order") },
    ],
    challenges: [
      { id: "clean-point", name: "Clean Point", note: "No corrections anywhere in the run", test: AWARD.clean },
      { id: "steady-pump", name: "Steady Pump", note: "Dosing pump held matched to flow without a dropout", test: AWARD.unbroken },
      { id: "eight-straight", name: "Eight Straight", note: "Eight correct actions in a row", test: AWARD.streak(8) },
    ],
  }),

  hazards: {
    "wsh-by-eye-dose": "You poured the chlorine stock straight into the tank by eye. A chlorine solution mis-mixed either way fails: under-dosed, the water leaves the tap looking treated and carrying whatever was in it; over-dosed, it tastes so strongly that people go back to the river. The dose comes from the jar test, measured.",
    "wsh-latrine-uphill": "You marked the new latrine uphill of the well. Whatever soaks down from a pit moves with the slope and the groundwater, and a latrine above a water source puts the camp's sanitation into its drinking water; the Sphere Handbook's excreta standards site latrines away from and downhill of water points for exactly that reason.",
    "wsh-open-bucket": "You filled an open bucket for drinking water. Treated water is only safe until something is dipped into it: open containers collect dust, flies and hands, and a household's drinking water is kept in a clean container with a lid and a narrow neck or tap so nobody has to reach in.",
    "wsh-early-tap": "You opened the taps before the contact time was up. Chlorine needs time in the water to work, and water drawn early has been dosed without being disinfected; the contact time is kept by the clock, however long the queue at the tap stand gets.",
  },

  lateNotes: {
    "wsh-tapstand-valve": "The tap stand opens once the residual has been read in band at the tap, not before.",
    "wsh-comparator": "Read the residual after the contact time — a reading taken while the chlorine is still working tells you nothing about what reaches people.",
  },

  steps: [
    {
      id: "wash-plan", kind: "select", target: "wsh-site-plan",
      title: "Read the camp's WASH plan",
      cue: "Read the plan: where the water points, latrines and hand-wash stations sit, today's jar-test dose, and which way the ground slopes.",
      why: "Everything at a water point is decided by where things are relative to each other — the slope, the well, the latrines, the tap stand — and by what the jar test said this morning. The plan puts all of it on one board, drawn up with the WASH cluster, so the day's decisions are made against the site as it is rather than memory.",
    },
    {
      id: "treatment-order", kind: "sequence",
      targets: ["wsh-step-settle", "wsh-step-filter", "wsh-step-chlorinate"],
      itemNames: { "wsh-step-settle": "settle", "wsh-step-filter": "filter", "wsh-step-chlorinate": "chlorinate" },
      title: "Treat the water in order",
      cue: "Settle, then filter, then chlorinate.",
      why: "Chlorine is used up by whatever is suspended in the water, so it works properly only on water that is already clear. Settling and filtering first take out the material that would otherwise swallow the dose, which is why chlorination is the last barrier and not the only one.",
      outOfOrderNote: "Settle, filter, then chlorinate — chlorine works on clear water, so it goes last.",
    },
    {
      id: "dose", kind: "gauge", target: "wsh-dosing-jug",
      title: "Measure the dose from the jar test",
      cue: "Fill the dosing jug and commit when the level sits on this morning's jar-test mark.",
      why: "The jar test finds the dose that leaves a residual in this water, today, after its demand is met, and that dose changes with the source and the season. Measuring to it — not to yesterday's figure and not by eye — is what makes the residual at the tap something you can predict rather than hope for.",
      gauge: { label: "DOSE", speed: 0.55, green: [0.48, 0.58], readout: (t) => (t < 0.48 ? "under the jar-test mark" : t > 0.58 ? "over the mark" : "on the jar-test mark"), missNote: "Not on the jar-test mark. Pour back or top up and commit where the jug reads on the mark." },
    },
    {
      id: "dosing-pump", kind: "track", target: "wsh-dosing-pump", seconds: 7,
      title: "Keep the dosing pump matched to the flow",
      cue: "Hold the dosing pump rate steady against the flow into the tank as it fills.",
      why: "A dose that is right in the jug is only right in the tank if it goes in at the same rate the water does. A pump that races or starves while the tank fills leaves layers of over- and under-treated water, and the tap stand draws from whichever layer is at the outlet.",
      track: { start: 0.2, green: [0.4, 0.62], rise: 0.55, fall: 0.45, drift: 0.12, label: "PUMP", readout: (v) => (v < 0.4 ? "starving" : v > 0.62 ? "flooding" : "matched to flow") },
      holdBreakNote: "The pump rate left the band. Part of the tank is being under- or over-dosed — bring it back to match the flow.",
    },
    {
      id: "contact-time", kind: "hold", target: "wsh-tank-lid", seconds: 5,
      title: "Keep the tank closed for the contact time",
      cue: "Hold the tank lid shut and the outlet closed until the contact-time timer runs out.",
      why: "The contact time is when the disinfection actually happens. Holding the tank closed until the timer runs out — whatever the queue is doing at the tap stand — is the difference between water that has been disinfected and water that has only had chlorine added to it.",
      holdBreakNote: "You opened up before the contact time ran out. Close the lid and let the timer finish.",
    },
    {
      id: "residual-read", kind: "select", target: "wsh-comparator",
      title: "Read the residual at the tap",
      cue: "Test a sample from the tap stand with the comparator and confirm it reads in the plan's band.",
      why: "A free chlorine residual at the point of delivery is what the Sphere Handbook uses as the proof that water is protected all the way to the container. It is read at the tap, not at the tank, because the tap is where people fill up, and the reading is logged so a falling residual shows up before a sick household does.",
    },
    {
      id: "open-tapstand", kind: "turn", target: "wsh-tapstand-valve",
      title: "Open the tap stand",
      cue: "Turn the tap stand's supply valve fully open now that the residual reads in band.",
      why: "Opening the tap stand is the last step because it is the one that cannot be undone: once water leaves, it is in people's containers. The valve opens only after the residual has been read, so the first jerrycan filled is the same water that was tested, not the water before it.",
      turn: { turns: 1, axis: "z", label: "TAP STAND" },
    },
    {
      id: "site-latrine", kind: "drag", target: "wsh-latrine-marker",
      title: "Site the new latrine",
      cue: "Carry the latrine stake to the marked plot downhill and away from the well.",
      why: "A new latrine block goes where the plan and the slope say it can do no harm to the water supply — downhill and at a distance from any water source — and where people, including women and girls at night, can reach it safely. Siting it for convenience in the one flat spot near the well is how a camp contaminates its own supply.",
      drag: { to: "wsh-latrine-socket", radius: 0.5, missNote: "Not on the downhill plot. The latrine goes below and away from the well, where the plan marks it." },
    },
    {
      id: "handwash-find", kind: "find", noHint: true,
      targets: ["wsh-latrine-no-hw", "wsh-hw-empty"],
      itemNames: { "wsh-latrine-no-hw": "latrine with no hand-wash point", "wsh-hw-empty": "empty hand-wash bucket" },
      itemNotes: {
        "wsh-latrine-no-hw": "The end cubicle has no hand-wash station at all — people leave it and go straight to the food queue.",
        "wsh-hw-empty": "The bucket by the middle cubicle is bone dry, its tap left open.",
      },
      title: "Find the missing hand-wash points",
      cue: "Walk the latrine block and pick out every place where people cannot wash their hands on the way out.",
      why: "Hand washing after the latrine is one of the simplest barriers in an outbreak, and it only happens where water and soap are in reach at the door. A missing station or an empty bucket is a barrier that exists on the plan and nowhere else, and the only way to find one is to walk the block.",
    },
    {
      id: "container-check", kind: "sequence", anyOrder: true,
      targets: ["wsh-jc-clean", "wsh-jc-lid", "wsh-jc-neck"],
      itemNames: { "wsh-jc-clean": "clean inside", "wsh-jc-lid": "lid on", "wsh-jc-neck": "narrow neck or tap" },
      title: "Check the household containers",
      cue: "At the tap stand, check a family's container is clean inside, has its lid, and has a narrow neck or tap — any order.",
      why: "Water that leaves the tap safe can be recontaminated in the container on the way home or in the house overnight. A clean container with a lid and a narrow neck keeps hands and cups out of it, and checking a few at the tap stand is how the team learns which households need a replacement container.",
    },
    {
      id: "hygiene-talk", kind: "select", target: "wsh-promoter",
      title: "Brief the hygiene promoter's session",
      cue: "Agree today's session with the hygiene promoter: hand washing, safe water storage, and time for people's questions.",
      why: "Hygiene promotion works when it listens — to why people are not using a latrine, or what they have heard about the water — and answers with practical help. A session planned with time for questions is how the team finds out that a basin is broken or a rumour is going round before either becomes a problem.",
    },
    {
      id: "crew-checkin", kind: "select", target: "wsh-crew-board",
      title: "Check in with the WASH team",
      cue: "At the end of the round, check in with the team on the heat and the day, and point anyone who needs it to staff care.",
      why: "WASH crews work long days in the sun, on their feet, carrying chlorine and emptying pits, while the camp around them is frightened. Checking in with each other at the end of the round, and naming staff care out loud, keeps the crew on the rota and noticing the small things the job depends on.",
    },
    {
      id: "closing-log", kind: "hold", target: "wsh-wash-log", seconds: 4,
      title: "Close the water point log",
      cue: "Hold the log open and read back the dose, the contact time, the residual at the tap and the latrine faults before you sign.",
      why: "The water point log is the record that shows the water was treated and tested every day, and it is where a slow fall in the residual or a pattern of broken basins becomes visible. Read back before it is signed, it is evidence; signed unread, it is a routine.",
      holdBreakNote: "You signed without reading it back. Open the log and read the dose, residual and faults out first.",
    },
  ],

  interrupts: [
    {
      id: "bypass-drinking",
      kind: "Untreated bypass",
      after: "dosing-pump", delay: 3, seconds: 14,
      alert: "A child is filling a jerrycan from the bypass pipe that runs straight from the river to the tank — untreated water.",
      cue: "Close the bypass valve and send the child to the tap stand.",
      target: "wsh-bypass-valve",
      why: "A bypass that delivers untreated water beside a treated supply defeats every barrier upstream of it, and people use whichever pipe runs first. Closing it the moment it is seen is what keeps the camp drinking the water the team has just treated.",
      missNote: "The bypass stayed open. By the afternoon several households were filling from it because there was no queue, and the treated tank stood half full while untreated river water went home in their containers.",
      wrongNote: "That will not stop it. Close the bypass valve on the river pipe.",
    },
    {
      id: "latrine-overflow",
      kind: "Latrine overflow",
      after: "contact-time", delay: 2, seconds: 14,
      alert: "A pit latrine in the old block has started overflowing, and the run-off is trickling toward the tap stand's apron.",
      cue: "Close off the overflowing latrine and call for it to be emptied.",
      target: "wsh-latrine-closure",
      why: "An overflowing pit is excreta on the surface, heading downhill toward people and water. Closing it off, diverting users to a working latrine and calling the desludging crew stops the spread at the source; hosing it away only moves it somewhere else.",
      missNote: "Nobody closed the latrine. The overflow reached the tap stand apron by evening, and children were playing in it while their mothers filled containers.",
      wrongNote: "Not that. Close off the overflowing latrine with the barrier tape and call for emptying.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.4, WSH_ACCENT);

    // ---------------------------------------------------------- ground
    const ground = box(g, 6.2, 0.06, 5.8, 0, 0.03, 0, 0xffffff, { rough: 0.95 });
    ground.material = texturedMat(
      surfaceTexture((cx, w, h) => mudflatFace(cx, w, h, { base: "#8c7a5c", base2: "#7a6a50", cracks: 55 }), { repeat: 3, px: 512 }),
      { rough: 0.95, metal: 0, color: 0xdccdb0 },
    );
    // Slope arrow painted on the ground: uphill at the back, downhill to the front right.
    const slope = group(g, 0.2, 0.065, 0.3, -0.6);
    box(slope, 0.08, 0.004, 1.0, 0, 0, 0, 0xf2f2ee, { rough: 0.5, cast: false });
    box(slope, 0.26, 0.004, 0.08, 0, 0, 0.5, 0xf2f2ee, { rough: 0.5, cast: false });
    holoTag(slope, "Downhill", 0, 0.12, 0.6, { css: "#4f9fd0", w: 0.2 });

    // Board.
    const plan = wshBoard(g, 0.9, 0.62, -2.3, 1.5, -1.2, "WASH PLAN — CAMP ZONE 3", [
      "Water point: settle → filter → chlorinate", "Dose: jar-test mark, measured", "Contact time: by the tank timer",
      "Residual at tap: in the plan's band", "Latrines: downhill of the well, basin at each",
    ], { ry: Math.PI / 3 });
    reg(hits, plan, "wsh-site-plan");

    // ---------------------------------------------------------- treatment line (uphill, back)
    const line = group(g, -0.6, 0, -2.1);
    const barrels = [["wsh-step-settle", -0.9, "SETTLE"], ["wsh-step-filter", 0, "FILTER"], ["wsh-step-chlorinate", 0.9, "CHLORINATE"]];
    for (const [id, x, label] of barrels) {
      const b = group(line, x, 0, 0);
      cyl(b, 0.32, 0.32, 0.9, 0, 0.45, 0, 0x3a7ab8, { rough: 0.5, seg: 18 });
      cyl(b, 0.33, 0.33, 0.04, 0, 0.92, 0, 0x2a5a8a, { rough: 0.5, seg: 18 });
      decal(b, 0.4, 0.12, 0, 0.6, 0.33, signFace(label, { bg: "#0d1c24", accent: "#4f9fd0", scale: 0.42 }), { px: 160 });
      reg(hits, b, id);
    }
    hose(g, [[-1.5, 0.8, -2.1], [-1.2, 0.95, -2.1], [-0.9, 0.95, -2.1], [-0.6, 0.8, -2.1]], 0.03, 0x2b3236, { steps: 12 });
    hose(g, [[-0.6, 0.8, -2.1], [-0.3, 0.95, -2.1], [0.0, 0.95, -2.1], [0.3, 0.8, -2.1]], 0.03, 0x2b3236, { steps: 12 });
    // Elevated storage tank with lid and timer.
    const tank = group(g, 1.4, 0, -1.9);
    for (const [px, pz] of [[-0.4, -0.4], [0.4, -0.4], [-0.4, 0.4], [0.4, 0.4]]) box(tank, 0.08, 1.0, 0.08, px, 0.5, pz, 0x8a8f94, { rough: 0.5, metal: 0.5 });
    cyl(tank, 0.55, 0.55, 0.9, 0, 1.45, 0, 0x2a2e33, { rough: 0.6, seg: 20 });
    const lid = cyl(tank, 0.2, 0.2, 0.05, 0, 1.93, 0, 0x4f9fd0, { rough: 0.5, seg: 14 });
    holoTag(tank, "Tank lid", 0, 2.1, 0, { css: "#4f9fd0", w: 0.2 });
    reg(hits, lid, "wsh-tank-lid");
    const timer = instrument(tank, 0, 1.2, 0.56, { idle: "CONTACT", color: WSH_ACCENT, w: 0.16, d: 0.22 });
    timer.rotation.x = Math.PI / 2;
    const early = box(tank, 0.14, 0.14, 0.14, 0.3, 0.9, 0.56, WSH_ALERT, { rough: 0.5 });
    holoTag(tank, "Open outlet now?", 0.3, 1.05, 0.6, { css: "#f0645b", w: 0.3 });
    reg(hits, early, "wsh-early-tap");
    // Dosing jug and pump beside the chlorination barrel.
    const dosing = group(g, 0.6, 0, -1.3);
    box(dosing, 0.6, 0.7, 0.4, 0, 0.35, 0, 0x6a7a8a, { rough: 0.6 });
    const jug = group(dosing, -0.15, 0.7, 0);
    cyl(jug, 0.06, 0.07, 0.18, 0, 0.09, 0, 0xe8eef2, { rough: 0.2, opacity: 0.7, transparent: true, seg: 12 });
    const jugFill = cyl(jug, 0.055, 0.065, 0.02, 0, 0.02, 0, 0xd8e8a0, { rough: 0.2, seg: 12 });
    holoTag(jug, "Dosing jug", 0, 0.3, 0, { css: "#4f9fd0", w: 0.22 });
    reg(hits, jug, "wsh-dosing-jug");
    const pump = instrument(dosing, 0.15, 0.72, 0, { idle: "PUMP", color: WSH_ACCENT, w: 0.14, d: 0.2 });
    holoTag(pump, "Dosing pump", 0, 0.14, 0, { css: "#4f9fd0", w: 0.24 });
    reg(hits, pump, "wsh-dosing-pump");
    const stock = group(g, 1.05, 0, -1.0);
    box(stock, 0.2, 0.3, 0.14, 0, 0.15, 0, 0xf2f2ee, { rough: 0.5 });
    holoTag(stock, "Pour it in by eye?", 0, 0.45, 0, { css: "#f0645b", w: 0.32 });
    reg(hits, stock, "wsh-by-eye-dose");
    // River bypass pipe and valve at the side.
    const bypass = group(g, -2.6, 0, -0.2);
    cyl(bypass, 0.05, 0.05, 1.6, 0, 0.6, 0, 0x6a4a2a, { rough: 0.6, seg: 10 }).rotation.x = Math.PI / 2;
    const bypassValve = valveWheel(bypass, 0, 0.8, 0.3, { color: 0xf0645b, body: 0x6a2a2a, r: 0.08 });
    holoTag(bypass, "River bypass", 0, 1.1, 0.3, { css: "#4f9fd0", w: 0.24 });
    reg(hits, bypassValve, "wsh-bypass-valve");
    const bypassStream = box(bypass, 0.03, 0.5, 0.03, 0, 0.3, 0.8, 0x8a7a5a, { rough: 0.2, opacity: 0.7, transparent: true, cast: false });
    bypassStream.visible = false;
    const bypassChild = standingFigure(g, -2.3, 0.8, { ry: 2.6, cloth: 0x6b8f6a, atStation: true });
    bypassChild.scale.set(0.6, 0.6, 0.6);
    bypassChild.visible = false;

    // ---------------------------------------------------------- tap stand (middle)
    const tap = group(g, 0.9, 0, 0.6);
    box(tap, 1.3, 0.08, 0.9, 0, 0.04, 0, 0xb8b4a8, { rough: 0.9 });
    box(tap, 1.0, 0.7, 0.12, 0, 0.43, -0.3, 0x9aa4ad, { rough: 0.6 });
    for (let i = 0; i < 3; i++) cyl(tap, 0.02, 0.02, 0.12, -0.35 + i * 0.35, 0.65, -0.2, CITY.steel, { rough: 0.3, metal: 0.8, seg: 8 }).rotation.x = Math.PI / 2;
    const tapValve = valveWheel(tap, 0.6, 0.6, -0.3, { color: 0x4f9fd0, body: 0x2a4a6a, r: 0.08 });
    holoTag(tap, "Tap stand", 0, 1.0, -0.3, { css: "#4f9fd0", w: 0.22 });
    reg(hits, tapValve, "wsh-tapstand-valve");
    const flows = [];
    for (let i = 0; i < 3; i++) { const f = box(tap, 0.02, 0.4, 0.02, -0.35 + i * 0.35, 0.42, -0.12, 0x9fd0f0, { rough: 0.1, opacity: 0.7, transparent: true, cast: false }); f.visible = false; flows.push(f); }
    const comparator = group(g, 1.75, 0.8, 0.25);
    box(comparator, 0.14, 0.2, 0.06, 0, 0, 0, 0xe8eef2, { rough: 0.4 });
    cyl(comparator, 0.012, 0.012, 0.14, -0.03, 0.02, 0.04, 0xf8e8a0, { rough: 0.1, opacity: 0.8, transparent: true, seg: 8 });
    cyl(comparator, 0.012, 0.012, 0.8, 0, -0.4, 0, CITY.steel, { rough: 0.4, metal: 0.6, seg: 6 });
    holoTag(comparator, "Residual comparator", 0, 0.2, 0, { css: "#4f9fd0", w: 0.32 });
    reg(hits, comparator, "wsh-comparator");
    const overflow = box(g, 0.9, 0.006, 0.5, 1.2, 0.066, 1.35, 0x6a5a3a, { rough: 0.2, opacity: 0.8, transparent: true, cast: false });
    overflow.visible = false;
    // Containers at the tap stand.
    const jc = group(g, 0.5, 0.08, 0.85);
    box(jc, 0.2, 0.3, 0.12, 0, 0.15, 0, 0xf2c14b, { rough: 0.6 });
    const jcCap = cyl(jc, 0.025, 0.025, 0.04, 0.05, 0.32, 0, 0x2a4a9a, { rough: 0.5, seg: 8 });
    const jcTargets = [["wsh-jc-clean", -0.12, "CLEAN"], ["wsh-jc-lid", 0.12, "LID"], ["wsh-jc-neck", 0, "NECK"]];
    for (const [id, dx, label] of jcTargets) {
      const t = decal(jc, 0.1, 0.05, dx, id === "wsh-jc-neck" ? 0.42 : 0.2, 0.065, signFace(label, { bg: "#141414", accent: "#4f9fd0", scale: 0.42 }), { px: 96 });
      reg(hits, t, id);
    }
    void jcCap;
    const bucket = group(g, 1.3, 0.08, 1.0);
    cyl(bucket, 0.14, 0.11, 0.26, 0, 0.13, 0, 0x3a7ab8, { rough: 0.5, seg: 12 });
    holoTag(bucket, "Fill this open bucket?", 0, 0.4, 0, { css: "#f0645b", w: 0.36 });
    reg(hits, bucket, "wsh-open-bucket");
    for (let i = 0; i < 4; i++) box(g, 0.2, 0.3, 0.12, -0.2 + i * 0.26, 0.23, 1.2, [0xf2c14b, 0x3a9a5a, 0xf2c14b, 0xe8eef2][i], { rough: 0.6 });

    // ---------------------------------------------------------- latrines (downhill, front right)
    const block = group(g, 2.3, 0, 1.9, -0.4);
    for (let i = 0; i < 3; i++) {
      box(block, 0.7, 1.9, 0.05, -0.75 + i * 0.75, 0.95, -0.35, 0x8a9a7a, { rough: 0.8 });
      box(block, 0.05, 1.9, 0.7, -1.1 + i * 0.75, 0.95, 0, 0x8a9a7a, { rough: 0.8 });
      box(block, 0.6, 1.7, 0.03, -0.75 + i * 0.75, 0.85, 0.35, 0x5a7a5a, { rough: 0.7 });
    }
    box(block, 2.4, 0.06, 0.9, -0.75, 1.95, 0, 0x8a8f94, { rough: 0.5, metal: 0.4 });
    const noHw = box(block, 0.3, 0.3, 0.3, 0.0, 0.8, 0.55, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, noHw, "wsh-latrine-no-hw");
    const hwEmpty = group(block, -0.75, 0, 0.6);
    cyl(hwEmpty, 0.13, 0.11, 0.3, 0, 0.75, 0, 0x3a7ab8, { rough: 0.5, seg: 12 });
    box(hwEmpty, 0.3, 0.6, 0.3, 0, 0.3, 0, 0x6a7a8a, { rough: 0.6 });
    reg(hits, hwEmpty, "wsh-hw-empty");
    const hwOk = group(block, -1.5, 0, 0.6);
    cyl(hwOk, 0.13, 0.11, 0.3, 0, 0.75, 0, 0x3a7ab8, { rough: 0.5, seg: 12 });
    box(hwOk, 0.3, 0.6, 0.3, 0, 0.3, 0, 0x6a7a8a, { rough: 0.6 });
    // Old block with the overflow, and its closure tape.
    const oldBlock = group(g, -1.2, 0, 2.3);
    box(oldBlock, 0.8, 1.8, 0.8, 0, 0.9, 0, 0x7a6a5a, { rough: 0.9 });
    box(oldBlock, 0.6, 1.6, 0.03, 0, 0.8, 0.41, 0x5a4a3a, { rough: 0.8 });
    const closure = group(g, -1.2, 0, 1.7);
    for (const cx of [-0.45, 0.45]) cone(closure, cx, 0, { color: 0xf2c14b });
    const closeTape = box(closure, 0.9, 0.05, 0.02, 0, 0.5, 0, 0xf2c14b, { emissive: 0xf2c14b, ei: 0.4, rough: 0.5 });
    holoTag(closure, "Barrier tape", 0, 0.75, 0, { css: "#4f9fd0", w: 0.24 });
    reg(hits, closeTape, "wsh-latrine-closure");
    const oldOverflow = box(g, 0.8, 0.006, 0.6, -1.2, 0.066, 1.65, 0x6a5a3a, { rough: 0.2, opacity: 0.8, transparent: true, cast: false });
    oldOverflow.visible = false;
    // The latrine stake and the two plots.
    const stake = group(g, -0.4, 0, -0.5);
    cyl(stake, 0.02, 0.02, 0.8, 0, 0.4, 0, 0xe0a84a, { rough: 0.6, seg: 6 });
    box(stake, 0.2, 0.12, 0.01, 0.1, 0.72, 0, 0xe0a84a, { rough: 0.6 });
    holoTag(stake, "Latrine stake", 0, 0.95, 0, { css: "#4f9fd0", w: 0.24 });
    reg(hits, stake, "wsh-latrine-marker");
    const plotDown = box(g, 0.7, 0.01, 0.7, 1.9, 0.066, -0.3, 0x59c97b, { rough: 0.6, opacity: 0.4, transparent: true, cast: false });
    holoTag(g, "Plot B — downhill", 1.9, 0.3, -0.3, { css: "#59c97b", w: 0.3 });
    hits["wsh-latrine-socket"] = plotDown;
    const plotUp = box(g, 0.7, 0.01, 0.7, -1.9, 0.066, -2.2, 0xf0645b, { rough: 0.6, opacity: 0.4, transparent: true, cast: false });
    holoTag(g, "Plot A — by the well?", -1.9, 0.3, -2.2, { css: "#f0645b", w: 0.36 });
    reg(hits, plotUp, "wsh-latrine-uphill");
    const well = group(g, -2.4, 0, -1.9);
    cyl(well, 0.35, 0.35, 0.6, 0, 0.3, 0, 0x8a8a7a, { rough: 0.9, seg: 16 });
    cyl(well, 0.02, 0.02, 1.0, -0.3, 0.9, 0, 0x6a4a2a, { rough: 0.8, seg: 6 });
    cyl(well, 0.02, 0.02, 1.0, 0.3, 0.9, 0, 0x6a4a2a, { rough: 0.8, seg: 6 });

    // ---------------------------------------------------------- people and boards
    const promoter = standingFigure(g, -0.25, 2.15, { ry: Math.PI - 0.4, cloth: 0x2f6a8a, vest: WSH_ACCENT });
    holoTag(promoter, "Hygiene promoter", 0, 1.95, 0, { css: "#4f9fd0", w: 0.3 });
    reg(hits, promoter, "wsh-promoter");
    standingFigure(g, 0.3, 1.55, { ry: Math.PI + 0.3, cloth: 0x8a4a6a, atStation: true });
    const crewBoard = wshBoard(g, 0.6, 0.4, -2.4, 1.4, 0.9, "WASH TEAM CHECK-IN", ["Heat, water, rest", "Staff care is there to use", "Who needs a break?"], { ry: Math.PI / 2.3, accent: 0x7fd1c9, css: "#7fd1c9" });
    reg(hits, crewBoard, "wsh-crew-board");
    const log = wshBoard(g, 0.55, 0.4, 2.5, 1.5, -1.0, "WATER POINT LOG", ["Dose · contact time", "Residual at tap", "Latrine faults"], { ry: -Math.PI / 3 });
    reg(hits, log, "wsh-wash-log");
    for (const [x, z] of [[-2.8, 2.6], [2.9, -2.6]]) {
      const tent = group(g, x, 0, z);
      const a = box(tent, 1.2, 0.03, 0.9, 0, 0.7, -0.3, 0xe8e0c8, { rough: 0.8 }); a.rotation.x = 0.8;
      const b2 = box(tent, 1.2, 0.03, 0.9, 0, 0.7, 0.3, 0xe8e0c8, { rough: 0.8 }); b2.rotation.x = -0.8;
    }
    const splash = particles(g, 30, 0x9fd0f0, { size: 0.02, life: 0.4, additive: false, opacity: 0.6 });

    return {
      hits,
      footprint: 2.4,
      spawnLook: new THREE.Vector3(0.2, 0.9, -1.2),

      onStepComplete(step) {
        if (step.id === "dose") jugFill.scale.set(1, 6, 1);
        if (step.id === "contact-time") repaint(timer.userData.screen, signFace("TIME UP", { bg: "#0d1c24", accent: "#59c97b", fg: "#eafcf9", scale: 0.55 }));
        if (step.id === "residual-read") repaint(log.userData.face, paperFace("WATER POINT LOG", ["Dose: jar-test mark", "Contact time: kept", "Residual at tap: in band"], { band: "#2a5a8a" }));
        if (step.id === "open-tapstand") for (const f of flows) f.visible = true;
        if (step.id === "site-latrine") { stake.position.set(1.9, 0, -0.3); }
        if (step.id === "closing-log") repaint(log.userData.face, (cx, w, h) => {
          cx.fillStyle = "rgba(6,14,24,0.92)"; cx.fillRect(0, 0, w, h); cx.fillStyle = "#59c97b"; cx.fillRect(0, 0, w, 6);
          cx.fillStyle = "#eafcf1"; cx.font = `600 ${Math.round(h * 0.16)}px 'Barlow Condensed', Arial, sans-serif`;
          cx.textAlign = "center"; cx.textBaseline = "middle"; cx.fillText("LOG SIGNED", w / 2, h / 2);
        });
      },

      onInterrupt(it) {
        if (it.id === "bypass-drinking") { bypassStream.visible = true; bypassChild.visible = true; }
        if (it.id === "latrine-overflow") { oldOverflow.visible = true; overflow.visible = true; }
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "bypass-drinking") { bypassStream.visible = false; bypassChild.position.set(0.1, 0, 1.3); }
        if (it.id === "latrine-overflow") { overflow.visible = false; closeTape.material = mat(WSH_ALERT, { emissive: WSH_ALERT, ei: 0.6, rough: 0.5 }); }
      },

      onHazard() {},

      animate(t, dt, session) {
        void t;
        const step = session?.step;
        if (session?.turn && step?.id === "open-tapstand") tapValve.rotation.z = session.turn.amount * Math.PI * 2;
        const gg = session?.gauge;
        if (gg && !gg.committed && step?.id === "dose") jugFill.scale.set(1, 1 + gg.t * 7, 1);
        const tr = session?.track;
        if (tr && step?.id === "dosing-pump") {
          const ok = tr.v >= 0.4 && tr.v <= 0.62;
          repaint(pump.userData.screen, signFace(ok ? "MATCHED" : tr.v < 0.4 ? "STARVING" : "FLOODING", { bg: "#0d1c24", accent: ok ? "#59c97b" : "#f2c14b", fg: "#eafcf9", scale: 0.5 }));
        }
        if (flows[0].visible) { splash.visible = true; splash.userData.step(dt, new THREE.Vector3(0.9, 0.2, 0.5), 0.4, 0.4, -2); }
        else if (splash.visible) splash.visible = false;
      },
    };
  },
};
