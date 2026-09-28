/**
 * The proofs behind the platform's phone, laptop and headset claim, and the
 * checkers' own speed (console PROVING, docs/consoles/PROVING.md). Fast: no
 * browser, only the recorded files.
 *
 *  1. docs/perf/frames.json (tools/measure_frames.mjs) exists, is at most
 *     PV_FRESH_DAYS old (30), carries the SwiftShader "relative" note and a
 *     run for every page in tools/lib/pv_browser.mjs on both tiers, none
 *     failed; each run's average frame time is within 1.5× of the recorded
 *     baseline when the run's load average was at or under the core count.
 *  2. docs/perf/phone.json (tools/phone_pass.mjs): fresh, both sizes for
 *     every page, every recorded budget holds (no horizontal overflow, HUD
 *     text ≥ 14 px, first contentful paint under its budget, no page error),
 *     every capture exists under docs/img/proving/, and the count of tap
 *     targets under 44 px has not grown past the baseline.
 *  3. docs/perf/soak.json (tools/soak.mjs): fresh, both worlds pass their
 *     growth threshold.
 *  4. docs/perf/README.md, headset.md, phone.md and soak.md exist and name
 *     what they measured.
 *  5. docs/perf/checkers-baseline.json exists and names every checker in
 *     check_all; when docs/perf/checkers-last.json (written by check_all) is
 *     from a run whose load average was at or under the core count, no
 *     checker took more than 20% longer than its baseline (plus a 1.5 s
 *     floor for the smallest ones) — a run made under contention is
 *     reported, not judged.
 *  6. Every tools/check_*.mjs file is listed in check_all.mjs.
 *
 *     node tools/check_proving.mjs
 *     node tools/check_proving.mjs --rebaseline   # snapshot the current files as the baseline
 */
