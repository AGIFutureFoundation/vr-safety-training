#!/usr/bin/env node
/**
 * HIVE-IN-WORLD checker (docs/consoles/HIVE-IN-WORLD.md): the Omega Hive's agents in person.
 *
 *     node tools/check_hive_world.mjs
 *
 * Proves, headlessly (the vendored three.js; a canvas stub only for the figures' label and caption canvases):
 *   1. agents inside the robotics rooms: in each of the six ixr rooms, on the high, balanced and low tiers, every hive agent
 *      homed at that robot site stands at its spot (ixrAgentSpot: its role's spot, else a free one), its figure inside
 *      room.group and facing the spot's yaw; the hive's own speak events (a seeded ohHive run) show their captions over the
 *      room figure; the room stays inside IX_BUDGET (meshes, triangles) and IXR_TEX_BUDGET with the figures and captions in
 *      (ixrMeasure, before → after); the phone tier builds no figures; leaving the room disposes the mount and its listeners;
 *   2. one door: on the five robot-site maps every robot site's room door is ROBO-EXTERIORS' building door (fxDoorFor's
 *      outside spot), clear of every exterior collider box;
 *   3. return into the room: a station link launched from a robotics room carries `ixr=<style>` on its return, the return
 *      resolves on this origin to the same site and style, and a link without it is unchanged;
 *   4. the wiring: the parishes app, the bundle list, check_all and the estimated baseline row.
 */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const WEBXR = join(ROOT, "WebXR");
let passes = 0, failures = 0;
const ok = (cond, what, detail = "") => { if (cond) passes += 1; else failures += 1; console.log(`  ${cond ? "✓" : "✗"} ${what}${detail ? ` — ${detail}` : ""}`); return !!cond; };
const imp = (p) => import(pathToFileURL(join(WEBXR, p)).href);
const read = (rel) => readFileSync(join(ROOT, rel), "utf8");
const fmtB = (b) => `${(b / 1048576).toFixed(2)} MiB`;

const THREE = await imp("vendor/three/dist/three.module.min.js");
const IX = await imp("shared/ix-interiors.js");
const IXR = await imp("shared/ixr-robo-interiors.js");
const RB = await imp("shared/rb-robotics-data.js");
const RBW = await imp("shared/rb-world.js");
const NP = await imp("shared/np-parishes.js");
const FX = await imp("shared/fx-exteriors.js");
const AA = await imp("shared/aa-agent-avatars.js");
const HW = await imp("shared/hw-hive-world.js");
const OHD = await imp("shared/oh-hive-data.js");
const OHH = await imp("shared/oh-hive.js");
const LK = await imp("shared/links.js");
const PP = await imp("shared/passport.js");

console.log("HIVE-IN-WORLD — the hive's agents in the robotics rooms, one door, the return into the room\n");

