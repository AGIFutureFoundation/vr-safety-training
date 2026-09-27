import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import { box, cyl, ball, torus, hose, group, mat, repaint, signFace } from "../../../shared/kit.js";
import {
  CITY, stationPad, holoPanel, holoTag, instrument, standingFigure, reg,
  surfaceTexture, texturedMat, deckPlateFace,
} from "../citykit.js";
import { tileFace } from "../../../shared/textures.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Galley Fire & Fixed System VR — Maritime & Ports, the yacht
// and charter crew pack.
//
// The galley of a mid-size motor yacht with a pan fire on the range: the fuel
// shut-off on the bulkhead, the fire blanket in its pouch, the portable
// extinguisher in its bracket, the fixed system's pull handle by the door,
// the muster alarm and the hailer at the companionway, the overhead hatch and
// its dog. The learner is the steward-deckhand; the engineer isolates fuel
// below and the captain musters the guests aft. No temperature, quantity or
// extinguisher rating is stated — each is "per the extinguisher's label" or
// "per the vessel's fire plan".

const YC6_ACCENT = 0x2b6f9e;
const YC6_CSS = "#2b6f9e";

export const SIM_YC_GALLEY_FIRE_AND_FIXED_SYSTEM = {
  id: "yc-galley-fire-and-fixed-system",
  index: "yc-6",
  domain: "Maritime & Ports",
  trade: "Charter yacht steward-deckhand at the galley fire, IBU and SIU trained, with the MEBA engineer isolating fuel below and the captain mustering guests",
  category: "Maritime & Ports",
  district: "Maritime & Ports",
  weather: "overcast",
  certification: "IBU and SIU deck training in shipboard fire-fighting; MEBA engineering watch on the fuel isolation; USCG fire-fighting equipment rules at 46 CFR 25 as the vessel's certificate applies them; NFPA 306 control of gas hazards on vessels; OSHA 29 CFR 1910.157 portable fire extinguishers and 29 CFR 1910.132 personal protective equipment; IMO STCW fire prevention and fire fighting",
  name: "Galley Fire & Fixed System",
  title: simTitle("Galley Fire & Fixed System"),
  tagline: "A pan fire on the range: the fire plan read, gloves on and the blanket checked, the galley walked for the loaded grease filter and the low extinguisher gauge, the fuel shut off first, the blanket held over the pan while a guest opens the galley door, the extinguisher swept at the base, the fixed system pulled, the alarm, the hailer and the headcount in order, the smoke watched as the pan reflashes, the hatch cracked to the plan, the engineer's fuel tag confirmed, the fire logged and the crew checked in",
  accent: YC6_ACCENT,
  accentCss: YC6_CSS,
  parSeconds: 280,
  footprint: 2.4,
  badge: { id: "fuel-off-first", name: "Fuel Off First", note: "The fuel shut before anything else, no water near the grease, the hatch cracked and never thrown open, and both the door and the reflash answered" },

  supportLine: "your union hall's member assistance programme — the IBU, SIU or MEBA — with the operator's employee assistance line behind it",

  game: system({
    name: "Galley Watch",
    currency: "KNOT",
    ranks: ["Green Hand", "Steward", "Lead Steward", "Fire Party Lead", "Galley Watch Certified"],
    badges: [
      { id: "plan-read", name: "Plan Read", note: "The fire plan read before the range was touched", test: AWARD.stepClean("fire-plan") },
      { id: "cracked-right", name: "Cracked Right", note: "Hatch opening committed inside the band first time", test: AWARD.precise(0.7) },
      { id: "dry-hands", name: "Dry Hands", note: "No water on the grease, no hatch thrown open, no early re-entry, no aim at the flames", test: AWARD.safe },
    ],
    challenges: [
      { id: "clean-knockdown", name: "Clean Knockdown", note: "No corrections from the plan to the log", test: AWARD.clean },
      { id: "smoke-watched", name: "Smoke Watched", note: "The smoke watched in band the whole way", test: AWARD.unbroken },
      { id: "one-pan", name: "One Pan", note: "Fire logged inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "water-bucket": "You reached for the water bucket to throw on the pan. Water on burning grease flashes to steam under the oil and throws the burning oil out of the pan and across the galley — onto the steward, the bulkhead and the overhead — and turns a pan fire into a compartment fire in a second. A grease fire is smothered: the blanket, the lid, the extinguisher the label says is for it. Water is for nothing in this galley.",
    "hatch-wide": "You threw the overhead hatch fully open to clear the smoke. A hatch thrown wide over a fire that is not yet out gives it all the air it wants and pulls the flames up toward the opening — and toward the face of whoever is opening it. The hatch is cracked to the plan's opening once the fire is knocked down, to let the smoke out without feeding the fire, and it is opened wide only when the galley is cold.",
    "reenter-early": "You went back into the galley to check the pan the moment the flames went down. A grease fire that has been knocked down is a pan of oil still hotter than its flash point, waiting for air; the compartment behind a closed door is full of the smoke and the products the fixed system left, and the fire plan gives the time to wait before the door opens. The door stays shut, the engineer confirms the fuel is off, and re-entry is on the captain's word with the time run down.",
    "aim-at-flames": "You aimed the extinguisher at the flames above the pan. The flames are the light show; the fuel is the oil in the pan, and an extinguisher discharged into the air above it wastes its whole charge on nothing while the fire keeps burning underneath. The label and the training say the same thing: aim at the base, sweep across it, from the distance the label gives, until the extinguisher is empty or the fire is out.",
  },

  lateNotes: {
    "fire-log": "The fire is logged once the galley is cold, the fuel tag confirmed and the guests counted — last, not first.",
    "fixed-system-pull": "The fixed system is pulled once the fuel is off and the portable has been tried — the plan's order, not the panic's.",
  },

  steps: [
    {
      id: "fire-plan", kind: "select", target: "fire-plan-board",
      title: "Read the vessel's fire plan for the galley",
      cue: "Read the galley section of the fire plan on the companionway board: the fuel shut-off's location, the blanket and the extinguisher and what the label says they are for, the fixed system's pull and the wait time after it, who musters the guests and where.",
      why: "A galley fire gives the steward seconds and the fire plan is where the vessel has already spent them: it says where the fuel shut-off is so nobody searches for it with the pan burning, what the extinguisher is for so nobody discharges the wrong one, and how long to wait after the fixed system before the door opens. The equipment rules put the plan and the gear aboard; the plan being read at the start of every trip is what turns gear into a response.",
    },
    {
      id: "gloves-and-blanket", kind: "sequence", anyOrder: true,
      targets: ["galley-gloves", "fire-blanket-pouch"],
      itemNames: { "galley-gloves": "heat-resistant galley gloves", "fire-blanket-pouch": "fire blanket in its pouch, tabs out" },
      title: "Gloves on, the fire blanket's tabs checked",
      cue: "Heat-resistant gloves on, and the fire blanket's pull tabs checked hanging free from the pouch by the range — the blanket is the first move on a pan fire and it has to come out in one pull.",
      why: "The blanket is the first thing a steward reaches for on a pan fire, and a blanket whose tabs have been tucked into the pouch to look tidy is a blanket that takes two hands and ten seconds to get out while the pan burns; the gloves are for the blanket's edges over the pan and for the lid and the handle after. Both are checked before the range is lit because the moment they are needed is the moment there is no time to find out they are wrong.",
    },
    {
      id: "galley-walk", kind: "find", noHint: true,
      targets: ["grease-filter-loaded", "extinguisher-gauge-low"],
      itemNames: { "grease-filter-loaded": "hood grease filter loaded with grease", "extinguisher-gauge-low": "extinguisher with its gauge in the red" },
      itemNotes: {
        "grease-filter-loaded": "The hood's grease filter is loaded and dripping — a pan flare-up under a loaded filter goes up the hood and into the ducting where no blanket or extinguisher reaches it.",
        "extinguisher-gauge-low": "The galley extinguisher's gauge needle is in the red — an extinguisher with no pressure discharges nothing, and the steward finds that out with the pan burning and the handle squeezed.",
      },
      title: "Walk the galley before the range is lit",
      cue: "Look at the hood and its filter, the extinguisher's gauge and pin, the blanket, the fuel shut-off's handle and the door: everything the fire plan names, in the state the plan expects.",
      why: "The galley walk is where the fire plan's promises are checked against the galley as it is: an extinguisher with pressure, a filter that will not carry a flare into the ducting, a shut-off that turns. A fire is the worst time to learn that the extinguisher is empty or the filter is a wick, and both are found in a minute by someone who looks at the gauge and the filter rather than past them.",
    },
    {
      id: "fuel-shutoff", kind: "select", target: "galley-fuel-shutoff",
      title: "Shut off the galley fuel first",
      cue: "The pan has lit — the first move is the fuel: turn the galley fuel shut-off on the bulkhead to closed, so the range stops feeding the fire, then turn to the pan.",
      why: "A pan fire on a range is two fires: the oil in the pan and the burner under it, and smothering the pan while the burner keeps heating it is a fire that comes back the moment the blanket lifts. The fuel shut-off on the bulkhead kills the burner and every other burner in the galley in one movement, from arm's length, before anyone bends over the pan — it is the first move on the plan because it is the one that makes every other move work.",
    },
    {
      id: "blanket-hold", kind: "hold", target: "fire-blanket-hold", seconds: 5,
      title: "Lay the blanket over the pan and hold it",
      cue: "Pull the blanket by its tabs, hold it in front of you with the edges over your gloved hands, lay it over the pan from the near side away from you, and hold it down — do not lift it to look.",
      why: "The blanket puts out a pan fire by taking its air away, and it works only while it stays down: lifted to check, it lets air in and the fire relights on oil that is still above its flash point. It is laid from the near side so the flames go away from the steward, with the edges over the gloved hands so nothing is exposed, and it is held for the plan's time — long enough for the oil to cool below the point where air alone will light it again.",
      holdBreakNote: "The blanket was lifted before the pan had cooled — air under the blanket, the oil relit. Lay it again and hold it down for the plan's time.",
    },
    {
      id: "extinguisher-sweep", kind: "drag", target: "portable-extinguisher",
      title: "Extinguisher at the base of the fire, swept",
      cue: "The blanket has not held it — take the extinguisher from its bracket, pull the pin, stand back to the label's distance, aim at the base of the fire and sweep across it until the flames are down.",
      why: "The portable extinguisher is the second move because it is the one that works from a distance and puts an agent on the oil rather than on the flames above it; the base is where the fuel is and the sweep covers all of it. The pin is pulled at the bracket, not at the fire, and the steward stands at the label's distance with the door behind them — an extinguisher used from too close blows burning oil out of the pan, and a steward with the fire between them and the door has no way out when it does not work.",
      drag: { to: "pan-fire-base", radius: 0.6, missNote: "Not at the base — the agent goes on the oil in the pan, swept across it from the label's distance, not into the flames above it." },
    },
    {
      id: "fixed-system-pull", kind: "turn", target: "fixed-system-pull",
      title: "Pull the fixed system and close the door",
      cue: "The pan has taken the hood — everyone out, the galley door closed, and the fixed system's pull handle by the door turned and pulled to discharge into the galley; the door stays shut.",
      why: "When a fire has left the pan for the hood, the portable is finished and the fixed system is the answer: it floods the galley with an agent that the door keeps in, and it needs everyone out and the door shut to work — a fixed system discharged with the door open is agent in the passageway and a fire that keeps its air. The handle is turned and pulled deliberately, as the plan describes, and the door does not open again until the plan's wait has run down.",
      turn: { turns: 1.25, label: "FIXED SYSTEM", readout: (t) => (t < 0.3 ? "handle secured" : t < 0.85 ? "pin out — pulling" : "discharged · door shut") },
    },
    {
      id: "muster-guests", kind: "sequence",
      targets: ["muster-alarm", "companionway-hailer", "headcount-board"],
      itemNames: { "muster-alarm": "muster alarm", "companionway-hailer": "hailer — guests aft", "headcount-board": "headcount board" },
      outOfOrderNote: "Alarm, then the hailer, then the count — the alarm moves the guests, the hailer tells them where, the count proves they got there.",
      title: "Sound the alarm, send the guests aft on the hailer, count them",
      cue: "Sound the muster alarm, tell the guests over the hailer to go to the aft deck muster point and stay there, and count them against the board with the captain.",
      why: "A fire below is the moment guests go the wrong way — toward their cabins for their things, toward the galley to see — and the alarm and the hailer are how a crew of three moves a deck of guests to the one place they can be counted and kept clear of the crew's work. The order matters because a hailer call before the alarm is a suggestion and a count before the hailer is a count of people still moving; alarm, hailer, count is the sequence that ends with a number.",
    },
    {
      id: "smoke-watch", kind: "track", target: "smoke-watch", seconds: 6,
      title: "Watch the smoke at the galley door through the wait",
      cue: "At the closed galley door, watch the smoke at the door seal and the door's temperature by the back of a gloved hand, and call it to the engineer steadily through the plan's wait — thinning, holding, or building.",
      why: "The fixed system has discharged and the plan's wait is running, and the door is the only instrument: smoke thinning at the seal and a door cooling under the hand mean the agent is winning, smoke building and a door warming mean it is not and the captain needs to know now, not when the wait is up. The watch is steady and called out loud because the engineer below is isolating fuel on the strength of what the door is saying.",
      track: { start: 0.14, green: [0.42, 0.6], rise: 0.6, fall: 0.46, drift: 0.12, label: "SMOKE AT THE DOOR", readout: (v) => (v < 0.42 ? "eyes off the seal" : v > 0.6 ? "over-calling — engineer cannot hear" : "steady — thinning, door cooling") },
      holdBreakNote: "The smoke watch broke — eyes off the seal or the calls over the engineer. Back on the door, the hand on it, steady calls, through the plan's wait.",
    },
    {
      id: "hatch-crack", kind: "gauge", target: "overhead-hatch",
      title: "Crack the overhead hatch to the plan's opening",
      cue: "With the wait run down and the door cool, crack the galley's overhead hatch from the deck above to the opening the fire plan gives — enough to vent the smoke, not enough to feed anything still hot — and commit it.",
      why: "Venting a galley after a fire is a gauge, not a switch: the plan's opening lets the smoke and the agent out at a rate that does not pull fresh air across a pan of oil that is still hot, and a hatch thrown wide does the opposite. The hatch is cracked from the deck above with the door still shut, so the galley vents upward and the steward is never in the smoke's path, and it is opened wide only when the engineer has been in with a lamp and called it cold.",
      gauge: { label: "HATCH OPENING", speed: 0.7, green: [0.42, 0.6], readout: (t) => (t < 0.42 ? "shut — smoke trapped" : t <= 0.6 ? "cracked — venting to the plan" : "too wide — feeding the pan"), missNote: "Outside the band — the hatch is cracked to the plan's opening, enough to vent and no more, and committed from the deck above." },
    },
    {
      id: "fuel-tag-confirm", kind: "select", target: "fuel-isolation-tag",
      title: "Confirm the engineer's fuel isolation tag before re-entry",
      cue: "Before the galley door opens, check the engineer's tag on the galley fuel valve below: isolated, tagged, the engineer's name, and the engineer's word on the intercom that it stays that way until the galley is cold and inspected.",
      why: "A galley whose fuel is shut at the range but still live at the tank is a galley one turned handle from relighting, and the engineer's tag on the valve below is what makes the isolation something that survives the steward walking away from the shut-off. The tag carries a name because the rules for isolating energy say the person who isolated it is the only one who restores it; the galley is re-entered on that tag and the engineer's word, not on the flames being out.",
    },
    {
      id: "fire-log", kind: "select", target: "fire-log",
      title: "Log the fire",
      cue: "Enter the fire in the log: the pan, the fuel shut first, the blanket and the extinguisher used, the fixed system discharged and the wait, the guests mustered and counted, the filter and the gauge found beforehand, the door opened and the reflash.",
      why: "The fire log is the record the operator, the insurer and a boarding officer will read, and it is the record that gets the fixed system recharged and the extinguisher replaced before the next trip rather than found empty at the next fire. The loaded filter and the low gauge are logged with the fire because they are the two things that made it worse than it needed to be, and the guest who opened the door is logged because the next brief needs to say why the door stays shut.",
    },
    {
      id: "crew-checkin", kind: "select", target: "galley-intercom",
      title: "Check in with the engineer and the captain",
      cue: "On the intercom: the galley cold and vented, the fuel tagged, the fixed system discharged and due for recharge, the guests counted and calm, and how you are after a fire in a space the size of a cupboard.",
      why: "The captain takes the vessel back to the berth on the strength of the crew's word that the galley is cold and the fuel is isolated, and the engineer needs to hear that the fixed system is spent before anyone relies on it again. It is also the crew's own check-in: a fire fought at arm's length in a closed galley, with a guest opening the door into it, is a hard thing, and the union's member assistance line is there for what the intercom does not carry.",
    },
  ],

  interrupts: [
    {
      id: "guest-opens-door",
      kind: "Guest opens the galley door mid-blanket",
      after: "blanket-hold", delay: 2, seconds: 14,
      alert: "A guest has pulled the galley door open from the passageway to see what the smell is — air is coming in across the range and the smoke is going out past them.",
      cue: "Get the galley door shut with the guest on the other side of it, and keep the blanket down with the other hand.",
      target: "galley-door",
      why: "An open door is air to the fire and smoke to the guests, and a guest in the doorway of a galley fire is a person about to be hurt trying to help. The door is shut with the guest outside it — not argued with, shut — because the blanket only works with the air still and the passageway only stays clear with the door closed; the captain's hailer call sends the guest aft, and the steward's hand never leaves the blanket.",
      missNote: "The door stayed open, the draught across the range lifted the blanket's edge and the pan relit, and the guest took the smoke in the face in the doorway.",
      wrongNote: "The galley door — shut, with the guest outside it; the blanket stays down under the other hand.",
    },
    {
      id: "pan-reflash",
      kind: "Pan reflashes at the door seal",
      after: "smoke-watch", delay: 2, seconds: 14,
      alert: "The smoke at the door seal has thickened and the door is warming under your hand — the pan has reflashed behind the closed door with the fixed system spent.",
      cue: "Take the second extinguisher from the passageway bracket and stand ready at the door with it; the door stays shut and the captain is told the galley has reflashed.",
      target: "second-extinguisher",
      why: "A reflash after the fixed system is a fire with the first response spent, and the answer is the next response in hand before the door moves: the passageway extinguisher, pin pulled, at the label's distance from the door, with the captain told. The door stays shut because opening it to a reflash feeds it; the extinguisher is ready for the moment the captain decides the door opens, and if the door stays shut until the galley is cold, it was ready for nothing, which is the good outcome.",
      missNote: "The door was opened on the reflash with nothing in hand, the fire took the air from the passageway, and the steward backed out with their gloves alight.",
      wrongNote: "The second extinguisher — in hand, pin out, at the door; the door itself stays shut until the captain says otherwise.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.4, YC6_ACCENT);

    // ------------------------------------------------------- the galley
    const sole = box(g, 4.6, 0.06, 4.2, 0, 0.03, 0, 0xffffff, { rough: 0.8 });
    sole.material = texturedMat(surfaceTexture((cx, w, h) => tileFace(cx, w, h, { tone: "#3a3f45", tone2: "#2c3238" }), { repeat: 5, px: 512 }), { rough: 0.7, metal: 0.1, color: 0xc0c6cc });
    const bulk = texturedMat(surfaceTexture((cx, w, h) => deckPlateFace(cx, w, h, { base: "#e6e8e3", base2: "#d8dbd5", step: 60 }), { repeat: 2, px: 256 }), { rough: 0.6, metal: 0.05, color: 0xf1f3f4 });
    for (const sx of [-1, 1]) { const wl = box(g, 0.1, 2.2, 4.2, sx * 2.35, 1.1, 0, 0xe9ebe6, { rough: 0.6, cast: false }); wl.material = bulk; }
    const aftWall = box(g, 4.6, 2.2, 0.1, 0, 1.1, -2.15, 0xe9ebe6, { rough: 0.6, cast: false });
    aftWall.material = bulk;
    box(g, 4.6, 0.1, 4.2, 0, 2.25, 0, 0xdfe3e6, { rough: 0.7, cast: false });
    for (let i = 0; i < 4; i++) box(g, 0.08, 2.1, 0.08, -1.8 + i * 1.2, 1.05, -2.1, 0xc8ced4, { rough: 0.5, metal: 0.3 });
    // The range, the pan and the fire; the hood with its filter above.
    const range = group(g, 1.2, 0.06, -1.6);
    box(range, 1.2, 0.85, 0.7, 0, 0.42, 0, 0xc8ced4, { rough: 0.35, metal: 0.6, finish: "brushed" });
    for (const sx of [-0.3, 0.3]) for (const sz of [-0.15, 0.15]) cyl(range, 0.1, 0.1, 0.03, sx, 0.86, sz, 0x2b3138, { rough: 0.6, seg: 12 });
    const pan = group(range, -0.3, 0.88, 0.15);
    cyl(pan, 0.16, 0.13, 0.08, 0, 0.04, 0, 0x15181c, { rough: 0.5, metal: 0.5, seg: 14 });
    cyl(pan, 0.012, 0.012, 0.25, 0.25, 0.06, 0, 0x15181c, { rough: 0.6, seg: 6 }).rotation.z = Math.PI / 2;
    const flames = group(pan, 0, 0.1, 0);
    for (let i = 0; i < 4; i++) ball(flames, 0.07 - i * 0.01, (i % 2) * 0.08 - 0.04, 0.06 + i * 0.08, ((i + 1) % 2) * 0.06 - 0.03, 0xff8a2b, { emissive: 0xff6a00, ei: 2.2, rough: 0.4, seg: 8, seg2: 6 });
    const smoke = cyl(pan, 0.14, 0.3, 0.9, 0, 0.6, 0, 0x2b3138, { rough: 0.9, opacity: 0.45, transparent: true, cast: false, seg: 10 });
    const fireBase = group(pan, 0, 0.05, 0);
    const baseRing = torus(fireBase, 0.2, 0.01, 0, 0, 0, YC6_ACCENT, { emissive: YC6_ACCENT, ei: 1.6, rough: 0.4, cast: false, seg: 6, seg2: 24 });
    baseRing.rotation.x = Math.PI / 2;
    holoTag(pan, "base of the fire", 0, 0.5, 0.3, { css: YC6_CSS, w: 0.3 });
    reg(hits, fireBase, "pan-fire-base");
    const flameHit = box(pan, 0.3, 0.3, 0.3, 0, 0.5, 0, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(pan, "aim at the flames?", 0, 0.9, 0, { css: "#d2312b", w: 0.4 });
    reg(hits, flameHit, "aim-at-flames");
    const blanketOnPan = box(pan, 0.5, 0.02, 0.5, 0, 0.1, 0, 0x8a3a1a, { rough: 0.9 });
    blanketOnPan.visible = false;
    const hood = group(range, 0, 1.55, 0);
    box(hood, 1.3, 0.35, 0.8, 0, 0, 0, 0xc8ced4, { rough: 0.35, metal: 0.6, finish: "brushed" });
    const filter = box(hood, 0.9, 0.03, 0.5, 0, -0.18, 0, 0x8a6a2a, { rough: 0.9, emissive: 0x3a2a08, ei: 0.3 });
    holoTag(hood, "hood grease filter", 0, -0.4, 0.3, { css: YC6_CSS, w: 0.36 });
    reg(hits, filter, "grease-filter-loaded");
    // Counters, sink and the water bucket under it; the galley door aft; the overhead hatch.
    const counter = group(g, -1.3, 0.06, -1.6);
    box(counter, 1.6, 0.85, 0.7, 0, 0.42, 0, 0xdfe3e6, { rough: 0.5 });
    box(counter, 1.6, 0.04, 0.72, 0, 0.87, 0, 0xc8ced4, { rough: 0.35, metal: 0.6, finish: "brushed" });
    box(counter, 0.5, 0.2, 0.4, 0.3, 0.8, 0, 0x8a949d, { rough: 0.3, metal: 0.6 });
    cyl(counter, 0.012, 0.012, 0.3, 0.3, 1.05, -0.2, 0xe4e8ec, { rough: 0.22, metal: 0.55, seg: 8 });
    const bucket = cyl(counter, 0.14, 0.12, 0.3, -0.5, 0.15, 0.5, 0x2f6fe0, { rough: 0.5, seg: 12 });
    holoTag(counter, "water bucket — on the grease?", -0.5, 0.6, 0.5, { css: "#d2312b", w: 0.58 });
    reg(hits, bucket, "water-bucket");
    const doorFrame = group(g, 0, 0.06, 2.05);
    box(doorFrame, 1.0, 2.1, 0.08, 0, 1.05, 0, 0xc8ced4, { rough: 0.5, metal: 0.3 });
    const door = box(doorFrame, 0.9, 2.0, 0.05, 0.45, 1.0, -0.4, 0xe9ebe6, { rough: 0.5 });
    door.rotation.y = -1.1;
    holoTag(doorFrame, "galley door", 0, 2.3, 0, { css: YC6_CSS, w: 0.26 });
    reg(hits, door, "galley-door");
    const reenterHit = box(doorFrame, 0.6, 0.6, 0.3, 0, 1.2, -0.25, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(doorFrame, "back in already?", 0, 1.7, -0.3, { css: "#d2312b", w: 0.36 });
    reg(hits, reenterHit, "reenter-early");
    const smokeWatch = box(doorFrame, 0.3, 0.6, 0.2, -0.3, 1.4, 0.15, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(doorFrame, "smoke at the seal", -0.4, 1.9, 0.2, { css: YC6_CSS, w: 0.34 });
    reg(hits, smokeWatch, "smoke-watch");
    const doorSmoke = box(doorFrame, 0.9, 0.06, 0.1, 0, 2.02, 0.05, 0x2b3138, { rough: 0.9, opacity: 0.5, transparent: true, cast: false });
    doorSmoke.visible = false;
    const guest = standingFigure(g, 0.6, 3.0, { ry: Math.PI, cloth: 0x6a4a8a, trousers: 0x2b3138, atStation: true });
    guest.visible = false;
    holoTag(guest, "guest — at the door", 0, 1.9, 0, { css: "#d2312b", w: 0.36 });
    const hatch = group(g, 0.4, 2.2, -0.4);
    const hatchLid = box(hatch, 0.7, 0.05, 0.7, 0, 0, 0, 0xc0c6cc, { rough: 0.4, metal: 0.5 });
    holoTag(hatch, "overhead hatch", 0, -0.3, 0, { css: YC6_CSS, w: 0.3 });
    reg(hits, hatchLid, "overhead-hatch");
    const wideHit = box(hatch, 0.5, 0.2, 0.5, 0.7, 0, 0, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(hatch, "throw it wide open?", 0.7, -0.3, 0, { css: "#d2312b", w: 0.42 });
    reg(hits, wideHit, "hatch-wide");
    // Fuel shut-off on the bulkhead, the blanket pouch, the extinguisher bracket, the fixed system pull, the second extinguisher.
    const shutoff = group(g, 2.3, 1.3, -1.0);
    cyl(shutoff, 0.05, 0.05, 0.1, 0, 0, 0, 0xd2312b, { rough: 0.4, metal: 0.4, seg: 10 });
    shutoff.children[0].rotation.z = Math.PI / 2;
    const shutHandle = box(shutoff, 0.03, 0.22, 0.03, -0.06, 0.1, 0, 0xd2312b, { rough: 0.5 });
    holoTag(shutoff, "galley fuel shut-off", -0.1, 0.32, 0, { css: "#d2312b", w: 0.4 });
    reg(hits, shutoff, "galley-fuel-shutoff");
    const pouch = group(g, 2.3, 1.4, -0.2);
    box(pouch, 0.06, 0.3, 0.22, 0, 0, 0, 0xd2312b, { rough: 0.7 });
    const tabs = box(pouch, 0.04, 0.1, 0.06, -0.04, -0.2, 0, 0xf1f3f4, { rough: 0.7 });
    holoTag(pouch, "fire blanket", -0.1, 0.3, 0, { css: YC6_CSS, w: 0.26 });
    reg(hits, tabs, "fire-blanket-pouch");
    const blanketHold = box(g, 0.5, 0.4, 0.5, 0.9, 1.0, -1.1, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "blanket over the pan — hold", 0.9, 1.35, -1.1, { css: YC6_CSS, w: 0.5 });
    reg(hits, blanketHold, "fire-blanket-hold");
    const bracket = group(g, -2.25, 0.06, 0.6);
    box(bracket, 0.08, 0.3, 0.12, 0, 1.1, 0, 0x2b3138, { rough: 0.5 });
    const ext = group(bracket, 0.12, 0.85, 0);
    cyl(ext, 0.07, 0.07, 0.45, 0, 0, 0, 0xd2312b, { rough: 0.4, seg: 14 });
    box(ext, 0.06, 0.1, 0.04, 0, 0.3, 0, 0x2b3138, { rough: 0.5 });
    const gauge = cyl(ext, 0.025, 0.025, 0.01, 0.05, 0.25, 0.03, 0xf1f3f4, { rough: 0.4, seg: 10 });
    gauge.rotation.x = Math.PI / 2;
    const needle = box(ext, 0.003, 0.02, 0.003, 0.05, 0.26, 0.035, 0xd2312b, { rough: 0.4 });
    needle.rotation.z = 0.9;
    holoTag(bracket, "galley extinguisher", 0.12, 1.5, 0, { css: YC6_CSS, w: 0.38 });
    reg(hits, ext, "portable-extinguisher");
    reg(hits, gauge, "extinguisher-gauge-low");
    const pull = group(g, -0.7, 1.5, 2.08);
    box(pull, 0.16, 0.24, 0.08, 0, 0, 0, 0xd2312b, { rough: 0.5 });
    const pullHandle = torus(pull, 0.05, 0.012, 0, -0.06, 0.06, 0xf1f3f4, { rough: 0.5, seg: 6, seg2: 14 });
    holoTag(pull, "fixed system — pull", 0, 0.28, 0, { css: "#d2312b", w: 0.4 });
    reg(hits, pull, "fixed-system-pull");
    const ext2 = group(g, 1.3, 0.9, 2.08);
    cyl(ext2, 0.07, 0.07, 0.45, 0, 0, 0, 0xd2312b, { rough: 0.4, seg: 14 });
    box(ext2, 0.06, 0.1, 0.04, 0, 0.3, 0, 0x2b3138, { rough: 0.5 });
    holoTag(ext2, "passageway extinguisher", 0, 0.55, 0, { css: YC6_CSS, w: 0.44 });
    reg(hits, ext2, "second-extinguisher");
    // Companionway: alarm, hailer, headcount board, fire plan, log, intercom, gloves, fuel tag on the valve below (a sight glass panel).
    const alarm = group(g, -1.5, 1.6, 2.08);
    box(alarm, 0.16, 0.16, 0.08, 0, 0, 0, 0xd2312b, { rough: 0.5 });
    const alarmLamp = ball(alarm, 0.03, 0, 0, 0.05, 0x8a3a1a, { emissive: 0x8a3a1a, ei: 0.4, seg: 8, seg2: 6 });
    holoTag(alarm, "muster alarm", 0, 0.22, 0, { css: "#d2312b", w: 0.28 });
    reg(hits, alarm, "muster-alarm");
    const hailer = instrument(g, -1.9, 1.05, 1.5, { ry: Math.PI / 2, idle: "HAILER", color: YC6_ACCENT, w: 0.12, d: 0.2 });
    box(g, 0.3, 0.6, 0.3, -1.9, 0.75, 1.5, 0xe9ebe6, { rough: 0.45 });
    holoTag(hailer, "companionway hailer", 0, 0.18, 0, { css: YC6_CSS, w: 0.4 });
    reg(hits, hailer, "companionway-hailer");
    const headcount = holoPanel(g, 0.42, 0.3, 1.9, 1.5, 2.08, (cx, w, h) => {
      cx.fillStyle = "#0e1a26"; cx.fillRect(0, 0, w, h); cx.fillStyle = YC6_CSS; cx.fillRect(0, 0, w, 6);
      cx.font = `600 ${Math.round(h * 0.13)}px 'Barlow Condensed', Arial, sans-serif`; cx.textAlign = "left"; cx.textBaseline = "middle";
      cx.fillStyle = "#dcefff"; cx.fillText("HEADCOUNT — AFT MUSTER", w * 0.06, h * 0.17);
      cx.font = `${Math.round(h * 0.1)}px Arial, sans-serif`; cx.fillStyle = "#eef6ff";
      ["Guests: — of manifest", "Crew: — of 3", "Closed: —"].forEach((l, i) => cx.fillText(l, w * 0.06, h * (0.42 + i * 0.2)));
    }, { ry: Math.PI, accent: YC6_ACCENT });
    reg(hits, headcount, "headcount-board");
    const plan = holoPanel(g, 0.8, 0.54, -2.28, 1.5, -0.6, (cx, w, h) => {
      cx.fillStyle = "#0e1a26"; cx.fillRect(0, 0, w, h); cx.fillStyle = YC6_CSS; cx.fillRect(0, 0, w, 6);
      cx.font = `600 ${Math.round(h * 0.1)}px 'Barlow Condensed', Arial, sans-serif`; cx.textAlign = "left"; cx.textBaseline = "middle";
      cx.fillStyle = "#dcefff"; cx.fillText("FIRE PLAN — GALLEY", w * 0.06, h * 0.13);
      cx.font = `${Math.round(h * 0.07)}px Arial, sans-serif`; cx.fillStyle = "#eef6ff";
      ["1 Fuel shut-off: starboard bulkhead", "2 Blanket · then extinguisher per its label", "3 Fixed system pull: by the door · door shut",
       "4 Wait: per the plan · smoke watch at the seal", "5 Guests: alarm · hailer · aft muster · count", "6 Vent: hatch cracked to the plan · never wide"]
        .forEach((l, i) => cx.fillText(l, w * 0.06, h * (0.28 + i * 0.115)));
    }, { ry: Math.PI / 2, accent: YC6_ACCENT });
    reg(hits, plan, "fire-plan-board");
    const log = holoPanel(g, 0.5, 0.36, -2.28, 1.5, 0.9, (cx, w, h) => {
      cx.fillStyle = "#0e1a26"; cx.fillRect(0, 0, w, h); cx.fillStyle = YC6_CSS; cx.fillRect(0, 0, w, 6);
      cx.font = `600 ${Math.round(h * 0.13)}px 'Barlow Condensed', Arial, sans-serif`; cx.textAlign = "left"; cx.textBaseline = "middle";
      cx.fillStyle = "#dcefff"; cx.fillText("FIRE LOG", w * 0.06, h * 0.17);
      cx.font = `${Math.round(h * 0.1)}px Arial, sans-serif`; cx.fillStyle = "#eef6ff";
      ["Fire: —", "Response: —", "Remarks: —"].forEach((l, i) => cx.fillText(l, w * 0.06, h * (0.42 + i * 0.2)));
    }, { ry: Math.PI / 2, accent: YC6_ACCENT });
    reg(hits, log, "fire-log");
    const intercom = group(g, 2.28, 1.5, 0.8);
    box(intercom, 0.06, 0.24, 0.16, 0, 0, 0, 0x2b3138, { rough: 0.5, metal: 0.4 });
    const icLamp = ball(intercom, 0.024, -0.035, 0.07, 0, 0x59c97b, { emissive: 0x59c97b, ei: 1.2, seg: 8, seg2: 6 });
    holoTag(intercom, "galley intercom", -0.05, 0.24, 0, { css: YC6_CSS, w: 0.32 });
    reg(hits, intercom, "galley-intercom");
    const gloves = group(g, 2.28, 1.0, 0.2);
    box(gloves, 0.04, 0.2, 0.12, 0, 0, 0, 0x8a3a1a, { rough: 0.8 });
    box(gloves, 0.04, 0.2, 0.12, -0.03, -0.04, 0.06, 0x8a3a1a, { rough: 0.8 });
    holoTag(gloves, "galley gloves", -0.1, 0.25, 0, { css: YC6_CSS, w: 0.28 });
    reg(hits, gloves, "galley-gloves");
    const valvePanel = group(g, 1.6, 0.06, 1.2);
    box(valvePanel, 0.5, 0.5, 0.4, 0, 0.25, 0, 0xc8ced4, { rough: 0.5, metal: 0.3 });
    cyl(valvePanel, 0.04, 0.04, 0.1, 0, 0.55, 0, 0xb87333, { rough: 0.4, metal: 0.6, seg: 10 });
    const tag = box(valvePanel, 0.1, 0.14, 0.01, 0.08, 0.5, 0.21, 0xd2312b, { rough: 0.6 });
    tag.visible = false;
    holoTag(valvePanel, "galley fuel valve — engineer's tag", 0, 0.9, 0, { css: YC6_CSS, w: 0.58 });
    reg(hits, valvePanel, "fuel-isolation-tag");

    const engineer = standingFigure(g, -1.4, 1.1, { ry: -2.4, cloth: 0x3f4a55, trousers: 0x2b3138, gloves: true });
    holoTag(engineer, "engineer", 0, 1.9, 0, { css: YC6_CSS, w: 0.22 });

    return {
      hits,
      spawnLook: new THREE.Vector3(1.0, 1.0, -1.4),
      onStep() {},
      onStepComplete(step) {
        if (step.id === "gloves-and-blanket") { gloves.visible = false; tabs.position.y = -0.24; }
        if (step.id === "galley-walk") { filter.material = mat(0xc8ced4, { rough: 0.35, metal: 0.6 }); needle.rotation.z = -0.6; }
        if (step.id === "fuel-shutoff") shutHandle.rotation.x = Math.PI / 2;
        if (step.id === "blanket-hold") { blanketOnPan.visible = true; flames.scale.set(0.5, 0.4, 0.5); }
        if (step.id === "extinguisher-sweep") { ext.visible = false; flames.scale.set(0.2, 0.2, 0.2); smoke.material.opacity = 0.7; }
        if (step.id === "fixed-system-pull") { door.rotation.y = 0; door.position.set(0, 1.0, 0); flames.visible = false; smoke.scale.set(1.6, 1, 1.6); doorSmoke.visible = true; }
        if (step.id === "muster-guests") {
          alarmLamp.material = mat(0xf0645b, { emissive: 0xf0645b, ei: 1.8 });
          repaint(headcount.userData.face, (cx, w, h) => {
            cx.fillStyle = "#0e1a26"; cx.fillRect(0, 0, w, h); cx.fillStyle = "#59c97b"; cx.fillRect(0, 0, w, 6);
            cx.font = `600 ${Math.round(h * 0.13)}px 'Barlow Condensed', Arial, sans-serif`; cx.textAlign = "left"; cx.textBaseline = "middle";
            cx.fillStyle = "#dcefff"; cx.fillText("HEADCOUNT — AFT MUSTER", w * 0.06, h * 0.17);
            cx.font = `${Math.round(h * 0.1)}px Arial, sans-serif`; cx.fillStyle = "#e6f6ea";
            ["Guests: all · per manifest", "Crew: 3 of 3", "Closed: yes"].forEach((l, i) => cx.fillText(l, w * 0.06, h * (0.42 + i * 0.2)));
          });
        }
        if (step.id === "smoke-watch") doorSmoke.material.opacity = 0.2;
        if (step.id === "hatch-crack") { hatchLid.rotation.x = -0.35; hatchLid.position.set(0, 0.06, -0.1); smoke.material.opacity = 0.2; }
        if (step.id === "fuel-tag-confirm") tag.visible = true;
        if (step.id === "fire-log") {
          repaint(log.userData.face, (cx, w, h) => {
            cx.fillStyle = "#0e1a26"; cx.fillRect(0, 0, w, h); cx.fillStyle = "#59c97b"; cx.fillRect(0, 0, w, 6);
            cx.font = `600 ${Math.round(h * 0.13)}px 'Barlow Condensed', Arial, sans-serif`; cx.textAlign = "left"; cx.textBaseline = "middle";
            cx.fillStyle = "#dcefff"; cx.fillText("FIRE LOG", w * 0.06, h * 0.17);
            cx.font = `${Math.round(h * 0.1)}px Arial, sans-serif`; cx.fillStyle = "#e6f6ea";
            ["Fire: pan · hood · fuel shut first", "Response: blanket · portable · fixed · wait", "Remarks: filter · gauge · door · reflash"].forEach((l, i) => cx.fillText(l, w * 0.06, h * (0.42 + i * 0.2)));
          });
        }
        if (step.id === "crew-checkin") icLamp.material = mat(0x4fd1ff, { emissive: 0x4fd1ff, ei: 1.2 });
      },
      onHazard() {},
      onInterrupt(it) {
        if (it.id === "guest-opens-door") { guest.visible = true; door.rotation.y = -1.3; flames.scale.set(0.9, 0.9, 0.9); }
        if (it.id === "pan-reflash") { doorSmoke.visible = true; doorSmoke.material.opacity = 0.8; doorSmoke.scale.set(1.4, 2, 1.4); icLamp.material = mat(0xf0645b, { emissive: 0xf0645b, ei: 1.4 }); }
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "guest-opens-door") { door.rotation.y = 0; door.position.set(0, 1.0, 0); guest.position.z = 3.6; flames.scale.set(0.5, 0.4, 0.5); }
        if (it.id === "pan-reflash") { ext2.position.set(0.3, 1.1, 1.6); doorSmoke.scale.set(1, 1, 1); doorSmoke.material.opacity = 0.35; icLamp.material = mat(0xf2c14b, { emissive: 0xf2c14b, ei: 1.2 }); }
      },
      animate(t, dt, session) {
        const step = session?.step;
        if (flames.visible) flames.children.forEach((f, i) => { f.position.y = 0.06 + i * 0.08 + Math.sin(t * 9 + i) * 0.02; f.material.emissiveIntensity = 1.8 + Math.sin(t * 12 + i) * 0.5; });
        if (session?.turn && step?.id === "fixed-system-pull") pullHandle.position.z = 0.06 + session.turn.amount * 0.12;
        const gg = session?.gauge;
        if (gg && !gg.committed && step?.id === "hatch-crack") hatchLid.rotation.x = -gg.t * 1.2;
        if (alarmLamp.material.emissiveIntensity > 1.5) alarmLamp.material.emissiveIntensity = 1.4 + Math.sin(t * 10) * 0.5;
        void dt; void CITY;
      },
    };
  },
};
