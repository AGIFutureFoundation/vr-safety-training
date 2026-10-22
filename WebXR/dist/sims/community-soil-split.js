import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, ball, slab, group, decal, repaint, signFace, paperFace, particles, mat,
} from "../../../shared/kit.js";
import {
  CITY, stationPad, holoPanel, holoTag, toolChest, instrument, cone, barrierPanel,
  standingFigure, reg, surfaceTexture, texturedMat, pavingFace,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Community Soil Split VR — Hunters Point Edition, Community
// Environmental Justice.
//
// A community monitor witnesses an agency's soil sample on a generic parcel
// under a federal cleanup order and takes the community's own split of it —
// the same core, divided in front of both parties, so the neighbourhood has
// an answer that does not depend on trusting the agency's lab alone. The
// monitor works the public side of the fence the whole time; the agency
// sampler works the grid point inside it and hands the homogenised soil out
// through the site's sampling gate. Sited generically — no real parcel, no
// real agency, no real lab is named.

const CSS_ACCENT = 0xd88a4a;

export const SIM_COMMUNITY_SOIL_SPLIT = {
  id: "community-soil-split",
  index: "159",
  domain: "Environmental",
  trade: "Community environmental monitor",
  category: "Community Environmental Justice",
  district: "Environmental Monitoring",
  weather: "overcast",
  certification: "EPA QA/QC and chain-of-custody guidance (EPA QA/G-5) for any split sample relied on in public; California DTSC and EPA Superfund community-involvement oversight of the parcel; OSHA 29 CFR 1910.120 HAZWOPER for anyone who steps inside the fence — the monitor does not; California's Environmental Laboratory Accreditation Program (ELAP), which is what makes a lab \"independent\" of the agency's own contractor mean something; the Community Pollution Patrol Network's split-sample protocol",
  name: "Community Soil Split",
  title: simTitle("Community Soil Split"),
  tagline: "Witnessing an agency soil sample and taking the community's own split of it: the grid point, the decontaminated trowel, one core homogenised and divided into two jars, both labelled and sealed, custody signed by both parties, and the community jar carried to an independent lab",
  accent: CSS_ACCENT,
  accentCss: "#d88a4a",
  parSeconds: 280,
  footprint: 2.4,
  badge: { id: "split-clean", name: "Split Clean", note: "A witnessed core, decontaminated tools, both jars sealed and signed for, and the community jar on its way to an independent lab" },

  game: system({
    name: "Split Sample",
    currency: "CORE",
    ranks: ["Witness", "Field Monitor", "Custody Holder", "Patrol Lead", "Split Sample Certified"],
    badges: [
      { id: "point-honest", name: "Point Honest", note: "Never traded the plan's grid point for a different spot", test: AWARD.stepClean("locate") },
      { id: "chain-unbroken", name: "Chain Unbroken", note: "Never a hazard — decon, an independent lab and two signatures, every time", test: AWARD.safe },
      { id: "custody-true", name: "Custody True", note: "Both signatures on before the cooler ever left the table", test: AWARD.stepClean("custody") },
    ],
    challenges: [
      { id: "clean-witness", name: "Clean Witness", note: "No corrections across the whole witnessed sample", test: AWARD.clean },
      { id: "steady-mix", name: "Steady Mix", note: "Held the homogenising bowl through the full mix", test: AWARD.unbroken },
      { id: "split-fast", name: "Split Away", note: "Jar sealed and signed inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "cross-fence": "You stepped through the sampling gate to reach the agency's own tools inside the fence. The parcel is under a federal cleanup order and the fence is the boundary of it — a community monitor works the public side; going in is a HAZWOPER decision for a trained, badged and escorted worker, not something a witness does to save a trip to the gate.",
    "skip-decon": "You took the trowel straight from the last hole to this one without decontaminating it. Soil carried on the blade from one grid point to the next puts a false hit at a location that never had it — the community's split is only as honest as the tool that cut it, and an undecontaminated trowel is a false result waiting to be witnessed as real.",
    "same-lab": "You addressed the community jar to the agency's own contract lab because the mailer was already sitting on the table. The entire point of a split is a second, independent answer — sending both halves of the same core to the same lab for the same test gives the neighbourhood one number reported twice, not two.",
    "handoff-unsigned": "You handed the cooler to the courier before both signatures were on the chain of custody. An unsigned form is a jar nobody can prove came from this grid point on this day — a lab can run every test correctly on a sample that a defence attorney or a skeptical agency can still throw out for a broken chain.",
  },

  lateNotes: {
    "jar-community": "Nothing to fill yet — the core has to be homogenised first, or the two jars are two different samples, not one split in half.",
  },

  // Both interruptions land while the monitor's hands are already full — one
  // mid-mix, holding the bowl steady; one while the sealed jar is going into
  // the cooler — because that is exactly when a shortcut looks cheapest.
  interrupts: [
    {
      id: "offer-different-spot",
      kind: "Agency offers a substitute location",
      after: "homogenize", delay: 3, seconds: 13,
      alert: "The agency sampler nods toward a patch of ground ten feet off, drier and easier to dig: \"That spot's cleaner-looking, we could just fill both jars from over there instead.\"",
      cue: "Point back to the plan's own grid point — the split is only a split if it is the same core.",
      target: "grid-point",
      why: "The grid point is on the plan for a reason a monitor standing at the fence does not get to see — it is where the agency's own contamination model says the answer matters most. A cleaner-looking patch of ground ten feet away is a different sample entirely, and a split taken from it proves nothing about the point anyone actually asked about.",
      missNote: "The offer went unanswered and the crew moved on as if it had been accepted — the field sheet now names a grid point neither jar actually came from, and the community's own result is a number for the wrong hole in the ground.",
      wrongNote: "That's not the grid point — the flag at the plan's own marker is what the split has to stay tied to, not anything else on this table.",
    },
    {
      id: "seal-cracks-cooler",
      kind: "Custody seal cracks",
      after: "cooler-pack", delay: 3, seconds: 13,
      alert: "The tamper seal on the community jar has split along its fold as it went down into the ice — the label's still legible, but the seal itself is no longer intact.",
      cue: "That seal is broken. Reseal the jar and re-sign before the cooler goes anywhere.",
      target: "reseal-jar",
      why: "A broken seal is a gap in the one thing that makes this jar mean something after it leaves the monitor's hands — with the seal intact, nobody between the table and the lab bench can open the jar without it showing; with it cracked, the independent lab has no way to tell a clean chain from a compromised one, and the result gets footnoted as unverifiable no matter how carefully it was taken.",
      missNote: "The cooler went to the courier with a cracked seal riding along inside it. The independent lab flagged the sample as chain-of-custody compromised on arrival — the exact question a split sample exists to settle came back unanswered.",
      wrongNote: "Not that — the fresh tamper tape at the table is what reseals the jar. Nothing else here fixes a broken seal.",
    },
  ],

  steps: [
    {
      id: "plan", kind: "select", target: "split-plan",
      title: "Read the split-sample plan",
      cue: "Check the grid point, the split protocol and which independent lab the community jar goes to.",
      why: "The plan names the exact grid point the agency will sample, the order the split gets divided and labelled in, and the independent lab the community half is bound for — a monitor who has not read it is trusting memory for the one thing the whole station exists to get right the first time.",
    },
    {
      id: "locate", kind: "gauge", target: "gps-unit",
      title: "Confirm the grid point coordinates",
      cue: "Read the handheld GPS against the plan's coordinates before the agency's auger goes in.",
      why: "The grid point on the ground and the grid point on the plan have to be the same point, checked independently rather than taken on the agency crew's word — a split sample witnessed at the wrong coordinates is a split sample of nothing the plan called for, no matter how carefully everything after it is done.",
      gauge: { label: "GRID FIX", speed: 0.7, green: [0.44, 0.6], readout: (t) => `Δ ${(0.4 - t * 0.38).toFixed(2)} m`, missNote: "That is not close enough to the plotted point — let the fix settle and read it again before the auger goes in." },
    },
    {
      id: "decon", kind: "sequence", anyOrder: false,
      targets: ["decon-wash", "decon-rinse", "decon-dry"],
      itemNames: { "decon-wash": "detergent wash", "decon-rinse": "deionised rinse", "decon-dry": "air dry" },
      title: "Decontaminate the trowel",
      cue: "Wash, then deionised rinse, then air dry — before the blade touches this grid point's soil.",
      why: "A trowel that last cut soil at a different grid point carries that soil on it until something removes it — the wash breaks the film loose, the deionised rinse takes the wash water's own chemistry off before it can be mistaken for the site's, and the dry keeps a rinse droplet from diluting the very sample the blade is about to cut.",
      outOfOrderNote: "Wash, then deionised rinse, then dry — a rinse before the wash just spreads what the wash was going to remove.",
    },
    {
      id: "homogenize", kind: "hold", target: "mixing-bowl", seconds: 8,
      title: "Homogenise the core",
      cue: "Turn the soil over in the bowl until the colour and texture read even, top to bottom.",
      why: "One core is not one sample until it is mixed — soil settles by grain size and moisture the moment it is cut, and a spoon taken from the top of an unmixed core is a different, biased sample from a spoon taken from the bottom. Homogenising first is what makes the two jars that follow actually be one split, not two different soils that happened to come from the same hole.",
      holdBreakNote: "You let go before the mix read even — an unmixed core splits into two different samples, not one sample in two jars.",
    },
    {
      id: "split-jars", kind: "sequence", anyOrder: true,
      targets: ["jar-agency", "jar-community"],
      itemNames: { "jar-agency": "agency jar", "jar-community": "community jar" },
      title: "Divide the homogenised core into both jars",
      cue: "Spoon the mixed soil into the agency jar and the community jar in even scoops.",
      why: "Alternating scoops into each jar, rather than filling one and then the other, is what keeps a settling difference across the bowl from ending up entirely in one jar — the two jars are supposed to be the same sample twice, and how the soil is portioned out is the last chance to make that actually true.",
    },
    {
      id: "label-jars", kind: "sequence", anyOrder: true,
      targets: ["label-agency", "label-community"],
      itemNames: { "label-agency": "label — agency jar", "label-community": "label — community jar" },
      title: "Label both jars",
      cue: "Grid point, date, time and sampler's initials on both labels before either lid goes on.",
      why: "A lab a hundred miles from this fence has no way to know which hole in the ground a jar came from except what is written on it — the same grid point, date and time on both labels is what lets two independent results, months apart, be compared as answers to the same question instead of two unrelated numbers.",
    },
    {
      id: "seal-jars", kind: "hold", target: "seal-tape", seconds: 6,
      title: "Seal both jars",
      cue: "Run the tamper seal tape across each lid and hold it down until it sets.",
      why: "A tamper seal is what tells everyone downstream — the courier, the lab, a regulator questioning the result — that nobody opened this jar between the table and the bench. Held only long enough to look sealed, the tape lifts in the cooler; held to set, it is the physical proof the custody form is about to describe in writing.",
      holdBreakNote: "The tape let go before it set — a seal that lifts in the cooler is no seal by the time the jar gets where it's going.",
    },
    {
      id: "custody", kind: "sequence", anyOrder: false,
      targets: ["coc-agency-sign", "coc-community-sign"],
      itemNames: { "coc-agency-sign": "agency signature", "coc-community-sign": "community signature" },
      title: "Sign the chain of custody — both parties",
      cue: "Agency sampler signs first, then the community monitor signs the same line.",
      why: "A split sample is only as credible as the record that both parties actually stood at the same hole at the same time — one signature says a monitor was there; two signatures on the same form, in the same hand's ink, are what an independent lab and a skeptical regulator both accept as proof neither jar was substituted after the fact.",
      outOfOrderNote: "The agency signs the line first, describing the sample as taken — the community signature underneath is a witness to that, not the other way around.",
    },
    {
      id: "cooler-pack", kind: "hold", target: "cooler", seconds: 6,
      title: "Pack the community jar on ice",
      cue: "Set the sealed, signed jar into the cooler and hold the lid until it seats.",
      why: "Most soil holding times assume the jar is at 4 °C from the minute it leaves the table — a jar left warm on the tailgate for the ride to the courier can already be outside its holding time before it ever reaches the independent lab that was supposed to give the neighbourhood its own answer.",
      holdBreakNote: "The lid came up before it seated — the cooler never sealed and the jar rides warm until someone notices.",
    },
    {
      id: "courier", kind: "drag", target: "cooler",
      title: "Hand the cooler to the independent lab's courier",
      cue: "Carry the sealed cooler across to the courier, not the agency's own truck.",
      why: "The independent lab is the whole reason for this station — a jar handed to the agency's own vehicle by habit, however carefully it was sampled and sealed, ends up analysed by the same lab whose number the split was supposed to check. \"Independent\" means a lab holding its own ELAP accreditation, answerable to the state rather than to the agency that ordered the first sample.",
      drag: { to: "courier-van", radius: 0.5, missNote: "Not the agency's truck — the cooler goes to the independent lab's courier." },
    },
    {
      id: "field-sheet", kind: "select", target: "field-sheet",
      title: "Complete the field sheet",
      cue: "Record the grid point, the time, the split method and both jars' fates on the field sheet.",
      why: "The custody form proves the sample; the field sheet is what lets the next monitor, or the foundation reviewing a season of splits, understand what actually happened at this hole — the weather, who was present, what the agency's own instrument read — none of which the lab report will ever carry.",
    },
    {
      id: "walk", kind: "find", noHint: true,
      targets: ["uncapped-agency-jar"],
      itemNames: { "uncapped-agency-jar": "the agency jar, lid resting loose" },
      itemNotes: { "uncapped-agency-jar": "The agency's own jar has its lid set on top but not turned down — it is still their sample to seal, but a monitor who has just watched the whole procedure is the one person at this table positioned to say so before it is carried off half-sealed." },
      title: "Look over the table before it is broken down",
      cue: "Check both jars, both signatures and the table before anyone walks away from this grid point.",
      why: "This grid point does not get sampled again this season — a lid noticed loose now is a word to the agency sampler before the truck door closes; noticed later, on a truck fifteen minutes down the road, it is a sample nobody can vouch for and a split with only one honest half left.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.4, CSS_ACCENT);

    // ---------------------------------------------------------------- ground
    // Public sidewalk toward +z (textured paving), parcel soil toward -z,
    // a chain-link fence line dividing the two at z ≈ -0.2.
    const padTex = surfaceTexture((cx, w, h) => pavingFace(cx, w, h, { base: "#43423e", base2: "#3a3934", tiles: 5 }), { repeat: 3, px: 256 });
    const sidewalk = box(g, 5.6, 0.1, 2.6, 0, 0.05, 1.3, 0x43423e, { rough: 0.9, cast: false });
    sidewalk.material = texturedMat(padTex, { rough: 0.9, color: 0x8f8d84 });
    const parcel = box(g, 5.6, 0.08, 2.6, 0, 0.04, -1.4, 0x5a5142, { rough: 0.97, cast: false });

    // ------------------------------------------------------------- the fence
    function fenceSpan(px, pz, w) {
      const fp = group(g, px, 0, pz);
      for (const sx of [-w / 2, w / 2]) cyl(fp, 0.02, 0.02, 1.1, sx, 0.55, 0, CITY.steel, { rough: 0.45, metal: 0.7, seg: 8 });
      cyl(fp, 0.016, 0.016, w, 0, 1.08, 0, CITY.steel, { rough: 0.45, metal: 0.7, seg: 8 }).rotation.z = Math.PI / 2;
      const mesh = box(fp, w, 1.0, 0.01, 0, 0.55, 0, 0x9aa2a8, { rough: 0.6, metal: 0.3, opacity: 0.45, transparent: true, cast: false });
      return mesh;
    }
    fenceSpan(-1.9, -0.15, 1.5);
    fenceSpan(1.9, -0.15, 1.5);
    const fenceSign = decal(g, 0.4, 0.22, -1.9, 1.2, -0.15, signFace("PARCEL 4B — CLEANUP ORDER", { bg: "#241a0d", accent: "#e8b02e", scale: 0.42 }));
    void fenceSign;

    // -------------------------------------------------------- sampling gate
    const gate = group(g, 0, 0, -0.15);
    const gateFrame = box(gate, 1.0, 1.1, 0.02, 0, 0.55, 0, CITY.darkSteel, { rough: 0.5, metal: 0.6 });
    void gateFrame;
    const crossHit = box(g, 0.9, 0.9, 0.5, 0, 0.5, -0.15, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "step through the gate?", 0, 1.1, -0.15, { css: "#d2312b", w: 0.5 });
    reg(hits, crossHit, "cross-fence");

    // ------------------------------------------------- the grid point (inside)
    const gridGrp = group(g, 0.2, 0.04, -1.5);
    const gridFlag = cyl(gridGrp, 0.008, 0.008, 0.4, 0, 0.2, 0, 0xe8622a, { rough: 0.6, seg: 8 });
    ball(gridGrp, 0.03, 0, 0.4, 0, 0xe8622a, { rough: 0.6, seg: 10 });
    holoTag(gridGrp, "grid point GP-4B-07", 0, 0.6, 0, { css: "#d88a4a", w: 0.4 });
    reg(hits, gridGrp, "grid-point");
    const holeGrp = group(g, 0.2, 0.03, -1.5);
    cyl(holeGrp, 0.14, 0.16, 0.05, 0, -0.02, 0, 0x2c2620, { rough: 0.98, seg: 16 });

    // Agency sampler, inside the fence, at the grid point — clear of every control.
    const agencySampler = standingFigure(g, -0.35, -1.6, { ry: 1.4, cloth: 0x2b3138, vest: 0xe8b02e, helmet: 0x1b1e22 });
    holoTag(agencySampler, "agency sampler", 0, 1.9, 0, { css: "#d88a4a", w: 0.34 });
    void agencySampler;
    const augerCase = group(g, -0.7, 0.04, -1.85);
    box(augerCase, 0.32, 0.14, 0.18, 0, 0.07, 0, 0x3a3f45, { rough: 0.6, metal: 0.3 });
    cyl(augerCase, 0.012, 0.012, 0.5, 0.05, 0.14, -0.06, 0x8a939b, { rough: 0.4, metal: 0.7, seg: 8 });

    // GPS unit staged at the fence line, on the public side.
    const gpsPost = group(g, -1.3, 0.04, -0.35);
    cyl(gpsPost, 0.018, 0.02, 0.7, 0, 0.35, 0, CITY.steel, { rough: 0.5, metal: 0.6, seg: 8 });
    const gpsInst = instrument(gpsPost, 0, 0.72, 0, { idle: "-- m", color: CSS_ACCENT, w: 0.13, d: 0.2 });
    holoTag(gpsPost, "handheld GPS", 0, 0.95, 0, { css: "#d88a4a", w: 0.3 });
    reg(hits, gpsInst, "gps-unit");

    // -------------------------------------------------------------- the plan
    const planBoard = holoPanel(g, 0.92, 0.62, -1.6, 1.15, 1.2, (cx, w, h) => {
      cx.fillStyle = "#241a0d"; cx.fillRect(0, 0, w, h); cx.fillStyle = "#d88a4a"; cx.fillRect(0, 0, w, 6);
      cx.font = `600 ${Math.round(h * 0.1)}px 'Barlow Condensed', Arial, sans-serif`; cx.textAlign = "left"; cx.textBaseline = "middle";
      cx.fillStyle = "#f5e6cf"; cx.fillText("SPLIT-SAMPLE PLAN — GP-4B-07", w * 0.06, h * 0.13);
      cx.font = `${Math.round(h * 0.072)}px Arial, sans-serif`; cx.fillStyle = "#efe0be";
      ["Grid point set by the agency's own model", "Split: one core, two jars, alternating scoops", "Community jar → independent lab, on ice",
       "Custody: both parties sign, in order", "Decon the tool between every grid point"].forEach((l, i) => cx.fillText(l, w * 0.06, h * (0.3 + i * 0.11)));
    }, { ry: 0.35, accent: CSS_ACCENT });
    reg(hits, planBoard, "split-plan");

    // -------------------------------------------------------- the split table
    const table = group(g, 1.1, 0.1, 0.9, -0.3);
    box(table, 1.5, 0.05, 0.8, 0, 0.7, 0, 0x8a7d63, { rough: 0.7 });
    for (const [sx, sz] of [[-0.68, -0.32], [0.68, -0.32], [-0.68, 0.32], [0.68, 0.32]]) box(table, 0.04, 0.7, 0.04, sx, 0.35, sz, 0x5a5142, { rough: 0.7 });

    const decon = group(table, -0.55, 0.72, 0.15);
    const washBottle = cyl(decon, 0.03, 0.03, 0.16, -0.1, 0.08, 0, 0x8fd8ff, { rough: 0.4, opacity: 0.8, transparent: true, seg: 12 });
    holoTag(decon, "detergent wash", -0.1, 0.2, 0, { css: "#d88a4a", w: 0.32 });
    reg(hits, washBottle, "decon-wash");
    const rinseBottle = cyl(decon, 0.03, 0.03, 0.16, 0.1, 0.08, 0, 0xe8eef2, { rough: 0.4, opacity: 0.8, transparent: true, seg: 12 });
    holoTag(decon, "deionised rinse", 0.1, 0.2, 0, { css: "#d88a4a", w: 0.32 });
    reg(hits, rinseBottle, "decon-rinse");
    const dryRack = box(decon, 0.16, 0.02, 0.08, 0.3, 0.03, 0, 0xd9cbb2, { rough: 0.8 });
    holoTag(decon, "air-dry rack", 0.3, 0.14, 0, { css: "#d88a4a", w: 0.26 });
    reg(hits, dryRack, "decon-dry");
    const trowel = group(decon, 0, 0.15, -0.15);
    box(trowel, 0.16, 0.015, 0.05, 0, 0, 0, CITY.steel, { rough: 0.35, metal: 0.8 });
    cyl(trowel, 0.012, 0.012, 0.14, -0.14, 0, 0, 0x5a4632, { rough: 0.8, seg: 8 }).rotation.z = Math.PI / 2;

    const dirtyTrowel = group(table, -0.55, 0.72, -0.28);
    box(dirtyTrowel, 0.16, 0.015, 0.05, 0, 0, 0, 0x6a5638, { rough: 0.6 });
    cyl(dirtyTrowel, 0.012, 0.012, 0.14, -0.14, 0, 0, 0x5a4632, { rough: 0.8, seg: 8 }).rotation.z = Math.PI / 2;
    const skipDeconHit = box(table, 0.24, 0.16, 0.16, -0.55, 0.85, -0.28, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(table, "grab it uncleaned?", -0.55, 1.0, -0.28, { css: "#d2312b", w: 0.36 });
    reg(hits, skipDeconHit, "skip-decon");

    const bowl = group(table, -0.1, 0.72, 0);
    cyl(bowl, 0.14, 0.1, 0.09, 0, 0.045, 0, 0xdfe6ec, { rough: 0.4, metal: 0.3, seg: 18 });
    const soilPile = ball(bowl, 0.09, 0, 0.08, 0, 0x6a5638, { rough: 0.95, seg: 12 });
    holoTag(bowl, "homogenising bowl", 0, 0.24, 0, { css: "#d88a4a", w: 0.36 });
    reg(hits, bowl, "mixing-bowl");

    const jarSpecs = [["jar-agency", 0.2, 0xdfe6ec, "AGENCY"], ["jar-community", 0.42, 0xd88a4a, "COMMUNITY"]];
    const jars = {};
    for (const [id, dx, color, label] of jarSpecs) {
      const jGrp = group(table, dx, 0.72, 0.1);
      const jar = cyl(jGrp, 0.05, 0.05, 0.13, 0, 0.065, 0, 0xf0ede2, { rough: 0.3, opacity: 0.85, transparent: true, seg: 14 });
      const lid = cyl(jGrp, 0.052, 0.052, 0.02, 0, 0.14, 0, color, { rough: 0.5, metal: 0.3, seg: 14 });
      holoTag(jGrp, label + " JAR", 0, 0.24, 0, { css: "#d88a4a", w: 0.3 });
      reg(hits, jar, id);
      jars[id] = { jGrp, jar, lid };
    }
    const labelSpecs = [["label-agency", jars["jar-agency"].jGrp], ["label-community", jars["jar-community"].jGrp]];
    const labels = {};
    for (const [id, jGrp] of labelSpecs) {
      const lbl = decal(jGrp, 0.06, 0.04, 0.06, 0.07, 0, signFace("GP-4B-07", { bg: "#f4efe0", accent: "#1b1e22", scale: 0.55 }));
      reg(hits, lbl, id);
      labels[id] = lbl;
    }
    const sealTape = box(table, 0.1, 0.03, 0.03, 0.62, 0.73, -0.1, 0xf2c14b, { rough: 0.6 });
    holoTag(table, "tamper seal tape", 0.62, 0.85, -0.1, { css: "#d88a4a", w: 0.32 });
    reg(hits, sealTape, "seal-tape");

    const mailerBox = group(table, 0.45, 0.72, -0.28);
    box(mailerBox, 0.18, 0.1, 0.14, 0, 0.05, 0, 0xe8e0c8, { rough: 0.8 });
    decal(mailerBox, 0.16, 0.06, 0, 0.101, 0, signFace("AGENCY LAB — RETURN", { bg: "#e8e0c8", accent: "#8a5a2a", scale: 0.42 }));
    const sameLabHit = box(table, 0.22, 0.16, 0.18, 0.45, 0.85, -0.28, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(table, "mail it here instead?", 0.45, 1.0, -0.28, { css: "#d2312b", w: 0.4 });
    reg(hits, sameLabHit, "same-lab");

    const cocClip = group(table, -0.35, 0.72, 0.28);
    box(cocClip, 0.2, 0.006, 0.26, 0, 0, 0, 0xf3efe4, { rough: 0.9 });
    decal(cocClip, 0.18, 0.24, 0, 0.005, 0, paperFace("CHAIN OF CUSTODY", ["Grid point GP-4B-07", "Sampled by: (agency)", "Witnessed by: (community)", "Relinquished / received: ______"], { scale: 0.85 })).rotation.x = -Math.PI / 2;
    reg(hits, cocClip, "coc-clip");
    const agencySign = decal(cocClip, 0.08, 0.03, -0.05, 0.006, 0.08, signFace("SIGN", { bg: "#f3efe4", accent: "#1b1e22", scale: 0.5 }));
    reg(hits, agencySign, "coc-agency-sign");
    const communitySign = decal(cocClip, 0.08, 0.03, 0.05, 0.006, 0.08, signFace("SIGN", { bg: "#f3efe4", accent: "#1b1e22", scale: 0.5 }));
    reg(hits, communitySign, "coc-community-sign");

    const fieldSheetClip = group(table, 0.1, 0.72, 0.3);
    box(fieldSheetClip, 0.18, 0.006, 0.22, 0, 0, 0, 0xecebe0, { rough: 0.9 });
    decal(fieldSheetClip, 0.16, 0.2, 0, 0.005, 0, paperFace("FIELD SHEET", ["Grid point + time", "Split method", "Weather + conditions", "Both jars' destination"], { scale: 0.85 })).rotation.x = -Math.PI / 2;
    reg(hits, fieldSheetClip, "field-sheet");

    // Reseal kit staged at the edge of the table, for the interruption.
    const resealTape = box(table, 0.1, 0.03, 0.03, 0.62, 0.73, 0.28, 0xf2c14b, { rough: 0.6 });
    resealTape.visible = false;
    reg(hits, resealTape, "reseal-jar");

    // ------------------------------------------------------------- cooler
    const cooler = group(g, 1.9, 0.1, 1.6, -0.2);
    box(cooler, 0.55, 0.35, 0.38, 0, 0.19, 0, 0xdfe6ec, { rough: 0.65 });
    const coolerLid = box(cooler, 0.57, 0.05, 0.4, 0, 0.4, 0, 0xd88a4a, { rough: 0.6 });
    decal(cooler, 0.3, 0.08, 0, 0.19, 0.191, signFace("4°C · TO INDEPENDENT LAB", { bg: "#2b2318", accent: "#f5e6cf", scale: 0.42 }));
    reg(hits, cooler, "cooler");

    // ----------------------------------------------------- courier + van
    const courierHome = new THREE.Vector3(1.7, 0.1, 2.2);
    const courier = standingFigure(g, courierHome.x, courierHome.z, { ry: -2.3, cloth: 0x2b5a4a, vest: 0xf2c14b });
    holoTag(courier, "independent lab courier", 0, 1.9, 0, { css: "#d88a4a", w: 0.44 });
    const van = group(g, 3.3, 0.1, 1.7, -0.5);
    box(van, 1.1, 0.6, 0.7, 0, 0.4, 0, 0xe8eef2, { rough: 0.55, metal: 0.3 });
    box(van, 0.4, 0.35, 0.72, -0.5, 0.55, 0, 0xd5dde3, { rough: 0.5 });
    decal(van, 0.7, 0.16, 0, 0.4, 0.36, signFace("INDEPENDENT LAB COURIER", { bg: "#0d1c24", accent: "#59c97b", scale: 0.42 }));
    const courierSocket = group(g, 3.0, 0.1, 1.9);
    courierSocket.visible = false;
    hits["courier-van"] = courierSocket;
    const unsignedHandoffHit = box(g, 0.4, 0.4, 0.4, 2.8, 0.4, 1.9, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "hand it off unsigned?", 2.8, 0.7, 1.9, { css: "#d2312b", w: 0.46 });
    reg(hits, unsignedHandoffHit, "handoff-unsigned");

    // The agency jar the walk-through checks — lid left resting, not sealed.
    const looseLid = jars["jar-agency"].lid;
    reg(hits, looseLid, "uncapped-agency-jar");

    cone(g, 2.4, 2.4); cone(g, -2.4, 2.2);
    barrierPanel(g, 0, 2.3, { color: CSS_ACCENT });
    toolChest(g, -2.1, 1.3, { color: CSS_ACCENT });
    const patrolWatcher = standingFigure(g, -1.9, 0.65, { ry: 1.9, cloth: 0x37505f, vest: 0xf2c14b });
    holoTag(patrolWatcher, "second monitor — witness", 0, 1.9, 0, { css: "#d88a4a", w: 0.44 });

    let mixing = false;
    return {
      hits,
      spawnLook: new THREE.Vector3(1.0, 1.0, 0.7),
      onStep() {},
      onStepComplete(step) {
        if (step.id === "homogenize") soilPile.material = mat(0x4a3d28, { rough: 0.9 });
        if (step.id === "split-jars") { jars["jar-agency"].jar.material.color.v = 0x6a5638; jars["jar-community"].jar.material.color.v = 0x6a5638; }
        if (step.id === "label-jars") for (const id of Object.keys(labels)) repaint(labels[id], signFace("GP-4B-07 ✓", { bg: "#f4efe0", accent: "#3a7a4a", scale: 0.55 }));
        if (step.id === "seal-jars") { jars["jar-agency"].lid.position.y = 0.14; jars["jar-community"].lid.position.y = 0.14; }
        if (step.id === "custody") { repaint(agencySign, signFace("SIGNED", { bg: "#f3efe4", accent: "#3a7a4a", scale: 0.45 })); repaint(communitySign, signFace("SIGNED", { bg: "#f3efe4", accent: "#3a7a4a", scale: 0.45 })); }
        if (step.id === "cooler-pack") { jars["jar-community"].jGrp.parent.remove(jars["jar-community"].jGrp); cooler.add(jars["jar-community"].jGrp); jars["jar-community"].jGrp.position.set(0, 0.3, 0); }
        if (step.id === "courier") { cooler.parent.remove(cooler); courierSocket.add(cooler); cooler.position.set(0, 0.1, 0); }
        if (step.id === "walk") looseLid.position.y = 0.14;
      },
      onHazard() {},
      onInterrupt(it) {
        if (it.id === "offer-different-spot") gridFlag.material = mat(0xf0645b, { emissive: 0xf0645b, ei: 1.4, rough: 0.6 });
        if (it.id === "seal-cracks-cooler") { const j = jars["jar-community"]; j.lid.rotation.z = 0.4; resealTape.visible = true; }
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "offer-different-spot") gridFlag.material = mat(0xe8622a, { rough: 0.6 });
        if (it.id === "seal-cracks-cooler") { const j = jars["jar-community"]; j.lid.rotation.z = 0; resealTape.visible = false; }
      },
      animate(t, dt, session) {
        const step = session?.step;
        mixing = !!(step?.id === "homogenize" && session.holding);
        if (mixing) soilPile.rotation.y += dt * 3;
        const gg = session?.gauge;
        if (gg && !gg.committed && step?.id === "locate") {
          repaint(gpsInst.userData.screen, signFace(`Δ ${(0.4 - gg.t * 0.38).toFixed(2)} m`, { bg: "#0d1c24", accent: gg.t >= 0.44 && gg.t <= 0.6 ? "#59c97b" : "#f2ae14", fg: "#bfeaf7", scale: 0.55 }));
        }
      },
    };
  },
};