// ------------------------------------------------------------------------------------------------ 1. agents inside the rooms
const STYLES = Object.keys(IXR.IXR_ROOMS);
const dressers = {}; for (const st of STYLES) dressers[st] = [(a) => IXR.ixrDress(a)];
const signBytes = IXR.IXR_SHELL_SIGNS.reduce((a, [w, h]) => a + Math.round(w * h * 4 * 4 / 3), 0); // the shell's two sign canvases
const canvasStub = () => { // label and caption canvases: real sizes, a 2D context that draws nothing (bytes are what is measured)
  const ctx = new Proxy({}, { get: (_t, k) => (k === "measureText" ? () => ({ width: 10 }) : () => {}), set: () => true });
  globalThis.document = { createElement: () => ({ width: 0, height: 0, getContext: () => ctx }) };
};
const homedAt = (siteId) => OHD.OH_AGENTS.filter((a) => a.homeSite === siteId);
const rows = [];
let standing = { high: 0, balanced: 0, low: 0 }, expected = 0, captions = { high: 0, balanced: 0 }, captionsWanted = { high: 0, balanced: 0 }, inBudget = 0, roomsTiers = 0;
for (const tier of ["high", "balanced", "low"]) {
  const lt = tier === "low" ? "low" : "high";
  delete globalThis.document; // ixr draws its own textures as size stubs headlessly, as check_robo_interiors measures them
  const rooms = STYLES.map((st) => {
    const rb = RB.RB_SITES.find((s) => IXR.IXR_SITE_STYLE[s.id] === st);
    const room = IX.ixBuild(st, { three: THREE, tier, site: IXR.ixrSiteFor(rb, null), dressers });
    const m0 = IXR.ixrMeasure(room);
    return { st, rb, room, before: { meshes: m0.meshes, triangles: m0.triangles, tex: m0.textureBytes + signBytes } };
  });
  canvasStub();
  const hive = OHH.ohHive({ seed: 1 });
  for (const r of rooms) r.mount = HW.hwMountRoomAgents({ three: THREE, room: r.room, agents: hive.agents, source: hive, tier });
  // the spots, the facing and the group
  for (const r of rooms) {
    const homed = homedAt(r.rb.id);
    if (tier === "high") expected += homed.length;
    for (const a of homed) {
      const p = r.mount?.placed.find((x) => x.agent.id === a.id), spot = p?.spot, s = r.mount?.avatars?.state(a.id), fig = r.mount?.avatars?.figure(a.id);
      let inGroup = false; for (let o = fig; o; o = o.parent) if (o === r.room.group) inGroup = true;
      const yawOk = fig ? Math.abs(fig.rotation.y - (spot.yaw + Math.PI)) < 1e-9 : false;
      // the figure faces +z at rotation 0, so its front is (sin ry, cos ry); the spot's yaw is the learner's: (−sin y, −cos y)
      const faceOk = fig ? Math.hypot(Math.sin(fig.rotation.y) + Math.sin(spot.yaw), Math.cos(fig.rotation.y) + Math.cos(spot.yaw)) < 1e-9 : false;
      const atSpot = s && spot && Math.abs(s.x - spot.x) < 1e-9 && Math.abs(s.z - spot.z) < 1e-9 && s.y === 0 && s.visible && !s.offMap;
      if (tier === "low") { if (p && atSpot && !fig) standing.low += 1; continue; } // the phone tier: the state stands there, no figure
      if (p && atSpot && fig && inGroup && yawOk && faceOk && fig.position.x === spot.x && fig.position.z === spot.z) standing[tier] += 1;
      else ok(false, `${tier}/${r.st}: ${a.id} at its spot in the room's group, facing the spot`, JSON.stringify({ spot: spot?.id, s: s && [s.x, s.z, s.y], inGroup, yawOk, faceOk }));
    }
  }
  // the hive's own lines: run it, animate, and catch each room agent's caption over its figure
  const seen = new Map(); let clock = 0;
  const firstSpeak = new Map(); // agentId -> the first speak event heard
  hive.on("speak", (e) => { if (!firstSpeak.has(e.agent)) firstSpeak.set(e.agent, e); });
  for (let step = 0; step < 200 && firstSpeak.size < OHD.OH_AGENTS.length; step += 1) {
    hive.step();
    for (let f = 0; f < 4; f += 1) {
      clock += 0.25;
      for (const r of rooms) {
        r.mount?.animate(clock, 0.25);
        for (const { agent } of r.mount?.placed ?? []) {
          const s = r.mount.avatars?.state(agent.id), fig = r.mount.avatars?.figure(agent.id), ev = firstSpeak.get(agent.id);
          if (!ev || seen.has(`${r.st}#${agent.id}`) || !s?.captionVisible) continue;
          const cap = fig?.children.find((o) => o.name === "aa-caption");
          if (s.caption === ev.caption && cap?.visible && cap.position.y > fig.userData.parts.head.position.y && /\(software agent\): /.test(s.caption)) seen.set(`${r.st}#${agent.id}`, s.caption);
        }
      }
    }
  }
  if (tier !== "low") {
    captionsWanted[tier] = rooms.reduce((a, r) => a + (r.mount?.placed.length ?? 0), 0);
    captions[tier] = seen.size;
  }
  // the budgets with the figures and their captions in
  for (const r of rooms) {
    const m = IXR.ixrMeasure(r.room), tex = m.textureBytes + signBytes, c = r.mount?.counts() ?? {};
    const inside = m.meshes <= IX.IX_BUDGET.meshes && m.triangles <= IX.IX_BUDGET.triangles[lt] && tex <= IXR.IXR_TEX_BUDGET[tier];
    roomsTiers += 1; if (inside) inBudget += 1;
    rows.push(`${r.st.padEnd(18)} ${tier.padEnd(9)} agents ${String(r.mount?.placed.length ?? 0).padStart(1)}  meshes ${r.before.meshes} → ${m.meshes}  tris ${r.before.triangles} → ${m.triangles}  textures ${fmtB(r.before.tex)} → ${fmtB(tex)} (of ${fmtB(IXR.IXR_TEX_BUDGET[tier])})  sprites +${c.sprites ?? 0}`);
    if (!inside) ok(false, `${tier}/${r.st}: inside IX_BUDGET and IXR_TEX_BUDGET with the agents in`, rows[rows.length - 1]);
  }
  // leaving: the sync disposes the mount and detaches the hive
  const r0 = rooms.find((r) => r.mount?.avatars);
  if (r0) {
    const kept = HW.hwSyncRoom(r0.mount, { room: r0.room, three: THREE, agents: hive.agents, source: hive, tier });
    const gone = HW.hwSyncRoom(r0.mount, { room: null, three: THREE, agents: hive.agents, source: hive, tier });
    if (tier === "high") ok(kept === r0.mount && gone === null && r0.mount.avatars.sources() === 0 && !r0.mount.avatars.root?.parent, "hwSyncRoom keeps the mount while the room stays open; on exit it disposes the figures and detaches the hive");
  }
  for (const r of rooms) r.mount?.dispose();
}
const RN = STYLES.length;
ok(expected === OHD.OH_AGENTS.length, `every hive agent is homed at one robot site with a robotics room: ${expected} of ${OHD.OH_AGENTS.length} across ${RN} rooms`);
ok(standing.high === expected && standing.balanced === expected, `agents standing at their room spots, in the room's group and facing the spot's yaw: ${standing.high} of ${expected} (high), ${standing.balanced} of ${expected} (balanced)`);
ok(standing.low === expected, `phone tier: the same ${standing.low} of ${expected} stand at their spots in the state machine, with no figure built (AGENT-AVATARS' phone rule)`);
ok(captions.high === captionsWanted.high && captions.balanced === captionsWanted.balanced && captions.high === expected, `the hive's captions show over the room figures (each agent's first line in a seeded run): ${captions.high} of ${captionsWanted.high} (high), ${captions.balanced} of ${captionsWanted.balanced} (balanced)`);
{
  delete globalThis.document; // the room's own textures as size stubs again
  const cell = IX.ixBuild("ixr-cell-hall", { three: THREE, tier: "high", site: IXR.ixrSiteFor(RB.RB_SITES.find((s) => s.id === "rb-site-soma-robot-cell"), null), dressers });
  const placed = HW.hwRoomAgents(cell, OHD.OH_AGENTS).map((p) => `${p.agent.key}@${p.spot.id}`);
  ok(placed.join(",") === "safety-steward@ixr-cell-pendant,auditor@ixr-cell-gate", "the cell hall: the steward on its role's spot (beside the pendant cart), the auditor on the free one (by the cell gate)", placed.join(", "));
  ok(IXR.ixrAgentSpot(cell, OHD.OH_AGENTS.find((a) => a.key === "safety-steward"))?.id === "ixr-cell-pendant" && IXR.ixrAgentSpot(cell, { id: "oh-trainer" })?.id === "ixr-cell-gate" && IXR.ixrAgentSpot(cell, { role: "safety-steward" })?.id === "ixr-cell-pendant", "ixrAgentSpot reads the hive agent's role key (its `role` is a sentence); { id: \"oh-<role>\" } and { role } still work");
}
ok(inBudget === roomsTiers, `rooms inside IX_BUDGET (≤ ${IX.IX_BUDGET.meshes} meshes, ${IX.IX_BUDGET.triangles.high}/${IX.IX_BUDGET.triangles.low} triangles) and IXR_TEX_BUDGET with the agents and captions in: ${inBudget} of ${roomsTiers} room-tiers`);
for (const r of rows) console.log(`    ${r}`);

