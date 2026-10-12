// OMEGA-CLAW — robots that keep working in one world (docs/omega-claw.md). SmartCiti.X Holodeck · Powered by AGI Corp.
//
// A persistent simulation loop for the parishes page: the six robot sites keep running the hive's jobs (shared/oh-hive.js,
// read only) with the model the Omega Claw promoted for each scenario, minute after simulated minute.
//   - Deterministic for a seed: the world's whole state is (seed, simulated minutes), and a world restored from a snapshot
//     replays to exactly the same place.
//   - Between the learner's visits it catches up: on the next visit the elapsed minutes (capped) are replayed on this
//     device. Nothing runs while the page is closed, and while the tab is hidden the loop is paused (no catch-up).
//   - Nothing is uploaded and nothing is stored remotely: the snapshot is two numbers in this browser's local storage.
//   - The governor checks every step (vbRun inside the hive), and the loop never approves anything: a job that names a
//     physical robot waits for a supervisor, and the physical path stays disabled. Physical dispatches: 0.
//
// Every top-level name starts with `oc`/`OC_` (the bundler shares one scope).

import { ohHive } from "./oh-hive.js";
import { RB_SITES } from "./rb-robotics-data.js";

export const OC_WORLD_KEY = "oc-world-v1";
export const OC_WORLD_TICKS_PER_DAY = 480;
export const OC_WORLD_JOBS_PER_DAY = 120;
export const OC_WORLD_MS_PER_MINUTE = 1000; // one simulated minute per second while the tab is visible
export const OC_WORLD_CATCHUP_MAX = 480; // at most one simulated day is replayed on return

/**
 * ocWorld({ seed, promoted, policyFor }) -> { step, run, stats, snapshot, minutes, hive }
 * `promoted` maps a scenario id to a model id; `policyFor(modelId, scenarioId, env, seed)` returns that model's policy
 * (a function obs -> action) or null, in which case the site's scripted policy runs and the use is counted as such.
 */
export function ocWorld({ seed = 1, promoted = {}, policyFor = null, nJobs = OC_WORLD_JOBS_PER_DAY, ticksPerDay = OC_WORLD_TICKS_PER_DAY, sites = RB_SITES } = {}) {
  let day = 0, minutes = 0, hive = null;
  const totals = { completed: 0, refused: 0, vetoed: 0, declined: 0, dispatched: 0, steps: 0, stepsMonitored: 0, dispatchedChecked: 0, physicalDispatched: 0, waitingSupervisor: 0, jobs: 0 };
  const uses = {}; // scenario -> { model, runs }
  const bySite = Object.fromEntries(sites.map((s) => [s.id, { siteId: s.id, name: s.name, rig: s.rig, completed: 0, last: null }]));

  const wrap = (policyId, env, jobSeed) => {
    const sc = env?.scenario?.id ?? null;
    const m = sc ? promoted[sc] ?? null : null;
    let pol = null;
    if (m && typeof policyFor === "function") { try { pol = policyFor(m, sc, env, jobSeed) ?? null; } catch (_) { pol = null; } }
    const u = (uses[sc] ??= { model: pol ? m : "scripted", runs: 0, scripted: 0 });
    if (pol) { u.model = m; u.runs += 1; } else u.scripted += 1;
    return pol;
  };
  function fresh() {
    hive = ohHive({ seed: ((seed >>> 0) * 1009 + day) >>> 0, nJobs, ticksPerDay, policyFor: wrap, sites });
    hive.on("complete", (e) => { const b = bySite[e.to]; if (b) { b.completed += 1; b.last = { jobId: e.jobId ?? null, minute: minutes }; } });
  }
  function fold() {
    const m = hive.metrics();
    for (const k of ["completed", "refused", "vetoed", "declined", "dispatched", "steps", "stepsMonitored", "dispatchedChecked", "physicalDispatched", "jobs"]) totals[k] += m[k] ?? 0;
    totals.waitingSupervisor += m.awaitingApproval ?? 0;
  }
  fresh();

  function step() {
    hive.step();
    minutes += 1;
    if (hive.now() >= ticksPerDay) { fold(); day += 1; fresh(); }
  }
  function stats() {
    const m = hive.metrics();
    const add = (k) => totals[k] + (m[k] ?? 0);
    const steps = add("steps"), monitored = add("stepsMonitored");
    const running = hive.jobs().filter((j) => ["moving", "running", "queued"].includes(j.status));
    const sitesNow = Object.values(bySite).map((b) => ({ ...b, busy: running.filter((j) => j.site === b.siteId).length }));
    return {
      seed, day, minute: hive.now(), minutes, completed: add("completed"), refused: add("refused"), vetoed: add("vetoed"), declined: add("declined"),
      dispatched: add("dispatched"), dispatchedChecked: add("dispatchedChecked"), steps, stepsMonitored: monitored, governorEveryStep: steps === monitored,
      physicalDispatched: add("physicalDispatched"), waitingSupervisor: totals.waitingSupervisor + (m.awaitingApproval ?? 0),
      models: Object.fromEntries(Object.entries(uses).map(([k, v]) => [k, { ...v }])), promoted: { ...promoted }, sites: sitesNow,
    };
  }
  return {
    step,
    run(n = 1) { for (let i = 0; i < n; i += 1) step(); return minutes; },
    stats,
    snapshot() { return { v: 1, seed, minutes }; },
    minutes: () => minutes,
    hive: () => hive,
  };
}

/** Rebuild a world from a snapshot by replaying it (deterministic for the seed). */
export function ocWorldRestore(snap, opts = {}) {
  const w = ocWorld({ ...opts, seed: snap?.seed ?? opts.seed ?? 1 });
  w.run(Math.max(0, Math.min(Number(snap?.minutes) | 0, 100000)));
  return w;
}

