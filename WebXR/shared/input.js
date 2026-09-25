/**
 * The deep input layer: the gamepad poller, the keyboard binding table and
 * the voice grammar — all of it pure, so every one of them can be driven
 * headless from Node with a fake `navigator` (see tools/check_input.mjs).
 *
 * Why this is one module rather than three:
 *
 * - The three devices name the same small set of actions. A d-pad press, a
 *   Tab key and the word "next" all mean "focus the next control this step
 *   names". Keeping one action table is what makes the interface brief's rule
 *   — every bound action is also reachable by keyboard and mouse — checkable
 *   rather than aspirational.
 * - None of it may complete a step. Voice and the pads navigate, focus,
 *   adjust, read back and open panels; the select/press/drag/turn paths in
 *   shared/game.js stay where they are. `focus` moves the keyboard cursor and
 *   nothing else, which is why it lives here and not near the Session.
 * - The app is the only place that knows what a control IS. This module deals
 *   in action ids, key tokens, button indices and parsed phrases; app.js maps
 *   those onto the station's own hit ids.
 *
 * Nothing here touches the DOM, three.js or a Session. `localStorage` is
 * reached through an injectable handle, so a checker passes a plain object.
 */

// --------------------------------------------------------------- the actions
//
// One row per thing a learner can ask for with a key or a button. `group`
// only orders the panel. Locomotion (WASD/arrows to walk, the mouse or a
// stick to look) is continuous rather than an action, and is listed
// separately as CONTINUOUS_ACTIONS below.

export const INPUT_ACTIONS = [
  { id: "focusPrev", group: "step", label: "Focus previous control", what: "Walks the cursor back through the controls this step names." },
  { id: "focusNext", group: "step", label: "Focus next control", what: "Walks the cursor forward through the controls this step names, in procedure order." },
  { id: "activate", group: "step", label: "Take the focused control", what: "Exactly what a click does: select it, or place what you are carrying." },
  { id: "hold", group: "step", label: "Press and hold", what: "Holds the focused control down for a hold or track step; let go to release." },
  { id: "adjustUp", group: "step", label: "Adjust up", what: "Raises a gauge reading, a tracked value, or a valve's turns." },
  { id: "adjustDown", group: "step", label: "Adjust down", what: "Lowers a gauge reading, a tracked value, or a valve's turns." },
  { id: "turnLeft", group: "step", label: "Turn anticlockwise", what: "Turns a turn step's target the way a wrist roll or a mouse arc would." },
  { id: "turnRight", group: "step", label: "Turn clockwise", what: "The same, the other way." },
  { id: "speakHint", group: "assist", label: "Read the step aloud", what: "Speaks the live step's title and cue, and writes it to the live region." },
  { id: "voice", group: "assist", label: "Start or stop listening", what: "The microphone button, from the keyboard." },
  { id: "mute", group: "assist", label: "Mute or unmute", what: "Silences the sound effects and the spoken lines." },
  { id: "controls", group: "panel", label: "Open the controls panel", what: "This panel." },
  { id: "back", group: "panel", label: "Close the panel, or back to the campus", what: "Closes the topmost overlay first, then leaves the station." },
];

/** Continuous input: not remappable, and each one already has a pointer or
 *  keyboard equivalent, which is the fallback rule the brief states. */
export const CONTINUOUS_ACTIONS = [
  { id: "look", label: "Look around", fallback: "Drag with the mouse" },
  { id: "walk", label: "Walk and strafe", fallback: "WASD or the arrow keys" },
];

export const ACTION_IDS = INPUT_ACTIONS.map((a) => a.id);
const ACTION_BY_ID = Object.fromEntries(INPUT_ACTIONS.map((a) => [a.id, a]));

// ------------------------------------------------------------ keyboard presets
//
// A binding is a list of key tokens: a `KeyboardEvent.code`, optionally with a
// `Shift+` prefix. Codes rather than `key` values, so a binding survives a
// non-US layout and a caps-lock state the way the existing Tab/Enter/Space
// scheme does.
//
// Two rules hold in every preset, and tools/check_input.mjs enforces both:
// every action is bound, and no key is bound twice inside one preset.