// ------------------------------------------------------------------------------------------------ 2. one door
{
  const maps = [...new Set(RB.RB_SITES.map((s) => s.parish))];
  let doors = 0, onFx = 0, clear = 0; const bad = [];
  for (const id of maps) {
    const parish = NP.npParish(id);
    const ds = IXR.ixrDoorsFor(parish, { sites: RBW.rbSitesFor(parish), doorAt: (sid) => HW.hwFxDoorAt(FX.fxDoorFor(parish, sid)) });
    const boxes = FX.fxColliders(parish);
    for (const d of ds) {
      doors += 1;
      const fd = FX.fxDoorFor(parish, d.site.id);
      if (fd && Math.abs(d.x - fd.out[0]) < 1e-9 && Math.abs(d.z - fd.out[1]) < 1e-9 && d.face === fd.face) onFx += 1; else bad.push(`${d.site.id}: not the building door`);
      const inBox = boxes.some((b) => d.x > b.min[0] && d.x < b.max[0] && d.z > b.min[2] && d.z < b.max[2]);
      if (!inBox) clear += 1; else bad.push(`${d.site.id}: inside a collider box`);
    }
  }
  ok(doors === RB.RB_SITES.length && onFx === doors, `one door: every robot site's room opens at its exterior building's door (fxDoorFor's outside spot): ${onFx} of ${doors} on the ${maps.length} robot-site maps`, bad.slice(0, 3).join("; "));
  ok(clear === doors, `every room door spot stands outside every exterior collider box: ${clear} of ${doors}`);
  ok(HW.hwFxDoorAt({ x: 1, z: 2, face: "n", out: [3, 4] })?.x === 3 && HW.hwFxDoorAt(null) === null && HW.hwFxDoorAt({ x: 5, z: 6 })?.z === 6, "hwFxDoorAt: the outside spot, else the door, else null (no kit: the pad-side spot stays)");
}

