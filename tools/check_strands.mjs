#!/usr/bin/env node
/**
 * STRANDS (docs/strands-robots.md): the Python-first harness on the strands-robots interface, simulated only.
 *   1. python3 robotics/strands/selftest.py (standard library only) passes, and its required checks are present:
 *      physical 0; serial and camera never opened (patched); hardware refused with the governor's reason; deterministic
 *      for a seed; the Python adapters reproduce raRun; compare rows valid; the sample runs; no credential read from the
 *      environment; network 0
 *   2. the exported weights match a fresh build (node tools/ra_export_weights.mjs --check)
 *   3. docs/evals/strands.json: rows in arena.json's shape with Wilson intervals, physical 0, every step governor-checked;
 *      a heldOut block only after both declarations, and its declaration commit is an ancestor of the results commit
 *   4. honesty in code and docs: no import of a strands_harness package; the docs say it does not exist, simulated only,
 *      no hosted model; no environment read in the bridge; no model identifier
 *   5. wiring: check_all lists this checker, an estimated baseline row, CI sets up Python 3
 * Run: node tools/check_strands.mjs
 */
import { readFileSync, existsSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
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
  "no API key or credential read from the environment", "network calls 0 (Python sockets and the bridge)", "policies runnable through the Policy interface", "every step governor-checked"];
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
  const blocks = ["dev", "heldOut"].filter((b) => d[b]);
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
  return blocks.map((b) => `${b}: ${d[b].leaderboard.length} rows, ${d[b].totals.episodes} episodes`).join("; ");
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

console.log(`\ncheck_strands: ${passes} pass, ${failures} fail (${((Date.now() - t0) / 1000).toFixed(1)} s)`);
process.exit(failures ? 1 : 0);
