#!/usr/bin/env node
/**
 * ASSAYER's review rubric for the Crescent worlds (tools/briefs/bayou-brief.md,
 * docs/consoles/ASSAYER.md): each parish, the Motor Pool, the characters, the
 * play layer, billing and the deploy plan scored 0–100 on six criteria —
 *
 *   loads       20  the page at 1280×720 and 360×640 with no page error
 *   legible     15  the first screen says where you are and what you can do
 *   resolves    20  every board, kiosk, chip, hand-off and gate id resolves
 *   completable 15  a lesson, drive, dialogue, quote or plan runs headless to its end
 *   budget      15  meshes and triangles inside the subject's own budget
 *   facts       15  no figure in a name or lesson text, no history or statistics in place text
 *
 * A criterion scores weight × (checks passed ÷ checks run). Every failed check
 * is a finding with an owning console (the Crescent console that built it and
 * the Bayou-run console that fixes it). The worst findings are those that cost
 * the most points.
 *
 *     node tools/eval_worlds.mjs                 # full pass, browser included (port 8990)
 *     node tools/eval_worlds.mjs --no-browser    # headless modules only; "loads" is not scored
 *     node tools/eval_worlds.mjs --json <file>   # also write the scores and findings as JSON
 *     node tools/eval_worlds.mjs --md <file>     # also write the review table (docs/evals/crescent-review.md's body)
 *
 * Exits 0 always (an eval, not a gate); prints one line per subject and the ten worst findings.
 */
import { createServer } from "node:http";
import { existsSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { dirname, extname, join, normalize } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const WEBXR = join(ROOT, "WebXR");
const argv = process.argv.slice(2);
const AS_BROWSER = !argv.includes("--no-browser");
const argOf = (k) => { const i = argv.indexOf(k); return i >= 0 ? argv[i + 1] : null; };
const AS_PORT = Number(process.env.AS_PORT ?? 8990);
const imp = (p) => import(pathToFileURL(join(WEBXR, p)).href);

export const AS_WEIGHTS = { loads: 20, legible: 15, resolves: 20, completable: 15, budget: 15, facts: 15 };
// Words that describe a place with history or statistics — the Facts rule names places, it does not describe them.
export const AS_FACT_WORDS = /\b(population|founded|built in|opened in|census|since \d|est\.|circa|largest|oldest|tallest|busiest|record)\b/i;
const asDigits = (s) => /\d/.test(String(s ?? "").replace(/\b\d+(st|nd|rd|th)\b/g, "").replace(/K-12/gi, ""));

/** One subject's ledger: checks by criterion, findings with owners. */
function asSubject(id, name, owner) {
  const crit = Object.fromEntries(Object.keys(AS_WEIGHTS).map((k) => [k, { pass: 0, fail: 0, findings: [] }]));
  return {
    id, name, owner, crit,
    check(k, ok, msg, who = owner) { const c = crit[k]; if (ok) c.pass++; else { c.fail++; c.findings.push({ msg, owner: who }); } return ok; },
    score() {
      let s = 0, max = 0;
      for (const [k, w] of Object.entries(AS_WEIGHTS)) { const c = crit[k]; const n = c.pass + c.fail; if (!n) continue; max += w; s += w * (c.pass / n); }
      return max ? Math.round((s / max) * 100) : 0;
    },
  };
}

// ------------------------------------------------------------------ headless modules
const G = await imp("shared/np-geo.js");
const E = await imp("shared/np-parish.js");
const R = await imp("shared/np-parishes.js");
const W = await imp("shared/np-world.js");
const S = await imp("parishes/js/state.js");
const THREE = await imp("vendor/three/dist/three.module.min.js");
const DV = await imp("shared/drivables-data.js");
const NPC = await imp("shared/npc.js");
const SL = await imp("shared/sl-parish-play.js");
const PM = await imp("shared/payments.js");
const PA = await imp("shared/pm-agent.js");
const PMM = await imp("shared/pm-membership.js");
const catalog = JSON.parse(readFileSync(join(WEBXR, "smartcity", "catalog.json"), "utf8"));
const unions = new Set(JSON.parse(readFileSync(join(ROOT, "tools", "unions.json"), "utf8")).unions.map((u) => u.id));
const stations = new Set(catalog.stations.map((s) => s.id));
const ctx = { stations, k12: new Set([...stations].filter((id) => id.startsWith("k12-"))), programmes: new Set(catalog.curricula.map((c) => c.id)), unions };
const appSrc = readFileSync(join(WEBXR, "parishes", "js", "app.js"), "utf8");
const strictSet = (() => { const m = readFileSync(join(ROOT, "tools", "check_parishes.mjs"), "utf8").match(/NP_ENGINE_STRICT = new Set\(\[([^\]]*)\]\)/); return new Set((m?.[1] ?? "").match(/[a-z-]+/g) ?? []); })();

