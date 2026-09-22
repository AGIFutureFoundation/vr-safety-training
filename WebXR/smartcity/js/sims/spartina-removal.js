import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, ball, torus, group, decal, repaint, signFace, paperFace, particles, mat,
} from "../../../shared/kit.js";
import {
  CITY, stationPad, holoPanel, holoTag, toolChest, instrument, cone, barrierPanel,
  standingFigure, valveWheel, reg, surfaceTexture, texturedMat, mudflatFace,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Spartina Removal VR — Water & Environmental, station one hundred.
//
// Invasive hybrid Spartina (cordgrass) control in a generic restored tidal
// marsh — not any one marsh, and no claim about any one restoration site's
// history. The hybrid looks enough like the native cordgrass it crowds out
// that the treatment map, not the eye, decides which clumps get sprayed, and
// the same marsh that makes the invasion possible is also nesting habitat
// for the endangered Ridgway's rail, so the boundary that matters most on
// this job is not the treatment area — it is the buffer nobody sprays inside
// no matter how good the drift discipline is everywhere else. Imazapyr does
// not know a hybrid clump from a native one either; the label rate, the
// wind limit and the drift card are what keep it on the clumps the map
// actually calls out.

const SPT_ACCENT = 0xc9a227;
const SPT_FLAG = 0xe8622a;

export const SIM_SPARTINA_REMOVAL = {
  id: "spartina-removal",
  index: "100",
  domain: "Environmental",
  trade: "Invasive species control laborer — Spartina crew",
  category: "Water & Environmental",
  // Marsh work is filed with the water trades and stood in front of the bay,
  // the way living-shoreline.js stands its own reach in the same district.
  district: "Environmental Monitoring",
  weather: "wind",
  certification: "LIUNA laborers — control crew; California Department of Pesticide Regulation (DPR) qualified applicator license for imazapyr, an EPA-registered aquatic herbicide; OSHA 29 CFR 1910.1200 Hazard Communication for the concentrate's SDS and label; Invasive Spartina Project treatment protocol and reporting; U.S. Fish and Wildlife Service — Endangered Species Act, Ridgway's rail buffer; San Francisco Bay Regional Water Quality Control Board Clean Water Act (CWA) NPDES aquatic pesticide permit; San Francisco Bay Conservation and Development Commission (BCDC) permit",
  name: "Spartina Removal",
  title: simTitle("Spartina Removal"),
  tagline: "Invasive hybrid cordgrass control on a restored marsh: treatment map and tide window read, boundary and rail buffer set out, imazapyr mixed off the marsh to the label rate, sprayer calibrated, applied under the wind limit with the drift card checked, clumps flagged for follow-up, containers triple-rinsed, and the treatment logged",
  accent: SPT_ACCENT,
  accentCss: "#c9a227",
  parSeconds: 300,
  footprint: 2.6,
  badge: { id: "buffer-held", name: "Buffer Held", note: "Every clump on the map treated at the label rate, the rail's buffer never crossed — first time" },

  game: system({
    name: "Spartina Crew",
    currency: "CLUMP",
    ranks: ["Laborer", "Crew Hand", "Lead Applicator", "Crew Steward", "Spartina Certified"],
    badges: [
      { id: "map-true", name: "Map True", note: "Boundary and buffer both set out clean before the first clump was sprayed", test: AWARD.stepClean("set-boundary") },
      { id: "buffer-clean", name: "Buffer Clean", note: "Never a hazard, never a drop past the rail's buffer", test: AWARD.safe },
      { id: "rate-true", name: "Rate True", note: "Mixing ratio and drift card both read inside the working band", test: AWARD.precise(0.7) },
    ],
    challenges: [
      { id: "clean-treatment", name: "Clean Treatment", note: "No corrections across the whole treatment", test: AWARD.clean },
      { id: "sweep-held", name: "Sweep Held Steady", note: "Held the sprayer sweep the whole application", test: AWARD.unbroken },
      { id: "marsh-cleared", name: "Marsh Cleared Fast", note: "Treatment closed out inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "mix-in-marsh": "You mixed the imazapyr at the marsh edge instead of carrying it back to the pad. The Regional Water Board's aquatic pesticide NPDES permit exists precisely to keep a concentrate spill out of the water it is meant to protect, and a mixing jug tipped at the edge of tidal mud is a spill with nowhere else to go but into the marsh on the next tide.",
    "skip-buffer": "You swept the sprayer past the buffer stake toward the nest. Ridgway's rail is listed under the Endangered Species Act for exactly this reason — a bird that nests low in dense cordgrass and cannot get up and fly off before a hand or a spray pattern is already on top of it — and the buffer is not a suggestion the label rate can make up for once it is crossed.",
    "override-wind": "You kept spraying after the anemometer was already reading over the label's wind limit. Above that limit imazapyr does not land on the clump it was aimed at — it drifts onto whatever native cordgrass, pickleweed or open water happens to be downwind, and a permit written around a drift card is written around exactly this failure.",
    "dump-rinse": "You tipped the rinse water out onto the marsh mud instead of pouring it back into the sprayer tank. The label's triple-rinse instruction is not satisfied by rinsing — it is satisfied by putting that rinsate back through the system as more dilute product, and dumped on the ground it is a fourth, unpermitted application nobody logged.",
  },

  lateNotes: {
    "regulator-wheel": "The sprayer is calibrated after the mix is at the fill point — calibrating an empty sprayer proves the regulator turns, not that the rate matches the label.",
    "sweep-rate": "The sweep starts only after the sprayer is calibrated and the wind has been read once already at the boundary.",
    "wind-reading": "Wind is read continuously through the application, not only once at the start — the label limit does not care what the wind was ten minutes ago.",
  },

  steps: [
    {
      id: "read-map", kind: "select", target: "treatment-map",
      title: "Read the treatment map and the tide window",
      cue: "Check which clumps on the map are marked for treatment and how much working time the tide window gives on the bench.",
      why: "The hybrid looks enough like the native cordgrass it is crowding out that the map, not the eye, is what tells the crew which clumps are actually the target — and the tide window is what turns that map into a plan for one afternoon instead of a race against water coming back over the bench.",
    },
    {
      id: "set-boundary", kind: "sequence", anyOrder: true,
      targets: ["boundary-nw", "boundary-se", "buffer-1", "buffer-2"],
      itemNames: { "boundary-nw": "boundary flag — near corner", "boundary-se": "boundary flag — far corner", "buffer-1": "rail buffer stake — north", "buffer-2": "rail buffer stake — south" },
      title: "Set out the treatment boundary and the rail's buffer",
      cue: "Place both boundary flags around the treatment area, then both buffer stakes around the Ridgway's rail nest.",
      why: "The boundary says where the map's clumps actually are on the ground; the buffer around the nest says where nobody sprays regardless of what the map calls out inside it. Set out before a nozzle is even loaded, both lines are a decision made once, in the clear, instead of a judgement call made mid-sweep with the sprayer already running.",
    },
    {
      id: "stage-ppe", kind: "sequence", anyOrder: true,
      targets: ["stage-gloves", "stage-respirator", "stage-coveralls"],
      itemNames: { "stage-gloves": "chemical-resistant gloves", "stage-respirator": "respirator", "stage-coveralls": "coveralls" },
      title: "Stage the applicator's PPE",
      cue: "Gloves, respirator and coveralls before the concentrate is opened.",
      why: "Imazapyr's own label is what sets this PPE list, not house habit — the gloves and coveralls are for the concentrate at full strength during mixing, and the respirator is for the mixing step itself, where the product is furthest from being diluted and closest to being breathed.",
    },
    {
      id: "license-check", kind: "select", target: "dpr-license",
      title: "Check the applicator's DPR license",
      cue: "Confirm the qualified applicator license covers this herbicide and this use site before the jug is opened.",
      why: "California's Department of Pesticide Regulation licenses the applicator, not just the product — a valid label in the wrong hands is still an unlicensed application, and the license is what a Water Board or a USFWS inspector asks for first if anything downstream of this marsh ever needs explaining.",
    },
    {
      id: "mix-herbicide", kind: "gauge", target: "mix-jug",
      title: "Mix the imazapyr to the label rate",
      cue: "Read the mixing ratio on the pad and commit it inside the label's rate band.",
      why: "The label rate is not a suggestion with room either side of it — under-mixed, the hybrid re-sprouts from the root and the whole clump is sprayed again next season; over-mixed, it is an off-label application on a permit written around this exact number.",
      gauge: { label: "MIX RATIO", speed: 0.68, green: [0.42, 0.6], readout: (t) => `${(t * 5).toFixed(1)} oz/gal`, missNote: "Outside the label's rate band. Read the ratio again and commit inside the marked range before the jug leaves the pad." },
    },
    {
      id: "carry-mix", kind: "drag", target: "mixed-jug",
      title: "Carry the mixed jug to the sprayer fill point",
      cue: "Walk the mixed jug from the pad to the fill point at the marsh edge — the mixing itself stays off the marsh.",
      why: "Mixing happens on the pad specifically so a spilled jug lands on pavement built to hold it, not on tidal mud with nowhere for a spill to go but into the water on the next tide. Carrying the finished mix to the fill point keeps that boundary real instead of a rule only followed on paper.",
      drag: { to: "sprayer-fill", radius: 0.5, missNote: "Not at the fill point yet — the mix has to reach the sprayer before it can be loaded." },
    },
    {
      id: "calibrate", kind: "turn", target: "regulator-wheel",
      title: "Calibrate the backpack sprayer",
      cue: "Wind the pressure regulator to the calibration mark before the mix goes on a single clump.",
      why: "A sprayer calibrated to the label's output rate puts the mixed concentration on the plant the way the label's own field trials were run; an uncalibrated one turns a correctly mixed jug into an application nobody can vouch for, running hot or thin regardless of what the ratio read on the pad.",
      turn: { turns: 1, axis: "y", label: "REGULATOR" },
    },
    {
      id: "apply-treatment", kind: "track", target: "sweep-rate", seconds: 7,
      title: "Apply the treatment along the marked clumps",
      cue: "Walk the boundary line at a steady sweep, keeping the nozzle on the flagged clumps only.",
      why: "A steady sweep at the label's walking pace puts a measured dose on each clump; too fast and the hybrid gets a sub-label dose that lets it re-sprout, too slow and one clump gets soaked while the label rate is calculated for the whole line, not one plant.",
      track: { start: 0.1, green: [0.36, 0.56], rise: 0.55, fall: 0.45, drift: 0.12, label: "SWEEP", readout: (v) => (v < 0.36 ? "lingering — off the rate" : v > 0.56 ? "too fast to dose evenly" : "steady sweep") },
      holdBreakNote: "The sweep broke off the rate — bring it back to a steady pace along the marked line.",
    },
    {
      id: "drift-check", kind: "gauge", target: "drift-card",
      title: "Check the drift card",
      cue: "Read the drift card set downwind of the sweep and commit it against the acceptable catch.",
      why: "The drift card is the only direct evidence of where the spray actually went, as opposed to where it was aimed — a card reading heavy downwind means the label's wind limit was already being exceeded even if the anemometer had not caught up to it yet.",
      gauge: { label: "DRIFT CATCH", speed: 0.72, green: [0.1, 0.3], readout: (t) => `${Math.round(t * 100)} droplets`, missNote: "Too much catch downwind — the sweep is drifting past the target clumps. Stop and reread before another pass." },
    },
    {
      id: "wind-monitor", kind: "track", target: "wind-reading", seconds: 6,
      title: "Monitor the wind through the rest of the application",
      cue: "Keep the anemometer reading below the label's wind limit for the rest of the sweep.",
      why: "The label's wind limit is not checked once and forgotten — a marsh's wind builds through an afternoon the way its tide does, and the sweep that was compliant at the first clump can be drifting by the last one if nobody is still watching the reading.",
      track: { start: 0.15, green: [0.0, 0.4], rise: 0.5, fall: 0.5, drift: 0.16, label: "WIND", readout: (v) => (v > 0.4 ? "over the label limit — stop" : "within the label limit") },
      holdBreakNote: "The reading crept over the label limit — bring the sweep to a stop and let it settle before continuing.",
    },
    {
      id: "flag-clumps", kind: "sequence", anyOrder: true,
      targets: ["flag-1", "flag-2", "flag-3"],
      itemNames: { "flag-1": "treated clump — flag 1", "flag-2": "treated clump — flag 2", "flag-3": "treated clump — flag 3" },
      title: "Flag the treated clumps for follow-up",
      cue: "Flag every clump the sprayer actually touched, so the follow-up survey knows what to check.",
      why: "Imazapyr takes weeks to show on a hybrid clump, so the only record of what was actually treated today — as opposed to what the map said should be — is the flag left on it now. A follow-up survey without flags is a survey guessing which brown clumps are dead cordgrass and which never got sprayed at all.",
    },
    {
      id: "triple-rinse", kind: "hold", target: "rinse-container", seconds: 5,
      title: "Triple-rinse the empty containers",
      cue: "Hold the empty jug under the rinse water through all three fill-and-drain cycles, pouring each rinse back into the sprayer tank.",
      why: "A triple rinse run to completion, with the rinsate poured back into the tank as more product, is what the label counts as an empty container — cut short, the jug still carries a working dose of concentrate into whatever it goes into next.",
      holdBreakNote: "Let go before all three rinse cycles finished — that container still has product in it. Reset and hold through the full rinse.",
    },
    {
      id: "log-treatment", kind: "select", target: "treatment-log",
      title: "Log the treatment",
      cue: "Record the clumps treated, the rate, the wind readings and the applicator's license number for the Invasive Spartina Project.",
      why: "The Invasive Spartina Project's regional treatment record is what keeps one crew's work from being repeated or missed by the next — a marsh treated but never logged looks, from the next season's map, exactly like a marsh nobody has gotten to yet.",
    },
    {
      id: "walk", kind: "find", noHint: true,
      targets: ["unflagged-clump", "drift-card-left"],
      itemNames: { "unflagged-clump": "the treated clump with no flag", "drift-card-left": "the drift card left in the marsh" },
      itemNotes: {
        "unflagged-clump": "This clump shows the same wet sheen as the others the sprayer passed over, but nobody flagged it. Left this way, the follow-up survey will read it as untreated and spray it again next season.",
        "drift-card-left": "A drift card is still pinned downwind of the line. Left out, it is one more piece of gear the next high tide takes off the bench, and one less record of how today's wind actually behaved.",
      },
      title: "Walk the treatment line before leaving the marsh",
      cue: "Check the flagged clumps and the drift line once more, and click anything left the way it should not be.",
      why: "The crew's last look at this bench is now — the tide window that got everyone out here is also what closes it, and anything left wrong after the walk is something the marsh keeps until the water goes back out again.",
    },
  ],

  interrupts: [
    {
      id: "rail-calling",
      kind: "Ridgway's rail calling from the buffer",
      after: "apply-treatment", delay: 3, seconds: 12,
      alert: "A Ridgway's rail is calling from inside the buffer around the nest — close enough that the sweep already has the nozzle pointed toward it.",
      cue: "Stop the sprayer now. Nothing gets treated inside that buffer while a bird is calling from it.",
      target: "sprayer-shutoff",
      why: "The buffer exists so that a rail on or near its nest is never in the path of a spray pattern, and a calling bird is proof the buffer is doing exactly the job it was set out for — the sweep stops the instant that call is heard, not once someone finishes the pass they were already on.",
      missNote: "The sweep kept moving past the call, and the nozzle crossed into ground inside the buffer before anyone shut it off. A federally listed species startled off a nest by a spray pattern is not a near miss the Endangered Species Act treats as harmless just because nothing visibly landed on it.",
      wrongNote: "It's the sprayer shutoff. Nothing else on this line stops the nozzle before it reaches the buffer.",
    },
    {
      id: "wind-freshening",
      kind: "Wind freshening above the label limit",
      after: "wind-monitor", delay: 3, seconds: 12,
      alert: "The wind has freshened off the bay and the anemometer is already reading past the label's limit, faster than the crew adjusted for.",
      cue: "The windsock just stood straight out. Shut the sprayer down before another pass goes out in it.",
      target: "sprayer-shutoff",
      why: "Imazapyr's aquatic label sets its wind limit because drift off a marsh does not stay on the marsh — it moves onto native vegetation and open water the same wind is already carrying it toward, and a limit that is only honoured when it is convenient is not a limit at all.",
      missNote: "The sweep kept going through the gust and the drift went with it, off the flagged clumps and out over open water the permit's own limit was written to keep it away from.",
      wrongNote: "It's the sprayer shutoff. Nothing else on this line stops the nozzle before the next pass goes out in the gust.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.6, SPT_ACCENT);

    // ---------------------------------------------------------------- terrain
    // Upland pad (off the marsh, where mixing and PPE happen) toward +z, a
    // tidal marsh bench toward -z — everything at or above y=0 so it reads
    // above the shared plaza disc rather than sinking into it.
    const upland = box(g, 5.4, 0.24, 1.7, 0, 0.12, 1.55, 0x5a4f3a, { rough: 0.94 });
    void upland;
    const padTex = surfaceTexture((cx, w, h) => {
      cx.fillStyle = "#4a4a4c"; cx.fillRect(0, 0, w, h);
      for (let i = 0; i < 900; i++) {
        const v = Math.random();
        cx.fillStyle = `rgba(${v > 0.5 ? "90,90,92" : "40,40,42"},${(0.05 + v * 0.08).toFixed(3)})`;
        cx.fillRect(Math.random() * w, Math.random() * h, 2 + Math.random() * 5, 1 + Math.random() * 2);
      }
    }, { repeat: 3, px: 256 });
    const pad = box(g, 5.4, 0.02, 1.7, 0, 0.251, 1.55, 0x4a4a4c, { rough: 0.9, cast: false });
    pad.material = texturedMat(padTex, { rough: 0.9, color: 0x8f8f92 });

    const slope = box(g, 5.4, 0.3, 0.5, 0, 0.1, 0.62, 0x453a28, { rough: 0.96 });
    slope.rotation.x = 0.3;

    const mudTex = surfaceTexture((cx, w, h) => mudflatFace(cx, w, h, { base: "#3f4a34", base2: "#333c2a", cracks: 40, pools: 4 }), { repeat: 3, px: 256 });
    const marsh = box(g, 5.4, 0.1, 3.1, 0, 0.04, -1.45, 0x3f4a34, { rough: 0.95, cast: false });
    marsh.material = texturedMat(mudTex, { rough: 0.95, color: 0x8a9a6a });

    const waterTex = surfaceTexture((cx, w, h) => {
      cx.fillStyle = "#123a3e"; cx.fillRect(0, 0, w, h);
      for (let i = 0; i < 24; i++) {
        cx.strokeStyle = "rgba(170,215,220,0.10)"; cx.lineWidth = 1 + Math.random() * 2;
        cx.beginPath(); const y = Math.random() * h;
        cx.moveTo(0, y); cx.bezierCurveTo(w * 0.25, y + 14, w * 0.75, y - 14, w, y); cx.stroke();
      }
    }, { repeat: 3, px: 256 });
    const water = box(g, 5.4, 0.03, 0.9, 0, 0.012, -3.35, 0x123a3e, { rough: 0.2, metal: 0.28, opacity: 0.88, transparent: true, cast: false });
    water.material = texturedMat(waterTex, { rough: 0.2, metal: 0.25, color: 0x235a5e });
    water.material.transparent = true;
    water.material.opacity = 0.88;
    const wave = particles(g, 20, 0xbfe6d2, { size: 0.028, life: 0.8, additive: false, opacity: 0.35 });
    wave.position.set(0, 0.03, -3.35);

    // -------------------------------------------------------------- cordgrass
    // Small clumps of thin, leaning blades — the terrain a Spartina crew
    // actually works, rather than a bare mudflat.
    function clump(parent, x, z, o = {}) {
      const cg = group(parent, x, o.y ?? 0.06, z, Math.random() * Math.PI);
      const n = o.n ?? 5, h0 = o.h ?? 0.34, col = o.color ?? 0x6f8a3f;
      for (let i = 0; i < n; i++) {
        const a = (i / n) * Math.PI * 2 + Math.random() * 0.6;
        const r = 0.03 + Math.random() * 0.06;
        const bh = h0 * (0.75 + Math.random() * 0.5);
        const blade = cyl(cg, 0.006, 0.014, bh, Math.cos(a) * r, bh / 2, Math.sin(a) * r, col, { rough: 0.9, seg: 5 });
        blade.rotation.x = (Math.random() - 0.5) * 0.35;
        blade.rotation.z = (Math.random() - 0.5) * 0.35;
      }
      return cg;
    }
    const clumpField = group(g, 0, 0, 0);
    for (let i = 0; i < 13; i++) {
      const x = (Math.random() - 0.5) * 4.6;
      const z = -0.5 - Math.random() * 2.4;
      if (Math.hypot(x - 0.9, z + 1.7) < 0.55) continue; // keep the nest clearing open
      clump(clumpField, x, z, { color: i % 3 === 0 ? 0x7a8a48 : 0x5f7a3a });
    }

    // -------------------------------------------------------------- rail nest
    // A low, woven clearing inside the buffer — never targeted directly, just
    // the reason the buffer stakes are where they are.
    const nest = group(g, 0.9, 0.05, -1.7);
    torus(nest, 0.16, 0.03, 0, 0.03, 0, 0x6a5636, { rough: 0.95, seg: 8, seg2: 16 }).rotation.x = Math.PI / 2;
    for (let i = 0; i < 3; i++) ball(nest, 0.028, -0.05 + i * 0.05, 0.05, 0.02, 0xd8cfa8, { rough: 0.7 });
    clump(g, 0.7, -1.55, { n: 6, color: 0x5f7a3a });
    clump(g, 1.15, -1.85, { n: 6, color: 0x5f7a3a });

    // ---------------------------------------------------- boundary & buffer
    function flagPost(parent, x, z, label, color) {
      const fp = group(parent, x, 0.05, z);
      cyl(fp, 0.012, 0.014, 0.4, 0, 0.2, 0, 0xc9b58c, { rough: 0.9, seg: 6 });
      const flag = box(fp, 0.09, 0.06, 0.006, 0.045, 0.36, 0, color, { rough: 0.7 });
      if (label) holoTag(fp, label, 0, 0.55, 0, { css: "#c9a227", w: 0.4 });
      return fp;
    }
    const boundaryNW = flagPost(g, -1.7, -0.9, "boundary flag", 0xdff0d8);
    reg(hits, boundaryNW, "boundary-nw");
    const boundarySE = flagPost(g, 1.7, -2.7, "boundary flag", 0xdff0d8);
    reg(hits, boundarySE, "boundary-se");
    const bufferStake1 = flagPost(g, 0.35, -1.35, "rail buffer stake", SPT_FLAG);
    reg(hits, bufferStake1, "buffer-1");
    const bufferStake2 = flagPost(g, 1.5, -2.05, "rail buffer stake", SPT_FLAG);
    reg(hits, bufferStake2, "buffer-2");
    const skipBufferHit = box(g, 0.35, 0.3, 0.35, 0.9, 0.2, -1.7, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "sweep past the buffer?", 0.9, 0.5, -1.7, { css: "#e8622a", w: 0.42 });
    reg(hits, skipBufferHit, "skip-buffer");

    // -------------------------------------------------------------- upland
    const mapBoard = holoPanel(g, 0.92, 0.6, -1.85, 1.15, 1.8, (cx, w, h) => {
      cx.fillStyle = "#1c1608"; cx.fillRect(0, 0, w, h); cx.fillStyle = "#c9a227"; cx.fillRect(0, 0, w, 6);
      cx.font = `600 ${Math.round(h * 0.1)}px 'Barlow Condensed', Arial, sans-serif`; cx.textAlign = "left"; cx.textBaseline = "middle";
      cx.fillStyle = "#f5ecd0"; cx.fillText("TREATMENT MAP — REACH 5", w * 0.06, h * 0.13);
      cx.font = `${Math.round(h * 0.075)}px Arial, sans-serif`; cx.fillStyle = "#efe3bf";
      ["Hybrid clumps: 11 marked for treatment", "Rail nest — buffer 25m, no spray", "Low tide: 0912 · working window 4 h", "Wind limit per label: below 10 mph", "Herbicide: imazapyr, aquatic label"].forEach((l, i) => cx.fillText(l, w * 0.06, h * (0.3 + i * 0.11)));
    }, { ry: 0.5, accent: SPT_ACCENT });
    reg(hits, mapBoard, "treatment-map");

    const licenseBoard = holoPanel(g, 0.86, 0.56, 1.9, 1.12, 1.8, (cx, w, h) => {
      cx.fillStyle = "#1c1608"; cx.fillRect(0, 0, w, h); cx.fillStyle = "#c9a227"; cx.fillRect(0, 0, w, 6);
      cx.font = `600 ${Math.round(h * 0.1)}px 'Barlow Condensed', Arial, sans-serif`; cx.textAlign = "left"; cx.textBaseline = "middle";
      cx.fillStyle = "#f5ecd0"; cx.fillText("DPR QUALIFIED APPLICATOR", w * 0.06, h * 0.14);
      cx.font = `${Math.round(h * 0.075)}px Arial, sans-serif`; cx.fillStyle = "#efe3bf";
      ["License current — aquatic category", "Covers imazapyr, this use site", "Renewal on file", "Invasive Spartina Project roster"].forEach((l, i) => cx.fillText(l, w * 0.06, h * (0.32 + i * 0.12)));
    }, { ry: -0.5, accent: SPT_ACCENT });
    reg(hits, licenseBoard, "dpr-license");

    const chest = toolChest(g, 0, 1.85, { color: 0x6f7a3a });
    for (const [id, dx, color, label] of [["stage-gloves", -0.2, 0x2f4d3a, "GLOVES"], ["stage-respirator", 0.0, 0x8a939b, "RESP"], ["stage-coveralls", 0.2, 0xd8cfa8, "SUIT"]]) {
      const it = group(chest, dx, 0.95, -0.12);
      box(it, 0.14, 0.08, 0.1, 0, 0, 0, color, { rough: 0.8 });
      decal(it, 0.12, 0.04, 0, 0.041, 0, signFace(label, { bg: "#1c1608", accent: "#f5ecd0", scale: 0.5 })).rotation.x = -Math.PI / 2;
      reg(hits, it, id);
    }

    // Mixing pad, off the marsh: jug, gauge, and the fill point the mix is
    // carried to at the marsh edge.
    const mixPad = group(g, -1.3, 0.26, 1.05);
    box(mixPad, 0.7, 0.02, 0.6, 0, 0.01, 0, 0x565656, { rough: 0.7, cast: false });
    const mixJug = cyl(mixPad, 0.09, 0.1, 0.28, -0.15, 0.16, 0, 0xd8cfa8, { rough: 0.5, opacity: 0.85, transparent: true, seg: 12 });
    const mixGauge = instrument(mixPad, 0.15, 0.32, 0, { idle: "-- oz/gal", color: 0xc9a227, w: 0.13, d: 0.2 });
    holoTag(mixPad, "mix to the label rate", 0.15, 0.52, 0, { css: "#c9a227", w: 0.44 });
    reg(hits, mixGauge, "mix-jug");
    const mixInMarshHit = box(g, 0.24, 0.24, 0.24, -1.75, 0.4, -0.35, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "mix it here instead?", -1.75, 0.65, -0.35, { css: "#e8622a", w: 0.4 });
    reg(hits, mixInMarshHit, "mix-in-marsh");

    const mixedJugHome = new THREE.Vector3(-1.45, 0.42, 1.05);
    const mixedJugFill = new THREE.Vector3(-1.3, 0.21, -0.35);
    const mixedJug = cyl(g, 0.09, 0.1, 0.28, mixedJugHome.x, mixedJugHome.y, mixedJugHome.z, 0xd8cfa8, { rough: 0.5, opacity: 0.85, transparent: true, seg: 12 });
    mixedJug.visible = false;
    reg(hits, mixedJug, "mixed-jug");
    void mixJug;

    const fillPoint = group(g, -1.3, 0.05, -0.35);
    hits["sprayer-fill"] = fillPoint;

    // Backpack sprayer at the fill point: regulator, nozzle, shutoff.
    const sprayer = group(g, -1.3, 0.05, -0.55);
    box(sprayer, 0.22, 0.4, 0.14, 0, 0.35, -0.1, 0xd8cfa8, { rough: 0.6 });
    const regulator = valveWheel(sprayer, 0.14, 0.42, -0.1, { color: 0xc9a227, body: 0x2b2f34, r: 0.06 });
    holoTag(sprayer, "pressure regulator", 0.14, 0.62, -0.1, { css: "#c9a227", w: 0.36 });
    reg(hits, regulator.userData.wheel, "regulator-wheel");
    const wand = cyl(sprayer, 0.012, 0.014, 0.55, 0.2, 0.2, 0.15, 0x3c444c, { rough: 0.5, metal: 0.5, seg: 8 });
    wand.rotation.x = -0.6;
    holoTag(sprayer, "sweep the wand along the line", 0.2, 0.42, 0.15, { css: "#c9a227", w: 0.5 });
    reg(hits, wand, "sweep-rate");
    const shutoff = box(sprayer, 0.06, 0.06, 0.05, 0.34, 0.18, 0.35, 0xd2312b, { rough: 0.55 });
    holoTag(sprayer, "sprayer shutoff", 0.34, 0.32, 0.35, { css: "#c9a227", w: 0.32 });
    reg(hits, shutoff, "sprayer-shutoff");
    const sweepInst = instrument(sprayer, 0.14, 0.68, -0.1, { idle: "-- sweep", color: 0xc9a227, w: 0.13, d: 0.2 });
    holoTag(sprayer, "sweep rate", 0.14, 0.86, -0.1, { css: "#c9a227", w: 0.3 });
    const mist = particles(g, 20, 0xe6f0c8, { size: 0.022, life: 0.4, additive: false, opacity: 0.5 });
    mist.position.set(-0.9, 0.35, -1.1);
    mist.visible = false;

    const overrideWindHit = box(g, 0.24, 0.24, 0.24, 1.9, 0.75, -1.15, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "keep spraying over limit?", 1.9, 1.0, -1.15, { css: "#e8622a", w: 0.46 });
    reg(hits, overrideWindHit, "override-wind");

    const anemPost = group(g, 1.9, 0.02, -1.15);
    cyl(anemPost, 0.02, 0.024, 0.85, 0, 0.42, 0, 0x8a939b, { rough: 0.5, metal: 0.6, seg: 10 });
    const anemHead = torus(anemPost, 0.06, 0.012, 0, 0.85, 0, 0xc9ccd0, { rough: 0.4, metal: 0.6, seg: 6, seg2: 12 });
    const windInst = instrument(anemPost, 0.2, 0.5, 0, { idle: "-- mph", color: 0xc9a227, w: 0.13, d: 0.2 });
    holoTag(anemPost, "wind — anemometer", 0.2, 0.7, 0, { css: "#c9a227", w: 0.34 });
    reg(hits, windInst, "wind-reading");
    void anemHead;
    const windsock = group(anemPost, 0, 0.7, 0);
    const windsockCloth = cyl(windsock, 0.018, 0.03, 0.22, 0, -0.11, 0, 0xd8cfa8, { rough: 0.7, seg: 10 });
    windsockCloth.rotation.z = 0.3;

    // Drift card, downwind of the sweep.
    const driftCard = group(g, -1.8, 0.06, -1.85);
    box(driftCard, 0.14, 0.1, 0.006, 0, 0.05, 0, 0xf4efe0, { rough: 0.55 });
    for (let i = 0; i < 10; i++) ball(driftCard, 0.004, (Math.random() - 0.5) * 0.11, 0.02 + (Math.random() - 0.5) * 0.07, 0.004, 0x2a6a8a, { rough: 0.8 });
    holoTag(driftCard, "drift card — read the catch", 0, 0.24, 0, { css: "#c9a227", w: 0.44 });
    reg(hits, driftCard, "drift-card");
    const driftInst = instrument(driftCard, 0.14, 0.06, 0, { ry: 0.4, idle: "-- pts", color: 0xc9a227, w: 0.1, d: 0.16 });
    const driftLeftHit = ball(g, 0.02, -1.8, 0.14, -1.85, 0x1b1e23, { rough: 0.8 });
    driftLeftHit.visible = false;
    reg(hits, driftLeftHit, "drift-card-left");

    // Flags for the treated clumps, near the sweep line.
    const flagSpots = [[-0.6, -1.1], [-1.2, -1.9], [0.3, -2.3]];
    const flagPosts = flagSpots.map(([x, z], i) => {
      const fp = flagPost(g, x, z, null, SPT_FLAG);
      fp.children[1].visible = false;
      reg(hits, fp, `flag-${i + 1}`);
      return fp;
    });
    const unflaggedTell = clump(g, -2.0, -2.5, { n: 6, color: 0x5f7a3a });
    reg(hits, unflaggedTell, "unflagged-clump");

    // Triple-rinse basin, off the marsh beside the mixing pad.
    const rinseBasin = group(g, 2.0, 0.26, 0.75);
    box(rinseBasin, 0.5, 0.16, 0.4, 0, 0.08, 0, 0x4a5561, { rough: 0.6, metal: 0.3 });
    const rinseJug = cyl(rinseBasin, 0.07, 0.08, 0.2, 0, 0.24, 0, 0xd8cfa8, { rough: 0.5, opacity: 0.85, transparent: true, seg: 12 });
    holoTag(rinseBasin, "triple-rinse the container", 0, 0.5, 0, { css: "#c9a227", w: 0.5 });
    reg(hits, rinseJug, "rinse-container");
    const dumpRinseHit = box(g, 0.22, 0.22, 0.22, 2.35, 0.42, 0.4, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "dump it on the mud?", 2.35, 0.65, 0.4, { css: "#e8622a", w: 0.38 });
    reg(hits, dumpRinseHit, "dump-rinse");

    // Treatment log table.
    const logTable = group(g, 1.6, 0.26, 1.05, -0.3);
    box(logTable, 0.5, 0.02, 0.35, 0, 0.01, 0, 0x565656, { rough: 0.7, cast: false });
    const logDecal = decal(logTable, 0.3, 0.4, 0, 0.021, 0, paperFace("TREATMENT LOG", ["Clumps treated / flagged", "Rate + wind readings", "Applicator license no.", "Invasive Spartina Project"], { scale: 0.85 }));
    logDecal.rotation.x = -Math.PI / 2;
    holoTag(logTable, "log the treatment", 0, 0.3, 0, { css: "#c9a227", w: 0.4 });
    reg(hits, logDecal, "treatment-log");

    // A second crew hand flagging clumps, clear of every control.
    const crew = standingFigure(g, 2.3, -0.5, { ry: 2.3, cloth: 0x2b3138, vest: 0xe8622a });
    holoTag(crew, "Spartina crew", 0, 1.9, 0, { css: "#c9a227", w: 0.3 });

    cone(g, -2.4, 1.4, { color: SPT_FLAG });
    cone(g, 2.4, 1.4, { color: SPT_FLAG });
    barrierPanel(g, 0, 2.15, { color: SPT_ACCENT });

    return {
      hits,
      spawnLook: new THREE.Vector3(0.2, 1.0, -0.5),
      onStep() {},
      onStepComplete(step) {
        if (step.id === "mix-herbicide") mixedJug.visible = true;
        if (step.id === "carry-mix") mixedJug.position.copy(mixedJugFill);
        if (step.id === "flag-clumps") for (const fp of flagPosts) fp.children[1].visible = true;
        if (step.id === "walk") { driftLeftHit.visible = false; unflaggedTell.visible = false; }
      },
      onHazard() {},
      // Both interruptions really change the scene: the mist really stops
      // for the rail call, and the windsock really stands out straight and
      // the shutoff really lights up for the wind — not only once animate()
      // next ticks, and not only a canvas repaint.
      onInterrupt(it) {
        if (it.id === "rail-calling") {
          mist.visible = false;
          shutoff.material = mat(0xffee55, { emissive: 0xffee55, ei: 1.6, rough: 0.4 });
        }
        if (it.id === "wind-freshening") {
          mist.visible = false;
          windsockCloth.rotation.z = 1.55;
          windsockCloth.material = mat(0xf0645b, { emissive: 0xf0645b, ei: 1.1, rough: 0.6 });
          shutoff.material = mat(0xffee55, { emissive: 0xffee55, ei: 1.6, rough: 0.4 });
        }
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "rail-calling") {
          shutoff.material = mat(0xd2312b, { rough: 0.55 });
        }
        if (it.id === "wind-freshening") {
          windsockCloth.rotation.z = 0.3;
          windsockCloth.material = mat(0xd8cfa8, { rough: 0.7 });
          shutoff.material = mat(0xd2312b, { rough: 0.55 });
        }
      },
      animate(t, dt, session) {
        wave.visible = true;
        wave.userData.step(dt, new THREE.Vector3(0, 0.02, -3.6), 1.2, 0.3, -0.15);
        const step = session?.step;
        if (step?.id === "apply-treatment" && session.holding) { mist.visible = true; mist.userData.step(dt, new THREE.Vector3(0, 0, 0), 0.05, 0.35, -0.4); }
        else mist.visible = false;
        if (step?.id === "apply-treatment" && session.track) repaint(sweepInst.userData.screen, signFace(session.track.v < 0.36 ? "lingering" : session.track.v > 0.56 ? "too fast" : "steady", { bg: "#1c1608", accent: session.track.v >= 0.36 && session.track.v <= 0.56 ? "#59c97b" : "#f2ae14", fg: "#f5ecd0", scale: 0.5 }));
        if (step?.id === "wind-monitor" && session.track) repaint(windInst.userData.screen, signFace(`${(session.track.v * 25).toFixed(0)} mph`, { bg: "#1c1608", accent: session.track.v <= 0.4 ? "#59c97b" : "#f0645b", fg: "#f5ecd0", scale: 0.6 }));
        const gg = session?.gauge;
        if (gg && !gg.committed) {
          if (step?.id === "mix-herbicide") repaint(mixGauge.userData.screen, signFace(`${(gg.t * 5).toFixed(1)} oz/gal`, { bg: "#1c1608", accent: gg.t >= 0.42 && gg.t <= 0.6 ? "#59c97b" : "#f2ae14", fg: "#f5ecd0", scale: 0.55 }));
          if (step?.id === "drift-check") repaint(driftInst.userData.screen, signFace(`${Math.round(gg.t * 100)} pts`, { bg: "#1c1608", accent: gg.t >= 0.1 && gg.t <= 0.3 ? "#59c97b" : "#f2ae14", fg: "#f5ecd0", scale: 0.55 }));
        }
        if (session?.turn && step?.id === "calibrate") regulator.userData.wheel.rotation.y = -session.turn.amount * Math.PI * 2;
      },
    };
  },
};
