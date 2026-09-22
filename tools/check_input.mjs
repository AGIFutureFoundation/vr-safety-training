#!/usr/bin/env node
/**
 * The deep input layer, headless: keyboard presets, the gamepad poller and the
 * voice grammar (WebXR/shared/input.js).
 *
 *     node tools/check_input.mjs
 *
 * A gamepad needs a hand on it and a recogniser needs a microphone, neither of
 * which this repository has. So the parts that decide anything are pure — an
 * action table, a binding table, an edge detector over a plain object, and a
 * grammar of regexes — and this drives all of them: a fake `navigator`
 * returning a fake Standard Gamepad, a fake `localStorage`, and every phrase
 * the grammar claims to understand.
 *
 * What it will not let through:
 *   - a preset with an action nobody can reach, or a key bound twice inside one
 *     preset (a learner who picks that preset loses a step kind)
 *   - a gamepad button whose action has no keyboard fallback (the brief's rule)
 *   - a voice command listed in the panel that does not parse
 *   - an edge detector that fires twice for one press, which would double every
 *     focus move
 *   - a voice command that could complete a step
 */
import {
  INPUT_ACTIONS, ACTION_IDS, CONTINUOUS_ACTIONS, KEYBOARD_PRESETS, PRESET_IDS,
  INPUT_STORAGE_KEY, presetBindings, duplicateKeys, loadBindings, saveBindings,
  resetBindings, remapAction, keyToken, actionForKey, prettyKey, describeBindings,
  GAMEPAD_MAP, GAMEPAD_AXIS_MAP, GAMEPAD_DEADZONE, PAD_LABELS, createGamepad,
  detectPadVendor, padButtonLabel, describeGamepadMap,
  VOICE_GRAMMAR, VOICE_HELP_LINE, parseVoice, resolveMenuItem, matchTargetName,
  describeInputs, CHECKIN_REPLIES,
} from "../WebXR/shared/input.js";
import { DEVICES, PROFILES } from "../WebXR/shared/devices.js";

let failures = 0;
const ok = (m) => console.log(`  ✓ ${m}`);
const bad = (m) => { failures += 1; console.log(`  ✗ ${m}`); };
const check = (cond, good, wrong) => (cond ? ok(good) : bad(wrong ?? good));

console.log("Input layer — keyboard presets, gamepad mapping, voice grammar\n");

// --------------------------------------------------------------- the actions
{
  const dupIds = ACTION_IDS.filter((id, i) => ACTION_IDS.indexOf(id) !== i);
  check(!dupIds.length, `${INPUT_ACTIONS.length} actions, each named once`, `duplicate action ids: ${dupIds.join(", ")}`);
  const missing = INPUT_ACTIONS.filter((a) => !a.label || !a.what || !a.group);
  check(!missing.length, "every action carries a label, a description and a group",
    `actions missing panel text: ${missing.map((a) => a.id).join(", ")}`);
}

// ------------------------------------------------------------ every preset
for (const id of PRESET_IDS) {
  const preset = KEYBOARD_PRESETS[id];
  const unbound = ACTION_IDS.filter((a) => !(preset.keys[a] ?? []).length);
  if (unbound.length) bad(`preset "${id}" leaves ${unbound.join(", ")} unbound`);
  const strays = Object.keys(preset.keys).filter((a) => !ACTION_IDS.includes(a));
  if (strays.length) bad(`preset "${id}" binds unknown action(s) ${strays.join(", ")}`);
  const dupes = duplicateKeys(preset.keys);
  if (dupes.length) bad(`preset "${id}" binds ${dupes.map((d) => `${d.token} to both ${d.actions.join(" and ")}`).join("; ")}`);
  if (!preset.label || !preset.note) bad(`preset "${id}" has no label or no note for the picker`);
  if (!unbound.length && !strays.length && !dupes.length) {
    ok(`preset "${id}" binds all ${ACTION_IDS.length} actions with no key used twice`);
  }
  // Every key in every preset round-trips through the resolver, which is the
  // only path app.js has from a keydown to an action.
  for (const [action, tokens] of Object.entries(preset.keys)) {
    for (const token of tokens) {
      const got = actionForKey(preset, token);
      if (got !== action) bad(`preset "${id}": ${token} resolves to ${got ?? "nothing"}, not ${action}`);
      if (!prettyKey(token)) bad(`preset "${id}": ${token} has no printable name`);
    }
  }
}
check(PRESET_IDS.length === 5 && ["standard", "wasd", "left-hand", "numpad", "one-hand"].every((p) => PRESET_IDS.includes(p)),
  "the five presets are standard, wasd, left-hand, numpad and one-hand", `presets are ${PRESET_IDS.join(", ")}`);