const subjects = [];
const PARISH_OWNER = { orleans: "PARISH → ASSAYER", jefferson: "DELTA → ASSAYER", "st-bernard": "DELTA → ASSAYER", plaquemines: "DELTA → ASSAYER", "st-tammany": "DELTA → ASSAYER" };

// ---- parishes
for (const p of R.NP_PARISHES) {
  const sj = asSubject(`parish:${p.id}`, p.name, PARISH_OWNER[p.id] ?? "DELTA → ASSAYER");
  subjects.push(sj);
  sj.page = `parishes/parishes.html?parish=${p.id}`;
  sj.first = { where: "#menu-parish", what: "#menu-start", expect: p.name };
  // legible (headless half): a name, a blurb, a start site, and the app's HUD names where you are
  sj.check("legible", typeof p.name === "string" && p.name.length > 3, `${p.id}: the parish has a name`);
  sj.check("legible", !!E.npStartSite(p), `${p.id}: a start site exists`);
  sj.check("legible", typeof p.blurb === "string" && p.blurb.length > 20, `${p.id}: a menu blurb says what the parish offers`);
  // resolves
  const bad = E.npValidate(p, ctx);
  sj.check("resolves", bad.length === 0, `${p.id}: validates on the schema (${bad.length} problem${bad.length === 1 ? "" : "s"}: ${bad.slice(0, 3).join("; ")})`);
  for (const s of p.sites) {
    sj.check("resolves", s.stations.every((id) => stations.has(id)), `${p.id}/${s.id}: every board station resolves`);
    sj.check("resolves", s.trades.every((id) => unions.has(id)), `${p.id}/${s.id}: every union chip resolves`);
    const games = SL.slGamesFor(p.id, s.id);
    sj.check("resolves", games.every((g) => [...(g.gate?.stations ?? []), ...(g.gate?.k12 ?? [])].every((id) => stations.has(id))), `${p.id}/${s.id}: every side-game gate resolves`, "SECONDLINE → KREWE");
  }
  const slp = SL.slParish(p.id);
  if (slp) for (const s of slp.sites) sj.check("resolves", !!SL.slResolveSite(p, s.id), `${p.id}: the play layer's site ${s.id} resolves to a site on the map`, "SECONDLINE → KREWE");
  for (const c of R.npResolveConnectors(p)) sj.check("resolves", !!R.npParish(c.to.parish) ? G.npInField(R.npParish(c.to.parish), c.to.position) : true, `${p.id}/${c.id}: the connector lands inside ${c.to.parish}`);
  // the engine geometry held strict (roads dry, landmarks on land, beds under the line, scale declared)
  for (const r of p.roads) sj.check("resolves", E.npRoadWet(p, r).length === 0, `${p.id}/${r.id}: the road stays out of the river and lake`);
  for (const l of p.landmarks) { const w = E.npWaterAt(p, ...l.position); sj.check("resolves", !w || w.kind === "wetland" || /shore|point|bayou|canal|lock|riverfront/.test(l.kind), `${p.id}/${l.id}: the landmark stands on land or a shore`); }
  sj.check("resolves", strictSet.has(p.id), `${p.id}: held strict by check_parishes (NP_ENGINE_STRICT)`);
  const sc = G.npScale(p);
  const declared = Number.isFinite(p.scale) ? p.scale : null;
  sj.check("resolves", declared ? Math.abs(sc.x / declared - 1) < 0.15 && Math.abs(sc.z / declared - 1) < 0.15 : sc.x > 0.5 && sc.x < 6 && sc.z > 0.5 && sc.z < 6, `${p.id}: the stylised scale (${sc.x.toFixed(1)} m per metre) is inside the rule or declared as a recorded scale`);
  // completable: a field lesson passes on the ledger, a visit is recorded
  const st = S.npBlank();
  const l = (p.fieldLessons ?? [])[0];
  sj.check("completable", !!l, `${p.id}: has a field lesson to complete`, "SECONDLINE → BAYOU");
  if (l) sj.check("completable", S.npAnswerLesson(st, l, l.check.answer).ok && st.lessons.includes(l.id), `${p.id}: the lesson ${l.id} completes headless`);
  const sl = SL.slLessonsFor(p.id);
  sj.check("completable", sl.length >= 3, `${p.id}: the play layer offers three or more field lessons (${sl.length})`, "SECONDLINE → BAYOU");
  sj.check("completable", S.npVisit(st, p.id, p.sites[0].id), `${p.id}: a site visit is recorded`);
  // budget: the triangle estimate and one real build at the start site and the densest site
  for (const tier of ["low", "high"]) sj.check("budget", E.npTriangleEstimate(p, tier) <= E.NP_BUDGET.triangles, `${p.id}/${tier}: the worst-case triangle estimate fits`);
  {
    const root = new THREE.Group();
    const start = E.npStartSite(p);
    const world = W.npBuildParish(root, THREE, p, { tier: "low", start: start.position });
    let worstM = 0, worstT = 0;
    for (const s of p.sites) { world.update(s.position[0], s.position[1], 999); const x = world.stats(); worstM = Math.max(worstM, x.meshes); worstT = Math.max(worstT, x.triangles); }
    sj.check("budget", worstM <= E.NP_BUDGET.drawCalls, `${p.id}: meshes at every site within ${E.NP_BUDGET.drawCalls} (worst ${worstM})`);
    sj.check("budget", worstT <= E.NP_BUDGET.triangles, `${p.id}: triangles at every site within ${E.NP_BUDGET.triangles} (worst ${worstT})`);
    sj.stats = { meshes: worstM, triangles: worstT };
  }
  // facts: no figure in names or lesson text, no history words anywhere in the module
  const src = readFileSync(join(WEBXR, "shared", `np-data-${p.id}.js`), "utf8");
  sj.check("facts", !AS_FACT_WORDS.test(src.replace(/"(xz|lonlat|pts|poly|position)"[\s\S]*?\]/g, "")), `${p.id}: no history or statistics words in the module (${(src.match(AS_FACT_WORDS) ?? [""])[0]})`);
  for (const x of [...p.sites, ...p.landmarks, ...p.districts]) sj.check("facts", !asDigits(`${x.name} ${x.blurb ?? ""}`), `${p.id}/${x.id}: no figure in the name or blurb ("${x.name}")`);
  for (const x of p.fieldLessons ?? []) sj.check("facts", !asDigits([x.title, x.tradeLine, ...(x.steps ?? []), x.check?.q, ...(x.check?.options ?? []), x.check?.why].join(" ")), `${p.id}/${x.id}: no figure in the lesson text`);
  for (const g of p.gated ?? []) sj.check("facts", !asDigits(`${g.title} ${g.summary ?? ""}`), `${p.id}/${g.id}: no figure in the gated item's title`);
}

