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
    "skip-backup": "You made entry with nobody dressed out at the line to back you up. A backup pair isn't a formality — they're the only ones equipped to reach you once you're sealed inside a suit, in an atmosphere nobody else can enter. Two go in, and two more stand dressed and ready, prepared to come get them.",
    "solo-entry": "You left your partner behind inside the hot zone. Inside a Level A suit you can barely hear, you can't turn your head, and you can't easily check your own air gauge — your partner is the one who reads it for you and who drags you clear if you go down. Splitting up is how entrants end up found rather than rescued.",
    "low-air-push": "You pushed past the point where you should have turned around. The rule of thirds exists precisely because the trip out takes as long as the trip in, and decontamination afterward takes longer than both combined — spending air past that third is spending air you were going to need just to reach the cordon alive.",
    "skip-decon": "You crossed out of the hot zone bypassing the decontamination passage entirely. Whatever's riding on that suit travels with you — into the rehab area, onto the apparatus, and onto everyone standing there who never put a suit on in the first place.",
  },

  lateNotes: {
    "suit-don": "The suit goes on after the zones are set and the entry brief is done.",
    "hot-zone-entry": "Entry happens after the suit is tested, the buddy is dressed and the backup is standing by.",
  },

  steps: [
    {
      id: "iap", kind: "select", target: "entry-brief",
      title: "Read the entry brief and the air budget",
      cue: "Note the objective, who's going in, and the working time the cylinders allow.",
      why: "A hazmat entry pair commits to one job and turns around the instant it's done, or the instant the air runs low — settled on paper before anyone's sealed into a suit: once the faceplate closes there's no pausing to renegotiate the plan, and nothing said through a fogged visor will alter it.",
    },
    {
      id: "zones", kind: "sequence",
      targets: ["hot-line", "warm-line", "cold-line"],
      itemNames: { "hot-line": "hot zone line", "warm-line": "warm zone / decon corridor", "cold-line": "cold zone and support" },
      title: "Set the three zones, outward",
      cue: "Hot zone first, then the warm zone with the decontamination passage inside it, then cold.",
      why: "Zones get marked starting at the release and working outward, so the passage between them exists by the time an entry pair needs to walk it. Mark them from the outside in and that passage can end up sitting inside the very contamination it was supposed to keep out.",
      outOfOrderNote: "Hot, then warm, then cold — the boundaries are drawn outward from the release, not guessed at from the edges in.",
    },
    {
      id: "suit-zip", kind: "sequence",
      targets: ["scba-don", "suit-don", "buddy-check"],
      itemNames: { "scba-don": "SCBA on", "suit-don": "suit over it", "buddy-check": "buddy checks the seal" },
      title: "Dress out — air first, suit over it",
      cue: "SCBA on, then the encapsulating suit zipped over the top, sealed by your partner.",
      why: "A Level A suit is fully sealed, so the air cylinder has to go on before the zipper closes — reach for it afterward and there's no getting to it. That's also why the seal check falls to somebody else: nobody can twist far enough to inspect their own back once that suit is closed.",
      outOfOrderNote: "Air on, then the suit over it, then the buddy checks the seal — closing the suit before the air is on traps a cylinder you cannot reach to fix.",
    },
    {
      id: "pressure-test", kind: "hold", target: "suit-tester", seconds: 5,
      title: "Pressure-test the suit",
      cue: "Inflate to the test pressure and hold steady while the gauge is watched.",
      why: "An encapsulating suit only protects while it's holding pressure, and this test is what finds the bad seam, the loose glove ring or the failed zip before the hot zone finds it for you. Cut the hold short and none of that gets proven — a suit that hasn't held for the full count hasn't really been tested.",
      holdBreakNote: "The test was cut short. A suit that has not held for the full count has not been tested.",
    },
    {
      id: "test-read", kind: "gauge", target: "suit-gauge",
      title: "Read the suit test",
      cue: "Commit on how far the pressure fell across the test period.",
      why: "What's being read is a drop, not a raw pressure figure: a suit that loses more than the allowance across that period has a leak somewhere a visual check will never catch on its own, however carefully the seams get looked over first.",
      gauge: { label: "DROP", speed: 0.72, green: [0.06, 0.24], readout: (t) => `${(t * 5).toFixed(2)} mbar`, missNote: "That drop is outside the allowance — the suit has a leak. It does not go into the hot zone." },
    },
    {
      id: "backup", kind: "select", target: "backup-team",
      title: "Stand the backup team up at the line",
      cue: "Get a second pair dressed and on air at the hot cordon before anyone crosses it.",
      why: "Two go in, and two more stand ready to pull them out. The backup pair dresses out before entry begins, not after somebody calls for them — a full Level A ensemble simply takes longer to don than most emergencies are willing to wait.",
    },
    {
      id: "air-start", kind: "gauge", target: "air-gauge",
      title: "Log the starting air",
      cue: "Read both entrants' cylinders and record the working pressure.",
      why: "Entry control runs off a figure logged at the cordon before anyone crosses it, and the turnaround point gets computed from that number. An entrant whose faceplate is fogging and whose gloves are too thick to feel a dial depends entirely on somebody outside having written it down beforehand.",
      gauge: { label: "START psi", speed: 0.7, green: [0.72, 0.92], readout: (t) => `${Math.round(t * 4500)} psi`, missNote: "That is not a full cylinder. It gets changed before entry, not rationed during it." },
    },
    {
      id: "hot-zone-entry", kind: "select", target: "hot-zone-entry",
      title: "Make entry with your partner",
      cue: "Cross the hot cordon side by side, and don't drift apart.",
      why: "The pair crosses together and stays within arm's reach the whole way. Inside a Level A suit, sight is a fogged faceplate and hearing is close to nothing, so staying physically near each other is the only signal that gets through at all.",
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
      cue: "Locate what's leaking and what it is, without touching either.",
      why: "The first objective is information, not action: a product read off the placard and a source pinpointed on sight are worth more to command in the opening minutes than anything two gloved hands could physically do to the spill itself.",
    },
    {
      id: "air-check", kind: "gauge", target: "air-gauge",
      title: "Check air against the rule of thirds",
      cue: "A third to get in, a third to get out, a third held in reserve — commit once you've read the turnaround point.",
      why: "Getting out takes as long as getting in did, and decontamination afterward takes longer than either — so the turnaround point sits at one third of the cylinder, and that's a call made off the gauge, never off how close the objective feels to being finished.",
      gauge: { label: "REMAINING", speed: 0.75, green: [0.6, 0.76], readout: (t) => `${Math.round(t * 4500)} psi`, missNote: "Past the turnaround. The entry is over; whatever is unfinished stays unfinished." },
    },
    {
      id: "mitigate", kind: "drag", target: "overpack-lid",
      title: "Overpack the leaking drum",
      cue: "Get the drum into the overpack and the lid seated, inside the air you've got left.",
      why: "A leaking drum goes whole into a larger sealed drum rather than being patched at the source. It's the one fix a two-person Level A team can reliably finish within a third of a cylinder of air, without needing tools this suit and these gloves can't really use.",
      drag: { to: "overpack-drum", radius: 0.5, missNote: "Not seated in the overpack — a lid resting on a drum is not containment." },
    },
    {
      id: "exit", kind: "select", target: "decon-corridor",
      title: "Exit through the decontamination passage",
      cue: "Leave the way the plan called for, into the passage, with your partner beside you.",
      why: "There's exactly one way out of a hot zone and it runs through decontamination. Cross the cordon anywhere else and everything that suit picked up rides straight along to people who never suited up at all.",
    },
    {
      id: "decon", kind: "track", target: "wash-wand", seconds: 6,
      title: "Gross decon, top down",
      cue: "Hold the wand steady in the target range, working from the head downward.",
      why: "Working from the head down means nothing runs onto a section that's been rinsed clean, and holding a rate that rinses rather than aerosolises keeps the contamination in the wash water, not in the air both of you are breathing next to it.",
      track: { label: "WASH", green: [0.4, 0.62], rise: 0.5, fall: 0.4, drift: 0.14, readout: (v) => `${(v * 12).toFixed(1)} l/min` },
      holdBreakNote: "The wash rate dropped out of the band before the pass was done. Gross decon stopped partway is contamination on the lower half of a suit that was never washed at all.",
    },
    {
      id: "doff", kind: "sequence",
      targets: ["suit-doff", "scba-doff", "medical"],
      itemNames: { "suit-doff": "suit off, assisted", "scba-doff": "SCBA off last", "medical": "post-entry medical" },
      title: "Doff in order, air last",
      cue: "Suit off with help first, then air off, then the post-entry check.",
      why: "Air stays on until the suit is fully off — the outer skin of that suit is the contaminated layer, and pulling it away is the one instant it brushes against everything and everyone nearby. The medical check comes after both steps: heat exhaustion inside a sealed suit can be far along before it's obvious to the wearer.",
      outOfOrderNote: "Suit off first with help, air off last, medical after both — pulling the air before the contaminated suit is off puts an unprotected face right where the suit sheds.",
    },
  ],

  interrupts: [
    {
      id: "buddy-down",
      kind: "Entrant in trouble",
      after: "identify", delay: 4, seconds: 11,
      alert: "Your partner has stopped moving and is slumped against the trailer. Inside a suit, you can't tell if they're even answering you.",
      cue: "The other half of your entry pair isn't right.",
      target: "buddy-check",
      why: "Heat stress inside a Level A suit can go from fine to unconscious faster than almost anything else on a hazmat scene, and the wearer usually can't feel it building. Your partner is watching you for exactly this reason — so the instant they go down, everything else stops with them.",
      missNote: "You kept working the objective. They happened to still be upright at the turnaround, which was luck, nothing more — an entrant who collapses inside a sealed suit needs the backup pair, a physical drag to the cordon, and a decontamination pass they're in no state to help with.",
      wrongNote: "It is your buddy. Nothing in this hot zone outranks the other person in it.",
    },
    {
      id: "wind-shift",
      kind: "Plume over the corridor",
      after: "mitigate", delay: 3, seconds: 11,
      alert: "The wind has swung, and vapour is drifting straight across the decontamination passage and the backup team's position.",
      cue: "Your way out just walked into the plume.",
      target: "warm-line",
      why: "Zones get drawn against whatever wind was blowing when the tape first went down. A shift can put the passage, the backup pair and the support area downwind of the release — right as two people in suits running low on air are about to walk straight through it.",
      missNote: "The passage stayed put. You walked out through the plume with the backup pair standing in it, and none of them were dressed for an airborne exposure — the original zone map said they wouldn't need to be.",
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
