/**
 * In-app Easter eggs — Photo Mode, the Golden Wrench, the Crane Claw
 * minigame (SmartCiti.X), the Scaffold Climber arcade cabinet (Holodeck) and
 * Toolbox Talk Bingo (the instructor console). See docs/easter-egg.md,
 * section "Inside the apps".
 *
 * This module takes NO imports of its own — every three.js class, DOM
 * reference and app slice it touches is handed in through the `ctx` object
 * a mount*() function receives. That is deliberate, not an oversight: this
 * one file is shared by three very different apps (a WebGL scene, another
 * WebGL scene, and a plain-DOM console that is not supposed to know what a
 * simulator even is — see WebXR/instructor/js/app.js's own header and
 * tools/check_console.mjs), and none of the three should have to bundle
 * dependencies the others need. tools/bundle_webxr.py's per-app module
 * lists therefore need only ONE new line each: this file.
 *
 * Every feature here is honest about what it is (a hidden, optional bit of
 * fun) and touches nothing that changes a station's steps, its scoring, or
 * the auditable TrainingRecords/xAPI trail — see shared/records.js. Anything
 * this module remembers (a best claw score, which tool was golden today, a
 * night-shift check-in) lives in its own small localStorage keys, never in
 * the platform's real records.
 */

// --------------------------------------------------------------- utilities

/** Today's local calendar day as "YYYY-MM-DD" — local, not UTC, so the
 *  Golden Wrench and Night Shift agree with the clock the learner can see
 *  on their own machine. */
function eggLocalDateKey(d = new Date()) {
  const y = d.getFullYear(), m = String(d.getMonth() + 1).padStart(2, "0"), day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** A small, deterministic string hash (FNV-1a), so "seeded from the date"
 *  means the same seed all day and a different one tomorrow. */
function eggHash(str) {
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 0x01000193); }
  return h >>> 0;
}

/** seed -> integer in [0, n). Not cryptographic — it only has to be stable
 *  for a day and to spread reasonably across a roster. */
function eggSeededIndex(seed, n) {
  if (n <= 0) return -1;
  // A cheap xorshift step so consecutive seeds (station id appended to the
  // day's hash) don't land on adjacent indices.
  let x = seed || 1;
  x ^= x << 13; x >>>= 0;
  x ^= x >>> 17;
  x ^= x << 5; x >>>= 0;
  return x % n;
}

/** True while a key event would type into a field rather than run a command —
 *  the same rule every app's own keyboard layer already follows. */
function eggIsTypingTarget(e) {
  const t = e.target;
  if (!t) return false;
  const tag = t.tagName;
  return tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || t.isContentEditable;
}

function eggEscapeHtml(s) {
  return String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}

/** One shared WebAudio context, created lazily on the first user gesture
 *  (a key press or a click always precedes the first sound this module
 *  makes, so autoplay policies are never an issue). Every jingle in this
 *  file is synthesised here at run time — nothing is a sample or a file. */
let eggAudioCtx = null;
function eggAudio() {
  if (!eggAudioCtx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    eggAudioCtx = new AC();
  }
  if (eggAudioCtx.state === "suspended") eggAudioCtx.resume().catch(() => {});
  return eggAudioCtx;
}

/** A short run of notes (Hz), each its own oscillator with a quick attack
 *  and decay so a whole phrase never clicks or pops. `wave` picks the
 *  timbre; every jingle in this module is an original short phrase, not a
 *  quotation of anything. */
function eggPlayNotes(notes, { each = 0.11, wave = "triangle", gain = 0.16 } = {}) {
  const ac = eggAudio();
  if (!ac) return;
  const t0 = ac.currentTime;
  notes.forEach((freq, i) => {
    if (!freq) return; // 0/null = a rest
    const osc = ac.createOscillator();
    const g = ac.createGain();
    osc.type = wave;
    osc.frequency.value = freq;
    const t = t0 + i * each;
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(gain, t + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0008, t + each * 0.92);
    osc.connect(g); g.connect(ac.destination);
    osc.start(t); osc.stop(t + each);
  });
}

/** A dull metal clunk — the crane hook's own click sound, and its claw drop. */
function eggPlayClunk(pitch = 1) {
  const ac = eggAudio();
  if (!ac) return;
  const dur = 0.16;
  const buf = ac.createBuffer(1, Math.floor(ac.sampleRate * dur), ac.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / d.length, 3);
  const src = ac.createBufferSource();
  src.buffer = buf;
  const band = ac.createBiquadFilter();
  band.type = "bandpass";
  band.frequency.value = 320 * pitch;
  band.Q.value = 1.6;
  const g = ac.createGain();
  g.gain.value = 0.35;
  src.connect(band); band.connect(g); g.connect(ac.destination);
  src.start();
}

/** A canvas element downloaded as a PNG — the platform's own render, saved
 *  to the learner's machine and nowhere else. */
function eggDownloadCanvas(canvas, filename) {
  const a = document.createElement("a");
  a.href = canvas.toDataURL("image/png");
  a.download = filename;
  document.body.append(a);
  a.click();
  a.remove();
}

