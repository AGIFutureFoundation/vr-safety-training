import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import { box, cyl, slab, group, decal, repaint, signFace, paperFace, mat, hose } from "../../../shared/kit.js";
import {
  stationPad, holoPanel, holoTag, standingFigure, reg, surfaceTexture, texturedMat, pavingFace,
} from "../citykit.js";
import { radio, tapeMeasure, tieDownStrap } from "../../../shared/toolkit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Banquet Room Flip & Staging VR — Culinary & Hospitality,
// hotel banquet series.
//
// A generic hotel ballroom turned over between a daytime classroom set and
// an evening dinner with a stage: the strike done in an order that keeps the
// floor clear, the folded rounds rolled onto the table truck and strapped,
// the stage decks brought in on their riser cart and lifted by a called team
// of four, the open back edge of the stage guarded, the AV snake ramped, the
// aisles read against the floor plan and the exits walked — all against a
// clock that a banquet captain would like to beat by skipping things.
// banquet-setup-lift is the same floor on a slow afternoon (the dolly, the
// chair stacks, the riser leg-locks and the dance floor); this is the flip
// under time pressure and the egress it tends to cost. No real venue, event
// or occupancy figure is named: the fire marshal's approved diagram is "the
// floor plan", and it is the only number anyone works to.

const HBF_ACCENT = 0xc79a4a;
const HBF_CSS = "#c79a4a";
const HBF_WARN = "#e0664f";

/** A strike/flip placard in the ANSI Z535 NOTICE layout: blue italic header, black text on white. */
function hbfNotice(parent, x, y, z, ry, lines) {
  const p = decal(parent, 0.5, 0.34, x, y, z, (c, w, h) => {
    c.fillStyle = "#000"; c.fillRect(0, 0, w, h);
    c.fillStyle = "#fff"; c.fillRect(4, 4, w - 8, h - 8);
    c.fillStyle = "#0072ce"; c.fillRect(4, 4, w - 8, h * 0.26);
    c.fillStyle = "#fff"; c.font = `italic 800 ${Math.round(h * 0.18)}px Arial, sans-serif`; c.textAlign = "center"; c.textBaseline = "middle";
    c.fillText("NOTICE", w / 2, h * 0.17);
    c.fillStyle = "#000"; c.font = `700 ${Math.round(h * 0.1)}px Arial, sans-serif`;
    lines.forEach((l, i) => c.fillText(l, w / 2, h * (0.44 + i * 0.15)));
  }, { px: 320 });
  p.rotation.y = ry;
  return p;
}

