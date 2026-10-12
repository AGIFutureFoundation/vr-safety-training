import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, ball, torus, slab, group, decal, repaint, signFace, paperFace, mat,
  standingPerson,
} from "../../../shared/kit.js";
import {
  CITY, stationPad, holoPanel, holoTag, instrument, standingFigure, reg,
  surfaceTexture, texturedMat, pavingFace,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Banquet Setup Lift VR — Culinary & Hospitality, hotel
// housekeeping series, station 196.
//
// A ballroom changeover, from the floor plan to the last aisle check: round
// tables read off the plan and moved on the dolly, set down with an actual
// two-person lift rather than one person dragging a corner, chairs stacked
// to the manufacturer's own limit instead of by eye, the dance floor panels
// and the stage risers locked before anything is loaded onto them, the
// cable runs ramped rather than left bare across the floor, and the fire
// exits and aisle widths kept clear the whole time the room is being built.
// Generic ballroom, not a real property — only the standard, the code and
// the union contract are named with a number.

const BSL_ACCENT = 0xc98a4a;

export const SIM_BANQUET_SETUP_LIFT = {
  id: "banquet-setup-lift",
  index: "196",
  domain: "Culinary & Hospitality",
  trade: "Banquet setup crew — UNITE HERE Local 2",
  category: "Culinary & Hospitality",
  indoor: "hotel",
  certification: "Cal/OSHA's Injury and Illness Prevention Program, 8 CCR 3203, and its hazard assessment for manual material handling and the two-person lift a banquet round table calls for; OSHA's walking-working surfaces standard, 29 CFR 1910.22, for the aisle widths and clear paths a banquet floor plan has to hold; NFPA 101, the Life Safety Code, on egress width and the aisle accessways an assembly space like a ballroom has to keep clear during a changeover; UNITE HERE's banquet-crew contract language on the setup crew's staffing levels and its lift limits.",
  name: "Banquet Setup Lift",
  title: simTitle("Banquet Setup Lift"),
  tagline: "A ballroom changeover done to the plan: tables on the dolly and set with a real two-person lift, chairs stacked to the limit, the dance floor and risers locked, cords ramped, and the exits kept clear the whole time",
  accent: BSL_ACCENT,
  accentCss: "#c98a4a",
  parSeconds: 300,
  footprint: 2.6,
  badge: { id: "clean-changeover", name: "Clean Changeover", note: "The whole room built to the plan — nothing carried alone, nothing stacked past the limit, nothing left unlocked" },

  game: system({
    name: "Setup Crew",
    currency: "SETUPS",
    ranks: ["New Hand", "Setup Crew", "Lead Hand", "Floor Captain", "Setup Crew Certified"],
    badges: [
      { id: "two-hands", name: "Two Hands, Not One", note: "Never a table moved without calling the lift", test: AWARD.safe },
      { id: "to-the-limit", name: "To the Limit, Not Past It", note: "Every chair stack read against the gauge before adding to it", test: AWARD.stepClean("chair-stack-height") },
      { id: "locked-before-loaded", name: "Locked Before Loaded", note: "Every riser section proven locked before anything went on it", test: AWARD.stepClean("riser-leg-lock") },
    ],
    challenges: [
      { id: "clean-build", name: "Clean Build", note: "No corrections across the whole changeover", test: AWARD.clean },
      { id: "room-ready-fast", name: "Room Ready Fast", note: "Finished inside 80% of par", test: AWARD.fast(0.8) },
      { id: "eight-straight", name: "Eight Straight", note: "Eight correct actions in a row", test: AWARD.streak(8) },
    ],
  }),

  hazards: {
    "chair-overstack": "That stack is already past the manufacturer's own stacking limit and leaning on the one behind it. Adding one more chair to a stack that's already top-heavy is how the whole column goes over — onto a floor a crew is still walking back and forth across.",
    "cord-no-ramp": "That power run crosses the main crew aisle with nothing over it. OSHA's walking-working surfaces standard treats a bare cord across a walkway as a trip hazard the moment it's laid there, not the moment somebody actually catches a foot on it — every cord that crosses a path this room's own crew keeps walking gets a ramp, not an exception.",
    "unlocked-riser-shortcut": "Wedging a shim under the riser leg instead of engaging the lock lever holds the platform level right up until weight actually lands on it. The lock is what keeps the section from shifting once a performer or a piece of gear is standing on it — a wedge is a guess dressed up to look like a fix.",
    "table-drag-scrape": "That table got dragged into position by one corner instead of carried by two people. Dragging a round table across a finished dance floor gouges the surface and puts the full weight on whoever's dragging it at a bad angle — the two-person lift exists so the table travels flat and the floor underneath it stays the floor the room paid to have refinished.",
  },

  lateNotes: {
    "chair-stack-gauge": "Not yet — the gauge gets read once there's an actual stack under it to measure, not before the first chair is even on the dolly.",
    "riser-lock-lever": "The lever gets thrown on its own step, confirmed locked, not left for later because the platform already looks level.",
  },

  steps: [
    {
      id: "floor-plan-read", kind: "select", target: "floor-plan-board",
      title: "Read tonight's floor plan",
      cue: "Check the room diagram: table count, the dance floor's footprint, and where the risers and the aisles go.",
      why: "Every table position, every aisle width and every riser placement in this room comes off a diagram somebody already worked out against the fire code's egress numbers — building the room from memory or from last week's layout is how an aisle that's supposed to stay four feet wide quietly becomes three.",
    },
    {
      id: "table-move", kind: "drag", target: "round-table",
      title: "Move the round table on the dolly",
      cue: "Carry the round table on the dolly to its marked spot on the floor plan.",
      why: "The dolly carries the table's weight across the room so the two-person lift only has to happen once, at the very end, setting the table down onto its marked spot — rolled the whole distance instead of carried or dragged, it arrives at the lift with nobody's back already tired from getting it there.",
      drag: { to: "table-socket", radius: 0.55, missNote: "Not on the marked spot — line the table up with the floor plan's mark before letting go, not left short of it." },
    },
    {
      id: "two-person-lift", kind: "hold", target: "lift-cue", seconds: 5,
      title: "Call the lift and hold it together",
      cue: "Call the lift with your partner and hold the table level between you until it's actually down.",
      why: "A two-person lift only protects two backs when both people actually lift and lower on the same count — calling it out loud and holding the table level for the full count down is what turns 'ready' into an actual shared lift instead of one person taking the weight early while the other is still getting a grip, which is when the load ends up on one back instead of two.",
      holdBreakNote: "You let go before the table was actually set down level. Breaking the hold early hands the rest of the weight to whoever's still holding their side.",
    },
    {
      id: "legs-locked", kind: "select", target: "legs-locked",
      title: "Lock the table's legs down",
      cue: "Once the table is down and level, lock the legs.",
      why: "Locking the legs before the table is actually down and level just means locking them onto a table that's about to move again — the lock goes on only once both of you have set the table down together, not while it's still being lowered.",
    },
    {
      id: "chair-lift-technique", kind: "sequence",
      targets: ["bend-knees", "lift-straight"],
      itemNames: { "bend-knees": "bend at the knees", "lift-straight": "lift with a straight back" },
      title: "Lift the chair stack with your knees, not your back",
      cue: "Bend at the knees before you grip the stack, then lift with your back straight.",
      why: "A chair stack isn't heavy enough on its own to hurt anybody in one lift — it's the same bent-back reach repeated across two hundred chairs in a shift that turns into a strain, and the knees-first technique is the one thing standing between tonight's setup and next week's light-duty schedule.",
      outOfOrderNote: "Knees bent first, then the lift — reaching down with a straight back to grab the stack is the exact motion this technique exists to replace.",
    },
    {
      id: "chair-stack-height", kind: "gauge", target: "chair-stack-gauge",
      title: "Read the chair stack's height before adding to it",
      cue: "Watch the stack-height gauge climb as chairs go on and commit once it holds inside the safe limit.",
      why: "Every stackable banquet chair carries a manufacturer's stated stacking limit for a reason that has nothing to do with the chairs themselves — past it, the column's own centre of gravity is what tips it, not anything anyone did wrong to it, and the gauge is the only thing on this floor that actually counts instead of eyeballing 'about right.'",
      gauge: { label: "STACK HEIGHT", speed: 0.6, green: [0.3, 0.56], readout: (t) => `${Math.round(t * 14)} chairs`, missNote: "Past the safe stacking limit — pull chairs back off the top before this column goes over on its own." },
    },
    {
      id: "chair-cart", kind: "drag", target: "chair-stack",
      title: "Roll the finished stack to storage",
      cue: "Carry the stacked chairs from the floor to the storage cart.",
      why: "A stack this tall carried by hand across an open floor blocks the one arm that would otherwise catch a stumble — the cart takes the height and the weight so the stack travels the same way it was built: under control, not balanced against a shoulder.",
      drag: { to: "storage-slot", radius: 0.5, missNote: "Not on the cart — set the stack down and load it onto the cart properly, not left standing free on the floor." },
    },
    {
      id: "dance-floor-lock", kind: "sequence",
      targets: ["panel-align", "panel-lock"],
      itemNames: { "panel-align": "panel aligned to its neighbour", "panel-lock": "panel latch engaged" },
      title: "Align and lock the dance floor panels",
      cue: "Align the next panel against the one already down, then engage its latch.",
      why: "An aligned panel that isn't latched is a trip edge waiting for the first dancer's heel to find it, and a latched panel that wasn't aligned first locks a step into the floor that stays there until somebody unlocks the whole run to fix it — the order is what keeps the floor flat instead of fast.",
      outOfOrderNote: "Align the panel first, then latch it. Latching an unaligned panel just locks the misalignment into the floor.",
    },
    {
      id: "riser-align", kind: "select", target: "riser-section",
      title: "Square the riser section against the stage deck",
      cue: "Push the riser section flush against the deck before locking its legs.",
      why: "A riser locked while it's still sitting at an angle to the deck next to it locks in a step between the two surfaces — squaring it first is what makes the lock actually produce a flat stage instead of a flat stage with a lip in the middle of it.",
    },
    {
      id: "riser-leg-lock", kind: "turn", target: "riser-lock-lever",
      title: "Engage the riser's leg-lock lever",
      cue: "Turn the leg-lock lever through to its stop.",
      why: "The lock lever is what keeps a riser leg from folding or sliding once real weight — a performer, a speaker's podium, an amplifier stack — is actually standing on the platform, and it does that job only when it's thrown all the way to its stop, not partway.",
      turn: { turns: 0.8, axis: "z", label: "RISER LEG LOCK" },
    },
    {
      id: "riser-brace", kind: "hold", target: "riser-platform", seconds: 5,
      title: "Brace the platform while the lock sets",
      cue: "Keep a hand on the platform and hold it steady while the lock lever seats.",
      why: "A leg-lock lever can bind partway through its throw on a platform that's still shifting under it, and holding the platform steady for the full few seconds it takes to seat is what turns 'the lever moved' into 'the leg is actually locked' — letting go early is how a lock that looks engaged turns out not to be, the first time weight lands on it.",
      holdBreakNote: "You let go before the lock finished seating. A lever that moved but never finished its throw can still let the leg shift under real weight — hold the platform steady through the full seat.",
    },
    {
      id: "cable-ramp", kind: "select", target: "cable-ramp",
      title: "Ramp the power run across the crew aisle",
      cue: "Set the cable ramp over the cord where it crosses the main aisle.",
      why: "A cord run across an aisle a whole setup crew keeps crossing all night is a trip hazard with a schedule — the ramp is what turns a bare cord into a surface a foot can land on safely, and it goes on before the first person walks that aisle again, not after somebody already goes down.",
    },
    {
      id: "exit-aisle-check", kind: "find", noHint: true,
      targets: ["narrow-aisle", "exit-blocked"],
      itemNames: { "narrow-aisle": "an aisle pinched narrower than the plan calls for", "exit-blocked": "a fire exit with tables stacked in front of it" },
      itemNotes: {
        "narrow-aisle": "This aisle has drifted narrower than the floor plan's own egress width — every table nudged a few inches to make room for the next one adds up to an aisle that no longer measures what the fire code assumed it would.",
        "exit-blocked": "A stack of spare tables leaning against this exit door is the kind of thing that seems temporary right up until the room needs that door to actually open.",
      },
      title: "Walk the aisles and the exits before doors open",
      cue: "Two things in this room are narrower or blocked compared to the plan. Find them before the room fills.",
      why: "NFPA 101's egress requirements are only as real as the room actually measures on the night — a plan drawn with the right aisle widths and exit clearances protects nobody if the finished room has quietly drifted away from it by the time the doors open.",
    },
    {
      id: "time-log", kind: "select", target: "time-sheet",
      title: "Log the changeover's time",
      cue: "Mark the room complete and the changeover time on the crew sheet.",
      why: "The time sheet is what the union contract's setup-crew staffing language actually runs on — a changeover logged honestly is the record that shows whether tonight's room, at tonight's table count, was built with the crew and the time the contract calls for.",
    },
  ],

  interrupts: [
    {
      id: "coworker-solo-carry",
      kind: "Coworker carrying a table alone",
      after: "two-person-lift", delay: 3, seconds: 12,
      alert: "Just as you and your partner are setting your own table down, a coworker across the room has picked up a round table by one edge and is trying to carry it alone rather than waiting for a second set of hands.",
      cue: "Grab the other side and lift it with them — don't let them keep carrying it solo.",
      target: "assist-lift",
      why: "A round table carried by one person is carried off-balance by definition, and the moment it tips is the moment whoever's under it takes the weight and the edge both — getting a second set of hands on it before that happens is the entire reason the two-person lift is the rule rather than a suggestion.",
      missNote: "The table stayed a one-person carry the whole window. An off-balance table carried alone is a dropped table waiting on the first uneven spot in the floor, and nobody stepped in to make it a two-person lift before that happened.",
      wrongNote: "That doesn't help them. Get to the other side of the table and lift it together — a solo carry needs a second set of hands, not a second opinion.",
    },
    {
      id: "riser-unlocked",
      kind: "Unlocked riser found under load",
      after: "riser-brace", delay: 3, seconds: 12,
      alert: "While you're bracing this platform, a second riser section nearby flexes underfoot as gear is loaded onto the stage — its leg-lock lever was never thrown and that platform is shifting.",
      cue: "Get the weight off it and throw the lock lever now.",
      target: "riser-lock-lever-2",
      why: "A riser that flexes under load with an unlocked leg is seconds from that leg folding or sliding out from under whoever or whatever is standing on it — the lock lever is the only thing standing between a shifting platform and a collapsed one, and it has to be thrown before anything else is loaded onto that section.",
      missNote: "The section kept flexing under load with the lever never thrown. A riser leg that isn't locked doesn't announce it's about to fail — the flex was the only warning this platform gave, and it went unanswered.",
      wrongNote: "That doesn't stop the flex. The leg-lock lever on that section is what actually stops it — throw it before anything else goes onto that platform.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.6, BSL_ACCENT);

    // -------------------------------------------------------------- dance floor
    // A maple-look parquet patch set into the hotel carpet, the way a
    // portable dance floor is actually laid down over a ballroom's own finish.
    const floorTex = surfaceTexture((cx, w, h) => pavingFace(cx, w, h, { tiles: 10, base: "#c9a06a", base2: "#bb9260", seam: "rgba(60,40,20,0.35)" }), { repeat: 5, px: 384 });
    const danceFloor = box(g, 3.0, 0.02, 2.6, 0.2, 0.011, 0.6, 0xc9a06a, { rough: 0.35, metal: 0.05 });
    danceFloor.material = texturedMat(floorTex, { rough: 0.32, metal: 0.08, color: 0xc9a06a });
    const panelSeam = box(g, 0.5, 0.006, 2.6, 1.4, 0.021, 0.6, 0x8a6a3c, { rough: 0.5, opacity: 0.5, transparent: true, cast: false });
    holoTag(g, "panel — align first", 1.4, 0.1, 0.6, { css: "#c98a4a", w: 0.44 });
    reg(hits, panelSeam, "panel-align");
    const panelLatch = box(g, 0.08, 0.02, 0.1, 1.4, 0.02, 1.6, 0x22262b, { rough: 0.5, metal: 0.6 });
    reg(hits, panelLatch, "panel-lock");

    // ------------------------------------------------------------- floor plan
    const planBoard = holoPanel(g, 0.58, 0.42, -2.8, 1.6, -1.6, (ctx, w, h) => {
      ctx.fillStyle = "rgba(20,12,4,0.9)"; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#c98a4a"; ctx.fillRect(0, 0, w, 5);
      ctx.fillStyle = "#fbeede";
      ctx.font = `600 ${Math.round(h * 0.1)}px 'Barlow Condensed', Arial, sans-serif`;
      ctx.textAlign = "left"; ctx.textBaseline = "middle";
      ctx.fillText("FLOOR PLAN — GRAND BALLROOM", w * 0.06, h * 0.15);
      ctx.font = `${Math.round(h * 0.08)}px Arial, sans-serif`;
      ctx.fillStyle = "#e6d2b6";
      ["24 round tables · dance floor centre", "Stage risers, house left", "Aisles: 48in min · 2 marked exits"].forEach((l, i) => ctx.fillText(l, w * 0.06, h * (0.38 + i * 0.16)));
    }, { ry: 0.55, accent: BSL_ACCENT });
    reg(hits, planBoard, "floor-plan-board");

    // --------------------------------------------------------------- tables
    const tableStack = group(g, -2.6, 0, -0.8, 0.3);
    for (let i = 0; i < 3; i++) cyl(tableStack, 0.55, 0.55, 0.05, 0, 0.1 + i * 0.09, 0, 0x8b6a48, { rough: 0.6, seg: 24 });
    const dolly = group(g, -2.2, 0, -0.1, 0.3);
    box(dolly, 0.6, 0.04, 0.6, 0, 0.05, 0, 0x2b3138, { rough: 0.5, metal: 0.5 });
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) cyl(dolly, 0.03, 0.03, 0.05, sx * 0.25, 0.025, sz * 0.25, 0x14171a, { rough: 0.7, seg: 10 });
    const roundTable = cyl(dolly, 0.55, 0.55, 0.06, 0, 0.08, 0, 0x8b6a48, { rough: 0.55, seg: 24 });
    reg(hits, roundTable, "round-table");
    const tableSocket = torus(g, 0.56, 0.01, 0.4, 0.015, 0.8, 0xc98a4a, { emissive: 0xc98a4a, ei: 1.4, rough: 0.5, cast: false, seg: 6, seg2: 32 });
    hits["table-socket"] = tableSocket;
    // A table already placed, legs unlocked, near the lift zone.
    const placedTable = group(g, 0.4, 0, 0.8, 0.2);
    cyl(placedTable, 0.55, 0.55, 0.06, 0, 0.72, 0, 0x8b6a48, { rough: 0.55, seg: 24 });
    const tableLeg = box(placedTable, 0.05, 0.66, 0.05, 0.4, 0.34, 0, 0x2b3138, { rough: 0.5, metal: 0.4 });
    holoTag(placedTable, "call the lift", 0.4, 0.05, 0, { css: "#c98a4a", w: 0.3 });
    reg(hits, tableLeg, "lift-cue");
    const legLockHit = box(placedTable, 0.08, 0.02, 0.08, 0.4, 0.02, 0, 0x22262b, { rough: 0.5, metal: 0.6 });
    reg(hits, legLockHit, "legs-locked");
    // A dragged-and-scraped table off to the side, gouging the dance floor.
    const scrapedTable = group(g, 1.9, 0, 1.3, -0.3);
    cyl(scrapedTable, 0.55, 0.55, 0.06, 0, 0.35, 0, 0x7a5a3c, { rough: 0.7, seg: 24 });
    scrapedTable.rotation.z = 0.15;
    holoTag(scrapedTable, "dragged, not carried?", 0, 0.6, 0, { css: "#f0645b", w: 0.44 });
    reg(hits, scrapedTable, "table-drag-scrape");

    // --------------------------------------------------------------- chairs
    const chairArea = group(g, -1.4, 0, 1.7, -0.3);
    const chairStackObj = group(chairArea, 0, 0, 0);
    for (let i = 0; i < 8; i++) {
      slab(chairStackObj, 0.42, 0.05, 0.42, 0, 0.1 + i * 0.09, 0, i % 2 ? 0x3a4148 : 0x4a545c, { radius: 0.03, rough: 0.7 });
    }
    reg(hits, chairStackObj, "chair-stack");
    const stackGauge = instrument(chairArea, 0.5, 1.0, 0, { idle: "-- chairs", color: BSL_ACCENT, w: 0.14, d: 0.2 });
    holoTag(chairArea, "stack height", 0.5, 1.24, 0, { css: "#c98a4a", w: 0.34 });
    reg(hits, stackGauge, "chair-stack-gauge");
    const bendKnees = box(chairArea, 0.14, 0.02, 0.14, -0.5, 0.02, 0, 0x22262b, { rough: 0.5 });
    holoTag(chairArea, "bend the knees", -0.5, 0.1, 0, { css: "#59c97b", w: 0.36 });
    reg(hits, bendKnees, "bend-knees");
    const liftStraight = box(chairArea, 0.14, 0.02, 0.14, -0.5, 0.02, 0.3, 0x22262b, { rough: 0.5 });
    reg(hits, liftStraight, "lift-straight");
    // A second stack, already over the manufacturer's limit.
    const overStack = group(chairArea, -0.9, 0, -0.5);
    for (let i = 0; i < 13; i++) slab(overStack, 0.42, 0.05, 0.42, Math.sin(i * 0.3) * 0.02, 0.1 + i * 0.085, 0, i % 2 ? 0x3a4148 : 0x4a545c, { radius: 0.03, rough: 0.7 });
    holoTag(overStack, "add one more?", 0, 1.35, 0, { css: "#f0645b", w: 0.36 });
    reg(hits, overStack, "chair-overstack");
    const storageCart = group(g, -2.7, 0, 2.6, 0.2);
    box(storageCart, 0.7, 0.05, 0.7, 0, 0.06, 0, 0x8b929a, { rough: 0.4, metal: 0.6 });
    const storageSlot = box(storageCart, 0.6, 0.05, 0.6, 0, 0.1, 0, 0xffffff, { opacity: 0.001, transparent: true, cast: false });
    hits["storage-slot"] = storageSlot;
    holoTag(storageCart, "chair storage", 0, 0.3, 0, { css: "#c98a4a", w: 0.32 });

    // ---------------------------------------------------------------- stage
    const stage = group(g, 2.2, 0, -1.6, -0.4);
    box(stage, 1.8, 0.4, 1.4, 0, 0.2, 0, 0x3a2c1e, { rough: 0.7 });
    const riser = group(stage, -0.9, 0, 0);
    box(riser, 0.7, 0.38, 1.3, 0, 0.19, 0, 0x4a3a28, { rough: 0.65 });
    reg(hits, riser, "riser-section");
    const riserLever = group(stage, -0.9, 0, 0.7);
    cyl(riserLever, 0.02, 0.02, 0.16, 0, 0.15, 0, CITY.steel, { rough: 0.35, metal: 0.8, seg: 10 });
    const leverArm = box(riserLever, 0.02, 0.1, 0.02, 0, 0.24, 0.02, 0xd8232a, { rough: 0.5 });
    holoTag(riserLever, "riser leg lock", 0, 0.36, 0, { css: "#c98a4a", w: 0.36 });
    reg(hits, leverArm, "riser-lock-lever");
    const platformBrace = box(riser, 0.6, 0.04, 1.1, 0, 0.4, 0, 0xffffff, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, platformBrace, "riser-platform");
    const wedgeShortcut = box(riser, 0.1, 0.06, 0.1, -0.3, 0.02, 0.5, 0x8a6a3c, { rough: 0.75 });
    holoTag(riser, "wedge it instead?", -0.3, 0.14, 0.5, { css: "#f0645b", w: 0.4 });
    reg(hits, wedgeShortcut, "unlocked-riser-shortcut");
    // A second riser section, for the unlocked-under-load interrupt.
    const riser2 = group(stage, 0.9, 0, 0);
    box(riser2, 0.7, 0.38, 1.3, 0, 0.19, 0, 0x4a3a28, { rough: 0.65 });
    const riserLever2 = group(stage, 0.9, 0, 0.7);
    cyl(riserLever2, 0.02, 0.02, 0.16, 0, 0.15, 0, CITY.steel, { rough: 0.35, metal: 0.8, seg: 10 });
    const leverArm2 = box(riserLever2, 0.02, 0.1, 0.02, 0, 0.24, 0.02, 0xd8232a, { rough: 0.5 });
    reg(hits, leverArm2, "riser-lock-lever-2");
    const gearCrate = box(stage, 0.5, 0.4, 0.4, 0.9, 0.6, 0, 0x2b3138, { rough: 0.6 });
    void gearCrate;
    // Backdrop drape and a pair of uplights framing the stage.
    slab(stage, 2.0, 2.4, 0.06, 0, 1.6, -0.72, 0x2b211c, { radius: 0.02, rough: 0.85 });
    for (let i = 0; i < 5; i++) box(stage, 0.06, 2.3, 0.02, -0.95 + i * 0.47, 1.6, -0.7, 0x1c1512, { rough: 0.9, cast: false });
    for (const sx of [-1, 1]) {
      cyl(stage, 0.05, 0.06, 0.3, sx * 1.0, 0.15, -0.6, 0x2b3138, { rough: 0.5, metal: 0.4, seg: 12 });
      ball(stage, 0.03, sx * 1.0, 0.32, -0.55, 0xffd9a0, { emissive: 0xffd9a0, ei: 1.6, seg: 10 });
    }

    // Table linens: a skirt on the placed table and a folded-linen stack.
    for (let i = 0; i < 16; i++) {
      const a = (i / 16) * Math.PI * 2;
      box(placedTable, 0.09, 0.5, 0.01, Math.sin(a) * 0.56, 0.4, Math.cos(a) * 0.56, 0xece3d0, { rough: 0.8, cast: false }).rotation.y = a;
    }
    const linenStack = group(g, -3.0, 0, 0.6, 0.2);
    for (let i = 0; i < 4; i++) box(linenStack, 0.4, 0.05, 0.3, 0, 0.05 + i * 0.06, 0, 0xece3d0, { rough: 0.75 });

    // Uplighting fixtures around the room perimeter and a rope stanchion
    // line by the exit — the finishing dressing an actual changeover leaves.
    for (const [x, z] of [[-3.3, -2.4], [3.3, -2.4], [-3.3, 2.4], [3.3, 2.4]]) {
      cyl(g, 0.06, 0.07, 0.14, x, 0.07, z, 0x2b3138, { rough: 0.5, metal: 0.4, seg: 12 });
      ball(g, 0.02, x, 0.15, z, 0xb08a5a, { emissive: 0xb08a5a, ei: 1.1, seg: 8 });
    }
    for (let i = 0; i < 2; i++) {
      const post = group(g, -3.3 + i * 0.9, 0, -3.0);
      cyl(post, 0.02, 0.02, 0.9, 0, 0.45, 0, 0xb08a5a, { rough: 0.4, metal: 0.6, seg: 10 });
      ball(post, 0.04, 0, 0.9, 0, 0x2b211c, { rough: 0.5, seg: 10 });
    }

    // ------------------------------------------------------------- cabling
    const cordRun = group(g, 0, 0, 2.4, 0);
    cyl(cordRun, 0.012, 0.012, 1.6, 0, 0.008, 0, 0x1b1e22, { rough: 0.6, seg: 8 }).rotation.x = Math.PI / 2;
    const cableRampObj = box(cordRun, 0.4, 0.03, 0.5, 0, 0.02, 0, 0xf2c14b, { rough: 0.6 });
    holoTag(cordRun, "cable ramp", 0, 0.14, 0, { css: "#c98a4a", w: 0.3 });
    reg(hits, cableRampObj, "cable-ramp");
    const bareCord = group(g, 3.0, 0, 0.6, 0);
    cyl(bareCord, 0.01, 0.01, 1.2, 0, 0.006, 0, 0x1b1e22, { rough: 0.6, seg: 8 }).rotation.x = Math.PI / 2;
    holoTag(bareCord, "no ramp here?", 0, 0.1, 0, { css: "#f0645b", w: 0.34 });
    reg(hits, bareCord, "cord-no-ramp");

    // --------------------------------------------------------- aisles + exits
    const aisleMark = slab(g, 1.2, 0.006, 3.4, -3.6, 0.004, 0.8, 0x2f6f8c, { radius: 0.02, rough: 0.9, opacity: 0.3, transparent: true, cast: false });
    void aisleMark;
    const narrowSpot = box(g, 0.5, 0.006, 0.5, -3.4, 0.01, 1.6, 0xf0645b, { opacity: 0.4, transparent: true, cast: false, rough: 0.5 });
    holoTag(g, "aisle pinched here", -3.4, 0.1, 1.6, { css: "#f0645b", w: 0.4 });
    reg(hits, narrowSpot, "narrow-aisle");
    const exitDoor = group(g, -3.6, 0, -1.6, 0.3);
    box(exitDoor, 0.1, 2.1, 1.0, 0, 1.05, 0, 0x3a4148, { rough: 0.6, metal: 0.3 });
    decal(exitDoor, 0.24, 0.12, 0.06, 1.8, 0, signFace("EXIT", { bg: "#0d1c14", accent: "#59c97b", scale: 0.55 }), { glow: true, ei: 0.7, px: 128 });
    const exitStack = group(exitDoor, 0.3, 0, 0.2);
    for (let i = 0; i < 2; i++) cyl(exitStack, 0.5, 0.5, 0.05, 0, 0.1 + i * 0.08, 0, 0x8b6a48, { rough: 0.6, seg: 20 });
    holoTag(exitStack, "blocks the door?", 0, 0.4, 0, { css: "#f0645b", w: 0.36 });
    reg(hits, exitStack, "exit-blocked");

    // -------------------------------------------------------------- time log
    const timeSheet = holoPanel(g, 0.5, 0.34, -2.9, 1.4, 1.8, (ctx, w, h) => {
      ctx.fillStyle = "rgba(20,12,4,0.9)"; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#c98a4a"; ctx.fillRect(0, 0, w, 5);
      ctx.fillStyle = "#fbeede";
      ctx.font = `600 ${Math.round(h * 0.16)}px 'Barlow Condensed', Arial, sans-serif`;
      ctx.textAlign = "center"; ctx.textBaseline = "middle";
      ctx.fillText("CHANGEOVER LOG", w / 2, h * 0.32);
      ctx.font = `${Math.round(h * 0.1)}px Arial, sans-serif`;
      ctx.fillStyle = "#e6d2b6";
      ctx.fillText("Crew · start · finish", w / 2, h * 0.6);
      ctx.fillText("signed by the floor captain", w / 2, h * 0.76);
    }, { ry: 0.55, accent: BSL_ACCENT });
    reg(hits, timeSheet, "time-sheet");

    // Second round table for the solo-carry interrupt, staged off to the side.
    const interruptTableGrp = group(g, -0.6, 0, 2.6, 0.4);
    const interruptTable = cyl(interruptTableGrp, 0.55, 0.55, 0.06, 0, 0.5, 0, 0x8b6a48, { rough: 0.55, seg: 24 });
    interruptTable.rotation.z = 0.3;
    const assistLift = box(interruptTableGrp, 0.1, 0.06, 0.1, 0.5, 0.5, 0, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, assistLift, "assist-lift");
    interruptTableGrp.visible = false;

    // Crew: the setup lead reading the plan, clear of every table and cart.
    const lead = standingFigure(g, -1.4, -1.0, { ry: 2.4, cloth: 0x37505f, trousers: 0x2b3138, skin: 0xc99878 });
    // Coworker attempting the solo carry, appears mid-lift at the interrupt.
    const coworker = standingPerson(g, -0.9, 2.3, { ry: 0.6, cloth: 0x5a4a3a, hiVis: false, skin: 0xb98868 });

    let soloCarrying = false;

    return {
      hits,
      footprint: 2.6,
      spawnLook: new THREE.Vector3(0, 1.2, 0),

      onStepComplete(step) {
        if (step.id === "table-move") { roundTable.visible = false; }
        if (step.id === "two-person-lift") tableLeg.material = mat(0x59c97b, { rough: 0.5 });
        if (step.id === "chair-stack-height") repaint(stackGauge.userData.screen, signFace("OK", { bg: "#0d1c14", accent: "#59c97b", fg: "#e9ffe9", scale: 0.6 }));
        if (step.id === "chair-cart") chairStackObj.visible = false;
        if (step.id === "dance-floor-lock") panelSeam.material = mat(0x59c97b, { rough: 0.5, opacity: 0.5, transparent: true });
        if (step.id === "riser-align") riser.position.x = -0.85;
        if (step.id === "riser-leg-lock") { leverArm.rotation.x = -1.2; leverArm.material = mat(0x59c97b, { rough: 0.5 }); }
        if (step.id === "cable-ramp") cableRampObj.material = mat(0x59c97b, { rough: 0.5 });
        if (step.id === "exit-aisle-check") { narrowSpot.visible = false; exitStack.position.set(8, -2, 8); }
      },

      onInterrupt(it) {
        if (it.id === "coworker-solo-carry") { soloCarrying = true; coworker.torso.rotation.z = 0.3; interruptTableGrp.visible = true; }
        if (it.id === "riser-unlocked") { riser2.position.y = Math.sin(0) * 0.01; leverArm2.material = mat(0xf0645b, { emissive: 0xf0645b, ei: 1.2, rough: 0.5 }); }
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "coworker-solo-carry") { soloCarrying = false; coworker.torso.rotation.z = 0; interruptTableGrp.visible = false; }
        if (it.id === "riser-unlocked") { leverArm2.rotation.x = -1.2; leverArm2.material = mat(0x59c97b, { rough: 0.5 }); }
      },

      animate(t) {
        lead.userData.head.rotation.y = Math.sin(t * 0.4) * 0.3;
        if (soloCarrying) interruptTableGrp.position.y = Math.sin(t * 5) * 0.02;
      },
    };
  },
};
