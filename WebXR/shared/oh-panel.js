// OMEGA-HIVE — the "Omega Hive" panel in the parishes app, beside the agent-jobs panel (docs/omega-hive.md,
// docs/consoles/OMEGA-HIVE.md). SmartCiti.X Holodeck · Powered by AGI Corp.
//
// Roster cards (the agent's badge portrait, name, role, a "software agent" label and personality chips), a live
// caption feed, the voice toggle (off by default; on-device voices only), the approval queue (the learner is the human
// supervisor: approving lets only the SIMULATED job proceed) and step / run controls. The caller decides whether the
// panel may mount at all: the parishes app mounts it only in signed-in, adult-eligible sessions that are not K-12 and
// not the demo (DATAWORKS' dxEligibility at the "offer" stage). No network, no keys, no model call, no microphone.
//
// HIVE-IN-WORLD: the cards show AGENT-AVATARS' portraits at 2× (aaPortraitImg: the SVG at once, then the cached PNG drawn at
// size × device pixel ratio; the badge SVG stays as the fallback), and "Supervise every job" (off by default) makes every
// governor-allowed job wait in the queue for the learner's approval (ohHive's setSupervise).
//
// SEAM: ohMountHive(el, { reducedMotion, audit, seed, nJobs, synth, Utterance, supervise }) ->
//         { hive, step(), run(n), approve(jobId), decline(jobId), voice(on), supervise(on), voiceController, state(), captions(), el } | null
//
// Every top-level name starts with `oh`/`OH_` (the bundler shares one scope).

import { RB_SITES } from "./rb-robotics-data.js";
import { OH_AGENTS, OH_FEATURE, OH_AGENT_LABEL, ohTraitChips } from "./oh-hive-data.js";
import { ohHive } from "./oh-hive.js";
import { ohVoiceController } from "./oh-voice.js";
import { avAgentLook, avSpriteSvg } from "./av-sprites.js";
import { aaPortraitImg } from "./aa-agent-portraits.js";

export const OH_FEED_MAX = 40;
export const OH_RUN_STEPS = 10;
const OH_PANEL_CSS = ".oh-panel{font:13px/1.4 system-ui,sans-serif;padding:10px;border:1px solid #4a3f7a;border-radius:10px;background:#120f22;color:#ece8ff;margin:8px 0}.oh-panel h3{margin:0 0 6px;font-size:15px}.oh-panel .oh-note{opacity:.85;font-size:12px;margin:0 0 6px}.oh-panel .oh-roster{display:grid;grid-template-columns:repeat(auto-fill,minmax(210px,1fr));gap:6px}.oh-panel .oh-card{display:flex;gap:6px;align-items:flex-start;border:1px solid #3a335f;border-radius:8px;padding:5px;background:#1b1733;position:relative}.oh-panel .oh-card svg,.oh-panel .oh-card img{flex:0 0 auto;border-radius:6px}.oh-panel .oh-name{font-weight:600}.oh-panel .oh-label{display:inline-block;font-size:10px;letter-spacing:.02em;text-transform:uppercase;background:#2f2a52;border:1px solid #6d62b8;border-radius:4px;padding:0 4px;margin-left:4px}.oh-panel .oh-role{font-size:11px;opacity:.85}.oh-panel .oh-chip{display:inline-block;font-size:10px;border-radius:9px;padding:0 6px;margin:2px 3px 0 0;background:#2a2547}.oh-panel .oh-talk{position:absolute;top:5px;right:5px;width:8px;height:8px;border-radius:50%;background:#3a335f}.oh-panel .oh-card[data-talking=true] .oh-talk{background:#8fe3ff}.oh-panel .oh-row{display:flex;flex-wrap:wrap;gap:6px;margin-top:6px}.oh-panel button{background:#2a2450;color:#ece8ff;border:1px solid #6d62b8;border-radius:6px;padding:5px 9px;cursor:pointer}.oh-panel button[aria-pressed=true]{background:#4b3fa0}.oh-panel .oh-feed{max-height:180px;overflow-y:auto;border:1px solid #3a335f;border-radius:6px;padding:4px 6px;margin-top:6px;background:#0d0b19}.oh-panel .oh-feed p{margin:2px 0}.oh-panel .oh-queue{margin-top:6px}.oh-panel .oh-req{border:1px solid #8a6d2a;border-radius:6px;padding:5px;margin-top:4px;background:#1f1a10}.oh-panel .oh-status{margin-top:6px;font-size:12px;opacity:.9}";

