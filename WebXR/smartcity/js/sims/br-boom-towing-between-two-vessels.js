import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import { box, cyl, ball, torus, hose, group, repaint, mat } from "../../../shared/kit.js";
import {
  stationPad, holoPanel, holoTag, standingFigure, reg,
  surfaceTexture, texturedMat, waterFace,
} from "../citykit.js";
import { workboat, skiff } from "../../../shared/fleet.js";
import { fourGasMeter, radio } from "../../../shared/toolkit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Boom Towing Between Two Vessels VR — SF Bay Restoration &
// Cleanup, Pack B (vessel and marine operations).
//
// A fresh sheen is spreading across open water in the Bay, and two boats are
// towing a length of containment boom between them in a U to gather it at
// the apex for a skimmer. The learner is the Inlandboatmen's Union deckhand
// on the lead workboat's afterdeck, making the boom's tow line fast, paying
// it out and tending it on the capstan while the skiff tows the other leg.
// The boom's tow-speed limit is "the manufacturer's rating in the plan", the
// air monitoring action level is "the site safety plan's", and the response
// runs under the Area Contingency Plan and an incident command — no figure
// is invented. The workboat and the skiff are fleet.js builders; the gas
// meter and the handheld radio come from toolkit.js.

const BRBT_ACCENT = 0xf0a030;
const BRBT_CSS = "#f0a030";

