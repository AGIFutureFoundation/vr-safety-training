/**
 * The NPC characters (console GRIOT — shared/npc-data.js, shared/npc.js,
 * tools/gen_npc.mjs; docs/consoles/GRIOT.md), checked headlessly:
 *
 *   - npc-data.js is fresh (gen_npc.mjs re-run in memory and diffed);
 *   - every character has a first name and a role only, a valid avatar style,
 *     three or more spoken lines, and EVERY line re-reads verbatim from the
 *     source it names: a sentence of a Guide knowledge-base chunk, a union's
 *     note in tools/unions.json, a verified standard's title in
 *     tools/standards.json, or a station's tagline in the catalog;
 *   - every hand-off id resolves (a catalog station or Trade Skills room, a
 *     field lesson of that world, a side quest posted at that site, a treasure
 *     whose hint is copied verbatim);
 *   - mounted in Bay World, Sierra Summit and Redwood Reach with the real
 *     sites and ground, every routine point stays off the site centre, the job
 *     board and the arrival spot, inside the world's bounds, on finite ground;
 *     each figure is at most CT_AVATAR_BUDGET meshes; sixty seconds of
 *     animation run clean; near() finds a character at its own spot and none
 *     far away; a parish-shaped site list mounts the parish characters by kind;
 *   - the dialogue's three moves are deterministic: the taught line is always
 *     one of the pack's, a question retrieves, nonsense gets the no-match
 *     line, each hand-off resolves to a link, an opener or the hint;
 *   - the agent adapter refuses while unconfigured with fetch untouched, and a
 *     configured reply is spoken only when it is a pack line verbatim;
 *   - the wiring: the bundler lists the modules after crew.js and links.js in
 *     the three worlds, the apps mount and animate, check_all lists this file;
 *   - the panel renders at a phone width (390 × 844) with no horizontal
 *     overflow and touch-sized buttons, when headless Chromium is on the machine.
 *
 *     node tools/check_npc.mjs
 */
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { buildSuite, WEBXR, ROOT } from "./lib/headless.mjs";

const imp = (rel) => import(pathToFileURL(join(ROOT, rel)).href);
let failures = 0, checks = 0;
const fail = (id, msg) => { console.log(`  ✗ ${id}: ${msg}`); failures += 1; };
const ok = (cond, id, msg) => { checks += 1; if (!cond) fail(id, msg); return !!cond; };

// ---------------------------------------------------------------- freshness
const { grBuildRoster, grRenderModule, GR_OUT, grSplitSentences } = await imp("tools/gen_npc.mjs");
const fresh = grRenderModule(await grBuildRoster());
const onDisk = readFileSync(GR_OUT, "utf8");
ok(fresh === onDisk, "npc-data.js", "is stale — run node tools/gen_npc.mjs");

// ------------------------------------------------------------------ sources
const { GR_ROSTER } = await imp("WebXR/shared/npc-data.js");
const { gdDecodeKb } = await imp("WebXR/shared/guide.js");
const { GD_KB } = await imp("WebXR/shared/guide-kb.js");
const kb = new Map(gdDecodeKb(GD_KB).map((c) => [c.id, c]));
const catalog = JSON.parse(readFileSync(join(WEBXR, "smartcity", "catalog.json"), "utf8"));
const stations = new Map(catalog.stations.map((s) => [s.id, s]));
const unions = new Map(JSON.parse(readFileSync(join(ROOT, "tools", "unions.json"), "utf8")).unions.map((u) => [u.id, u]));
const standards = new Map(JSON.parse(readFileSync(join(ROOT, "tools", "standards.json"), "utf8")).standards.map((s) => [s.id, s]));
const { ctAvatarNormalize, CT_AVATAR_STYLES, CT_AVATAR_BUDGET } = await imp("WebXR/shared/crew.js");
const { LK_TRADES_ROOMS } = await imp("WebXR/shared/links.js");
const { BAY_SITES, BAY_BOUNDS } = await imp("WebXR/shared/bayworld-data.js");
const { SM_SITES, SM_BOUNDS, SM_FIELD_LESSONS, SM_SIDE_QUESTS, smHeightAt } = await imp("WebXR/shared/summit-data.js");
const { RW_SITES, RW_BOUNDS, RW_SIDE_QUESTS, rwHeightAt } = await imp("WebXR/redwood/js/rw-data.js");
const { RW_FIELD_LESSONS } = await imp("WebXR/redwood/js/rw-lore-data.js");
const { K2_FIELD_LESSONS } = await imp("WebXR/shared/field-lessons.js");
const { TZ_TREASURES } = await imp("WebXR/shared/treasures-data.js");
const treasures = new Map(TZ_TREASURES.map((t) => [t.id, t]));
const lessons = { bayworld: K2_FIELD_LESSONS.filter((l) => l.world === "bayworld"), summit: SM_FIELD_LESSONS, redwood: RW_FIELD_LESSONS };
const quests = { bayworld: [], summit: SM_SIDE_QUESTS, redwood: RW_SIDE_QUESTS };
const WORLDS = ["bayworld", "summit", "redwood", "parish"];