/** Normalized device coordinates for a pointer event against one canvas —
 *  the same maths every app's own picking already does, kept local here so
 *  this module raycasts on its own and never has to reach into an app's
 *  private input state. */
function eggNdc(e, canvas) {
  const r = canvas.getBoundingClientRect();
  return { x: ((e.clientX - r.left) / r.width) * 2 - 1, y: -((e.clientY - r.top) / r.height) * 2 + 1 };
}

/** A small floating overlay shell: a backdrop plus a centred card, appended
 *  to <body>, with a close() that removes both. Every 3D-app overlay in this
 *  module (Photo Mode, the claw, the arcade cabinet) is built on this so
 *  Escape and the close button behave the same way everywhere. */
function eggOverlay({ onClose } = {}) {
  const back = document.createElement("div");
  back.style.cssText = "position:fixed;inset:0;z-index:99990;background:rgba(4,8,12,0.82);"
    + "display:flex;align-items:center;justify-content:center;font-family:'Barlow',Arial,sans-serif;";
  const card = document.createElement("div");
  card.style.cssText = "position:relative;background:#0d151c;border:2px solid #f2c14b;border-radius:10px;"
    + "box-shadow:0 12px 40px rgba(0,0,0,0.6);max-width:min(94vw,720px);max-height:92vh;overflow:auto;"
    + "padding:18px;color:#eaf1f7;";
  back.appendChild(card);
  document.body.appendChild(back);
  let closed = false;
  function close() {
    if (closed) return;
    closed = true;
    document.removeEventListener("keydown", onKey, true);
    back.remove();
    onClose?.();
  }
  function onKey(e) { if (e.key === "Escape") { e.preventDefault(); close(); } }
  document.addEventListener("keydown", onKey, true);
  back.addEventListener("mousedown", (e) => { if (e.target === back) close(); });
  return { back, card, close };
}

function eggButton(label, { primary = false } = {}) {
  const b = document.createElement("button");
  b.type = "button";
  b.textContent = label;
  b.style.cssText = `font:600 14px/1 'Barlow',Arial,sans-serif;padding:9px 14px;border-radius:7px;cursor:pointer;`
    + (primary
      ? "background:#f2c14b;color:#191307;border:1px solid #f2c14b;"
      : "background:#182430;color:#eaf1f7;border:1px solid #3a4a58;");
  return b;
}

// =====================================================================
// SmartCiti.X — Photo Mode, the Golden Wrench, the Crane Claw, Night Shift
// =====================================================================

const EGG_WRENCH_LOG_KEY = "smartcitix-egg-golden-wrench-v1";
const EGG_CLAW_BEST_KEY = "smartcitix-egg-claw-best-v1";
const EGG_TOOL_WORDS = /wrench|drill|grinder|hammer|meter|gauge|radio|flashlight|tape|level|hose|torque/i;
const EGG_CLAW_PRIZES = ["Torque Wrench", "Tape Measure", "Hard Hat", "Two-Way Radio", "Impact Wrench",
  "Spirit Level", "Flashlight", "Multimeter", "Tire Gauge", "Hose Reel"];

/** This browser's Easter-egg log for Golden Wrench finds — never the real
 *  TrainingRecords/xAPI trail, and never read by any instructor tool. */
function eggWrenchLog() {
  try { return JSON.parse(localStorage.getItem(EGG_WRENCH_LOG_KEY) || "[]"); } catch { return []; }
}
function eggWrenchNote(entry) {
  try {
    const list = eggWrenchLog();
    list.push(entry);
    localStorage.setItem(EGG_WRENCH_LOG_KEY, JSON.stringify(list.slice(-200)));
  } catch { /* private mode — the run itself is unaffected */ }
}

/**
 * Mounts every SmartCiti.X-side egg. `ctx`:
 *   THREE, renderer, camera, scene, worldRoot, store — the running app's own.
 *   state — app.js's own mutable `state` object (room, mode, stage, hits,
 *           session, paused): read live, never copied, so this module always
 *           sees the current station without app.js calling back into it.
 *   SIMS_META — the station roster (for the Golden Wrench's daily pick).
 *   unionAbbrev(room) — returns the union abbreviation the station's own
 *           sign already carries (e.g. "IBEW"), or "" when none; keeps this
 *           module from needing its own copy of the union registry.
 */
