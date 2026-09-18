/**
 * Headless checks for the accessibility layer (WebXR/shared/a11y.js) and for
 * the content contract a keyboard or screen-reader learner depends on.
 *
 * The module checks are about the plumbing: a live region that a screen
 * reader actually reads, a cursor that walks a step's controls in procedure
 * order, and a spoken description that says what a control is and how to work
 * it from the keyboard. The content checks are about whether that plumbing
 * has anything to say — a step with no cue, or a multi-target step whose
 * items have no readable names, is a step a learner cannot do without seeing
 * the screen, so it fails the build.
 *
 *     node tools/check_a11y.mjs
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";
let failed = 0;
const check = async (name, fn) => { try { await fn(); console.log(`  ✓ ${name}`); } catch (e) { failed += 1; console.log(`  ✗ ${name}\n      ${e.message}`); } };
const assert = (c, m) => { if (!c) throw new Error(m); };

// A DOM stand-in just big enough for the live region.
const nodes = [];
globalThis.document = {
  body: { appendChild: (n) => nodes.push(n) },
  createElement: () => ({ style: {}, textContent: "", attrs: {}, setAttribute(k, v) { this.attrs[k] = v; } }),
};
globalThis.window = { matchMedia: (q) => ({ matches: q.includes("reduce") && window.__reduce === true }) };

const { reducedMotion, createAnnouncer, createTargetCursor, describeTarget } = await import("../WebXR/shared/a11y.js");
const { ROOT, loadSmartCity, loadTrades } = await import("./lib/headless.mjs");

await check("the live region is a clipped status region a screen reader reads", () => {
  const a = createAnnouncer();
  assert(nodes.length === 2, `expected a polite and an assertive region, got ${nodes.length}`);
  const [polite, urgent] = nodes;
  assert(polite.attrs["aria-live"] === "polite" && polite.attrs.role === "status", "the polite region is a live status region");
  assert(urgent.attrs["aria-live"] === "assertive" && urgent.attrs.role === "alert", "the urgent region is an alert");
  assert(polite.attrs["aria-atomic"] === "true", "atomic, so a partial change is not read as a fragment");
  // Clipped, not display:none — a hidden region is skipped entirely.
  assert(polite.style.position === "absolute" && polite.style.clipPath === "inset(50%)", "clipped rather than hidden");
  assert(polite.style.display !== "none" && polite.style.visibility !== "hidden", "never display:none or visibility:hidden");
  a.say("Step 1 of 9. Pull the permit.");
  assert(polite.textContent.startsWith("Step 1 of 9."), "polite text lands in the polite region");
  a.alert("You entered without testing.");
  assert(urgent.textContent.startsWith("You entered"), "an alert lands in the assertive region");
});

await check("markup is stripped and a repeat is nudged so it is read again", () => {
  const a = createAnnouncer();
  const region = nodes[nodes.length - 2];
  a.say("<b>Isolate</b> the line");
  assert(!region.textContent.includes("<"), `markup should be stripped, got ${region.textContent}`);
  assert(region.textContent === "Isolate the line", region.textContent);
  a.alert("same");
  const urgent = nodes[nodes.length - 1];
  const first = urgent.textContent;
  a.alert("same");
  assert(urgent.textContent !== first, "an identical alert is nudged so it is announced again");
});

await check("the same sentence is not announced politely twice in a row", () => {
  const a = createAnnouncer();
  assert(a.say("one") === true, "first says");
  assert(a.say("one") === false, "a repeat is dropped");
  assert(a.say("two") === true, "a change says");
});

await check("the cursor walks a step's controls and keeps its place", () => {
  const c = createTargetCursor();
  assert(c.current === null && c.index === -1, "empty to begin with");
  c.set(["a", "b", "c"]);
  assert(c.current === "a", "lands on the first");
  assert(c.next() === "b" && c.next() === "c" && c.next() === "a", "forward wraps");
  assert(c.prev() === "c", "backward wraps");
  c.focus("b");
  assert(c.current === "b", "focus moves the cursor");
  c.set(["x", "b", "y"]);
  assert(c.current === "b", "an id that survives a list change keeps focus");
  c.set(["p", "q"]);
  assert(c.current === "p", "otherwise it resets to the first");
  c.clear();
  assert(c.current === null, "clear empties it");
});

await check("every step kind says how to work it from the keyboard", () => {
  const kinds = ["select", "sequence", "find", "gauge", "turn", "hold", "track", "drag"];
  for (const kind of kinds) {
    const text = describeTarget("valve-wheel", { kind, target: "valve-wheel" }, { position: [2, 5] });
    assert(text.startsWith("valve wheel."), `${kind}: the id is read as words, got ${text}`);
    assert(text.includes("2 of 5"), `${kind}: says where in the list it is`);
    assert(/Enter|space bar|arrows/i.test(text), `${kind}: names a key, got ${text}`);
  }
  const named = describeTarget("t1", { kind: "sequence", targets: ["t1"] }, { names: { t1: "gross decon pool" } });
  assert(named.startsWith("gross decon pool."), `an item name is used when the step has one, got ${named}`);
  const off = describeTarget("other", { kind: "select", target: "t1" });
  assert(off.includes("Not part of this step"), "a control outside the step says so");
});

await check("reduced motion follows the system setting", () => {
  window.__reduce = false;
  assert(reducedMotion() === false, "off by default");
  window.__reduce = true;
  assert(reducedMotion() === true, "on when the system asks for it");
  window.__reduce = false;
});

// ---- the content contract: can a learner who cannot see the screen do this?
const city = await loadSmartCity();
const trades = await loadTrades();
const all = [...city.ROOMS, ...trades.ROOMS];

await check("every step states what to do and why, in words", () => {
  const thin = [];
  for (const r of all) for (const st of r.steps) {
    if (!st.title || st.title.length < 4) thin.push(`${r.id}/${st.id}: no title`);
    if (!st.cue || st.cue.length < 12) thin.push(`${r.id}/${st.id}: no usable cue`);
    if (!st.why || st.why.length < 20) thin.push(`${r.id}/${st.id}: no rationale`);
  }
  assert(thin.length === 0, thin.slice(0, 6).join("; "));
});

await check("every multi-target step names its items in words", () => {
  const unnamed = [];
  for (const r of all) for (const st of r.steps) {
    if (st.kind !== "sequence" && st.kind !== "find") continue;
    for (const id of st.targets ?? []) {
      const name = st.itemNames?.[id] ?? st.itemNotes?.[id];
      if (!name) unnamed.push(`${r.id}/${st.id}/${id}`);
    }
  }
  assert(unnamed.length === 0, `${unnamed.length} unnamed items, e.g. ${unnamed.slice(0, 5).join(", ")}`);
});

await check("every graded control reads its value out as text, not colour alone", () => {
  const silent = [];
  for (const r of all) for (const st of r.steps) {
    if (st.kind === "gauge" && typeof st.gauge?.readout !== "function") silent.push(`${r.id}/${st.id} gauge`);
    if (st.kind === "track" && typeof st.track?.readout !== "function") silent.push(`${r.id}/${st.id} track`);
  }
  assert(silent.length === 0, `${silent.length} controls with no text readout: ${silent.slice(0, 5).join(", ")}`);
});

await check("every hazard explains itself in a full sentence", () => {
  const thin = [];
  for (const r of all) for (const [id, text] of Object.entries(r.hazards ?? {})) {
    if (!text || text.length < 40) thin.push(`${r.id}/${id}`);
  }
  assert(thin.length === 0, thin.slice(0, 5).join(", "));
});

await check("all three simulators ship the keyboard path and a live region", () => {
  for (const app of ["smartcity", "trades"]) {
    const html = readFileSync(join(ROOT, "WebXR", app, "index.html"), "utf8");
    assert(html.includes("prefers-reduced-motion"), `${app}/index.html has no reduced-motion rules`);
  }
  // The statement claims all three simulators, so all three are checked.
  for (const app of ["smartcity", "trades", "holodeck"]) {
    const src = readFileSync(join(ROOT, "WebXR", app, "js", "app.js"), "utf8");
    for (const key of ["Tab", "Enter", "Space", "ArrowUp", "ArrowDown"]) {
      assert(src.includes(`"${key}"`), `${app}: the keyboard path does not handle ${key}`);
    }
    assert(src.includes("createAnnouncer"), `${app}: never creates a live region`);
    assert(src.includes("createTargetCursor"), `${app}: never walks a step's controls`);
    assert(src.includes("describeTarget"), `${app}: never describes the focused control`);
  }
  const city = readFileSync(join(ROOT, "WebXR", "smartcity", "js", "app.js"), "utf8");
  assert(city.includes("reducedMotion"), "smartcity never checks reduced motion");
  const stmt = readFileSync(join(ROOT, "WebXR", "ACCESSIBILITY.md"), "utf8");
  assert(stmt.length > 1500, "the conformance statement is too short to be one");
  for (const heading of ["WCAG", "keyboard", "screen reader", "not conform"]) {
    assert(stmt.toLowerCase().includes(heading.toLowerCase()), `the statement never mentions ${heading}`);
  }
});

console.log(failed ? `\n${failed} accessibility check(s) failed.` : "\nAll accessibility checks pass.");
process.exit(failed ? 1 : 0);
