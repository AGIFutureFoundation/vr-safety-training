import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, ball, torus, slab, group, decal, repaint, signFace, particles, mat,
} from "../../../shared/kit.js";
import {
  CITY, stationPad, holoPanel, holoTag, toolChest, instrument, valveWheel,
  standingFigure, surfaceTexture, texturedMat, palette, concreteFace, rustFace, reg,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Refractory and Castable Installation VR — Building Systems &
// Facilities, the sixth of the Insulators and Boilermakers pack. A damaged
// furnace wall relined in castable refractory: the anchor pattern checked,
// formwork built and clamped tight, the castable mixed to the data sheet's
// water ratio, placed and vibrated into the form, stripped and inspected,
// then brought up on a controlled dryout burn that ramps rather than jumps
// to temperature.
//
// Sited generically: no furnace manufacturer, no real castable brand name —
// the mix ratio, cure schedule and dryout rate are "per the data sheet".

const IBRF_ACCENT = 0xe4622a;
const IBRF_PAL = palette("construction");

export const SIM_IB_REFRACTORY_AND_CASTABLE_INSTALLATION = {
  id: "ib-refractory-and-castable-installation",
  index: "357",
  domain: "Facilities",
  trade: "Boilermaker / insulator, refractory and castable installation — Boilermakers Local 549 and Insulators Local 16",
  category: "Building Systems & Facilities",
  indoor: "plant",
  certification: "Boilermakers Local 549 and Insulators Local 16 apprenticeship and training; OSHA 29 CFR 1910.134 respiratory protection against castable dust; 29 CFR 1910.1000 air contaminants and the permissible exposure limits; 29 CFR 1926.451 scaffolds for the furnace wall access; NIOSH criteria for silica exposure in the mixed and cured castable; ANSI A10.8 scaffolding safety requirements for the access platform",
  name: "Refractory and Castable Installation",
  title: simTitle("Refractory and Castable Installation"),
  tagline: "A furnace wall relined in castable refractory, mixed to the data sheet, formed, placed and vibrated, then brought up on a controlled dryout ramp rather than a shortcut",
  accent: IBRF_ACCENT,
  accentCss: "#e4622a",
  parSeconds: 320,
  footprint: 2.3,
  badge: { id: "lining-cured-true", name: "Lining Cured True", note: "Anchored, formed, placed on the mix ratio and brought up on the dryout schedule with nothing rushed" },

  game: system({
    name: "Refractory Certified",
    currency: "CAST",
    ranks: ["Helper", "Refractory Mechanic", "Lead Installer", "Refractory Foreman", "Refractory Certified"],
    badges: [
      { id: "anchors-sound", name: "Anchors Sound", note: "Never cast over a missing or bent anchor", test: AWARD.safe },
      { id: "mix-precise", name: "Mix Precise", note: "Held every gauge and track reading near band centre", test: AWARD.precise(0.72) },
      { id: "form-disciplined", name: "Form Disciplined", note: "Built the formwork in the correct order every time", test: AWARD.stepClean("form-build") },
    ],
    challenges: [
      { id: "clean-cast", name: "Clean Cast", note: "No corrections from the spec to the cure log", test: AWARD.clean },
      { id: "steady-pour", name: "Steady Pour", note: "Held the pour rate through the whole placement", test: AWARD.unbroken },
      { id: "fast-lining", name: "Fast Lining", note: "Complete inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "vibrator-over-time": "You are holding the internal vibrator in one spot well past the time the data sheet calls for. Over-vibrating castable does not pack it tighter — it separates the mix, drives the coarser aggregate down and leaves a weak, water-rich layer right at the hot face, which is exactly the layer that spalls off first the next time this furnace fires.",
    "missing-anchor-covered": "That anchor is bent flat against the shell instead of standing proud, and the castable is about to be poured straight over it. An anchor that cannot actually key into the lining leaves that whole section of castable relying on the material's own weight to stay on a vertical furnace wall — it gets straightened or replaced before a single scoop of castable goes near it.",
    "dryout-full-open": "You are about to crank the burner valve straight to full rate instead of following the ramp. Castable refractory holds free water deep in the material long after the surface looks dry, and heating it faster than that water can migrate out turns it to steam inside the lining — steam that has nowhere to go but out, taking chunks of castable with it in a process called steam spalling.",
    "bare-hand-wet-castable": "You reached into the mixed castable bare-handed. Wet refractory castable is caustic in the same way wet concrete is, and skin contact that seems like nothing in the moment is a chemical burn that shows up hours later — gloves go on before hands go anywhere near the mix, not after the first batch is already poured.",
  },

  lateNotes: {
    "vibrator-target": "The vibrator runs once the castable is actually in the form — not dry-run against an empty form to check it works.",
    "burner-valve": "The dryout burner only comes up once the forms are stripped and the surface has been inspected, not while the castable is still curing behind them.",
  },

  steps: [
    {
      id: "spec", kind: "select", target: "install-spec",
      title: "Read the refractory installation spec",
      cue: "Confirm the castable mix design, the anchor pattern and the cure and dryout schedule.",
      why: "This job is entirely a set of numbers the data sheet already worked out — the water ratio, the anchor spacing and the dryout ramp — and every one of those numbers exists because refractory that looks the same at any two of those settings can perform completely differently in service.",
    },
    {
      id: "anchor-survey", kind: "find", noHint: true,
      targets: ["bent-anchor", "missing-anchor", "corroded-anchor"],
      itemNames: { "bent-anchor": "the bent anchor", "missing-anchor": "the missing anchor", "corroded-anchor": "the corroded anchor" },
      itemNotes: {
        "bent-anchor": "A bent anchor lying flat against the shell cannot key into the castable the way an upright anchor does — it gets straightened or cut off and replaced before the form goes up over it.",
        "missing-anchor": "A gap in the anchor pattern is a section of lining with nothing holding it to the shell but its own bond — it gets a new anchor welded in on the pattern's spacing, not left out because the form will cover the gap anyway.",
        "corroded-anchor": "A corroded anchor has already lost cross-section it will never get back, and castable keyed to a weakened anchor is castable one thermal cycle away from that anchor letting go entirely — it gets replaced, not cast over.",
      },
      title: "Survey the anchor pattern before forming",
      cue: "Three things about this anchor pattern are not right yet. Find them before the form goes up.",
      why: "The anchors are what actually hold this lining to the shell through years of heating and cooling, and every one of them is checked while it is still visible — a bent, missing or corroded anchor found after the castable is poured over it is a repair that has to be cut back out to fix.",
    },
    {
      id: "form-build", kind: "sequence",
      targets: ["form-panel-set", "form-brace", "form-seal"],
      itemNames: { "form-panel-set": "form panel set", "form-brace": "braced", "form-seal": "seams sealed" },
      title: "Build the form",
      cue: "Set the form panel against the studs, brace it, then seal the seams.",
      why: "The panel goes up against the anchors first so its position can be checked against the pattern before anything else depends on it; the bracing holds that position against the weight of wet castable that is about to push on it from the inside; and the seams are sealed last so a wet mix does not find every gap the moment it is poured.",
      outOfOrderNote: "Wrong order — set the panel, brace it against the pour pressure, then seal the seams.",
    },
    {
      id: "tension-formwork", kind: "turn", target: "form-clamp",
      title: "Tension the form clamps",
      cue: "Turn the wing-nut clamps to seat the form tight against the studs.",
      why: "A form that is braced but not actually clamped tight can still creep open under the weight of wet castable, and a form that moves mid-pour leaves a lining with an uneven face exactly where the furnace needs it flattest — the clamps are what turn a braced form into one that holds its shape through the whole placement.",
      turn: { turns: 1.0, axis: "z", label: "FORM CLAMP TENSION", readout: (t) => `${Math.round(t * 100)}% SEATED` },
    },
    {
      id: "mix-castable", kind: "hold", target: "mixer", seconds: 5,
      title: "Mix the castable",
      cue: "Hold the mixer running through the full time the data sheet gives.",
      why: "Castable refractory is a chemical set, not just a material getting wet, and it only reaches the strength the data sheet promises if it is mixed for the full time specified — a short mix leaves dry pockets that never fully hydrate, and those pockets are weak spots baked permanently into the lining.",
      holdBreakNote: "The mix was cut short. Dry pockets in castable do not go away on their own — they cure in place as permanently weak spots.",
    },
    {
      id: "water-ratio-check", kind: "gauge", target: "slump-gauge",
      title: "Check the water ratio",
      cue: "Take the slump reading on the mixed batch and commit once it reads inside the specified range.",
      why: "Too much water and the castable's strength and refractoriness both drop once it cures; too little and it will not flow into the form or around the anchors, leaving voids that show up later as spalled patches. The slump reading is what proves this batch is actually inside the range the data sheet calls for, not just close enough by eye.",
      gauge: {
        label: "SLUMP / WATER RATIO", speed: 0.6, green: [0.4, 0.62],
        readout: (t) => `${(t * 8).toFixed(1)} in`,
        missNote: "Outside the specified range. Adjust the water and remix rather than placing a batch that is too wet or too stiff.",
      },
    },
    {
      id: "cast-pour", kind: "track", target: "pour-chute", seconds: 7,
      title: "Place the castable into the form",
      cue: "Hold a steady placement rate as the castable fills the form.",
      why: "A steady placement rate is what lets the castable flow around every anchor and into every corner of the form before the batch starts to set — pour too fast and it traps air pockets behind the anchors; pour too slow and the leading edge starts to stiffen before the rest of the batch catches up to it.",
      track: {
        start: 0.1, green: [0.36, 0.6], rise: 0.5, fall: 0.44, drift: 0.11, label: "PLACEMENT RATE",
        readout: (v) => (v < 0.36 ? "too slow — cold joint forming" : v > 0.6 ? "too fast — trapping air" : "even fill"),
      },
      holdBreakNote: "Placement rate slipped out of band. An uneven pour here becomes a void or a cold joint the surface inspection will have to find later.",
    },
    {
      id: "vibrate-form", kind: "hold", target: "vibrator-target", seconds: 4,
      title: "Vibrate the placed castable",
      cue: "Work the internal vibrator through the form and hold each position only as long as the data sheet allows.",
      why: "Vibration is what actually consolidates the castable around the anchors and against the form face, closing the air pockets a pour alone leaves behind — held too briefly and those pockets stay; held too long in one spot and the mix segregates instead of consolidating.",
      holdBreakNote: "Vibration cut short in that section. An unconsolidated pocket behind the anchors is a void the surface inspection cannot see from the finished face.",
    },
    {
      id: "move-form-panel", kind: "drag", target: "next-form-panel",
      title: "Move the next form panel into place",
      cue: "Carry the next form panel section to the adjoining stud line.",
      why: "The next section is staged and moved into position while the current pour is still fresh enough that the joint between the two sections stays a proper cold joint rather than an exposed edge left to dry out and crack before the next batch ever reaches it.",
      drag: { to: "next-panel-mount", radius: 0.5, missNote: "Not at the next stud line yet. The joint between sections only holds if the next form goes up while the last pour is still workable." },
    },
    {
      id: "strip-forms", kind: "select", target: "form-panel-set",
      title: "Strip the forms",
      cue: "Remove the form panels once the castable has reached its initial set.",
      why: "Stripping on schedule — not early to save time and not late out of caution — is what the data sheet's cure time is actually calibrated to. Strip too soon and the unsupported face can slump or crack; leave the forms on too long and there is no way to inspect the face for the defects that are easiest to fix while it is still green.",
    },
    {
      id: "surface-inspect", kind: "find", noHint: true,
      targets: ["honeycomb-void", "exposed-anchor-tip", "cold-joint-line"],
      itemNames: { "honeycomb-void": "the honeycombed patch", "exposed-anchor-tip": "the exposed anchor tip", "cold-joint-line": "the visible cold joint" },
      itemNotes: {
        "honeycomb-void": "A honeycombed patch is where the castable never fully consolidated around the aggregate — it gets patched with fresh material now, while the rest of the pour is still curing alongside it.",
        "exposed-anchor-tip": "An anchor tip standing proud of the finished face will run hotter than the castable around it and become the first place this lining actually fails — it gets covered with a proper patch, not left exposed because the rest of the face looks fine.",
        "cold-joint-line": "A visible line where one placement ended and the next began, with no real bond between them, is a joint that will open under thermal cycling exactly where the two pours never actually fused.",
      },
      title: "Inspect the stripped surface",
      cue: "Three things on this cured face are not right. Find them before the dryout burn starts.",
      why: "Every one of these defects is at its most visible and most repairable the moment the forms come off — cured for a few days and cased in soot after the first firing, the same honeycomb or exposed anchor is a much harder problem to diagnose and fix.",
    },
    {
      id: "dryout-burn", kind: "track", target: "burner-valve", seconds: 7,
      title: "Run the controlled dryout burn",
      cue: "Hold the burner ramp rate steady as the lining comes up to temperature.",
      why: "Free water sitting deep in the castable needs time to migrate out and escape before the surface seals it in, and the ramp rate is what gives it that time — rush the ramp and the water flashes to steam faster than it can find its way out, and steam looking for an exit through solid refractory takes chunks of the lining with it.",
      track: {
        start: 0.08, green: [0.32, 0.55], rise: 0.5, fall: 0.42, drift: 0.1, label: "DRYOUT RAMP RATE",
        readout: (v) => (v < 0.32 ? "too slow — wasting the schedule" : v > 0.55 ? "too fast — risking steam spalling" : "steady ramp"),
      },
      holdBreakNote: "Ramp rate slipped out of band. A dryout that runs ahead of the schedule risks the exact steam spalling this whole step exists to prevent.",
    },
    {
      id: "cure-temp-hold", kind: "gauge", target: "pyrometer",
      title: "Hold the soak temperature",
      cue: "Read the lining temperature and commit once it holds inside the soak band the schedule calls for.",
      why: "The schedule's hold temperature gives the lining time to finish driving out the last of the free water at a temperature it can tolerate, before the ramp continues toward service temperature — skipping the hold to save time is how a dryout that looked successful still cracks the first time this furnace runs a full cycle.",
      gauge: {
        label: "LINING TEMPERATURE — SOAK", speed: 0.55, green: [0.42, 0.62],
        readout: (t) => `${Math.round(200 + t * 500)}°F`,
        missNote: "Outside the soak band. Hold the rate steady until the temperature actually settles in the range the schedule calls for.",
      },
    },
    {
      id: "crew-checkin", kind: "select", target: "ibrf-crew-checkin",
      title: "Check in with the refractory foreman",
      cue: "Report the corroded anchor, the honeycomb patch, and how the dryout ramp behaved.",
      why: "The corroded anchor found during the survey needs to be logged against the shell's own inspection record, not just fixed and forgotten, and the honeycomb patch needs a follow-up check once the furnace has run its first full cycle. The check-in is also where a dryout that felt like it was fighting the ramp gets flagged before the next lining goes through the same schedule.",
    },
    {
      id: "closing-log", kind: "select", target: "ibrf-closing-log",
      title: "Sign the refractory closeout log",
      cue: "Record the mix ratio, the anchor repairs and the dryout readings, then sign.",
      why: "The closeout log ties this specific lining to the batch it was mixed from, the anchors that were repaired underneath it and the actual temperatures the dryout held — the record an inspector or the next crew reads instead of taking a finished-looking furnace wall on faith.",
    },
  ],

  interrupts: [
    {
      id: "form-panel-bulge",
      kind: "Form failing",
      after: "cast-pour", delay: 4, seconds: 12,
      alert: "The form panel on the section you just poured is bulging outward under the weight of the fresh castable.",
      cue: "Brace the bulging panel before it lets go.",
      target: "emergency-brace",
      why: "A form bulging under a fresh pour is a form actively failing, not a cosmetic problem to note and fix later — the extra brace is what stops that section from blowing out and dumping wet castable across the work area, taking the pour's consolidation with it.",
      missNote: "The panel kept bulging while the pour continued. A form that lets go under a fresh placement does not fail quietly — it dumps uncured castable wherever the gap opens.",
      wrongNote: "It is the emergency brace. Nothing about this pour holds its shape until that panel is braced.",
    },
    {
      id: "burner-flameout",
      kind: "Dryout flameout",
      after: "dryout-burn", delay: 4, seconds: 12,
      alert: "The dryout burner has flamed out partway through the ramp, and the lining is starting to cool from an uneven temperature.",
      cue: "Reset the burner through a proper purge before relighting.",
      target: "burner-reset-panel",
      why: "A lining partway through a dryout ramp that suddenly cools does not simply pause where it left off — unequal cooling across the face sets up the same kind of thermal stress the ramp was designed to avoid, and relighting without a proper purge risks a flashback into a firebox that still has fuel sitting in it from the flameout.",
      missNote: "The burner sat unlit while the lining cooled unevenly from mid-ramp. Whatever thermal stress that uneven cooling put into the castable is now baked into a lining nobody can see the inside of.",
      wrongNote: "That is not it. The burner reset panel is what actually gets this dryout relit safely rather than restarted on a guess.",
    },
  ],

  supportLine: "your employer's employee assistance programme, or your Boilermakers Local 549 or Insulators Local 16 business agent if you are not sure how to reach it",

  build(root) {
    const hits = {};
    const g = group(root);
    const reg2 = (obj, id) => reg(hits, obj, id);
    stationPad(g, 2.3, IBRF_ACCENT);

    // ------------------------------------------------------------- floor and furnace wall
    const floorTex = surfaceTexture((cx, w, h) => concreteFace(cx, w, h, {
      finish: "broom", tone: "#6d6862", tone2: "#5f5b54",
    }), { repeat: 6 });
    const floor = box(g, 6.4, 0.1, 5.8, 0, 0.05, -0.1, 0xffffff, { rough: 0.9 });
    floor.material = texturedMat(floorTex, { rough: 0.9 });

    const shellTex = surfaceTexture((cx, w, h) => rustFace(cx, w, h, {}), { repeat: 3 });
    const shell = box(g, 4.2, 2.6, 0.2, -0.5, 1.3, -2.6, 0xffffff, { rough: 0.7, metal: 0.3 });
    shell.material = texturedMat(shellTex, { rough: 0.7, metal: 0.35 });
    holoTag(shell, "Furnace shell — damaged section", 0, 1.5, 0, { css: "#e4622a", w: 0.6 });

    // Anchor studs on the shell face.
    const studField = group(g, -0.5, 0, -2.5);
    const anchors = [];
    for (let r = 0; r < 4; r++) for (let c = 0; c < 5; c++) {
      const a = cyl(studField, 0.012, 0.012, 0.16, -0.8 + c * 0.4, 0.5 + r * 0.5, 0, 0x8b929a, { rough: 0.5, metal: 0.6, seg: 8 });
      a.rotation.x = Math.PI / 2;
      anchors.push(a);
    }
    const bentAnchor = anchors[6];
    bentAnchor.rotation.z = 1.4;
    holoTag(studField, "Bent anchor", 0.4, 0.4, 0, { css: "#f0645b", w: 0.32 });
    reg2(bentAnchor, "bent-anchor");
    const missingAnchorSpot = group(studField, 0, 1.5, 0);
    box(missingAnchorSpot, 0.1, 0.1, 0.1, 0, 0, 0, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(missingAnchorSpot, "Missing anchor", 0, 0.16, 0, { css: "#f0645b", w: 0.38 });
    reg2(missingAnchorSpot, "missing-anchor");
    reg2(missingAnchorSpot, "missing-anchor-covered");
    const corrodedAnchor = anchors[18];
    corrodedAnchor.material = mat(0xb15a2c, { rough: 0.9 });
    holoTag(studField, "Corroded anchor", -0.8, 2.0, 0, { css: "#f0645b", w: 0.4 });
    reg2(corrodedAnchor, "corroded-anchor");

    // ------------------------------------------------------------- form + castable
    const formPanel = group(g, -0.5, 0, -2.3, 0);
    const panel = box(formPanel, 2.4, 2.0, 0.06, 0, 1.2, 0, 0x8d7048, { rough: 0.8 });
    holoTag(formPanel, "Form panel", 0, 2.35, 0, { css: "#e4622a", w: 0.34 });
    reg2(panel, "form-panel-set");
    const braces = group(formPanel, 0, 0, 0.1);
    for (const dx of [-1.0, 0, 1.0]) cyl(braces, 0.02, 0.02, 0.5, dx, 1.2, 0.06, 0x8b929a, { rough: 0.5, metal: 0.5, seg: 8 }).rotation.x = Math.PI / 2.2;
    reg2(braces, "form-brace");
    const seams = box(formPanel, 2.4, 0.02, 0.02, 0, 1.2, 0.03, 0xf2c14b, { rough: 0.6 });
    reg2(seams, "form-seal");
    const clamp = box(formPanel, 0.1, 0.1, 0.1, 1.1, 1.2, 0.1, 0x3a78c9, { rough: 0.4, metal: 0.3 });
    holoTag(clamp, "Wing-nut clamp", 0, 0.18, 0, { css: "#e4622a", w: 0.36 });
    reg2(clamp, "form-clamp");

    const nextPanel = group(g, 1.7, 0, -2.4, 0.2);
    box(nextPanel, 1.2, 1.0, 0.05, 0, 0.6, 0, 0x8d7048, { rough: 0.8 });
    holoTag(nextPanel, "Next form panel", 0, 1.2, 0, { css: "#e4622a", w: 0.36 });
    reg2(nextPanel, "next-form-panel");
    const nextMount = group(g, 0.9, 0, -2.4);
    box(nextMount, 0.2, 0.2, 0.2, 0, 1.2, 0, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    hits["next-panel-mount"] = nextMount;

    const vibratorTarget = box(formPanel, 0.3, 0.3, 0.02, 0, 1.0, 0.031, 0xb8402f, { rough: 0.7 });
    reg2(vibratorTarget, "vibrator-target");
    const vibratorTool = group(g, -1.6, 0, -1.6, 0.3);
    cyl(vibratorTool, 0.03, 0.03, 0.9, 0, 0.45, 0, 0x3a78c9, { rough: 0.4, metal: 0.3, seg: 10 });
    holoTag(vibratorTool, "Internal vibrator", 0, 0.95, 0, { css: "#e4622a", w: 0.4 });
    reg2(vibratorTool, "vibrator-over-time");

    // ------------------------------------------------------------- mixer + bench
    const mixer = group(g, -1.8, 0, 0.6, -0.3);
    cyl(mixer, 0.28, 0.3, 0.5, 0, 0.25, 0, 0x2f6f4a, { rough: 0.6, seg: 18 });
    const paddle = cyl(mixer, 0.02, 0.02, 0.6, 0, 0.6, 0, 0x8d9aa4, { rough: 0.45, metal: 0.65, seg: 10 });
    holoTag(mixer, "Mixer", 0, 0.95, 0, { css: "#e4622a", w: 0.28 });
    reg2(mixer, "mixer");

    const bench = group(g, -2.0, 0, 1.3, 0.4);
    slab(bench, 0.9, 0.72, 0.5, 0, 0.36, 0, 0x5a636b, { radius: 0.02, rough: 0.6, metal: 0.3 });
    const slumpGauge = instrument(bench, -0.2, 0.75, -0.1, { idle: "-- in", color: IBRF_ACCENT });
    holoTag(slumpGauge, "Slump gauge", 0, 0.16, 0, { css: "#e4622a", w: 0.32 });
    reg2(slumpGauge, "slump-gauge");
    const pyrometer = instrument(bench, 0.2, 0.75, 0.1, { idle: "--°F", color: IBRF_ACCENT });
    holoTag(pyrometer, "Pyrometer", 0, 0.16, 0, { css: "#e4622a", w: 0.32 });
    reg2(pyrometer, "pyrometer");
    const bareHandTrap = ball(bench, 0.06, 0.15, 0.75, 0.18, 0xb8402f, { rough: 0.6 });
    holoTag(bareHandTrap, "Wet castable — bare hand?", 0, 0.16, 0, { css: "#f0645b", w: 0.5 });
    reg2(bareHandTrap, "bare-hand-wet-castable");

    const pourChute = group(g, -1.2, 0, -1.9, -0.3);
    box(pourChute, 0.1, 0.5, 0.1, 0, 0.25, 0, 0x8b929a, { rough: 0.5, metal: 0.5 });
    holoTag(pourChute, "Pour chute", 0, 0.56, 0, { css: "#e4622a", w: 0.3 });
    reg2(pourChute, "pour-chute");
    const pourStream = particles(pourChute, 20, 0xb8a878, { size: 0.02, life: 0.4, additive: false, opacity: 0.5 });
    pourStream.visible = false;

    // ------------------------------------------------------------- dryout burner
    const burner = group(g, 1.5, 0, -1.2, -0.4);
    box(burner, 0.4, 0.4, 0.4, 0, 0.2, 0, 0x4a525a, { rough: 0.6, metal: 0.4 });
    const burnGlow = ball(burner, 0.08, 0, 0.35, 0.2, 0xff8a3c, { emissive: 0xff8a3c, ei: 1.2 });
    holoTag(burner, "Dryout burner", 0, 0.6, 0, { css: "#e4622a", w: 0.34 });
    reg2(burner, "burner-valve");
    const burnerFull = valveWheel(burner, 0.3, 0.4, 0, { r: 0.06, color: 0xd8232a, body: IBRF_PAL.structure });
    holoTag(burnerFull, "Full open — skip the ramp?", 0, 0.2, 0, { css: "#f0645b", w: 0.56 });
    reg2(burnerFull, "dryout-full-open");
    const resetPanel = group(g, 1.9, 0, -1.5, -0.3);
    box(resetPanel, 0.3, 0.3, 0.08, 0, 1.3, 0, 0x2b3138, { rough: 0.6, metal: 0.4 });
    const resetLamp = ball(resetPanel, 0.02, 0, 1.46, 0.05, 0x59c97b, { emissive: 0x59c97b, ei: 1.8 });
    holoTag(resetPanel, "Burner reset panel", 0, 1.5, 0, { css: "#e4622a", w: 0.44 });
    reg2(resetPanel, "burner-reset-panel");

    const emergencyBrace = group(g, -0.5, 0, -1.9, 0.3);
    cyl(emergencyBrace, 0.02, 0.02, 1.0, 0, 0.9, 0, 0x8b929a, { rough: 0.5, metal: 0.5, seg: 10 });
    holoTag(emergencyBrace, "Emergency brace", 0, 1.44, 0, { css: "#e4622a", w: 0.38 });
    reg2(emergencyBrace, "emergency-brace");

    // ------------------------------------------------------------- surface-inspect targets
    const honeycomb = box(formPanel, 0.2, 0.2, 0.02, -0.6, 0.9, 0.035, 0x8a5a3a, { rough: 0.9 });
    holoTag(formPanel, "Honeycombed patch", 0, 0.14, 0, { css: "#f0645b", w: 0.42 });
    reg2(honeycomb, "honeycomb-void");
    const exposedAnchor = cyl(formPanel, 0.012, 0.012, 0.06, 0.7, 0.7, 0.035, 0x8b929a, { rough: 0.5, metal: 0.6, seg: 8 });
    exposedAnchor.rotation.x = Math.PI / 2;
    holoTag(formPanel, "Exposed anchor tip", 0, 0.12, 0, { css: "#f0645b", w: 0.44 });
    reg2(exposedAnchor, "exposed-anchor-tip");
    const coldJoint = box(formPanel, 2.4, 0.015, 0.01, 0, 0.4, 0.031, 0x8a5a3a, { rough: 0.7, cast: false });
    holoTag(formPanel, "Cold joint line", 0, 0.1, 0, { css: "#f0645b", w: 0.4 });
    reg2(coldJoint, "cold-joint-line");

    // ------------------------------------------------------------------- paperwork + crew
    const spec = holoPanel(g, 0.56, 0.4, -1.9, 1.5, 2.2, (ctx, w, h) => {
      ctx.fillStyle = "rgba(10,6,4,0.9)"; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#e4622a"; ctx.fillRect(0, 0, w, 5);
      ctx.fillStyle = "#d9a89a";
      ctx.font = `600 ${Math.round(h * 0.09)}px 'Barlow Condensed', Arial, sans-serif`;
      ctx.textAlign = "left"; ctx.textBaseline = "middle";
      ctx.fillText("REFRACTORY SPEC RF-33", w * 0.06, h * 0.14);
      ctx.fillStyle = "#f4ece0";
      ctx.font = `600 ${Math.round(h * 0.12)}px 'Barlow Condensed', Arial, sans-serif`;
      ctx.fillText("FURNACE WALL — CASTABLE LINING", w * 0.06, h * 0.33);
      ctx.font = `${Math.round(h * 0.078)}px Arial, sans-serif`;
      ctx.fillStyle = "#d9a89a";
      ["Mix ratio: per the data sheet", "Anchor pattern: per the drawing",
        "Cure: per the data sheet", "Dryout ramp: per the schedule",
        "Soak temperature: per the schedule"].forEach((line, i) => ctx.fillText(line, w * 0.06, h * (0.5 + i * 0.1)));
    }, { ry: 0.7, accent: IBRF_ACCENT });
    reg2(spec, "install-spec");

    const chest = toolChest(g, 2.1, 1.4, { ry: -0.6, color: IBRF_ACCENT });
    void chest;

    // Rolling scaffold platform for the upper anchor rows.
    const scaffold = group(g, 1.2, 0, -1.9);
    for (const sx of [-0.7, 0.7]) for (const sz of [-0.4, 0.4]) {
      cyl(scaffold, 0.025, 0.025, 1.6, sx, 0.8, sz, CITY.steel, { rough: 0.5, metal: 0.6, seg: 10 });
    }
    for (const sz of [-0.4, 0.4]) box(scaffold, 1.4, 0.025, 0.025, 0, 1.58, sz, CITY.steel, { rough: 0.5, metal: 0.6 });
    const scaffoldPlatform = box(scaffold, 1.5, 0.05, 0.9, 0, 1.6, 0, 0x9aa4ad, { rough: 0.7, metal: 0.4 });
    void scaffoldPlatform;
    for (const sx of [-0.7, 0.7]) for (const sz of [-0.4, 0.4]) {
      cyl(scaffold, 0.05, 0.06, 0.1, sx, 0.05, sz, 0x2b2f33, { rough: 0.75, seg: 10 });
    }
    for (const sz of [-0.4, 0.4]) {
      box(scaffold, 1.4, 0.02, 0.02, 0, 2.05, sz, CITY.hiVis, { rough: 0.6 });
    }
    holoTag(scaffold, "Access scaffold", 0, 2.2, 0, { css: "#e4622a", w: 0.4 });

    // Aggregate bags staged beside the mixer.
    const aggBags = group(g, -2.2, 0, -0.1, 0.3);
    for (let i = 0; i < 4; i++) {
      box(aggBags, 0.32, 0.2, 0.24, (i % 2) * 0.34 - 0.17, 0.11 + Math.floor(i / 2) * 0.22, 0, 0xc9b58a, { rough: 0.95 });
    }
    holoTag(aggBags, "Castable aggregate", 0, 0.5, 0, { css: "#e4622a", w: 0.42 });

    const foreman = standingFigure(g, -2.6, 0.5, { ry: -0.7, cloth: 0x3a434d, helmet: 0xf2c14b, vest: 0xe4dc3a });
    void foreman;
    const checkin = holoPanel(g, 0.46, 0.3, -2.6, 1.6, 1.5, (ctx, w, h) => {
      ctx.fillStyle = "rgba(10,6,4,0.9)"; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#e4622a"; ctx.fillRect(0, 0, w, 4);
      ctx.fillStyle = "#f4ece0";
      ctx.font = `600 ${Math.round(h * 0.14)}px 'Barlow Condensed', Arial, sans-serif`;
      ctx.textAlign = "center"; ctx.textBaseline = "middle";
      ctx.fillText("CHECK IN — FOREMAN", w / 2, h * 0.3);
      ctx.font = `${Math.round(h * 0.1)}px Arial, sans-serif`;
      ctx.fillText("corroded anchor · honeycomb · dryout feel", w / 2, h * 0.68);
    }, { accent: IBRF_ACCENT });
    reg2(checkin, "ibrf-crew-checkin");

    const closingLog = slab(g, 0.22, 0.03, 0.28, -2.6, 0.93, 1.5, 0xe8e2d4, { radius: 0.008, rough: 0.85 });
    holoTag(g, "Refractory closeout log", -2.6, 1.12, 1.5, { css: "#8fa9c4", w: 0.48 });
    reg2(closingLog, "ibrf-closing-log");

    // ----------------------------------------------------------------- state
    let placing = false, dryoutFiring = false;

    return {
      hits,
      footprint: 2.3,
      spawnLook: new THREE.Vector3(-0.3, 1.3, -1.4),

      onStepComplete(step) {
        if (step.id === "anchor-survey") { bentAnchor.material = mat(0x8b929a, { rough: 0.5, metal: 0.6 }); }
        if (step.id === "cast-pour") { panel.material = mat(0x9a8560, { rough: 0.7 }); }
        if (step.id === "strip-forms") { panel.visible = false; braces.visible = false; }
        if (step.id === "surface-inspect") {
          honeycomb.visible = false; coldJoint.visible = false;
        }
        if (step.id === "dryout-burn") dryoutFiring = true;
      },

      onInterrupt(it) {
        if (it.id === "form-panel-bulge") panel.scale.z = 1.6;
        if (it.id === "burner-flameout") { dryoutFiring = false; burnGlow.material = mat(0x3a3a3a, { emissive: 0x000000 }); resetLamp.material = mat(0xf0645b, { emissive: 0xf0645b, ei: 2.2 }); }
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "form-panel-bulge") panel.scale.z = 1;
        if (it.id === "burner-flameout") { dryoutFiring = true; burnGlow.material = mat(0xff8a3c, { emissive: 0xff8a3c, ei: 1.2 }); resetLamp.material = mat(0x59c97b, { emissive: 0x59c97b, ei: 1.8 }); }
      },

      onHazard() {},

      animate(t, dt, session) {
        void placing;
        pourStream.visible = session?.step?.id === "cast-pour";
        if (pourStream.visible) pourStream.userData.step(dt, new THREE.Vector3(0, 0.5, 0), 0.04, 0.4, -0.6);
        paddle.rotation.y += dt * (session?.step?.id === "mix-castable" && session.holding ? 8 : 0);
        if (dryoutFiring) burnGlow.material.emissiveIntensity = 1.0 + Math.sin(t * 6) * 0.4;

        const gg = session?.gauge;
        if (gg && !gg.committed) {
          if (session.step?.id === "water-ratio-check") {
            repaint(slumpGauge.userData.screen, signFace(`${(gg.t * 8).toFixed(1)}`, {
              bg: "#1c1408", accent: gg.t > 0.4 && gg.t < 0.62 ? "#59c97b" : "#f0645b", fg: "#ffe3ac", scale: 0.55,
            }));
          }
          if (session.step?.id === "cure-temp-hold") {
            repaint(pyrometer.userData.screen, signFace(`${Math.round(200 + gg.t * 500)}`, {
              bg: "#0d1c24", accent: gg.t > 0.42 && gg.t < 0.62 ? "#59c97b" : "#f0645b", fg: "#bfeaf7", scale: 0.5,
            }));
          }
        }
      },
    };
  },
};
