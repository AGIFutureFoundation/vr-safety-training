import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, ball, slab, group, decal, repaint, signFace, particles, counter,
} from "../../../shared/kit.js";
import {
  CITY, stationPad, holoPanel, holoTag, instrument, standingFigure, reg,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Opening the Well VR — Culinary & Hospitality, Bartending series.
// The half hour before the doors open, worked the way UNITE HERE Local 2
// teaches it: the sanitiser bucket mixed to strength before a rag ever
// touches a glass, the ice well burned out and refilled with a scoop that
// never sees a hand or a glass, garnish cut and dated under gloves, the glass
// washer proven before the first pint goes through it, the well bottles
// pour-tested against the jigger they are supposed to match, the float
// counted before the drawer opens, and the licence on the wall that makes
// all of it legally somebody's job.

const BARWS_ACCENT = 0xb8862b;

export const SIM_BAR_WELL_SETUP = {
  id: "bar-well-setup",
  index: "131",
  domain: "Culinary & Hospitality",
  trade: "Bartender — UNITE HERE Local 2",
  category: "Culinary & Hospitality",
  indoor: "bar",
  weather: "clear",
  certification: "California ABC Responsible Beverage Service (RBS) certification; the California Retail Food Code for ice, glassware, sanitiser and hand-washing; Cal/OSHA 8 CCR §3203 Injury and Illness Prevention Program and §5194 hazard communication for the sanitiser chemical; UNITE HERE Local 2's own opening-shift practice; the county Environmental Health department as the inspecting authority",
  name: "Opening the Well",
  title: simTitle("Opening the Well"),
  tagline: "Sanitiser mixed to strength, the ice well burned and refilled with a scoop, garnish gloved and dated, the glass washer proven, the well pour-tested and the float counted before the doors open",
  accent: BARWS_ACCENT,
  accentCss: "#b8862b",
  parSeconds: 260,
  footprint: 2.4,
  badge: { id: "well-opened-clean", name: "Well Opened Clean", note: "Every opening check passed to spec before the first guest was let in" },

  game: system({
    name: "Bar Opening Crew",
    currency: "POUR",
    ranks: ["Barback", "Bartender", "Shift Lead", "Bar Manager", "RBS Certified Trainer"],
    badges: [
      { id: "scoop-not-glass", name: "Scoop, Not Glass", note: "Nobody touched the ice with a glass on this shift", test: AWARD.stepClean("ice-refill") },
      { id: "never-uncovered", name: "Never Uncovered", note: "No unsafe action anywhere in the run", test: AWARD.safe },
      { id: "pour-true", name: "Pour True", note: "The well pour-test landed inside the calibrated band", test: AWARD.precise(0.7) },
    ],
    challenges: [
      { id: "clean-open", name: "Clean Open", note: "No corrections anywhere in the run", test: AWARD.clean },
      { id: "steady-pour", name: "Steady Pour", note: "Held the pour-test rate in band the whole way", test: AWARD.unbroken },
      { id: "doors-on-time", name: "Doors On Time", note: "Complete inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "photo-menu-on-phone": "You left a phone propped against the till showing the cocktail menu instead of using the printed one behind the bar. A phone screen face-down in a wet well is a cracked screen and a distraction during a headcount, not a menu — the printed one lives back here for exactly that reason.",
    "wet-floor-no-sign": "Ice melt is pooling by the well with no wet-floor sign out. A bar floor is wet by the nature of the job; the sign is what turns a normal shift hazard into a marked one, and Cal/OSHA's Injury and Illness Prevention Program under 8 CCR §3203 expects exactly this kind of routine hazard controlled before it is stepped in.",
    "sanitiser-unlabeled": "That spray bottle has sanitiser in it with no label on it. Cal/OSHA hazard communication under 8 CCR §5194, built on the same federal OSHA standard at 29 CFR 1910.1200, requires a secondary container to say what is actually inside it — the next person to reach for it, mid-rush, is trusting a bottle that could be anything.",
    "cash-drawer-open-unattended": "The till drawer is sitting open with nobody at it. An unattended open drawer during setup is a loss-prevention problem before the shift has even started, and it is the float count itself — done once, counted, and closed — that is supposed to be the only time it is open before service.",
  },

  lateNotes: {
    "ice-bag": "There's nothing to refill yet — the well gets burned out and drained first.",
    "well-bottles-track": "Nothing to pour-test until the glass washer's own check is done and the well bottles are actually racked.",
    "till-float": "Count the float once the well itself is set — a drawer counted before the bar is ready just gets opened and closed again.",
  },

  steps: [
    {
      id: "licence-post", kind: "select", target: "licence-board",
      title: "Confirm the ABC licence and RBS certificates are posted",
      cue: "Check the wall board: the ABC licence current, and every RBS certificate on file for tonight's crew.",
      why: "California has required RBS certification for anyone serving alcohol since 2022, and the ABC licence is what makes the whole night's service legal in the first place — both are checked posted and current before anything else, because an inspector or the county Environmental Health department can ask for either at any time.",
    },
    {
      id: "sanitiser-mix", kind: "gauge", target: "sanitiser-tester",
      title: "Mix the sanitiser bucket to CalCode strength",
      cue: "Dip the test strip and read it against the colour card — commit once it lands in the required band.",
      why: "The California Retail Food Code sets a working-strength range for the quaternary sanitiser every bar rag and glass gets wrung through all night — too weak and it does nothing, too strong and it is its own hazard under Cal/OSHA hazard communication rules, so the bucket is tested rather than guessed at from the bottle's own label.",
      gauge: { label: "SANITISER PPM", speed: 0.7, green: [0.42, 0.62], readout: (t) => `${Math.round(200 + t * 400)} ppm`, missNote: "Outside the CalCode working-strength band. Dump it and mix again — a bucket you are not sure of is a bucket that does not sanitise anything." },
    },
    {
      id: "hand-sink-stock", kind: "sequence", anyOrder: true,
      targets: ["sink-soap", "sink-towels", "sink-sign"],
      itemNames: { "sink-soap": "soap stocked", "sink-towels": "paper towels stocked", "sink-sign": "employees-must-wash-hands sign" },
      title: "Stock the hand sink",
      cue: "Soap, paper towels and the posted hand-washing sign — the hand sink is its own station, separate from the well.",
      why: "The California Retail Food Code requires a dedicated hand sink stocked and posted before service, kept apart from the ice and glassware — a bartender who cannot wash their hands at an actual hand sink ends up doing it in the same basin the ice scoop sits next to, which is the exact cross-contamination the separate sink exists to prevent.",
    },
    {
      id: "ice-well-burnout", kind: "hold", target: "burnout-nozzle", seconds: 5,
      title: "Burn out the ice well",
      cue: "Hold the hot-water flush on the empty well until it runs clean.",
      why: "Yesterday's melt and whatever settled to the bottom of the well overnight get flushed out with hot water before any new ice goes in — the Retail Food Code treats an ice bin the same as any other food-contact surface, and an NSF-certified well is only as clean as the last time somebody actually flushed it rather than just refilling on top of what was already there.",
      holdBreakNote: "Released before it ran clean. A short flush leaves the same residue at the bottom that a full one is meant to clear — hold it the full duration.",
    },
    {
      id: "ice-refill", kind: "drag", target: "ice-bag",
      title: "Refill the well with the scoop — never a glass",
      cue: "Carry the fresh ice bag to the well and empty it in.",
      why: "A scoop is a dedicated food-contact tool that never touches a customer's hand or mouth; a glass has been in both, and a cracked one left in the ice is a shard nobody sees until it is in somebody's drink. The Retail Food Code's rule against scooping ice with a glass exists for exactly that failure mode.",
      drag: { to: "ice-well-socket", radius: 0.45, missNote: "Not over the well — the bag has to actually empty into the bin, not beside it." },
    },
    {
      id: "scoop-hook", kind: "select", target: "scoop-hook",
      title: "Hang the scoop on its own hook",
      cue: "The scoop goes back on its dedicated hook outside the well, not left sitting in the ice.",
      why: "A scoop left buried in the ice gets grabbed by the handle end covered in melt and hands, which defeats the entire point of using a scoop instead of a glass — the hook keeps it out of the ice and off the bar top between uses, where it stays a clean tool instead of another surface the ice sits against.",
    },
    {
      id: "garnish-gloves", kind: "select", target: "garnish-gloves",
      title: "Glove up before touching the garnish",
      cue: "Gloves on before the citrus or the tray.",
      why: "Ready-to-eat garnish that goes straight into a drink with no cooking step in between is exactly the category the Retail Food Code's bare-hand-contact rule covers — gloves go on before the knife, not after the first wedge is already cut.",
    },
    {
      id: "garnish-prep", kind: "sequence",
      targets: ["citrus-cut", "tray-filled", "date-label"],
      itemNames: { "citrus-cut": "citrus cut", "tray-filled": "tray inserts filled", "date-label": "tray dated" },
      title: "Cut, fill and date the garnish",
      cue: "Cut the citrus, fill the tray inserts, then label the tray with today's date — in that order.",
      why: "A garnish tray dated at the start of shift is how anyone opening tomorrow's shift knows whether what's left is still good, and cutting before filling before dating is the only order that does not mean re-touching product after it is already labelled done.",
      outOfOrderNote: "Cut, then filled, then dated — dating an empty tray or one that is only half filled just makes the label wrong.",
    },
    {
      id: "glass-washer-check", kind: "gauge", target: "glass-washer-gauge",
      title: "Check the glass washer's temperature and chemical",
      cue: "Run a cycle and read the final rinse gauge — commit once it lands in the sanitising band.",
      why: "The Retail Food Code sets the standard a glass washer's sanitising rinse has to hit, by heat or by chemical, and an NSF-listed machine only meets that standard while it's actually running to spec — checking it cold at the start of shift is the only way to know every glass tonight is coming out sanitised rather than just rinsed and shiny.",
      gauge: { label: "RINSE °F", speed: 0.75, green: [0.46, 0.64], readout: (t) => `${Math.round(120 + t * 90)} °F`, missNote: "Outside the sanitising band. A machine that only looks like it's working is worse than one that's visibly broken — run it again and confirm the reading before a single glass goes through it." },
    },
    {
      id: "well-bottles-pour-test", kind: "track", target: "well-bottles-track", seconds: 6,
      title: "Pour-test the well bottles",
      cue: "Hold a steady, counted speed-pour into the test jigger — too fast overpours, too slow underpours.",
      why: "Every well bottle gets a new speed pourer at the start of shift, and a pourer poured too fast or too slow all night is either giving product away or shorting every drink built from it — pour-testing against the jigger before service is how the whole bar's cost and consistency get set at once instead of drink by drink.",
      track: {
        start: 0.1, green: [0.42, 0.62], rise: 0.55, fall: 0.42, drift: 0.11, label: "POUR RATE",
        readout: (v) => (v < 0.42 ? "underpouring" : v > 0.62 ? "overpouring" : "on spec"),
      },
      holdBreakNote: "The pour rate broke out of band. A pourer that isn't holding a steady rate isn't proven yet — bring it back and hold it.",
    },
    {
      id: "till-float", kind: "select", target: "till-float",
      title: "Count the till float",
      cue: "Count the opening drawer against the float sheet before the first sale.",
      why: "California Labor Code §351 makes clear that whatever is in a tip jar belongs to the staff who earned it, and a float counted and signed for before service is the same discipline applied to the house's own money — an uncounted drawer is a dispute waiting to happen the first time it comes up short at close.",
    },
    {
      id: "pre-open-walk", kind: "find", noHint: true,
      targets: ["unlabeled-garnish", "wet-floor-mark"],
      itemNames: { "unlabeled-garnish": "an undated garnish tray", "wet-floor-mark": "an unmarked wet patch" },
      itemNotes: {
        "unlabeled-garnish": "A second tray sitting out with no date on it at all — nobody prepped it tonight and nobody can say when they did.",
        "wet-floor-mark": "A wet patch by the well with no sign anywhere near it — exactly what the sign is supposed to be standing next to.",
      },
      title: "Walk the bar before the doors open",
      cue: "One more pass along the whole line before the first guest — click anything left wrong.",
      why: "Every step so far was checked once, in isolation; the walk is where a bartender looks at the bar the way a guest is about to see it, and it is the last chance to catch the one thing that got missed between two otherwise-clean checks.",
    },
  ],

  interrupts: [
    {
      id: "barback-scoop-with-glass",
      kind: "Barback reaching for a rocks glass",
      after: "ice-well-burnout", delay: 3, seconds: 11,
      alert: "The barback is reaching for a rocks glass off the rail to scoop the fresh ice into the well.",
      cue: "Stop them — hand them the scoop.",
      target: "scoop-hook",
      why: "A glass scooping ice is a glass that can chip against the bin's edge with nobody noticing, and the chip goes into the ice with the next scoop — the fix is putting the actual scoop in their hand before the glass ever touches the bin, not after.",
      missNote: "The barback scooped the new ice with the glass anyway. A chip off that glass is now somewhere in the well, and there is no way to find it again once it's mixed into a full bin of ice.",
      wrongNote: "It's the scoop on the hook. That's the tool that was supposed to be in their hand.",
    },
    {
      id: "customer-reaches-garnish",
      kind: "Early customer at the rail",
      after: "well-bottles-pour-test", delay: 3, seconds: 11,
      alert: "A customer who came in early is leaning over the bar, reaching for the open garnish tray while you're mid pour-test.",
      cue: "Glove up and take control of the tray before they touch it bare-handed.",
      target: "garnish-gloves",
      why: "The whole reason the garnish rule exists is that it goes straight into a drink with nothing between it and someone's mouth — a stranger's bare hand in that tray is exactly the bare-hand contact the Retail Food Code's rule is built to stop, and it does not wait for you to finish what you were doing.",
      missNote: "The customer got a hand into the tray before anyone stopped them. Every wedge in that tray is now a bare-hand-contact question, and the only honest fix left is to toss the tray and cut a fresh one.",
      wrongNote: "Glove up and take the tray back — that is what stops a bare hand from being the last thing that touched it.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.4, BARWS_ACCENT);

    const WORK_Z = -3.1;

    // ------------------------------------------------------------ under-bar run
    // A run of low units behind the back bar's decorative counter, where the
    // actual opening checks happen: hand sink, sanitiser, ice well, garnish,
    // glass washer and the speed rack, left to right along the workspace.
    const workCounter = counter(g, 8.6, 0.6, 0, WORK_Z, 0x3a4148, { height: 0.9, ry: 0 });
    void workCounter;

    // Licence and RBS board, mounted on the back wall above the run.
    const board = holoPanel(g, 1.0, 0.6, 3.6, 2.15, -4.18, (cx, w, h) => {
      cx.fillStyle = "rgba(14,10,4,0.92)"; cx.fillRect(0, 0, w, h);
      cx.fillStyle = "#b8862b"; cx.fillRect(0, 0, w, 6);
      cx.fillStyle = "#f4e6c8";
      cx.font = `600 ${Math.round(h * 0.1)}px 'Barlow Condensed', Arial, sans-serif`;
      cx.textAlign = "left"; cx.textBaseline = "middle";
      cx.fillText("ABC LICENSE — ON FILE, CURRENT", w * 0.06, h * 0.24);
      cx.fillText("RBS CERTIFICATES — ALL STAFF ON DUTY", w * 0.06, h * 0.42);
      cx.font = `${Math.round(h * 0.075)}px Arial, sans-serif`;
      cx.fillStyle = "#e2d0a0";
      cx.fillText("California ABC · UNITE HERE Local 2", w * 0.06, h * 0.68);
      cx.fillText("Post visibly — county Environmental Health may ask for either", w * 0.06, h * 0.84);
    }, { ry: 0, accent: BARWS_ACCENT });
    reg(hits, board, "licence-board");

    // Hand sink unit.
    const sinkUnit = group(g, -3.9, 0, WORK_Z);
    box(sinkUnit, 0.7, 0.9, 0.5, 0, 0.45, 0, 0x4a5560, { rough: 0.5, metal: 0.3 });
    const basin = box(sinkUnit, 0.5, 0.1, 0.32, 0, 0.9, 0, 0xc7d0d6, { radius: 0.02, rough: 0.3, metal: 0.3 });
    void basin;
    cyl(sinkUnit, 0.012, 0.012, 0.18, 0, 1.02, -0.1, CITY.steel, { rough: 0.3, metal: 0.85, seg: 10 });
    const soap = group(sinkUnit, -0.16, 0.96, 0.1);
    box(soap, 0.06, 0.14, 0.05, 0, 0, 0, 0x4fb8c9, { rough: 0.4 });
    reg(hits, soap, "sink-soap");
    const towels = group(sinkUnit, 0.16, 0.96, 0.1);
    cyl(towels, 0.05, 0.05, 0.16, 0, 0, 0, 0xf4f2ea, { rough: 0.8, seg: 12 });
    reg(hits, towels, "sink-towels");
    const sinkSign = decal(sinkUnit, 0.24, 0.14, 0, 1.28, 0.02,
      signFace("EMPLOYEES MUST WASH HANDS", { bg: "#101820", accent: "#4fb8c9", scale: 0.4 }), { px: 256 });
    reg(hits, sinkSign, "sink-sign");
    holoTag(sinkUnit, "Hand sink", 0, 1.4, 0.15, { css: "#4fb8c9", w: 0.3 });

    // Sanitiser bucket and tester.
    const sanUnit = group(g, -3.0, 0, WORK_Z);
    cyl(sanUnit, 0.16, 0.18, 0.32, 0, 0.16, 0, 0xdfe4e8, { rough: 0.5, seg: 16 });
    const sanTester = instrument(sanUnit, 0.22, 0.35, 0, { ry: -0.3, idle: "-- PPM", color: BARWS_ACCENT, w: 0.1, d: 0.16 });
    holoTag(sanTester, "Sanitiser test strip", 0, 0.15, 0, { css: "#b8862b", w: 0.4 });
    reg(hits, sanTester, "sanitiser-tester");
    const sanBottle = group(g, -2.7, 0, WORK_Z + 0.35);
    box(sanBottle, 0.08, 0.2, 0.06, 0, 0.42, 0, 0x8fa0a8, { rough: 0.4, transparent: true, opacity: 0.6 });
    holoTag(sanBottle, "sanitiser — no label?", 0, 0.56, 0, { css: "#f0645b", w: 0.4 });
    reg(hits, sanBottle, "sanitiser-unlabeled");

    // Ice well: bin, hazard glass, scoop and hook, burnout nozzle, ice bag.
    const iceUnit = group(g, -1.2, 0, WORK_Z);
    box(iceUnit, 0.9, 0.55, 0.55, 0, 0.28, 0, 0xdfe4e8, { rough: 0.4, metal: 0.2 });
    const iceInner = box(iceUnit, 0.76, 0.42, 0.42, 0, 0.32, 0, 0xf0f4f7, { rough: 0.3 });
    void iceInner;
    holoTag(iceUnit, "Ice well", 0, 0.62, 0, { css: "#b8862b", w: 0.26 });
    const iceSocket = box(iceUnit, 0.7, 0.3, 0.36, 0, 0.42, 0, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    hits["ice-well-socket"] = iceSocket;
    const wellGlass = cyl(iceUnit, 0.045, 0.05, 0.1, 0.2, 0.6, 0.05, 0xcfe6ea, { rough: 0.2, transparent: true, opacity: 0.55, seg: 14 });
    reg(hits, wellGlass, "glass-in-well");
    const nozzle = group(iceUnit, -0.3, 0.6, 0);
    cyl(nozzle, 0.018, 0.018, 0.22, 0, 0, 0, CITY.steel, { rough: 0.3, metal: 0.8, seg: 10 });
    ball(nozzle, 0.03, 0, 0.12, 0, 0xdfe4e8, { rough: 0.4, metal: 0.5, seg: 10 });
    reg(hits, nozzle, "burnout-nozzle");
    const steam = particles(nozzle, 12, 0xdfeaf0, { size: 0.02, life: 0.5, additive: false, opacity: 0.5 });
    void steam;
    const hook = group(g, -0.65, 0, WORK_Z - 0.22);
    box(hook, 0.03, 0.14, 0.03, 0, 0.7, 0, CITY.steel, { rough: 0.35, metal: 0.8 });
    ball(hook, 0.018, 0, 0.62, 0.02, CITY.steel, { rough: 0.3, metal: 0.8, seg: 8 });
    reg(hits, hook, "scoop-hook");
    const iceBagHome = group(g, -1.9, 0, WORK_Z - 0.5);
    box(iceBagHome, 0.3, 0.4, 0.2, 0, 0.2, 0, 0xeaf2f6, { rough: 0.7, transparent: true, opacity: 0.75 });
    holoTag(iceBagHome, "Fresh ice", 0, 0.44, 0, { css: "#b8862b", w: 0.22 });
    reg(hits, iceBagHome, "ice-bag");

    // Garnish prep station.
    const garnUnit = group(g, 0.3, 0, WORK_Z);
    slab(garnUnit, 0.6, 0.03, 0.4, 0, 0.9, 0, 0xdfd2b0, { rough: 0.6 });
    const gloves = group(garnUnit, -0.2, 0.93, 0.1);
    box(gloves, 0.14, 0.02, 0.09, 0, 0, 0, 0xf2c14b, { rough: 0.8 });
    reg(hits, gloves, "garnish-gloves");
    const citrus = group(garnUnit, 0, 0.93, -0.05);
    for (let i = 0; i < 3; i++) ball(citrus, 0.035, -0.06 + i * 0.06, 0.02, 0, 0xf2a23b, { rough: 0.6, seg: 10 });
    reg(hits, citrus, "citrus-cut");
    const tray = group(garnUnit, 0.2, 0.93, 0.1);
    box(tray, 0.24, 0.03, 0.14, 0, 0, 0, 0x8f979e, { rough: 0.5, metal: 0.4 });
    for (let i = 0; i < 4; i++) ball(tray, 0.018, -0.08 + i * 0.05, 0.02, 0, [0xf2a23b, 0x59c97b, 0xf0645b, 0xf2c14b][i], { rough: 0.6, seg: 8 });
    reg(hits, tray, "tray-filled");
    const dateSticker = decal(garnUnit, 0.14, 0.06, 0.2, 0.96, 0.18,
      signFace("DATE?", { bg: "#161c22", accent: "#b8862b", scale: 0.5 }), { px: 160 });
    dateSticker.rotation.x = -Math.PI / 2;
    reg(hits, dateSticker, "date-label");
    const secondTray = group(g, 0.75, 0, WORK_Z + 0.42);
    box(secondTray, 0.22, 0.03, 0.13, 0, 0.91, 0, 0x8f979e, { rough: 0.5, metal: 0.4 });
    for (let i = 0; i < 3; i++) ball(secondTray, 0.016, -0.06 + i * 0.05, 0.02, 0, 0xf2a23b, { rough: 0.6, seg: 8 });
    reg(hits, secondTray, "unlabeled-garnish");

    // Glass washer.
    const washUnit = group(g, 1.6, 0, WORK_Z);
    box(washUnit, 0.7, 0.85, 0.55, 0, 0.42, 0, 0x8b929a, { rough: 0.45, metal: 0.4 });
    const washerGauge = instrument(washUnit, 0.2, 0.88, 0, { ry: -0.3, idle: "-- °F", color: BARWS_ACCENT, w: 0.1, d: 0.16 });
    holoTag(washerGauge, "Glass washer rinse", 0, 0.15, 0, { css: "#b8862b", w: 0.4 });
    reg(hits, washerGauge, "glass-washer-gauge");

    // Well bottles / speed rack.
    const rack = group(g, 2.8, 0, WORK_Z);
    box(rack, 0.9, 0.35, 0.28, 0, 0.55, 0, 0x2b3138, { rough: 0.6, metal: 0.3 });
    const tones = [0x7a3a2c, 0x2c5a3a, 0x5a4a7a, 0x9a8a5a];
    for (let i = 0; i < 4; i++) cyl(rack, 0.04, 0.045, 0.3, -0.32 + i * 0.22, 0.85, 0, tones[i], { rough: 0.25, metal: 0.1, seg: 10 });
    const pourTest = instrument(rack, 0, 1.1, 0.15, { ry: 0, idle: "-- OZ", color: BARWS_ACCENT, w: 0.12, d: 0.18 });
    holoTag(pourTest, "Well pour-test jigger", 0, 0.18, 0, { css: "#b8862b", w: 0.42 });
    reg(hits, pourTest, "well-bottles-track");

    // Till.
    const till = group(g, 3.7, 0, WORK_Z + 0.1);
    box(till, 0.4, 0.12, 0.32, 0, 0.96, 0, 0x2b3138, { rough: 0.5 });
    const drawer = box(till, 0.36, 0.08, 0.28, 0, 0.86, 0.18, 0x4a4038, { rough: 0.55 });
    reg(hits, drawer, "till-float");
    const phoneMenu = group(g, 3.4, 0, WORK_Z - 0.28);
    box(phoneMenu, 0.05, 0.1, 0.01, 0, 0.95, 0, 0x1a1e22, { rough: 0.3, emissive: 0x224488, ei: 0.5 });
    holoTag(phoneMenu, "menu on a phone?", 0, 1.06, 0, { css: "#f0645b", w: 0.32 });
    reg(hits, phoneMenu, "photo-menu-on-phone");

    // Floor hazards along the aisle.
    const wetPatch = decal(g, 0.5, 0.5, -1.1, 0.006, WORK_Z + 0.75,
      (cx, w, h) => { cx.fillStyle = "rgba(120,150,160,0.35)"; cx.beginPath(); cx.ellipse(w / 2, h / 2, w * 0.42, h * 0.32, 0.3, 0, Math.PI * 2); cx.fill(); }, { px: 128, transparent: true });
    wetPatch.rotation.x = -Math.PI / 2;
    reg(hits, wetPatch, "wet-floor-mark");
    const wetPatch2 = decal(g, 0.4, 0.4, -0.4, 0.006, WORK_Z + 0.7,
      (cx, w, h) => { cx.fillStyle = "rgba(120,150,160,0.3)"; cx.beginPath(); cx.ellipse(w / 2, h / 2, w * 0.4, h * 0.3, 0.5, 0, Math.PI * 2); cx.fill(); }, { px: 128, transparent: true });
    wetPatch2.rotation.x = -Math.PI / 2;
    reg(hits, wetPatch2, "wet-floor-no-sign");
    const cashOpenHit = box(g, 0.4, 0.14, 0.3, -3.7, 0.9, WORK_Z + 0.4, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "till left open?", -3.7, 1.05, WORK_Z + 0.4, { css: "#f0645b", w: 0.3 });
    reg(hits, cashOpenHit, "cash-drawer-open-unattended");

    // ---------------------------------------------------------------- people
    const barback = standingFigure(g, -0.8, WORK_Z + 0.55, { ry: 0.7, cloth: 0x3a4148, vest: 0xb8862b });
    const barbackBody = barback.userData.body, barbackHead = barback.userData.head;
    barbackBody.rotation.x = -0.1;
    const barbackGlass = cyl(barbackBody, 0.03, 0.035, 0.08, -0.22, 1.1, 0.14, 0xcfe6ea, { rough: 0.2, transparent: true, opacity: 0.6, seg: 12 });
    barbackGlass.visible = false;
    const barbackScoop = cyl(barbackBody, 0.02, 0.03, 0.1, -0.22, 1.1, 0.14, 0xdfe4e8, { rough: 0.4, metal: 0.5, seg: 10 });
    barbackScoop.visible = false;

    const custA = standingFigure(g, 0.4, -1.15, { ry: Math.PI, cloth: 0x5a4a7a });
    const custAHead = custA.userData.head, custABody = custA.userData.body;
    const custB = standingFigure(g, -2.1, -1.3, { ry: Math.PI + 0.2, cloth: 0x2c5a3a });
    const custC = standingFigure(g, 2.3, -1.05, { ry: Math.PI - 0.3, cloth: 0x7a3a2c });
    void custB; void custC;
    const custAHome = new THREE.Vector3(0.4, 0, -1.15);

    return {
      hits,
      footprint: 2.4,
      spawnLook: new THREE.Vector3(0, 1.1, -3.0),

      onStepComplete(step) {
        if (step.id === "ice-well-burnout") repaint(sanTester.userData.screen, signFace("FLUSHED", { bg: "#161c22", accent: "#59c97b", scale: 0.5 }));
        if (step.id === "ice-refill") iceBagHome.visible = false;
        if (step.id === "scoop-hook") wellGlass.visible = false;
        if (step.id === "garnish-prep") repaint(dateSticker, signFace("TODAY", { bg: "#161c22", accent: "#59c97b", scale: 0.5 }));
        if (step.id === "pre-open-walk") { secondTray.visible = false; wetPatch.visible = false; }
      },

      onInterrupt(it) {
        if (it.id === "barback-scoop-with-glass") { barbackGlass.visible = true; barbackBody.rotation.z = -0.25; }
        if (it.id === "customer-reaches-garnish") { custA.position.z -= 0.55; custABody.rotation.x = -0.4; }
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "barback-scoop-with-glass") { barbackGlass.visible = false; barbackScoop.visible = true; barbackBody.rotation.z = 0; }
        if (it.id === "customer-reaches-garnish") { custA.position.copy(custAHome); custABody.rotation.x = 0; }
      },

      animate(t) {
        custAHead.rotation.y = Math.sin(t * 0.5) * 0.15;
        barbackHead.rotation.y = -0.3 + Math.sin(t * 0.6) * 0.1;
      },
    };
  },
};
