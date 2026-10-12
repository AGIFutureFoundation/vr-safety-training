import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import { box, cyl, ball, torus, group, decal, repaint, signFace, paperFace, mat } from "../../../shared/kit.js";
import { stationPad, holoPanel, holoTag, reg, surfaceTexture, texturedMat, mudflatFace, waterFace, instrument, valveWheel, standingFigure } from "../citykit.js";
import { radio } from "../../../shared/toolkit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Tidal Marsh Channel Restoration Day VR — Marine Ecology &
// Restoration, station five of the ECO1 pack.
//
// A hand-crew day on a generic marsh plain where a new tidal channel is
// being opened by hand: the restoration plan and the permit's work window
// read, waders and vest on, the tide staff read, the flagged access path
// walked, the channel alignment staked, the silt fence post driven, the
// nesting buffer and the buried-line marker found, marsh plugs cut and
// placed and tamped in order, the survey rod held for the shot, spoil
// carried to its zone, the crew called and the day logged. The learner is
// the crew lead. The METHOD of working a marsh by hand is what is taught —
// where feet go, where spoil goes, what stops the work — with no claim
// about any real marsh, bird or season.

const METM_ACCENT = 0x8fa64a;
const METM_CSS = "#8fa64a";
const METM_WARN = "#e8622a";

function metmLog(lines, band = METM_CSS) {
  return (cx, w, h) => {
    cx.fillStyle = "#141a0f"; cx.fillRect(0, 0, w, h); cx.fillStyle = band; cx.fillRect(0, 0, w, 6);
    cx.font = `600 ${Math.round(h * 0.14)}px 'Barlow Condensed', Arial, sans-serif`; cx.textAlign = "left"; cx.textBaseline = "middle";
    cx.fillStyle = "#eef4dc"; cx.fillText("MARSH DAY LOG", w * 0.06, h * 0.2);
    cx.font = `${Math.round(h * 0.1)}px Arial, sans-serif`; cx.fillStyle = "#f4f8ea";
    lines.forEach((l, i) => cx.fillText(l, w * 0.06, h * (0.45 + i * 0.17)));
  };
}