export const KEYBOARD_PRESETS = {
  standard: {
    label: "Standard",
    note: "What the app has always used: Tab walks the step's controls, Enter takes the one in focus, the space bar is the hold, the arrows work an analogue control.",
    keys: {
      focusPrev: ["Shift+Tab", "ArrowLeft"],
      focusNext: ["Tab", "ArrowRight"],
      activate: ["Enter", "NumpadEnter"],
      hold: ["Space"],
      adjustUp: ["ArrowUp"],
      adjustDown: ["ArrowDown"],
      turnLeft: ["KeyQ"],
      turnRight: ["KeyE"],
      speakHint: ["KeyH"],
      voice: ["KeyV"],
      mute: ["KeyM"],
      controls: ["Slash", "F1"],
      back: ["Escape"],
    },
  },
  wasd: {
    label: "WASD + IJKL",
    note: "The left hand stays on WASD to walk; the right hand works the step on the IJKL cluster instead of reaching for Tab.",
    keys: {
      focusPrev: ["KeyJ"],
      focusNext: ["KeyL"],
      activate: ["Enter"],
      hold: ["Space"],
      adjustUp: ["KeyI"],
      adjustDown: ["KeyK"],
      turnLeft: ["KeyU"],
      turnRight: ["KeyO"],
      speakHint: ["KeyH"],
      voice: ["KeyY"],
      mute: ["KeyM"],
      controls: ["Slash", "F1"],
      back: ["Escape"],
    },
  },
  "left-hand": {
    label: "Left hand",
    note: "For a learner who keeps the mouse in the right hand: every action sits on the left third of the board, with Enter moved to G.",
    keys: {
      focusPrev: ["Shift+Tab"],
      focusNext: ["Tab"],
      activate: ["KeyG"],
      hold: ["Space"],
      adjustUp: ["KeyR"],
      adjustDown: ["KeyF"],
      turnLeft: ["KeyZ"],
      turnRight: ["KeyC"],
      speakHint: ["KeyT"],
      voice: ["KeyB"],
      mute: ["KeyV"],
      controls: ["Backquote", "F1"],
      back: ["Escape"],
    },
  },
  numpad: {
    label: "Numeric keypad",
    note: "The whole procedure from the keypad, the way an operator works a panel: 4 and 6 walk the controls, 8 and 2 adjust, 5 takes, 0 holds.",
    keys: {
      focusPrev: ["Numpad4"],
      focusNext: ["Numpad6"],
      activate: ["Numpad5", "NumpadEnter"],
      hold: ["Numpad0"],
      adjustUp: ["Numpad8"],
      adjustDown: ["Numpad2"],
      turnLeft: ["Numpad7"],
      turnRight: ["Numpad9"],
      speakHint: ["Numpad1"],
      voice: ["NumpadMultiply"],
      mute: ["Numpad3"],
      controls: ["NumpadDivide", "F1"],
      back: ["NumpadSubtract", "Escape"],
    },
  },
  "one-hand": {
    label: "One hand",
    note: "Every action inside the span of one hand, with no chord, no modifier, no Tab and no function key — the preset to pick when the other hand is holding a tool, a rail or a radio.",
    keys: {
      focusPrev: ["KeyZ"],
      focusNext: ["KeyX"],
      activate: ["KeyC"],
      hold: ["Space"],
      adjustUp: ["KeyR"],
      adjustDown: ["KeyV"],
      turnLeft: ["KeyQ"],
      turnRight: ["KeyE"],
      speakHint: ["KeyT"],
      voice: ["KeyB"],
      mute: ["KeyF"],
      controls: ["KeyG"],
      back: ["Escape"],
    },
  },
};

export const PRESET_IDS = Object.keys(KEYBOARD_PRESETS);
export const INPUT_STORAGE_KEY = "smartcitix-input-v1";

function cloneKeys(keys) {
  const out = {};
  for (const [action, list] of Object.entries(keys ?? {})) out[action] = [...list];
  return out;
}

/** The bindings a preset ships with, as a fresh object nobody else shares. */
export function presetBindings(presetId = "standard") {
  const id = KEYBOARD_PRESETS[presetId] ? presetId : "standard";
  return { preset: id, keys: cloneKeys(KEYBOARD_PRESETS[id].keys) };
}

/** Keys bound to more than one action inside one binding set. */
export function duplicateKeys(keys = {}) {
  const seen = new Map();
  const dupes = [];
  for (const action of Object.keys(keys)) {
    for (const token of keys[action] ?? []) {
      if (seen.has(token)) dupes.push({ token, actions: [seen.get(token), action] });
      else seen.set(token, action);
    }
  }
  return dupes;
}

function storageHandle(storage) {
  if (storage) return storage;
  try { return typeof localStorage !== "undefined" ? localStorage : null; } catch { return null; }
}

/** Read the saved profile, repairing anything odd rather than throwing: an
 *  unknown preset falls back to standard, a malformed list is ignored, and an
 *  action the saved file never heard of (because it was added after that file
 *  was written) keeps its preset default instead of going unbound. */
export function loadBindings(storage) {
  const handle = storageHandle(storage);
  let saved = null;
  try { saved = JSON.parse(handle?.getItem(INPUT_STORAGE_KEY) ?? "null"); } catch { saved = null; }
  const base = presetBindings(saved?.preset);
  if (saved && saved.keys && typeof saved.keys === "object") {
    for (const action of ACTION_IDS) {
      const list = saved.keys[action];
      if (!Array.isArray(list)) continue;
      const clean = list.filter((t) => typeof t === "string" && t.length > 0 && t.length < 40);
      if (clean.length) base.keys[action] = clean;
    }
  }
  return base;
}

export function saveBindings(profile, storage) {
  const handle = storageHandle(storage);
  const safe = {
    preset: KEYBOARD_PRESETS[profile?.preset] ? profile.preset : "standard",
    keys: cloneKeys(profile?.keys ?? presetBindings(profile?.preset).keys),
  };
  // A locked, full or private-mode store is not a reason to stop taking input.
  try { handle?.setItem(INPUT_STORAGE_KEY, JSON.stringify(safe)); } catch { /* ignore */ }
  return safe;
}

/** Back to a preset's own keys, and forget the saved overrides. */
export function resetBindings(presetId = "standard", storage) {
  const handle = storageHandle(storage);
  try { handle?.removeItem(INPUT_STORAGE_KEY); } catch { /* ignore */ }
  return presetBindings(presetId);
}

/** Bind one key to one action. The token comes off every other action first,
 *  so a remap can never create the duplicate the checker forbids, and an
 *  action left with nothing falls back to its preset key rather than going
 *  dark — an unreachable action is the one thing the brief rules out. */
export function remapAction(profile, action, token) {
  if (!ACTION_BY_ID[action] || typeof token !== "string" || !token) return profile;
  const keys = cloneKeys(profile?.keys ?? presetBindings(profile?.preset).keys);
  for (const other of Object.keys(keys)) {
    if (other === action) continue;
    keys[other] = keys[other].filter((t) => t !== token);
  }
  const preset = KEYBOARD_PRESETS[profile?.preset] ?? KEYBOARD_PRESETS.standard;
  for (const other of Object.keys(keys)) {
    if (other === action || keys[other].length) continue;
    const fallback = (preset.keys[other] ?? []).filter((t) => t !== token);
    keys[other] = fallback.length ? fallback : [`Unbound:${other}`];
  }
  keys[action] = [token];
  return { preset: profile?.preset ?? "standard", keys };
}