// ---- Motor Pool
{
  const sj = asSubject("motorpool", "Motor Pool", "MOTORPOOL → ASSAYER");
  subjects.push(sj);
  sj.page = "bayworld/index.html"; sj.first = { where: "h1.logo", what: "#menu-start", expect: "Bay World" };
  const boardSrc = readFileSync(join(WEBXR, "shared", "drivables-board.js"), "utf8");
  sj.check("legible", /Qualify at|Pre-trip|pre-trip/i.test(boardSrc), "the board says what to do before a drive (pre-trip, qualify)");
  sj.check("legible", /hud-motorpool-btn/.test(readFileSync(join(WEBXR, "bayworld", "index.html"), "utf8")), "Bay World's HUD has a Motor Pool button");
  sj.check("legible", /dvMountMotorPool\(/.test(appSrc), "the parishes app mounts the Motor Pool board (MOTORPOOL's next brief, item 2)", "MOTORPOOL → ASSAYER");
  for (const d of DV.DV_DRIVABLES) {
    const g = DV.DV_GATED.find((x) => x.id?.endsWith(d.id) || x.drivable === d.id);
    const ids = [...(d.gate?.stations ?? []), ...(g?.gate?.stations ?? [])];
    sj.check("resolves", ids.length > 0 && ids.every((id) => stations.has(id)), `${d.id}: its gate names stations that resolve`);
    sj.check("resolves", (d.trades ?? []).every((id) => unions.has(id)) && ((d.trades ?? []).length || d.tradeNote), `${d.id}: its trade chips resolve`);
    const run = DV.dvScriptedRun(d);
    sj.check("completable", run && Number.isFinite(run.maxSpeed ?? run.trace?.at(-1)?.x ?? 0) && (run.collisions ?? 0) === 0, `${d.id}: a 20 s drive or helm run completes clean`);
  }
  const budgetSrc = readFileSync(join(WEBXR, "shared", "drivables.js"), "utf8");
  const meshes = [...budgetSrc.matchAll(/^\s{2}dv[A-Za-z]+: \{ build: "[^"]+",[^\n]*?\bmeshes: (\d+)/gm)].map((m) => Number(m[1]));
  sj.check("budget", meshes.length === (budgetSrc.match(/^\s{2}dv[A-Za-z]+: \{ build:/gm) ?? []).length && meshes.length >= 30, `every DV_BUDGET row states its meshes (${meshes.length})`);
  sj.check("budget", meshes.every((m) => m <= 45), `every new builder is within 45 meshes (worst ${Math.max(...meshes)})`);
  for (const d of DV.DV_DRIVABLES) sj.check("facts", !asDigits(d.name) || /\b(CDL|4x4|6x6)\b/.test(d.name), `${d.id}: no figure in the name ("${d.name}")`);
  const hullNames = budgetSrc.match(/"(GULF STAR|BAYOU PEARL|MISS DELTA)"/g) ?? [];
  sj.check("facts", hullNames.length === 0, `the fishing hulls carry fictional boat names (${[...new Set(hullNames)].join(", ")}) — decide named or generic (MOTORPOOL next brief, item 7)`, "MOTORPOOL → next run");
}

// ---- Characters
{
  const sj = asSubject("characters", "Characters (GRIOT)", "GRIOT → ASSAYER");
  subjects.push(sj);
  sj.page = "summit/index.html"; sj.first = { where: "h1.logo", what: "#menu-start", expect: "Sierra Summit" };
  const all = NPC.grCharacters();
  sj.check("legible", all.every((c) => c.name && c.role), "every character carries a name and a role");
  sj.check("legible", /grMount\(`parish:|grMount\("parish:/.test(appSrc), "the parishes app mounts the parish characters (GRIOT's next brief, item 2)", "GRIOT → ASSAYER");
  sj.check("legible", NPC.GR_KEY === "g" || NPC.GR_KEY === "G" || typeof NPC.GR_KEY === "string", "a talk key is defined");
  for (const c of all) {
    for (const h of c.handoffs ?? []) {
      const r = NPC.grResolveHandoff(h, { from: c.world, page: `${c.world}.html` });
      sj.check("resolves", !!r && (!!r.href || !!r.action || !!r.text), `${c.id}: the ${h.kind} hand-off ${h.id} resolves`);
      if (h.kind === "station") sj.check("resolves", stations.has(h.id), `${c.id}: station ${h.id} is in the catalog`);
    }
    const d = NPC.grDialogue(c, { seed: 1 });
    sj.check("completable", !!d && !!d.greet && !!d.teach, `${c.id}: a dialogue runs greet → teach → hand off`);
    sj.check("facts", !asDigits(c.name) && !asDigits(d?.greet?.text ?? d?.greet ?? ""), `${c.id}: no figure in the name or greeting`);
  }
  const parishChars = all.filter((c) => /parish/.test(c.world ?? ""));
  sj.check("completable", parishChars.length >= 5, `characters for the parishes exist (${parishChars.length})`);
  sj.check("completable", all.filter((c) => c.world === "bayworld").some((c) => (c.handoffs ?? []).some((h) => h.kind === "quest")), "a Bay World character hands off a quest (GRIOT's next brief, item 1)", "GRIOT → next run");
  for (const w of ["bayworld", "summit", "redwood", ...new Set(parishChars.map((c) => c.world))]) sj.check("budget", NPC.grMeshBudget(w) <= 12 * 12, `${w}: the characters' meshes stay within 144 (${NPC.grMeshBudget(w)})`);
}

// ---- Play layer
const asSnap = (await imp("shared/skill-gates.js")).qmSnapshot({ getItem: () => null, setItem() {} });
{
  const sj = asSubject("play", "Play layer (SECONDLINE)", "SECONDLINE → KREWE");
  subjects.push(sj);
  sj.page = "parishes/parishes.html?parish=orleans"; sj.first = { where: "#menu-parish", what: "#menu-start", expect: "Orleans Parish" };
  sj.check("legible", SL.SL_PATHS.length >= 1 && /slMountPathBoard/.test(appSrc), "the path board is on the parish menu");
  sj.check("legible", SL.SL_MAIN_QUESTS.length >= 1, "a main quest arc exists");
  for (const h of SL.SL_HANDOFFS) {
    if (h.kind === "treasure") continue;
    const t = SL.slHandoffTarget(h, { snap: asSnap });
    sj.check("resolves", !!t && (!!t.href || !!t.id), `${h.id}: the ${h.kind} hand-off resolves`);
  }
  for (const g of SL.SL_SIDE_GAMES) sj.check("resolves", [...(g.gate?.stations ?? []), ...(g.gate?.k12 ?? [])].every((id) => stations.has(id)), `${g.id}: the game's gate resolves`);
  for (const l of SL.SL_FIELD_LESSONS) {
    sj.check("resolves", ctx.k12.has(l.k12) && stations.has(l.station), `${l.id}: its K-12 and trade stations resolve`);
    sj.check("completable", Array.isArray(l.check?.options) && Number.isInteger(l.check?.answer) && l.check.answer < l.check.options.length, `${l.id}: the lesson has an answerable check`);
    sj.check("facts", !asDigits([l.title, l.tradeLine, ...(l.steps ?? []), l.check?.q, ...(l.check?.options ?? []), l.check?.why].join(" ")), `${l.id}: no figure in the lesson text`);
  }
  for (const g of SL.SL_SIDE_GAMES) sj.check("completable", !!SL.slRewardForTier?.(g, "gold") || !!g.reward, `${g.id}: the game names its reward`);
  const cyc = SL.slFindCycle?.();
  sj.check("completable", !cyc || !cyc.length, "the main-quest arc has no cycle");
  sj.check("budget", readFileSync(join(WEBXR, "shared", "sl-parish-play.js"), "utf8").length < 150_000, "the play module stays under 150 KB");
}

// ---- Billing
{
  const sj = asSubject("billing", "Billing & membership (TILL)", "TILL → ASSAYER");
  subjects.push(sj);
  sj.page = "instructor/index.html"; sj.first = { where: "h1", what: "#tab-billing", expect: "Instructor" };
  const cfg = JSON.parse(readFileSync(join(WEBXR, "auth-config.json"), "utf8"));
  const pay = cfg.payments ?? cfg.billing ?? {};
  sj.check("legible", existsSync(join(WEBXR, "instructor", "js", "billing.js")), "the instructor console has a Billing tab");
  const memSrc = readFileSync(join(WEBXR, "shared", "pm-membership.js"), "utf8");
  sj.check("legible", existsSync(join(WEBXR, "membership.html")) && /membership\.html|gtMembershipHref/.test(readFileSync(join(WEBXR, "shared", "account.js"), "utf8")), "an Upgrade view (membership.html) is linked from the account chip (TILL next brief, item 8)", "TILL → next run");
  const ad = PM.pmCreateAdapter(pay, { fetchImpl: () => { throw new Error("no network in an eval"); } });
  sj.check("completable", !!ad, "the payments adapter builds from the deployment's configuration");
  const plans = pay.plans ?? [];
  const q = plans[0] ? PM.pmQuote(pay, plans[0].id, 5) : null;
  sj.check("completable", plans.length === 0 || !!q, `a quote for five seats completes (${plans.length} plan${plans.length === 1 ? "" : "s"} configured)`);
  const st = PA.pmAgentEmpty();
  let ok = true;
  try { PA.pmAgentStep(st, {}, [], {}); } catch { ok = false; }
  sj.check("completable", ok, "the budget agent steps an empty event list without throwing");
  sj.check("resolves", Array.isArray(PMM.pmLevels(pay)) , "membership levels read from the configuration (null until a deployment sets them)");
  sj.check("resolves", "levels" in pay || "levels" in (cfg.membership ?? {}), "auth-config.json carries the null levels / applePay / googlePay / wallet keys (TILL was blocked writing them)", "TILL → owner");
  sj.check("budget", readFileSync(join(WEBXR, "shared", "payments.js"), "utf8").length < 60_000, "payments.js stays under 60 KB");
  const src = readFileSync(join(WEBXR, "shared", "payments.js"), "utf8") + memSrc;
  sj.check("facts", !/merchant\.[a-z]+\.[a-z]+|pass\.[a-z]+\.[a-z]+\.[a-z]+/.test(src.replace(/\/\/.*$/gm, "")), "no merchant or pass-type identifier is invented in code");
  sj.check("facts", !/\$\s?\d|\d+\s?USD|price:\s*\d/.test(src.replace(/\/\/.*$/gm, "").replace(/\/\*[\s\S]*?\*\//g, "")), "no price is typed into code (prices come from configuration)");
}

// ---- Deploy plan
{
  const sj = asSubject("deploy", "Deploy plan (EDGE)", "EDGE → ASSAYER");
  subjects.push(sj);
  let DA = null;
  try { DA = await import(pathToFileURL(join(ROOT, "tools", "deploy_agent.mjs")).href); } catch (e) { sj.check("loads", false, `deploy_agent.mjs imports (${e.message})`); }
  if (DA) {
    sj.check("loads", true, "deploy_agent.mjs imports");
    const plan = DA.cfPlan(DA.cfParseArgs([]));
    const text = DA.cfPlanText(plan, {});
    sj.check("legible", DA.CF_STEPS.length >= 5 && DA.CF_STEPS.every((s) => (typeof s === "string" ? s : s.id ?? s.name)), `the plan names its steps (${DA.CF_STEPS.length})`);
    sj.check("legible", /dry/i.test(text) || !DA.cfHaveCredentials({}), "the dry run says nothing runs without credentials");
    sj.check("completable", typeof text === "string" && text.length > 200, "the dry-run plan prints end to end");
    sj.check("completable", !DA.cfHaveCredentials({}), "no credentials means no apply");
    sj.check("facts", !/[A-Za-z0-9]{32,}/.test(text.replace(/https?:\/\/\S+/g, "")), "no credential-shaped string in the plan");
  }
  for (const f of ["wrangler.toml", "workers/edge/router.mjs", "WebXR/dist/_headers", "WebXR/dist/_redirects", "WebXR/dist/_routes.json"]) sj.check("resolves", existsSync(join(ROOT, f)), `${f} exists`);
  const toml = existsSync(join(ROOT, "wrangler.toml")) ? readFileSync(join(ROOT, "wrangler.toml"), "utf8") : "";
  sj.check("resolves", /pages_build_output_dir\s*=\s*"WebXR\/dist"/.test(toml), "Pages serves WebXR/dist");
  sj.check("facts", !/id\s*=\s*"[0-9a-f]{32}"/.test(toml), "no real KV id is committed (placeholder only)");
  const routes = existsSync(join(WEBXR, "dist", "_routes.json")) ? JSON.parse(readFileSync(join(WEBXR, "dist", "_routes.json"), "utf8")) : {};
  sj.check("budget", (routes.include ?? []).length <= 100, "the functions routes stay inside Cloudflare's 100-rule limit");
  const headers = existsSync(join(WEBXR, "dist", "_headers")) ? readFileSync(join(WEBXR, "dist", "_headers"), "utf8") : "";
  sj.check("budget", headers.split(/\n(?=\/)/).length <= 100, "the _headers rules stay inside the 100-rule limit");
  sj.check("resolves", /Content-Security-Policy/.test(headers), "a CSP is served");
}

// ------------------------------------------------------------------ browser pass
if (AS_BROWSER) {
  const PW = process.env.PLAYWRIGHT_MODULE || "/opt/node22/lib/node_modules/playwright/index.mjs";
  const EXE = process.env.CHROMIUM_PATH || "/opt/pw-browsers/chromium";
  const THREE_SRC = readFileSync(join(WEBXR, "vendor/three/dist/three.module.min.js"), "utf8");
  const TYPES = { ".html": "text/html", ".js": "application/javascript", ".mjs": "application/javascript", ".json": "application/json", ".css": "text/css", ".png": "image/png", ".jpg": "image/jpeg", ".svg": "image/svg+xml", ".glb": "model/gltf-binary", ".webmanifest": "application/json" };
  const server = createServer((req, res) => {
    const path = normalize(decodeURIComponent(new URL(req.url, "http://x").pathname)).replace(/^([/\\])+/, "");
    const file = join(WEBXR, path);
    if (!file.startsWith(WEBXR) || !existsSync(file) || statSync(file).isDirectory()) { res.writeHead(404); res.end(); return; }
    res.writeHead(200, { "content-type": TYPES[extname(file)] ?? "application/octet-stream" });
    res.end(readFileSync(file));
  });
  let browser = null;
  try {
    await new Promise((r, j) => { server.once("error", j); server.listen(AS_PORT, "127.0.0.1", r); });
    const { chromium } = await import(PW);
    browser = await chromium.launch({ executablePath: EXE, args: ["--use-gl=swiftshader", "--enable-unsafe-swiftshader", "--no-sandbox"] });
  } catch (e) { console.log(`  · browser pass skipped: ${String(e.message).split("\n")[0]}`); }
  if (browser) {
    for (const sj of subjects.filter((x) => x.page)) {
      for (const vp of [{ width: 1280, height: 720 }, { width: 360, height: 640 }]) {
        const context = await browser.newContext({ viewport: vp, hasTouch: vp.width < 500, isMobile: vp.width < 500 });
        await context.route(/^https?:\/\/(?!127\.0\.0\.1)/, (r) => r.abort());
        await context.route("**/cdnjs.cloudflare.com/ajax/libs/three.js/**", (r) => r.fulfill({ status: 200, contentType: "application/javascript", body: THREE_SRC }));
        await context.route(/fonts\.(googleapis|gstatic)\.com/, (r) => r.fulfill({ status: 200, contentType: "text/css", body: "" }));
        const page = await context.newPage();
        const errors = [];
        page.on("pageerror", (e) => errors.push(String(e.message).split("\n")[0]));
        const tag = `${sj.id} ${vp.width}×${vp.height}`;
        try {
          await page.goto(`http://127.0.0.1:${AS_PORT}/${sj.page}`, { waitUntil: "load", timeout: 45000 });
          await page.waitForTimeout(2500);
          const first = await page.evaluate(({ where, what }) => {
            const vis = (el) => !!el && !el.closest("[hidden]") && el.getBoundingClientRect().width > 0;
            const w = document.querySelector(where), a = document.querySelector(what);
            return { where: w?.textContent?.trim() ?? "", whereVis: vis(w), whatVis: vis(a), overflow: document.documentElement.scrollWidth > innerWidth + 1, title: document.title };
          }, sj.first);
          sj.check("legible", first.whereVis && first.where.includes(sj.first.expect), `${tag}: the first screen names where you are ("${first.where.slice(0, 40)}")`);
          sj.check("legible", first.whatVis, `${tag}: the first screen shows what you can do (${sj.first.what})`);
          sj.check("legible", !first.overflow, `${tag}: no sideways scroll`);
          // In a parish: walk up to a character and press G (the talk panel opens with a line), then open the Motor Pool
          // board (every drivable listed) — the two mounts ASSAYER added, driven in the page itself.
          // The frame budget as the page draws it: renderer.info after the walk begins at the start site, on the phone
          // viewport (the low tier), held to the engine's mesh and triangle budget (draw calls include sky and wildlife).
          if (sj.id.startsWith("parish:") && vp.width === 360) {
            const info = await page.evaluate(async () => {
              const T = window.__parishTest; if (!T) return null;
              T.begin(); await new Promise((r) => setTimeout(r, 1200));
              const i = T.npRenderer.info.render; return { calls: i.calls, triangles: i.triangles, tier: document.documentElement.dataset.tier ?? null };
            });
            sj.check("budget", !!info && info.calls <= E.NP_BUDGET.drawCalls + 40, `${tag}: draw calls in a frame at the start ${info?.calls} within the ${E.NP_BUDGET.drawCalls}-mesh budget plus sky and wildlife`);
            sj.check("budget", !!info && info.triangles <= E.NP_BUDGET.triangles, `${tag}: triangles in a frame ${info?.triangles} within ${E.NP_BUDGET.triangles}`);
            sj.frame = info;
          }
          if (sj.id.startsWith("parish:") && vp.width === 1280) {
            const r = await page.evaluate(async () => {
              const T = window.__parishTest; if (!T?.npc) return { err: "no npc on the test handle" };
              T.begin();
              const e = T.npc.characters[0];
              if (!e) return { chars: 0 };
              T.teleport(e.figure.position.x + 1, e.figure.position.z + 1);
              await new Promise((r) => setTimeout(r, 300));
              T.teleport(e.figure.position.x + 0.5, e.figure.position.z + 0.5);
              dispatchEvent(new KeyboardEvent("keydown", { code: "KeyG", key: "g", bubbles: true }));
              await new Promise((r) => setTimeout(r, 200));
              const panel = document.getElementById("gr-panel");
              const talk = !!panel && !panel.hidden && (panel.querySelector(".gr-log")?.textContent.length ?? 0) > 20;
              document.getElementById("gr-close")?.click();
              T.motorPool?.();
              const rows = document.querySelectorAll("#dv-board [data-dv-id]").length;
              const modal = T.np.modal;
              document.querySelector("#motorpool [data-close]")?.click();
              // A field lesson completed in the page: stand at its sign, E opens it, the right answer passes it.
              let lesson = null;
              const sign = T.world.lessonSigns[0];
              if (sign) {
                T.teleport(sign.x, sign.z);
                // The page looks for what is near every half second of frame time (dt is capped per frame), and a
                // SwiftShader frame is slow — wait for the sign to be the thing near, up to ten seconds.
                for (let i = 0; i < 100 && T.np.near?.lesson !== sign.lesson; i++) await new Promise((r) => setTimeout(r, 100));
                dispatchEvent(new KeyboardEvent("keydown", { code: "KeyE", key: "e", bubbles: true }));
                dispatchEvent(new KeyboardEvent("keyup", { code: "KeyE", key: "e", bubbles: true }));
                await new Promise((r) => setTimeout(r, 100));
                const opened = !document.getElementById("lesson").hidden;
                document.querySelectorAll("#lesson-choices button")[sign.lesson.check.answer]?.click();
                lesson = { opened, passed: T.np.state.lessons.includes(sign.lesson.id) };
              }
              return { chars: T.npc.characters.length, talk, rows, modal, lesson };
            });
            sj.check("completable", !!r.lesson?.opened && !!r.lesson?.passed, `${sj.id}: a field lesson opens at its sign with E and the right answer passes it in the page (${JSON.stringify(r.lesson)})`, "PARISH → ASSAYER");
            sj.check("resolves", (r.chars ?? 0) >= 3, `${sj.id}: three or more characters stand at the parish's sites (${r.chars ?? r.err})`, "GRIOT → ASSAYER");
            sj.check("resolves", !!r.talk, `${sj.id}: G beside a character opens the talk panel with a line`, "GRIOT → ASSAYER");
            sj.check("resolves", r.rows === DV.DV_DRIVABLES.length && r.modal === "motorpool", `${sj.id}: the Motor Pool board opens with every drivable (${r.rows} rows)`, "MOTORPOOL → ASSAYER");
          }
        } catch (e) { errors.push(`navigation: ${String(e.message).split("\n")[0]}`); }
        sj.check("loads", errors.length === 0, `${tag}: loads without a page error (${errors.slice(0, 2).join(" | ")})`);
        await context.close();
      }
    }
    await browser.close();
  }
  server.close();
}

// ------------------------------------------------------------------ report
const rows = subjects.map((s) => ({ id: s.id, name: s.name, owner: s.owner, score: s.score(), frame: s.frame ?? null, headless: s.stats ?? null, crit: Object.fromEntries(Object.entries(s.crit).map(([k, c]) => [k, c.pass + c.fail ? `${c.pass}/${c.pass + c.fail}` : "—"])) }));
// A finding's cost: the points its criterion lost in its subject, shared across that criterion's failures.
const findings = subjects.flatMap((s) => Object.entries(s.crit).flatMap(([k, c]) => {
  const n = c.pass + c.fail;
  return c.findings.map((f) => ({ subject: s.id, criterion: k, msg: f.msg, owner: f.owner, cost: n ? AS_WEIGHTS[k] / n : 0 }));
}));
// Group repeated findings of one kind in one subject (e.g. many roads) so the worst list names distinct problems.
const groups = new Map();
for (const f of findings) {
  const key = `${f.subject}|${f.criterion}|${f.msg.replace(/^[^:]*: /, "").replace(/\(.*\)$/, "").replace(/"[^"]*"/g, "").trim()}`;
  const g = groups.get(key) ?? { ...f, count: 0, cost: 0, examples: [] };
  g.count++; g.cost += f.cost; if (g.examples.length < 3) g.examples.push(f.msg);
  groups.set(key, g);
}
const worst = [...groups.values()].sort((a, b) => b.cost - a.cost).slice(0, 10);
const mean = Math.round(rows.reduce((s, r) => s + r.score, 0) / rows.length);
for (const r of rows) console.log(`  ${String(r.score).padStart(3)}  ${r.name.padEnd(30)} ${Object.entries(r.crit).map(([k, v]) => `${k} ${v}`).join("  ")}`);
console.log("  worst findings:");
worst.forEach((g, i) => console.log(`  ${i + 1}. [${g.subject} · ${g.criterion} · −${g.cost.toFixed(1)}] ${g.examples[0]}${g.count > 1 ? ` (+${g.count - 1} like it)` : ""} — ${g.owner}`));
console.log(`eval_worlds: ${rows.length} subjects, mean ${mean}, ${findings.length} findings${AS_BROWSER ? "" : " (no browser: loads not scored)"}`);
const out = { at: new Date().toISOString(), browser: AS_BROWSER, weights: AS_WEIGHTS, mean, rows, worst, findings };
if (argOf("--json")) writeFileSync(argOf("--json"), JSON.stringify(out, null, 1));
if (argOf("--md")) {
  const md = [
    `| Subject | Score | ${Object.keys(AS_WEIGHTS).map((k) => `${k} (${AS_WEIGHTS[k]})`).join(" | ")} | Owner |`,
    `|---|---:|${Object.keys(AS_WEIGHTS).map(() => "---").join("|")}|---|`,
    ...rows.map((r) => `| ${r.name} | **${r.score}** | ${Object.values(r.crit).join(" | ")} | ${r.owner} |`),
    "", `Mean ${mean}.`, "",
    ...worst.map((g, i) => `${i + 1}. **${g.subject} · ${g.criterion}** (−${g.cost.toFixed(1)} points${g.count > 1 ? `, ${g.count} alike` : ""}) — ${g.examples[0].replace(/\|/g, "/")} — owner **${g.owner}**`),
  ].join("\n");
  writeFileSync(argOf("--md"), md + "\n");
}
process.exit(0);
