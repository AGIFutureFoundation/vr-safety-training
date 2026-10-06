import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, ball, torus, slab, group, decal, repaint, signFace, counter,
} from "../../../shared/kit.js";
import {
  CITY, stationPad, holoPanel, holoTag, instrument, standingFigure, reg,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Pouring to Spec VR — Culinary & Hospitality, Bartending series.
// The rail on a busy set: the standard drink measured against the jigger
// rather than eyeballed, a counted free pour held to the same standard, the
// three classic builds — shaken, stirred, built — each worked the way its
// own method actually calls for, the right glass and garnish for what just
// got built, the pour cost the recipe is supposed to hit, and the round
// logged per customer the way RBS training expects a bartender to be able to
// say how much any one guest has actually had tonight.

const JGRPS_ACCENT = 0xb8862b;

export const SIM_JIGGER_POUR_SPEC = {
  id: "jigger-pour-spec",
  index: "133",
  domain: "Culinary & Hospitality",
  trade: "Bartender — UNITE HERE Local 2",
  category: "Culinary & Hospitality",
  indoor: "bar",
  weather: "clear",
  certification: "California ABC Responsible Beverage Service (RBS) certification and Business and Professions Code §25602 sale to an obviously intoxicated person; the California Retail Food Code for glassware and ware-washing; Cal/OSHA 8 CCR §3203 Injury and Illness Prevention Program; California Labor Code §351 on tips; UNITE HERE Local 2's own standard for a drink built to spec rather than by feel",
  name: "Pouring to Spec",
  title: simTitle("Pouring to Spec"),
  tagline: "The standard drink measured to the jigger, a counted free pour held steady, shaken, stirred and built each worked to its own method, garnish and glass to spec, pour cost checked, and the round logged per customer",
  accent: JGRPS_ACCENT,
  accentCss: "#b8862b",
  parSeconds: 280,
  footprint: 2.4,
  badge: { id: "rail-on-spec", name: "Rail On Spec", note: "Every build measured, every glass and garnish right, and the round logged clean" },

  game: system({
    name: "Rail Standard",
    currency: "POUR",
    ranks: ["Barback", "Bartender", "Shift Lead", "Bar Manager", "RBS Certified Trainer"],
    badges: [
      { id: "jigger-true", name: "Jigger True", note: "The jigger pour landed inside the calibrated band", test: AWARD.stepClean("jigger-pour") },
      { id: "never-overserved", name: "Never Overserved", note: "No unsafe action anywhere in the run", test: AWARD.safe },
      { id: "three-builds-clean", name: "Three Builds Clean", note: "Shaken, stirred and built all completed without a correction", test: AWARD.all(AWARD.stepClean("seal-shaker"), AWARD.stepClean("stir-build"), AWARD.stepClean("built-drink")) },
    ],
    challenges: [
      { id: "clean-rail", name: "Clean Rail", note: "No corrections anywhere in the run", test: AWARD.clean },
      { id: "steady-stir", name: "Steady Stir", note: "Held the stir in band the whole way", test: AWARD.unbroken },
      { id: "rail-fast", name: "Rail Fast", note: "Complete inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "cracked-glass": "That rocks glass has a chip out of the rim. A chipped glass is a cut waiting to happen on a guest's own lip, and the Retail Food Code's ware-washing standard exists to keep NSF-listed glassware in service only while it is actually sound — a cut that draws blood behind the bar is also the moment OSHA's bloodborne pathogens standard, 29 CFR 1910.1030, governs the clean-up, so a chip takes a glass out of rotation the moment it's noticed, not after.",
    "used-jigger-no-rinse": "You measured this pour in a jigger that just came off a different spirit with no rinse in between. Flavour carries between pours the same way bacteria does — a jigger that goes straight from one bottle to another is quietly changing the taste of every drink it touches after the first one.",
    "free-pour-no-count": "That pour went in with no count and no jigger — just guessing. An unmeasured pour is either giving product away or overpouring the drink, and either way it means the bar's own pour cost and the guest's own drink count both stopped being numbers anyone can trust.",
    "reach-across-guest": "You reached the shaker tin straight across a seated guest instead of going around. A hand full of ice and spirit passing over someone's head or drink is an ordinary bar layout problem with a genuinely bad worst case, and Cal/OSHA's Injury and Illness Prevention Program under 8 CCR §3203 treats an avoidable reach like this as exactly the kind of routine hazard a safe work practice is supposed to rule out.",
  },

  lateNotes: {
    "strainer": "Nothing to strain until the shaker's actually been sealed and shaken.",
    "garnish-correct": "Pick the glass and finish the build before the garnish goes anywhere near it.",
  },

  steps: [
    {
      id: "know-the-standard", kind: "select", target: "standard-card",
      title: "Know the standard drink",
      cue: "Check the reference card: 1.5 oz spirits, 5 oz wine, 12 oz beer at roughly 5% ABV.",
      why: "Every pour on this rail is measured against the same standard-drink reference, and it is what the RBS course's whole idea of 'how many drinks has this table had' is actually built on — a bartender who does not know the standard cannot judge a round against it.",
    },
    {
      id: "jigger-pour", kind: "gauge", target: "jigger",
      title: "Pour the spirit to the jigger's line",
      cue: "Fill the jigger and commit once it reads inside the 1.5 oz band.",
      why: "A jigger measures the pour instead of trusting the hand holding the bottle, and 1.5 oz is not a rounded-off guess — it is the actual standard-drink figure the ABC's own RBS training and the bar's pour cost are both built around, so a jigger pour that misses the line is wrong in both directions at once.",
      gauge: { label: "SPIRIT OZ", speed: 0.72, green: [0.44, 0.6], readout: (t) => `${(1.0 + t * 1.0).toFixed(2)} oz`, missNote: "Off the standard pour. Reset the jigger and pour again — a drink built on a bad measurement is off spec before the shaker even opens." },
    },
    {
      id: "free-pour-count", kind: "hold", target: "speed-pourer", seconds: 4,
      title: "Hold a counted free pour",
      cue: "Hold the pour through a steady four-count, no faster and no slower.",
      why: "A counted free pour is only as good as the count itself — a speed pourer held for a practised, steady four-count delivers the same 1.5 oz the jigger just proved, which is the entire reason a bar trusts a fast bartender's free pour on a busy rail instead of jiggering every single one.",
      holdBreakNote: "Broke the count early. A four-count that turns into a three-count is a short pour on every drink built this way for the rest of the shift until it's corrected.",
    },
    {
      id: "glass-selection", kind: "select", target: "glass-rocks",
      title: "Pick the right glass",
      cue: "This build calls for a rocks glass — not the coupe, not the pint.",
      why: "The glass is part of the recipe, not just presentation — the wrong glass either short-pours the drink to fill it properly or leaves it swimming in ice with nowhere for the spirit to actually sit, and a guest can tell the difference on the first sip either way.",
    },
    {
      id: "seal-shaker", kind: "turn", target: "shaker-tin",
      title: "Seal the shaker tins",
      cue: "Twist-lock the tins together before the shake, not after.",
      why: "A shaker that isn't fully seated will pop apart under the pressure of the shake itself, and that is spirit, ice and citrus across the bar top and the floor behind it — the twist-lock is checked by feel before a single shake, not assumed from how it looked going together.",
      turn: { turns: 1, axis: "y", label: "SHAKER SEAL" },
    },
    {
      id: "strain", kind: "turn", target: "strainer",
      title: "Seat the strainer",
      cue: "Twist the hawthorne strainer fully onto the shaking tin before pouring out.",
      why: "A strainer that isn't seated square lets ice chips and citrus pulp through into the glass, which is the difference between a clean shaken drink and one that reads like it was made in a hurry — it gets seated and checked the same way the shaker itself was.",
      turn: { turns: 1, axis: "y", label: "STRAINER SEAT" },
    },
    {
      id: "stir-build", kind: "track", target: "bar-spoon", seconds: 6,
      title: "Stir the spirit-forward build",
      cue: "Hold a steady stir speed — too fast overdilutes, too slow never chills or opens the drink at all.",
      why: "A stirred drink is chilled and diluted by exactly the amount a steady, practised stir speed delivers over the right count — stirring too hard melts more ice than the recipe wants, and barely moving the spoon leaves the drink warm and undiluted, which reads as a mistake to anyone who has had the same drink made right.",
      track: {
        start: 0.1, green: [0.42, 0.6], rise: 0.5, fall: 0.4, drift: 0.1, label: "STIR SPEED",
        readout: (v) => (v < 0.42 ? "too slow — underdiluted" : v > 0.6 ? "too fast — overdiluted" : "on spec"),
      },
      holdBreakNote: "The stir speed broke out of band. Bring it back to a steady rate and hold it — a stir that drifts is a drink that's either warm or watered down.",
    },
    {
      id: "built-drink", kind: "sequence",
      targets: ["built-ice", "built-spirit", "built-top"],
      itemNames: { "built-ice": "ice in the glass", "built-spirit": "spirit measured in", "built-top": "topped and stirred once" },
      title: "Build the third drink directly in the glass",
      cue: "Ice first, then the measured spirit, then the top — in that order.",
      why: "A built drink is made in the glass it's served in, and the order is the method: ice first so the spirit chills as it goes in rather than after, spirit measured the same as any other pour, and the top poured last so it doesn't get diluted sitting on warm ice before the spirit ever arrives.",
      outOfOrderNote: "Ice, then spirit, then the top — pouring the top before the spirit just dilutes a drink that was never actually built yet.",
    },
    {
      id: "garnish-select", kind: "select", target: "garnish-correct",
      title: "Choose the right garnish",
      cue: "This build takes the citrus twist, not the olive and not the cherry.",
      why: "A garnish is part of the drink's own aromatics, not decoration added at the end — the wrong one changes what the guest smells with every sip, which is the same as changing the recipe without telling them.",
    },
    {
      id: "pour-cost-check", kind: "select", target: "cost-card",
      title: "Check the pour cost",
      cue: "Confirm this build's ingredients against the recipe's costed pour.",
      why: "The pour-cost card is what a jigger pour and a costed recipe are both in service of — a bar that doesn't check its builds against it eventually finds out the hard way, at the end of a month with no idea which drink on the menu was quietly losing money on every pour.",
    },
    {
      id: "log-drink-count", kind: "select", target: "drink-log",
      title: "Log the round for the table",
      cue: "Enter this round against the table's running count on the tablet.",
      why: "RBS training expects a bartender to be able to say how many drinks any one guest has had tonight, and that answer only exists if every round gets logged against the table as it's served — reconstructing it from memory at the point someone looks obviously intoxicated is already too late under Business and Professions Code §25602.",
    },
    {
      id: "spot-the-mismeasure", kind: "find", noHint: true,
      targets: ["overfilled-glass", "wrong-garnish-on-rail"],
      itemNames: { "overfilled-glass": "an overfilled glass", "wrong-garnish-on-rail": "a drink with the wrong garnish" },
      itemNotes: {
        "overfilled-glass": "Filled right to the rim with no room for the ice to be swirled without spilling — somebody free-poured this one without counting.",
        "wrong-garnish-on-rail": "An olive sitting in a drink that calls for a twist — the aromatics on this one are wrong before it even reaches the table.",
      },
      title: "Walk the rail before it goes out",
      cue: "Two finished drinks on the rail aren't right — find them before they leave the bar.",
      why: "The rail is the last place a build can be caught before it's in a guest's hand, and a quick look across everything waiting to go out catches the drink that was fine right up until the very last, unmeasured step.",
    },
  ],

  interrupts: [
    {
      id: "double-for-a-friend",
      kind: "Customer ordering for a friend already three drinks in",
      after: "free-pour-count", delay: 2, seconds: 12,
      alert: "A customer asks for 'a double, make it a strong one' — for a friend at the end of the bar who's already on their third drink tonight.",
      cue: "Check the tab before you pour anything.",
      target: "check-the-tab",
      why: "A third party ordering a stronger drink for someone else is exactly the pattern Business and Professions Code §25602 is written around — the tab already shows three drinks logged, and a double poured on top of that is the bartender's own liability the moment it's served, not the friend's.",
      missNote: "The double got poured before anyone checked the tab. Three drinks became five in one order, and the log that was supposed to catch this never got looked at.",
      wrongNote: "Check the tab. Three drinks are already logged against that guest — look before you pour, not after.",
    },
    {
      id: "ice-well-runs-dry",
      kind: "Ice well runs dry mid-build",
      after: "stir-build", delay: 3, seconds: 11,
      alert: "The ice well next to you runs dry mid-build, and a barback reaches for a rocks glass to scoop more from the bin behind you.",
      cue: "Stop them — hand off the proper scoop, not the glass.",
      target: "proper-scoop",
      why: "A glass scooping ice can chip against the well's edge with nobody noticing until the chip is already mixed into a full bin — the fix is putting the actual scoop in the barback's hand before the glass ever touches the ice, mid-build or not.",
      missNote: "The barback scooped with the glass anyway. Whatever chipped off it is now somewhere in the well, mixed into ice that's about to go into someone's drink.",
      wrongNote: "It's the scoop. That's what belongs in their hand, not the glass.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.4, JGRPS_ACCENT);

    const RAIL_Z = -3.0;

    const workCounter = counter(g, 8.4, 0.6, 0, RAIL_Z, 0x3a4148, { height: 0.9, ry: 0 });
    void workCounter;

    // Standard-drink reference card.
    const card = holoPanel(g, 0.9, 0.6, -3.8, 2.0, -4.18, (cx, w, h) => {
      cx.fillStyle = "rgba(14,10,4,0.92)"; cx.fillRect(0, 0, w, h);
      cx.fillStyle = "#b8862b"; cx.fillRect(0, 0, w, 6);
      cx.fillStyle = "#f4e6c8";
      cx.font = `600 ${Math.round(h * 0.1)}px 'Barlow Condensed', Arial, sans-serif`;
      cx.textAlign = "left"; cx.textBaseline = "middle";
      cx.fillText("THE STANDARD DRINK", w * 0.06, h * 0.18);
      cx.font = `${Math.round(h * 0.08)}px Arial, sans-serif`;
      cx.fillStyle = "#e2d0a0";
      ["1.5 oz spirits", "5 oz wine", "12 oz beer at ~5% ABV"].forEach((l, i) => cx.fillText(l, w * 0.06, h * (0.4 + i * 0.16)));
    }, { ry: 0, accent: JGRPS_ACCENT });
    reg(hits, card, "standard-card");

    // Jigger and speed pourer.
    const jiggerUnit = group(g, -3.0, 0, RAIL_Z);
    box(jiggerUnit, 0.7, 0.9, 0.5, 0, 0.45, 0, 0x4a5560, { rough: 0.5, metal: 0.3 });
    const jigger = instrument(jiggerUnit, 0, 0.95, 0, { ry: 0, idle: "-- OZ", color: JGRPS_ACCENT, w: 0.12, d: 0.18 });
    reg(hits, jigger, "jigger");
    const bottle1 = cyl(jiggerUnit, 0.05, 0.055, 0.32, -0.2, 1.12, 0, 0x7a3a2c, { rough: 0.25, metal: 0.1, seg: 12 });
    const bottle2 = cyl(jiggerUnit, 0.045, 0.05, 0.3, -0.32, 1.1, 0.06, 0x5a4a7a, { rough: 0.25, metal: 0.1, seg: 12 });
    const bottle3 = cyl(jiggerUnit, 0.045, 0.05, 0.28, -0.32, 1.09, -0.06, 0x9a8a5a, { rough: 0.25, metal: 0.1, seg: 12 });
    void bottle2; void bottle3;
    void bottle1;
    const pourer = group(jiggerUnit, 0.24, 1.1, 0);
    cyl(pourer, 0.045, 0.05, 0.3, 0, 0, 0, 0x2c5a3a, { rough: 0.25, metal: 0.1, seg: 12 });
    cyl(pourer, 0.012, 0.012, 0.06, 0, 0.18, 0, CITY.steel, { rough: 0.3, metal: 0.8, seg: 8 });
    reg(hits, pourer, "speed-pourer");

    // Glassware shelf.
    const glassUnit = group(g, -1.9, 0, RAIL_Z);
    slab(glassUnit, 0.9, 0.03, 0.4, 0, 0.85, 0, 0xdfd2b0, { rough: 0.6 });
    const glassRocks = cyl(glassUnit, 0.05, 0.045, 0.09, -0.25, 0.93, 0, 0xcfe6ea, { rough: 0.15, transparent: true, opacity: 0.5, seg: 14 });
    reg(hits, glassRocks, "glass-rocks");
    const glassCoupe = cyl(glassUnit, 0.06, 0.02, 0.08, 0, 0.93, 0, 0xcfe6ea, { rough: 0.15, transparent: true, opacity: 0.5, seg: 14 });
    void glassCoupe;
    const glassPint = cyl(glassUnit, 0.045, 0.04, 0.14, 0.25, 0.98, 0, 0xcfe6ea, { rough: 0.15, transparent: true, opacity: 0.4, seg: 14 });
    void glassPint;
    const crackedGlass = cyl(glassUnit, 0.05, 0.045, 0.09, -0.4, 0.93, 0.12, 0xcfe6ea, { rough: 0.15, transparent: true, opacity: 0.5, seg: 14 });
    holoTag(glassUnit, "chip on the rim?", -0.4, 1.05, 0.12, { css: "#f0645b", w: 0.34 });
    reg(hits, crackedGlass, "cracked-glass");
    const dirtyJigger = box(glassUnit, 0.05, 0.07, 0.05, 0.42, 0.9, 0.1, 0x8f979e, { rough: 0.6 });
    holoTag(glassUnit, "rinsed between spirits?", 0.42, 1.02, 0.1, { css: "#f0645b", w: 0.4 });
    reg(hits, dirtyJigger, "used-jigger-no-rinse");
    // A backup stack of rocks glasses under the shelf.
    for (let i = 0; i < 6; i++) {
      cyl(glassUnit, 0.05, 0.045, 0.09, -0.35 + (i % 3) * 0.09, 0.5 + Math.floor(i / 3) * 0.1, -0.14, 0xcfe6ea,
        { rough: 0.15, transparent: true, opacity: 0.4, seg: 12 });
    }

    // Shaker and strainer.
    const shakeUnit = group(g, -0.7, 0, RAIL_Z);
    const tinLower = cyl(shakeUnit, 0.06, 0.065, 0.14, 0, 0.97, 0, CITY.steel, { rough: 0.3, metal: 0.85, seg: 16 });
    void tinLower;
    const tinUpper = cyl(shakeUnit, 0.05, 0.06, 0.1, 0, 1.09, 0, CITY.steel, { rough: 0.3, metal: 0.85, seg: 16 });
    reg(hits, tinUpper, "shaker-tin");
    const strainerTop = torus(shakeUnit, 0.05, 0.01, 0, 1.16, 0, CITY.steel, { rough: 0.3, metal: 0.85, seg: 8, seg2: 18 });
    strainerTop.rotation.x = Math.PI / 2;
    reg(hits, strainerTop, "strainer");
    const noCountPour = cyl(shakeUnit, 0.045, 0.05, 0.09, 0.3, 0.93, 0.1, 0xcfe6ea, { rough: 0.15, transparent: true, opacity: 0.5, seg: 14 });
    holoTag(shakeUnit, "poured with no count?", 0.3, 1.02, 0.1, { css: "#f0645b", w: 0.4 });
    reg(hits, noCountPour, "free-pour-no-count");

    // Mixing glass and bar spoon for the stir.
    const stirUnit = group(g, 0.5, 0, RAIL_Z);
    cyl(stirUnit, 0.055, 0.06, 0.16, 0, 0.98, 0, 0xcfe6ea, { rough: 0.15, transparent: true, opacity: 0.45, seg: 16 });
    const spoon = group(stirUnit, 0, 1.1, 0);
    cyl(spoon, 0.006, 0.006, 0.24, 0, 0, 0, CITY.steel, { rough: 0.25, metal: 0.85, seg: 8 });
    reg(hits, spoon, "bar-spoon");

    // Built-in-glass station.
    const builtUnit = group(g, 1.7, 0, RAIL_Z);
    const builtGlass = cyl(builtUnit, 0.05, 0.048, 0.13, 0, 0.96, 0, 0xcfe6ea, { rough: 0.15, transparent: true, opacity: 0.4, seg: 14 });
    void builtGlass;
    const builtIceHit = box(builtUnit, 0.08, 0.06, 0.08, 0, 0.94, 0, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, builtIceHit, "built-ice");
    const builtSpiritHit = box(builtUnit, 0.08, 0.06, 0.08, -0.15, 0.94, 0, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, builtSpiritHit, "built-spirit");
    const builtTopHit = box(builtUnit, 0.08, 0.06, 0.08, 0.15, 0.94, 0, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, builtTopHit, "built-top");

    // Garnish tray.
    const garnUnit = group(g, 2.6, 0, RAIL_Z);
    slab(garnUnit, 0.5, 0.03, 0.3, 0, 0.9, 0, 0xdfd2b0, { rough: 0.6 });
    const twist = group(garnUnit, -0.12, 0.94, 0);
    torus(twist, 0.025, 0.006, 0, 0, 0, 0xf2a23b, { rough: 0.5, seg: 6, seg2: 14 });
    reg(hits, twist, "garnish-correct");
    const olive = ball(garnUnit, 0.02, 0.05, 0.94, 0, 0x5a6a3a, { rough: 0.5, seg: 10 });
    void olive;
    const cherry = ball(garnUnit, 0.02, 0.15, 0.94, 0, 0xb3261e, { rough: 0.4, seg: 10 });
    void cherry;

    // Pour-cost card and drink log.
    const costCard = holoPanel(g, 0.7, 0.5, 3.4, 1.9, RAIL_Z - 0.2, (cx, w, h) => {
      cx.fillStyle = "rgba(14,10,4,0.9)"; cx.fillRect(0, 0, w, h);
      cx.fillStyle = "#f4e6c8";
      cx.font = `600 ${Math.round(h * 0.12)}px 'Barlow Condensed', Arial, sans-serif`;
      cx.textAlign = "center"; cx.textBaseline = "middle";
      cx.fillText("POUR COST", w / 2, h * 0.2);
      cx.font = `${Math.round(h * 0.09)}px Arial, sans-serif`;
      cx.fillText("1.5 oz spirit · recipe cost checked", w / 2, h * 0.55);
    }, { ry: -0.3, accent: JGRPS_ACCENT });
    reg(hits, costCard, "cost-card");

    const tablet = group(g, 3.9, 0, RAIL_Z + 0.2);
    box(tablet, 0.3, 0.2, 0.02, 0, 1.0, 0, 0x2b3138, { rough: 0.4 });
    const tabletScreen = decal(tablet, 0.26, 0.16, 0, 1.0, 0.011, signFace("TAB: 0", { bg: "#0d1c24", accent: "#4fb8c9", fg: "#bfeaf7", scale: 0.5 }), { glow: true, ei: 0.7 });
    reg(hits, tablet, "drink-log");

    // The tab-check target for the "double for a friend" interrupt.
    const tabCheck = box(g, 0.3, 0.2, 0.02, 3.9, 1.0, RAIL_Z + 0.55, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "check the tab", 3.9, 1.15, RAIL_Z + 0.55, { css: "#b8862b", w: 0.3 });
    reg(hits, tabCheck, "check-the-tab");

    // Scoop hook near the ice well, only ever the interrupt's target here.
    const scoopHook = group(g, -3.7, 0, RAIL_Z - 0.3);
    box(scoopHook, 0.03, 0.14, 0.03, 0, 0.7, 0, CITY.steel, { rough: 0.35, metal: 0.8 });
    ball(scoopHook, 0.018, 0, 0.62, 0.02, CITY.steel, { rough: 0.3, metal: 0.8, seg: 8 });
    holoTag(scoopHook, "proper scoop", 0, 0.85, 0, { css: "#b8862b", w: 0.28 });
    reg(hits, scoopHook, "proper-scoop");

    // Reach-across-guest hazard: a shaker path that crosses straight over a seated guest.
    const reachHit = box(g, 0.3, 0.3, 0.3, -0.7, 1.1, RAIL_Z + 1.3, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "reach straight across?", -0.7, 1.3, RAIL_Z + 1.3, { css: "#f0645b", w: 0.4 });
    reg(hits, reachHit, "reach-across-guest");

    // Rail: finished drinks waiting to go out, two of which are wrong.
    const railGroup = group(g, 1.2, 0, RAIL_Z + 0.55);
    const overfilled = cyl(railGroup, 0.05, 0.045, 0.12, -0.3, 0.94, 0, 0xcfe6ea, { rough: 0.15, transparent: true, opacity: 0.7, seg: 14 });
    holoTag(railGroup, "filled to the rim", -0.3, 1.05, 0, { css: "#f0645b", w: 0.32 });
    reg(hits, overfilled, "overfilled-glass");
    const wrongGarnishDrink = group(railGroup, 0.1, 0, 0);
    cyl(wrongGarnishDrink, 0.05, 0.045, 0.1, 0, 0.94, 0, 0xcfe6ea, { rough: 0.15, transparent: true, opacity: 0.5, seg: 14 });
    ball(wrongGarnishDrink, 0.018, 0, 1.0, 0.03, 0x5a6a3a, { rough: 0.5, seg: 10 });
    holoTag(wrongGarnishDrink, "wrong garnish", 0, 1.1, 0, { css: "#f0645b", w: 0.3 });
    reg(hits, wrongGarnishDrink, "wrong-garnish-on-rail");
    const goodDrink = cyl(railGroup, 0.05, 0.045, 0.1, 0.5, 0.94, 0, 0xcfe6ea, { rough: 0.15, transparent: true, opacity: 0.5, seg: 14 });
    void goodDrink;

    // ---------------------------------------------------------------- people
    const orderingCust = standingFigure(g, -1.0, RAIL_Z + 0.9, { ry: Math.PI, cloth: 0x5a4a7a });
    const orderingHead = orderingCust.userData.head;

    const friendThreeDrinks = standingFigure(g, 2.45, RAIL_Z + 1.65, { ry: Math.PI + 0.2, cloth: 0x7a3a2c, atStation: true });
    for (let i = 0; i < 3; i++) {
      cyl(g, 0.03, 0.035, 0.08, 2.25 + i * 0.12, 0.95, RAIL_Z + 1.4, 0xcfe6ea, { rough: 0.2, transparent: true, opacity: 0.5, seg: 10 });
    }
    void friendThreeDrinks;

    const waitingCust = standingFigure(g, 2.0, RAIL_Z + 1.0, { ry: Math.PI - 0.2, cloth: 0x2c5a3a });
    void waitingCust;

    const barback = standingFigure(g, -3.3, RAIL_Z - 0.55, { ry: -0.6, cloth: 0x3a4148, vest: 0xb8862b });
    const barbackBody = barback.userData.body, barbackHead = barback.userData.head;
    const barbackGlass = cyl(barbackBody, 0.03, 0.035, 0.08, -0.2, 1.1, 0.14, 0xcfe6ea, { rough: 0.2, transparent: true, opacity: 0.6, seg: 12 });
    barbackGlass.visible = false;
    const barbackScoop = cyl(barbackBody, 0.02, 0.03, 0.1, -0.2, 1.1, 0.14, 0xdfe4e8, { rough: 0.4, metal: 0.5, seg: 10 });
    barbackScoop.visible = false;

    return {
      hits,
      footprint: 2.4,
      spawnLook: new THREE.Vector3(0, 1.1, RAIL_Z),

      onStepComplete(step) {
        if (step.id === "jigger-pour") repaint(jigger.userData.screen, signFace("1.50 OZ", { bg: "#161c22", accent: "#59c97b", scale: 0.5 }));
        if (step.id === "seal-shaker") { tinUpper.position.y = 1.09; }
        if (step.id === "log-drink-count") repaint(tabletScreen, signFace("TAB: 1", { bg: "#0d1c24", accent: "#4fb8c9", fg: "#bfeaf7", scale: 0.5 }));
        if (step.id === "spot-the-mismeasure") { overfilled.visible = false; wrongGarnishDrink.visible = false; }
      },

      onInterrupt(it) {
        if (it.id === "double-for-a-friend") { orderingCust.position.z -= 0.3; }
        if (it.id === "ice-well-runs-dry") { barbackGlass.visible = true; barbackBody.rotation.z = -0.25; }
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "double-for-a-friend") { orderingCust.position.z += 0.3; }
        if (it.id === "ice-well-runs-dry") { barbackGlass.visible = false; barbackScoop.visible = true; barbackBody.rotation.z = 0; }
      },

      animate(t, dt, session) {
        orderingHead.rotation.y = Math.sin(t * 0.5) * 0.12;
        barbackHead.rotation.y = -0.3 + Math.sin(t * 0.6) * 0.1;
        const gg = session?.gauge;
        if (gg && !gg.committed && session.step?.id === "jigger-pour") {
          repaint(jigger.userData.screen, signFace(`${(1.0 + gg.t * 1.0).toFixed(2)} OZ`, {
            bg: "#161c22", accent: gg.t >= 0.44 && gg.t <= 0.6 ? "#59c97b" : "#f2c14b", scale: 0.55,
          }));
        }
      },
    };
  },
};
