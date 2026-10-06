import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, ball, slab, torus, group, decal, repaint, signFace, particles, mat,
} from "../../../shared/kit.js";
import {
  CITY, stationPad, holoPanel, holoTag, toolChest, instrument, cone, barrierPanel,
  standingFigure, valveWheel, reg, surfaceTexture, texturedMat,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Living Shoreline VR — Water & Environmental, station seventy-seven.
//
// Marine construction on a generic bay shoreline restoration reach beside a
// former shipyard — not any one site, and no claim about any one site's
// history. This station is the trade procedure a shoreline crew runs on Bay
// Area restoration work generally: read the tide before the first log goes
// in, hold sediment inside a curtain the Water Board can hold you to, place
// coir and shell to a surveyor's stakes rather than by eye, plant cordgrass
// at the one elevation it actually survives at, fence the upland edge so the
// bank does not undo what the curtain protects, and walk the reach on the
// falling tide because the flood that follows is the only inspection nobody
// scheduled.

const LVS_ACCENT = 0x5f9e5a;

export const SIM_LIVING_SHORELINE = {
  id: "living-shoreline",
  index: "77",
  domain: "Environmental",
  trade: "Marine construction laborer / living shoreline crew",
  category: "Water & Environmental",
  // Marsh work is filed with the water trades and done at the bay's edge:
  // stand it in front of the bay, not a treatment works.
  district: "Environmental Monitoring",
  weather: "wind",
  certification: "Pile Drivers Local 34 (United Brotherhood of Carpenters) marine construction; LIUNA laborers; U.S. Army Corps of Engineers Clean Water Act (CWA) Section 404 permit conditions; San Francisco Bay Conservation and Development Commission (BCDC) permit; San Francisco Bay Regional Water Quality Control Board CWA Section 401 water quality certification; seasonal in-water work window for fish protection; OSHA 29 CFR 1926 waterfront construction",
  name: "Living Shoreline",
  title: simTitle("Living Shoreline"),
  tagline: "Building a living shoreline on a falling tide: curtain set and tensioned, coir and oyster shell to the stakes, cordgrass at grade, silt fence at the edge, and the reach walked before the flood takes anything back",
  accent: LVS_ACCENT,
  accentCss: "#5f9e5a",
  parSeconds: 290,
  footprint: 2.4,
  badge: { id: "reach-secured", name: "Reach Secured", note: "The whole reach placed to grade, curtain tight, and nothing left for the flood to take — first time" },

  game: system({
    name: "Shoreline Crew",
    currency: "TIDE",
    ranks: ["Laborer", "Crew Hand", "Lead Hand", "Site Steward", "Shoreline Certified"],
    badges: [
      { id: "baseline-read", name: "Baseline Read", note: "Turbidity baseline read clean before the first log went in", test: AWARD.stepClean("curtain-check") },
      { id: "grade-true", name: "Grade True", note: "Planting elevation and turbidity both read inside the working band", test: AWARD.precise(0.7) },
      { id: "nothing-adrift", name: "Nothing Adrift", note: "Never a hazard, never anything left for the tide to take", test: AWARD.safe },
    ],
    challenges: [
      { id: "clean-reach", name: "Clean Reach", note: "No corrections across the whole reach", test: AWARD.clean },
      { id: "steady-haul", name: "Steady Haul", note: "Held the root wad steady the whole haul", test: AWARD.unbroken },
      { id: "ahead-of-flood", name: "Ahead Of The Flood", note: "Reach secured inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "channel-wade": "You waded past the curtain into open water to reach the far side of the reach. The curtain marks the edge of a controlled work zone for a reason: past it the bottom drops away and the same current the curtain is built to resist is the current that takes a person off their feet. A boat crosses open water; nobody wades it.",
    "curtain-gap": "You left the curtain's overlap seam unclipped. A turbidity curtain is only as good as its weakest joint, and an open seam is a wider hole than the rest of the curtain closed — every log and bag placed after this point stirs sediment straight through the gap into water the 401 certification measures against a limit, not an intention.",
    "manual-lift-rootwad": "You went to muscle the root wad up by hand instead of walking it in on the tag line. A root wad this size is a wet, unbalanced load with no grip anywhere on it; a back is not rated for it and there is no come-along for a strained back once it happens. It moves on a line, at a walking pace, or it does not move today.",
    "silt-fence-breach": "You cut a shortcut through the silt fence to save a walk around with the wheelbarrow. The fence is the only thing between the upland spoil pile and the reach on the next rain, and a foot-wide gap in it is a foot-wide channel for everything upslope to wash straight down into the exact water the curtain in front of you is also trying to protect.",
  },

  lateNotes: {
    "curtain-turnbuckle": "Tension the anchor after the curtain is laid across the reach — there is nothing to tension on a curtain that is not out yet.",
    "turbidity-meter": "Read turbidity after the curtain is tensioned. A reading against a slack curtain is not the baseline every log placement will be judged against.",
    "cordgrass-plugs": "Plant after the grade is checked with the level rod. Planting first just means digging them back up when the elevation turns out wrong.",
    "silt-fence-panel": "The fence goes up after the bench work is done — set first, it blocks the path the logs and bags still need to come in on.",
  },

  // Interruptions: see shared/game.js. Both are the bay doing what the bay
  // does regardless of the crew's plan — the tide moving faster than the
  // table said, and a wake finding the one anchor that had already worked
  // loose.
  interrupts: [
    {
      id: "tide-turning-early",
      kind: "Tide turning early",
      after: "haul-rootwad", delay: 4, seconds: 14,
      alert: "The ebb has stalled early and the tide staff at the water's edge shows the flat is already turning — there is far less bare mud out there than the table promised.",
      cue: "The water is coming back sooner than planned. Read the staff, not the table.",
      target: "tide-staff",
      why: "A tide table is a prediction built on the moon and an average; wind and barometric pressure push the real water by tens of minutes either way on an ordinary day. The staff gauge is what the water is actually doing right now, and it is the only thing worth trusting once the two disagree — the flat does not care what the table said, it cares what the water is doing.",
      missNote: "The crew kept working the table's schedule while the real tide came in around their boots, and coir and shell bags went in half-soaked with nobody able to tell what had been set and what the water had already moved for them. Reading the staff afterward does not undo a tide that already turned.",
      wrongNote: "That is not it. The tide staff at the water's edge is the only true reading of where the water actually is right now — nothing else on this bank tells you that.",
    },
    {
      id: "curtain-drag",
      kind: "Curtain anchor dragging",
      after: "plant", delay: 4, seconds: 13,
      alert: "A tug's wake off the channel has set the turbidity curtain surging, and its downstream anchor is walking loose along the mud.",
      cue: "Your curtain is coming off its line. Re-tension it before it drags clear.",
      target: "curtain-turnbuckle",
      why: "The curtain only does the job its permit assumes while its anchors hold it against the bottom; an anchor that has walked loose opens a gap the next wake finds first, and everything the crew has stirred up this afternoon goes straight out through it into water the 401 certification exists to protect. It is re-tensioned the moment it is seen dragging, not watched to see whether it settles on its own.",
      missNote: "The anchor kept walking and the curtain lifted off the bottom on the next wake, and the afternoon's turbidity went straight past the one control the permit was relying on — exactly the reading the Water Board's own downstream station would have caught and logged as a violation.",
      wrongNote: "It's the curtain's own anchor turnbuckle. Nothing else on this bank puts the skirt back down against the bottom.",
    },
  ],

  steps: [
    {
      id: "tide", kind: "select", target: "tide-table",
      title: "Read the tide table before the first log goes in",
      cue: "Check today's low tide window and how much working time it actually gives you on the flat.",
      why: "The whole day's sequence — curtain, logs, bags, plantings — is timed to a falling tide that exposes the toe of the bank and a rising one that will drown the same ground a few hours later. Reading the table first is what turns a full day of work into a plan instead of a race against water that was always coming back on its own schedule.",
    },
    {
      id: "permit", kind: "select", target: "permit-board",
      title: "Check the permit conditions before work starts",
      cue: "Read the Corps' 404 conditions, the BCDC permit, the Water Board's 401 certification, and the in-water work window.",
      why: "A Bay shoreline is worked under four signatures at once: the Corps' Clean Water Act (CWA) Section 404 permit, the Bay Conservation and Development Commission's own permit, the Regional Water Quality Control Board's 401 water quality certification, and a seasonal fish window that shuts the whole job down outside it. Missing any one of those conditions is not a paperwork problem — it is work that has to be undone.",
    },
    {
      id: "stage", kind: "sequence", anyOrder: true,
      targets: ["stage-waders", "stage-pfd", "stage-gloves"],
      itemNames: { "stage-waders": "chest waders", "stage-pfd": "life vest", "stage-gloves": "gloves" },
      title: "Stage for working the tideline",
      cue: "Waders, a life vest, and gloves before anyone steps onto the flat.",
      why: "The footing here is soft mud over a falling tide, close enough to open water that a slip is a swim, not a stumble. Waders keep the cold bay water and whatever the mud is holding off skin that will be in it all day; the vest is buoyancy the moment the mud gives way; gloves are for the oyster shell and the wire on the coir bales, both of which cut clean through bare skin.",
    },
    {
      id: "layout", kind: "find", noHint: true,
      targets: ["stake-1", "stake-2", "stake-3"],
      itemNames: { "stake-1": "stake 1 — upstream end", "stake-2": "stake 2 — mid-reach", "stake-3": "stake 3 — downstream end" },
      itemNotes: {
        "stake-1": "Stake 1 marks the upstream end of the design reach. The coir toe starts here, not wherever the bank looks convenient this morning.",
        "stake-2": "Stake 2 is the mid-reach control — it is what tells the crew the toe line is still following the surveyed curve and not drifting straight.",
        "stake-3": "Stake 3 marks the downstream end. Past it, whatever gets placed is not part of the permitted design and does not count toward it.",
      },
      title: "Find the survey stakes that set the design template",
      cue: "Walk the reach and click the three stakes the whole design is built from.",
      why: "Everything that goes into this reach — curtain line, log toe, bag line, planting grade — is set against stakes a surveyor already put in, not against where the ground looks right today. Finding all three before anything is placed is what keeps four separate crew tasks building the same permitted design instead of four honest approximations of it.",
    },
    {
      id: "curtain-deploy", kind: "drag", target: "turbidity-curtain",
      title: "Deploy the turbidity curtain across the reach",
      cue: "Carry the curtain out and clip it along the line between the anchors.",
      why: "Every log placed and every root wad set stirs sediment into water that the 401 certification requires to stay inside a turbidity limit outside the work area. The curtain, marked and lit to Coast Guard (USCG) standard where it crosses open water, is what makes the difference between sediment that stays inside the work zone and sediment that becomes a violation the Water Board can measure from its own station downstream.",
      drag: { to: "curtain-line", radius: 0.5, missNote: "Not on the line — the curtain has to run the full width of the reach or the current finds the gap on the first ebb." },
    },
    {
      id: "curtain-tension", kind: "turn", target: "curtain-turnbuckle",
      title: "Tension the curtain's anchor turnbuckle",
      cue: "Wind the turnbuckle until the curtain skirt hangs plumb, not bellied out by the current.",
      why: "A curtain that is only clipped on hangs loose the moment the tide starts moving water along the reach, and a loose curtain rides up off the bottom and lets everything under it go straight out with the ebb. The turnbuckle is what keeps the skirt down against a moving current instead of only against still water on a calm afternoon.",
      turn: { turns: 0.8, axis: "y", label: "CURTAIN ANCHOR" },
    },
    {
      id: "curtain-check", kind: "gauge", target: "turbidity-meter",
      title: "Read turbidity inside the curtain against the outside station",
      cue: "Take the reading and commit it against the permit's differential limit.",
      why: "The 401 certification is not written against an absolute number — it is written against how much murkier the water inside the curtain is allowed to be than the water outside it. Reading it now, before the first log stirs anything, is what gives every reading taken for the rest of the day a real baseline to be judged against instead of a guess.",
      gauge: { label: "TURBIDITY", speed: 0.7, green: [0.4, 0.6], readout: (t) => `${Math.round(t * 40)} NTU`, missNote: "Outside the differential the permit allows. Let the reading settle against the outside station and commit inside the band." },
    },
    {
      id: "coir-logs", kind: "sequence",
      targets: ["coir-1", "coir-2", "coir-3"],
      itemNames: { "coir-1": "coir log at stake 1", "coir-2": "coir log at stake 2", "coir-3": "coir log at stake 3" },
      title: "Set the coir logs to the stakes, upstream to downstream",
      cue: "Place the coir logs against stakes 1, then 2, then 3, in that order.",
      why: "Coir logs are laid upstream first so each one keys against the log already down rather than leaving a gap the current finds on day one. Placed out of order, the downstream log takes the full force of water the upstream log was supposed to break first, and it is the one that moves on the next tide.",
      outOfOrderNote: "Upstream to downstream — stake 1, then stake 2, then stake 3. A downstream log with nothing keyed above it takes load the design never asked it to carry alone.",
    },
    {
      id: "oyster-bags", kind: "sequence", anyOrder: true,
      targets: ["oyster-1", "oyster-2", "oyster-3"],
      itemNames: { "oyster-1": "oyster shell bag — upstream", "oyster-2": "oyster shell bag — mid-reach", "oyster-3": "oyster shell bag — downstream" },
      title: "Place the oyster shell bags at the toe",
      cue: "Set all three bags against the base of the coir, wherever the toe needs the extra armor.",
      why: "The shell bags are not a sequence the way the logs are — each one goes wherever the toe reads thinnest that day, judged by eye against the log that is already down. There is no fixed order to follow here, only three bags that all have to be down before the tide comes back over them.",
    },
    {
      id: "haul-rootwad", kind: "track", target: "haul-rootwad", seconds: 7,
      title: "Haul the root wad anchor into position",
      cue: "Walk the root wad down the bench at a steady pull, holding it in the working range.",
      why: "A root wad this size is muscled into place at a walking pace on a taut tag line, not muscled at a dead lift. Too fast and it swings and takes somebody's legs out from under them on wet ground; too slow and it drops into the mud and has to be dug back out before it can be moved another metre.",
      track: { start: 0.1, green: [0.38, 0.58], rise: 0.55, fall: 0.45, drift: 0.12, label: "HAUL", readout: (v) => (v < 0.38 ? "stalled in the mud" : v > 0.58 ? "swinging, too fast" : "steady pull") },
      holdBreakNote: "The pull broke and the root wad settled into the mud short of the mark. Get the line taut again and bring it back to a steady pull.",
    },
    {
      id: "elevation", kind: "gauge", target: "level-rod",
      title: "Check the planting grade with the level rod",
      cue: "Read the rod against the design elevation and commit it in the planting band.",
      why: "Cordgrass only survives in a narrow band of the tidal frame — too low and it drowns on every high tide, too high and it never gets wet enough to establish. The level rod read against the design elevation is the only thing standing between a planting that becomes marsh and one that becomes an expensive, short-lived lawn.",
      gauge: { label: "GRADE", speed: 0.72, green: [0.42, 0.6], readout: (t) => `${(t * 2.2).toFixed(2)} m MLLW`, missNote: "Off the design elevation. Read the rod again at the marked point before a single plug goes in." },
    },
    {
      id: "plant", kind: "hold", target: "cordgrass-plugs", seconds: 5,
      title: "Set the cordgrass plugs at grade",
      cue: "Hold each plug in and tamp the mud around it until the roots are seated.",
      why: "A plug set at grade and let go immediately floats free on the next high water. Held and tamped until the mud closes back around the roots, it is anchored by the same tide everything else on this reach is built to work with instead of against.",
      holdBreakNote: "Let go before the mud closed around it — that plug is loose on the next tide. Reset it and hold until it is seated.",
    },
    {
      id: "silt-fence", kind: "drag", target: "silt-fence-panel",
      title: "Install the silt fence at the upland edge",
      cue: "Carry the fence panel to the line above the marsh bench and set the stakes.",
      why: "The curtain protects the bay from what happens in the water; the silt fence protects the bay from what happens on the bank. Loose spoil and stockpiled soil have nowhere to go in a rainstorm except downhill into the same reach the curtain is guarding, so both controls are permit conditions and neither one substitutes for the other.",
      drag: { to: "silt-fence-line", radius: 0.5, missNote: "Not on the line — the fence has to run the full upland edge or the runoff finds the gap the same night it rains." },
    },
    {
      id: "walk", kind: "find", noHint: true,
      targets: ["drift-flag", "loose-bag-tie"],
      itemNames: { "drift-flag": "the loose survey flag", "loose-bag-tie": "the untied shell bag strap" },
      itemNotes: {
        "drift-flag": "A survey flag is pushed in by hand, not driven — this one is already leaning and will be floating free by the top of the flood.",
        "loose-bag-tie": "One shell bag's tie strap has come loose. Untied, the shell inside it is free to wash out of the bag and off the toe on the first real tide.",
      },
      title: "Walk the reach before the flood",
      cue: "Look over everything placed today and click anything that will float off on the incoming tide.",
      why: "The flood tide is the test nobody scheduled: it finds every strap that was not quite cinched and every stake that was pushed in by hand instead of driven home. Walking the reach now, on the falling tide, is the only chance anybody gets to fix what the water will otherwise take with it in a few hours.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.4, LVS_ACCENT);

    // ---------------------------------------------------------------- terrain
    // Everything sits at or above y=0 so it reads above the shared plaza disc
    // rather than disappearing into it: upland bank at the top, a marsh bench
    // where the restoration work happens, then mudflat and open water toward
    // the far edge — all raised, none of it sunk below the deck.
    const upland = box(g, 5.4, 0.3, 1.5, 0, 0.15, 1.65, 0x5a4a34, { rough: 0.96 });
    void upland;
    const sod = box(g, 5.4, 0.02, 1.5, 0, 0.311, 1.65, 0x4a6a3c, { rough: 0.95, cast: false });
    void sod;
    const slopeA = box(g, 5.4, 0.34, 0.55, 0, 0.13, 0.78, 0x4d3f2c, { rough: 0.96 });
    slopeA.rotation.x = 0.34;
    const bench = box(g, 5.4, 0.12, 1.05, 0, 0.06, 0.05, 0x4f4632, { rough: 0.95 });
    void bench;
    const slopeB = box(g, 5.4, 0.13, 0.32, 0, 0.03, -0.62, 0x453a28, { rough: 0.96 });
    slopeB.rotation.x = 0.24;

    // Mudflat and water: textured with citykit's surfaceTexture rather than a
    // flat colour, so the exposed flat and the open bay both read as
    // something other than a coloured plane.
    const mudTex = surfaceTexture((cx, w, h) => {
      cx.fillStyle = "#5a4a30"; cx.fillRect(0, 0, w, h);
      for (let i = 0; i < 900; i++) {
        const v = Math.random();
        cx.fillStyle = `rgba(${v > 0.5 ? "70,58,38" : "40,32,20"},${(0.05 + v * 0.1).toFixed(3)})`;
        cx.fillRect(Math.random() * w, Math.random() * h, 2 + Math.random() * 6, 1 + Math.random() * 2);
      }
      for (let i = 0; i < 30; i++) {
        cx.strokeStyle = "rgba(30,24,14,0.25)"; cx.lineWidth = 1 + Math.random() * 2;
        cx.beginPath(); const y = Math.random() * h;
        cx.moveTo(0, y); cx.bezierCurveTo(w * 0.3, y + 12, w * 0.6, y - 12, w, y); cx.stroke();
      }
    }, { repeat: 3, px: 256 });
    const mudflat = box(g, 5.4, 0.03, 0.55, 0, 0.015, -1.05, 0x5a4a30, { rough: 0.95, cast: false });
    mudflat.material = texturedMat(mudTex, { rough: 0.95, color: 0x8a7a58 });

    const waterTex = surfaceTexture((cx, w, h) => {
      cx.fillStyle = "#1c4a52"; cx.fillRect(0, 0, w, h);
      for (let i = 0; i < 26; i++) {
        cx.strokeStyle = "rgba(180,220,225,0.10)"; cx.lineWidth = 1 + Math.random() * 2;
        cx.beginPath(); const y = Math.random() * h;
        cx.moveTo(0, y); cx.bezierCurveTo(w * 0.25, y + 16, w * 0.75, y - 16, w, y); cx.stroke();
      }
    }, { repeat: 4, px: 256 });
    const water = box(g, 5.4, 0.03, 1.15, 0, 0.012, -1.95, 0x1c4a52, { rough: 0.2, metal: 0.3, opacity: 0.88, transparent: true, cast: false });
    water.material = texturedMat(waterTex, { rough: 0.2, metal: 0.25, color: 0x2c6a72 });
    water.material.transparent = true;
    water.material.opacity = 0.88;

    const wave = particles(g, 26, 0xbfe6f2, { size: 0.03, life: 0.9, additive: false, opacity: 0.4 });
    wave.position.set(0, 0.03, -2.1);

    // -------------------------------------------------------- upland station
    const tideTable = holoPanel(g, 0.85, 0.6, -1.85, 1.05, 1.85, (cx, w, h) => {
      cx.fillStyle = "#0d1c14"; cx.fillRect(0, 0, w, h); cx.fillStyle = "#5f9e5a"; cx.fillRect(0, 0, w, 6);
      cx.font = `600 ${Math.round(h * 0.1)}px 'Barlow Condensed', Arial, sans-serif`; cx.textAlign = "left"; cx.textBaseline = "middle";
      cx.fillStyle = "#dff3d8"; cx.fillText("TODAY'S TIDE — REACH 3", w * 0.06, h * 0.13);
      cx.font = `${Math.round(h * 0.075)}px Arial, sans-serif`; cx.fillStyle = "#e7f7e0";
      ["Low water: 0742 · +0.4 ft MLLW", "Working window: approx. 4.5 h", "High water returns: 1338",
       "In-water work window open", "Confirm against the staff at the water"].forEach((l, i) => cx.fillText(l, w * 0.06, h * (0.3 + i * 0.115)));
    }, { ry: 0.5, accent: LVS_ACCENT });
    reg(hits, tideTable, "tide-table");

    const permitBoard = holoPanel(g, 0.9, 0.62, 1.9, 1.08, 1.85, (cx, w, h) => {
      cx.fillStyle = "#0d1c14"; cx.fillRect(0, 0, w, h); cx.fillStyle = "#5f9e5a"; cx.fillRect(0, 0, w, 6);
      cx.font = `600 ${Math.round(h * 0.1)}px 'Barlow Condensed', Arial, sans-serif`; cx.textAlign = "left"; cx.textBaseline = "middle";
      cx.fillStyle = "#dff3d8"; cx.fillText("PERMIT CONDITIONS — REACH 3", w * 0.06, h * 0.13);
      cx.font = `${Math.round(h * 0.072)}px Arial, sans-serif`; cx.fillStyle = "#e7f7e0";
      ["USACE CWA §404 permit — this reach", "BCDC permit — bay fill / restoration", "RWQCB CWA §401 water quality cert.",
       "Turbidity: inside curtain vs. outside", "In-water window: Jun 1 – Nov 30 only"].forEach((l, i) => cx.fillText(l, w * 0.06, h * (0.3 + i * 0.11)));
    }, { ry: -0.5, accent: LVS_ACCENT });
    reg(hits, permitBoard, "permit-board");

    const chest = toolChest(g, 0, 1.85, { color: 0x2f6f4a });
    for (const [id, dx, color, label] of [["stage-waders", -0.2, 0x8a6a4a, "WADERS"], ["stage-pfd", 0.0, 0xe8b02e, "VEST"], ["stage-gloves", 0.2, 0x2f4d3a, "GLOVES"]]) {
      const it = group(chest, dx, 0.95, -0.12);
      box(it, 0.14, 0.08, 0.1, 0, 0, 0, color, { rough: 0.8 });
      decal(it, 0.12, 0.04, 0, 0.041, 0, signFace(label, { bg: "#0d1c14", accent: "#dff3d8", scale: 0.5 })).rotation.x = -Math.PI / 2;
      reg(hits, it, id);
    }
    const crewUpland = standingFigure(g, 0.9, 1.5, { ry: -0.9, cloth: 0x2f4d3a, vest: 0xe8b02e });
    void crewUpland;

    // Tide staff at the water's edge — the physical reading the interruption
    // asks for, distinct from the forecast board on the bank.
    const staff = group(g, 2.1, 0.02, -1.85);
    box(staff, 0.07, 0.9, 0.03, 0, 0.45, 0, 0xf2f6fa, { rough: 0.7 });
    for (let i = 1; i < 9; i++) box(staff, 0.07, 0.01, 0.032, 0, i * 0.1, 0.002, i % 3 === 0 ? 0xd2312b : 0x1b1e23, { rough: 0.7, cast: false });
    holoTag(staff, "tide staff — read it, not the table", 0, 1.05, 0, { css: "#5f9e5a", w: 0.5 });
    reg(hits, staff, "tide-staff");

    // ---------------------------------------------------------- survey stakes
    const stakes = {};
    for (const [id, x, label] of [["stake-1", -1.5, "STAKE 1"], ["stake-2", 0, "STAKE 2"], ["stake-3", 1.5, "STAKE 3"]]) {
      const st = group(g, x, 0.12, 0.15);
      cyl(st, 0.012, 0.014, 0.55, 0, 0.27, 0, 0xc9b58c, { rough: 0.9, seg: 8 });
      box(st, 0.09, 0.06, 0.01, 0, 0.5, 0, 0xe8622a, { rough: 0.75 });
      decal(st, 0.08, 0.04, 0, 0.5, 0.006, signFace(label, { bg: "#1b1e12", accent: "#dff3d8", scale: 0.55 }));
      reg(hits, st, id);
      stakes[id] = st;
    }

    // ---------------------------------------------------------- turbidity curtain
    // Staged bundle before deployment; replaced by the deployed curtain group
    // (floats, skirt, anchors) once the drag lands.
    const bundle = group(g, -2.25, 0.12, 0.35, 0.4);
    cyl(bundle, 0.09, 0.09, 0.6, 0, 0.09, 0, 0xe8b02e, { rough: 0.7, seg: 14 }).rotation.z = Math.PI / 2;
    holoTag(bundle, "turbidity curtain — furled", 0, 0.28, 0, { css: "#5f9e5a", w: 0.44 });
    reg(hits, bundle, "turbidity-curtain");

    const curtain = group(g, 0, 0, -0.75);
    curtain.visible = false;
    for (let x = -2.2; x <= 2.2; x += 0.55) {
      cyl(curtain, 0.035, 0.035, 0.5, x, 0.34, 0, 0xe8b02e, { rough: 0.6, seg: 10 }).rotation.z = Math.PI / 2;
    }
    const skirt = slab(curtain, 4.6, 0.32, 0.02, 0, 0.16, 0, 0x2b5a6a, { rough: 0.6, opacity: 0.72, transparent: true, cast: false });
    void skirt;
    const socket = group(curtain, 0, 0.15, 0);
    hits["curtain-line"] = socket;

    const turnbuckleGrp = group(g, -1.85, 0.06, -0.95);
    const turnbuckle = valveWheel(turnbuckleGrp, 0, 0.1, 0, { r: 0.08, color: 0xe8b02e, body: 0x2b5a6a });
    holoTag(turnbuckleGrp, "curtain anchor turnbuckle", 0, 0.34, 0, { css: "#5f9e5a", w: 0.5 });
    reg(hits, turnbuckle.userData.wheel, "curtain-turnbuckle");

    const meter = instrument(g, 1.55, 0.14, -0.85, { idle: "-- NTU", color: 0x5f9e5a, w: 0.12, d: 0.19 });
    holoTag(g, "turbidity meter", 1.55, 0.32, -0.85, { css: "#5f9e5a", w: 0.32 });
    reg(hits, meter, "turbidity-meter");

    const gapHit = box(g, 0.3, 0.3, 0.15, 2.3, 0.2, -0.75, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "leave the seam unclipped?", 2.3, 0.5, -0.75, { css: "#e8622a", w: 0.5 });
    reg(hits, gapHit, "curtain-gap");

    const wadeHit = box(g, 2.6, 0.4, 0.9, 0, 0.02, -2.1, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "wade out past the curtain?", -1.7, 0.25, -2.1, { css: "#e8622a", w: 0.5 });
    reg(hits, wadeHit, "channel-wade");

    // ------------------------------------------------------------- coir & shell
    const coirLogs = {};
    for (const [id, x] of [["coir-1", -1.5], ["coir-2", 0], ["coir-3", 1.5]]) {
      const log = cyl(g, 0.09, 0.09, 0.75, x, 0.16, -0.28, 0xa08a54, { rough: 0.95, seg: 12 });
      log.rotation.z = Math.PI / 2;
      holoTag(g, "coir log", x, 0.32, -0.28, { css: "#5f9e5a", w: 0.22 });
      reg(hits, log, id);
      coirLogs[id] = log;
    }
    const oysterBags = {};
    for (const [id, x] of [["oyster-1", -1.2], ["oyster-2", 0.05], ["oyster-3", 1.25]]) {
      const bag = box(g, 0.22, 0.12, 0.16, x, 0.13, -0.5, 0xc9c2ac, { rough: 0.98 });
      holoTag(g, "shell bag", x, 0.26, -0.5, { css: "#5f9e5a", w: 0.2 });
      reg(hits, bag, id);
      oysterBags[id] = bag;
    }

    // Root wad hauled in from a staging point down the bench to its anchor
    // position near the mudflat edge.
    const rootHome = new THREE.Vector3(2.05, 0.14, -0.35);
    const rootwad = group(g, -2.25, 0.14, -0.15);
    cyl(rootwad, 0.13, 0.13, 0.9, 0, 0, 0, 0x8a6a44, { rough: 0.96, seg: 12 }).rotation.z = Math.PI / 2;
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      cyl(rootwad, 0.02, 0.01, 0.35, 0.42, 0.14 * Math.sin(a), 0.14 * Math.cos(a), 0x6a5636, { rough: 0.95, seg: 6 });
    }
    holoTag(rootwad, "root wad — walk it in", 0, 0.3, 0, { css: "#5f9e5a", w: 0.4 });
    reg(hits, rootwad, "haul-rootwad");
    const liftHit = box(g, 0.4, 0.4, 0.4, -2.25, 0.5, -0.15, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "muscle it up solo?", -2.25, 0.75, -0.15, { css: "#e8622a", w: 0.4 });
    reg(hits, liftHit, "manual-lift-rootwad");

    // ------------------------------------------------------------- planting
    const rod = group(g, 0.6, 0.12, -0.15);
    cyl(rod, 0.014, 0.014, 1.1, 0, 0.55, 0, 0xf2f6fa, { rough: 0.6, seg: 8 });
    for (let i = 1; i < 10; i++) box(rod, 0.05, 0.01, 0.03, 0, i * 0.11, 0.017, i % 5 === 0 ? 0xd2312b : 0x1b1e23, { rough: 0.7, cast: false });
    const gradeReadout = instrument(rod, 0.12, 0.5, 0, { idle: "-- m", color: 0x5f9e5a, w: 0.12, d: 0.18 });
    holoTag(rod, "level rod", 0, 1.2, 0, { css: "#5f9e5a", w: 0.24 });
    reg(hits, rod, "level-rod");

    const plugTray = group(g, 2.15, 0.13, 0.35);
    box(plugTray, 0.42, 0.05, 0.28, 0, 0.025, 0, 0x2b3138, { rough: 0.7 });
    const plugs = [];
    for (let i = 0; i < 6; i++) {
      const px = -0.16 + (i % 3) * 0.16, pz = -0.08 + Math.floor(i / 3) * 0.16;
      const plug = cyl(plugTray, 0.02, 0.02, 0.14, px, 0.12, pz, 0x3f6b3a, { rough: 0.9, seg: 8 });
      plugs.push(plug);
    }
    holoTag(plugTray, "cordgrass plugs", 0, 0.3, 0, { css: "#5f9e5a", w: 0.36 });
    reg(hits, plugTray, "cordgrass-plugs");

    // ------------------------------------------------------------- silt fence
    const fencePanel = group(g, -2.25, 0.3, 1.15, 0.3);
    for (let i = 0; i < 3; i++) box(fencePanel, 0.02, 0.5, 0.02, -0.4 + i * 0.4, 0.25, 0, 0x8a939b, { rough: 0.6, metal: 0.5 });
    slab(fencePanel, 0.9, 0.4, 0.01, 0, 0.28, 0, 0x1b1e23, { rough: 0.8, opacity: 0.85, transparent: true, cast: false });
    holoTag(fencePanel, "silt fence — staged", 0, 0.62, 0, { css: "#5f9e5a", w: 0.4 });
    reg(hits, fencePanel, "silt-fence-panel");
    const fenceLine = group(g, 0, 0.3, 0.9);
    hits["silt-fence-line"] = fenceLine;
    const breachHit = box(g, 0.4, 0.4, 0.2, -2.35, 0.4, 0.9, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "step through the fence line?", -2.35, 0.7, 0.9, { css: "#e8622a", w: 0.48 });
    reg(hits, breachHit, "silt-fence-breach");

    // ------------------------------------------------------------- walk-round
    const flag = group(g, -1.0, 0.13, -0.65, 0.5);
    cyl(flag, 0.008, 0.008, 0.4, 0, 0.2, 0, 0xc9b58c, { rough: 0.9, seg: 6 });
    box(flag, 0.07, 0.05, 0.006, 0, 0.36, 0, 0xe8622a, { rough: 0.7 });
    reg(hits, flag, "drift-flag");
    const looseTie = box(g, 0.05, 0.03, 0.04, 1.25, 0.16, -0.55, 0xc9c2ac, { rough: 0.9 });
    reg(hits, looseTie, "loose-bag-tie");

    cone(g, -2.4, 2.2, { color: LVS_ACCENT });
    cone(g, 2.4, 2.2, { color: LVS_ACCENT });
    barrierPanel(g, 0, 2.3, { color: 0xe8b02e });
    const spray = particles(g, 20, 0xbfe6f2, { size: 0.025, life: 0.7, additive: false, opacity: 0.35 });
    spray.position.set(0, 0.05, -1.05);

    let plantedCount = 0, curtainDragging = false;

    return {
      hits,
      spawnLook: new THREE.Vector3(0.2, 1.0, -0.2),
      onStep() {},

      onStepComplete(step) {
        if (step.id === "curtain-deploy") {
          bundle.visible = false;
          curtain.visible = true;
        }
        if (step.id === "coir-logs") {
          for (const log of Object.values(coirLogs)) log.material = mat(0x7a6238, { rough: 0.98 });
        }
        if (step.id === "oyster-bags") {
          for (const bag of Object.values(oysterBags)) bag.material = mat(0xa89e82, { rough: 0.98 });
        }
        if (step.id === "haul-rootwad") {
          rootwad.position.copy(rootHome);
        }
        if (step.id === "plant") {
          plantedCount = plugs.length;
        }
        if (step.id === "silt-fence") {
          fencePanel.parent.remove(fencePanel);
          fenceLine.add(fencePanel);
          fencePanel.position.set(0, 0, 0);
          fencePanel.rotation.set(0, 0, 0);
        }
        if (step.id === "walk") {
          flag.visible = false;
          looseTie.visible = false;
        }
      },

      // Both interruptions really change the scene: the tide staff reading
      // climbs, and the curtain's own anchor visibly drags along the mud.
      onInterrupt(it) {
        if (it.id === "tide-turning-early") {
          water.position.z += 0.35;
          water.scale.x = 1.15;
        }
        if (it.id === "curtain-drag") {
          curtainDragging = true;
          turnbuckleGrp.position.x -= 0.22;
          skirt.material = mat(0xe8622a, { rough: 0.6, opacity: 0.7, transparent: true, emissive: 0xe8622a, ei: 0.6, cast: false });
        }
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "tide-turning-early") {
          water.position.z -= 0.35;
          water.scale.x = 1.0;
        }
        if (it.id === "curtain-drag") {
          curtainDragging = false;
          turnbuckleGrp.position.x += 0.22;
          skirt.material = mat(0x2b5a6a, { rough: 0.6, opacity: 0.72, transparent: true, cast: false });
        }
      },

      onHazard() {},

      animate(t, dt, session) {
        wave.visible = true;
        wave.userData.step(dt, new THREE.Vector3(0, 0.02, -2.4), 1.4, 0.35, -0.1);
        spray.visible = true;
        spray.userData.step(dt, new THREE.Vector3(0, 0.06, -1.05), 0.6, 0.3, -0.2);
        water.position.y = 0.012 + Math.sin(t * 1.2) * 0.006;
        if (curtainDragging) turnbuckleGrp.rotation.y = Math.sin(t * 4) * 0.1;
        for (let i = 0; i < plantedCount; i++) plugs[i].position.y = 0.12 + Math.sin(t * 1.5 + i) * 0.002;

        const gg = session?.gauge;
        if (gg && !gg.committed) {
          if (session.step?.id === "curtain-check") {
            repaint(meter.userData.screen, signFace(`${Math.round(gg.t * 40)} NTU`, { bg: "#0d1c14", accent: gg.t >= 0.4 && gg.t <= 0.6 ? "#59c97b" : "#f2ae14", fg: "#dff3d8", scale: 0.6 }));
          }
          if (session.step?.id === "elevation") {
            repaint(gradeReadout.userData.screen, signFace(`${(gg.t * 2.2).toFixed(2)} m`, { bg: "#0d1c14", accent: gg.t >= 0.42 && gg.t <= 0.6 ? "#59c97b" : "#f2ae14", fg: "#dff3d8", scale: 0.6 }));
          }
        }
      },
    };
  },
};