let lines = 0, handoffs = 0;
const ids = new Set();
for (const ch of GR_ROSTER) {
  const id = ch.id;
  ok(!ids.has(id), id, "duplicate id"); ids.add(id);
  ok(/^gr-/.test(id), id, "id must start with gr-");
  ok(typeof ch.name === "string" && /^[A-Z][a-z]+$/.test(ch.name), id, `name "${ch.name}" must be one first name`);
  // "K-12" is a role's own name, not a figure.
  ok(typeof ch.role === "string" && ch.role.length > 2 && !/\d/.test(ch.role.replace(/K-12/g, "")), id, "role missing or carries a digit");
  ok(WORLDS.includes(ch.world), id, `unknown world ${ch.world}`);
  if (ch.world === "parish") ok(typeof ch.siteKind === "string" && ch.siteKind && !ch.site, id, "a parish character carries siteKind, not site");
  else ok(typeof ch.site === "string" && !ch.siteKind, id, "a world character carries site, not siteKind");
  ok(CT_AVATAR_STYLES.ppe.some((p) => p.id === ch.style?.ppe), id, `PPE "${ch.style?.ppe}" is not a crew.js option`);
  ok(Number.isInteger(ch.style?.i), id, "style.i must be an integer");
  const st = ctAvatarNormalize({ ppe: ch.style?.ppe });
  ok(st.ppe === ch.style?.ppe, id, "style does not normalise");
  const r = ch.routine ?? {};
  for (const k of ["work", "rest"]) {
    const d = Math.hypot(r[k]?.[0] ?? 0, r[k]?.[1] ?? 0);
    ok(d >= 7 && d <= 13, id, `${k} point ${d.toFixed(1)} m from the site centre (7–13 m)`);
  }
  ok(r.speed > 0 && r.speed <= 2 && r.workSeconds > 0 && r.restSeconds > 0, id, "routine timings out of range");
  ok(Array.isArray(ch.pack) && ch.pack.length >= 3, id, `only ${ch.pack?.length ?? 0} spoken lines`);
  const seen = new Set();
  for (const l of ch.pack ?? []) {
    lines += 1;
    const lid = `${id} line "${String(l.text).slice(0, 40)}…"`;
    ok(typeof l.text === "string" && l.text.trim() === l.text && l.text.length >= 8, lid, "empty or untrimmed");
    ok(!seen.has(l.text), lid, "repeated"); seen.add(l.text);
    ok(typeof l.topic === "string" && l.topic, lid, "no topic");
    const src = l.src ?? {};
    const keys = Object.keys(src);
    ok(keys.length === 1, lid, "a line names exactly one source");
    if (src.kb) {
      const c = kb.get(src.kb);
      ok(c && grSplitSentences(c.text).includes(l.text), lid, `is not a sentence of Guide chunk ${src.kb}`);
    } else if (src.union) ok(unions.get(src.union)?.note === l.text, lid, `is not unions.json ${src.union}'s note`);
    else if (src.standard) { const s = standards.get(src.standard); ok(s?.title === l.text && s?.source === "verified", lid, `is not verified standard ${src.standard}'s title`); }
    else if (src.station) ok(stations.get(src.station)?.tagline === l.text, lid, `is not the catalog tagline of ${src.station}`);
    else fail(lid, `unknown source ${JSON.stringify(src)}`);
    ok(!/\b(founded|established) in \d{4}/i.test(l.text), lid, "carries a founding claim");
  }
  ok(Array.isArray(ch.handoffs) && ch.handoffs.length >= 2, id, `only ${ch.handoffs?.length ?? 0} hand-offs`);
  const kinds = new Set();
  for (const h of ch.handoffs ?? []) {
    handoffs += 1;
    kinds.add(h.kind);
    const hid = `${id} hand-off ${h.kind}:${h.id}`;
    ok(typeof h.label === "string" && h.label, hid, "no label");
    if (h.kind === "station") ok(stations.has(h.id) || LK_TRADES_ROOMS.includes(h.id), hid, "station is not in the catalog") && ok(stations.get(h.id)?.name === h.label || LK_TRADES_ROOMS.includes(h.id), hid, "label is not the station's name");
    else if (h.kind === "lesson") {
      const l = (lessons[ch.world] ?? []).find((x) => x.id === h.id);
      ok(l, hid, `no such field lesson in ${ch.world}`) && ok(l.title === h.label && (l.station ?? l.k12) === h.station, hid, "label or K-12 station differ from the lesson's own");
    } else if (h.kind === "quest") { const q = (quests[ch.world] ?? []).find((x) => x.id === h.id); ok(q, hid, `no such side quest in ${ch.world}`) && ok(q.title === h.label && q.site === ch.site, hid, "label or site differ from the quest's own"); }
    else if (h.kind === "treasure") { const t = treasures.get(h.id); ok(t, hid, "no such treasure") && ok(t.hint === h.hint && t.name === h.label && t.surface === ch.world, hid, "hint, name or world differ from the ledger's own"); ok(!/\d/.test(h.hint ?? ""), hid, "a hint carries a digit (a coordinate would leak a location)"); }
    else fail(hid, `unknown hand-off kind ${h.kind}`);
  }
  ok(kinds.has("station"), id, "every character hands off to at least one station");
}
for (const w of WORLDS) ok(GR_ROSTER.filter((c) => c.world === w).length >= 8, `roster ${w}`, `fewer than 8 characters (${GR_ROSTER.filter((c) => c.world === w).length})`);
ok(GR_ROSTER.filter((c) => c.handoffs.some((h) => h.kind === "lesson")).length >= 12, "hand-offs", "fewer than 12 characters hand off to a field lesson");
ok(GR_ROSTER.filter((c) => c.handoffs.some((h) => h.kind === "quest")).length >= 8, "hand-offs", "fewer than 8 characters hand off to a side quest");
ok(GR_ROSTER.filter((c) => c.handoffs.some((h) => h.kind === "treasure")).length >= 8, "hand-offs", "fewer than 8 characters hand off a treasure hint");

