import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, ball, torus, slab, group, decal, repaint, signFace, mat,
} from "../../../shared/kit.js";
import {
  stationPad, holoPanel, holoTag, cone, instrument, standingFigure,
  surfaceTexture, texturedMat, pavingFace, reg,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Blue Flag Protection in the Yard VR — Mobility & Transit.
//
// Two crews, one cut of equipment, and the one rule that makes it safe for
// both of them to be under it at once: a blue signal is personal. It is
// displayed by the worker it protects, at every point from which the
// equipment could be moved, and it comes down only by that same worker's own
// hand — never assumed, never borrowed, and never enough that somebody
// else's flag means you don't need your own. Generic freight yard; no
// railroad, milepost or timetable named.

const RA_BFY_ACCENT = 0x3f7bd1;
const RA_BFY_CSS = "#3f7bd1";

export const SIM_RA_BLUE_FLAG_PROTECTION_IN_THE_YARD = {
  id: "ra-blue-flag-protection-in-the-yard",
  index: "429",
  domain: "Rail",
  trade: "Car inspector / mechanical department utility worker",
  category: "Mobility & Transit",
  weather: "clear",
  certification: "Blue signal protection of workers under FRA 49 CFR Part 218 Subpart B, on equipment shared with another mechanical department crew, backed by a locked derail under BMWED practice and respected by every hostler, a BLET-qualified engineer and a SMART-TD-qualified conductor alike before touching a control that could move it",
  name: "Blue Flag Protection in the Yard",
  title: simTitle("Blue Flag Protection in the Yard"),
  tagline: "The flag board checked before anything is assumed clear, your own blue flag displayed at every point that could move this equipment, a second crew's flag confirmed rather than trusted, and every flag down only by the hand that put it up",
  accent: RA_BFY_ACCENT,
  accentCss: RA_BFY_CSS,
  parSeconds: 320,
  footprint: 2.3,
  supportLine: "your car foreman or your BMWED local if a close call under blue flag protection is still sitting with you after shift",
  badge: { id: "flag-is-yours", name: "Flag Is Yours", note: "Every flag placed and removed by the hand that put it up, and never assumed clear on someone else's say-so" },

  game: system({
    name: "Blue Flag Authority",
    currency: "FLAG",
    ranks: ["Mechanical Helper", "Qualified Car Inspector", "Lead Inspector", "Car Foreman", "Blue Flag Certified"],
    badges: [
      { id: "never-borrowed", name: "Never Borrowed", note: "Never once relied on somebody else's flag instead of your own", test: AWARD.safe },
      { id: "reading-true", name: "Reading True", note: "Every gauge reading near band centre", test: AWARD.precise(0.72) },
      { id: "flags-clean", name: "Clean Flags", note: "Placement and radio steps worked with no correction", test: AWARD.all(AWARD.stepClean("place-flags"), AWARD.stepClean("notify-flagged")) },
    ],
    challenges: [
      { id: "yard-time", name: "Yard Time", note: "Complete inside 80% of par", test: AWARD.fast(0.8) },
      { id: "first-flag", name: "First Flag", note: "Clean run, no corrections", test: AWARD.clean },
      { id: "ten-clear", name: "Ten Clear", note: "Ten correct actions in a row", test: AWARD.streak(10) },
    ],
  }),

  hazards: {
    "assumed-clear": "You reached for the control stand without checking the flag board first. Equipment sitting quiet in a yard track looks exactly the same whether it is protected or not, and the only way to tell the difference is checking, never assuming, before a hand goes anywhere near a control that could move it.",
    "removed-someone-elses-flag": "You reached for a flag that is not yours. A blue signal is personal — displayed and removed by the one worker it protects — and taking somebody else's flag down removes protection for a person who has no way of knowing you just did it.",
    "between-cars-no-flag": "You went between the cars before your own flag was up. Somebody else's flag on this equipment protects them, not you, and going in on the strength of a protection that was never yours is exactly the gap a second flag exists to close.",
    "moved-flagged-equipment": "You put a hand on the throttle with blue flags displayed at both ends of this equipment. A blue flag is not a request — for as long as it is up, this equipment is not coupled to and is not moved by anybody, whatever the yard's own schedule says should be happening next.",
  },

  lateNotes: {
    "left-tool": "Nothing gets logged clear until the walk is actually done.",
    "forgotten-flag-tag": "A tag left behind after the flag itself is stowed reads like protection that is still up.",
  },

  interrupts: [
    {
      id: "hostler-approaches",
      kind: "A hostler walks toward the controls",
      after: "task-focus", delay: 4, seconds: 11,
      alert: "A hostler is walking up to the control stand, reaching for the throttle without a glance at the flag board.",
      cue: "That is somebody about to move equipment you are still working under.",
      target: "stop-whistle",
      why: "A hostler who has not checked the flag board has no way of knowing this equipment is protected, and a shout from underneath a car does not carry the way a whistle does — the whistle is built to be heard over yard noise from exactly this distance, and it is the fastest way to stop a hand before it reaches the throttle rather than after.",
      missNote: "You kept working and said nothing. The hostler had no reason to expect anyone was still under this equipment, because from the ground, quiet equipment with no flag actually checked looks exactly like equipment nobody is on.",
      wrongNote: "That will not reach somebody walking up to the controls. The whistle is built to carry over yard noise from exactly this distance.",
    },
    {
      id: "hostler-moves-anyway",
      kind: "Air building in the consist mid-call",
      after: "notify-flagged", delay: 4, seconds: 12,
      alert: "You hear the compressor cut in and air building in the consist while you are still on the radio telling the hostler the flags are up.",
      cue: "That sound means somebody is already preparing to move this equipment.",
      target: "emergency-stop",
      why: "A call in progress does not stop a hand that is already moving toward a control, and the emergency stop is the one thing in reach that removes the ability to move this equipment regardless of what is or isn't understood on the other end of that radio call — it is reached for the instant the equipment itself starts answering, not after the conversation finishes.",
      missNote: "You kept talking while the air kept building. The call was supposed to prevent this, and once it clearly hadn't, finishing the sentence did nothing that reaching for the emergency stop would not have done faster.",
      wrongNote: "That does not remove this equipment's ability to move. The emergency stop is the control built for exactly this moment.",
    },
  ],

  steps: [
    {
      id: "briefing", kind: "select", target: "job-order-board",
      title: "Read the job order",
      cue: "Check which equipment, and note that the mechanical department already has a crew on this cut.",
      why: "Two crews sharing one cut of equipment is routine, but it changes what 'clear' means for each of them — this equipment is not clear the moment your own work is done, it is clear once every crew's own flags are down.",
    },
    {
      id: "check-board", kind: "select", target: "flag-board",
      title: "Check the flag board",
      cue: "Check the flag board and the equipment itself for any flag already displayed.",
      why: "A flag board is only as good as somebody actually reading it before assuming anything — equipment with no flag showing from where you are standing might still have one up at the far end that you have not walked to yet.",
    },
    {
      id: "place-flags", kind: "sequence", anyOrder: true,
      targets: ["own-flag-near", "own-flag-far"],
      itemNames: { "own-flag-near": "display your flag — near end", "own-flag-far": "display your flag — far end" },
      title: "Display your own blue flag at both ends",
      cue: "Place your own flag at every point this equipment could be moved from.",
      why: "A blue flag protects the point it is displayed at, not the whole piece of equipment by implication — a control stand with no flag of yours in sight is a control stand somebody else has every reason to believe is clear to use.",
    },
    {
      id: "lock-derail", kind: "turn", target: "derail-lever",
      title: "Apply and lock the derail",
      cue: "Turn the derail lever over and lock it in the derailing position.",
      why: "A derail backs up the flags with something that stops equipment mechanically rather than by agreement — if a movement ever did come toward this track despite every flag in place, the derail is what actually keeps it off the equipment your crew is standing under.",
      turn: { turns: 0.25, axis: "z", label: "DERAIL" },
    },
    {
      id: "verify-other-crew", kind: "select", target: "other-crew-flag",
      title: "Confirm the other crew's flag",
      cue: "Check the mechanical department crew's own flag is actually displayed, rather than assuming it.",
      why: "Confirming a second crew's flag is not about trusting them less — it is that your safety depends on a fact about the physical world, and the only way to know that fact is to look at it yourself rather than take someone's word that they already did.",
    },
    {
      id: "notify-flagged", kind: "hold", target: "radio-handset", seconds: 5,
      title: "Notify the yardmaster the equipment is flagged",
      cue: "Call the yardmaster and hold the radio for the acknowledgement before starting work.",
      why: "The yardmaster's own record of this equipment being flagged is what keeps a hostler from being sent to move it in the first place — that record does not change until you have said so and had it read back, and until it does, every other crew in this yard is working from an assumption instead of a fact.",
      holdBreakNote: "You let go before the acknowledgement came back. The yardmaster's record does not change until they have said so in your own hearing.",
    },
    {
      id: "carry-tool", kind: "drag", target: "inspection-tool",
      title: "Carry the inspection tool to the car",
      cue: "Carry the tool from the cart to the work site now that the equipment is fully flagged.",
      why: "The tool goes to the car only once every flag this job needs is actually up — carrying it in earlier changes nothing about the protection and only puts a hand near the equipment sooner than the flags were ready for it.",
      drag: { to: "work-site", radius: 0.3, missNote: "Not at the work site — carry the tool the rest of the way to the car." },
    },
    {
      id: "inspection-reading", kind: "gauge", target: "inspection-gauge",
      title: "Take the inspection reading",
      cue: "Set the gauge against the component and commit the reading.",
      why: "This is the work the flags exist to protect — a reading taken with a hand actually inside equipment that cannot be moved by anyone else while that hand is there, which is the whole reason every earlier step existed before this one was allowed to happen.",
      gauge: {
        label: "COMPONENT WEAR", speed: 0.68, green: [0.0, 0.24],
        readout: (t) => `${(t * 8).toFixed(1)} mm`,
        missNote: "Outside tolerance. Log the defect before moving on.",
      },
    },
    {
      id: "task-focus", kind: "track", target: "watch-dial", seconds: 6,
      title: "Keep half an eye on the control stand",
      cue: "Hold your attention in the green band while you finish the inspection.",
      why: "Flags protect the equipment from being moved on purpose by somebody who checked them — they do nothing about somebody who never looked, and a crew that also keeps half an eye on the control stand catches that gap before it becomes a problem instead of after.",
      holdBreakNote: "Attention dropped out of band during the inspection. A hand reaching for the controls with nobody watching for it is exactly the gap the flags cannot close on their own.",
    },
    {
      id: "second-worker", kind: "select", target: "second-worker-flag",
      title: "A second worker joins and flags in",
      cue: "Confirm the new arrival displays their own flag before they go anywhere near the equipment.",
      why: "Every worker under this equipment needs their own flag, full stop — a second pair of hands borrowing the protection already in place is a second person this equipment's actual protection does not know exists, and removing the first flag later would strand that second worker with nothing.",
    },
    {
      id: "deny-move", kind: "hold", target: "radio-handset", seconds: 5,
      title: "Tell the hostler the flags are still up",
      cue: "Answer the hostler's call and hold the radio while you confirm the flags are still displayed.",
      why: "A hostler asking to move this equipment is a hostler who has not yet checked the flag board themselves, and the call is where that gap gets closed — with the actual state of the flags, not with an assumption about how close your crew must be to finishing.",
      holdBreakNote: "You let go of the call before confirming the flags were still up. An unfinished answer leaves the hostler exactly as uncertain as the call was supposed to fix.",
    },
    {
      id: "remove-far", kind: "select", target: "own-flag-far",
      title: "Remove your far flag",
      cue: "Take down your own flag at the far end now that your work there is finished.",
      why: "Your flag comes down by your own hand, and only once your own work at that point is actually done — removing it because the job feels close to finished is removing protection based on a feeling, not a fact, and a feeling is not what the other crew's safety is supposed to rest on.",
    },
    {
      id: "remove-near", kind: "select", target: "own-flag-near",
      title: "Remove your near flag",
      cue: "Take down your own flag at the near end now that all of your work is finished.",
      why: "This equipment is not clear the moment your own flags are down — it is clear once every crew's flags are down, which is exactly why the other crew's flag gets checked again before anyone tells the yardmaster this is over.",
    },
    {
      id: "walk", kind: "find", noHint: true,
      targets: ["left-tool", "forgotten-flag-tag"],
      itemNames: { "left-tool": "tool left on the work platform", "forgotten-flag-tag": "flag tag left hanging after the flag was stowed" },
      itemNotes: {
        "left-tool": "A tool left behind is a tool the next crew has to go looking for.",
        "forgotten-flag-tag": "A tag still hanging where the flag used to be reads like protection that is still up, to anyone who glances at it in passing.",
      },
      title: "Walk the site before you leave it",
      cue: "Scan the work platform and the flag points for anything left behind.",
      why: "A tag or a tool left where a flag used to be is a small thing that reads, to the next person walking past, like this equipment might still be protected — the walk is what makes sure nothing left behind says something that is no longer true.",
    },
    {
      id: "confirm-clear", kind: "hold", target: "radio-handset", seconds: 4,
      title: "Confirm the equipment is fully clear",
      cue: "Call the yardmaster and hold for the read-back confirming every crew's flags are down.",
      why: "The yardmaster only releases this equipment to a hostler once every crew's flags are confirmed down, not just yours — the call is what turns two crews finishing their own work into one shared fact the yardmaster can actually act on.",
      holdBreakNote: "You let go before the read-back came back. The yardmaster's record does not change until they have said so in your own hearing.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.3, RA_BFY_ACCENT);

    // ------------------------------------------------------------- textures
    const ballastTex = surfaceTexture((cx, w, h) => {
      const grad = cx.createLinearGradient(0, 0, 0, h);
      grad.addColorStop(0, "#59564d"); grad.addColorStop(1, "#3d3a33");
      cx.fillStyle = grad; cx.fillRect(0, 0, w, h);
      for (let i = 0; i < 900; i++) {
        const x = (i * 49.1) % w, y = (i * 93.7) % h, r = 1.4 + ((i * 21) % 5) * 0.5;
        cx.fillStyle = i % 4 === 0 ? "rgba(150,140,122,0.55)" : "rgba(30,26,20,0.45)";
        cx.beginPath(); cx.ellipse(x, y, r, r * 0.7, (i % 6) * 0.5, 0, 7); cx.fill();
      }
    }, { repeat: 6 });
    const ballastMat = texturedMat(ballastTex, { rough: 0.96, color: 0x8e8879 });

    const railTex = surfaceTexture((cx, w, h) => {
      const grad = cx.createLinearGradient(0, 0, 0, h);
      grad.addColorStop(0, "#c7ccd1"); grad.addColorStop(0.5, "#8a9096"); grad.addColorStop(1, "#5b6167");
      cx.fillStyle = grad; cx.fillRect(0, 0, w, h);
    }, { repeat: 3 });
    const railMat = texturedMat(railTex, { rough: 0.32, metal: 0.75, color: 0xaab0b6 });

    const tieTex = surfaceTexture((cx, w, h) => {
      const grad = cx.createLinearGradient(0, 0, w, 0);
      grad.addColorStop(0, "#3a2c20"); grad.addColorStop(0.5, "#2c2117"); grad.addColorStop(1, "#382a1e");
      cx.fillStyle = grad; cx.fillRect(0, 0, w, h);
      cx.strokeStyle = "rgba(0,0,0,0.35)"; cx.lineWidth = 2;
      for (let i = 0; i < 10; i++) { cx.beginPath(); cx.moveTo(0, (i / 10) * h + 4); cx.bezierCurveTo(w * 0.3, (i / 10) * h - 3, w * 0.7, (i / 10) * h + 6, w, (i / 10) * h); cx.stroke(); }
    }, { repeat: 1 });
    const tieMat = texturedMat(tieTex, { rough: 0.9, color: 0x8a7a68 });

    const platformTex = surfaceTexture((cx, w, h) => pavingFace(cx, w, h, {
      tiles: 3, base: "#2f4360", base2: "#26374f", seam: "rgba(0,0,0,0.5)",
    }), { repeat: 3 });
    const platformMat = texturedMat(platformTex, { rough: 0.9, color: 0xa6c0da });

    const steelTex = surfaceTexture((cx, w, h) => {
      cx.fillStyle = "#3a3430"; cx.fillRect(0, 0, w, h);
      for (let i = 0; i < 14; i++) {
        cx.fillStyle = i % 2 ? "rgba(0,0,0,0.24)" : "rgba(255,255,255,0.08)";
        cx.fillRect((i / 14) * w, 0, w / 28, h);
      }
    }, { repeat: 2 });
    const carSteelMat = texturedMat(steelTex, { rough: 0.72, metal: 0.3, color: 0x5a4a3f });

    // ------------------------------------------------------------- track
    const ballast = box(g, 6.2, 0.16, 1.6, 0, 0.08, 0, 0x8e8879, { rough: 0.98 });
    ballast.material = ballastMat;
    for (const sx of [-1, 1]) {
      const rail = box(g, 6.2, 0.1, 0.06, 0, 0.21, sx * 0.36, 0xaab0b6, { rough: 0.32, metal: 0.75 });
      rail.material = railMat;
    }
    for (let i = -11; i <= 11; i++) {
      const tie = box(g, 0.16, 0.06, 0.9, i * 0.26, 0.11, 0, 0x8a7a68, { rough: 0.9 });
      tie.material = tieMat;
    }

    // ------------------------------------------------------------- equipment (loco + two cars)
    const loco = group(g, -1.6, 0, 0);
    box(loco, 2.6, 0.24, 1.56, 0, 0.58, 0, 0x2b3138, { rough: 0.7, metal: 0.45 });
    box(loco, 1.5, 0.98, 1.14, -0.42, 1.26, 0, 0x2f3841, { rough: 0.6, metal: 0.4 });
    box(loco, 0.78, 1.18, 1.3, 0.62, 1.36, 0, 0x2f3841, { rough: 0.6, metal: 0.4 });
    const throttle = cyl(loco, 0.05, 0.05, 0.1, 0.2, 1.05, 0.6, RA_BFY_ACCENT, { rough: 0.5, emissive: RA_BFY_ACCENT, ei: 0.5, seg: 10 });
    reg(hits, throttle, "moved-flagged-equipment");
    const controlStand = box(loco, 0.3, 0.4, 0.2, 0.4, 0.9, 0.6, 0x50575e, { rough: 0.6, metal: 0.4 });

    function freightCar(parent, x, colour, marks) {
      const c = group(parent, x, 0, 0);
      const body = box(c, 1.9, 1.4, 1.4, 0, 1.4, 0, colour, { rough: 0.75, metal: 0.25, finish: "painted" });
      body.material = carSteelMat;
      decal(c, 0.7, 0.16, -0.4, 1.9, 0.71, (cx, w, h) => {
        cx.clearRect(0, 0, w, h);
        cx.fillStyle = "#d8ccc0";
        cx.font = `600 ${Math.round(h * 0.8)}px 'Barlow Condensed', Arial, sans-serif`;
        cx.textAlign = "left"; cx.textBaseline = "middle";
        cx.fillText(marks, 0, h * 0.56);
      }, { px: 220, transparent: true, rough: 0.9 });
      for (const sx of [-1, 1]) {
        box(c, 0.68, 0.28, 1.0, sx * 0.62, 0.36, 0, 0x22201e, { rough: 0.9 });
      }
      return c;
    }
    const carA = freightCar(g, 0.6, 0x6a5a4a, "SCX 61102");
    const carB = freightCar(g, 2.6, 0x5a6a52, "SCX 61103");
    const betweenTrap = box(g, 0.5, 1.6, 1.2, 1.6, 0.8, 0, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, betweenTrap, "between-cars-no-flag");

    // ------------------------------------------------------------- blue flags
    function blueFlagStand(x, z, id) {
      const bf = group(g, x, 0, z);
      cyl(bf, 0.024, 0.03, 1.1, 0, 0.55, 0, 0xb0b7bd, { rough: 0.5, metal: 0.6, seg: 8 });
      const cloth = box(bf, 0.3, 0.22, 0.02, 0.17, 0.98, 0, 0x2f6fd8, { rough: 0.6, finish: "painted" });
      const lamp = ball(bf, 0.05, 0, 1.16, 0, 0x59636d, { emissive: 0x59636d, ei: 0.3, rough: 0.3 });
      cloth.visible = false;
      reg(hits, bf, id);
      return { bf, cloth, lamp };
    }
    const flagNear = blueFlagStand(-2.7, 0.9, "own-flag-near");
    const flagFar = blueFlagStand(3.5, 0.9, "own-flag-far");
    const otherFlag = blueFlagStand(1.6, -0.9, "other-crew-flag");
    otherFlag.cloth.visible = true;
    otherFlag.lamp.material = mat(0x2f6fd8, { emissive: 0x2f6fd8, ei: 2.4 });
    const secondFlag = blueFlagStand(0.6, -0.9, "second-worker-flag");
    // A separate marker on the other crew's own flag pole — the thing that
    // would actually be touched by a hand reaching for a flag that isn't yours.
    reg(hits, box(otherFlag.bf, 0.06, 0.06, 0.06, 0, 1.1, 0.02, 0x000000, { opacity: 0.001, transparent: true, cast: false }), "removed-someone-elses-flag");

    // Flag board.
    const flagBoard = holoPanel(g, 0.5, 0.34, -3.0, 1.5, -1.6, (cx, w, h) => {
      cx.fillStyle = "rgba(6,16,22,0.9)"; cx.fillRect(0, 0, w, h);
      cx.fillStyle = RA_BFY_CSS; cx.fillRect(0, 0, w, 5);
      cx.fillStyle = "#eaf2fb";
      cx.font = `600 ${Math.round(h * 0.16)}px 'Barlow Condensed', Arial, sans-serif`;
      cx.textAlign = "center"; cx.textBaseline = "middle";
      cx.fillText("FLAG BOARD", w / 2, h * 0.36);
      cx.font = `${Math.round(h * 0.1)}px Arial, sans-serif`;
      cx.fillStyle = "#c1d3ec";
      cx.fillText("Check before you assume clear", w / 2, h * 0.66);
    }, { ry: 0.5, accent: RA_BFY_ACCENT });
    reg(hits, flagBoard, "flag-board");
    reg(hits, box(g, 1.0, 1.8, 1.0, -3.0, 0.9, 0.6, 0x000000, { opacity: 0.001, transparent: true, cast: false }), "assumed-clear");

    // Derail.
    const derailBase = group(g, -3.0, 0, -0.6, -0.3);
    box(derailBase, 0.3, 0.1, 0.3, 0, 0.05, 0, 0x3a4048, { rough: 0.9, metal: 0.3 });
    cyl(derailBase, 0.03, 0.04, 0.6, 0, 0.34, 0, 0x6b7279, { rough: 0.6, metal: 0.5, seg: 10 });
    const derailLever = box(derailBase, 0.1, 0.07, 0.32, 0, 0.6, 0, RA_BFY_ACCENT, { rough: 0.55, finish: "painted" });
    holoTag(derailBase, "Derail", 0, 0.8, 0, { css: RA_BFY_CSS, w: 0.24 });
    reg(hits, derailLever, "derail-lever");

    // Tools, gauge, whistle, e-stop.
    const toolCart = group(g, -2.5, 0, 1.7, 0.3);
    box(toolCart, 0.3, 0.4, 0.3, 0, 0.2, 0, 0x3a4048, { rough: 0.7, metal: 0.3 });
    const inspTool = box(toolCart, 0.2, 0.03, 0.02, 0, 0.42, 0, 0xdfe4e8, { rough: 0.4, metal: 0.5 });
    holoTag(toolCart, "Inspection tool", 0, 0.55, 0, { css: RA_BFY_CSS, w: 0.28 });
    reg(hits, inspTool, "inspection-tool");
    hits["work-site"] = box(g, 0.3, 0.2, 0.3, 0.6, 0.3, 0.6, 0x000000, { opacity: 0.001, transparent: true, cast: false });

    const inspGaugeTool = group(g, 0.6, 0, 0.7, -0.3);
    box(inspGaugeTool, 0.16, 0.02, 0.02, 0, 0.32, 0, 0xdfe4e8, { rough: 0.4, metal: 0.5 });
    holoTag(inspGaugeTool, "Wear gauge", 0, 0.42, 0, { css: RA_BFY_CSS, w: 0.26 });
    reg(hits, inspGaugeTool, "inspection-gauge");

    const watchDial = instrument(g, -0.9, 0.86, 1.3, { ry: 0.4, idle: "WATCH", color: RA_BFY_ACCENT });
    holoTag(watchDial, "Control watch", 0, 0.15, 0, { css: RA_BFY_CSS, w: 0.3 });
    reg(hits, watchDial, "watch-dial");

    const whistle = group(g, 3.2, 0, -1.5, 0.4);
    ball(whistle, 0.03, 0, 0.9, 0, 0xf2f2f2, { rough: 0.5 });
    holoTag(whistle, "Stop whistle", 0, 1.0, 0, { css: RA_BFY_CSS, w: 0.26 });
    reg(hits, whistle, "stop-whistle");

    const eStop = cyl(loco, 0.05, 0.055, 0.04, -0.3, 0.72, 0.6, 0xf0645b, { rough: 0.4, emissive: 0xf0645b, ei: 1.4, seg: 12 });
    holoTag(loco, "Emergency stop", -0.3, 0.86, 0.6, { css: "#f0645b", w: 0.3 });
    reg(hits, eStop, "emergency-stop");

    // Radio, job board, close.
    const radio = group(g, -2.9, 0, 2.4, -0.3);
    slab(radio, 0.5, 0.16, 0.16, 0, 0.85, 0, 0x2b3138, { radius: 0.02, rough: 0.5 });
    const radioScreen = decal(radio, 0.4, 0.1, 0, 0.87, 0.09,
      signFace("STANDBY", { bg: "#0d1c24", accent: RA_BFY_CSS, fg: "#cfe6ff", scale: 0.5 }), { glow: true, ei: 0.85, px: 256 });
    holoTag(radio, "Yardmaster line", 0, 1.05, 0.08, { css: RA_BFY_CSS, w: 0.32 });
    reg(hits, radio, "radio-handset");

    const jobBoard = holoPanel(g, 0.6, 0.42, -3.2, 1.55, 1.9, (cx, w, h) => {
      cx.fillStyle = "rgba(6,16,22,0.9)"; cx.fillRect(0, 0, w, h);
      cx.fillStyle = RA_BFY_CSS; cx.fillRect(0, 0, w, 5);
      cx.fillStyle = "#b7cbe6";
      cx.font = `600 ${Math.round(h * 0.085)}px 'Barlow Condensed', Arial, sans-serif`;
      cx.textAlign = "left"; cx.textBaseline = "middle";
      cx.fillText("JOB ORDER · TRACK 9", w * 0.06, h * 0.14);
      cx.fillStyle = "#eaf1fb";
      cx.font = `600 ${Math.round(h * 0.12)}px 'Barlow Condensed', Arial, sans-serif`;
      cx.fillText("SHARED CUT — TWO CREWS", w * 0.06, h * 0.32);
      cx.font = `${Math.round(h * 0.075)}px Arial, sans-serif`;
      cx.fillStyle = "#c1d3ec";
      ["Mechanical department already on scene", "Every crew flags its own protection", "Cleared only once every flag is down"]
        .forEach((line, i) => cx.fillText(line, w * 0.06, h * (0.5 + i * 0.12)));
    }, { ry: 0.5, accent: RA_BFY_ACCENT });
    reg(hits, jobBoard, "job-order-board");

    const closeLog = group(g, -2.9, 0, -1.6, -0.3);
    slab(closeLog, 0.4, 0.05, 0.3, 0, 0.86, 0, 0x2b3138, { radius: 0.02, rough: 0.5 });
    const closeScreen = decal(closeLog, 0.32, 0.16, 0, 0.89, 0.0, signFace("OPEN", { bg: "#0d1c24", accent: RA_BFY_CSS, fg: "#cfe6ff", scale: 0.4 }), { glow: true, ei: 0.8, px: 220 });
    closeScreen.rotation.x = -Math.PI / 2;
    holoTag(closeLog, "Yard log", 0, 1.0, 0, { css: RA_BFY_CSS, w: 0.28 });
    reg(hits, closeLog, "closing-log");

    // Left tools.
    const leftTool = group(g, 1.1, 0.13, 1.2, 0.4);
    box(leftTool, 0.16, 0.018, 0.03, 0, 0, 0, 0x53585e, { rough: 0.45, metal: 0.6 });
    reg(hits, leftTool, "left-tool");
    const forgottenTag = group(flagNear.bf, 0, 0.9, 0.05);
    box(forgottenTag, 0.06, 0.08, 0.005, 0, 0, 0, 0xf2c14b, { rough: 0.6 });
    forgottenTag.visible = false;
    reg(hits, forgottenTag, "forgotten-flag-tag");

    // Crew figures.
    const mechCrew = standingFigure(g, 1.6, -1.6, { ry: 1.4, cloth: 0x2b3138, vest: 0xf2894b, helmet: 0xf2f2f2 });
    const hostler = standingFigure(g, -3.6, -2.0, { ry: 1.0, cloth: 0x2b3138, vest: 0xf2c14b, helmet: 0xf2f2f2 });

    // A parts crate and a lantern rack, decorative site dressing that also
    // gives the yard more than one thing to reach for.
    const partsCrate = group(g, 3.3, 0, 1.9, 0.3);
    box(partsCrate, 0.4, 0.3, 0.3, 0, 0.15, 0, 0x8a6a3a, { rough: 0.85 });
    for (let i = 0; i < 2; i++) box(partsCrate, 0.4, 0.02, 0.02, 0, 0.05 + i * 0.2, 0.15, 0x5a4525, { rough: 0.8 });
    reg(hits, partsCrate, "parts-crate");
    const lanternRack = group(g, -2.3, 0, -1.8, -0.3);
    box(lanternRack, 0.06, 0.5, 0.06, 0, 0.25, 0, 0x50575e, { rough: 0.6, metal: 0.4 });
    for (let i = 0; i < 3; i++) ball(lanternRack, 0.03, 0.08, 0.15 + i * 0.14, 0, 0x2f6fd8, { emissive: 0x2f6fd8, ei: 0.6, rough: 0.4 });

    const platform = box(g, 1.4, 0.1, 1.0, -3.2, 0.05, -0.6, 0xa6c0da, { rough: 0.9 });
    platform.material = platformMat;

    cone(g, -3.6, 1.0, { color: RA_BFY_ACCENT });
    cone(g, 3.9, 1.0, { color: RA_BFY_ACCENT });

    return {
      hits,
      footprint: 2.3,

      onInterrupt(it) {
        if (it.id === "hostler-approaches") { hostler.position.set(-0.6, 0, 1.2); hostler.rotation.y = -1.5; }
        if (it.id === "hostler-moves-anyway") eStop.material = mat(0xff8a3d, { emissive: 0xff8a3d, ei: 2.0 });
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "hostler-approaches") { hostler.position.set(-3.6, 0, -2.0); hostler.rotation.y = 1.0; }
        if (it.id === "hostler-moves-anyway") eStop.material = mat(0xf0645b, { emissive: 0xf0645b, ei: 1.4 });
      },

      onStepComplete(step) {
        if (step.id === "place-flags") {
          flagNear.cloth.visible = true; flagNear.lamp.material = mat(0x2f6fd8, { emissive: 0x2f6fd8, ei: 2.4 });
          flagFar.cloth.visible = true; flagFar.lamp.material = mat(0x2f6fd8, { emissive: 0x2f6fd8, ei: 2.4 });
        }
        if (step.id === "lock-derail") derailLever.rotation.z = Math.PI / 2;
        if (step.id === "notify-flagged") repaint(radioScreen, signFace("EQUIPMENT\nFLAGGED", { bg: "#0d1c14", accent: "#59c97b", fg: "#bff7d4", scale: 0.28 }));
        if (step.id === "second-worker") { secondFlag.cloth.visible = true; secondFlag.lamp.material = mat(0x2f6fd8, { emissive: 0x2f6fd8, ei: 2.4 }); }
        if (step.id === "deny-move") repaint(radioScreen, signFace("FLAGS\nUP", { bg: "#0d1c14", accent: RA_BFY_CSS, fg: "#cfe6ff", scale: 0.32 }));
        if (step.id === "remove-far") { flagFar.cloth.visible = false; flagFar.lamp.material = mat(0x59636d, { emissive: 0x59636d, ei: 0.3 }); forgottenTag.visible = true; }
        if (step.id === "remove-near") { flagNear.cloth.visible = false; flagNear.lamp.material = mat(0x59636d, { emissive: 0x59636d, ei: 0.3 }); }
        if (step.id === "walk") { leftTool.visible = false; forgottenTag.visible = false; }
        if (step.id === "confirm-clear") repaint(radioScreen, signFace("TRACK 9\nCLEAR", { bg: "#0d1c14", accent: "#59c97b", fg: "#bff7d4", scale: 0.3 }));
      },

      animate(t, dt, session) {
        mechCrew.userData.head.rotation.y = Math.sin(t * 0.5) * 0.4;
        hostler.userData.head.rotation.y = Math.sin(t * 0.6 + 0.6) * 0.4;
        const gg = session?.gauge;
        if (gg && !gg.committed && session.step?.id === "inspection-reading") {
          // readout handled by the step's own gauge config
        }
        const tr = session?.track;
        if (tr && session.step?.id === "task-focus") watchDial.userData.show?.(`${Math.round(tr.v * 100)}%`);
      },
    };
  },
};
