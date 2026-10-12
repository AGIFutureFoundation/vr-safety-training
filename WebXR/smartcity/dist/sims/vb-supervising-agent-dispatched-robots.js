import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import { box, cyl, ball, group, decal, repaint, signFace, mat } from "../../../shared/kit.js";
import {
  stationPad, holoPanel, holoTag, instrument, standingFigure, surfaceTexture, texturedMat,
  tileFace, blockFace, gratingFace, reg,
} from "../citykit.js";
import { cobotBench } from "../../../shared/equipment.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Supervising Robots Dispatched by Software Agents — its own gamified system: The Governor Holds.
//
// VBRIDGE (docs/consoles/VBRIDGE.md, docs/virtuals-bridge.md): a human supervisor reviews a job that an external software
// agent has sent to a robot site, and decides whether the site's agent may run it — on the SIMULATED robot only. The station
// teaches the safety governor (WebXR/shared/vb-governor.js) as a practice: the e-stop wins over everything, only allowlisted
// tasks run, the site's speed and separation limits hold, a policy trained on revoked data is refused, the physical-robot
// path stays locked off, and every decision goes in the hash-chained audit log. Then the supervisor watches the run from
// outside the zone, stops it on an unsafe deviation, and files the evaluation. No speed, distance or threshold is stated as
// a real figure: those belong to the cell's own risk assessment. ?fault=stale-policy swaps which policy plaque is stale.
// The job, the agent and its policy are procedural; no real agent network, wallet, token or payment is involved.

const VBSA_ACCENT = 0x5ec8d8;

