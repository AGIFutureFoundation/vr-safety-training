import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, ball, slab, hose, group, decal, repaint, signFace, paperFace,
  shell, ceilingGrid, spreadLayout, mergeStatic, counter, particles, markInteractive, mat,
} from "../../../shared/kit.js";
import { bottleRack, noticeBoard, racking, shopFan, sideBench, spillStation, wasteBin , bayCrew, breatheCrew } from "../shopfit.js";

// Room 09 — Painter / coatings applicator: an airless spray of an interior
// wall in a pre-1978 building, done the way an IUPAT-trained crew and a
// hazmat-aware environmental crew are both required to do it. The old paint
// is tested before anything is sanded, the room is contained before the
// pump is primed, and the spray itself is graded three ways:
//
//   coverage      — the spray pass is a `track` step: hold a steady 50%
//                   overlap at gun speed for the full pass; drop-outs cost.
//   runs / damage — tip selection, fluid pressure and wet-film build are
//                   scored steps; too thick sags, too thin holidays. Dry
//                   sanding untested paint and clearing a tip with a finger
//                   are the seeded hazards, with the real consequence.
//   containment   — drop cloth, masking film and door seal are ordered
//                   steps, and the gap that let overspray drift has to be
//                   found before the room is signed off.

const PS_PLASTER = 0xcfc6b4, PS_OLD_PAINT = 0xb8b39f, PS_FRESH = 0x7fa7c9, PS_STEEL = 0x8a949d;
const PS_BRAND = 0x6fb0e6, PS_FILM = 0xe6eef4, PS_CLOTH = 0xa89a7c, PS_WARN = 0xf2ae14, PS_GOOD = 0x59c97b;

