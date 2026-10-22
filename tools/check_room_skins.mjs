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
 * ENV-HD-3 (docs/consoles/ENV-HD-3.md): every INTERIORS style now carries a set (the kitchen's stainless variant, the halls'
 * plank floor, the six Louisiana rooms built with LA-ROOMS' dressers on a map that opens them), and the skin is budget-aware:
 * the maps it sets are exactly the ones that fit under HD2_TEX_BUDGET with the room's own textures counted (the shell's
 * signs and LA-ROOMS' name-sign canvases, which headless builds draw as flat panels), and a room the skin leaves over its
 * budget is one that was over before the skin (reported, with the bytes).
 * ENV-HD-5 (docs/consoles/ENV-HD-5.md): LA-ROOMS draws its name signs at 256 x 60 on balanced (the phone size; 512 x 120 on
 * high), so every room now fits its budget on every tier before the skin (a room over it fails; it used to be reported only).
 * This checker's model of a sign canvas (larSignPx) is checked against the canvases larSignMaterial really allocates: the LA
 * rooms are built again under a recording canvas stub (headless builds otherwise draw flat panels), with the skin, and every
 * texture in the room is measured — the shell's signs, the name signs and the skin's maps.
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
const minSkinned = Math.min(...styles.map((s) => count[s] ?? 0).filter((n) => n > 0));
const unskinned = Object.entries(count).filter(([s]) => !styles.includes(s) && !/^ixr-/.test(s)).sort((a, b) => b[1] - a[1]);
check(unskinned.every(([, n]) => n < minSkinned), `every unskinned style opens fewer sites than the least-visited skinned one (${minSkinned}): ${unskinned.map(([s, n]) => `${s} ${n}`).join(", ")}`);
const covered = styles.reduce((a, s) => a + (count[s] ?? 0), 0), all = Object.values(count).reduce((a, n) => a + n, 0);
note(`skinned: ${styles.map((s) => `${s} ${count[s] ?? 0}`).join(", ")} — ${covered} of ${all} site doors (${(100 * covered / all).toFixed(1)} %)`);
const withSet = Object.keys(IXR.IXR_ROOMS).length + styles.length;
check(withSet === 6 + styles.length, `room styles with the high-detail texture set: ${withSet} (ROBO-INTERIORS' six robotics rooms + ${styles.length} skinned here)`);
const allStyles = Object.keys(IX.IX_STYLES), bare = allStyles.filter((s) => !styles.includes(s) && !IXR.IXR_ROOMS[s]);
check(bare.length === 0 && withSet === allStyles.length, `every INTERIORS style carries a set: ${withSet} of ${allStyles.length}${bare.length ? ` (bare: ${bare.join(", ")})` : ""}`);
note(`room styles with the high-detail texture set: 6 (ROBO-INTERIORS) → 15 (ENV-HD-2) → ${withSet} (ENV-HD-3)`);
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
// LA-ROOMS: each Louisiana style built on a map that opens it, with its dressers registered for that map (base and skinned)
const larSite = {};
for (const p of R.NP_PARISHES) for (const s of p.sites ?? []) { const st = IX.ixStyleFor(s.kind, s.id); if (/^lar-/.test(st) && styles.includes(st) && !larSite[st]) larSite[st] = { p, s }; }
for (const st of Object.keys(larSite)) {
  const { p } = larSite[st];
  LAR.larRegisterDressers({ ixRegisterDresser: (s2, fn) => { if (s2 === st) (base.d[s2] ??= []).push(fn); } }, { parish: p });
  LAR.larRegisterDressers({ ixRegisterDresser: (s2, fn) => { if (s2 === st) (skinned.d[s2] ??= []).unshift(fn); } }, { parish: p });
}
// lar-rooms.js larSignMaterial's canvas, this checker's model: 512 x 120 on high; 256 x 60 on balanced (ENV-HD-5: it was 512 x 120,
// which put the six LA rooms at 3.21–6.02 MiB on balanced) and on the phone tier. Measured against the real canvases below.
const larSignPx = (tier) => (tier === "high" ? [512, 120] : [256, 60]);
const larSignBytes = (tier) => { const [w, h] = larSignPx(tier); return Math.round(w * h * 4 * 4 / 3); };
const mapBytes = (res) => Math.round(res * res * 4 * 4 / 3);
let overBefore = [];
const counts = (room) => { let meshes = 0, triangles = 0, lights = 0; room.group.traverse((o) => { if (o.isLight) lights++; if (!o.isMesh) return; meshes++; const g = o.geometry; triangles += (g.index ? g.index.count : g.attributes.position.count) / 3 * (o.isInstancedMesh ? o.count : 1); }); return { meshes, triangles, lights }; };
// a dressed site for each style where CLASSROOMS furnishes one on Orleans (else the generic room)
const crSite = {};
for (const r of CR.crRoomsFor(orleans)) { const s = orleans.sites.find((x) => x.id === r.site); const st = s && IX.ixStyleFor(s.kind, s.id); if (st && !crSite[st]) crSite[st] = s; }
const rows = [], byTier = { high: 0, balanced: 0, low: 0 }, modelBytes = {};
for (const st of styles) {
  for (const tier of ["high", "balanced", "low"]) {
    const site = crSite[st] ? { ...crSite[st], stations: [] } : larSite[st] ? { ...larSite[st].s, stations: [] } : null;
    const a = IX.ixBuild(st, { three: THREE, tier, site, dressers: base.d });
    const b = IX.ixBuild(st, { three: THREE, tier, site, dressers: skinned.d });
    if (!a || !b) { check(false, `${st}/${tier}: builds`); continue; }
    const ca = counts(a), cb = counts(b);
    check(ca.meshes === cb.meshes && ca.triangles === cb.triangles && ca.lights === cb.lights, `${st}/${tier}: meshes ${ca.meshes} → ${cb.meshes}, triangles ${ca.triangles} → ${cb.triangles}, lights ${ca.lights} → ${cb.lights} (unchanged by the skin)`);
    check(cb.meshes <= IX.IX_BUDGET.meshes, `${st}/${tier}: ${cb.meshes} meshes ≤ IX_BUDGET ${IX.IX_BUDGET.meshes}`);
    const res = IXR.ixrTexRes(tier, "");
    const m = IXR.ixrMeasure(b), m0 = IXR.ixrMeasure(a);
    const spec = HD.HD2_SKIN_STYLES[st], set = spec.set;
    const metalRe = spec.metal ? new RegExp(`^ix-dress-(${spec.metal.join("|")})$`) : /^ix-dress-(rack|machine|tank|cabinet|hood)$/;
    const metalProps = []; b.group.traverse((o) => { if (o.isMesh && metalRe.test(o.name)) metalProps.push(o); });
    // the room's own textures: measured maps (headless stubs) + the shell's signs + LA-ROOMS' name-sign canvases
    let larSigns = 0; a.group.traverse((o) => { if (o.isMesh && /^lar-sign-/.test(o.name)) larSigns++; });
    const before = m0.textureBytes + signBytes + larSigns * larSignBytes(tier);
    // the maps that fit, computed here independently: floor, walls, metal (if the room has metal props), each only while it fits
    const want = []; let acc = before;
    for (const k of ["floor", "walls", ...(metalProps.length ? ["metal"] : [])]) if (acc + mapBytes(res) <= HD.HD2_TEX_BUDGET[tier]) { want.push(k); acc += mapBytes(res); }
    const floorRe = set === "industrial" ? /^ixr-floor-/ : set === "hall" ? /^hd2-plank-floor-/ : /^hd2-tile-floor-/;
    const has = {
      floor: m.textures.some((t) => floorRe.test(t.name) && t.w === res),
      walls: m.textures.some((t) => (set === "industrial" ? /concrete/ : /hd2-block-wall/).test(t.name) && t.w === res),
      metal: metalProps.length > 0 && metalProps.every((o) => /metal/.test(o.material.map?.name ?? "") && o.material.map.image?.width === res),
    };
    const got = ["floor", "walls", "metal"].filter((k) => has[k]);
    check(got.join() === want.join(), `${st}/${tier}: the ${set} set at ${res} px on ${got.join(", ") || "nothing"} (${metalProps.length} metal prop mesh(es)); the maps that fit the budget: ${want.join(", ") || "none"}`);
    check(b.hd2?.res === res && b.hd2?.style === st && b.hd2.maps.length === want.length, `${st}/${tier}: room.hd2 reports the skin (${b.hd2?.maps.length} maps${b.hd2?.skipped?.length ? `, skipped over budget: ${b.hd2.skipped.join(", ")}` : ""})`);
    const bytes = m.textureBytes + signBytes + larSigns * larSignBytes(tier);
    if (larSite[st]) modelBytes[`${st}/${tier}`] = { bytes, before, larSigns, maps: got.join(", ") || "none" };
    check(bytes === acc && Math.abs((b.hd2?.bytes ?? -1) - bytes) <= 4, `${st}/${tier}: the skin's own byte count matches the measure (${fmtB(b.hd2?.bytes ?? 0)} vs ${fmtB(bytes)})`);
    if (before > HD.HD2_TEX_BUDGET[tier]) { overBefore.push(`${st}/${tier} ${fmtB(before)} (${larSigns} LA name signs)`); check(bytes === before, `${st}/${tier}: over budget before the skin (${fmtB(before)}: ${larSigns} LA-ROOMS name signs), and the skin adds nothing`); }
    else check(bytes <= HD.HD2_TEX_BUDGET[tier], `${st}/${tier}: texture bytes ${fmtB(bytes)} ≤ ${fmtB(HD.HD2_TEX_BUDGET[tier])}`);
    if (before <= HD.HD2_TEX_BUDGET[tier]) byTier[tier] = Math.max(byTier[tier], bytes);
    if (tier !== "balanced") rows.push(`${st.padEnd(16)} ${tier.padEnd(5)} meshes ${String(cb.meshes).padStart(3)} (=)  tris ${String(cb.triangles).padStart(5)} (=)  textures ${fmtB(before)} → ${fmtB(bytes)}${crSite[st] ? "  (CLASSROOMS-dressed)" : larSite[st] ? `  (LA-ROOMS-dressed, ${larSite[st].p.id}, ${larSigns} name signs)` : ""}${b.hd2?.skipped?.length ? `  skipped: ${b.hd2.skipped.join(", ")}` : ""}`);
  }
}
console.log("  style          tier  meshes      tris        texture bytes (shell signs included) before → after");
for (const r of rows) console.log(`  ${r}`);
note(`worst texture bytes per room: high ${fmtB(byTier.high)} (budget ${fmtB(HD.HD2_TEX_BUDGET.high)}), balanced ${fmtB(byTier.balanced)} (budget ${fmtB(HD.HD2_TEX_BUDGET.balanced)}), low ${fmtB(byTier.low)} (budget ${fmtB(HD.HD2_TEX_BUDGET.low)}); headless stubs measure the size each canvas allocates (w × h × 4 × 4/3)`);
note(`rooms over their budget before the skin (the skin adds nothing there): ${overBefore.length ? overBefore.join("; ") : "none"}`);
check(overBefore.length === 0, `ENV-HD-5: every room fits its texture budget on every tier before the skin (${overBefore.length} over; the LA rooms' name signs are 256 × 60 on balanced)`);

// ENV-HD-5: the LA rooms' canvases measured, not modelled — each Louisiana style built on its map, on three tiers, with LA-ROOMS'
// dressers and the skin, under a canvas stub that records every canvas made; every texture in the room is then measured.
const larMade = [];
const larCtx = () => new Proxy({}, { get: (t, k) => (k in t ? t[k] : k === "measureText" ? (x) => ({ width: String(x).length * 9 }) : () => ({ addColorStop() {} })), set: (t, k, v) => { t[k] = v; return true; } });
const hadDoc = Object.prototype.hasOwnProperty.call(globalThis, "document"), oldDoc = globalThis.document;
globalThis.document = { createElement: (tag) => { const c = { tag, width: 0, height: 0, style: {}, getContext: () => larCtx() }; larMade.push(c); return c; } };
const larRows = [];
try {
  for (const st of Object.keys(larSite)) {
    const { p, s } = larSite[st];
    const d = {};
    LAR.larRegisterDressers({ ixRegisterDresser: (s2, fn) => { if (s2 === st) (d[s2] ??= []).push(fn); } }, { parish: p });
    HD.hd2RegisterSkins({ ixRegisterDresser: (s2, fn) => { if (s2 === st) (d[s2] ??= []).push(fn); } });
    const sizes = {};
    for (const tier of ["high", "balanced", "low"]) {
      larMade.length = 0;
      const room = IX.ixBuild(st, { three: THREE, tier, site: { ...s, stations: [] }, dressers: d });
      const signs = []; room.group.traverse((o) => { if (o.isMesh && /^lar-sign-/.test(o.name)) signs.push(o); });
      const px = [...new Set(signs.map((o) => `${o.material.map?.image?.width} × ${o.material.map?.image?.height}`))];
      const [mw, mh] = larSignPx(tier);
      check(signs.length > 0 && signs.every((o) => larMade.includes(o.material.map?.image)) && px.length === 1 && px[0] === `${mw} × ${mh}`,
        `${st}/${tier}: larSignMaterial drew ${signs.length} name-sign canvases at ${px.join(", ")} (the checker's model ${mw} × ${mh})`);
      const signB = signs.reduce((a, o) => a + IXR.ixrTexBytes(o.material.map), 0);
      check(signB === signs.length * HD.HD2_SIGN_BYTES[tier] && signB === signs.length * larSignBytes(tier), `${st}/${tier}: the name signs' bytes measured ${fmtB(signB)} = ${signs.length} × HD2_SIGN_BYTES.${tier} (what the skin counts)`);
      const meas = IXR.ixrMeasure(room).textureBytes, model = modelBytes[`${st}/${tier}`];
      check(!!model && meas === model.bytes, `${st}/${tier}: every texture in the room measured ${fmtB(meas)} (shell signs, ${signs.length} name signs, skin maps ${model?.maps}) = the model's ${fmtB(model?.bytes ?? 0)}`);
      check(meas <= HD.HD2_TEX_BUDGET[tier], `${st}/${tier}: ${fmtB(meas)} ≤ ${fmtB(HD.HD2_TEX_BUDGET[tier])} measured`);
      sizes[tier] = signs.map((o) => [o.geometry.parameters.width, o.geometry.parameters.height].join(" × "));
      larRows.push(`${st.padEnd(16)} ${tier.padEnd(8)} ${String(signs.length).padStart(2)} signs at ${px.join(", ").padEnd(10)} room ${fmtB(meas)} (before the skin ${fmtB(model?.before ?? 0)}; maps: ${model?.maps})`);
    }
    check(sizes.high.join() === sizes.balanced.join() && sizes.balanced.join() === sizes.low.join(), `${st}: the name-sign planes are the same size on every tier (${sizes.high[0]} m; only the canvas resolution changes)`);
  }
} finally { if (hadDoc) globalThis.document = oldDoc; else delete globalThis.document; }
console.log("  LA room          tier     name signs (measured canvases)   room texture bytes, measured");
for (const r of larRows) console.log(`  ${r}`);
const larBal = Object.keys(larSite).map((st) => modelBytes[`${st}/balanced`]?.bytes ?? Infinity);
note(`ENV-HD-5: LA rooms on balanced 3.21–6.02 MiB (before) → ${fmtB(Math.min(...larBal))}–${fmtB(Math.max(...larBal))} with the skin, ${larBal.filter((b) => b <= HD.HD2_TEX_BUDGET.balanced).length} of ${larBal.length} ≤ ${fmtB(HD.HD2_TEX_BUDGET.balanced)}`);

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
