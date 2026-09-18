import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import { box, cyl, ball, slab, hose, group, decal, repaint, signFace, particles } from "../../../shared/kit.js";
import { CITY, stationPad, holoPanel, holoTag, toolChest, instrument, lockTag, reg } from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Stage Power VR — Entertainment & Live Events, station two.
// Tying a touring distro into a venue's company switch: the switch is
// verified dead before a cam-lock goes on, the single-conductor cams go on
// ground first and come off ground last, the taps are covered and strain-
// relieved before anything is energised, and the phases are read before the
// first dimmer takes load.

const SP_ACCENT = 0xc77dff;

export const SIM_STAGE_POWER = {
  id: "stage-power",
  index: "26",
  domain: "Entertainment",
  trade: "Stage / touring electrician",
  category: "Entertainment & Live Events",
  indoor: "theatre",
  certification: "IATSE — ETCP Certified Entertainment Electrician; NEC Article 520 (theaters) and 525 / single-pole separable connector (cam-lock) sequence; NFPA 70E qualified for the verification",
  name: "Stage Power",
  title: simTitle("Stage Power"),
  tagline: "Company switch tie-in: lockout, live-dead-live, cam-locks ground-first, cover and strain relief, energise, phase check, load test",
  accent: SP_ACCENT,
  accentCss: "#c77dff",
  parSeconds: 235,
  footprint: 2.2,
  badge: { id: "ground-first", name: "Ground First", note: "A tie-in proven dead, cammed ground-first, covered, energised and phase-checked with no shortcut" },

  game: system({
    name: "Tie-In Authority",
    currency: "AMP",
    ranks: ["Deck Electrician", "Distro Tech", "Head Electrician", "Production Electrician", "Tie-In Certified"],
    badges: [
      { id: "proven-dead", name: "Proven Dead", note: "Live-dead-live in order, first time", test: AWARD.stepClean("verify") },
      { id: "cam-order", name: "Cam Order", note: "Ground, neutral, then phases — never a phase first", test: AWARD.all(AWARD.stepClean("cams"), AWARD.safe) },
      { id: "phases-read", name: "Phases Read", note: "Voltage read inside spec on every phase", test: AWARD.precise(0.7) },
    ],
    challenges: [
      { id: "clean-tie-in", name: "Clean Tie-In", note: "No corrections through the whole tie-in", test: AWARD.clean },
      { id: "load-held", name: "Load Held", note: "Held the load test the full duration", test: AWARD.unbroken },
      { id: "doors-open", name: "Doors Open", note: "Power up inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "phase-first": "You reached for a phase cam before the ground was on. Single-pole connectors are made ground first and broken ground last, so there is never a moment the distro frame is hot with no path back — that order is the whole reason cams are allowed.",
    "wet-distro": "The distro is standing in the puddle from the load-in. A metal frame carrying three phases on a wet floor is a shock path to whoever touches it next; it gets moved and dried before it gets power.",
    "taped-cam": "That cam is held in with tape because the latch is broken. A connector that can pull apart under load arcs — and a 400 A arc on a stage is a fire and a burn, not a fault.",
    "meter-no-gloves": "You went at the switch with the meter and no gloves or face shield. Verification is the live part of this job; it is done in the PPE the arc-flash label calls for, or it is not done.",
  },

  lateNotes: {
    "cam-ground": "Not yet — the switch is locked out and proven dead before any connector goes on.",
    "switch-on": "The switch stays off until the cams are on in order, covered and strain-relieved.",
  },

  steps: [
    {
      id: "plot", kind: "select", target: "power-plot",
      title: "Read the power plot",
      cue: "Check the service size, the phase colours for this venue, and the load the tour brings.",
      why: "The plot says what the venue can give and what the rig needs. A 400 A switch feeding a 600 A rig is a decision made here, not when the breaker trips at the top of the show.",
    },
    {
      id: "lockout", kind: "turn", target: "switch-handle",
      title: "Open and lock the company switch",
      cue: "Throw the switch off and hang your lock and tag.",
      why: "The switch is opened and locked before the door comes off. Your lock is the only thing that stops the house electrician energising it while your hands are on the lugs.",
      turn: { turns: 0.5, axis: "z", label: "SWITCH" },
    },
    {
      id: "ppe", kind: "select", target: "arc-ppe",
      title: "Arc-rated PPE for the verification",
      cue: "Gloves and face shield on before the meter goes near the switch.",
      why: "Proving it dead is the one moment you are working on something that might be live. The label on the switch says what to wear; the meter goes nowhere without it.",
    },
    {
      id: "verify", kind: "sequence",
      targets: ["meter-live", "meter-switch", "meter-live-again"],
      itemNames: { "meter-live": "known live source", "meter-switch": "switch lugs", "meter-live-again": "known live source again" },
      title: "Live-dead-live",
      cue: "Prove the meter on a known live source, test every lug of the switch, prove the meter again.",
      why: "A meter that reads zero can be a dead switch or a dead meter. Testing it on a known source before and after is the only way the zero means anything.",
      outOfOrderNote: "Live, then dead, then live — the meter is proven before and after the reading you are relying on.",
    },
    {
      id: "cams", kind: "sequence",
      targets: ["cam-ground", "cam-neutral", "cam-l1", "cam-l2", "cam-l3"],
      itemNames: { "cam-ground": "ground (green)", "cam-neutral": "neutral (white)", "cam-l1": "phase A", "cam-l2": "phase B", "cam-l3": "phase C" },
      title: "Make the cams ground-first",
      cue: "Ground, then neutral, then the three phases — in that order, latched.",
      why: "Ground first so the frame is bonded before any conductor could be hot; neutral before phases so a load never sees a floating neutral. Off is the reverse: phases, neutral, ground last.",
      outOfOrderNote: "Ground, neutral, then phases. A phase first is the one order the code forbids.",
    },
    {
      id: "strain", kind: "select", target: "strain-relief",
      title: "Strain-relieve the feeder",
      cue: "Secure the feeder to the frame so no pull reaches the connectors.",
      why: "Feeder is heavy and the crew walks on it. The strain relief takes the pull so the cams never do.",
    },
    {
      id: "cover", kind: "select", target: "switch-cover",
      title: "Cover the taps",
      cue: "Close the switch's tap cover so no lug is exposed.",
      why: "Nothing is energised with a bare lug exposed. The cover goes on before the switch goes on, every time.",
    },
    {
      id: "switch-on", kind: "turn", target: "switch-on",
      title: "Remove the lock and energise",
      cue: "Take your lock off, clear the area, throw the switch on.",
      why: "Your lock, your key, your call. The area is clear because the first energisation is the moment a fault shows itself.",
      turn: { turns: 0.5, axis: "z", label: "SWITCH" },
    },
    {
      id: "phases", kind: "gauge", target: "distro-meter",
      title: "Read the phases at the distro",
      cue: "Read phase-to-neutral on each phase and commit inside the nominal band.",
      why: "Three phases that read right at the distro is the proof the tie-in is correct. A lost neutral shows here first — as one phase high and one low — before it shows as a rack of dead dimmers.",
      gauge: { label: "VOLTS", speed: 0.75, green: [0.46, 0.6], readout: (t) => `${Math.round(100 + t * 40)} V`, missNote: "Off nominal — do not load it. Recheck neutral and the cam order." },
    },
    {
      id: "load", kind: "hold", target: "dimmer-test", seconds: 4,
      title: "Load test",
      cue: "Bring a test load up on the dimmer and hold it while the phases stay balanced.",
      why: "Balanced under load is the last proof. A tie-in that reads right unloaded and sags under the first cue was never right.",
      holdBreakNote: "Load dropped early — the balance was never proven. Bring it up and hold.",
    },
    {
      id: "inspect", kind: "find", noHint: true,
      targets: ["damaged-jacket"],
      itemNames: { "damaged-jacket": "damaged feeder jacket" },
      itemNotes: { "damaged-jacket": "The feeder jacket is cut through to the insulation where a road case rolled over it. That run gets replaced before the house opens." },
      title: "Walk the feeder run",
      cue: "Inspect the feeder from the switch to the distro and click the damage.",
      why: "Feeder lives on the floor with the whole load-in walking over it. The walk is what finds the cut that becomes a fault at the top of the show.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.2, SP_ACCENT);
    box(g, 5.0, 0.1, 4.4, 0, 0.05, 0, 0x22262b, { rough: 0.9 });
    // Backstage wall with the company switch.
    box(g, 5.0, 3.0, 0.2, 0, 1.5, -2.1, 0x2f333a, { rough: 0.95 });
    const sw = group(g, -0.9, 0.1, -1.95);
    box(sw, 0.8, 1.2, 0.25, 0, 1.4, 0, 0x6f7a83, { rough: 0.5, metal: 0.5 });
    decal(sw, 0.6, 0.12, 0, 2.06, 0.13, signFace("COMPANY SWITCH · 400 A 3Ø", { bg: "#1b1e22", accent: "#c77dff", scale: 0.5 }));
    decal(sw, 0.5, 0.1, 0, 0.72, 0.13, signFace("ARC FLASH — PPE CAT 2", { bg: "#f2c14b", accent: "#1b1e22", scale: 0.5 }));
    const handle = group(sw, 0.5, 1.4, 0.1);
    box(handle, 0.05, 0.3, 0.05, 0, 0.15, 0, 0xd2312b, { rough: 0.5 });
    reg(hits, handle, "switch-handle");
    const handleOn = group(sw, 0.5, 1.85, 0.12);
    box(handleOn, 0.12, 0.08, 0.02, 0, 0, 0, 0x22262b, { rough: 0.6 });
    decal(handleOn, 0.1, 0.05, 0, 0, 0.011, signFace("ON", { bg: "#22262b", accent: "#59c97b", scale: 0.6 }));
    reg(hits, handleOn, "switch-on");
    const lock = lockTag(handle, 0.05, 0.05, 0.03, { color: 0xc77dff });
    lock.visible = false;
    // Tap cover (open at start) and the lugs behind it.
    const cover = box(sw, 0.7, 0.5, 0.02, 0, 1.0, 0.14, 0x6f7a83, { rough: 0.5, metal: 0.5 });
    cover.rotation.x = -1.3; cover.position.y = 1.3;
    reg(hits, cover, "switch-cover");
    const lugFaces = {};
    const camSpecs = [["cam-ground", -0.28, 0x2f7d4a, "G"], ["cam-neutral", -0.14, 0xffffff, "N"], ["cam-l1", 0, 0x1b1e22, "A"], ["cam-l2", 0.14, 0xd2312b, "B"], ["cam-l3", 0.28, 0x1f4ea8, "C"]];
    for (const [id, dx, color, label] of camSpecs) {
      const lug = group(sw, dx, 1.0, 0.14);
      cyl(lug, 0.03, 0.03, 0.06, 0, 0, 0, color, { rough: 0.4, metal: 0.5, seg: 12 }).rotation.x = Math.PI / 2;
      lugFaces[id] = decal(lug, 0.05, 0.03, 0, 0.05, 0.03, signFace(label, { bg: "#1b1e22", accent: "#c77dff", scale: 0.6 }));
      reg(hits, lug, id);
    }
    const phaseFirst = box(sw, 0.16, 0.08, 0.1, 0.14, 1.12, 0.2, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(sw, "phase cam first?", 0.2, 1.22, 0.24, { css: "#d2312b", w: 0.3 });
    reg(hits, phaseFirst, "phase-first");
    const strain = group(sw, -0.5, 0.5, 0.15);
    box(strain, 0.1, 0.06, 0.06, 0, 0, 0, CITY.steel, { rough: 0.4, metal: 0.7 });
    holoTag(strain, "strain relief", 0, 0.1, 0, { css: "#c77dff", w: 0.24 });
    reg(hits, strain, "strain-relief");
    // Meter test points: a known live receptacle beside the switch.
    const live = group(g, 0.3, 0.1, -1.95);
    box(live, 0.14, 0.2, 0.06, 0, 1.2, 0, 0xe8eef2, { rough: 0.5 });
    decal(live, 0.12, 0.05, 0, 1.33, 0.031, signFace("120 V LIVE", { bg: "#1b1e22", accent: "#59c97b", scale: 0.5 }));
    reg(hits, live, "meter-live");
    const liveAgain = box(live, 0.14, 0.2, 0.06, 0, 0.95, 0, 0xe8eef2, { rough: 0.5 });
    decal(live, 0.12, 0.05, 0, 0.85, 0.031, signFace("RE-PROVE", { bg: "#1b1e22", accent: "#59c97b", scale: 0.5 }));
    reg(hits, liveAgain, "meter-live-again");
    const lugsZone = box(sw, 0.7, 0.2, 0.2, 0, 1.0, 0.25, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, lugsZone, "meter-switch");

    // Feeder run to the distro, with damage and a taped cam.
    const feeder = hose(g, [[-0.9, 0.8, -1.8], [-0.6, 0.15, -1.2], [0.4, 0.12, -0.4], [1.3, 0.15, 0.4], [1.6, 0.5, 0.9]], 0.03, 0x1b1e22, { steps: 28 });
    const damage = box(g, 0.14, 0.06, 0.12, 0.4, 0.15, -0.4, 0xb8b0a0, { rough: 0.7 });
    reg(hits, damage, "damaged-jacket");
    const taped = group(g, 1.0, 0.16, 0.05, 0.4);
    cyl(taped, 0.035, 0.035, 0.1, 0, 0, 0, 0xd2312b, { rough: 0.5, seg: 12 }).rotation.z = Math.PI / 2;
    box(taped, 0.06, 0.08, 0.08, 0, 0, 0, 0x8a8a8a, { rough: 0.9 });
    holoTag(taped, "taped cam", 0, 0.15, 0, { css: "#d2312b", w: 0.2 });
    reg(hits, taped, "taped-cam");
    // Distro rack on the deck, standing in a puddle.
    const distro = group(g, 1.7, 0.1, 1.1, -0.5);
    box(distro, 0.7, 1.0, 0.5, 0, 0.5, 0, 0x2b2f34, { rough: 0.55, metal: 0.4 });
    for (let i = 0; i < 6; i++) cyl(distro, 0.025, 0.025, 0.04, -0.2 + (i % 3) * 0.2, 0.75 - Math.floor(i / 3) * 0.2, 0.26, [0x2f7d4a, 0xffffff, 0x1b1e22, 0xd2312b, 0x1f4ea8, 0x1b1e22][i], { rough: 0.4, metal: 0.5, seg: 10 }).rotation.x = Math.PI / 2;
    const distroMeter = instrument(distro, 0, 1.03, 0, { idle: "-- V", color: 0xc77dff, w: 0.16, d: 0.2 });
    reg(hits, distroMeter, "distro-meter");
    const puddle = slab(g, 1.2, 0.006, 0.9, 1.7, 0.104, 1.1, 0x6fb4d8, { rough: 0.15, opacity: 0.45, transparent: true, cast: false });
    reg(hits, puddle, "wet-distro");
    holoTag(g, "puddle from load-in", 1.7, 0.4, 1.7, { css: "#d2312b", w: 0.34 });
    // Dimmer test fader and the tour's power plot.
    const dimmer = group(g, 0.4, 0.1, 1.6, 0.3);
    box(dimmer, 0.5, 0.6, 0.3, 0, 0.3, 0, 0x2b2f34, { rough: 0.55, metal: 0.3 });
    const fader = box(dimmer, 0.03, 0.06, 0.03, 0, 0.62, 0.05, 0xc77dff, { rough: 0.5 });
    const lamp = ball(dimmer, 0.06, 0, 0.9, 0, 0xfff1c4, { emissive: 0xfff1c4, ei: 0.1, rough: 0.4 });
    reg(hits, dimmer, "dimmer-test");
    const plot = group(g, -1.9, 0, 1.2, 0.8);
    holoPanel(plot, 0.9, 0.6, 0, 1.25, 0, (ctx, w, h) => {
      ctx.fillStyle = "#150a1e"; ctx.fillRect(0, 0, w, h); ctx.fillStyle = "#c77dff"; ctx.fillRect(0, 0, w, 6);
      ctx.font = `600 ${Math.round(h * 0.11)}px 'Barlow Condensed', Arial, sans-serif`; ctx.textAlign = "left"; ctx.textBaseline = "middle";
      ctx.fillText("POWER PLOT — TOUR RIG, HOUSE SL", w * 0.06, h * 0.14);
      ctx.font = `${Math.round(h * 0.08)}px Arial, sans-serif`; ctx.fillStyle = "#f3e6ff";
      ["Service: 400 A, 120/208 V 3Ø, 5-wire", "Rig load: 310 A max per phase", "Cams: G → N → A → B → C (on)", "Off: C → B → A → N → G",
       "PPE: gloves + shield for verification", "Feeder: 4/0 SC, strain-relieved"].forEach((l, i) => ctx.fillText(l, w * 0.06, h * (0.3 + i * 0.11)));
    }, { accent: SP_ACCENT });
    reg(hits, plot, "power-plot");
    const chest = toolChest(g, -1.8, -0.6, { ry: 0.6, color: 0x4a2a6a });
    const ppe = group(chest, 0, 0.78, 0);
    box(ppe, 0.22, 0.16, 0.02, 0, 0, 0, 0x9fc3d8, { rough: 0.2, opacity: 0.6, transparent: true });
    box(ppe, 0.2, 0.06, 0.12, 0, -0.1, 0.06, 0xc48b3f, { rough: 0.8 });
    holoTag(ppe, "arc PPE — gloves + shield", 0, 0.16, 0, { css: "#c77dff", w: 0.4 });
    reg(hits, ppe, "arc-ppe");
    const noGloves = box(g, 0.3, 0.3, 0.3, -0.3, 1.1, -1.7, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "meter, bare hands?", -0.3, 1.35, -1.7, { css: "#d2312b", w: 0.3 });
    reg(hits, noGloves, "meter-no-gloves");

    let energised = false;
    return {
      hits,
      spawnLook: new THREE.Vector3(-0.6, 1.2, -1.9),
      onStep() {},
      onStepComplete(step) {
        if (step.id === "lockout") { handle.rotation.z = -1.2; lock.visible = true; }
        if (step.id === "cover") { cover.rotation.x = 0; cover.position.y = 1.0; }
        if (step.id === "switch-on") { handle.rotation.z = 0; lock.visible = false; energised = true; }
        if (step.id === "cams") for (const [id] of camSpecs) repaint(lugFaces[id], signFace("✓", { bg: "#0d2b22", accent: "#59c97b", scale: 0.6 }));
        if (step.id === "inspect") damage.visible = false;
      },
      onHazard() {},
      animate(t, dt, session) {
        const step = session?.step;
        if (session?.turn && (step?.id === "lockout" || step?.id === "switch-on")) handle.rotation.z = step.id === "lockout" ? -session.turn.amount / session.turn.required * 1.2 : -1.2 + session.turn.amount / session.turn.required * 1.2;
        const gg = session?.gauge;
        if (gg && !gg.committed && step?.id === "phases") repaint(distroMeter.userData.screen, signFace(`${Math.round(100 + gg.t * 40)} V`, { bg: "#0d1c24", accent: gg.t >= 0.46 && gg.t <= 0.6 ? "#59c97b" : "#f2ae14", fg: "#f3e6ff", scale: 0.62 }));
        const loading = step?.id === "load" && session.holding;
        fader.position.y = loading ? 0.62 + Math.min(1, session.holdFor / 4) * 0.2 : 0.62;
        lamp.material.emissiveIntensity = energised && loading ? 0.3 + Math.min(1, session.holdFor / 4) * 2.2 : 0.1;
      },
    };
  },
};