export function mountSmartCityEggs(ctx) {
  const { THREE, renderer, camera, worldRoot, state, store, SIMS_META, unionAbbrev } = ctx;
  const canvas = renderer.domElement;

  // ------------------------------------------------------------ Photo Mode
  let photoOpen = false;
  function frameStationPhoto() {
    if (photoOpen || !state.room) return;
    let base;
    try { base = canvas.toDataURL("image/png"); }
    catch (err) {
      // A cross-origin environment model (shared/environment.js) can taint
      // the canvas; say so rather than silently doing nothing.
      alert("Photo Mode could not read this frame — this station's environment model blocks a browser screenshot.");
      return;
    }
    photoOpen = true;
    const wasPaused = state.paused;
    state.paused = true;

    const img = new Image();
    img.decoding = "async";
    img.onload = () => {
      const w = img.width, h = img.height;
      const out = document.createElement("canvas");
      out.width = w; out.height = h;
      const g = out.getContext("2d");
      g.drawImage(img, 0, 0, w, h);

      // The hard-hat-yellow frame, with a hazard-stripe corner so it never
      // reads as a plain rectangle.
      const frame = Math.max(10, Math.round(Math.min(w, h) * 0.028));
      g.fillStyle = "#f2c14b";
      g.fillRect(0, 0, w, frame); g.fillRect(0, h - frame, w, frame);
      g.fillRect(0, 0, frame, h); g.fillRect(w - frame, 0, frame, h);
      g.save();
      g.beginPath(); g.rect(0, 0, w, h); g.clip();
      g.fillStyle = "#191307";
      const stripe = frame * 1.6;
      for (let x = -stripe; x < w + frame; x += stripe * 2) {
        g.save();
        g.beginPath(); g.rect(0, 0, w, frame * 0.42); g.clip();
        g.translate(x, 0); g.rotate(Math.PI / 4);
        g.fillRect(0, -frame, stripe * 0.7, frame * 4);
        g.restore();
      }
      g.restore();

      // The caption bar: station name, union wordmark, platform mark.
      const barH = Math.round(h * 0.09);
      g.fillStyle = "rgba(8,13,18,0.86)";
      g.fillRect(frame, h - frame - barH, w - frame * 2, barH);
      g.fillStyle = "#f4fbff";
      g.textBaseline = "middle";
      g.font = `800 ${Math.round(barH * 0.42)}px 'Barlow Condensed', Arial, sans-serif`;
      g.textAlign = "left";
      g.fillText((state.room.title ?? state.room.name ?? "SmartCiti.X").toUpperCase(), frame + barH * 0.35, h - frame - barH * 0.42);
      const union = unionAbbrev?.(state.room) ?? "";
      g.font = `600 ${Math.round(barH * 0.24)}px 'Barlow', Arial, sans-serif`;
      g.fillStyle = "#9fb0bf";
      const sub = union ? `${union} · SmartCiti.X training campus` : "SmartCiti.X training campus";
      g.fillText(sub, frame + barH * 0.35, h - frame - barH * 0.12);
      g.textAlign = "right";
      g.font = `700 ${Math.round(barH * 0.3)}px 'Barlow Condensed', Arial, sans-serif`;
      g.fillStyle = "#f2c14b";
      g.fillText("PHOTO MODE", w - frame - barH * 0.35, h - frame - barH * 0.3);

      showPhotoOverlay(out, state.room.id ?? "station", wasPaused);
    };
    img.src = base;
  }

  function showPhotoOverlay(canvasOut, stationId, wasPaused) {
    const ov = eggOverlay({ onClose: () => { state.paused = wasPaused; photoOpen = false; } });
    const title = document.createElement("h2");
    title.textContent = "Photo Mode";
    title.style.cssText = "margin:0 0 10px;font:800 20px 'Barlow Condensed',Arial,sans-serif;color:#f2c14b;";
    const preview = document.createElement("img");
    preview.src = canvasOut.toDataURL("image/png");
    preview.style.cssText = "display:block;max-width:100%;max-height:64vh;border-radius:6px;margin-bottom:12px;";
    const note = document.createElement("p");
    note.textContent = "This is the platform's own render, frozen where you were standing — nothing outside this browser was used to make it.";
    note.style.cssText = "font:13px/1.4 'Barlow',Arial,sans-serif;color:#9fb0bf;margin:0 0 12px;";
    const row = document.createElement("div");
    row.style.cssText = "display:flex;gap:10px;justify-content:flex-end;";
    const dl = eggButton("Download PNG", { primary: true });
    dl.addEventListener("click", () => eggDownloadCanvas(canvasOut, `smartcitix-${stationId}-photo-mode.png`));
    const close = eggButton("Close");
    close.addEventListener("click", ov.close);
    row.append(dl, close);
    ov.card.append(title, preview, note, row);
  }

  window.addEventListener("keydown", (e) => {
    if (eggIsTypingTarget(e) || e.repeat || e.metaKey || e.ctrlKey || e.altKey) return;
    if ((e.key === "p" || e.key === "P") && state.room && !photoOpen) frameStationPhoto();
  });

  // -------------------------------------------------------- Golden Wrench
  let goldenObj = null;
  let goldenStationId = null;
  let goldenFoundStamped = false;

  function pickGoldenStationId() {
    if (!SIMS_META?.length) return null;
    const seed = eggHash(`golden-wrench:${eggLocalDateKey()}`);
    return SIMS_META[eggSeededIndex(seed, SIMS_META.length)]?.id ?? null;
  }

  function armGoldenWrench(room) {
    goldenObj = null;
    goldenFoundStamped = false;
    if (!goldenStationId || room?.id !== goldenStationId) return;
    const hits = state.hits ?? {};
    const toolIds = Object.keys(hits).filter((id) => EGG_TOOL_WORDS.test(id)).sort();
    if (!toolIds.length) return; // this station has no recognisable hand tool today
    const seed = eggHash(`golden-wrench:${eggLocalDateKey()}:${room.id}`);
    const id = toolIds[eggSeededIndex(seed, toolIds.length)];
    const obj = hits[id];
    if (!obj) return;
    obj.traverse((o) => {
      if (!o.isMesh || !o.material) return;
      o.material = Array.isArray(o.material) ? o.material.map((m) => m.clone()) : o.material.clone();
      const mats = Array.isArray(o.material) ? o.material : [o.material];
      for (const m of mats) {
        if (m.color) m.color.set(0xf7c948);
        if ("emissive" in m) { m.emissive.set(0x6b4a00); m.emissiveIntensity = 0.55; }
        if ("metalness" in m) m.metalness = Math.max(m.metalness ?? 0, 0.7);
        if ("roughness" in m) m.roughness = Math.min(m.roughness ?? 1, 0.3);
      }
    });
    goldenObj = obj;
  }

  canvas.addEventListener("pointerdown", (e) => {
    if (!goldenObj || renderer.xr.isPresenting) return;
    const ndc = eggNdc(e, canvas);
    const ray = new THREE.Raycaster();
    ray.setFromCamera(ndc, camera);
    if (!ray.intersectObject(goldenObj, true).length) return;
    eggPlayNotes([523.25, 659.25, 784.0, 1046.5], { each: 0.1, wave: "square", gain: 0.14 });
    if (!goldenFoundStamped) {
      goldenFoundStamped = true;
      const already = eggWrenchLog().some((n) => n.date === eggLocalDateKey());
      if (!already) {
        eggWrenchNote({ date: eggLocalDateKey(), stationId: state.room?.id ?? "", note: "found the golden wrench", at: new Date().toISOString() });
      }
    }
  });

  // ----------------------------------------------------------- Crane Claw
  let craneHook = null;
  let craneClicks = 0;
  let craneClickTimer = null;

  function armCraneClaw(room) {
    craneHook = null;
    craneClicks = 0;
    if (room?.category !== "Maritime & Ports" || !state.stage?.root) return;
    const g = new THREE.Group();
    g.position.set(-24, 8.4, -22);
    const cable = new THREE.Mesh(
      new THREE.CylinderGeometry(0.025, 0.025, 4.2, 6),
      new THREE.MeshStandardMaterial({ color: 0x2a2f36, roughness: 0.6, metalness: 0.4 }));
    cable.position.y = 1.6;
    g.add(cable);
    const hook = new THREE.Mesh(
      new THREE.TorusGeometry(0.32, 0.075, 8, 16, Math.PI * 1.3),
      new THREE.MeshStandardMaterial({ color: 0xf2c14b, roughness: 0.45, metalness: 0.35, emissive: 0x3a2a00, emissiveIntensity: 0.5 }));
    hook.rotation.z = Math.PI * 0.62;
    hook.position.y = -0.55;
    g.add(hook);
    // A generous invisible collider makes a small, far-away hook a fair click.
    const collider = new THREE.Mesh(
      new THREE.SphereGeometry(0.9, 8, 6),
      new THREE.MeshBasicMaterial({ visible: false }));
    collider.position.y = -0.4;
    g.add(collider);
    state.stage.root.add(g);
    craneHook = collider;
  }

  // Capture-phase on `window`, not on the canvas: a listener only jumps the
  // queue ahead of a same-element listener when it sits on an ANCESTOR (the
  // capture phase runs top-down before the target's own listeners run in
  // their registration order, capture or not) — so this has to be above the
  // canvas in the tree to reliably win the race and suppress the drag-look
  // app.js's own canvas listener would otherwise start on this same click.
  window.addEventListener("pointerdown", (e) => {
    if (!craneHook || renderer.xr.isPresenting) return;
    const ndc = eggNdc(e, canvas);
    const ray = new THREE.Raycaster();
    ray.setFromCamera(ndc, camera);
    if (!ray.intersectObject(craneHook, true).length) return;
    e.stopImmediatePropagation();
    e.preventDefault();
    eggPlayClunk(1 + craneClicks * 0.12);
    craneClicks += 1;
    clearTimeout(craneClickTimer);
    if (craneClicks >= 3) {
      craneClicks = 0;
      openClawGame();
    } else {
      craneClickTimer = setTimeout(() => { craneClicks = 0; }, 4000);
    }
  }, true);

  function openClawGame() {
    const wasPaused = state.paused;
    state.paused = true;
    let running = true;
    let onKey = null;
    const ov = eggOverlay({
      onClose: () => {
        state.paused = wasPaused;
        running = false;
        if (onKey) document.removeEventListener("keydown", onKey, true);
      },
    });
    const title = document.createElement("h2");
    title.textContent = "Crane Claw";
    title.style.cssText = "margin:0 0 6px;font:800 20px 'Barlow Condensed',Arial,sans-serif;color:#f2c14b;";
    const sub = document.createElement("p");
    let best = 0;
    try { best = Number(localStorage.getItem(EGG_CLAW_BEST_KEY) || 0); } catch { /* ignore */ }
    sub.textContent = `Left/Right to move, Space to drop. Best: ${best}. For fun only — nothing here counts toward the station.`;
    sub.style.cssText = "font:13px 'Barlow',Arial,sans-serif;color:#9fb0bf;margin:0 0 10px;";
    const cvs = document.createElement("canvas");
    cvs.width = 420; cvs.height = 320;
    cvs.style.cssText = "display:block;border-radius:6px;border:1px solid #3a4a58;background:#0a1016;";
    const scoreLine = document.createElement("p");
    scoreLine.style.cssText = "font:700 14px 'Barlow Condensed',Arial,sans-serif;color:#eaf1f7;margin:10px 0 0;";
    const row = document.createElement("div");
    row.style.cssText = "display:flex;justify-content:flex-end;margin-top:10px;";
    const close = eggButton("Close");
    close.addEventListener("click", ov.close);
    row.append(close);
    ov.card.append(title, sub, cvs, scoreLine, row);

    const g = cvs.getContext("2d");
    const LANES = 5, laneW = cvs.width / LANES;
    let claw = { lane: 2, dropping: false, y: 34, targetLane: 2 };
    let score = 0, drops = 3;
    const prizes = [];
    for (let i = 0; i < LANES; i++) {
      prizes.push({ lane: i, name: EGG_CLAW_PRIZES[(i * 3 + Math.floor(Math.random() * 3)) % EGG_CLAW_PRIZES.length], claimed: false });
    }
    function laneX(lane) { return laneW * lane + laneW / 2; }
    onKey = (e) => {
      if (e.key === "ArrowLeft") { claw.targetLane = Math.max(0, claw.targetLane - 1); e.preventDefault(); }
      else if (e.key === "ArrowRight") { claw.targetLane = Math.min(LANES - 1, claw.targetLane + 1); e.preventDefault(); }
      else if (e.key === " " && !claw.dropping && drops > 0) { claw.dropping = true; drops -= 1; e.preventDefault(); }
      else return;
      e.stopImmediatePropagation();
    };
    document.addEventListener("keydown", onKey, true);

    function step() {
      if (!running) return;
      claw.lane += (claw.targetLane - claw.lane) * 0.25;
      if (claw.dropping) {
        claw.y += 6;
        if (claw.y >= 250) {
          const p = prizes.find((pp) => pp.lane === Math.round(claw.lane) && !pp.claimed);
          if (p) { p.claimed = true; score += 25; eggPlayNotes([392, 494, 587], { each: 0.09 }); }
          else eggPlayClunk(0.7);
          claw.dropping = false; claw.y = 34;
          if (drops <= 0) endGame();
        }
      }
      draw();
      if (running) requestAnimationFrame(step);
    }
    function draw() {
      g.clearRect(0, 0, cvs.width, cvs.height);
      g.fillStyle = "#0a1016"; g.fillRect(0, 0, cvs.width, cvs.height);
      g.strokeStyle = "#1c2731"; g.lineWidth = 1;
      for (let i = 1; i < LANES; i++) { g.beginPath(); g.moveTo(i * laneW, 0); g.lineTo(i * laneW, cvs.height); g.stroke(); }
      for (const p of prizes) {
        g.fillStyle = p.claimed ? "#233042" : "#f2c14b";
        g.fillRect(laneX(p.lane) - 30, 270, 60, 26);
        g.fillStyle = p.claimed ? "#4a5a68" : "#191307";
        g.font = "10px Arial"; g.textAlign = "center";
        g.fillText(p.claimed ? "taken" : p.name, laneX(p.lane), 287);
      }
      g.strokeStyle = "#8b98a5"; g.lineWidth = 3;
      g.beginPath(); g.moveTo(laneX(claw.lane), 0); g.lineTo(laneX(claw.lane), claw.y); g.stroke();
      g.fillStyle = "#f2c14b";
      g.beginPath(); g.arc(laneX(claw.lane), claw.y, 12, 0, Math.PI * 2); g.fill();
      scoreLine.textContent = `Score ${score} · Drops left ${drops}`;
    }
    function endGame() {
      running = false;
      document.removeEventListener("keydown", onKey, true);
      if (score > best) { try { localStorage.setItem(EGG_CLAW_BEST_KEY, String(score)); } catch { /* ignore */ } }
      scoreLine.textContent = `Final score ${score}${score > best ? " — new best!" : ` · Best ${Math.max(score, best)}`}`;
    }
    draw();
    requestAnimationFrame(step);
  }

  // ---------------------------------------------------------- Night Shift
  const NIGHT_LINE = "It's the small hours where you are — take the run at your own pace, and remember to actually rest after.";
  function isNightShift() { const h = new Date().getHours(); return h >= 0 && h < 4; }
  function flickerMasts() {
    if (!state.stage?.root) return;
    const lights = [];
    state.stage.root.traverse((o) => { if (o.isPointLight) lights.push(o); });
    if (!lights.length) return;
    const orig = lights.map((l) => l.intensity);
    lights.forEach((l) => { l.intensity = 0; });
    setTimeout(() => { lights.forEach((l, i) => { l.intensity = orig[i]; }); }, 90);
  }

  // ------------------------------------------------------ the one poller
  // Every SmartCiti.X station-enter is detected here (rather than app.js
  // calling back into this module at several points) — one cheap interval
  // watching state.room.id, so this module has exactly one seam with app.js:
  // the mount call and the live `state` reference it reads.
  goldenStationId = pickGoldenStationId();
  let lastRoomId = null;
  setInterval(() => {
    const id = state.room?.id ?? null;
    if (id === lastRoomId) return;
    lastRoomId = id;
    craneHook = null;
    goldenObj = null;
    if (!id) return; // back at the hub
    armGoldenWrench(state.room);
    armCraneClaw(state.room);
    if (isNightShift()) {
      flickerMasts();
      const hud = store.get().hud;
      if (hud?.feedback) store.patch("hud", { feedback: `${hud.feedback} ${NIGHT_LINE}` });
    }
  }, 300);
}

