import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import { box, cyl, torus, group, decal, repaint, signFace, particles } from "../../../shared/kit.js";
import {
  CITY, stationPad, holoPanel, holoTag, instrument, standingFigure, cone,
  reg, surfaceTexture, texturedMat, concreteFace, palette,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Power Trowel Operation & Guarding VR — Cement masons and
// plasterers, station two.
//
// A walk-behind power trowel closing a large placement: the machine walked
// before the engine starts, the guard ring and the cord fixed before the
// blades ever turn, the pitch set to the manufacturer's float and finish
// angles, the walking pattern kept inside the machine's own speed band, and
// the blades never touched by hand while they can still turn. Pitch angles,
// float times and cord ratings are the manufacturer's manual and the SDS, not
// a number this file invents.

const CMPT_ACCENT = 0xf2c14b;
const CMPT_CSS = "#f2c14b";
const CMPT_PAL = palette("construction");

export const SIM_CM_POWER_TROWEL_OPERATION_AND_GUARDING = {
  id: "cm-power-trowel-operation-and-guarding",
  index: "701",
  domain: "Construction & Structural Trades",
  trade: "Cement mason — OPCMIA Local 300, power trowel operator",
  category: "Construction & Structural Trades",
  weather: "clear",
  certification: "OPCMIA Local 300 cement mason apprenticeship as a training body; OSHA 29 CFR 1926 Subpart Q concrete and masonry construction; OSHA 29 CFR 1910.212 machine guarding, as applied to the trowel's guard ring; OSHA 29 CFR 1926.1153 respirable crystalline silica for the surface it finishes; ANSI/ASSP A10.9 concrete and masonry construction safety requirements; the manufacturer's operation manual for pitch, guard fitment and cord rating",
  name: "Power Trowel Operation & Guarding",
  title: simTitle("Power Trowel Operation & Guarding"),
  tagline: "A walk-behind trowel run right: the machine walked before the engine starts, the guard ring and cord fixed, bystanders clear, blades pitched to float then to finish inside the manufacturer's bands, the perimeter edged, the floor checked flat, and the machine locked out before anyone's hand goes near the pans",
  accent: CMPT_ACCENT,
  accentCss: CMPT_CSS,
  parSeconds: 300,
  footprint: 2.6,
  badge: { id: "guarded-every-pass", name: "Guarded Every Pass", note: "A trowel walked, guarded and pitched to the manufacturer's bands with nobody's hand near a turning blade — first time" },

  supportLine: "your OPCMIA Local 300 member assistance programme, or the employee assistance line posted on the contractor's site board",

  game: system({
    name: "Finish Crew",
    currency: "PASS",
    ranks: ["Laborer", "Trowel Hand", "Cement Mason", "Lead Finisher", "Finish Crew Certified"],
    badges: [
      { id: "walked-it-first", name: "Walked It First", note: "The pre-op walk found the missing guard and the frayed cord before the engine ever turned over, first time", test: AWARD.stepClean("pre-op-walk") },
      { id: "guard-never-off", name: "Guard Never Off", note: "Never ran it unguarded, never reached under a turning pan, never a bare hand in the mix, never plugged the frayed cord in wet", test: AWARD.safe },
      { id: "on-the-pitch", name: "On The Pitch", note: "Blade pitch and floor flatness both held inside the band", test: AWARD.precise(0.7) },
    ],
    challenges: [
      { id: "clean-pass", name: "Clean Pass", note: "No corrections through the whole floor pass", test: AWARD.clean },
      { id: "steady-walk", name: "Steady Walk", note: "The walking speed held in band for the whole finish pass", test: AWARD.unbroken },
      { id: "floor-by-break", name: "Floor By Break", note: "Guarded, pitched, edged and logged inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "trowel-unguarded": "You went to start the trowel with the guard ring still off. The guard ring is the only thing standing between a spinning blade turning fast enough to finish concrete and a boot or a hand that strays over the pans; OSHA 29 CFR 1910.212 requires the guard fitted before the machine runs, not fitted afterward if nothing goes wrong first.",
    "reach-under-running": "You reached toward the pans to clear a jam while the engine was still running. A power trowel's blades keep spinning on their own momentum for a few seconds after the throttle is cut, long enough to take fingers the instant a hand crosses the guard line; the machine is shut down and the blades are stopped and confirmed still before anyone's hand goes near them.",
    "bare-hand-edge": "You went to hand-finish the edge without gloves. Fresh concrete is strongly alkaline and burns skin slowly, often without pain until hours later, and an edger's hand is in contact with wet mix for the whole perimeter pass. Gloves stay on for every minute the mix is wet.",
    "frayed-cord-wet-slab": "You went to plug the trowel in on the frayed extension cord while the slab underneath it was still wet. Water and a compromised cord jacket on a live circuit is exactly how a cord energizes standing water, and a mason's boots on a wet slab are not insulation. The cord is swapped and the circuit is GFCI-protected before anything gets plugged in near the pour.",
  },

  lateNotes: {
    "trowel-handle": "The float pass starts once the guard is fitted, the cord is swapped and the pitch is set — not before, because the blades only turn under those three things being true.",
    "pitch-dial-finish": "The pitch only goes to the finish angle once the float pass has closed the surface; finishing too early burnishes a surface that has not actually set enough to take it.",
    "close-log": "The floor is logged once it has been checked flat and the machine is shut down and locked out.",
  },

  steps: [
    {
      id: "trowel-card", kind: "select", target: "trowel-card",
      title: "Read the trowel operation card",
      cue: "Read the pitch schedule for float and finish, the guard ring requirement, and today's walking pattern.",
      why: "A power trowel's blade pitch is set to the manufacturer's own schedule for float and for finish, and the guard ring is a fitted part of the machine before it ever starts — neither one is something a cement mason improvises on the slab. The card names the pattern the walk follows across the bay, so every square foot gets the same number of passes instead of some getting three and some getting none.",
    },
    {
      id: "pre-op-walk", kind: "find", noHint: true,
      targets: ["no-guard-ring", "frayed-cord", "worn-pan"],
      itemNames: { "no-guard-ring": "the guard ring off the trowel", "frayed-cord": "a frayed extension cord", "worn-pan": "a cracked float pan" },
      itemNotes: {
        "no-guard-ring": "The guard ring that belts the spinning blades is sitting on the ground next to the machine instead of fitted around the rotor.",
        "frayed-cord": "The extension cord run out to the trowel has its jacket split open for a hand's width, right where it lies across the still-wet slab edge.",
        "worn-pan": "One of the float pans is cracked clean through — a pan that lets go at speed throws a piece of itself across the bay.",
      },
      title: "Walk the machine before the engine starts",
      cue: "Walk around the trowel and the cord run and click every defect you find.",
      why: "With the engine cold and the blades not turning, every one of these takes a minute or two to sort out. Discover them instead once the machine is running and a foot strays near an unguarded blade, a compromised cord grounds through the wet slab, or a cracked pan finally lets go at full speed — none of which end with a two-minute fix.",
    },
    {
      id: "fix", kind: "sequence", anyOrder: true,
      targets: ["fit-guard", "swap-cord", "swap-pan"],
      itemNames: { "fit-guard": "guard ring fitted", "swap-cord": "cord swapped", "swap-pan": "cracked pan swapped" },
      title: "Correct what the walk found",
      cue: "Fit the guard ring, swap the frayed cord for a sound one, and swap the cracked pan.",
      why: "Leaving a spotted defect uncorrected is arguably worse than never spotting it, because everyone downstream now treats the trowel as checked and safe to run on the strength of a note nobody actually acted on. The walk only earns that trust once the guard is really on, the cord is really sound and the pan is really running true.",
    },
    {
      id: "clear-zone", kind: "select", target: "walk-lane",
      title: "Clear bystanders from the trowel's walking lane",
      cue: "Move anyone not running the machine out of the lane the trowel will walk across the bay.",
      why: "A power trowel operator watches the pans and the surface, not the crowd behind, and the machine cannot see or stop for someone stepping into its path the way a person can step aside for a person. The lane is cleared before the engine starts, which is the only point anyone can be certain it is actually empty.",
    },
    {
      id: "pitch-float", kind: "gauge", target: "pitch-dial-float",
      title: "Pitch the blades for the float pass",
      cue: "Set the blade pitch to the manufacturer's float angle before the engine turns the rotor.",
      why: "Too flat a pitch on the float pass barely closes the surface after the bull float; too steep and the blades dig in and gouge a slab that has not set hard enough to take it yet. The manufacturer's float angle is the one setting that closes the surface evenly without either mistake, and it is set before the rotor is under power, not adjusted by feel once it is spinning.",
      gauge: { label: "PITCH", speed: 0.68, green: [0.4, 0.58], readout: (t) => (t < 0.4 ? "too flat — barely closing" : t <= 0.58 ? "manufacturer's float angle" : "too steep — digging in"), missNote: "Off the float angle — back the pitch off and set it against the manufacturer's schedule again." },
    },
    {
      id: "float-pass", kind: "hold", target: "trowel-handle", seconds: 5,
      title: "Walk the float pass",
      cue: "Hold the handlebars steady and walk the trowel across the bay in overlapping passes, guard down, nothing near the pans.",
      why: "The float pass is what actually closes the surface the bull float left rough, and it only does that walked at a steady pace in overlapping passes — rushed, it skips strips that never get closed at all, and those strips read as soft, dusting patches for the life of the floor.",
      holdBreakNote: "The handlebars let go mid-pass and the trowel walked itself off line. Reset at the edge of the last clean pass and hold it steady again.",
    },
    {
      id: "walk-speed", kind: "track", target: "walk-lane", seconds: 6,
      title: "Hold the walking speed for the finish pass",
      cue: "Keep the trowel's ground speed inside the manufacturer's band as you walk the finish pattern.",
      why: "Walked too fast, the blades skim the surface without burnishing it; walked too slow, they burn the surface and leave dark, glazed streaks that never take a sealer evenly. The manufacturer's speed band is what makes every pass across the bay come out looking like the same floor instead of a patchwork of however fast the operator happened to be walking that minute.",
      track: { start: 0.2, green: [0.4, 0.6], rise: 0.5, fall: 0.46, drift: 0.12, label: "GROUND SPEED", readout: (v) => (v < 0.4 ? "too slow — burning the surface" : v > 0.6 ? "too fast — skimming it" : "in the manufacturer's band") },
      holdBreakNote: "The walking speed left the band while nobody was watching it. Bring it back into the band and hold the pace.",
    },
    {
      id: "pitch-finish", kind: "turn", target: "pitch-dial-finish",
      title: "Dial the blades to the finish pitch",
      cue: "Turn the pitch dial up to the manufacturer's finish angle once the float pass has closed the surface.",
      why: "The finish pitch is steeper than the float pitch on purpose — it is what actually burnishes the closed surface into the hard, dense wear layer a trowel finish is for. Dialed in before the surface is ready, it tears a still-soft slab instead of polishing a set one.",
      turn: { turns: 1, label: "FINISH PITCH" },
    },
    {
      id: "edge-perimeter", kind: "drag", target: "edger",
      title: "Hand-edge the perimeter the trowel cannot reach",
      cue: "Carry the edger to the wall line the trowel's pans cannot get close to and finish it by hand.",
      why: "A power trowel's pans cannot reach all the way to a wall or a column without striking it, so the last foot of perimeter is always finished by hand — skipped, it is the one strip of every floor that never matches the machine-finished field around it.",
      drag: { to: "perimeter-zone", radius: 0.6, missNote: "Not along the wall line — the hand edge has to run the whole perimeter the trowel's pans cannot reach." },
    },
    {
      id: "flatness-check", kind: "gauge", target: "straightedge",
      title: "Check the floor for flatness",
      cue: "Draw the straightedge across a finished strip and commit once it reads flat against the job card's tolerance.",
      why: "A trowel finish can look glassy and still be out of flat underneath it, and a floor that is out of flat shows up later as standing water on a slab meant to drain, or a gap under a slab-on-grade partition track. The straightedge is the only check that catches it while the crew is still standing on the floor that made it.",
      gauge: { label: "FLATNESS", speed: 0.66, green: [0.42, 0.6], readout: (t) => (t < 0.42 ? "low spot under the edge" : t <= 0.6 ? "flat to the job card" : "high spot under the edge"), missNote: "Out of flat — mark the spot and check the pitch schedule before troweling over it again." },
    },
    {
      id: "shutdown-lockout", kind: "select", target: "kill-switch",
      title: "Shut down and confirm the blades stopped",
      cue: "Cut the engine at the kill switch and watch the pans come to a full stop before anyone's hand goes near them.",
      why: "A trowel's blades carry their own momentum for a few seconds after the throttle cuts, and a hand that reaches for the pans on the assumption the machine is already off is reaching for blades that are still turning. The kill switch and a confirmed stop, watched, are what actually make the machine safe to touch.",
    },
    {
      id: "close-log", kind: "select", target: "close-log",
      title: "Log the floor",
      cue: "Record the guard fitted, the cord swapped, the pitch schedule run and the flatness checked.",
      why: "The finish log tells the foreman and the next trade in behind the cement masons that this floor was guarded, pitched to the schedule and checked flat rather than just finished on the clock — it is also where the cracked pan and the frayed cord get written down so they never go back into service unrepaired.",
    },
    {
      id: "crew-checkin", kind: "select", target: "crew-radio",
      title: "Check in with the crew and the foreman",
      cue: "Call the foreman: floor guarded, pitched and logged. Then check in with the crew about the cord and the laborer near the blades.",
      why: "The next bay's pour gets planned around whatever this call actually reports, not around a shift that quietly went fine. A laborer stepped closer to a running trowel than anyone would like, and a cord sat live in a puddle for longer than it should have — both belong in the call, along with a reminder that the OPCMIA member assistance line is there whenever a shift leaves somebody rattled.",
    },
  ],

  interrupts: [
    {
      id: "bystander-near-blades",
      kind: "Laborer walking into the trowel's lane",
      after: "float-pass", delay: 2, seconds: 12,
      alert: "A laborer carrying a bucket has stepped straight into the trowel's walking lane, right where the machine is about to turn back across the bay.",
      cue: "Hit the kill switch before the trowel reaches him.",
      target: "kill-switch",
      why: "A power trowel operator walking backward through a turn cannot always see someone stepping into the lane from the side, and the machine has no way to stop itself for a person the way a person could step aside for another person. The kill switch is the fastest way to stop the blades before the machine reaches him, faster than shouting over the engine.",
      missNote: "The trowel kept walking its pattern with the laborer still in the lane; it clipped his boot with the guard ring on the turn before anyone reached the switch.",
      wrongNote: "The kill switch — a person is in the trowel's lane and the machine has to be stopped before it reaches him, not steered around him.",
    },
    {
      id: "cord-sparking",
      kind: "Extension cord sparking in a puddle",
      after: "walk-speed", delay: 2, seconds: 12,
      alert: "The extension cord feeding the trowel is lying in a puddle at the edge of the bay and it has started sparking where the jacket is nicked.",
      cue: "Trip the breaker before anyone touches the cord or the puddle.",
      target: "breaker-panel",
      why: "A sparking cord in standing water is an energized puddle, not a nuisance to step around, and pulling the plug by hand while it is arcing is exactly how a mason becomes the second casualty. The breaker at the panel kills the circuit from a distance, which is the only safe way to de-energize a cord nobody should be touching.",
      missNote: "The cord kept sparking in the puddle through the rest of the pass; a mason walked the trowel's cord across the wet patch without anyone cutting power to it first.",
      wrongNote: "The breaker panel — a live cord sparking in a puddle gets killed from the panel, never grabbed by hand.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.6, CMPT_ACCENT);
    const ground = box(g, 8.4, 0.04, 6.6, 0, 0.02, -0.4, 0xffffff);
    ground.material = texturedMat(surfaceTexture((cx, w, h) => concreteFace(cx, w, h, { finish: "smooth", tone: "#9a968c", tone2: "#8e8a80" }), { repeat: 4, px: 512 }), { rough: 0.7, color: 0xe0dbcc });

    // ------------------------------------------------------------- the bay
    const bay = group(g, 0, 0.02, -1.6);
    const bayFloor = box(bay, 4.6, 0.02, 3.2, 0, 0.01, 0, 0xffffff);
    bayFloor.material = texturedMat(surfaceTexture((cx, w, h) => concreteFace(cx, w, h, { finish: "smooth", tone: "#a29e92", tone2: "#948f82" }), { repeat: 3, px: 512 }), { rough: 0.55, color: 0xece7d8 });
    const walkLaneMark = box(bay, 4.4, 0.005, 1.0, 0, 0.03, 0.4, 0x59c97b, { rough: 0.7, opacity: 0.3, transparent: true, cast: false });
    void walkLaneMark;
    const walkLaneHit = box(bay, 4.4, 0.6, 1.4, 0, 0.35, 0.4, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(bay, "trowel walking lane", 0, 0.7, 0.4, { css: CMPT_CSS, w: 0.32 });
    reg(hits, walkLaneHit, "walk-lane");

    // ------------------------------------------------------------- the trowel
    const trowel = group(bay, -1.2, 0.02, -0.4, 0.2);
    const deck = cyl(trowel, 0.22, 0.24, 0.28, 0, 0.55, 0, 0x2b2f34, { rough: 0.6, seg: 16 });
    void deck;
    const handleBar = group(trowel, 0, 0.68, -0.55);
    const handle = box(handleBar, 0.06, 0.06, 1.1, 0, 0, -0.5, CMPT_PAL.accent, { rough: 0.5, metal: 0.4 });
    handle.rotation.x = -0.5;
    reg(hits, handleBar, "trowel-handle");
    const rotor = group(trowel, 0, 0.1, 0);
    const pans = [];
    for (let i = 0; i < 4; i++) {
      const a = (i / 4) * Math.PI * 2;
      const pan = box(rotor, 0.42, 0.02, 0.1, Math.cos(a) * 0.28, 0.02, Math.sin(a) * 0.28, 0xb9bec4, { rough: 0.4, metal: 0.6 });
      pan.rotation.y = a;
      pans.push(pan);
    }
    const crackedPan = pans[1];
    reg(hits, crackedPan, "worn-pan");
    const guardRing = torus(trowel, 0.5, 0.03, 0, 0.14, 0, CMPT_PAL.trim, { rough: 0.5, metal: 0.5, seg: 24, seg2: 8 });
    guardRing.rotation.x = Math.PI / 2;
    guardRing.visible = false;
    const guardOffMark = torus(g, 0.5, 0.03, -3.4, 0.03, 1.6, 0x8a6a42, { rough: 0.7, seg: 24, seg2: 8 });
    guardOffMark.rotation.x = Math.PI / 2;
    reg(hits, guardOffMark, "no-guard-ring");
    holoTag(g, "guard ring — off the machine", -3.4, 0.3, 1.6, { css: CMPT_CSS, w: 0.4 });
    const unguardedHit = box(trowel, 0.7, 0.4, 0.7, 0, 0.4, 0, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(trowel, "start it unguarded?", 0, 0.9, 0, { css: "#d2312b", w: 0.4 });
    reg(hits, unguardedHit, "trowel-unguarded");
    const reachHit = box(trowel, 0.5, 0.2, 0.5, 0, 0.1, 0.4, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(trowel, "clear the jam while it runs?", 0, 0.3, 0.55, { css: "#d2312b", w: 0.48 });
    reg(hits, reachHit, "reach-under-running");
    const killSwitch = box(handleBar, 0.08, 0.06, 0.03, 0, -0.02, -1.0, 0xd2312b, { rough: 0.5, metal: 0.3 });
    holoTag(handleBar, "kill switch", 0, 0.14, -1.0, { css: CMPT_CSS, w: 0.2 });
    reg(hits, killSwitch, "kill-switch");
    const pitchDial = cyl(trowel, 0.05, 0.05, 0.04, 0.1, 0.62, -0.3, CMPT_PAL.accent, { rough: 0.5, metal: 0.5, seg: 16 });
    holoTag(trowel, "pitch dial", 0.1, 0.75, -0.3, { css: CMPT_CSS, w: 0.2 });
    reg(hits, pitchDial, "pitch-dial-float");
    hits["pitch-dial-finish"] = pitchDial;

    // Fix-step targets — the tools that actually correct what the walk found.
    const guardSupply = group(g, -3.0, 0.02, 1.6, 0.3);
    torus(guardSupply, 0.14, 0.02, 0, 0.12, 0, CMPT_PAL.trim, { rough: 0.5, metal: 0.5, seg: 16, seg2: 6 });
    holoTag(guardSupply, "fit the guard ring", 0, 0.3, 0, { css: CMPT_CSS, w: 0.3 });
    reg(hits, guardSupply, "fit-guard");
    const cordSupply = group(g, -3.2, 0.02, -0.4, 0.2);
    cyl(cordSupply, 0.05, 0.05, 0.1, 0, 0.06, 0, CMPT_PAL.accent, { rough: 0.6, seg: 12 });
    holoTag(cordSupply, "swap the cord", 0, 0.22, 0, { css: CMPT_CSS, w: 0.28 });
    reg(hits, cordSupply, "swap-cord");
    const panSupply = group(g, -3.4, 0.02, -1.0, 0.2);
    box(panSupply, 0.4, 0.02, 0.1, 0, 0.02, 0, 0xb9bec4, { rough: 0.4, metal: 0.6 });
    holoTag(panSupply, "swap the cracked pan", 0, 0.2, 0, { css: CMPT_CSS, w: 0.32 });
    reg(hits, panSupply, "swap-pan");

    // ------------------------------------------------------------- cord and puddle
    const cordRun = group(g, -2.6, 0.02, -0.4);
    const cordFrayed = cyl(cordRun, 0.012, 0.012, 1.6, 0, 0.02, 0, 0xf2c14b, { rough: 0.7, seg: 8 });
    cordFrayed.rotation.z = Math.PI / 2;
    reg(hits, cordFrayed, "frayed-cord");
    holoTag(cordRun, "frayed extension cord", 0, 0.24, 0, { css: CMPT_CSS, w: 0.34 });
    const puddle = box(g, 0.7, 0.006, 0.5, -2.0, 0.023, 0.4, 0x2b5a6a, { rough: 0.1, opacity: 0.5, transparent: true, cast: false });
    const sparkHit = box(g, 0.4, 0.2, 0.4, -2.0, 0.08, 0.4, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "plug in on the frayed cord?", -2.0, 0.35, 0.4, { css: "#d2312b", w: 0.44 });
    reg(hits, sparkHit, "frayed-cord-wet-slab");
    const sparks = particles(g, 30, 0xfff2b0, { size: 0.02, life: 0.4, additive: true, opacity: 0.9 });
    const breaker = group(g, -3.6, 0.02, -1.8, 0.3);
    box(breaker, 0.24, 0.32, 0.1, 0, 0.4, 0, 0x2b2f34, { rough: 0.6 });
    const breakerToggle = box(breaker, 0.05, 0.1, 0.03, 0, 0.42, 0.06, 0x59c97b, { rough: 0.5 });
    holoTag(breaker, "breaker panel", 0, 0.6, 0, { css: CMPT_CSS, w: 0.24 });
    reg(hits, breaker, "breaker-panel");

    // ------------------------------------------------------------- edger, straightedge, perimeter
    const edger = group(g, 2.4, 0.02, 1.9, 0.2);
    box(edger, 0.2, 0.05, 0.14, 0, 0.035, 0, 0xdfe6ec, { rough: 0.4, metal: 0.6 });
    box(edger, 0.03, 0.4, 0.03, -0.06, 0.24, 0, 0x8a6a42, { rough: 0.85 });
    holoTag(edger, "hand edger", 0, 0.5, 0, { css: CMPT_CSS, w: 0.24 });
    reg(hits, edger, "edger");
    const perimeterHit = box(bay, 4.4, 0.02, 0.3, 0, 0.02, -1.5, 0xffffff, { opacity: 0.001, transparent: true, cast: false });
    hits["perimeter-zone"] = perimeterHit;
    const bareHandHit = box(edger, 0.3, 0.2, 0.3, 0.3, 0.2, 0.2, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(edger, "edge it bare-handed?", 0.3, 0.45, 0.2, { css: "#d2312b", w: 0.4 });
    reg(hits, bareHandHit, "bare-hand-edge");
    const straightedge = box(g, 1.2, 0.03, 0.06, 1.6, 0.045, 1.2, 0xb9bec4, { rough: 0.4, metal: 0.6 });
    holoTag(g, "straightedge", 1.6, 0.24, 1.2, { css: CMPT_CSS, w: 0.24 });
    reg(hits, straightedge, "straightedge");

    // ------------------------------------------------------------- card, log, radio, crew
    const board = group(g, 2.9, 0.02, -2.4, 0.1);
    holoPanel(board, 0.95, 0.62, 0, 1.25, 0, (ctx, w, h) => {
      ctx.fillStyle = "#22201a"; ctx.fillRect(0, 0, w, h); ctx.fillStyle = CMPT_CSS; ctx.fillRect(0, 0, w, 6);
      ctx.font = `600 ${Math.round(h * 0.11)}px 'Barlow Condensed', Arial, sans-serif`; ctx.textAlign = "left"; ctx.textBaseline = "middle";
      ctx.fillStyle = "#efeade"; ctx.fillText("TROWEL CARD — BAY 5", w * 0.06, h * 0.14);
      ctx.font = `${Math.round(h * 0.08)}px Arial, sans-serif`; ctx.fillStyle = "#f7f4ec";
      ["Pitch: float and finish per the manual", "Guard ring fitted before start — no exception", "Walking pattern: overlapping, per the card", "Cord: GFCI-protected, sound jacket only", "Shutdown: confirm blades stopped before touch"].forEach((l, i) => ctx.fillText(l, w * 0.06, h * (0.28 + i * 0.11)));
    }, { accent: CMPT_ACCENT });
    reg(hits, board, "trowel-card");

    const log = group(g, 3.4, 0.02, -1.0, -0.1);
    box(log, 0.03, 1.1, 0.03, 0, 0.55, -0.02, 0x8b949d, { rough: 0.5, metal: 0.6 });
    log.userData.face = decal(log, 0.62, 0.44, 0, 1.3, 0.01, signFace("TROWEL LOG —\nBAY 5", { bg: "#171108", accent: CMPT_CSS, fg: "#efeade", scale: 0.32 }), { px: 384, glow: true, ei: 0.6 });
    holoTag(log, "trowel log", 0, 1.62, 0, { css: CMPT_CSS, w: 0.22 });
    reg(hits, log, "close-log");

    const crewRadio = group(g, 3.6, 0.02, -2.0, -0.2);
    box(crewRadio, 0.1, 0.18, 0.06, 0, 0.09, 0, 0x2b2f34, { rough: 0.6 });
    crewRadio.userData.screen = decal(crewRadio, 0.08, 0.05, 0, 0.15, 0.031, signFace("—", { bg: "#0d1c24", accent: CMPT_CSS, fg: "#bfeaf7", scale: 0.5 }), { px: 128, glow: true, ei: 0.6 });
    holoTag(crewRadio, "crew radio", 0, 0.3, 0, { css: CMPT_CSS, w: 0.2 });
    reg(hits, crewRadio, "crew-radio");

    const mason = standingFigure(g, 1.8, -3.0, { ry: 2.4, cloth: 0x4a4038, vest: CMPT_PAL.accent, helmet: 0xf2f2f2, gloves: true });
    holoTag(mason, "cement mason", 0, 1.9, 0, { css: CMPT_CSS, w: 0.24 });
    const laborer = standingFigure(g, -3.0, -3.4, { ry: 1.2, cloth: 0x5a4a3a, vest: 0xd8f23a, helmet: 0xf2f2f2, atStation: true });
    laborer.visible = false;
    for (const [x, z] of [[3.6, 0.4], [-3.6, 2.0]]) cone(g, x, z);

    // ------------------------------------------------------------- yard dressing
    // A materials pallet, a spare-parts rack and a rebar offcut pile — the
    // ordinary clutter a finishing bay keeps at hand, not part of any step.
    const yard = group(g, 3.6, 0.02, -3.4, 0.3);
    for (let r = 0; r < 7; r++) for (let c = 0; c < 8; c++) box(yard, 0.16, 0.12, 0.16, -0.7 + c * 0.2, 0.08 + r * 0.01, -0.7 + r * 0.2, r % 2 ? 0xb9b4a8 : 0xa89f8f, { rough: 0.9 });
    const partsRack = group(g, -3.6, 0.02, -2.6, -0.3);
    box(partsRack, 0.7, 0.05, 0.35, 0, 0.9, 0, CMPT_PAL.trim, { rough: 0.6, metal: 0.5 });
    for (let i = 0; i < 5; i++) cyl(partsRack, 0.02, 0.02, 0.55, -0.28 + i * 0.14, 0.55, 0, 0x8b949d, { rough: 0.5, metal: 0.6, seg: 6 });
    const offcutPile = group(g, -2.4, 0.02, -3.4, 0.2);
    for (let i = 0; i < 6; i++) cyl(offcutPile, 0.012, 0.012, 0.5 + (i % 3) * 0.1, -0.24 + i * 0.09, 0.06, 0, 0x7a5c3a, { rough: 0.9, seg: 6 }).rotation.z = Math.PI / 2;

    let rotorSpin = false, floating = false, laborerElapsed = 0;
    return {
      hits,
      spawnLook: new THREE.Vector3(-1.0, 1.0, -1.6),
      onStep() {},
      onStepComplete(step) {
        if (step.id === "fix") { guardRing.visible = true; guardOffMark.visible = false; crackedPan.material = crackedPan.material.clone(); crackedPan.material.color.set(0xdfe6ec); cordFrayed.material = cordFrayed.material.clone(); cordFrayed.material.color.set(0x2b2f34); }
        if (step.id === "float-pass") floating = false;
        if (step.id === "shutdown-lockout") rotorSpin = false;
        if (step.id === "close-log") repaint(log.userData.face, signFace("TROWEL LOG —\nGUARDED + LOGGED", { bg: "#171108", accent: "#59c97b", fg: "#d8f5e0", scale: 0.28 }));
        if (step.id === "crew-checkin") repaint(crewRadio.userData.screen, signFace("BAY 5 DONE", { bg: "#0d1c24", accent: "#59c97b", fg: "#bfeaf7", scale: 0.42 }));
      },
      onHazard() {},
      onInterrupt(it) {
        if (it.id === "bystander-near-blades") { laborer.visible = true; laborerElapsed = 0; laborer.position.set(-0.6, 0, -0.4); }
        if (it.id === "cord-sparking") { sparks.visible = true; puddle.material.opacity = 0.75; }
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "bystander-near-blades") laborer.visible = false;
        if (it.id === "cord-sparking") { sparks.visible = false; puddle.material.opacity = 0.5; }
      },
      animate(t, dt, session) {
        const step = session?.step;
        if (step?.id === "float-pass" && session.holding) { floating = true; rotorSpin = true; }
        else if (step?.id !== "walk-speed") floating = false;
        if (step?.id === "walk-speed") rotorSpin = true;
        if (rotorSpin) rotor.rotation.y += dt * 8;
        const gg = session?.gauge;
        if (gg && !gg.committed && (step?.id === "pitch-float" || step?.id === "flatness-check")) {
          handle.rotation.z = (gg.t - 0.5) * 0.4;
        }
        if (session?.turn && step?.id === "pitch-finish") handle.rotation.z = session.turn.amount * 0.6;
        if (session?.activeInterrupt?.id === "bystander-near-blades") {
          laborerElapsed += dt;
          const p = Math.min(1, laborerElapsed / 10);
          laborer.position.x = -0.6 + p * -0.4;
        }
        void floating; void CITY;
      },
    };
  },
};
