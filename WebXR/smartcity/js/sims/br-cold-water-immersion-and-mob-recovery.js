import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import { box, cyl, torus, hose, group, repaint, mat } from "../../../shared/kit.js";
import {
  stationPad, holoPanel, holoTag, standingFigure, reg,
  surfaceTexture, texturedMat, waterFace,
} from "../citykit.js";
import { workboat, skiff } from "../../../shared/fleet.js";
import { radio } from "../../../shared/toolkit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Cold Water Immersion & MOB Recovery VR — SF Bay Restoration &
// Cleanup, Pack B (vessel and marine operations).
//
// A workboat on a restoration job in the Bay, and a deckhand coiling a line
// at the port rail loses footing and goes over into cold water. The learner
// is the Inlandboatmen's Union deckhand who sees it, and the recovery runs
// exactly as the vessel's man-overboard drill on her station bill says:
// alarm and position marked, a throwable in the water, a spotter who never
// looks away, the master bringing her round, a sling to the casualty, a
// horizontal lift on the davit, and hypothermia care on deck. No time is
// given for anything — not how long a person lasts in the water, not how
// fast the turn is: those are the drill's and the medical advice's, never
// the station's. The workboat and the skiff are fleet.js builders.

const BRMO_ACCENT = 0x4f8fe0;
const BRMO_CSS = "#4f8fe0";

