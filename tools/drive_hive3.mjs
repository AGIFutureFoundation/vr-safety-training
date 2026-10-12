#!/usr/bin/env node
/**
 * HIVE-3 (docs/consoles/HIVE-3.md): the headless drive of the BUILT parishes page (not in the gate).
 *
 *   A. Signed in, sf-downtown, a stubbed speechSynthesis (one local voice, one network voice):
 *      1. visitors: in the cell hall, the page's own hive is stepped until an agent it sends to the SoMa cell comes in through
 *         the door; it is shown inside (figure in the room's group) and walks out when its job ends; the room measures inside
 *         IX_BUDGET and IXR_TEX_BUDGET throughout (ixrMeasure);
 *      2. the talk light with voice on: for every line spoken by an agent standing in the room, its room figure's light is on at
 *         onstart and just before onend, and off once its last line ends; the network voice is chosen 0 times;
 *      3. remembered settings: voice on, "supervise every job" on and Spanish, then a reload: all three come back, stored under
 *         the profile's namespaced key only (no un-namespaced key, nothing in sessionStorage);
 *      4. the panel in Spanish: none of the panel's English UI strings or role sentences shows; the agents' labels read
 *         "agente de software";
 *   B. Demo, K-12 and signed out: no panel, and no hive settings key anywhere in storage.
 *   C. "A day in the hive": window.__parishTest.hiveScene({ seed: 1 }) plays end to end (stills into $SP/loop10/h3/), its beats
 *      in order, page errors 0.
 *   Page errors and off-host requests are counted throughout.
 *
 *     python3 tools/bundle_webxr.py parishes && node tools/drive_hive3.mjs [port] [outDir]
 */
