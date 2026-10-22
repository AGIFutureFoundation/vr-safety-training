/**
 * Checks the SmartCiti.X agent package for the Virtuals agent platform
 * (agents/smartcitix/, docs/virtuals/strategy.md, tools/smartcitix_provider.mjs):
 *
 *   - agent.json validates: draft, $Citi as a label only, every function owned
 *     by one worker, JSON-schema parameters, bindings to real exports, example
 *     stations in the skill registry;
 *   - every offering has acp-cli's offering fields (src/commands/offering.ts),
 *     a null price "set by the owner", and maps to a working stub handler and a
 *     real registry entry; the runtime tool manifest matches the offerings;
 *   - the stub's three dry runs (evaluation, dataset slice, curriculum query)
 *     produce deliverables, the lesson handler works, and a requirement with a
 *     field outside the schema is refused;
 *   - no key, secret, private key, seed phrase or wallet address, no URL
 *     outside the owner's GitHub and no network code anywhere in agents/,
 *     docs/virtuals/ or the stub; no price, supply or fee figure;
 *   - every acp-cli command named in the docs exists in acp-cli's README (the
 *     read-only clone when present, else the vendored list, which must match
 *     the README whenever the clone is present);
 *   - the strategy carries the unreachable-docs note, the verify marks,
 *     milestones and a risk register; the runbook puts legal review before
 *     tokenization; the homepage block and the Guide pick the strategy up.
 *
 *     node tools/check_virtuals.mjs       # or node tools/check_all.mjs
 */
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const PKG = join(ROOT, "agents", "smartcitix");
const ACP_CLI = process.env.ACP_CLI_DIR ?? "/home/user/agifuturefoundation/acp-cli";
let failures = 0, passes = 0;
async function check(name, fn) {
  try { await fn(); passes += 1; console.log(`  ✓ ${name}`); }
  catch (err) { failures += 1; console.log(`  ✗ ${name}\n      ${err.message ?? err}`); }
}
const ok = (v, what) => { if (!v) throw new Error(what); };
const readJson = (p) => JSON.parse(readFileSync(p, "utf8"));
const walk = (dir) => readdirSync(dir).flatMap((f) => { const p = join(dir, f); return statSync(p).isDirectory() ? walk(p) : [p]; });
const hasExport = (module, name) => {
  const path = join(ROOT, module);
  if (!existsSync(path)) return false;
  return new RegExp(`export\\s+(async\\s+)?(function|const|class|let)\\s+${name}\\b`).test(readFileSync(path, "utf8"));
};

console.log("SmartCiti.X agent package (agents/smartcitix/), provider stub and Virtuals strategy\n");

const agent = readJson(join(PKG, "agent.json"));
const reg = await import("../WebXR/shared/skill-registry.js");
const stationIds = new Set(reg.SK_STATIONS.map((s) => s.id));
const stub = await import("./smartcitix_provider.mjs");
const offeringFiles = readdirSync(join(PKG, "offerings")).filter((f) => f.endsWith(".json")).sort();
const offerings = Object.fromEntries(offeringFiles.map((f) => [f.replace(/\.json$/, ""), readJson(join(PKG, "offerings", f))]));

await check("agent.json is a draft named SmartCiti.X with $Citi as a label only, extending Foreman", () => {
  for (const f of ["name", "goal", "description", "constraints", "workers", "functions", "acp", "capabilities"]) ok(agent[f], `${f} missing`);
  ok(agent.status === "draft", "must stay draft until verified against the official docs");
  ok(agent.name === "SmartCiti.X", `name is ${agent.name}`);
  ok(agent.token?.symbol === "$Citi" && agent.token?.status === "label only", "token must be $Citi, status 'label only'");
  ok(Object.keys(agent.token).every((k) => ["symbol", "status", "note"].includes(k)), "the token block carries only symbol, status and note");
  ok(existsSync(join(ROOT, agent.extends?.agent ?? "-")), "extends must name agents/foreman/agent.json");
  ok(agent.acp.role === "provider", "acp.role must be provider");
});

