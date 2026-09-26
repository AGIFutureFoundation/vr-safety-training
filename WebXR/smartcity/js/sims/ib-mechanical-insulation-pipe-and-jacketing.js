import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, ball, torus, slab, group, decal, repaint, signFace, particles, mat,
} from "../../../shared/kit.js";
import {
  CITY, stationPad, holoPanel, holoTag, toolChest, instrument, pipeRun, valveWheel,
  standingFigure, surfaceTexture, texturedMat, palette, concreteFace, corrugatedFace, gratingFace, reg,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Mechanical Insulation, Pipe and Jacketing VR — Building Systems
// & Facilities, the first of the Insulators and Boilermakers pack. A hot
// process pipe span on a pipe rack, worked from a rolling scaffold: the
// spec read, the bare pipe checked for surface temperature before a hand
// goes near it, mineral wool packed and wired on in offset layers, a
// fitting hand-packed, aluminum jacketing carried up, wrapped and banded
// tight, and the finished run walked for the gaps that would let weather
// or a boot find their way back to bare, uninsulated pipe.
//
// Sited generically: no plant name, no real pipe schedule or line number the
// registry is not sure of — the numbers on the readouts are "per the spec".

const IBMI_ACCENT = 0xe0a23c;
const IBMI_PAL = palette("utility");

export const SIM_IB_MECHANICAL_INSULATION_PIPE_AND_JACKETING = {
  id: "ib-mechanical-insulation-pipe-and-jacketing",
  index: "352",
  domain: "Facilities",
  trade: "Insulator, mechanical insulation and jacketing — Insulators Local 16",
  category: "Building Systems & Facilities",
  indoor: "plant",
  certification: "Insulators Local 16 heat and frost insulators apprenticeship and training; OSHA 29 CFR 1926.451 scaffolds and ANSI A10.8 scaffolding safety requirements for the rolling tower; 29 CFR 1910.134 respiratory protection against mineral-fibre dust; 29 CFR 1910.1000 air contaminants and the permissible exposure limits for nuisance and fibrous dust",
  name: "Mechanical Insulation, Pipe and Jacketing",
  title: simTitle("Mechanical Insulation, Pipe and Jacketing"),
  tagline: "A hot pipe run insulated and jacketed from a rolling scaffold, with the burn hazard checked before every bare-hand reach",
  accent: IBMI_ACCENT,
  accentCss: "#e0a23c",
  parSeconds: 300,
  footprint: 2.3,
  badge: { id: "run-sealed", name: "Run Sealed", note: "Insulated, jacketed and banded with the surface temperature proven cool before every reach" },

  game: system({
    name: "Insulation Certified",
    currency: "WRAP",
    ranks: ["Helper", "Insulator", "Lead Mechanic", "Insulation Foreman", "Insulation Certified"],
    badges: [
      { id: "cool-to-the-touch", name: "Cool to the Touch", note: "Never reached for bare pipe before the temperature read safe", test: AWARD.safe },
      { id: "layer-discipline", name: "Layer Discipline", note: "Installed both layers in the correct order every time", test: AWARD.stepClean("install-layers") },
      { id: "band-precise", name: "Band Precise", note: "Held every gauge and track reading near band centre", test: AWARD.precise(0.72) },
    ],
    challenges: [
      { id: "clean-run", name: "Clean Run", note: "No corrections from the spec to the log", test: AWARD.clean },
      { id: "steady-hand", name: "Steady Hand", note: "Held the jacketing wrap through the whole pass", test: AWARD.unbroken },
      { id: "fast-jacket", name: "Fast Jacket", note: "Complete inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "bare-hand-hot-pipe": "You reached for the bare flange before the surface temperature read safe. A process pipe running at operating temperature carries enough heat to raise a contact burn through a bare hand in under a second, and the only thing that tells you it has cooled into a touchable range is the reading on the thermometer — never how it looks from three feet away.",
    "cut-toward-body": "You picked up the utility knife to trim the mineral wool blanket cutting back toward your own hand. A fresh blade under load that slips off a batt does not stop at the edge of the material — it keeps going into whatever is behind it, which on a scaffold platform is your other hand or your leg. Every cut on this job goes away from the body, blade held so a slip travels into the insulation and nothing else.",
    "band-snapback": "You started to release the banding tool's tension lever before the crimp had actually seated. A banding tool under load stores that tension in the strap, and letting go before the crimp locks it lets the whole loop snap back through your hand at once — it is a laceration and a struck-hand injury from a tool built to do the exact opposite when it is run correctly.",
    "wet-insulation-left": "That section of mineral wool is soaked through from the leak that was fixed last week, and it is about to go back on the pipe wet and covered over. Wet insulation traps moisture against the pipe wall instead of shedding it, and corrosion under insulation works in the dark for years before it shows up as a wall-thickness failure nobody saw coming because the jacketing looked fine the whole time.",
  },

  lateNotes: {
    "banding-tool": "The band gets tensioned and crimped only once the jacketing is wrapped snug and seated — not before it is in position.",
    "jacketing-sheet": "The jacketing goes on once the insulation layers are complete and the temperature has been rechecked, not while the pipe is still reading hot.",
  },

  steps: [
    {
      id: "spec", kind: "select", target: "work-order",
      title: "Read the insulation and jacketing spec",
      cue: "Confirm the material, the thickness and the jacketing called out for this run.",
      why: "The spec sets the mineral wool thickness for this line's service temperature and names aluminum jacketing over it, and a run insulated to the wrong thickness under-protects a bystander from contact burn just as surely as no insulation at all. Working from memory on a rack with three different services running through it is how the wrong thickness ends up on the wrong pipe.",
    },
    {
      id: "pipe-temp", kind: "gauge", target: "ir-thermometer",
      title: "Check the bare pipe's surface temperature",
      cue: "Aim the infrared thermometer at the bare flange and commit once it reads inside the safe-to-touch band.",
      why: "This run is still carrying process heat, and the only way to know whether a bare-hand reach is safe is a reading, never a guess from how the pipe looks from the platform. The safe-to-touch band on this gauge is the same number the burn-hazard signage on the rack is built around, and it is checked before a single glove comes off.",
      gauge: {
        label: "BARE PIPE SURFACE TEMPERATURE", speed: 0.55, green: [0.0, 0.22],
        readout: (t) => `${Math.round(120 + t * 280)}°F`,
        missNote: "Still too hot for a bare-hand reach. Give the line more time or stay gloved until this reads inside the safe band.",
      },
    },
    {
      id: "rack-walk", kind: "find", noHint: true,
      targets: ["cui-patch", "missing-hanger", "wet-insulation-left"],
      itemNames: { "cui-patch": "rust staining through the old jacketing", "missing-hanger": "the missing pipe hanger", "wet-insulation-left": "the soaked insulation section" },
      itemNotes: {
        "cui-patch": "Rust bleeding through a jacketing seam is corrosion under insulation working on the pipe wall behind it — it gets opened up and the wall thickness checked before any new material goes over the same spot.",
        "missing-hanger": "A support hanger is missing along this span, and an unsupported length of insulated pipe sags at the joints, cracking the jacketing seam right where it flexes the most.",
        "wet-insulation-left": "Insulation left wet from last week's repair does not get covered over — it comes off, the pipe under it gets checked, and it is replaced dry.",
      },
      title: "Walk the pipe rack before starting",
      cue: "Three things on this run are not right yet. Find them before the first layer goes on.",
      why: "Everything found now is fixed for the cost of looking; everything missed now gets insulated over and becomes invisible for years. A hanger, a corrosion spot and a wet section are the three failures a finished jacketing job hides best, which is exactly why they are checked before the material goes on rather than after.",
    },
    {
      id: "ppe-don", kind: "sequence",
      targets: ["cut-gloves", "eye-pro", "dust-mask"],
      itemNames: { "cut-gloves": "cut-resistant gloves", "eye-pro": "eye protection", "dust-mask": "fibre-rated respirator" },
      title: "Don PPE in order",
      cue: "Cut-resistant gloves first, then eye protection, then the fibre-rated respirator.",
      why: "The gloves go on first because every step from here on involves a blade or a banding tool; the eyewear next because mineral wool sheds fibre the moment it is cut, well before the respirator seals; and the respirator last so it seats against a clean, dry face rather than one already sweating under safety glasses.",
      outOfOrderNote: "Wrong order — gloves before the blade work starts, eyewear before the first cut sheds fibre, respirator seated last.",
    },
    {
      id: "pack-fitting", kind: "hold", target: "valve-body", seconds: 5,
      title: "Hand-pack the valve body",
      cue: "Pack cut mineral wool pieces into the valve body's irregular shape and hold it pressed home.",
      why: "A valve body has no flat run for a blanket to wrap — it is packed by hand, piece by piece, and held compressed until each piece actually seats against the metal rather than bridging over a void. A void packed loosely today is a cold spot and a condensation point in six months, found only when someone cuts the jacketing open to ask why that one section is always wet.",
      holdBreakNote: "Let go before it seated. A piece pressed in and released springs back and leaves a gap behind the jacketing that nobody will see again until this comes apart.",
    },
    {
      id: "carry-insulation", kind: "drag", target: "wool-blanket",
      title: "Carry the insulation blanket to the span",
      cue: "Carry the rolled mineral wool blanket from the cart up to the open pipe span.",
      why: "The blanket is staged on the ground for a reason — carrying it up the scaffold two hands on the roll, rather than dragging a loose length up the ladder, is what keeps it from snagging a rung and unrolling under someone's boot on the way up.",
      drag: { to: "pipe-span", radius: 0.55, missNote: "Not up at the span yet. Get the blanket to the pipe before starting to cut it to length." },
    },
    {
      id: "install-layers", kind: "sequence",
      targets: ["first-layer", "second-layer", "wire-tie"],
      itemNames: { "first-layer": "first insulation layer", "second-layer": "offset second layer", "wire-tie": "wire-tied in place" },
      title: "Install the insulation in offset layers",
      cue: "Wrap the first layer around the pipe, offset the second layer's seam, then wire-tie both down.",
      why: "A single layer's seam is a straight line of reduced thickness running the length of the pipe; offsetting the second layer's seam against the first is what stops that line ever lining up all the way through to bare metal. The wire ties go on last because a layer that shifts before it is tied loses the offset it was just given.",
      outOfOrderNote: "Wrong order — the first layer goes on, the second layer's seam lands away from the first, and only then does the wire go on to hold both.",
    },
    {
      id: "band-tension", kind: "turn", target: "banding-tool",
      title: "Tension the banding tool",
      cue: "Crank the banding tool's handle to draw the strap down snug before crimping.",
      why: "The strap has to be drawn down evenly before the crimp locks it, because a band crimped over slack strap looks tight and lets go the first time the jacketing is bumped. The handle is turned steadily rather than yanked, so the tension builds evenly around the pipe instead of pulling hardest at whichever point the strap happened to catch first.",
      turn: { turns: 1.2, axis: "z", label: "BAND TENSION", readout: (t) => `${Math.round(t * 100)}% SEATED` },
    },
    {
      id: "jacket-wrap", kind: "track", target: "jacketing-sheet", seconds: 7,
      title: "Wrap and hold the aluminum jacketing",
      cue: "Wrap the jacketing sheet around the insulated pipe and hold it snug while the bands go on.",
      why: "The jacketing has to stay snug against the insulation underneath through the whole banding pass — too loose and it stands proud, catching every boot and hand that passes; pulled too hard and it dents the insulation beneath it, crushing the fibre and thinning the very layer it is supposed to protect.",
      track: {
        start: 0.1, green: [0.36, 0.6], rise: 0.5, fall: 0.44, drift: 0.11, label: "JACKET TENSION",
        readout: (v) => (v < 0.36 ? "loose — standing proud" : v > 0.6 ? "too tight — crushing the layer" : "snug and even"),
      },
      holdBreakNote: "Tension slipped out of band. Bring the sheet back snug against the insulation and hold it there through the rest of the wrap.",
    },
    {
      id: "final-temp-check", kind: "gauge", target: "ir-thermometer",
      title: "Recheck the jacketed surface temperature",
      cue: "Aim the thermometer at the finished jacketing and commit once it reads inside the personnel-protection band.",
      why: "The whole point of this insulation is a jacketed surface someone can lean a hand against without thinking twice, and the only way to prove that happened is the same reading taken again now that the work is done — not an assumption that thickness alone did the job.",
      gauge: {
        label: "JACKETED SURFACE TEMPERATURE", speed: 0.6, green: [0.0, 0.2],
        readout: (t) => `${Math.round(90 + t * 60)}°F`,
        missNote: "Still reading hot at the surface. Check for a thin spot or a gap in the layers before calling this run finished.",
      },
    },
    {
      id: "seam-walk", kind: "find", noHint: true,
      targets: ["flange-gap", "missing-endcap", "loose-band"],
      itemNames: { "flange-gap": "the open gap at the flange", "missing-endcap": "the missing end cap", "loose-band": "the band that never fully seated" },
      itemNotes: {
        "flange-gap": "A gap left at the flange is an opening in the weather barrier right where the jacketing needs it most — flanges get insulated with a removable cover, not skipped because they are awkward to wrap.",
        "missing-endcap": "An open end on the jacketing run is where wash-down water and weather get behind the insulation first, soaking it from the inside out before anyone notices from the outside.",
        "loose-band": "A band that never fully seated will work itself loose with vibration and let the jacketing edge lift, and a lifted edge on a run like this one is a hand or a sleeve catching on it before it is a leak.",
      },
      title: "Walk the finished run",
      cue: "Three things on the finished jacketing are not right. Find them before signing this off.",
      why: "A jacketing job that looks finished from the platform and a jacketing job that actually sheds weather are not automatically the same thing, and the difference lives at the flange, the end and every band — exactly the three places a walk-down checks before the scaffold comes down.",
    },
    {
      id: "crew-checkin", kind: "select", target: "ibmi-crew-checkin",
      title: "Check in with the insulation foreman",
      cue: "Report the corrosion found, the wet section replaced and how the platform work felt.",
      why: "The corrosion spot and the wet insulation both need to go on tomorrow's work list for the pipe underneath to actually get inspected, not just re-covered, and the foreman is the one who can put that on the schedule. The check-in is also where a rushed platform or a tool that needs replacing gets said out loud instead of carried quietly into the next shift.",
    },
    {
      id: "closing-log", kind: "select", target: "ibmi-closing-log",
      title: "Sign the insulation work log",
      cue: "Record the material lot, the thickness applied and the sections found needing follow-up, then sign.",
      why: "The log is what turns this run from a finished-looking pipe into a documented one — the material lot in case of a later recall, the applied thickness against the spec, and the corrosion and wet spots flagged for the follow-up inspection that a clean jacketing job would otherwise hide from view.",
    },
  ],

  interrupts: [
    {
      id: "load-swing",
      kind: "Overhead load",
      after: "pack-fitting", delay: 4, seconds: 12,
      alert: "A rigger's tag line has slipped and the suspended pipe spool overhead is swinging in toward your scaffold platform.",
      cue: "Get clear and sound the warning before it reaches the platform.",
      target: "spotter-horn",
      why: "A load on a hook that has lost its tag line is no longer going where the rigger planned, and the fastest thing anyone on the platform can do about a swinging load overhead is not guess its path but sound the horn and get clear of where it is headed. The horn is what tells the crane operator someone below has seen the problem before it reaches them.",
      missNote: "The load kept swinging while you stayed on the platform working. A pipe spool on a hook does not slow down for someone underneath it, and the horn button was standing right there unused.",
      wrongNote: "It is the spotter horn. Nothing about this scaffold is safer until the crane operator knows what you can see.",
    },
    {
      id: "trap-blowdown",
      kind: "Hot condensate",
      after: "jacket-wrap", delay: 4, seconds: 12,
      alert: "The steam trap downstream has opened and is discharging condensate across the walkway behind your scaffold.",
      cue: "Isolate the trap before anyone walks through that spray.",
      target: "trap-isolation-handle",
      why: "A steam trap discharging to atmosphere is putting near-boiling condensate across a walkway that people are using to get to and from this platform, and it stays that way until the isolation valve upstream of the trap is closed — not until it happens to stop on its own.",
      missNote: "The condensate kept discharging across the walkway while the jacketing wrap continued overhead. Somebody walking that route with their eyes on the scaffold above them, not the floor, is the scald this isolation valve exists to prevent.",
      wrongNote: "That is not it. The trap isolation handle is what actually stops the discharge — everything else here can wait a minute longer.",
    },
  ],

  supportLine: "your employer's employee assistance programme, or your Insulators Local 16 business agent if you are not sure how to reach it",

  build(root) {
    const hits = {};
    const g = group(root);
    const reg2 = (obj, id) => reg(hits, obj, id);
    stationPad(g, 2.3, IBMI_ACCENT);

    // ------------------------------------------------------------- floor and backdrop
    const floorTex = surfaceTexture((cx, w, h) => concreteFace(cx, w, h, {
      finish: "broom", tone: "#6f6a62", tone2: "#615c54",
    }), { repeat: 6 });
    const floor = box(g, 6.6, 0.1, 6.2, 0, 0.05, -0.2, 0xffffff, { rough: 0.9 });
    floor.material = texturedMat(floorTex, { rough: 0.92 });
    for (let i = -1; i <= 1; i++) {
      box(g, 0.5, 0.004, 4.2, i * 1.0, 0.101, -0.2, IBMI_PAL.trim, { cast: false, receive: false, opacity: 0.5, transparent: true });
    }

    const wallTex = surfaceTexture((cx, w, h) => corrugatedFace(cx, w, h, {
      colour: IBMI_PAL.structure, ribs: 20,
    }), { repeat: 3 });
    const backWall = box(g, 6.6, 3.0, 0.12, 0, 1.5, -2.95, 0xffffff, { rough: 0.7, metal: 0.2 });
    backWall.material = texturedMat(wallTex, { rough: 0.65, metal: 0.25 });

    // ------------------------------------------------------------- pipe rack + span
    const rack = group(g, 0, 0, -1.2);
    for (const sx of [-1.7, 1.7]) {
      cyl(rack, 0.05, 0.05, 1.65, sx, 0.825, 0, CITY.darkSteel, { rough: 0.6, metal: 0.6, seg: 12 });
      box(rack, 0.4, 0.04, 0.12, sx, 1.63, 0, CITY.darkSteel, { rough: 0.6, metal: 0.6 });
    }
    const pipe = pipeRun(rack, [[-1.7, 1.65, 0], [1.7, 1.65, 0]], 0.09, 0xb8402f,
      { steps: 20, flanges: [[-1.0, 1.65, 0], [1.0, 1.65, 0]], flangeAxis: "x" });
    holoTag(rack, "Process pipe span — jacketing in progress", 0, 1.98, 0, { css: "#e0a23c", w: 0.72 });
    for (let i = 0; i < 4; i++) {
      cyl(rack, 0.014, 0.014, 0.22, -1.35 + i * 0.9, 1.51, 0, CITY.steel, { rough: 0.4, metal: 0.7, seg: 8 });
    }
    const bareFlange = cyl(rack, 0.14, 0.14, 0.04, -1.0, 1.65, 0, CITY.steel, { rough: 0.35, metal: 0.8, seg: 18 });
    bareFlange.rotation.z = Math.PI / 2;
    holoTag(rack, "Bare flange", -1.0, 1.86, 0, { css: "#f2c14b", w: 0.32 });
    reg2(bareFlange, "bare-hand-hot-pipe");
    const irGlow = ball(bareFlange, 0.02, 0, 0.16, 0, 0xff8a3c, { emissive: 0xff8a3c, ei: 1.6 });
    void irGlow;

    const wetSection = cyl(rack, 0.11, 0.11, 0.55, 0.55, 1.65, 0, 0x8a7a56, { rough: 0.95, seg: 16 });
    holoTag(rack, "Water-damaged section", 0.55, 1.9, 0, { css: "#f0645b", w: 0.5 });
    reg2(wetSection, "wet-insulation-left");

    const corrosionSpot = group(rack, -0.55, 1.65, 0);
    box(corrosionSpot, 0.28, 0.02, 0.02, 0, 0.11, 0, 0xb15a2c, { rough: 0.85, cast: false });
    holoTag(corrosionSpot, "Rust through the jacketing", 0, 0.24, 0, { css: "#f0645b", w: 0.5 });
    reg2(corrosionSpot, "cui-patch");

    const hangerGap = group(rack, 1.35, 1.4, 0);
    box(hangerGap, 0.16, 0.02, 0.16, 0, 0, 0, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(hangerGap, "Missing hanger", 0, 0.14, 0, { css: "#f0645b", w: 0.4 });
    reg2(hangerGap, "missing-hanger");

    const valveBody = valveWheel(rack, 0, 1.2, 0.3, { r: 0.1, color: 0xf2c14b, body: IBMI_PAL.structure, ry: 1.57 });
    holoTag(valveBody, "Valve body — hand-pack", 0, 0.34, 0, { css: "#e0a23c", w: 0.44 });
    reg2(valveBody, "valve-body");

    const jacketing = group(rack, -1.0, 1.65, 0);
    box(jacketing, 0.55, 0.24, 0.24, 0, 0, 0, 0xd8d8d0, { rough: 0.4, metal: 0.5 });
    holoTag(jacketing, "Aluminum jacketing", 0, 0.2, 0, { css: "#e0a23c", w: 0.4 });
    reg2(jacketing, "jacketing-sheet");

    // ------------------------------------------------------------- rolling scaffold
    const scaffold = group(g, -0.1, 0, 0.35);
    for (const sx of [-0.9, 0.9]) for (const sz of [-0.5, 0.5]) {
      cyl(scaffold, 0.03, 0.03, 1.4, sx, 0.7, sz, CITY.steel, { rough: 0.5, metal: 0.6, seg: 10 });
    }
    for (const sz of [-0.5, 0.5]) box(scaffold, 1.8, 0.03, 0.03, 0, 1.38, sz, CITY.steel, { rough: 0.5, metal: 0.6 });
    for (const sx of [-0.9, 0.9]) box(scaffold, 0.03, 0.03, 1.0, sx, 1.38, 0, CITY.steel, { rough: 0.5, metal: 0.6 });
    const platform = box(scaffold, 1.9, 0.06, 1.1, 0, 1.4, 0, 0xffffff, { rough: 0.75 });
    platform.material = texturedMat(surfaceTexture((cx, w, h) => gratingFace(cx, w, h, {})), { rough: 0.7, metal: 0.35 });
    for (const sx of [-0.9, 0.9]) for (const sz of [-0.5, 0.5]) {
      cyl(scaffold, 0.05, 0.06, 0.12, sx, 0.06, sz, 0x2b2f33, { rough: 0.75, seg: 12 });
    }
    // Guardrail around the working edge.
    for (const sz of [-0.5, 0.5]) {
      box(scaffold, 1.9, 0.02, 0.02, 0, 1.85, sz, CITY.hiVis, { rough: 0.6 });
      box(scaffold, 1.9, 0.02, 0.02, 0, 2.1, sz, CITY.hiVis, { rough: 0.6 });
    }
    for (let i = -2; i <= 2; i++) {
      box(scaffold, 0.02, 0.7, 0.02, i * 0.4, 1.75, 0.5, CITY.steel, { rough: 0.5, metal: 0.6 });
    }
    const scaffoldTag = decal(scaffold, 0.18, 0.24, 0.9, 1.5, 0.5,
      signFace("SCAFFOLD\nTAG — GREEN", { bg: "#0f1b14", accent: "#59c97b", fg: "#bff7d4", scale: 0.34 }), { px: 220 });
    holoTag(scaffold, "Scaffold tag", 0.9, 1.75, 0.5, { css: "#59c97b", w: 0.32 });
    reg2(scaffoldTag, "scaffold-tag");

    // ------------------------------------------------------------- cutting hazard + PPE
    const cutBench = group(g, 1.75, 0, 1.6);
    slab(cutBench, 0.9, 0.72, 0.5, 0, 0.36, 0, 0x5a636b, { radius: 0.02, rough: 0.6, metal: 0.3 });
    const knife = group(cutBench, 0.2, 0.72, 0.1, -0.3);
    box(knife, 0.16, 0.02, 0.03, 0, 0, 0, 0xf2c14b, { rough: 0.4, metal: 0.3 });
    box(knife, 0.04, 0.015, 0.03, 0.09, 0.002, 0, 0xc0c6cc, { rough: 0.2, metal: 0.9 });
    holoTag(knife, "Utility knife", 0, 0.1, 0, { css: "#f0645b", w: 0.32 });
    reg2(knife, "cut-toward-body");

    const banding = group(cutBench, -0.2, 0.72, 0.1, 0.4);
    box(banding, 0.2, 0.1, 0.06, 0, 0, 0, 0x3a78c9, { rough: 0.5, metal: 0.2 });
    box(banding, 0.06, 0.16, 0.04, -0.12, 0.09, 0, 0x1b1d20, { rough: 0.7 });
    holoTag(banding, "Banding tool", 0, 0.2, 0, { css: "#f0645b", w: 0.34 });
    reg2(banding, "banding-tool");
    reg2(banding, "band-snapback");
    const bandSpark = ball(banding, 0.015, 0, 0.03, 0.06, 0xffe37a, { emissive: 0xffe37a, ei: 1.8 });
    bandSpark.visible = false;

    const irMeter = instrument(cutBench, 0, 0.75, -0.15, { idle: "--°F", color: IBMI_ACCENT });
    holoTag(irMeter, "IR thermometer", 0, 0.16, 0, { css: "#e0a23c", w: 0.34 });
    reg2(irMeter, "ir-thermometer");

    const ppeRack = group(g, -1.9, 0, 1.6, 0.5);
    slab(ppeRack, 0.1, 1.5, 0.5, 0, 0.75, 0, 0x4a525a, { radius: 0.02, rough: 0.6, metal: 0.4 });
    const cutGloves = box(ppeRack, 0.16, 0.1, 0.06, 0.08, 1.05, 0.2, 0xdfe4a8, { rough: 0.65 });
    holoTag(cutGloves, "Cut-resistant gloves", 0, 0.14, 0, { css: "#e0a23c", w: 0.42 });
    reg2(cutGloves, "cut-gloves");
    const eyePro = box(ppeRack, 0.14, 0.05, 0.05, 0.08, 1.3, 0.2, 0xbfe8ff, { rough: 0.3, opacity: 0.7, transparent: true });
    holoTag(eyePro, "Eye protection", 0, 0.1, 0, { css: "#e0a23c", w: 0.36 });
    reg2(eyePro, "eye-pro");
    const dustMask = torus(ppeRack, 0.06, 0.018, 0.08, 1.55, 0.2, 0x3c4650, { rough: 0.5 });
    holoTag(dustMask, "Fibre respirator", 0, 0.12, 0, { css: "#e0a23c", w: 0.42 });
    reg2(dustMask, "dust-mask");

    // ------------------------------------------------------------- staged materials
    const cart = group(g, -1.9, 0, -0.6, -0.5);
    box(cart, 0.5, 0.5, 0.9, 0, 0.25, 0, 0x2b3138, { rough: 0.7, metal: 0.3 });
    for (const sx of [-0.2, 0.2]) for (const sz of [-0.35, 0.35]) {
      cyl(cart, 0.05, 0.06, 0.1, sx, 0.05, sz, 0x1b1e22, { rough: 0.8, seg: 10 });
    }
    const woolMesh = cyl(cart, 0.16, 0.16, 0.5, 0, 0.6, 0, 0xe8e2d4, { rough: 0.95, seg: 16 });
    woolMesh.rotation.z = Math.PI / 2;
    holoTag(cart, "Mineral wool blanket", 0, 0.85, 0, { css: "#e0a23c", w: 0.5 });
    reg2(woolMesh, "wool-blanket");
    const spanTarget = group(g, -1.0, 0, -0.1);
    box(spanTarget, 0.3, 0.3, 0.3, 0, 1.65, 0, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    hits["pipe-span"] = spanTarget;

    // Layer + banding stand-ins around the working section of pipe.
    const firstLayer = cyl(rack, 0.16, 0.16, 0.5, -0.3, 1.65, 0, 0xd8cba0, { rough: 0.85, seg: 16 });
    firstLayer.rotation.z = Math.PI / 2;
    firstLayer.visible = false;
    reg2(firstLayer, "first-layer");
    const secondLayer = cyl(rack, 0.19, 0.19, 0.5, -0.3, 1.65, 0, 0xcfc19a, { rough: 0.85, seg: 16 });
    secondLayer.rotation.z = Math.PI / 2;
    secondLayer.visible = false;
    reg2(secondLayer, "second-layer");
    const wireTie = torus(rack, 0.2, 0.008, -0.3, 1.65, 0, 0x8b929a, { rough: 0.4, metal: 0.7 });
    wireTie.rotation.y = Math.PI / 2;
    wireTie.visible = false;
    reg2(wireTie, "wire-tie");

    const jacketSheetMesh = jacketing;
    const finalTemp = irMeter;

    // Finished-run inspection targets.
    const flangeGap = group(rack, -1.0, 1.65, 0.16);
    box(flangeGap, 0.06, 0.06, 0.02, 0, 0, 0, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(flangeGap, "Open gap at the flange", 0, 0.18, 0, { css: "#f0645b", w: 0.44 });
    reg2(flangeGap, "flange-gap");
    const missingCap = group(rack, 1.72, 1.65, 0);
    box(missingCap, 0.06, 0.06, 0.02, 0, 0, 0, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(missingCap, "Missing end cap", 0, 0.18, 0, { css: "#f0645b", w: 0.42 });
    reg2(missingCap, "missing-endcap");
    const looseBand = torus(rack, 0.13, 0.01, 0.9, 1.62, 0, 0x9aa4ad, { rough: 0.5, metal: 0.5 });
    looseBand.rotation.y = Math.PI / 2;
    holoTag(looseBand, "Band not fully seated", 0.9, 1.8, 0, { css: "#f0645b", w: 0.5 });
    reg2(looseBand, "loose-band");

    // ------------------------------------------------------------- paperwork + crew
    const order = holoPanel(g, 0.56, 0.4, -1.8, 1.5, 1.7, (ctx, w, h) => {
      ctx.fillStyle = "rgba(10,14,4,0.9)"; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#e0a23c"; ctx.fillRect(0, 0, w, 5);
      ctx.fillStyle = "#d9c39a";
      ctx.font = `600 ${Math.round(h * 0.09)}px 'Barlow Condensed', Arial, sans-serif`;
      ctx.textAlign = "left"; ctx.textBaseline = "middle";
      ctx.fillText("INSULATION SPEC IB-52", w * 0.06, h * 0.14);
      ctx.fillStyle = "#f4ecd8";
      ctx.font = `600 ${Math.round(h * 0.13)}px 'Barlow Condensed', Arial, sans-serif`;
      ctx.fillText("PROCESS PIPE — MINERAL WOOL + JACKETING", w * 0.06, h * 0.33);
      ctx.font = `${Math.round(h * 0.078)}px Arial, sans-serif`;
      ctx.fillStyle = "#d9c39a";
      ["Material: mineral wool, per the spec", "Thickness: per the spec",
        "Jacketing: aluminum, banded", "Surface temp: proven safe before touch",
        "Layers: offset seams, wire-tied"].forEach((line, i) => ctx.fillText(line, w * 0.06, h * (0.5 + i * 0.1)));
    }, { ry: 0.7, accent: IBMI_ACCENT });
    reg2(order, "work-order");

    const chest = toolChest(g, 1.9, -1.4, { ry: -0.6, color: IBMI_ACCENT });
    void chest;

    const foreman = standingFigure(g, -2.0, -1.8, { ry: 0.9, cloth: 0x3a434d, helmet: 0xf2c14b, vest: 0xe4dc3a });
    const checkin = holoPanel(g, 0.46, 0.3, -2.0, 1.6, -2.85, (ctx, w, h) => {
      ctx.fillStyle = "rgba(6,14,4,0.9)"; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#e0a23c"; ctx.fillRect(0, 0, w, 4);
      ctx.fillStyle = "#f4ecd8";
      ctx.font = `600 ${Math.round(h * 0.14)}px 'Barlow Condensed', Arial, sans-serif`;
      ctx.textAlign = "center"; ctx.textBaseline = "middle";
      ctx.fillText("CHECK IN — FOREMAN", w / 2, h * 0.3);
      ctx.font = `${Math.round(h * 0.1)}px Arial, sans-serif`;
      ctx.fillText("corrosion · wet section · crew status", w / 2, h * 0.68);
    }, { accent: IBMI_ACCENT });
    reg2(checkin, "ibmi-crew-checkin");

    const rigger = standingFigure(g, 2.5, -1.3, { ry: -0.9, cloth: 0x2b3138, helmet: 0xf2c14b, vest: 0xd8e24a });
    void rigger;

    const hoist = group(g, 0, 0, -1.2, 0);
    cyl(hoist, 0.02, 0.02, 0.4, 0, 2.6, 0, CITY.darkSteel, { rough: 0.5, metal: 0.7, seg: 8 });
    const spool = cyl(hoist, 0.18, 0.18, 0.5, 0, 2.35, 0, 0x8b929a, { rough: 0.6, metal: 0.5, seg: 16 });
    spool.rotation.z = Math.PI / 2;
    const spoolBeacon = ball(hoist, 0.02, 0.2, 2.35, 0, 0x59c97b, { emissive: 0x59c97b, ei: 1.8 });
    void spoolBeacon;

    const horn = group(g, -0.9, 0, 1.8, 0.3);
    cyl(horn, 0.05, 0.06, 0.14, 0, 1.0, 0, 0xd8232a, { rough: 0.5, metal: 0.3, seg: 12 });
    holoTag(horn, "Warning horn", 0, 0.14, 0, { css: "#e0a23c", w: 0.32 });
    reg2(horn, "spotter-horn");

    const trap = group(g, 1.9, 0, -0.5, -0.4);
    cyl(trap, 0.05, 0.05, 0.2, 0, 0.3, 0, CITY.darkSteel, { rough: 0.6, metal: 0.6, seg: 10 });
    const trapValve = valveWheel(trap, 0, 0.42, 0, { r: 0.06, color: 0xd8232a, body: IBMI_PAL.structure });
    holoTag(trap, "Trap isolation valve", 0, 0.6, 0, { css: "#e0a23c", w: 0.44 });
    reg2(trapValve, "trap-isolation-handle");
    const condensateSpray = particles(trap, 22, 0xdfeaf2, { size: 0.03, life: 0.4, additive: false, opacity: 0.4 });
    condensateSpray.visible = false;

    const closingLog = slab(g, 0.22, 0.03, 0.28, -2.5, 0.93, -1.4, 0xe8e2d4, { radius: 0.008, rough: 0.85 });
    holoTag(g, "Insulation work log", -2.5, 1.12, -1.4, { css: "#8fa9c4", w: 0.44 });
    reg2(closingLog, "ibmi-closing-log");

    // ----------------------------------------------------------------- state
    let jacketVisible = true;

    return {
      hits,
      footprint: 2.3,

      onStepComplete(step) {
        if (step.id === "install-layers") {
          firstLayer.visible = true; secondLayer.visible = true; wireTie.visible = true;
        }
        if (step.id === "jacket-wrap") {
          jacketVisible = true;
          jacketSheetMesh.material = mat(0xdfe3e0, { rough: 0.4, metal: 0.5 });
        }
        if (step.id === "final-temp-check") {
          repaint(finalTemp.userData.screen, signFace("108°F", { bg: "#0f1b14", accent: "#59c97b", fg: "#bff7d4", scale: 0.55 }));
        }
        if (step.id === "seam-walk") {
          flangeGap.children[0].material = mat(0xd8d8d0, { rough: 0.4, metal: 0.5, opacity: 1, transparent: false });
          missingCap.children[0].material = mat(0xd8d8d0, { rough: 0.4, metal: 0.5, opacity: 1, transparent: false });
          looseBand.material = mat(0x59c97b, { rough: 0.4, metal: 0.6 });
        }
      },

      onInterrupt(it) {
        if (it.id === "load-swing") {
          spool.position.x = 0.8;
          spool.material = mat(0xd2312b, { rough: 0.6, metal: 0.5 });
        }
        if (it.id === "trap-blowdown") {
          condensateSpray.visible = true;
        }
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "load-swing") {
          spool.position.x = 0;
          spool.material = mat(0x8b929a, { rough: 0.6, metal: 0.5 });
        }
        if (it.id === "trap-blowdown") {
          condensateSpray.visible = false;
        }
      },

      onHazard(hitId) {
        if (hitId === "band-snapback") bandSpark.visible = true;
      },

      animate(t, dt, session) {
        if (condensateSpray.visible) condensateSpray.userData.step(dt, new THREE.Vector3(0, 0.3, 0), 0.06, 0.4, 0.3);
        if (bandSpark.visible) bandSpark.material.emissiveIntensity = 1.4 + Math.sin(t * 20) * 0.6;
        void jacketVisible;

        const gg = session?.gauge;
        if (gg && !gg.committed) {
          if (session.step?.id === "pipe-temp") {
            const f = Math.round(120 + gg.t * 280);
            repaint(irMeter.userData.screen, signFace(`${f}°F`, {
              bg: "#0d1c24", accent: gg.t < 0.22 ? "#59c97b" : "#f0645b", fg: "#ffc9bf", scale: 0.55,
            }));
          }
          if (session.step?.id === "final-temp-check") {
            const f = Math.round(90 + gg.t * 60);
            repaint(irMeter.userData.screen, signFace(`${f}°F`, {
              bg: "#0d1c24", accent: gg.t < 0.2 ? "#59c97b" : "#f0645b", fg: "#ffc9bf", scale: 0.55,
            }));
          }
        }
      },
    };
  },
};