// The standard preset must still be exactly the scheme the app shipped with,
// or an existing learner's muscle memory breaks on upgrade.
{
  const s = KEYBOARD_PRESETS.standard.keys;
  const same = s.focusNext.includes("Tab") && s.focusPrev.includes("Shift+Tab")
    && s.activate.includes("Enter") && s.hold.includes("Space")
    && s.adjustUp.includes("ArrowUp") && s.adjustDown.includes("ArrowDown")
    && s.focusNext.includes("ArrowRight") && s.focusPrev.includes("ArrowLeft")
    && s.mute.includes("KeyM") && s.back.includes("Escape");
  check(same, "the standard preset is still Tab / Enter / Space / arrows / M / Esc", "the standard preset changed the keys the app already taught");
}

// The one-hand preset's whole promise: no chord, no Tab, no function key.
{
  const bads = [];
  for (const [action, tokens] of Object.entries(KEYBOARD_PRESETS["one-hand"].keys)) {
    for (const t of tokens) if (t.includes("+") || t === "Tab" || /^F\d+$/.test(t)) bads.push(`${action}=${t}`);
  }
  check(!bads.length, "the one-hand preset needs no chord, no Tab and no function key", `one-hand preset uses ${bads.join(", ")}`);
}

// -------------------------------------------------- bindings in a fake store
{
  const store = (() => {
    const bag = new Map();
    return { getItem: (k) => (bag.has(k) ? bag.get(k) : null), setItem: (k, v) => bag.set(k, String(v)), removeItem: (k) => bag.delete(k), bag };
  })();
  check(loadBindings(store).preset === "standard", "with nothing saved, the standard preset loads");

  saveBindings({ preset: "numpad", keys: KEYBOARD_PRESETS.numpad.keys }, store);
  check(store.bag.has(INPUT_STORAGE_KEY), `bindings are saved under "${INPUT_STORAGE_KEY}"`, "bindings were not written to the versioned key");
  const back = loadBindings(store);
  check(back.preset === "numpad" && back.keys.activate.includes("Numpad5"), "a saved preset comes back on the next load");

  const remapped = remapAction(back, "activate", "KeyP");
  check(remapped.keys.activate.join() === "KeyP", "a remap replaces that action's keys");
  check(!duplicateKeys(remapped.keys).length, "a remap never leaves a key on two actions");
  const stolen = remapAction(presetBindings("standard"), "mute", "Tab");
  check(stolen.keys.mute.join() === "Tab" && !stolen.keys.focusNext.includes("Tab"),
    "taking a key from another action removes it there");
  check(stolen.keys.focusNext.length > 0, "the action it was taken from keeps a key rather than going unreachable");

  saveBindings(remapped, store);
  check(loadBindings(store).keys.activate.join() === "KeyP", "a per-action remap survives a reload");
  const reset = resetBindings("standard", store);
  check(reset.keys.activate.includes("Enter") && !store.bag.has(INPUT_STORAGE_KEY), "reset restores the preset and clears the saved overrides");

  store.bag.set(INPUT_STORAGE_KEY, "{not json");
  check(loadBindings(store).preset === "standard", "a corrupt saved file falls back to standard instead of throwing");
  store.bag.set(INPUT_STORAGE_KEY, JSON.stringify({ preset: "nonsense", keys: { activate: [42], focusNext: ["KeyN"] } }));
  const repaired = loadBindings(store);
  check(repaired.preset === "standard" && repaired.keys.activate.includes("Enter") && repaired.keys.focusNext.join() === "KeyN",
    "an unknown preset and a malformed key list are repaired, a good one is kept");

  // A store that throws on every call (private mode, disabled storage).
  const hostile = { getItem() { throw new Error("denied"); }, setItem() { throw new Error("denied"); }, removeItem() { throw new Error("denied"); } };
  let threw = false;
  try { loadBindings(hostile); saveBindings(presetBindings("wasd"), hostile); resetBindings("wasd", hostile); } catch { threw = true; }
  check(!threw, "a storage that denies every call does not stop input working");
}

