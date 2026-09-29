import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import { ppAward, ppCompleted, ppHerePage } from "../../shared/passport.js";
import { lkStationLink, lkStationLabel } from "../../shared/links.js";
import { ctlMount } from "../../shared/controls.js";
import { gdMount } from "../../shared/guide.js";
import { DW_REGIONS, DW_FIELD, dwRegionFromSearch, dwBuildRegion, dwConditionsAt, dwZoneAtRegion, dwFloorY } from "../../shared/dw-regions.js";

// The Deep at a Bay Program region (DEEPWATER, docs/consoles/DEEPWATER.md):
// opened from a parish map's shoreline dive entry (?region=&entry=&site=&from=)
// or from the Deep's menu. Swim over the region's seabed; the tide clock turns
// the schematic visibility and current (words, never figures); each dive site
// lists its real stations; reaching a site records it on the passport once;
// "Back to shore" returns to the map the dive entry came from.

const $ = (id) => document.getElementById(id);
const reduced = (() => { try { return matchMedia("(prefers-reduced-motion: reduce)").matches; } catch { return false; } })();
const phone = (() => { try { return matchMedia("(max-width: 700px)").matches; } catch { return false; } })();
const start = dwRegionFromSearch(location.search) ?? dwRegionFromSearch(`?region=${DW_REGIONS[0].id}`);
const { region, site: startSite, from } = start;

$("dw-title").textContent = region.name;
$("dw-frame").textContent = `${region.water} — ${region.frame.note}.`;
$("dw-project").innerHTML = "";
{
  const p = $("dw-project");
  p.append(`Bay Program project here: ${region.project.recipient} — ${region.project.what} (`);
  const a = document.createElement("a"); a.href = region.project.source; a.textContent = "EPA, 22 September 2026"; a.rel = "noopener";
  p.append(a, ").");
}
const back = $("dw-back");
back.href = from || "./underwater.html";
back.textContent = from ? "Back to shore" : "Back to the Deep";
for (const r of DW_REGIONS) {
  const a = document.createElement("a");
  a.href = `?region=${r.id}${from ? `&from=${encodeURIComponent(from)}` : ""}`; a.textContent = r.name; a.className = r.id === region.id ? "on" : "";
  $("dw-regions").append(a);
}

// scene
const renderer = new THREE.WebGLRenderer({ antialias: !phone });
renderer.setPixelRatio(Math.min(devicePixelRatio || 1, phone ? 1.5 : 2));
renderer.setSize(innerWidth, innerHeight);
$("stage").append(renderer.domElement);
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(65, innerWidth / innerHeight, 0.3, 900);
scene.add(new THREE.HemisphereLight(0xbfe8ff, 0x3a3020, 0.9));
const sun = new THREE.DirectionalLight(0xffffff, 0.6); sun.position.set(80, 200, -60); scene.add(sun);
const built = dwBuildRegion(THREE, scene, region.id, { tier: phone ? "phone" : "high", reducedMotion: reduced });
scene.fog = new THREE.FogExp2(built.fogFor({ visibility: 0.5 }).color, 0.02);
scene.background = built.fogFor({ visibility: 0.5 }).color;

const diver = { x: startSite.position[0], z: startSite.position[1] - 14, y: 0, yaw: Math.PI, pitch: -0.25 };
diver.y = dwFloorY(region.id, diver.x, diver.z) + 5;
let hours = Number($("dw-tide").value) || 3;
$("dw-tide").addEventListener("input", (e) => { hours = Number(e.target.value); });