/** A `KeyboardEvent` as the token a binding is written with. */
export function keyToken(event) {
  const code = event?.code ?? "";
  if (!code) return "";
  if (code === "ShiftLeft" || code === "ShiftRight") return code;
  return `${event.shiftKey ? "Shift+" : ""}${code}`;
}

/** Which action this key runs, or null. Tab and Shift+Tab are two separate
 *  bindings; a binding written without the prefix still answers to the
 *  shifted form, so Shift+M is mute, unless something else claims it. */
export function actionForKey(profile, token) {
  if (!token) return null;
  const keys = profile?.keys ?? {};
  for (const action of ACTION_IDS) if ((keys[action] ?? []).includes(token)) return action;
  if (!token.startsWith("Shift+")) return null;
  const bare = token.slice(6);
  for (const action of ACTION_IDS) if ((keys[action] ?? []).includes(bare)) return action;
  return null;
}

const KEY_NAMES = {
  Space: "Space", Escape: "Esc", Enter: "Enter", NumpadEnter: "Numpad Enter", Tab: "Tab",
  ArrowUp: "↑", ArrowDown: "↓", ArrowLeft: "←", ArrowRight: "→",
  Slash: "/", Backquote: "`", NumpadDivide: "Numpad /", NumpadMultiply: "Numpad ×",
  NumpadSubtract: "Numpad −", NumpadAdd: "Numpad +", NumpadDecimal: "Numpad .",
};

/** A key token the way a learner reads it on the panel. */
export function prettyKey(token = "") {
  const shift = token.startsWith("Shift+");
  const code = shift ? token.slice(6) : token;
  let name = KEY_NAMES[code];
  if (!name && code.startsWith("Key")) name = code.slice(3);
  if (!name && code.startsWith("Digit")) name = code.slice(5);
  if (!name && code.startsWith("Numpad")) name = `Numpad ${code.slice(6)}`;
  if (!name && code.startsWith("Unbound:")) name = "not bound";
  if (!name) name = code;
  return shift ? `Shift + ${name}` : name;
}

/** One row per action for the Keyboard tab: the action, what it does, the
 *  keys bound to it now, and whether that differs from the preset. */
export function describeBindings(profile) {
  const active = profile?.keys ? profile : presetBindings(profile?.preset ?? "standard");
  const preset = KEYBOARD_PRESETS[active.preset] ?? KEYBOARD_PRESETS.standard;
  return INPUT_ACTIONS.map((action) => {
    const keys = active.keys[action.id] ?? [];
    const base = preset.keys[action.id] ?? [];
    return {
      action: action.id,
      label: action.label,
      what: action.what,
      group: action.group,
      keys: [...keys],
      pretty: keys.map(prettyKey),
      custom: keys.join("|") !== base.join("|"),
      unbound: keys.length === 0 || keys.every((t) => t.startsWith("Unbound:")),
    };
  });
}

// --------------------------------------------------------------- the gamepad
//
// The W3C Standard Gamepad mapping, by index only. An Xbox pad, a PlayStation
// pad and a generic one all report the same indices when
// `gamepad.mapping === "standard"`; only the printing on the plastic differs,
// so the detected vendor decides the LABELS and never the mapping. This runs
// in flat/desktop mode only: inside an immersive session the controllers
// arrive as `XRInputSource.gamepad`, which app.js's xrMove already reads.

export const GAMEPAD_DEADZONE = 0.18;

export const PAD_LABELS = {
  xbox: {
    name: "Xbox",
    buttons: ["A", "B", "X", "Y", "LB", "RB", "LT", "RT", "View", "Menu", "L3", "R3", "D-pad up", "D-pad down", "D-pad left", "D-pad right", "Guide"],
    axes: ["Left stick X", "Left stick Y", "Right stick X", "Right stick Y"],
  },
  playstation: {
    name: "PlayStation",
    buttons: ["Cross", "Circle", "Square", "Triangle", "L1", "R1", "L2", "R2", "Share / Create", "Options", "L3", "R3", "D-pad up", "D-pad down", "D-pad left", "D-pad right", "PS"],
    axes: ["Left stick X", "Left stick Y", "Right stick X", "Right stick Y"],
  },
  generic: {
    name: "Generic",
    buttons: ["Bottom face", "Right face", "Left face", "Top face", "Left bumper", "Right bumper", "Left trigger", "Right trigger", "Select", "Start", "Left stick press", "Right stick press", "D-pad up", "D-pad down", "D-pad left", "D-pad right", "Home"],
    axes: ["Left stick X", "Left stick Y", "Right stick X", "Right stick Y"],
  },
};

/** Which printing to use for the labels. A vendor id is the only hint a
 *  browser gives, and a pad nobody recognises still works — it just gets the
 *  neutral names. */
export function detectPadVendor(id = "") {
  const s = String(id).toLowerCase();
  if (/xbox|xinput|microsoft|045e/.test(s)) return "xbox";
  if (/playstation|dualsense|dualshock|sony|054c/.test(s)) return "playstation";
  return "generic";
}

export function padButtonLabel(index, vendor = "generic") {
  const set = PAD_LABELS[vendor] ?? PAD_LABELS.generic;
  return set.buttons[index] ?? `Button ${index}`;
}

export function padAxisLabel(index, vendor = "generic") {
  const set = PAD_LABELS[vendor] ?? PAD_LABELS.generic;
  return set.axes[index] ?? `Axis ${index}`;
}

