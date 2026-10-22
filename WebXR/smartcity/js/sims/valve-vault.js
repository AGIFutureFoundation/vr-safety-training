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
  certification: "LIUNA — OSHA 29 CFR 1910.146 permit-required confined space entrant; ANSI/ASSP Z117.1 confined spaces; NIOSH confined-space entry criteria",
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
"rescue-entry": "You climbed down after the entrant. NIOSH's own tally of confined-space fatalities keeps landing on the same finding: the majority of the bodies recovered are not the worker the crew came to save, they are the coworker who followed without a plan, a line, or air of their own. The attendant's job right now is to raise the alarm and let the tripod and winch do the pulling, not to add a second casualty to the bottom of the shaft.",
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
      why: "The permit is the record that this particular vault, on this particular day, has already been checked against every item 1910.146 requires before a cover comes off a footway — the isolation point on the main, the reading the atmosphere has to hold, who is standing where, and how somebody gets pulled back out through an opening barely wide enough for their shoulders. Nobody works off what the last crew did in a different vault; the paper in hand is the only one that counts today.",
    },
    {
      id: "guard", kind: "sequence", anyOrder: true,
      targets: ["cone-a", "cone-b", "hatch-guard"],
      itemNames: { "cone-a": "cone upstream", "cone-b": "cone downstream", "hatch-guard": "hatch guard rail" },
      title: "Guard the opening",
      cue: "Cone the approach and set the guard rail around the hatch.",
      why: "A footway with an open manhole in it is a hazard to the public long before it is a hazard to the crew — a jogger, a stroller, someone reading a phone screen instead of the pavement. The cones turn foot traffic wide of the kerb and the rail closes off the last few feet around the hatch, and both go up before the cover is lifted, not after somebody has already wandered up to the edge to see what the crew is doing.",
    },
    {
      id: "roles", kind: "sequence",
      targets: ["badge-supervisor", "badge-attendant", "badge-entrant"],
      itemNames: {
        "badge-supervisor": "entry supervisor", "badge-attendant": "attendant", "badge-entrant": "entrant",
      },
      title: "Assign the entry roles",
      cue: "Supervisor authorises, attendant watches, entrant goes in — in that order.",
      why: "A permit space assigns its three roles top down for a reason that has nothing to do with rank: the supervisor is the one person whose sign-off says the isolation, the atmosphere and the rescue plan have actually been checked, and that judgment has to exist before anyone is posted to watch the hatch or handed a harness. Naming an entrant first and sorting the rest out afterward is how a crew talks itself into a vault nobody has actually cleared.",
      outOfOrderNote: "Roles are assigned top down: the supervisor authorises the entry before the attendant and entrant are posted to it.",
    },
    {
      id: "isolate", kind: "drag", target: "blank-plate",
      title: "Isolate and blank the line",
      cue: "Carry the blanking plate from the kerb and fit it into the flange gap.",
      why: "A valve that is merely shut is still a valve — line pressure, a seat that has not fully seated, or somebody three streets over opening it from a SCADA screen can all put water back through it while an entrant is standing in the vault. The blanking plate is a solid steel disc bolted straight across the flange gap; it is the one form of isolation on this job that a hand at a keyboard somewhere else cannot undo.",
      drag: { to: "blank-socket", radius: 0.35, missNote: "Not lined up with the flange gap — line the plate up with the pipe run and fit it in." },
    },
    {
      id: "lock", kind: "select", target: "valve-lock",
      title: "Lock the isolation",
      cue: "Chain and lock the valve in the closed position.",
      why: "A padlock through the chain does something a closed valve on its own does not: it puts the isolation in the name of a specific person rather than a shift, so nobody working the panel that afternoon can wonder whether it is safe to operate. It stays on for as long as anyone could be below, and the only hand that ever takes it off again is the one that put it there.",
    },
    {
      id: "ventilate", kind: "select", target: "blower",
      title: "Start mechanical ventilation",
      cue: "Set the electric blower with its intake in clean air.",
      why: "The blower has to be moving clean air before anyone treats this vault as breathable, and where its intake sits decides whether that is even true — an intake set over standing water or downwind of an idling truck draws the exact hazard it exists to dilute straight down the duct. It runs from before the first reading is taken until after the last boot is back on the footway, because a shaft like this one does not stay ventilated on its own.",
    },
    {
      id: "test-atmosphere", kind: "sequence",
      targets: ["test-oxygen", "test-flammable", "test-toxic"],
      itemNames: { "test-oxygen": "oxygen", "test-flammable": "flammable gas", "test-toxic": "toxic gas" },
      title: "Test the atmosphere in order",
      cue: "Oxygen first, then flammable, then toxic — top, middle and bottom of the space.",
      why: "Oxygen goes first because a combustible-gas reading is only meaningful in a normal oxygen atmosphere — read for flammables first in an oxygen-deficient vault and the meter can hand back a false all-clear. Sampling top, middle and bottom in that order also catches a layered atmosphere that a single reading taken at the hatch would miss completely, since the heavier gases this vault can hold settle toward the bottom long before they ever reach the rim.",
      outOfOrderNote: "Wrong order. Oxygen is measured first — the combustible sensor's reading depends on it.",
    },
    {
      id: "oxygen-level", kind: "gauge", target: "gas-meter",
      title: "Confirm the oxygen reading",
      cue: "Hold the meter at the working level and commit inside the acceptable range.",
      why: "19.5 to 23.5 percent is the whole of the acceptable range, and it is narrow because both directions fail differently — drop below it and a person can black out mid-sentence with nothing beforehand to tip them off, climb above it and ordinary things like a cotton sleeve or a smear of grease turn far more willing to burn than they look. That reading has to hold steady in the band before anyone treats the vault as entered, not just glanced at once from the hatch.",
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
      why: "A vertical entry like this one needs the tripod standing and the winch line run out before anyone clips a harness to it, because the alternative is a rescue that starts with somebody topside hunting through a truck for equipment while the clock that actually matters — the one on an entrant who has stopped answering — keeps running regardless. Rigged first, the retrieval system is already doing its job the instant it is needed instead of an unmeasured number of minutes after.",
    },
    {
      id: "harness", kind: "select", target: "harness",
      title: "Fit the full-body harness",
      cue: "Harness the entrant and clip the retrieval line at the dorsal D-ring.",
      why: "The dorsal D-ring sits between the shoulder blades because that is the one attachment point that lets a winch draw somebody upright through an opening barely wider than their shoulders, rather than folding them double or dragging them face-first up the shaft wall. Clip the line anywhere else on the harness and a non-entry rescue turns into something the attendant has to improvise on the spot.",
    },
    {
      id: "comms", kind: "hold", target: "attendant", seconds: 10,
      title: "Establish continuous communication",
      cue: "Hold contact with the attendant while the entrant descends.",
      why: "The attendant's entire job reduces to two rules — stay in contact, and never go in yourself — and continuous genuinely means continuous, not a check-in every couple of minutes. This vault holds standing water at the bottom and a sewer tie-in that breathes with the mains, either of which can turn the air bad between one reading and the next, and the entrant going quiet on the radio is the only warning anyone topside gets before that becomes an emergency instead of a job.",
      holdBreakNote: "Contact dropped. The attendant lost the entrant — re-establish and hold it all the way down.",
    },
    {
      id: "exit", kind: "select", target: "permit-board",
      title: "Close the permit",
      cue: "Entrant out, headcount, sign the permit closed.",
      why: "A permit does not close itself the moment the last boot clears the ladder — it closes against a headcount, with the space secured and the isolation still standing until the supervisor is satisfied nobody is unaccounted for. A permit left open while the crew is already coiling hose is exactly the condition that gets somebody sent back down alone, on nobody's authority, to fetch a dropped tool.",
    },
  ],

  interrupts: [
    {
      id: "meter-on-the-chest",
      kind: "Monitoring gap",
      after: "retrieval", delay: 3, seconds: 12,
      alert: "The four-gas meter has gone into alarm — and it is still lying on the tool chest where you took the pre-entry readings from.",
      cue: "The reading that authorised this entry was taken twenty minutes ago, from up here.",
      target: "gas-meter",
      why: "A pre-entry test is a photograph of an atmosphere, and a valve vault does not hold still for it. There is standing water at the bottom of that shaft, the sewer connection breathes with the mains, and the ventilation only suppresses what the space is producing for as long as the fan runs. That is why the regulation asks for continuous monitoring in a space where conditions can change, and why the meter belongs clipped at the entrant's collar, in their breathing zone, going down with them — not sat on a box at street level telling nobody anything.",
      missNote: "The entrant went down on a twenty-minute-old reading with the meter still on the chest. If the atmosphere had moved while they were on the ladder, the first indication anybody topside would have had is the attendant noticing they had stopped answering.",
      wrongNote: "It is the meter. It is alarming where it sits, and where it sits is the wrong place for it — it goes on the entrant before the entrant goes anywhere.",
    },
    {
      id: "blower-stopped",
      kind: "Ventilation lost",
      after: "comms", delay: 4, seconds: 13,
      alert: "The blower has gone quiet behind you. Somebody moving a barrow across the footway has dragged the lead out of the wagon, and your entrant is at the bottom of the shaft.",
      cue: "The only thing holding that atmosphere down was the fan.",
      target: "blower",
      why: "Ventilation in a vault like this is not a pre-entry measure that can be called done — it is a continuous control, and the space starts going back to what it wants to be the second the air stops moving. Hydrogen sulphide comes off standing water steadily and it sits low, which means it reaches the entrant at the bottom long before anything changes for the attendant at the top. You do not leave the opening, you do not shout down for a report: the fan goes back on, because the entrant cannot fix this and everything else is downstream of it.",
      missNote: "The fan stayed off with somebody in the space. The attendant kept hold of the conversation right up until the entrant stopped making sense, which is what oxygen deficiency and H2S both sound like from the top of a shaft.",
      wrongNote: "It is the blower. There is a person breathing the air that fan was moving, and nothing else on this job outranks getting it running again.",
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
    // Run lamp on the blower case: green while it is moving air, red the
    // moment it is not. This is what the ventilation interruption changes.
    const runLampGood = mat(0x59c97b, { emissive: 0x59c97b, ei: 2.0, rough: 0.4 });
    const runLampBad = mat(0xf0645b, { emissive: 0xf0645b, ei: 2.8, rough: 0.4 });
    const blowerLamp = ball(blower, 0.028, -0.14, 0.44, 0.16, 0x59c97b, { emissive: 0x59c97b, ei: 2.0, rough: 0.4 });
    blowerLamp.material = runLampGood;

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
    // Alarm bezel on the meter — dark until it goes off where it was left.
    const meterAlarm = ball(meter, 0.022, 0, 0.1, 0, 0xf0645b, { emissive: 0xf0645b, ei: 3.0, rough: 0.4 });
    meterAlarm.visible = false;
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
    let meterAlarming = false;

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

      // Both of these are visible from where the attendant stands: the fan
      // stops turning and its lamp goes red, and the meter lights up on the
      // chest instead of on the entrant.
      onInterrupt(it) {
        if (it.id === "meter-on-the-chest") { meterAlarm.visible = true; meterAlarming = true; }
        if (it.id === "blower-stopped") { ventilating = false; blowerLamp.material = runLampBad; }
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "meter-on-the-chest") { meterAlarm.visible = false; meterAlarming = false; }
        if (it.id === "blower-stopped") { ventilating = true; blowerLamp.material = runLampGood; }
      },

      animate(t, dt, session) {
        if (ventilating) fanBlades.rotation.z += dt * 12;
        if (meterAlarming) meterAlarm.material.emissiveIntensity = 1.6 + Math.sin(t * 11) * 1.4;
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
