/**
 * VOICES — every GRIOT character speaks, in its own on-device voice (WebXR/shared/vc-voices.js, oh-voice.js, npc.js;
 * docs/consoles/VOICES.md). Headless, no browser, no network:
 *
 *   1. every character has a voice profile derived from who they are, inside the gentle band, with a language and preferred voice
 *      names; the profiles are deterministic and DISTINCT (no two share a rate and pitch; none closer than VC_MIN_GAP);
 *   2. voice choice on stubbed devices (none, one, two + a network voice, three, eight, network-only, French-only): only local
 *      voices of the right language are ever chosen, characters spread over the voices a device has, preferred names win, and no
 *      two characters share rate, pitch and voice unless the device has a single voice (and even then they differ in rate or pitch);
 *   3. speech: with voice OFF (the default) the stubbed speechSynthesis is never touched (0 utterances, 0 cancels) and the dialogue is
 *      the same; with voice ON every utterance is one of the character's own pack lines VERBATIM (the greeting, the hand-off and the
 *      no-match line are never spoken), on a local voice, at the profile's rate and pitch, never over another line;
 *   4. the talk light: on exactly while a line is spoken (onstart to onend), N of N; the reading window with voice off; held still
 *      under reduced motion; a speaking figure stays inside CT_AVATAR_BUDGET and an idle world has the meshes it had;
 *   5. the Omega Hive and the characters can share one line of speech (linked controllers), and stopping an idle one never cuts off
 *      the other's line; stopping a line tells its owner it ended;
 *   6. nothing listens and nothing is sent (no microphone, recognition, recording or network code in the voice modules);
 *   7. the wiring: the four bundles list oh-voice.js and vc-voices.js, the Me tab mounts the settings beside reduced motion,
 *      check_all and the baseline list this file, the docs are present; hygiene (no model identifier, no claim wording).
 *
 *     node tools/check_voices.mjs            VC_ROOT=<a git export> node tools/check_voices.mjs   (the "before" run)
 */