// `mode` is how a button repeats, and it is the whole of the edge detection:
//   edge        — fires once on the press, however long it is held
//   repeat      — fires on the press, then every repeatMs while held
//   analog      — a trigger: fires every poll above its threshold, with value
//   press-hold  — a tap is `activate`; keeping it down is `hold` (start/end)
export const GAMEPAD_MAP = [
  { index: 0, mode: "press-hold", action: "activate", holdAction: "hold", note: "Tap to take the control in focus; keep it down for a hold or track step." },
  { index: 1, mode: "edge", action: "back", note: "Closes the topmost panel, then leaves the station — the Escape path." },
  { index: 2, mode: "edge", action: "voice", note: "Starts and stops listening." },
  { index: 3, mode: "edge", action: "speakHint", note: "Reads the live step aloud." },
  { index: 4, mode: "repeat", action: "turnLeft", note: "Turns a turn step's target anticlockwise while held." },
  { index: 5, mode: "repeat", action: "turnRight", note: "Turns it clockwise while held." },
  { index: 6, mode: "analog", action: "adjustDown", note: "Gauge, tracked value or valve down, as far as the trigger is pulled." },
  { index: 7, mode: "analog", action: "adjustUp", note: "The same, up." },
  { index: 8, mode: "edge", action: "back", note: "Back to the campus." },
  { index: 9, mode: "edge", action: "controls", note: "Opens and closes the controls panel." },
  { index: 10, mode: "edge", action: "mute", note: "Mutes the sound and the spoken lines." },
  { index: 12, mode: "repeat", action: "adjustUp", note: "Steps a gauge, a tracked value or a valve up." },
  { index: 13, mode: "repeat", action: "adjustDown", note: "Steps it down." },
  { index: 14, mode: "edge", action: "focusPrev", note: "Focus the previous control this step names." },
  { index: 15, mode: "edge", action: "focusNext", note: "Focus the next one." },
];

export const GAMEPAD_AXIS_MAP = [
  { axes: [0, 1], action: "look", note: "Orbits and pitches the view, the way dragging with the mouse does." },
  { axes: [2, 3], action: "walk", note: "Walks and strafes inside the station's roam limit, like WASD." },
];

function applyDeadzone(value, deadzone) {
  const v = typeof value === "number" && Number.isFinite(value) ? value : 0;
  const a = Math.abs(v);
  if (a < deadzone) return 0;
  return Math.sign(v) * ((a - deadzone) / (1 - deadzone));
}

function buttonValue(button) {
  if (button == null) return 0;
  if (typeof button === "number") return button;
  if (typeof button.value === "number" && Number.isFinite(button.value)) return button.value;
  return button.pressed ? 1 : 0;
}

/**
 * The poller. `getGamepads` is whatever returns an array-like of pads:
 * `() => navigator.getGamepads()` in a browser, `() => [fakePad]` in a test.
 * `onAction(action, info)` is called for every action the pad produces, with
 * `info` carrying `{ value, phase, repeat, dx, dy, dt, index, source }`.
 *
 *     const pad = createGamepad({ getGamepads: () => navigator.getGamepads(), onAction });
 *     pad.poll(dt);   // once per frame, outside an immersive session
 */
export function createGamepad({
  getGamepads,
  bindings = GAMEPAD_MAP,
  axisBindings = GAMEPAD_AXIS_MAP,
  onAction = () => {},
  onConnect = null,
  deadzone = GAMEPAD_DEADZONE,
  holdMs = 320,
  repeatMs = 140,
  triggerThreshold = 0.12,
  shouldPoll = () => true,
  now = () => (typeof performance !== "undefined" && performance.now ? performance.now() : Date.now()),
} = {}) {
  const down = new Map();      // button index → { since, firedAt, holding }
  let padId = null, vendor = "generic", connected = false;
  let last = { connected: false, id: "", vendor: "generic", mapping: "", buttons: [], axes: [] };

  function pickPad() {
    let pads = [];
    try { pads = getGamepads?.() ?? []; } catch { pads = []; }
    for (const pad of Array.from(pads)) {
      if (!pad || pad.connected === false) continue;
      if (!pad.buttons && !pad.axes) continue;
      return pad;
    }
    return null;
  }

  function reset() { down.clear(); }

  function poll(dt = 1 / 60) {
    if (!shouldPoll()) {
      if (connected) { connected = false; reset(); }
      return null;
    }
    const pad = pickPad();
    if (!pad) {
      if (connected) { connected = false; reset(); last = { ...last, connected: false }; onConnect?.(last); }
      return null;
    }
    const id = String(pad.id ?? "");
    if (!connected || id !== padId) {
      padId = id; vendor = detectPadVendor(id); connected = true; reset();
      last = { connected: true, id, vendor, mapping: String(pad.mapping ?? ""), buttons: [], axes: [] };
      onConnect?.(last);
    }
    const t = now();
    const buttons = pad.buttons ?? [];
    const axes = pad.axes ?? [];

    for (const bind of bindings) {
      const value = buttonValue(buttons[bind.index]);
      if (bind.mode === "analog") {
        if (value > triggerThreshold) onAction(bind.action, { value, analog: true, dt, index: bind.index, source: "gamepad" });
        continue;
      }
      const isDown = value > 0.5;
      const state = down.get(bind.index);
      if (isDown && !state) {
        down.set(bind.index, { since: t, firedAt: t, holding: false });
        // A press-hold button decides on release, or when the hold timer runs
        // out below — that is what makes one physical press one action.
        if (bind.mode !== "press-hold") onAction(bind.action, { value: 1, dt, index: bind.index, source: "gamepad" });
      } else if (isDown && state) {
        if (bind.mode === "repeat" && t - state.firedAt >= repeatMs) {
          state.firedAt = t;
          onAction(bind.action, { value: 1, repeat: true, dt, index: bind.index, source: "gamepad" });
        }
        if (bind.mode === "press-hold" && !state.holding && t - state.since >= holdMs) {
          state.holding = true;
          onAction(bind.holdAction ?? "hold", { phase: "start", dt, index: bind.index, source: "gamepad" });
        }
      } else if (!isDown && state) {
        down.delete(bind.index);
        if (bind.mode === "press-hold") {
          if (state.holding) onAction(bind.holdAction ?? "hold", { phase: "end", dt, index: bind.index, source: "gamepad" });
          else onAction(bind.action, { value: 1, dt, index: bind.index, source: "gamepad", tap: true });
        }
      }
    }

    for (const bind of axisBindings) {
      const [xi, yi] = bind.axes;
      const dx = applyDeadzone(axes[xi], deadzone);
      const dy = applyDeadzone(axes[yi], deadzone);
      if (dx || dy) onAction(bind.action, { dx, dy, dt, source: "gamepad" });
    }

    last = {
      connected: true, id, vendor, mapping: String(pad.mapping ?? ""),
      buttons: Array.from(buttons, (b, i) => {
        const bind = bindings.find((x) => x.index === i);
        const v = buttonValue(b);
        return { index: i, label: padButtonLabel(i, vendor), value: Number(v.toFixed(3)), pressed: v > 0.5, action: bind?.action ?? null, mode: bind?.mode ?? null };
      }),
      axes: Array.from(axes, (v, i) => ({
        index: i, label: padAxisLabel(i, vendor),
        value: Number((typeof v === "number" ? v : 0).toFixed(3)),
        live: applyDeadzone(v, deadzone) !== 0,
      })),
    };
    return last;
  }

  return {
    poll,
    reset,
    get vendor() { return vendor; },
    get connected() { return connected; },
    snapshot() { return last; },
    /** The panel's map table for whichever pad is in hand. */
    describe(forVendor = vendor) {
      return bindings.map((b) => ({
        index: b.index, mode: b.mode, action: b.action,
        label: padButtonLabel(b.index, forVendor),
        actionLabel: ACTION_BY_ID[b.action]?.label ?? b.action,
        note: b.note ?? "",
      }));
    },
  };
}