// sites
function renderSites(near) {
  const list = $("dw-sites"); list.innerHTML = "";
  for (const s of region.sites) {
    const li = document.createElement("li");
    const h = document.createElement("b"); h.textContent = s.name + (s.id === near?.id ? " — you are here" : ""); li.append(h);
    const ul = document.createElement("ul");
    for (const st of s.stations) {
      const i = document.createElement("li"), a = document.createElement("a");
      a.href = lkStationLink(st, { from: "underwater", page: ppHerePage(), siteId: s.id, extra: `&region=${region.id}` });
      a.textContent = (lkStationLabel?.(st) ?? st) + (ppCompleted(st) ? " ✓" : "");
      i.append(a); ul.append(i);
    }
    li.append(ul); list.append(li);
  }
}
renderSites(startSite);

// input
const keys = new Set();
addEventListener("keydown", (e) => keys.add(e.key.toLowerCase()));
addEventListener("keyup", (e) => keys.delete(e.key.toLowerCase()));
let drag = null;
renderer.domElement.addEventListener("pointerdown", (e) => { drag = [e.clientX, e.clientY]; });
addEventListener("pointerup", () => { drag = null; });
addEventListener("pointermove", (e) => {
  if (!drag) return;
  diver.yaw -= (e.clientX - drag[0]) * 0.005; diver.pitch = Math.max(-1.2, Math.min(0.6, diver.pitch - (e.clientY - drag[1]) * 0.004));
  drag = [e.clientX, e.clientY];
});
addEventListener("resize", () => { camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix(); renderer.setSize(innerWidth, innerHeight); });

let visited = null, last = performance.now();
function frame(now) {
  const dt = Math.min(0.05, (now - last) / 1000); last = now;
  const c = dwConditionsAt(region.id, diver.x, diver.z, hours);
  const f = (keys.has("w") || keys.has("arrowup") ? 1 : 0) - (keys.has("s") || keys.has("arrowdown") ? 1 : 0);
  const t = (keys.has("d") || keys.has("arrowright") ? 1 : 0) - (keys.has("a") || keys.has("arrowleft") ? 1 : 0);
  diver.yaw -= t * dt * 1.4;
  const speed = 6 * (1 - 0.5 * c.current);
  diver.x = Math.max(DW_FIELD.minX, Math.min(DW_FIELD.maxX, diver.x - Math.sin(diver.yaw) * f * speed * dt));
  diver.z = Math.max(DW_FIELD.minZ, Math.min(DW_FIELD.maxZ, diver.z - Math.cos(diver.yaw) * f * speed * dt));
  const floor = dwFloorY(region.id, diver.x, diver.z);
  diver.y += ((keys.has("e") || keys.has(" ") ? 1 : 0) - (keys.has("q") || keys.has("shift") ? 1 : 0)) * 3 * dt;
  diver.y = Math.max(floor + 1.5, Math.min(-0.8, diver.y));
  camera.position.set(diver.x, diver.y, diver.z);
  camera.rotation.set(diver.pitch, diver.yaw, 0, "YXZ");
  const fog = built.fogFor(c); scene.fog.density = fog.density;
  built.animate(now / 1000, c);
  $("dw-zone").textContent = dwZoneAtRegion(region.id, diver.x, diver.z).name;
  $("dw-cond").textContent = `${c.words.stage} · visibility ${c.words.visibility} · current ${c.words.current}`;
  $("dw-call").textContent = c.call;
  const near = region.sites.find((s) => Math.hypot(s.position[0] - diver.x, s.position[1] - diver.z) < 18) ?? null;
  if (near && near.id !== visited) {
    visited = near.id;
    ppAward("dw-region", { reputation: 1, reason: `Dived ${near.name} (${region.name})`, attemptId: near.id });
    renderSites(near);
  }
  renderer.render(scene, camera);
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);

// The platform chrome (the Home chip in the nav, the controls card and the Guide), as on the Deep's own page.
gdMount();
ctlMount({
  world: "the Deep's Bay Program regions",
  unique: [
    { label: "Rise / sink", keys: ["E or Space", "Q or Shift"], pad: "—", touch: "—" },
    { label: "Tide clock", keys: ["the slider"], pad: "—", touch: "Drag the slider" },
  ],
});
