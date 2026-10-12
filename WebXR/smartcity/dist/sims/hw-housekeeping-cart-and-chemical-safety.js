import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import { box, cyl, slab, group, decal, repaint, signFace, paperFace, mat } from "../../../shared/kit.js";
import {
  CITY, stationPad, holoPanel, holoTag, standingFigure, reg, surfaceTexture, texturedMat, pavingFace,
} from "../citykit.js";
import { radio, flashlight } from "../../../shared/toolkit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Housekeeping Cart & Chemical Safety VR — Culinary &
// Hospitality, hotel housekeeping series.
//
// The part of a room attendant's shift that happens before the first knock:
// the housekeeping stockroom on a generic hotel's service floor, where the
// cart is loaded, the cleaning products are drawn from a wall dilution
// dispenser into bottles that have to carry their own labels, and the new
// product on the shelf is looked up on its safety data sheet before anybody
// sprays it. Then the cart goes down the service corridor to the guest
// floors. The room itself is housekeeping-room-turn; this station is the
// stockroom and the corridor, and the chemistry the whole shift carries on
// the cart. No real property, product or brand is named — the hazard
// communication standard, the state hotel housekeeping rule and the union's
// training fund are.

const HCC_ACCENT = 0x6fa89a;
const HCC_CSS = "#6fa89a";
const HCC_WARN = "#e0664f";

/** A wall placard in the ANSI Z535 CAUTION layout: yellow signal-word band, black text on white. */
function hccPlacard(parent, x, y, z, ry, text) {
  const p = decal(parent, 0.5, 0.36, x, y, z, (c, w, h) => {
    c.fillStyle = "#000"; c.fillRect(0, 0, w, h);
    c.fillStyle = "#fff"; c.fillRect(4, 4, w - 8, h - 8);
    c.fillStyle = "#ffd100"; c.fillRect(4, 4, w - 8, h * 0.26);
    c.fillStyle = "#000"; c.font = `800 ${Math.round(h * 0.18)}px Arial, sans-serif`; c.textAlign = "center"; c.textBaseline = "middle";
    c.fillText("\u26A0 CAUTION", w / 2, h * 0.17);
    c.font = `700 ${Math.round(h * 0.1)}px Arial, sans-serif`;
    text.forEach((l, i) => c.fillText(l, w / 2, h * (0.44 + i * 0.15)));
  }, { px: 320 });
  p.rotation.y = ry;
  return p;
}