// =====================================================================
// Holodeck — the Scaffold Climber arcade cabinet
// =====================================================================

const EGG_SCAFFOLD_BEST_KEY = "holodeck-egg-scaffold-best-v1";

/**
 * Mounts the arcade cabinet: a small standing prop, always present in the
 * Holodeck scene (added once, straight into `worldRoot`, never cleared by a
 * hole/procedure reset), that opens a canvas minigame when clicked. `ctx`:
 * THREE, renderer, camera, worldRoot.
 */
export function mountHolodeckEggs(ctx) {
  const { THREE, renderer, camera, worldRoot } = ctx;
  const canvas = renderer.domElement;

  const cab = new THREE.Group();
  cab.position.set(-3.6, 0, 2.4);
  const plinth = new THREE.Mesh(new THREE.CylinderGeometry(0.9, 0.95, 0.04, 20),
    new THREE.MeshStandardMaterial({ color: 0x14181f, roughness: 0.9 }));
  plinth.position.y = 0.02;
  cab.add(plinth);
  const body = new THREE.Mesh(new THREE.BoxGeometry(0.62, 1.3, 0.55),
    new THREE.MeshStandardMaterial({ color: 0x241a3a, roughness: 0.5, metalness: 0.15 }));
  body.position.y = 0.69;
  cab.add(body);
  const screen = new THREE.Mesh(new THREE.PlaneGeometry(0.42, 0.32),
    new THREE.MeshStandardMaterial({ color: 0x0a2a1a, emissive: 0x2fd07a, emissiveIntensity: 0.9, roughness: 0.4 }));
  screen.position.set(0, 1.02, 0.276);
  cab.add(screen);
  const marquee = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.16, 0.06),
    new THREE.MeshStandardMaterial({ color: 0xf2c14b, emissive: 0xf2c14b, emissiveIntensity: 0.7, roughness: 0.4 }));
  marquee.position.set(0, 1.42, 0.24);
  cab.add(marquee);
  for (const dx of [-0.18, 0.18]) {
    const stick = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.14, 8),
      new THREE.MeshStandardMaterial({ color: 0x8b98a5, metalness: 0.6, roughness: 0.4 }));
    stick.position.set(dx, 0.82, 0.3);
    cab.add(stick);
  }
  const collider = new THREE.Mesh(new THREE.SphereGeometry(0.55, 8, 6), new THREE.MeshBasicMaterial({ visible: false }));
  collider.position.y = 0.8;
  cab.add(collider);
  worldRoot.add(cab);

  // On `window`, capturing — see the Crane Claw's own listener in
  // mountSmartCityEggs for why an ancestor is required to win this race.
  window.addEventListener("pointerdown", (e) => {
    const ndc = eggNdc(e, canvas);
    const ray = new THREE.Raycaster();
    ray.setFromCamera(ndc, camera);
    if (!ray.intersectObject(collider, true).length) return;
    e.stopImmediatePropagation();
    e.preventDefault();
    openScaffoldClimber();
  }, true);

  function openScaffoldClimber() {
    let running = true;
    let onKey = null;
    const ov = eggOverlay({
      onClose: () => { running = false; if (onKey) document.removeEventListener("keydown", onKey, true); },
    });
    const title = document.createElement("h2");
    title.textContent = "Scaffold Climber";
    title.style.cssText = "margin:0 0 6px;font:800 20px 'Barlow Condensed',Arial,sans-serif;color:#f2c14b;";
    let best = 0;
    try { best = Number(localStorage.getItem(EGG_SCAFFOLD_BEST_KEY) || 0); } catch { /* ignore */ }
    const sub = document.createElement("p");
    sub.textContent = `A/D or arrows to dodge, W or Up to climb, T to tie off at each level. Best: ${best}. A retro cabinet, for fun — this never touches a real station.`;
    sub.style.cssText = "font:13px 'Barlow',Arial,sans-serif;color:#9fb0bf;margin:0 0 10px;";
    const cvs = document.createElement("canvas");
    cvs.width = 360; cvs.height = 480;
    cvs.style.cssText = "display:block;border-radius:6px;border:1px solid #3a4a58;background:#0a1016;";
    const scoreLine = document.createElement("p");
    scoreLine.style.cssText = "font:700 14px 'Barlow Condensed',Arial,sans-serif;color:#eaf1f7;margin:10px 0 0;";
    const row = document.createElement("div");
    row.style.cssText = "display:flex;justify-content:flex-end;margin-top:8px;";
    const close = eggButton("Close");
    row.append(close);
    ov.card.append(title, sub, cvs, scoreLine, row);

    const g = cvs.getContext("2d");
    const LANES = 3, laneW = cvs.width / LANES;
    const player = { lane: 1, y: cvs.height - 60, tiedOff: true };
    let climbY = 0;          // total height climbed, in px-equivalent
    let level = 0;
    let score = 0;
    let lives = 3;
    let tieWindow = 0;       // >0 while a tie-off prompt is live
    const tools = [];        // falling hazards: { lane, y, speed }
    let spawnAt = 0;

    function laneX(l) { return laneW * l + laneW / 2; }
    onKey = (e) => {
      if (!["ArrowLeft", "ArrowRight", "ArrowUp", "a", "d", "w", "A", "D", "W", "t", "T"].includes(e.key)) return;
      e.preventDefault(); e.stopImmediatePropagation();
      if (e.key === "ArrowLeft" || e.key === "a" || e.key === "A") player.lane = Math.max(0, player.lane - 1);
      else if (e.key === "ArrowRight" || e.key === "d" || e.key === "D") player.lane = Math.min(LANES - 1, player.lane + 1);
      else if (e.key === "ArrowUp" || e.key === "w" || e.key === "W") { climbY += 22; player.tiedOff = false; }
      else if (e.key === "t" || e.key === "T") {
        if (tieWindow > 0) { score += 50; tieWindow = 0; player.tiedOff = true; eggPlayNotes([440, 660], { each: 0.09 }); }
      }
    };
    document.addEventListener("keydown", onKey, true);

    function endGame(reason) {
      running = false;
      document.removeEventListener("keydown", onKey, true);
      if (score > best) { try { localStorage.setItem(EGG_SCAFFOLD_BEST_KEY, String(score)); } catch { /* ignore */ } }
      scoreLine.textContent = `${reason} — score ${score}${score > best ? " — new best!" : ` · Best ${Math.max(score, best)}`}`;
    }

    let last = performance.now();
    function step(now) {
      if (!running) return;
      const dt = Math.min(0.05, (now - last) / 1000); last = now;
      // A new level every 120px climbed: a tie-off window opens.
      const newLevel = Math.floor(climbY / 120);
      if (newLevel > level) {
        level = newLevel;
        tieWindow = 1.4;
        if (level >= 8) { endGame("Topped out — tied off all the way"); return; }
      }
      if (tieWindow > 0) { tieWindow -= dt; if (tieWindow <= 0 && !player.tiedOff) { /* missed it — no penalty, just no bonus */ } }
      spawnAt -= dt;
      if (spawnAt <= 0) {
        spawnAt = Math.max(0.5, 1.3 - level * 0.08);
        tools.push({ lane: Math.floor(Math.random() * LANES), y: -20, speed: 90 + level * 8 });
      }
      for (let i = tools.length - 1; i >= 0; i--) {
        const t = tools[i];
        t.y += t.speed * dt;
        if (t.y > cvs.height + 20) { tools.splice(i, 1); continue; }
        if (t.lane === player.lane && Math.abs(t.y - player.y) < 20) {
          tools.splice(i, 1);
          lives -= 1;
          eggPlayClunk(1.3);
          if (lives <= 0) { endGame("A dropped tool got you"); return; }
        }
      }
      draw();
      if (running) requestAnimationFrame(step);
    }
    function draw() {
      g.clearRect(0, 0, cvs.width, cvs.height);
      g.fillStyle = "#0a1016"; g.fillRect(0, 0, cvs.width, cvs.height);
      g.strokeStyle = "#1c2731"; g.lineWidth = 1;
      for (let i = 1; i < LANES; i++) { g.beginPath(); g.moveTo(i * laneW, 0); g.lineTo(i * laneW, cvs.height); g.stroke(); }
      for (let ly = cvs.height - 20 - ((climbY) % 40); ly > -40; ly -= 40) {
        g.strokeStyle = "#2a3540"; g.beginPath(); g.moveTo(0, ly); g.lineTo(cvs.width, ly); g.stroke();
      }
      g.fillStyle = "#8b6b3a";
      for (const t of tools) g.fillRect(laneX(t.lane) - 8, t.y - 6, 16, 12);
      g.fillStyle = player.tiedOff ? "#59c97b" : "#f2c14b";
      g.beginPath(); g.arc(laneX(player.lane), player.y, 13, 0, Math.PI * 2); g.fill();
      if (tieWindow > 0) {
        g.fillStyle = "#f2c14b"; g.font = "700 16px 'Barlow Condensed', Arial";
        g.textAlign = "center"; g.fillText("TIE OFF! (T)", cvs.width / 2, 30);
      }
      g.fillStyle = "#eaf1f7"; g.font = "12px Arial"; g.textAlign = "left";
      g.fillText(`Level ${level}   Lives ${"♥".repeat(Math.max(0, lives))}`, 8, 16);
      scoreLine.textContent = `Score ${score}`;
    }
    requestAnimationFrame((t) => { last = t; step(t); });
    close.addEventListener("click", ov.close);
  }
}

