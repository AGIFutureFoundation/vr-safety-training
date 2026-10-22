import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import { box, cyl, ball, torus, hose, group, mat, repaint, signFace } from "../../../shared/kit.js";
import {
  CITY, stationPad, holoPanel, holoTag, instrument, standingFigure, reg,
  surfaceTexture, texturedMat, waterFace,
} from "../citykit.js";
import { motorYacht } from "../../../shared/fleet.js";
import { marinaBerth } from "../../../shared/props.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Pre-Departure Safety Briefing & Guest Count VR — Maritime &
// Ports, the yacht and charter crew pack.
//
// The aft deck of a mid-size motor yacht at her marina berth, guests coming
// aboard for a charter: the captain's standing orders on the crew board, the
// manifest on its clipboard, the life-jacket locker, the muster point placard
// on the saloon bulkhead, the gangway with its chain, the no-go chains at the
// foredeck and the swim platform, and the cockpit intercom to the flybridge.
// The learner is the deckhand-steward; the captain is on the flybridge and the
// mate is on the dock. The yacht, the marina and the guests are generic; no
// passenger limit is stated — that number is the vessel's certificate.

const YC1_ACCENT = 0x2b6f9e;
const YC1_CSS = "#2b6f9e";

export const SIM_YC_PRE_DEPARTURE_SAFETY_BRIEFING_AND_GUEST_COUNT = {
  id: "yc-pre-departure-safety-briefing-and-guest-count",
  index: "yc-1",
  domain: "Maritime & Ports",
  trade: "Charter yacht deckhand and steward, IBU and SIU trained, with an MEBA engineer aboard and the captain on the flybridge",
  category: "Maritime & Ports",
  district: "Maritime & Ports",
  weather: "clear",
  certification: "IBU and SIU deck training for small passenger and charter vessel crew; MEBA engineering watch; USCG lifesaving equipment and passenger safety rules at 46 CFR 25 and 46 CFR 199 as the vessel's certificate applies them; 33 CFR 83 Inland Navigation Rules; OSHA 29 CFR 1910.132 personal protective equipment; IMO STCW basic safety training; marine VHF practice under 47 CFR 80",
  name: "Pre-Departure Safety Briefing & Guest Count",
  title: simTitle("Pre-Departure Safety Briefing & Guest Count"),
  tagline: "Guests coming aboard for a charter: the standing orders read at the crew board, vest and radio on, the deck walked for the jammed locker and the open hatch, every head counted against the manifest through a late arrival at the gangway, the life jacket shown, the muster point and the no-go areas set, the hailer brought into band, the standing orders read back to the captain while a guest lights up at the fuel fill, the weather door dogged, the count logged and the crew checked in",
  accent: YC1_ACCENT,
  accentCss: YC1_CSS,
  parSeconds: 270,
  footprint: 2.6,
  badge: { id: "every-head-counted", name: "Every Head Counted", note: "The manifest matched before a line was touched, the life jacket shown rather than pointed at, and both the late guest and the lit cigarette answered" },

  supportLine: "your union hall's member assistance programme — the IBU, SIU or MEBA — with the operator's employee assistance line behind it",

  game: system({
    name: "Charter Deck",
    currency: "KNOT",
    ranks: ["Green Hand", "Deckhand", "Lead Deckhand", "Mate", "Charter Deck Certified"],
    badges: [
      { id: "orders-first", name: "Orders First", note: "The standing orders read before anyone else was briefed", test: AWARD.stepClean("standing-orders") },
      { id: "heard-aft", name: "Heard Aft", note: "Hailer level committed inside the band first time", test: AWARD.precise(0.7) },
      { id: "feet-on-deck", name: "Feet On Deck", note: "Never a count from the gunwale, never a key turned or a line cast before the count", test: AWARD.safe },
    ],
    challenges: [
      { id: "clean-briefing", name: "Clean Briefing", note: "No corrections from the crew board to the log", test: AWARD.clean },
      { id: "steady-readback", name: "Steady Read-Back", note: "The read-back held in band the whole way through", test: AWARD.unbroken },
      { id: "slack-water", name: "Slack Water", note: "Count logged inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "gunwale-stand": "You climbed onto the gunwale to count heads over the guests' shoulders. The gunwale is the narrowest, wettest, most crowded footing on the vessel and it sits directly over the gap between the hull and the dock; a deckhand who goes in there while the yacht is working against her lines is crushed before anyone can pull them out. Heads are counted from the deck, walking the group, or from the flybridge ladder with a hand on the rail.",
    "start-key": "You reached for the engine start before the count was closed and the lines were tended. An engine turning at the berth puts a propeller in the water under the swim platform where a late guest is still stepping across, and a wash against the dock that pulls the gangway with it. The count closes, the gangway comes in and the captain calls for the engines — in that order and no other.",
    "stern-line-early": "You started casting off the stern line while guests were still coming aboard. A yacht whose stern is free swings on her spring the moment the tide or a wake catches her, and the gap at the gangway opens under whoever is halfway across it. No line comes off until the count is closed, the gangway is aboard and the captain has asked for that line by name.",
    "under-seat-locker": "You stowed the guests' life jackets under the cockpit seat cushions to tidy the deck. A life jacket a guest cannot see is a life jacket they will not find when the vessel is heeling and the lights are out; the lifesaving rules want them stowed where they are marked and reachable, and the briefing shows the guests exactly where that is, with the locker open.",
  },

  lateNotes: {
    "departure-log": "The count is logged once it has closed against the manifest and the briefing has been given — last, not first.",
    "cockpit-intercom": "The standing orders are read back to the captain once the count is closed and the guests are briefed — the read-back is a report, not a plan.",
  },

  steps: [
    {
      id: "standing-orders", kind: "select", target: "orders-board",
      title: "Read the captain's standing orders at the crew board",
      cue: "Read the standing orders on the crew board: the passenger limit for this trip per the vessel's certificate, who counts, where guests may and may not go, and what the captain wants to hear before a line moves.",
      why: "A charter starts as a page of orders because the vessel's certificate, not the booking, decides how many people she may carry and where they may stand while she is under way. The standing orders are where the captain has written that down in advance, so the crew are not working it out with guests already on the swim platform; the Coast Guard's small passenger vessel rules assume the crew know the number and the areas before the first guest arrives, and a deckhand who has not read the board is working from memory of a different trip.",
    },
    {
      id: "vest-and-radio", kind: "sequence", anyOrder: true,
      targets: ["crew-vest", "handheld-vhf"],
      itemNames: { "crew-vest": "crew work vest", "handheld-vhf": "handheld marine radio" },
      title: "Put on the work vest and clip on the handheld radio",
      cue: "Work vest on and fastened over the uniform, the handheld radio on its clip and turned to the working channel the standing orders name.",
      why: "The deckhand works the gangway and the side deck through the whole boarding, low over the gap between the hull and the dock, and the vest is what the mate recovers them by if a wake puts them in that gap. The radio is on before the guests because the captain on the flybridge cannot see the gangway from the helm, and every count, every late arrival and every problem at the dock reaches the captain by that channel — a deckhand without a radio is a deckhand the captain has to shout for.",
    },
    {
      id: "deck-walk", kind: "find", noHint: true,
      targets: ["locker-latch-jammed", "deck-hatch-open"],
      itemNames: { "locker-latch-jammed": "life-jacket locker with its latch jammed", "deck-hatch-open": "cockpit deck hatch left open" },
      itemNotes: {
        "locker-latch-jammed": "The life-jacket locker's latch is jammed half-closed — a guest told to reach the jackets here would find a lid that does not open, and the crew would find out at the worst possible moment.",
        "deck-hatch-open": "The cockpit sole hatch over the lazarette is standing open in the walkway where the guests will stand for the briefing — an open hatch in a crowd is a broken leg before anyone has left the berth.",
      },
      title: "Walk the guest deck before the guests arrive",
      cue: "Walk the aft deck and the side decks as the guests will use them: lockers that open, hatches closed and dogged, nothing on the sole to trip on, the rails secure.",
      why: "Everything the briefing is about to promise the guests — the jackets are here, the muster point is here, this is where you stand — has to be true when they need it, and the only way to know is to try each of them before the guests arrive. A locker that does not open and a hatch left open by whoever loaded the stores are the two most common findings on a charter deck, and both are found by a deckhand walking the deck with a hand on each latch rather than glancing across it from the gangway.",
    },
    {
      id: "guest-count", kind: "hold", target: "manifest-clipboard", seconds: 5,
      title: "Count every head against the manifest",
      cue: "With the guests aboard and gathered aft, count heads against the manifest names on the clipboard and hold the count until it closes — every name, every head, nobody counted twice.",
      why: "The count is the single number the captain will report if anything goes wrong on the water, and it is the number the crew will search for in the dark if someone goes over the side. It is taken slowly, against names, with the gangway watched, because a count that is one high or one low is a search for a person who is on the dock or a person left in the water. The rules that govern the passenger limit assume the crew know how many are aboard at every moment, not roughly.",
      holdBreakNote: "The count broke before it closed — a head missed or a name skipped. Start the count again from the first name on the manifest.",
    },
    {
      id: "show-lifejacket", kind: "drag", target: "demo-lifejacket",
      title: "Show the guests a life jacket, on a person, from the locker they will use",
      cue: "Take a life jacket from the locker and put it on the guest who volunteered: over the head, the straps clipped and snugged, the whistle and light pointed out, from the locker the guests will actually reach.",
      why: "A life jacket held up and pointed at is a life jacket most guests will put on backwards in the dark, and a briefing that says 'the jackets are in that locker' has told them nothing about a locker they have not opened. The lifesaving rules put the jackets where the passengers are and the briefing shows them on a body, because the moment the jackets are needed is exactly the moment nobody can be taught anything; the whole of the briefing is spent so that moment is a repetition, not a lesson.",
      drag: { to: "volunteer-guest", radius: 0.6, missNote: "Not on the guest — the jacket goes on a person, in front of the group, from the locker the guests will use, not held up from behind the helm." },
    },
    {
      id: "muster-point", kind: "select", target: "muster-placard",
      title: "Show the muster point and what the alarm sounds like",
      cue: "Point out the muster placard on the saloon bulkhead, tell the guests where they go when they hear the signal, and sound the signal once so they have heard it.",
      why: "A muster point is only a muster point if the guests can find it from wherever they are on the vessel, and an alarm is only an alarm if they have heard it once in daylight with a crew member telling them what it means. Everything the crew will do in a fire or a flooding depends on the guests being in one known place, out of the way of the crew's work and counted; guests who scatter to their cabins or the swim platform are the reason the count has to be taken again in the middle of an emergency.",
    },
    {
      id: "no-go-areas", kind: "sequence",
      targets: ["foredeck-chain", "swim-gate", "flybridge-sign"],
      itemNames: { "foredeck-chain": "foredeck chain across the side deck", "swim-gate": "swim platform gate", "flybridge-sign": "flybridge ladder sign" },
      outOfOrderNote: "Bow to stern — the foredeck chain first, then the swim platform gate, then the flybridge ladder sign, the way the captain's standing orders list them so nothing is skipped.",
      title: "Close the no-go areas in the order the standing orders list them",
      cue: "Set the foredeck chain across the side deck, close the swim platform gate and hang the flybridge ladder sign, in that order, and tell the guests which areas are closed while the vessel is under way.",
      why: "The standing orders close the foredeck, the swim platform and the flybridge ladder to guests under way because those are where a person is nearest the water, nearest the propellers and highest above the deck, and a guest who has been told 'stay aft' has not been told which chain means what. The areas are closed in a fixed order so that a deckhand interrupted halfway knows which are done; a chain across the side deck is also the crew's own reminder that the foredeck is theirs when the lines are worked.",
    },
    {
      id: "hailer-level", kind: "gauge", target: "cockpit-hailer",
      title: "Set the cockpit hailer so the guests aft can hear the briefing",
      cue: "Bring the cockpit hailer up until the guests on the swim platform side can hear the captain without the speaker distorting, and commit the level inside the band the standing orders describe.",
      why: "The briefing and every announcement after it — the muster signal, a wake warning, the captain's word before a line moves — go out over the hailer, and a hailer set too low is a briefing the aft guests never heard while one set too high distorts the words into noise and is turned off by the first guest near it. The level is set once, at the berth, against a crew member standing where the farthest guest will stand, so the captain's voice under way is a known thing rather than a guess.",
      gauge: { label: "HAILER LEVEL", speed: 0.7, green: [0.44, 0.62], readout: (t) => (t < 0.44 ? "too low — guests aft cannot hear" : t <= 0.62 ? "clear aft, no distortion" : "distorting — bring it down"), missNote: "Outside the band — the hailer is set so the farthest guest hears words, not a level that looks right on the dial." },
    },
    {
      id: "read-back", kind: "track", target: "cockpit-intercom", seconds: 6,
      title: "Read the standing orders back to the captain on the intercom",
      cue: "On the cockpit intercom, read the standing orders back to the captain — the count, the closed areas, the jackets shown, the muster point given — at a steady pace the captain can confirm line by line.",
      why: "The captain on the flybridge has not seen the briefing and takes the vessel off the berth on the strength of what the deck reports, so the report is a read-back of the orders rather than a 'we're good': the count as a number, each closed area by name, the jacket shown, the muster point given. Read at a steady pace and confirmed line by line, it catches the thing the deckhand forgot before the yacht is in the channel; rushed, it is the sound of a crew agreeing with itself.",
      track: { start: 0.14, green: [0.42, 0.6], rise: 0.6, fall: 0.46, drift: 0.12, label: "READ-BACK PACE", readout: (v) => (v < 0.42 ? "too slow — captain waiting" : v > 0.6 ? "rushing — lines run together" : "steady — confirmed line by line") },
      holdBreakNote: "The read-back broke pace — rushed or stalled — and the captain lost the thread. Take it back to the last confirmed line and carry on steadily.",
    },
    {
      id: "dog-weather-door", kind: "turn", target: "weather-door-dog",
      title: "Dog the saloon weather door before leaving the berth",
      cue: "Close the saloon weather door and turn its dog until it seats, so the door stays shut through the marina wake and the guests inside know which way is out.",
      why: "The saloon door is the guests' way in from the aft deck and the crew's way out to it, and a door that swings free in a wake is a door that catches fingers, slams on a guest stepping through, or stands open with the sea coming in when the vessel is heeled. Dogging it is a turn, checked by hand, because a door that looks shut and is not shut is how a saloon floods from a following wake; the crew reopen it under way when the captain says the water allows.",
      turn: { turns: 1.25, label: "WEATHER DOOR DOG", readout: (t) => (t < 0.3 ? "door free" : t < 0.85 ? "dog engaging" : "dogged · seated") },
    },
    {
      id: "departure-log", kind: "select", target: "departure-log",
      title: "Log the count and the briefing in the departure log",
      cue: "Enter the closed count against the manifest, the briefing given, the jammed latch and the open hatch found, the late arrival and the cigarette at the fuel fill, with the time.",
      why: "The departure log is the record the captain hands to a boarding officer and the record the operator reads after an incident, and it is where a jammed latch becomes a repair before the next charter rather than the same surprise twice. The late guest and the cigarette are logged because the next crew need to know this group had to be stopped at the gangway and told once about smoking near the fuel fill; a problem that happens once and is not written down happens again to someone who did not see it coming.",
    },
    {
      id: "crew-checkin", kind: "select", target: "crew-radio",
      title: "Check in with the mate on the dock and the engineer below",
      cue: "On the working channel: the count is closed and logged, the deck is briefed and the areas set, what you found on the walk, and how the deck crew are after the late arrival and the smoker.",
      why: "The mate on the dock takes the lines on the strength of the deck's report and the engineer below needs to hear that the deck is ready before the captain asks for engines, so the check-in is where three crew who cannot see each other agree the vessel is ready. It is also the crew's own moment: a boarding with a guest stopped at the gangway and another told to put out a cigarette is small, but it is the kind of small that wears a crew down over a season, and the union's member assistance line is there for what the radio does not carry.",
    },
  ],

  interrupts: [
    {
      id: "late-guest-gangway",
      kind: "Late guest at the gangway mid-count",
      after: "guest-count", delay: 2, seconds: 14,
      alert: "A late guest hurries down the dock, bag in hand, and steps toward the gangway while the count is under way — nobody is on the gangway to meet them.",
      cue: "Put the gangway chain across, hold the count, and let the mate on the dock bring the late guest aboard once the count has closed.",
      target: "gangway-chain",
      why: "A guest stepping aboard in the middle of a count is a count that cannot be trusted — one more head in a group already counted, or a name marked present who is still on the dock. The gangway chain is the answer because it stops the boarding without stopping the count; the mate on the dock holds the late guest, the deckhand closes the number, and the late guest comes aboard as a known addition rather than a mystery in the total.",
      missNote: "The late guest stepped aboard mid-count, the total came out one high on the second pass and one low on the third, and the captain left the berth with a count nobody could swear to.",
      wrongNote: "The gangway chain — the boarding is stopped, not the count, and the mate on the dock holds the guest until the number has closed.",
    },
    {
      id: "guest-smoking-fuel-fill",
      kind: "Guest lights a cigarette at the fuel fill",
      after: "read-back", delay: 2, seconds: 14,
      alert: "A guest has stepped out to the side deck and lit a cigarette, standing directly over the fuel fill and its vent while you are on the intercom.",
      cue: "Point out the no-smoking placard on the side deck and have the guest put the cigarette out over the side, then tell the captain on the read-back.",
      target: "no-smoking-placard",
      why: "The fuel fill and its vent are where fuel vapour leaves the tank as the fuel warms and the vessel moves, and a lit cigarette over the vent is an ignition source held over exactly the vapour the fire rules exist to keep it away from. The answer is not to argue with the guest but to show the placard, get the cigarette out and report it, so the captain knows this group needs the smoking rule repeated over the hailer before the fuel dock.",
      missNote: "The guest finished the cigarette over the fuel vent and flicked it toward the dock, where the fuel-dock boom was staged, and the captain heard about it from the fuel-dock attendant.",
      wrongNote: "The no-smoking placard — the guest is shown the rule and the cigarette goes out before anything else is said on the intercom.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.6, YC1_ACCENT);

    // ------------------------------------------------------------ the water
    const water = box(g, 22, 0.02, 22, 2, 0.012, 0, 0xffffff, { rough: 0.15, metal: 0.35, cast: false });
    water.material = texturedMat(surfaceTexture((cx, w, h) => waterFace(cx, w, h, { base: "#0e2a36", mid: "#144052" }), { repeat: 4, px: 512 }), { rough: 0.15, metal: 0.35, color: 0x8fb4c8 });

    // ----------------------------------------------- the berth and the yacht
    const berth = marinaBerth(g, -1.0, 0, 0);
    const { pedestal, extinguisherBox } = berth.userData.parts;
    void pedestal; void extinguisherBox;
    const yacht = motorYacht(g, 3.3, -1.2, 8.0, { livery: { fleetName: "ESTUARY LADY", unitNumber: "MY-24" } });
    const P = yacht.userData.parts;
    const DECK = 1.25;                       // main deck above the water, yacht floated to her draft
    // Sternlight and stern cleats are on the yacht; the stern line runs from the starboard stern cleat to the dock cleat.
    const sternLine = hose(g, [[0.85, DECK + 0.05, -2.4], [-0.1, 0.55, -3.4], [-0.15, 0.5, -3.6]], 0.02, 0xe8dcb8, { steps: 8, rough: 0.85 });
    const sternHit = box(g, 0.5, 0.3, 0.5, 0.85, DECK + 0.1, -2.4, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "cast off the stern line now?", 0.85, DECK + 0.5, -2.4, { css: "#d2312b", w: 0.5 });
    reg(hits, sternHit, "stern-line-early");
    void sternLine;

    // ------------------------------------------------ gangway and its chain
    const gangway = group(g, 0.1, 0.45, -1.0);
    box(gangway, 0.7, 0.05, 2.2, 0.4, 0.4, 0, 0xc8ced4, { rough: 0.4, metal: 0.5 });
    gangway.children[0].rotation.z = -0.6;
    for (const sz of [-1, 1]) box(gangway, 0.02, 0.9, 0.02, 0.05, 0.45, sz * 1.0, 0xc8ced4, { rough: 0.4, metal: 0.5 });
    const chainDown = hose(gangway, [[0.05, 0.1, -1.0], [0.05, 0.05, 0], [0.05, 0.1, 1.0]], 0.014, 0xe8b02e, { steps: 8, rough: 0.5, metal: 0.6 });
    const chainUp = hose(gangway, [[0.05, 0.85, -1.0], [0.05, 0.72, 0], [0.05, 0.85, 1.0]], 0.014, 0xe8b02e, { steps: 8, rough: 0.5, metal: 0.6 });
    chainUp.visible = false;
    holoTag(gangway, "gangway chain", 0.05, 1.1, 0, { css: YC1_CSS, w: 0.3 });
    reg(hits, chainDown, "gangway-chain");
    const lateGuest = standingFigure(g, -1.4, -0.4, { ry: 1.2, cloth: 0x6a4a8a, trousers: 0x2b3138, atStation: true });
    lateGuest.position.y = 0.45;
    lateGuest.visible = false;
    holoTag(lateGuest, "late guest", 0, 1.9, 0, { css: "#d2312b", w: 0.24 });

    // ------------------------------------------------- the aft deck fittings
    const deck = group(g, 3.3, DECK, 0);          // yacht deck frame near the cockpit
    // Crew board with the standing orders, on the saloon bulkhead by the door.
    const ordersBoard = holoPanel(deck, 0.8, 0.56, -1.6, 1.4, 1.1, (cx, w, h) => {
      cx.fillStyle = "#0e1a26"; cx.fillRect(0, 0, w, h); cx.fillStyle = YC1_CSS; cx.fillRect(0, 0, w, 6);
      cx.font = `600 ${Math.round(h * 0.1)}px 'Barlow Condensed', Arial, sans-serif`; cx.textAlign = "left"; cx.textBaseline = "middle";
      cx.fillStyle = "#dcefff"; cx.fillText("CAPTAIN'S STANDING ORDERS", w * 0.06, h * 0.13);
      cx.font = `${Math.round(h * 0.07)}px Arial, sans-serif`; cx.fillStyle = "#eef6ff";
      ["Passengers: per the vessel's certificate", "Count: deckhand, against the manifest, at the gangway", "Closed under way: foredeck · swim platform · flybridge ladder",
       "Jackets: shown on a person, locker open", "Muster: saloon bulkhead placard, signal sounded once", "Nothing moves until the deck has read back"]
        .forEach((l, i) => cx.fillText(l, w * 0.06, h * (0.28 + i * 0.115)));
    }, { ry: 0, accent: YC1_ACCENT });
    reg(hits, ordersBoard, "orders-board");
    // Cockpit locker with the life jackets; its latch is jammed half-closed.
    const locker = group(deck, -2.3, 0, -1.8);
    box(locker, 0.9, 0.5, 0.5, 0, 0.25, 0, 0xe9ebe6, { rough: 0.45, finish: "painted" });
    const lid = box(locker, 0.92, 0.04, 0.52, 0, 0.52, 0, 0xdfe3e6, { rough: 0.45 });
    const latch = box(locker, 0.1, 0.06, 0.06, 0, 0.5, 0.27, 0xd2312b, { rough: 0.5, emissive: 0x4a0808, ei: 0.4 });
    latch.rotation.x = 0.7;
    holoTag(locker, "life-jacket locker", 0, 0.85, 0, { css: YC1_CSS, w: 0.36 });
    reg(hits, latch, "locker-latch-jammed");
    const demoJacket = group(locker, 0.25, 0.6, 0);
    box(demoJacket, 0.28, 0.3, 0.12, 0, 0, 0, 0xf06a2b, { rough: 0.8 });
    box(demoJacket, 0.28, 0.05, 0.13, 0, 0.08, 0, 0xdfe8ee, { rough: 0.6, emissive: 0xdfe8ee, ei: 0.3 });
    holoTag(demoJacket, "life jacket", 0, 0.3, 0, { css: YC1_CSS, w: 0.26 });
    reg(hits, demoJacket, "demo-lifejacket");
    // Cockpit seats: the under-seat stowage hazard.
    const seat = group(deck, -0.2, 0, -3.0);
    box(seat, 2.4, 0.45, 0.6, 0, 0.22, 0, 0x3a5f80, { rough: 0.8 });
    const seatHit = box(seat, 0.6, 0.2, 0.5, 0.9, 0.2, 0, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(seat, "stow the jackets under the seat?", 0.9, 0.7, 0, { css: "#d2312b", w: 0.56 });
    reg(hits, seatHit, "under-seat-locker");
    // Open lazarette hatch in the cockpit sole.
    const hatchOpen = group(deck, -1.2, 0, -2.4);
    box(hatchOpen, 0.7, 0.04, 0.7, 0, 0.02, 0, 0x2b3138, { rough: 0.7 });
    const hatchLid = box(hatchOpen, 0.7, 0.04, 0.7, 0, 0.36, -0.35, 0xc0c6cc, { rough: 0.4, metal: 0.5 });
    hatchLid.rotation.x = -1.35;
    holoTag(hatchOpen, "lazarette hatch", 0, 0.8, 0, { css: YC1_CSS, w: 0.32 });
    reg(hits, hatchLid, "deck-hatch-open");
    // Manifest clipboard on the cockpit table.
    const table = group(deck, -1.0, 0, -0.6);
    cyl(table, 0.04, 0.05, 0.7, 0, 0.35, 0, 0xc8ced4, { rough: 0.35, metal: 0.5, seg: 8 });
    box(table, 0.9, 0.04, 0.6, 0, 0.72, 0, 0xb8935e, { rough: 0.6 });
    const clipboard = box(table, 0.24, 0.02, 0.32, 0.2, 0.75, 0, 0xf1f3f4, { rough: 0.6 });
    holoTag(table, "manifest", 0.2, 1.0, 0, { css: YC1_CSS, w: 0.24 });
    reg(hits, clipboard, "manifest-clipboard");
    // Departure log on the table too, its own object.
    const log = holoPanel(table, 0.42, 0.3, -0.25, 0.95, -0.1, (cx, w, h) => {
      cx.fillStyle = "#0e1a26"; cx.fillRect(0, 0, w, h); cx.fillStyle = YC1_CSS; cx.fillRect(0, 0, w, 6);
      cx.font = `600 ${Math.round(h * 0.13)}px 'Barlow Condensed', Arial, sans-serif`; cx.textAlign = "left"; cx.textBaseline = "middle";
      cx.fillStyle = "#dcefff"; cx.fillText("DEPARTURE LOG", w * 0.06, h * 0.17);
      cx.font = `${Math.round(h * 0.1)}px Arial, sans-serif`; cx.fillStyle = "#eef6ff";
      ["Count: —", "Briefing: —", "Remarks: —"].forEach((l, i) => cx.fillText(l, w * 0.06, h * (0.42 + i * 0.2)));
    }, { ry: 0.4, accent: YC1_ACCENT });
    reg(hits, log, "departure-log");
    // Muster placard and no-smoking placard on the saloon bulkhead and the side deck.
    const muster = holoPanel(deck, 0.4, 0.4, -0.6, 1.5, 1.1, (cx, w, h) => {
      cx.fillStyle = "#1c6f3a"; cx.fillRect(0, 0, w, h);
      cx.font = `700 ${Math.round(h * 0.18)}px 'Barlow Condensed', Arial, sans-serif`; cx.textAlign = "center"; cx.textBaseline = "middle";
      cx.fillStyle = "#ffffff"; cx.fillText("MUSTER", w / 2, h * 0.36); cx.fillText("POINT", w / 2, h * 0.62);
    }, { ry: 0, accent: 0x59c97b });
    reg(hits, muster, "muster-placard");
    const noSmoke = holoPanel(deck, 0.34, 0.34, -2.6, 1.3, 1.6, (cx, w, h) => {
      cx.fillStyle = "#f1f3f4"; cx.fillRect(0, 0, w, h);
      cx.strokeStyle = "#d2312b"; cx.lineWidth = w * 0.08; cx.beginPath(); cx.arc(w / 2, h / 2, w * 0.36, 0, Math.PI * 2); cx.stroke();
      cx.beginPath(); cx.moveTo(w * 0.24, h * 0.24); cx.lineTo(w * 0.76, h * 0.76); cx.stroke();
      cx.fillStyle = "#2b3138"; cx.fillRect(w * 0.3, h * 0.46, w * 0.4, h * 0.08);
    }, { ry: Math.PI / 2, accent: 0xd2312b });
    reg(hits, noSmoke, "no-smoking-placard");
    const smoker = standingFigure(g, 0.9, 3.8, { ry: -1.5, cloth: 0x8a6a4a, trousers: 0x2b3138, atStation: true });
    smoker.position.y = DECK;
    const ember = ball(smoker, 0.02, 0.2, 1.45, 0.15, 0xff6a2b, { emissive: 0xff6a2b, ei: 2.0, seg: 6, seg2: 6 });
    ember.visible = false;
    holoTag(smoker, "guest on the side deck", 0, 1.9, 0, { css: YC1_CSS, w: 0.4 });
    // Cockpit hailer and the intercom on the coaming; the crew radio on the deckhand's belt hook.
    const hailer = instrument(deck, -2.6, 1.05, -0.2, { ry: Math.PI / 2, idle: "HAILER · LOW", color: YC1_ACCENT, w: 0.12, d: 0.2 });
    box(deck, 0.3, 0.6, 0.3, -2.6, 0.75, -0.2, 0xe9ebe6, { rough: 0.45 });
    holoTag(hailer, "cockpit hailer", 0, 0.18, 0, { css: YC1_CSS, w: 0.3 });
    reg(hits, hailer, "cockpit-hailer");
    const intercom = group(deck, -2.0, 1.3, 1.08);
    box(intercom, 0.16, 0.24, 0.06, 0, 0, 0, 0x2b3138, { rough: 0.5, metal: 0.4 });
    const icLamp = ball(intercom, 0.024, 0.05, 0.07, 0.035, 0x59c97b, { emissive: 0x59c97b, ei: 1.2, seg: 8, seg2: 6 });
    holoTag(intercom, "cockpit intercom", 0, 0.24, 0, { css: YC1_CSS, w: 0.34 });
    reg(hits, intercom, "cockpit-intercom");
    const radio = instrument(deck, -2.7, 0.55, -2.6, { ry: 0.3, idle: "CH · WORKING", color: YC1_ACCENT, w: 0.1, d: 0.16 });
    box(deck, 0.3, 0.5, 0.3, -2.7, 0.25, -2.6, 0x2b3138, { rough: 0.6, metal: 0.4 });
    holoTag(radio, "crew radio", 0, 0.16, 0, { css: YC1_CSS, w: 0.24 });
    reg(hits, radio, "crew-radio");
    // Vest and handheld on the hook by the saloon door.
    const hook = group(deck, -1.9, 0, 1.0);
    cyl(hook, 0.02, 0.02, 1.4, 0, 0.7, 0, 0xc8ced4, { rough: 0.45, metal: 0.6, seg: 8 });
    const vest = group(hook, 0.16, 1.05, 0);
    box(vest, 0.24, 0.36, 0.1, 0, 0, 0, 0xf06a2b, { rough: 0.8 });
    box(vest, 0.24, 0.05, 0.11, 0, 0.06, 0, 0xdfe8ee, { rough: 0.6, emissive: 0xdfe8ee, ei: 0.3 });
    holoTag(hook, "work vest", 0.16, 1.4, 0, { css: YC1_CSS, w: 0.24 });
    reg(hits, vest, "crew-vest");
    const vhf = group(hook, -0.16, 1.0, 0.02);
    box(vhf, 0.06, 0.18, 0.04, 0, 0, 0, 0x2b3138, { rough: 0.5 });
    cyl(vhf, 0.006, 0.006, 0.14, 0, 0.16, 0, 0x15181c, { rough: 0.6, seg: 6 });
    holoTag(vhf, "handheld radio", -0.1, 0.32, 0, { css: YC1_CSS, w: 0.3 });
    reg(hits, vhf, "handheld-vhf");
    // Weather door dog on the saloon door frame; the start key at the cockpit helm station.
    const dog = group(deck, -0.05, 1.1, 1.0);
    cyl(dog, 0.05, 0.05, 0.04, 0, 0, 0, 0xc8ced4, { rough: 0.35, metal: 0.6, seg: 12 });
    const dogHandle = box(dog, 0.03, 0.22, 0.03, 0, 0, 0.03, 0xc8ced4, { rough: 0.35, metal: 0.6 });
    holoTag(dog, "weather door dog", 0, 0.28, 0, { css: YC1_CSS, w: 0.34 });
    reg(hits, dog, "weather-door-dog");
    const helmStation = group(deck, -2.4, 0, -1.0);
    box(helmStation, 0.5, 0.9, 0.4, 0, 0.45, 0, 0xdfe3e6, { rough: 0.45, metal: 0.2 });
    const key = cyl(helmStation, 0.03, 0.03, 0.05, 0.1, 0.93, 0.1, 0xd2312b, { rough: 0.5, seg: 10 });
    holoTag(helmStation, "engine start — now?", 0, 1.2, 0, { css: "#d2312b", w: 0.4 });
    reg(hits, key, "start-key");
    // No-go controls: the foredeck chain on the side deck, the swim gate, the flybridge ladder sign.
    const foreChain = group(deck, -2.55, 0, 2.6);
    for (const sx of [-0.2, 0.2]) cyl(foreChain, 0.02, 0.02, 0.9, sx, 0.45, 0, 0xc8ced4, { rough: 0.45, metal: 0.6, seg: 8 });
    const fcDown = hose(foreChain, [[-0.2, 0.06, 0], [0, 0.03, 0.03], [0.2, 0.06, 0]], 0.012, 0xe8b02e, { steps: 6, rough: 0.5, metal: 0.6 });
    const fcUp = hose(foreChain, [[-0.2, 0.85, 0], [0, 0.78, 0], [0.2, 0.85, 0]], 0.012, 0xe8b02e, { steps: 6, rough: 0.5, metal: 0.6 });
    fcUp.visible = false;
    holoTag(foreChain, "foredeck chain", 0, 1.05, 0, { css: YC1_CSS, w: 0.3 });
    reg(hits, fcDown, "foredeck-chain");
    const swimGate = group(deck, 0.4, 0, -3.55);
    const gateLeaf = box(swimGate, 0.7, 0.6, 0.03, 0.35, 0.5, 0, 0xc8ced4, { rough: 0.4, metal: 0.5 });
    gateLeaf.rotation.y = 1.2;
    holoTag(swimGate, "swim platform gate", 0, 1.0, 0, { css: YC1_CSS, w: 0.38 });
    reg(hits, gateLeaf, "swim-gate");
    const ladder = group(deck, -2.5, 0, 0.5);
    for (const sx of [-0.2, 0.2]) cyl(ladder, 0.02, 0.02, 2.2, sx, 1.1, 0, 0xc8ced4, { rough: 0.4, metal: 0.6, seg: 8 });
    for (let i = 0; i < 5; i++) box(ladder, 0.4, 0.03, 0.03, 0, 0.4 + i * 0.42, 0, 0xc8ced4, { rough: 0.4, metal: 0.6 });
    const sign = box(ladder, 0.36, 0.2, 0.02, 0, 1.3, 0.05, 0xf2c14b, { rough: 0.6, emissive: 0x3a2a08, ei: 0.2 });
    sign.visible = false;
    const signHook = box(ladder, 0.04, 0.04, 0.04, 0, 1.45, 0.04, 0xc8ced4, { rough: 0.4, metal: 0.6 });
    holoTag(ladder, "flybridge ladder sign", 0, 2.4, 0, { css: YC1_CSS, w: 0.4 });
    reg(hits, signHook, "flybridge-sign");
    // Gunwale hazard on the starboard side deck.
    const gunwaleHit = box(deck, 0.4, 0.3, 1.0, -2.95, 0.4, -1.6, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(deck, "count from the gunwale?", -2.95, 0.9, -1.6, { css: "#d2312b", w: 0.46 });
    reg(hits, gunwaleHit, "gunwale-stand");

    // ------------------------------------------------------------- guests
    const guests = group(deck, 0, 0, 0);
    const guestSpots = [[0.6, -2.2, 0.4], [1.2, -1.4, -0.3]];
    const guestClothes = [0x6a4a8a, 0x3a6f4a];
    guestSpots.forEach(([x, z, ry], i) => { const f = standingFigure(guests, x, z, { ry, cloth: guestClothes[i], trousers: 0x2b3138, atStation: true }); void f; });
    const volunteer = standingFigure(guests, -0.4, -1.9, { ry: 0.2, cloth: 0xd8d2c4, trousers: 0x2b3138, atStation: true });
    const volunteerRing = torus(volunteer, 0.36, 0.012, 0, 0.03, 0, YC1_ACCENT, { emissive: YC1_ACCENT, ei: 1.6, rough: 0.4, cast: false, seg: 6, seg2: 28 });
    volunteerRing.rotation.x = Math.PI / 2;
    holoTag(volunteer, "volunteer guest", 0, 1.95, 0, { css: YC1_CSS, w: 0.32 });
    reg(hits, volunteer, "volunteer-guest");
    const wornJacket = box(volunteer, 0.3, 0.32, 0.14, 0, 1.25, 0.06, 0xf06a2b, { rough: 0.8 });
    wornJacket.visible = false;

    // ------------------------------------------------------------- crew
    const mate = standingFigure(g, -1.3, 2.4, { ry: 2.6, cloth: 0x1f3a52, trousers: 0x2b3138, vest: 0xf06a2b, gloves: true });
    mate.position.y = 0.45;
    holoTag(mate, "mate — on the dock", 0, 1.9, 0, { css: YC1_CSS, w: 0.36 });
    holoTag(g, "captain — flybridge", 3.3, DECK + 4.2, 5.2, { css: YC1_CSS, w: 0.36 });

    const waterTex = water.material.map;

    return {
      hits,
      spawnLook: new THREE.Vector3(1.5, 1.4, -1.0),
      onStep() {},
      onStepComplete(step) {
        if (step.id === "deck-walk") { latch.material = mat(0xc8ced4, { rough: 0.35, metal: 0.6 }); latch.rotation.x = 0; hatchLid.rotation.x = 0; hatchLid.position.set(0, 0.04, 0); }
        if (step.id === "vest-and-radio") { vest.visible = false; vhf.visible = false; }
        if (step.id === "show-lifejacket") { demoJacket.visible = false; wornJacket.visible = true; lid.rotation.x = -1.2; lid.position.set(0, 0.7, -0.2); }
        if (step.id === "muster-point") muster.userData.face.material.emissiveIntensity = 1.8;
        if (step.id === "no-go-areas") { fcDown.visible = false; fcUp.visible = true; gateLeaf.rotation.y = 0; gateLeaf.position.x = 0; sign.visible = true; }
        if (step.id === "hailer-level") repaint(hailer.userData.screen, signFace("HAILER · SET", { bg: "#0d1c24", accent: YC1_CSS, fg: "#bfeaf7", scale: 0.55 }));
        if (step.id === "dog-weather-door") { P.saloonDoor.rotation.y = 0; }
        if (step.id === "departure-log") {
          repaint(log.userData.face, (cx, w, h) => {
            cx.fillStyle = "#0e1a26"; cx.fillRect(0, 0, w, h); cx.fillStyle = "#59c97b"; cx.fillRect(0, 0, w, 6);
            cx.font = `600 ${Math.round(h * 0.13)}px 'Barlow Condensed', Arial, sans-serif`; cx.textAlign = "left"; cx.textBaseline = "middle";
            cx.fillStyle = "#dcefff"; cx.fillText("DEPARTURE LOG", w * 0.06, h * 0.17);
            cx.font = `${Math.round(h * 0.1)}px Arial, sans-serif`; cx.fillStyle = "#e6f6ea";
            ["Count: closed · matches manifest", "Briefing: given · areas set", "Remarks: latch · hatch · late guest · smoker"].forEach((l, i) => cx.fillText(l, w * 0.06, h * (0.42 + i * 0.2)));
          });
        }
        if (step.id === "crew-checkin") icLamp.material = mat(0x4fd1ff, { emissive: 0x4fd1ff, ei: 1.2 });
      },
      onHazard() {},
      onInterrupt(it) {
        if (it.id === "late-guest-gangway") { lateGuest.visible = true; }
        if (it.id === "guest-smoking-fuel-fill") { ember.visible = true; icLamp.material = mat(0xf0645b, { emissive: 0xf0645b, ei: 1.4 }); }
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "late-guest-gangway") { chainDown.visible = false; chainUp.visible = true; lateGuest.position.set(-1.6, 0.45, 0.6); lateGuest.rotation.y = 0.6; }
        if (it.id === "guest-smoking-fuel-fill") { ember.visible = false; noSmoke.userData.face.material.emissiveIntensity = 1.8; icLamp.material = mat(0x59c97b, { emissive: 0x59c97b, ei: 1.2 }); }
      },
      animate(t, dt, session) {
        const step = session?.step;
        if (waterTex?.offset) { waterTex.offset.x = t * 0.004; waterTex.offset.y = t * 0.005; }
        if (session?.turn && step?.id === "dog-weather-door") dogHandle.rotation.z = session.turn.amount * Math.PI * 2.5;
        if (ember.visible) ember.material.emissiveIntensity = 1.4 + Math.sin(t * 6) * 0.6;
        void dt; void CITY;
      },
    };
  },
};
