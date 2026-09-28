// The video-background layer (console CINEMA, docs/home-backgrounds.md).
//
// One helper for every surface that shows a looping background: the
// homepage hero and world cards, the programme track pages' header band,
// each world's start screen, the Bay Atlas header, the Holodeck landing and
// the sign-in dialog's backdrop. The loops themselves are listed in
// WebXR/home/media/backgrounds.json — one entry per slot, so a licensed or
// generated clip can replace any slot by editing that one file.
//
// Rules every mount follows:
//   - muted, looped, playsinline, a poster, preload="metadata";
//   - it plays only while on screen (IntersectionObserver) and the tab is
//     visible;
//   - prefers-reduced-motion: reduce, or navigator.connection.saveData,
//     shows the poster only (CSS hides the video before any script runs);
//   - a video that fails to load is removed and the poster stays;
//   - a scrim sits between the picture and any text for contrast.
//
// Two ways in:
//   cnEnhanceAll(root)  wires <video data-cn-slot> elements a generator
//                       already wrote into the page (homepage, track pages),
//                       plus any [data-cn-toggle] pause/play button.
//   cnMount(host, slot) builds the layer inside `host` at run time, reading
//                       backgrounds.json from the first media folder the page
//                       can reach (see CN_BASES) — used by the bundled worlds,
//                       where one page is served from several depths.
//
// Every top-level name is prefixed cn…/CN_… because tools/bundle_webxr.py
// concatenates modules into one scope.

/** Where the media folder may sit relative to the page, nearest first: the
 *  flat published folder (media/), a track page below it (../media/), the
 *  repository homepage (home/media/), a world's source page
 *  (../home/media/) and a world's per-app dist page (../../home/media/). */
export const CN_BASES = ["media/", "../media/", "home/media/", "../home/media/", "../../home/media/"];

/** The layer's own styles, inlined by the generators and injected by cnMount. */
export const CN_CSS = `
.cn-bg{position:absolute;inset:0;z-index:-1;overflow:hidden;pointer-events:none;background:#06121c center/cover no-repeat}
.cn-bg video{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;display:block}
.cn-bg::after{content:"";position:absolute;inset:0;background:var(--cn-scrim,linear-gradient(180deg,rgba(5,10,16,.45) 0%,rgba(5,10,16,.62) 60%,rgba(5,10,16,.82) 100%))}
.cn-bg.cn-still video{display:none}
.cn-credit{position:absolute;right:6px;bottom:4px;z-index:1;font:11px/1.2 system-ui,sans-serif;color:#e8eef4;background:rgba(5,10,16,.72);padding:2px 6px;border-radius:4px;pointer-events:auto}
.cn-toggle{position:absolute;right:12px;top:12px;z-index:2;min-height:36px;min-width:44px;padding:6px 12px;border-radius:999px;border:1px solid rgba(255,255,255,.55);background:rgba(5,10,16,.72);color:#fff;font:600 13px/1 system-ui,sans-serif;cursor:pointer}
.cn-toggle:focus-visible{outline:3px solid #7fd4ff;outline-offset:2px}
.cn-toggle[hidden]{display:none}
@media (prefers-reduced-motion: reduce){.cn-bg video{display:none}.cn-toggle{display:none}}
`;

/** Poster only: the reader asked for less motion, or for less data. */
export function cnStill() {
  try {
    if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return true;
    if (navigator.connection && navigator.connection.saveData) return true;
  } catch { /* no window */ }
  return false;
}

function cnStyle() {
  if (typeof document === "undefined" || document.getElementById("cn-style")) return;
  const s = document.createElement("style");
  s.id = "cn-style"; s.textContent = CN_CSS;
  document.head.appendChild(s);
}

let cnObserver = null;
function cnWatch(video) {
  if (!("IntersectionObserver" in window)) { cnPlay(video); return; }
  cnObserver = cnObserver || new IntersectionObserver((entries) => {
    for (const e of entries) {
      e.target.cnOnScreen = e.isIntersecting;
      if (e.isIntersecting) cnPlay(e.target); else e.target.pause();
    }
  }, { threshold: 0.05 });
  cnObserver.observe(video);
}

function cnPlay(video) {
  if (video.cnUserPaused || document.hidden || cnStill()) return;
  // Autoplay needs muted set as a property too, not only the attribute.
  video.muted = true;
  const p = video.play();
  if (p && p.catch) p.catch(() => { /* blocked or failed: the poster stays */ });
}

function cnFallback(video) {
  // A clip that cannot play leaves the poster behind (the layer's background).
  const layer = video.closest(".cn-bg");
  video.removeAttribute("src");
  for (const s of video.querySelectorAll("source")) s.remove();
  video.remove();
  if (layer) layer.classList.add("cn-still");
  for (const b of document.querySelectorAll(`[data-cn-toggle="${video.dataset.cnSlot}"]`)) b.hidden = true;
}