import { readFileSync, existsSync } from "node:fs";
import { join, dirname, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = process.env.VC_ROOT ? resolve(process.env.VC_ROOT) : join(HERE, "..");
const t0 = Date.now();
let passes = 0, failures = 0;
const evals = [];
async function check(name, fn) {
  try { const note = await fn(); passes += 1; console.log(`ok   ${name}${note ? ` — ${note}` : ""}`); }
  catch (e) { failures += 1; console.log(`FAIL ${name} — ${e?.message ?? e}`); }
}
function ok(cond, msg) { if (!cond) throw new Error(msg); }
const src = (f) => { try { return readFileSync(join(ROOT, f), "utf8"); } catch (_) { return ""; } };
const imp = async (f) => { try { return await import(pathToFileURL(join(ROOT, f)).href); } catch (e) { return { __missing: `${f}: ${String(e?.message ?? e).split("\n")[0]}` }; } };
const need = (m) => { if (m.__missing) throw new Error(m.__missing); return m; };

const V = await imp("WebXR/shared/vc-voices.js");
const OV = await imp("WebXR/shared/oh-voice.js");
const ND = await imp("WebXR/shared/npc-data.js");
const CR = await imp("WebXR/shared/crew.js");

// "Before": the base tree has no vc-voices.js, so no character has a profile.
if (V.__missing) {
  console.log(`FAIL 1 profiles — ${V.__missing}`);
  console.log("EVAL characters with a voice profile: 0 of 34 (no WebXR/shared/vc-voices.js in this tree)");
  console.log(`\ncheck_voices: 0 passed, 1 failed (${Date.now() - t0} ms)`);
  process.exit(1);
}
const ROSTER = ND.GR_ROSTER;

// ------------------------------------------------------------------ stubs
class U { constructor(text) { this.text = text; } }
/** A speechSynthesis stand-in: speak() queues, start() and end() are fired by the test, so the light can be sampled in between. */
function mkSynth(voices) {
  const st = { spoken: [], speaking: null, overlaps: 0, cancels: 0, speaks: 0 };
  return {
    st, getVoices: () => voices,
    speak(u) { st.speaks += 1; if (st.speaking) st.overlaps += 1; st.speaking = u; st.spoken.push(u); },
    cancel() { st.cancels += 1; st.speaking = null; },
    start() { st.speaking?.onstart?.(); },
    end() { const u = st.speaking; st.speaking = null; u?.onend?.(); },
    flush() { while (st.speaking) { this.start(); this.end(); } },
  };
}
const lv = (name, lang = "en-US") => ({ name, lang, localService: true, voiceURI: name });
const nv = (name, lang = "en-US") => ({ name, lang, localService: false, voiceURI: name });
const DEVICES = {
  none: [],
  one: [lv("Local Test Voice")],
  twoAndNetwork: [nv("Network Test Voice"), lv("Local Voice A"), lv("Local Voice B")],
  three: [lv("Plain One"), lv("Plain Two"), lv("Plain Three"), nv("Plain Network")],
  eight: [lv("Alex"), lv("Samantha"), lv("Daniel", "en-GB"), lv("Karen", "en-AU"), lv("Victoria"), lv("Fred"), lv("Tom"), lv("Moira", "en-IE"), nv("Google US English"), nv("Google UK English Female")],
  networkOnly: [nv("Network Test Voice"), nv("Another Network Voice")],
  frenchOnly: [lv("Thomas", "fr-FR"), lv("Amelie", "fr-CA")],
};

// ---------------------------------------------------------------- 1 profiles
await check("1 every character has a voice profile derived from who they are: inside the band, a language, preferred names, deterministic and distinct", () => {
  need(V); need(ND);
  const ps = V.vcProfiles(ROSTER);
  ok(ROSTER.length === 34 && ps.length === 34, `${ps.length} profiles for ${ROSTER.length} characters`);
  const [rLo, rHi] = V.VC_BAND.rate, [pLo, pHi] = V.VC_BAND.pitch;
  for (const [i, p] of ps.entries()) {
    const ch = ROSTER[i];
    ok(p.id === ch.id, `${ch.id}: profile id ${p.id}`);
    ok(p.lang === "en-US" && /^[a-z]{2}-[A-Z]{2}$/.test(p.lang), `${ch.id}: language ${p.lang}`);
    ok(p.rate >= rLo && p.rate <= rHi && p.pitch >= pLo && p.pitch <= pHi, `${ch.id}: rate ${p.rate} pitch ${p.pitch} outside the band`);
    ok(Array.isArray(p.prefer) && p.prefer.length >= 3 && p.prefer.every((n) => typeof n === "string" && n), `${ch.id}: preferred voice names`);
    ok(V.VC_TEMPERS[p.temper], `${ch.id}: temper ${p.temper}`);
    ok(p.temper === V.vcTemper(ch.role), `${ch.id}: the temper is not the role's (${ch.role} -> ${V.vcTemper(ch.role)})`);
  }
  ok(rHi - rLo <= 0.25 && pHi - pLo <= 0.35 && rLo >= 0.8 && rHi <= 1.1 && pLo >= 0.8 && pHi <= 1.2, `the band (${rLo}-${rHi} rate, ${pLo}-${pHi} pitch) is not gentle`);
  // deterministic: a second derivation is identical
  ok(JSON.stringify(V.vcProfiles(ROSTER)) === JSON.stringify(ps), "profiles are not deterministic");
  // derived from who they are: the temper means follow the tempers' centres (care speaks higher and slower than firm)
  const mean = (t, k) => { const xs = ps.filter((p) => p.temper === t).map((p) => p[k]); return xs.reduce((a, b) => a + b, 0) / xs.length; };
  ok(mean("care", "pitch") > mean("firm", "pitch") + 0.05, `care pitch ${mean("care", "pitch").toFixed(3)} is not above firm ${mean("firm", "pitch").toFixed(3)}`);
  ok(mean("firm", "rate") > mean("measured", "rate") + 0.03, `firm rate ${mean("firm", "rate").toFixed(3)} is not above measured ${mean("measured", "rate").toFixed(3)}`);
  const tempers = new Set(ps.map((p) => p.temper));
  ok(tempers.size === 6, `${tempers.size} tempers in use (6 declared)`);
  // distinct: no two share a rate and pitch; none closer than VC_MIN_GAP of the band
  const pairs = new Set(ps.map((p) => `${p.rate}|${p.pitch}`));
  ok(pairs.size === 34, `${pairs.size} distinct rate/pitch pairs of 34`);
  let min = Infinity, at = null;
  for (let i = 0; i < ps.length; i += 1) for (let j = i + 1; j < ps.length; j += 1) {
    const d = Math.hypot((ps[i].rate - ps[j].rate) / (rHi - rLo), (ps[i].pitch - ps[j].pitch) / (pHi - pLo));
    if (d < min) { min = d; at = [ROSTER[i].name, ROSTER[j].name]; }
  }
  ok(min >= V.VC_MIN_GAP - 1e-9, `${at.join(" and ")} are ${min.toFixed(3)} apart (needs ${V.VC_MIN_GAP})`);
  const moved = ps.filter((p) => p.moved).length;
  const rates = ps.map((p) => p.rate), pitches = ps.map((p) => p.pitch);
  evals.push(`characters with a voice profile: 0 -> ${ps.length}/34, all inside the band (rate ${rLo}-${rHi}, pitch ${pLo}-${pHi}); ${pairs.size}/34 distinct rate/pitch pairs, closest two ${min.toFixed(3)} of the band apart (floor ${V.VC_MIN_GAP}); ${tempers.size} tempers; observed rate ${Math.min(...rates)}-${Math.max(...rates)}, pitch ${Math.min(...pitches)}-${Math.max(...pitches)}`);
  return `34/34 inside the band, ${pairs.size} distinct pairs, closest ${min.toFixed(3)} (${at.join("/")}), ${moved} moved by the separation pass, ${tempers.size} tempers`;
});

// ------------------------------------------------------- 2 voice assignment
await check("2 voice choice on stubbed devices: local voices of the right language only, spread over the device's voices, preferred names win, no identical triple", () => {
  need(V);
  const triples = (devName, voices) => {
    const map = V.vcAssignments(voices, ROSTER);
    const local = voices.filter((v) => v.localService === true);
    const seen = new Map(); let used = new Set();
    for (const ch of ROSTER) {
      const v = map.get(ch.id) ?? null;
      const p = V.vcProfileFor(ch, ROSTER);
      if (v) { ok(v.localService === true, `${devName}: ${ch.id} was given the network voice ${v.name}`); ok(String(v.lang).toLowerCase().startsWith("en"), `${devName}: ${ch.id} was given a ${v.lang} voice`); used.add(v.name); }
      const key = `${p.rate}|${p.pitch}|${v?.name ?? "none"}`;
      ok(!seen.has(key), `${devName}: ${ch.id} and ${seen.get(key)} share rate ${p.rate}, pitch ${p.pitch} and voice ${v?.name ?? "none"}`);
      seen.set(key, ch.id);
    }
    return { map, used, local };
  };
  const none = triples("none", DEVICES.none); ok([...none.map.values()].every((v) => v === null), "a voice was chosen on a device with none");
  const one = triples("one", DEVICES.one); ok(one.used.size === 1, "one voice, several used");
  const two = triples("twoAndNetwork", DEVICES.twoAndNetwork); ok(two.used.size === 2 && ![...two.used].includes("Network Test Voice"), "the network voice was used or one local voice was left unused");
  const three = triples("three", DEVICES.three);
  const load = [...three.used].map((n) => [...three.map.values()].filter((v) => v?.name === n).length);
  ok(three.used.size === 3 && Math.max(...load) - Math.min(...load) <= 1, `three plain voices are not shared evenly: ${load.join("/")}`);
  const eight = triples("eight", DEVICES.eight);
  ok(![...eight.used].some((n) => /Google/.test(n)), "a network voice was chosen on the eight-voice device");
  ok(![...eight.used].some((n) => n === "Daniel" || n === "Karen" || n === "Moira"), "a non-US English voice was chosen while en-US voices exist");
  // a preferred name wins: every "care" character prefers Samantha, Karen, Victoria or Zira; on the eight-voice device Samantha and Victoria are en-US
  for (const ch of ROSTER) {
    const p = V.vcProfileFor(ch, ROSTER);
    const liked = DEVICES.eight.filter((v) => v.localService && v.lang === "en-US" && p.prefer.some((w) => v.name.toLowerCase().includes(w.toLowerCase())));
    if (liked.length) ok(liked.some((v) => v.name === eight.map.get(ch.id)?.name), `${ch.id} (${p.temper}) prefers ${p.prefer.join("/")} but got ${eight.map.get(ch.id)?.name}`);
  }
  const net = triples("networkOnly", DEVICES.networkOnly); ok([...net.map.values()].every((v) => v === null), "a network voice was chosen");
  const fr = triples("frenchOnly", DEVICES.frenchOnly); ok([...fr.map.values()].every((v) => v === null), "a French voice was chosen for English lines");
  // the controller's own guard: a pick that returns a network voice is refused
  const synth = mkSynth([nv("Rogue Network")]);
  const c = OV.ohVoiceController({ synth, Utterance: U, doc: null, win: null, enabled: true, pick: () => nv("Rogue Network") });
  c.say({ id: "x", voice: { rate: 1, pitch: 1, lang: "en-US" } }, "hello"); ok(synth.st.spoken.length === 0, "the controller spoke a network voice that a pick returned");
  return `no voice on none/network-only/French-only; one voice shared by all 34 with distinct rate/pitch; two voices ${[...two.used].join("+")}; three plain voices ${load.join("/")}; eight-voice device uses ${[...eight.used].join(", ")}; no triple repeats on any device; a rogue pick of a network voice is refused`;
});

// --------------------------------------------------------- the suite (mounts)
const { buildSuite } = await import(pathToFileURL(join(ROOT, "tools/lib/headless.mjs")).href);
const SU = await buildSuite(["shared/crew.js", "shared/links.js", "shared/npc-data.js", "shared/oh-voice.js", "shared/vc-voices.js", "shared/npc.js"],
  "export { grMount, grDialogue, grCharacters, grRenderDialogueHtml, grResolveHandoff, vcNpcVoice, vcLineMs, vcTestLine, vcDevice, CT_AVATAR_BUDGET, GR_ROSTER, THREE };", "voices");
const { BAY_SITES } = await import(pathToFileURL(join(ROOT, "WebXR/shared/bayworld-data.js")).href);
const { SM_SITES, smHeightAt } = await import(pathToFileURL(join(ROOT, "WebXR/shared/summit-data.js")).href);
const { RW_SITES, rwHeightAt } = await import(pathToFileURL(join(ROOT, "WebXR/redwood/js/rw-data.js")).href);
const parishSites = [...new Set(SU.grCharacters("parish").map((c) => c.siteKind))].map((kind, i) => ({ id: `np-${kind}`, name: `${kind} site`, kind, position: [i * 300 - 1500, 200] }));
const WORLDS = [
  ["bayworld", { sites: BAY_SITES, groundAt: () => 0 }], ["summit", { sites: SM_SITES, groundAt: smHeightAt }],
  ["redwood", { sites: RW_SITES, groundAt: rwHeightAt }], ["parish:orleans", { sites: parishSites, groundAt: () => 1 }],
];
const countMeshes = (root) => { let n = 0; root.traverse((o) => { if (o.isMesh || o.isPoints) n += 1; }); return n; };
/** Mount every world on one stubbed device; returns the mounts and the synth. */
function mountAll(voices, extra = {}) {
  const synth = mkSynth(voices);
  const voice = SU.vcNpcVoice({ synth, Utterance: U, doc: null, win: null });
  const mounts = WORLDS.map(([w, M]) => {
    const root = new SU.THREE.Group();
    const m = SU.grMount(w, { three: SU.THREE, root, sites: M.sites, groundAt: M.groundAt, pos: () => null, keys: false, voice, ...extra });
    return { w, m, root };
  });
  return { synth, voice, mounts };
}
const entries = (mounts) => mounts.flatMap(({ m }) => m.characters.map((e) => ({ e, m })));

// ------------------------------------------------------------------- 3 speech
await check("3 speech: off by default (the synth is never touched), then on: only pack lines verbatim, on local voices, at the profile's rate and pitch, never over another line", () => {
  need(V);
  // OFF: every character, three seeds, a question and nonsense
  const off = mountAll(DEVICES.twoAndNetwork);
  ok(off.voice.enabled() === false, "voice is on at mount");
  const all = entries(off.mounts); ok(all.length === 34, `${all.length} characters mounted across the four worlds`);
  const offDialogues = [];
  for (const { e, m } of all) {
    for (let s = 0; s < 3; s += 1) { const open = m.talk(e); offDialogues.push(JSON.stringify(open.dialogue)); }
    m.ask("zxqv wplk fnord"); m.ask(e.ch.pack[1].topic); m.close();
  }
  ok(off.synth.st.speaks === 0 && off.synth.st.cancels === 0, `voice off touched the synth: ${off.synth.st.speaks} utterances, ${off.synth.st.cancels} cancels`);
  // ON
  const on = mountAll(DEVICES.twoAndNetwork); on.voice.setEnabled(true);
  const onDialogues = [];
  const heard = [];
  let lines = 0, verbatim = 0, local = 0, rateOk = 0, nonPack = 0;
  const templates = new Set();
  for (const { e, m } of entries(on.mounts)) {
    const prof = on.voice.profile(e.ch);
    for (let s = 0; s < 3; s += 1) {
      const before = on.synth.st.spoken.length;
      const open = m.talk(e); onDialogues.push(JSON.stringify(open.dialogue));
      templates.add(open.dialogue.greet); if (open.resolved?.text) templates.add(open.resolved.text); templates.add(open.dialogue.noMatchText ?? "");
      ok(on.synth.st.spoken.length === before + 1, `${e.ch.id}: ${on.synth.st.spoken.length - before} utterances for one dialogue`);
      on.synth.flush();
    }
    const q0 = on.synth.st.spoken.length; m.ask(e.ch.pack[1].topic); on.synth.flush(); const asked = on.synth.st.spoken.length - q0;
    ok(asked === 1, `${e.ch.id}: a matching question spoke ${asked} lines`);
    const q1 = on.synth.st.spoken.length; m.ask("zxqv wplk fnord"); on.synth.flush(); ok(on.synth.st.spoken.length === q1, `${e.ch.id}: the no-match line was spoken`);
    m.close();
    for (const u of on.synth.st.spoken.splice(0)) {
      lines += 1; heard.push(u.text);
      if (e.ch.pack.some((l) => l.text === u.text)) verbatim += 1; else nonPack += 1;
      if (u.voice?.localService === true) local += 1;
      if (u.rate === prof.rate && u.pitch === prof.pitch) rateOk += 1;
    }
  }
  ok(lines > 0 && verbatim === lines && nonPack === 0, `${verbatim} of ${lines} lines were a pack line verbatim`);
  ok(local === lines, `${local} of ${lines} utterances on a local voice`);
  ok(rateOk === lines, `${rateOk} of ${lines} utterances at the profile's rate and pitch`);
  ok(!heard.some((t) => templates.has(t)), "a greeting, hand-off or no-match template was spoken");
  ok(on.synth.st.overlaps === 0, `${on.synth.st.overlaps} overlapping utterances`);
  // captions exactly as today: the dialogue objects are identical with voice off and on
  ok(offDialogues.length === onDialogues.length && offDialogues.every((d, i) => d === onDialogues[i]), "the dialogue (the captions) differs with voice on");
  // never over another line: two characters in a row, the second replaces the first (cancel), never speaks over it
  const two = mountAll(DEVICES.one); two.voice.setEnabled(true);
  const [a, b] = entries(two.mounts);
  a.m.talk(a.e); two.synth.start(); b.m.talk(b.e);
  ok(two.synth.st.overlaps === 0 && two.synth.st.cancels >= 1, "a second character spoke over the first");
  ok(b.e.ch.pack.some((l) => l.text === two.synth.st.speaking?.text), "the replacing line is not the second character's own");
  two.synth.flush(); ok(two.synth.st.overlaps === 0, "overlap after the replacement");
  // queued lines through the controller wait their turn
  const q = SU.vcNpcVoice({ synth: mkSynth(DEVICES.one), Utterance: U, doc: null, win: null, enabled: true });
  const sy = q.controller; ok(sy.enabled(), "controller on");
  ok(q.say(ROSTER[0], ROSTER[0].pack[0].text) && q.say(ROSTER[0], ROSTER[0].pack[1].text) && q.queued() === 1 && q.speaking(), "a second line did not wait for the first");
  // the voice refuses any text that is not a pack line
  ok(q.say(ROSTER[0], "Hello, I am Kofi.") === false && q.say(ROSTER[0], ROSTER[1].pack[0].text) === false, "the voice layer spoke a line outside the character's pack");
  evals.push(`lines spoken verbatim: ${verbatim} of ${lines} (no line outside the pack; the greeting, hand-off and no-match templates are shown, never spoken; 34 characters x 3 seeds + a matching question, and the no-match question spoke 0)`);
  evals.push(`network voices chosen: 0 of ${lines} utterances (stubbed speechSynthesis with a local and a network voice; ${local} on a local voice, rate and pitch at the profile ${rateOk}/${lines}); overlaps 0`);
  evals.push(`utterances with voice off: ${off.synth.st.speaks} (34 characters x 3 dialogues + 2 questions each; synth cancels ${off.synth.st.cancels}); dialogue identical with voice on: ${onDialogues.length}/${onDialogues.length}`);
  return `voice off: 0 utterances and 0 cancels over ${offDialogues.length} dialogues; voice on: ${verbatim}/${lines} verbatim pack lines, ${local}/${lines} local, ${rateOk}/${lines} at the profile's rate and pitch, 0 overlaps; the dialogue is identical on and off`;
});

// -------------------------------------------------------------- 4 talk light
await check("4 the talk light: on exactly while a line is spoken (N of N), the reading window with voice off, still under reduced motion, inside the figure budget", () => {
  need(V);
  const lightOf = (e) => e.figure.children.find((c) => c.name === "gr-talk-light") ?? null;
  // voiced: onstart .. onend
  const on = mountAll(DEVICES.one); on.voice.setEnabled(true);
  let exact = 0, n = 0, worst = 0, idleOk = 0;
  for (const { e, m } of entries(on.mounts)) {
    const base = countMeshes(e.figure);
    m.animate(10);
    m.talk(e);
    const preStart = m.talkState().speaking === false && !lightOf(e); // queued, not started: no light yet
    on.synth.start();
    const st = m.talkState(); const during = st.speaking && st.mode === "voice" && st.character === e.ch.id && st.lightVisible && !!lightOf(e) && lightOf(e).visible;
    const meshes = countMeshes(e.figure); worst = Math.max(worst, meshes);
    on.synth.end();
    const after = m.talkState(); const gone = !after.speaking && !after.lightVisible && !lightOf(e) && countMeshes(e.figure) === base;
    n += 1; if (preStart && during && gone && meshes === base + 1 && meshes <= SU.CT_AVATAR_BUDGET) exact += 1;
    if (gone) idleOk += 1;
    m.close();
  }
  ok(exact === n, `the light was exact for ${exact} of ${n} lines`);
  // closing the dialogue mid-line ends the light and the speech
  { const { synth, voice, mounts } = mountAll(DEVICES.one); voice.setEnabled(true); const { e, m } = entries(mounts)[0]; m.talk(e); synth.start(); ok(m.talkState().speaking, "no light before close"); m.close(); ok(!m.talkState().speaking && synth.st.speaking === null && synth.st.cancels === 1, "closing mid-line left the light on or the voice running"); }
  // turning voice off mid-line ends the light too
  { const { synth, voice, mounts } = mountAll(DEVICES.one); voice.setEnabled(true); const { e, m } = entries(mounts)[0]; m.talk(e); synth.start(); voice.setEnabled(false); ok(!m.talkState().speaking, "voice off mid-line left the light on"); }
  // voice off: the light follows the reading window on the clock
  const off = mountAll(DEVICES.one);
  let windows = 0, wn = 0;
  for (const { e, m } of entries(off.mounts)) {
    m.animate(100); // the dialogue starts at clock 100 s
    const text = m.talk(e).dialogue.teach.text;
    const ms = SU.vcLineMs(text);
    const on1 = m.talkState().speaking && m.talkState().mode === "clock";
    m.animate(100 + ms / 1000 - 0.1); const still = m.talkState().speaking;
    m.animate(100 + ms / 1000 + 0.1); const gone = !m.talkState().speaking;
    const row = m.talkLog().at(-1);
    wn += 1; if (on1 && still && gone && Math.abs((row.end - row.start) - (ms / 1000 + 0.1)) < 1e-6) windows += 1;
    m.close();
  }
  ok(windows === wn, `the reading window was exact for ${windows} of ${wn} lines`);
  ok(SU.vcLineMs("one two three") === 1500 && SU.vcLineMs("word ".repeat(400)) === 12000, "the reading window is not clamped to 1.5-12 s");
  // reduced motion holds the light still; otherwise it pulses
  const pulse = (reducedMotion) => {
    const { synth, voice, mounts } = mountAll(DEVICES.one, { reducedMotion }); voice.setEnabled(true);
    const { e, m } = entries(mounts)[0]; m.animate(1); m.talk(e); synth.start();
    const ys = []; for (let t = 1; t < 3; t += 0.1) { m.animate(t); ys.push(+lightOf(e).scale.y.toFixed(4)); }
    return new Set(ys).size;
  };
  ok(pulse(true) === 1 && pulse(false) > 3, `reduced motion: ${pulse(true)} light scales (needs 1); normal: ${pulse(false)} (needs a pulse)`);
  // an idle world has exactly the meshes it had; a speaking figure has one more, worst case inside the budget
  evals.push(`talk light active exactly while a line is spoken: ${exact} of ${n} (onstart to onend; idle meshes restored ${idleOk}/${n}); reading window with voice off ${windows} of ${wn}; reduced motion holds still`);
  evals.push(`meshes per speaking figure: worst ${worst} of CT_AVATAR_BUDGET ${SU.CT_AVATAR_BUDGET} (before: worst 8; the light is one shared mesh on the speaking figure only)`);
  return `voiced light exact ${exact}/${n}, reading window ${windows}/${wn}, reduced motion still, worst figure ${worst} of ${SU.CT_AVATAR_BUDGET} meshes while speaking, idle meshes unchanged`;
});

// --------------------------------------------------- 5 the hive and the NPCs
await check("5 characters and agents share one line of speech; an idle controller never cuts off a peer; stopping tells the line's owner", () => {
  need(OV);
  const synth = mkSynth(DEVICES.one);
  const a = OV.ohVoiceController({ synth, Utterance: U, doc: null, win: null, enabled: true });
  const b = OV.ohVoiceController({ synth, Utterance: U, doc: null, win: null, enabled: true });
  ok(a.link(b) && a.linked() === 1 && b.linked() === 1, "link is not mutual");
  const ag = (id) => ({ id, voice: { rate: 1, pitch: 1, lang: "en-US", prefer: [] } });
  a.say(ag("a"), "first line"); b.say(ag("b"), "second line");
  ok(synth.st.spoken.length === 1 && b.queued() === 1, "the linked controller spoke over the first");
  synth.start(); synth.end();
  ok(synth.st.spoken.length === 2 && synth.st.overlaps === 0, `the waiting controller did not start when the first ended (${synth.st.spoken.length} spoken)`);
  synth.start(); synth.end();
  // turns at line boundaries: a controller with a long queue does not make a waiting peer wait for the whole queue
  { const s = mkSynth(DEVICES.one); const x = OV.ohVoiceController({ synth: s, Utterance: U, doc: null, win: null, enabled: true }); const y = OV.ohVoiceController({ synth: s, Utterance: U, doc: null, win: null, enabled: true }); x.link(y);
    for (let i = 0; i < 4; i += 1) x.say(ag("x"), `x${i}`); y.say(ag("y"), "y0");
    s.start(); s.end(); // x0 ends: y goes next, before x1
    ok(s.st.speaking?.text === "y0", `after the first line the next voice was ${s.st.speaking?.text}, not the waiting peer's line`);
    s.start(); s.end(); ok(s.st.speaking?.text === "x1", `then the first controller carries on (${s.st.speaking?.text})`);
    s.flush(); ok(s.st.spoken.length === 5 && s.st.overlaps === 0, "lines lost or overlapping in the hand-over"); }
  // an idle controller's stop() does not cancel the peer's utterance
  a.say(ag("a"), "again"); synth.start();
  const cancels = synth.st.cancels; b.stop();
  ok(synth.st.cancels === cancels && a.speaking(), "an idle peer's stop() cut off the other's line");
  synth.end();
  // stop() ends the line it cuts off, so a talk light never stays lit
  const synth2 = mkSynth(DEVICES.one); let started = 0, ended = 0;
  const c = OV.ohVoiceController({ synth: synth2, Utterance: U, doc: null, win: null, enabled: true });
  c.say(ag("c"), "a line", { onstart: () => { started += 1; }, onend: () => { ended += 1; } }); synth2.start(); c.stop();
  ok(started === 1 && ended === 1, `stop() fired onend ${ended} times for ${started} onstart`);
  synth2.end(); ok(ended === 1, "onend fired twice after stop()");
  // an idle controller does not touch the synth at all
  const synth3 = mkSynth(DEVICES.one); const d = OV.ohVoiceController({ synth: synth3, Utterance: U, doc: null, win: null, enabled: false }); d.stop(); d.setEnabled(false);
  ok(synth3.st.cancels === 0, "an idle controller cancelled the page's speech");
  return "linked controllers take turns without overlap, an idle stop() leaves the peer's line alone, stop() fires onend once, an idle controller never touches the synth";
});

// ------------------------------------------------------------------- 6 the UI
await check("6 the voice row: a toggle that says what it does, a test enabled only with voice on and a local voice, a note for none / network-only / unsupported", () => {
  need(V);
  const ch = ROSTER[0];
  const html = (s) => V.vcVoiceBarHtml({ character: ch, ...s });
  const dev = (synth) => V.vcDevice(synth);
  const off = html({ on: false, canSpeak: false, device: dev(mkSynth(DEVICES.eight)) });
  ok(/Voice: off/.test(off) && /aria-pressed="false"/.test(off) && /data-vc="test" disabled/.test(off) && /captions only/.test(off), "voice-off row");
  const on = html({ on: true, canSpeak: true, device: dev(mkSynth(DEVICES.eight)), voiceName: "Alex", rate: 0.98, pitch: 0.93 });
  ok(/Voice: on/.test(on) && /aria-pressed="true"/.test(on) && !/data-vc="test" disabled/.test(on) && /Kofi speaks with Alex \(on this device\) · rate 0.98 · pitch 0.93/.test(on), "voice-on row");
  const none = html({ on: true, canSpeak: false, device: dev(mkSynth(DEVICES.networkOnly)) });
  ok(/No on-device voice was found/.test(none) && /never used/.test(none) && /data-vc="test" disabled/.test(none), "network-only row");
  const unsupported = html({ on: true, canSpeak: false, device: dev(null) });
  ok(/no speech synthesis, so characters show captions only/.test(unsupported), "unsupported row");
  const empty = dev(mkSynth(DEVICES.none)); ok(empty.local.length === 0 && /captions only/.test(empty.note), "no voices at all");
  const test = html({ on: true, canSpeak: true, device: dev(mkSynth(DEVICES.one)), voiceName: "Local Test Voice", rate: 1, pitch: 1, test: { text: "A <b>line</b> & more" } });
  ok(/Test line: A &lt;b&gt;line&lt;\/b&gt; &amp; more/.test(test), "the test caption is not escaped");
  // the test speaks one of the character's own lines, only with voice on
  const synth = mkSynth(DEVICES.one); const v = SU.vcNpcVoice({ synth, Utterance: U, doc: null, win: null });
  ok(v.test(ch).spoken === false && v.test(ch).reason === "voice is off" && synth.st.speaks === 0, "the test spoke with voice off");
  v.setEnabled(true); const r = v.test(ch); ok(r.spoken && ch.pack.some((l) => l.text === r.text) && r.text === SU.vcTestLine(ch) && synth.st.spoken[0].text === r.text, "the test did not speak one of the character's own lines");
  const vn = SU.vcNpcVoice({ synth: mkSynth(DEVICES.networkOnly), Utterance: U, doc: null, win: null, enabled: true }); const rn = vn.test(ch); ok(!rn.spoken && rn.reason === "no on-device voice", "the test spoke on a device with no local voice");
  // which voice each character uses
  const rows = v.assignments(); ok(rows.length === 34 && rows.every((x) => x.voice === "Local Test Voice"), "the assignment table");
  const rowsNone = vn.assignments(); ok(rowsNone.every((x) => x.voice === null), "the table claims a voice on a network-only device");
  return "toggle, test, note and table states checked on five stubbed devices; the test speaks the character's shortest own line, only with voice on";
});

// ----------------------------------------------- 7 nothing listens, nothing sent
await check("7 nothing listens and nothing is sent: no microphone, recognition, recording or network code in the voice modules", () => {
  const files = ["WebXR/shared/vc-voices.js", "WebXR/shared/oh-voice.js"];
  const bad = /SpeechRecognition|getUserMedia|MediaRecorder|webkitSpeech|\bfetch\s*\(|XMLHttpRequest|WebSocket|sendBeacon|EventSource|navigator\.mediaDevices|localStorage|sessionStorage|indexedDB|https?:\/\//;
  for (const f of files) { const t = src(f); ok(t.length > 0, `${f} missing`); const code = t.split("\n").filter((l) => !/^\s*(\/\/|\*)/.test(l)).join("\n"); ok(!bad.test(code), `${f}: ${code.match(bad)?.[0]}`); }
  const npc = src("WebXR/shared/npc.js"); ok(/voice\.say\(entry\.ch, text/.test(npc) && !/voice\.say\([^)]*(greet|noMatch|handoff)/.test(npc), "npc.js speaks something other than the taught line");
  ok(!/\bspeechSynthesis\b/.test(src("WebXR/shared/npc.js").split("\n").filter((l) => !/^\s*(\/\/|\*)/.test(l)).join("\n")), "npc.js reaches for speechSynthesis itself (it must go through the controller)");
  return `${files.length} modules scanned clean (no listening, recording, network, storage); npc.js speaks only the taught line through the controller`;
});

// ------------------------------------------ 10 the hive in a second language
await check("10 the hive in Spanish: per-language cores picked by the page's language, grounding and style adherence per language, calm text, a local Spanish voice or silence", async () => {
  const HD = need(await imp("WebXR/shared/oh-hive-data.js")), HS = need(await imp("WebXR/shared/oh-say.js")), HH = need(await imp("WebXR/shared/oh-hive.js")), RB = need(await imp("WebXR/shared/rb-robotics-data.js"));
  const siteNames = RB.RB_SITES.map((s) => s.name);
  // the language comes from the page: es, es-MX and ES are Spanish; anything the hive does not speak is English
  ok(["es", "es-MX", "ES", "es_US"].every((c) => HD.ohLangFor(c) === "es") && ["en", "en-GB", "fr", "", null, undefined, "esperanto"].every((c) => HD.ohLangFor(c) === "en"), "ohLangFor");
  ok(Object.keys(HD.OH_LANGS).length === 2 && HD.OH_LANGS.es.tag === "es-US", "the languages the hive speaks");
  // every kind has Spanish cores, every reason a Spanish phrase, every agent Spanish padding and voice names
  ok(Object.keys(HS.OH_CORES).every((k) => Array.isArray(HS.OH_CORES_ES[k]) && HS.OH_CORES_ES[k].length >= 2), "a kind has no Spanish cores");
  ok(Object.keys(HD.OH_REASON_PHRASES).every((k) => typeof HD.OH_REASON_PHRASES_ES[k] === "string" && HD.OH_REASON_PHRASES_ES[k]), "a reason has no Spanish phrase");
  ok(HD.OH_AGENTS.every((a) => HD.OH_PADS_ES[a.key]?.length >= 4 && HD.OH_PREFER_ES[a.key]?.length >= 3), "an agent has no Spanish padding or voice names");
  // the same slots: a Spanish core uses exactly the slots its English twin does, so its facts come from the event alone
  const slots = (t) => [...new Set([...t.matchAll(/\{(\w+)\}/g)].map((m) => m[1]))].sort().join(",");
  for (const k of Object.keys(HS.OH_CORES)) { const en = new Set(HS.OH_CORES[k].flatMap((t) => slots(t).split(","))); for (const t of HS.OH_CORES_ES[k]) for (const s of slots(t).split(",").filter(Boolean)) ok(en.has(s), `${k}: the Spanish core "${t}" uses {${s}}, which no English core of the kind has`); }
  // English is untouched
  const a0 = HD.OH_AGENTS[0], ev0 = { type: "announce", t: 3, jobId: "vbjob-0123456789abcdef", to: RB.RB_SITES[0].id, siteName: RB.RB_SITES[0].name, task: "Pick and place" };
  ok(HS.ohSay(a0, ev0) === HS.ohSay(a0, ev0, { lang: "en" }) && !/ el | en | para /.test(` ${HS.ohSay(a0, ev0)} `), "English changed");
  ok(HD.ohAgentIn(a0, "en") === a0 && HD.ohAgentIn(HD.ohAgentIn(a0, "es"), "en") === a0, "ohAgentIn en");
  // a seeded day in Spanish (the hive takes a `say` and the agents as options)
  const standIn = (r) => (parseInt(String(r.jobId).slice(-2), 16) % 2 ? "approve" : "decline");
  const es = HD.OH_AGENTS.map((a) => HD.ohAgentIn(a, "es"));
  const day = (seed, o = {}) => HH.ohHiveDay(seed, { decide: standIn, agents: es, say: (a, ev) => HS.ohSay(a, ev, { lang: "es" }), ...o });
  const { events } = day(7);
  const sp = events.filter((e) => e.type === "speak");
  ok(sp.length > 800, `${sp.length} Spanish speak events`);
  let inside = 0, allS = 0, inS = 0; const rows = [];
  for (const a of es) {
    ok(a.lang === "es" && a.voice.lang === "es-US" && a.id === HD.ohAgent(a.id).id && a.name === HD.ohAgent(a.id).name && a.traits === HD.ohAgent(a.id).traits, `${a.key}: not the same persona in Spanish`);
    const lens = sp.filter((e) => e.agent === a.id).flatMap((e) => HS.ohSentences(e.text).map((x) => HS.ohWords(x).length));
    ok(lens.length > 0, `${a.id} said nothing in Spanish`);
    const mean = lens.reduce((x, y) => x + y, 0) / lens.length;
    const hit = lens.filter((n) => n >= a.style.band[0] && n <= a.style.band[1]).length; allS += lens.length; inS += hit;
    if (mean >= a.style.band[0] && mean <= a.style.band[1]) inside += 1;
    rows.push(`${a.key} ${mean.toFixed(1)} in ${a.style.band.join("-")} (${hit}/${lens.length})`);
    ok(a.style.band.join() === HD.ohAgent(a.id).style.band.join() && a.style.register === HD.ohAgent(a.id).style.register, `${a.key}: the style grammar differs from English`);
  }
  ok(inside === 7 && inS === allS, `style adherence in Spanish: ${inside}/7 agents, ${inS}/${allS} sentences: ${rows.join("; ")}`);
  // grounding, per language
  let good = 0; const bad = [];
  for (const e of sp) { const g = HS.ohGrounded(e.text, e, { siteNames }); if (g.ok && g.facts.length) good += 1; else if (!g.ok || g.facts.length) bad.push(`${e.text} [${g.missing.join(", ")}]`); }
  const factless = sp.filter((e) => !HS.ohGrounded(e.text, e, { siteNames }).facts.length).length;
  ok(bad.length === 0, `ungrounded Spanish lines: ${bad.slice(0, 3).join(" | ")}`);
  const e0 = sp.find((e) => e.jobId); ok(!HS.ohGrounded(`${e0.text} Puntuación 0.123 en rb-site-nowhere.`, e0, { siteNames }).ok, "a planted number and site id were not caught in Spanish");
  // calm text and no English fragment but names
  const FEAR_ES = /\b(peligro\w*|mortal\w*|muerte|muert[oa]s?|matar|mata\w*|herid[oa]s?|lesi[oó]n\w*|lesionad\w*|miedo|terror\w*|sangre|aplast\w*|amput\w*|asust\w*|grave\w*)\b/i;
  const strip = (e) => e.text.split(e.jobId ?? "\u0000").join(" ").split(e.siteName ?? "\u0000").join(" ").split(e.supervisor ?? "\u0000").join(" ").replace(/-?\d+(\.\d+)?/g, " ").replace(/\b[a-z]+(-[a-z]+)+\b/g, " ");
  const ENGLISH = /\b(the|and|with|for|is|at|of|on|to|job|site|run|steps|score|governor|supervisor|simulated)\b/i;
  const texts = [...sp.map((e) => e.text), ...Object.values(HD.OH_REASON_PHRASES_ES), HS.OH_PACKS.es.approvalWhy, ...Object.values(HS.OH_CORES_ES).flat(), ...Object.values(HD.OH_PADS_ES).flat(), ...Object.values(HD.OH_OPENER_POOLS_ES).flat(), ...Object.values(HD.OH_CLOSER_POOLS_ES).flat(), ...Object.values(HD.OH_HEDGE_POOLS_ES).flat()];
  ok(texts.filter((t) => FEAR_ES.test(t)).length === 0, `fear framing in Spanish: ${texts.filter((t) => FEAR_ES.test(t)).slice(0, 3).join(" | ")}`);
  const english = sp.filter((e) => ENGLISH.test(strip(e)));
  ok(english.length === 0, `an English fragment in a Spanish line: ${english.slice(0, 2).map((e) => strip(e)).join(" | ")}`);
  // personality in Spanish: naive Bayes names the speaker (trained on seeds 1-60, tested on 61-100)
  const norm = (t) => HS.ohWords(t.toLowerCase().replace(/vbjob-[0-9a-f]+/g, " jobid ").replace(/\d+(\.\d+)?/g, " num ")).map((w) => w.replace(/[^\p{L}\p{N}'-]/gu, "")).filter(Boolean);
  const corpus = (lo, hi) => { const rows = []; for (let s = lo; s <= hi; s += 1) for (const e of day(s, { nJobs: 12, ticksPerDay: 40 }).events.filter((x) => x.type === "speak")) rows.push(e); return rows; };
  const train = corpus(1, 60), test = corpus(61, 100); const ids = es.map((a) => a.id);
  const m = { prior: {}, counts: {}, totals: {}, vocab: new Set() }; for (const id of ids) { m.prior[id] = 0; m.counts[id] = new Map(); m.totals[id] = 0; }
  for (const r of train) { m.prior[r.agent] += 1; for (const w of norm(r.text)) { m.vocab.add(w); m.counts[r.agent].set(w, (m.counts[r.agent].get(w) ?? 0) + 1); m.totals[r.agent] += 1; } }
  let hitNB = 0; for (const r of test) { let best = null, bs = -Infinity; for (const id of ids) { let s = Math.log((m.prior[id] + 1) / (train.length + ids.length)); for (const w of norm(r.text)) s += Math.log(((m.counts[id].get(w) ?? 0) + 1) / (m.totals[id] + m.vocab.size)); if (s > bs) { bs = s; best = id; } } if (best === r.agent) hitNB += 1; }
  const acc = hitNB / test.length; ok(acc >= 0.85, `Spanish distinctiveness ${acc.toFixed(3)} under the pinned 0.85`);
  // voices: a Spanish line is read only by a local Spanish voice; with none the agent is silent and the caption still shows
  const ag = es[1], agEn = HD.OH_AGENTS[1];
  const enOnly = [lv("Alex"), lv("Samantha"), nv("Network Spanish", "es-ES")];
  ok(OV.ohPickVoice(ag, enOnly) === null && OV.ohPickVoice(agEn, enOnly) !== null, "an English voice was picked for a Spanish agent, or a network Spanish voice");
  const withEs = [lv("Alex"), lv("Jorge", "es-ES"), lv("Paulina", "es-MX"), lv("Monica", "es-ES"), nv("Google español", "es-ES")];
  const picked = es.map((a) => OV.ohPickVoice(a, withEs)); ok(picked.every((v) => v && v.localService === true && /^es/.test(v.lang)), "a Spanish agent was not given a local Spanish voice");
  ok(OV.ohPickVoice(es[0], withEs).name === "Jorge" && OV.ohPickVoice(es[1], withEs).name === "Monica", "a preferred Spanish voice name did not win");
  const synth = mkSynth(enOnly); const caps = []; const c = OV.ohVoiceController({ synth, Utterance: U, doc: null, win: null, enabled: true, onCaption: (a, t) => caps.push(t) });
  c.say(ag, sp.find((e) => e.agent === ag.id).text); ok(synth.st.spoken.length === 0 && caps.length === 1, "a Spanish line was read by an English voice, or its caption was lost");
  const synth2 = mkSynth(withEs); const c2 = OV.ohVoiceController({ synth: synth2, Utterance: U, doc: null, win: null, enabled: true }); c2.say(ag, "Hola"); ok(synth2.st.spoken[0]?.voice.name === "Monica" && synth2.st.spoken[0].voice.localService === true, "the Spanish voice was not used");
  // wiring: the panel takes the page's language and speaks as the localised agent
  const panel = src("WebXR/shared/oh-panel.js");
  ok(/ohLangFor\(lang \?\? document\.documentElement\?\.lang/.test(panel) && /ohAgentIn\(OH_AGENTS\.find/.test(panel) && /say: \(a, ev\) => ohSay\(a, ev, \{ lang: hiveLang \}\)/.test(panel), "oh-panel.js does not take the page's language");
  evals.push(`languages the hive speaks: 1 -> 2 (English, Spanish; picked by the page's language through ohLangFor, per-language cores OH_CORES / OH_CORES_ES, style pools, reason phrases, padding and voice names)`);
  evals.push(`hive in Spanish (seed 7, ${sp.length} speak events): style adherence ${inside}/7 agents' mean words per sentence inside the band, ${inS}/${allS} sentences inside; grounding ${good}/${good} lines with facts (${factless} carry none), a planted fact caught; calm text 0 flagged in ${texts.length} strings; no English fragment but names; personality ${acc.toFixed(3)} naive-Bayes accuracy on ${test.length} held-out lines (chance 0.143); a Spanish line is read only by a local Spanish voice (English-only device: 0 spoken, caption kept)`);
  return `Spanish day: ${inside}/7 agents and ${inS}/${allS} sentences inside their bands, ${good} grounded lines, calm over ${texts.length} strings, no English fragment, personality ${acc.toFixed(3)}; English unchanged; Spanish voice local-only or silence`;
});

// --------------------------------------------------------------------- 8 wiring
await check("8 wiring: the four bundles list oh-voice.js and vc-voices.js, the Me tab mounts the settings, check_all and the baseline list this file, docs present", () => {
  const py = src("tools/bundle_webxr.py");
  for (const app of ["bayworld", "summit", "redwood", "parishes"]) {
    const i = py.indexOf(`"${app}": {`), b = py.slice(i, py.indexOf('"entry":', i));
    const at = (n) => b.indexOf(`SHARED / "${n}"`);
    ok(at("npc.js") > 0 && at("oh-voice.js") > 0 && at("vc-voices.js") > 0, `bundler ${app}: oh-voice.js and vc-voices.js are not listed beside npc.js`);
    ok((b.match(/SHARED \/ "vc-voices\.js"/g) ?? []).length === 1 && (b.match(/SHARED \/ "oh-voice\.js"/g) ?? []).length === 1, `bundler ${app}: a voice module is listed twice`);
    if (app !== "parishes") ok(at("oh-voice.js") < at("vc-voices.js") && at("vc-voices.js") < at("npc.js") && at("npc-data.js") < at("vc-voices.js"), `bundler ${app}: the order is not npc-data, oh-voice, vc-voices, npc`);
  }
  const html = src("WebXR/parishes/parishes.html"); ok(/id="menu-voice"/.test(html) && /id="menu-voice-info"/.test(html) && html.indexOf('id="menu-voice"') < html.indexOf('id="ux-reduced"') + 400 && html.indexOf('id="menu-voice"') > html.indexOf('id="menu-sound"'), "parishes.html: the voice mount is not beside the sound and reduced-motion controls");
  const app = src("WebXR/parishes/js/app.js"); ok(/import \{ vcMountVoiceSettings \} from "\.\.\/\.\.\/shared\/vc-voices\.js";/.test(app) && /vcMountVoiceSettings\(\$\("menu-voice"\), asNpc\.voice/.test(app), "the parishes app does not mount the Me tab settings on the NPC voice");
  ok(/asNpc\.voice\.link\(/.test(app), "the parishes app does not link the characters' voice to the hive's");
  ok(src("tools/check_all.mjs").includes('"check_voices.mjs"'), "check_all does not list check_voices.mjs");
  ok(/"check_voices\.mjs":/.test(src("docs/perf/checkers-baseline.json")), "no baseline row");
  const doc = src("docs/consoles/VOICES.md"); ok(doc.length > 1500 && /Left/.test(doc) && /Seams/.test(doc), "docs/consoles/VOICES.md");
  ok(src("docs/consoles/memory/VOICES.md").length > 200 && src("tools/briefs/next/vc-next.md").length > 200, "memory or next brief missing");
  return "4 bundle lists, the Me tab mount beside reduced motion, the hive link, check_all, the baseline row, docs, memory and the next brief";
});

// -------------------------------------------------------------------- 9 hygiene
await check("9 hygiene: no model identifier and no claim wording in the files this console wrote", () => {
  const MODEL = new RegExp("\\b(" + ["gp" + "t-?\\d", "cla" + "ude-\\d", "cla" + "ude [0-9]", "op" + "us", "son" + "net", "hai" + "ku", "gem" + "ini", "lla" + "ma", "mis" + "tral"].join("|") + ")\\b", "i");
  const CLAIM = new RegExp("\\b(" + ["partnered " + "with", "in partner" + "ship with", "endorsed " + "by", "our " + "customers", "valuation " + "of", "token " + "price", "raised \\$", "funding " + "round"].join("|") + ")\\b", "i");
  const files = ["WebXR/shared/vc-voices.js", "WebXR/shared/oh-voice.js", "tools/check_voices.mjs", "docs/consoles/VOICES.md", "docs/consoles/memory/VOICES.md", "tools/briefs/next/vc-next.md"];
  let n = 0;
  for (const f of files) { const t = src(f); if (!t) continue; n += 1; ok(!MODEL.test(t), `${f}: model identifier`); ok(!CLAIM.test(t), `${f}: claim wording`); }
  return `${n} files clean`;
});

for (const e of evals) console.log(`EVAL ${e}`);
console.log(`\ncheck_voices: ${passes} passed, ${failures} failed (${Date.now() - t0} ms)`);
process.exit(failures ? 1 : 0);