// ------------------------------------------------------------------------------------------------ 3. the return into the room
{
  const here = "http://127.0.0.1:9101/parishes/dist/parishes.html";
  let good = 0;
  for (const st of STYLES) {
    const rb = RB.RB_SITES.find((s) => IXR.IXR_SITE_STYLE[s.id] === st), site = IXR.ixrSiteFor(rb, NP.npParish(rb.parish));
    const link = LK.lkStationLink(site.stations[0], { runner: "../smartcity/index.html", from: "parishes", page: "/parishes/dist/parishes.html", siteId: `${rb.parish}/${site.linkSite ?? site.id}`, returnHash: HW.hwReturnHash(site.style) });
    const target = PP.ppReturnTarget(link.split("?")[1], here);
    const u = target ? new URL(target.url) : null;
    if (u && u.origin === new URL(here).origin && PP.ppReturnSite(u.hash) === `${rb.parish}/${site.linkSite ?? site.id}` && HW.hwRoomFromHash(u.hash) === st) good += 1;
  }
  ok(good === STYLES.length, `a station launched from each robotics room returns to the same site with the room's style (#site=…&ixr=<style>): ${good} of ${STYLES.length}`);
  const plain = LK.lkStationLink("robot-cell", { from: "parishes", page: "/p.html", siteId: "sf-downtown/x" });
  ok(plain === "../smartcity/index.html?sim=robot-cell&from=parishes&return=%2Fp.html%23site%3Dsf-downtown%252Fx", "a link with no returnHash is unchanged", plain);
  ok(HW.hwRoomFromHash("#site=a%2Fb&ixr=ixr-cobot-lab") === "ixr-cobot-lab" && HW.hwRoomFromHash("#site=a%2Fb&ixr=not-a-room") === null && HW.hwRoomFromHash("", "?ixr=ixr-maint-bay") === "ixr-maint-bay" && HW.hwReturnHash("kitchen") === "", "hwRoomFromHash reads only a robotics style (anything else is ignored); hwReturnHash writes only one");
}

