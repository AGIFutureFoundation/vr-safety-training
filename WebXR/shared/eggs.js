// Hard Hat Hunt — one of the platform's Easter eggs (see docs/easter-egg.md).
//
// A small golden hard hat is hidden in twelve stations, chosen across
// programmes. A station calls plantHardHat() exactly once from its own
// build(root), with a spot for the hat, and this module does everything
// else: the mesh, the click, the localStorage record and the toast.
//
// The hard hat is deliberately kept OFF the station's own interaction system
// (shared/kit.js's markInteractive / state.hits / Session.select): a real
// station step that is clicked out of order counts as a wrong answer, and
// finding a hidden collectible must never be able to do that. So this module
// raycasts for itself, using the read-only camera each app already exposes
// for its own live tests (window.__smartcityTest.camera(), __tradesTest,
// __holodeckTest) — the hard hat is never added to state.selectables and
// never reaches Session.select, so it can never touch a station's steps or
// scoring.
//
// Storage is this browser only, like everything else on this platform.

const KEY = "vr-training-hardhats-v1";

/** How many hard hats there are to find. The single source of truth for the
 *  counter on the homepage, the unlock rule in the race, and the checker. */
export const HARD_HAT_TOTAL = 12;

function eggStorage(storage) {
  if (storage) return storage;
  try { return globalThis.localStorage ?? null; } catch (_) { return null; }
}

function load(storage) {
  try {
    const raw = JSON.parse(eggStorage(storage)?.getItem(KEY) || "[]");
    return Array.isArray(raw) ? raw.filter((id) => typeof id === "string") : [];
  } catch (_) { return []; }
}

function save(list, storage) {
  try { eggStorage(storage)?.setItem(KEY, JSON.stringify(list)); } catch (_) { /* private mode — run unsaved */ }
}

/** The ids found so far, oldest first. */
export function hardHatsFound(storage) { return load(storage); }

/**
 * Record a find. Idempotent — finding the same hat twice changes nothing.
 * Returns { found, total, allFound, justCompleted }.
 */
export function recordHardHat(id, storage) {
  const list = load(storage);
  const already = list.includes(id);
  if (!already && id) { list.push(id); save(list, storage); }
  const found = list.length;
  return { found, total: HARD_HAT_TOTAL, allFound: found >= HARD_HAT_TOTAL, justCompleted: !already && found >= HARD_HAT_TOTAL };
}

/** Clear every find. Used by the checker; not exposed in any app UI. */
export function clearHardHats(storage) { try { eggStorage(storage)?.removeItem(KEY); } catch (_) { /* ignore */ } }

// ------------------------------------------------------------------ toast

let toastEl = null;
function toast(text) {
  if (typeof document === "undefined") return;
  if (!toastEl) {
    toastEl = document.createElement("div");
    toastEl.setAttribute("role", "status");
    toastEl.id = "hardhat-toast";
    Object.assign(toastEl.style, {
      position: "fixed", left: "50%", bottom: "22px", transform: "translateX(-50%)",
      zIndex: "9999", maxWidth: "calc(100vw - 32px)", background: "#101b27",
      border: "1px solid #f2c14b", borderRadius: "6px", padding: "10px 16px",
      font: "14px/1.4 system-ui, sans-serif", color: "#edf6fb", boxShadow: "0 24px 60px rgba(0,0,0,.55)",
      transition: "opacity .25s", opacity: "0", pointerEvents: "none",
    });
    document.body.appendChild(toastEl);
  }
  toastEl.textContent = text;
  toastEl.style.opacity = "1";
  clearTimeout(toastEl._t);
  toastEl._t = setTimeout(() => { if (toastEl) toastEl.style.opacity = "0"; }, 2600);
}

// ------------------------------------------------------------------ raycast

/** The one hard hat live right now — only one station is ever on screen. */
let live = null;

