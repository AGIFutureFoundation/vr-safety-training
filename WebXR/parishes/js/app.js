import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import { ctlMount } from "../../shared/controls.js";
import { gdMount } from "../../shared/guide.js";
import { createGamepad, GAMEPAD_DEADZONE } from "../../shared/input.js";
import { tcTier, tcTierChoice, tcApplyRenderer } from "../../shared/perf.js";
import { tcMountTouch, tcMountQuality } from "../../shared/touch.js";
import { weatherFor } from "../../shared/weather.js";
import { buildSky } from "../../shared/sky.js";
import { buildWildlife } from "../../shared/wildlife.js";
import { mgMountLife } from "../../shared/mg-life.js";
import { ppCompleted, ppHerePage, ppReturnSite, ppRecords, ppAward, ppAwarded } from "../../shared/passport.js";
import { tyEarn, tyLedger, tySettle, tyTick, tySignsFor, tyMountLedger, tyBoardRows, tySetRecorder, TY_CURRENCY } from "../../shared/ty-economy.js";
import { lkStationLink, lkStationLabel, lkWorldLink } from "../../shared/links.js";
import { mapboxToken } from "../../shared/mapbox.js";
import { qmMountSideGames, qmBoardRows, qmLockToast } from "../../shared/skill-gates-ui.js";
import { qmIsOpen, qmSnapshot } from "../../shared/skill-gates.js";
import { slGamesFor, slResolveSite, slMountPathBoard } from "../../shared/sl-parish-play.js";
import { NP_PARISHES, npParish, npResolveConnectors, npRegion, npRegionOf, npRegionGroups } from "../../shared/np-parishes.js";
import { NP_SIZE, NP_ROAD_KINDS, npHeightAt, npWaterAt, npDistrictAt, npHillAt, npPlace, npStartSite } from "../../shared/np-parish.js";
import { npSatelliteUrl, npGroundUvMatrix, npScale } from "../../shared/np-geo.js";
// GEO (docs/geo.md): opt-in Find me (memory only), the baked Sentinel-2 backdrop and the live satellite layer (off by default).
import { GEO_CREDIT, geoAllowed, geoIsK12, geoMountFindMe, geoLoadBackdrop, geoMountLive } from "../../shared/geo-locate.js";
import { gtProfile } from "../../shared/profiles.js";
import { dnVersion } from "../../shared/dn-modules.js";
import { rlPrepareRelief, RL_BUDGET } from "../../shared/rl-relief.js";
import { npBuildParish, npWaterShapes } from "../../shared/np-world.js";
// FACADES: exterior detail and generic storefront signs on the massing (sets NP_MASSING_HOOKS.details; docs/consoles/FACADES.md).
import { fcDetails } from "../../shared/fc-facades.js";
// DETAIL: seeded instanced scatter (street kit, yards, roofs, vegetation, marsh, farm, industry, site clutter), one pool.
import { dtMountDetail } from "../../shared/dt-detail.js";
import { paMount } from "../../shared/pa-palette.js";
import { PA_CATEGORIES } from "../../shared/pa-palette-data.js";
// LANDMARKS-2: walk-in landmark interiors (market hall, lamp room, pier shed, glasshouse) — generic, schematic rooms.
import { lxWalkinDoors, lxWalkin } from "../../shared/lx-walkin.js";
import { tfWind, tfReducedMotion } from "../../shared/tf-water.js";
import { tfWaterDepthAt, tfFlowAt, tfLitterAt } from "../../shared/tf-terraform.js";
import { tfMountTerraform, tfMountRain } from "../../shared/tf-world.js";
import { cwMassFilter, cwStreets, cwColliders, cwSidewalkAt, cwSiteBuilding, cwDoorOf } from "../../shared/cw-cityworks.js";
import { ixMountInteriors, ixTycoonStyle, ixDoorSpot, ixRegisterDresser, IX_KIND_STYLE } from "../../shared/ix-interiors.js";
import { cwMountStreets } from "../../shared/cw-streets-world.js";
import { grMount } from "../../shared/npc.js";
import { dvMountMotorPool } from "../../shared/drivables-board.js";
import { dvById } from "../../shared/drivables-data.js";
import { nwMountPhysics } from "../../shared/nw-drive.js";
import { mvMountMotorworks, mvDriveEntry, mvPlacements } from "../../shared/mv-world.js";
import { nwParishColliders } from "../../shared/nw-physics.js";
// WALKABLE (docs/consoles/WALKABLE.md): walk-through connectors, soft edges, the region atlas and solid parked vehicles.
import { wkPair, wkCarry, wkArrival, wkEdge, wkClamp, wkAtlas, wkSolidBoxes, wkColliderSeam, WK_TRIGGER, WK_REARM, WK_FADE_MS } from "../../shared/wk-walkable.js";
import { kwKiosksFor, kwMountQuestBoard, kwGriotSites } from "../../shared/kw-play-data.js";
// PLAYLAYER: the Bay Area maps' path board and side quests (the New Orleans shapes, read from each map's own lessons).
import { plMountPathBoard, plMountQuestBoard } from "../../shared/pl-bay-play.js";
import { cpPlaceInParish } from "../../shared/cp-cleanports.js";
import { kwDressParish } from "../../shared/kw-kits.js";
import { npLoad, npSave, npVisit, npVisited, npAnswerLesson } from "./state.js";
import { stChosenPath, stPromptsOn } from "../../shared/st-paths.js";
import { stMountPaths } from "../../shared/st-stories.js";
import { pkPacks, pkPacksAt, PK_BRAND_LINE } from "../../shared/pk-packs.js";
import { Auth } from "../../shared/auth.js";
import { dnApplyModule, dnSetEnterprise, dnUsePacks, dnUseSessions } from "../../shared/dn-modules.js";
import { scSessions } from "../../shared/sc-scholar.js";
import { byLessonsFor } from "../../shared/by-parish-lessons.js";
import { scMountSession } from "../../shared/sc-session-ui.js";
import { esSessionLessons } from "../../shared/es-bay-lessons.js";
import { lkSessionLessons } from "../../shared/lk-la-lessons.js"; // LA-K12: Louisiana K-12 lessons at the Louisiana map sites
import { cgMountRunner, cgWorldReport } from "../../shared/cg-runner.js";
import { AT_BUCKET_HOUR, atWeather, atWeatherOf, atSkyKind, atDarken, atFog, atSoundMix } from "../../shared/at-atmos.js";
import { atMountAtmos, atNearness } from "../../shared/at-world.js";
import { atMountSound } from "../../shared/at-sound.js";
import { drMountDrills, drSetRecorder } from "../../shared/dr-drills.js";
import { rbMountRobotics, rbGamesFor, rbRegisterMechanics } from "../../shared/rb-world.js";
import { uxMountTabs, uxOnboarding } from "../../shared/ux-menu.js";
import { dxMountConsent } from "../../shared/dx-consent-ui.js";
import { dxCaptureLesson, dxCaptureDrill } from "../../shared/dx-world.js";
// CLEANPORTS: key the zero-emission port stations to BAYMAP's West Oakland sites (a no-op until that map merges).
cpPlaceInParish(npParish);
// BAYQUEST: the Bay Program play board (games, the Bay Keeper's Trail, Crew Credits) under the ledger; importing it
// registers its two businesses with TYCOON and its side stories with STORYLINE (docs/consoles/BAYQUEST.md).
import { bqMount, bqNear, bqFind } from "../../shared/bq-bayquest.js";
import { bqGamesFor } from "../../shared/bq-games-data.js";
import { dwShoreEntriesFor } from "../../shared/dw-regions.js";
import { psMountProjectSim, psSetRecorder, psRegisterSims } from "../../shared/ps-projectsim.js";
// UNIONSIMS: the craft simulations register with PROJECTSIM's boards on import (docs/consoles/UNIONSIMS.md).
import { usSims } from "../../shared/us-unionsims.js";
// LA-PROGRAMME: the Louisiana programme's simulations join PROJECTSIM's boards at their fixed sites — guarded: a place counts only
// when its map is in this tree and the site is on it (docs/consoles/LA-PROGRAMME.md).
import { lpRegisterSims } from "../../shared/lp-programme.js";
lpRegisterSims({ psRegisterSims, lookup: npParish });
import { crMountClassrooms, crRegisterDressers } from "../../shared/cr-classrooms.js";
import { larRegisterDressers } from "../../shared/lar-rooms.js";
import { hvMount } from "../../shared/hv-harvest.js";
import { smilesMount } from "../../shared/sm-smiles.js";

// The parishes — the app: a first-person walker over one streamed parish
// (`?parish=<id>`), the parish selector, the HUD with its map of districts
// and connectors, job boards that open real stations by trade and bring the
// learner back, field lessons, day/night and weather, and the satellite
// ground when a viewer has a Mapbox token (nothing is requested otherwise).

const $ = (id) => document.getElementById(id);
const NP_RUNNER = "../smartcity/index.html";
const NP_EYE = 1.7;
const NP_TIMES = ["dawn", "day", "dusk", "night"];
const NP_WEATHERS = ["clear", "overcast", "fog", "wind", "storm", "live"]; // "live": ATMOS's seeded weather for this parish and hour

// Which parish: ?parish=, else the parish of a return's site (`#site=<parish>/<site>`), else the first.
const npParams = new URLSearchParams(location.search);
const npReturn = ppReturnSite(location.hash, location.search);
const npReturnParish = npReturn?.includes("/") ? npReturn.split("/")[0] : null;
const parish = npParish(npParams.get("parish") ?? npReturnParish ?? "") ?? NP_PARISHES[0];
const npReturnSiteId = npReturn ? npReturn.split("/").pop() : null;
// The map's region (console GOLDEN-A): the page title, and whether a map is a parish or a district, follow it.
const npRegionHere = npRegion(npRegionOf(parish)) ?? { id: "new-orleans", name: "New Orleans", title: "New Orleans Parishes", noun: "parish", nouns: "parishes" };

const np = { state: npLoad(), playing: false, yaw: 0, pitch: 0.02, x: 0, z: 0, timeIdx: 1, weatherIdx: 0, near: null, modal: null };
// TYCOON's HUD figure and play clock (declared early: npBegin may draw the HUD before the TYCOON block below runs).
let tyBalance = 0, tyClock = 0, tyLedgerUi = null;

let npToastT = 0;
function npToast(text, ms = 3200) { const t = $("toast"); t.textContent = text; t.classList.add("on"); clearTimeout(npToastT); npToastT = setTimeout(() => t.classList.remove("on"), ms); }

// ------------------------------------------------------------------ scene

const npTierName = tcTierChoice().tier;
const npTierSet = tcTier();
const npRenderer = new THREE.WebGLRenderer({ antialias: npTierName !== "low", preserveDrawingBuffer: true });
tcApplyRenderer(npRenderer, npTierSet);
npRenderer.setSize(innerWidth, innerHeight);
$("stage").appendChild(npRenderer.domElement);
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xbcd8ea);
scene.fog = new THREE.Fog(0xbcd8ea, 300, 2200);
const camera = new THREE.PerspectiveCamera(65, innerWidth / innerHeight, 0.3, 6000);
const root = new THREE.Group(); scene.add(root);
const hemi = new THREE.HemisphereLight(0xe8f2ff, 0x4a4030, 1.0);
const sun = new THREE.DirectionalLight(0xfff1d8, 1.1); sun.position.set(500, 800, -300);
root.add(hemi, sun);

const npStart = npPlace(parish, npReturnSiteId ?? npParams.get("site") ?? "") ?? npStartSite(parish);
np.x = npStart.position[0]; np.z = npStart.position[1] + 16;
// WALKABLE: arriving through a walk-through connector — stand onward of the paired connector, facing on, with the
// carried time of day and weather (path, Crew Credits and the passport are in the learner's storage already).
const wkArrive = wkArrival(npParams, parish);
if (wkArrive) {
  np.x = wkArrive.landing[0]; np.z = wkArrive.landing[1]; np.yaw = wkArrive.yaw;
  if (wkArrive.time != null) np.timeIdx = Math.max(0, Math.min(NP_TIMES.length - 1, wkArrive.time));
  if (wkArrive.weather != null) np.weatherIdx = Math.max(0, Math.min(NP_WEATHERS.length - 1, wkArrive.weather));
  history.replaceState(null, "", `?parish=${encodeURIComponent(parish.id)}`); // a reload starts at the start, not mid-crossing
}
if (npStart.stations) npVisit(np.state, parish.id, npStart.id);