// =====================================================================
// Instructor console — Toolbox Talk Bingo
// =====================================================================

/** A generic, honest toolbox-talk hazard list — the padding used whenever a
 *  live class hasn't yet produced 24 distinct hazard notes of its own. */
const EGG_HAZARD_PADDING = [
  "Fall hazard", "Struck-by hazard", "Caught-in/between", "Electrical hazard", "Confined space",
  "Hot work", "Lockout/tagout", "PPE required", "Hearing protection zone", "Trip hazard",
  "Chemical exposure", "Excavation cave-in", "Overhead load", "Slip / wet floor", "Noise hazard",
  "Heat stress", "Cold stress", "Sharp edges", "Pinch point", "Vehicle traffic",
  "Respiratory hazard", "Biohazard", "Silica dust", "Arc flash", "Ergonomic strain",
  "Ladder safety", "Housekeeping", "Fire watch",
];

/** The hazard phrases this class has actually named, pulled from every
 *  roster row's own recent event log — no new import, no reach into a
 *  simulator, just the notes the console already keeps in memory. */
function eggHazardsFromRoster(roster) {
  const seen = new Set();
  for (const row of roster?.values?.() ?? []) {
    for (const ev of row.events ?? []) {
      if (ev.kind !== "hazard" || !ev.text) continue;
      const label = String(ev.text).split(" — ")[0].split(":")[0].trim();
      if (label && label.length < 60) seen.add(label);
    }
  }
  return [...seen];
}

