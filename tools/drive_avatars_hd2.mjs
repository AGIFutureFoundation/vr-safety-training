#!/usr/bin/env node
/**
 * AVATARS-HD-2 (docs/consoles/AVATARS-HD-2.md): the headless drive of the BUILT parishes page (sf-downtown, signed in, desktop high).
 *
 *   V. The voice in the page: speechSynthesis is stubbed before the page loads (one local voice and one network voice; onstart 0.1 s
 *      after speak, then a word boundary per word at 90 ms + 28 ms a letter, onend 0.2 s after the last). Voice is turned on in the
 *      Omega Hive panel and the page's own hive is stepped. The stub reads the speaking agent's outdoor figure (state()) just before
 *      and just after it fires each event, so the measure does not depend on the frame rate (a loaded machine draws about one
 *      frame a second at 1920 x 1080). Measured: the network voice is never chosen; the light is off just before onstart, on just
 *      after it and off after onend, N of N lines; every word boundary the stub fires reaches the figure (its count rises by one).
 *   S. The stop hand from the front: one of the hive's own refusals replayed on its agent at the SoMa robot cell, the clock run to the
 *      middle of the gesture, the camera 2.6 m in front of the figure (ah2-stop-front.png).
 *   R. An HD agent speaking inside a robotics room: the cell hall (ixScene), the page's room mount (the room level of the high-detail
 *      figure), one of the hive's own lines replayed on an agent standing in the room, the clock run to an open mouth, the figure
 *      placed in front of the room's camera preset (ah2-room-speaking.png); the room's meshes, triangles and draw calls.
 *   Page errors and off-host requests are counted throughout.
 *
 * Not in the gate. Build first, then run (one drive at a time on the machine):
 *     python3 tools/bundle_webxr.py parishes && node tools/drive_avatars_hd2.mjs [port] [stillsDir]
 */
