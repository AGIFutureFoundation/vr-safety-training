import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, ball, torus, hose, group, decal, repaint, signFace, particles, mat, ownMaterial,
} from "../../../shared/kit.js";
import {
  CITY, stationPad, holoPanel, holoTag, toolChest, instrument, standingFigure, valveWheel, reg,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Wildland Fireline Construction & Lookout VR — Emergency
// Services, on the open-range district. A hand crew cutting fireline ahead
// of a wildfire on open range: LCES named before a tool moves, the escape
// route and safety zone held to the distance the briefing actually set, the
// line cut and scraped to mineral soil and tied into a solid anchor, the
// mop-up checked by more than a bare hand, and a wind shift or a spot fire
// across the line answered by the radio, not by someone deciding alone to
// keep swinging a tool.

const ORF_ACCENT = 0xc9622f;

export const SIM_OR_WILDLAND_FIRELINE_CONSTRUCTION_AND_LOOKOUT = {
  id: "or-wildland-fireline-construction-and-lookout",
  index: "261",
  domain: "Emergency Services",
  trade: "Wildland firefighter — IAFF",
  category: "Emergency Services",
  district: "open-range",
  weather: "smoke",
  certification: "IAFF wildland fire crews; NWCG wildland fire behaviour and the lookouts-communications-escape-routes-safety-zones (LCES) doctrine; NFPA 1140 standard for wildland fire protection; NFPA 1977 protective clothing and equipment for wildland fire fighting; OSHA 29 CFR 1910.134 respiratory protection",
  name: "Wildland Fireline Construction",
  title: simTitle("Wildland Fireline Construction"),
  tagline: "A hand crew cutting fireline on open range: LCES named first, the line scraped to mineral soil and tied to a solid anchor, the mop-up checked by more than a hand, and a wind shift or a spot fire across the line answered by the radio",
  accent: ORF_ACCENT,
  accentCss: "#c9622f",
  parSeconds: 310,
  footprint: 2.8,
  badge: { id: "line-holds", name: "Line Holds", note: "A fireline cut to mineral soil, tied into its anchor, with LCES named first and the wind shift answered the instant it was called" },

  supportLine: "the IAFF member assistance programme through your local, and the crew's peer-support contact",

  game: system({
    name: "Fireline Crew",
    currency: "LINE",
    ranks: ["Crew Member", "Squad Boss", "Crew Boss", "Division Supervisor", "Fireline Certified"],
    badges: [
      { id: "lces-first", name: "LCES First", note: "Lookout, communications, escape routes and safety zone all named before the first tool moved", test: AWARD.stepClean("declare-lces") },
      { id: "no-shortcut", name: "No Shortcut", note: "No unsafe action anywhere in the run", test: AWARD.safe },
      { id: "wind-answered", name: "Wind Answered", note: "The wind shift called the instant it was reported, not after the line was finished", test: AWARD.stepClean("scrape-mineral-soil") },
    ],
    challenges: [
      { id: "clean-line", name: "Clean Line", note: "No corrections anywhere in the run", test: AWARD.clean },
      { id: "line-held", name: "Line Held", note: "Every timed task carried its full duration, no early release", test: AWARD.unbroken },
      { id: "line-fast", name: "Line Fast", note: "Complete inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "beyond-safety-zone": "You crossed past the distance the safety zone marker actually sets. The escape route and the safety zone are measured off the briefing before the first tool moves specifically so nobody has to judge that distance under smoke with the fire moving — stepping past the marker throws away the one number on this line everybody already agreed was safe.",
    "check-hotspot-bare-hand": "You checked that stump hole with a bare hand. Ash can sit at a temperature that reads as cool to a glove and still takes skin off a bare hand a second later — mop-up is checked with the back of a gloved hand or a temperature probe, never skin against the ash directly.",
    "fire-shelter-left-behind": "That fire shelter is still on the buggy, not on you. A shelter that is not carried on the line does not exist for the ten seconds an entrapment actually gives somebody to deploy it — it goes on the person before the person goes on the line, every shift, no exceptions.",
    "tool-swing-into-crew": "You swung the tool with another crew member inside its arc. Line construction spacing exists because a Pulaski or brush hook has a strike radius, and a crew bunched up on a hot, smoky line is a crew where the tool everybody is relying on to build the line is also the thing most likely to injure the person beside you.",
  },

  steps: [
    {
      id: "lookout-brief", kind: "select", target: "lookout-post-board",
      title: "Check in with the lookout",
      cue: "Confirm the lookout is posted with a clear line of sight before the crew moves onto the line.",
      why: "A lookout posted with sightlines the crew and the smoke will not block is the first piece of the whole safety system, and checking that in person, rather than assuming the post from this morning still has a view, is what makes every warning that comes later actually reach the crew in time to matter.",
    },
    {
      id: "declare-lces", kind: "sequence",
      targets: ["lookout-posted", "comms-check", "escape-routes-marked", "safety-zone-marked"],
      itemNames: {
        "lookout-posted": "lookout posted", "comms-check": "communications checked",
        "escape-routes-marked": "escape routes marked", "safety-zone-marked": "safety zone marked",
      },
      itemNotes: {
        "lookout-posted": "The same lookout post just confirmed, named now as part of the record.",
        "comms-check": "Radio checked with the lookout and with division, on the channel the whole crew is actually running.",
        "escape-routes-marked": "Two ways off this line, not one — a single route stops being an option the moment smoke or fire behaviour blocks it.",
      },
      title: "Name LCES before a tool moves",
      cue: "Lookouts, communications, escape routes, safety zone — name all four before the first tool touches the ground.",
      why: "LCES named in order, before construction starts, is what turns the escape route and safety zone from something the crew half-remembers into a decision everyone already made together with time to think — a crew building line before it has named where it runs to is a crew that will be improvising an escape route at the exact moment fire behaviour stops giving anybody time to plan one.",
      outOfOrderNote: "Lookout, then comms, then escape routes, then the safety zone — naming the safety zone before the escape routes are marked leaves the crew a place to run to with no agreed way of getting there.",
    },
    {
      id: "conditions-board", kind: "select", target: "conditions-board",
      title: "Read the fire-weather conditions",
      cue: "Check the wind and fire-weather outlook before construction starts, per the forecast.",
      why: "Everything the crew is about to cut is a bet against what the wind and the fire do in the next hour, and the current forecast is the best information anyone has about that bet before conditions actually change — a crew that skips it is building line against the wind from an hour ago, not the one that is coming.",
    },
    {
      id: "gear-find", kind: "find", noHint: true,
      targets: ["torn-brush-jacket", "missing-goggles"],
      itemNames: { "torn-brush-jacket": "torn brush jacket", "missing-goggles": "missing eye protection" },
      itemNotes: {
        "torn-brush-jacket": "A tear in the brush jacket is a gap in the one layer between a crew member's skin and radiant heat on a hot line.",
        "missing-goggles": "No eye protection staged with this kit — ash and embers travel well ahead of the flame front and reach the eyes long before the heat does.",
      },
      decoyNotes: { "spare-bandana": "The bandana is not the find — it's a spare, not a piece of required PPE that is missing." },
      title: "Check the crew's PPE before the line",
      cue: "Look over the staged gear and click what's missing or damaged — two of them are here.",
      why: "PPE checked at the buggy is PPE that gets fixed there, with time and spares on hand — the same tear or gap found an hour into cutting line is one that gets worked through instead, because there is no walking off a hot line just to swap a jacket.",
    },
    {
      id: "escape-safety-confirm", kind: "select", target: "briefing-board",
      title: "Confirm the escape and safety-zone distance",
      cue: "Confirm the escape route and the safety zone distance against what this morning's briefing actually set.",
      why: "The distance on the marker is the distance the briefing set for today's fuel and fire behaviour, not a rule of thumb carried over from the last assignment — confirming it against the briefing, out loud, is what keeps the whole crew working to the same number instead of five different guesses at how far is far enough.",
    },
    {
      id: "fire-behavior-gauge", kind: "gauge", target: "behavior-meter",
      title: "Read the fire-behaviour trend",
      cue: "Check the fire-behaviour indicator and commit the current trend before the first cut.",
      why: "Fire behaviour is read again right before construction starts because it is the one input that can invalidate everything the briefing assumed an hour ago — a trend climbing toward the line changes what kind of line is worth building here at all, and that is a decision made with a current reading, not a memory.",
      gauge: { label: "FIRE BEHAVIOUR", speed: 0.7, green: [0.15, 0.45], readout: (t) => (t < 0.15 ? "backing, low intensity" : t < 0.45 ? "moderate, holding" : "trending toward the line"), missNote: "That reading is trending toward the line, not away from it — this is the moment to be re-checking with the lookout, not starting to cut." },
    },
    {
      id: "cut-brush", kind: "drag", target: "brush-clump",
      title: "Clear the brush off the line",
      cue: "Cut and drag the brush clear to the black side of the line, away from the crew's own footing.",
      why: "Cut brush left on the line itself is fuel sitting exactly where the crew needs bare ground, and dragging it clear to the black side keeps it away from the crew's own footing and off the line the next tool in the sequence still has to scrape to mineral soil.",
      drag: { to: "brush-pile", radius: 0.55, missNote: "Not clear of the line — brush dropped back across it undoes the cut before the scrape ever reaches it." },
    },
    {
      id: "scrape-mineral-soil", kind: "hold", target: "pulaski-handle", seconds: 5,
      title: "Scrape the line to mineral soil",
      cue: "Hold the scraping stroke steady until the line is down to bare mineral soil, full width.",
      why: "A fireline only stops fire where it is actually down to mineral soil — a line that is scraped halfway, with duff or root mat still holding an ember, is a line that looks finished and burns through anyway the first time the wind pushes something across it.",
      holdBreakNote: "Released before the line reached mineral soil — a half-scraped line reads as finished and is not; hold the stroke until the soil underneath is bare.",
    },
    {
      id: "tie-in-anchor", kind: "select", target: "anchor-point",
      title: "Tie the line into its anchor",
      cue: "Tie the new fireline into the rock outcrop anchor point, closing the gap completely.",
      why: "A fireline that stops short of a solid anchor is a line with a gap fire can run around the end of — tying in completely, to a feature that will not burn through itself, is what makes the line a closed barrier rather than a long cut with an opening left in it.",
    },
    {
      id: "hotspot-find", kind: "find", noHint: true,
      targets: ["smoldering-stump-hole", "hidden-ember-bed"],
      itemNames: { "smoldering-stump-hole": "smoldering stump hole", "hidden-ember-bed": "hidden ember bed" },
      itemNotes: {
        "smoldering-stump-hole": "A stump hole can hold fire well below the surface long after the ground around it looks cold.",
        "hidden-ember-bed": "Embers banked under a shallow duff layer read as cold ground until they are actually turned over and checked.",
      },
      decoyNotes: { "cold-ash-patch": "That patch is genuinely cold — the find is for what is still holding heat, not for every dark patch of ash." },
      title: "Check the line for what is still holding heat",
      cue: "Walk the finished edge and click what is still holding heat below the surface — two of them are here.",
      why: "Mop-up is what actually stops a line from being crossed later by fire nobody can see any more — a stump hole or an ember bed that reads cold from a glance and is not is exactly what turns a held line into a reburn the next time the wind comes up.",
    },
    {
      id: "charge-pump", kind: "turn", target: "pump-valve",
      title: "Charge the pump and hose",
      cue: "Open the pump valve and charge the hose along the line.",
      why: "A charged hose staged along the line is water that is already there the moment mop-up finds something that needs more than a shovel of dirt — charging it now, before it is needed, is what keeps that response from starting with someone running back to the pump first.",
      turn: { turns: 1.0, axis: "z", label: "PUMP VALVE" },
    },
    {
      id: "reassess-radio-log", kind: "select", target: "lookout-radio",
      title: "Check in with the lookout on progress",
      cue: "Call the lookout with the line's progress and confirm conditions are unchanged.",
      why: "A progress call to the lookout is what keeps the person watching the fire and the wind in the loop on exactly how far along the crew is, which is the information that turns a warning a minute later into a warning the crew can actually act on before the line is compromised.",
    },
    {
      id: "closing-log", kind: "sequence", anyOrder: true,
      targets: ["log-line-length", "log-hotspots", "log-anchor"],
      itemNames: { "log-line-length": "line length logged", "log-hotspots": "hotspots logged", "log-anchor": "anchor tie-in logged" },
      title: "Log the fireline",
      cue: "Write the line length, the hotspots found and the anchor tie-in into the fireline log.",
      why: "The log is what tells the division supervisor, and the crew that patrols this line after this one rotates out, exactly what was cut, what was found holding heat and where the line ties in — without it, the next crew is re-walking the whole line to learn what this one already knows.",
    },
    {
      id: "crew-checkin", kind: "select", target: "checkin-board",
      title: "Check in with the crew",
      cue: "Ask how the crew is doing after a shift that included a wind shift and a spot fire, not just whether the line is done.",
      why: "A shift that includes a wind shift and a spot fire across the line asks something of a crew that a quiet mop-up day does not, and the department's peer-support line exists for exactly that kind of weight — asking the question and logging the answer is what keeps it from going unspoken until it shows up somewhere else.",
    },
  ],

  interrupts: [
    {
      id: "wind-shift",
      kind: "Wind shift changes fire behaviour",
      after: "scrape-mineral-soil", delay: 3, seconds: 13,
      alert: "The lookout is calling it: the wind just swung and picked up, and fire behaviour on this flank is climbing with it.",
      cue: "Stop cutting. Call the lookout back and reassess before another cut goes in.",
      target: "reassess-radio",
      why: "The entire reason fire behaviour is read before construction starts is so a shift like this one is not a debate — the wind changed the bet the whole plan was built on, and the correct response is the radio call that reassesses the line against the new conditions, not five more minutes of cutting on a plan the wind has already overtaken.",
      missNote: "The crew kept cutting after the wind shift was called. Whatever the fire did with the extra line built on an assumption the wind had already broken, that line was never actually the safe bet it looked like when the cutting started.",
      wrongNote: "It is the radio, not the tool in your hands — call the lookout back and reassess before the next cut goes in.",
    },
    {
      id: "spot-fire-across-line",
      kind: "Spot fire across the line",
      after: "tie-in-anchor", delay: 3, seconds: 12,
      alert: "The lookout has spotted it: an ember has crossed the finished line and a spot fire is starting on the far side.",
      cue: "Do not cross the line to fight it alone. Report the spot fire's location to the lookout now.",
      target: "spot-fire-radio",
      why: "A spot fire on the far side of a line the crew just built means the line has already been outflanked once, and crossing over to fight it alone puts a single person on the wrong side of the barrier the whole crew is standing behind — the report is what gets a second resource assigned to it with an accurate location, rather than one person improvising a second fireline nobody else knows exists yet.",
      missNote: "The spot fire burned unreported while the crew kept working the original line. A spot fire that grows before anyone calls it in is a second fire the next assignment has to be built around from scratch.",
      wrongNote: "It is the radio, not the line beyond it — report the spot fire's location before anyone goes near it.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.8, ORF_ACCENT);

    // ------------------------------------------------------------- lookout
    const lookout = group(g, -3.2, 0, 1.8);
    cyl(lookout, 0.03, 0.03, 1.8, 0, 0.9, 0, 0x8a929a, { rough: 0.5, metal: 0.4, seg: 8 });
    ball(lookout, 0.1, 0, 1.85, 0, ORF_ACCENT, { emissive: ORF_ACCENT, ei: 0.5, seg: 10 });
    holoTag(lookout, "Lookout post", 0, 2.1, 0, { css: "#c9622f", w: 0.32 });
    reg(hits, lookout, "lookout-posted");
    const lookoutBoard = holoPanel(g, 0.55, 0.38, -3.2, 1.35, 2.5, (cx, w, h) => {
      cx.fillStyle = "rgba(20,12,4,0.9)"; cx.fillRect(0, 0, w, h);
      cx.fillStyle = "#c9622f"; cx.fillRect(0, 0, w, 5);
      cx.font = `600 ${Math.round(h * 0.12)}px 'Barlow Condensed', Arial, sans-serif`;
      cx.textAlign = "left"; cx.textBaseline = "middle"; cx.fillStyle = "#ffe0c8";
      cx.fillText("LOOKOUT CHECK-IN", w * 0.06, h * 0.18);
      cx.font = `${Math.round(h * 0.09)}px Arial, sans-serif`; cx.fillStyle = "#f0c9a8";
      ["Sightline clear of smoke", "Escape routes in view"].forEach((l, i) => cx.fillText(l, w * 0.06, h * (0.44 + i * 0.2)));
    }, { ry: 0.5, accent: ORF_ACCENT });
    reg(hits, lookoutBoard, "lookout-post-board");

    const commsRadio = group(g, -2.4, 0, 2.6);
    box(commsRadio, 0.09, 0.16, 0.05, 0, 0.9, 0, 0x2b3138, { rough: 0.5 });
    holoTag(commsRadio, "Comms check", 0, 1.05, 0, { css: "#c9622f", w: 0.32 });
    reg(hits, commsRadio, "comms-check");

    const escapeMarker = group(g, 2.2, 0, 2.4);
    box(escapeMarker, 0.3, 0.4, 0.02, 0, 0.2, 0, 0x59c97b, { emissive: 0x59c97b, ei: 0.4, rough: 0.6 });
    holoTag(escapeMarker, "Escape route", 0, 0.5, 0, { css: "#59c97b", w: 0.34 });
    reg(hits, escapeMarker, "escape-routes-marked");

    const safeZone = box(g, 1.6, 0.01, 1.3, 2.6, 0.006, 3.0, 0x59c97b, { rough: 0.7, opacity: 0.35, transparent: true, cast: false });
    holoTag(g, "Safety zone", 2.6, 0.2, 3.0, { css: "#59c97b", w: 0.34 });
    reg(hits, safeZone, "safety-zone-marked");
    // The trap: standing past the marked safety-zone distance.
    const beyondZone = box(g, 1.0, 0.01, 1.0, 4.2, 0.006, 3.0, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "Past the marked distance?", 4.2, 0.2, 3.0, { css: "#f0645b", w: 0.4 });
    reg(hits, beyondZone, "beyond-safety-zone");

    const briefingBoard = holoPanel(g, 0.55, 0.4, 2.6, 1.35, -3.0, (cx, w, h) => {
      cx.fillStyle = "rgba(20,12,4,0.9)"; cx.fillRect(0, 0, w, h);
      cx.fillStyle = "#c9622f"; cx.fillRect(0, 0, w, 5);
      cx.font = `600 ${Math.round(h * 0.1)}px 'Barlow Condensed', Arial, sans-serif`;
      cx.textAlign = "left"; cx.textBaseline = "middle"; cx.fillStyle = "#ffe0c8";
      cx.fillText("THIS MORNING'S BRIEFING", w * 0.06, h * 0.16);
      cx.font = `${Math.round(h * 0.085)}px Arial, sans-serif`; cx.fillStyle = "#f0c9a8";
      ["Escape route and safety zone", "distance set for today's fuel", "and fire behaviour"].forEach((l, i) => cx.fillText(l, w * 0.06, h * (0.36 + i * 0.19)));
    }, { ry: -0.5, accent: ORF_ACCENT });
    reg(hits, briefingBoard, "briefing-board");

    const condBoard = holoPanel(g, 0.56, 0.4, 2.6, 1.35, -3.5, (cx, w, h) => {
      cx.fillStyle = "rgba(16,20,10,0.9)"; cx.fillRect(0, 0, w, h);
      cx.fillStyle = "#9fd84f"; cx.fillRect(0, 0, w, 5);
      cx.font = `600 ${Math.round(h * 0.1)}px 'Barlow Condensed', Arial, sans-serif`;
      cx.textAlign = "left"; cx.textBaseline = "middle"; cx.fillStyle = "#e6f2c8";
      cx.fillText("WIND & FIRE WEATHER", w * 0.06, h * 0.16);
      cx.font = `${Math.round(h * 0.085)}px Arial, sans-serif`; cx.fillStyle = "#d8e6b0";
      ["Check the current spot forecast", "Wind, RH and red-flag status", "No figure repeated here as fact"].forEach((l, i) => cx.fillText(l, w * 0.06, h * (0.34 + i * 0.16)));
    }, { ry: -0.5, accent: 0x9fd84f });
    reg(hits, condBoard, "conditions-board");

    // ------------------------------------------------------------ PPE kit
    const kit = toolChest(g, -0.5, 2.4, { ry: 2.8, color: ORF_ACCENT });
    const jacket = box(kit, 0.34, 0.4, 0.04, -0.14, 0.9, 0.04, 0xc9622f, { rough: 0.6 });
    decal(kit, 0.08, 0.12, -0.18, 0.85, 0.065, signFace("TEAR", { bg: "#2a1a0d", accent: "#f0645b", scale: 0.5 }), { px: 64 });
    holoTag(kit, "Brush jacket", -0.14, 1.14, 0.04, { css: "#c9622f", w: 0.3 });
    reg(hits, jacket, "torn-brush-jacket");
    const gogglesSpot = box(kit, 0.16, 0.06, 0.03, 0.14, 0.9, 0.04, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(kit, "Eye protection — missing", 0.14, 1.0, 0.04, { css: "#f0645b", w: 0.4 });
    reg(hits, gogglesSpot, "missing-goggles");
    const bandana = box(kit, 0.14, 0.02, 0.1, 0, 0.9, 0.14, 0xd8b23a, { rough: 0.8 });
    reg(hits, bandana, "spare-bandana");

    const shelterBuggy = group(g, -3.6, 0, -1.4);
    box(shelterBuggy, 1.6, 0.7, 2.6, 0, 0.5, 0, 0x2f5d3a, { rough: 0.6 });
    const shelter = box(shelterBuggy, 0.3, 0.1, 0.4, 0.3, 0.9, -0.6, 0xf2c14b, { rough: 0.5 });
    holoTag(shelterBuggy, "Fire shelter — on the buggy", 0.3, 1.1, -0.6, { css: "#f0645b", w: 0.5 });
    reg(hits, shelter, "fire-shelter-left-behind");

    // ------------------------------------------------------- fire behaviour
    const behaviorPost = group(g, -1.4, 0, 2.6);
    cyl(behaviorPost, 0.03, 0.03, 0.9, 0, 0.45, 0, 0x8a929a, { rough: 0.5, metal: 0.4, seg: 8 });
    const behaviorMeter = instrument(behaviorPost, 0, 0.95, 0, { ry: 0.5, idle: "-- ROS", color: ORF_ACCENT, w: 0.16 });
    holoTag(behaviorPost, "Fire behaviour", 0, 1.15, 0, { css: "#c9622f", w: 0.34 });
    reg(hits, behaviorMeter, "behavior-meter");

    // ---------------------------------------------------------- the line
    const lineDirt = box(g, 1.0, 0.02, 6.0, 1.2, 0.011, -1.0, 0x6d5f45, { rough: 0.9, cast: false });
    void lineDirt;
    const brushClump = group(g, 1.0, 0, -2.8);
    for (let i = 0; i < 5; i++) ball(brushClump, 0.22 + Math.random() * 0.1, (i - 2) * 0.28, 0.2, 0, 0x5a6a3a, { rough: 0.9, seg: 8 });
    holoTag(brushClump, "Brush on the line", 0, 0.6, 0, { css: "#c9622f", w: 0.36 });
    reg(hits, brushClump, "brush-clump");
    const brushPile = group(g, 2.2, 0, -2.8);
    ball(brushPile, 0.3, 0, 0.2, 0, 0x4a5a2a, { rough: 0.9, seg: 8 });
    hits["brush-pile"] = brushPile;

    const pulaski = group(g, 1.2, 0, -1.0, 1.4);
    cyl(pulaski, 0.02, 0.02, 0.9, 0, 0.45, 0, 0x6b4b30, { rough: 0.8, seg: 8 });
    box(pulaski, 0.28, 0.06, 0.06, 0, 0.9, 0.1, 0x3a3f45, { rough: 0.5, metal: 0.5 });
    holoTag(pulaski, "Pulaski", 0, 1.05, 0.1, { css: "#c9622f", w: 0.24 });
    reg(hits, pulaski, "pulaski-handle");

    const anchor = group(g, 1.2, 0, -4.0);
    ball(anchor, 0.9, 0, 0.5, 0, 0x6b675f, { rough: 0.95, seg: 10, seg2: 8 }).scale.set(1.4, 0.8, 1.2);
    holoTag(anchor, "Anchor — rock outcrop", 0, 1.2, 0, { css: "#c9622f", w: 0.4 });
    reg(hits, anchor, "anchor-point");

    // ---------------------------------------------------------------- mop-up
    const stumpHole = cyl(g, 0.16, 0.2, 0.12, 0.4, 0.05, -1.6, 0x2a2018, { rough: 0.95, seg: 12 });
    holoTag(g, "Stump hole", 0.4, 0.3, -1.6, { css: "#f0645b", w: 0.34 });
    reg(hits, stumpHole, "smoldering-stump-hole");
    const emberBed = box(g, 0.5, 0.02, 0.4, 1.6, 0.011, -2.2, 0x3a2c1c, { rough: 0.9, cast: false });
    holoTag(g, "Duff — check for heat", 1.6, 0.2, -2.2, { css: "#f0645b", w: 0.4 });
    reg(hits, emberBed, "hidden-ember-bed");
    const coldAsh = box(g, 0.5, 0.02, 0.4, 2.4, 0.011, -1.8, 0x2b2b2b, { rough: 0.9, cast: false });
    reg(hits, coldAsh, "cold-ash-patch");
    const bareHandTrap = box(g, 0.14, 0.1, 0.14, 0.4, 0.06, -1.6, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "Check with bare skin?", 0.4, 0.3, -1.6, { css: "#f0645b", w: 0.44 });
    reg(hits, bareHandTrap, "check-hotspot-bare-hand");

    // ------------------------------------------------------------- the pump
    const pump = group(g, -1.2, 0, -1.6, -0.6);
    box(pump, 0.5, 0.4, 0.7, 0, 0.2, 0, 0x2b3138, { rough: 0.6, metal: 0.3 });
    const pumpValve = valveWheel(pump, 0.2, 0.55, 0.2, { color: ORF_ACCENT, body: 0x7a4a1f, r: 0.07 });
    holoTag(pump, "Pump valve", 0.2, 0.8, 0.2, { css: "#c9622f", w: 0.28 });
    reg(hits, pumpValve, "pump-valve");
    const hoseLine = hose(g, [[-1.0, 0.05, -1.3], [0.2, 0.05, -1.9], [1.2, 0.05, -3.6]], 0.03, 0xc62828, { steps: 12, rough: 0.6 });
    void hoseLine;

    // ---------------------------------------------------------- radios
    const lookoutRadio = group(g, -2.6, 0, 1.3);
    box(lookoutRadio, 0.09, 0.16, 0.05, 0, 0.9, 0, 0x2b3138, { rough: 0.5 });
    holoTag(lookoutRadio, "Lookout radio", 0, 1.05, 0, { css: "#c9622f", w: 0.3 });
    reg(hits, lookoutRadio, "lookout-radio");
    const reassessRadio = group(g, -2.9, 0, 1.3);
    box(reassessRadio, 0.09, 0.16, 0.05, 0, 0.9, 0, 0xf0645b, { rough: 0.5 });
    holoTag(reassessRadio, "Reassess call", 0, 1.05, 0, { css: "#f0645b", w: 0.3 });
    reg(hits, reassessRadio, "reassess-radio");
    const spotFireRadio = group(g, -2.9, 0, 1.6);
    box(spotFireRadio, 0.09, 0.16, 0.05, 0, 0.9, 0, 0xff6a2a, { rough: 0.5 });
    holoTag(spotFireRadio, "Spot fire report", 0, 1.05, 0, { css: "#f0645b", w: 0.34 });
    reg(hits, spotFireRadio, "spot-fire-radio");

    // The spot-fire itself, across the line — dark until the interrupt fires.
    const spotEmbers = particles(g, 44, 0xf2a23b, { size: 0.03, life: 1.0, additive: true, opacity: 0.85 });
    spotEmbers.position.set(1.0, 0.15, -5.0);
    spotEmbers.visible = false;
    const spotSmoke = particles(g, 36, 0x8a8a86, { size: 0.12, life: 2.6, additive: false, opacity: 0.4 });
    spotSmoke.position.set(1.0, 0.3, -5.0);
    spotSmoke.visible = false;
    const spotGlow = ownMaterial(ball(g, 0.28, 1.0, 0.06, -5.0, 0xff6a2a, { emissive: 0xff6a2a, ei: 0, rough: 0.6, seg: 10, seg2: 6 }));

    // The tool-swing-spacing trap and a second crew member.
    standingFigure(g, 2.6, -0.4, { ry: -1.0, cloth: 0x2b3a2f, helmet: 0x8a1f1f, vest: 0xf2c14b });
    const swingTrap = box(g, 0.6, 0.6, 0.6, 1.4, 0.4, -1.1, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, swingTrap, "tool-swing-into-crew");

    // Log board.
    const logSpec = [["log-line-length", -0.2], ["log-hotspots", 0.0], ["log-anchor", 0.2]];
    const logBoard = group(g, -0.6, 0, -3.6);
    for (const [id, tx] of logSpec) {
      const tile = box(logBoard, 0.12, 0.12, 0.02, tx, 0.9, 0, 0x1a0c0d, { rough: 0.6 });
      reg(hits, tile, id);
    }
    holoTag(logBoard, "Fireline log", 0, 1.08, 0, { css: "#c9622f", w: 0.3 });

    const checkinBoard = holoPanel(g, 0.55, 0.38, 2.6, 1.35, -4.0, (cx, w, h) => {
      cx.fillStyle = "rgba(10,18,20,0.9)"; cx.fillRect(0, 0, w, h);
      cx.fillStyle = "#4fd1ff"; cx.fillRect(0, 0, w, 5);
      cx.font = `600 ${Math.round(h * 0.13)}px 'Barlow Condensed', Arial, sans-serif`;
      cx.textAlign = "left"; cx.textBaseline = "middle"; cx.fillStyle = "#e2f6ff";
      cx.fillText("CREW CHECK-IN", w * 0.06, h * 0.16);
      cx.font = `${Math.round(h * 0.085)}px Arial, sans-serif`; cx.fillStyle = "#cfeaf7";
      ["\"How are you doing?\" — ask it", "IAFF peer-support line posted", "Answer logged, not assumed"].forEach((l, i) => cx.fillText(l, w * 0.06, h * (0.36 + i * 0.19)));
    }, { ry: -0.5, accent: 0x4fd1ff });
    reg(hits, checkinBoard, "checkin-board");

    // A crew figure and the smoke drifting through, clear of every control.
    standingFigure(g, -0.6, 1.2, { ry: 2.2, cloth: 0x2b3a2f, helmet: 0x8a1f1f, vest: 0xf2c14b });
    const ambientEmbers = particles(g, 60, 0xf2a23b, { size: 0.02, life: 1.2, additive: true, opacity: 0.5 });
    ambientEmbers.position.set(0, 0.3, -4.6);

    return {
      hits,
      footprint: 2.8,
      spawnLook: new THREE.Vector3(1.2, 1.0, -2.0),

      onStepComplete(step) {
        if (step.id === "scrape-mineral-soil") lineDirt.material = mat(0x9a8a68, { rough: 0.9 });
        if (step.id === "charge-pump") pumpValve.userData.wheel.rotation.z = Math.PI / 2;
        if (step.id === "gear-find") jacket.material = mat(0x8a4a1f, { rough: 0.6 });
      },

      onInterrupt(it) {
        if (it.id === "wind-shift") { reassessRadio.children[0].material = mat(0xf0645b, { emissive: 0xf0645b, ei: 2.2, rough: 0.4 }); }
        if (it.id === "spot-fire-across-line") { spotEmbers.visible = true; spotSmoke.visible = true; spotGlow.material.emissiveIntensity = 2.2; }
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "wind-shift") { reassessRadio.children[0].material = mat(0x2b3138, { rough: 0.5 }); }
        if (it.id === "spot-fire-across-line") { spotGlow.material.emissiveIntensity = 0.6; }
      },

      animate(t, dt) {
        ambientEmbers.visible = true;
        ambientEmbers.userData.step(dt, new THREE.Vector3(0, 0.3, -4.6), 1.4, 0.4, 0.1);
        if (spotEmbers.visible) spotEmbers.userData.step(dt, new THREE.Vector3(1.0, 0.1, -5.0), 0.12, 0.6, 0.3);
        if (spotSmoke.visible) spotSmoke.userData.step(dt, new THREE.Vector3(1.0, 0.3, -5.0), 0.1, 0.35, 0.55);
        const spin = behaviorMeter.userData.screen;
        void spin; void t;
      },
    };
  },
};
