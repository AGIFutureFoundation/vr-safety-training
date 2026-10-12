import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, ball, torus, slab, lathe, group, decal, repaint, signFace, particles, mat,
} from "../../../shared/kit.js";
import {
  CITY, stationPad, holoPanel, holoTag, instrument, standingFigure, reg,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Grill Line Burns VR — its own gamified system: Cool Under Fire.
// The grill and sauté station, and the burn drill every line cook drills
// whether or not the shift ever needs it. Awareness comes first — handles
// turned in, a dry towel, a call before you turn — and the first-aid chain
// after a burn is the same chain whether the cause was a wet towel tonight
// or nothing at all, which is exactly why it is practised on its own.

const GLB_ACCENT = 0xe8542f;

export const SIM_GRILL_LINE_BURNS = {
  id: "grill-line-burns",
  index: "115",
  domain: "Culinary & Hospitality",
  trade: "Line cook — grill / sauté",
  category: "Culinary & Hospitality",
  indoor: "kitchen",
  certification: "UNITE HERE Local 2 line cooks; OSHA 29 CFR 1910.151 medical services and first aid; Cal/OSHA's general industry safety orders; NFPA 96 ventilation control and fire protection of commercial cooking operations, especially the grease baffle filters a flambé never gets lit near; NSF/ANSI 4 commercial cooking equipment; the American Burn Association's first-aid guidance for thermal burns",
  name: "Grill Line Burns",
  title: simTitle("Grill Line Burns"),
  tagline: "The grill and sauté line: handles in, a dry pan, calls through the aisle, a flambé clear of the filters, and the burn drill run cold",
  accent: GLB_ACCENT,
  accentCss: "#e8542f",
  parSeconds: 245,
  footprint: 2.4,
  badge: { id: "cool-under-fire", name: "Cool Under Fire", note: "A clean line walk and a burn drill run to the full twenty minutes" },

  game: system({
    name: "Cool Under Fire",
    currency: "SEARS",
    ranks: ["Line Trainee", "Line Cook", "Sauté Station", "Line Lead", "Cool Under Fire Certified"],
    badges: [
      { id: "never-ice-butter", name: "Never Ice, Never Butter", note: "Never reached for either on a burn", test: AWARD.safe },
      { id: "clean-line-walk", name: "Clean Line Walk", note: "No corrections anywhere on the line", test: AWARD.clean },
      { id: "full-twenty", name: "The Full Twenty", note: "Held the cool-water drill for the full count", test: AWARD.unbroken },
    ],
    challenges: [
      { id: "line-ready-fast", name: "Line Ready Fast", note: "Set up inside 80% of par", test: AWARD.fast(0.8) },
      { id: "one-pass-line", name: "One-Pass Line", note: "Line walk clean on the first pass", test: AWARD.stepClean("line-walk") },
      { id: "seven-straight-line", name: "Seven Straight", note: "Seven correct actions in a row", test: AWARD.streak(7) },
    ],
  }),

  hazards: {
    "ice-bucket": "That's the ice bucket. Ice on a burn drives the tissue temperature down hard and fast enough to add a cold-injury on top of the heat injury already there — the American Burn Association calls for cool running water, never ice, for exactly this reason.",
    "butter-dish": "Butter on a burn is a line-cook myth that will not die: it does nothing to stop the burn going deeper, it seals heat in rather than drawing it out, and it hands the clinic a wound they now have to clean grease out of before they can even look at it.",
    "wet-pan-oil": "That pan still has water beading in it. Oil poured into a wet pan spatters the instant it hits the water, and it spatters upward, toward the hand holding the bottle — the pan gets wiped bone dry before anything goes in it, every time.",
    "filter-flambe": "That's directly under the grease baffle filters. A flambé's open flame reaching a filter loaded with rendered grease is exactly the fire NFPA 96 is written to keep out of a duct — the pan gets pulled clear of the hood before it gets lit, not lit and then moved.",
  },

  lateNotes: {
    "burn-station-sink": "Not yet — the cool-water drill starts once the burn is actually identified, not before.",
    "cover-clean": "The dressing goes on after the full cool-water count, not instead of it.",
  },

  steps: [
    {
      id: "shift-board", kind: "select", target: "shift-board",
      title: "Read the shift board",
      cue: "Check tonight's line assignment and who is running the flambé station.",
      why: "The board tells you who is on the grill, who is on sauté, and whether flambé service is running tonight at all — a line cook stepping onto a station cold, not knowing whether an open flame is coming off it in twenty minutes, is exactly how a call of 'behind' arrives at somebody who wasn't expecting one.",
    },
    {
      id: "line-walk", kind: "find", noHint: true,
      targets: ["handle-out", "wet-towel-near-flame", "missing-drip-pan"],
      itemNames: {
        "handle-out": "the pan handle turned into the aisle",
        "wet-towel-near-flame": "the wet towel draped by the burner",
        "missing-drip-pan": "the gap where the fryer's drip pan should be",
      },
      itemNotes: {
        "handle-out": "A handle sticking into the walkway is a handle anybody passing can catch with a hip or an elbow, and a full pan comes with it.",
        "wet-towel-near-flame": "A damp towel left by an open flame is the towel somebody grabs half a second from now without checking — and a wet towel over a hot handle turns to steam against your palm before you can let go.",
        "missing-drip-pan": "No drip pan under the fryer means the floor under it is collecting grease instead, and a grease-slicked tile at a station full of open flame is a slip that lands somebody in the fire, not just on the ground.",
      },
      decoyNotes: {
        "dry-towel-stack": "Those towels are dry and stacked where they belong. Leave them.",
      },
      title: "Walk the line before service",
      cue: "Three things on this line are not right. Find them before the first ticket comes in.",
      why: "Every one of these gets checked with your own eyes before service starts, because none of them look wrong from across the kitchen — a handle out, a wet towel and a missing drip pan are all things you only actually notice by walking the station, and by then it may already be somebody's hand.",
    },
    {
      id: "dry-pan-check", kind: "select", target: "dry-pan",
      title: "Confirm the sauté pan is dry",
      cue: "Take the pan that's been wiped bone dry, not the one still beaded with rinse water.",
      why: "A pan straight off the rack can still be carrying rinse water nobody would call wet from across the station — oil hitting even a few droplets of it spatters instantly, and it spatters toward whoever is standing over the pan pouring.",
    },
    {
      id: "oil-temp", kind: "gauge", target: "oil-pan",
      title: "Heat the oil to shimmer, not smoke",
      cue: "Bring the oil up and commit once it's shimmering, before it starts smoking.",
      why: "Shimmering oil is at temperature and ready for food; smoking oil is past its flash point and already breaking down, which is the difference between a sear and a flare the moment the protein hits the pan. The window between the two is short enough that this is read by watching the pan, not by guessing at a burner setting.",
      gauge: { label: "OIL — SHIMMER POINT", speed: 0.7, green: [0.55, 0.74], readout: (t) => (t < 0.55 ? "still cold" : t > 0.74 ? "smoking — past it" : "shimmering"), missNote: "Off the window — too cold does nothing to the food and too far past shimmer is already smoking. Bring it back before anything goes in." },
    },
    {
      id: "food-to-pan", kind: "drag", target: "protein-tray",
      title: "Carry the protein to the hot pan",
      cue: "Pick up the portioned tray and set it into the hot oil.",
      why: "The protein goes into the pan the moment the oil is at temperature, not before and not a long minute after — held too long next to a pan that's already shimmering, it's oil breaking down for nothing, and dropped in too early it never sears at all.",
      drag: { to: "oil-pan", radius: 0.5, missNote: "Not into the pan — set the tray directly into the hot oil, not onto the rail beside it." },
    },
    {
      id: "sheet-pan-calls", kind: "sequence",
      targets: ["call-hot", "call-behind"],
      itemNames: { "call-hot": "\"hot\" — pulling the sheet pan", "call-behind": "\"behind\" — moving through the aisle" },
      title: "Call it through the kitchen",
      cue: "Call \"hot\" pulling the sheet pan from the oven, then \"behind\" carrying it back through the aisle.",
      why: "Nobody behind you can see a sheet pan coming out of an oven at shoulder height, and nobody in front of you can see you closing on their back — the two calls cover the two blind spots in order, the oven first and the aisle second, because that is the order your body actually moves through them.",
      outOfOrderNote: "Call \"hot\" coming out of the oven, then \"behind\" moving through the aisle — the order matches the two moments someone else can't see you coming.",
    },
    {
      id: "flambe-clear", kind: "drag", target: "flambe-pan",
      title: "Clear the flambé off the hood",
      cue: "Move the flambé pan onto the open flat-top space, clear of the baffle filters overhead.",
      why: "Grease-laden filters sit right over the range for a reason that has nothing to do with a flambé — they exist to keep the duct clean, and an open flame reaching one of them lights the one thing in the room built out of accumulated fat. The pan moves to open space before it moves to fire.",
      drag: { to: "flambe-clear-zone", radius: 0.5, missNote: "Still under the hood line. Slide the pan out to the open flat-top before lighting anything." },
    },
    {
      id: "flambe-ignite", kind: "hold", target: "flambe-pan", seconds: 5,
      title: "Hold the flambé under control",
      cue: "Tilt the pan to the burner and hold the flame steady for the full count, clear of the hood.",
      why: "A flambé's flame is controlled by the angle of the pan and how long it's held there, not by how dramatic it looks — held too long or tipped too far, the flame reaches higher than the cook standing over it planned for, over a station full of fabric and other people's hands.",
      holdBreakNote: "You pulled the pan back before the flame settled. A flambé cut short and re-lit is more fuel vapour meeting the same flame a second time, closer to your hand than the first.",
    },
    {
      id: "cool-water", kind: "hold", target: "burn-station-sink", seconds: 8,
      title: "Run the burn under cool water",
      cue: "Hold the burned hand under cool running water for the drill count.",
      why: "The American Burn Association calls for cool — not cold, not iced — running water for a full twenty minutes, because that is how long it actually takes to carry heat out of the tissue below the skin's surface. This drill compresses the clock, but the standard it is teaching does not: on a real burn, the full twenty minutes is not optional.",
      holdBreakNote: "You pulled the hand out early. A burn that stops cooling before the full twenty minutes is a burn that keeps damaging tissue underneath skin that already looks fine on top.",
    },
    {
      id: "burn-assess", kind: "gauge", target: "burn-chart",
      title: "Read the size and depth",
      cue: "Read the burn against the chart and commit once you've placed it correctly for the clinic decision.",
      why: "OSHA's first-aid standard draws the line at how a burn is read, not how it feels: a small superficial burn is managed on-site, but anything partial-thickness larger than a few inches, or anything on the hand at all, is a clinic referral. Reading it correctly is what decides which of those two happens next.",
      gauge: { label: "BURN — SIZE / DEPTH", speed: 0.6, green: [0.6, 0.82], readout: (t) => (t < 0.4 ? "minor — superficial" : t > 0.82 ? "overcalled" : "partial thickness — refer"), missNote: "Not read correctly against the chart — a burn this size on a hand is a clinic referral, not a wrap-and-return-to-station call." },
    },
    {
      id: "burn-response", kind: "sequence",
      targets: ["cover-clean", "clinic-referral"],
      itemNames: { "cover-clean": "clean, dry dressing", "clinic-referral": "clinic referral" },
      title: "Cover the burn, then refer it",
      cue: "Cover the burn loosely with a clean, dry dressing, then confirm the clinic referral the size and depth call for.",
      why: "The dressing protects the burn on the way to care, it is not the care itself — covering it and sending the worker back to the line without the referral the assessment already called for is treating the bandage as the endpoint instead of the trip to the clinic it's meant to get them to.",
      outOfOrderNote: "Cover it first, then refer it — a referral means nothing if the open burn travels there uncovered, and a dressing means nothing if it's the last thing that happens.",
    },
    {
      id: "incident-log", kind: "select", target: "incident-board",
      title: "Log the incident",
      cue: "Record the burn, the cause and the response on the incident report.",
      why: "OSHA's recordkeeping rule and the union's own safety committee both read this log, and a burn that never gets written up is a repeat waiting to happen on the same station with nobody able to point at the pattern — this is the only record that a wet towel by this burner has already caused a problem once.",
    },
    {
      id: "close-check", kind: "select", target: "close-board",
      title: "Reset the line for the next shift",
      cue: "Confirm the drip pans are emptied and the floor mats are down and clean before you clock out.",
      why: "A grease-slicked tile under tomorrow's opening cook is the same fall risk it was under you tonight, and Cal/OSHA's duty to keep a walking surface clean and dry doesn't end when your shift does — the mats and drip pans are reset for whoever is standing on this line next, not just for the rest of tonight.",
    },
  ],

  interrupts: [
    {
      id: "runner-behind",
      kind: "Blind approach",
      after: "food-to-pan", delay: 4, seconds: 11,
      alert: "A runner is jogging up behind you with a stock box, and you're about to swing a hot sauté pan off the flame toward the pass.",
      cue: "Something is closing on your back. Call it before you turn.",
      target: "runner-alert",
      why: "A pan coming off an open flame moves through the exact space behind a cook that they can't see, and the call is what buys the half-second a runner needs to stop rather than walk into a pan already swinging toward the pass.",
      missNote: "You swung the pan without calling it. The runner walked into the space you were already moving through, and a hot pan meeting a moving person is how a kitchen burn becomes two people's injury instead of a near miss.",
      wrongNote: "It's the runner closing on your back. Call it now, before the pan starts moving.",
    },
    {
      id: "wet-towel-grab",
      kind: "Reach hazard",
      after: "flambe-ignite", delay: 3, seconds: 10,
      alert: "A hand is reaching for the wet towel hanging by the burner to grab the flambé pan's handle.",
      cue: "That towel is wet. The dry stack is right there.",
      target: "dry-towel-rack",
      why: "A wet towel conducts heat straight through to the skin almost as fast as no towel at all — the water in it flashes to steam against a hot handle, and what should have been a routine grab becomes the burn this whole drill exists to answer.",
      missNote: "The wet towel closed around a hot handle. Steam came off it in the same second the hand did, and the burn drill that follows this station exists because of exactly this reach.",
      wrongNote: "It's the wet towel by the burner. Grab the dry one off the rack instead — a hot handle through a wet towel is a burn every time.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.4, GLB_ACCENT);

    // Anti-fatigue mat under the range.
    slab(g, 2.0, 0.02, 0.9, -0.9, 0.012, -1.5, 0x1c2024, { radius: 0.04, rough: 0.95, cast: false });
    for (let i = 0; i < 6; i++) for (let j = 0; j < 2; j++) {
      box(g, 0.09, 0.006, 0.09, -1.8 + i * 0.3, 0.024, -1.85 + j * 0.3, 0x101316, { cast: false, receive: false });
    }

    // ------------------------------------------------------------- shift board
    const shiftBoard = holoPanel(g, 0.5, 0.34, -2.6, 1.5, -0.6, (ctx, w, h) => {
      ctx.fillStyle = "rgba(20,6,4,0.9)"; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#e8542f"; ctx.fillRect(0, 0, w, 5);
      ctx.fillStyle = "#f2c1a8";
      ctx.font = `600 ${Math.round(h * 0.1)}px 'Barlow Condensed', Arial, sans-serif`;
      ctx.textAlign = "left"; ctx.textBaseline = "middle";
      ctx.fillText("TONIGHT'S LINE", w * 0.06, h * 0.16);
      ctx.fillStyle = "#fbeae0";
      ctx.font = `${Math.round(h * 0.1)}px Arial, sans-serif`;
      ["Grill: station 1", "Sauté / flambé: station 2", "Runner on the floor tonight"].forEach((line, i) => ctx.fillText(line, w * 0.06, h * (0.4 + i * 0.16)));
    }, { ry: 0.5, accent: GLB_ACCENT });
    reg(hits, shiftBoard, "shift-board");

    // ------------------------------------------------------------- range / sauté line
    const range = group(g, -1.4, 0, -1.8);
    box(range, 2.2, 0.86, 0.7, 0, 0.6, 0, 0x4e5a63, { rough: 0.32, metal: 0.78 });
    box(range, 2.2, 0.06, 0.72, 0, 0.92, 0, 0x2f3439, { rough: 0.5, metal: 0.5 });
    const burners = [];
    for (let i = 0; i < 3; i++) {
      const bx = -0.7 + i * 0.7;
      const b = group(range, bx, 0.95, 0);
      cyl(b, 0.1, 0.12, 0.03, 0, 0, 0, 0x1b1e22, { rough: 0.75, seg: 16 });
      const flame = cyl(b, 0.018, 0.07, 0.055, 0, 0.02, 0, 0x4aa3ff, { emissive: 0x2f7fff, ei: 2.2, rough: 0.4, opacity: 0.7, seg: 12, cast: false });
      flame.visible = i === 1;
      burners.push(flame);
    }
    // Sauté pan, dry and correct, on the middle burner.
    const dryPanGroup = group(range, 0, 0.99, 0);
    lathe(dryPanGroup, [[0.001, 0], [0.095, 0.004], [0.108, 0.045], [0.112, 0.055], [0.105, 0.052], [0.09, 0.008], [0.001, 0.003]],
      0, 0, 0, 0x4a4f55, { rough: 0.35, metal: 0.7, seg: 20 });
    const dryHandle = cyl(dryPanGroup, 0.011, 0.013, 0.22, 0, 0.035, 0.18, 0x22262b, { rough: 0.6, seg: 10 });
    dryHandle.rotation.set(Math.PI / 2.3, 0, 0);
    reg(hits, dryPanGroup, "dry-pan");
    const oilPool = cyl(dryPanGroup, 0.085, 0.083, 0.01, 0, 0.018, 0, 0xd8a44e, { rough: 0.2, metal: 0.1, seg: 20 });
    oilPool.visible = false;
    reg(hits, dryPanGroup, "oil-pan");
    // Wet pan — the trap, sitting on the rail beside the dry one.
    const wetPanGroup = group(range, -0.9, 0.99, 0.3);
    lathe(wetPanGroup, [[0.001, 0], [0.085, 0.004], [0.095, 0.04], [0.098, 0.048], [0.09, 0.045], [0.078, 0.008], [0.001, 0.003]],
      0, 0, 0, 0x4a4f55, { rough: 0.35, metal: 0.7, seg: 18 });
    for (let i = 0; i < 5; i++) {
      ball(wetPanGroup, 0.006, (Math.random() - 0.5) * 0.1, 0.018, (Math.random() - 0.5) * 0.1, 0xbfe4ff, { rough: 0.2, opacity: 0.7, seg: 6 });
    }
    holoTag(range, "wet — beading water", -0.9, 0.22, 0.3, { css: "#f0645b", w: 0.4 });
    reg(hits, wetPanGroup, "wet-pan-oil");
    // Handle turned into the aisle — the find trap.
    const outHandlePan = group(range, 0.9, 0.99, 0.3);
    cyl(outHandlePan, 0.09, 0.09, 0.05, 0, 0, 0, 0x4a4f55, { rough: 0.35, metal: 0.7, seg: 18 });
    const outHandle = cyl(outHandlePan, 0.011, 0.013, 0.22, 0, 0.035, 0.24, 0x22262b, { rough: 0.6, seg: 10 });
    outHandle.rotation.set(Math.PI / 2.3, 0, 0);
    holoTag(range, "handle into the aisle", 0.9, 0.2, 0.5, { css: "#f0645b", w: 0.4 });
    reg(hits, outHandle, "handle-out");

    // Oven and sheet pans below the range.
    const oven = group(range, 0, 0.3, -0.05);
    box(oven, 2.1, 0.5, 0.6, 0, 0, 0, 0x2b3138, { rough: 0.55, metal: 0.35 });
    const ovenDoor = box(oven, 2.0, 0.44, 0.03, 0, 0, 0.31, 0x1b1e22, { rough: 0.4, metal: 0.5 });
    const sheetPan = group(oven, 0.6, 0.35, 0.32);
    box(sheetPan, 0.42, 0.03, 0.3, 0, 0, 0, 0x9aa1a8, { rough: 0.35, metal: 0.7 });
    holoTag(oven, "Sheet pan — call \"hot\"", 0.6, 0.5, 0.32, { css: "#e8542f", w: 0.44 });
    reg(hits, sheetPan, "call-hot");
    void ovenDoor;

    // Aisle marker behind the cook — call "behind" moving through it.
    const aislePoint = box(g, 0.5, 0.006, 1.2, -0.2, 0.006, -0.5, 0xe8542f, { emissive: 0xe8542f, ei: 0.7, rough: 0.5, cast: false });
    holoTag(g, "aisle — call \"behind\"", -0.2, 0.16, -0.5, { css: "#e8542f", w: 0.4 });
    reg(hits, aislePoint, "call-behind");
    reg(hits, aislePoint, "runner-alert");

    // Protein prep tray.
    const proteinTray = group(g, -2.3, 0, -0.6);
    box(proteinTray, 0.36, 0.85, 0.5, 0, 0.425, 0, CITY.darkSteel, { rough: 0.4, metal: 0.7 });
    slab(proteinTray, 0.4, 0.05, 0.54, 0, 0.87, 0, 0xb4bcc3, { radius: 0.02, rough: 0.32, metal: 0.75 });
    const tray = group(proteinTray, 0, 0.94, 0);
    box(tray, 0.28, 0.03, 0.2, 0, 0, 0, 0x9aa1a8, { rough: 0.35, metal: 0.7 });
    for (let i = 0; i < 3; i++) slab(tray, 0.08, 0.03, 0.15, -0.08 + i * 0.08, 0.03, 0, 0xc9946a, { radius: 0.02, rough: 0.75 });
    holoTag(proteinTray, "Portioned protein", 0, 1.15, 0, { css: "#e8542f", w: 0.34 });
    reg(hits, tray, "protein-tray");

    // ------------------------------------------------------------- flambé bay
    const flambeArea = group(g, 1.5, 0, -1.6);
    // Grease baffle filters overhead, right over the flambé's start position.
    const filterBox = group(flambeArea, -0.7, 1.95, 0);
    box(filterBox, 0.9, 0.1, 0.7, 0, 0, 0, 0xc9d0d6, { rough: 0.35, metal: 0.8 });
    for (let i = 0; i < 4; i++) {
      const baffle = box(filterBox, 0.22, 0.28, 0.02, -0.32 + i * 0.22, -0.18, 0.24, 0x8d959d, { rough: 0.4, metal: 0.85 });
      baffle.rotation.x = 0.35;
    }
    holoTag(flambeArea, "Grease baffle filters", -0.7, 2.2, 0, { css: "#f0645b", w: 0.42 });
    const filterTrap = box(flambeArea, 0.5, 0.02, 0.4, -0.7, 0.9, 0, 0xffffff, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, filterTrap, "filter-flambe");

    const flambePan = group(flambeArea, -0.7, 0.99, 0);
    lathe(flambePan, [[0.001, 0], [0.09, 0.004], [0.1, 0.04], [0.104, 0.05], [0.096, 0.047], [0.084, 0.008], [0.001, 0.003]],
      0, 0, 0, 0x4a4f55, { rough: 0.35, metal: 0.7, seg: 18 });
    const flambeHandle = cyl(flambePan, 0.011, 0.013, 0.2, 0, 0.032, 0.17, 0x22262b, { rough: 0.6, seg: 10 });
    flambeHandle.rotation.set(Math.PI / 2.3, 0, 0);
    reg(hits, flambePan, "flambe-pan");
    const flambeFire = particles(flambePan, 60, 0xff9a3c, { size: 0.045, life: 0.4 });
    const clearZone = box(flambeArea, 0.02, 0.02, 0.02, 0.6, 0.99, 0, 0xffffff, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, clearZone, "flambe-clear-zone");
    const openFlatTop = box(flambeArea, 0.7, 0.05, 0.6, 0.6, 0.94, 0, 0x33383d, { rough: 0.42, metal: 0.6 });
    void openFlatTop;

    // ------------------------------------------------------------- burn station
    const burnStation = group(g, 2.2, 0, 0.6, -0.7);
    box(burnStation, 0.5, 0.34, 0.4, 0, 0.9, 0, 0xdfe4e8, { rough: 0.25, metal: 0.75 });
    box(burnStation, 0.42, 0.02, 0.32, 0, 1.03, 0, 0x8d959d, { rough: 0.2, metal: 0.9 });
    cyl(burnStation, 0.014, 0.014, 0.26, 0, 1.2, -0.14, CITY.steel, { rough: 0.18, metal: 0.9, seg: 14 });
    const burnWater = particles(burnStation, 46, 0xbfe0f2, { size: 0.011, life: 0.3, additive: false, opacity: 0.65 });
    decal(burnStation, 0.4, 0.1, 0, 1.5, 0.02, signFace("FIRST AID — COOL WATER", { bg: "#3a1414", accent: "#f2a23b", scale: 0.42 }));
    reg(hits, burnStation, "burn-station-sink");

    const iceBucket = group(g, 1.7, 0, 1.1);
    cyl(iceBucket, 0.14, 0.12, 0.24, 0, 0.7, 0, 0xdfe4e8, { rough: 0.4, metal: 0.5, seg: 16 });
    for (let i = 0; i < 8; i++) ball(iceBucket, 0.03, (Math.random() - 0.5) * 0.16, 0.85, (Math.random() - 0.5) * 0.16, 0xe8f4f8, { rough: 0.2, opacity: 0.75, seg: 8 });
    holoTag(iceBucket, "ice — not for a burn", 0, 1.0, 0, { css: "#f0645b", w: 0.44 });
    reg(hits, iceBucket, "ice-bucket");

    const butterDish = group(g, 2.7, 0, 1.1);
    box(butterDish, 0.16, 0.02, 0.1, 0, 0.75, 0, 0xdfe4e8, { rough: 0.3 });
    box(butterDish, 0.1, 0.04, 0.06, 0, 0.78, 0, 0xf2d98a, { rough: 0.5 });
    holoTag(butterDish, "butter — not for a burn", 0, 0.9, 0, { css: "#f0645b", w: 0.46 });
    reg(hits, butterDish, "butter-dish");

    const dryTowelRack = group(g, 1.2, 0, 0.9, 0.3);
    box(dryTowelRack, 0.05, 0.5, 0.05, 0, 0.6, 0, 0x8b929a, { rough: 0.5, metal: 0.5 });
    for (let i = 0; i < 3; i++) box(dryTowelRack, 0.16, 0.1, 0.02, 0, 0.7 - i * 0.14, 0.03, 0xdfe4e8, { rough: 0.75 });
    holoTag(dryTowelRack, "Dry towels", 0, 0.95, 0.03, { css: "#e8542f", w: 0.3 });
    reg(hits, dryTowelRack, "dry-towel-rack");
    reg(hits, dryTowelRack, "dry-towel-stack");

    const wetTowel = group(g, -0.4, 0, -1.1, -0.2);
    box(wetTowel, 0.16, 0.14, 0.02, 0, 1.35, 0, 0x6fa8c9, { rough: 0.8, opacity: 0.85 });
    holoTag(wetTowel, "wet towel — by the burner", 0, 1.5, 0, { css: "#f0645b", w: 0.48 });
    reg(hits, wetTowel, "wet-towel-near-flame");

    // Missing drip pan under the fryer bay.
    const fryerBay = group(g, -2.6, 0, -1.9);
    box(fryerBay, 0.6, 0.85, 0.6, 0, 0.425, 0, 0x4e5a63, { rough: 0.35, metal: 0.7 });
    const dripGap = box(fryerBay, 0.5, 0.01, 0.5, 0, 0.02, 0, 0x1c2024, { rough: 0.9, opacity: 0.001, transparent: true, cast: false });
    holoTag(fryerBay, "no drip pan", 0, 0.2, 0.4, { css: "#f0645b", w: 0.36 });
    reg(hits, dripGap, "missing-drip-pan");

    // Burn assessment chart and response boards.
    const burnChart = holoPanel(g, 0.44, 0.5, 2.3, 1.5, -0.3, (ctx, w, h) => {
      ctx.fillStyle = "rgba(20,6,4,0.9)"; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#e8542f"; ctx.fillRect(0, 0, w, 5);
      ctx.fillStyle = "#f2c1a8";
      ctx.font = `600 ${Math.round(h * 0.075)}px 'Barlow Condensed', Arial, sans-serif`;
      ctx.textAlign = "left"; ctx.textBaseline = "middle";
      ctx.fillText("BURN SIZE / DEPTH", w * 0.08, h * 0.1);
      ctx.fillStyle = "#fbeae0";
      ctx.font = `${Math.round(h * 0.065)}px Arial, sans-serif`;
      ["Superficial, small: manage on-site", "Partial thickness, hand or > 3\":", "  clinic referral", "Full thickness: emergency care"].forEach((line, i) => ctx.fillText(line, w * 0.08, h * (0.28 + i * 0.14)));
    }, { ry: -0.4, accent: GLB_ACCENT });
    reg(hits, burnChart, "burn-chart");

    const dressingKit = group(g, 2.5, 0, 0.2, -0.4);
    box(dressingKit, 0.18, 0.1, 0.14, 0, 0.8, 0, 0xdfe4e8, { rough: 0.45 });
    decal(dressingKit, 0.1, 0.06, 0, 0.86, 0.071, signFace("STERILE", { bg: "#0f1b14", accent: "#59c97b", scale: 0.5 }));
    reg(hits, dressingKit, "cover-clean");

    const clinicPhone = group(g, 2.9, 0, 0.7, -0.5);
    box(clinicPhone, 0.1, 0.16, 0.05, 0, 1.0, 0, 0x22262b, { rough: 0.5 });
    holoTag(clinicPhone, "Clinic referral", 0, 1.16, 0, { css: "#e8542f", w: 0.3 });
    reg(hits, clinicPhone, "clinic-referral");

    const incidentBoard = holoPanel(g, 0.46, 0.3, -2.7, 1.35, 1.0, (ctx, w, h) => {
      ctx.fillStyle = "rgba(20,6,4,0.9)"; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#e8542f"; ctx.fillRect(0, 0, w, 5);
      ctx.fillStyle = "#fbeae0";
      ctx.font = `600 ${Math.round(h * 0.18)}px 'Barlow Condensed', Arial, sans-serif`;
      ctx.textAlign = "center"; ctx.textBaseline = "middle";
      ctx.fillText("INCIDENT REPORT", w / 2, h * 0.4);
      ctx.font = `${Math.round(h * 0.1)}px Arial, sans-serif`;
      ctx.fillStyle = "#f2c1a8";
      ctx.fillText("Cause, response, sign-off", w / 2, h * 0.7);
    }, { ry: 0.6, accent: GLB_ACCENT });
    reg(hits, incidentBoard, "incident-board");

    const closeBoard = holoPanel(g, 0.46, 0.3, 0.4, 1.35, 2.0, (ctx, w, h) => {
      ctx.fillStyle = "rgba(20,6,4,0.9)"; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#e8542f"; ctx.fillRect(0, 0, w, 5);
      ctx.fillStyle = "#fbeae0";
      ctx.font = `600 ${Math.round(h * 0.16)}px 'Barlow Condensed', Arial, sans-serif`;
      ctx.textAlign = "center"; ctx.textBaseline = "middle";
      ctx.fillText("LINE CLOSE-OUT", w / 2, h * 0.36);
      ctx.font = `${Math.round(h * 0.09)}px Arial, sans-serif`;
      ctx.fillStyle = "#f2c1a8";
      ctx.fillText("Drip pans emptied · mats down", w / 2, h * 0.68);
    }, { ry: -0.15, accent: GLB_ACCENT });
    reg(hits, closeBoard, "close-board");

    // Crew: a second cook on the pass, clear of every control.
    const crew = standingFigure(g, 0.4, 1.35, { ry: 2.6, cloth: 0xf2f2f2, trousers: 0x2b3138, skin: 0xc99878 });

    let flambeOn = false;
    let dryPoured = false;

    return {
      hits,
      footprint: 2.4,

      onStep(step) {
        // The flame lights the moment the flambé hold begins, not when it
        // completes, so the flare is visible during the step it belongs to.
        if (step.id === "flambe-ignite") flambeOn = true;
      },

      onStepComplete(step) {
        if (step.id === "dry-pan-check") dryPanGroup.position.y = 0.99;
        if (step.id === "oil-temp") { oilPool.visible = true; dryPoured = true; }
        if (step.id === "food-to-pan") tray.children.forEach((c) => { c.material = mat(0x8a5a34, { rough: 0.6 }); });
        if (step.id === "flambe-clear") flambePan.position.set(0.6, 0.99, 0);
        if (step.id === "flambe-ignite") flambeOn = false;
        if (step.id === "burn-response") dressingKit.children[1].material = mat(0x59c97b, { emissive: 0x59c97b, ei: 0.6, rough: 0.4 });
      },

      onInterrupt(it) {
        if (it.id === "runner-behind") aislePoint.material = mat(0xf0645b, { emissive: 0xf0645b, ei: 1.0, rough: 0.5 });
        if (it.id === "wet-towel-grab") wetTowel.children[0].material = mat(0xf0645b, { emissive: 0xf0645b, ei: 0.9, rough: 0.6 });
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "runner-behind") aislePoint.material = mat(0xe8542f, { emissive: 0xe8542f, ei: 0.7, rough: 0.5 });
        if (it.id === "wet-towel-grab") wetTowel.children[0].material = mat(0x6fa8c9, { rough: 0.8, opacity: 0.85 });
      },

      animate(t, dt, session) {
        burners.forEach((b, i) => {
          if (!b.visible) return;
          b.scale.y = 0.85 + Math.sin(t * 11 + i) * 0.16;
        });
        flambeFire.visible = flambeOn;
        if (flambeOn) flambeFire.userData.step(dt, new THREE.Vector3(0, 0.05, 0), 0.12, 1.3, -0.6);
        void dryPoured;
        crew.userData.head.rotation.y = Math.sin(t * 0.5) * 0.3;

        const holding = session?.step?.id === "cool-water" && session.holding;
        burnWater.visible = holding;
        if (holding) burnWater.userData.step(dt, new THREE.Vector3(0, 1.3, -0.14), 0.04, 0.3, -3.0);

        const gg = session?.gauge;
        if (gg && !gg.committed) {
          if (session.step?.id === "oil-temp") {
            oilPool.visible = true;
            oilPool.material = mat(gg.t > 0.74 ? 0x2b2018 : 0xd8a44e, { rough: 0.2, metal: 0.1 });
          }
          if (session.step?.id === "burn-assess") repaint(burnChart.userData.face, (ctx, w, h) => {
            ctx.fillStyle = "rgba(20,6,4,0.9)"; ctx.fillRect(0, 0, w, h);
            ctx.fillStyle = gg.t > 0.6 && gg.t < 0.82 ? "#59c97b" : "#f0645b"; ctx.fillRect(0, 0, w, 5);
            ctx.fillStyle = "#fbeae0";
            ctx.font = `600 ${Math.round(h * 0.09)}px 'Barlow Condensed', Arial, sans-serif`;
            ctx.textAlign = "center"; ctx.textBaseline = "middle";
            ctx.fillText(gg.t < 0.4 ? "SUPERFICIAL" : gg.t > 0.82 ? "OVERCALLED" : "PARTIAL — REFER", w / 2, h / 2);
          });
        }
      },
    };
  },
};
