#!/usr/bin/env node
/**
 * FACADES (the environment wave, docs/consoles/FACADES.md): shared/fc-facades.js sets NP_MASSING_HOOKS.details.
 * Proves, headless on the vendored three.js: the data is plain and consistent, every kit builds per massing kind and
 * region group and its phone kit is the two cheapest details, details build per district character on every map,
 * mesh and triangle budgets per chunk and tier, the full parish build stays inside the engine's mesh budget, the near
 * ring only, no sign text outside the generic list, determinism by seed, dispose, and the page and bundle wiring.
 *
 *     node tools/check_facades.mjs
 */
import { readFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const WEBXR = join(ROOT, "WebXR");
let failures = 0, passes = 0;
const check = (ok, msg) => { if (ok) passes++; else { failures++; console.error(`  FAIL ${msg}`); } };
const note = (msg) => console.log(`  · ${msg}`);
const imp = (p) => import(pathToFileURL(join(WEBXR, p)).href);

const THREE = await imp("vendor/three/dist/three.module.min.js");
const E = await imp("shared/np-parish.js");
const R = await imp("shared/np-parishes.js");
const W = await imp("shared/np-world.js");
const CW = await imp("shared/cw-cityworks.js");
const F = await imp("shared/fc-facades.js");

// 1. the hook and the data
check(W.NP_MASSING_HOOKS.details === F.fcDetails, "fc-facades.js sets NP_MASSING_HOOKS.details to fcDetails");
check(!/NP_MASSING_HOOKS\.material\s*=/.test(readFileSync(join(WEBXR, "shared/fc-facades.js"), "utf8")), "fc-facades.js never sets NP_MASSING_HOOKS.material (PALETTE's)");
const ids = F.FC_DETAIL_KINDS.map((d) => d.id);
check(new Set(ids).size === ids.length && ids.length >= 12, `${ids.length} detail kinds, ids unique`);
for (const [kind, groups] of Object.entries(F.FC_KITS)) for (const [g, list] of Object.entries(groups)) {
  check(list.every((id) => ids.includes(id)), `${kind}/${g}: every detail is a known kind`);
}
check(new Set(F.FC_SIGN_WORDS).size === F.FC_SIGN_WORDS.length && F.FC_SIGN_WORDS.length >= 10, `${F.FC_SIGN_WORDS.length} generic sign words, unique`);
const plain = { FC_DETAIL_KINDS: F.FC_DETAIL_KINDS, FC_KITS: F.FC_KITS, FC_SIGN_WORDS: F.FC_SIGN_WORDS, FC_SIGN_COLOURS: F.FC_SIGN_COLOURS, FC_BUDGET: F.FC_BUDGET };
check(JSON.stringify(JSON.parse(JSON.stringify(plain))) === JSON.stringify(plain), "the shared data is plain JSON (TQ-BRIDGE can export it)");
check(F.FC_SIGN_COLOURS.every((c) => /^#[0-9a-f]{6}$/i.test(c.board) && /^#[0-9a-f]{6}$/i.test(c.text)), "sign colours are hex pairs");
// a sign names a trade, never a business: no possessives, no ampersand-joined names, no "Inc"/"LLC"/"Co." and no trademark marks
check(F.FC_SIGN_WORDS.every((w) => !/['’&®™]|\b(inc|llc|co\.?|corp|ltd)\b/i.test(w)), "no sign word reads as a business name (possessive, '&', Inc/LLC/Co, marks)");

// 2. every kit builds per kind and group, and the phone kit is its two cheapest details
let kitCount = 0;
for (const [kind, groups] of Object.entries(F.FC_KITS)) for (const g of Object.keys(groups)) {
  const hi = F.fcKit(THREE, kind, g, "high"), lo = F.fcKit(THREE, kind, g, "low");
  check(!!hi && (hi.body || hi.roof) && !!lo, `${kind}/${g}: the kit builds on both tiers`);
  kitCount++;
  const list = groups[g], tri = list.map((id) => F.fcDetailTriangles(THREE, id, kind));
  check(tri.every((t) => t > 0), `${kind}/${g}: every detail has geometry`);
  const phone = F.fcKitDetails(kind, g, "low");
  check(phone.length === Math.min(2, list.length), `${kind}/${g}: the phone kit keeps ${phone.length} detail(s)`);
  const rest = tri.slice(phone.length), worstPhone = Math.max(...tri.slice(0, phone.length));
  check(rest.every((t) => t >= worstPhone), `${kind}/${g}: the phone kit (${phone.join(", ")}) is the two cheapest (${tri.join("/")} tris)`);
}
note(`${kitCount} kits build (kind × region group), phone kits are the two cheapest details`);

// 3. per district character on every map: details build, budgets per chunk, signs from the list, near ring only
const seenChar = new Map(), signWords = new Set();
let chunksTried = 0, worstMesh = { low: 0, high: 0 }, worstTri = { low: 0, high: 0 }, signCount = 0;
for (const p of R.NP_PARISHES) {
  const filt = CW.cwMassFilter(p);
  const done = new Set();
  for (const d of p.districts ?? []) {
    if (done.has(d.character)) continue;
    const xs = d.poly.map((q) => q[0]), zs = d.poly.map((q) => q[1]);
    const cx = (Math.min(...xs) + Math.max(...xs)) / 2, cz = (Math.min(...zs) + Math.max(...zs)) / 2;
    const { cx: ix, cz: iz } = E.npChunkOf(cx, cz);
    const spots = E.npMassingForChunk(p, ix, iz).filter(filt);
    if (!spots.length) continue;
    done.add(d.character);
    for (const tier of ["low", "high"]) {
      const g = F.fcDetails({ THREE, parish: p, chunk: { cx: ix, cz: iz, key: `${ix},${iz}`, ring: 0, lod: 0 }, spots, tier });
      chunksTried++;
      if (!g) { if (!["wetland", "park"].includes(d.character) && spots.some((s) => F.FC_KITS[s.kind])) check(false, `${p.id}/${d.character}/${tier}: details build`); continue; }
      const fc = g.userData.fc;
      const seen = seenChar.get(d.character) ?? seenChar.set(d.character, new Set()).get(d.character); fc.kits.forEach((k) => seen.add(k));
      worstMesh[tier] = Math.max(worstMesh[tier], fc.meshes); worstTri[tier] = Math.max(worstTri[tier], fc.triangles);
      check(fc.meshes <= F.FC_BUDGET.meshesPerChunk[tier], `${p.id}/${d.character}/${tier}: ${fc.meshes} detail meshes ≤ ${F.FC_BUDGET.meshesPerChunk[tier]}`);
      check(fc.triangles <= F.FC_BUDGET.trianglesPerChunk[tier], `${p.id}/${d.character}/${tier}: ${fc.triangles} detail triangles ≤ ${F.FC_BUDGET.trianglesPerChunk[tier]}`);
      check(g.children.every((o) => o.isInstancedMesh || o.name === "fc-signs"), `${p.id}/${d.character}/${tier}: instanced kits and one merged sign mesh only`);
      if (tier === "low") check(fc.signs.length === 0, `${p.id}/${d.character}/low: no signs on the phone tier`);
      for (const s of fc.signs) { signWords.add(s.word); signCount++; check(F.FC_SIGN_WORDS.includes(s.word), `${p.id}: sign "${s.word}" is a generic trade`); }
      const far = F.fcDetails({ THREE, parish: p, chunk: { cx: ix, cz: iz, key: `${ix},${iz}`, ring: F.FC_BUDGET.nearRing[tier] + 1, lod: 2 }, spots, tier });
      check(far === null, `${p.id}/${d.character}/${tier}: nothing past the near ring`);
      g.dispose();
    }
  }
}
for (const ch of ["quarter", "garden", "industrial", "suburb", "port", "refinery", "campus", "downtown"]) check(seenChar.has(ch), `details build for the ${ch} character`);
note(`details per character: ${[...seenChar].map(([c, k]) => `${c} [${[...k].join(", ")}]`).join("; ")}`);
note(`${chunksTried} chunk builds over ${R.NP_PARISHES.length} maps; worst detail chunk low ${worstMesh.low} meshes / ${worstTri.low} tris, high ${worstMesh.high} meshes / ${worstTri.high} tris`);
check(signCount > 0, `${signCount} signs placed, ${signWords.size} distinct words, all from FC_SIGN_WORDS`);

// 4. determinism by seed
{
  const p = R.npParish("orleans"), s = E.npStartSite(p), { cx, cz } = E.npChunkOf(s.position[0], s.position[1]);
  const run = () => {
    const spots = E.npMassingForChunk(p, cx, cz);
    const g = F.fcDetails({ THREE, parish: p, chunk: { cx, cz, key: `${cx},${cz}`, ring: 0, lod: 0 }, spots, tier: "high" });
    const out = JSON.stringify([g?.userData.fc, g?.children.map((o) => [o.name, o.count ?? 0, o.isInstancedMesh ? Array.from(o.instanceMatrix.array.slice(0, 32)).map((v) => v.toFixed(3)) : Array.from(o.geometry.attributes.position.array.slice(0, 24)).map((v) => v.toFixed(3))])]);
    g?.dispose(); return out;
  };
  const a = run(), b = run();
  check(a === b && a.length > 20, "the same chunk builds the same details and signs twice (deterministic by seed)");
}

// 5. the full streamed build holds the engine's budget with the details on (Orleans, sf-downtown, West Oakland)
for (const id of ["orleans", "sf-downtown", "oak-west-oakland"]) {
  const p = R.npParish(id); if (!p) continue;
  for (const tier of ["low", "high"]) {
    const root = new THREE.Group(), start = E.npStartSite(p);
    const world = W.npBuildParish(root, THREE, p, { tier, start: start.position, massFilter: CW.cwMassFilter(p) });
    let wm = 0, wt = 0, det = 0;
    for (const s of [start, ...p.sites]) {
      world.update(s.position[0], s.position[1], 999); const st = world.stats(); wm = Math.max(wm, st.meshes); wt = Math.max(wt, st.triangles);
      let n = 0; root.traverse((o) => { if (o.name?.startsWith("mass-details-")) n++; }); det = Math.max(det, n);
    }
    check(wm <= E.NP_BUDGET.drawCalls, `${id}/${tier}: full build worst ${wm} meshes ≤ ${E.NP_BUDGET.drawCalls}`);
    check(wt <= E.NP_BUDGET.triangles, `${id}/${tier}: full build worst ${wt} triangles ≤ ${E.NP_BUDGET.triangles}`);
    check(det <= (2 * F.FC_BUDGET.nearRing[tier] + 1) ** 2, `${id}/${tier}: ${det} detail groups, near ring only`);
    note(`${id}/${tier}: full build worst ${wm} meshes / ${wt} triangles, ${det} detail chunks`);
  }
}

// 6. wiring
const app = readFileSync(join(WEBXR, "parishes/js/app.js"), "utf8");
check(/import\s*\{[^}]*\bfcDetails\b[^}]*\}\s*from\s*"\.\.\/\.\.\/shared\/fc-facades\.js"/.test(app), "the parishes app imports fc-facades.js");
const bundler = readFileSync(join(ROOT, "tools/bundle_webxr.py"), "utf8");
const iw = bundler.indexOf('SHARED / "np-world.js"'), ifc = bundler.indexOf('SHARED / "fc-facades.js"');
check(iw > 0 && ifc > iw, "the bundler lists fc-facades.js after np-world.js");
const dist = join(WEBXR, "parishes/dist/parishes.html");
check(!existsSync(dist) || readFileSync(dist, "utf8").includes("function fcDetails"), "the parishes bundle carries fcDetails (run tools/bundle_webxr.py)");

console.log(failures ? `\n${failures} FACADES check(s) failed, ${passes} passed.` : `\nFACADES: all ${passes} checks pass.`);
process.exit(failures ? 1 : 0);
