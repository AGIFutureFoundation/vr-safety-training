#!/usr/bin/env node
/**
 * STRANDS (docs/strands-robots.md): the Python-first harness on the strands-robots interface, simulated only.
 *   1. python3 robotics/strands/selftest.py (standard library only) passes, and its required checks are present:
 *      physical 0; serial and camera never opened (patched); hardware refused with the governor's reason; deterministic
 *      for a seed; the Python adapters reproduce raRun; compare rows valid; the sample runs; no credential read from the
 *      environment; network 0
 *   2. the exported weights match a fresh build (node tools/ra_export_weights.mjs --check; STRANDS-2: with the station
 *      clones, ra-lm@stations and ra-lm-h@stations)
 *   3. docs/evals/strands.json: rows in arena.json's shape with Wilson intervals, physical 0, every step governor-checked;
 *      a heldOut block only after both declarations, and its declaration commit is an ancestor of the results commit
 *   4. honesty in code and docs: no import of a strands_harness package; the docs say it does not exist, simulated only,
 *      no hosted model; no environment read in the bridge; no model identifier
 *   5. wiring: check_all lists this checker, an estimated baseline row, CI sets up Python 3
 *   6. STRANDS-2: the LeRobot-style JSONL exporter (robotics/strands/lerobot_jsonl.py, standard library only) on the
 *      committed sample and on the full set (node tools/ra_dataset.mjs --full into a temp dir): round-trip counts equal
 *      index.json's, every row valid, leakage 0
 * Run: node tools/check_strands.mjs
 */
import { readFileSync, existsSync, readdirSync, mkdtempSync, rmSync } from "node:fs";
import { dirname, join } from "node:path";
import { tmpdir } from "node:os";
import { fileURLToPath } from "node:url";
import { execFileSync } from "node:child_process";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const t0 = Date.now();
let passes = 0, failures = 0;
function check(name, fn) {
  try { const note = fn(); passes += 1; console.log(`ok   ${name}${note ? ` — ${note}` : ""}`); }
  catch (e) { failures += 1; console.log(`FAIL ${name} — ${e?.message ?? e}`); }
}
const assert = (c, m) => { if (!c) throw new Error(m); };
const read = (p) => readFileSync(join(ROOT, p), "utf8");
const git = (...a) => execFileSync("git", a, { cwd: ROOT, encoding: "utf8" }).trim();
const ENV = { PATH: process.env.PATH ?? "/usr/bin:/bin" };

// 1. the selftest
let st = null;
check("python3 robotics/strands/selftest.py passes with no third-party package", () => {
  let out;
  try { out = execFileSync("python3", ["robotics/strands/selftest.py"], { cwd: ROOT, encoding: "utf8", env: ENV, timeout: 300000 }); }
  catch (e) { out = e.stdout ?? ""; }
  st = JSON.parse(out.trim().split("\n").pop());
  assert(st.fail === 0, `${st.fail} failed: ${st.results.filter((r) => !r.ok).map((r) => r.check).join("; ")}`);
  return `${st.pass} pass, 0 fail; ${st.policyBase}`;
});
const need = ["no third-party package imported", "physical dispatches 0", "serial ports and cameras never opened", "hardware refused (port)", "hardware refused (physical)",
  "guards are live (credential read, device open, socket, serial use each caught when tripped)", "deterministic for a seed", "Python adapters reproduce raRun per seed", "compare rows valid (arena.json row shape, Wilson 95%)", "the sample runs",
  "no API key or credential read from the environment", "network calls 0 (Python sockets and the bridge)", "policies runnable through the Policy interface", "every step governor-checked",
  // STRANDS-2: stations through the bridge, the arena's published ra-lm build and ra-lm-h
  "station scenarios through the bridge", "station parity with raRun per seed", "published ra-lm build and ra-lm-h reproduce raRun on the gym scenarios", "seed gate: stations dev only, protocol-3 seeds refused",
  // STRANDS-3: the declared protocol-3 parity check is allowed once, for bc and ra-lm-h on gym scenarios only, and refused after
  "seed gate: protocol-3 parity only as declared, once"];
for (const n of need) check(`selftest: ${n}`, () => { const r = st?.results.find((x) => x.check === n); assert(r, "missing"); assert(r.ok, r.detail); return r.detail?.slice(0, 90); });

// 2. weights
check("exported weights match a fresh build", () => {
  const out = execFileSync("node", ["tools/ra_export_weights.mjs", "--check"], { cwd: ROOT, encoding: "utf8", env: ENV, timeout: 300000 });
  assert(/weights match a fresh build/.test(out), out.split("\n").filter((l) => /DIFFERS/.test(l)).join(", "));
  const files = readdirSync(join(ROOT, "robotics", "strands", "weights"));
  return `${files.length} files`;
});

