import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import { box, cyl, ball, slab, group, decal, repaint, signFace, particles } from "../../../shared/kit.js";
import { CITY, stationPad, holoPanel, holoTag, toolChest, instrument, lockTag, reg } from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Press Brake VR — Manufacturing & Automation, station two.
// A hydraulic press brake tooling change and first-article bend. The ram
// carries tonnes; the light curtain is the only thing between the operator's
// hands and the die when the pedal goes down. Tooling changes happen with the
// control power locked; the curtain is proven before the first stroke, not
// assumed; and the part is held where it cannot whip up into your face.

const PB_ACCENT = 0xd9a441;

export const SIM_PRESS_BRAKE = {
  id: "press-brake",
  index: "24",
  domain: "Manufacturing",
  trade: "Sheet-metal press brake operator",
  category: "Manufacturing & Automation",
  indoor: "shop",
  certification: "IAM — OSHA 29 CFR 1910.147 lockout/tagout; ANSI B11.3 press brake safeguarding; light-curtain (presence-sensing device) verification per manufacturer's procedure",
  name: "Press Brake",
  title: simTitle("Press Brake"),
  tagline: "Tooling change under lockout, light-curtain proof, back gauge, tonnage, first-article bend",
  accent: PB_ACCENT,
  accentCss: "#d9a441",
  parSeconds: 240,
  footprint: 2.2,
  badge: { id: "curtain-proven", name: "Curtain Proven", note: "Tooling changed locked out, the curtain proven at three heights, and a first article inside tolerance" },

  game: system({
    name: "Bend Authority",
    currency: "STROKE",
    ranks: ["Helper", "Operator", "Setup Operator", "Lead Operator", "Bend Authority Certified"],
    badges: [
      { id: "locked-change", name: "Locked Change", note: "Tooling changed with control power locked, first time", test: AWARD.stepClean("install") },
      { id: "hands-out", name: "Hands Out", note: "Never reached into the die space or bypassed the curtain", test: AWARD.safe },
      { id: "in-tolerance", name: "In Tolerance", note: "Back gauge, tonnage and angle inside spec", test: AWARD.precise(0.7) },
    ],
    challenges: [
      { id: "clean-setup", name: "Clean Setup", note: "No corrections through the whole setup", test: AWARD.clean },
      { id: "pedal-steady", name: "Pedal Steady", note: "Never let the stroke break early", test: AWARD.unbroken },
      { id: "first-article-fast", name: "First Article Fast", note: "Setup inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "reach-in": "You reached into the die space with control power on. The pedal is inches from your foot and the ram does not care what your hands are doing — tooling is touched with the machine locked out, never live.",
    "curtain-bypass": "You turned the curtain bypass key. The presence-sensing device is the safeguard for every stroke; muting it to save a second turns a press brake into a machine with no guard at all.",
    "unclamped-die": "You went to bend on an unclamped die. Tooling that is not seated and clamped can eject under load — sideways, at the operator, at tonnes of force.",
    "part-whip": "You held the part flat with your hands beside the die line. On the upstroke a long part whips up faster than you can move; hands go behind the flange, on the supports, never in the arc.",
  },

  lateNotes: {
    "back-gauge": "The back gauge is set after the tooling is in and clamped and the curtain is proven — a gauge for a die that is not there is a number for nothing.",
    "foot-pedal": "Not yet. The curtain is proven and the first article checked before a production stroke.",
  },

  steps: [
    {
      id: "traveler", kind: "select", target: "job-traveler",
      title: "Read the job traveler",
      cue: "Check material, thickness, bend angle, tooling and the inside radius called for.",
      why: "The traveler names the V-die, the punch, the tonnage and the angle. A setup starts from the drawing, not from whatever tooling is already in the machine.",
    },
    {
      id: "lockout", kind: "turn", target: "control-switch",
      title: "Lock out control power",
      cue: "Turn the control power off and apply your lock before the tooling change.",
      why: "The ram is hydraulic; a pedal bump or a control fault during a tooling change closes it. Your lock is what makes the die space a safe place for hands.",
      turn: { turns: 0.5, axis: "y", label: "CONTROL" },
    },
    {
      id: "install", kind: "drag", target: "v-die",
      title: "Install and seat the V-die",
      cue: "Carry the V-die from the rack and seat it in the lower die holder.",
      why: "The die goes in square, seated against the holder, then clamped. A die that is not seated bends a part wrong at best and ejects at worst.",
      drag: { to: "die-socket", radius: 0.35, missNote: "Not in the holder — seat the die square in the lower clamp." },
    },
    {
      id: "clamp", kind: "select", target: "die-clamp",
      title: "Clamp the tooling",
      cue: "Tighten the die clamps and check the punch is locked.",
      why: "Clamped tooling stays where it was set through every stroke. Unclamped tooling is the one thing the press can throw at you.",
    },
    {
      id: "curtain", kind: "sequence",
      targets: ["curtain-top", "curtain-mid", "curtain-low"],
      itemNames: { "curtain-top": "top beam", "curtain-mid": "middle beam", "curtain-low": "lowest beam" },
      title: "Prove the light curtain",
      cue: "Restore power and break the curtain with the test rod at the top, the middle and the lowest beam — the ram must not move.",
      why: "A curtain is proven, not assumed. Every beam is tested every setup because a single failed beam at hand height is a curtain that does not exist where it matters.",
      outOfOrderNote: "Top to bottom — the test walks the whole field so a dead beam has nowhere to hide.",
    },
    {
      id: "back-gauge", kind: "gauge", target: "back-gauge",
      title: "Set the back gauge",
      cue: "Bring the back gauge to the flange dimension on the traveler.",
      why: "The gauge sets the flange length. It is set to the drawing and then proven on a first article — never eyeballed against the last job's part.",
      gauge: { label: "GAUGE", speed: 0.75, green: [0.46, 0.6], readout: (t) => `${(20 + t * 60).toFixed(1)} mm`, missNote: "Off the flange dimension — reset the gauge to the drawing." },
    },
    {
      id: "tonnage", kind: "gauge", target: "tonnage-dial",
      title: "Set the tonnage",
      cue: "Set the tonnage limit from the chart for this material, thickness and V opening.",
      why: "Too little and the bend is short; too much and you crack the die or the punch. The chart number is the number.",
      gauge: { label: "TONNAGE", speed: 0.75, green: [0.42, 0.58], readout: (t) => `${Math.round(10 + t * 80)} t`, missNote: "Off the chart value — a wrong tonnage breaks tooling or the part. Reset it." },
    },
    {
      id: "first-article", kind: "select", target: "scrap-blank",
      title: "Bend a first article on scrap",
      cue: "Load a scrap blank against the gauge and take one stroke.",
      why: "The first stroke is a test, on a piece you can throw away. It proves the setup before it proves it on the customer's part.",
    },
    {
      id: "angle", kind: "gauge", target: "protractor",
      title: "Check the bend angle",
      cue: "Measure the first article with the protractor and commit inside tolerance.",
      why: "Springback means the ram depth and the angle are not the same number. The protractor is what says the setup is right; the drawing's tolerance is the band.",
      gauge: { label: "ANGLE", speed: 0.7, green: [0.45, 0.6], readout: (t) => `${(85 + t * 10).toFixed(1)}°`, missNote: "Out of tolerance — adjust ram depth and bend another test piece." },
    },
    {
      id: "production", kind: "hold", target: "foot-pedal", seconds: 3,
      title: "Take the production stroke",
      cue: "Hands on the supports behind the flange, then hold the pedal through the full stroke.",
      why: "A stroke released halfway leaves the part pinched and the ram mid-travel. Hands placed first, then a full, deliberate stroke.",
      holdBreakNote: "Pedal released mid-stroke — the ram stopped in the part. Reset and take the stroke through.",
    },
    {
      id: "inspect", kind: "find", noHint: true,
      targets: ["guard-gap"],
      itemNames: { "guard-gap": "gap in the side guard" },
      itemNotes: { "guard-gap": "The side guard has been left off after the last maintenance — a reach-around path to the die space the curtain does not see." },
      title: "Walk the machine before the run",
      cue: "Check the guarding and click what is wrong.",
      why: "The curtain guards the front. The sides and back are fixed guards, and a missing one is a route into the die space nobody is watching.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.2, PB_ACCENT);
    box(g, 4.8, 0.1, 4.4, 0, 0.05, 0, 0x4a4e52, { rough: 0.9 });

    // The press brake: frame, bed, ram, punch.
    const press = group(g, 0, 0.1, -0.9);
    for (const sx of [-1.4, 1.4]) box(press, 0.4, 2.4, 0.8, sx, 1.2, 0, 0x5b6672, { rough: 0.6, metal: 0.4 });
    box(press, 3.2, 0.4, 0.6, 0, 2.3, 0, 0x5b6672, { rough: 0.6, metal: 0.4 });
    box(press, 2.4, 0.3, 0.5, 0, 0.35, 0, 0x3a4048, { rough: 0.6, metal: 0.5 });          // bed
    const ram = box(press, 2.4, 0.3, 0.3, 0, 1.55, 0, 0x6f7a83, { rough: 0.5, metal: 0.5 });
    const punch = box(press, 2.2, 0.35, 0.06, 0, 1.22, 0, CITY.steel, { rough: 0.35, metal: 0.8 });
    // Lower die holder and the socket the V-die drops into.
    box(press, 2.2, 0.1, 0.2, 0, 0.55, 0, 0x2b2f34, { rough: 0.6, metal: 0.5 });
    const socket = box(press, 2.0, 0.02, 0.12, 0, 0.61, 0, 0xffffff, { rough: 0.5 });
    socket.visible = false; hits["die-socket"] = socket;
    const clamps = group(press, 0, 0.62, 0.14);
    for (const sx of [-0.8, 0, 0.8]) cyl(clamps, 0.03, 0.03, 0.06, sx, 0, 0, 0xb8402f, { rough: 0.5, metal: 0.4, seg: 10 }).rotation.x = Math.PI / 2;
    reg(hits, clamps, "die-clamp");
    // Die space: reach-in hazard zone.
    const dieSpace = box(press, 2.0, 0.5, 0.3, 0, 0.9, 0.05, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, dieSpace, "reach-in");
    // Light curtain posts with three test points.
    const curtainFaces = {};
    for (const sx of [-1.25, 1.25]) cyl(press, 0.025, 0.025, 1.4, sx, 1.0, 0.55, 0xe8b02e, { rough: 0.5, seg: 10 });
    for (const [id, y] of [["curtain-top", 1.5], ["curtain-mid", 1.0], ["curtain-low", 0.5]]) {
      const beam = box(press, 2.4, 0.01, 0.01, 0, y, 0.55, 0xd2312b, { emissive: 0xd2312b, ei: 1.4, rough: 0.4, cast: false });
      curtainFaces[id] = beam;
      reg(hits, beam, id);
    }
    // Bypass key switch on the right post — hazard.
    const bypass = group(press, 1.3, 1.7, 0.55);
    cyl(bypass, 0.03, 0.03, 0.02, 0, 0, 0, 0x22262b, { rough: 0.5, seg: 12 }).rotation.x = Math.PI / 2;
    decal(bypass, 0.1, 0.03, 0, 0.05, 0.01, signFace("MUTE", { bg: "#22262b", accent: "#d2312b", scale: 0.55 }));
    reg(hits, bypass, "curtain-bypass");
    // Side guard, with the gap on the left side — the find target.
    box(press, 0.05, 1.2, 0.9, 1.22, 1.0, 0.1, 0xe8b02e, { rough: 0.6, opacity: 0.7, transparent: true });
    const gap = box(press, 0.05, 1.2, 0.9, -1.22, 1.0, 0.1, 0xe8b02e, { rough: 0.6, opacity: 0.15, transparent: true });
    reg(hits, gap, "guard-gap");
    // Back gauge behind the bed; foot pedal in front; part supports.
    const gauge = group(press, 0, 0.62, -0.35);
    const gaugeBar = box(gauge, 2.0, 0.04, 0.04, 0, 0, 0, CITY.steel, { rough: 0.4, metal: 0.7 });
    const gaugeFace = decal(gauge, 0.3, 0.1, 0, 0.12, 0, signFace("-- mm", { bg: "#0d1c24", accent: "#d9a441", fg: "#ffe9b0", scale: 0.6 }), { glow: true, ei: 0.7 });
    reg(hits, gauge, "back-gauge");
    const pedal = group(g, 0, 0.1, 0.6);
    box(pedal, 0.35, 0.08, 0.25, 0, 0.04, 0, 0xe8b02e, { rough: 0.6 });
    box(pedal, 0.3, 0.02, 0.2, 0, 0.09, 0, 0x22262b, { rough: 0.6 });
    reg(hits, pedal, "foot-pedal");
    for (const sx of [-0.7, 0.7]) box(g, 0.1, 0.02, 0.5, sx, 0.72, -0.35, CITY.steel, { rough: 0.4, metal: 0.6 });
    // Part in the whip arc — hazard: a long part with hands beside the die line.
    const whip = box(g, 2.0, 0.01, 0.6, 0, 0.73, -0.2, 0xb9bec4, { rough: 0.4, metal: 0.6 });
    reg(hits, whip, "part-whip");

    // Control pendant: control switch with lock, tonnage dial.
    const pendant = group(g, 1.9, 0, 0.3, -0.6);
    box(pendant, 0.06, 1.3, 0.06, 0, 0.65, 0, CITY.steel, { rough: 0.5, metal: 0.6 });
    box(pendant, 0.36, 0.5, 0.12, 0, 1.4, 0, 0x2b2f34, { rough: 0.6, metal: 0.3 });
    const ctrlSwitch = group(pendant, -0.08, 1.5, 0.07);
    cyl(ctrlSwitch, 0.035, 0.035, 0.02, 0, 0, 0, 0x22262b, { rough: 0.5, seg: 12 }).rotation.x = Math.PI / 2;
    const ctrlHandle = box(ctrlSwitch, 0.02, 0.07, 0.02, 0, 0, 0.015, 0xd2312b, { rough: 0.5 });
    decal(ctrlSwitch, 0.12, 0.03, 0, 0.06, 0.01, signFace("CONTROL PWR", { bg: "#22262b", accent: "#d9a441", scale: 0.5 }));
    reg(hits, ctrlSwitch, "control-switch");
    const lock = lockTag(ctrlSwitch, 0.04, -0.05, 0.02, { color: 0xd9a441 });
    lock.visible = false;
    const tonnage = group(pendant, 0.09, 1.35, 0.07);
    const tonKnob = cyl(tonnage, 0.03, 0.03, 0.02, 0, 0, 0, 0xb8402f, { rough: 0.5, seg: 12 });
    tonKnob.rotation.x = Math.PI / 2;
    const tonFace = decal(tonnage, 0.14, 0.05, 0, 0.06, 0.01, signFace("-- t", { bg: "#0d1c24", accent: "#d9a441", fg: "#ffe9b0", scale: 0.55 }), { glow: true, ei: 0.6 });
    reg(hits, tonnage, "tonnage-dial");
    holoPanel(pendant, 0.6, 0.42, 0.5, 1.75, 0, (ctx, w, h) => {
      ctx.fillStyle = "#1a1408"; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#d9a441"; ctx.fillRect(0, 0, w, 6);
      ctx.font = `600 ${Math.round(h * 0.13)}px 'Barlow Condensed', Arial, sans-serif`; ctx.textAlign = "left"; ctx.textBaseline = "middle";
      ctx.fillText("JOB TRAVELER — PART 4417", w * 0.06, h * 0.16);
      ctx.font = `${Math.round(h * 0.09)}px Arial, sans-serif`; ctx.fillStyle = "#fff3d6";
      ["Material: 3 mm mild steel", "Bend: 90° ± 1°, flange 50 mm", "Tooling: 88° punch, 24 mm V-die", "Tonnage: 42 t (chart)", "First article on scrap"].forEach((l, i) => ctx.fillText(l, w * 0.06, h * (0.34 + i * 0.13)));
    }, { accent: PB_ACCENT });
    const travelerHit = box(pendant, 0.6, 0.42, 0.04, 0.5, 1.75, 0, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, travelerHit, "job-traveler");

    // Tooling rack with the V-die (dragged), an unclamped spare (hazard), test rod, protractor, scrap.
    const rack = toolChest(g, -1.9, 0.6, { ry: 0.7, color: 0x5b6672 });
    const vDie = group(rack, 0, 0.78, 0);
    box(vDie, 0.5, 0.08, 0.08, 0, 0, 0, CITY.steel, { rough: 0.35, metal: 0.8 });
    box(vDie, 0.5, 0.03, 0.03, 0, 0.055, 0, 0x2b2f34, { rough: 0.5 });
    holoTag(vDie, "24 mm V-die", 0, 0.14, 0, { css: "#d9a441", w: 0.26 });
    reg(hits, vDie, "v-die");
    const spare = box(rack, 0.4, 0.08, 0.08, 0.05, 0.9, 0.12, CITY.steel, { rough: 0.35, metal: 0.8 });
    holoTag(spare, "spare die — unclamped", 0, 0.1, 0, { css: "#d2312b", w: 0.36 });
    reg(hits, spare, "unclamped-die");
    const protractor = instrument(rack, -0.2, 0.79, 0.12, { ry: 0.4, idle: "--°", color: 0xd9a441, w: 0.11, d: 0.17 });
    holoTag(protractor, "protractor", 0, 0.15, 0, { css: "#d9a441", w: 0.24 });
    reg(hits, protractor, "protractor");
    const scrap = box(g, 0.6, 0.01, 0.3, -1.2, 0.72, 0.2, 0x8a949d, { rough: 0.5, metal: 0.6 });
    holoTag(g, "scrap blank", -1.2, 0.9, 0.2, { css: "#d9a441", w: 0.22 });
    reg(hits, scrap, "scrap-blank");
    const rod = cyl(g, 0.012, 0.012, 0.5, 1.6, 0.9, 0.5, 0xffffff, { rough: 0.5, seg: 8 });
    holoTag(g, "curtain test rod", 1.6, 1.2, 0.5, { css: "#d9a441", w: 0.3 });

    let locked = false, curtainOk = 0, bending = false;
    return {
      hits,
      spawnLook: new THREE.Vector3(0, 1.1, -0.9),
      onStep() {},
      onStepComplete(step) {
        if (step.id === "lockout") { locked = true; lock.visible = true; ctrlHandle.rotation.z = Math.PI / 2; }
        if (step.id === "install") { vDie.parent.remove(vDie); press.add(vDie); vDie.position.set(0, 0.62, 0); vDie.rotation.set(0, 0, 0); vDie.scale.set(4, 1, 1); }
        if (step.id === "curtain") { locked = false; lock.visible = false; ctrlHandle.rotation.z = 0; for (const b of Object.values(curtainFaces)) b.material.color.set(0x59c97b); }
        if (step.id === "first-article") { scrap.rotation.x = -0.6; scrap.position.set(0, 0.75, -0.6); }
        if (step.id === "inspect") gap.material.opacity = 0.7;
      },
      onHazard() {},
      animate(t, dt, session) {
        const step = session?.step;
        bending = !!(step?.id === "production" && session.holding);
        const target = bending ? 1.25 : 1.55;
        ram.position.y += (target - ram.position.y) * Math.min(1, dt * 4);
        punch.position.y = ram.position.y - 0.33;
        if (step?.kind === "sequence" && step.id === "curtain") {
          for (const id of Object.keys(curtainFaces)) curtainFaces[id].material.emissiveIntensity = session.sequence.includes(id) ? 0.6 : 1.4 + Math.sin(t * 6) * 0.4;
        }
        const gg = session?.gauge;
        if (gg && !gg.committed) {
          if (step?.id === "back-gauge") { gaugeBar.position.z = -(gg.t * 0.3); repaint(gaugeFace, signFace(`${(20 + gg.t * 60).toFixed(1)} mm`, { bg: "#0d1c24", accent: gg.t >= 0.46 && gg.t <= 0.6 ? "#59c97b" : "#f2ae14", fg: "#ffe9b0", scale: 0.6 })); }
          if (step?.id === "tonnage") { tonKnob.rotation.z = gg.t * Math.PI * 1.6; repaint(tonFace, signFace(`${Math.round(10 + gg.t * 80)} t`, { bg: "#0d1c24", accent: gg.t >= 0.42 && gg.t <= 0.58 ? "#59c97b" : "#f2ae14", fg: "#ffe9b0", scale: 0.55 })); }
          if (step?.id === "angle") repaint(protractor.userData.screen, signFace(`${(85 + gg.t * 10).toFixed(1)}°`, { bg: "#0d1c24", accent: gg.t >= 0.45 && gg.t <= 0.6 ? "#59c97b" : "#f2ae14", fg: "#ffe9b0", scale: 0.62 }));
        }
      },
    };
  },
};