await check("every function belongs to one worker, has JSON-schema parameters and binds to real exports and registry stations", () => {
  const names = new Set(agent.functions.map((f) => f.name));
  ok(names.size === agent.functions.length, "duplicate function name");
  const owner = new Map();
  for (const w of agent.workers) for (const fn of w.functions) {
    ok(names.has(fn), `worker ${w.id} names unknown function ${fn}`);
    ok(!owner.has(fn), `function ${fn} owned twice`);
    owner.set(fn, w.id);
  }
  for (const f of agent.functions) {
    ok(owner.has(f.name), `${f.name} belongs to no worker`);
    const p = f.parameters;
    ok(p?.type === "object" && p.properties, `${f.name}: parameters must be a type:object schema`);
    for (const r of p.required ?? []) ok(r in p.properties, `${f.name}: required ${r} not declared`);
    for (const b of [f.binding, ...(f.alsoUses ?? [])]) ok(hasExport(b.module, b.export), `${f.name}: ${b.module} has no export ${b.export}`);
    for (const s of f.exampleStations ?? []) ok(stationIds.has(s), `${f.name}: ${s} is not a registry station`);
    ok(offerings[f.offering], `${f.name}: offering ${f.offering} has no file`);
    ok(typeof stub.HANDLERS[f.handler] === "function", `${f.name}: stub has no handler ${f.handler}`);
  }
  for (const [cap, c] of Object.entries(agent.capabilities)) for (const e of c.exports) ok(hasExport(c.module, e), `capability ${cap}: ${c.module} has no export ${e}`);
  ok(agent.capabilities.passport?.onDeviceOnly === true, "the passport capability must be onDeviceOnly");
});