export const SIM_BR_BOOM_TOWING_BETWEEN_TWO_VESSELS = {
  id: "br-boom-towing-between-two-vessels",
  index: "328",
  domain: "Maritime & Ports",
  trade: "Inlandboatmen's Union (IBU) deckhand on the lead workboat of a two-boat boom tow, with an IBU crew on the skiff towing the other leg and a MEBA engineer on watch",
  category: "Maritime & Ports",
  district: "Maritime & Ports",
  weather: "wind",
  certification: "Inlandboatmen's Union (IBU) deck and spill response practice; MEBA engineering watch; OSHA 29 CFR 1910.120 HAZWOPER for oil spill responders; EPA National Contingency Plan (40 CFR 300) and the USCG Area Contingency Plan, with discharge removal under 33 CFR 153; NIMS ICS incident command; NOAA Office of Response and Restoration spill guidance; USCG 46 CFR 25 lifesaving equipment and a lookout kept under the Inland Navigation Rules",
  name: "Boom Towing Between Two Vessels",
  title: simTitle("Boom Towing Between Two Vessels"),
  tagline: "Two boats towing boom in a U through a fresh sheen: PFD and oil-resistant gloves on, the tow plan read, the bridle and connector walked, the air read at the rail, the tow line made fast and paid out, a radio check with the skiff, the U held on the capstan through oil escaping under the apex, splash-over and a twisted section spotted, the apex buoyed for the skimmer, tension held as the skiff's outboard quits, oiled waste bagged and the tow logged",
  accent: BRBT_ACCENT,
  accentCss: BRBT_CSS,
  parSeconds: 300,
  footprint: 3.0,
  badge: { id: "the-u-held", name: "The U Held", note: "Never in the bight, never a line near the screw, no flame near the slick, no hand in the oil, and both the escaping oil and the dead outboard answered" },

  supportLine: "your union hall's member assistance programme — the Inlandboatmen's Union or MEBA — with the employer's employee assistance line behind it",

  game: system({
    name: "Boom Tow",
    currency: "SWEEP",
    ranks: ["Ordinary", "Deckhand", "Boom Hand", "Lead Deckhand", "Boom Tow Certified"],
    badges: [
      { id: "air-first", name: "Air First", note: "The air read at the rail before anyone worked near the slick", test: AWARD.stepClean("read-air") },
      { id: "apex-true", name: "Apex True", note: "LEL reading committed inside the band first time", test: AWARD.precise(0.7) },
      { id: "out-of-the-bight", name: "Out Of The Bight", note: "Never in the bight, never a line near the screw, no flame, no hand in the oil", test: AWARD.safe },
    ],
    challenges: [
      { id: "clean-sweep", name: "Clean Sweep", note: "No corrections from the plan to the log", test: AWARD.clean },
      { id: "steady-u", name: "Steady U", note: "The apex held in band all the way through the sweep", test: AWARD.unbroken },
      { id: "before-it-spreads", name: "Before It Spreads", note: "Tow logged inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "stand-in-bight": "You stepped into the bight of the tow line between the bitt and the stern. A boom under tow in a current loads its tow line hard and unevenly, and when the skiff surges or the boom snags the line straightens across the afterdeck — whoever is standing in the bight is swept with it toward the stern. The deckhand works the line from outside the bight, always.",
    "line-near-screw": "You paid the tow line out over the stern straight across the outboards. Slack tow line in the wheel wash is pulled into the propeller, and a line round the screw stops the lead boat dead with a boom full of oil astern of it and the skiff still pulling — the line is led out over the quarter, clear of the outboards, and kept taut.",
    "open-flame": "You reached for a lighter on the afterdeck with a fresh slick alongside. Light ends evaporating off a new spill can put the air at the rail inside its flammable range, and the air monitoring the plan asks for exists because that cannot be seen or smelled reliably — there is no flame and no smoking on a response vessel working a fresh slick.",
    "hand-in-oil": "You leaned over the stern to grab the boom skirt with your hands. The skirt is coated in fresh product and hangs under a boom being dragged through the water; a hand on it is a hand in oil and a body leaning past the stern of a moving boat — the boom is handled with the tow line and the boat hook, and oiled gear with gloves only.",
  },

  lateNotes: {
    "capstan-control": "The U is held on the capstan once the tow line is made fast, paid out and the skiff has answered the radio check — not before.",
    "gas-meter": "The air is read once the tow gear has been walked and before anyone goes to the rail beside the slick.",
    "tow-log": "The tow is logged once the apex is buoyed, the tension held through the skimmer's pass and the oiled waste bagged — last, not first.",
  },

  steps: [
    {
      id: "pfd-and-gloves", kind: "sequence", anyOrder: true,
      targets: ["boom-vest", "oil-gloves"],
      itemNames: { "boom-vest": "work vest (PFD) on and fastened", "oil-gloves": "oil-resistant gloves over liners" },
      title: "PFD and oil-resistant gloves on at the wheelhouse door",
      cue: "At the wheelhouse door, before stepping onto the afterdeck: work vest on and fastened, oil-resistant gloves on over liners.",
      why: "The afterdeck of a boom-towing boat is low, wet and slick with product by the end of the job, and the tow line on it can move fast. The work vest is on before the deck because a fall over the stern into oiled water is the moment it is for; the oil-resistant gloves go on before anything is touched, because fresh crude or diesel on skin is an exposure HAZWOPER training treats as seriously as any other.",
    },
    {
      id: "tow-plan", kind: "select", target: "tow-plan",
      title: "Read the tow plan with the master",
      cue: "Read the plan: the U configuration and the tow-line lengths, the boom's tow-speed limit, the working channel and stop signals, the skimmer's approach, and the air monitoring action level.",
      why: "Two boats towing one boom are one machine with two drivers, and the plan is where they agree how long each leg is, how fast the U can be towed before oil escapes under it, and what the signal is to stop. The boom's tow-speed rating is in the plan because it is low and easy to exceed, and the air monitoring action level is in it because the first boats into a fresh slick are working in whatever it is giving off.",
    },
    {
      id: "gear-walk", kind: "find", noHint: true,
      targets: ["connector-unlatched", "bridle-chafe"],
      itemNames: { "connector-unlatched": "boom end connector with its locking pin missing", "bridle-chafe": "tow bridle chafed through its cover" },
      itemNotes: {
        "connector-unlatched": "The end connector joining the tow bridle to the first boom section has no locking pin — under tow the two halves can slide apart and the boom's end goes free.",
        "bridle-chafe": "One leg of the tow bridle has worn through its cover where it rubs the connector — the bridle takes the whole pull of the boom, and a chafed leg is where it parts.",
      },
      title: "Walk the tow bridle and the end connector",
      cue: "Walk the boom's end on deck before it goes over: the end connector locked and pinned, the tow bridle's legs, shackles and thimbles.",
      why: "The whole pull of a boom full of oil comes through its end connector and tow bridle, and they fail where people did not look: a connector not pinned slides apart, a chafed bridle leg parts, and the boom's end is loose in the current with the oil following it. They are walked on deck because once the boom is streamed, nobody on the tow boat can reach them.",
    },
    {
      id: "read-air", kind: "gauge", target: "gas-meter",
      title: "Read the air at the rail before working near the slick",
      cue: "Hold the gas meter at the stern rail on the slick side and commit the LEL reading once it has steadied, against the action level in the site safety plan.",
      why: "A fresh slick gives off its light ends fastest in the first hours, and the afterdeck of the lead boat is often downwind of it and only a metre above it. The LEL reading at the rail says whether the air there is inside the plan's limits before anyone works at the stern — above them, the boat repositions upwind before the deck does anything else.",
      gauge: { label: "LEL AT THE RAIL", speed: 0.72, green: [0.14, 0.34], readout: (t) => (t < 0.14 ? "not steadied — wait" : t <= 0.34 ? "under the action level" : "at or over the action level — reposition"), missNote: "Outside the band — let the meter steady at the rail before reading it, and read it against the plan's action level." },
    },
    {
      id: "make-fast", kind: "turn", target: "tow-bitt",
      title: "Make the tow line fast on the tow bitt",
      cue: "Take turns of the boom's tow line round the tow bitt and finish with figure-eights, so it holds without anyone holding it.",
      why: "The tow line will carry the lead boat's share of the boom's drag for the whole sweep, and it has to hold on the bitt without a hand on it — a deckhand holding a tow line is a deckhand in the bight. Turns and figure-eights make it fast and still leave it able to be surged or slipped from outside the bight if the master calls for it.",
      turn: { turns: 1.5, label: "TOW BITT", readout: (t) => (t < 0.4 ? "first turn on" : t < 0.95 ? "figure-eights going on" : "made fast") },
    },
    {
      id: "pay-out", kind: "hold", target: "tow-line", seconds: 5,
      title: "Pay out the tow line over the quarter as the boom streams",
      cue: "Pay the tow line out over the quarter — clear of the outboards — as the boom streams astern, keeping it taut and your hands outside the bight.",
      why: "The tow line goes out over the quarter, not the stern, so that it never crosses the outboards' wash while it is slack. It is paid out steadily and kept taut, because a loose tow line in a current sinks, snags the boom's skirt or finds the propeller, and the deckhand stays outside the bight the whole time in case the skiff surges ahead.",
      holdBreakNote: "Let go of the tow line as it was paying out — it went slack toward the outboards. Take it up again and pay it out steady.",
    },
    {
      id: "radio-check", kind: "select", target: "vhf-handheld",
      title: "Radio check with the skiff on the working channel",
      cue: "On the handheld, raise the skiff on the working channel: confirm the U is set, the tow speed, and the stop signal.",
      why: "The two boats towing a U cannot see each other's decks, and the U only keeps its shape if they move as one: same speed, same heading, same moment to turn or stop. The radio check before the sweep proves the channel works and puts the stop signal in both crews' heads, so the first time they need it is not the first time they use it.",
    },
    {
      id: "hold-u", kind: "track", target: "capstan-control", seconds: 6,
      title: "Hold the U on the capstan as the sweep begins",
      cue: "Tend the tow line on the capstan to hold the apex opening in band as both boats come ahead together into the slick.",
      why: "The U gathers oil only while its apex is open and the boom stays upright: too much line and the U flattens and oil runs round the ends; too little and the legs close and the apex is dragged too fast. Tending the line on the capstan keeps the lead leg matched to the skiff's, and the tension in the line is the deckhand's best measure of whether the boom is being towed within its rating.",
      track: { start: 0.14, green: [0.42, 0.6], rise: 0.58, fall: 0.44, drift: 0.13, label: "APEX OPENING", readout: (v) => (v < 0.42 ? "U flattening — oil round the ends" : v > 0.6 ? "legs closing — apex dragged" : "apex open — gathering") },
      holdBreakNote: "The apex fell out of band — the U flattened or the legs closed. Bring the line back on the capstan and hold it.",
    },
    {
      id: "apex-watch", kind: "find", noHint: true,
      targets: ["splash-over", "boom-twist"],
      itemNames: { "splash-over": "chop splashing over the boom at the apex", "boom-twist": "a boom section rolled flat with its skirt twisted" },
      itemNotes: {
        "splash-over": "The chop at the apex is breaking over the boom's float and carrying oil over the top with it — the U is too tight or the tow too fast for this sea.",
        "boom-twist": "One section on the lead leg has rolled flat, its skirt twisted up out of the water — oil goes under it, and it will not right itself under tow.",
      },
      title: "Watch the boom for where it is losing oil",
      cue: "Look along both legs to the apex: the float riding upright, the skirt down, and nothing going over or under the boom.",
      why: "A boom loses oil in ways that are visible if someone is looking: over the top when chop splashes across a tight apex, under it when the tow is too fast, and past it where a section has rolled and its skirt twisted. The deckhand is the only person placed to see the boom along its whole length, and what they see decides whether the master slows, opens the U or stops to fix a section.",
    },
    {
      id: "buoy-apex", kind: "drag", target: "marker-buoy",
      title: "Mark the apex with the buoy for the skimmer",
      cue: "Drop the marker buoy on its line so it rides at the apex, where the skimmer will come in to work the gathered oil.",
      why: "The skimmer works the thickest oil, and that is at the apex; the buoy marks it for a skimmer operator approaching low on the water who cannot see the boom's shape the way the tow boats can. It goes in on its own line, from inside the rail, so nobody leans out to place it.",
      drag: { to: "apex-point", radius: 0.7, missNote: "Not at the apex — the buoy has to ride where the boom's legs meet, or the skimmer works the thin oil at the side." },
    },
    {
      id: "hold-tension", kind: "hold", target: "capstan-control", seconds: 5,
      title: "Hold tension while the skimmer works the apex",
      cue: "Hold the tow line steady on the capstan while the skimmer works the apex, so the U stays open and still under it.",
      why: "A skimmer working the apex needs the boom still and open around it; any surge on the tow line changes the apex under the skimmer head and spills what has been gathered. Holding the line steady through the skimmer's pass is slow, dull work that decides how much of the oil actually comes out of the water.",
      holdBreakNote: "Let the tow line surge while the skimmer was working — the apex shifted under it. Take it up again and hold it steady.",
    },
    {
      id: "bag-waste", kind: "sequence", anyOrder: true,
      targets: ["oiled-sorbent", "waste-drum"],
      itemNames: { "oiled-sorbent": "oiled sorbent pads and outer gloves bagged", "waste-drum": "bag into the lidded oily-waste drum" },
      title: "Bag the oiled sorbents and gloves into the waste drum",
      cue: "Bag the oiled sorbent pads and your outer gloves, and put the bag in the lidded oily-waste drum on deck.",
      why: "Every oiled pad and glove on the afterdeck is product that can go over the side again or onto the next person's hands, and the response's waste has to be tracked to its disposal. Bagging it into the lidded drum keeps it on the boat and counted, and changing the outer gloves before going aft keeps the oil off the wheelhouse.",
    },
    {
      id: "tow-log", kind: "select", target: "tow-log",
      title: "Log the tow and what the boom lost",
      cue: "Log the tow: the air readings, the unpinned connector and the chafed bridle, the oil lost under the apex, the splash-over and the twisted section, and the skiff's dead outboard.",
      why: "The tow log feeds the incident command's picture of what the boom recovered and what it lost, and it is where a chafed bridle becomes a replacement before the next sweep. The escaping oil and the dead outboard go in because they changed how the sweep went, and the next crew working this boom needs to know both happened.",
    },
    {
      id: "crew-checkin", kind: "select", target: "wheelhouse-intercom",
      title: "Check in with the master, the skiff and the engineer",
      cue: "On the intercom and the handheld: the tow line is fast and the boom holding, the gear defects, and how everyone is after oil going under the apex and the skiff going dead in the water.",
      why: "The master and the skiff crew towed the U blind to each other's decks, and the engineer may be asked to go across to the skiff's outboard — each needs the deck's report now. It is also the crew's own check-in: working hours in fumes beside a spreading slick takes it out of people, and the union's member assistance line is there for what does not get said on the radio.",
    },
  ],

  interrupts: [
    {
      id: "oil-under-apex",
      kind: "Oil escaping under the apex",
      after: "hold-u", delay: 2, seconds: 14,
      alert: "A dark streak is trailing out behind the apex — oil is being dragged under the boom's skirt as both boats come ahead.",
      cue: "Call the master on the wheelhouse intercom to slow the tow, and have the skiff told to slow with you.",
      target: "wheelhouse-intercom",
      why: "Oil going under the apex means the U is being towed faster than the boom can hold it; the current under the skirt is carrying the oil down and out. Only slowing both boats together fixes it, and the master has to hear it from the deck, because from the wheelhouse the boom looks the same whether it is holding oil or losing it.",
      missNote: "The tow carried on at the same speed; the streak behind the apex became a second slick drifting away on the ebb, outside any boom.",
      wrongNote: "The wheelhouse intercom — the master has to slow the tow, and the skiff with it, before more oil goes under.",
    },
    {
      id: "skiff-outboard-quits",
      kind: "Skiff dead in the water",
      after: "hold-tension", delay: 2, seconds: 14,
      alert: "The skiff's outboard has quit — she is stopping, her leg of the boom is going slack and the U is starting to fold toward the workboat.",
      cue: "Raise the skiff on the handheld: tell them to get their anchor ready and hold, while the lead boat eases off to keep the boom from folding.",
      target: "vhf-handheld",
      why: "A two-boat tow with one boat dead turns into a boom wrapping round the stopped boat and a tow line pulling the other one sideways. The skiff has to hear from the lead boat at once — anchor ready, hold position — so the two crews act together while the master eases off, rather than each doing something different with a boom full of oil between them.",
      missNote: "Nobody called the skiff; her crew tried to restart the outboard while the lead boat kept towing, and the boom folded back over the skiff's stern and round her outboard leg.",
      wrongNote: "The handheld to the skiff — they need to hear what to do now, from the boat they are towing with.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 3.0, BRBT_ACCENT);

    // ------------------------------------------------------------ the water
    const water = box(g, 24, 0.02, 22, 0, 0.04, 0, 0xffffff, { rough: 0.12, metal: 0.25, cast: false });
    water.material = texturedMat(surfaceTexture((cx, w, h) => waterFace(cx, w, h, { base: "#12303a", mid: "#1a4250" }), { repeat: 5, px: 512 }), { rough: 0.12, metal: 0.25, color: 0xa8ccd8 });
    const slick = box(g, 3.2, 0.01, 1.6, 2.3, 0.055, 3.9, 0x1a1a22, { rough: 0.05, metal: 0.9, emissive: 0x2a2a4a, ei: 0.25, cast: false });
    slick.rotation.y = 0.1;
    const streak = box(g, 0.8, 0.01, 2.4, 2.5, 0.056, 6.8, 0x14141c, { rough: 0.05, metal: 0.9, emissive: 0x2a2a4a, ei: 0.25, cast: false });
    streak.visible = false;

    // --------------------- the lead workboat, stern to the U, deck at 0.41
    const DECK = 0.41;
    const wb = workboat(g, 0, -0.79, -2.5, { ry: Math.PI, livery: { fleetName: "BAY RESPONSE", unitNumber: "WB-2" } });
    void wb;

    // ------------------------------------------------ the boom and its lines
    const U = [[-1.3, 0.12, 2.6], [-1.0, 0.12, 4.0], [0.2, 0.12, 5.1], [2.5, 0.12, 5.7], [4.8, 0.12, 5.1], [5.8, 0.12, 3.9], [5.9, 0.12, 2.4]];
    const boomFloat = hose(g, U, 0.13, 0xf2c14b, { steps: 40, rough: 0.6 });
    const boomSkirt = hose(g, U.map(([x, , z]) => [x, 0.02, z]), 0.05, 0xe0592a, { steps: 30, rough: 0.7 });
    void boomSkirt;
    const towLine = hose(g, [[-0.7, DECK + 0.3, 0.8], [-0.95, 0.55, 1.5], [-1.3, 0.2, 2.6]], 0.02, 0xe8dcb8, { steps: 10, rough: 0.85 });
    towLine.visible = false;
    const skiffLine = hose(g, [[6.0, 0.55, 0.3], [5.95, 0.3, 1.4], [5.9, 0.2, 2.4]], 0.02, 0xe8dcb8, { steps: 8, rough: 0.85 });
    const splash = box(g, 0.5, 0.18, 0.2, 2.5, 0.28, 5.75, 0xe8f6fa, { rough: 0.3, emissive: 0xa0d8e8, ei: 0.4 });
    reg(hits, splash, "splash-over");
    const twist = box(g, 0.5, 0.12, 0.3, -0.6, 0.2, 4.6, 0xe0592a, { rough: 0.7, emissive: 0x4a1a08, ei: 0.3 });
    twist.rotation.z = 1.2;
    reg(hits, twist, "boom-twist");
    const apex = group(g, 2.5, 0.1, 5.35);
    const apexRing = torus(apex, 0.35, 0.012, 0, 0.05, 0, BRBT_ACCENT, { emissive: BRBT_ACCENT, ei: 1.6, rough: 0.4, cast: false, seg: 6, seg2: 24 });
    apexRing.rotation.x = Math.PI / 2;
    holoTag(apex, "apex", 0, 0.45, 0, { css: BRBT_CSS, w: 0.14 });
    reg(hits, apex, "apex-point");

    // ----------------------------------------- the boom's end on deck, bitt
    const end = group(g, -0.45, DECK, 0.75);
    box(end, 0.26, 0.14, 0.2, 0, 0.07, 0, 0x8a949d, { rough: 0.4, metal: 0.7 });
    const pinHole = box(end, 0.04, 0.05, 0.22, 0.08, 0.1, 0, 0xd2312b, { rough: 0.4, emissive: 0x4a0808, ei: 0.4 });
    reg(hits, pinHole, "connector-unlatched");
    const bridle = group(end, 0, 0, 0);
    hose(bridle, [[0, 0.1, -0.1], [-0.15, 0.06, -0.45], [-0.25, 0.1, -0.2]], 0.018, 0xe8dcb8, { steps: 8, rough: 0.85 });
    const chafe = box(bridle, 0.08, 0.05, 0.08, -0.15, 0.07, -0.44, 0xa88a58, { rough: 0.95, emissive: 0x3a2a12, ei: 0.3 });
    reg(hits, chafe, "bridle-chafe");
    holoTag(end, "boom end connector", 0, 0.32, 0, { css: BRBT_CSS, w: 0.34 });
    const bitt = group(g, -0.7, DECK, 0.85);
    for (const dz of [-0.12, 0.12]) cyl(bitt, 0.06, 0.07, 0.34, 0, 0.17, dz, 0x2b3138, { rough: 0.6, metal: 0.5, seg: 12 });
    const bittTurns = torus(bitt, 0.1, 0.018, 0, 0.2, 0, 0xe8dcb8, { rough: 0.85, seg: 6, seg2: 16 });
    bittTurns.rotation.x = Math.PI / 2; bittTurns.visible = false;
    holoTag(bitt, "tow bitt", 0, 0.5, 0, { css: BRBT_CSS, w: 0.18 });
    reg(hits, bitt, "tow-bitt");
    const coil = group(g, 0.05, DECK, 0.55);
    for (let i = 0; i < 3; i++) torus(coil, 0.16 - i * 0.03, 0.018, 0, 0.02 + i * 0.03, 0, 0xe8dcb8, { rough: 0.85, seg: 6, seg2: 18 }).rotation.x = Math.PI / 2;
    holoTag(coil, "tow line", 0, 0.3, 0, { css: BRBT_CSS, w: 0.18 });
    reg(hits, coil, "tow-line");

    // --------------------------------------------- capstan, meter, radios
    const cap = group(g, 0.75, DECK, 0.2);
    cyl(cap, 0.14, 0.18, 0.4, 0, 0.2, 0, 0x2f4f6f, { rough: 0.55, metal: 0.4, seg: 14 });
    const drum = cyl(cap, 0.11, 0.11, 0.24, 0, 0.52, 0, 0x8a949d, { rough: 0.4, metal: 0.7, seg: 14 });
    const capLever = group(cap, 0.2, 0.42, 0);
    box(capLever, 0.02, 0.26, 0.02, 0, 0.13, 0, 0xd2312b, { rough: 0.5 });
    holoTag(cap, "capstan", 0, 0.9, 0, { css: BRBT_CSS, w: 0.18 });
    reg(hits, cap, "capstan-control");
    const meterPost = group(g, 1.05, DECK, -0.5);
    cyl(meterPost, 0.02, 0.02, 0.95, 0, 0.47, 0, 0x8a949d, { rough: 0.45, metal: 0.7, seg: 8 });
    const meter = fourGasMeter(meterPost, 0, 0.98, 0, { ry: -0.4 });
    holoTag(meterPost, "gas meter — LEL", 0, 1.3, 0, { css: BRBT_CSS, w: 0.28 });
    reg(hits, meterPost, "gas-meter");
    const vhf = radio(g, -0.4, DECK + 1.0, -1.95, { ry: 0 });
    holoTag(g, "VHF handheld", -0.4, DECK + 1.35, -1.93, { css: BRBT_CSS, w: 0.26 });
    reg(hits, vhf, "vhf-handheld");
    const icom = group(g, 0.3, DECK, -0.95);
    cyl(icom, 0.022, 0.022, 1.0, 0, 0.5, 0, 0x8a949d, { rough: 0.45, metal: 0.7, seg: 8 });
    box(icom, 0.14, 0.2, 0.08, 0, 1.08, 0, 0x2b3138, { rough: 0.5, metal: 0.4 });
    const whLamp = box(icom, 0.04, 0.04, 0.02, 0, 1.15, 0.045, 0x59c97b, { emissive: 0x59c97b, ei: 1.0 });
    holoTag(icom, "wheelhouse intercom", 0, 1.32, 0, { css: BRBT_CSS, w: 0.36 });
    reg(hits, icom, "wheelhouse-intercom");

    // ------------------------------------------ buoy, waste, PPE, boards
    const buoy = group(g, 0.95, DECK, 0.85);
    cyl(buoy, 0.12, 0.14, 0.3, 0, 0.15, 0, 0xe0592a, { rough: 0.5, seg: 12 });
    cyl(buoy, 0.015, 0.015, 0.5, 0, 0.5, 0, 0x8a949d, { rough: 0.4, metal: 0.7, seg: 6 });
    holoTag(buoy, "marker buoy", 0, 0.9, 0, { css: BRBT_CSS, w: 0.24 });
    reg(hits, buoy, "marker-buoy");
    const drumW = group(g, -0.5, DECK, -0.15);
    cyl(drumW, 0.2, 0.2, 0.55, 0, 0.27, 0, 0x2b3138, { rough: 0.6, metal: 0.3, seg: 14 });
    const drumLid = cyl(drumW, 0.21, 0.21, 0.03, 0.15, 0.58, 0.1, 0xf2c14b, { rough: 0.5, seg: 14 });
    drumLid.rotation.z = 0.6;
    holoTag(drumW, "oily-waste drum", 0, 0.85, 0, { css: BRBT_CSS, w: 0.3 });
    reg(hits, drumW, "waste-drum");
    const pads = box(g, 0.4, 0.04, 0.3, 0.55, DECK + 0.02, -0.35, 0x2a2622, { rough: 0.95 });
    holoTag(g, "oiled sorbents", 0.55, DECK + 0.25, -0.35, { css: BRBT_CSS, w: 0.26 });
    reg(hits, pads, "oiled-sorbent");
    const rack = group(g, -0.95, DECK, -1.5);
    cyl(rack, 0.022, 0.022, 1.3, 0, 0.65, 0, 0x8a949d, { rough: 0.45, metal: 0.7, seg: 8 });
    const vest = group(rack, 0, 1.0, 0.07);
    box(vest, 0.26, 0.4, 0.1, 0, 0, 0, 0xf06a2b, { rough: 0.8 });
    box(vest, 0.26, 0.05, 0.11, 0, 0.08, 0, 0xdfe8ee, { rough: 0.6, emissive: 0xdfe8ee, ei: 0.3 });
    holoTag(rack, "work vest — PFD", 0, 1.45, 0, { css: BRBT_CSS, w: 0.3 });
    reg(hits, vest, "boom-vest");
    const gloves = box(g, 0.18, 0.05, 0.12, -0.45, DECK + 0.02, -1.55, 0x2f7a4a, { rough: 0.9 });
    holoTag(g, "oil-resistant gloves", -0.45, DECK + 0.25, -1.55, { css: BRBT_CSS, w: 0.34 });
    reg(hits, gloves, "oil-gloves");
    const drawPlan = (cx, w, h, done) => {
      cx.fillStyle = "#1a1206"; cx.fillRect(0, 0, w, h); cx.fillStyle = done ? "#59c97b" : BRBT_CSS; cx.fillRect(0, 0, w, 6);
      cx.font = `600 ${Math.round(h * 0.1)}px 'Barlow Condensed', Arial, sans-serif`; cx.textAlign = "left"; cx.textBaseline = "middle";
      cx.fillStyle = "#f6ead2"; cx.fillText("TOW PLAN — U BOOM", w * 0.05, h * 0.12);
      cx.font = `${Math.round(h * 0.066)}px Arial, sans-serif`; cx.fillStyle = "#fbf3e2";
      ["Configuration: U, lead boat and skiff", "Tow lines: lengths per the plan", "Tow speed: boom maker's rating",
        "Channel: working channel, stop as agreed", "Skimmer: works the buoyed apex", "Air: LEL action level, site safety plan",
        "Command: incident command post, ICS"].forEach((l, i) => cx.fillText(l, w * 0.05, h * (0.26 + i * 0.105)));
    };
    const plan = holoPanel(g, 0.76, 0.52, -1.05, 1.65, -1.75, (cx, w, h) => drawPlan(cx, w, h, false), { ry: 0.5, accent: BRBT_ACCENT });
    reg(hits, plan, "tow-plan");
    const drawLog = (cx, w, h, rows, done) => {
      cx.fillStyle = "#1a1206"; cx.fillRect(0, 0, w, h); cx.fillStyle = done ? "#59c97b" : BRBT_CSS; cx.fillRect(0, 0, w, 6);
      cx.font = `600 ${Math.round(h * 0.12)}px 'Barlow Condensed', Arial, sans-serif`; cx.textAlign = "left"; cx.textBaseline = "middle";
      cx.fillStyle = "#f6ead2"; cx.fillText("TOW LOG", w * 0.06, h * 0.15);
      cx.font = `${Math.round(h * 0.082)}px Arial, sans-serif`; cx.fillStyle = done ? "#e6f6ea" : "#fbf3e2";
      rows.forEach((l, i) => cx.fillText(l, w * 0.06, h * (0.36 + i * 0.16)));
    };
    const tlog = holoPanel(g, 0.64, 0.46, 1.05, 1.65, -1.75, (cx, w, h) => drawLog(cx, w, h, ["Sweep: —", "Gear: —", "Losses: —", "Remarks: —"], false), { ry: -0.5, accent: BRBT_ACCENT });
    reg(hits, tlog, "tow-log");

    // -------------------------------------------------- hazard targets
    const bightHit = box(g, 0.4, 0.5, 0.5, -0.4, DECK + 0.3, 1.2, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "step into the bight?", -0.35, DECK + 0.7, 1.25, { css: "#d2312b", w: 0.36 });
    reg(hits, bightHit, "stand-in-bight");
    const screwHit = box(g, 0.6, 0.5, 0.5, 0.25, 0.55, 1.75, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "pay out over the outboards?", 0.3, 1.0, 1.85, { css: "#d2312b", w: 0.48 });
    reg(hits, screwHit, "line-near-screw");
    const lighter = box(g, 0.03, 0.07, 0.02, 1.0, DECK + 0.5, -1.2, 0xd2312b, { rough: 0.4 });
    box(g, 0.34, 0.46, 0.3, 1.0, DECK + 0.23, -1.2, 0x2f4f6f, { rough: 0.55, metal: 0.3 });
    holoTag(g, "light up on deck?", 1.0, DECK + 0.75, -1.2, { css: "#d2312b", w: 0.3 });
    reg(hits, lighter, "open-flame");
    const skirtHit = box(g, 0.5, 0.4, 0.6, -1.35, 0.35, 2.1, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "grab the boom skirt by hand?", -1.35, 0.8, 2.1, { css: "#d2312b", w: 0.48 });
    reg(hits, skirtHit, "hand-in-oil");

    // ------------------------------------------------- the skiff, the crew
    const sk = skiff(g, 6.0, -0.3, -2.6, { ry: Math.PI, livery: { fleetName: "BAY RESPONSE", unitNumber: "SK-4" } });
    const skHand = standingFigure(sk, 0, -0.9, { ry: Math.PI, vest: 0xf06a2b, helmet: 0xf1f3f4, gloves: true, atStation: true });
    skHand.position.y = 0.8;
    holoTag(sk, "IBU skiff — second leg", 0, 2.7, -0.9, { css: BRBT_CSS, w: 0.38 });
    const skHome = sk.position.clone();
    const deckhand = standingFigure(g, 0.55, -1.5, { ry: 0.4, vest: 0xf06a2b, helmet: 0xf1f3f4, gloves: true, atStation: true });
    deckhand.position.y = DECK;
    holoTag(deckhand, "second deckhand", 0, 1.95, 0, { css: BRBT_CSS, w: 0.3 });

    const waterTex = water.material.map;
    const skiffLeg = U.slice();
    void skiffLeg;
    return {
      hits,
      spawnLook: new THREE.Vector3(1.5, 0.4, 3.5),
      onStep() {},
      onStepComplete(step) {
        if (step.id === "gear-walk") { pinHole.material = mat(0x8a949d, { rough: 0.4, metal: 0.7 }); chafe.material = mat(0xe8dcb8, { rough: 0.85 }); }
        if (step.id === "read-air") meter.userData.show?.("O2  20.9\nLEL    3\nCO     2\nH2S  0.0");
        if (step.id === "make-fast") bittTurns.visible = true;
        if (step.id === "pay-out") { towLine.visible = true; end.visible = false; coil.scale.set(0.6, 1, 0.6); }
        if (step.id === "apex-watch") { twist.rotation.z = 0; twist.material = mat(0xf2c14b, { rough: 0.6 }); }
        if (step.id === "buoy-apex") { buoy.position.set(2.5, 0.05, 5.35); }
        if (step.id === "hold-tension") slick.scale.set(0.5, 1, 0.5);
        if (step.id === "bag-waste") { pads.visible = false; drumLid.rotation.z = 0; drumLid.position.set(0, 0.56, 0); }
        if (step.id === "tow-log") {
          repaint(tlog.userData.face, (cx, w, h) => drawLog(cx, w, h, ["Sweep: U held · apex buoyed", "Gear: connector pin, bridle chafe", "Losses: under apex, splash-over", "Remarks: skiff outboard quit"], true));
          repaint(plan.userData.face, (cx, w, h) => drawPlan(cx, w, h, true));
        }
        if (step.id === "crew-checkin") whLamp.material = mat(0x4fd1ff, { emissive: 0x4fd1ff, ei: 1.2 });
      },
      onHazard() {},
      onInterrupt(it) {
        if (it.id === "oil-under-apex") { streak.visible = true; whLamp.material = mat(0xf2c14b, { emissive: 0xf2c14b, ei: 1.3 }); }
        if (it.id === "skiff-outboard-quits") { sk.position.set(skHome.x - 0.8, skHome.y, skHome.z + 1.2); sk.rotation.y = Math.PI - 0.5; boomFloat.material = mat(0xc89a2e, { rough: 0.7 }); }
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "oil-under-apex") { streak.scale.set(0.4, 1, 0.4); streak.position.z = 7.4; whLamp.material = mat(0x59c97b, { emissive: 0x59c97b, ei: 1.0 }); }
        if (it.id === "skiff-outboard-quits") { vhf.userData.show?.("CH WORK\nANCHOR"); sk.rotation.y = Math.PI - 0.2; boomFloat.material = mat(0xf2c14b, { rough: 0.6 }); }
      },
      animate(t, dt, session) {
        const step = session?.step;
        if (waterTex?.offset) { waterTex.offset.x = t * 0.004; waterTex.offset.y = t * 0.006; }
        const gg = session?.gauge;
        if (gg && !gg.committed && step?.id === "read-air") meter.userData.show?.(`O2  20.9\nLEL  ${Math.round(gg.t * 20)}\nCO     2\nH2S  0.0`);
        if (session?.turn && step?.id === "make-fast") bittTurns.visible = session.turn.amount > 0.3;
        if ((step?.id === "hold-u" || step?.id === "hold-tension") && session.holding) { drum.rotation.y += (dt ?? 0.016) * 2; capLever.rotation.z = -0.4 * (session.track?.v ?? 0.5); }
        if (streak.visible) streak.position.x = 2.5 + Math.sin(t * 0.7) * 0.1;
      },
    };
  },
};
