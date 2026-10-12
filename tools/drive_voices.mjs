// VOICES headless drive of the BUILT pages (not in the gate; docs/consoles/VOICES.md). Prints one line per step.
//   python3 tools/bundle_webxr.py parishes bayworld summit redwood && node tools/drive_voices.mjs [port] [screenshot-dir]
// A: parishes (Orleans) - the Me tab settings beside reduced motion (toggle, test, table), the dialogue panel's voice row, voice off
//    (0 utterances, the synth untouched, the same captions), voice on (only pack lines, only local voices, the profile's rate and
//    pitch, the talk light exactly while a line is spoken), A2 the hive linked to the characters' voice (no overlap), A3 no
//    on-device voice (network-only, none), A4 no speechSynthesis. B: the same dialogue in Bay World, Summit and Redwood. C: phone
//    width. D: reduced motion. E: the hive in Spanish (?lang=es). F: what the talk light costs per tier (calls, triangles, meshes).
// Env VC_PARTS=A,B,... runs a subset. speechSynthesis is a stub (a local and a network voice, and Spanish ones for E).
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { tmpdir } from "node:os";
const WT = join(dirname(fileURLToPath(import.meta.url)), "..");
const PORT = Number(process.argv[2]) || 9102;
const SP = process.argv[3] || tmpdir();
const { pvServe, pvLaunch, pvContext, pvPhone, pvLoad } = await import(`${WT}/tools/lib/pv_browser.mjs`);

const STUB = (cfg) => {
  const st = { spoken: [], speaking: null, overlaps: 0, cancels: 0, speaks: 0 };
  const all = [
    { name: "Google US English", lang: "en-US", localService: false, default: true, voiceURI: "net1" },
    { name: "Samantha", lang: "en-US", localService: true, default: false, voiceURI: "samantha" },
    { name: "Alex", lang: "en-US", localService: true, default: false, voiceURI: "alex" },
    { name: "Daniel", lang: "en-GB", localService: true, default: false, voiceURI: "daniel" },
  ];
  const spanish = [{ name: "Jorge", lang: "es-ES", localService: true, default: false, voiceURI: "jorge" }, { name: "Monica", lang: "es-ES", localService: true, default: false, voiceURI: "monica" }, { name: "Google español", lang: "es-ES", localService: false, default: false, voiceURI: "net-es" }];
  const voices = cfg?.voices === "network-only" ? all.filter((v) => !v.localService) : cfg?.voices === "none" ? [] : cfg?.voices === "with-spanish" ? [...all, ...spanish] : all;
  window.__vcSynth = st;
  window.SpeechSynthesisUtterance = class { constructor(text) { this.text = text; } };
  const synth = {
    getVoices: () => voices,
    speak(u) { st.speaks += 1; if (st.speaking) st.overlaps += 1; st.speaking = u; st.spoken.push({ voice: u.voice?.name ?? null, localService: u.voice?.localService ?? null, lang: u.lang, rate: u.rate, pitch: u.pitch, text: u.text }); setTimeout(() => u.onstart?.(), 1); setTimeout(() => { if (st.speaking === u) { st.speaking = null; u.onend?.(); } }, 300); },
    cancel() { st.cancels += 1; st.speaking = null; },
    addEventListener() {}, removeEventListener() {}, speaking: false, pending: false,
  };
  Object.defineProperty(window, "speechSynthesis", { value: synth, configurable: true });
};

const { base, close } = await pvServe(PORT);
const browser = await pvLaunch();
const out = { pageErrors: [], consoleErrors: [], offHost: [], routedThree: 0 };
const log = (k, v) => console.log(k, typeof v === "string" ? v : JSON.stringify(v));
const t0 = Date.now();
const PARTS = (process.env.VC_PARTS ?? "A,A2,A3,A4,B,C,D,E,F").split(",");
const want = (k) => PARTS.includes(k);
log("load", pvLoad());

