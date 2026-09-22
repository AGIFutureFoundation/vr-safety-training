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
      why: "Formwork is engineered against a rate of rise, not a volume — a form rated for a wall placed one foot an hour is a different piece of engineering from the same form placed two feet an hour. The card carries that number, the mix design and the temperature window the pour is allowed in, and none of it is negotiable on site.",
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
      why: "Everything found on this walk is a five-minute fix with no truck on site and no clock running. The same defects found once concrete is moving are a stopped pour, a cold joint that never fully bonds, or somebody in the ambulance — the walk is what a five-minute fix looks like instead.",
    },
    {
      id: "fix", kind: "sequence", anyOrder: true,
      targets: ["rebar-caps", "brace-pin", "blow-out"],
      itemNames: { "rebar-caps": "rebar caps fitted", "brace-pin": "brace pinned", "blow-out": "form blown out" },
      title: "Correct what the walk found",
      cue: "Cap the bar, pin the brace, blow the debris out of the form.",
      why: "A defect found on the walk and left uncorrected is worse than one nobody ever spotted, because now the whole crew believes the walk happened and the form is safe to work around, when the only thing that actually happened is somebody wrote it down.",
    },
    {
      id: "slump", kind: "gauge", target: "slump-cone",
      title: "Slump test the first truck",
      cue: "Take the slump off the first truck and commit inside the mix design's band.",
      why: "Slump is the one field check that the mix arriving on the truck is the mix that was actually ordered. Too stiff and it will not fill the form around the rebar and embeds; too wet means water was added on site after batching, and water added on site is strength taken back out of the cylinder that gets broken in twenty-eight days.",
      gauge: { label: "SLUMP", speed: 0.7, green: [0.4, 0.58], readout: (t) => `${(t * 10).toFixed(1)} in`, missNote: "Outside the design slump — reject the load or have it adjusted with admixture, not with a hose." },
    },
    {
      id: "air", kind: "sequence",
      targets: ["air-meter", "cast-cylinders"],
      itemNames: { "air-meter": "air content measured", "cast-cylinders": "test cylinders cast" },
      title: "Air content and cylinders",
      cue: "Run the air meter, then cast the test cylinders for the lab.",
      why: "Entrained air is the microscopic space that lets water expand when it freezes without cracking the paste around it, so it is what this wall survives its first winter on; the cylinders are the only proof of strength anyone will have until they are broken at twenty-eight days. Both come off the same load, before a yard of it gets placed.",
      outOfOrderNote: "Air first, then the cylinders — the cylinders record the mix that was measured.",
    },
    {
      id: "clear", kind: "select", target: "boom-zone",
      title: "Clear the boom zone",
      cue: "Move the crew out from under the boom and the line before the pump is charged.",
      why: "The zone under a charged line is the one place on this whole pour nobody has a reason to be standing. A plugged line clears as a whip with enough force to kill, and it lets go the instant the pressure finally breaks the plug — never when anyone is watching for it, which is exactly why the zone is cleared before the line goes live, not monitored while it is.",
    },
    {
      id: "place", kind: "track", target: "pump-remote", seconds: 7,
      title: "Place the first lift",
      cue: "Run the pump at a rate the forms can take, filling in even lifts around the wall.",
      why: "The rate of rise is the number that sets the actual pressure the fresh concrete puts on the form, independent of how much has gone in total. Placing fast in one corner builds pressure there faster than the form was designed for, and a blown wall form buries whoever is standing in the pour line under tonnes of wet concrete with no warning at all.",
      track: { start: 0.1, green: [0.34, 0.54], rise: 0.6, fall: 0.5, drift: 0.12, label: "RATE OF RISE", readout: (v) => (v < 0.34 ? "cold joint risk" : v > 0.54 ? "over the form pressure" : "inside the design rate") },
      holdBreakNote: "Rate out of band — either the lift is going cold or the form is over pressure. Bring it back and hold.",
    },
    {
      id: "vibrate", kind: "hold", target: "vibrator", seconds: 5,
      title: "Consolidate the lift",
      cue: "Hold the vibrator in, straight down, long enough for the surface to close — then out slowly.",
      why: "Vibration drives entrapped air out of concrete that would otherwise cure full of voids; run it too long or drag it sideways and it drives the heavy aggregate down while the cement paste rises, which is segregation and it does not un-mix once the concrete sets. Straight in, straight out, at each insertion point, and never used to push concrete sideways along the form.",
      holdBreakNote: "You pulled out early — the lift has voids in it that will show as honeycomb when the form comes off.",
    },
    {
      id: "joint", kind: "turn", target: "joint-key",
      title: "Set the construction joint key",
      cue: "Wind the joint key down into the top of the lift before it takes its set.",
      why: "The key is the physical interlock that makes tomorrow's lift act as one structural wall with today's, instead of two slabs stacked on a plane with nothing but friction holding them. It only works pressed in while this lift is still plastic, and the surface still has to be roughened and cleaned before the next pour goes on it.",
      turn: { turns: 1, axis: "y", label: "JOINT KEY" },
    },
    {
      id: "bleed", kind: "gauge", target: "bleed-check",
      title: "Wait out the bleed water",
      cue: "Watch the surface and commit when the bleed water has gone and the sheen has left it.",
      why: "Finishing while bleed water is still sitting on the surface works that same water back down into the top inch of the slab, and the top inch is the part that carries traffic and has to last decades. Trying to trowel a wet sheen away is the single most common way an otherwise good pour gets a weak, dusting surface.",
      gauge: { label: "SURFACE", speed: 0.7, green: [0.52, 0.68], readout: (t) => (t < 0.52 ? "still bleeding" : t > 0.68 ? "going off" : "sheen gone, ready"), missNote: "Too early or too late — too early works water in, too late and you are tearing the surface." },
    },
    {
      id: "finish", kind: "sequence",
      targets: ["bull-float", "edge-tool", "cure-blanket"],
      itemNames: { "bull-float": "bull float", "edge-tool": "edger and jointer", "cure-blanket": "curing applied" },
      title: "Float, edge and cure",
      cue: "Bull float, then edge and joint, then get the cure on.",
      why: "Curing is not cleanup at the end of the job, it is the last structural step in making the concrete: a slab that dries out in open air instead of curing under cover loses a large share of its design strength and craze-cracks across the whole surface, which no amount of good placement or vibration upstream can fix afterward.",
      outOfOrderNote: "Float, then edge and joint, then cure — each one works the surface the last one left.",
    },
    {
      id: "cleanup", kind: "drag", target: "wet-saw",
      title: "Cut the hardened spill wet",
      cue: "Bring the wet saw with its water feed to the spill on the slab edge.",
      why: "Cutting hardened concrete dry throws respirable crystalline silica into the air at many times the permissible exposure limit, in particles fine enough to reach deep into the lungs and never come back out. Water on the blade or a vacuum shroud is not a nicety, it is the entire difference between an afternoon's nuisance dust and a disease with no cure.",
      drag: { to: "spill-socket", radius: 0.45, missNote: "Not on the spill — set the saw down square on the hardened edge." },
    },
  ],

  // Two things that happen while the crew is task-loaded on the pour: the
  // pump's remote loses signal mid-lift, and a second crew's crane swings a
  // load over the deck while hands are still in the placement. See
  // shared/game.js.
  interrupts: [
    {
      id: "remote-dropout",
      kind: "Remote signal lost",
      after: "place", delay: 3, seconds: 12,
      alert: "The pump remote's link light has gone dead — the boom operator up in the truck cab cannot see your rate commands anymore.",
      cue: "The remote in your hand is not talking to the pump.",
      target: "pump-hardstop",
      why: "A wireless placement remote is the only thing standing between the crew at the form and a boom operator who cannot see the lift, the rate of rise, or a person standing where the line comes down — that whole picture exists for him only through the remote's readout. When the link drops, the pump keeps running on its last command with nobody able to slow it, correct the rate, or stop it if the form starts to bow, so the hard-stop at the truck is the only control left that still reaches the pump.",
      missNote: "The remote stayed dark and the pump kept placing on its last command with nobody able to adjust the rate or stop it from the form side. A rate nobody is steering is exactly how a form goes past its design pressure with no one noticing until it moves.",
      wrongNote: "The remote is dead. The pump hard-stop at the truck is the only thing left that can still reach it.",
    },
    {
      id: "crane-swing",
      kind: "Load overhead",
      after: "vibrate", delay: 3, seconds: 12,
      alert: "A tower crane on the next pour over is swinging a rebar bundle across your deck, and it is tracking straight toward the crew working the lift.",
      cue: "There is a suspended load moving over the crew's heads.",
      target: "crane-horn",
      why: "A load moving on a crane hook has no brakes a ground crew can apply and no guarantee the operator can see people crouched at form height behind their own boom and rigging — a dropped or swinging load lands with the full weight of the bundle at whatever speed the crane was already moving. Sounding the horn is the fastest way to put every head on the deck up and moving before the load is overhead rather than after.",
      missNote: "The bundle swung directly over the crew with vibrators still running and nobody looked up. A suspended load crossing a live pour is a struck-by hazard the crew on the ground has no control over except getting out from under it in time.",
      wrongNote: "Sound the horn. That is what gets heads up before the load is actually overhead.",
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
    // Hard stop at the truck itself — the remote-dropout interrupt's answer,
    // separate from the wireless remote the crew normally runs the rate with.
    const hardstop = group(pump, 1.2, 0.5, 0.62);
    box(hardstop, 0.1, 0.1, 0.04, 0, 0, 0, 0x22262b, { rough: 0.6 });
    const hardstopBtn = cyl(hardstop, 0.045, 0.045, 0.03, 0, 0, 0.03, 0xd2312b, { rough: 0.5, metal: 0.3, seg: 16 });
    hardstopBtn.material = hardstopBtn.material.clone();
    decal(hardstop, 0.09, 0.03, 0, -0.06, 0.03, signFace("PUMP STOP", { bg: "#22262b", accent: "#d2312b", scale: 0.4 }));
    reg(hits, hardstop, "pump-hardstop");
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

    // The adjacent pour's tower crane — it only swings the bundle over the
    // deck when the crane-swing interrupt fires, but the mast, jib and
    // trolley are part of the yard the whole shift.
    const crane = group(g, 3.3, 0.1, 2.6, -0.5);
    cyl(crane, 0.08, 0.1, 3.2, 0, 1.6, 0, CITY.steel, { rough: 0.5, metal: 0.6, seg: 12 });
    box(crane, 3.0, 0.14, 0.14, -1.4, 3.2, 0, 0xf2c14b, { rough: 0.5, metal: 0.4 });
    box(crane, 0.9, 0.14, 0.14, 0.65, 3.15, 0, 0xf2c14b, { rough: 0.5, metal: 0.4 });
    const trolley = group(crane, -2.6, 3.15, 0);
    box(trolley, 0.18, 0.1, 0.18, 0, 0, 0, 0x2b2f34, { rough: 0.5, metal: 0.5 });
    const cable = cyl(trolley, 0.01, 0.01, 1.6, 0, -0.8, 0, 0x1b1e22, { rough: 0.6, seg: 6 });
    const bundle = group(trolley, 0, -1.6, 0);
    for (let i = 0; i < 5; i++) cyl(bundle, 0.02, 0.02, 1.2, (i - 2) * 0.05, 0, 0, 0x8a5a3a, { rough: 0.8, seg: 8 }).rotation.z = Math.PI / 2;
    holoTag(crane, "adjacent pour — tower crane", 0, 3.6, 0, { css: "#c9c2b4", w: 0.5 });
    void cable;
    // Warning horn on the pour-card post — the crane-swing interrupt's answer.
    const horn = group(board, 0.5, 1.3, 0, 0.2);
    box(horn, 0.1, 0.14, 0.06, 0, 0, 0, 0x2b2f34, { rough: 0.6 });
    const hornLight = ball(horn, 0.03, 0, 0.09, 0.03, 0xf2ae14, { emissive: 0xf2ae14, ei: 0.4, rough: 0.4 });
    hornLight.material = hornLight.material.clone();
    decal(horn, 0.08, 0.03, 0, -0.05, 0.03, signFace("HORN", { bg: "#22262b", accent: "#c9c2b4", scale: 0.45 }));
    reg(hits, horn, "crane-horn");

    let fill = 0, placing = false, cutting = false;
    let craneSwinging = false, craneElapsed = 0, remoteDead = false;
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
      // The pump's rate readout really dies, and the crane really swings
      // the bundle across the deck — both are scene changes an animate()
      // flicker on its own could not produce.
      onInterrupt(it) {
        if (it.id === "remote-dropout") {
          remoteDead = true;
          repaint(slumpRead.userData.screen, signFace("LINK LOST", { bg: "#2a0c0c", accent: "#d2312b", fg: "#ffd0d0", scale: 0.45 }));
          hardstopBtn.material.color.set(0xff5a3c);
          hardstopBtn.material.emissiveIntensity = 2.4;
        }
        if (it.id === "crane-swing") {
          craneSwinging = true;
          craneElapsed = 0;
          trolley.position.x = -1.0;
          hornLight.material.emissiveIntensity = 2.0;
        }
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "remote-dropout") { remoteDead = false; hardstopBtn.material.emissiveIntensity = 1; hardstopBtn.material.color.set(0x22262b); }
        if (it.id === "crane-swing") { craneSwinging = false; trolley.position.x = -2.6; hornLight.material.emissiveIntensity = 0.4; }
      },
      animate(t, dt, session) {
        const step = session?.step;
        if (step?.id === "fix") { if (session.sequence.includes("rebar-caps")) for (const c of caps) c.cap.visible = true; if (session.sequence.includes("brace-pin")) braces[1].pin.visible = true; if (session.sequence.includes("blow-out")) debris.visible = false; }
        const gg = session?.gauge;
        if (gg && !gg.committed && step?.id === "slump") repaint(slumpRead.userData.screen, signFace(`${(gg.t * 10).toFixed(1)} in`, { bg: "#22201a", accent: gg.t >= 0.4 && gg.t <= 0.58 ? "#59c97b" : "#f2ae14", fg: "#f7f4ec", scale: 0.62 }));
        if (gg && !gg.committed && step?.id === "bleed") repaint(bleedPanel.userData.screen, signFace(gg.t < 0.52 ? "BLEEDING" : gg.t > 0.68 ? "GOING OFF" : "READY", { bg: "#22201a", accent: gg.t >= 0.52 && gg.t <= 0.68 ? "#59c97b" : "#f2ae14", fg: "#f7f4ec", scale: 0.5 }));
        if (step?.id === "place" && session.holding && !remoteDead) { placing = true; fill = Math.min(1, fill + dt / 8); flow.visible = true; flow.userData.step(dt, new THREE.Vector3(-0.6, 2.0, -1.2), 0.15, 0.6, -4); }
        else if (flow.visible) { flow.visible = false; placing = false; }
        pourLevel.scale.y = 1 + fill * 34;
        pourLevel.position.y = 0.14 + fill * 0.85;
        if (session?.turn && step?.id === "joint") key.rotation.y = -session.turn.amount * Math.PI * 2;
        if (cutting) { dust.visible = false; }
        boom.rotation.y = Math.sin(t * 0.2) * 0.04;
        if (remoteDead) hardstopBtn.material.emissiveIntensity = 1.6 + Math.sin(t * 9) * 1.4;
        if (craneSwinging) {
          craneElapsed += dt;
          const p = Math.min(1, craneElapsed / 8);
          trolley.position.x = -2.6 + p * 3.6;
          hornLight.material.emissiveIntensity = 1.5 + Math.sin(t * 10) * 1.2;
        } else {
          trolley.position.x += (-2.6 - trolley.position.x) * Math.min(1, dt * 2);
          hornLight.material.emissiveIntensity = 0.4;
        }
        void placing; void boomZoneRing; void line; void faces;
      },
    };
  },
};