/** The gamepad map as rows without a live pad — for the docs and for the
 *  panel before anything is plugged in. */
export function describeGamepadMap(vendor = "generic") {
  const rows = GAMEPAD_MAP.map((b) => ({
    index: b.index, mode: b.mode, action: b.action,
    label: padButtonLabel(b.index, vendor),
    actionLabel: ACTION_BY_ID[b.action]?.label ?? b.action,
    note: b.note ?? "",
  }));
  for (const a of GAMEPAD_AXIS_MAP) {
    rows.push({
      index: null, mode: "axis", action: a.action,
      label: a.axes.map((i) => padAxisLabel(i, vendor)).join(" / "),
      actionLabel: CONTINUOUS_ACTIONS.find((c) => c.id === a.action)?.label ?? a.action,
      note: a.note,
    });
  }
  return rows;
}

// ------------------------------------------------------------ driving
//
// A 'drive' step (shared/game.js) is the one place a learner operates a
// vehicle rather than a control, so while one is live the keys and the pad
// speak a second, smaller vocabulary: throttle, brake and steer as continuous
// inputs, and the discrete checks a route asks for — mirrors, signals, the
// horn, a gear, the lights — plus the CB radio an interruption may call for.
// The table is the same shape as the ones above, and the same two rules hold:
// every drive action is reachable from the keyboard, and no key or button is
// bound twice inside it. It only applies while a drive step is live, so it
// can reuse keys the presets give to step actions a drive step never asks
// for (Q/E turn a valve; there is no valve to turn at the wheel). The step
// actions that still matter while driving — the controls panel, mute, back —
// keep their own keys, which is why none of them appears here.

export const DRIVE_ACTIONS = [
  { id: "throttle", group: "drive", continuous: true, label: "Throttle", what: "Hold to speed up; let go and the vehicle coasts down. In reverse it backs." },
  { id: "brake", group: "drive", continuous: true, label: "Brake", what: "Hold to slow and stop. A fresh press also answers an interruption that asks you to stop." },
  { id: "steerLeft", group: "drive", continuous: true, label: "Steer left", what: "Moves the vehicle toward the left of its lane." },
  { id: "steerRight", group: "drive", continuous: true, label: "Steer right", what: "Moves the vehicle toward the right of its lane." },
  { id: "mirror-left", group: "check", label: "Check the left mirror", what: "A mirror check on the driver's side, where the route calls for one." },
  { id: "mirror-right", group: "check", label: "Check the right mirror", what: "A mirror check on the passenger side — the side a right turn and a trailer's cut-in live on." },
  { id: "signal-left", group: "check", label: "Signal left", what: "The left turn signal, before a left turn, a lane change or a pull-out." },
  { id: "signal-right", group: "check", label: "Signal right", what: "The right turn signal." },
  { id: "horn", group: "check", label: "Horn", what: "A tap of the horn: before backing, at a blind corner, to warn a person in the path." },
  { id: "gear-down", group: "check", label: "Gear down", what: "Down a gear: before a grade, before a crossing, before a stop." },
  { id: "gear-up", group: "check", label: "Gear up", what: "Up a gear once the vehicle is moving and settled." },
  { id: "lights", group: "check", label: "Lights", what: "Headlamps on (low beams in fog), or the four-way flashers where the route says so." },
  { id: "radio", group: "control", label: "CB radio", what: "Keys the CB or company radio — for a call an interruption says you must make." },
];
export const DRIVE_ACTION_IDS = DRIVE_ACTIONS.map((a) => a.id);
export const DRIVE_CHECK_ACTIONS = DRIVE_ACTIONS.filter((a) => a.group === "check").map((a) => a.id);

/** Keys while a drive step is live. Arrows left/right are the signals, as a
 *  stalk is under the left hand; up and down double for throttle and brake. */
export const DRIVE_KEYS = {
  throttle: ["KeyW", "ArrowUp"],
  brake: ["KeyS", "ArrowDown", "Space"],
  steerLeft: ["KeyA"],
  steerRight: ["KeyD"],
  "mirror-left": ["KeyQ"],
  "mirror-right": ["KeyE"],
  "signal-left": ["ArrowLeft"],
  "signal-right": ["ArrowRight"],
  horn: ["KeyH"],
  "gear-down": ["KeyZ"],
  "gear-up": ["KeyX"],
  lights: ["KeyL"],
  radio: ["KeyR"],
};