// RELIEF (docs/consoles/RELIEF.md, docs/mapbox.md): with a viewer's Mapbox token, real relief from Terrain-RGB tiles of this
// map's lon/lat box, scaled into its schematic range, is handed to npHeightAt before the world is built, so every feature
// seats on the same ground (pads terraced, water level). No token: no await, no request, the schematic ground unchanged.
// The phone tier asks for none; a failed or slow tile (bounded wait) leaves the schematic ground.
const rlRelief = mapboxToken() ? await rlPrepareRelief(parish, { tier: npTierName }) : null;
void fcDetails; // registered on import, before the first chunk builds
// PALETTE (docs/consoles/PALETTE.md): colour categories and one textured material per building kind (none on the phone).
const paPalette = paMount({ tier: npTierName });
const dtPool = dtMountDetail(root, THREE, parish, { tier: npTierName });
const world = npBuildParish(root, THREE, parish, { tier: npTierName, start: [np.x, np.z], massFilter: cwMassFilter(parish) });
// LANDMARKS-2: doors at walk-in kit landmarks; INTERIORS' shell (globalThis.IX_INTERIORS) is used when it lands, guarded.
const lxDoors = typeof lxWalkinDoors === "function" ? lxWalkinDoors(world.lmKits ?? []) : [];
const npLandmarkName = (id) => (parish.landmarks ?? []).find((l) => l.id === id)?.name ?? "the landmark";
const lxRoom = typeof lxWalkin === "function" ? lxWalkin({ three: THREE, scene, outdoor: root, tier: npTierName, ix: globalThis.IX_INTERIORS }) : null;
// CITYWORKS: the street fabric (AUTHORED procedural, not the real grid), kerbs, sidewalks, crosswalks, streetlights and
// site doors, streamed with the chunks; the massing keeps off the streets and the walk stops at walls (docs/consoles/CITYWORKS.md).
const cwStreetsMount = cwMountStreets({ THREE, root, parish, tier: npTierName });
cwStreetsMount.update(np.x, np.z, 999);
// KREWE's kits by district character and site kind: one InstancedMesh per kit (docs/consoles/KREWE.md).
const kwDress = kwDressParish(root, THREE, parish, { tier: npTierName });
// TERRAFORM: streams, ditches and culverts, animated water, wind-swayed grass, bushes and litter per chunk (docs/consoles/TERRAFORM.md).
const tfLand = tfMountTerraform({ THREE, root, parish, tier: npTierName, reduced: tfReducedMotion(), waters: world.waters, trees: world.treeMaterial });
tfLand.update(np.x, np.z, 99);
const tfRain = tfMountRain({ THREE, root, tier: npTierName, reduced: tfReducedMotion() });
const connectors = npResolveConnectors(parish);
// ATMOS: lit windows, porch and site lights at dusk (one instanced mesh), fog banks over water, a wet sheen on the
// streets after rain, storm darkening, and a synthesised soundscape muted by default (docs/consoles/ATMOS.md).
const atWetMats = []; cwStreetsMount.group.traverse((o) => { if (o.isMesh && /^cw-streets-/.test(o.name) && !atWetMats.includes(o.material)) atWetMats.push(o.material); });
for (const m of world.roadMeshes ?? []) if (m?.material && !atWetMats.includes(m.material)) atWetMats.push(m.material);
const atmos = atMountAtmos({ THREE, root, parish, tier: npTierName, reduced: tfReducedMotion(), massFilter: cwMassFilter(parish), siteLights: world.siteBoards, wetMaterials: atWetMats });
atmos.update(np.x, np.z);
const atSound = atMountSound({ reduced: tfReducedMotion() });
let atWeatherNow = null, atSoundT = 1, atMix = null;
{
  const b = document.createElement("button");
  b.id = "at-sound"; b.type = "button"; b.setAttribute("aria-pressed", "false"); b.textContent = "Sound: off";
  b.title = tfReducedMotion() ? "Sound stays off while reduced motion is set" : "Turn the synthesised soundscape on or off";
  b.addEventListener("click", () => { const on = atSound.setEnabled(!atSound.enabled()); b.textContent = on ? "Sound: on" : "Sound: off"; b.setAttribute("aria-pressed", String(on)); });
  // INTERFACE: the sound toggle lives in the menu's Me tab (settings), not floating over the world.
  const mount = document.getElementById("menu-sound");
  if (mount) { b.className = "btn"; mount.appendChild(b); }
  else { b.style.cssText = "position:fixed;right:12px;bottom:12px;z-index:30;padding:6px 10px;border-radius:8px;border:1px solid #fff6;background:#0009;color:#fff;font:13px system-ui"; document.body.appendChild(b); }
}

// NEWTON's physics (docs/consoles/NEWTON.md): gravity, walls, wading and swimming for the walk, props that tumble,
// and the Motor Pool's drive mode with crash response. TERRAFORM's water and flow and CITYWORKS' colliders are read
// when their modules are on the page (the coordinator passes them in here); the parish's own ground, water and
// building footprints stand in until then.
const npReduced = typeof matchMedia === "function" && matchMedia("(prefers-reduced-motion: reduce)").matches;
// WALKABLE: MOTORWORKS' parked vehicles are solid in the walk (the module guarded: absent until MOTORWORKS merges).
// (Static now that MOTORWORKS is merged: the same placements its mount parks, checked against TERRAFORM's water depth.)
let wkParked = [];
try { wkParked = mvPlacements(parish, { waterDepthAt: (x, z) => tfWaterDepthAt(parish, x, z) }, { tier: npTierName }); } catch { wkParked = []; }
const wkColliders = wkColliderSeam(cwColliders, nwParishColliders, wkSolidBoxes(wkParked, (x, z) => npHeightAt(parish, x, z)));
const nwPhys = nwMountPhysics({
  three: THREE, root, parish, tier: npTierName, reduced: npReduced,
  seams: { tfWaterDepthAt, tfFlowAt, cwColliders: wkColliders, tfLitterAt }, // TERRAFORM's water and litter, CITYWORKS's colliders (+ WALKABLE's parked vehicles)
  link: (id) => npLink(id, null),
  onCard: () => { npKeys.clear(); drWorld?.offer("dr-traffic"); }, // DRILLS: the card becomes the traffic incident drill
});
nwPhys.place(np.x, np.z);
// MOTORWORKS (docs/consoles/MOTORWORKS.md): parked Motor Pool vehicles of fitting classes at fitting sites, two
// instanced meshes per map; E at one walks its pre-trip on the board (the gate contract) and drives it from its bay
// with its class's handling. PALETTE's colour categories give the liveries when that module is on the page (guarded).
const mvPark = mvMountMotorworks({ three: THREE, root, parish, world: nwPhys.world, tier: npTierName, categories: PA_CATEGORIES });
let mvPending = null, mvDriving = null;
function mvExitDrive() {
  const out = nwPhys.exitDrive();
  if (mvDriving) { mvPark.show(mvDriving.id); mvDriving = null; }
  return out;
}
function mvUse(p) {
  const pr = mvPark.prompt(p);
  if (!pr.open) npToast(`${p.entry.name}: locked. Qualify at ${pr.missing.map((m) => m.label ?? m.id).join(", ")} — the Motor Pool board links the station.`, 6000);
  mvPending = pr.open ? p : null;
  asOpenMotorPool();
  const row = $("dv-board")?.querySelector(`[data-dv-id="${p.drivable}"]`);
  if (row) { row.querySelector(`[data-dv-open="${p.drivable}"]`)?.click(); row.scrollIntoView?.({ block: "center" }); }
}
let nwMode = "walk";

// INTERIORS (docs/consoles/INTERIORS.md): every site building has a door on CITYWORKS' road face; the door spot stands
// 1.4 m outside the footprint. "E — go inside" builds a generic room for the site's kind (never the real building's
// interior): the world root (sky, chunks, streets, water, atmosphere) is hidden and stops updating, the walk runs on
// NEWTON's avatar step against the room's walls, the site's board and stations open from inside, and the door returns the
// learner to the exact outdoor pose they entered from.
const ixDoors = parish.sites.map((s0, i) => {
  try {
    const b = cwSiteBuilding(parish, i), spot = ixDoorSpot(cwDoorOf(parish, b));
    const site = parish.sites.find((s) => s.id === b.site.id) ?? s0;
    return { site, ...spot };
  } catch { return null; }
}).filter(Boolean);
const ixWorld = ixMountInteriors({
  three: THREE, scene, hide: [root], tier: npTierName,
  onBoard: (s) => npOpenBoard(s),
  onLaunch: (id, s) => { location.href = npLink(id, s.id); },
  onToast: (m) => npToast(m, 5200),
});
// TYCOON: a rented room or shop has its own door 4 or 7 m along the same face, opening into a matching interior.
let ixRentals = [], ixRentalsT = -1e9;
function ixRentalDoors() {
  const now = performance.now();
  if (now - ixRentalsT < 2000) return ixRentals;
  ixRentalsT = now;
  const led = tyLedger();
  const biz = led.business ? { id: led.business.id, listing: led.business.listing, name: led.business.name } : null;
  ixRentals = led.rentals.filter((r) => r.parish === parish.id).map((r) => {
    const d = ixDoors.find((x) => x.site.id === r.site);
    if (!d) return null;
    const along = d.face === "e" || d.face === "w" ? [0, 1] : [1, 0]; // along the face the site door is on
    const here = biz?.listing === r.id ? biz : null;
    const shift = r.type === "shop" ? 7 : 4;
    return { site: d.site, x: d.x + along[0] * shift, z: d.z + along[1] * shift, style: ixTycoonStyle(r, here),
      title: here ? `${here.name} — ${TY_CURRENCY} play business` : `${r.type === "room" ? "Your room" : "Your shop"} — rented in ${TY_CURRENCY}` };
  }).filter(Boolean);
  return ixRentals;
}
window.ixWorld = ixWorld; // the headless round-trip test drives it (docs/consoles/INTERIORS.md)
const NW_MODE_TOAST = { wade: "Wading: slower going — keep your footing and watch the current.", swim: "Swimming: slower, and the current carries you. The breath meter is a readiness cue — head for the shore to rest." };

// The satellite ground: only with a viewer's token (docs/mapbox.md); the procedural ground stays otherwise.
{
  const token = mapboxToken();
  const url = token ? npSatelliteUrl(parish, token, { longSide: (RL_BUDGET[npTierName] ?? RL_BUDGET.balanced).drapeSide }) : null; // RELIEF: capped by tier
  if (url) {
    const loader = new THREE.TextureLoader(); loader.setCrossOrigin?.("anonymous");
    loader.load(url, (tex) => {
      if (!tex) return;
      tex.colorSpace = THREE.SRGBColorSpace; tex.matrixAutoUpdate = false; tex.matrix.set(...npGroundUvMatrix(parish));
      world.setGroundTexture(tex); npToast(rlRelief ? "Satellite ground and relief: Mapbox imagery and terrain of the map's box, relief scaled to the map." : "Satellite ground: a Mapbox image of the parish's box.", 4000);
    }, undefined, () => {});
  }
}

// GEO (docs/geo.md): the baked Sentinel-2 backdrop of this map (atlas and map backdrop; an optional satellite ground, off by
// default), the opt-in Find me (a trusted press, memory only, never stored, sent or logged; off in demo and signed-out
// sessions, and in K-12 class sessions unless the teacher's DEAN version turns it on) and the live layer (off by default).
let geoBackdrop = null, geoPin = null, geoGroundOn = false, geoBeacon = null;
geoLoadBackdrop(parish.id).then((img) => { geoBackdrop = img; if (img && np.modal === "map") npRenderMap(); const b = $("geo-ground"); if (b) b.disabled = !img; });
{
  const gb = $("geo-ground");
  if (gb) {
    gb.disabled = true;
    gb.addEventListener("click", () => {
      if (!geoBackdrop) return;
      geoGroundOn = !geoGroundOn;
      if (geoGroundOn) { const tex = new THREE.Texture(geoBackdrop); tex.colorSpace = THREE.SRGBColorSpace; tex.needsUpdate = true; world.setGroundTexture(tex); }
      else world.setGroundTexture(null);
      gb.setAttribute("aria-pressed", String(geoGroundOn)); gb.textContent = `Satellite ground: ${geoGroundOn ? "on" : "off"}`;
      $("geo-ground-credit").hidden = !geoGroundOn;
    });
  }
  const geoGate = () => {
    let version = null; try { version = dnVersion(); } catch (_) { version = null; }
    let path = null; try { path = stChosenPath(); } catch (_) { path = null; }
    return geoAllowed({ profile: gtProfile(), k12: geoIsK12({ search: location.search, version, path }), version, demo: npParams.has("demo") });
  };
  geoMountFindMe({ el: $("geo-find"), maps: NP_PARISHES, current: parish, allowed: geoGate, onHere: (r) => {
    geoPin = r?.pin ?? null;
    if (geoBeacon) { root.remove(geoBeacon); geoBeacon = null; }
    if (geoPin) {
      geoBeacon = new THREE.Mesh(new THREE.ConeGeometry(3, 12, 12), new THREE.MeshLambertMaterial({ color: 0xe0245e, emissive: 0x5a0a20 }));
      geoBeacon.rotation.x = Math.PI; geoBeacon.name = "geo-you-are-here";
      geoBeacon.position.set(geoPin[0], npHeightAt(parish, geoPin[0], geoPin[1]) + 14, geoPin[1]); root.add(geoBeacon);
    }
    if (np.modal === "map") npRenderMap();
  } });
  geoMountLive({ el: $("geo-live"), map: parish });
  for (const id of ["geo-credit", "geo-ground-credit"]) { const c = $(id); if (c) c.textContent = GEO_CREDIT; }
}

