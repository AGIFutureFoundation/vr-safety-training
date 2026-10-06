#!/usr/bin/env node
// DATAWORKS checker (docs/consoles/DATAWORKS.md): the consented data system, headlessly.
//   1. schema: DX_SCHEMA is plain JSON data with id, version, units, frames and documented fields
//   2. privacy: nothing recorded before consent; demo, signed-out, K-12 and unknown signals never collect
//   3. consent: opt-in needs licence + adult; every stored human episode carries its receipt
//   4. revoke deletes everything local (dx store, legacy episode log, share consent) and discards live recorders
//   5. storage: oldest-first eviction under the byte and count caps
//   6. export round-trips (JSON Lines shards by split + manifest + card), no session straddles the split
//   7. the dataset card lists every required datasheet section
//   8. analysis numbers match the synthetic fixture's hand-computed values; tools/dx_analyze.mjs agrees
//   9. no network code in any dx-*.js module; no upload endpoint ships
//  10. wiring: the Me-tab mount, check_interface, the analysis page (Home chip, ctlMount, gdMount), the bundler copy

import { readFileSync, existsSync, readdirSync, mkdtempSync, rmSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { tmpdir } from "node:os";
import { execFileSync } from "node:child_process";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const SHARED = join(ROOT, "WebXR", "shared");
let passes = 0, failures = 0;
function check(ok, what, detail = "") {
  if (ok) { passes += 1; console.log(`  ✓ ${what}`); } else { failures += 1; console.log(`  ✗ ${what}${detail ? ` — ${detail}` : ""}`); }
}

// A headless browser storage: localStorage + sessionStorage stand-ins, before profiles.js is imported.
class Mem { constructor() { this.m = new Map(); } getItem(k) { return this.m.has(k) ? this.m.get(k) : null; } setItem(k, v) { this.m.set(k, String(v)); } removeItem(k) { this.m.delete(k); } keys() { return [...this.m.keys()]; } }
globalThis.localStorage = new Mem();
globalThis.sessionStorage = new Mem();
const signIn = () => localStorage.setItem("vr-training-auth-v1", JSON.stringify({ id: "learner-check@example.invalid" }));
const signOut = () => localStorage.removeItem("vr-training-auth-v1");
const flushIdle = () => new Promise((r) => setTimeout(r, 20));

const dx = await import("../WebXR/shared/dx-data.js");
const { gtKeyFor } = await import("../WebXR/shared/profiles.js");
const store = dx.dxUseStore(dx.dxMakeStore(dx.dxMemBackend()));
const ADULT_OK = { demo: false, signedIn: true, k12: false, adult: true };

console.log("check_dataworks — the consented data system");

// 1 schema
console.log("1 schema");
const S = dx.DX_SCHEMA;
check(S.id === "smartcitix.holodeck.episode" && /^\d+\.\d+\.\d+$/.test(S.version), `schema ${S.id}@${S.version}`);
check(JSON.stringify(JSON.parse(JSON.stringify(S))) === JSON.stringify(S), "DX_SCHEMA is plain JSON data (round-trips)");
const fieldsDoc = [...Object.values(S.episodeFields), ...Object.values(S.stepFields)].every((f) => f.type && f.doc);
check(fieldsDoc, `${Object.keys(S.episodeFields).length} episode + ${Object.keys(S.stepFields).length} step fields each typed and documented`);
check(["time", "distance", "angle", "reward"].every((k) => S.units[k]) && S.frames.world.includes("+Y up"), "explicit units (s, m, rad, points) and frames (world +Y up, in-world only)");
check(["observation", "action", "reward", "done", "info"].every((k) => k in S.stepFields), "RLDS-style step: observation, action, reward, done, info");
const docs = readFileSync(join(ROOT, "docs", "robot-datasets.md"), "utf8");
check(docs.includes(S.id) && docs.includes(S.version), "the schema id and version are published in docs/robot-datasets.md");

// 2 privacy — nothing before consent, never for demo / signed-out / K-12 / unknown
console.log("2 privacy");
signIn();
let rec = dx.dxRecorder({ world: "parishes", scenario: "x" });
rec.step({}, { type: "select", id: "a" }, 100); rec.finish({ success: true });
await flushIdle();
check(!rec.active && (await store.list()).length === 0, "signed in, eligible, not opted in: the recorder is inert and nothing is stored");
check(dx.dxCollecting() === false, "dxCollecting() is false before opt-in");
const refuse = (sig, want) => { const e = dx.dxEligibility(sig); return !e.eligible && e.reason === want; };
check(refuse({ ...ADULT_OK, demo: true }, "demo"), "demo session: not eligible");
check(refuse({ ...ADULT_OK, signedIn: false }, "signed-out"), "signed-out session: not eligible");
check(refuse({ ...ADULT_OK, k12: true }, "k12"), "K-12 session: not eligible");
check(refuse({ ...ADULT_OK, demo: null }, "unknown-demo") && refuse({ ...ADULT_OK, signedIn: null }, "unknown-sign-in") && refuse({ ...ADULT_OK, k12: null }, "unknown-k12") && refuse({ ...ADULT_OK, adult: null }, "age-unknown"), "every unknown signal (demo, sign-in, K-12, age) refuses collection");
check(dx.dxReadSignals({ search: "?k12=1" }).k12 === true && dx.dxReadSignals({ search: "?audience=classroom" }).k12 === true, "?k12 and ?audience=classroom read as K-12");
localStorage.setItem(gtKeyFor("vr-scholar-v1"), JSON.stringify({ v: 1, sessions: [{ lessonId: "l1" }] }));
check(dx.dxReadSignals({ search: "" }).k12 === true, "a SCHOLAR K-12 session on this profile reads as K-12");
localStorage.removeItem(gtKeyFor("vr-scholar-v1"));
signOut();
check(!dx.dxOptIn({ licence: "CC0-1.0", adult: true }).ok, "opt-in is refused while signed out");
sessionStorage.setItem("vr-training-demo-v1", "1");
signIn();
check(!dx.dxOptIn({ licence: "CC0-1.0", adult: true }).ok && dx.dxReadSignals().demo === true, "opt-in is refused in the demo");
sessionStorage.removeItem("vr-training-demo-v1");
check(!dx.dxOptIn({ licence: "MIT", adult: true }).ok && !dx.dxOptIn({ licence: "CC0-1.0", adult: false }).ok, "opt-in needs a listed licence and the adult confirmation");

// 3 consent + capture
console.log("3 consent and capture");
const opt = dx.dxOptIn({ licence: "CC-BY-4.0", adult: true, signals: { demo: false, signedIn: true, k12: false } });
check(opt.ok && dx.dxCollecting({ ...ADULT_OK }) && dx.dxCollecting(), "opted in (signed in, adult, not K-12): collecting");
rec = dx.dxRecorder({ world: "parishes", map: "orleans", kind: "lesson", scenario: "fl-levee" });
rec.step({ stepIndex: 0, pos: [1, 0, 2] }, { type: "select", id: "a" }, 100, { outcome: "ok", clean: true });
rec.step({ stepIndex: 1 }, { type: "commit", id: "b", at: 0.5 }, 50, { outcome: "ok", clean: true });
const buffered = (await store.list()).length;
const ep = rec.finish({ success: true, safePractice: true });
check(rec.active && buffered === 0, "steps buffer in memory: nothing written before finish()");
const syncAfterFinish = (await store.list()).length;
await flushIdle();
const stored = await store.list();
check(syncAfterFinish === 0 && stored.length === 1, "finish() writes on an idle callback, not inline (0 → 1 after idle)");
check(stored[0]?.consent?.consentId === opt.consent.id && stored[0].consent.licence === "CC-BY-4.0" && stored[0].consent.statementHash, "the stored episode carries the consent receipt (id, licence, statement hash)");
const v = dx.dxValidateEpisode(ep);
check(v.ok, "the captured episode validates against the schema", v.errors.join("; "));
check(ep.steps.at(-1).done === true && ep.steps[0].done === false && typeof ep.sessionHash === "string" && !JSON.stringify(ep).includes("learner-check"), "done on the last step only; a session hash, never the account id");
const bad = { ...ep, steps: [{ ...ep.steps[0], observation: { name: "Alex", text: "free text" } }] };
check(!dx.dxValidateEpisode(bad).ok, "validation rejects personal-looking fields (name, free text)");
check(!dx.dxValidateEpisode({ ...ep, consent: null }).ok, "validation rejects a human episode without a consent receipt");
const w = await import("../WebXR/shared/dx-world.js");
w.dxCaptureLesson({ world: "parishes", map: "orleans", lesson: { id: "fl-x", check: { options: ["a", "b"] }, steps: ["s"] }, choice: 1, ok: true });
await flushIdle();
const lessonEp = (await store.list()).find((e) => e.scenario === "fl-x");
check(lessonEp && lessonEp.kind === "lesson" && !JSON.stringify(lessonEp).includes('"a","b"'), "a parish field lesson becomes a lesson episode with the choice index only (no option text)");

// 4 revoke
console.log("4 revoke");
localStorage.setItem(gtKeyFor("vr-training-episodes-v1"), "[]"); localStorage.setItem("vr-training-share-consent-v1", "{}");
const live = dx.dxRecorder({ world: "robotics", scenario: "r" });
live.step({}, { type: "wait" }, 0);
const r = await dx.dxRevoke();
const liveEp = live.finish({});
await flushIdle();
check(r.ok && r.remaining === 0 && (await store.list()).length === 0, "revoke deletes every stored episode");
check(!dx.dxConsent() && !dx.dxCollecting(), "revoke deletes the consent; collection stops");
check(localStorage.getItem(gtKeyFor("vr-training-episodes-v1")) == null && localStorage.getItem("vr-training-share-consent-v1") == null, "revoke also deletes the legacy episode log and the share consent");
check(liveEp == null && (await store.list()).length === 0, "a recorder live during revoke stores nothing");

// 5 storage
console.log("5 storage");
const fx = dx.dxSyntheticFixture();
const ev = dx.dxEvict([...fx].reverse(), { maxEpisodes: 5 });
check(ev.length === 5 && ev.map((e) => e.episodeId).sort().join() === "fx-10,fx-11,fx-7,fx-8,fx-9", "count cap evicts oldest first (keeps fx-7 … fx-11)");
const oneBytes = JSON.stringify(fx[0]).length;
const eb = dx.dxEvict(fx, { maxBytes: oneBytes * 3.5 });
check(eb.length === 3 && eb.at(-1).episodeId === "fx-11", `byte cap evicts oldest first (${eb.length} kept under ${Math.round(oneBytes * 3.5)} bytes)`);
const ls = dx.dxMakeStore(dx.dxLsBackend());
dx.dxOptIn({ licence: "CC0-1.0", adult: true, signals: { demo: false, signedIn: true, k12: false } });
await ls.put(fx[0]);
check((await ls.list()).length === 1 && localStorage.keys().some((k) => k.startsWith("dx-episodes-v1::id-")), "localStorage fallback stores under the signed-in profile's namespaced key");
check(typeof dx.dxIdbBackend === "function" && /indexedDB/.test(readFileSync(join(SHARED, "dx-data.js"), "utf8")), "IndexedDB is the first-choice backend (dxIdbBackend), localStorage the fallback");
await dx.dxRevoke({ store: ls });
check((await ls.list()).length === 0, "revoke clears the localStorage backend too");

// 6 export round-trip
console.log("6 export");
const { files, manifest, card } = dx.dxExportFiles(fx, { createdAt: "2026-01-01T00:00:00.000Z" });
const shards = files.filter((f) => f.path.endsWith(".jsonl"));
const back = shards.flatMap((f) => dx.dxParseJsonl(f.text));
const byId = (a) => [...a].sort((x, y) => x.episodeId.localeCompare(y.episodeId));
check(JSON.stringify(byId(back)) === JSON.stringify(byId(fx)), `export round-trips: ${back.length}/${fx.length} episodes identical after JSON Lines`);
check(manifest.counts.episodes === 12 && manifest.shards.length === shards.length && files.some((f) => f.path === "manifest.json") && files.some((f) => f.path === "DATASET_CARD.md"), `manifest + card + ${shards.length} shard(s) (${manifest.counts.train} train / ${manifest.counts.validation} validation)`);
const splitOf = new Map(); let straddle = 0;
for (const f of shards) for (const e of dx.dxParseJsonl(f.text)) { const s = f.path.includes("train") ? "train" : "validation"; if (splitOf.has(e.sessionHash) && splitOf.get(e.sessionHash) !== s) straddle += 1; splitOf.set(e.sessionHash, s); }
check(straddle === 0, "no session hash straddles train and validation");
check(manifest.upload.shipped === false && dx.dxUploadEndpoint({}) === null && dx.dxUploadEndpoint({ dataworks: { upload: { endpoint: "http://x" } } }) === null, "no upload ships; the hook accepts only a configured https endpoint");

// 7 card
console.log("7 dataset card");
const missing = dx.DX_CARD_SECTIONS.filter((h) => !card.includes(`## ${h}\n`));
check(!missing.length, `dataset card lists all ${dx.DX_CARD_SECTIONS.length} datasheet sections`, missing.join(", "));
check(["Motivation", "Composition", "Collection process", "Consent", "De-identification", "Licence", "Known gaps and biases", "Intended uses", "Out-of-scope uses"].every((h) => dx.DX_CARD_SECTIONS.includes(h)), "required: motivation, composition, collection, consent, de-identification, licence, gaps/biases, intended and out-of-scope uses");

// 8 analysis vs the fixture's hand-computed truth
console.log("8 analysis");
const a = dx.dxAnalyze(fx);
check(a.total === 12 && a.successRate === 0.833 && a.safeRate === 0.833, `success and safe-practice 10/12 = ${a.successRate}`);
check(a.byScenario["rb-amr-fleet-routing"].successRate === 0.75 && a.byScenario["ad-robot-cell-lockout-and-safe-reentry"].episodes === 5 && a.byScenario["parish-lesson-levee"].successRate === 1, "by scenario: 3/4, 5 episodes, 3/3");
check(a.byScenario["rb-amr-fleet-routing"].meanDurationS === 27.5, "mean duration with the 90 s idle run: (5+5+5+95)/4 = 27.5 s");
check(a.stepDurations.n === 36 && a.stepDurations.meanS === 3.833 && a.stepDurations.medianS === 1.5, `step durations: n 36, mean 138/36 = ${a.stepDurations.meanS}, median 1.5`);
check(a.interrupts.answered === 2 && a.interrupts.missed === 1 && a.interrupts.responseRate === 0.667 && a.interrupts.meanResponseS === 4, "interruptions: 2 answered, 1 missed, rate 0.667, mean response 4 s");
check(a.errors.hazard === 2 && Object.keys(a.errors).length === 1, "error taxonomy: hazard 2");
check(a.actions.select === 24 && a.actions.press === 12 && a.actions.commit === 12, "action distribution: select 24, press 12, commit 12");
check(a.flags.truncated === 1 && a.flags.idle === 1 && a.flags.duplicate === 1 && a.flagged.map((f) => f.episodeId).join() === "fx-7,fx-9,fx-11", "quality flags: truncated fx-7, idle fx-9, duplicate fx-11");
check(a.split.train + a.split.validation === 12 && a.split.sessionOverlap === 0, `split by session hash: ${a.split.train}/${a.split.validation}, overlap 0`);
const tool = JSON.parse(execFileSync(process.execPath, [join(ROOT, "tools", "dx_analyze.mjs"), "--fixture", "--json"], { encoding: "utf8" }));
check(tool.successRate === a.successRate && JSON.stringify(tool.flags) === JSON.stringify(a.flags) && tool.stepDurations.meanS === a.stepDurations.meanS, "tools/dx_analyze.mjs --fixture prints the same numbers");
const tmp = mkdtempSync(join(tmpdir(), "dx-"));
try {
  execFileSync(process.execPath, [join(ROOT, "tools", "dx_analyze.mjs"), "--fixture", "--export", tmp], { encoding: "utf8" });
  const re = JSON.parse(execFileSync(process.execPath, [join(ROOT, "tools", "dx_analyze.mjs"), tmp, "--json"], { encoding: "utf8" }));
  check(re.total === 12 && re.successRate === a.successRate && re.invalid.length === 0, "dx_analyze --export then re-read: same numbers, 0 invalid");
} finally { rmSync(tmp, { recursive: true, force: true }); }

// 9 no network
console.log("9 no network");
const dxFiles = readdirSync(SHARED).filter((f) => /^dx-.*\.js$/.test(f));
const net = dxFiles.filter((f) => /\bfetch\s*\(|XMLHttpRequest|sendBeacon|WebSocket|EventSource/.test(readFileSync(join(SHARED, f), "utf8")));
check(dxFiles.length >= 4 && !net.length, `no network call in ${dxFiles.length} dx modules (${dxFiles.join(", ")})`, net.join(", "));
const tools = ["dx_analyze.mjs"].filter((f) => /\bfetch\s*\(|http\.request|https\.request/.test(readFileSync(join(ROOT, "tools", f), "utf8")));
check(!tools.length, "tools/dx_analyze.mjs makes no network call");

// 10 wiring
console.log("10 wiring");
const html = readFileSync(join(ROOT, "WebXR", "parishes", "parishes.html"), "utf8");
const meStart = html.indexOf('id="ux-panel-me"');
const mePanel = html.slice(meStart, html.indexOf('role="tabpanel"', meStart + 20) > 0 ? html.indexOf('role="tabpanel"', meStart + 20) : undefined);
check(meStart > 0 && mePanel.includes('id="menu-dataworks"'), "the consent panel mount #menu-dataworks sits inside the Me tab");
check(readFileSync(join(ROOT, "tools", "check_interface.mjs"), "utf8").includes('"menu-dataworks"'), "check_interface lists menu-dataworks");
const app = readFileSync(join(ROOT, "WebXR", "parishes", "js", "app.js"), "utf8");
check(/dxMountConsent\(\$\("menu-dataworks"\)[,)]/.test(app) && app.includes("dxCaptureLesson(") && app.includes("dxCaptureDrill("), "the parishes app mounts the panel and captures lessons and drills (gated)");
const page = join(ROOT, "WebXR", "data", "index.html");
const pageSrc = existsSync(page) ? readFileSync(page, "utf8") : "";
check(pageSrc.includes('class="home-chip"') && pageSrc.includes("ctlMount(") && pageSrc.includes("gdMount(") && pageSrc.includes("design.css") && pageSrc.includes("dxAnalyze"), "WebXR/data/index.html: design system, Home chip, ctlMount, gdMount, dxAnalyze");
check(readFileSync(join(ROOT, "tools", "bundle_webxr.py"), "utf8").includes('"data" / "index.html"'), "the flat build copies the analysis page (tools/bundle_webxr.py)");

console.log(`check_dataworks: ${passes} passed, ${failures} failed`);
process.exit(failures ? 1 : 0);
