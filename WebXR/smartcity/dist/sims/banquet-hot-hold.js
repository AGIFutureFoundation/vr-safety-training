import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, ball, torus, slab, group, decal, repaint, signFace, paperFace, particles, mat,
} from "../../../shared/kit.js";
import {
  CITY, stationPad, holoPanel, holoTag, toolChest, instrument, standingFigure, reg,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Banquet Hot Hold VR — its own gamified system: Service Standard.
// A banquet's hot line, from the hot box to the pull-down. The whole procedure
// is one argument: temperature and time are not opinions, they are the two
// controls the Food Code actually recognises, and a banquet room a hundred
// covers deep loses that argument fast if anybody stops checking either one.

const BHH_ACCENT = 0xe0972e;

export const SIM_BANQUET_HOT_HOLD = {
  id: "banquet-hot-hold",
  index: "113",
  domain: "Culinary & Hospitality",
  trade: "Banquet cook",
  category: "Culinary & Hospitality",
  indoor: "kitchen",
  certification: "UNITE HERE Local 2 banquet and culinary staff; the California Retail Food Code (the FDA Food Code as adopted) on hot holding at 135°F or above and Time as a Public Health Control; the ANSI-accredited California Food Handler card and ServSafe Manager certification; NSF/ANSI 4 commercial cooking and hot-holding equipment; OSHA 29 CFR 1910.157 portable fire extinguishers for the open flame at every chafer; Cal/OSHA's general industry safety orders",
  name: "Banquet Hot Hold",
  title: simTitle("Banquet Hot Hold"),
  tagline: "Banquet hot line: hot boxes probed, chafers lit lid-open, the buffet walked, time tags honoured, and the pull-down done to the rule",
  accent: BHH_ACCENT,
  accentCss: "#e0972e",
  parSeconds: 260,
  footprint: 2.6,
  badge: { id: "service-standard", name: "Service Standard", note: "Every pan probed, every chafer lit correctly, and a clean pull-down" },

  game: system({
    name: "Service Standard",
    currency: "COVERS",
    ranks: ["Banquet Runner", "Line Cook", "Chef de Partie", "Banquet Captain", "Service Standard Certified"],
    badges: [
      { id: "hundred-thirty-five", name: "135 or Above", note: "Never sent out a pan under temperature", test: AWARD.safe },
      { id: "clean-line-service", name: "Clean Service", note: "No corrections across the whole line", test: AWARD.clean },
      { id: "quarter-hour", name: "On the Quarter Hour", note: "The 2-hour recheck held for the full count", test: AWARD.unbroken },
    ],
    challenges: [
      { id: "on-time-service", name: "On Time", note: "Line open inside 80% of par", test: AWARD.fast(0.8) },
      { id: "no-second-pass", name: "No Second Pass", note: "Buffet walk clean on the first pass", test: AWARD.stepClean("buffet-walk") },
      { id: "eight-straight", name: "Eight Straight", note: "Eight correct actions in a row", test: AWARD.streak(8) },
    ],
  }),

  hazards: {
    "lid-closed-light": "That chafer's lid is still down and somebody left a lighter next to it. Lighting fuel under a closed lid traps the vapour it gives off while it catches, and the flare when the lid finally comes up reaches whoever is standing in front of it — the fuel is always lit with the lid open.",
    "bare-hand-scoop": "A bare hand in a hot chafer pan is a burn risk on a food already at serving temperature and a contamination risk on food nobody is cooking again — tongs and the plating spoon are on the rest six inches away for exactly this reach.",
    "expired-time-tag": "That tag's discard time passed eleven minutes ago and the pan is still on the buffet. Time as a Public Health Control only works if the tag is honoured — a pan held on time past its own deadline is being held on nothing.",
    "hotbox-door-propped": "That hot box door has been wedged open. A hot-holding cabinet loses its air temperature in minutes with the door open, and every pan inside starts falling through the danger zone together instead of one at a time on the line where you can see it happening.",
  },

  lateNotes: {
    "buffet-pan-probe": "Not yet — this pan gets probed once it is on the buffet and again on the two-hour clock, not before.",
    "time-tag-rack": "The time tag goes on once the item is actually out for service, not before it leaves the kitchen.",
  },

  steps: [
    {
      id: "event-order", kind: "select", target: "event-board",
      title: "Read the event order",
      cue: "Check the guest count, the menu, plated or buffet service, and the room's timeline.",
      why: "The event order sets everything downstream: how many hot boxes you load, how long the buffet has to hold before the room is cleared, and whether tonight is a plated service with a cart call or a buffet with a two-hour recheck clock. Walking onto a banquet line without reading it first means guessing at numbers a banquet captain already wrote down for you.",
    },
    {
      id: "preheat", kind: "turn", target: "hotbox-dial",
      title: "Preheat the hot box",
      cue: "Turn the hot box thermostat up to operating temperature before anything goes in it.",
      why: "A hot box holds food at temperature, it does not bring cold food up to it, and loading pans into a cabinet that has not come up to heat starts every one of them in the danger zone at once. Preheating first means the cabinet is doing its job the moment the first pan lands on the rack instead of racing to catch up with forty covers already inside it.",
      turn: { turns: 0.9, axis: "z", label: "HOT BOX THERMOSTAT" },
    },
    {
      id: "hotbox-check", kind: "gauge", target: "hotbox-probe-port",
      title: "Confirm the hot box is holding",
      cue: "Probe the empty cabinet's air temperature through the port and commit once it is holding in range.",
      why: "The dial tells you where the thermostat is set, not what the cabinet is actually doing — a door seal going soft or a fan motor dying shows up as a hot box that runs cooler than its own dial claims. The probe through the port is the only number in this room that checks the machine rather than trusting it.",
      gauge: { label: "HOT BOX — AIR TEMP", speed: 0.65, green: [0.58, 0.78], readout: (t) => `${Math.round(120 + t * 60)} °F`, missNote: "Not holding high enough yet — give the cabinet more time or check the door seal before loading pans into it." },
    },
    {
      id: "load-pans", kind: "drag", target: "prep-pan",
      title: "Load the hot box",
      cue: "Carry the finished pan from the prep table into the preheated hot box.",
      why: "Product goes from the range or the oven straight into a cabinet that is already holding temperature — parked on a cart in the hallway on the way there is time in the danger zone that never gets logged and never gets back. The hot box is the only stop this pan makes before the buffet.",
      drag: { to: "hotbox-interior", radius: 0.55, missNote: "Not in the cabinet — set the pan on the rack inside the hot box, not on the cart beside it." },
    },
    {
      id: "probe-outbound", kind: "gauge", target: "buffet-pan-probe",
      title: "Probe the pan before it goes out",
      cue: "Probe the pan on the buffet and commit only once it reads 135°F or above.",
      why: "Every pan gets probed on its way to the guest, not on its way out of the kitchen — travel time, an elevator ride, a service door propped open, all cost temperature between the two. 135°F is the Food Code's hot-holding floor, and the only pan that has actually met it is the one you probed where the guest is about to be served from.",
      gauge: { label: "BUFFET PAN — INTERNAL TEMP", speed: 0.6, green: [0.7, 0.92], readout: (t) => `${Math.round(120 + t * 40)} °F`, missNote: "Under 135°F. That pan goes back for reheat to 165°F or it does not go on the buffet at all." },
    },
    {
      id: "chafer-setup", kind: "sequence",
      targets: ["chafer-lid-open", "chafer-fuel-light"],
      itemNames: { "chafer-lid-open": "chafer lid, opened", "chafer-fuel-light": "fuel can, lit" },
      title: "Light the chafer lid open",
      cue: "Open the chafer's lid first, then light the fuel can underneath it.",
      why: "Fuel gel gives off vapour the second the lid comes off the can, and lighting it under a closed chafer lid traps that vapour until somebody lifts the lid — the flare that follows goes straight up into whoever's hands are on it. Open first, light second, every chafer, every time.",
      outOfOrderNote: "Wrong order — the lid comes up before the match does. Lighting fuel under a closed lid is what puts a flare in the server's face the moment the lid opens.",
    },
    {
      id: "flame-check", kind: "track", target: "fuel-regulator", seconds: 7,
      title: "Set the flame regulator",
      cue: "Hold the fuel can's fold-cap regulator in the band that keeps the flame steady, not smothered and not flaring.",
      why: "Chafing fuel's fold-cap is the only control you have over how hard it burns once it is lit: folded too far closed and the pan runs cold before the entrée does; open too wide and the flame reaches high enough to catch a sleeve or a napkin passed too close over it. The band in the middle is the one that holds 135°F without becoming the thing a guest points at.",
      track: {
        start: 0.15, green: [0.4, 0.62], rise: 0.45, fall: 0.4, drift: 0.1, label: "FUEL REGULATOR",
        readout: (v) => (v < 0.4 ? "smothered — pan losing heat" : v > 0.62 ? "wide open — flame too high" : "steady"),
      },
      holdBreakNote: "Regulator out of band — a starved flame lets the pan drop out of hold and a wide-open one puts fire where a server's sleeve passes over it. Bring it back to steady.",
    },
    {
      id: "buffet-walk", kind: "find", noHint: true,
      targets: ["sneeze-guard-gap", "utensil-in-food", "short-handle-utensil"],
      itemNames: {
        "sneeze-guard-gap": "the gap in the sneeze guard",
        "utensil-in-food": "the serving spoon left standing in the pan",
        "short-handle-utensil": "the short-handled ladle at the sauce",
      },
      itemNotes: {
        "sneeze-guard-gap": "A panel has slid off its bracket. The guard only protects the food where it actually spans the pan — a gap is an open buffet with a sign over it.",
        "utensil-in-food": "A utensil left standing in the pan puts a hand back into hot food every time it is used, and it means the handle a guest touches next has been sitting in the pan, not on a rest.",
        "short-handle-utensil": "That handle is too short to keep fingers clear of the sauce. The Food Code calls for a handle long enough that the hand serving never has to reach into the food to use it.",
      },
      decoyNotes: {
        "clean-chafer-rest": "That chafer's utensil is on its rest, handle clear of the pan. Leave it.",
      },
      title: "Walk the buffet before doors open",
      cue: "Three things on this buffet are not right. Find them before the first guest comes through.",
      why: "The buffet is checked with your own eyes and a hand on the guard before service, because a gap or a mis-rested utensil found mid-service means every guest ahead of that moment was served past it. This is the last look you get at the line the way the room is about to see it.",
    },
    {
      id: "time-tag", kind: "drag", target: "time-tag-rack",
      title: "Time-tag the dinner rolls",
      cue: "Write the discard time and attach the tag to the bread basket held on time, not temperature.",
      why: "Bread is not hot-held and it is not refrigerated on the buffet — it is controlled under Time as a Public Health Control, which the Food Code allows only when the item is marked with the time it has to be discarded by. No tag on the basket means nobody downstream of you knows it is even under time control at all.",
      drag: { to: "tphc-item", radius: 0.5, missNote: "Not on the basket. A discard time that isn't physically attached to the item it governs is a rule nobody serving from this buffet can see." },
    },
    {
      id: "recheck", kind: "hold", target: "buffet-pan-probe", seconds: 7,
      title: "Hold the two-hour recheck",
      cue: "Probe the buffet pan again at the two-hour mark and hold for the full reading.",
      why: "A pan that was 145°F when the doors opened can be under 135°F two hours later with nothing about it looking different from across the room — the steam is the same, the pan looks the same, and the only thing that has changed is the one thing you cannot see. The recheck is what catches a pan drifting out of hold before a guest does.",
      holdBreakNote: "You pulled the probe before the reading settled. A quick touch on a pan this close to the line gives you a guess, not the number the recheck exists to produce.",
    },
    {
      id: "plate-cover", kind: "select", target: "plate-dome",
      title: "Cover the plated meals",
      cue: "Take a dome from the stack and cover every plate on the cart.",
      why: "A plated course loses heat the moment it leaves the kitchen, and the dome is the only thing slowing that down between the pass and the table. An uncovered plate on a cart crossing a ballroom floor arrives at the guest's seat colder than the kitchen ever sent it out.",
    },
    {
      id: "cart-corners", kind: "sequence",
      targets: ["corner-front", "corner-left", "corner-right"],
      itemNames: { "corner-front": "front corner", "corner-left": "left corner", "corner-right": "right corner" },
      title: "Call the corners on the cart",
      cue: "Push the cart through the service door calling front, then left, then right as each corner clears.",
      why: "A loaded banquet cart is wider than the person pushing it and blind past the first row of domes, and the call is for whoever is on the other side of that door as much as for you — front first because that is the corner about to meet a doorway, left and right as the cart swings clear of the frame behind it.",
      outOfOrderNote: "Call the corners in the order the cart actually reaches them — front, then the sides as it clears the doorway. Calling them out of order warns somebody about a corner that isn't the one about to hit them.",
    },
    {
      id: "pulldown", kind: "select", target: "ice-bath",
      title: "Cool the pull-down in a shallow ice bath",
      cue: "Move the leftover pan into a shallow container set in the ice bath rather than a deep one on the shelf.",
      why: "A deep pan of hot food cools from the outside in and can sit in the danger zone for hours at its centre; a shallow pan in an ice bath brings the whole depth of the food down together. The Food Code's cooling window exists because a stockpot left to cool on a shelf overnight is a textbook case, not a hypothetical one.",
    },
    {
      id: "discard-log", kind: "select", target: "discard-log-board",
      title: "Close out the pull-down log",
      cue: "Record what was cooled, what was discarded on its time tag, and sign the log closed.",
      why: "The log is what turns tonight's pull-down into something the next shift can trust rather than something they have to guess at — what got a second life in tomorrow's prep, what hit its discard time and went in the bin, and whose signature is on that decision if anybody ever has to ask.",
    },
  ],

  // Two things that land on a working buffet while a cook's attention is on
  // the pan in front of them. See shared/game.js.
  interrupts: [
    {
      id: "pan-cold",
      kind: "Temperature drift",
      after: "buffet-walk", delay: 4, seconds: 12,
      alert: "A server flags the end pan on the buffet — it's reading 120°F on their own probe, well under hold.",
      cue: "That pan does not sit there while you finish something else.",
      target: "cold-pan",
      why: "A pan under 135°F is no longer hot-held, it is cooling on a counter with a lid on it, and every minute it stays on the buffet is a minute more in the range foodborne illness gets its start. It goes back for reheat to 165°F or it goes in the bin — there is no third option that leaves it on the line.",
      missNote: "The pan sat there through the next course. A guest served from a 120°F pan has no way of knowing it fell out of hold, which is exactly why the check is the cook's job and not theirs.",
      wrongNote: "It is the pan the server is standing next to. Pull it now — reheat to 165°F or discard, nothing on this buffet stays at 120°F.",
    },
    {
      id: "runner-refuel",
      kind: "Fuel refill",
      after: "flame-check", delay: 3, seconds: 11,
      alert: "A runner has grabbed a fresh can of chafing fuel and is about to unscrew a lit chafer's spent can to swap it.",
      cue: "That can is still burning. Stop them before the cap comes off.",
      target: "chafer-fuel-can",
      why: "Chafing fuel is never refilled or swapped while it is lit — pouring or handling gel fuel next to an open flame is how a runner's hand and the tablecloth both catch at once. The can burns out and cools before anybody touches it, on a schedule set by the fuel, not by how many pans are waiting.",
      missNote: "The runner cracked the cap on a can that was still lit. Gel fuel vapour ignites off the flame it is sitting next to, and what should have been a routine swap becomes a fire on a table full of guests.",
      wrongNote: "It is the runner reaching for the lit can. Stop the swap — a spent can burns out and cools on its own before it gets touched.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.6, BHH_ACCENT);

    // Anti-fatigue matting under the pass, the way a banquet line actually stands.
    slab(g, 2.2, 0.02, 1.0, -0.2, 0.012, 1.5, 0x1c2024, { radius: 0.04, rough: 0.95, cast: false });
    for (let i = 0; i < 6; i++) for (let j = 0; j < 2; j++) {
      box(g, 0.09, 0.006, 0.09, -1.15 + i * 0.34, 0.024, 1.28 + j * 0.34, 0x101316, { cast: false, receive: false });
    }

    // ------------------------------------------------------------- event board
    const eventBoard = holoPanel(g, 0.58, 0.4, -2.7, 1.5, -1.4, (ctx, w, h) => {
      ctx.fillStyle = "rgba(18,10,2,0.9)"; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#e0972e"; ctx.fillRect(0, 0, w, 5);
      ctx.fillStyle = "#e9c48a";
      ctx.font = `600 ${Math.round(h * 0.09)}px 'Barlow Condensed', Arial, sans-serif`;
      ctx.textAlign = "left"; ctx.textBaseline = "middle";
      ctx.fillText("EVENT ORDER · GRAND BALLROOM", w * 0.06, h * 0.14);
      ctx.fillStyle = "#fbf1e0";
      ctx.font = `600 ${Math.round(h * 0.13)}px 'Barlow Condensed', Arial, sans-serif`;
      ctx.fillText("180 COVERS · BUFFET SERVICE", w * 0.06, h * 0.33);
      ctx.font = `${Math.round(h * 0.08)}px Arial, sans-serif`;
      ctx.fillStyle = "#d6b686";
      ["Menu: carved entrée, two sides, rolls", "Doors: 7:00 pm — hold two hours",
       "Recheck buffet every 2 hours", "Pull-down at 9:00 pm"].forEach((line, i) => ctx.fillText(line, w * 0.06, h * (0.5 + i * 0.12)));
    }, { ry: 0.55, accent: BHH_ACCENT });
    reg(hits, eventBoard, "event-board");

    // ------------------------------------------------------------- prep table
    const prep = group(g, -2.4, 0, 0.4, 0.3);
    box(prep, 1.1, 0.86, 0.62, 0, 0.43, 0, CITY.darkSteel, { rough: 0.4, metal: 0.7 });
    slab(prep, 1.14, 0.05, 0.66, 0, 0.88, 0, 0xb4bcc3, { radius: 0.02, rough: 0.32, metal: 0.75 });
    const prepPan = group(prep, 0, 0.94, 0);
    box(prepPan, 0.42, 0.09, 0.3, 0, 0, 0, 0x8b929a, { rough: 0.35, metal: 0.8 });
    const prepFood = slab(prepPan, 0.36, 0.06, 0.24, 0, 0.075, 0, 0xb5723c, { radius: 0.03, rough: 0.7 });
    holoTag(prep, "Finished pan", 0, 1.15, 0, { css: "#e0972e", w: 0.32 });
    reg(hits, prepPan, "prep-pan");

    // ------------------------------------------------------------- hot box
    const hotbox = group(g, -1.7, 0, -1.0, -0.4);
    box(hotbox, 0.78, 1.5, 0.66, 0, 0.85, 0, 0xdfe4e8, { rough: 0.45, metal: 0.3 });
    box(hotbox, 0.82, 0.06, 0.7, 0, 1.63, 0, 0xc4cbd1, { rough: 0.4 });
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
      cyl(hotbox, 0.035, 0.035, 0.07, sx * 0.32, 0.035, sz * 0.26, 0x22262b, { rough: 0.7, seg: 10 });
    }
    const hbDoor = group(hotbox, 0.4, 0.85, 0);
    box(hbDoor, 0.02, 1.35, 0.6, 0, 0, 0, 0xc9d0d6, { rough: 0.4, metal: 0.4 });
    box(hbDoor, 0.03, 0.1, 0.02, 0, 0, 0.28, 0x8b929a, { rough: 0.5, metal: 0.6 });
    const hbShelf1 = group(hotbox, 0, 0.55, 0);
    const hbShelf2 = group(hotbox, 0, 1.0, 0);
    for (const sh of [hbShelf1, hbShelf2]) box(sh, 0.7, 0.02, 0.58, 0, 0, 0, 0x9aa1a8, { rough: 0.4, metal: 0.6, cast: false });
    const hotboxPans = [];
    for (const sh of [hbShelf1, hbShelf2]) {
      const p = box(sh, 0.5, 0.1, 0.36, 0, 0.06, 0, 0xa8b0b8, { rough: 0.35, metal: 0.75 });
      p.visible = false;
      hotboxPans.push(p);
    }
    const hbDial = group(hotbox, -0.4, 1.15, 0.31);
    cyl(hbDial, 0.05, 0.05, 0.03, 0, 0, 0, 0x22262b, { rough: 0.5, seg: 16 }).rotation.x = Math.PI / 2;
    const dialPointer = box(hbDial, 0.008, 0.032, 0.006, 0, 0.02, 0.017, 0xe0972e, { emissive: 0xe0972e, ei: 1.2, rough: 0.4 });
    holoTag(hotbox, "Thermostat", -0.4, 1.35, 0.31, { css: "#e0972e", w: 0.28 });
    reg(hits, hbDial, "hotbox-dial");
    const hbPort = instrument(hotbox, 0.35, 1.15, 0.32, { idle: "--- °F", color: 0xe0972e, w: 0.11, d: 0.17, ry: 0 });
    holoTag(hotbox, "Probe port", 0.35, 1.35, 0.32, { css: "#e0972e", w: 0.26 });
    reg(hits, hbPort, "hotbox-probe-port");
    const hbInterior = box(hotbox, 0.02, 0.02, 0.02, 0, 0.8, 0, 0xffffff, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, hbInterior, "hotbox-interior");
    const propDoorPad = box(hotbox, 0.14, 0.03, 0.05, 0.4, 0.2, 0.3, 0x7b6a3a, { rough: 0.75 });
    holoTag(hotbox, "wedge — door propped", 0.4, 0.36, 0.3, { css: "#f0645b", w: 0.42 });
    reg(hits, propDoorPad, "hotbox-door-propped");

    // ------------------------------------------------------------- buffet line
    const buffet = group(g, 0, 0, -2.2);
    box(buffet, 3.4, 0.85, 0.6, 0, 0.425, 0, 0xc9d0d6, { rough: 0.4, metal: 0.3 });
    slab(buffet, 3.44, 0.05, 0.64, 0, 0.87, 0, 0xdfe4e8, { radius: 0.02, rough: 0.3, metal: 0.6 });
    // Sneeze guard, with one panel slid off its bracket.
    const guardFrame = group(buffet, 0, 0.9, 0.2);
    for (const gx of [-1.5, -0.5, 1.5]) {
      box(guardFrame, 0.9, 0.5, 0.006, gx, 0.4, 0, 0xdfe4e8, { rough: 0.2, opacity: 0.35, transparent: true, cast: false });
    }
    const gap = box(guardFrame, 0.9, 0.5, 0.006, 0.5, 0.55, 0.12, 0xdfe4e8, { rough: 0.2, opacity: 0.35, transparent: true, cast: false });
    gap.rotation.x = 0.5;
    for (const gx of [-1.5, -0.5, 0.5, 1.5]) cyl(guardFrame, 0.01, 0.01, 0.7, gx, 0.05, 0, CITY.steel, { rough: 0.3, metal: 0.8, seg: 8 });
    holoTag(buffet, "Sneeze guard — gap", 0.5, 1.28, 0.12, { css: "#f0645b", w: 0.4 });
    reg(hits, gap, "sneeze-guard-gap");

    function chafer(x, opts = {}) {
      const c = group(buffet, x, 0.9, 0);
      box(c, 0.62, 0.16, 0.4, 0, 0, 0, 0xc9d0d6, { rough: 0.35, metal: 0.7 });
      const waterPan = box(c, 0.56, 0.06, 0.34, 0, 0.11, 0, 0xdfe4e8, { rough: 0.3, metal: 0.6 });
      const foodPan = slab(c, 0.48, 0.05, 0.26, 0, 0.16, 0, opts.food ?? 0xb5723c, { radius: 0.02, rough: 0.65 });
      const steam = particles(c, 26, 0xe4ecf2, { size: 0.045, life: 1.0, additive: false, opacity: 0.22 });
      const lid = group(c, 0, 0.19, -0.2);
      const lidPanel = box(lid, 0.5, 0.02, 0.3, 0, 0, 0.15, 0xc9d0d6, { rough: 0.3, metal: 0.7 });
      const fuelHolder = group(c, -0.18, -0.08, 0.1);
      const fuelCan = cyl(fuelHolder, 0.05, 0.05, 0.06, 0, 0, 0, 0x8b929a, { rough: 0.4, metal: 0.5, seg: 14 });
      const flame = cyl(fuelHolder, 0.012, 0.03, 0.05, 0, 0.06, 0, 0x4aa3ff, { emissive: 0x2f7fff, ei: 2.2, rough: 0.4, opacity: 0.75, seg: 12, cast: false });
      flame.visible = false;
      return { c, lid, lidPanel, fuelCan, flame, foodPan, steam, waterPan };
    }

    const chaferLeft = chafer(-1.0, { food: 0x8a6a3c });
    const utensilOk = cyl(chaferLeft.c, 0.012, 0.012, 0.3, 0.24, 0.24, 0, 0xdfe4e8, { rough: 0.3, metal: 0.7, seg: 8 });
    utensilOk.rotation.z = 1.1;
    reg(hits, utensilOk, "clean-chafer-rest");

    const chaferMid = chafer(0, { food: 0xb5723c });
    reg(hits, chaferMid.lid, "chafer-lid-open");
    reg(hits, chaferMid.fuelCan, "chafer-fuel-light");
    const regTab = box(chaferMid.fuelCan, 0.03, 0.006, 0.05, 0, 0.03, 0.04, 0xdfe4e8, { rough: 0.4, metal: 0.6 });
    holoTag(chaferMid.c, "Fuel regulator", 0.18, 0.32, 0.1, { css: "#e0972e", w: 0.3 });
    reg(hits, regTab, "fuel-regulator");
    reg(hits, chaferMid.fuelCan, "chafer-fuel-can");
    // Buffet pan probe, in the middle pan.
    const buffetProbe = instrument(chaferMid.c, 0.3, 0.24, 0.14, { idle: "--- °F", color: 0xe0972e, w: 0.1, d: 0.14 });
    reg(hits, buffetProbe, "buffet-pan-probe");
    // Serving spoon left standing in the food, and the bare-hand trap beside it.
    const spoonInFood = cyl(chaferMid.c, 0.012, 0.012, 0.22, -0.12, 0.24, 0, 0xdfe4e8, { rough: 0.3, metal: 0.7, seg: 8 });
    spoonInFood.rotation.z = 0.3;
    holoTag(chaferMid.c, "Spoon left in the pan", -0.12, 0.42, 0, { css: "#f0645b", w: 0.4 });
    reg(hits, spoonInFood, "utensil-in-food");
    const bareHand = ball(chaferMid.c, 0.03, 0.16, 0.22, 0.06, 0xd9a985, { rough: 0.75 });
    holoTag(chaferMid.c, "bare hand — no tongs", 0.16, 0.4, 0.06, { css: "#f0645b", w: 0.44 });
    reg(hits, bareHand, "bare-hand-scoop");
    // Lit chafer trap: lid still down, lighter sitting beside it.
    chaferMid.lidPanel.visible = true;

    const chaferRight = chafer(1.0, { food: 0x9a7448 });
    const shortLadle = cyl(chaferRight.c, 0.014, 0.014, 0.1, 0.2, 0.22, 0, 0xdfe4e8, { rough: 0.3, metal: 0.7, seg: 8 });
    shortLadle.rotation.z = 0.6;
    holoTag(chaferRight.c, "Short-handled ladle", 0.2, 0.34, 0, { css: "#f0645b", w: 0.4 });
    reg(hits, shortLadle, "short-handle-utensil");
    const lighter = box(chaferRight.c, 0.05, 0.02, 0.014, -0.22, 0.24, 0.1, 0x2b2f34, { rough: 0.5 });
    holoTag(chaferRight.c, "lighter — lid still down", -0.22, 0.36, 0.1, { css: "#f0645b", w: 0.5 });
    reg(hits, lighter, "lid-closed-light");
    reg(hits, chaferRight.lidPanel, "lid-closed-light");

    // Cold pan trap for the interrupt — a separate pan already reading low.
    const coldPanGroup = group(buffet, -1.6, 0.94, -0.24);
    const coldPan = box(coldPanGroup, 0.3, 0.05, 0.22, 0, 0, 0, 0x9a8462, { rough: 0.6 });
    const coldReadout = instrument(coldPanGroup, 0, 0.18, 0, { idle: "120 °F", color: 0xf0645b, w: 0.1, d: 0.14 });
    holoTag(coldPanGroup, "cold end pan", 0, 0.3, 0, { css: "#f0645b", w: 0.32 });
    reg(hits, coldPanGroup, "cold-pan");
    void coldPan; void coldReadout;

    // ------------------------------------------------------------- time-tag rack + rolls
    const tagRack = group(g, 1.9, 0, -1.4, -0.3);
    box(tagRack, 0.4, 0.5, 0.06, 0, 0.25, 0, 0xb8402f, { rough: 0.5 });
    for (let i = 0; i < 3; i++) {
      decal(tagRack, 0.12, 0.16, -0.12 + i * 0.12, 0.42, 0.035,
        paperFace("TIME TAG", ["Discard by:", "____"], { bg: "#f4e9d8" }));
    }
    holoTag(tagRack, "Time tags", 0, 0.55, 0.04, { css: "#e0972e", w: 0.28 });
    reg(hits, tagRack, "time-tag-rack");
    const rollBasket = group(g, 2.4, 0, -1.7, -0.3);
    cyl(rollBasket, 0.2, 0.16, 0.18, 0, 0.85, 0, 0xa9814f, { rough: 0.85, seg: 16 });
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      ball(rollBasket, 0.055, Math.cos(a) * 0.09, 0.98, Math.sin(a) * 0.09, 0xd8b06c, { rough: 0.8, seg: 10 });
    }
    holoTag(rollBasket, "Dinner rolls — TPHC", 0, 1.15, 0, { css: "#e0972e", w: 0.4 });
    reg(hits, rollBasket, "tphc-item");
    const oldTag = decal(rollBasket, 0.13, 0.17, 0.24, 0.9, 0, paperFace("EXPIRED", ["Discard by:", "6:42 PM"], { bg: "#f4d8d8", band: "#b81410" }));
    holoTag(rollBasket, "expired tag — still out", 0.24, 1.1, 0, { css: "#f0645b", w: 0.4 });
    reg(hits, oldTag, "expired-time-tag");

    // ------------------------------------------------------------- banquet cart
    const cart = group(g, 2.6, 0, 1.1, -0.35);
    box(cart, 0.9, 0.05, 1.4, 0, 0.75, 0, 0x8b929a, { rough: 0.4, metal: 0.6 });
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
      cyl(cart, 0.035, 0.035, 0.06, sx * 0.4, 0.03, sz * 0.62, 0x22262b, { rough: 0.7, seg: 10 });
      cyl(cart, 0.012, 0.012, 0.72, sx * 0.4, 0.4, sz * 0.62, CITY.darkSteel, { rough: 0.5, metal: 0.6, seg: 8 });
    }
    const domeStack = group(g, 2.15, 0, 1.6, -0.35);
    box(domeStack, 0.24, 0.4, 0.24, 0, 0.2, 0, 0x2b3138, { rough: 0.6 });
    for (let i = 0; i < 3; i++) {
      const dm = torus(domeStack, 0.1, 0.014, 0, 0.42 + i * 0.05, 0, 0xdfe4e8, { rough: 0.25, metal: 0.5, seg: 8, seg2: 16 });
      dm.rotation.x = Math.PI / 2;
    }
    holoTag(domeStack, "Plate domes", 0, 0.66, 0, { css: "#e0972e", w: 0.28 });
    reg(hits, domeStack, "plate-dome");
    const plates = [];
    const domes = [];
    for (let i = 0; i < 4; i++) {
      const px = -0.3 + (i % 2) * 0.6, pz = -0.4 + Math.floor(i / 2) * 0.8;
      const plate = cyl(cart, 0.13, 0.13, 0.015, px, 0.79, pz, 0xf0f4f6, { rough: 0.3, seg: 20 });
      const food = slab(cart, 0.16, 0.02, 0.1, px, 0.8, pz, 0xb5723c, { radius: 0.02, rough: 0.7 });
      const dome = torus(cart, 0.13, 0.014, px, 0.83, pz, 0xdfe4e8, { rough: 0.25, metal: 0.4, seg: 8, seg2: 16, opacity: 0.001, transparent: true });
      dome.rotation.x = Math.PI / 2;
      plates.push({ plate, food }); domes.push(dome);
    }
    // Corner markers around the cart's swing path.
    const cornerFront = box(g, 0.3, 0.006, 0.3, 3.1, 0.006, 1.1, 0xe0972e, { emissive: 0xe0972e, ei: 1.0, rough: 0.5, cast: false });
    const cornerLeft = box(g, 0.3, 0.006, 0.3, 2.6, 0.006, 1.75, 0xe0972e, { emissive: 0xe0972e, ei: 1.0, rough: 0.5, cast: false });
    const cornerRight = box(g, 0.3, 0.006, 0.3, 3.1, 0.006, 1.75, 0xe0972e, { emissive: 0xe0972e, ei: 1.0, rough: 0.5, cast: false });
    holoTag(g, "front", 3.1, 0.2, 1.1, { css: "#e0972e", w: 0.2 });
    holoTag(g, "left", 2.6, 0.2, 1.75, { css: "#e0972e", w: 0.18 });
    holoTag(g, "right", 3.1, 0.2, 1.75, { css: "#e0972e", w: 0.2 });
    reg(hits, cornerFront, "corner-front");
    reg(hits, cornerLeft, "corner-left");
    reg(hits, cornerRight, "corner-right");

    // ------------------------------------------------------------- ice bath & log
    const iceBath = group(g, -2.6, 0, 2.0, 0.4);
    box(iceBath, 0.6, 0.28, 0.5, 0, 0.14, 0, 0x8b929a, { rough: 0.35, metal: 0.6 });
    for (let i = 0; i < 14; i++) {
      ball(iceBath, 0.035 + Math.random() * 0.02, (Math.random() - 0.5) * 0.5, 0.24 + Math.random() * 0.03, (Math.random() - 0.5) * 0.4,
        0xdff2f8, { rough: 0.2, opacity: 0.75, seg: 8 });
    }
    const shallowPan = box(iceBath, 0.34, 0.06, 0.24, 0, 0.3, 0, 0xa8b0b8, { rough: 0.35, metal: 0.7 });
    holoTag(iceBath, "Ice bath — shallow pan", 0, 0.5, 0, { css: "#e0972e", w: 0.42 });
    reg(hits, iceBath, "ice-bath");
    void shallowPan;

    const logBoard = holoPanel(g, 0.5, 0.34, -2.9, 1.4, 1.6, (ctx, w, h) => {
      ctx.fillStyle = "rgba(18,10,2,0.9)"; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#e0972e"; ctx.fillRect(0, 0, w, 5);
      ctx.fillStyle = "#fbf1e0";
      ctx.font = `600 ${Math.round(h * 0.16)}px 'Barlow Condensed', Arial, sans-serif`;
      ctx.textAlign = "center"; ctx.textBaseline = "middle";
      ctx.fillText("PULL-DOWN LOG", w / 2, h * 0.32);
      ctx.font = `${Math.round(h * 0.1)}px Arial, sans-serif`;
      ctx.fillStyle = "#d6b686";
      ctx.fillText("Cooled, discarded, signed", w / 2, h * 0.6);
      ctx.fillText("closed by shift lead", w / 2, h * 0.76);
    }, { ry: 0.6, accent: BHH_ACCENT });
    reg(hits, logBoard, "discard-log-board");

    // Crew: a second banquet cook on the pass, clear of every control.
    const crew = standingFigure(g, -0.6, 1.7, { ry: 3.0, cloth: 0xf2f2f2, trousers: 0x2b3138, skin: 0xc99878 });

    let hotboxOn = false;
    let fuelLit = false;

    return {
      hits,
      footprint: 2.6,

      onStepComplete(step) {
        if (step.id === "preheat") { hotboxOn = true; dialPointer.rotation.z = -1.1; }
        if (step.id === "load-pans") { hotboxPans[0].visible = true; prepPan.visible = false; }
        if (step.id === "probe-outbound") repaint(buffetProbe.userData.screen, signFace("138°F", { bg: "#1c3320", accent: "#59c97b", fg: "#eafbf1", scale: 0.55 }));
        if (step.id === "chafer-setup") {
          chaferMid.lidPanel.rotation.x = -1.3;
          chaferMid.lidPanel.position.set(0, 0.05, -0.35);
          chaferMid.flame.visible = true;
          fuelLit = true;
        }
        if (step.id === "recheck") repaint(buffetProbe.userData.screen, signFace("136°F", { bg: "#1c3320", accent: "#59c97b", fg: "#eafbf1", scale: 0.55 }));
        if (step.id === "plate-cover") domes.forEach((d) => { d.material.opacity = 1; d.material.transparent = false; });
        if (step.id === "pulldown") shallowPan.material = mat(0xa8b0b8, { rough: 0.3, metal: 0.75 });
      },

      onInterrupt(it) {
        if (it.id === "pan-cold") coldPanGroup.position.y = 0.9;
        if (it.id === "runner-refuel") lighter.material = mat(0xd2312b, { emissive: 0xd2312b, ei: 1.2, rough: 0.4 });
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "pan-cold") repaint(coldReadout.userData.screen, signFace("166°F", { bg: "#1c3320", accent: "#59c97b", fg: "#eafbf1", scale: 0.55 }));
        if (it.id === "runner-refuel") lighter.material = mat(0x2b2f34, { rough: 0.5 });
      },

      animate(t, dt, session) {
        if (hotboxOn) hotboxPans.forEach((p) => { if (p.visible) p.position.y = 0.06 + Math.sin(t * 1.5) * 0.002; });
        if (fuelLit) {
          chaferMid.flame.scale.y = 0.85 + Math.sin(t * 12) * 0.15;
          chaferMid.steam.visible = true;
          chaferMid.steam.userData.step(dt, new THREE.Vector3(0, 0.2, 0), 0.3, 0.16, 0.25);
        }
        [chaferLeft.steam, chaferRight.steam].forEach((s) => {
          s.visible = true;
          s.userData.step(dt, new THREE.Vector3(0, 0.2, 0), 0.3, 0.14, 0.22);
        });
        crew.userData.head.rotation.y = Math.sin(t * 0.5) * 0.3;

        const gg = session?.gauge;
        if (gg && !gg.committed) {
          if (session.step?.id === "hotbox-check") repaint(hbPort.userData.screen, signFace(`${Math.round(120 + gg.t * 60)}`, { bg: "#0d1c24", accent: "#bfeaf7", fg: "#bfeaf7", scale: 0.55 }));
          if (session.step?.id === "probe-outbound") repaint(buffetProbe.userData.screen, signFace(`${Math.round(120 + gg.t * 40)}`, {
            bg: "#0d1c24", accent: gg.t > 0.7 && gg.t < 0.92 ? "#59c97b" : "#f0645b", fg: "#bfeaf7", scale: 0.55,
          }));
        }
      },
    };
  },
};
