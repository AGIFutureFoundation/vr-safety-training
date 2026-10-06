import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import { box, cyl, ball, group, decal, repaint, signFace, mat } from "../../../shared/kit.js";
import {
  stationPad, holoPanel, holoTag, instrument, standingFigure, surfaceTexture, texturedMat,
  tileFace, blockFace, gratingFace, reg,
} from "../citykit.js";
import { cobotBench } from "../../../shared/equipment.js";
import { teachPendant } from "../../../shared/toolkit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Reviewing a Robot Policy's Evaluation — its own gamified system: Measured, Not Claimed.
//
// ROBOPROG (docs/consoles/ROBOPROG.md, docs/robotics-programme.md): the AI-training specialist's review station. A robot
// policy trained by behaviour cloning from consented demonstrations (COLEARN's col-learn.js: a k-nearest-neighbour policy,
// not a planner) is reviewed before it may run a supervised trial on a generic cobot bench: the dataset card and its consent,
// the lineage from dataset to policy, the held-out evaluation against a random baseline and the scripted expert, the
// safe-practice violations as well as the successes, the plain explanation of a failing episode, then a supervised trial at
// reduced speed with an enabling device and a sign-off that can say "not yet". No success rate, threshold or speed is stated:
// those belong to the release criteria and the cell's risk assessment. ?fault=stale-policy swaps which version was trained on
// revoked data, so the right answer is read from the lineage board, not remembered.

const RPPE_ACCENT = 0xb79cff;

