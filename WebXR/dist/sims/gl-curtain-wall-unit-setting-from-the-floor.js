import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import { box, cyl, ball, group, decal, repaint, signFace, paperFace, hose, mat } from "../../../shared/kit.js";
import {
  CITY, stationPad, holoPanel, holoTag, instrument, cone, barrierPanel,
  standingFigure, surfaceTexture, texturedMat, concreteFace, stainlessFace, safetyStripeFace, reg,
} from "../citykit.js";
import { level, tapeMeasure } from "../../../shared/toolkit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Curtain Wall Unit Setting From The Floor VR — Construction &
// Structural Trades, glaziers and architectural metal pack. A pre-glazed
// unitized curtain wall panel — mullions, insulated glass and gasketing
// already built up in the shop — is walked off the floor stack on a
// floor-mounted davit hoist and set into the slab-edge anchors one storey
// above street level. The floor itself is the hazard here as much as the
// unit: the bay this unit fills is the one gap in the guardrail line, open
// to the street below, and it stays open exactly as long as the unit is not
// yet anchored. Nothing about this trade is slow because the crew is
// careless; it is slow because every step either closes that gap or keeps a
// four-hundred-pound glass sail under control while it does.

const GLCW_ACCENT = 0x36b7c9;

export const SIM_GL_CURTAIN_WALL_UNIT_SETTING_FROM_THE_FLOOR = {
  id: "gl-curtain-wall-unit-setting-from-the-floor",
  index: "352",
  domain: "Construction & Structural Trades",
  trade: "Glazier — IUPAT District Council 16 curtain wall installer",
  category: "Construction & Structural Trades",
  weather: "wind",
  certification: "IUPAT District Council 16 glaziers apprenticeship and training (architectural glass and metal); IUPAT Finishing Trades Institute glazier curriculum; ANSI/ASSP Z97.1 safety glazing materials; OSHA 29 CFR 1926.501 duty to have fall protection and 29 CFR 1926.502 fall protection systems criteria and practices at the open floor edge; the curtain wall manufacturer's erection drawings and installation manual for anchor sequence and shim locations",
  name: "Curtain Wall Unit Setting From The Floor",
  title: simTitle("Curtain Wall Unit Setting From The Floor"),
  tagline: "Tailboard, harness to the interior anchor, the open bay walked, the unit dragged off the stack on the davit, held to the sill while the first clip bites, plumbed, torqued, and the vertical joint backer-rodded and sealed",
  accent: GLCW_ACCENT,
  accentCss: "#36b7c9",
  parSeconds: 300,
  footprint: 2.3,
  badge: { id: "unit-anchored-clean", name: "Unit Anchored Clean", note: "A curtain wall unit walked off the stack, anchored plumb at both tracks and sealed, with the open bay closed the whole time it mattered" },

  supportLine: "your IUPAT District Council 16 apprenticeship coordinator or job steward, or your employer's employee assistance program if the swinging unit over the open bay is what you keep seeing",

  game: system({
    name: "Unit Crew",
    currency: "TRACK",
    ranks: ["Pre-apprentice", "Ground Hand", "Unit Setter", "Lead Glazier", "Curtain Wall Certified"],
    badges: [
      { id: "wind-read", name: "Wind Read", note: "The gust at the open bay read before the unit left the stack", test: AWARD.stepClean("wind-read") },
      { id: "gap-never-open", name: "Gap Never Open", note: "No unsafe action at the open bay the whole run", test: AWARD.safe },
      { id: "plumb-true", name: "Plumb True", note: "The unit plumbed inside tolerance, first read", test: AWARD.precise(0.72) },
    ],
    challenges: [
      { id: "clean-set", name: "Clean Set", note: "The unit set without a correction", test: AWARD.clean },
      { id: "held-to-sill", name: "Held To Sill", note: "The unit never came off the sill track before the clip was in", test: AWARD.unbroken },
      { id: "unit-in-time", name: "Unit In Time", note: "Set, sealed and logged inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "bare-glass-edge": "You took the unit by its exposed glass edge instead of its aluminium frame. An insulated unit's edge seal is two lites of glass and a spacer bar, and the corner where the frame stops and the glass starts is a straight edge with the whole unit's weight behind it if it shifts in your hand. The unit is carried by the mullion frame, gloved, or it waits on the stack.",
    "open-floor-edge": "You stepped past the barrier into the bay with no unit anchored and no guardrail across it. This gap in the perimeter exists because a unit belongs there, not because the floor stops; the moment before that unit is anchored is the moment this opening is a fall to the street, and 29 CFR 1926.501 does not care that the gap is temporary.",
    "clip-pinch": "You reached fingers-first into the anchor clip while the unit was still being walked into the track. The clip closes on the mullion under the unit's own weight as it seats, and a hand between the clip and the frame at that moment is a hand the unit does not know is there. Fingers stay on the frame's outer face until the unit is seated and still.",
    "unit-swing-wind": "You let go of the tag line while the unit hung free of the stack and clear of the track. A four-hundred-pound insulated unit on a davit hook is a sail with a hinge at the hook, and a gust through the open bay swings it into the mullions either side or back into the crew before anyone can get a hand on it. The tag line is held from the moment the unit clears the stack to the moment it is hooked into the sill.",
  },

  lateNotes: {
    "cw-unit": "The unit leaves the stack after the harness is clipped to the anchor and the wind has been read at the bay. A unit dragged first is a sail over an open floor with nobody tied off.",
    "sealant-gun": "Sealant goes into a joint whose unit is already torqued at both tracks. A bead against a unit still moving on its clips is a bead that tears the first time the unit settles.",
  },

  steps: [
    {
      id: "check-in", kind: "select", target: "tailboard",
      title: "Sign the tailboard with the crew",
      cue: "Read the day's tailboard — which bay is open, who is inside the barrier, the wind limit for hoisting, who has the tag line — and sign it.",
      why: "The tailboard is written for this bay specifically because the hazard changes bay to bay: some bays have a unit already anchored on both sides, some are the last opening on the floor. Signing it is what makes you part of a crew that knows which one this is today, not a person who wandered up to an open hole in a floor with a glass unit near it.",
    },
    {
      id: "wind-read", kind: "gauge", target: "anemometer",
      title: "Read the wind at the open bay",
      cue: "Take the anemometer reading right at the bay opening and commit it inside the working band before the unit comes off the stack.",
      why: "Wind at an open floor bay is not the wind at street level — the building funnels it, and a unit hanging free of the stack on a davit hook adds sail area no rating on the hoist accounts for. A reading over the band means the unit waits on the stack, because the alternative is finding out what the gust does with a unit already clear of the floor and not yet anchored to anything.",
      gauge: { label: "WIND", speed: 0.7, green: [0.18, 0.48], readout: (t) => `${(t * 38).toFixed(0)} km/h`, missNote: "That reading is outside the working band at this bay — over it, the unit waits on the stack; under it, read it again right at the opening." },
    },
    {
      id: "harness", kind: "sequence",
      targets: ["harness-webbing", "lanyard-snap", "tie-off-anchor"],
      itemNames: { "harness-webbing": "harness webbing and stitching", "lanyard-snap": "lanyard and snap hook gate", "tie-off-anchor": "the interior anchor point" },
      title: "Inspect the harness and tie off to the interior anchor",
      cue: "Webbing and stitching first, then the lanyard and its hook gate, then the hook onto the structural anchor set back from the bay — in that order.",
      why: "29 CFR 1926.502 has a personal fall arrest system inspected before use: webbing for cuts and abrasion, stitching for pulled threads, the hook gate for a positive lock. The anchor is the one set back into the slab for exactly this bay, not the temporary barrier rail, because the barrier is there to be seen and stepped around, not to catch a fall.",
      outOfOrderNote: "Webbing, then lanyard, then anchor — the hook goes on last, onto a harness you have already proven sound.",
    },
    {
      id: "floor-walk", kind: "find", noHint: true,
      targets: ["barrier-gap", "loose-plank"],
      itemNames: { "barrier-gap": "a section of barrier not latched across the bay", "loose-plank": "a loose toe-board at the bay edge" },
      itemNotes: {
        "barrier-gap": "That barrier panel across the open bay swung loose at one end — a gap in the one thing between the crew and the opening below.",
        "loose-plank": "The toe-board along this edge has slid clear of its cleat. A tool kicked off the edge here goes straight to the street.",
      },
      title: "Walk the bay before the unit moves",
      cue: "Look at what is guarding this opening right now and click the two things wrong with it.",
      why: "The barrier and its toe-board are the only things standing between this floor and the street the whole time the bay is open, and both fail quietly — a panel that swings loose, a board that walks clear of its cleat under foot traffic. The bay does not get a unit dragged into it until both read correct, because a barrier that looks intact from three metres away is not the same as one that is actually latched.",
    },
    {
      id: "davit-check", kind: "select", target: "davit-controls",
      title: "Function-check the davit hoist",
      cue: "Up, down, and the hoist's own brake — each answered at the stack before the unit is on the hook.",
      why: "The davit is a floor-mounted hoist rated for exactly this unit weight at exactly this reach, and its brake is the one thing standing between a unit and a free fall if the motor cuts out mid-lift. It is tested empty, at the stack, where a brake that does not hold is a noise rather than a unit dropped over an open bay.",
    },
    {
      id: "unit-drag", kind: "drag", target: "cw-unit",
      title: "Walk the unit off the stack to the bay",
      cue: "Hook on the frame's lifting point, tag line held, guide the unit from the stack to the sill track — not released until it is offered up square.",
      why: "The unit is guided rather than swung: a hand on the tag line the whole way keeps it from finding the wind on its own, and it is offered to the sill square because a unit that arrives skewed will not seat its anchor clips without being forced, and forcing a clip on a unit this size bends the track it is supposed to seat into.",
      drag: { to: "sill-track", radius: 0.5, missNote: "Not square to the sill — a unit offered up crooked will not seat its clips without forcing them." },
    },
    {
      id: "align-jack", kind: "turn", target: "alignment-jack",
      title: "Wind the alignment jack to seat the sill leg",
      cue: "Turn the jack screw until the unit's sill leg draws fully into the track, evenly, without racking the frame.",
      why: "The alignment jack draws the unit's own weight into the sill track a few millimetres at a time, which is the only way a unit this size seats without being levered by hand against its own anchor clips. Turned unevenly it racks the frame square out of true before the first clip is even close to seated.",
      turn: { turns: 1, axis: "z", label: "SEAT" },
    },
    {
      id: "clip-hold", kind: "hold", target: "anchor-clip", seconds: 4,
      title: "Hold the unit to the sill while the first clip is driven",
      cue: "Both hands on the frame, hold it flat to the sill track while the first anchor clip is driven — do not let go until the clip bites.",
      why: "Between the jack coming off and the first clip biting, the unit is held to the sill by your grip on the frame and nothing else; a unit let go early rocks off the sill and swings back on the hook, and the second try is never as square as the first offer-up was. The clip is what makes the unit the building's problem instead of your arms'.",
      holdBreakNote: "You let go before the clip bit — the unit rocked off the sill. Offer it up again and hold it flat until the clip is driven.",
    },
    {
      id: "bolt-torque", kind: "turn", target: "clip-bolt",
      title: "Torque the anchor clip bolts",
      cue: "Both bolts on the anchor clip, driven to the manufacturer's torque — not spun in until it stops.",
      why: "The anchor clip's bolt torque comes from the curtain wall manufacturer's installation manual for this system, because an overdriven bolt on a thin extrusion strips its thread and holds nothing under the next day's thermal movement, while an underdriven one backs out the same way. This is the bolt the whole unit hangs from once the hoist comes off.",
      turn: { turns: 1, axis: "z", label: "TORQUE" },
    },
    {
      id: "shim-seq", kind: "sequence",
      targets: ["shim-base", "plumb-check", "shim-lock"],
      itemNames: { "shim-base": "base shim set at the sill", "plumb-check": "plumb checked against the last unit", "shim-lock": "shim locked in place" },
      title: "Shim and true the unit",
      cue: "Base shim first, then plumb checked against the neighbouring unit, then the shim locked — in that order.",
      why: "The shim carries the unit's dead load down to the structure at exactly the point the drawing calls for, and it is set before the plumb check because a plumb reading against a shim that is not yet seated is a reading that will change the moment the unit's full weight comes onto it. Locking the shim last is what keeps that reading true tomorrow.",
      outOfOrderNote: "Base shim, then plumb, then lock — a plumb reading before the shim is seated is a number that moves under load.",
    },
    {
      id: "plumb-gauge", kind: "gauge", target: "plumb-instrument",
      title: "Read the unit against the last one set",
      cue: "Read the plumb gauge against the neighbouring unit and commit inside tolerance.",
      why: "A curtain wall reads as one plane from the street, and that plane is the sum of every unit's plumb error next to the one before it — a unit half a degree out is invisible alone and a visible wave three units later. The gauge is read against the neighbour, not against true vertical, because it is the joint between them that either closes cleanly or does not.",
      gauge: { label: "PLUMB mm", speed: 0.74, green: [0.43, 0.6], readout: (t) => `${((t - 0.5) * 40).toFixed(1)} mm`, missNote: "Outside plumb tolerance against the last unit — back to the shims before the joint is closed." },
    },
    {
      id: "joint-seq", kind: "sequence",
      targets: ["backer-rod", "joint-tool"],
      itemNames: { "backer-rod": "backer rod pressed to depth", "joint-tool": "the bead tooled" },
      title: "Backer-rod the vertical joint",
      cue: "Backer rod pressed to the depth the drawing gives ahead of the bead, then the bead tooled to the rod once it is run.",
      why: "The backer rod gives the sealant a third surface to bond against instead of the void behind the joint, and without it the bead tears itself apart the first time the two units move apart in the sun. It is pressed in before the bead is run and tooled after, so the sealant bonds only to the two glass edges it is meant to seal between.",
      outOfOrderNote: "Rod first, then the bead, then tool it — there is nothing for the tool to press the bead onto without the rod already in.",
    },
    {
      id: "sealant-track", kind: "track", target: "sealant-gun", seconds: 5,
      title: "Run the sealant bead at a steady pace",
      cue: "Gun at the joint, run a continuous bead at a steady pace so the sealant fills to the depth the drawing calls for.",
      why: "A bead run too fast skins over a void that opens the first freeze; run too slow it overfills and cures into a block that pulls the glass edge when the units move apart. The steady pace is what puts the sealant manufacturer's specified depth on the backer rod along the whole joint, on a system whose only defence against the weather behind it is this one bead.",
      track: { label: "BEAD", green: [0.4, 0.62], rise: 0.55, fall: 0.43, drift: 0.13, readout: (v) => `${Math.round(v * 20)} mm/s` },
      holdBreakNote: "The bead ran out of the band — a thin spot or an overfill in the joint. Tool it out and run that stretch again at a steady pace.",
    },
    {
      id: "edge-walk", kind: "find", noHint: true,
      targets: ["stray-clip", "unlatched-barrier"],
      itemNames: { "stray-clip": "a spare anchor clip left on the sill", "unlatched-barrier": "the barrier not re-latched across the bay" },
      itemNotes: {
        "stray-clip": "A spare clip is sitting loose on the sill track above the now-closed bay. It goes back in the tote, not left where the next unit's frame will ride over it.",
        "unlatched-barrier": "The barrier across this bay was swung open to work the joint and never latched back. The bay is closed by the unit now, but the barrier still has to be right for the next crew.",
      },
      title: "Walk the bay again before the hoist swings to the next unit",
      cue: "Look at the sill and the barrier — click the two things that must be right before the davit moves.",
      why: "The bay reads as closed now that the unit is anchored, but the sill still carries a spare clip that can ride under the next frame, and the barrier that was opened to work this joint is still the crew's own responsibility to close. The davit does not swing to the next unit on the stack until both are answered.",
    },
    {
      id: "unit-log", kind: "select", target: "unit-log",
      title: "Log the unit",
      cue: "Unit number, torque readings, the plumb reading against the neighbour, wind readings and the faults found and fixed, and sign it.",
      why: "The log ties this unit's anchor torque and plumb reading to a date and a name, which is what the crew shows when a joint opens up two winters from now and somebody asks whether it was set to the manufacturer's numbers. It also carries the barrier fault as fixed rather than assumed, for the crew that opens this bay again tomorrow.",
    },
  ],

  interrupts: [
    {
      id: "gust-swing",
      kind: "Gust through the open bay",
      after: "clip-hold", delay: 3, seconds: 12,
      alert: "A gust has come straight through the open bay and the unit is swinging on the hook toward the mullions on the far side.",
      cue: "The unit is loose on the hook again and swinging.",
      target: "unit-brace",
      why: "A unit that has come off the sill in a gust is a sail on a hook with nothing damping it, and the mullions either side of this bay are aluminium extrusions, not fenders. The temporary brace clamped across from the anchored neighbour is what stops the swing without anyone putting a hand in its path — the alignment jack can be wound again once it is still.",
      missNote: "The unit swung until the gust dropped on its own. It missed the mullion by less than its own thickness. The brace exists for exactly the two minutes between a unit coming off the sill and the wind deciding to stop, and this time the wind decided first.",
      wrongNote: "It is the unit brace, clamped from the anchored unit beside it. Stop the swing before anyone reaches for the frame.",
    },
    {
      id: "walker-under-load",
      kind: "Someone under the hook",
      after: "sealant-track", delay: 3, seconds: 11,
      alert: "A labourer has walked under the davit's boom to reach the unit stack for a strap, directly under the next unit's lift path.",
      cue: "Someone is standing under the load path while your hands are on the sealant.",
      target: "davit-estop",
      why: "The davit's load path is fixed by where the boom is set, and a person under it has no way to know from where they are standing that the next lift starts there. The hoist's emergency stop takes the davit out of play the moment anyone is in that path — the bead can be finished a minute later, the walk under a boom about to lift cannot be undone.",
      missNote: "The labourer got the strap and walked out on their own. The davit never lifted while they were under it, this time. The load path under that boom does not change because the person under it did not know where it was.",
      wrongNote: "It is the davit's emergency stop. Take the hoist out of play before anything else, and call the labourer clear.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.3, GLCW_ACCENT);

    // ------------------------------------------------------------ the floor
    const deck = box(g, 6.6, 0.06, 6.2, 0, 0.03, -0.2, 0x8b8d89, { rough: 0.9, cast: false });
    deck.material = texturedMat(
      surfaceTexture((cx, w, h) => concreteFace(cx, w, h, { finish: "broom" }), { repeat: 5, px: 512 }),
      { rough: 0.92, metal: 0.05 });

    // ------------------------------------------------------- the curtain wall
    const wall = group(g, 0, 0.06, -2.6);
    // Already-anchored units either side of the open bay.
    for (const sx of [-2.1, 2.1]) {
      const unitFrame = box(wall, 1.7, 3.6, 0.16, sx, 1.8, 0, 0x3a332c, { rough: 0.45, metal: 0.55 });
      unitFrame.material = texturedMat(surfaceTexture((cx, w, h) => stainlessFace(cx, w, h, { base: "#3a332c", base2: "#2c2720" }), { repeat: 2, px: 256 }), { rough: 0.4, metal: 0.55 });
      box(wall, 1.5, 3.4, 0.02, sx, 1.8, 0.09, 0x9fd6e6, { rough: 0.15, metal: 0.1, opacity: 0.55, transparent: true, cast: false });
      for (let i = 1; i < 4; i++) box(wall, 1.5, 0.05, 0.1, sx, i * 0.9, 0.1, 0x3a332c, { rough: 0.45, metal: 0.55, cast: false });
    }
    // The floor slab edge and spandrel above the open bay.
    box(wall, 6.6, 0.9, 0.3, 0, 3.9, -0.1, 0x8b8d89, { rough: 0.9, finish: "concrete", cast: false });
    holoTag(wall, "Elevation 4 — Bay 12", 0, 4.5, -0.05, { css: "#36b7c9", w: 0.42 });

    // The sill and head track at the open bay.
    const sillTrack = box(wall, 1.7, 0.1, 0.14, 0, 0.1, 0.05, 0xaeb5bb, { rough: 0.4, metal: 0.7 });
    hits["sill-track"] = sillTrack;
    const headTrack = box(wall, 1.7, 0.1, 0.14, 0, 3.5, 0.05, 0xaeb5bb, { rough: 0.4, metal: 0.7 });
    holoTag(wall, "sill track — bay 12", 0, -0.15, 0.1, { css: "#36b7c9", w: 0.32 });
    // Anchor clips on the sill.
    const clips = [];
    for (const sx of [-0.55, 0.55]) clips.push(box(wall, 0.1, 0.08, 0.06, sx, 0.16, 0.1, 0x8a8f94, { rough: 0.4, metal: 0.7 }));
    const clipObj = group(wall, -0.55, 0.16, 0.1);
    box(clipObj, 0.1, 0.08, 0.06, 0, 0, 0, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, clipObj, "anchor-clip");
    const clipPinch = box(wall, 0.14, 0.1, 0.08, -0.55, 0.16, 0.12, 0xd2312b, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, clipPinch, "clip-pinch");
    const bolt = group(wall, 0.55, 0.16, 0.1);
    box(bolt, 0.04, 0.04, 0.04, 0, 0, 0, 0xd8b23a, { rough: 0.45, metal: 0.7 });
    reg(hits, bolt, "clip-bolt");
    holoTag(wall, "anchor clip · bolt", 0, 0.4, 0.1, { css: "#36b7c9", w: 0.28 });
    const jack = group(wall, 0, -0.35, 0.1);
    cyl(jack, 0.02, 0.02, 0.3, 0, 0, 0, 0x8a8f94, { rough: 0.4, metal: 0.7, seg: 10 }).rotation.x = Math.PI / 2;
    reg(hits, jack, "alignment-jack");
    holoTag(wall, "alignment jack", 0, -0.55, 0.1, { css: "#36b7c9", w: 0.28 });
    const shimBase = group(wall, 0.2, 0.05, 0.12);
    box(shimBase, 0.12, 0.02, 0.05, 0, 0, 0, 0xf2c14b, { rough: 0.6 });
    reg(hits, shimBase, "shim-base");
    const plumbCheck = group(wall, 0.7, 1.8, 0.12);
    box(plumbCheck, 0.02, 0.02, 0.02, 0, 0, 0, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, plumbCheck, "plumb-check");
    const shimLock = group(wall, -0.2, 0.05, 0.12);
    box(shimLock, 0.1, 0.02, 0.05, 0, 0, 0, 0x8a8f94, { rough: 0.5, metal: 0.5 });
    reg(hits, shimLock, "shim-lock");
    holoTag(wall, "shims — base · lock", -0.2, 0.28, 0.12, { css: "#36b7c9", w: 0.32 });
    const plumbInst = instrument(wall, -0.9, 1.8, 0.35, { ry: 0.3, idle: "-- mm", color: 0x36b7c9 });
    reg(hits, plumbInst, "plumb-instrument");
    holoTag(wall, "plumb instrument", -0.9, 2.05, 0.35, { css: "#36b7c9", w: 0.3 });

    // The vertical joint between the new unit and the left-hand neighbour.
    const joint = group(wall, -1.25, 1.8, 0.12);
    const rod = cyl(joint, 0.012, 0.012, 3.2, 0, 0, -0.01, 0x9aa3a8, { rough: 0.9, seg: 8 });
    rod.rotation.x = Math.PI / 2;
    rod.visible = false;
    reg(hits, rod, "backer-rod");
    const beadMesh = box(joint, 0.02, 3.2, 0.01, 0, 0, 0.005, 0x4a4a4a, { rough: 0.8 });
    beadMesh.visible = false;
    const tool = group(joint, 0.1, -1.4, 0.05);
    box(tool, 0.02, 0.1, 0.02, 0, 0, 0, 0x22262b, { rough: 0.6 });
    box(tool, 0.04, 0.02, 0.01, 0, 0.06, 0, 0x8a8f94, { rough: 0.5, metal: 0.6 });
    reg(hits, tool, "joint-tool");
    holoTag(joint, "joint — rod, bead, tool", 0, 2.0, 0.05, { css: "#36b7c9", w: 0.4 });

    // Barrier and toe-board across the open bay.
    const barrier = group(wall, 0, 0.06, 0.5);
    box(barrier, 1.7, 0.9, 0.03, 0, 0.55, 0, 0xf2c14b, { rough: 0.6, cast: false });
    const gap = box(barrier, 0.6, 0.9, 0.12, -0.5, 0.55, -0.06, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    gap.rotation.y = 0.3;
    reg(hits, gap, "barrier-gap");
    holoTag(barrier, "barrier — bay 12", 0, 1.1, 0, { css: "#36b7c9", w: 0.3 });
    const toeBoard = box(g, 1.7, 0.1, 0.12, 0, 0.06, -1.7, 0x8a7449, { rough: 0.85 });
    toeBoard.material = texturedMat(surfaceTexture((cx, w, h) => safetyStripeFace(cx, w, h), { repeat: 2, px: 256 }), { rough: 0.7 });
    toeBoard.position.x = 0.3;
    reg(hits, toeBoard, "loose-plank");
    const streetDrop = box(g, 1.7, 0.02, 0.4, 0, -0.4, -1.9, 0x1b1e22, { opacity: 0.6, transparent: true, cast: false });
    reg(hits, streetDrop, "open-floor-edge");
    holoTag(g, "street below — open bay", 0, -0.1, -1.9, { css: "#d2312b", w: 0.4 });

    // ------------------------------------------------------------ the unit stack
    const stack = group(g, 2.6, 0.06, 1.5, -0.3);
    box(stack, 1.9, 0.06, 0.5, 0, 0.03, 0, 0x50606c, { rough: 0.7, metal: 0.3 });
    const stackedUnits = [];
    for (let i = 0; i < 2; i++) { const u = box(stack, 1.6, 1.9, 0.12, -0.15 + i * 0.14, 1.0, 0, 0x3a332c, { rough: 0.45, metal: 0.5 }); stackedUnits.push(u); }
    const cwUnit = group(stack, 0.25, 1.0, 0, 0.1);
    box(cwUnit, 1.6, 1.9, 0.12, 0, 0, 0, 0x453d34, { rough: 0.45, metal: 0.5 });
    box(cwUnit, 1.4, 1.7, 0.02, 0, 0, 0.08, 0x9fd6e6, { rough: 0.15, metal: 0.1, opacity: 0.6, transparent: true, cast: false });
    reg(hits, cwUnit, "cw-unit");
    const bareEdge = box(cwUnit, 1.44, 0.06, 0.05, 0, 0.85, 0.09, 0xd2312b, { opacity: 0.35, transparent: true, cast: false });
    reg(hits, bareEdge, "bare-glass-edge");
    holoTag(stack, "unit — by the frame", 0.25, 2.1, 0.1, { css: "#36b7c9", w: 0.42 });
    const swingHazard = box(g, 1.7, 1.9, 0.2, 1.3, 1.6, -0.6, 0xf2ae14, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, swingHazard, "unit-swing-wind");

    // ------------------------------------------------------------ the davit
    const davitBase = group(g, 0.7, 0.06, 0.6);
    box(davitBase, 0.4, 0.06, 0.4, 0, 0.03, 0, 0x2b2f34, { rough: 0.6, metal: 0.4 });
    const mast = cyl(davitBase, 0.06, 0.06, 3.6, 0, 1.83, 0, 0xaeb5bb, { rough: 0.45, metal: 0.65, seg: 12 });
    const boom = group(davitBase, 0, 3.5, 0);
    box(boom, 2.6, 0.1, 0.1, 1.3, 0, 0, 0xaeb5bb, { rough: 0.45, metal: 0.65 });
    const trolley = group(boom, 1.9, -0.1, 0);
    box(trolley, 0.16, 0.1, 0.14, 0, 0, 0, 0x2b2f34, { rough: 0.55, metal: 0.4 });
    const hookChain = hose(trolley, [[0, -0.05, 0], [0, -1.0, 0], [0, -1.6, 0]], 0.014, 0x22262b, { steps: 6 });
    const hook = group(trolley, 0, -1.7, 0);
    cyl(hook, 0.05, 0.05, 0.16, 0, 0, 0, 0xf2c14b, { rough: 0.5, seg: 10 });
    const ctrl = group(davitBase, -0.5, 1.1, 0.3);
    box(ctrl, 0.3, 0.3, 0.14, 0, 0, 0, 0x22262b, { rough: 0.6 });
    for (let i = 0; i < 3; i++) box(ctrl, 0.05, 0.05, 0.05, -0.08 + i * 0.08, 0.06, 0.08, 0x2b2f34, { rough: 0.5 });
    reg(hits, ctrl, "davit-controls");
    const estop = cyl(ctrl, 0.03, 0.03, 0.03, 0.1, -0.08, 0.08, 0xd2312b, { rough: 0.4, seg: 14 });
    reg(hits, estop, "davit-estop");
    holoTag(davitBase, "davit controls · stop", -0.5, 1.4, 0.3, { css: "#36b7c9", w: 0.36 });
    const brace = group(g, 0.9, 0.06, -1.1, 0.4);
    box(brace, 1.0, 0.05, 0.05, 0, 1.6, 0, 0x1b1e22, { rough: 0.6 });
    brace.visible = false;
    reg(hits, brace, "unit-brace");
    const anemometer = instrument(g, -2.0, 1.1, -0.6, { ry: 0.4, idle: "-- km/h", color: 0x36b7c9, w: 0.12, d: 0.17 });
    for (let i = 0; i < 3; i++) { const a = (i / 3) * Math.PI * 2; ball(anemometer, 0.015, Math.sin(a) * 0.05, 0.12, Math.cos(a) * 0.05, 0x22262b, { rough: 0.5 }); }
    reg(hits, anemometer, "anemometer");
    holoTag(g, "anemometer", -2.0, 1.4, -0.6, { css: "#36b7c9", w: 0.26 });

    // ------------------------------------------------------------ anchor and harness
    const anchor = group(g, -1.6, 0.9, 0.8);
    box(anchor, 0.12, 0.12, 0.06, 0, 0, 0, 0x2b2f34, { rough: 0.6, metal: 0.5 });
    const ring = cyl(anchor, 0.05, 0.05, 0.02, 0, 0.06, 0, 0xd2312b, { rough: 0.5, metal: 0.5, seg: 14 });
    ring.rotation.x = Math.PI / 2;
    reg(hits, anchor, "tie-off-anchor");
    holoTag(g, "interior anchor point", -1.6, 1.15, 0.8, { css: "#36b7c9", w: 0.3 });
    const harnessBag = group(g, -1.9, 0.06, 1.0, 0.3);
    box(harnessBag, 0.3, 0.16, 0.2, 0, 0.08, 0, 0x2b2f34, { rough: 0.8 });
    const webbing = box(harnessBag, 0.26, 0.04, 0.16, 0, 0.18, 0, 0x36b7c9, { rough: 0.85 });
    reg(hits, webbing, "harness-webbing");
    const lanyard = hose(harnessBag, [[0.1, 0.2, 0.05], [0.25, 0.3, 0.1], [0.4, 0.25, 0.05]], 0.012, 0x36b7c9, { steps: 10 });
    const snap = box(harnessBag, 0.05, 0.08, 0.02, 0.42, 0.25, 0.05, 0x8a8f94, { rough: 0.4, metal: 0.7 });
    reg(hits, snap, "lanyard-snap");
    holoTag(g, "harness · lanyard", -1.9, 0.4, 1.0, { css: "#36b7c9", w: 0.3 });

    // The stray anchor clip left on the sill, and the barrier re-open, for the
    // second walk-around, plus the sealant gun and tools.
    const strayClip = box(g, 0.1, 0.08, 0.06, -0.3, 0.16, -2.1, 0x8a8f94, { rough: 0.4, metal: 0.7 });
    reg(hits, strayClip, "stray-clip");
    const barrierOpen = box(g, 1.7, 0.9, 0.03, 0, 0.55, -1.6, 0xf2c14b, { rough: 0.6, cast: false });
    barrierOpen.rotation.y = 0.35;
    reg(hits, barrierOpen, "unlatched-barrier");
    holoTag(g, "sill — spare clip?", -0.3, 0.4, -2.1, { css: "#f2ae14", w: 0.3 });
    const gun = group(g, 1.0, 0.1, 0.9, -0.3);
    cyl(gun, 0.025, 0.025, 0.24, 0, 0, 0, 0x36b7c9, { rough: 0.5, seg: 12 }).rotation.z = Math.PI / 2;
    box(gun, 0.06, 0.08, 0.02, -0.06, -0.05, 0, 0x22262b, { rough: 0.6 });
    reg(hits, gun, "sealant-gun");
    holoTag(g, "sealant gun", 1.0, 0.35, 0.9, { css: "#36b7c9", w: 0.24 });
    level(g, -2.3, 0.06, 1.6, { ry: 0.3 });
    tapeMeasure(g, -2.5, 0.06, 1.0, { ry: 0.6 });

    // ------------------------------------------------------- tailboard and log
    const tailboard = group(g, -2.5, 0.7, -0.8, 1.4);
    box(tailboard, 0.5, 0.4, 0.03, 0, 0.35, 0, 0x1b2026, { rough: 0.6 });
    const tailFace = decal(tailboard, 0.46, 0.36, 0, 0.35, 0.018, paperFace("TAILBOARD — BAY 12", ["Open: bay 12, floor 4", "Ground: helper, tag line", "Wind limit: per the davit's rating", "Barrier: latch across bay", "Stop work: gust over limit"], { bg: "#eef1f3", band: "#36b7c9" }), { px: 320 });
    reg(hits, tailFace, "tailboard");
    holoTag(g, "tailboard", -2.5, 1.25, -0.8, { css: "#36b7c9", w: 0.22 });
    const logBoard = group(g, 2.6, 0.7, -2.0, -1.4);
    box(logBoard, 0.4, 0.34, 0.03, 0, 0.3, 0, 0x1b2026, { rough: 0.6 });
    const logFace = decal(logBoard, 0.36, 0.3, 0, 0.3, 0.018, paperFace("UNIT LOG — BAY 12", ["Unit: ____", "Torque: ____", "Plumb: ____", "Wind: ____", "Signed: ____"], { bg: "#f4efe4", band: "#36b7c9" }), { px: 256 });
    reg(hits, logFace, "unit-log");
    holoTag(g, "unit log", 2.6, 1.15, -2.0, { css: "#36b7c9", w: 0.22 });
    holoPanel(g, 0.6, 0.42, -2.9, 1.7, -0.8, (ctx, w, h) => {
      ctx.fillStyle = "#0a1a1e"; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#36b7c9"; ctx.fillRect(0, 0, w, 6);
      ctx.font = `600 ${Math.round(h * 0.13)}px 'Barlow Condensed', Arial, sans-serif`; ctx.textAlign = "left"; ctx.textBaseline = "middle"; ctx.fillStyle = "#eaf8fb";
      ctx.fillText("ERECTION SCHEDULE — BAY 12", w * 0.06, h * 0.16);
      ctx.font = `${Math.round(h * 0.09)}px Arial, sans-serif`;
      ["Unit: 1600 x 3600 IGU", "Clip torque: per the manufacturer's manual", "Sealant: listed silicone, per the drawing depth", "Shim per plan at sill", "Plumb tolerance: per the erection drawings"].forEach((l, i) => ctx.fillText(l, w * 0.06, h * (0.34 + i * 0.13)));
    }, { accent: GLCW_ACCENT, ry: 0.5, stalk: true });

    // ----------------------------------------------------------- the crew
    const journeyman = standingFigure(g, 1.6, 1.3, { ry: -2.4, cloth: 0x2b5a6e, trousers: 0x2b2f34, helmet: 0x36b7c9, vest: 0xf2c14b, harness: true, gloves: true });
    const groundHand = standingFigure(g, 2.2, 2.0, { ry: -2.0, cloth: 0x7a5a3a, trousers: 0x22262b, helmet: 0xf2c14b, vest: 0xf2c14b });

    // --------------------------------------------------------- dressing
    for (const [x, z] of [[-2.9, 2.3], [3.0, 2.3]]) cone(g, x, z);
    barrierPanel(g, 3.0, -1.4, { ry: 0.3, w: 1.0, color: 0xf2c14b });

    let holdingClip = false;
    return {
      hits,
      spawnLook: new THREE.Vector3(0, 1.6, -2.0),
      onStep() {},
      onStepComplete(step) {
        if (step.id === "harness") { snap.parent.remove(snap); anchor.add(snap); snap.position.set(0, 0.1, 0.03); snap.rotation.set(0, 0, 0); }
        if (step.id === "unit-drag") { cwUnit.parent.remove(cwUnit); wall.add(cwUnit); cwUnit.position.set(0, 1.8, 0.12); cwUnit.rotation.set(0, 0, 0); }
        if (step.id === "align-jack") { jack.scale.y = 1.4; }
        if (step.id === "bolt-torque") { for (const c of clips) c.material = mat(0x36b7c9, { rough: 0.4, metal: 0.7 }); }
        if (step.id === "sealant-track") { beadMesh.visible = true; }
        if (step.id === "joint-seq") { rod.visible = true; beadMesh.material = mat(0x3a3a3a, { rough: 0.6 }); }
        if (step.id === "floor-walk") { gap.visible = false; toeBoard.position.z = -1.66; }
        if (step.id === "edge-walk") { strayClip.visible = false; barrierOpen.rotation.y = 0; }
        if (step.id === "unit-log") repaint(logFace, paperFace("UNIT LOG — BAY 12", ["Unit: bay 12, 4th floor", "Torque: per manual, pass", "Plumb: 0.3 mm to neighbour", "Wind: 12–16 km/h", "Signed: apprentice / journeyman"], { bg: "#f4efe4", band: "#36b7c9" }));
      },
      onHazard() {},
      onInterrupt(it) {
        if (it.id === "gust-swing") { cwUnit.rotation.z = 0.25; }
        if (it.id === "walker-under-load") { groundHand.rotation.y = 1.0; groundHand.position.set(0.6, 0, 0.4); }
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "gust-swing") { cwUnit.rotation.z = 0; brace.visible = true; }
        if (it.id === "walker-under-load") { groundHand.rotation.y = -2.0; groundHand.position.set(2.2, 0, 2.0); }
      },

      animate(t, dt, session) {
        const step = session?.step;
        holdingClip = !!(step?.id === "clip-hold" && session.holding);
        const gg = session?.gauge;
        if (gg && !gg.committed && step?.id === "wind-read") {
          repaint(anemometer.userData.screen, signFace(`${(gg.t * 38).toFixed(0)} km/h`, { bg: "#0d1c24", accent: gg.t >= 0.18 && gg.t <= 0.48 ? "#59c97b" : "#f2ae14", fg: "#f5eed8", scale: 0.6 }));
        }
        if (gg && !gg.committed && step?.id === "plumb-gauge") {
          repaint(plumbInst.userData.screen, signFace(`${((gg.t - 0.5) * 40).toFixed(1)}`, { bg: "#0d1c24", accent: gg.t > 0.43 && gg.t < 0.6 ? "#59c97b" : "#f2ae14", fg: "#bfeaf7", scale: 0.55 }));
        }
        const tn = session?.turn;
        if (tn && step?.id === "bolt-torque") { for (const b of bolt.children) b.rotation.y = tn.amount * Math.PI * 4; }
        const tr = session?.track;
        if (tr && step?.id === "sealant-track") { beadMesh.visible = true; beadMesh.scale.y = Math.min(1, tr.inBand / 5); beadMesh.position.y = -1.6 + beadMesh.scale.y * 1.6; }
        if (holdingClip) cwUnit.position.y = 1.8 + Math.sin(t * 3) * 0.004;
        if (!brace.visible) cwUnit.rotation.z *= (1 - Math.min(1, dt * 0.5));
      },
    };
  },
};
