import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, ball, slab, torus, group, decal, repaint, signFace, particles, mat,
} from "../../../shared/kit.js";
import {
  CITY, stationPad, holoPanel, holoTag, toolChest, instrument, cone, barrierPanel,
  standingFigure, cylinderTank, reg,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Hazmat Entry VR — Emergency Services, station five.
// Making entry into a hot zone in a Level A encapsulated suit. The suit is the
// whole problem: it is airtight, so the entrant carries their air on their
// back and everything they can do is bounded by what is in the cylinder, and
// it is clumsy, so the things that keep them alive are done by other people —
// the buddy beside them, the backup team at the line, and the entry control
// officer whose only job is the clock and the air.

const HZ_ACCENT = 0xfbbf24;

export const SIM_HAZMAT_ENTRY = {
  id: "hazmat-entry",
  index: "56",
  domain: "Emergency response",
  trade: "Hazardous materials technician",
  category: "Emergency Services",
  weather: "wind",
  certification: "IAFF / IAEP — hazardous materials technician; OSHA 29 CFR 1910.120(q) HAZWOPER emergency response; NFPA 472/1072 competencies; 1910.134 respiratory protection for the SCBA",
  name: "Hazmat Entry",
  title: simTitle("Hazmat Entry"),
  tagline: "Level A entry on air: zones set, suit checked and pressure-tested, buddy and backup in place, air managed to the rule of thirds, out through decon",
  accent: HZ_ACCENT,
  accentCss: "#fbbf24",
  parSeconds: 280,
  footprint: 2.2,
  badge: { id: "entry-certified", name: "Entry Certified", note: "A Level A entry made and reversed with the air managed, the buddy kept and the decon line walked" },

  game: system({
    name: "Entry Authority",
    currency: "PSI",
    ranks: ["Operations", "Technician", "Entry Team Lead", "Hazmat Officer", "Entry Authority Certified"],
    badges: [
      { id: "air-managed", name: "Air Managed", note: "Turned around on the rule of thirds, not on the low-air alarm", test: AWARD.stepClean("air-check") },
      { id: "never-alone", name: "Never Alone", note: "Never separated from the buddy or entered without backup", test: AWARD.safe },
      { id: "suit-tight", name: "Suit Tight", note: "Suit pressure-tested inside the acceptance band", test: AWARD.precise(0.72) },
    ],
    challenges: [
      { id: "clean-entry", name: "Clean Entry", note: "Clean run, no corrections", test: AWARD.clean },
      { id: "held-the-test", name: "Held The Test", note: "Held the suit pressure test the full count", test: AWARD.unbroken },
      { id: "out-on-time", name: "Out On Time", note: "Back through decon inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "skip-backup": "You made entry with no backup team dressed at the line. A backup team is not a formality — it is the only thing that comes for you, in a suit you cannot get out of, in an atmosphere nobody else can enter. Two in, two out, and the two out are already dressed.",
    "solo-entry": "You left your buddy behind in the hot zone. In Level A you cannot hear well, cannot turn your head, and cannot see your own air gauge easily; the buddy is the person who reads it for you and who drags you out. Separating is how entrants are found later.",
    "low-air-push": "You pushed past the turnaround point. The rule of thirds exists because the way out takes as long as the way in and decon takes longer than either — air spent past the third is air you needed to get to the line.",
    "skip-decon": "You walked out of the hot zone past the decon corridor. Everything on that suit is coming with you: to the rehab area, to the apparatus, to the people who did not have a suit on.",
  },

  lateNotes: {
    "suit-don": "The suit goes on after the zones are set and the entry brief is done.",
    "hot-zone-entry": "Entry happens after the suit is tested, the buddy is dressed and the backup is standing by.",
  },

  steps: [
    {
      id: "iap", kind: "select", target: "entry-brief",
      title: "Take the entry objective and the air plan",
      cue: "Read what the entry is for, who is entering, and the working time the air allows.",
      why: "An entry is made for one objective and comes out. Written down first, because in a suit on air there is no discussing a change of plan and no time to make one.",
    },
    {
      id: "zones", kind: "sequence",
      targets: ["hot-line", "warm-line", "cold-line"],
      itemNames: { "hot-line": "hot zone line", "warm-line": "warm zone / decon corridor", "cold-line": "cold zone and support" },
      title: "Set the three zones, outward",
      cue: "Hot, then warm with the decon corridor in it, then cold.",
      why: "The zones are set from the release outward so the corridor between them exists before anyone needs it. Set inward and the decon line ends up inside the contamination it exists to stop.",
    },
    {
      id: "suit-zip", kind: "sequence",
      targets: ["scba-don", "suit-don", "buddy-check"],
      itemNames: { "scba-don": "SCBA on", "suit-don": "suit over it", "buddy-check": "buddy checks the seal" },
      title: "Dress out — air first, suit over it",
      cue: "SCBA on, suit over the top, and your buddy checks what you cannot see.",
      why: "Level A is fully encapsulating, so the air pack goes inside the suit and cannot be reached once it is closed. The seal is checked by the other person because you cannot see your own back.",
    },
    {
      id: "pressure-test", kind: "hold", target: "suit-tester", seconds: 5,
      title: "Pressure-test the suit",
      cue: "Inflate to the test pressure and hold while the gauge is watched.",
      why: "An encapsulated suit is only protection while it holds pressure. The test finds the seam, the glove ring or the zip that would otherwise be found by the atmosphere.",
      holdBreakNote: "The test was cut short. A suit that has not held for the full count has not been tested.",
    },
    {
      id: "test-read", kind: "gauge", target: "suit-gauge",
      title: "Read the suit test",
      cue: "Commit on the pressure drop over the test period.",
      why: "The number is a drop, not a pressure: a suit that loses more than the allowance over the period has a leak somewhere the eye will not find.",
      gauge: { label: "DROP", speed: 0.72, green: [0.06, 0.24], readout: (t) => `${(t * 5).toFixed(2)} mbar`, missNote: "That drop is outside the allowance — the suit has a leak. It does not go into the hot zone." },
    },
    {
      id: "backup", kind: "select", target: "backup-team",
      title: "Stand the backup team up at the line",
      cue: "Backup dressed, on air, at the hot line before anyone crosses it.",
      why: "Two in, two out. The backup team is dressed and ready before entry rather than called for after, because dressing out takes longer than the emergency will allow.",
    },
    {
      id: "air-start", kind: "gauge", target: "air-gauge",
      title: "Log the starting air",
      cue: "Read both entrants' cylinders and commit the working pressure.",
      why: "Entry control works from a number written down at the line. The turnaround is computed from it, and an entrant who cannot read their own gauge in a suit depends entirely on someone outside having that figure.",
      gauge: { label: "START psi", speed: 0.7, green: [0.72, 0.92], readout: (t) => `${Math.round(t * 4500)} psi`, missNote: "That is not a full cylinder. It gets changed before entry, not rationed during it." },
    },
    {
      id: "hot-zone-entry", kind: "select", target: "hot-zone-entry",
      title: "Make entry with your buddy",
      cue: "Cross the hot line together, and stay together.",
      why: "The pair crosses as a pair and stays within sight and touch. In Level A, sight is a fogged faceplate and hearing is almost nothing, so proximity is the only communication that survives.",
    },
    {
      id: "identify", kind: "find", noHint: true,
      targets: ["leaking-drum", "placard"],
      itemNames: { "leaking-drum": "the leaking drum", placard: "the shipping placard" },
      itemNotes: {
        "leaking-drum": "The second drum from the left is weeping at the chime. That is the source, and it is smaller than the pool it has made.",
        placard: "The placard on the trailer gives the UN number. That is what the reference the officer is holding is keyed on.",
      },
      title: "Identify the product and the source",
      cue: "Find what is leaking and what it is, without touching either.",
      why: "The objective is information first. A product identified from the placard and a source located is worth more to the incident than anything an entry team can do with their hands in the first few minutes.",
    },
    {
      id: "air-check", kind: "gauge", target: "air-gauge",
      title: "Check air against the rule of thirds",
      cue: "A third in, a third out, a third in reserve — commit when you read the turnaround.",
      why: "The way out takes as long as the way in, and decon takes longer than both. The turnaround is a third of the cylinder, and it is a decision made on the gauge rather than on how the work is going.",
      gauge: { label: "REMAINING", speed: 0.75, green: [0.6, 0.76], readout: (t) => `${Math.round(t * 4500)} psi`, missNote: "Past the turnaround. The entry is over; whatever is unfinished stays unfinished." },
    },
    {
      id: "mitigate", kind: "drag", target: "overpack-lid",
      title: "Overpack the leaking drum",
      cue: "Drum into the overpack, lid on, within the air you have left.",
      why: "The drum goes into a larger sealed drum rather than being patched. It is the one mitigation a pair in Level A can reliably finish inside a third of a cylinder.",
      drag: { to: "overpack-drum", radius: 0.5, missNote: "Not seated in the overpack — a lid resting on a drum is not containment." },
    },
    {
      id: "exit", kind: "select", target: "decon-corridor",
      title: "Exit through the decon corridor",
      cue: "Out the way you planned, into the corridor, with your buddy.",
      why: "There is one way out of a hot zone and it goes through decon. Crossing anywhere else takes the contamination to the people who are not dressed for it.",
    },
    {
      id: "decon", kind: "track", target: "wash-wand", seconds: 6,
      title: "Gross decon, top down",
      cue: "Hold the wand and keep the wash rate in the band, working downward.",
      why: "Top down so nothing runs onto anything already washed, and at a rate that rinses rather than aerosolises. Everything that comes off is captured in the berm, because the runoff is the contamination now.",
      track: { label: "WASH", green: [0.4, 0.62], rise: 0.5, fall: 0.4, drift: 0.14, readout: (v) => `${(v * 12).toFixed(1)} l/min` },
    },
    {
      id: "doff", kind: "sequence",
      targets: ["suit-doff", "scba-doff", "medical"],
      itemNames: { "suit-doff": "suit off, assisted", "scba-doff": "SCBA off last", "medical": "post-entry medical" },
      title: "Doff in order, air last",
      cue: "Suit off with help, air off last, then medical.",
      why: "The air stays on until the suit is off, because the suit's outside is the contaminated surface and doffing is when it touches everything. Medical afterwards, because heat stress in Level A does not announce itself.",
    },
  ],

  interrupts: [
    {
      id: "buddy-down",
      kind: "Entrant in trouble",
      after: "identify", delay: 4, seconds: 11,
      alert: "Your buddy has stopped moving and is leaning against the trailer. In a suit you cannot hear whether they are answering.",
      cue: "The other half of the entry team is not right.",
      target: "buddy-check",
      why: "Heat stress in Level A goes from working to unconscious faster than anything else on a hazmat scene, and the entrant cannot feel it coming. The buddy is the monitor, which means when the buddy stops, everything stops.",
      missNote: "You carried on with the objective. They were still on their feet at the turnaround, which was luck — an entrant who goes down in a suit in a hot zone is a rescue that needs the backup team, a drag to the line and a decon they cannot help with.",
      wrongNote: "It is your buddy. Nothing in this hot zone outranks the other person in it.",
    },
    {
      id: "wind-shift",
      kind: "Plume over the corridor",
      after: "mitigate", delay: 3, seconds: 11,
      alert: "The wind has swung and the vapour is drifting across the decon corridor and the backup team's position.",
      cue: "Your way out is in the plume.",
      target: "warm-line",
      why: "Zones are drawn against the wind that was blowing when they were drawn. A shift puts the corridor, the backup team and the support area downwind of the release, and the corridor is where two people in failing suits are about to walk.",
      missNote: "The corridor stayed where it was. You came out through the plume with the backup team standing in it, none of whom were dressed for an airborne exposure because the zone map said they did not need to be.",
      wrongNote: "It is the warm zone line. The corridor has to move before anyone walks it.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.2, HZ_ACCENT);

    // -------------------------------------------------------------- the scene
    // A trailer with a drum load, a pool under it, and the three zones marked
    // outward across the pad so the learner can see the geometry.
    const trailer = group(g, -0.2, 0, -2.6);
    box(trailer, 3.4, 0.16, 1.5, 0, 0.95, 0, 0x8a8f96, { rough: 0.7, metal: 0.3, finish: "painted", tile: [4, 2] });
    for (const sx of [-1, 1]) box(trailer, 0.1, 1.1, 1.5, sx * 1.65, 1.5, 0, 0xc9ced4, { rough: 0.75, finish: "painted", tile: [2, 2] });
    box(trailer, 3.4, 1.1, 0.1, 0, 1.5, -0.7, 0xc9ced4, { rough: 0.75, finish: "painted", tile: [4, 2] });
    for (const sx of [-1, 1]) cyl(trailer, 0.3, 0.3, 0.24, sx * 1.1, 0.3, 0.55, 0x1a1e23, { rough: 0.9, seg: 16 }).rotation.z = Math.PI / 2;
    holoTag(trailer, "Trailer — drum load", 0, 2.3, 0, { css: "#fbbf24", w: 0.4 });
    const placard = decal(trailer, 0.34, 0.34, 1.3, 1.45, 0.06, (cx, w, h) => {
      cx.fillStyle = "#d8232a"; cx.fillRect(0, 0, w, h);
      cx.strokeStyle = "#1b1e22"; cx.lineWidth = Math.max(3, h * 0.04); cx.strokeRect(h * 0.07, h * 0.07, w - h * 0.14, h - h * 0.14);
      cx.fillStyle = "#ffffff"; cx.textAlign = "center"; cx.textBaseline = "middle";
      cx.font = `700 ${Math.round(h * 0.2)}px 'Barlow Condensed', Arial, sans-serif`;
      cx.fillText("FLAMMABLE", w / 2, h * 0.34);
      cx.font = `700 ${Math.round(h * 0.26)}px 'Barlow Condensed', Arial, sans-serif`;
      cx.fillText("1993", w / 2, h * 0.66);
    }, { px: 192, rough: 0.8 });
    holoTag(trailer, "Placard", 1.3, 1.76, 0.08, { css: "#f0645b", w: 0.22 });
    reg(hits, placard, "placard");

    const drums = [];
    for (let i = 0; i < 4; i++) {
      const d = cylinderTank(trailer, -1.1 + i * 0.7, 0.4, i === 1 ? 0x7a6a3a : 0x2f6f4a,
        { gauge: false, plate: false });
      d.position.y = 1.03;
      d.scale.setScalar(0.62);
      drums.push(d);
    }
    holoTag(trailer, "Leaking at the chime", -0.4, 1.8, 0.4, { css: "#f0645b", w: 0.38 });
    reg(hits, drums[1], "leaking-drum");
    const pool = box(g, 1.0, 0.012, 0.8, -0.6, 0.008, -1.85, 0x6a5a2a,
      { rough: 0.2, opacity: 0.7, transparent: true, cast: false });
    const vapour = particles(g, 34, 0xcfd8c2, { size: 0.05, life: 1.1, additive: false, opacity: 0.22 });
    vapour.position.set(-0.6, 0.2, -1.85);

    // The overpack the drum goes into.
    const overpack = cyl(g, 0.34, 0.3, 0.9, 1.75, 0.45, -1.5, 0x2f6f4a,
      { rough: 0.6, metal: 0.2, seg: 20, finish: "painted" });
    holoTag(g, "Overpack drum", 1.75, 1.1, -1.5, { css: "#59c97b", w: 0.3 });
    hits["overpack-drum"] = overpack;
    const lid = cyl(g, 0.35, 0.35, 0.07, 2.35, 0.04, -0.9, 0x59c97b, { rough: 0.6, seg: 20, finish: "painted" });
    holoTag(g, "Overpack lid", 2.35, 0.3, -0.9, { css: "#59c97b", w: 0.28 });
    reg(hits, lid, "overpack-lid");

    // ------------------------------------------------------------- the zones
    const zoneLines = {};
    const ZONES = [
      ["hot-line", -0.8, 0xd8232a, "HOT ZONE"],
      ["warm-line", 0.75, 0xf2c14b, "WARM · DECON"],
      ["cold-line", 2.2, 0x59c97b, "COLD · SUPPORT"],
    ];
    for (const [id, z, colour, label] of ZONES) {
      const line = group(g, 0, 0, z);
      for (let i = -3; i <= 3; i++) {
        box(line, 0.3, 0.012, 0.06, i * 0.65, 0.008, 0, colour, { emissive: colour, ei: 0.5, cast: false });
      }
      for (const sx of [-1, 1]) cone(line, sx * 2.1, 0, { color: colour });
      holoTag(line, label, 0, 0.62, 0, { css: `#${colour.toString(16).padStart(6, "0")}`, w: 0.34 });
      line.visible = false;
      zoneLines[id] = line;
      const pick = box(g, 4.4, 0.3, 0.4, 0, 0.15, z, 0x000000, { opacity: 0.001, transparent: true, cast: false });
      reg(hits, pick, id);
    }
    // The decon corridor itself, inside the warm zone.
    const corridor = group(g, 1.5, 0, 0.75);
    box(corridor, 1.5, 0.05, 1.0, 0, 0.025, 0, 0x2f6f8c, { rough: 0.5, opacity: 0.5, transparent: true, cast: false });
    for (const sx of [-1, 1]) box(corridor, 0.05, 0.9, 1.0, sx * 0.75, 0.45, 0, 0xf2c14b, { rough: 0.6, cast: false });
    holoTag(corridor, "Decon corridor", 0, 1.1, 0, { css: "#f2c14b", w: 0.34 });
    reg(hits, corridor, "decon-corridor");
    const berm = torus(corridor, 0.72, 0.05, 0, 0.05, 0, 0x2b3138, { rough: 0.8, seg: 8, seg2: 24, cast: false });
    berm.rotation.x = Math.PI / 2;
    const washWand = group(corridor, 0.55, 0, 0.3);
    cyl(washWand, 0.02, 0.02, 0.8, 0, 0.55, 0, 0x4fd1ff, { rough: 0.4, metal: 0.4, seg: 10 });
    box(washWand, 0.06, 0.12, 0.06, 0, 0.2, 0, 0x2b3138, { rough: 0.6 });
    holoTag(corridor, "Wash wand", 0.55, 1.05, 0.3, { css: "#4fd1ff", w: 0.26 });
    reg(hits, washWand, "wash-wand");
    const spray = particles(washWand, 26, 0xbfeaf7, { size: 0.02, life: 0.35, additive: false, opacity: 0.35 });

    // -------------------------------------------------------------- the crew
    const entrant = standingFigure(g, -1.55, 1.35, { ry: 2.6, cloth: 0xfbbf24, vest: 0xfbbf24, helmet: 0xf2f2f2 });
    holoTag(g, "You — entrant", -1.55, 2.0, 1.35, { css: "#fbbf24", w: 0.3 });
    const buddy = standingFigure(g, -0.85, 1.5, { ry: 2.4, cloth: 0xfbbf24, vest: 0xfbbf24, helmet: 0xf2f2f2 });
    holoTag(g, "Buddy", -0.85, 2.0, 1.5, { css: "#fbbf24", w: 0.22 });
    reg(hits, buddy, "buddy-check");
    // Standing off the corridor mouth on the cold side of the warm line, which
    // is where a backup team waits: close enough to the hot line to go, clear
    // of the decon lane the entry team will walk out through.
    const backup = group(g, 0.38, 0, 1.48);
    for (const dx of [-0.42, 0.42]) standingFigure(backup, dx, 0, { ry: 3.1, cloth: 0x2f6f8c, vest: 0xf2c14b, helmet: 0xf2f2f2 });
    holoTag(backup, "Backup team", 0, 2.05, 0, { css: "#f2c14b", w: 0.32 });
    reg(hits, backup, "backup-team");
    const soloTrap = box(g, 0.7, 1.6, 0.7, -2.4, 0.8, -1.6, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "Press on alone?", -2.4, 1.8, -1.6, { css: "#f0645b", w: 0.32 });
    reg(hits, soloTrap, "solo-entry");
    const skipBackup = box(g, 0.8, 1.2, 0.5, 0.9, 0.6, -0.5, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "Cross without backup?", 0.9, 1.4, -0.5, { css: "#f0645b", w: 0.42 });
    reg(hits, skipBackup, "skip-backup");
    const skipDecon = box(g, 0.9, 1.2, 0.5, -2.1, 0.6, 0.9, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "Straight out?", -2.1, 1.4, 0.9, { css: "#f0645b", w: 0.28 });
    reg(hits, skipDecon, "skip-decon");

    // ------------------------------------------------------- dress-out and air
    const dressRack = group(g, 2.55, 0, -0.2, -0.5);
    box(dressRack, 0.08, 1.9, 0.08, 0, 0.95, 0, 0x8b929a, { rough: 0.5, metal: 0.5 });
    const suit = box(dressRack, 0.42, 0.75, 0.16, 0.14, 1.15, 0.06, 0xfbbf24,
      { rough: 0.45, finish: "rubber", tile: [1, 1] });
    holoTag(dressRack, "Level A suit", 0.14, 1.64, 0.06, { css: "#fbbf24", w: 0.3 });
    reg(hits, suit, "suit-don");
    const scba = group(dressRack, -0.22, 0.95, 0.04);
    cyl(scba, 0.075, 0.075, 0.5, 0, 0, 0, 0x2f6f8c, { rough: 0.5, metal: 0.4, seg: 16, finish: "galvanised" });
    box(scba, 0.22, 0.3, 0.08, 0, -0.05, 0.1, 0x2b3138, { rough: 0.85 });
    holoTag(dressRack, "SCBA", -0.22, 1.3, 0.04, { css: "#2f6f8c", w: 0.2 });
    reg(hits, scba, "scba-don");
    const scbaOff = box(dressRack, 0.2, 0.16, 0.1, -0.22, 0.42, 0.04, 0x2f6f8c, { rough: 0.6 });
    holoTag(dressRack, "Air off last", -0.22, 0.6, 0.04, { css: "#2f6f8c", w: 0.26 });
    reg(hits, scbaOff, "scba-doff");
    const suitOff = box(dressRack, 0.24, 0.18, 0.1, 0.16, 0.42, 0.04, 0xfbbf24, { rough: 0.6 });
    holoTag(dressRack, "Suit off, assisted", 0.16, 0.62, 0.04, { css: "#fbbf24", w: 0.34 });
    reg(hits, suitOff, "suit-doff");

    const tester = group(g, 2.9, 0, 0.7, -0.9);
    box(tester, 0.3, 0.28, 0.2, 0, 0.5, 0, 0x59636d, { rough: 0.6, finish: "painted", tile: [1, 1] });
    cyl(tester, 0.02, 0.02, 0.5, 0.1, 0.25, 0, 0x8b929a, { rough: 0.6, seg: 8, cast: false });
    holoTag(tester, "Suit pressure tester", 0, 0.8, 0, { css: "#fbbf24", w: 0.4 });
    reg(hits, tester, "suit-tester");
    const suitGauge = instrument(tester, 0, 0.72, 0.12, { ry: 0, idle: "-- mbar", color: 0xfbbf24 });
    reg(hits, suitGauge, "suit-gauge");
    const airGauge = instrument(g, 1.95, 1.1, 1.85, { ry: -2.4, idle: "-- psi", color: 0x4fd1ff });
    holoTag(airGauge, "Entry control board", 0, 0.18, 0, { css: "#4fd1ff", w: 0.4 });
    reg(hits, airGauge, "air-gauge");
    const lowAirTrap = box(g, 0.6, 0.6, 0.6, -1.9, 0.9, -2.3, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "Finish the job?", -1.9, 1.4, -2.3, { css: "#f0645b", w: 0.32 });
    reg(hits, lowAirTrap, "low-air-push");

    const entryPick = box(g, 1.2, 1.2, 0.4, -0.5, 0.6, -0.8, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, entryPick, "hot-zone-entry");

    const brief = holoPanel(g, 0.58, 0.42, 2.7, 1.6, 1.1, (cx, w, h) => {
      cx.fillStyle = "rgba(6,16,22,0.9)"; cx.fillRect(0, 0, w, h);
      cx.fillStyle = "#fbbf24"; cx.fillRect(0, 0, w, 5);
      cx.fillStyle = "#8fb3c4";
      cx.font = `600 ${Math.round(h * 0.09)}px 'Barlow Condensed', Arial, sans-serif`;
      cx.textAlign = "left"; cx.textBaseline = "middle";
      cx.fillText("ENTRY BRIEF · ENTRY 1", w * 0.06, h * 0.14);
      cx.fillStyle = "#eaf6fb";
      cx.font = `600 ${Math.round(h * 0.13)}px 'Barlow Condensed', Arial, sans-serif`;
      cx.fillText("IDENTIFY AND OVERPACK", w * 0.06, h * 0.32);
      cx.fillStyle = "#bcd6e2";
      cx.font = `${Math.round(h * 0.085)}px Arial, sans-serif`;
      ["Level A, 45-minute cylinders", "Objective: product ID, then overpack",
       "Turnaround: rule of thirds", "Backup dressed at the hot line",
       "One way out — decon corridor", "Post-entry medical, all entrants"]
        .forEach((line, i) => cx.fillText(line, w * 0.06, h * 0.46 + i * h * 0.085));
    }, { ry: -0.5 });
    reg(hits, brief, "entry-brief");
    const medical = box(g, 0.5, 0.06, 0.4, 2.9, 0.5, 2.0, 0xdfe4e8, { rough: 0.7 });
    for (const dx of [-0.2, 0.2]) cyl(g, 0.03, 0.03, 0.5, 2.9 + dx, 0.25, 2.0, 0x8b929a, { rough: 0.5, metal: 0.5, seg: 8 });
    holoTag(g, "Post-entry medical", 2.9, 0.8, 2.0, { css: "#59c97b", w: 0.36 });
    reg(hits, medical, "medical");

    for (let i = 0; i < 2; i++) barrierPanel(g, -2.6 + i * 0.9, 2.2, { color: 0xf2c14b });

    let zonesUp = 0, entered = false, washing = false, plumeOver = 0, buddyDown = false;

    return {
      hits,
      footprint: 2.2,

      onStepComplete(step) {
        if (step.id === "zones") { zonesUp = 3; for (const l of Object.values(zoneLines)) l.visible = true; }
        if (step.id === "suit-zip") suit.visible = false;
        if (step.id === "hot-zone-entry") { entered = true; entrant.position.set(-0.9, 0, -1.2); buddy.position.set(-0.3, 0, -1.4); }
        if (step.id === "mitigate") {
          drums[1].parent.remove(drums[1]);
          g.add(drums[1]);
          drums[1].position.set(1.75, 0.5, -1.5);
          drums[1].scale.setScalar(0.5);
          lid.position.set(1.75, 0.94, -1.5);
          pool.visible = false;
        }
        if (step.id === "exit") { entrant.position.set(1.5, 0, 0.75); buddy.position.set(1.5, 0, 1.05); }
        if (step.id === "decon") washing = false;
        if (step.id === "doff") { entrant.position.set(2.9, 0, 1.6); }
      },

      // The buddy really goes down, and the plume really crosses the corridor.
      onInterrupt(it) {
        if (it.id === "buddy-down") { buddyDown = true; buddy.rotation.z = 0.5; buddy.position.y = -0.3; }
        if (it.id === "wind-shift") { plumeOver = 1; vapour.position.set(0.8, 0.2, 0.2); }
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "buddy-down") { buddyDown = false; buddy.rotation.z = 0; buddy.position.y = 0; }
        if (it.id === "wind-shift") { plumeOver = 0; vapour.position.set(-0.6, 0.2, -1.85); corridor.position.set(1.5, 0, 1.5); }
      },

      onHazard(hitId) {
        if (hitId === "solo-entry" || hitId === "low-air-push") plumeOver = Math.max(plumeOver, 0.4);
      },

      animate(t, dt, session) {
        // The release does not wait for the entry plan.
        vapour.visible = true;
        vapour.userData.step(dt, new THREE.Vector3(0.4 + plumeOver * 1.2, 0.35, 0.2 + plumeOver), 0.08, 0.9, 0.5);
        if (buddyDown) buddy.rotation.z = 0.5 + Math.sin(t * 2) * 0.03;
        washing = session?.step?.id === "decon";
        if (washing) {
          spray.visible = true;
          spray.userData.step(dt, new THREE.Vector3(0, -0.6, 0), 0.05, 0.6, -1.8);
        } else if (spray.visible) spray.visible = false;
        const gg = session?.gauge;
        if (gg && !gg.committed && session.step?.id === "test-read") {
          repaint(suitGauge.userData.screen, signFace(`${(gg.t * 5).toFixed(2)}`, {
            bg: "#1c1408", accent: gg.t < 0.26 ? "#59c97b" : "#f0645b", fg: "#ffe3ac", scale: 0.55,
          }));
        }
        if (gg && !gg.committed && (session.step?.id === "air-start" || session.step?.id === "air-check")) {
          const band = session.step.id === "air-start" ? gg.t > 0.7 : gg.t > 0.58 && gg.t < 0.78;
          repaint(airGauge.userData.screen, signFace(`${Math.round(gg.t * 4500)}`, {
            bg: "#0d1c24", accent: band ? "#59c97b" : "#f0645b", fg: "#bfeaf7", scale: 0.55,
          }));
        }
        void zonesUp; void entered;
      },
    };
  },
};