let sky = null, npRecipe = null;
function npApplySky() {
  if (sky) root.remove(sky.root);
  const atHour = AT_BUCKET_HOUR[NP_TIMES[np.timeIdx]] ?? 12, atLive = NP_WEATHERS[np.weatherIdx] === "live";
  const atNear = atNearness(parish, np.x, np.z);
  atWeatherNow = atLive ? atWeather(parish.id, atHour, 1, { nearWater: atNear.water > 0.5 }) : atWeatherOf(NP_WEATHERS[np.weatherIdx], atHour);
  const weather = weatherFor(atLive ? atSkyKind(atWeatherNow) : NP_WEATHERS[np.weatherIdx]);
  sky = buildSky(root, { time: NP_TIMES[np.timeIdx], weather, radius: 3000 });
  npRecipe = sky.recipe;
  const atDim = atDarken(atWeatherNow), atShade = (hex) => new THREE.Color(hex).multiplyScalar(atDim).getHex();
  scene.background.setHex(atShade(npRecipe.sky));
  scene.fog.color.setHex(atShade(npRecipe.fog));
  const vis = Math.max(800, (npRecipe.visibility ?? 1200) * 2.0) / (npTierSet.fogScale ?? 1);
  // ATMOS's fog: thicker in a fog bank over water, never so thick that a site board is lost inside its read distance.
  const atF = atFog({ weather: atWeatherNow, band: atWeatherNow.band, nearWater: atNear.water });
  scene.fog.near = Math.min(vis * 0.15, atF.near); scene.fog.far = Math.min(vis, atF.far);
  atmos.set({ hour: atHour, weather: atWeatherNow });
  const night = NP_TIMES[np.timeIdx] === "night";
  sun.intensity = (night ? 0.12 : NP_TIMES[np.timeIdx] === "day" ? 1.1 : 0.6) * atDim; // a storm front darkens the light
  hemi.intensity = (night ? 0.25 : 0.95) * atDim;
  cwStreetsMount.setNight(night || NP_TIMES[np.timeIdx] === "dusk");
  $("hud-clock").textContent = NP_TIMES[np.timeIdx];
  $("hud-weather").textContent = NP_WEATHERS[np.weatherIdx];
  tfRain?.set(NP_WEATHERS[np.weatherIdx] === "storm" || atWeatherNow.rain > 0.3); // the front drives TERRAFORM's wind-slanted rain
}
npApplySky();

// Wildlife that fits a delta, from the shared budget table: egrets wading at
// the wetland, pelicans over the lake, herons gliding along the river.
const npWetland = parish.water.find((w) => w.kind === "wetland");
const npLake = parish.water.find((w) => w.kind === "lake" || w.kind === "gulf" || w.kind === "bay" || w.kind === "ocean");
const npRiver = parish.water.find((w) => w.kind === "river");
const npMid = (poly) => poly.reduce((a, p) => [a[0] + p[0] / poly.length, a[1] + p[1] / poly.length], [0, 0]);
const npWild = [];
if (npWetland) { const c = npMid(npWetland.poly); npWild.push(buildWildlife(root, { zone: { x: c[0], z: c[1], w: 120, d: 120, y: -0.1 }, kind: "egrets", count: 5 })); }
if (npLake) { const c = npMid(npLake.poly); npWild.push(buildWildlife(root, { zone: { x: c[0], z: Math.max(c[1], -1900), w: 600, d: 200, y: 0 }, kind: "pelicans", count: 4 })); }
if (npRiver) { const c = npRiver.poly[Math.floor(npRiver.poly.length / 2)]; npWild.push(buildWildlife(root, { zone: { x: c[0], z: c[1], w: 500, d: 160, y: 0 }, kind: "herons", count: 3 })); }

// MENAGERIE: pets, animals and passers-by on the streets (docs/consoles/MENAGERIE.md), one InstancedMesh per kind.
// CITYWORKS's sidewalks and colliders are passed (cwSidewalkAt, cwColliders), and the vehicle NEWTON drives is the threat
// animals flee and passers-by step aside from. The night routine re-places life when T reaches night.
let mgLife = null;
function mgRemount() {
  mgLife?.dispose();
  const cwSide = cwSidewalkAt, cwCol = cwColliders; // CITYWORKS, by import
  mgLife = mgMountLife({
    three: THREE, root, parish, tier: npTierName, night: NP_TIMES[np.timeIdx] === "night",
    groundAt: (x, z) => Math.max(npHeightAt(parish, x, z), 0),
    sidewalkAt: typeof cwSide === "function" ? (x, z) => cwSide(parish, x, z) : undefined,
    colliders: typeof cwCol === "function" ? (key) => cwCol(parish, key) : undefined,
    pos: () => (np.playing && !np.modal ? [np.x, np.z] : null),
    threats: () => (nwPhys.driving() ? [[nwPhys.vehicle.x, nwPhys.vehicle.z]] : []), // NEWTON's vehicle while the learner drives
  });
}
mgRemount();

addEventListener("resize", () => { camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix(); npRenderer.setSize(innerWidth, innerHeight); });

// ------------------------------------------------------------------ input

const npKeys = new Set();
addEventListener("keydown", (e) => {
  if (e.target?.tagName === "INPUT") return;
  if (e.code === "Escape" && np.modal) { npClose(); return; }
  if (e.code === "Escape" && !np.playing && uxBegun && !$("menu").hidden && !uxOb?.shown) { npBegin(); return; } // INTERFACE: Esc resumes
  if (!np.playing) return;
  if (e.code === "Escape") { uxOpenMenu(); return; } // INTERFACE: Esc opens the in-world menu
  if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Space"].includes(e.code)) e.preventDefault();
  npKeys.add(e.code);
  if (e.repeat) return;
  if (e.code === "KeyQ" && nwPhys.driving()) { const out = mvExitDrive(); np.x = out.x; np.z = out.z; npToast("Out of the vehicle. Open the Motor Pool (B) to drive again."); return; }
  if (e.code === "KeyE") npUse();
  if (e.code === "KeyM") npToggle("map");
  if (e.code === "KeyP") npToggle("parishes");
  if (e.code === "KeyB" && ixWorld.inside()) { npToast("Step outside first: the Motor Pool is out on the street."); return; } // INTERIORS
  if (e.code === "KeyB") asOpenMotorPool();
  if (e.code === "KeyL") tyOpenLedger();
  if (e.code === "KeyT") { const wasNight = NP_TIMES[np.timeIdx] === "night"; np.timeIdx = (np.timeIdx + 1) % NP_TIMES.length; npApplySky(); if (wasNight !== (NP_TIMES[np.timeIdx] === "night")) mgRemount(); }
  if (e.code === "KeyF") { np.weatherIdx = (np.weatherIdx + 1) % NP_WEATHERS.length; npApplySky(); }
});
addEventListener("keyup", (e) => npKeys.delete(e.code));
addEventListener("blur", () => npKeys.clear());
let npDrag = null;
npRenderer.domElement.addEventListener("pointerdown", (e) => { npDrag = { x: e.clientX, y: e.clientY, id: e.pointerId }; });
addEventListener("pointermove", (e) => {
  if (!npDrag || e.pointerId !== npDrag.id) return;
  np.yaw -= (e.clientX - npDrag.x) * 0.004; np.pitch = Math.max(-1.2, Math.min(1.0, np.pitch - (e.clientY - npDrag.y) * 0.003));
  npDrag.x = e.clientX; npDrag.y = e.clientY;
});
addEventListener("pointerup", () => { npDrag = null; });
const npPad = createGamepad({ getGamepads: () => { const all = navigator.getGamepads ? navigator.getGamepads() : []; return all?.[0] ? [all[0]] : []; }, bindings: [], axisBindings: [] });
const npPadPrev = {};

// ------------------------------------------------------------------ modals

function npClose() { if (!np.modal) return; $(np.modal).hidden = true; np.modal = null; }
function npOpen(id) { npClose(); $(id).hidden = false; np.modal = id; $(id).querySelector("[data-close]")?.focus(); }
function npToggle(id) { if (np.modal === id) npClose(); else { if (id === "map") npRenderMap(); if (id === "parishes") npRenderParishes(); npOpen(id); } }
for (const b of document.querySelectorAll("[data-close]")) b.addEventListener("click", npClose);

/** A station link with the way back: `#site=<parish>/<site>` so the return lands in the right parish. */
function npLink(id, siteId) { return lkStationLink(id, { runner: NP_RUNNER, from: "parishes", page: ppHerePage(), siteId: siteId ? `${parish.id}/${siteId}` : null }); }

function npOpenBoard(site) {
  $("board-title").textContent = site.name;
  $("board-trade").textContent = `${site.kind} · ${site.trades.join(", ")}`;
  $("board-blurb").textContent = site.blurb ?? "";
  const ul = $("board-stations"); ul.textContent = "";
  for (const id of site.stations) {
    if (dnHere.hidden.stations.has(id)) continue; // DEAN: a station only switched-off packs carry leaves the board
    const li = document.createElement("li");
    if (dnHere.glow.stations.has(id)) li.className = "dn-assigned";
    const name = document.createElement("span"); name.textContent = `${ppCompleted(id) ? "✓ " : ""}${lkStationLabel(id)}`;
    if (ppCompleted(id)) name.className = "done";
    const a = document.createElement("a"); a.className = "btn primary"; a.href = npLink(id, site.id); a.dataset.station = id; a.textContent = "Start";
    a.setAttribute("aria-label", `Start ${lkStationLabel(id)}`);
    li.append(name, a); ul.appendChild(li);
  }
  $("board-side").textContent = "";
  qmBoardRows($("board-side"), npPlayItems().filter((g) => g.site === site.id), { from: "parishes", page: ppHerePage(), link: { siteId: `${parish.id}/${site.id}` }, heading: "Skill locks here", done: () => false });
  // PROJECTSIM: a Bay Program project simulation starts at its site's board (docs/consoles/PROJECTSIM.md).
  psWorld?.boardRows($("board-ps"), site.id);
  tyBoardRows($("board-ty"), parish.id, site.id, { toast: npToast, onChange: tyRefresh });
  npOpen("board");
}

function npOpenLesson(l) {
  $("lesson-title").textContent = l.title; $("lesson-min").textContent = l.minutes; $("lesson-trade").textContent = `${l.trade} · ${l.tradeLine}`;
  $("lesson-steps").innerHTML = l.steps.map((s) => `<li>${s}</li>`).join("");
  $("lesson-q").textContent = l.check.q;
  const box = $("lesson-choices"); box.textContent = "";
  l.check.options.forEach((c, i) => {
    const b = document.createElement("button"); b.className = "btn"; b.type = "button"; b.textContent = c;
    b.addEventListener("click", () => {
      const r = npAnswerLesson(np.state, l, i); npSave(np.state);
      dxCaptureLesson({ world: "parishes", map: parish.id, lesson: l, choice: i, ok: r.ok }); // DATAWORKS: inert unless opted in
      npToast(r.ok ? `Right — ${l.check.why}` : "Not quite — read the steps again and try another answer.", r.ok ? 6000 : 3200);
      b.classList.toggle("on", r.ok); npHud();
    });
    box.appendChild(b);
  });
  $("lesson-links").innerHTML = `K-12 station: <a href="${npLink(l.k12, l.site)}">${lkStationLabel(l.k12)}</a>`;
  npOpen("lesson");
}

// --------------------------------------------------------------------- map