// 3. the eval file
const ROW = ["rank", "modelId", "scenarios", "episodes", "success", "ci95", "ruleBreaks", "ruleBreaksPerEpisode", "meanSteps", "stops", "governorChecked", "physical", "perScenario"];
check("docs/evals/strands.json rows valid, physical 0, every step governor-checked", () => {
  const d = JSON.parse(read("docs/evals/strands.json"));
  const blocks = ["dev", "devStations", "devStationSeeds", "heldOut", "protocol3Parity"].filter((b) => d[b]);
  assert(d.dev, "no dev block");
  for (const b of blocks) {
    for (const r of d[b].leaderboard) {
      assert(ROW.every((k) => k in r) && Object.keys(r).length === ROW.length, `${b} ${r.modelId}: row shape`);
      assert(r.ci95[0] <= r.success && r.success <= r.ci95[1] && r.physical === 0 && r.governorChecked === 1, `${b} ${r.modelId}: interval/physical/governor`);
    }
    const t = d[b].totals;
    assert(t.physical === 0 && t.stepsRun === t.stepsChecked && t.networkBlocked === 0 && t.auditChainsOk, `${b} totals`);
  }
  if (d.dev) assert(d.dev.results.every((r) => r.perSeed.every((p) => p.seed >= 1 && p.seed <= 20)), "dev seeds outside 1-20");
  for (const b of ["devStations", "devStationSeeds"]) if (d[b]) assert(d[b].results.every((r) => r.scenarioId.startsWith("rb-station-") && r.perSeed.every((p) => p.seed >= 1 && p.seed <= 20)), `${b}: a non-station row or a seed outside 1-20`);
  return blocks.map((b) => `${b}: ${d[b].leaderboard.length} rows, ${d[b].totals.episodes} episodes`).join("; ");
});
// STRANDS-3: the one protocol-3 parity check ec8bf4c5's consumers clause allows, recomputed here against claw3.json.
check("protocol-3 parity block: bc and ra-lm-h only, seeds 7241-7300, counts equal claw3.json, declarations cited", () => {
  const d = JSON.parse(read("docs/evals/strands.json"));
  if (!d.protocol3Parity) return "no protocol3Parity block (not run)";
  const b = d.protocol3Parity, claw = JSON.parse(read("docs/evals/claw3.json")), sd = JSON.parse(read("docs/evals/strands-declared-r9.json"));
  assert(b.policies.every((p) => ["bc", "ra-lm-h"].includes(p)), `policies ${b.policies.join(", ")}`);
  assert(b.results.every((r) => !r.scenarioId.startsWith("rb-station-") && r.perSeed.length === 60 && r.perSeed.every((p) => p.seed >= 7241 && p.seed <= 7300)), "a station row, or seeds outside 7241-7300, or not 60");
  assert(b.declarations?.arena === "ec8bf4c5" && sd.arenaDeclaration.commit === "ec8bf4c5" && sd.clawRecord.file === "docs/evals/claw3.json", "the block or the declaration does not cite ec8bf4c5 and claw3.json");
  assert(claw.protocol?.seedSource?.commit === "ec8bf4c5" && /7241/.test(claw.protocol.seeds), "claw3.json is not the ec8bf4c5 protocol-3 record");
  let equal = 0;
  for (const r of b.results) {
    const rec = claw.runs.find((x) => x.scenarioId === r.scenarioId)?.results.find((x) => x.modelId === r.modelId);
    assert(rec, `${r.modelId} on ${r.scenarioId} is not in claw3.json`);
    assert(rec.k === r.successes && rec.n === r.n && rec.ruleBreaks === r.ruleBreaks, `${r.modelId} on ${r.scenarioId}: Python ${r.successes}/${r.n} (${r.ruleBreaks} rule breaks) ≠ claw ${rec.k}/${rec.n} (${rec.ruleBreaks})`);
    equal += 1;
  }
  assert(b.parity.equal === equal && b.parity.of === b.results.length && equal === b.results.length, "the block's own parity count disagrees");
  assert(b.totals.physical === 0 && b.totals.networkBlocked === 0, "physical or network not 0");
  // The gate refuses a second run (the block exists), in any checkout.
  const gate = JSON.parse(execFileSync("python3", ["-c", "import json,sys; sys.path.insert(0, '.'); from robotics.strands.harness import seed_gate, PROTOCOL3_SEEDS; print(json.dumps(seed_gate(PROTOCOL3_SEEDS, ['rb-port-gantry'], ['bc', 'ra-lm-h'])))"], { cwd: ROOT, encoding: "utf8", env: ENV, timeout: 60000 }).trim());
  assert(gate.ok === false && /already run once/.test(gate.reason), `the gate would allow a second protocol-3 run: ${JSON.stringify(gate)}`);
  return `${equal} of ${b.results.length} (policy, scenario) counts equal claw3.json over ${b.totals.episodes} episodes; ${b.parity.scenariosCompared.length} of ${claw.protocol.scenarios.length} protocol scenarios (not run: ${b.parity.scenariosNotRun.join(", ")}); second run refused`;
});
check("station seed sensitivity block (devStationSeeds): expert and bc, seeds 1-20, per-seed lengths recorded", () => {
  const d = JSON.parse(read("docs/evals/strands.json"));
  if (!d.devStationSeeds) return "no devStationSeeds block";
  const b = d.devStationSeeds, s = b.seedSensitivity;
  assert(s && Array.isArray(s.rows) && s.rows.length === b.results.length, "no seedSensitivity table");
  assert(b.results.every((r) => r.perSeed.length === 20 && r.perSeed.map((p) => p.seed).join() === Array.from({ length: 20 }, (_, i) => i + 1).join()), "not seeds 1-20");
  for (const row of s.rows) {
    const r = b.results.find((x) => x.modelId === row.modelId && x.scenarioId === row.scenarioId);
    assert(r && Object.keys(row.stepsBySeed).length === 20 && r.perSeed.every((p) => row.stepsBySeed[String(p.seed)] === p.steps), `${row.modelId} ${row.scenarioId}: the table disagrees with perSeed`);
    assert(row.distinctLengths === new Set(Object.values(row.stepsBySeed)).size, `${row.modelId} ${row.scenarioId}: distinct lengths`);
  }
  return `${s.seedsThatChangeAnEpisode} of ${s.of} seeds change an episode; ${s.rows.map((r) => `${r.modelId} ${r.scenarioId.replace("rb-station-", "")} ${r.distinctLengths} length${r.distinctLengths === 1 ? "" : "s"}`).join(", ")}`;
});
check("held-out rows only after both declarations were committed", () => {
  const d = JSON.parse(read("docs/evals/strands.json"));
  if (!d.heldOut) return "no held-out block";
  // Content first (works in any checkout): the block cites both declarations, the declaration file cites ARENA-2's commit.
  const sd = JSON.parse(read("docs/evals/strands-declared.json"));
  assert(d.heldOut.declarations?.strands && d.heldOut.declarations?.arena, "held-out block does not cite the declarations");
  assert(d.heldOut.declarations.arena.startsWith(sd.arenaDeclaration.commit), "held-out block cites a different ARENA-2 declaration");
  assert(d.heldOut.results.every((r) => r.perSeed.every((p) => p.seed >= 7181 && p.seed <= 7240)), "held-out seeds outside 7181-7240");
  // Ancestry needs full history: a shallow clone (CI's default checkout) or no git skips it, and says so.
  let shallow = true;
  try { shallow = git("rev-parse", "--is-shallow-repository") === "true"; } catch (_) { return "git not available: ancestry not checked"; }
  if (shallow) return `shallow clone: ancestry not checked (content checks passed; cites ${d.heldOut.declarations.strands.slice(0, 8)})`;
  const decl = git("log", "--diff-filter=A", "--format=%H", "--", "docs/evals/strands-declared.json").split("\n").pop();
  const arena = git("log", "--diff-filter=A", "--format=%H", "--", "docs/evals/arena-declared-r7.json").split("\n").pop();
  assert(decl && arena, "a declaration is not committed");
  const anc = (a, b) => { try { git("merge-base", "--is-ancestor", a, b); return true; } catch (_) { return false; } };
  // The results commit: the first commit whose strands.json carries a heldOut block.
  const res = git("log", "--format=%H", "--reverse", "-S", "\"heldOut\"", "--", "docs/evals/strands.json").split("\n")[0];
  assert(res, "the held-out block is not committed");
  assert(anc(arena, decl), `ARENA-2's declaration ${arena.slice(0, 8)} does not precede this harness's ${decl.slice(0, 8)}`);
  assert(anc(decl, d.heldOut.declarations.strands), `the run's base ${d.heldOut.declarations.strands.slice(0, 8)} does not contain the declaration ${decl.slice(0, 8)}`);
  assert(res !== decl && anc(decl, res), `results ${res.slice(0, 8)} were not committed after the declaration ${decl.slice(0, 8)}`);
  return `arena ${arena.slice(0, 8)} → declared ${decl.slice(0, 8)} → results ${res.slice(0, 8)}, ${d.heldOut.totals.episodes} episodes`;
});

