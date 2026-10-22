import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, ball, group, decal, repaint, signFace, particles, mat,
} from "../../../shared/kit.js";
import {
  CITY, stationPad, holoPanel, holoTag, toolChest, instrument, equipmentCabinet,
  cone, barrierPanel, standingFigure, surfaceTexture, texturedMat, mudflatFace, reg,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Temporary Site Power VR — Energy & Power, IBEW inside wireman.
// Standing up a construction site's temporary electrical service: a spider
// box and panel, GFCI on every outlet, an assured equipment grounding
// conductor programme run on a schedule rather than a hope, and cords that
// stay out of the two things that actually kill them — traffic and standing
// water. Nothing here is permanent, which is exactly why nothing here gets
// treated as less than the service it is protecting people from.

const TSP_ACCENT = 0x59c97b;

export const SIM_TEMPORARY_SITE_POWER = {
  id: "temporary-site-power",
  index: "190",
  domain: "Energy",
  trade: "Inside wireman — IBEW",
  category: "Energy & Power",
  weather: "rain",
  certification: "IBEW inside wireman; OSHA 29 CFR 1926.404 (wiring design and protection) and 1926.405 (wiring methods, temporary wiring); NFPA 70 Article 590 temporary installations",
  name: "Temporary Site Power",
  title: simTitle("Temporary Site Power"),
  tagline: "Standing up construction power: panel grounded, GFCI on every receptacle, the AEGCP schedule, cords clear of traffic and water",
  accent: TSP_ACCENT,
  accentCss: "#59c97b",
  parSeconds: 250,
  footprint: 2.3,
  badge: { id: "site-power-certified", name: "Site Power Certified", note: "A temporary service grounded, GFCI-protected, AEGCP-current and walked clean at the end of the shift" },

  game: system({
    name: "Site Power Authority",
    currency: "VOLT",
    ranks: ["Apprentice Wireman", "Journeyman Wireman", "Site Electrician", "Site Lead", "Site Power Authority Certified"],
    badges: [
      { id: "grounded-first", name: "Grounded First", note: "Never energised the panel before the grounding electrode was proven", test: AWARD.stepClean("ground-test") },
      { id: "gfci-everywhere", name: "GFCI Everywhere", note: "Every receptacle tripped and reset clean, no exceptions", test: AWARD.safe },
      { id: "quarter-precise", name: "Quarter Precise", note: "Held every test reading inside its band", test: AWARD.precise(0.7) },
    ],
    challenges: [
      { id: "no-callback", name: "No Callback", note: "Clean run, no corrections", test: AWARD.clean },
      { id: "test-held", name: "Test Held", note: "Never let a splice test drop before it read good", test: AWARD.unbroken },
      { id: "service-up", name: "Service Up", note: "Panel energised and walked inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "raw-lugs": "You went for the lugs behind the main instead of a receptacle. Every outlet on this panel is GFCI-protected and every breaker is sized to the circuit; the lugs are neither — they are the one point in this whole service with no protection device between a hand and the transformer, and nothing that plugs in ever gets landed there.",
    "wrong-tag-color": "You tagged that cord with last quarter's colour. The colour code is how anyone on this site can tell a current test from an overdue one at a glance, without reading a date stamped in grease pencil on a cord lying in the mud — a wrong-coloured tag says a cord is current when the programme says it is not.",
    "gfci-bypass": "That is a cheater plug pulled off a GFCI receptacle to feed a three-prong tool straight from a two-prong outlet somewhere else on site. It defeats the one protection device standing between whoever is holding that tool and a ground fault, and it does it silently — nothing about the tool running tells you the GFCI it needs is gone.",
    "cord-in-mud": "That cord is lying flat in standing water at the edge of the lay-down yard, still under tension from the reel. Water does not care that the jacket is rated for wet locations — a nicked jacket sitting in a puddle is a ground fault waiting on the first person who steps in that puddle at the same time.",
  },

  lateNotes: {
    "ground-rod": "The rod goes in and the bonding jumper goes on before the panel's main is ever closed.",
    "gfci-recept-a": "Every receptacle gets tested, not a sample of them — the one skipped is the one that matters.",
  },

  interrupts: [
    {
      id: "saw-in-puddle",
      kind: "Live tool in water",
      after: "route", delay: 4, seconds: 12,
      alert: "Past the cable ramp, a cord has come uncoiled into a puddle at the low corner of the site, and the worm-drive saw plugged into the far end of it is still spinning under load with nobody's hand on it.",
      cue: "Do not touch the cord or the saw standing in the water. Kill the panel main first.",
      target: "panel-main",
      why: "A saw left running while its cord lies in standing water is a live ground-fault path sitting in the one place a foot is most likely to land, and the GFCI on that circuit may already be doing its job or may already have failed — there is no way to tell by looking, and touching the cord to find out is how the fault reaches a person instead of just the water. The panel main is the one action that is safe from every side of that puddle at once.",
      missNote: "The saw kept running in the puddle for the whole window. Whether the GFCI behind it had already tripped or was about to is not something anyone could see from the cable ramp — the only certain response was cutting the source, and it did not happen.",
      wrongNote: "It is the panel main. Nothing about that cord or that saw is safe to touch while either one might still be carrying current into that puddle.",
    },
    {
      id: "sub-taps-lugs",
      kind: "Unauthorized tap",
      after: "aegcp-test", delay: 4, seconds: 11,
      alert: "A subcontractor has the panel door open and is stripping a cord end to jam straight onto the lugs behind the main, skipping every receptacle and every GFCI on the panel to feed his own splitter.",
      cue: "Stop him before that cord touches the lugs.",
      target: "subcontractor",
      why: "The lugs behind this panel's main are the one point in the whole temporary service with no GFCI, no breaker and no overcurrent protection sized to anything downstream of them — landing a cord there is not a shortcut around a full panel, it is a direct connection to the transformer that every other protection device on this service exists specifically to stand between people and.",
      missNote: "The subcontractor's cord went on the lugs before he was stopped. Everything fed from that tap now has none of the GFCI protection, none of the breaker sizing, and none of the fault clearing that the rest of this panel was built to provide.",
      wrongNote: "It is the subcontractor at the open panel door. Stop him before that cord touches the lugs — talk to him after.",
    },
  ],

  steps: [
    {
      id: "plan", kind: "select", target: "site-plan",
      title: "Read the siting plan",
      cue: "Site the panel on high ground, clear of the haul road and the crane's swing, with its grounding electrode location marked.",
      why: "Where this panel sits decides half of the hazards it will have for the rest of the job — parked in the swing of equipment it gets struck, parked in a low corner it floods, and parked without a clear grounding electrode location the whole rest of this procedure has nowhere to start from. The plan is drawn before the first stake goes in the ground, not adjusted after the panel is already sitting somewhere convenient.",
    },
    {
      id: "ground", kind: "sequence", anyOrder: true,
      targets: ["ground-rod", "bonding-jumper"],
      itemNames: { "ground-rod": "grounding electrode rod", "bonding-jumper": "bonding jumper to the panel" },
      title: "Drive the ground rod and bond it to the panel",
      cue: "Drive the rod its full length and connect the bonding jumper from the panel's ground bus to the rod clamp.",
      why: "A temporary service has no building steel or water main to fall back on for a grounding electrode the way permanent wiring often does — the rod driven today is the only path fault current has back to earth on this whole site, and every GFCI and every piece of equipment grounded to this panel is trusting that connection to actually be there.",
    },
    {
      id: "ground-test", kind: "gauge", target: "ground-tester",
      title: "Prove the grounding-electrode connection",
      cue: "Test continuity from the panel's ground bus through the bonding jumper to the rod before the panel carries any load.",
      why: "A rod that looks driven and a jumper that looks connected are not the same thing as a path fault current can actually use — a loose clamp or a rod that hit rock two feet down reads exactly like a good connection until something needs it, which is why this gets measured before the panel is trusted with a single circuit, not assumed from how the install looked.",
      gauge: { label: "Ω", speed: 0.7, green: [0.0, 0.14], readout: (t) => `${(t * 20).toFixed(1)} Ω`, missNote: "That reading is too high to trust as a grounding-electrode path. Recheck the rod and the bonding jumper before this panel carries anything." },
    },
    {
      id: "main", kind: "turn", target: "panel-main",
      title: "Close the panel main",
      cue: "With the ground proven, close the panel's main breaker to energise the temporary service.",
      why: "The main only closes once the one thing every downstream protection device depends on — an actual path to earth — has been measured, not assumed. A panel energised on a ground that merely looks connected is a panel where every GFCI on it is trusting a connection nobody actually checked.",
      turn: { turns: 0.4, axis: "y", label: "PANEL MAIN" },
    },
    {
      id: "gfci-check", kind: "sequence", anyOrder: true,
      targets: ["gfci-recept-a", "gfci-recept-b", "gfci-recept-c"],
      itemNames: { "gfci-recept-a": "receptacle 1 test button", "gfci-recept-b": "receptacle 2 test button", "gfci-recept-c": "receptacle 3 test button" },
      title: "Test every receptacle's GFCI protection",
      cue: "Press the test button on every receptacle on the panel, confirm each one trips, then reset it.",
      why: "OSHA's construction electrical rule requires ground-fault protection on every 125-volt receptacle on a temporary service precisely because this equipment gets plugged and unplugged all day by people who are not electricians and cannot verify it themselves — every receptacle gets tested because the one left unchecked is the one somebody's saw ends up plugged into.",
    },
    {
      id: "aegcp-test", kind: "gauge", target: "aegcp-tester",
      title: "Run the assured equipment grounding conductor test",
      cue: "Continuity and insulation test on the cord and tool going into service, and commit inside the pass band.",
      why: "An assured equipment grounding conductor programme is the alternative OSHA allows to GFCI on every circuit, and it works only if every cord and every tool is actually tested on a schedule and the result is actually recorded — a programme that exists on paper but skips the testing is not an assured programme, it is a hope with a binder.",
      gauge: { label: "CONTINUITY", speed: 0.72, green: [0.7, 0.86], readout: (t) => `${Math.round(t * 100)} %`, missNote: "Outside the pass band — that cord or tool does not go into service on this reading. Test it again or pull it." },
    },
    {
      id: "color-tag", kind: "select", target: "quarter-tag",
      title: "Tag the tested cord with this quarter's colour",
      cue: "Match the tag colour to the chart posted on the panel for the current quarter — not last quarter's colour off the rack.",
      why: "The colour code exists so a foreman can walk the site and know at a glance which cords are current without reading a date off a tag left out in the weather — the colour on the tag is the whole test result compressed into something visible from ten feet away, and it is only true if it matches the chart posted for the quarter this test actually happened in.",
    },
    {
      id: "traffic", kind: "sequence", anyOrder: true,
      targets: ["cone-a", "cone-b"],
      itemNames: { "cone-a": "cone at the haul-road crossing", "cone-b": "cone at the panel apron" },
      title: "Mark the cord crossing the haul road",
      cue: "Cone off both sides of the whip where it crosses the vehicle path.",
      why: "A cord crossing a haul road is invisible to a loaded truck from the cab, and a crushed cord is not just a repair — a jacket split under a tire load with the circuit still energised is a fault at ground level in a spot equipment drives over all day. The cones are what make the crossing visible before a tire finds it.",
    },
    {
      id: "route", kind: "drag", target: "cord-coil",
      title: "Run the whip through the cable ramp",
      cue: "Lift the coiled whip and set it into the cable-protector ramp, clear of the standing water at the low corner.",
      why: "Cable ramps do two jobs at once: they keep a cord's jacket off the ground a vehicle tire would otherwise crush, and routed correctly they keep the run out of the low corner where rain collects — a whip left flat on the grade does neither, and it is usually the same cord that ends up doing both jobs badly at once.",
      drag: { to: "cable-ramp", radius: 0.45, missNote: "Not set in the ramp — a cord left flat on the grade is exposed to both the traffic and the water this step exists to keep it clear of." },
    },
    {
      id: "damaged-cord", kind: "select", target: "damaged-cord",
      title: "Tag out the damaged cord",
      cue: "Pull the cord with the cut jacket out of the pile and tag it out of service.",
      why: "A cut through to the conductors is not a cosmetic flaw that waits for a slow day — it is an energised conductor one layer of dirt away from open air, and the only correct place for that cord until it is repaired and re-tested is out of the pile entirely, tagged so nobody grabs it because it was the closest one coiled by the panel.",
    },
    {
      id: "walk", kind: "find", noHint: true,
      targets: ["worn-cord-jacket", "unlabeled-panel"],
      itemNames: { "worn-cord-jacket": "cord with jacket abrasion", "unlabeled-panel": "panel with no circuit directory" },
      itemNotes: {
        "worn-cord-jacket": "This cord's jacket is worn through to the inner insulation at a point where it runs over the skid steer's turning radius. It is not cut yet, but it is one more pass of a tracked machine away from being exactly the cord this job already tagged out once today.",
        "unlabeled-panel": "This panel has no circuit directory on the door. Whoever needs to kill a circuit in an emergency and cannot read what feeds what is choosing between guessing and shutting down the whole panel — either one costs time a real emergency does not give back.",
      },
      title: "Walk the site at the end of the shift",
      cue: "Look over the panel, the cord runs and the lay-down area before you leave; click what needs attention before tomorrow's shift.",
      why: "A temporary service gets walked at the end of every shift because nothing about it stays the way it was set up — cords get dragged, tags fade, rain moves the puddles, and the next crew on site inherits whatever was left standing. What gets caught on tonight's walk is what tomorrow's shift does not have to discover the hard way.",
    },
    {
      id: "log", kind: "select", target: "site-log",
      title: "Log the end-of-shift walk",
      cue: "Record what the walk found and the time on the site electrical log.",
      why: "The log is how the next shift knows this walk actually happened and what it found — a worn jacket or an unlabelled panel noticed tonight and never written down is exactly as unknown to tomorrow's crew as if nobody had walked the site at all.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.3, TSP_ACCENT);

    // ------------------------------------------------------------- the ground
    const groundTex = surfaceTexture((cx, w, h) => mudflatFace(cx, w, h, { base: "#4a4438", base2: "#3a352c" }), { repeat: 4, px: 320 });
    const ground = box(g, 5.6, 0.1, 4.8, 0, 0.05, 0, 0x4a4438, { rough: 0.95, metal: 0.05 });
    ground.material = texturedMat(groundTex, { rough: 0.92, metal: 0.05, color: 0x4a4438 });

    // ------------------------------------------------------------- the panel
    const panel = equipmentCabinet(g, 0.9, 1.7, 0.42, -1.4, -0.9, { ry: 0.3, color: 0x4a5560 });
    holoTag(panel, "Temp Panel TP-1", 0, 2.0, 0, { css: "#59c97b", w: 0.34 });
    const mainBreaker = group(panel, 0.2, 1.05, 0.22);
    box(mainBreaker, 0.1, 0.18, 0.05, 0, 0, 0, 0x2b3138, { rough: 0.5 });
    const mainHandle = box(mainBreaker, 0.04, 0.09, 0.04, 0, 0.02, 0.04, 0xd2312b, { rough: 0.5 });
    holoTag(panel, "Main", 0.2, 1.28, 0.22, { css: "#59c97b", w: 0.2 });
    reg(hits, mainBreaker, "panel-main");
    const rawLugs = box(panel, 0.16, 0.1, 0.03, -0.2, 0.8, 0.22, 0xb87333, { rough: 0.3, metal: 0.9 });
    reg(hits, rawLugs, "raw-lugs");

    const chart = decal(panel, 0.3, 0.14, 0.3, 1.45, 0.22, (cx, w, h) => {
      cx.fillStyle = "#0d1c14"; cx.fillRect(0, 0, w, h);
      cx.fillStyle = "#59c97b"; cx.fillRect(0, 0, w, h * 0.12);
      cx.fillStyle = "#eaf6fb"; cx.textAlign = "center"; cx.textBaseline = "middle";
      cx.font = `700 ${Math.round(h * 0.16)}px 'Barlow Condensed', Arial, sans-serif`;
      cx.fillText("AEGCP QUARTER", w / 2, h * 0.36);
      cx.fillStyle = "#f2c14b"; cx.font = `700 ${Math.round(h * 0.2)}px Arial, sans-serif`;
      cx.fillText("Q3 — YELLOW", w / 2, h * 0.72);
    }, { px: 220 });
    void chart;

    // ------------------------------------------------------------ receptacles
    const spider = group(g, 0.4, 0, 0.6, -0.4);
    box(spider, 0.4, 0.35, 0.3, 0, 0.18, 0, 0xf2c14b, { rough: 0.6, finish: "painted" });
    const receptDefs = [["gfci-recept-a", -0.12, 0.24], ["gfci-recept-b", 0, 0.24], ["gfci-recept-c", 0.12, 0.24]];
    const receptButtons = {};
    for (const [id, x, y] of receptDefs) {
      const r = group(spider, x, y, 0.16);
      box(r, 0.07, 0.09, 0.02, 0, 0, 0, 0x2b3138, { rough: 0.6 });
      const btn = ball(r, 0.012, 0, 0.02, 0.012, 0xd2312b, { rough: 0.5 });
      receptButtons[id] = btn;
      reg(hits, r, id);
    }
    holoTag(spider, "GFCI spider box", 0, 0.5, 0, { css: "#59c97b", w: 0.34 });

    // ---------------------------------------------------------------- ground rod
    const rodGroup = group(g, -2.2, 0, -0.4);
    const rod = cyl(rodGroup, 0.012, 0.012, 0.9, 0, 0.45, 0, 0x8a6a3a, { rough: 0.5, metal: 0.6, seg: 10 });
    reg(hits, rod, "ground-rod");
    const clamp = ball(rodGroup, 0.02, 0, 0.85, 0, 0xd8b23a, { rough: 0.45, metal: 0.6 });
    const jumper = cyl(g, 0.008, 0.008, 1.3, 0, 0, 0, 0x59c97b, { rough: 0.6, seg: 8, cast: false });
    jumper.position.set(-1.7, 0.5, -0.6); jumper.rotation.z = 1.0; jumper.rotation.x = 0.3;
    reg(hits, jumper, "bonding-jumper");
    void clamp;

    // -------------------------------------------------------------- tool kit
    const chest = toolChest(g, 2.1, 0.6, { ry: -0.6, color: 0xb8402f });
    const groundTester = instrument(chest, -0.05, 0.79, 0.02, { ry: 0.3, idle: "-- Ω", color: 0x59c97b });
    holoTag(groundTester, "ground tester", 0, 0.16, 0, { css: "#59c97b", w: 0.3 });
    reg(hits, groundTester, "ground-tester");
    const aegcpTester = instrument(g, 2.6, 0.5, 1.1, { ry: -0.9, idle: "-- %", color: 0xf2c14b });
    holoTag(aegcpTester, "AEGCP tester", 0, 0.16, 0, { css: "#f2c14b", w: 0.3 });
    reg(hits, aegcpTester, "aegcp-tester");

    // ------------------------------------------------------------- tag rack
    const tagRack = group(g, 1.6, 0, 1.5, 0.4);
    box(tagRack, 0.3, 0.4, 0.06, 0, 0.4, 0, 0x2b3138, { rough: 0.6 });
    const goodTag = box(tagRack, 0.08, 0.12, 0.01, -0.06, 0.5, 0.04, 0xf2c14b, { rough: 0.6 });
    holoTag(goodTag, "Q3 yellow", 0, 0.14, 0, { css: "#f2c14b", w: 0.22 });
    reg(hits, goodTag, "quarter-tag");
    const oldTag = box(tagRack, 0.08, 0.12, 0.01, 0.06, 0.5, 0.04, 0x59c97b, { rough: 0.6 });
    holoTag(oldTag, "Q2 green — expired", 0, 0.14, 0, { css: "#d2312b", w: 0.32 });
    reg(hits, oldTag, "wrong-tag-color");

    // -------------------------------------------------------- traffic / route
    const coneA = cone(g, 1.2, -1.6);
    reg(hits, coneA, "cone-a");
    const coneB = cone(g, -0.8, -1.6);
    reg(hits, coneB, "cone-b");

    const cordCoil = group(g, 1.3, 0.1, 0.2);
    box(cordCoil, 0.3, 0.08, 0.3, 0, 0.04, 0, 0x1b1e22, { rough: 0.85 });
    holoTag(cordCoil, "extension whip", 0, 0.26, 0, { css: "#59c97b", w: 0.3 });
    reg(hits, cordCoil, "cord-coil");
    const cableRamp = group(g, 0.2, 0, -1.6);
    box(cableRamp, 0.9, 0.06, 0.3, 0, 0.03, 0, 0xf2c14b, { rough: 0.6 });
    holoTag(cableRamp, "cable ramp", 0, 0.2, 0, { css: "#59c97b", w: 0.26 });
    hits["cable-ramp"] = cableRamp;

    // A puddle at the low corner, and the cord + running saw for the interrupt.
    const puddle = box(g, 0.9, 0.02, 0.7, 2.3, 0.011, -2.0, 0x2b4a5c, { rough: 0.15, metal: 0.2, opacity: 0.7, transparent: true, cast: false });
    void puddle;
    const puddleCord = cyl(g, 0.014, 0.014, 1.1, 2.0, 0.02, -2.0, 0x1b1e22, { rough: 0.85, seg: 8, cast: false });
    puddleCord.rotation.z = Math.PI / 2;
    const sawBody = box(g, 0.16, 0.14, 0.32, 2.6, 0.08, -2.0, 0x2b3138, { rough: 0.5, metal: 0.3 });
    const sawBlade = cyl(sawBody, 0.09, 0.09, 0.01, 0.1, 0, 0.16, CITY.steel, { rough: 0.3, metal: 0.9, seg: 20 });
    sawBlade.rotation.x = Math.PI / 2;

    // The frayed cord waiting to be tagged out.
    const damagedCord = group(g, -0.6, 0.1, 1.6);
    cyl(damagedCord, 0.014, 0.014, 0.7, 0, 0.02, 0, 0x1b1e22, { rough: 0.85, seg: 8 }).rotation.z = Math.PI / 2;
    box(damagedCord, 0.03, 0.02, 0.03, 0.2, 0.03, 0, 0xb87333, { rough: 0.4, metal: 0.7 }); // exposed conductor
    holoTag(damagedCord, "cut cord — tag it out", 0, 0.2, 0, { css: "#f0645b", w: 0.4 });
    reg(hits, damagedCord, "damaged-cord");

    // A second, separate cord lying flat in standing water at the lay-down
    // yard's low edge — the hazard, distinct from the frayed cord above.
    const yardPuddle = box(g, 0.5, 0.02, 0.4, -1.3, 0.011, 1.55, 0x2b4a5c, { rough: 0.15, metal: 0.2, opacity: 0.7, transparent: true, cast: false });
    void yardPuddle;
    const yardPuddleCord = cyl(g, 0.013, 0.013, 0.7, -1.3, 0.02, 1.55, 0x1b1e22, { rough: 0.85, seg: 8, cast: false });
    yardPuddleCord.rotation.z = Math.PI / 2;
    holoTag(yardPuddleCord, "cord in the puddle", 0, 0.18, 0, { css: "#f0645b", w: 0.32 });
    reg(hits, yardPuddleCord, "cord-in-mud");

    // Cheater plug hazard near the spider box.
    const cheater = box(g, 0.06, 0.04, 0.03, 0.7, 0.24, 0.6, 0xf2c14b, { rough: 0.6 });
    holoTag(cheater, "cheater plug", 0, 0.1, 0, { css: "#d2312b", w: 0.28 });
    reg(hits, cheater, "gfci-bypass");

    // ------------------------------------------------------------------ holos
    const sitePlan = holoPanel(g, 0.55, 0.4, -2.4, 1.5, 0.6, (cx, w, h) => {
      cx.fillStyle = "rgba(6,16,22,0.9)"; cx.fillRect(0, 0, w, h);
      cx.fillStyle = "#59c97b"; cx.fillRect(0, 0, w, 5);
      cx.fillStyle = "#eaf6fb"; cx.textAlign = "left"; cx.textBaseline = "middle";
      cx.font = `600 ${Math.round(h * 0.11)}px 'Barlow Condensed', Arial, sans-serif`;
      cx.fillText("SITE ELECTRICAL PLAN", w * 0.06, h * 0.18);
      cx.font = `${Math.round(h * 0.085)}px Arial, sans-serif`; cx.fillStyle = "#bcd6e2";
      ["Panel: high ground, clear of haul road", "Ground rod: NE corner of pad", "GFCI on every 125V receptacle"].forEach((l, i) => cx.fillText(l, w * 0.06, h * (0.42 + i * 0.16)));
    }, { ry: 0.55, accent: TSP_ACCENT });
    reg(hits, sitePlan, "site-plan");

    const siteLog = holoPanel(g, 0.42, 0.3, 2.4, 0.7, 1.3, (cx, w, h) => {
      cx.fillStyle = "rgba(6,16,22,0.9)"; cx.fillRect(0, 0, w, h);
      cx.fillStyle = "#59c97b"; cx.fillRect(0, 0, w, 5);
      cx.fillStyle = "#eaf6fb"; cx.textAlign = "center"; cx.textBaseline = "middle";
      cx.font = `600 ${Math.round(h * 0.18)}px 'Barlow Condensed', Arial, sans-serif`;
      cx.fillText("SITE LOG", w / 2, h * 0.32);
      cx.font = `${Math.round(h * 0.1)}px Arial, sans-serif`; cx.fillStyle = "#bcd6e2";
      cx.fillText("End-of-shift walk", w / 2, h * 0.66);
    }, { ry: -0.5, accent: TSP_ACCENT });
    reg(hits, siteLog, "site-log");

    // ---------------------------------------------------------- walk-down items
    const wornCord = group(g, -1.9, 0.1, 1.9);
    cyl(wornCord, 0.013, 0.013, 0.6, 0, 0.02, 0, 0x1b1e22, { rough: 0.85, seg: 8 }).rotation.z = Math.PI / 2;
    box(wornCord, 0.04, 0.015, 0.015, 0.1, 0.02, 0, 0x8a3f33, { rough: 0.8 });
    reg(hits, wornCord, "worn-cord-jacket");
    const unlabelPanel = equipmentCabinet(g, 0.5, 1.0, 0.3, 2.3, 1.9, { ry: -0.4, color: 0x5c666f });
    reg(hits, unlabelPanel, "unlabeled-panel");

    // A subcontractor, off to the side, who goes for the lugs if the interrupt is missed.
    const sub = standingFigure(g, 2.2, -0.7, { ry: -2.3, cloth: 0x37505f, helmet: 0xf2c14b, vest: 0xe4dc3a });
    holoTag(sub, "subcontractor", 0, 1.95, 0, { css: "#d2312b", w: 0.32 });
    reg(hits, sub, "subcontractor");
    const subHome = sub.position.clone();

    // Perimeter fence, dressing.
    for (let i = 0; i < 5; i++) {
      const px = -2.2 + i * 1.1;
      cyl(g, 0.02, 0.02, 1.5, px, 0.75, -2.35, 0x4a5158, { rough: 0.6, metal: 0.5, seg: 8 });
      if (i > 0) box(g, 1.1, 1.3, 0.015, px - 0.55, 0.75, -2.35, 0x6f7a83, { rough: 0.8, metal: 0.2, opacity: 0.32, transparent: true, cast: false });
    }

    // Material lay-down: a pipe stack and a spool of cable, clear of the crew.
    const pipeStack = group(g, -2.5, 0, 1.2);
    for (let i = 0; i < 4; i++) {
      cyl(pipeStack, 0.07, 0.07, 0.9, 0, 0.08 + i * 0.13, -i * 0.02, 0x8a3f33, { rough: 0.7, metal: 0.3, seg: 12 }).rotation.z = Math.PI / 2;
    }
    const spool = cyl(g, 0.32, 0.32, 0.24, 2.9, 0.12, 1.9, 0x8a6a3a, { rough: 0.7, metal: 0.2, seg: 16 });
    spool.rotation.x = Math.PI / 2;
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      cyl(spool, 0.008, 0.008, 0.24, Math.sin(a) * 0.28, Math.cos(a) * 0.28, 0, 0x1b1e22, { rough: 0.85, seg: 6, cast: false });
    }

    let arcTimer = 0;
    const arc = particles(g, 20, 0xbfe9ff, { size: 0.014, life: 0.28 });
    let mainOn = false;

    return {
      hits,
      footprint: 2.3,

      onStepComplete(step) {
        if (step.id === "main") { mainOn = true; mainHandle.rotation.z = -1.0; }
        if (step.id === "gfci-check") for (const b of Object.values(receptButtons)) b.material = mat(0x59c97b, { emissive: 0x59c97b, ei: 1.4 });
        if (step.id === "route") { cordCoil.position.set(0.2, 0.09, -1.6); }
        if (step.id === "damaged-cord") { damagedCord.visible = false; }
        if (step.id === "walk") { wornCord.visible = false; }
      },

      onHazard(hitId) { if (hitId === "raw-lugs" && mainOn) arcTimer = 0.4; },

      onInterrupt(it) {
        if (it.id === "saw-in-puddle") { sawBlade.material = mat(0xf0645b, { emissive: 0xf0645b, ei: 1.8, metal: 0.9, rough: 0.3 }); arcTimer = 0.5; }
        if (it.id === "sub-taps-lugs") { sub.position.set(-1.5, 0, -1.0); sub.rotation.y = 0.9; }
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "saw-in-puddle") { sawBlade.material = mat(CITY.steel, { rough: 0.3, metal: 0.9 }); }
        if (it.id === "sub-taps-lugs") { sub.position.copy(subHome); sub.rotation.y = -2.3; }
      },

      animate(t, dt, session) {
        void puddleCord;
        if (arcTimer > 0) { arcTimer -= dt; arc.visible = true; arc.userData.step(dt, new THREE.Vector3(-1.4, 0.9, -0.9), 0.08, 1.2, -2.4); }
        else if (arc.visible) arc.visible = false;
        const step = session?.step;
        if (session?.turn && step?.id === "main") mainHandle.rotation.z = -(session.turn.amount / session.turn.required) * Math.PI / 2;
        const gg = session?.gauge;
        if (gg && !gg.committed && step?.id === "ground-test") {
          repaint(groundTester.userData.screen, signFace(`${(gg.t * 20).toFixed(1)} Ω`, { bg: "#0d1c24", accent: gg.t <= 0.14 ? "#59c97b" : "#f0645b", fg: "#bfeaf7", scale: 0.6 }));
        }
        if (gg && !gg.committed && step?.id === "aegcp-test") {
          repaint(aegcpTester.userData.screen, signFace(`${Math.round(gg.t * 100)}%`, { bg: "#0d1c24", accent: gg.t > 0.68 && gg.t < 0.88 ? "#59c97b" : "#f0645b", fg: "#bfeaf7", scale: 0.6 }));
        }
      },
    };
  },
};
