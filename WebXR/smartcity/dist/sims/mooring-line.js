import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import { box, cyl, ball, slab, hose, group, decal, repaint, signFace, particles } from "../../../shared/kit.js";
import { CITY, stationPad, holoPanel, holoTag, toolChest, cone, instrument, standingFigure, reg } from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Mooring Line VR — Maritime & Ports, station three.
// Taking a ship's lines on the wharf: a mooring line under tension stores
// enough energy to kill anyone standing in its snap-back zone when it parts.
// The line handler's job is to be where the zone is not, to keep hands out of
// bights and off the bollard until the line is stopped, and to talk to the
// ship on the radio rather than guess what the winch is about to do.

const ML_ACCENT = 0x4fb3e8;

export const SIM_MOORING_LINE = {
  id: "mooring-line",
  index: "29",
  domain: "Maritime",
  trade: "Line handler / wharf mooring crew",
  category: "Maritime & Ports",
  weather: "wind",
  certification: "ILWU / SIU — OSHA 29 CFR 1917 marine terminals (mooring operations); OCIMF Mooring Equipment Guidelines snap-back awareness; port authority line-handling qualification",
  name: "Mooring Line",
  title: simTitle("Mooring Line"),
  tagline: "Taking a ship's lines: snap-back zone, heaving line, eye on the bollard, tension by radio, stopper, and the bight you never stand in",
  accent: ML_ACCENT,
  accentCss: "#4fb3e8",
  parSeconds: 230,
  footprint: 2.4,
  badge: { id: "out-of-the-bight", name: "Out of the Bight", note: "Every line taken from outside the snap-back zone, hands clear, tension called by radio, stopper held" },

  game: system({
    name: "Wharf Authority",
    currency: "LINE",
    ranks: ["Line Handler", "Lead Handler", "Mooring Boss", "Wharf Supervisor", "Wharf Authority Certified"],
    badges: [
      { id: "zone-read", name: "Zone Read", note: "Snap-back zone identified before the first line came ashore", test: AWARD.stepClean("zone") },
      { id: "clear-hands", name: "Clear Hands", note: "Never in a bight, never on a live bollard, never in the zone", test: AWARD.safe },
      { id: "tension-true", name: "Tension True", note: "Line tension called inside the ship's figure", test: AWARD.precise(0.7) },
    ],
    challenges: [
      { id: "clean-mooring", name: "Clean Mooring", note: "No corrections through the whole mooring", test: AWARD.clean },
      { id: "stopper-held", name: "Stopper Held", note: "Held the stopper the full transfer", test: AWARD.unbroken },
      { id: "all-fast", name: "All Fast", note: "All fast inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "in-bight": "You stood inside the bight of the line on the wharf. When the winch takes up, the bight closes on whatever is inside it — a leg, at a speed no one steps out of.",
    "snap-back-zone": "You stood in line with the tensioned mooring line. When a line parts, it whips back through that zone faster than you can see it; the zone is painted on the wharf so nobody has to guess where not to stand.",
    "hand-on-bollard": "You put your hand on the bollard while the eye was being slacked. Fingers between the eye and the bollard are gone the moment the ship takes up.",
    "heaving-line-catch": "You went to catch the heaving line's monkey's fist in the air. It is weighted; you let it land, then pick it up — a caught fist is a broken hand.",
  },

  lateNotes: {
    "line-eye": "The heaving line comes first — the mooring line reaches the wharf on it, not by hand.",
    "stopper": "Nothing to stopper until the line is on the bollard and taking tension.",
  },

  steps: [
    {
      id: "plan", kind: "select", target: "mooring-plan",
      title: "Read the mooring plan",
      cue: "Check the berth, the line plan — head, breast, spring — and which bollards take which lines.",
      why: "The plan is the ship's, agreed with the wharf. It says where each line goes and in what order, so the handlers are at the right bollard before the line arrives.",
    },
    {
      id: "ppe", kind: "sequence", anyOrder: true,
      targets: ["hi-vis", "life-vest", "gloves-boots"],
      itemNames: { "hi-vis": "hi-vis", "life-vest": "life vest", "gloves-boots": "gloves and boots" },
      title: "Hi-vis, life vest, gloves and boots",
      cue: "Visible to the ship, buoyant if you go over the edge, hands and feet protected.",
      why: "A line handler works at the wharf edge, at night, under a ship's lights. Seen, floating and gripping is the minimum.",
    },
    {
      id: "zone", kind: "select", target: "zone-marking",
      title: "Identify the snap-back zone",
      cue: "Read the painted zone at the bollard and stand outside it before the line comes.",
      why: "The zone is where a parted line goes. It is marked so the decision is made before the line is under load, not during.",
    },
    {
      id: "radio", kind: "select", target: "radio",
      title: "Establish comms with the ship",
      cue: "Radio check with the mooring officer: which line, which bollard, when to take up.",
      why: "The winch is on the ship and the bollard is on the wharf. Everything between them is a radio call — nobody on the wharf guesses when the ship will heave.",
    },
    {
      id: "heaving", kind: "select", target: "heaving-line",
      title: "Take the heaving line",
      cue: "Let the monkey's fist land on the wharf, then pick up the heaving line and haul.",
      why: "The heaving line is how a hundred metres of mooring line crosses the gap. The fist is weighted to fly; it is picked up off the deck, never caught.",
    },
    {
      id: "haul", kind: "track", target: "haul-line", seconds: 7,
      title: "Haul the mooring line ashore",
      cue: "Haul hand over hand, steady, keeping the line moving and your body out of the bight.",
      why: "Steady hauling keeps the eye coming; stopping lets the line drop into the water and drift under the ship. Hands stay on the line, feet stay out of every loop it makes on the wharf.",
      track: { start: 0.1, green: [0.4, 0.6], rise: 0.6, fall: 0.5, drift: 0.12, label: "HAUL", readout: (v) => (v < 0.4 ? "line dropping" : v > 0.6 ? "too fast" : "steady") },
      holdBreakNote: "Haul fell off — the eye dropped into the water. Bring it back steady.",
    },
    {
      id: "eye", kind: "drag", target: "line-eye",
      title: "Drop the eye on the bollard",
      cue: "Carry the eye to the bollard and drop it over — hands on the outside of the eye.",
      why: "The eye goes over the bollard from the outside, and the hands come off before the ship takes any weight.",
      drag: { to: "bollard-socket", radius: 0.4, missNote: "Not over the bollard — drop the eye square over the post." },
    },
    {
      id: "tension", kind: "gauge", target: "tension-call",
      title: "Call the tension",
      cue: "Watch the line take up and call the ship to stop heaving inside the working tension.",
      why: "The ship cannot see the line at the bollard. The handler calls when it is fair and tight — before it is bar-taut, which is the tension a line parts at.",
      gauge: { label: "TENSION", speed: 0.75, green: [0.44, 0.6], readout: (t) => `${Math.round(t * 60)} t`, missNote: "Called it wrong — slack or bar-taut. Watch the line and call it inside the working range." },
    },
    {
      id: "stopper", kind: "hold", target: "stopper", seconds: 4,
      title: "Hold the stopper for the transfer",
      cue: "Hold the stopper on the line while the ship transfers it from winch drum to bitts.",
      why: "The stopper holds the load while the ship makes the line fast on board. Let it go early and the line runs — with your hands near it.",
      holdBreakNote: "Stopper released before the transfer — the line surged. Hold it until the ship calls made fast.",
    },
    {
      id: "walk", kind: "find", noHint: true,
      targets: ["chafed-line"],
      itemNames: { "chafed-line": "chafed line at the fairlead" },
      itemNotes: { "chafed-line": "The spring line is chafed through half its strands where it crosses the wharf edge with no chafe guard. That line parts on the next surge — it gets reported to the ship now." },
      title: "Walk the lines before all fast",
      cue: "Look at every line from bollard to fairlead and click the one that will not hold.",
      why: "A line parts where it is weakest, and the wharf handler is the only one who sees the wharf end. The walk is the last look before the ship is all fast.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.4, ML_ACCENT);
    // Wharf deck with the edge and water beyond; the ship's hull looms at the back.
    box(g, 5.6, 0.14, 3.4, 0, 0.07, 0.8, 0x6b6f66, { rough: 0.95 });
    box(g, 5.6, 0.2, 0.1, 0, 0.1, -0.9, 0xe8b02e, { rough: 0.7 });
    slab(g, 5.6, 0.01, 1.8, 0, 0.0, -1.9, 0x1f4e6a, { rough: 0.2, metal: 0.2, opacity: 0.8, transparent: true, cast: false });
    box(g, 5.8, 3.2, 0.5, 0, 1.6, -2.7, 0x3a3f45, { rough: 0.8, metal: 0.3 });
    box(g, 5.8, 0.2, 0.6, 0, 3.3, -2.7, 0xe8eef2, { rough: 0.6 });
    const fairlead = group(g, 0.6, 2.2, -2.45);
    box(fairlead, 0.3, 0.2, 0.1, 0, 0, 0, 0x8a949d, { rough: 0.4, metal: 0.7 });
    // Bollard with the painted snap-back zone around it.
    const bollard = group(g, 0.4, 0.14, 0.6);
    cyl(bollard, 0.16, 0.2, 0.6, 0, 0.3, 0, 0x2b2f34, { rough: 0.6, metal: 0.5, seg: 18 });
    cyl(bollard, 0.2, 0.16, 0.1, 0, 0.62, 0, 0x2b2f34, { rough: 0.6, metal: 0.5, seg: 18 });
    const bollardSocket = cyl(bollard, 0.2, 0.2, 0.02, 0, 0.55, 0, 0xffffff, { rough: 0.5 });
    bollardSocket.visible = false; hits["bollard-socket"] = bollardSocket;
    const handOnBollard = box(bollard, 0.5, 0.2, 0.5, 0, 0.6, 0, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, handOnBollard, "hand-on-bollard");
    const zone = group(g, 0.4, 0.145, 0.6);
    const zoneFace = decal(zone, 2.6, 1.6, 0.4, 0, -0.9, (ctx, w, h) => {
      ctx.fillStyle = "rgba(210,49,43,0.28)"; ctx.beginPath(); ctx.moveTo(0, h * 0.45); ctx.lineTo(w, 0); ctx.lineTo(w, h); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = "#f2c14b"; ctx.lineWidth = 8; ctx.setLineDash([24, 16]); ctx.stroke();
      ctx.fillStyle = "#ffffff"; ctx.font = `600 ${Math.round(h * 0.16)}px 'Barlow Condensed', Arial, sans-serif`; ctx.textAlign = "center"; ctx.textBaseline = "middle";
      ctx.fillText("SNAP-BACK ZONE", w * 0.62, h * 0.5);
    }, { px: 512 });
    zoneFace.rotation.x = -Math.PI / 2;
    reg(hits, zoneFace, "zone-marking");
    const inZone = box(zone, 1.0, 0.1, 0.8, 1.0, 0.1, -0.9, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, inZone, "snap-back-zone");
    // Mooring line from the fairlead to the wharf, with its eye and a bight lying on the deck.
    const lineRun = hose(g, [[0.6, 2.1, -2.4], [0.5, 1.2, -1.2], [0.45, 0.2, 0.0], [1.4, 0.16, 0.9], [1.9, 0.16, 1.4], [1.3, 0.16, 1.8]], 0.03, 0xd9cbb2, { steps: 30 });
    const bight = slab(g, 0.8, 0.005, 0.7, 1.6, 0.145, 1.5, 0xd2312b, { rough: 0.6, opacity: 0.25, transparent: true, cast: false });
    holoTag(g, "bight — never inside it", 1.6, 0.4, 1.5, { css: "#d2312b", w: 0.36 });
    reg(hits, bight, "in-bight");
    const eye = group(g, 1.3, 0.16, 1.8);
    cyl(eye, 0.16, 0.16, 0.03, 0, 0, 0, 0xd9cbb2, { rough: 0.8, seg: 16, open: true, side: 2 });
    cyl(eye, 0.19, 0.19, 0.03, 0, 0, 0, 0xd9cbb2, { rough: 0.8, seg: 16, open: true, side: 2 });
    holoTag(eye, "the eye", 0, 0.16, 0, { css: "#4fb3e8", w: 0.18 });
    reg(hits, eye, "line-eye");
    const haul = box(g, 0.6, 0.3, 0.6, 0.45, 0.3, 0.0, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "haul — hand over hand", 0.45, 0.6, 0.0, { css: "#4fb3e8", w: 0.34 });
    reg(hits, haul, "haul-line");
    // Heaving line with the monkey's fist landed on the deck.
    const heaving = group(g, -1.2, 0.14, 0.3);
    ball(heaving, 0.05, 0, 0.05, 0, 0x8a6a4a, { rough: 0.9 });
    hose(heaving, [[0, 0.05, 0], [-0.4, 0.05, -0.5], [-0.3, 1.0, -2.2]], 0.008, 0xe8eef2, { steps: 14 });
    holoTag(heaving, "monkey's fist — landed", 0, 0.3, 0, { css: "#4fb3e8", w: 0.36 });
    reg(hits, heaving, "heaving-line");
    const catchZone = box(g, 0.4, 0.4, 0.4, -1.2, 1.4, -0.4, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "catch it in the air?", -1.2, 1.7, -0.4, { css: "#d2312b", w: 0.32 });
    reg(hits, catchZone, "heaving-line-catch");
    // Stopper, radio, PPE, plan.
    const stopper = group(g, 0.9, 0.14, 0.2);
    cyl(stopper, 0.02, 0.02, 0.5, 0, 0.05, 0, 0x22262b, { rough: 0.7, seg: 8 }).rotation.z = 0.4;
    holoTag(stopper, "stopper", 0, 0.3, 0, { css: "#4fb3e8", w: 0.18 });
    reg(hits, stopper, "stopper");
    const chest = toolChest(g, -2.0, 1.6, { ry: 0.7, color: 0x2f4f6f });
    const radio = instrument(chest, -0.1, 0.79, 0, { ry: 0.3, idle: "CH 12", color: 0x4fb3e8, w: 0.1, d: 0.16 });
    holoTag(radio, "radio — mooring officer", 0, 0.15, 0, { css: "#4fb3e8", w: 0.4 });
    reg(hits, radio, "radio");
    const tensionCall = instrument(chest, 0.12, 0.79, 0.1, { ry: 0, idle: "-- t", color: 0x4fb3e8, w: 0.1, d: 0.16 });
    holoTag(tensionCall, "call tension", 0, 0.15, 0, { css: "#4fb3e8", w: 0.24 });
    reg(hits, tensionCall, "tension-call");
    for (const [id, dx, color, label] of [["hi-vis", -0.2, 0xe4622a, "HI-VIS"], ["life-vest", 0.0, 0xe8b02e, "VEST"], ["gloves-boots", 0.2, 0x1f4d3a, "GLOVES"]]) {
      const it = group(chest, dx, 0.95, -0.12);
      box(it, 0.14, 0.08, 0.1, 0, 0, 0, color, { rough: 0.8 });
      decal(it, 0.12, 0.04, 0, 0.041, 0, signFace(label, { bg: "#1b1e22", accent: "#ffffff", scale: 0.5 })).rotation.x = -Math.PI / 2;
      reg(hits, it, id);
    }
    const plan = group(g, 2.2, 0, 1.4, -0.8);
    holoPanel(plan, 0.9, 0.6, 0, 1.25, 0, (ctx, w, h) => {
      ctx.fillStyle = "#08161f"; ctx.fillRect(0, 0, w, h); ctx.fillStyle = "#4fb3e8"; ctx.fillRect(0, 0, w, 6);
      ctx.font = `600 ${Math.round(h * 0.11)}px 'Barlow Condensed', Arial, sans-serif`; ctx.textAlign = "left"; ctx.textBaseline = "middle";
      ctx.fillText("MOORING PLAN — BERTH 9, MV HARBOUR STAR", w * 0.06, h * 0.14);
      ctx.font = `${Math.round(h * 0.08)}px Arial, sans-serif`; ctx.fillStyle = "#dcefff";
      ["Lines: 2 head, 2 breast, 2 spring each end", "Bollard 14: fwd spring", "Working tension: 26–36 t", "Stand outside painted zones",
       "Comms: CH 12, mooring officer", "All fast on ship's call only"].forEach((l, i) => ctx.fillText(l, w * 0.06, h * (0.3 + i * 0.11)));
    }, { accent: ML_ACCENT });
    reg(hits, plan, "mooring-plan");
    // Chafed spring line at the wharf edge — the find target.
    const chafe = group(g, -0.8, 0.2, -0.85);
    cyl(chafe, 0.03, 0.03, 0.5, 0, 0, 0, 0xd9cbb2, { rough: 0.9, seg: 10 }).rotation.x = Math.PI / 2;
    box(chafe, 0.1, 0.05, 0.06, 0, 0.02, 0, 0x8a6a4a, { rough: 0.95 });
    reg(hits, chafe, "chafed-line");
    standingFigure(g, -2.3, -0.2, { ry: 1.0, cloth: 0xe4622a });
    cone(g, 2.5, -0.5);
    const spray = particles(g, 30, 0xbfe6f5, { size: 0.02, life: 0.8, additive: false, opacity: 0.4 });

    return {
      hits,
      spawnLook: new THREE.Vector3(0.4, 0.8, 0.2),
      onStep() {},
      onStepComplete(step) {
        if (step.id === "eye") { eye.parent.remove(eye); bollard.add(eye); eye.position.set(0, 0.56, 0); eye.rotation.set(0, 0, 0); }
        if (step.id === "walk") chafe.visible = false;
      },
      onHazard() {},
      animate(t, dt, session) {
        const step = session?.step;
        spray.visible = true; spray.userData.step(dt, new THREE.Vector3(-1.5, 0.05, -1.4), 1.5, 0.3, -0.2);
        const gg = session?.gauge;
        if (gg && !gg.committed && step?.id === "tension") repaint(tensionCall.userData.screen, signFace(`${Math.round(gg.t * 60)} t`, { bg: "#0d1c24", accent: gg.t >= 0.44 && gg.t <= 0.6 ? "#59c97b" : "#f2ae14", fg: "#bfeaf7", scale: 0.62 }));
      },
    };
  },
};