/** Which drive action a key runs, or null. Shift is ignored: a learner
 *  holding Shift to walk faster still reaches the brake. */
export function driveActionForKey(token) {
  if (!token) return null;
  const bare = token.startsWith("Shift+") ? token.slice(6) : token;
  for (const id of DRIVE_ACTION_IDS) if ((DRIVE_KEYS[id] ?? []).includes(bare)) return id;
  return null;
}

/** Buttons while a drive step is live, by Standard Gamepad index. `back`
 *  and `controls` stay where they always are, so a pad can still leave. */
export const DRIVE_GAMEPAD_MAP = [
  { index: 4, mode: "edge", action: "mirror-left", note: "Left bumper: the left mirror." },
  { index: 5, mode: "edge", action: "mirror-right", note: "Right bumper: the right mirror." },
  { index: 14, mode: "edge", action: "signal-left", note: "D-pad left: signal left." },
  { index: 15, mode: "edge", action: "signal-right", note: "D-pad right: signal right." },
  { index: 3, mode: "edge", action: "horn", note: "Top face (Y / Triangle): the horn." },
  { index: 6, mode: "edge", action: "gear-down", note: "Left trigger: down a gear." },
  { index: 7, mode: "edge", action: "gear-up", note: "Right trigger: up a gear." },
  { index: 2, mode: "edge", action: "lights", note: "Left face (X / Square): the lights." },
  { index: 12, mode: "edge", action: "radio", note: "D-pad up: key the radio." },
  { index: 1, mode: "edge", action: "back", note: "Leaves the station, the Escape path." },
  { index: 9, mode: "edge", action: "controls", note: "Opens the controls panel." },
];
/** Continuous pad input while driving: the left stick steers, the right
 *  stick's forward and back are throttle and brake, and the bottom face and
 *  d-pad down are a brake you can hold without a stick. */
export const DRIVE_PAD_AXES = { steer: 0, throttle: 3 };
export const DRIVE_PAD_BRAKE_BUTTONS = [0, 13];

/**
 * One throttle and steer from everything that can drive: `held` is the set
 * of drive actions whose keys are down ({ throttle: true, … }), `pad` a
 * createGamepad() snapshot, `touch` the on-screen controls ({ throttle,
 * brake, steer }). Pure, so the checker drives it with plain objects.
 */
export function driveInputFrom({ held = {}, pad = null, touch = null, deadzone = GAMEPAD_DEADZONE } = {}) {
  let throttle = (held.throttle ? 1 : 0) - (held.brake ? 1 : 0);
  let steer = (held.steerRight ? 1 : 0) - (held.steerLeft ? 1 : 0);
  let brake = !!held.brake;
  if (pad?.connected) {
    const axis = (i) => applyDeadzone(pad.axes?.find((a) => a.index === i)?.value ?? 0, deadzone);
    const sx = axis(DRIVE_PAD_AXES.steer);
    const ty = axis(DRIVE_PAD_AXES.throttle);
    if (sx) steer = sx;
    if (ty) throttle = -ty;          // stick forward reads negative
    if (DRIVE_PAD_BRAKE_BUTTONS.some((i) => pad.buttons?.find((b) => b.index === i)?.pressed)) { throttle = -1; brake = true; }
  }
  if (touch) {
    if (touch.throttle) throttle = 1;
    if (touch.brake) { throttle = -1; brake = true; }
    if (touch.steer) steer = Math.max(-1, Math.min(1, touch.steer));
  }
  return { throttle: Math.max(-1, Math.min(1, throttle)), steer: Math.max(-1, Math.min(1, steer)), brake: brake || throttle <= -1 };
}

/** The driving table as rows for the controls panel and docs/controls.md. */
export function describeDriveBindings(vendor = "generic") {
  return DRIVE_ACTIONS.map((a) => {
    const buttons = DRIVE_GAMEPAD_MAP.filter((b) => b.action === a.id).map((b) => padButtonLabel(b.index, vendor));
    if (a.id === "brake") buttons.push(...DRIVE_PAD_BRAKE_BUTTONS.map((i) => padButtonLabel(i, vendor)), `${padAxisLabel(DRIVE_PAD_AXES.throttle, vendor)} back`);
    if (a.id === "throttle") buttons.push(`${padAxisLabel(DRIVE_PAD_AXES.throttle, vendor)} forward`);
    if (a.id === "steerLeft" || a.id === "steerRight") buttons.push(padAxisLabel(DRIVE_PAD_AXES.steer, vendor));
    return { action: a.id, label: a.label, what: a.what, group: a.group, keys: [...(DRIVE_KEYS[a.id] ?? [])], pretty: (DRIVE_KEYS[a.id] ?? []).map(prettyKey), pad: buttons };
  });
}

// ----------------------------------------------------------- the voice grammar
//
// Navigation, focus, read-back and panels. Nothing here completes a step:
// `focus` moves the keyboard cursor, `next`/`previous` walk it, `read step`
// and `repeat` only speak. That is the interface brief's first rule, and it is
// why "select item N" numbers the hub's cards and the panel's buttons rather
// than the station's own controls.

const NUMBER_WORDS = {
  one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10,
  eleven: 11, twelve: 12, thirteen: 13, fourteen: 14, fifteen: 15, sixteen: 16,
  seventeen: 17, eighteen: 18, nineteen: 19, twenty: 20,
  // What a recogniser hears instead, on a noisy site.
  won: 1, to: 2, too: 2, tu: 2, free: 3, tree: 3, for: 4, ate: 8, nein: 9,
};

