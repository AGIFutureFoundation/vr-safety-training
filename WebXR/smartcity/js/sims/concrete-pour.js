import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import { box, cyl, ball, slab, hose, group, decal, repaint, signFace, particles } from "../../../shared/kit.js";
import { CITY, stationPad, holoPanel, holoTag, cone, instrument, standingFigure, barrierPanel, reg } from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Concrete Pour VR — Construction & Structural Trades, station five.
// Placing a wall pour from a boom pump: the pre-pour walk that finds the
// uncapped rebar and the unbraced form, the slump and air test before a
// single yard goes in, the pump line whipping hazard nobody stands under,
// a placement rate the forms can actually take, vibration that consolidates
// without segregating, and a finish that does not get burned by troweling
// bleed water back in.

const CP_ACCENT = 0xc9c2b4;

export const SIM_CONCRETE_POUR = {
  id: "concrete-pour",
  index: "48",
  domain: "Construction & Structural Trades",
  trade: "Cement mason / concrete finisher and laborer",
  category: "Construction & Structural Trades",
  weather: "overcast",
  certification: "OPCMIA cement masons and LIUNA laborers; ACI Concrete Field Testing Technician Grade I (slump ASTM C143, air C231, cylinders C31); OSHA 29 CFR 1926 Subpart Q concrete and masonry (1926.701 impalement protection, 1926.703 formwork); ACI 347 formwork pressure and OSHA 1926.1153 respirable crystalline silica",
  name: "Concrete Pour",
  title: simTitle("Concrete Pour"),
  tagline: "Wall pour from a boom pump: pre-pour walk, rebar capped and forms braced, slump and air tested before the first yard, nobody under the boom, placement rate inside the form pressure, vibrated not segregated, cylinders cast, finish on the clock",
  accent: CP_ACCENT,
  accentCss: "#c9c2b4",
  parSeconds: 280,
  footprint: 2.6,
  badge: { id: "clean-placement", name: "Clean Placement", note: "A pour tested before it started, placed inside the form's rate and consolidated without segregating — first time" },

  game: system({
    name: "Placement Crew",
    currency: "YARD",
    ranks: ["Laborer", "Finisher", "Cement Mason", "Pour Foreman", "Placement Crew Certified"],
    badges: [
      { id: "walked-it-first", name: "Walked It First", note: "The pre-pour walk found the defects before the truck arrived, first time", test: AWARD.stepClean("prepour") },
      { id: "nobody-under", name: "Nobody Under the Boom", note: "Never under the line, never on unbraced form, never a dry cut", test: AWARD.safe },
      { id: "to-the-mix", name: "To the Mix Design", note: "Slump and placement rate both inside the band", test: AWARD.precise(0.7) },
    ],
    challenges: [
      { id: "clean-pour", name: "Clean Pour", note: "No corrections anywhere in the placement", test: AWARD.clean },
      { id: "steady-lift", name: "Steady Lift", note: "The placement rate held for the whole lift", test: AWARD.unbroken },
      { id: "before-set", name: "Ahead of the Set", note: "Placed and finished inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "under-the-boom": "You stood under the pump boom with the line charged. A plugged line clears as a whip: the hose end swings hard enough to kill, and the plug lets go without warning when the pressure finally breaks it.",
    "uncapped-rebar": "You worked over uncapped vertical rebar. A fall of any height onto an uncapped bar is an impalement; the caps are rated for it and they cost less than the ambulance.",
    "overfill-forms": "You kept placing after the forms started to bow. Formwork fails all at once, not gradually, and it buries whoever is inside the pour line under tonnes of wet concrete.",
    "dry-cut-silica": "You dry-cut the hardened spill with no water and no vacuum. Cutting concrete dry puts respirable crystalline silica in the air at many times the permissible limit, and silicosis does not get better.",
  },

  lateNotes: {
    "pump-remote": "Placement starts once the pre-pour walk is clear, the mix is tested and the crew is clear of the boom.",
    "vibrator": "Vibration follows placement — consolidating air that has not been placed yet does nothing.",
    "bull-float": "Finishing starts after the bleed water has come and gone; troweling it back in is what burns a slab.",
  },

  steps: [
    {
      id: "plan", kind: "select", target: "pour-card",
      title: "Read the pour card",
      cue: "Check the mix design, the lift height, the placement rate the forms are designed for and today's weather hold.",
      why: "Formwork is engineered for a rate of rise, not a volume. The card carries that number, the mix, and the temperature window the pour is allowed in.",
    },
    {
      id: "prepour", kind: "find", noHint: true,
      targets: ["bare-rebar", "loose-brace", "form-debris"],
      itemNames: { "bare-rebar": "uncapped vertical rebar", "loose-brace": "unpinned form brace", "form-debris": "debris in the form" },
      itemNotes: {
        "bare-rebar": "A run of vertical bar is uncapped where the crew will be working over it.",
        "loose-brace": "A kicker brace on the second panel has no pin in it — that panel is carrying nothing.",
        "form-debris": "There is sawdust and a tie wire bundle in the bottom of the form, which becomes a cold void in the wall.",
      },
      title: "Walk the pour before the truck arrives",
      cue: "Walk the formwork and the deck and click every defect you find.",
      why: "Everything found now is a five-minute fix. The same things found once concrete is moving are a stopped pour, a cold joint, or somebody in the ambulance.",
    },
    {
      id: "fix", kind: "sequence", anyOrder: true,
      targets: ["rebar-caps", "brace-pin", "blow-out"],
      itemNames: { "rebar-caps": "rebar caps fitted", "brace-pin": "brace pinned", "blow-out": "form blown out" },
      title: "Correct what the walk found",
      cue: "Cap the bar, pin the brace, blow the debris out of the form.",
      why: "A defect found and not fixed is worse than one never found, because now the crew believes the walk was done.",
    },
    {
      id: "slump", kind: "gauge", target: "slump-cone",
      title: "Slump test the first truck",
      cue: "Take the slump off the first truck and commit inside the mix design's band.",
      why: "Slump is the check that the mix on site is the mix that was ordered. Too stiff will not fill the form; too wet has had water added on site and has lost the strength the engineer specified.",
      gauge: { label: "SLUMP", speed: 0.7, green: [0.4, 0.58], readout: (t) => `${(t * 10).toFixed(1)} in`, missNote: "Outside the design slump — reject the load or have it adjusted with admixture, not with a hose." },
    },
    {
      id: "air", kind: "sequence",
      targets: ["air-meter", "cast-cylinders"],
      itemNames: { "air-meter": "air content measured", "cast-cylinders": "test cylinders cast" },
      title: "Air content and cylinders",
      cue: "Run the air meter, then cast the test cylinders for the lab.",
      why: "Entrained air is what survives a freeze-thaw winter, and the cylinders are the only proof of strength anyone will have in twenty-eight days. Both are taken from the same load, before placement.",
      outOfOrderNote: "Air first, then the cylinders — the cylinders record the mix that was measured.",
    },
    {
      id: "clear", kind: "select", target: "boom-zone",
      title: "Clear the boom zone",
      cue: "Move the crew out from under the boom and the line before the pump is charged.",
      why: "The zone under a charged line is the one place on a pour nobody has a reason to be. A plug clears as a whip, and it does it when the pressure finally breaks it, not when you are watching.",
    },
    {
      id: "place", kind: "track", target: "pump-remote", seconds: 7,
      title: "Place the first lift",
      cue: "Run the pump at a rate the forms can take, filling in even lifts around the wall.",
      why: "The rate of rise is what sets the pressure on the form. Placing fast in one corner is how a wall form blows, and it is the most common formwork failure there is.",
      track: { start: 0.1, green: [0.34, 0.54], rise: 0.6, fall: 0.5, drift: 0.12, label: "RATE OF RISE", readout: (v) => (v < 0.34 ? "cold joint risk" : v > 0.54 ? "over the form pressure" : "inside the design rate") },
      holdBreakNote: "Rate out of band — either the lift is going cold or the form is over pressure. Bring it back and hold.",
    },
    {
      id: "vibrate", kind: "hold", target: "vibrator", seconds: 5,
      title: "Consolidate the lift",
      cue: "Hold the vibrator in, straight down, long enough for the surface to close — then out slowly.",
      why: "Vibration drives out entrapped air; over-vibration drives the aggregate down and the paste up, which is segregation. Straight in, straight out, and never used to move concrete sideways.",
      holdBreakNote: "You pulled out early — the lift has voids in it that will show as honeycomb when the form comes off.",
    },
    {
      id: "joint", kind: "turn", target: "joint-key",
      title: "Set the construction joint key",
      cue: "Wind the joint key down into the top of the lift before it takes its set.",
      why: "The key is what makes the next lift act as one wall with this one. It goes in while the concrete is still plastic, and the surface is roughened and cleaned before the next pour.",
      turn: { turns: 1, axis: "y", label: "JOINT KEY" },
    },
    {
      id: "bleed", kind: "gauge", target: "bleed-check",
      title: "Wait out the bleed water",
      cue: "Watch the surface and commit when the bleed water has gone and the sheen has left it.",
      why: "Finishing while bleed water is on the surface works that water back into the top, and the top is the part that has to last. This is the single most common way a slab is ruined.",
      gauge: { label: "SURFACE", speed: 0.7, green: [0.52, 0.68], readout: (t) => (t < 0.52 ? "still bleeding" : t > 0.68 ? "going off" : "sheen gone, ready"), missNote: "Too early or too late — too early works water in, too late and you are tearing the surface." },
    },
    {
      id: "finish", kind: "sequence",
      targets: ["bull-float", "edge-tool", "cure-blanket"],
      itemNames: { "bull-float": "bull float", "edge-tool": "edger and jointer", "cure-blanket": "curing applied" },
      title: "Float, edge and cure",
      cue: "Bull float, then edge and joint, then get the cure on.",
      why: "Curing is not cleanup, it is the last structural step: concrete that dries instead of curing loses a large part of its strength and crazes on the surface.",
      outOfOrderNote: "Float, then edge and joint, then cure — each one works the surface the last one left.",
    },
    {
      id: "cleanup", kind: "drag", target: "wet-saw",
      title: "Cut the hardened spill wet",
      cue: "Bring the wet saw with its water feed to the spill on the slab edge.",
      why: "Cutting concrete dry is a silica exposure many times over the limit. Water on the blade or a vacuum shroud is not optional, and it is the difference between a nuisance and silicosis.",
      drag: { to: "spill-socket", radius: 0.45, missNote: "Not on the spill — set the saw down square on the hardened edge." },
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.6, CP_ACCENT);
    box(g, 6.2, 0.1, 5.2, 0, 0.05, 0, 0x55585c, { rough: 0.95 });
    // The wall form: two panel faces with walers, ties and kicker braces.
    const form = group(g, -0.6, 0.1, -1.2);
    const faces = [];
    for (const sx of [-1, 1]) {
      const face = box(form, 3.6, 2.0, 0.08, 0, 1.0, sx * 0.3, 0xb89a6a, { rough: 0.85 });
      faces.push(face);
      for (let i = 0; i < 3; i++) box(form, 3.7, 0.1, 0.1, 0, 0.45 + i * 0.6, sx * 0.38, 0x8b98a5, { rough: 0.5, metal: 0.6 });
    }
    for (let i = -2; i <= 2; i++) cyl(form, 0.012, 0.012, 0.76, i * 0.7, 1.5, 0, 0x8b98a5, { rough: 0.5, metal: 0.7, seg: 6 }).rotation.x = Math.PI / 2;
    const braces = [];
    for (const [bx, pinned] of [[-1.2, true], [0.2, false], [1.4, true]]) {
      const b = group(form, bx, 0, 0.35);
      const arm = cyl(b, 0.05, 0.05, 1.9, 0, 0.8, 0.6, 0x6b7885, { rough: 0.6, metal: 0.5, seg: 8 });
      arm.rotation.x = 0.85;
      const pin = box(b, 0.08, 0.08, 0.08, 0, 1.45, 0.1, pinned ? 0xf2c14b : 0x2b2f34, { rough: 0.6, metal: 0.4 });
      pin.visible = pinned;
      braces.push({ b, pin });
      if (!pinned) { reg(hits, b, "loose-brace"); holoTag(b, "brace", 0, 1.75, 0.3, { css: "#c9c2b4", w: 0.16 }); }
    }
    const bracePin = box(g, 0.1, 0.1, 0.1, 1.9, 0.2, 1.4, 0xf2c14b, { rough: 0.6, metal: 0.4 });
    holoTag(g, "brace pin", 1.9, 0.42, 1.4, { css: "#c9c2b4", w: 0.2 });
    reg(hits, bracePin, "brace-pin");
    const debris = box(form, 0.4, 0.06, 0.2, 0.9, 0.13, 0, 0x8a7a55, { rough: 0.95 });
    reg(hits, debris, "form-debris");
    const blower = cyl(g, 0.05, 0.05, 0.3, 2.2, 0.25, 1.1, 0x2b6fd8, { rough: 0.6, seg: 10 });
    holoTag(g, "blow the form out", 2.2, 0.48, 1.1, { css: "#c9c2b4", w: 0.36 });
    reg(hits, blower, "blow-out");
    const pourLevel = box(form, 3.4, 0.05, 0.5, 0, 0.14, 0, 0x8d8d8a, { rough: 0.9 });
    const overfill = box(form, 0.4, 0.5, 0.5, 1.7, 1.2, 0, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(form, "keep placing?", 1.7, 1.75, 0, { css: "#d2312b", w: 0.28 });
    reg(hits, overfill, "overfill-forms");
    // Rebar: a mat of verticals, some capped, one run bare.
    const rebar = group(g, -0.6, 0.1, -1.2);
    const caps = [];
    for (let i = -4; i <= 4; i++) {
      const bare = i >= 1 && i <= 3;
      cyl(rebar, 0.014, 0.014, 2.4, i * 0.38, 1.2, 0, 0x7a5c3a, { rough: 0.9, seg: 6 });
      const cap = ball(rebar, 0.05, i * 0.38, 2.42, 0, 0xf2703b, { rough: 0.8, seg: 10, seg2: 8 });
      cap.visible = !bare;
      caps.push({ cap, bare });
    }
    const bareHit = box(rebar, 1.2, 0.4, 0.3, 0.76, 2.4, 0, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, bareHit, "bare-rebar");
    // Standing on the deck over the uncapped run is its own unsafe action,
    // separate from spotting it on the walk.
    const overBare = box(rebar, 1.2, 0.9, 0.6, 0.76, 1.4, 0.5, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(rebar, "work over the bare bar?", 0.76, 0.9, 0.7, { css: "#d2312b", w: 0.44 });
    reg(hits, overBare, "uncapped-rebar");
    const capBox = group(g, 2.3, 0.1, 1.0);
    box(capBox, 0.4, 0.25, 0.3, 0, 0.13, 0, 0xf2703b, { rough: 0.8 });
    holoTag(capBox, "rebar caps", 0, 0.42, 0, { css: "#c9c2b4", w: 0.24 });
    reg(hits, capBox, "rebar-caps");
    // The boom pump: truck, outriggers, boom over the form, line.
    const pump = group(g, 2.6, 0.1, -2.2, -0.5);
    box(pump, 2.6, 0.8, 1.2, 0, 0.7, 0, 0x2b6fd8, { rough: 0.5, metal: 0.3 });
    for (const [x, z] of [[-0.9, -0.5], [0.9, -0.5], [-0.9, 0.5], [0.9, 0.5]]) cyl(pump, 0.3, 0.3, 0.25, x, 0.3, z, 0x1a1e23, { rough: 0.9, seg: 12 }).rotation.z = Math.PI / 2;
    for (const sx of [-1, 1]) { box(pump, 0.2, 0.15, 1.6, sx * 1.0, 0.45, 0, 0xf2c14b, { rough: 0.6, metal: 0.4 }); box(pump, 0.4, 0.1, 0.4, sx * 1.0, 0.05, 0.8, 0xf2c14b, { rough: 0.7 }); }
    const boom = group(pump, 0, 1.2, 0);
    const boomArm = box(boom, 0.3, 0.3, 4.4, 0, 1.4, -2.0, 0x2b6fd8, { rough: 0.5, metal: 0.4 });
    boomArm.rotation.x = -0.25;
    const line = hose(g, [[2.0, 2.6, -3.4], [0.6, 2.9, -2.4], [-0.4, 2.6, -1.6], [-0.6, 2.1, -1.2]], 0.07, 0x3a4550, { steps: 20, rough: 0.7 });
    const boomZoneRing = slab(g, 1.8, 0.01, 1.8, -0.6, 0.105, -0.2, 0xd2312b, { rough: 0.7, opacity: 0.2, transparent: true, cast: false });
    const underHit = box(g, 1.2, 1.6, 1.2, -0.6, 0.9, -0.2, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "stand under the line?", -0.6, 1.85, -0.2, { css: "#d2312b", w: 0.42 });
    reg(hits, underHit, "under-the-boom");
    const clearZone = slab(g, 2.0, 0.01, 1.0, 1.4, 0.105, 1.0, 0x59c97b, { rough: 0.7, opacity: 0.35, transparent: true, cast: false });
    holoTag(g, "crew clear of the boom", 1.4, 0.4, 1.0, { css: "#59c97b", w: 0.46 });
    reg(hits, clearZone, "boom-zone");
    const remote = box(g, 0.18, 0.26, 0.08, 1.1, 0.95, 0.2, 0x2b2f34, { rough: 0.6 });
    box(g, 0.1, 0.05, 0.03, 1.1, 1.04, 0.25, 0xf2c14b, { emissive: 0xf2c14b, ei: 0.9, rough: 0.4, cast: false });
    holoTag(g, "pump remote", 1.1, 1.22, 0.2, { css: "#c9c2b4", w: 0.26 });
    reg(hits, remote, "pump-remote");
    const flow = particles(g, 60, 0xa8a49a, { size: 0.035, life: 0.5, additive: false, opacity: 0.8 });
    // Test bench: slump cone, air meter, cylinder moulds.
    const bench = group(g, -2.4, 0.1, 0.9, 0.5);
    box(bench, 1.4, 0.75, 0.6, 0, 0.38, 0, 0x53606b, { rough: 0.7, metal: 0.3 });
    const slumpCone = cyl(bench, 0.06, 0.11, 0.3, -0.42, 0.9, 0, 0xb9bec4, { rough: 0.5, metal: 0.6, seg: 16, open: true });
    const slumpRead = instrument(bench, -0.42, 0.78, -0.22, { idle: "--.- in", color: 0xc9c2b4, w: 0.12, d: 0.18 });
    holoTag(bench, "slump cone", -0.42, 1.12, 0, { css: "#c9c2b4", w: 0.24 });
    reg(hits, slumpCone, "slump-cone");
    void slumpRead;
    const airMeter = cyl(bench, 0.1, 0.1, 0.22, 0.0, 0.86, 0, 0xf2c14b, { rough: 0.5, metal: 0.4, seg: 16 });
    cyl(bench, 0.04, 0.04, 0.05, 0.0, 1.0, 0, 0xdfe6ec, { rough: 0.4, seg: 12 });
    holoTag(bench, "air meter", 0.0, 1.14, 0, { css: "#c9c2b4", w: 0.22 });
    reg(hits, airMeter, "air-meter");
    const cyls = group(bench, 0.45, 0.78, 0);
    for (let i = 0; i < 3; i++) cyl(cyls, 0.05, 0.05, 0.2, (i - 1) * 0.13, 0.1, 0, 0x2b2f34, { rough: 0.7, seg: 12 });
    holoTag(bench, "test cylinders", 0.45, 1.06, 0, { css: "#c9c2b4", w: 0.3 });
    reg(hits, cyls, "cast-cylinders");
    // Tools: vibrator, joint key, float, edger, cure, wet saw, spill.
    const vib = group(g, 0.8, 0.1, -0.2, 0.3);
    cyl(vib, 0.03, 0.03, 1.5, 0, 0.75, 0, 0xf2c14b, { rough: 0.6, seg: 8 }).rotation.x = 0.4;
    box(vib, 0.2, 0.2, 0.3, 0, 1.45, -0.3, 0x2b2f34, { rough: 0.7 });
    holoTag(vib, "concrete vibrator", 0, 1.75, 0, { css: "#c9c2b4", w: 0.4 });
    reg(hits, vib, "vibrator");
    const key = group(form, 1.5, 2.05, 0);
    cyl(key, 0.05, 0.05, 0.3, 0, 0.2, 0, 0xb9bec4, { rough: 0.4, metal: 0.7, seg: 12 });
    box(key, 0.5, 0.06, 0.12, 0, 0, 0, 0xf2c14b, { rough: 0.6, metal: 0.4 });
    holoTag(key, "joint key", 0, 0.45, 0, { css: "#c9c2b4", w: 0.2 });
    reg(hits, key, "joint-key");
    const bleedPanel = instrument(g, -2.0, 0.6, -0.6, { idle: "--", color: 0xc9c2b4, w: 0.14, d: 0.22, ry: 0.4 });
    holoTag(g, "surface — bleed water", -2.0, 0.85, -0.6, { css: "#c9c2b4", w: 0.44 });
    reg(hits, bleedPanel, "bleed-check");
    const tools = group(g, -1.6, 0.1, 1.9, 0.2);
    box(tools, 1.2, 0.2, 0.5, 0, 0.1, 0, 0x2b2f34, { rough: 0.7 });
    const bullFloat = box(tools, 0.7, 0.04, 0.16, -0.25, 0.24, 0, 0xb9bec4, { rough: 0.4, metal: 0.6 });
    holoTag(tools, "bull float", -0.25, 0.45, 0, { css: "#c9c2b4", w: 0.22 });
    reg(hits, bullFloat, "bull-float");
    const edger = box(tools, 0.2, 0.05, 0.12, 0.2, 0.24, 0, 0xdfe6ec, { rough: 0.4, metal: 0.6 });
    holoTag(tools, "edger and jointer", 0.2, 0.45, 0, { css: "#c9c2b4", w: 0.36 });
    reg(hits, edger, "edge-tool");
    const blanket = box(tools, 0.35, 0.12, 0.35, 0.5, 0.28, 0, 0x2f7d4a, { rough: 0.9 });
    holoTag(tools, "curing blanket", 0.5, 0.52, 0, { css: "#c9c2b4", w: 0.3 });
    reg(hits, blanket, "cure-blanket");
    const saw = group(g, 2.5, 0.1, 2.2, -0.4);
    box(saw, 0.5, 0.25, 0.3, 0, 0.16, 0, 0xf2703b, { rough: 0.6 });
    cyl(saw, 0.16, 0.16, 0.02, 0.22, 0.2, 0, 0xb9bec4, { rough: 0.4, metal: 0.8, seg: 20 }).rotation.y = Math.PI / 2;
    cyl(saw, 0.04, 0.04, 0.2, -0.15, 0.32, 0, 0x2b6fd8, { rough: 0.5, seg: 10 });
    holoTag(saw, "wet saw — water feed", 0, 0.55, 0, { css: "#c9c2b4", w: 0.44 });
    reg(hits, saw, "wet-saw");
    const spill = slab(g, 0.7, 0.05, 0.5, -2.2, 0.12, -1.8, 0x9a958c, { rough: 0.95 });
    const spillSocket = box(g, 0.6, 0.04, 0.45, -2.2, 0.18, -1.8, 0xffffff, { rough: 0.5 });
    spillSocket.visible = false; hits["spill-socket"] = spillSocket;
    holoTag(g, "hardened spill", -2.2, 0.4, -1.8, { css: "#c9c2b4", w: 0.28 });
    const dryCut = box(g, 0.4, 0.4, 0.4, -2.9, 0.3, -1.2, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "cut it dry?", -2.9, 0.66, -1.2, { css: "#d2312b", w: 0.24 });
    reg(hits, dryCut, "dry-cut-silica");
    const dust = particles(g, 40, 0xd8d2c4, { size: 0.03, life: 1.1, additive: false, opacity: 0.3 });
    // Pour card and crew.
    const board = group(g, 0.4, 0, 2.3, 0.1);
    holoPanel(board, 0.95, 0.62, 0, 1.25, 0, (ctx, w, h) => {
      ctx.fillStyle = "#22201a"; ctx.fillRect(0, 0, w, h); ctx.fillStyle = "#c9c2b4"; ctx.fillRect(0, 0, w, 6);
      ctx.font = `600 ${Math.round(h * 0.11)}px 'Barlow Condensed', Arial, sans-serif`; ctx.textAlign = "left"; ctx.textBaseline = "middle";
      ctx.fillStyle = "#efeade"; ctx.fillText("POUR CARD — WALL 3B, LIFT 1", w * 0.06, h * 0.14);
      ctx.font = `${Math.round(h * 0.08)}px Arial, sans-serif`; ctx.fillStyle = "#f7f4ec";
      ["Mix: 4,000 psi, 4 in slump ±1, 6% air", "Form design: 4 ft/hour rate of rise", "Caps on ALL vertical bar before crew on deck", "Test: slump + air + 4 cylinders, first load", "Vibrate straight in and out; never to move mix", "Finish after bleed water leaves; cure same day", "Hold the pour below 40 °F or above 90 °F"].forEach((l, i) => ctx.fillText(l, w * 0.06, h * (0.28 + i * 0.1)));
    }, { accent: CP_ACCENT });
    reg(hits, board, "pour-card");
    barrierPanel(g, -2.8, 0.2, { ry: 1.5 });
    for (const [x, z] of [[2.9, 0.2], [-1.0, 2.6]]) cone(g, x, z);
    const mason = standingFigure(g, 0.2, 1.3, { ry: 3.0, cloth: 0x8a8f96 });
    holoTag(mason, "cement mason", 0, 1.9, 0, { css: "#c9c2b4", w: 0.28 });

    let fill = 0, placing = false, cutting = false;
    return {
      hits,
      spawnLook: new THREE.Vector3(-0.6, 1.1, -1.0),
      onStep() {},
      onStepComplete(step) {
        if (step.id === "fix") { for (const c of caps) c.cap.visible = true; braces[1].pin.visible = true; debris.visible = false; }
        if (step.id === "place") placing = false;
        if (step.id === "cleanup") { saw.parent.remove(saw); g.add(saw); saw.position.set(-2.2, 0.18, -1.8); saw.rotation.set(0, 0.3, 0); cutting = true; }
      },
      onHazard() {},
      animate(t, dt, session) {
        const step = session?.step;
        if (step?.id === "fix") { if (session.sequence.includes("rebar-caps")) for (const c of caps) c.cap.visible = true; if (session.sequence.includes("brace-pin")) braces[1].pin.visible = true; if (session.sequence.includes("blow-out")) debris.visible = false; }
        const gg = session?.gauge;
        if (gg && !gg.committed && step?.id === "slump") repaint(slumpRead.userData.screen, signFace(`${(gg.t * 10).toFixed(1)} in`, { bg: "#22201a", accent: gg.t >= 0.4 && gg.t <= 0.58 ? "#59c97b" : "#f2ae14", fg: "#f7f4ec", scale: 0.62 }));
        if (gg && !gg.committed && step?.id === "bleed") repaint(bleedPanel.userData.screen, signFace(gg.t < 0.52 ? "BLEEDING" : gg.t > 0.68 ? "GOING OFF" : "READY", { bg: "#22201a", accent: gg.t >= 0.52 && gg.t <= 0.68 ? "#59c97b" : "#f2ae14", fg: "#f7f4ec", scale: 0.5 }));
        if (step?.id === "place" && session.holding) { placing = true; fill = Math.min(1, fill + dt / 8); flow.visible = true; flow.userData.step(dt, new THREE.Vector3(-0.6, 2.0, -1.2), 0.15, 0.6, -4); }
        else if (flow.visible) { flow.visible = false; placing = false; }
        pourLevel.scale.y = 1 + fill * 34;
        pourLevel.position.y = 0.14 + fill * 0.85;
        if (session?.turn && step?.id === "joint") key.rotation.y = -session.turn.amount * Math.PI * 2;
        if (cutting) { dust.visible = false; }
        boom.rotation.y = Math.sin(t * 0.2) * 0.04;
        void placing; void boomZoneRing; void line; void faces;
      },
    };
  },
};
