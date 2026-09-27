import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import { box, cyl, ball, torus, hose, group, mat, repaint, signFace } from "../../../shared/kit.js";
import {
  CITY, stationPad, holoPanel, holoTag, instrument, standingFigure, reg,
  surfaceTexture, texturedMat, waterFace,
} from "../citykit.js";
import { motorYacht } from "../../../shared/fleet.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Man Overboard Recovery Drill VR — Maritime & Ports, the yacht
// and charter crew pack.
//
// The yacht under way on the estuary with a drill dummy in the water off the
// quarter: the spotter's post at the aft rail, the throwable ring on the
// flybridge rail, the MOB button and the radio at the cockpit station, the
// swim platform with its gate and ladder, the recovery sling, the propeller
// indicator lamp. The learner is the deckhand; the captain is at the helm and
// the mate is the spotter. No distance, time or water temperature is stated.

const YC5_ACCENT = 0x2b6f9e;
const YC5_CSS = "#2b6f9e";

export const SIM_YC_MAN_OVERBOARD_RECOVERY_DRILL = {
  id: "yc-man-overboard-recovery-drill",
  index: "yc-5",
  domain: "Maritime & Ports",
  trade: "Charter yacht deckhand in the recovery drill, IBU and SIU trained, with the mate as spotter and the captain at the helm",
  category: "Maritime & Ports",
  district: "Maritime & Ports",
  weather: "overcast",
  certification: "IBU and SIU deck training in person-overboard recovery; USCG lifesaving rules at 46 CFR 199 and 46 CFR 25 as the vessel's certificate applies them; 33 CFR 83 Inland Navigation Rules for the manoeuvre in the channel; marine VHF distress and urgency practice under 47 CFR 80; IMO STCW personal survival techniques; MEBA engineering watch on the engines through the recovery",
  name: "Man Overboard Recovery Drill",
  title: simTitle("Man Overboard Recovery Drill"),
  tagline: "A drill dummy off the quarter: the drill briefed, the spotter posted and never looking away, the ring thrown first, the button and the radio call in order, the bearing held through a swell that hides the casualty, the approach called from downwind while a guest heads for the swim platform, the propellers confirmed stopped, the sling snugged, the casualty brought up the platform, the ladder locked, every head counted again, the drill logged and the crew checked in",
  accent: YC5_ACCENT,
  accentCss: YC5_CSS,
  parSeconds: 280,
  footprint: 2.6,
  badge: { id: "never-lost-sight", name: "Never Lost Sight", note: "Throwable first, the spotter's arm never dropped, propellers stopped before anyone touched the platform, and both the swell and the guest answered" },

  supportLine: "your union hall's member assistance programme — the IBU, SIU or MEBA — with the operator's employee assistance line behind it",

  game: system({
    name: "Recovery",
    currency: "KNOT",
    ranks: ["Green Hand", "Deckhand", "Lead Deckhand", "Recovery Lead", "Recovery Certified"],
    badges: [
      { id: "briefed", name: "Briefed", note: "The drill briefed before the dummy went over", test: AWARD.stepClean("drill-brief") },
      { id: "snug-not-tight", name: "Snug Not Tight", note: "Sling tension committed inside the band first time", test: AWARD.precise(0.7) },
      { id: "feet-dry", name: "Feet Dry", note: "Nobody went in, nobody on the platform with the shafts turning, the spotter never turned away", test: AWARD.safe },
    ],
    challenges: [
      { id: "clean-recovery", name: "Clean Recovery", note: "No corrections from the brief to the log", test: AWARD.clean },
      { id: "steady-approach", name: "Steady Approach", note: "The approach called in band the whole way in", test: AWARD.unbroken },
      { id: "first-pass", name: "First Pass", note: "Drill logged inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "jump-in": "You went to jump in after the casualty. A second person in the water is a second casualty, in water that took the first one's strength in minutes, beside a hull that is manoeuvring; the whole recovery is built around getting the casualty to the vessel and the vessel to the casualty without anyone else leaving the deck. Nobody enters the water except a trained rescue swimmer, tethered, on the captain's order — and this crew does not carry one.",
    "platform-shafts-turning": "You stepped down onto the swim platform while the propeller indicator was still showing the shafts turning. The platform is directly over the propellers, and a person who slips off it or is pulled off it by a casualty in the water goes into the wash; the platform is not touched until the captain has the engines out of gear and the indicator lamp says so, and the deckhand looks at the lamp, not at the water.",
    "spotter-turn-away": "You turned from the rail to help with the ring and lost sight of the casualty. A head in the water is invisible the moment it is not being looked at — one swell, one turn of the hull, and the spotter is pointing at empty water. The spotter's only job is to point and to keep pointing; everything else, the ring, the radio, the sling, is somebody else's, and a spotter who helps has stopped being a spotter.",
    "hard-astern": "You called for hard astern to stop the yacht short with the casualty close aft. Astern with a casualty near the stern pulls the water — and the casualty — toward the propellers, and a yacht backing down cannot see what is under her transom. The approach is made from downwind, slowly, with the casualty kept on the side the captain can see, and the way comes off with the shafts out of gear, never with astern power near a person in the water.",
  },

  lateNotes: {
    "drill-log": "The drill is logged once the casualty is aboard, the ladder locked and every head counted — last, not first.",
    "recovery-sling": "The sling goes on once the propellers are confirmed stopped and the casualty is at the platform — not before.",
  },

  steps: [
    {
      id: "drill-brief", kind: "select", target: "drill-brief-board",
      title: "Brief the drill with the captain and the mate",
      cue: "Read the drill brief on the cockpit board: who spots, who throws, who calls, the approach the captain will make, the word that stops the propellers, and that the dummy goes over on the captain's word only.",
      why: "A person-overboard recovery is four jobs at once — spot, throw, call, con — done by three people, and the brief is where each of them learns which job is theirs before a body is in the water. The lifesaving rules that put a ring and a drill on the vessel assume the crew practise the whole sequence, not just the throw; a drill that starts without a brief teaches the crew to improvise, and improvising is what a crew does when the casualty is real and the spotter has just gone for the ring.",
    },
    {
      id: "post-the-spotter", kind: "select", target: "spotter-post",
      title: "Post the spotter at the aft rail with one job",
      cue: "Put the mate at the aft rail spotter post, arm out, pointing at the casualty, and tell them the one thing: point, keep pointing, never look away, call the bearing when asked.",
      why: "Everything the captain does in the next minutes depends on one person knowing where the casualty is, and that person cannot do anything else. The spotter points because a pointing arm is a bearing the captain can read from the helm without a word, and keeps pointing because a head in the water disappears behind every swell and is found again only by an eye that never left it. The spotter is posted first, before the ring, because the ring is useless thrown at water nobody is watching.",
    },
    {
      id: "throwable-first", kind: "drag", target: "life-ring",
      title: "Throw the ring to the casualty — the throwable goes first",
      cue: "Take the ring from the flybridge rail and throw it to land upwind of the casualty, line attached, so it drifts down to them — before anything else on this deck is touched.",
      why: "The first minutes in cold water are when a casualty loses the use of their hands and the strength to keep their face up, and the ring is the one thing that reaches them in those minutes while the vessel is still turning. It goes first because the button, the radio and the approach all take time the casualty does not have, and it goes upwind of them because a ring thrown at a person in the water lands short or hits them — thrown upwind, it drifts to them and the line brings them to it.",
      drag: { to: "casualty", radius: 0.9, missNote: "Not at the casualty — the ring lands upwind of them with the line attached and drifts down to them; short, or on top of them, helps nobody." },
    },
    {
      id: "button-and-call", kind: "sequence",
      targets: ["mob-button", "vhf-handset"],
      itemNames: { "mob-button": "MOB button at the cockpit station", "vhf-handset": "VHF handset — urgency call" },
      outOfOrderNote: "The button first — it marks the position the moment it is pressed — then the radio call, so the call carries the position and not a guess.",
      title: "Mark the position, then make the call",
      cue: "Press the MOB button at the cockpit station to mark the position, then pick up the VHF and make the urgency call the drill card gives: vessel, position from the mark, person in the water, assistance.",
      why: "The button marks where the casualty went in at the moment it is pressed, and every second between the person going over and the button is a second the mark is wrong by; the radio call comes second because a call with a position is a call the harbour and nearby vessels can act on, and a call without one is a question. The order is fixed so that under stress the hands do the same thing every time: button, handset, the words on the card.",
    },
    {
      id: "hold-the-bearing", kind: "hold", target: "spotter-point", seconds: 6,
      title: "Hold the bearing on the casualty through the turn",
      cue: "At the rail beside the spotter, hold your own arm on the casualty through the captain's turn, calling the bearing to the helm as the hull swings — never both eyes off the water.",
      why: "The turn is when the casualty is lost: the hull swings, the aft rail points at a different piece of water, and a spotter who steps to keep their footing steps off the bearing. Two people pointing is how the bearing survives the turn — one steadies while the other steps — and the bearing called out loud through the turn is what lets the captain come round onto the right piece of water rather than the piece the yacht happens to be facing.",
      holdBreakNote: "The bearing was dropped through the turn — an arm down, eyes off the water — and the casualty is somewhere in the wake. Back on the rail, arm out, find them, call it.",
    },
    {
      id: "approach-from-downwind", kind: "track", target: "approach-callout", seconds: 6,
      title: "Call the approach from downwind, slowly, casualty on the captain's side",
      cue: "As the captain brings the yacht round to approach from downwind, call the range and the side steadily to the helm — the casualty kept on the captain's side of the bow, the way coming off, the shafts about to go out of gear.",
      why: "The approach from downwind lets the yacht drift down onto the casualty with the way off rather than driving at them, and keeping the casualty on the side the captain can see means the helm never loses them behind the bow. The deckhand calls the range because the captain on the flybridge cannot judge the last lengths to a head in the water, and calls the side because the helm needs to hear which way to lay the hull; the call is steady because a rushed call is the sound of a yacht arriving too fast.",
      track: { start: 0.14, green: [0.42, 0.6], rise: 0.6, fall: 0.46, drift: 0.12, label: "APPROACH CALL", readout: (v) => (v < 0.42 ? "too slow — captain has no range" : v > 0.6 ? "rushing — arriving too fast" : "steady — drifting down on the casualty") },
      holdBreakNote: "The approach call broke — the captain lost the range and the side. Take it up again at the last range called and bring the yacht down slowly.",
    },
    {
      id: "props-stopped", kind: "select", target: "prop-indicator",
      title: "Confirm the propellers stopped before anyone goes near the platform",
      cue: "Watch the propeller indicator at the cockpit station and hear the captain's word — shafts out of gear, stopped — before the swim platform gate is opened or anyone steps down.",
      why: "The casualty is coming to the stern and the stern is where the propellers are, and a recovery at the platform with the shafts turning is a recovery that can kill the casualty and the rescuer at the moment of success. The indicator lamp and the captain's spoken word are the two confirmations, and the deckhand waits for both, looking at the lamp rather than the water, because a hand reaching for a casualty is a hand that has stopped thinking about the shafts.",
    },
    {
      id: "sling-on", kind: "gauge", target: "recovery-sling",
      title: "Get the recovery sling under the casualty's arms and snug it",
      cue: "From the platform, pass the sling under the casualty's arms and take it up until it is snug — holding them face-up against the platform, not so tight it rides up over the shoulders — and commit the tension.",
      why: "A casualty in the water cannot hold a ladder and cannot be lifted by the hands, and the sling is what turns dead weight in the water into a person who can be brought up the platform; snug, it holds them face-up and takes their weight, and too tight it rides up under the chin and over the shoulders and drops them. The tension is set by feel against the band the drill card describes, because the casualty's own weight in the water is the one thing the deckhand cannot read from a gauge.",
      gauge: { label: "SLING TENSION", speed: 0.7, green: [0.42, 0.6], readout: (t) => (t < 0.42 ? "loose — casualty slipping" : t <= 0.6 ? "snug — holding face-up" : "riding up — ease it"), missNote: "Outside the band — the sling is snugged until the casualty is held face-up and no further, by feel, not hauled." },
    },
    {
      id: "bring-aboard", kind: "drag", target: "casualty",
      title: "Bring the casualty up the swim platform",
      cue: "With the sling snug and a second hand on the grab rail, bring the casualty up onto the swim platform horizontally, head first, and inboard through the gate onto the deck.",
      why: "A casualty who has been in cold water is brought aboard horizontally because standing them up or lifting them vertically drops their blood pressure and can stop their heart on the platform after the recovery has succeeded; head first and flat is the whole of the rule. The second hand stays on the grab rail because the platform is wet, low and moving, and a deckhand who goes in with the casualty in their arms has doubled the problem at the last moment.",
      drag: { to: "swim-platform", radius: 0.9, missNote: "Not onto the platform — horizontally, head first, with a hand on the grab rail; the casualty comes up flat and goes inboard through the gate." },
    },
    {
      id: "ladder-lock", kind: "turn", target: "ladder-lock",
      title: "Lock the boarding ladder down and close the platform gate",
      cue: "Swing the boarding ladder down and turn its lock until it seats, close the platform gate behind the casualty, and tell the captain the platform is clear.",
      why: "The ladder is locked down after the recovery because a second person in the water — the casualty's companion who went in to help, the crew member who slipped — needs a way up that does not depend on anyone's arms, and a ladder that swings free under a climber drops them back in. The gate closes because the platform is now wet, crowded and directly over propellers the captain will need again, and the captain's word to restart waits for the deck's word that the platform is clear.",
      turn: { turns: 1.25, label: "LADDER LOCK", readout: (t) => (t < 0.3 ? "ladder swinging" : t < 0.85 ? "lock engaging" : "locked · down") },
    },
    {
      id: "recount", kind: "select", target: "manifest-clipboard",
      title: "Count every head again against the manifest",
      cue: "With the casualty aboard and wrapped, count every head aboard against the manifest again — guests and crew — before the captain gets under way.",
      why: "A recovery is the moment a crew is most likely to have lost track of everyone else: guests moved to see, a crew member went forward, the spotter is still at the rail. The count is taken again against the manifest because the one thing worse than a person in the water is a second person in the water that nobody noticed while everyone watched the first, and the captain does not put the engines in gear until the number is closed.",
    },
    {
      id: "drill-log", kind: "select", target: "drill-log",
      title: "Log the drill",
      cue: "Enter the drill: the time from the dummy going over to the ring, to the button, to the casualty aboard; who did what; the swell that hid the dummy and the guest who went for the platform; what the crew will change.",
      why: "The drill log is what makes a drill training rather than theatre: the times are written so the next drill is measured against them, and the two problems — the lost sight in the swell, the guest heading for the platform — are written so the next brief includes them. The lifesaving rules want drills held and logged for exactly this reason: a crew that has written down what went wrong is a crew that will not be surprised by it when it is real.",
    },
    {
      id: "crew-checkin", kind: "select", target: "crew-radio",
      title: "Check in with the captain and the spotter",
      cue: "On the radio: the casualty aboard and wrapped, the platform clear and the ladder locked, the count closed, and how the spotter and the deck crew are after a drill that lost the dummy in a swell for a moment.",
      why: "The captain restarts the engines and resumes the charter on the strength of the deck's word that the platform is clear and the count is closed, and the spotter needs to hear that they can drop their arm. It is also the crew's own check-in: a drill that lost the dummy for a moment in a swell is a drill that showed everyone how a real one goes wrong, and the union's member assistance line is there for what the radio does not carry.",
    },
  ],

  interrupts: [
    {
      id: "swell-hides-casualty",
      kind: "Swell hides the casualty from the rail",
      after: "hold-the-bearing", delay: 2, seconds: 14,
      alert: "A swell has lifted between the yacht and the casualty — the spotter's arm is on empty water and the ring is out of sight too.",
      cue: "Call the captain on the intercom with the last bearing and the drift, and have the flybridge take the watch from height until the rail has the casualty again.",
      target: "flybridge-intercom",
      why: "A head in the water disappears behind a swell from deck height and reappears from the flybridge, which is why the bearing lives in two places — the rail's arm and the helm's eyes. The answer is to give the captain the last bearing and the drift before it is stale, so the flybridge can pick the casualty up from height; a spotter who runs along the rail to find them has left the bearing and taken the last known position with them.",
      missNote: "The swell passed and the rail had lost the casualty, the captain was never given the last bearing, and the yacht came round onto the wrong piece of water.",
      wrongNote: "The flybridge intercom — the last bearing and the drift go to the height that can see over the swell; the rail stays on its bearing.",
    },
    {
      id: "guest-to-platform",
      kind: "Guest heads for the swim platform with the shafts turning",
      after: "approach-from-downwind", delay: 2, seconds: 14,
      alert: "A guest has pushed aft through the cockpit and is reaching for the swim platform gate to help — the propeller indicator still shows the shafts turning.",
      cue: "Get to the swim platform gate first, hold it shut, and put the guest back inboard until the propellers are confirmed stopped.",
      target: "swim-gate",
      why: "A guest on the platform with the shafts turning is the second casualty of this recovery, and they are trying to help; the answer is the gate, held shut with the deckhand's body between the guest and the platform, and the words that send them back inboard. The propellers are confirmed stopped before that gate opens for anyone, including the crew — a guest who reaches the casualty first from a platform over turning shafts has not helped.",
      missNote: "The guest got onto the platform with the shafts turning and slipped reaching for the ring's line, and the recovery became two people in the water at the stern.",
      wrongNote: "The swim platform gate — held shut, the guest sent inboard; nobody goes down to the platform until the indicator and the captain say the shafts are stopped.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.6, YC5_ACCENT);

    // ------------------------------------------------------------ the water
    const water = box(g, 26, 0.02, 26, 0, 0.012, 0, 0xffffff, { rough: 0.12, metal: 0.3, cast: false });
    water.material = texturedMat(surfaceTexture((cx, w, h) => waterFace(cx, w, h, { base: "#10303c", mid: "#1a4a5a", crest: 340 }), { repeat: 5, px: 512 }), { rough: 0.12, metal: 0.3, color: 0xa4c4d4 });

    // ------------------------------------------------- the yacht, stern here
    const yacht = motorYacht(g, 2.2, -1.2, 9.0, { livery: { fleetName: "ESTUARY LADY", unitNumber: "MY-24" } });
    const P = yacht.userData.parts;
    const DECK = 1.25;
    const deck = group(g, 2.2, DECK, 0);
    holoTag(P.lifeRing, "life ring — throwable", 0, 0.5, 0, { css: YC5_CSS, w: 0.4 });
    const ringOnRail = group(deck, -1.4, 0.9, -1.0);
    const ringMesh = torus(ringOnRail, 0.3, 0.07, 0, 0, 0, 0xf06a2b, { rough: 0.7, seg: 8, seg2: 20 });
    ringMesh.rotation.y = Math.PI / 2;
    holoTag(ringOnRail, "ring — throw first", 0, 0.5, 0, { css: YC5_CSS, w: 0.34 });
    reg(hits, ringOnRail, "life-ring");
    // Casualty: a drill dummy in the water off the starboard quarter.
    const casualty = group(g, -2.6, 0.02, -3.2);
    const dummy = standingFigure(casualty, 0, 0, { lying: true, cloth: 0xf2c14b, trousers: 0x2b3138 });
    dummy.position.y = -0.1;
    const casualtyRing = torus(casualty, 0.6, 0.014, 0, 0.05, 0, YC5_ACCENT, { emissive: YC5_ACCENT, ei: 1.6, rough: 0.4, cast: false, seg: 6, seg2: 32 });
    casualtyRing.rotation.x = Math.PI / 2;
    holoTag(casualty, "casualty — drill dummy", 0, 0.9, 0, { css: "#d2312b", w: 0.44 });
    reg(hits, casualty, "casualty");
    const casualtyHome = casualty.position.clone();
    const ringInWater = torus(g, 0.3, 0.07, -2.0, 0.08, -2.6, 0xf06a2b, { rough: 0.7, seg: 8, seg2: 20 });
    ringInWater.rotation.x = Math.PI / 2;
    ringInWater.visible = false;
    const ringLine = hose(g, [[-2.0, 0.1, -2.6], [-0.8, 0.6, -2.0], [0.8, DECK + 0.9, -1.0]], 0.008, 0xf1f3f4, { steps: 8, rough: 0.8 });
    ringLine.visible = false;
    const swell = box(g, 6, 0.3, 1.2, -1.2, 0.1, -1.8, 0x7fa8b8, { rough: 0.2, metal: 0.3, opacity: 0.7, transparent: true, cast: false });
    swell.rotation.y = 0.5;
    swell.visible = false;
    // Swim platform, its gate and ladder; the propeller indicator at the cockpit station.
    const platform = group(g, 2.2, 0.35, -3.3);
    const platRing = box(platform, 3.6, 0.01, 1.2, 0, 0.08, 0, YC5_ACCENT, { emissive: YC5_ACCENT, ei: 1.0, rough: 0.4, cast: false, opacity: 0.4, transparent: true });
    void platRing;
    holoTag(platform, "swim platform", 0, 0.5, 0, { css: YC5_CSS, w: 0.3 });
    reg(hits, platform, "swim-platform");
    const platHit = box(platform, 1.2, 0.4, 1.0, -1.2, 0.3, 0, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(platform, "onto the platform — shafts turning?", -1.2, 0.85, 0, { css: "#d2312b", w: 0.62 });
    reg(hits, platHit, "platform-shafts-turning");
    const gate = group(deck, -0.8, 0, -2.75);
    const gateLeaf = box(gate, 0.7, 0.6, 0.03, 0.35, 0.5, 0, 0xc8ced4, { rough: 0.4, metal: 0.5 });
    holoTag(gate, "swim platform gate", 0, 1.0, 0, { css: YC5_CSS, w: 0.38 });
    reg(hits, gateLeaf, "swim-gate");
    const ladder = group(g, 3.4, 0.35, -3.9);
    for (const sx of [-0.15, 0.15]) cyl(ladder, 0.015, 0.015, 0.9, sx, -0.2, 0, 0xe4e8ec, { rough: 0.22, metal: 0.55, seg: 8 });
    for (let i = 0; i < 3; i++) box(ladder, 0.3, 0.02, 0.03, 0, -0.55 + i * 0.3, 0, 0xe4e8ec, { rough: 0.22, metal: 0.55 });
    ladder.rotation.x = 1.4;
    const ladderLock = group(g, 3.4, 0.5, -3.7);
    cyl(ladderLock, 0.04, 0.04, 0.04, 0, 0, 0, 0xe4e8ec, { rough: 0.22, metal: 0.55, seg: 10 });
    const lockLever = box(ladderLock, 0.02, 0.14, 0.02, 0, 0.05, 0.03, 0xe4e8ec, { rough: 0.22, metal: 0.55 });
    holoTag(ladderLock, "ladder lock", 0, 0.3, 0, { css: YC5_CSS, w: 0.26 });
    reg(hits, ladderLock, "ladder-lock");
    const sling = group(platform, 0.4, 0.2, 0.3);
    const slingLoop = torus(sling, 0.22, 0.03, 0, 0, 0, 0xf2c14b, { rough: 0.8, seg: 8, seg2: 20 });
    slingLoop.rotation.x = Math.PI / 2;
    holoTag(sling, "recovery sling", 0, 0.4, 0, { css: YC5_CSS, w: 0.3 });
    reg(hits, sling, "recovery-sling");
    // Cockpit station: MOB button, VHF handset, propeller indicator, approach call-out, flybridge intercom, crew radio.
    const station = group(deck, -1.6, 0, -0.4);
    box(station, 0.8, 0.95, 0.45, 0, 0.47, 0, 0xdfe3e6, { rough: 0.45, metal: 0.2 });
    const mob = group(station, -0.25, 0.98, 0.05);
    cyl(mob, 0.05, 0.05, 0.04, 0, 0, 0, 0xd2312b, { rough: 0.4, emissive: 0x4a0808, ei: 0.4, seg: 12 });
    holoTag(mob, "MOB button", 0, 0.22, 0, { css: "#d2312b", w: 0.26 });
    reg(hits, mob, "mob-button");
    const vhf = group(station, 0.2, 0.98, 0.05);
    box(vhf, 0.2, 0.08, 0.16, 0, 0.04, 0, 0x2b3138, { rough: 0.5 });
    box(vhf, 0.07, 0.04, 0.1, 0.16, 0.06, 0, 0x15181c, { rough: 0.5 });
    hose(vhf, [[0.16, 0.06, 0.05], [0.24, 0.02, 0.1], [0.2, -0.2, 0.15]], 0.006, 0x15181c, { steps: 5, rough: 0.8 });
    holoTag(vhf, "VHF handset", 0, 0.28, 0, { css: YC5_CSS, w: 0.28 });
    reg(hits, vhf, "vhf-handset");
    const prop = group(station, 0, 0.7, 0.24);
    box(prop, 0.24, 0.12, 0.03, 0, 0, 0, 0x2b3138, { rough: 0.5 });
    const propLamp = ball(prop, 0.03, 0, 0, 0.03, 0xf0645b, { emissive: 0xf0645b, ei: 1.6, seg: 8, seg2: 6 });
    holoTag(prop, "propeller indicator", 0, 0.2, 0, { css: YC5_CSS, w: 0.38 });
    reg(hits, prop, "prop-indicator");
    const callout = instrument(deck, -2.4, 0.55, -1.6, { ry: 0.6, idle: "RANGE · —", color: YC5_ACCENT, w: 0.1, d: 0.16 });
    box(deck, 0.24, 0.5, 0.24, -2.4, 0.25, -1.6, 0x2b3138, { rough: 0.6, metal: 0.4 });
    holoTag(callout, "approach call-out", 0, 0.16, 0, { css: YC5_CSS, w: 0.34 });
    reg(hits, callout, "approach-callout");
    const astern = group(station, 0.3, 0.7, 0.24);
    box(astern, 0.04, 0.16, 0.04, 0, 0, 0, 0x15181c, { rough: 0.5 });
    ball(astern, 0.03, 0, 0.1, 0, 0xd2312b, { rough: 0.5, seg: 8, seg2: 6 });
    holoTag(astern, "hard astern — casualty aft?", 0.2, 0.3, 0, { css: "#d2312b", w: 0.52 });
    reg(hits, astern, "hard-astern");
    const intercom = group(deck, -1.6, 1.3, 1.08);
    box(intercom, 0.16, 0.24, 0.06, 0, 0, 0, 0x2b3138, { rough: 0.5, metal: 0.4 });
    const icLamp = ball(intercom, 0.024, 0.05, 0.07, 0.035, 0x59c97b, { emissive: 0x59c97b, ei: 1.2, seg: 8, seg2: 6 });
    holoTag(intercom, "flybridge intercom", 0, 0.24, 0, { css: YC5_CSS, w: 0.36 });
    reg(hits, intercom, "flybridge-intercom");
    const radio = instrument(deck, -0.6, 0.55, -1.2, { ry: -0.4, idle: "CH · WORKING", color: YC5_ACCENT, w: 0.1, d: 0.16 });
    box(deck, 0.24, 0.5, 0.24, -0.6, 0.25, -1.2, 0x2b3138, { rough: 0.6, metal: 0.4 });
    holoTag(radio, "crew radio", 0, 0.16, 0, { css: YC5_CSS, w: 0.24 });
    reg(hits, radio, "crew-radio");
    // Spotter post at the aft rail, the spotter's own point beside it, and the jump-in hazard at the rail.
    const post = group(deck, -2.6, 0, -2.4);
    box(post, 0.4, 0.02, 0.4, 0, 0.01, 0, 0xf2c14b, { rough: 0.7 });
    cyl(post, 0.02, 0.02, 1.0, 0.15, 0.5, 0, 0xc8ced4, { rough: 0.45, metal: 0.6, seg: 8 });
    holoTag(post, "spotter post", 0, 1.2, 0, { css: YC5_CSS, w: 0.26 });
    reg(hits, post, "spotter-post");
    const spotter = standingFigure(deck, -2.4, -1.9, { ry: -2.3, cloth: 0x1f3a52, trousers: 0x2b3138, vest: 0xf06a2b, atStation: true });
    holoTag(spotter, "mate — spotter", 0, 1.9, 0, { css: YC5_CSS, w: 0.3 });
    const pointHit = box(deck, 0.5, 0.5, 0.5, -2.6, 0.9, -1.4, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(deck, "hold the bearing", -2.6, 1.3, -1.4, { css: YC5_CSS, w: 0.32 });
    reg(hits, pointHit, "spotter-point");
    const turnHit = box(deck, 0.4, 0.4, 0.4, -2.0, 0.9, -2.4, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(deck, "spotter — turn to help?", -2.0, 1.3, -2.4, { css: "#d2312b", w: 0.46 });
    reg(hits, turnHit, "spotter-turn-away");
    const jumpHit = box(deck, 0.5, 0.4, 0.5, -2.95, 0.6, -0.4, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(deck, "jump in after them?", -2.95, 1.1, -0.4, { css: "#d2312b", w: 0.42 });
    reg(hits, jumpHit, "jump-in");
    // Boards: the drill brief, the manifest, the drill log.
    const brief = holoPanel(deck, 0.8, 0.54, -0.6, 1.4, 1.08, (cx, w, h) => {
      cx.fillStyle = "#0e1a26"; cx.fillRect(0, 0, w, h); cx.fillStyle = YC5_CSS; cx.fillRect(0, 0, w, 6);
      cx.font = `600 ${Math.round(h * 0.1)}px 'Barlow Condensed', Arial, sans-serif`; cx.textAlign = "left"; cx.textBaseline = "middle";
      cx.fillStyle = "#dcefff"; cx.fillText("MOB DRILL BRIEF", w * 0.06, h * 0.13);
      cx.font = `${Math.round(h * 0.07)}px Arial, sans-serif`; cx.fillStyle = "#eef6ff";
      ["Spotter: mate · points · never looks away", "Throw: deckhand · ring first · upwind of them", "Call: MOB button · then VHF urgency call",
       "Approach: from downwind · casualty on captain's side", "Platform: only when the indicator says stopped", "Recovery: sling snug · horizontal · head first"]
        .forEach((l, i) => cx.fillText(l, w * 0.06, h * (0.28 + i * 0.115)));
    }, { accent: YC5_ACCENT });
    reg(hits, brief, "drill-brief-board");
    const table = group(deck, 0.4, 0, -0.6);
    cyl(table, 0.04, 0.05, 0.7, 0, 0.35, 0, 0xc8ced4, { rough: 0.35, metal: 0.5, seg: 8 });
    box(table, 0.8, 0.04, 0.6, 0, 0.72, 0, 0xb8935e, { rough: 0.6 });
    const clipboard = box(table, 0.24, 0.02, 0.32, 0.2, 0.75, 0, 0xf1f3f4, { rough: 0.6 });
    holoTag(table, "manifest", 0.2, 1.0, 0, { css: YC5_CSS, w: 0.24 });
    reg(hits, clipboard, "manifest-clipboard");
    const log = holoPanel(table, 0.42, 0.3, -0.2, 0.95, -0.1, (cx, w, h) => {
      cx.fillStyle = "#0e1a26"; cx.fillRect(0, 0, w, h); cx.fillStyle = YC5_CSS; cx.fillRect(0, 0, w, 6);
      cx.font = `600 ${Math.round(h * 0.13)}px 'Barlow Condensed', Arial, sans-serif`; cx.textAlign = "left"; cx.textBaseline = "middle";
      cx.fillStyle = "#dcefff"; cx.fillText("DRILL LOG", w * 0.06, h * 0.17);
      cx.font = `${Math.round(h * 0.1)}px Arial, sans-serif`; cx.fillStyle = "#eef6ff";
      ["Times: —", "Roles: —", "Remarks: —"].forEach((l, i) => cx.fillText(l, w * 0.06, h * (0.42 + i * 0.2)));
    }, { ry: 0.4, accent: YC5_ACCENT });
    reg(hits, log, "drill-log");
    // A guest in the cockpit, who will head aft.
    const guest = standingFigure(deck, 0.8, -1.6, { ry: 2.8, cloth: 0x6a4a8a, trousers: 0x2b3138, atStation: true });
    holoTag(guest, "guest", 0, 1.9, 0, { css: YC5_CSS, w: 0.18 });
    const guestHome = guest.position.clone();
    holoTag(g, "captain — flybridge helm", 2.2, DECK + 4.4, 5.5, { css: YC5_CSS, w: 0.42 });

    const waterTex = water.material.map;

    return {
      hits,
      spawnLook: new THREE.Vector3(-1.2, 0.6, -2.0),
      onStep() {},
      onStepComplete(step) {
        if (step.id === "post-the-spotter") spotter.rotation.y = -2.0;
        if (step.id === "throwable-first") { ringOnRail.visible = false; ringInWater.visible = true; ringLine.visible = true; }
        if (step.id === "button-and-call") repaint(radio.userData.screen, signFace("MOB · MARKED", { bg: "#240c0c", accent: "#f0645b", fg: "#ffd9d4", scale: 0.5 }));
        if (step.id === "approach-from-downwind") { casualty.position.set(0.2, 0.02, -3.9); ringInWater.position.set(0.6, 0.08, -3.7); ringLine.visible = false; repaint(callout.userData.screen, signFace("RANGE · ALONGSIDE", { bg: "#0d1c24", accent: YC5_CSS, fg: "#bfeaf7", scale: 0.45 })); }
        if (step.id === "props-stopped") propLamp.material = mat(0x59c97b, { emissive: 0x59c97b, ei: 1.6 });
        if (step.id === "sling-on") { slingLoop.position.set(-2.0, -0.2, 0.3); }
        if (step.id === "bring-aboard") { casualty.position.set(2.2, 0.45, -3.3); casualtyRing.visible = false; ringInWater.visible = false; }
        if (step.id === "ladder-lock") { ladder.rotation.x = 0; gateLeaf.rotation.y = 0; gateLeaf.position.x = 0.35; }
        if (step.id === "drill-log") {
          repaint(log.userData.face, (cx, w, h) => {
            cx.fillStyle = "#0e1a26"; cx.fillRect(0, 0, w, h); cx.fillStyle = "#59c97b"; cx.fillRect(0, 0, w, 6);
            cx.font = `600 ${Math.round(h * 0.13)}px 'Barlow Condensed', Arial, sans-serif`; cx.textAlign = "left"; cx.textBaseline = "middle";
            cx.fillStyle = "#dcefff"; cx.fillText("DRILL LOG", w * 0.06, h * 0.17);
            cx.font = `${Math.round(h * 0.1)}px Arial, sans-serif`; cx.fillStyle = "#e6f6ea";
            ["Times: ring · button · aboard — recorded", "Roles: spotter held · ring first · props stopped", "Remarks: swell hid dummy · guest to platform"].forEach((l, i) => cx.fillText(l, w * 0.06, h * (0.42 + i * 0.2)));
          });
        }
        if (step.id === "crew-checkin") icLamp.material = mat(0x4fd1ff, { emissive: 0x4fd1ff, ei: 1.2 });
      },
      onHazard() {},
      onInterrupt(it) {
        if (it.id === "swell-hides-casualty") { swell.visible = true; casualty.visible = false; }
        if (it.id === "guest-to-platform") { guest.position.set(-0.6, 0, -2.4); guest.rotation.y = Math.PI; }
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "swell-hides-casualty") { swell.visible = false; casualty.visible = true; casualty.position.set(casualtyHome.x - 0.4, 0.02, casualtyHome.z - 0.4); icLamp.material = mat(0xf2c14b, { emissive: 0xf2c14b, ei: 1.2 }); }
        if (it.id === "guest-to-platform") { guest.position.copy(guestHome); guest.rotation.y = 2.8; gateLeaf.rotation.y = 0; gateLeaf.position.x = 0.35; }
      },
      animate(t, dt, session) {
        const step = session?.step;
        if (waterTex?.offset) { waterTex.offset.x = t * 0.008; waterTex.offset.y = t * 0.006; }
        if (session?.turn && step?.id === "ladder-lock") lockLever.rotation.z = session.turn.amount * Math.PI * 2.5;
        if (casualty.visible && step && ["throwable-first", "button-and-call", "hold-the-bearing"].includes(step.id)) casualty.position.y = 0.02 + Math.sin(t * 1.5) * 0.06;
        if (swell.visible) swell.position.x = -1.2 + Math.sin(t) * 0.5;
        if (propLamp.material.emissiveIntensity > 1.5 && propLamp.material.emissive?.getHex?.() === 0xf0645b) propLamp.material.emissiveIntensity = 1.3 + Math.sin(t * 6) * 0.4;
        void dt; void CITY;
      },
    };
  },
};
