#!/usr/bin/env node
/**
 * ENV-HD-2 (docs/consoles/ENV-HD-2.md): the high-detail canvas texture set on the most-visited INTERIORS rooms
 * (shared/hd2-room-skins.js, ROBO-INTERIORS' set from ixr-robo-interiors.js). Proves, headless on the vendored three.js:
 *  1. the styles skinned are real INTERIORS styles, include warehouse, port shed, plant room and a classroom style, and are
 *     the most-visited by site count over the ten maps (every unskinned non-robotics style opens fewer sites than any skinned
 *     industrial or tile style it would compete with is reported);
 *  2. on every tier the skin adds no mesh, triangle or light: each style built with the shell (and CLASSROOMS' and LA-ROOMS'
 *     dressers where they furnish it) gives the same counts with and without the skin;
 *  3. the floor, the walls and the metal props carry the set at the tier's resolution (1024 px desktop high, 256 px elsewhere);
 *  4. texture bytes per room per tier (every texture in the room, the shell's two signs included) inside HD2_TEX_BUDGET;
 *  5. procedural: no fillText, no loader, no image or model file, no URL; plain data; wiring (app, bundle, check_all, baseline).
 *
 *     node tools/check_room_skins.mjs
 */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const WEBXR = join(ROOT, "WebXR");
const imp = (p) => import(pathToFileURL(join(WEBXR, p)).href);
let pass = 0, fail = 0;
const check = (ok, msg) => { if (ok) pass++; else { fail++; console.log(`  FAIL ${msg}`); } };
const note = (msg) => console.log(`  · ${msg}`);
const fmtB = (b) => `${(b / 1048576).toFixed(2)} MiB`;
const t0 = Date.now();

const THREE = await imp("vendor/three/dist/three.module.min.js");
const IX = await imp("shared/ix-interiors.js");
const IXR = await imp("shared/ixr-robo-interiors.js");
const HD = await imp("shared/hd2-room-skins.js");
const R = await imp("shared/np-parishes.js");
const CR = await imp("shared/cr-classrooms.js");
const LAR = await imp("shared/lar-rooms.js");

// 1. which styles, and why these
const styles = Object.keys(HD.HD2_SKIN_STYLES);
check(styles.every((s) => IX.IX_STYLES[s]), `${styles.length} skinned styles, all INTERIORS styles`);
for (const need of ["warehouse", "port-shed", "plant-room"]) check(styles.includes(need), `${need} is skinned`);
check(styles.some((s) => HD.HD2_SKIN_STYLES[s].set === "tile" && /classroom/.test(s)), "a classroom style is skinned");
const count = {};
for (const p of R.NP_PARISHES) for (const s of p.sites ?? []) { const st = IX.ixStyleFor(s.kind, s.id); count[st] = (count[st] ?? 0) + 1; }
for (const s of styles) check(HD.HD2_SKIN_STYLES[s].sites === (count[s] ?? 0), `${s}: opens ${count[s] ?? 0} sites (HD2_SKIN_STYLES says ${HD.HD2_SKIN_STYLES[s].sites})`);
const minSkinned = Math.min(...styles.map((s) => count[s] ?? 0));
const unskinned = Object.entries(count).filter(([s]) => !styles.includes(s) && !/^ixr-/.test(s)).sort((a, b) => b[1] - a[1]);
check(unskinned.every(([, n]) => n < minSkinned), `every unskinned style opens fewer sites than the least-visited skinned one (${minSkinned}): ${unskinned.map(([s, n]) => `${s} ${n}`).join(", ")}`);
const covered = styles.reduce((a, s) => a + (count[s] ?? 0), 0), all = Object.values(count).reduce((a, n) => a + n, 0);
note(`skinned: ${styles.map((s) => `${s} ${count[s]}`).join(", ")} — ${covered} of ${all} site doors (${(100 * covered / all).toFixed(1)} %)`);
const withSet = Object.keys(IXR.IXR_ROOMS).length + styles.length;
check(withSet === 6 + styles.length, `room styles with the high-detail texture set: 6 → ${withSet} (ROBO-INTERIORS' six robotics rooms + ${styles.length} skinned here)`);
note(`room styles with the high-detail texture set: 6 → ${withSet}`);
const plain = { HD2_SKIN_STYLES: HD.HD2_SKIN_STYLES, HD2_TEX_BUDGET: HD.HD2_TEX_BUDGET };
check(JSON.stringify(JSON.parse(JSON.stringify(plain))) === JSON.stringify(plain), "the data is plain JSON");
check(HD.HD2_TEX_BUDGET.high <= IXR.IXR_TEX_BUDGET.high && HD.HD2_TEX_BUDGET.low <= IXR.IXR_TEX_BUDGET.low && HD.HD2_TEX_BUDGET.balanced <= IXR.IXR_TEX_BUDGET.balanced, "HD2_TEX_BUDGET is no larger than ROBO-INTERIORS' room budget on any tier");