async function newPage(opts = {}, cfg = {}) {
  const context = await pvContext(browser, opts);
  await context.addInitScript(STUB, cfg);
  const page = await context.newPage();
  page.on("pageerror", (e) => out.pageErrors.push(e.message));
  page.on("console", (m) => { if (m.type() === "error") out.consoleErrors.push(m.text().slice(0, 160)); });
  page.on("request", (r) => { const u = r.url(); if (u.startsWith("http://127.0.0.1")) return; if (/cdnjs\.cloudflare\.com\/ajax\/libs\/three\.js\//.test(u)) { out.routedThree += 1; return; } out.offHost.push(u); });
  return { context, page };
}
const bootParish = async (page, q = "") => { await page.goto(`${base}/parishes/dist/parishes.html?parish=orleans${q}`, { waitUntil: "load", timeout: 120000 }); await page.waitForFunction(() => !!window.__parishTest && !!window.__parishTest.npc && !!window.__parishTest.voices, null, { timeout: 120000 }); };

// ---------------------------------------------------------------- A: parishes
if (want("A")) {
  const { context, page } = await newPage({});
  await bootParish(page);
  log("A.menu", await page.evaluate(() => {
    const tog = document.getElementById("vc-voices-toggle"); const info = document.getElementById("menu-voice-info");
    const reduced = document.getElementById("ux-reduced"); const sound = document.getElementById("menu-sound");
    const rows = [...document.querySelectorAll("#vc-voice-table tr[data-character]")];
    const same = tog && reduced && tog.closest(".row") === reduced.closest(".row");
    return { toggle: tog?.textContent, pressed: tog?.getAttribute("aria-pressed"), besideReducedMotion: !!same, order: [...tog.closest(".row").children].map((c) => c.id || c.className.slice(0, 12)).slice(0, 8), note: document.getElementById("vc-voice-note")?.textContent, testDisabled: document.getElementById("vc-voice-test")?.disabled, tableRows: rows.length, firstRow: rows[0]?.textContent, voiceOfFirst: rows[0]?.lastChild?.textContent, characters: window.__parishTest.npc.characters.length, enabled: window.__parishTest.npc.voice.enabled(), speaks: window.__vcSynth.speaks };
  }));
  await page.click("#ux-tab-me");
  try { const el = await page.$("#ux-panel-me"); if (el) { await el.scrollIntoViewIfNeeded(); await el.screenshot({ path: `${SP}/me-voices-off.png` }); log("A.shotMeOff", `${SP}/me-voices-off.png`); } } catch (e) { log("A.shotMeOff", `failed: ${String(e.message).split("\n")[0]}`); }

  // voice OFF: the dialogue opens, the captions show, nothing is spoken, the synth is untouched, the light follows the reading window
  const offState = await page.evaluate(async () => {
    const npc = window.__parishTest.npc; const e = npc.characters[0];
    npc.talk(e); const panel = document.getElementById("gr-panel");
    const asked = npc.ask(e.ch.pack[1].topic);
    const logHtml = panel.querySelector(".gr-log").innerHTML;
    const bar = panel.querySelector("#gr-voice");
    const st = npc.talkState();
    const res = { panelOpen: !panel.hidden, hasBar: !!bar, barText: bar.textContent, toggle: bar.querySelector('[data-vc="toggle"]')?.getAttribute("aria-pressed"), testDisabled: bar.querySelector('[data-vc="test"]')?.disabled, lightMode: st.mode, lightOn: st.lightVisible, speaks: window.__vcSynth.speaks, cancels: window.__vcSynth.cancels, taught: asked.teach?.text?.slice(0, 60), logHtml };
    return res;
  });
  const offLog = offState.logHtml; delete offState.logHtml;
  log("A.voiceOff", offState);
  await page.waitForTimeout(100);
  log("A.shotPanelOff", await (async () => { try { const el = await page.$("#gr-panel"); await el.screenshot({ path: `${SP}/panel-voice-off.png` }); return `${SP}/panel-voice-off.png`; } catch (e) { return `failed: ${String(e.message).split("\n")[0]}`; } })());

  // voice ON from the panel's own toggle; the Me tab shows the same state
  const logBefore = await page.evaluate(() => document.querySelector("#gr-panel .gr-log").innerHTML);
  await page.click('#gr-voice [data-vc="toggle"]');
  log("A.toggled", await page.evaluate(() => ({ panelBar: document.querySelector('#gr-voice [data-vc="toggle"]').textContent, panelPressed: document.querySelector('#gr-voice [data-vc="toggle"]').getAttribute("aria-pressed"), meTab: document.getElementById("vc-voices-toggle").textContent, enabled: window.__parishTest.npc.voice.enabled(), note: document.querySelector("#gr-voice .gr-vc-note").textContent, testDisabled: document.querySelector('#gr-voice [data-vc="test"]').disabled })));
  const onState = await page.evaluate(async () => {
    const npc = window.__parishTest.npc; const e = npc.characters[0]; const S = window.__vcSynth;
    S.spoken.length = 0; S.speaks = 0;
    const logHtml = document.querySelector("#gr-panel .gr-log").innerHTML;
    npc.ask(e.ch.pack[1].topic);
    const wait = (f, ms = 3000) => new Promise((res) => { const t = Date.now(); const id = setInterval(() => { if (f() || Date.now() - t > ms) { clearInterval(id); res(f()); } }, 5); });
    const started = await wait(() => npc.talkState().speaking && npc.talkState().mode === "voice");
    const during = { ...npc.talkState(), lightMeshVisible: e.figure.children.some((c) => c.name === "gr-talk-light" && c.visible), meshes: (() => { let n = 0; e.figure.traverse((o) => { if (o.isMesh) n += 1; }); return n; })() };
    const ended = await wait(() => !npc.talkState().speaking);
    const after = { ...npc.talkState(), lightGone: !e.figure.children.some((c) => c.name === "gr-talk-light") };
    const prof = npc.voice.profile(e.ch);
    return { logHtml, started, during, ended, after, spoken: S.spoken.slice(), profile: { rate: prof.rate, pitch: prof.pitch }, inPack: S.spoken.every((u) => e.ch.pack.some((l) => l.text === u.text)), overlaps: S.overlaps };
  });
  log("A.voiceOn", { ...onState, logHtml: undefined, capturedEqualAfterToggle: onState.logHtml === logBefore });
  // the Me tab test
  await page.evaluate(() => { window.__vcSynth.spoken.length = 0; window.__parishTest.npc.close(); });
  await page.click("#vc-voice-test");
  await page.waitForTimeout(500);
  log("A.meTest", await page.evaluate(() => ({ caption: document.getElementById("vc-voice-caption")?.textContent?.slice(0, 120), captionHidden: document.getElementById("vc-voice-caption")?.hidden, spoken: window.__vcSynth.spoken.map((u) => ({ voice: u.voice, local: u.localService, rate: u.rate, pitch: u.pitch, textStart: u.text.slice(0, 50) })), toggle: document.getElementById("vc-voices-toggle").textContent, voiceByCharacter: [...document.querySelectorAll("#vc-voice-table tr[data-character]")].map((r) => r.lastChild.textContent) })));
  try { const el = await page.$("#ux-panel-me"); if (el) { await el.screenshot({ path: `${SP}/me-voices-on.png` }); log("A.shotMeOn", `${SP}/me-voices-on.png`); } } catch (e) { log("A.shotMeOn", `failed: ${String(e.message).split("\n")[0]}`); }
  // every mounted character, voice on: one utterance per dialogue, pack line, local voice, profile rate/pitch
  log("A.allCharacters", await page.evaluate(async () => {
    const npc = window.__parishTest.npc; const S = window.__vcSynth; S.spoken.length = 0; S.speaks = 0; S.overlaps = 0;
    const wait = (f, ms = 2000) => new Promise((res) => { const t = Date.now(); const id = setInterval(() => { if (f() || Date.now() - t > ms) { clearInterval(id); res(f()); } }, 3); });
    let n = 0, verbatim = 0, local = 0, prof = 0, lightExact = 0;
    for (const e of npc.characters) {
      const before = S.spoken.length; npc.talk(e);
      const sawLight = await wait(() => npc.talkState().speaking && npc.talkState().mode === "voice");
      const lightMesh = e.figure.children.some((c) => c.name === "gr-talk-light" && c.visible);
      await wait(() => !npc.talkState().speaking);
      const gone = !npc.talkState().speaking && !e.figure.children.some((c) => c.name === "gr-talk-light");
      const u = S.spoken[before]; n += 1;
      if (S.spoken.length === before + 1 && e.ch.pack.some((l) => l.text === u.text)) verbatim += 1;
      if (u?.localService === true) local += 1;
      const p = npc.voice.profile(e.ch); if (u && u.rate === p.rate && u.pitch === p.pitch) prof += 1;
      if (sawLight && lightMesh && gone) lightExact += 1;
      npc.close();
    }
    return { characters: n, verbatim, local, profile: prof, lightExact, overlaps: S.overlaps, voices: [...new Set(S.spoken.map((u) => u.voice))], network: S.spoken.filter((u) => u.localService !== true).length };
  }));
  // voice off again: closing the dialogue and toggling off in the Me tab
  await page.click("#vc-voices-toggle");
  log("A.offAgain", await page.evaluate(() => { const S = window.__vcSynth; const before = S.speaks; const npc = window.__parishTest.npc; npc.talk(npc.characters[1]); return { enabled: npc.voice.enabled(), speaksAfterTalk: S.speaks - before, state: npc.talkState().mode, panelBar: document.querySelector('#gr-voice [data-vc="toggle"]').textContent }; }));
  await context.close();
}

// ----------------------------------------- A2: the hive linked to the characters' voice
if (want("A2")) {
  const { context, page } = await newPage({});
  await page.addInitScript(() => localStorage.setItem("vr-training-auth-v1", JSON.stringify({ id: "learner-check" })));
  await page.goto(`${base}/parishes/dist/parishes.html?parish=orleans`, { waitUntil: "load", timeout: 120000 });
  await page.waitForFunction(() => !!window.__parishTest?.npc && !!window.__parishTest?.voices && "hive" in window.__parishTest, null, { timeout: 120000 });
  log("A2.hive", await page.evaluate(async () => {
    const T = window.__parishTest; const hive = T.hive; const S = window.__vcSynth;
    if (!hive) return { hive: null };
    const npc = T.npc;
    hive.voice(true); npc.voice.setEnabled(true);
    S.spoken.length = 0; S.overlaps = 0;
    for (let i = 0; i < 6; i += 1) hive.step();
    npc.talk(npc.characters[0]);
    const wait = (f, ms = 8000) => new Promise((res) => { const t = Date.now(); const id = setInterval(() => { if (f() || Date.now() - t > ms) { clearInterval(id); res(f()); } }, 5); });
    await wait(() => hive.voiceController.queued() === 0 && !hive.voiceController.speaking() && !npc.voice.speaking() && npc.voice.queued() === 0);
    const e0 = npc.characters[0];
    return { hive: true, linkedHive: hive.voiceController.linked(), linkedNpc: npc.voice.controller.linked(), spoken: S.spoken.length, hiveSpoken: hive.voiceController.spoken().length, npcSpoken: npc.voice.spoken().length, overlaps: S.overlaps, network: S.spoken.filter((u) => u.localService !== true).length, npcLineInPack: S.spoken.filter((u) => e0.ch.pack.some((l) => l.text === u.text)).length };
  }));
  await context.close();
}

// ------------------------------------------- A3: no on-device voice (network-only, none)
for (const cfg of want("A3") ? [{ voices: "network-only" }, { voices: "none" }] : []) {
  const { context, page } = await newPage({}, cfg);
  await bootParish(page);
  log(`A3.${cfg.voices}`, await page.evaluate(async () => {
    const npc = window.__parishTest.npc; const S = window.__vcSynth;
    document.getElementById("vc-voices-toggle").click();
    npc.talk(npc.characters[0]);
    const bar = document.querySelector("#gr-voice");
    return { note: document.getElementById("vc-voice-note").textContent, panelNote: bar.querySelector(".gr-vc-note").textContent, testDisabled: bar.querySelector('[data-vc="test"]').disabled, meTestDisabled: document.getElementById("vc-voice-test").disabled, tableVoices: [...new Set([...document.querySelectorAll("#vc-voice-table tr[data-character]")].map((r) => r.lastChild.textContent))], speaks: S.speaks, lightMode: npc.talkState().mode };
  }));
  await context.close();
}

// ----------------------------------------------- A4: no speechSynthesis at all
if (want("A4")) {
  const context = await pvContext(browser, {});
  await context.addInitScript(() => { try { delete window.speechSynthesis; Object.defineProperty(window, "speechSynthesis", { value: undefined, configurable: true }); } catch (_) { /* ignore */ } });
  const page = await context.newPage();
  page.on("pageerror", (e) => out.pageErrors.push(e.message));
  await bootParish(page);
  log("A4.unsupported", await page.evaluate(() => { const npc = window.__parishTest.npc; npc.talk(npc.characters[0]); return { note: document.getElementById("vc-voice-note").textContent.slice(0, 100), panelNote: document.querySelector("#gr-voice .gr-vc-note").textContent.slice(0, 100), lightMode: npc.talkState().mode }; }));
  await context.close();
}

// ----------------------------------------------------- B: the other three worlds
const worlds = [
  ["bayworld", "bayworld/dist/bayworld.html", () => window.__bayworldTest?.app?.npc, "bayworld"],
  ["summit", "summit/dist/summit.html", () => window.__summitTest?.npc, "summit"],
  ["redwood", "redwood/dist/redwood.html", () => window.__redwoodTest?.app?.npc, "redwood"],
];
for (const [name, url, getter] of want("B") ? worlds : []) {
  const { context, page } = await newPage({});
  await page.goto(`${base}/${url}`, { waitUntil: "load", timeout: 120000 });
  try {
    await page.waitForSelector("#menu-start", { timeout: 60000 }); await page.click("#menu-start");
    await page.waitForFunction(`(${getter.toString()})() != null`, null, { timeout: 90000 });
  } catch (e) { log(`B.${name}`, `no npc mount: ${String(e.message).split("\n")[0]}`); await context.close(); continue; }
  log(`B.${name}`, await page.evaluate(async (g) => {
    const npc = eval(`(${g})()`); const S = window.__vcSynth; const e = npc.characters[0];
    npc.talk(e);
    const barOff = document.querySelector("#gr-voice [data-vc=toggle]")?.textContent;
    document.querySelector('#gr-voice [data-vc="toggle"]').click();
    const wait = (f, ms = 3000) => new Promise((res) => { const t = Date.now(); const id = setInterval(() => { if (f() || Date.now() - t > ms) { clearInterval(id); res(f()); } }, 5); });
    S.spoken.length = 0; npc.ask(e.ch.pack[1].topic);
    await wait(() => npc.talkState().speaking); const light = npc.talkState().lightVisible; await wait(() => !npc.talkState().speaking);
    return { characters: npc.characters.length, barOff, enabledNow: npc.voice.enabled(), spoken: S.spoken.length, inPack: S.spoken.every((u) => e.ch.pack.some((l) => l.text === u.text)), local: S.spoken.every((u) => u.localService === true), voice: S.spoken[0]?.voice, lightWhileSpeaking: light, overlaps: S.overlaps };
  }, getter.toString()));
  await context.close();
}

// -------------------------------------------------- C: phone width, and D: reduced motion
if (want("C")) {
  const { context, page } = await newPage(pvPhone(390, 844));
  await bootParish(page);
  log("C.phone", await page.evaluate(async () => {
    const npc = window.__parishTest.npc; npc.talk(npc.characters[0]); document.querySelector('#gr-voice [data-vc="toggle"]').click();
    const p = document.getElementById("gr-panel").getBoundingClientRect(); const v = document.getElementById("gr-voice").getBoundingClientRect();
    return { scrollW: document.documentElement.scrollWidth, panel: [Math.round(p.left), Math.round(p.right), Math.round(p.bottom)], voiceRow: [Math.round(v.left), Math.round(v.right), Math.round(v.height)], buttons: [...document.querySelectorAll("#gr-voice button")].map((b) => Math.round(b.getBoundingClientRect().height)) };
  }));
  try { const el = await page.$("#gr-panel"); await el.screenshot({ path: `${SP}/panel-phone.png` }); log("C.shot", `${SP}/panel-phone.png`); } catch (e) { log("C.shot", `failed: ${String(e.message).split("\n")[0]}`); }
  await context.close();
}
if (want("D")) {
  const { context, page } = await newPage({ reducedMotion: "reduce" });
  await bootParish(page);
  log("D.reducedMotion", await page.evaluate(async () => {
    const npc = window.__parishTest.npc; const e = npc.characters[0]; npc.voice.setEnabled(true); npc.talk(e);
    const wait = (f, ms = 3000) => new Promise((res) => { const t = Date.now(); const id = setInterval(() => { if (f() || Date.now() - t > ms) { clearInterval(id); res(f()); } }, 5); });
    await wait(() => npc.talkState().speaking);
    const ys = new Set(); for (let i = 0; i < 12; i += 1) { npc.animate(i * 0.1, 0.1); const l = e.figure.children.find((c) => c.name === "gr-talk-light"); if (l) ys.add(+l.scale.y.toFixed(3)); await new Promise((r) => setTimeout(r, 8)); }
    return { scales: [...ys], still: ys.size === 1 };
  }));
  await context.close();
}

// ------------------------------------------------- E: the hive in Spanish (?lang=es)
for (const [label, cfg] of want("E") ? [["englishVoicesOnly", {}], ["withSpanishVoices", { voices: "with-spanish" }]] : []) {
  const { context, page } = await newPage({}, cfg);
  await page.addInitScript(() => localStorage.setItem("vr-training-auth-v1", JSON.stringify({ id: "learner-check" })));
  await page.goto(`${base}/parishes/dist/parishes.html?parish=orleans&lang=es`, { waitUntil: "load", timeout: 120000 });
  await page.waitForFunction(() => !!window.__parishTest?.npc && !!window.__parishTest?.voices && "hive" in window.__parishTest, null, { timeout: 120000 });
  log(`E.${label}`, await page.evaluate(async () => {
    const T = window.__parishTest; const hive = T.hive; const S = window.__vcSynth;
    if (!hive) return { hive: null, htmlLang: document.documentElement.lang };
    hive.voice(true); S.spoken.length = 0; S.overlaps = 0;
    for (let i = 0; i < 8; i += 1) hive.step();
    const wait = (f, ms = 60000) => new Promise((res) => { const t = Date.now(); const id = setInterval(() => { if (f() || Date.now() - t > ms) { clearInterval(id); res(f()); } }, 5); });
    await wait(() => hive.voiceController.queued() === 0 && !hive.voiceController.speaking());
    const caps = hive.captions();
    return { htmlLang: document.documentElement.lang, captions: caps.length, first: caps[0]?.text, spanishLooking: caps.filter((c) => /\b(trabajo|robot simulado|gobernador|cadena|supervisora|en el|para)\b/i.test(c.text)).length, spoken: S.spoken.length, voices: [...new Set(S.spoken.map((u) => u.voice))], langs: [...new Set(S.spoken.map((u) => u.lang))], network: S.spoken.filter((u) => u.localService !== true).length, overlaps: S.overlaps };
  }));
  await context.close();
}

// -------------------------------------- F: what the talk light costs per tier (a frame with the character idle and speaking)
for (const [label, opts] of want("F") ? [["desktop 1280x720", {}], ["phone 390x844", pvPhone(390, 844)]] : []) {
  const { context, page } = await newPage(opts);
  await bootParish(page);
  await page.waitForTimeout(3000);
  log(`F.${label}`, await page.evaluate(async () => {
    const T = window.__parishTest; const npc = T.npc; const e = npc.characters[0]; const S = window.__vcSynth; const r = T.npRenderer;
    let sc = e.figure; while (sc.parent) sc = sc.parent;
    const one = () => { const p = e.figure.position; T.camera.position.set(p.x, p.y + 1.7, p.z + 4); T.camera.lookAt(p.x, p.y + 1.2, p.z); sc.updateMatrixWorld(true); r.render(sc, T.camera); const i = r.info.render; let meshes = 0; sc.traverseVisible((o) => { if (o.isMesh) { meshes += 1; } }); return { calls: i.calls, triangles: i.triangles, visibleMeshes: meshes }; };
    // the camera looks at the figure from 4 m, so it is inside the frustum
    const settle = async () => { await new Promise((res) => setTimeout(res, 400)); };
    await settle(); const idle1 = one(); const idle2 = one();
    npc.voice.setEnabled(true); npc.talk(e);
    const wait = (f, ms = 30000) => new Promise((res) => { const t = Date.now(); const id = setInterval(() => { if (f() || Date.now() - t > ms) { clearInterval(id); res(f()); } }, 5); });
    await wait(() => npc.talkState().speaking && npc.talkState().mode === "voice");
    const speaking = one(); const during = npc.talkState();
    await wait(() => !npc.talkState().speaking); npc.close(); await settle();
    const after = one();
    let figMeshes = 0; e.figure.traverse((o) => { if (o.isMesh) figMeshes += 1; });
    return { idleTwice: [idle1, idle2], speaking, speakingState: during, afterIdle: after, deltaCalls: speaking.calls - idle2.calls, deltaTriangles: speaking.triangles - idle2.triangles, deltaVisibleMeshes: speaking.visibleMeshes - idle2.visibleMeshes, figureMeshesIdle: figMeshes, tier: T.parish && document.getElementById("at-tier")?.textContent };
  }));
  await context.close();
}

log("pageErrors", out.pageErrors);
log("consoleErrors", [...new Set(out.consoleErrors)].slice(0, 6));
log("offHost", out.offHost);
log("routedThree", out.routedThree);
log("wallS", Math.round((Date.now() - t0) / 1000));
await browser.close(); close();
