import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import { box, cyl, ball, slab, group, decal, repaint, signFace } from "../../../shared/kit.js";
import { CITY, stationPad, holoPanel, holoTag, instrument, standingFigure, lockTag, equipmentCabinet, reg } from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Microwave Backhaul VR — Connectivity & Telecom, station four.
// Re-aligning a rooftop microwave link after a storm: the RF survey and the
// site's maximum permissible exposure boundary read before anyone goes past
// the sign, the far-end transmitter keyed down and locked out, the rooftop
// fall hazard managed, the dish freed, panned and tilted onto the far site
// by receive-signal level, the polarisation checked, everything torqued and
// weatherproofed, and the link handed back on a proven path.

const MB_ACCENT = 0x5fd3c8;

export const SIM_MICROWAVE_BACKHAUL = {
  id: "microwave-backhaul",
  index: "42",
  domain: "Connectivity & Telecom",
  trade: "Microwave / RF technician — backhaul",
  category: "Connectivity & Telecom",
  weather: "overcast",
  certification: "CWA and IBEW telecom locals; FCC 47 CFR 1.1310 maximum permissible exposure and OSHA 29 CFR 1910.268(p) RF work practices; NATE CTS tower/rooftop climber; TIA-222 structural loading and TIA-1019 rigging",
  name: "Microwave Backhaul",
  title: simTitle("Microwave Backhaul"),
  tagline: "Rooftop link re-alignment: RF survey and MPE boundary, far end keyed down and locked out, fall protection before the parapet, dish freed, panned and tilted on receive level, polarisation proven, torqued, weatherproofed, path handed back",
  accent: MB_ACCENT,
  accentCss: "#5fd3c8",
  parSeconds: 250,
  footprint: 2.4,
  badge: { id: "path-restored", name: "Path Restored", note: "A link re-aligned with the far end locked out, the boundary respected and the receive level inside spec — first time" },

  game: system({
    name: "Backhaul Ops",
    currency: "dBm",
    ranks: ["Helper", "RF Technician", "Link Engineer", "Backhaul Lead", "Backhaul Ops Certified"],
    badges: [
      { id: "keyed-down", name: "Keyed Down", note: "Far end down and locked before anyone went past the sign, first time", test: AWARD.stepClean("lockout") },
      { id: "boundary-kept", name: "Boundary Kept", note: "Never in the beam live, never on the parapet unanchored", test: AWARD.safe },
      { id: "on-the-path", name: "On the Path", note: "Receive level and azimuth both inside the band", test: AWARD.precise(0.7) },
    ],
    challenges: [
      { id: "clean-align", name: "Clean Alignment", note: "No corrections anywhere on the roof", test: AWARD.clean },
      { id: "steady-pan", name: "Steady Pan", note: "Pan held steady through the whole sweep", test: AWARD.unbroken },
      { id: "link-fast", name: "Link Up Fast", note: "Path restored inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "in-beam-live": "You stepped in front of a live microwave feed. At the dish face a backhaul link is far above the maximum permissible exposure limit; the injury is thermal, it is to the eyes and skin, and there is nothing to feel until the damage is done.",
    "parapet-unanchored": "You worked at the parapet with no anchor. A rooftop edge is a fall hazard at any height, and a dish that swings while you are leaning on it takes your balance with it.",
    "climb-with-tools-loose": "You went up with loose tools and hardware in an open pouch. Anything dropped from a roof is lethal on the pavement below; tools are tethered and hardware is in a closed container before the ladder.",
    "hot-swap-waveguide": "You opened the waveguide flange with the transmitter still keyed. Opening a pressurised, energised waveguide sprays the dry air charge and puts the full transmit power out of an open flange at head height.",
  },

  lateNotes: {
    "pan-control": "The dish pans after the far end is down, the dish is unclamped and the technician is anchored — a dish that swings on a live path is the exposure.",
    "tilt-control": "Tilt follows the pan: find the azimuth first, then walk the elevation into the band.",
    "rsl-meter": "Receive level means nothing until the far end is keyed back up on the test carrier.",
  },

  steps: [
    {
      id: "survey", kind: "select", target: "rf-survey",
      title: "Read the RF site survey",
      cue: "Check the rooftop's emitters, the MPE boundary and which links are live.",
      why: "A rooftop carries other people's antennas. The survey says which are transmitting, where the boundary is and who has to be called before you cross it.",
    },
    {
      id: "boundary", kind: "select", target: "mpe-sign",
      title: "Find the MPE boundary",
      cue: "Locate the RF notice and the marked boundary in front of the dish face.",
      why: "The boundary is where the field exceeds the exposure limit for an occupational worker. It is marked so the crew knows what 'stand clear' means in metres, not in feel.",
    },
    {
      id: "callfar", kind: "select", target: "radio-far-end",
      title: "Call the far end",
      cue: "Raise the far site on the radio and get the link scheduled down with the network operations centre.",
      why: "The other end of a link is a radio somewhere else that nobody on this roof controls. It comes down by agreement, logged, before a hand touches the dish.",
    },
    {
      id: "lockout", kind: "sequence",
      targets: ["tx-key-down", "tx-breaker", "tx-lock"],
      itemNames: { "tx-key-down": "transmitter keyed down", "tx-breaker": "transmit breaker open", "tx-lock": "lock and tag" },
      title: "Key down and lock out the transmitter",
      cue: "Key the local transmitter down, open its breaker, then lock and tag it.",
      why: "Keyed down is a software state and software states come back. The breaker and the lock are what stop the radio re-keying on a timer or a remote hand while you are in front of the dish.",
      outOfOrderNote: "Key down, then breaker, then lock — the radio is quiet before the power is removed, and the lock goes on last.",
    },
    {
      id: "fall", kind: "sequence", anyOrder: true,
      targets: ["anchor-point", "harness-lanyard", "tool-tether"],
      itemNames: { "anchor-point": "roof anchor", "harness-lanyard": "harness and lanyard", "tool-tether": "tools tethered" },
      title: "Set up for the parapet",
      cue: "Clip the lanyard to the certified roof anchor, check the harness, tether every tool.",
      why: "The dish is at the edge. The anchor holds the technician, the tether holds everything else, and the pavement below is a public sidewalk.",
    },
    {
      id: "inspect", kind: "find", noHint: true,
      targets: ["mount-crack", "loose-radome"],
      itemNames: { "mount-crack": "cracked mount weld", "loose-radome": "torn radome cover" },
      itemNotes: {
        "mount-crack": "The azimuth mount's weld is cracked through on the near side — this is why the link drifted in the storm.",
        "loose-radome": "The radome cover has torn free along its lower edge and is letting water into the feed.",
      },
      title: "Inspect the mount and radome",
      cue: "Look over the whole assembly and click the storm damage you find.",
      why: "A link that drifted did not drift on its own. The damage is found and recorded before the alignment, or the alignment walks off again in the next wind.",
    },
    {
      id: "unclamp", kind: "turn", target: "azimuth-clamp",
      title: "Free the azimuth clamp",
      cue: "Back the azimuth clamp off far enough for the dish to swing under hand pressure.",
      why: "The clamp holds the dish against wind load. It is loosened, not removed, so the dish is always held enough to stop it running away when the wind takes the face.",
      turn: { turns: 1, axis: "y", label: "AZ CLAMP" },
    },
    {
      id: "pan", kind: "track", target: "pan-control", seconds: 7,
      title: "Pan onto the far site",
      cue: "Sweep the dish slowly across the far site's bearing — steady, no jerks.",
      why: "A backhaul beam is a couple of degrees wide. Sweeping slowly is the only way to find the main lobe instead of locking onto a side lobe that will drop the link in the first rain.",
      track: { start: 0.1, green: [0.4, 0.6], rise: 0.6, fall: 0.5, drift: 0.12, label: "PAN", readout: (v) => (v < 0.4 ? "stopped" : v > 0.6 ? "sweeping past" : "steady sweep") },
      holdBreakNote: "Sweep rate out of band — you will pass the main lobe. Settle it and hold.",
    },
    {
      id: "tilt", kind: "gauge", target: "tilt-control",
      title: "Set the elevation",
      cue: "Walk the tilt through the peak and commit at the highest receive level.",
      why: "Elevation is the other half of the beam. The peak is a single point in two axes, and the number on the meter is the only honest way to find it.",
      gauge: { label: "ELEVATION", speed: 0.7, green: [0.46, 0.6], readout: (t) => `${((t - 0.5) * 12).toFixed(1)}°`, missNote: "Off the peak — walk the tilt back through and watch the level." },
    },
    {
      id: "rsl", kind: "gauge", target: "rsl-meter",
      title: "Confirm the receive level",
      cue: "With the far end on the test carrier, commit when the receive level is inside the design figure.",
      why: "The design receive level is what the path was engineered for. A link three decibels low works on a clear day and fails in the rain fade it was built to survive.",
      gauge: { label: "RSL", speed: 0.75, green: [0.5, 0.64], readout: (t) => `${Math.round(-80 + t * 50)} dBm`, missNote: "Below the design figure — re-peak the pan and tilt before you accept the path." },
    },
    {
      id: "close", kind: "sequence",
      targets: ["torque-clamp", "weatherproof", "handback"],
      itemNames: { "torque-clamp": "clamps torqued", "weatherproof": "connectors weatherproofed", handback: "path handed back" },
      title: "Torque, weatherproof and hand back",
      cue: "Torque the azimuth and elevation clamps to spec, re-tape the connectors, then hand the path back to the operations centre.",
      why: "The alignment lasts exactly as long as the clamp torque and the weatherproofing. The hand-back is what tells the network the link is carrying traffic again.",
      outOfOrderNote: "Torque, then weatherproof, then hand back — the link is mechanically and physically sound before it carries traffic.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.4, MB_ACCENT);
    // Rooftop deck with a parapet on the -z side.
    box(g, 5.6, 0.1, 4.8, 0, 0.05, 0, 0x6b6660, { rough: 0.95 });
    box(g, 5.6, 0.7, 0.2, 0, 0.45, -2.3, 0x7b756d, { rough: 0.9 });
    box(g, 5.6, 0.08, 0.3, 0, 0.83, -2.3, 0x8d867d, { rough: 0.85 });
    for (let i = -4; i <= 4; i++) box(g, 0.05, 0.02, 4.6, i * 0.6, 0.101, 0, 0x5d5852, { rough: 0.95, cast: false });
    // The dish assembly on a mast at the parapet.
    const mastBase = group(g, -0.9, 0.1, -1.8);
    box(mastBase, 0.7, 0.12, 0.7, 0, 0.06, 0, 0x3a4550, { rough: 0.7, metal: 0.4 });
    cyl(mastBase, 0.06, 0.07, 2.6, 0, 1.3, 0, 0x8b98a5, { rough: 0.5, metal: 0.7, seg: 14 });
    const azPivot = group(mastBase, 0, 1.9, 0);
    const elPivot = group(azPivot, 0, 0, 0);
    const dish = group(elPivot, 0, 0, 0);
    cyl(dish, 0.5, 0.5, 0.06, 0, 0, 0.1, 0xdfe6ec, { rough: 0.45, metal: 0.3, seg: 28 }).rotation.x = Math.PI / 2;
    cyl(dish, 0.52, 0.5, 0.18, 0, 0, 0.02, 0xc9d0d6, { rough: 0.5, metal: 0.3, seg: 28, open: true }).rotation.x = Math.PI / 2;
    const radome = cyl(dish, 0.51, 0.51, 0.02, 0, 0, 0.16, 0x2b3138, { rough: 0.7, seg: 28 });
    radome.rotation.x = Math.PI / 2;
    for (const sx of [-1, 1]) cyl(dish, 0.012, 0.012, 0.42, sx * 0.1, 0, 0.32, 0x8b98a5, { rough: 0.4, metal: 0.8, seg: 6 }).rotation.x = Math.PI / 2;
    const feed = cyl(dish, 0.05, 0.05, 0.14, 0, 0, 0.44, 0x59636d, { rough: 0.5, metal: 0.6, seg: 12 });
    feed.rotation.x = Math.PI / 2;
    holoTag(dish, "backhaul dish — link 7", 0, 0.68, 0.1, { css: "#5fd3c8", w: 0.4 });
    const torn = box(dish, 0.3, 0.05, 0.03, 0.1, -0.46, 0.17, 0x1b1e22, { rough: 0.9 });
    reg(hits, torn, "loose-radome");
    const crack = box(azPivot, 0.14, 0.02, 0.06, -0.12, -0.18, 0, 0x1b1e22, { rough: 0.95 });
    reg(hits, crack, "mount-crack");
    const azClamp = cyl(azPivot, 0.09, 0.09, 0.08, 0, -0.3, 0, 0xf2c14b, { rough: 0.5, metal: 0.5, seg: 14 });
    holoTag(azPivot, "azimuth clamp", 0, -0.52, 0.2, { css: "#5fd3c8", w: 0.28 });
    reg(hits, azClamp, "azimuth-clamp");
    // The live beam zone in front of the face, and the MPE sign that marks it.
    const beam = cyl(g, 0.55, 1.5, 3.0, -0.9, 2.0, -0.3, 0xf0645b, { opacity: 0.09, transparent: true, rough: 0.5, cast: false, seg: 18, open: true });
    beam.rotation.x = Math.PI / 2;
    const beamHit = box(g, 1.2, 1.4, 1.2, -0.9, 1.6, 0.6, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "stand in the beam?", -0.9, 2.5, 0.6, { css: "#d2312b", w: 0.34 });
    reg(hits, beamHit, "in-beam-live");
    const sign = group(g, 0.1, 0.1, -0.9);
    cyl(sign, 0.02, 0.02, 1.2, 0, 0.6, 0, 0x8b98a5, { rough: 0.5, metal: 0.6, seg: 8 });
    decal(sign, 0.42, 0.3, 0, 1.25, 0.02, signFace("RF NOTICE\nMPE BOUNDARY", { bg: "#3a2a06", accent: "#f2c14b", scale: 0.42 }));
    holoTag(sign, "MPE boundary", 0, 1.55, 0, { css: "#f2c14b", w: 0.26 });
    reg(hits, sign, "mpe-sign");
    for (let i = -2; i <= 2; i++) box(g, 0.12, 0.004, 0.12, -0.9 + i * 0.3, 0.102, 0.35, 0xf2c14b, { rough: 0.8, cast: false });
    // Equipment cabinet: radio, breaker, lock, meters.
    const cab = equipmentCabinet(g, 0.9, 1.4, 0.55, 1.7, 0.9, { ry: -0.6, color: 0x53606b });
    holoTag(cab, "radio cabinet — link 7", 0, 1.6, 0.35, { css: "#5fd3c8", w: 0.42 });
    const keyDown = instrument(cab, -0.22, 1.0, 0.3, { idle: "TX ON", color: 0xd2312b, w: 0.13, d: 0.2 });
    holoTag(cab, "transmitter", -0.22, 1.2, 0.32, { css: "#5fd3c8", w: 0.24 });
    reg(hits, keyDown, "tx-key-down");
    const breaker = box(cab, 0.09, 0.14, 0.05, 0.05, 1.0, 0.3, 0xf2c14b, { rough: 0.5, metal: 0.3 });
    holoTag(cab, "transmit breaker", 0.05, 1.2, 0.32, { css: "#5fd3c8", w: 0.3 });
    reg(hits, breaker, "tx-breaker");
    const lock = lockTag(cab, 0.28, 1.0, 0.31, {});
    holoTag(cab, "lock and tag", 0.28, 1.2, 0.32, { css: "#5fd3c8", w: 0.24 });
    reg(hits, lock, "tx-lock");
    const rsl = instrument(cab, -0.22, 0.7, 0.3, { idle: "--- dBm", color: 0x5fd3c8, w: 0.14, d: 0.22 });
    holoTag(cab, "receive level", -0.22, 0.52, 0.32, { css: "#5fd3c8", w: 0.26 });
    reg(hits, rsl, "rsl-meter");
    const waveguide = cyl(cab, 0.05, 0.05, 0.5, 0.2, 0.68, 0.24, 0xb9bec4, { rough: 0.4, metal: 0.7, seg: 10 });
    waveguide.rotation.z = Math.PI / 2;
    holoTag(cab, "open the waveguide?", 0.2, 0.42, 0.34, { css: "#d2312b", w: 0.36 });
    reg(hits, waveguide, "hot-swap-waveguide");
    // Pan and tilt controls on a bracket beside the mast.
    const ctl = group(g, -0.2, 0.1, -1.6, -0.4);
    box(ctl, 0.3, 0.7, 0.2, 0, 0.35, 0, 0x3a4550, { rough: 0.6, metal: 0.4 });
    const panCtl = cyl(ctl, 0.03, 0.03, 0.2, -0.07, 0.78, 0, 0x1b1e23, { rough: 0.5, seg: 10 });
    holoTag(ctl, "pan", -0.07, 0.98, 0.05, { css: "#5fd3c8", w: 0.14 });
    reg(hits, panCtl, "pan-control");
    const tiltCtl = instrument(ctl, 0.08, 0.72, 0, { idle: "-.-°", color: 0x5fd3c8, w: 0.12, d: 0.18 });
    holoTag(ctl, "tilt", 0.08, 0.95, 0.05, { css: "#5fd3c8", w: 0.14 });
    reg(hits, tiltCtl, "tilt-control");
    // Fall protection: anchor, harness on a rail, tool bag.
    const anchor = group(g, 1.0, 0.1, -1.2);
    cyl(anchor, 0.09, 0.11, 0.14, 0, 0.07, 0, 0x59636d, { rough: 0.6, metal: 0.6, seg: 14 });
    const dRing = cyl(anchor, 0.06, 0.012, 0.03, 0, 0.18, 0, 0xf2c14b, { rough: 0.4, metal: 0.8, seg: 8 });
    holoTag(anchor, "certified roof anchor", 0, 0.42, 0, { css: "#5fd3c8", w: 0.4 });
    reg(hits, anchor, "anchor-point");
    void dRing;
    const harness = group(g, 1.9, 0.1, 0.3);
    box(harness, 0.3, 0.5, 0.12, 0, 0.7, 0, 0xf2c14b, { rough: 0.8 });
    cyl(harness, 0.015, 0.015, 0.7, 0.2, 0.7, 0, 0x8b98a5, { rough: 0.5, metal: 0.5, seg: 8 });
    holoTag(harness, "harness and lanyard", 0, 1.1, 0, { css: "#5fd3c8", w: 0.38 });
    reg(hits, harness, "harness-lanyard");
    const bag = group(g, 1.4, 0.1, 0.9);
    box(bag, 0.4, 0.35, 0.3, 0, 0.18, 0, 0x2b3138, { rough: 0.8 });
    const tether = cyl(bag, 0.008, 0.008, 0.4, 0.1, 0.4, 0, 0xf2c14b, { rough: 0.7, seg: 6 });
    holoTag(bag, "tool tethers", 0, 0.55, 0, { css: "#5fd3c8", w: 0.26 });
    reg(hits, bag, "tool-tether");
    void tether;
    const looseTools = box(g, 0.3, 0.2, 0.25, 0.7, 0.2, 1.3, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "take them up loose?", 0.7, 0.5, 1.3, { css: "#d2312b", w: 0.36 });
    reg(hits, looseTools, "climb-with-tools-loose");
    const edge = box(g, 2.0, 0.6, 0.5, -1.8, 0.5, -2.0, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "lean out unanchored?", -1.8, 1.1, -2.0, { css: "#d2312b", w: 0.38 });
    reg(hits, edge, "parapet-unanchored");
    // Survey board, radio, far site on the horizon, technician.
    const board = group(g, 2.0, 0, 1.9, -0.5);
    holoPanel(board, 0.95, 0.62, 0, 1.25, 0, (ctx, w, h) => {
      ctx.fillStyle = "#08201e"; ctx.fillRect(0, 0, w, h); ctx.fillStyle = "#5fd3c8"; ctx.fillRect(0, 0, w, 6);
      ctx.font = `600 ${Math.round(h * 0.11)}px 'Barlow Condensed', Arial, sans-serif`; ctx.textAlign = "left"; ctx.textBaseline = "middle";
      ctx.fillStyle = "#d3f6f1"; ctx.fillText("RF SITE SURVEY — ROOF 14", w * 0.06, h * 0.14);
      ctx.font = `${Math.round(h * 0.08)}px Arial, sans-serif`; ctx.fillStyle = "#eafbf9";
      ["Link 7: 18 GHz to Sutro site, brg 041°", "Design RSL: -42 dBm; alarm at -50", "MPE boundary: 3 m in front of the face", "Other emitters: 2 panel sets, live, S side", "Far end down by NOC ticket only", "Anchor: SW corner, certified 2026", "Torque: az/el clamps 40 N·m"].forEach((l, i) => ctx.fillText(l, w * 0.06, h * (0.28 + i * 0.1)));
    }, { accent: MB_ACCENT });
    reg(hits, board, "rf-survey");
    const radio = box(g, 0.07, 0.16, 0.04, 2.35, 0.95, 1.5, 0x1b1e23, { rough: 0.6 });
    holoTag(g, "radio — far end / NOC", 2.35, 1.18, 1.5, { css: "#5fd3c8", w: 0.4 });
    reg(hits, radio, "radio-far-end");
    const torque = box(g, 0.28, 0.04, 0.05, 1.5, 0.45, 0.9, 0xb9bec4, { rough: 0.4, metal: 0.8 });
    holoTag(g, "torque wrench", 1.5, 0.62, 0.9, { css: "#5fd3c8", w: 0.26 });
    reg(hits, torque, "torque-clamp");
    const tape = cyl(g, 0.05, 0.05, 0.04, 1.75, 0.42, 0.9, 0x2b2f34, { rough: 0.8, seg: 14 });
    holoTag(g, "weatherproofing tape", 1.75, 0.6, 0.9, { css: "#5fd3c8", w: 0.38 });
    reg(hits, tape, "weatherproof");
    const handback = instrument(g, 2.1, 0.9, 1.1, { idle: "PATH DOWN", color: 0xf2c14b, w: 0.14, d: 0.22, ry: -0.5 });
    holoTag(g, "hand the path back", 2.1, 1.12, 1.1, { css: "#5fd3c8", w: 0.36 });
    reg(hits, handback, "handback");
    const tech = standingFigure(g, 0.6, 1.8, { ry: 2.8, cloth: 0x2b6f68 });
    holoTag(tech, "RF technician", 0, 1.9, 0, { css: "#5fd3c8", w: 0.26 });
    // Far site: a distant mast beyond the parapet, the bearing the dish is hunting.
    const far = group(g, 2.8, 0.1, -9.0);
    cyl(far, 0.05, 0.07, 5.0, 0, 2.5, 0, 0x8b98a5, { rough: 0.5, metal: 0.6, seg: 8 });
    cyl(far, 0.3, 0.3, 0.06, 0, 4.2, 0.2, 0xdfe6ec, { rough: 0.45, seg: 18 }).rotation.x = Math.PI / 2;
    const farLamp = ball(far, 0.08, 0, 5.1, 0, 0xff5f5f, { emissive: 0xff5f5f, ei: 1.6, cast: false, seg: 8, seg2: 6 });
    holoTag(far, "far site — Sutro", 0, 5.5, 0, { css: "#5fd3c8", w: 0.3 });

    let keyed = true, az = 0, el = 0;
    return {
      hits,
      spawnLook: new THREE.Vector3(-0.7, 1.3, -1.2),
      onStep() {},
      onStepComplete(step) {
        if (step.id === "lockout") { keyed = false; beam.visible = false; repaint(keyDown.userData.screen, signFace("TX DOWN", { bg: "#0d1c14", accent: "#59c97b", fg: "#e9ffe9", scale: 0.62 })); }
        if (step.id === "inspect") { torn.visible = false; crack.visible = false; }
        if (step.id === "rsl") repaint(handback.userData.screen, signFace("PATH UP", { bg: "#0d1c14", accent: "#59c97b", fg: "#e9ffe9", scale: 0.62 }));
      },
      onHazard() {},
      animate(t, dt, session) {
        const step = session?.step;
        farLamp.material.emissiveIntensity = 1.0 + Math.max(0, Math.sin(t * 1.2)) * 1.4;
        if (session?.turn && step?.id === "unclamp") azClamp.rotation.y = -session.turn.amount * Math.PI * 2;
        if (step?.id === "pan" && session.holding) az = Math.min(0.62, az + dt * 0.11);
        azPivot.rotation.y = az;
        const gg = session?.gauge;
        if (gg && !gg.committed && step?.id === "tilt") { el = (gg.t - 0.5) * 0.35; repaint(tiltCtl.userData.screen, signFace(`${((gg.t - 0.5) * 12).toFixed(1)}°`, { bg: "#08201e", accent: gg.t >= 0.46 && gg.t <= 0.6 ? "#59c97b" : "#f2ae14", fg: "#eafbf9", scale: 0.62 })); }
        elPivot.rotation.x = el;
        if (gg && !gg.committed && step?.id === "rsl") repaint(rsl.userData.screen, signFace(`${Math.round(-80 + gg.t * 50)} dBm`, { bg: "#08201e", accent: gg.t >= 0.5 && gg.t <= 0.64 ? "#59c97b" : "#f2ae14", fg: "#eafbf9", scale: 0.62 }));
        if (keyed) beam.material.opacity = 0.06 + Math.abs(Math.sin(t * 2)) * 0.05;
      },
    };
  },
};
