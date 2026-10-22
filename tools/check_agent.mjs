/**
 * Checks the draft platform agent definition (agents/foreman/agent.json), the
 * skill registry it binds to and the dataset export layouts it writes:
 *
 *   - the registry is current (tools/gen_skill_registry.mjs --check) and
 *     covers every step kind the engine has;
 *   - every function has a JSON-schema parameter object whose `required`
 *     names only declared properties, belongs to exactly one worker, and
 *     binds to a module export that really exists in this repository;
 *   - every primitive a function names is a registry primitive and every
 *     example station is a registry station;
 *   - a tiny export's LeRobot-style and RLDS-style layouts validate;
 *   - no key, secret, wallet address, endpoint or network call appears in the
 *     agent definition, the roadmap or the new modules.
 *
 *     node tools/check_agent.mjs       # or node tools/check_all.mjs
 */
import { spawnSync } from "node:child_process";
import { existsSync, mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const NODE = process.execPath;
let failures = 0;
async function check(name, fn) {
  try { await fn(); console.log(`  ✓ ${name}`); }
  catch (err) { failures += 1; console.log(`  ✗ ${name}\n      ${err.message ?? err}`); }
}
const ok = (v, what) => { if (!v) throw new Error(what); };

console.log("Platform agent (agents/foreman/agent.json), skill registry and export layouts\n");

const agent = JSON.parse(readFileSync(join(ROOT, "agents", "foreman", "agent.json"), "utf8"));
const reg = await import("../WebXR/shared/skill-registry.js");
const primIds = new Set(reg.SK_PRIMITIVES.map((p) => p.id));
const stationIds = new Set(reg.SK_STATIONS.map((s) => s.id));

await check("the skill registry is current with the station content", () => {
  const r = spawnSync(NODE, [join(ROOT, "tools", "gen_skill_registry.mjs"), "--check"], { encoding: "utf8", cwd: ROOT });
  ok(r.status === 0, (r.stdout + r.stderr).trim());
});

await check("the registry maps every engine step kind to a primitive, and every node to a known primitive", () => {
  // Every step kind WebXR/shared/game.js dispatches on (see its select()/tick()).
  const kinds = ["select", "sequence", "find", "gauge", "hold", "track", "turn", "drive", "drag"];
  for (const k of kinds) ok(reg.skPrimitiveForKind(k), `no primitive for step kind ${k}`);
  const expect = { select: "reach-and-press", turn: "rotate-to-angle", drag: "pick-and-place", gauge: "hold-in-band", track: "track-a-signal", drive: "path-follow" };
  for (const [k, p] of Object.entries(expect)) ok(reg.skPrimitiveForKind(k).id === p, `${k} should map to ${p}`);
  for (const s of reg.SK_STATIONS) for (const n of s.nodes) ok(primIds.has(n.p), `${s.app}/${s.id} node ${n.id}: unknown primitive ${n.p}`);
  ok(reg.SK_STATIONS.length > 600, `expected the full catalog, got ${reg.SK_STATIONS.length} stations`);
});

await check("the agent definition has a goal, a description, workers and functions", () => {
  for (const f of ["name", "goal", "description", "workers", "functions"]) ok(agent[f], `${f} missing`);
  ok(agent.status === "draft", "the definition must stay marked draft until verified against current protocol docs");
  ok(agent.workers.length > 0 && agent.functions.length > 0, "no workers or no functions");
});

await check("every function is owned by exactly one worker and every worker names only real functions", () => {
  const names = new Set(agent.functions.map((f) => f.name));
  ok(names.size === agent.functions.length, "duplicate function name");
  const owner = new Map();
  for (const w of agent.workers) for (const fn of w.functions) {
    ok(names.has(fn), `worker ${w.id} names unknown function ${fn}`);
    ok(!owner.has(fn), `function ${fn} owned by both ${owner.get(fn)} and ${w.id}`);
    owner.set(fn, w.id);
  }
  for (const n of names) ok(owner.has(n), `function ${n} belongs to no worker`);
});

await check("every function's parameters are a valid JSON-schema object", () => {
  for (const f of agent.functions) {
    const p = f.parameters;
    ok(p && p.type === "object" && p.properties && typeof p.properties === "object", `${f.name}: parameters must be a type:object schema`);
    for (const r of p.required ?? []) ok(r in p.properties, `${f.name}: required ${r} not declared`);
    for (const [k, v] of Object.entries(p.properties)) ok(typeof v.type === "string", `${f.name}.${k}: no type`);
  }
});

await check("every binding resolves to a real export, every primitive and example station to the registry", () => {
  for (const f of agent.functions) {
    for (const b of [f.binding, ...(f.alsoUses ?? [])]) {
      ok(b?.module && b?.export, `${f.name}: binding needs module and export`);
      const path = join(ROOT, b.module);
      ok(existsSync(path), `${f.name}: ${b.module} does not exist`);
      const src = readFileSync(path, "utf8");
      ok(new RegExp(`export\\s+(async\\s+)?(function|const|class|let)\\s+${b.export}\\b`).test(src), `${f.name}: ${b.module} has no export ${b.export}`);
    }
    for (const p of f.primitives ?? []) ok(primIds.has(p), `${f.name}: ${p} is not a registry primitive`);
    for (const s of f.exampleStations ?? []) ok(stationIds.has(s), `${f.name}: ${s} is not a registry station`);
  }
});

await check("a tiny export's LeRobot-style and RLDS-style layouts validate against their schemas", async () => {
  const scratch = mkdtempSync(join(tmpdir(), "agent-check-"));
  try {
    const r = spawnSync(NODE, [join(ROOT, "tools", "export_dataset.mjs"), "--apps", "trades", "--stations", "2", "--seeds", "1", "--skills", "1", "--out", scratch], { encoding: "utf8", cwd: ROOT });
    ok(r.status === 0, `export failed: ${r.stderr}`);
    const { validateFormats } = await import("./lib/dataset_formats.mjs");
    const v = validateFormats(scratch);
    ok(v.lerobot.present && v.lerobot.valid, `lerobot: ${JSON.stringify(v.lerobot.issues)}`);
    ok(v.rlds.present && v.rlds.valid, `rlds: ${JSON.stringify(v.rlds.issues)}`);
    ok(v.lerobot.frames > 0 && v.lerobot.frames === v.rlds.steps, "lerobot frames and rlds steps should agree and be non-zero");
  } finally { rmSync(scratch, { recursive: true, force: true }); }
});

await check("no key, secret, wallet address, endpoint or network call in the agent, the roadmap or the new modules", () => {
  const files = ["agents/foreman/agent.json", "docs/agent-roadmap.md", "tools/lib/dataset_formats.mjs", "tools/gen_skill_registry.mjs", "WebXR/shared/skill-registry.js"];
  const bad = [
    [/0x[0-9a-fA-F]{40}\b/, "an address-like hex string"],
    [/\b(sk|pk|rk)[-_](live|test)?[-_]?[A-Za-z0-9]{16,}/, "an API-key-like token"],
    [/-----BEGIN [A-Z ]*PRIVATE KEY-----/, "a private key block"],
    [/"(api[_-]?key|secret|private[_-]?key|mnemonic|seed[_-]?phrase|password|token)"\s*:/i, "a credential field"],
    [/https?:\/\/(?!github\.com\/AGIFutureFoundation)[^\s)"'`]+/, "a URL"],
    [/\bfetch\s*\(|XMLHttpRequest|WebSocket\s*\(/, "network code"],
  ];
  for (const rel of files) {
    const path = join(ROOT, rel);
    ok(existsSync(path), `${rel} missing`);
    const src = readFileSync(path, "utf8");
    for (const [re, what] of bad) ok(!re.test(src), `${rel} contains ${what}: ${(src.match(re) ?? [""])[0].slice(0, 40)}`);
  }
});

await check("the roadmap states that protocol details must be verified against current official docs", () => {
  const md = readFileSync(join(ROOT, "docs", "agent-roadmap.md"), "utf8");
  ok(/could not be reached from this build environment/i.test(md), "missing the unreachable-docs note");
  ok(/verified against the current official documentation/i.test(md), "missing the verify-before-integration note");
  ok(/## (\d+\. )?Milestones/.test(md), "missing milestones");
});

console.log(failures ? `\n${failures} check(s) failed.` : "\nAll agent checks pass.");
process.exit(failures ? 1 : 0);