await check("every offering has acp-cli's offering fields, a null price set by the owner, and maps to a stub handler and a registry entry", () => {
  const FIELDS = ["name", "description", "priceType", "priceValue", "slaMinutes", "requirements", "deliverable", "requiredFunds", "isHidden", "subscriptionIds"];
  const listed = agent.acp.offerings.map((p) => p.replace(/^offerings\//, "").replace(/\.json$/, "")).sort();
  ok(JSON.stringify(listed) === JSON.stringify(Object.keys(offerings).sort()), `agent.acp.offerings ${listed} vs files ${Object.keys(offerings)}`);
  if (existsSync(join(ACP_CLI, "src", "commands", "offering.ts"))) {
    const src = readFileSync(join(ACP_CLI, "src", "commands", "offering.ts"), "utf8");
    for (const f of ["priceType", "priceValue", "slaMinutes", "requirements", "deliverable", "requiredFunds", "isHidden", "subscriptionIds"]) ok(src.includes(f), `acp-cli offering.ts has no ${f}`);
  }
  for (const [file, o] of Object.entries(offerings)) {
    for (const f of FIELDS) ok(f in o, `${file}: ${f} missing`);
    ok(o.name === file, `${file}: name ${o.name} should match the file name`);
    ok(o.priceType === null && o.priceValue === null, `${file}: price fields must be null`);
    ok(o.priceNote === "set by the owner", `${file}: priceNote must say "set by the owner"`);
    ok(Number.isInteger(o.slaMinutes) && o.slaMinutes >= 5, `${file}: slaMinutes must be an integer of at least 5 (acp-cli's minimum)`);
    ok(typeof o.requirements === "string" || o.requirements?.type === "object", `${file}: requirements must be a string or a JSON schema`);
    ok(typeof o.requiredFunds === "boolean" && typeof o.isHidden === "boolean" && Array.isArray(o.subscriptionIds), `${file}: requiredFunds/isHidden/subscriptionIds types`);
    ok(o.subscriptionIds.length === 0, `${file}: no subscription is attached in this package`);
    const x = o["x-smartcitix"];
    ok(typeof stub.HANDLERS[x?.handler] === "function", `${file}: handler ${x?.handler} is not a stub function`);
    ok(agent.functions.some((f) => f.name === x.function && f.offering === file), `${file}: function ${x.function} does not name this offering`);
    ok(hasExport(x.registry.module, x.registry.export), `${file}: ${x.registry.module} has no export ${x.registry.export}`);
    ok(reg.skStation(x.registry.exampleStation, x.registry.app), `${file}: ${x.registry.app}/${x.registry.exampleStation} is not a registry entry`);
    if (x.registry.exampleProgramme) ok(reg.skStationsForProgramme(x.registry.exampleProgramme).length > 0, `${file}: programme ${x.registry.exampleProgramme} has no stations`);
  }
});

await check("the runtime profile and tool manifest match the agent and its offerings; SKILL.md has front matter", () => {
  const tools = readJson(join(PKG, "hermes", "tools.json"));
  const profile = readJson(join(PKG, "hermes", "profile.json"));
  for (const d of [tools, profile]) ok(d.conventionsStatus === "to verify against the official docs", "hermes files must be marked to verify against the official docs");
  ok(JSON.stringify(tools.tools.map((t) => t.name).sort()) === JSON.stringify(agent.functions.map((f) => f.name).sort()), "tool names differ from agent functions");
  for (const t of tools.tools) {
    ok(t.run?.network === false && t.run.command.includes("tools/smartcitix_provider.mjs"), `${t.name}: must be a local stub command with network false`);
    ok(JSON.stringify(t.parameters) === JSON.stringify(offerings[t.offering]?.requirements), `${t.name}: parameters differ from offering ${t.offering}'s requirements`);
  }
  for (const s of profile.skills) if (s.path) ok(existsSync(join(ROOT, s.path)), `profile skill ${s.path} missing`);
  ok(existsSync(join(ROOT, profile.tools)), "profile.tools missing");
  const skill = readFileSync(join(PKG, "SKILL.md"), "utf8");
  const fm = skill.match(/^---\n([\s\S]*?)\n---\n/);
  ok(fm && /^name: smartcitix$/m.test(fm[1]) && /^description: /m.test(fm[1]), "SKILL.md needs front matter with name and description");
});

await check("the stub's three dry runs produce deliverables, locally", async () => {
  ok(stub.DRY_RUNS.length === 3, `expected three dry runs, have ${stub.DRY_RUNS.length}`);
  ok(JSON.stringify(stub.DRY_RUNS.map((e) => e.offering)) === JSON.stringify(["station-evaluation", "robot-skill-dataset", "curriculum-query"]), "dry runs must be evaluation, dataset slice, curriculum query");
  for (const e of stub.DRY_RUNS) ok(e.entry.contentType === "requirement" && typeof e.entry.content === "string" && e.chainId === null, `${e.jobId}: not an acp-cli-shaped requirement event`);
  const [ev, ds, cq] = await stub.dryRuns();
  for (const r of [ev, ds, cq]) ok(r.status === "deliverable-ready" && r.submitted === false && r.deliverableText.length > 20, `${r.jobId}: ${r.status} ${JSON.stringify(r.issues ?? "")}`);
  ok(ev.deliverable.summary.finished && typeof ev.deliverable.summary.stars === "number" && ev.deliverable.notice.includes("Not a certification"), "evaluation: no engine summary or no notice");
  ok(ds.deliverable.layouts.lerobot.valid && ds.deliverable.layouts.rlds.valid && ds.deliverable.layouts.lerobot.frames === ds.deliverable.layouts.rlds.steps, "dataset: layouts invalid or frames and steps disagree");
  ok(ds.deliverable.licence?.synthetic && ds.deliverable.consent, "dataset: licence or consent missing");
  ok(cq.deliverable.stations.length > 0, "curriculum: no stations");
});

await check("the lesson handler composes a lesson, and a requirement with a field outside the schema is refused", async () => {
  const r = await stub.handleJob(stub.jobEvent("check-lesson", "lesson-service", { prompt: "lockout refresher for apprentices" }));
  ok(r.status === "deliverable-ready" && r.deliverable.lesson.stations.length > 0, "lesson: no stations");
  const bad = await stub.handleJob(stub.jobEvent("check-bad", "curriculum-query", { programmeId: "confined-space", learnerName: "x" }));
  ok(bad.status === "rejected-locally" && bad.submitted === false, "a field outside the schema must be refused");
});

// Everything the no-secret and no-figure scans read.
const scanFiles = [...walk(PKG), ...walk(join(ROOT, "docs", "virtuals")), join(ROOT, "tools", "smartcitix_provider.mjs")];

await check("no key, secret, private key, seed phrase, wallet address, URL or network code in agents/, docs/virtuals/ or the stub", () => {
  const bad = [
    [/0x[0-9a-fA-F]{40}\b/, "an EVM address"],
    [/\b(0x)?[0-9a-fA-F]{64}\b/, "a 32-byte hex secret"],
    [/(?<![A-Za-z0-9_-])[1-9A-HJ-NP-Za-km-z]{32,44}(?![A-Za-z0-9_-])/, "a base58 address or key"],
    [/\b(sk|pk|rk)[-_](live|test)?[-_]?[A-Za-z0-9]{16,}/, "an API-key-like token"],
    [/-----BEGIN [A-Z ]*PRIVATE KEY-----/, "a private key block"],
    [/"(api[_-]?key|secret|private[_-]?key|mnemonic|seed[_-]?phrase|password|access[_-]?token|refresh[_-]?token|wallet[_-]?address)"\s*:/i, "a credential field"],
    [/^\s*(?:[a-z]{3,8}\s+){11,23}[a-z]{3,8}\s*$/m, "a seed-phrase-like word list"],
    [/https?:\/\/(?!github\.com\/AGIFutureFoundation)[^\s)"'`]+/, "a URL"],
    [/\bfetch\s*\(|XMLHttpRequest|WebSocket|["']node:(https?|net|dgram|tls)["']|\baxios\b/, "network code"],
  ];
  for (const path of scanFiles) {
    const src = readFileSync(path, "utf8");
    for (const [re, what] of bad) ok(!re.test(src), `${relative(ROOT, path)} contains ${what}: ${(src.match(re) ?? [""])[0].slice(0, 40)}`);
  }
});

await check("no price, supply, fee, valuation or return figure anywhere in the package or the strategy", () => {
  const bad = [
    [/\$\s?\d/, "a dollar figure"],
    [/\b\d[\d,.]*\s*(USDC|USDG|VIRTUAL|veVIRTUAL|ETH|SOL|USD|dollars?|tokens?)\b/i, "an amount"],
    [/\b\d[\d.]*\s?%/, "a percentage"],
    [/\b(price|priced|supply|fee|fees|valuation|market cap|FDV|APY|APR|yield|returns?)\b[^.\n]{0,24}?\d/i, "a figure next to an economic term"],
  ];
  for (const path of scanFiles.filter((p) => !p.endsWith(".mjs"))) {
    const src = readFileSync(path, "utf8");
    for (const [re, what] of bad) ok(!re.test(src), `${relative(ROOT, path)} contains ${what}: ${(src.match(re) ?? [""])[0].slice(0, 50)}`);
  }
  const keyScan = (v, where) => {
    if (v && typeof v === "object") for (const [k, x] of Object.entries(v)) {
      if (/price|fee|supply|valuation|prebuy|airdrop/i.test(k)) ok(x === null || typeof x === "string" || (typeof x === "object" && x !== null && !Array.isArray(x)), `${where}.${k} must not hold a figure`);
      keyScan(x, `${where}.${k}`);
    }
  };
  for (const path of scanFiles.filter((p) => p.endsWith(".json"))) keyScan(readJson(path), relative(ROOT, path));
});

// The acp-cli command paths named in a text, by the rule acp-commands.json was extracted with.
function commandsIn(md) {
  const set = new Set();
  let inCode = false;
  for (const line of md.split("\n")) {
    if (/^```/.test(line)) { inCode = !inCode; continue; }
    const src = inCode ? line.trim() : line;
    const re = /(?:^|`)acp((?: [a-z][a-z0-9-]*)+)/g;
    let m;
    while ((m = re.exec(src))) set.add("acp" + m[1]);
  }
  return set;
}

await check("every acp-cli command named in the docs exists in acp-cli's README", () => {
  const vendored = readJson(join(PKG, "acp-commands.json"));
  const readme = join(ACP_CLI, "README.md");
  let known = new Set(vendored.commands);
  if (existsSync(readme)) {
    const live = commandsIn(readFileSync(readme, "utf8"));
    const missing = vendored.commands.filter((c) => !live.has(c));
    ok(!missing.length, `acp-commands.json names commands the README no longer has: ${missing.join(", ")}`);
    known = live;
  }
  const docs = scanFiles.filter((p) => !p.endsWith("acp-commands.json") && !p.endsWith(".mjs"));
  let named = 0;
  for (const path of docs) for (const c of commandsIn(readFileSync(path, "utf8"))) {
    named += 1;
    ok(known.has(c), `${relative(ROOT, path)} names \`${c}\`, which acp-cli's README does not`);
  }
  ok(named >= 20, `expected the docs to name acp-cli's commands, found ${named}`);
});

await check("the strategy marks unverified details, has milestones and a risk register; the runbook puts legal review before tokenization", () => {
  const md = readFileSync(join(ROOT, "docs", "virtuals", "strategy.md"), "utf8");
  ok(/could not be reached from this build environment/i.test(md), "missing the unreachable-docs note");
  ok((md.match(/to verify against the official docs/g) ?? []).length >= 4, "too few 'to verify against the official docs' marks");
  ok(/## \d+\. Milestones/.test(md) && /\*\*V0\b/.test(md), "missing milestones");
  ok(/## \d+\. Risk register/.test(md), "missing the risk register");
  ok(/in preparation/i.test(md), "missing 'in preparation'");
  const rb = readFileSync(join(PKG, "runbook.md"), "utf8");
  const legal = rb.search(/legal review/i), tok = rb.indexOf("acp agent tokenize");
  ok(legal >= 0 && tok > legal, "the runbook must require legal review before `acp agent tokenize`");
});

await check("the homepage has the in-preparation block and the Guide's knowledge base picks up the strategy", () => {
  const gen = readFileSync(join(ROOT, "tools", "gen_home.mjs"), "utf8");
  ok(/SmartCiti\.X on the agent network/.test(gen) && /in preparation/i.test(gen) && gen.includes("virtuals/strategy.md"), "gen_home.mjs has no in-preparation SmartCiti.X block linking the strategy");
  const kb = readFileSync(join(ROOT, "WebXR", "shared", "guide-kb.js"), "utf8");
  ok(kb.includes("docs/virtuals/strategy.md"), "guide-kb.js has no chunk from docs/virtuals/strategy.md");
  ok(existsSync(join(ROOT, "docs", "consoles", "VIRTUALS.md")), "docs/consoles/VIRTUALS.md missing");
});

console.log(failures ? `\n${failures} check(s) failed.` : `\nAll ${passes} SmartCiti.X checks pass.`);
process.exit(failures ? 1 : 0);
