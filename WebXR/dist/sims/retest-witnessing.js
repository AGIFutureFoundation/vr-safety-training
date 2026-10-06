import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, ball, slab, group, decal, repaint, signFace, particles,
} from "../../../shared/kit.js";
import {
  CITY, stationPad, holoPanel, holoTag, toolChest, cone, barrierPanel, instrument,
  standingFigure, valveWheel, surfaceTexture, pavingFace, texturedMat, reg,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Retest Witnessing VR — Community Environmental Justice,
// station one hundred sixty-five.
//
// A community witness standing on the public side of the fence for a
// regulator's own retest of a generic parcel under a federal cleanup order —
// not any one parcel's own retest, the procedure a community witness runs at
// any of them. The witness never enters the exclusion zone and never
// samples anything themselves; the whole role is comparing what the crew is
// actually doing against the posted work plan, getting the split sample the
// community is entitled to request in writing rather than on a verbal
// promise, reading the chain-of-custody form rather than trusting a
// signature on it, photographing what was seen, asking anything that comes
// up through the community liaison rather than across the fence, and
// writing the witness statement the same day while the observation is still
// fresh. Every fact this station teaches is procedure, not any one retest's
// actual history.

const RTW_ACCENT = 0xb8862b;

export const SIM_RETEST_WITNESSING = {
  id: "retest-witnessing",
  index: "165",
  domain: "Environmental",
  trade: "Community environmental monitor",
  category: "Community Environmental Justice",
  district: "Environmental Monitoring",
  weather: "overcast",
  certification: "The kind of retest witnessing the Community Pollution Patrol Network trains; EPA QA/QC and chain-of-custody guidance (EPA QA/G-5) for what a split-sample request and a custody form actually have to show; DTSC and the Regional Water Board as the agencies whose own retest this is; BAAQMD's Community Advisory Council process for the questions a witness statement feeds; OSHA 29 CFR 1910.120 HAZWOPER as the separate gate for anyone who enters the exclusion zone, which a community witness never does",
  name: "Retest Witnessing",
  title: simTitle("Retest Witnessing"),
  tagline: "A community witness at a regulator's retest from the public side of the fence: the sampling grid checked against the work plan, the split sample requested in writing, the chain-of-custody form read, a photo log kept, questions routed through the community liaison, and a witness statement written the same day",
  accent: RTW_ACCENT,
  accentCss: "#b8862b",
  parSeconds: 300,
  footprint: 2.3,
  badge: { id: "witness-clean", name: "Witness Clean", note: "The grid checked against the work plan, the split requested in writing, every form read before anything was signed, and the statement filed the same day" },

  game: system({
    name: "Witness Record",
    currency: "OBSERVE",
    ranks: ["Observer", "Grid Checker", "Witness", "Lead Witness", "Community Patrol Certified"],
    badges: [
      { id: "plan-checked", name: "Plan Checked", note: "The work plan read and the grid checked against it, clean", test: AWARD.all(AWARD.stepClean("work-plan"), AWARD.stepClean("grid-check")) },
      { id: "never-crossed", name: "Never Crossed", note: "Witnessed the whole retest from the public side, never through the fence or straight to the crew", test: AWARD.safe },
      { id: "steady-scope", name: "Steady Scope", note: "Held the pan rate on the scope inside the band the whole watch", test: AWARD.precise(0.7) },
    ],
    challenges: [
      { id: "clean-witness", name: "Clean Witness", note: "No corrections anywhere in the watch", test: AWARD.clean },
      { id: "steady-pan", name: "Steady Pan", note: "Never broke the scope pan rate", test: AWARD.unbroken },
      { id: "statement-same-day", name: "Statement Same Day", note: "Witness statement filed inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "cross-fence": "You crossed the exclusion tape to get a closer look at the grid. A community witness's whole standing comes from watching the retest honestly from the public side — the moment a witness is inside the exclusion zone, the crew has a legitimate reason to ask why a member of the public is standing where only trained, badged personnel are allowed.",
    "direct-contact": "You called out straight to the sampling crew instead of routing the question through the liaison. The liaison is the channel for a reason: a question shouted across an active sampling grid can startle a crew mid-sample or get answered off the cuff by someone who isn't the person accountable for what gets told to the community.",
    "accept-verbal-split": "You accepted a verbal promise of a split sample instead of getting the request on the form. A promise made across a fence has nothing behind it once the crew packs up and leaves — the split sample the community is entitled to request only exists once it is written down, with the point numbers it covers, on a form somebody signed.",
    "skip-plan": "You started watching the crew work before reading the posted work plan. Without the plan in hand there is nothing to actually check the crew's grid against — a witness who hasn't read the plan is just watching people dig, with no way to say whether what they're doing matches what was promised.",
  },

  lateNotes: {
    "photo-1": "Nothing worth photographing at that point yet — confirm it against the work plan in the grid check first.",
    "photo-2": "Nothing worth photographing at that point yet — confirm it against the work plan in the grid check first.",
    "photo-3": "Nothing worth photographing at that point yet — confirm it against the work plan in the grid check first.",
    "statement-form": "Nothing to write yet — the statement gets written from a finished day's observations, not started before the watch is over.",
  },

  // Interruptions: see the interrupt layer in shared/game.js. Both are armed
  // on a track/hold step, on purpose — a select, sequence, drag, gauge or
  // turn step resolves in one action, too fast for the fuse to ever find the
  // witness mid-task.
  interrupts: [
    {
      id: "moved-point",
      kind: "Grid point moved",
      after: "pan-scope", delay: 4, seconds: 13,
      alert: "The sampling crew just picked up point 3's flag and reset it half a lane over from where the work plan shows it, without radioing why.",
      cue: "Note the move in your own log now, while you still know which point it was and exactly when it happened.",
      target: "note-discrepancy",
      why: "A witness's whole job is catching the moment the ground stops matching the plan, and a moved grid point that never makes it into the witness's own log is a move nobody outside the crew can ever prove happened — if that point's result later reads differently than the plan expected, there is no independent record of when or why it moved, and the crew's own explanation becomes the only account left.",
      missNote: "The point stayed moved for the rest of the watch with nothing written down about it, and by the time anyone asked why point 3's result looked odd, there was no independent record that it had ever been anywhere but where the plan said it was.",
      wrongNote: "Not that — the log. Write down that point 3 moved and when, before the detail of exactly when it happened slips.",
    },
    {
      id: "sign-unread",
      kind: "Sign this now",
      after: "final-hold", delay: 3, seconds: 13,
      alert: "The liaison hands you a form through the fence window and asks you to sign it right now, before you've had a chance to actually read what's on it.",
      cue: "Read it first — a witness signature means you saw and understood the page, not just that someone handed you a pen.",
      target: "read-before-sign",
      why: "A witness's signature on a regulator's document gets read later as proof that the witness reviewed and agreed with what the page actually says, not proof that a pen was in the witness's hand for a few seconds — signing before reading turns the one signature this whole role exists to make trustworthy into exactly the kind of blind attestation a witness is supposed to prevent.",
      missNote: "The form got signed unread, and when a question about it came up weeks later, the only honest answer the witness could give was that the signature didn't actually mean anyone had checked what it was attached to.",
      wrongNote: "Not that — read the form itself before anything else. The pen can wait until you actually know what you're signing.",
    },
  ],

  steps: [
    {
      id: "gear-up", kind: "sequence", anyOrder: true,
      targets: ["vest", "badge"],
      itemNames: { vest: "hi-vis vest", badge: "community witness badge" },
      title: "Vest and witness badge",
      cue: "Put on the hi-vis vest and clip on the community witness badge before the retest starts.",
      why: "The badge is what tells the crew and the liaison that the person on the public side of the tape is there in the community's own witnessing role, not a bystander who wandered up — and the vest keeps that same person visible on a site with equipment moving on the other side of the fence.",
    },
    {
      id: "work-plan", kind: "select", target: "work-plan-board",
      title: "Read the posted work plan",
      cue: "Read the work plan posted at the fence line: how many points, where they sit, and the split-sample policy, before the crew starts.",
      why: "The work plan is the only thing a witness has to check the retest against — how many points the grid calls for, roughly where they sit, and what the community is entitled to ask for in a split. Watching the crew work without having read it first is watching with nothing to compare it to.",
    },
    {
      id: "position", kind: "drag", target: "witness-post",
      title: "Set up the observation post",
      cue: "Carry the tripod and scope out to the marked public-side observation point, opposite the grid.",
      why: "The marked observation point is where the witness has an honest line of sight to the whole grid without ever being closer to the exclusion line than the plan allows — set the post up anywhere else and half the grid disappears behind the crew's own truck for the rest of the watch.",
      drag: { to: "post-socket", radius: 0.35, missNote: "Not on the marked point — set the post there, or the sight line to the far side of the grid is gone for the rest of the watch." },
    },
    {
      id: "standoff", kind: "gauge", target: "rangefinder",
      title: "Confirm standoff from the exclusion line",
      cue: "Read the rangefinder and commit once you're outside the retest's own posted exclusion distance.",
      why: "A retest crew posts its own exclusion distance for the day's work, separate from the parcel's permanent fence, and confirming it here is what keeps the whole watch honestly on the public side without a witness ever having to guess how close is still close enough.",
      gauge: {
        label: "EXCLUSION", speed: 0.6, green: [0.44, 0.6],
        readout: (t) => `${(3 + t * 7).toFixed(1)} m`,
        missNote: "Not outside the posted exclusion distance yet — read the rangefinder again and commit once it clears the line.",
      },
    },
    {
      id: "focus", kind: "turn", target: "scope-focus",
      title: "Focus the spotting scope",
      cue: "Turn the focus ring until the grid's own point flags read clearly through the scope.",
      why: "A witness on the public side needs the grid's point numbers to come to the scope rather than walking closer to read them — a scope left out of focus is a witness squinting at flags they cannot actually confirm, which is no better than not checking them at all.",
      turn: { turns: 0.5, axis: "y", label: "FOCUS" },
    },
    {
      id: "grid-check", kind: "sequence",
      targets: ["point-1", "point-2", "point-3", "point-4"],
      itemNames: { "point-1": "grid point 1", "point-2": "grid point 2", "point-3": "grid point 3", "point-4": "grid point 4" },
      title: "Check the grid against the work plan, in order",
      cue: "Confirm each flagged point through the scope against the work plan's own numbering, 1 through 4.",
      why: "Checking the points in the plan's own order is what keeps the witness's notes matched to the crew's own numbering — check them out of order and it becomes easy to write point 4's location down against point 2's number.",
      outOfOrderNote: "Not the next point in the plan's own order — checking them out of sequence is how a note ends up written against the wrong point number.",
    },
    {
      id: "pan-scope", kind: "track", target: "scope", seconds: 9,
      title: "Pan the scope across the grid at a steady rate",
      cue: "Keep the pan rate inside the band the whole watch — not so fast you miss something, not so slow you fall behind the crew's own pace.",
      why: "A pan that's too fast sweeps past exactly the moment a point gets moved or a sample gets pulled without ever really registering it; a pan too slow means the witness is still on point 1 while the crew has already moved to point 4. The steady rate is what keeps every part of the grid actually watched across the time the crew is working it.",
      track: {
        start: 0.1, green: [0.4, 0.6], rise: 0.55, fall: 0.5, drift: 0.12, label: "PAN RATE",
        readout: (v) => (v < 0.4 ? "too fast — missing detail" : v > 0.6 ? "too slow — falling behind" : "on pace"),
      },
      holdBreakNote: "Pan rate drifted out of the band — bring it back before something on the grid happens off to the side and goes unwatched.",
    },
    {
      id: "split-request", kind: "select", target: "split-request-form",
      title: "Request the split sample in writing",
      cue: "Fill out the split-sample request form with the point numbers it covers and hand it through the liaison window.",
      why: "The split sample the community is entitled to request only exists once it is written down — the point numbers it covers, the date, who asked — because a request that lives only as a conversation across the fence has nothing behind it once the crew and the liaison both leave for the day.",
    },
    {
      id: "coc-read", kind: "select", target: "coc-form",
      title: "Read the chain-of-custody form",
      cue: "Read the posted chain-of-custody summary and confirm the sample IDs match the grid's own point numbers.",
      why: "A witness cannot verify a lab result, but a witness can verify that the sample ID leaving this site today is actually tied to the point the grid says it came from — reading the form here, while the samples are still on site, is the only chance to catch a mismatch before it travels anywhere.",
    },
    {
      id: "photo-log", kind: "sequence", anyOrder: true,
      targets: ["photo-1", "photo-2", "photo-3"],
      itemNames: { "photo-1": "point 1 photograph", "photo-2": "point 2 photograph", "photo-3": "point 3 photograph" },
      title: "Photograph what the watch confirmed",
      cue: "Photograph the flagged points from the observation post — every one the grid check confirmed.",
      why: "A witness's memory of what the grid looked like fades the same way anyone else's does — the photograph is what lets the witness statement, and anyone who reads it later, see the same grid the witness actually watched, not a description of it from memory.",
    },
    {
      id: "route-question", kind: "select", target: "liaison-window",
      title: "Route a question through the liaison",
      cue: "Bring anything that needs asking to the liaison window rather than calling it across the grid.",
      why: "The liaison is the one person accountable for what gets told to the community about this retest — a question answered informally by whichever crew member happens to be closest to the fence is a question answered by someone with no responsibility for getting it right.",
    },
    {
      id: "final-hold", kind: "hold", target: "review-clip", seconds: 6,
      title: "Hold a final review before the statement",
      cue: "Hold position at the observation post and read your own notes back against the work plan before writing anything up.",
      why: "The watch is only as good as the last check on it — reading the notes back against the plan here, before the statement gets written, is what catches a point number transposed or a photograph that never got taken before either one becomes part of the official record.",
      holdBreakNote: "Broke off the review before it finished — an interrupted read-back isn't a check, it's a glance at the page.",
    },
    {
      id: "statement", kind: "select", target: "statement-form",
      title: "Write and file the witness statement",
      cue: "Write the witness statement from today's notes and file it the same day.",
      why: "A statement written the same day is a statement built from notes still fresh enough to be exact about which point moved, what the crew said through the liaison, and what the photographs show — left even a day, the same statement starts filling in gaps with what seems likely instead of what was actually seen.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.3, RTW_ACCENT);

    // ------------------------------------------------------------- ground
    const groundMesh = box(g, 5.8, 0.14, 5.2, 0, 0.07, 0, 0xffffff, { rough: 0.95 });
    groundMesh.material = texturedMat(
      surfaceTexture((cx, w, h) => pavingFace(cx, w, h, { tiles: 5, base: "#3a3d3a", base2: "#2e312e", seam: "rgba(0,0,0,0.4)" }), { repeat: 6, px: 512 }),
      { rough: 0.92, metal: 0.02, color: 0xb4b8ae },
    );

    // -------------------------------------------------------------- fence + exclusion tape
    const fenceZ = -1.9;
    for (let i = -3; i <= 3; i++) cyl(g, 0.03, 0.03, 1.3, i * 0.85, 0.65, fenceZ, CITY.darkSteel, { rough: 0.5, metal: 0.6, seg: 8 });
    box(g, 5.4, 1.0, 0.05, 0, 0.85, fenceZ, 0x545a52, { rough: 0.8, cast: false });
    box(g, 5.4, 0.04, 0.06, 0, 1.3, fenceZ, CITY.steel, { rough: 0.5, metal: 0.6, cast: false });
    decal(g, 1.1, 0.3, 0, 1.0, fenceZ + 0.031, signFace("RETEST IN PROGRESS — EXCLUSION ZONE", { bg: "#241a08", accent: "#b8862b", scale: 0.3 }), { px: 260 });
    for (const [x, z, ry] of [[-1.6, -1.6, 0.4], [0.2, -1.75, 0.1], [1.7, -1.5, -0.3]]) {
      barrierPanel(g, x, z, { ry, w: 1.1, color: RTW_ACCENT });
    }
    const crossGap = box(g, 0.6, 1.0, 0.2, 2.5, 0.85, fenceZ, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "public side only — do not cross", 2.5, 1.55, fenceZ, { css: "#f0645b", w: 0.75 });
    reg(hits, crossGap, "cross-fence");

    // -------------------------------------------------------- sampling grid
    // Four flagged points on the far side of the fence, in the crew's own
    // work area, with a small sampling crew tending them.
    const gridGrp = group(g, -0.3, 0.14, -2.6);
    const pointSpecs = [["point-1", -1.1, "1"], ["point-2", -0.35, "2"], ["point-3", 0.4, "3"], ["point-4", 1.15, "4"]];
    const flagMeshes = {};
    for (const [id, x, label] of pointSpecs) {
      const p = group(gridGrp, x, 0, 0);
      cyl(p, 0.014, 0.014, 0.4, 0, 0.2, 0, CITY.hiVis, { rough: 0.55, seg: 8 });
      const flag = box(p, 0.09, 0.06, 0.006, 0.045, 0.36, 0, RTW_ACCENT, { rough: 0.6, emissive: RTW_ACCENT, ei: 0.5 });
      const face = decal(p, 0.08, 0.05, 0.045, 0.36, 0.004, signFace(label, { bg: "#241a08", accent: "#b8862b", scale: 0.6 }), { px: 96 });
      flagMeshes[id] = { p, flag, face };
      reg(hits, p, id);
    }
    const crewA = standingFigure(g, -0.9, -2.9, { ry: 1.2, cloth: 0x2b3138, vest: 0xf2c14b, helmet: 0xe4dc3a, atStation: true });
    const crewB = standingFigure(g, 0.6, -3.0, { ry: -1.0, cloth: 0x2b3138, vest: 0xf2c14b, helmet: 0xe4dc3a, atStation: true });
    void crewA; void crewB;
    // Sampling crew's own truck, parked behind the grid.
    const crewTruck = group(g, 0.2, 0.14, -3.4, 0);
    box(crewTruck, 1.4, 0.7, 0.9, 0, 0.5, 0, 0xe8eef2, { rough: 0.5, metal: 0.3 });
    decal(crewTruck, 0.5, 0.14, 0.15, 0.52, 0.451, signFace("RETEST CREW", { bg: "#241a08", accent: "#b8862b", scale: 0.42 }), { px: 200 });

    // -------------------------------------------------------------- observation post
    // The tripod starts staged, folded, near the tool chest, and the "position"
    // step drags it out to the marked observation point opposite the grid —
    // the scope itself only appears once the post is actually set up there.
    const postSocket = group(g, 1.5, 0.14, 1.9, -0.5);
    hits["post-socket"] = postSocket;
    const witnessPost = group(postSocket, 0, 0, 0);
    cyl(witnessPost, 0.02, 0.02, 0.95, 0, 0.475, 0, CITY.steel, { rough: 0.45, metal: 0.6, seg: 10 });
    for (const [sx, sz] of [[-0.15, -0.1], [0.15, -0.1], [0, 0.15]]) cyl(witnessPost, 0.014, 0.014, 0.9, sx, 0.45, sz, CITY.darkSteel, { rough: 0.5, metal: 0.5, seg: 6 });
    const scopeGrp = group(witnessPost, 0, 0.95, 0);
    box(scopeGrp, 0.1, 0.09, 0.28, 0, 0, 0, 0x2b2f34, { rough: 0.4, metal: 0.5 });
    cyl(scopeGrp, 0.045, 0.03, 0.2, 0, 0, 0.24, 0x1b1e22, { rough: 0.35, metal: 0.6, seg: 14 }).rotation.x = Math.PI / 2;
    const scopeReadout = decal(scopeGrp, 0.09, 0.05, 0, 0.07, 0, signFace("-- pts", { bg: "#0d1c24", accent: "#b8862b", fg: "#f0e6cc", scale: 0.55 }), { glow: true, ei: 0.8, px: 160 });
    holoTag(witnessPost, "spotting scope", 0, 1.18, 0, { css: "#b8862b", w: 0.32 });
    reg(hits, witnessPost, "scope");
    const focusRing = valveWheel(scopeGrp, -0.06, 0, 0.06, { r: 0.03, color: RTW_ACCENT, body: 0x2b2f34 });
    reg(hits, focusRing.userData.wheel, "scope-focus");
    witnessPost.visible = false;

    // The folded tripod, staged near the tool chest until it's dragged out.
    const stagedPost = group(g, 2.1, 0.14, 1.3, 0.3);
    cyl(stagedPost, 0.018, 0.018, 0.5, 0, 0.25, 0, CITY.steel, { rough: 0.45, metal: 0.6, seg: 10 });
    box(stagedPost, 0.1, 0.07, 0.22, 0, 0.53, 0, 0x2b2f34, { rough: 0.4, metal: 0.5 });
    holoTag(stagedPost, "observation post", 0, 0.68, 0, { css: "#b8862b", w: 0.4 });
    reg(hits, stagedPost, "witness-post");

    // ------------------------------------------------------------- rangefinder
    const rfPost = group(g, 1.9, 0, 1.5, -0.3);
    cyl(rfPost, 0.018, 0.018, 0.9, 0, 0.45, 0, CITY.steel, { rough: 0.45, metal: 0.6, seg: 10 });
    const rf = instrument(rfPost, 0, 0.92, 0, { ry: 0.4, idle: "-- m", color: RTW_ACCENT, w: 0.12, d: 0.19 });
    holoTag(rfPost, "rangefinder", 0, 1.1, 0, { css: "#b8862b", w: 0.3 });
    reg(hits, rf, "rangefinder");

    // ------------------------------------------------------------- witness table
    const table = group(g, -1.7, 0, 0.7, 0.4);
    box(table, 1.4, 0.05, 0.7, 0, 0.72, 0, 0xb8b0a0, { rough: 0.7 });
    for (const [sx, sz] of [[-0.6, -0.28], [0.6, -0.28], [-0.6, 0.28], [0.6, 0.28]]) box(table, 0.04, 0.72, 0.04, sx, 0.36, sz, 0x8a949d, { rough: 0.5, metal: 0.5 });

    const workPlan = holoPanel(table, 0.95, 0.62, -0.3, 1.2, 0, (ctx, w, h) => {
      ctx.fillStyle = "#241a08"; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#b8862b"; ctx.fillRect(0, 0, w, 6);
      ctx.font = `600 ${Math.round(h * 0.1)}px 'Barlow Condensed', Arial, sans-serif`;
      ctx.textAlign = "left"; ctx.textBaseline = "middle";
      ctx.fillText("RETEST WORK PLAN — POSTED COPY", w * 0.06, h * 0.11);
      ctx.font = `${Math.round(h * 0.072)}px Arial, sans-serif`; ctx.fillStyle = "#f2e6cc";
      ["Grid: 4 points, numbered 1–4", "Exclusion distance: posted at the fence", "Split sample: available on written request",
       "Chain of custody: point ID must match grid", "Questions: through the community liaison only"].forEach((line, i) => {
        ctx.fillText(line, w * 0.06, h * (0.27 + i * 0.135));
      });
    }, { accent: RTW_ACCENT });
    reg(hits, workPlan, "work-plan-board");

    const vest = group(table, 0.35, 0, -0.15, 0.4);
    box(vest, 0.2, 0.05, 0.16, 0, 0.75, 0, CITY.hiVis, { rough: 0.75 });
    holoTag(vest, "hi-vis vest", 0, 0.85, 0, { css: "#b8862b", w: 0.3 });
    reg(hits, vest, "vest");
    const badge = group(table, 0.55, 0, -0.05, -0.2);
    box(badge, 0.09, 0.12, 0.008, 0, 0.75, 0, 0xe8e2d2, { rough: 0.6 });
    decal(badge, 0.07, 0.1, 0, 0.75, 0.005, signFace("WITNESS", { bg: "#f3efe4", accent: "#1b1e22", scale: 0.4 }), { px: 120 });
    holoTag(badge, "witness badge", 0, 0.86, 0, { css: "#b8862b", w: 0.32 });
    reg(hits, badge, "badge");

    // The observation-log stand where a moved point gets noted.
    const logStand = group(table, -0.45, 0, 0.2, -0.2);
    box(logStand, 0.16, 0.015, 0.22, 0, 0.73, 0, 0xe8e2d2, { rough: 0.85 });
    decal(logStand, 0.13, 0.18, 0, 0.738, 0, signFace("OBSERVATION LOG", { bg: "#f3efe4", accent: "#1b1e22", scale: 0.32 }), { px: 160 }).rotation.x = -Math.PI / 2;
    holoTag(logStand, "note a discrepancy", 0, 0.85, 0, { css: "#b8862b", w: 0.44 });
    reg(hits, logStand, "note-discrepancy");

    // ------------------------------------------------------------- liaison window
    const liaisonPost = group(g, 0.5, 0, -0.2, 0.2);
    box(liaisonPost, 0.9, 1.4, 0.1, 0, 0.7, 0, 0x53585e, { rough: 0.6, metal: 0.3, cast: false });
    const liaisonWindow = box(liaisonPost, 0.6, 0.5, 0.02, 0, 0.9, 0.06, 0x9fc3d8, { rough: 0.25, opacity: 0.4, transparent: true, cast: false });
    holoTag(liaisonPost, "community liaison", 0, 1.55, 0.06, { css: "#b8862b", w: 0.44 });
    reg(hits, liaisonWindow, "liaison-window");
    const liaison = standingFigure(g, 0.6, -0.9, { ry: 3.1, cloth: 0x6f5a3f, vest: 0x9fc3d8, helmet: 0xf2f2f2 });
    void liaison;

    // The split-sample request form and the chain-of-custody form, at the
    // liaison window.
    const splitForm = group(liaisonPost, -0.25, 0.72, 0.09);
    box(splitForm, 0.16, 0.008, 0.22, 0, 0, 0, 0xe8e2d2, { rough: 0.85 });
    decal(splitForm, 0.13, 0.18, 0, 0.005, 0, signFace("SPLIT SAMPLE REQUEST", { bg: "#f3efe4", accent: "#1b1e22", scale: 0.3 }), { px: 160 }).rotation.x = -Math.PI / 2;
    holoTag(splitForm, "request the split", 0, 0.1, 0, { css: "#b8862b", w: 0.4 });
    reg(hits, splitForm, "split-request-form");
    const cocForm = group(liaisonPost, 0.25, 0.72, 0.09);
    box(cocForm, 0.16, 0.008, 0.22, 0, 0, 0, 0xe8e2d2, { rough: 0.85 });
    decal(cocForm, 0.13, 0.18, 0, 0.005, 0, signFace("CHAIN OF CUSTODY", { bg: "#f3efe4", accent: "#1b1e22", scale: 0.32 }), { px: 160 }).rotation.x = -Math.PI / 2;
    holoTag(cocForm, "chain of custody", 0, 0.1, 0, { css: "#b8862b", w: 0.36 });
    reg(hits, cocForm, "coc-form");

    // The verbal-promise hazard prop: a handshake icon on a scrap of paper,
    // never the written request itself.
    const verbalProp = group(liaisonPost, 0, 0.72, -0.09, 0.4);
    box(verbalProp, 0.1, 0.006, 0.07, 0, 0, 0, 0xe8e2d2, { rough: 0.85 });
    holoTag(verbalProp, "just take their word for it?", 0, 0.08, 0, { css: "#d2312b", w: 0.55 });
    reg(hits, verbalProp, "accept-verbal-split");

    // The form the liaison hands over unread — the "sign-unread" interrupt's
    // target, plus its own reading lamp for the correct response.
    const readingLamp = group(table, -0.15, 0, 0.28, 0);
    cyl(readingLamp, 0.01, 0.01, 0.18, 0, 0.82, 0, CITY.steel, { rough: 0.4, metal: 0.7, seg: 8 });
    ball(readingLamp, 0.03, 0, 0.91, 0, RTW_ACCENT, { emissive: RTW_ACCENT, ei: 1.4, seg: 10 });
    holoTag(readingLamp, "read it first", 0, 1.0, 0, { css: "#b8862b", w: 0.34 });
    reg(hits, readingLamp, "read-before-sign");
    // The unread form the liaison thrusts across — hidden until the
    // "sign-unread" interrupt fires, so the scene actually shows the pressure
    // the alert describes rather than just captioning it.
    const unreadForm = group(table, 0.02, 0, 0.3, 0.15);
    box(unreadForm, 0.15, 0.006, 0.2, 0, 0.735, 0, 0xf3efe4, { rough: 0.8 });
    decal(unreadForm, 0.12, 0.15, 0, 0.739, 0, signFace("SIGN HERE", { bg: "#f3efe4", accent: "#d2312b", scale: 0.4 }), { px: 140 }).rotation.x = -Math.PI / 2;
    unreadForm.visible = false;

    // ------------------------------------------------------------- camera bench
    const camBench = group(g, 1.5, 0, 0.6, -0.3);
    box(camBench, 1.0, 0.5, 0.4, 0, 0.25, 0, 0x53585e, { rough: 0.6, metal: 0.3 });
    const photoSpecs = [["photo-1", -0.3], ["photo-2", 0.0], ["photo-3", 0.3]];
    const cams = {};
    for (const [id, dx] of photoSpecs) {
      const c = group(camBench, dx, 0.53, 0);
      box(c, 0.1, 0.06, 0.075, 0, 0, 0, 0x1b1e22, { rough: 0.4, metal: 0.4 });
      cyl(c, 0.022, 0.026, 0.045, 0, 0, 0.05, 0x2b2f34, { rough: 0.35, metal: 0.5, seg: 10 }).rotation.x = Math.PI / 2;
      cams[id] = c;
      reg(hits, c, id);
    }
    holoTag(camBench, "photo log", 0, 0.6, 0, { css: "#b8862b", w: 0.28 });

    // ------------------------------------------------------------- review + statement
    const reviewBench = group(g, -1.9, 0, 1.7, 0.4);
    box(reviewBench, 0.9, 0.5, 0.36, 0, 0.25, 0, 0x53585e, { rough: 0.6, metal: 0.3 });
    const reviewClip = group(reviewBench, -0.2, 0.53, 0);
    box(reviewClip, 0.16, 0.02, 0.22, 0, 0, 0, 0x2f6f4a, { rough: 0.6 });
    holoTag(reviewClip, "hold for a final review", 0, 0.1, 0, { css: "#b8862b", w: 0.5 });
    reg(hits, reviewClip, "review-clip");
    const statementForm = group(reviewBench, 0.22, 0.53, 0);
    box(statementForm, 0.16, 0.008, 0.22, 0, 0, 0, 0xe8e2d2, { rough: 0.85 });
    decal(statementForm, 0.13, 0.18, 0, 0.005, 0, signFace("WITNESS STATEMENT", { bg: "#f3efe4", accent: "#1b1e22", scale: 0.3 }), { px: 160 }).rotation.x = -Math.PI / 2;
    holoTag(statementForm, "witness statement", 0, 0.1, 0, { css: "#b8862b", w: 0.4 });
    reg(hits, statementForm, "statement-form");

    // The "skip-plan" bypass button, on the witness table beside the work plan.
    const skipBtn = box(table, 0.09, 0.03, 0.05, -0.55, 0.75, 0.05, 0xd2312b, { rough: 0.5 });
    decal(skipBtn, 0.08, 0.025, 0, 0.016, 0, signFace("SKIP PLAN", { bg: "#2a0c0c", accent: "#ffffff", scale: 0.5 }), { px: 140 });
    holoTag(table, "start watching without it?", -0.55, 0.86, 0.05, { css: "#d2312b", w: 0.55 });
    reg(hits, skipBtn, "skip-plan");

    // The "direct-contact" hazard: a spot at the fence line where shouting
    // across to the crew, rather than through the liaison, is the shortcut.
    const shoutSpot = box(g, 0.4, 0.6, 0.2, -0.3, 0.5, -1.7, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "call across the fence?", -0.3, 0.9, -1.7, { css: "#d2312b", w: 0.5 });
    reg(hits, shoutSpot, "direct-contact");

    // ------------------------------------------------------------- dressing
    cone(g, -2.2, -1.5, { color: RTW_ACCENT }); cone(g, 2.2, -1.5, { color: RTW_ACCENT });
    toolChest(g, 2.1, 1.6, { ry: -0.6, color: 0x8a5f2f });
    const dust = particles(g, 22, 0xbfc6cc, { size: 0.045, life: 1.6, additive: false, opacity: 0.12 });

    return {
      hits,
      spawnLook: new THREE.Vector3(0, 1.1, 0.4),
      onStep() {},
      onStepComplete(step) {
        if (step.id === "position") { stagedPost.visible = false; witnessPost.visible = true; }
        if (step.id === "focus") repaint(scopeReadout, signFace("READY", { bg: "#0d1c24", accent: "#59c97b", fg: "#f0e6cc", scale: 0.55 }));
        if (step.id === "grid-check") for (const id of Object.keys(flagMeshes)) repaint(flagMeshes[id].face, signFace(pointSpecs.find((p) => p[0] === id)[2], { bg: "#0d2416", accent: "#59c97b", scale: 0.6 }), { px: 96 });
        if (step.id === "split-request") repaint(scopeReadout, signFace("SPLIT REQ'D", { bg: "#0d1c24", accent: "#59c97b", fg: "#f0e6cc", scale: 0.42 }));
        if (step.id === "statement") repaint(scopeReadout, signFace("FILED", { bg: "#0d1c24", accent: "#59c97b", fg: "#f0e6cc", scale: 0.55 }));
      },
      onInterrupt(it) {
        if (it.id === "moved-point") {
          const s = flagMeshes["point-3"];
          s.p.position.x += 0.45;
        }
        if (it.id === "sign-unread") {
          unreadForm.visible = true;
          readingLamp.children[1].material.emissiveIntensity = 3.2;
        }
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "moved-point") {
          const s = flagMeshes["point-3"];
          s.p.position.x -= 0.45;
        }
        if (it.id === "sign-unread") {
          unreadForm.visible = false;
          readingLamp.children[1].material.emissiveIntensity = 1.4;
        }
      },
      onHazard() {},
      animate(t, dt, session) {
        dust.visible = true; dust.userData.step(dt, new THREE.Vector3(0, 0.5, 0), 0.02, 1.2, 0.08);
        const gg = session?.gauge;
        if (gg && !gg.committed && session.step?.id === "standoff") {
          repaint(rf.userData.screen, signFace(`${(3 + gg.t * 7).toFixed(1)} m`, {
            bg: "#1c1204", accent: gg.t >= 0.44 && gg.t <= 0.6 ? "#59c97b" : "#f2ae14", fg: "#f2e6cc", scale: 0.55,
          }));
        }
        if (session?.track && session.step?.id === "pan-scope") {
          const v = session.track.v;
          repaint(scopeReadout, signFace(v < 0.4 ? "TOO FAST" : v > 0.6 ? "TOO SLOW" : "ON PACE", {
            bg: "#0d1c24", accent: v >= 0.4 && v <= 0.6 ? "#59c97b" : "#f2ae14", fg: "#f0e6cc", scale: 0.42,
          }));
        }
        if (session?.step?.id === "focus" && session.turn) {
          focusRing.userData.wheel.rotation.z = session.turn.amount * Math.PI * 2;
        }
      },
    };
  },
};
