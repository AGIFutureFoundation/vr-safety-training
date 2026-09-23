import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, ball, torus, slab, group, decal, repaint, signFace, paperFace, mat,
  standingPerson,
} from "../../../shared/kit.js";
import {
  CITY, stationPad, holoPanel, holoTag, toolChest, instrument, standingFigure, reg,
  surfaceTexture, texturedMat, pavingFace,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Housekeeping Room Turn VR — Culinary & Hospitality, hotel
// housekeeping series, station 194.
//
// One guest room turned the way a UNITE HERE room attendant actually turns
// it under Cal/OSHA's hotel housekeeping musculoskeletal injury prevention
// standard: the cart staged outside rather than dragged in, the belt-worn
// panic device proven before the door closes on a lone worker, the room
// entered on a knock-and-announce rather than a key card alone, the bed
// stripped by walking around it instead of reaching and twisting across it,
// the bathroom's chemicals used to the label with gloves and the fan
// running, the long-handled tools the standard's injury-prevention plan
// calls for at the tub, and the room signed off against the shift's quota.
// Generic hotel, not a real property — the standard, the ordinance
// tradition and the contract language are the only things named with a
// number here.

const HRT_ACCENT = 0xb08a5a;

export const SIM_HOUSEKEEPING_ROOM_TURN = {
  id: "housekeeping-room-turn",
  index: "194",
  domain: "Culinary & Hospitality",
  trade: "Hotel housekeeper — UNITE HERE Local 2",
  category: "Culinary & Hospitality",
  indoor: "hotel",
  certification: "Cal/OSHA's hotel housekeeping musculoskeletal injury prevention standard, 8 CCR 3345, and the written injury-prevention plan, long-handled tools and repetitive-task limits it requires; OSHA's bloodborne pathogens standard, 29 CFR 1910.1030, for a sharp found in a room; OSHA's hazard communication standard, 29 CFR 1910.1200, and the SDS for every bathroom chemical on the cart; the IWC's Wage Order 5, the Public Housekeeping Industry order, on room quotas, rest breaks and premium pay; UNITE HERE's hotel housekeeping contract language on room assignments and a lone attendant's right to a working panic device; the hotel-worker panic-button ordinances a number of California cities have adopted at UNITE HERE's initiative for room attendants working alone.",
  name: "Housekeeping Room Turn",
  title: simTitle("Housekeeping Room Turn"),
  tagline: "A guest room turned under the hotel housekeeping injury-prevention standard: cart staged, panic device tested, knock-and-announce, the bed walked rather than reached across, chemicals to the label, and the room logged against quota",
  accent: HRT_ACCENT,
  accentCss: "#b08a5a",
  parSeconds: 280,
  footprint: 2.4,
  badge: { id: "clean-turn", name: "Clean Turn", note: "The whole room turned on time, on technique, with nothing reached across and nothing touched bare-handed" },

  game: system({
    name: "Room Attendant",
    currency: "ROOMS",
    ranks: ["New Hire", "Room Attendant", "Section Lead", "Floor Supervisor", "Room Attendant Certified"],
    badges: [
      { id: "walked-not-reached", name: "Walked, Not Reached", note: "Never once reached across the bed instead of walking around it", test: AWARD.safe },
      { id: "belt-proven", name: "Belt Proven", note: "The panic device tested and confirmed before the first room", test: AWARD.stepClean("panic-test") },
      { id: "clean-room", name: "Clean Room", note: "No corrections across the whole turn", test: AWARD.clean },
    ],
    challenges: [
      { id: "quota-pace", name: "Quota Pace", note: "Turned the room inside 80% of par", test: AWARD.fast(0.8) },
      { id: "eight-straight", name: "Eight Straight", note: "Eight correct actions in a row", test: AWARD.streak(8) },
      { id: "no-second-look", name: "No Second Look", note: "The room check clean on the first pass", test: AWARD.stepClean("room-check") },
    ],
  }),

  hazards: {
    "reach-across-bed": "That's reaching all the way across the mattress instead of walking around to the far side. Cal/OSHA's hotel housekeeping standard exists because this exact motion, repeated on every bed of every room on a section, is what turns an ordinary shift into a shoulder or a low-back claim — the extra four steps around the foot of the bed are the whole injury-prevention plan for this one task.",
    "chem-mix": "The chlorine-based bathroom disinfectant and the acid-based bowl cleaner are standing capped together on the caddy with both nozzles loose. Their SDS sheets both say the same thing in different words: mixed, they give off chlorine gas, and a caddy is exactly the closed space where that gas has nowhere to go but into the face of whoever opens it next.",
    "bare-hand-chem": "You reached into the caddy for the toilet bowl cleaner bare-handed. The label's own precautionary statement calls for gloves before contact, and a splash off the bottle's own rim is concentrate, not the diluted solution it becomes once it's actually on a surface.",
    "razor-in-trash": "A guest's used disposable razor is sitting loose in the general waste bag, blade exposed. OSHA's bloodborne pathogens standard treats a discarded razor the same as any other sharp — it goes into the room's sharps container, not into a bag that the next person to touch it has no way of knowing carries a blade.",
  },

  lateNotes: {
    "panic-belt": "Not yet — the device gets tested on its own step, held through to the dispatch confirmation, not pressed on the way past.",
    "thermostat-dial": "The setback goes on the way out, once the room is actually clean — turning it back now just means walking past a cold room to keep working in it.",
  },

  steps: [
    {
      id: "room-status", kind: "select", target: "assignment-board",
      title: "Check the room's status before knocking",
      cue: "Read tonight's section board: which rooms are checkout, which are stay-over, and the quota for the shift.",
      why: "A checkout room and an occupied stay-over get knocked on the same way, but everything after the knock is different — what gets stripped versus refreshed, and whether the room is even supposed to be empty. The board is what tells you which room you are about to walk into before your hand is on the door.",
    },
    {
      id: "cart-stage", kind: "select", target: "cart",
      title: "Stage the cart in the corridor",
      cue: "Leave the cart parked in the corridor, not wheeled into the room.",
      why: "A cart parked across the doorway is a second exit blocked and a trip hazard on a floor a guest or another attendant is also walking, and every linen and chemical you need is reachable from the corridor without ever bringing the whole cart inside. What comes into the room comes in your hands, in the amount this room actually needs.",
    },
    {
      id: "panic-test", kind: "hold", target: "panic-belt", seconds: 4,
      title: "Test the panic device on the belt",
      cue: "Pull the belt pack from the cart's charging dock and hold it until the panel confirms the signal reached dispatch.",
      why: "This device is the whole answer the panic-button ordinances and the union contract give a room attendant working alone behind a closed door — and a device nobody has proven live today is a guess about whether help is one press away. Confirming it before the first room, not assuming it from yesterday's shift, is what makes it a control instead of a badge on the belt.",
      holdBreakNote: "You let go before the panel confirmed the signal. A short press proves nothing either way — hold it through to the confirmation before it goes on your belt for the rest of the shift.",
    },
    {
      id: "knock-announce-enter", kind: "sequence", anyOrder: false,
      targets: ["door-knock", "door-announce", "door-enter"],
      itemNames: { "door-knock": "knock, twice, clearly", "door-announce": "announce \"Housekeeping!\"", "door-enter": "wait, then enter" },
      title: "Knock, announce, and only then enter",
      cue: "Knock, say who you are, wait for an answer, and only then open the door.",
      why: "A guest who stepped back into the room for a forgotten bag, or who is still asleep past checkout, has no way of knowing this door is about to open unless you tell them first — the knock-and-announce is what turns a closed door into a warning instead of a surprise, for the guest and for you both.",
      outOfOrderNote: "Knock, announce, then wait and enter — in that order. Opening the door before you've announced yourself defeats the entire reason you knocked.",
    },
    {
      id: "strip-bed", kind: "track", target: "strip-technique", seconds: 6,
      title: "Strip the bed by walking around it",
      cue: "Strip the near side, then walk around the foot of the bed to strip the far side — keep the pace steady, not rushed and not reaching across.",
      why: "Reaching and twisting across a queen mattress to strip the far side, bed after bed, room after room, is the exact repetitive motion Cal/OSHA's hotel housekeeping standard was written to design out — walking the four steps around the foot of the bed at a steady pace keeps your spine facing the work instead of twisted over it, and it costs seconds against a whole shift of shoulders.",
      track: {
        start: 0.15, green: [0.4, 0.62], rise: 0.45, fall: 0.4, drift: 0.1, label: "STRIP TECHNIQUE",
        readout: (v) => (v < 0.4 ? "rushing the corners" : v > 0.62 ? "reaching across" : "walking around"),
      },
      holdBreakNote: "Pace drifted out of the steady band. Rushing the corners or reaching across the mattress is the exact twisting motion this technique exists to design out — bring it back to a steady walk-around.",
    },
    {
      id: "fitted-sheet", kind: "drag", target: "fresh-sheet",
      title: "Fit the fresh sheet to the mattress",
      cue: "Carry the fresh fitted sheet from the linen shelf and set it onto the mattress corner.",
      why: "The fitted-sheet technique the injury-prevention plan calls for starts the corner at the near side and lets the elastic do the reaching the far corners would otherwise cost your back — a sheet thrown flat and yanked into place from one side is the same twisting motion the walk-around was just built to avoid.",
      drag: { to: "mattress-socket", radius: 0.5, missNote: "Not seated on the mattress corner — line the fitted corner up with the mattress before letting go, not tossed across the middle." },
    },
    {
      id: "tuck-corners", kind: "sequence", anyOrder: true,
      targets: ["corner-head", "corner-foot"],
      itemNames: { "corner-head": "hospital corner, head side", "corner-foot": "hospital corner, foot side" },
      title: "Tuck the top sheet's hospital corners",
      cue: "Tuck a hospital corner at the head, then the foot, walking around rather than leaning across.",
      why: "A hospital corner tucked tight is what keeps the top sheet from working loose by the time the next guest checks in, and tucking it from the side you're standing on — not leaning across the mattress to reach the far corner — is the same walk-around discipline the strip already put in place.",
    },
    {
      id: "top-linens", kind: "select", target: "duvet-fold",
      title: "Set the duvet fold and the pillows",
      cue: "Square the duvet's decorative fold and arrange the pillows against the headboard.",
      why: "The fold and the pillow arrangement are the one thing a guest actually looks at when the door opens, and it's the last honest chance to catch a stray stain or a torn duvet cover before the room is called finished rather than after a guest calls the front desk about it.",
    },
    {
      id: "bath-fan", kind: "turn", target: "fan-timer",
      title: "Run the bathroom exhaust fan before any chemical",
      cue: "Turn the fan's timer dial on before opening a single bottle in the bathroom.",
      why: "A hotel bathroom is a sealed tile box with one door, and every chemical on this caddy is labelled for use with adequate ventilation — the fan running before the first bottle opens is what that label actually means in a room with no window, not an optional courtesy once the smell is already noticeable.",
      turn: { turns: 0.75, axis: "z", label: "EXHAUST FAN TIMER" },
    },
    {
      id: "glove-up", kind: "select", target: "chem-gloves",
      title: "Glove up before the chemicals",
      cue: "Pull on the chemical-resistant gloves before touching a single bottle on the caddy.",
      why: "Every bottle on this caddy — the bowl cleaner, the disinfectant, the glass cleaner — is something a bare hand was never rated for, and the gloves are staged on the caddy itself specifically so putting them on is the thing that happens before the caddy is opened, not sometime after.",
    },
    {
      id: "chem-dwell", kind: "hold", target: "bowl-cleaner", seconds: 5,
      title: "Apply the bowl cleaner for its label dwell time",
      cue: "Apply the cleaner to the bowl and hold off flushing until the label's own contact time has run.",
      why: "A disinfectant's label dwell time is the manufacturer's own tested minimum for actually killing what it claims to kill — wiped or flushed the instant it's applied, it has done nothing but change the smell of the bathroom, and the next guest is checking into a bowl that was cleaned in name only.",
      holdBreakNote: "Flushed before the label's dwell time ran. The chemical needs the seconds the label lists to actually work — give it the full hold, not a quick splash and rinse.",
    },
    {
      id: "tub-tool", kind: "select", target: "long-handle-brush",
      title: "Reach for the long-handled tool at the tub",
      cue: "Take the long-handled tub brush off the caddy rather than kneeling over the rim.",
      why: "Scrubbing a tub kneeling and bent over the rim, room after room, is the second repetitive-motion injury the hotel housekeeping standard names by name — the long-handled brush is the engineering control the standard's own injury-prevention plan requires the employer to provide for exactly this task, and it is on the caddy so there is never a reason to kneel instead.",
    },
    {
      id: "room-check", kind: "find", noHint: true,
      targets: ["remote-dirty", "dnd-sign-wrong", "item-under-bed"],
      itemNames: { "remote-dirty": "the TV remote, not wiped down", "dnd-sign-wrong": "the previous guest's door sign still hanging", "item-under-bed": "a guest's forgotten item under the bed" },
      itemNotes: {
        "remote-dirty": "The remote is the single most-handled surface in the room that housekeeping controls directly — skipped, it carries the last guest's hands straight into the next one's.",
        "dnd-sign-wrong": "The old guest's door sign is still on the handle. Left there, it tells the front desk and the next room attendant this room is still occupied when it is standing empty and clean.",
        "item-under-bed": "A phone charger left under the bed frame is a lost item the front desk will be fielding a call about within the hour — found now, it goes to lost-and-found instead of the next guest's vacuum bag.",
      },
      title: "Check the room before calling it done",
      cue: "Three things are wrong with this room before it's ready for the next guest. Find them.",
      why: "The room check is the last set of eyes on this room before a guest's, and every one of these three is invisible from the doorway — the walk-through is what catches them while they're still this attendant's problem instead of a guest complaint or a lost-and-found ticket two shifts from now.",
    },
    {
      id: "thermostat-setback", kind: "turn", target: "thermostat-dial",
      title: "Set the thermostat back on the way out",
      cue: "Turn the thermostat to the vacant-room setback before pulling the door shut.",
      why: "An empty room run at full heat or air conditioning between check-out and the next guest is energy nobody is using, and the setback is standard practice on a section — turned back now, on a clean room, it costs one more guest nothing and the hotel nothing between now and check-in.",
      turn: { turns: 0.5, axis: "z", label: "THERMOSTAT" },
    },
    {
      id: "quota-log", kind: "select", target: "quota-sheet",
      title: "Log the room against the shift's quota",
      cue: "Mark the room complete and the time on the section sheet.",
      why: "The quota sheet is what the Wage Order's room-count and rest-break protections actually run on — a section logged honestly, room by room, is the record that proves the shift's workload when anyone, from a supervisor to a steward, has to check it against the standard.",
    },
  ],

  interrupts: [
    {
      id: "guest-returns",
      kind: "Guest blocks the door",
      after: "chem-dwell", delay: 3, seconds: 12,
      alert: "The room's guest has come back for a forgotten bag and is standing squarely in the open doorway, not moving — you're alone in the room with the only way out blocked.",
      cue: "Hit the panic device on your belt. Do not try to talk or squeeze your way past.",
      target: "panic-belt",
      why: "A guest blocking the one exit while you're alone in the room is exactly the scenario the belt-worn device and the panic-button ordinances were built around — pressing it brings help to a doorway you cannot safely get past on your own, which is the entire reason the device rides on your belt instead of staying in a drawer at the desk.",
      missNote: "The guest stayed in the doorway the whole window with nobody alerted. A blocked door that nobody outside the room knows about is the worst case the ordinance exists to prevent, sitting there unanswered.",
      wrongNote: "That doesn't clear the doorway. The panic device is the response — it brings help to the door instead of you trying to talk or squeeze your way past somebody blocking it.",
    },
    {
      id: "sharp-found",
      kind: "Sharp found in the linen",
      after: "strip-bed", delay: 3, seconds: 12,
      alert: "A used syringe falls out of the sheets as you pull them back — it's lying on the exposed mattress, needle end up.",
      cue: "Don't touch it bare-handed. Get the sharps container off the cart.",
      target: "sharps-container",
      why: "OSHA's bloodborne pathogens standard treats a found needle as an exposure risk the moment it's discovered, not the moment somebody is stuck by it — the sharps container is what lets you clear it off the mattress without your hand or a bare fold of the sheet ever making contact with the point.",
      missNote: "The syringe sat on the open mattress while the strip continued around it. A needle nobody has contained yet is a stick waiting for the next hand that touches that bed, including your own.",
      wrongNote: "Not that — leave it where it fell. The sharps container is what picks it up safely; nothing else on this cart is rated to touch it.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.4, HRT_ACCENT);

    // -------------------------------------------------------- bathroom tile patch
    // A tiled bathroom floor set into the hotel floor's carpet, the way an
    // en-suite actually breaks from the corridor and room finish.
    const tileTex = surfaceTexture((cx, w, h) => pavingFace(cx, w, h, { tiles: 8, base: "#d7dde1", base2: "#c7ced3", seam: "rgba(0,0,0,0.14)" }), { repeat: 4, px: 320 });
    const bathFloor = box(g, 1.7, 0.02, 1.7, -2.3, 0.011, -0.1, 0xd7dde1, { rough: 0.5 });
    bathFloor.material = texturedMat(tileTex, { rough: 0.45, metal: 0.1, color: 0xd7dde1 });

    // ------------------------------------------------------------- corridor
    const assignBoard = holoPanel(g, 0.56, 0.4, -2.4, 1.55, 2.6, (ctx, w, h) => {
      ctx.fillStyle = "rgba(18,12,4,0.9)"; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#b08a5a"; ctx.fillRect(0, 0, w, 5);
      ctx.fillStyle = "#f1ede6";
      ctx.font = `600 ${Math.round(h * 0.11)}px 'Barlow Condensed', Arial, sans-serif`;
      ctx.textAlign = "left"; ctx.textBaseline = "middle";
      ctx.fillText("SECTION BOARD — FLOOR 6", w * 0.06, h * 0.16);
      ctx.font = `${Math.round(h * 0.08)}px Arial, sans-serif`;
      ctx.fillStyle = "#e6dcc9";
      ["Room 612 — checkout, full turn", "Quota: 14 rooms this shift", "Belt device: test before first room"].forEach((l, i) => ctx.fillText(l, w * 0.06, h * (0.38 + i * 0.16)));
    }, { ry: 0.5, accent: HRT_ACCENT });
    reg(hits, assignBoard, "assignment-board");

    // Housekeeping cart in the corridor, with the panic-belt charging dock,
    // fresh linen shelf, and the chemical caddy staged on top.
    const cart = group(g, 1.7, 0, 2.1, -0.5);
    const cartDeck = box(cart, 1.0, 0.05, 0.5, 0, 0.7, 0, 0x8b929a, { rough: 0.4, metal: 0.6 });
    reg(hits, cartDeck, "cart");
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
      cyl(cart, 0.04, 0.04, 0.06, sx * 0.44, 0.04, sz * 0.22, 0x22262b, { rough: 0.7, seg: 10 });
      cyl(cart, 0.012, 0.012, 0.66, sx * 0.44, 0.4, sz * 0.22, CITY.darkSteel, { rough: 0.5, metal: 0.6, seg: 8 });
    }
    box(cart, 0.94, 0.3, 0.46, 0, 0.5, 0, 0xece3d0, { rough: 0.7 }); // linen shelf beneath
    const freshSheet = box(cart, 0.5, 0.05, 0.34, -0.15, 0.76, 0, 0xf4f0e6, { rough: 0.75 });
    holoTag(cart, "Fresh linen", -0.15, 0.9, 0, { css: "#b08a5a", w: 0.3 });
    reg(hits, freshSheet, "fresh-sheet");
    const caddy = group(cart, 0.3, 0.75, 0.05);
    box(caddy, 0.28, 0.18, 0.2, 0, 0.09, 0, 0x3a4148, { rough: 0.55, metal: 0.3 });
    const bowlCleaner = cyl(caddy, 0.03, 0.03, 0.16, -0.06, 0.26, 0, 0xd8232a, { rough: 0.4, metal: 0.2, seg: 12 });
    decal(bowlCleaner, 0.05, 0.08, 0, 0, 0.031, signFace("BOWL", { bg: "#1b1e22", accent: "#f2c14b", scale: 0.5 }));
    reg(hits, bowlCleaner, "bowl-cleaner");
    const disinfectant = cyl(caddy, 0.03, 0.03, 0.16, 0.06, 0.26, 0, 0xf2c14b, { rough: 0.4, metal: 0.2, seg: 12 });
    decal(disinfectant, 0.05, 0.08, 0, 0, 0.031, signFace("DISINF", { bg: "#1b1e22", accent: "#4fb8c9", scale: 0.42 }));
    // The two bottles stored capped together, nozzles loose against each other.
    const chemMixZone = box(caddy, 0.16, 0.05, 0.1, 0, 0.32, 0, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(caddy, "capped together?", 0, 0.4, 0, { css: "#f0645b", w: 0.42 });
    reg(hits, chemMixZone, "chem-mix");
    const bareHandZone = box(caddy, 0.28, 0.14, 0.2, 0, 0.09, 0.14, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(caddy, "reach in bare-handed?", 0, 0.02, 0.16, { css: "#f0645b", w: 0.5 });
    reg(hits, bareHandZone, "bare-hand-chem");
    const gloveMesh = group(cart, -0.4, 0.78, -0.1);
    box(gloveMesh, 0.14, 0.045, 0.08, -0.05, 0, 0, 0xd8232a, { rough: 0.6 });
    box(gloveMesh, 0.14, 0.045, 0.08, 0.05, 0, 0, 0xd8232a, { rough: 0.6 });
    reg(hits, gloveMesh, "chem-gloves");
    const brush = cyl(cart, 0.014, 0.014, 0.52, 0.42, 1.0, -0.1, 0x2b3138, { rough: 0.55, seg: 8 });
    brush.rotation.z = 0.2;
    ball(cart, 0.05, 0.42 + Math.sin(0.2) * 0.26, 0.74, -0.1 + Math.cos(0.2) * 0.0, 0x8a939b, { rough: 0.7, seg: 10 });
    holoTag(cart, "Long-handled brush", 0.42, 1.16, -0.1, { css: "#b08a5a", w: 0.4 });
    reg(hits, brush, "long-handle-brush");
    // Panic-belt charging dock on the cart's handle end.
    const dock = group(cart, -0.44, 0.72, -0.05);
    box(dock, 0.1, 0.03, 0.08, 0, 0, 0, 0x2b3138, { rough: 0.5, metal: 0.3 });
    const beltPack = box(dock, 0.06, 0.03, 0.05, 0, 0.03, 0, 0xd8232a, { rough: 0.4, metal: 0.2 });
    holoTag(dock, "Panic device", 0, 0.1, 0, { css: "#f0645b", w: 0.3 });
    reg(hits, beltPack, "panic-belt");
    const sharpsBin = cyl(cart, 0.05, 0.05, 0.12, -0.3, 0.76, 0.16, 0xd8232a, { rough: 0.5, seg: 12 });
    decal(sharpsBin, 0.07, 0.03, 0, 0.05, 0.051, signFace("SHARPS", { bg: "#1b1e22", accent: "#f2c14b", scale: 0.42 }));
    holoTag(cart, "Sharps container", -0.3, 0.9, 0.16, { css: "#b08a5a", w: 0.36 });
    reg(hits, sharpsBin, "sharps-container");

    // ------------------------------------------------------------------ door
    const door = group(g, 0, 0, 1.5);
    box(door, 1.0, 2.1, 0.08, 0, 1.05, 0, 0x5a4535, { rough: 0.6 });
    const dnd = decal(door, 0.16, 0.24, 0.32, 1.5, 0.045, paperFace("DO NOT", ["DISTURB"], { bg: "#2a1416", band: "#b81410" }), { px: 100 });
    reg(hits, dnd, "dnd-sign-wrong");
    const knockPlate = box(door, 0.12, 0.12, 0.02, -0.2, 1.4, 0.045, 0xdfe4e8, { rough: 0.4, metal: 0.5 });
    holoTag(door, "Knock", -0.2, 1.55, 0.045, { css: "#b08a5a", w: 0.22 });
    reg(hits, knockPlate, "door-knock");
    const announcePlate = decal(door, 0.24, 0.08, 0, 1.2, 0.045, signFace("HOUSEKEEPING", { bg: "#1b1e22", accent: "#b08a5a", scale: 0.45 }), { px: 160 });
    reg(hits, announcePlate, "door-announce");
    const handle = cyl(door, 0.02, 0.02, 0.12, 0.4, 1.05, 0.05, CITY.steel, { rough: 0.3, metal: 0.9, seg: 10 });
    handle.rotation.z = Math.PI / 2;
    reg(hits, handle, "door-enter");
    const thermo = group(door, -0.6, 1.3, 0.045);
    cyl(thermo, 0.05, 0.05, 0.02, 0, 0, 0, 0xdfe4e8, { rough: 0.4, metal: 0.5, seg: 16 });
    const thermoPointer = box(thermo, 0.006, 0.03, 0.006, 0, 0.017, 0.012, 0xb08a5a, { emissive: 0xb08a5a, ei: 1.1, rough: 0.4 });
    holoTag(thermo, "Thermostat", 0, 0.1, 0, { css: "#b08a5a", w: 0.28 });
    reg(hits, thermo, "thermostat-dial");

    // -------------------------------------------------------------- the bed
    const bed = group(g, 0.2, 0, -1.2);
    box(bed, 1.7, 0.5, 2.0, 0, 0.25, 0, 0x8b6a48, { rough: 0.6 }); // frame
    const mattress = box(bed, 1.62, 0.28, 1.92, 0, 0.64, 0, 0xece3d0, { rough: 0.75 });
    const mattressSocket = box(bed, 0.3, 0.1, 0.3, -0.6, 0.8, -0.8, 0xffffff, { opacity: 0.001, transparent: true, cast: false });
    hits["mattress-socket"] = mattressSocket;
    const stripNear = box(bed, 1.6, 0.02, 0.7, 0, 0.79, 0.55, 0xd9cdb2, { rough: 0.7 });
    void stripNear;
    const stripTechnique = box(bed, 0.3, 0.05, 0.3, 0, 0.85, -0.8, 0xffffff, { opacity: 0.001, transparent: true, cast: false });
    holoTag(bed, "walk around →", -0.7, 1.0, -0.5, { css: "#59c97b", w: 0.4 });
    reg(hits, stripTechnique, "strip-technique");
    const reachAcross = box(bed, 0.3, 0.05, 0.3, 0.6, 0.85, -0.8, 0xffffff, { opacity: 0.001, transparent: true, cast: false });
    holoTag(bed, "reach straight across?", 0.6, 1.0, -0.8, { css: "#f0645b", w: 0.48 });
    reg(hits, reachAcross, "reach-across-bed");
    const cornerHead = box(bed, 0.24, 0.05, 0.24, -0.7, 0.8, -0.85, 0xffffff, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, cornerHead, "corner-head");
    const cornerFoot = box(bed, 0.24, 0.05, 0.24, -0.7, 0.8, 0.85, 0xffffff, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, cornerFoot, "corner-foot");
    const duvet = slab(bed, 1.56, 0.1, 1.5, 0, 0.83, -0.1, 0xb08a5a, { radius: 0.04, rough: 0.7 });
    reg(hits, duvet, "duvet-fold");
    const pillows = group(bed, 0, 0.92, -0.75);
    for (const px of [-0.35, 0.35]) box(pillows, 0.5, 0.16, 0.32, px, 0, 0, 0xf4f0e6, { radius: 0.05, rough: 0.7 });
    // Headboard.
    box(bed, 1.7, 1.0, 0.1, 0, 1.1, -0.95, 0x5a4535, { rough: 0.6 });
    // Guest's forgotten item, tucked under the bed frame.
    const underBed = group(g, 0.6, 0.06, -0.5);
    box(underBed, 0.09, 0.02, 0.03, 0, 0, 0, 0x2b3138, { rough: 0.5, metal: 0.3 });
    holoTag(underBed, "left behind", 0, 0.08, 0, { css: "#f0645b", w: 0.3 });
    reg(hits, underBed, "item-under-bed");
    // Syringe tag for the sharp-found interrupt — built once, hidden, and
    // toggled rather than spawned fresh every time the interrupt fires.
    const syringeTag = holoTag(bed, "syringe in the sheets", 0, 1.0, 0.3, { css: "#f0645b", w: 0.44 });
    syringeTag.visible = false;

    // TV / dresser with the remote.
    const dresser = group(g, 2.1, 0, -1.0, -0.5);
    box(dresser, 0.9, 0.72, 0.42, 0, 0.36, 0, 0x5a4535, { rough: 0.6 });
    box(dresser, 1.0, 0.5, 0.06, 0, 1.15, -0.15, 0x14151a, { rough: 0.3, metal: 0.3 });
    const remote = box(dresser, 0.06, 0.02, 0.16, 0.2, 0.735, 0.1, 0x2b3138, { rough: 0.55 });
    holoTag(dresser, "TV remote", 0.2, 0.82, 0.1, { css: "#f0645b", w: 0.3 });
    reg(hits, remote, "remote-dirty");
    const nightstand = group(g, -1.1, 0, -1.5, -0.3);
    box(nightstand, 0.4, 0.5, 0.36, 0, 0.25, 0, 0x5a4535, { rough: 0.6 });
    cyl(nightstand, 0.05, 0.06, 0.22, 0, 0.62, 0, 0xdfe4e8, { rough: 0.5, seg: 10 });
    ball(nightstand, 0.14, 0, 0.78, 0, 0xf4ecd8, { rough: 0.5, seg: 12 });

    // Window and curtains behind the bed, and a wall print above the dresser
    // — the furnishing detail that makes the room read as occupied rather
    // than a diagram of one.
    const window = group(g, 1.0, 0, -2.55);
    box(window, 1.1, 1.3, 0.05, 0, 1.4, 0, 0x2b3138, { rough: 0.4, metal: 0.3 });
    box(window, 1.0, 1.2, 0.02, 0, 1.4, 0.02, 0xbcd8ea, { rough: 0.1, metal: 0.05, opacity: 0.55, transparent: true, cast: false });
    for (const sx of [-0.62, 0.62]) box(window, 0.16, 1.7, 0.04, sx, 1.35, 0.08, 0xb08a5a, { rough: 0.75 });
    const artFrame = group(g, 2.55, 0, -1.7, -0.5);
    box(artFrame, 0.02, 0.5, 0.7, 0, 1.4, 0, 0x2b3138, { rough: 0.5 });
    box(artFrame, 0.01, 0.44, 0.64, 0.01, 1.4, 0, 0x6b8a6f, { rough: 0.7 });

    // Closet alcove with a luggage rack, opposite the bathroom.
    const closet = group(g, 1.0, 0, 1.1, -0.5);
    box(closet, 0.8, 2.0, 0.06, 0, 1.0, -0.3, 0xe9e2d6, { rough: 0.7 });
    box(closet, 0.05, 2.0, 0.7, -0.4, 1.0, 0, 0xe9e2d6, { rough: 0.7 });
    const luggageRack = group(closet, 0, 0.35, 0);
    for (const sx of [-0.25, 0.25]) for (const sz of [-0.2, 0.2]) cyl(luggageRack, 0.012, 0.012, 0.4, sx, 0, sz, 0x8b929a, { rough: 0.5, metal: 0.5, seg: 8 });
    for (const sx of [-0.25, 0.25]) box(luggageRack, 0.55, 0.02, 0.02, 0, 0.2, sx, 0x8b929a, { rough: 0.5, metal: 0.5 });

    // Baseboard trim around the bathroom tile, and a key-card reader by the door.
    for (const [w, d, x, z] of [[1.7, 0.02, -2.3, -0.94], [1.7, 0.02, -2.3, 0.74], [0.02, 1.7, -3.14, -0.1], [0.02, 1.7, -1.46, -0.1]]) {
      box(g, w, 0.08, d, x, 0.04, z, 0xb08a5a, { rough: 0.6, cast: false });
    }
    const cardReader = box(door, 0.06, 0.09, 0.02, 0.32, 1.1, 0.045, 0x2b3138, { rough: 0.4, metal: 0.3 });
    decal(cardReader, 0.04, 0.02, 0, 0.03, 0.011, signFace("", { bg: "#0d1c24", accent: "#59c97b", scale: 0.5 }), { glow: true, ei: 0.6, px: 32 });

    // ------------------------------------------------------------- bathroom
    const bath = group(g, -2.3, 0, -0.1);
    const tub = box(bath, 0.8, 0.5, 1.5, 0, 0.25, 0.2, 0xf0f4f6, { rough: 0.25, metal: 0.05 });
    void tub;
    const vanity = group(bath, 0, 0, -1.0);
    box(vanity, 0.9, 0.85, 0.5, 0, 0.425, 0, 0xdfe4e8, { rough: 0.4, metal: 0.2 });
    cyl(vanity, 0.16, 0.16, 0.05, 0, 0.86, -0.1, 0xf0f4f6, { rough: 0.2, seg: 20 });
    box(vanity, 0.6, 0.5, 0.05, 0, 1.3, -0.22, 0xdfe4e8, { rough: 0.15, metal: 0.05, opacity: 0.3, transparent: true, cast: false }); // mirror
    const fanTimer = group(bath, 0.45, 1.6, -1.2);
    cyl(fanTimer, 0.04, 0.04, 0.02, 0, 0, 0, 0xdfe4e8, { rough: 0.45, seg: 14 });
    const fanPointer = box(fanTimer, 0.005, 0.028, 0.005, 0, 0.015, 0.011, 0xb08a5a, { emissive: 0xb08a5a, ei: 1.1, rough: 0.4 });
    holoTag(fanTimer, "Exhaust fan timer", 0, 0.1, 0, { css: "#b08a5a", w: 0.4 });
    reg(hits, fanTimer, "fan-timer");
    const toilet = group(bath, -0.6, 0, -0.3);
    cyl(toilet, 0.2, 0.22, 0.4, 0, 0.2, 0, 0xf0f4f6, { rough: 0.2, seg: 18 });
    box(toilet, 0.4, 0.15, 0.2, 0, 0.42, -0.15, 0xf0f4f6, { rough: 0.2 });
    const towelRack = group(bath, 0.35, 1.0, -0.05);
    cyl(towelRack, 0.012, 0.012, 0.4, 0, 0, 0, CITY.steel, { rough: 0.3, metal: 0.8, seg: 8 }).rotation.z = Math.PI / 2;
    for (const dy of [-0.02, 0.02]) box(towelRack, 0.3, 0.16, 0.02, 0, -0.14 + dy * 2, 0.02, 0xf4f0e6, { rough: 0.75 });
    const trash = cyl(bath, 0.12, 0.14, 0.28, -1.1, 0.14, 0.4, 0x3a4148, { rough: 0.6, seg: 14 });
    const razor = box(bath, 0.06, 0.008, 0.015, -1.1, 0.26, 0.4, 0xdfe4e8, { rough: 0.4, metal: 0.6 });
    holoTag(bath, "razor — general trash?", -1.1, 0.36, 0.4, { css: "#f0645b", w: 0.44 });
    reg(hits, razor, "razor-in-trash");
    void trash;

    // ------------------------------------------------------------- log board
    const logBoard = holoPanel(g, 0.5, 0.34, -2.9, 1.4, 1.6, (ctx, w, h) => {
      ctx.fillStyle = "rgba(18,12,4,0.9)"; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#b08a5a"; ctx.fillRect(0, 0, w, 5);
      ctx.fillStyle = "#f1ede6";
      ctx.font = `600 ${Math.round(h * 0.16)}px 'Barlow Condensed', Arial, sans-serif`;
      ctx.textAlign = "center"; ctx.textBaseline = "middle";
      ctx.fillText("QUOTA SHEET", w / 2, h * 0.32);
      ctx.font = `${Math.round(h * 0.1)}px Arial, sans-serif`;
      ctx.fillStyle = "#e6dcc9";
      ctx.fillText("Room · time · quota count", w / 2, h * 0.6);
      ctx.fillText("Wage Order 5 rest breaks", w / 2, h * 0.76);
    }, { ry: 0.55, accent: HRT_ACCENT });
    reg(hits, logBoard, "quota-sheet");

    // Guest, staged out of sight until the doorway interrupt.
    const guest = standingFigure(g, 0, 1.7, { ry: Math.PI, cloth: 0x4a5f6b, atStation: true, skin: 0xc7a17e });
    guest.visible = false;

    // Crew: a section supervisor doing a spot-check, clear of the cart and bed.
    const supervisor = standingPerson(g, 2.6, 1.3, { ry: -2.0, cloth: 0x5a4a3a, hiVis: false, skin: 0xb98868 });
    void supervisor;
    const floorLead = standingFigure(g, -0.2, 2.5, { ry: 3.1, cloth: 0xf2f2f2, trousers: 0x2b3138, skin: 0xc99878 });

    let fanOn = false;

    return {
      hits,
      footprint: 2.4,
      spawnLook: new THREE.Vector3(0, 1.2, -0.5),

      onStepComplete(step) {
        if (step.id === "panic-test") repaint(assignBoard.userData.face, signFace("BELT: OK", { bg: "#0d1c14", accent: "#59c97b", fg: "#e9ffe9", scale: 0.5 }));
        if (step.id === "knock-announce-enter") handle.rotation.y = -0.5;
        if (step.id === "strip-bed") stripNear.material = mat(0xece3d0, { rough: 0.75 });
        if (step.id === "fitted-sheet") freshSheet.visible = false;
        if (step.id === "bath-fan") { fanPointer.rotation.z = -1.6; fanOn = true; }
        if (step.id === "chem-dwell") repaint(assignBoard.userData.face, signFace("BOWL: DONE", { bg: "#0d1c14", accent: "#59c97b", fg: "#e9ffe9", scale: 0.5 }));
        if (step.id === "room-check") { remote.material = mat(0x2b3138, { rough: 0.4 }); dnd.visible = false; underBed.visible = false; }
        if (step.id === "thermostat-setback") thermoPointer.rotation.z = -1.2;
      },

      onInterrupt(it) {
        if (it.id === "guest-returns") { guest.visible = true; }
        if (it.id === "sharp-found") { syringeTag.visible = true; }
      },
      onInterruptEnd(it) {
        if (it.id === "guest-returns" && it.resolved === "answered") guest.visible = false;
        if (it.id === "sharp-found") syringeTag.visible = false;
      },

      animate(t) {
        if (fanOn) fanPointer.parent.rotation.y = Math.sin(t * 0.2) * 0.02;
        floorLead.userData.head.rotation.y = Math.sin(t * 0.4) * 0.3;
      },
    };
  },
};
