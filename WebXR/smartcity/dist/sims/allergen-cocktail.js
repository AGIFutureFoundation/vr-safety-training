import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, ball, lathe, group, decal, signFace, mat,
} from "../../../shared/kit.js";
import {
  stationPad, holoPanel, holoTag, standingFigure, reg,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Allergens & Honest Drinks VR — Culinary & Hospitality, the
// bartending series.
//
// The allergens behind a bar are rarely where a guest expects them: egg
// white in a sour, tree nuts in the liqueurs everyone assumes are just
// flavouring, dairy or gluten in a house syrup nobody reads the recipe card
// for, sulphites disclosed only on the label, and a garnish tray shared by
// every drink that touches it. The label and the recipe card are the record;
// memory is not. The same shift also asks a bartender to take a
// non-alcoholic or "mocktail" request as seriously as any other order, and
// to know exactly what happens if a guest starts reacting to something they
// were served.

const ALC_ACCENT = 0x4fd18a;

export const SIM_ALLERGEN_COCKTAIL = {
  id: "allergen-cocktail",
  index: "141",
  domain: "Culinary & Hospitality",
  trade: "Bartender — UNITE HERE Local 2",
  category: "Culinary & Hospitality",
  indoor: "bar",
  weather: "clear",
  certification: "The FDA's FALCPA major food-allergen labelling under 21 CFR 101 (egg, milk, tree nuts) as it reaches bottled liqueurs and house syrups; the TTB's sulphite-disclosure requirement on wine labels; the California Retail Food Code and NSF International's equipment-sanitation standards on cross-contact and food-contact surfaces; UNITE HERE Local 2's service standards; and the venue's own written allergy protocol",
  name: "Allergens & Honest Drinks",
  title: simTitle("Allergens & Honest Drinks"),
  tagline: "Take the allergy order seriously, read the label instead of the memory, keep dedicated tools for it, and if someone starts reacting: find their auto-injector, call 911, and don't let them leave",
  accent: ALC_ACCENT,
  accentCss: "#4fd18a",
  parSeconds: 300,
  footprint: 2.5,
  badge: { id: "read-the-label", name: "Read the Label", note: "Every allergen order answered from the label and the recipe card, clean, with the reaction chain ready if it was ever needed" },

  game: system({
    name: "Service Standards",
    currency: "POUR",
    ranks: ["Barback", "Well Bartender", "Lead Bartender", "Bar Manager", "Service Certified"],
    badges: [
      { id: "label-read", name: "Label Read", note: "Every bottle and recipe card checked before the first pour", test: AWARD.all(AWARD.stepClean("check-labels"), AWARD.stepClean("check-syrup-card")) },
      { id: "no-cross-contact", name: "No Cross-Contact", note: "No unsafe action anywhere in the run", test: AWARD.safe },
      { id: "steady-build", name: "Steady Build", note: "The shake and the mocktail build both carried clean the whole way", test: AWARD.unbroken },
    ],
    challenges: [
      { id: "clean-service", name: "Clean Service", note: "No corrections anywhere in the run", test: AWARD.clean },
      { id: "six-straight", name: "Six Straight", note: "Six correct actions in a row", test: AWARD.streak(6) },
      { id: "on-time", name: "On Time", note: "Complete inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "dirty-shaker": "You reached for the shaker already sitting on the rail instead of a clean one. It shook a regular round twenty minutes ago and carries enough residue on the gasket to matter to a true allergy — an allergy order gets its own clean tool every time, not whichever one is closest.",
    "amaretto-decoy": "You poured from the amaretto bottle itself. Amaretto is an almond-flavoured liqueur and one of the most common hidden nut sources behind a bar — reaching for the familiar bottle instead of the nut-free substitute is exactly the mistake this whole check exists to catch.",
    "bare-hand-garnish": "You dressed the glass with bare hands instead of the tongs. A garnish tray is touched by every drink that crosses it, and a bare hand carries whatever the last five drinks left on it straight onto a glass somebody said they cannot safely touch.",
    "wheat-tap": "You poured from the house lager tap for a customer who said celiac. Beer is made from barley or wheat and carries gluten the label on the tap handle never mentions — the gluten-free alternative is the pour, not the lager with a splash of something else in it.",
  },

  lateNotes: {
    "call-911": "The auto-injector gets found and used first — the call matters, but it does not treat a closing airway while you're dialling.",
    "keep-seated": "Keeping them from leaving comes after the injector and the call, not instead of either one.",
    "incident-log-sheet": "The log gets written after the reaction is actually handled, not instead of handling it.",
  },

  steps: [
    {
      id: "ask-allergy", kind: "select", target: "allergy-ticket",
      title: "Take the allergy seriously — write it down",
      cue: "Ask what they're allergic to and how severe, and put it on the ticket.",
      why: "An allergy told out loud and never written down survives exactly as long as it takes for the ticket to change hands. The ticket is what every set of hands behind this bar actually reads before a bottle gets touched.",
    },
    {
      id: "check-labels", kind: "find", noHint: true,
      targets: ["bottle-amaretto", "bottle-orgeat", "bottle-frangelico"],
      itemNames: { "bottle-amaretto": "amaretto", "bottle-orgeat": "orgeat", "bottle-frangelico": "Frangelico" },
      itemNotes: {
        "bottle-amaretto": "An almond-flavoured liqueur — often almond-flavoured rather than almond-derived, but never provably so from behind the bar, which is why it is treated as a nut source either way.",
        "bottle-orgeat": "An almond syrup, full stop — the single most common hidden nut ingredient in a classic sour or tiki cocktail.",
        "bottle-frangelico": "A hazelnut liqueur, tree nut, and the third bottle a nut-allergy order has to be built around rather than with.",
      },
      title: "Check the bottles for hidden nuts",
      cue: "Walk the back bar and identify every nut liqueur before you touch a shaker.",
      why: "Nothing on this menu says almond or hazelnut anywhere in its name, so the bottle's own label — not the recipe committed to memory — is what a nut allergy actually depends on getting right.",
    },
    {
      id: "check-syrup-card", kind: "select", target: "syrup-recipe-card",
      title: "Check the house syrup's recipe card",
      cue: "Read what's actually in the house-made syrup before it goes anywhere near this order.",
      why: "A house-made syrup carries no label of its own — the recipe card kept behind the bar is the only place its egg white, dairy, or nut content is written down at all, which is exactly why it gets checked instead of assumed.",
    },
    {
      id: "clean-tools", kind: "sequence",
      targets: ["clean-jigger", "clean-shaker"],
      itemNames: { "clean-jigger": "a dedicated jigger", "clean-shaker": "a clean shaker" },
      title: "Pull dedicated tools for this order",
      cue: "A jigger that hasn't measured a nut liqueur tonight, then a shaker straight off the clean rack.",
      why: "Cross-contact travels through the tool as much as the ingredient — a jigger or shaker that measured amaretto an hour ago carries enough residue to matter to a real allergy, so this order gets equipment nothing else has touched tonight.",
      outOfOrderNote: "The jigger gets pulled clean before the shaker does — reaching for the shaker first still leaves the actual measuring tool unaccounted for.",
    },
    {
      id: "sub-pour", kind: "drag", target: "nut-free-sub",
      title: "Pour the nut-free substitute",
      cue: "Carry the nut-free syrup to the clean shaker — not the orgeat, not the amaretto.",
      why: "The substitute only protects anyone once it is actually the thing that goes in the shaker. Deciding to use it and then reaching for the familiar bottle out of habit is the same mistake as never deciding at all.",
      drag: { to: "clean-shaker", radius: 0.4, missNote: "Not in the shaker. Set down anywhere else, the substitute is a bottle on a rail, not a drink." },
    },
    {
      id: "shake", kind: "hold", target: "shaker-handle", seconds: 5,
      title: "Shake it in the clean shaker",
      cue: "Hold the shake — this glass never touches the tools that made the last round.",
      why: "The shake itself is the last chance for cross-contact to happen unnoticed, so it happens in the tool that has touched nothing else tonight, held the full count rather than rushed to get to the next ticket.",
      holdBreakNote: "You broke the shake off early. A rushed shake in the right shaker is still safer than a full one in the wrong one, but neither is the standard — hold it the full count.",
    },
    {
      id: "strain-serve", kind: "select", target: "allergy-drink-serve",
      title: "Strain, garnish safe, and mark it",
      cue: "Strain into a clean glass and mark the ticket so the kitchen and the next bartender both know why.",
      why: "A correctly made allergy drink that arrives at the table unmarked is one glass swap away from being the wrong drink to the wrong guest — the mark on the ticket is what keeps the whole chain honest after it leaves your hands.",
    },
    {
      id: "mocktail-order", kind: "select", target: "mocktail-ticket",
      title: "Take the non-alcoholic order at face value",
      cue: "No follow-up questions about why — just build it right.",
      why: "A guest who orders non-alcoholic is owed the same care as anyone else's order, not a raised eyebrow or a second guess about the reason. \"Mocktail\" is a drink order, not a conversation starter.",
    },
    {
      id: "build-mocktail", kind: "track", target: "mocktail-build", seconds: 5,
      title: "Build the mocktail to the recipe",
      cue: "Steady build — the same care as any other ticket, not a rushed afterthought.",
      why: "A mocktail thrown together fast because it \"doesn't really count\" reads to the guest exactly like what it is. Building it at the same steady pace as anything else on the rail is the whole of what taking it seriously looks like.",
      track: { start: 0.1, green: [0.4, 0.62], rise: 0.55, fall: 0.45, drift: 0.1, label: "BUILD", readout: (v) => (v < 0.4 ? "rushed" : v > 0.62 ? "overworked" : "steady") },
      holdBreakNote: "Pace drifted out of band — too rushed reads as an afterthought, too fussy holds up the rail for no reason.",
    },
    {
      id: "mark-mocktail", kind: "select", target: "mocktail-flag",
      title: "Mark the glass so it can't be mistaken",
      cue: "A flag straw or a marked ticket — something that survives the glass changing hands.",
      why: "A mocktail that looks identical to the drink beside it is a swap waiting to happen the first time a runner, a friend, or a second bartender touches the tray. The mark is what keeps a non-alcoholic order non-alcoholic after it leaves your sight.",
    },
    {
      id: "check-garnish", kind: "find", noHint: true,
      targets: ["citrus-tongs", "dried-fruit-sulphite"],
      itemNames: { "citrus-tongs": "tongs for the garnish", "dried-fruit-sulphite": "sulphite-treated dried fruit" },
      itemNotes: {
        "citrus-tongs": "The garnish tray is touched by every drink that crosses it — tongs are what keep one bare hand from carrying the last five drinks' residue onto this one.",
        "dried-fruit-sulphite": "Sulphur dioxide preserves the colour of dried fruit garnish and is exactly the kind of ingredient a sulphite-sensitive guest asks about by name.",
      },
      title: "Check the garnish tray",
      cue: "Tongs, not fingers — and check what's actually preserving that dried fruit.",
      why: "A shared garnish tray is a cross-contact surface like any cutting board, and the fruit sitting on it can carry its own disclosure requirement. Both get the same attention the bottles already got.",
    },
    {
      id: "gluten-swap", kind: "select", target: "gluten-free-alt",
      title: "Swap the beer for a celiac guest",
      cue: "Barley and wheat mean gluten — pour the gluten-free alternative instead.",
      why: "Beer is made from barley or wheat and carries gluten that no tap handle discloses on its own. A guest who says celiac gets the gluten-free cider or spirit poured without having to ask twice.",
    },
    {
      id: "sulphite-disclosure", kind: "select", target: "wine-sulphite-label",
      title: "Read the sulphite disclosure on the wine",
      cue: "\"Contains Sulfites\" is required on the label for a reason — read it before you pour for a sensitive guest.",
      why: "The TTB requires a sulphite disclosure on any wine carrying ten parts per million or more, which makes the label — not the varietal, not the producer's reputation — the actual answer for a guest who reacts to sulphites.",
    },
    {
      id: "reaction-response", kind: "sequence",
      targets: ["epi-locator", "call-911", "keep-seated"],
      itemNames: { "epi-locator": "find their auto-injector", "call-911": "call 911", "keep-seated": "keep them from leaving" },
      title: "Someone starts reacting — respond in order",
      cue: "Hives are spreading at the rail. Find their auto-injector, call 911, and keep them from walking out.",
      why: "Most guests who carry a serious allergy carry their own auto-injector, and finding it fast is the one action that can reverse a closing airway before EMS arrives. The call follows immediately after, and nobody lets a reacting guest walk out to their car alone while any of this is happening — and OSHA's 1910.1030 bloodborne pathogen standard is why the used needle goes to EMS or a sharps container, never a bare hand or the trash.",
      outOfOrderNote: "The auto-injector is found first, the call goes out right behind it, and only then does anyone worry about the door — reversing that order costs the minutes that matter most.",
    },
    {
      id: "incident-log", kind: "select", target: "incident-log-sheet",
      title: "Log what was served and what happened",
      cue: "Write down the drink, the ingredient, the timeline and the outcome once EMS has the guest.",
      why: "A written record of exactly what was in the glass and when the reaction started is what the receiving hospital and the venue's own review both need afterward — and it is what proves the protocol was followed rather than just believed to have been.",
    },
  ],

  interrupts: [
    {
      id: "wet-orgeat-shaker",
      kind: "Cross-contact risk",
      after: "shake", delay: 2, seconds: 12,
      alert: "A colleague hands you a fresh shaker for the next round — it's still wet with orgeat from the last ticket.",
      cue: "Swap it for a clean one before this order goes anywhere near it.",
      target: "clean-shaker-swap",
      why: "A shaker rinsed but still wet with orgeat carries a nut allergen on its own gasket and threads. It gets swapped for a genuinely clean one before the allergy order touches it, not wiped down and reused because a colleague already has it in hand.",
      missNote: "The allergy order went into the shaker your colleague handed you. It had already held orgeat that shift, and \"rinsed\" is not the same claim as \"clean\" for someone whose reaction does not care about the difference.",
      wrongNote: "It's the shaker. Swap it for a clean one — nothing else about this ticket matters until that happens.",
    },
    {
      id: "shot-as-joke",
      kind: "Drink tampering",
      after: "build-mocktail", delay: 2, seconds: 11,
      alert: "A friend at the table has ordered a shot \"as a joke\" and is sliding it toward the guest who ordered non-alcoholic.",
      cue: "Intercept the shot before it reaches them.",
      target: "intercept-shot",
      why: "A guest who asked for non-alcoholic gets exactly that, and a friend's idea of a joke does not get to override an order they were honest about. The shot is intercepted the moment it's spotted moving, not after somebody has already had a sip.",
      missNote: "The shot reached the table. A non-alcoholic order that ends up with alcohol in it anyway — pushed there by a third party — is exactly the failure this whole request was trying to avoid, and it happened while you were watching.",
      wrongNote: "The shot glass sliding across the table is the thing to stop — intercept it before it reaches them.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.5, ALC_ACCENT);

    const topY = 1.1;
    const barZ = -2.1;

    // ---------------------------------------------------------- order ticket
    const ticketRail = holoPanel(g, 0.4, 0.28, -2.6, 1.5, barZ - 0.2, (cx, w, h) => {
      cx.fillStyle = "rgba(8,20,14,0.9)"; cx.fillRect(0, 0, w, h);
      cx.fillStyle = "#4fd18a"; cx.fillRect(0, 0, w, 4);
      cx.fillStyle = "#e2fbee";
      cx.font = `600 ${Math.round(h * 0.16)}px 'Barlow Condensed', Arial, sans-serif`;
      cx.textAlign = "center"; cx.textBaseline = "middle";
      cx.fillText("ALLERGY TICKET", w / 2, h * 0.3);
      cx.font = `${Math.round(h * 0.11)}px Arial, sans-serif`;
      cx.fillText("Tree nut — severity: carries own EpiPen", w / 2, h * 0.65);
    }, { ry: 0.4, accent: ALC_ACCENT });
    reg(hits, ticketRail, "allergy-ticket");

    // ------------------------------------------------------- nut liqueur row
    function alcBottle(x, z, colour, label, o = {}) {
      const bt = group(g, x, 0, z, o.ry ?? 0);
      lathe(bt, [[0.001, 0], [0.045, 0.01], [0.045, 0.24], [0.02, 0.3], [0.02, 0.4], [0.001, 0.41]],
        0, topY, 0, colour, { rough: 0.35, metal: 0.05, seg: 16 });
      decal(bt, 0.07, 0.14, 0, topY + 0.15, 0.047,
        signFace(label, { bg: "#161c1a", accent: "#e2fbee", scale: 0.55 }), { px: 128 });
      return bt;
    }
    const amaretto = alcBottle(-2.6, barZ - 0.35, 0x6b3a1c, "AMARETTO");
    reg(hits, amaretto, "bottle-amaretto");
    const orgeat = alcBottle(-2.4, barZ - 0.35, 0xe8ddc4, "ORGEAT");
    reg(hits, orgeat, "bottle-orgeat");
    const frangelico = alcBottle(-2.2, barZ - 0.35, 0x8b5a2c, "FRANGELICO");
    reg(hits, frangelico, "bottle-frangelico");
    const nutSub = alcBottle(-2.0, barZ - 0.35, 0xdfe4c4, "NUT-FREE SUB");
    holoTag(g, "nut-free substitute", -2.0, topY + 0.5, barZ - 0.35, { css: "#4fd18a", w: 0.4 });
    reg(hits, nutSub, "nut-free-sub");
    // A pour-spout proxy on the amaretto bottle itself — the decoy for the
    // substitution step, a separate object from the "find" target above.
    const amarettoPour = cyl(g, 0.008, 0.008, 0.04, -2.6, topY + 0.42, barZ - 0.35, 0x8b929a, { rough: 0.4, metal: 0.7, seg: 8 });
    reg(hits, amarettoPour, "amaretto-decoy");

    // -------------------------------------------------------- syrup recipe card
    const syrupCard = holoPanel(g, 0.36, 0.26, -1.6, 1.45, barZ - 0.2, (cx, w, h) => {
      cx.fillStyle = "rgba(8,20,14,0.9)"; cx.fillRect(0, 0, w, h);
      cx.fillStyle = "#4fd18a"; cx.fillRect(0, 0, w, 4);
      cx.fillStyle = "#e2fbee";
      cx.font = `600 ${Math.round(h * 0.15)}px 'Barlow Condensed', Arial, sans-serif`;
      cx.textAlign = "center"; cx.textBaseline = "middle";
      cx.fillText("HOUSE SYRUP", w / 2, h * 0.3);
      cx.font = `${Math.round(h * 0.1)}px Arial, sans-serif`;
      cx.fillText("egg white · cream · almond", w / 2, h * 0.65);
    }, { ry: 0.35, accent: ALC_ACCENT });
    reg(hits, syrupCard, "syrup-recipe-card");

    // ------------------------------------------------------------- tool rack
    const dirtyJigger = cyl(g, 0.014, 0.02, 0.09, -1.15, topY + 0.045, barZ - 0.1, 0xb9bfc4, { rough: 0.35, metal: 0.7, seg: 12 });
    holoTag(g, "jigger — used", -1.15, topY + 0.14, barZ - 0.1, { css: "#f0645b", w: 0.32 });
    const cleanJigger = cyl(g, 0.014, 0.02, 0.09, -0.95, topY + 0.045, barZ - 0.1, 0xdfe4e8, { rough: 0.25, metal: 0.8, seg: 12 });
    holoTag(g, "jigger — clean", -0.95, topY + 0.14, barZ - 0.1, { css: "#4fd18a", w: 0.32 });
    reg(hits, cleanJigger, "clean-jigger");

    const dirtyShaker = group(g, -0.55, 0, barZ - 0.1);
    cyl(dirtyShaker, 0.045, 0.055, 0.2, 0, topY + 0.1, 0, 0xb9bfc4, { rough: 0.35, metal: 0.75, seg: 14 });
    holoTag(dirtyShaker, "shaker — on the rail", 0, topY + 0.26, 0, { css: "#f0645b", w: 0.44 });
    reg(hits, dirtyShaker, "dirty-shaker");

    const cleanShaker = group(g, -0.3, 0, barZ - 0.1);
    const shakerBody = cyl(cleanShaker, 0.045, 0.055, 0.2, 0, topY + 0.1, 0, 0xe8ecef, { rough: 0.2, metal: 0.85, finish: "brushed", seg: 14 });
    holoTag(cleanShaker, "shaker — clean rack", 0, topY + 0.26, 0, { css: "#4fd18a", w: 0.42 });
    reg(hits, shakerBody, "clean-shaker");
    const shakerHandle = cyl(cleanShaker, 0.05, 0.05, 0.02, 0, topY + 0.21, 0, 0xdfe4e8, { rough: 0.3, metal: 0.7, seg: 14 });
    reg(hits, shakerHandle, "shaker-handle");
    const shakerSwap = group(g, -0.05, 0, barZ - 0.1);
    cyl(shakerSwap, 0.045, 0.055, 0.2, 0, topY + 0.1, 0, 0xdfe4e8, { rough: 0.2, metal: 0.85, seg: 14 });
    holoTag(shakerSwap, "swap — fresh clean shaker", 0, topY + 0.26, 0, { css: "#4fd18a", w: 0.5 });
    reg(hits, shakerSwap, "clean-shaker-swap");

    const allergyGlass = cyl(g, 0.04, 0.03, 0.11, 0.2, topY + 0.065, barZ - 0.1, 0xdfeee6, { rough: 0.15, metal: 0.05, opacity: 0.55, transparent: true, seg: 16 });
    holoTag(g, "allergy drink — marked", 0.2, topY + 0.22, barZ - 0.1, { css: "#4fd18a", w: 0.42 });
    reg(hits, allergyGlass, "allergy-drink-serve");

    // -------------------------------------------------------------- mocktail
    const mockTicket = holoPanel(g, 0.34, 0.24, 0.7, 1.4, barZ - 0.2, (cx, w, h) => {
      cx.fillStyle = "rgba(8,20,14,0.9)"; cx.fillRect(0, 0, w, h);
      cx.fillStyle = "#4fd18a"; cx.fillRect(0, 0, w, 4);
      cx.fillStyle = "#e2fbee";
      cx.font = `600 ${Math.round(h * 0.15)}px 'Barlow Condensed', Arial, sans-serif`;
      cx.textAlign = "center"; cx.textBaseline = "middle";
      cx.fillText("MOCKTAIL", w / 2, h * 0.35);
      cx.font = `${Math.round(h * 0.1)}px Arial, sans-serif`;
      cx.fillText("non-alcoholic — no follow-up", w / 2, h * 0.68);
    }, { ry: -0.3, accent: ALC_ACCENT });
    reg(hits, mockTicket, "mocktail-ticket");

    const mockGlass = cyl(g, 0.045, 0.035, 0.13, 1.0, topY + 0.075, barZ - 0.05, 0xf2e07a, { rough: 0.15, metal: 0.05, opacity: 0.6, transparent: true, seg: 16 });
    holoTag(g, "mocktail — building", 1.0, topY + 0.24, barZ - 0.05, { css: "#4fd18a", w: 0.38 });
    reg(hits, mockGlass, "mocktail-build");
    const mockFlag = box(g, 0.02, 0.09, 0.02, 1.0, topY + 0.19, barZ - 0.05, 0xf2c14b, { rough: 0.6 });
    reg(hits, mockFlag, "mocktail-flag");

    // The shot glass a friend slides toward the mocktail guest.
    const shotGlass = cyl(g, 0.025, 0.022, 0.06, 2.3, topY + 0.03, 0.15, 0xe8ecef, { rough: 0.15, metal: 0.05, opacity: 0.6, transparent: true, seg: 14 });
    holoTag(g, "shot — from a friend", 2.3, topY + 0.14, 0.15, { css: "#f0645b", w: 0.4 });
    reg(hits, shotGlass, "intercept-shot");

    // -------------------------------------------------------------- garnish
    const garnishTray = group(g, 1.55, 0, barZ - 0.25);
    box(garnishTray, 0.4, 0.03, 0.22, 0, topY + 0.015, 0, 0xdfe4e8, { rough: 0.4, metal: 0.4 });
    for (let i = 0; i < 4; i++) {
      ball(garnishTray, 0.02, -0.14 + i * 0.09, topY + 0.05, 0, [0xf2c14b, 0xf0645b, 0x59c97b, 0xa07830][i], { rough: 0.5, seg: 10 });
    }
    const tongs = box(garnishTray, 0.02, 0.14, 0.02, 0.2, topY + 0.08, 0, 0xb9bfc4, { rough: 0.35, metal: 0.7 });
    holoTag(garnishTray, "tongs", 0.2, topY + 0.2, 0, { css: "#4fd18a", w: 0.24 });
    reg(hits, tongs, "citrus-tongs");
    const bareHandTrap = box(g, 0.14, 0.02, 0.14, 1.75, topY + 0.02, barZ - 0.3, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, bareHandTrap, "bare-hand-garnish");
    const driedFruit = box(garnishTray, 0.14, 0.02, 0.1, -0.15, topY + 0.045, 0.08, 0xb85a3a, { rough: 0.85 });
    holoTag(garnishTray, "dried fruit — sulphites?", -0.15, topY + 0.16, 0.08, { css: "#f2c14b", w: 0.44 });
    reg(hits, driedFruit, "dried-fruit-sulphite");

    // -------------------------------------------------------------- beer & wine
    const wheatTap = group(g, -3.6, 0, barZ - 0.35);
    cyl(wheatTap, 0.012, 0.012, 0.3, 0, topY + 0.15, 0, 0xb8b0a0, { rough: 0.3, metal: 0.8, seg: 10 });
    ball(wheatTap, 0.03, 0, topY + 0.31, 0, 0xd8a13a, { rough: 0.4, metal: 0.3, seg: 10 });
    holoTag(wheatTap, "lager — barley", 0, topY + 0.48, 0, { css: "#f0645b", w: 0.36 });
    reg(hits, wheatTap, "wheat-tap");
    const gfTap = group(g, -3.35, 0, barZ - 0.35);
    cyl(gfTap, 0.012, 0.012, 0.3, 0, topY + 0.15, 0, 0xb8b0a0, { rough: 0.3, metal: 0.8, seg: 10 });
    ball(gfTap, 0.03, 0, topY + 0.31, 0, 0x59c97b, { rough: 0.4, metal: 0.3, seg: 10 });
    holoTag(gfTap, "gluten-free cider", 0, topY + 0.48, 0, { css: "#4fd18a", w: 0.42 });
    reg(hits, gfTap, "gluten-free-alt");

    const wineBottle = group(g, -3.0, 0, barZ - 0.35);
    lathe(wineBottle, [[0.001, 0], [0.05, 0.01], [0.05, 0.26], [0.018, 0.32], [0.018, 0.42], [0.001, 0.43]],
      0, topY, 0, 0x2f3a24, { rough: 0.3, metal: 0.05, seg: 16 });
    const wineLabel = decal(wineBottle, 0.075, 0.1, 0, topY + 0.13, 0.051,
      signFace("CONTAINS SULFITES", { bg: "#161c1a", accent: "#e2fbee", scale: 0.42 }), { px: 160 });
    reg(hits, wineLabel, "wine-sulphite-label");

    // -------------------------------------------------------- reaction chain
    const purse = group(g, 2.1, 0, 0.4);
    box(purse, 0.16, 0.12, 0.08, 0, 0.55, 0, 0x5a3a52, { rough: 0.75 });
    const epiPen = cyl(purse, 0.01, 0.01, 0.1, 0.03, 0.6, 0.05, 0xf2c14b, { rough: 0.4, seg: 8 });
    holoTag(purse, "their auto-injector", 0, 0.72, 0, { css: "#4fd18a", w: 0.44 });
    reg(hits, epiPen, "epi-locator");
    const phone911 = box(g, 0.09, 0.15, 0.04, -1.9, 0.95, barZ - 0.05, 0x2b3138, { rough: 0.5 });
    holoTag(g, "Call 911", -1.9, 1.08, barZ - 0.05, { css: "#4fd18a", w: 0.28 });
    reg(hits, phone911, "call-911");
    const seatMarker = box(g, 0.4, 0.02, 0.4, 2.1, 0.011, 1.1, ALC_ACCENT, { emissive: ALC_ACCENT, ei: 0.4, opacity: 0.4, transparent: true, cast: false, receive: false });
    holoTag(g, "keep them seated", 2.1, 0.2, 1.1, { css: "#4fd18a", w: 0.42 });
    reg(hits, seatMarker, "keep-seated");

    const incidentLog = holoPanel(g, 0.42, 0.3, -2.9, 1.15, 0.4, (cx, w, h) => {
      cx.fillStyle = "rgba(8,20,14,0.9)"; cx.fillRect(0, 0, w, h);
      cx.fillStyle = "#4fd18a"; cx.fillRect(0, 0, w, 4);
      cx.fillStyle = "#e2fbee";
      cx.font = `600 ${Math.round(h * 0.15)}px 'Barlow Condensed', Arial, sans-serif`;
      cx.textAlign = "center"; cx.textBaseline = "middle";
      cx.fillText("INCIDENT LOG", w / 2, h * 0.3);
      cx.font = `${Math.round(h * 0.1)}px Arial, sans-serif`;
      cx.fillText("Drink · ingredient · timeline", w / 2, h * 0.65);
    }, { ry: 1.0, accent: ALC_ACCENT });
    reg(hits, incidentLog, "incident-log-sheet");

    // ------------------------------------------------------------ bar dressing
    for (let i = 0; i < 4; i++) {
      const tap = group(g, -4.1 + i * 0.3, topY, barZ - 0.5);
      cyl(tap, 0.01, 0.01, 0.22, 0, 0.11, 0, 0xb8b0a0, { rough: 0.3, metal: 0.8, seg: 8 });
    }
    const iceWell = box(g, 0.5, 0.32, 0.4, 2.7, topY - 0.05, barZ - 0.25, 0xdfe4e8, { rough: 0.35, metal: 0.4, finish: "brushed", tile: 2 });
    void iceWell;
    const glassRack = group(g, 2.6, 1.9, barZ - 0.55);
    box(glassRack, 0.7, 0.02, 0.25, 0, 0, 0, 0x2b211c, { rough: 0.6, cast: false });
    for (let i = 0; i < 5; i++) {
      cyl(glassRack, 0.03, 0.02, 0.09, -0.28 + i * 0.14, -0.06, 0, 0xdfe9ec, { rough: 0.2, metal: 0.05, opacity: 0.5, transparent: true, seg: 10 });
    }

    // ------------------------------------------------------------------ crew
    const nutCustomer = standingFigure(g, -0.7, -0.55, { ry: -2.4, cloth: 0x5a4a7a });
    const mockCustomer = standingFigure(g, 1.4, -0.5, { ry: -2.9, cloth: 0x2c5a3a });
    const friend = standingFigure(g, 1.85, -0.15, { ry: -1.9, cloth: 0x8b3a3a });
    const regularCustomer = standingFigure(g, -3.5, 1.2, { ry: -2.5, cloth: 0x9a8a5a });
    void friend; void regularCustomer;

    return {
      hits,
      footprint: 2.5,
      spawnLook: new THREE.Vector3(-1.0, 1.2, -1.9),

      onStepComplete(step) {
        if (step.id === "sub-pour") { nutSub.visible = false; }
        if (step.id === "strain-serve") { allergyGlass.material.color.set(0x4fd18a); }
        if (step.id === "mark-mocktail") { mockFlag.material.emissiveIntensity = 1.2; }
        if (step.id === "reaction-response") { epiPen.material = mat(0x59c97b, { emissive: 0x59c97b, ei: 1.2, rough: 0.4 }); }
      },

      onInterrupt(it) {
        if (it.id === "wet-orgeat-shaker") { shakerBody.material = mat(0xf0645b, { rough: 0.35, metal: 0.6 }); }
        if (it.id === "shot-as-joke") { shotGlass.position.set(1.65, topY + 0.03, -0.3); }
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "wet-orgeat-shaker") { shakerBody.material = mat(0xe8ecef, { rough: 0.2, metal: 0.85 }); }
        if (it.id === "shot-as-joke") { shotGlass.position.set(2.3, topY + 0.03, 0.15); }
      },

      onHazard() {},

      animate(t, dt, session) {
        void dt;
        const tr = session?.track;
        if (session?.step?.id === "build-mocktail" && tr) {
          mockGlass.material.color.set(tr.v >= 0.4 && tr.v <= 0.62 ? 0xf2e07a : 0xf0645b);
        }
      },
    };
  },
};
