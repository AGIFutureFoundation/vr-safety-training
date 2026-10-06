import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import { box, cyl, group, decal, repaint, signFace, paperFace, mat, hose } from "../../../shared/kit.js";
import {
  stationPad, holoPanel, holoTag, standingFigure, cone, reg, surfaceTexture, texturedMat, pavingFace,
} from "../citykit.js";
import { fourGasMeter, radio } from "../../../shared/toolkit.js";
import { generatorTrailer } from "../../../shared/equipment.js";
import { cargoVan } from "../../../shared/fleet.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Ventilation & Air Monitoring Plan VR — Water &
// Environmental, the confined-space block.
//
// The dry well of a generic sewage pump station: a deep, square, below-grade
// room of pumps and valves reached through a hatch, where the air goes bad by
// sitting still. The station is the ventilation plan and the monitoring that
// proves it is working: where the blower and the generator go, how the duct
// is run so the air sweeps the dead corners instead of short-circuiting back
// out of the hatch, the purge run for the time the permit sets, the four-gas
// readings taken level by level, and the monitoring kept up for as long as
// someone is down there — because the plan is only true while the blower
// runs. A LIUNA or IUOE crew, a UA fitter on the pumps. No purge time,
// air-change figure or alarm setpoint is written here: those numbers live on
// the permit, and the station sends the learner to it.

const CVA_ACCENT = 0x62c2a8;
const CVA_CSS = "#62c2a8";
const CVA_WARN = "#e0664f";
const CVA_PAD = 0.3;          // the yard is a raised pad so the dry well can be a real shaft

