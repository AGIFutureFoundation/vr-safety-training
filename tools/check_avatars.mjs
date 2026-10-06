/**
 * AVATARS checker (console AVATARS, docs/avatars.md, docs/consoles/AVATARS.md).
 *
 *     node tools/check_avatars.mjs
 *
 * Proves, headlessly:
 *   - shared/av-sprites.js carries the figure's own parts: its generated block
 *     equals what tools/gen_avatars.mjs would write from kit.js now (FIGURE_PARTS
 *     and OUTFITS), so a sprite can never drift from the 3D figure;
 *   - the registry (shared/av-characters.js) names every GRIOT character, every
 *     crew-role archetype, every robotics-site rig and the agents, with unique
 *     ids, an outfit kit.js has, a union id that exists in tools/unions.json
 *     (or null), and a sprite that renders as well-formed SVG with no <image>
 *     and no raster data;
 *   - the atlas (WebXR/assets/avatars/av-atlas.svg + av-atlas.json) is fresh,
 *     holds a portrait and a token frame for every entry, and stays under
 *     AV_ATLAS_BUDGET_BYTES;
 *   - every kit.js outfit stays inside the 17-mesh figure ceiling (check_crew
 *     holds it too; here with the station resolver's own choices);
 *   - every station in both apps resolves to an outfit, and a station whose
 *     trade words name one of the eight new trades gets that trade's outfit;
 *   - the account chip, the Guide panel, the NPC panel, the cohort roster and
 *     the robotics panel import the painter; the bundler lists it;
 *   - the eval: the share of registry entries whose sprite renders AND whose
 *     outfit fits the role under an explicit rubric (below), before (GRIOT's
 *     PPE field alone, no sprites anywhere) → after.
 */
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { loadSmartCity, loadTrades, buildSuite, ROOT, WEBXR } from "./lib/headless.mjs";
import { genSpriteParts, genAtlas } from "./gen_avatars.mjs";

let failures = 0;
const bad = (m) => { failures += 1; console.log(`  ✗ ${m}`); };
const ok = (m) => console.log(`  ✓ ${m}`);

const sprites = await import(pathToFileURL(join(WEBXR, "shared/av-sprites.js")).href);
const reg = await import(pathToFileURL(join(WEBXR, "shared/av-characters.js")).href);
const unions = JSON.parse(readFileSync(join(ROOT, "tools/unions.json"), "utf8")).unions;
const unionIds = new Set(unions.map((u) => u.id));
const entries = reg.avCharacters();
console.log(`Avatars — ${entries.length} registry entries, ${Object.keys(sprites.AV_OUTFITS ?? {}).length} outfits, ${unionIds.size} unions\n`);

// ---------------------------------------------------------- parts in sync
{
  const { source } = await genSpriteParts();
  const onDisk = readFileSync(join(WEBXR, "shared/av-sprites.js"), "utf8");
  if (source !== onDisk) bad("av-sprites.js's generated block differs from kit.js's FIGURE_PARTS/OUTFITS — run node tools/gen_avatars.mjs");
  else ok(`av-sprites.js carries kit.js's ${Object.keys(sprites.AV_PARTS).length} part tables and ${Object.keys(sprites.AV_OUTFITS).length} outfits, in sync`);
  for (const key of ["HEAD_PROFILE", "HAIR_STYLES", "HELMET_PROFILE", "CAP_PROFILE", "GLASSES_PROFILE", "RESPIRATOR_PROFILE", "TORSO_PROFILE", "SKIN_TONES", "HAIR_TONES", "FACE_SET"]) {
    if (!sprites.AV_PARTS?.[key]?.length) bad(`AV_PARTS.${key} is missing or empty`);
  }
}