function eggShuffled(list) {
  const a = list.slice();
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
}

function eggBingoCells(roster) {
  const named = eggHazardsFromRoster(roster);
  const pool = [...new Set([...named, ...EGG_HAZARD_PADDING])];
  const picked = eggShuffled(pool).slice(0, 24);
  while (picked.length < 24) picked.push(EGG_HAZARD_PADDING[picked.length % EGG_HAZARD_PADDING.length]);
  const cells = picked.slice(0, 12).concat(["FREE — SAFETY FIRST"]).concat(picked.slice(12, 24));
  return cells;
}

function eggOpenBingoWindow(roster) {
  const cells = eggBingoCells(roster);
  const w = window.open("", "_blank", "width=520,height=640");
  if (!w) { alert("Your browser blocked the new window — allow pop-ups to print the bingo card."); return; }
  const rows = [];
  for (let r = 0; r < 5; r++) {
    const tds = cells.slice(r * 5, r * 5 + 5)
      .map((c) => `<td${c.startsWith("FREE") ? ' class="free"' : ""}>${eggEscapeHtml(c)}</td>`).join("");
    rows.push(`<tr>${tds}</tr>`);
  }
  const doc = `<!doctype html><html><head><meta charset="utf-8"><title>Toolbox Talk Bingo</title>
<style>
  body{font-family:'Barlow',Arial,sans-serif;background:#fff;color:#111;margin:24px;}
  h1{font-size:22px;margin:0 0 2px;}
  p.sub{color:#555;font-size:13px;margin:0 0 18px;}
  table{border-collapse:collapse;width:100%;table-layout:fixed;}
  td{border:2px solid #222;height:92px;padding:6px;font-size:13px;text-align:center;vertical-align:middle;}
  td.free{background:#f2c14b;font-weight:800;}
  .foot{margin-top:16px;font-size:12px;color:#555;}
  button{margin-top:16px;font:600 14px Arial;padding:8px 14px;cursor:pointer;}
  @media print{button{display:none;}}
</style></head><body>
<h1>Toolbox Talk Bingo</h1>
<p class="sub">For the room, not for the record. Mark a square when your crew actually calls that hazard out during the talk — this card is never saved to any learner's training record.</p>
<table>${rows.join("")}</table>
<p class="foot">Generated ${eggEscapeHtml(new Date().toLocaleString())} from this class's live session log, topped up with common toolbox-talk hazard categories.</p>
<button onclick="window.print()">Print</button>
</body></html>`;
  w.document.open();
  w.document.write(doc);
  w.document.close();
}