export const SIM_CS_VENTILATION_AND_AIR_MONITORING_PLAN = {
  id: "cs-ventilation-and-air-monitoring-plan",
  index: "322",
  domain: "Water & Environmental",
  trade: "Confined-space entry crew — LIUNA or IUOE pump station crew, gas tester and blower operator, with a UA fitter entering",
  category: "Water & Environmental",
  weather: "wind",
  certification: "OSHA 29 CFR 1910.146 permit-required confined spaces — forced-air ventilation, pre-entry testing and continuous or periodic monitoring against the permit's acceptable conditions; OSHA 29 CFR 1926 Subpart AA where the entry is construction work, with its emphasis on continuous monitoring; ANSI Z117.1 ventilation and testing practice; NIOSH confined-space criteria on stratified atmospheres and short-circuited ventilation; LIUNA, IUOE and UA confined-space training",
  name: "Ventilation & Air Monitoring Plan",
  title: simTitle("Ventilation & Air Monitoring Plan"),
  tagline: "A pump station dry well ventilated to a plan: the dead corners found, the blower set upwind with its intake in clean air, the duct run to the bottom far corner, the purge run for the time the permit sets while the wind swings an exhaust plume over the intake, four-gas readings top, middle and bottom, the alarms matched to the permit, monitoring kept up until the blower dies, the duct walked, and the shutdown done in order",
  accent: CVA_ACCENT,
  accentCss: CVA_CSS,
  parSeconds: 280,
  footprint: 2.6,
  badge: { id: "air-to-the-corners", name: "Air to the Corners", note: "The dry well ventilated to its plan, read at every level, watched the whole entry, and emptied the moment the blower stopped" },

  supportLine: "your LIUNA, IUOE or UA local's member assistance programme, or the employee assistance line on the back of the entry permit",

  game: system({
    name: "Dry Well Air",
    currency: "PURGES",
    ranks: ["Blower Hand", "Gas Tester", "Ventilation Lead", "Entry Supervisor", "Confined Space Air Qualified"],
    badges: [
      { id: "clean-intake", name: "Clean Intake", note: "No generator at the intake, no duct left at the collar, no entry before the purge, no monitor left topside", test: AWARD.safe },
      { id: "every-level", name: "Every Level", note: "Top, middle and bottom read in order, first time", test: AWARD.stepClean("level-readings") },
      { id: "clean-plan", name: "Clean Plan", note: "No corrections from the plan to the log", test: AWARD.clean },
    ],
    challenges: [
      { id: "steady-watch", name: "Steady Watch", note: "The monitoring held in band the whole entry", test: AWARD.unbroken },
      { id: "worst-reading", name: "Worst Reading", note: "The bottom reading committed inside the band first time", test: AWARD.precise(0.7) },
      { id: "pumps-back", name: "Pumps Back", note: "Plan to log inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "generator-at-intake": "You started the blower with the generator parked beside it, exhaust toward the intake. A blower delivers whatever is at its intake to the bottom of the dry well, and generator exhaust is carbon monoxide: parked there, the ventilation meant to keep the space safe fills it with a gas nobody can see or smell. The generator goes downwind and well away, exhaust pointed off.",
    "duct-at-collar": "You left the supply duct hanging just inside the hatch. Air pushed in at the top of a deep room comes straight back out of the same opening, and the heavy gases and stale air at the bottom — where the pumps are and where the fitter will kneel — never move. The duct goes to the bottom, to the far corner from the hatch, so the air sweeps the whole room on its way out.",
    "enter-before-purge": "You were about to send the fitter down with the purge only partly run. The permit sets how long the blower runs before entry for this space and this blower because that is what it takes to change the air in it; cut short, the readings at the hatch look fine while the bottom is still what it was overnight.",
    "monitor-topside": "You left the four-gas monitor on the hatch coaming. A monitor at the top reads the air coming out of the hatch, not the air the entrant breathes at the bottom. It goes down with the entrant, clipped in the breathing zone, so its alarm is about the air in their lungs.",
  },

  lateNotes: {
    "sample-bottom": "The levels are read after the purge has run for the time on the permit, not while the space is still being purged.",
    "vent-log": "The log is written at the end, once the entrant is out and the blower off, with the failure and the readings on it.",
    "blower-off": "The blower stays on until the entrant is out of the dry well — it comes off last, not first.",
  },

  steps: [
    {
      id: "vent-plan", kind: "select", target: "vent-plan",
      title: "Read the ventilation plan on the permit",
      cue: "Read the permit's ventilation and monitoring plan: supply air ducted to the bottom, the purge time before entry, continuous monitoring during entry, and the alarm setpoints — each as the permit sets them.",
      why: "Forced-air ventilation is only a control if it is planned: which way the air moves, where it enters and leaves, how long it runs before anyone goes in, and how the crew will know it is still working. 29 CFR 1910.146 has the employer write the conditions that make entry acceptable, and the ventilation plan and its numbers are part of them. The crew reads the plan rather than inventing one at the hatch.",
    },
    {
      id: "dead-corners", kind: "find", noHint: true,
      targets: ["sump-pit", "valve-gallery", "pipe-chase"],
      itemNames: { "sump-pit": "the sump pit below the floor", "valve-gallery": "the valve gallery behind the pumps", "pipe-chase": "the pipe chase up the far wall" },
      itemNotes: {
        "sump-pit": "The sump is a pit below the dry well floor where heavy gases pool and air barely reaches. The duct's end goes near it, and it is read on its own.",
        "valve-gallery": "The valve gallery behind the pumps is a pocket the air will skip if the duct ends by the ladder. The duct runs past the pumps to it.",
        "pipe-chase": "The pipe chase is a narrow vertical void up the far wall. Stale air hangs in it; it is a place the monitor goes, not somewhere the flow can be assumed.",
      },
      title: "Find the dead corners the air will skip",
      cue: "Three places in this dry well will hold stale air whatever the blower does unless the duct is run for them. Find them.",
      why: "Air takes the shortest path from where it goes in to where it comes out, and a deep room full of pumps has pockets the flow never reaches: a sump, a gallery behind machinery, a pipe chase. NIOSH's work on confined-space ventilation is largely about exactly this — short-circuiting and dead zones — and the plan only works if the duct is placed to sweep them.",
    },
    {
      id: "blower-place", kind: "drag", target: "blower",
      title: "Set the blower upwind of the hatch",
      cue: "Carry the electric blower to its mark upwind of the hatch, clear of the road and well away from the generator.",
      why: "The blower is only as clean as the air at its intake. Upwind of the hatch, it draws the air the wind is bringing rather than the air leaving the dry well or passing traffic's exhaust; away from the generator, it never sees carbon monoxide. Where it stands is most of whether the ventilation makes the space better or worse.",
      drag: { to: "blower-mark", radius: 0.55, missNote: "Not on the upwind mark — set the blower on the painted mark upwind of the hatch, clear of the generator's exhaust side." },
    },
    {
      id: "intake-turn", kind: "turn", target: "blower-intake",
      title: "Turn the intake into clean air",
      cue: "Turn the blower so its intake faces into the wind, away from the hatch, the road and the generator.",
      why: "A blower upwind with its intake facing back toward the hatch can still pull the dry well's own discharge around into it. The intake faces the clean air — into the wind, away from anything that exhausts — so what goes down the duct is what everyone on the surface is breathing. It is a small turn and it is the difference between ventilating and recirculating.",
      turn: { turns: 0.5, axis: "y", label: "BLOWER INTAKE", readout: (t) => (t < 0.25 ? "facing the hatch" : t < 0.45 ? "facing the road" : "into the wind") },
    },
    {
      id: "duct-run", kind: "sequence",
      targets: ["duct-coupling", "duct-no-kinks", "duct-bottom"],
      itemNames: { "duct-coupling": "duct clamped on the blower outlet", "duct-no-kinks": "duct run straight over the coaming, no kinks", "duct-bottom": "duct end at the bottom far corner by the sump" },
      title: "Run the duct: coupled, kink-free, to the bottom far corner",
      cue: "Clamp the duct to the blower outlet, run it over the coaming without a kink, and lower its end to the bottom far corner by the sump.",
      why: "A loose coupling blows half the air onto the pad, a kink at the coaming throttles the rest, and a duct end left near the ladder short-circuits what is left straight back out of the hatch. Coupled, straight and at the bottom far corner, the air travels the length of the room, pushing the stale air ahead of it past the pumps and out at the top, which is the flow the plan was drawn for.",
      outOfOrderNote: "Coupling, then the run, then the end at the bottom — a duct lowered before it is clamped just pours the blower's air onto the pad.",
    },
    {
      id: "purge", kind: "hold", target: "purge-timer", seconds: 6,
      title: "Run the purge for the time the permit sets",
      cue: "Start the blower and hold on the purge timer until it reaches the purge time written on the permit — nobody goes down before it does.",
      why: "The purge time on the permit is what it takes this blower to change the air in this space enough times to clear what built up while it was sealed. The readings that decide entry are taken after it, with the blower still running. Cutting it short is the most common way a space that read clean at the hatch still kills someone at the bottom.",
      holdBreakNote: "You broke off the purge before the permit's time. The bottom of the dry well has not been changed yet — go back and let it run the full time.",
    },
    {
      id: "level-readings", kind: "sequence",
      targets: ["sample-top", "sample-middle", "sample-bottom"],
      itemNames: { "sample-top": "reading at the top", "sample-middle": "reading at mid-depth", "sample-bottom": "reading at the bottom by the sump" },
      title: "Four-gas readings top, middle and bottom",
      cue: "Lower the sample line and let the pump draw at the top, then mid-depth, then the bottom by the sump — oxygen, flammables, then toxics at each.",
      why: "The air in a deep room layers: lighter gases high, heavier ones and oxygen-poor air low, so one reading at the hatch describes the hatch. Reading down the shaft level by level, waiting at each for the pump to draw the sample up the line, is the practice ANSI Z117.1 and NIOSH teach — and the entry decision is made on the worst of them, which is usually the last.",
      outOfOrderNote: "Top, middle, bottom — read on the way down so the line is never dragged back up through a layer it has not sampled.",
    },
    {
      id: "bottom-reading", kind: "gauge", target: "bottom-display",
      title: "Commit the bottom reading against the permit",
      cue: "Watch the bottom reading settle and commit only when every gas is inside the acceptable conditions written on the permit.",
      why: "The acceptable conditions on the permit are the line, and the bottom reading is the one that has to be inside it, because that is where the fitter will kneel at the pump. A reading still climbing or falling is not a reading yet. If it will not settle inside the permit's limits after the purge, the answer is more ventilation and another reading, not a more generous interpretation of the numbers.",
      gauge: { label: "BOTTOM vs PERMIT", speed: 0.7, green: [0.46, 0.62], readout: (t) => (t < 0.46 ? "O₂ below permit" : t > 0.62 ? "still settling" : "inside permit limits"), missNote: "Not inside the permit's limits — keep the blower running, let the reading settle and read the bottom again before anyone goes down." },
    },
    {
      id: "alarm-setpoints", kind: "select", target: "alarm-card",
      title: "Match the monitor's alarm setpoints to the permit",
      cue: "Check the monitor's alarm settings for each gas against the setpoints the permit lists before it goes down with the fitter.",
      why: "The monitor that goes down with the entrant is the continuous half of the plan, and it only protects them if it alarms at the numbers the permit sets. A monitor last configured for a different job alarms too late or so often that people start ignoring it. Checking its setpoints against the permit takes seconds and is the only way to know what its alarm actually means today.",
    },
    {
      id: "monitor", kind: "track", target: "entrant-monitor", seconds: 7,
      title: "Keep monitoring while the fitter works",
      cue: "The fitter is at the pump with the monitor clipped in the breathing zone; keep watching the readings and the blower as the work goes on.",
      why: "A dry well changes while people work in it: a seal opened on a pump releases gas, a wet well level rises behind the wall, a blower slows. Continuous monitoring, which the construction rule in 29 CFR 1926 Subpart AA leans on especially hard, is what turns the plan from a snapshot at entry into a watch, and it only works if somebody on top is actually watching.",
      track: { start: 0.12, green: [0.4, 0.62], rise: 0.55, fall: 0.45, drift: 0.12, label: "MONITOR", readout: (v) => (v < 0.4 ? "not watching the readings" : v > 0.62 ? "fixed on one gas" : "readings and blower watched") },
      holdBreakNote: "The watch slipped — either the readings were not being looked at, or only one gas was. Bring it back to all four gases and the blower.",
    },
    {
      id: "duct-walk", kind: "find", noHint: true,
      targets: ["duct-crushed", "duct-pulled-up", "coupling-leak"],
      itemNames: { "duct-crushed": "the duct crushed under a cart wheel", "duct-pulled-up": "the duct end pulled up off the bottom", "coupling-leak": "air leaking at the blower coupling" },
      itemNotes: {
        "duct-crushed": "A parts cart has been parked on the duct where it crosses the pad. Crushed, it passes a fraction of the air the plan assumed.",
        "duct-pulled-up": "Somebody has pulled the duct end up to get it out of the way of the pump work — it now ends halfway up the shaft, short-circuiting.",
        "coupling-leak": "The clamp at the blower outlet has slipped and air is blowing out onto the pad. The blower is running; the dry well is not getting it.",
      },
      title: "Walk the duct during the entry",
      cue: "Three things have gone wrong with the ventilation since the entry started. Find them.",
      why: "The blower's noise is reassuring and tells the crew nothing about whether air is reaching the bottom. Ducts get parked on, pulled up and knocked loose during the work, and each one quietly returns the dry well toward what it was before the purge. Walking the duct from the outlet to the end during the entry is how the plan stays the plan.",
    },
    {
      id: "shutdown", kind: "sequence",
      targets: ["entrant-clear", "blower-off", "duct-recovered"],
      itemNames: { "entrant-clear": "fitter out and clear of the hatch", "blower-off": "blower off", "duct-recovered": "duct recovered, hatch closed" },
      title: "Shut down in order: entrant out, blower off, duct up",
      cue: "The fitter climbs out and is clear of the hatch, then the blower goes off, then the duct comes up and the hatch is closed.",
      why: "The blower is the last thing standing between the entrant and the air the dry well makes on its own, so it stays on until they are out and clear. Switching it off to save a minute while someone is still on the ladder puts them in a space whose conditions the permit no longer describes. Duct up and hatch shut last, so the opening is guarded until nothing is left in it.",
      outOfOrderNote: "Entrant out first — the blower keeps running until nobody is below the hatch.",
    },
    {
      id: "vent-log", kind: "select", target: "vent-log",
      title: "Log the readings, the plume, the failure and the duct",
      cue: "Record the readings at each level and through the entry, the plume over the intake, the blower failure and the recall, and the duct problems you found, and close the permit.",
      why: "The readings through an entry are the record of what this dry well's air did with the plan in place, and the next crew's best starting point. The plume, the blower failure and the duct problems each change the plan for next time — a different blower spot on a west wind, a generator with fuel for the job, a guard over the duct where carts cross. Written now, they become the next permit's plan.",
    },
    {
      id: "crew-checkin", kind: "select", target: "crew-radio",
      title: "Check in with the entry supervisor and the fitter",
      cue: "Radio the entry supervisor that the permit is closed and the pumps can be returned, and check in with the fitter about the recall.",
      why: "Operations have held the station's pumps for the entry and release them on this call. The fitter was recalled up a ladder with the blower dead and the monitor about to be the only thing between them and the dry well's air; that stays with a person, and the member assistance programme on the back of the permit is there for exactly that.",
    },
  ],

  interrupts: [
    {
      id: "plume-over-intake",
      kind: "Exhaust over the intake",
      after: "purge", delay: 2, seconds: 12,
      alert: "The wind has swung round. The vacuum truck idling on the road is now blowing its exhaust straight across the blower's intake.",
      cue: "Move the blower to the new upwind spot with its intake back in clean air — then restart the purge clock.",
      target: "intake-new-spot",
      why: "The plan put the blower upwind of today's wind, not of every wind. When the wind swings, the intake can end up downwind of an exhaust, and the blower dutifully delivers carbon monoxide to the bottom of the dry well. Moving it to the new upwind side and re-running the purge is the fix; the purge that ran on dirty air did not count.",
      missNote: "The blower pushed the truck's exhaust into the dry well for the rest of the purge. The bottom reading came up with carbon monoxide on it and the whole purge had to be run again with the entry held.",
      wrongNote: "That does not clean the intake. Move the blower to the new upwind spot so it is drawing clean air again.",
    },
    {
      id: "blower-fails",
      kind: "Ventilation failed",
      after: "monitor", delay: 2, seconds: 12,
      alert: "The generator coughs and dies. The blower spins down and the duct goes limp over the coaming while the fitter is at the bottom.",
      cue: "Recall the fitter now with the horn and the radio — the permit's conditions assumed the blower running.",
      target: "recall-horn",
      why: "The readings that made entry acceptable were taken with forced air running, and the permit's conditions assumed it would keep running. When it stops, the space begins returning to what it was, and the entrant is recalled immediately rather than waiting for the monitor to confirm it. Restarting the generator is the next job, not the first one.",
      missNote: "Nobody recalled the fitter. They kept working in still air until the monitor on their chest alarmed on low oxygen, and climbed the ladder light-headed.",
      wrongNote: "The blower is down with the fitter below. Sound the recall — getting them out comes before getting the generator going.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.6, CVA_ACCENT);

    // --------------------------------------------------------- the yard pad
    const padTex = surfaceTexture((cx, w, h) => pavingFace(cx, w, h, { tiles: 6, base: "#a09f98", base2: "#95948d", seam: "rgba(0,0,0,0.18)" }), { repeat: 3, px: 384 });
    const padMat = texturedMat(padTex, { rough: 0.95, color: 0xa8a7a0 });
    const yard = group(g, 0, 0, 0);
    const H = 1.1;                      // hatch opening, square
    const slabs = [
      box(yard, 6.2, CVA_PAD, 2.2, 0, CVA_PAD / 2, -2.25, 0xffffff),
      box(yard, 6.2, CVA_PAD, 2.2, 0, CVA_PAD / 2, 1.75, 0xffffff),
      box(yard, 2.55, CVA_PAD, H, -1.83, CVA_PAD / 2, -0.6, 0xffffff),
      box(yard, 2.55, CVA_PAD, H, 1.83, CVA_PAD / 2, -0.6, 0xffffff),
    ];
    for (const s of slabs) s.material = padMat;
    // Hatch coaming and the open lid.
    const hatch = group(g, 0, CVA_PAD, -0.6);
    for (const [dx, dz, w, d] of [[-0.58, 0, 0.06, 1.2], [0.58, 0, 0.06, 1.2], [0, -0.58, 1.2, 0.06], [0, 0.58, 1.2, 0.06]]) box(hatch, w, 0.12, d, dx, 0.06, dz, 0x6b737c, { rough: 0.5, metal: 0.6 });
    const lid = box(hatch, 1.1, 0.05, 1.1, 0, 0.6, -0.62, 0x5b6360, { rough: 0.5, metal: 0.6 });
    lid.rotation.x = -1.4;
    // The dry well below: walls, floor, pumps, sump, valve gallery, chase.
    const well = group(hatch, 0, 0, 0);
    for (const [dx, dz, w, d] of [[-0.55, 0, 0.02, 1.1], [0.55, 0, 0.02, 1.1], [0, -0.55, 1.1, 0.02]]) box(well, w, 1.4, d, dx, -0.7, dz, 0x3a3834, { rough: 0.95, cast: false });
    box(well, 1.1, 0.02, 1.1, 0, -1.4, 0, 0x2a2826, { rough: 0.95, cast: false });
    for (const sx of [-0.25, 0.25]) {
      cyl(well, 0.12, 0.14, 0.4, sx, -1.2, -0.25, 0x2f5f8a, { rough: 0.5, metal: 0.5, seg: 14 });
      cyl(well, 0.05, 0.05, 1.2, sx, -0.6, -0.4, 0x4a6f8a, { rough: 0.5, metal: 0.5, seg: 10 });
    }
    const sump = box(well, 0.3, 0.06, 0.3, 0.32, -1.38, 0.3, 0x14120f, { rough: 0.95 });
    reg(hits, sump, "sump-pit");
    const gallery = box(well, 0.9, 0.3, 0.12, 0, -1.1, -0.48, 0x24323a, { rough: 0.8 });
    reg(hits, gallery, "valve-gallery");
    const chase = box(well, 0.12, 1.2, 0.12, 0.47, -0.7, -0.45, 0x1c1a18, { rough: 0.95 });
    reg(hits, chase, "pipe-chase");
    const ladder = group(well, -0.45, 0, 0.45);
    for (const sx of [-0.12, 0.12]) box(ladder, 0.03, 1.5, 0.03, sx, -0.68, 0, 0xb9bec4, { rough: 0.4, metal: 0.7 });
    for (let i = 0; i < 5; i++) box(ladder, 0.24, 0.02, 0.02, 0, -0.2 - i * 0.26, 0, 0xb9bec4, { rough: 0.4, metal: 0.7 });
    holoTag(hatch, "pump station dry well", 0, 1.0, 0.62, { css: CVA_CSS, w: 0.4 });
    // Sample points by level.
    const sampleAt = (id, y, label) => {
      const m = box(well, 0.14, 0.1, 0.14, 0.35, y, 0.35, 0x62c2a8, { opacity: 0.35, transparent: true, cast: false });
      holoTag(well, label, 0.35, y + 0.14, 0.45, { css: CVA_CSS, w: 0.2 });
      reg(hits, m, id);
      return m;
    };
    const sTop = sampleAt("sample-top", -0.1, "top");
    const sMid = sampleAt("sample-middle", -0.7, "middle");
    const sBot = sampleAt("sample-bottom", -1.25, "bottom");
    // The fitter at the pump (shown once the entry starts).
    const fitter = standingFigure(well, -0.15, 0.1, { ry: Math.PI, cloth: 0x2f6fa8, atStation: true, harness: true });
    fitter.position.y = -1.4; fitter.scale.setScalar(0.8);
    fitter.visible = false;
    const monitorOnFitter = box(well, 0.3, 0.3, 0.3, -0.15, -0.3, 0.1, 0x62c2a8, { opacity: 0.2, transparent: true, cast: false });
    holoTag(hatch, "fitter's monitor", -0.35, 0.35, 0.3, { css: CVA_CSS, w: 0.28 });
    reg(hits, monitorOnFitter, "entrant-monitor");

    // ----------------------------------------------------- blower and duct
    const blower = group(g, 1.4, CVA_PAD, 1.3);
    box(blower, 0.45, 0.45, 0.45, 0, 0.23, 0, 0xf2a23b, { rough: 0.6 });
    const intake = group(blower, 0, 0.23, 0);
    const grille = cyl(intake, 0.18, 0.18, 0.05, 0, 0, 0.24, 0x2b2f34, { rough: 0.6, seg: 18 });
    grille.rotation.x = Math.PI / 2;
    const outlet = cyl(blower, 0.12, 0.12, 0.2, -0.3, 0.23, 0, 0x2b2f34, { rough: 0.6, seg: 14 });
    outlet.rotation.z = Math.PI / 2;
    const lampOk = mat(0x59c97b, { emissive: 0x59c97b, ei: 1.2, rough: 0.4 });
    const lampDead = mat(0x3a1414, { emissive: 0xe0664f, ei: 1.6, rough: 0.4 });
    const lamp = box(blower, 0.06, 0.04, 0.04, 0.12, 0.5, 0.2, 0x59c97b, { rough: 0.4 });
    lamp.material = lampOk;
    holoTag(blower, "electric blower", 0, 0.72, 0, { css: CVA_CSS, w: 0.3 });
    reg(hits, blower, "blower");
    const intakeHit = box(blower, 0.3, 0.3, 0.1, 0, 0.23, 0.3, 0xf2a23b, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, intakeHit, "blower-intake");
    const mark = box(g, 0.6, 0.012, 0.6, 1.8, CVA_PAD + 0.007, 0.5, 0x62c2a8, { rough: 0.6, cast: false });
    hits["blower-mark"] = mark;
    holoTag(g, "upwind mark", 1.8, CVA_PAD + 0.2, 0.8, { css: CVA_CSS, w: 0.22 });
    const newSpot = box(g, 0.6, 0.012, 0.6, -1.7, CVA_PAD + 0.007, 0.9, 0xf2c14b, { rough: 0.6, cast: false });
    holoTag(g, "new upwind spot", -1.7, CVA_PAD + 0.22, 1.2, { css: CVA_CSS, w: 0.3 });
    reg(hits, newSpot, "intake-new-spot");
    const duct = hose(g, [[1.5, CVA_PAD + 0.25, 0.6], [0.9, CVA_PAD + 0.2, 0.2], [0.45, CVA_PAD + 0.25, -0.1], [0.4, CVA_PAD - 0.4, -0.25], [0.35, CVA_PAD - 1.25, -0.25]], 0.1, 0xf2d08a, { steps: 22, rough: 0.8 });
    const coupling = box(g, 0.2, 0.2, 0.2, 1.5, CVA_PAD + 0.25, 0.6, 0x62c2a8, { opacity: 0.25, transparent: true, cast: false });
    holoTag(g, "coupling", 1.5, CVA_PAD + 0.48, 0.6, { css: CVA_CSS, w: 0.18 });
    reg(hits, coupling, "duct-coupling");
    const kinkFree = box(g, 0.3, 0.2, 0.3, 0.5, CVA_PAD + 0.2, -0.1, 0x62c2a8, { opacity: 0.25, transparent: true, cast: false });
    holoTag(g, "over the coaming", 0.62, CVA_PAD + 0.45, 0.0, { css: CVA_CSS, w: 0.3 });
    reg(hits, kinkFree, "duct-no-kinks");
    const ductEnd = box(g, 0.24, 0.24, 0.24, 0.35, CVA_PAD - 1.2, -0.3, 0x62c2a8, { opacity: 0.3, transparent: true, cast: false });
    reg(hits, ductEnd, "duct-bottom");
    const collarDuct = box(g, 0.3, 0.2, 0.3, -0.3, CVA_PAD + 0.2, -0.2, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "leave the duct at the collar?", -0.3, CVA_PAD + 0.45, -0.1, { css: CVA_WARN, w: 0.5 });
    reg(hits, collarDuct, "duct-at-collar");
    // Duct faults for the walk (built, shown once the entry is under way).
    const cart = group(g, 0.9, CVA_PAD, 0.2);
    box(cart, 0.6, 0.06, 0.4, 0, 0.35, 0, 0x3a3f45, { rough: 0.6, metal: 0.4 });
    for (const sx of [-0.25, 0.25]) cyl(cart, 0.05, 0.05, 0.04, sx, 0.05, 0.15, 0x22262b, { rough: 0.7, seg: 10 });
    cart.visible = false;
    const crushHit = box(g, 0.4, 0.3, 0.4, 0.9, CVA_PAD + 0.2, 0.2, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, crushHit, "duct-crushed");
    const pulledHit = box(g, 0.3, 0.3, 0.3, 0.4, CVA_PAD - 0.6, -0.25, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, pulledHit, "duct-pulled-up");
    const leakHit = box(g, 0.25, 0.25, 0.25, 1.28, CVA_PAD + 0.25, 0.9, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, leakHit, "coupling-leak");
    // The recall horn at the hatch.
    const horn = group(g, -0.9, CVA_PAD, 0.2);
    cyl(horn, 0.05, 0.05, 0.14, 0, 0.07, 0, 0xd8232a, { rough: 0.5, seg: 12 });
    cyl(horn, 0.02, 0.06, 0.1, 0, 0.19, 0, 0xdfe4e8, { rough: 0.4, metal: 0.6, seg: 12 });
    holoTag(horn, "recall horn", 0, 0.36, 0, { css: CVA_CSS, w: 0.22 });
    reg(hits, horn, "recall-horn");

    // ----------------------------------------------------- generator, truck
    const gen = generatorTrailer(g, -2.4, CVA_PAD, -2.4, { ry: Math.PI / 2 });
    void gen;
    holoTag(g, "generator — downwind", -2.4, CVA_PAD + 2.3, -2.4, { css: CVA_CSS, w: 0.4 });
    // The vacuum truck idling on the service road behind the pad (a van-sized unit).
    const vac = cargoVan(g, 1.2, 0, -4.2, { ry: Math.PI / 2 });
    holoTag(g, "vac truck — idling on the road", 1.2, 2.5, -4.2, { css: CVA_CSS, w: 0.5 });
    void vac;
    const genBad = box(g, 0.5, 0.4, 0.4, 2.7, CVA_PAD + 0.3, 1.1, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "park the generator by the blower?", 2.7, CVA_PAD + 0.62, 1.1, { css: CVA_WARN, w: 0.56 });
    reg(hits, genBad, "generator-at-intake");
    const plume = cyl(g, 0.3, 0.8, 2.0, 0.3, CVA_PAD + 0.8, 1.7, 0x6a6a6a, { rough: 1, transparent: true, opacity: 0.35, seg: 12, cast: false });
    plume.rotation.z = Math.PI / 2;
    plume.visible = false;

    // ------------------------------------------------ plan board, timer, card
    const plan = holoPanel(g, 0.9, 0.62, -2.3, CVA_PAD + 1.45, 0.4, (ctx, w, h) => {
      ctx.fillStyle = "#0c1a17"; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = CVA_CSS; ctx.fillRect(0, 0, w, 6);
      ctx.font = `600 ${Math.round(h * 0.1)}px 'Barlow Condensed', Arial, sans-serif`;
      ctx.textAlign = "left"; ctx.textBaseline = "middle"; ctx.fillStyle = "#e4f4ef";
      ctx.fillText("PERMIT — VENTILATION & MONITORING", w * 0.05, h * 0.12);
      ctx.font = `${Math.round(h * 0.068)}px Arial, sans-serif`; ctx.fillStyle = "#cde8e0";
      ["Space: pump station dry well, hatch entry", "Mode: supply air, duct to bottom far corner", "Blower: electric, upwind, intake clean", "Generator: downwind, exhaust away", "Purge before entry: per the permit", "Monitoring: continuous, in breathing zone", "Alarm setpoints: per the permit", "Blower stops: recall, then restart"].forEach((l, i) => ctx.fillText(l, w * 0.05, h * (0.26 + i * 0.09)));
    }, { accent: CVA_ACCENT, ry: 0.9 });
    reg(hits, plan, "vent-plan");
    const station = group(g, -1.3, CVA_PAD, 1.0, 0.3);
    box(station, 0.7, 0.75, 0.45, 0, 0.375, 0, 0x53606b, { rough: 0.7, metal: 0.3 });
    const timer = decal(station, 0.24, 0.14, -0.18, 0.9, 0.0, signFace("PURGE --", { bg: "#0c1a17", accent: CVA_CSS, fg: "#e4f4ef", scale: 0.5 }), { glow: true, ei: 0.8 });
    const timerPost = box(station, 0.26, 0.2, 0.04, -0.18, 0.9, -0.03, 0x1b1e23, { rough: 0.5 });
    void timerPost;
    holoTag(station, "purge timer", -0.18, 1.08, 0.0, { css: CVA_CSS, w: 0.22 });
    reg(hits, timer, "purge-timer");
    const meter = fourGasMeter(station, 0.18, 0.75, 0.05, { ry: -0.2 });
    const bottomFace = decal(station, 0.2, 0.12, 0.18, 1.0, 0.02, signFace("BOTTOM --", { bg: "#0c1a17", accent: CVA_CSS, fg: "#e4f4ef", scale: 0.45 }), { glow: true, ei: 0.8 });
    holoTag(station, "bottom reading", 0.18, 1.15, 0.02, { css: CVA_CSS, w: 0.26 });
    reg(hits, bottomFace, "bottom-display");
    void meter;
    const card = decal(station, 0.22, 0.16, 0.05, 0.755, 0.12, paperFace("ALARM SETPOINTS", ["per the permit", "O2 · LEL · CO · H2S"], { scale: 0.6 }));
    card.rotation.x = -Math.PI / 2;
    reg(hits, card, "alarm-card");
    const topside = box(hatch, 0.14, 0.06, 0.1, 0.5, 0.15, 0.62, 0xe8762b, { rough: 0.7 });
    holoTag(hatch, "leave the monitor up here?", 0.5, 0.3, 0.7, { css: CVA_WARN, w: 0.46 });
    reg(hits, topside, "monitor-topside");
    const early = box(g, 0.4, 0.3, 0.3, -0.6, CVA_PAD + 0.6, 0.25, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "send him down now?", -0.6, CVA_PAD + 0.9, 0.25, { css: CVA_WARN, w: 0.36 });
    reg(hits, early, "enter-before-purge");
    // Shutdown markers and the closing log.
    const clear = box(g, 0.5, 0.012, 0.5, -0.9, CVA_PAD + 0.007, -1.7, 0x62c2a8, { opacity: 0.35, transparent: true, cast: false });
    holoTag(g, "fitter clear", -0.9, CVA_PAD + 0.2, -1.7, { css: CVA_CSS, w: 0.2 });
    reg(hits, clear, "entrant-clear");
    const offSwitch = box(blower, 0.08, 0.08, 0.05, -0.12, 0.5, 0.22, 0xd8232a, { rough: 0.5 });
    reg(hits, offSwitch, "blower-off");
    const recover = box(hatch, 0.4, 0.1, 0.3, 0.4, 0.2, 0.4, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, recover, "duct-recovered");
    const logDesk = group(g, 1.6, CVA_PAD, -1.9, -0.6);
    box(logDesk, 0.6, 0.72, 0.4, 0, 0.36, 0, 0x6b5a48, { rough: 0.7 });
    const log = decal(logDesk, 0.26, 0.3, -0.1, 0.725, 0, paperFace("AIR LOG", ["Top / mid / bottom", "Readings in entry", "Events"], { scale: 0.7 }));
    log.rotation.x = -Math.PI / 2;
    reg(hits, log, "vent-log");
    const crewRadio = radio(logDesk, 0.16, 0.72, 0.05, { ry: -0.3 });
    holoTag(logDesk, "radio — supervisor", 0.1, 1.05, 0.05, { css: CVA_CSS, w: 0.34 });
    reg(hits, crewRadio, "crew-radio");
    const tester = standingFigure(g, 2.6, -0.9, { ry: -1.6, cloth: 0xf2a23b, trousers: 0x2b3138, vest: 0xd8e84a });
    tester.position.y = CVA_PAD;
    for (const [x, z] of [[2.8, 1.6], [-2.8, -1.0]]) { const c = cone(g, x, z); if (c) c.position.y = CVA_PAD; }

    let purgeT = 0;
    return {
      hits,
      footprint: 2.6,
      spawnLook: new THREE.Vector3(0, 0.4, -0.6),
      onStepComplete(step) {
        if (step.id === "blower-place") blower.position.set(1.8, CVA_PAD, 0.5);
        if (step.id === "intake-turn") intake.rotation.y = Math.PI;
        if (step.id === "duct-run") { coupling.visible = false; kinkFree.visible = false; ductEnd.material = mat(0x62c2a8, { opacity: 0.1, transparent: true }); }
        if (step.id === "level-readings") { for (const m of [sTop, sMid, sBot]) m.material = mat(0x59c97b, { opacity: 0.4, transparent: true }); }
        if (step.id === "alarm-setpoints") fitter.visible = true;
        if (step.id === "monitor") { cart.visible = true; }
        if (step.id === "duct-walk") { cart.position.x = 2.2; crushHit.visible = false; }
        if (step.id === "shutdown") { fitter.visible = false; lamp.material = lampDead; lid.rotation.x = 0; lid.position.z = 0; }
      },
      onInterrupt(it) {
        if (it.id === "plume-over-intake") plume.visible = true;
        if (it.id === "blower-fails") { lamp.material = lampDead; duct.scale.y = 0.94; }
      },
      onInterruptEnd(it) {
        if (it.id === "plume-over-intake" && it.resolved === "answered") { plume.visible = false; blower.position.set(-1.7, CVA_PAD, 0.9); }
        if (it.id === "blower-fails" && it.resolved === "answered") { fitter.position.y = -0.3; lamp.material = lampOk; duct.scale.y = 1; }
      },
      animate(t, dt, session) {
        const step = session?.step;
        if (step?.id === "purge" && session.holding) {
          purgeT = Math.min(1, purgeT + dt / 6);
          if (purgeT >= 1) repaint(timer, signFace("PURGE DONE", { bg: "#0c1a17", accent: "#59c97b", fg: "#e4f4ef", scale: 0.45 }));
        }
        const gg = session?.gauge;
        if (gg && !gg.committed && step?.id === "bottom-reading") repaint(bottomFace, signFace(gg.t < 0.46 ? "O2 LOW" : gg.t > 0.62 ? "SETTLING" : "IN LIMITS", { bg: "#0c1a17", accent: gg.t >= 0.46 && gg.t <= 0.62 ? "#59c97b" : "#f2ae14", fg: "#e4f4ef", scale: 0.45 }));
        if (lamp.material === lampOk) grille.rotation.y = t * 8;
      },
    };
  },
};
