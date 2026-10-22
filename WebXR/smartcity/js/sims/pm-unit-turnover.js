import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, ball, slab, group, decal, repaint, signFace, paperFace, mat,
} from "../../../shared/kit.js";
import {
  CITY, stationPad, holoPanel, holoTag, standingFigure, reg,
  surfaceTexture, texturedMat, pavingFace,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";
import { plantHardHat } from "../../../shared/eggs.js";

// SmartCiti.X~ Unit Turnover VR — Building Systems & Facilities, property
// management programme, zone three of twenty.
//
// A vacant unit in a pre-1978 building turned for the next resident the way a
// CAMT-credentialed maintenance technician is taught to turn it: the
// habitability defects found before anything is painted, lead-safe
// containment under EPA's renovation rule set up before a single chip is
// disturbed, the trim wet-scraped rather than sanded, the chips bagged, the
// floor HEPA-cleaned and verified, the faucet swapped on an isolated line,
// the hot water read at the tap, the life-safety devices proven and the lock
// re-keyed before the keys change hands. A generic building; no real
// address, resident or contractor is named.

const PMUT_ACCENT = 0xd9a441;

export const SIM_PM_UNIT_TURNOVER = {
  id: "pm-unit-turnover",
  index: "303",
  domain: "Property Management",
  trade: "Maintenance technician — apartment association CAMT credential, SEIU building service and IUOE Local 39 engineering staff",
  category: "Building Systems & Facilities",
  indoor: "hotel",
  certification: "EPA's Renovation, Repair and Painting rule under 40 CFR 745 for work that disturbs paint in pre-1978 housing — certified renovator and firm, containment, no dry sanding or open-flame removal, HEPA cleaning and cleaning verification; the asbestos NESHAP under 40 CFR 61 and OSHA's asbestos standard, 29 CFR 1926.1101, for textured ceilings that have not been surveyed; OSHA's lead standard for construction work, 29 CFR 1926.62; ASHRAE 188 for managing the building's hot water against Legionella and scald alike; NFPA 72 for the unit's smoke alarms; the local housing code's habitability standards and the state landlord-tenant statute's move-in condition; the apartment association's CAMT credential; SEIU and IUOE Local 39 building staff.",
  supportLine: "the SEIU member assistance line, IUOE Local 39's member services or your employer's EAP",
  name: "Unit Turnover",
  title: simTitle("Unit Turnover"),
  tagline: "A pre-1978 unit made ready: defects found, lead-safe containment set, trim wet-scraped, chips bagged, the floor HEPA-cleaned and verified, the faucet swapped on an isolated line, hot water read at the tap, alarms proven and the lock re-keyed",
  accent: PMUT_ACCENT,
  accentCss: "#d9a441",
  parSeconds: 290,
  footprint: 2.4,
  badge: { id: "lead-safe-ready", name: "Lead-Safe Ready", note: "A unit turned with the paint disturbed safely, the dust verified gone and every device proven before the keys changed hands" },

  game: system({
    name: "Make-Ready",
    currency: "UNITS",
    ranks: ["Maintenance Helper", "Maintenance Tech", "Lead Tech", "Maintenance Supervisor", "Make-Ready Certified"],
    badges: [
      { id: "no-dust-out", name: "No Dust Out", note: "No unsafe action anywhere in the turn", test: AWARD.safe },
      { id: "contained-first", name: "Contained First", note: "Containment set up in order on the first try", test: AWARD.stepClean("containment") },
      { id: "tap-true", name: "Tap True", note: "Hot water committed near band centre", test: AWARD.precise(0.72) },
    ],
    challenges: [
      { id: "clean-turn-unit", name: "Clean Turn", note: "No corrections anywhere", test: AWARD.clean },
      { id: "turn-pace", name: "Turn Pace", note: "Inside 80% of par", test: AWARD.fast(0.8) },
      { id: "nine-straight", name: "Nine Straight", note: "Nine correct actions in a row", test: AWARD.streak(9) },
    ],
  }),

  hazards: {
    "dry-sander": "You are reaching for the orbital sander to take the trim back to bare wood. In a pre-1978 unit that paint is presumed lead, and 40 CFR 745 prohibits high-speed sanding without a HEPA shroud for exactly this reason: it turns a few chips into a fine dust that settles in the carpet and on the sills, where the next resident's toddler finds it on their hands.",
    "popcorn-ceiling": "You are about to scrape the textured ceiling to 'freshen it up'. Nobody has surveyed it, and in a building this age that texture may contain asbestos. The asbestos NESHAP under 40 CFR 61 and OSHA's 29 CFR 1926.1101 both start from the same place: you find out what it is before you disturb it, not after a room is full of it.",
    "shop-vac": "That is the ordinary shop vacuum. Its filter passes the fine lead dust straight through and blows it back into the room through the exhaust, which is worse than not vacuuming at all. EPA's renovation rule calls for a HEPA vacuum for exactly this clean-up.",
    "door-wedge": "You are wedging the unit's entry door open onto the corridor to get some air through. That is a self-closing, rated door, and it is also your containment boundary — propped, it lets lead dust drift down a corridor where neighbours and their children walk, and it lets smoke into the corridor if anything in the unit ever catches.",
  },

  lateNotes: {
    "verification-card": "Cleaning verification comes after the HEPA clean — wiping the floor now would just prove it is still dirty.",
    "deadbolt-cylinder": "The lock is re-keyed last, once every trade is out of the unit. Change it now and you will be handing out the new key to contractors.",
    "building-log": "The turnover goes in the log when the unit is actually ready, not while the paint is still wet.",
  },

  steps: [
    {
      id: "make-ready-order", kind: "select", target: "make-ready-order",
      title: "Read the make-ready order and the building records",
      cue: "Read the move-out inspection and the make-ready scope, and note the building's year and the lead and asbestos records.",
      why: "The make-ready order tells you what the last resident left and what the next one is owed; the building's year tells you which rules apply before you pick up a tool. A pre-1978 building means painted surfaces are presumed lead unless tested otherwise, and an unsurveyed textured ceiling is presumed a problem — both decisions are made at the clipboard, not halfway up a ladder.",
    },
    {
      id: "unit-walk", kind: "find", noHint: true,
      targets: ["window-lock", "outlet-cover", "anti-tip-bracket"],
      itemNames: { "window-lock": "window lock missing", "outlet-cover": "cracked outlet cover by the sink", "anti-tip-bracket": "range anti-tip bracket missing" },
      itemNotes: {
        "window-lock": "The window's sash lock is gone. Security of the unit is a habitability item in most local housing codes, and a ground-floor window that will not lock is the first thing a new resident notices at night.",
        "outlet-cover": "A cracked cover beside a sink leaves live contacts a wet hand can find. It is a two-minute fix now and a shock later.",
        "anti-tip-bracket": "The range has no anti-tip bracket. A child standing on an open oven door can pull a freestanding range over onto themselves — the bracket is the whole defence and it is often missing after a range is moved for cleaning.",
      },
      title: "Walk the unit for habitability defects",
      cue: "Before any paint is touched, three defects in this unit would fail a move-in inspection. Find them.",
      why: "The local housing code sets the floor the next resident is owed — locks that lock, outlets that are safe, appliances that cannot fall on anyone — and a make-ready is the one time the unit is empty enough to find everything. Walking it before the paint work means the fixes go on the list now instead of into a complaint the first week.",
    },
    {
      id: "containment", kind: "sequence", anyOrder: false,
      targets: ["warning-sign", "floor-plastic", "hepa-vac"],
      itemNames: { "warning-sign": "warning sign at the work-area entry", "floor-plastic": "floor covered six feet out from the trim", "hepa-vac": "HEPA vacuum staged in the work area" },
      title: "Set up lead-safe containment",
      cue: "Post the warning sign at the doorway, cover the floor beyond the work, and stage the HEPA vacuum inside.",
      why: "EPA's renovation rule under 40 CFR 745 is built on keeping the dust where it is made: a sign so nobody walks in unaware, plastic that catches every chip, and the right vacuum within reach so clean-up happens inside the containment. Set up in that order, the boundary exists before the first chip falls rather than being chased afterwards.",
      outOfOrderNote: "Sign first, then plastic, then the vacuum. A work area with plastic down but no sign up is one someone walks into and tracks out of.",
    },
    {
      id: "wet-scrape", kind: "hold", target: "scrape-trim", seconds: 5,
      title: "Mist and wet-scrape the peeling trim",
      cue: "Mist the peeling paint on the window trim and scrape it while it is wet, holding the stroke through the whole flaking patch.",
      why: "Water is the cheapest dust control there is: a misted surface lets the paint come away as damp chips that drop onto the plastic instead of a powder that hangs in the air. It is the method the renovation rule's training teaches in place of dry sanding, and OSHA's lead standard for construction, 29 CFR 1926.62, rewards it with far lower exposures for the person holding the scraper.",
      holdBreakNote: "You stopped before the patch was done and the edge is drying. Mist it again and finish the stroke while it is wet.",
    },
    {
      id: "bag-chips", kind: "drag", target: "chip-bag",
      title: "Bag the chips and move them to the waste drum",
      cue: "Fold the chips into the heavy bag, goose-neck it shut and carry it to the covered waste drum.",
      why: "Paint chips that stay on the plastic get walked on and ground back into dust; bagged, sealed and carried to a covered container, they leave the work area as waste rather than as contamination. Folding the plastic inward before lifting it keeps the dirty side inside the bag.",
      drag: { to: "waste-drum-socket", radius: 0.5, missNote: "Not in the drum. Sealed chips go straight into the covered waste drum — not left on the floor outside the containment." },
    },
    {
      id: "hepa-clean", kind: "track", target: "hepa-wand", seconds: 6,
      title: "HEPA-vacuum the work area in slow passes",
      cue: "Work the HEPA wand across the floor and sills in slow, overlapping passes — fast strokes leave dust behind.",
      why: "A HEPA filter only captures what the wand actually lifts, and a quick pass skims the top of the dust while leaving the fine fraction in the texture of the floor. Slow, overlapping strokes are what the renovation rule's cleaning procedure means, and they are what makes the verification card come out clean the first time rather than the third.",
      track: {
        start: 0.2, green: [0.4, 0.62], rise: 0.45, fall: 0.4, drift: 0.1,
        label: "HEPA WAND — PASS SPEED",
        readout: (v) => (v < 0.4 ? "stalling — missing the edges" : v > 0.62 ? "too fast — skimming" : "slow overlapping passes"),
      },
      holdBreakNote: "The passes drifted out of the slow band. Bring the wand back to a steady, overlapping stroke and finish the floor.",
    },
    {
      id: "cleaning-verification", kind: "select", target: "verification-card",
      title: "Verify the floor against the cleaning card",
      cue: "Wipe the floor with a wet cleaning cloth and compare it to the verification card.",
      why: "Clean-looking is not clean: lead dust at a level that harms a child is invisible. The cleaning verification the renovation rule requires — a wet wipe held against a standard card — is the only step in the whole job that proves the dust is gone rather than asserting it, and a cloth darker than the card means the area is cleaned again.",
    },
    {
      id: "water-stop", kind: "turn", target: "sink-stop-valve",
      title: "Isolate the kitchen faucet",
      cue: "Turn the stop valve under the sink closed before the old faucet comes off.",
      why: "Every fixture in a unit should have its own stop so a faucet swap does not take down a whole riser and a floor of neighbours with it. Closing it and cracking the old faucet to prove it is off is the difference between a ten-minute job and a flooded cabinet — and a stop that will not close is itself a repair to log.",
      turn: { turns: 1.25, axis: "z", label: "SINK STOP VALVE", readout: (t) => `${Math.round(t * 100)}% CLOSED` },
    },
    {
      id: "water-heater-temp", kind: "gauge", target: "tap-thermometer",
      title: "Read the hot water at the tap",
      cue: "Run the new faucet hot and commit when the thermometer settles inside the delivery band.",
      why: "Hot water is a balance between two harms. Too hot at the tap and a child or an older resident is scalded in seconds; too cool in the system and Legionella grows in the tank and the pipes. ASHRAE 188's water management approach keeps storage hot and delivery safe, and the tap reading on a make-ready is the number that tells you which side of the line this unit is on.",
      gauge: {
        label: "HOT WATER AT THE TAP", speed: 0.55, green: [0.42, 0.56],
        readout: (t) => `${Math.round(100 + t * 45)}°F`,
        missNote: "Outside the delivery band — either a scald risk at the tap or a sign the system is running too cool. Let it settle and read it again.",
      },
    },
    {
      id: "alarm-checks", kind: "sequence", anyOrder: true,
      targets: ["smoke-alarm", "co-alarm", "gfci-outlet"],
      itemNames: { "smoke-alarm": "smoke alarm tested", "co-alarm": "CO alarm tested", "gfci-outlet": "GFCI tripped and reset" },
      title: "Prove the unit's life-safety devices",
      cue: "Test the smoke alarm, test the CO alarm, and trip and reset the GFCI by the sink.",
      why: "These three are the devices that act when nobody is watching: NFPA 72 sets how a unit's smoke alarms are installed and kept working, a CO alarm is the only warning of a gas appliance going wrong at night, and a GFCI is what stops a shock at the sink. Each one is proven by making it act, and a make-ready is the last chance before a resident depends on it.",
    },
    {
      id: "rekey-deadbolt", kind: "turn", target: "deadbolt-cylinder",
      title: "Install the re-keyed cylinder and prove the deadbolt",
      cue: "Fit the re-keyed cylinder and turn the new key through until the bolt throws fully.",
      why: "The previous resident, their friends and every contractor who has been through this week may still have a working key. A re-keyed cylinder is what makes the new resident's key the only one, and turning it through a full throw proves the bolt actually reaches the strike — a deadbolt that stops short is a lock in name only.",
      turn: { turns: 0.5, axis: "z", label: "DEADBOLT", readout: (t) => (t < 0.95 ? "BOLT RETRACTED" : "BOLT THROWN") },
    },
    {
      id: "building-log", kind: "select", target: "building-log",
      title: "Log the turnover in the building log",
      cue: "Record the defects fixed, the lead-safe work and verification result, the tap temperature and the new key.",
      why: "EPA's renovation rule expects records of the lead-safe work to be kept, and the building log is where the rest of the turnover lives: what was fixed, what the tap read, which key is now live. When a new resident reports a problem in the first week, this entry is the difference between knowing what was done and guessing.",
    },
    {
      id: "crew-checkin", kind: "select", target: "crew-checkin-board",
      title: "Check in with the painter before the next unit",
      cue: "Ask your co-worker how the day went — the contractor, the neighbour — and name the member line before you move on.",
      why: "A turnover crew moves from unit to unit all week, fielding contractors who cut corners and neighbours who are upset about the dust, and a lot of that friction lands on whoever is holding the scraper. A short check-in between units, with the SEIU and IUOE Local 39 member lines named, is how a crew notices when one of them is carrying more than the job.",
    },
  ],

  interrupts: [
    {
      id: "contractor-no-cert",
      kind: "Contractor without certification",
      after: "wet-scrape", delay: 2, seconds: 12,
      alert: "A painting contractor walks into the unit with a power sander, says he was sent to 'speed things up', and has no renovation firm certification on him.",
      cue: "Stop him at the door and check the certification board before anyone touches the paint.",
      target: "rrp-cert-board",
      why: "Under 40 CFR 745, anyone paid to disturb paint in pre-1978 housing has to work for a certified firm with a certified renovator directing the job — and a power sander without a HEPA shroud is a prohibited practice whoever is holding it. Checking the posted certifications before he starts is the only point at which stopping him costs nothing.",
      missNote: "The contractor started without anyone checking his certification. Whatever his sander does next happens inside your containment, under your building's name, in a unit a family moves into on Friday.",
      wrongNote: "That does not stop him. Check the certification board — no certified firm, no paint work.",
    },
    {
      id: "neighbour-dust",
      kind: "Neighbour at the door with a complaint",
      after: "hepa-clean", delay: 3, seconds: 12,
      alert: "The resident from next door knocks on the frame: there is fine dust coming under her door and her toddler is crawling on that floor.",
      cue: "Re-seal the containment flap at the unit door now, then talk to her.",
      target: "door-seal-flap",
      why: "Dust reaching the corridor means the containment has failed at its weakest point — the doorway flap — and the neighbour's child is exactly who the renovation rule exists to protect. Closing the breach first stops the exposure while you are still talking; the conversation, the corridor clean-up and a note to the manager follow.",
      missNote: "The flap stayed open while the neighbour stood in the corridor. Dust kept moving out of the unit towards her door, and a complaint that started as a concern is now an exposure.",
      wrongNote: "Not that. The breach is at the doorway — re-seal the containment flap first.",
    },
  ],

  build(root) {
    plantHardHat(root, THREE, "pm-unit-turnover", [-2.0, 1.15, 3.0]); // Hard Hat Hunt — docs/easter-egg.md
    const hits = {};
    const g = group(root);
    stationPad(g, 2.4, PMUT_ACCENT);

    // ------------------------------------------------------------ unit floor
    const plankTex = surfaceTexture((cx, w, h) => pavingFace(cx, w, h, { tiles: 12, base: "#9c7a56", base2: "#8e6e4c", seam: "rgba(40,28,18,0.3)" }), { repeat: 3, px: 384 });
    const plank = box(g, 6.2, 0.01, 5.8, 0, 0.005, -0.3, 0x9c7a56, { rough: 0.6, cast: false });
    plank.material = texturedMat(plankTex, { rough: 0.55, metal: 0.02, color: 0xe2d2bc });
    plank.receiveShadow = true;
    decal(g, 2.8, 0.52, 0, 2.62, -5.36, signFace("UNIT 5C — MAKE-READY", { bg: "#221a0e", accent: "#d9a441", fg: "#f6ecd8", scale: 0.44 }), { px: 512 });

    // Partition walls that make it a unit rather than a floor.
    box(g, 0.1, 2.6, 3.4, -2.8, 1.3, -0.9, 0xece6da, { rough: 0.85 });
    box(g, 5.6, 2.6, 0.1, 0, 1.3, -2.65, 0xece6da, { rough: 0.85 });
    for (const [x, z, w, d] of [[-2.74, -0.9, 0.02, 3.4], [0, -2.59, 5.6, 0.02]]) box(g, w, 0.1, d, x, 0.05, z, 0xd9cfbf, { rough: 0.7, cast: false });

    // ------------------------------------------------------------ window with peeling trim
    const win = group(g, -0.4, 0, -2.58);
    box(win, 1.2, 1.3, 0.04, 0, 1.45, 0, 0xbcd8ea, { rough: 0.1, metal: 0.05, opacity: 0.55, transparent: true, cast: false });
    const trimMat = { rough: 0.7 };
    box(win, 1.4, 0.1, 0.08, 0, 2.15, 0.03, 0xf4efe4, trimMat);
    box(win, 1.5, 0.08, 0.16, 0, 0.78, 0.06, 0xf4efe4, trimMat);
    for (const sx of [-0.66, 0.66]) box(win, 0.1, 1.4, 0.08, sx, 1.45, 0.03, 0xf4efe4, trimMat);
    box(win, 1.2, 0.04, 0.05, 0, 1.45, 0.02, 0xf4efe4, trimMat);
    // Peeling patch on the sill and casing — the wet-scrape target.
    const peel = group(win, -0.45, 1.1, 0.09);
    for (let i = 0; i < 5; i++) {
      const flake = box(peel, 0.06, 0.04, 0.005, (i % 3) * 0.04, i * 0.05, 0, 0xc9bca0, { rough: 0.9 });
      flake.rotation.z = (i - 2) * 0.3;
    }
    holoTag(win, "Peeling trim — mist and wet-scrape", -0.45, 1.45, 0.1, { css: "#d9a441", w: 0.52 });
    reg(hits, peel, "scrape-trim");
    const sashLock = box(win, 0.08, 0.03, 0.04, 0.2, 1.47, 0.05, 0x5a626a, { rough: 0.5, metal: 0.4, opacity: 0.35, transparent: true });
    holoTag(win, "Sash lock", 0.2, 1.58, 0.06, { css: "#d9a441", w: 0.2 });
    reg(hits, sashLock, "window-lock");
    const sander = group(g, 0.55, 0, -2.25);
    box(sander, 0.16, 0.1, 0.12, 0, 0.82, 0, 0x2b6fb8, { rough: 0.5 });
    cyl(sander, 0.06, 0.06, 0.03, 0, 0.76, 0, 0x2b3138, { rough: 0.7, seg: 12 });
    box(sander, 0.5, 0.78, 0.35, 0, 0.39, 0, 0x6a5a4a, { rough: 0.7 });
    holoTag(sander, "Orbital sander", 0, 1.02, 0, { css: "#f0645b", w: 0.3 });
    reg(hits, sander, "dry-sander");

    // Textured ceiling patch over the living area — the asbestos trap.
    const popcorn = group(g, -1.6, 2.35, -1.6);
    box(popcorn, 1.4, 0.04, 1.0, 0, 0, 0, 0xefe9dc, { rough: 1.0 });
    for (let i = 0; i < 6; i++) ball(popcorn, 0.05, -0.5 + i * 0.2, -0.03, (i % 2) * 0.3 - 0.15, 0xe8e1d2, { rough: 1.0, seg: 6 });
    const scraper = group(g, -1.9, 0, -1.2);
    cyl(scraper, 0.012, 0.012, 2.0, 0, 1.2, 0, 0x8b6a48, { rough: 0.6, seg: 6 });
    box(scraper, 0.2, 0.02, 0.1, 0, 2.22, 0, CITY.steel, { rough: 0.3, metal: 0.8 });
    holoTag(scraper, "Scrape the textured ceiling?", 0, 1.9, 0.02, { css: "#f0645b", w: 0.5 });
    reg(hits, scraper, "popcorn-ceiling");

    // ------------------------------------------------------------ containment kit
    const plastic = box(g, 2.4, 0.004, 1.9, -0.4, 0.013, -1.6, 0xdfe8ee, { rough: 0.3, opacity: 0.6, transparent: true, cast: false });
    plastic.visible = false;
    const plasticRoll = group(g, -1.4, 0, 0.2);
    const roll = cyl(plasticRoll, 0.1, 0.1, 0.9, 0, 0.1, 0, 0xdfe8ee, { rough: 0.3, seg: 14 });
    roll.rotation.z = Math.PI / 2;
    holoTag(plasticRoll, "Floor plastic", 0, 0.32, 0, { css: "#d9a441", w: 0.28 });
    reg(hits, plasticRoll, "floor-plastic");
    const warn = group(g, 1.6, 0, 1.25, -0.5);
    cyl(warn, 0.012, 0.012, 1.4, 0, 0.7, 0, 0x3a4148, { rough: 0.5, seg: 6 });
    box(warn, 0.3, 0.03, 0.3, 0, 0.015, 0, 0x3a4148, { rough: 0.5 });
    const warnFace = decal(warn, 0.42, 0.3, 0, 1.35, 0.015, paperFace("WARNING", ["LEAD WORK AREA", "Poison · no smoking", "No eating or drinking"], { band: "#b81410" }), { px: 256 });
    reg(hits, warnFace, "warning-sign");
    const hepa = group(g, 0.35, 0, -0.9);
    cyl(hepa, 0.2, 0.22, 0.5, 0, 0.27, 0, 0x2b6f8c, { rough: 0.5, seg: 16 });
    cyl(hepa, 0.21, 0.21, 0.08, 0, 0.56, 0, 0x1b3a4a, { rough: 0.5, seg: 16 });
    decal(hepa, 0.14, 0.06, 0, 0.35, 0.215, signFace("HEPA", { bg: "#0d1c24", accent: "#d9a441", scale: 0.6 }), { px: 128 });
    holoTag(hepa, "HEPA vacuum", 0, 0.78, 0, { css: "#d9a441", w: 0.28 });
    reg(hits, hepa, "hepa-vac");
    const wand = group(hepa, 0.3, 0, 0.15);
    const wandTube = cyl(wand, 0.018, 0.018, 1.0, 0, 0.5, 0, 0x8b949d, { rough: 0.4, metal: 0.6, seg: 8 });
    wandTube.rotation.z = -0.35;
    box(wand, 0.3, 0.03, 0.08, 0.18, 0.02, 0, 0x2b3138, { rough: 0.6 });
    holoTag(wand, "HEPA wand", 0.1, 1.05, 0, { css: "#d9a441", w: 0.24 });
    reg(hits, wand, "hepa-wand");
    const shopVac = group(g, 2.1, 0, -1.6);
    cyl(shopVac, 0.22, 0.22, 0.45, 0, 0.26, 0, 0xc8201a, { rough: 0.5, seg: 14 });
    cyl(shopVac, 0.2, 0.2, 0.1, 0, 0.53, 0, 0x2b3138, { rough: 0.5, seg: 14 });
    holoTag(shopVac, "Shop vacuum", 0, 0.75, 0, { css: "#f0645b", w: 0.28 });
    reg(hits, shopVac, "shop-vac");
    const chipBag = group(g, -0.9, 0, -1.25);
    ball(chipBag, 0.14, 0, 0.13, 0, 0x2b2b2b, { rough: 0.4, seg: 10 });
    cyl(chipBag, 0.03, 0.05, 0.12, 0, 0.3, 0, 0x2b2b2b, { rough: 0.4, seg: 8 });
    holoTag(chipBag, "Chip bag", 0, 0.5, 0, { css: "#d9a441", w: 0.22 });
    reg(hits, chipBag, "chip-bag");
    const drum = group(g, 1.2, 0, -0.2);
    cyl(drum, 0.26, 0.26, 0.7, 0, 0.35, 0, 0x6a5a3a, { rough: 0.8, seg: 18 });
    cyl(drum, 0.27, 0.27, 0.04, 0, 0.72, 0, 0x2b3138, { rough: 0.5, metal: 0.4, seg: 18 });
    decal(drum, 0.3, 0.14, 0, 0.45, 0.262, signFace("LEAD PAINT\nDEBRIS", { bg: "#f2c14b", accent: "#1b1e22", fg: "#1b1e22", scale: 0.34 }), { px: 128 });
    const drumSocket = box(drum, 0.3, 0.05, 0.3, 0, 0.8, 0, 0xffffff, { opacity: 0.001, transparent: true, cast: false });
    hits["waste-drum-socket"] = drumSocket;
    const card = group(g, -0.2, 0, 0.35);
    box(card, 0.5, 0.72, 0.4, 0, 0.36, 0, 0x5a4a3a, { rough: 0.7 });
    const cardFace = decal(card, 0.2, 0.14, 0, 0.73, 0, (cx, w, h) => {
      cx.fillStyle = "#f4f6f8"; cx.fillRect(0, 0, w, h);
      cx.fillStyle = "#1d262e"; cx.font = `600 ${Math.round(h * 0.14)}px Arial`; cx.textAlign = "center"; cx.fillText("VERIFICATION", w / 2, h * 0.2);
      for (let i = 0; i < 4; i++) { cx.fillStyle = ["#f0f0f0", "#cfcfcf", "#9a9a9a", "#5a5a5a"][i]; cx.fillRect(w * (0.08 + i * 0.22), h * 0.4, w * 0.18, h * 0.45); }
    }, { px: 192 });
    cardFace.rotation.x = -Math.PI / 2;
    holoTag(card, "Cleaning verification card", 0, 0.9, 0, { css: "#d9a441", w: 0.46 });
    reg(hits, cardFace, "verification-card");

    // ------------------------------------------------------------ kitchenette
    const kit = group(g, -2.4, 0, 0.2, Math.PI / 2);
    box(kit, 1.9, 0.88, 0.6, 0, 0.44, 0, 0x7a8a8a, { rough: 0.6 });
    box(kit, 2.0, 0.04, 0.64, 0, 0.9, 0, 0x3a3a3a, { rough: 0.3, metal: 0.1 });
    box(kit, 0.5, 0.06, 0.4, -0.3, 0.9, 0, 0xc9d0d6, { rough: 0.2, metal: 0.8 });
    const faucet = group(kit, -0.3, 0.92, -0.2);
    cyl(faucet, 0.015, 0.015, 0.25, 0, 0.12, 0, CITY.steel, { rough: 0.2, metal: 0.9, seg: 8 });
    box(faucet, 0.03, 0.03, 0.15, 0, 0.24, 0.07, CITY.steel, { rough: 0.2, metal: 0.9 });
    const thermo = group(kit, -0.15, 0.92, 0.05);
    cyl(thermo, 0.006, 0.006, 0.16, 0, 0.08, 0, 0xdfe4e8, { rough: 0.3, metal: 0.5, seg: 6 });
    const thermoFace = decal(thermo, 0.1, 0.05, 0, 0.19, 0, signFace("--°F", { bg: "#0d1c24", accent: "#d9a441", scale: 0.6 }), { glow: true, ei: 0.8, px: 128 });
    holoTag(thermo, "Tap thermometer", 0, 0.28, 0, { css: "#d9a441", w: 0.3 });
    reg(hits, thermo, "tap-thermometer");
    const stop = group(kit, -0.3, 0.3, 0.31);
    box(stop, 0.08, 0.08, 0.06, 0, 0, 0, 0xb8853a, { rough: 0.4, metal: 0.7 });
    const stopHandle = group(stop, 0, 0, 0.05);
    box(stopHandle, 0.1, 0.025, 0.02, 0, 0, 0, 0xc8201a, { rough: 0.5 });
    stop.userData.wheel = stopHandle;
    holoTag(stop, "Sink stop valve", 0, 0.14, 0.04, { css: "#d9a441", w: 0.3 });
    reg(hits, stop, "sink-stop-valve");
    const gfci = group(kit, 0.25, 1.15, -0.3);
    box(gfci, 0.08, 0.12, 0.02, 0, 0, 0, 0xf4f0e6, { rough: 0.5 });
    box(gfci, 0.02, 0.012, 0.01, 0, 0.02, 0.012, 0x2b3138, { rough: 0.5 });
    box(gfci, 0.02, 0.012, 0.01, 0, -0.02, 0.012, 0xc8201a, { rough: 0.5 });
    holoTag(gfci, "GFCI", 0, 0.12, 0.01, { css: "#d9a441", w: 0.14 });
    reg(hits, gfci, "gfci-outlet");
    const crackedCover = box(kit, 0.08, 0.12, 0.02, 0.55, 1.15, -0.3, 0xe8e0d0, { rough: 0.6 });
    const crack = box(kit, 0.004, 0.1, 0.022, 0.56, 1.15, -0.3, 0x2b2b2b, { rough: 0.6 });
    crack.rotation.z = 0.5;
    reg(hits, crackedCover, "outlet-cover");
    // Range beside the counter.
    const range = group(kit, 1.35, 0, 0);
    box(range, 0.76, 0.9, 0.62, 0, 0.45, 0, 0xdfe4e8, { rough: 0.3, metal: 0.4 });
    for (const [x, z] of [[-0.18, -0.14], [0.18, -0.14], [-0.18, 0.14], [0.18, 0.14]]) cyl(range, 0.09, 0.09, 0.01, x, 0.905, z, 0x2b2b2b, { rough: 0.6, seg: 14 });
    box(range, 0.7, 0.4, 0.02, 0, 0.45, 0.32, 0x2b3138, { rough: 0.3, metal: 0.4, opacity: 0.8, transparent: true });
    const bracketGap = box(range, 0.12, 0.05, 0.08, 0.3, 0.03, -0.28, 0xf0645b, { rough: 0.5, emissive: 0xf0645b, ei: 0.5 });
    holoTag(range, "Anti-tip bracket?", 0.3, 0.2, -0.36, { css: "#d9a441", w: 0.32 });
    reg(hits, bracketGap, "anti-tip-bracket");

    // ------------------------------------------------------------ alarms
    const smoke = group(g, 0.9, 2.2, -2.58);
    cyl(smoke, 0.07, 0.07, 0.035, 0, 0, 0.02, 0xf4f0e6, { rough: 0.5, seg: 16 }).rotation.x = Math.PI / 2;
    const smokeLed = ball(smoke, 0.008, 0.03, 0, 0.042, 0xc8201a, { rough: 0.4, seg: 6, emissive: 0xc8201a, ei: 0.6 });
    holoTag(smoke, "Smoke alarm", 0, 0.14, 0.03, { css: "#d9a441", w: 0.26 });
    reg(hits, smoke, "smoke-alarm");
    const co = group(g, 1.6, 0.45, -2.58);
    box(co, 0.1, 0.14, 0.05, 0, 0, 0.03, 0xf4f0e6, { rough: 0.5 });
    decal(co, 0.07, 0.03, 0, 0.03, 0.056, signFace("CO", { bg: "#0d1c24", accent: "#59c97b", scale: 0.6 }), { glow: true, ei: 0.6, px: 64 });
    holoTag(co, "CO alarm", 0, 0.14, 0.04, { css: "#d9a441", w: 0.2 });
    reg(hits, co, "co-alarm");

    // ------------------------------------------------------------ entry door, deadbolt, containment flap
    const door = group(g, 2.6, 0, 0.4, -Math.PI / 2);
    for (const sx of [-0.5, 0.5]) box(door, 0.08, 2.2, 0.14, sx, 1.1, 0, 0xf4efe4, { rough: 0.6 });
    box(door, 1.08, 0.1, 0.14, 0, 2.2, 0, 0xf4efe4, { rough: 0.6 });
    const leaf = box(door, 0.9, 2.1, 0.05, 0.02, 1.05, 0.03, 0x6a4a3a, { rough: 0.55 });
    void leaf;
    box(door, 0.3, 0.05, 0.06, -0.25, 2.05, -0.05, 0x3c444c, { rough: 0.4, metal: 0.6 });
    const bolt = group(door, 0.35, 1.2, -0.03);
    cyl(bolt, 0.028, 0.028, 0.02, 0, 0, 0, 0xd8b23a, { rough: 0.3, metal: 0.8, seg: 12 }).rotation.x = Math.PI / 2;
    const boltTurn = group(bolt, 0, 0, -0.012);
    box(boltTurn, 0.008, 0.04, 0.008, 0, 0, 0, 0x2b3138, { rough: 0.4 });
    bolt.userData.wheel = boltTurn;
    holoTag(door, "Deadbolt", 0.35, 1.34, -0.04, { css: "#d9a441", w: 0.2 });
    reg(hits, bolt, "deadbolt-cylinder");
    const doorWedge = box(door, 0.12, 0.04, 0.16, -0.35, 0.02, -0.25, 0x8b6a48, { rough: 0.7 });
    holoTag(door, "Door wedge", -0.35, 0.16, -0.3, { css: "#f0645b", w: 0.22 });
    reg(hits, doorWedge, "door-wedge");
    const flap = box(door, 0.96, 2.1, 0.01, 0.02, 1.05, -0.12, 0xdfe8ee, { rough: 0.3, opacity: 0.45, transparent: true, cast: false });
    holoTag(door, "Containment flap", -0.1, 1.9, -0.14, { css: "#d9a441", w: 0.32 });
    reg(hits, flap, "door-seal-flap");
    const dustHaze = box(g, 0.8, 0.4, 0.8, 2.3, 0.3, 0.4, 0xd8d0c0, { rough: 1.0, opacity: 0.25, transparent: true, cast: false });
    dustHaze.visible = false;

    // ------------------------------------------------------------ paperwork
    const order = holoPanel(g, 0.56, 0.4, -1.95, 1.55, 1.55, (cx, w, h) => {
      cx.fillStyle = "rgba(22,16,6,0.9)"; cx.fillRect(0, 0, w, h);
      cx.fillStyle = "#d9a441"; cx.fillRect(0, 0, w, 5);
      cx.fillStyle = "#f6ecd8";
      cx.font = `600 ${Math.round(h * 0.11)}px 'Barlow Condensed', Arial, sans-serif`;
      cx.textAlign = "left"; cx.textBaseline = "middle";
      cx.fillText("MAKE-READY — UNIT 5C", w * 0.06, h * 0.15);
      cx.font = `${Math.round(h * 0.075)}px Arial, sans-serif`; cx.fillStyle = "#e3d2b0";
      ["Built 1962 — paint presumed lead", "Ceiling texture: NOT surveyed", "Trim: peeling at window", "Faucet swap · re-key · alarms", "Move-in: Friday"].forEach((l, i) => cx.fillText(l, w * 0.06, h * (0.34 + i * 0.13)));
    }, { ry: 0.7, accent: PMUT_ACCENT });
    reg(hits, order, "make-ready-order");
    const certBoard = holoPanel(g, 0.44, 0.32, 2.25, 1.6, 1.6, (cx, w, h) => {
      cx.fillStyle = "rgba(22,16,6,0.9)"; cx.fillRect(0, 0, w, h);
      cx.fillStyle = "#d9a441"; cx.fillRect(0, 0, w, 5);
      cx.fillStyle = "#f6ecd8"; cx.font = `600 ${Math.round(h * 0.13)}px 'Barlow Condensed', Arial, sans-serif`;
      cx.textAlign = "center"; cx.textBaseline = "middle";
      cx.fillText("RRP CERTIFICATIONS", w / 2, h * 0.28);
      cx.font = `${Math.round(h * 0.09)}px Arial, sans-serif`; cx.fillStyle = "#e3d2b0";
      cx.fillText("Firm · renovator · expiry", w / 2, h * 0.56);
      cx.fillText("Check before paint work", w / 2, h * 0.74);
    }, { ry: -1.2, accent: PMUT_ACCENT });
    reg(hits, certBoard, "rrp-cert-board");
    const logBoard = holoPanel(g, 0.52, 0.36, -2.55, 1.6, 2.2, (cx, w, h) => {
      cx.fillStyle = "rgba(22,16,6,0.9)"; cx.fillRect(0, 0, w, h);
      cx.fillStyle = "#d9a441"; cx.fillRect(0, 0, w, 5);
      cx.fillStyle = "#f6ecd8"; cx.font = `600 ${Math.round(h * 0.14)}px 'Barlow Condensed', Arial, sans-serif`;
      cx.textAlign = "center"; cx.textBaseline = "middle";
      cx.fillText("BUILDING LOG", w / 2, h * 0.28);
      cx.font = `${Math.round(h * 0.085)}px Arial, sans-serif`; cx.fillStyle = "#e3d2b0";
      ["Defects · lead-safe record", "Tap temp · new key", "Unit ready"].forEach((l, i) => cx.fillText(l, w / 2, h * (0.5 + i * 0.15)));
    }, { ry: 1.2, accent: PMUT_ACCENT });
    reg(hits, logBoard, "building-log");
    const crewBoard = holoPanel(g, 0.5, 0.34, 2.45, 1.6, -1.0, (cx, w, h) => {
      cx.fillStyle = "rgba(8,20,18,0.9)"; cx.fillRect(0, 0, w, h);
      cx.fillStyle = "#7fd1c9"; cx.fillRect(0, 0, w, 5);
      cx.fillStyle = "#e3f7ee"; cx.font = `600 ${Math.round(h * 0.14)}px 'Barlow Condensed', Arial, sans-serif`;
      cx.textAlign = "center"; cx.textBaseline = "middle";
      cx.fillText("CREW CHECK-IN", w / 2, h * 0.3);
      cx.font = `${Math.round(h * 0.085)}px Arial, sans-serif`; cx.fillStyle = "#bfe8d6";
      cx.fillText("Tech · painter", w / 2, h * 0.56);
      cx.fillText("SEIU · IUOE Local 39 lines", w / 2, h * 0.74);
    }, { ry: -1.3, accent: 0x7fd1c9 });
    reg(hits, crewBoard, "crew-checkin-board");

    // Step ladder and a paint tray for dressing.
    const ladder = group(g, 1.9, 0, -2.2, 0.3);
    for (const sx of [-0.2, 0.2]) {
      const rail = box(ladder, 0.04, 1.5, 0.04, sx, 0.75, 0.15, 0xd9a441, { rough: 0.5 });
      rail.rotation.x = -0.18;
      const back = box(ladder, 0.04, 1.5, 0.04, sx, 0.75, -0.15, 0xd9a441, { rough: 0.5 });
      back.rotation.x = 0.18;
    }
    for (let i = 0; i < 4; i++) box(ladder, 0.4, 0.03, 0.1, 0, 0.35 + i * 0.3, 0.16 - i * 0.05, 0xb8862b, { rough: 0.5 });
    const tray = group(g, 0.95, 0, 1.5);
    box(tray, 0.3, 0.04, 0.4, 0, 0.02, 0, 0x2b3138, { rough: 0.5 });
    box(tray, 0.26, 0.01, 0.2, 0, 0.045, 0.06, 0xf4efe4, { rough: 0.4 });
    cyl(tray, 0.16, 0.16, 0.2, -0.35, 0.1, 0, 0xdfe4e8, { rough: 0.4, metal: 0.5, seg: 14 });

    // ------------------------------------------------------------ people
    const painter = standingFigure(g, -1.0, -0.4, { ry: 0.6, cloth: 0xf4f0e6, trousers: 0xe6e0d4, cap: 0x2b3138 });
    const contractor = standingFigure(g, 1.6, 0.55, { ry: -1.6, cloth: 0x4a5a6a, trousers: 0x2b3138, cap: 0xc8201a });
    contractor.visible = false;
    const neighbour = standingFigure(g, 2.2, 1.05, { ry: -1.4, cloth: 0x8a5a7a, trousers: 0x3a4148, atStation: true });
    neighbour.visible = false;

    return {
      hits,
      footprint: 2.4,
      spawnLook: new THREE.Vector3(-0.3, 1.1, -1.6),

      onStepComplete(step) {
        if (step.id === "unit-walk") { sashLock.material = mat(0x5a626a, { rough: 0.5, metal: 0.4 }); bracketGap.material = mat(0x5a626a, { rough: 0.5, metal: 0.4 }); crack.visible = false; }
        if (step.id === "containment") { plastic.visible = true; roll.visible = false; }
        if (step.id === "wet-scrape") peel.visible = false;
        if (step.id === "bag-chips") chipBag.position.set(1.2, 0.72, -0.2);
        if (step.id === "cleaning-verification") { plastic.visible = false; repaint(logBoard.userData.face, signFace("VERIFIED\nCLEAN", { bg: "#0d1c14", accent: "#59c97b", fg: "#c9f5d8", scale: 0.34 })); }
        if (step.id === "water-heater-temp") repaint(thermoFace, signFace("120°F", { bg: "#0d1c14", accent: "#59c97b", fg: "#c9f5d8", scale: 0.6 }));
        if (step.id === "alarm-checks") smokeLed.material = mat(0x59c97b, { emissive: 0x59c97b, ei: 1.4 });
      },

      onInterrupt(it) {
        if (it.id === "contractor-no-cert") contractor.visible = true;
        if (it.id === "neighbour-dust") { neighbour.visible = true; dustHaze.visible = true; flap.rotation.y = 0.9; flap.position.set(0.3, 1.05, -0.4); }
      },
      onInterruptEnd(it) {
        if (it.id === "contractor-no-cert") contractor.visible = false;
        if (it.id === "neighbour-dust") {
          neighbour.visible = false;
          if (it.resolved === "answered") { dustHaze.visible = false; flap.rotation.y = 0; flap.position.set(0.02, 1.05, -0.12); }
        }
      },

      animate(t, dt, session) {
        painter.userData.head.rotation.y = Math.sin(t * 0.45) * 0.3;
        if (session?.step?.id === "hepa-clean") wand.rotation.y = Math.sin(t * 1.6) * 0.4;
        const gg = session?.gauge;
        if (gg && !gg.committed && session.step?.id === "water-heater-temp") {
          repaint(thermoFace, signFace(`${Math.round(100 + gg.t * 45)}°F`, { bg: "#0d1c24", accent: gg.t > 0.42 && gg.t < 0.56 ? "#59c97b" : "#f0645b", scale: 0.6 }));
        }
      },
    };
  },
};