// ------------------------------------------------------------- key tokens
check(keyToken({ code: "Tab", shiftKey: true }) === "Shift+Tab", "a shifted key reads as Shift+<code>");
check(keyToken({ code: "Tab", shiftKey: false }) === "Tab", "an unshifted key reads as its code");
check(actionForKey(presetBindings("standard"), "Shift+KeyM") === "mute", "a shifted press still reaches a binding written without the prefix");
check(actionForKey(presetBindings("standard"), "Shift+Tab") === "focusPrev", "Shift+Tab reaches its own binding, not Tab's");
check(actionForKey(presetBindings("standard"), "KeyB") === null, "an unbound key resolves to nothing");
{
  const rows = describeBindings(presetBindings("wasd"));
  check(rows.length === INPUT_ACTIONS.length, "describeBindings returns one row per action");
  check(rows.every((r) => r.label && r.pretty.length && !r.unbound), "every row prints a key the panel can show");
  const remapped = describeBindings(remapAction(presetBindings("wasd"), "activate", "KeyP"));
  check(remapped.find((r) => r.action === "activate").custom === true, "a remapped row is marked as changed from the preset");
  check(remapped.find((r) => r.action === "hold").custom === false, "an untouched row is not");
}

// ----------------------------------------------------------- the gamepad
function fakePad(over = {}) {
  return {
    id: "Xbox 360 Controller (XInput STANDARD GAMEPAD)",
    mapping: "standard", connected: true, index: 0,
    buttons: Array.from({ length: 17 }, () => ({ pressed: false, value: 0, touched: false })),
    axes: [0, 0, 0, 0],
    ...over,
  };
}
function padRig({ id, xr = false } = {}) {
  const pad = fakePad(id ? { id } : {});
  const fired = [];
  let clock = 1000;
  // A fake navigator, the way a browser hands them over: an array that may
  // hold nulls for unplugged slots.
  const navigatorStub = { getGamepads: () => [null, pad] };
  const gamepad = createGamepad({
    getGamepads: () => navigatorStub.getGamepads(),
    onAction: (action, info) => fired.push({ action, ...info }),
    shouldPoll: () => !xr,
    now: () => clock,
  });
  return {
    pad, fired, gamepad,
    press: (i, v = 1) => { pad.buttons[i] = { pressed: v > 0.5, value: v }; },
    release: (i) => { pad.buttons[i] = { pressed: false, value: 0 }; },
    axis: (i, v) => { pad.axes[i] = v; },
    poll: (n = 1) => { for (let k = 0; k < n; k++) gamepad.poll(1 / 60); },
    tick: (ms) => { clock += ms; },
    of: (action) => fired.filter((f) => f.action === action),
    clear: () => { fired.length = 0; },
  };
}

{
  // Edge detection: one action per press, however many frames it is held.
  const rig = padRig();
  rig.press(15);
  rig.poll(6);
  check(rig.of("focusNext").length === 1, "a held d-pad right fires focusNext once, not once per frame",
    `focusNext fired ${rig.of("focusNext").length} times across six polls`);
  rig.release(15);
  rig.poll(3);
  check(rig.of("focusNext").length === 1, "releasing it fires nothing more");
  rig.press(15); rig.poll(1); rig.release(15); rig.poll(1);
  check(rig.of("focusNext").length === 2, "a second press fires a second time");
  rig.clear();
  rig.press(14); rig.poll(4); rig.release(14);
  check(rig.of("focusPrev").length === 1, "d-pad left walks the focus back, once per press");
  rig.clear();
  rig.press(9); rig.poll(4); rig.release(9); rig.poll(1);
  check(rig.of("controls").length === 1, "Start opens the controls panel, once per press");
  rig.clear();
  rig.press(8); rig.poll(2); rig.release(8);
  rig.press(3); rig.poll(2); rig.release(3);
  check(rig.of("back").length === 1 && rig.of("speakHint").length === 1, "Back takes the Escape path and Y speaks the hint");
}