// ---------------------------------------------------------- the registry
{
  const ids = new Set();
  const npc = await import(pathToFileURL(join(WEBXR, "shared/npc-data.js")).href);
  const crew = await import(pathToFileURL(join(WEBXR, "shared/crew.js")).href);
  const rb = await import(pathToFileURL(join(WEBXR, "shared/rb-robotics-data.js")).href);
  for (const e of entries) {
    if (ids.has(e.id)) bad(`duplicate id ${e.id}`); ids.add(e.id);
    if (!e.name || !e.role || !e.kind || !e.sprite) bad(`${e.id}: needs name, role, kind and sprite`);
    if (e.union != null && !unionIds.has(e.union)) bad(`${e.id}: union "${e.union}" is not in tools/unions.json`);
    if (e.kind === "character" || e.kind === "crew-role") {
      if (!sprites.AV_OUTFITS[e.outfit]) bad(`${e.id}: outfit "${e.outfit}" is not a kit.js outfit`);
      if (!crew.CT_AVATAR_STYLES.ppe.some((p) => p.id === e.ppe)) bad(`${e.id}: ppe "${e.ppe}" is not a crew.js option`);
    }
    if (e.kind === "robot" && !sprites.AV_RIGS.includes(e.rig)) bad(`${e.id}: rig "${e.rig}" is not drawn`);
    if (e.kind === "agent" && !sprites.AV_GLYPHS.includes(e.glyph)) bad(`${e.id}: glyph "${e.glyph}" is not drawn`);
  }
  for (const ch of npc.GR_ROSTER) if (!ids.has(ch.id)) bad(`GRIOT character ${ch.id} is not in the registry`);
  for (const id of Object.keys(crew.ROLES)) if (id !== "solo" && !ids.has(`crew-${id}`)) bad(`crew role ${id} is not in the registry`);
  const rigs = new Set(rb.RB_SITES.map((s) => s.rig));
  for (const rig of rigs) if (!entries.some((e) => e.kind === "robot" && e.rig === rig)) bad(`robotics-site rig "${rig}" has no robot persona`);
  for (const e of entries.filter((x) => x.kind === "robot")) {
    for (const s of e.sites ?? []) if (!rb.RB_SITES.some((x) => x.id === s)) bad(`${e.id}: site ${s} is not a robotics site`);
    if (e.scenario && !rb.RB_SCENARIOS.some((x) => x.id === e.scenario)) bad(`${e.id}: scenario ${e.scenario} does not exist`);
  }
  if (!ids.has("agent-guide") || !ids.has("learner") || !ids.has("agent-governor")) bad("the Guide, the learner and the safety governor must be in the registry");
  if (!failures) ok(`${entries.length} entries: ${npc.GR_ROSTER.length} characters, ${entries.filter((e) => e.kind === "crew-role").length} crew roles, ${rigs.size} rigs covered by ${entries.filter((e) => e.kind === "robot").length} robots, ${entries.filter((e) => e.kind === "agent").length} agents, the learner; every union id is in tools/unions.json`);
  // A gr- id is reachable the way npc.js asks for it.
  if (reg.avCharacter(npc.GR_ROSTER[0].id)?.kind !== "character") bad("avCharacter() does not find a GRIOT character by its gr- id");
}