const NP_DISTRICT_FILL = { quarter: "#8b6a4f", garden: "#4f7a3c", industrial: "#7c7c78", suburb: "#6a8c4e", port: "#8a8676", wetland: "#5e7f63", refinery: "#7a6e5e", campus: "#5f8a4a", downtown: "#6e7480", park: "#3f7a3a" };
const NP_LAYERS = { satellite: true, districts: true, water: true, streets: true, roads: true, levees: true, sites: true, landmarks: true, connectors: true, lessons: true, you: true };
function npMapXY(x, z, W) { return [(x + NP_SIZE / 2) / NP_SIZE * W, (z + NP_SIZE / 2) / NP_SIZE * W]; }
function npRenderMap() {
  const cv = $("map-canvas"), W = cv.width, o = cv.getContext("2d");
  o.fillStyle = "#3d5a33"; o.fillRect(0, 0, W, W);
  // GEO: the baked Sentinel-2 backdrop, already in this map's scene frame (tools/geo_bake.py); districts go translucent over it.
  const geoSat = NP_LAYERS.satellite && geoBackdrop;
  if (geoSat) o.drawImage(geoBackdrop, 0, 0, W, W);
  if ($("geo-credit")) $("geo-credit").hidden = !geoSat;
  if (geoSat) o.globalAlpha = 0.35;
  const poly = (pts, fill, stroke) => { o.beginPath(); pts.forEach(([x, z], i) => { const [px, pz] = npMapXY(x, z, W); if (i) o.lineTo(px, pz); else o.moveTo(px, pz); }); o.closePath(); if (fill) { o.fillStyle = fill; o.fill(); } if (stroke) { o.strokeStyle = stroke; o.lineWidth = 1; o.stroke(); } };
  const line = (pts, col, w, dash = []) => { o.strokeStyle = col; o.lineWidth = w; o.setLineDash(dash); o.beginPath(); pts.forEach(([x, z], i) => { const [px, pz] = npMapXY(x, z, W); if (i) o.lineTo(px, pz); else o.moveTo(px, pz); }); o.stroke(); o.setLineDash([]); };
  if (NP_LAYERS.districts) for (const d of parish.districts) poly(d.poly, NP_DISTRICT_FILL[d.character] ?? "#666", "rgba(255,255,255,.18)");
  o.globalAlpha = 1;
  if (NP_LAYERS.water) for (const w of npWaterShapes(parish)) poly(w.shape, w.kind === "wetland" ? "rgba(90,140,110,.8)" : "#3f7fa0", null);
  if (NP_LAYERS.levees) for (const l of parish.levees) line(l.pts, "#e8dfb0", 2);
  // CITYWORKS: the AUTHORED procedural street fabric under the named roads, captioned as such (not the real grid).
  const cwFabric = cwStreets(parish);
  if (NP_LAYERS.streets && cwFabric.length) {
    for (const st of cwFabric) line(st.pts, "rgba(34,36,40,.6)", st.cls === "arterial" ? 1.8 : st.cls === "collector" ? 1.2 : 0.7);
    o.font = "11px system-ui"; o.fillStyle = "#fff"; o.strokeStyle = "#000"; o.lineWidth = 3;
    o.strokeText("Streets: procedural fabric, not the real grid", 8, W - 10); o.fillText("Streets: procedural fabric, not the real grid", 8, W - 10);
  }
  if (NP_LAYERS.roads) for (const r of parish.roads) { const k = NP_ROAD_KINDS[r.kind]; line(r.pts, r.kind === "ferry" ? "#dff3ff" : r.kind === "bridge" || r.kind === "causeway" ? "#c9ccd2" : r.kind === "interstate" ? "#1d1f22" : r.kind === "riverroad" ? "#9a8a66" : "#3a3c40", Math.max(1, (k?.width ?? 8) / 6), r.kind === "ferry" ? [3, 3] : []); }
  const dot = (x, z, col, r, label, small = false) => { const [px, pz] = npMapXY(x, z, W); o.fillStyle = col; o.beginPath(); o.arc(px, pz, r, 0, Math.PI * 2); o.fill(); if (label) { o.font = `${small ? 10 : 11}px system-ui`; o.fillStyle = "#fff"; o.strokeStyle = "#000"; o.lineWidth = 3; o.strokeText(label, px + r + 2, pz + 4); o.fillText(label, px + r + 2, pz + 4); } };
  if (NP_LAYERS.landmarks) for (const l of parish.landmarks) dot(l.position[0], l.position[1], "#8fd6a8", 2.5, l.name, true);
  if (NP_LAYERS.sites) for (const s of parish.sites) dot(s.position[0], s.position[1], npVisited(np.state, parish.id, s.id) ? "#ffb020" : "#e8eef4", 5, s.name);
  if (NP_LAYERS.lessons) for (const s of world.lessonSigns) { const [px, pz] = npMapXY(s.x, s.z, W); o.fillStyle = np.state.lessons.includes(s.lesson.id) ? "#8be28b" : "#6ad0c8"; o.fillRect(px - 4, pz - 4, 8, 8); }
  if (NP_LAYERS.connectors) for (const c of connectors) { const [px, pz] = npMapXY(c.from.position[0], c.from.position[1], W); o.fillStyle = "#fff"; o.beginPath(); o.arc(px, pz, 5, 0, Math.PI * 2); o.fill(); o.font = "bold 11px system-ui"; o.fillStyle = "#fff"; o.strokeStyle = "#000"; o.lineWidth = 3; const t = `→ ${c.world ? c.to.name : c.to.parish === parish.id ? c.name : `${npParish(c.to.parish)?.name ?? c.to.parish}${c.resolved ? "" : " (not built yet)"}`}`; o.strokeText(t, Math.min(px + 8, W - 150), pz - 6); o.fillText(t, Math.min(px + 8, W - 150), pz - 6); }
  if (geoPin) { const [px, pz] = npMapXY(geoPin[0], geoPin[1], W); o.fillStyle = "#e0245e"; o.strokeStyle = "#fff"; o.lineWidth = 2; o.beginPath(); o.arc(px, pz - 10, 6, 0, Math.PI * 2); o.moveTo(px - 4, pz - 7); o.lineTo(px, pz); o.lineTo(px + 4, pz - 7); o.fill(); o.stroke(); o.font = "bold 11px system-ui"; o.strokeStyle = "#000"; o.lineWidth = 3; o.strokeText("You are here", px + 9, pz - 8); o.fillStyle = "#fff"; o.fillText("You are here", px + 9, pz - 8); }
  if (NP_LAYERS.you) { const [px, pz] = npMapXY(np.x, np.z, W); o.fillStyle = "#ff3b3b"; o.beginPath(); o.moveTo(px - Math.sin(np.yaw) * 9, pz - Math.cos(np.yaw) * 9); o.lineTo(px + 5, pz + 5); o.lineTo(px - 5, pz + 5); o.fill(); }
  const lay = $("map-layers");
  if (!lay.childElementCount) for (const k of Object.keys(NP_LAYERS)) {
    const l = document.createElement("label"); const cb = document.createElement("input"); cb.type = "checkbox"; cb.checked = NP_LAYERS[k];
    cb.addEventListener("change", () => { NP_LAYERS[k] = cb.checked; npRenderMap(); }); l.append(cb, ` ${k}`); lay.appendChild(l);
  }
  const tr = $("map-travel"); tr.textContent = "";
  for (const s of parish.sites) {
    const b = document.createElement("button"); b.type = "button"; b.className = "btn"; b.textContent = s.name;
    const ok = npVisited(np.state, parish.id, s.id); b.disabled = !ok; b.title = ok ? "Fast travel" : "Visit on foot first";
    b.addEventListener("click", () => { npTravel(s); npClose(); });
    tr.appendChild(b);
  }
  const sc = npScale(parish);
  $("map-scale").textContent = `One map metre is about ${sc.x.toFixed(1)} real metres east–west and ${sc.z.toFixed(1)} north–south (a stylised map, not a survey).`;
}
function npTravel(s) { if (ixWorld.inside()) ixWorld.exit(); /* INTERIORS: fast travel leaves the room first */ np.x = s.position[0]; np.z = s.position[1] + 16; np.yaw = 0; world.update(np.x, np.z, 999); npToast(`Fast travel: ${s.name}.`); }

// ------------------------------------------------------------ parish selector

/** The selector: a heading per region (NP_REGIONS order), then that region's maps as links; the current map is on. */
function npFillSelector(box) {
  box.textContent = "";
  for (const { region, parishes } of npRegionGroups(NP_PARISHES)) {
    const group = document.createElement("div"); group.className = "np-region"; group.dataset.region = region.id;
    const h = document.createElement("p"); h.className = "eyebrow"; h.textContent = region.title; group.appendChild(h);
    const row = document.createElement("div"); row.className = "row";
    for (const p of parishes) {
      const a = document.createElement("a"); a.className = `btn${p.id === parish.id ? " on" : ""}`; a.href = `?parish=${encodeURIComponent(p.id)}`; a.textContent = p.name; a.dataset.parish = p.id; a.dataset.region = region.id;
      row.appendChild(a);
    }
    group.appendChild(row); box.appendChild(group);
  }
}

function npRenderParishes() {
  npFillSelector($("parish-list"));
  $("parish-ways-title").textContent = `Ways out of this ${npRegionHere.noun}`;
  const ways = connectors.map((c) => `<div class="quest"><b>${c.name}</b><small>${c.kind} · ${c.world ? `a way out to ${c.to.name}` : c.to.parish === parish.id ? `within this ${npRegionHere.noun}` : `to ${npParish(c.to.parish)?.name ?? c.to.parish}${c.resolved ? "" : " — not built yet"}`}</small></div>`).join("");
  $("parish-ways").innerHTML = ways || "<p class='note'>No connectors listed.</p>";
}

// ------------------------------------------------------------------- use

let npQmNear = null;
function npQmApproach(near) {
  const site = near?.kind === "board" ? near.site : null;
  if (!site) { npQmNear = null; return; }
  if (npQmNear === site.id) return;
  npQmNear = site.id;
  const locked = (parish.gated ?? []).find((g) => g.site === site.id && !qmIsOpen(g.gate, qmSnapshot()));
  if (locked && stPromptsOn()) qmLockToast(locked, { from: "parishes", page: ppHerePage(), link: { siteId: `${parish.id}/${site.id}` } });
}

function npNearest() {
  let best = null, bd = 9;
  for (const b of world.siteBoards) { const d = Math.hypot(np.x - b.x, np.z - b.z); if (d < bd) { bd = d; best = { kind: "board", site: b.site, at: [b.x, b.z] }; } }
  for (const dd of ixDoors) { const d = Math.hypot(np.x - dd.x, np.z - dd.z); if (d < Math.min(bd, 3)) { bd = d; best = { kind: "door", site: dd.site, at: [dd.x, dd.z] }; } }
  for (const dd of ixRentalDoors()) { const d = Math.hypot(np.x - dd.x, np.z - dd.z); if (d < Math.min(bd, 2.2)) { bd = d; best = { kind: "door", site: dd.site, at: [dd.x, dd.z], style: dd.style, title: dd.title }; } }
  for (const s of world.lessonSigns) { const d = Math.hypot(np.x - s.x, np.z - s.z); if (d < Math.min(bd, 5)) { bd = d; best = { kind: "lesson", lesson: s.lesson, at: [s.x, s.z] }; } }
  for (const c of connectors) { const d = Math.hypot(np.x - c.from.position[0], np.z - c.from.position[1]); if (d < Math.min(bd, 7)) { bd = d; best = { kind: "connector", conn: c, at: c.from.position }; } }
  const mv = mvPark.near(np.x, np.z); // MOTORWORKS: a parked vehicle beside the learner (its body edge within the prompt distance)
  // A job board keeps the prompt when both are in reach (the board is what the site is for); a vehicle wins over the rest when nearer.
  if (mv && (!best || (best.kind !== "board" && Math.hypot(np.x - mv.x, np.z - mv.z) < bd))) best = { kind: "vehicle", park: mv, at: [mv.x, mv.z] };
  if (lxRoom?.inside) return { kind: "walkout", at: [0, 0] };
  for (const w of lxDoors) { const d = Math.hypot(np.x - w.x, np.z - w.z); if (d < Math.min(bd, 7)) { bd = d; best = { kind: "walkin", door: w, at: [w.x, w.z] }; } }
  return best;
}