export const SIM_HW_BANQUET_ROOM_FLIP_AND_STAGING = {
  id: "hw-banquet-room-flip-and-staging",
  index: "319",
  domain: "Culinary & Hospitality",
  trade: "Banquet houseman — UNITE HERE banquet crew, room flip and staging",
  category: "Culinary & Hospitality",
  indoor: "hotel",
  certification: "NFPA 101 Life Safety Code for the aisles, exit access and exit signs of an assembly room set to the approved floor plan; OSHA 29 CFR 1910.36 on exit routes kept unobstructed, and 29 CFR 1910.22 on walking-working surfaces kept free of trip hazards such as loose cable; the Revised NIOSH Lifting Equation behind team lifts of stage decks and folded rounds; Cal/OSHA's injury and illness prevention program, 8 CCR 3203, for the hazards of a room flip; UNITE HERE banquet training on lifting, carts and staffing a flip",
  name: "Banquet Room Flip & Staging",
  title: simTitle("Banquet Room Flip & Staging"),
  tagline: "A ballroom flipped from classroom to dinner with a stage, against the clock: the strike in order, rounds rolled onto the table truck and strapped, the riser cart pushed in, stage decks lifted by a called team of four while a vendor parks in the exit, the open back edge guarded, the AV snake ramped, aisles read against the floor plan, the exits walked and the flip logged — without skipping what the captain wants skipped",
  accent: HBF_ACCENT,
  accentCss: HBF_CSS,
  parSeconds: 280,
  footprint: 2.5,
  badge: { id: "flipped-not-rushed", name: "Flipped, Not Rushed", note: "The room turned on the plan with every lift called, every cable ramped and every exit clear, and the doors held rather than a corner cut" },

  supportLine: "your UNITE HERE local's member assistance line, or the employee assistance number on the banquet office board",

  game: system({
    name: "Banquet Flip",
    currency: "COVERS",
    ranks: ["Banquet Extra", "Houseman", "Set-up Lead", "Banquet Captain", "Room Flip Certified"],
    badges: [
      { id: "every-lift-called", name: "Every Lift Called", note: "No deck carried alone, no cart ridden, no cable under the carpet, nothing parked in the exit corridor", test: AWARD.safe },
      { id: "doors-held", name: "Doors Held", note: "The early-doors push answered by holding the doors, not by skipping the ramps", test: AWARD.stepClean("riser-cart-push") },
      { id: "on-the-plan", name: "On the Plan", note: "No corrections from the event order to the log", test: AWARD.clean },
    ],
    challenges: [
      { id: "flip-window", name: "Inside the Window", note: "Room flipped inside 80% of par", test: AWARD.fast(0.8) },
      { id: "steady-cart", name: "Steady Cart", note: "The riser cart held in band the whole push", test: AWARD.unbroken },
      { id: "aisle-true", name: "Aisle True", note: "The aisle read against the plan inside the band first time", test: AWARD.precise(0.7) },
    ],
  }),

  hazards: {
    "solo-deck-carry": "You went to pick up a stage deck on your own. A deck section is a wide, heavy, awkward panel whose weight sits far out from the body, the case the Revised NIOSH Lifting Equation shows costs the back most, and one person carrying it flat cannot see the floor, the cable or the step down. Decks move on the riser cart and come off it with a called team, every time.",
    "cable-under-carpet": "You started to push the AV snake under the edge of the carpet runner to hide it. A cable under a rug is still a trip ridge, now invisible, and every chair leg and cart wheel that crosses it crushes the jacket until it shorts. It goes over the aisle in a cable ramp that people can see and roll across.",
    "ride-the-cart": "You were about to ride the table truck down the service ramp. A loaded truck on a slope has more momentum than a person can stop from on top of it, the tables shift forward, and the rider goes off the front under the load. On a ramp the cart is controlled from the uphill end by two people walking.",
    "park-in-exit": "You began to park the empty table trucks in the exit corridor to get them out of the room. The exit corridor is the route three hundred guests take if the alarm sounds during dinner; a row of trucks there is the obstruction NFPA 101 and 29 CFR 1910.36 exist to prevent. Empty trucks go back to the storage room or a marked holding bay, never into the exit access.",
  },

  lateNotes: {
    "strap-ratchet": "The strap goes over once the rounds are all on the truck and standing in the cradle — not over a half-loaded cart.",
    "flip-log": "The log is the last thing, once the room is walked with the captain against the plan.",
    "aisle-tape": "The aisle is read once the rounds are set on their marks, not across an empty floor.",
  },

  steps: [
    {
      id: "event-order", kind: "select", target: "event-order",
      title: "Read the event order and the approved floor plan",
      cue: "Read tonight's event order: the flip window, the dinner set with a stage, and the floor plan with its aisles and exits as approved.",
      why: "The event order is the contract between the sales office and the crew, and the floor plan attached to it is the version of the room the fire marshal approved for this many guests — the aisle widths, the exit access, where the stage may sit. Everything done in the next hour is measured against that plan, so it is read before a single chair moves, while there is still time to ask about a stage that looks like it covers an exit.",
    },
    {
      id: "strike-order", kind: "sequence",
      targets: ["strike-tabletops", "strike-fold-tables", "strike-chairs"],
      itemNames: { "strike-tabletops": "tabletops cleared into bus tubs", "strike-fold-tables": "classroom tables folded and stood", "strike-chairs": "chairs stacked to the cart" },
      title: "Strike the classroom set in order",
      cue: "Clear the tabletops first, then fold and stand the classroom tables, then stack the chairs onto their cart.",
      why: "A strike done in the wrong order puts people carrying glassware through a forest of half-folded table legs. Tops first gets the breakables and the water pitchers off the floor while the tables are still stable; tables second opens the room; chairs last, because they are the one thing people use to stand on, sit on and block aisles with while waiting. The order is how a crew of four keeps the floor walkable for itself.",
      outOfOrderNote: "Tops, then tables, then chairs — folding a table with glass still on it is how the strike starts with broken glass on the carpet.",
    },
    {
      id: "table-truck", kind: "drag", target: "folded-round",
      title: "Roll the folded round onto the table truck",
      cue: "Tip the folded round onto its edge and roll it like a wheel into the table truck's cradle — do not carry it flat.",
      why: "A folded banquet round is heavy and wider than a person's reach, and carried flat it loads the back at full arm's length. On its edge it rolls, and the job becomes steering rather than lifting; the truck's cradle holds each round upright against the last. The lift that matters is avoided rather than done well, which is the first answer the Revised NIOSH Lifting Equation gives to any heavy, awkward load.",
      drag: { to: "truck-cradle", radius: 0.55, missNote: "Not seated in the cradle — roll it on its edge right into the truck's slot so it stands against the others, not leaning off the side." },
    },
    {
      id: "table-inspect", kind: "find", noHint: true,
      targets: ["bent-leg-brace", "missing-leg-pin"],
      itemNames: { "bent-leg-brace": "a round with a bent leg brace", "missing-leg-pin": "a leg-lock pin missing on another" },
      itemNotes: {
        "bent-leg-brace": "The brace on this round's leg is bent — it will fold under a guest's elbows at dinner. It is tagged and set aside, not set.",
        "missing-leg-pin": "This round's leg-lock pin is gone; the leg can swing shut under load. Tag it and pull a spare from storage.",
      },
      title: "Look over the rounds as they go on the truck",
      cue: "Two of the rounds going onto the truck should not be set tonight. Find them.",
      why: "The flip is the only time each table is handled by someone looking at its underside. A bent brace or a missing pin is invisible once a cloth is on it, and it shows up at dinner as a table folding into a guest's lap with hot plates on it. Tagging the bad ones now costs one spare from storage; missing them costs an incident report and a burn.",
    },
    {
      id: "strap-truck", kind: "turn", target: "strap-ratchet",
      title: "Strap the loaded table truck",
      cue: "Pass the strap over the rounds and work the ratchet until the load is snug against the cradle.",
      why: "Rounds on a truck lean on each other, and the first bump at a door threshold or the service ramp can walk the outer one off the cart onto somebody's foot. A snug strap makes the load one piece for the trip. It is ratcheted until it holds, not until it crushes the table edges, and it stays on until the truck is parked where the rounds will be set.",
      turn: { turns: 0.75, axis: "x", label: "RATCHET", readout: (t) => (t < 0.35 ? "slack" : t < 0.7 ? "taking up" : "snug") },
    },
    {
      id: "riser-cart-push", kind: "track", target: "riser-cart-handle", seconds: 7,
      title: "Push the riser cart in, two on the handle",
      cue: "With your partner, push the stage-deck cart through the service door and across the ballroom at a steady walk.",
      why: "A cart stacked with stage decks is tall and heavy, and it is the most likely thing in the flip to tip at a threshold or pin someone against a door frame. Two people on the handle, pushing at a walking pace with one watching the front corner, is how it goes through a doorway without a lurch. A cart rushed across carpet stops dead at the seam and throws its decks forward.",
      track: { start: 0.12, green: [0.4, 0.62], rise: 0.55, fall: 0.45, drift: 0.12, label: "CART", readout: (v) => (v < 0.4 ? "stalling at the seam" : v > 0.62 ? "rushing the door" : "steady walk") },
      holdBreakNote: "The cart pace went out of band. A stall at the carpet seam or a rush at the door frame is where decks shift and hands get pinched — bring it back to a steady walk.",
    },
    {
      id: "team-lift", kind: "hold", target: "lift-call", seconds: 6,
      title: "Lift the deck off the cart as a called team of four",
      cue: "One person calls it: hands on, lift on three, walk it to the stage legs together, set on the call. Hold until the deck is down.",
      why: "A stage deck is lifted by four because four people can each keep it close and upright, but only if they move together; a lift where one person goes early puts the whole weight through the last one to lift. The caller counts the lift, the walk and the set down, and nobody lets go until the call. The team is the engineering control here, and the call is what makes it one.",
      holdBreakNote: "You let go before the set-down call. Somebody else just took your corner of the deck by surprise — hold until the call, every time.",
    },
    {
      id: "stage-edge", kind: "sequence",
      targets: ["stair-unit", "back-guardrail", "stair-handrail"],
      itemNames: { "stair-unit": "stair unit set at the stage front", "back-guardrail": "guardrail on the open back edge", "stair-handrail": "handrail on the stair" },
      title: "Guard the stage: stair, back-edge rail, handrail",
      cue: "Set the stair unit at the stage front, fit the guardrail along the open back edge, then the handrail on the stair.",
      why: "The stage's open back edge is where a speaker steps back for a photo and where the crew works in the dark before doors. A guardrail there is what the venue's rules and the walking-working surfaces standard expect wherever the drop calls for one, and the stair with a handrail is how everyone gets up without stepping onto a chair. They go in before the linens, because a skirted stage hides the edge that needs the rail.",
      outOfOrderNote: "Stair first, then the back rail, then the handrail — the way up exists before anyone is working on the deck, and the edge is guarded before the stair is finished.",
    },
    {
      id: "cable-ramp", kind: "drag", target: "cable-ramp",
      title: "Ramp the AV snake across the service aisle",
      cue: "Carry the cable ramp to where the AV snake crosses the aisle and seat it over the cable.",
      why: "The AV snake from the stage to the mixing desk crosses the aisle servers will use all night with full trays and no view of their feet. A cable ramp covers it with a ridge that is bright, low and angled so a cart wheel and a shoe both roll over it, and the lid keeps the cable from being crushed. The walking-working surfaces standard wants the floor free of trip hazards; this is how a cable crossing meets that.",
      drag: { to: "ramp-socket", radius: 0.55, missNote: "Not over the cable crossing — seat the ramp right where the snake crosses the service aisle, cable in its channel." },
    },
    {
      id: "aisle-width", kind: "gauge", target: "aisle-tape",
      title: "Read the main aisle against the floor plan",
      cue: "Run the tape across the main aisle between the table rows and commit when the width reads true to the approved plan's mark.",
      why: "A room set by eye loses a hand's width of aisle at every row as tables creep toward the stage, and by the back of the room the aisle the fire marshal approved is a squeeze. NFPA 101 sizes assembly aisles for the occupant load, and the plan carries those widths; the tape is how the crew knows the room matches it before three hundred people and their chairs make it narrower still.",
      gauge: { label: "AISLE vs PLAN", speed: 0.7, green: [0.46, 0.64], readout: (t) => (t < 0.46 ? "narrower than the plan" : t > 0.64 ? "rows over their marks" : "true to the plan"), missNote: "Not true to the plan — slide the rows back onto their floor marks and run the tape again before the linens go on." },
    },
    {
      id: "egress-walk", kind: "find", noHint: true,
      targets: ["drape-over-exit-sign", "chairs-at-crash-bar", "cord-under-door"],
      itemNames: { "drape-over-exit-sign": "pipe-and-drape hiding an exit sign", "chairs-at-crash-bar": "a chair stack against the exit's crash bar", "cord-under-door": "an extension cord run under the exit door" },
      itemNotes: {
        "drape-over-exit-sign": "The decorator's drape has been hung across the exit sign. In smoke, a guest looks for that sign first; it has to be visible from the room.",
        "chairs-at-crash-bar": "Spare chairs are stacked against the exit door's crash bar. An exit door has to open with one push from inside, every minute the room is occupied.",
        "cord-under-door": "An extension cord runs under the exit door to the corridor. It stops the door closing, props it for smoke, and is a trip at the threshold.",
      },
      title: "Walk the exits before the linens go on",
      cue: "Three things are wrong with the exits and the way to them. Find them.",
      why: "Exits fail quietly during a flip: a decorator's drape, a spare chair stack, a cord for a photo booth. Each one is somebody else solving their problem, and together they turn an exit into a wall. The walk is done before the linens and centrepieces, because afterwards the room looks finished and nobody looks at the doors again until the alarm sounds.",
    },
    {
      id: "captain-walk", kind: "sequence",
      targets: ["captain-signoff", "captain-sign-line"],
      itemNames: { "captain-signoff": "the set walked against the floor plan", "captain-sign-line": "the flip signed over on the plan" },
      outOfOrderNote: "Walk it first, then sign — a signature on a room nobody compared to the plan is a signature on a guess.",
      title: "Walk the room with the captain, then sign it over",
      cue: "Walk the finished set with the banquet captain, the floor plan in hand, and sign the flip over only once it matches.",
      why: "The captain signs the room over to the event, and the crew signs it over to the captain; a joint walk against the plan is where the tagged tables, the held doors and the cleared exit get seen by the person who will be running the room at dinner. A sign-off on a room the captain never walked is a signature on a guess.",
    },
    {
      id: "flip-log", kind: "select", target: "flip-log",
      title: "Log the flip: time, lifts, tags and the exit",
      cue: "Write the flip time, who was on each team lift, the two tables tagged out, and the vendor's cart moved from the exit.",
      why: "The flip log is how the banquet office learns what a flip really takes: a window too short for the crew it was given shows up as the early-doors push, tables tagged out become a repair order, and a vendor who parked in an exit becomes a conversation with the vendor. It is also the record that the lifts were done as teams, which is what the staffing argument next month rests on.",
    },
    {
      id: "crew-checkin", kind: "select", target: "crew-radio",
      title: "Check in with the crew and the banquet manager",
      cue: "Radio the banquet manager that the room is set to the plan and the doors can open, and check in with the crew on how the flip went.",
      why: "The doors open on the manager's word, and they need the room's status from the crew, not from the clock. A flip under pressure is also hard on the people who did it — a near miss with a deck, a captain leaning on them to skip steps — and the member assistance line and the steward are there for that, as much as the union contract is there for the staffing.",
    },
  ],

  interrupts: [
    {
      id: "doors-early",
      kind: "Pushed to skip steps",
      after: "riser-cart-push", delay: 2, seconds: 13,
      alert: "The banquet captain storms in: the guests are early, the doors open in ten minutes, skip the cable ramps, tape the cords and leave the trucks in the corridor.",
      cue: "Do not skip the ramps or park in the exit. Call the banquet manager on the house phone to hold the doors until the room is safe.",
      target: "house-phone",
      why: "Time pressure is how the hazards of a flip get made: taped cords, trucks in the exit corridor, a stage with no rail. The doors are held by the person who owns the event, the banquet manager, and that call takes a minute; skipping the ramps takes a guest to the emergency room. Refusing to skip a safety step is the crew doing its job, and the union contract backs a worker who says so.",
      missNote: "The captain's clock won. The crew taped the snake down, stacked the empty trucks in the exit corridor and opened the doors on a room that no longer matched its plan — and a server went down over the taped cable with a full tray inside the first half hour.",
      wrongNote: "That does not hold the doors. The house phone to the banquet manager is how the clock gets moved — not by the crew skipping the ramps.",
    },
    {
      id: "vendor-in-exit",
      kind: "Exit blocked",
      after: "team-lift", delay: 2, seconds: 12,
      alert: "While the team is mid-lift, a cake vendor wheels a tall delivery cart through the side exit and parks it squarely in front of the exit door.",
      cue: "Once the deck is set, get to the side exit and move the cart out of the exit access — then tell the vendor where to stage.",
      target: "side-exit",
      why: "An exit access blocked for 'just a minute' during a flip is blocked when the room is full, because nobody who parked there comes back. The side exit is part of the room's approved egress, and moving the cart — and telling the vendor where the holding bay is — takes less time than arguing about whose cart it is.",
      missNote: "The cake cart stayed in front of the side exit through the flip and into the dinner. When a fire alarm tripped in the kitchen during the salad course, the guests at that end of the room found their nearest exit blocked and had to cross the whole ballroom to the doors.",
      wrongNote: "The side exit is the problem now. Move the vendor's cart out of the exit access; the rest of the set can wait a minute.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.5, HBF_ACCENT);

    // ---------------------------------------------------------- ballroom floor
    const carpetTex = surfaceTexture((cx, w, h) => pavingFace(cx, w, h, { tiles: 12, base: "#6a3f3a", base2: "#5f3934", seam: "rgba(255,220,160,0.06)" }), { repeat: 3, px: 384 });
    const carpet = box(g, 5.6, 0.02, 5.0, 0, 0.011, 0, 0x6a3f3a, { rough: 0.95, cast: false });
    carpet.material = texturedMat(carpetTex, { rough: 0.95, color: 0x7a4a44 });
    // Walls: back wall with the service door and the side wall with the exit.
    box(g, 5.6, 2.6, 0.1, 0, 1.3, -2.55, 0xe7dccb, { rough: 0.85 });
    box(g, 0.1, 2.6, 5.0, -2.85, 1.3, 0, 0xe7dccb, { rough: 0.85 });
    box(g, 5.6, 0.14, 0.12, 0, 0.07, -2.48, 0x5a3a2a, { rough: 0.6 });
    for (const x of [-1.8, 0.2]) box(g, 0.5, 0.9, 0.04, x, 1.8, -2.48, 0xd8c79a, { rough: 0.5, metal: 0.3 });     // sconce plates

    // ------------------------------------------------------ event order board
    const order = holoPanel(g, 0.82, 0.54, -2.2, 1.55, -2.3, (ctx, w, h) => {
      ctx.fillStyle = "#1a130a"; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = HBF_CSS; ctx.fillRect(0, 0, w, 6);
      ctx.font = `600 ${Math.round(h * 0.11)}px 'Barlow Condensed', Arial, sans-serif`;
      ctx.textAlign = "left"; ctx.textBaseline = "middle"; ctx.fillStyle = "#f4ead8";
      ctx.fillText("EVENT ORDER — BALLROOM B FLIP", w * 0.05, h * 0.13);
      ctx.font = `${Math.round(h * 0.075)}px Arial, sans-serif`; ctx.fillStyle = "#e6d8bc";
      ["Day: classroom set — strike 16:00", "Night: dinner rounds + stage", "Floor plan: as approved, aisles marked", "Stage: 4 decks, stair, back rail", "AV snake: stage to desk, ramp it", "Exits: side and rear clear, signs lit"].forEach((l, i) => ctx.fillText(l, w * 0.05, h * (0.3 + i * 0.11)));
    }, { accent: HBF_ACCENT, ry: 0.3 });
    reg(hits, order, "event-order");

    // Clock panel over the service door: swapped red when the captain pushes.
    const clockMatOk = mat(0x1d3a2a, { emissive: 0x59c97b, ei: 0.5, rough: 0.5 });
    const clockMatRed = mat(0x3a1d1d, { emissive: 0xe0664f, ei: 1.4, rough: 0.5 });
    const clock = box(g, 0.5, 0.18, 0.04, 1.4, 2.4, -2.48, 0x1d3a2a, { rough: 0.5 });
    clock.material = clockMatOk;
    decal(g, 0.44, 0.13, 1.4, 2.4, -2.455, signFace("DOORS 19:00", { bg: "#0d1a12", accent: HBF_CSS, fg: "#f4ead8", scale: 0.5 }), { glow: true, ei: 0.6 });

    // ------------------------------------------------------ the classroom set
    const classroom = group(g, -1.4, 0, -1.3);
    const topsHit = group(classroom, 0, 0, 0);
    box(topsHit, 1.2, 0.03, 0.45, 0, 0.74, 0, 0xf2eee4, { rough: 0.8 });
    for (const sx of [-0.55, 0.55]) box(topsHit, 0.03, 0.72, 0.03, sx, 0.36, 0, 0x7d858c, { rough: 0.4, metal: 0.6 });
    for (let i = 0; i < 3; i++) cyl(topsHit, 0.035, 0.03, 0.12, -0.35 + i * 0.35, 0.82, 0, 0xcfe3ea, { rough: 0.1, transparent: true, opacity: 0.6, seg: 10 });
    holoTag(classroom, "tops: glass and pitchers", 0, 1.05, 0, { css: HBF_CSS, w: 0.42 });
    reg(hits, topsHit, "strike-tabletops");
    const busTub = box(classroom, 0.5, 0.18, 0.35, 0.2, 0.09, 0.5, 0x3a3f45, { rough: 0.6 });
    void busTub;
    const foldTables = group(classroom, -0.9, 0, 0.3);
    for (let i = 0; i < 3; i++) box(foldTables, 0.04, 0.45, 1.2, i * 0.07, 0.25, 0, 0xe9e2d0, { rough: 0.7 });
    holoTag(foldTables, "fold and stand", 0, 0.62, 0, { css: HBF_CSS, w: 0.28 });
    reg(hits, foldTables, "strike-fold-tables");
    const chairCart = group(g, -2.2, 0, 0.2);
    box(chairCart, 0.5, 0.06, 0.5, 0, 0.08, 0, 0x3a3f45, { rough: 0.6, metal: 0.4 });
    for (let i = 0; i < 6; i++) box(chairCart, 0.44, 0.06, 0.44, 0, 0.16 + i * 0.1, 0, i % 2 ? 0xc79a4a : 0xb5893e, { rough: 0.6 });
    holoTag(chairCart, "chairs to the cart", 0, 0.9, 0, { css: HBF_CSS, w: 0.32 });
    reg(hits, chairCart, "strike-chairs");

    // --------------------------------------------------------- the table truck
    const truck = group(g, 1.3, 0, -1.0, -0.2);
    box(truck, 1.3, 0.08, 0.6, 0, 0.12, 0, 0x4a5058, { rough: 0.5, metal: 0.6 });
    for (const sx of [-0.58, 0.58]) for (const sz of [-0.26, 0.26]) cyl(truck, 0.06, 0.06, 0.05, sx, 0.06, sz, 0x22262b, { rough: 0.7, seg: 10 });
    for (const sx of [-0.62, 0.62]) box(truck, 0.04, 0.7, 0.5, sx, 0.5, 0, 0x6b737c, { rough: 0.5, metal: 0.6 });
    const loaded = [];
    for (let i = 0; i < 3; i++) {
      const r = cyl(truck, 0.55, 0.55, 0.05, -0.3 + i * 0.12, 0.7, 0, 0xd9cdb2, { rough: 0.7, seg: 24 });
      r.rotation.z = Math.PI / 2; loaded.push(r);
    }
    const legBrace = box(truck, 0.03, 0.3, 0.03, -0.3, 0.55, 0.3, 0x8a4a22, { rough: 0.8, metal: 0.4 });
    legBrace.rotation.x = 0.5;
    reg(hits, legBrace, "bent-leg-brace");
    const pinGap = box(truck, 0.06, 0.06, 0.06, -0.06, 0.4, 0.3, 0xe0664f, { emissive: 0xe0664f, ei: 0.6, rough: 0.5 });
    reg(hits, pinGap, "missing-leg-pin");
    const cradle = box(truck, 0.2, 0.3, 0.5, 0.35, 0.4, 0, 0xffffff, { opacity: 0.001, transparent: true, cast: false });
    hits["truck-cradle"] = cradle;
    holoTag(truck, "table truck — cradle", 0.35, 1.35, 0, { css: HBF_CSS, w: 0.38 });
    const strap = tieDownStrap(truck, 0.1, 1.26, 0.0, { ry: 0 });
    holoTag(truck, "strap ratchet", 0.25, 1.48, 0.1, { css: HBF_CSS, w: 0.26 });
    reg(hits, strap, "strap-ratchet");
    const rideHit = box(truck, 0.5, 0.2, 0.4, -0.3, 1.2, 0, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(truck, "ride it down the ramp?", -0.3, 1.6, 0.1, { css: HBF_WARN, w: 0.42 });
    reg(hits, rideHit, "ride-the-cart");
    // The round still on the floor, folded, to be rolled onto the truck.
    const round = cyl(g, 0.55, 0.55, 0.05, 0.3, 0.56, -0.2, 0xe2d6bc, { rough: 0.7, seg: 24 });
    round.rotation.x = Math.PI / 2; round.rotation.z = 0.3;
    holoTag(g, "folded round — roll on edge", 0.3, 1.25, -0.2, { css: HBF_CSS, w: 0.5 });
    reg(hits, round, "folded-round");

    // --------------------------------------------------------- the riser cart
    const riserCart = group(g, 2.1, 0, 0.6, -Math.PI / 2);
    box(riserCart, 1.3, 0.1, 0.7, 0, 0.14, 0, 0x3a3f45, { rough: 0.5, metal: 0.5 });
    for (const sx of [-0.58, 0.58]) for (const sz of [-0.3, 0.3]) cyl(riserCart, 0.07, 0.07, 0.06, sx, 0.07, sz, 0x22262b, { rough: 0.7, seg: 10 });
    const decks = [];
    for (let i = 0; i < 3; i++) { const d = box(riserCart, 1.2, 0.9, 0.08, 0, 0.66, -0.18 + i * 0.12, 0x2a2622, { rough: 0.6 }); decks.push(d); }
    const cartHandle = cyl(riserCart, 0.022, 0.022, 0.64, 0.7, 0.95, 0, 0x1b1e23, { rough: 0.5, seg: 10 });
    cartHandle.rotation.x = Math.PI / 2;
    holoTag(riserCart, "riser cart — two on the handle", 0.7, 1.2, 0, { css: HBF_CSS, w: 0.52 });
    reg(hits, cartHandle, "riser-cart-handle");
    const soloDeck = box(g, 0.5, 0.3, 0.3, 2.6, 1.3, 1.2, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "carry a deck alone?", 2.6, 1.62, 1.2, { css: HBF_WARN, w: 0.36 });
    reg(hits, soloDeck, "solo-deck-carry");

    // ------------------------------------------------------------- the stage
    const stage = group(g, -0.3, 0, 1.6);
    const deckSet = [];
    for (let i = 0; i < 2; i++) {
      const d = box(stage, 1.2, 0.08, 0.9, -0.6 + i * 1.2, 0.46, 0, 0x2a2622, { rough: 0.6 });
      deckSet.push(d);
      for (const sx of [-0.5, 0.5]) for (const sz of [-0.38, 0.38]) box(stage, 0.05, 0.42, 0.05, -0.6 + i * 1.2 + sx, 0.21, sz, 0x6b737c, { rough: 0.5, metal: 0.6 });
    }
    deckSet[1].visible = false;
    const liftCall = box(stage, 1.1, 0.12, 0.8, 0.6, 0.5, 0, 0xc79a4a, { opacity: 0.3, transparent: true, cast: false });
    holoTag(stage, "team lift — on the call", 0.6, 0.9, 0, { css: HBF_CSS, w: 0.42 });
    reg(hits, liftCall, "lift-call");
    const stair = group(stage, -1.0, 0, -0.62);
    for (let i = 0; i < 2; i++) box(stair, 0.6, 0.08, 0.26, 0, 0.15 + i * 0.16, -0.18 + i * 0.13, 0x3a342e, { rough: 0.6 });
    stair.visible = false;
    const stairHit = box(stage, 0.6, 0.35, 0.4, -1.0, 0.2, -0.7, 0xc79a4a, { opacity: 0.25, transparent: true, cast: false });
    holoTag(stage, "stair unit", -1.0, 0.55, -0.9, { css: HBF_CSS, w: 0.22 });
    reg(hits, stairHit, "stair-unit");
    const rail = group(stage, 0, 0.5, 0.48);
    box(rail, 2.3, 0.04, 0.04, 0, 0.95, 0, 0xb9bec4, { rough: 0.4, metal: 0.7 });
    box(rail, 2.3, 0.03, 0.03, 0, 0.5, 0, 0xb9bec4, { rough: 0.4, metal: 0.7 });
    for (const x of [-1.1, 0, 1.1]) box(rail, 0.04, 0.98, 0.04, x, 0.49, 0, 0xb9bec4, { rough: 0.4, metal: 0.7 });
    rail.visible = false;
    const railHit = box(stage, 2.3, 0.3, 0.12, 0, 0.8, 0.5, 0xc79a4a, { opacity: 0.25, transparent: true, cast: false });
    holoTag(stage, "open back edge — rail", 0.4, 1.12, 0.5, { css: HBF_CSS, w: 0.4 });
    reg(hits, railHit, "back-guardrail");
    const handrail = cyl(stage, 0.018, 0.018, 0.6, -1.3, 0.72, -0.72, 0xb9bec4, { rough: 0.4, metal: 0.7, seg: 8 });
    handrail.rotation.x = 0.9;
    handrail.visible = false;
    const handrailHit = box(stage, 0.12, 0.5, 0.4, -1.32, 0.6, -0.7, 0xc79a4a, { opacity: 0.25, transparent: true, cast: false });
    reg(hits, handrailHit, "stair-handrail");

    // --------------------------------------------- the AV snake and its ramp
    const snake = hose(g, [[-0.3, 0.52, 1.2], [0.3, 0.03, 0.8], [0.8, 0.02, 0.2], [1.2, 0.02, -0.2], [1.6, 0.02, -0.4]], 0.018, 0x14161a, { steps: 18, rough: 0.7 });
    void snake;
    const rampSocket = box(g, 0.5, 0.1, 0.5, 0.8, 0.05, 0.2, 0xffffff, { opacity: 0.001, transparent: true, cast: false });
    hits["ramp-socket"] = rampSocket;
    holoTag(g, "service aisle — cable crossing", 0.8, 0.3, 0.45, { css: HBF_CSS, w: 0.5 });
    const ramp = group(g, -1.1, 0, 0.9);
    box(ramp, 0.9, 0.06, 0.4, 0, 0.03, 0, 0x2b2f34, { rough: 0.7 });
    box(ramp, 0.9, 0.02, 0.12, 0, 0.065, 0, 0xf2c14b, { rough: 0.6 });
    holoTag(ramp, "cable ramp", 0, 0.25, 0, { css: HBF_CSS, w: 0.22 });
    reg(hits, ramp, "cable-ramp");
    const underCarpet = box(g, 0.4, 0.1, 0.3, 1.6, 0.05, -0.55, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "tuck it under the runner?", 1.6, 0.3, -0.55, { css: HBF_WARN, w: 0.44 });
    reg(hits, underCarpet, "cable-under-carpet");

    // ----------------------------------------- the set dinner rounds and aisle
    const setRow = group(g, 0.4, 0, 0.3);
    for (const [x, z] of [[-0.3, -0.25], [1.1, -0.25]]) {
      cyl(setRow, 0.55, 0.55, 0.04, x, 0.74, z, 0xf2eee4, { rough: 0.8, seg: 24 });
      cyl(setRow, 0.05, 0.08, 0.72, x, 0.36, z, 0x5a5f66, { rough: 0.5, metal: 0.5, seg: 10 });
      cyl(setRow, 0.08, 0.1, 0.18, x, 0.85, z, 0xc79a4a, { rough: 0.5, seg: 12 });
    }
    const tape = tapeMeasure(setRow, 0.4, 0.76, -0.25, { ry: 0 });
    holoTag(setRow, "aisle vs plan", 0.4, 1.0, -0.25, { css: HBF_CSS, w: 0.26 });
    reg(hits, tape, "aisle-tape");

    // --------------------------------------------------------- the side exit
    const exit = group(g, -2.78, 0, 1.3, Math.PI / 2);
    box(exit, 1.0, 2.1, 0.06, 0, 1.05, 0, 0x7d6a55, { rough: 0.6 });
    const crashBar = box(exit, 0.8, 0.06, 0.08, 0, 1.0, 0.06, 0xb9bec4, { rough: 0.3, metal: 0.8 });
    reg(hits, crashBar, "side-exit");
    const exitSign = decal(exit, 0.36, 0.14, 0, 2.3, 0.04, signFace("EXIT", { bg: "#0d2a14", accent: "#59c97b", fg: "#9ff0b3", scale: 0.6 }), { glow: true, ei: 1.2 });
    void exitSign;
    const drape = box(exit, 0.6, 0.5, 0.03, 0.05, 2.25, 0.09, 0x1a1a2a, { rough: 0.95 });
    reg(hits, drape, "drape-over-exit-sign");
    const chairStack = group(exit, 0.55, 0, 0.35);
    for (let i = 0; i < 4; i++) box(chairStack, 0.42, 0.06, 0.42, 0, 0.3 + i * 0.1, 0, 0xb5893e, { rough: 0.6 });
    reg(hits, chairStack, "chairs-at-crash-bar");
    const cord = hose(exit, [[-0.3, 0.01, 0.6], [-0.2, 0.01, 0.1], [-0.2, 0.01, -0.2]], 0.01, 0xf2a23b, { steps: 6, rough: 0.6 });
    const cordHit = box(exit, 0.25, 0.08, 0.5, -0.22, 0.04, 0.2, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, cordHit, "cord-under-door");
    void cord;
    // The vendor's cake cart, waiting off-set until it parks in the exit.
    const cakeCart = group(g, -3.6, 0, -1.2);
    box(cakeCart, 0.6, 1.3, 0.5, 0, 0.7, 0, 0xdfe4e8, { rough: 0.4, metal: 0.5 });
    for (const y of [0.4, 0.8, 1.2]) box(cakeCart, 0.5, 0.18, 0.4, 0, y, 0, 0xf6e7ef, { rough: 0.7 });
    cakeCart.visible = false;
    const exitCorr = box(g, 0.5, 0.4, 0.5, -2.5, 0.25, -2.0, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "park empty trucks in the exit corridor?", -2.3, 0.62, -2.0, { css: HBF_WARN, w: 0.62 });
    reg(hits, exitCorr, "park-in-exit");
    hbfNotice(g, -2.79, 1.55, -0.6, Math.PI / 2, ["Exit access: keep clear", "Ramp every cable", "Decks: team lift only"]);

    // ------------------------------------------------ crew, captain and radios
    const partner = standingFigure(g, 2.3, 1.95, { ry: -2.8, cloth: 0x1d1f24, trousers: 0x1d1f24 });
    void partner;
    const captain = standingFigure(g, 1.2, 2.3, { ry: 3.4, cloth: 0x4a2a2a, trousers: 0x1d1f24 });
    captain.visible = false;
    const captainDesk = group(g, 2.1, 0, -2.0, -0.3);
    box(captainDesk, 0.7, 0.75, 0.45, 0, 0.375, 0, 0x5a3a2a, { rough: 0.7 });
    const plan = decal(captainDesk, 0.32, 0.24, -0.1, 0.755, 0, paperFace("FLOOR PLAN", ["As approved", "Aisles marked", "Exits: side, rear"], { scale: 0.7 }));
    plan.rotation.x = -Math.PI / 2;
    reg(hits, plan, "captain-signoff");
    const signLine = box(captainDesk, 0.3, 0.02, 0.06, -0.1, 0.77, 0.14, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(captainDesk, "sign over", -0.1, 0.9, 0.18, { css: HBF_CSS, w: 0.2 });
    reg(hits, signLine, "captain-sign-line");
    const logSheet = decal(captainDesk, 0.24, 0.3, 0.2, 0.756, 0.05, paperFace("FLIP LOG", ["Time", "Team lifts", "Tags", "Exit"], { scale: 0.7 }));
    logSheet.rotation.x = -Math.PI / 2;
    reg(hits, logSheet, "flip-log");
    const crewRadio = radio(captainDesk, 0.26, 0.75, -0.14, { ry: -0.4 });
    holoTag(captainDesk, "radio — crew and manager", 0.1, 1.1, 0, { css: HBF_CSS, w: 0.44 });
    reg(hits, crewRadio, "crew-radio");
    const phone = group(g, 0.9, 1.25, -2.47);
    box(phone, 0.16, 0.24, 0.06, 0, 0, 0, 0x2b2f34, { rough: 0.5 });
    box(phone, 0.05, 0.2, 0.05, -0.1, 0, 0.03, 0x1b1e23, { rough: 0.5 });
    holoTag(phone, "house phone — banquet manager", 0, 0.24, 0.04, { css: HBF_CSS, w: 0.52 });
    reg(hits, phone, "house-phone");

    let pushed = 0;
    return {
      hits,
      footprint: 2.5,
      spawnLook: new THREE.Vector3(0.2, 0.9, -0.4),
      onStepComplete(step) {
        if (step.id === "strike-order") { topsHit.visible = false; foldTables.rotation.z = 0.0; foldTables.position.x = -1.1; }
        if (step.id === "table-truck") { round.visible = false; loaded[2].position.x = 0.35; }
        if (step.id === "table-inspect") { legBrace.material = mat(0xd9cdb2, { rough: 0.7 }); pinGap.visible = false; }
        if (step.id === "strap-truck") strap.position.y = 1.2;
        if (step.id === "riser-cart-push") riserCart.position.set(1.3, 0, 1.2);
        if (step.id === "team-lift") { deckSet[1].visible = true; decks[2].visible = false; liftCall.visible = false; }
        if (step.id === "stage-edge") { stair.visible = true; rail.visible = true; handrail.visible = true; stairHit.visible = false; railHit.visible = false; handrailHit.visible = false; }
        if (step.id === "cable-ramp") ramp.position.set(0.8, 0, 0.2);
        if (step.id === "egress-walk") { drape.visible = false; chairStack.position.x = 1.6; cordHit.visible = false; }
      },
      onInterrupt(it) {
        if (it.id === "doors-early") { captain.visible = true; clock.material = clockMatRed; }
        if (it.id === "vendor-in-exit") { cakeCart.visible = true; cakeCart.position.set(-2.3, 0, 1.3); }
      },
      onInterruptEnd(it) {
        if (it.id === "doors-early" && it.resolved === "answered") { captain.visible = false; clock.material = clockMatOk; }
        if (it.id === "vendor-in-exit" && it.resolved === "answered") cakeCart.position.set(-2.3, 0, -1.6);
      },
      animate(t, dt, session) {
        const step = session?.step;
        if (step?.id === "riser-cart-push" && session.holding) {
          pushed = Math.min(1, pushed + dt / 7);
          riserCart.position.set(2.1 - pushed * 0.8, 0, 0.6 + pushed * 0.6);
        }
        const gg = session?.gauge;
        if (gg && !gg.committed && step?.id === "aisle-width") tape.userData.parts?.blade && (tape.userData.parts.blade.scale.x = 0.6 + gg.t * 0.8);
        if (clock.material === clockMatRed) clockMatRed.emissiveIntensity = 1.1 + Math.sin(t * 6) * 0.3;
        void repaint;
      },
    };
  },
};
