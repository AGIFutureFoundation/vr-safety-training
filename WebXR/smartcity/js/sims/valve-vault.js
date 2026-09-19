import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, ball, torus, slab, hose, group, decal, repaint, signFace, particles, mat,
} from "../../../shared/kit.js";
import {
  CITY, stationPad, holoPanel, holoTag, toolChest, cone, barrierPanel, instrument,
  valveWheel, pipeRun, lockTag, standingFigure, reg,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Valve Vault VR — its own gamified system: Entry Authority.
// Permit-required confined space. The statistic that drives this whole sim: most
// people who die in confined spaces are the ones who went in after somebody else.

export const SIM_VALVE_VAULT = {
  id: "valve-vault",
  index: "03",
  domain: "Water",
  trade: "Water utility operator",
  category: "Water & Environmental",
  weather: "rain",
  certification: "LIUNA — OSHA 29 CFR 1910.146 permit-required confined space entrant",
  name: "Valve Vault",
  title: simTitle("Valve Vault"),
  tagline: "Permit-required confined space entry: isolation, atmosphere, roles and retrieval",
  accent: 0x4fa3ff,
  accentCss: "#4fa3ff",
  parSeconds: 225,
  badge: { id: "entry-authority", name: "Entry Authority", note: "Permit to exit with every control in place" },

  game: system({
    name: "Entry Authority",
    currency: "PERMIT",
    ranks: ["Entrant", "Attendant", "Entry Supervisor", "Rescue Trained", "Authority Certified"],
    badges: [
      { id: "atmosphere-first", name: "Atmosphere First", note: "Test in the correct order, every time", test: AWARD.stepClean("test-atmosphere") },
      { id: "no-hero", name: "No Hero Entry", note: "Never make an unprotected rescue entry", test: AWARD.safe },
      { id: "reading-true", name: "Reading True", note: "Hold the meter steady on every gas check", test: AWARD.precise(0.7) },
    ],
    challenges: [
      { id: "permit-perfect", name: "Permit Perfect", note: "No corrections anywhere in the entry", test: AWARD.clean },
      { id: "held-comms", name: "Held Comms", note: "Never drop the continuous communication hold", test: AWARD.unbroken },
      { id: "shift-ready", name: "Shift Ready", note: "Complete the entry inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "rescue-entry": "You went in after the entrant. Unprotected rescuers are the majority of confined space fatalities — the attendant never enters. You call it in and the retrieval line does the work.",
    "open-hatch-unattended": "You left the opening unguarded. An open vault in a footway takes a pedestrian straight down before anyone can shout.",
    "petrol-blower": "That is a petrol blower sitting at the opening. Running an engine at the intake pumps carbon monoxide straight into the space you are about to breathe.",
    "no-blank": "The valve is only closed, not blanked. A closed valve is not an isolation — it can be operated remotely or leak past while somebody is inside the line.",
  },

  lateNotes: {
    "harness": "The harness goes on after the space has been proven and the tripod is standing.",
  },

  steps: [
    {
      id: "permit", kind: "select", target: "permit-board",
      title: "Open the entry permit",
      cue: "Read the permit: space, hazards, isolation points, rescue plan.",
      why: "The permit is the plan. It names the space, who holds each role, how it is isolated and how somebody gets pulled out — before anyone is standing over an open hole.",
    },
    {
      id: "guard", kind: "sequence", anyOrder: true,
      targets: ["cone-a", "cone-b", "hatch-guard"],
      itemNames: { "cone-a": "cone upstream", "cone-b": "cone downstream", "hatch-guard": "hatch guard rail" },
      title: "Guard the opening",
      cue: "Cone the approach and set the guard rail around the hatch.",
      why: "The opening is a hazard to everyone who is not on your crew. It gets guarded before the cover comes off and stays guarded until it goes back.",
    },
    {
      id: "roles", kind: "sequence",
      targets: ["badge-supervisor", "badge-attendant", "badge-entrant"],
      itemNames: {
        "badge-supervisor": "entry supervisor", "badge-attendant": "attendant", "badge-entrant": "entrant",
      },
      title: "Assign the entry roles",
      cue: "Supervisor authorises, attendant watches, entrant goes in — in that order.",
      why: "The supervisor signs the permit before anyone is named to a role, and the attendant is posted before the entrant is even suited. Roles come before people move.",
      outOfOrderNote: "Roles are assigned top down: the supervisor authorises the entry before the attendant and entrant are posted to it.",
    },
    {
      id: "isolate", kind: "drag", target: "blank-plate",
      title: "Isolate and blank the line",
      cue: "Carry the blanking plate from the kerb and fit it into the flange gap.",
      why: "Positive isolation. The blank is a physical plate that cannot be operated from a control room by somebody who does not know you are in there.",
      drag: { to: "blank-socket", radius: 0.35, missNote: "Not lined up with the flange gap — line the plate up with the pipe run and fit it in." },
    },
    {
      id: "lock", kind: "select", target: "valve-lock",
      title: "Lock the isolation",
      cue: "Chain and lock the valve in the closed position.",
      why: "The lock says the isolation belongs to a person, not to a shift. It comes off when the entry is closed, by the person who put it on.",
    },
    {
      id: "ventilate", kind: "select", target: "blower",
      title: "Start mechanical ventilation",
      cue: "Set the electric blower with its intake in clean air.",
      why: "Ventilation runs before and throughout the entry. Where the intake sits matters as much as the fan — clean air in, or you are just circulating the problem.",
    },
    {
      id: "test-atmosphere", kind: "sequence",
      targets: ["test-oxygen", "test-flammable", "test-toxic"],
      itemNames: { "test-oxygen": "oxygen", "test-flammable": "flammable gas", "test-toxic": "toxic gas" },
      title: "Test the atmosphere in order",
      cue: "Oxygen first, then flammable, then toxic — top, middle and bottom of the space.",
      why: "Oxygen comes first because the flammable sensor cannot be trusted in an oxygen-deficient atmosphere. The order is not a convention, it is what makes the other two readings mean anything.",
      outOfOrderNote: "Wrong order. Oxygen is measured first — the combustible sensor's reading depends on it.",
    },
    {
      id: "oxygen-level", kind: "gauge", target: "gas-meter",
      title: "Confirm the oxygen reading",
      cue: "Hold the meter at the working level and commit inside the acceptable range.",
      why: "Between 19.5% and 23.5%. Below and you lose consciousness without warning; above and everything in the space becomes far more flammable than it looks.",
      gauge: {
        label: "OXYGEN", speed: 0.6, green: [0.46, 0.6],
        readout: (t) => `${(15 + t * 12).toFixed(1)} % O₂`,
        missNote: "Outside the acceptable range. Keep ventilating and re-test — nobody enters on that reading.",
      },
    },
    {
      id: "retrieval", kind: "select", target: "tripod",
      title: "Rig the retrieval system",
      cue: "Stand the tripod and run the winch line to the entrant's harness.",
      why: "A vertical space needs a retrieval line attached before entry, because a rescue that starts by finding equipment has already lost the time it needed.",
    },
    {
      id: "harness", kind: "select", target: "harness",
      title: "Fit the full-body harness",
      cue: "Harness the entrant and clip the retrieval line at the dorsal D-ring.",
      why: "The dorsal attachment is what lets a winch lift somebody through an opening they cannot climb out of.",
    },
    {
      id: "comms", kind: "hold", target: "attendant", seconds: 10,
      title: "Establish continuous communication",
      cue: "Hold contact with the attendant while the entrant descends.",
      why: "Continuous means continuous. The attendant's only job is to stay in contact and to never, under any circumstance, go in themselves.",
      holdBreakNote: "Contact dropped. The attendant lost the entrant — re-establish and hold it all the way down.",
    },
    {
      id: "exit", kind: "select", target: "permit-board",
      title: "Close the permit",
      cue: "Entrant out, headcount, sign the permit closed.",
      why: "The entry is not over when the last person climbs out — it is over when the space is secured and the permit is closed against a headcount.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.0, 0x4fa3ff);

    // Footway slab with the vault opening cut into it.
    box(g, 4.2, 0.18, 4.2, 0, 0.09, 0, 0x555c63, { rough: 0.95 });
    for (let i = -2; i <= 2; i++) {
      box(g, 4.2, 0.004, 0.02, 0, 0.185, i * 0.85, 0x424951, { cast: false, receive: false });
      box(g, 0.02, 0.004, 4.2, i * 0.85, 0.185, 0, 0x424951, { cast: false, receive: false });
    }

    // The vault: a dark shaft with a ladder and pipework at the bottom.
    const shaftRadius = 0.52;
    const shaft = group(g, -0.25, 0, -0.15);
    cyl(shaft, shaftRadius, shaftRadius, 2.2, 0, -1.0, 0, 0x161b21,
      { rough: 0.98, seg: 28, open: true, side: 2, cast: false });
    cyl(shaft, shaftRadius, shaftRadius, 0.02, 0, -2.1, 0, 0x11151a, { rough: 0.98, seg: 24, cast: false });
    torus(shaft, shaftRadius + 0.04, 0.04, 0, 0.19, 0, 0x6f7a83, { rough: 0.6, metal: 0.5, seg: 8, seg2: 32 });
    const cover = cyl(shaft, shaftRadius + 0.02, shaftRadius + 0.02, 0.05, 0.95, 0.21, 0.5, 0x4d545b,
      { rough: 0.8, metal: 0.4, seg: 26 });
    decal(cover, 0.5, 0.5, 0, 0.027, 0, (ctx, w, h) => {
      ctx.fillStyle = "#4d545b"; ctx.beginPath(); ctx.arc(w / 2, h / 2, w * 0.48, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = "#353c43"; ctx.lineWidth = 6;
      for (let i = 0; i < 6; i++) {
        ctx.beginPath(); ctx.arc(w / 2, h / 2, w * (0.1 + i * 0.07), 0, Math.PI * 2); ctx.stroke();
      }
      ctx.fillStyle = "#2c333a";
      ctx.font = `600 ${Math.round(h * 0.1)}px 'Barlow Condensed', Arial, sans-serif`;
      ctx.textAlign = "center"; ctx.textBaseline = "middle";
      ctx.fillText("CITY WATER", w / 2, h / 2);
    }, { px: 320 }).rotation.x = -Math.PI / 2;
    reg(hits, box(shaft, 1.0, 0.02, 1.0, 0, 0.2, 0, 0x000000, { opacity: 0.001, transparent: true, cast: false }),
      "open-hatch-unattended");

    const ladder = group(shaft, 0, 0, -shaftRadius + 0.07);
    for (const sx of [-1, 1]) cyl(ladder, 0.016, 0.016, 2.1, sx * 0.16, -1.0, 0, 0xa8b0b8, { rough: 0.5, metal: 0.7, seg: 8 });
    for (let i = 0; i < 7; i++) {
      cyl(ladder, 0.012, 0.012, 0.32, 0, -0.12 - i * 0.28, 0, 0xa8b0b8, { rough: 0.5, metal: 0.7, seg: 8 })
        .rotation.z = Math.PI / 2;
    }
    reg(hits, ladder, "ladder");

    // Pipework and the isolation valve at the bottom of the shaft.
    const pipes = group(shaft, 0, -1.75, 0.05);
    pipeRun(pipes, [[-0.45, 0, 0], [0, 0.02, 0], [0.45, 0, 0]], 0.09, 0x2f6f8c,
      { steps: 16, flanges: [[-0.28, 0, 0], [0.28, 0.01, 0]], flangeAxis: "x" });
    const valve = valveWheel(pipes, 0, 0.1, 0, { color: 0xb8402f, body: 0x2f6f4a, r: 0.13 });
    // A permanently invisible marker for exactly where the blank belongs — the
    // drag step measures and snaps against this transform; the plate the
    // player actually sees and carries is spareBlank, below.
    const blank = cyl(pipes, 0.13, 0.13, 0.02, 0.3, 0.01, 0, 0xc0c6cc, { rough: 0.35, metal: 0.85, seg: 18 });
    blank.rotation.z = Math.PI / 2;
    blank.visible = false;
    hits["blank-socket"] = blank;
    const valveLock = lockTag(pipes, 0.02, 0.3, 0.1, { color: 0x1f7ae0 });
    valveLock.visible = false;
    const waterDrip = particles(pipes, 40, 0x6fb4d8, { size: 0.012, life: 0.5, additive: false, opacity: 0.6 });

    // Blank plate staged by the kerb, waiting to be carried to the flange gap.
    // Its own child mesh carries no extra tilt — dragging sets the group's
    // full transform directly, and a baked-in child rotation would survive a
    // snap onto the socket and leave the plate sitting crooked once fitted.
    const spareBlank = group(g, 0.75, 0, 0.55, 0.4);
    cyl(spareBlank, 0.17, 0.17, 0.02, 0, 0.19, 0, 0xc0c6cc, { rough: 0.35, metal: 0.85, seg: 20 });
    decal(spareBlank, 0.2, 0.06, 0, 0.42, 0, signFace("BLANK DN150", { accent: "#4fa3ff", scale: 0.5 }));
    reg(hits, spareBlank, "blank-plate");
    reg(hits, valve, "valve-lock");
    reg(hits, box(pipes, 0.3, 0.16, 0.16, -0.34, 0.02, 0, 0x2f6f8c, { rough: 0.55, metal: 0.4 }), "no-blank");

    // ------------------------------------------------------------- ventilation
    const blower = group(g, 1.15, 0, -0.95, -0.5);
    slab(blower, 0.44, 0.4, 0.4, 0, 0.22, 0, 0x2f6f8c, { radius: 0.04, rough: 0.55, metal: 0.3 });
    const fanGuard = cyl(blower, 0.17, 0.17, 0.04, 0, 0.24, 0.21, 0x22272c, { rough: 0.6, seg: 20 });
    fanGuard.rotation.x = Math.PI / 2;
    const fanBlades = group(blower, 0, 0.24, 0.19);
    for (let i = 0; i < 5; i++) {
      const b = box(fanBlades, 0.13, 0.03, 0.01, 0, 0, 0, 0xa8b0b8, { rough: 0.5, metal: 0.6, cast: false });
      b.rotation.z = (i * Math.PI * 2) / 5;
    }
    const duct = hose(g, [[1.15, 0.4, -0.75], [0.85, 0.5, -0.3], [0.2, 0.4, -0.2], [-0.2, 0.05, -0.15], [-0.25, -1.4, -0.15]],
      0.085, 0xf2c14b, { steps: 26, rough: 0.8 });
    holoTag(blower, "Electric blower", 0, 0.6, 0.2, { css: "#4fa3ff", w: 0.32 });
    reg(hits, blower, "blower");

    // Petrol blower sitting beside it — the trap.
    const petrol = group(g, 1.75, 0, -0.2, 0.3);
    slab(petrol, 0.4, 0.32, 0.34, 0, 0.18, 0, 0xb8402f, { radius: 0.03, rough: 0.6 });
    cyl(petrol, 0.09, 0.09, 0.16, -0.1, 0.42, 0, 0x2b3138, { rough: 0.5, seg: 14 });
    cyl(petrol, 0.02, 0.02, 0.2, 0.16, 0.42, 0, 0x22262b, { rough: 0.6, seg: 8 });      // exhaust
    const fumes = particles(petrol, 40, 0x9aa0a6, { size: 0.05, life: 1.2, additive: false, opacity: 0.25 });
    holoTag(petrol, "Petrol blower", 0, 0.62, 0, { css: "#f0645b", w: 0.3 });
    reg(hits, petrol, "petrol-blower");

    // ------------------------------------------------------------- retrieval
    const tripod = group(g, -0.25, 0, -0.15);
    const legs = [];
    for (let i = 0; i < 3; i++) {
      const a = (i / 3) * Math.PI * 2 + 0.5;
      const leg = cyl(tripod, 0.028, 0.032, 2.3, Math.sin(a) * 0.62, 1.12, Math.cos(a) * 0.62,
        0xd8b23a, { rough: 0.45, metal: 0.6, seg: 10 });
      leg.rotation.set(Math.cos(a) * 0.28, 0, -Math.sin(a) * 0.28);
      legs.push(leg);
    }
    const head = ball(tripod, 0.09, 0, 2.22, 0, 0x2b3138, { rough: 0.5, metal: 0.5 });
    const winch = group(tripod, 0.42, 0.9, 0.3);
    slab(winch, 0.18, 0.2, 0.14, 0, 0, 0, 0xd8b23a, { radius: 0.02, rough: 0.5, metal: 0.4 });
    cyl(winch, 0.02, 0.02, 0.14, 0.12, 0.02, 0, CITY.steel, { rough: 0.3, metal: 0.9, seg: 10 })
      .rotation.z = Math.PI / 2;
    const line = hose(tripod, [[0.42, 1.0, 0.3], [0.2, 1.9, 0.14], [0, 2.15, 0], [0, 1.2, 0]],
      0.008, 0xdfe4e8, { steps: 20, rough: 0.6 });
    tripod.visible = false;
    const tripodCase = group(g, -1.55, 0, 0.6, 0.6);
    slab(tripodCase, 1.4, 0.18, 0.24, 0, 0.1, 0, 0x2b3138, { radius: 0.03, rough: 0.6 });
    decal(tripodCase, 0.5, 0.08, 0, 0.2, 0, signFace("TRIPOD + WINCH", { accent: "#4fa3ff", scale: 0.5 }))
      .rotation.x = -Math.PI / 2;
    holoTag(tripodCase, "Retrieval system", 0, 0.42, 0, { css: "#4fa3ff", w: 0.34 });
    reg(hits, tripodCase, "tripod");

    // ------------------------------------------------------------- the crew
    const attendant = standingFigure(g, 2.23, 0.52, { ry: -2.4, cloth: 0x2f6f8c, vest: 0xf2c14b, helmet: 0xf2f2f2 });
    holoTag(attendant, "Attendant", 0, 1.95, 0.15, { css: "#4fa3ff", w: 0.26 });
    reg(hits, attendant, "attendant");
    const entrant = standingFigure(g, -1.82, -0.48, { ry: 1.2, cloth: 0x36505e, vest: 0xf2c14b, helmet: 0x4fa3ff });
    holoTag(entrant, "Entrant", 0, 1.95, 0.15, { css: "#4fa3ff", w: 0.24 });
    reg(hits, entrant, "rescue-entry");

    // Role badges on the permit board.
    const boardPost = group(g, -1.85, 0, -1.5, 0.85);
    cyl(boardPost, 0.03, 0.04, 1.3, 0, 0.65, 0, CITY.darkSteel, { rough: 0.5, metal: 0.6, seg: 12 });
    box(boardPost, 0.62, 0.46, 0.04, 0, 1.45, 0, 0x1b232b, { rough: 0.6 });
    const permitFace = decal(boardPost, 0.56, 0.4, 0, 1.45, 0.026, (ctx, w, h) => {
      ctx.fillStyle = "#f2efe6"; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#1d4f7a"; ctx.fillRect(0, 0, w, h * 0.17);
      ctx.fillStyle = "#ffffff";
      ctx.font = `600 ${Math.round(h * 0.11)}px 'Barlow Condensed', Arial, sans-serif`;
      ctx.textAlign = "left"; ctx.textBaseline = "middle";
      ctx.fillText("CONFINED SPACE ENTRY PERMIT", w * 0.05, h * 0.085);
      ctx.fillStyle = "#1d262e";
      ctx.font = `${Math.round(h * 0.07)}px Arial, sans-serif`;
      ["Space: valve vault VV-212", "Hazards: O₂ deficiency, H₂S, engulfment",
       "Isolation: DN150 closed + blanked", "Ventilation: electric, continuous",
       "Rescue: tripod retrieval, non-entry", "Attendant: never enters"].forEach((line, i) => {
        ctx.fillText(line, w * 0.06, h * (0.28 + i * 0.11));
      });
    }, { px: 512 });
    reg(hits, boardPost, "permit-board");

    const badges = group(boardPost, 0, 1.05, 0.03);
    const badgeSpecs = [
      { id: "badge-supervisor", label: "SUPERVISOR", x: -0.19, c: "#f2c14b" },
      { id: "badge-attendant", label: "ATTENDANT", x: 0, c: "#4fa3ff" },
      { id: "badge-entrant", label: "ENTRANT", x: 0.19, c: "#59c97b" },
    ];
    const badgeFaces = {};
    for (const b of badgeSpecs) {
      const holder = group(badges, b.x, 0, 0);
      box(holder, 0.16, 0.1, 0.012, 0, 0, 0, 0x11181f, { rough: 0.6 });
      badgeFaces[b.id] = decal(holder, 0.15, 0.085, 0, 0, 0.008,
        signFace(b.label + "\nUNASSIGNED", { bg: "#11181f", accent: b.c, scale: 0.3 }), { px: 256 });
      reg(hits, holder, b.id);
    }

    // -------------------------------------------------------------- gas meter
    const chest = toolChest(g, 1.7, 1.15, { ry: -0.9, color: 0x2f6f8c });
    const meter = instrument(chest, -0.08, 0.79, 0, { ry: 0.3, idle: "-- %", color: 0x4fa3ff, w: 0.12, d: 0.19 });
    holoTag(meter, "4-gas meter", 0, 0.16, 0, { css: "#4fa3ff", w: 0.26 });
    reg(hits, meter, "gas-meter");
    // Sample points at three depths — the reason the test is a sequence.
    const depths = [
      { id: "test-oxygen", y: -0.3, label: "TOP" },
      { id: "test-flammable", y: -1.1, label: "MID" },
      { id: "test-toxic", y: -1.85, label: "BOTTOM" },
    ];
    for (const d of depths) {
      const pt = group(shaft, 0.3, d.y, 0.18);
      ball(pt, 0.035, 0, 0, 0, 0x4fa3ff, { emissive: 0x4fa3ff, ei: 1.6, rough: 0.4 });
      torus(pt, 0.07, 0.006, 0, 0, 0, 0x4fa3ff, { emissive: 0x4fa3ff, ei: 1.2, rough: 0.4, cast: false })
        .rotation.x = Math.PI / 2;
      reg(hits, pt, d.id);
    }

    const harness = group(chest, 0.16, 0.8, 0.06, 0.5);
    for (const sx of [-1, 1]) {
      const strap = box(harness, 0.035, 0.02, 0.2, sx * 0.05, 0, 0, 0xf2c14b, { rough: 0.85 });
      strap.rotation.x = 0.2;
    }
    box(harness, 0.14, 0.02, 0.04, 0, 0.012, 0.02, 0xf2c14b, { rough: 0.85 });
    torus(harness, 0.02, 0.005, 0, 0.03, -0.06, CITY.steel, { rough: 0.3, metal: 0.9 });
    holoTag(harness, "Full-body harness", 0, 0.18, 0, { css: "#4fa3ff", w: 0.34 });
    reg(hits, harness, "harness");

    // Guarding kit.
    reg(hits, cone(g, -1.5, 1.35, { color: 0x4fa3ff }), "cone-a");
    reg(hits, cone(g, 1.05, 1.75, { color: 0x4fa3ff }), "cone-b");
    const rail = group(g, -0.25, 0, 0.75);
    rail.visible = true;
    const railPanels = [];
    for (const [rx, rz, ry] of [[0, 0.85, 0], [-0.85, 0, Math.PI / 2], [0.85, 0, Math.PI / 2]]) {
      const panel = barrierPanel(rail, rx, rz - 0.9, { ry, w: 1.5, color: 0x4fa3ff });
      panel.visible = false;
      railPanels.push(panel);
    }
    const railKit = group(g, 0.4, 0, 1.45, 0.2);
    slab(railKit, 1.5, 0.16, 0.2, 0, 0.09, 0, 0x4fa3ff, { radius: 0.02, rough: 0.6 });
    holoTag(railKit, "Hatch guard", 0, 0.34, 0, { css: "#4fa3ff", w: 0.28 });
    reg(hits, railKit, "hatch-guard");

    let ventilating = false;
    let engineRunning = true;
    let commsActive = false;

    return {
      hits,
      footprint: 2.0,

      onStepComplete(step, session) {
        if (step.id === "guard") { railPanels.forEach((p) => { p.visible = true; }); railKit.visible = false; }
        if (step.id === "roles") {
          for (const b of badgeSpecs) {
            repaint(badgeFaces[b.id], signFace(b.label + "\nASSIGNED", {
              bg: "#0f1b14", accent: "#59c97b", fg: "#bff7d4", scale: 0.3,
            }));
          }
        }
        // spareBlank's own position/rotation are already set by the drag-and-
        // drop gesture (app.js snaps it onto the socket's exact transform on
        // a successful drop) — nothing to do here.
        if (step.id === "lock") valveLock.visible = true;
        if (step.id === "ventilate") { ventilating = true; }
        if (step.id === "retrieval") { tripod.visible = true; tripodCase.visible = false; }
        if (step.id === "comms") commsActive = true;
        if (step.id === "exit") {
          repaint(permitFace, (ctx, w, h) => {
            ctx.fillStyle = "#f2efe6"; ctx.fillRect(0, 0, w, h);
            ctx.fillStyle = "#1d6b34"; ctx.fillRect(0, 0, w, h * 0.17);
            ctx.fillStyle = "#ffffff";
            ctx.font = `600 ${Math.round(h * 0.11)}px 'Barlow Condensed', Arial, sans-serif`;
            ctx.textAlign = "left"; ctx.textBaseline = "middle";
            ctx.fillText("PERMIT CLOSED — HEADCOUNT COMPLETE", w * 0.05, h * 0.085);
            ctx.fillStyle = "#1d262e";
            ctx.font = `${Math.round(h * 0.09)}px Arial, sans-serif`;
            ctx.fillText("Space secured. Isolation released.", w * 0.06, h * 0.4);
            ctx.fillText("Entrant out, attendant stood down.", w * 0.06, h * 0.55);
          });
        }
      },

      animate(t, dt, session) {
        if (ventilating) fanBlades.rotation.z += dt * 12;
        waterDrip.visible = true;
        waterDrip.userData.step(dt, new THREE.Vector3(0.28, 0.06, 0), 0.05, 0.06, -1.6);
        if (engineRunning) {
          fumes.visible = true;
          fumes.userData.step(dt, new THREE.Vector3(0.16, 0.45, 0), 0.05, 0.25, 0.35);
        }
        attendant.userData.head.rotation.y = Math.sin(t * 0.6) * 0.35 - 0.2;
        entrant.userData.head.rotation.y = Math.sin(t * 0.5 + 1) * 0.2;
        if (commsActive || session?.step?.id === "comms") {
          attendant.userData.head.rotation.x = Math.sin(t * 3) * 0.06;
        }

        const gg = session?.gauge;
        if (gg && !gg.committed && session.step?.id === "oxygen-level") {
          const o2 = (15 + gg.t * 12).toFixed(1);
          repaint(meter.userData.screen, signFace(`${o2}%`, {
            bg: "#0d1c24", accent: gg.t > 0.46 && gg.t < 0.6 ? "#59c97b" : "#f0645b", fg: "#bfeaf7", scale: 0.6,
          }));
        }
      },
    };
  },
};