function npUse() {
  // In the drive mode, Use (E, the touch Use button, the pad's A) steps out of the vehicle, like Q.
  if (nwPhys.driving()) { const out = mvExitDrive(); np.x = out.x; np.z = out.z; npToast("Out of the vehicle. Open the Motor Pool (B) to drive again."); return; }
  if (ixWorld.inside()) {
    const r = ixWorld.use();
    if (r?.kind === "exit") { np.x = r.pose.x; np.z = r.pose.z; np.yaw = r.pose.yaw; np.pitch = r.pose.pitch; np.near = npNearest(); npToast("Back outside."); }
    npHud();
    return;
  }
  // LANDMARKS-2: E goes into a walk-in landmark (the outdoor world hides and stops streaming) and E again comes back out.
  if (lxRoom?.inside) { const p = lxRoom.exit(); np.x = p.x; np.z = p.z; np.near = null; world.update(np.x, np.z, 999); npToast("Back outside."); npHud(); return; }
  // CLASSROOMS: inside a room E uses the nearest fixture (or goes out at the door); at a room's door E goes in.
  if (crWorld?.inside()) { const r = crWorld.useNear(np.x, np.z); if (r && typeof r === "object") { np.x = r.x; np.z = r.z; } return; }
  if (crWorld?.near()) { const at = crWorld.enter(crWorld.near().id, [np.x, np.z]); if (at) { np.x = at.x; np.z = at.z; np.yaw = 0; } return; }
  const n = np.near;
  if (!n) return;
  if (n.kind === "walkin") { const p = lxRoom?.enter(n.door, { x: np.x, z: np.z }); if (p) { np.x = p.x; np.z = p.z; np.yaw = 0; np.near = { kind: "walkout", at: [0, 0] }; npToast(`${lxRoom.room.label}. E: go back outside.`, 5000); } return; }
  if (n.kind === "door") { npKeys.clear(); ixWorld.enter(n.site, { x: np.x, z: np.z, yaw: np.yaw, pitch: np.pitch }, { style: n.style, title: n.title }); np.near = null; }
  else if (n.kind === "board") npOpenBoard(n.site);
  else if (n.kind === "lesson") npOpenLesson(n.lesson);
  else if (n.kind === "vehicle") mvUse(n.park);
  else if (n.kind === "connector") {
    const c = n.conn;
    if (c.world) { npCrossWorld(c); return; }
    if (c.to.parish === parish.id && c.to.position) { np.x = c.to.position[0]; np.z = c.to.position[1] + 8; world.update(np.x, np.z, 999); npToast(`${c.name}: across to the other bank.`); }
    else if (c.resolved) location.href = `?parish=${encodeURIComponent(c.to.parish)}&site=`;
    else npToast(`${c.name} leads to ${npParish(c.to.parish)?.name ?? c.to.parish}, which is not built yet.`);
  }
  npHud();
}

/** Cross a `world` way (the Bay Bridge to Bay World): the other world's page, with the way home to the nearest site here (GOLDEN-B). */
function npCrossWorld(c) {
  let near = parish.sites[0], nd = Infinity;
  for (const s of parish.sites) { const d = Math.hypot(c.from.position[0] - s.position[0], c.from.position[1] - s.position[1]); if (d < nd) { nd = d; near = s; } }
  npSave(np.state); npToast(`${c.name}: crossing to ${c.to.name} with your passport.`);
  location.href = lkWorldLink(c.to.href, { from: "parishes", page: ppHerePage(), siteId: `${parish.id}/${near.id}` });
}
// WALKABLE: walking into a paired connector carries you across — a short fade (none under reduced motion), no menu.
// The trigger arms only once you have walked clear of every connector (so arriving never bounces you straight back).
let wkArmed = !wkArrive, wkGoing = false, wkDriveId = null, wkEdgeT = 0;
function wkWalkThrough() {
  if (wkGoing || np.modal) return;
  let nearest = Infinity, hit = null;
  for (const c of connectors) {
    const d = Math.hypot(np.x - c.from.position[0], np.z - c.from.position[1]);
    nearest = Math.min(nearest, d);
    if (d < WK_TRIGGER && !hit) hit = c;
  }
  if (!wkArmed) { if (nearest > WK_REARM) wkArmed = true; return; }
  if (!hit) return;
  const pair = wkPair(parish, hit);
  if (pair) wkCross(pair);
}
function wkCross(pair) {
  wkGoing = true;
  const driving = nwPhys.driving() && wkDriveId;
  npSave(np.state);
  const url = wkCarry(pair, { time: np.timeIdx, weather: np.weatherIdx, drive: driving ? wkDriveId : null });
  npToast(`${pair.conn.name}: on into ${pair.to.name}.`);
  const fade = $("wk-fade"), ms = npReduced ? 0 : WK_FADE_MS;
  if (fade && ms) { fade.style.transition = `opacity ${ms}ms`; fade.hidden = false; requestAnimationFrame(() => { fade.style.opacity = "1"; }); }
  setTimeout(() => { location.href = url; }, ms);
}
function wkEdgeHint(e) {
  const now = performance.now();
  if (now - wkEdgeT < 6000 || !e.way) return;
  wkEdgeT = now;
  const c = e.way.conn;
  const where = c.world ? c.to.name : c.to.parish === parish.id ? c.name : npParish(c.to.parish)?.name ?? c.to.parish;
  const [dx, dz] = [c.from.position[0] - np.x, c.from.position[1] - np.z];
  const dir = ["north", "north-east", "east", "south-east", "south", "south-west", "west", "north-west"][Math.round(((Math.atan2(dx, -dz) + Math.PI * 2) % (Math.PI * 2)) / (Math.PI / 4)) % 8];
  npToast(`The edge of ${parish.name}. The nearest way on: ${c.name} to ${where}, ${Math.round(e.way.d)} m ${dir}.`, 4200);
}
// A drive carried across: the far side takes the vehicle when NEWTON can place it (else it waits at the crossing).
if (wkArrive?.drive) {
  const entry = dvById(wkArrive.drive);
  if (entry && nwPhys.drive(mvDriveEntry(entry, { region: parish.region }), np.x, np.z, np.yaw + Math.PI)) { wkDriveId = entry.id; npToast(`${entry.name}: still driving, now in ${parish.name}.`, 4200); }
  else if (entry) npToast(`${entry.name} stays at the crossing; walk on, and the Motor Pool (B) has it again.`, 4200);
}

// WALKABLE: the region atlas in the Map tab — six regions, 22 maps joined by their connectors, and the standalone
// worlds with their ways in. Pick a map to go (the same parish switch as the map list); a world opens its page.
{
  const el = $("wk-atlas");
  if (el) {
    const A = wkAtlas();
    const links = (id) => A.links.filter((l) => l.a === id || l.b === id).map((l) => npParish(l.a === id ? l.b : l.a)?.name).filter(Boolean);
    const esc = (t) => String(t).replace(/[&<>"]/g, (ch) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[ch]);
    el.innerHTML = A.regions.map((r) => `<div class="wk-region"><p class="eyebrow">${esc(r.name)}</p>${r.maps.map((m) => `<button class="btn wk-map${m.id === parish.id ? " on" : ""}" type="button" data-wk-go="${esc(m.id)}" ${m.id === parish.id ? 'aria-current="true"' : ""} title="Joined to ${esc(links(m.id).join(", ") || "no other map")}">${esc(m.name)}</button>`).join("")}</div>`).join("")
      + `<div class="wk-region"><p class="eyebrow">Standalone worlds</p>${A.worlds.map((w) => `<a class="btn wk-world" href="${esc(lkWorldLink(w.href, { from: "parishes", page: ppHerePage(), siteId: `${parish.id}/${npStart.id}` }))}" title="Ways in: ${esc(w.ways.map((x) => `${x.name} (${npParish(x.parish)?.name ?? x.parish})`).join("; ") || w.ride)}">${esc(w.name)}</a>`).join("")}</div>`
      + `<p class="note">${A.links.length} crossings join the maps: walk into one to go on.</p>`;
    el.addEventListener("click", (e) => {
      const b = e.target.closest("[data-wk-go]");
      if (!b || b.dataset.wkGo === parish.id) return;
      npSave(np.state);
      location.href = `?parish=${encodeURIComponent(b.dataset.wkGo)}&site=`;
    });
  }
}

// A world way has no parish sign of its own (np-world.js signs the parish's connectors): a tall post marks it.
for (const c of connectors.filter((x) => x.world)) {
  const post = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 14, 8), new THREE.MeshLambertMaterial({ color: 0xf2c14b }));
  post.position.set(c.from.position[0], npHeightAt(parish, c.from.position[0], c.from.position[1]) + 7, c.from.position[1]); post.name = `world-way-${c.id}`; root.add(post);
}

// -------------------------------------------------------------------- HUD

function npHud() {
  const h = npHeightAt(parish, np.x, np.z);
  const d = npDistrictAt(parish, np.x, np.z);
  const w = npWaterAt(parish, np.x, np.z);
  let near = parish.sites[0], nd = Infinity;
  for (const p of [...parish.sites, ...parish.landmarks]) { const dd = Math.hypot(np.x - p.position[0], np.z - p.position[1]); if (dd < nd) { nd = dd; near = p; } }
  const hill = w ? null : npHillAt(parish, np.x, np.z);
  $("hud-zone").textContent = w ? w.name ?? w.kind : hill ? `${hill.name} · ${d?.name ?? parish.name}` : d?.name ?? parish.name;
  $("hud-near").textContent = `${near.name} · ${Math.round(nd)} m`;
  $("hud-alt").textContent = `${h.toFixed(1)} m`;
  $("hud-lessons").textContent = `${(parish.fieldLessons ?? []).filter((l) => np.state.lessons.includes(l.id)).length}/${(parish.fieldLessons ?? []).length}`;
  $("hud-visited").textContent = `${(np.state.visited[parish.id] ?? []).length}/${parish.sites.length}`;
  $("hud-credits").textContent = String(tyBalance);
  const p = $("hud-prompt");
  if (ixWorld.inside()) { const a = ixWorld.near(); p.hidden = !a; if (a) p.textContent = `E — ${a.label}`; }
  else if (np.near) { p.hidden = false; p.textContent = np.near.kind === "door" ? `E — go inside: ${np.near.title ?? np.near.site.name}` : np.near.kind === "board" ? `E — ${np.near.site.name} job board` : np.near.kind === "lesson" ? `E — field lesson: ${np.near.lesson.title}` : np.near.kind === "vehicle" ? mvPark.prompt(np.near.park).text : np.near.kind === "walkin" ? `E — go inside ${npLandmarkName(np.near.door.id)}` : np.near.kind === "walkout" ? "E — go back outside" : `E — ${np.near.conn.name}`; }
  else p.hidden = true;
}

// ------------------------------------------------------------------- loop

