import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, ball, torus, slab, group, decal, repaint, signFace, paperFace, mat,
} from "../../../shared/kit.js";
import {
  CITY, stationPad, holoPanel, holoTag, instrument, standingFigure,
  surfaceTexture, texturedMat, pavingFace, reg,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Code Response Support and Crash Cart Check VR — Healthcare
// Support, station six. Not the code team's own clinical work — the support
// role around it: a crash cart proven ready every single day whether or not
// it's ever opened, and the logistics of an actual code handled by someone
// who never touches the patient — the hallway kept clear, the family
// redirected, a fresh backup cart brought the moment the working one opens,
// and the whole cart restocked, resealed and logged the instant the room
// clears, so the next code anywhere in the building finds a cart exactly as
// ready as this one was.

const CCC_ACCENT = 0xe0525f;

export const SIM_HC_CODE_RESPONSE_SUPPORT_AND_CRASH_CART_CHECK = {
  id: "hc-code-response-support-and-crash-cart-check",
  index: "357",
  domain: "Healthcare Support",
  trade: "Clinical support technician",
  category: "Healthcare Support",
  indoor: "clinic",
  certification: "NFPA 101 Life Safety Code for the egress path a code response keeps clear; OSHA 29 CFR 1910.1030 bloodborne pathogens for any contact with a used device or a sharp on the cart; the CDC's general infection-prevention guidance for equipment turned over between patients; SEIU-UHW and NUHW as the training bodies for clinical support staff",
  name: "Code Response Support & Crash Cart Check",
  title: simTitle("Code Response Support & Crash Cart Check"),
  tagline: "A crash cart proven ready every day, and the logistics of a real code run by someone who never touches the patient — the hallway kept clear, family redirected, a backup cart delivered, and the room's cart restocked and resealed the moment it clears",
  accent: CCC_ACCENT,
  accentCss: "#e0525f",
  parSeconds: 320,
  footprint: 2.5,
  badge: { id: "cart-always-ready", name: "Cart Always Ready", note: "A crash cart checked, sealed and logged ready every single day, and a real code supported without ever touching the patient" },

  // Named for the guide's end-of-run check-in card (shared/ei-guide.js):
  // the profession's own support resource, not an invented hotline.
  supportLine: "your employer's employee assistance program, or SEIU-UHW's member resources — supporting a code from the sidelines carries its own weight even when your hands never touch the patient",

  game: system({
    name: "Cart Readiness",
    currency: "CART",
    ranks: ["New Support Tech", "Cart Certified", "Lead Tech", "Response Supervisor", "Cart Readiness Certified"],
    badges: [
      { id: "seal-verified", name: "Seal Verified", note: "The cart's tamper seal checked and logged every single day", test: AWARD.stepClean("tamper-seal-check") },
      { id: "hallway-held", name: "Hallway Held", note: "The egress path held clear for the full response", test: AWARD.stepClean("hallway-clear") },
      { id: "cart-exchanged", name: "Cart Exchanged", note: "A fresh backup cart delivered and the used one restocked and resealed", test: AWARD.stepClean("post-code-restock") },
    ],
    challenges: [
      { id: "clean-shift", name: "Clean Shift", note: "No corrections anywhere in the shift", test: AWARD.clean },
      { id: "steady-watch", name: "Steady Watch", note: "Held the hallway clear the whole response, first try", test: AWARD.unbroken },
      { id: "fast-check", name: "Fast Check", note: "Complete inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "cart-left-unlocked-decoy": "That cart is sitting in the hallway unsealed and unlocked. A crash cart is either sealed and in its bay or it's open because someone's actively using it — parked unsealed in a hallway, it's neither ready nor accounted for.",
    "expired-defib-pads-decoy": "Those defibrillator pads sitting loose on the cart top are past their date. Pads that have expired don't get left on the cart for whoever opens it next to discover mid-code — they get pulled and swapped the moment the date's checked.",
    "blocking-hallway-decoy": "That equipment is parked square in the path the code team runs down. An egress and response path that's blocked by whatever happened to be convenient to leave there is a blocked path the moment a team actually needs to run it.",
    "broken-medtray-seal-decoy": "That medication tray's seal is already broken and it's just sitting out. A broken seal on a medication tray gets reported to pharmacy and swapped, never opened or counted by anyone whose job is the logistics around it, not what's inside it.",
  },

  lateNotes: {
    "restock-cart": "Not yet — there's no used cart to restock until the room actually clears.",
    "log-daily-check": "Hold that. The cart has to actually be resealed before today's check logs as complete.",
  },

  steps: [
    {
      id: "pull-check-log", kind: "select", target: "daily-cart-check-log",
      title: "Pull today's cart check log",
      cue: "Open the daily crash cart checklist before touching the cart.",
      why: "The checklist is what turns \"the cart looked fine\" into a dated record someone can actually be held to — a check that never gets logged is a check nobody downstream can prove happened at all, whether that downstream question comes from a supervisor tomorrow or an inspector months from now.",
    },
    {
      id: "tamper-seal-check", kind: "select", target: "tamper-seal-check",
      title: "Check the tamper seal before opening",
      cue: "Confirm the numbered seal on the cart is intact and matches yesterday's log before anything is opened.",
      why: "An intact numbered seal is what lets this cart skip a full drawer-by-drawer inventory today — it's the whole reason the seal exists, and a seal that doesn't match yesterday's number means someone opened this cart and it needs the full count regardless of how it looks from outside.",
    },
    {
      id: "cart-inspect", kind: "find", noHint: true,
      targets: ["broken-seal", "missing-defib-pads"],
      itemNames: { "broken-seal": "a seal that's already broken", "missing-defib-pads": "a missing set of defibrillator pads" },
      itemNotes: {
        "broken-seal": "This seal is broken, which means the cart's contents can't be trusted on yesterday's log alone — it gets the full inventory today, seal or no seal.",
        "missing-defib-pads": "A defibrillator with no pads loaded is a defibrillator that isn't actually ready, whatever the rest of the cart looks like — this gets caught and corrected before the cart is ever logged ready.",
      },
      title: "Inspect the cart for what the seal alone won't show",
      cue: "Two things about this cart aren't right, seal or no seal. Find them.",
      why: "A seal tells you the cart hasn't been opened since the last check — it doesn't tell you the cart was actually stocked correctly the last time it was closed. This inspection is the check that catches what an intact seal, by itself, never can.",
    },
    {
      id: "defib-selftest", kind: "gauge", target: "defib-selftest",
      title: "Run the defibrillator's self-test",
      cue: "Start the self-test and read the result before logging the cart ready.",
      why: "A defibrillator's own self-test is the one check that actually exercises the device rather than just looking it over — a unit that displays fine on the outside but fails its self-test is a unit that looks ready and isn't, and the only way to tell the difference is running the test itself.",
      gauge: { label: "SELF-TEST", speed: 0.6, green: [0.35, 0.7], readout: (t) => (t < 0.35 ? "test incomplete" : t > 0.7 ? "test failed" : "test passed"), missNote: "Committed before the self-test actually finished or after it failed. A device logged ready off an incomplete or failed test isn't ready." },
    },
    {
      id: "o2-check-cart", kind: "select", target: "o2-tank-check-cart",
      title: "Check the cart's portable oxygen level",
      cue: "Read the portable oxygen tank gauge mounted on the cart.",
      why: "The portable tank on this cart is the only oxygen supply that actually moves with it wherever the cart is needed next — a low tank found here, at the daily check, gets swapped out now, not discovered empty in the middle of a response when there's no time left to go looking for a fresh one.",
    },
    {
      id: "supply-count", kind: "sequence", anyOrder: false,
      targets: ["count-supplies", "count-meds-sealed"],
      itemNames: { "count-supplies": "count general supplies against the checklist", "count-meds-sealed": "confirm the medication tray's own seal" },
      title: "Count supplies, then confirm the medication tray",
      cue: "Count the general supply drawers against the checklist, then confirm the medication tray is present and its own seal is intact.",
      why: "General supplies get counted item by item because that's this job's own scope — the medication tray gets checked for its presence and its seal only, because what's inside that tray is pharmacy's count to keep, not this checklist's to open.",
      outOfOrderNote: "Supplies first, then the medication tray's seal — the tray is confirmed present and sealed, never opened to check what pharmacy already counted.",
    },
    {
      id: "reseal-cart", kind: "select", target: "relock-cart",
      title: "Reseal the cart with a fresh numbered seal",
      cue: "Close the cart and apply a new numbered seal, then record the number.",
      why: "Tomorrow's whole check depends on today's seal number being written down correctly, not remembered or guessed at — a cart resealed without logging the new number is a cart tomorrow's tech has absolutely no way to verify against anything, seal intact or not.",
    },
    {
      id: "wheel-lock", kind: "turn", target: "cart-wheel-lock",
      title: "Lock the cart's wheels in its bay",
      cue: "Engage the wheel locks once the cart is parked in its marked bay.",
      turn: { turns: 0.3, axis: "y", label: "WHEEL LOCK" },
      why: "A crash cart that can roll is a crash cart that might not be exactly where the next code needs it to be, and a code is not the moment anyone wants to be tracking one down — locked wheels in a marked bay is what makes finding it automatic instead of a search.",
    },
    {
      id: "log-daily-check", kind: "select", target: "log-daily-check",
      title: "Sign off today's check",
      cue: "Record the completed check, the seal number and the time in the log.",
      why: "A signed, timed log entry is what lets anyone — a supervisor, an inspector, the next shift picking up where you left off — confirm this cart was actually checked today rather than assumed fine because it usually is, which is exactly the assumption a real emergency has no patience for.",
    },
    {
      id: "page-relay", kind: "select", target: "overhead-page-relay",
      title: "Confirm the overhead page",
      cue: "Repeat the room number and code type back to confirm the page went out correctly.",
      why: "An overhead page misheard or relayed wrong sends part of the responding team to the wrong room while the actual room keeps waiting — repeating it back before moving is what catches that mistake in the two seconds it's still fixable, rather than the minute it takes someone to notice they're in the wrong hallway.",
    },
    {
      id: "hallway-clear", kind: "hold", target: "hallway-clear-post", seconds: 6,
      title: "Hold the hallway clear",
      cue: "Stand the doorway and keep the path clear for the full response.",
      why: "A code team running full speed down a hallway needs that hallway to actually be clear, not clear except for whoever wandered into it — holding the doorway for the whole response is what keeps that path open the entire time it's needed, not just when it happened to be checked.",
      holdBreakNote: "You left the doorway before the response was over. A hallway held clear for part of a code and open to foot traffic for the rest is a hallway that wasn't actually held.",
    },
    {
      id: "backup-cart-delivery", kind: "drag", target: "backup-cart",
      title: "Bring the backup cart to the room",
      cue: "Roll the sealed backup cart to the doorway the moment the working cart is opened.",
      why: "The instant one cart is opened for a code, this floor has zero ready spares until another one arrives — getting the backup cart moving the moment the first one opens is what keeps that gap as short as possible.",
      drag: { to: "room-doorway", radius: 0.4, missNote: "Not at the doorway — a backup cart left in the hallway isn't actually in position for the next call." },
    },
    {
      id: "direct-family", kind: "select", target: "direct-family",
      title: "Direct family to the waiting area",
      cue: "Walk arriving family members to the designated waiting area, away from the room.",
      why: "Family arriving mid-code have nowhere to be that helps and every reason to want to be right at the door — directing them to the waiting area is what keeps the doorway clear and gives them somewhere to actually wait for real information.",
    },
    {
      id: "post-code-restock", kind: "sequence",
      targets: ["restock-cart", "attach-new-seal"],
      itemNames: { "restock-cart": "restock what the code used", "attach-new-seal": "attach a fresh tamper seal" },
      title: "Restock and reseal the moment the room clears",
      cue: "Restock everything the code used, then seal the cart with a fresh numbered seal.",
      why: "A cart sitting open and half-restocked after a code is a cart with no protection against the next call finding it exactly as depleted as this one left it — restocked and resealed immediately is what makes this cart the next code's ready cart too, not tomorrow's.",
      outOfOrderNote: "Restock first, then seal — a seal on a cart that hasn't actually been restocked just hides the gap instead of closing it.",
    },
    {
      id: "log-code-support", kind: "select", target: "log-code-support",
      title: "Log the support tasks and the cart exchange",
      cue: "Record what was done and the time the working cart was swapped for the backup.",
      why: "This log is the only record connecting the cart that responded to this code with the fresh one now sitting in its place — without it, nobody downstream can tell which cart is which or when the swap actually happened.",
    },
  ],

  interrupts: [
    {
      id: "family-pushes-past",
      kind: "Family at the door",
      after: "hallway-clear", delay: 3, seconds: 12,
      alert: "A family member tries to push past you into the room while the code is still running.",
      cue: "That gets redirected, not argued with in the doorway.",
      target: "direct-family",
      why: "Holding the doorway means actually holding it — a family member who gets past because arguing them out of the way felt easier than physically redirecting them is exactly how the hallway stops being clear right when the team needs to move.",
      missNote: "The family member got past and into the doorway. The one thing this role was holding clear for the code team just stopped being clear.",
      wrongNote: "Redirect them to the waiting area — the doorway doesn't get negotiated over mid-code.",
    },
    {
      id: "second-code-call",
      kind: "Second code, same floor",
      after: "post-code-restock", delay: 3, seconds: 11,
      alert: "Another unit on this floor calls saying they need a backup cart right now for a second, unrelated event.",
      cue: "That's not this room's cart to send.",
      target: "notify-central-supply",
      why: "This room's own cart is still being restocked and isn't a spare to hand off to another call — central supply is who tracks every cart on the floor and dispatches the next available one, which is exactly the job this isn't.",
      missNote: "The half-restocked cart nearly went to the second call instead of the one actually assigned to cover it. Two events were now short a cart each instead of one.",
      wrongNote: "Call central supply — they're the ones who know which cart is actually free to send.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.5, CCC_ACCENT);

    const floorTex = surfaceTexture((cx, w, h) => pavingFace(cx, w, h, {
      tiles: 3, base: "#c9ced2", base2: "#bec3c7", seam: "rgba(0,0,0,0.12)",
    }), { repeat: 4, px: 256 });
    const floorMat = () => texturedMat(floorTex, { rough: 0.55, metal: 0.04, color: 0xd6dadd });
    const floorPatch = slab(g, 3.6, 0.006, 3.4, 0, 0.001, 0, 0xd6dadd, { radius: 0.05, cast: false });
    floorPatch.material = floorMat();

    // ----------------------------------------------------------------- crash cart
    const cart = group(g, -1.2, 0, -2.4);
    box(cart, 0.6, 1.0, 0.5, 0, 0.5, 0, 0xd8342a, { rough: 0.5, metal: 0.2 });
    for (let i = 0; i < 4; i++) box(cart, 0.55, 0.02, 0.46, 0, 0.2 + i * 0.2, 0, 0xb02a20, { rough: 0.55 });
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) cyl(cart, 0.04, 0.04, 0.03, sx * 0.26, 0.03, sz * 0.2, 0x14171a, { rough: 0.7, seg: 12 });
    const defib = box(cart, 0.3, 0.14, 0.2, 0, 1.07, 0, 0x2b3138, { rough: 0.5, metal: 0.4 });
    const defibScreen = instrument(cart, 0, 1.07, 0.11, { idle: "SELF-TEST", color: CCC_ACCENT, w: 0.2, d: 0.1, ry: 0 });
    reg(hits, defibScreen, "defib-selftest");
    void defib;
    const sealTag = decal(cart, 0.1, 0.06, 0.28, 0.5, 0.01, signFace("SEAL #402", { bg: "#22262b", accent: "#f2ae14", scale: 0.4 }), { px: 96 });
    reg(hits, sealTag, "tamper-seal-check");
    holoTag(cart, "Crash cart", 0, 1.2, 0, { css: CCC_ACCENT, w: 0.4 });

    const checklistBoard = decal(g, 0.3, 0.4, -1.9, 1.3, -2.9,
      paperFace("DAILY CART CHECK", ["Seal · Defib · O2", "Supplies · Meds tray"], { bg: "#fbf3df", band: "#c99a2b" }), { px: 220 });
    reg(hits, checklistBoard, "daily-cart-check-log");

    // Broken seal and missing pads decoys on the cart.
    const brokenSealMark = box(cart, 0.1, 0.02, 0.04, -0.28, 0.5, 0.01, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(brokenSealMark, "Seal already broken", 0, 0.06, 0, { css: "#f0645b", w: 0.5 });
    reg(hits, brokenSealMark, "broken-seal");
    const padsSlot = box(cart, 0.16, 0.03, 0.1, -0.15, 0.9, 0.2, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(padsSlot, "No pads loaded", 0, 0.06, 0, { css: "#f0645b", w: 0.5 });
    reg(hits, padsSlot, "missing-defib-pads");

    // Expired pads sitting loose on top of the cart — the hazard decoy.
    const expiredPads = box(cart, 0.14, 0.01, 0.1, 0.2, 1.15, 0, 0xdfa23b, { rough: 0.7 });
    holoTag(expiredPads, "Pads expired", 0, 0.05, 0, { css: "#f0645b", w: 0.4 });
    reg(hits, expiredPads, "expired-defib-pads-decoy");

    const o2Bracket = group(cart, 0.3, 0, -0.2);
    cyl(o2Bracket, 0.06, 0.06, 0.5, 0, 0.35, 0, 0x59c9a0, { rough: 0.4, metal: 0.4, seg: 12 });
    const o2Gauge = instrument(o2Bracket, 0.1, 0.55, 0, { idle: "-- PSI", color: CCC_ACCENT, w: 0.12, d: 0.16, ry: 0 });
    reg(hits, o2Gauge, "o2-tank-check-cart");

    const supplyDrawer = box(cart, 0.5, 0.18, 0.4, 0, 0.3, 0, 0xffffff, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, supplyDrawer, "count-supplies");
    const medTray = box(cart, 0.4, 0.1, 0.3, 0, 0.65, 0, 0xf4f8fa, { rough: 0.5 });
    decal(cart, 0.3, 0.06, 0, 0.706, 0.15, signFace("SEALED", { bg: "#123a1e", accent: "#59c97b", scale: 0.4 }));
    reg(hits, medTray, "count-meds-sealed");

    const relockClip = box(cart, 0.05, 0.03, 0.02, 0.28, 0.5, 0.02, 0x2b3138, { rough: 0.5, metal: 0.4 });
    reg(hits, relockClip, "relock-cart");
    const wheelLock = box(cart, 0.03, 0.02, 0.02, -0.2, 0.04, 0.2, 0x2b3138, { rough: 0.5, metal: 0.4 });
    reg(hits, wheelLock, "cart-wheel-lock");

    const logPanel = holoPanel(g, 0.5, 0.34, -1.2, 1.6, -3.2, (ctx, w, h) => {
      ctx.fillStyle = "rgba(24,6,8,0.9)"; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#e0525f"; ctx.fillRect(0, 0, w, 5);
      ctx.fillStyle = "#ffe1e4";
      ctx.font = `600 ${Math.round(h * 0.12)}px 'Barlow Condensed', Arial, sans-serif`;
      ctx.textAlign = "left"; ctx.textBaseline = "middle";
      ctx.fillText("DAILY CHECK LOG", w * 0.06, h * 0.25);
      ctx.font = `${Math.round(h * 0.09)}px Arial, sans-serif`;
      ctx.fillText("Status: in progress", w * 0.06, h * 0.6);
    }, { accent: CCC_ACCENT });
    reg(hits, logPanel, "log-daily-check");

    // Cart-left-unlocked decoy in the hallway.
    const strayCart = group(g, 2.6, 0, -2.8);
    box(strayCart, 0.55, 0.9, 0.45, 0, 0.45, 0, 0xd8342a, { rough: 0.5 });
    holoTag(strayCart, "Unsealed cart in hall", 0, 0.98, 0, { css: "#f0645b", w: 0.5 });
    reg(hits, strayCart, "cart-left-unlocked-decoy");

    // ---------------------------------------------------------------- the room + hallway
    const doorway = group(g, 0.4, 0, -0.6, -Math.PI / 2);
    box(doorway, 1.4, 2.2, 0.1, 0, 1.1, 0, 0x8b929a, { rough: 0.4, metal: 0.4 });
    const pageBoard = instrument(doorway, 0.7, 1.4, 0.1, { idle: "CODE — RM 4B", color: CCC_ACCENT, w: 0.14, d: 0.18, ry: -Math.PI / 2 });
    reg(hits, pageBoard, "overhead-page-relay");
    const hallwayMarker = box(g, 0.6, 0.02, 1.6, 0.4, 0.001, 0.4, 0xffffff, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, hallwayMarker, "hallway-clear-post");
    const doorwaySpot = box(g, 0.5, 0.02, 0.5, 0.4, 0.001, -0.9, 0xffffff, { opacity: 0.001, transparent: true, cast: false });
    hits["room-doorway"] = doorwaySpot;

    // Blocking equipment decoy in the response hallway.
    const blockingCart = group(g, 1.2, 0, -0.4);
    box(blockingCart, 0.5, 0.7, 0.4, 0, 0.35, 0, 0x8b929a, { rough: 0.5, metal: 0.3 });
    holoTag(blockingCart, "Blocking the path", 0, 0.78, 0, { css: "#f0645b", w: 0.44 });
    reg(hits, blockingCart, "blocking-hallway-decoy");

    // Broken medication tray seal decoy, sitting apart from the cart.
    const strayMedTray = box(g, 0.3, 0.08, 0.22, 2.3, 0.5, -1.0, 0xf4f8fa, { rough: 0.5 });
    holoTag(strayMedTray, "Seal already broken", 0, 0.1, 0, { css: "#f0645b", w: 0.5 });
    reg(hits, strayMedTray, "broken-medtray-seal-decoy");

    // Backup cart, staged in the supply alcove.
    const backupCart = group(g, 3.0, 0, 1.2);
    box(backupCart, 0.6, 1.0, 0.5, 0, 0.5, 0, 0xd8342a, { rough: 0.5, metal: 0.2 });
    for (let i = 0; i < 4; i++) box(backupCart, 0.55, 0.02, 0.46, 0, 0.2 + i * 0.2, 0, 0xb02a20, { rough: 0.55 });
    holoTag(backupCart, "Backup cart", 0, 1.15, 0, { css: CCC_ACCENT, w: 0.4 });
    reg(hits, backupCart, "backup-cart");

    // Family waiting area.
    const waitingArea = group(g, -2.8, 0, 1.6);
    const waitingBench = box(waitingArea, 1.2, 0.4, 0.5, 0, 0.2, 0, 0xdfa23b, { rough: 0.7 });
    holoTag(waitingArea, "Waiting area", 0, 0.5, 0, { css: CCC_ACCENT, w: 0.4 });
    reg(hits, waitingArea, "direct-family");

    // Post-code restock station: an emptied cart to restock and reseal.
    const usedCart = group(g, -0.3, 0, 1.8);
    const usedCartBody = box(usedCart, 0.6, 1.0, 0.5, 0, 0.5, 0, 0xd8342a, { rough: 0.55, metal: 0.2, opacity: 0.7, transparent: true });
    const restockDrawer = box(usedCart, 0.5, 0.18, 0.4, 0, 0.3, 0, 0xffffff, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, restockDrawer, "restock-cart");
    const newSeal = decal(usedCart, 0.1, 0.06, 0.28, 0.5, 0.26, signFace("SEAL #403", { bg: "#22262b", accent: "#f2ae14", scale: 0.4 }), { px: 96 });
    void newSeal;
    const attachSealMark = box(usedCart, 0.1, 0.02, 0.04, -0.28, 0.5, 0.26, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, attachSealMark, "attach-new-seal");

    const supportLogPanel = holoPanel(g, 0.5, 0.34, -0.3, 1.6, 2.2, (ctx, w, h) => {
      ctx.fillStyle = "rgba(24,6,8,0.9)"; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#e0525f"; ctx.fillRect(0, 0, w, 5);
      ctx.fillStyle = "#ffe1e4";
      ctx.font = `600 ${Math.round(h * 0.12)}px 'Barlow Condensed', Arial, sans-serif`;
      ctx.textAlign = "left"; ctx.textBaseline = "middle";
      ctx.fillText("SUPPORT LOG", w * 0.06, h * 0.25);
      ctx.font = `${Math.round(h * 0.09)}px Arial, sans-serif`;
      ctx.fillText("Cart exchange: pending", w * 0.06, h * 0.6);
    }, { accent: CCC_ACCENT, ry: -0.5 });
    reg(hits, supportLogPanel, "log-code-support");

    const supplyPanel = group(g, 3.0, 0, -0.8);
    box(supplyPanel, 0.1, 0.02, 0.16, 0, 1.0, 0, 0x2b3138, { rough: 0.4, metal: 0.3 });
    const supplyLamp = ball(supplyPanel, 0.012, 0, 1.05, 0.01, 0x59c97b, { emissive: 0x59c97b, ei: 0.4, cast: false, seg: 8, seg2: 6 });
    holoTag(supplyPanel, "Central supply", 0, 1.1, 0, { css: CCC_ACCENT, w: 0.4 });
    reg(hits, supplyPanel, "notify-central-supply");

    const tech = standingFigure(g, 0.6, -1.4, { ry: 0.6, cloth: 0x3f6fa0, skin: 0xb98a63 });
    void tech;

    // Supply shelving along the back wall for depth.
    const shelf = group(g, -3.7, 0, -3.0);
    box(shelf, 0.06, 1.5, 0.7, -0.42, 0.75, 0, 0x8b929a, { rough: 0.5, metal: 0.4 });
    box(shelf, 0.06, 1.5, 0.7, 0.42, 0.75, 0, 0x8b929a, { rough: 0.5, metal: 0.4 });
    const SHELF_STOCK = [
      [0.3, "SEALS", 0xf2ae14], [0.75, "PADS", 0xdfe4e5], [1.2, "DRAWER LINERS", 0xf4f8fa],
    ];
    for (const [y, label, c] of SHELF_STOCK) {
      box(shelf, 0.82, 0.02, 0.68, 0, y, 0, 0x6f7a83, { rough: 0.55, metal: 0.3 });
      for (let i = -1; i <= 1; i++) {
        box(shelf, 0.24, 0.16, 0.2, i * 0.28, y + 0.09, 0, c, { rough: 0.7 });
        decal(shelf, 0.18, 0.06, i * 0.28, y + 0.09, 0.101, (cx, w, h) => {
          cx.fillStyle = "#22272c"; cx.fillRect(0, 0, w, h);
          cx.fillStyle = "#ffe1e4"; cx.font = `600 ${Math.round(h * 0.5)}px Arial, sans-serif`;
          cx.textAlign = "center"; cx.textBaseline = "middle"; cx.fillText(label, w / 2, h / 2);
        }, { px: 96 });
      }
    }
    holoTag(shelf, "Spare stock", 0, 1.55, 0, { css: CCC_ACCENT, w: 0.4 });

    // A second responder crew figure, well clear of any control.
    const responder = standingFigure(g, -1.85, 2.1, { ry: -0.6, cloth: 0x2f6f86, skin: 0xd9a985 });
    void responder;

    // Corridor signage and a bench for the family waiting area's depth.
    const bench = group(g, -2.8, 0, 2.1);
    box(bench, 1.0, 0.06, 0.4, 0, 0.42, 0, 0x8b6a4a, { rough: 0.7 });
    for (const sx of [-1, 1]) box(bench, 0.06, 0.4, 0.36, sx * 0.44, 0.2, 0, 0x2b3138, { rough: 0.5, metal: 0.3 });

    return {
      hits,
      footprint: 2.5,
      spawnLook: new THREE.Vector3(-0.3, 1.1, -1.8),

      onStepComplete(step) {
        if (step.id === "cart-inspect") { brokenSealMark.material = mat(0x59c97b, { opacity: 0.001, transparent: true }); padsSlot.material = mat(0x59c97b, { opacity: 0.001, transparent: true }); }
        if (step.id === "defib-selftest") {
          repaint(defibScreen.userData.screen, signFace("PASSED", { bg: "#0d1c24", accent: "#59c97b", fg: "#ffe1e4", scale: 0.55 }));
        }
        if (step.id === "reseal-cart") sealTag.visible = true;
        if (step.id === "log-daily-check") {
          repaint(logPanel.userData.face, (ctx, w, h) => {
            ctx.fillStyle = "rgba(24,6,8,0.9)"; ctx.fillRect(0, 0, w, h);
            ctx.fillStyle = "#e0525f"; ctx.fillRect(0, 0, w, 5);
            ctx.fillStyle = "#ffe1e4";
            ctx.font = `600 ${Math.round(h * 0.12)}px 'Barlow Condensed', Arial, sans-serif`;
            ctx.textAlign = "left"; ctx.textBaseline = "middle";
            ctx.fillText("DAILY CHECK LOG", w * 0.06, h * 0.25);
            ctx.font = `${Math.round(h * 0.09)}px Arial, sans-serif`;
            ctx.fillText("Status: complete · sealed", w * 0.06, h * 0.6);
          });
        }
        if (step.id === "backup-cart-delivery") {
          backupCart.parent.remove(backupCart);
          g.add(backupCart);
          backupCart.position.set(0.4, 0, -0.9);
        }
        if (step.id === "post-code-restock") { usedCartBody.material = mat(0xd8342a, { rough: 0.55, metal: 0.2 }); }
        if (step.id === "log-code-support") {
          repaint(supportLogPanel.userData.face, (ctx, w, h) => {
            ctx.fillStyle = "rgba(24,6,8,0.9)"; ctx.fillRect(0, 0, w, h);
            ctx.fillStyle = "#e0525f"; ctx.fillRect(0, 0, w, 5);
            ctx.fillStyle = "#ffe1e4";
            ctx.font = `600 ${Math.round(h * 0.12)}px 'Barlow Condensed', Arial, sans-serif`;
            ctx.textAlign = "left"; ctx.textBaseline = "middle";
            ctx.fillText("SUPPORT LOG", w * 0.06, h * 0.25);
            ctx.font = `${Math.round(h * 0.09)}px Arial, sans-serif`;
            ctx.fillText("Cart exchange: logged", w * 0.06, h * 0.6);
          });
        }
      },

      onInterrupt(it) {
        if (it.id === "family-pushes-past") waitingBench.material = mat(0xf0645b, { rough: 0.7 });
        if (it.id === "second-code-call") supplyLamp.material = mat(0xf0645b, { emissive: 0xf0645b, ei: 1.8 });
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "family-pushes-past") waitingBench.material = mat(0xdfa23b, { rough: 0.7 });
        if (it.id === "second-code-call") supplyLamp.material = mat(0x59c97b, { emissive: 0x59c97b, ei: 0.4 });
      },

      onHazard() {},

      animate(t, dt, session) {
        void dt;
        const gg = session?.gauge;
        if (gg && !gg.committed && session.step?.id === "defib-selftest") {
          repaint(defibScreen.userData.screen, signFace(gg.t < 0.35 ? "TESTING" : gg.t > 0.7 ? "FAIL" : "PASS", {
            bg: "#0d1c24", accent: gg.t >= 0.35 && gg.t <= 0.7 ? "#59c97b" : "#f0645b", fg: "#ffe1e4", scale: 0.6,
          }));
        }
        void t;
      },
    };
  },
};