function ocWorldStore(storage) { if (storage) return storage; try { return globalThis.localStorage ?? null; } catch (_) { return null; } }
export function ocWorldLoad(storage = null) { try { const v = JSON.parse(ocWorldStore(storage)?.getItem(OC_WORLD_KEY) ?? "null"); return v?.v === 1 ? v : null; } catch (_) { return null; } }
export function ocWorldSave(snap, storage = null) { try { ocWorldStore(storage)?.setItem(OC_WORLD_KEY, JSON.stringify(snap)); return true; } catch (_) { return false; } }
export function ocWorldForget(storage = null) { try { ocWorldStore(storage)?.removeItem(OC_WORLD_KEY); return true; } catch (_) { return false; } }

/**
 * The loop on a page. Starts paused if the document is hidden; ticks one simulated minute per `msPerMinute` while
 * visible; pauses on `visibilitychange` to hidden and on `pagehide`. On start it restores the saved snapshot and
 * replays the minutes elapsed since it was saved (capped), so the sites have kept working between visits.
 * Returns { world, paused(), pause(), resume(), stop(), catchUp, onTick(fn) }.
 */
export function ocWorldLoop({ seed = 1, promoted = {}, policyFor = null, doc = typeof document !== "undefined" ? document : null, win = typeof window !== "undefined" ? window : null, storage = null, now = () => Date.now(), setTimer = (fn, ms) => setInterval(fn, ms), clearTimer = (h) => clearInterval(h), msPerMinute = OC_WORLD_MS_PER_MINUTE, catchUpMax = OC_WORLD_CATCHUP_MAX } = {}) {
  const saved = ocWorldLoad(storage);
  const start = saved && saved.seed === seed ? saved : { v: 1, seed, minutes: 0, savedAt: now() };
  const away = saved && saved.seed === seed && Number.isFinite(saved.savedAt) ? Math.max(0, Math.floor((now() - saved.savedAt) / msPerMinute)) : 0;
  const catchUp = Math.min(away, catchUpMax);
  const world = ocWorldRestore({ seed, minutes: (start.minutes | 0) + catchUp }, { promoted, policyFor });
  const fns = [];
  let handle = null, stopped = false, ticks = 0, hiddenTicks = 0;
  const save = () => ocWorldSave({ ...world.snapshot(), savedAt: now() }, storage);
  const tick = () => {
    if (doc && doc.visibilityState === "hidden") { hiddenTicks += 1; pause(); return; } // belt and braces: never step hidden
    world.step(); ticks += 1;
    if (ticks % 10 === 0) save();
    for (const fn of fns) { try { fn(world); } catch (_) { /* a view never stops the world */ } }
  };
  function pause() { if (handle != null) { clearTimer(handle); handle = null; save(); } }
  function resume() { if (stopped || handle != null || (doc && doc.visibilityState === "hidden")) return; handle = setTimer(tick, msPerMinute); }
  const onVis = () => { if (doc.visibilityState === "hidden") pause(); else resume(); };
  doc?.addEventListener?.("visibilitychange", onVis);
  win?.addEventListener?.("pagehide", pause);
  save();
  resume();
  return {
    world, catchUp,
    paused: () => handle == null,
    pause, resume,
    stop() { stopped = true; pause(); doc?.removeEventListener?.("visibilitychange", onVis); win?.removeEventListener?.("pagehide", pause); },
    onTick(fn) { if (typeof fn === "function") fns.push(fn); },
    counts: () => ({ ticks, hiddenTicks }),
  };
}

/**
 * The world in the scene: one small status lamp above each robot site on this map, amber while a hive job is at work
 * there and green when idle, driven by ocWorld.stats().sites. Desktop high tier only (phone and headset tiers get
 * nothing). Stated budget: one mesh and 48 triangles per site (an 8 x 4 sphere sharing one geometry), two shared
 * untextured basic materials, 0 lights, 0 textures. `sites` is rbMountRobotics(...).sites ({ id, position: [x, z], y }).
 */
export const OC_LAMP_BUDGET = Object.freeze({ meshesPerSite: 1, trianglesPerSite: 48, lights: 0, textures: 0, tiers: Object.freeze(["high"]) });
export function ocMountSiteLamps({ three: T = null, root = null, sites = [], tier = "balanced" } = {}) {
  if (!T || !root || !OC_LAMP_BUDGET.tiers.includes(tier) || !sites.length) return null;
  const geo = new T.SphereGeometry(0.6, 8, 4);
  const mats = { busy: new T.MeshBasicMaterial({ color: 0xffb020 }), idle: new T.MeshBasicMaterial({ color: 0x4fd18b }) };
  const lamps = sites.map((s) => {
    const m = new T.Mesh(geo, mats.idle);
    m.name = `oc-lamp-${s.id}`; m.userData.site = s.id; m.userData.state = "idle";
    m.position.set(s.position[0], (Number(s.y) || 0) + 7.5, s.position[1]);
    root.add(m);
    return m;
  });
  function update(stats) {
    const by = new Map((stats?.sites ?? []).map((x) => [x.siteId, x]));
    for (const m of lamps) { const busy = (by.get(m.userData.site)?.busy ?? 0) > 0; m.material = busy ? mats.busy : mats.idle; m.userData.state = busy ? "busy" : "idle"; }
  }
  return { lamps, update, states: () => lamps.map((m) => ({ site: m.userData.site, state: m.userData.state })), counts: () => ({ meshes: lamps.length, triangles: lamps.length * OC_LAMP_BUDGET.trianglesPerSite, lights: 0, textures: 0 }) };
}