export const SIM_RP_ROBOT_POLICY_EVALUATION_REVIEW = {
  id: "rp-robot-policy-evaluation-review",
  index: "rp-2",
  domain: "Robotics",
  trade: "AI-training specialist and robot safety lead, policy evaluation review — UAW/IAM",
  category: "Manufacturing & Automation",
  district: "robotics-training-centre",
  weather: "overcast",
  certification: "UAW and IAM skilled-trades training as bodies; ANSI R15.06 and ISO 10218 industrial robot safety (the integrated cell and its risk assessment), with ISO/TS 15066 named for collaborative operation; OSHA 29 CFR 1910.212 general requirements for machines and 29 CFR 1910.147 the control of hazardous energy; the bench's written risk assessment, its release criteria and the platform's own consent and dataset-card rules",
  name: "Reviewing a Robot Policy's Evaluation",
  title: simTitle("Reviewing a Robot Policy's Evaluation"),
  tagline: "Deciding whether a learned robot policy may run a supervised trial: the dataset card and its consent read, the lineage traced and a policy built on revoked data caught, held-out results compared with a random baseline and the scripted expert, violations counted as well as successes, a failing episode replayed and explained, and a supervised trial run at reduced speed with an enabling device before anyone signs",
  accent: RPPE_ACCENT,
  accentCss: "#b79cff",
  parSeconds: 330,
  footprint: 2.9,
  badge: { id: "measured-not-claimed", name: "Measured, Not Claimed", note: "Traced the lineage, compared the policy with both baselines on held-out seeds, replayed its failure and signed only what was measured" },

  game: system({
    name: "Measured, Not Claimed",
    currency: "EV",
    ranks: ["Reader", "Reviewer", "Evaluator", "Release Reviewer", "Safety Sign-off"],
    badges: [
      { id: "card-first", name: "Card First", note: "Read the dataset card before the results", test: AWARD.stepClean("dataset-card") },
      { id: "stale-caught", name: "Stale Caught", note: "Found the policy trained on revoked data", test: AWARD.stepClean("find-stale") },
      { id: "steady-enable", name: "Steady Enable", note: "Held the enabling device near band centre", test: AWARD.precise(0.72) },
    ],
    challenges: [
      { id: "quick-review", name: "Inside Par", note: "Complete inside 80% of par", test: AWARD.fast(0.8) },
      { id: "clean-review", name: "Clean Review", note: "Clean run, no corrections", test: AWARD.clean },
    ],
  }),

  supportLine: "your UAW or IAM local's member assistance programme, or the employee assistance line, if a near miss with an automated cell is what stayed with you",

  faults: [{ id: "stale-policy", label: "Lineage: CHECK", step: "find-stale", target: "policy-v3", note: "Today the lineage board shows version 3, not version 2, was trained on the revoked demonstrations. Find the stale policy.", from: "policy-v2", cue: "Find the policy version trained on revoked demonstrations." }],

  hazards: {
    "success-only-hazard": "That signs the release from the success column alone. A policy that finishes the task by cutting through the keep-out zone has a high success rate and an unsafe habit; the violations column is read with the same weight as the successes.",
    "training-seeds-hazard": "That quotes the results on the seeds the policy was trained on. A behaviour-cloning policy can repeat its demonstrations almost perfectly, so only seeds it never saw say anything about how it behaves on a new day.",
    "full-speed-trial-hazard": "That runs the first supervised trial at production speed to see the policy at its best. A first trial is where an untested policy meets a real arm, and the reduced-speed mode in the risk assessment is what keeps a wrong move small.",
    "inside-zone-hazard": "That stands inside the protective zone to watch the gripper close up during the trial. The person supervising a learned policy is the one most likely to be surprised by it, and the zones apply to the reviewer exactly as they do to anyone else.",
  },

  lateNotes: {
    "dataset-card": "The dataset card is read before the results: who consented, how many demonstrations are synthetic, and how many were revoked since the last training.",
    "enable-device": "The enabling device is held in its middle position for the whole trial; letting go or squeezing through stops the arm, and that is the point.",
  },

  interrupts: [
    { id: "person-in-zone", kind: "Person in zone", after: "replay-hold", delay: 3, seconds: 11, alert: "A technician has walked onto the bench's protective-zone tape to fetch a part while the policy's replay is cued on the bench.", cue: "Press the bench e-stop now.", target: "bench-estop-pe", why: "A cued replay can start moving the arm on the next command, and a person on the protective-zone tape is where the arm can reach; stopping the bench before the replay runs costs a minute, and a learned policy has no reason to know the technician is there except the safeguards.", missNote: "The replay stayed cued with a person on the zone tape. Stop the bench first, then clear the zone.", wrongNote: "Not that — a person on the zone tape is answered with the bench e-stop." },
    { id: "explain-mismatch", kind: "Explanation mismatch", after: "trial-track", delay: 3, seconds: 11, alert: "The explanation panel says the policy chose to move because the zone was clear, but the scanner shows a person at the warning tape.", cue: "Pause the trial.", target: "pause-trial", why: "The explanation is built from the features the policy saw, so an explanation that disagrees with the scanner means the policy is acting on a stale or wrong reading of the world; the trial is paused at once, because whatever made it wrong once will make it wrong again.", missNote: "The trial ran on with the explanation and the scanner disagreeing. A policy acting on a wrong picture of the world is paused first and investigated second.", wrongNote: "Not that — a mismatch between the explanation and the scanner is answered by pausing the trial." },
  ],

  steps: [
    { id: "dataset-card", kind: "select", target: "dataset-card", title: "Read the dataset card", cue: "Read the dataset card: who consented, how many demonstrations are synthetic, how many were revoked.", why: "A policy is only as trustworthy as what it learned from, and the dataset card is where that is written down: which demonstrations came from consenting adults, which were synthetic stand-ins from the scripted expert, and which have since been revoked and must no longer be in any policy that runs." },
    { id: "lineage", kind: "select", target: "lineage-board", title: "Trace the lineage", cue: "Trace the lineage board from each dataset to the policy versions trained on it and to their evaluations.", why: "Lineage is what lets a revocation reach the robot: if nobody can say which demonstrations went into which version, a person's withdrawn consent stays baked into a policy that keeps running, and an evaluation cannot be matched to the thing it actually tested." },
    { id: "find-stale", kind: "find", noHint: true, targets: ["policy-v2"], target: "policy-v2", itemNames: { "policy-v2": "policy version trained on revoked demonstrations" }, itemNotes: { "policy-v2": "A policy trained on demonstrations that were later revoked is stale: it is withdrawn from trials and retrained without them, never reviewed for release." }, decoyNotes: { "policy-v3": "The version trained after the revocation was applied. This is the one under review today.", "policy-v1": "An archived early version, already withdrawn. Nothing to flag there." }, title: "Find the stale policy", cue: "Find the policy version trained on revoked demonstrations.", why: "Revoking consent deletes the recordings, but a policy trained on them still carries what it copied, which is why the platform marks dependent policies stale; a reviewer who catches the stale version keeps the promise the consent screen made to the demonstrator." },
    { id: "criteria-gauge", kind: "gauge", target: "criteria-dial", title: "Set the release threshold from the criteria", cue: "Set the dial to the release criteria's threshold and commit when it matches the written value.", why: "The threshold a policy must clear is written down before the results are seen, so the bar cannot drift to meet whatever the policy happened to score; setting it from the criteria sheet, not from memory or from the result, is what makes the decision a test rather than a story.", gauge: { label: "CRITERIA", speed: 0.6, green: [0.44, 0.62], readout: (t) => (t > 0.44 && t < 0.62 ? "matches sheet" : "check sheet"), missNote: "The dial does not match the criteria sheet. Set the threshold from the sheet before reading any result." } },
    { id: "baselines", kind: "sequence", anyOrder: false, targets: ["result-random", "result-expert", "result-policy"], itemNames: { "result-random": "random baseline", "result-expert": "scripted expert", "result-policy": "the learned policy" }, outOfOrderNote: "Out of order — read the random baseline, then the scripted expert, then the policy between them.", title: "Read the results between two baselines", cue: "Read the random baseline, then the scripted expert, then where the policy falls between them.", why: "A success rate means nothing alone: the random baseline shows how much of the task is luck, the scripted expert shows what is possible, and the policy's place between them — all on held-out seeds — is the honest measure of what the demonstrations actually taught." },
    { id: "violations", kind: "select", target: "violations-board", title: "Count the violations", cue: "Read the safe-practice violations per episode alongside the successes.", why: "A learned policy can reach the goal by a route no person would be allowed to take, through a keep-out zone or with an over-force grip, and the violation count is how that shows up; a release decision weighs it as heavily as the success column, because the bench will repeat the habit." },
    { id: "find-fail", kind: "find", noHint: true, targets: ["episode-keepout"], itemNames: { "episode-keepout": "held-out episode where the policy crossed the keep-out zone" }, itemNotes: { "episode-keepout": "One held-out episode crossed the keep-out zone: it is replayed and explained before any trial, and it goes in the review record by name." }, decoyNotes: { "episode-clean": "A held-out episode that finished clean. Nothing to replay there.", "episode-timeout": "An episode that ran out of time without any unsafe move. Noted, not a safety finding." }, title: "Find the failing episode", cue: "Find the held-out episode where the policy crossed the keep-out zone.", why: "Averages hide the one episode that matters most, and a single crossing of the keep-out zone on held-out seeds is a pattern the policy can repeat on the bench; finding it by name is how the review turns a number into something a person can watch and judge." },
    { id: "replay-hold", kind: "hold", target: "replay-pad", seconds: 5, title: "Watch the ghost replay", cue: "Hold at the replay screen while the failing episode plays as a ghost.", why: "Watching the policy's own replay shows what the numbers cannot: the moment it chose the wrong route and what it was near when it did, which is the evidence a reviewer needs before deciding whether more demonstrations, a shield or a different task setup is the fix.", holdBreakNote: "Stepped away before the replay reached the crossing. Hold until it does." },
    { id: "explain-read", kind: "select", target: "explain-panel", title: "Read the plain explanation", cue: "Read the explanation panel: which features of that moment drove the choice.", why: "The explanation is a heuristic built from the policy's own features, not a language model's guess, and reading it against the replay tells the reviewer whether the policy was confused about where the person was or simply copied a demonstrator who cut the corner." },
    { id: "hold-tag", kind: "drag", target: "policy-tag", drag: { to: "hold-slot", radius: 0.4, missNote: "Not placed — set the stale version's tag in the withdrawn slot on the board." }, title: "Withdraw the stale version", cue: "Carry the stale version's tag to the withdrawn slot on the release board.", why: "A stale policy has to be visibly out of reach, not just remembered as bad, so the next person who loads the bench picks from the versions still allowed; moving its tag to the withdrawn slot is the physical form of the stale mark revocation applied." },
    { id: "trial-track", kind: "track", target: "enable-device", seconds: 8, title: "Run the supervised trial on the enabling device", cue: "Hold the enabling device in its middle position while the policy runs at reduced speed from outside the zone.", why: "A first trial of a learned policy is supervised by a person who can stop it with one hand: the three-position enabling device stops the arm if it is released or squeezed through, so holding it steady in the middle is the reviewer's continuous permission for the trial to go on.", track: { start: 0.5, green: [0.4, 0.62], rise: 0.4, fall: 0.45, drift: 0.13, label: "ENABLE", readout: (v) => (v < 0.4 ? "released" : v > 0.62 ? "squeezed through" : "enabled") }, holdBreakNote: "The enabling device left its middle position and the arm stopped. Reset and resume only from outside the zone." },
    { id: "signoff", kind: "sequence", anyOrder: true, targets: ["signoff-second", "signoff-risk", "signoff-rollback"], itemNames: { "signoff-second": "a second reviewer", "signoff-risk": "risk assessment updated for the policy", "signoff-rollback": "rollback to the scripted controller planned" }, title: "Gather the sign-off conditions", cue: "A second reviewer, the risk assessment updated for this policy, and a rollback plan.", why: "Letting a learned policy drive a real arm is a change to the cell, so it carries the same sign-off a change to the cell would: another person who checked the evidence, a risk assessment that now names the policy, and a way back to the scripted controller if it misbehaves." },
    { id: "eval-record", kind: "select", target: "eval-record", title: "Write the evaluation record", cue: "Write the record: dataset, policy version, held-out results, violations, decision.", why: "The record joins dataset, policy and evaluation into one line that anyone can audit later, and it states the decision in plain words — including 'not yet' — so the next reviewer starts from what was measured rather than from what somebody remembers being claimed." },
  ],

  build(root) {
    const ACC = RPPE_ACCENT;
    const hits = {};
    const g = group(root);
    stationPad(g, 2.9, ACC);
    const floor = box(g, 9.2, 0.12, 9.2, 0, 0.06, 0, 0xffffff, { rough: 0.6 });
    floor.material = texturedMat(surfaceTexture((cx, w, h) => tileFace(cx, w, h, { tiles: 8, tile: 0xcbd0d6, grout: "#8b9197" }), { repeat: 5, px: 512 }), { rough: 0.55, metal: 0.05, color: 0xffffff });
    const wall = box(g, 9.2, 4.2, 0.2, 0, 2.1, -7.2, 0xffffff, { rough: 0.75 });
    wall.material = texturedMat(surfaceTexture((cx, w, h) => blockFace(cx, w, h, { rows: 5, cols: 8, block: 0x828b96 }), { repeat: 3, px: 512 }), { rough: 0.75, metal: 0.05, color: 0xffffff });
    const deck = box(g, 1.4, 0.03, 0.8, -3.6, 0.13, 3.4, 0xffffff, { rough: 0.7, cast: false });
    deck.material = texturedMat(surfaceTexture((cx, w, h) => gratingFace(cx, w, h, {}), { repeat: 2, px: 256 }), { rough: 0.7, metal: 0.4, color: 0xffffff });
    holoTag(g, "policy review bay — procedural, generic cobot", 3.4, 3.7, -7.05, { css: "#b79cff", w: 0.6 });
    const rig = cobotBench(g, 0, 0, -3.6, {});
    const P = rig.userData.parts ?? {};
    const pendant = teachPendant(g, -1.3, 0.96, -3.6, { ry: 0.3 });
    // the review wall: three policy version plaques, an episode strip, a replay screen
    const plaque = (id, label, x, colour) => { const p = box(g, 0.5, 0.34, 0.04, x, 2.4, -7.05, colour, { rough: 0.5 }); decal(p, 0.44, 0.28, 0, 0, 0.022, signFace(label, { bg: "#141022", accent: "#b79cff", scale: 0.26 }), { px: 256 }); reg(hits, p, id); return p; };
    const cap = {};
    cap["policy-v1"] = plaque("policy-v1", "POLICY v1\nARCHIVED", -1.2, 0x2a2440);
    cap["policy-v2"] = plaque("policy-v2", "POLICY v2\nLINEAGE: D-03", -0.4, 0x2a2440);
    cap["policy-v3"] = plaque("policy-v3", "POLICY v3\nLINEAGE: D-04", 0.4, 0x2a2440);
    const ep = (id, label, x, colour) => { const e = box(g, 0.34, 0.22, 0.04, x, 1.75, -7.05, colour, { rough: 0.5 }); decal(e, 0.3, 0.18, 0, 0, 0.022, signFace(label, { bg: "#141022", accent: "#ffffff", scale: 0.22 }), { px: 192 }); reg(hits, e, id); cap[id] = e; };
    ep("episode-clean", "EP 7012\nCLEAN", -0.9, 0x2f6f5e);
    ep("episode-keepout", "EP 7031\nKEEP-OUT", -0.45, 0x6a2a2a);
    ep("episode-timeout", "EP 7044\nTIMEOUT", 0.0, 0x5a5a2a);
    const replay = holoPanel(g, 0.8, 0.5, 1.6, 2.1, -6.9, (ctx, w, h) => {
      ctx.fillStyle = "rgba(14,10,24,0.92)"; ctx.fillRect(0, 0, w, h); ctx.fillStyle = "#b79cff"; ctx.fillRect(0, 0, w, 5);
      ctx.fillStyle = "#efeaff"; ctx.font = `600 ${Math.round(h * 0.1)}px 'Barlow Condensed', Arial, sans-serif`; ctx.textAlign = "left"; ctx.textBaseline = "middle";
      ctx.fillText("GHOST REPLAY · HELD-OUT EPISODE", w * 0.06, h * 0.14);
      ctx.strokeStyle = "#f0645b"; ctx.lineWidth = 3; ctx.strokeRect(w * 0.55, h * 0.35, w * 0.3, h * 0.4);
      ctx.fillStyle = "#c9bff0"; ctx.font = `${Math.round(h * 0.07)}px Arial, sans-serif`; ctx.fillText("keep-out zone", w * 0.56, h * 0.82);
      ctx.beginPath(); ctx.moveTo(w * 0.1, h * 0.7); ctx.quadraticCurveTo(w * 0.5, h * 0.3, w * 0.9, h * 0.6); ctx.strokeStyle = "#b79cff"; ctx.stroke();
    }, { accent: ACC });
    reg(hits, replay, "replay-screen");
    const post = (x, z, h) => cyl(g, 0.035, 0.045, h, x, h / 2, z, 0x3b4148, { rough: 0.5, metal: 0.5, seg: 10 });
    const put = (id, label, x, z, shape, colour) => {
      post(x, z, 0.95);
      if (shape === "ball") cap[id] = ball(g, 0.075, x, 1.03, z, colour, { rough: 0.45, seg: 12 });
      else if (shape === "cyl") cap[id] = cyl(g, 0.07, 0.07, 0.12, x, 1.01, z, colour, { rough: 0.5, seg: 12 });
      else if (shape === "meter") cap[id] = instrument(g, x, 0.97, z, { ry: Math.atan2(-x, 3.6 - z), idle: "--", color: ACC });
      else cap[id] = box(g, 0.18, 0.14, 0.12, x, 1.02, z, colour, { rough: 0.5 });
      holoTag(g, label, x, 1.3, z, { css: "#b79cff", w: Math.min(0.6, 0.12 + label.length * 0.018) });
      reg(hits, cap[id], id);
    };
    put("lineage-board", "lineage: dataset → policy → eval", -1.68, 1.47, "box", 0x2a2440);
    put("criteria-dial", "release criteria", -2.09, 0.9, "meter");
    put("result-random", "random baseline", -2.25, 0.24, "ball", 0x6d767e);
    put("result-expert", "scripted expert", -2.13, -0.42, "ball", 0x59c97b);
    put("result-policy", "learned policy", -1.74, -1.01, "ball", 0xb79cff);
    put("violations-board", "violations per episode", -1.14, -1.45, "box", 0xf0645b);
    put("replay-pad", "watch the replay", -0.4, -1.68, "ball", 0x2b2f34);
    put("explain-panel", "plain explanation", 0.4, -1.68, "box", 0x59637a);
    put("bench-estop-pe", "bench e-stop", 1.14, -1.45, "cyl", 0xd2312b);
    put("enable-device", "enabling device", 1.74, -1.01, "meter");
    put("pause-trial", "pause trial", 2.13, -0.42, "cyl", 0xf0b323);
    put("signoff-second", "second reviewer", 2.25, 0.24, "ball", 0x3a78c9);
    put("signoff-risk", "risk assessment updated", 2.09, 0.9, "box", 0xd8a63a);
    put("signoff-rollback", "rollback planned", 1.68, 1.47, "cyl", 0x59c97b);
    // the release board with its withdrawn slot, and the stale version's tag
    const rb = group(g, -3.0, 0, 1.6, 0.9);
    box(rb, 0.7, 0.5, 0.04, 0, 1.25, 0, 0x1b1830, { rough: 0.6 });
    decal(rb, 0.64, 0.12, 0, 1.44, 0.022, signFace("RELEASE BOARD", { bg: "#1b1830", accent: "#b79cff", scale: 0.22 }), { px: 256 });
    cap["hold-slot"] = group(g, -3.0, 0.95, 0.9); post(-3.0, 0.9, 0.95);
    box(cap["hold-slot"], 0.3, 0.06, 0.3, 0, 0.03, 0, 0x2b2f34, { rough: 0.5, metal: 0.4 }); box(cap["hold-slot"], 0.22, 0.01, 0.22, 0, 0.065, 0, 0xf0645b, { emissive: 0xf0645b, ei: 0.4, rough: 0.5 });
    holoTag(g, "withdrawn slot", -3.0, 1.3, 0.9, { css: "#b79cff", w: 0.34 }); reg(hits, cap["hold-slot"], "hold-slot");
    cap["policy-tag"] = box(g, 0.16, 0.1, 0.02, -2.5, 0.96, -2.3, 0xb79cff, { rough: 0.5 });
    box(g, 0.6, 0.05, 0.4, -2.5, 0.9, -2.3, 0x3b4148, { rough: 0.6 });
    reg(hits, cap["policy-tag"], "policy-tag");
    // the dataset card and the record
    const card = holoPanel(g, 0.72, 0.48, -2.9, 1.55, -0.2, (ctx, w, h) => {
      ctx.fillStyle = "rgba(14,10,24,0.92)"; ctx.fillRect(0, 0, w, h); ctx.fillStyle = "#b79cff"; ctx.fillRect(0, 0, w, 5);
      ctx.fillStyle = "#efeaff"; ctx.font = `600 ${Math.round(h * 0.1)}px 'Barlow Condensed', Arial, sans-serif`; ctx.textAlign = "left"; ctx.textBaseline = "middle";
      ctx.fillText("DATASET CARD · D-04", w * 0.06, h * 0.14);
      ctx.font = `${Math.round(h * 0.07)}px Arial, sans-serif`; ctx.fillStyle = "#c9bff0";
      ["Consented adult demonstrations", "Synthetic demos labelled synthetic", "Revoked since D-03: removed", "Stays local; no upload endpoint"].forEach((l, i) => ctx.fillText(l, w * 0.06, h * (0.32 + i * 0.12)));
    }, { ry: 0.9, accent: ACC });
    reg(hits, card, "dataset-card");
    const recSign = group(g, 2.9, 0, 0.4, -0.9);
    box(recSign, 0.44, 0.32, 0.03, 0, 1.2, 0, 0x1b232b, { rough: 0.6 });
    const recFace = decal(recSign, 0.4, 0.28, 0, 1.2, 0.02, signFace("EVAL RECORD\nOPEN", { bg: "#11101f", accent: "#b79cff", scale: 0.26 }), { px: 320 });
    holoTag(recSign, "evaluation record", 0, 1.46, 0, { css: "#b79cff", w: 0.4 });
    reg(hits, recSign, "eval-record");
    // hazard boards
    const hazard = (id, text, x, z, ry) => { const hz = group(g, x, 0, z, ry); cyl(hz, 0.03, 0.03, 0.9, 0, 0.45, 0, 0x2b2f34, { rough: 0.5, seg: 8 });
      const pd = box(hz, 0.26, 0.18, 0.02, 0, 1.0, 0, 0xd2312b, { rough: 0.5 }); decal(pd, 0.22, 0.14, 0, 0, 0.012, signFace(text, { bg: "#5a0f0f", accent: "#ffffff", scale: 0.3 })); reg(hits, pd, id); };
    hazard("success-only-hazard", "SUCCESS\nONLY", -1.22, 2.96, 2.75);
    hazard("training-seeds-hazard", "TRAINING\nSEEDS", 1.22, 2.96, -2.75);
    hazard("full-speed-trial-hazard", "FULL-SPEED\nTRIAL", -3.04, -1.01, 1.25);
    hazard("inside-zone-hazard", "INSIDE\nZONE", 3.04, -1.01, -1.25);
    // a desk with screens and a chair for the reviewers
    box(g, 1.4, 0.05, 0.6, 3.4, 0.76, -4.6, 0x3b4148, { rough: 0.6 });
    for (const sx of [-0.65, 0.65]) box(g, 0.04, 0.74, 0.55, 3.4 + sx, 0.37, -4.6, 0x2b2f34, { rough: 0.6 });
    for (const sx of [-0.35, 0.35]) { box(g, 0.5, 0.3, 0.03, 3.4 + sx, 1.0, -4.8, 0x14121c, { rough: 0.4 }); box(g, 0.05, 0.12, 0.05, 3.4 + sx, 0.83, -4.8, 0x2b2f34, { rough: 0.5 }); }
    box(g, 0.45, 0.06, 0.45, 3.4, 0.46, -4.0, 0x2a2440, { rough: 0.7 });
    cyl(g, 0.03, 0.03, 0.42, 3.4, 0.22, -4.0, 0x2b2f34, { rough: 0.5, seg: 8 });
    for (let i = 0; i < 12; i++) box(g, 0.24, 0.32, 0.04, -4.2 + (i % 6) * 0.3, 1.0 + Math.floor(i / 6) * 0.4, -7.05, [0x3a78c9, 0xd8a63a, 0x6d767e][i % 3], { rough: 0.8 });
    const faultLamp = ball(g, 0.07, 3.4, 2.0, -3.2, 0xd2312b, { emissive: 0xd2312b, ei: 1.6, seg: 12 });
    faultLamp.visible = false;
    const tech = standingFigure(g, 0.9, -2.4, { ry: -0.6, cloth: 0x3a4a5a, helmet: 0xf0b323 });
    tech.visible = false;
    const lead = standingFigure(g, -3.9, 0.8, { ry: 1.2, cloth: 0x2b3138, helmet: 0xf2f2f2 });
    holoTag(lead, "second reviewer", 0, 1.95, 0.15, { css: "#b79cff", w: 0.36 });
    const faultOn = /[?&]fault=stale-policy(&|$)/.test(globalThis.location?.search ?? "");
    const fStep = SIM_RP_ROBOT_POLICY_EVALUATION_REVIEW.steps.find((s) => s.id === "find-stale");
    const fDecl = SIM_RP_ROBOT_POLICY_EVALUATION_REVIEW.faults[0];
    if (fStep) { fStep.targets = [faultOn ? fDecl.target : fDecl.from]; fStep.target = fStep.targets[0]; fStep.cue = faultOn ? fDecl.note : fDecl.cue; }
    if (faultOn) { holoTag(g, "Lineage: CHECK", 3.4, 2.25, -3.2, { css: "#d2312b", w: 0.4 }); }
    faultLamp.visible = faultOn;
    return {
      hits,
      footprint: 2.9,
      spawnLook: new THREE.Vector3(0, 1.3, 3.6),
      onInterrupt(it) {
        if (it.id === "person-in-zone") { tech.visible = true; faultLamp.visible = true; }
        if (it.id === "explain-mismatch") { cap["explain-panel"].material = mat(0xf0645b, { rough: 0.5, emissive: 0xf0645b, ei: 0.8 }); cap["pause-trial"].material = mat(0xf0b323, { rough: 0.5, emissive: 0xf0b323, ei: 0.8 }); }
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "person-in-zone") { faultLamp.visible = false; tech.position.z += 1.6; cap["bench-estop-pe"].material = mat(0x59c97b, { rough: 0.5, emissive: 0x59c97b, ei: 0.3 }); }
        if (it.id === "explain-mismatch") { cap["explain-panel"].material = mat(0x59637a, { rough: 0.5 }); cap["pause-trial"].material = mat(0x59c97b, { rough: 0.5 }); }
      },
      onStepComplete(step) {
        if (step.id === "criteria-gauge") repaint(cap["criteria-dial"].userData.screen, signFace("SET", { bg: "#120f1f", accent: "#59c97b", fg: "#e2dbff", scale: 0.5 }));
        if (step.id === "find-stale") cap[faultOn ? "policy-v3" : "policy-v2"].material = mat(0x6a2a2a, { rough: 0.5 });
        if (step.id === "hold-tag") cap["policy-tag"].material = mat(0xf0645b, { rough: 0.5 });
        if (step.id === "eval-record") repaint(recFace, signFace("EVAL RECORD\nSIGNED", { bg: "#0f1b14", accent: "#59c97b", fg: "#bff7d4", scale: 0.26 }));
      },
      onHazard() {},
      animate(t, dt, session) {
        lead.userData.head.rotation.y = Math.sin(t * 0.5) * 0.3;
        if (P.arm) P.arm.rotation.y = Math.sin(t * 0.3) * 0.35;
        if (pendant) pendant.rotation.y = 0.3;
        const gg = session?.gauge;
        if (gg && !gg.committed && session?.step?.id === "criteria-gauge") repaint(cap["criteria-dial"].userData.screen, signFace(gg.t > 0.44 && gg.t < 0.62 ? "MATCH" : "CHECK", { bg: "#120f1f", accent: gg.t > 0.44 && gg.t < 0.62 ? "#59c97b" : "#f0645b", fg: "#e2dbff", scale: 0.5 }));
      },
    };
  },
};