function spokenNumber(word) {
  if (word == null) return null;
  const s = String(word).trim().toLowerCase();
  if (/^\d+$/.test(s)) { const n = parseInt(s, 10); return n > 0 ? n : null; }
  return NUMBER_WORDS[s] ?? null;
}

/** The item a "select item N" refers to, from the numbered menu the app
 *  passes as `ctx.menu` (hub cards and panel buttons, in badge order). */
export function resolveMenuItem(n, menu = []) {
  if (!Array.isArray(menu) || !n || n < 1 || n > menu.length) return null;
  return menu[n - 1] ?? null;
}

/** Match a spoken name against `[{ id, name }]`: exact first, then a
 *  containment either way, longest name first so a short name cannot shadow
 *  a longer one that contains it. */
export function matchTargetName(spoken, entries = []) {
  const flatten = (s) => String(s ?? "").toLowerCase().replace(/[^a-z0-9 ]+/g, " ").replace(/\s+/g, " ").trim();
  const want = flatten(spoken);
  if (!want) return null;
  const rows = [...entries]
    .filter((e) => e && (e.name || e.id))
    .map((e) => ({ ...e, hay: flatten(e.name ?? e.id) }))
    .sort((a, b) => b.hay.length - a.hay.length);
  return rows.find((r) => r.hay === want)
    ?? rows.find((r) => r.hay.includes(want) || want.includes(r.hay))
    ?? null;
}