// ---------------------------------------------------------- sprites render
{
  let n = 0;
  for (const e of entries) {
    for (const kind of ["portrait", "token"]) {
      const svg = reg.avSpriteFor(e, { kind, size: 48 });
      if (!/^<svg xmlns="http:\/\/www\.w3\.org\/2000\/svg"[^>]*>[\s\S]*<\/svg>$/.test(svg)) { bad(`${e.id}/${kind}: not an SVG document`); continue; }
      if (/<image|data:image\/(png|jpe?g|gif|webp)|base64/i.test(svg)) bad(`${e.id}/${kind}: a raster or an external image inside a procedural sprite`);
      if (/href="https?:/i.test(svg)) bad(`${e.id}/${kind}: an external reference`);
      const open = (svg.match(/<(path|rect|circle|ellipse|use|g|svg|clipPath|title)\b/g) ?? []).length;
      const close = (svg.match(/\/>|<\/(path|rect|circle|ellipse|use|g|svg|clipPath|title)>/g) ?? []).length;
      if (open !== close) bad(`${e.id}/${kind}: ${open} elements opened, ${close} closed`);
      if (e.kind === "robot" || e.kind === "agent") { if (/FACE|<ellipse[^>]*fill="#f2ece6"/.test(svg)) bad(`${e.id}: a non-human persona was given a face`); }
      else if (!/fill="#f2ece6"/.test(svg)) bad(`${e.id}/${kind}: a person with no eyes`);
      n += 1;
    }
  }
  // The same look always paints the same sprite, and a key is stable.
  const a = reg.avSpriteFor(entries[0]), b = reg.avSpriteFor(entries[0]);
  if (a !== b) bad("the painter is not deterministic");
  if (sprites.avLookKey(reg.avLookFor(entries[0])) !== sprites.avLookKey(reg.avLookFor(entries[0]))) bad("avLookKey is not stable");
  // The learner's own sprite follows their saved style.
  const l = entries.find((e) => e.kind === "learner");
  const s1 = reg.avSpriteFor(l, { style: { ppe: "chef", skin: "tone-2" } }), s2 = reg.avSpriteFor(l, { style: { ppe: "hard-hat-hivis", skin: "tone-11" } });
  if (s1 === s2) bad("the learner's sprite ignores their style");
  if (!failures) ok(`${n} sprites render as well-formed procedural SVG (no image files, no faces on robots or agents, deterministic; the learner's follows their style)`);
}

// ---------------------------------------------------------- the atlas
{
  const dir = join(WEBXR, "assets/avatars");
  const svgPath = join(dir, "av-atlas.svg"), jsonPath = join(dir, "av-atlas.json");
  if (!existsSync(svgPath) || !existsSync(jsonPath)) bad("the atlas is missing — run node tools/gen_avatars.mjs");
  else {
    const fresh = await genAtlas();
    const svg = readFileSync(svgPath, "utf8"), json = readFileSync(jsonPath, "utf8");
    if (svg !== fresh.svg || json !== fresh.json) bad("the atlas on disk differs from a fresh generation — run node tools/gen_avatars.mjs");
    const frames = JSON.parse(json);
    const bytes = Buffer.byteLength(svg) + Buffer.byteLength(json);
    if (bytes > sprites.AV_ATLAS_BUDGET_BYTES) bad(`atlas ${bytes} bytes, over the ${sprites.AV_ATLAS_BUDGET_BYTES}-byte budget`);
    else ok(`atlas ${(bytes / 1024).toFixed(1)} KiB of ${(sprites.AV_ATLAS_BUDGET_BYTES / 1024).toFixed(0)} KiB (svg + frames)`);
    let missing = 0;
    for (const e of entries) {
      const f = frames.sprites[e.sprite];
      if (!f || !f.portrait || !f.token) { missing += 1; continue; }
      for (const k of ["portrait", "token"]) {
        if (!svg.includes(`<svg x="${f[k].x}" y="${f[k].y}" width="${frames.cell}"`)) bad(`${e.sprite}/${k}: frame at ${f[k].x},${f[k].y} is not in the atlas`);
      }
    }
    if (missing) bad(`${missing} entries have no frames`); else ok(`${Object.keys(frames.sprites).length} entries × 2 frames named in av-atlas.json, each at its cell in av-atlas.svg`);
    if (/<image|base64/i.test(svg)) bad("the atlas embeds an image");
  }
}

// ---------------------------------------------------------- figures fit
const figures = await buildSuite(["shared/kit.js", "shared/textures.js", "shared/perf.js", "smartcity/js/citykit.js"],
  "export { THREE, standingFigure, OUTFITS, outfitFromContext, outfitFromTrade, setActiveContext };", "check-avatars-figures");
{
  const NEW = ["welder", "lineworker", "silica", "robotTech", "aiTrainer", "longshore", "healthcare", "chef"];
  for (const name of NEW) if (!figures.OUTFITS[name]) bad(`kit.js lacks the "${name}" outfit`);
  const count = (opts) => { const root = new figures.THREE.Group(); figures.standingFigure(root, 0, 0, opts); let n = 0; root.traverse((o) => { if (o.isMesh || o.isPoints || o.isLine) n += 1; }); return n; };
  let worst = 0;
  for (const name of Object.keys(figures.OUTFITS)) worst = Math.max(worst, count({ outfit: name }));
  if (worst > 17) bad(`an outfit builds ${worst} meshes, over the 17-mesh figure cap`); else ok(`all ${Object.keys(figures.OUTFITS).length} outfits build inside the 17-mesh figure cap (worst ${worst})`);
  // The gear each new outfit must actually put on the figure.
  const gear = { welder: { helmet: 0x1f2226, mask: 1 }, lineworker: { helmet: 1, harness: 1 }, silica: { helmet: 1, respirator: 1 }, robotTech: { cap: 1, toolBelt: 1 }, aiTrainer: { mask: 1 }, longshore: { helmet: 1, vest: 1 }, healthcare: { scrubCap: 1 }, chef: { cap: 1 } };
  for (const [name, need] of Object.entries(gear)) for (const k of Object.keys(need)) if (!figures.OUTFITS[name]?.[k]) bad(`outfit ${name} does not name ${k}`);
  // The resolver: trade words first, then category, and the app's joined context.
  const want = [
    ["Construction & Structural Trades | Welder | Boilermakers (IBB) | weld-bay", "welder"],
    ["Energy & Power | Lineworker | IBEW outside line | pole-top", "lineworker"],
    ["Construction & Structural Trades | Laborer | LIUNA | silica-dust-control", "silica"],
    ["Manufacturing & Automation | Robot technician | UAW | ad-robot-cell-lockout-and-safe-reentry", "robotTech"],
    ["Manufacturing & Automation | AI-training specialist | teleop demonstration recorder", "aiTrainer"],
    ["Maritime & Ports | Longshore worker | ILWU | container-lashing", "longshore"],
    ["Healthcare Support", "healthcare"], ["Healthcare Support | Nurse | NNU | patient-lift", "healthcare"],
    ["Culinary & Hospitality", "chef"], ["Culinary & Hospitality | Line cook | UNITE HERE | hot-line", "chef"],
    ["Construction & Structural Trades", "construction"], ["Dental & Oral Health | Dentist", "clinical"],
    ["Maritime & Ports | Deckhand | IBU | mooring-line", "marine"], ["", "office"],
  ];
  let right = 0;
  for (const [ctx, outfit] of want) { const got = figures.outfitFromContext(ctx); if (got !== outfit) bad(`outfitFromContext("${ctx}") → ${got}, wanted ${outfit}`); else right += 1; }
  ok(`${right}/${want.length} resolver cases: a trade's own words beat its category, and category alone still resolves`);
}

// ---------------------------------------------------------- every station
{
  const city = await loadSmartCity();
  const trades = await loadTrades();
  const rooms = [...city.ROOMS, ...trades.ROOMS];
  const tally = {};
  let unresolved = 0, tradeMiss = 0;
  for (const r of rooms) {
    const ctx = [r.category, r.trade, r.union, r.domain, r.id].filter(Boolean).join(" | ");
    const got = figures.outfitFromContext(ctx);
    if (!figures.OUTFITS[got]) { unresolved += 1; continue; }
    tally[got] = (tally[got] ?? 0) + 1;
    const t = figures.outfitFromTrade(ctx.toLowerCase());
    if (t && t !== got) tradeMiss += 1;
  }
  if (unresolved) bad(`${unresolved} stations resolve to no outfit`);
  if (tradeMiss) bad(`${tradeMiss} stations name a trade but got another outfit`);
  if (!unresolved && !tradeMiss) ok(`${rooms.length} stations resolve to an outfit by category, trade and union: ${Object.entries(tally).sort((a, b) => b[1] - a[1]).map(([k, v]) => `${k} ${v}`).join(", ")}`);
}

// ---------------------------------------------------------- the wiring
{
  const uses = [
    ["shared/account.js", /avSpriteSvg\(avLookFromStyle\(/, "the account chip and picker draw the learner's own sprite"],
    ["shared/guide.js", /avSpriteSvg\(AV_GUIDE_LOOK/, "the Guide panel shows the Guide's sprite"],
    ["shared/npc.js", /avSpriteFor\(avCharacter\(/, "the NPC panel shows the character's sprite"],
    ["instructor/js/cohort.js", /avLookFromOutfit\(/, "the cohort roster shows a token per member"],
    ["shared/rb-world.js", /avRobotLook\(/, "the robotics panel shows each rig's non-human sprite"],
    ["avatars/index.html", /avSpriteFor\(/, "the characters page lists every entry"],
  ];
  for (const [file, re, what] of uses) {
    const src = readFileSync(join(WEBXR, file), "utf8");
    if (!re.test(src)) bad(`${file}: ${what} — not wired`); else ok(`${file}: ${what}`);
  }
  const bundler = readFileSync(join(ROOT, "tools/bundle_webxr.py"), "utf8");
  const nAcc = (bundler.match(/SHARED \/ "account\.js"/g) ?? []).length, nSpr = (bundler.match(/SHARED \/ "av-sprites\.js"/g) ?? []).length;
  const nNpc = (bundler.match(/SHARED \/ "npc\.js"/g) ?? []).length, nReg = (bundler.match(/SHARED \/ "av-characters\.js"/g) ?? []).length;
  if (nSpr < nAcc) bad(`bundle_webxr.py lists av-sprites.js ${nSpr} times for ${nAcc} account chips`);
  if (nReg < nNpc) bad(`bundle_webxr.py lists av-characters.js ${nReg} times for ${nNpc} NPC engines`);
  if (nSpr >= nAcc && nReg >= nNpc) ok(`bundle_webxr.py lists av-sprites.js beside every account chip (${nAcc}) and av-characters.js beside every NPC engine (${nNpc})`);
  const all = readFileSync(join(ROOT, "tools/check_all.mjs"), "utf8");
  if (!all.includes("check_avatars.mjs")) bad("check_all.mjs does not list check_avatars.mjs");
  for (const f of ["shared/av-sprites.js", "shared/av-characters.js", "avatars/index.html"]) {
    const src = readFileSync(join(WEBXR, f), "utf8");
    if (/import \{[^}]*\bas\b[^}]*\}/.test(src)) bad(`${f}: an import alias`);
    if (/\.(png|jpe?g|webp|gif)["')]/i.test(src)) bad(`${f}: refers to an image file`);
  }
}

// ---------------------------------------------------------- the eval
//
// Rubric, per entry: (1) a sprite renders; (2) the figure fits the role —
// for a person, the outfit is one the role's words call for under the table
// below; for a robot or an agent, the sprite is non-human (its rig or badge,
// no face). "Before" is the tree before this console: GRIOT's own `ppe`
// field mapped to the nearest outfit, no sprite anywhere, crew roles and
// robots with no figure of their own.
{
  const RUBRIC = [
    [/longshore|terminal foreman|lasher/i, ["longshore"]],
    [/lineworker|line ?worker/i, ["lineworker"]],
    [/\bnurses?\b|nursing/i, ["healthcare", "clinical"]],
    [/\bchef\b|banquet|\bcook\b/i, ["chef", "kitchen"]],
    [/\bweld/i, ["welder"]],
    [/wildland|fire lookout|crew boss/i, ["firefighter"]],
    [/silica|cement mason/i, ["silica"]],
    [/robot technician/i, ["robotTech"]],
    [/ai[- ]training/i, ["aiTrainer"]],
    [/electrician|millwright|mechanic|inspector|conductor|foreman|operator|rigger|stagehand|tunnel|attendant|entrant|signaller|fire watch|journey-level|crew lead|at the (opening|controls)|inside the space|on the ground|outside the hood/i, ["construction", "lineworker", "longshore", "silica"]],
    [/teacher|pilot|ranger|scientist|host|peer|nursery|watershed|lead \(teacher|learner/i, ["office", "sport"]],
  ];
  const expect = (role) => RUBRIC.find(([re]) => re.test(role))?.[1] ?? null;
  const PPE_TO_OUTFIT = { "hard-hat-hivis": "construction", electrical: "lineworker", none: "office", chef: "chef", scrubs: "healthcare", marine: "marine", grounds: "construction", dive: "diver", "flight-crew": "office" };
  const npc = await import(pathToFileURL(join(WEBXR, "shared/npc-data.js")).href);
  let beforeFit = 0, afterFit = 0, afterSprite = 0, afterBoth = 0, unrated = [];
  for (const e of entries) {
    const want = expect(`${e.name} ${e.role} ${e.trade ?? ""}`);
    const human = e.kind === "character" || e.kind === "crew-role" || e.kind === "learner";
    let fit;
    if (!human) fit = reg.avLookFor(e).kind !== "human";
    else if (e.kind === "learner") fit = true; // their own style, by definition
    else if (!want) { unrated.push(e.id); fit = false; }
    else fit = want.includes(e.outfit);
    const svg = reg.avSpriteFor(e);
    const hasSprite = /^<svg/.test(svg) && svg.length > 200;
    if (fit) afterFit += 1; if (hasSprite) afterSprite += 1; if (fit && hasSprite) afterBoth += 1;
    // before: only GRIOT characters had a figure of their own
    const ch = npc.GR_ROSTER.find((c) => c.id === e.id);
    if (ch && want && want.includes(PPE_TO_OUTFIT[ch.style?.ppe])) beforeFit += 1;
  }
  const n = entries.length, pct = (v) => `${Math.round((100 * v) / n)}%`;
  if (unrated.length) bad(`${unrated.length} roles the rubric cannot rate: ${unrated.join(", ")}`);
  if (afterBoth < n) bad(`${n - afterBoth} entries lack a sprite or a role-fitting figure`);
  console.log(`\n  eval (rubric above, ${n} entries): sprite ${pct(0)} → ${pct(afterSprite)}; role-fitting figure ${pct(beforeFit)} → ${pct(afterFit)}; both ${pct(0)} → ${pct(afterBoth)} (${afterBoth}/${n})`);
}

console.log(failures ? `\n${failures} avatar problem(s) found.` : "\nAll avatar checks pass.");
process.exit(failures ? 1 : 0);