{
  // A tap on A activates; holding A is the press/hold.
  const rig = padRig();
  rig.press(0); rig.poll(1); rig.tick(80); rig.poll(1); rig.release(0); rig.poll(1);
  check(rig.of("activate").length === 1 && !rig.of("hold").length, "a tap on A activates and never starts a hold",
    `tap produced ${JSON.stringify(rig.fired.map((f) => f.action))}`);
  rig.clear();
  rig.press(0); rig.poll(1); rig.tick(400); rig.poll(1); rig.poll(1);
  const starts = rig.of("hold").filter((f) => f.phase === "start");
  check(starts.length === 1 && !rig.of("activate").length, "holding A starts a press-and-hold once, and does not also activate");
  rig.release(0); rig.poll(1);
  const ends = rig.of("hold").filter((f) => f.phase === "end");
  check(ends.length === 1, "letting go of A ends the hold exactly once");
}

{
  // Bumpers turn while held; triggers are analogue.
  const rig = padRig();
  rig.press(4); rig.poll(1);
  check(rig.of("turnLeft").length === 1, "a bumper turns on the press");
  rig.tick(200); rig.poll(1);
  check(rig.of("turnLeft").length === 2 && rig.of("turnLeft")[1].repeat === true, "and keeps turning while held, marked as a repeat");
  rig.release(4);
  rig.clear();
  rig.press(7, 0.62); rig.poll(2);
  const up = rig.of("adjustUp");
  check(up.length === 2 && up[0].analog === true && Math.abs(up[0].value - 0.62) < 1e-6,
    "a pulled right trigger adjusts up every poll, carrying how far it is pulled");
  rig.press(7, 0.05); rig.clear(); rig.poll(2);
  check(!rig.of("adjustUp").length, "a barely-touched trigger does nothing");
  rig.press(6, 0.8); rig.clear(); rig.poll(1);
  check(rig.of("adjustDown").length === 1, "the left trigger adjusts down");
}

{
  // Sticks, and the deadzone.
  const rig = padRig();
  rig.axis(0, 0.12); rig.poll(1);
  check(!rig.of("look").length, `a stick inside the ${GAMEPAD_DEADZONE} deadzone is ignored`);
  rig.axis(0, 0.5); rig.poll(1);
  const look = rig.of("look")[0];
  const want = (0.5 - GAMEPAD_DEADZONE) / (1 - GAMEPAD_DEADZONE);
  check(look && Math.abs(look.dx - want) < 1e-9, "past the deadzone the stick orbits the view, scaled from the edge of the deadzone",
    `look dx was ${look?.dx}, expected ${want}`);
  rig.axis(0, 0); rig.axis(3, -0.9); rig.clear(); rig.poll(1);
  check(rig.of("walk").length === 1, "the right stick walks");
}

{
  // In an immersive session the pad is left alone: the XR input sources own it.
  const rig = padRig({ xr: true });
  rig.press(0); rig.press(15); rig.poll(4);
  check(!rig.fired.length, "inside an XR session the flat-mode poller produces nothing");
}

