import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, ball, torus, hose, group, decal, repaint, signFace, particles,
} from "../../../shared/kit.js";
import {
  CITY, stationPad, holoPanel, holoTag, toolChest, instrument, standingFigure, cone, barrierPanel,
  surfaceTexture, deckPlateFace, texturedMat, reg,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Mass Timber Panel Set VR — Construction & Structural Trades.
// Setting a cross-laminated timber floor panel: a carpentry crew working a
// pick a mobile crane's IUOE operator is flying, on a deck where nobody is
// supposed to be standing under the load and the panel is not tied to
// anything else until the temporary bracing is pinned. CLT is engineered
// wood — it is also several thousand pounds swinging on a hook, and every
// control here exists because the panel does not know the difference.

const MTP_ACCENT = 0x4fa8d8;

export const SIM_MASS_TIMBER_PANEL_SET = {
  id: "mass-timber-panel-set",
  index: "192",
  domain: "Construction",
  trade: "Carpenter — UBC, with the IUOE crane operator",
  category: "Construction & Structural Trades",
  weather: "wind",
  certification: "UBC carpenters — mass timber erection crew; IUOE mobile crane operators, NCCCO certified; OSHA 29 CFR 1926 Subpart CC cranes and derricks — 1926.1425 keeping employees clear of suspended loads; OSHA 29 CFR 1926 Subpart M fall protection — 1926.501; ASME B30.9 slings; APA and WoodWorks mass timber erection guidance on temporary bracing before the crane releases the panel",
  name: "Mass Timber Panel Set",
  title: simTitle("Mass Timber Panel Set"),
  tagline: "Setting a CLT panel: the pick plan and rigging inspected, tag lines on both ends, the panel flown and landed on its bearing, temporary bracing before the hook comes off, the connection schedule driven, and the deck kept clear under the load the whole time",
  accent: MTP_ACCENT,
  accentCss: "#4fa8d8",
  parSeconds: 300,
  footprint: 2.7,
  badge: { id: "panel-set", name: "Panel Set", note: "A CLT panel picked, flown, landed and braced before the hook came off, with nobody ever under the load" },

  game: system({
    name: "Panel Set Authority",
    currency: "SPAN",
    ranks: ["Apprentice", "Carpenter", "Lead Setter", "Panel Foreman", "Panel Set Authority Certified"],
    badges: [
      { id: "rigging-sound", name: "Rigging Sound", note: "Bridle and tag lines inspected and rigged clean, first time", test: AWARD.stepClean("rigging") },
      { id: "deck-never-under", name: "Deck Never Under the Load", note: "Nobody, including you, ever stood under the suspended panel", test: AWARD.safe },
      { id: "landed-true", name: "Landed True", note: "Panel plumb inside tolerance on its bearing", test: AWARD.precise(0.7) },
    ],
    challenges: [
      { id: "clean-set", name: "Clean Set", note: "No corrections through the whole pick", test: AWARD.clean },
      { id: "held-the-line", name: "Held the Line", note: "Held the tag line steady through the whole flight", test: AWARD.unbroken },
      { id: "braced-by-break", name: "Braced By Break", note: "Landed, braced and fastened inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "under-suspended-load": "You stood in the panel's flight path while it was still on the hook. OSHA's cranes and derricks rule at 29 CFR 1926.1425 exists because a suspended load has no brakes a person on the ground can apply — a shackle, a strap or an engineered lifting insert that lets go drops several thousand pounds of engineered wood with nothing between it and whoever is standing under it.",
    "hook-not-moused": "You rigged a shackle with the pin unmoused. A shackle pin backs itself out under the load reversals a panel picks up swinging on tag lines, and ASME B30.9 calls for it to be moused or otherwise secured against exactly that — a bridle leg that comes off its pin partway through the pick drops the panel's whole weight onto the three legs left, unevenly and without warning.",
    "early-unhook": "You released the hook before the temporary bracing was pinned. A CLT panel standing free with no bracing is a several-hundred-pound plank balanced on a bearing ledge with nothing stopping it from tipping — the hook is the only thing holding it upright until the first two braces are in, and letting go before that is the same as trusting a wall that has not been built yet to hold itself up.",
    "edge-no-tieback": "You drove the connection screws leaning out past the open leading edge with nothing tying you back. OSHA's fall protection rule at 1926.501 puts a system on every unprotected edge at this height for exactly this reason — the fastening schedule runs right along the panel's own edge, and that is the one part of this job where the floor under your feet stops a stride before your hands do.",
  },

  lateNotes: {
    "brace-a": "Bracing goes in before the hook comes off — a panel with no bracing is a panel with nothing holding it upright but the crane.",
    "fasten-a": "The connection schedule is only closed up once the panel reads plumb and both braces are pinned — screwing an unplumbed panel to the schedule just fastens the error in place.",
    "hook-release": "The hook only comes off once both temporary braces are pinned home — check them again if you have any doubt at all.",
  },

  steps: [
    {
      id: "plan", kind: "select", target: "pick-plan",
      title: "Read the pick plan",
      cue: "Check the panel weight, the pick points, the crane's working radius and today's wind limit.",
      why: "The pick plan is where the carpentry crew and the crane operator are working off the same numbers before the panel ever leaves the ground — panel weight against the chart at this radius, which inserts the bridle attaches to, and the wind speed above which this panel does not fly at all. A pick improvised from what looks about right is two crews guessing in different directions.",
    },
    {
      id: "walk", kind: "find", noHint: true,
      targets: ["insert-damage", "bearing-debris", "pin-not-moused"],
      itemNames: { "insert-damage": "damaged lifting insert", "bearing-debris": "debris on the bearing ledge", "pin-not-moused": "unmoused shackle pin" },
      itemNotes: {
        "insert-damage": "One of the panel's engineered lifting inserts has a hairline crack around the thread where it was over-torqued on the last pick.",
        "bearing-debris": "There is a scatter of blocking and screws left on the bearing ledge where this panel is about to land.",
        "pin-not-moused": "A shackle pin on the bridle has backed off half a turn and has no mousing wire on it.",
      },
      title: "Walk the panel and the bearing before the pick",
      cue: "Check the lifting inserts, the bearing ledge and the rigging, and click anything that is not fit for the pick.",
      why: "Every one of these is a two-minute fix with the panel still sitting flat on the stack. Found once the panel is in the air, a cracked insert is a bridle leg with an unknown margin left on it, and debris on the bearing ledge is what stops a several-thousand-pound panel from actually sitting flat the one time it matters.",
    },
    {
      id: "fix", kind: "sequence", anyOrder: true,
      targets: ["insert-repaired", "bearing-cleared", "pin-moused"],
      itemNames: { "insert-repaired": "insert swapped", "bearing-cleared": "bearing ledge cleared", "pin-moused": "shackle pin moused" },
      title: "Correct what the walk found",
      cue: "Swap the damaged insert, clear the bearing ledge, and mouse the shackle pin.",
      why: "A defect the walk found and nobody corrected is worse than one nobody saw, because now the whole crew believes the panel was checked and is fit to fly — the correction is the only part of the walk that actually changes what happens next.",
    },
    {
      id: "rigging", kind: "sequence", anyOrder: true,
      targets: ["bridle-a", "bridle-b", "bridle-c", "bridle-d"],
      itemNames: { "bridle-a": "near-left leg", "bridle-b": "near-right leg", "bridle-c": "far-left leg", "bridle-d": "far-right leg" },
      title: "Connect the four-leg bridle",
      cue: "Shackle each bridle leg to its lifting insert and check the pin is seated before moving to the next.",
      why: "All four legs share the panel's weight only if all four are actually taking load at the same time — a leg shackled loose or to the wrong insert leaves the other three carrying a share they were never sized for the moment the panel comes off the stack, and that unevenness is invisible until the crane starts to take up the slack.",
    },
    {
      id: "tag-lines", kind: "sequence",
      targets: ["tag-line-lead", "tag-line-trail"],
      itemNames: { "tag-line-lead": "lead tag line", "tag-line-trail": "trailing tag line" },
      title: "Rig both tag lines before the pick",
      cue: "Tie the lead tag line on the leading corner first, then the trailing line on the corner behind it.",
      why: "A panel on a four-leg bridle still turns and swings on its own once it clears the stack, and a tag line only controls it if it is already tied on before that happens — trying to rig one after the panel is airborne means reaching for a moving corner with nothing steadying it. Lead first, because that is the corner about to lead the swing toward the bay.",
      outOfOrderNote: "Lead line first, then the trailing line — the corner that is about to swing first is the one that needs a line on it first.",
    },
    {
      id: "clear-deck", kind: "select", target: "clear-zone",
      title: "Clear the deck under the pick path",
      cue: "Move the crew out from under the panel's swing path before it comes off the stack.",
      why: "The flight path from the stack to the bearing is the one strip of this deck nobody has a reason to be standing on once the panel leaves the ground — a suspended CLT panel has no brakes anybody on the ground can apply, and OSHA's cranes and derricks rule keeps that path clear before the load moves, not after somebody notices they are standing in it.",
    },
    {
      id: "signals", kind: "select", target: "confirm-signals",
      title: "Confirm the signal protocol with the crane operator",
      cue: "Agree hand signals and radio call-outs with the IUOE operator before the pick starts.",
      why: "The operator is flying a panel they can only partly see over the boom and the load line, and everything they know about the crew's position, the clear zone and the landing comes through whoever is signalling them. Agreeing that before the hook takes any weight means the operator is never guessing which crew member's hand means stop.",
    },
    {
      id: "fly", kind: "track", target: "tag-line-lead", seconds: 8,
      title: "Guide the panel across on the lead line",
      cue: "Keep a steady light tension on the lead tag line as the panel swings out over the deck toward the bearing.",
      why: "A tag line only steers a load at a light, steady tension — haul on it and the panel swings hard the other way past where you wanted it; let it go slack and it keeps whatever swing the wind and the crane's own motion already gave it. This is the whole flight across open deck, with the panel's full weight on a hook nobody but the operator controls.",
      track: { start: 0.12, green: [0.4, 0.62], rise: 0.55, fall: 0.5, drift: 0.13, label: "TAG LINE TENSION", readout: (v) => (v < 0.4 ? "slack — panel swinging free" : v > 0.62 ? "hauling the panel off line" : "steady") },
      holdBreakNote: "Tag line went slack mid-flight. An unguided panel keeps whatever swing it already had until something — or someone — stops it.",
    },
    {
      id: "land", kind: "drag", target: "panel",
      title: "Land the panel on its bearing",
      cue: "Bring the panel in over the bearing ledge and set it down flush against the seam.",
      why: "A controlled landing means the panel is taking its own weight on the bearing before any rigging comes off it — set it down fast or off the mark and it can rock on a high point in the ledge with several thousand pounds still swinging on the hook above whoever steps in to check the seam.",
      drag: { to: "bearing-socket", radius: 0.5, missNote: "Not over the bearing — bring the panel back in line with the seam before it comes down." },
    },
    {
      id: "plumb", kind: "gauge", target: "plumb-tool",
      title: "Check the panel is plumb on its bearing",
      cue: "Read the level against the panel face and commit once it is inside tolerance.",
      why: "A panel landed slightly out of plumb does not correct itself once it is fastened — it locks the whole floor's next lift to whatever error is sitting in this one, and a panel that is out of plumb while it is still only resting on the bearing, unbraced, is also the one most likely to be the panel that tips.",
      gauge: { label: "PLUMB", speed: 0.72, green: [0.44, 0.6], readout: (t) => `${((t - 0.52) * 36).toFixed(1)} mm/m`, missNote: "Out of plumb — adjust the panel on its bearing and read the level again before it is braced." },
    },
    {
      id: "brace", kind: "sequence", anyOrder: true,
      targets: ["brace-a", "brace-b"],
      itemNames: { "brace-a": "near diagonal brace", "brace-b": "far diagonal brace" },
      title: "Pin the temporary braces",
      cue: "Pin a diagonal brace from the panel face to the deck on each side before the hook comes off.",
      why: "Until these braces are pinned, the crane's hook is the only thing keeping this panel upright — CLT is engineered wood, not a wall, and a panel standing free on a bearing ledge with no lateral bracing goes over under a push a person could give it by accident, let alone a gust.",
    },
    {
      id: "release", kind: "select", target: "hook-release",
      title: "Release the hook",
      cue: "Confirm both braces are pinned, then call the operator to slack and unhook.",
      why: "The hook comes off only once both braces are actually pinned, not once they look close enough — this is the one moment on the whole pick where the panel goes from something the crane is holding up to something the temporary bracing is holding up, and there is no controlled way to put the hook back on if that handoff was wrong.",
    },
    {
      id: "snug", kind: "hold", target: "seam-clamp", seconds: 4,
      title: "Hold the panel snug to the seam",
      cue: "Hold the clamp tight against the neighbouring panel while the seam is closed.",
      why: "The panels only act as one continuous floor if the seam between them is actually closed while it is fastened — let the clamp off early and the gap opens back up the moment the panel settles under its own weight, and a floor with an open seam has a soft line running straight through it that nobody sees again until it moves under a load.",
      holdBreakNote: "The clamp came off before the seam was closed — the gap has opened back up. Bring it in and hold it again.",
    },
    {
      id: "fasten", kind: "sequence", anyOrder: true,
      targets: ["fasten-a", "fasten-b", "fasten-c"],
      itemNames: { "fasten-a": "angle bracket, near end", "fasten-b": "angle bracket, centre", "fasten-c": "angle bracket, far end" },
      title: "Drive the connection schedule",
      cue: "Drive the angle brackets at the three schedule locations to the specified screw pattern.",
      why: "The connection schedule is engineered for this specific panel and this specific bearing condition — the number of screws, their spacing and which brackets take load are all sized to what this floor is expected to carry, and closing it up with a screw pattern that looks close enough leaves a connection nobody has actually verified against the drawing.",
    },
  ],

  interrupts: [
    {
      id: "gust-spin",
      kind: "Panel spinning",
      after: "fly", delay: 3, seconds: 12,
      alert: "A gust has caught the panel broadside and it has started to spin slowly on the hook, twisting the lead line out of your hands.",
      cue: "The panel is turning on its own and the lead line is not stopping it.",
      target: "tag-line-trail",
      why: "One tag line only controls a load along the axis it is already pulling on — once a panel this size starts to rotate, the lead line is fighting a turn it was never rigged to stop, and the trailing line is the only thing left on the panel that can be hauled from the opposite side to bring the spin back under control before it swings into anything.",
      missNote: "The panel kept spinning with only the lead line being worked. A rotating load with this much surface area picks up speed in a gust rather than settling on its own, and it stops only when it hits something or someone finally gets a second line on it.",
      wrongNote: "Take the trailing line. One line cannot stop a spin it was never rigged to fight — the other side of the panel is where the correction comes from.",
    },
    {
      id: "walk-under-load",
      kind: "Person under the load",
      after: "land", delay: 3, seconds: 11,
      alert: "Someone has walked in under the panel's corner while it is still hanging just above the bearing, looking down at a phone.",
      cue: "There is a suspended load over somebody's head right now.",
      target: "load-horn",
      why: "A panel that is inches from its bearing is still entirely the crane's load until it is actually resting and unhooked — nothing about how close it looks to landing changes what several thousand pounds does to whoever is under it if a bridle leg or an insert lets go in the last few seconds. The horn is the fastest way to get a head up and moving before the panel comes down rather than after.",
      missNote: "The panel finished landing with somebody stood underneath it the whole way down. It came down clean this time, which is the only reason this is a lesson instead of the reason a suspended-load rule exists at all.",
      wrongNote: "Sound the horn. Get them out from under it before anything else happens with this panel.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.7, MTP_ACCENT);

    // ------------------------------------------------------------- deck
    const deckMesh = box(g, 6.4, 0.12, 5.4, 0, 0.06, 0, 0xffffff, { rough: 0.6, metal: 0.3 });
    deckMesh.material = texturedMat(
      surfaceTexture((cx, w, h) => deckPlateFace(cx, w, h, { base: "#333c44", base2: "#282f36" }), { repeat: 7, px: 256 }),
      { rough: 0.6, metal: 0.35, color: 0xb7c0c8 },
    );

    // -------------------------------------------------------- bearing wall
    // The panel lands here — a low CLT bearing wall with the seam of the
    // panel already in place beside it.
    const bearingWall = group(g, 0.9, 0, -0.6);
    box(bearingWall, 2.6, 0.9, 0.22, 0, 0.45, 0, 0xb08a52, { rough: 0.85 });
    const alreadyPanel = box(bearingWall, 1.5, 0.24, 1.5, -1.3, 0.98, 0.7, 0xc49a5e, { rough: 0.82 });
    holoTag(bearingWall, "panel already set", 0, 1.2, 0.7, { css: "#4fa8d8", w: 0.4 });
    const seamClamp = group(bearingWall, -0.55, 0.98, 0.7);
    box(seamClamp, 0.08, 0.16, 0.08, 0, 0, 0, 0xe8b02e, { rough: 0.5, metal: 0.4 });
    cyl(seamClamp, 0.012, 0.012, 0.3, 0, 0.12, 0, 0xe8b02e, { rough: 0.5, metal: 0.4, seg: 8 }).rotation.z = Math.PI / 2;
    holoTag(seamClamp, "seam clamp", 0, 0.24, 0, { css: "#4fa8d8", w: 0.24 });
    reg(hits, seamClamp, "seam-clamp");
    const bearingSocket = box(bearingWall, 1.6, 0.05, 1.5, 1.1, 0.98, 0.7, 0xffffff, { rough: 0.5 });
    bearingSocket.visible = false; hits["bearing-socket"] = bearingSocket;
    const bearingDebris = group(bearingWall, 1.1, 0.94, 0.7);
    for (const [dx, dz] of [[-0.4, 0.2], [0.2, -0.3], [0.5, 0.1]]) box(bearingDebris, 0.16, 0.03, 0.06, dx, 0, dz, 0x6a5638, { rough: 0.9 });
    reg(hits, bearingDebris, "bearing-debris");
    const bearingCleared = box(bearingWall, 1.6, 0.02, 1.5, 1.1, 0.94, 0.7, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, bearingCleared, "bearing-cleared");

    // ------------------------------------------------------------- panel
    // The CLT panel: a big flat board with four lifting inserts and a
    // bridle running up to a hook, staged over the stack until it flies.
    const panel = group(g, -2.1, 0, 1.4);
    const panelBody = box(panel, 1.6, 0.22, 1.5, 0, 1.6, 0, 0xc49a5e, { rough: 0.8 });
    for (let i = -3; i <= 3; i++) box(panel, 1.58, 0.006, 0.02, 0, 1.712, i * 0.2, 0x9a7645, { rough: 0.85 });
    const insertPositions = [["bridle-a", -0.65, -0.6], ["bridle-b", 0.65, -0.6], ["bridle-c", -0.65, 0.6], ["bridle-d", 0.65, 0.6]];
    const bridleLegs = {};
    for (const [id, ix, iz] of insertPositions) {
      const insert = cyl(panel, 0.03, 0.03, 0.06, ix, 1.74, iz, CITY.steel, { rough: 0.4, metal: 0.7, seg: 12 });
      const leg = cyl(panel, 0.01, 0.01, 0.85, ix * 0.55, 2.1, iz * 0.55, 0x8a8f96, { rough: 0.5, metal: 0.6, seg: 6 });
      leg.rotation.x = Math.atan2(iz, 0.85); leg.rotation.z = -Math.atan2(ix, 0.85);
      const shackle = torus(panel, 0.028, 0.008, ix, 1.78, iz, 0xdfe4e8, { rough: 0.4, metal: 0.7, seg: 8, seg2: 14 });
      bridleLegs[id] = { insert, leg, shackle };
      reg(hits, shackle, id);
    }
    // The unmoused pin the pre-pick walk has to find, on the near-left leg.
    const unmousedPin = cyl(panel, 0.012, 0.012, 0.05, -0.65, 1.78, -0.66, 0xf2c14b, { rough: 0.6, metal: 0.4, seg: 8 });
    reg(hits, unmousedPin, "pin-not-moused");
    const mousingWire = cyl(panel, 0.004, 0.004, 0.09, -0.65, 1.78, -0.66, 0x2b2f34, { rough: 0.7, seg: 6, opacity: 0.001, transparent: true, cast: false });
    reg(hits, mousingWire, "pin-moused");
    // The cracked insert the walk finds, on the far-right corner.
    const crack = box(panel, 0.05, 0.006, 0.02, 0.65, 1.755, 0.6, 0x2b2f34, { rough: 0.9 });
    reg(hits, crack, "insert-damage");
    const insertSwap = ball(panel, 0.02, 0.65, 1.76, 0.6, 0xdfe4e8, { rough: 0.4, metal: 0.6, seg: 10, opacity: 0.001, transparent: true, cast: false });
    reg(hits, insertSwap, "insert-repaired");

    const spreader = cyl(panel, 0.02, 0.02, 1.3, 0, 2.55, 0, 0x8a8f96, { rough: 0.4, metal: 0.6, seg: 10 });
    spreader.rotation.x = Math.PI / 2;
    const bridleCable = hose(panel, [[0, 2.6, 0], [0, 3.3, 0]], 0.014, CITY.steel, { steps: 8, rough: 0.4, metal: 0.7 });
    const hookGroup = group(panel, 0, 3.35, 0);
    torus(hookGroup, 0.06, 0.014, 0, 0, 0, 0xd8b23a, { rough: 0.4, metal: 0.6, seg: 8, seg2: 16 });
    holoTag(panel, "CLT panel, bay 2", 0, 2.0, 0.9, { css: "#4fa8d8", w: 0.4 });
    reg(hits, panel, "panel");

    // The two tag lines, hanging off opposite corners.
    const tagLead = hose(panel, [[0.7, 1.55, -0.65], [0.7, 0.55, -1.3]], 0.01, 0xe8b02e, { steps: 10, rough: 0.75 });
    reg(hits, tagLead, "tag-line-lead");
    holoTag(panel, "lead tag line", 0.7, 0.4, -1.3, { css: "#4fa8d8", w: 0.28 });
    const tagTrail = hose(panel, [[-0.7, 1.55, 0.65], [-0.7, 0.55, 1.35]], 0.01, 0xe8b02e, { steps: 10, rough: 0.75 });
    reg(hits, tagTrail, "tag-line-trail");
    holoTag(panel, "trailing tag line", -0.7, 0.4, 1.35, { css: "#4fa8d8", w: 0.32 });

    // -------------------------------------------------------------- crane
    // A partial crane rig — boom tip and cab — the IUOE operator's post,
    // parked so the hook line above the panel reads as coming from it.
    const crane = group(g, -0.8, 0, -2.8, 0.2);
    cyl(crane, 0.09, 0.11, 3.3, 0, 1.65, 0, CITY.steel, { rough: 0.5, metal: 0.6, seg: 12 });
    const cab = group(crane, 0, 0.7, 0.4);
    box(cab, 0.5, 0.4, 0.46, 0, 0, 0, MTP_ACCENT, { rough: 0.45, metal: 0.5 });
    box(cab, 0.36, 0.22, 0.02, 0, 0.02, -0.24, 0x9fd8ff, { rough: 0.2, opacity: 0.8, transparent: true });
    const boom = group(crane, 0, 3.2, 0, 0.35);
    box(boom, 3.6, 0.16, 0.16, 1.7, 0, 0, 0xf2c14b, { rough: 0.5, metal: 0.4 });
    holoTag(crane, "IUOE mobile crane", 0, 3.8, 0.4, { css: "#4fa8d8", w: 0.42 });

    // ------------------------------------------------------------ pick plan
    const pickPlan = holoPanel(g, 0.68, 0.5, -2.6, 1.4, -1.3, (cx, w, h) => {
      cx.fillStyle = "rgba(8,16,22,0.9)"; cx.fillRect(0, 0, w, h); cx.fillStyle = "#4fa8d8"; cx.fillRect(0, 0, w, 6);
      cx.font = `600 ${Math.round(h * 0.1)}px 'Barlow Condensed', Arial, sans-serif`; cx.textAlign = "left"; cx.textBaseline = "middle";
      cx.fillStyle = "#eaf6fb"; cx.fillText("PICK PLAN — PANEL P-2B", w * 0.06, h * 0.14);
      cx.font = `${Math.round(h * 0.078)}px Arial, sans-serif`; cx.fillStyle = "#c8e4f0";
      ["Panel weight: 6,400 lb", "Pick points: 4 engineered inserts", "Crane radius: 42 ft — within chart", "Wind limit: 25 mph sustained", "Bracing before hook release — required"].forEach((l, i) => cx.fillText(l, w * 0.06, h * (0.3 + i * 0.13)));
    }, { ry: 0.55, accent: MTP_ACCENT });
    reg(hits, pickPlan, "pick-plan");

    // ------------------------------------------------------------- clear zone
    const clearZone = box(g, 3.4, 0.01, 1.6, -1.0, 0.13, 1.0, 0x59c97b, { rough: 0.7, opacity: 0.35, transparent: true, cast: false });
    holoTag(g, "crew clear of the pick", -1.0, 0.4, 1.0, { css: "#59c97b", w: 0.4 });
    reg(hits, clearZone, "clear-zone");
    const flightPathZone = box(g, 3.4, 1.8, 1.6, -1.0, 1.0, 1.0, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "stand under the flight path?", -1.0, 2.0, 1.0, { css: "#d2312b", w: 0.48 });
    reg(hits, flightPathZone, "under-suspended-load");

    // ------------------------------------------------------------ signals
    const signalBoard = group(g, -2.7, 0, 0.5);
    box(signalBoard, 0.42, 0.3, 0.02, 0, 1.2, 0, 0x2b2f34, { rough: 0.7 });
    decal(signalBoard, 0.38, 0.26, 0, 1.2, 0.011, signFace("SIGNALS", { bg: "#0d1c24", accent: "#4fa8d8", fg: "#bfeaf7", scale: 0.5 }), { px: 220 });
    holoTag(signalBoard, "confirm signals", 0, 1.44, 0, { css: "#4fa8d8", w: 0.36 });
    reg(hits, signalBoard, "confirm-signals");

    // ------------------------------------------------------------- braces
    const braces = {};
    for (const [id, x] of [["brace-a", 0.1], ["brace-b", 1.7]]) {
      const b = group(bearingWall, x - 0.9, 0, 1.4);
      const arm = cyl(b, 0.02, 0.02, 1.3, 0, 0.65, 0, 0xe8b02e, { rough: 0.5, metal: 0.4, seg: 8 });
      arm.rotation.x = 0.9;
      b.visible = false;
      braces[id] = b;
      reg(hits, b, id);
    }

    // ------------------------------------------------------------ fastening
    const fasteners = {};
    for (const [id, x] of [["fasten-a", -1.9], ["fasten-b", -1.3], ["fasten-c", -0.7]]) {
      const f = box(bearingWall, 0.12, 0.1, 0.03, x, 0.98, 0.85, 0x8b929a, { rough: 0.5, metal: 0.6, opacity: 0.25, transparent: true });
      fasteners[id] = f;
      reg(hits, f, id);
    }
    const edgeZone = box(bearingWall, 2.4, 0.4, 0.5, 0, 1.1, 1.4, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(bearingWall, "lean past the edge?", 0, 1.4, 1.4, { css: "#d2312b", w: 0.4 });
    reg(hits, edgeZone, "edge-no-tieback");

    // -------------------------------------------------------------- hazards
    const looseShacklePin = cyl(g, 0.014, 0.014, 0.09, -1.6, 2.0, 1.9, 0xf2c14b, { rough: 0.6, metal: 0.4, seg: 8 });
    holoTag(g, "shackle — pin unmoused", -1.6, 2.16, 1.9, { css: "#d2312b", w: 0.4 });
    reg(hits, looseShacklePin, "hook-not-moused");
    const quickReleaseLever = group(panel, 0, 3.3, 0.3);
    box(quickReleaseLever, 0.06, 0.1, 0.03, 0, 0, 0, 0xd2312b, { rough: 0.6, metal: 0.3 });
    holoTag(quickReleaseLever, "release now?", 0, 0.16, 0, { css: "#d2312b", w: 0.28 });
    reg(hits, quickReleaseLever, "early-unhook");

    // The actual release control, only meant to be used after the braces.
    const hookRelease = group(g, -0.4, 0, -1.6);
    box(hookRelease, 0.1, 0.1, 0.06, 0, 1.2, 0, 0x2b2f34, { rough: 0.6 });
    const releaseBtn = cyl(hookRelease, 0.03, 0.03, 0.03, 0, 1.26, 0.03, 0xf2c14b, { rough: 0.5, metal: 0.3, seg: 12 });
    holoTag(hookRelease, "hook release", 0, 1.4, 0, { css: "#4fa8d8", w: 0.3 });
    reg(hits, hookRelease, "hook-release");

    // ---------------------------------------------------------------- horn
    const horn = group(g, 1.6, 0, 1.9);
    cyl(horn, 0.02, 0.02, 1.0, 0, 0.5, 0, 0x8b929a, { rough: 0.5, metal: 0.6, seg: 8 });
    box(horn, 0.1, 0.14, 0.06, 0, 1.05, 0, 0x2b2f34, { rough: 0.6 });
    const hornLight = ball(horn, 0.03, 0, 1.14, 0.03, 0xf2ae14, { emissive: 0xf2ae14, ei: 0.4, rough: 0.4 });
    hornLight.material = hornLight.material.clone();
    decal(horn, 0.08, 0.03, 0, 1.0, 0.033, signFace("HORN", { bg: "#22262b", accent: "#4fa8d8", scale: 0.45 }), { px: 200 });
    reg(hits, horn, "load-horn");

    // ---------------------------------------------------------------- tools
    const chest = toolChest(g, 2.5, 1.6, { ry: -0.5, color: 0x3a5a70 });
    const plumbTool = instrument(chest, 0, 0.79, 0, { ry: -0.3, idle: "-- mm/m", color: MTP_ACCENT, w: 0.12, d: 0.19 });
    holoTag(plumbTool, "plumb", 0, 0.16, 0, { css: "#4fa8d8", w: 0.2 });
    reg(hits, plumbTool, "plumb-tool");

    // -------------------------------------------------------------- crew
    const carpenter = standingFigure(g, 0.3, 1.9, { ry: -0.5, cloth: 0x37505f, vest: 0xf2c14b, helmet: 0xf2f2f2 });
    holoTag(carpenter, "carpenter", 0, 1.9, 0, { css: "#4fa8d8", w: 0.26 });
    const leadHand = standingFigure(g, -1.9, -0.4, { ry: 1.6, cloth: 0x4a5560, vest: 0xf2c14b, helmet: 0xf2f2f2 });
    holoTag(leadHand, "lead hand", 0, 1.9, 0, { css: "#4fa8d8", w: 0.24 });
    const wanderer = standingFigure(g, 1.2, 1.35, { ry: -1.2, cloth: 0x4a5560, vest: 0xf2c14b, helmet: 0xf2f2f2 });
    wanderer.visible = false;
    const wandererHome = { x: 1.2, z: 1.35, ry: -1.2 };
    barrierPanel(g, 2.9, -1.4, { ry: 1.2 });
    cone(g, 2.4, 2.4);
    cone(g, -2.9, 2.0);

    const staginPallets = group(g, -2.4, 0, 2.6);
    for (let i = 0; i < 3; i++) box(staginPallets, 1.5, 0.22, 1.4, 0, 0.15 + i * 0.24, 0, 0xc49a5e, { rough: 0.82 });
    holoTag(staginPallets, "staged panels", 0, 1.0, 0.8, { css: "#4fa8d8", w: 0.34 });

    const sawdust = particles(g, 24, 0xd8d2c4, { size: 0.03, life: 0.5, additive: false, opacity: 0.4 });

    const panelStart = { x: -2.1, y: 0, z: 1.4 };
    const panelHome = { x: 0.9, y: 0, z: -0.6 };
    let flying = false, flyElapsed = 0, spinning = false, inFlightPath = false;

    return {
      hits,
      spawnLook: new THREE.Vector3(-0.4, 1.4, 0.3),
      onStep() {},
      onStepComplete(step) {
        if (step.id === "fix") { crack.visible = false; bearingDebris.visible = false; unmousedPin.rotation.z = 0; }
        if (step.id === "fly") { flying = false; panel.position.set(panelHome.x, panelHome.y, panelHome.z); }
        if (step.id === "land") { panel.position.set(panelHome.x, panelHome.y, panelHome.z); }
        if (step.id === "brace") { braces["brace-a"].visible = true; braces["brace-b"].visible = true; }
        if (step.id === "release") { hookGroup.visible = false; bridleCable.visible = false; spreader.visible = false; for (const b of Object.values(bridleLegs)) { b.leg.visible = false; b.shackle.visible = false; } }
        if (step.id === "fasten") for (const f of Object.values(fasteners)) f.material.opacity = 1;
      },
      onHazard() {},
      onDragStart(id) { if (id === "panel") { /* nothing to hide — the rig stays visible through the landing */ } },
      onInterrupt(it) {
        if (it.id === "gust-spin") { spinning = true; panel.rotation.y = 0.4; }
        if (it.id === "walk-under-load") { wanderer.visible = true; hornLight.material.emissiveIntensity = 2.0; }
      },
      onInterruptEnd(it) {
        if (it.id === "gust-spin") { spinning = false; panel.rotation.y = 0; }
        if (it.id === "walk-under-load") {
          hornLight.material.emissiveIntensity = 0.4;
          if (it.resolved === "answered") { wanderer.visible = false; wanderer.position.set(wandererHome.x, 0, wandererHome.z); wanderer.rotation.y = wandererHome.ry; }
        }
      },
      animate(t, dt, session) {
        const step = session?.step;
        const tr = session?.track;
        if (step?.id === "fly" && session.holding) {
          flying = true;
          flyElapsed += dt;
          const p = Math.min(1, flyElapsed / 8);
          panel.position.x = panelStart.x + (panelHome.x - panelStart.x) * p;
          panel.position.z = panelStart.z + (panelHome.z - panelStart.z) * p;
          if (spinning) panel.rotation.y = Math.sin(t * 3) * 0.5;
        } else if (!flying && step?.id !== "land" && step?.id !== "brace" && step?.id !== "release" && step?.id !== "snug" && step?.id !== "fasten") {
          panel.position.set(panelStart.x, panelStart.y, panelStart.z);
        }
        const gg = session?.gauge;
        if (gg && !gg.committed && step?.id === "plumb") repaint(plumbTool.userData.screen, signFace(`${((gg.t - 0.52) * 36).toFixed(1)} mm/m`, { bg: "#0d1c24", accent: gg.t >= 0.44 && gg.t <= 0.6 ? "#59c97b" : "#f2ae14", fg: "#bfeaf7", scale: 0.6 }));
        if (wanderer.visible) wanderer.rotation.y = wandererHome.ry + Math.sin(t * 2.2) * 0.15;
        void tr; void sawdust; void inFlightPath; void flightPathZone; void looseShacklePin; void quickReleaseLever;
      },
    };
  },
};
