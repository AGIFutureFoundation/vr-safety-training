import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, ball, group, decal, repaint, signFace, particles,
} from "../../../shared/kit.js";
import {
  CITY, stationPad, holoPanel, holoTag, toolChest, cone, barrierPanel, instrument,
  standingFigure, surfaceTexture, pavingFace, texturedMat, reg,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Fenceline Dust Monitor VR — Community Environmental Justice,
// station one hundred fifty-five, and the first of four Hunters Point
// Edition stations trained from the public side of the fence rather than
// inside a HAZWOPER crew. A generic parcel under a federal cleanup order,
// sited the way hunters-point.js's opening comment requires: no real site,
// no real person, no clause number nobody here can source.
//
// The job: deploy a continuous PM10 monitor on the sidewalk side of the
// fence, downwind of whatever the work face is doing today, and prove the
// instrument before trusting a single number it prints. A monitor sited
// upwind reads the neighbourhood's own background as if it were the site's;
// a monitor with an unchecked zero or flow reads its own drift as if it
// were dust; an alarm nobody set to the site's own posted action level never
// fires when it should. None of that is the crew's job to catch — it is
// this one.

const FDM_ACCENT = 0xd98c3f;

/** The sidewalk strip the monitor stands on: public concrete, not the
 *  parcel's own gravel — a visual cue that this station never crosses the
 *  fence line drawn across the pad. */
function fdmSidewalkFace(g, w, h) {
  g.fillStyle = "#8b8f92"; g.fillRect(0, 0, w, h);
  for (let i = 1; i < 6; i++) {
    g.strokeStyle = "rgba(30,32,34,0.35)"; g.lineWidth = Math.max(1, w * 0.004);
    g.beginPath(); g.moveTo((w / 6) * i, 0); g.lineTo((w / 6) * i, h); g.stroke();
  }
  g.fillStyle = "rgba(255,255,255,0.05)"; g.fillRect(0, 0, w, h * 0.5);
  g.fillStyle = "rgba(0,0,0,0.06)";
  for (let i = 0; i < 30; i++) g.fillRect(Math.random() * w, Math.random() * h, 3 + Math.random() * 8, 2);
}

export const SIM_FENCELINE_DUST_MONITOR = {
  id: "fenceline-dust-monitor",
  index: "155",
  domain: "Environmental",
  trade: "Community environmental monitor",
  category: "Community Environmental Justice",
  district: "Environmental Monitoring",
  weather: "wind",
  certification: "BAAQMD complaint line and Regulation 6 particulate rules; EPA 40 CFR Part 58 ambient monitor siting, zero and flow QA; the site's own Dust Control Plan and posted action level under DTSC and Regional Water Board oversight; OSHA 29 CFR 1910.120 HAZWOPER for anyone who crosses the fence — not required here, because this monitor stands on the public side of it",
  name: "Fenceline Dust Monitor",
  title: simTitle("Fenceline Dust Monitor"),
  tagline: "Deploying a community PM10 monitor on the public side of a cleanup fence: sited by the wind, levelled and guyed, zeroed and flow-checked, alarmed to the site's own action level, logged, and an exceedance reported without ever crossing the fence",
  accent: FDM_ACCENT,
  accentCss: "#d98c3f",
  parSeconds: 300,
  footprint: 2.4,
  badge: { id: "fenceline-true", name: "Fenceline True", note: "Sited downwind, level and guyed, proven at zero and flow, alarmed to the plan, and an exceedance reported without setting foot past the fence" },

  game: system({
    name: "Fenceline Watch",
    currency: "PM10",
    ranks: ["Sidewalk Hand", "Siting Lead", "Zero Proven", "Watch Authority", "Fenceline Certified"],
    badges: [
      { id: "by-the-wind", name: "By the Wind", note: "Sited downwind of the work face, first time", test: AWARD.stepClean("site-tripod") },
      { id: "never-inside", name: "Never Inside", note: "Never crossed the fence, never muted the alarm, never skipped the zero", test: AWARD.safe },
      { id: "true-numbers", name: "True Numbers", note: "Held the level and flow checks near band centre", test: AWARD.precise(0.7) },
    ],
    challenges: [
      { id: "clean-watch", name: "Clean Watch", note: "No corrections anywhere in the deployment", test: AWARD.clean },
      { id: "zero-held", name: "Zero Held", note: "Never broke the zero check", test: AWARD.unbroken },
      { id: "sidewalk-fast", name: "Sidewalk Fast", note: "Reported inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "cross-fence": "You stepped through the gap in the fence to get a closer look at the work face. A community monitor's whole standing is that the record comes from the public side of the fence — cross it once, unbadged and untrained, and every reading this station takes afterward is defensible only until someone asks how you got close enough to take it.",
    "monitor-blocked": "You set up next to the parked dumpster instead of the open sidewalk stretch. A solid box that close to the inlet does not just block wind from one side, it channels whatever local eddy the dumpster itself throws off straight into the intake — the monitor will read the dumpster's own dead air, not the parcel's plume, and nobody downstream can tell the difference from the number alone.",
    "mute-alarm": "You hit the monitor's own mute button instead of answering the alarm. The strobe and horn are the only thing that turns a number on a screen into something a passerby or a shift lead actually notices — silencing it because the noise is annoying throws away the one automatic protection this sidewalk deployment has, and the plume it was warning about keeps drifting over houses regardless.",
    "skip-zero": "You pressed the bypass instead of running the zero check. A monitor that has never been proven to settle at zero on clean, filtered air carries an unknown offset into every reading it takes afterward, and there is no way to tell from a single number in the field whether an alarm later is real dust off the parcel or just the instrument's own drift finally showing.",
  },

  lateNotes: {
    "tripod-level": "The tripod has to actually be carried to the downwind mark before there's anything to level — a bubble read on a tripod still sitting at the curb proves nothing about where it's about to stand.",
    "flow-cal": "Nothing to calibrate yet — the inlet has to be up at its plan height first, or the flow you're proving is the flow through a mast that isn't even raised.",
    "zero-filter": "The sampler has to be flowing at its rated spec before the zero check means anything — a zero read at the wrong flow is a zero for a different instrument.",
    "alarm-dial": "Read the plan's posted action level before you touch this dial — a threshold set from memory is a threshold nobody can defend if the alarm never fires, or fires on nothing.",
    "data-logger": "Nothing worth logging yet — the alarm has to actually be set to the plan's number first, or the log starts recording a monitor that isn't armed for the one thing it's here to catch.",
  },

  // Both interruptions are armed on a hold or a track step, per the shared
  // interrupt layer — a gauge, select, sequence or turn step resolves in one
  // action, too fast for the fuse to ever catch the learner mid-task.
  interrupts: [
    {
      id: "wind-shift",
      kind: "Wind shift",
      after: "zero-check", delay: 4, seconds: 14,
      alert: "The vane just swung hard onshore — the tripod you sited twenty minutes ago is now on the upwind side of the work face, not the downwind side.",
      cue: "Pull the tripod's quick-release and carry it to the new downwind mark before the zero check means anything on the wrong side of the fence.",
      target: "resite-handle",
      why: "A downwind reading and an upwind reading answer two completely different questions, and a wind shift can swap which one this tripod is actually taking without moving the tripod an inch. Every minute it keeps logging from the wrong side is a minute of data that looks like a background reading when the plan needs it to be the number the site's own dust gets measured against — and there is no way to fix that after the fact, only by re-siting the moment the wind actually turns.",
      missNote: "The tripod sat on the upwind side for the rest of the check, logging the neighbourhood's own background dust as if it were the parcel's — every reading from those minutes is unusable for exactly the exceedance it was placed to catch.",
      wrongNote: "Not that — pull the quick-release and move the tripod itself. Nothing else on this pad puts it back on the downwind side of the fence.",
    },
    {
      id: "dry-cut-exceedance",
      kind: "Dry cut exceedance",
      after: "baseline-watch", delay: 4, seconds: 14,
      alert: "The excavator on the other side of the fence just started a dry cut with no wet-down running, and the live reading is already climbing past the posted action level.",
      cue: "You cannot stop that excavator from the sidewalk — get on the field radio and report the exceedance while it is still climbing, not after it peaks.",
      target: "field-radio",
      why: "A community monitor has no authority to walk onto the parcel and shut down a dry cut — the only lever this station has is the report, and a report made while the plume is still climbing gives the site's own HSO and the Air District a live number to act on instead of a peak that already came and went by the time anyone hears about it. Waiting to see how high it goes before calling it in is choosing a better story over a faster one, and the houses downwind get the difference either way.",
      missNote: "The reading climbed for another full minute before anyone picked up the radio, and by the time the call went out the peak had already passed — the Air District and the site's own HSO both got a report of what happened, not a chance to do anything about it while it was happening.",
      wrongNote: "Not that — get on the field radio. Nothing else at this station reaches a crew you have no authority to walk up to.",
    },
  ],

  steps: [
    {
      id: "read-plan", kind: "select", target: "siting-plan-board",
      title: "Read the site's community air monitoring plan",
      cue: "Check the posted action level, the required inlet height and the siting rule relative to the wind before you touch a tripod.",
      why: "The plan is where the action level actually comes from — the number this whole deployment gets measured against — along with the inlet height and the siting rule that decide where downwind means on this particular pad. A monitor set up from habit instead of this specific plan is defending a threshold nobody posted and a height nobody specified, and neither one holds up the day a reading gets questioned.",
    },
    {
      id: "wind-check", kind: "select", target: "wind-vane",
      title: "Check the wind before you pick a spot",
      cue: "Read the vane's current direction — it decides which stretch of sidewalk is actually downwind of the work face today.",
      why: "Downwind is not a fixed spot on this sidewalk; it is whichever direction the vane says the wind is blowing from, and that can be the opposite stretch from where a monitor stood last week. Picking a spot before reading the vane is picking it from memory, and a memory is exactly the kind of thing a wind shift proves wrong an hour into the shift.",
    },
    {
      id: "site-tripod", kind: "drag", target: "tripod",
      title: "Carry the tripod to the downwind mark",
      cue: "Pull the tripod off the curb and set it on the downwind mark, clear of the dumpster and clear of the fence gap.",
      why: "Where this tripod's feet actually land decides what every reading it takes for the rest of the shift is a reading of — parked too close to a solid object and it reads that object's own dead air, parked upwind and it reads the neighbourhood's background as if it were the site's. The mark is the one spot on this stretch of sidewalk that the wind check just proved is actually downwind of the work face.",
      drag: { to: "downwind-socket", radius: 0.42, missNote: "Not seated on the mark — a tripod parked short of it is still standing in whatever eddy the dumpster or the fence gap throws off, not in the clean downwind line the wind check found." },
    },
    {
      id: "level-tripod", kind: "gauge", target: "tripod-level",
      title: "Level the tripod",
      cue: "Walk each leg out and commit only once the bubble settles dead centre.",
      why: "An inlet that leans even a few degrees samples a slightly different slice of the air passing it than the level, plumb inlet the plan's siting guidance assumes — small on any one reading, but it compounds over a shift of continuous logging into a monitor that was never quite measuring what its own paperwork says it was. Levelling it before anything else touches the tripod is what keeps that assumption true.",
      gauge: {
        label: "TRIPOD LEVEL", speed: 0.55, green: [0.46, 0.54],
        readout: (t) => `${(Math.abs(t - 0.5) * 9).toFixed(1)}° off plumb`,
        missNote: "Not level — the bubble drifted off centre before you committed. Walk a leg back out and settle it dead centre.",
      },
    },
    {
      id: "guy-tripod", kind: "sequence", anyOrder: true,
      targets: ["guy-north", "guy-east", "guy-west"],
      itemNames: { "guy-north": "north guy line", "guy-east": "east guy line", "guy-west": "west guy line" },
      title: "Guy the tripod against the wind",
      cue: "Stake and tension all three guy lines before you trust the tripod to stand through a gust.",
      why: "A level tripod on a windy sidewalk is one gust away from being a tipped one, and a tipped inlet is not sampling the air at the plan's required height any more — it is sampling whatever it fell into. Three lines staked to the ground and tensioned before the inlet ever goes up is what keeps the levelling that just happened from being undone by the first freshening gust of the shift.",
    },
    {
      id: "inlet-height", kind: "turn", target: "inlet-mast",
      title: "Raise the inlet to the plan's height",
      cue: "Wind the mast crank until the inlet locks at the height the plan specifies.",
      why: "PM10 sampling height is not a convenience setting — the plan specifies it because air a person actually breathes at head height behaves differently than air a foot off the ground, and a monitor cranked up short of that height is proving a number for a slice of air nobody downwind is standing in. The crank has to be wound all the way to the lock, not to wherever looks about right.",
      turn: { turns: 0.7, axis: "y", label: "INLET MAST" },
    },
    {
      id: "zero-check", kind: "hold", target: "zero-filter", seconds: 5,
      title: "Run the zero check",
      cue: "Hold the HEPA zero filter on the inlet until the reading settles at zero.",
      why: "A monitor that will not settle at zero on filtered air is reading something about itself, not the parcel, and every number it produces for the rest of the shift carries that same unproven offset. The zero check is the only proof in this whole deployment that a climb above the action level later is dust off the work face and not drift in the instrument nobody checked.",
      holdBreakNote: "Filter lifted early — the reading never actually settled. Hold it on the inlet until it reads zero, not until it looks close.",
    },
    {
      id: "flow-check", kind: "gauge", target: "flow-cal",
      title: "Calibrate the sampler flow",
      cue: "Set the sampler to its rated flow against the calibrator and commit inside the band.",
      why: "The PM10 inlet only cuts particles at ten microns when it is pulling air at its rated flow — run it high or low and the size cut moves with it, so the number this monitor eventually compares to the plan's action level is measuring a different, uncalibrated slice of the dust. An exceedance called off an uncalibrated flow does not hold up if the site ever disputes the reading.",
      gauge: {
        label: "FLOW", speed: 0.7, green: [0.45, 0.6],
        readout: (t) => `${(1.4 + t * 1.2).toFixed(2)} L/min`,
        missNote: "Off the rated flow — the size cut is wrong. Reset the sampler and bring it into the band before you commit.",
      },
    },
    {
      id: "set-alarm", kind: "turn", target: "alarm-dial",
      title: "Set the alarm to the site's own action level",
      cue: "Dial the alarm threshold to the number posted on the site's plan — not a round number, the site's own.",
      why: "This dial is what turns a normal reading into a stop-and-report reading, and the number it gets set to is not this station's to invent — it is whatever the site's own Dust Control Plan posted at the first step. A monitor alarmed to a threshold somebody guessed either never fires when the real level is crossed or fires constantly on ordinary variation, and either failure trains everyone nearby to stop trusting it.",
      turn: { turns: 0.5, axis: "z", label: "ACTION LEVEL" },
    },
    {
      id: "start-logger", kind: "select", target: "data-logger",
      title: "Start the logger with synced time",
      cue: "Sync the clock, then start logging now that the monitor is proven and armed.",
      why: "Every reading this monitor takes from here on is only as useful as the timestamp attached to it — a logger started before the monitor was proven at zero and flow, or one whose clock drifts from the site's own record, turns an exceedance into two different stories nobody downwind or on the crew can settle by comparing notes.",
    },
    {
      id: "baseline-watch", kind: "track", target: "monitor-screen", seconds: 8,
      title: "Watch the reading settle to baseline",
      cue: "Watch the live reading and keep it tracked inside the pre-work baseline band before you sign off on the deployment.",
      why: "This is the number the whole rest of the shift gets measured against, and it only counts as a baseline if it is watched settling there before the work face does anything — a monitor walked away from the moment it's armed has no way to prove a later alarm was the parcel and not just wherever the instrument always happened to sit on a quiet morning.",
      track: {
        start: 0.1, green: [0.38, 0.56], rise: 0.5, fall: 0.46, drift: 0.12, label: "PM10 BASELINE",
        readout: (v) => (v < 0.38 ? "reading low — check the inlet" : v > 0.56 ? "reading high — not yet settled" : "settled at baseline"),
      },
      holdBreakNote: "The reading drifted out of the baseline band — bring it back and hold the watch before you call this a settled number.",
    },
    {
      id: "log-entry", kind: "select", target: "field-log",
      title: "Log the deployment",
      cue: "Record the time, wind direction, siting mark and baseline reading before you leave the tripod unattended.",
      why: "The next monitor, the Air District and the site's own HSO all read the same page, so what this deployment actually measured and where it stood has to go in while it is still true — a tripod on the sidewalk with no entry behind it is a monitor nobody can vouch for if its reading is ever questioned later.",
    },
    {
      id: "exceedance-report", kind: "sequence",
      targets: ["call-airdistrict", "notify-site-contact"],
      itemNames: { "call-airdistrict": "file the Air District complaint", "notify-site-contact": "notify the site's own dust hotline" },
      title: "Report the exceedance",
      cue: "The alarm sounded above the posted action level — file with the Air District, then notify the site's own hotline, in that order.",
      why: "The Air District's complaint line is the record a regulator can act on outside the site's own chain, and it goes first precisely because the site's own hotline is the party whose work caused the reading — filing outside first is what keeps this report a community record instead of something the site alone gets to decide how to characterise before anyone independent hears about it.",
      outOfOrderNote: "The Air District first — call the site's own hotline second, or the only record of this exceedance is the one the site itself controls.",
    },
    {
      id: "walk-line", kind: "find", noHint: true,
      targets: ["loose-guy"],
      itemNames: { "loose-guy": "loose guy line" },
      itemNotes: { "loose-guy": "That guy line has worked loose since it was tensioned — a tripod standing on two tight lines and one slack one is one gust away from the exact lean the level check was supposed to rule out for the whole shift." },
      title: "Walk the deployment before you leave it",
      cue: "Walk around the tripod and click the one line that's gone slack.",
      why: "Tensioning the lines and noticing, an hour later, that one has worked loose are two different skills — this is the last look a monitor gets before it is left running unattended on a public sidewalk for the rest of the shift, and it is the only thing standing between a well-sited deployment and one that quietly leans over by the afternoon.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.4, FDM_ACCENT);

    // -------------------------------------------------------------- ground
    const groundMesh = box(g, 6.2, 0.14, 5.6, 0, 0.07, 0, 0xffffff, { rough: 0.95 });
    groundMesh.material = texturedMat(
      surfaceTexture((cx, w, h) => pavingFace(cx, w, h, { tiles: 5, base: "#55534c", base2: "#48463f", seam: "rgba(0,0,0,0.4)" }), { repeat: 6, px: 512 }),
      { rough: 0.95, metal: 0.02, color: 0xb9b6ab },
    );
    // The public sidewalk strip this whole station stands on.
    const sidewalk = box(g, 2.6, 0.02, 5.4, 1.6, 0.151, 0, 0xffffff, { rough: 0.8, metal: 0.02, cast: false });
    sidewalk.material = texturedMat(
      surfaceTexture((cx, w, h) => fdmSidewalkFace(cx, w, h), { repeat: 3, px: 384 }),
      { rough: 0.8, metal: 0.02, color: 0x9a9d9f },
    );

    // ------------------------------------------------------------- fence line
    for (const z of [-2.0, -0.7, 0.6, 1.9]) barrierPanel(g, 0.3, z, { ry: Math.PI / 2, color: 0xe4622a, w: 1.35 });
    const fenceGap = group(g, 0.3, 0.14, -1.35);
    cone(fenceGap, -0.15, 0); cone(fenceGap, 0.15, 0);
    const gapSpot = cyl(fenceGap, 0.24, 0.24, 0.01, 0, 0.006, 0, 0xd2312b, { rough: 0.6, opacity: 0.32, transparent: true, cast: false });
    holoTag(fenceGap, "gap in the fence", 0, 0.5, 0, { css: "#d2312b", w: 0.4 });
    reg(hits, gapSpot, "cross-fence");

    // ---------------------------------------------------- parcel work face
    const excav = group(g, -1.4, 0.14, -1.3, 0.5);
    box(excav, 0.9, 0.5, 0.7, 0, 0.45, 0, 0xe8b02e, { rough: 0.6 });
    box(excav, 1.15, 0.16, 0.16, 0.75, 0.9, 0, 0xe8b02e, { rough: 0.6 }).rotation.z = 0.4;
    for (const sx of [-0.35, 0.35]) box(excav, 1.0, 0.24, 0.16, 0, 0.12, sx, 0x2b2f34, { rough: 0.8 });
    holoTag(excav, "work face", 0, 1.1, 0, { css: "#d98c3f", w: 0.3 });
    const workDust = particles(g, 50, 0xc9b99a, { size: 0.03, life: 1.1, additive: false, opacity: 0.38 });

    // Houses beyond the sidewalk — the point of the whole watch.
    for (const [z, c] of [[-1.6, 0xd9cbb2], [0.1, 0xc9c0ac], [1.7, 0xd4c2a8]]) {
      const h = group(g, 2.85, 0.14, z);
      box(h, 0.7, 0.6, 0.6, 0, 0.3, 0, c, { rough: 0.95 });
      box(h, 0.8, 0.02, 0.7, 0, 0.62, 0, 0x5a4a3c, { rough: 0.9 });
    }

    // ---------------------------------------------------------- plan board
    const boardPost = group(g, 2.1, 0, -1.8, -0.5);
    const planBoard = holoPanel(boardPost, 0.95, 0.62, 0, 1.3, 0, (ctx, w, h) => {
      ctx.fillStyle = "#2a1a05"; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#d98c3f"; ctx.fillRect(0, 0, w, 6);
      ctx.font = `600 ${Math.round(h * 0.1)}px 'Barlow Condensed', Arial, sans-serif`;
      ctx.textAlign = "left"; ctx.textBaseline = "middle";
      ctx.fillStyle = "#ffe9bf"; ctx.fillText("COMMUNITY AIR MONITORING PLAN", w * 0.05, h * 0.12);
      ctx.font = `${Math.round(h * 0.072)}px Arial, sans-serif`; ctx.fillStyle = "#ffe9bf";
      ["Action level: 150 µg/m³ PM10", "Inlet height: 1.5 m above grade",
       "Siting: downwind of active work face", "Flow: 2.0 L/min, zero each deployment",
       "Never sited past the fence line", "Exceedance: report, do not enter"].forEach((line, i) => {
        ctx.fillText(line, w * 0.05, h * (0.26 + i * 0.115));
      });
    }, { accent: FDM_ACCENT });
    void planBoard;
    reg(hits, boardPost, "siting-plan-board");

    // ------------------------------------------------------------ wind vane
    const vane = group(g, 2.4, 0.14, 1.9);
    cyl(vane, 0.02, 0.02, 1.9, 0, 0.95, 0, CITY.steel, { rough: 0.45, metal: 0.7, seg: 10 });
    const arrow = group(vane, 0, 1.95, 0, 0.6);
    box(arrow, 0.32, 0.02, 0.02, 0, 0, 0, 0xffffff, { rough: 0.5 });
    box(arrow, 0.09, 0.09, 0.01, 0.14, 0, 0, 0xd2312b, { rough: 0.5 });
    const cups = group(vane, 0, 1.68, 0);
    for (let i = 0; i < 3; i++) { const c = group(cups, 0, 0, 0, (i * Math.PI * 2) / 3); box(c, 0.15, 0.01, 0.01, 0.075, 0, 0, CITY.steel, { rough: 0.5, metal: 0.6 }); ball(c, 0.028, 0.15, 0, 0, 0x22262b, { rough: 0.6 }); }
    holoTag(vane, "wind: onshore, freshening", 0, 1.3, 0.05, { css: "#d98c3f", w: 0.5 });
    reg(hits, vane, "wind-vane");

    // -------------------------------------------------------------- tripod
    // Starts parked at the curb; drags to the downwind socket.
    const tripodStart = group(g, 1.2, 0.14, -1.6);
    const tripod = group(tripodStart, 0, 0, 0);
    for (const a of [0, (Math.PI * 2) / 3, (Math.PI * 4) / 3]) {
      const leg = group(tripod, 0, 0, 0, a);
      cyl(leg, 0.018, 0.022, 0.75, 0.22, 0.37, 0, CITY.steel, { rough: 0.45, metal: 0.6, seg: 8 }).rotation.z = 0.55;
    }
    const tripodHead = group(tripod, 0, 0.72, 0);
    cyl(tripodHead, 0.05, 0.05, 0.1, 0, 0, 0, 0x2b2f34, { rough: 0.6, seg: 12 });
    holoTag(tripod, "tripod", 0, 1.0, 0, { css: "#d98c3f", w: 0.28 });
    reg(hits, tripod, "tripod");
    const resiteHandle = box(tripodHead, 0.05, 0.03, 0.09, 0.1, 0.03, 0, 0xf2ae14, { rough: 0.5 });
    decal(resiteHandle, 0.045, 0.025, 0, 0.016, 0, signFace("RESITE", { bg: "#2a1a05", accent: "#f2ae14", scale: 0.5 }));
    reg(hits, resiteHandle, "resite-handle");
    // The bubble level, its own registered target for the level gauge step.
    const levelVial = group(tripodHead, -0.09, 0.04, 0, 0.4);
    cyl(levelVial, 0.012, 0.012, 0.06, 0, 0, 0, 0xbfe8ff, { rough: 0.3, opacity: 0.7, transparent: true, seg: 12 }).rotation.z = Math.PI / 2;
    ball(levelVial, 0.008, 0.01, 0, 0, 0xffffff, { rough: 0.2, emissive: 0x59c97b, ei: 0.4 });
    holoTag(levelVial, "bubble level", 0, 0.12, 0, { css: "#d98c3f", w: 0.32 });
    reg(hits, levelVial, "tripod-level");

    const downwindSocket = group(g, 1.9, 0.15, 0.2);
    hits["downwind-socket"] = downwindSocket;
    const markRing = cyl(g, 0.16, 0.16, 0.006, 1.9, 0.153, 0.2, 0xd98c3f, { rough: 0.6, opacity: 0.4, transparent: true, cast: false, seg: 24 });
    void markRing;

    // Dumpster hazard, parked close to the socket.
    const dumpster = group(g, 2.35, 0.14, 0.55, -0.3);
    box(dumpster, 0.55, 0.42, 0.4, 0, 0.21, 0, 0x5a6a3a, { rough: 0.75, metal: 0.15 });
    box(dumpster, 0.6, 0.04, 0.44, 0, 0.43, 0, 0x475428, { rough: 0.7 });
    holoTag(dumpster, "site here instead?", 0, 0.65, 0, { css: "#d2312b", w: 0.44 });
    reg(hits, dumpster, "monitor-blocked");

    // -------------------------------------------------------- guy anchors
    const guyDefs = [
      { id: "guy-north", x: 1.9, z: -0.35 },
      { id: "guy-east", x: 2.35, z: 0.45 },
      { id: "guy-west", x: 1.5, z: 0.5 },
    ];
    const guyLines = [];
    let looseGuyMarker = null;
    for (const gd of guyDefs) {
      const stake = group(g, gd.x, 0.14, gd.z);
      cyl(stake, 0.012, 0.015, 0.14, 0, 0.07, 0, CITY.darkSteel, { rough: 0.6, metal: 0.5, seg: 6 });
      const line = cyl(stake, 0.004, 0.004, 0.9, 0, 0.45, 0, 0xcfd6da, { rough: 0.6, metal: 0.2, seg: 6, cast: false });
      line.visible = false;
      guyLines.push(line);
      reg(hits, stake, gd.id);
      // The west line's own slack marker — a separate, invisible-until-found
      // hit target from the stake itself, so the sequence step and the later
      // find step are answered by two different registered objects.
      if (gd.id === "guy-west") {
        looseGuyMarker = ball(stake, 0.03, 0, 0.55, 0.05, 0xd2312b, { emissive: 0xd2312b, ei: 0.3, rough: 0.5 });
        looseGuyMarker.visible = false;
        reg(hits, looseGuyMarker, "loose-guy");
      }
    }

    // ---------------------------------------------------------- mast + inlet
    const mastMount = group(g, 1.9, 0.15, 0.2);
    const mastPole = cyl(mastMount, 0.018, 0.018, 0.55, 0, 0.28, 0, CITY.steel, { rough: 0.4, metal: 0.7, seg: 10 });
    const mastCrank = cyl(mastMount, 0.05, 0.05, 0.02, 0.07, 0.06, 0, 0xb8402f, { rough: 0.5, metal: 0.4, seg: 14 });
    mastCrank.rotation.x = Math.PI / 2;
    reg(hits, mastMount, "inlet-mast");
    const inletHead = group(mastMount, 0, 0.55, 0);
    box(inletHead, 0.3, 0.42, 0.24, 0, 0.24, 0, 0xe8eef2, { rough: 0.5, metal: 0.2 });
    const inlet = cyl(inletHead, 0.06, 0.045, 0.1, 0, 0.5, 0, 0x2b2f34, { rough: 0.6, seg: 14 });
    void inlet;
    const monScreen = decal(inletHead, 0.24, 0.1, 0, 0.28, 0.121, signFace("-- µg/m³", { bg: "#2a1a05", accent: "#d98c3f", fg: "#ffe9bf", scale: 0.6 }), { glow: true, ei: 0.8 });
    reg(hits, monScreen, "monitor-screen");
    holoTag(inletHead, "PM10 inlet", 0, 0.5, 0.14, { css: "#d98c3f", w: 0.32 });
    const strobe = ball(inletHead, 0.03, 0.1, 0.42, 0, 0xd2312b, { emissive: 0xd2312b, ei: 0.2, rough: 0.4 });
    const muteBtn = box(inletHead, 0.055, 0.025, 0.018, 0.09, 0.18, 0.13, 0x22262b, { rough: 0.6 });
    decal(muteBtn, 0.05, 0.018, 0, 0, 0.01, signFace("MUTE", { bg: "#22262b", accent: "#d2312b", scale: 0.55 }));
    reg(hits, muteBtn, "mute-alarm");

    // ---------------------------------------------------------- alarm dial
    const dialPost = group(mastMount, 0.12, 0.4, 0.05, 0.5);
    cyl(dialPost, 0.05, 0.05, 0.03, 0, 0, 0, 0x2b2f34, { rough: 0.55, metal: 0.4, seg: 16 });
    const dialNeedle = box(dialPost, 0.03, 0.005, 0.005, 0, 0.02, 0.017, 0xf2ae14, { rough: 0.5 });
    holoTag(dialPost, "alarm threshold", 0, 0.12, 0, { css: "#d98c3f", w: 0.32 });
    reg(hits, dialPost, "alarm-dial");

    // -------------------------------------------------------- calibration
    const chest = toolChest(g, -1.7, 1.5, { ry: 0.6, color: 0x8a5a1a });
    const flowCal = instrument(chest, -0.06, 0.79, 0, { ry: 0.2, idle: "-- L/min", color: FDM_ACCENT, w: 0.12, d: 0.19 });
    holoTag(flowCal, "flow calibrator", 0, 0.16, 0, { css: "#d98c3f", w: 0.3 });
    reg(hits, flowCal, "flow-cal");
    const zeroFilter = group(chest, 0.18, 0.72, 0.05);
    cyl(zeroFilter, 0.05, 0.05, 0.06, 0, 0, 0, 0xffffff, { rough: 0.8, seg: 16 });
    decal(zeroFilter, 0.08, 0.03, 0, 0.031, 0, signFace("HEPA ZERO", { bg: "#ffffff", accent: "#2a1a05", scale: 0.5 })).rotation.x = -Math.PI / 2;
    reg(hits, zeroFilter, "zero-filter");
    const skipBtn = box(chest, 0.08, 0.025, 0.02, -0.28, 0.72, 0.08, 0xd2312b, { rough: 0.55 });
    decal(skipBtn, 0.07, 0.02, 0, 0.014, 0, signFace("SKIP ZERO", { bg: "#2a0c0c", accent: "#ffffff", scale: 0.42 }));
    reg(hits, skipBtn, "skip-zero");

    // -------------------------------------------------------------- logger
    const loggerCab = group(g, 1.3, 0.14, 1.5, -0.3);
    box(loggerCab, 0.4, 0.6, 0.28, 0, 0.3, 0, 0x6f7a83, { rough: 0.6, metal: 0.3 });
    const logger = instrument(loggerCab, 0, 0.55, 0.15, { idle: "LOG: OFF", color: FDM_ACCENT, w: 0.16, d: 0.2 });
    reg(hits, logger, "data-logger");
    holoTag(loggerCab, "data logger", 0, 0.75, 0, { css: "#d98c3f", w: 0.3 });
    const radio = group(loggerCab, 0.25, 0.35, 0.16, 0.3);
    box(radio, 0.08, 0.14, 0.04, 0, 0, 0, 0x2b2f34, { rough: 0.6, metal: 0.3 });
    const radioAntenna = cyl(radio, 0.004, 0.004, 0.12, 0, 0.09, 0, 0x8a939b, { rough: 0.4, metal: 0.7, seg: 6 });
    void radioAntenna;
    holoTag(radio, "field radio", 0, 0.16, 0, { css: "#d98c3f", w: 0.3 });
    reg(hits, radio, "field-radio");

    // ------------------------------------------------------------ field log
    const logBoard = group(g, 1.3, 0.14, 2.0, -0.3);
    box(logBoard, 0.2, 0.26, 0.02, 0, 0.75, 0, 0x1b1e22, { rough: 0.6 });
    decal(logBoard, 0.18, 0.24, 0, 0, 0.011, signFace("FIELD LOG", { bg: "#f3efe4", accent: "#1b1e22", scale: 0.5 }));
    reg(hits, logBoard, "field-log");

    // --------------------------------------------------------- report post
    const reportPost = group(g, 2.6, 0, 2.1, -0.3);
    const phone = group(reportPost, -0.15, 0.9, 0);
    box(phone, 0.08, 0.16, 0.03, 0, 0, 0, 0xe8eef2, { rough: 0.5, metal: 0.2 });
    decal(phone, 0.07, 0.05, 0, 0.05, 0.016, signFace("AIR DISTRICT", { bg: "#0d1c24", accent: "#9fd8c0", scale: 0.4 }));
    holoTag(phone, "Air District line", 0, 0.16, 0, { css: "#d98c3f", w: 0.36 });
    reg(hits, phone, "call-airdistrict");
    const hotlineClip = group(reportPost, 0.15, 0.85, 0, -0.3);
    box(hotlineClip, 0.14, 0.005, 0.2, 0, 0, 0, 0xf3efe4, { rough: 0.9 });
    decal(hotlineClip, 0.12, 0.18, 0, 0.004, 0, signFace("SITE HOTLINE", { bg: "#f3efe4", accent: "#1b1e22", scale: 0.36 })).rotation.x = -Math.PI / 2;
    holoTag(hotlineClip, "site dust hotline", 0, 0.14, 0, { css: "#d98c3f", w: 0.4 });
    reg(hits, hotlineClip, "notify-site-contact");

    // ------------------------------------------------------------- crew figures
    standingFigure(g, 2.7, -1.0, { atStation: true, ry: 2.2, cloth: 0x37505f, vest: FDM_ACCENT, helmet: 0xf2f2f2 });
    standingFigure(g, -0.9, 2.3, { ry: -0.8, cloth: 0x2b3138, vest: 0xe4dc3a, helmet: 0xf2c14b });

    cone(g, -2.4, 2.2, { color: FDM_ACCENT }); cone(g, 2.6, -2.2, { color: FDM_ACCENT });
    const dust = particles(g, 30, 0xc9b99a, { size: 0.025, life: 0.9, additive: false, opacity: 0.24 });

    // -------------------------------------------------------------- live state
    let alarming = false, sited = false, tripodMoved = false;

    return {
      hits,
      spawnLook: new THREE.Vector3(0, 1.1, -0.6),
      footprint: 2.4,
      onStep() {},
      onStepComplete(step) {
        if (step.id === "site-tripod") {
          sited = true;
          tripod.parent.remove(tripod);
          downwindSocket.add(tripod);
          tripod.position.set(0, 0, 0);
        }
        if (step.id === "guy-tripod") { guyLines.forEach((l) => { l.visible = true; }); looseGuyMarker.visible = true; }
        if (step.id === "walk-line") looseGuyMarker.visible = false;
        if (step.id === "inlet-height") { /* mast rises visually via animate() */ }
        if (step.id === "zero-check") repaint(monScreen, signFace("0 µg/m³ ✓", { bg: "#0f1b14", accent: "#59c97b", fg: "#bff7d4", scale: 0.55 }));
        if (step.id === "start-logger") repaint(logger.userData.screen, signFace("LOG: ON 07:58:00", { bg: "#0d1c24", accent: "#59c97b", fg: "#bfeaf7", scale: 0.5 }));
        if (step.id === "baseline-watch") repaint(monScreen, signFace("29 µg/m³", { bg: "#2a1a05", accent: "#d98c3f", fg: "#ffe9bf", scale: 0.6 }));
        if (step.id === "exceedance-report") { alarming = false; strobe.material.emissiveIntensity = 0.2; repaint(monScreen, signFace("31 µg/m³", { bg: "#2a1a05", accent: "#d98c3f", fg: "#ffe9bf", scale: 0.6 })); }
      },
      onInterrupt(it) {
        if (it.id === "wind-shift") { vane.rotation.y += Math.PI * 0.4; }
        if (it.id === "dry-cut-exceedance") {
          alarming = true;
          strobe.material.emissiveIntensity = 2.4;
          repaint(monScreen, signFace("196 µg/m³ !", { bg: "#2a0c0c", accent: "#d2312b", fg: "#ffd0d0", scale: 0.55 }));
        }
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "wind-shift") {
          tripodMoved = true;
          tripod.position.set(0.4, 0, -0.9);
        }
        if (it.id === "dry-cut-exceedance") {
          alarming = false;
          strobe.material.emissiveIntensity = 0.2;
          repaint(monScreen, signFace("64 µg/m³", { bg: "#2a1a05", accent: "#f2ae14", fg: "#ffe9bf", scale: 0.6 }));
        }
      },
      onHazard() {},
      animate(t, dt, session) {
        const step = session?.step;
        cups.rotation.y += dt * 2.5;
        dust.visible = true; dust.userData.step(dt, new THREE.Vector3(-1.4, 0.5, -1.3), 1.0, 0.4, 0.15);
        workDust.visible = true; workDust.userData.step(dt, new THREE.Vector3(-1.4, 0.55, -1.3), 0.9, 0.35, 0.12);
        if (alarming) strobe.material.emissiveIntensity = Math.floor(t * 4) % 2 === 0 ? 2.4 : 0.2;
        else strobe.material.emissiveIntensity = 0.2;
        const gg = session?.gauge;
        if (gg && !gg.committed && step?.id === "level-tripod") {
          repaint(monScreen, signFace(`${(Math.abs(gg.t - 0.5) * 9).toFixed(1)}° tilt`, {
            bg: "#2a1a05", accent: gg.t >= 0.46 && gg.t <= 0.54 ? "#59c97b" : "#f2ae14", fg: "#ffe9bf", scale: 0.55,
          }));
        }
        if (gg && !gg.committed && step?.id === "flow-check") {
          repaint(flowCal.userData.screen, signFace(`${(1.4 + gg.t * 1.2).toFixed(2)} L/min`, { bg: "#0d1c24", accent: gg.t >= 0.45 && gg.t <= 0.6 ? "#59c97b" : "#f2ae14", fg: "#bfeaf7", scale: 0.6 }));
        }
        if (session?.turn && step?.id === "inlet-height") {
          const frac = session.turn.amount / session.turn.required;
          mastPole.scale.y = 1 + frac * 0.7;
          mastPole.position.y = 0.28 * mastPole.scale.y;
          inletHead.position.y = 0.55 * mastPole.scale.y;
          mastCrank.rotation.z = session.turn.amount * Math.PI * 2;
        }
        if (session?.turn && step?.id === "set-alarm") {
          dialNeedle.rotation.z = -Math.PI / 2 + session.turn.amount * Math.PI;
        }
        void sited; void tripodMoved;
      },
    };
  },
};