// ------------------------------------------------------------------------------------------------ 4. the wiring
{
  const app = read("WebXR/parishes/js/app.js"), src = read("WebXR/shared/hw-hive-world.js");
  const names = [...src.matchAll(/^(?:export\s+)?(?:const|let|var|function|class)\s+([A-Za-z_$][\w$]*)/gm)].map((m) => m[1]);
  ok(names.length > 0 && names.every((n) => /^(hw|HW_)/.test(n)), `hw-hive-world.js: every top-level name carries the hw/HW_ prefix (${names.length})`);
  ok(!/import \{[^}]*\bas\b[^}]*\}/.test(src) && !/\bfetch\(|XMLHttpRequest|WebSocket|sendBeacon|getUserMedia|speechSynthesis|SpeechRecognition/.test(src), "hw-hive-world.js: no import aliases, no network, no voice, no microphone");
  ok(/^import \{ hwSyncRoom, hwFxDoorAt, hwReturnHash, hwRoomFromHash \} from "\.\.\/\.\.\/shared\/hw-hive-world\.js";$/m.test(app), "parishes app imports the seams (the import line ends at its semicolon, for the flat bundler)");
  ok(/window\.__parishTest\.hive\?\.hive \?\? null; \/\/ HIVE-IN-WORLD/.test(app), "parishes app: the outdoor avatars attach the hive itself (the panel's api has no on() and no agents, so the seven were never embodied in the page)");
  ok(/hwFxDoorAt\(fxDoorFor\(parish, id\)\)/.test(app) && /hwReturnHash\(s\.style\)/.test(app) && /hwRoomFromHash\(location\.hash, location\.search\)/.test(app), "parishes app: the room door is the exterior door; a pad launched in a robotics room carries its style; arrival re-enters the room");
  ok(/if \(hwRoomMount\?\.room !== \(ixWorld\.room \?\? null\)/.test(app) && /hwRoomMount\?\.animate\(now \/ 1000, dt\)/.test(app) && /hwRoomMount\?\.avatars\?\.talkStart\(id\)/.test(app), "parishes app: the room's agents follow the open room every frame, animate, and take the voice's talk light");
  const bundler = read("tools/bundle_webxr.py"), i = bundler.indexOf('"parishes": {'), par = bundler.slice(i, bundler.indexOf('"entry"', i));
  ok(par.includes('SHARED / "hw-hive-world.js"') && par.indexOf('"aa-agent-avatars.js"') < par.indexOf('"hw-hive-world.js"') && par.indexOf('"ixr-robo-interiors.js"') < par.indexOf('"hw-hive-world.js"') && par.indexOf('"hw-hive-world.js"') < par.indexOf("parishes/js/app.js"), "bundle_webxr.py: hw-hive-world.js after the avatars and the robotics rooms, before the app");
  ok(read("tools/check_all.mjs").includes("check_hive_world.mjs") && /check_hive_world/.test(read("docs/perf/checkers-baseline.json")), "check_all.mjs lists this checker; checkers-baseline.json carries its estimated row");
}

console.log(`\n  eval: agents standing at their room spots ${standing.high} of ${expected} (rooms × agents, high; ${standing.balanced} balanced); rooms inside budget ${inBudget} of ${roomsTiers} room-tiers`);
console.log(failures ? `\ncheck_hive_world: ${failures} problem(s) found (${passes} passed).` : `\ncheck_hive_world: all ${passes} checks pass.`);
process.exit(failures ? 1 : 0);