export function ohMountHive(el, { reducedMotion = false, audit = null, seed = 1, nJobs = 200, ticksPerDay = 480, synth, Utterance, onTalk = null, supervise = false } = {}) {
  if (!el || typeof document === "undefined") return null;
  const hive = ohHive({ seed, audit, nJobs, ticksPerDay, supervise });
  const voice = ohVoiceController({ ...(synth !== undefined ? { synth } : {}), ...(Utterance !== undefined ? { Utterance } : {}), enabled: false });
  const captions = [];
  const siteName = (id) => RB_SITES.find((s) => s.id === id)?.name ?? id;
  const mk = (tag, cls, text) => { const n = document.createElement(tag); if (cls) n.className = cls; if (text != null) n.textContent = text; return n; };

  const box = mk("section", "oh-panel"); box.id = "oh-hive"; box.setAttribute("aria-label", `${OH_FEATURE}: software agents managing the simulated robots`);
  const style = document.createElement("style"); style.textContent = OH_PANEL_CSS; box.appendChild(style);
  box.appendChild(mk("h3", null, `${OH_FEATURE} — software agents managing the simulated robots`));
  box.appendChild(mk("p", "oh-note", "Seven software agents, not people, coordinate the robot jobs at the Holodeck's six robot sites. Every job passes the safety governor; anything that would touch a physical robot comes to you as a question, and approving lets only the simulated job run. Lines are written on this device from each agent's persona and the job's own data, with no model or network call. Voice is off until you turn it on, captions always show, and nothing listens."));

  const roster = mk("div", "oh-roster"); roster.setAttribute("role", "list");
  const cards = new Map();
  for (const a of OH_AGENTS) {
    const card = mk("div", "oh-card"); card.setAttribute("role", "listitem"); card.dataset.agent = a.id; card.dataset.talking = "false";
    const pic = mk("div", "oh-pic");
    let img = null; try { img = typeof aaPortraitImg === "function" ? aaPortraitImg(a, { size: 48 }) : null; } catch (_) { img = null; }
    if (img) { img.title = `${a.name}, ${OH_AGENT_LABEL}`; pic.appendChild(img); } // the 2× portrait (HIVE-IN-WORLD)
    else pic.innerHTML = avSpriteSvg(avAgentLook(a.avatar.glyph, a.avatar.accent), { kind: "portrait", size: 48, title: `${a.name}, ${OH_AGENT_LABEL}` }); // the badge fallback
    const body = mk("div");
    const name = mk("div", "oh-name", a.name); name.appendChild(mk("span", "oh-label", OH_AGENT_LABEL));
    body.appendChild(name);
    body.appendChild(mk("div", "oh-role", a.role));
    body.appendChild(mk("div", "oh-role", `Home: ${siteName(a.homeSite)}`));
    const chips = mk("div"); for (const c of ohTraitChips(a.traits)) chips.appendChild(mk("span", "oh-chip", c)); body.appendChild(chips);
    card.append(pic, body, mk("span", "oh-talk"));
    card.querySelector(".oh-talk").setAttribute("aria-hidden", "true");
    roster.appendChild(card); cards.set(a.id, card);
  }
  box.appendChild(roster);

  const row = mk("div", "oh-row");
  const bStep = mk("button", null, "Step"); bStep.type = "button"; bStep.dataset.oh = "step";
  const bRun = mk("button", null, `Run ${OH_RUN_STEPS} steps`); bRun.type = "button"; bRun.dataset.oh = "run";
  const bVoice = mk("button", null, "Voice: off"); bVoice.type = "button"; bVoice.dataset.oh = "voice"; bVoice.setAttribute("aria-pressed", "false");
  const bSup = mk("button", null, ""); bSup.type = "button"; bSup.dataset.oh = "supervise";
  const supText = (on) => { bSup.textContent = `Supervise every job: ${on ? "on" : "off"}`; bSup.setAttribute("aria-pressed", String(on)); bSup.title = on ? "Every job waits for your approval before it runs." : "Routine simulated jobs the governor allows run under your standing approval; requests that name a physical robot always ask you."; };
  supText(hive.supervising());
  row.append(bStep, bRun, bVoice, bSup);
  box.appendChild(row);
  const queueBox = mk("div", "oh-queue"); queueBox.setAttribute("aria-live", "polite"); box.appendChild(queueBox);
  const feed = mk("div", "oh-feed"); feed.setAttribute("aria-live", "polite"); feed.setAttribute("aria-label", "Agent captions"); box.appendChild(feed);
  const status = mk("div", "oh-status"); box.appendChild(status);
  el.appendChild(box);

  hive.on("speak", (e) => {
    const a = OH_AGENTS.find((x) => x.id === e.agent);
    captions.push({ t: e.t, agent: e.agent, text: e.text, caption: e.caption });
    if (captions.length > 500) captions.splice(0, captions.length - 500);
    const p = mk("p", null, `[${e.t}] ${e.caption}`); p.dataset.agent = e.agent;
    feed.appendChild(p);
    while (feed.childNodes.length > OH_FEED_MAX) feed.removeChild(feed.firstChild);
    feed.scrollTop = feed.scrollHeight;
    if (a && voice.enabled()) {
      const card = cards.get(a.id);
      voice.say(a, e.text, { onstart: () => { if (card) card.dataset.talking = "true"; try { onTalk?.(a.id, true); } catch (_) { /* a listener never stops the voice */ } }, onend: () => { if (card) card.dataset.talking = "false"; try { onTalk?.(a.id, false); } catch (_) { /* ignore */ } } });
    }
  });

  function renderQueue() {
    queueBox.textContent = "";
    const pend = hive.pending();
    if (!pend.length) return;
    queueBox.appendChild(mk("div", "oh-name", `Waiting for you (${pend.length})`));
    for (const r of pend) {
      const req = mk("div", "oh-req"); req.dataset.job = r.jobId; req.dataset.reason = r.reason;
      req.appendChild(mk("div", null, r.reason === "supervise"
        ? `${r.jobId} · ${r.task} at ${r.siteName}. The governor allowed it and you supervise every job: approve to let it run on the simulated robot, or decline.`
        : `${r.jobId} · ${r.task} at ${r.siteName}. It names a physical robot; that path is disabled in this build. Approve to run it on the simulated robot only, or decline.`));
      const ok = mk("button", null, "Approve (simulated only)"); ok.type = "button"; ok.dataset.oh = "approve";
      const no = mk("button", null, "Decline"); no.type = "button"; no.dataset.oh = "decline";
      ok.onclick = () => api.approve(r.jobId); no.onclick = () => api.decline(r.jobId);
      const br = mk("div", "oh-row"); br.append(ok, no); req.appendChild(br);
      queueBox.appendChild(req);
    }
  }
  function render() {
    renderQueue();
    const m = hive.metrics(); const v = hive.verify();
    status.textContent = `Step ${hive.now()} · completed ${m.completed} · refused ${m.refused} · vetoed ${m.vetoed} · declined ${m.declined} · waiting for you ${m.awaitingApproval} · audit chain ${v.lines} line(s), ${v.ok ? "intact" : "BROKEN"}`;
  }

  let timer = null;
  const api = {
    hive, el: box, voiceController: voice,
    step() { const ev = hive.step(); render(); return ev; },
    run(n = OH_RUN_STEPS) {
      clearInterval(timer);
      if (reducedMotion || typeof setInterval !== "function") { const ev = hive.run(n); render(); return ev; }
      let left = n;
      timer = setInterval(() => {
        if (voice.enabled() && voice.queued() > 2) return; // let the voices catch up: nobody talks over anybody
        if (left <= 0 || hive.pending().length) { clearInterval(timer); return; }
        left -= 1; hive.step(); render();
      }, 400);
      return [];
    },
    approve(jobId) { const r = hive.approve(jobId); render(); return r; },
    decline(jobId) { const r = hive.decline(jobId); render(); return r; },
    voice(on) { const v = voice.setEnabled(on); bVoice.textContent = `Voice: ${v ? "on" : "off"}`; bVoice.setAttribute("aria-pressed", String(v)); return v; },
    supervise(on) { const v = hive.setSupervise(on); supText(v); render(); return v; },
    state() { return { t: hive.now(), metrics: hive.metrics(), verify: hive.verify(), pending: hive.pending(), voice: voice.enabled(), supervise: hive.supervising(), captions: captions.length }; },
    captions() { return captions.slice(); },
    stop() { clearInterval(timer); voice.stop(); },
  };
  bStep.onclick = () => api.step();
  bRun.onclick = () => api.run(OH_RUN_STEPS);
  bVoice.onclick = () => api.voice(!voice.enabled());
  bSup.onclick = () => api.supervise(!hive.supervising());
  render();
  return api;
}