import { readFileSync, existsSync, readdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { availableParallelism } from "node:os";
import { PV_PAGES } from "./lib/pv_browser.mjs";

const here = dirname(fileURLToPath(import.meta.url));
const ROOT = join(here, "..");
const PERF = join(ROOT, "docs", "perf");
const FRESH_DAYS = Number(process.env.PV_FRESH_DAYS) || 30;
const CORES = availableParallelism();

let failures = 0, passes = 0;
function check(ok, what, detail = "") {
  if (ok) { passes += 1; return; }
  failures += 1; console.log(`✗ ${what}${detail ? ` — ${detail}` : ""}`);
}
const readJson = (name) => { const p = join(PERF, name); return existsSync(p) ? JSON.parse(readFileSync(p, "utf8")) : null; };
const ageDays = (iso) => (Date.now() - Date.parse(iso)) / 86400000;

const frames = readJson("frames.json");
const phone = readJson("phone.json");
const soak = readJson("soak.json");
const last = readJson("checkers-last.json");

if (process.argv.includes("--rebaseline")) {
  const base = {
    at: new Date().toISOString(),
    frames: Object.fromEntries((frames?.runs ?? []).filter((r) => !r.failed).map((r) => [`${r.id}:${r.tier}`, { avgMs: r.avgMs, p95Ms: r.p95Ms, meshes: r.meshes, triangles: r.triangles }])),
    phoneSmallTargets: phone?.smallTargets ?? null,
  };
  writeFileSync(join(PERF, "baseline.json"), JSON.stringify(base, null, 2) + "\n");
  if (last) writeFileSync(join(PERF, "checkers-baseline.json"), JSON.stringify({ at: last.at, cores: last.cores, loadAvgStart: last.loadAvgStart, wallMs: last.wallMs, sumMs: last.sumMs, checkers: Object.fromEntries(Object.entries(last.checkers).map(([k, v]) => [k, v.ms])) }, null, 2) + "\n");
  console.log(`rebaselined: ${Object.keys(base.frames).length} frame rows, ${base.phoneSmallTargets} small tap targets${last ? `, ${Object.keys(last.checkers).length} checker times` : ""}`);
  process.exit(0);
}
const baseline = readJson("baseline.json");
const checkersBase = readJson("checkers-baseline.json");

// 1. frames
check(!!frames, "docs/perf/frames.json exists", "run node tools/measure_frames.mjs");
if (frames) {
  check(ageDays(frames.at) <= FRESH_DAYS, `frames.json is at most ${FRESH_DAYS} days old`, `${ageDays(frames.at).toFixed(0)} days`);
  check(/relative/i.test(frames.note ?? ""), "frames.json says its SwiftShader numbers are relative");
  check(frames.seconds >= 20, "the walk is at least 20 seconds", `${frames.seconds} s`);
  for (const p of PV_PAGES) for (const tier of ["low", "high"]) {
    const r = frames.runs.find((x) => x.id === p.id && x.tier === tier);
    check(!!r && !r.failed, `frames: ${p.name} on the ${tier} tier was measured`, r?.failed ?? "missing");
    if (r && !r.failed) {
      check(r.frames > 0 && r.avgMs > 0 && Number.isFinite(r.triangles) && Number.isFinite(r.meshes), `frames: ${p.name} ${tier} has frame, mesh and triangle counts`);
      check(r.tierSeen === tier, `frames: ${p.name} ran on the ${tier} tier it asked for`, `saw ${r.tierSeen}`);
      const b = baseline?.frames?.[`${p.id}:${tier}`];
      const quiet = Math.max(...(r.loadAvg ?? [0])) <= CORES;
      if (b && quiet) check(r.avgMs <= b.avgMs * 1.5, `frames: ${p.name} ${tier} average within 1.5× of baseline`, `${r.avgMs} ms vs ${b.avgMs} ms (load ${r.loadAvg.join("→")})`);
      else if (b) console.log(`  · frames: ${p.name} ${tier} measured under load ${r.loadAvg.join("→")} on ${CORES} cores — not judged against the baseline`);
    }
  }
}
check(!!baseline, "docs/perf/baseline.json exists", "run node tools/check_proving.mjs --rebaseline after measuring");

// 2. phone
check(!!phone, "docs/perf/phone.json exists", "run node tools/phone_pass.mjs");
if (phone) {
  check(ageDays(phone.at) <= FRESH_DAYS, `phone.json is at most ${FRESH_DAYS} days old`, `${ageDays(phone.at).toFixed(0)} days`);
  check(phone.fcpBudgetMs > 0, "the phone pass states its paint budget");
  for (const p of PV_PAGES) for (const size of ["360x640", "390x844"]) {
    const r = phone.results.find((x) => x.id === p.id && x.size === size);
    check(!!r && !r.failed, `phone: ${p.name} at ${size} was measured`, r?.failed ?? "missing");
    if (r && !r.failed) {
      for (const [k, ok] of Object.entries(r.pass)) check(ok, `phone: ${p.name} ${size} — ${k} holds`, k === "paint" ? `${r.fcpMs} ms vs ${phone.fcpBudgetMs} ms (load ${r.loadAvg.join("→")})` : k === "overflow" ? `${r.overflowX} px` : k === "hudText" ? r.hudSmall.slice(0, 3).join(", ") : r.errors.join(" | "));
      check(existsSync(join(ROOT, r.capture)), `phone: ${p.name} ${size} capture exists`, r.capture);
    }
  }
  if (baseline?.phoneSmallTargets !== null && baseline?.phoneSmallTargets !== undefined) check(phone.smallTargets <= baseline.phoneSmallTargets, "phone: tap targets under 44 px have not grown", `${phone.smallTargets} now, ${baseline.phoneSmallTargets} at baseline`);
}

// 3. soak
check(!!soak, "docs/perf/soak.json exists", "run node tools/soak.mjs");
if (soak) {
  check(ageDays(soak.at) <= FRESH_DAYS, `soak.json is at most ${FRESH_DAYS} days old`, `${ageDays(soak.at).toFixed(0)} days`);
  check(soak.growthThresholdPct > 0, "the soak states its growth threshold");
  for (const id of ["bayworld", "redwood"]) {
    const r = soak.runs.find((x) => x.id === id);
    check(!!r, `soak: ${id} was run`);
    if (r) check(r.pass, `soak: ${id} held its heap growth threshold`, `${r.firstHeapMB} → ${r.settledHeapMB} MB (${r.growthPct}%) over ${r.minutes} min${r.failed ? `; ${r.failed}` : ""}${r.errors?.length ? `; ${r.errors[0]}` : ""}`);
  }
}

// 4. the documents
for (const [f, needle] of [["README.md", "SwiftShader"], ["headset.md", "real device"], ["phone.md", "360×640"], ["soak.md", "Threshold"]]) {
  const p = join(PERF, f);
  check(existsSync(p) && readFileSync(p, "utf8").includes(needle), `docs/perf/${f} exists and names what it measured`, `wants "${needle}"`);
}

// 5. checker speed
const allSrc = readFileSync(join(here, "check_all.mjs"), "utf8");
const listed = [...allSrc.matchAll(/"(check_[a-z0-9_]+\.mjs)"/g)].map((m) => m[1]).filter((n) => n !== "check_all.mjs");
check(!!checkersBase, "docs/perf/checkers-baseline.json exists", "run check_all, then node tools/check_proving.mjs --rebaseline");
if (checkersBase) {
  const missing = listed.filter((n) => !(n in checkersBase.checkers));
  check(missing.length === 0, "the checker baseline names every checker in check_all", missing.join(", "));
  if (last) {
    const quiet = last.loadAvgStart <= last.cores;
    if (!quiet) console.log(`  · the last check_all ran at load ${last.loadAvgStart} on ${last.cores} cores — its times are recorded, not judged`);
    else {
      const slow = [];
      for (const [n, v] of Object.entries(last.checkers)) {
        const b = checkersBase.checkers[n];
        if (b && v.ms !== null && v.ms > Math.max(b * 1.2, b + 1500)) slow.push(`${n} ${v.ms} ms vs ${b} ms`);
      }
      check(slow.length === 0, "no checker took more than 20% longer than its baseline", slow.join("; "));
    }
    console.log(`  · last check_all: ${(last.wallMs / 1000).toFixed(0)} s wall for ${(last.sumMs / 1000).toFixed(0)} s of checker time, up to ${last.peakParallel} at once, load ${last.loadAvgStart}→${last.loadAvgEnd}`);
  } else console.log("  · no docs/perf/checkers-last.json yet — check_all writes it");
}

// 6. every checker is listed
const onDisk = readdirSync(here).filter((f) => /^check_[a-z0-9_]+\.mjs$/.test(f) && f !== "check_all.mjs");
const unlisted = onDisk.filter((f) => !listed.includes(f));
check(unlisted.length === 0, "every tools/check_*.mjs is listed in check_all.mjs", unlisted.join(", "));

if (failures) { console.log(`check_proving: ${failures} failed, ${passes} passed`); process.exit(1); }
console.log(`check_proving: ${passes} checks pass — frames ${frames?.runs.length ?? 0} runs, phone ${phone?.results.length ?? 0} page sizes, soak ${soak?.runs.length ?? 0} worlds, ${listed.length} checkers timed`);