function activeCamera() {
  return window.__smartcityTest?.camera?.() ?? window.__tradesTest?.camera?.() ?? window.__holodeckTest?.camera?.() ?? null;
}

if (typeof window !== "undefined" && typeof window.addEventListener === "function") {
  window.addEventListener("click", (e) => {
    if (!live || !live.mesh.visible) return;
    const canvas = document.querySelector("canvas");
    const camera = activeCamera();
    if (!canvas || !camera) return;
    const rect = canvas.getBoundingClientRect();
    if (e.clientX < rect.left || e.clientX > rect.right || e.clientY < rect.top || e.clientY > rect.bottom) return;
    const THREE = live.THREE;
    const ndc = new THREE.Vector2(
      ((e.clientX - rect.left) / rect.width) * 2 - 1,
      -((e.clientY - rect.top) / rect.height) * 2 + 1,
    );
    const ray = new THREE.Raycaster();
    ray.setFromCamera(ndc, camera);
    const hits = ray.intersectObject(live.mesh, true);
    if (!hits.length) return;
    const id = live.id;
    live.mesh.visible = false;
    const r = recordHardHat(id);
    window.__hardHatsTest = { last: id, ...r };
    toast(r.allFound
      ? `Hard hat found — ${r.found}/${r.total}, all of them! A livery is waiting in the race.`
      : `Hard hat found — ${r.found}/${r.total}.`);
  });
}

// ------------------------------------------------------------------ plant

/**
 * A station calls this once from its own build(root):
 *
 *     plantHardHat(root, THREE, "cooling-tower", [2.6, 1.15, -2.6]);
 *
 * `pos` is [x, y, z] in root's local space. Already found → still built
 * (so the call stays a plain one-liner with no station-side branching), just
 * hidden. Returns the group, in case a station wants to nudge it further.
 */
export function plantHardHat(root, THREE, id, pos = [0, 0, 0]) {
  const g = new THREE.Group();
  g.position.set(pos[0] ?? 0, pos[1] ?? 0, pos[2] ?? 0);
  const shell = new THREE.Mesh(
    new THREE.SphereGeometry(0.11, 14, 10, 0, Math.PI * 2, 0, Math.PI * 0.55),
    new THREE.MeshStandardMaterial({ color: 0xf2c14b, roughness: 0.35, metalness: 0.15, emissive: 0x5c3f00, emissiveIntensity: 0.3 }),
  );
  shell.position.y = 0.05;
  const brim = new THREE.Mesh(
    new THREE.CylinderGeometry(0.135, 0.135, 0.018, 20),
    new THREE.MeshStandardMaterial({ color: 0xc99a2e, roughness: 0.4, metalness: 0.1 }),
  );
  brim.position.y = 0.015;
  const ridge = new THREE.Mesh(
    new THREE.BoxGeometry(0.02, 0.06, 0.24),
    new THREE.MeshStandardMaterial({ color: 0xffd97a, roughness: 0.4 }),
  );
  ridge.position.y = 0.09;
  g.add(shell, brim, ridge);
  g.traverse((o) => { o.userData.hardHatEgg = id; });
  root.add(g);

  g.visible = !hardHatsFound().includes(id);

  live = { id, mesh: g, THREE };

  // A slow bob and spin, driven off the wall clock rather than the station's
  // own update loop, so this one line never has to be wired into it.
  const t0 = (typeof performance !== "undefined" ? performance.now() : Date.now()) / 1000;
  const spin = () => {
    if (!g.parent) return; // the station moved on; stop animating a disposed mesh
    const t = (typeof performance !== "undefined" ? performance.now() : Date.now()) / 1000 - t0;
    g.rotation.y = t * 0.8;
    g.position.y = (pos[1] ?? 0) + Math.sin(t * 1.6) * 0.03;
    requestAnimationFrame(spin);
  };
  if (typeof requestAnimationFrame === "function") requestAnimationFrame(spin);

  return g;
}