let last = performance.now(), npHudT = 0, npVisitT = 0;
function frame(now) {
  const dt = Math.max(0, Math.min(0.05, (now - last) / 1000)); last = now;
  uxPadMenu();
  if (np.playing && !np.modal) {
    let f = 0, s = 0, turn = 0;
    if (npKeys.has("KeyW") || npKeys.has("ArrowUp")) f += 1;
    if (npKeys.has("KeyS") || npKeys.has("ArrowDown")) f -= 1;
    if (npKeys.has("KeyA")) s -= 1;
    if (npKeys.has("KeyD")) s += 1;
    if (npKeys.has("ArrowLeft")) turn += 1;
    if (npKeys.has("ArrowRight")) turn -= 1;
    const snap = npPad.poll(dt);
    const ax = (i) => { const v = snap?.axes?.[i]?.value ?? 0; return Math.abs(v) > GAMEPAD_DEADZONE ? v : 0; };
    f -= ax(1); s += ax(0); turn -= ax(2) * 1.4; np.pitch = Math.max(-1.2, Math.min(1, np.pitch - ax(3) * dt * 1.5));
    const b0 = !!snap?.buttons?.[0]?.pressed; if (b0 && !npPadPrev[0]) npUse(); npPadPrev[0] = b0;
    if (npTouch?.stick?.active) { f -= npTouch.stick.dy; s += npTouch.stick.dx; }
    np.yaw += turn * dt * 1.6;
    const run = npKeys.has("ShiftLeft") || npKeys.has("ShiftRight") || !!snap?.buttons?.[10]?.pressed;
    const speed = run ? 14 : 5;
    const fx = -Math.sin(np.yaw), fz = -Math.cos(np.yaw);
    if (ixWorld.inside()) {
      // INTERIORS: the room walk (NEWTON's avatar step on the room's walls); the outdoor pose stays where it was.
      ixWorld.walk({ vx: (fx * f - fz * s) * Math.min(speed, 5), vz: (fz * f + fx * s) * Math.min(speed, 5) }, dt);
    } else if (nwPhys.driving()) {
      // Drive mode: W/S throttle, A/D steer, Space brakes; the crash response is nw-drive.js's.
      nwPhys.animate(dt, { throttle: Math.max(-1, Math.min(1, f)), steer: Math.max(-1, Math.min(1, turn - s)), brake: npKeys.has("Space") });
      const v = nwPhys.vehicle; np.x = v.x; np.z = v.z;
      { const wkE = wkEdge(parish, np.x, np.z); if (wkE.soft) wkEdgeHint(wkE); }
    } else if (lxRoom?.inside) {
      // LANDMARKS-2: inside a walk-in room the walk is the room's box collider (no terrain, no water).
      const p = lxRoom.clamp(np.x + (fx * f - fz * s) * speed * dt, np.z + (fz * f + fx * s) * speed * dt); np.x = p.x; np.z = p.z;
    } else {
      // The walk through NEWTON's physics: off an edge it falls, walls stop it, water is waded or swum and its flow carries.
      if (crWorld?.inside()) { const c = crWorld.clamp(np.x, np.z); np.x = c.x; np.z = c.z; } // CLASSROOMS: the room's walls
      if (Math.abs(nwPhys.avatar.x - np.x) > 1e-6 || Math.abs(nwPhys.avatar.z - np.z) > 1e-6) nwPhys.place(np.x, np.z);
      // WALKABLE: the edge of the map is a soft boundary — eased back toward the field, never a wall mid-street (outdoors only).
      const wkIndoors = crWorld?.inside() || ixWorld.inside();
      const wkE = wkIndoors ? { push: [0, 0], soft: false } : wkEdge(parish, np.x, np.z);
      const av = nwPhys.walk({ vx: (fx * f - fz * s) * speed + wkE.push[0], vz: (fz * f + fx * s) * speed + wkE.push[1] }, dt);
      [np.x, np.z] = wkIndoors ? [av.x, av.z] : wkClamp(parish, av.x, av.z);
      if (wkE.soft) wkEdgeHint(wkE);
      if (av.mode !== nwMode && NW_MODE_TOAST[av.mode] && nwMode !== "fall") npToast(NW_MODE_TOAST[av.mode], 4200);
      nwMode = av.mode;
      nwPhys.animate(dt, null);
    }
  } else nwPhys.animate(dt, null);
  const ixCam = ixWorld.inside() ? ixWorld.camera(NP_EYE) : null;
  if (ixCam) {
    camera.position.set(ixCam.x, ixCam.y, ixCam.z);
    camera.rotation.set(np.pitch, np.yaw, 0, "YXZ");
  } else if (np.playing && nwPhys.driving()) {
    const cam = nwPhys.cameraPose(NP_EYE);
    camera.position.set(cam.x, cam.y, cam.z);
    camera.lookAt(cam.look[0], cam.look[1], cam.look[2]);
  } else {
    // A teleport or fast travel moved np.x/np.z: the avatar stands up on the ground there.
    if (!lxRoom?.inside && Math.abs(nwPhys.avatar.x - np.x) > 1e-6 || Math.abs(nwPhys.avatar.z - np.z) > 1e-6) nwPhys.place(np.x, np.z);
    const gy = lxRoom?.inside ? lxRoom.eyeY(NP_EYE) : np.playing ? nwPhys.cameraPose(NP_EYE).y : Math.max(npHeightAt(parish, np.x, np.z), 0.2) + NP_EYE;
    camera.position.set(np.x, gy, np.z);
    camera.rotation.set(np.pitch, np.yaw, 0, "YXZ");
  }
  // INTERIORS: inside a room the outdoor world neither streams nor animates (its root is hidden); it resumes on exit.
  if (!ixCam) {
  // One stream step a frame (SMOOTH: a merge had left LANDMARKS-2's unguarded pair above this guarded one, so every frame
  // streamed twice — up to four chunk builds and two detail budgets a frame — and streamed inside a walk-in room too).
  if (!lxRoom?.inside) { world.update(np.x, np.z, 2); cwStreetsMount.update(np.x, np.z, 1); }
  world.animate(dt);
  tfLand.update(np.x, np.z, 1);
  tfLand.animate(now / 1000, dt);
  tfRain.animate(now / 1000, dt, camera.position.x, camera.position.y, camera.position.z);
  atmos.update(np.x, np.z); atmos.animate(now / 1000, dt);
  if (atSound.enabled()) {
    atSoundT += dt;
    if (atSoundT > 0.5 || !atMix) { atSoundT = 0; atMix = atSoundMix({ hour: AT_BUCKET_HOUR[NP_TIMES[np.timeIdx]] ?? 12, weather: atWeatherNow, wind: tfWind(now / 1000).gust, near: atNearness(parish, np.x, np.z) }); }
    atSound.update(atMix, now / 1000);
  }
  sky?.animate(now / 1000, dt, camera);
  for (const w of npWild) w.animate(now / 1000, dt);
  mgLife?.animate(now / 1000, dt);
  }
  asNpc.animate(now / 1000, dt);
  stWorld?.animate(now / 1000);
  drWorld?.animate(dt);
  rbWorld?.animate(dt, np.x, np.z);
  if (np.playing && !np.modal) { tyClock += dt; if (tyClock >= 1) { tyAfterTick(tyTick(tyClock)); tyClock = 0; } }
  if (np.playing && !np.modal && tyClock === 0) bqTrailTick();
  npHudT += dt; npVisitT += dt;
  if (npVisitT > 0.5) {
    npVisitT = 0;
    np.near = ixCam ? null : npNearest();
    if (np.playing && !ixCam && !crWorld?.inside()) wkWalkThrough();
    npQmApproach(np.near);
    if (np.playing) scSession.tick(np.x, np.z);
    if (np.playing) crWorld?.tick(np.x, np.z);
    for (const s of parish.sites) if (Math.hypot(np.x - s.position[0], np.z - s.position[1]) < 40 && npVisit(np.state, parish.id, s.id)) { npToast(`Visited: ${s.name}. Fast travel unlocked.`); npSave(np.state); }
  }
  if (npHudT > 0.25 && np.playing) { npHudT = 0; npHud(); }
  npRenderer.render(scene, camera);
  uxAnchorPrompt();
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);

// SCHOLAR: a K-12 lesson session when the learner reaches a site with a field lesson, a BAYOU lesson or an ESTUARY lesson.
const scSession = scMountSession({
  world: "parishes", parish: parish.id, lessons: [...(parish.fieldLessons ?? []), ...byLessonsFor(parish.id), ...esSessionLessons(parish.id), ...lkSessionLessons(parish.id)],
  siteAt: (_p, siteId) => parish.sites.find((s) => s.id === siteId)?.position ?? null,
  stationHref: (l) => (l.k12 ? npLink(l.k12, l.site) : null), award: ppAward, awarded: ppAwarded,
});
window.scSessionPanel = scSession; // the headless session test drives it (docs/consoles/SCHOLAR.md)

function npBegin() {
  $("menu").hidden = true; $("hud").hidden = false; np.playing = true;
  npHud();
  if (uxBegun) return; // INTERFACE: a resume from the in-world menu says nothing
  uxBegun = true; $("menu-start").textContent = "Resume";
  if (npReturnSiteId) npToast(`Back at ${npStart.name}.`);
  else if (!stPromptsOn()) npToast(`${parish.name}: just roam. No prompts; every board, lesson and kiosk opens when you reach it.`);
  else if (!(stChosenPath() && stWorld?.greet())) npToast(`Welcome to ${parish.name}. Walk to the orange job board (E), or open the map (M).`);
}
$("menu-start").addEventListener("click", npBegin);
if (npReturnSiteId) npBegin();

// The menu: this parish's name and blurb, and the selector.
$("menu-parish").textContent = parish.name;
$("menu-blurb").textContent = parish.blurb ?? "";
$("menu-count").textContent = `${parish.sites.length} job sites · ${parish.districts.length} districts · ${connectors.length} ways out`;
npFillSelector($("menu-parishes"));
$("menu-eyebrow").textContent = `${npRegionHere.title} · a 4 km by 4 km world each`;
document.title = `${parish.name} — ${npRegionHere.title}`;

// Touch: a stick to walk, buttons for use / map / parishes.
let npTouch = null;
try {
  npTouch = tcMountTouch({
    hint: "Drag the stick to walk; drag the view to look; tap Use at a board, a building door, a sign or a way out.",
    buttons: [
      { id: "np-use", label: "Use", aria: "Use", onDown: () => npUse() },
      { id: "np-map", label: "Map", aria: "Map", onDown: () => npToggle("map") },
      { id: "np-parishes", label: "Maps", aria: `${npRegionHere.title} and other regions`, onDown: () => npToggle("parishes") },
      { id: "np-menu", label: "Menu", aria: "Open the menu", onDown: () => uxOpenMenu() },
    ],
  });
} catch { /* no touch layer */ }
tcMountQuality?.($("hud-stats"), (q) => tcApplyRenderer(npRenderer, tcTier(q)));

gdMount();
ctlMount({
  world: npRegionHere.title, quality: true,
  except: { move: "WASD or arrows walk; Shift runs; drag the view to look.", interact: "E at a job board, a lesson sign or a way out of the parish.", map: "M opens the map with districts, water, levees, roads and connectors." },
  unique: [
    { label: "Region and map selector", keys: ["P"], pad: "—", touch: "Maps button" },
    { label: "Time of day / weather", keys: ["T", "F"], pad: "—", touch: "—" },
    { label: "Talk to a crew member", keys: ["G"], pad: "—", touch: "Talk button" },
    { label: "Motor Pool", keys: ["B"], pad: "—", touch: "Parishes, then Motor Pool" },
    { label: "Crew Credits ledger", keys: ["L"], pad: "—", touch: "Menu, then Crew Credits" },
  ],
});

// The characters at the sites (GRIOT's parish hook, mounted by ASSAYER): each parish character stands at the first
// site of its kind (npc.js's GR_PARISH_KIND_ALIAS reads the parish modules' spellings); a kind no site carries places
// no one. G talks.
const asNpc = grMount(`parish:${parish.id}`, {
  three: THREE, root, sites: [...kwGriotSites(parish), ...parish.sites], // KREWE: a character stands at each kiosk first
  groundAt: (x, z) => npHeightAt(parish, x, z), from: "parishes", page: ppHerePage(),
  pos: () => (np.playing && !np.modal ? [np.x, np.z] : null),
  openLesson: (id) => { const l = (parish.fieldLessons ?? []).find((x) => x.id === id); if (l) npOpenLesson(l); },
});

// MOTORPOOL's board (the next brief's parish mount): every drivable with its gate and pre-trip. The parish has no vehicle
// mode yet, so a finished pre-trip says where it drives today (Bay World) and watercraft link the Regatta.
let asMotorPool = null;
function asOpenMotorPool() {
  if (!asMotorPool) asMotorPool = dvMountMotorPool({
    el: $("dv-board"), world: "parishes", page: ppHerePage(), regatta: "../regatta/regatta.html",
    // NEWTON: a finished pre-trip (the gate contract, as today) drives the vehicle on the parish roads.
    onDrive: (entry) => {
      const mvP = mvPending?.drivable === entry.id ? mvPending : null; mvPending = null; // MOTORWORKS: from its bay
      if (nwPhys.drive(mvP ? mvP.drive : mvDriveEntry(entry, { region: parish.region }), mvP?.x ?? np.x, mvP?.z ?? np.z, mvP ? mvP.heading : np.yaw + Math.PI, { snap: !mvP })) { if (mvP) { mvPark.hide(mvP.id); mvDriving = mvP; } wkDriveId = entry.id; npClose(); npToast(`${entry.name}: W/S drive, A/D steer, Space brakes, Q or Use steps out. Drive gently — a hard hit stops the vehicle.`, 6000); }
      else npToast(`${entry.name}: pre-trip done. It runs on rails, so Bay World's Motor Pool drives it today.`, 6000);
    },
  });
  else asMotorPool.refresh();
  npOpen("motorpool");
}
$("menu-motorpool").addEventListener("click", asOpenMotorPool);
$("parishes-motorpool").addEventListener("click", asOpenMotorPool);