import { mkdirSync } from "node:fs";
import { pathToFileURL, fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const { pvServe, pvLaunch, pvContext } = await import(pathToFileURL(join(ROOT, "tools/lib/pv_browser.mjs")).href);

const OUT = process.argv[3] || null;
if (OUT) mkdirSync(OUT, { recursive: true });
const { base, close } = await pvServe(Number(process.argv[2]) || 9111);
const browser = await pvLaunch();
const out = { pageErrors: [], offHost: [], fails: 0 };
const want = (cond, what, detail) => { if (!cond) out.fails += 1; console.log(`${cond ? "  ✓" : "  ✗"} ${what}${detail !== undefined ? ` — ${typeof detail === "string" ? detail : JSON.stringify(detail)}` : ""}`); return cond; };
const parishUrl = (map, extra = "") => `${base}/parishes/dist/parishes.html?parish=${map}&tier=high${extra}`;
const SYNTH_STUB = () => {
  const voices = [{ name: "Local Test Voice", lang: "en-US", localService: true, default: true, voiceURI: "local-test" }, { name: "Network Test Voice", lang: "en-US", localService: false, default: false, voiceURI: "network-test" },
    { name: "Local Prueba", lang: "es-US", localService: true, default: false, voiceURI: "local-es" }, { name: "Red Prueba", lang: "es-US", localService: false, default: false, voiceURI: "network-es" }];
  const log = []; window.__h3Synth = { log };
  class U { constructor(text) { this.text = text; this.voice = null; this.lang = ""; this.rate = 1; this.pitch = 1; this.volume = 1; } }
  let busy = false; let queue = [];
  const roomLights = () => { const m = window.__parishTest?.hiveWorld?.room?.(); const o = {}; for (const p of m?.placed ?? []) o[p.agent.id] = m.avatars?.state(p.agent.id)?.talkVisible ?? null; return o; };
  const synth = { speaking: false, pending: false, paused: false, onvoiceschanged: null, getVoices: () => voices, addEventListener() {}, removeEventListener() {},
    speak(u) { queue.push(u); pump(); }, cancel() { queue = []; }, pause() {}, resume() {} };
  function pump() {
    if (busy || !queue.length) return;
    const u = queue.shift(); busy = true; synth.speaking = true;
    const rec = { text: u.text, voice: u.voice?.name ?? null, local: u.voice?.localService === true };
    log.push(rec);
    setTimeout(() => {
      try { u.onstart?.({}); } catch (_) { /* the page's handler */ }
      rec.atStart = roomLights();
      setTimeout(() => {
        rec.beforeEnd = roomLights();
        try { u.onend?.({}); } catch (_) { /* the page's handler */ }
        rec.afterEnd = roomLights();
        busy = false; synth.speaking = false; pump();
      }, 160);
    }, 20);
  }
  Object.defineProperty(window, "speechSynthesis", { value: synth, configurable: true });
  window.SpeechSynthesisUtterance = U;
};
async function open(url, { auth = true, synth = true, viewport = { width: 800, height: 450 }, ctx = null } = {}) {
  const context = ctx ?? await pvContext(browser, { viewport, deviceScaleFactor: 1 });
  if (!ctx) {
    if (auth) await context.addInitScript(() => { try { localStorage.setItem("vr-training-auth-v1", JSON.stringify({ id: "learner-h3-drive" })); } catch (_) { /* storage blocked */ } });
    if (synth) await context.addInitScript(SYNTH_STUB);
  }
  const page = await context.newPage();
  page.on("pageerror", (e) => out.pageErrors.push(`${url.split("?")[1] ?? url}: ${String(e.message).split("\n")[0]}`));
  page.on("request", (r) => { const u = r.url(); if (u.startsWith("http://127.0.0.1") || u.startsWith("data:") || u.startsWith("blob:")) return; if (/cdnjs\.cloudflare\.com\/ajax\/libs\/(three\.js|react)/.test(u) || /fonts\.(googleapis|gstatic)/.test(u)) return; out.offHost.push(u); });
  await page.goto(url, { waitUntil: "load", timeout: 180000 });
  await page.waitForFunction(() => !!window.__parishTest?.hiveWorld && "agentAvatars" in window.__parishTest && "hive" in window.__parishTest, null, { timeout: 180000 });
  return { page, context };
}
const settle = (page, ms) => page.waitForTimeout(ms);
const storageKeys = (page) => page.evaluate(() => ({ local: Object.keys(localStorage).filter((k) => k.startsWith("h3-hive-settings")), session: Object.keys(sessionStorage).filter((k) => k.startsWith("h3-hive-settings")) }));

// ------------------------------------------------------------------------------------------------ A. signed in, sf-downtown
const SITE = "rb-site-soma-robot-cell";
let ctxA = null;
{
  const { page, context } = await open(parishUrl("sf-downtown"));
  ctxA = context;
  console.log("A. signed in, sf-downtown (stubbed speechSynthesis: one local, one network voice per language)");
  await page.evaluate(() => { window.__parishTest.ixScene("ixr-cell-hall"); window.__parishTest.hiveWorld.sync(); window.__parishTest.hive.voice(true); });
  await settle(page, 500);
  // 1 + 2: step the page's hive in the room with voice on; catch a visitor coming in and going out; sample the budget
  const run = await page.evaluate(async () => {
    const T = window.__parishTest, P = T.hive, hv = P.hive;
    const homed = new Set(hv.agents.filter((a) => a.homeSite === "rb-site-soma-robot-cell").map((a) => a.id));
    const seen = { in: [], out: [], budget: [], maxFigures: 0 };
    const wait = (ms) => new Promise((r) => setTimeout(r, ms));
    let visitorIn = null;
    for (let i = 0; i < 160; i += 1) {
      P.step();
      for (let k = 0; k < 80 && (P.voiceController.queued() > 0 || P.voiceController.speaking()); k += 1) await wait(50);
      await wait(120);
      const m = T.hiveWorld.room();
      const vis = m?.visitors?.() ?? [];
      for (const id of vis) if (!seen.in.some((x) => x.id === id)) { const fig = m.avatars.figure(id); let inGroup = false; for (let o = fig; o; o = o.parent) if (o === m.room.group) inGroup = true; seen.in.push({ id, step: hv.now(), inGroup, visible: !!m.avatars.state(id)?.visible }); visitorIn = id; }
      for (const x of seen.in) if (!x.left && !vis.includes(x.id) && !m.leaving().includes(x.id) && !m.avatars.figure(x.id)) { x.left = hv.now(); seen.out.push(x.id); }
      const mm = T.roboInteriors.measure(); seen.budget.push({ meshes: mm.meshes, tris: mm.trianglesBuilt, tex: mm.textureBytes, figures: m.counts().figures });
      seen.maxFigures = Math.max(seen.maxFigures, m.counts().figures);
      if (seen.out.length >= 1 && i > 40) break;
    }
    const caps = P.captions();
    return { ...seen, steps: hv.now(), homed: [...homed], log: window.__h3Synth.log.map((r) => ({ ...r, agent: caps.find((c) => c.text === r.text)?.agent ?? null })) };
  });
  want(run.in.length > 0 && run.in.every((x) => x.inGroup && x.visible), "1. an agent the hive sends to the SoMa cell is shown inside the cell hall (figure in the room's group, visible)", run.in.map((x) => `${x.id}@step ${x.step}`).join(", "));
  want(run.out.length > 0, "1. and it walks out when its job ends (figure released)", run.in.filter((x) => x.left).map((x) => `${x.id} in ${x.step} → out ${x.left}`).join(", "));
  const worst = run.budget.reduce((a, b) => ({ meshes: Math.max(a.meshes, b.meshes), tris: Math.max(a.tris, b.tris), tex: Math.max(a.tex, b.tex), figures: Math.max(a.figures, b.figures) }), { meshes: 0, tris: 0, tex: 0, figures: 0 });
  want(worst.meshes <= 120 && worst.tris <= 6000 && worst.tex <= 24 * 1048576, "1. the cell hall stays inside IX_BUDGET and IXR_TEX_BUDGET at every step (ixrMeasure in the page, shell signs included)", `worst ${worst.figures} figures, ${worst.meshes} meshes, ${worst.tris} triangles, ${(worst.tex / 1048576).toFixed(2)} MiB over ${run.budget.length} steps`);
  const lines = run.log.filter((r) => r.agent && r.atStart && Object.prototype.hasOwnProperty.call(r.atStart, r.agent));
  let exact = 0, offAfter = 0, lastLines = 0;
  lines.forEach((r) => {
    if (r.atStart[r.agent] === true && r.beforeEnd?.[r.agent] === true) exact += 1;
    const i = run.log.indexOf(r), next = run.log[i + 1];
    if (!next || next.agent !== r.agent) { lastLines += 1; if (r.afterEnd?.[r.agent] === false || r.afterEnd?.[r.agent] === undefined) offAfter += 1; }
  });
  want(lines.length > 0 && exact === lines.length, "2. talk light on from onstart to onend for every line by an agent in the room", `${exact} of ${lines.length} (${run.log.length} utterances in all over ${run.steps} hive steps)`);
  want(offAfter === lastLines, "2. and off once the agent's last line ends", `${offAfter} of ${lastLines}`);
  const net = run.log.filter((r) => !r.local).length;
  want(net === 0 && run.log.length > 0, "2. network voices chosen", `${net} of ${run.log.length} utterances (voices used: ${[...new Set(run.log.map((r) => r.voice))].join(", ")})`);
  out.talk = { exact, lines: lines.length, offAfter, lastLines, net, utterances: run.log.length, visitors: run.in.length, left: run.out.length, worst };
  // 3. remembered settings (voice is on already): supervise on, then Spanish (the page reloads)
  await page.evaluate(() => { window.__parishTest.hive.supervise(true); });
  const k1 = await storageKeys(page);
  await Promise.all([page.waitForNavigation({ waitUntil: "load", timeout: 180000 }), page.evaluate(() => { window.__parishTest.hive.language("es"); })]);
  await page.waitForFunction(() => !!window.__parishTest?.hive?.state, null, { timeout: 180000 });
  await settle(page, 500);
  const after = await page.evaluate(() => { const s = window.__parishTest.hive.state(); return { voice: s.voice, supervise: s.supervise, lang: s.lang, remembered: s.remembered }; });
  const k2 = await storageKeys(page);
  want(after.voice === true && after.supervise === true && after.lang === "es", "3. voice, supervise every job and Spanish come back after the reload", after);
  want(k2.local.length === 1 && /^h3-hive-settings-v1::id-[0-9a-f]{16}$/.test(k2.local[0]) && k2.session.length === 0 && k1.local.length === 1, "3. stored only under the profile's namespaced key on this device", k2);
  // 4. the panel in Spanish
  const es = await page.evaluate(() => {
    const box = document.getElementById("oh-hive"); const text = box?.innerText ?? "";
    const english = ["software agents managing the simulated robots", "Seven software agents, not people", "Home:", "Voice: on", "Voice: off", "Supervise every job", "Approve (simulated only)", "Decline", "Waiting for you", "completed", "audit chain", "Dispatcher: announces", "Safety steward: reviews", "Maintenance planner: takes", "Consent keeper: asks", "Trainer: takes", "Auditor: re-walks", "Logistics: takes", "Language: English", "Run 10 steps"];
    const found = english.filter((s) => text.includes(s));
    const labels = [...box.querySelectorAll(".oh-label")].map((n) => n.textContent);
    return { found, labels, lang: box?.lang, review: !!box?.querySelector(".oh-review"), sample: text.slice(0, 160) };
  });
  want(es.found.length === 0, "4. the Spanish panel shows none of the panel's English UI strings or role sentences", es.found.length ? es.found.join(" | ") : es.sample);
  want(es.labels.length === 7 && es.labels.every((l) => l === "agente de software") && es.review && es.lang === "es-US", "4. seven cards labelled \"agente de software\", the native-speaker review note shown, lang es-US", { labels: es.labels.length, review: es.review, lang: es.lang });
  // back to English for the scene (kept for this profile, reload)
  await Promise.all([page.waitForNavigation({ waitUntil: "load", timeout: 180000 }), page.evaluate(() => { window.__parishTest.hive.language("en"); })]);
  await page.waitForFunction(() => !!window.__parishTest?.hive?.state, null, { timeout: 180000 });
  out.settings = { after, keys: k2 };
  await page.close();
}

// ------------------------------------------------------------------------------------------------ B. demo, K-12, signed out
{
  console.log("B. demo, K-12 and signed out keep nothing");
  for (const [label, url, auth] of [["demo", parishUrl("sf-downtown", "&demo=1"), true], ["K-12", parishUrl("sf-downtown", "&k12=1"), true], ["signed out", parishUrl("sf-downtown"), false]]) {
    const { page, context } = await open(url, { auth, synth: false });
    const r = await page.evaluate(() => ({ panel: !!document.getElementById("oh-hive"), hive: !!window.__parishTest.hive, prefs: window.__parishTest.hivePrefs ? { allowed: window.__parishTest.hivePrefs.allowed, reason: window.__parishTest.hivePrefs.reason, wrote: window.__parishTest.hivePrefs.write({ voice: true }) } : null }));
    const keys = await storageKeys(page);
    want(!r.panel && !r.hive && r.prefs?.allowed === false && r.prefs?.wrote === false && keys.local.length === 0 && keys.session.length === 0, `${label}: no panel, the settings refuse (${r.prefs?.reason}), no hive settings key in storage`, { ...r, keys });
    await context.close();
  }
}

// ------------------------------------------------------------------------------------------------ C. the hive's day
{
  console.log("C. \"A day in the hive\" (seed 1)");
  const { page, context } = await open(parishUrl("sf-downtown"), { viewport: { width: 960, height: 540 }, ctx: null });
  const start = await page.evaluate(() => { const r = window.__parishTest.hiveScene({ seed: 1 }); return { ok: r.ok, duration: r.duration, beats: r.beats.length }; });
  want(start.ok && start.duration >= 20 && start.duration <= 30, "the scene starts on sf-downtown, 20–30 s long", start);
  const shots = [2, 5.5, 8.5, 12, 15.5, 19, 22.5, 25.5];
  const t0 = Date.now();
  for (const at of shots) {
    const now = await page.evaluate(() => window.__parishTest.hiveSceneState()?.t ?? null);
    if (now != null && now < at) await settle(page, Math.round((at - now) * 1000));
    if (OUT) await page.screenshot({ path: join(OUT, `scene-${String(at).replace(".", "_")}s.png`) });
  }
  const res = await page.evaluate(() => window.__parishTest.hiveSceneDone);
  const ids = res.beats.map((b) => b.id).join(",");
  want(ids === "intro,arrive,bids,award,walk-out,outside,refusal,approval,approved,walk-in,run,end", "the beats in order", ids);
  const has = (id, s) => (res.beats.find((b) => b.id === id)?.events ?? []).some((e) => e.startsWith(s));
  want(has("award", "award:oh-maintenance-planner") && has("walk-out", "move:oh-maintenance-planner") && has("refusal", "refused:") && has("approval", "approval-request:") && has("walk-in", "move:") && has("run", "dispatch:"), "award, walk-out, refusal, approval request, walk-in and the simulated run all happened", res.beats.map((b) => `${b.id}:${b.events.join("|")}`).join("  "));
  const refusal = res.captions.find((c) => c.title === "The governor refuses"), approved = res.captions.find((c) => /You approve/.test(c.title));
  want(!!refusal && /closer than the site's minimum separation/.test(refusal.text) && !!approved, "the refusal's reason and the approval are captioned", { refusal: refusal?.text, approved: approved?.title });
  want(res.metrics.physicalDispatched === 0 && res.verify.ok && res.errors === 0, "no physical dispatch, the scene hive's audit chain intact, no scene errors", { physical: res.metrics.physicalDispatched, chain: res.verify, errors: res.errors });
  console.log(`     scene ran ${res.t} s on the scene clock (${((Date.now() - t0) / 1000).toFixed(1)} s wall)`);
  out.scene = { t: res.t, captions: res.captions };
  await context.close();
}

// ------------------------------------------------------------------------------------------------ D. the panel on a phone
{
  console.log("D. the hive panel at 390x844 with touch (signed in): every button at least 44 px, no sideways scroll");
  const context = await pvContext(browser, { viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true, deviceScaleFactor: 2 });
  await context.addInitScript(() => { try { localStorage.setItem("vr-training-auth-v1", JSON.stringify({ id: "learner-h3-drive" })); } catch (_) { /* storage blocked */ } });
  const { page } = await open(parishUrl("sf-downtown"), { ctx: context });
  const r = await page.evaluate(() => {
    try { window.__parishTest.ux?.select?.("learn"); } catch (_) { /* older menu */ }
    const box = document.getElementById("oh-hive");
    const btns = [...(box?.querySelectorAll("button") ?? [])].map((b) => { const q = b.getBoundingClientRect(); return { t: (b.dataset.oh || b.textContent).slice(0, 20), w: Math.round(q.width), h: Math.round(q.height) }; });
    const lang = btns.find((b) => b.t === "language");
    return { n: btns.length, small: btns.filter((b) => b.h < 43.5 || b.w < 43.5), lang, hscroll: document.documentElement.scrollWidth > innerWidth + 1 };
  });
  want(r.n >= 5 && r.small.length === 0 && r.lang && r.lang.h >= 44, `hive panel buttons >= 44 px: ${r.n - r.small.length} of ${r.n} (the new language button ${r.lang ? `${r.lang.w}x${r.lang.h}` : "missing"})`, r.small.map((b) => `${b.t}:${b.w}x${b.h}`).join(", ") || undefined);
  want(!r.hscroll, "no horizontal scroll at 390x844 with the hive panel in the Learn tab");
  await context.close();
}

console.log(`\npage errors ${out.pageErrors.length}${out.pageErrors.length ? `: ${out.pageErrors.slice(0, 5).join(" | ")}` : ""}; off-host requests ${out.offHost.length}${out.offHost.length ? `: ${out.offHost.slice(0, 3).join(" ")}` : ""}`);
if (out.pageErrors.length || out.offHost.length) out.fails += 1;
console.log(`drive_hive3: ${out.fails ? `${out.fails} failed` : "all steps pass"}`);
if (OUT) { const { writeFileSync } = await import("node:fs"); writeFileSync(join(OUT, "drive-hive3.json"), JSON.stringify(out, null, 1)); }
await ctxA?.close().catch(() => {});
await browser.close();
await close();
process.exit(out.fails ? 1 : 0);
