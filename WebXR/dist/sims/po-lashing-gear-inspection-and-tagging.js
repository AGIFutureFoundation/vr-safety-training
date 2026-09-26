import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import { box, cyl, ball, torus, group, decal, repaint, signFace, mat } from "../../../shared/kit.js";
import {
  CITY, stationPad, holoPanel, holoTag, toolChest, instrument, cone, barrierPanel,
  standingFigure, reg, surfaceTexture, texturedMat, deckPlateFace,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";
import { craneSpreader } from "../../../shared/equipment.js";

// SmartCiti.X~ Lashing Gear Inspection & Tagging VR — Maritime & Ports, the
// port and terminal operations block.
//
// A container terminal apron under the crane's own spreader: a lashing-rod
// rack, a rejected-gear bin, a corner casting staged for the next twist-lock,
// and a tally board the checker keeps beside the stack. The learner is the
// ILWU lasher inspecting and tagging gear before it goes into the stow, with
// a checker running the tally. The terminal is generic.

const POL_ACCENT = 0x3fa9d8;
const POL_CSS = "#3fa9d8";

export const SIM_PO_LASHING_GEAR_INSPECTION_AND_TAGGING = {
  id: "po-lashing-gear-inspection-and-tagging",
  index: "346",
  domain: "Maritime",
  trade: "ILWU lasher inspecting and tagging lashing gear before deck stow, with a checker running the tally",
  category: "Maritime & Ports",
  weather: "wind",
  certification: "OSHA 29 CFR 1917 marine terminals for the apron work under the crane, 29 CFR 1918 longshoring for the lashing gang's own duties, ASME B30.26 rigging hardware for the rods and turnbuckles under inspection, ILWU-PMA joint training for the lashing gang, and MARAD mariner training for the vessel-side stow this gear secures",
  name: "Lashing Gear Inspection & Tagging",
  title: simTitle("Lashing Gear Inspection & Tagging VR"),
  tagline: "The rack before the first container lands: the lashing plan read for its pattern, hi-vis and a hard hat on, a cracked rod found in the rack before it is ever used, a turnbuckle's threads checked, a twist-lock staged and locked at the corner casting, the rod tensioned to the gauge's band, the gear tagged, the pattern checked against the plan, the crew held clear while the spreader swings a load overhead, the tally logged, the crew checked in, and the shift closed",
  accent: POL_ACCENT,
  accentCss: POL_CSS,
  parSeconds: 320,
  footprint: 2.8,
  badge: { id: "gear-tagged-clean", name: "Gear Tagged Clean", note: "Every rod and turnbuckle inspected before use, the pattern matched to the plan, and never a body under the spreader while it swung" },

  supportLine: "your ILWU local's member assistance programme",

  game: system({
    name: "Lashing Gang",
    currency: "TAG",
    ranks: ["Deck Hand", "Lashing Crew", "Gang Lead", "Rigging Certified", "Lasher Certified"],
    badges: [
      { id: "rack-checked-clean", name: "Rack Checked Clean", note: "The cracked rod found and set aside before it reached the stow", test: AWARD.stepClean("inspect-rod") },
      { id: "tension-held", name: "Tension Held", note: "Turnbuckle tension committed inside the band first time", test: AWARD.precise(0.7) },
      { id: "never-a-shortcut", name: "Never a Shortcut", note: "Never a cracked rod used, never a body under the spreader, never a turnbuckle left without its locking pin", test: AWARD.safe },
    ],
    challenges: [
      { id: "clean-tagging", name: "Clean Tagging", note: "No corrections anywhere in the run", test: AWARD.clean },
      { id: "pattern-on-the-plan", name: "Pattern On The Plan", note: "Lashing pattern matched the plan on the first check", test: AWARD.stepClean("verify-pattern") },
      { id: "tally-logged-fast", name: "Tally Logged Fast", note: "Tally logged inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "use-cracked-rod": "You pulled the cracked rod from the rack instead of a good one. A lashing rod under tension is holding a container against a ship's roll, and a rod that already has a visible crack is a rod that has already started failing — it is set aside for the reject bin the moment it is found, not tensioned into tomorrow's stow.",
    "stand-under-suspended-load": "You stood under the spreader while it swung a container overhead instead of stepping clear. A load on a spreader stays a suspended load for every second it is in the air, and standing under its path on the apron is choosing to be exactly where anything that lets go would land.",
    "skip-turnbuckle-lock-pin": "You tensioned the turnbuckle and walked away without setting its locking pin. A turnbuckle body can work itself loose under the vibration of a loaded ship at sea, and the locking pin is what keeps today's tension from becoming tomorrow's slack lashing three days into the voyage, when nobody on the apron can reach it anymore.",
    "walk-through-lashing-bight": "You walked through the bight of a rod that was still under tension instead of stepping around it. A tensioned lashing rod that lets go at a fitting snaps back through the space it was just occupying, and standing in that bight — rather than walking the long way around it — is the same mistake a mooring line's snap-back zone exists to prevent.",
  },

  lateNotes: {
    "twistlock-handle": "Nothing to lock yet — the spare twist-lock has to be staged at the corner casting first.",
    "tension-gauge": "Nothing to tension yet — the twist-lock has to be locked before the rod above it is tensioned.",
    "pass-tag": "Nothing to tag yet — the pattern is checked against the plan before this gear is signed off.",
  },

  steps: [
    {
      id: "read-lashing-plan", kind: "select", target: "lashing-plan",
      title: "Read the lashing plan: pattern, gear count and the reject rule",
      cue: "Read the plan: the crossing pattern this stow calls for, how many rods and turnbuckles it needs, and that any cracked or bent gear goes straight to the reject bin.",
      why: "The lashing plan is what tells the gang exactly which pattern this particular stow needs — not the pattern from yesterday's ship — and reading it before the first rod comes off the rack is what keeps the gang from tensioning a pattern that does not match what the vessel's own stability calculation assumed.",
    },
    {
      id: "don-ppe", kind: "sequence", anyOrder: true,
      targets: ["hi-vis-vest", "hard-hat"],
      itemNames: { "hi-vis-vest": "hi-vis vest", "hard-hat": "hard hat" },
      title: "Hi-vis vest and hard hat on before working under the crane",
      cue: "Hi-vis vest and hard hat on before stepping into the apron under the crane's own swing radius.",
      why: "A lasher working under a working crane is working under a load moving overhead for the whole shift, and the hi-vis vest is what lets the crane operator and the checker both find the gang at a glance, while the hard hat answers for whatever the crane's own rigging might drop.",
    },
    {
      id: "inspect-rod", kind: "find", noHint: true,
      targets: ["cracked-rod"],
      itemNames: { "cracked-rod": "cracked lashing rod in the rack" },
      itemNotes: { "cracked-rod": "One rod in the rack has a hairline crack near its eye — easy to miss under the terminal's own lighting, and set aside for the reject bin the moment it is found." },
      title: "Check the rack before pulling the next rod",
      cue: "Look over the rack for a crack near an eye, a bent shank, or a thread that does not turn smoothly before pulling the next rod.",
      why: "A rack full of rods reads as interchangeable stock until one of them is actually the one that fails mid-voyage, and checking the rack now — before any rod is committed to today's stow — is the only point in this job where a cracked rod costs nothing but a look to catch.",
    },
    {
      id: "inspect-turnbuckle", kind: "select", target: "turnbuckle-threads",
      title: "Check the turnbuckle's threads before tensioning",
      cue: "Check the turnbuckle body's threads for damage or corrosion before it goes onto the rod.",
      why: "A turnbuckle that binds or strips under load does not hold the tension the lashing plan is counting on, and checking the threads on the ground, before the turnbuckle is under any load at all, is what keeps a bad one from being discovered halfway through tensioning a rod already carrying part of a container's weight.",
    },
    {
      id: "stage-twistlock", kind: "drag", target: "spare-twistlock",
      title: "Stage the twist-lock at the corner casting",
      cue: "Carry the spare twist-lock from the bin and set it into the corner casting before locking it.",
      why: "The twist-lock has to actually be seated in the casting's socket before it can be turned to locked — setting it square in the socket now is what makes the next step a clean quarter-turn instead of a lock fighting a fitting that was never properly seated.",
      drag: { to: "corner-casting", radius: 0.5, missNote: "Not seated in the casting — the twist-lock has to sit square in the corner casting's socket before it can be turned to locked." },
    },
    {
      id: "lock-twistlock", kind: "turn", target: "twistlock-handle",
      title: "Turn the twist-lock to locked",
      cue: "Turn the twist-lock handle a quarter turn to locked, feeling it seat rather than counting the turn.",
      why: "A twist-lock that is only partly turned holds a container the same way a door that is not quite latched holds shut — it looks secured until the first real load tests it. Turning it to its own stop and feeling it seat is what makes this corner actually locked instead of resting closed.",
      turn: { turns: 0.25, label: "TWIST-LOCK", readout: (t) => (t < 0.5 ? "seating" : t < 0.9 ? "turning" : "locked") },
    },
    {
      id: "tension-rod", kind: "gauge", target: "tension-gauge",
      title: "Tension the rod to the plan's band",
      cue: "Take up the turnbuckle and commit the tension reading once it settles inside the plan's band.",
      why: "A rod tensioned too loose does nothing to stop a container shifting in a roll, and one tensioned past its rated load is a rod closer to the point it was designed to fail at — the gauge is what tells you this rod is actually in the plan's own band, not just that it feels tight by hand.",
      gauge: { label: "TENSION", speed: 0.65, green: [0.42, 0.6], readout: (t) => `${Math.round(t * 100)}%`, missNote: "Not settled inside the plan's band — hold the turnbuckle steady until the reading stops moving before you commit it." },
    },
    {
      id: "tag-gear", kind: "select", target: "pass-tag",
      title: "Tag the inspected gear",
      cue: "Hang a pass tag on the rod and turnbuckle once both have cleared inspection and tensioning.",
      why: "A tag on inspected gear is what tells the next lasher down the stack, without asking, that this rod already passed — gear pulled and used without ever being tagged is gear the tally has no way of accounting for at the end of the shift.",
    },
    {
      id: "verify-pattern", kind: "select", target: "pattern-diagram",
      title: "Check the pattern against the plan",
      cue: "Compare the corner's actual crossing pattern to the plan's diagram before calling it complete.",
      why: "A pattern that looks right from a few feet back can still be crossed the wrong way at one corner, and checking it against the plan's own diagram — corner by corner — is what catches that before the hatch cover goes on and the pattern is no longer visible to check at all.",
    },
    {
      id: "spotter-clearance", kind: "hold", target: "overhead-marker", seconds: 5,
      title: "Hold clear while the spreader swings a load overhead",
      cue: "Step to the marked clear zone and hold your position while the spreader carries a container across the apron.",
      why: "A spreader carrying a container across the apron is a suspended load for every second of that swing, and holding position in the marked clear zone — rather than continuing gear work under its path — is what keeps the gang out from underneath a load that has not yet been set down.",
      holdBreakNote: "The clear zone was left before the spreader's load was actually set down — a swing that is only watched for its first half is watched for exactly the half that was never the risk.",
    },
    {
      id: "tally-log", kind: "select", target: "tally-board",
      title: "Log the corner on the tally board",
      cue: "Record the corner, the gear tagged, and the pattern check on the tally board before moving to the next corner.",
      why: "The checker's tally is the terminal's own record of which corners are actually secured, and a corner finished but never logged is a corner the tally cannot tell the vessel's mate is actually ready for sea.",
    },
    {
      id: "crew-checkin", kind: "select", target: "gang-radio",
      title: "Check in with the checker",
      cue: "Call the checker: gear tagged, pattern matched, tally logged for this corner.",
      why: "The checker's own tally is only as good as what the gang actually radios in corner by corner, and calling it in now — rather than letting the checker assume the tally already matches — is what keeps the two records from drifting apart before the ship needs to sail.",
    },
    {
      id: "close-shift-log", kind: "select", target: "lashing-log",
      title: "Close the shift log",
      cue: "Record the cracked rod set aside, every corner tagged, and the tally's final count before signing off.",
      why: "The shift log is what the next gang reads before the next ship ties up, and a cracked rod pulled from the rack that never makes the log is a rod the reject bin cannot explain to the next inspection.",
    },
  ],

  interrupts: [
    {
      id: "spreader-swing-unannounced",
      kind: "The spreader swings a load over the corner without warning",
      after: "tension-rod", delay: 2, seconds: 12,
      alert: "The crane has started swinging a loaded spreader directly over your corner without a call down first.",
      cue: "Clear to the marked safe zone now — the pattern check waits.",
      target: "overhead-marker",
      why: "An unannounced swing over an active corner is exactly the situation the clear zone exists for, and moving to it now, before the load is anywhere near overhead, is what keeps a missed radio call from becoming a lasher standing under a container that never should have swung that way in the first place.",
      missNote: "The pattern check continued while the load swung overhead; the gang was still bent over the corner when the spreader passed directly above them.",
      wrongNote: "The marked safe zone — an unannounced overhead swing is answered by clearing the corner, not by finishing the check already underway.",
    },
    {
      id: "wind-gust-warning",
      kind: "A wind gust warning comes over the terminal's own board",
      after: "verify-pattern", delay: 2, seconds: 14,
      alert: "The terminal's wind board has just posted a gust warning above the crane's own working limit.",
      cue: "Call the crane operator to halt lifts now — the tally log waits.",
      target: "gang-radio",
      why: "A gust above the crane's rated limit is a reason to stop swinging loads over an apron full of people before the crane operator's own instruments confirm it independently, and calling it in now is what gets lifts halted in the minute it matters rather than the minute after something already swung wrong.",
      missNote: "The tally was logged first while lifts continued through the gust warning; the halt call went out only after the crane operator's own alarm caught the same wind independently.",
      wrongNote: "The gang radio to the crane operator — a wind gust warning is called in immediately, ahead of finishing paperwork already in hand.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.8, POL_ACCENT);

    // -------------------------------------------------------------- deck
    const pad = box(g, 6.6, 0.06, 5.4, 0, 0.03, 0, 0xffffff, { rough: 0.85 });
    pad.material = texturedMat(surfaceTexture((cx, w, h) => deckPlateFace(cx, w, h, { base: "#3a3f45", base2: "#2e3237" }), { repeat: 5, px: 512 }), { rough: 0.85, metal: 0.35, color: 0x9aa0a6 });

    // --------------------------------------------------------------- rack
    const rack = group(g, -2.6, 0, -1.4, 0.3);
    box(rack, 0.5, 0.7, 1.6, 0, 0.35, 0, 0x2b3138, { rough: 0.6, metal: 0.4 });
    for (let i = 0; i < 4; i++) {
      cyl(rack, 0.025, 0.025, 1.3, -0.14 + (i % 2) * 0.28, 0.55 + Math.floor(i / 2) * 0.16, -0.5 + i * 0.3, 0xc0c6cc, { rough: 0.4, metal: 0.7, seg: 8 }).rotation.z = Math.PI / 2;
    }
    holoTag(rack, "lashing rod rack", 0, 0.85, 0, { css: POL_CSS, w: 0.4 });
    reg(hits, rack, "lashing-plan");
    const crackedRod = cyl(rack, 0.025, 0.025, 1.3, 0.14, 0.87, 0.4, 0xc0c6cc, { rough: 0.4, metal: 0.7, seg: 8 });
    crackedRod.rotation.z = Math.PI / 2;
    holoTag(rack, "check the rack", 0.14, 1.1, 0.4, { css: "#d2312b", w: 0.32 });
    reg(hits, crackedRod, "cracked-rod");
    const useCrackedHit = box(g, 0.3, 0.2, 0.3, -2.6, 0.9, -1.0, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "use it anyway?", -2.6, 1.15, -1.0, { css: "#d2312b", w: 0.36 });
    reg(hits, useCrackedHit, "use-cracked-rod");

    // ------------------------------------------------------------ turnbuckle
    const tbArea = group(g, -1.2, 0, -0.6);
    const tbBody = cyl(tbArea, 0.03, 0.03, 0.3, 0, 0.5, 0, 0xc0c6cc, { rough: 0.35, metal: 0.7, seg: 10 });
    holoTag(tbArea, "turnbuckle threads", 0, 0.7, 0, { css: POL_CSS, w: 0.36 });
    reg(hits, tbBody, "turnbuckle-threads");
    const tensionGauge = instrument(tbArea, 0.25, 0.55, 0, { ry: -0.4, idle: "-- %", color: POL_ACCENT, w: 0.1, d: 0.14 });
    holoTag(tensionGauge, "tension gauge", 0, 0.16, 0, { css: POL_CSS, w: 0.3 });
    reg(hits, tensionGauge, "tension-gauge");
    const skipPinHit = box(g, 0.2, 0.1, 0.2, -0.9, 0.6, -0.6, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "skip the locking pin?", -0.9, 0.85, -0.6, { css: "#d2312b", w: 0.44 });
    reg(hits, skipPinHit, "skip-turnbuckle-lock-pin");
    const bightHit = box(g, 0.5, 0.15, 0.5, -0.4, 0.2, -0.9, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "walk through the bight?", -0.4, 0.45, -0.9, { css: "#d2312b", w: 0.44 });
    reg(hits, bightHit, "walk-through-lashing-bight");

    // ---------------------------------------------------------- corner casting
    const casting = group(g, 0.3, 0, -0.6);
    box(casting, 0.24, 0.1, 0.24, 0, 0.05, 0, 0x2b2f34, { rough: 0.7, metal: 0.3 });
    holoTag(casting, "corner casting", 0, 0.3, 0, { css: POL_CSS, w: 0.32 });
    reg(hits, casting, "corner-casting");
    const twistlock = group(g, 1.4, 0, 0.6);
    const twistlockBody = cyl(twistlock, 0.05, 0.05, 0.12, 0, 0.06, 0, 0xe8b02e, { rough: 0.4, metal: 0.6, seg: 10 });
    const twistlockHandle = box(twistlock, 0.02, 0.02, 0.14, 0, 0.13, 0, 0x2b2b30, { rough: 0.5 });
    holoTag(twistlock, "spare twist-lock", 0, 0.28, 0, { css: POL_CSS, w: 0.36 });
    reg(hits, twistlockBody, "spare-twistlock");
    reg(hits, twistlockHandle, "twistlock-handle");

    // ------------------------------------------------------------ overhead
    const spreader = craneSpreader(g, 0.5, 3.2, -0.6, { ry: 0.5, livery: { colour: 0xe8b02e, fleetName: "SMARTCITI FLEET", unitNumber: "SPR-4" } });
    void spreader;
    const clearZone = torus(g, 0.36, 0.012, 2.6, 0.02, 1.4, POL_ACCENT, { emissive: POL_ACCENT, ei: 1.4, rough: 0.4, cast: false, seg: 6, seg2: 24 });
    clearZone.rotation.x = Math.PI / 2;
    holoTag(g, "clear zone", 2.6, 0.4, 1.4, { css: POL_CSS, w: 0.3 });
    reg(hits, clearZone, "overhead-marker");
    const underLoadHit = box(g, 1.0, 0.3, 1.0, 0.5, 0.4, -0.6, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "stand under the swing?", 0.5, 0.9, -0.6, { css: "#d2312b", w: 0.46 });
    reg(hits, underLoadHit, "stand-under-suspended-load");

    // -------------------------------------------------------------- paperwork
    const plan = holoPanel(g, 0.6, 0.42, 1.6, 1.3, -1.4, (cx, w, h) => {
      cx.fillStyle = "#08131c"; cx.fillRect(0, 0, w, h); cx.fillStyle = POL_CSS; cx.fillRect(0, 0, w, 6);
      cx.font = `600 ${Math.round(h * 0.12)}px 'Barlow Condensed', Arial, sans-serif`; cx.textAlign = "left"; cx.textBaseline = "middle";
      cx.fillStyle = "#dff0fa"; cx.fillText("PATTERN DIAGRAM", w * 0.06, h * 0.16);
      cx.font = `${Math.round(h * 0.09)}px Arial, sans-serif`; cx.fillStyle = "#eef7ff";
      ["Corner: cross-lash", "Rods: 2 per corner", "Tension: gauge band"].forEach((l, i) => cx.fillText(l, w * 0.06, h * (0.4 + i * 0.18)));
    }, { ry: -0.4, accent: POL_ACCENT });
    reg(hits, plan, "pattern-diagram");

    const tag = decal(g, 0.2, 0.24, 1.0, 0.6, 0.6, (cx, w, h) => {
      cx.fillStyle = "#f2e0a0"; cx.fillRect(0, 0, w, h);
      cx.fillStyle = "#1a1400"; cx.font = `700 ${Math.round(h * 0.4)}px Arial, sans-serif`; cx.textAlign = "center"; cx.textBaseline = "middle";
      cx.fillText("PASS", w / 2, h / 2);
    }, { px: 96 });
    tag.rotation.x = -Math.PI / 2;
    reg(hits, tag, "pass-tag");

    const tally = holoPanel(g, 0.6, 0.42, -0.3, 1.3, 2.3, (cx, w, h) => {
      cx.fillStyle = "#08131c"; cx.fillRect(0, 0, w, h); cx.fillStyle = POL_CSS; cx.fillRect(0, 0, w, 6);
      cx.font = `600 ${Math.round(h * 0.12)}px 'Barlow Condensed', Arial, sans-serif`; cx.textAlign = "left"; cx.textBaseline = "middle";
      cx.fillStyle = "#dff0fa"; cx.fillText("TALLY BOARD", w * 0.06, h * 0.16);
      cx.font = `${Math.round(h * 0.09)}px Arial, sans-serif`; cx.fillStyle = "#eef7ff";
      ["Corner: —", "Gear: —", "Pattern: —"].forEach((l, i) => cx.fillText(l, w * 0.06, h * (0.4 + i * 0.18)));
    }, { ry: -0.9, accent: POL_ACCENT });
    reg(hits, tally, "tally-board");

    const log = holoPanel(g, 0.6, 0.42, -3.0, 1.3, 0.9, (cx, w, h) => {
      cx.fillStyle = "#08131c"; cx.fillRect(0, 0, w, h); cx.fillStyle = POL_CSS; cx.fillRect(0, 0, w, 6);
      cx.font = `600 ${Math.round(h * 0.12)}px 'Barlow Condensed', Arial, sans-serif`; cx.textAlign = "left"; cx.textBaseline = "middle";
      cx.fillStyle = "#dff0fa"; cx.fillText("SHIFT LOG", w * 0.06, h * 0.16);
      cx.font = `${Math.round(h * 0.09)}px Arial, sans-serif`; cx.fillStyle = "#eef7ff";
      ["Rejects: —", "Corners tagged: —", "Tally: —"].forEach((l, i) => cx.fillText(l, w * 0.06, h * (0.4 + i * 0.18)));
    }, { ry: 0.4, accent: POL_ACCENT });
    reg(hits, log, "lashing-log");

    // ------------------------------------------------------------- tools & PPE
    const chest = toolChest(g, 2.6, 2.2, { ry: -0.4, color: 0x2b3138 });
    const radio = instrument(chest, -0.12, 0.79, 0.02, { ry: 0.2, idle: "CH 8 · CHECKER", color: POL_ACCENT, w: 0.1, d: 0.16 });
    holoTag(radio, "gang radio", 0, 0.16, 0, { css: POL_CSS, w: 0.32 });
    reg(hits, radio, "gang-radio");
    const rack2 = group(g, 1.9, 0, 2.3, 0.3);
    cyl(rack2, 0.02, 0.02, 1.2, 0, 0.6, 0, 0x8a949d, { rough: 0.45, metal: 0.7, seg: 8 });
    box(rack2, 0.4, 0.03, 0.03, 0, 1.15, 0, 0x8a949d, { rough: 0.45, metal: 0.7 });
    const vestProp = group(rack2, -0.1, 0.85, 0);
    box(vestProp, 0.22, 0.28, 0.02, 0, 0, 0, 0xd8f23a, { rough: 0.8 });
    holoTag(rack2, "hi-vis vest", -0.1, 1.05, 0, { css: POL_CSS, w: 0.28 });
    reg(hits, vestProp, "hi-vis-vest");
    const hatProp = ball(rack2, 0.1, 0.14, 0.9, 0, 0xe8b02e, { rough: 0.6 });
    hatProp.scale.set(1, 0.6, 1);
    holoTag(rack2, "hard hat", 0.14, 1.05, 0, { css: POL_CSS, w: 0.26 });
    reg(hits, hatProp, "hard-hat");

    // ---------------------------------------------------------- perimeter
    cone(g, -3.3, 3.0); cone(g, 3.3, 3.0);
    barrierPanel(g, 0, 2.9, { color: 0xf2c14b, w: 4.6 });

    // ------------------------------------------------------------------ crew
    const checker = standingFigure(g, 2.0, 0.8, { ry: -1.3, cloth: 0x2b3138, vest: POL_ACCENT, helmet: 0xf2f2f2 });
    holoTag(checker, "checker", 0, 1.95, 0, { css: POL_CSS, w: 0.24 });

    return {
      hits,
      spawnLook: new THREE.Vector3(0.2, 0.9, -0.6),
      onStep() {},
      onStepComplete(step) {
        if (step.id === "inspect-rod") crackedRod.material = mat(0xd2312b, { emissive: 0x6a1a08, ei: 0.6, rough: 0.6 });
        if (step.id === "stage-twistlock") twistlock.position.set(0.3, 0, -0.6);
        if (step.id === "tension-rod") repaint(tensionGauge.userData.screen, signFace("IN BAND", { bg: "#0d1c24", accent: "#59c97b", fg: "#bfeaf7", scale: 0.5 }));
        if (step.id === "tag-gear") tag.visible = true;
        if (step.id === "verify-pattern") {
          repaint(tally.userData.face, (cx, w, h) => {
            cx.fillStyle = "#08131c"; cx.fillRect(0, 0, w, h); cx.fillStyle = "#59c97b"; cx.fillRect(0, 0, w, 6);
            cx.font = `600 ${Math.round(h * 0.12)}px 'Barlow Condensed', Arial, sans-serif`; cx.textAlign = "left"; cx.textBaseline = "middle";
            cx.fillStyle = "#dff0fa"; cx.fillText("TALLY BOARD", w * 0.06, h * 0.16);
            cx.font = `${Math.round(h * 0.085)}px Arial, sans-serif`; cx.fillStyle = "#e0ffe8";
            ["Corner: 1 of 8", "Gear: tagged", "Pattern: matches plan"].forEach((l, i) => cx.fillText(l, w * 0.06, h * (0.4 + i * 0.18)));
          });
        }
        if (step.id === "crew-checkin") repaint(radio.userData.screen, signFace("CORNER LOGGED", { bg: "#0d1c24", accent: "#59c97b", fg: "#bfeaf7", scale: 0.4 }));
        if (step.id === "close-shift-log") {
          repaint(log.userData.face, (cx, w, h) => {
            cx.fillStyle = "#08131c"; cx.fillRect(0, 0, w, h); cx.fillStyle = "#59c97b"; cx.fillRect(0, 0, w, 6);
            cx.font = `600 ${Math.round(h * 0.12)}px 'Barlow Condensed', Arial, sans-serif`; cx.textAlign = "left"; cx.textBaseline = "middle";
            cx.fillStyle = "#dff0fa"; cx.fillText("SHIFT LOG", w * 0.06, h * 0.16);
            cx.font = `${Math.round(h * 0.085)}px Arial, sans-serif`; cx.fillStyle = "#e0ffe8";
            ["Rejects: 1 rod", "Corners tagged: all", "Tally: closed"].forEach((l, i) => cx.fillText(l, w * 0.06, h * (0.4 + i * 0.18)));
          });
        }
      },
      onHazard() {},
      onInterrupt(it) {
        if (it.id === "spreader-swing-unannounced") clearZone.material = mat(0xf0645b, { emissive: 0xf0645b, ei: 2.0, rough: 0.4 });
        if (it.id === "wind-gust-warning") plan.userData.face.material?.emissiveIntensity;
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "spreader-swing-unannounced") clearZone.material = mat(POL_ACCENT, { emissive: POL_ACCENT, ei: 1.4, rough: 0.4 });
        if (it.id === "wind-gust-warning") repaint(radio.userData.screen, signFace("LIFTS HALTED", { bg: "#0d1c24", accent: "#59c97b", fg: "#bfeaf7", scale: 0.4 }));
      },
      animate(t, dt, session) {
        const step = session?.step;
        if (session?.turn && step?.id === "lock-twistlock") twistlockHandle.rotation.y = session.turn.amount * Math.PI * 2;
        const gg = session?.gauge;
        if (gg && !gg.committed && step?.id === "tension-rod") repaint(tensionGauge.userData.screen, signFace(`${Math.round(gg.t * 100)}%`, { bg: "#0d1c24", accent: gg.t >= 0.42 && gg.t <= 0.6 ? "#59c97b" : "#f2ae14", fg: "#bfeaf7", scale: 0.55 }));
        void dt; void t; void CITY; void tbBody;
      },
    };
  },
};
