import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import { box, cyl, ball, torus, hose, group, decal, repaint, signFace, paperFace, mat } from "../../../shared/kit.js";
import {
  CITY, stationPad, holoPanel, holoTag, toolChest, instrument, cone, barrierPanel,
  standingFigure, reg, surfaceTexture, texturedMat, deckPlateFace, paintedSteelFace,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Tower Climb & Tie-Off VR — Construction & Structural Trades,
// the Bay Area bridge pack, on the golden-gate-deck district.
//
// The climb from the deck up a tower leg to a transfer platform: a ladder
// with a vertical lifeline and a rope grab, then the moment the climber
// leaves that system for the platform's own anchor. The whole lesson is the
// transfer — a twin-leg lanyard means one leg is always on something rated,
// and the climber who unclips both "for a second" has no fall protection for
// that second, over a deck with the strait beyond it. The tower in the scene
// is the district's, painted International Orange; the leg the crew climbs
// here is the station's own mock-up of one cell of it, sited generically.

const GGT_ACCENT = 0xe0662e;
const GGT_ORANGE = 0xc8461d;

export const SIM_GG_TOWER_CLIMB_AND_TIE_OFF = {
  id: "gg-tower-climb-and-tie-off",
  index: "225",
  domain: "Construction",
  trade: "Ironworkers — bridge ironworker on the tower, trained through the Ironworkers' IMPACT programme, with the crew's rescue attendant on the deck",
  category: "Construction & Structural Trades",
  district: "golden-gate-deck",
  certification: "Ironworkers and IMPACT bridge crew training; OSHA 29 CFR 1926 Subpart M fall protection, including 29 CFR 1926.501 and 29 CFR 1926.502 for the anchorage, the lanyard and the rope grab; ANSI/ASSP Z359 for the harness, the twin-leg lanyard and the vertical lifeline; 29 CFR 1926 Subpart R where the tower work is ironwork; 29 CFR 1926.106 for work over water; the owner's climbing and rescue plan",
  name: "Tower Climb & Tie-Off",
  title: simTitle("Tower Climb & Tie-Off"),
  tagline: "Up a tower leg on a rope grab and across to the platform on a twin-leg lanyard: the permit and the rescue plan read, the wind taken, the climb held steady through a gust, one leg always clipped at the transfer, the tools hauled up in a tethered bucket while the fog comes in, a beam clamp set for the next crew, and the climb logged",
  accent: GGT_ACCENT,
  accentCss: "#e0662e",
  parSeconds: 300,
  footprint: 2.8,
  badge: { id: "always-on-something", name: "Always On Something", note: "Up the ladder, across the transfer and onto the platform without a moment when neither lanyard leg was on a rated anchor" },

  supportLine: "the Ironworkers' member assistance programme through your local, and the crew's own peer-support contact",

  game: system({
    name: "Tower Crew",
    currency: "RIVET",
    ranks: ["Deck Hand", "Tower Climber", "Transfer Qualified", "Lead Climber", "Tower Crew Certified"],
    badges: [
      { id: "one-leg-live", name: "One Leg Live", note: "The transfer made with one lanyard leg always connected", test: AWARD.stepClean("transfer") },
      { id: "steady-grab", name: "Steady Grab", note: "Rope grab held above the D-ring the whole climb", test: AWARD.precise(0.72) },
      { id: "nothing-dropped", name: "Nothing Dropped", note: "No unsafe action from the deck to the platform and back to the log", test: AWARD.safe },
    ],
    challenges: [
      { id: "clean-climb", name: "Clean Climb", note: "No corrections anywhere in the climb", test: AWARD.clean },
      { id: "unbroken-climb", name: "Unbroken Climb", note: "The rope grab never dropped out of band", test: AWARD.unbroken },
      { id: "tower-inside-par", name: "Tower Inside Par", note: "Logged inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "free-climb-start": "You started up the ladder before the rope grab was on the lifeline. The first few rungs feel like nothing — you could step off them — but a slip from the fourth rung onto a steel deck is a fall with no arrest at all, and the habit of 'I will clip on when I get higher' is the habit that is still unclipped when the rung is ice or oil. The grab goes on at the bottom, every climb.",
    "transfer-unclipped": "You reached across from the ladder to the platform with both lanyard legs off. For that reach you were connected to nothing, and a transfer is exactly where climbers fall: body weight moving sideways, one hand off, one foot on a rung and one on grating. A twin-leg lanyard exists so the second leg goes on the new anchor before the first comes off the old one — clip, then unclip, never the other way round.",
    "untethered-wrench": "That spanner is lying loose on the platform grating at the open edge, with the deck and the traffic lanes below it and the strait beyond the railing. A dropped tool from tower height reaches the deck faster than anyone below can look up, and the crew's dropped-object rule is simple: every hand tool above the deck rides on a tether or in a closed bucket, no exceptions for 'just a minute'.",
    "guardrail-tie-off": "You went to clip your lanyard to the platform's guardrail. A guardrail is built to stop someone leaning or stumbling into it, not to arrest a free fall; 29 CFR 1926.502 sets an anchorage for personal fall arrest at a strength a top rail was never designed to take, and a rail that bends or tears out under an arrest load takes the climber with it. The rated anchor is the plate marked for it.",
  },

  lateNotes: {
    "haul-line": "The bucket comes up once you are on the platform and tied off to its anchor — not while you are still on the ladder with a hand needed for the rungs.",
    "beam-clamp-screw": "The beam clamp is set once the tools are up and tethered; it needs both hands and the torque wrench from the bucket.",
    "climb-log": "The climb is logged once you are back on the deck and the work position has been walked — the log records what was done, not what is planned.",
  },

  steps: [
    {
      id: "permit", kind: "select", target: "climb-permit",
      title: "Read the climb permit and the rescue plan",
      cue: "Read the tower climb permit: which leg and which cell, the work-stop wind limit, radio channel, and the named rescue plan for a climber suspended on the lifeline.",
      why: "A tower climb is permitted work because the rescue is harder than the climb: a climber hanging in a harness on a vertical lifeline inside a tower cell cannot be reached from the deck by a ladder truck, and suspension in a harness starts to hurt circulation within minutes. The permit names the leg, the channel and the wind limit, and the rescue plan names who brings the climber down and with what — read before the climb, because nobody writes a rescue plan while someone is hanging.",
    },
    {
      id: "don", kind: "sequence",
      targets: ["harness-rack", "twin-lanyard", "trauma-straps"],
      itemNames: { "harness-rack": "full-body harness, fitted and checked", "twin-lanyard": "twin-leg shock-absorbing lanyard on the back D-ring", "trauma-straps": "suspension relief straps on the harness" },
      title: "Put on the harness, the twin-leg lanyard and the relief straps",
      cue: "Harness on and snug at the legs and chest, the twin-leg lanyard on the back D-ring, then the suspension relief straps clipped to the harness where you can reach them hanging.",
      why: "The order matters because each piece depends on the last: a lanyard is only as good as the harness it hangs from, and the relief straps only work if they are on the harness before the fall, where a suspended climber can reach them and stand in them to take pressure off the leg straps. ANSI/ASSP Z359 treats the harness, the connector and the anchorage as one system, and a system is put together from the body outward, checked at each connection.",
      outOfOrderNote: "Harness first — a lanyard or a strap clipped to nothing is not fall protection. Build it from the body outward.",
    },
    {
      id: "system-check", kind: "find", noHint: true,
      targets: ["lifeline-top-bracket", "rope-grab-label", "ladder-gate"],
      itemNames: {
        "lifeline-top-bracket": "lifeline's top bracket bolted and tagged",
        "rope-grab-label": "rope grab matched to this lifeline",
        "ladder-gate": "self-closing gate at the ladder head",
      },
      itemNotes: {
        "lifeline-top-bracket": "The lifeline's top bracket is bolted to the leg with its inspection tag current. Every fall on this ladder ends at that bracket, so it is looked at from the deck before anyone trusts it from the ladder.",
        "rope-grab-label": "The rope grab's label names the lifeline diameter and construction it is certified for, and this line matches. A grab on the wrong line can slip or fail to lock, and a mismatch is invisible until it matters.",
        "ladder-gate": "The self-closing gate at the head of the ladder swings shut on its own. An open ladderway at a platform is a hole in the platform's own guardrail, and the gate is what closes it behind the climber.",
      },
      title: "Check the climbing system from the deck",
      cue: "Before a foot goes on a rung, find the three things the climb depends on: the lifeline's top bracket, the grab matched to the line, and the gate at the ladder head.",
      why: "The vertical lifeline, the rope grab and the ladder gate are the three parts of this climb that nobody can inspect once they are on the ladder: the bracket is overhead, the grab is already locked on, and the gate is behind you. Checking them from the deck is the only moment the climber can still decide not to climb, and the three together are the difference between a fall that stops in a few centimetres and one that does not stop.",
    },
    {
      id: "wind-reading", kind: "gauge", target: "wind-meter",
      title: "Take the wind at the tower base against the climb limit",
      cue: "Read the anemometer on the mast and commit the reading while it sits inside the band below the permit's climb limit.",
      why: "Wind on a tower is not the wind on the deck: it gets stronger with height and gustier round the legs, and a climber on a vertical ladder is a sail with both hands busy. The permit sets the work-stop limit and the crew reads the anemometer against it before the climb, not by feel on the way up, because the reading that matters is the one that decides whether anyone leaves the deck at all.",
      gauge: {
        label: "WIND · % OF CLIMB LIMIT", speed: 0.66, green: [0.16, 0.5],
        readout: (t) => `${Math.round(t * 140)}% of limit`,
        missNote: "That reading is at or past the climb limit — or you committed a lull. Wait for a steady reading inside the band before anyone leaves the deck.",
      },
    },
    {
      id: "climb", kind: "track", target: "rope-grab-sleeve", seconds: 7,
      title: "Climb on the rope grab, keeping it above your D-ring",
      cue: "Climb steadily with the rope grab trailing above chest height — not dragging below your D-ring, not jammed up against your hand.",
      why: "A rope grab arrests a fall by locking on the lifeline, and the distance a climber falls before it locks depends on where it was riding: a grab dragging below the D-ring adds that length to the free fall and the shock the lanyard has to absorb, and a grab shoved up against the hand can be held open by the hand that is falling with it. Kept riding just above the chest, it locks in the shortest distance the system allows.",
      track: {
        start: 0.1, green: [0.4, 0.62], rise: 0.55, fall: 0.44, drift: 0.12, label: "ROPE GRAB ABOVE D-RING",
        readout: (v) => (v < 0.4 ? "dragging below the D-ring" : v > 0.62 ? "jammed against your hand" : "riding above the chest"),
      },
      holdBreakNote: "The grab dropped out of its riding position — a fall from there is a longer fall than the system was set up for. Settle it back above the chest and climb on.",
    },
    {
      id: "transfer", kind: "sequence",
      targets: ["platform-anchor", "lifeline-release"],
      itemNames: { "platform-anchor": "second lanyard leg onto the platform anchor", "lifeline-release": "rope grab off the lifeline" },
      title: "Transfer to the platform: clip on, then unclip",
      cue: "At the ladder head, clip the free leg of the twin lanyard to the platform's rated anchor first; only then take the rope grab off the lifeline and step through the gate.",
      why: "This is the moment the whole climb is set up for. The rope grab has held you all the way up the ladder, and the platform anchor will hold you on the platform, and the only time you can be on neither is the second between them — so the new connection goes on before the old one comes off. 29 CFR 1926.502 asks for continuous protection, and the twin-leg lanyard is the tool that makes a transfer continuous rather than a hopeful step.",
      outOfOrderNote: "Anchor first, grab off second — taking the grab off before the lanyard leg is on the anchor is a transfer with nothing connected.",
    },
    {
      id: "haul", kind: "hold", target: "haul-line", seconds: 5,
      title: "Haul the tool bucket up hand over hand",
      cue: "Tied off at the platform, haul the closed tool bucket up the tag line hand over hand, never letting the line run.",
      why: "Tools do not come up the ladder in pockets or on belts: a climber's hands belong to the rungs, and a tool falling from a pocket on the climb has the whole tower height to fall. The bucket is closed, the line is hauled hand over hand from a tied-off position, and the deck crew keeps clear of the drop zone under it, because a bucket that slips from a hand in the fog is a load falling onto a deck that looks empty from above.",
      holdBreakNote: "The line ran through your hands — the bucket dropped back toward the deck. Take it up again hand over hand.",
    },
    {
      id: "tether-bucket", kind: "drag", target: "tool-bucket",
      title: "Tether the bucket to the platform's tool anchor",
      cue: "Carry the bucket's lanyard to the tool anchor ring on the platform and clip it on before anything comes out of it.",
      why: "A bucket sitting loose on grating is one knock away from the open edge; clipped to the tool anchor it can tip over and still not leave the platform. The tethered bucket is also where every tool goes back between uses, and each tool inside rides on its own wrist or tool lanyard, so nothing at height depends on a hand not slipping.",
      drag: { to: "tool-anchor", radius: 0.45, missNote: "Not on the ring — the bucket's lanyard clips to the tool anchor itself, not to the guardrail or a grating bar." },
    },
    {
      id: "beam-clamp", kind: "turn", target: "beam-clamp-screw",
      title: "Set the beam-clamp anchor on the flange for the next crew",
      cue: "Seat the beam clamp on the flange and turn the screw down until the jaw bears, then to the maker's figure.",
      why: "The next crew's tie-off point has to be as good as the one you are standing on: a beam clamp is rated as an anchor only when it is seated on a flange of the width its label names, with the jaw bearing and the screw run down to the maker's figure. A clamp that is loose on the flange can slide to the end of the beam under a fall, and a clamp over-tightened can crack the jaw — both are found by the turn, not by looking.",
      turn: { turns: 1.1, label: "BEAM CLAMP SCREW", readout: (t) => (t < 0.4 ? "jaw closing" : t < 0.95 ? "bearing on the flange" : "at the maker's figure") },
    },
    {
      id: "rescue-kit", kind: "select", target: "rescue-kit",
      title: "Confirm the rescue kit with the attendant",
      cue: "Confirm with the rescue attendant on the deck that the rescue kit is staged at the leg and the attendant is watching the climb.",
      why: "The rescue plan is only real if the kit is at the foot of the leg and a named person is watching, because a suspended climber has minutes, not a shift, before suspension becomes an emergency of its own. Confirming it now, from the platform, is the check that the plan read at the permit is still the plan in force after the crew has moved round the deck.",
    },
    {
      id: "work-position", kind: "find", noHint: true,
      targets: ["rust-bleed-rivet", "loose-grating-clip"],
      itemNames: { "rust-bleed-rivet": "rust bleeding from a rivet head on the leg", "loose-grating-clip": "a grating clip backed off at the platform edge" },
      itemNotes: {
        "rust-bleed-rivet": "A rivet head on the leg plate has rust bleeding down the orange from under it: the paint system has broken at the head and water is getting behind it. It goes on the log for the paint crew and the owner's engineer.",
        "loose-grating-clip": "One grating clip at the platform edge has backed off its bolt, so the panel can lift at the corner under a boot. It is a trip at the open side of a platform, and it is tightened or tagged before the next climb.",
      },
      title: "Walk the work position for what the next crew needs to know",
      cue: "From the platform, find what has changed since the last climb: the plate, the rivets, the grating underfoot.",
      why: "A tower is inspected every time somebody climbs it, whether that is the job or not, because the people on the platform are the only ones close enough to see a rivet head bleeding rust or a grating clip working loose. A bridge maintained to the AASHTO Maintenance Manual depends on those small findings reaching the log, and the climber who saw them is the only one who can put them there accurately.",
    },
    {
      id: "climb-log", kind: "select", target: "climb-log",
      title: "Log the climb, the transfer and the findings",
      cue: "Back on the deck, log the climb: the wind reading, the transfer point, the beam clamp set, the rivet and the grating clip, and the time down.",
      why: "The climb log is what the next crew reads before they commit to the same leg: where the beam clamp is and what it is set for, what the wind was, which grating clip needs a wrench. It is also the record the owner's engineer reads when a rivet head is bleeding rust, and a finding that stayed in a climber's memory is a finding the paint programme never hears about.",
    },
    {
      id: "crew-checkin", kind: "select", target: "tower-radio",
      title: "Check in with the attendant and the deck foreman",
      cue: "Call the attendant and the foreman on the tower channel: climber down, clamp set, findings logged — and how the climb went.",
      why: "The attendant stays at the leg until the climber says they are down, so the call is what releases them, and the foreman reassigns the deck on the strength of it. It is also the crew's own check-in: a climb through a gust and a fog bank is a climb that leaves things unsaid, and saying them on the radio before the next job is how a crew notices who is rattled. The Ironworkers' member assistance line is there for anything that lasts longer than the shift.",
    },
  ],

  interrupts: [
    {
      id: "gust-on-the-leg",
      kind: "Gust past the work-stop limit",
      after: "climb", delay: 3, seconds: 12,
      alert: "A gust comes round the tower leg and the anemometer on the mast jumps past the work-stop limit — the windsock stands straight out and the strobe on the mast starts flashing.",
      cue: "Stop climbing and clip the positioning lanyard to the ladder rail — ride the gust out stationary with three points of contact.",
      target: "positioning-hook",
      why: "A climber moving on a ladder in a gust is a climber with one hand and one foot off at the worst moment. Stopping, clipping the positioning lanyard to the rail and holding three points of contact turns a moving climber into a fixed one until the gust passes; the rope grab is still there if the hands go, but the point is that they do not. The work-stop limit on the permit is the crew's own line, and a gust past it means stop now, decide afterwards.",
      missNote: "The climb carried on through the gust with both hands moving on the rungs. A climber on a ladder in a gust past the work-stop limit is the climber the rescue plan was written for.",
      wrongNote: "The positioning hook — stop where you are and clip to the rail. Nothing else on the tower matters until you are stationary.",
    },
    {
      id: "fog-bank-in",
      kind: "Fog bank rolling in",
      after: "haul", delay: 2, seconds: 13,
      alert: "A fog bank rolls in off the strait over the railing — the deck below goes grey and the deck crew at the foot of the leg drops out of sight.",
      cue: "Call the deck on the tower radio: visibility gone, hauling stopped, and switch to radio-only calls for the drop zone.",
      target: "tower-radio",
      why: "With the deck out of sight the climber can no longer see whether the drop zone under the haul line is clear, and the deck crew can no longer see a bucket coming down if it slips. The radio becomes the only way either side knows where the other is, so the call goes out the moment the fog arrives: hauling stops, the drop zone is held by voice, and nothing moves on the line until somebody below confirms they are clear.",
      missNote: "The haul went on into the fog with nobody able to see the drop zone. Had the bucket slipped, it would have landed on a deck crew who could not see it coming and had not been told to stand clear.",
      wrongNote: "The tower radio — once the fog takes the deck out of sight, the only way to hold the drop zone is by voice.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.8, GGT_ACCENT);

    // ------------------------------------------------ work mat on the deck
    const matTex = surfaceTexture((cx, w, h) => deckPlateFace(cx, w, h, { base: "#3a4047", base2: "#30363c" }), { repeat: 4, px: 256 });
    const workMat = box(g, 5.6, 0.02, 4.6, 0, 0.01, 0, 0x3a4047, { rough: 0.8, metal: 0.3, cast: false });
    workMat.material = texturedMat(matTex, { rough: 0.8, metal: 0.3, color: 0x9aa2aa });

    // ------------------------------------------------ the tower leg mock-up
    const legTex = surfaceTexture((cx, w, h) => paintedSteelFace(cx, w, h, { cols: 2, rows: 5 }), { repeat: 1, px: 512 });
    const legMat = texturedMat(legTex, { rough: 0.62, metal: 0.3 });
    const leg = group(g, -0.95, 0, -1.55);
    const legBox = box(leg, 1.5, 3.6, 1.0, 0, 1.8, 0, GGT_ORANGE, { rough: 0.62, metal: 0.3 });
    legBox.material = legMat;
    // Cell-edge angles and batten plates, riveted.
    for (const sx of [-1, 1]) box(leg, 0.08, 3.6, 0.08, sx * 0.76, 1.8, 0.52, 0xb13d17, { rough: 0.6, metal: 0.3 });
    for (let i = 0; i < 4; i++) box(leg, 1.56, 0.1, 0.06, 0, 0.5 + i * 0.95, 0.52, 0xb13d17, { rough: 0.6, metal: 0.3 });
    const rivets = [];
    for (let i = 0; i < 6; i++) rivets.push(ball(leg, 0.022, -0.6 + i * 0.24, 2.4, 0.555, 0xd5582a, { rough: 0.5, metal: 0.3, seg: 8, seg2: 6 }));
    const rustBleed = group(leg, 0.12, 2.3, 0.552);
    box(rustBleed, 0.04, 0.2, 0.006, 0, 0, 0, 0x7a3514, { rough: 0.9 });
    ball(rustBleed, 0.026, 0, 0.1, 0.004, 0x8a4a22, { rough: 0.8, seg: 8, seg2: 6 });
    reg(hits, rustBleed, "rust-bleed-rivet");

    // Ladder on the face, with the vertical lifeline beside it.
    const ladder = group(leg, 0.2, 0, 0.66);
    for (const lx of [-0.21, 0.21]) box(ladder, 0.05, 3.5, 0.05, lx, 1.75, 0, 0x9aa1a8, { rough: 0.45, metal: 0.7 });
    for (let i = 0; i < 11; i++) cyl(ladder, 0.014, 0.014, 0.42, 0, 0.25 + i * 0.3, 0, 0x9aa1a8, { rough: 0.45, metal: 0.7, seg: 6 }).rotation.z = Math.PI / 2;
    const lifeline = cyl(leg, 0.009, 0.009, 3.4, 0.62, 1.8, 0.66, 0xf2c14b, { rough: 0.7, seg: 6 });
    void lifeline;
    const topBracket = group(leg, 0.62, 3.52, 0.62);
    box(topBracket, 0.14, 0.08, 0.14, 0, 0, 0, 0x5a636c, { rough: 0.5, metal: 0.6 });
    decal(topBracket, 0.08, 0.05, 0, -0.07, 0.072, paperFace("TAG", ["IN DATE"], { bg: "#f2e6c8", band: "#59c97b" }), { px: 96 });
    reg(hits, topBracket, "lifeline-top-bracket");
    const grab = group(leg, 0.62, 1.25, 0.66);
    box(grab, 0.06, 0.12, 0.05, 0, 0, 0, 0x2b3138, { rough: 0.5, metal: 0.5 });
    box(grab, 0.03, 0.04, 0.02, 0, 0.02, 0.034, 0xe0662e, { rough: 0.5 });
    holoTag(grab, "rope grab — climb", 0, 0.14, 0.04, { css: "#e0662e", w: 0.36 });
    reg(hits, grab, "rope-grab-sleeve");
    const grabLabel = decal(leg, 0.06, 0.03, 0.62, 1.12, 0.692, signFace("11 MM", { bg: "#1a1e23", accent: "#e0662e", fg: "#eaf6fb", scale: 0.5 }), { px: 96 });
    reg(hits, grabLabel, "rope-grab-label");
    const release = torus(leg, 0.03, 0.007, 0.7, 1.35, 0.7, 0xc0c6cc, { rough: 0.3, metal: 0.9, seg: 6, seg2: 12 });
    reg(hits, release, "lifeline-release");
    const posHook = group(ladder, -0.21, 1.6, 0.05);
    torus(posHook, 0.035, 0.008, 0, 0, 0, 0xd8b23a, { rough: 0.4, metal: 0.7, seg: 6, seg2: 12 });
    hose(posHook, [[0, -0.03, 0], [0.1, -0.2, 0.08], [0.25, -0.3, 0.14]], 0.008, 0x2f6f8f, { steps: 8, rough: 0.7 });
    holoTag(posHook, "positioning hook", 0, 0.1, 0.02, { css: "#e0662e", w: 0.34 });
    reg(hits, posHook, "positioning-hook");
    const freeClimb = box(leg, 0.5, 0.5, 0.2, 0.2, 0.35, 0.85, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(leg, "start up without the grab?", 0.2, 0.72, 0.9, { css: "#d2312b", w: 0.5 });
    reg(hits, freeClimb, "free-climb-start");

    // ------------------------------------------------ the transfer platform
    const plat = group(g, 0.55, 2.35, -1.45);
    const grating = box(plat, 1.3, 0.05, 1.0, 0, 0, 0, 0x5a636c, { rough: 0.6, metal: 0.5 });
    void grating;
    for (let i = 0; i < 6; i++) box(plat, 0.02, 0.055, 1.0, -0.55 + i * 0.22, 0.004, 0, 0x454c54, { rough: 0.6, metal: 0.5 });
    for (const [px, pz] of [[0.63, -0.48], [0.63, 0.48], [-0.2, 0.48]]) box(plat, 0.05, 1.05, 0.05, px, 0.53, pz, CITY.hiVis, { rough: 0.55 });
    box(plat, 0.05, 0.05, 1.0, 0.63, 1.05, 0, CITY.hiVis, { rough: 0.55 });
    box(plat, 0.05, 0.05, 1.0, 0.63, 0.55, 0, CITY.hiVis, { rough: 0.55 });
    box(plat, 0.85, 0.05, 0.05, 0.2, 1.05, 0.48, CITY.hiVis, { rough: 0.55 });
    box(plat, 0.85, 0.05, 0.05, 0.2, 0.55, 0.48, CITY.hiVis, { rough: 0.55 });
    box(plat, 1.3, 0.1, 0.02, 0, 0.08, 0.5, 0xe8b830, { rough: 0.6 });
    // Posts down to the deck.
    for (const [px, pz] of [[0.6, -0.45], [0.6, 0.45]]) cyl(g, 0.05, 0.05, 2.35, 0.55 + px, 1.175, -1.45 + pz, 0x5a636c, { rough: 0.5, metal: 0.6, seg: 10 });
    const gate = group(plat, -0.45, 0.55, 0.48);
    box(gate, 0.4, 0.04, 0.03, 0.2, 0.3, 0, 0xe8b830, { rough: 0.5 });
    box(gate, 0.4, 0.04, 0.03, 0.2, -0.1, 0, 0xe8b830, { rough: 0.5 });
    box(gate, 0.03, 0.5, 0.03, 0, 0.1, 0, 0xe8b830, { rough: 0.5 });
    reg(hits, gate, "ladder-gate");
    const anchorPlate = group(plat, -0.2, 0.9, -0.44);
    box(anchorPlate, 0.12, 0.16, 0.02, 0, 0, 0, 0x3a4148, { rough: 0.5, metal: 0.6 });
    torus(anchorPlate, 0.04, 0.009, 0, -0.04, 0.03, 0xd8b23a, { rough: 0.4, metal: 0.7, seg: 6, seg2: 14 });
    holoTag(anchorPlate, "rated anchor", 0, 0.14, 0.02, { css: "#e0662e", w: 0.3 });
    reg(hits, anchorPlate, "platform-anchor");
    const railHit = box(plat, 0.08, 0.1, 0.6, 0.63, 1.05, -0.05, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(plat, "clip to the top rail?", 0.66, 1.2, -0.05, { css: "#d2312b", w: 0.44 });
    reg(hits, railHit, "guardrail-tie-off");
    const transferGap = box(g, 0.35, 0.6, 0.3, -0.05, 2.7, -0.85, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "reach across both legs off?", -0.05, 3.1, -0.8, { css: "#d2312b", w: 0.52 });
    reg(hits, transferGap, "transfer-unclipped");
    const wrench = group(plat, 0.45, 0.04, 0.38, 0.3);
    box(wrench, 0.2, 0.015, 0.035, 0, 0, 0, 0xdfe4e8, { rough: 0.35, metal: 0.8 });
    torus(wrench, 0.025, 0.008, 0.1, 0, 0, 0xdfe4e8, { rough: 0.35, metal: 0.8, seg: 6, seg2: 10 }).rotation.x = Math.PI / 2;
    reg(hits, wrench, "untethered-wrench");
    const clip = box(plat, 0.06, 0.03, 0.06, -0.5, 0.045, 0.42, 0xb8b030, { rough: 0.5, metal: 0.5 });
    reg(hits, clip, "loose-grating-clip");
    const toolRing = torus(plat, 0.05, 0.01, 0.1, 0.1, -0.44, 0xe0662e, { emissive: 0xe0662e, ei: 1.4, rough: 0.4, seg: 6, seg2: 16 });
    holoTag(plat, "tool anchor", 0.1, 0.24, -0.44, { css: "#e0662e", w: 0.26 });
    reg(hits, toolRing, "tool-anchor");

    // Beam over the platform, the clamp, and the haul block.
    const beam = group(g, 0.55, 3.35, -1.45);
    box(beam, 1.4, 0.03, 0.2, 0, 0.14, 0, 0x5a636c, { rough: 0.5, metal: 0.6 });
    box(beam, 1.4, 0.26, 0.02, 0, 0, 0, 0x5a636c, { rough: 0.5, metal: 0.6 });
    box(beam, 1.4, 0.03, 0.2, 0, -0.14, 0, 0x5a636c, { rough: 0.5, metal: 0.6 });
    const clamp = group(beam, 0.2, -0.2, 0);
    box(clamp, 0.12, 0.06, 0.24, 0, 0, 0, 0xe8b830, { rough: 0.5, metal: 0.5 });
    cyl(clamp, 0.012, 0.012, 0.14, 0, -0.06, 0.13, 0xc0c6cc, { rough: 0.3, metal: 0.9, seg: 8 }).rotation.x = Math.PI / 2;
    const clampHandle = box(clamp, 0.12, 0.014, 0.014, 0, -0.06, 0.2, 0x2b3138, { rough: 0.6 });
    holoTag(clamp, "beam clamp — turn", 0, -0.16, 0.12, { css: "#e0662e", w: 0.36 });
    reg(hits, clamp, "beam-clamp-screw");
    const block = group(beam, 0.6, -0.22, 0.12);
    torus(block, 0.06, 0.015, 0, 0, 0, 0x2b3138, { rough: 0.5, metal: 0.5, seg: 6, seg2: 14 });
    const haulLine = hose(g, [[1.15, 3.13, -1.33], [1.2, 1.8, -1.2], [1.25, 0.4, -1.1]], 0.008, 0xe8e2d0, { steps: 12, rough: 0.8 });
    holoTag(g, "haul line — hold", 1.28, 1.2, -1.1, { css: "#e0662e", w: 0.32 });
    reg(hits, haulLine, "haul-line");
    const bucket = group(g, 1.25, 0, -1.05);
    cyl(bucket, 0.14, 0.12, 0.3, 0, 0.15, 0, 0x2b3a4a, { rough: 0.85, seg: 14 });
    cyl(bucket, 0.145, 0.145, 0.03, 0, 0.3, 0, 0x1a1e23, { rough: 0.8, seg: 14 });
    torus(bucket, 0.1, 0.008, 0, 0.36, 0, 0xc0c6cc, { rough: 0.4, metal: 0.8, seg: 6, seg2: 14 });
    holoTag(bucket, "tool bucket — carry", 0, 0.5, 0, { css: "#e0662e", w: 0.36 });
    reg(hits, bucket, "tool-bucket");
    const bucketHome = bucket.position.clone();

    // ------------------------------------------------ wind mast
    const mast = group(g, 2.25, 0, -0.9);
    cyl(mast, 0.03, 0.04, 2.6, 0, 1.3, 0, 0x9aa1a8, { rough: 0.45, metal: 0.7, seg: 8 });
    const cups = group(mast, 0, 2.66, 0);
    for (let i = 0; i < 3; i++) {
      const arm = group(cups, 0, 0, 0, (i * Math.PI * 2) / 3);
      box(arm, 0.18, 0.01, 0.01, 0.09, 0, 0, 0x9aa1a8, { rough: 0.5, metal: 0.6 });
      ball(arm, 0.03, 0.18, 0, 0, 0xdfe4e8, { rough: 0.4, seg: 8, seg2: 6 });
    }
    const sockPole = box(mast, 0.3, 0.02, 0.02, 0.15, 2.3, 0, 0x9aa1a8, { rough: 0.5, metal: 0.6 });
    void sockPole;
    const sock = cyl(mast, 0.06, 0.03, 0.34, 0.3, 2.3, 0.12, 0x59c97b, { rough: 0.7, seg: 10 });
    sock.rotation.x = 1.1;
    const strobe = ball(mast, 0.05, 0, 2.82, 0, 0xff3b30, { emissive: 0xff3b30, ei: 2.6, seg: 8, seg2: 6 });
    strobe.visible = false;
    const windMeter = instrument(mast, 0, 1.25, 0.1, { ry: 0, idle: "-- %", color: GGT_ACCENT, w: 0.12, d: 0.16 });
    windMeter.rotation.x = Math.PI / 2.4;
    holoTag(mast, "anemometer", 0, 1.48, 0.12, { css: "#e0662e", w: 0.28 });
    reg(hits, windMeter, "wind-meter");

    // ------------------------------------------------ harness rack
    const rack = group(g, -2.3, 0, 0.7, 0.5);
    for (const sx of [-1, 1]) cyl(rack, 0.02, 0.02, 1.6, sx * 0.3, 0.8, 0, 0x8a949d, { rough: 0.45, metal: 0.7, seg: 8 });
    box(rack, 0.7, 0.03, 0.03, 0, 1.58, 0, 0x8a949d, { rough: 0.45, metal: 0.7 });
    const harness = group(rack, -0.15, 1.25, 0.03);
    box(harness, 0.22, 0.44, 0.04, 0, 0, 0, 0x1f3a52, { rough: 0.8 });
    for (const sx of [-1, 1]) box(harness, 0.03, 0.46, 0.05, sx * 0.07, 0, 0.005, 0xf2c14b, { rough: 0.7 });
    holoTag(rack, "harness", -0.15, 1.72, 0.05, { css: "#e0662e", w: 0.22 });
    reg(hits, harness, "harness-rack");
    const lanyard = group(rack, 0.14, 1.2, 0.03);
    hose(lanyard, [[-0.06, 0.15, 0], [0, -0.1, 0.02], [0.06, 0.15, 0]], 0.012, 0xe0662e, { steps: 10, rough: 0.7 });
    box(lanyard, 0.06, 0.08, 0.04, 0, -0.14, 0.02, 0x2b3138, { rough: 0.7 });
    holoTag(lanyard, "twin-leg lanyard", 0, 0.3, 0.02, { css: "#e0662e", w: 0.32 });
    reg(hits, lanyard, "twin-lanyard");
    const straps = group(rack, 0, 0.7, 0.03);
    box(straps, 0.14, 0.1, 0.04, 0, 0, 0, 0xd8b23a, { rough: 0.7 });
    holoTag(straps, "relief straps", 0, 0.12, 0.02, { css: "#e0662e", w: 0.28 });
    reg(hits, straps, "trauma-straps");

    // ------------------------------------------------ paperwork, radio, rescue kit
    const permit = holoPanel(g, 0.9, 0.62, 2.15, 1.35, 1.05, (cx, w, h) => {
      cx.fillStyle = "rgba(20,10,6,0.92)"; cx.fillRect(0, 0, w, h); cx.fillStyle = "#e0662e"; cx.fillRect(0, 0, w, 6);
      cx.font = `600 ${Math.round(h * 0.1)}px 'Barlow Condensed', Arial, sans-serif`; cx.textAlign = "left"; cx.textBaseline = "middle";
      cx.fillStyle = "#ffe2d2"; cx.fillText("TOWER CLIMB PERMIT", w * 0.06, h * 0.13);
      cx.font = `${Math.round(h * 0.068)}px Arial, sans-serif`; cx.fillStyle = "#f5eae4";
      ["Leg and cell: as posted at the door", "Work-stop wind: per the owner's procedure", "Tower channel: radio check before climbing",
       "Transfer: clip on, then unclip — every time", "Rescue: attendant at the leg, kit staged", "Tools: tethered or in the closed bucket"]
        .forEach((l, i) => cx.fillText(l, w * 0.06, h * (0.29 + i * 0.11)));
    }, { ry: -0.7, accent: GGT_ACCENT });
    reg(hits, permit, "climb-permit");
    const log = holoPanel(g, 0.7, 0.48, -2.35, 1.3, -0.55, (cx, w, h) => {
      cx.fillStyle = "rgba(20,10,6,0.92)"; cx.fillRect(0, 0, w, h); cx.fillStyle = "#e0662e"; cx.fillRect(0, 0, w, 6);
      cx.font = `600 ${Math.round(h * 0.12)}px 'Barlow Condensed', Arial, sans-serif`; cx.textAlign = "left"; cx.textBaseline = "middle";
      cx.fillStyle = "#ffe2d2"; cx.fillText("CLIMB LOG", w * 0.06, h * 0.15);
      cx.font = `${Math.round(h * 0.085)}px Arial, sans-serif`; cx.fillStyle = "#f5eae4";
      ["Wind: —", "Transfer: —", "Clamp: —", "Findings: —"].forEach((l, i) => cx.fillText(l, w * 0.06, h * (0.36 + i * 0.16)));
    }, { ry: 1.2, accent: GGT_ACCENT });
    reg(hits, log, "climb-log");
    const chest = toolChest(g, 1.55, 1.85, { ry: -0.3, color: 0x7a3a22 });
    const radio = instrument(chest, 0.12, 0.79, 0.02, { ry: 0.2, idle: "TOWER CH", color: GGT_ACCENT, w: 0.1, d: 0.16 });
    holoTag(radio, "tower radio", 0, 0.15, 0, { css: "#e0662e", w: 0.26 });
    reg(hits, radio, "tower-radio");
    const kit = group(g, -1.2, 0, 1.9, 0.3);
    box(kit, 0.5, 0.34, 0.3, 0, 0.17, 0, 0xc8341f, { rough: 0.8 });
    box(kit, 0.5, 0.05, 0.31, 0, 0.26, 0, 0xdfe8ee, { rough: 0.6, emissive: 0xdfe8ee, ei: 0.3 });
    holoTag(kit, "rescue kit", 0, 0.52, 0, { css: "#e0662e", w: 0.24 });
    reg(hits, kit, "rescue-kit");

    // ------------------------------------------------ crew and the closure edge
    const attendant = standingFigure(g, -2.35, 2.0, { ry: 2.6, cloth: 0x2b3138, vest: 0xe4dc3a, helmet: 0xf2f2f2, harness: true });
    holoTag(attendant, "rescue attendant", 0, 1.95, 0, { css: "#59c97b", w: 0.36 });
    const foreman = standingFigure(g, 2.6, 0.3, { ry: -1.4, cloth: 0x1f3a52, vest: 0xe07a3f, helmet: 0xf2c14b });
    holoTag(foreman, "deck foreman", 0, 1.95, 0, { css: "#59c97b", w: 0.3 });
    cone(g, 0.2, 2.4, { color: GGT_ACCENT }); cone(g, 2.7, 2.2, { color: GGT_ACCENT }); cone(g, -2.8, -1.8, { color: GGT_ACCENT });
    barrierPanel(g, 0.9, 2.55, { color: GGT_ACCENT });

    // ------------------------------------------------ the fog bank, held off the strait
    const fog = group(g, -48, 0, -6);
    const fogMat = { rough: 1, opacity: 0.55, transparent: true, cast: false, receive: false };
    box(fog, 8, 9, 30, 0, 3, 0, 0xdfe5e9, fogMat);
    box(fog, 10, 6, 22, -4, 1.5, 8, 0xe8ecef, fogMat);
    box(fog, 7, 12, 18, 3, 5, -10, 0xd6dde2, fogMat);
    fog.visible = false;
    const fogHome = fog.position.clone();

    let gusting = false, fogOn = false;
    const paintLog = (lines, band) => repaint(log.userData.face, (cx, w, h) => {
      cx.fillStyle = "rgba(20,10,6,0.92)"; cx.fillRect(0, 0, w, h); cx.fillStyle = band; cx.fillRect(0, 0, w, 6);
      cx.font = `600 ${Math.round(h * 0.12)}px 'Barlow Condensed', Arial, sans-serif`; cx.textAlign = "left"; cx.textBaseline = "middle";
      cx.fillStyle = "#ffe2d2"; cx.fillText("CLIMB LOG", w * 0.06, h * 0.15);
      cx.font = `${Math.round(h * 0.075)}px Arial, sans-serif`; cx.fillStyle = "#f5eae4";
      lines.forEach((l, i) => cx.fillText(l, w * 0.06, h * (0.36 + i * 0.16)));
    });

    return {
      hits,
      spawnLook: new THREE.Vector3(-0.2, 1.7, -1.2),
      onStepComplete(step) {
        if (step.id === "climb") grab.position.y = 2.2;
        if (step.id === "transfer") hose(plat, [[-0.2, 0.86, -0.4], [-0.1, 0.6, -0.1], [0, 0.4, 0.1]], 0.01, 0xe0662e, { steps: 8, rough: 0.7 });
        if (step.id === "haul") bucket.position.set(0.9, 2.4, -1.25);
        if (step.id === "tether-bucket") bucket.position.set(0.65, 2.4, -1.85);
        if (step.id === "beam-clamp") clampHandle.rotation.y = 1.2;
        if (step.id === "work-position") clip.material = mat(0x59c97b, { rough: 0.5, metal: 0.5 });
        if (step.id === "climb-log") paintLog(["Wind: inside the climb limit", "Transfer: platform anchor, clipped on first", "Clamp: set on the flange, at figure", "Findings: rivet rust bleed · grating clip"], "#59c97b");
        if (step.id === "crew-checkin") repaint(radio.userData.screen, signFace("CLIMBER DOWN", { bg: "#0d1c24", accent: "#59c97b", fg: "#bfeaf7", scale: 0.5 }));
      },
      onInterrupt(it) {
        if (it.id === "gust-on-the-leg") {
          gusting = true;
          strobe.visible = true;
          sock.material = mat(0xd2312b, { rough: 0.7, emissive: 0x6a1010, ei: 0.6 });
          sock.rotation.x = Math.PI / 2;
        }
        if (it.id === "fog-bank-in") {
          fogOn = true;
          fog.visible = true;
          fog.position.set(-22, 0, -4);
          repaint(radio.userData.screen, signFace("FOG · HOLD", { bg: "#0d1c24", accent: "#f2ae14", fg: "#bfeaf7", scale: 0.55 }));
        }
      },
      onInterruptEnd(it) {
        if (it.id === "gust-on-the-leg") {
          gusting = false;
          if (it.resolved !== "answered") return;
          strobe.visible = false;
          sock.material = mat(0x59c97b, { rough: 0.7 });
          sock.rotation.x = 1.1;
        }
        if (it.id === "fog-bank-in" && it.resolved === "answered") {
          repaint(radio.userData.screen, signFace("RADIO ONLY", { bg: "#0d1c24", accent: "#59c97b", fg: "#bfeaf7", scale: 0.55 }));
        }
      },
      onHazard(hitId) {
        if (hitId === "untethered-wrench") wrench.position.x = 0.58;
      },
      animate(t, dt, session) {
        cups.rotation.y = t * (gusting ? 14 : 4);
        if (strobe.visible) strobe.material.emissiveIntensity = Math.sin(t * 12) > 0 ? 3 : 0.4;
        if (fogOn && fog.position.x < -12) fog.position.x += (dt ?? 0.016) * 0.8;
        if (!fogOn && fog.position.x !== fogHome.x) fog.position.copy(fogHome);
        const step = session?.step;
        const gg = session?.gauge;
        if (gg && !gg.committed && step?.id === "wind-reading") {
          repaint(windMeter.userData.screen, signFace(`${Math.round(gg.t * 140)}%`, { bg: "#0d1c24", accent: gg.t >= 0.16 && gg.t <= 0.5 ? "#59c97b" : "#f0645b", fg: "#bfeaf7", scale: 0.6 }));
        }
        if (step?.id === "climb" && session.track) grab.position.y = 0.9 + session.track.v * 1.4;
        if (session?.turn && step?.id === "beam-clamp") clampHandle.rotation.y = session.turn.amount * Math.PI * 2;
        void rivets; void CITY; void bucketHome;
      },
    };
  },
};