// TYCOON (docs/consoles/TYCOON.md): the Crew Credits play economy — never money. A passed shift pays by level on the
// way back, the ledger opens from the menu or L, each job board lists a room and a shop, and a rented building
// carries a sign (one plane each, a canvas texture). The passport records the milestones as zero-credit awards.
tySetRecorder(ppAward);
tyBalance = tyLedger().balance;
const tySigns = new THREE.Group(); tySigns.name = "ty-signs"; root.add(tySigns);
function tyHangSigns() {
  for (const m of tySigns.children.slice()) { m.geometry.dispose(); m.material.map?.dispose(); m.material.dispose(); tySigns.remove(m); }
  for (const sg of tySignsFor(parish.id)) {
    const site = parish.sites.find((x) => x.id === sg.site); if (!site) continue;
    const cv = document.createElement("canvas"); cv.width = 512; cv.height = 96;
    const o = cv.getContext("2d"); o.fillStyle = "#12324a"; o.fillRect(0, 0, 512, 96); o.fillStyle = "#ffd27a"; o.font = "bold 30px system-ui"; o.textAlign = "center"; o.fillText(sg.text, 256, 60, 490);
    const tex = new THREE.CanvasTexture(cv); tex.colorSpace = THREE.SRGBColorSpace;
    const m = new THREE.Mesh(new THREE.PlaneGeometry(10, 1.9), new THREE.MeshBasicMaterial({ map: tex, side: THREE.DoubleSide }));
    const x = site.position[0] + (sg.type === "shop" ? 12 : -12), z = site.position[1] + 6;
    m.position.set(x, npHeightAt(parish, x, z) + 5.5, z); m.name = `ty-sign-${sg.site}-${sg.type}`; tySigns.add(m);
  }
}
function tyRefresh() { ixRentalsT = -1e9; tyBalance = tyLedger().balance; tyHangSigns(); tyLedgerUi?.render(); if (np.playing) npHud(); }
function tyOpenLedger() {
  if (!tyLedgerUi) tyLedgerUi = tyMountLedger($("ty-ledger"), { parishId: parish.id, completed: ppCompleted, toast: npToast, onChange: tyRefresh });
  else tyLedgerUi.render();
  bqOpenBoard();
  npOpen("tycoon");
}
var bqBoard = null;
/** The Bay Keeper's Trail on the San Francisco maps: a treasure within reach is found once and teaches its line. */
function bqTrailTick() {
  const t = bqNear("parishes", parish.id, np.x, np.z);
  if (!t) return;
  const r = bqFind(t.id);
  if (r.first) { npToast(`Bay Keeper's Trail: a ${t.reveal} near ${t.siteName}. ${r.lesson}`, 7000); bqBoard?.refresh(); }
}
function bqOpenBoard() {
  const ledgerEl = $("ty-ledger");
  if (!ledgerEl) return;
  let el = document.getElementById("bq-board");
  if (!el) { el = document.createElement("div"); el.id = "bq-board"; ledgerEl.after(el); }
  if (!bqBoard) bqBoard = bqMount({ el, world: null, toast: npToast, completed: ppCompleted });
  else bqBoard.refresh();
}
function tyAfterTick(events) {
  if (!events.length) return;
  tyBalance = tyLedger().balance;
  const bad = events.find((e) => e.kind === "lapsed" || e.kind === "closed" || e.kind === "left");
  if (bad) { npToast(bad.kind === "lapsed" ? `Not enough ${TY_CURRENCY} for the rent: the rental lapsed.` : bad.kind === "left" ? `Not enough ${TY_CURRENCY} for a wage: a crew member moved on.` : bad.why === "upkeep" ? `Not enough ${TY_CURRENCY} for upkeep: the business closed. Pass a shift and reopen it from the ledger.` : "The business's safety inspection is due: open the ledger (L) to run it.", 6000); tyRefresh(); }
}
{
  const settled = tySettle(ppRecords());
  if (settled.paid) setTimeout(() => npToast(`${TY_CURRENCY}: +${settled.amount} for ${settled.paid} passed training shift${settled.paid === 1 ? "" : "s"}.`, 5000), 1200);
  tyRefresh();
}
$("menu-ledger").addEventListener("click", tyOpenLedger);
// DEAN (docs/modules.md): the class's version and assigned modules, applied at load. Assigned lessons glow on their
// boards (the board's material is swapped for a brighter one — no new mesh), stations only switched-off packs carry
// leave the boards, and the menu names the module and its due date. The enterprise block is the stricter side.
function dnApplyHere() {
  try { dnSetEnterprise(Auth.config?.enterprise ?? null); } catch (_) { /* no config yet */ }
  const a = dnApplyModule("parishes", { sites: parish.sites });
  const glowMat = new THREE.MeshLambertMaterial({ color: 0xffe066, emissive: 0x8a6a00 });
  for (const b of world.siteBoards) {
    const board = root.getObjectByName(`site-${b.site.id}`)?.getObjectByName("site-board");
    if (!board) continue;
    board.userData.dnBase ??= board.material;
    board.material = a.glow.sites.has(b.site.id) ? glowMat : board.userData.dnBase;
  }
  const line = $("menu-dean");
  if (line) {
    line.hidden = !a.modules.length && a.allowed;
    line.textContent = !a.allowed ? "Your class's version does not include this world; ask your teacher which worlds are on."
      : a.modules.map((m) => `Assigned: ${m.title}${m.due ? ` · due ${m.due}` : ""} · ${m.lessons.length} lesson(s) · glowing boards: ${a.glow.sites.size}`).join(" · ");
  }
  return a;
}
// DEAN reads PACKS' registry and SCHOLAR's sessions through its hooks (docs/modules.md).
dnUsePacks(pkPacks); dnUseSessions(scSessions);
let dnHere = { hidden: { stations: new Set() }, glow: { stations: new Set(), sites: new Set() }, modules: [] };
try { dnHere = dnApplyHere(); } catch (_) { /* DEAN is optional */ }
addEventListener("gt:profile", () => { try { dnHere = dnApplyHere(); } catch (_) { /* keep */ } });

// PROJECTSIM (docs/consoles/PROJECTSIM.md): full-procedure Bay Program project simulations at their sites' boards and in the
// menu; each step is a real station's step, the order gates (permit, lockout, locate, mats, PPE) are scored, the award goes to the
// passport and a pass pays Crew Credits through TYCOON's tyEarn.
psSetRecorder(ppAward);
void usSims; // registered on import, before the boards render
var psWorld = psMountProjectSim({
  three: THREE, root, parish, el: $("menu-ps"), tier: npTierName,
  reducedMotion: (() => { try { return !!matchMedia("(prefers-reduced-motion: reduce)").matches; } catch { return false; } })(),
  toast: npToast, stationHref: (id, siteId) => npLink(id, siteId), onOpen: () => npClose(),
});

// CLASSROOMS (docs/consoles/CLASSROOMS.md): rooms that teach at the school, union-hall and programme sites; the board opens
// a SCHOLAR session, a bench or bay a real station, a bay's simulation PROJECTSIM, a robotics game ROBOTICS' (guarded).
function crLaunch(l, room) {
  if (l.type === "lesson") return scSession.open(l.id) !== false;
  if (l.type === "sim") return psWorld?.open(l.id, room?.site) !== false;
  if (l.type === "game") { const g = globalThis.rbOpenGame; if (typeof g === "function") return g(l.id) !== false; npToast("This robotics game opens once the robotics layer is in this build."); return true; }
  location.href = npLink(l.id, room?.site); return true;
}
// INTERIORS' shell when it is in the build (guarded): the same rooms furnish its styles as dressers, and its doors take over.
var crDressed = crRegisterDressers(typeof ixRegisterDresser === "function" ? { ixRegisterDresser, IX_KIND_STYLE } : null, { parish, launch: crLaunch });
// LA-ROOMS (docs/consoles/LA-ROOMS.md): the Louisiana rooms (hangar, fab shop, data hall, control room, compressor building,
// craft hall) furnish their INTERIORS styles; each object opens a catalog station or a programme simulation through crLaunch.
var larDressed = larRegisterDressers(typeof ixRegisterDresser === "function" ? { ixRegisterDresser } : null, { parish, launch: crLaunch });
void larDressed;
var crWorld = crMountClassrooms({
  three: THREE, scene, root, parish, tier: npTierName, toast: npToast, launch: crLaunch, passive: crDressed.length > 0,
  groundAt: (x, z) => Math.max(npHeightAt(parish, x, z), 0.2),
});
// HARVEST (docs/consoles/HARVEST.md): hidden fishing, crabbing, crawfish, rice and gator-watch spots by the water — found by
// walking the banks, played from the Play tab (menu-harvest), each run teaching one line and paying Crew Credits once.
var hvWorld = hvMount({
  THREE, root, parish, el: $("menu-harvest"), toast: npToast, heightAt: (x, z) => npHeightAt(parish, x, z),
  pos: () => (np.playing && !np.modal ? [np.x, np.z] : null), hour: () => AT_BUCKET_HOUR[NP_TIMES[np.timeIdx]] ?? 12,
});
// SMILES (docs/consoles/SMILES.md): the Unspoken Smiles District's dental-health games in the Play tab (only on that map);
// the adult-only sterilisation order is left out of a K-12 session (?k12=1), and a clean run pays Crew Credits once.
var smilesPanel = smilesMount({ el: $("menu-smiles"), parish, k12: npParams.get("k12") === "1", toast: npToast,
  earn: (stationId, recordId) => tyEarn(stationId, { recordId }) });

// Live-test handle (tools/check_parishes.mjs and the capture scripts).
window.__parishTest = {
  THREE, camera, scene, npRenderer, world, np, parish,
  // LANDMARKS-2: the walk-in doors and room controller, and Use (E), for headless tests.
  walkin: { doors: lxDoors, room: lxRoom, use: () => npUse(), near: () => npNearest() },
  teleport(x, z, yaw = np.yaw, pitch = np.pitch) { np.x = x; np.z = z; np.yaw = yaw; np.pitch = pitch; world.update(x, z, 999); tfLand.update(x, z, 99); cwStreetsMount.update(x, z, 999); },
  terraform: { land: tfLand, rain: tfRain, wind: tfWind, depthAt: (x, z) => tfWaterDepthAt(parish, x, z), flowAt: (x, z) => tfFlowAt(parish, x, z), litterAt: (key) => tfLitterAt(parish, key) },
  cityworks: cwStreetsMount,
  atmos: { world: atmos, sound: atSound, weather: () => atWeatherNow },
  projectsim: psWorld,
  classrooms: crWorld,
  openBoard(siteId) { const s = parish.sites.find((x) => x.id === siteId); if (s) npOpenBoard(s); return !!s; },
  walkable: { armed: () => wkArmed, arrive: wkArrive, parked: () => wkParked.length, driveId: () => wkDriveId },
  krewe: kwDress, begin: npBegin, newton: nwPhys, stats: () => world.stats(), npc: asNpc, motorPool: () => asOpenMotorPool(), setTime(i) { np.timeIdx = i; npApplySky(); mgRemount(); }, setWeather(i) { np.weatherIdx = i; npApplySky(); }, wildlife: npWild, life: () => mgLife, openMap: () => npToggle("map"), tycoon: { open: () => tyOpenLedger(), signs: tySigns, refresh: tyRefresh },
  // DEAN's applied module (one key per handle: a merge once repeated teleport/setTime here, dropping the streets,
  // ground and life updates — SURVEYOR, docs/evals/platform-review.md).
  dean: () => dnHere,
  interiors: { mount: ixWorld, doors: ixDoors, rentals: () => ixRentalDoors(), use: () => npUse(), root }, // INTERIORS' browser pass
  harvest: hvWorld,
  detail: dtPool, // SMOOTH: the time-sliced detail pool (stats(): pending, frameWorstMs, frameMs; drain())
};