/**
 * Mounts the instructor console's one egg: a floating button that opens a
 * fresh, printable bingo card in a new window. `ctx.getRoster()` returns the
 * console's own live `roster` Map (id -> row), read only for its `.events`.
 */
export function mountInstructorEggs(ctx) {
  const { getRoster } = ctx;
  const btn = document.createElement("button");
  btn.type = "button";
  btn.textContent = "🎯 Toolbox Talk Bingo";
  btn.title = "Print a bingo card for the room — not for the record.";
  btn.style.cssText = "position:fixed;right:16px;bottom:16px;z-index:9990;"
    + "font:600 13px 'Barlow',Arial,sans-serif;padding:9px 14px;border-radius:20px;cursor:pointer;"
    + "background:#f2c14b;color:#191307;border:1px solid #d9a72c;box-shadow:0 4px 14px rgba(0,0,0,0.35);";
  btn.addEventListener("click", () => eggOpenBingoWindow(getRoster?.() ?? new Map()));
  document.body.appendChild(btn);
}

// A narrow escape hatch for tools/check_eggs_app.mjs: the pure logic behind
// the date seeding, the daily pick and the bingo card, so the checker can
// assert on it directly rather than only on side effects. Never imported by
// an app — mount*Eggs() above is the real public surface.
export const _internal = {
  eggLocalDateKey, eggHash, eggSeededIndex, eggBingoCells, eggHazardsFromRoster, EGG_HAZARD_PADDING,
};