// 2–4. build every skinned style on three tiers, with and without the skin
const reg = () => { const d = {}; return { d, ixRegisterDresser: (st, fn) => (d[st] ??= []).push(fn) }; };
const orleans = R.npParish("orleans");
const base = reg(); CR.crRegisterDressers({ ixRegisterDresser: base.ixRegisterDresser, IX_KIND_STYLE: IX.IX_KIND_STYLE }, { parish: orleans }); LAR.larRegisterDressers({ ixRegisterDresser: base.ixRegisterDresser }, { parish: orleans });
const skinned = reg(); CR.crRegisterDressers({ ixRegisterDresser: skinned.ixRegisterDresser, IX_KIND_STYLE: IX.IX_KIND_STYLE }, { parish: orleans }); LAR.larRegisterDressers({ ixRegisterDresser: skinned.ixRegisterDresser }, { parish: orleans });
const got = HD.hd2RegisterSkins({ ixRegisterDresser: skinned.ixRegisterDresser });
check(got.length === styles.length, `hd2RegisterSkins registers ${got.length} styles`);
check(HD.hd2RegisterSkins(null).length === 0, "hd2RegisterSkins(null) registers none (guarded)");
const signBytes = IXR.IXR_SHELL_SIGNS.reduce((a, [w, h]) => a + Math.round(w * h * 4 * 4 / 3), 0);
const counts = (room) => { let meshes = 0, triangles = 0, lights = 0; room.group.traverse((o) => { if (o.isLight) lights++; if (!o.isMesh) return; meshes++; const g = o.geometry; triangles += (g.index ? g.index.count : g.attributes.position.count) / 3 * (o.isInstancedMesh ? o.count : 1); }); return { meshes, triangles, lights }; };
// a dressed site for each style where CLASSROOMS furnishes one on Orleans (else the generic room)
const crSite = {};
for (const r of CR.crRoomsFor(orleans)) { const s = orleans.sites.find((x) => x.id === r.site); const st = s && IX.ixStyleFor(s.kind, s.id); if (st && !crSite[st]) crSite[st] = s; }
const rows = [], byTier = { high: 0, balanced: 0, low: 0 };
for (const st of styles) {
  for (const tier of ["high", "balanced", "low"]) {
    const site = crSite[st] ? { ...crSite[st], stations: [] } : null;
    const a = IX.ixBuild(st, { three: THREE, tier, site, dressers: base.d });
    const b = IX.ixBuild(st, { three: THREE, tier, site, dressers: skinned.d });
    if (!a || !b) { check(false, `${st}/${tier}: builds`); continue; }
    const ca = counts(a), cb = counts(b);
    check(ca.meshes === cb.meshes && ca.triangles === cb.triangles && ca.lights === cb.lights, `${st}/${tier}: meshes ${ca.meshes} → ${cb.meshes}, triangles ${ca.triangles} → ${cb.triangles}, lights ${ca.lights} → ${cb.lights} (unchanged by the skin)`);
    check(cb.meshes <= IX.IX_BUDGET.meshes, `${st}/${tier}: ${cb.meshes} meshes ≤ IX_BUDGET ${IX.IX_BUDGET.meshes}`);
    const res = IXR.ixrTexRes(tier, "");
    const m = IXR.ixrMeasure(b), m0 = IXR.ixrMeasure(a);
    const set = HD.HD2_SKIN_STYLES[st].set;
    const floorOk = m.textures.some((t) => (set === "industrial" ? /^ixr-floor-/ : /^hd2-tile-floor-/).test(t.name) && t.w === res);
    const wallOk = m.textures.some((t) => (set === "industrial" ? /concrete/ : /hd2-block-wall/).test(t.name) && t.w === res);
    const metalProps = []; b.group.traverse((o) => { if (o.isMesh && /^ix-dress-(rack|machine|tank|cabinet|hood)$/.test(o.name)) metalProps.push(o); });
    const metalOk = metalProps.every((o) => /metal/.test(o.material.map?.name ?? "") && o.material.map.image?.width === res);
    check(floorOk && wallOk && metalOk, `${st}/${tier}: floor, walls and ${metalProps.length} metal prop mesh(es) carry the ${set} set at ${res} px`);
    check(b.hd2?.res === res && b.hd2?.style === st, `${st}/${tier}: room.hd2 reports the skin`);
    const bytes = m.textureBytes + signBytes;
    check(bytes <= HD.HD2_TEX_BUDGET[tier], `${st}/${tier}: texture bytes ${fmtB(bytes)} ≤ ${fmtB(HD.HD2_TEX_BUDGET[tier])}`);
    byTier[tier] = Math.max(byTier[tier], bytes);
    if (tier !== "balanced") rows.push(`${st.padEnd(14)} ${tier.padEnd(5)} meshes ${String(cb.meshes).padStart(3)} (=)  tris ${String(cb.triangles).padStart(5)} (=)  textures ${fmtB(m0.textureBytes + signBytes)} → ${fmtB(bytes)}${crSite[st] ? "  (CLASSROOMS-dressed)" : ""}`);
  }
}
console.log("  style          tier  meshes      tris        texture bytes (shell signs included) before → after");
for (const r of rows) console.log(`  ${r}`);
note(`worst texture bytes per room: high ${fmtB(byTier.high)} (budget ${fmtB(HD.HD2_TEX_BUDGET.high)}), balanced ${fmtB(byTier.balanced)} (budget ${fmtB(HD.HD2_TEX_BUDGET.balanced)}), low ${fmtB(byTier.low)} (budget ${fmtB(HD.HD2_TEX_BUDGET.low)}); headless stubs measure the size each canvas allocates (w × h × 4 × 4/3)`);