/** The parish's own gated items plus the play layer's side games, each bound to a real site of this parish. */
function npPlayItems() {
  rbRegisterMechanics(); // ROBOTICS: the robotics games play in the shared panel by mechanic key
  return [...(parish.gated ?? []), ...[...slGamesFor(parish.id), ...kwKiosksFor(parish.id), ...bqGamesFor(parish.id), ...rbGamesFor(parish)].map((g) => ({ ...g, site: slResolveSite(parish, g.site)?.id ?? g.site }))];
}
const npSideGames = qmMountSideGames({ world: "parishes", worldName: parish.name, items: npPlayItems(), from: "parishes", page: ppHerePage() });
// CLASSROOMS' robotics bays open ROBOTICS' games through the side-game panel (gate respected).
globalThis.rbOpenGame = (id) => npSideGames?.playById?.(id) ?? false;
if (!slMountPathBoard($("menu-paths"), parish.id, { page: ppHerePage() })) plMountPathBoard($("menu-paths"), parish.id, { page: ppHerePage(), openLesson: (id) => { const l = (parish.fieldLessons ?? []).find((x) => x.id === id); if (l) npOpenLesson(l); } });
// KREWE side quests: a lesson, a union station and a mini-game at one site; the game button opens the side-game panel.
if (!kwMountQuestBoard($("menu-krewe"), parish.id, { page: ppHerePage(), completed: ppCompleted, onGame: () => npSideGames?.open() }).length) plMountQuestBoard($("menu-krewe"), parish.id, { page: ppHerePage(), completed: ppCompleted, openLesson: (id) => { const l = (parish.fieldLessons ?? []).find((x) => x.id === id); if (l) npOpenLesson(l); } });
// STORYLINE: pick your path (the menu at the world's start), the path's side stories, a glow over its boards, who greets first.
var stWorld = stMountPaths({
  three: THREE, root, parish, world, el: $("menu-storyline"), tier: npTierName,
  reducedMotion: (() => { try { return !!matchMedia("(prefers-reduced-motion: reduce)").matches; } catch { return false; } })(),
  toast: npToast, openLesson: (id) => { const l = (parish.fieldLessons ?? []).find((x) => x.id === id); if (l) npOpenLesson(l); },
  stationHref: (id, siteId) => npLink(id, siteId),
});
window.__parishTest.storyline = stWorld;
window.__parishTest.palette = paPalette;
// DRILLS (docs/consoles/DRILLS.md): timed scenario drills at fitting sites — briefing, objectives tied to real station
// steps, a debrief — offered on the First Responders, Disaster Relief and UN Training paths, recorded to the passport.
// DATAWORKS: a finished drill also becomes a consented episode (inert unless opted in; shared/dx-world.js).
drSetRecorder((id, award) => { try { dxCaptureDrill({ world: "parishes", map: parish.id, drillId: String(id).replace(/^drills:/, ""), result: { score: (award?.reputation ?? 0) * 10 } }); } catch (_) { /* never blocks the award */ } return ppAward(id, award); });
var drWorld = drMountDrills({
  three: THREE, root, parish, el: $("menu-drills"), tier: npTierName, reducedMotion: npReduced, toast: npToast,
  stationHref: (id, siteId) => npLink(id, siteId),
});
window.__parishTest.drills = drWorld;
// ROBOTICS (docs/consoles/ROBOTICS.md): robotics sites beside fitting map sites — moving robots that slow and stop as you
// near (speed-and-separation), an e-stop to test, lockout at the cell gate, scored on safe practice; listed under the drills.
var rbWorld = rbMountRobotics({
  three: THREE, root, parish, el: $("menu-drills"), tier: npTierName, reducedMotion: npReduced, toast: npToast,
  stationHref: (id, siteId) => npLink(id, siteId),
});
window.__parishTest.robotics = rbWorld;
// PACKS: the Holodeck Packs that play in this map (docs/consoles/PACKS.md), the chosen STORYLINE path's first.
npMountPacks($("menu-packs"), parish.id);
// COGNITION: the K-12 learning module runner — this parish's lessons, each flow played through its GRIOT guide (docs/consoles/COGNITION.md).
window.__parishTest.cognition = cgMountRunner($("menu-cognition"), { world: "parishes", parish: parish.id, report: cgWorldReport(npToast) });
// DEEPWATER: shoreline dive entries on this map (docs/consoles/DEEPWATER.md) open the Deep at a Bay Program region, with a way back.
npMountDiveEntries($("menu-packs"), parish);
function npMountDiveEntries(el, p) {
  const entries = (() => { try { return dwShoreEntriesFor(p, { from: `../parishes/parishes.html?parish=${encodeURIComponent(p.id)}` }); } catch { return []; } })();
  window.__parishTest.diveEntries = entries.map((e) => e.id);
  // In-world: a dive-flag post at each entry — one InstancedMesh for all of this map's entries (one draw call).
  if (entries.length) {
    const flag = new THREE.InstancedMesh(new THREE.BoxGeometry(0.6, 9, 3.2), new THREE.MeshLambertMaterial({ color: 0xd8322a }), entries.length);
    const m4 = new THREE.Matrix4();
    entries.forEach((e, i) => { const [x, z] = e.position; m4.makeTranslation(x, Math.max(npHeightAt(p, x, z), 0) + 4.5, z); flag.setMatrixAt(i, m4); });
    flag.instanceMatrix.needsUpdate = true; flag.name = "dw-dive-entries"; root.add(flag);
    window.__parishTest.diveMarkers = flag.count;
  }
  if (!el?.parentNode || !entries.length) return;
  const box = document.createElement("div");
  const head = document.createElement("p");
  head.className = "eyebrow"; head.style.marginTop = "16px"; head.textContent = "Dive entries from this shore";
  const row = document.createElement("div"); row.className = "row"; row.style.flexWrap = "wrap";
  for (const e of entries) { const a = document.createElement("a"); a.className = "btn"; a.href = e.url; a.textContent = e.label; row.appendChild(a); }
  box.append(head, row);
  el.parentNode.insertBefore(box, el.nextSibling);
}
function npMountPacks(el, parishId) {
  if (!el) return;
  const PK_PAGE = "../packs/index.html";
  // STORYLINE's chosen path (st-paths.js) orders the packs: that path's packs first.
  const chosen = (() => { try { return stChosenPath() ?? null; } catch { return null; } })();
  const packs = pkPacksAt(`parishes:${parishId}`).filter((p) => p.kind !== "library");
  const first = (p) => (chosen && (p.path === chosen || p.alsoPaths.includes(chosen)) ? 0 : 1);
  packs.sort((a, b) => first(a) - first(b) || a.name.localeCompare(b.name));
  el.textContent = "";
  if (!packs.length) return;
  const head = document.createElement("p");
  head.className = "eyebrow"; head.style.marginTop = "16px";
  head.textContent = `Holodeck Packs that play here · ${packs.length}`;
  const row = document.createElement("div");
  row.className = "row"; row.style.flexWrap = "wrap";
  for (const p of packs.slice(0, 8)) {
    const a = document.createElement("a");
    a.className = "btn"; a.href = PK_PAGE + "?pack=" + encodeURIComponent(p.id);
    a.textContent = p.name; a.title = p.title;
    row.appendChild(a);
  }
  const brand = document.createElement("p");
  brand.className = "note"; brand.textContent = packs.length > 8 ? `${PK_BRAND_LINE} — and ${packs.length - 8} more on the Packs page.` : PK_BRAND_LINE;
  el.append(head, row, brand);
}

// ------------------------------------------------------------------ INTERFACE: the in-world menu (docs/consoles/INTERFACE.md)
// Four tabs — Learn, Play, Map, Me — hold every mount the consoles write into (moved, never deleted). The menu reopens
// in-world (Esc, the Menu button, gamepad Start) and "Start walking" becomes "Resume". Gamepad: LB/RB switch tabs,
// the d-pad walks the focus, A presses. A first-visit onboarding (three cards, skippable, remembered).
var uxBegun = uxBegun ?? false;
const uxTabs = uxMountTabs($("menu"), { storageKey: "ux-menu-tab" });
function uxPassport() {
  const el = $("menu-passport"); if (!el) return;
  const visited = (np.state.visited[parish.id] ?? []).length, lessons = (parish.fieldLessons ?? []).filter((l) => np.state.lessons.includes(l.id)).length;
  let records = 0; try { records = ppRecords().length; } catch { /* no passport yet */ }
  el.textContent = `Passport: ${visited}/${parish.sites.length} sites visited here · ${lessons}/${(parish.fieldLessons ?? []).length} field lessons · ${records} station record${records === 1 ? "" : "s"} in this browser · ${tyBalance} ${TY_CURRENCY}.`;
}
function uxOpenMenu() {
  if (!np.playing) return;
  npClose(); np.playing = false; npKeys.clear();
  $("hud").hidden = true; $("menu").hidden = false; uxPassport();
  $("menu-start").focus();
}
uxPassport();
dxMountConsent($("menu-dataworks")); // DATAWORKS: the consent panel in the Me tab (off by default)
$("ux-menu-open").addEventListener("click", uxOpenMenu);
$("ux-open-map").addEventListener("click", () => npToggle("map"));
$("ux-open-ways").addEventListener("click", () => npToggle("parishes"));
{
  const sg = $("ux-sidegames");
  if (npSideGames?.open) sg.addEventListener("click", () => npSideGames.open()); else sg.hidden = true;
}
{
  // Reduced motion: the system setting wins; otherwise a per-browser choice applied at load (parishes.html patches
  // matchMedia before any module reads it), so every module's own reduced-motion path runs unchanged.
  const b = $("ux-reduced");
  const sys = (() => { try { return !!window.__uxSystemReduced; } catch { return false; } })();
  let on = false; try { on = localStorage.getItem("ux-reduced") === "1"; } catch { /* blocked */ }
  const paint = () => { b.textContent = sys ? "Reduced motion: on (system)" : `Reduced motion: ${on ? "on" : "off"}`; b.setAttribute("aria-pressed", String(sys || on)); };
  paint(); if (sys) b.disabled = true;
  b.addEventListener("click", () => { on = !on; try { localStorage.setItem("ux-reduced", on ? "1" : "0"); } catch { /* blocked */ } paint(); npToast(`Reduced motion ${on ? "on" : "off"}: reloading the world still${on ? "" : " off"}…`); setTimeout(() => location.reload(), 600); });
}
const uxOb = npReturnSiteId ? null : uxOnboarding({
  el: $("ux-onboard"), key: "ux-onboarded-v1", force: npParams.get("onboard") === "1",
  onDone: () => $("menu-start")?.focus(),
  cards: [
    { title: "Walk a real map", body: `${parish.name} is a 4 km world. WASD or the stick walks, drag to look, E or Use opens what is near you.` },
    { title: "Four tabs", body: "Learn holds paths, lessons, drills and packs. Play holds quests, games and Crew Credits. Map holds the map and the ways out. Me holds your passport and settings." },
    { title: "Come back any time", body: "Press Esc, Start on a gamepad or the Menu button to open this menu again. Your progress stays in this browser." },
  ],
});
$("ux-replay").addEventListener("click", () => uxOb?.show());
const uxPadPrev = {};
function uxPadMenu() {
  let pad = null; try { pad = navigator.getGamepads?.()?.[0] ?? null; } catch { pad = null; }
  if (!pad) return;
  const edge = (i) => { const on = !!pad.buttons?.[i]?.pressed, was = uxPadPrev[i]; uxPadPrev[i] = on; return on && !was; };
  const start = edge(9), lb = edge(4), rb = edge(5), up = edge(12), down = edge(13), a = edge(0), bBtn = edge(1);
  if (np.playing) { if (start && !np.modal) uxOpenMenu(); return; }
  if ($("menu").hidden) return;
  if (start || bBtn) { if (uxBegun || start) npBegin(); return; }
  if (lb) uxTabs.step(-1);
  if (rb) uxTabs.step(1);
  if (up || down) {
    const card = uxOb?.shown ? $("ux-onboard") : $("menu");
    const list = [...card.querySelectorAll('button:not([disabled]),a[href],[tabindex="0"]')].filter((x) => x.offsetParent !== null);
    const i = list.indexOf(document.activeElement);
    list[(i + (down ? 1 : -1) + list.length) % list.length]?.focus();
  }
  if (a && document.activeElement && document.activeElement !== document.body) document.activeElement.click();
}
window.__parishTest.ux = { tabs: uxTabs.ids, select: (t) => uxTabs.select(t), current: () => uxTabs.current(), open: () => uxOpenMenu(), resume: () => npBegin(), onboarding: uxOb };

// INTERFACE: the contextual prompt sits over what it names (the board, the sign, the way out), projected each frame;
// off screen or behind the camera it falls back to its bottom-centre place.
const uxV = new THREE.Vector3();
function uxAnchorPrompt() {
  const p = $("hud-prompt");
  const at = np.playing && !np.modal && np.near?.at;
  if (!at || p.hidden) { if (p.dataset.uxAnchor) { p.style.left = p.style.top = p.style.bottom = p.style.transform = ""; delete p.dataset.uxAnchor; } return; }
  uxV.set(at[0], Math.max(npHeightAt(parish, at[0], at[1]), 0) + 3.2, at[1]).project(camera);
  const x = (uxV.x + 1) / 2 * innerWidth, y = (1 - uxV.y) / 2 * innerHeight;
  if (uxV.z > 1 || x < 40 || x > innerWidth - 40 || y < 90 || y > innerHeight - 160) { if (p.dataset.uxAnchor) { p.style.left = p.style.top = p.style.bottom = p.style.transform = ""; delete p.dataset.uxAnchor; } return; }
  p.style.left = `${Math.round(x)}px`; p.style.top = `${Math.round(y)}px`; p.style.bottom = "auto"; p.style.transform = "translate(-50%, -100%)";
  p.dataset.uxAnchor = np.near.kind;
}