export const SIM_HW_HOUSEKEEPING_CART_AND_CHEMICAL_SAFETY = {
  id: "hw-housekeeping-cart-and-chemical-safety",
  index: "318",
  domain: "Culinary & Hospitality",
  trade: "Hotel room attendant — UNITE HERE housekeeping, stockroom and service corridor",
  category: "Culinary & Hospitality",
  indoor: "hotel",
  certification: "OSHA 29 CFR 1910.1200 hazard communication — the safety data sheet for every product on the cart and a label on every secondary bottle; 29 CFR 1910.132 and 29 CFR 1910.138 for the gloves the SDS calls for; ANSI Z358.1 for the eyewash beside the dilution sink; Cal/OSHA's hotel housekeeping musculoskeletal injury prevention standard, 8 CCR 3345, whose worksite evaluation covers the loaded cart a room attendant pushes all shift; UNITE HERE hospitality training on chemical safety and cart handling",
  name: "Housekeeping Cart & Chemical Safety",
  title: simTitle("Housekeeping Cart & Chemical Safety"),
  tagline: "The stockroom before the first room: the new product looked up on its SDS, the dilution dispenser set and the bottle filled and labelled, a coworker stopped from mixing, the cart loaded heavy-low and inside its plate, pushed rather than pulled to the service lift past a leak, sprayed onto the cloth, gloves changed between bathroom and bedroom, and the shift logged",
  accent: HCC_ACCENT,
  accentCss: HCC_CSS,
  parSeconds: 270,
  footprint: 2.4,
  badge: { id: "labelled-and-loaded", name: "Labelled and Loaded", note: "Every bottle labelled, nothing mixed, the cart inside its rating and pushed, and the leak dealt with before anyone walked through it" },

  supportLine: "your UNITE HERE local's member assistance line, or the employee assistance number posted inside the housekeeping office door",

  game: system({
    name: "Stockroom Shift",
    currency: "BOTTLES",
    ranks: ["New Attendant", "Room Attendant", "Stockroom Lead", "Housekeeping Inspector", "Cart and Chemicals Certified"],
    badges: [
      { id: "never-mixed", name: "Never Mixed", note: "No product poured into another, no spray at face height, no cart pulled backwards", test: AWARD.safe },
      { id: "read-it-first", name: "Read It First", note: "The new product's SDS read before the bottle was filled", test: AWARD.stepClean("sds-lookup") },
      { id: "clean-stockroom", name: "Clean Stockroom", note: "No corrections from the board to the log", test: AWARD.clean },
    ],
    challenges: [
      { id: "on-the-floor-early", name: "On the Floor Early", note: "Cart at the service lift inside 80% of par", test: AWARD.fast(0.8) },
      { id: "steady-push", name: "Steady Push", note: "The corridor push held in band all the way", test: AWARD.unbroken },
      { id: "inside-the-plate", name: "Inside the Plate", note: "The cart's load committed inside the band first time", test: AWARD.precise(0.7) },
    ],
  }),

  hazards: {
    "bleach-into-glass": "You reached to top up the glass-cleaner bottle from the bleach jug. Many glass cleaners carry ammonia and most bathroom disinfectants carry chlorine bleach or an acid, and the SDS for each says the same thing in its own words: mixed, they release chloramine or chlorine gas. A spray bottle is a small closed container, and the first squeeze after the mix goes straight at the face of whoever is holding it.",
    "spray-at-face": "You aimed the spray at the mirror at face height and squeezed into the air. A fine mist hangs in a small tiled room at exactly the height you breathe, and what does not land on the glass lands in your eyes and lungs. The product does its work on the cloth; sprayed onto the cloth, below the face, almost none of it becomes something you inhale.",
    "stack-above-sightline": "You stacked the extra towels on the cart's top shelf until they stood above your eye line. A cart you cannot see over is pushed blind down a corridor with guests, children and other carts in it, and a tall load on the top shelf moves the cart's weight high, so it tips on the first threshold or carpet edge instead of rolling over it.",
    "pull-cart-backward": "You started to pull the loaded cart backwards into the service lift. Walking backwards you cannot see the door track, the gap or the person behind you, and pulling a heavy cart puts the load through a twisted back and a shoulder instead of your legs. Push it forward, eyes over the top, and let somebody hold the door.",
  },

  lateNotes: {
    "fill-nozzle": "The bottle is filled once the dispenser is set to this product's station and its SDS has been read — not from whatever the dial was left on.",
    "cart-scale": "The cart is read against its plate once it is loaded, not while half the linen is still on the shelf.",
    "shift-log": "The log is written at the end, once the corridor leak is dealt with and the cart is on the floor.",
  },

  steps: [
    {
      id: "product-board", kind: "select", target: "stock-board",
      title: "Read the stockroom board and the new-product notice",
      cue: "Read today's board: your section, the products on the cart list and the notice that a new bathroom cleaner has replaced the old one.",
      why: "A product change is the moment chemistry goes wrong in a housekeeping department: the new bottle looks like the old one, the old habits come with it, and nobody has read what is different. The board is where the department tells the room attendant the product changed; the notice is what sends them to its safety data sheet before the first bottle is drawn, rather than after somebody has used it the old way.",
    },
    {
      id: "sds-lookup", kind: "select", target: "sds-binder",
      title: "Look up the new cleaner's safety data sheet",
      cue: "Open the SDS station to the new bathroom cleaner: its hazards, what it must never be mixed with, the gloves and eye protection it calls for, and its first aid.",
      why: "Under 29 CFR 1910.1200 the employer keeps a safety data sheet for every hazardous product in the workplace where the worker can reach it during the shift, and the room attendant has a right to read it. Section two says what the product does to a person, section seven what it must be stored apart from, section eight the gloves and eye protection, section four what to do when it splashes. None of that is on the front of the bottle in enough detail to act on.",
    },
    {
      id: "dilution-dial", kind: "turn", target: "dilution-selector",
      title: "Turn the dilution dispenser to the product's station",
      cue: "Turn the wall dispenser's selector to the station marked for the new bathroom cleaner — not whatever it was left on by the last shift.",
      why: "A wall dilution dispenser draws concentrate through a metered tip into running water, so the attendant never pours a concentrate by eye. It only does that if the selector is on the right product: left on the last station, it fills the bathroom bottle with floor cleaner, or with a disinfectant at a strength nobody meant. The station labels on the dispenser are what tie each tip to the SDS just read.",
      turn: { turns: 0.5, axis: "z", label: "DISPENSER STATION", readout: (t) => (t < 0.25 ? "floor cleaner" : t < 0.48 ? "glass" : "bathroom cleaner") },
    },
    {
      id: "fill-bottle", kind: "hold", target: "fill-nozzle", seconds: 6,
      title: "Fill the bottle at the dispenser, hands clear of the splash",
      cue: "Hold the bottle under the nozzle and keep the button pressed until it reaches the fill line — gloves and glasses on, bottle on the drip tray, not held at face height.",
      why: "Filling is when the concentrate is closest to the skin and eyes, and the dispenser's own air gap can spit. The bottle stands on the drip tray below face height, gloved hands hold it, and the button is held until the fill line so the bottle is filled once rather than topped up twice. The eyewash at the sink exists because this is where a splash happens if it happens at all.",
      holdBreakNote: "You let go before the fill line. A half-filled bottle gets topped up later, from whatever is nearest, and that is how products end up mixed — fill it once, all the way.",
    },
    {
      id: "label-bottle", kind: "select", target: "bottle-label",
      title: "Label the secondary bottle",
      cue: "Put the printed label on the bottle: the product's name and its hazard statements, matching the SDS.",
      why: "The hazard communication standard does not stop at the drum. A spray bottle filled from a dispenser is a secondary container, and it carries a label with the product's identity and its hazards so that anyone who picks it up — including the next attendant, or a guest's child who finds a cart left in the corridor — knows what is in it. An unlabelled bottle is the one nobody can look up when it splashes into an eye.",
    },
    {
      id: "cart-load", kind: "sequence",
      targets: ["load-linen-low", "load-caddy-apart", "load-light-top"],
      itemNames: { "load-linen-low": "heavy linen on the bottom shelf", "load-caddy-apart": "chemical caddy on its own shelf, away from linen", "load-light-top": "light items on top, below eye line" },
      title: "Load the cart heavy-low, chemicals apart, light on top",
      cue: "Heavy linen on the bottom shelf, the chemical caddy on its own shelf away from clean linen, and only light items on top, below your eye line.",
      why: "Weight low keeps the cart's centre of gravity down so it rolls over thresholds instead of tipping, and it keeps the heaviest lifts at knee height rather than overhead. The caddy rides on its own shelf because a leaking bottle on clean towels becomes a chemical on a guest's skin. The top stays low so the attendant can see over the load — the housekeeping rule's worksite evaluation looks at exactly this cart.",
      outOfOrderNote: "Heavy first, on the bottom — the base goes in before anything is stacked on it, and the caddy's place is set before the light things fill the top.",
    },
    {
      id: "cart-weight", kind: "gauge", target: "cart-scale",
      title: "Read the loaded cart against its plate rating",
      cue: "Roll the cart onto the stockroom scale and commit when the load reads inside the band marked against the rating on the cart's own plate.",
      why: "A housekeeping cart is rated by its maker for a load, and past that rating the casters bind and the push force climbs until the attendant is leaning their whole weight into every start. That extra force, a hundred times a shift, is the shoulder and low-back injury Cal/OSHA's hotel housekeeping rule was written to design out. The number that matters is the one on the plate, not a feeling about how heavy it seems.",
      gauge: { label: "CART LOAD", speed: 0.7, green: [0.46, 0.66], readout: (t) => `${Math.round(t * 120)}% of plate`, missNote: "Outside the band against the plate — take linen off or add the missing stock, then read it again before it leaves the stockroom." },
    },
    {
      id: "caddy-audit", kind: "find", noHint: true,
      targets: ["unlabelled-bottle", "bleach-beside-ammonia", "torn-glove-box"],
      itemNames: { "unlabelled-bottle": "an unlabelled spray bottle in the caddy", "bleach-beside-ammonia": "bleach stored against the ammonia glass cleaner", "torn-glove-box": "a split glove on top of the glove box" },
      itemNotes: {
        "unlabelled-bottle": "A spray bottle with no label is a product nobody can look up. It is emptied into the dispenser's waste as directed, rinsed, and refilled and labelled — never used on a guess.",
        "bleach-beside-ammonia": "The bleach jug is wedged against the ammonia glass cleaner. A cracked cap or a drip between them makes gas inside the caddy; the SDS storage sections both say keep apart.",
        "torn-glove-box": "A split nitrile glove is sitting on the box as if it were still good. A glove with a tear is a glove that lets concentrate onto the skin while you think you are protected.",
      },
      title: "Audit the caddy before it leaves the stockroom",
      cue: "Three things in and around the caddy are wrong. Find them before the cart goes to the floor.",
      why: "The caddy is the attendant's chemical store for eight hours and forty rooms, and whatever is wrong with it in the stockroom is wrong in every bathroom on the section. An unlabelled bottle, incompatible products touching and a damaged glove are each small; together they are the usual story behind a housekeeping chemical injury, and each is a thirty-second fix here.",
    },
    {
      id: "push-cart", kind: "track", target: "cart-handle", seconds: 7,
      title: "Push the cart to the service lift",
      cue: "Push the cart down the service corridor at a steady walking pace, eyes over the load, both hands on the handle.",
      why: "A loaded cart is started by leaning into it with the legs and kept rolling at a steady pace, because stopping and restarting costs the most force and a rush into a corner is how carts tip and hands get pinched against door frames. Both hands on the handle, facing the direction of travel, is the posture the injury-prevention plan asks for; it is also the only way to see a guest step out of a side door.",
      track: { start: 0.12, green: [0.4, 0.62], rise: 0.55, fall: 0.45, drift: 0.12, label: "PUSH", readout: (v) => (v < 0.4 ? "stalling — restart costs force" : v > 0.62 ? "rushing the corner" : "steady push") },
      holdBreakNote: "The push fell out of the steady band. Stalling means a hard restart and rushing means a tip or a pinch at the lift — bring it back to a walking pace.",
    },
    {
      id: "spray-cloth", kind: "drag", target: "spray-bottle",
      title: "Spray onto the cloth, not into the air",
      cue: "At the demonstration mirror, carry the spray bottle to the folded cloth and spray onto it, below face height.",
      why: "A trigger sprayer turns liquid into a mist that hangs at head height, and in a small bathroom with one door the attendant breathes most of what misses. Spraying into a folded cloth held low puts the product where the cleaning happens and keeps it out of the air, and it uses less of it. Where a product is labelled for spraying onto a surface, the label still wants the nozzle close and aimed down.",
      drag: { to: "cloth-socket", radius: 0.5, missNote: "Not onto the cloth — bring the nozzle down to the folded cloth on the vanity, below your face, before you squeeze." },
    },
    {
      id: "glove-change", kind: "sequence",
      targets: ["glove-off", "hand-wash", "glove-on"],
      itemNames: { "glove-off": "gloves peeled off inside-out", "hand-wash": "hands washed at the sink", "glove-on": "a fresh pair on" },
      title: "Change gloves between bathroom and bedroom",
      cue: "Peel the bathroom gloves off inside-out into the bin, wash your hands, and put a fresh pair on before touching bed linen.",
      why: "Gloves that cleaned a toilet carry that toilet to every pillowcase they touch, and gloves that have been in a disinfectant for an hour carry it onto the skin through the pinholes nobody can see. Peeling them inside-out keeps the outside off the hands, the wash deals with what got through, and a new pair goes on for the bedroom. The SDS's section eight is why they are the right gloves; this is why they are fresh ones.",
      outOfOrderNote: "Off, wash, then on — a fresh glove pulled over an unwashed hand just carries the contamination inside.",
    },
    {
      id: "emergency-find", kind: "find", noHint: true,
      targets: ["eyewash-station", "first-aid-kit"],
      itemNames: { "eyewash-station": "the eyewash at the dilution sink", "first-aid-kit": "the first-aid kit and its emergency card" },
      itemNotes: {
        "eyewash-station": "The eyewash is at the dilution sink, where a splash happens. You know where it is before you need it, with your eyes shut.",
        "first-aid-kit": "The first-aid kit hangs by the door with the emergency card inside the lid. Section four of the SDS tells you what to do; this is where the things to do it with are.",
      },
      title: "Find the eyewash and the first-aid kit",
      cue: "Two things in this stockroom you need to be able to reach without looking. Find them.",
      why: "ANSI Z358.1 puts an eyewash where a corrosive can splash so that the flush starts within seconds, because a strong cleaner does most of its damage to an eye in the first minute. The station only works for the person who already knows where it is — nobody reads a sign with a chemical in their eye. The first-aid kit and its card are the same idea for everything section four of the SDS asks for.",
    },
    {
      id: "shift-log", kind: "select", target: "shift-log",
      title: "Log the products drawn, the leak and the caddy fixes",
      cue: "Write the bottles drawn and labelled, the leaking bottle at the lift, the unlabelled bottle and the split glove on the stockroom log.",
      why: "The stockroom log is how the department sees what its chemicals are actually doing on the floor: a bottle that leaked is a cap or a sprayer that fails, an unlabelled bottle is a label printer that ran out, a split glove is a box of the wrong size or grade. Written today, each one becomes an order or a repair; remembered, it becomes the next attendant's splash.",
    },
    {
      id: "crew-checkin", kind: "select", target: "crew-radio",
      title: "Check in with the housekeeping supervisor",
      cue: "Radio the supervisor that the cart is on the floor, the leak is cleaned and flagged, and the new product is on the cart with its SDS read.",
      why: "The supervisor is holding the section assignments and the new-product rollout, and they need to know the leak happened and where, so the corridor is checked and the sprayer model is looked at. It is also a check-in with a person: a near miss with a coworker mixing chemicals leaves something behind, and the member assistance line is there for that as much as for the big things.",
    },
  ],

  interrupts: [
    {
      id: "coworker-mixing",
      kind: "Coworker mixing products",
      after: "fill-bottle", delay: 2, seconds: 12,
      alert: "At the utility sink behind you, a coworker is tipping the bleach jug into a half-empty glass-cleaner bottle 'to make it stronger'.",
      cue: "Stop them — call out and get the bleach jug out of their hands before it reaches the bottle.",
      target: "coworker-sink",
      why: "Bleach and an ammonia glass cleaner make chloramine gas the moment they meet, and a spray bottle concentrates it right under the face of the person pouring. Stopping the pour is the whole response: once it has happened the bottle is a gas source, the room is evacuated and ventilated, and somebody is being treated. Nobody is being difficult by shouting across a stockroom for this.",
      missNote: "The bleach went into the glass cleaner. The bottle fizzed and a sharp chlorine smell filled the stockroom; your coworker was coughing at the sink and the room had to be cleared and aired before anyone could finish loading.",
      wrongNote: "That does not stop the pour. Your coworker at the sink with the bleach jug is the thing — speak up and take the jug before it reaches the bottle.",
    },
    {
      id: "leak-at-lift",
      kind: "Chemical leak in the corridor",
      after: "push-cart", delay: 2, seconds: 12,
      alert: "A sprayer on the caddy has cracked on the lift threshold and is dripping cleaner onto the service corridor floor, right where the next cart and a guest will walk.",
      cue: "Stop the cart and get the spill kit off the corridor wall: absorbent down and the wet-floor sign up.",
      target: "spill-kit",
      why: "A cleaning concentrate on a hard corridor floor is a slip for the next person and a chemical on their shoes, and on carpet it spreads under the next cart's wheels. The spill kit is on the corridor wall so the leak is contained where it happened: absorbent first, the sign up, the cracked bottle bagged and noted, and only then does the cart go on.",
      missNote: "You pushed on past the drip. A houseman pulling the next cart slipped in it at the lift and went down on one knee, and the cleaner tracked on both carts' wheels down the whole guest corridor.",
      wrongNote: "The drip is on the corridor floor now. The spill kit on the wall is what deals with it — absorbent down and the sign up before anyone walks through.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.4, HCC_ACCENT);

    // ------------------------------------------------------------- floors
    // Sealed vinyl tile in the stockroom and a carpet runner down the service
    // corridor to the lift: the two surfaces a leak behaves differently on.
    const tileTex = surfaceTexture((cx, w, h) => pavingFace(cx, w, h, { tiles: 10, base: "#c9ccc6", base2: "#bcc0ba", seam: "rgba(0,0,0,0.12)" }), { repeat: 3, px: 320 });
    const stockFloor = box(g, 3.6, 0.02, 2.4, -0.6, 0.011, -1.2, 0xc9ccc6, { rough: 0.6, cast: false });
    stockFloor.material = texturedMat(tileTex, { rough: 0.55, metal: 0.05, color: 0xd0d3cd });
    const runTex = surfaceTexture((cx, w, h) => pavingFace(cx, w, h, { tiles: 6, base: "#5a4a5e", base2: "#524456", seam: "rgba(0,0,0,0.05)" }), { repeat: 2, px: 256 });
    const runner = box(g, 1.3, 0.02, 3.2, 2.0, 0.012, 0.6, 0x5a4a5e, { rough: 0.9, cast: false });
    runner.material = texturedMat(runTex, { rough: 0.92, color: 0x6a5a6e });
    // Back wall of the stockroom.
    box(g, 4.4, 2.4, 0.1, -0.4, 1.2, -2.5, 0xe4e0d6, { rough: 0.85 });
    box(g, 4.4, 0.12, 0.12, -0.4, 0.06, -2.43, 0x6b6258, { rough: 0.7 });
    cyl(g, 0.14, 0.14, 0.03, 1.2, 2.0, -2.44, 0xf4f4f0, { rough: 0.5, seg: 18 }).rotation.x = Math.PI / 2;

    // ------------------------------------------------------------ the board
    const board = holoPanel(g, 0.8, 0.52, -2.3, 1.55, -2.3, (ctx, w, h) => {
      ctx.fillStyle = "#101a18"; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = HCC_CSS; ctx.fillRect(0, 0, w, 6);
      ctx.font = `600 ${Math.round(h * 0.11)}px 'Barlow Condensed', Arial, sans-serif`;
      ctx.textAlign = "left"; ctx.textBaseline = "middle"; ctx.fillStyle = "#e6f2ee";
      ctx.fillText("STOCKROOM — FLOOR 4 SECTIONS", w * 0.05, h * 0.13);
      ctx.font = `${Math.round(h * 0.075)}px Arial, sans-serif`; ctx.fillStyle = "#cfe3dc";
      ["Section B: rooms 410-426", "Cart list: bathroom, glass, disinfectant", "NEW: bathroom cleaner replaced —", "read its SDS before first use", "Carts: load to the plate, heavy low", "Leaks: spill kit on corridor wall"].forEach((l, i) => ctx.fillText(l, w * 0.05, h * (0.3 + i * 0.11)));
    }, { accent: HCC_ACCENT, ry: 0.3 });
    reg(hits, board, "stock-board");

    // SDS station: a wall binder rack with the new product's sheet out.
    const sds = group(g, -1.35, 0, -2.38);
    box(sds, 0.5, 0.62, 0.12, 0, 1.3, 0, 0xd8b43a, { rough: 0.6 });
    const sdsSheet = decal(sds, 0.36, 0.44, 0, 1.3, 0.065, paperFace("SAFETY DATA SHEET", ["Bathroom cleaner (new)", "2 Hazards: eye damage, skin", "4 First aid: flush eyes", "7 Store apart: bleach", "8 PPE: nitrile, goggles"], { scale: 0.8 }));
    holoTag(sds, "SDS station", 0, 1.72, 0.07, { css: HCC_CSS, w: 0.26 });
    reg(hits, sdsSheet, "sds-binder");

    // Dilution dispenser over the utility sink, with the eyewash beside it.
    const sink = group(g, -0.3, 0, -2.2);
    box(sink, 0.9, 0.82, 0.5, 0, 0.41, 0, 0xb9bec2, { rough: 0.35, metal: 0.6 });
    box(sink, 0.7, 0.06, 0.36, 0, 0.8, 0, 0x8d949a, { rough: 0.3, metal: 0.7 });
    const disp = group(sink, 0, 1.28, -0.18);
    box(disp, 0.62, 0.36, 0.14, 0, 0, 0, 0x2f3a3f, { rough: 0.5, metal: 0.2 });
    for (let i = 0; i < 4; i++) {
      const col = [0x3a8ad6, 0x5cc2d8, 0xe2c14a, 0xd46a5a][i];
      cyl(disp, 0.035, 0.035, 0.22, -0.22 + i * 0.145, -0.34, 0.1, col, { rough: 0.4, seg: 10 });
    }
    const dial = group(disp, 0.24, 0.08, 0.075);
    cyl(dial, 0.055, 0.055, 0.03, 0, 0, 0, 0xdfe4e8, { rough: 0.4, metal: 0.4, seg: 16 }).rotation.x = Math.PI / 2;
    const dialPointer = box(dial, 0.008, 0.045, 0.01, 0, 0.02, 0.018, 0xe0664f, { emissive: 0xe0664f, ei: 1.0 });
    holoTag(disp, "dilution dispenser — station", 0, 0.28, 0.08, { css: HCC_CSS, w: 0.5 });
    reg(hits, dial, "dilution-selector");
    const nozzle = cyl(disp, 0.03, 0.02, 0.12, -0.05, -0.2, 0.08, 0x1d2428, { rough: 0.5, seg: 10 });
    reg(hits, nozzle, "fill-nozzle");
    const fillBottle = cyl(sink, 0.04, 0.04, 0.2, -0.05, 0.93, -0.1, 0xe2c14a, { rough: 0.35, seg: 12 });
    const fillLevel = cyl(sink, 0.036, 0.036, 0.02, -0.05, 0.84, -0.1, 0xf4e6a4, { rough: 0.3, seg: 12, transparent: true, opacity: 0.9 });
    const label = decal(sink, 0.07, 0.1, -0.05, 0.93, -0.058, paperFace("", ["BATH CLEANER", "Danger: eyes", "See SDS"], { scale: 0.6 }));
    label.visible = false;
    const labelRoll = box(sink, 0.12, 0.08, 0.1, 0.3, 0.87, 0.1, 0xf2f2ee, { rough: 0.7 });
    holoTag(sink, "labels", 0.3, 1.0, 0.1, { css: HCC_CSS, w: 0.16 });
    reg(hits, labelRoll, "bottle-label");
    // The hazard: the bleach jug standing open beside the glass cleaner refill.
    const jug = group(sink, -0.34, 0.83, 0.05);
    box(jug, 0.12, 0.24, 0.1, 0, 0.12, 0, 0xf4f4f0, { rough: 0.4 });
    decal(jug, 0.09, 0.08, 0, 0.13, 0.052, signFace("BLEACH", { bg: "#1b1e22", accent: "#e0664f", scale: 0.44 }));
    holoTag(sink, "top up glass cleaner from this?", -0.34, 1.2, 0.05, { css: HCC_WARN, w: 0.56 });
    reg(hits, jug, "bleach-into-glass");
    // Eyewash on the sink's end, pinned by its green sign.
    const eyewash = group(sink, 0.55, 0, 0);
    cyl(eyewash, 0.02, 0.02, 0.9, 0, 0.45, 0, 0x2f7d4a, { rough: 0.5, metal: 0.4, seg: 8 });
    cyl(eyewash, 0.09, 0.07, 0.06, 0, 0.93, 0, 0x2f7d4a, { rough: 0.5, seg: 14 });
    decal(eyewash, 0.14, 0.1, 0, 1.2, 0.03, signFace("EYEWASH", { bg: "#00843d", accent: "#ffffff", fg: "#ffffff", scale: 0.45 }));
    reg(hits, eyewash, "eyewash-station");

    // Coworker at the sink, standing clear of it on the corridor side.
    const coworker = standingFigure(g, 0.75, -1.35, { ry: -2.6, cloth: 0x6b8a9a, trousers: 0x2b3138 });
    holoTag(coworker, "coworker at the sink", 0, 1.95, 0, { css: HCC_CSS, w: 0.36 });
    reg(hits, coworker, "coworker-sink");
    const pourJug = group(g, 0.4, 0.95, -1.8);
    box(pourJug, 0.1, 0.2, 0.08, 0, 0, 0, 0xf4f4f0, { rough: 0.4 });
    pourJug.visible = false;

    // Shelving with linen and the glove box.
    const shelf = group(g, -2.55, 0, -1.2, Math.PI / 2);
    for (const y of [0.15, 0.7, 1.25, 1.8]) box(shelf, 1.4, 0.03, 0.45, 0, y, 0, 0xa7aeb4, { rough: 0.4, metal: 0.6 });
    for (const sx of [-0.68, 0.68]) for (const sz of [-0.2, 0.2]) box(shelf, 0.03, 1.9, 0.03, sx, 0.95, sz, 0x7d858c, { rough: 0.4, metal: 0.6 });
    for (let i = 0; i < 3; i++) slab(shelf, 0.38, 0.22, 0.34, -0.45 + i * 0.45, 0.28, 0, 0xf2eee4, { radius: 0.03, rough: 0.85 });
    for (let i = 0; i < 3; i++) slab(shelf, 0.38, 0.18, 0.34, -0.45 + i * 0.45, 0.81, 0, 0xe9f0f2, { radius: 0.03, rough: 0.85 });
    for (let i = 0; i < 2; i++) slab(shelf, 0.38, 0.14, 0.34, -0.45 + i * 0.45, 1.34, 0, 0xf6efe0, { radius: 0.03, rough: 0.85 });
    for (let i = 0; i < 3; i++) slab(shelf, 0.38, 0.12, 0.34, -0.45 + i * 0.45, 1.88, 0, 0xdfe9ee, { radius: 0.03, rough: 0.85 });
    // Soiled-linen hamper at the shelf end, lid shut.
    const hamper = group(g, -2.3, 0, 0.9);
    cyl(hamper, 0.26, 0.24, 0.7, 0, 0.35, 0, 0x5b6a7a, { rough: 0.85, seg: 16 });
    cyl(hamper, 0.27, 0.27, 0.04, 0, 0.72, 0, 0x3f4a55, { rough: 0.7, seg: 16 });
    decal(hamper, 0.24, 0.08, 0, 0.5, 0.25, signFace("SOILED", { bg: "#1b1e22", accent: "#e0664f", scale: 0.44 }));
    const gloveBox = box(shelf, 0.26, 0.12, 0.14, 0.3, 1.33, 0.05, 0x3a6fc9, { rough: 0.6 });
    decal(gloveBox, 0.2, 0.06, 0, 0, 0.071, signFace("NITRILE M", { bg: "#eef2f8", accent: "#3a6fc9", fg: "#1b2a4a", scale: 0.4 }));
    const splitGlove = box(shelf, 0.12, 0.02, 0.06, 0.3, 1.41, 0.05, 0x5b8ee0, { rough: 0.6 });
    reg(hits, splitGlove, "torn-glove-box");
    void gloveBox;

    // First-aid kit on the wall by the corridor door.
    const aid = box(g, 0.34, 0.26, 0.1, 1.2, 1.35, -2.42, 0xf2f2ee, { rough: 0.5 });
    decal(aid, 0.26, 0.18, 0, 0, 0.051, signFace("FIRST AID", { bg: "#00843d", accent: "#ffffff", fg: "#ffffff", scale: 0.42 }));
    reg(hits, aid, "first-aid-kit");

    // Stockroom scale, flush with the floor.
    const scale = group(g, 0.4, 0, -0.55);
    box(scale, 1.2, 0.05, 0.8, 0, 0.025, 0, 0x5b646b, { rough: 0.5, metal: 0.6 });
    const scaleHead = group(scale, 0.7, 0, -0.3);
    cyl(scaleHead, 0.025, 0.025, 1.0, 0, 0.5, 0, 0x7d858c, { rough: 0.4, metal: 0.6, seg: 8 });
    const scaleScreen = decal(scaleHead, 0.2, 0.12, 0, 1.05, 0.03, signFace("--- %", { bg: "#0d1c18", accent: HCC_CSS, fg: "#dff3ec", scale: 0.55 }), { glow: true, ei: 0.8 });
    holoTag(scaleHead, "load vs plate rating", 0, 1.22, 0.03, { css: HCC_CSS, w: 0.36 });
    reg(hits, scaleScreen, "cart-scale");

    // ------------------------------------------------------------- the cart
    const cart = group(g, 0.4, 0, -0.55, 0);
    const cartBody = group(cart, 0, 0, 0);
    for (const y of [0.18, 0.62, 1.02]) box(cartBody, 1.1, 0.04, 0.52, 0, y, 0, 0x8b929a, { rough: 0.4, metal: 0.55 });
    for (const sx of [-0.53, 0.53]) for (const sz of [-0.24, 0.24]) {
      cyl(cartBody, 0.014, 0.014, 0.98, sx, 0.6, sz, CITY.darkSteel, { rough: 0.5, metal: 0.6, seg: 8 });
      cyl(cartBody, 0.045, 0.045, 0.05, sx, 0.05, sz, 0x22262b, { rough: 0.7, seg: 10 });
    }
    const handle = cyl(cartBody, 0.02, 0.02, 0.5, -0.62, 0.95, 0, 0x2b3138, { rough: 0.6, seg: 10 });
    handle.rotation.x = Math.PI / 2;
    holoTag(cartBody, "push handle", -0.62, 1.12, 0, { css: HCC_CSS, w: 0.24 });
    reg(hits, handle, "cart-handle");
    const plate = decal(cartBody, 0.12, 0.07, 0.3, 0.4, 0.262, paperFace("RATED LOAD", ["see plate"], { scale: 0.55 }));
    void plate;
    const linenLow = slab(cartBody, 0.9, 0.3, 0.44, 0, 0.36, 0, 0xf2eee4, { radius: 0.03, rough: 0.85 });
    linenLow.visible = false;
    const linenLowHit = box(cartBody, 0.9, 0.3, 0.44, 0, 0.36, 0, 0xffffff, { opacity: 0.12, transparent: true, cast: false });
    holoTag(cartBody, "bottom: heavy linen", 0.2, 0.46, 0.27, { css: HCC_CSS, w: 0.34 });
    reg(hits, linenLowHit, "load-linen-low");
    const caddy = group(cartBody, 0.25, 0.64, 0);
    box(caddy, 0.4, 0.16, 0.26, 0, 0.08, 0, 0x3a4148, { rough: 0.55, metal: 0.3 });
    const glassBottle = cyl(caddy, 0.032, 0.032, 0.18, -0.12, 0.25, 0, 0x5cc2d8, { rough: 0.35, seg: 10 });
    const bathBottle = cyl(caddy, 0.032, 0.032, 0.18, 0.0, 0.25, 0, 0xe2c14a, { rough: 0.35, seg: 10 });
    const bleachSmall = cyl(caddy, 0.034, 0.034, 0.2, -0.06, 0.26, 0.06, 0xf4f4f0, { rough: 0.35, seg: 10 });
    reg(hits, bleachSmall, "bleach-beside-ammonia");
    const noLabel = cyl(caddy, 0.03, 0.03, 0.18, 0.13, 0.25, 0, 0xcfd8dc, { rough: 0.3, seg: 10, transparent: true, opacity: 0.75 });
    reg(hits, noLabel, "unlabelled-bottle");
    void glassBottle; void bathBottle;
    const caddyHit = box(cartBody, 0.44, 0.1, 0.3, -0.25, 0.7, 0, 0xffffff, { opacity: 0.12, transparent: true, cast: false });
    holoTag(cartBody, "middle: caddy, own shelf", -0.25, 0.84, 0.27, { css: HCC_CSS, w: 0.42 });
    reg(hits, caddyHit, "load-caddy-apart");
    const topHit = box(cartBody, 0.6, 0.1, 0.4, 0.1, 1.1, 0, 0xffffff, { opacity: 0.12, transparent: true, cast: false });
    holoTag(cartBody, "top: light, below eye line", 0.1, 1.25, 0.2, { css: HCC_CSS, w: 0.44 });
    reg(hits, topHit, "load-light-top");
    const tallStack = group(g, -0.9, 0, 0.45);
    for (let i = 0; i < 3; i++) slab(tallStack, 0.36, 0.2, 0.3, 0, 0.12 + i * 0.21, 0, 0xf6f2e8, { radius: 0.03, rough: 0.85 });
    holoTag(tallStack, "stack these on top?", 0, 0.82, 0, { css: HCC_WARN, w: 0.38 });
    reg(hits, tallStack, "stack-above-sightline");

    // ------------------------------------------------ corridor and service lift
    const lift = group(g, 2.0, 0, -1.7);
    box(lift, 1.3, 2.3, 0.12, 0, 1.15, -0.1, 0x9aa3ab, { rough: 0.35, metal: 0.7 });
    const liftDoor = box(lift, 1.0, 2.05, 0.04, 0, 1.03, -0.02, 0xb7c0c7, { rough: 0.25, metal: 0.8 });
    box(lift, 1.1, 0.03, 0.2, 0, 0.015, 0.06, 0x6d757c, { rough: 0.4, metal: 0.8 });
    holoTag(lift, "service lift", 0, 2.4, 0, { css: HCC_CSS, w: 0.26 });
    void liftDoor;
    const pullBack = box(lift, 0.6, 0.6, 0.3, -0.2, 0.9, 0.4, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(lift, "back it in, pulling?", -0.2, 1.32, 0.45, { css: HCC_WARN, w: 0.4 });
    reg(hits, pullBack, "pull-cart-backward");
    const spillKit = group(g, 2.7, 0, -0.6, -Math.PI / 2);
    box(spillKit, 0.44, 0.5, 0.2, 0, 1.0, 0, 0xe2c14a, { rough: 0.6 });
    decal(spillKit, 0.34, 0.2, 0, 1.08, 0.101, signFace("SPILL KIT", { bg: "#1b1e22", accent: "#e2c14a", scale: 0.44 }));
    holoTag(spillKit, "spill kit", 0, 1.38, 0.1, { css: HCC_CSS, w: 0.2 });
    reg(hits, spillKit, "spill-kit");
    const puddle = cyl(g, 0.34, 0.34, 0.006, 1.9, 0.026, -0.9, 0x9fd7c8, { rough: 0.05, metal: 0.3, seg: 18, transparent: true, opacity: 0.8, cast: false });
    puddle.visible = false;
    const absorb = box(g, 0.6, 0.012, 0.5, 1.9, 0.03, -0.9, 0xd8d2c0, { rough: 0.95, cast: false });
    absorb.visible = false;
    const wetSign = group(g, 1.4, 0, -0.9);
    for (const s of [-1, 1]) { const leg = box(wetSign, 0.3, 0.62, 0.02, 0, 0.3, s * 0.08, 0xf2c14b, { rough: 0.6 }); leg.rotation.x = s * 0.22; }
    wetSign.visible = false;

    // --------------------------------------------- the demonstration vanity
    const vanity = group(g, -1.7, 0, 1.2, 0.6);
    box(vanity, 0.8, 0.82, 0.46, 0, 0.41, 0, 0xdfe4e8, { rough: 0.4, metal: 0.2 });
    box(vanity, 0.7, 0.55, 0.03, 0, 1.35, -0.21, 0xe4f1f6, { rough: 0.1, metal: 0.15 });
    const cloth = box(vanity, 0.2, 0.02, 0.16, 0.2, 0.84, 0.05, 0x6fa8d6, { rough: 0.9 });
    const clothSocket = box(vanity, 0.3, 0.12, 0.3, 0.2, 0.9, 0.05, 0xffffff, { opacity: 0.001, transparent: true, cast: false });
    hits["cloth-socket"] = clothSocket;
    holoTag(vanity, "cloth — spray here", 0.2, 1.0, 0.1, { css: HCC_CSS, w: 0.34 });
    const sprayBottle = group(vanity, -0.2, 0.84, 0.05);
    cyl(sprayBottle, 0.035, 0.035, 0.18, 0, 0.09, 0, 0xe2c14a, { rough: 0.35, seg: 12 });
    box(sprayBottle, 0.03, 0.06, 0.07, 0, 0.21, 0.02, 0x2b3138, { rough: 0.5 });
    reg(hits, sprayBottle, "spray-bottle");
    const faceSpray = box(vanity, 0.36, 0.3, 0.1, -0.1, 1.45, -0.12, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(vanity, "spray the mirror at face height?", -0.1, 1.72, -0.12, { css: HCC_WARN, w: 0.58 });
    reg(hits, faceSpray, "spray-at-face");
    void cloth;

    // Glove change: the bin, the hand sink and a fresh box at the vanity.
    const gloveBin = cyl(g, 0.14, 0.12, 0.42, -0.8, 0.21, 1.75, 0x3a4148, { rough: 0.6, seg: 14 });
    holoTag(g, "gloves off, inside-out", -0.8, 0.6, 1.75, { css: HCC_CSS, w: 0.4 });
    reg(hits, gloveBin, "glove-off");
    const handSink = group(g, -2.5, 0, 0.2, Math.PI / 2);
    box(handSink, 0.5, 0.8, 0.4, 0, 0.4, 0, 0xdfe4e8, { rough: 0.35, metal: 0.3 });
    cyl(handSink, 0.015, 0.015, 0.2, 0, 0.9, -0.12, CITY.steel, { rough: 0.3, metal: 0.9, seg: 8 });
    holoTag(handSink, "hand sink", 0, 1.1, 0, { css: HCC_CSS, w: 0.2 });
    reg(hits, handSink, "hand-wash");
    const freshGloves = box(g, 0.24, 0.1, 0.13, -1.3, 0.87, 1.55, 0x3a6fc9, { rough: 0.6 });
    holoTag(g, "fresh pair", -1.3, 1.02, 1.55, { css: HCC_CSS, w: 0.2 });
    reg(hits, freshGloves, "glove-on");

    // Log clipboard, the supervisor's radio and the stockroom signs.
    const logDesk = group(g, 1.35, 0, 1.75, -0.4);
    box(logDesk, 0.7, 0.75, 0.45, 0, 0.375, 0, 0x6b5a48, { rough: 0.7 });
    const logSheet = decal(logDesk, 0.3, 0.38, -0.12, 0.755, 0, paperFace("STOCKROOM LOG", ["Bottles drawn / labelled", "Leaks / breakages", "Caddy fixes", "Attendant / time"], { scale: 0.8 }));
    logSheet.rotation.x = -Math.PI / 2;
    reg(hits, logSheet, "shift-log");
    const crewRadio = radio(logDesk, 0.2, 0.75, 0.05, { ry: -0.3 });
    holoTag(logDesk, "radio — supervisor", 0.2, 1.08, 0.05, { css: HCC_CSS, w: 0.36 });
    reg(hits, crewRadio, "crew-radio");
    flashlight(logDesk, 0.05, 0.75, 0.14, { ry: 1.2 });
    const supervisor = standingFigure(g, 2.35, 2.1, { ry: -2.4, cloth: 0x3d4a5a, trousers: 0x23282f });
    void supervisor;
    hccPlacard(g, 0.7, 1.55, -2.44, 0, ["Never mix cleaning products", "Read the SDS before a new product", "Label every bottle"]);

    let dispenserOn = false, fill = 0;
    return {
      hits,
      footprint: 2.4,
      spawnLook: new THREE.Vector3(-0.2, 1.1, -1.2),
      onStepComplete(step) {
        if (step.id === "dilution-dial") { dialPointer.parent.rotation.z = -Math.PI; dispenserOn = true; }
        if (step.id === "fill-bottle") { fill = 1; fillLevel.scale.y = 8; fillLevel.position.y = 0.9; }
        if (step.id === "label-bottle") label.visible = true;
        if (step.id === "cart-load") { linenLow.visible = true; linenLowHit.material.opacity = 0.001; caddyHit.material.opacity = 0.001; topHit.material.opacity = 0.001; }
        if (step.id === "caddy-audit") { noLabel.material = mat(0xe2c14a, { rough: 0.35 }); bleachSmall.position.x = -0.5; splitGlove.visible = false; }
        if (step.id === "push-cart") cart.position.set(1.9, 0, -0.1);
        if (step.id === "spray-cloth") sprayBottle.position.set(0.1, 0.86, 0.05);
      },
      onInterrupt(it) {
        if (it.id === "coworker-mixing") { pourJug.visible = true; pourJug.rotation.z = -1.1; coworker.rotation.y = -3.4; }
        if (it.id === "leak-at-lift") { puddle.visible = true; }
      },
      onInterruptEnd(it) {
        if (it.id === "coworker-mixing") {
          if (it.resolved === "answered") { pourJug.rotation.z = 0; pourJug.position.set(-2.4, 0.95, -1.6); coworker.rotation.y = -2.6; }
          else pourJug.material = mat(0xbde58f, { rough: 0.4 });
        }
        if (it.id === "leak-at-lift" && it.resolved === "answered") { absorb.visible = true; wetSign.visible = true; puddle.scale.setScalar(0.5); }
      },
      animate(t, dt, session) {
        const gg = session?.gauge;
        if (gg && !gg.committed && session.step?.id === "cart-weight") {
          repaint(scaleScreen, signFace(`${Math.round(gg.t * 120)}% plate`, { bg: "#0d1c18", accent: gg.t >= 0.46 && gg.t <= 0.66 ? "#59c97b" : "#f2ae14", fg: "#dff3ec", scale: 0.5 }));
        }
        if (session?.step?.id === "fill-bottle" && session.holding && dispenserOn) {
          fill = Math.min(1, fill + dt / 6);
          fillLevel.scale.y = 1 + fill * 7; fillLevel.position.y = 0.84 + fill * 0.06;
        }
        if (session?.step?.id === "push-cart" && session.holding) {
          cart.position.x = Math.min(1.9, cart.position.x + dt * 0.2);
          cart.position.z = Math.min(-0.1, cart.position.z + dt * 0.06);
        }
        if (puddle.visible && !absorb.visible) puddle.scale.setScalar(1 + Math.sin(t * 1.5) * 0.04);
      },
    };
  },
};