{
  // Mapping is by index; only the labels follow the vendor.
  const xbox = padRig();
  const sony = padRig({ id: "Sony Interactive Entertainment DualSense Wireless Controller (STANDARD GAMEPAD)" });
  const weird = padRig({ id: "USB,2-axis 8-button gamepad" });
  for (const rig of [xbox, sony, weird]) { rig.press(15); rig.poll(1); rig.release(15); }
  check(xbox.of("focusNext").length === 1 && sony.of("focusNext").length === 1 && weird.of("focusNext").length === 1,
    "an Xbox, a PlayStation and an unknown pad all focus the next control from index 15");
  check(xbox.gamepad.vendor === "xbox" && sony.gamepad.vendor === "playstation" && weird.gamepad.vendor === "generic",
    "each pad is labelled by its detected vendor",
    `vendors were ${xbox.gamepad.vendor}, ${sony.gamepad.vendor}, ${weird.gamepad.vendor}`);
  check(padButtonLabel(0, "xbox") === "A" && padButtonLabel(0, "playstation") === "Cross" && padButtonLabel(0, "generic") === "Bottom face",
    "index 0 prints as A, Cross or the neutral name");
  check(detectPadVendor("045E-02EA-Microsoft X-Box One S pad") === "xbox" && detectPadVendor("") === "generic",
    "the vendor sniff reads a vendor id and shrugs at an empty one");
  const snap = xbox.gamepad.snapshot();
  check(snap.connected && snap.buttons.length === 17 && snap.axes.length === 4 && snap.buttons[15].action === "focusNext",
    "the live readout the panel draws carries every button, axis and bound action");
  check(PRESET_IDS.length > 0 && PAD_LABELS.xbox.buttons.length >= 16 && PAD_LABELS.playstation.buttons.length >= 16,
    "both vendor label sets cover the standard sixteen buttons");
}

{
  // No pad plugged in, and a slot full of nulls.
  const gamepad = createGamepad({ getGamepads: () => [null, null], onAction: () => { throw new Error("fired with no pad"); } });
  let threw = false;
  try { gamepad.poll(1 / 60); } catch { threw = true; }
  check(!threw && gamepad.snapshot().connected === false, "no pad plugged in is a no-op, not a throw");
  const hostile = createGamepad({ getGamepads: () => { throw new Error("denied"); }, onAction: () => {} });
  let threw2 = false;
  try { hostile.poll(1 / 60); } catch { threw2 = true; }
  check(!threw2, "a getGamepads() that throws does not take the frame loop down");
}

// Every gamepad action has a keyboard fallback — the brief's rule, checkable.
{
  const continuous = CONTINUOUS_ACTIONS.map((c) => c.id);
  const strays = [...GAMEPAD_MAP, ...GAMEPAD_AXIS_MAP].map((b) => b.action)
    .filter((a) => !ACTION_IDS.includes(a) && !continuous.includes(a));
  check(!strays.length, "every gamepad button drives an action the keyboard also reaches",
    `gamepad actions with no keyboard binding: ${strays.join(", ")}`);
  const noNote = GAMEPAD_MAP.filter((b) => !b.note);
  check(!noNote.length, "every gamepad binding explains itself in the panel", `bindings with no note: ${noNote.map((b) => b.index).join(", ")}`);
  const dupIdx = GAMEPAD_MAP.map((b) => b.index).filter((i, k, a) => a.indexOf(i) !== k);
  check(!dupIdx.length, "no button index is mapped twice", `indices mapped twice: ${dupIdx.join(", ")}`);
  check(CONTINUOUS_ACTIONS.every((c) => c.fallback), "look and walk both name their pointer/keyboard fallback");
  const rows = describeGamepadMap("xbox");
  check(rows.length === GAMEPAD_MAP.length + GAMEPAD_AXIS_MAP.length && rows.some((r) => r.mode === "axis"),
    "the docs/panel table covers every button and both sticks");
}

