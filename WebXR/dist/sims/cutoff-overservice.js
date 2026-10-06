import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, ball, torus, group, decal, repaint, signFace, mat, counter, seatedFigure,
} from "../../../shared/kit.js";
import {
  CITY, stationPad, holoPanel, holoTag, instrument, lockTag, reg,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Cut-Off / Overservice VR — Bartending, station two.
// Recognising the cues RBS training is built around, slowing service before
// it becomes a confrontation, and making the cut-off itself quiet, plain and
// final: told to the customer once, told to the rest of the shift, and
// written down. California Business and Professions Code §25602 forbids
// selling to somebody obviously intoxicated, and the licence that pays
// everyone's wages carries the civil exposure of a dram-shop claim on top of
// it — this station is the habit that keeps both from ever being tested.

const CO_ACCENT = 0xf2a23b;

export const SIM_CUTOFF_OVERSERVICE = {
  id: "cutoff-overservice",
  index: "134",
  domain: "Culinary & Hospitality",
  trade: "Bartender — UNITE HERE Local 2",
  category: "Culinary & Hospitality",
  indoor: "bar",
  weather: "clear",
  certification: "The California ABC Responsible Beverage Service (RBS) Training Program Act; California Business and Professions Code §25602 — sale to an obviously intoxicated person — and the dram-shop civil liability it carries for the licence; NSF-certified ice and glassware equipment kept out of hand contact under the California Retail Food Code; OSHA 29 CFR 1910.1030 bloodborne pathogens for the glass that breaks the moment a cutoff turns physical; UNITE HERE Local 2's contract language on staffing a bar so one bartender is never alone with a cutoff",
  name: "Cut-Off / Overservice",
  title: simTitle("Cut-Off / Overservice"),
  tagline: "The RBS cues, the slower pour, the quiet cutoff, the ride home and the log entry that closes it out",
  accent: CO_ACCENT,
  accentCss: "#f2a23b",
  parSeconds: 260,
  footprint: 2.7,
  badge: { id: "clean-cutoff", name: "Clean Cutoff", note: "Recognised, slowed, cut off quietly, and sent home safe — nobody argued and nobody drove" },

  game: system({
    name: "Service Standard",
    currency: "POUR",
    ranks: ["Barback", "Service Bartender", "Shift Lead", "Bar Manager", "RBS Certified Trainer"],
    badges: [
      { id: "read-the-room", name: "Read the Room", note: "Every RBS cue spotted before the pour changed", test: AWARD.stepClean("cues-sweep") },
      { id: "no-argument", name: "No Argument", note: "No unsafe action anywhere in the run", test: AWARD.safe },
      { id: "steady-through-it", name: "Steady Through It", note: "Held both watch periods the full count", test: AWARD.unbroken },
    ],
    challenges: [
      { id: "quiet-and-fast", name: "Quiet and Fast", note: "Complete inside 80% of par", test: AWARD.fast(0.8) },
      { id: "no-corrections", name: "No Corrections", note: "No corrections anywhere in the run", test: AWARD.clean },
      { id: "seven-straight", name: "Seven Straight", note: "Seven correct actions in a row", test: AWARD.streak(7) },
    ],
  }),

  hazards: {
    "free-pour-bottle": "That bottle has no metered pourer on it. A free pour to a guest already showing every RBS cue is exactly the sale §25602 exists to stop, and it is also the sale a dram-shop claim is built out of afterward — the reduced, measured pour is not a suggestion, it is the whole legal difference.",
    "loud-callout": "You said it into the room instead of to him. A cutoff announced over the bar mic or across three feet of open air turns a quiet decision into a public one, and a customer who has just been embarrassed in front of his table is a customer who argues instead of leaving.",
    "reorder-tap": "That is the quick-key that rings another round to his tab. A flag on the till only works if nobody presses through it — one more pour after the cutoff undoes the whole conversation and puts the sale back on the same obviously-intoxicated customer §25602 was written for.",
    "handoff-note-skip": "The relief board is still blank. The POS flag stops the register; it does not stop the next bartender who never heard about this table from pouring him one anyway the moment your shift ends.",
  },

  lateNotes: {
    "customer-keys": "Not yet — the interrupt already has you reaching for these. Hold the moment until the ride step actually asks for them, or you are grabbing at a set of keys with no plan behind it.",
  },

  steps: [
    {
      id: "read-tab", kind: "select", target: "pos-terminal",
      title: "Check the tab before you check him",
      cue: "Open his tab on the till: drink count and how long he has been running it.",
      why: "The count and the clock are the two facts an RBS decision is actually built on — a fourth drink in forty minutes reads completely differently from a fourth drink in three hours, and the till is the only thing in the room keeping an honest number.",
    },
    {
      id: "cues-sweep", kind: "find", noHint: true,
      targets: ["cue-speech", "cue-coordination", "cue-judgment", "cue-appearance"],
      itemNames: {
        "cue-speech": "slurred, slowed speech", "cue-coordination": "lost coordination reaching for the glass",
        "cue-judgment": "loud, poor judgement with the table", "cue-appearance": "flushed, unsteady appearance",
      },
      itemNotes: {
        "cue-speech": "Speech slowing and running together is one of the four RBS categories on its own, before anything else changes.",
        "cue-coordination": "A hand that misses the glass on the first try and has to correct is coordination going, not clumsiness.",
        "cue-judgment": "Louder, more argumentative, less aware of the table around him — judgement is usually the first thing RBS training says to watch for and the last thing a customer will admit to.",
        "cue-appearance": "Flushed skin and a slow, unsteady turn of the head belong on the same checklist as the other three, not dismissed as just warm in here.",
      },
      title: "Read the four RBS cues before you pour again",
      cue: "Speech, coordination, judgement, appearance — look for all four before the next drink goes out.",
      why: "The RBS curriculum teaches exactly these four categories because any one of them alone can have an innocent explanation, and two or more together are what actually separates a customer who has had a long week from one who is obviously intoxicated under §25602.",
    },
    {
      id: "water-first", kind: "select", target: "water-glass",
      title: "Slow him down with water before you slow him down with a decision",
      cue: "Set a water glass down without being asked.",
      why: "Slowing service starts before the cutoff conversation does. A water glass costs nothing, buys time for the cues to either resolve or confirm themselves, and never has to be explained to anybody.",
    },
    {
      id: "food-offer", kind: "select", target: "food-menu",
      title: "Offer food off the kitchen's menu",
      cue: "Slide the food menu across — something in front of him slows the pace on its own.",
      why: "Food in the stomach does nothing to reverse intoxication that has already happened, but it slows the rate a customer keeps drinking at, and it gives you a second reasonable thing to be doing besides watching the clock on his tab.",
    },
    {
      id: "reduced-pour", kind: "gauge", target: "pour-spout",
      title: "If one more round is coming, make it a smaller one",
      cue: "Pour to the reduced line on the metered spout, not the standard one.",
      gauge: { label: "OZ", speed: 0.72, green: [0.28, 0.42], readout: (t) => `${(t * 2.2).toFixed(2)} oz`, missNote: "That landed close to a full standard pour. For a guest already showing two RBS cues, the pour gets smaller before the conversation gets harder." },
      why: "A reduced pour is a real intervention, not a compromise — it buys the table another twenty minutes to sober up on the same tab, and it is the difference between a bar that slowed service and a bar that just kept serving more slowly.",
    },
    {
      id: "meter-swap", kind: "turn", target: "speed-pourer",
      title: "Swap the free-pour spout for the metered one",
      cue: "Turn the collar until the metered pourer seats — no more free pours to this table tonight.",
      turn: { turns: 0.75, axis: "y", label: "POUR SPOUT" },
      why: "A metered spout takes the judgement call out of the bottle itself: it cannot be talked into a heavier pour by a customer who has already lost the judgement to ask for one fairly.",
    },
    {
      id: "watch-table", kind: "hold", target: "table-watch-point", seconds: 6,
      title: "Keep your eyes on the table while the decision forms",
      cue: "Hold your attention on him and the table around him for a moment before you commit to the cutoff.",
      why: "The decision to cut somebody off is made by watching, not by a single glance — RBS training is explicit that the cues are confirmed over a minute or two, not diagnosed on the first pass across the room.",
      holdBreakNote: "You looked away before the picture was clear. A cutoff decided on half the evidence is either too early to defend or too late to matter.",
    },
    {
      id: "cutoff-words", kind: "sequence",
      targets: ["cutoff-approach", "cutoff-name", "cutoff-offer"],
      itemNames: {
        "cutoff-approach": "approach quietly, one to one", "cutoff-name": "name the cutoff plainly",
        "cutoff-offer": "offer water, food or a ride",
      },
      title: "Have the conversation quietly and without arguing",
      cue: "Approach him alone and low-key, say the decision plainly once, then offer the alternative.",
      why: "The order matters: a quiet approach before the words keeps the table from feeling ambushed, naming it plainly once removes any room to negotiate it away, and the offer that follows is what turns a refusal into a decision he can leave with instead of a fight he has to win.",
      outOfOrderNote: "Approach quietly first, then name the cutoff, then offer the alternative — offering a ride before he even knows he is cut off reads as an argument you are trying to win, not a decision that is already made.",
    },
    {
      id: "flag-tab", kind: "select", target: "pos-flag",
      title: "Flag the tab in the till",
      cue: "Mark his tab so the register itself refuses the next round.",
      why: "A flag on the tab is the difference between a decision that lives in your head for the next ten minutes and one that survives you getting busy at the other end of the bar.",
    },
    {
      id: "tell-shift", kind: "select", target: "shift-radio",
      title: "Tell the rest of the shift by name",
      cue: "Call it out to whoever else is working the floor — not just the till.",
      why: "The POS flag stops one register. A cutoff that only exists on a screen does not stop a barback covering your section for five minutes, or a server who never looked at the tab, from pouring him one anyway.",
    },
    {
      id: "hold-after", kind: "hold", target: "door-watch-point", seconds: 6,
      title: "Stay with it after the words are said",
      cue: "Keep watching the table and the door while you finish the rest of the shift's business.",
      why: "A cutoff is not finished when the sentence is finished. The two minutes after it — before the ride is actually arranged — are when a table gets a second drink from a friend or a customer who has decided he does not need one.",
      holdBreakNote: "You turned back to the rest of the bar too soon. The two minutes right after a cutoff are the ones that decide whether it holds.",
    },
    {
      id: "secure-keys", kind: "drag", target: "customer-keys",
      title: "Take the keys off the bar and lock them up",
      cue: "Move his keys from the bar top into the lockbox — nobody drives on them tonight.",
      drag: { to: "key-lockbox", radius: 0.45, missNote: "Not in the lockbox. Keys left sitting on the bar are keys somebody can just pick back up." },
      why: "Dram-shop liability does not end at the sale — it follows the guest out the door. Physically taking the keys off the bar is worth more than any conversation about whether he is fine to drive.",
    },
    {
      id: "call-ride", kind: "select", target: "ride-phone",
      title: "Arrange the ride before he leaves the stool",
      cue: "Call a rideshare, a cab, or the friend who is actually sober.",
      why: "An offer to call a ride that is never followed through is not a safe cutoff, it is a sentence said to make the conversation feel finished — the ride has to actually be on its way before anyone stands up.",
    },
    {
      id: "incident-log", kind: "select", target: "incident-log-board",
      title: "Write the cutoff into the log",
      cue: "Log the time, the drink count, the cues you saw, and how he got home.",
      why: "A written cutoff — time, count, cues, outcome — is what the licence and your own name are protected by if tonight is ever the night that gets asked about later. An unlogged cutoff is a story two people remember differently.",
    },
  ],

  interrupts: [
    {
      id: "friend-second-round",
      kind: "Table working around the cutoff",
      after: "watch-table", delay: 3, seconds: 12,
      alert: "His friend has just ordered two beers off the tap list and is sliding one straight across the table to him.",
      cue: "The cutoff has not even started and the table is already covering for him.",
      target: "friend-second-glass",
      why: "A cutoff that only stops your own pour is not a cutoff — a friend handing a fresh glass across the table undoes the whole decision in front of you, and it gets stopped the moment it happens, not argued about after.",
      missNote: "The glass stayed in front of him and he drank from it. Every RBS cue you were watching for is still true, and the table just proved a cutoff has to cover the friend as well as the register.",
      wrongNote: "It is the second glass sliding across the table. That is the sale happening right in front of you, table service or not.",
    },
    {
      id: "customer-stands-to-leave",
      kind: "Customer leaving toward the car park",
      after: "hold-after", delay: 3, seconds: 12,
      alert: "He has stood up off the stool, picked his keys up off the bar, and is walking toward the door and the car park.",
      cue: "The ride is not called yet and he already has his keys out.",
      target: "customer-keys",
      why: "The conversation was won the moment he agreed to stop drinking; it is lost the moment he drives away on it. Getting the keys before the door is the entire point of everything that happened before this second.",
      missNote: "He walked out with his own keys in his hand. Everything from the cues to the quiet cutoff protected the bar's licence for exactly as long as it took him to reach the car park — dram-shop liability does not stop at the door.",
      wrongNote: "It is the keys in his hand. Nothing else in reach matters until those are off him.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.7, CO_ACCENT);

    // -------------------------------------------------------------- bar top
    const barTop = counter(g, 6.2, 0.66, 0, -3.25, 0x3d2a1e, { height: 1.05, metal: 0.1, rough: 0.4, undershelf: false });
    box(barTop, 6.4, 0.05, 0.1, 0, 1.08, 0.33, 0xb8862b, { rough: 0.4, metal: 0.5, finish: "brushed" }); // the rail
    reg(hits, barTop, "bar-top");

    // ------------------------------------------------------------ the well
    // Speed rail on the staff side, mounted under the counter's back lip.
    const rail = group(g, -0.7, 0, -3.55);
    box(rail, 1.7, 0.06, 0.24, 0, 0.78, 0, 0x1b1e22, { rough: 0.6, metal: 0.3 });
    const BOTTLE_TONES = [0x7a3a2c, 0x2c5a3a, 0x5a4a7a, 0x9a8a5a, 0x3a5a7a, 0xb8862b];
    let freePourBottle = null;
    for (let i = 0; i < 7; i++) {
      const bx = -0.75 + i * 0.25;
      const bottle = cyl(rail, 0.038, 0.038, 0.3, bx, 0.96, 0, BOTTLE_TONES[i % BOTTLE_TONES.length], { rough: 0.25, metal: 0.1, seg: 10 });
      if (i === 3) {
        freePourBottle = bottle;
        holoTag(rail, "Free pour — no meter", bx, 1.2, 0, { css: "#f0645b", w: 0.42 });
      } else {
        cyl(rail, 0.012, 0.012, 0.05, bx, 1.14, 0, 0xdfe4e8, { rough: 0.3, metal: 0.7, seg: 8 }); // metered pourer spout
      }
    }
    reg(hits, freePourBottle, "free-pour-bottle");
    const speedPourer = group(rail, 0.75, 0.96, 0);
    cyl(speedPourer, 0.038, 0.038, 0.3, 0, 0, 0, 0xb8862b, { rough: 0.25, metal: 0.1, seg: 10 });
    const pourerCollar = cyl(speedPourer, 0.02, 0.02, 0.04, 0, 0.18, 0, 0xdfe4e8, { rough: 0.3, metal: 0.7, seg: 10 });
    holoTag(rail, "Speed pourer", 0.75, 1.24, 0, { css: "#f2a23b", w: 0.3 });
    reg(hits, speedPourer, "speed-pourer");

    // The pour-spout gauge target: a shot glass under a nozzle on the counter.
    const pourStation = group(g, -1.7, 0, -3.4);
    cyl(pourStation, 0.04, 0.035, 0.08, 0, 1.09, 0, 0xdfe4e8, { rough: 0.15, metal: 0, opacity: 0.35, transparent: true });
    const nozzle = cyl(pourStation, 0.015, 0.015, 0.12, 0, 1.2, 0, 0x8b929a, { rough: 0.4, metal: 0.7, seg: 8 });
    holoTag(pourStation, "Pour to the line", 0, 1.35, 0, { css: "#f2a23b", w: 0.36 });
    reg(hits, nozzle, "pour-spout");

    // Ice well beside the rail.
    const iceWell = box(g, 0.5, 0.34, 0.4, -2.5, 0.92, -3.5, 0xdfe4e8, { rough: 0.3, metal: 0.2 });
    for (let i = 0; i < 10; i++) {
      ball(g, 0.03, -2.65 + (i % 5) * 0.07, 1.11, -3.44 + Math.floor(i / 5) * 0.1, 0xeaf6fb, { rough: 0.1, metal: 0, opacity: 0.85, transparent: true, cast: false });
    }
    holoTag(g, "Ice well", -2.5, 1.15, -3.5, { css: "#4fd1ff", w: 0.24 });

    // Glass rack.
    const glassRack = group(g, 2.9, 0, -3.5);
    box(glassRack, 0.5, 0.04, 0.4, 0, 0.85, 0, 0x2b3138, { rough: 0.5 });
    for (let i = 0; i < 6; i++) {
      cyl(glassRack, 0.03, 0.024, 0.09, -0.18 + (i % 3) * 0.16, 0.9, -0.1 + Math.floor(i / 3) * 0.2, 0xdfe4e8,
        { rough: 0.12, metal: 0, opacity: 0.4, transparent: true, seg: 10 });
    }
    holoTag(glassRack, "Glass rack", 0, 1.02, 0, { css: "#8fb3c4", w: 0.26 });

    // Water glass and food menu, both set out ready on the staff side of the bar.
    const waterGlass = cyl(g, 0.032, 0.028, 0.1, -0.2, 1.11, -3.42, 0xdfe4e8, { rough: 0.1, metal: 0, opacity: 0.35, transparent: true, seg: 12 });
    holoTag(g, "Water", -0.2, 1.26, -3.42, { css: "#4fd1ff", w: 0.22 });
    reg(hits, waterGlass, "water-glass");
    const foodMenu = decal(g, 0.2, 0.28, 0.4, 1.075, -3.45,
      signFace("MENU", { bg: "#241a10", accent: "#f2a23b", scale: 0.5 }), { px: 128 });
    foodMenu.rotation.x = -Math.PI / 2;
    holoTag(g, "Food menu", 0.4, 1.2, -3.45, { css: "#f2a23b", w: 0.26 });
    reg(hits, foodMenu, "food-menu");

    // POS terminal, its flag key and the wrong quick-key beside it.
    const pos = instrument(g, 2.1, 1.12, -3.42, { ry: -0.5, idle: "TAB OPEN", color: 0x2b3138, w: 0.2, d: 0.26 });
    reg(hits, pos, "pos-terminal");
    const posFlag = group(g, 2.35, 1.12, -3.3, -0.5);
    box(posFlag, 0.06, 0.02, 0.08, 0, 0.03, 0, 0xf0645b, { rough: 0.4, emissive: 0xf0645b, ei: 0.5 });
    holoTag(posFlag, "Flag tab", 0, 0.1, 0, { css: "#f0645b", w: 0.24 });
    reg(hits, posFlag, "pos-flag");
    const reorderKey = group(g, 1.9, 1.12, -3.3, -0.5);
    box(reorderKey, 0.06, 0.02, 0.08, 0, 0.03, 0, 0x59c97b, { rough: 0.4, emissive: 0x59c97b, ei: 0.5 });
    holoTag(reorderKey, "+1 ROUND", 0, 0.1, 0, { css: "#59c97b", w: 0.3 });
    reg(hits, reorderKey, "reorder-tap");

    // A mic beside the register — the wrong place to say a cutoff out loud.
    const mic = group(g, 2.55, 0, -3.75);
    cyl(mic, 0.015, 0.015, 0.5, 0, 1.35, 0, CITY.steel, { rough: 0.3, metal: 0.85, seg: 8 });
    ball(mic, 0.05, 0, 1.6, 0, 0x2b3138, { rough: 0.4 });
    holoTag(mic, "House mic", 0, 1.72, 0, { css: "#f0645b", w: 0.26 });
    reg(hits, mic, "loud-callout");

    // Shift radio, hanging where the whole floor can hear it.
    const radio = group(g, -3.2, 0, -3.8);
    box(radio, 0.09, 0.16, 0.05, 0, 1.1, 0, 0x2b3138, { rough: 0.5 });
    cyl(radio, 0.006, 0.006, 0.14, 0, 1.25, -0.02, 0x1b1e22, { rough: 0.6, seg: 6 });
    holoTag(radio, "Tell the shift", 0, 1.35, 0, { css: "#f2a23b", w: 0.3 });
    reg(hits, radio, "shift-radio");

    // Blank relief clipboard — the handoff nobody wrote down.
    const relief = decal(g, 0.2, 0.28, -3.35, 1.1, -3.7,
      signFace("RELIEF", { bg: "#241a10", accent: "#8a8f94", scale: 0.5 }), { px: 128 });
    relief.rotation.x = -Math.PI / 2;
    holoTag(g, "Relief board — blank", -3.35, 1.28, -3.7, { css: "#8a8f94", w: 0.4 });
    reg(hits, relief, "handoff-note-skip");

    // Two watch-point markers the learner holds attention on.
    const tableWatch = group(g, 0.8, 0, -2.0);
    ball(tableWatch, 0.02, 0, 1.1, 0, CO_ACCENT, { emissive: CO_ACCENT, ei: 1.3 });
    reg(hits, tableWatch, "table-watch-point");
    const doorWatch = group(g, 3.4, 0, 0.5);
    ball(doorWatch, 0.02, 0, 1.4, 0, CO_ACCENT, { emissive: CO_ACCENT, ei: 1.3 });
    holoTag(doorWatch, "Door", 0, 1.55, 0, { css: "#f2a23b", w: 0.2 });
    reg(hits, doorWatch, "door-watch-point");

    // Key lockbox and ride phone, both on the staff side.
    const lockbox = group(g, -3.3, 0, -3.35);
    box(lockbox, 0.24, 0.18, 0.16, 0, 0.95, 0, 0x2b3138, { rough: 0.5, metal: 0.3 });
    lockTag(lockbox, 0, 1.02, 0.09, { color: 0xf2a23b });
    holoTag(lockbox, "Key lockbox", 0, 1.14, 0, { css: "#f2a23b", w: 0.3 });
    reg(hits, lockbox, "key-lockbox");
    const ridePhone = group(g, -1.0, 0, -3.85);
    box(ridePhone, 0.09, 0.15, 0.035, 0, 1.05, 0, 0x2b3138, { rough: 0.5 });
    holoTag(ridePhone, "Call a ride", 0, 1.17, 0, { css: "#4fd1ff", w: 0.3 });
    reg(hits, ridePhone, "ride-phone");

    // Incident log panel on the back-bar wall.
    const logBoard = holoPanel(g, 0.56, 0.4, -3.6, 2.05, -4.15, (cx, w, h) => {
      cx.fillStyle = "rgba(24,16,4,0.9)"; cx.fillRect(0, 0, w, h);
      cx.fillStyle = "#f2a23b"; cx.fillRect(0, 0, w, 5);
      cx.fillStyle = "#fde9d2";
      cx.font = `600 ${Math.round(h * 0.13)}px 'Barlow Condensed', Arial, sans-serif`;
      cx.textAlign = "center"; cx.textBaseline = "middle";
      cx.fillText("CUTOFF LOG", w / 2, h * 0.3);
      cx.font = `${Math.round(h * 0.09)}px Arial, sans-serif`;
      cx.fillText("Time · count · cues · outcome", w / 2, h * 0.62);
      cx.fillText("Sign once the ride is confirmed", w / 2, h * 0.8);
    }, { ry: 0.4, accent: CO_ACCENT });
    reg(hits, logBoard, "incident-log-board");

    // ------------------------------------------------------- the cutoff script
    // Three small markers beside the cut-off customer's stool, worked in order.
    const script = group(g, 1.3, 0, -1.7);
    const scriptSpec = [
      ["cutoff-approach", "Approach quietly", 0.55], ["cutoff-name", "Name it plainly", 0.75], ["cutoff-offer", "Offer water / ride", 0.95],
    ];
    for (const [id, label, y] of scriptSpec) {
      const marker = ball(script, 0.022, 0, y, 0, CO_ACCENT, { emissive: CO_ACCENT, ei: 1.4 });
      holoTag(script, label, 0.16, y, 0, { css: "#f2a23b", w: 0.44 });
      reg(hits, marker, id);
    }

    // ------------------------------------------------------------- customers
    // Three barstools facing the counter, the cut-off customer nearest the door.
    function stool(x, z) {
      const st = group(g, x, 0, z);
      cyl(st, 0.16, 0.18, 0.045, 0, 0.73, 0, 0x2b211c, { rough: 0.6, seg: 16 });
      cyl(st, 0.025, 0.025, 0.72, 0, 0.37, 0, CITY.darkSteel, { rough: 0.4, metal: 0.6, seg: 10 });
      cyl(st, 0.2, 0.2, 0.03, 0, 0.02, 0, 0x1b1512, { rough: 0.6, seg: 16 });
      return st;
    }
    stool(-1.6, -2.0); stool(0.3, -2.0); stool(1.6, -2.0);

    const regular = seatedFigure(g, -1.6, 0.75, -2.0, { ry: Math.PI, cloth: 0x3d4b55, skin: 0xc99878 });
    holoTag(regular.torso, "Regular", 0, 0.8, 0, { css: "#8fb3c4", w: 0.24 });

    const friend = seatedFigure(g, 0.3, 0.75, -2.0, { ry: Math.PI + 0.25, cloth: 0x445566, skin: 0xd9a985 });

    const cutoffCustomer = seatedFigure(g, 1.6, 0.75, -2.0, { ry: Math.PI - 0.15, cloth: 0x6b4a3a, skin: 0xc99878 });
    cutoffCustomer.head.rotation.z = 0.12;
    holoTag(cutoffCustomer.torso, "Cutoff customer", 0, 0.85, 0, { css: "#f2a23b", w: 0.34 });

    // The four RBS cues, tagged directly on and beside the cutoff customer.
    const cueSpeech = ball(cutoffCustomer.head, 0.014, 0, -0.02, 0.1, 0xf2a23b, { emissive: 0xf2a23b, ei: 1.2 });
    holoTag(cutoffCustomer.head, "Slurred speech", 0.14, 0, 0.08, { css: "#f2a23b", w: 0.36 });
    reg(hits, cueSpeech, "cue-speech");
    const cueCoord = ball(cutoffCustomer.arms[1].fore, 0.016, 0, -0.28, 0.05, 0xf2a23b, { emissive: 0xf2a23b, ei: 1.2 });
    holoTag(cutoffCustomer.arms[1].fore, "Lost coordination", 0, -0.36, 0.06, { css: "#f2a23b", w: 0.4 });
    reg(hits, cueCoord, "cue-coordination");
    const cueJudgment = ball(cutoffCustomer.torso, 0.016, -0.2, 0.95, 0.1, 0xf2a23b, { emissive: 0xf2a23b, ei: 1.2 });
    holoTag(cutoffCustomer.torso, "Loud, poor judgement", -0.2, 1.04, 0.1, { css: "#f2a23b", w: 0.44 });
    reg(hits, cueJudgment, "cue-judgment");
    const cueAppearance = ball(cutoffCustomer.head, 0.016, -0.12, 0.02, 0.09, 0xf2a23b, { emissive: 0xf2a23b, ei: 1.2 });
    holoTag(cutoffCustomer.head, "Flushed, unsteady", -0.14, -0.08, 0.1, { css: "#f2a23b", w: 0.36 });
    reg(hits, cueAppearance, "cue-appearance");

    // The keys already sitting on the bar in front of the cutoff customer.
    const keys = group(g, 1.6, 0, -2.55);
    torus(keys, 0.02, 0.006, 0, 1.1, 0, 0xdfe4e8, { rough: 0.3, metal: 0.8, seg: 6, seg2: 12 });
    box(keys, 0.03, 0.01, 0.014, 0.03, 1.1, 0, 0x8b929a, { rough: 0.4, metal: 0.7 });
    holoTag(keys, "His keys", 0, 1.2, 0, { css: "#f0645b", w: 0.24 });
    reg(hits, keys, "customer-keys");

    // The friend's second glass — hidden until the interruption slides it across.
    const secondGlass = cyl(g, 0.035, 0.03, 0.12, 0.3, 1.11, -2.55, 0xdfa23b, { rough: 0.15, metal: 0, opacity: 0.7, transparent: true, seg: 12 });
    secondGlass.visible = false;
    holoTag(g, "Second beer", 0.3, 1.28, -2.55, { css: "#f0645b", w: 0.32 }).visible = false;
    reg(hits, secondGlass, "friend-second-glass");

    return {
      hits,
      footprint: 2.7,

      onStepComplete(step) {
        if (step.id === "reduced-pour") { repaint(pos.userData.screen, signFace("REDUCED", { bg: "#0d1c24", accent: "#59c97b", scale: 0.5 })); }
        if (step.id === "meter-swap") { pourerCollar.material = mat(0x59c97b, { rough: 0.3, metal: 0.7, emissive: 0x59c97b, ei: 0.4 }); }
        if (step.id === "flag-tab") { repaint(pos.userData.screen, signFace("FLAGGED", { bg: "#241008", accent: "#f0645b", scale: 0.5 })); }
        if (step.id === "secure-keys") { keys.position.set(-3.3, 0.86, -3.35); }
        if (step.id === "incident-log") {
          repaint(logBoard.userData.face, (cx, w, h) => {
            cx.fillStyle = "rgba(24,16,4,0.9)"; cx.fillRect(0, 0, w, h);
            cx.fillStyle = "#59c97b"; cx.fillRect(0, 0, w, 5);
            cx.fillStyle = "#eafbf1";
            cx.font = `600 ${Math.round(h * 0.16)}px 'Barlow Condensed', Arial, sans-serif`;
            cx.textAlign = "center"; cx.textBaseline = "middle";
            cx.fillText("LOGGED", w / 2, h * 0.4);
            cx.font = `${Math.round(h * 0.09)}px Arial, sans-serif`;
            cx.fillStyle = "#b7e6c8";
            cx.fillText("Ride confirmed · tab closed", w / 2, h * 0.68);
          });
        }
      },

      // The friend's glass really appears and slides, and the customer really
      // stands and moves toward the door — both real, immediate changes, not
      // only a banner.
      onInterrupt(it) {
        if (it.id === "friend-second-round") {
          secondGlass.visible = true;
          secondGlass.position.set(0.75, 1.11, -2.35);
          friend.arms[1].shoulder.rotation.x = -0.6;
          friend.arms[1].fore.rotation.x = -0.3;
        }
        if (it.id === "customer-stands-to-leave") {
          cutoffCustomer.root.position.set(2.6, 0.35, -0.6);
          cutoffCustomer.root.rotation.y = Math.PI - 1.1;
          keys.position.set(2.7, 0.9, -0.7);
        }
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "friend-second-round") {
          secondGlass.visible = false;
          friend.arms[1].shoulder.rotation.x = 0;
          friend.arms[1].fore.rotation.x = 0;
        }
        if (it.id === "customer-stands-to-leave") {
          cutoffCustomer.root.position.set(1.6, 0.75, -2.0);
          cutoffCustomer.root.rotation.y = Math.PI - 0.15;
        }
      },

      animate(t) {
        regular.head.rotation.y = Math.sin(t * 0.4) * 0.15;
        friend.head.rotation.y = Math.sin(t * 0.5 + 1) * 0.18;
        const gg = null; void gg;
      },
    };
  },
};