export const SIM_ME_TIDAL_MARSH_CHANNEL_RESTORATION_DAY = {
  id: "me-tidal-marsh-channel-restoration-day",
  index: "605",
  domain: "Environmental",
  trade: "Hand-crew lead on a tidal marsh restoration, opening a channel by hand inside the permit's work window with a monitor watching the nesting buffer",
  category: "Water & Environmental",
  district: "Environmental Monitoring",
  weather: "clear",
  certification: "LIUNA and AFSCME restoration and habitat crews as training bodies; OSHA 29 CFR 1910.132 personal protective equipment for mud, water and hand tools; Section 404 permit conditions for placing and moving material in the marsh; Regional Water Quality Control Board Section 401 conditions on turbidity and spoil; BCDC permit conditions; the U.S. Fish and Wildlife Service and NOAA Fisheries consultation measures that set the work window and the nesting buffer; CDFW oversight of the channel work",
  name: "Tidal Marsh Channel Restoration Day",
  title: simTitle("Tidal Marsh Channel Restoration Day"),
  tagline: "The plan and the window read, waders and vest on, the staff read, the flagged path walked while the tide turns early, the alignment staked, the fence post driven, the buffer flag and the buried-line marker found, plugs cut, placed and tamped in order, the rod held for the shot while a bird lands in the buffer, spoil carried to its zone, the crew called and the day logged",
  accent: METM_ACCENT,
  accentCss: METM_CSS,
  parSeconds: 300,
  footprint: 2.6,
  badge: { id: "channel-by-hand", name: "Channel By Hand", note: "A channel opened inside the window with every boot on the path, every plug in order and every bucket of spoil in its zone" },

  supportLine: "your union hall's member assistance programme — LIUNA or AFSCME, whichever your crew works under — with the employer's employee assistance line behind it",

  game: system({
    name: "Marsh Crew",
    currency: "PLUG",
    ranks: ["Marsh Hand", "Channel Hand", "Crew Lead", "Restoration Lead", "Marsh Certified"],
    badges: [
      { id: "plugs-in-order", name: "Plugs In Order", note: "Cut, placed and tamped in order first time", test: AWARD.stepClean("plug-chain") },
      { id: "marsh-kept", name: "Marsh Kept", note: "Never a hazard, never a boot off the path", test: AWARD.safe },
      { id: "true-staff", name: "True Staff", note: "The staff read inside the working band", test: AWARD.precise(0.72) },
    ],
    challenges: [
      { id: "clean-day", name: "Clean Day", note: "No corrections from the plan to the log", test: AWARD.clean },
      { id: "steady-rod", name: "Steady Rod", note: "The path walked and the rod held without a break", test: AWARD.unbroken },
      { id: "out-before-flood", name: "Out Before The Flood", note: "Day logged inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "off-the-path": "You cut across the marsh plain to the channel instead of walking the flagged path. The plain's surface is a mat of roots that takes a season to heal from one crew's shortcuts, and the flagged path is where the plan agreed with the permit that boots may go; a channel opened by a crew that trampled the marsh around it is a restoration with a footprint the monitoring will find.",
    "into-the-soft-mud": "You stepped into the channel bed to reach the far stake. Channel mud here is soft enough to take a leg to the thigh and hold it while the tide comes back, and a crew member stuck in it is a rescue the day was not planned for; the channel is worked from its banks, with the plank and the rod, and nobody stands in the cut.",
    "spoil-in-the-channel": "You tipped the spoil bucket beside the cut instead of carrying it to the spoil zone. Spoil left at the channel's edge is back in the channel on the first flood, as turbidity the Section 401 conditions count and as the plug of mud the work was opening; every bucket goes to the zone the plan marked, however far it is.",
    "into-the-buffer": "You walked into the flagged nesting buffer to see what the monitor had spotted. The buffer is a line the U.S. Fish and Wildlife Service and CDFW measures drew around a place the crew does not go; the monitor is the one person whose job is to look, and a crew lead inside the buffer is the incident that closes the work window for everyone.",
  },

  lateNotes: {
    "alignment-stake": "The alignment is staked once the path has been walked to the cut — stakes set from the wrong side of the plain are set through it.",
    "plug-cut": "Plugs are cut once the fence post is in — a channel opened before the silt fence is up sends the first flood's mud straight onto the plain.",
    "spoil-bucket": "Spoil is carried once the shot is taken — the rod reads the cut as it is, not as it will be after the next bucket.",
  },

  steps: [
    {
      id: "marsh-plan", kind: "select", target: "marsh-plan-board",
      title: "Read the restoration plan and the permit's work window",
      cue: "Check the channel alignment and its stakes, the spoil zone, the silt fence line, the nesting buffer the monitor holds, and the tide window the permit gives for the day.",
      why: "A hand crew on a marsh works inside three lines drawn before anyone arrived: the alignment the channel follows, the buffer nobody crosses, and the tide window the permit allows. The plan holds all three and the monitor holds the buffer; reading it at the truck is how the lead arrives knowing where every boot and every bucket may go, and when the crew must be back on the levee whatever is left undone.",
    },
    {
      id: "marsh-kit", kind: "sequence", anyOrder: true,
      targets: ["waders-on", "gloves-on", "vest-on"],
      itemNames: { "waders-on": "chest waders with the belt cinched", "gloves-on": "work gloves", "vest-on": "work vest over the waders" },
      title: "Waders, gloves and the vest before the levee",
      cue: "Chest waders with the belt cinched tight, work gloves for the tools and the plugs, and the work vest over everything — on at the truck, not at the water.",
      why: "Waders that fill are an anchor, and the belt is what keeps them from filling when a crew member goes down in a channel; the vest over them is what floats a person whose waders have filled anyway. 29 CFR 1910.132 asks the employer to have looked at this marsh and decided, and this is what the decision looks like — put on at the truck because nobody cinches a belt properly standing in mud.",
    },
    {
      id: "read-staff", kind: "gauge", target: "tide-staff",
      title: "Read the tide staff against the working window",
      cue: "Read the water on the staff at the channel mouth and commit it against the low-water window the permit's tide table gives.",
      why: "The tide table is a prediction and the staff is the water; the crew works to the staff because the wind and the barometer do not read the table. Reading and committing it at the start sets how long the crew has in the cut, and a reading taken now is a decision made on the levee rather than one made late with the tide already in the channel and the tools on the far bank.",
      gauge: { label: "TIDE STAFF", speed: 0.7, green: [0.34, 0.54], readout: (t) => (t < 0.34 ? "still falling — wait" : t <= 0.54 ? "inside the working window" : "flood running — window closing"), missNote: "Outside the working window — read the staff again and start only when the water stands inside the plan's band." },
    },
    {
      id: "walk-path", kind: "track", target: "access-path", seconds: 6,
      title: "Walk the flagged access path to the cut",
      cue: "Lead the crew along the flags at a pace that keeps every boot on the plank and the matting — no long steps, no shortcuts.",
      why: "The path is planked and flagged so the crew's footfalls land on the same strip of marsh every day, and the strip is where the plan agreed with the permit that the marsh would take the damage. A steady pace keeps a crew carrying tools and buckets from long steps onto the root mat or into the soft ground beside the plank; hurrying to beat the tide is how the marsh around a channel gets trampled and a crew member goes in to the knee.",
      track: { start: 0.14, green: [0.4, 0.6], rise: 0.55, fall: 0.45, drift: 0.12, label: "PACE ON THE PLANK", readout: (v) => (v < 0.4 ? "stopped — tide is not waiting" : v > 0.6 ? "hurrying — boots off the plank" : "steady on the flagged plank") },
      holdBreakNote: "The pace broke — hurrying off the plank or stalled. Find the next flag and take it up again.",
    },
    {
      id: "stake-alignment", kind: "drag", target: "alignment-stake",
      title: "Set the alignment stake at the channel's next station",
      cue: "Carry the stake to the next station the plan marks on the alignment and set it at the flag — from the bank, not the cut.",
      why: "The channel follows an alignment surveyed from the plan, and each stake is a station the crew cuts to and the survey shoots back to; a stake set where the cut looked easiest is a channel that wanders off its design gradient and holds water where it should drain. It is set from the bank because the cut's bed is soft, and a stake driven while standing in the bed is driven by somebody who may not get out of it.",
      drag: { to: "station-flag", radius: 0.55, missNote: "Not at the station flag — the stake goes at the flag the plan set, not where the mud looks firm." },
    },
    {
      id: "drive-post", kind: "turn", target: "fence-post-auger",
      title: "Drive the silt fence post at the cut's downslope edge",
      cue: "Turn the post auger until the fence post is seated to its mark, downslope of the cut and inside the fence line the plan drew.",
      why: "The silt fence catches the first flood's mud before it spreads across the plain, and it works only if its posts are seated deep enough to hold a fabric full of wet sediment; a post pushed in by hand leans over on the first tide and the fence lies down. It is driven downslope of the cut, on the line the plan drew, because a fence upslope protects nothing and one placed by eye is in the way of the next stake.",
      turn: { turns: 0.8, label: "POST AUGER", readout: (t) => (t < 0.3 ? "post barely in" : t < 0.85 ? "seating — mark coming down" : "seated to the mark") },
    },
    {
      id: "find-flags", kind: "find", noHint: true,
      targets: ["buffer-flag", "buried-line-marker"],
      itemNames: { "buffer-flag": "the monitor's nesting buffer flag line", "buried-line-marker": "the marker for a buried line crossing the alignment" },
      itemNotes: {
        "buffer-flag": "The line of flags the monitor set this morning around the buffer. Nobody in the crew crosses it, and the monitor moves it if what they see moves; the lead's job is to know where it is today, not where it was on the plan.",
        "buried-line-marker": "A utility marker where something buried crosses the alignment. The plan noted it and the hand crew works the cut to a shallower depth across it — nothing is dug there without the locate ticket the plan references.",
      },
      title: "Find the buffer flags and the buried-line marker",
      cue: "Before the first plug is cut, find the monitor's buffer flag line and the marker where the alignment crosses a buried line.",
      why: "Two lines on the plan are drawn by other people and can move: the buffer is where the monitor says it is today, and the buried line is where the locate ticket says it is, not where the map guesses. A lead who finds both before the crew's tools are in the ground is a lead who never has to explain a crew inside the buffer or a shovel through a cable — the plan referenced both; the ground shows them.",
    },
    {
      id: "plug-chain", kind: "sequence",
      targets: ["plug-cut", "plug-place", "plug-tamp"],
      itemNames: { "plug-cut": "marsh plug cut from the channel bed", "plug-place": "plug set on the bank at the planting flag", "plug-tamp": "plug tamped in and watered" },
      title: "Cut, place and tamp each plug in order",
      cue: "For each plug: cut it whole from the channel bed with the spade, carry it to the planting flag on the bank and set it root-down, then tamp it and water it — one plug at a time.",
      why: "The channel's spoil is the plain's planting stock: a plug cut whole from the bed and set on the bank the same hour is a plant moved, not a plant killed, and the order is what keeps it alive. Cut, then place, then tamp — a plug tamped before it is set is a plug crushed, and one cut and left on the bank while the next is dug is a plug drying in the wind with its roots in the air.",
      outOfOrderNote: "Out of order — cut, place, then tamp. A plug tamped before it is set is crushed, and one left on the bank dries out.",
    },
    {
      id: "rod-hold", kind: "hold", target: "survey-rod", seconds: 5,
      title: "Hold the survey rod plumb on the cut for the shot",
      cue: "Set the rod on the channel bed at the stake, hold it plumb against the bubble for the full count while the instrument reads it.",
      why: "The channel is cut to a gradient, and the only way anyone knows the bed is at grade is the shot taken on a rod held plumb on it; a rod leaning even a little reads high and the crew cuts a bed that ponds. Holding still for the full count is what the instrument needs and what the crew's next hour is planned on — a hurried shot cannot be told from a careful one until the first flood shows where the water stands.",
      holdBreakNote: "The rod came off plumb before the shot was taken — the bed would read high. Set it on the bubble and hold again.",
    },
    {
      id: "carry-spoil", kind: "drag", target: "spoil-bucket",
      title: "Carry the spoil bucket to the spoil zone",
      cue: "Carry the bucket of loose spoil along the plank to the spoil zone the plan marked and tip it inside the zone's flags.",
      why: "What the plugs did not use is spoil, and spoil left at the cut is back in the channel on the first tide as mud and as the turbidity the Section 401 conditions count against the project. The zone is where the plan and the Section 404 permit agreed the material may sit; the walk is long on purpose, because the near bank is the one place the spoil must not be.",
      drag: { to: "spoil-zone", radius: 0.6, missNote: "Not in the spoil zone — the bucket is tipped inside the zone's flags, not on the bank beside the cut." },
    },
    {
      id: "crew-checkin", kind: "select", target: "crew-radio",
      title: "Call the crew and the monitor before the walk out",
      cue: "On the radio: the cut is at grade to the stake, the fence is up, spoil is in the zone, the crew is walking out on the plank, and how everyone is after the early tide and the stop.",
      why: "The monitor watched the buffer all day and the crew watched the cut; the call is where the two accounts meet and where the lead hears whether anyone is cold, cut or shaken before the walk out. An early tide and a stop-work in one day is a hard day, and saying so is part of it — the LIUNA or AFSCME member assistance line is there for whatever the drive home does not settle.",
    },
    {
      id: "day-log", kind: "select", target: "day-log",
      title: "Write the day log for the permit record",
      cue: "Log the staff readings, the stations staked and cut, the fence line, plugs cut and placed, the buffer's position and the stop, the shot, the spoil carried, and the tide's early turn.",
      why: "The Section 404 and Section 401 conditions this channel is being opened under are answered from day logs like this one, and so is the question the monitoring crew will ask in a year about why the channel holds water at one station. It is written on the levee while the marks are in sight, because a log written at the yard records the memory of a cut rather than the cut.",
    },
  ],

  interrupts: [
    {
      id: "tide-turning-early",
      kind: "Tide turning ahead of the table",
      after: "walk-path", delay: 2, seconds: 14,
      alert: "The water at the channel mouth has started back in ahead of the table — the staff is climbing while the crew is still on the plank.",
      cue: "Sound the recall horn so the crew on the far bank starts back now, tools or no tools.",
      target: "recall-horn",
      why: "A marsh plain floods from its channels outward, and a crew on the far side of a cut with the tide coming is a crew whose way back is filling first; the recall is sounded the moment the staff shows the turn, not when the water is at the plank. Tools left on the bank are found on the next low water — a crew member caught on the wrong side of a channel in chest waders is not.",
      missNote: "The crew kept working on the far bank while the channel filled behind them; the walk back was made through water over the plank with tools in both hands, and two people went in to the waist.",
      wrongNote: "Not that. The recall horn is what reaches a crew on the far bank with their heads down — sound it.",
    },
    {
      id: "bird-in-the-buffer",
      kind: "Monitor calls a stop",
      after: "rod-hold", delay: 2, seconds: 14,
      alert: "The monitor is on the radio — a bird has come down inside the buffer and they are calling a stop on the cut.",
      cue: "Raise the stop-work flag and hold the crew where they stand until the monitor clears the work.",
      target: "stop-flag",
      why: "The monitor's stop is the U.S. Fish and Wildlife Service and CDFW measures working as written: the crew stops, stays where it is, and waits, however close to grade the cut is. The flag goes up so every crew member sees the stop without a shout across the plain, and nobody moves toward the buffer to look — the monitor's report is the record, and the crew's stillness is what keeps the window open for tomorrow.",
      missNote: "The crew kept cutting through the monitor's call; the stop was logged as ignored, and the permit's work window was closed for the crew by the agency the next morning.",
      wrongNote: "Not that. The stop-work flag — up, and the crew holds where it stands until the monitor clears it.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.6, METM_ACCENT);

    // ------------------------------------------------------- the marsh plain, the cut, the water
    const mudTex = surfaceTexture((cx, w, h) => mudflatFace(cx, w, h, { base: "#5a5a34", base2: "#46482a", cracks: 18, pools: 3 }), { repeat: 4, px: 256 });
    const plain = box(g, 6.6, 0.04, 6.0, 0, -0.02, -0.4, 0xffffff, { cast: false });
    plain.material = texturedMat(mudTex, { rough: 1, metal: 0, color: 0x9a9a6a });
    const cut = box(g, 0.7, 0.06, 4.0, 0.9, -0.03, -0.6, 0x3a3226, { rough: 1 });
    cut.rotation.y = 0.2;
    const waterTex = surfaceTexture((cx, w, h) => waterFace(cx, w, h, { base: "#2a3a30", mid: "#354a3a", base2: "#222e26" }), { repeat: 3, px: 256 });
    const water = box(g, 6.6, 0.03, 1.6, 0, 0.0, 2.6, 0x354a3a, { cast: false });
    water.material = texturedMat(waterTex, { rough: 0.25, metal: 0.2, color: 0x4a7a5a });
    water.material.transparent = true; water.material.opacity = 0.86;
    const waterHome = water.position.clone();
    // Marsh vegetation tufts.
    for (let i = 0; i < 44; i++) {
      const a = i * 0.71, r = 1.3 + (i % 5) * 0.4;
      const x = Math.cos(a) * r * 1.2, z = -0.5 + Math.sin(a) * r * 0.8;
      if (z > 1.6 || (x > 0.4 && x < 1.5 && z < 1.2)) continue;
      const tuft = cyl(g, 0.02, 0.09, 0.22 + (i % 3) * 0.06, x, 0.12, z, [0x6f7f2a, 0x8a9a3a, 0x5f6f26][i % 3], { rough: 0.95, seg: 5, cast: false });
      tuft.scale.set(1, 1, 0.7);
    }
    const offHit = box(g, 0.6, 0.4, 0.6, -1.9, 0.2, -0.4, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "cut across the plain?", -1.9, 0.6, -0.4, { css: METM_WARN, w: 0.4 });
    reg(hits, offHit, "off-the-path");
    const mudHit = box(g, 0.5, 0.3, 0.6, 0.9, 0.15, -1.6, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "step into the cut?", 0.9, 0.5, -1.6, { css: METM_WARN, w: 0.36 });
    reg(hits, mudHit, "into-the-soft-mud");

    // ------------------------------------------------------- plank path with flags
    const path = group(g);
    for (let i = 0; i < 6; i++) {
      box(path, 0.3, 0.04, 0.9, -1.0 + i * 0.32, 0.02, 1.9 - i * 0.62, 0x6f6248, { rough: 0.85, finish: "brushed" });
      cyl(path, 0.008, 0.008, 0.5, -0.8 + i * 0.32, 0.25, 1.9 - i * 0.62, 0x8a949d, { rough: 0.5, metal: 0.6, seg: 5 });
      box(path, 0.1, 0.07, 0.006, -0.75 + i * 0.32, 0.48, 1.9 - i * 0.62, 0xf06a2b, { rough: 0.6 });
    }
    const pathHit = box(path, 0.5, 0.2, 3.4, -0.2, 0.1, 0.35, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    pathHit.rotation.y = -0.45;
    holoTag(path, "walk the plank", -0.2, 0.4, 0.4, { css: METM_CSS, w: 0.28 });
    reg(hits, pathHit, "access-path");

    // ------------------------------------------------------- stakes, flag, fence post, rod
    const stationFlag = group(g, 1.4, 0, -1.9);
    cyl(stationFlag, 0.008, 0.008, 0.5, 0, 0.25, 0, 0x8a949d, { rough: 0.5, metal: 0.6, seg: 5 });
    box(stationFlag, 0.1, 0.07, 0.006, 0.05, 0.48, 0, 0xf2c14b, { rough: 0.6 });
    const flagRing = torus(stationFlag, 0.2, 0.01, 0, 0.05, 0, METM_ACCENT, { emissive: METM_ACCENT, ei: 1.4, rough: 0.4, cast: false, seg: 6, seg2: 20 });
    flagRing.rotation.x = Math.PI / 2;
    holoTag(stationFlag, "station flag", 0, 0.7, 0, { css: METM_CSS, w: 0.26 });
    reg(hits, stationFlag, "station-flag");
    const stake = group(g, -0.3, 0.3, 0.9);
    box(stake, 0.04, 0.6, 0.04, 0, 0, 0, 0xc9b58c, { rough: 0.9 });
    box(stake, 0.04, 0.05, 0.006, 0, 0.25, 0.022, 0xf06a2b, { rough: 0.6 });
    holoTag(stake, "alignment stake", 0, 0.45, 0, { css: METM_CSS, w: 0.3 });
    reg(hits, stake, "alignment-stake");
    for (let i = 0; i < 3; i++) { box(g, 0.04, 0.5, 0.04, 0.6 + i * 0.15, 0.25, 0.9 - i * 0.9, 0xc9b58c, { rough: 0.9 }); }
    const augerGrp = group(g, 1.8, 0, 0.3);
    cyl(augerGrp, 0.03, 0.03, 0.9, 0, 0.45, 0, 0x8a949d, { rough: 0.5, metal: 0.6, seg: 8 });
    const auger = valveWheel(augerGrp, 0, 1.0, 0, { r: 0.12, color: 0xe8b02e, body: 0x2b3138 });
    holoTag(augerGrp, "post auger", 0, 1.3, 0, { css: METM_CSS, w: 0.22 });
    reg(hits, auger.userData.wheel, "fence-post-auger");
    const fence = group(g, 1.9, 0, -0.5);
    for (let i = 0; i < 3; i++) cyl(fence, 0.02, 0.02, 0.7, 0, 0.35, -0.9 + i * 0.9, 0xc9b58c, { rough: 0.9, seg: 6 });
    box(fence, 0.01, 0.5, 1.8, 0, 0.3, 0, 0x1b1e22, { rough: 0.8, side: 2 });
    const rodGrp = group(g, 0.9, 0, -0.3);
    box(rodGrp, 0.04, 1.6, 0.04, 0, 0.8, 0, 0xd2312b, { rough: 0.6 });
    for (let i = 0; i < 6; i++) box(rodGrp, 0.045, 0.02, 0.045, 0, 0.2 + i * 0.25, 0, 0xf4f6f6, { rough: 0.6, cast: false });
    const rodHold = torus(rodGrp, 0.18, 0.01, 0, 1.1, 0, METM_ACCENT, { emissive: METM_ACCENT, ei: 1.4, rough: 0.4, cast: false, seg: 6, seg2: 20 });
    rodHold.rotation.x = Math.PI / 2;
    holoTag(rodGrp, "survey rod — hold plumb", 0, 1.75, 0, { css: METM_CSS, w: 0.42 });
    reg(hits, rodHold, "survey-rod");
    const level = group(g, -2.4, 0, -1.6);
    for (let i = 0; i < 3; i++) { const leg = cyl(level, 0.015, 0.015, 1.3, Math.cos(i * 2.1) * 0.3, 0.65, Math.sin(i * 2.1) * 0.3, 0xe8b02e, { rough: 0.6, seg: 6 }); leg.rotation.set(Math.sin(i * 2.1) * 0.25, 0, -Math.cos(i * 2.1) * 0.25); }
    box(level, 0.2, 0.12, 0.12, 0, 1.4, 0, 0x2b3138, { rough: 0.5, metal: 0.4 });
    const surveyor = standingFigure(g, -2.4, -1.2, { ry: 0.6, cloth: 0x4a4a3a, vest: 0xf2c14b, atStation: true });
    void surveyor;

    // ------------------------------------------------------- plugs, spoil, zone
    const plugCut = group(g, 1.2, 0, 0.5);
    box(plugCut, 0.22, 0.14, 0.22, 0, 0.07, 0, 0x3a3226, { rough: 1 });
    for (let i = 0; i < 4; i++) cyl(plugCut, 0.01, 0.03, 0.2, (i - 1.5) * 0.05, 0.22, 0, 0x8a9a3a, { rough: 0.95, seg: 4, cast: false });
    holoTag(plugCut, "cut the plug", 0, 0.45, 0, { css: METM_CSS, w: 0.24 });
    reg(hits, plugCut, "plug-cut");
    const plantFlag = group(g, -0.6, 0, -1.4);
    cyl(plantFlag, 0.008, 0.008, 0.4, 0, 0.2, 0, 0x8a949d, { rough: 0.5, metal: 0.6, seg: 5 });
    box(plantFlag, 0.08, 0.06, 0.006, 0.04, 0.38, 0, 0x2b8a5a, { rough: 0.6 });
    const plantRing = torus(plantFlag, 0.16, 0.01, 0, 0.03, 0, 0x2b8a5a, { emissive: 0x2b8a5a, ei: 1.2, rough: 0.4, cast: false, seg: 6, seg2: 18 });
    plantRing.rotation.x = Math.PI / 2;
    holoTag(plantFlag, "place the plug", 0, 0.6, 0, { css: METM_CSS, w: 0.28 });
    reg(hits, plantFlag, "plug-place");
    const tamper = group(g, -0.2, 0, -1.2);
    cyl(tamper, 0.015, 0.015, 0.9, 0, 0.45, 0, 0x8a949d, { rough: 0.5, metal: 0.6, seg: 6 });
    box(tamper, 0.18, 0.04, 0.18, 0, 0.02, 0, 0x2b3138, { rough: 0.7, metal: 0.4 });
    holoTag(tamper, "tamp and water", 0, 1.05, 0, { css: METM_CSS, w: 0.28 });
    reg(hits, tamper, "plug-tamp");
    const bucket = group(g, 0.4, 0, 1.3);
    cyl(bucket, 0.16, 0.13, 0.3, 0, 0.15, 0, 0x2b5aa8, { rough: 0.6, seg: 12 });
    cyl(bucket, 0.14, 0.14, 0.03, 0, 0.3, 0, 0x3a3226, { rough: 1, seg: 12, cast: false });
    holoTag(bucket, "spoil bucket", 0, 0.5, 0, { css: METM_CSS, w: 0.26 });
    reg(hits, bucket, "spoil-bucket");
    const spoilNear = box(g, 0.3, 0.2, 0.3, 1.4, 0.1, 1.0, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "tip it beside the cut?", 1.4, 0.4, 1.0, { css: METM_WARN, w: 0.4 });
    reg(hits, spoilNear, "spoil-in-the-channel");
    const zone = group(g, -2.3, 0, 1.4);
    for (let i = 0; i < 4; i++) { cyl(zone, 0.008, 0.008, 0.4, Math.cos(i * 1.57) * 0.45, 0.2, Math.sin(i * 1.57) * 0.45, 0x8a949d, { rough: 0.5, metal: 0.6, seg: 5 }); box(zone, 0.08, 0.06, 0.006, Math.cos(i * 1.57) * 0.45 + 0.04, 0.38, Math.sin(i * 1.57) * 0.45, 0xf06a2b, { rough: 0.6 }); }
    ball(zone, 0.3, 0, 0.05, 0, 0x3a3226, { rough: 1, seg: 8, seg2: 6 }).scale.set(1.2, 0.35, 1);
    const zoneRing = torus(zone, 0.5, 0.012, 0, 0.05, 0, METM_ACCENT, { emissive: METM_ACCENT, ei: 1.4, rough: 0.4, cast: false, seg: 6, seg2: 24 });
    zoneRing.rotation.x = Math.PI / 2;
    holoTag(zone, "spoil zone", 0, 0.65, 0, { css: METM_CSS, w: 0.22 });
    reg(hits, zone, "spoil-zone");

    // ------------------------------------------------------- buffer, marker, monitor, horn, flag
    const buffer = group(g, 2.4, 0, -2.2);
    for (let i = 0; i < 4; i++) { cyl(buffer, 0.008, 0.008, 0.6, -0.9 + i * 0.6, 0.3, 0, 0x8a949d, { rough: 0.5, metal: 0.6, seg: 5 }); box(buffer, 0.1, 0.07, 0.006, -0.85 + i * 0.6, 0.58, 0, 0xf4f6f6, { rough: 0.6 }); }
    box(buffer, 1.9, 0.004, 0.004, 0, 0.55, 0, 0xf4f6f6, { rough: 0.6, cast: false });
    holoTag(buffer, "nesting buffer — monitor's line", 0, 0.85, 0, { css: METM_CSS, w: 0.56 });
    reg(hits, buffer, "buffer-flag");
    const bufferHit = box(g, 0.6, 0.5, 0.6, 2.6, 0.3, -2.7, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "go in for a look?", 2.6, 0.75, -2.7, { css: METM_WARN, w: 0.34 });
    reg(hits, bufferHit, "into-the-buffer");
    const bird = group(g, 2.4, 0.3, -2.5);
    ball(bird, 0.08, 0, 0, 0, 0x8a8478, { rough: 0.7, seg: 8, seg2: 6 }).scale.set(1.6, 0.8, 0.8);
    ball(bird, 0.04, 0.12, 0.06, 0, 0x8a8478, { rough: 0.7, seg: 6, seg2: 5 });
    bird.visible = false;
    const marker = group(g, 0.7, 0, -2.4);
    cyl(marker, 0.03, 0.03, 0.9, 0, 0.45, 0, 0xe8b02e, { rough: 0.6, seg: 8 });
    decal(marker, 0.06, 0.2, 0, 0.6, 0.031, signFace("LINE", { bg: "#e8b02e", accent: "#1b1e22", fg: "#1b1e22", scale: 0.5 }));
    holoTag(marker, "buried line marker", 0, 1.05, 0, { css: METM_CSS, w: 0.34 });
    reg(hits, marker, "buried-line-marker");
    const monitor = standingFigure(g, 1.6, -2.6, { ry: 2.6, cloth: 0x2f4d5f, vest: 0xf2c14b, atStation: true });
    void monitor;
    const horn = group(g, -1.6, 0.6, 0.8);
    cyl(horn, 0.05, 0.08, 0.14, 0, 0, 0, 0xd2312b, { rough: 0.5, seg: 12 }).rotation.x = Math.PI / 2;
    box(horn, 0.06, 0.16, 0.06, 0, -0.12, -0.05, 0x1b1e22, { rough: 0.6 });
    holoTag(horn, "recall horn", 0, 0.2, 0, { css: "#d2312b", w: 0.24 });
    reg(hits, horn, "recall-horn");
    const stopFlag = group(g, -1.2, 0, -0.2);
    cyl(stopFlag, 0.012, 0.012, 1.4, 0, 0.7, 0, 0x8a949d, { rough: 0.4, metal: 0.6, seg: 6 });
    const stopCloth = box(stopFlag, 0.3, 0.2, 0.006, 0.16, 1.3, 0, 0xd2312b, { rough: 0.6 });
    stopCloth.visible = false;
    holoTag(stopFlag, "stop-work flag", 0, 1.55, 0, { css: "#d2312b", w: 0.3 });
    reg(hits, stopFlag, "stop-flag");
    const crew = standingFigure(g, 1.5, 1.6, { ry: -0.8, cloth: 0x4a4a3a, vest: 0xf2c14b, atStation: true });
    const crewHome = crew.position.clone();
    const staffGrp = group(g, 2.4, 0, 1.8);
    box(staffGrp, 0.06, 1.3, 0.03, 0, 0.65, 0, 0xf4f6f6, { rough: 0.6 });
    for (let i = 0; i < 10; i++) box(staffGrp, 0.06, 0.02, 0.004, 0, 0.1 + i * 0.13, 0.018, i % 2 ? 0x1b1e22 : 0xd2312b, { rough: 0.6, cast: false });
    const staffHead = instrument(staffGrp, 0.14, 1.0, 0, { idle: "-- staff", color: METM_ACCENT, w: 0.13, d: 0.19 });
    holoTag(staffGrp, "tide staff", 0, 1.5, 0, { css: METM_CSS, w: 0.22 });
    reg(hits, staffHead, "tide-staff");

    // ------------------------------------------------------- kit, boards, radio
    const kit = group(g, -2.4, 0, 0.2);
    box(kit, 0.7, 0.5, 0.4, 0, 0.25, 0, 0x6f6248, { rough: 0.8, finish: "brushed" });
    const waders = box(kit, 0.2, 0.5, 0.12, -0.2, 0.75, 0, 0x3a4a2a, { rough: 0.7 });
    const gloves = box(kit, 0.12, 0.05, 0.16, 0.1, 0.55, 0, 0xd8a63a, { rough: 0.7 });
    const vest = box(kit, 0.26, 0.32, 0.1, 0.3, 0.75, -0.1, 0xd2312b, { rough: 0.7 });
    holoTag(kit, "waders · gloves · vest", 0, 1.1, 0, { css: METM_CSS, w: 0.4 });
    reg(hits, waders, "waders-on"); reg(hits, gloves, "gloves-on"); reg(hits, vest, "vest-on");
    const planBoard = holoPanel(g, 0.9, 0.6, -2.5, 1.5, -0.8, (cx, w, h) => {
      cx.fillStyle = "#141a0f"; cx.fillRect(0, 0, w, h); cx.fillStyle = METM_CSS; cx.fillRect(0, 0, w, 6);
      cx.font = `600 ${Math.round(h * 0.1)}px 'Barlow Condensed', Arial, sans-serif`; cx.textAlign = "left"; cx.textBaseline = "middle";
      cx.fillStyle = "#eef4dc"; cx.fillText("RESTORATION PLAN — CHANNEL C-2", w * 0.06, h * 0.13);
      cx.font = `${Math.round(h * 0.072)}px Arial, sans-serif`; cx.fillStyle = "#f4f8ea";
      ["Alignment stations · spoil zone · fence line", "Window: low water per the table, staff rules", "Buffer: monitor's flags, nobody inside",
       "Section 404 · Section 401 · BCDC conditions", "USFWS · NOAA Fisheries · CDFW measures"].forEach((l, i) => cx.fillText(l, w * 0.06, h * (0.3 + i * 0.11)));
    }, { ry: 0.7, accent: METM_ACCENT });
    reg(hits, planBoard, "marsh-plan-board");
    const logPanel = holoPanel(g, 0.5, 0.32, -2.5, 1.3, 2.0, metmLog(["C-2 · staff · stations", "Pending"]), { ry: 0.5, accent: METM_ACCENT });
    reg(hits, logPanel, "day-log");
    const radioGrp = group(g, -1.9, 0.55, 0.3);
    const rad = radio(radioGrp, 0, 0, 0, {});
    holoTag(radioGrp, "crew radio", 0, 0.28, 0, { css: METM_CSS, w: 0.24 });
    reg(hits, rad, "crew-radio");
    for (let i = 0; i < 5; i++) { const b = ball(g, 0.05, -2.4 + i * 0.7, 2.5 + Math.sin(i) * 0.3, -2.9, 0xdfe6ea, { rough: 0.6, seg: 6, seg2: 5 }); b.scale.set(1.6, 0.6, 0.8); }

    const wmap = water.material.map;
    let walking = false, flooding = false;
    return {
      hits,
      spawnLook: new THREE.Vector3(0.6, 0.6, -0.6),
      onStep(step) { if (step?.id === "walk-path") walking = true; },
      onStepComplete(step) {
        if (step.id === "walk-path") walking = false;
        if (step.id === "stake-alignment") stake.position.set(1.4, 0.3, -1.9);
        if (step.id === "drive-post") fence.position.x = 1.6;
        if (step.id === "plug-chain") { plugCut.position.set(-0.6, 0, -1.4); plugCut.scale.set(0.9, 0.7, 0.9); }
        if (step.id === "carry-spoil") { bucket.position.set(-2.3, 0.1, 1.4); bucket.rotation.z = 1.2; }
        if (step.id === "crew-checkin") { rad.userData.show?.("AT GRADE\nWALKING OUT"); crew.position.set(-0.5, 0, 1.7); }
        if (step.id === "day-log") repaint(logPanel.userData.face, metmLog(["C-2 · staff read · station staked · at grade", "Early turn · monitor's stop · spoil in zone"], "#59c97b"));
      },
      onHazard() {},
      onInterrupt(it) {
        if (it.id === "tide-turning-early") { flooding = true; water.position.set(0, 0.0, 1.9); water.scale.z = 1.8; crew.position.set(2.0, 0, -1.0); }
        if (it.id === "bird-in-the-buffer") bird.visible = true;
      },
      onInterruptEnd(it) {
        if (it.id === "tide-turning-early") { flooding = false; water.position.copy(waterHome); water.scale.z = 1; crew.position.copy(crewHome); }
        if (it.id === "bird-in-the-buffer") { if (it.resolved === "answered") stopCloth.visible = true; bird.visible = false; }
      },
      animate(t, dt, session) {
        if (wmap?.offset) { wmap.offset.x = t * 0.003; wmap.offset.y = t * 0.005; }
        if (flooding) water.position.z = 1.9 + Math.sin(t * 2) * 0.08;
        if (walking) crew.position.z = Math.max(-0.5, crew.position.z - dt * 0.15);
        if (bird.visible) bird.position.y = 0.3 + Math.sin(t * 3) * 0.02;
        const step = session?.step;
        if (session?.turn && step?.id === "drive-post") { auger.userData.wheel.rotation.y = session.turn.amount * 5; fence.children[0].position.y = 0.55 - session.turn.amount * 0.2; }
        if (session?.gauge && !session.gauge.committed && step?.id === "read-staff") {
          const gt = session.gauge.t ?? 0;
          repaint(staffHead.userData.screen, signFace(gt < 0.34 ? "falling" : gt <= 0.54 ? "in window" : "flooding", { bg: "#0d1c24", accent: gt >= 0.34 && gt <= 0.54 ? "#59c97b" : "#f2ae14", fg: "#eaf0dc", scale: 0.6 }));
        }
      },
    };
  },
};
