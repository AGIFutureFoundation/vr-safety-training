import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import { box, cyl, ball, torus, hose, group, mat, repaint, signFace } from "../../../shared/kit.js";
import {
  CITY, stationPad, holoPanel, holoTag, instrument, standingFigure, reg,
  surfaceTexture, texturedMat, waterFace,
} from "../citykit.js";
import { motorYacht } from "../../../shared/fleet.js";
import { marinaBerth } from "../../../shared/props.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Fuel Dock Transfer & Spill Kit VR — Maritime & Ports, the
// yacht and charter crew pack.
//
// The yacht port side to the marina fuel dock: the fuel-dock pump and its
// hose, the yacht's fuel fill and vent on the side deck, the absorbent boom
// staged on the dock, the spill-kit cabinet, the declaration on its board and
// the attendant's radio. The learner is the deckhand taking fuel with the
// engineer below; the attendant is on the dock. No quantity, rate or tank
// figure is stated — every one is "per the vessel's fuel plan".

const YC3_ACCENT = 0x2b6f9e;
const YC3_CSS = "#2b6f9e";

export const SIM_YC_FUEL_DOCK_TRANSFER_AND_SPILL_KIT = {
  id: "yc-fuel-dock-transfer-and-spill-kit",
  index: "yc-3",
  domain: "Maritime & Ports",
  trade: "Charter yacht deckhand taking fuel at the marina fuel dock, IBU and SIU trained, with the MEBA engineer below at the tank gauges",
  category: "Maritime & Ports",
  district: "Maritime & Ports",
  weather: "overcast",
  certification: "IBU and SIU deck training; MEBA engineering watch on the tanks; USCG oil pollution prevention rules at 33 CFR 155, the declaration of inspection at 33 CFR 156.150 and the person in charge under 33 CFR 155.710 as the fuel dock's own transfer procedure mirrors them; 46 CFR 25 fire-fighting equipment for uninspected vessels; NFPA 306 control of gas hazards on vessels; IMO MARPOL; OSHA 29 CFR 1910.132 personal protective equipment",
  name: "Fuel Dock Transfer & Spill Kit",
  title: simTitle("Fuel Dock Transfer & Spill Kit"),
  tagline: "Taking fuel port side to the dock: the fuel plan read, gloves and glasses on and the phones in the basket, the fill and vent walked for the cracked fitting and the worn nozzle, the declaration signed with the attendant, the boom staged and the collar fitted, the nozzle held through a slow start as the vent spits, the vent watched while a guest walks up with a phone, the rate read against the plan, the cap torqued, the spill kit proven and the transfer logged",
  accent: YC3_ACCENT,
  accentCss: YC3_CSS,
  parSeconds: 280,
  footprint: 2.6,
  badge: { id: "not-a-drop", name: "Not A Drop", note: "Declaration before the pump, boom before the nozzle, no phone and no engine through the transfer, and both the vent spit and the guest answered" },

  supportLine: "your union hall's member assistance programme — the IBU, SIU or MEBA — with the operator's employee assistance line behind it",

  game: system({
    name: "Fuel Dock",
    currency: "KNOT",
    ranks: ["Green Hand", "Deckhand", "Lead Deckhand", "Transfer PIC", "Fuel Dock Certified"],
    badges: [
      { id: "declared-first", name: "Declared First", note: "The declaration signed before the nozzle came off the pump", test: AWARD.stepClean("declaration") },
      { id: "rate-in-band", name: "Rate In Band", note: "Flow rate committed inside the plan's band first time", test: AWARD.precise(0.7) },
      { id: "no-ignition", name: "No Ignition", note: "No phone, no engine, no wrong fill and no unattended nozzle", test: AWARD.safe },
    ],
    challenges: [
      { id: "clean-transfer", name: "Clean Transfer", note: "No corrections from the plan to the log", test: AWARD.clean },
      { id: "vent-watched", name: "Vent Watched", note: "The vent watched in band the whole transfer", test: AWARD.unbroken },
      { id: "slack-tide", name: "Slack Tide", note: "Transfer logged inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "phone-in-hand": "You took a phone call at the fill with the nozzle in. A phone at a fuel fill is an ignition source in the hands of somebody whose attention is now somewhere else — the vapour rising from the fill and the vent is heaviest exactly where the deckhand stands, and the person watching the vent has just stopped watching it. Phones go in the basket before the declaration is signed, for everyone on the dock and the deck.",
    "start-key-fuelling": "You reached for the engine start while fuel was flowing. An engine started with fuel vapour in the bilge or on the side deck is the fire the whole transfer procedure exists to prevent, and the blowers that clear that vapour run after the fill cap is on, not before; nothing on the vessel that sparks — engines, generator, galley — runs until the transfer is complete and the engineer has cleared the bilge.",
    "water-fill-cap": "You opened the water fill instead of the fuel fill for the nozzle. The two deck fittings sit within arm's reach of each other and look alike from above, and fuel into the water tank is a contaminated tank, a poisoned water system and fuel in the bilge from the overflow. The fill is identified by its marking and confirmed with the engineer below before the nozzle comes near it.",
    "nozzle-latch": "You latched the nozzle open and stepped away from the fill. A latched nozzle fills until something stops it, and on a vessel the thing that stops it is fuel coming out of the vent into the water; the deckhand's hand on the nozzle is the only shut-off that reacts in time, and the fuel-dock rules and the vessel's own plan both want that hand there for every moment fuel is flowing.",
  },

  lateNotes: {
    "transfer-log": "The transfer is logged once the cap is on and the spill kit has been checked back into its cabinet — last, not first.",
    "fuel-nozzle": "The nozzle goes in once the declaration is signed, the boom is staged and the collar is on — not before.",
  },

  steps: [
    {
      id: "fuel-plan", kind: "select", target: "fuel-plan-board",
      title: "Read the vessel's fuel plan with the engineer",
      cue: "Read the fuel plan on the side-deck board: which tank, how much per the plan, who is below at the gauges, the rate the plan allows, and the stop signal between the deck and the engineer.",
      why: "A fuel transfer is two people who cannot see each other — the deckhand at the fill and the engineer at the tank gauges — moving fuel between a pump and a tank with a vent as the only warning that the tank is full, and the plan is the one place they agree the tank, the quantity and the stop signal before the nozzle moves. The pollution rules put a person in charge of every transfer and a declaration in front of it for the same reason: the time to discover a disagreement about which tank is before fuel is flowing into the wrong one.",
    },
    {
      id: "ppe-and-phones", kind: "sequence", anyOrder: true,
      targets: ["nitrile-gloves", "safety-glasses", "phone-basket"],
      itemNames: { "nitrile-gloves": "nitrile gloves", "safety-glasses": "safety glasses", "phone-basket": "phones in the basket" },
      title: "Gloves and glasses on, every phone in the basket",
      cue: "Nitrile gloves and safety glasses on, and every phone — yours, the engineer's, the attendant's — in the basket on the dock before anything else happens.",
      why: "Fuel on skin and in eyes is the ordinary injury of a fuel dock and the gloves and glasses are the whole of the protection against a nozzle that spits; the phones are the extraordinary one. A phone at the fill is both an ignition source and the end of the vent watch, and the basket on the dock is how a crew makes 'no phones' a thing that is checked rather than a thing that is said — if the basket is empty, someone still has one.",
    },
    {
      id: "fill-and-vent-walk", kind: "find", noHint: true,
      targets: ["vent-fitting-cracked", "nozzle-spout-worn"],
      itemNames: { "vent-fitting-cracked": "cracked hose at the tank vent fitting", "nozzle-spout-worn": "fuel nozzle with a worn, leaking spout" },
      itemNotes: {
        "vent-fitting-cracked": "The vent hose is cracked where it meets the deck fitting — a vent that leaks puts fuel and vapour inside the hull the moment the tank tops up, where nobody at the fill can see it.",
        "nozzle-spout-worn": "The pump's nozzle spout is worn and weeping at the swivel — a nozzle that drips between the pump and the fill drips on the deck, on the dock and into the water for the whole transfer.",
      },
      title: "Walk the fill, the vent and the pump before the declaration",
      cue: "Look at the fuel fill and its marking, the vent fitting and hose, and the pump's hose and nozzle: nothing cracked, nothing weeping, the fill marked for fuel.",
      why: "Everything between the pump and the tank is a place fuel can go where it should not, and the walk is where a cracked vent hose or a weeping nozzle is found dry rather than with fuel already running through it. The declaration the deckhand is about to sign says the equipment has been inspected, and that is only true if the walk was done; a transfer that begins with a leaking nozzle begins with a sheen on the water and the spill kit already needed.",
    },
    {
      id: "declaration", kind: "select", target: "declaration-board",
      title: "Complete the declaration with the fuel-dock attendant",
      cue: "Go through the declaration with the attendant line by line — tank, quantity per the plan, hose and fittings inspected, boom and spill kit at hand, emergency stop shown, communications agreed — and both sign before the nozzle comes off the pump.",
      why: "The declaration is the fuel transfer's permit: a list of the things that have to be true before fuel moves, gone through by both parties and signed, so nobody starts a pump on an assumption about what the other side has checked. The Coast Guard's transfer rules require it for the vessels and facilities they cover and every serious fuel dock mirrors it for every vessel, because the list is the same whether the tank is large or small — the pump does not know the difference, and neither does the water.",
    },
    {
      id: "boom-staged", kind: "drag", target: "absorbent-boom",
      title: "Stage the absorbent boom along the dock edge, down-current of the fill",
      cue: "Take the boom from its rack and lay it along the dock edge on the down-current side of the fill, ready to go in the water in one movement, with its line made off to the dock.",
      why: "A sheen on the water spreads with the current from the moment it lands, and a boom still in its cabinet is a boom that goes in after the sheen has reached the next berth; staged along the edge with its line made off, it goes in the water in the time it takes to push it. Down-current is where the fuel will go, so that is where the boom waits — a boom staged up-current of the fill is a boom that contains nothing.",
      drag: { to: "boom-socket", radius: 0.7, missNote: "Not down-current of the fill — the boom waits where a sheen will go, along the dock edge with its line made off, not in its rack." },
    },
    {
      id: "fill-collar", kind: "select", target: "fill-collar",
      title: "Fit the absorbent collar round the fill",
      cue: "Fit the absorbent collar round the fuel fill so a spit from the nozzle or a burp from the fill lands on the collar and not on the deck and over the side.",
      why: "The first fuel out of a fill is a spit as the nozzle seats and the last is a burp as the tank tops up, and both go straight down the side deck and over the side into the water unless something catches them. The collar is the something: an absorbent ring that costs nothing and turns a sheen into a wet collar in a bag. The pollution rules count a sheen as a discharge, and the collar is how most of them never happen.",
    },
    {
      id: "nozzle-in", kind: "hold", target: "fuel-nozzle", seconds: 5,
      title: "Seat the nozzle and hold it through a slow start",
      cue: "Seat the nozzle in the fuel fill, one hand on the nozzle and the other on the trigger, and start slowly — a trickle until the engineer below confirms fuel in the right tank — and hold it there.",
      why: "The slow start is the check that the fuel is going where the plan says: the engineer at the gauges sees the right tank move, or does not, before enough fuel has gone anywhere to matter. The hand stays on the nozzle because the nozzle is the shut-off — the pump's emergency stop is behind the deckhand on the dock and the engineer's stop signal is a voice on the radio, and neither is as fast as a hand that lets go of a trigger.",
      holdBreakNote: "The nozzle came out of the hand before the engineer confirmed the tank — a nozzle nobody is holding is a nozzle nobody can stop. Seat it, hold it, start slowly again.",
    },
    {
      id: "vent-watch", kind: "track", target: "vent-watch", seconds: 6,
      title: "Watch the vent through the transfer and call it to the engineer",
      cue: "Eyes on the vent and the water below it through the transfer, calling to the engineer steadily — clear, clear, clear — as the tank comes up toward the plan's figure.",
      why: "The vent is where the tank tells the deck it is full, and it tells the deck with fuel; the only way to stop a transfer before that is a person watching the vent who calls what they see and an engineer on the gauges who calls the figure. The watch is steady, out loud, and boring by design — the transfer that goes wrong is the one where the vent watch looked at the pump readout for a moment, or answered a question from the dock, exactly as the tank topped up.",
      track: { start: 0.14, green: [0.42, 0.6], rise: 0.6, fall: 0.46, drift: 0.12, label: "VENT WATCH", readout: (v) => (v < 0.42 ? "eyes off the vent" : v > 0.6 ? "over-calling — engineer cannot hear the figure" : "steady — vent clear, engineer has the figure") },
      holdBreakNote: "The vent watch broke — eyes off the vent or the calls over the engineer's figure. Back on the vent, steady calls, until the engineer calls the stop.",
    },
    {
      id: "rate-check", kind: "gauge", target: "pump-readout",
      title: "Read the flow rate against the vessel's fuel plan",
      cue: "Read the pump's flow readout as the transfer settles and commit it against the rate the vessel's fuel plan allows for this fill and vent — not the rate the pump can give.",
      why: "The fill and the vent on a yacht can pass fuel only so fast before the fill backs up and the vent spits, and that rate is the vessel's — written in her fuel plan — rather than the pump's, which will happily deliver faster than the vent can breathe. The deckhand reads the rate and commits it against the plan's band so the pump is throttled before the vent complains, and so the engineer's figure on the gauges means what it says.",
      gauge: { label: "FLOW RATE", speed: 0.7, green: [0.42, 0.6], readout: (t) => (t < 0.42 ? "trickle — transfer stalled" : t <= 0.6 ? "inside the plan's band" : "over the plan — vent will spit"), missNote: "Outside the band — the rate is read once the transfer has settled and committed against the vessel's plan, not the pump's capacity." },
    },
    {
      id: "cap-and-wipe", kind: "turn", target: "fill-cap",
      title: "Cap the fill, torque it and wipe the deck",
      cue: "Nozzle out and back on the pump, the fill cap on and turned until its seal seats, the collar bagged and the deck wiped — nothing left on the gelcoat to reach the scupper.",
      why: "A fill cap left loose is a fill that leaks in the first sea and vents into the side deck, and a wet deck round the fill is fuel that reaches the scupper and the water with the first wash-down. The cap is turned until the seal seats and checked by hand, the collar goes in the bag with the wipes, and the deck is dry before the engineer runs the blowers — the transfer is not over until nothing that came out of the nozzle is anywhere but the tank or the bag.",
      turn: { turns: 1.25, label: "FILL CAP", readout: (t) => (t < 0.3 ? "cap loose" : t < 0.85 ? "seal engaging" : "seated · sealed") },
    },
    {
      id: "spill-kit-check", kind: "select", target: "spill-kit-cabinet",
      title: "Prove the spill kit and put the used collar in it",
      cue: "Open the dock's spill-kit cabinet: pads, a second boom, bags and gloves all there and dry, the used collar bagged and placed for disposal, the cabinet closed and marked.",
      why: "The spill kit is the answer to the transfer that goes wrong, and it is only an answer if it is full when it is opened in a hurry; a cabinet that was used last week and never restocked is an empty box with a label. The kit is opened and counted at the end of every transfer, the used collar goes into it for proper disposal rather than into the marina's bin, and a short kit is reported to the attendant before the yacht leaves the dock.",
    },
    {
      id: "transfer-log", kind: "select", target: "transfer-log",
      title: "Log the transfer",
      cue: "Enter the transfer: the tank and the figure per the plan, the declaration signed, the cracked vent hose and the worn nozzle, the vent spit and the guest with the phone, and the spill kit's state.",
      why: "The transfer log is the vessel's own record of what went into which tank and what happened while it did, and it is where a cracked vent hose becomes a job for the engineer and a worn nozzle becomes a word to the fuel dock. The spit and the guest are logged because the next deckhand taking fuel here needs to know that this vent spits near the plan's figure and that guests wander onto this dock — a thing that happened once and was not written down happens again.",
    },
    {
      id: "crew-checkin", kind: "select", target: "attendant-radio",
      title: "Check in with the attendant and the engineer",
      cue: "On the radio: the transfer is complete and logged, the cap is on, what you found on the walk, the spill kit's state, and how the deck crew are after the spit and the interruption.",
      why: "The attendant releases the pump and the engineer runs the blowers on the strength of the deck's word that the fill is capped and the deck is dry, so the check-in is where three people who could not see each other agree the transfer is finished. It is also the crew's own moment: a vent spitting fuel toward the water with a guest walking up phone in hand is a small hard thing that a deckhand carries, and the union's member assistance line is there for what the radio does not carry.",
    },
  ],

  interrupts: [
    {
      id: "vent-spits",
      kind: "Vent spits fuel on the slow start",
      after: "nozzle-in", delay: 2, seconds: 14,
      alert: "The vent has spat — a burst of fuel from the vent fitting onto the side deck and a sheen starting on the water below it — while the nozzle is still in the fill.",
      cue: "Hit the pump's emergency stop on the dock, then tell the engineer; the collar and the boom do the rest.",
      target: "pump-stop",
      why: "A vent that spits on a slow start is a tank that is fuller than the plan said or a fill that is backing up, and either way fuel is going somewhere other than the tank right now. The emergency stop kills the pump faster than any conversation about why; the engineer is told next, the collar has caught what landed on deck and the boom goes in for what reached the water, and the transfer does not restart until the engineer has explained the gauge.",
      missNote: "The pump ran on through the spit, fuel ran off the side deck past the collar and the sheen spread beyond where the boom was staged before anyone reached the stop.",
      wrongNote: "The pump's emergency stop — the pump is killed first; the engineer and the boom come after the fuel has stopped moving.",
    },
    {
      id: "guest-with-phone",
      kind: "Guest walks onto the fuel dock with a phone",
      after: "vent-watch", delay: 2, seconds: 14,
      alert: "A guest has come down the dock toward the fill, phone at their ear, asking how long the fuel stop will take — they are walking into the vapour zone with the transfer running.",
      cue: "Close the fuel-dock gate and have the attendant hold the guest at the shore end until the cap is on — without taking your eyes off the vent.",
      target: "fuel-dock-gate",
      why: "A guest with a phone in the vapour zone is an ignition source and a distraction arriving together at the worst moment of the transfer, as the tank comes up toward full. The answer is the gate, not a conversation: the attendant holds the guest at the shore end where there is no vapour, the deckhand's eyes stay on the vent, and the guest gets their answer when the cap is on.",
      missNote: "The guest reached the fill with the phone at their ear and the deckhand turned to answer them, and the engineer's stop call was missed as the vent topped up.",
      wrongNote: "The fuel-dock gate — the guest is held at the shore end by the attendant; the vent watch never turns round.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.6, YC3_ACCENT);

    // ------------------------------------------------------------ the water
    const water = box(g, 22, 0.02, 22, 2, 0.012, 0, 0xffffff, { rough: 0.15, metal: 0.35, cast: false });
    water.material = texturedMat(surfaceTexture((cx, w, h) => waterFace(cx, w, h, { base: "#0e2a36", mid: "#144052" }), { repeat: 4, px: 512 }), { rough: 0.15, metal: 0.35, color: 0x8fb4c8 });

    // --------------------------------------- the fuel dock and the yacht, port side to
    const berth = marinaBerth(g, -1.0, 0, -3.0);
    const { fuelPump, fuelHose, boom, spillKit } = berth.userData.parts;
    holoTag(fuelPump, "fuel-dock pump", 0, 1.6, 0, { css: YC3_CSS, w: 0.3 });
    const readout = instrument(fuelPump, 0.05, 1.32, 0, { ry: Math.PI / 2, idle: "RATE · —", color: YC3_ACCENT, w: 0.12, d: 0.2 });
    holoTag(readout, "pump readout", 0, 0.16, 0, { css: YC3_CSS, w: 0.28 });
    reg(hits, readout, "pump-readout");
    const stopBtn = group(fuelPump, 0.27, 0.9, 0);
    cyl(stopBtn, 0.06, 0.06, 0.05, 0, 0, 0, 0xd2312b, { rough: 0.4, emissive: 0x4a0808, ei: 0.4, seg: 12 });
    stopBtn.children[0].rotation.z = Math.PI / 2;
    holoTag(stopBtn, "pump emergency stop", 0, 0.2, 0, { css: "#d2312b", w: 0.4 });
    reg(hits, stopBtn, "pump-stop");
    holoTag(spillKit, "spill-kit cabinet", 0, 1.1, 0, { css: YC3_CSS, w: 0.34 });
    reg(hits, spillKit, "spill-kit-cabinet");
    holoTag(boom, "absorbent boom", 0, 0.3, 0, { css: YC3_CSS, w: 0.3 });
    reg(hits, boom, "absorbent-boom");
    void fuelHose;
    const yacht = motorYacht(g, 3.6, -1.2, -3.5, { ry: Math.PI, livery: { fleetName: "ESTUARY LADY", unitNumber: "MY-24" } });
    void yacht;
    const DECK = 1.25;
    const deck = group(g, 3.6, DECK, 0);          // deck frame; the yacht is turned so port faces the dock (-X)
    // Fuel fill and water fill on the side deck, the vent fitting on the coaming above.
    const fill = group(deck, -2.5, 0, 0);
    cyl(fill, 0.08, 0.08, 0.05, 0, 0.02, 0, 0xe4e8ec, { rough: 0.22, metal: 0.55, seg: 14 });
    const cap = box(fill, 0.1, 0.02, 0.03, 0, 0.06, 0, 0xe4e8ec, { rough: 0.22, metal: 0.55 });
    holoTag(fill, "FUEL fill", 0, 0.35, 0, { css: YC3_CSS, w: 0.24 });
    reg(hits, fill, "fill-cap");
    const collar = torus(fill, 0.14, 0.04, 0, 0.03, 0, 0xf1f3f4, { rough: 0.9, seg: 8, seg2: 20 });
    collar.rotation.x = Math.PI / 2;
    collar.visible = false;
    const collarSpot = torus(fill, 0.16, 0.01, 0, 0.02, 0, YC3_ACCENT, { emissive: YC3_ACCENT, ei: 1.4, rough: 0.4, cast: false, seg: 6, seg2: 24 });
    collarSpot.rotation.x = Math.PI / 2;
    holoTag(fill, "absorbent collar", 0.3, 0.2, 0.3, { css: YC3_CSS, w: 0.32 });
    reg(hits, collarSpot, "fill-collar");
    const waterFill = group(deck, -2.5, 0, 0.9);
    cyl(waterFill, 0.08, 0.08, 0.05, 0, 0.02, 0, 0x2f6fe0, { rough: 0.3, metal: 0.5, seg: 14 });
    holoTag(waterFill, "WATER fill — this one?", 0, 0.35, 0, { css: "#d2312b", w: 0.44 });
    reg(hits, waterFill, "water-fill-cap");
    const vent = group(deck, -2.85, 0.5, -0.6);
    cyl(vent, 0.03, 0.03, 0.08, 0, 0, 0, 0xe4e8ec, { rough: 0.22, metal: 0.55, seg: 10 });
    vent.children[0].rotation.z = Math.PI / 2;
    const ventHose = hose(vent, [[0.04, 0, 0], [0.3, -0.1, 0.05], [0.5, -0.45, 0.1]], 0.02, 0x2b3138, { steps: 6, rough: 0.8 });
    void ventHose;
    const crack = box(vent, 0.06, 0.05, 0.05, 0.1, -0.02, 0.02, 0xd2312b, { rough: 0.5, emissive: 0x4a0808, ei: 0.4 });
    holoTag(vent, "tank vent", 0, 0.3, 0, { css: YC3_CSS, w: 0.22 });
    reg(hits, crack, "vent-fitting-cracked");
    const ventWatch = box(vent, 0.4, 0.4, 0.4, -0.1, 0, 0, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, ventWatch, "vent-watch");
    const spit = hose(g, [[0.75, DECK + 0.5, -0.6], [0.3, DECK + 0.2, -0.7], [0.0, 0.1, -0.8]], 0.02, 0xd8b45a, { steps: 6, rough: 0.5 });
    spit.visible = false;
    const sheen = box(g, 1.6, 0.012, 1.2, -0.2, 0.03, -1.2, 0xb59a5a, { rough: 0.2, metal: 0.4, opacity: 0.6, transparent: true, cast: false });
    sheen.visible = false;
    // The nozzle: on the pump, then in the fill.
    const nozzle = group(g, -0.45, 0.45, 1.2);
    box(nozzle, 0.08, 0.25, 0.08, 0, 0.6, 0, 0x15181c, { rough: 0.6 });
    cyl(nozzle, 0.02, 0.02, 0.3, 0.12, 0.72, 0, 0xc0c6cc, { rough: 0.3, metal: 0.8, seg: 8 });
    nozzle.children[1].rotation.z = Math.PI / 2;
    const worn = box(nozzle, 0.05, 0.04, 0.04, 0.25, 0.72, 0, 0xd2312b, { rough: 0.5, emissive: 0x4a0808, ei: 0.4 });
    holoTag(nozzle, "fuel nozzle", 0, 1.0, 0, { css: YC3_CSS, w: 0.26 });
    reg(hits, nozzle, "fuel-nozzle");
    reg(hits, worn, "nozzle-spout-worn");
    const latchHit = box(nozzle, 0.2, 0.15, 0.15, 0, 0.45, 0, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(nozzle, "latch it open and step away?", 0, 0.3, 0, { css: "#d2312b", w: 0.54 });
    reg(hits, latchHit, "nozzle-latch");
    const nozzleHome = nozzle.position.clone();
    // Boom socket along the dock edge, down-current (toward -Z).
    const boomSocket = group(g, -0.15, 0.5, -2.0);
    const bsRing = box(boomSocket, 0.3, 0.01, 2.4, 0, 0, 0, YC3_ACCENT, { emissive: YC3_ACCENT, ei: 1.2, rough: 0.4, cast: false, opacity: 0.5, transparent: true });
    void bsRing;
    holoTag(boomSocket, "dock edge — down-current", 0, 0.4, 0, { css: YC3_CSS, w: 0.46 });
    reg(hits, boomSocket, "boom-socket");
    const boomStaged = cyl(g, 0.11, 0.11, 2.4, -0.15, 0.55, -2.0, 0xf2c14b, { rough: 0.85, seg: 10 });
    boomStaged.rotation.x = Math.PI / 2;
    boomStaged.visible = false;
    // Dock gate at the shore end, the phone basket, the declaration and plan boards.
    const gate = group(g, -1.0, 0.45, 5.5);
    for (const sx of [-1.0, 1.0]) cyl(gate, 0.03, 0.03, 1.1, sx, 0.55, 0, 0xc8ced4, { rough: 0.45, metal: 0.6, seg: 8 });
    const gateLeaf = box(gate, 1.9, 0.9, 0.04, -0.95, 0.6, 0, 0xc8ced4, { rough: 0.4, metal: 0.5 });
    gateLeaf.rotation.y = 1.3;
    holoTag(gate, "fuel-dock gate", 0, 1.35, 0, { css: YC3_CSS, w: 0.3 });
    reg(hits, gateLeaf, "fuel-dock-gate");
    const guest = standingFigure(g, -1.2, 6.4, { ry: Math.PI, cloth: 0x6a4a8a, trousers: 0x2b3138, atStation: true });
    guest.position.y = 0.45;
    guest.visible = false;
    holoTag(guest, "guest — phone in hand", 0, 1.9, 0, { css: "#d2312b", w: 0.4 });
    const basket = group(g, -1.6, 0.45, 2.4);
    box(basket, 0.4, 0.2, 0.3, 0, 0.1, 0, 0x8a949d, { rough: 0.6, metal: 0.3 });
    const phoneA = box(basket, 0.07, 0.01, 0.14, -0.1, 0.21, 0, 0x15181c, { rough: 0.4 });
    phoneA.visible = false;
    holoTag(basket, "phone basket", 0, 0.5, 0, { css: YC3_CSS, w: 0.28 });
    reg(hits, basket, "phone-basket");
    const phoneHit = box(deck, 0.2, 0.2, 0.2, -2.2, 1.3, -1.2, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(deck, "take the call at the fill?", -2.2, 1.6, -1.2, { css: "#d2312b", w: 0.5 });
    reg(hits, phoneHit, "phone-in-hand");
    const plan = holoPanel(deck, 0.8, 0.54, -1.5, 1.4, -1.6, (cx, w, h) => {
      cx.fillStyle = "#0e1a26"; cx.fillRect(0, 0, w, h); cx.fillStyle = YC3_CSS; cx.fillRect(0, 0, w, 6);
      cx.font = `600 ${Math.round(h * 0.1)}px 'Barlow Condensed', Arial, sans-serif`; cx.textAlign = "left"; cx.textBaseline = "middle";
      cx.fillStyle = "#dcefff"; cx.fillText("VESSEL FUEL PLAN", w * 0.06, h * 0.13);
      cx.font = `${Math.round(h * 0.07)}px Arial, sans-serif`; cx.fillStyle = "#eef6ff";
      ["Tank: port main · figure per the plan", "Rate: per the fill and vent · not the pump's", "Engineer: at the gauges · calls the figure",
       "Deck: hand on the nozzle · eyes on the vent", "Stop signal: 'STOP STOP STOP' on the radio", "No phones · no engines · no galley"]
        .forEach((l, i) => cx.fillText(l, w * 0.06, h * (0.28 + i * 0.115)));
    }, { ry: -Math.PI / 2, accent: YC3_ACCENT });
    reg(hits, plan, "fuel-plan-board");
    const declaration = holoPanel(g, 0.66, 0.5, -1.7, 1.35, 0.4, (cx, w, h) => {
      cx.fillStyle = "#1a1208"; cx.fillRect(0, 0, w, h); cx.fillStyle = YC3_CSS; cx.fillRect(0, 0, w, 6);
      cx.font = `600 ${Math.round(h * 0.1)}px 'Barlow Condensed', Arial, sans-serif`; cx.textAlign = "left"; cx.textBaseline = "middle";
      cx.fillStyle = "#f6e2cc"; cx.fillText("DECLARATION OF INSPECTION", w * 0.06, h * 0.13);
      cx.font = `${Math.round(h * 0.075)}px Arial, sans-serif`; cx.fillStyle = "#fbefe2";
      ["☐ Tank and quantity agreed", "☐ Hose, nozzle, fittings inspected", "☐ Boom and spill kit at hand", "☐ Emergency stop shown", "☐ Communications agreed", "Signed: vessel ____  dock ____"]
        .forEach((l, i) => cx.fillText(l, w * 0.06, h * (0.28 + i * 0.115)));
    }, { ry: Math.PI / 2, accent: YC3_ACCENT });
    reg(hits, declaration, "declaration-board");
    const log = holoPanel(deck, 0.5, 0.36, -1.2, 1.4, 2.0, (cx, w, h) => {
      cx.fillStyle = "#0e1a26"; cx.fillRect(0, 0, w, h); cx.fillStyle = YC3_CSS; cx.fillRect(0, 0, w, 6);
      cx.font = `600 ${Math.round(h * 0.13)}px 'Barlow Condensed', Arial, sans-serif`; cx.textAlign = "left"; cx.textBaseline = "middle";
      cx.fillStyle = "#dcefff"; cx.fillText("TRANSFER LOG", w * 0.06, h * 0.17);
      cx.font = `${Math.round(h * 0.1)}px Arial, sans-serif`; cx.fillStyle = "#eef6ff";
      ["Tank: —", "Declaration: —", "Remarks: —"].forEach((l, i) => cx.fillText(l, w * 0.06, h * (0.42 + i * 0.2)));
    }, { ry: -Math.PI / 2, accent: YC3_ACCENT });
    reg(hits, log, "transfer-log");
    // PPE on the dock rail; the attendant's radio; the engine start at the cockpit helm station.
    const rail = group(g, -1.9, 0.45, 1.6);
    cyl(rail, 0.02, 0.02, 1.3, 0, 0.65, 0, 0xc8ced4, { rough: 0.45, metal: 0.6, seg: 8 });
    const glovesBox = group(rail, 0.14, 1.0, 0);
    box(glovesBox, 0.12, 0.16, 0.05, 0, 0, 0, 0x2f6fe0, { rough: 0.7 });
    holoTag(rail, "nitrile gloves", 0.14, 1.35, 0, { css: YC3_CSS, w: 0.3 });
    reg(hits, glovesBox, "nitrile-gloves");
    const glasses = group(rail, -0.14, 0.95, 0.02);
    box(glasses, 0.16, 0.04, 0.04, 0, 0, 0, 0xaebfcb, { rough: 0.3, metal: 0.3 });
    holoTag(glasses, "safety glasses", -0.1, 0.3, 0, { css: YC3_CSS, w: 0.3 });
    reg(hits, glasses, "safety-glasses");
    const radio = instrument(g, -1.7, 1.02, -1.2, { ry: 0.6, idle: "CH · DOCK", color: YC3_ACCENT, w: 0.1, d: 0.16 });
    box(g, 0.3, 0.55, 0.3, -1.7, 0.72, -1.2, 0x2b3138, { rough: 0.6, metal: 0.4 });
    holoTag(radio, "attendant's radio", 0, 0.16, 0, { css: YC3_CSS, w: 0.34 });
    reg(hits, radio, "attendant-radio");
    const helmStation = group(deck, -1.8, 0, -2.6);
    box(helmStation, 0.5, 0.9, 0.4, 0, 0.45, 0, 0xdfe3e6, { rough: 0.45, metal: 0.2 });
    const key = cyl(helmStation, 0.03, 0.03, 0.05, 0.1, 0.93, 0.1, 0xd2312b, { rough: 0.5, seg: 10 });
    holoTag(helmStation, "engine start — with fuel flowing?", 0, 1.2, 0, { css: "#d2312b", w: 0.6 });
    reg(hits, key, "start-key-fuelling");

    // ------------------------------------------------------------- crew
    const attendant = standingFigure(g, -1.5, 3.6, { ry: 2.8, cloth: 0x2b3138, trousers: 0x2b3138, vest: 0xf2c14b, gloves: true });
    attendant.position.y = 0.45;
    holoTag(attendant, "fuel-dock attendant", 0, 1.9, 0, { css: YC3_CSS, w: 0.38 });
    holoTag(g, "engineer — at the tank gauges", 3.6, DECK + 0.4, -3.2, { css: YC3_CSS, w: 0.5 });

    const waterTex = water.material.map;

    return {
      hits,
      spawnLook: new THREE.Vector3(0.8, 1.2, -0.3),
      onStep() {},
      onStepComplete(step) {
        if (step.id === "ppe-and-phones") { glovesBox.visible = false; glasses.visible = false; phoneA.visible = true; }
        if (step.id === "fill-and-vent-walk") { crack.material = mat(0x2b3138, { rough: 0.8 }); worn.material = mat(0xc0c6cc, { rough: 0.3, metal: 0.8 }); }
        if (step.id === "declaration") declaration.userData.face.material.emissiveIntensity = 1.6;
        if (step.id === "boom-staged") { boom.visible = false; boomStaged.visible = true; }
        if (step.id === "fill-collar") { collar.visible = true; collarSpot.visible = false; }
        if (step.id === "nozzle-in") { nozzle.position.set(0.9, DECK + 0.05, 0); nozzle.rotation.z = -0.5; cap.visible = false; }
        if (step.id === "rate-check") repaint(readout.userData.screen, signFace("RATE · IN BAND", { bg: "#0d1c24", accent: YC3_CSS, fg: "#bfeaf7", scale: 0.5 }));
        if (step.id === "cap-and-wipe") { nozzle.position.copy(nozzleHome); nozzle.rotation.z = 0; cap.visible = true; collar.visible = false; }
        if (step.id === "transfer-log") {
          repaint(log.userData.face, (cx, w, h) => {
            cx.fillStyle = "#0e1a26"; cx.fillRect(0, 0, w, h); cx.fillStyle = "#59c97b"; cx.fillRect(0, 0, w, 6);
            cx.font = `600 ${Math.round(h * 0.13)}px 'Barlow Condensed', Arial, sans-serif`; cx.textAlign = "left"; cx.textBaseline = "middle";
            cx.fillStyle = "#dcefff"; cx.fillText("TRANSFER LOG", w * 0.06, h * 0.17);
            cx.font = `${Math.round(h * 0.1)}px Arial, sans-serif`; cx.fillStyle = "#e6f6ea";
            ["Tank: port main · per the plan", "Declaration: signed · both parties", "Remarks: vent hose · nozzle · spit · guest"].forEach((l, i) => cx.fillText(l, w * 0.06, h * (0.42 + i * 0.2)));
          });
        }
        if (step.id === "crew-checkin") repaint(radio.userData.screen, signFace("CLEAR · CAPPED", { bg: "#0d1c24", accent: "#59c97b", fg: "#bfeaf7", scale: 0.5 }));
      },
      onHazard() {},
      onInterrupt(it) {
        if (it.id === "vent-spits") { spit.visible = true; sheen.visible = true; }
        if (it.id === "guest-with-phone") { guest.visible = true; }
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "vent-spits") { spit.visible = false; sheen.scale.set(0.4, 1, 0.4); boomStaged.position.y = 0.05; repaint(readout.userData.screen, signFace("STOPPED", { bg: "#240c0c", accent: "#f0645b", fg: "#ffd9d4", scale: 0.55 })); }
        if (it.id === "guest-with-phone") { gateLeaf.rotation.y = 0; gateLeaf.position.x = 0; guest.position.z = 7.2; }
      },
      animate(t, dt, session) {
        const step = session?.step;
        if (waterTex?.offset) { waterTex.offset.x = t * 0.004; waterTex.offset.y = t * 0.005; }
        if (session?.turn && step?.id === "cap-and-wipe") cap.rotation.y = session.turn.amount * Math.PI * 2.5;
        if (sheen.visible) sheen.material.opacity = 0.45 + Math.sin(t * 2) * 0.15;
        void dt; void CITY;
      },
    };
  },
};