/** Wire one generated or mounted <video>. Idempotent. */
export function cnEnhance(video) {
  if (!video || video.cnWired) return;
  video.cnWired = true;
  video.muted = true; video.loop = true; video.playsInline = true;
  const layer = video.closest(".cn-bg");
  if (cnStill()) {
    // Poster only: stop any fetch the autoplay attribute started.
    video.removeAttribute("autoplay"); video.preload = "none"; video.pause();
    if (layer) layer.classList.add("cn-still");
    for (const b of document.querySelectorAll(`[data-cn-toggle="${video.dataset.cnSlot}"]`)) b.hidden = true;
    return;
  }
  video.addEventListener("error", () => cnFallback(video), true);
  const last = video.querySelector("source:last-of-type");
  if (last) last.addEventListener("error", () => cnFallback(video));
  cnWatch(video);
}

/** The pause/play button (WCAG 2.2.2) for the video of the same slot. */
export function cnWireToggle(button) {
  if (!button || button.cnWired) return;
  button.cnWired = true;
  const slot = button.dataset.cnToggle;
  const video = document.querySelector(`video[data-cn-slot="${slot}"]`);
  if (!video || cnStill()) { button.hidden = true; return; }
  const label = () => {
    const paused = !!video.cnUserPaused;
    button.setAttribute("aria-pressed", paused ? "true" : "false");
    button.textContent = paused ? "Play background" : "Pause background";
  };
  button.addEventListener("click", () => {
    video.cnUserPaused = !video.cnUserPaused;
    if (video.cnUserPaused) video.pause(); else { video.cnOnScreen = true; cnPlay(video); }
    label();
  });
  label();
}

let cnVisWired = false;
/** Wire every generated background video and toggle under `root`. */
export function cnEnhanceAll(root = document) {
  for (const v of root.querySelectorAll("video[data-cn-slot]")) cnEnhance(v);
  for (const b of root.querySelectorAll("[data-cn-toggle]")) cnWireToggle(b);
  if (!cnVisWired) {
    cnVisWired = true;
    document.addEventListener("visibilitychange", () => {
      for (const v of document.querySelectorAll("video[data-cn-slot]")) {
        if (document.hidden) v.pause(); else if (v.cnOnScreen !== false) cnPlay(v);
      }
    });
  }
}

let cnManifestP = null;
/** backgrounds.json from the first media folder this page can reach, with
 *  that folder's absolute URL; null on file:// or when none answers. */
export function cnManifest() {
  if (cnManifestP) return cnManifestP;
  cnManifestP = (async () => {
    if (typeof location === "undefined" || location.protocol === "file:") return null;
    for (const base of CN_BASES) {
      try {
        const url = new URL(base + "backgrounds.json", location.href);
        const r = await fetch(url);
        if (!r.ok) continue;
        const j = await r.json();
        if (j && Array.isArray(j.slots)) return { base: new URL(base, location.href).href, slots: j.slots };
      } catch { /* try the next folder */ }
    }
    return null;
  })();
  return cnManifestP;
}

/** A slot's file name, refused unless it is a plain name in the media folder. */
export function cnFile(name) {
  const s = String(name ?? "");
  return /^[a-z0-9][a-z0-9._-]{0,80}\.(mp4|webm|jpg|jpeg|png|webp)$/i.test(s) && !s.includes("..") ? s : null;
}

/**
 * Build the background layer for `slot` as the first child of `host`.
 * Resolves to the layer element, or null when the slot or the media folder
 * cannot be reached (the host is left exactly as it was).
 */
export async function cnMount(host, slot, opts = {}) {
  try { return await cnBuild(host, slot, opts); } catch { return null; }
}

async function cnBuild(host, slot, { scrim = null, credit = true } = {}) {
  if (!host || typeof document === "undefined" || typeof fetch === "undefined" || typeof getComputedStyle === "undefined") return null;
  const m = await cnManifest();
  const entry = m && m.slots.find((s) => s.slot === slot);
  const poster = entry && cnFile(entry.poster);
  if (!entry || !poster) return null;
  cnStyle();
  if (getComputedStyle(host).position === "static") host.style.position = "relative";
  host.style.isolation = "isolate";
  const layer = document.createElement("div");
  layer.className = "cn-bg";
  layer.setAttribute("aria-hidden", "true");
  layer.style.backgroundImage = `url("${m.base}${poster}")`;
  if (scrim) layer.style.setProperty("--cn-scrim", scrim);
  const src = cnFile(entry.src);
  if (src && !cnStill()) {
    const v = document.createElement("video");
    v.muted = true; v.loop = true; v.playsInline = true; v.preload = "metadata";
    for (const a of ["muted", "loop", "playsinline"]) v.setAttribute(a, "");
    v.setAttribute("preload", "metadata");
    v.setAttribute("poster", m.base + poster);
    v.dataset.cnSlot = slot;
    const webm = cnFile(entry.webm);
    if (webm) { const s = document.createElement("source"); s.src = m.base + webm; s.type = "video/webm"; v.appendChild(s); }
    const s = document.createElement("source"); s.src = m.base + src; s.type = "video/mp4"; v.appendChild(s);
    layer.appendChild(v);
    cnEnhance(v);
  } else {
    layer.classList.add("cn-still");
  }
  host.insertBefore(layer, host.firstChild);
  if (credit && entry.kind === "licensed" && entry.credit) {
    const c = document.createElement("span");
    c.className = "cn-credit";
    c.textContent = String(entry.credit).slice(0, 120);
    host.appendChild(c);
  }
  return layer;
}