export const SIM_VB_SUPERVISING_AGENT_DISPATCHED_ROBOTS = {
  id: "vb-supervising-agent-dispatched-robots",
  index: "vb-1",
  domain: "Robotics",
  trade: "Robot safety supervisor and AI-training specialist, software-agent dispatch review — UAW/IAM",
  category: "Manufacturing & Automation",
  district: "robotics-training-centre",
  weather: "overcast",
  certification: "UAW and IAM skilled-trades training as bodies; ANSI/RIA R15.06 and ISO 10218 for the integrated robot system, its safeguarding and the written risk assessment that sets its speed and separation limits; OSHA 29 CFR 1910.212 for machine guarding and 29 CFR 1910.147 for hazardous-energy control when anyone enters the bench; plus this platform's own dispatch rules: allowlist, consent lineage, append-only audit, simulated robots only",
  name: "Supervising Robots Dispatched by Software Agents",
  title: simTitle("Supervising Robots Dispatched by Software Agents"),
  tagline: "Reviewing a robot job sent by a software agent before the site's own agent may run it in the sim: who asked and what for, the task checked against the allowlist, the policy's eval card and lineage read and a stale policy caught, the site's speed and separation limits set from the risk assessment, the physical-robot path confirmed locked off, the run watched from outside the zone and stopped on a deviation, and the evaluation filed in the audit log",
  accent: VBSA_ACCENT,
  accentCss: "#5ec8d8",
  parSeconds: 340,
  footprint: 2.9,
  badge: { id: "the-governor-holds", name: "The Governor Holds", note: "Checked who asked, what for and with which policy, kept the robot to the sim and its limits, stopped it on a deviation and logged every decision" },

  game: system({
    name: "The Governor Holds",
    currency: "GV",
    ranks: ["Observer", "Reviewer", "Supervisor", "Dispatch Lead", "Safety Sign-off"],
    badges: [
      { id: "who-asked", name: "Who Asked", note: "Read the job card before anything else", test: AWARD.stepClean("job-card") },
      { id: "off-list", name: "Off the List", note: "Found the job asking for a task not on the allowlist", test: AWARD.stepClean("find-offlist") },
      { id: "steady-watch", name: "Steady Watch", note: "Kept the separation readout near band centre", test: AWARD.precise(0.72) },
    ],
    challenges: [
      { id: "quick-review", name: "Inside Par", note: "Complete inside 80% of par", test: AWARD.fast(0.8) },
      { id: "clean-review", name: "Clean Review", note: "Clean run, no corrections", test: AWARD.clean },
    ],
  }),

  supportLine: "a steward at your UAW or IAM local, or the employee assistance line, if supervising automated equipment you did not program is weighing on you",

  faults: [{ id: "stale-policy", label: "Lineage: CHECK", step: "find-stale", target: "plaque-b", note: "Today the lineage board shows policy B, not policy A, was trained on the revoked demonstrations. Find the stale policy.", from: "plaque-a", cue: "Find the policy trained on revoked demonstrations." }],

  hazards: {
    "auto-approve-hazard": "That switches the queue to approve every job from this agent automatically. A software agent can be wrong, out of date or misconfigured, and it cannot see the person walking into the cell; the human review of each job is the safeguard the agent does not have.",
    "physical-route-hazard": "That routes the job to the physical cell. A command that starts with a software agent reaches only the simulated robot in this setup; driving a real arm would need a named human approver at the site, and that path is locked off by design.",
    "inside-zone-hazard": "That walks onto the taped floor beside the bench to get a closer look at the simulated run. A dispatcher keeps the same footing a technician would on live equipment, because habits built at a sim desk follow people onto real floors, and nobody predicts a policy's next move from inches away.",
    "clear-log-hazard": "That clears the audit log to tidy the screen. The log is append-only on purpose: every allow, refuse and stop is chained to the line before it, so anyone can later see which agent asked for what and who decided, and a cleared log hides exactly what a review needs.",
  },

  lateNotes: {
    "job-card": "The job card is read first: which agent asked, which task, which site, at what speed, with which policy.",
    "approve-key": "Approval is given under the supervisor's own name, for the simulated robot only, after every governor check passed.",
  },

  interrupts: [
    { id: "deviation", kind: "Unsafe deviation", after: "watch-hold", delay: 3, seconds: 11, alert: "The simulated arm has turned off its planned path toward the teammate's keep-out zone on the bench.", cue: "Press the run e-stop now.", target: "run-estop", why: "A deviation from the planned path means the policy is acting on something nobody reviewed, and the e-stop is the one control that outranks the agent, the policy and the governor's own decision; stopping costs a re-run in the sim, while letting it continue teaches everyone that the stop is optional.", missNote: "The run went on after the arm turned toward the keep-out zone. The e-stop wins: stop first, investigate second.", wrongNote: "Not that — an unsafe deviation is answered with the run e-stop." },
    { id: "resend-fast", kind: "Agent re-sends faster", after: "separation-track", delay: 3, seconds: 11, alert: "The client agent has re-sent the same job asking for full speed with a person inside the warning distance.", cue: "Refuse the re-sent job.", target: "refuse-key", why: "An agent that re-sends a refused or slowed job at a higher speed is optimising for its own task, not for the person in the warning zone; inside the warning distance the speed is capped at the reduced speed, and the refusal is logged so the pattern is visible to whoever reviews that agent next.", missNote: "The faster re-send sat in the queue unanswered. Refuse it: inside the warning distance only the reduced speed is allowed.", wrongNote: "Not that — a faster re-send with a person in the warning zone is answered by refusing the job." },
  ],

  steps: [
    { id: "job-card", kind: "select", target: "job-card", title: "Read the incoming job", cue: "Read the job card: which agent asked, the task, the site, the speed and the policy.", why: "Every job that arrives from a software agent starts as a request, not an order, and the job card is where it says who is asking and for what; a supervisor who reads it first can match the request to the site, the task to the allowlist and the policy to its lineage before anything is allowed to move." },
    { id: "client-check", kind: "select", target: "agent-registry", title: "Check who asked", cue: "Find the client agent in the site's agent registry and read what it is allowed to request.", why: "An agent that is not in the registry has no history anyone can audit and no list of tasks it may ask for, so its job is refused before any detail is weighed; checking the registry is the same step as checking a contractor's sign-in sheet before letting them near a machine." },
    { id: "find-offlist", kind: "find", noHint: true, targets: ["job-offlist"], target: "job-offlist", itemNames: { "job-offlist": "queued job asking for a task not on the allowlist" }, itemNotes: { "job-offlist": "This job asks the robot to run with the area scanner bypassed. That task is not on the allowlist for any rig, so the governor refuses it and the refusal is logged." }, decoyNotes: { "job-route": "A routing job for the warehouse robots, on the allowlist for that rig. Nothing to flag there.", "job-entry": "A cell-entry job with lockout and verify, on the allowlist for the cell. Nothing to flag there." }, title: "Find the job that is not on the allowlist", cue: "Find the queued job asking for a task that is not on the allowlist.", why: "An allowlist means a task is refused unless it was reviewed and written down beforehand, which is the opposite of trusting a request because it sounds routine; a job asking to bypass a safeguard is exactly the kind a software agent might generate from a badly worded goal, and it never reaches the robot." },
    { id: "eval-card", kind: "select", target: "eval-card", title: "Read the policy's eval card", cue: "Read the eval card: held-out results against the random baseline and the scripted expert, and the violations.", why: "The policy that will drive the simulated robot has to show what it does on seeds it never saw, measured against a floor and a ceiling, with its safe-practice violations counted beside its successes; an agent's job that names a policy with no eval card, or only a success figure, is not ready to run." },
    { id: "find-stale", kind: "find", noHint: true, targets: ["plaque-a"], target: "plaque-a", itemNames: { "plaque-a": "policy trained on revoked demonstrations" }, itemNotes: { "plaque-a": "A policy trained on demonstrations whose consent was later revoked is stale. The governor refuses any job that names it until it is retrained without them." }, decoyNotes: { "plaque-b": "The policy retrained after the revocation was applied. It may run.", "plaque-c": "The scripted expert, written by hand and trained on no one's data. It may run." }, title: "Find the stale policy", cue: "Find the policy trained on revoked demonstrations.", why: "Revoking consent deletes the recordings, but a policy trained on them still carries what it copied, so the lineage board marks it stale and the governor refuses it; catching the stale policy is how a person's withdrawn consent actually reaches the robot an agent wants to run." },
    { id: "speed-gauge", kind: "gauge", target: "speed-dial", title: "Set the speed limit from the risk assessment", cue: "Set the governor's speed limit to the value in the site's risk assessment and commit when it matches.", why: "The speed a job may ask for is capped by the site's written risk assessment, not by what the agent requests or what the robot can do; setting the cap from the sheet before the job runs means a request above it is refused by rule, and the supervisor never has to argue a number with software in the moment.", gauge: { label: "LIMIT", speed: 0.6, green: [0.42, 0.6], readout: (t) => (t > 0.42 && t < 0.6 ? "matches sheet" : "check sheet"), missNote: "The dial does not match the risk assessment. Set the limit from the sheet, not from the agent's request." } },
    { id: "governor-order", kind: "sequence", anyOrder: false, targets: ["gov-estop", "gov-allowlist", "gov-limits", "gov-lineage"], itemNames: { "gov-estop": "e-stop status", "gov-allowlist": "allowlist", "gov-limits": "speed and separation", "gov-lineage": "policy lineage" }, outOfOrderNote: "Out of order — the e-stop comes first: check it, then the allowlist, the limits and the lineage.", title: "Walk the governor's checks in order", cue: "Check the e-stop status, then the allowlist, then speed and separation, then the policy lineage.", why: "The governor checks the e-stop first because a held stop overrides every other answer: there is no task, speed or policy that makes it right to move a robot someone has stopped; walking the checks in the same order the software does is how a supervisor learns to read its refusals." },
    { id: "physical-lock", kind: "select", target: "physical-switch", title: "Confirm the physical path is locked off", cue: "Confirm the physical-robot switch is locked off and names a human approver.", why: "A command that starts with a software agent reaches only the simulated robot here; sending one to a real arm would need a named human approver at the site on top of every governor rule, and that path ships disabled, so the supervisor confirms the lock rather than assuming it." },
    { id: "approve", kind: "select", target: "approve-key", title: "Approve the job for the sim, under your name", cue: "Approve the job for the simulated robot under your own name.", why: "Approval moves the job from negotiation to the work phase and is written into the audit log with the supervisor's name, so responsibility for letting software drive a robot, even a simulated one, sits with a person who read the evidence rather than with the agent that asked." },
    { id: "watch-hold", kind: "hold", target: "watch-pad", seconds: 5, title: "Watch the run from outside the zone", cue: "Hold at the watch point outside the zone while the simulated run starts.", why: "A run dispatched by an agent is watched by a person who can stop it, from a place the robot cannot reach; the governor checks every step, but only the supervisor can see that a move is wrong for a reason no rule anticipated.", holdBreakNote: "Stepped away from the watch point before the run settled. Hold until it does." },
    { id: "separation-track", kind: "track", target: "separation-meter", seconds: 8, title: "Keep the separation in band", cue: "Keep the separation readout in its band while the run continues at reduced speed.", why: "Inside the warning distance the robot runs at the reduced speed and inside the stop distance it holds a protective stop; tracking the separation readout keeps the supervisor's attention on the person and the robot rather than on the job's progress bar.", track: { start: 0.5, green: [0.4, 0.62], rise: 0.4, fall: 0.45, drift: 0.13, label: "SEPARATION", readout: (v) => (v < 0.4 ? "too close" : v > 0.62 ? "out of view" : "in band") }, holdBreakNote: "The separation readout left its band. Bring it back before the run resumes." },
    { id: "file-eval", kind: "drag", target: "eval-memo", drag: { to: "eval-slot", radius: 0.4, missNote: "Not placed — set the evaluation memo in the job's evaluation slot." }, title: "File the evaluation", cue: "Carry the evaluation memo to the job's evaluation slot: completed, or rejected with the reason.", why: "The evaluation closes the job: completed only if the run finished with every safe practice kept and no stop, rejected otherwise with the reason in plain words; filing it is how the client agent, the site and the next reviewer learn what happened rather than what was hoped." },
    { id: "audit-check", kind: "select", target: "audit-log", title: "Check the audit chain", cue: "Check the audit log: every allow, refuse and stop is there and the chain is intact.", why: "Each audit line carries a hash of the line before it, so a missing or edited decision breaks the chain where anyone can see it; checking it at the end of a job confirms that the record of who asked, what the governor decided and who approved will still be there when someone needs it." },
  ],

  build(root) {
    const ACC = VBSA_ACCENT;
    const hits = {};
    const g = group(root);
    stationPad(g, 2.9, ACC);
    const floor = box(g, 9.2, 0.12, 9.2, 0, 0.06, 0, 0xffffff, { rough: 0.6 });
    floor.material = texturedMat(surfaceTexture((cx, w, h) => tileFace(cx, w, h, { tiles: 8, tile: 0xc6ced4, grout: "#86909a" }), { repeat: 5, px: 512 }), { rough: 0.55, metal: 0.05, color: 0xffffff });
    const wall = box(g, 9.2, 4.2, 0.2, 0, 2.1, -5.6, 0xffffff, { rough: 0.75 });
    wall.material = texturedMat(surfaceTexture((cx, w, h) => blockFace(cx, w, h, { rows: 5, cols: 8, block: 0x7f8a94 }), { repeat: 3, px: 512 }), { rough: 0.75, metal: 0.05, color: 0xffffff });
    const deck = box(g, 1.4, 0.03, 0.8, -3.6, 0.13, 3.4, 0xffffff, { rough: 0.7, cast: false });
    deck.material = texturedMat(surfaceTexture((cx, w, h) => gratingFace(cx, w, h, {}), { repeat: 2, px: 256 }), { rough: 0.7, metal: 0.4, color: 0xffffff });
    holoTag(g, "agent dispatch desk — procedural, simulated robot only", 3.2, 3.7, -5.45, { css: "#5ec8d8", w: 0.7 });
    const rig = cobotBench(g, 0, 0, -3.6, {});
    const P = rig.userData.parts ?? {};
    // the dispatch wall: three queued jobs, three policy plaques, the run screen
    const cap = {};
    const plaque = (id, label, x, y, colour, w = 0.5, h = 0.34) => { const p = box(g, w, h, 0.04, x, y, -5.45, colour, { rough: 0.5 }); decal(p, w - 0.06, h - 0.06, 0, 0, 0.022, signFace(label, { bg: "#0d1a1f", accent: "#5ec8d8", scale: 0.24 }), { px: 256 }); reg(hits, p, id); cap[id] = p; return p; };
    plaque("job-route", "JOB 1 · ROUTE\nAMR AISLE", -1.6, 2.5, 0x1d3a42);
    plaque("job-offlist", "JOB 2 · RUN\nSCANNER OFF", -1.0, 2.5, 0x1d3a42);
    plaque("job-entry", "JOB 3 · CELL\nENTRY + LOTO", -0.4, 2.5, 0x1d3a42);
    plaque("plaque-a", "POLICY A\nLINEAGE: D-03", -1.6, 1.8, 0x22303a);
    plaque("plaque-b", "POLICY B\nLINEAGE: D-04", -1.0, 1.8, 0x22303a);
    plaque("plaque-c", "POLICY C\nSCRIPTED", -0.4, 1.8, 0x22303a);
    const run = holoPanel(g, 0.9, 0.55, 1.4, 2.1, -5.3, (ctx, w, h) => {
      ctx.fillStyle = "rgba(8,20,26,0.92)"; ctx.fillRect(0, 0, w, h); ctx.fillStyle = "#5ec8d8"; ctx.fillRect(0, 0, w, 5);
      ctx.fillStyle = "#e3f7fb"; ctx.font = `600 ${Math.round(h * 0.1)}px 'Barlow Condensed', Arial, sans-serif`; ctx.textAlign = "left"; ctx.textBaseline = "middle";
      ctx.fillText("SIM RUN · JOB PHASES", w * 0.06, h * 0.14);
      ctx.font = `${Math.round(h * 0.07)}px Arial, sans-serif`; ctx.fillStyle = "#b9e6ee";
      ["REQUEST", "NEGOTIATION", "TRANSACTION (work, no payment)", "EVALUATION", "COMPLETED / REJECTED / EXPIRED"].forEach((l, i) => ctx.fillText(`${i + 1}. ${l}`, w * 0.06, h * (0.32 + i * 0.12)));
    }, { accent: ACC });
    reg(hits, run, "run-screen");
    const post = (x, z, h) => cyl(g, 0.035, 0.045, h, x, h / 2, z, 0x3b4148, { rough: 0.5, metal: 0.5, seg: 10 });
    const put = (id, label, x, z, shape, colour) => {
      post(x, z, 0.95);
      if (shape === "ball") cap[id] = ball(g, 0.075, x, 1.03, z, colour, { rough: 0.45, seg: 12 });
      else if (shape === "cyl") cap[id] = cyl(g, 0.07, 0.07, 0.12, x, 1.01, z, colour, { rough: 0.5, seg: 12 });
      else if (shape === "meter") cap[id] = instrument(g, x, 0.97, z, { ry: Math.atan2(-x, 3.6 - z), idle: "--", color: ACC });
      else cap[id] = box(g, 0.18, 0.14, 0.12, x, 1.02, z, colour, { rough: 0.5 });
      holoTag(g, label, x, 1.3, z, { css: "#5ec8d8", w: Math.min(0.6, 0.12 + label.length * 0.018) });
      reg(hits, cap[id], id);
    };
    put("agent-registry", "agent registry", -1.68, 1.47, "box", 0x22303a);
    put("eval-card", "policy eval card", -2.09, 0.9, "box", 0x2f6f7e);
    put("speed-dial", "speed limit", -2.25, 0.24, "meter");
    put("gov-estop", "e-stop status", -2.13, -0.42, "ball", 0xd2312b);
    put("gov-allowlist", "allowlist", -1.74, -1.01, "box", 0x3a78c9);
    put("gov-limits", "speed + separation", -1.14, -1.45, "ball", 0xf0b323);
    put("gov-lineage", "policy lineage", -0.4, -1.68, "box", 0x8a6fd0);
    put("physical-switch", "physical path: locked off", 0.4, -1.68, "cyl", 0x6d767e);
    put("approve-key", "approve for sim", 1.14, -1.45, "cyl", 0x59c97b);
    put("run-estop", "run e-stop", 1.74, -1.01, "cyl", 0xd2312b);
    put("refuse-key", "refuse job", 2.13, -0.42, "cyl", 0xf0645b);
    put("watch-pad", "watch point", 2.25, 0.24, "ball", 0x2b2f34);
    put("separation-meter", "separation", 2.09, 0.9, "meter");
    put("audit-log", "audit log (chained)", 1.68, 1.47, "box", 0x1d3a42);
    // the job card
    const card = holoPanel(g, 0.72, 0.48, -2.9, 1.55, -0.2, (ctx, w, h) => {
      ctx.fillStyle = "rgba(8,20,26,0.92)"; ctx.fillRect(0, 0, w, h); ctx.fillStyle = "#5ec8d8"; ctx.fillRect(0, 0, w, 5);
      ctx.fillStyle = "#e3f7fb"; ctx.font = `600 ${Math.round(h * 0.1)}px 'Barlow Condensed', Arial, sans-serif`; ctx.textAlign = "left"; ctx.textBaseline = "middle";
      ctx.fillText("INCOMING JOB · CLIENT AGENT", w * 0.06, h * 0.14);
      ctx.font = `${Math.round(h * 0.07)}px Arial, sans-serif`; ctx.fillStyle = "#b9e6ee";
      ["From: client agent (mock)", "Task: pick and place, cobot bench", "Target: simulated robot", "Policy named: see eval card"].forEach((l, i) => ctx.fillText(l, w * 0.06, h * (0.32 + i * 0.12)));
    }, { ry: 0.9, accent: ACC });
    reg(hits, card, "job-card");
    // the evaluation memo and its slot
    cap["eval-slot"] = group(g, -3.0, 0.95, 0.9); post(-3.0, 0.9, 0.95);
    box(cap["eval-slot"], 0.3, 0.06, 0.3, 0, 0.03, 0, 0x2b2f34, { rough: 0.5, metal: 0.4 }); box(cap["eval-slot"], 0.22, 0.01, 0.22, 0, 0.065, 0, 0x5ec8d8, { emissive: 0x5ec8d8, ei: 0.4, rough: 0.5 });
    holoTag(g, "evaluation slot", -3.0, 1.3, 0.9, { css: "#5ec8d8", w: 0.34 }); reg(hits, cap["eval-slot"], "eval-slot");
    cap["eval-memo"] = box(g, 0.16, 0.1, 0.02, -2.5, 0.96, -2.3, 0x5ec8d8, { rough: 0.5 });
    box(g, 0.6, 0.05, 0.4, -2.5, 0.9, -2.3, 0x3b4148, { rough: 0.6 });
    reg(hits, cap["eval-memo"], "eval-memo");
    // the audit screen
    const logSign = group(g, 2.9, 0, 0.4, -0.9);
    box(logSign, 0.44, 0.32, 0.03, 0, 1.2, 0, 0x1b232b, { rough: 0.6 });
    const logFace = decal(logSign, 0.4, 0.28, 0, 1.2, 0.02, signFace("AUDIT CHAIN\nOPEN", { bg: "#0b1a1f", accent: "#5ec8d8", scale: 0.26 }), { px: 320 });
    holoTag(logSign, "audit chain", 0, 1.46, 0, { css: "#5ec8d8", w: 0.36 });
    // hazard boards
    const hazard = (id, text, x, z, ry) => { const hz = group(g, x, 0, z, ry); cyl(hz, 0.03, 0.03, 0.9, 0, 0.45, 0, 0x2b2f34, { rough: 0.5, seg: 8 });
      const pd = box(hz, 0.26, 0.18, 0.02, 0, 1.0, 0, 0xd2312b, { rough: 0.5 }); decal(pd, 0.22, 0.14, 0, 0, 0.012, signFace(text, { bg: "#5a0f0f", accent: "#ffffff", scale: 0.3 })); reg(hits, pd, id); };
    hazard("auto-approve-hazard", "AUTO\nAPPROVE", -1.22, 2.96, 2.75);
    hazard("physical-route-hazard", "ROUTE TO\nREAL CELL", 1.22, 2.96, -2.75);
    hazard("inside-zone-hazard", "WATCH\nINSIDE ZONE", -3.04, -1.01, 1.25);
    hazard("clear-log-hazard", "CLEAR\nLOG", 3.04, -1.01, -1.25);
    // the protective zone tape around the bench
    const tape = (x, z, w, d) => box(g, w, 0.012, d, x, 0.125, z, 0xf0b323, { rough: 0.6, cast: false });
    tape(0, -2.55, 2.6, 0.06); tape(0, -4.65, 2.6, 0.06); tape(-1.3, -3.6, 0.06, 2.1); tape(1.3, -3.6, 0.06, 2.1);
    // keep-out sphere marker for the teammate on the bench, shown during the deviation
    const keepOut = ball(g, 0.32, 0.7, 1.15, -3.4, 0xf0645b, { rough: 0.6, emissive: 0xf0645b, ei: 0.5, seg: 14 });
    keepOut.visible = false;
    // a desk with screens and a chair for the supervisor
    box(g, 1.4, 0.05, 0.6, 3.4, 0.76, -4.6, 0x3b4148, { rough: 0.6 });
    for (const sx of [-0.65, 0.65]) box(g, 0.04, 0.74, 0.55, 3.4 + sx, 0.37, -4.6, 0x2b2f34, { rough: 0.6 });
    for (const sx of [-0.35, 0.35]) { box(g, 0.5, 0.3, 0.03, 3.4 + sx, 1.0, -4.8, 0x0e1a1f, { rough: 0.4 }); box(g, 0.05, 0.12, 0.05, 3.4 + sx, 0.83, -4.8, 0x2b2f34, { rough: 0.5 }); }
    box(g, 0.45, 0.06, 0.45, 3.4, 0.46, -4.0, 0x1d3a42, { rough: 0.7 });
    cyl(g, 0.03, 0.03, 0.42, 3.4, 0.22, -4.0, 0x2b2f34, { rough: 0.5, seg: 8 });
    for (let i = 0; i < 12; i++) box(g, 0.24, 0.32, 0.04, -4.2 + (i % 6) * 0.3, 1.0 + Math.floor(i / 6) * 0.4, -5.45, [0x3a78c9, 0x5ec8d8, 0x6d767e][i % 3], { rough: 0.8 });
    const faultLamp = ball(g, 0.07, 3.4, 2.0, -3.2, 0xd2312b, { emissive: 0xd2312b, ei: 1.6, seg: 12 });
    faultLamp.visible = false;
    const resendCard = box(g, 0.5, 0.34, 0.04, 0.4, 2.5, -5.4, 0x6a2a2a, { rough: 0.5 });
    decal(resendCard, 0.44, 0.28, 0, 0, 0.022, signFace("RE-SENT\nFULL SPEED", { bg: "#3a0f0f", accent: "#ffffff", scale: 0.24 }), { px: 256 });
    resendCard.visible = false;
    const mate = standingFigure(g, 2.2, -2.2, { ry: -0.9, cloth: 0x3a4a5a, helmet: 0xf0b323 });
    holoTag(mate, "bench teammate", 0, 1.95, 0.15, { css: "#5ec8d8", w: 0.34 });
    const lead = standingFigure(g, -3.9, 0.8, { ry: 1.2, cloth: 0x2b3138, helmet: 0xf2f2f2 });
    holoTag(lead, "dispatch lead", 0, 1.95, 0.15, { css: "#5ec8d8", w: 0.32 });
    const faultOn = /[?&]fault=stale-policy(&|$)/.test(globalThis.location?.search ?? "");
    const fStep = SIM_VB_SUPERVISING_AGENT_DISPATCHED_ROBOTS.steps.find((s) => s.id === "find-stale");
    const fDecl = SIM_VB_SUPERVISING_AGENT_DISPATCHED_ROBOTS.faults[0];
    if (fStep) { fStep.targets = [faultOn ? fDecl.target : fDecl.from]; fStep.target = fStep.targets[0]; fStep.cue = faultOn ? fDecl.note : fDecl.cue; }
    if (faultOn) { holoTag(g, "Lineage: CHECK", 3.4, 2.25, -3.2, { css: "#d2312b", w: 0.4 }); }
    faultLamp.visible = faultOn;
    return {
      hits,
      footprint: 2.9,
      spawnLook: new THREE.Vector3(0, 1.3, 3.6),
      onInterrupt(it) {
        if (it.id === "deviation") { keepOut.visible = true; faultLamp.visible = true; cap["run-estop"].material = mat(0xd2312b, { rough: 0.5, emissive: 0xd2312b, ei: 0.9 }); }
        if (it.id === "resend-fast") { resendCard.visible = true; cap["refuse-key"].material = mat(0xf0645b, { rough: 0.5, emissive: 0xf0645b, ei: 0.8 }); }
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "deviation") { keepOut.visible = false; faultLamp.visible = faultOn; if (P.arm) P.arm.rotation.y = 0; cap["run-estop"].material = mat(0x59c97b, { rough: 0.5, emissive: 0x59c97b, ei: 0.3 }); }
        if (it.id === "resend-fast") { resendCard.visible = false; cap["refuse-key"].material = mat(0x59c97b, { rough: 0.5 }); }
      },
      onStepComplete(step) {
        if (step.id === "speed-gauge") repaint(cap["speed-dial"].userData.screen, signFace("SET", { bg: "#0b1a1f", accent: "#59c97b", fg: "#dff6fa", scale: 0.5 }));
        if (step.id === "find-offlist") cap["job-offlist"].material = mat(0x6a2a2a, { rough: 0.5 });
        if (step.id === "find-stale") cap[faultOn ? "plaque-b" : "plaque-a"].material = mat(0x6a2a2a, { rough: 0.5 });
        if (step.id === "approve") cap["approve-key"].material = mat(0x59c97b, { rough: 0.5, emissive: 0x59c97b, ei: 0.5 });
        if (step.id === "file-eval") cap["eval-memo"].material = mat(0x59c97b, { rough: 0.5 });
        if (step.id === "audit-check") repaint(logFace, signFace("AUDIT CHAIN\nINTACT", { bg: "#0f1b14", accent: "#59c97b", fg: "#bff7d4", scale: 0.26 }));
      },
      onHazard() {},
      animate(t, dt, session) {
        lead.userData.head.rotation.y = Math.sin(t * 0.5) * 0.3;
        if (P.arm && !keepOut.visible) P.arm.rotation.y = Math.sin(t * 0.3) * 0.35;
        const gg = session?.gauge;
        if (gg && !gg.committed && session?.step?.id === "speed-gauge") repaint(cap["speed-dial"].userData.screen, signFace(gg.t > 0.42 && gg.t < 0.6 ? "MATCH" : "CHECK", { bg: "#0b1a1f", accent: gg.t > 0.42 && gg.t < 0.6 ? "#59c97b" : "#f0645b", fg: "#dff6fa", scale: 0.5 }));
      },
    };
  },
};