export const ROOM_PAINT_SPRAYER = {
  id: "paint-sprayer",
  trade: "Painter / coatings applicator",
  title: "Coatings Bay",
  tagline: "Airless spray in a pre-1978 room: lead test, containment, tip, pressure, pattern, coverage, film build",
  category: "Surface Prep & Coatings",
  union: "IUPAT — International Union of Painters and Allied Trades; hazmat & environmental crews (LIUNA)",
  certification: "IUPAT — commercial & industrial coatings applicator; EPA RRP lead-safe work practices (40 CFR 745) on pre-1978 surfaces; HAZWOPER awareness (29 CFR 1910.120) for hazmat & environmental crews",
  accent: PS_BRAND,
  accentCss: "#6fb0e6",
  parSeconds: 265,
  // The shell this room builds, so the app can let the learner walk to the
  // walls instead of clamping them to a circle in the middle of the floor.
  size: { w: 14.6, d: 13.6 },
  spawn: { x: 0.0, z: 5.2, ry: 0 },
  badge: { id: "even-build", name: "Even Build", note: "A contained, lead-safe spray with an even film and no runs, holidays or drift" },

  hazards: {
    "sander": "You reached for the orbital sander before the paint was tested. This building is pre-1978 — dry-sanding untested paint puts lead dust in the air and on every surface in the room, and RRP makes that a violation before it's a health problem for the crew.",
    "tip-finger": "You went to clear the clogged tip with your finger over the orifice. An airless gun at 2,000 psi injects paint through skin into the hand — it looks like a pinprick and it's a surgical emergency. Trigger lock on, reverse the tip, clear it that way.",
    "space-heater": "That's a fuel-fired heater running in a room you're about to fill with atomised solvent-borne coating. An ignition source inside the containment is the one thing that turns a paint job into a flash fire.",
    "window-fan": "The box fan is blowing out the open window. Ventilation on this job is filtered negative air, not a fan pushing overspray and lead dust onto the neighbours' cars and the sidewalk.",
  },

  lateNotes: {
    "pressure-dial": "Not yet — the lead test, containment and PPE come before the pump is primed.",
    "spray-pass": "Set the tip, pressure and a clean test pattern before you spray the wall — a pass at the wrong settings is a wall you'll be sanding tomorrow.",
    "mil-gauge": "Nothing to measure yet. Make the pass first, then check the wet film.",
  },

  // Two things that happen while the applicator's hands are already full: the
  // building's own ventilation, and the atmosphere the spray itself creates.
  // See the interrupt layer in shared/game.js — they are not steps and they
  // do not change the procedure, they test whether you noticed while running it.
  interrupts: [
    {
      id: "negair-trips",
      kind: "Ventilation failure",
      after: "containment", delay: 4, seconds: 13,
      alert: "The negative-air machine at the door has tripped off. Air just stopped moving through the containment.",
      cue: "Get it running again before anything is mixed or opened.",
      target: "airscrubber-switch",
      why: "EPA RRP requires directional airflow that pulls air — and any lead dust or overspray riding in it — into the containment rather than pushing it out, and that only happens with the negative-air machine running. A dead unit turns a sealed room into an ordinary one that happens to have plastic on the walls, with nothing left keeping dust or overspray from finding the gap in the seal.",
      missNote: "You went on mixing material with the scrubber dead. For however long that ran, the containment did nothing — it was a room with plastic on it, and lead dust and overspray had exactly as much chance of drifting out as if the tarps had never gone up.",
      wrongNote: "That's not the scrubber. It's the boxy unit by the door with the intake grille — the fan that actually stopped is on it.",
    },
    {
      id: "vapor-heater",
      kind: "Atmosphere alarm",
      after: "coverage", delay: 3, seconds: 12,
      alert: "The combustible-gas monitor by the door just alarmed — solvent vapour from the spray is building up faster than the scrubber is clearing it, and the space heater is still lit in the same room.",
      cue: "Kill the heater before that reading climbs any further.",
      target: "heater-cutoff",
      why: "HAZWOPER awareness training exists for exactly this: an atomised solvent-borne coating raises vapour concentration inside a sealed room fast, and an open flame or a glowing element is the one thing that turns that cloud into a flash fire. The alarm buys you the seconds it takes to remove the ignition source — it does not buy you time to keep spraying first.",
      missNote: "You kept spraying with a live heater in a room the gas monitor had already flagged. Solvent vapour looking for somewhere to ignite found the element still glowing in the corner, and that is the difference between a bad smell and a flash fire.",
      wrongNote: "That's not the heater switch. It's on the base of the red cylindrical unit against the wall, and it needs to go off, not the pump.",
    },
  ],

  steps: [
    {
      id: "workorder", kind: "select", target: "spec-sheet",
      title: "Read the coating spec",
      cue: "Check the build year, the product, the tip size and the film thickness the spec calls for.",
      why: "The spec says 1962 construction, waterborne acrylic, a 517 tip and four to six mils wet, and every one of those numbers changes how the first hour of the job goes. A pre-1978 building triggers EPA RRP before a drop cloth is even down, so the spec gets read in full before anything touches the wall.",
    },
    {
      id: "leadtest", kind: "select", target: "lead-swab",
      title: "Test the old paint for lead",
      cue: "Swab the existing paint before any surface is sanded or scraped.",
      why: "Pre-1978 means presumed lead until a swab says otherwise, and EPA RRP treats that presumption as binding: a positive result turns this from an ordinary paint job into a lead-safe job with containment, HEPA vacuuming and a cleaning verification before anyone signs off. That decision has to happen before the first surface is disturbed, because once dust is airborne it cannot be un-released.",
    },
    {
      id: "containment", kind: "sequence",
      targets: ["drop-cloth", "masking-film", "door-seal"],
      itemNames: { "drop-cloth": "drop cloth", "masking-film": "masking film", "door-seal": "door seal" },
      title: "Contain the room",
      cue: "Drop cloth down first, then mask the fixtures and window, then seal the door.",
      why: "Floor first, because everything else in the room sheds onto it. Masking next, while you can still walk on a clean floor without tracking dust into it. The door seal comes last, because it's what turns a masked room into a contained one — sealing it first means carrying film in and out through the one gap you were trying to close.",
      outOfOrderNote: "Wrong order — floor, then masking, then the door seal that closes the containment.",
    },
    {
      id: "ppe", kind: "sequence", anyOrder: true,
      targets: ["respirator", "coveralls"],
      itemNames: { "respirator": "half-mask respirator", "coveralls": "disposable coveralls" },
      title: "Respirator and coveralls",
      cue: "P100 half-mask and coveralls on before the pump is primed.",
      why: "Airless atomises coating into a respirable mist immediately, and on a lead-safe job the coveralls are what keep dust from riding out of the room on your clothes and into your car, your kitchen, or anywhere else you sit down. Both go on before the pump has pressure in it — putting them on afterward means you already breathed the first several seconds of spray.",
    },
    {
      id: "strain", kind: "select", target: "strainer",
      title: "Strain the material",
      cue: "Pour the coating through the strainer into the pump bucket.",
      why: "A skin or a dried lump left in the can becomes the clogged tip you'll be tempted to clear with a bare finger ten minutes into the job — and at working pressure that isn't a paint mess, it's an injection injury. Straining the material now removes the debris before the pump ever has the chance to force it through the orifice.",
    },
    {
      id: "tip", kind: "select", target: "tip-517",
      title: "Fit the 517 tip",
      cue: "Take the 517 — a 10-inch fan at a 0.017 orifice — for a broad wall with this product.",
      why: "The first digit of a spray tip number is roughly half the fan width in inches, and the last two are the orifice in thousandths — a 211 is a narrow trim tip that would take all day on this wall and stripe every pass, and a 619 floods this coating on thick enough to sag before it flashes. The spec called out 517 for this product and this wall for a reason.",
    },
    {
      id: "pressure", kind: "gauge", target: "pressure-dial",
      title: "Set the fluid pressure",
      cue: "Dial the pump until the pattern atomises fully without tails.",
      why: "Fluid pressure is set to the lowest reading that still atomises the coating cleanly, not to whatever feels forceful on the trigger. Run it too low and the pattern fingers at the edges instead of laying flat; run it too high and the gun turns more of the can into airborne overspray than it does into film on the wall, which is also more solvent vapour loose inside a sealed room.",
      gauge: {
        label: "FLUID PSI", speed: 0.75, green: [0.5, 0.66],
        readout: (t) => `${Math.round(800 + t * 2400)} psi`,
        missNote: "Off the band — tails at the low end, overspray at the top. Reset and find the lowest pressure that atomises clean.",
      },
    },
    {
      id: "pattern", kind: "gauge", target: "test-card",
      title: "Shoot a test pattern",
      cue: "Spray the card at working distance and commit when the pattern is even edge to edge.",
      why: "The test card shows exactly what the wall is about to get, before it gets it: an hourglass shape means the tails aren't atomising and will show up as light stripes, and a heavy centre means the gun is too close and will lay the coat on thick enough to sag. Fixing the distance and pressure on a piece of cardboard costs nothing; fixing the same fault on the client's wall means resanding and respraying.",
      gauge: {
        label: "PATTERN", speed: 0.7, green: [0.42, 0.6],
        readout: (t) => (t < 0.42 ? "tails" : t > 0.6 ? "heavy centre" : "even"),
        missNote: "Pattern's not even — adjust distance and pressure, then shoot the card again.",
      },
    },
    {
      id: "coverage", kind: "track", target: "spray-pass", seconds: 8,
      title: "Spray the wall",
      cue: "Hold the trigger, keep the gun square, and hold a steady 50% overlap at gun speed for the whole pass.",
      why: "Coverage is overlap and gun speed acting together, not either one alone: each pass needs to fall half over the last, at the speed that lays four to six wet mils. Slow the pass down at that overlap and the film sags before it flashes; speed it up at the same overlap and it goes on thin enough to leave holidays the primer shows straight through. The overlap gauge is the only way to hold both at once.",
      track: { start: 0.1, green: [0.42, 0.62], rise: 0.6, fall: 0.5, drift: 0.12, label: "OVERLAP", readout: (v) => `${Math.round(v * 100)}%` },
      holdBreakNote: "Trigger let go mid-pass — the lap line shows and you'll be feathering it. Pick the pass back up.",
    },
    {
      id: "film", kind: "gauge", target: "mil-gauge",
      title: "Check the wet film",
      cue: "Set the wet-film gauge on the fresh coat and commit inside the spec band.",
      why: "Four to six mils wet is the spec, and the gauge is the only honest reading of it — not how the coat looks under the work light, which flatters a film that's already too thin. Come in under that band and the coat won't hide the substrate or hold up over time; go over it and gravity wins before the coating flashes, sagging in exactly the runs a wet-film check would have caught first.",
      gauge: {
        label: "WET PS_FILM", speed: 0.7, green: [0.4, 0.6],
        readout: (t) => `${(t * 10).toFixed(1)} mils`,
        missNote: "Outside the spec band — thin holidays or a sag waiting to happen. Check the pass and measure again.",
      },
    },
    {
      id: "driftcheck", kind: "find", noHint: true,
      targets: ["film-gap"],
      itemNames: { "film-gap": "gap in the masking film" },
      itemNotes: { "film-gap": "The masking lifted at the window frame and there's a fog of overspray on the glass and the sill outside it. That's the drift the walk-down exists to catch — and on a lead-safe job, it's what the cleaning verification would fail on." },
      title: "Walk down the containment",
      cue: "Check the masking line and click where overspray got past it.",
      why: "A wall that looks even doesn't prove the containment held — overspray finds the smallest gap in the masking and rides straight through it, silently, while you're still inside looking at the wall you just finished. Walking the masking edge and finding that gap is what goes on the RRP cleaning verification, not an assumption made from inside the mist.",
    },
  ],

  build(root) {
    // The shell, the fittings and the shop furniture never move and are
    // never clicked, so they go in one group that is baked into a handful
    // of meshes at the end of the build. See mergeStatic in shared/kit.js.
    const fixed = group(root);
    const hits = {};
    const reg = (obj, id) => { markInteractive(obj, id); hits[id] = obj; return obj; };

    shell(fixed, {
      w: 14.6, d: 13.6, h: 3.9,
      floor: 0x6b5e4d, wall: 0xd8d0c0, ceiling: 0xe8e2d6,
      floorRough: 0.9, skirtColor: 0x4a4038,
          walkway: { lane: 0x4f88b8, hatch: 0x8f8778 },
      trim: 0x3f6f99, structure: "trusses", structureColor: 0x8a8577, door: "shutter",
});

    // -------------------------------------------------------- the old wall
    const wallGrp = group(root, 0, 0, -4.1);
    box(wallGrp, 8.6, 2.9, 0.16, 0, 1.45, 0, PS_PLASTER, { rough: 0.96 });
    // The coat goes on as a decal that fills top-down with the coverage pass.
    const coatFace = decal(wallGrp, 7.2, 2.3, -0.4, 1.4, 0.1, (g, w, h) => {
      g.fillStyle = "#b8b39f"; g.fillRect(0, 0, w, h);
      g.fillStyle = "#a9a48f"; for (let i = 0; i < 12; i++) g.fillRect((i * 97) % w, (i * 53) % h, 40, 6);
    }, { px: 512 });
    let coatFrac = 0, sagged = false;
    function paintCoat(frac) {
      coatFrac = frac;
      repaint(coatFace, (g, w, h) => {
        g.fillStyle = "#b8b39f"; g.fillRect(0, 0, w, h);
        g.fillStyle = "#a9a48f"; for (let i = 0; i < 12; i++) g.fillRect((i * 97) % w, (i * 53) % h, 40, 6);
        g.fillStyle = "#7fa7c9"; g.fillRect(0, 0, w, h * frac);
        if (frac > 0 && frac < 1) { g.fillStyle = "rgba(255,255,255,0.35)"; g.fillRect(0, h * frac - 3, w, 6); }
        if (sagged) {
          g.fillStyle = "#5f86a8";
          for (let i = 0; i < 4; i++) { g.fillRect(w * 0.2 + i * 90, h * 0.5, 6, h * 0.35); g.fillRect(w * 0.2 + i * 90 - 6, h * 0.82, 18, 8); }
        }
      });
    }
    paintCoat(0);
    // Window at the right end of the wall, with the masking film over it.
    const windowGrp = group(wallGrp, 3.3, 1.55, 0.09);
    box(windowGrp, 1.3, 1.2, 0.06, 0, 0, 0, 0xf1ece2, { rough: 0.6 });
    box(windowGrp, 1.1, 1.0, 0.02, 0, 0, 0.04, 0xa9c6da, { rough: 0.15, metal: 0.2 });
    const maskFilm = box(windowGrp, 1.4, 1.3, 0.01, 0, 0, 0.08, PS_FILM, { rough: 0.3, opacity: 0.55, transparent: true });
    maskFilm.visible = false;
    // The lifted corner — the find target — only reachable once the film is up.
    const filmGap = box(windowGrp, 0.3, 0.3, 0.02, 0.55, -0.5, 0.1, PS_FILM, { rough: 0.3, opacity: 0.7, transparent: true });
    filmGap.rotation.z = 0.5; filmGap.visible = false;
    reg(filmGap, "film-gap");
    const driftFog = slab(windowGrp, 0.5, 0.4, 0.01, 0.6, -0.35, 0.05, 0x7fa7c9, { rough: 0.5, opacity: 0.35, transparent: true, cast: false });
    driftFog.visible = false;
    reg(maskFilm, "masking-film");
    // Spray-pass pane in front of the wall.
    const passPane = box(root, 7.0, 2.3, 0.2, -0.4, 1.4, -3.8, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    reg(passPane, "spray-pass");

    // Box fan in the open window — hazard.
    const fanGrp = group(root, 4.0, 0, -3.6, -Math.PI / 2);
    box(fanGrp, 0.5, 0.5, 0.12, 0, 0.9, 0, 0x2b2f34, { rough: 0.6 });
    const fanBlades = group(fanGrp, 0, 0.9, 0.07);
    for (let i = 0; i < 4; i++) { const b = box(fanBlades, 0.06, 0.4, 0.01, 0, 0, 0, 0x9aa1a8, { rough: 0.4, metal: 0.5 }); b.rotation.z = (i * Math.PI) / 4; }
    reg(fanGrp, "window-fan");

    // -------------------------------------------------------------- door
    const doorGrp = group(root, -4.35, 0, 1.2, Math.PI / 2);
    box(doorGrp, 0.95, 2.1, 0.08, 0, 1.05, 0, 0x8b6a42, { rough: 0.8 });
    ball(doorGrp, 0.03, 0.38, 1.0, 0.06, 0xc9a227, { rough: 0.35, metal: 0.8 });
    const doorSeal = box(doorGrp, 1.1, 2.25, 0.02, 0, 1.12, 0.07, PS_FILM, { rough: 0.3, opacity: 0.5, transparent: true });
    doorSeal.visible = false;
    const doorZone = box(doorGrp, 1.1, 2.25, 0.12, 0, 1.12, 0.06, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    reg(doorZone, "door-seal");

    // Negative-air machine beside the doorway — the unit that keeps the
    // containment's airflow pulling in rather than pushing out. Its switch is
    // a separate control from the body of the unit, the same split welding
    // uses between a hazard/interrupt target and the step's own control.
    const scrubber = group(root, -3.5, 0, 2.35, 0.35);
    box(scrubber, 0.5, 0.85, 0.42, 0, 0.42, 0, 0x2b2f34, { rough: 0.55, metal: 0.35 });
    for (let i = 0; i < 5; i++) box(scrubber, 0.38, 0.02, 0.01, 0, 0.24 + i * 0.08, 0.22, 0x14171a, { rough: 0.6, cast: false });
    const scrubFanBlades = group(scrubber, 0, 0.5, 0.2);
    for (let i = 0; i < 4; i++) { const b = box(scrubFanBlades, 0.14, 0.006, 0.05, 0, 0, 0, 0x6f767d, { rough: 0.4, metal: 0.7, cast: false }); b.rotation.z = (i * Math.PI) / 2; }
    const scrubLamp = ball(scrubber, 0.02, 0.16, 0.78, 0.22, 0x59c97b, { emissive: 0x59c97b, ei: 2 });
    decal(scrubber, 0.4, 0.09, 0, 0.9, 0.22, signFace("NEGATIVE AIR", { bg: "#1f2429", accent: "#6fb0e6", scale: 0.42 }));
    const scrubSwitchBox = group(scrubber, 0.28, 0.55, 0.2);
    box(scrubSwitchBox, 0.07, 0.1, 0.03, 0, 0, 0, 0x1b1e22, { rough: 0.5 });
    const scrubSwitchLever = box(scrubSwitchBox, 0.02, 0.06, 0.015, 0, -0.01, 0.02, 0xf2ae14, { rough: 0.4, metal: 0.3 });
    reg(scrubSwitchLever, "airscrubber-switch");

    // ------------------------------------------------------------ spec board
    // Beside the work wall, so facing the first task also shows the wall the job is about.
    const board = group(root, 2.2, 0, -3.5, -0.3);
    box(board, 0.06, 1.5, 0.06, 0, 0.75, 0, PS_STEEL, { rough: 0.5, metal: 0.5 });
    decal(board, 0.62, 0.52, 0, 1.4, 0.04, paperFace("COATING SPEC — UNIT 4B", [
      "Building: 1962 — RRP applies", "Existing: test before disturbing",
      "Product: waterborne acrylic", "Tip: 517 · 10-in fan / .017",
      "Wet film: 4–6 mils, 1 coat", "Ventilation: filtered negative air",
    ]));
    reg(board, "spec-sheet");

    // ------------------------------------------------------ prep bench
    const bench = counter(root, 2.2, 0.6, 2.4, 2.8, 0x5b6672, { height: 0.88 });
    decal(bench, 1.6, 0.14, 0, 0.55, 0.31, signFace("PREP BENCH", { bg: "#1b1e22", accent: "#6fb0e6", scale: 0.5 }));
    // Lead test swab kit.
    const swab = group(bench, -0.8, 0.92, 0);
    box(swab, 0.18, 0.06, 0.12, 0, 0.03, 0, 0xd2312b, { rough: 0.5 });
    cyl(swab, 0.008, 0.008, 0.12, 0, 0.08, 0, 0xffffff, { rough: 0.6, seg: 8 }).rotation.z = Math.PI / 2;
    decal(swab, 0.16, 0.04, 0, 0.065, 0.061, signFace("LEAD TEST", { bg: "#d2312b", accent: "#ffffff", scale: 0.6 }));
    reg(swab, "lead-swab");
    // Orbital sander — the hazard.
    const sander = group(bench, -0.35, 0.92, 0);
    box(sander, 0.14, 0.08, 0.14, 0, 0.04, 0, 0x2b2f34, { rough: 0.6 });
    cyl(sander, 0.07, 0.07, 0.03, 0, 0.015, 0, 0xc48b3f, { rough: 0.9, seg: 16 });
    reg(sander, "sander");
    // Strainer over the pump bucket.
    const strainerGrp = group(bench, 0.15, 0.92, 0);
    cyl(strainerGrp, 0.11, 0.06, 0.12, 0, 0.06, 0, 0xffffff, { rough: 0.8, opacity: 0.8, transparent: true, seg: 14 });
    reg(strainerGrp, "strainer");
    // Tips in a tray: 211, 517 (answer), 619.
    const tray = group(bench, 0.7, 0.9, 0);
    box(tray, 0.5, 0.03, 0.16, 0, 0.015, 0, 0x2b2f34, { rough: 0.6 });
    const tipMeshes = {};
    for (const [id, dx, label] of [["tip-211", -0.16, "211"], ["tip-517", 0, "517"], ["tip-619", 0.16, "619"]]) {
      const tg = group(tray, dx, 0.05, 0);
      cyl(tg, 0.016, 0.02, 0.05, 0, 0, 0, 0x1b1e22, { rough: 0.4, metal: 0.4, seg: 10 });
      decal(tg, 0.06, 0.03, 0, 0.05, 0, signFace(label, { bg: "#6fb0e6", accent: "#0b1219", scale: 0.6 }));
      reg(tg, id);
      tipMeshes[id] = tg;
    }

    // ------------------------------------------------------- PPE + film
    const ppe = counter(root, 1.4, 0.6, -2.6, 2.8, 0x5b6672, { height: 0.88 });
    const resp = group(ppe, -0.35, 0.95, 0);
    box(resp, 0.16, 0.12, 0.1, 0, 0, 0, 0x2b2f34, { rough: 0.6 });
    for (const sx of [-1, 1]) cyl(resp, 0.04, 0.04, 0.03, sx * 0.09, -0.02, 0.04, 0xd2312b, { rough: 0.5, seg: 12 }).rotation.x = Math.PI / 2;
    reg(resp, "respirator");
    const coveralls = group(ppe, 0.3, 0.95, 0);
    box(coveralls, 0.28, 0.1, 0.2, 0, 0.05, 0, 0xffffff, { rough: 0.9 });
    decal(coveralls, 0.2, 0.05, 0, 0.11, 0, signFace("COVERALLS", { bg: "#ffffff", accent: "#1b1e22", scale: 0.55 })).rotation.x = -Math.PI / 2;
    reg(coveralls, "coveralls");
    // Drop cloth rolled on the floor; laid flat once the step completes.
    const cloth = group(root, -1.2, 0, 1.2);
    const clothRoll = cyl(cloth, 0.1, 0.1, 1.2, 0, 0.1, 0, PS_CLOTH, { rough: 0.95, seg: 14 });
    clothRoll.rotation.z = Math.PI / 2;
    const clothFlat = slab(root, 7.6, 0.01, 3.4, -0.2, 0.006, -2.2, PS_CLOTH, { rough: 0.95, cast: false });
    clothFlat.visible = false;
    reg(cloth, "drop-cloth");

    // ------------------------------------------------------- the pump
    const pump = group(root, 2.4, 0, -1.4, 0.4);
    box(pump, 0.5, 0.6, 0.4, 0, 0.35, 0, 0x2b2f34, { rough: 0.55, metal: 0.4 });
    cyl(pump, 0.06, 0.06, 0.4, -0.2, 0.2, 0.15, PS_STEEL, { rough: 0.35, metal: 0.8, seg: 12 });
    cyl(pump, 0.16, 0.16, 0.36, -0.42, 0.18, -0.1, 0x3a4048, { rough: 0.6, seg: 16 });
    const dialGrp = group(pump, 0.1, 0.7, 0.18);
    cyl(dialGrp, 0.05, 0.05, 0.04, 0, 0, 0, 0xb81410, { rough: 0.45, metal: 0.3, seg: 12 }).rotation.x = Math.PI / 2;
    const psiFace = decal(dialGrp, 0.2, 0.12, 0, 0.12, 0.02, signFace("0 psi", { bg: "#12191f", accent: "#6fb0e6", fg: "#dff0ff", scale: 0.55 }), { glow: true, ei: 0.6 });
    reg(dialGrp, "pressure-dial");
    hose(root, [[2.2, 0.5, -1.2], [1.4, 0.2, -0.6], [0.6, 0.3, -1.4], [0.2, 1.1, -2.6]], 0.014, 0x1b1e22, { steps: 22 });
    // The gun.
    const gunGrp = group(root, 0.2, 1.15, -2.6, -0.3);
    box(gunGrp, 0.05, 0.16, 0.06, 0, -0.1, 0.02, 0x2b2f34, { rough: 0.6 });
    cyl(gunGrp, 0.014, 0.014, 0.16, 0, 0, -0.08, PS_STEEL, { rough: 0.3, metal: 0.85, seg: 10 }).rotation.x = Math.PI / 2;
    const gunTip = cyl(gunGrp, 0.018, 0.018, 0.04, 0, 0, -0.18, 0x1b1e22, { rough: 0.4, seg: 10 });
    gunTip.rotation.x = Math.PI / 2;
    reg(gunTip, "tip-finger");
    const mist = particles(root, 110, PS_FRESH, { size: 0.018, life: 0.4, additive: false, opacity: 0.7 });

    // Test card on an easel beside the wall.
    const easel = group(root, -3.4, 0, -2.6, 0.5);
    for (const sx of [-0.2, 0.2]) box(easel, 0.03, 1.6, 0.03, sx, 0.8, 0, 0x8b6a42, { rough: 0.8 });
    const card = decal(easel, 0.55, 0.42, 0, 1.2, 0.02, (g, w, h) => { g.fillStyle = "#c8b48c"; g.fillRect(0, 0, w, h); }, { px: 256 });
    box(easel, 0.6, 0.46, 0.01, 0, 1.2, 0.01, 0xc8b48c, { rough: 0.9 });
    reg(easel, "test-card");
    function paintPattern(t) {
      repaint(card, (g, w, h) => {
        g.fillStyle = "#c8b48c"; g.fillRect(0, 0, w, h);
        g.fillStyle = "#7fa7c9";
        const even = t >= 0.42 && t <= 0.6;
        const pinch = even ? 0 : t < 0.42 ? (0.42 - t) * 1.6 : 0;
        const heavy = t > 0.6 ? (t - 0.6) * 2 : 0;
        for (let y = 0; y < h; y += 4) {
          const k = Math.abs(y / h - 0.5) * 2;
          const wid = w * 0.5 * (1 - pinch * (1 - k)) * (1 - heavy * k * 0.7);
          g.fillRect(w / 2 - wid / 2, y, wid, 3);
        }
      });
    }
    // Wet-film gauge — a comb on the bench, moved to the wall for the check.
    const milGauge = group(root, -1.2, 1.3, -3.9);
    box(milGauge, 0.12, 0.06, 0.01, 0, 0, 0, 0xb9bec4, { rough: 0.35, metal: 0.7 });
    for (let i = 0; i < 6; i++) box(milGauge, 0.008, 0.02 + i * 0.003, 0.01, -0.045 + i * 0.018, -0.04, 0, 0xb9bec4, { rough: 0.35, metal: 0.7 });
    const milFace = decal(milGauge, 0.22, 0.08, 0, 0.09, 0.01, signFace("— mils", { bg: "#12191f", accent: "#6fb0e6", fg: "#dff0ff", scale: 0.55 }), { glow: true, ei: 0.5 });
    reg(milGauge, "mil-gauge");

    // Fuel-fired heater in the corner — hazard.
    const heater = group(root, -3.6, 0, -1.0, 0.6);
    cyl(heater, 0.18, 0.18, 0.5, 0, 0.3, 0, 0xd2312b, { rough: 0.5, metal: 0.3, seg: 16 });
    cyl(heater, 0.14, 0.14, 0.06, 0, 0.58, 0, 0x2b2f34, { rough: 0.6, seg: 16 });
    const glow = ball(heater, 0.08, 0, 0.3, 0.16, 0xff7a2a, { emissive: 0xff7a2a, ei: 1.6, rough: 0.5 });
    reg(heater, "space-heater");
    // The heater's own cutoff, a separate control from the body of the unit —
    // the object the vapor-heater interrupt actually wants, so answering it
    // is not the same click that a hazard pick on the heater itself would be.
    const heaterCutoff = box(heater, 0.05, 0.03, 0.02, 0.15, 0.32, 0.12, 0xf2ae14, { rough: 0.4, metal: 0.3 });
    reg(heaterCutoff, "heater-cutoff");

    const key = new THREE.DirectionalLight(0xfff2dc, 0.95);
    key.position.set(2, 5.5, 3);
    key.castShadow = true;
    key.shadow.mapSize.set(1024, 1024);
    key.shadow.camera.left = -6; key.shadow.camera.right = 6;
    key.shadow.camera.top = 6; key.shadow.camera.bottom = -6;
    root.add(key);
    root.add(new THREE.HemisphereLight(0xe8e2d6, 0x4a4038, 1.2));

    // The bay is 14.6m by 13.6m now. Push the workstations out to match, so
    // the extra floor is distance between jobs rather than empty ring.
    spreadLayout(root, 1.62);

    const W = 14.6, D = 13.6;
    // ------------------------------------------------- the rest of the bay
    // A coatings bay keeps its tins, thinners and filters out of the booth,
    // its mixing bench downwind, and its waste segregated because most of it
    // is hazardous.
    racking(fixed, -W / 2 + 0.55, -2.2, Math.PI / 2, { w: 3.0, h: 2.2, frame: 0x9c7a4a, stock: [0x4f88b8, 0xc9bfa8, 0x8a7a5e, 0x6b7480] });
    sideBench(fixed, -3.4, 4.2, 0.2, { w: 2.6, top: 0x8a7f6a });
    bottleRack(fixed, W / 2 - 0.9, -3.8, -Math.PI / 2, { count: 4, colors: [0xb0902f, 0x8a3a2f, 0xb0902f, 0x2f4a63] });
    spillStation(fixed, W / 2 - 1.2, 3.4, -0.9, { color: 0xc0392b });
    wasteBin(fixed, W / 2 - 2.2, 4.4, -0.7, { color: 0xb03a2f, lid: 0x8c2c22, label: "Hazardous" });
    noticeBoard(fixed, 1.2, D / 2 - 0.25, Math.PI, { w: 1.7 });
    shopFan(fixed, -4.4, 1.2, 0.9, { tilt: 0.28 });

    // A masker working the far wall and a mixer at the bench, both in the
    // same respiratory protection the learner is being assessed on.
    const crew = [
      bayCrew(root, -4.9, -3.2, 0.99, { task: "overhead", cloth: 0xd8d0c0, legs: 0x8a7f6a, hiVis: false, hat: 0xf2f2f2 }),
      bayCrew(root, 5.1, 2.8, -2.07, { task: "bench", cloth: 0xd8d0c0, legs: 0x8a7f6a, hiVis: false, hat: 0xf2f2f2 }),
    ];

    // Fittings on a grid sized to this floor, plus the bounce a real room
    // has and this one did not: see ceilingGrid in shared/kit.js.
    ceilingGrid(fixed, 14.6, 13.6, { color: 0xfff6e8, ei: 1.25, lamp: 1.45, y: 3.74 });

    mergeStatic(fixed);

    let airscrubberOn = false;
    let heaterOn = true;

    return {
      hits,
      spawnLook: new THREE.Vector3(-0.4, 1.3, -4.0),

      onStep() {},

      onStepComplete(step) {
        if (step.id === "leadtest") {
          decal(swab, 0.16, 0.04, 0, 0.065, 0.061, signFace("POSITIVE — Pb", { bg: "#7a0f0f", accent: "#ffd0d0", scale: 0.55 }));
        }
        if (step.id === "containment") {
          clothRoll.visible = false; clothFlat.visible = true;
          maskFilm.visible = true; doorSeal.visible = true;
          filmGap.visible = true; driftFog.visible = true;
          // The scrubber comes on with the rest of containment — a sealed
          // room with no negative air running is just a room with plastic on it.
          airscrubberOn = true;
          scrubLamp.material = mat(0x59c97b, { emissive: 0x59c97b, ei: 2 });
        }
        if (step.id === "tip") {
          const tip = tipMeshes["tip-517"];
          tip.parent.remove(tip);
          gunGrp.add(tip);
          tip.position.set(0, 0.03, -0.18);
          tip.rotation.set(0, 0, 0);
        }
        if (step.id === "coverage") paintCoat(1);
        if (step.id === "film") sagged = false;
        if (step.id === "driftcheck") { driftFog.visible = false; filmGap.rotation.z = 0; }
      },

      onHazard(hitId) {
        if (hitId === "tip-finger") {
          mist.visible = true;
          mist.userData.step(0.05, new THREE.Vector3(0.2, 1.15, -2.8), 0.05, 2.5, -2);
        }
      },

      // An interruption the learner can see, not just read: the scrubber fan
      // visibly stops and its lamp goes red, or the heater's glow keeps
      // burning red instead of the cutoff switching it dark.
      onInterrupt(it) {
        if (it.id === "negair-trips") {
          airscrubberOn = false;
          scrubLamp.material = mat(0xf0645b, { emissive: 0xf0645b, ei: 2 });
        }
        if (it.id === "vapor-heater") {
          glow.material = mat(0xff2a2a, { emissive: 0xff2a2a, ei: 2.2, rough: 0.5 });
        }
      },
      onInterruptEnd(it) {
        // Only put it right if it was actually answered.
        if (it.resolved !== "answered") return;
        if (it.id === "negair-trips") {
          airscrubberOn = true;
          scrubLamp.material = mat(0x59c97b, { emissive: 0x59c97b, ei: 2 });
        }
        if (it.id === "vapor-heater") {
          heaterOn = false;
          glow.visible = false;
        }
      },

      animate(t, dt, session) {

        breatheCrew(crew, t);
        if (airscrubberOn) scrubFanBlades.rotation.z += dt * 9;
        scrubLamp.material.emissiveIntensity = 1.4 + Math.sin(t * 3) * 0.5;
        if (heaterOn) glow.material.emissiveIntensity = 1.3 + Math.sin(t * 9) * 0.4;
        const step = session?.step;
        const spraying = !!(step && step.id === "coverage" && session.holding);
        if (spraying) {
          mist.visible = true;
          const tr = session.track;
          const frac = tr ? Math.min(1, tr.inBand / (step.seconds || 8)) : 0;
          const y = 2.45 - frac * 2.1;
          gunGrp.position.set(Math.sin(t * 2.4) * 3.0 - 0.4, y, -2.9);
          mist.userData.step(dt, new THREE.Vector3(gunGrp.position.x, y, -3.7), 0.2, 1.2, -0.6);
          if (tr) paintCoat(frac);
        } else if (mist.visible && step?.id !== "tip-finger") {
          mist.visible = false;
        }
        fanBlades.rotation.z += dt * 12;

        const g = session?.gauge;
        if (g && !g.committed) {
          if (step?.id === "pressure") {
            const psi = Math.round(800 + g.t * 2400);
            dialGrp.children[0].rotation.z = g.t * Math.PI * 2;
            repaint(psiFace, signFace(`${psi} psi`, {
              bg: "#12191f", accent: g.t >= 0.5 && g.t <= 0.66 ? "#59c97b" : "#f2ae14", fg: "#dff0ff", scale: 0.55,
            }));
          }
          if (step?.id === "pattern") paintPattern(g.t);
          if (step?.id === "film") {
            const mils = (g.t * 10).toFixed(1);
            repaint(milFace, signFace(`${mils} mils`, {
              bg: "#12191f", accent: g.t >= 0.4 && g.t <= 0.6 ? "#59c97b" : "#f2ae14", fg: "#dff0ff", scale: 0.55,
            }));
            sagged = g.t > 0.6;
            if (Math.floor(t * 4) !== Math.floor((t - dt) * 4)) paintCoat(coatFrac);
          }
        }
      },
    };
  },
};
