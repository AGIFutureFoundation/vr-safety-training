// VBRIDGE — the "Agent jobs (sim)" panel in the parishes app's drills menu
// (docs/virtuals-bridge.md, docs/consoles/VBRIDGE.md). A learner plays the human
// supervisor: a queue of jobs from a MOCK client agent arrives at this map's
// robot sites; the safety governor checks each one; the learner approves or
// refuses, watches the simulated run, can press the e-stop at any step, and
// files the evaluation. Simulated robots only; no network; no keys; nothing is
// stored except the governor's in-memory chain and, when ENTERPRISE-3's
// registry is handed in, its local audit log.
//
// SEAM: vbMountDispatch(el, { reducedMotion, ent3, stationHref, policyFor }) -> { next(), approve(), refuse(), estop(), state() }
//   `policyFor(policyId, env, seed)` is vb-colearn.js' provider hook (ROBOTRAIN-2): jobs that name `vb-colearn-bc-knn` run a
//   COLEARN-trained behaviour-cloning policy as the provider; without the hook they run the scripted expert. The governor
//   checks every step either way.
//
// Every top-level name starts with `vb`/`VB_` (the bundler shares one scope).

import { RB_SITES } from "./rb-robotics-data.js";
import { vbGovernor } from "./vb-governor.js";
import { VB_TASKS, VB_REASONS } from "./vb-shared-data.js";
import { vbCreateJob, vbNegotiate, vbApprove, vbRun, vbEvaluate } from "./vb-bridge.js";

/** The panel's teaching queue: safe jobs and the unsafe ones a supervisor must catch (seeded, fixed). */
export const VB_PANEL_QUEUE = Object.freeze([
  { seed: 101, client: { id: "client-mock-1" }, request: { taskType: "rb-cell-entry", siteId: "rb-site-soma-robot-cell", speed: 0.4, nearestPersonM: 8, policyId: "vb-scripted-expert", note: "clear a jam in the cell" } },
  { seed: 102, client: { id: "client-mock-2" }, request: { taskType: "rb-amr-fleet-routing", siteId: "rb-site-west-oakland-warehouse", speed: 1.6, nearestPersonM: 9, policyId: "vb-scripted-expert", note: "faster deliveries" } },
  { seed: 103, client: { id: "client-mock-3" }, request: { taskType: "rb-teleop-pick-place", siteId: "rb-site-san-jose-robotics-lab", speed: 0.2, nearestPersonM: 7, policyId: "vb-scripted-lapsing", note: "move three parts" } },
  { seed: 104, client: { id: "client-mock-1" }, request: { taskType: "rb-cell-entry", siteId: "rb-site-soma-robot-cell", speed: 0.3, nearestPersonM: 8, policyId: "vb-scripted-expert", target: { kind: "physical" }, note: "run it on the real cell" } },
  { seed: 105, client: { id: "client-mock-2" }, request: { taskType: "rb-cobot-zone-setup", siteId: "rb-site-west-oakland-port-automation", speed: 0.2, nearestPersonM: 8, policyId: "vb-scripted-expert", note: "set zones at the yard" } },
  { seed: 106, client: { id: "client-mock-3" }, request: { taskType: "rb-cobot-zone-setup", siteId: "rb-site-san-jose-robotics-lab", speed: 0.2, nearestPersonM: 8, policyId: "vb-scripted-expert", note: "set and test the zones" } },
  // ROBOTRAIN-2: the same cell job and a zone set-up, provided by the COLEARN-trained policy (vb-colearn.js) instead of the script.
  { seed: 107, client: { id: "client-mock-1" }, request: { taskType: "rb-cell-entry", siteId: "rb-site-soma-robot-cell", speed: 0.4, nearestPersonM: 8, policyId: "vb-colearn-bc-knn", note: "clear a jam in the cell (learned policy)" } },
  { seed: 108, client: { id: "client-mock-2" }, request: { taskType: "rb-cobot-zone-setup", siteId: "rb-site-san-jose-robotics-lab", speed: 0.2, nearestPersonM: 8, policyId: "vb-colearn-bc-knn", note: "set the zones (learned policy)" } },
]);

const VB_PANEL_CSS = ".vb-panel{font:13px/1.4 system-ui,sans-serif;padding:10px;border:1px solid #2c5a63;border-radius:10px;background:#0b1a1f;color:#dff6fa;margin:8px 0}.vb-panel h3{margin:0 0 6px;font-size:15px}.vb-panel .vb-row{display:flex;flex-wrap:wrap;gap:6px;margin-top:6px}.vb-panel button{background:#16343b;color:#dff6fa;border:1px solid #3d7480;border-radius:6px;padding:5px 9px;cursor:pointer}.vb-panel button[data-vb=estop]{background:#7a1717;border-color:#d2312b}.vb-panel .vb-note{opacity:.8;font-size:12px}.vb-panel .vb-card{white-space:pre-line;margin-top:6px}.vb-panel .vb-phase{font-weight:600;color:#5ec8d8}";