// Order is the grammar: the specific phrases are matched before the general
// ones, so "what next" stays a hint instead of becoming "next".
export const VOICE_GRAMMAR = [
  { type: "help", scope: "any", phrases: ["help", "what can I say"], what: "Lists what can be said.", re: /\b(help|commands|what can i say)\b/ },
  // Plural "controls" only: the singular belongs to "next control" and
  // "last control", which walk the focus and must not open a panel.
  { type: "controls", scope: "any", phrases: ["controls", "show controls"], what: "Opens the controls panel.", re: /\b(controls|control panel|key ?bindings?|button map)\b/ },
  { type: "showNumbers", scope: "any", phrases: ["show numbers", "hide numbers"], what: "Puts a small number badge on every hub card and panel button, so each can be chosen by number.", re: /\b(show|hide|turn off|turn on)\s+(?:the\s+)?numbers?\b/, parse: (m) => ({ on: /show|turn on/.test(m[1]) }) },
  { type: "selectItem", scope: "any", phrases: ["select item 3", "item three", "number 7"], what: "Takes the numbered hub card or panel button — the voice-first path on a monocular display.", re: /\b(?:select|pick|choose|open|activate)?\s*(?:item|option|number|card|button)\s+([a-z0-9]+)\b|\b(?:select|pick|choose)\s+([a-z0-9]+)\b/, parse: (m, ctx) => { const n = spokenNumber(m[1] ?? m[2]); return n ? { index: n, item: resolveMenuItem(n, ctx?.menu) } : null; } },
  { type: "whereIs", scope: "run", phrases: ["where is the isolation valve"], what: "Says where a control is, relative to where the learner is standing. It never touches it.", re: /\bwhere(?:'s| is| are)\s+(?:the\s+)?(.+?)\s*\??$/, parse: (m) => ({ name: m[1].trim() }) },
  { type: "focus", scope: "run", phrases: ["focus the tag bag", "highlight the gauge"], what: "Moves the keyboard cursor onto a named control and reads it out. It never takes it — hands do that.", re: /\b(?:focus(?: on)?|highlight|point (?:at|to))\s+(?:the\s+)?(.+?)\s*\??$/, parse: (m) => ({ name: m[1].trim() }) },
  { type: "readStep", scope: "run", phrases: ["read step", "read the step"], what: "Reads the live step's title, cue and progress.", re: /\bread(?: me)?(?: out)?(?: the)?\s+(step|cue|objective)\b/ },
  { type: "repeat", scope: "any", phrases: ["repeat", "say that again"], what: "Says the last spoken line again.", re: /\b(repeat|say (?:that|it) again|again please)\b/ },
  { type: "hint", scope: "any", phrases: ["hint", "what now"], what: "The live step's title and cue, or how to start a station.", re: /\b(hint|what now|what next|what do i do|current step)\b/ },
  { type: "checkIn", scope: "any", phrases: ["check in"], what: "Opens the well-being check-in: how the learner is after a hard run. Nothing about it is scored.", re: /\bcheck[- ]?in\b|\bchecking in\b/ },
  { type: "checkInAnswer", scope: "any", phrases: ["steady", "a bit shaken", "need a minute"], what: "Answers the check-in.", re: /\b(steady|shaken|need a minute|give me a minute)\b/, parse: (m) => ({ answer: /steady/.test(m[1]) ? "steady" : /shaken/.test(m[1]) ? "shaken" : "minute" }) },
  { type: "previous", scope: "run", phrases: ["previous", "back one"], what: "Moves the keyboard cursor to the previous control this step names.", re: /\b(previous|prev|back one|one back|last control)\b/ },
  { type: "next", scope: "run", phrases: ["next", "next control"], what: "Moves the keyboard cursor to the next control this step names. It never takes it.", re: /\b(next|forward one|next control|next one)\b/ },
  { type: "unmute", scope: "any", phrases: ["unmute"], what: "Sound back on.", re: /\b(unmute|un mute|sound on)\b/ },
  { type: "mute", scope: "any", phrases: ["mute"], what: "Sound and spoken lines off.", re: /\b(mute|quiet|silence)\b/ },
  { type: "bigger", scope: "any", phrases: ["bigger"], what: "A larger HUD, or a larger diorama in AR — the command a monocular display needs most.", re: /\b(bigger|larger|zoom in|magnify|scale up)\b/ },
  { type: "smaller", scope: "any", phrases: ["smaller"], what: "A smaller HUD, or a smaller diorama in AR.", re: /\b(smaller|zoom out|shrink|scale down)\b/ },
  { type: "leaderboard", scope: "hub", phrases: ["leaderboards"], what: "Opens the leaderboards.", re: /\bleaderboards?\b/ },
  { type: "programs", scope: "hub", phrases: ["programmes"], what: "Opens the training programmes.", re: /\b(programme?s?|programs?|curricul(?:um|a)|pathway)\b/ },
  { type: "records", scope: "hub", phrases: ["records"], what: "Opens the training records.", re: /\b(records?|training records?|transcript)\b/ },
  { type: "tour", scope: "hub", phrases: ["tour"], what: "Starts the guided tour.", re: /\btour\b/ },
  { type: "editor", scope: "hub", phrases: ["editor"], what: "Opens the scenario editor.", re: /\b(scenario|editor)\b/ },
  { type: "reset", scope: "hub", phrases: ["reset"], what: "Clears the progress held in this browser.", re: /\breset\b/ },
  { type: "brief", scope: "any", phrases: ["brief"], what: "Reads the station's briefing line.", re: /\b(brief|briefing|about this station)\b/ },
  { type: "status", scope: "any", phrases: ["status"], what: "Stations cleared, stars, level.", re: /\b(status|progress|score)\b/ },
  { type: "hub", scope: "any", phrases: ["hub", "campus"], what: "Back to the campus.", re: /\b(hub|campus|home|back)\b/ },
];

export const VOICE_HELP_LINE =
  'Say a station name, or "next", "previous", "focus" and a control\'s name, "where is" and a control\'s name, ' +
  '"read step", "repeat", "hint", "brief", "status", "select item" and a number, "show numbers", "bigger", "smaller", ' +
  '"mute", "unmute", "controls", "check in", "hub", "leaderboards", "records", "programmes", "tour", "editor", "reset", or "help".';

/**
 * Parse one heard phrase into `{ type, ... }`, with `type: "unknown"` when
 * nothing matches. Station names are NOT matched here — app.js owns the
 * roster, matches a station name first, and delegates everything else to
 * this. `ctx.menu` is the numbered menu for "select item N".
 */
export function parseVoice(text, ctx = {}) {
  const lower = String(text ?? "").toLowerCase().trim();
  if (!lower) return { type: "unknown", text: "" };
  for (const entry of VOICE_GRAMMAR) {
    const m = entry.re.exec(lower);
    if (!m) continue;
    const extra = entry.parse ? entry.parse(m, ctx, lower) : {};
    // An entry may decline: "select the valve" is not an item number.
    if (extra === null) continue;
    return { type: entry.type, text: lower, ...extra };
  }
  return { type: "unknown", text: lower };
}

/** The check-in's spoken short forms. The fuller wording a peer-support
 *  trainer would use is in shared/ei-guide.js; these are what a monocular
 *  display reads aloud, where every line has to fit one breath. */
export const CHECKIN_QUESTION =
  'How are you doing after that one? Nothing about this is scored. Say "steady", "shaken", or "need a minute".';
export const CHECKIN_REPLIES = {
  steady: "Good. Take the debrief with you.",
  shaken: "That is a normal reaction to a run that felt real. Give it a minute before the next one.",
  minute: "Take it. The station will be here, and peer support exists for exactly this.",
};

// ------------------------------------------------- what this device can drive
//
// devices.js is the one place a headset is described (interface brief), so
// this reads a device rather than sniffing anything itself. A DEVICES entry
// may carry an `input` object — { primary, voiceFirst, controllers, hands,
// keyboard } — and when it does, that decides which tabs the controls panel
// shows and in what order. Entries that list input kinds as a plain array,
// and any device with no entry at all, fall back to the run profile.

const PROFILE_INPUTS = {
  desktop: { primary: "keyboard", voiceFirst: false, controllers: true, hands: false, keyboard: true },
  vr: { primary: "controllers", voiceFirst: false, controllers: true, hands: true, keyboard: true },
  mr: { primary: "hands", voiceFirst: true, controllers: false, hands: true, keyboard: true },
  seethrough: { primary: "voice", voiceFirst: true, controllers: false, hands: false, keyboard: true },
  assisted: { primary: "voice", voiceFirst: true, controllers: false, hands: false, keyboard: true },
};

const TAB_FOR_PRIMARY = { keyboard: "keyboard", controllers: "gamepad", gamepad: "gamepad", voice: "voice", hands: "voice" };

/**
 * Which controls tabs to show, in which order, and which to hide.
 * `device` is a devices.js entry (or the detector's result) and `profile` is
 * what applyProfile returned. Returns `{ tabs, primary, voiceFirst, hands,
 * controllers, keyboard, source }` — `source` says whether the device or the
 * profile decided.
 */
export function describeInputs(device = null, profile = null) {
  const raw = device?.input;
  const fromDevice = !!raw && !Array.isArray(raw) && typeof raw === "object";
  const io = fromDevice
    ? { primary: "keyboard", voiceFirst: false, controllers: true, hands: false, keyboard: true, ...raw }
    : (PROFILE_INPUTS[profile?.id ?? device?.profile] ?? PROFILE_INPUTS.desktop);
  const tabs = [];
  const add = (id) => {
    if (!id || tabs.includes(id)) return;
    if (id === "gamepad" && io.controllers === false) return;
    if (id === "keyboard" && io.keyboard === false) return;
    tabs.push(id);
  };
  add(TAB_FOR_PRIMARY[io.primary]);
  if (io.voiceFirst) add("voice");
  add("keyboard");
  add("gamepad");
  add("voice");
  return {
    tabs: tabs.length ? tabs : ["voice"],
    primary: io.primary ?? "keyboard",
    voiceFirst: !!io.voiceFirst,
    hands: !!io.hands,
    controllers: io.controllers !== false,
    keyboard: io.keyboard !== false,
    source: fromDevice ? "device" : "profile",
  };
}