// 5. procedural and wired
const src = readFileSync(join(WEBXR, "shared/hd2-room-skins.js"), "utf8");
check(!/fillText|strokeText/.test(src), "the skins draw no words (no fillText)");
check(!/TextureLoader|\.(png|jpe?g|webp|glb|gltf|ktx2?)["'`]|https?:\/\//i.test(src), "textures are procedural (no loader, no image or model file, no URL)");
const tops = [...src.matchAll(/^(?:export\s+)?(?:const|let|var|function)\s+([A-Za-z_$][\w$]*)/gm)].map((m) => m[1]);
check(tops.every((n) => /^(hd2|HD2_)/.test(n)), `every top-level name carries the hd2 prefix (${tops.length})`);
check(!/import\s*\{[^}]*\bas\b/.test(src), "no import aliases (the flat bundler strips imports)");
const app = readFileSync(join(WEBXR, "parishes/js/app.js"), "utf8");
check(/import\s*\{[^}]*\bhd2RegisterSkins\b[^}]*\}\s*from\s*"\.\.\/\.\.\/shared\/hd2-room-skins\.js"/.test(app) && /hd2RegisterSkins\(/.test(app), "the parishes app imports and registers the skins");
check(app.indexOf("hd2RegisterSkins(") > app.indexOf("ixrRegisterDressers("), "the skins register after the other dressers");
const bundler = readFileSync(join(ROOT, "tools/bundle_webxr.py"), "utf8");
const ih = bundler.indexOf('SHARED / "hd2-room-skins.js"'), ir = bundler.indexOf('SHARED / "ixr-robo-interiors.js"');
check(ih > 0 && ih > ir, "the bundler lists hd2-room-skins.js after ixr-robo-interiors.js");
check(readFileSync(join(ROOT, "tools/check_all.mjs"), "utf8").includes('"check_room_skins.mjs"'), "check_all lists check_room_skins");
check(/"check_room_skins\.mjs":\s*\d+/.test(readFileSync(join(ROOT, "docs/perf/checkers-baseline.json"), "utf8")), "the checkers baseline has check_room_skins");

console.log(fail ? `\nROOM-SKINS: ${fail} failed, ${pass} passed.` : `\nROOM-SKINS: all ${pass} checks pass (${((Date.now() - t0) / 1000).toFixed(1)} s).`);
process.exit(fail ? 1 : 0);
