import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, ball, group, decal, repaint, signFace, paperFace, particles, mat,
} from "../../../shared/kit.js";
import {
  CITY, stationPad, holoPanel, holoTag, toolChest, instrument, cone, barrierPanel,
  standingFigure, reg, surfaceTexture, texturedMat, mudflatFace, waterFace,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Shoreline Sediment Grab VR — Hunters Point Edition, Community
// Environmental Justice.
//
// A community monitor grabs a shoreline sediment sample at low tide, on a
// generic reach of bay shoreline near a fenced parcel — never the shoreline
// itself, never a real transect line. The tide sets the working window, the
// top two centimetres are the sample because that is the layer anything
// living in the mud actually touches, and the eelgrass and cordgrass beds
// that make this reach worth protecting are also the reason the transect
// line moves the moment a listed bird calls from them.

const SSG_ACCENT = 0x5a9fc9;

export const SIM_SHORELINE_SEDIMENT_GRAB = {
  id: "shoreline-sediment-grab",
  index: "161",
  domain: "Environmental",
  trade: "Community environmental monitor",
  category: "Community Environmental Justice",
  district: "Environmental Monitoring",
  weather: "overcast",
  certification: "NOAA tide table and predicted low-water window; EPA QA/QC and chain-of-custody guidance (EPA QA/G-5) for sediment samples relied on in public; U.S. Fish and Wildlife Service — Endangered Species Act protection for Ridgway's rail; San Francisco Bay Conservation and Development Commission (BCDC) shoreline access rules; the Community Pollution Patrol Network's shoreline sampling protocol",
  name: "Shoreline Sediment Grab",
  title: simTitle("Shoreline Sediment Grab"),
  tagline: "A shoreline sediment grab on a falling tide: the tide window read, the grab sampler used on the top two centimetres, pH and odour logged, the jar iced, custody signed, and the eelgrass and cordgrass kept off the whole time",
  accent: SSG_ACCENT,
  accentCss: "#5a9fc9",
  parSeconds: 280,
  footprint: 2.6,
  badge: { id: "window-held", name: "Window Held", note: "A clean grab from the top two centimetres, taken and iced inside the tide window, without a boot in the eelgrass or the cordgrass" },

  game: system({
    name: "Shoreline Grab",
    currency: "GRAB",
    ranks: ["Shoreline Watcher", "Field Monitor", "Transect Lead", "Patrol Coordinator", "Shoreline Grab Certified"],
    badges: [
      { id: "tide-read", name: "Tide Read", note: "Checked the tide window clean before a boot touched the mud", test: AWARD.stepClean("tide-check") },
      { id: "habitat-clear", name: "Habitat Clear", note: "Never a hazard — the eelgrass and cordgrass stayed untouched", test: AWARD.safe },
      { id: "layer-true", name: "Layer True", note: "Grab depth and field pH both read inside spec", test: AWARD.precise(0.7) },
    ],
    challenges: [
      { id: "clean-grab", name: "Clean Grab", note: "No corrections across the whole grab", test: AWARD.clean },
      { id: "steady-scoop", name: "Steady Scoop", note: "Held the grab sampler through the full scoop", test: AWARD.unbroken },
      { id: "beat-the-tide", name: "Beat the Tide", note: "Jar iced and logged inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "walk-eelgrass": "You cut across the eelgrass bed to reach the grab point faster. Eelgrass is the nursery habitat this whole reach is being protected for — a boot print through it takes years to fill back in, and there is always a longer way around that does not cross it.",
    "walk-cordgrass": "You pushed through the cordgrass stand instead of using the boardwalk around it. Native cordgrass this dense is exactly where a Ridgway's rail nests low to the ground — a monitor walking through it can be standing on a nest before anything visible tells them so.",
    "scoop-too-deep": "You drove the grab sampler down into the coarse sand well below the surface layer. The top two centimetres is the sample because that is the layer an eelgrass root, a worm and a shorebird's bill all actually reach — sediment from ten centimetres down answers a different question than the one this grab is for.",
    "jar-in-sun": "You set the filled jar down on the dry sand in direct sun instead of straight into the cooler. A sediment sample left warm even for the walk back to the truck starts changing chemically before it ever reaches a lab — the point of icing it immediately is that immediately is the only time it is still what came out of the ground.",
  },

  lateNotes: {
    "grab-jar": "Nothing to log until the sampler has actually come up with sediment in it — an empty jar has no pH and no odour to note.",
    "coc-board": "The form describes a sample that is already jarred and labelled. Fill and label first, then sign.",
  },

  // Both interruptions land on the two steps where the monitor's hands are
  // already occupied and their eyes are on the sampler or the water, not on
  // the tide line or the cordgrass behind them.
  interrupts: [
    {
      id: "tide-turns-early",
      kind: "Tide turns early",
      after: "grab", delay: 3, seconds: 13,
      alert: "The water at the tide line has stopped receding and started climbing back over the flat faster than the table predicted — the mud around your boots is already softening.",
      cue: "Check the tide gauge now — the window may be closing faster than planned.",
      target: "tide-gauge",
      why: "A predicted low-water window is a forecast, not a guarantee — wind and barometric pressure can turn the tide early, and a monitor who keeps working past that turn on the strength of a printed table can find the retreat route across the flat gone before the sample is even sealed.",
      missNote: "The grab finished with nobody having looked at the gauge again, and the walk back across the flat was through ankle-deep water nobody planned for — the tide table said one thing, the bay did another, and only the gauge would have caught the difference in time.",
      wrongNote: "That's not it — the tide gauge is what tells you whether this window is still open, not anything in your hands right now.",
    },
    {
      id: "rail-calls-move-transect",
      kind: "Ridgway's rail calls from the cordgrass",
      after: "grab", delay: 7, seconds: 13,
      alert: "A Ridgway's rail is calling from inside the cordgrass stand right beside the transect line you just walked to get here.",
      cue: "Move the transect flag back from the cordgrass before anyone walks this line again.",
      target: "transect-flag",
      why: "A federally listed rail calling this close to the line means the transect itself is running along the edge of occupied habitat — moving the flag now is what keeps the next pass, and the next monitor who follows this same line without knowing why it bends here, off a nest nobody has actually seen yet.",
      missNote: "The transect line stayed exactly where it was, running along the edge of a stand a rail had just called from — the next crew to work this line has no reason to think it was ever supposed to move.",
      wrongNote: "Not that — the transect flag is what has to move back from the cordgrass, nothing else on this beach.",
    },
  ],

  steps: [
    {
      id: "tide-check", kind: "select", target: "tide-board",
      title: "Read the tide window",
      cue: "Check the predicted low-water time and how much working time it gives before the flat floods again.",
      why: "The whole grab happens in the window between the tide dropping far enough to expose the sample point and turning back to cover it — a monitor who has not checked it is trusting the sky rather than the table for the one number that decides how much time there actually is out here.",
    },
    {
      id: "stage", kind: "sequence", anyOrder: true,
      targets: ["waders", "nitrile-gloves", "buddy-present"],
      itemNames: { "waders": "chest waders", "nitrile-gloves": "nitrile gloves", "buddy-present": "second monitor on the bank" },
      title: "Stage before stepping onto the flat",
      cue: "Waders on, gloves on, and confirm the second monitor is on the bank before anyone walks out.",
      why: "Bay mud grabs at a boot the way quicksand does at a smaller scale, and a monitor who goes in alone has nobody to call for help or watch the tide behind them — the second person on the bank is the whole safety plan for working a falling tide on foot.",
    },
    {
      id: "walk-transect", kind: "drag", target: "transect-flag",
      title: "Set the transect flag on the marked line",
      cue: "Carry the transect flag out along the boardwalk to today's grab point — not through the vegetation.",
      why: "The transect line is drawn on the plan to keep every visit crossing the flat in the same place, on the boardwalk, specifically so the eelgrass and cordgrass on either side of it never see a boot — the flag marks that this grab point is being worked honestly, on the line, not wherever was fastest today.",
      drag: { to: "grab-point-socket", radius: 0.5, missNote: "Not on the marked line yet — the flag has to reach today's grab point, following the boardwalk around the vegetation." },
    },
    {
      id: "position-check", kind: "gauge", target: "gps-unit",
      title: "Confirm the grab point's coordinates",
      cue: "Read the handheld GPS against the plan's coordinates for today's point.",
      why: "The transect flag marks the point by eye, but the coordinates are what let this exact spot be found again next season and compared honestly against today's result — a grab taken a few metres off the plotted point is a grab of a different reach, however careful everything after it is.",
      gauge: { label: "GRID FIX", speed: 0.7, green: [0.44, 0.6], readout: (t) => `Δ ${(0.4 - t * 0.38).toFixed(2)} m`, missNote: "That is not close enough to the plotted point — let the fix settle and read it again." },
    },
    {
      id: "field-obs", kind: "sequence",
      targets: ["obs-color", "obs-odor", "obs-sheen"],
      itemNames: { "obs-color": "sediment colour", "obs-odor": "odour", "obs-sheen": "surface sheen" },
      title: "Note the field observations before digging in",
      cue: "Colour, odour, then any surface sheen — recorded before the sampler disturbs any of it.",
      why: "Colour, odour and sheen are gone the moment the sampler stirs the surface — a black, sulfurous mud with a rainbow sheen on top tells a different story than a grey, odourless one, and that story only exists to record in the ten seconds before the grab itself changes it.",
      outOfOrderNote: "Colour, then odour, then sheen — the order the undisturbed surface actually gives them up in, before the grab itself churns all three together.",
    },
    {
      id: "grab", kind: "hold", target: "grab-sampler", seconds: 9,
      title: "Take the grab from the top two centimetres",
      cue: "Press the sampler flat and hold it at the surface layer until it closes.",
      why: "The top two centimetres is the layer eelgrass roots, benthic worms and a shorebird's bill all actually touch — that is the question this station's sample is meant to answer, and holding the sampler flat at the surface rather than driving it down is what keeps the answer about that layer and not about whatever is underneath it.",
      holdBreakNote: "You lifted the sampler before it closed on the surface layer — a partial grab is neither the top two centimetres nor anything else defensible.",
    },
    {
      id: "cap-jar", kind: "select", target: "grab-jar",
      title: "Cap the sample in the jar",
      cue: "Turn the sediment into the jar and cap it before it sits exposed any longer than it has to.",
      why: "Sediment chemistry starts changing the moment it is out of the ground and open to the air — capping it promptly is what keeps the sample closer to what actually came off the bottom than to whatever it turns into after a few minutes exposed on the flat.",
    },
    {
      id: "field-ph", kind: "gauge", target: "ph-meter",
      title: "Read field pH on the jarred sample",
      cue: "Let the field pH meter settle on the jarred sediment and commit the reading.",
      why: "Field pH is a snapshot that keeps drifting the moment the sediment is exposed to air — reading it here, on the jar that just closed, is the only chance to record a number that actually describes the sediment as it came out of the ground rather than as it sat in a cooler for an hour.",
      gauge: { label: "FIELD pH", speed: 0.72, green: [0.42, 0.6], readout: (t) => `${(6 + t * 3).toFixed(2)} pH`, missNote: "Let the reading settle and commit once it stops drifting." },
    },
    {
      id: "ice-jar", kind: "hold", target: "cooler", seconds: 6,
      title: "Get the jar on ice",
      cue: "Set the sealed jar into the cooler and hold the lid until it seats.",
      why: "Sediment chemistry keeps changing after the grab the same way water chemistry does — sulfides oxidise, biology keeps working — and 4 °C on ice from the moment it is jarred is what the holding times this sample is judged against actually assume happened.",
      holdBreakNote: "The lid came up before it seated — the cooler never sealed and the sample rides warm on the walk back.",
    },
    {
      id: "custody", kind: "select", target: "coc-board",
      title: "Sign the chain of custody",
      cue: "Label the jar with the grab point, tide state and time, then sign the custody form.",
      why: "A jar of mud means nothing to a lab without the grid point, the tide state and the time it was taken written on it and signed for — the custody form is what turns \"sediment from the shoreline\" into a sample a regulator can act on.",
    },
    {
      id: "field-sheet", kind: "select", target: "field-sheet",
      title: "Complete the field sheet",
      cue: "Record the tide state, the transect line and anything seen along it — wildlife included.",
      why: "The field sheet is where the rail call, the tide turning early or anything else that happened along this transect gets written down for whoever plans the next visit — none of that survives in the jar itself.",
    },
    {
      id: "walk-out", kind: "find", noHint: true,
      targets: ["boot-print-eelgrass"],
      itemNames: { "boot-print-eelgrass": "a boot print at the edge of the eelgrass bed" },
      itemNotes: { "boot-print-eelgrass": "One boot print sits right at the eelgrass bed's edge, off the boardwalk line — worth noting on the field sheet even if it was there before today's crew ever arrived, since the next visit will read this reach as more disturbed than it actually was without that note." },
      title: "Check the transect line before heading back",
      cue: "Walk the boardwalk line back and look for anything that needs noting before the tide closes it.",
      why: "This is the last look this reach gets until the next scheduled visit — a disturbance noted now, even one this crew did not cause, is context the next monitor needs; noticed after the tide has covered it, it is a question nobody can answer.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.6, SSG_ACCENT);

    // ------------------------------------------------------------ terrain
    // Upland bank toward +z, tidal mudflat toward -z, open water beyond it.
    const bank = box(g, 5.6, 0.24, 1.4, 0, 0.12, 1.9, 0x5a4f3a, { rough: 0.94 });
    void bank;
    const mudTex = surfaceTexture((cx, w, h) => mudflatFace(cx, w, h, { base: "#3f4a44", base2: "#333c36", cracks: 30, pools: 5 }), { repeat: 3, px: 256 });
    const flat = box(g, 5.6, 0.1, 3.2, 0, 0.04, -0.1, 0x3f4a44, { rough: 0.95, cast: false });
    flat.material = texturedMat(mudTex, { rough: 0.95, color: 0x8a9a92 });
    const waterTex = surfaceTexture((cx, w, h) => waterFace(cx, w, h, {}), { repeat: 3, px: 256 });
    const water = box(g, 5.6, 0.03, 1.0, 0, 0.015, -2.2, 0x0c2531, { rough: 0.2, metal: 0.28, opacity: 0.88, transparent: true, cast: false });
    water.material = texturedMat(waterTex, { rough: 0.2, metal: 0.25, color: 0x235a5e });
    water.material.transparent = true; water.material.opacity = 0.86;
    const wave = particles(g, 20, 0xbfe6d2, { size: 0.028, life: 0.8, additive: false, opacity: 0.32 });
    wave.position.set(0, 0.03, -2.2);

    // Boardwalk running from the bank out to the grab point, around the veg.
    const boardwalk = group(g, 0.7, 0.06, 0.6, -0.3);
    for (let i = 0; i < 7; i++) box(boardwalk, 0.5, 0.03, 0.34, 0, 0, -i * 0.36, 0x6a5638, { rough: 0.85 });

    // ------------------------------------------------------------- eelgrass
    function grassClump(parent, x, z, color, n = 6, h0 = 0.3) {
      const cg = group(parent, x, 0.05, z, Math.random() * Math.PI);
      for (let i = 0; i < n; i++) {
        const a = (i / n) * Math.PI * 2 + Math.random() * 0.5;
        const r = 0.03 + Math.random() * 0.05;
        const bh = h0 * (0.75 + Math.random() * 0.5);
        cyl(cg, 0.006, 0.012, bh, Math.cos(a) * r, bh / 2, Math.sin(a) * r, color, { rough: 0.9, seg: 5 });
      }
      return cg;
    }
    const eelgrassField = group(g, -1.6, 0, -1.0);
    for (let i = 0; i < 10; i++) grassClump(eelgrassField, (Math.random() - 0.5) * 1.2, (Math.random() - 0.5) * 0.9, 0x2f6a55, 5, 0.22);
    const eelgrassHit = box(g, 1.3, 0.3, 1.0, -1.6, 0.2, -1.0, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "cut through the eelgrass?", -1.6, 0.5, -1.0, { css: "#d2312b", w: 0.44 });
    reg(hits, eelgrassHit, "walk-eelgrass");

    // ------------------------------------------------------------ cordgrass
    const cordgrassField = group(g, 1.8, 0, 1.2);
    for (let i = 0; i < 9; i++) grassClump(cordgrassField, (Math.random() - 0.5) * 1.1, (Math.random() - 0.5) * 0.8, 0x6f8a3f, 6, 0.32);
    const nest = group(g, 1.8, 0.05, 1.2);
    for (let i = 0; i < 3; i++) ball(nest, 0.02, -0.04 + i * 0.04, 0.03, 0.02, 0xd8cfa8, { rough: 0.7 });
    const cordgrassHit = box(g, 1.2, 0.3, 0.9, 1.8, 0.2, 1.2, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "push through the cordgrass?", 1.8, 0.5, 1.2, { css: "#d2312b", w: 0.46 });
    reg(hits, cordgrassHit, "walk-cordgrass");

    // ----------------------------------------------------------- tide gauge
    const tidePost = group(g, -2.1, 0.06, -1.6);
    cyl(tidePost, 0.02, 0.024, 1.0, 0, 0.5, 0, CITY.steel, { rough: 0.5, metal: 0.6, seg: 8 });
    const tideInst = instrument(tidePost, 0, 1.02, 0, { idle: "-- ft", color: SSG_ACCENT, w: 0.13, d: 0.2 });
    holoTag(tidePost, "tide gauge", 0, 1.25, 0, { css: "#5a9fc9", w: 0.3 });
    reg(hits, tideInst, "tide-gauge");

    const tideBoard = holoPanel(g, 0.9, 0.58, -2.1, 1.55, -1.0, (cx, w, h) => {
      cx.fillStyle = "#0d1c24"; cx.fillRect(0, 0, w, h); cx.fillStyle = "#5a9fc9"; cx.fillRect(0, 0, w, 6);
      cx.font = `600 ${Math.round(h * 0.1)}px 'Barlow Condensed', Arial, sans-serif`; cx.textAlign = "left"; cx.textBaseline = "middle";
      cx.fillStyle = "#dcefef"; cx.fillText("TIDE WINDOW — NOAA PREDICTION", w * 0.06, h * 0.14);
      cx.font = `${Math.round(h * 0.08)}px Arial, sans-serif`; cx.fillStyle = "#cfe7ea";
      ["Low water: 0.6 ft, working window ~2 h", "Grab point exposed only near low", "Transect on the boardwalk, veg off-limits", "Watch the gauge — the table is a forecast"].forEach((l, i) => cx.fillText(l, w * 0.06, h * (0.32 + i * 0.13)));
    }, { ry: 0.3, accent: SSG_ACCENT });
    reg(hits, tideBoard, "tide-board");

    // --------------------------------------------------------------- gear
    const gearBench = group(g, -1.6, 0.14, 1.8, 0.3);
    box(gearBench, 0.7, 0.5, 0.35, 0, 0.25, 0, 0x8a7d63, { rough: 0.75 });
    const waders = box(gearBench, 0.16, 0.05, 0.12, -0.2, 0.52, 0, 0x3a4a3f, { rough: 0.8 });
    holoTag(gearBench, "chest waders", -0.2, 0.65, 0, { css: "#5a9fc9", w: 0.28 });
    reg(hits, waders, "waders");
    const gloves = box(gearBench, 0.14, 0.03, 0.1, 0, 0.52, 0, 0x4a7fd8, { rough: 0.8 });
    holoTag(gearBench, "nitrile gloves", 0, 0.65, 0, { css: "#5a9fc9", w: 0.28 });
    reg(hits, gloves, "nitrile-gloves");
    const buddy = standingFigure(g, -1.4, 2.4, { ry: 1.5, cloth: 0x37505f, vest: 0xf2c14b });
    holoTag(buddy, "second monitor", 0, 1.9, 0, { css: "#5a9fc9", w: 0.32 });
    reg(hits, buddy, "buddy-present");

    // --------------------------------------------------------- grab point
    const grabPointSocket = group(g, 0.7, 0.06, -0.9);
    hits["grab-point-socket"] = grabPointSocket;
    const flagHome = new THREE.Vector3(0.7, 0.06, 2.1);
    const transectFlag = group(g, flagHome.x, flagHome.y, flagHome.z);
    cyl(transectFlag, 0.01, 0.012, 0.4, 0, 0.2, 0, 0x8a7a54, { rough: 0.8, seg: 8 });
    box(transectFlag, 0.1, 0.07, 0.006, 0.05, 0.38, 0, 0xe8622a, { rough: 0.6 });
    reg(hits, transectFlag, "transect-flag");

    // ----------------------------------------------------- observations bench
    const obsBoard = group(g, 0.7, 0.06, -0.6, -0.3);
    const obsSpots = [["obs-color", -0.15, 0xd88a4a, "COLOUR"], ["obs-odor", 0, 0x8a939b, "ODOUR"], ["obs-sheen", 0.15, 0xa07fd8, "SHEEN"]];
    for (const [id, dx, color, label] of obsSpots) {
      const it = group(obsBoard, dx, 0.02, -0.2);
      ball(it, 0.03, 0, 0.02, 0, color, { rough: 0.7, seg: 10 });
      holoTag(it, label, 0, 0.14, 0, { css: "#5a9fc9", w: 0.24 });
      reg(hits, it, id);
    }

    // ----------------------------------------------------------- sampler
    const sampler = group(g, 0.7, 0.1, -0.9, 0.2);
    cyl(sampler, 0.02, 0.024, 0.6, 0, 0.3, 0, CITY.steel, { rough: 0.4, metal: 0.65, seg: 10 });
    const jawTop = box(sampler, 0.16, 0.02, 0.16, 0, 0.03, 0, 0x8a939b, { rough: 0.5, metal: 0.5 });
    holoTag(sampler, "grab sampler", 0, 0.65, 0, { css: "#5a9fc9", w: 0.3 });
    reg(hits, sampler, "grab-sampler");
    void jawTop;

    const scoopDeepHit = box(g, 0.3, 0.2, 0.3, 0.7, -0.15, -0.9, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "drive it in deep?", 0.7, 0.05, -0.9, { css: "#d2312b", w: 0.36 });
    reg(hits, scoopDeepHit, "scoop-too-deep");

    // ------------------------------------------------------------ jar bench
    const jarBench = group(g, 1.1, 0.24, 0.4);
    box(jarBench, 0.7, 0.4, 0.4, 0, 0.2, 0, 0x8a7d63, { rough: 0.75 });
    const jarGrp = group(jarBench, -0.1, 0.42, 0);
    const jar = cyl(jarGrp, 0.045, 0.045, 0.13, 0, 0.065, 0, 0xf0ede2, { rough: 0.3, opacity: 0.85, transparent: true, seg: 14 });
    const jarLid = cyl(jarGrp, 0.047, 0.047, 0.02, 0, 0.14, 0, 0x5a9fc9, { rough: 0.5, metal: 0.3, seg: 14 });
    holoTag(jarGrp, "grab jar", 0, 0.24, 0, { css: "#5a9fc9", w: 0.24 });
    reg(hits, jarGrp, "grab-jar");
    void jarLid;
    const phMeter = instrument(jarBench, 0.15, 0.42, 0, { idle: "-.-- pH", color: SSG_ACCENT, w: 0.12, d: 0.18 });
    holoTag(jarBench, "field pH meter", 0.15, 0.56, 0, { css: "#5a9fc9", w: 0.28 });
    reg(hits, phMeter, "ph-meter");

    const gpsPost = group(g, -1.9, 0.06, -0.9);
    cyl(gpsPost, 0.018, 0.02, 0.55, 0, 0.28, 0, CITY.steel, { rough: 0.5, metal: 0.6, seg: 8 });
    const gpsInst = instrument(gpsPost, 0, 0.58, 0, { idle: "-- m", color: SSG_ACCENT, w: 0.12, d: 0.18 });
    holoTag(gpsPost, "handheld GPS", 0, 0.8, 0, { css: "#5a9fc9", w: 0.3 });
    reg(hits, gpsInst, "gps-unit");

    const sunSpotHit = box(g, 0.4, 0.2, 0.3, 1.1, 0.4, 0.75, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "set it in the sun?", 1.1, 0.65, 0.75, { css: "#d2312b", w: 0.4 });
    reg(hits, sunSpotHit, "jar-in-sun");

    // -------------------------------------------------------------- cooler
    const cooler = group(g, 1.7, 0.24, 1.1, -0.2);
    box(cooler, 0.55, 0.35, 0.38, 0, 0.19, 0, 0xdfe6ec, { rough: 0.65 });
    const coolerLid = box(cooler, 0.57, 0.05, 0.4, 0, 0.4, 0, SSG_ACCENT, { rough: 0.6 });
    decal(cooler, 0.3, 0.08, 0, 0.19, 0.191, signFace("4°C · ON ICE", { bg: "#0d1c24", accent: "#dcefef", scale: 0.42 }));
    reg(hits, cooler, "cooler");

    // -------------------------------------------------------------- custody
    const cocBoard = group(jarBench, 0.05, 0.42, 0.18, -0.3);
    box(cocBoard, 0.18, 0.006, 0.22, 0, 0, 0, 0xf3efe4, { rough: 0.9 });
    decal(cocBoard, 0.16, 0.2, 0, 0.005, 0, paperFace("CHAIN OF CUSTODY", ["Grab point + tide state", "Time / sampler", "Sign: relinquished / received"], { scale: 0.85 })).rotation.x = -Math.PI / 2;
    reg(hits, cocBoard, "coc-board");

    const fieldSheetClip = group(gearBench, 0.28, 0.52, 0);
    box(fieldSheetClip, 0.16, 0.006, 0.2, 0, 0, 0, 0xecebe0, { rough: 0.9 });
    decal(fieldSheetClip, 0.14, 0.18, 0, 0.005, 0, paperFace("FIELD SHEET", ["Tide state + transect", "Wildlife noted", "Anything out of place"], { scale: 0.85 })).rotation.x = -Math.PI / 2;
    reg(hits, fieldSheetClip, "field-sheet");

    // ----------------------------------------------------------- walk-out
    const bootPrint = group(g, -1.0, 0.045, -0.55);
    box(bootPrint, 0.1, 0.006, 0.2, 0, 0, 0, 0x2c2f2a, { rough: 0.95 });
    reg(hits, bootPrint, "boot-print-eelgrass");

    cone(g, 2.4, 2.4); cone(g, -2.4, 2.4);
    barrierPanel(g, 0, 2.5, { color: SSG_ACCENT });
    toolChest(g, 2.1, 1.8, { color: SSG_ACCENT });

    return {
      hits,
      spawnLook: new THREE.Vector3(0.4, 1.0, 0.9),
      onStep() {},
      onStepComplete(step) {
        if (step.id === "grab") jar.material = mat(0x4a3d28, { rough: 0.9, opacity: 0.9, transparent: true });
        if (step.id === "field-ph") repaint(phMeter.userData.screen, signFace("7.1 pH", { bg: "#0d1c24", accent: "#59c97b", fg: "#bfeaf7", scale: 0.6 }));
        if (step.id === "ice-jar") { jarGrp.parent.remove(jarGrp); cooler.add(jarGrp); jarGrp.position.set(0, 0.3, 0); jarLid.position.y = 0.14; }
        if (step.id === "walk-out") bootPrint.visible = false;
      },
      onHazard() {},
      onInterrupt(it) {
        if (it.id === "tide-turns-early") { water.position.z += 0.15; repaint(tideInst.userData.screen, signFace("RISING", { bg: "#2a0d0d", accent: "#f0645b", fg: "#ffd9d9", scale: 0.5 })); }
        if (it.id === "rail-calls-move-transect") { const flagCloth = transectFlag.children[1]; if (flagCloth) flagCloth.material = mat(0xf0645b, { emissive: 0xf0645b, ei: 1.4, rough: 0.6 }); }
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "tide-turns-early") { water.position.z -= 0.15; repaint(tideInst.userData.screen, signFace("-- ft", { bg: "#0d1c24", accent: "#bfeaf7", fg: "#bfeaf7", scale: 0.5 })); }
        if (it.id === "rail-calls-move-transect") { transectFlag.position.set(1.1, 0.06, -0.5); const flagCloth = transectFlag.children[1]; if (flagCloth) flagCloth.material = mat(0xe8622a, { rough: 0.6 }); }
      },
      animate(t, dt, session) {
        wave.visible = true;
        wave.userData.step(dt, new THREE.Vector3(0, 0.03, -2.4), 1.2, 0.3, -0.15);
        water.position.y = 0.015 + Math.sin(t * 1.2) * 0.006;
        const step = session?.step;
        if (step?.id === "grab" && session.holding) sampler.rotation.x = -0.15 + Math.sin(t * 3) * 0.02;
        const gg = session?.gauge;
        if (gg && !gg.committed && step?.id === "position-check") {
          repaint(gpsInst.userData.screen, signFace(`Δ ${(0.4 - gg.t * 0.38).toFixed(2)} m`, { bg: "#0d1c24", accent: gg.t >= 0.44 && gg.t <= 0.6 ? "#59c97b" : "#f2ae14", fg: "#bfeaf7", scale: 0.55 }));
        }
        if (gg && !gg.committed && step?.id === "field-ph") {
          repaint(phMeter.userData.screen, signFace(`${(6 + gg.t * 3).toFixed(2)} pH`, { bg: "#0d1c24", accent: gg.t >= 0.42 && gg.t <= 0.6 ? "#59c97b" : "#f2ae14", fg: "#bfeaf7", scale: 0.6 }));
        }
      },
    };
  },
};