// --------------------------------------------------------- the voice grammar
{
  const types = VOICE_GRAMMAR.map((g) => g.type);
  const dupes = types.filter((t, i) => types.indexOf(t) !== i);
  check(!dupes.length, `${VOICE_GRAMMAR.length} voice commands, each named once`, `duplicate command types: ${dupes.join(", ")}`);
  check(VOICE_GRAMMAR.every((g) => g.phrases?.length && g.what && g.re instanceof RegExp),
    "every command lists an example phrase, a description and a pattern");

  // Every phrase the panel prints must parse to its own command — the one way
  // an entry can be listed and unreachable is if an earlier one shadows it.
  let shadowed = 0;
  for (const entry of VOICE_GRAMMAR) {
    for (const phrase of entry.phrases) {
      const got = parseVoice(phrase, { menu: [{ id: "a" }, { id: "b" }, { id: "c" }, { id: "d" }, { id: "e" }, { id: "f" }, { id: "g" }] });
      if (got.type !== entry.type) { shadowed += 1; bad(`"${phrase}" parses as ${got.type}, not ${entry.type}`); }
    }
  }
  if (!shadowed) ok(`all ${VOICE_GRAMMAR.reduce((n, g) => n + g.phrases.length, 0)} listed phrases parse as the command they are listed under`);

  // The commands this task added, by hand, with what they should carry.
  const menu = [
    { index: 1, label: "Start guided tour", id: "start-tour" },
    { index: 2, label: "Free explore", id: "enter-flat" },
    { index: 3, label: "Training records", id: "view-records" },
    { index: 4, label: "Leaderboards", id: "view-leaderboard" },
  ];
  const item = parseVoice("select item 3", { menu });
  check(item.type === "selectItem" && item.index === 3 && item.item?.id === "view-records",
    '"select item 3" resolves to the third item of the numbered menu',
    `got ${JSON.stringify(item)}`);
  check(parseVoice("item three", { menu }).item?.id === "view-records", "a spoken number word resolves the same item");
  check(parseVoice("select item 9", { menu }).item === null, "an item past the end of the menu resolves to nothing rather than wrapping");
  check(parseVoice("select the isolation valve", { menu }).type !== "selectItem",
    '"select the isolation valve" is not read as an item number');
  check(resolveMenuItem(2, menu)?.id === "enter-flat" && resolveMenuItem(0, menu) === null && resolveMenuItem(2, []) === null,
    "the menu resolver is 1-based and refuses anything out of range");

  check(parseVoice("next").type === "next" && parseVoice("previous").type === "previous",
    '"next" and "previous" walk the focus');
  check(parseVoice("what next").type === "hint", '"what next" is still a hint, not "next"');
  check(parseVoice("focus the tag bag").name === "tag bag", '"focus <name>" carries the control name');
  check(parseVoice("where is the gas detector").type === "whereIs" && parseVoice("where is the gas detector").name === "gas detector",
    '"where is <name>" carries the control name');
  check(parseVoice("read step").type === "readStep" && parseVoice("repeat").type === "repeat",
    '"read step" and "repeat" are separate commands');
  check(parseVoice("mute").type === "mute" && parseVoice("unmute").type === "unmute",
    '"mute" and "unmute" do not shadow one another');
  check(parseVoice("bigger").type === "bigger" && parseVoice("smaller").type === "smaller", '"bigger" and "smaller" scale the view');
  check(parseVoice("controls").type === "controls", '"controls" opens the panel');
  check(parseVoice("check in").type === "checkIn" && parseVoice("need a minute").answer === "minute",
    '"check in" opens the check-in and its answers parse');
  check(Object.keys(CHECKIN_REPLIES).length === 3, "the check-in has a reply for each of its three answers");
  check(parseVoice("show numbers").on === true && parseVoice("hide numbers").on === false,
    '"show numbers" and "hide numbers" toggle the index badges');
  check(parseVoice("").type === "unknown" && parseVoice(null).type === "unknown" && parseVoice("mumble mumble").type === "unknown",
    "an empty or unrecognised phrase is unknown rather than a throw");

  // The commands the app has always had still work, so voice does not regress.
  for (const [phrase, type] of [["hub", "hub"], ["campus", "hub"], ["leaderboards", "leaderboard"],
    ["training records", "records"], ["programmes", "programs"], ["tour", "tour"], ["scenario editor", "editor"],
    ["reset", "reset"], ["help", "help"], ["hint", "hint"], ["brief", "brief"], ["status", "status"]]) {
    const got = parseVoice(phrase).type;
    if (got !== type) bad(`the existing command "${phrase}" now parses as ${got}, not ${type}`);
  }
  ok("the twelve commands the app already had parse as they did before");

  // The rule that never bends: no voice command completes a step.
  const forbidden = ["select", "activate", "press", "drag", "drop", "turn", "complete", "done", "finish"];
  const offenders = VOICE_GRAMMAR.filter((g) => forbidden.includes(g.type));
  check(!offenders.length, "no voice command is a select/press/drag/turn — hands do the work",
    `voice commands that would complete a step: ${offenders.map((g) => g.type).join(", ")}`);
  check(VOICE_GRAMMAR.find((g) => g.type === "focus").what.toLowerCase().includes("never takes it"),
    "the focus command says in the panel that it does not take the control");
  for (const word of ["next", "previous", "focus", "where is", "read step", "repeat", "mute", "unmute",
    "bigger", "smaller", "controls", "check in", "select item"]) {
    if (!VOICE_HELP_LINE.toLowerCase().includes(word)) bad(`the spoken help line never mentions "${word}"`);
  }
  ok("the spoken help line names every command this layer added");
}