// --------------------------------------------------------------- placement
const S = await buildSuite(["shared/crew.js", "shared/links.js", "shared/npc-data.js", "shared/npc.js"],
  "export { grMount, grDialogue, grResolveHandoff, grAgentAdapter, grRenderDialogueHtml, grRoutineAt, grRoutinePoints, grSiteFor, grSiteOf, grCharacters, grMeshBudget, GR_CSS, GR_TALK_RADIUS, GR_ANIMATE_RADIUS, GR_HIDE_RADIUS, GR_PARISH_KIND_ALIAS, THREE };", "npc");
const countMeshes = (root) => { let n = 0; root.traverse((o) => { if (o.isMesh || o.isPoints) n += 1; }); return n; };
const MOUNTS = {
  bayworld: { sites: BAY_SITES, bounds: BAY_BOUNDS, groundAt: () => 0, clear: (s) => [[s.pos[0], s.pos[1], 6, "the site centre"], [s.pos[0] + 6, s.pos[1] + 6, 4, "the pedestrian spawn"]] },
  summit: { sites: SM_SITES, bounds: SM_BOUNDS, groundAt: smHeightAt, clear: (s) => [[s.pos[0], s.pos[1], 6, "the pad centre"], [s.pos[0], s.pos[1] + 6, 5, "the job board"], [s.pos[0], s.pos[1] + 16, 5, "the arrival spot"]] },
  redwood: { sites: RW_SITES, bounds: RW_BOUNDS, groundAt: rwHeightAt, clear: (s) => [[s.pos[0], s.pos[1], 6, "the pad centre"], [s.pos[0], s.pos[1] - s.raw.pad * 0.5, 5, "the job board"], [s.pos[0], s.pos[1] - s.raw.pad * 0.5 + 3, 5, "the spot in front of the board"], [s.pos[0], s.pos[1] + s.raw.pad * 0.75, 5, "the arrival spot"]] },
};
let mounted = 0, figures = 0, totalMeshes = 0;
for (const [world, M] of Object.entries(MOUNTS)) {
  const root = new S.THREE.Group();
  let here = null;
  const m = S.grMount(world, { three: S.THREE, root, sites: M.sites, groundAt: M.groundAt, pos: () => here, from: world, page: `${world}.html`, keys: false });
  const expected = S.grCharacters(world);
  ok(m.characters.length === expected.length, `mount ${world}`, `${m.characters.length} of ${expected.length} characters placed (a site id does not resolve)`);
  mounted += 1;
  for (const e of m.characters) {
    const id = `${e.ch.id} in ${world}`;
    figures += 1;
    const n = countMeshes(e.figure);
    totalMeshes += n;
    ok(n >= 3 && n <= CT_AVATAR_BUDGET, id, `${n} meshes (budget ${CT_AVATAR_BUDGET})`);
    ok(e.figure.userData?.npc?.id === e.ch.id, id, "figure is not tagged userData.npc");
    for (const [x, z] of e.points) {
      ok(x > M.bounds.minX && x < M.bounds.maxX && z > M.bounds.minZ && z < M.bounds.maxZ, id, `routine point ${x},${z} outside the world`);
      ok(Number.isFinite(M.groundAt(x, z)), id, "ground is not finite at a routine point");
      for (const [cx, cz, r, what] of M.clear(e.site)) ok(Math.hypot(x - cx, z - cz) >= r, id, `routine point ${Math.hypot(x - cx, z - cz).toFixed(1)} m from ${what} (needs ${r})`);
    }
    // The loop passes through every phase and never leaves the segment between its two points.
    const phases = new Set();
    for (let t = 0; t < 120; t += 0.25) {
      const p = S.grRoutineAt(e.ch, e.site, t);
      phases.add(p.phase);
      const [A, B] = e.points;
      const seg = Math.hypot(B[0] - A[0], B[1] - A[1]);
      ok(Math.hypot(p.x - A[0], p.z - A[1]) <= seg + 0.01 && Math.hypot(p.x - B[0], p.z - B[1]) <= seg + 0.01, id, "wanders off its two-point path");
    }
    ok(phases.has("work") && phases.has("walk") && phases.has("rest"), id, `phases seen: ${[...phases].join(",")}`);
  }
  ok(m.meshCount() === totalMeshes || m.meshCount() <= S.grMeshBudget(world), `mount ${world}`, `${m.meshCount()} meshes over the budget ${S.grMeshBudget(world)}`);
  // Sixty seconds with the learner standing at the first character's work spot, then far away.
  const first = m.characters[0];
  here = first.points[0];
  try { for (let t = 0; t < 60; t += 0.5) m.animate(t, 0.5); } catch (e) { fail(`mount ${world}`, `animate threw: ${e.message}`); }
  for (const e of m.characters) ok(Number.isFinite(e.figure.position.y), `${e.ch.id} in ${world}`, "figure y is not finite after animating");
  // Standing where the figure is finds them (each character's loop starts at its own offset); far away finds nobody.
  m.animate(0, 0);
  const found = m.near(first.figure.position.x, first.figure.position.z);
  ok(found?.ch.id === first.ch.id, `near ${world}`, `standing at ${first.ch.id}'s figure found ${found?.ch.id ?? "nobody"}`);
  const onPath = [first.figure.position.x, first.figure.position.z];
  ok(Math.hypot(onPath[0] - first.points[0][0], onPath[1] - first.points[0][1]) <= Math.hypot(first.points[1][0] - first.points[0][0], first.points[1][1] - first.points[0][1]) + 0.01, `near ${world}`, "the figure stands off its own path");
  ok(!m.near(M.bounds.minX + 1, M.bounds.minZ + 1), `near ${world}`, "found a character at the world's corner");
  // Beyond the hide radius the figure is hidden; within the animate radius it moves.
  here = [first.points[0][0] + S.GR_HIDE_RADIUS + 50, first.points[0][1]];
  m.animate(1, 1);
  ok(first.figure.visible === false, `lod ${world}`, "figure not hidden beyond GR_HIDE_RADIUS");
  here = first.points[0]; m.animate(2, 1);
  ok(first.figure.visible === true, `lod ${world}`, "figure not shown again near the learner");
  m.dispose();
  ok(root.children.length === 0, `dispose ${world}`, "figures left in the root");
}
// A parish-shaped site list (PARISH's schema: sites carry `kind`) mounts the parish characters by kind.
{
  const parishSites = [...new Set(S.grCharacters("parish").map((c) => c.siteKind))].map((kind, i) => ({ id: `np-${kind}`, name: `${kind} site`, kind, position: [i * 300 - 1500, 200] }));
  const root = new S.THREE.Group();
  const m = S.grMount("parish:orleans", { three: S.THREE, root, sites: parishSites, groundAt: () => 1, pos: () => null, keys: false });
  ok(m.characters.length === S.grCharacters("parish").length, "mount parish", `${m.characters.length} of ${S.grCharacters("parish").length} parish characters placed by site kind`);
  for (const e of m.characters) ok(e.site.kind === e.ch.siteKind, e.ch.id, "placed at a site of another kind");
  m.dispose();
}
// The five real parishes (ASSAYER, the Bayou run): the app mounts grMount("parish:<id>") over the parish's own sites and
// ground; each character stands at a site of its kind (or the kind's parish spelling, GR_PARISH_KIND_ALIAS), on dry
// ground, clear of the pad centre, the job board (z + 6) and the arrival spot (z + 16). Orleans places every character.
{
  const NPP = await imp("WebXR/shared/np-parishes.js");
  const NPE = await imp("WebXR/shared/np-parish.js");
  let placed = 0;
  for (const p of NPP.NP_PARISHES) {
    const root = new S.THREE.Group();
    const groundAt = (x, z) => NPE.npHeightAt(p, x, z);
    const m = S.grMount(`parish:${p.id}`, { three: S.THREE, root, sites: p.sites, groundAt, pos: () => null, from: "parishes", page: "parishes.html", keys: false });
    const kinds = new Set(p.sites.map((s) => S.GR_PARISH_KIND_ALIAS[s.kind] ?? s.kind));
    const expected = S.grCharacters("parish").filter((c) => kinds.has(c.siteKind) || p.sites.some((s) => s.kind === c.siteKind));
    ok(m.characters.length === expected.length && m.characters.length >= 3, `mount parish:${p.id}`, `${m.characters.length} of ${expected.length} characters placed (three or more wanted)`);
    if (p.id === "orleans") ok(m.characters.length === S.grCharacters("parish").length, "mount parish:orleans", "Orleans places every parish character");
    for (const e of m.characters) {
      placed += 1;
      const id = `${e.ch.id} in parish:${p.id}`;
      ok(e.site.kind === e.ch.siteKind || S.GR_PARISH_KIND_ALIAS[e.site.kind] === e.ch.siteKind, id, `placed at a ${e.site.kind} site`);
      for (const [x, z] of e.points) {
        const w = NPE.npWaterAt(p, x, z);
        ok(!w || w.kind === "wetland", id, `routine point ${x},${z} stands in ${w?.id}`);
        ok(Number.isFinite(groundAt(x, z)), id, "ground is not finite at a routine point");
        for (const [cx, cz, r, what] of [[e.site.pos[0], e.site.pos[1], 6, "the pad centre"], [e.site.pos[0], e.site.pos[1] + 6, 5, "the job board"], [e.site.pos[0], e.site.pos[1] + 16, 5, "the arrival spot"]]) ok(Math.hypot(x - cx, z - cz) >= r, id, `routine point ${Math.hypot(x - cx, z - cz).toFixed(1)} m from ${what} (needs ${r})`);
      }
    }
    try { for (let t = 0; t < 20; t += 0.5) m.animate(t, 0.5); } catch (e) { fail(`mount parish:${p.id}`, `animate threw: ${e.message}`); }
    m.dispose();
  }
  const app = readFileSync(join(WEBXR, "parishes", "js", "app.js"), "utf8");
  ok(app.includes('from "../../shared/npc.js"') && app.includes("grMount(`parish:${parish.id}`"), "app parishes", "does not import grMount and mount the parish");
  ok(/asNpc\.animate\(/.test(app) && app.includes('keys: ["G"]'), "app parishes", "does not animate the characters or list G in the controls help");
  const bundler = readFileSync(join(ROOT, "tools", "bundle_webxr.py"), "utf8");
  const i = bundler.indexOf('"parishes": {'), b = bundler.slice(i, bundler.indexOf('"entry":', i));
  const at = (name) => b.indexOf(`SHARED / "${name}"`);
  ok(at("crew.js") >= 0 && at("links.js") >= 0 && at("crew.js") < at("npc.js") && at("links.js") < at("npc.js") && at("npc-data.js") < at("npc.js"), "bundler parishes", "crew.js, links.js and npc-data.js must come before npc.js");
  ok(placed >= 20, "mount parishes", `${placed} characters placed across the five parishes`);
}

// ----------------------------------------------------------------- dialogue
let dialogues = 0;
for (const ch of GR_ROSTER) {
  const id = `dialogue ${ch.id}`;
  for (const seed of [0, 1, 2]) {
    const d = S.grDialogue(ch, { seed });
    dialogues += 1;
    ok(d.greet.startsWith(`${ch.name} here — `) && d.greet.toLowerCase().includes(ch.role.toLowerCase()), id, "greet does not name the character and the role");
    ok(!/\d/.test(d.greet.replace(/k-12/gi, "")), id, "the greeting carries a digit (a template must not state a fact)");
    ok(d.teach && ch.pack.includes(d.teach), id, `seed ${seed} teaches a line that is not in the pack`);
    ok(d.handoff && ch.handoffs.includes(d.handoff), id, `seed ${seed} hands off something not in the list`);
    ok(JSON.stringify(S.grDialogue(ch, { seed })) === JSON.stringify(d), id, "not deterministic");
    const r = S.grResolveHandoff(d.handoff, { from: ch.world, page: `${ch.world}.html`, openLesson: () => {}, openQuest: () => {} });
    ok(r && typeof r.text === "string" && r.text, id, "hand-off resolves to no text");
    if (d.handoff.kind === "station") ok(/[?&](sim|room)=/.test(r.href ?? "") && r.href.includes(`from=${ch.world}`), id, `station hand-off href "${r.href}"`);
    if (d.handoff.kind === "lesson" || d.handoff.kind === "quest") ok(typeof r.action === "function", id, `${d.handoff.kind} hand-off has no opener when the world offers one`);
    if (d.handoff.kind === "lesson") ok(/[?&]sim=/.test(S.grResolveHandoff(d.handoff, {}).href ?? ""), id, "a lesson hand-off without an opener must link the K-12 station");
    if (d.handoff.kind === "treasure") ok(r.text.includes(d.handoff.hint) && !r.text.includes("x:"), id, "a treasure hand-off must speak the hint and no location");
    const html = S.grRenderDialogueHtml(ch, d, r);
    ok(html.includes("gr-msg") && html.includes(d.teach.text.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/'/g, "&#39;").replace(/</g, "&lt;").replace(/>/g, "&gt;")), id, "the panel HTML does not carry the taught line");
  }
  // A question retrieves one of the pack's own lines; nonsense retrieves nothing and says so.
  const q = S.grDialogue(ch, { question: ch.pack[1].topic });
  ok(q.teach && ch.pack.includes(q.teach), id, `asking about "${ch.pack[1].topic}" taught nothing from the pack`);
  const none = S.grDialogue(ch, { question: "zxqv wplk fnord" });
  ok(!none.teach && none.noMatch && /not in my notes/.test(none.noMatchText), id, "nonsense must get the no-match line, never a guess");
}
// The agent adapter: refuses unconfigured with nothing sent; accepts only verbatim.
{
  const ch = GR_ROSTER[0];
  let calls = 0;
  const a = S.grAgentAdapter(ch, { fetchImpl: async () => { calls += 1; return { ok: true, status: 200, json: async () => ({ text: "An invented sentence." }) }; } });
  const d = a.describe();
  ok(d.configured === false && d.missing.length === 2 && d.config.endpoint === null, "adapter", "starts configured or with a default endpoint");
  const r = await a.respond({ seed: 0 });
  ok(r.ok === false && r.reason === "configure per the provider's current documentation" && calls === 0 && r.fallback?.teach, "adapter", "did not refuse cleanly with fetch untouched");
  a.configure({ endpoint: "https://example.invalid/npc", model: "configured-by-deployment" });
  const h = await a.respond({ seed: 0 });
  ok(calls === 1 && h.hosted === false && ch.pack.includes(h.teach), "adapter", "an invented hosted reply was spoken, or nothing was sent when configured");
  const b = S.grAgentAdapter(ch, { fetchImpl: async () => ({ ok: true, status: 200, json: async () => ({ text: ch.pack[2].text }) }) });
  b.configure({ endpoint: "https://example.invalid/npc", model: "m" });
  const v = await b.respond({ seed: 0 });
  ok(v.ok === true && v.hosted === true && v.teach === ch.pack[2], "adapter", "a verbatim hosted reply was not accepted");
  ok(!/https?:\/\//.test(readFileSync(join(WEBXR, "shared", "npc.js"), "utf8").replace(/\/\/.*$/gm, "").replace(/\/\*[\s\S]*?\*\//g, "")), "adapter", "npc.js carries a URL in code — no endpoint may be defaulted");
}

// ------------------------------------------------------------------- wiring
{
  const read = (rel) => readFileSync(join(ROOT, rel), "utf8");
  const bundler = read("tools/bundle_webxr.py");
  const block = (app) => { const i = bundler.indexOf(`"${app}": {`); const j = bundler.indexOf('"entry":', i); return bundler.slice(i, j); };
  for (const app of ["bayworld", "summit", "redwood"]) {
    const b = block(app);
    const at = (name) => b.indexOf(`SHARED / "${name}"`);
    ok(at("npc-data.js") > 0 && at("npc.js") > at("npc-data.js"), `bundler ${app}`, "does not list npc-data.js then npc.js");
    ok(at("crew.js") >= 0 && at("crew.js") < at("npc.js") && at("links.js") >= 0 && at("links.js") < at("npc.js"), `bundler ${app}`, "crew.js and links.js must come before npc.js");
    ok((b.match(/SHARED \/ "npc\.js"/g) ?? []).length === 1 && (b.match(/SHARED \/ "crew\.js"/g) ?? []).length === 1, `bundler ${app}`, "a module is listed twice");
  }
  for (const [app, file] of [["bayworld", "WebXR/bayworld/js/app.js"], ["summit", "WebXR/summit/js/app.js"], ["redwood", "WebXR/redwood/js/app.js"]]) {
    const src = read(file);
    ok(src.includes('from "../../shared/npc.js"') && src.includes(`grMount("${app}"`), `app ${app}`, "does not import grMount and mount its world");
    ok(/\.animate\(/.test(src) && /npc/i.test(src), `app ${app}`, "does not animate the characters");
    ok(src.includes('keys: ["G"]'), `app ${app}`, "the controls help does not list G");
  }
  ok(!/\bTHREE\./.test(read("WebXR/shared/npc.js")), "npc.js", "spells THREE. (the bundler would pull the library into DOM-only bundles)");
  ok(read("tools/check_all.mjs").includes("check_npc.mjs"), "check_all", "does not list check_npc.mjs");
  const names = read("WebXR/shared/npc.js").match(/^(?:export\s+)?(?:const|let|function|class)\s+([A-Za-z_$][\w$]*)/gm) ?? [];
  for (const n of names) { const name = n.split(/\s+/).pop(); ok(/^(gr|GR_)/.test(name), "prefix", `top-level name ${name} is not prefixed gr`); }
}

// ------------------------------------------------------------ phone render
let phone = "skipped (no headless Chromium here)";
{
  const { pwModule, pwExecutable, PW, EXE } = await import(new URL("./lib/pw.mjs", import.meta.url).href);
  if (existsSync(PW) && existsSync(EXE)) {
    let browser = null;
    try {
      const { chromium } = await pwModule();
      browser = await chromium.launch({ executablePath: pwExecutable(), args: ["--no-sandbox"] });
      const page = await browser.newPage({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 1 });
      const ch = GR_ROSTER.reduce((a, c) => (c.pack.reduce((n, l) => Math.max(n, l.text.length), 0) > a.pack.reduce((n, l) => Math.max(n, l.text.length), 0) ? c : a));
      const d = S.grDialogue(ch, { seed: 1 });
      const body = S.grRenderDialogueHtml(ch, d, S.grResolveHandoff(d.handoff, { from: ch.world, page: `${ch.world}.html` }));
      await page.setContent(`<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"><style>html,body{margin:0;background:#123}${S.GR_CSS}</style></head><body>
<div id="gr-prompt"><span class="gr-prompt-text">G — talk to ${ch.name}, ${ch.role.toLowerCase()}</span><button type="button" id="gr-talk">Talk</button></div>
<section id="gr-panel" role="dialog"><header><h2 id="gr-title">${ch.name} · ${ch.role}</h2><button type="button" id="gr-close">Close</button></header><div class="gr-log">${body}</div>
<form id="gr-form"><input id="gr-q" type="text" placeholder="Ask about the work here…"><button type="submit" id="gr-send">Ask</button></form></section></body></html>`);
      const m = await page.evaluate(() => {
        const p = document.getElementById("gr-panel").getBoundingClientRect();
        const buttons = [...document.querySelectorAll("#gr-panel button, #gr-panel a, #gr-prompt button")].map((b) => b.getBoundingClientRect().height);
        return { scrollW: document.documentElement.scrollWidth, panelW: p.width, panelRight: p.right, panelLeft: p.left, panelBottom: p.bottom, minBtn: Math.min(...buttons), msgs: document.querySelectorAll("#gr-panel .gr-msg").length };
      });
      ok(m.scrollW <= 390, "phone", `page scrolls sideways (${m.scrollW} px)`);
      ok(m.panelLeft >= 0 && m.panelRight <= 390 && m.panelBottom <= 844, "phone", `panel outside the viewport (${m.panelLeft}..${m.panelRight}, bottom ${m.panelBottom})`);
      ok(m.minBtn >= 36, "phone", `a button is ${m.minBtn} px tall (needs 36)`);
      ok(m.msgs === 3, "phone", `${m.msgs} messages rendered (greet, teach, hand-off)`);
      phone = `panel ${Math.round(m.panelW)} px wide at 390 × 844, buttons ≥ ${Math.round(m.minBtn)} px, ${m.msgs} moves`;
    } catch (e) { fail("phone", `headless render failed: ${String(e.message).split("\n")[0]}`); }
    finally { await browser?.close(); }
  }
}

console.log(failures
  ? `\n${failures} NPC problem(s) in ${checks} checks.`
  : `\nNPC: ${GR_ROSTER.length} characters, ${lines} spoken lines each re-read verbatim from its source, ${handoffs} hand-offs resolved, ${mounted} worlds mounted (${figures} figures, ${totalMeshes} meshes, ≤ ${CT_AVATAR_BUDGET} each) plus the parish hook, ${dialogues} dialogues deterministic, the adapter refuses unconfigured; phone render: ${phone}. ${checks} checks.`);
process.exit(failures ? 1 : 0);