// 4. honesty
const PY = readdirSync(join(ROOT, "robotics", "strands")).filter((f) => f.endsWith(".py")).map((f) => `robotics/strands/${f}`).concat(["robotics/strands/examples/pick_red_cube.py"]);
check("no strands_harness import in code; no credential read in source", () => {
  for (const f of [...PY, "tools/ra_bridge.mjs", "tools/ra_export_weights.mjs"]) {
    const s = read(f);
    assert(!/^\s*(from|import)\s+strands_harness/m.test(s), `${f} imports strands_harness`);
    const envUses = [...s.matchAll(/os\.environ(?:\.get)?\s*[\[(]\s*["']([A-Z_]+)/g)].map((m) => m[1]).filter((k) => k !== "PATH");
    assert(!envUses.length, `${f} reads ${envUses.join(", ")}`);
  }
  assert(!/process\.env/.test(read("tools/ra_bridge.mjs")), "the bridge reads process.env");
  return `${PY.length + 2} files`;
});
check("docs/strands-robots.md carries the honesty notes and the mapping", () => {
  const s = read("docs/strands-robots.md");
  for (const w of ["strands_harness", "not affiliated", "simulated only", "no hosted model", "apache-2.0", "mockpolicy", "ra_dataset", "so100"]) assert(s.toLowerCase().includes(w), `missing "${w}"`);
  return `${s.length} chars`;
});
check("no model identifier in the STRANDS files", () => {
  for (const f of [...PY, "tools/ra_bridge.mjs", "tools/ra_export_weights.mjs", "docs/strands-robots.md"]) assert(!/\b(claude|opus|sonnet|haiku|gpt-\d)/i.test(read(f)), f);
});

// 5. wiring
check("check_all lists check_strands, estimated baseline row, CI sets up Python 3", () => {
  assert(read("tools/check_all.mjs").includes('"check_strands.mjs"'), "check_all");
  const b = JSON.parse(read("docs/perf/checkers-baseline.json"));
  assert(JSON.stringify(b).includes("check_strands.mjs") && /ESTIMATE/.test(JSON.stringify(b).split("check_strands.mjs").slice(-1)[0].slice(0, 300)), "baseline row");
  assert(/setup-python/.test(read(".github/workflows/webxr-checks.yml")), "CI python");
});

// 6. the LeRobot-style JSONL exporter
const lrRun = (args) => { let out; try { out = execFileSync("python3", ["robotics/strands/lerobot_jsonl.py", "--check", ...args], { cwd: ROOT, encoding: "utf8", env: ENV, timeout: 300000 }); } catch (e) { out = e.stdout ?? ""; } return JSON.parse(out.trim().split("\n").pop()); };
check("LeRobot-style JSONL exporter: committed sample round-trips, rows valid, leakage 0", () => {
  const tmp = mkdtempSync(join(tmpdir(), "st2-lr-"));
  try { const r = lrRun(["exports/robotics/arena", join(tmp, "out"), "--sample"]); assert(r.ok, r.problems.join("; ")); return `${r.episodes} episodes, ${r.frames} frames, rows ${r.rowsValid}, leakage ${r.leakage}`; }
  finally { rmSync(tmp, { recursive: true, force: true }); }
});
check("LeRobot-style JSONL exporter: full set counts equal index.json, rows valid, leakage 0", () => {
  const tmp = mkdtempSync(join(tmpdir(), "st2-lr-"));
  try {
    execFileSync("node", ["tools/ra_dataset.mjs", "--full", "--out", join(tmp, "ds")], { cwd: ROOT, encoding: "utf8", env: ENV, timeout: 300000 });
    const r = lrRun([join(tmp, "ds"), join(tmp, "out")]); assert(r.ok, r.problems.join("; "));
    return `${r.episodes} episodes, ${r.frames} frames, ${r.scenarios} scenarios, rows ${r.rowsValid}, leakage ${r.leakage}`;
  } finally { rmSync(tmp, { recursive: true, force: true }); }
});
check("the exporter takes no new dependency", () => {
  const s = read("robotics/strands/lerobot_jsonl.py");
  const mods = [...s.matchAll(/^\s*(?:from|import)\s+([a-zA-Z_][\w.]*)/gm)].map((m) => m[1].split(".")[0]);
  const std = new Set(["__future__", "json", "re", "shutil", "sys", "pathlib", "typing"]);
  const extra = mods.filter((m) => !std.has(m));
  assert(!extra.length, `imports ${extra.join(", ")}`);
  return `imports: ${[...new Set(mods)].join(", ")}`;
});

console.log(`\ncheck_strands: ${passes} pass, ${failures} fail (${((Date.now() - t0) / 1000).toFixed(1)} s)`);
process.exit(failures ? 1 : 0);