{
  // Naming a control by voice against the step's own item names.
  const targets = [{ id: "valve-a", name: "isolation valve" }, { id: "valve-b", name: "valve" }, { id: "gauge", name: "pressure gauge" }];
  check(matchTargetName("isolation valve", targets)?.id === "valve-a", "a spoken name matches the control exactly");
  check(matchTargetName("the Isolation Valve.", targets)?.id === "valve-a", "punctuation and case do not matter");
  check(matchTargetName("pressure", targets)?.id === "gauge", "a partial name still finds the control");
  check(matchTargetName("nothing like it", targets) === null, "an unmatched name resolves to nothing");
  check(matchTargetName("valve", targets)?.id === "valve-b", "an exact short name is not shadowed by a longer one");
}

// -------------------------------------------- which tabs a device is offered
{
  const desktop = describeInputs({ id: "desktop", profile: "desktop", input: ["mouse", "touch"] }, PROFILES.desktop);
  check(desktop.tabs[0] === "keyboard" && desktop.tabs.includes("gamepad") && desktop.source === "profile",
    "a desktop falls back to the profile and leads with the keyboard tab");
  const assisted = describeInputs(DEVICES["realwear-navigator-520"], { ...PROFILES.assisted, id: "assisted" });
  check(assisted.tabs[0] === "voice" && !assisted.tabs.includes("gamepad") && assisted.voiceFirst,
    "a voice-first monocular leads with voice and is offered no gamepad tab",
    `assisted tabs: ${assisted.tabs.join(", ")}`);
  const hololens = describeInputs(DEVICES["hololens-2"], { ...PROFILES.mr, id: "mr" });
  check(hololens.hands && hololens.tabs[0] === "voice", "a hands-only headset is marked as hands and leads with voice");
  const quest = describeInputs(DEVICES["meta-quest"], { ...PROFILES.vr, id: "vr" });
  check(quest.tabs[0] === "gamepad" && quest.controllers, "a controller headset leads with the gamepad tab");
  // An `input` object on a DEVICES entry wins over the profile.
  const declared = describeInputs({ profile: "desktop", input: { primary: "voice", voiceFirst: true, controllers: false, hands: false, keyboard: true } }, PROFILES.desktop);
  check(declared.source === "device" && declared.tabs.join() === "voice,keyboard",
    "a device that declares its own input object orders and hides the tabs itself",
    `declared tabs: ${declared.tabs.join(", ")} from ${declared.source}`);
  const noKeyboard = describeInputs({ input: { primary: "voice", voiceFirst: true, controllers: false, keyboard: false } }, PROFILES.assisted);
  check(noKeyboard.tabs.join() === "voice", "a device with no keyboard is not shown a keyboard tab");
  check(Object.values(PROFILES).every((p) => describeInputs(null, { ...p, id: p.prefer === "vr" ? "vr" : "desktop" }).tabs.length > 0),
    "every run profile resolves to at least one tab");
}

console.log("");
if (failures) {
  console.log(`${failures} input check(s) failed.`);
  process.exit(1);
}
console.log(`All input checks pass: ${PRESET_IDS.length} keyboard presets × ${ACTION_IDS.length} actions, `
  + `${GAMEPAD_MAP.length} gamepad buttons + ${GAMEPAD_AXIS_MAP.length} sticks by index with ${Object.keys(PAD_LABELS).length} vendor label sets, `
  + `${VOICE_GRAMMAR.length} voice commands, none of which completes a step.`);