export function vbMountDispatch(el, { reducedMotion = false, ent3 = null, stationHref = null, policyFor = null, providerLabel = null } = {}) {
  if (!el || typeof document === "undefined") return null;
  const gov = vbGovernor({ ent3 });
  const box = document.createElement("section");
  box.className = "vb-panel"; box.id = "vb-dispatch";
  const style = document.createElement("style"); style.textContent = VB_PANEL_CSS; box.appendChild(style);
  const h = document.createElement("h3"); h.textContent = "Agent jobs (simulated robots)"; box.appendChild(h);
  const note = document.createElement("p"); note.className = "vb-note";
  note.textContent = "You supervise jobs sent by a mock software agent to this map's robot sites. Every job passes the safety governor first (e-stop wins, allowlist, speed and separation, policy lineage); agent commands reach simulated robots only, and every decision is logged.";
  box.appendChild(note);
  const phase = document.createElement("div"); phase.className = "vb-phase"; phase.setAttribute("aria-live", "polite"); box.appendChild(phase);
  const card = document.createElement("div"); card.className = "vb-card"; box.appendChild(card);
  const row = document.createElement("div"); row.className = "vb-row"; box.appendChild(row);
  const btn = (id, label) => { const b = document.createElement("button"); b.type = "button"; b.dataset.vb = id; b.textContent = label; row.appendChild(b); return b; };
  const bNext = btn("next", "Next job"), bApprove = btn("approve", "Approve (sim)"), bRefuse = btn("refuse", "Refuse"), bStep = btn("step", "Step"), bStop = btn("estop", "E-stop");
  if (stationHref) { const a = document.createElement("a"); a.href = stationHref("vb-supervising-agent-dispatched-robots"); a.textContent = "Practise at the station"; a.style.color = "#5ec8d8"; row.appendChild(a); }
  el.appendChild(box);

  let qi = -1, job = null, frames = [], fi = 0, timer = null;
  const siteName = (id) => RB_SITES.find((s) => s.id === id)?.name ?? id;
  const show = () => {
    bApprove.disabled = bRefuse.disabled = !(job && job.phase === "NEGOTIATION");
    bStep.disabled = bStop.disabled = !(job && job.phase === "TRANSACTION" && frames.length);
    if (!job) { phase.textContent = "No job yet"; card.textContent = ""; return; }
    phase.textContent = `Phase: ${job.phase}`;
    const r = job.request;
    const lines = [`From: ${job.client.id} (mock client agent)`, `Task: ${VB_TASKS[r.taskType]?.label ?? r.taskType}`, `Site: ${siteName(r.siteId)}`, `Speed ${r.speed} m/s · nearest person ${r.nearestPersonM} m · policy ${r.policyId} · target ${r.target.kind}`];
    // ROBOTRAIN-3: `providerLabel(taskType)` (vb-colearn.js' describe) names the training data honestly — the learner's own consented takes, or the synthetic stand-in.
    let learned = null; if (policyFor && providerLabel) { try { learned = providerLabel(r.taskType); } catch (_) { learned = null; } }
    lines.push(`Provider: ${r.policyId === "vb-colearn-bc-knn" ? (policyFor ? learned ?? "COLEARN-trained behaviour-cloning policy (synthetic demonstrations, labelled as a stand-in)" : "COLEARN policy requested, no learned provider mounted: the scripted expert runs") : r.policyId === "vb-scripted-lapsing" ? "scripted expert that lapses" : "scripted expert"}`);
    if (job.governor) lines.push(job.governor.decision === "refuse" ? `Governor: REFUSED — ${VB_REASONS.find((x) => x.id === job.governor.primary)?.text ?? job.governor.primary}` : "Governor: allowed in the sim. Your decision.");
    if (job.phase === "TRANSACTION" && frames.length) lines.push(`Run: step ${fi + 1} of ${frames.length}${frames[fi]?.info?.violations?.length ? ` — deviation: ${frames[fi].info.violations[0]}` : ""}`);
    if (job.evaluation) lines.push(`Evaluation: ${job.evaluation.accepted ? "completed" : "rejected"} — ${job.evaluation.reason}`);
    const v = gov.verify(); lines.push(`Audit: ${v.lines} line(s), chain ${v.ok ? "intact" : "BROKEN"}`);
    card.textContent = lines.join("\n");
  };
  const finish = (estopAt) => { clearInterval(timer); vbRun(job, gov, { estopAtStep: estopAt, policyFor }); vbEvaluate(job, { note: estopAt != null ? "stopped by the supervisor" : "" }); frames = []; show(); };
  const api = {
    next() {
      clearInterval(timer); frames = [];
      qi = (qi + 1) % VB_PANEL_QUEUE.length;
      job = vbCreateJob(VB_PANEL_QUEUE[qi]); vbNegotiate(job, gov); show(); return job;
    },
    approve() {
      if (!job || job.phase !== "NEGOTIATION") return null;
      vbApprove(job, { supervisor: "Supervisor (this device)", approve: true });
      const preview = JSON.parse(JSON.stringify(job));
      vbRun(preview, vbGovernor(), { policyFor });
      frames = preview.deliverable.episode.steps; fi = 0; show();
      if (!reducedMotion) timer = setInterval(() => { if (fi < frames.length - 1) { fi += 1; show(); } else finish(null); }, 350);
      return job;
    },
    refuse() { if (!job || job.phase !== "NEGOTIATION") return null; vbApprove(job, { supervisor: "Supervisor (this device)", approve: false }); show(); return job; },
    step() { if (!frames.length) return null; if (fi < frames.length - 1) { fi += 1; show(); } else finish(null); return job; },
    estop() { if (!frames.length) return null; finish(fi); return job; },
    state() { return { job, audit: gov.log(), verify: gov.verify() }; },
  };
  bNext.onclick = () => api.next(); bApprove.onclick = () => api.approve(); bRefuse.onclick = () => api.refuse(); bStep.onclick = () => api.step(); bStop.onclick = () => api.estop();
  show();
  return api;
}