export const SIM_BR_COLD_WATER_IMMERSION_AND_MOB_RECOVERY = {
  id: "br-cold-water-immersion-and-mob-recovery",
  index: "330",
  domain: "Maritime & Ports",
  trade: "Inlandboatmen's Union (IBU) deckhand recovering a crewmate from cold Bay water by the vessel's man-overboard drill, with the master at the helm and a MEBA engineer on deck",
  category: "Maritime & Ports",
  district: "Maritime & Ports",
  weather: "wind",
  certification: "Inlandboatmen's Union (IBU) deck practice and drills; MEBA engineering; IMO STCW basic safety training in personal survival; USCG 46 CFR 160 approved personal flotation devices and 46 CFR 25 lifesaving equipment; OSHA 29 CFR 1926.106 and 29 CFR 1915.158 lifesaving equipment where work is over water; FCC 47 CFR 80 marine VHF for the distress call; the vessel's own man-overboard drill on her station bill",
  name: "Cold Water Immersion & MOB Recovery",
  title: simTitle("Cold Water Immersion & MOB Recovery"),
  tagline: "A crewmate over the side into cold Bay water, recovered by the vessel's drill: inflatable PFD on and strapped at the door, the rescue gear checked, the station bill read, the alarm raised and the position marked, the ring buoy thrown, eyes kept on him as the wake takes the buoy, the master called alongside, the sling passed, the davit taken up and a horizontal lift as he goes limp, hypothermia signs checked on deck, the distress call made and the drill logged",
  accent: BRMO_ACCENT,
  accentCss: BRMO_CSS,
  parSeconds: 300,
  footprint: 3.0,
  badge: { id: "eyes-on-him", name: "Eyes On Him", note: "Nobody jumped in, nobody hauled him over the rail, the spotter never looked away, he came up horizontal and was never walked, and both the lost buoy and the limp lift answered" },

  supportLine: "your union hall's member assistance programme — the Inlandboatmen's Union or MEBA — with the employer's employee assistance line behind it",

  game: system({
    name: "Rescue Deck",
    currency: "BUOY",
    ranks: ["Ordinary", "Deckhand", "Rescue Hand", "Lead Deckhand", "MOB Recovery Certified"],
    badges: [
      { id: "gear-checked", name: "Gear Checked", note: "The rescue gear checked before anyone needed it", test: AWARD.stepClean("rescue-gear") },
      { id: "alongside-true", name: "Alongside True", note: "The alongside call made inside the band first time", test: AWARD.precise(0.7) },
      { id: "nobody-else-in", name: "Nobody Else In", note: "Never in after him, never over the rail by hand, never looked away, never stood him up", test: AWARD.safe },
    ],
    challenges: [
      { id: "clean-drill", name: "Clean Drill", note: "No corrections from the station bill to the log", test: AWARD.clean },
      { id: "level-lift", name: "Level Lift", note: "The hoist held in band all the way up", test: AWARD.unbroken },
      { id: "by-the-bill", name: "By The Bill", note: "Drill logged inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "jump-in-after": "You went to the rail to jump in after him. Cold water takes a rescuer exactly as it took the casualty — the gasp, the loss of breath control, the arms that stop working — and a second person in the water is a second recovery for a crew that is now one short. The drill keeps everyone aboard and brings the casualty to the boat, not the crew to the casualty.",
    "lean-over-rail": "You leaned over the rail to haul him aboard by his collar. A person in cold water, clothes soaked, is far heavier than two arms over a rail, the rescuer is the one who goes over, and a casualty pulled up vertically out of cold water can collapse as the water's pressure comes off his body — he comes aboard on the sling and the davit, lying as flat as the gear allows.",
    "lose-sight": "You turned away from him to go and fetch the first aid kit. A head in the Bay's chop disappears from sight within a few boat lengths and is very hard to find again, and the spotter's one job in the drill is to point at the casualty and never look away until someone else has him — the kit comes from someone else.",
    "stand-him-up": "You went to stand him up and walk him into the wheelhouse to warm up. A casualty just out of cold water can collapse when he is stood upright, and rough handling of a chilled body is dangerous in itself — he stays lying down, is handled gently, and is insulated where he is until medical advice says otherwise.",
  },

  lateNotes: {
    "davit-winch": "The davit is taken up once the sling is on him and he is alongside at the recovery gate — not while he is still out in the water.",
    "recovery-gate": "The alongside call comes once the master is bringing her round to him and the spotter has him — not before the turn.",
    "drill-log": "The drill is logged once he is aboard, assessed and the call is made — last, not first.",
  },

  steps: [
    {
      id: "pfd-on", kind: "sequence", anyOrder: true,
      targets: ["inflatable-pfd", "crotch-strap"],
      itemNames: { "inflatable-pfd": "inflatable PFD on, zipped and buckled", "crotch-strap": "crotch strap clipped and snug" },
      title: "Inflatable PFD on and strapped at the wheelhouse door",
      cue: "At the wheelhouse door, before stepping onto the deck: inflatable PFD on and buckled, and the crotch strap clipped so it cannot ride up over your face when it fires.",
      why: "The first moments in cold water bring a gasp and a loss of breath control that a person cannot choose to stop, and a PFD is what keeps the mouth clear of the water through it. An inflatable that rides up over the face when it fires is worse than none, which is why the crotch strap is part of wearing it — and it is on before the deck, because nobody who goes over gets to put one on first.",
    },
    {
      id: "rescue-gear", kind: "find", noHint: true,
      targets: ["ringbuoy-light-dead", "lifesling-tied"],
      itemNames: { "ringbuoy-light-dead": "ring buoy's water light not working", "lifesling-tied": "rescue sling bag lashed shut to the rail" },
      itemNotes: {
        "ringbuoy-light-dead": "The water-activated light on the ring buoy does not come on when tested — in fading light or spray, the buoy and the person holding it become very hard to see.",
        "lifesling-tied": "The rescue sling's bag has been lashed shut to the rail with small stuff — in a recovery it has to come out in one pull, not be cut free.",
      },
      title: "Check the rescue gear at its stations",
      cue: "Walk the rescue gear before work starts: the ring buoy and its light, the throw bag, the rescue sling's bag, and the davit and its fall.",
      why: "Rescue gear sits in the weather for months and is only ever needed at once, so it fails from neglect rather than use: a dead light, a bag tied shut, a fall seized on its drum. The lifesaving equipment rules and the vessel's drill both assume the gear works; checking it at the start of the day is the only time anyone can fix it without somebody already in the water.",
    },
    {
      id: "station-bill", kind: "select", target: "station-bill",
      title: "Read your man-overboard duties on the station bill",
      cue: "Read the vessel's man-overboard drill on the station bill: who raises the alarm, who throws, who spots, who takes the helm, who rigs the davit, and who makes the call.",
      why: "A recovery goes right when each person does one job without being told, and the station bill is where those jobs are written down for this vessel and this crew. The drill is the vessel's own — how the master brings her round, which side the recovery gate is on, how the davit is rigged — and the learner's first job is to know their line in it before the day's work starts.",
    },
    {
      id: "raise-alarm", kind: "sequence",
      targets: ["mob-alarm", "mob-button"],
      itemNames: { "mob-alarm": "man-overboard alarm sounded and the side shouted", "mob-button": "position marked with the MOB button on the plotter" },
      outOfOrderNote: "The alarm and the shout come first — everyone on board has to know someone is in the water before anything else happens.",
      title: "Raise the alarm and mark the position",
      cue: "Your crewmate has gone over the port rail: shout 'man overboard, port side' and hit the alarm, then press the MOB button on the plotter to mark where he went in.",
      why: "The shout and the alarm put every person on board into their drill at once — the master to the helm, the engineer to the davit — and the side tells the master which way to turn. The MOB button fixes the position where he went in, because the boat and the casualty both drift, and a mark on the plotter is the one thing that does not.",
    },
    {
      id: "throw-buoy", kind: "drag", target: "ring-buoy",
      title: "Throw the ring buoy to him",
      cue: "Take the ring buoy off its bracket and throw it so it lands just beyond him and upwind, where he can reach it without swimming.",
      why: "The ring buoy gives a person in cold water something to hold that is not their own strength, and it marks where they are for everyone on deck. It is thrown past and upwind so the wind carries it to them, because swimming for it spends the arm strength the cold is already taking.",
      drag: { to: "casualty", radius: 0.8, missNote: "Not within reach — the buoy has to land just beyond him and upwind, not short of him where he has to swim for it." },
    },
    {
      id: "spot", kind: "hold", target: "casualty", seconds: 5,
      title: "Point at him and keep your eyes on him",
      cue: "Point at your crewmate with your whole arm and keep pointing, calling his position to the wheelhouse, while the master brings her round.",
      why: "A head in chop disappears within a few boat lengths, and the master turning the boat cannot watch the casualty and the water at the same time. The spotter points without stopping so the master can steer by the arm, and does not look away for anything — not the kit, not the davit — until the casualty is alongside.",
      holdBreakNote: "You looked away and lost him in the chop. Find him again and keep pointing until he is alongside.",
    },
    {
      id: "call-alongside", kind: "gauge", target: "recovery-gate",
      title: "Call 'alongside' as he reaches the recovery gate",
      cue: "Watch the gap close as the master brings the port side down to him, and call 'alongside' when he is at the recovery gate — not before and not past it.",
      why: "The master brings the boat to the casualty, with the engines stopped or clear of him as the drill says, and the deckhand at the gate is the one who can see exactly where he is against the hull. The call puts him at the gate where the sling and the davit can reach him; too early and he is still out of reach, too late and he is sliding aft toward the stern.",
      gauge: { label: "GAP TO THE GATE", speed: 0.72, green: [0.42, 0.58], readout: (t) => (t < 0.42 ? "still out of reach" : t <= 0.58 ? "at the recovery gate — alongside" : "sliding aft — past the gate"), missNote: "Outside the band — call it when he is at the recovery gate itself, not while he is still out of reach or once he is past it." },
    },
    {
      id: "pass-sling", kind: "drag", target: "rescue-sling",
      title: "Get the rescue sling over his head and under his arms",
      cue: "Pass the rescue sling down to him from inside the gate and see it over his head and under his arms, the fall clipped to the davit's hook.",
      why: "A casualty whose hands have gone useless in the cold cannot climb a ladder or hold a rope, and the sling does the holding for him. It goes on from inside the gate so nobody leans out, and it is clipped to the davit before any weight comes on, because the lift is the davit's job — not the crew's arms.",
      drag: { to: "casualty", radius: 0.8, missNote: "Not on him — the sling has to go over his head and under his arms, not float beside him." },
    },
    {
      id: "take-up", kind: "turn", target: "davit-winch",
      title: "Take the slack out of the davit fall",
      cue: "Wind the davit winch until the fall is just taut on the sling, checking the sling is seated under his arms before any weight comes on.",
      why: "Taking the slack up slowly lets the sling settle under the casualty's arms and lets the deck see that it is seated right before any of his weight comes on it. A fall snatched taut jerks a cold, stiff body against the hull; a fall taken up slowly is where the lift starts under control.",
      turn: { turns: 1.25, label: "DAVIT WINCH", readout: (t) => (t < 0.4 ? "slack in the fall" : t < 0.95 ? "fall coming taut" : "taut · sling seated") },
    },
    {
      id: "hoist", kind: "track", target: "davit-winch", seconds: 6,
      title: "Hoist him slowly and as level as the gear allows",
      cue: "Wind him up steadily clear of the water and in over the gate, keeping the lift slow and as close to horizontal as the sling allows.",
      why: "Lifting a person straight up out of cold water takes away the water's squeeze on the body all at once, and a casualty who seemed fine in the water can collapse on the way up. The hoist is slow and kept as level as the gear allows, and he comes in over the gate lying down, not standing — the last part of the rescue is the most dangerous part of it.",
      track: { start: 0.14, green: [0.42, 0.6], rise: 0.58, fall: 0.44, drift: 0.12, label: "LIFT", readout: (v) => (v < 0.42 ? "stalled — he is hanging in the water" : v > 0.6 ? "too fast — ease the winch" : "slow and level") },
      holdBreakNote: "The lift broke out of band — it stalled or snatched. Bring the winch back to a slow, steady lift and hold it.",
    },
    {
      id: "assess", kind: "find", noHint: true,
      targets: ["no-shivering", "confused-speech"],
      itemNames: { "no-shivering": "he has stopped shivering", "confused-speech": "slurred, confused answers" },
      itemNotes: {
        "no-shivering": "He was shivering hard in the water and now he is not — that is not him warming up; it is the body's cooling going deeper, and it makes this a medical emergency.",
        "confused-speech": "His answers are slow and confused and he does not know where he is — another sign of hypothermia deepening, and a reason to handle him very gently.",
      },
      title: "Check him on deck for signs of hypothermia",
      cue: "With him lying flat on the deck in the lee, wet outer layers off and into the hypothermia wrap, check what his body is telling you: shivering, how he answers, how he is breathing.",
      why: "What decides how a cold-water casualty is handled after the rescue is what his body is doing, not how long he was in: a man who has stopped shivering and is confused is more seriously chilled than one shivering hard, however short the swim. Those signs go to the medical advice on the call, and they are why he is kept flat, insulated and handled gently.",
    },
    {
      id: "distress-call", kind: "turn", target: "vhf-channel",
      title: "Make the call on the distress channel",
      cue: "Turn the VHF to Channel 16 and make the call the drill gives you: vessel, position, a crew member recovered from cold water with hypothermia signs, and a request for medical advice and help at the dock.",
      why: "A cold-water casualty needs medical care the boat cannot give, and the Coast Guard on the distress channel can bring medical advice to the deck and help to meet the boat. The call carries the position the MOB button marked and the signs the deck has just seen, because those are what the people on the other end decide by.",
      turn: { turns: 1, label: "VHF CHANNEL", readout: (t) => (t < 0.4 ? "working channel" : t < 0.95 ? "turning to 16" : "Channel 16 · calling") },
    },
    {
      id: "drill-log", kind: "select", target: "drill-log",
      title: "Log the overboard and the recovery",
      cue: "Log it: how he went over, the position marked, the buoy lost in the wake and the throw bag used, the lift and his collapse on the davit, the signs on deck, the call, and the dead buoy light and the tied sling bag.",
      why: "The log is the vessel's record for the marine casualty report and the company's investigation, and it is where a dead buoy light and a tied-shut sling bag become things that are fixed on every boat in the fleet. What went well and what nearly did not are both written down, because the next drill is built from this one.",
    },
    {
      id: "crew-checkin", kind: "select", target: "crew-radio",
      title: "Check in with the master, the engineer and the skiff",
      cue: "On the radio: he is aboard, wrapped and the call is made, what the gear needs, and how everyone is after pulling a crewmate out of cold water.",
      why: "The master turned the boat blind to what was happening at the gate, the engineer worked the davit, and the skiff stood by — each needs to hear how he is. It is also the crew's own check-in: watching a crewmate go limp on a davit stays with people, and the union's member assistance line is there for what does not get said on the radio, tonight or next week.",
    },
  ],

  interrupts: [
    {
      id: "buoy-washed-away",
      kind: "Buoy lost in the wake",
      after: "spot", delay: 2, seconds: 14,
      alert: "The boat's own wake has washed the ring buoy out of his hands and away — he is struggling to keep his head up in the chop.",
      cue: "Throw the throw bag so its line lands across him, keeping your other arm pointing at him.",
      target: "throw-bag",
      why: "A casualty whose hands are going in the cold cannot swim after a buoy that has drifted off, and every stroke he tries costs him. The throw bag puts a line across him that the deck can pull him in on, and it can be thrown by the spotter without ever taking their eyes off him.",
      missNote: "Nobody got anything else to him; he tried to swim for the buoy, went under twice in the chop, and was barely holding his head up when the boat came alongside.",
      wrongNote: "The throw bag — get a line across him while you keep him in sight.",
    },
    {
      id: "limp-on-davit",
      kind: "Casualty goes limp on the lift",
      after: "hoist", delay: 2, seconds: 14,
      alert: "He has gone limp as he clears the water — his head is dropping and the sling is taking him up bolt upright.",
      cue: "Hold the winch and get the second strop under his knees from the davit post, so he comes the rest of the way up horizontal.",
      target: "second-strop",
      why: "A cold-water casualty lifted vertically can collapse as the water's support comes off, and going limp on the way up is exactly that warning. The answer is to stop hoisting him upright and get the second strop under his knees so the rest of the lift is horizontal, even though it takes longer — speed is not what saves him now.",
      missNote: "The hoist carried on with him upright; he came over the gate with no response, and the crew were starting CPR on the deck before the call went out.",
      wrongNote: "The second strop on the davit post — stop the upright lift and bring him up horizontal.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 3.0, BRMO_ACCENT);

    // ------------------------------------------------------------ the water
    const water = box(g, 24, 0.02, 22, 0, 0.04, 0, 0xffffff, { rough: 0.12, metal: 0.25, cast: false });
    water.material = texturedMat(surfaceTexture((cx, w, h) => waterFace(cx, w, h, { base: "#10283a", mid: "#17384e", crest: 360 }), { repeat: 5, px: 512 }), { rough: 0.12, metal: 0.25, color: 0xa8c8dc });

    // ----------------------------- the workboat, stern to the learner, deck 0.41
    const DECK = 0.41;
    const wb = workboat(g, 0, -0.79, -1.5, { ry: Math.PI, livery: { fleetName: "HARBOR WORKS", unitNumber: "WB-8" } });
    const { davit } = wb.userData.parts;
    void davit;

    // --------------------------------------------- the casualty and his gear
    const casualty = standingFigure(g, -0.9, 1.6, { ry: -Math.PI / 2, vest: 0xf06a2b, helmet: 0xf1f3f4, gloves: true, atStation: true });
    casualty.position.y = DECK;
    const casTag = holoTag(g, "deckhand coiling a line", -0.9, DECK + 1.95, 1.6, { css: BRMO_CSS, w: 0.4 });
    const socket = group(g, -2.5, 0.2, 0.5);
    const socketRing = torus(socket, 0.5, 0.012, 0, 0, 0, BRMO_ACCENT, { emissive: BRMO_ACCENT, ei: 1.6, rough: 0.4, cast: false, seg: 6, seg2: 24 });
    socketRing.rotation.x = Math.PI / 2;
    socketRing.visible = false;
    reg(hits, socket, "casualty");
    const splash = box(g, 1.0, 0.03, 1.0, -2.5, 0.06, 0.5, 0xe8f6fa, { rough: 0.3, emissive: 0xa0d8e8, ei: 0.5, cast: false });
    splash.visible = false;
    const buoyG = group(g, -1.2, DECK + 0.75, 1.25);
    const buoy = torus(buoyG, 0.2, 0.06, 0, 0, 0, 0xf06a2b, { rough: 0.6, seg: 8, seg2: 18 });
    buoy.rotation.y = Math.PI / 2;
    const buoyLight = box(buoyG, 0.05, 0.1, 0.05, 0, 0.26, 0, 0x2a2a1a, { rough: 0.4, emissive: 0x1a1a08, ei: 0.2 });
    reg(hits, buoyLight, "ringbuoy-light-dead");
    holoTag(buoyG, "ring buoy", 0, 0.42, 0, { css: BRMO_CSS, w: 0.2 });
    reg(hits, buoyG, "ring-buoy");
    const throwBag = group(g, -1.15, DECK + 0.75, 1.9);
    cyl(throwBag, 0.08, 0.08, 0.22, 0, 0, 0, 0xe0b02e, { rough: 0.7, seg: 10 });
    holoTag(throwBag, "throw bag", 0, 0.25, 0, { css: BRMO_CSS, w: 0.2 });
    reg(hits, throwBag, "throw-bag");
    const bagLine = hose(g, [[-1.15, DECK + 0.7, 1.9], [-1.9, 0.6, 1.3], [-2.5, 0.12, 0.55]], 0.01, 0xe0b02e, { steps: 10, rough: 0.7 });
    bagLine.visible = false;
    const slingBag = group(g, -1.15, DECK + 0.6, -0.35);
    box(slingBag, 0.14, 0.4, 0.3, 0, 0, 0, 0xe0592a, { rough: 0.7 });
    const tie = box(slingBag, 0.16, 0.03, 0.32, 0, 0.1, 0, 0xf2f2ee, { rough: 0.8 });
    reg(hits, tie, "lifesling-tied");
    const sling = group(g, -0.85, DECK + 0.05, 0.9);
    torus(sling, 0.22, 0.04, 0, 0.04, 0, 0xe0592a, { rough: 0.7, seg: 8, seg2: 16 }).rotation.x = Math.PI / 2;
    holoTag(sling, "rescue sling", 0, 0.3, 0, { css: BRMO_CSS, w: 0.24 });
    reg(hits, sling, "rescue-sling");

    // --------------------------------------- davit winch, fall, second strop
    const winch = group(g, -0.55, DECK, 0.1);
    box(winch, 0.3, 0.36, 0.26, 0, 0.18, 0, 0x2f4f6f, { rough: 0.55, metal: 0.4 });
    const winchDrum = cyl(winch, 0.08, 0.08, 0.3, 0, 0.44, 0, 0x8a949d, { rough: 0.4, metal: 0.7, seg: 12 });
    winchDrum.rotation.z = Math.PI / 2;
    const crank = box(winch, 0.03, 0.2, 0.03, 0.18, 0.44, 0, 0xd2312b, { rough: 0.5 });
    holoTag(winch, "davit winch", 0, 0.75, 0, { css: BRMO_CSS, w: 0.24 });
    reg(hits, winch, "davit-winch");
    const fall = hose(g, [[-1.6, 2.4, 0.4], [-2.0, 1.2, 0.45], [-2.45, 0.35, 0.5]], 0.01, 0xb0b4b8, { steps: 8, rough: 0.5 });
    fall.visible = false;
    const strop = group(g, -0.6, DECK + 0.95, 0.75);
    cyl(strop, 0.02, 0.02, 0.9, 0, -0.45, 0, 0x8a949d, { rough: 0.45, metal: 0.7, seg: 8 });
    const stropBand = box(strop, 0.3, 0.06, 0.04, 0, 0.02, 0, 0xe0592a, { rough: 0.7 });
    holoTag(strop, "second strop", 0, 0.22, 0, { css: BRMO_CSS, w: 0.24 });
    reg(hits, strop, "second-strop");
    const kneeStrop = box(g, 0.5, 0.05, 0.06, -2.1, 0.9, 0.5, 0xe0592a, { rough: 0.7 });
    kneeStrop.visible = false;

    // ---------------------------------------------- the recovery gate gauge
    const gate = group(g, -1.05, DECK, 0.45);
    cyl(gate, 0.025, 0.025, 1.0, 0, 0.5, 0, 0x8a949d, { rough: 0.45, metal: 0.7, seg: 8 });
    const dial = box(gate, 0.24, 0.18, 0.04, 0.02, 1.02, 0, 0x101820, { rough: 0.4, emissive: 0x0d1c24, ei: 0.4 });
    dial.rotation.y = -Math.PI / 2;
    const needle = box(gate, 0.012, 0.012, 0.08, -0.01, 1.02, 0, 0xd2312b, { rough: 0.4 });
    holoTag(gate, "recovery gate", 0, 1.28, 0, { css: BRMO_CSS, w: 0.26 });
    reg(hits, gate, "recovery-gate");

    // --------------------------------------- wheelhouse wall: alarm, plotter, VHF
    const alarm = group(g, 0.85, DECK + 1.0, -0.94);
    box(alarm, 0.14, 0.14, 0.05, 0, 0, 0, 0xf2c14b, { rough: 0.5 });
    const alarmBtn = cyl(alarm, 0.04, 0.04, 0.03, 0, 0, 0.035, 0xd2312b, { rough: 0.5, seg: 12 });
    alarmBtn.rotation.x = Math.PI / 2;
    holoTag(alarm, "MOB alarm", 0, 0.16, 0.03, { css: BRMO_CSS, w: 0.2 });
    reg(hits, alarm, "mob-alarm");
    const plotter = group(g, 0.35, DECK + 1.05, -0.94);
    box(plotter, 0.32, 0.22, 0.05, 0, 0, 0, 0x15181c, { rough: 0.4 });
    const plotScreen = box(plotter, 0.26, 0.16, 0.005, 0, 0, 0.03, 0x0d2a3a, { rough: 0.3, emissive: 0x1a5a7a, ei: 0.6 });
    const mobMark = box(plotter, 0.03, 0.03, 0.006, 0.05, 0.02, 0.034, 0xd2312b, { emissive: 0xd2312b, ei: 1.2 });
    mobMark.visible = false;
    holoTag(plotter, "plotter — MOB button", 0, 0.2, 0.03, { css: BRMO_CSS, w: 0.36 });
    reg(hits, plotter, "mob-button");
    const vhfG = group(g, -0.4, DECK + 1.0, -0.94);
    box(vhfG, 0.26, 0.1, 0.12, 0, 0, 0, 0x2b3138, { rough: 0.5, metal: 0.3 });
    const knob = cyl(vhfG, 0.025, 0.025, 0.03, 0.08, 0, 0.07, 0xc8ced4, { rough: 0.4, seg: 10 });
    knob.rotation.x = Math.PI / 2;
    const chLamp = box(vhfG, 0.08, 0.04, 0.005, -0.05, 0, 0.062, 0x0d1c24, { rough: 0.3, emissive: 0x2a6f8f, ei: 0.6 });
    holoTag(vhfG, "VHF — channel knob", 0, 0.16, 0.06, { css: BRMO_CSS, w: 0.34 });
    reg(hits, vhfG, "vhf-channel");
    const crewRadio = radio(g, 0.95, DECK + 0.9, -0.3, { ry: -0.4 });
    holoTag(g, "crew radio", 0.95, DECK + 1.25, -0.28, { css: BRMO_CSS, w: 0.22 });
    reg(hits, crewRadio, "crew-radio");

    // ------------------------------------------------------ PFD rack, boards
    const rack = group(g, 0.95, DECK, 0.4);
    cyl(rack, 0.022, 0.022, 1.3, 0, 0.65, 0, 0x8a949d, { rough: 0.45, metal: 0.7, seg: 8 });
    const pfd = group(rack, 0, 1.0, 0.07);
    box(pfd, 0.28, 0.12, 0.12, -0.08, 0, 0, 0xd2312b, { rough: 0.7 });
    box(pfd, 0.28, 0.12, 0.12, 0.08, 0, 0, 0xd2312b, { rough: 0.7 });
    holoTag(rack, "inflatable PFD", 0, 1.45, 0, { css: BRMO_CSS, w: 0.26 });
    reg(hits, pfd, "inflatable-pfd");
    const strap = box(rack, 0.04, 0.3, 0.02, 0, 0.78, 0.1, 0x2b3138, { rough: 0.7 });
    holoTag(rack, "crotch strap", 0.2, 0.75, 0.1, { css: BRMO_CSS, w: 0.22 });
    reg(hits, strap, "crotch-strap");
    const drawBill = (cx, w, h, done) => {
      cx.fillStyle = "#081222"; cx.fillRect(0, 0, w, h); cx.fillStyle = done ? "#59c97b" : BRMO_CSS; cx.fillRect(0, 0, w, 6);
      cx.font = `600 ${Math.round(h * 0.1)}px 'Barlow Condensed', Arial, sans-serif`; cx.textAlign = "left"; cx.textBaseline = "middle";
      cx.fillStyle = "#d8e6fa"; cx.fillText("STATION BILL — MAN OVERBOARD", w * 0.05, h * 0.12);
      cx.font = `${Math.round(h * 0.066)}px Arial, sans-serif`; cx.fillStyle = "#eaf2fc";
      ["Whoever sees it: shout the side, alarm", "Deckhand 1: throw, then point — never look away", "Master: helm, MOB mark, round per drill",
        "Engineer: rig the davit and the strops", "Deckhand 2: sling at the recovery gate", "Lift: slow, as level as the gear allows",
        "Master: call on Channel 16 per the drill"].forEach((l, i) => cx.fillText(l, w * 0.05, h * (0.26 + i * 0.105)));
    };
    const bill = holoPanel(g, 0.84, 0.54, -1.05, 1.7, -0.7, (cx, w, h) => drawBill(cx, w, h, false), { ry: 0.5, accent: BRMO_ACCENT });
    reg(hits, bill, "station-bill");
    const drawLog = (cx, w, h, rows, done) => {
      cx.fillStyle = "#081222"; cx.fillRect(0, 0, w, h); cx.fillStyle = done ? "#59c97b" : BRMO_CSS; cx.fillRect(0, 0, w, 6);
      cx.font = `600 ${Math.round(h * 0.12)}px 'Barlow Condensed', Arial, sans-serif`; cx.textAlign = "left"; cx.textBaseline = "middle";
      cx.fillStyle = "#d8e6fa"; cx.fillText("LOG — MAN OVERBOARD", w * 0.06, h * 0.15);
      cx.font = `${Math.round(h * 0.082)}px Arial, sans-serif`; cx.fillStyle = done ? "#e6f6ea" : "#eaf2fc";
      rows.forEach((l, i) => cx.fillText(l, w * 0.06, h * (0.36 + i * 0.16)));
    };
    const dlog = holoPanel(g, 0.66, 0.46, 1.05, 1.7, -0.75, (cx, w, h) => drawLog(cx, w, h, ["Event: —", "Recovery: —", "Casualty: —", "Gear: —"], false), { ry: -0.5, accent: BRMO_ACCENT });
    reg(hits, dlog, "drill-log");

    // ------------------------------------------ hypothermia signs on deck
    const signShiver = box(g, 0.08, 0.08, 0.08, 0.25, DECK + 0.3, 1.85, BRMO_ACCENT, { emissive: BRMO_ACCENT, ei: 0.8, rough: 0.4 });
    signShiver.visible = false;
    reg(hits, signShiver, "no-shivering");
    const signSpeech = box(g, 0.08, 0.08, 0.08, 0.25, DECK + 0.3, 0.95, BRMO_ACCENT, { emissive: BRMO_ACCENT, ei: 0.8, rough: 0.4 });
    signSpeech.visible = false;
    reg(hits, signSpeech, "confused-speech");
    const wrap = box(g, 0.6, 0.12, 1.7, 0.1, DECK + 0.1, 1.4, 0xc8d0d8, { rough: 0.3, metal: 0.6 });
    wrap.visible = false;

    // -------------------------------------------------- hazard targets
    const jumpHit = box(g, 0.4, 0.6, 0.5, -1.2, DECK + 0.5, -0.05, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "jump in after him?", -1.25, DECK + 1.05, -0.05, { css: "#d2312b", w: 0.34 });
    reg(hits, jumpHit, "jump-in-after");
    const railHit = box(g, 0.4, 0.5, 0.5, -1.2, DECK + 0.6, 2.2, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "haul him over the rail by hand?", -1.25, DECK + 1.1, 2.35, { css: "#d2312b", w: 0.52 });
    reg(hits, railHit, "lean-over-rail");
    const kit = group(g, 0.5, DECK, -0.45);
    box(kit, 0.36, 0.22, 0.2, 0, 0.11, 0, 0x2f8f5a, { rough: 0.6 });
    holoTag(kit, "fetch the first aid kit yourself?", 0, 0.42, 0, { css: "#d2312b", w: 0.52 });
    reg(hits, kit, "lose-sight");
    const standHit = box(g, 0.5, 0.5, 0.5, 0.75, DECK + 0.3, 1.9, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "stand him up and walk him inside?", 0.8, DECK + 0.75, 2.0, { css: "#d2312b", w: 0.56 });
    reg(hits, standHit, "stand-him-up");

    // ------------------------------------------------ the skiff, the engineer
    const sk = skiff(g, 5.6, -0.3, -3.2, { ry: -0.6, livery: { fleetName: "HARBOR WORKS", unitNumber: "SK-2" } });
    const skHand = standingFigure(sk, 0, -0.9, { ry: 0.3, vest: 0xf06a2b, helmet: 0xf1f3f4, gloves: true, atStation: true });
    skHand.position.y = 0.8;
    holoTag(sk, "work skiff — standing by", 0, 2.7, -0.9, { css: BRMO_CSS, w: 0.42 });
    const skHome = sk.position.clone();
    const engineer = standingFigure(g, 0.3, -0.25, { ry: Math.PI, vest: 0xf06a2b, cloth: 0x3f4a55, gloves: true, atStation: true });
    engineer.position.y = DECK;
    holoTag(engineer, "MEBA engineer", 0, 1.95, 0, { css: BRMO_CSS, w: 0.28 });

    const waterTex = water.material.map;
    const toWater = () => {
      casualty.position.set(-2.5, -1.3, 0.5); casualty.rotation.set(0, Math.PI / 2, 0);
      casTag.position.set(-2.5, 0.75, 0.5); socketRing.visible = true; splash.visible = true;
    };
    return {
      hits,
      spawnLook: new THREE.Vector3(-1.0, 0.8, 0.8),
      onStep(step) {
        if (step?.id === "raise-alarm") toWater();
      },
      onStepComplete(step) {
        if (step.id === "rescue-gear") { buoyLight.material = mat(0xf2e6a0, { emissive: 0xf2e6a0, ei: 1.2 }); tie.visible = false; }
        if (step.id === "raise-alarm") { mobMark.visible = true; plotScreen.material = mat(0x0d2a3a, { emissive: 0x2a7a9a, ei: 0.8 }); }
        if (step.id === "throw-buoy") { buoyG.position.set(-2.25, 0.12, 0.7); splash.visible = false; }
        if (step.id === "call-alongside") casualty.position.set(-1.75, -1.3, 0.5);
        if (step.id === "pass-sling") { sling.position.set(-1.75, 0.1, 0.5); fall.visible = true; }
        if (step.id === "take-up") crank.rotation.x = 1.2;
        if (step.id === "hoist") {
          casualty.position.set(0.1, DECK + 0.18, 2.3); casualty.rotation.set(-Math.PI / 2, 0, 0);
          casTag.position.set(0.1, DECK + 0.8, 1.4); fall.visible = false; kneeStrop.visible = false; sling.visible = false;
          signShiver.visible = true; signSpeech.visible = true; wrap.visible = true; socketRing.visible = false;
        }
        if (step.id === "distress-call") chLamp.material = mat(0x2a6f8f, { emissive: 0xd2312b, ei: 1.0 });
        if (step.id === "drill-log") {
          repaint(dlog.userData.face, (cx, w, h) => drawLog(cx, w, h, ["Event: overboard port rail, MOB marked", "Recovery: buoy lost, throw bag, davit", "Casualty: limp on lift, horizontal, wrapped", "Gear: buoy light dead, sling bag tied"], true));
          repaint(bill.userData.face, (cx, w, h) => drawBill(cx, w, h, true));
        }
        if (step.id === "crew-checkin") crewRadio.userData.show?.("CH 06\nALL OK");
      },
      onHazard() {},
      onInterrupt(it) {
        if (it.id === "buoy-washed-away") { buoyG.position.set(-3.8, 0.12, 2.4); casualty.position.y = -1.42; }
        if (it.id === "limp-on-davit") { casualty.position.set(-2.0, -0.6, 0.5); casualty.rotation.set(0, Math.PI / 2, 0.15); }
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "buoy-washed-away") { bagLine.visible = true; casualty.position.y = -1.3; throwBag.visible = false; }
        if (it.id === "limp-on-davit") { kneeStrop.visible = true; stropBand.visible = false; casualty.rotation.set(-Math.PI / 2 + 0.2, Math.PI / 2, 0); casualty.position.set(-1.9, 0.2, 0.9); sk.position.set(skHome.x - 1.5, skHome.y, skHome.z + 1.0); }
      },
      animate(t, dt, session) {
        const step = session?.step;
        if (waterTex?.offset) { waterTex.offset.x = t * 0.005; waterTex.offset.y = t * 0.007; }
        const gg = session?.gauge;
        if (gg && !gg.committed && step?.id === "call-alongside") { needle.rotation.x = -1.0 + gg.t * 2.0; casualty.position.x = -2.5 + gg.t * 1.2; }
        if (session?.turn && step?.id === "take-up") winchDrum.rotation.x = session.turn.amount * 6;
        if (session?.turn && step?.id === "distress-call") knob.rotation.z = session.turn.amount * 4;
        if (step?.id === "hoist" && session.holding) winchDrum.rotation.x += (dt ?? 0.016) * 3 * (session.track?.v ?? 0.5);
        if (splash.visible) splash.scale.set(1 + Math.sin(t * 3) * 0.1, 1, 1 + Math.sin(t * 3) * 0.1);
      },
    };
  },
};