import { pathToFileURL, fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { mkdirSync } from "node:fs";
const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const { pvServe, pvLaunch, pvContext } = await import(pathToFileURL(join(ROOT, "tools/lib/pv_browser.mjs")).href);

const PORT = Number(process.argv[2]) || 9131, SHOTS = process.argv[3] ?? join(ROOT, ".ah2-shots");
mkdirSync(SHOTS, { recursive: true });
const { base, close } = await pvServe(PORT);
const browser = await pvLaunch();
const out = { pageErrors: [], offHost: [], fails: 0 };
const log = (k, v) => console.log(k, typeof v === "string" ? v : JSON.stringify(v));
const want = (cond, what, detail) => { if (!cond) out.fails += 1; console.log(`${cond ? "  ✓" : "  ✗"} ${what}${detail !== undefined ? ` — ${typeof detail === "string" ? detail : JSON.stringify(detail)}` : ""}`); return cond; };

const context = await pvContext(browser, { viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 });
await context.addInitScript(() => {
  try { localStorage.setItem("vr-training-auth-v1", JSON.stringify({ id: "learner-ah2-drive" })); } catch (_) { /* storage blocked */ }
  // a stubbed speechSynthesis: one local voice, one network voice; word-length boundaries on real timers
  const voices = [{ name: "Local Voice", lang: "en-US", localService: true, default: true, voiceURI: "local" }, { name: "Network Voice", lang: "en-US", localService: false, default: false, voiceURI: "net" }];
  const rec = []; window.__ah2Voice = rec;
  const timers = [];
  const synth = {
    speaking: false, pending: false, paused: false, onvoiceschanged: null, getVoices: () => voices, pause() {}, resume() {}, addEventListener() {}, removeEventListener() {},
    cancel() { for (const t of timers.splice(0)) clearTimeout(t); },
    speak(u) {
      const r = { text: u.text, voice: u.voice?.name ?? null, local: u.voice?.localService === true, handed: performance.now(), start: null, end: null, bounds: [], reached: 0, pre: null, post: null, after: null }; rec.push(r);
      // the speaking agent's outdoor figure, read synchronously around each event (the agent from the panel's own caption list)
      const probe = () => { try { const T = window.__parishTest, c = T?.hive?.captions?.().slice().reverse().find((x) => String(x.text).trim() === String(u.text).trim()); const st = c ? T.agentAvatars?.state(c.agent) : null; return st ? { agent: c.agent, speaking: st.speaking, waiting: st.waiting, boundaries: st.boundaries, line: st.line } : null; } catch (_) { return null; } };
      const at = (ms, fn) => timers.push(setTimeout(fn, ms));
      at(100, () => { r.start = performance.now(); r.pre = probe(); u.onstart?.({ type: "start" }); r.post = probe(); });
      let tv = 140; for (const m of String(u.text).matchAll(/\S+/g)) { const ci = m.index; at(tv, () => { r.bounds.push(performance.now()); const b0 = probe()?.boundaries ?? 0; u.onboundary?.({ name: "word", charIndex: ci }); if ((probe()?.boundaries ?? 0) === b0 + 1) r.reached += 1; }); tv += 90 + 28 * m[0].length; }
      at(tv + 200, () => { r.end = performance.now(); u.onend?.({ type: "end" }); r.after = probe(); });
    },
  };
  Object.defineProperty(window, "speechSynthesis", { value: synth, configurable: true });
  window.SpeechSynthesisUtterance = class { constructor(t) { this.text = t; this.voice = null; this.lang = ""; this.rate = 1; this.pitch = 1; } };
});
const page = await context.newPage();
page.on("pageerror", (e) => out.pageErrors.push(String(e.message).split("\n")[0]));
page.on("request", (r) => { const u = r.url(); if (u.startsWith("http://127.0.0.1") || u.startsWith("data:") || u.startsWith("blob:")) return; if (/cdnjs\.cloudflare\.com\/ajax\/libs\/(three\.js|react)/.test(u) || /fonts\.(googleapis|gstatic)/.test(u)) return; out.offHost.push(u); });
await page.goto(`${base}/parishes/dist/parishes.html?parish=sf-downtown&tier=high`, { waitUntil: "load", timeout: 180000 });
await page.waitForFunction(() => "agentAvatars" in (window.__parishTest ?? {}) && !!window.__parishTest?.robotics && "hive" in window.__parishTest, null, { timeout: 180000 });

// ---------------------------------------------------------------- V. the voice in the page
const V = await page.evaluate(async () => {
  const T = window.__parishTest, aa = T.agentAvatars, panel = T.hive, hv = panel?.hive;
  if (!aa || !hv) return { ok: false, aa: !!aa, hive: !!hv };
  const ids = hv.agents.map((a) => a.id);
  panel.voice(true, { remember: false });
  const t0 = performance.now();
  await new Promise((done) => { const iv = setInterval(() => { if (panel.voiceController.queued() <= 2) hv.step(); if (performance.now() - t0 > 24000) { clearInterval(iv); done(); } }, 700); });
  panel.voice(false, { remember: false });
  const all = window.__ah2Voice, recs = all.filter((r) => r.start != null && r.end != null && r.pre && r.post && r.after);
  const network = all.filter((r) => !r.local).length;
  // the light: off just before onstart (the line waits), on just after it with this line, off after onend
  const lightOk = recs.filter((r) => !r.pre.speaking && r.post.speaking && r.post.line === String(r.text).trim() && !(r.after.speaking && r.after.line === String(r.text).trim()));
  const waited = recs.filter((r) => r.pre.waiting && r.pre.line === String(r.text).trim()).length;
  const fired = recs.reduce((a, r) => a + r.bounds.length, 0), reached = recs.reduce((a, r) => a + r.reached, 0);
  return { ok: true, said: all.length, spoken: recs.length, network, chosen: ids.map((id) => panel.voiceController.chosen(id)).filter(Boolean).map((c) => c.name), light: lightOk.length, waited, fired, reached, captions: panel.captions().length, bad: recs.filter((r) => !lightOk.includes(r)).slice(0, 3).map((r) => ({ text: r.text.slice(0, 40), pre: r.pre, post: r.post, after: r.after })) };
});
log("V", V);
if (V.ok) {
  want(V.spoken >= 3 && V.network === 0 && V.chosen.every((n) => n === "Local Voice"), `voice on in the page: ${V.spoken} lines spoken by the local voice, the network voice chosen ${V.network} times`);
  want(V.fired > 0 && V.reached === V.fired, `word boundaries reach the outdoor figures in the built page: ${V.reached} of ${V.fired} (each one raises the figure's count by one)`);
  want(V.spoken > 0 && V.light === V.spoken, `the talk light starts at onstart in the built page: off just before it and on just after it, off after onend, ${V.light} of ${V.spoken} lines (${V.waited} were waiting with their caption up)`, V.bad);
} else want(false, "the hive and the avatars are mounted", V);

// ---------------------------------------------------------------- S. the stop hand from the front (outdoors, the full high-detail figure)
const S = await page.evaluate(async () => {
  const T = window.__parishTest, aa = T.agentAvatars, hv = T.hive.hive;
  const frame = () => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
  const refusals = []; const onRef = (e) => refusals.push(e); hv.on("refused", onRef);
  for (let i = 0; i < 120 && !refusals.some((e) => hv.agents.some((a) => a.id === e.agent)); i += 1) hv.step();
  hv.off?.("refused", onRef);
  const e = refusals.find((x) => hv.agents.some((a) => a.id === x.agent)); if (!e) return { ok: false, refusals: refusals.length };
  const site = T.robotics.sites.find((s) => s.id === "rb-site-soma-robot-cell") ?? T.robotics.sites[0];
  aa.handle({ type: "move", agent: e.agent, to: site.id }); for (let i = 0; i < 4; i += 1) await frame();
  const orig = aa.animate; let t = aa.clock(); for (let k = 0; k < 60; k += 1) { t += 0.5; orig(t, 0.5, null); } // earlier lines end
  aa.animate = () => {};
  t += 0.05; orig(t, 0.05, null); aa.handle(e); for (let k = 0; k < 90; k += 1) { t += 0.01; orig(t, 0.01, null); } // mid-gesture (0.9 of 1.8 s)
  const x = site.position[0], z = site.position[1] - 10, g = aa.figure(e.agent), st = aa.state(e.agent);
  for (const a of hv.agents) { const o = aa.figure(a.id); if (o && a.id !== e.agent) o.visible = false; }
  for (const id of ["agent-client", "agent-provider", "agent-evaluator", "agent-governor"]) { const o = aa.figure(id); if (o) o.visible = false; }
  g.position.set(x, st.y, z); g.rotation.y = 0; g.visible = true;
  const cv = T.npRenderer.domElement; for (const el of document.body.querySelectorAll("*")) if (el !== cv && !el.contains(cv)) el.style.visibility = "hidden";
  T.teleport(x, z + 2.6, 0, 0.04);
  for (let i = 0; i < 3; i += 1) await frame();
  return { ok: true, agent: e.agent, reason: e.reason ?? null, gesture: aa.state(e.agent).gesture, caption: aa.state(e.agent).caption, hd: g.userData.aaAgent?.hd === true, level: g.userData.aaAgent?.level ?? null };
});
log("S", S);
if (S.ok) { await page.screenshot({ path: join(SHOTS, "ah2-stop-front.png"), type: "png" }); want(S.gesture === "stop" && S.hd, `stop still: ${S.agent} holds the stop hand on the hive's refusal (${S.reason}), the ${S.level} high-detail figure, from the front`, S.caption); }
else want(false, "a hive refusal to replay", S);

// ---------------------------------------------------------------- R. an HD agent speaking inside a robotics room (the room level)
const R = await page.evaluate(async () => {
  const T = window.__parishTest, hv = T.hive.hive;
  const frame = () => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
  for (const el of document.body.querySelectorAll("*")) el.style.visibility = "";
  T.agentAvatars.animate = () => {}; // the outdoor layer stays frozen (it is not drawn inside the room)
  const said = []; const onSpeak = (e) => said.push(e); hv.on("speak", onSpeak);
  const sc = T.ixScene("ixr-cell-hall"); if (!sc) return { ok: false, why: "ixScene" };
  T.hiveWorld.sync(); for (let i = 0; i < 4; i += 1) await frame();
  const rm = T.hiveWorld.room(); if (!rm?.avatars) return { ok: false, why: "no room mount", sc };
  for (let i = 0; i < 80 && !said.some((x) => rm.placed.some((p) => p.agent.id === x.agent) && String(x.text).split(/\s+/).length >= 6); i += 1) hv.step();
  hv.off?.("speak", onSpeak);
  const placed = rm.placed.map((p) => p.agent.id), e = said.find((x) => placed.includes(x.agent) && String(x.text).split(/\s+/).length >= 6) ?? null;
  if (!e) return { ok: false, why: "no line by a room agent", placed, said: said.length };
  const av = rm.avatars; rm.animate = () => {};
  let t = av.clock(); for (let k = 0; k < 60; k += 1) { t += 0.5; av.animate(t, 0.5, null); }
  t += 0.05; av.animate(t, 0.05, null); av.handle({ ...e, type: "speak" }); let m = 0;
  for (let k = 0; k < 400 && m < 0.9; k += 1) { t += 0.01; av.animate(t, 0.01, null); m = av.state(e.agent).mouth; }
  const c = sc.camera, d = 3.3, fx = c.x - Math.sin(c.yaw) * d + Math.cos(c.yaw) * 0.35, fz = c.z - Math.cos(c.yaw) * d - Math.sin(c.yaw) * 0.35;
  const g = av.figure(e.agent); g.position.set(fx, 0, fz); g.rotation.y = Math.atan2(c.x - fx, c.z - fz);
  for (const id of placed) { const o = av.figure(id); if (o && id !== e.agent) o.visible = false; }
  const cv = T.npRenderer.domElement; for (const el of document.body.querySelectorAll("*")) if (el !== cv && !el.contains(cv)) el.style.visibility = "hidden";
  for (let i = 0; i < 3; i += 1) await frame();
  const meas = T.roboInteriors.measure(), st = av.state(e.agent);
  return { ok: true, style: sc.style, agent: e.agent, text: e.text, mouth: st.mouth, talk: st.talkVisible, caption: st.caption, hd: g.userData.aaAgent?.hd === true, level: g.userData.aaAgent?.level ?? null, counts: av.counts(), room: { meshes: meas.meshes, trianglesBuilt: meas.trianglesBuilt, calls: meas.calls, triangles: meas.triangles }, placed };
});
log("R", R);
if (R.ok) {
  await page.screenshot({ path: join(SHOTS, "ah2-room-speaking.png"), type: "png" });
  want(R.hd && R.level === "room" && R.mouth >= 0.9 && R.talk && !!R.caption, `room still: ${R.agent} speaks in the ${R.style} — the room level of the high-detail figure, mouth ${R.mouth.toFixed(2)}, its caption up`, R.caption);
  want(R.room.meshes <= 120 && R.room.trianglesBuilt <= 6000, `the room in the page with its figures: ${R.room.meshes} meshes, ${R.room.trianglesBuilt} triangles built (IX_BUDGET 120 / 6000); renderer ${R.room.calls} calls, ${R.room.triangles} triangles drawn`);
} else want(false, "an agent speaking in a robotics room", R);

want(out.pageErrors.length === 0, `page errors: ${out.pageErrors.length}`, out.pageErrors.slice(0, 5));
want(out.offHost.length === 0, `off-host requests: ${out.offHost.length}`, out.offHost.slice(0, 5));
await context.close(); await browser.close(); close();
console.log(out.fails ? `\n${out.fails} drive step(s) failed.` : "\nAll drive steps pass.");
process.exit(out.fails ? 1 : 0);
