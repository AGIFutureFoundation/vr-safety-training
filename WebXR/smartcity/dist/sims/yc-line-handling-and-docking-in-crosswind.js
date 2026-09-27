import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import { box, cyl, ball, torus, hose, group, mat, repaint, signFace } from "../../../shared/kit.js";
import {
  CITY, stationPad, holoPanel, holoTag, instrument, standingFigure, reg,
  surfaceTexture, texturedMat, waterFace,
} from "../citykit.js";
import { motorYacht } from "../../../shared/fleet.js";
import { marinaBerth } from "../../../shared/props.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Line Handling & Docking In A Crosswind VR — Maritime & Ports,
// the yacht and charter crew pack.
//
// A motor yacht coming alongside her finger berth with the wind on the beam:
// the deckhand on the side deck with the spring and stern lines flaked, the
// fenders to hang at the rub rail, the mate on the dock, the captain at the
// flybridge helm working the engines against the wind. No wind speed or
// distance is stated anywhere — the captain's standing orders set the limit
// for coming alongside and the deckhand calls what they see.

const YC2_ACCENT = 0x2b6f9e;
const YC2_CSS = "#2b6f9e";

export const SIM_YC_LINE_HANDLING_AND_DOCKING_IN_CROSSWIND = {
  id: "yc-line-handling-and-docking-in-crosswind",
  index: "yc-2",
  domain: "Maritime & Ports",
  trade: "Charter yacht deckhand on the side deck, IBU and SIU trained, with the mate on the dock and the captain at the flybridge helm",
  category: "Maritime & Ports",
  district: "Maritime & Ports",
  weather: "wind",
  certification: "IBU and SIU deck training in line handling and coming alongside; USCG 33 CFR 83 Inland Navigation Rules for the approach through the marina; 46 CFR 25 equipment for uninspected vessels as the vessel's certificate applies it; OSHA 29 CFR 1910.132 personal protective equipment for gloves and the work vest; IMO STCW basic safety training; MEBA engineering watch on the engines through the approach",
  name: "Line Handling & Docking In A Crosswind",
  title: simTitle("Line Handling & Docking In A Crosswind"),
  tagline: "Coming alongside with the wind on the beam: the docking plan read, gloves and vest on, the lines walked for chafe and the fender hung low, the closing distance called to the captain through a gust that sets the bow off, the spring passed first and the stern line cleated with a hitch, the spring tended through a passing wake, the bow line sent forward, the tension sighted, engines confirmed stopped, the docking logged and the deck checked in",
  accent: YC2_ACCENT,
  accentCss: YC2_CSS,
  parSeconds: 280,
  footprint: 2.6,
  badge: { id: "spring-first", name: "Spring First", note: "The spring line ashore before any other, hands outside every bight, no jump to the dock and no line stopped by hand" },

  supportLine: "your union hall's member assistance programme — the IBU, SIU or MEBA — with the operator's employee assistance line behind it",

  game: system({
    name: "Alongside",
    currency: "FATHOM",
    ranks: ["Green Hand", "Line Handler", "Lead Deckhand", "Mate", "Alongside Certified"],
    badges: [
      { id: "plan-read", name: "Plan Read", note: "The docking plan read before a fender moved", test: AWARD.stepClean("docking-plan") },
      { id: "tension-true", name: "Tension True", note: "Spring tension committed inside the band first time", test: AWARD.precise(0.7) },
      { id: "outside-the-bight", name: "Outside The Bight", note: "Never a hand in a bight, never a jump, never a line stopped by hand", test: AWARD.safe },
    ],
    challenges: [
      { id: "clean-alongside", name: "Clean Alongside", note: "No corrections from the plan to the log", test: AWARD.clean },
      { id: "steady-callouts", name: "Steady Call-Outs", note: "Closing distance called in band the whole approach", test: AWARD.unbroken },
      { id: "before-the-gust", name: "Before The Gust", note: "Docking logged inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "hand-in-bight": "You stood inside the bight of the flaked spring line as the captain came ahead on it. A line under load straightens in an instant and takes whatever is inside its bight with it — a foot, a hand, a whole deckhand pulled through the gap to the dock. Lines are flaked so the bight lies clear of the working space, and the deckhand stands outside every bight, every time, before a line takes a strain.",
    "jump-to-dock": "You went to jump the gap to the dock with the line in your hand. The gap between a hull and a finger dock opens and closes with every gust and every touch of the engines, and a deckhand who lands short goes between them; the line goes across on a heaving line or is handed to the mate when the gap is a step, never a jump, and the captain closes the gap with the engines, not the crew with their legs.",
    "line-around-hand": "You wrapped the stern line round your hand to get a better grip against the wind. A yacht of this size setting off in a gust puts more load on a line than any grip can hold, and a line wrapped round a hand takes the hand to the cleat with it. Load is held on the cleat with a turn, never on the body; the hand stays open and pays out through the grip when the line wants to run.",
    "surge-stop": "You tried to stop the yacht's surge along the dock by holding the stern line against it by hand. Tons of hull moving on a wind do not stop for a person; the line either runs through the hands and burns them or holds and pulls the person over. The surge is stopped with a turn on the cleat that lets the line surge under control, and the captain takes the way off with the engines.",
  },

  lateNotes: {
    "docking-log": "The docking is logged once the vessel is fast and the engines are confirmed stopped — last, not first.",
    "stern-cleat": "The stern line is hitched once the spring is ashore and the captain has come ahead on it — the spring first, then the stern.",
  },

  steps: [
    {
      id: "docking-plan", kind: "select", target: "docking-brief-board",
      title: "Read the docking plan with the captain",
      cue: "Read the plan on the side-deck board: which side to, which line goes first, who takes what on the dock, the wind and the captain's limit for coming alongside per the standing orders, and the word that stops the approach.",
      why: "Coming alongside in a crosswind is a sequence the whole crew has to agree on before the hull is near the dock, because there is no time to discuss it when the bow is setting off and the mate is reaching for the wrong line. The plan says which line goes first and why — the spring, so the captain can work the engines against it and bring the hull in — and it says the word that aborts the approach, so the deckhand who sees the gap opening knows exactly what to shout rather than describing it.",
    },
    {
      id: "gloves-and-vest", kind: "sequence", anyOrder: true,
      targets: ["line-gloves", "dock-vest"],
      itemNames: { "line-gloves": "line-handling gloves", "dock-vest": "work vest" },
      title: "Put on the gloves and the work vest",
      cue: "Line-handling gloves on, and the work vest fastened over the uniform before the fenders come out.",
      why: "Line handling in a wind is rope running through hands under load, and bare hands lose skin to a surging line before the brain has decided to let go; the gloves are what let a deckhand hold a turn and pay out under control. The vest is for the gap: the side deck is the one place on the vessel where a person is over the water with a hull closing on a dock, and a deckhand who goes in there is recovered by the vest and the mate, not by swimming.",
    },
    {
      id: "line-walk", kind: "find", noHint: true,
      targets: ["spring-chafe", "fender-hung-low"],
      itemNames: { "spring-chafe": "chafed section of the spring line at its eye", "fender-hung-low": "stern fender hung below the rub rail" },
      itemNotes: {
        "spring-chafe": "The spring line's cover is chafed through at the eye where it rode the cleat's horn on the last docking — the spring takes the whole load of the engines against the dock, and a chafed eye is where it parts.",
        "fender-hung-low": "The stern fender is hung a full fender's length below the rub rail, where it will protect nothing when the hull touches — the fender has to sit at the rub rail, the widest part of the hull, or the hull takes the dock on the gelcoat.",
      },
      title: "Walk the lines and the fenders before the approach",
      cue: "Walk the flaked lines from eye to bitter end and each fender on its lanyard: chafe at the eyes, kinks, every fender at the height of the rub rail.",
      why: "The lines and fenders are inspected on the deck, in the open, because once the approach starts there is no looking at anything — the deckhand is watching the dock and the mate, and a line that parts or a fender that hangs uselessly below the rail shows itself only when the hull touches. A chafed eye on a spring line is the single most common way a docking turns into damage, and it is found by running the line through a gloved hand rather than glancing at the coil.",
    },
    {
      id: "fenders-out", kind: "drag", target: "fender-bundle",
      title: "Hang the fenders at the rub rail on the dock side",
      cue: "Take the fenders from the locker and hang them on the dock side at the rub rail, the lanyards hitched to the stanchion bases, spaced where the hull will touch first.",
      why: "The fender sits where the hull is widest, at the rub rail, because that is what meets the dock; a fender hung low protects the topsides below the waterline that were never going to touch, and a fender hung high swings over the dock. They go on the side the plan says, before the approach, hitched to the stanchion bases so a fender that gets caught between hull and dock does not take the rail with it, and spaced to where the hull will touch first — aft, in a crosswind, where the stern sets down.",
      drag: { to: "rub-rail-socket", radius: 0.6, missNote: "Not at the rub rail — the fender protects nothing unless it hangs where the hull is widest, on the dock side, before the approach." },
    },
    {
      id: "approach-callouts", kind: "track", target: "distance-callout", seconds: 6,
      title: "Call the closing distance to the captain through the approach",
      cue: "Standing clear of the lines on the side deck, call the gap to the dock to the captain steadily as the hull closes — a number the captain can act on, at a rhythm that keeps up with the approach.",
      why: "The captain at the flybridge helm cannot see the side of the hull against the dock and is bringing tons of vessel onto a wooden float on the strength of what the deckhand calls; a call that stops, rushes or guesses is a captain working blind. The distance is called steadily, in the units the standing orders name, and the same voice calls the word that stops the approach if the gap opens or the bow sets off — the whole docking rides on the deckhand's rhythm.",
      track: { start: 0.14, green: [0.42, 0.6], rise: 0.6, fall: 0.46, drift: 0.12, label: "CALL-OUT RHYTHM", readout: (v) => (v < 0.42 ? "too slow — captain waiting" : v > 0.6 ? "rushing — numbers blur" : "steady — captain has the gap") },
      holdBreakNote: "The call-outs broke rhythm and the captain lost the gap. Take up the rhythm again at the number the captain last heard.",
    },
    {
      id: "spring-first", kind: "drag", target: "spring-eye",
      title: "Pass the spring line to the mate first, from outside the bight",
      cue: "When the gap is a step, hand the spring line's eye to the mate on the dock — from outside the bight, over the rail, not across the gap — and see it dropped over the dock's spring cleat.",
      why: "The spring goes first because it is the line the captain can work the engines against: with the spring fast and the engine ahead on it, the whole hull walks in against the wind and lays itself along the dock, which no bow or stern line can do. It is handed, not thrown, when the gap is a step, and the deckhand stays outside the bight because the captain comes ahead on it the moment the mate has it, and the line takes its load with the deckhand's feet still wherever they were.",
      drag: { to: "dock-spring-cleat", radius: 0.6, missNote: "Not on the dock's spring cleat — the eye drops fully over the cleat before the captain comes ahead on it, not on its horn." },
    },
    {
      id: "stern-hitch", kind: "turn", target: "stern-cleat",
      title: "Make the stern line fast with a cleat hitch",
      cue: "With the spring holding and the stern set down on the fender, take the stern line to the cleat: a full turn round the base, two figure-eights, and a hitch to lock it.",
      why: "A cleat hitch holds because the load goes round the base of the cleat first and the figure-eights take the strain off the hitch; a line dropped straight into a hitch with no turn under it slips under load or jams so hard it cannot be cast off in a hurry. The stern is made fast after the spring because in a crosswind the stern is the end that sets down on the dock, and a stern line pulled tight before the spring has the hull in only pins the stern while the bow blows off.",
      turn: { turns: 1.5, label: "CLEAT HITCH", readout: (t) => (t < 0.3 ? "turn round the base" : t < 0.85 ? "figure-eights" : "hitched · locked") },
    },
    {
      id: "tend-the-spring", kind: "hold", target: "spring-tend",
      seconds: 5,
      title: "Tend the spring while the captain works the engines",
      cue: "With the spring on the cleat, tend it — a turn on the cleat, the tail in an open hand — as the captain works ahead and astern to lay the hull along the dock; take up slack, never let it surge free.",
      why: "The spring is doing the docking now: the captain works the engines against it and the hull walks in, and the deckhand's job is to keep the line just taut enough to do that — slack and the hull wanders, snatched tight and the cleat or the line takes a shock load. The turn on the cleat is what holds the load; the open hand takes up the slack and lets the line surge under control when it must, and never wraps, because a gust in the middle of this is exactly when a wrapped hand goes to the cleat.",
      holdBreakNote: "The spring surged free or was let go — the hull fell off the dock and the captain lost the spring to work against. Take the turn again and tend it.",
    },
    {
      id: "bow-line-forward", kind: "select", target: "bow-heaving-line",
      title: "Send the bow line forward to the mate",
      cue: "With the hull along the dock on the spring and the stern, send the bow line forward on the heaving line to the mate, who takes it to the dock's bow cleat.",
      why: "The bow line goes last because a bow line taken early in a crosswind pins the bow and lets the stern blow off, undoing what the spring has done; once the hull is along the dock the bow line only has to hold it there. It goes forward on the heaving line rather than by a deckhand walking the side deck with the eye, because the side deck is narrow, wet and now has two working lines across it, and the mate on the dock has the space to walk.",
    },
    {
      id: "sight-the-tension", kind: "gauge", target: "spring-tension-check",
      title: "Sight the spring tension against the captain's band",
      cue: "Sight along the spring line: not bar-taut, not hanging in the water, taking the load the captain wants for the tide and the wind. Commit the reading against the band in the standing orders.",
      why: "A mooring line is set to a tension, not a look: too tight and the first wake or tide change loads it past the cleat's or the line's strength, too slack and the hull surges along the dock and works its fenders out. The standing orders describe the band for this berth and this wind; the deckhand sights the line and commits a reading, so the captain hears 'the spring is in band' rather than 'looks fine', and so the line is adjusted now rather than found parted in the morning.",
      gauge: { label: "SPRING TENSION", speed: 0.7, green: [0.42, 0.6], readout: (t) => (t < 0.42 ? "slack — hull surging" : t <= 0.6 ? "in the captain's band" : "bar-taut — ease it"), missNote: "Outside the band — sight the line once the hull has settled against the fenders, and call it against the standing orders' band, not a guess." },
    },
    {
      id: "engines-confirmed", kind: "select", target: "helm-signal",
      title: "Confirm engines stopped with the captain before anyone crosses to the dock",
      cue: "Watch the helm signal lamp and hear the captain's word that both engines are stopped and out of gear before the gangway goes across or anyone steps onto the dock.",
      why: "The propellers under the swim platform are the last hazard of a docking and the least visible: a hull that looks fast and quiet can still have a shaft turning, and a gangway lowered or a guest stepping across with the wash running under the platform is the moment a docking hurts someone. The captain confirms the engines stopped as a spoken word on the intercom and the deck acknowledges it, and only then does the gangway move.",
    },
    {
      id: "docking-log", kind: "select", target: "docking-log",
      title: "Log the docking",
      cue: "Enter the docking in the log: the side to, the wind, the chafed spring eye and the low fender, the gust and the wake, the lines and how they are set.",
      why: "The docking log is where a chafed spring eye becomes a line replaced before it parts and a fender hung wrong becomes a word to whoever hung it, and it is where the captain finds, next season, what this berth does in this wind. The gust and the wake are logged because the next crew coming alongside here need to know that the bow sets off in a gust from that quarter and that a passing vessel's wake reaches this finger.",
    },
    {
      id: "crew-checkin", kind: "select", target: "mate-intercom",
      title: "Check in with the mate and the captain",
      cue: "On the intercom: all fast, the lines as set, the engines confirmed stopped, what you found on the walk, and how the deck crew are after the gust and the wake.",
      why: "The captain leaves the helm on the strength of the deck's word that the vessel is fast, and the mate on the dock needs to hear that the deck is done before walking away from the cleats. It is also the crew's own check-in: a docking where a gust set the bow off with the gap open and a wake hit with the spring under load is a small hard moment that a deckhand carries, and the union's member assistance line is there for what the intercom does not carry.",
    },
  ],

  interrupts: [
    {
      id: "gust-sets-bow-off",
      kind: "Gust sets the bow off the dock",
      after: "approach-callouts", delay: 2, seconds: 14,
      alert: "A gust catches the topsides and the bow starts to set off the dock — the gap at the bow is opening fast while the stern is still closing.",
      cue: "Call the captain on the deck radio: the bow is setting off, the gap forward, and stand clear of the lines while the captain works the engines.",
      target: "deck-radio",
      why: "The captain feels the gust but cannot see the bow against the dock, and a bow that sets off with the stern still closing turns a docking into a stern-first collision with the finger. The answer is to say what the deck sees — bow setting off, the gap forward — and to stand clear, because the captain's next move is engines against the wind and every line on deck may take load; the deckhand does not try to hold the bow in by hand.",
      missNote: "The bow set off with nobody calling it, the captain kept coming ahead, and the stern went into the finger dock with the deckhand between the hull and the cleat.",
      wrongNote: "The deck radio — the captain needs to hear the bow setting off and the gap forward, then works the engines; nothing on deck can hold a bow against a gust.",
    },
    {
      id: "wake-under-load",
      kind: "Passing vessel's wake hits the spring under load",
      after: "tend-the-spring", delay: 2, seconds: 14,
      alert: "A passing vessel's wake rolls into the marina — the hull lifts and drops against the dock and the stern fender is riding up over the rub rail.",
      cue: "Drop the stern fender back to the rub rail and hold it there through the wake, with the spring still on its turn.",
      target: "stern-fender",
      why: "A wake in a marina lifts a moored hull and drops it on whatever is between it and the dock, and a fender that has ridden up over the rail on the lift leaves bare gelcoat to take the drop. The deckhand's answer is the fender, not the line — the spring is already on its turn and holds — and the fender goes back to the rail with the lanyard, not with a hand between the hull and the dock.",
      missNote: "The wake dropped the hull on the dock with the stern fender up over the rail, the gelcoat took the edge of the finger, and the deckhand reached for the fender with a hand in the gap.",
      wrongNote: "The stern fender — the spring is on its turn and holds; the fender back at the rub rail is what saves the hull through the wake.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.6, YC2_ACCENT);

    // ------------------------------------------------------------ the water
    const water = box(g, 22, 0.02, 22, 2, 0.012, 0, 0xffffff, { rough: 0.15, metal: 0.35, cast: false });
    water.material = texturedMat(surfaceTexture((cx, w, h) => waterFace(cx, w, h, { base: "#0f2c38", mid: "#164556", crest: 300 }), { repeat: 4, px: 512 }), { rough: 0.15, metal: 0.35, color: 0x9fbfd0 });

    // ---------------------------------------------- the berth and the yacht
    const berth = marinaBerth(g, -1.0, 0, 0);
    const { cleats: dockCleats } = berth.userData.parts;
    holoTag(dockCleats, "dock spring cleat", 0, 0.4, 3.6, { css: YC2_CSS, w: 0.36 });
    const springSocket = group(dockCleats, 0, 0.1, 3.6);
    const springRing = torus(springSocket, 0.28, 0.012, 0, 0, 0, YC2_ACCENT, { emissive: YC2_ACCENT, ei: 1.6, rough: 0.4, cast: false, seg: 6, seg2: 28 });
    springRing.rotation.x = Math.PI / 2;
    reg(hits, springSocket, "dock-spring-cleat");
    const yacht = motorYacht(g, 3.6, -1.2, 6.5, { livery: { fleetName: "ESTUARY LADY", unitNumber: "MY-24" } });
    const P = yacht.userData.parts;
    const yachtHome = yacht.position.clone();
    const DECK = 1.25;
    const deck = group(g, 3.6, DECK, 0);
    // Stern cleat, starboard: the yacht's own part is far aft; the working cleat on the side deck is the station's.
    const sternCleat = group(deck, -2.55, 0, -3.4);
    box(sternCleat, 0.36, 0.09, 0.1, 0, 0.05, 0, 0xe4e8ec, { rough: 0.22, metal: 0.55 });
    const hitchLine = hose(sternCleat, [[-0.2, 0.08, 0.02], [0.15, 0.12, -0.03], [-0.15, 0.14, 0.03], [0.2, 0.1, -0.02]], 0.02, 0xe8dcb8, { steps: 10, rough: 0.85 });
    hitchLine.visible = false;
    holoTag(sternCleat, "stern cleat", 0, 0.4, 0, { css: YC2_CSS, w: 0.26 });
    reg(hits, sternCleat, "stern-cleat");
    // Flaked spring line on the side deck, its eye chafed, and its bight the hazard.
    const springFlake = group(deck, -2.3, 0, -0.6);
    for (let i = 0; i < 4; i++) { const c = torus(springFlake, 0.28 - i * 0.03, 0.018, 0, 0.02 + i * 0.03, 0, 0xe8dcb8, { rough: 0.85, seg: 6, seg2: 20 }); c.rotation.x = Math.PI / 2; }
    const springEye = group(springFlake, 0.35, 0.05, 0.3);
    const eyeLoop = torus(springEye, 0.14, 0.03, 0, 0, 0, 0xe8dcb8, { rough: 0.85, seg: 8, seg2: 20 });
    eyeLoop.rotation.x = Math.PI / 2;
    holoTag(springEye, "spring line eye", 0, 0.3, 0, { css: YC2_CSS, w: 0.32 });
    reg(hits, springEye, "spring-eye");
    const chafe = box(springEye, 0.12, 0.06, 0.06, 0.14, 0.02, 0, 0xa88a58, { rough: 0.95, emissive: 0x3a2a12, ei: 0.3 });
    reg(hits, chafe, "spring-chafe");
    const bightHit = box(springFlake, 0.4, 0.3, 0.4, 0, 0.2, 0, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(springFlake, "stand inside the bight?", 0, 0.7, 0, { css: "#d2312b", w: 0.46 });
    reg(hits, bightHit, "hand-in-bight");
    // Spring tend point: the turn on the yacht's spring cleat amidships.
    const tend = group(deck, -2.55, 0, 1.6);
    box(tend, 0.36, 0.09, 0.1, 0, 0.05, 0, 0xe4e8ec, { rough: 0.22, metal: 0.55 });
    const tendLine = hose(g, [[1.05, DECK + 0.1, 1.6], [0.2, 0.8, 2.6], [-0.15, 0.5, 3.6]], 0.02, 0xe8dcb8, { steps: 8, rough: 0.85 });
    tendLine.visible = false;
    holoTag(tend, "tend the spring", 0, 0.4, 0, { css: YC2_CSS, w: 0.32 });
    reg(hits, tend, "spring-tend");
    const tensionSight = instrument(deck, -2.2, 0.55, 2.4, { ry: -0.6, idle: "SIGHT · SPRING", color: YC2_ACCENT, w: 0.1, d: 0.16 });
    box(deck, 0.24, 0.5, 0.24, -2.2, 0.25, 2.4, 0x2b3138, { rough: 0.6, metal: 0.4 });
    holoTag(tensionSight, "spring tension", 0, 0.16, 0, { css: YC2_CSS, w: 0.3 });
    reg(hits, tensionSight, "spring-tension-check");
    // Fenders: the locker bundle, the rub-rail socket, the stern fender hung low.
    const fenderLocker = group(deck, -1.6, 0, -2.6);
    box(fenderLocker, 0.9, 0.45, 0.5, 0, 0.22, 0, 0xe9ebe6, { rough: 0.45, finish: "painted" });
    const bundle = group(fenderLocker, 0, 0.55, 0);
    for (const sx of [-0.25, 0, 0.25]) cyl(bundle, 0.13, 0.13, 0.5, sx, 0, 0, 0xf1f3f4, { seg: 10, rough: 0.6 });
    holoTag(fenderLocker, "fenders", 0, 0.95, 0, { css: YC2_CSS, w: 0.22 });
    reg(hits, bundle, "fender-bundle");
    const railSocket = group(g, 0.55, 0.15, -1.6);
    const railRing = torus(railSocket, 0.3, 0.012, 0, 0, 0, YC2_ACCENT, { emissive: YC2_ACCENT, ei: 1.6, rough: 0.4, cast: false, seg: 6, seg2: 28 });
    railRing.rotation.y = Math.PI / 2;
    holoTag(railSocket, "rub rail — dock side", -0.2, 0.5, 0, { css: YC2_CSS, w: 0.4 });
    reg(hits, railSocket, "rub-rail-socket");
    const hungFenders = group(g, 0.5, 0.15, 0);
    for (const z of [-1.6, 0.4, 2.4]) cyl(hungFenders, 0.16, 0.16, 0.7, 0, 0, z, 0xf1f3f4, { seg: 10, rough: 0.6 });
    hungFenders.visible = false;
    const sternFender = group(g, 0.55, -0.6, -3.4);
    cyl(sternFender, 0.16, 0.16, 0.7, 0, 0, 0, 0xf1f3f4, { seg: 10, rough: 0.6 });
    hose(sternFender, [[0, 0.35, 0], [0.1, 0.9, 0.05], [0.5, 1.8, 0.1]], 0.012, 0xe8dcb8, { steps: 6, rough: 0.85 });
    holoTag(sternFender, "stern fender", 0, 0.6, 0, { css: YC2_CSS, w: 0.26 });
    reg(hits, sternFender, "fender-hung-low");
    const sternFenderHit = box(sternFender, 0.5, 0.9, 0.5, 0, 0.9, 0, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, sternFenderHit, "stern-fender");
    // Heaving line for the bow line, coiled on the foredeck side.
    const hl = group(deck, -2.3, 0, 3.4);
    for (let i = 0; i < 4; i++) { const c = torus(hl, 0.14 - i * 0.015, 0.014, 0, 0.02 + i * 0.025, 0, 0x2f8f5a, { rough: 0.85, seg: 6, seg2: 18 }); c.rotation.x = Math.PI / 2; }
    ball(hl, 0.045, 0.2, 0.05, 0.1, 0x1f5f3a, { rough: 0.8, seg: 10, seg2: 8 });
    holoTag(hl, "heaving line — bow line forward", 0, 0.3, 0, { css: YC2_CSS, w: 0.52 });
    reg(hits, hl, "bow-heaving-line");
    const bowLineOut = hose(g, [[1.3, DECK + 0.1, 3.4], [-0.2, 1.2, 4.6], [-0.6, 0.5, 5.4]], 0.014, 0xe8dcb8, { steps: 8, rough: 0.85 });
    bowLineOut.visible = false;
    // Hazards: the jump, the wrapped hand, the surge stop.
    const jumpHit = box(deck, 0.5, 0.4, 0.5, -2.95, 0.4, -1.4, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(deck, "jump the gap?", -2.95, 0.95, -1.4, { css: "#d2312b", w: 0.32 });
    reg(hits, jumpHit, "jump-to-dock");
    const wrapHit = group(deck, -2.0, 0.6, -3.6);
    const wrapCoil = torus(wrapHit, 0.07, 0.02, 0, 0, 0, 0xe8dcb8, { rough: 0.85, seg: 6, seg2: 14 });
    void wrapCoil;
    holoTag(wrapHit, "wrap the line round a hand?", 0, 0.3, 0, { css: "#d2312b", w: 0.52 });
    reg(hits, wrapHit, "line-around-hand");
    const surgeHit = box(deck, 0.5, 0.4, 0.5, -2.3, 0.5, -4.0, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(deck, "hold the surge by hand?", -2.3, 1.0, -4.0, { css: "#d2312b", w: 0.46 });
    reg(hits, surgeHit, "surge-stop");
    // Boards, radio, intercom, helm signal, PPE.
    const brief = holoPanel(deck, 0.8, 0.54, -1.6, 1.4, -0.3, (cx, w, h) => {
      cx.fillStyle = "#0e1a26"; cx.fillRect(0, 0, w, h); cx.fillStyle = YC2_CSS; cx.fillRect(0, 0, w, 6);
      cx.font = `600 ${Math.round(h * 0.1)}px 'Barlow Condensed', Arial, sans-serif`; cx.textAlign = "left"; cx.textBaseline = "middle";
      cx.fillStyle = "#dcefff"; cx.fillText("DOCKING PLAN", w * 0.06, h * 0.13);
      cx.font = `${Math.round(h * 0.07)}px Arial, sans-serif`; cx.fillStyle = "#eef6ff";
      ["Starboard side to · wind on the beam", "First line: spring · then stern · bow last", "Mate takes the dock · deckhand calls the gap",
       "Limit for coming alongside: per standing orders", "Abort word: 'HOLD' — everyone stops", "Engines confirmed stopped before the gangway"]
        .forEach((l, i) => cx.fillText(l, w * 0.06, h * (0.28 + i * 0.115)));
    }, { ry: 0.2, accent: YC2_ACCENT });
    reg(hits, brief, "docking-brief-board");
    const callout = instrument(deck, -2.4, 0.55, 0.6, { ry: 0.4, idle: "GAP · —", color: YC2_ACCENT, w: 0.1, d: 0.16 });
    box(deck, 0.24, 0.5, 0.24, -2.4, 0.25, 0.6, 0x2b3138, { rough: 0.6, metal: 0.4 });
    holoTag(callout, "distance call-out", 0, 0.16, 0, { css: YC2_CSS, w: 0.34 });
    reg(hits, callout, "distance-callout");
    const radio = group(deck, -1.9, 1.0, 1.1);
    box(radio, 0.08, 0.2, 0.05, 0, 0, 0, 0x2b3138, { rough: 0.5 });
    cyl(radio, 0.006, 0.006, 0.14, 0, 0.17, 0, 0x15181c, { rough: 0.6, seg: 6 });
    const radioLamp = ball(radio, 0.015, 0.03, 0.06, 0.03, 0x59c97b, { emissive: 0x59c97b, ei: 1.2, seg: 6, seg2: 6 });
    holoTag(radio, "deck radio", 0, 0.34, 0, { css: YC2_CSS, w: 0.24 });
    reg(hits, radio, "deck-radio");
    const intercom = group(deck, -1.4, 1.3, 1.08);
    box(intercom, 0.16, 0.24, 0.06, 0, 0, 0, 0x2b3138, { rough: 0.5, metal: 0.4 });
    const icLamp = ball(intercom, 0.024, 0.05, 0.07, 0.035, 0x59c97b, { emissive: 0x59c97b, ei: 1.2, seg: 8, seg2: 6 });
    holoTag(intercom, "intercom — mate & captain", 0, 0.24, 0, { css: YC2_CSS, w: 0.46 });
    reg(hits, intercom, "mate-intercom");
    const helmSignal = group(deck, -0.6, 1.5, 1.08);
    box(helmSignal, 0.2, 0.14, 0.06, 0, 0, 0, 0x2b3138, { rough: 0.5 });
    const helmLamp = ball(helmSignal, 0.03, 0, 0, 0.04, 0xf0645b, { emissive: 0xf0645b, ei: 1.4, seg: 8, seg2: 6 });
    holoTag(helmSignal, "helm signal — engines", 0, 0.2, 0, { css: YC2_CSS, w: 0.42 });
    reg(hits, helmSignal, "helm-signal");
    const log = holoPanel(deck, 0.5, 0.36, 0.2, 1.4, 1.08, (cx, w, h) => {
      cx.fillStyle = "#0e1a26"; cx.fillRect(0, 0, w, h); cx.fillStyle = YC2_CSS; cx.fillRect(0, 0, w, 6);
      cx.font = `600 ${Math.round(h * 0.13)}px 'Barlow Condensed', Arial, sans-serif`; cx.textAlign = "left"; cx.textBaseline = "middle";
      cx.fillStyle = "#dcefff"; cx.fillText("DOCKING LOG", w * 0.06, h * 0.17);
      cx.font = `${Math.round(h * 0.1)}px Arial, sans-serif`; cx.fillStyle = "#eef6ff";
      ["Alongside: —", "Lines: —", "Remarks: —"].forEach((l, i) => cx.fillText(l, w * 0.06, h * (0.42 + i * 0.2)));
    }, { ry: 0, accent: YC2_ACCENT });
    reg(hits, log, "docking-log");
    const hook = group(deck, -1.0, 0, 1.0);
    cyl(hook, 0.02, 0.02, 1.4, 0, 0.7, 0, 0xc8ced4, { rough: 0.45, metal: 0.6, seg: 8 });
    const vest = group(hook, 0.16, 1.05, 0);
    box(vest, 0.24, 0.36, 0.1, 0, 0, 0, 0xf06a2b, { rough: 0.8 });
    box(vest, 0.24, 0.05, 0.11, 0, 0.06, 0, 0xdfe8ee, { rough: 0.6, emissive: 0xdfe8ee, ei: 0.3 });
    holoTag(hook, "work vest", 0.16, 1.4, 0, { css: YC2_CSS, w: 0.24 });
    reg(hits, vest, "dock-vest");
    const gloves = group(hook, -0.16, 0.95, 0.02);
    box(gloves, 0.1, 0.16, 0.04, 0, 0, 0, 0xd8a63a, { rough: 0.8 });
    box(gloves, 0.1, 0.16, 0.04, 0.05, -0.04, 0.03, 0xd8a63a, { rough: 0.8 });
    holoTag(gloves, "line gloves", -0.1, 0.3, 0, { css: YC2_CSS, w: 0.26 });
    reg(hits, gloves, "line-gloves");
    // Wind streamers on the water, shown in the gust; the wake, shown in the wake.
    const gust = group(g, -3.5, 0.03, 2.0);
    for (let i = 0; i < 6; i++) { const s = box(gust, 1.2, 0.01, 0.05, -2.5 + i * 1.0, 0, (i % 2) * 0.3, 0xcfe8ee, { rough: 0.3, emissive: 0x9fd8e8, ei: 0.5, cast: false }); s.rotation.y = 0.3; }
    gust.visible = false;
    const wake = box(g, 9, 0.012, 0.6, 3, 0.03, -6.5, 0xcfe8ee, { rough: 0.3, emissive: 0x9fd8e8, ei: 0.4, cast: false });
    wake.visible = false;

    // ------------------------------------------------------------- crew
    const mate = standingFigure(g, -1.4, 2.4, { ry: 1.2, cloth: 0x1f3a52, trousers: 0x2b3138, vest: 0xf06a2b, gloves: true });
    mate.position.y = 0.45;
    holoTag(mate, "mate — on the dock", 0, 1.9, 0, { css: YC2_CSS, w: 0.36 });
    holoTag(g, "captain — flybridge helm", 3.6, DECK + 4.4, 3.5, { css: YC2_CSS, w: 0.42 });

    const waterTex = water.material.map;

    return {
      hits,
      spawnLook: new THREE.Vector3(1.2, 1.2, -0.6),
      onStep() {},
      onStepComplete(step) {
        if (step.id === "gloves-and-vest") { vest.visible = false; gloves.visible = false; }
        if (step.id === "line-walk") { chafe.material = mat(0xe8dcb8, { rough: 0.85 }); sternFender.position.y = 0.15; }
        if (step.id === "fenders-out") { bundle.visible = false; hungFenders.visible = true; }
        if (step.id === "approach-callouts") { yacht.position.x = yachtHome.x - 0.3; repaint(callout.userData.screen, signFace("GAP · A STEP", { bg: "#0d1c24", accent: YC2_CSS, fg: "#bfeaf7", scale: 0.55 })); }
        if (step.id === "spring-first") { springEye.visible = false; tendLine.visible = true; }
        if (step.id === "stern-hitch") hitchLine.visible = true;
        if (step.id === "bow-line-forward") { hl.visible = false; bowLineOut.visible = true; }
        if (step.id === "sight-the-tension") repaint(tensionSight.userData.screen, signFace("SPRING · IN BAND", { bg: "#0d1c24", accent: YC2_CSS, fg: "#bfeaf7", scale: 0.5 }));
        if (step.id === "engines-confirmed") helmLamp.material = mat(0x59c97b, { emissive: 0x59c97b, ei: 1.4 });
        if (step.id === "docking-log") {
          repaint(log.userData.face, (cx, w, h) => {
            cx.fillStyle = "#0e1a26"; cx.fillRect(0, 0, w, h); cx.fillStyle = "#59c97b"; cx.fillRect(0, 0, w, 6);
            cx.font = `600 ${Math.round(h * 0.13)}px 'Barlow Condensed', Arial, sans-serif`; cx.textAlign = "left"; cx.textBaseline = "middle";
            cx.fillStyle = "#dcefff"; cx.fillText("DOCKING LOG", w * 0.06, h * 0.17);
            cx.font = `${Math.round(h * 0.1)}px Arial, sans-serif`; cx.fillStyle = "#e6f6ea";
            ["Alongside: starboard to · wind on the beam", "Lines: spring · stern · bow · in band", "Remarks: chafe · low fender · gust · wake"].forEach((l, i) => cx.fillText(l, w * 0.06, h * (0.42 + i * 0.2)));
          });
        }
        if (step.id === "crew-checkin") icLamp.material = mat(0x4fd1ff, { emissive: 0x4fd1ff, ei: 1.2 });
      },
      onHazard() {},
      onInterrupt(it) {
        if (it.id === "gust-sets-bow-off") { gust.visible = true; yacht.rotation.y = -0.05; yacht.position.x = yachtHome.x + 0.4; radioLamp.material = mat(0xf0645b, { emissive: 0xf0645b, ei: 1.4 }); }
        if (it.id === "wake-under-load") { wake.visible = true; sternFender.position.y = 0.75; }
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "gust-sets-bow-off") { yacht.rotation.y = 0; yacht.position.x = yachtHome.x - 0.3; radioLamp.material = mat(0x59c97b, { emissive: 0x59c97b, ei: 1.2 }); gust.rotation.y = 0.6; }
        if (it.id === "wake-under-load") { sternFender.position.y = 0.15; wake.visible = false; }
      },
      animate(t, dt, session) {
        const step = session?.step;
        if (waterTex?.offset) { waterTex.offset.x = t * 0.006; waterTex.offset.y = t * 0.005; }
        if (session?.turn && step?.id === "stern-hitch") hitchLine.visible = session.turn.amount > 0.6;
        if (gust.visible) gust.position.x = -3.5 + ((t * 0.5) % 1.0);
        if (wake.visible) wake.position.z = -6.5 + Math.sin(t * 2) * 0.8;
        void dt; void CITY; void P;
      },
    };
  },
};
